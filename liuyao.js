// liuyao.js —— 六爻纳甲装卦引擎
// 八宫卦序 / 纳甲配支 / 六亲 / 六神 / 世应 / 动爻变卦 / 旬空月破 / 伏神 / 用神
// 体例依《火珠林》《卜筮正宗》《增删卜易》一脉的京房纳甲法。

import { TRIGRAM, HEX } from './data.js';
import { GAN, ZHI, ZHI_WX, fourPillars, xunInfo } from './calendar.js';

/* ============ 基础表 ============ */
// 八宫（宫主卦）与宫五行
export const PALACES = [
  { key: 'qian', name: '乾', wx: '金' },
  { key: 'kan', name: '坎', wx: '水' },
  { key: 'gen', name: '艮', wx: '土' },
  { key: 'zhen', name: '震', wx: '木' },
  { key: 'xun', name: '巽', wx: '木' },
  { key: 'li', name: '离', wx: '火' },
  { key: 'kun', name: '坤', wx: '土' },
  { key: 'dui', name: '兑', wx: '金' }
];

// 纳甲：内卦（初二三爻）与外卦（四五六爻）
const NAJIA_IN = {
  qian: { gan: '甲', zhi: ['子', '寅', '辰'] },
  kan: { gan: '戊', zhi: ['寅', '辰', '午'] },
  gen: { gan: '丙', zhi: ['辰', '午', '申'] },
  zhen: { gan: '庚', zhi: ['子', '寅', '辰'] },
  xun: { gan: '辛', zhi: ['丑', '亥', '酉'] },
  li: { gan: '己', zhi: ['卯', '丑', '亥'] },
  kun: { gan: '乙', zhi: ['未', '巳', '卯'] },
  dui: { gan: '丁', zhi: ['巳', '卯', '丑'] }
};
const NAJIA_OUT = {
  qian: { gan: '壬', zhi: ['午', '申', '戌'] },
  kan: { gan: '戊', zhi: ['申', '戌', '子'] },
  gen: { gan: '丙', zhi: ['戌', '子', '寅'] },
  zhen: { gan: '庚', zhi: ['午', '申', '戌'] },
  xun: { gan: '辛', zhi: ['未', '巳', '卯'] },
  li: { gan: '己', zhi: ['酉', '未', '巳'] },
  kun: { gan: '癸', zhi: ['丑', '亥', '酉'] },
  dui: { gan: '丁', zhi: ['亥', '酉', '未'] }
};

export const LIUSHEN = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
// 日干起六神：甲乙青龙、丙丁朱雀、戊勾陈、己螣蛇、庚辛白虎、壬癸玄武
function liushenStart(dayGan) {
  const i = GAN.indexOf(dayGan);
  if (i <= 1) return 0;
  if (i <= 3) return 1;
  if (i === 4) return 2;
  if (i === 5) return 3;
  if (i <= 7) return 4;
  return 5;
}

// 六冲
export function chongZhi(z) { return ZHI[(ZHI.indexOf(z) + 6) % 12]; }
// 六合
export const LIUHE = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };

const SHENG = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' };
const KE = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' };

// 六亲：以卦宫五行为「我」
export function liuqin(palaceWx, yaoWx) {
  if (palaceWx === yaoWx) return '兄弟';
  if (SHENG[yaoWx] === palaceWx) return '父母';
  if (SHENG[palaceWx] === yaoWx) return '子孙';
  if (KE[yaoWx] === palaceWx) return '官鬼';
  if (KE[palaceWx] === yaoWx) return '妻财';
  return '';
}

export const YONGSHEN = [
  { qin: '父母', use: '房屋、车辆、文书合同、证件、学业考试、父母长辈、雨具、消息' },
  { qin: '子孙', use: '子女晚辈、医药、僧道、六畜、解忧之神；克官鬼，占病占讼最喜见' },
  { qin: '官鬼', use: '工作职位、功名、丈夫、盗贼、疾病、忧疑之事' },
  { qin: '妻财', use: '钱财、货物、妻妾、仓库、俸禄；克父母，占文书则忌' },
  { qin: '兄弟', use: '兄弟姐妹、朋友同辈、竞争对手、劫财阻隔' }
];

/* ============ 八宫六十四卦表（程序生成） ============ */
const TRI_KEYS = Object.keys(TRIGRAM);
function linesToKey(l3) {
  for (const k of TRI_KEYS) {
    const t = TRIGRAM[k].lines;
    if (t[0] === l3[0] && t[1] === l3[1] && t[2] === l3[2]) return k;
  }
  return null;
}
export function keyOf6(lines6) {
  const lo = linesToKey(lines6.slice(0, 3));
  const up = linesToKey(lines6.slice(3, 6));
  return { lo, up };
}
export function hexOf(lines6) {
  const { lo, up } = keyOf6(lines6);
  return HEX.find((h) => h.lo === lo && h.up === up) || null;
}

// 变爻规则：本宫卦依次变出八卦
const VARIANTS = [
  { flips: [], shi: 6, label: '八纯' },
  { flips: [0], shi: 1, label: '一世' },
  { flips: [0, 1], shi: 2, label: '二世' },
  { flips: [0, 1, 2], shi: 3, label: '三世' },
  { flips: [0, 1, 2, 3], shi: 4, label: '四世' },
  { flips: [0, 1, 2, 3, 4], shi: 5, label: '五世' },
  { flips: [0, 1, 2, 4], shi: 4, label: '游魂' },
  { flips: [4], shi: 3, label: '归魂' }
];

// 卦名 → {palace, palaceWx, shi, ying, label}
export const GONG_TABLE = (() => {
  const t = {};
  for (const p of PALACES) {
    const base = TRIGRAM[p.key].lines.concat(TRIGRAM[p.key].lines); // 由下到上 6 爻
    VARIANTS.forEach((v) => {
      const l = base.slice();
      v.flips.forEach((i) => { l[i] = l[i] ? 0 : 1; });
      const h = hexOf(l);
      if (!h) return;
      t[h.n] = {
        palace: p.name, palaceKey: p.key, palaceWx: p.wx,
        shi: v.shi, ying: v.shi <= 3 ? v.shi + 3 : v.shi - 3,
        label: v.label
      };
    });
  }
  return t;
})();

/* ============ 装卦 ============ */
// lines6：由下到上 [初..上]，1=阳 0=阴
// moving：由下到上的动爻布尔数组
export function dressHex(lines6, dayGan) {
  const h = hexOf(lines6);
  const g = GONG_TABLE[h.n];
  const lo = h.lo, up = h.up;
  const start = liushenStart(dayGan);
  const yaos = [];
  for (let i = 0; i < 6; i++) {
    const inner = i < 3;
    const nj = inner ? NAJIA_IN[lo] : NAJIA_OUT[up];
    const zhi = nj.zhi[inner ? i : i - 3];
    const wx = ZHI_WX[ZHI.indexOf(zhi)];
    yaos.push({
      pos: i + 1,
      yang: lines6[i] === 1,
      gan: nj.gan,
      zhi,
      wx,
      qin: liuqin(g.palaceWx, wx),
      shen: LIUSHEN[(start + i) % 6],
      shi: g.shi === i + 1,
      ying: g.ying === i + 1
    });
  }
  return {
    n: h.n, name: h.name, lo, up, lines: lines6.slice(),
    palace: g.palace, palaceWx: g.palaceWx, label: g.label,
    shi: g.shi, ying: g.ying, yaos,
    yi: h.y, desc: h.d
  };
}

// 伏神：本卦所缺六亲，取本宫首卦（八纯卦）同爻位之爻伏于其下
function findFu(ben, dayGan) {
  const have = new Set(ben.yaos.map((y) => y.qin));
  const missing = ['父母', '兄弟', '子孙', '妻财', '官鬼'].filter((q) => !have.has(q));
  if (!missing.length) return {};
  const pk = PALACES.find((p) => p.name === ben.palace).key;
  const pureLines = TRIGRAM[pk].lines.concat(TRIGRAM[pk].lines);
  const pure = dressHex(pureLines, dayGan);
  const fu = {};
  pure.yaos.forEach((y, i) => {
    if (missing.indexOf(y.qin) !== -1 && !fu[i]) {
      fu[i] = { qin: y.qin, zhi: y.zhi, wx: y.wx, gan: y.gan };
    }
  });
  return fu;
}

/* ============ 摇卦 ============ */
// 三枚铜钱：字(有字面)记2，背记3；三枚之和 6老阴 7少阳 8少阴 9老阳
export function tossOnce() {
  const c = [0, 0, 0].map(() => (Math.random() < 0.5 ? 2 : 3));
  const sum = c[0] + c[1] + c[2];
  return { coins: c, sum, yang: sum === 7 || sum === 9, moving: sum === 6 || sum === 9 };
}
export function tossSix() {
  const arr = [];
  for (let i = 0; i < 6; i++) arr.push(tossOnce());
  return arr;
}

/* ============ 完整排盘 ============ */
/**
 * @param {Array} tosses 六次摇卦结果（由下到上），元素含 {sum}
 * @param {Object} when {y,m,d,h,mi}
 * @param {String} question 所问之事
 */
export function paipan(tosses, when, question) {
  const p = fourPillars(when.y, when.m, when.d, when.h, when.mi);
  const dayGan = p.day.gan, dayZhi = p.day.zhi, monthZhi = p.month.zhi;
  const benLines = tosses.map((t) => (t.sum === 7 || t.sum === 9 ? 1 : 0));
  const moving = tosses.map((t) => t.sum === 6 || t.sum === 9);
  const ben = dressHex(benLines, dayGan);
  const fu = findFu(ben, dayGan);

  let bian = null;
  if (moving.some(Boolean)) {
    const bl = benLines.map((v, i) => (moving[i] ? (v ? 0 : 1) : v));
    bian = dressHex(bl, dayGan);
  }

  const kong = p.xunkong;
  const monthBreak = chongZhi(monthZhi);   // 月破之支
  const dayChong = chongZhi(dayZhi);

  ben.yaos.forEach((y, i) => {
    y.moving = moving[i];
    y.tossSum = tosses[i].sum;
    y.old = tosses[i].sum === 6 || tosses[i].sum === 9;
    y.kong = kong.indexOf(y.zhi) !== -1;
    y.poMonth = y.zhi === monthBreak;
    y.chongDay = y.zhi === dayChong;
    y.heDay = LIUHE[y.zhi] === dayZhi;
    y.fu = fu[i] || null;
    y.byMonth = rel(monthZhi, y.zhi);
    y.byDay = rel(dayZhi, y.zhi);
    y.wang = wangShuai(y.wx, monthZhi);
    if (bian) { y.bian = bian.yaos[i]; }
  });

  return {
    question: question || '',
    when: p,
    ben, bian, kong,
    monthZhi, dayZhi, dayGan,
    monthBreak,
    summary: summarize(ben, bian, p)
  };
}

// 某支对某支的生克（以五行论）
function rel(fromZhi, toZhi) {
  const a = ZHI_WX[ZHI.indexOf(fromZhi)], b = ZHI_WX[ZHI.indexOf(toZhi)];
  if (a === b) return '比助';
  if (SHENG[a] === b) return '生';
  if (KE[a] === b) return '克';
  if (SHENG[b] === a) return '泄';
  if (KE[b] === a) return '耗';
  return '';
}
// 旺相休囚死（以月令论）
const SEASON_WX = { 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水', 子: '水', 丑: '土' };
export function wangShuai(yaoWx, monthZhi) {
  const m = SEASON_WX[monthZhi];
  if (yaoWx === m) return '旺';
  if (SHENG[m] === yaoWx) return '相';
  if (SHENG[yaoWx] === m) return '休';
  if (KE[yaoWx] === m) return '囚';
  if (KE[m] === yaoWx) return '死';
  return '';
}

// 卦体断语（六冲、六合、游魂归魂、动爻多少）
function summarize(ben, bian, p) {
  const out = [];
  const shiYao = ben.yaos[ben.shi - 1];
  out.push('世爻在' + ben.shi + '爻（' + shiYao.qin + shiYao.zhi + shiYao.wx + '），应爻在' + ben.ying + '爻。世为求测人自身，应为对方、对面之事。');
  if (ben.label === '游魂') out.push('本卦为游魂卦，主心神不定、走动往来、事多反复。');
  if (ben.label === '归魂') out.push('本卦为归魂卦，主回归、收束、事有着落、外出者思归。');
  // 六冲六合卦
  const chongGua = ['乾为天', '坎为水', '艮为山', '震为雷', '巽为风', '离为火', '坤为地', '兑为泽', '天雷无妄', '雷天大壮'];
  const heGua = ['泽水困', '水泽节', '雷地豫', '地雷复', '风山渐', '山风蛊', '火山旅', '山火贲'];
  if (chongGua.indexOf(ben.name) !== -1) out.push('本卦属六冲，主动荡、变化快、聚而复散；久病逢冲不利，谋事逢冲多不成。');
  if (heGua.indexOf(ben.name) !== -1) out.push('本卦属六合，主和顺、缠绵、事易成而慢；病则缠绵难速愈。');
  const nMove = ben.yaos.filter((y) => y.moving).length;
  if (nMove === 0) out.push('六爻安静，事态平稳，以世应、用神旺衰断之。');
  else if (nMove === 1) out.push('独发一爻，此爻为事之关键，最宜细看。');
  else if (nMove >= 4) out.push('乱动之卦，头绪纷杂，宜取用神一门断之，不可眉毛胡子一把抓。');
  if (bian) {
    if (bian.name === ben.name) out.push('变卦与本卦同名，为伏吟之象，主呻吟愁闷、事情原地打转。');
  }
  out.push('日辰为' + p.day.gz + '，月建为' + p.month.gz + '。日辰能冲能合、能生能克，为断卦第一提纲；月建司令一月之权。');
  out.push('旬空为' + p.xunkong.join('、') + '，落空之爻暂时不起作用，须待出空之日方能应事。');
  return out;
}

/* ============ 手动指定卦 ============ */
export function fromLines(lines6, movingIdx, when, question) {
  const tosses = lines6.map((v, i) => {
    const moving = movingIdx.indexOf(i) !== -1;
    return { sum: v ? (moving ? 9 : 7) : (moving ? 6 : 8), coins: [] };
  });
  return paipan(tosses, when, question);
}
