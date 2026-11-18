/* 本実験の進行管理（全群共通）
   - 開始前の手続き・プレイ開始などの時刻を記録する（クリックを横取りして記録するので、各群のスクリプトはほぼ変更不要）
   - 必須プレイ（約5分）→ 自由継続（最大でプレイ開始から15分）→ アプリ内アンケート、の流れを制御する
   - アンケート回答は、記録した時刻・診断結果などと一緒に /api/save-survey へ自動送信する
   - 連続で失敗（クリアならず）が続いたら、クリア目標を下げる（難易度の下限）
   index.html で各群のスクリプトより先に読み込む。 */
(function () {
  'use strict';

  const REQUIRED_PLAY_MS = 5 * 60 * 1000;   // 必須プレイ：初回のスタートから5分
  const MAX_PLAY_MS = 15 * 60 * 1000;       // これを過ぎたら「もう少し遊ぶ」を出さずにアンケートへ誘導
  const ITEMS_VERSION = '2026-11-18';

  const KEYS = {
    events: 'gtp_study_events',
    fails: 'gtp_study_consecutive_fails',
    draft: 'gtp_survey_draft',
    submitted: 'gtp_survey_submitted',
    pending: 'gtp_survey_pending_payload',
    chat: 'gtp_chat_transcript',
    participant: 'gtp_participant_meta',
    log: 'gtp_log',
    hexadResult: 'gtp_hexad_result',
  };
  const CONDITION_LABELS = { A: 'AI対話', B: 'アンケート', C: '診断なし' };

  /* ---------------- 共通ユーティリティ ---------------- */
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function participant() {
    const meta = load(KEYS.participant, {}) || {};
    const st = (typeof appState !== 'undefined' && appState) ? appState : {};
    return { pid: st.participantId || meta.pid || null, group: st.group || meta.group || null };
  }

  /* ---------------- 時刻の記録 ---------------- */
  function getEvents() { return load(KEYS.events, {}) || {}; }
  // 同じ名前の時刻は最初の1回だけ記録する（overwrite: true で上書き）
  function mark(name, opts) {
    const ev = getEvents();
    if (ev[name] && !(opts && opts.overwrite)) return ev[name];
    ev[name] = new Date().toISOString();
    save(KEYS.events, ev);
    return ev[name];
  }
  function bump(name) {
    const ev = getEvents();
    ev[name] = (Number(ev[name]) || 0) + 1;
    save(KEYS.events, ev);
  }

  // AI対話群：会話ログを保存しておく（リロードで画面から消えても送信できるように）
  function snapshotChat() {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const lines = Array.from(box.querySelectorAll('.chat-message'))
      .filter((el) => !el.classList.contains('loading'))
      .map((el) => ({ role: el.classList.contains('user') ? 'user' : 'ai', text: (el.innerText || '').trim() }))
      .filter((l) => l.text);
    if (lines.length) save(KEYS.chat, lines);
  }

  // 各群のボタン操作を横取りして時刻を記録する（各スクリプトの処理より先に動く）
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!btn || !btn.id) return;
    switch (btn.id) {
      case 'btn-start-survey-llm':   // AI対話群：診断開始
      case 'btn-start-survey':       // アンケート群：診断開始
        mark('onboardingStart');
        break;
      case 'btn-goto-setup':         // 診断結果を見て、練習の準備へ
        mark('onboardingEnd');
        snapshotChat();
        break;
      case 'btn-start-game':
      case 'btn-play-again':
        if (playState().phase === 'free') bump('n_free_continue');
        mark('firstGameStart');
        bump('n_games_started');
        break;
      default:
        if (btn.id.startsWith('btn-rediagnose')) bump('n_rediagnose_clicked');
    }
  }, true);

  /* ---------------- プレイ時間の段階 ---------------- */
  function playState() {
    const ev = getEvents();
    const start = ev.firstGameStart ? Date.parse(ev.firstGameStart) : null;
    if (!start) return { phase: 'notStarted', elapsed: 0, remaining: REQUIRED_PLAY_MS };
    const elapsed = Date.now() - start;
    if (elapsed < REQUIRED_PLAY_MS) return { phase: 'required', elapsed, remaining: REQUIRED_PLAY_MS - elapsed };
    if (elapsed < MAX_PLAY_MS) return { phase: 'free', elapsed, remaining: MAX_PLAY_MS - elapsed };
    return { phase: 'over', elapsed, remaining: 0 };
  }
  function fmtClock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  function ceilMin(ms) { return Math.max(1, Math.ceil(ms / 60000)); }

  /* ---------------- 難易度の下限（連続失敗でクリア目標を下げる） ---------------- */
  function recordClear(cleared) {
    const n = Number(load(KEYS.fails, 0)) || 0;
    save(KEYS.fails, cleared ? 0 : n + 1);
    bump(cleared ? 'n_clear' : 'n_fail');
  }
  // 2回続けて失敗 → 目標を8割に、4回続けて失敗 → 6.5割に（クリアすると元に戻る）
  function easeFactor() {
    const n = Number(load(KEYS.fails, 0)) || 0;
    if (n >= 4) return 0.65;
    if (n >= 2) return 0.8;
    return 1;
  }

  /* ---------------- 画面上部の進捗表示 ---------------- */
  let pill = null;
  let lastPhase = null;
  function ensurePill() {
    if (pill) return pill;
    pill = document.createElement('div');
    pill.id = 'study-progress';
    pill.className = 'study-progress';
    pill.setAttribute('role', 'status');
    document.body.appendChild(pill);
    return pill;
  }
  function activeScreenId() {
    const el = document.querySelector('#app .screen.active');
    return el ? el.id : null;
  }
  function tick() {
    const id = activeScreenId();
    const show = !surveyOpen && ['screen-setup', 'screen-game', 'screen-postgame'].includes(id);
    const p = ensurePill();
    if (!show) { p.style.display = 'none'; return; }
    const st = playState();
    let text = '';
    if (st.phase === 'notStarted') text = 'プレイ時間の目安：約5分';
    else if (st.phase === 'required') text = `アンケートまで あと ${fmtClock(st.remaining)}`;
    else if (st.phase === 'free') text = '必須のプレイ完了｜結果画面からアンケートに進めます';
    else text = 'プレイ時間終了｜結果画面からアンケートに進んでください';
    p.textContent = text;
    p.dataset.phase = st.phase;
    p.style.display = 'block';
    // 結果画面を開いたまま必須時間を過ぎた場合も、案内を切り替える
    if (id === 'screen-postgame' && st.phase !== lastPhase) updatePostgame();
    lastPhase = st.phase;
  }
  setInterval(tick, 1000);

  /* ---------------- 結果画面：アンケートへの案内 ---------------- */
  function updatePostgame() {
    const box = qs('#survey-cta-box');
    const again = qs('#btn-play-again');
    const back = qs('#btn-back-setup');
    const goBtn = qs('#btn-goto-survey');
    if (!box || !again) return;

    let note = qs('#study-gate-note');
    if (!note) {
      note = document.createElement('div');
      note.id = 'study-gate-note';
      note.className = 'study-gate-note';
      box.parentNode.insertBefore(note, box);
    }
    // 旧仕様（CSVダウンロード → Googleフォーム）の表示を、アプリ内アンケート用に置き換える
    // 例文「にじがでた」を打つと隠しコマンド deta が反応してCSV欄が出てしまうため、結果画面を開くたびに隠す
    const exportUi = qs('#secret-export-ui'); if (exportUi) exportUi.style.display = 'none';
    const label = qs('.step-label', box); if (label) label.style.display = 'none';
    const stepNote = qs('#survey-step-note'); if (stepNote) stepNote.style.display = 'none';
    const ctaText = qs('.survey-cta-text', box); if (ctaText) ctaText.textContent = 'プレイおつかれさまでした。最後にアンケート（約8分）にご協力ください。';
    if (goBtn) { goBtn.disabled = false; goBtn.lastChild.textContent = 'アンケートに進む'; }

    const st = playState();
    lastPhase = st.phase;
    if (st.phase === 'notStarted' || st.phase === 'required') {
      box.style.display = 'none';
      note.innerHTML = `<strong>あと約${ceilMin(st.remaining)}分</strong>プレイすると、アンケートに進めます。<br><span class="hint">「もう一度プレイ」で続けてください。制限時間などは「設定に戻る」から変えられます。</span>`;
      again.textContent = 'もう一度プレイ';
      again.className = 'btn btn-primary';
      again.style.display = '';
      if (back) back.style.display = '';
    } else if (st.phase === 'free') {
      mark('freeChoiceShown');
      box.style.display = 'block';
      note.innerHTML = `<strong>必須のプレイ（約5分）が終わりました。</strong><br>アンケートに進むか、もう少し遊ぶかを選べます。どちらを選んでも問題ありません。<br><span class="hint">もう少し遊ぶ場合も、あと約${ceilMin(st.remaining)}分でアンケートに進んでいただきます。</span>`;
      again.textContent = 'もう少し遊ぶ';
      again.className = 'btn btn-secondary';
      again.style.display = '';
      if (back) back.style.display = '';
    } else {
      mark('freeChoiceShown');
      box.style.display = 'block';
      note.innerHTML = '<strong>プレイ時間の上限になりました。</strong><br>アンケートに進んでください。';
      again.style.display = 'none';
      if (back) back.style.display = 'none';
    }
  }

  /* ---------------- アプリ内アンケート ---------------- */
  let surveyOpen = false;
  let draft = load(KEYS.draft, null) || { page: 0, answers: {} };

  function saveDraft() { save(KEYS.draft, draft); }
  function items() { return window.PostSurveyItems; }

  function openSurvey() {
    if (surveyOpen) return;
    const P = items();
    if (!P) { alert('アンケートの読み込みに失敗しました。ページを再読み込みしてください。'); return; }
    surveyOpen = true;
    mark('surveyStart');
    snapshotChat();
    const app = document.getElementById('app');
    document.querySelectorAll('#app .screen').forEach((s) => s.classList.remove('active'));
    let sec = document.getElementById('screen-post-survey');
    if (!sec) {
      sec = document.createElement('section');
      sec.id = 'screen-post-survey';
      sec.className = 'screen';
      // 回答の入力中に、各群のスクリプトの隠しコマンド（document の keydown）が反応しないようにする
      sec.addEventListener('keydown', (e) => e.stopPropagation());
      app.appendChild(sec);
    }
    sec.classList.add('active');
    if (pill) pill.style.display = 'none';
    if (load(KEYS.submitted, null)) renderDone(sec);
    else renderPage(sec);
    window.scrollTo(0, 0);
  }

  function visibleItems(section) {
    const P = items();
    return section.items.filter((it) => P.isVisible(it, draft.answers));
  }

  function itemHtml(it, num) {
    const P = items();
    const v = draft.answers[it.id];
    const req = it.optional ? '<span class="ps-optional">任意</span>' : '';
    const head = `<p class="ps-q"><span class="ps-num">Q${num}</span>${esc(it.text)}${req}</p>`;
    if (it.type === 'likert5') {
      return `<div class="survey-item ps-item" data-id="${it.id}">${head}
        <div class="likert">${P.LIKERT5.map((lbl, i) => `
          <label><input type="radio" name="${it.id}" value="${i + 1}"${String(v) === String(i + 1) ? ' checked' : ''}><span>${esc(lbl)}</span></label>`).join('')}
        </div></div>`;
    }
    if (it.type === 'likert7') {
      return `<div class="survey-item ps-item" data-id="${it.id}">${head}
        <div class="likert likert7">${[1, 2, 3, 4, 5, 6, 7].map((n) => `
          <label><input type="radio" name="${it.id}" value="${n}"${String(v) === String(n) ? ' checked' : ''}><span>${n}</span></label>`).join('')}
        </div>
        <div class="likert7-ends"><span>1＝${esc(P.LIKERT7_ENDS[0])}</span><span>7＝${esc(P.LIKERT7_ENDS[1])}</span></div></div>`;
    }
    if (it.type === 'choice') {
      return `<div class="survey-item ps-item" data-id="${it.id}">${head}
        <div class="choice-list">${it.options.map((o) => `
          <label><input type="radio" name="${it.id}" value="${esc(o.value)}"${v === o.value ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}
        </div></div>`;
    }
    return `<div class="survey-item ps-item" data-id="${it.id}">${head}
      <textarea name="${it.id}" rows="3" class="ps-text" maxlength="2000">${esc(v || '')}</textarea></div>`;
  }

  function renderPage(sec) {
    const P = items();
    const sections = P.SECTIONS;
    if (draft.page >= sections.length) draft.page = sections.length - 1;
    const section = sections[draft.page];
    const before = sections.slice(0, draft.page).reduce((n, s) => n + visibleItems(s).length, 0);
    const vis = visibleItems(section);
    const isLast = draft.page === sections.length - 1;
    const pct = Math.round((draft.page / sections.length) * 100);
    const placeholderWarn = P.hasPlaceholders()
      ? '<p class="ps-warn">（研究者向け）設問文が未設定の項目があります。post-survey-items.js を確認してください。</p>' : '';

    sec.innerHTML = `
      <div class="card ps-card">
        ${placeholderWarn}
        <div class="ps-progress"><span style="width:${pct}%"></span></div>
        <p class="hint">アンケート ${draft.page + 1} / ${sections.length} ページ</p>
        <h2>${esc(section.title)}</h2>
        ${section.lead ? `<p class="lead">${esc(section.lead)}</p>` : ''}
        <div class="ps-items">${vis.map((it, i) => itemHtml(it, before + i + 1)).join('')}</div>
        <p class="ps-error" id="ps-error" style="display:none;"></p>
        <div class="button-row ps-nav">
          ${draft.page > 0 ? '<button type="button" class="btn btn-tertiary" id="ps-prev">戻る</button>' : ''}
          <button type="button" class="btn btn-primary" id="ps-next">${isLast ? '回答を送信する' : '次へ'}</button>
        </div>
      </div>`;

    sec.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        draft.answers[input.name] = input.value;
        const row = input.closest('.ps-item'); if (row) row.classList.remove('missing');
        saveDraft();
        // 分岐の元になる設問が変わったら、表示する設問を出し直す
        if (P.ALL_ITEMS.some((it) => it.showIf && it.showIf.item === input.name)) {
          const y = window.scrollY; renderPage(sec); window.scrollTo(0, y);
        }
      });
    });
    sec.querySelectorAll('textarea').forEach((ta) => {
      ta.addEventListener('input', () => {
        draft.answers[ta.name] = ta.value;
        if (ta.value.trim()) { const row = ta.closest('.ps-item'); if (row) row.classList.remove('missing'); }
        saveDraft();
      });
    });
    const prev = qs('#ps-prev', sec);
    if (prev) prev.addEventListener('click', () => { draft.page -= 1; saveDraft(); renderPage(sec); window.scrollTo(0, 0); });
    qs('#ps-next', sec).addEventListener('click', () => {
      const missing = vis.filter((it) => !it.optional && !String(draft.answers[it.id] ?? '').trim());
      if (missing.length) {
        missing.forEach((it) => { const row = sec.querySelector(`.ps-item[data-id="${it.id}"]`); if (row) row.classList.add('missing'); });
        const err = qs('#ps-error', sec);
        err.textContent = `未回答の質問が ${missing.length} 件あります（赤枠の質問）。`;
        err.style.display = 'block';
        const first = sec.querySelector('.ps-item.missing');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!isLast) { draft.page += 1; saveDraft(); renderPage(sec); window.scrollTo(0, 0); return; }
      submit(sec);
    });
  }

  function buildPayload() {
    const P = items();
    const { pid, group } = participant();
    const answers = {};
    P.ALL_ITEMS.forEach((it) => {
      if (!P.isVisible(it, draft.answers)) return;
      const v = draft.answers[it.id];
      if (v === undefined || v === null || String(v).trim() === '') return;
      answers[it.id] = it.type === 'likert5' || it.type === 'likert7' ? Number(v) : String(v).trim();
    });
    const st = (typeof appState !== 'undefined' && appState) ? appState : {};
    mark('surveySubmit', { overwrite: true });
    return {
      participantId: pid,
      group,
      condition: CONDITION_LABELS[group] || null,
      itemsVersion: ITEMS_VERSION,
      answers,
      events: getEvents(),
      hexadResult: st.hexadResult || load(KEYS.hexadResult, null),
      classifyMethod: st.classifyMethod || (group === 'C' ? 'none' : null),
      onboardingAnswers: st.answers && Object.keys(st.answers).length ? st.answers : null,
      chatTranscript: load(KEYS.chat, null),
      playLog: (load(KEYS.log, []) || []).slice(-100),
      client: {
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        maxTouchPoints: navigator.maxTouchPoints || 0,
      },
    };
  }

  async function postPayload(payload) {
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch('/api/save-survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) return true;
        lastErr = new Error(`HTTP ${res.status}`);
      } catch (e) { lastErr = e; }
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
    console.warn('アンケート送信エラー:', lastErr);
    return false;
  }

  async function submit(sec) {
    const btn = qs('#ps-next', sec);
    btn.disabled = true;
    btn.textContent = '送信中...';
    const payload = buildPayload();
    save(KEYS.pending, payload); // 送信に失敗しても、この端末に回答を残しておく
    const ok = await postPayload(payload);
    if (ok) {
      save(KEYS.submitted, { at: new Date().toISOString() });
      try { localStorage.removeItem(KEYS.pending); localStorage.removeItem(KEYS.draft); } catch (e) {}
      renderDone(sec);
      window.scrollTo(0, 0);
      return;
    }
    btn.disabled = false;
    btn.textContent = 'もう一度送信する';
    const err = qs('#ps-error', sec);
    err.textContent = '送信に失敗しました。通信状況を確認して、もう一度「送信する」を押してください。何度やっても失敗する場合は、この画面を開いたまま研究者に連絡してください（回答はこの端末に保存されています）。';
    err.style.display = 'block';
  }

  function renderDone(sec) {
    const { pid } = participant();
    sec.innerHTML = `
      <div class="card center ps-card">
        <h2>回答を送信しました</h2>
        <p class="lead">ご協力ありがとうございました。このページは閉じてかまいません。</p>
        ${pid ? `<p class="hint">参加者番号: ${esc(pid)}</p>` : ''}
        <div class="ps-debrief">
          <h3>この研究について</h3>
          <p>この研究では、ゲームを始める前の「タイプ診断」のやり方（AIとの対話・アンケート・診断なし）によって、ゲームの始めやすさや楽しさがどう変わるかを調べています。参加者によって、診断のやり方が異なります。</p>
          <p><strong>結果に影響するため、これから参加する人には、ゲームやアンケートの内容を話さないようお願いします。</strong></p>
        </div>
      </div>`;
  }

  // 前回、送信に失敗したまま閉じていた場合は、次に開いたときに自動で送り直す
  (async function retryPending() {
    const pending = load(KEYS.pending, null);
    if (!pending || load(KEYS.submitted, null)) return;
    if (await postPayload(pending)) {
      save(KEYS.submitted, { at: new Date().toISOString(), retried: true });
      try { localStorage.removeItem(KEYS.pending); } catch (e) {}
    }
  })();

  window.StudyFlow = {
    REQUIRED_PLAY_MS, MAX_PLAY_MS,
    mark, bump, getEvents, playState,
    updatePostgame, openSurvey,
    recordClear, easeFactor,
  };
})();
