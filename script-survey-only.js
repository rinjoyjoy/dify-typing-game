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

function updateThemeColor() {
  if (appState && appState.hexadResult && appState.hexadResult.primaryType) {
    const t = appState.hexadResult.primaryType;
    const color = (appState.setup && appState.setup.avatarColor) ? appState.setup.avatarColor : HEXAD_TYPES[t].color;
    document.documentElement.style.setProperty('--theme-color', color);
  }
}

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
  { kanji: '朝早く起きて散歩する', reading: 'あさはやくおきてさんぽする', category: 'daily' },
  { kanji: 'コーヒーを飲んで一息つく', reading: 'こーひーをのんでひといきつく', category: 'daily' },
  { kanji: '郵便局に荷物を持っていく', reading: 'ゆうびんきょくににもつをもっていく', category: 'daily' },
  { kanji: '近くのスーパーで買い物をする', reading: 'ちかくのすーぱーでかいものをする', category: 'daily' },
  { kanji: '部屋の掃除をしてスッキリする', reading: 'へやのそうじをしてすっきりする', category: 'daily' },
  { kanji: '洗濯物を畳んでタンスにしまう', reading: 'せんたくものをたたんでたんすにしまう', category: 'daily' },
  { kanji: '友達とランチの約束がある', reading: 'ともだちとらんちのやくそくがある', category: 'daily' },
  { kanji: '新しい靴を履いて出かける', reading: 'あたらしいくつをはいてでかける', category: 'daily' },
  { kanji: '電車で座れてラッキーだった', reading: 'でんしゃですわれてらっきーだった', category: 'daily' },
  { kanji: '帰り道に綺麗な夕日を見た', reading: 'かえりみちにきれいなゆうひをみた', category: 'daily' },
  { kanji: '今日は早く寝て明日に備える', reading: 'きょうははやくねてあしたにそなえる', category: 'daily' },
  { kanji: '週末は映画館に行きたい', reading: 'しゅうまつはえいがかんにいきたい', category: 'daily' },
  { kanji: 'お風呂に入ってリラックスする', reading: 'おふろにはいってりらっくすする', category: 'daily' },
  { kanji: '寝る前に本を少し読む', reading: 'ねるまえにほんをすこしよむ', category: 'daily' },
  { kanji: '目覚まし時計が鳴る前に起きた', reading: 'めざましどけいがなるまえにおきた', category: 'daily' },
  { kanji: '朝ごはんをしっかり食べる', reading: 'あさごはんをしっかりたべる', category: 'daily' },
  { kanji: '歯磨きをして顔を洗う', reading: 'はみがきをしてかおをあらう', category: 'daily' },
  { kanji: '鍵をかけたか確認する', reading: 'かぎをかけたかかくにんする', category: 'daily' },
  { kanji: '傘を持っていくか迷う', reading: 'かさをもっていくかまよう', category: 'daily' },
  { kanji: 'カレンダーの予定をチェックする', reading: 'かれんだーのよていをちぇっくする', category: 'daily' },
  { kanji: 'スマホの充電が切れそうだ', reading: 'すまほのじゅうでんがきれそうだ', category: 'daily' },
  { kanji: '冷蔵庫の中に牛乳がない', reading: 'れいぞうこのなかにぎゅうにゅうがない', category: 'daily' },
  { kanji: 'テレビのニュースをボーッと見る', reading: 'てれびのにゅーすをぼーっとみる', category: 'daily' },
  { kanji: '好きな音楽を聴きながら歩く', reading: 'すきなおんがくをききながらあるく', category: 'daily' },
  { kanji: '靴紐がほどけてしまった', reading: 'くつひもがほどけてしまった', category: 'daily' },
  { kanji: '窓を開けて換気をする', reading: 'まどをあけてかんきをする', category: 'daily' },
  { kanji: 'ゴミ出しの日を間違えた', reading: 'ごみだしのひをまちがえた', category: 'daily' },
  { kanji: '新しいレシピに挑戦する', reading: 'あたらしいれしぴにちょうせんする', category: 'daily' },
  { kanji: 'コンビニでスイーツを買う', reading: 'こんびにですいーつをかう', category: 'daily' },
  { kanji: 'お茶を淹れてホッと一息', reading: 'おちゃをいれてほっとひといき', category: 'daily' },
  { kanji: '机の上を綺麗に片付ける', reading: 'つくえのうえをきれいにかたづける', category: 'daily' },
  { kanji: '郵便受けに手紙が入っていた', reading: 'ゆうびんうけにてがみがはいっていた', category: 'daily' },
  { kanji: '近所の人とすれ違って挨拶した', reading: 'きんじょのひととすれちがってあいさつした', category: 'daily' },
  { kanji: '階段を上ると息が切れる', reading: 'かいだんをのぼるといきがきれる', category: 'daily' },
  { kanji: '信号が青に変わるのを待つ', reading: 'しんごうがあおにかわるのをまつ', category: 'daily' },
  { kanji: '横断歩道を急いで渡る', reading: 'おうだんほどうをいそいでわたる', category: 'daily' },
  { kanji: 'バスが時間通りに来ない', reading: 'ばすがじかんどおりにこない', category: 'daily' },
  { kanji: '手帳にメモを書き留める', reading: 'てちょうにめもをかきとめる', category: 'daily' },
  { kanji: 'ふとした瞬間にアイデアが浮かぶ', reading: 'ふとしたしゅんかんにあいであがうかぶ', category: 'daily' },
  { kanji: '今日も一日お疲れ様でした', reading: 'きょうもいちにちおつかれさまでした', category: 'daily' },
  { kanji: '庭の草むしりをする', reading: 'にわのくさむしりをする', category: 'daily' },
  { kanji: '久しぶりに友達に電話した', reading: 'ひさしぶりにともだちのでんわした', category: 'daily' },
  { kanji: '銀行でお金をおろす', reading: 'ぎんこうでおかねをおろす', category: 'daily' },
  { kanji: '青空に白い雲が浮かんでいる', reading: 'あおぞらにしろいくもがうかんでいる', category: 'nature' },
  { kanji: '海辺で波の音を聞く', reading: 'うみべでなみのおとをきく', category: 'nature' },
  { kanji: '森の中で深呼吸をする', reading: 'もりのなかでしんこきゅうをする', category: 'nature' },
  { kanji: '夜空に流れ星を見つけた', reading: 'よぞらにながれぼしをみつけた', category: 'nature' },
  { kanji: '秋の紅葉が美しく色づく', reading: 'あきのこうようがうつくしくいろづく', category: 'nature' },
  { kanji: '春風が優しく頬を撫でる', reading: 'はるかぜがやさしくほおをなでる', category: 'nature' },
  { kanji: '夏のセミの鳴き声が響く', reading: 'なつのせみのなきごえがひびく', category: 'nature' },
  { kanji: '冬の冷たい空気が澄んでいる', reading: 'ふゆのつめたいくうきがすんでいる', category: 'nature' },
  { kanji: '小鳥のさえずりで目が覚める', reading: 'ことりのさえずりでめがさめる', category: 'nature' },
  { kanji: '夕暮れのグラデーションが綺麗だ', reading: 'ゆうぐれのぐらでーしょんがきれいだ', category: 'nature' },
  { kanji: '満月の光が海面を照らす', reading: 'まんげつのひかりがかいめんをてらす', category: 'nature' },
  { kanji: '朝露が葉っぱの上で光る', reading: 'あさつゆがはっぱのうえでひかる', category: 'nature' },
  { kanji: '遠くの山々が霞んで見える', reading: 'とおくのやまやまがかすんでみえる', category: 'nature' },
  { kanji: '砂浜に貝殻が落ちている', reading: 'すなはまにかいがらがおちている', category: 'nature' },
  { kanji: '滝のマイナスイオンを浴びる', reading: 'たきのまいなすいおんをあびる', category: 'nature' },
  { kanji: '虹の橋が空にかかっている', reading: 'にじのはしがそらにかかっている', category: 'nature' },
  { kanji: '風に揺れるススキの穂', reading: 'かぜにゆれるすすきのほ', category: 'nature' },
  { kanji: 'ひまわりが太陽の方を向く', reading: 'ひまわりがたいようのほうをむく', category: 'nature' },
  { kanji: '蛍の光が幻想的に舞う', reading: 'ほたるのひかりがげんそうてきにまう', category: 'nature' },
  { kanji: '雪の結晶が手のひらに落ちる', reading: 'ゆきのけっしょうがてのひらにおちる', category: 'nature' },
  { kanji: '川底の石が透き通って見える', reading: 'かわぞこのいしがすきとおってみえる', category: 'nature' },
  { kanji: '静かな湖畔でキャンプをする', reading: 'しずかなこはんできゃんぷをする', category: 'nature' },
  { kanji: '波打ち際でカニを見つける', reading: 'なみうちぎわでかにをみつける', category: 'nature' },
  { kanji: '木漏れ日が地面に模様を描く', reading: 'こもれびがじめんにもようをえがく', category: 'nature' },
  { kanji: 'ふかふかの落ち葉を踏んで歩く', reading: 'ふかふかのおちばをふんであるく', category: 'nature' },
  { kanji: '夕立のあとの匂いがする', reading: 'ゆうだちのあとのにおいがする', category: 'nature' },
  { kanji: '夜露に濡れた草花', reading: 'よつゆにぬれたくさばな', category: 'nature' },
  { kanji: '大自然の力強さを感じる', reading: 'だいしぜんのちからづよさをかんじる', category: 'nature' },
  { kanji: 'どこまでも続く広い海', reading: 'どこまでもつづくひろいうみ', category: 'nature' },
  { kanji: '山頂からの眺めは最高だ', reading: 'さんちょうからのながめはさいこうだ', category: 'nature' },
  { kanji: '野生の動物と遭遇した', reading: 'やせいのどうぶつとそうぐうした', category: 'nature' },
  { kanji: '星空を見上げて星座を探す', reading: 'ほしぞらをみあげてせいざをさがす', category: 'nature' },
  { kanji: '雷の音が遠くで鳴っている', reading: 'かみなりのおとがとおくでなっている', category: 'nature' },
  { kanji: '冷たい湧き水でのどを潤す', reading: 'つめたいわきみずでのどをうるおす', category: 'nature' },
  { kanji: '霧が晴れて景色が現れる', reading: 'きりがはれてけしきがあらわれる', category: 'nature' },
  { kanji: '自然の摂理に思いを馳せる', reading: 'しぜんのせつりにおもいをはせる', category: 'nature' },
  { kanji: '潮の満ち引きを観察する', reading: 'しおのみちひきをかんさつする', category: 'nature' },
  { kanji: '四季の移ろいを楽しむ', reading: 'しきのうつろいをたのしむ', category: 'nature' },
  { kanji: '緑豊かな公園を散策する', reading: 'みどりゆたかなこうえんをさんさくする', category: 'nature' },
  { kanji: '夕日が沈む海を眺める', reading: 'ゆうひがしずむうみをながめる', category: 'nature' },
  { kanji: '鳥が群れをなして飛んでいく', reading: 'とりがむれをなしてとんでいく', category: 'nature' },
  { kanji: '雨水が葉からこぼれ落ちる', reading: 'あまみずがはからこぼれおちる', category: 'nature' },
  { kanji: '失敗は成功のもとである', reading: 'しっぱいはせいこうのもとである', category: 'motivation' },
  { kanji: '一歩踏み出す勇気を持とう', reading: 'いっぽふみだすゆうきをもとう', category: 'motivation' },
  { kanji: '昨日の自分より今日の自分', reading: 'きのうのじぶんよりきょうのじぶん', category: 'motivation' },
  { kanji: 'ピンチはチャンスに変わる', reading: 'ぴんちはちゃんすにかわる', category: 'motivation' },
  { kanji: '自分のペースで進めばいい', reading: 'じぶんのぺーすですすめばいい', category: 'motivation' },
  { kanji: '小さな成功を積み重ねる', reading: 'ちいさなせいこうをつみかさねる', category: 'motivation' },
  { kanji: '未来は自分の手で切り開く', reading: 'みらいはじぶんのてできりひらく', category: 'motivation' },
  { kanji: '笑顔が幸運を引き寄せる', reading: 'えがおがこううんをひきよせる', category: 'motivation' },
  { kanji: '限界を決めるのは自分自身だ', reading: 'げんかいをきめるのはじぶんじしんだ', category: 'motivation' },
  { kanji: '逆境をバネにして高く跳ぶ', reading: 'ぎゃっきょうをばねにしてたかくとぶ', category: 'motivation' },
  { kanji: '何度でも立ち上がればいい', reading: 'なんどでもたちあがればいい', category: 'motivation' },
  { kanji: '周りと比べる必要はない', reading: 'まわりとくらべるひつようはない', category: 'motivation' },
  { kanji: '楽しむ心を忘れないで', reading: 'たのしむこころをわすれないで', category: 'motivation' },
  { kanji: 'ポジティブな言葉を使おう', reading: 'ぽじてぃぶなことばをつかおう', category: 'motivation' },
  { kanji: '感謝の気持ちが原動力になる', reading: 'かんしゃのきもちがげんどうりょくになる', category: 'motivation' },
  { kanji: '誰にでも輝ける場所がある', reading: 'だれにでもかがやけるばしょがある', category: 'motivation' },
  { kanji: '迷った時はワクワクする方へ', reading: 'まよったときはわくわくするほうへ', category: 'motivation' },
  { kanji: '今日の努力が明日を作る', reading: 'きょうのどりょくがあしたをつくる', category: 'motivation' },
  { kanji: '思い立ったが吉日', reading: 'おもいたったがきちじつ', category: 'motivation' },
  { kanji: '自分を褒めてあげよう', reading: 'じぶんをほめてあげよう', category: 'motivation' },
  { kanji: '新しい景色を見に行こう', reading: 'あたらしいけしきをみにいこう', category: 'motivation' },
  { kanji: '全ては自分次第で変えられる', reading: 'すべてはじぶんしだいでかえられる', category: 'motivation' },
  { kanji: '可能性は無限大に広がっている', reading: 'かのうせいはむげんだいにひろがっている', category: 'motivation' },
  { kanji: 'まずはやってみることが大事', reading: 'まずはやってみることがだいじ', category: 'motivation' },
  { kanji: '心に余裕を持つことが大切', reading: 'こころによゆうをもつことがたいせつ', category: 'motivation' },
  { kanji: 'どんな経験も無駄にはならない', reading: 'どんなけいけんもむだにはならない', category: 'motivation' },
  { kanji: '自分らしさを大切にしよう', reading: 'じぶんらしさをたいせつにしよう', category: 'motivation' },
  { kanji: '目の前のことに全力を尽くす', reading: 'めのまえのことにぜんりょくをつくす', category: 'motivation' },
  { kanji: '夢に向かって一直線に走る', reading: 'ゆめにむかっていっちょくせんにはしる', category: 'motivation' },
  { kanji: '焦らず自分のタイミングで', reading: 'あせらずじぶんのたいみんぐで', category: 'motivation' },
  { kanji: '信じる力が奇跡を起こす', reading: 'しんじるちからがきせきをおこす', category: 'motivation' },
  { kanji: '変化を恐れず受け入れよう', reading: 'へんかをおそれずうけいれよう', category: 'motivation' },
  { kanji: '心の声に耳を傾ける', reading: 'こころのこえにみみをかたむける', category: 'motivation' },
  { kanji: '情熱を持って取り組もう', reading: 'じょうねつをもってとりくもう', category: 'motivation' },
  { kanji: '毎日が新しいスタートだ', reading: 'まいにちがあたらしいすたーとだ', category: 'motivation' },
  { kanji: '他人を変えるより自分が変わる', reading: 'たにんをかえるよりじぶんがかわる', category: 'motivation' },
  { kanji: '小さなひらめきを大切に', reading: 'ちいさなひらめきをたいせつに', category: 'motivation' },
  { kanji: 'やりたいことには全部挑戦する', reading: 'やりたいことにはぜんぶちょうせんする', category: 'motivation' },
  { kanji: '自分の人生の主人公になろう', reading: 'じぶんのじんせいのしゅじんこうになろう', category: 'motivation' },
  { kanji: '強い意志が道を切り開く', reading: 'つよいいしがみちをきりひらく', category: 'motivation' },
  { kanji: 'やればできると信じる', reading: 'やればできるとしんじる', category: 'motivation' },
  { kanji: '諦めない心が一番の武器', reading: 'あきらめないこころがいちばんのぶき', category: 'motivation' },
  { kanji: '豚に真珠', reading: 'ぶたにしんじゅ', category: 'proverb' },
  { kanji: '猫に小判', reading: 'ねこにこばん', category: 'proverb' },
  { kanji: '馬の耳に念仏', reading: 'うまのみみにねんぶつ', category: 'proverb' },
  { kanji: '花より団子', reading: 'はなよりだんご', category: 'proverb' },
  { kanji: '棚からぼたもち', reading: 'たなからぼたもち', category: 'proverb' },
  { kanji: '泣きっ面に蜂', reading: 'なきっつらにはち', category: 'proverb' },
  { kanji: '二度あることは三度ある', reading: 'にどあることはさんどある', category: 'proverb' },
  { kanji: '石橋を叩いて渡る', reading: 'いしばしをたたいてわたる', category: 'proverb' },
  { kanji: '蛙の子は蛙', reading: 'かえるのこはかえる', category: 'proverb' },
  { kanji: '河童の川流れ', reading: 'かっぱのかわながれ', category: 'proverb' },
  { kanji: '弘法にも筆の誤り', reading: 'こうぼうにもふでのあやまり', category: 'proverb' },
  { kanji: 'どんぐりの背比べ', reading: 'どんぐりのせいくらべ', category: 'proverb' },
  { kanji: '百聞は一見に如かず', reading: 'ひゃくぶんはいっけんにしかず', category: 'proverb' },
  { kanji: '三つ子の魂百まで', reading: 'みつごのたましいひゃくまで', category: 'proverb' },
  { kanji: 'ローマは一日にして成らず', reading: 'ろーまはいちにちにしてならず', category: 'proverb' },
  { kanji: '時は金なり', reading: 'ときはかねなり', category: 'proverb' },
  { kanji: 'ちりも積もれば山となる', reading: 'ちりもつもればやまとなる', category: 'proverb' },
  { kanji: '早起きは三文の徳', reading: 'はやおきはさんもんのとく', category: 'proverb' },
  { kanji: '情けは人の為ならず', reading: 'なさけはひとのためならず', category: 'proverb' },
  { kanji: '火のない所に煙は立たぬ', reading: 'ひのないところにけむりはたたぬ', category: 'proverb' },
  { kanji: '壁に耳あり障子に目あり', reading: 'かべにみみありしょうじにめあり', category: 'proverb' },
  { kanji: '類は友を呼ぶ', reading: 'るいはともをよぶ', category: 'proverb' },
  { kanji: '郷に入っては郷に従え', reading: 'ごうにいってはごうにしたがえ', category: 'proverb' },
  { kanji: '鉄は熱いうちに打て', reading: 'てつはあついうちにうて', category: 'proverb' },
  { kanji: '覆水盆に返らず', reading: 'ふくすいぼんにかえらず', category: 'proverb' },
  { kanji: '一期一会', reading: 'いちごいちえ', category: 'proverb' },
  { kanji: '温故知新', reading: 'おんこちしん', category: 'proverb' },
  { kanji: '十人十色', reading: 'じゅうにんといろ', category: 'proverb' },
  { kanji: '以心伝心', reading: 'いしんでんしん', category: 'proverb' },
  { kanji: '臨機応変', reading: 'りんきおうへん', category: 'proverb' },
  { kanji: '一石二鳥', reading: 'いっせきにちょう', category: 'proverb' },
  { kanji: '急いては事を仕損じる', reading: 'せいてはことをしそんじる', category: 'proverb' },
  { kanji: '後悔先に立たず', reading: 'こうかいさきにたたず', category: 'proverb' },
  { kanji: '良薬は口に苦し', reading: 'りょうやくはくちににがし', category: 'proverb' },
  { kanji: '悪事千里を走る', reading: 'あくじせんりをはしる', category: 'proverb' },
  { kanji: '光陰矢の如し', reading: 'こういんやのごとし', category: 'proverb' },
  { kanji: '初心忘るべからず', reading: 'しょしんわするべからず', category: 'proverb' },
  { kanji: '案ずるより産むが易し', reading: 'あんずるよりうむがやすし', category: 'proverb' },
  { kanji: '鬼に金棒', reading: 'おにのかなぼう', category: 'proverb' },
  { kanji: '灯台下暗し', reading: 'とうだいもとくらし', category: 'proverb' },
  { kanji: '親しき中にも礼儀あり', reading: 'したしきなかにもれいぎあり', category: 'proverb' },
  { kanji: '口は災いの元', reading: 'くちはわざわいのもと', category: 'proverb' },
];

const AVATAR_COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];

const ACHIEVER_BADGES = [
  { count: 1,  name: '見習いタイピスト' },
  { count: 3,  name: '初級タイピスト' },
  { count: 5,  name: '中級タイピスト' },
  { count: 10, name: '上級タイピスト' },
  { count: 20, name: 'マスタータイピスト' },
];

// アバターカラーの購入価格リスト（コインを消費して購入する。AVATAR_COLORSの全色に対応）
const COLOR_SHOP = [
  { coins: 0,    color: '#2a78d6' },
  { coins: 50,   color: '#1baf7a' },
  { coins: 150,  color: '#eda100' },
  { coins: 300,  color: '#008300' },
  { coins: 600,  color: '#4a3aa7' },
  { coins: 1000, color: '#e34948' },
  { coins: 1500, color: '#e87ba4' },
  { coins: 2000, color: '#eb6834' },
];

const COMMUNITY_GOAL = 5000;

const DISRUPTOR_RULES = {
  speed:    { label: '速さ優先ルール',       calc: (cpm, acc, total) => Math.round((cpm * 2 + total) * (acc / 100)) },
  accuracy: { label: '正確さ優先ルール',     calc: (cpm, acc, total) => Math.round((total * 5 + cpm) * Math.pow(acc / 100, 4)) },
  chaos:    { label: 'カオスルール',         calc: (cpm, acc, total) => Math.round((cpm * acc * total) / 1000) },
};
const DEFAULT_DISRUPTOR_CUSTOM_WEIGHTS = { cpm: 1.5, acc: 1, chars: 0.5 };

// 変革者: 既存3ルールに加え、自分で採点式そのものを作れる「カスタムルール」を返す
// （Hexadの変革者＝「システムそのものに手を加えたい」という動機に対応）
function getDisruptorRule(ruleKey, stats) {
  if (ruleKey === 'custom') {
    const w = (stats && stats.disruptor && stats.disruptor.customWeights) || DEFAULT_DISRUPTOR_CUSTOM_WEIGHTS;
    return {
      label: 'カスタムルール（自作）',
      calc: (cpm, acc, total) => Math.round(cpm * w.cpm + acc * w.acc + total * w.chars),
    };
  }
  return DISRUPTOR_RULES[ruleKey] || DISRUPTOR_RULES.chaos;
}

const GRADE_TABLE = [
  { min: 300, grade: 'Sランク', desc: '神速レベル（プロ級）', color: '#e34948' },
  { min: 200, grade: 'Aランク', desc: '上級レベル（目標: 200 CPM〜）', color: '#eda100' },
  { min: 150, grade: 'Bランク', desc: '中級レベル（標準）', color: '#1baf7a' },
  { min: 100, grade: 'Cランク', desc: '初級レベル（脱初心者）', color: '#2a78d6' },
  { min: 0,   grade: 'Dランク', desc: '見習いレベル', color: '#666666' },
];

function getGrade(cpm) {
  return GRADE_TABLE.find((g) => cpm >= g.min) || GRADE_TABLE[GRADE_TABLE.length - 1];
}

function renderGradeTableHtml(userCpm = null) {
  const currentGrade = userCpm !== null ? getGrade(userCpm).grade : null;
  return `
    <div class="grade-table-box" style="margin-top:12px; background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; border:1px solid #ddd;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#333;">タイピング速度 評価基準表</h3>
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.95rem;">
        <thead>
          <tr style="border-bottom:2px solid #ccc;">
            <th style="padding:6px;">ランク</th>
            <th style="padding:6px;">基準 (CPM)</th>
            <th style="padding:6px;">目安</th>
          </tr>
        </thead>
        <tbody>
          ${GRADE_TABLE.map((g) => {
            const isMatch = currentGrade === g.grade;
            return `
              <tr style="${isMatch ? 'background:rgba(42,120,214,0.18); font-weight:bold;' : ''} border-bottom:1px solid #eee;">
                <td style="padding:6px; color:${g.color};">${g.grade} ${isMatch ? '👈 あなた' : ''}</td>
                <td style="padding:6px;">${g.min === 0 ? '100未満' : g.min + ' 文字/分〜'}</td>
                <td style="padding:6px; font-size:0.85rem; color:#555;">${g.desc}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPersonalHistoryHtml(stats, currentCpm = null) {
  const top = (stats.leaderboard || []).slice().sort((a, b) => b.cpm - a.cpm).slice(0, 5);
  if (!top.length) {
    return `<div class="personal-history-box" style="margin-top:12px;"><p class="hint">まだ個人の記録がありません。プレイして自己ベストを更新しましょう！</p></div>`;
  }
  return `
    <div class="personal-history-box" style="margin-top:12px; background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; border:1px solid #ddd;">
      <h3 style="margin-top:0; font-size:1.05rem; color:#333;">🏆 あなたの自己ベスト TOP 5（個人記録）</h3>
      <ul style="list-style:none; padding:0; margin:8px 0 0 0;">
        ${top.map((r, idx) => {
          const isCurrent = currentCpm !== null && r.cpm === currentCpm;
          const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '';
          return `
            <li style="display:flex; justify-content:space-between; padding:5px 8px; border-bottom:1px solid #eee; ${isCurrent ? 'background:rgba(42,120,214,0.15); font-weight:bold;' : ''}">
              <span>第${idx + 1}位 ${isCurrent ? '🌟 今回' : ''}</span>
              <span><strong>${r.cpm}</strong> 文字/分 (正確率 ${r.accuracy}%) <small style="color:#888;">${dateStr}</small></span>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

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
  model: 'gtp_so_model', nickname: 'gtp_so_nickname',
  stats: 'gtp_so_stats', log: 'gtp_so_log',
  hexadResult: 'gtp_so_hexad_result',
};

const DEFAULT_STATS = {
  sessionsCompleted: 0,
  totalCorrectChars: 0,
  totalPlayTimeSec: 0,
  coins: 0,
  unlockedColors: ['#2a78d6'],
  selectedColor: '#2a78d6',
  leaderboard: [],
  communityTotal: 0,
  freeSpirit: { category: 'random' },
  disruptor: { rule: 'chaos', customWeights: { cpm: 1.5, acc: 1, chars: 0.5 } },
  currentStreak: 0,
  bestStreak: 0,
  bestSessionChars: 0,
  bestSessionSentences: 0,
  bestDisruptorScore: 0,
  targetLevel: 'standard',
  customTargetCpm: 200,
  customTargetScore: 200,
  fullTimeStreak: 0,
  rediagnosePromptShown: false,
};

// 目標レベル（達成者・社交家・変革者で手動調整可能。倍率で基準値を伸縮する）
const TARGET_LEVELS = {
  easy:     { label: '初級', mult: 0.8 },
  standard: { label: '標準', mult: 1.0 },
  hard:     { label: '上級', mult: 1.3 },
  extreme:  { label: '超級', mult: 1.6 },
};

// 「カスタム」（数値を直接指定するモード）は通算5回クリア（「中級タイピスト」相当）で解放
const CUSTOM_TARGET_UNLOCK_COUNT = 5;
function isCustomTargetUnlocked(stats) {
  return (stats.sessionsCompleted || 0) >= CUSTOM_TARGET_UNLOCK_COUNT;
}

// 自己ベストを上回ったら、目標値そのものを際限なく引き上げる
function risingTarget(base, best, margin) {
  return best > 0 && best + margin > base ? best + margin : base;
}

/* ============================================================
   メインタイプ以外の「準タイプ」判定
   非メインタイプのスコアが一定以上なら、そのタイプの要素を少しだけ混ぜる。
   ============================================================ */
const SECONDARY_SCORE_THRESHOLD = 60;

function getSecondaryType(hexadResult) {
  if (!hexadResult || !hexadResult.scores) return null;
  const primary = hexadResult.primaryType;
  let best = null;
  let bestScore = -Infinity;
  for (const t of HEXAD_ORDER) {
    if (t === primary) continue;
    const s = Number(hexadResult.scores[t]);
    if (!Number.isNaN(s) && s >= SECONDARY_SCORE_THRESHOLD && s > bestScore) {
      bestScore = s;
      best = t;
    }
  }
  return best;
}

// typesのいずれかがメインならfullChance、準タイプならlightChance、どちらでもなければ0を返す
function typeChance(hexadResult, types, fullChance, lightChance) {
  if (!hexadResult) return 0;
  if (types.includes(hexadResult.primaryType)) return fullChance;
  const secondary = getSecondaryType(hexadResult);
  if (secondary && types.includes(secondary)) return lightChance;
  return 0;
}

// 自由人のレア文の抽選（メイン／準タイプ／それ以外で確率が変わる3段階レアリティ）
// メイン: レア10% + 超レア2% + ウルトラレア0.5%
// 準タイプ: レア5% + 激レア1%
// それ以外: レア2% + 激レア0.2%
function rollRareTier(hexadResult) {
  const isPrimary = !!(hexadResult && hexadResult.primaryType === 'freeSpirit');
  const isSecondary = !isPrimary && getSecondaryType(hexadResult) === 'freeSpirit';
  let pUltra = 0, pSuper = 0, pRare;
  if (isPrimary) { pUltra = 0.005; pSuper = 0.02; pRare = 0.10; }
  else if (isSecondary) { pSuper = 0.01; pRare = 0.05; }
  else { pSuper = 0.002; pRare = 0.02; }

  const roll = Math.random();
  if (roll < pUltra) return 'ultra';
  if (roll < pUltra + pSuper) return 'super';
  if (roll < pUltra + pSuper + pRare) return 'rare';
  return null;
}

const THANKS_MESSAGES = [
  '誰かがあなたの練習で少し救われました',
  '小さな貢献が積み重なっています',
  'あなたの一打が誰かの力になっています',
  '見えないところで役に立っています',
];

// 記録されているリーダーボード内での自分の順位を算出（社交家用）
function computeGlobalRank(stats, myCpm) {
  const board = stats.leaderboard || [];
  if (!board.length || myCpm == null) return null;
  const better = board.filter((r) => r.cpm > myCpm).length;
  return { rank: better + 1, total: board.length };
}

// 社交家用：記録の中で自分のすぐ上にいる「次のライバル」（他の参加者）を探す
function findNextRival(stats, myCpm) {
  const others = (stats.leaderboard || []).filter((r) => r.name !== appState.nickname);
  const above = others.filter((r) => r.cpm > (myCpm == null ? -Infinity : myCpm)).sort((a, b) => a.cpm - b.cpm);
  return above.length ? above[0] : null;
}

// 社交家用：他の参加者の記録を偽りなく「みんなの記録」として見せる（自己ベスト表と違い、実際に他者が見える）
function renderCommunityLeaderboardHtml(stats, currentCpm = null) {
  const board = (stats.leaderboard || []).slice().sort((a, b) => b.cpm - a.cpm);
  if (!board.length) {
    return `<div class="community-board-box" style="margin-top:12px;"><p class="hint">まだ記録がありません。あなたが最初の記録を作りましょう！</p></div>`;
  }
  const top = board.slice(0, 5);
  return `
    <div class="community-board-box" style="margin-top:12px; background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; border:1px solid #ddd;">
      <h3 style="margin-top:0; font-size:1.05rem; color:#333;">🌐 みんなの記録 TOP 5</h3>
      <ul style="list-style:none; padding:0; margin:8px 0 0 0;">
        ${top.map((r, idx) => {
          const isMe = r.name === appState.nickname && currentCpm !== null && r.cpm === currentCpm;
          const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '';
          return `
            <li style="display:flex; justify-content:space-between; padding:5px 8px; border-bottom:1px solid #eee; ${isMe ? 'background:rgba(42,120,214,0.15); font-weight:bold;' : ''}">
              <span>第${idx + 1}位 ${isMe ? '🌟 今回' : ''} ${r.name === appState.nickname ? '（あなた）' : escapeHtml(r.name)}</span>
              <span><strong>${r.cpm}</strong> 文字/分 (正確率 ${r.accuracy}%) <small style="color:#888;">${dateStr}</small></span>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

const SECONDARY_TOUCH_SETUP_TEXT = {
  achiever: '🔥 連続クリアも少し記録されます',
  player: '🎁 まれにボーナスがもらえることがあります',
  socialiser: '🏅 プレイ後、記録内での順位の目安も表示されます',
  philanthropist: '💚 あなたの練習が誰かの役に立っています',
  disruptor: '⚡ たまに型破りな演出が起こることがあります',
};

// セットアップ画面用：準タイプがあれば、その要素をごく短く予告する
function secondaryTouchSetupHtml(hexadResult) {
  const secondary = getSecondaryType(hexadResult);
  if (!secondary) return '';
  const text = SECONDARY_TOUCH_SETUP_TEXT[secondary];
  if (!text) return '';
  return `<p class="hint secondary-touch" style="margin-top:10px;color:${HEXAD_TYPES[secondary].color}">${text}</p>`;
}

// 結果画面用：準タイプがあれば、実際のデータを少しだけ添える
function secondaryTouchPostHtml(hexadResult, stats, result) {
  const secondary = getSecondaryType(hexadResult);
  if (!secondary) return '';
  let text = '';
  if (secondary === 'achiever' && stats.currentStreak > 0) {
    text = `🔥 連続クリア: ${stats.currentStreak}回`;
  } else if (secondary === 'player') {
    text = '🎁 プレイ中、まれにボーナスが発生します';
  } else if (secondary === 'socialiser') {
    const info = computeGlobalRank(stats, result.cpm);
    if (info) text = `🏅 参考: 記録内で上位${info.rank}位相当`;
  } else if (secondary === 'philanthropist') {
    text = '💚 あなたの練習が誰かの役に立っています';
  } else if (secondary === 'disruptor') {
    text = '⚡ 型にとらわれない一面も少し見えました';
  }
  if (!text) return '';
  return `<p class="hint secondary-touch" style="margin-top:10px;color:${HEXAD_TYPES[secondary].color}">${text}</p>`;
}

/* ============================================================
   タイピング練習のクリア/非クリア判定
   ============================================================ */
function evaluateClearStatus(result, type) {
  const diff = appState.setup.difficulty || 'random';
  const timeLimit = appState.setup.timeLimit === 'none' ? null : Number(appState.setup.timeLimit);
  const stats = getStats();
  const levelMult = (TARGET_LEVELS[stats.targetLevel] || TARGET_LEVELS.standard).mult;
  const useCustomTarget = stats.targetLevel === 'custom' && isCustomTargetUnlocked(stats);

  let targetCpm = 150;
  if (diff === 'short') targetCpm = 120;
  if (diff === 'long') targetCpm = 180;
  targetCpm = useCustomTarget ? Math.max(1, Math.round(Number(stats.customTargetCpm) || targetCpm)) : Math.round(targetCpm * levelMult);
  const bestCpm = (stats.leaderboard && stats.leaderboard.length) ? Math.max(...stats.leaderboard.map((r) => r.cpm)) : 0;
  targetCpm = risingTarget(targetCpm, bestCpm, 10);

  let targetChars = 100;
  if (timeLimit) {
    targetChars = Math.floor(timeLimit * 1.5);
  }
  targetChars = risingTarget(targetChars, stats.bestSessionChars || 0, 20);

  let targetSentences = timeLimit ? Math.max(1, Math.floor(timeLimit / 20)) : 3;
  targetSentences = risingTarget(targetSentences, stats.bestSessionSentences || 0, 1);

  switch (type) {
    case 'achiever': {
      const isAchieverCleared = result.cpm >= targetCpm && result.accuracy >= 90;
      return {
        cleared: isAchieverCleared,
        title: isAchieverCleared ? '🎉 STAGE CLEAR (目標達成!)' : '❌ FAILED (クリアならず...)',
        desc: isAchieverCleared
          ? `目標基準 (${targetCpm} CPM & 正確率90%) を見事クリアしました！`
          : `目標基準: ${targetCpm} CPM & 正確率90% 以上 (今回: ${result.cpm} CPM / 正確率 ${result.accuracy}%)`
      };
    }
    case 'player': {
      const isPlayerCleared = result.correctKeystrokes >= targetChars;
      return {
        cleared: isPlayerCleared,
        title: isPlayerCleared ? '🪙 CLEAR (ノルマ達成!)' : '❌ FAILED (獲得目標 未達)',
        desc: isPlayerCleared
          ? `ノルマ達成！ +${result.correctKeystrokes + 20} コインを獲得しました！`
          : `目標ノルマ: ${targetChars}文字(コイン)以上を入力 (今回: ${result.correctKeystrokes}文字)`
      };
    }
    case 'socialiser': {
      // 社交家: 抽象的な基準値ではなく、記録の中の「次のライバル」（実在の他の参加者）に勝てたかどうかで判定する
      // （Hexadの社交家＝他者とのつながり・比較が動機のため。自己ベストの追求は達成者と被ってしまう）
      const rival = findNextRival(stats, result.cpm);
      const isSocialiserCleared = !rival || result.cpm > rival.cpm;
      return {
        cleared: isSocialiserCleared,
        title: isSocialiserCleared
          ? (rival ? `🎖️ CLEAR (${rival.name}を抜きました!)` : '🎖️ CLEAR (現在みんなの中でトップです!)')
          : '❌ FAILED (ライバルに届かず...)',
        desc: isSocialiserCleared
          ? (rival ? `${rival.cpm} CPMの${rival.name}さんを上回る ${result.cpm} CPM を記録しました！` : `記録の中で最速タイでした！ (${result.cpm} CPM)`)
          : `次のライバル「${rival.name}」(${rival.cpm} CPM) まであと ${rival.cpm - result.cpm} CPM (今回: ${result.cpm} CPM)`
      };
    }
    case 'disruptor': {
      const rule = getDisruptorRule(appState.setup.rule || 'chaos', stats);
      const score = rule.calc(result.cpm, result.accuracy, result.correctKeystrokes);
      let targetScore = Math.round((timeLimit ? timeLimit * 2 : 150) * levelMult);
      targetScore = risingTarget(targetScore, stats.bestDisruptorScore || 0, 20);
      const isDisruptorCleared = score >= targetScore;
      return {
        cleared: isDisruptorCleared,
        title: isDisruptorCleared ? '⚡ CLEAR (特殊ルール突破!)' : '❌ FAILED (スコア目標未達)',
        desc: isDisruptorCleared
          ? `ルール「${rule.label}」で ${score} pt を獲得し、クリアしました！`
          : `クリア目標: ${targetScore} pt 以上 (今回: ${score} pt)`
      };
    }
    case 'philanthropist': {
      let targetPhilChars = timeLimit ? Math.floor(timeLimit * 1.0) : 80;
      targetPhilChars = risingTarget(targetPhilChars, stats.bestSessionChars || 0, 15);
      const isPhilCleared = result.correctKeystrokes >= targetPhilChars;
      return {
        cleared: isPhilCleared,
        title: isPhilCleared ? '💚 CLEAR (貢献達成!)' : '❌ FAILED (貢献未達)',
        desc: isPhilCleared
          ? `みんなの練習目標に ${result.correctKeystrokes} 文字貢献しました！`
          : `目標: ${targetPhilChars}文字以上の貢献 (今回: ${result.correctKeystrokes}文字)`
      };
    }
    case 'freeSpirit':
    default: {
      const isFreeCleared = result.sentencesCompleted >= targetSentences;
      return {
        cleared: isFreeCleared,
        title: isFreeCleared ? '🌟 CLEAR (探求完了!)' : '❌ FAILED (未完了)',
        desc: isFreeCleared
          ? `目標の ${targetSentences} 文以上をやり遂げました！`
          : `目標: ${targetSentences} 文以上タイピングを完了 (今回: ${result.sentencesCompleted}文)`
      };
    }
  }
}

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
  'ー': ['-'],
  'ぁ': ['xa', 'la'], 'ぃ': ['xi', 'li'], 'ぅ': ['xu', 'lu'], 'ぇ': ['xe', 'le'], 'ぉ': ['xo', 'lo'],
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
  // 外来語で使う拗音（ポジティブ＝ぽじてぃぶ の「てぃ」など）
  'てぃ': ['thi'], 'でぃ': ['dhi'], 'とぅ': ['twu'], 'どぅ': ['dwu'],
  'ふぁ': ['fa'], 'ふぃ': ['fi'], 'ふぇ': ['fe'], 'ふぉ': ['fo'], 'ふゅ': ['fyu'],
  'うぃ': ['wi'], 'うぇ': ['we'], 'うぉ': ['who', 'wo'],
  'しぇ': ['she'], 'じぇ': ['je'], 'ちぇ': ['che'],
  'つぁ': ['tsa'], 'つぃ': ['tsi'], 'つぇ': ['tse'], 'つぉ': ['tso'],
  'くぁ': ['qwa', 'kwa'], 'くぃ': ['qwi', 'kwi'], 'くぇ': ['qwe', 'kwe'], 'くぉ': ['qwo', 'kwo'],
  'ぐぁ': ['gwa'],
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
  nickname: 'ゲスト',
  classifyMethod: 'survey',
  answers: {},
  hexadResult: null,
  setup: {},
  participantId: null,
  group: null,
};

let game = null;

/* ============================================================
   汎用ユーティリティ
   ============================================================ */

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ============================================================
   参加者番号 / 群の取得（?pid=&group= で渡される想定）
   ============================================================ */
const PARTICIPANT_STORAGE_KEY = 'gtp_participant_meta';
const SURVEY_URL = 'https://forms.gle/CZLPNUX4T4yoJBmg8';
const DEFAULT_GROUP = 'B'; // このページ(index-survey-only.html)はB群（アンケート診断）固定

function initParticipantInfo() {
  const params = new URLSearchParams(location.search);
  const pidFromUrl = params.get('pid');
  const groupFromUrl = params.get('group');
  if (pidFromUrl) {
    appState.participantId = pidFromUrl;
    appState.group = groupFromUrl || DEFAULT_GROUP;
    try { localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify({ pid: appState.participantId, group: appState.group })); } catch (e) {}
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(PARTICIPANT_STORAGE_KEY) || 'null');
      if (saved) {
        appState.participantId = saved.pid;
        appState.group = saved.group || DEFAULT_GROUP;
      }
    } catch (e) {}
  }
  const pidField = $('#pid-input');
  if (pidField && appState.participantId) pidField.value = appState.participantId;
}

// 参加者番号入力欄を検証し、appState/localStorageに保存する。未入力ならエラー表示してfalseを返す。
function capturePidOrShowError() {
  const input = $('#pid-input');
  if (!input) return true; // 入力欄が無い画面では素通り
  const errEl = $('#pid-error');
  if (errEl) errEl.style.display = 'none';
  const raw = input.value.trim();
  if (!raw) {
    if (errEl) { errEl.textContent = '参加者番号を入力してください。'; errEl.style.display = 'block'; }
    input.focus();
    return false;
  }
  appState.participantId = raw;
  if (!appState.group) appState.group = DEFAULT_GROUP;
  // ニックネームは「参加者番号」に基づいて設定する（社交家のみんなの記録欄で、誰が誰か区別できるようにするため）
  appState.nickname = `参加者${appState.participantId}`;
  localStorage.setItem(STORAGE_KEYS.nickname, appState.nickname);
  try { localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify({ pid: appState.participantId, group: appState.group })); } catch (e) {}
  return true;
}

function showScreen(id) {
  $all('.screen').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ============================================================
   Vercel Postgres (DB) 通信処理
   ============================================================ */
async function saveSessionToVercelDb(record) {
  try {
    const res = await fetch('/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (res.ok) {
      console.log('Vercel DBへプレイ記録を正常に保存しました');
    }
  } catch (e) {
    console.warn('Vercel DB保存エラー:', e);
  }
}

async function fetchStatsFromVercelDb() {
  try {
    const res = await fetch('/api/get-stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const stats = getStats();
        if (data.communityTotal > stats.communityTotal) {
          stats.communityTotal = data.communityTotal;
        }
        if (data.leaderboard && data.leaderboard.length) {
          const mergedMap = new Map();
          [...stats.leaderboard, ...data.leaderboard.map(r => ({ name: r.nickname, cpm: r.cpm, accuracy: r.accuracy, date: r.created_at }))]
            .forEach(item => mergedMap.set(`${item.name}_${item.cpm}_${item.accuracy}`, item));
          stats.leaderboard = Array.from(mergedMap.values()).sort((a, b) => b.cpm - a.cpm).slice(0, 20);
        }
        saveStats(stats);
      }
    }
  } catch (e) {
    console.warn('Vercel DB取得エラー:', e);
  }
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
  const savedResultStr = localStorage.getItem(STORAGE_KEYS.hexadResult);
  if (savedResultStr) {
    const resumeBtn = $('#btn-resume-session');
    resumeBtn.style.display = 'block';
    resumeBtn.addEventListener('click', () => {
      try {
        appState.hexadResult = JSON.parse(savedResultStr);
        appState.nickname = localStorage.getItem(STORAGE_KEYS.nickname) || 'ゲスト';
        renderSetup();
        showScreen('screen-setup');
      } catch (e) {
        console.error("Resume failed", e);
      }
    });

    const resetBtn = $('#btn-reset-welcome');
    resetBtn.style.display = 'block';
    resetBtn.addEventListener('click', () => {
      if (confirm('保存されている診断結果や自己ベスト記録を全削除し、最初からやり直しますか？')) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  $('#btn-start-survey').addEventListener('click', () => {
    if (!capturePidOrShowError()) return;
    appState.classifyMethod = 'survey';
    renderSurveyForm();
    showScreen('screen-survey');
  });
}

/* ============================================================
   1. アンケート画面（12問・5段階評価）
   ============================================================ */

function renderSurveyForm() {
  const formEl = $('#survey-form');
  appState.answers = {};

  formEl.innerHTML = SURVEY_ITEMS.map((item) => `
    <div class="survey-item" style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid #e0e0e0;">
      <p style="margin: 0 0 0.75rem; font-weight: 500; line-height: 1.5;">
        <span style="color: var(--theme-color, #2a78d6); font-weight: 700; margin-right: 0.5rem;">Q${item.id}.</span>${escapeHtml(item.text)}
      </p>
      <div class="likert-group" data-qid="${item.id}" style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${LIKERT_LABELS.map((lbl, i) => `
          <button type="button"
            class="likert-btn"
            data-value="${i + 1}"
            style="flex: 1; min-width: 60px; padding: 8px 4px; border: 2px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 0.75rem; line-height: 1.3; white-space: pre-line; transition: all 0.15s;"
          >${lbl}</button>
        `).join('')}
      </div>
    </div>
  `).join('');

  // リッカートボタンのイベント
  formEl.querySelectorAll('.likert-group').forEach((group) => {
    const qid = Number(group.dataset.qid);
    group.querySelectorAll('.likert-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.likert-btn').forEach((b) => {
          b.style.background = 'white';
          b.style.borderColor = '#ddd';
          b.style.color = '#333';
        });
        btn.style.background = 'var(--theme-color, #2a78d6)';
        btn.style.borderColor = 'var(--theme-color, #2a78d6)';
        btn.style.color = 'white';
        appState.answers[qid] = Number(btn.dataset.value);
        // 全問回答済みか確認
        checkSurveyComplete();
      });
    });
  });
}

function checkSurveyComplete() {
  const answered = Object.keys(appState.answers).length;
  const submitBtn = $('#btn-survey-submit');
  if (answered >= SURVEY_ITEMS.length) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
  }
}

$('#btn-survey-submit').addEventListener('click', () => {
  showScreen('screen-analyzing');
  setTimeout(() => {
    const result = classifyByScore(appState.answers);
    appState.hexadResult = result;
    localStorage.setItem(STORAGE_KEYS.hexadResult, JSON.stringify(result));
    renderResult(result);
    showScreen('screen-result');
  }, 800);
});

/* スコアベース判定（ルールベース） */
function classifyByScore(answers) {
  const scores = {};
  for (const type of HEXAD_ORDER) {
    scores[type] = 0;
  }

  for (const item of SURVEY_ITEMS) {
    const val = answers[item.id] || 3;
    // 1〜5点をそのまま0〜100点にスケール
    scores[item.type] += val;
  }

  // タイプごとの設問数で平均化し、0〜100に正規化
  const counts = {};
  for (const type of HEXAD_ORDER) counts[type] = 0;
  for (const item of SURVEY_ITEMS) counts[item.type]++;

  const normalized = {};
  for (const type of HEXAD_ORDER) {
    const avg = scores[type] / counts[type]; // 1〜5
    normalized[type] = Math.round((avg - 1) / 4 * 100);
  }

  // 最高スコアのタイプを判定
  let primaryType = HEXAD_ORDER[0];
  let maxScore = -1;
  for (const type of HEXAD_ORDER) {
    if (normalized[type] > maxScore) {
      maxScore = normalized[type];
      primaryType = type;
    }
  }

  return {
    primaryType,
    scores: normalized,
    rationale: `アンケート結果から「${HEXAD_TYPES[primaryType].label}」タイプが最も強く現れました。`,
    method: 'survey',
  };
}

/* ============================================================
   3. 判定結果画面
   ============================================================ */

function renderResult(result) {
  updateThemeColor();
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

// 設定画面から呼ばれる、タイプ診断のやり直し（制限時間いっぱいのプレイを3回終えると提案される）
function triggerRediagnose() {
  if (confirm('現在の診断結果をリセットし、もう一度アンケートからやり直しますか？\n（スコアや獲得コイン等の実績は維持されます）')) {
    localStorage.removeItem(STORAGE_KEYS.hexadResult);
    appState.hexadResult = null;
    const s = getStats(); s.fullTimeStreak = 0; s.rediagnosePromptShown = false; saveStats(s);
    renderSurveyForm();
    showScreen('screen-survey');
  }
}

/* ============================================================
   4. タイプ別セットアップ画面
   ============================================================ */

function renderSetup() {
  const type = appState.hexadResult.primaryType;
  const stats = getStats();
  $('#setup-title').textContent = `練習の準備 — ${HEXAD_TYPES[type].label}`;
  const body = $('#setup-body');
  const statsBody = $('#setup-stats-body');

  const builders = {
    achiever: setupAchiever,
    player: setupPlayer,
    socialiser: setupSocialiser,
    freeSpirit: setupFreeSpirit,
    philanthropist: setupPhilanthropist,
    disruptor: setupDisruptor,
  };
  // アバターカラーを選べるタイプ（プレイヤー・自由人）は、保存済みの色をここで先に反映しておく。
  // こうしないと下のupdateThemeColor()やチップの色が、直後に各setupX()内で改めて
  // 設定されるまで古い色のまま（またはタイプの既定色）になってしまう。
  const initialAvatarColor = (type === 'player' || type === 'freeSpirit') ? stats.selectedColor : undefined;
  appState.setup = { category: 'random', difficulty: 'random', timeLimit: TYPE_DEFAULT_TIME[type] || '60', avatarColor: initialAvatarColor };
  updateThemeColor();

  // 制限時間いっぱいまでプレイし切ったセッションが3回続いたら、タイプ診断のやり直しを提案する
  // （途中で切り上げたセッションはカウントしない）。提案を無視してそのまま次のプレイを始めたら、
  // 提案は一旦消えてカウントをリセットする（毎回しつこく出さないように）。
  const showRediagnosePrompt = (stats.fullTimeStreak || 0) >= 3;
  if (showRediagnosePrompt && !stats.rediagnosePromptShown) {
    stats.rediagnosePromptShown = true;
    saveStats(stats);
  }
  const rediagnosePromptHtml = showRediagnosePrompt ? `
    <div class="setup-row rediagnose-prompt">
      <p class="hint">3回、時間いっぱいプレイしました。今のあなたに合ったタイプか、診断をやり直してみませんか？</p>
      <button type="button" id="btn-rediagnose-setup" class="btn btn-tertiary">🔄 タイプ診断をやり直す</button>
    </div>
  ` : '';

  // 設定・操作系はスタートボタンの上（#setup-body）、ランキングや指標等はボタンの下（#setup-stats-body）に表示する
  body.innerHTML = rediagnosePromptHtml + '<div class="setup-row session-settings"></div><div class="setup-type-body"></div>';
  if (showRediagnosePrompt) {
    $('#btn-rediagnose-setup').addEventListener('click', triggerRediagnose);
  }
  renderSessionSettings(body.querySelector('.session-settings'), initialAvatarColor || HEXAD_TYPES[type].color);

  const res = appState.hexadResult;
  let chartHtml = '';
  if (res && res.scores) {
    chartHtml = `
      <details style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.02); padding: 10px 14px; border-radius: 8px; border: 1px solid #ddd;">
        <summary style="cursor: pointer; font-weight: bold; color: #333;">📊 自身のタイプ内訳（6要素スコア）を見る</summary>
        <div class="bar-chart" style="margin-top: 10px;">
          ${HEXAD_ORDER.map((t) => {
            const score = Math.max(0, Math.min(100, Math.round(res.scores[t] ?? 0)));
            return `
              <div class="bar-row" style="margin-bottom: 6px;">
                <span class="bar-label" style="font-size: 0.85rem;">${HEXAD_TYPES[t].label.split(' ')[0]}</span>
                <span class="bar-track"><span class="bar-fill" style="width:${score}%;background:${HEXAD_TYPES[t].color}"></span></span>
                <span class="bar-value" style="font-size: 0.85rem;">${score}</span>
              </div>`;
          }).join('')}
        </div>
      </details>
    `;
  }
  statsBody.innerHTML = chartHtml + '<div class="setup-type-stats"></div>';
  builders[type](body.querySelector('.setup-type-body'), statsBody.querySelector('.setup-type-stats'), stats);
  statsBody.insertAdjacentHTML('beforeend', secondaryTouchSetupHtml(appState.hexadResult));
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

// 達成者・社交家・変革者で使う「目標レベル」の手動調整UI（自己ベスト更新でさらに上がるのは別途自動）
function targetLevelSettingHtml(stats, customFieldKey, customUnitLabel) {
  const unlocked = isCustomTargetUnlocked(stats);
  const options = Object.entries(TARGET_LEVELS).map(([v, l]) => ({ value: v, label: l.label }));
  if (unlocked) options.push({ value: 'custom', label: '🔓 カスタム' });
  const selected = (stats.targetLevel === 'custom' && !unlocked) ? 'standard' : (stats.targetLevel || 'standard');
  const isCustom = selected === 'custom';
  const customValue = stats[customFieldKey] != null ? stats[customFieldKey] : 200;
  return `
    <div class="setup-row">
      <h3>目標レベル</h3>
      ${chipGroup('targetLevel', options, selected)}
      ${unlocked
        ? '<p class="hint">クリア基準を自分で調整できます。自己ベストを更新すると、次の目標はさらに上がります。</p>'
        : `<p class="hint">🔒 通算${CUSTOM_TARGET_UNLOCK_COUNT}回クリアすると、数値を直接指定できる「カスタム」が解放されます（現在 ${stats.sessionsCompleted || 0}回）。</p>`}
      <div class="target-custom-input" style="margin-top:10px; ${isCustom ? '' : 'display:none;'}">
        <label for="target-custom-value" style="display:block; font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">目標値を直接指定（${customUnitLabel}）</label>
        <input type="number" id="target-custom-value" min="1" step="1" value="${customValue}" style="width:140px; padding:8px 10px; border-radius:8px; border:1px solid var(--baseline); background:var(--page); color:var(--text-primary);">
      </div>
    </div>
  `;
}
function bindTargetLevel(body, color, customFieldKey) {
  bindChipGroup(body, 'targetLevel', color, (v) => {
    appState.setup.targetLevel = v;
    const s = getStats(); s.targetLevel = v; saveStats(s);
    const box = body.querySelector('.target-custom-input');
    if (box) box.style.display = v === 'custom' ? 'block' : 'none';
  });
  const input = body.querySelector('#target-custom-value');
  if (input) {
    input.addEventListener('change', () => {
      const val = Math.max(1, Math.round(Number(input.value) || 1));
      input.value = val;
      const s = getStats(); s[customFieldKey] = val; saveStats(s);
    });
  }
}

function setupAchiever(body, statsBody, stats) {
  body.innerHTML = `
    <p class="lead">達成とスキル向上を積み重ねるモードです。</p>
    ${targetLevelSettingHtml(stats, 'customTargetCpm', 'CPM')}
  `;
  bindTargetLevel(body, HEXAD_TYPES.achiever.color, 'customTargetCpm');

  const badge = ACHIEVER_BADGES.filter((b) => stats.sessionsCompleted >= b.count).pop();
  const next = ACHIEVER_BADGES.find((b) => stats.sessionsCompleted < b.count);
  statsBody.innerHTML = `
    <div class="setup-row">
      <h3>現在の称号</h3>
      <p>${badge ? `<strong>${badge.name}</strong>` : 'まだ称号がありません（1回クリアで最初の称号）'}</p>
      ${next ? `<div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (stats.sessionsCompleted / next.count) * 100)}%;background:${HEXAD_TYPES.achiever.color}"></div></div><p class="hint">次の称号「${next.name}」まであと ${next.count - stats.sessionsCompleted} 回クリア</p>` : '<p class="hint">全ての称号を獲得済みです！</p>'}
      <p>🔥 連続クリア: <strong>${stats.currentStreak || 0}</strong>回（自己最高 ${stats.bestStreak || 0}回）</p>
      ${renderPersonalHistoryHtml(stats)}
      ${renderGradeTableHtml()}
    </div>
  `;
}

function setupPlayer(body, statsBody, stats) {
  appState.setup.avatarColor = stats.selectedColor;
  body.innerHTML = `
    <p class="lead">タイプして貯めたコインで、好きなアバターカラーを購入しましょう。</p>
    <div class="setup-row">
      <h3>アバターカラー（クリックして購入・選択）</h3>
      <div class="color-swatch-group">
        ${COLOR_SHOP.map((u) => {
          const owned = stats.unlockedColors.includes(u.color);
          const selected = u.color === stats.selectedColor;
          return `
            <div class="swatch-item">
              <span class="color-swatch${selected ? ' selected' : ''}${owned ? '' : ' locked'}" data-color="${u.color}" data-price="${u.coins}" style="background:${owned ? u.color : '#ccc'}; opacity:${owned ? 1 : 0.45}"></span>
              ${owned ? '' : `<span class="swatch-price">🪙${u.coins}</span>`}
            </div>`;
        }).join('')}
      </div>
      <p class="hint" id="player-buy-hint" style="display:none; color: var(--critical);"></p>
    </div>
  `;
  body.querySelectorAll('.color-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      const color = sw.dataset.color;
      const price = Number(sw.dataset.price);
      const s = getStats();
      if (!s.unlockedColors.includes(color)) {
        if (s.coins < price) {
          const hint = body.querySelector('#player-buy-hint');
          if (hint) { hint.textContent = `🪙が足りません（あと ${price - s.coins} 枚必要）`; hint.style.display = 'block'; }
          return;
        }
        s.coins -= price;
        s.unlockedColors.push(color);
      }
      s.selectedColor = color;
      saveStats(s);
      renderSetup();
    });
  });

  statsBody.innerHTML = `
    <div class="setup-row">
      <h3>所持コイン</h3>
      <p style="font-size:1.4rem;font-weight:700;">🪙 ${stats.coins}</p>
    </div>
  `;
}

function setupSocialiser(body, statsBody, stats) {
  const rival = findNextRival(stats, -Infinity);
  body.innerHTML = `
    <p class="lead">他の参加者の記録と競い合いましょう。次に打てば、記録の中のすぐ上にいる人を抜けるかもしれません。</p>
    ${rival ? `<p class="hint">🎯 次のライバル: <strong style="color:${HEXAD_TYPES.socialiser.color};">${escapeHtml(rival.name)}</strong>（${rival.cpm} CPM）</p>` : '<p class="hint">🏆 現在みんなの中でトップです。自己記録の更新を目指しましょう。</p>'}
  `;

  statsBody.innerHTML = `
    <div class="setup-row">
      ${renderCommunityLeaderboardHtml(stats)}
    </div>
  `;
}

function setupFreeSpirit(body, statsBody, stats) {
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
  bindChipGroup(body, 'category', appState.setup.avatarColor || HEXAD_TYPES.freeSpirit.color, (v) => {
    appState.setup.category = v;
    const s = getStats(); s.freeSpirit.category = v; saveStats(s);
  });
  body.querySelectorAll('.color-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      body.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
      sw.classList.add('selected');
      appState.setup.avatarColor = sw.dataset.color;
      updateThemeColor();
      const s = getStats(); s.selectedColor = sw.dataset.color; saveStats(s);
    });
  });
}

function setupPhilanthropist(body, statsBody, stats) {
  body.innerHTML = `<p class="lead">あなたが打った文字数は、みんなで目指す練習目標の達成に積み上がります（この端末内でのシミュレーションです）。</p>`;

  const pct = Math.min(100, Math.round((stats.communityTotal / COMMUNITY_GOAL) * 100));
  statsBody.innerHTML = `
    <div class="setup-row">
      <h3>目標までの貢献度</h3>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${HEXAD_TYPES.philanthropist.color}"></div></div>
      <p class="hint">${stats.communityTotal} / ${COMMUNITY_GOAL} 文字</p>
    </div>
  `;
}

function setupDisruptor(body, statsBody, stats) {
  appState.setup.rule = stats.disruptor.rule;
  if (!stats.disruptor.customWeights) { stats.disruptor.customWeights = { ...DEFAULT_DISRUPTOR_CUSTOM_WEIGHTS }; saveStats(stats); }
  const w = stats.disruptor.customWeights;
  const ruleOptions = [...Object.entries(DISRUPTOR_RULES).map(([v, r]) => ({ value: v, label: r.label })), { value: 'custom', label: '⚡ カスタムルール（自作）' }];
  body.innerHTML = `
    <p class="lead">自分でスコアのルールを書き換えられます。既存のやり方にとらわれず、好きなルールを選ぶか、自分だけの採点式を作りましょう。</p>
    <div class="setup-row">
      <h3>スコアルール</h3>
      ${chipGroup('rule', ruleOptions, stats.disruptor.rule)}
      <p class="hint">速さ優先＝CPM×2 / 正確さ優先＝正確率×10 / カオス＝CPM×正確率÷10</p>
      <div id="disruptor-custom-editor" style="display:${stats.disruptor.rule === 'custom' ? 'block' : 'none'}; margin-top:10px; padding:10px; background:rgba(0,0,0,0.03); border-radius:8px;">
        <p class="hint">スコア = 速度×<strong id="w-cpm-val">${w.cpm}</strong> + 正確率×<strong id="w-acc-val">${w.acc}</strong> + 打鍵数×<strong id="w-chars-val">${w.chars}</strong></p>
        <label style="display:block;margin-top:6px;">速度の重み<input type="range" id="w-cpm" min="0" max="3" step="0.1" value="${w.cpm}" style="width:100%;"></label>
        <label style="display:block;margin-top:6px;">正確率の重み<input type="range" id="w-acc" min="0" max="3" step="0.1" value="${w.acc}" style="width:100%;"></label>
        <label style="display:block;margin-top:6px;">打鍵数の重み<input type="range" id="w-chars" min="0" max="3" step="0.1" value="${w.chars}" style="width:100%;"></label>
      </div>
    </div>
    ${targetLevelSettingHtml(stats, 'customTargetScore', 'pt')}
  `;
  bindChipGroup(body, 'rule', HEXAD_TYPES.disruptor.color, (v) => {
    appState.setup.rule = v;
    const s = getStats(); s.disruptor.rule = v; saveStats(s);
    const editor = body.querySelector('#disruptor-custom-editor');
    if (editor) editor.style.display = v === 'custom' ? 'block' : 'none';
  });
  bindTargetLevel(body, HEXAD_TYPES.disruptor.color, 'customTargetScore');

  ['cpm', 'acc', 'chars'].forEach((key) => {
    const input = body.querySelector(`#w-${key}`);
    if (!input) return;
    input.addEventListener('input', () => {
      const val = Number(input.value);
      body.querySelector(`#w-${key}-val`).textContent = val;
      const s = getStats();
      if (!s.disruptor.customWeights) s.disruptor.customWeights = { ...DEFAULT_DISRUPTOR_CUSTOM_WEIGHTS };
      s.disruptor.customWeights[key] = val;
      saveStats(s);
    });
  });

  statsBody.innerHTML = `
    <div class="setup-row">
      <h3>自己ベストスコア</h3>
      <p style="font-size:1.4rem;font-weight:700;color:${HEXAD_TYPES.disruptor.color}">${stats.bestDisruptorScore || 0} pt</p>
    </div>
  `;
}

/* ============================================================
   5. ゲーム本体
   ============================================================ */

function filterByDifficulty(pool, difficulty) {
  if (!difficulty || difficulty === 'random') return pool;
  return pool.filter((s) => {
    const n = moraCount(s.reading);
    if (difficulty === 'short') return n <= 7;
    if (difficulty === 'medium') return n > 7 && n <= 13;
    return n > 13;
  });
}

function buildSentencePool(category, difficulty) {
  let pool = SENTENCES;
  if (category && category !== 'random') pool = pool.filter((s) => s.category === category);
  pool = filterByDifficulty(pool, difficulty);
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

  // 自由人（メインまたは準タイプ、それ以外でも低確率）: 選んだテーマは崩さず、
  // たまに「レア文」として演出だけ特別になる（3段階のレアリティ）
  const hr = appState && appState.hexadResult;
  session.rareTier = rollRareTier(hr);

  session.moras = buildMoraList(session.sentence.reading);
  session.idx = 0;
  session.buffer = '';
  session.committed = [];

  // プレイヤー／変革者（メインまたは準タイプ）: 低確率でボーナス文（+30文字）
  session.isBonusSentence = false;
  const bonusChance = typeChance(hr, ['player', 'disruptor'], 0.20, 0.08);
  if (Math.random() < bonusChance) {
    session.isBonusSentence = true;
  }

  // 次の文をプレビュー用に確保（消費はしない）
  if (!session.queue.length) session.queue = shuffle(session.pool);
  session.nextSentence = session.queue.length ? session.queue[session.queue.length - 1] : null;
}

$('#btn-start-game').addEventListener('click', () => startGameFlow());
$('#btn-play-again').addEventListener('click', () => startGameFlow());
$('#btn-back-setup').addEventListener('click', () => { renderSetup(); showScreen('screen-setup'); });
$('#btn-goto-survey').addEventListener('click', () => { window.open(SURVEY_URL, '_blank'); });
$('#btn-end-session').addEventListener('click', () => { if (game && !game.endTime) finishSession(false); });

function startGameFlow() {
  // 診断やり直しの提案を見たのに、やり直さずに次のプレイを始めたら、提案は消してカウントをリセットする
  const s = getStats();
  if (s.rediagnosePromptShown) {
    s.fullTimeStreak = 0;
    s.rediagnosePromptShown = false;
    saveStats(s);
  }

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
  if (!/^[a-zA-Z\-]$/.test(e.key)) return;
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
  if (currentElapsedSec() >= game.timeLimitSec) finishSession(true);
}

function processChar(ch) {
  const mora = game.moras[game.idx];
  if (!mora) return;
  const tentative = game.buffer + ch;
  const exact = mora.options.find((c) => c === tentative);
  // 「ん」は options=['n','nn'] のように短い選択肢が長い選択肢の接頭辞になっている。
  // 完全一致していても、まだ長い選択肢へ伸ばせる余地があり、かつ最後のモーラでなければ
  // すぐには確定しない（そうしないと "n" を2回打った2打目が次のモーラへの誤入力として
  // 扱われてしまう）。最後のモーラなら、それ以上入力が来ないので即座に確定する。
  const hasLongerOption = mora.options.some((c) => c.length > tentative.length && c.startsWith(tentative));
  const isLastMora = game.idx === game.moras.length - 1;

  if (exact && (!hasLongerOption || isLastMora)) {
    game.totalCorrect++;
    finishMora(exact);
  } else if (hasLongerOption) {
    game.buffer = tentative;
    game.totalCorrect++;
  } else {
    // 延長できず完全一致もしない場合、保留中のバッファ自体が既に完了済みの短い選択肢
    // （例:「ん」を"n"だけ打って次のモーラへ進む場合）なら、それを確定してから
    // 今回打った文字を次のモーラへの入力として再評価する。
    const bufferExact = mora.options.find((c) => c === game.buffer);
    if (bufferExact) {
      finishMora(bufferExact);
      processChar(ch);
      return;
    }
    game.totalMistakes++;
    // レア文・ボーナス文は、ミスタイプした時点で特別扱いを取り消す（ボーナス加点も付かなくなる）
    game.rareTier = null;
    game.isBonusSentence = false;
    const el = $('#game-romaji');
    el.classList.add('mistake-flash');
    setTimeout(() => el.classList.remove('mistake-flash'), 150);
  }
  renderGame();
}

function finishMora(exactOption) {
  game.committed[game.idx] = exactOption;
  game.idx++;
  game.buffer = '';
  if (game.idx >= game.moras.length) {
    game.sentencesCompleted++;
    if (game.isBonusSentence) {
      game.totalCorrect += 30;
    }
    triggerSentenceCompleteEffect(game.isBonusSentence);
    maybeShowThanksToast();
    maybeTriggerDisruptorGlitch();
    loadNextSentence(game);
  }
}

function renderGame() {
  updateThemeColor();
  const sentenceEl = $('#game-sentence');
  sentenceEl.classList.remove('bonus-sentence', 'rare-sentence', 'rare-sentence-super', 'rare-sentence-ultra');
  const freeSpiritColor = appState.setup.avatarColor || HEXAD_TYPES.freeSpirit.color;
  if (game.isBonusSentence) {
    sentenceEl.classList.add('bonus-sentence');
    $('#game-kanji').innerHTML = `✨ <span style="color:#eda100">${game.sentence.kanji}</span> ✨`;
  } else if (game.rareTier === 'ultra') {
    sentenceEl.classList.add('rare-sentence-ultra');
    $('#game-kanji').innerHTML = `🎆🌠 <span style="color:${freeSpiritColor}">${game.sentence.kanji}</span> 🌠🎆`;
  } else if (game.rareTier === 'super') {
    sentenceEl.classList.add('rare-sentence-super');
    $('#game-kanji').innerHTML = `💫✨ <span style="color:${freeSpiritColor}">${game.sentence.kanji}</span> ✨💫`;
  } else if (game.rareTier === 'rare') {
    sentenceEl.classList.add('rare-sentence');
    $('#game-kanji').innerHTML = `🌟 <span style="color:${freeSpiritColor}">${game.sentence.kanji}</span> 🌟`;
  } else {
    $('#game-kanji').textContent = game.sentence.kanji;
  }
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
  const nextPreview = $('#game-next-preview');
  if (nextPreview) {
    nextPreview.innerHTML = game.nextSentence
      ? `<span class="next-label">NEXT</span><span class="next-text">${game.nextSentence.kanji}</span>`
      : '';
  }
  updateHud();
  renderSidePanel();
}

// 利他主義者（メインまたは準タイプ）: 低確率で「ありがとう」演出
function maybeShowThanksToast() {
  const chance = typeChance(appState.hexadResult, ['philanthropist'], 0.35, 0.12);
  if (chance <= 0 || Math.random() >= chance) return;
  const el = $('#game-sentence');
  const msg = THANKS_MESSAGES[Math.floor(Math.random() * THANKS_MESSAGES.length)];
  const toast = document.createElement('div');
  toast.textContent = `💚 ${msg}`;
  toast.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);' +
    `color:${HEXAD_TYPES.philanthropist.color};font-size:0.82rem;font-weight:600;` +
    'pointer-events:none;animation:floatUp 1.6s ease forwards;white-space:nowrap;';
  el.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

// 変革者（メインまたは準タイプ）: 文完了時に専用エフェクト（毎回同じにならないよう複数パターンから抽選）
const DISRUPTOR_EFFECTS = ['disruptor-flash-glitch', 'disruptor-flash-invert', 'disruptor-flash-wobble'];
function maybeTriggerDisruptorGlitch() {
  const chance = typeChance(appState.hexadResult, ['disruptor'], 0.7, 0.2);
  if (chance <= 0 || Math.random() >= chance) return;
  const el = $('#game-sentence');
  DISRUPTOR_EFFECTS.forEach((c) => el.classList.remove(c));
  void el.offsetWidth;
  const effect = DISRUPTOR_EFFECTS[Math.floor(Math.random() * DISRUPTOR_EFFECTS.length)];
  el.classList.add(effect);
  setTimeout(() => el.classList.remove(effect), 500);
}

function triggerSentenceCompleteEffect(isBonus = false) {
  const el = $('#game-sentence');
  el.classList.remove('sentence-complete-flash');
  void el.offsetWidth;
  el.classList.add('sentence-complete-flash');
  setTimeout(() => el.classList.remove('sentence-complete-flash'), 600);

  const pop = document.createElement('div');
  pop.textContent = isBonus ? '✨ BONUS! +30 ✨' : '+1';
  pop.style.position = 'absolute';
  pop.style.top = '10px';
  pop.style.right = '20px';
  pop.style.color = isBonus ? '#eda100' : 'var(--theme-color, #2a78d6)';
  pop.style.fontWeight = 'bold';
  pop.style.fontSize = isBonus ? '1.5rem' : '1.2rem';
  pop.style.pointerEvents = 'none';
  pop.style.animation = 'floatUp 0.8s ease forwards';
  el.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
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
function hudSocialiser() {
  const rival = findNextRival(getStats(), currentCpm());
  return rival
    ? `<div class="hud-item">${escapeHtml(rival.name)}まで<strong style="color:${HEXAD_TYPES.socialiser.color};">${Math.max(0, rival.cpm - currentCpm())}</strong></div>`
    : `<div class="hud-item">現在<strong style="color:${HEXAD_TYPES.socialiser.color};">トップ</strong></div>`;
}
function hudFreeSpirit() { return ''; }
function hudPhilanthropist() { const s = getStats(); return `<div class="hud-item">貢献合計<strong>${s.communityTotal + game.totalCorrect} 文字</strong></div>`; }
function hudDisruptor() { return `<div class="hud-item">ルール<strong>${getDisruptorRule(appState.setup.rule, getStats()).label}</strong></div>`; }

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

function computeScore(cpm, acc, totalChars) { 
  return Math.round((totalChars * cpm * acc) / 1000); 
}

function vizAchiever() {
  const cpm = currentCpm();
  const acc = currentAccuracy();
  const total = game ? game.totalCorrect : 0;
  const stars = acc >= 95 && cpm >= 150 ? '★★★' : acc >= 85 ? '★★☆' : '★☆☆';
  const color = HEXAD_TYPES.achiever.color;
  return `
    <p class="hint">今終えた場合の評価</p>
    <p style="font-size:1.3rem;">${stars} <strong style="color:${color};font-size:1.3rem;">${computeScore(cpm, acc, total)} pt</strong></p>
    ${barRow('速度', (cpm / 300) * 100, `${cpm}`, color)}
    ${barRow('正確率', acc, `${acc}%`, color)}
  `;
}

function vizPlayer() {
  const stats = getStats();
  const projected = stats.coins + game.totalCorrect;
  const nextToBuy = COLOR_SHOP.find((u) => !stats.unlockedColors.includes(u.color) && projected < u.coins);
  const pct = nextToBuy ? (projected / nextToBuy.coins) * 100 : 100;
  return `
    <p class="hint">🪙 このプレイでの獲得コイン: <strong>${game.totalCorrect}</strong>（合計見込み ${projected}）</p>
    ${barRow(nextToBuy ? '次に買えるカラーまで' : '全カラー購入可能', pct, `${Math.round(pct)}%`, appState.setup.avatarColor || HEXAD_TYPES.player.color)}
  `;
}

function vizSocialiser() {
  const mine = currentCpm();
  const stats = getStats();
  const rival = findNextRival(stats, mine);
  const rankInfo = computeGlobalRank(stats, mine);
  return `
    <p class="hint">${rankInfo ? `記録内での順位: 上位${rankInfo.rank}位 / ${rankInfo.total}件中` : '記録内での順位: まだ記録がありません'}</p>
    <p style="font-size:1.3rem;">${rival ? `🎯 <strong style="color:${HEXAD_TYPES.socialiser.color};">${escapeHtml(rival.name)}</strong> まであと ${Math.max(0, rival.cpm - mine)} CPM` : '🏆 現在みんなの中でトップです！'}</p>
    ${barRow('あなたの速度', (mine / 300) * 100, `${mine} CPM`, HEXAD_TYPES.socialiser.color)}
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
  const rule = getDisruptorRule(appState.setup.rule, getStats());
  const score = rule.calc(currentCpm(), currentAccuracy(), game ? game.totalCorrect : 0);
  return `
    <p class="hint">適用ルール: ${rule.label}</p>
    <p style="font-size:1.8rem;font-weight:700;color:${HEXAD_TYPES.disruptor.color}">${score} pt</p>
  `;
}

function finishSession(isFullTime) {
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
  }, !!isFullTime);
}

/* ============================================================
   6. 結果画面 & タイプ別ゲーミフィケーション反映
   ============================================================ */

function onGameFinished(result, isFullTime) {
  const type = appState.hexadResult ? appState.hexadResult.primaryType : 'achiever';
  const stats = getStats();

  // クリア判定・連続記録・自己ベストの更新は、statsを今回の結果で書き換える「前」に行う。
  // （そうしないと今回出した自己ベストがそのまま次の目標値になり、自己矛盾する）
  const clearStatus = evaluateClearStatus(result, type);
  if (clearStatus.cleared) {
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  // 難易度を手動調整できないタイプ（プレイヤー・自由人・利他主義者）は、
  // クリアすれば目標が上がり、失敗すれば少し下がる（きつくなりすぎないように）。
  // 難易度を選べるタイプ（達成者・変革者）は目標レベルで自分で調整できるため、
  // 従来通り自己ベストに応じて上がり続けるだけにする。
  // 社交家は自己ベストではなく「記録内の実在のライバル」との比較なので、ここでの状態更新は不要
  // （目標は常にリーダーボードから動的に算出され、失敗しても難しくなり続けることはない）。
  if (type === 'player' || type === 'philanthropist') {
    if (clearStatus.cleared) {
      stats.bestSessionChars = Math.max(stats.bestSessionChars || 0, result.correctKeystrokes);
    } else if ((stats.bestSessionChars || 0) > 0) {
      stats.bestSessionChars = Math.max(0, Math.round(stats.bestSessionChars * 0.85));
    }
  } else if (type === 'freeSpirit') {
    if (clearStatus.cleared) {
      stats.bestSessionSentences = Math.max(stats.bestSessionSentences || 0, result.sentencesCompleted);
    } else if ((stats.bestSessionSentences || 0) > 0) {
      stats.bestSessionSentences = Math.max(0, Math.round(stats.bestSessionSentences * 0.85));
    }
  } else if (type === 'disruptor') {
    const rule = getDisruptorRule(appState.setup.rule || 'chaos', stats);
    const score = rule.calc(result.cpm, result.accuracy, result.correctKeystrokes);
    stats.bestDisruptorScore = Math.max(stats.bestDisruptorScore || 0, score);
  }

  // タイプ診断のやり直し提案: 制限時間いっぱいまでプレイし切ったセッションが3回続いたら
  // 設定画面で提案する（途中で切り上げたセッションはカウントしない）
  if (isFullTime) {
    stats.fullTimeStreak = (stats.fullTimeStreak || 0) + 1;
  }

  stats.sessionsCompleted++;
  stats.totalCorrectChars += result.correctKeystrokes;
  stats.totalPlayTimeSec += result.elapsedSec;
  stats.communityTotal += result.correctKeystrokes;
  stats.coins += result.correctKeystrokes + 20;

  stats.leaderboard.push({ name: appState.nickname, cpm: result.cpm, accuracy: result.accuracy, date: new Date().toISOString() });
  stats.leaderboard = stats.leaderboard.sort((a, b) => b.cpm - a.cpm).slice(0, 20);

  saveStats(stats);

  const sessionLogRecord = {
    timestamp: new Date().toISOString(),
    participantId: appState.participantId || null,
    group: appState.group || null,
    nickname: appState.nickname,
    hexadType: type,
    hexadScores: appState.hexadResult ? appState.hexadResult.scores : null,
    classifyMethod: 'survey',
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
  };

  appendLog(sessionLogRecord);
  saveSessionToVercelDb(sessionLogRecord);

  renderPostgame(result, stats, clearStatus);
  showScreen('screen-postgame');
}

function renderPostgame(result, stats, clearStatus) {
  const type = appState.hexadResult ? appState.hexadResult.primaryType : 'achiever';

  const bannerEl = $('#clear-status-banner');
  if (bannerEl) {
    bannerEl.className = `clear-banner ${clearStatus.cleared ? 'cleared' : 'failed'}`;
    bannerEl.innerHTML = `
      <div class="clear-title">${clearStatus.title}</div>
      <div class="clear-desc">${clearStatus.desc}</div>
    `;
  }

  $('#postgame-stats').innerHTML = `
    <div class="stat-tile"><div class="stat-value">${result.elapsedSec.toFixed(1)}秒</div><div class="stat-label">タイム</div></div>
    <div class="stat-tile"><div class="stat-value">${result.cpm}</div><div class="stat-label">文字/分</div></div>
    <div class="stat-tile"><div class="stat-value">${result.accuracy}%</div><div class="stat-label">正確率</div></div>
    <div class="stat-tile"><div class="stat-value">${result.sentencesCompleted}</div><div class="stat-label">完了した文</div></div>
  `;

  const builders = { achiever: postAchiever, player: postPlayer, socialiser: postSocialiser, freeSpirit: postFreeSpirit, philanthropist: postPhilanthropist, disruptor: postDisruptor };
  $('#postgame-gamification').innerHTML = builders[type](result, stats) + secondaryTouchPostHtml(appState.hexadResult, stats, result);

  const pidNote = $('#participant-id-display');
  if (pidNote) {
    pidNote.textContent = appState.participantId ? `参加者番号: ${appState.participantId}` : '';
    pidNote.style.display = appState.participantId ? 'block' : 'none';
  }

  // アンケートへの案内・研究データのエクスポートは、合計15分（900秒）以上プレイしてから表示する
  // （FORM／DE-TAコマンドを使えば、この条件を満たしていなくてもいつでも呼び出せる）
  const timeGateMet = stats.totalPlayTimeSec >= 900;
  const surveyBox = $('#survey-cta-box');
  if (surveyBox) {
    surveyBox.style.display = timeGateMet ? 'block' : 'none';
  }
  const exportUi = $('#secret-export-ui');
  if (exportUi && timeGateMet) {
    exportUi.style.display = 'block';
  }

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
    <p>🔥 連続クリア: <strong>${stats.currentStreak || 0}</strong>回（自己最高 ${stats.bestStreak || 0}回）</p>
    ${renderPersonalHistoryHtml(stats, result.cpm)}
  `;
}
function postPlayer(result, stats) {
  return `
    <h3>報酬</h3>
    <p>獲得コイン: <strong>+${result.correctKeystrokes + 20}</strong> 🪙（合計 ${stats.coins}）</p>
    <p class="hint">ショップでアバターカラーを購入できます。</p>
  `;
}
function postSocialiser(result, stats) {
  const rankInfo = computeGlobalRank(stats, result.cpm);
  const rival = findNextRival(stats, result.cpm);
  return `
    <h3>みんなとの比較</h3>
    ${rankInfo ? `<p style="font-size:1.3rem;">🏅 記録内での順位: <strong style="color:${HEXAD_TYPES.socialiser.color};">上位 ${rankInfo.rank}位</strong> / ${rankInfo.total}件中</p>` : ''}
    ${rival
      ? `<p class="hint">🎯 次のライバル: <strong>${escapeHtml(rival.name)}</strong>（${rival.cpm} CPM）まであと ${Math.max(0, rival.cpm - result.cpm)} CPM</p>`
      : '<p class="hint">🏆 現在みんなの中でトップです！</p>'}
    ${renderCommunityLeaderboardHtml(stats, result.cpm)}
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
function postDisruptor(result, stats) {
  const rule = getDisruptorRule(appState.setup.rule, stats);
  const score = rule.calc(result.cpm, result.accuracy, result.correctKeystrokes);
  return `
    <h3>あなたのルールでのスコア</h3>
    <p>適用ルール: <strong>${rule.label}</strong></p>
    <p style="font-size:1.6rem;font-weight:700;color:${HEXAD_TYPES.disruptor.color}">${score} pt</p>
    <p class="hint">自己ベスト: ${stats.bestDisruptorScore || 0} pt</p>
    <p class="hint">既存の採点基準にとらわれず、自分で選んだ（あるいは自分で作った）ルールで評価しました。</p>
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
  const cols = ['timestamp', 'participantId', 'group', 'nickname', 'hexadType', 'classifyMethod', 'sentenceCategory', 'difficulty', 'timeLimitSec', 'sentencesCompleted', 'elapsedSec', 'cpm', 'accuracy', 'mistakes', 'correctKeystrokes'];
  const hexadScoreCols = HEXAD_ORDER.map((t) => `score_${t}`);
  const header = [...cols, ...hexadScoreCols].join(',');
  const rows = log.map((r) => {
    const base = cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`);
    const scores = HEXAD_ORDER.map((t) => r.hexadScores ? (r.hexadScores[t] ?? '') : '');
    return [...base, ...scores].join(',');
  });
  downloadBlob(`typing_research_log_${Date.now()}.csv`, '\uFEFF' + [header, ...rows].join('\n'), 'text/csv');
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

// index.html から動的に読み込まれる場合はDOMContentLoadedが既に発火済みのため、
// その場合は即座に初期化する。
function bootApp() {
  initParticipantInfo();
  initWelcomeScreen();
  fetchStatsFromVercelDb();

  // 隠しコマンド処理
  let secretBuffer = '';
  let secretCodeBuffer = [];
  document.addEventListener('keydown', (e) => {
    if (e.code) {
      secretCodeBuffer.push(e.code);
      if (secretCodeBuffer.length > 20) secretCodeBuffer.shift();
    }
    const isDeTaCode = secretCodeBuffer.slice(-5).join(',') === 'KeyD,KeyE,Minus,KeyT,KeyA';

    if (e.key && e.key.length === 1) {
      secretBuffer += e.key.toLowerCase();
    }
    if (secretBuffer.length > 30) secretBuffer = secretBuffer.slice(-30);
    
    // 隠しコマンド1: de-ta / でーた (エクスポート画面表示)
    if (
      isDeTaCode ||
      secretBuffer.endsWith('de-ta') ||
      secretBuffer.endsWith('でーた') ||
      secretBuffer.endsWith('deta')
    ) {
      const exportUi = $('#secret-export-ui');
      if (exportUi) {
        exportUi.style.display = 'block';
        exportUi.open = true;
        exportUi.scrollIntoView({ behavior: 'smooth' });
      }
      secretBuffer = '';
      secretCodeBuffer = [];
    }

    // 隠しコマンド2: FORM (Googleフォームを開く)
    if (secretBuffer.toUpperCase().endsWith('FORM') || secretCodeBuffer.slice(-4).join(',') === 'KeyF,KeyO,KeyR,KeyM') {
      window.open(SURVEY_URL, '_blank');
      secretBuffer = '';
      secretCodeBuffer = [];
    }

    // 隠しコマンド3: KENNKYUUSYA（研究者用。この端末に保存された診断結果・プレイ履歴を全消去）
    if (
      secretBuffer.toUpperCase().endsWith('KENNKYUUSYA') ||
      secretCodeBuffer.slice(-11).join(',') === 'KeyK,KeyE,KeyN,KeyN,KeyK,KeyY,KeyU,KeyU,KeyS,KeyY,KeyA'
    ) {
      secretBuffer = '';
      secretCodeBuffer = [];
      if (confirm('この端末に保存されている診断結果・プレイ履歴・実績等をすべて消去します。よろしいですか？')) {
        localStorage.clear();
        location.reload();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
