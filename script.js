'use strict';

/* ============================================================
   定数定義
   ============================================================ */

const { HEXAD_ORDER, SURVEY_ITEMS } = SurveyData;

const HEXAD_TYPES = {
  achiever:       { label: '達成者 (Achiever)',       color: '#2a78d6', desc: '目標を達成し、スキルを磨いていくことに強い満足感を得るタイプ。' },
  player:         { label: 'プレイヤー (Player)',      color: '#1baf7a', desc: 'ポイントや報酬など、外的な見返りにモチベーションを感じるタイプ。' },
  socialiser:     { label: '社交家 (Socialiser)',      color: '#eda100', desc: '他者との交流や比較、つながりに価値を置くタイプ。' },
  freeSpirit:     { label: '自由人 (Free Spirit)',     color: '#008300', desc: '自律性と自己表現、自分なりの探求を重視するタイプ。' },
  philanthropist: { label: '利他主義者 (Philanthropist)', color: '#4a3aa7', desc: '見返りを求めず、他者や全体への貢献に意義を感じるタイプ。' },
  disruptor:      { label: '変革者 (Disruptor)',       color: '#e34948', desc: '既存の仕組みに挑戦し、変化を起こすことを好むタイプ。' },
};

const LIKERT_LABELS = ['そう思わない', 'ややそう\n思わない', 'どちらとも\n言えない', 'やや\nそう思う', 'そう思う'];

const CATEGORY_LABELS = { daily: '日常', nature: '自然', motivation: '名言・前向き', proverb: 'ことわざ' };

const SENTENCES = [
  { kanji: '今日は良い天気です',           reading: 'きょうはよいてんきです',           category: 'daily' },
  { kanji: 'お腹が空きました',             reading: 'おなかがすきました',               category: 'daily' },
  { kanji: '学校に行きます',               reading: 'がっこうにいきます',               category: 'daily' },
  { kanji: '友達と遊びました',             reading: 'ともだちとあそびました',           category: 'daily' },
  { kanji: '美味しいご飯を食べる',         reading: 'おいしいごはんをたべる',           category: 'daily' },
  { kanji: '空には星が輝いている',         reading: 'そらにはほしがかがやいている',     category: 'nature' },
  { kanji: '川のせせらぎが心地よい',       reading: 'かわのせせらぎがここちよい',       category: 'nature' },
  { kanji: '桜の花が風に舞う',             reading: 'さくらのはながかぜにまう',         category: 'nature' },
  { kanji: '山の頂上から景色を見る',       reading: 'やまのちょうじょうからけしきをみる', category: 'nature' },
  { kanji: '努力は必ず報われる',           reading: 'どりょくはかならずむくわれる',     category: 'motivation' },
  { kanji: '諦めなければ夢は叶う',         reading: 'あきらめなければゆめはかなう',     category: 'motivation' },
  { kanji: '毎日少しずつ成長しよう',       reading: 'まいにちすこしずつせいちょうしよう', category: 'motivation' },
  { kanji: '笑う門には福来る',             reading: 'わらうかどにはふくきたる',         category: 'proverb' },
  { kanji: '指を動かして文字を打つ',       reading: 'ゆびをうごかしてもじをうつ',       category: 'motivation' },
  { kanji: '正確さと速さの両方が大切',     reading: 'せいかくさとはやさのりょうほうがたいせつ', category: 'motivation' },
  { kanji: '練習すればきっと上達する',     reading: 'れんしゅうすればきっとじょうたつする', category: 'motivation' },
  { kanji: '急がば回れ',                   reading: 'いそがばまわれ',                   category: 'proverb' },
  { kanji: '石の上にも三年',               reading: 'いしのうえにもさんねん',           category: 'proverb' },
  { kanji: '七転び八起き',                 reading: 'ななころびやおき',                 category: 'proverb' },
  { kanji: '新しい世界を探検しよう',       reading: 'あたらしいせかいをたんけんしよう', category: 'motivation' },
  { kanji: '自分だけの道を進もう',         reading: 'じぶんだけのみちをすすもう',       category: 'motivation' },
  { kanji: '誰かの役に立てると嬉しい',     reading: 'だれかのやくにたてるとうれしい',   category: 'motivation' },
  { kanji: '小さな親切が世界を変える',     reading: 'ちいさなしんせつがせかいをかえる', category: 'motivation' },
  { kanji: '電車に乗って出かける',         reading: 'でんしゃにのってでかける',         category: 'daily' },
  { kanji: '洗濯物を干しました',           reading: 'せんたくものをほしました',         category: 'daily' },
  { kanji: '宿題を忘れずにやる',           reading: 'しゅくだいをわすれずにやる',       category: 'daily' },
  { kanji: '電気を消して寝る',             reading: 'でんきをけしてねる',               category: 'daily' },
  { kanji: '財布を忘れないでね',           reading: 'さいふをわすれないでね',           category: 'daily' },
  { kanji: '雨上がりの空に虹が出た',       reading: 'あめあがりのそらににじがでた',     category: 'nature' },
  { kanji: '雪が静かに降り積もる',         reading: 'ゆきがしずかにふりつもる',         category: 'nature' },
  { kanji: '風が涼しく感じられる',         reading: 'かぜがすずしくかんじられる',       category: 'nature' },
  { kanji: '朝日が山から昇る',             reading: 'あさひがやまからのぼる',           category: 'nature' },
  { kanji: '木々の葉が色づき始める',       reading: 'きぎのはがいろづきはじめる',       category: 'nature' },
  { kanji: '一歩ずつ前に進もう',           reading: 'いっぽずつまえにすすもう',         category: 'motivation' },
  { kanji: 'できないことなど何もない',     reading: 'できないことなどなにもない',       category: 'motivation' },
  { kanji: '挑戦することに意味がある',     reading: 'ちょうせんすることにいみがある',   category: 'motivation' },
  { kanji: '継続は力なり',                 reading: 'けいぞくはちからなり',             category: 'motivation' },
  { kanji: '自分を信じて前へ進む',         reading: 'じぶんをしんじてまえへすすむ',     category: 'motivation' },
  { kanji: '猿も木から落ちる',             reading: 'さるもきからおちる',               category: 'proverb' },
  { kanji: '塵も積もれば山となる',         reading: 'ちりもつもればやまとなる',         category: 'proverb' },
  { kanji: '井の中の蛙大海を知らず',       reading: 'いのなかのかわずたいかいをしらず', category: 'proverb' },
  { kanji: '転ばぬ先の杖',                 reading: 'ころばぬさきのつえ',               category: 'proverb' },
  { kanji: '千里の道も一歩から',           reading: 'せんりのみちもいっぽから',         category: 'proverb' },
];

const AVATAR_COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];

const ACHIEVER_BADGES = [
  { count: 1,  name: '見習いタイピスト' },
  { count: 3,  name: '初級タイピスト' },
  { count: 5,  name: '中級タイピスト' },
  { count: 10, name: '上級タイピスト' },
  { count: 20, name: 'マスタータイピスト' },
];

const COIN_UNLOCKS = [
  { coins: 0,    color: '#2a78d6' },
  { coins: 50,   color: '#1baf7a' },
  { coins: 150,  color: '#eda100' },
  { coins: 300,  color: '#008300' },
  { coins: 600,  color: '#4a3aa7' },
  { coins: 1000, color: '#e34948' },
];

const COMMUNITY_GOAL = 5000;

const DISRUPTOR_RULES = {
  speed:    { label: '速さ優先ルール',       calc: (cpm, acc) => Math.round(cpm * 2) },
  accuracy: { label: '正確さ優先ルール',     calc: (cpm, acc) => Math.round(acc * 10) },
  chaos:    { label: 'カオスルール',         calc: (cpm, acc) => Math.round((cpm * acc) / 10) },
};

// セッション設定（全タイプ共通のUI要素）。1回のプレイで複数の文を連続して出題する。
const TIME_OPTIONS = [
  { value: '30', label: '30秒' },
  { value: '60', label: '60秒' },
  { value: '120', label: '120秒' },
  { value: 'none', label: 'タイマーなし' },
];
const DIFFICULTY_OPTIONS = [
  { value: 'random', label: 'おまかせ' },
  { value: 'short', label: '短い文' },
  { value: 'medium', label: '普通' },
  { value: 'long', label: '長い文' },
];
const TYPE_DEFAULT_TIME = { philanthropist: 'none' };

const STORAGE_KEYS = {
  model: 'gtp_model', nickname: 'gtp_nickname',
  stats: 'gtp_stats', log: 'gtp_log',
};

const DEFAULT_STATS = {
  sessionsCompleted: 0,
  totalCorrectChars: 0,
  coins: 0,
  unlockedColors: ['#2a78d6'],
  selectedColor: '#2a78d6',
  leaderboard: [],
  communityTotal: 0,
  freeSpirit: { category: 'random' },
  disruptor: { rule: 'chaos' },
};

/* ============================================================
   かな → ローマ字 変換エンジン
   ============================================================ */

const BASE_KANA = {
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'さ': ['sa'], 'し': ['shi', 'si'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
  'だ': ['da'], 'ぢ': ['ji', 'di'], 'づ': ['zu', 'du'], 'で': ['de'], 'ど': ['do'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  'わ': ['wa'], 'を': ['wo', 'o'],
  'ん': ['n', 'nn'],
};

const YOUON_KANA = {
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'しゃ': ['sha', 'sya'], 'しゅ': ['shu', 'syu'], 'しょ': ['sho', 'syo'],
  'じゃ': ['ja', 'zya'], 'じゅ': ['ju', 'zyu'], 'じょ': ['jo', 'zyo'],
  'ちゃ': ['cha', 'tya'], 'ちゅ': ['chu', 'tyu'], 'ちょ': ['cho', 'tyo'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],
};

function tokenizeReading(reading) {
  const chars = Array.from(reading);
  const tokens = [];
  let i = 0;
  while (i < chars.length) {
    const two = chars[i] + (chars[i + 1] || '');
    if (YOUON_KANA[two]) { tokens.push(two); i += 2; continue; }
    tokens.push(chars[i]); i += 1;
  }
  return tokens;
}

// 「っ」は次の拗音/直音の子音を1文字だけ担当する独立したモーラとして扱う
function buildMoraList(reading) {
  const tokens = tokenizeReading(reading);
  const moras = tokens.map((tok) => {
    if (tok === 'っ') return { kana: tok, options: null, sokuon: true };
    const options = YOUON_KANA[tok] || BASE_KANA[tok] || [tok];
    return { kana: tok, options };
  });
  for (let i = 0; i < moras.length; i++) {
    if (moras[i].sokuon) {
      const next = moras[i + 1];
      let letters = [];
      if (next && next.options) {
        letters = [...new Set(next.options.map((o) => o[0]).filter((ch) => !'aiueo'.includes(ch)))];
      }
      moras[i].options = letters.length ? letters : ['xtsu', 'ltsu'];
      delete moras[i].sokuon;
    }
  }
  return moras;
}

function moraCount(reading) { return buildMoraList(reading).length; }

/* ============================================================
   状態
   ============================================================ */

const appState = {
  nickname: '',
  classifyMethod: 'rule',
  model: 'claude-haiku-4-5-20251001',
  answers: {},
  hexadResult: null,
  setup: {},
};

let game = null;

/* ============================================================
   汎用ユーティリティ
   ============================================================ */

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function showScreen(id) {
  $all('.screen').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATS));
    const parsed = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATS)), parsed);
  } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_STATS)); }
}
function saveStats(stats) { localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats)); }

function getLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.log) || '[]'); } catch (e) { return []; }
}
function appendLog(record) {
  const log = getLog();
  log.push(record);
  localStorage.setItem(STORAGE_KEYS.log, JSON.stringify(log));
  return log;
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
   0. ようこそ画面
   ============================================================ */

function initWelcomeScreen() {
  $('#btn-start-survey-llm').addEventListener('click', () => {
    appState.classifyMethod = 'llm';
    appState.nickname = 'ゲスト';
    localStorage.setItem(STORAGE_KEYS.nickname, appState.nickname);
    renderSurvey();
    showScreen('screen-survey');
  });
}

/* ============================================================
   1. チャット診断画面
   ============================================================ */

let conversationId = "";
let isChatting = false;

function renderSurvey() {
  $('#chat-messages').innerHTML = '';
  conversationId = "";
  appendChatMessage('ai', 'こんにちは！まずはあなたの好きなゲームのジャンルや、ゲームをプレイする目的（例：友達とワイワイ遊ぶ、スコアを極める、ストーリーを楽しむなど）を教えてください！');
  $('#chat-input').value = '';
  $('#btn-chat-send').disabled = false;
}

function appendChatMessage(role, text) {
  const container = $('#chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${role}`;
  msgDiv.textContent = text;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

$('#chat-input').addEventListener('input', (e) => {
  $('#btn-chat-send').disabled = !e.target.value.trim() || isChatting;
});

$('#chat-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !$('#btn-chat-send').disabled) {
    handleChatSend();
  }
});

$('#btn-chat-send').addEventListener('click', handleChatSend);

async function handleChatSend() {
  const input = $('#chat-input');
  const text = input.value.trim();
  if (!text || isChatting) return;

  appendChatMessage('user', text);
  input.value = '';
  $('#btn-chat-send').disabled = true;
  isChatting = true;
  
  // Loading indicator for AI
  const container = $('#chat-messages');
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-message ai loading';
  loadingDiv.textContent = '入力中...';
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: text, conversation_id: conversationId }),
    });
    
    container.removeChild(loadingDiv);
    
    if (!res.ok) {
      let errMsg = `サーバーエラー (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData.error) errMsg += `: ${errorData.error}`;
      } catch (e) {}
      throw new Error(errMsg);
    }
    
    const data = await res.json();
    conversationId = data.conversation_id || conversationId;
    
    const answerText = data.answer || '';
    
    // Check if JSON result is embedded in the response
    const jsonMatch = answerText.match(/\{[\s\S]*"primaryType"[\s\S]*\}/);
    
    if (jsonMatch) {
      // JSON found! Diagnosis is complete.
      let cleanText = answerText.replace(jsonMatch[0], '').trim();
      if (cleanText) appendChatMessage('ai', cleanText);
      
      try {
        const result = JSON.parse(jsonMatch[0]);
        appState.hexadResult = result;
        setTimeout(() => {
          renderResult(result);
          showScreen('screen-result');
        }, 1500); // Wait a bit before transition
      } catch(e) {
        appendChatMessage('ai', '判定結果の解析に失敗しました。もう一度教えていただけますか？');
      }
    } else {
      appendChatMessage('ai', answerText);
    }
  } catch (err) {
    if(container.contains(loadingDiv)) container.removeChild(loadingDiv);
    appendChatMessage('ai', 'エラーが発生しました: ' + err.message);
  } finally {
    isChatting = false;
    $('#btn-chat-send').disabled = !input.value.trim();
    input.focus();
  }
}

/* ============================================================
   3. 判定結果画面
   ============================================================ */

function renderResult(result) {
  const type = HEXAD_TYPES[result.primaryType];
  const badge = $('#result-badge');
  badge.style.background = type.color;
  badge.textContent = type.label;
  $('#result-rationale').textContent = result.rationale || type.desc;

  const chart = $('#result-chart');
  chart.innerHTML = HEXAD_ORDER.map((t) => {
    const score = Math.max(0, Math.min(100, Math.round(result.scores[t] ?? 0)));
    return `
      <div class="bar-row">
        <span class="bar-label">${HEXAD_TYPES[t].label.split(' ')[0]}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${score}%;background:${HEXAD_TYPES[t].color}"></span></span>
        <span class="bar-value">${score}</span>
      </div>`;
  }).join('');
}

$('#btn-goto-setup').addEventListener('click', () => {
  renderSetup();
  showScreen('screen-setup');
});

/* ============================================================
   4. タイプ別セットアップ画面
   ============================================================ */

function renderSetup() {
  const type = appState.hexadResult.primaryType;
  const stats = getStats();
  $('#setup-title').textContent = `練習の準備 — ${HEXAD_TYPES[type].label}`;
  const body = $('#setup-body');

  const builders = {
    achiever: setupAchiever,
    player: setupPlayer,
    socialiser: setupSocialiser,
    freeSpirit: setupFreeSpirit,
    philanthropist: setupPhilanthropist,
    disruptor: setupDisruptor,
  };
  appState.setup = { category: 'random', difficulty: 'random', timeLimit: TYPE_DEFAULT_TIME[type] || '60' };

  body.innerHTML = '<div class="setup-row session-settings"></div><div class="setup-type-body"></div>';
  renderSessionSettings(body.querySelector('.session-settings'), HEXAD_TYPES[type].color);
  builders[type](body.querySelector('.setup-type-body'), stats);
}

function renderSessionSettings(container, color) {
  container.innerHTML = `
    <h3>制限時間</h3>
    ${chipGroup('timeLimit', TIME_OPTIONS, appState.setup.timeLimit)}
    <p class="hint">1回のプレイで、時間内または「終了して結果を見る」を押すまで複数の文を連続して出題します。</p>
    <h3>難易度（文の長さ）</h3>
    ${chipGroup('difficulty', DIFFICULTY_OPTIONS, appState.setup.difficulty)}
  `;
  bindChipGroup(container, 'timeLimit', color, (v) => { appState.setup.timeLimit = v; });
  bindChipGroup(container, 'difficulty', color, (v) => { appState.setup.difficulty = v; });
}

function chipGroup(name, options, selected) {
  return `
    <div class="chip-group" data-chip-group="${name}">
      ${options.map((opt) => `<button type="button" class="chip${opt.value === selected ? ' selected' : ''}" data-value="${opt.value}">${opt.label}</button>`).join('')}
    </div>`;
}
function bindChipGroup(container, name, color, onSelect) {
  const group = container.querySelector(`[data-chip-group="${name}"]`);
  group.querySelectorAll('.chip').forEach((chip) => {
    if (chip.classList.contains('selected')) chip.style.background = color;
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach((c) => { c.classList.remove('selected'); c.style.background = ''; });
      chip.classList.add('selected'); chip.style.background = color;
      onSelect(chip.dataset.value);
    });
  });
}

function setupAchiever(body, stats) {
  const badge = ACHIEVER_BADGES.filter((b) => stats.sessionsCompleted >= b.count).pop();
  const next = ACHIEVER_BADGES.find((b) => stats.sessionsCompleted < b.count);
  body.innerHTML = `
    <p class="lead">達成とスキル向上を積み重ねるモードです。</p>
    <div class="setup-row">
      <h3>現在の称号</h3>
      <p>${badge ? `<strong>${badge.name}</strong>` : 'まだ称号がありません（1回クリアで最初の称号）'}</p>
      ${next ? `<div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (stats.sessionsCompleted / next.count) * 100)}%;background:${HEXAD_TYPES.achiever.color}"></div></div><p class="hint">次の称号「${next.name}」まであと ${next.count - stats.sessionsCompleted} 回クリア</p>` : '<p class="hint">全ての称号を獲得済みです！</p>'}
    </div>
  `;
}

function setupPlayer(body, stats) {
  const nextUnlock = COIN_UNLOCKS.find((u) => stats.coins < u.coins);
  appState.setup.avatarColor = stats.selectedColor;
  body.innerHTML = `
    <p class="lead">タイプするたびにコインが貯まります。コインでアバターカラーを解放しましょう。</p>
    <div class="setup-row">
      <h3>所持コイン</h3>
      <p style="font-size:1.4rem;font-weight:700;">🪙 ${stats.coins}</p>
      ${nextUnlock ? `<p class="hint">次のカラー解放まであと ${nextUnlock.coins - stats.coins} コイン</p>` : '<p class="hint">全カラーを解放済みです！</p>'}
    </div>
    <div class="setup-row">
      <h3>アバターカラー</h3>
      <div class="color-swatch-group">
        ${AVATAR_COLORS.map((c) => `<span class="color-swatch${stats.unlockedColors.includes(c) ? '' : ' locked'}${c === stats.selectedColor ? ' selected' : ''}" data-color="${c}" style="background:${stats.unlockedColors.includes(c) ? c : '#ccc'}; opacity:${stats.unlockedColors.includes(c) ? 1 : 0.35}"></span>`).join('')}
      </div>
    </div>
  `;
  body.querySelectorAll('.color-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      const color = sw.dataset.color;
      if (!stats.unlockedColors.includes(color)) return;
      body.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
      sw.classList.add('selected');
      appState.setup.avatarColor = color;
      const s = getStats(); s.selectedColor = color; saveStats(s);
    });
  });
}

function setupSocialiser(body, stats) {
  const top = stats.leaderboard.slice().sort((a, b) => b.cpm - a.cpm).slice(0, 5);
  body.innerHTML = `
    <p class="lead">他のプレイ記録と競い合いましょう（この端末内のランキングです）。</p>
    <div class="setup-row">
      <h3>ランキング（速度 文字/分）</h3>
      <ul class="leaderboard">
        ${top.length ? top.map((r) => `<li><span>${escapeHtml(r.name)}</span><span>${r.cpm}</span></li>`).join('') : '<li>まだ記録がありません。最初の記録を作りましょう！</li>'}
      </ul>
    </div>
  `;
}

function setupFreeSpirit(body, stats) {
  appState.setup.category = stats.freeSpirit.category;
  appState.setup.avatarColor = stats.selectedColor;
  body.innerHTML = `
    <p class="lead">自分の好きなテーマ・見た目を自由に選んでください(長さや時間は上の設定で調整できます)。</p>
    <div class="setup-row">
      <h3>テーマ</h3>
      ${chipGroup('category', [{ value: 'random', label: 'おまかせ' }, ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))], stats.freeSpirit.category)}
    </div>
    <div class="setup-row">
      <h3>アバターカラー（自由に選択可）</h3>
      <div class="color-swatch-group">
        ${AVATAR_COLORS.map((c) => `<span class="color-swatch${c === stats.selectedColor ? ' selected' : ''}" data-color="${c}" style="background:${c}"></span>`).join('')}
      </div>
    </div>
  `;
  bindChipGroup(body, 'category', HEXAD_TYPES.freeSpirit.color, (v) => {
    appState.setup.category = v;
    const s = getStats(); s.freeSpirit.category = v; saveStats(s);
  });
  body.querySelectorAll('.color-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      body.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
      sw.classList.add('selected');
      appState.setup.avatarColor = sw.dataset.color;
      const s = getStats(); s.selectedColor = sw.dataset.color; saveStats(s);
    });
  });
}

function setupPhilanthropist(body, stats) {
  const pct = Math.min(100, Math.round((stats.communityTotal / COMMUNITY_GOAL) * 100));
  body.innerHTML = `
    <p class="lead">あなたが打った文字数は、みんなで目指す練習目標の達成に積み上がります（この端末内でのシミュレーションです）。</p>
    <div class="setup-row">
      <h3>目標までの貢献度</h3>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${HEXAD_TYPES.philanthropist.color}"></div></div>
      <p class="hint">${stats.communityTotal} / ${COMMUNITY_GOAL} 文字</p>
    </div>
  `;
}

function setupDisruptor(body, stats) {
  appState.setup.rule = stats.disruptor.rule;
  body.innerHTML = `
    <p class="lead">自分でスコアのルールを書き換えられます。既存のやり方にとらわれず、好きなルールを選びましょう。</p>
    <div class="setup-row">
      <h3>スコアルール</h3>
      ${chipGroup('rule', Object.entries(DISRUPTOR_RULES).map(([v, r]) => ({ value: v, label: r.label })), stats.disruptor.rule)}
      <p class="hint">速さ優先＝CPM×2 / 正確さ優先＝正確率×10 / カオス＝CPM×正確率÷10</p>
    </div>
  `;
  bindChipGroup(body, 'rule', HEXAD_TYPES.disruptor.color, (v) => {
    appState.setup.rule = v;
    const s = getStats(); s.disruptor.rule = v; saveStats(s);
  });
}

/* ============================================================
   5. ゲーム本体
   ============================================================ */

function buildSentencePool(category, difficulty) {
  let pool = SENTENCES;
  if (category && category !== 'random') pool = pool.filter((s) => s.category === category);
  if (difficulty && difficulty !== 'random') {
    pool = pool.filter((s) => {
      const n = moraCount(s.reading);
      if (difficulty === 'short') return n <= 10;
      if (difficulty === 'medium') return n > 10 && n <= 15;
      return n > 15;
    });
  }
  return pool.length ? pool : SENTENCES;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 1回のプレイ(セッション)では、制限時間内または手動終了まで複数の文を連続して出題する。
function createSession(pool, timeLimitSec) {
  const session = {
    pool,
    queue: [],
    timeLimitSec,
    sentence: null, moras: [], idx: 0, buffer: '', committed: [],
    totalCorrect: 0, totalMistakes: 0, sentencesCompleted: 0,
    startTime: null, endTime: null, hudTimer: null,
  };
  loadNextSentence(session);
  return session;
}

function loadNextSentence(session) {
  if (!session.queue.length) session.queue = shuffle(session.pool);
  session.sentence = session.queue.pop();
  session.moras = buildMoraList(session.sentence.reading);
  session.idx = 0;
  session.buffer = '';
  session.committed = [];
}

$('#btn-start-game').addEventListener('click', () => startGameFlow());
$('#btn-play-again').addEventListener('click', () => startGameFlow());
$('#btn-back-setup').addEventListener('click', () => { renderSetup(); showScreen('screen-setup'); });
$('#btn-end-session').addEventListener('click', () => { if (game && !game.endTime) finishSession(); });

function startGameFlow() {
  const pool = buildSentencePool(appState.setup.category, appState.setup.difficulty);
  const timeLimitSec = appState.setup.timeLimit === 'none' ? null : Number(appState.setup.timeLimit);
  game = createSession(pool, timeLimitSec);
  renderGame();
  showScreen('screen-game');
}

function onGameKeydown(e) {
  if (!document.getElementById('screen-game').classList.contains('active')) return;
  if (!game || game.endTime) return;
  if (e.key === 'Backspace') { game.buffer = ''; renderGame(); e.preventDefault(); return; }
  if (!/^[a-zA-Z]$/.test(e.key)) return;
  e.preventDefault();
  if (!game.startTime) {
    game.startTime = Date.now();
    game.hudTimer = setInterval(() => { updateHud(); renderSidePanel(); checkTimeUp(); }, 200);
  }
  processChar(e.key.toLowerCase());
  checkTimeUp();
}
document.addEventListener('keydown', onGameKeydown);

function checkTimeUp() {
  if (!game || game.endTime || game.timeLimitSec == null) return;
  if (currentElapsedSec() >= game.timeLimitSec) finishSession();
}

function processChar(ch) {
  const mora = game.moras[game.idx];
  if (!mora) return;
  const tentative = game.buffer + ch;
  const exact = mora.options.find((c) => c === tentative);
  if (exact) {
    game.totalCorrect++;
    game.committed[game.idx] = exact;
    game.idx++;
    game.buffer = '';
    if (game.idx >= game.moras.length) {
      game.sentencesCompleted++;
      triggerSentenceCompleteEffect();
      loadNextSentence(game);
    }
  } else if (mora.options.some((c) => c.startsWith(tentative))) {
    game.buffer = tentative;
    game.totalCorrect++;
  } else {
    game.totalMistakes++;
    const el = $('#game-romaji');
    el.classList.add('mistake-flash');
    setTimeout(() => el.classList.remove('mistake-flash'), 150);
  }
  renderGame();
}

function renderGame() {
  $('#game-kanji').textContent = game.sentence.kanji;
  $('#game-reading').textContent = game.sentence.reading;
  const parts = game.moras.map((m, i) => {
    if (i < game.idx) return `<span class="rj-done">${game.committed[i]}</span>`;
    if (i === game.idx) {
      const preferred = m.options[0];
      const rest = preferred.startsWith(game.buffer) ? preferred.slice(game.buffer.length) : preferred;
      return `<span class="rj-done">${game.buffer}</span><span class="rj-current">${rest}</span>`;
    }
    return `<span class="rj-pending">${m.options[0]}</span>`;
  });
  $('#game-romaji').innerHTML = parts.join('');
  updateHud();
  renderSidePanel();
}

function triggerSentenceCompleteEffect() {
  const el = $('#game-sentence');
  el.classList.remove('sentence-complete-flash');
  void el.offsetWidth; // 再生中でも即座にアニメーションを再スタートさせる
  el.classList.add('sentence-complete-flash');
  setTimeout(() => el.classList.remove('sentence-complete-flash'), 600);

  const pop = document.createElement('div');
  pop.className = 'complete-pop';
  pop.textContent = '✓';
  el.appendChild(pop);
  setTimeout(() => pop.remove(), 700);
}

function currentElapsedSec() { return game.startTime ? (Date.now() - game.startTime) / 1000 : 0; }
function currentCpm() { const el = currentElapsedSec(); return el > 0 ? Math.round((game.totalCorrect / el) * 60) : 0; }
function currentAccuracy() {
  const total = game.totalCorrect + game.totalMistakes;
  return total > 0 ? Math.round((game.totalCorrect / total) * 100) : 100;
}

function updateHud() {
  if (!game) return;
  const type = appState.hexadResult.primaryType;
  const extra = { achiever: hudAchiever, player: hudPlayer, socialiser: hudSocialiser, freeSpirit: hudFreeSpirit, philanthropist: hudPhilanthropist, disruptor: hudDisruptor }[type];
  const elapsed = currentElapsedSec();
  const timeCaption = game.timeLimitSec != null ? '残り時間' : '経過時間';
  const timeValue = game.timeLimitSec != null ? `${Math.max(0, Math.ceil(game.timeLimitSec - elapsed))}秒` : `${elapsed.toFixed(1)}秒`;
  $('#game-hud').innerHTML = `
    <div class="hud-item">${timeCaption}<strong>${timeValue}</strong></div>
    <div class="hud-item">速度<strong>${currentCpm()} 文字/分</strong></div>
    <div class="hud-item">正確率<strong>${currentAccuracy()}%</strong></div>
    <div class="hud-item">完了した文<strong>${game.sentencesCompleted}</strong></div>
    ${extra ? extra() : ''}
  `;
  if (game.endTime && game.hudTimer) { clearInterval(game.hudTimer); game.hudTimer = null; }
}

function hudAchiever() { return `<div class="hud-item">正打数<strong>${game.totalCorrect}</strong></div>`; }
function hudPlayer() { return `<div class="hud-item">獲得コイン<strong>🪙 ${game.totalCorrect}</strong></div>`; }
function hudSocialiser() { const top = getStats().leaderboard[0]; return `<div class="hud-item">目標(1位)<strong>${top ? top.cpm : '-'} 文字/分</strong></div>`; }
function hudFreeSpirit() { return ''; }
function hudPhilanthropist() { const s = getStats(); return `<div class="hud-item">貢献合計<strong>${s.communityTotal + game.totalCorrect} 文字</strong></div>`; }
function hudDisruptor() { return `<div class="hud-item">ルール<strong>${DISRUPTOR_RULES[appState.setup.rule].label}</strong></div>`; }

function renderSidePanel() {
  const type = appState.hexadResult.primaryType;
  const builders = {
    achiever: vizAchiever, player: vizPlayer, socialiser: vizSocialiser,
    freeSpirit: vizFreeSpirit, philanthropist: vizPhilanthropist, disruptor: vizDisruptor,
  };
  $('#game-side-panel').innerHTML = builders[type]();
}

function barRow(label, pct, value, color) {
  return `<div class="bar-row"><span class="bar-label">${label}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.max(0, Math.min(100, pct))}%;background:${color}"></span></span><span class="bar-value">${value}</span></div>`;
}

function computeScore(cpm, acc) { return Math.round((cpm * acc) / 10); }

function vizAchiever() {
  const cpm = currentCpm();
  const acc = currentAccuracy();
  const stars = acc >= 95 && cpm >= 150 ? '★★★' : acc >= 85 ? '★★☆' : '★☆☆';
  const color = HEXAD_TYPES.achiever.color;
  return `
    <p class="hint">今終えた場合の評価</p>
    <p style="font-size:1.3rem;">${stars} <strong style="color:${color};font-size:1.3rem;">${computeScore(cpm, acc)} pt</strong></p>
    ${barRow('速度', (cpm / 300) * 100, `${cpm}`, color)}
    ${barRow('正確率', acc, `${acc}%`, color)}
  `;
}

function vizPlayer() {
  const stats = getStats();
  const projected = stats.coins + game.totalCorrect;
  const next = COIN_UNLOCKS.find((u) => projected < u.coins);
  const pct = next ? (projected / next.coins) * 100 : 100;
  return `
    <p class="hint">🪙 このプレイでの獲得コイン: <strong>${game.totalCorrect}</strong>（合計見込み ${projected}）</p>
    ${barRow(next ? '次の解放' : '全解放済み', pct, `${Math.round(pct)}%`, HEXAD_TYPES.player.color)}
  `;
}

function vizSocialiser() {
  const top = getStats().leaderboard[0];
  const topCpm = top ? top.cpm : 0;
  const mine = currentCpm();
  const scale = Math.max(topCpm, mine, 1);
  return `
    <p class="hint">1位との速度比較（文字/分）</p>
    ${barRow('あなた', (mine / scale) * 100, `${mine}`, HEXAD_TYPES.socialiser.color)}
    ${barRow('1位', (topCpm / scale) * 100, `${topCpm || '-'}`, 'var(--baseline)')}
  `;
}

function vizFreeSpirit() {
  const color = appState.setup.avatarColor || HEXAD_TYPES.freeSpirit.color;
  const trail = Array.from({ length: game.sentencesCompleted }, () => '●').join(' ');
  return `
    <p class="hint" style="color:${color}">● あなたのテーマ: ${CATEGORY_LABELS[appState.setup.category] || 'おまかせ'} / 自分のペースでどうぞ。</p>
    <p style="letter-spacing:6px;color:${color};min-height:1.4em;">${trail}</p>
    <p class="hint">ここまでに打った文字数: <strong style="color:${color};">${game.totalCorrect}</strong></p>
  `;
}

function vizPhilanthropist() {
  const s = getStats();
  const total = s.communityTotal + game.totalCorrect;
  const pct = Math.min(100, Math.round((total / COMMUNITY_GOAL) * 100));
  return `
    <p class="hint">みんなの練習目標への貢献（このプレイで +${game.totalCorrect}）</p>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${HEXAD_TYPES.philanthropist.color}"></div></div>
    <p class="hint">${total} / ${COMMUNITY_GOAL} 文字</p>
  `;
}

function vizDisruptor() {
  const rule = DISRUPTOR_RULES[appState.setup.rule];
  const score = rule.calc(currentCpm(), currentAccuracy());
  return `
    <p class="hint">適用ルール: ${rule.label}</p>
    <p style="font-size:1.8rem;font-weight:700;color:${HEXAD_TYPES.disruptor.color}">${score} pt</p>
  `;
}

function finishSession() {
  if (game.endTime) return;
  game.endTime = Date.now();
  if (game.hudTimer) { clearInterval(game.hudTimer); game.hudTimer = null; }
  const elapsedSec = game.startTime ? (game.endTime - game.startTime) / 1000 : 0;
  const cpm = elapsedSec > 0 ? Math.round((game.totalCorrect / elapsedSec) * 60) : 0;
  const total = game.totalCorrect + game.totalMistakes;
  const accuracy = total > 0 ? Math.round((game.totalCorrect / total) * 100) : 100;
  onGameFinished({
    elapsedSec, cpm, accuracy,
    mistakes: game.totalMistakes,
    correctKeystrokes: game.totalCorrect,
    sentencesCompleted: game.sentencesCompleted,
  });
}

/* ============================================================
   6. 結果画面 & タイプ別ゲーミフィケーション反映
   ============================================================ */

function onGameFinished(result) {
  const type = appState.hexadResult.primaryType;
  const stats = getStats();
  stats.sessionsCompleted++;
  stats.totalCorrectChars += result.correctKeystrokes;
  stats.communityTotal += result.correctKeystrokes;
  stats.coins += result.correctKeystrokes + 20;

  const newUnlocks = COIN_UNLOCKS.filter((u) => stats.coins >= u.coins && !stats.unlockedColors.includes(u.color));
  newUnlocks.forEach((u) => stats.unlockedColors.push(u.color));

  stats.leaderboard.push({ name: appState.nickname, cpm: result.cpm, accuracy: result.accuracy, date: new Date().toISOString() });
  stats.leaderboard = stats.leaderboard.sort((a, b) => b.cpm - a.cpm).slice(0, 20);

  saveStats(stats);

  appendLog({
    timestamp: new Date().toISOString(),
    nickname: appState.nickname,
    hexadType: type,
    hexadScores: appState.hexadResult.scores,
    classifyMethod: appState.hexadResult.method,
    sentenceCategory: appState.setup.category,
    difficulty: appState.setup.difficulty,
    timeLimitSec: game.timeLimitSec,
    sentencesCompleted: result.sentencesCompleted,
    elapsedSec: Number(result.elapsedSec.toFixed(2)),
    cpm: result.cpm,
    accuracy: result.accuracy,
    mistakes: result.mistakes,
    correctKeystrokes: result.correctKeystrokes,
    setupSnapshot: JSON.stringify(appState.setup),
  });

  renderPostgame(result, stats, newUnlocks);
  showScreen('screen-postgame');
}

function renderPostgame(result, stats, newUnlocks) {
  $('#postgame-stats').innerHTML = `
    <div class="stat-tile"><div class="stat-value">${result.elapsedSec.toFixed(1)}秒</div><div class="stat-label">タイム</div></div>
    <div class="stat-tile"><div class="stat-value">${result.cpm}</div><div class="stat-label">文字/分</div></div>
    <div class="stat-tile"><div class="stat-value">${result.accuracy}%</div><div class="stat-label">正確率</div></div>
    <div class="stat-tile"><div class="stat-value">${result.sentencesCompleted}</div><div class="stat-label">完了した文</div></div>
  `;

  const type = appState.hexadResult.primaryType;
  const builders = { achiever: postAchiever, player: postPlayer, socialiser: postSocialiser, freeSpirit: postFreeSpirit, philanthropist: postPhilanthropist, disruptor: postDisruptor };
  $('#postgame-gamification').innerHTML = builders[type](result, stats, newUnlocks);

  $('#log-count').textContent = getLog().length;
}

function postAchiever(result, stats) {
  const badge = ACHIEVER_BADGES.filter((b) => stats.sessionsCompleted >= b.count).pop();
  const next = ACHIEVER_BADGES.find((b) => stats.sessionsCompleted < b.count);
  const stars = result.accuracy >= 95 && result.cpm >= 150 ? '★★★' : result.accuracy >= 85 ? '★★☆' : '★☆☆';
  return `
    <h3>達成度</h3>
    <p style="font-size:1.3rem;">${stars}</p>
    <p>通算クリア回数: <strong>${stats.sessionsCompleted}</strong> 回 / 現在の称号: <strong>${badge ? badge.name : 'なし'}</strong></p>
    ${next ? `<p class="hint">次の称号「${next.name}」まであと ${next.count - stats.sessionsCompleted} 回</p>` : '<p class="hint">全称号を獲得しました！</p>'}
  `;
}
function postPlayer(result, stats, newUnlocks) {
  return `
    <h3>報酬</h3>
    <p>獲得コイン: <strong>+${result.correctKeystrokes + 20}</strong> 🪙（合計 ${stats.coins}）</p>
    ${newUnlocks.length ? `<p class="hint" style="color:${HEXAD_TYPES.player.color}">新しいアバターカラーを解放しました！</p>` : ''}
  `;
}
function postSocialiser(result, stats) {
  const rank = stats.leaderboard.findIndex((r) => r.date && r.cpm === result.cpm && r.name === appState.nickname) + 1;
  const top = stats.leaderboard.slice(0, 5);
  return `
    <h3>ランキング</h3>
    <p>あなたの順位: <strong>${rank || '-'}</strong> 位（この端末内 / 全${stats.leaderboard.length}件）</p>
    <ul class="leaderboard">
      ${top.map((r) => `<li class="${r.name === appState.nickname && r.cpm === result.cpm ? 'me' : ''}"><span>${escapeHtml(r.name)}</span><span>${r.cpm} 文字/分</span></li>`).join('')}
    </ul>
  `;
}
function postFreeSpirit(result) {
  return `
    <h3>探求の記録</h3>
    <p>「${CATEGORY_LABELS[appState.setup.category] || 'おまかせ'}」のテーマで自分らしく取り組みました。</p>
    <p class="hint">気に入ったら次はテーマや長さを変えて、新しい組み合わせを探求してみましょう。</p>
  `;
}
function postPhilanthropist(result, stats) {
  const pct = Math.min(100, Math.round((stats.communityTotal / COMMUNITY_GOAL) * 100));
  return `
    <h3>みんなへの貢献</h3>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${HEXAD_TYPES.philanthropist.color}"></div></div>
    <p class="hint">${stats.communityTotal} / ${COMMUNITY_GOAL} 文字（この端末内のシミュレーションです）</p>
    <p>あなたの練習が、目標達成に近づく力になりました。</p>
  `;
}
function postDisruptor(result) {
  const rule = DISRUPTOR_RULES[appState.setup.rule];
  const score = rule.calc(result.cpm, result.accuracy);
  return `
    <h3>あなたのルールでのスコア</h3>
    <p>適用ルール: <strong>${rule.label}</strong></p>
    <p style="font-size:1.6rem;font-weight:700;color:${HEXAD_TYPES.disruptor.color}">${score} pt</p>
    <p class="hint">既存の採点基準にとらわれず、自分で選んだルールで評価しました。</p>
  `;
}

/* ============================================================
   データエクスポート
   ============================================================ */

$('#btn-export-json').addEventListener('click', () => {
  downloadBlob(`typing_research_log_${Date.now()}.json`, JSON.stringify(getLog(), null, 2), 'application/json');
});

$('#btn-export-csv').addEventListener('click', () => {
  const log = getLog();
  if (!log.length) { alert('記録がありません。'); return; }
  const cols = ['timestamp', 'nickname', 'hexadType', 'classifyMethod', 'sentenceCategory', 'difficulty', 'timeLimitSec', 'sentencesCompleted', 'elapsedSec', 'cpm', 'accuracy', 'mistakes', 'correctKeystrokes'];
  const hexadScoreCols = HEXAD_ORDER.map((t) => `score_${t}`);
  const header = [...cols, ...hexadScoreCols].join(',');
  const rows = log.map((r) => {
    const base = cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`);
    const scores = HEXAD_ORDER.map((t) => r.hexadScores ? (r.hexadScores[t] ?? '') : '');
    return [...base, ...scores].join(',');
  });
  downloadBlob(`typing_research_log_${Date.now()}.csv`, '﻿' + [header, ...rows].join('\n'), 'text/csv');
});

$('#btn-clear-log').addEventListener('click', () => {
  if (confirm('この端末に保存された全てのセッション記録を削除します。よろしいですか？')) {
    localStorage.removeItem(STORAGE_KEYS.log);
    $('#log-count').textContent = '0';
  }
});

/* ============================================================
   初期化
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initWelcomeScreen();
});
