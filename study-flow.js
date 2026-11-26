/* 本実験の進行管理（全群共通）
   流れ（修正版アンケート v1 2026-11-16 に準拠）
     番号入力 → T0 はじめの4問（BG1〜4）→ 群ごとの開始準備（AI対話・アンケート・診断なし）
     → T1 準備直後の質問（ONB1〜4・S1。最初のプレイの前）→ 全群共通のプレイ10分
     → T2 アンケート（追加プレイを選ぶ前）→ 任意の追加プレイ（最大10分・いつでも終了できる）
   - 開始前の手続き・プレイ開始などの時刻を記録する（クリックを横取りして記録するので、各群のスクリプトはほぼ変更不要）
   - アンケートの回答は、記録した時刻・診断結果などと一緒に /api/save-survey へ自動送信する
     （T0・T1 の時点でも途中経過を送る。途中でやめた人の開始前の負担も残すため。分析では参加IDごとに最後の送信を使う）
   - 連続で失敗（クリアならず）が続いたら、クリア目標を下げる（難易度の下限）
   index.html で各群のスクリプトより先に読み込む。 */
(function () {
  'use strict';

  const REQUIRED_PLAY_MS = 10 * 60 * 1000;  // 全群共通のプレイ：初回のスタートから10分
  const MAX_PLAY_MS = REQUIRED_PLAY_MS;     // 10分たったら、アンケートを送信するまで新しいプレイは始められない
  const EXTRA_PLAY_MS = 10 * 60 * 1000;     // アンケート送信後の任意の追加プレイ：最大10分（最初の追加プレイの開始から）
  const ITEMS_VERSION = '2026-11-26';

  const KEYS = {
    events: 'gtp_study_events',
    fails: 'gtp_study_consecutive_fails',
    draft: 'gtp_survey_draft',
    submitted: 'gtp_survey_submitted',
    pending: 'gtp_survey_pending_payload',
    chat: 'gtp_chat_transcript',
    onboardingAnswers: 'gtp_onboarding_answers',
    participant: 'gtp_participant_meta',
    log: 'gtp_log',
    hexadResult: 'gtp_hexad_result',
    diagHistory: 'gtp_diag_history', // 診断をやり直したとき、やり直す前の診断（結果・会話・回答）を残す
    aiTrial: 'gtp_ai_trial', // アンケート送信後に「AIでタイプ診断してみる」を始めた（以降のプレイはDBに送らない）
    entryId: 'gtp_entry_id',
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
  function stageDone(stage) {
    if (stage === 'T2') return isSubmitted();
    return !!getEvents()[stage === 'T0' ? 't0Submit' : 't1Submit'];
  }

  // AI対話群：会話ログを保存しておく（リロードで画面から消えても送信できるように）
  function snapshotChat() {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const lines = Array.from(box.querySelectorAll('.chat-message'))
      .filter((el) => !el.classList.contains('loading'))
      .map((el) => {
        // 選択肢のボタンや「ゲームを始める」ボタンの文字は会話の記録に含めない
        const clone = el.cloneNode(true);
        clone.querySelectorAll('button').forEach((b) => b.remove());
        clone.querySelectorAll('br').forEach((b) => b.replaceWith('\n'));
        return { role: el.classList.contains('user') ? 'user' : 'ai', text: (clone.textContent || '').trim() };
      })
      .filter((l) => l.text);
    if (lines.length) save(KEYS.chat, lines);
  }

  // 各群のボタン操作を横取りして時刻を記録する（各スクリプトの処理より先に動く）
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('button') : null;
    if (!btn || !btn.id) return;
    if (btn.id === 'btn-start-game' || btn.id === 'btn-play-again') {
      const block = (fn) => { e.preventDefault(); e.stopImmediatePropagation(); fn(); };
      if (!isSubmitted()) {
        // 最初のプレイの前に、T0（未回答なら）とT1に答えてもらう
        if (!stageDone('T0')) return block(() => openStage('T0'));
        if (!stageDone('T1')) return block(() => openStage('T1'));
        // 10分たったら、アンケートを送信するまでプレイを始められない（押したらアンケートへ）
        if (playGated()) return block(() => openStage('T2'));
      } else if (!isAiTrial() && extraState().phase === 'over') {
        // 追加プレイ（最大10分）が終わった
        return block(() => openEnd());
      }
    }
    switch (btn.id) {
      case 'btn-start-survey-llm':   // AI対話群：診断開始
      case 'btn-start-survey':       // アンケート群：診断開始
        mark('onboardingStart');
        break;
      case 'btn-survey-submit':      // アンケート群：動機づけ傾向12問の回答を確定（事後アンケートで再利用する）
        if (typeof appState !== 'undefined' && appState && appState.answers && !load(KEYS.onboardingAnswers, null)) {
          save(KEYS.onboardingAnswers, { ...appState.answers });
        }
        break;
      case 'btn-goto-setup':         // 診断結果を見て、練習の準備へ
        mark('onboardingEnd');
        snapshotChat();
        break;
      case 'btn-start-game':
      case 'btn-play-again':
        if (isSubmitted()) {
          bump('n_post_survey_games'); // アンケート送信後に自分から遊んだ回数
          if (!isAiTrial()) mark('extraPlayStart');
        }
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
  // 10分のプレイが終わり、まだアンケートを送信していない
  function playGated() {
    const ph = playState().phase;
    return (ph === 'free' || ph === 'over') && !load(KEYS.submitted, null);
  }
  // アンケート送信後の追加プレイ（最大10分）
  function extraState() {
    const ev = getEvents();
    const start = ev.extraPlayStart ? Date.parse(ev.extraPlayStart) : null;
    if (!start) return { phase: 'notStarted', remaining: EXTRA_PLAY_MS };
    const elapsed = Date.now() - start;
    if (elapsed < EXTRA_PLAY_MS) return { phase: 'playing', remaining: EXTRA_PLAY_MS - elapsed };
    return { phase: 'over', remaining: 0 };
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
    let phaseKey = st.phase;
    if (isSubmitted()) {
      const ex = extraState();
      phaseKey = `extra-${ex.phase}`;
      if (isAiTrial()) text = 'AIでのタイプ診断を試しています｜研究データには含まれません';
      else if (ex.phase === 'notStarted') text = 'アンケート送信済み｜追加プレイは任意・最大10分です';
      else if (ex.phase === 'playing') text = `追加プレイ 残り ${fmtClock(ex.remaining)}｜いつでも終了できます`;
      else text = '追加プレイの時間（最大10分）が終わりました';
    } else if (st.phase === 'notStarted') text = 'プレイ時間：約10分';
    else if (st.phase === 'required') text = `アンケートまで あと ${fmtClock(st.remaining)}`;
    else text = '10分のプレイ終了｜アンケートに答えてください';
    p.textContent = text;
    p.dataset.phase = st.phase;
    p.style.display = 'block';
    // 結果画面を開いたまま時間を過ぎた場合も、案内を切り替える
    if (id === 'screen-postgame' && phaseKey !== lastPhase) updatePostgame();
    lastPhase = phaseKey;
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
    const ctaText = qs('.survey-cta-text', box); if (ctaText) ctaText.textContent = 'プレイおつかれさまでした。ここでアンケートにご協力ください。';
    if (goBtn) { goBtn.disabled = false; goBtn.lastChild.textContent = 'アンケートに進む'; }

    // アンケート送信後：任意の追加プレイ（最大10分・いつでも終了できる）
    if (isSubmitted()) {
      box.style.display = 'none';
      const finishBtn = '<div class="gate-ai"><button type="button" id="btn-finish-postgame" class="btn btn-tertiary">ここで終了する</button></div>';
      const ex = extraState();
      if (isAiTrial()) {
        note.innerHTML = 'AIでのタイプ診断を試しています（研究データには含まれません）。<br><span class="hint">このページはいつ閉じてもかまいません。</span>';
        again.style.display = '';
        if (back) back.style.display = '';
      } else if (ex.phase === 'over') {
        note.innerHTML = '<strong>追加プレイの時間（最大10分）が終わりました。</strong><br>ご協力ありがとうございました。' + finishBtn;
        again.style.display = 'none';
        if (back) back.style.display = 'none';
      } else {
        const rest = ex.phase === 'playing' ? `残り約${ceilMin(ex.remaining)}分` : '最大10分';
        note.innerHTML = `アンケートは送信済みです。追加プレイ（任意・${rest}）を続けられます。<br><span class="hint">いつでも終了できます。どちらを選んでも不利益はありません。</span>` + finishBtn;
        again.textContent = 'もう一度プレイ';
        again.className = 'btn btn-primary';
        again.style.display = '';
        if (back) back.style.display = '';
      }
      const fb = qs('#btn-finish-postgame');
      if (fb) fb.onclick = () => openEnd();
      return;
    }

    const st = playState();
    lastPhase = st.phase;
    if (st.phase === 'notStarted' || st.phase === 'required') {
      box.style.display = 'none';
      note.innerHTML = `<strong>あと約${ceilMin(st.remaining)}分</strong>プレイしたら、アンケートに答えていただきます。<br><span class="hint">「もう一度プレイ」で続けてください。制限時間などは「設定に戻る」から変えられます。</span>`;
      again.textContent = 'もう一度プレイ';
      again.className = 'btn btn-primary';
      again.style.display = '';
      if (back) back.style.display = '';
    } else {
      // 10分たったら、まずアンケート（回答後は、希望すれば最大10分追加で遊べる）
      mark('freeChoiceShown');
      box.style.display = 'block';
      note.innerHTML = '<strong>10分のプレイが終わりました。</strong><br>ここでアンケートに答えてください。';
      again.style.display = 'none';
      if (back) back.style.display = 'none';
    }
  }

  /* ---------------- アプリ内アンケート（T0・T1・T2） ---------------- */
  let surveyOpen = false;
  let currentStage = null;
  let returnScreen = null;   // アンケートを閉じたときに戻る画面
  let warnedPage = null;     // 未回答があるまま「次へ」を押したページ（2回目は進める）
  function freshDraft() { return { answers: {}, pages: { T0: 0, T1: 0, T2: 0 } }; }
  let draft = load(KEYS.draft, null);
  if (!draft || !draft.pages) draft = freshDraft();

  function saveDraft() { save(KEYS.draft, draft); }
  function isSubmitted() { return !!load(KEYS.submitted, null); }
  function items() { return window.PostSurveyItems; }

  function surveySection() {
    const app = document.getElementById('app');
    let sec = document.getElementById('screen-post-survey');
    if (!sec) {
      sec = document.createElement('section');
      sec.id = 'screen-post-survey';
      sec.className = 'screen';
      // 回答の入力中に、各群のスクリプトの隠しコマンド（document の keydown）が反応しないようにする
      sec.addEventListener('keydown', (e) => e.stopPropagation());
      app.appendChild(sec);
    }
    return sec;
  }
  function showSurveySection() {
    const cur = activeScreenId();
    if (cur && cur !== 'screen-post-survey') returnScreen = cur;
    document.querySelectorAll('#app .screen').forEach((s) => s.classList.remove('active'));
    const sec = surveySection();
    sec.classList.add('active');
    if (pill) pill.style.display = 'none';
    window.scrollTo(0, 0);
    return sec;
  }
  function closeSurvey() {
    surveyOpen = false;
    currentStage = null;
    const sec = document.getElementById('screen-post-survey');
    if (sec) sec.classList.remove('active');
    const back = returnScreen && document.getElementById(returnScreen);
    const target = back || document.querySelector('#app .screen');
    if (target) {
      document.querySelectorAll('#app .screen').forEach((s) => s.classList.remove('active'));
      target.classList.add('active');
    }
    window.scrollTo(0, 0);
    tick();
  }

  function openStage(stage) {
    const P = items();
    if (!P) { alert('アンケートの読み込みに失敗しました。ページを再読み込みしてください。'); return; }
    if (stage === 'T2' && isSubmitted()) { openEnd(); return; }
    if (surveyOpen && currentStage === stage) return;
    surveyOpen = true;
    currentStage = stage;
    mark(stage === 'T2' ? 'surveyStart' : `${stage.toLowerCase()}Start`);
    if (stage === 'T2') snapshotChat();
    const sec = showSurveySection();
    renderPage(sec);
  }
  function openSurvey() { openStage('T2'); }

  // アンケート群は、最初の診断で動機づけ傾向の12問に答えているので、T2のそのページを省く
  function onboardingHexAnswers() {
    const P = items();
    const saved = load(KEYS.onboardingAnswers, null);
    if (!saved || participant().group !== 'B') return null;
    const hexIds = P.ALL_ITEMS.filter((it) => it.scale === 'HEX').map((it) => it.id);
    const ok = (v) => v === 'DK' || (Number(v) >= 1 && Number(v) <= 7);
    return hexIds.every((id) => ok(saved[id])) ? saved : null;
  }
  function stageSections(stage) {
    const P = items();
    const secs = P.SECTIONS.filter((s) => s.stage === stage);
    return stage === 'T2' && onboardingHexAnswers() ? secs.filter((s) => s.id !== 'hexad') : secs;
  }
  function askedSections(upTo) {
    const order = ['T0', 'T1', 'T2'];
    return order.slice(0, order.indexOf(upTo) + 1).flatMap((st) => stageSections(st));
  }

  function visibleItems(section) {
    const P = items();
    return section.items.filter((it) => P.isVisible(it, draft.answers));
  }

  function radioRow(it, opts, cls) {
    const v = draft.answers[it.id];
    return `<div class="${cls}">${opts.map((o) => `
      <label><input type="radio" name="${it.id}" value="${esc(o.value)}"${String(v) === String(o.value) ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}
    </div>`;
  }
  function itemHtml(it, num) {
    const P = items();
    const v = draft.answers[it.id];
    const opt = it.optional ? '<span class="ps-optional">任意</span>' : '';
    const head = `<p class="ps-q"><span class="ps-num">Q${num}</span>${esc(it.text)}${opt}</p>${it.note ? `<p class="hint ps-note">${esc(it.note)}</p>` : ''}`;
    if (it.type === 'likert5' || it.type === 'likert7') {
      const all = P.optionsOf(it);
      const n = it.type === 'likert5' ? 5 : 7;
      const nums = all.slice(0, n).map((o, i) => ({ value: o.value, label: o.label.replace(/^\d+\s*/, '') , n: i + 1 }));
      const extra = all.slice(n);
      return `<div class="survey-item ps-item" data-id="${it.id}">${head}
        <div class="likert ${it.type === 'likert7' ? 'likert7' : 'likert5'}">${nums.map((o) => `
          <label><input type="radio" name="${it.id}" value="${o.value}"${String(v) === o.value ? ' checked' : ''}><b class="lk-n">${o.n}</b><span>${esc(o.label)}</span></label>`).join('')}
        </div>
        ${radioRow(it, extra, 'choice-list likert-extra')}</div>`;
    }
    if (it.type === 'choice') {
      return `<div class="survey-item ps-item" data-id="${it.id}">${head}${radioRow(it, it.options, 'choice-list')}</div>`;
    }
    return `<div class="survey-item ps-item" data-id="${it.id}">${head}
      <textarea name="${it.id}" rows="3" class="ps-text" maxlength="2000">${esc(v || '')}</textarea></div>`;
  }

  function renderPage(sec) {
    const P = items();
    const stage = currentStage;
    const sections = stageSections(stage);
    let page = draft.pages[stage] || 0;
    if (page >= sections.length) page = sections.length - 1;
    draft.pages[stage] = page;
    const section = sections[page];
    const before = sections.slice(0, page).reduce((n, s) => n + visibleItems(s).length, 0);
    const vis = visibleItems(section);
    const isLast = page === sections.length - 1;
    const pct = Math.round((page / sections.length) * 100);
    const placeholderWarn = P.hasPlaceholders()
      ? '<p class="ps-warn">（研究者向け）設問文が未設定の項目があります。post-survey-items.js を確認してください。</p>' : '';
    const meta = P.STAGES[stage];
    const pageInfo = sections.length > 1 ? `${meta.label} ${page + 1} / ${sections.length} ページ` : meta.label;

    sec.innerHTML = `
      <div class="card ps-card">
        ${placeholderWarn}
        <div class="ps-progress"><span style="width:${pct}%"></span></div>
        <p class="hint">${esc(pageInfo)}</p>
        <h2>${esc(section.title)}</h2>
        ${page === 0 ? `<p class="ps-common">${esc(P.INSTRUCTIONS.common)}</p>` : ''}
        ${section.lead ? `<p class="lead">${esc(section.lead)}</p>` : ''}
        <div class="ps-items">${vis.map((it, i) => itemHtml(it, before + i + 1)).join('')}</div>
        <p class="ps-error" id="ps-error" style="display:none;"></p>
        <div class="button-row ps-nav">
          ${page > 0 ? '<button type="button" class="btn btn-tertiary" id="ps-prev">戻る</button>' : '<span></span>'}
          <button type="button" class="btn btn-primary" id="ps-next">${isLast ? esc(meta.submitLabel) : '次へ'}</button>
        </div>
      </div>`;

    sec.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        draft.answers[input.name] = input.value;
        sec.querySelectorAll(`input[name="${input.name}"]`).forEach((r) => { if (r !== input) r.checked = false; });
        const row = input.closest('.ps-item'); if (row) row.classList.remove('missing');
        saveDraft();
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
    if (prev) prev.addEventListener('click', () => { draft.pages[stage] -= 1; warnedPage = null; saveDraft(); renderPage(sec); window.scrollTo(0, 0); });
    qs('#ps-next', sec).addEventListener('click', () => {
      // 答えたくない設問は空欄のままでよい（共通教示）。未回答があれば一度だけ知らせ、もう一度押せば進める
      const missing = vis.filter((it) => !it.optional && !String(draft.answers[it.id] ?? '').trim());
      const key = `${stage}:${page}`;
      if (missing.length && warnedPage !== key) {
        warnedPage = key;
        missing.forEach((it) => { const row = sec.querySelector(`.ps-item[data-id="${it.id}"]`); if (row) row.classList.add('missing'); });
        const err = qs('#ps-error', sec);
        err.textContent = `未回答の質問が ${missing.length} 件あります（赤枠の質問）。答えたくない設問は空欄のままでかまいません。このまま進む場合は、もう一度「${isLast ? meta.submitLabel : '次へ'}」を押してください。`;
        err.style.display = 'block';
        const first = sec.querySelector('.ps-item.missing');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      warnedPage = null;
      if (!isLast) { draft.pages[stage] += 1; saveDraft(); renderPage(sec); window.scrollTo(0, 0); return; }
      completeStage(stage, sec);
    });
  }

  function completeStage(stage, sec) {
    if (stage === 'T2') { submit(sec); return; }
    mark(stage === 'T0' ? 't0Submit' : 't1Submit');
    saveDraft();
    postPayload(buildPayload(stage)); // 途中経過（失敗しても先へ進める。最後の送信にすべて含まれる）
    if (stage === 'T0') { closeSurvey(); return; }
    // T1：回答後、全群共通の10分のプレイへ
    sec.innerHTML = `
      <div class="card center ps-card">
        <h2>ありがとうございました</h2>
        <p class="lead">ここから、全員共通のタイピングを<strong>約10分</strong>行います。<br>画面上部に残り時間が表示されます。</p>
        <p><button type="button" id="ps-go-play" class="btn btn-primary">タイピングを始める</button></p>
      </div>`;
    qs('#ps-go-play', sec).addEventListener('click', () => {
      closeSurvey();
      const start = document.getElementById('btn-start-game');
      if (start) start.click();
    });
  }

  function answerValue(it, v) {
    if (v === undefined || v === null || String(v).trim() === '') return undefined;
    const s = String(v).trim();
    if ((it.type === 'likert5' || it.type === 'likert7') && /^\d+$/.test(s)) return Number(s);
    return s;
  }

  function buildPayload(stage) {
    const P = items();
    const { pid, group } = participant();
    const answers = {};
    const onbHex = stage === 'T2' ? onboardingHexAnswers() : null;
    const asked = new Set(askedSections(stage).flatMap((sec) => sec.items.map((it) => it.id)));
    P.ALL_ITEMS.forEach((it) => {
      if (!asked.has(it.id) || !P.isVisible(it, draft.answers)) return;
      const v = answerValue(it, draft.answers[it.id]);
      if (v !== undefined) answers[it.id] = v;
    });
    // アンケート群：最初の診断で答えた動機づけ傾向12問を、T2のHEX01〜12として使う
    if (onbHex) {
      P.ALL_ITEMS.filter((it) => it.scale === 'HEX').forEach((it) => {
        const v = answerValue(it, onbHex[it.id]);
        if (v !== undefined) answers[it.id] = v;
      });
    }
    const st = (typeof appState !== 'undefined' && appState) ? appState : {};
    if (stage === 'T2') mark('surveySubmit', { overwrite: true });
    return {
      stage: stage === 'T2' ? 'final' : stage,
      participantId: pid,
      entryId: entryId(),
      group,
      condition: CONDITION_LABELS[group] || null,
      itemsVersion: ITEMS_VERSION,
      answers,
      hexSource: onbHex ? 'onboarding' : 'post_survey',
      events: getEvents(),
      hexadResult: st.hexadResult || load(KEYS.hexadResult, null),
      classifyMethod: st.classifyMethod || (group === 'C' ? 'none' : null),
      onboardingAnswers: load(KEYS.onboardingAnswers, null) || (st.answers && Object.keys(st.answers).length ? st.answers : null),
      chatTranscript: load(KEYS.chat, null),
      diagnosisHistory: load(KEYS.diagHistory, []) || [], // やり直す前の診断（古い順）。空なら1回だけ診断
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
    const payload = buildPayload('T2');
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

  // 送信直後：任意の追加プレイの案内（修正版の「任意追加プレイの案内」）
  function renderDone(sec) {
    const P = items();
    const { pid } = participant();
    sec.innerHTML = `
      <div class="card center ps-card">
        <h2>回答を送信しました</h2>
        <p class="lead ps-extra-guide">${esc(P.INSTRUCTIONS.extraPlay)}</p>
        <div class="button-row ps-extra-choice">
          <button type="button" id="btn-play-more" class="btn btn-primary">追加で遊ぶ（最大10分）</button>
          <button type="button" id="btn-finish" class="btn btn-secondary">ここで終了する</button>
        </div>
        ${pid ? `<p class="hint">参加者番号: ${esc(pid)}</p>` : ''}
      </div>`;
    qs('#btn-play-more', sec).addEventListener('click', () => {
      mark('extraPlayChosen');
      closeSurvey();
      if (typeof renderSetup === 'function') renderSetup(); // 各群のスクリプトの関数
      if (typeof showScreen === 'function') showScreen('screen-setup');
    });
    qs('#btn-finish', sec).addEventListener('click', () => renderEnd(sec));
  }

  // 終了：お礼・研究の説明・（任意）AIでタイプ診断してみる
  function openEnd() {
    surveyOpen = true;
    currentStage = null;
    renderEnd(showSurveySection());
  }
  function renderEnd(sec) {
    mark('finished');
    const { pid } = participant();
    sec.innerHTML = `
      <div class="card center ps-card">
        <h2>ご協力ありがとうございました</h2>
        <p class="lead">これで終了です。このページは閉じてかまいません。</p>
        ${pid ? `<p class="hint">参加者番号: ${esc(pid)}</p>` : ''}
        <div class="ps-debrief">
          <h3>この研究について</h3>
          <p>この研究では、ゲームを始める前の「タイプ診断」のやり方（AIとの対話・アンケート・診断なし）によって、ゲームの始めやすさや楽しさがどう変わるかを調べています。参加者によって、診断のやり方が異なります。</p>
          <p><strong>結果に影響するため、これから参加する人には、ゲームやアンケートの内容を話さないようお願いします。</strong></p>
        </div>
        <div class="ps-after">
          <h3>AIでタイプ診断してみる（任意）</h3>
          <p>AIとの短い対話で、あなたのタイプを診断します。診断結果に合わせた画面で、続けて遊べます。研究のデータはすでに送信済みなので、ここからは自由に試してください（研究データには含まれません）。</p>
          <button type="button" id="btn-ai-trial-done" class="btn btn-secondary">AIでタイプ診断する</button>
        </div>
      </div>`;
    const ab = sec.querySelector('#btn-ai-trial-done');
    if (ab) ab.addEventListener('click', () => startAiTrial());
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

  // 参加者番号が入力されるたびに（同じ番号でも）、この端末に残っている記録（プレイ記録・自己ベスト・診断結果・
  // 時刻・アンケートの下書きなど）を消し、新しい「参加ID（entryId）」を発行する。
  // DBへの保存はすべて参加IDつきの追加保存なので、同じ番号が2回使われても、前の記録が上書きされることはない。
  // 未送信のアンケート（pending）は前の参加のデータなので残し、送信を再試行させる。
  const KEEP_ON_RESET = ['gtp_model', KEYS.pending];
  function newId() {
    try { if (crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  // 診断のやり直しを確定したときに呼ぶ：今の診断を履歴に移してから消す（研究データでは最初の診断を主に使う）
  function archiveDiagnosis() {
    snapshotChat();
    const st = (typeof appState !== 'undefined' && appState) ? appState : {};
    const hist = load(KEYS.diagHistory, []) || [];
    hist.push({
      archivedAt: new Date().toISOString(),
      hexadResult: st.hexadResult || load(KEYS.hexadResult, null),
      classifyMethod: st.classifyMethod || null,
      chatTranscript: load(KEYS.chat, null),
      answers: st.answers && Object.keys(st.answers).length ? { ...st.answers } : null,
      gamesBefore: Number(getEvents().n_games_started) || 0,
    });
    save(KEYS.diagHistory, hist);
    bump('n_rediagnose_done');
    try { localStorage.removeItem(KEYS.chat); } catch (e) {}
  }

  // アンケート送信後の「AIでタイプ診断してみる」。どの群でも使える（研究データには含めない）
  // AI対話群（または、すでにAI診断を試している人）は、その場で診断をやり直す。
  // アンケート群・診断なし群は、記録を引き継いでAI対話群の画面に切り替える（ページを読み込み直す）。
  function isAiTrial() { return !!load(KEYS.aiTrial, null); }
  function startAiTrial() {
    if (!isSubmitted()) return;
    const meta = load('gtp_participant_meta', {}) || {};
    const group = meta.group;
    if (group === 'A' || isAiTrial()) {
      if (typeof triggerRediagnose !== 'function') return;
      if (!isAiTrial()) save(KEYS.aiTrial, { from: group, at: new Date().toISOString() });
      surveyOpen = false;
      triggerRediagnose(); // AI対話群のスクリプトの関数（確認 → 対話診断へ）
      return;
    }
    if (!confirm('AIとの対話でタイプを診断します。よろしいですか？\n（これまでのコインや自己ベストなどの記録は残ります）')) return;
    // これまでの記録（コイン・自己ベストなど）をAI対話群の画面に引き継ぐ
    const fromKey = group === 'B' ? 'gtp_so_stats' : 'gtp_nd_stats';
    const st = load(fromKey, null);
    if (st) {
      const prevRes = group === 'B' ? load('gtp_so_hexad_result', null) : { primaryType: 'achiever' };
      st.typeBeforeRediagnose = prevRes && prevRes.primaryType ? prevRes.primaryType : null;
      st.fullTimeStreak = 0; st.rediagnosePromptShown = false;
      save('gtp_stats', st);
    }
    try { localStorage.removeItem('gtp_hexad_result'); } catch (e) {}
    save(KEYS.aiTrial, { from: group, at: new Date().toISOString() });
    location.reload();
  }

  function resetForNewParticipant() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('gtp_') && !KEEP_ON_RESET.includes(k))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    draft = freshDraft();
    surveyOpen = false;
    currentStage = null;
    lastPhase = null;
    const id = newId();
    save(KEYS.entryId, id);
    return id;
  }
  // この端末に残っている前回の参加（番号入力画面で「続きから再開」を出すかどうかの判断に使う）
  function previousEntry() {
    const meta = load(KEYS.participant, null);
    const id = load(KEYS.entryId, null);
    if (!meta || !meta.pid || !id) return null;
    return { pid: String(meta.pid), entryId: id, submitted: !!load(KEYS.submitted, null) };
  }
  // 「続きから再開」を選んだ：同じ参加IDのまま続ける（再開した回数と時刻を記録）
  function markResume() {
    bump('n_resumes');
    mark('lastResume', { overwrite: true });
  }
  // 再開後、前回いた段階に戻す
  function resumeView() {
    const ev = getEvents();
    const clickResume = () => {
      const resumeBtn = document.getElementById('btn-resume-session');
      if (resumeBtn && resumeBtn.style.display !== 'none') resumeBtn.click();
    };
    if (isSubmitted()) { clickResume(); return; }
    if (!ev.t0Submit) { openStage('T0'); return; }
    if (ev.surveyStart || playGated()) { openStage('T2'); return; }
    clickResume();
    if (ev.t1Start && !ev.t1Submit) openStage('T1');
  }

  // 各群のスクリプトが読み込まれた後に呼ぶ（index.html）。
  // アンケートを開いている間に各群のスクリプトが画面を切り替えた場合は、閉じたときに戻る画面として覚えておく。
  function afterLoad(resume) {
    const orig = window.showScreen;
    if (typeof orig === 'function' && !orig.__studyFlow) {
      const wrapped = function (id) {
        if (surveyOpen && id !== 'screen-post-survey') { returnScreen = id; return; }
        return orig.apply(this, arguments);
      };
      wrapped.__studyFlow = true;
      window.showScreen = wrapped;
    }
    if (resume) { resumeView(); return; }
    if (!stageDone('T0') && !isSubmitted()) openStage('T0');
  }

  function entryId() {
    let id = load(KEYS.entryId, null);
    if (!id) { id = newId(); save(KEYS.entryId, id); }
    return id;
  }

  window.StudyFlow = {
    resetForNewParticipant, entryId, previousEntry, markResume, resumeView, afterLoad,
    REQUIRED_PLAY_MS, MAX_PLAY_MS, EXTRA_PLAY_MS,
    mark, bump, getEvents, playState, extraState,
    updatePostgame, openSurvey, openStage, openEnd,
    recordClear, easeFactor, archiveDiagnosis, isSubmitted, isAiTrial, startAiTrial,
  };
})();
