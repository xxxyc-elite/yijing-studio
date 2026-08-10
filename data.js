// data.js —— 易卦研习·网页版数据层（整合自小程序 utils，纯前端可跑）
// 六十四卦卦名、卦象结构、卦辞大意与八卦类象。

/* ============ 一、八卦 + 六十四卦 ============ */
// 八卦：lines 为「初、二、三」由下到上（1=阳 —，0=阴 --）
// images 依据张延生《易学入门》八卦之象整理并中性化
export const TRIGRAM = {
  qian: { name: '乾', lines: [1, 1, 1], nature: '天', desc: '刚健，主创生与动力',
    images: { wuxing: '金', shape: '点、圆、球、弯曲等状',
      things: ['金玉珠宝','水晶','钻石','钟表','镜子','古旧物','高级物品','各种结晶体','帽子','眼镜'],
      places: ['首都','皇宫','大会堂','政府机构','圣地','名胜古迹','郊野'],
      taste: '辛辣', family: '父', body: '头、大肠、手阳明大肠经、骨、圆关节', num: { xiantian: 1, luoshu: 6 } } },
  dui: { name: '兑', lines: [1, 1, 0], nature: '泽', desc: '喜悦，主和悦与言语',
    images: { wuxing: '金', shape: '有缺口、小口、小巧、破损等状',
      things: ['饮食器具','食品','五金用具','瓶子','玩具','乐器'],
      places: ['沼泽地','洼地','游乐园','音乐厅','饭馆','路口','洞穴','交流场所'],
      taste: '辛辣', family: '少女', body: '口、肺、气管、右手臂、右胁', num: { xiantian: 2, luoshu: 7 } } },
  li: { name: '离', lines: [1, 0, 1], nature: '火', desc: '光明，主附丽与明察',
    images: { wuxing: '火', shape: '外硬内空、明亮、美丽鲜艳、随意、三角形等状',
      things: ['文章','字画','书刊杂志','合同书','契约','屋子','箱子','窗户','化妆品','相机','电视机','照明设备','印制'],
      places: ['火山','院子','图书馆','影剧院','电视台','电站','炉冶场所'],
      taste: '苦', family: '中女', body: '目、心、小肠、头首膺喉', num: { xiantian: 3, luoshu: 9 } } },
  zhen: { name: '震', lines: [1, 0, 0], nature: '雷', desc: '震动，主奋起与行动',
    images: { wuxing: '木', shape: '向上发展、急速、有声响、高、大等状',
      things: ['绿色事物','音响','各种车类','鼓','跑道','裙裤','扩音器','飞行器'],
      places: ['山林','田园','舞厅','歌厅','剧院','机场','停车场','大路'],
      taste: '酸', family: '长男', body: '足、肝、左手臂、左胁', num: { xiantian: 4, luoshu: 3 } } },
  xun: { name: '巽', lines: [0, 1, 1], nature: '风', desc: '入顺，主谦逊与渗透',
    images: { wuxing: '木', shape: '长条形、细长、漂浮不定、直等状',
      things: ['纤维制品','电线','笔','旗杆','宝剑','兰花','蚊香','标枪','茅草','香椿'],
      places: ['竹林','过道','长廊','商店','寺观','直路','通风口','草原','管道','索道'],
      taste: '酸', family: '长女', body: '股、胆、左肩、左太阳穴', num: { xiantian: 5, luoshu: 4 } } },
  kan: { name: '坎', lines: [0, 1, 0], nature: '水', desc: '险陷，主流通与险难',
    images: { wuxing: '水', shape: '弓型、有芯、旋转、流动、冷冻等状',
      things: ['酒水','液体物质','油类','药品','盐','鱼','桃','李','影碟','水车','海味'],
      places: ['江河湖海','井泉','浴场','酒店','冷饮店','加油站','冷库'],
      taste: '咸', family: '中男', body: '耳、肾、膀胱、脚、下巴', num: { xiantian: 6, luoshu: 1 } } },
  gen: { name: '艮', lines: [0, 0, 1], nature: '山', desc: '静止，主稳重与止息',
    images: { wuxing: '土', shape: '坚硬、静止、山形、凸起等状',
      things: ['岩石','门板','台阶','石碑','石块','墙壁','讲台','影壁','列车','柜子','手套','座位','巧克力'],
      places: ['山区','堤坝','交叉路口','小路','城墙','寺庙','仓库','银行','山坡','石料加工厂'],
      taste: '甜', family: '少男', body: '鼻、胃、左足、左下腹', num: { xiantian: 7, luoshu: 8 } } },
  kun: { name: '坤', lines: [0, 0, 0], nature: '地', desc: '柔顺，主承载与包容',
    images: { wuxing: '土', shape: '平的、方的、柔软、厚实、湿润等状',
      things: ['衣裳','布匹','瓷器','水泥','米','玉米','面粉','纸张','箱子','大车','轿子','轿车'],
      places: ['平原','农村','牧场','庄稼地','广场','粮库','农贸市场','平房','城郭'],
      taste: '甜', family: '母', body: '腹、脾、右肩、右太阳穴', num: { xiantian: 8, luoshu: 2 } } }
};

// 六十四卦（文王卦序），lo=下卦, up=上卦
export const HEX = [
  { n: 1,  name: '乾为天',   lo: 'qian', up: 'qian', y: '刚健进取，元始亨通，利于守正。', d: '乾为纯阳、上下皆天，象征天体生生不息。这一卦讲「刚健」：像天一样自强不息、永不停歇；古人用它说明创始与领导——有力量也要守正，不靠蛮干。' },
  { n: 2,  name: '坤为地',   lo: 'kun',  up: 'kun',  y: '柔顺包容，如母马般持守正道。', d: '坤为纯阴、上下皆地，象征大地。这一卦讲「柔顺」：像大地一样包容、承载万物而不争；古人用它说明配合与滋养——甘居其后、稳妥支撑也是一种力量。' },
  { n: 3,  name: '水雷屯',   lo: 'zhen', up: 'kan',  y: '万物始生，困难中创业，当建立根基。', d: '下震（雷、行动）上坎（水、险难）。雷动于险水之下，正是万物初生、困难丛生的时刻。这一卦讲「开创始创」：事情刚起步难免磕绊，要沉住气、先立根基再图发展。' },
  { n: 4,  name: '山水蒙',   lo: 'kan',  up: 'gen',  y: '启蒙养正，诚心求教则通。', d: '下坎（水、险）上艮（山、止）。水遇山而止，像懵懂未开的状态。这一卦讲「启蒙」：真心求教就能开窍，教育重在耐心引导、不勉强。' },
  { n: 5,  name: '水天需',   lo: 'qian', up: 'kan',  y: '等待时机，心怀诚信则亨通。', d: '下乾（天、刚健）上坎（水、险）。刚健前行却遇到前面的水险，需要停下等待。这一卦讲「等待」：时机未到时心怀诚信、养精蓄锐，不硬闯。' },
  { n: 6,  name: '天水讼',   lo: 'kan',  up: 'qian', y: '争讼难免，警惕中和方安。', d: '下坎（水、险）上乾（天、刚健）。水性向下、天性向上，二者相违而生争辩。这一卦讲「争讼」：冲突难免，但警惕、居中调和才能化小，不把事闹大。' },
  { n: 7,  name: '地水师',   lo: 'kan',  up: 'kun',  y: '象征兵众与纪律，强调任用贤能、严谨治事。', d: '下坎（水）上坤（地、众）。地中有水，聚众之象，引申为兵众。这一卦讲「用众」：办大事要任用贤能、纪律严明，统帅得当则稳。' },
  { n: 8,  name: '水地比',   lo: 'kun',  up: 'kan',  y: '亲辅相依，择善而从则顺。', d: '下坤（地、顺）上坎（水）。水附大地而流，亲密相依。这一卦讲「亲辅」：择善而从、彼此亲近就能顺遂，孤僻则难成。' },
  { n: 9,  name: '风天小畜', lo: 'qian', up: 'xun',  y: '小有积蓄，力量未足，当待时。', d: '下乾（天、刚健）上巽（风、入）。风行天上，力量还小。这一卦讲「小有积蓄」：羽翼未丰时当蓄力待时，别急着大动作。' },
  { n: 10, name: '天泽履',   lo: 'dui',  up: 'qian', y: '谨慎行事，如履虎尾而不被咬。', d: '下兑（泽、悦）上乾（天、刚）。脚下是悦、头上是天，如踏虎尾而和悦。这一卦讲「谨慎行事」：处境微妙时礼敬小心、步步留神，便能平安走过。' },
  { n: 11, name: '地天泰',   lo: 'qian', up: 'kun',  y: '天地交泰，小往大来，通达。', d: '下乾（天）上坤（地）。天在下、地在上，阴阳交而万物通。这一卦讲「通达」：上下相通、小往大来，是顺畅安好的状态。' },
  { n: 12, name: '天地否',   lo: 'kun',  up: 'qian', y: '天地不交，闭塞之时，守正待变。', d: '下坤（地）上乾（天）。天在上、地在下，阴阳不交而闭塞。这一卦讲「闭塞」：关系断了就僵，此时当守本分、静待转机。' },
  { n: 13, name: '天火同人', lo: 'li',   up: 'qian', y: '与人和同，利于涉险共事。', d: '下乾（天）上离（火、明）。火性炎上同于天，人与人和同。这一卦讲「和同」：撇开私心、与人和睦协作，便能成事。' },
  { n: 14, name: '火天大有', lo: 'qian', up: 'li',   y: '富有盛大，处盛当谦。', d: '下乾（天、刚健）上离（火、明）。火在天上，光照盛大。这一卦讲「富有」：盛大之时要谦守、不张扬，盛极更需稳。' },
  { n: 15, name: '地山谦',   lo: 'gen',  up: 'kun',  y: '谦逊有终，谦尊而光。', d: '下艮（山、止）上坤（地）。山在地下，谦卑之象。这一卦讲「谦逊」：有才德而居下，谦尊而光，终有好结果。' },
  { n: 16, name: '雷地豫',   lo: 'kun',  up: 'zhen', y: '欢悦顺动，利于建侯行师。', d: '下坤（地）上震（雷、动）。雷出地奋，欢悦而动。这一卦讲「顺动」：时机顺、心情悦，可有所作为，但不可沉溺玩乐。' },
  { n: 17, name: '泽雷随',   lo: 'zhen', up: 'dui',  y: '随时而动，从善无咎。', d: '下震（雷、动）上兑（泽、悦）。雷动而泽悦，随顺之象。这一卦讲「随顺」：相机而动、从善而动，不固执己见。' },
  { n: 18, name: '山风蛊',   lo: 'xun',  up: 'gen',  y: '整治弊乱，除旧布新。', d: '下巽（风）上艮（山、止）。风遇山而回，积弊之象。这一卦讲「整治」：承败坏之后要除旧布新、拨乱反正。' },
  { n: 19, name: '地泽临',   lo: 'dui',  up: 'kun',  y: '居上临下，阳气渐长，盛极当知收敛。', d: '下兑（泽、悦）上坤（地、众）。泽上有地，居高临下。这一卦讲「临民」：居上者亲近下属、阳气渐长，盛时更知收敛。' },
  { n: 20, name: '风地观',   lo: 'kun',  up: 'xun',  y: '观察风化，洁净诚敬。', d: '下坤（地）上巽（风）。风行地上，周览之象。这一卦讲「观察」：洁净诚敬地省察风俗与自身，先看清再行动。' },
  { n: 21, name: '火雷噬嗑', lo: 'zhen', up: 'li',   y: '咬合去间，明罚敕法。', d: '下震（雷、动）上离（火、明）。雷电交合，咬合去梗。这一卦讲「刑罚」：遇到阻隔要果断开断、明察断制，才能通顺。' },
  { n: 22, name: '山火贲',   lo: 'li',   up: 'gen',  y: '文饰美化，质彬彬而后礼。', d: '下离（火、明）上艮（山、止）。火燎于山，文饰之象。这一卦讲「文饰」：适当修饰、质文并茂而后合礼，但修饰不可过头。' },
  { n: 23, name: '山地剥',   lo: 'kun',  up: 'gen',  y: '阴盛剥阳，静守待时为佳。', d: '下坤（地）上艮（山）。山附于地，剥落之象。这一卦讲「剥落」：阴盛阳衰、基础松动时当静守待复，不可妄动。' },
  { n: 24, name: '地雷复',   lo: 'zhen', up: 'kun',  y: '一阳来复，生机回归，反复其道。', d: '下震（雷）上坤（地）。雷在地中，一阳来复。这一卦讲「回复」：生机回归、反复其道，失而复得时要把握节奏。' },
  { n: 25, name: '天雷无妄', lo: 'zhen', up: 'qian', y: '不妄为，顺天合道则亨。', d: '下震（雷、动）上乾（天）。雷行天下，不妄为。这一卦讲「守正」：顺天合道、不胡作非为，自然通顺；妄动则生灾。' },
  { n: 26, name: '山天大畜', lo: 'qian', up: 'gen',  y: '大积德行，蓄德养贤。', d: '下乾（天、刚健）上艮（山、止）。山天相畜，积之大者。这一卦讲「大畜」：刚健被山所止，正是厚积德行、养贤蓄能之时。' },
  { n: 27, name: '山雷颐',   lo: 'zhen', up: 'gen',  y: '颐养之道，慎言节食。', d: '下震（雷）上艮（山、止）。山下有雷，颐养之象。这一卦讲「颐养」：谨言节饮食、养正修身，言语与口腹都当节制。' },
  { n: 28, name: '泽风大过', lo: 'xun',  up: 'dui',  y: '非常之事，栋梁将挠，当有为。', d: '下巽（风）上兑（泽）。泽灭木，非常之象。这一卦讲「大过」：栋梁将挠、事出非常，当勇担非常之任。' },
  { n: 29, name: '坎为水',   lo: 'kan',  up: 'kan',  y: '重险陷中，唯诚信可亨。', d: '上下皆坎（水、险）。重险相叠，习坎。这一卦讲「重险」：深陷险难时唯凭诚信与定力，一步一脚印走出困境。' },
  { n: 30, name: '离为火',   lo: 'li',   up: 'li',   y: '附丽光明，柔顺守正乃成。', d: '上下皆离（火、明）。两明相继，附丽。这一卦讲「附丽」：柔顺守正、依附光明，便能明照四方；光明须有所依托。' },
  { n: 31, name: '泽山咸',   lo: 'gen',  up: 'dui',  y: '感应交心，情意相通。', d: '下艮（山、止）上兑（泽、悦）。山上有泽，感应。这一卦讲「感应」：少男少女两情相悦、以诚相感，是自然的交心。' },
  { n: 32, name: '雷风恒',   lo: 'xun',  up: 'zhen', y: '恒久之道，持之以恒则利。', d: '下巽（风）上震（雷、动）。雷风相与，恒久。这一卦讲「恒久」：风雷相成、持之以恒，做事有常才能长久。' },
  { n: 33, name: '天山遯',   lo: 'gen',  up: 'qian', y: '退避藏身，明哲保身小利。', d: '下艮（山、止）上乾（天）。天下有山，退避。这一卦讲「退避」：当进则进、当退则退，处境不利时明哲保身、暂避其锋。' },
  { n: 34, name: '雷天大壮', lo: 'qian', up: 'zhen', y: '阳刚壮盛，守正不妄动。', d: '下乾（天、刚健）上震（雷、动）。雷在天上，阳刚壮盛。这一卦讲「壮盛」：力量正盛要守正、不恃强妄动，壮而知止。' },
  { n: 35, name: '火地晋',   lo: 'kun',  up: 'li',   y: '进而显明，如臣受宠。', d: '下坤（地）上离（火、明）。火在地上，进而显明。这一卦讲「进升」：如臣得君宠、光明上进，循理而进。' },
  { n: 36, name: '地火明夷', lo: 'li',   up: 'kun',  y: '光明受伤，内难而能正。', d: '下离（火、明）上坤（地）。明入地中，光明受伤。这一卦讲「韬晦」：处境昏暗时内守其明、外示柔顺，难中能正。' },
  { n: 37, name: '风火家人', lo: 'li',   up: 'xun',  y: '齐家之道，利女贞。', d: '下离（火）上巽（风）。风自火出，家道。这一卦讲「齐家」：火炎风煽，一家之内正则外顺，治家贵有序。' },
  { n: 38, name: '火泽睽',   lo: 'dui',  up: 'li',   y: '乖离违异，小事可成。', d: '下兑（泽、悦）上离（火、明）。火泽相违，乖离。这一卦讲「乖离」：志趣相背、小事可成，大处当求同存异。' },
  { n: 39, name: '水山蹇',   lo: 'gen',  up: 'kan',  y: '行难涉险，利西南止东北。', d: '下艮（山、止）上坎（水、险）。水在山上，行难。这一卦讲「行难」：前阻险山、进退皆难，当止而思、向有利方向回头。' },
  { n: 40, name: '雷水解',   lo: 'kan',  up: 'zhen', y: '险难消解，及早行动则顺。', d: '下坎（水、险）上震（雷、动）。雷雨作，难解。这一卦讲「缓解」：险难将消、雷动而解，及早行动则顺。' },
  { n: 41, name: '山泽损',   lo: 'dui',  up: 'gen',  y: '减损修德，诚信为善。', d: '下兑（泽）上艮（山、止）。山下有泽，减损。这一卦讲「减损」：损下益上、有诚则善，减多余的、修不足。' },
  { n: 42, name: '风雷益',   lo: 'zhen', up: 'xun',  y: '增益生民，利有攸往。', d: '下震（雷、动）上巽（风）。风雷相助，增益。这一卦讲「增益」：雷风相与、彼此助长，施惠于人亦自益。' },
  { n: 43, name: '泽天夬',   lo: 'qian', up: 'dui',  y: '决而能和，刚决柔，防危。', d: '下乾（天、刚健）上兑（泽、悦）。泽上于天，决去。这一卦讲「决断」：刚决柔、五阳决一阴，断然而和；防危慎终。' },
  { n: 44, name: '天风姤',   lo: 'xun',  up: 'qian', y: '不期而遇，阴长侵阳，勿取。', d: '下巽（风）上乾（天）。风行天下，不期而遇。这一卦讲「相遇」：一阴遇五阳、阴长侵阳，邂逅虽巧，当守正不滥。' },
  { n: 45, name: '泽地萃',   lo: 'kun',  up: 'dui',  y: '荟萃聚会，王假有庙。', d: '下坤（地、众）上兑（泽、悦）。泽上于地，荟萃。这一卦讲「聚会」：万物萃聚、人和而悦，聚要有核心、以正相合。' },
  { n: 46, name: '地风升',   lo: 'xun',  up: 'kun',  y: '柔顺上升，南征则顺。', d: '下巽（风、入）上坤（地）。地中生木，上升。这一卦讲「上升」：柔顺渐进、如木生长，积小以高升。' },
  { n: 47, name: '泽水困',   lo: 'kan',  up: 'dui',  y: '穷困守正，守志则安。', d: '下坎（水、险）上兑（泽、悦）。泽中无水，困穷。这一卦讲「困穷」：身处困境守正不挠，困而能定则转机在后。' },
  { n: 48, name: '水风井',   lo: 'xun',  up: 'kan',  y: '养而不穷，井养不穷。', d: '下巽（风）上坎（水）。木上有水，井养。这一卦讲「养人」：井养不穷、德布不竭，惠民之道贵在恒常不变。' },
  { n: 49, name: '泽火革',   lo: 'li',   up: 'dui',  y: '顺天应人，变革乃孚。', d: '下离（火、明）上兑（泽、悦）。泽中有火，变革。这一卦讲「变革」：水火相息、顺天应人，时机成熟则当革故鼎新。' },
  { n: 50, name: '火风鼎',   lo: 'xun',  up: 'li',   y: '鼎新取象，革新亨通。', d: '下巽（风）上离（火、明）。木上有火，鼎烹。这一卦讲「鼎新」：以鼎烹饪、养贤任能，革之后正可建新、亨通。' },
  { n: 51, name: '震为雷',   lo: 'zhen', up: 'zhen', y: '震动惊惧，恐惧修省。', d: '上下皆震（雷、动）。洊雷，震动。这一卦讲「震动」：雷霆惊惧，戒慎恐惧、修省其身，临变不慌。' },
  { n: 52, name: '艮为山',   lo: 'gen',  up: 'gen',  y: '止其所止，动静有时。', d: '上下皆艮（山、止）。兼山，静止。这一卦讲「止」：行止有节、该停就停，动静有时、安住当下。' },
  { n: 53, name: '风山渐',   lo: 'gen',  up: 'xun',  y: '渐进有序，循序乃成。', d: '下艮（山、止）上巽（风、入）。山上有木，渐进。这一卦讲「渐进」：如木依山、循序生长，进以有序、不可躁进。' },
  { n: 54, name: '雷泽归妹', lo: 'dui',  up: 'zhen', y: '归妹失位，妄进不利。', d: '下兑（泽、悦）上震（雷、动）。泽上有雷，归妹。这一卦讲「归妹」：少女归嫁、位有不正，妄进则不利，行事贵当其分。' },
  { n: 55, name: '雷火丰',   lo: 'li',   up: 'zhen', y: '丰大光明，当持守中道。', d: '下离（火、明）上震（雷、动）。雷火皆至，丰大。这一卦讲「丰大」：盛大光明、如日方中，当盛而忧、当保其明。' },
  { n: 56, name: '火山旅',   lo: 'gen',  up: 'li',   y: '行旅在外，柔顺守正乃安。', d: '下艮（山、止）上离（火、明）。山上有火，行旅。这一卦讲「旅」：身在外、附明而止，柔顺守正则安，不拘泥。' },
  { n: 57, name: '巽为风',   lo: 'xun',  up: 'xun',  y: '顺而入之，小亨利见。', d: '上下皆巽（风、入）。随风，顺入。这一卦讲「顺入」：风行无所不入，谦逊顺从、小亨，入而能同。' },
  { n: 58, name: '兑为泽',   lo: 'dui',  up: 'dui',  y: '和悦欣悦，利贞。', d: '上下皆兑（泽、悦）。丽泽，和悦。这一卦讲「和悦」：两泽相丽、言语和悦，悦以交友、悦以待人。' },
  { n: 59, name: '风水涣',   lo: 'kan',  up: 'xun',  y: '涣散而通，王假有庙。', d: '下坎（水）上巽（风）。风行水上，涣散。这一卦讲「涣散」：风散水波、涣然而通，离散之时当聚、以通其情。' },
  { n: 60, name: '水泽节',   lo: 'dui',  up: 'kan',  y: '节制有度，苦节则不可。', d: '下兑（泽）上坎（水、险）。泽上有水，节制。这一卦讲「节制」：水蓄于泽、有节则安，节制合度才好，苦节则不可。' },
  { n: 61, name: '风泽中孚', lo: 'dui',  up: 'xun',  y: '中心诚信，以诚感人。', d: '下兑（泽、悦）上巽（风）。泽上有风，中孚。这一卦讲「诚信」：中心诚信、如豚鱼可感，以诚待人则通。' },
  { n: 62, name: '雷山小过', lo: 'gen',  up: 'zhen', y: '小者过越，处下为佳。', d: '下艮（山、止）上震（雷、动）。山上有雷，小过。这一卦讲「小过」：雷在山下、过而小者，可行小事、不可大举，处下为佳。' },
  { n: 63, name: '水火既济', lo: 'li',   up: 'kan',  y: '事既已成，初顺而终当慎防。', d: '下离（火）上坎（水）。水在火上，既济。这一卦讲「既济」：事已成、阴阳相济，初顺而终防，成后更须谨慎守成。' },
  { n: 64, name: '火水未济', lo: 'kan',  up: 'li',   y: '事未成，慎终如始。', d: '下坎（水、险）上离（火、明）。火在水上，未济。这一卦讲「未济」：事未成、阴阳不交，慎终如始、再接再厉方趋成。' }
];

const MAP = {};
HEX.forEach((h) => {
  const full = TRIGRAM[h.lo].lines.concat(TRIGRAM[h.up].lines);
  let k = 0;
  for (let i = 0; i < 6; i++) k += full[i] * (1 << i);
  MAP[k] = h;
});

export function triName(lines) {
  for (const k in TRIGRAM) {
    if (TRIGRAM[k].lines.join('') === lines.join('')) return TRIGRAM[k].name;
  }
  return '?';
}

export function coin() { return Math.random() < 0.5 ? 2 : 3; }

// 生成一组卦象：返回本卦、变卦（若有动爻）、六次投掷记录
export function cast() {
  const tosses = [];
  const ben = [];
  const bian = [];
  for (let i = 0; i < 6; i++) {
    const s = coin() + coin() + coin();
    let t;
    if (s === 9) t = { type: '老阳', ben: 1, bian: 0, ch: true };
    else if (s === 6) t = { type: '老阴', ben: 0, bian: 1, ch: true };
    else if (s === 7) t = { type: '少阳', ben: 1, bian: 1, ch: false };
    else t = { type: '少阴', ben: 0, bian: 0, ch: false };
    tosses.push({ s, ...t });
    ben.push(t.ben);
    bian.push(t.bian);
  }
  let k = 0;
  ben.forEach((v, i) => { k += v * (1 << i); });
  const orig = MAP[k];
  const hasChange = tosses.some((t) => t.ch);
  let changed = null;
  if (hasChange) {
    let k2 = 0;
    bian.forEach((v, i) => { k2 += v * (1 << i); });
    changed = MAP[k2];
  }
  return { tosses, ben, bian, orig, changed, hasChange };
}

/* ============ 二、万物归卦检索引擎 ============ */
const KEYS = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];
const FIELD_LABEL = { things: '事物', places: '场所', body: '身体', shape: '形态', taste: '味道', family: '家人', nature: '自然', alias: '生活对应' };
const STOP_CHARS = '大小中上下老新子机器房间场所人物的和与高长东西时家用点面手'.split('');
const ALIAS = {
  qian: ['天', '金', '金属', '金子', '圆形', '球', '皮球', '父亲', '爸爸', '老板', '领导', '玉', '玉石', '手表', '戒指', '硬币', '宇宙', '太空', '头部', '骨头', '西北'],
  dui: ['嘴', '口', '舌头', '牙齿', '湖', '湖泊', '池塘', '水池', '杯子', '水杯', '羊', '乐器', '歌手', '唱歌', '说话', '演讲', '甜', '甜食', '剪刀', '刀', '缺口', '少女', '妹妹', '西方'],
  li: ['火', '太阳', '灯', '电', '电器', '手机', '电脑', '屏幕', '相机', '摄像头', '眼睛', '心脏', '红色', '书', '文字', '文件', '花', '夏天', '蜡烛', '光', '烤箱', '炉子', '中女', '南方'],
  zhen: ['雷', '树', '树木', '木头', '竹子', '鼓', '汽车', '车', '地铁', '音响', '喇叭', '电话', '跑步', '健身', '青菜', '春天', '脚', '长子', '哥哥', '声音', '东方'],
  xun: ['风', '绳子', '电线', '网线', '网络', '飞机', '鸟', '羽毛', '香味', '气味', '头发', '扇子', '空调', '快递', '藤', '柳条', '长条', '姐姐', '长女', '东南'],
  kan: ['水', '河', '河流', '海', '大海', '雨', '酒', '饮料', '鱼', '船', '耳朵', '肾', '冬天', '黑色', '洞', '地下室', '水管', '水沟', '中男', '北方'],
  gen: ['山', '石', '石头', '岩石', '墙', '墙壁', '房子', '楼', '楼房', '桌子', '床', '门', '鼻子', '狗', '停止', '静止', '台阶', '土堆', '少男', '弟弟', '东北'],
  kun: ['地', '土', '土地', '田', '田地', '布', '衣服', '被子', '口袋', '包', '母亲', '妈妈', '肚子', '腹部', '平原', '粮食', '米', '米面', '面粉', '牛', '黄色', '方形', '西南']
};

function splitStr(s) {
  return String(s || '').split(/[、，,。\s]+/).filter(Boolean);
}
const INDEX = [];
KEYS.forEach(function (k) {
  const t = TRIGRAM[k];
  const im = t.images || {};
  function push(word, field) {
    const w = String(word || '').trim();
    if (w) INDEX.push({ key: k, word: w, field: field });
  }
  (im.things || []).forEach(function (w) { push(w, 'things'); });
  (im.places || []).forEach(function (w) { push(w, 'places'); });
  splitStr(im.body).forEach(function (w) { push(w, 'body'); });
  splitStr(im.shape).forEach(function (w) { push(w, 'shape'); });
  splitStr(im.taste).forEach(function (w) { push(w, 'taste'); });
  push(im.family, 'family');
  push(t.nature, 'nature');
  (ALIAS[k] || []).forEach(function (w) { push(w, 'alias'); });
});

export function triView(k) {
  const t = TRIGRAM[k];
  const yaos = [];
  for (let i = t.lines.length - 1; i >= 0; i--) yaos.push({ yang: t.lines[i] === 1 });
  return { key: k, name: t.name, nature: t.nature, desc: t.desc,
    wuxing: (t.images && t.images.wuxing) || '', family: (t.images && t.images.family) || '', yaos };
}
function norm(q) { return String(q || '').replace(/[\s，。、!！?？~·,.]/g, '').trim(); }
function strongMatch(word, query) {
  if (word === query) return { score: 100, how: '直接对应' };
  if (query.length >= 2 && word.indexOf(query) !== -1) return { score: Math.max(45, 78 - (word.length - query.length) * 4), how: '归入此类' };
  if (word.length >= 2 && query.indexOf(word) !== -1) return { score: Math.max(40, 70 - (query.length - word.length) * 4), how: '含此象' };
  return null;
}
function weakMatch(word, query) {
  if (query.length < 2) return null;
  for (let i = 0; i < query.length; i++) {
    const ch = query[i];
    if (STOP_CHARS.indexOf(ch) !== -1) continue;
    if (word.indexOf(ch) !== -1) return { score: 20, how: '关联「' + ch + '」' };
  }
  return null;
}
function collect(query, matcher) {
  const bucket = {};
  INDEX.forEach(function (it) {
    const m = matcher(it.word, query);
    if (!m) return;
    if (!bucket[it.key]) bucket[it.key] = { key: it.key, score: 0, hits: [] };
    const b = bucket[it.key];
    if (m.score > b.score) b.score = m.score;
    b.hits.push({ word: it.word, field: FIELD_LABEL[it.field] || '', score: m.score, how: m.how });
  });
  return bucket;
}
function shape(bucket, weak) {
  const out = KEYS.filter(function (k) { return bucket[k]; }).map(function (k) {
    const b = bucket[k];
    b.hits.sort(function (a, c) { return c.score - a.score; });
    const seen = {}; const hits = [];
    b.hits.forEach(function (h) { if (seen[h.word]) return; seen[h.word] = 1; if (hits.length < 6) hits.push(h); });
    const v = triView(k);
    v.score = b.score; v.hits = hits; v.top = hits[0] ? hits[0].how : '';
    v.strong = !weak && b.score >= 60; v.weak = !!weak;
    return v;
  });
  out.sort(function (a, b) { return b.score - a.score; });
  return out;
}
export function search(q) {
  const query = norm(q);
  if (!query) return [];
  if (query.length > 10) return [];
  const strong = shape(collect(query, strongMatch), false);
  if (strong.length) return strong;
  return shape(collect(query, weakMatch), true);
}
export function combine(loKey, upKey) {
  const h = HEX.find(function (x) { return x.lo === loKey && x.up === upKey; });
  if (!h) return null;
  const lo = TRIGRAM[loKey]; const up = TRIGRAM[upKey];
  const full = lo.lines.concat(up.lines);
  const yaos = [];
  for (let i = full.length - 1; i >= 0; i--) yaos.push({ yang: full[i] === 1 });
  return { n: h.n, name: h.name, yi: h.y, lo: lo.name, up: up.name, loNature: lo.nature, upNature: up.nature, yaos };
}
export function allTrigrams() { return KEYS.map(triView); }
export function sampleWords(n) {
  const pool = INDEX.filter(function (it) { return (it.field === 'things' || it.field === 'places' || it.field === 'alias') && it.word.length >= 2; });
  const out = []; const used = {}; let guard = 0;
  while (out.length < n && guard < 800) {
    guard++;
    const it = pool[Math.floor(Math.random() * pool.length)];
    if (!it || used[it.word]) continue;
    used[it.word] = 1; out.push(it.word);
  }
  return out;
}

/* ============ 三、课程数据（Duolingo 式） ============ */
const TRINAME = {};
Object.keys(TRIGRAM).forEach((k) => { TRINAME[k] = TRIGRAM[k].name; });
function hexByName(name) { return HEX.find((h) => h.name === name); }
function linesBottomToTop(name) {
  const h = hexByName(name);
  const lo = TRIGRAM[h.lo].lines; const up = TRIGRAM[h.up].lines;
  return lo.concat(up).map((v) => (v ? '1' : '0')).join('');
}
function recog(name, options, answer, expl) {
  return { q: '下面这组爻，是哪一卦？', lines: linesBottomToTop(name), options, answer, expl };
}

export const UNITS = [
  { title: '第一单元 · 阴阳与爻', color: '#9C7330', lessons: [
    { id: 'u1l1', title: '阴阳是什么',
      learn: '阴阳不是「好」与「坏」，而是古人对世界的看法：很多事物都有两种相反又互补的一面，比如天与地、动与静、刚与柔。阳偏向主动、向外；阴偏向主静、向内。',
      quiz: [
        { q: '下面哪一条是阳爻？', options: ['—（不断开）', '⚋（中间断开）'], answer: 0, expl: '阳爻是一条不断开的横线。' },
        { q: '阴爻和阳爻最大的区别是？', options: ['长短不同', '阴爻中间断开', '颜色不同'], answer: 1, expl: '阴爻是中间断开的横线，阳爻是连续的。' }
      ] },
    { id: 'u1l2', title: '爻与读法',
      learn: '把阴阳画成线，一个「爻」就是一条线。读爻从下往上数：最底下叫初爻，往上是二爻、三爻……（记住：最下面才是第一爻！）',
      quiz: [
        { q: '读爻时从哪条边起？', options: ['从下往上', '从上往下'], answer: 0, expl: '爻从下往上读，最底下是初爻。' },
        { q: '一个六爻卦，最底下的爻叫？', options: ['上爻', '初爻', '末爻'], answer: 1, expl: '最底下叫「初爻」，最上面叫「上爻」。' },
        { q: '古人把阳爻记作？', options: ['六', '九'], answer: 1, expl: '阳爻记作「九」，阴爻记作「六」。' }
      ] },
    { id: 'u1l3', title: '太极到八卦',
      learn: '古人这样推：太极（混沌未分）→ 两仪（一阴一阳）→ 四象（老阳、少阴、少阳、老阴）→ 八卦。四象里「老阳、老阴」会变化（阳变阴、阴变阳），就是动爻的来源；「少阳、少阴」静止不变。',
      quiz: [
        { q: '太极之后，首先分出什么？', options: ['两仪（阴与阳）', '八卦', '六十四卦'], answer: 0, expl: '太极一动，分出阴、阳两种力量，叫两仪。' },
        { q: '四象里，会变化的是？', options: ['老阳、老阴', '少阳、少阴'], answer: 0, expl: '老阳、老阴会变化，是演示页里「动爻」的来源。' },
        { q: '一个八卦由几爻组成？', options: ['3 爻', '6 爻', '8 爻'], answer: 0, expl: '一个八卦是 3 爻；两个八卦上下相叠的六十四卦才是 6 爻。' }
      ] }
  ] },
  { title: '第二单元 · 八卦取象', color: '#456E96', lessons: [
    { id: 'u2l1', title: '八种自然力量',
      learn: '八卦各代表一种自然力量：乾天、坤地、震雷、巽风、坎水、离火、艮山、兑泽。看懂「象」，才能看懂一个卦在讲什么关系。',
      quiz: [
        { q: '乾卦代表哪种自然力量？', options: ['天', '地', '水'], answer: 0, expl: '乾为天，刚健向上。' },
        { q: '坎卦代表？', options: ['火', '水', '山'], answer: 1, expl: '坎为水，流动、向下。' },
        { q: '兑卦代表？', options: ['泽', '风', '雷'], answer: 0, expl: '兑为泽，让人舒畅、交流。' }
      ] },
    { id: 'u2l2', title: '先天数口诀',
      learn: '八卦有「先天数」口诀：乾一、兑二、离三、震四、巽五、坎六、艮七、坤八。是个好记的顺口溜。',
      quiz: [
        { q: '先天数中，乾是第几？', options: ['一', '二', '八'], answer: 0, expl: '乾一、兑二、离三……乾排第一。' },
        { q: '先天数中，坤是第几？', options: ['一', '七', '八'], answer: 2, expl: '口诀最后是「坤八」。' },
        { q: '先天数中，离是第几？', options: ['三', '四', '五'], answer: 0, expl: '乾一、兑二、离三——离排第三。' }
      ] },
    { id: 'u2l3', title: '取象逻辑与爻位',
      learn: '取象是古人观察自然、人事归纳出来的。一个六爻卦从下往上：初到上爻，下三爻偏「内 / 开始」，上三爻偏「外 / 结果」。同样一条爻，处在不同位置，意思也不同。',
      quiz: [
        { q: '读六爻卦从哪边起？', options: ['从下往上', '从右往左'], answer: 0, expl: '六爻也是从下往上读：初、二、三、四、五、上。' },
        { q: '六爻卦里，下三爻偏重？', options: ['内 / 开始', '外 / 结果'], answer: 0, expl: '下三爻偏内、偏开始；上三爻偏外、偏结果。' },
        { q: '上三爻偏重？', options: ['内 / 开始', '外 / 结果'], answer: 1, expl: '上三爻偏外、偏结果。' }
      ] }
  ] },
  { title: '第三单元 · 六十四卦', color: '#5E4878', lessons: [
    { id: 'u3l1', title: '两卦相重',
      learn: '把一个八卦放「下」（下卦、偏内在），另一个放「上」（上卦、偏外在），上下叠成六爻，就是一个六十四卦。8 × 8 = 64 种。',
      quiz: [
        { q: '一个六十四卦由几个八卦相重而成？', options: ['两个', '一个', '三个'], answer: 0, expl: '下卦 + 上卦，两个八卦叠成。' },
        { q: '8 × 8 一共有多少种卦？', options: ['8', '36', '64'], answer: 2, expl: '8 个下卦 × 8 个上卦 = 64 种。' },
        { q: '放在下面的八卦叫？', options: ['上卦', '下卦', '中卦'], answer: 1, expl: '下面的是下卦（偏内在），上面的是上卦（偏外在）。' }
      ] },
    { id: 'u3l2', title: '读卦名',
      learn: '卦名看上下卦：如「乾为天」= 乾（下）+ 乾（上）；「水雷屯」= 震（下，雷）+ 坎（上，水）。先看下卦、再看上卦，就能拆开一个卦。',
      quiz: [
        { q: '「乾为天」由哪两个八卦组成？', options: ['乾 + 乾', '乾 + 坤', '坤 + 坤'], answer: 0, expl: '上下都是乾，所以叫乾为天。' },
        { q: '「水雷屯」的下卦是？', options: ['坎（水）', '震（雷）', '乾（天）'], answer: 1, expl: '下卦是震（雷），上卦是坎（水）。' },
        { q: '「水雷屯」的上卦是？', options: ['震（雷）', '坎（水）', '离（火）'], answer: 1, expl: '上卦是坎（水），所以卦名带「水」。' }
      ] },
    { id: 'u3l3', title: '先天与后天',
      learn: '八卦有两种排法：先天八卦讲「结构 / 对待」（乾南坤北、离东坎西，两两相对）；后天八卦讲「流行 / 实用」（坎北离南、震东兑西，按万物变化的方位来排）。',
      quiz: [
        { q: '先天八卦更偏重？', options: ['结构 / 对待', '流行 / 实用'], answer: 0, expl: '先天讲「为什么这样分」，是结构上的对待关系。' },
        { q: '后天八卦更偏重？', options: ['结构 / 对待', '流行 / 实用'], answer: 1, expl: '后天讲「实际怎么用」，按方位来排。' },
        { q: '先天八卦里，乾在？', options: ['南', '北', '东'], answer: 0, expl: '先天：乾南、坤北、离东、坎西。' }
      ] }
  ] },
  { title: '第四单元 · 认卦与配对', color: '#843E63', lessons: [
    { id: 'u4l1', title: '看爻识卦',
      learn: '把上下两个八卦的爻叠起来，就是一个六爻卦。先看最下面的「初爻」，逐爻往上，就能从爻线反推出这是哪一卦。',
      quiz: [
        recog('乾为天', ['乾为天', '坤为地', '地天泰', '天地否'], 0, '六爻皆阳＝乾为天（上下都是乾）。'),
        recog('坤为地', ['坤为地', '乾为天', '剥', '复'], 0, '六爻皆阴＝坤为地（上下都是坤）。'),
        recog('地天泰', ['地天泰', '天地否', '乾为天', '坤为地'], 0, '下卦乾(天)、上卦坤(地) → 地天泰。'),
        recog('水雷屯', ['水雷屯', '山水蒙', '乾为天', '坤为地'], 0, '下卦震(雷)、上卦坎(水) → 水雷屯。')
      ] },
    { id: 'u4l2', title: '拼出上下卦（一）',
      learn: '一个六爻卦 = 下卦(内) + 上卦(外)。在下面用八卦拼出指定的卦：先点「上卦」，再点「下卦」。',
      quiz: [
        { type: 'pair', target: '地天泰', lo: 'qian', up: 'kun', expl: '地天泰：下卦乾(天)、上卦坤(地)。' },
        { type: 'pair', target: '天地否', lo: 'kun', up: 'qian', expl: '天地否：下卦坤(地)、上卦乾(天)。' },
        { type: 'pair', target: '水雷屯', lo: 'zhen', up: 'kan', expl: '水雷屯：下卦震(雷)、上卦坎(水)。' }
      ] },
    { id: 'u4l3', title: '拆卦：上下各是什么',
      learn: '反过来也要会拆：拿到一个卦名，能说出它的下卦(内)、上卦(外)分别是什么。',
      quiz: [
        { type: 'pair', target: '乾为天', lo: 'qian', up: 'qian', expl: '上下都是乾(天)，所以叫乾为天。' },
        { type: 'pair', target: '坤为地', lo: 'kun', up: 'kun', expl: '上下都是坤(地)，所以叫坤为地。' },
        { type: 'pair', target: '山水蒙', lo: 'kan', up: 'gen', expl: '山水蒙：下卦坎(水)、上卦艮(山)。' },
        { q: '「地天泰」的下卦（内卦）是？', options: ['乾(天)', '坤(地)', '坎(水)'], answer: 0, expl: '地天泰 = 下乾(天)、上坤(地)，下卦是乾(天)。' },
        { q: '「地天泰」的上卦（外卦）是？', options: ['坤(地)', '乾(天)', '离(火)'], answer: 0, expl: '地天泰 = 下乾(天)、上坤(地)，上卦是坤(地)。' }
      ] }
  ] },
  { title: '第五单元 · 方位、爻位与数', color: '#3E736F', lessons: [
    { id: 'u5l1', title: '先天八卦方位',
      learn: '先天八卦讲结构 / 对待，方位两两相对：乾南、坤北、离东、坎西、震东北、兑东南、巽西南、艮西北。',
      quiz: [
        { q: '先天八卦里，乾在？', options: ['南', '北', '东'], answer: 0, expl: '先天：乾南。' },
        { q: '先天里，离在？', options: ['东', '南', '西'], answer: 0, expl: '先天：离东、坎西。' },
        { q: '先天里，坎在？', options: ['西', '东', '北'], answer: 0, expl: '先天：坎西、离东。' },
        { q: '先天里，坤在？', options: ['北', '南', '东北'], answer: 0, expl: '先天：坤北、乾南。' },
        { q: '先天里，震在？', options: ['东北', '东南', '东'], answer: 0, expl: '先天：震东北、兑东南。' }
      ] },
    { id: 'u5l2', title: '后天八卦方位',
      learn: '后天八卦讲流行 / 实用，按万物变化的方位来排：坎北、离南、震东、兑西、乾西北、坤西南、巽东南、艮东北。',
      quiz: [
        { q: '后天八卦里，坎在？', options: ['北', '南', '西'], answer: 0, expl: '后天：坎北、离南。' },
        { q: '后天里，离在？', options: ['南', '北', '东'], answer: 0, expl: '后天：离南、坎北。' },
        { q: '后天里，震在？', options: ['东', '西', '东北'], answer: 0, expl: '后天：震东、兑西。' },
        { q: '后天里，乾在？', options: ['西北', '西南', '南'], answer: 0, expl: '后天：乾西北、坤西南。' },
        { q: '后天里，坤在？', options: ['西南', '西北', '北'], answer: 0, expl: '后天：坤西南、乾西北。' },
        { q: '后天里，艮在？', options: ['东北', '东南', '北'], answer: 0, expl: '后天：艮东北、巽东南。' }
      ] },
    { id: 'u5l3', title: '爻位阴阳',
      learn: '六爻从下往上：初、二、三、四、五、上。奇数位（初、三、五）为阳位；偶数位（二、四、上）为阴位。阳爻居阳位、阴爻居阴位，叫「当位」，更顺。',
      quiz: [
        { q: '下面哪个爻位是阳位？', options: ['初爻', '二爻', '四爻'], answer: 0, expl: '初(一)、三、五是阳位；二、四、上是阴位。' },
        { q: '上爻是第几位？', options: ['第六位（偶数）', '第五位', '第一位'], answer: 0, expl: '上爻 = 第六爻，是偶数位，属阴位。' },
        { q: '下面的阴位包括？', options: ['二、四、上', '初、三、五', '初、二、三'], answer: 0, expl: '偶数位（二、四、上）为阴位。' },
        { q: '阳爻落在「五爻」这个阳位上，古人称为？', options: ['当位', '失位', '变爻'], answer: 0, expl: '阳爻居阳位 = 当位（得正），更顺。' }
      ] },
    { id: 'u5l4', title: '后天八卦的数',
      learn: '后天八卦还对应一组洛书数：坎1、坤2、震3、巽4、中5、乾6、兑7、艮8、离9。相对两卦相加等于10，横竖斜三数相加等于15，是一张均衡的数阵。',
      quiz: [
        { q: '后天八卦里，离卦对应洛书数几？', options: ['9', '6', '3'], answer: 0, expl: '离卦对应洛书数 9。' },
        { q: '后天八卦里，乾卦对应洛书数几？', options: ['6', '1', '8'], answer: 0, expl: '乾卦对应洛书数 6。' },
        { q: '坎（1）和离（9）相对，相加等于？', options: ['10', '15', '9'], answer: 0, expl: '后天八卦相对两卦的洛书数相加都等于 10。' },
        { q: '洛书九宫里，横、竖、斜任意三个数相加都等于？', options: ['15', '10', '12'], answer: 0, expl: '洛书九宫横竖斜相加均为 15。' }
      ] },
    { id: 'u5l5', title: '爻位之象',
      learn: '六爻从下往上，也可以看作人体从脚到头顶、一件事从起步到收尾：初爻是脚/起步，二爻是小腿/显露，三爻是胯股/通畅，四爻是腹胸/行动，五爻是头面/达成，上爻是头顶/结果。位置不同，状态不同。',
      quiz: [
        { q: '初爻大致对应人体的哪个部位？', options: ['脚、足、趾', '头面部', '腹部'], answer: 0, expl: '初爻在最下，对应脚、足、趾。' },
        { q: '五爻代表事物发展的哪个阶段？', options: ['达成 / 决策', '刚开始', '最终收尾'], answer: 0, expl: '五爻为「变之成」，代表事物发展到显要、可定的阶段。' },
        { q: '上爻代表一个过程的？', options: ['最终结果', '行动阶段', '显露阶段'], answer: 0, expl: '上爻在最上，代表一个过程的最终状态与结果。' },
        { q: '四爻常被看作事物变化的？', options: ['行动 / 推动', '起步', '通畅'], answer: 0, expl: '四爻为「变之动」，是采取实际行动的关键阶段。' }
      ] }
  ] }
];

/* ============ 四、基础原理讲解文案 ============ */
const TIAN_NUM = { qian: 1, dui: 2, li: 3, zhen: 4, xun: 5, kan: 6, gen: 7, kun: 8 };
const TRI_INFO = {
  qian: '像天空覆盖万物、刚健向上；也比作父亲、首领。特性：主动、向上、领导。',
  kun:  '像大地托住一切、滋养万物；也比作母亲。特性：柔顺、承载、包容。',
  zhen: '像春雷炸响、唤醒万物。特性：震动、奋起、行动、生机。',
  xun:  '像风无孔不入、温和吹拂。特性：进入、渗透、谦逊。',
  kan:  '像水流向下、遇阻而绕。特性：流动、险陷、智慧。',
  li:   '像火照亮外物、依附燃料。特性：光明、清晰、依附。',
  gen:  '像山岿然不动、稳稳挡住去路。特性：静止、稳重、止息。',
  dui:  '像湖泽让人舒畅、彼此交流。特性：喜悦、和悦、言语。'
};
function buildYaos(lines) {
  const yaos = [];
  for (let i = lines.length - 1; i >= 0; i--) yaos.push({ yang: lines[i] === 1 });
  return yaos;
}
const BASIC = {
  yinYang: [
    { key: 'yang', sym: '—', name: '阳爻', desc: '一条不断开的横线。代表阳：主动、向外、明亮、刚健。古人把阳爻记作「九」。' },
    { key: 'yin', sym: '⚋', name: '阴爻', desc: '中间断开的横线。代表阴：主静、向内、柔和、收敛。古人把阴爻记作「六」。' }
  ],
  yaoXiang: [
    { name: '初爻', body: '脚、足、趾（人体最下端）', stage: '变之始', role: '基层 / 起步', note: '事物刚刚开始，像人的脚站在地上' },
    { name: '二爻', body: '小腿、胫腓一带', stage: '变之显', role: '骨干 / 显露', note: '事物已能明显区分、站稳脚跟' },
    { name: '三爻', body: '胯、股一带', stage: '变之通', role: '承上启下', note: '各方面关系已沟通顺畅' },
    { name: '四爻', body: '腹部及心胸部', stage: '变之动', role: '推动 / 执行', note: '到了采取实际行动的关键阶段' },
    { name: '五爻', body: '头面部', stage: '变之成', role: '决策 / 达成', note: '事情发展到显要、可定的阶段' },
    { name: '上爻', body: '头顶、巅顶', stage: '变之终', role: '顶层 / 收尾', note: '一个过程的最终状态与结果' }
  ],
  trigrams: Object.keys(TRIGRAM).map((k) => {
    const t = TRIGRAM[k];
    return { key: k, name: t.name, nature: t.nature, desc: t.desc, info: TRI_INFO[k], num: TIAN_NUM[k], yaos: buildYaos(t.lines) };
  }),
  sixiang: [
    { name: '太阳（老阳）', lines: [1, 1], note: '阳极，会转变为阴（动）' },
    { name: '少阴', lines: [1, 0], note: '静，不变' },
    { name: '少阳', lines: [0, 1], note: '静，不变' },
    { name: '太阴（老阴）', lines: [0, 0], note: '阴极，会转变为阳（动）' }
  ].map((s) => ({ ...s, yaos: buildYaos(s.lines), dong: s.lines[0] === s.lines[1] })),
  xiantianFlat: [
    { name: '兑', pos: '东南' }, { name: '乾', pos: '南' }, { name: '巽', pos: '西南' },
    { name: '离', pos: '东' }, { empty: true }, { name: '坎', pos: '西' },
    { name: '震', pos: '东北' }, { name: '坤', pos: '北' }, { name: '艮', pos: '西北' }
  ],
  houtianFlat: [
    { name: '巽', pos: '东南' }, { name: '离', pos: '南' }, { name: '坤', pos: '西南' },
    { name: '震', pos: '东' }, { empty: true }, { name: '兑', pos: '西' },
    { name: '艮', pos: '东北' }, { name: '坎', pos: '北' }, { name: '乾', pos: '西北' }
  ],
  steps: [
    { n: '①', t: '阴阳', d: '世界最基本的两种力量' },
    { n: '②', t: '爻', d: '一条线就是一个爻' },
    { n: '③', t: '八卦', d: '三爻叠成八种' },
    { n: '④', t: '六十四卦', d: '两卦上下相重' }
  ],
  sanyiNote: '「易」字古人有三种解释，合称「三易」：① 变易——万物都在变化，没有一成不变；② 简易——再复杂的事，道理往往能简化到最根本；③ 不易——变化之中，有些根本规律始终不变。所以《易经》不是一本「定结果」的书，而是一套帮人理解「变化」的思维方法。',
  xyNote: '阴阳不是「好」与「坏」，而是古人对世界的一种基本看法：许多事物都有两种相反又互补的一面——天与地、动与静、刚与柔、明与暗。阳偏向主动、向外、明亮；阴偏向主静、向内、柔和。古人用「一条线」来画这种二分。',
  yaoNote: '把「阴阳」画成线，一个「爻」就是一条线：阳爻（—）不断开，阴爻（⚋）中间断开。读爻从下往上数：最底下叫「初爻」，往上是二爻、三爻……（记住：最下面才是第一爻！）',
  baguaNote: '每一层有 2 种选择（阳/阴），3 层叠起来 → 2 × 2 × 2 = 8 种，正好就是「八卦」。八卦也由下往上读（初爻、二爻、三爻）。下面每个卦都标了「先天数」（乾一、兑二、离三、震四、巽五、坎六、艮七、坤八），是个好记的口诀。',
  quxiangNote: '八卦的「象」不是随便定的，而是古人观察自然、人事归纳出来的：乾像天（最高、最刚健），坤像地（最广、最能承载），震像雷（震动），巽像风（无孔不入），坎像水（往下流），离像火（往上烧、要依附），艮像山（静止），兑像泽（让人舒畅）。看懂「象」，才能看懂一个卦在讲什么关系。',
  yaoweiNote: '一个六爻卦，从下往上：初爻、二爻、三爻、四爻、五爻、上爻。下三爻偏「内 / 己 / 开始」，上三爻偏「外 / 人 / 结果」；同样一条阳爻或阴爻，处在不同位置，意思也不同——古人借此讲「同一个道理在不同阶段该怎么用」。',
  fangweiNote: '八卦有两种常见排法。先天八卦（讲「结构 / 对待」）：乾南、坤北、离东、坎西、震东北、兑东南、巽西南、艮西北——两两相对，表示天地、水火等「对待」关系。后天八卦（讲「流行 / 实用」）：坎北、离南、震东、兑西、乾西北、坤西南、巽东南、艮东北——按四时流转、万物变化的方位来排，更偏日常应用。初学者先记住：先天讲「为什么这样分」，后天讲「实际怎么用」。',
  hexNote: '把一个八卦放「下」（叫下卦、偏内在），另一个放「上」（叫上卦、偏外在），上下一叠就有 6 个爻，组成一个六十四卦。8 × 8 = 64 种。六爻从下往上读：初、二、三、四、五、上（最上面叫「上爻」）。看懂上下两个八卦，就大致明白这个卦在讲哪两种力量的关系。',
  yaoXiangNote: '张延生在《易学入门》里把「爻位」也看作一种「象」：同一个六爻卦，从下往上既可以对应人体从脚到头顶，也可以对应一件事从起步到收尾。初爻像根基，上爻像结果。这不是说某爻一定「好」或「坏」，而是教我们观察：一件事处在哪个阶段、哪个位置，它的状态和处境会有什么不同。',
  duiyingNote: '《易学入门》反复强调：万物不是孤立存在的，而是处在一定的时空关系中相互对应。所谓「对立」只是事物对应关系里的一种状态。学《易》不是看「谁战胜谁」，而是观察不同位置、不同阶段的事物如何相互关联、相互转化——这是一种把世界看作联系网络的思维方式。'
};
export { BASIC };

/* ============ 五、每日一卦（按日期固定） ============ */
export function dailyHex(dateStr) {
  let h = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 64 + 1;
}

/* ============ 六、工具 ============ */
// 由卦序号返回「由上到下」显示的六爻（无变爻）
export function hexYaos(n) {
  const h = HEX.find((x) => x.n === n);
  if (!h) return [];
  const full = TRIGRAM[h.lo].lines.concat(TRIGRAM[h.up].lines); // 初..上
  const yaos = [];
  for (let i = full.length - 1; i >= 0; i--) yaos.push({ yang: full[i] === 1 });
  return yaos;
}
export function triYaos(key) {
  const lines = TRIGRAM[key].lines;
  const arr = [];
  for (let i = lines.length - 1; i >= 0; i--) arr.push({ yang: lines[i] === 1 });
  return arr;
}
export const TRIS = Object.keys(TRIGRAM).map((k) => ({ key: k, name: TRIGRAM[k].name, yaos: triYaos(k) }));
