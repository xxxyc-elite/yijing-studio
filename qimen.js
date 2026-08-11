// qimen.js —— 转盘奇门（时家奇门·拆补法）排盘引擎
// 四盘：地盘、天盘（九星）、人盘（八门）、神盘（八神）。
// 参考《奇门遁甲入门讲义》体例。

import { fourPillars, currentTerm, xunInfo, jdToLocalDate, ZHI, ZHI_WX } from './calendar.js';

/* ============ 常量 ============ */
export const YI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']; // 三奇六仪顺布序列
export const XUN_TO_YI = { 甲子: '戊', 甲戌: '己', 甲申: '庚', 甲午: '辛', 甲辰: '壬', 甲寅: '癸' };

// 九宫位置 1..9 对应洛书：坎一、坤二、震三、巽四、中五、乾六、兑七、艮八、离九
export const POS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const POS_NAME = { 1: '坎一', 2: '坤二', 3: '震三', 4: '巽四', 5: '中五', 6: '乾六', 7: '兑七', 8: '艮八', 9: '离九' };

// 转盘奇门环形顺序（阳遁顺行此序，阴遁逆行）。中五寄坤二，不单独入环。
export const RING = [1, 8, 3, 4, 9, 2, 7, 6];
// 中五寄坤二宫
export function attachCenter(p) { return p === 5 ? 2 : p; }

// 九星原始宫位
export const STAR = {
  1: { name: '天蓬', wx: '水', yinYang: '阳', desc: '秋冬劫财，春夏休囚；主暗中、智谋、风险。' },
  8: { name: '天任', wx: '土', yinYang: '阳', desc: '厚重、稳重、田土、祭祀、奠基。' },
  3: { name: '天冲', wx: '木', yinYang: '阳', desc: '冲动、竞争、行动、军警、嫁娶不宜。' },
  4: { name: '天辅', wx: '木', yinYang: '阳', desc: '文教、辅佐、花草、嫁娶移徙吉利。' },
  9: { name: '天英', wx: '火', yinYang: '阳', desc: '文书、礼节、虚华、火气、嫁娶不利。' },
  2: { name: '天芮', wx: '土', yinYang: '阴', desc: '疾病、学生、土地；非吉星，测病主病灶。' },
  7: { name: '天柱', wx: '金', yinYang: '阴', desc: '破败、诉讼、口舌、破军之星。' },
  6: { name: '天心', wx: '金', yinYang: '阴', desc: '医药、领导、谋划、天心为吉，宜谋为。' }
};
// 天禽寄坤二宫
STAR[5] = { name: '天禽', wx: '土', yinYang: '阳', desc: '中土之象，寄坤二宫，旺相可辅君。' };
export const STAR_ORDER = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心']; // 环形顺序
export const STAR_AT_POS = { 1: '天蓬', 8: '天任', 3: '天冲', 4: '天辅', 9: '天英', 2: '天芮', 7: '天柱', 6: '天心' };
export const POS_OF_STAR = { 天蓬: 1, 天任: 8, 天冲: 3, 天辅: 4, 天英: 9, 天芮: 2, 天柱: 7, 天心: 6 };

// 八门原始宫位
export const DOOR = {
  1: { name: '休门', wx: '水', yinYang: '阳', jiXiong: '吉', desc: '休养、贵人、安稳、相亲、求财。' },
  8: { name: '生门', wx: '土', yinYang: '阳', jiXiong: '大吉', desc: '谋为、求财、婚嫁、生机。' },
  3: { name: '伤门', wx: '木', yinYang: '阳', jiXiong: '凶', desc: '讨债、捕捉、渔猎；忌嫁娶修造。' },
  4: { name: '杜门', wx: '木', yinYang: '阴', jiXiong: '平', desc: '藏形、避难、修炼；忌谋为。' },
  9: { name: '景门', wx: '火', yinYang: '阳', jiXiong: '平', desc: '考试、文书、献策；忌讼事。' },
  2: { name: '死门', wx: '土', yinYang: '阴', jiXiong: '凶', desc: '吊丧、葬仪；忌百事。' },
  7: { name: '惊门', wx: '金', yinYang: '阴', jiXiong: '凶', desc: '词讼、惊扰；忌求财。' },
  6: { name: '开门', wx: '金', yinYang: '阳', jiXiong: '大吉', desc: '谋为、求财、见贵、开业。' }
};
export const DOOR_ORDER = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
export const DOOR_AT_POS = { 1: '休门', 8: '生门', 3: '伤门', 4: '杜门', 9: '景门', 2: '死门', 7: '惊门', 6: '开门' };
export const POS_OF_DOOR = { 休门: 1, 生门: 8, 伤门: 3, 杜门: 4, 景门: 9, 死门: 2, 惊门: 7, 开门: 6 };

// 八神
export const SPIRIT = [
  { name: '值符', yinYang: '阳', desc: '天乙之首，百恶消散，百事可为。' },
  { name: '腾蛇', yinYang: '阴', desc: '虚惊、诡异、缠绕、变化无常。' },
  { name: '太阴', yinYang: '阴', desc: '荫庇、密谋、暗中相助、女性长辈。' },
  { name: '六合', yinYang: '阳', desc: '和合、婚姻、交易、中介、合作。' },
  { name: '白虎', yinYang: '阴', desc: '刑伤、争斗、病丧、阻力。' },
  { name: '玄武', yinYang: '阴', desc: '盗贼、暧昧、狡诈、暗中损耗。' },
  { name: '九地', yinYang: '阳', desc: '坚牢、伏藏、稳重、迟滞。' },
  { name: '九天', yinYang: '阳', desc: '显扬、高远、主动、张扬。' }
];

/* ============ 定局 ============ */
// 节气→阳遁/阴遁 上中下元局数（时家奇门拆补法定局表，依京房/传统阳遁阴遁局数）
// 规律：阳遁 上元=k，中元=k+6(洛书进三位)、下元=k+3；阴遁 上元=k，中元=k+3、下元=k+6。
export const JU_TABLE = {
  // —— 阳遁（冬至→芒种，共十二节气）——
  冬至: { dun: '阳', 上元: 1, 中元: 7, 下元: 4 },   // 阳一局 一七四
  小寒: { dun: '阳', 上元: 2, 中元: 8, 下元: 5 },   // 阳二局 二八五
  大寒: { dun: '阳', 上元: 3, 中元: 9, 下元: 6 },   // 阳三局 三九六
  立春: { dun: '阳', 上元: 8, 中元: 5, 下元: 2 },   // 阳八局 八五二
  雨水: { dun: '阳', 上元: 9, 中元: 6, 下元: 3 },   // 阳九局 九六三
  惊蛰: { dun: '阳', 上元: 1, 中元: 7, 下元: 4 },   // 阳一局 一七四
  春分: { dun: '阳', 上元: 3, 中元: 9, 下元: 6 },   // 阳三局 三九六
  清明: { dun: '阳', 上元: 4, 中元: 1, 下元: 7 },   // 阳四局 四一七
  谷雨: { dun: '阳', 上元: 5, 中元: 2, 下元: 8 },   // 阳五局 五二八
  立夏: { dun: '阳', 上元: 4, 中元: 1, 下元: 7 },   // 阳四局 四一七
  小满: { dun: '阳', 上元: 5, 中元: 2, 下元: 8 },   // 阳五局 五二八
  芒种: { dun: '阳', 上元: 6, 中元: 3, 下元: 9 },   // 阳六局 六三九

  // —— 阴遁（夏至→大雪，共十二节气）——
  夏至: { dun: '阴', 上元: 9, 中元: 3, 下元: 6 },   // 阴九局 九三六
  小暑: { dun: '阴', 上元: 8, 中元: 2, 下元: 5 },   // 阴八局 八二五
  大暑: { dun: '阴', 上元: 7, 中元: 1, 下元: 4 },   // 阴七局 七一四
  立秋: { dun: '阴', 上元: 2, 中元: 5, 下元: 8 },   // 阴二局 二五八
  处暑: { dun: '阴', 上元: 1, 中元: 4, 下元: 7 },   // 阴一局 一四七
  白露: { dun: '阴', 上元: 9, 中元: 3, 下元: 6 },   // 阴九局 九三六
  秋分: { dun: '阴', 上元: 7, 中元: 1, 下元: 4 },   // 阴七局 七一四
  寒露: { dun: '阴', 上元: 6, 中元: 9, 下元: 3 },   // 阴六局 六九三
  霜降: { dun: '阴', 上元: 5, 中元: 8, 下元: 2 },   // 阴五局 五八二
  立冬: { dun: '阴', 上元: 6, 中元: 9, 下元: 3 },   // 阴六局 六九三
  小雪: { dun: '阴', 上元: 5, 中元: 8, 下元: 2 },   // 阴五局 五八二
  大雪: { dun: '阴', 上元: 4, 中元: 7, 下元: 1 }    // 阴四局 四七一
};

// 日干支求三元（拆补法：以日干支所在旬的符头定元）
export function yuanOfDay(dayGzIdx) {
  const xu = xunInfo(dayGzIdx);
  const head = xu.head;
  if (['甲子', '甲午', '己卯', '己酉'].indexOf(head) !== -1) return '上元';
  if (['甲寅', '甲申', '己巳', '己亥'].indexOf(head) !== -1) return '中元';
  return '下元';
}

// 指定节气的局
export function juOf(termName, yuan) {
  const t = JU_TABLE[termName] || { dun: '阳', 上元: 1, 中元: 1, 下元: 1 };
  return { dun: t.dun, ju: t[yuan] || t['上元'] };
}

/* ============ 地盘 ============ */
export function diPan(dun, ju) {
  // 阳遁从 ju 宫起戊顺布；阴遁从 ju 宫起戊逆布
  const map = {};
  for (let i = 0; i < 9; i++) {
    const pos = dun === '阳' ? (((ju - 1 + i) % 9) + 1) : (((ju - 1 - i + 18) % 9) + 1);
    map[pos] = YI[i];
  }
  return map;
}

/* ============ 排盘主函数 ============ */
export function paipan(when, question) {
  const p = fourPillars(when.y, when.m, when.d, when.h, when.mi);
  const term = currentTerm(p.jd);
  const termName = term.cur.name;
  const yuan = yuanOfDay(p.day.idx);
  const { dun, ju } = juOf(termName, yuan);
  const dipan = diPan(dun, ju);

  // 时旬首与值符
  const hourXun = xunInfo(p.hour.idx);
  const zhiFuYi = XUN_TO_YI[hourXun.head];              // 旬首所遁之仪
  const zhiFuRawPos = posOfStem(dipan, zhiFuYi);        // 值符原始宫位（可能为中五）
  const zhiFuPos = attachCenter(zhiFuRawPos);           // 中五寄坤二
  const zhiFuStarName = STAR_AT_POS[zhiFuPos];          // 值符星（中五则寄坤二，以天芮代飞布）
  // 旬首遁中五时，值符之星实为天禽（天禽寄坤二、与天芮同宫），此处单独标注以合书规
  const zhiFuStarDisplay = zhiFuRawPos === 5 ? '天禽' : zhiFuStarName;

  // 时干所在宫 = 值符星落宫（中五寄二）
  const hourStemRawPos = posOfStem(dipan, p.hour.gan);
  const hourStemPos = attachCenter(hourStemRawPos);

  // 布九星：从值符星开始在时干宫，其余按 RING 顺序顺/逆
  const starAt = {};
  const idx0 = STAR_ORDER.indexOf(zhiFuStarName);
  const ringFrom = ringFromPos(hourStemPos, dun);
  for (let i = 0; i < 8; i++) {
    const sName = STAR_ORDER[(idx0 + i) % 8];
    starAt[ringFrom[i]] = { ...STAR[POS_OF_STAR[sName]], name: sName };
  }
  // 天禽寄中五宫（与坤二同宫论），无论值符是否在此，中五恒为天禽
  starAt[5] = { ...STAR[5], name: '天禽' };

  // 天盘：九星把各自原始宫位的地盘干带到新宫位
  const tianPan = {};
  for (const pos of RING) {
    const starHere = starAt[pos];
    const origPos = POS_OF_STAR[starHere.name];
    tianPan[pos] = dipan[origPos];
  }
  // 中五寄坤二：天禽随天芮，天盘干同坤二
  tianPan[5] = tianPan[2];

  // 值使门
  const zhiShiDoorName = DOOR_AT_POS[zhiFuPos];
  // 时支在本旬中的序号 0..9
  const hourOffset = p.hour.idx - hourXun.headIdx;
  const zhiShiPos = advanceRing(zhiFuPos, hourOffset, dun);
  // 布八门：从值使门开始在 zhiShiPos，其余按 RING 顺/逆
  const doorAt = {};
  const dIdx0 = DOOR_ORDER.indexOf(zhiShiDoorName);
  const ringFromDoor = ringFromPos(zhiShiPos, dun);
  for (let i = 0; i < 8; i++) {
    const dName = DOOR_ORDER[(dIdx0 + i) % 8];
    doorAt[ringFromDoor[i]] = { ...DOOR[POS_OF_DOOR[dName]], name: dName };
  }

  // 布八神：从值符所在宫（hourStemPos）起，阳遁顺 RING，阴遁逆 RING
  const spiritAt = {};
  const ringFromSpirit = ringFromPos(hourStemPos, dun);
  for (let i = 0; i < 8; i++) {
    const s = SPIRIT[i];
    spiritAt[ringFromSpirit[i]] = s;
  }

  // 旬空：日旬空标在地盘/天盘地支
  const maXing = maXingZhi(p.day.zhi);

  return {
    question,
    when: p,
    term: term.cur,
    yuan, dun, ju,
    dipan,
    starAt, tianPan, doorAt, spiritAt,
    zhiFu: { yi: zhiFuYi, pos: zhiFuPos, star: zhiFuStarDisplay, starAt: hourStemPos },
    zhiShi: { door: zhiShiDoorName, pos: zhiShiPos },
    kong: p.xunkong,
    maXing,
    tip: guide(dun, ju, p, zhiFuStarDisplay, zhiShiDoorName, zhiFuRawPos)
  };
}

function posOfStem(map, stem) {
  for (let pos = 1; pos <= 9; pos++) if (map[pos] === stem) return pos;
  return 1;
}
// 从某位置开始，按阴阳遁取 RING 顺序（含该位置；中五视为坤二）
function ringFromPos(start, dun) {
  start = attachCenter(start);
  const i = RING.indexOf(start);
  if (i === -1) return RING.slice();
  const out = [];
  for (let k = 0; k < 8; k++) {
    const idx = dun === '阳' ? ((i + k) % 8) : ((i - k + 16) % 8);
    out.push(RING[idx]);
  }
  return out;
}
// 从 start 沿 RING 走 steps 步
function advanceRing(start, steps, dun) {
  start = attachCenter(start);
  const i = RING.indexOf(start);
  const idx = dun === '阳' ? ((i + steps) % 8) : ((i - steps + 16) % 8);
  return RING[idx];
}
// 马星：申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳
function maXingZhi(dayZhi) {
  const map = { 申: '寅', 子: '寅', 辰: '寅', 寅: '申', 午: '申', 戌: '申', 巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳' };
  return map[dayZhi];
}

function guide(dun, ju, p, zhiFuStar, zhiShiDoor, zhiFuRawPos) {
  const arr = [];
  arr.push('当前节气：' + p.jie.name + '，' + dun + '遁 ' + ju + ' 局。阳遁顺布，阴遁逆布。');
  arr.push('值符星为「' + zhiFuStar + '」，随旬首所遁之仪与时干而转。' + (zhiFuRawPos === 5 ? '（旬首遁中五，天禽寄坤二，与天芮同宫）' : ''));
  arr.push('值使门为「' + zhiShiDoor + '」，按本旬时支步数飞布。');
  arr.push('九星为天盘，八门为人盘，八神为神盘；四盘合一，方可观事。');
  arr.push('占断先取用神宫：求财看生门、求官看开门、问病看天芮与死门、出行看休门、婚姻看六合与休门。');
  return arr;
}

/* ============ 用神定向 · 问事白话解读 ============ */
const STAR_JI = { 天辅: '吉', 天心: '吉', 天任: '吉', 天禽: '吉', 天冲: '平', 天英: '平', 天蓬: '凶', 天芮: '凶', 天柱: '凶' };
const SPIRIT_JI = { 值符: '吉', 六合: '吉', 太阴: '吉', 九地: '吉', 九天: '吉', 腾蛇: '凶', 白虎: '凶', 玄武: '凶' };
const POS_WX = { 1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火' };
const SHENG = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' };
const KE = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' };

// 依问题关键词取用神宫类型
export function pickYong(q) {
  const s = (q || '').replace(/\s/g, '');
  if (/财|生意|买卖|投资|经营|赚|收入|发财/.test(s)) return { kind: 'door', name: '生门', label: '求财' };
  if (/官|工作|事业|职位|升职|求职|考公|功名/.test(s)) return { kind: 'door', name: '开门', label: '求官求事业' };
  if (/病|健康|医药|身体|疾|症/.test(s)) return { kind: 'star', name: '天芮', label: '问病' };
  if (/出行|出门|旅行|外出|搬迁|旅游|出远门/.test(s)) return { kind: 'door', name: '休门', label: '出行' };
  if (/婚|感情|对象|恋爱|妻|夫|姻缘/.test(s)) return { kind: 'spirit', name: '六合', label: '婚姻感情' };
  if (/讼|官司|诉讼|打官司|纠纷|是非/.test(s)) return { kind: 'door', name: '惊门', label: '诉讼' };
  if (/考试|学业|升学|文凭|读书|学历/.test(s)) return { kind: 'door', name: '景门', label: '考试' };
  return null;
}

// 天盘干 + 地盘干 → 十干克应格局（奇门灵魂）
const GEJU_LIST = [
  ['戊', '丙', '青龙返首', '大吉', '戊加丙，青龙返首，谋为皆吉、所求必遂，出兵兴师诸事大吉。'],
  ['戊', '乙', '青龙合会', '平', '戊加乙，青龙合会，门吉事吉、门凶事凶。'],
  ['戊', '丁', '青龙耀明', '吉', '戊加丁，青龙耀明，宜谒贵求名，恐招惹是非。'],
  ['戊', '己', '贵人入狱', '凶', '戊加己，贵人入狱，公私不利、屈抑难伸。'],
  ['戊', '庚', '值符飞宫', '凶', '戊加庚，值符飞宫，吉事不吉、凶事更凶，须换地方。'],
  ['戊', '辛', '青龙折足', '凶', '戊加辛，青龙折足，招灾、足疾，静守则免。'],
  ['戊', '壬', '青龙入天牢', '凶', '戊加壬，青龙入天牢，凡谋不利。'],
  ['戊', '癸', '青龙华盖', '平', '戊加癸，青龙华盖，门吉事吉、门凶事凶，宜避灾。'],
  ['戊', '戊', '伏吟', '凶', '戊加戊，伏吟（双木成林），凡事闭塞、只宜静守。'],
  ['乙', '丙', '奇仪顺遂', '吉', '乙加丙，奇仪顺遂，星吉迁官晋职、星凶夫妻离别。'],
  ['乙', '丁', '奇仪相佐', '吉', '乙加丁，奇仪相佐，文书事吉、出行有喜。'],
  ['乙', '戊', '阴害阳门', '凶', '乙加戊，阴害阳门，利阴害阳，门凶被迫。'],
  ['乙', '己', '日奇入墓', '凶', '乙加己，日奇入墓，门凶事凶。'],
  ['乙', '庚', '日奇被刑', '凶', '乙加庚，日奇被刑，争讼财产、夫妻怀私。'],
  ['乙', '辛', '青龙逃走', '凶', '乙加辛，青龙逃走，奴仆拐带、六畜走失，百事凶。'],
  ['乙', '壬', '日奇入地', '凶', '乙加壬，日奇入地，尊卑悖乱、官讼、有人谋害。'],
  ['乙', '癸', '日奇入地网', '凶', '乙加癸，日奇入地网，宜遁迹隐避。'],
  ['乙', '乙', '日奇伏吟', '凶', '乙加乙，日奇伏吟，不宜见上层、只宜安分。'],
  ['丙', '戊', '飞鸟跌穴', '大吉', '丙加戊，飞鸟跌穴，百事吉利、诸谋皆成。'],
  ['丙', '乙', '日月并行', '吉', '丙加乙，日月并行，公私谋为皆利。'],
  ['丙', '丁', '月奇朱雀', '吉', '丙加丁，月奇朱雀，贵人文书吉，常生口舌。'],
  ['丙', '己', '火孛入刑', '凶', '丙加己，火孛入刑，囚人必得、盗贼必获，占事不利。'],
  ['丙', '庚', '荧入太白', '凶', '丙加庚，荧入太白（火入金乡），利主、贼自退，为客进败。'],
  ['丙', '辛', '谋事就成', '吉', '丙加辛，谋事就成，占病不愈、占事就。'],
  ['丙', '壬', '火入天罗', '凶', '丙加壬，火入天罗，为客不利、是非缠绕。'],
  ['丙', '癸', '月奇入地网', '凶', '丙加癸，月奇入地网，阴人害事、灾祸。'],
  ['丙', '丙', '月奇悖师', '凶', '丙加丙，月奇悖师，文书逼迫、破耗遗失。'],
  ['丁', '戊', '青龙转光', '吉', '丁加戊，青龙转光，官人升迁、常人威崇。'],
  ['丁', '乙', '人遁吉格', '吉', '丁加乙，人遁吉格，贵人加官进爵、常人婚财。'],
  ['丁', '丙', '星随月转', '吉', '丁加丙，星随月转，贵人越级、凶事化解。'],
  ['丁', '己', '火入勾陈', '凶', '丁加己，火入勾陈，奸私仇冤、事因女人。'],
  ['丁', '庚', '文书阻隔', '凶', '丁加庚，文书阻隔，行人必归、占讼刑罪。'],
  ['丁', '辛', '朱雀入狱', '凶', '丁加辛，朱雀入狱（罪人失囚），罪人释而官人失位。'],
  ['丁', '壬', '五神互合', '吉', '丁加壬，五神互合，贵人思诏、讼狱公平。'],
  ['丁', '癸', '朱雀投江', '凶', '丁加癸，朱雀投江，百事皆凶、文书口舌沉溺。'],
  ['丁', '丁', '奇入太阴', '吉', '丁加丁，奇入太阴，文书喜庆、凡事乘心。'],
  ['己', '戊', '犬遇青龙', '吉', '己加戊，犬遇青龙，门吉谋望遂、门凶枉劳。'],
  ['己', '乙', '墓神不明', '凶', '己加乙，墓神不明，地户逢星，宜隐遁。'],
  ['己', '丙', '火孛地户', '凶', '己加丙，火孛地户，阳人冤事、男遭刑。'],
  ['己', '丁', '朱雀入墓', '凶', '己加丁，朱雀入墓，词讼凶、先曲后直。'],
  ['己', '庚', '刑格返名', '凶', '己加庚，刑格返名，讼病凶、谋事破耗。'],
  ['己', '辛', '游魂入墓', '凶', '己加辛，游魂入墓，小人作祟、凶。'],
  ['己', '壬', '地网高张', '凶', '己加壬，地网高张，狡童佚女、凶。'],
  ['己', '癸', '地刑玄武', '凶', '己加癸，地刑玄武，病危、官讼、内丑。'],
  ['己', '己', '地户逢鬼', '凶', '己加己，地户逢鬼，病凶、谋事凶。'],
  ['庚', '戊', '太白伏宫', '凶', '庚加戊，太白伏宫（伏宫格），百事不可、谋为凶。'],
  ['庚', '乙', '太白逢星', '凶', '庚加乙，太白逢星，退吉进凶、谋为不利。'],
  ['庚', '丙', '太白入荧', '凶', '庚加丙，太白入荧（白入荧），利客、贼来，宜伏击。'],
  ['庚', '丁', '亭亭之格', '凶', '庚加丁，亭亭之格，因私匿、文书阻隔。'],
  ['庚', '己', '刑格', '凶', '庚加己，刑格，官司被刑、破财疾病。'],
  ['庚', '庚', '太白同宫', '凶', '庚加庚，太白同宫（战格），官灾横祸。'],
  ['庚', '辛', '白虎干格', '凶', '庚加辛，白虎干格，远行失道、多凶。'],
  ['庚', '壬', '上格', '凶', '庚加壬，上格（小格），迷途破财得病。'],
  ['庚', '癸', '大格', '凶', '庚加癸，大格，百事凶、求人不在、出行车破马死。'],
  ['辛', '戊', '困龙被伤', '凶', '辛加戊，困龙被伤，官司破财、屈抑守分。'],
  ['辛', '乙', '白虎猖狂', '凶', '辛加乙，白虎猖狂，家败人亡、远行多殃、婚凶。'],
  ['辛', '丙', '干合悖师', '凶', '辛加丙，干合悖师，误入陷阱、刑禁。'],
  ['辛', '丁', '狱神得奇', '吉', '辛加丁，狱神得奇，经商获倍利、囚人赦。'],
  ['辛', '己', '入狱自刑', '凶', '辛加己，入狱自刑，奴仆遭刑、凶。'],
  ['辛', '庚', '白虎出力', '凶', '辛加庚，白虎出力，刀刃血光、凶。'],
  ['辛', '壬', '凶蛇入狱', '凶', '辛加壬，凶蛇入狱，两男争女、诉讼。'],
  ['辛', '癸', '天牢华盖', '凶', '辛加癸，天牢华盖，误入天网、动止乖张。'],
  ['壬', '戊', '小蛇化龙', '吉', '壬加戊，小蛇化龙，男人发达、女产婴童。'],
  ['壬', '乙', '日入天罗', '凶', '壬加乙，日入天罗，仕途暗昧、祸端。'],
  ['壬', '丙', '水蛇入火', '凶', '壬加丙，水蛇入火，官灾刑禁、络绎不绝。'],
  ['壬', '丁', '干合蛇刑', '凶', '壬加丁，干合蛇刑，文书牵连、贵人匆匆。'],
  ['壬', '己', '反吟蛇刑', '凶', '壬加己，反吟蛇刑，官司败诉、破财。'],
  ['壬', '庚', '太白擒蛇', '平', '壬加庚，太白擒蛇，刑狱公平、私谋不成。'],
  ['壬', '辛', '腾蛇相缠', '凶', '壬加辛，腾蛇相缠，纵奇门亦凶、纠缠。'],
  ['壬', '壬', '蛇入地罗', '凶', '壬加壬，蛇入地罗（伏吟），内忧外患。'],
  ['壬', '癸', '幼女奸淫', '凶', '壬加癸，幼女奸淫，家丑、凡事暗昧。'],
  ['癸', '戊', '天乙会合', '吉', '癸加戊，天乙会合，婚成、人谋利，门凶反祸。'],
  ['癸', '乙', '华盖逢星', '吉', '癸加乙，华盖逢星，贵人禄位、常人平安。'],
  ['癸', '丙', '华盖悖师', '凶', '癸加丙，华盖悖师，贵贱不分、小人乖张。'],
  ['癸', '丁', '腾蛇夭矫', '凶', '癸加丁，腾蛇夭矫，百事不利、虚惊怪异。'],
  ['癸', '己', '华盖地户', '凶', '癸加己，华盖地户，男女狱讼、凶。'],
  ['癸', '庚', '太白入网', '凶', '癸加庚，太白入网，冤诬、自屈。'],
  ['癸', '辛', '网盖天牢', '凶', '癸加辛，网盖天牢，讼病凶、无救。'],
  ['癸', '壬', '复见腾蛇', '凶', '癸加壬，复见腾蛇，凡事不利、灾患。'],
  ['癸', '癸', '天网四张', '凶', '癸加癸，天网四张（伏吟），行人失伴、病讼凶。']
];
const GEJU = {};
for (const [u, l, name, level, desc] of GEJU_LIST) {
  (GEJU[u] = GEJU[u] || {})[l] = { name, level, desc };
}
function gejuOf(upper, lower) {
  return (GEJU[upper] && GEJU[upper][lower]) || null;
}

// 扫描全盘格局，返回有名称的格局（按吉凶排序）
export function gejuScan(res) {
  const out = [];
  for (let pos = 1; pos <= 9; pos++) {
    if (pos === 5) continue;
    const g = gejuOf(res.tianPan[pos], res.dipan[pos]);
    if (g) out.push({ pos, posName: POS_NAME[pos], up: res.tianPan[pos], down: res.dipan[pos], ...g });
  }
  const order = { 大吉: 0, 吉: 1, 平: 2, 凶: 3, 大凶: 4 };
  return out.sort((a, b) => (order[a.level] || 2) - (order[b.level] || 2));
}

// 门宫关系：门生宫=和、宫生门=义、门克宫=迫、宫克门=制、比和
function doorPalaceRel(menWx, posWx) {
  if (SHENG[menWx] === posWx) return { rel: '和', t: '门生宫为「和」，吉门更吉、凶门减凶' };
  if (SHENG[posWx] === menWx) return { rel: '义', t: '宫生门为「义」，门得庇护而力增' };
  if (KE[menWx] === posWx) return { rel: '迫', t: '门克宫为「迫」（被迫），吉门吉不就、凶门事更凶' };
  if (KE[posWx] === menWx) return { rel: '制', t: '宫克门为「制」（受制），吉门受制不吉、凶门受制不起' };
  return { rel: '比', t: '门宫比和，力专' };
}
// 九星旺相休囚废（依月令五行）
function starState(starWx, monthWx) {
  if (starWx === monthWx) return '旺';
  if (SHENG[monthWx] === starWx) return '相';
  if (SHENG[starWx] === monthWx) return '休';
  if (KE[starWx] === monthWx) return '囚';
  if (KE[monthWx] === starWx) return '废';
  return '平';
}
function posOfGan(map, gan) {
  for (let pos = 1; pos <= 9; pos++) if (map[pos] === gan) return pos;
  return null;
}

// 依据问题解读用神宫（白话，含格局/星门旺相/日干时干/应期）
export function interpret(question, res) {
  const p = res.when;
  const monthWx = ZHI_WX[ZHI.indexOf(p.month.zhi)];
  const lines = [];
  // 我（日干）与 事（时干）落宫（甲日/甲时遁于值符/值使，落其同宫）
  const dayPos0 = posOfGan(res.tianPan, p.day.gan);
  const hourPos0 = posOfGan(res.tianPan, p.hour.gan);
  const dayPos = dayPos0 || res.zhiFu.starAt;
  const hourPos = hourPos0 || res.zhiShi.pos;
  const dayWx = dayPos ? POS_WX[dayPos] : null;
  const hourWx = hourPos ? POS_WX[hourPos] : null;

  const y = pickYong(question);
  let pos = null;
  if (y) {
    if (y.kind === 'door') pos = Object.keys(res.doorAt).find(pp => res.doorAt[pp] && res.doorAt[pp].name === y.name);
    else if (y.kind === 'star') pos = Object.keys(res.starAt).find(pp => res.starAt[pp] && res.starAt[pp].name === y.name);
    else if (y.kind === 'spirit') pos = Object.keys(res.spiritAt).find(pp => res.spiritAt[pp] && res.spiritAt[pp].name === y.name);
  }

  lines.push('当前为' + res.dun + '遁 ' + res.ju + ' 局（' + res.term.name + '·' + res.yuan + '元），日干' + p.day.gz + '为"我/求测人"落' + POS_NAME[dayPos] + '宫，时干' + p.hour.gz + '为"所占之事/对方"落' + POS_NAME[hourPos] + '宫。');

  // 主用神：关键词命中则用神宫，否则以日干/时干为体用
  if (pos != null) {
    const posN = Number(pos);
    const door = res.doorAt[pos], star = res.starAt[pos], spirit = res.spiritAt[pos];
    const di = res.dipan[pos], tian = res.tianPan[pos];
    lines.push('问「' + question + '」，用神取【' + y.label + '】（' + y.name + '）落' + POS_NAME[posN] + '宫：门【' + door.name + '·' + door.jiXiong + '】、星【' + star.name + '】、神【' + spirit.name + '】；地盘' + di + '、天盘' + tian + '。');
    const dRel = doorPalaceRel(door.wx, POS_WX[posN]);
    const sSt = starState(star.wx, monthWx);
    const dJ = door.jiXiong, sJ = STAR_JI[star.name] || '平', gJ = SPIRIT_JI[spirit.name] || '平';
    lines.push('门宫关系：' + dRel.t + '。九星于当令为【' + sSt + '】（' + (sSt === '旺' || sSt === '相' ? '得地得时、力足' : sSt === '废' || sSt === '囚' ? '失时无力' : '中和') + '）。用神宫门【' + dJ + '】、星【' + sJ + '】、神【' + gJ + '】。');
    const g = gejuOf(tian, di);
    if (g) lines.push('用神宫格局：【' + g.name + '·' + g.level + '】' + g.desc);
    // 综合门/星/神/宫旺相/门宫关系/格局 定总断
    let toneWord;
    if (dJ === '凶') toneWord = '凶象显现，宜谨慎收敛、不宜妄动';
    else {
      const menShi = (dRel.rel === '迫' || dRel.rel === '制');
      const xiongGe = g && (g.level === '凶' || g.level === '大凶');
      const jiGe = g && (g.level === '大吉' || g.level === '吉');
      if (dJ === '吉' || dJ === '大吉') {
        if (menShi && xiongGe) toneWord = '门虽吉却遭「迫/制」失位、又临凶格，吉不就而事多阻滞，宜守不宜进';
        else if (menShi) toneWord = '吉门被迫（吉不就），事须费力、稳中求进';
        else if (xiongGe) toneWord = '门虽吉而临凶格，外患暗伏，成事须提防、见好就收';
        else toneWord = '吉象明显，所谋易遂，可放手去做';
      } else {
        if (xiongGe) toneWord = '门平而逢凶格，宜谨慎、避其方';
        else if (jiGe) toneWord = '门平却得吉格相扶，事有转机、可图';
        else toneWord = '吉凶参半，须合星神旺相与格局再断，稳中求进';
      }
    }
    lines.push('【用神总断】综合门、星、神、宫旺相与门宫关系、格局，' + toneWord + '。');
  } else {
    // 未识别关键词：以日干(我)/时干(事)为体用
    lines.push('未识别到具体事类，按奇门常法以「日干为我、时干为事」断之。');
    const r = wxRelQL(dayWx, hourWx);
    lines.push('我（日干' + p.day.gz + '宫属' + dayWx + '）与事（时干' + p.hour.gz + '宫属' + hourWx + '）关系：【' + r.k + '】——' + r.say);
  }

  // 日干(我) vs 时干(事) 体用生克（任何事都看）
  if (dayWx && hourWx) {
    const r = wxRelQL(dayWx, hourWx);
    const dayDoor = res.doorAt[dayPos], dayStar = res.starAt[dayPos], daySpirit = res.spiritAt[dayPos];
    const hourDoor = res.doorAt[hourPos], hourStar = res.starAt[hourPos], hourSpirit = res.spiritAt[hourPos];
    lines.push('我宫：门【' + dayDoor.name + '·' + dayDoor.jiXiong + '】星【' + dayStar.name + '】神【' + daySpirit.name + '】；事宫：门【' + hourDoor.name + '·' + hourDoor.jiXiong + '】星【' + hourStar.name + '】神【' + hourSpirit.name + '】。');
    const dl = doorPalaceRel(dayDoor.wx, POS_WX[dayPos]);
    const gDay = gejuOf(res.tianPan[dayPos], res.dipan[dayPos]);
    const gHour = gejuOf(res.tianPan[hourPos], res.dipan[hourPos]);
    lines.push('我宫门宫：「' + dl.t + '」' + (gDay ? '；我宫格局【' + gDay.name + '·' + gDay.level + '】' + gDay.desc : '') + (gHour ? '；事宫格局【' + gHour.name + '·' + gHour.level + '】' + gHour.desc : ''));
    lines.push('【体用总断】' + r.tone + (r.k === '我克' || r.k === '比和' ? '，我方占上风、事可图。' : r.k === '生我' ? '，外援来助、事易成。' : r.k === '克我' ? '，事来掣肘、宜守不宜进。' : '，我须付出心力（泄气），谋事多劳。'));
  }

  // 显著格局提示（全盘）
  const sig = gejuScan(res).filter(x => x.level === '大吉' || x.level === '吉' || x.level === '凶' || x.level === '大凶');
  if (sig.length) {
    lines.push('全盘格局要览：' + sig.map(x => POS_NAME[x.pos] + '宫「' + x.name + '·' + x.level + '」').join('；') + '。' + (sig.some(x => x.level === '大吉' || x.level === '吉') ? '吉格临处，宜把握其方其机；' : '') + (sig.some(x => x.level === '凶' || x.level === '大凶') ? '凶格临处，宜避其方、慎其动。' : ''));
  }

  // 应期
  const yPos = pos != null ? Number(pos) : (hourPos || dayPos);
  const yKong = res.kong.indexOf(res.dipan[yPos]) !== -1 || res.kong.indexOf(res.tianPan[yPos]) !== -1;
  const ma = res.maXing;
  let ying = '【应期推断】';
  if (yKong) ying += '用神宫逢旬空（' + res.kong.join('、') + '），须待出空（出旬、填实或冲空之日月）方能应事；';
  if (ma) ying += '日支' + p.day.zhi + '之马星在' + ma + '，主变动迅速、应期不远；';
  ying += '又奇门以值使门（' + res.zhiShi.door + '）落宫与本局阴阳遁论迟速：阳遁顺行事近、阴遁逆行事远，远应年月、近应日时。';
  lines.push(ying);

  return { yong: y, lines };
}
// 五行生克关系（给日干/时干体用断用）
function wxRelQL(fromWx, toWx) {
  if (!fromWx || !toWx) return { k: '', say: '', tone: '' };
  if (fromWx === toWx) return { k: '比和', say: '我事同气、彼此帮衬', tone: '平' };
  if (SHENG[toWx] === fromWx) return { k: '生我', say: '事来生我、有人相助', tone: '吉' };
  if (KE[fromWx] === toWx) return { k: '我克', say: '我能制事、事在掌握', tone: '吉' };
  if (SHENG[fromWx] === toWx) return { k: '我生', say: '我去生事、出多入少', tone: '平' };
  if (KE[toWx] === fromWx) return { k: '克我', say: '事来克我、有阻力', tone: '凶' };
  return { k: '', say: '', tone: '' };
}

/* ============ 日期辅助 ============ */
export function nowPaipan(question) {
  const d = new Date();
  const tzOffset = -d.getTimezoneOffset(); // 分钟
  const ms = d.getTime() + tzOffset * 60000 + 8 * 3600000; // 转到东八区
  const l = new Date(ms);
  return paipan({ y: l.getFullYear(), m: l.getMonth() + 1, d: l.getDate(), h: l.getHours(), mi: l.getMinutes() }, question);
}
