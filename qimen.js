// qimen.js —— 转盘奇门（时家奇门·拆补法）排盘引擎
// 四盘：地盘、天盘（九星）、人盘（八门）、神盘（八神）。
// 参考《奇门遁甲入门讲义》体例。

import { fourPillars, currentTerm, xunInfo, jdToLocalDate } from './calendar.js';

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
// 节气→阳遁/阴遁 上中下元局数
export const JU_TABLE = {
  冬至: { dun: '阳', 上元: 7, 中元: 1, 下元: 4 },
  惊蛰: { dun: '阳', 上元: 7, 中元: 1, 下元: 4 },
  小寒: { dun: '阳', 上元: 2, 中元: 5, 下元: 8 },
  大寒: { dun: '阳', 上元: 3, 中元: 6, 下元: 9 },
  春分: { dun: '阳', 上元: 3, 中元: 6, 下元: 9 },
  立春: { dun: '阳', 上元: 8, 中元: 5, 下元: 2 },
  雨水: { dun: '阳', 上元: 9, 中元: 6, 下元: 3 },
  清明: { dun: '阳', 上元: 9, 中元: 6, 下元: 3 },
  谷雨: { dun: '阳', 上元: 5, 中元: 2, 下元: 8 },
  小满: { dun: '阳', 上元: 5, 中元: 2, 下元: 8 },
  立夏: { dun: '阳', 上元: 4, 中元: 1, 下元: 7 },
  芒种: { dun: '阳', 上元: 6, 中元: 3, 下元: 9 },

  夏至: { dun: '阴', 上元: 9, 中元: 6, 下元: 3 },
  白露: { dun: '阴', 上元: 9, 中元: 6, 下元: 3 },
  小暑: { dun: '阴', 上元: 8, 中元: 5, 下元: 2 },
  大暑: { dun: '阴', 上元: 7, 中元: 1, 下元: 4 },
  秋分: { dun: '阴', 上元: 7, 中元: 1, 下元: 4 },
  立秋: { dun: '阴', 上元: 2, 中元: 5, 下元: 8 },
  处暑: { dun: '阴', 上元: 3, 中元: 6, 下元: 9 },
  寒露: { dun: '阴', 上元: 3, 中元: 6, 下元: 9 },
  霜降: { dun: '阴', 上元: 5, 中元: 2, 下元: 8 },
  小雪: { dun: '阴', 上元: 5, 中元: 2, 下元: 8 },
  立冬: { dun: '阴', 上元: 6, 中元: 3, 下元: 9 },
  大雪: { dun: '阴', 上元: 4, 中元: 1, 下元: 7 }
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
  const zhiFuStarName = STAR_AT_POS[zhiFuPos];          // 值符星（中五则天禽，这里同坤二天芮处理）

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
    zhiFu: { yi: zhiFuYi, pos: zhiFuPos, star: zhiFuStarName, starAt: hourStemPos },
    zhiShi: { door: zhiShiDoorName, pos: zhiShiPos },
    kong: p.xunkong,
    maXing,
    tip: guide(dun, ju, p, zhiFuStarName, zhiShiDoorName)
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

function guide(dun, ju, p, zhiFuStar, zhiShiDoor) {
  const arr = [];
  arr.push('当前节气：' + p.jie.name + '，' + dun + '遁 ' + ju + ' 局。阳遁顺布，阴遁逆布。');
  arr.push('值符星为「' + zhiFuStar + '」，随旬首所遁之仪与时干而转。');
  arr.push('值使门为「' + zhiShiDoor + '」，按本旬时支步数飞布。');
  arr.push('九星为天盘，八门为人盘，八神为神盘；四盘合一，方可观事。');
  arr.push('占断先取用神宫：求财看生门、求官看开门、问病看天芮与死门、出行看休门、婚姻看六合与休门。');
  return arr;
}

/* ============ 日期辅助 ============ */
export function nowPaipan(question) {
  const d = new Date();
  const tzOffset = -d.getTimezoneOffset(); // 分钟
  const ms = d.getTime() + tzOffset * 60000 + 8 * 3600000; // 转到东八区
  const l = new Date(ms);
  return paipan({ y: l.getFullYear(), m: l.getMonth() + 1, d: l.getDate(), h: l.getHours(), mi: l.getMinutes() }, question);
}
