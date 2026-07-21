/* ブラウザ（script.js）とサーバー（server.js）の両方から読み込む共有データ。
   file:// で開かれた場合は window.SurveyData、Node の require() では module.exports として使えるようにする。 */
(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = mod;
  } else {
    root.SurveyData = mod;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const HEXAD_ORDER = ['achiever', 'player', 'socialiser', 'freeSpirit', 'philanthropist', 'disruptor'];

  const SURVEY_ITEMS = [
    { id: 1,  type: 'achiever',       text: '難しい課題を達成すると、強い満足感を得る' },
    { id: 2,  type: 'achiever',       text: '自分のスキルや記録を少しずつ伸ばしていくことに惹かれる' },
    { id: 3,  type: 'player',         text: 'ポイントやバッジなどの報酬がもらえると、もっとやる気が出る' },
    { id: 4,  type: 'player',         text: '何かに取り組むとき、得られる見返りを重視するほうだ' },
    { id: 5,  type: 'socialiser',     text: '一人で取り組むより、他の人と一緒に取り組むほうが楽しい' },
    { id: 6,  type: 'socialiser',     text: '友人や仲間と成果を比べたり、つながったりすることに価値を感じる' },
    { id: 7,  type: 'freeSpirit',     text: '決められた手順より、自分なりのやり方で自由に進めたい' },
    { id: 8,  type: 'freeSpirit',     text: '新しいことを自分のペースで探求するのが好きだ' },
    { id: 9,  type: 'philanthropist', text: '見返りがなくても、誰かの役に立てるなら協力したい' },
    { id: 10, type: 'philanthropist', text: '自分の行動が他の人のためになることに喜びを感じる' },
    { id: 11, type: 'disruptor',      text: '既存のルールややり方を変えてみたいと思うことがよくある' },
    { id: 12, type: 'disruptor',      text: '型にはまらない、人と違うやり方を試すのが好きだ' },
  ];

  function buildClassifySystemPrompt() {
    return [
      'あなたはHexadゲーミフィケーションユーザータイプ理論の専門家です。',
      '6つのユーザータイプ:',
      '- achiever(達成者): 目標達成やスキル向上に強いモチベーションを持つ',
      '- player(プレイヤー): ポイントや報酬などの外的な報酬に動機づけられる',
      '- socialiser(社交家): 他者との交流や関係性に価値を置く',
      '- freeSpirit(自由人): 自律性と自己表現、探求を重視する',
      '- philanthropist(利他主義者): 見返りを求めず他者に貢献することに意義を感じる',
      '- disruptor(変革者): 既存のシステムに挑戦し、変化を起こすことを好む',
      '',
      'ユーザーの12項目・5段階評価の回答を分析し、最も当てはまるタイプを1つ選び、',
      '6タイプそれぞれについて0〜100のスコアを推定してください。',
      '出力は次のJSON形式のみとし、説明文やコードブロックは含めないでください。',
      '{"primaryType":"achiever|player|socialiser|freeSpirit|philanthropist|disruptor","scores":{"achiever":0,"player":0,"socialiser":0,"freeSpirit":0,"philanthropist":0,"disruptor":0},"rationale":"日本語で1〜2文の簡潔な説明"}',
    ].join('\n');
  }

  function buildClassifyUserMessage(answers) {
    const qaText = SURVEY_ITEMS.map((item) => `Q${item.id} [${item.type}] 「${item.text}」→ 回答: ${answers[item.id]}/5`).join('\n');
    return `以下はユーザーの回答です。\n${qaText}\n\n指定のJSON形式のみで出力してください。`;
  }

  return { HEXAD_ORDER, SURVEY_ITEMS, buildClassifySystemPrompt, buildClassifyUserMessage };
});
