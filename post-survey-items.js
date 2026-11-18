/* 本実験のプレイ後アンケート（アプリ内）の設問定義。
   ブラウザ（study-flow.js）とサーバー（api/export.js）の両方から読み込む。
   設問文は「卒業研究 本実験アンケート 項目一覧（修正版）」に準拠。
   ※ 設問の id は集計CSVの列名になるため、本実験の開始後は変更しないこと。 */
(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = mod;
  } else {
    root.PostSurveyItems = mod;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const LIKERT5 = ['全くあてはまらない', 'あまりあてはまらない', 'どちらともいえない', 'ややあてはまる', 'とてもあてはまる'];
  const LIKERT7_ENDS = ['まったくそう思わない', 'とてもそう思う']; // Hexad-12原典の strongly disagree〜strongly agree

  // 条件付きで表示する設問の判定（EXP＝タイピングゲーム経験の有無）
  const IF_EXPERIENCED = { item: 'EXP', equals: 'yes' };
  const IF_NOT_EXPERIENCED = { item: 'EXP', equals: 'no' };

  const SECTIONS = [
    {
      id: 'onboarding',
      title: 'ゲームを始める前について',
      lead: '参加者番号を入力してから、タイピングゲームを始めるまでの手続き（説明・診断など）を思い出して答えてください。ゲームそのものの感想は、次のページで聞きます。',
      items: [
        { id: 'ONB1', scale: 'ONB', type: 'likert5', text: 'ゲーム開始までの手続きは面倒だと感じた' },
        { id: 'ONB2', scale: 'ONB', type: 'likert5', text: 'ゲーム開始までにかかる時間が長いと感じた' },
        { id: 'ONB3', scale: 'ONB', type: 'likert5', text: '開始前の質問ややりとりに答えることが負担だった' },
        { id: 'ONB4', scale: 'ONB', type: 'likert5', text: '開始前の段階で、途中でページを閉じたくなった' },
        { id: 'S1', scale: 'SUP', type: 'likert5', text: '開始前の過程そのものを楽しめた' },
      ],
    },
    {
      id: 'game',
      title: 'ゲームについて',
      lead: 'タイピングゲームをプレイした感想を答えてください。',
      items: [
        { id: 'FIT1', scale: 'FIT', type: 'likert5', text: 'ゲーム内の演出は自分の好みに合っていた' },
        { id: 'FIT2', scale: 'FIT', type: 'likert5', text: 'このゲームは自分に合わせて調整されていると感じた' },
        { id: 'FIT3', scale: 'FIT', type: 'likert5', text: 'ゲーム内の目標や報酬は自分にとって魅力的だった' },
        { id: 'FIT4', scale: 'FIT', type: 'likert5', text: '自分だけのプレイ体験だと感じた' },
        { id: 'ENJ1', scale: 'ENJ', type: 'likert5', text: 'ゲームをプレイするのは楽しかった' },
        { id: 'ENJ2', scale: 'ENJ', type: 'likert5', text: 'プレイ中、ゲームに夢中になっていた' },
        { id: 'ENJ3', scale: 'ENJ', type: 'likert5', text: 'プレイ中、時間がたつのを忘れていた' },
        { id: 'ENJ4', scale: 'ENJ', type: 'likert5', text: '全体として、このゲームに満足した' },
        { id: 'S2', scale: 'SUP', type: 'likert5', text: 'ゲームの操作は分かりやすかった' },
      ],
    },
    {
      id: 'retention',
      title: 'これからの利用について',
      lead: '',
      items: [
        { id: 'EXP', scale: 'BRANCH', type: 'choice', text: 'これまでに、ほかのタイピングゲームやタイピング練習ツールを使ったことがありますか',
          options: [{ value: 'yes', label: 'ある' }, { value: 'no', label: 'ない' }] },
        { id: 'RET1', scale: 'RET', type: 'likert5', text: 'このゲームをまた遊びたいと思う' },
        { id: 'RET2', scale: 'RET', type: 'likert5', text: 'タイピング練習のために、このゲームを続けて使いたいと思う' },
        { id: 'RET3', scale: 'RET', type: 'likert5', text: '機会があれば、自分からこのゲームを再び開くと思う' },
        { id: 'RET4', scale: 'RET', type: 'likert5', text: 'ほかのタイピング練習ツールよりも、このゲームを使いたいと思う', showIf: IF_EXPERIENCED },
        { id: 'CMP1', scale: 'CMP', type: 'choice', text: 'これまでに使ったタイピングゲーム・練習ツールと比べて、このゲームはどうでしたか', showIf: IF_EXPERIENCED,
          options: [
            { value: '1', label: 'かなり劣る' }, { value: '2', label: 'やや劣る' }, { value: '3', label: '同じくらい' },
            { value: '4', label: 'やや優れている' }, { value: '5', label: 'かなり優れている' },
          ] },
        { id: 'CMP2', scale: 'CMP', type: 'text', optional: true, showIf: IF_EXPERIENCED,
          text: 'ほかのタイピングゲーム・練習ツールと比べて、良かった点・物足りなかった点があればお書きください' },
        { id: 'NEW1', scale: 'CMP', type: 'text', showIf: IF_NOT_EXPERIENCED,
          text: 'タイピングゲームを初めて遊んでみて、率直な感想を教えてください（一言でもかまいません）' },
        { id: 'S3', scale: 'SUP', type: 'choice', text: 'このゲームを使うとしたら、どのくらいの頻度で使いたいですか',
          options: [
            { value: 'daily', label: '毎日' }, { value: 'few_week', label: '週に数回' }, { value: 'weekly', label: '週に1回' },
            { value: 'few_month', label: '月に数回' }, { value: 'rarely', label: 'ほとんど使わない' },
          ] },
      ],
    },
    {
      id: 'rediagnosis',
      title: '好みの見直しについて',
      lead: 'このゲームでは、プレイの途中であなたの好みを見直し、演出や目標を変えることができると仮定して答えてください。',
      items: [
        { id: 'RED1', scale: 'RED', type: 'likert5', text: 'プレイの途中で好みを見直す質問があれば、答えてもよいと思う' },
        { id: 'RED2', scale: 'RED', type: 'likert5', text: '見直しの結果がゲームに反映されるなら、定期的に見直したいと思う' },
        { id: 'RED3', scale: 'RED', type: 'likert5', text: '好みを見直す質問に答えることは、負担にならないと思う' },
        { id: 'RED4', scale: 'RED', type: 'likert5', text: '自分の好みに合わせて設定が自動で変わることに抵抗はない' },
        { id: 'S4', scale: 'SUP', type: 'choice', text: '好みの見直し（再診断）は、どのくらいの頻度が望ましいですか',
          options: [
            { value: 'every_play', label: '毎プレイ' }, { value: 'few_plays', label: '数回ごと' }, { value: 'weekly', label: '1週間ごと' },
            { value: 'monthly', label: '1か月ごと' }, { value: 'none', label: '不要' },
          ] },
      ],
    },
    {
      id: 'hexad',
      title: 'あなた自身について',
      lead: 'ゲームに限らず、ふだんのあなた自身について、それぞれの文にどのくらいそう思うかを7段階で答えてください。',
      // Hexad-12（Krath et al., 2023, CHI '23, Table 5）を日本語に訳したもの（研究者訳）。
      // 原文：P1 It makes me happy if I am able to help others. / P4 The well-being of others is important to me.
      //       S2 I like being part of a team. / S4 I enjoy group activities.
      //       F1 It is important to me to follow my own path. / F3 Being independent is important to me.
      //       A2 I like mastering difficult tasks. / A4 I enjoy emerging victorious out of difficult circumstances.
      //       R4 If the reward is sufficient, I will put in the effort. / R2 Rewards are a great way to motivate me.
      //       D3 I see myself as a rebel. / D4 I dislike following rules.
      // 回答は原典どおり7件法（strongly disagree〜strongly agree）。hexadType は集計時のタイプ別平均（2項目ずつ）に使う。
      items: [
        { id: 'HEX01', scale: 'HEX', hexadType: 'philanthropist', type: 'likert7', text: 'ほかの人を助けることができると、うれしい' },
        { id: 'HEX02', scale: 'HEX', hexadType: 'philanthropist', type: 'likert7', text: 'ほかの人が幸せであることは、自分にとって大切だ' },
        { id: 'HEX03', scale: 'HEX', hexadType: 'socialiser', type: 'likert7', text: 'チームの一員であることが好きだ' },
        { id: 'HEX04', scale: 'HEX', hexadType: 'socialiser', type: 'likert7', text: 'グループで活動することを楽しいと感じる' },
        { id: 'HEX05', scale: 'HEX', hexadType: 'freeSpirit', type: 'likert7', text: '自分の道を進むことは、自分にとって大切だ' },
        { id: 'HEX06', scale: 'HEX', hexadType: 'freeSpirit', type: 'likert7', text: '自立していることは、自分にとって大切だ' },
        { id: 'HEX07', scale: 'HEX', hexadType: 'achiever', type: 'likert7', text: '難しい課題を極めるのが好きだ' },
        { id: 'HEX08', scale: 'HEX', hexadType: 'achiever', type: 'likert7', text: '困難な状況を乗り越えて勝ち抜くことを楽しいと感じる' },
        { id: 'HEX09', scale: 'HEX', hexadType: 'player', type: 'likert7', text: '報酬が十分なら、努力する' },
        { id: 'HEX10', scale: 'HEX', hexadType: 'player', type: 'likert7', text: '報酬は、自分のやる気を高めるのにとても効果的だ' },
        { id: 'HEX11', scale: 'HEX', hexadType: 'disruptor', type: 'likert7', text: '自分は反逆者タイプだと思う' },
        { id: 'HEX12', scale: 'HEX', hexadType: 'disruptor', type: 'likert7', text: 'ルールに従うのは好きではない' },
      ],
    },
    {
      id: 'free',
      title: '自由記述',
      lead: 'どれも任意です。思いついたことがあればお書きください。',
      items: [
        { id: 'Q1', scale: 'QUAL', type: 'text', optional: true, text: 'ゲームで良かった点・印象に残った点を自由にお書きください' },
        { id: 'Q2', scale: 'QUAL', type: 'text', optional: true, text: '分かりにくかった点・改善してほしい点を自由にお書きください' },
        { id: 'Q3', scale: 'QUAL', type: 'text', optional: true, text: 'プレイ中、操作や進め方で迷った場面があればお書きください' },
      ],
    },
  ];

  const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

  // 尺度得点（平均）の定義。RET は経験の有無で RET4 の有無が変わるため、全員に共通の RET1〜3 で算出し、
  // RET4 は経験者のみの参考値として別列にする。
  const SCALES = {
    ONB: ['ONB1', 'ONB2', 'ONB3', 'ONB4'],
    FIT: ['FIT1', 'FIT2', 'FIT3', 'FIT4'],
    ENJ: ['ENJ1', 'ENJ2', 'ENJ3', 'ENJ4'],
    RET: ['RET1', 'RET2', 'RET3'],
    RED: ['RED1', 'RED2', 'RED3', 'RED4'],
  };

  function isVisible(item, answers) {
    if (!item.showIf) return true;
    return answers[item.showIf.item] === item.showIf.equals;
  }

  function hasPlaceholders() {
    return ALL_ITEMS.some((i) => String(i.text).startsWith('【要記入】'));
  }

  return { LIKERT5, LIKERT7_ENDS, SECTIONS, ALL_ITEMS, SCALES, isVisible, hasPlaceholders };
});
