/* 本実験のアプリ内アンケートの設問定義。
   ブラウザ（study-flow.js・各群のスクリプト・admin.html）とサーバー（api/_summary.js）の両方から読み込む。
   設問文・選択肢・教示は「中西_アンケート修正版_v1_20261116.xlsx」と「中西_アンケート原案対照.docx」に準拠。
   ※ 設問の id は集計CSVの列名になるため、本実験の開始後は変更しないこと。

   回答時点（stage）
     T0 … 番号入力の直後、群ごとの手続き（診断など）の前（BG1〜4）
     T1 … 群ごとの開始準備を終えた直後、最初のプレイの前（ONB1〜4・S1）
     T2 … 全群共通の最初の10分のプレイの直後、追加プレイを選ぶ前（それ以外すべて）

   群の記号に注意：修正版の資料は A＝診断なし・B＝アンケート・C＝AI対話 だが、
   このアプリのコードは A＝AI対話・B＝アンケート・C＝診断なし。資料の「B・C」＝コードの「A・B」。

   回答は原則必須（記述式の Q1〜3 は任意）。そのため共通教示の「答えたくない設問は空欄のままでかまいません」は削除している。

   回答の値：5件法・7件法は数値（1〜5／1〜7）。得点外の選択肢は次の文字列で保存する。
     DK＝判断できない、NA＝該当しない（ONB3）、NC＝比較できない（RET4） */
(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = mod;
  } else {
    root.PostSurveyItems = mod;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const LIKERT5 = ['全くそう思わない', 'あまりそう思わない', 'どちらともいえない', 'ややそう思う', 'とてもそう思う'];
  const LIKERT7 = ['全く当てはまらない', '当てはまらない', 'あまり当てはまらない', 'どちらともいえない', 'やや当てはまる', '当てはまる', 'とても当てはまる'];
  const LIKERT7_ENDS = [LIKERT7[0], LIKERT7[6]];

  // 得点外の選択肢
  const DK = { value: 'DK', label: '判断できない' };
  const NA_ONB3 = { value: 'NA', label: '該当しない（開始前の質問や対話はなかった）' };
  const NC_RET4 = { value: 'NC', label: '比較できない（ほかのタイピング練習ツールを使ったことがない等）' };
  const SPECIAL_VALUES = ['DK', 'NA', 'NC'];

  // 共通教示・各時点の教示
  const INSTRUCTIONS = {
    common: '各設問について、あなたの感じ方に最も近い回答を1つ選んでください。正解や不正解はありません。判断できない場合は「判断できない」を選んでください。氏名、学籍番号、連絡先など、個人を特定できる情報は記入しないでください。',
    T1: 'いま終えた、ゲームを始めるまでの準備についてお答えください。ここでの準備とは、ゲームの画面内で行った説明の確認、設定、質問への回答や対話などを指します。研究参加の説明や、このアンケートへの回答時間は含めません。',
    T2: '全員共通の最初の10分間のゲームについてお答えください。追加で遊ぶかどうかを選ぶ前に回答してください。',
    rediagnosis: 'ここからは、今後このゲームを利用するときのことを想像してお答えください。プレイの途中に、好みを見直すための短い質問が表示され、その回答を基にゲームの演出や設定が更新される機能を想定してください。今回は、その機能を体験していなくてもかまいません。',
    hexad: '以下は、今回のゲームの評価ではなく、あなたの日頃の考え方や好みについての質問です。各文が、普段の自分にどのくらい当てはまるかをお答えください。',
    extraPlay: 'アンケートは以上です。ここで終了しても、希望する場合に同じゲームを最大10分追加で遊んでもかまいません。どちらを選んでも不利益はありません。追加プレイを選んだ場合も、いつでも終了できます。',
  };

  const STAGES = {
    T0: { label: 'はじめの質問', submitLabel: '回答して次へ進む' },
    T1: { label: '準備についての質問', submitLabel: '回答してゲームへ進む' },
    T2: { label: 'アンケート', submitLabel: '回答を送信する' },
  };

  const SECTIONS = [
    /* ---------- T0 条件別手続き前 ---------- */
    {
      id: 'background', stage: 'T0',
      title: 'はじめに',
      lead: 'ゲームを始める前に、ふだんのパソコンの使い方などについて4つの質問に答えてください。',
      items: [
        { id: 'BG1', scale: 'BG', type: 'choice', text: '普段、パソコンのキーボードで文字を入力する日は、1週間にどのくらいありますか。',
          options: [{ value: '0', label: '0日' }, { value: '1-2', label: '1～2日' }, { value: '3-4', label: '3～4日' }, { value: '5-7', label: '5～7日' }] },
        { id: 'BG2', scale: 'BG', type: 'choice', text: 'パソコンのキーボードでの文字入力は、どのくらい得意ですか。',
          options: [{ value: '1', label: '1 とても苦手' }, { value: '2', label: '2 やや苦手' }, { value: '3', label: '3 どちらともいえない' }, { value: '4', label: '4 やや得意' }, { value: '5', label: '5 とても得意' }] },
        { id: 'BG3', scale: 'BG', type: 'choice', text: '今回の研究で使うタイピングゲームを、これまでに遊んだことがありますか。',
          options: [{ value: 'no', label: 'ない' }, { value: 'yes', label: 'ある' }, { value: 'unknown', label: '分からない' }] },
        { id: 'BG4', scale: 'BG', type: 'choice', text: '共通のゲームとアンケートが終わった後、追加で最大10分遊ぶ時間の余裕はありますか。',
          options: [{ value: 'yes', label: 'ある' }, { value: 'no', label: 'ない' }, { value: 'unknown', label: '今は分からない' }] },
      ],
    },

    /* ---------- T1 開始準備直後 ---------- */
    {
      id: 'onboarding', stage: 'T1',
      title: 'ゲームを始めるまでの準備について',
      lead: INSTRUCTIONS.T1,
      items: [
        { id: 'ONB1', scale: 'ONB', type: 'likert5', text: 'ゲーム開始までの手続きは面倒だと感じた' },
        { id: 'ONB2', scale: 'ONB', type: 'likert5', text: 'ゲーム開始までにかかる時間が長いと感じた' },
        { id: 'ONB3', scale: 'ONB', type: 'likert5', text: '開始前の質問ややりとりに答えることが負担だった', extraOptions: [NA_ONB3] },
        { id: 'ONB4', scale: 'ONB_QUIT', type: 'likert5', text: '開始前の段階で、途中でページを閉じたくなった' },
        { id: 'S1', scale: 'SUP', type: 'likert5', text: '開始前の過程そのものを楽しめた' },
      ],
    },

    /* ---------- T2 共通10分直後 ---------- */
    {
      id: 'game', stage: 'T2',
      title: 'ゲームについて',
      lead: INSTRUCTIONS.T2,
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
      id: 'retention', stage: 'T2',
      title: 'これからの利用について',
      lead: '',
      items: [
        { id: 'RET1', scale: 'RET', type: 'likert5', text: 'このゲームをまた遊びたいと思う' },
        { id: 'RET2', scale: 'RET', type: 'likert5', text: 'タイピング練習のために、このゲームを続けて使いたいと思う' },
        { id: 'RET3', scale: 'RET', type: 'likert5', text: '機会があれば、自分からこのゲームを再び開くと思う' },
        { id: 'RET4', scale: 'RET_CMP', type: 'likert5', text: 'ほかのタイピング練習ツールよりも、このゲームを使いたいと思う', extraOptions: [NC_RET4] },
        { id: 'S3', scale: 'SUP', type: 'choice', text: 'このゲームを使うとしたら、どのくらいの頻度で使いたいですか',
          options: [
            { value: 'daily', label: '毎日' }, { value: 'few_week', label: '週に数回' }, { value: 'weekly', label: '週に1回' },
            { value: 'few_month', label: '月に数回' }, { value: 'rarely', label: 'ほとんど使わない' }, DK,
          ] },
      ],
    },
    {
      id: 'rediagnosis', stage: 'T2',
      title: '好みの見直しについて',
      lead: INSTRUCTIONS.rediagnosis,
      items: [
        { id: 'RED1', scale: 'RED', type: 'likert5', text: 'プレイの途中で好みを見直す質問があれば、答えてもよいと思う' },
        { id: 'RED2', scale: 'RED', type: 'likert5', text: '見直しの結果がゲームに反映されるなら、定期的に見直したいと思う' },
        { id: 'RED3', scale: 'RED', type: 'likert5', text: '好みを見直す質問に答えることは、負担にならないと思う' },
        { id: 'RED4', scale: 'RED', type: 'likert5', text: '自分の好みに合わせて設定が自動で変わることに抵抗はない' },
        { id: 'S4', scale: 'SUP', type: 'choice', text: '好みの見直し（再診断）は、どのくらいの頻度・タイミングで行いたいですか',
          note: '最も望ましいものを1つ選んでください。',
          options: [
            { value: 'every_play', label: '毎プレイ' }, { value: 'few_plays', label: '数回ごと' }, { value: 'weekly', label: '1週間ごと' },
            { value: 'monthly', label: '1か月ごと' }, { value: 'none', label: '不要' }, { value: 'on_demand', label: '自分が希望したときだけ' }, DK,
          ] },
      ],
    },
    {
      id: 'hexad', stage: 'T2',
      title: 'あなた自身について',
      lead: INSTRUCTIONS.hexad,
      // 動機づけ傾向（Hexadを参考）。本研究用の日本語項目（中間発表 2026/10/6 スライド10 から復元）。原典Hexad-12の項目とは同一ではない。
      // hexadType は方向ごとの平均（2問ずつ）に使う。12問の合計点は作らない。
      items: [
        { id: 'HEX01', scale: 'HEX', hexadType: 'philanthropist', type: 'likert7', text: '他の人々を助けたり、貢献することに大きな意義を感じる。' },
        { id: 'HEX02', scale: 'HEX', hexadType: 'philanthropist', type: 'likert7', text: '見返りがなくても、誰かの役に立つ行動をとることが好きだ。' },
        { id: 'HEX03', scale: 'HEX', hexadType: 'socialiser', type: 'likert7', text: '他のユーザーや仲間と繋がり、交流やコミュニケーションを楽しむ。' },
        { id: 'HEX04', scale: 'HEX', hexadType: 'socialiser', type: 'likert7', text: 'グループやコミュニティの一員として協力して活動したい。' },
        { id: 'HEX05', scale: 'HEX', hexadType: 'freeSpirit', type: 'likert7', text: '自分の好きなように自由に探索し、行動できる環境を好む。' },
        { id: 'HEX06', scale: 'HEX', hexadType: 'freeSpirit', type: 'likert7', text: '定められたルールに縛られず、自分なりのスタイルを追求したい。' },
        { id: 'HEX07', scale: 'HEX', hexadType: 'achiever', type: 'likert7', text: '困難な課題に挑み、自分の力でクリアした時に達成感を得る。' },
        { id: 'HEX08', scale: 'HEX', hexadType: 'achiever', type: 'likert7', text: '自分のスキルや能力が向上していることを実感したい。' },
        { id: 'HEX09', scale: 'HEX', hexadType: 'player', type: 'likert7', text: 'ポイント、報酬、バッジなどを獲得するために努力できる。' },
        { id: 'HEX10', scale: 'HEX', hexadType: 'player', type: 'likert7', text: '明確なインセンティブや特典が得られる活動に最もモチベーションを感じる。' },
        { id: 'HEX11', scale: 'HEX', hexadType: 'disruptor', type: 'likert7', text: '既存のやり方やルールに疑問を持ち、変化を起こすことが好きだ。' },
        { id: 'HEX12', scale: 'HEX', hexadType: 'disruptor', type: 'likert7', text: '従来の枠組みを破ったり、誰も試していない方法を試したい。' },
      ],
    },
    {
      id: 'free', stage: 'T2',
      title: '自由記述',
      lead: 'どれも任意です。氏名や連絡先など、個人を特定できる情報は書かないでください。',
      items: [
        { id: 'Q1', scale: 'QUAL', type: 'text', optional: true, text: 'ゲームで良かった点・印象に残った点を自由にお書きください' },
        { id: 'Q2', scale: 'QUAL', type: 'text', optional: true, text: '分かりにくかった点・改善してほしい点を自由にお書きください' },
        { id: 'Q3', scale: 'QUAL', type: 'text', optional: true, text: 'プレイ中、操作や進め方で迷った場面があればお書きください' },
      ],
    },
  ];

  const ALL_ITEMS = SECTIONS.flatMap((s) => s.items.map((it) => ({ ...it, stage: s.stage })));

  // 設問の選択肢（数値＋得点外）を、表示用の {value, label} の配列で返す
  function optionsOf(item) {
    if (item.type === 'likert5') return [...LIKERT5.map((l, i) => ({ value: String(i + 1), label: `${i + 1} ${l}` })), DK, ...(item.extraOptions || [])];
    if (item.type === 'likert7') return [...LIKERT7.map((l, i) => ({ value: String(i + 1), label: `${i + 1} ${l}` })), DK, ...(item.extraOptions || [])];
    return item.options || [];
  }
  function labelOf(item, value) {
    if (value === undefined || value === null || value === '') return '';
    const o = optionsOf(item).find((x) => x.value === String(value));
    return o ? o.label : String(value);
  }
  // 得点として使える値か（得点外の DK・NA・NC や空欄は false）
  function isScored(v) {
    return typeof v === 'number' && Number.isFinite(v);
  }

  /* 得点化の定義（修正版の「集計方法」列）
     - requireAll：指定した項目が全て有効（数値）な場合だけ平均する
     - groups：得点を出す群（コード上の記号）。ONB は資料の「B・C」＝コードの A（AI対話）・B（アンケート）のみ。
       診断なし群（コード C）は ONB1〜3 を項目別に扱う。
     FIT・ENJ・RED は総合平均を作らず、項目別に集計する（主指標にしない／自動的に合算しない）。
     RET4 は比較できる人の項目別集計で、RET 平均から除外。ONB4 は単項目。 */
  const SCORES = [
    { id: 'ONB_mean', items: ['ONB1', 'ONB2', 'ONB3'], requireAll: true, groups: ['A', 'B'] },
    { id: 'RET_mean', items: ['RET1', 'RET2', 'RET3'], requireAll: true },
  ];

  function isVisible(item, answers) {
    if (!item.showIf) return true;
    return answers[item.showIf.item] === item.showIf.equals;
  }

  function hasPlaceholders() {
    return ALL_ITEMS.some((i) => String(i.text).startsWith('【要記入】'));
  }

  return {
    LIKERT5, LIKERT7, LIKERT7_ENDS, DK, SPECIAL_VALUES, INSTRUCTIONS, STAGES, SECTIONS, ALL_ITEMS, SCORES,
    optionsOf, labelOf, isScored, isVisible, hasPlaceholders,
  };
});
