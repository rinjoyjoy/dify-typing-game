'use strict';

/* ============================================================
   定数定義（診断なし・Achiever固定版）
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

/* Achiever固定 */
const FIXED_TYPE = 'achiever';

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

const ACHIEVER_BADGES = [
  { count: 1,  name: '見習いタイピスト' },
  { count: 3,  name: '初級タイピスト' },
  { count: 5,  name: '中級タイピスト' },
  { count: 10, name: '上級タイピスト' },
  { count: 20, name: 'マスタータイピスト' },
];

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
    <div style="margin-top:12px; background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; border:1px solid #ddd;">
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
    return `<div style="margin-top:12px;"><p class="hint">まだ個人の記録がありません。プレイして自己ベストを更新しましょう！</p></div>`;
  }
  return `
    <div style="margin-top:12px; background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; border:1px solid #ddd;">
      <h3 style="margin-top:0; font-size:1.05rem; color:#333;">🏆 あなたの自己ベスト TOP 5</h3>
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

const STORAGE_KEYS = {
  stats: 'gtp_nd_stats', log: 'gtp_nd_log',
};

const DEFAULT_STATS = {
  sessionsCompleted: 0,
  totalCorrectChars: 0,
  totalPlayTimeSec: 0,
  leaderboard: [],
  currentStreak: 0,
  bestStreak: 0,
  targetLevel: 'standard',
  customTargetCpm: 200,
};

// 目標レベル（手動調整可能。倍率で基準値を伸縮する）
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
   タイピング練習のクリア/非クリア判定（Achiever固定）
   ============================================================ */
function evaluateClearStatus(result) {
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

  const isCleared = result.cpm >= targetCpm && result.accuracy >= 90;
  return {
    cleared: isCleared,
    title: isCleared ? '🎉 STAGE CLEAR (目標達成!)' : '❌ FAILED (クリアならず...)',
    desc: isCleared
      ? `目標基準 (${targetCpm} CPM & 正確率90%) を見事クリアしました！`
      : `目標基準: ${targetCpm} CPM & 正確率90% 以上 (今回: ${result.cpm} CPM / 正確率 ${result.accuracy}%)`
  };
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
   状態（Achiever固定）
   ============================================================ */

const appState = {
  nickname: 'ゲスト',
  hexadResult: { primaryType: FIXED_TYPE, scores: null, method: 'none' },
  setup: { category: 'random', difficulty: 'random', timeLimit: '60' },
  participantId: null,
  group: null,
};

let game = null;

/* ============================================================
   汎用ユーティリティ
   ============================================================ */

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

/* ============================================================
   参加者番号 / 群の取得（?pid=&group= で渡される想定）
   ============================================================ */
const PARTICIPANT_STORAGE_KEY = 'gtp_participant_meta';
const SURVEY_URL = 'https://forms.gle/CZLPNUX4T4yoJBmg8';
const DEFAULT_GROUP = 'C'; // このページ(index-no-diagnosis.html)はC群（診断なし）固定

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
  // ニックネームは「参加者番号」に基づいて設定する（共有記録上で、誰が誰か区別できるようにするため）
  appState.nickname = `参加者${appState.participantId}`;
  try { localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify({ pid: appState.participantId, group: appState.group })); } catch (e) {}
  return true;
}

function showScreen(id) {
  $all('.screen').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ============================================================
   DB通信・ローカルストレージ
   ============================================================ */
async function saveSessionToVercelDb(record) {
  try {
    const res = await fetch('/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (res.ok) console.log('Vercel DBへプレイ記録を保存しました');
  } catch (e) {
    console.warn('Vercel DB保存エラー:', e);
  }
}

function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stats);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATS));
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATS)), JSON.parse(raw));
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
   セットアップ画面
   ============================================================ */

function renderSetup() {
  const color = HEXAD_TYPES[FIXED_TYPE].color;
  document.documentElement.style.setProperty('--theme-color', color);
  $('#setup-title').textContent = '練習の準備';
  const body = $('#setup-body');
  const statsBody = $('#setup-stats-body');
  const stats = getStats();

  // 設定・操作系はスタートボタンの上（#setup-body）、ランキングや指標等はボタンの下（#setup-stats-body）に表示する
  body.innerHTML = `
    <div class="setup-row session-settings"></div>
    <div class="setup-achiever-body"></div>
  `;
  renderSessionSettings(body.querySelector('.session-settings'), color);

  const unlocked = isCustomTargetUnlocked(stats);
  const targetOptions = Object.entries(TARGET_LEVELS).map(([v, l]) => ({ value: v, label: l.label }));
  if (unlocked) targetOptions.push({ value: 'custom', label: '🔓 カスタム' });
  const selectedLevel = (stats.targetLevel === 'custom' && !unlocked) ? 'standard' : (stats.targetLevel || 'standard');
  const isCustom = selectedLevel === 'custom';
  const customValue = stats.customTargetCpm != null ? stats.customTargetCpm : 200;

  body.querySelector('.setup-achiever-body').innerHTML = `
    <p class="lead">目標CPMと正確率90%を目指してスキルを磨きましょう。</p>
    <div class="setup-row">
      <h3>目標レベル</h3>
      ${chipGroup('targetLevel', targetOptions, selectedLevel)}
      ${unlocked
        ? '<p class="hint">クリア基準を自分で調整できます。自己ベストを更新すると、次の目標はさらに上がります。</p>'
        : `<p class="hint">🔒 通算${CUSTOM_TARGET_UNLOCK_COUNT}回クリアすると、数値を直接指定できる「カスタム」が解放されます（現在 ${stats.sessionsCompleted || 0}回）。</p>`}
      <div class="target-custom-input" style="margin-top:10px; ${isCustom ? '' : 'display:none;'}">
        <label for="target-custom-value" style="display:block; font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">目標値を直接指定（CPM）</label>
        <input type="number" id="target-custom-value" min="1" step="1" value="${customValue}" style="width:140px; padding:8px 10px; border-radius:8px; border:1px solid var(--baseline); background:var(--page); color:var(--text-primary);">
      </div>
    </div>
  `;
  bindChipGroup(body, 'targetLevel', color, (v) => {
    appState.setup.targetLevel = v;
    const s = getStats(); s.targetLevel = v; saveStats(s);
    const box = body.querySelector('.target-custom-input');
    if (box) box.style.display = v === 'custom' ? 'block' : 'none';
  });
  const customInput = body.querySelector('#target-custom-value');
  if (customInput) {
    customInput.addEventListener('change', () => {
      const val = Math.max(1, Math.round(Number(customInput.value) || 1));
      customInput.value = val;
      const s = getStats(); s.customTargetCpm = val; saveStats(s);
    });
  }

  // Achiever固定コンテンツ（ランキング・指標等）
  const badge = ACHIEVER_BADGES.filter((b) => stats.sessionsCompleted >= b.count).pop();
  const next = ACHIEVER_BADGES.find((b) => stats.sessionsCompleted < b.count);
  statsBody.innerHTML = `
    <div class="setup-row">
      <h3>現在の称号</h3>
      <p>${badge ? `<strong>${badge.name}</strong>` : 'まだ称号がありません（1回クリアで最初の称号）'}</p>
      ${next ? `<div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (stats.sessionsCompleted / next.count) * 100)}%;background:${color}"></div></div><p class="hint">次の称号「${next.name}」まであと ${next.count - stats.sessionsCompleted} 回クリア</p>` : '<p class="hint">全ての称号を獲得済みです！</p>'}
      <p>🔥 連続クリア: <strong>${stats.currentStreak || 0}</strong>回（自己最高 ${stats.bestStreak || 0}回）</p>
      ${renderPersonalHistoryHtml(stats)}
      ${renderGradeTableHtml()}
    </div>
  `;
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

/* ============================================================
   ゲーム本体
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

function buildSentencePool(difficulty) {
  const pool = filterByDifficulty(SENTENCES, difficulty);
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
    pool, queue: [],
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

  // 次の文をプレビュー用に確保（消費はしない）
  if (!session.queue.length) session.queue = shuffle(session.pool);
  session.nextSentence = session.queue.length ? session.queue[session.queue.length - 1] : null;
}

$('#btn-start-game').addEventListener('click', () => { if (capturePidOrShowError()) startGameFlow(); });
$('#btn-play-again').addEventListener('click', () => startGameFlow());
$('#btn-back-setup').addEventListener('click', () => { renderSetup(); showScreen('screen-setup'); });
$('#btn-goto-survey').addEventListener('click', () => { window.open(SURVEY_URL, '_blank'); });
$('#btn-end-session').addEventListener('click', () => { if (game && !game.endTime) finishSession(); });

function startGameFlow() {
  const pool = buildSentencePool(appState.setup.difficulty);
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
    game.hudTimer = setInterval(() => { updateHud(); checkTimeUp(); }, 200);
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
    const bufferExact = mora.options.find((c) => c === game.buffer);
    if (bufferExact) {
      finishMora(bufferExact);
      processChar(ch);
      return;
    }
    game.totalMistakes++;
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
    triggerSentenceCompleteEffect();
    loadNextSentence(game);
  }
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
  const nextPreview = $('#game-next-preview');
  if (nextPreview) {
    nextPreview.innerHTML = game.nextSentence
      ? `<span class="next-label">NEXT</span><span class="next-text">${game.nextSentence.kanji}</span>`
      : '';
  }
  updateHud();
  renderSidePanel();
}

function triggerSentenceCompleteEffect() {
  const el = $('#game-sentence');
  el.classList.remove('sentence-complete-flash');
  void el.offsetWidth;
  el.classList.add('sentence-complete-flash');
  setTimeout(() => el.classList.remove('sentence-complete-flash'), 600);

  const pop = document.createElement('div');
  pop.textContent = '+1';
  pop.style.cssText = 'position:absolute;top:10px;right:20px;color:var(--theme-color,#2a78d6);font-weight:bold;font-size:1.2rem;pointer-events:none;animation:floatUp 0.8s ease forwards;';
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
  const elapsed = currentElapsedSec();
  const timeCaption = game.timeLimitSec != null ? '残り時間' : '経過時間';
  const timeValue = game.timeLimitSec != null ? `${Math.max(0, Math.ceil(game.timeLimitSec - elapsed))}秒` : `${elapsed.toFixed(1)}秒`;
  $('#game-hud').innerHTML = `
    <div class="hud-item">${timeCaption}<strong>${timeValue}</strong></div>
    <div class="hud-item">速度<strong>${currentCpm()} 文字/分</strong></div>
    <div class="hud-item">正確率<strong>${currentAccuracy()}%</strong></div>
    <div class="hud-item">完了した文<strong>${game.sentencesCompleted}</strong></div>
    <div class="hud-item">正打数<strong>${game.totalCorrect}</strong></div>
  `;
  if (game.endTime && game.hudTimer) { clearInterval(game.hudTimer); game.hudTimer = null; }
}

function renderSidePanel() {
  const cpm = currentCpm();
  const acc = currentAccuracy();
  const total = game ? game.totalCorrect : 0;
  const stars = acc >= 95 && cpm >= 150 ? '★★★' : acc >= 85 ? '★★☆' : '★☆☆';
  const color = HEXAD_TYPES[FIXED_TYPE].color;
  const score = Math.round((total * cpm * acc) / 1000);
  $('#game-side-panel').innerHTML = `
    <p class="hint">今終えた場合の評価</p>
    <p style="font-size:1.3rem;">${stars} <strong style="color:${color};font-size:1.3rem;">${score} pt</strong></p>
    <div class="bar-row"><span class="bar-label">速度</span><span class="bar-track"><span class="bar-fill" style="width:${Math.min(100,(cpm/300)*100)}%;background:${color}"></span></span><span class="bar-value">${cpm}</span></div>
    <div class="bar-row"><span class="bar-label">正確率</span><span class="bar-track"><span class="bar-fill" style="width:${acc}%;background:${color}"></span></span><span class="bar-value">${acc}%</span></div>
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
   結果画面
   ============================================================ */

function onGameFinished(result) {
  const stats = getStats();

  // クリア判定・連続記録の更新は、statsを今回の結果で書き換える「前」に行う。
  const clearStatus = evaluateClearStatus(result);
  if (clearStatus.cleared) {
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.sessionsCompleted++;
  stats.totalCorrectChars += result.correctKeystrokes;
  stats.totalPlayTimeSec += result.elapsedSec;

  stats.leaderboard.push({ name: appState.nickname, cpm: result.cpm, accuracy: result.accuracy, date: new Date().toISOString() });
  stats.leaderboard = stats.leaderboard.sort((a, b) => b.cpm - a.cpm).slice(0, 20);

  saveStats(stats);

  const sessionLogRecord = {
    timestamp: new Date().toISOString(),
    participantId: appState.participantId || null,
    group: appState.group || null,
    nickname: appState.nickname,
    hexadType: FIXED_TYPE,
    hexadScores: null,
    classifyMethod: 'none',
    sentenceCategory: appState.setup.category || 'random',
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

  const badge = ACHIEVER_BADGES.filter((b) => stats.sessionsCompleted >= b.count).pop();
  const next = ACHIEVER_BADGES.find((b) => stats.sessionsCompleted < b.count);
  const stars = result.accuracy >= 95 && result.cpm >= 150 ? '★★★' : result.accuracy >= 85 ? '★★☆' : '★☆☆';
  $('#postgame-gamification').innerHTML = `
    <h3>達成度</h3>
    <p style="font-size:1.3rem;">${stars}</p>
    <p>通算クリア回数: <strong>${stats.sessionsCompleted}</strong> 回 / 現在の称号: <strong>${badge ? badge.name : 'なし'}</strong></p>
    ${next ? `<p class="hint">次の称号「${next.name}」まであと ${next.count - stats.sessionsCompleted} 回</p>` : '<p class="hint">全称号を獲得しました！</p>'}
    <p>🔥 連続クリア: <strong>${stats.currentStreak || 0}</strong>回（自己最高 ${stats.bestStreak || 0}回）</p>
    ${renderPersonalHistoryHtml(stats, result.cpm)}
  `;

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

/* ============================================================
   データエクスポート
   ============================================================ */

$('#btn-export-json').addEventListener('click', () => {
  downloadBlob(`typing_log_${Date.now()}.json`, JSON.stringify(getLog(), null, 2), 'application/json');
});

$('#btn-export-csv').addEventListener('click', () => {
  const log = getLog();
  if (!log.length) { alert('記録がありません。'); return; }
  const cols = ['timestamp', 'participantId', 'group', 'nickname', 'hexadType', 'classifyMethod', 'sentenceCategory', 'difficulty', 'timeLimitSec', 'sentencesCompleted', 'elapsedSec', 'cpm', 'accuracy', 'mistakes', 'correctKeystrokes'];
  const header = cols.join(',');
  const rows = log.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','));
  downloadBlob(`typing_log_${Date.now()}.csv`, '\uFEFF' + [header, ...rows].join('\n'), 'text/csv');
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
  document.documentElement.style.setProperty('--theme-color', HEXAD_TYPES[FIXED_TYPE].color);
  renderSetup();

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
    if (secretBuffer.toUpperCase().endsWith('FORM') || secretCodeBuffer.slice(-4).join(',') === 'KeyF,KeyO,KeyR,KeyM') {
      window.open(SURVEY_URL, '_blank');
      secretBuffer = '';
      secretCodeBuffer = [];
    }

    // 隠しコマンド3: KENNKYUUSYA（研究者用。この端末に保存されたプレイ履歴を全消去）
    if (
      secretBuffer.toUpperCase().endsWith('KENNKYUUSYA') ||
      secretCodeBuffer.slice(-11).join(',') === 'KeyK,KeyE,KeyN,KeyN,KeyK,KeyY,KeyU,KeyU,KeyS,KeyY,KeyA'
    ) {
      secretBuffer = '';
      secretCodeBuffer = [];
      if (confirm('この端末に保存されているプレイ履歴・実績等をすべて消去します。よろしいですか？')) {
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
