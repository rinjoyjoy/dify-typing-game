/* 研究者用ページ：主要な統計分析（検定＋グラフ）
   - 群：A＝AI対話、B＝アンケート、C＝診断なし（コード上の記号。中間発表スライドとは逆）
   - 小標本（各群10名程度）なので、2群比較は「並べ替え（正確）検定によるMann-Whitney U」、3群比較はKruskal-Wallis、
     多重比較はHolm法で補正。効果量は r（Mann-Whitney）と ε²（Kruskal-Wallis）
   - グラフは、1人＝1点のドットプロット＋中央値の縦線（人数が少ないので箱ひげより実データを見せる） */
(function () {
  'use strict';

  const GROUPS = [
    { id: 'A', label: 'AI対話' },
    { id: 'B', label: 'アンケート' },
    { id: 'C', label: '診断なし' },
  ];
  const LABEL = { A: 'AI対話', B: 'アンケート', C: '診断なし' };
  const TYPE_JA = { achiever: '達成者', player: 'プレイヤー', socialiser: '社交家', freeSpirit: '自由主義者', philanthropist: '慈善家', disruptor: '変革者' };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v))) ? null : Number(v);
  const vals = (rows, key) => rows.map((r) => num(r[key])).filter((v) => v !== null);

  /* ---------------- 記述統計 ---------------- */
  function median(a) {
    if (!a.length) return null;
    const s = a.slice().sort((x, y) => x - y);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }
  function sd(a) {
    if (a.length < 2) return null;
    const m = mean(a);
    return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
  }
  function fmt(v, d = 2) { return v === null || v === undefined || !Number.isFinite(v) ? '—' : (Math.round(v * 10 ** d) / 10 ** d).toFixed(d); }
  // 「p = .046」「p < .001」の形にする
  function pEq(p) { const f = fmtP(p); return f.startsWith('<') ? `p ${f}` : `p = ${f}`; }
  function fmtP(p) {
    if (p === null || p === undefined || !Number.isFinite(p)) return '—';
    return p < 0.001 ? '< .001' : p.toFixed(3).replace(/^0/, '');
  }

  /* ---------------- 検定 ---------------- */
  // 平均順位（同順位は平均）
  function rankAll(values) {
    const idx = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const r = new Array(values.length);
    for (let k = 0; k < idx.length;) {
      let j = k;
      while (j + 1 < idx.length && idx[j + 1].v === idx[k].v) j++;
      const avg = (k + j) / 2 + 1;
      for (let m = k; m <= j; m++) r[idx[m].i] = avg;
      k = j + 1;
    }
    return r;
  }

  // Mann-Whitney U：正確な並べ替え検定（同順位があっても正確）。順位和の分布を動的計画法で数え上げる
  function mannWhitney(x, y) {
    const n1 = x.length, n2 = y.length, N = n1 + n2;
    if (n1 < 2 || n2 < 2) return null;
    const ranks = rankAll([...x, ...y]);
    const r2 = ranks.map((r) => Math.round(r * 2)); // 半整数の順位を整数に
    const R1 = r2.slice(0, n1).reduce((a, b) => a + b, 0);
    const total = r2.reduce((a, b) => a + b, 0);
    const maxSum = total;
    // dp[k][s]：k個選んで順位和(×2)が s になる組み合わせ数
    let dp = Array.from({ length: n1 + 1 }, () => new Float64Array(maxSum + 1));
    dp[0][0] = 1;
    for (const rv of r2) {
      for (let k = Math.min(n1, N); k >= 1; k--) {
        const prev = dp[k - 1], cur = dp[k];
        for (let s = maxSum; s >= rv; s--) if (prev[s - rv]) cur[s] += prev[s - rv];
      }
    }
    const dist = dp[n1];
    let all = 0; for (let s = 0; s <= maxSum; s++) all += dist[s];
    const E = (n1 * (N + 1)); // 順位和の期待値×2
    const obs = Math.abs(R1 - E);
    let tail = 0;
    for (let s = 0; s <= maxSum; s++) if (dist[s] && Math.abs(s - E) >= obs - 1e-9) tail += dist[s];
    const p = Math.min(1, tail / all);
    const U1 = R1 / 2 - (n1 * (n1 + 1)) / 2;
    // 効果量 r：同順位補正つき正規近似の z から
    const tieCounts = {}; ranks.forEach((r) => { tieCounts[r] = (tieCounts[r] || 0) + 1; });
    const tieTerm = Object.values(tieCounts).reduce((s, t) => s + (t ** 3 - t), 0);
    const varU = (n1 * n2 / 12) * ((N + 1) - tieTerm / (N * (N - 1)));
    const z = varU > 0 ? (U1 - n1 * n2 / 2) / Math.sqrt(varU) : 0;
    return { U: U1, p, z, r: Math.abs(z) / Math.sqrt(N), n1, n2 };
  }

  // カイ二乗分布の上側確率（正則化不完全ガンマ関数）
  function gammaln(z) {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - gammaln(1 - z);
    z -= 1; let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function gammaincc(a, x) {
    if (x <= 0) return 1;
    if (x < a + 1) { // 級数
      let sum = 1 / a, term = sum;
      for (let n = 1; n < 500; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-14) break; }
      return 1 - sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
    }
    let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d; // 連分数
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break;
    }
    return Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
  }
  const chi2sf = (x, df) => gammaincc(df / 2, x / 2);

  // Kruskal-Wallis（同順位補正つき）
  function kruskal(groups) {
    const gs = groups.filter((g) => g.length >= 1);
    if (gs.length < 2) return null;
    const all = gs.flat(); const N = all.length;
    if (N < 4) return null;
    const ranks = rankAll(all);
    let off = 0, H = 0;
    gs.forEach((g) => { const R = ranks.slice(off, off + g.length).reduce((a, b) => a + b, 0); H += R * R / g.length; off += g.length; });
    H = 12 / (N * (N + 1)) * H - 3 * (N + 1);
    const tieCounts = {}; ranks.forEach((r) => { tieCounts[r] = (tieCounts[r] || 0) + 1; });
    const C = 1 - Object.values(tieCounts).reduce((s, t) => s + (t ** 3 - t), 0) / (N ** 3 - N);
    if (C > 0) H /= C;
    const df = gs.length - 1;
    return { H, df, p: chi2sf(H, df), eps2: H / (N - 1), N };
  }

  function holm(ps) {
    const order = ps.map((p, i) => ({ p, i })).filter((o) => Number.isFinite(o.p)).sort((a, b) => a.p - b.p);
    const adj = ps.map(() => null); let running = 0;
    order.forEach((o, k) => { running = Math.max(running, Math.min(1, o.p * (order.length - k))); adj[o.i] = running; });
    return adj;
  }

  function lchoose(n, k) { return gammaln(n + 1) - gammaln(k + 1) - gammaln(n - k + 1); }
  // 二項検定（片側：偶然の確率 p0 より多いか）
  function binomGreater(k, n, p0) {
    if (!n) return null;
    let s = 0;
    for (let i = k; i <= n; i++) s += Math.exp(lchoose(n, i) + i * Math.log(p0) + (n - i) * Math.log(1 - p0));
    return Math.min(1, s);
  }

  /* ---------------- グラフ（SVG） ---------------- */
  const W = 660, PADL = 96, PADR = 140, ROWH = 46, TOP = 22, BOTTOM = 30, LGAP = 18;

  function niceTicks(lo, hi, count = 5) {
    const span = hi - lo || 1;
    const step0 = span / count; const mag = 10 ** Math.floor(Math.log10(step0));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || mag * 10;
    const ticks = []; for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(Math.round(t * 1000) / 1000);
    return ticks;
  }

  // 1人＝1点のドットプロット（行＝群）。中央値を縦線で示し、右端に中央値と人数を書く
  function dotPlot(series, opt) {
    const rows = series.filter((s) => s.values.length || opt.showEmpty);
    if (!rows.length) return '<p class="hint">まだデータがありません。</p>';
    const all = rows.flatMap((s) => s.values);
    let lo = opt.min ?? Math.min(...all), hi = opt.max ?? Math.max(...all);
    if (lo === hi) { lo -= 1; hi += 1; }
    const ticks = opt.ticks || niceTicks(lo, hi);
    // 軸の端を目盛りにそろえ、点が軸からはみ出さないようにする
    if (!opt.ticks) {
      const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
      if (ticks[ticks.length - 1] < hi) ticks.push(Math.round((ticks[ticks.length - 1] + step) * 1000) / 1000);
      if (ticks[0] > lo) ticks.unshift(Math.round((ticks[0] - step) * 1000) / 1000);
      lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
    }
    const H = TOP + rows.length * ROWH + BOTTOM;
    const x = (v) => PADL + ((v - lo) / (hi - lo)) * (W - PADL - PADR);
    let svg = `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.title || '')}">`;
    ticks.forEach((t) => {
      svg += `<line x1="${x(t)}" x2="${x(t)}" y1="${TOP - 6}" y2="${H - BOTTOM}" class="grid"/>`;
      svg += `<text x="${x(t)}" y="${H - BOTTOM + 18}" class="tick" text-anchor="middle">${esc(opt.tickFmt ? opt.tickFmt(t) : t)}</text>`;
    });
    if (opt.unit) svg += `<text x="${W - PADR + LGAP}" y="${H - BOTTOM + 18}" class="tick">${esc(opt.unit)}</text>`;
    rows.forEach((s, ri) => {
      const cy = TOP + ri * ROWH + ROWH / 2;
      svg += `<line x1="${PADL}" x2="${W - PADR}" y1="${cy}" y2="${cy}" class="row"/>`;
      svg += `<circle cx="${PADL - 82}" cy="${cy}" r="5" class="dot g-${s.id}"/>`;
      svg += `<text x="${PADL - 72}" y="${cy + 4}" class="rowlabel">${esc(s.label)}</text>`;
      // 同じ値が重なるので、値ごとに上下へずらす
      const seen = {};
      s.values.forEach((v) => {
        const k = String(v); const n = (seen[k] = (seen[k] || 0) + 1) - 1;
        const dy = n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.ceil(n / 2) * 7;
        svg += `<circle cx="${x(v)}" cy="${cy + Math.max(-16, Math.min(16, dy))}" r="5" class="dot g-${s.id}"><title>${esc(s.label)}：${esc(opt.valFmt ? opt.valFmt(v) : v)}</title></circle>`;
      });
      const md = median(s.values);
      if (md !== null) {
        svg += `<line x1="${x(md)}" x2="${x(md)}" y1="${cy - 18}" y2="${cy + 18}" class="median"><title>中央値 ${esc(opt.valFmt ? opt.valFmt(md) : fmt(md))}</title></line>`;
        svg += `<text x="${W - PADR + LGAP}" y="${cy + 4}" class="vlabel">中央値 ${esc(opt.valFmt ? opt.valFmt(md) : fmt(md))}<tspan class="muted">（${s.values.length}人）</tspan></text>`;
      } else {
        svg += `<text x="${W - PADR + LGAP}" y="${cy + 4}" class="vlabel muted">データなし</text>`;
      }
    });
    svg += '</svg>';
    return svg;
  }

  // 割合の横棒（偶然の確率を縦線で示す）
  function rateBars(items, opt) {
    const PADL = 170; // 項目名が長いので左を広くとる
    const H = TOP + items.length * ROWH + BOTTOM;
    const x = (v) => PADL + v * (W - PADL - PADR);
    let svg = `<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.title || '')}">`;
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      svg += `<line x1="${x(t)}" x2="${x(t)}" y1="${TOP - 6}" y2="${H - BOTTOM}" class="grid"/>`;
      svg += `<text x="${x(t)}" y="${H - BOTTOM + 18}" class="tick" text-anchor="middle">${Math.round(t * 100)}%</text>`;
    });
    items.forEach((it, i) => {
      const cy = TOP + i * ROWH + ROWH / 2;
      svg += `<text x="${PADL - 8}" y="${cy + 4}" class="rowlabel" text-anchor="end">${esc(it.label)}</text>`;
      if (it.n) {
        const w = Math.max(0, x(it.rate) - PADL);
        const h = 20, r = Math.min(4, w);
        // 基準側は角なし、先端だけ角丸
        svg += `<path d="M${PADL},${cy - h / 2} h${Math.max(0, w - r)} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${Math.max(0, w - r)} z" class="bar g-${it.group}"><title>${esc(it.label)}：${Math.round(it.rate * 100)}%（${it.k}/${it.n}人）</title></path>`;
        svg += `<text x="${W - PADR + LGAP}" y="${cy + 4}" class="vlabel">${Math.round(it.rate * 100)}%<tspan class="muted">（${it.k}/${it.n}人）</tspan></text>`;
      } else {
        svg += `<text x="${W - PADR + LGAP}" y="${cy + 4}" class="vlabel muted">データなし</text>`;
      }
      if (it.chance !== undefined) {
        svg += `<line x1="${x(it.chance)}" x2="${x(it.chance)}" y1="${cy - 16}" y2="${cy + 16}" class="chance"><title>偶然に当たる確率 ${Math.round(it.chance * 100)}%</title></line>`;
      }
    });
    svg += '</svg>';
    return svg;
  }

  function legendHtml(ids) {
    return `<div class="viz-legend">${ids.map((g) => `<span><i class="sw g-${g}"></i>${LABEL[g]}</span>`).join('')}<span><i class="sw-median"></i>中央値</span></div>`;
  }

  function descTable(series, valFmt) {
    return `<table class="tbl stat"><thead><tr><th>群</th><th>人数</th><th>中央値</th><th>平均</th><th>標準偏差</th><th>最小〜最大</th></tr></thead><tbody>${series.map((s) => {
      const v = s.values; const f = valFmt || ((x) => fmt(x));
      return `<tr><td>${esc(s.label)}</td><td class="num">${v.length}</td><td class="num">${v.length ? f(median(v)) : '—'}</td><td class="num">${v.length ? f(mean(v)) : '—'}</td><td class="num">${v.length > 1 ? f(sd(v)) : '—'}</td><td class="num">${v.length ? `${f(Math.min(...v))}〜${f(Math.max(...v))}` : '—'}</td></tr>`;
    }).join('')}</tbody></table>`;
  }

  function pairwiseTable(series, pairs, opts = {}) {
    const res = pairs.map(([a, b]) => {
      const A = series.find((s) => s.id === a), B = series.find((s) => s.id === b);
      return { a: A, b: B, t: mannWhitney(A.values, B.values) };
    });
    const adj = opts.noHolm ? res.map((r) => (r.t ? r.t.p : null)) : holm(res.map((r) => (r.t ? r.t.p : NaN)));
    return {
      res, adj,
      html: `<table class="tbl stat"><thead><tr><th>比較</th><th>U</th><th>p${opts.noHolm ? '' : '（Holm補正）'}</th><th>効果量 r</th><th>判定</th></tr></thead><tbody>${res.map((r, i) => {
        if (!r.t) return `<tr><td>${esc(r.a.label)} × ${esc(r.b.label)}</td><td colspan="4" class="muted">各群2人以上で計算します</td></tr>`;
        const sig = adj[i] < 0.05;
        return `<tr><td>${esc(r.a.label)} × ${esc(r.b.label)}</td><td class="num">${fmt(r.t.U, 1)}</td><td class="num">${fmtP(adj[i])}</td><td class="num">${fmt(r.t.r)}（${effectWord(r.t.r)}）</td><td>${sig ? '<span class="badge ok">差あり</span>' : '<span class="badge">差は不明確</span>'}</td></tr>`;
      }).join('')}</tbody></table>`,
    };
  }
  function effectWord(r) { return r >= 0.5 ? '大' : r >= 0.3 ? '中' : r >= 0.1 ? '小' : 'ごく小'; }

  function kwLine(series) {
    const k = kruskal(series.map((s) => s.values));
    if (!k) return '<p class="hint">3群の比較（Kruskal-Wallis検定）は、データが集まると表示されます。</p>';
    return `<p class="stat-line">3群の比較（Kruskal-Wallis検定）：H(${k.df}) = ${fmt(k.H)}、${pEq(k.p)}、ε² = ${fmt(k.eps2)}（N = ${k.N}）</p>`;
  }

  // 2群の比較を一文にする
  function sentence(series, a, b, lowerIsBetter, word, t, pAdj, vf) {
    const f = vf || ((v) => fmt(v));
    const A = series.find((s) => s.id === a), B = series.find((s) => s.id === b);
    if (!t) return `${word}を比べるには、${A.label}群と${B.label}群にそれぞれ2人以上の回答が必要です。`;
    const ma = median(A.values), mb = median(B.values);
    const p = pAdj ?? t.p;
    const dir = ma === mb ? '同じ' : ((ma < mb) === lowerIsBetter ? '良い' : '悪い');
    const cmp = ma < mb ? '低く' : ma > mb ? '高く' : '同じに';
    if (p < 0.05) return `${A.label}群の${word}（中央値 ${f(ma)}）は、${B.label}群（${f(mb)}）より${cmp}、統計的に差がありました（${pEq(p)}、r = ${fmt(t.r)}）。`;
    if (ma === mb) return `${A.label}群と${B.label}群の${word}の中央値は同じ（${f(ma)}）で、統計的な差ははっきりしません（${pEq(p)}、r = ${fmt(t.r)}）。`;
    return `${A.label}群の${word}（中央値 ${f(ma)}）は${B.label}群（${f(mb)}）より${cmp}なっていますが、統計的な差ははっきりしません（${pEq(p)}、r = ${fmt(t.r)}）。${dir === '良い' ? '仮説の方向とは一致しています。' : ''}`;
  }

  /* ---------------- 分析カード ----------------
     各カード：見出し・結果の一文・グラフは常に表示し、検定表と記述統計は「詳しい数値」に折りたたむ。
     status は「まとめ」タブの印に使う（sig＝差あり／ns＝差は不明確／info＝記述のみ／wait＝データ待ち） */
  function mkCard(id, title, lead, chart, detail, status) { return { id, title, lead, chart, detail, status }; }
  function statusFromP(t, p) { return !t ? 'wait' : (p < 0.05 ? 'sig' : 'ns'); }

  function seriesOf(rows, key, ids = ['A', 'B', 'C']) {
    return ids.map((id) => ({ id, label: LABEL[id], values: vals(rows.filter((r) => r.group === id), key) }));
  }

  function likertCard(id, rows, key, title, word, pairs, lowerIsBetter, mainPair, note) {
    const series = seriesOf(rows, key);
    const pw = pairwiseTable(series, pairs);
    const mi = pairs.findIndex((p) => p[0] === mainPair[0] && p[1] === mainPair[1]);
    const t = pw.res[mi].t, p = pw.adj[mi];
    const lead = sentence(series, mainPair[0], mainPair[1], lowerIsBetter, word, t, p);
    return mkCard(id, title, lead,
      legendHtml(['A', 'B', 'C']) + dotPlot(series, { min: 1, max: 5, ticks: [1, 2, 3, 4, 5], title }) + kwLine(series) + (note ? `<p class="hint">${note}</p>` : ''),
      pw.html + descTable(series), statusFromP(t, p));
  }

  function secCard(id, rows, key, ids, title, word, lowerIsBetter, note) {
    const series = seriesOf(rows, key, ids);
    const pairs = ids.length === 3 ? [['A', 'B'], ['A', 'C'], ['B', 'C']] : [['A', 'B']];
    const pw = pairwiseTable(series, pairs, { noHolm: ids.length < 3 });
    const fsec = (v) => `${Math.round(v)}秒`;
    const t = pw.res[0].t, p = pw.adj[0];
    const lead = sentence(series, 'A', 'B', lowerIsBetter, word, t, p, fsec);
    return mkCard(id, title, lead,
      legendHtml(ids) + dotPlot(series, { min: 0, unit: '秒', valFmt: fsec, title }) + (ids.length === 3 ? kwLine(series) : '') + (note ? `<p class="hint">${note}</p>` : ''),
      pw.html + descTable(series, fsec), statusFromP(t, p));
  }

  function buildSections(rows) {
    const pairs3 = [['A', 'B'], ['A', 'C'], ['B', 'C']];
    const sections = [];

    sections.push({ id: 'h1', title: '仮説1 開始前の負担', cards: [
      likertCard('onb', rows, 'ONB', 'ONB 開始前の負担（4項目平均、低いほど負担が軽い）', '開始前の負担', pairs3, true, ['A', 'B'],
        '主な比較は「AI対話 × アンケート」です。診断なし群は手続きがほぼないので参考値です。'),
      secCard('prestart', rows, 'prestart_sec', ['A', 'B', 'C'], '開始前の時間（番号入力 → 初めてのプレイ開始まで）', '開始前の時間', true,
        'アンケートの主観に頼らない、客観的な負担の指標です。'),
      secCard('diag', rows, 'diagnosis_sec', ['A', 'B'], '診断にかかった時間（診断開始 → 練習の準備へ）', '診断にかかった時間', true),
      likertCard('s1', rows, 'S1', 'S1 開始前の過程そのものを楽しめた（1〜5）', '開始前の楽しさ', pairs3, false, ['A', 'B'], '補足の1項目です。'),
    ] });

    // 精度
    const accCards = [];
    {
      const groupItems = (g, key, chance, label) => {
        const v = rows.filter((r) => r.group === g).map((r) => r[key]).filter((x) => x === 0 || x === 1);
        const k = v.filter((x) => x === 1).length;
        return { group: g, label, n: v.length, k, rate: v.length ? k / v.length : 0, chance };
      };
      const items = [
        groupItems('A', 'assigned_is_top', 1 / 6, 'AI対話：1位が一致'),
        groupItems('A', 'assigned_in_top2', 2 / 6, 'AI対話：上位2位以内'),
        groupItems('C', 'assigned_is_top', 1 / 6, '診断なし：1位が一致'),
        groupItems('C', 'assigned_in_top2', 2 / 6, '診断なし：上位2位以内'),
      ];
      const t1 = binomGreater(items[0].k, items[0].n, 1 / 6);
      const t2 = binomGreater(items[1].k, items[1].n, 2 / 6);
      const lead = items[0].n
        ? `AI対話群では、割り当てたタイプが本人のHexad-12の1位と一致したのは ${items[0].k}/${items[0].n} 人（${Math.round(items[0].rate * 100)}%）、上位2位以内は ${items[1].k}/${items[1].n} 人（${Math.round(items[1].rate * 100)}%）でした。偶然に当たる確率（1位17%・上位2位33%）と比べると、1位は ${pEq(t1)}、上位2位は ${pEq(t2)}（片側の二項検定）です。`
        : 'AI対話群の回答が集まると表示されます。';
      accCards.push(mkCard('match', '割り当てたタイプが、本人のHexad-12と合っていた割合', lead,
        `<div class="viz-legend"><span><i class="sw g-A"></i>AI対話</span><span><i class="sw g-C"></i>診断なし（達成者で固定）</span><span><i class="sw-chance"></i>偶然に当たる確率</span></div>` +
        rateBars(items, { title: 'タイプの一致率' }) +
        '<p class="hint">アンケート群は、診断に使った回答と比較の基準が同じHexad-12なので一致率は100%になり、ここでは比べていません。</p>',
        `<table class="tbl stat"><thead><tr><th>指標</th><th>一致</th><th>割合</th><th>偶然の確率</th><th>二項検定 p（片側）</th></tr></thead><tbody>${items.map((it) => `<tr><td>${esc(it.label)}</td><td class="num">${it.k}/${it.n}</td><td class="num">${it.n ? Math.round(it.rate * 100) + '%' : '—'}</td><td class="num">${Math.round(it.chance * 100)}%</td><td class="num">${fmtP(binomGreater(it.k, it.n, it.chance))}</td></tr>`).join('')}</tbody></table><p class="hint">同点のタイプが複数ある場合は、そのどれかに入っていれば1位一致としています。</p>`,
        items[0].n ? (t1 < 0.05 ? 'sig' : 'ns') : 'wait'));
    }
    {
      const rho = vals(rows.filter((r) => r.group === 'A'), 'spearman');
      const mae = vals(rows.filter((r) => r.group === 'A'), 'ai_item_mae');
      const pos = rho.filter((v) => v > 0).length, nz = rho.filter((v) => v !== 0).length;
      const pSign = nz ? binomGreater(pos, nz, 0.5) : null;
      const lead = rho.length
        ? `AIの6タイプの得点と本人のHexad-12の得点の順位相関（1人ずつ計算）は、中央値 ${fmt(median(rho))} でした。プラスの人は ${pos}/${nz} 人（符号検定 ${pEq(pSign)}、片側）。AIが推定した12項目の点数と本人の回答のずれ（平均絶対誤差、1〜7点）は中央値 ${fmt(median(mae))} 点です。`
        : 'AI対話群の回答が集まると表示されます。';
      const s1 = [{ id: 'A', label: '順位相関 ρ', values: rho }], s2 = [{ id: 'A', label: '項目のずれ', values: mae }];
      accCards.push(mkCard('rho', 'AIの推定と本人のHexad-12の近さ（AI対話群）', lead,
        dotPlot(s1, { min: -1, max: 1, ticks: [-1, -0.5, 0, 0.5, 1], title: '順位相関' }) +
        dotPlot(s2, { min: 0, max: 6, ticks: [0, 1, 2, 3, 4, 5, 6], unit: '点', title: '平均絶対誤差' }) +
        '<p class="hint">順位相関は＋1に近いほど、6タイプの得点の並びが本人と一致しています（0は無関係）。項目のずれは小さいほど正確です。</p>',
        descTable(s1) + descTable(s2),
        rho.length ? (pSign < 0.05 ? 'sig' : 'ns') : 'wait'));
    }
    sections.push({ id: 'h2a', title: '仮説2 推定の精度', cards: accCards });

    sections.push({ id: 'h2b', title: '仮説2 体験と継続', cards: [
      likertCard('fit', rows, 'FIT', 'FIT 自分に合っていると感じたか（4項目平均）', '「自分に合っている」感', pairs3, false, ['A', 'B']),
      likertCard('enj', rows, 'ENJ', 'ENJ 楽しさ・満足（4項目平均）', '楽しさ・満足', pairs3, false, ['A', 'B']),
      likertCard('ret', rows, 'RET', 'RET また使いたい気持ち（RET1〜3の平均）', '継続意向', pairs3, false, ['A', 'B'],
        'RET4（ほかのツールとの比較）はタイピングゲーム経験者だけが答えるため、平均に含めていません。'),
      secCard('free', rows, 'free_play_sec', ['A', 'B', 'C'], '自由継続の時間（アンケートに進めるようになってから遊んだ時間）', '自分から続けて遊んだ時間', false,
        'アンケートに頼らない、行動から見た「続けたい気持ち」の指標です。すぐアンケートに進んだ人は0秒近くになります。'),
    ] });

    const opts = [['every_play', '毎プレイ'], ['few_plays', '数回ごと'], ['weekly', '1週間ごと'], ['monthly', '1か月ごと'], ['none', '不要']];
    const s4 = `<table class="tbl stat"><thead><tr><th>群</th>${opts.map((o) => `<th>${o[1]}</th>`).join('')}</tr></thead><tbody>${GROUPS.map((g) => {
      const rs = rows.filter((r) => r.group === g.id);
      return `<tr><td>${g.label}</td>${opts.map((o) => `<td class="num">${rs.filter((r) => r.S4 === o[0]).length}</td>`).join('')}</tr>`;
    }).join('')}</tbody></table>`;
    sections.push({ id: 'h3', title: '仮説3 見直し', cards: [
      likertCard('red', rows, 'RED', 'RED 好みの見直しへの受け入れ（4項目平均）', '見直しへの受け入れ', pairs3, false, ['A', 'B'],
        '探索的な分析です。アンケートでは「見直しがあると仮定して」答えてもらっています。'),
      mkCard('s4', 'S4 望ましい見直しの頻度（人数）', '', s4, '', 'info'),
    ] });

    const exp = GROUPS.map((g) => {
      const rs = rows.filter((r) => r.group === g.id);
      const yes = rs.filter((r) => r.EXP === 'yes').length, no = rs.filter((r) => r.EXP === 'no').length;
      const cmp = vals(rs, 'CMP1');
      return `<tr><td>${g.label}</td><td class="num">${yes}</td><td class="num">${no}</td><td class="num">${cmp.length ? fmt(median(cmp)) : '—'}</td></tr>`;
    }).join('');
    sections.push({ id: 'extra', title: '補足', cards: [
      likertCard('s2', rows, 'S2', 'S2 ゲームの操作は分かりやすかった（1〜5）', '操作の分かりやすさ', pairs3, false, ['A', 'B'],
        'ゲーム本体は全群共通なので、差がないことが望ましい項目です。'),
      mkCard('exp', 'タイピングゲームの経験と、ほかのツールとの比較', '',
        `<table class="tbl stat"><thead><tr><th>群</th><th>経験あり</th><th>経験なし</th><th>比較（中央値、1かなり劣る〜5かなり優れている）</th></tr></thead><tbody>${exp}</tbody></table><p class="hint">経験の有無が群でかたよっていないかの確認にも使えます。</p>`,
        '', 'info'),
    ] });
    return sections;
  }

  const BADGE = { sig: '<span class="badge ok">差あり</span>', ns: '<span class="badge">差は不明確</span>', info: '<span class="badge">記述のみ</span>', wait: '<span class="badge wip">データ待ち</span>' };

  function cardHtml(c) {
    return `<article class="analysis" id="card-${c.id}"><div class="analysis-head"><h3>${esc(c.title)}</h3>${BADGE[c.status] || ''}</div>
      ${c.lead ? `<p class="finding">${c.lead}</p>` : ''}${c.chart}
      ${c.detail ? `<details class="more"><summary>検定と記述統計の詳しい数値</summary>${c.detail}</details>` : ''}</article>`;
  }

  let activeSub = null;
  try { activeSub = localStorage.getItem('admin_stats_tab'); } catch (e) {}

  function render(container, rows) {
    const n = { A: rows.filter((r) => r.group === 'A').length, B: rows.filter((r) => r.group === 'B').length, C: rows.filter((r) => r.group === 'C').length };
    const sections = buildSections(rows);
    const tabs = [{ id: 'summary', title: 'まとめ' }, ...sections.map((s) => ({ id: s.id, title: s.title })), { id: 'method', title: '分析の方法' }];
    if (!tabs.some((t) => t.id === activeSub)) activeSub = 'summary';

    const summary = `<p class="hint">対象：アンケートまで回答した ${rows.length} 人（AI対話 ${n.A}・アンケート ${n.B}・診断なし ${n.C}）。テストの番号（900以上）は除いています。項目を押すと、そのグラフに移動します。</p>` +
      (() => { const re = rows.filter((r) => Number(r.rediagnosed) === 1); return re.length ? `<p class="hint">診断をやり直した人：${re.length} 人（うちタイプが変わった人 ${re.filter((r) => Number(r.type_changed) === 1).length} 人）。タイプの一致率などは<strong>最初の診断</strong>で集計しています。</p>` : ''; })() +
      sections.map((s) => `<h3 class="sum-head">${esc(s.title)}</h3><ul class="sum-list">${s.cards.map((c) => `<li><button type="button" class="sum-item" data-go="${s.id}" data-card="${c.id}">${BADGE[c.status] || ''}<span class="sum-title">${esc(c.title)}</span>${c.lead ? `<span class="sum-lead">${c.lead}</span>` : ''}</button></li>`).join('')}</ul>`).join('');

    const method = `<div class="analysis"><p>各群10人程度の小さな標本なので、p値だけでなく効果量とグラフの点の散らばりを合わせて見てください。</p><ul class="method-list">
      <li><strong>2群の比較</strong>：Mann-Whitney U検定。人数が少ないため、近似ではなく正確な並べ替え検定で p値を計算（同順位にも対応）。効果量 r（0.1小・0.3中・0.5大）。</li>
      <li><strong>3群の比較</strong>：Kruskal-Wallis検定（同順位補正つき）。効果量 ε²。</li>
      <li><strong>複数の2群比較</strong>：Holm法で p値を補正。</li>
      <li><strong>タイプの一致率</strong>：偶然に当たる確率（1位 1/6、上位2位 2/6）との片側の二項検定。</li>
      <li><strong>順位相関</strong>：1人ずつ、AIの6タイプ得点と本人のHexad-12得点のSpearman相関。プラスの人の割合を符号検定。</li>
      <li><strong>グラフ</strong>：1人＝1点、縦線は中央値。点にマウスを乗せると値が出ます。</li>
      <li>論文に載せる最終的な数値は、CSVで確認したうえで使ってください。</li></ul></div>`;

    const panels = {
      summary, method,
      ...Object.fromEntries(sections.map((s) => [s.id, s.cards.map(cardHtml).join('')])),
    };

    container.innerHTML = `<div class="subtabs" role="tablist">${tabs.map((t) => `<button type="button" role="tab" class="subtab" data-tab="${t.id}" aria-selected="${t.id === activeSub}">${esc(t.title)}</button>`).join('')}</div>` +
      tabs.map((t) => `<div class="subpanel" role="tabpanel" data-panel="${t.id}"${t.id === activeSub ? '' : ' hidden'}>${panels[t.id]}</div>`).join('');

    const select = (id, cardId) => {
      activeSub = id;
      try { localStorage.setItem('admin_stats_tab', id); } catch (e) {}
      container.querySelectorAll('.subtab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === id)));
      container.querySelectorAll('.subpanel').forEach((p) => { p.hidden = p.dataset.panel !== id; });
      if (cardId) { const el = container.querySelector(`#card-${cardId}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };
    container.querySelectorAll('.subtab').forEach((b) => b.addEventListener('click', () => select(b.dataset.tab)));
    container.querySelectorAll('.sum-item').forEach((b) => b.addEventListener('click', () => select(b.dataset.go, b.dataset.card)));
  }

  window.AdminStats = { render, mannWhitney, kruskal, holm, binomGreater, median };
})();
