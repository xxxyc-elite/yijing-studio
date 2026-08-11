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
export function tossOnce(rng) {
  rng = rng || Math.random;
  const c = [0, 0, 0].map(() => (rng() < 0.5 ? 2 : 3));
  const sum = c[0] + c[1] + c[2];
  return { coins: c, sum, yang: sum === 7 || sum === 9, moving: sum === 6 || sum === 9 };
}
// 基于字符串种子的可复现伪随机（xmur3 + mulberry32）。同种子必得同序列。
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// 摇六次。传 seed（建议「所问之事@时间」）则结果可复现；不传则随机（兼容旧调用）。
export function tossSix(seed) {
  const rng = seed ? mulberry32(xmur3(seed)()) : Math.random;
  const arr = [];
  for (let i = 0; i < 6; i++) arr.push(tossOnce(rng));
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

// 卦体断语（六冲、六合、游魂归魂、动爻多少）——口语化重写
function summarize(ben, bian, p) {
  const out = [];
  const shiYao = ben.yaos[ben.shi - 1];
  out.push('这一卦里，代表你自己的「世爻」在第' + ben.shi + '爻（' + shiYao.qin + '·' + shiYao.zhi + shiYao.wx + '），代表对方和外部环境的「应爻」在第' + ben.ying + '爻。看事，主要就看这两爻怎么互动。');
  if (ben.label === '游魂') out.push('这是个「游魂卦」，意思是你心里定不下来、事情反复摇摆、总想动来动去。');
  if (ben.label === '归魂') out.push('这是个「归魂卦」，主收束、回落，事情慢慢有着落，出门在外的人也想着回来。');
  // 六冲六合卦
  const chongGua = ['乾为天', '坎为水', '艮为山', '震为雷', '巽为风', '离为火', '坤为地', '兑为泽', '天雷无妄', '雷天大壮'];
  const heGua = ['泽水困', '水泽节', '雷地豫', '地雷复', '风山渐', '山风蛊', '火山旅', '山火贲'];
  if (chongGua.indexOf(ben.name) !== -1) out.push('本卦是「六冲卦」，主变化快、聚了又散；久病遇冲不利，想成的事遇冲多半难成。');
  if (heGua.indexOf(ben.name) !== -1) out.push('本卦是「六合卦」，主和顺缠绵，事情能成但慢；病的话也会拖一阵。');
  const nMove = ben.yaos.filter((y) => y.moving).length;
  if (nMove === 0) out.push('六爻都不动，局面安稳，主要看世应和用神有没有力。');
  else if (nMove === 1) out.push('只有一爻在动，这一爻就是整件事的命门，重点看它。');
  else if (nMove >= 4) out.push('动的爻太多（乱动），头绪乱，别什么都抓，盯住用神一门去断就行。');
  if (bian) {
    if (bian.name === ben.name) out.push('变卦和本卦同名，是「伏吟」，主闷着、原地打转、心里犯愁。');
  }
  out.push('断这一卦有两个大背景：当天的「日辰」' + p.day.gz + '（最能左右一爻强弱，是头号提纲），和当月的「月建」' + p.month.gz + '（管这一个整月的气运）。');
  out.push('这一局的「旬空」（暂时歇着不起作用）是：' + p.xunkong.join('、') + '。落在空里的爻要等出了空（出旬、被填实、或被冲）才发力。');
  return out;
}

/* ============ 用神定向 · 问事白话解读 ============ */
const YONG_LABEL = {
  父母: '父母（文书、学业、长辈、房屋车马）',
  子孙: '子孙（子女、医药、解忧平安）',
  官鬼: '官鬼（工作、功名、病忧、丈夫）',
  妻财: '妻财（钱财、货物、妻子）',
  兄弟: '兄弟（朋友、同辈、竞争）'
};
// 依问题关键词取用神六亲
export function pickYongShen(q) {
  const s = (q || '').replace(/\s/g, '');
  const rules = [
    { qin: '妻财', kw: ['财', '钱', '工资', '收入', '生意', '买卖', '投资', '股票', '经营', '妻子', '老婆', '货', '赚', '利', '薪酬', '报酬'] },
    { qin: '官鬼', kw: ['工作', '事业', '职位', '升职', '求职', '官', '功名', '丈夫', '男朋友', '官司', '诉讼', '贼', '盗', '牢', '疾病', '病', '忧', '麻烦', '考公'] },
    { qin: '父母', kw: ['考试', '学业', '读书', '学习', '文凭', '学历', '文书', '合同', '签约', '证件', '证书', '房产', '房屋', '房子', '车', '买房', '长辈', '父母', '老师', '消息', '书信', '邮件', '签证', '车票', '论文'] },
    { qin: '子孙', kw: ['孩子', '子女', '儿', '女', '怀孕', '生育', '医药', '医生', '宠物', '解忧', '平安', '佛', '求子', '健康', '养生'] },
    { qin: '兄弟', kw: ['朋友', '兄弟', '姐妹', '同学', '同事', '合伙', '竞争', '借贷', '分手'] }
  ];
  for (const r of rules) if (r.kw.some(k => s.indexOf(k) !== -1)) return { qin: r.qin, label: YONG_LABEL[r.qin] };
  return null;
}

// 五行生克关系（fromWx 对 toWx）
function wxRel(fromWx, toWx) {
  if (fromWx === toWx) return { k: '比和', say: '比和相助，彼此帮衬' };
  if (SHENG[fromWx] === toWx) return { k: '我生', say: '我去生扶对方，主付出、费力气' };
  if (SHENG[toWx] === fromWx) return { k: '生我', say: '对方来生我，主有人相助、事易成' };
  if (KE[fromWx] === toWx) return { k: '我克', say: '我能制约对方，事在掌握但须用力' };
  if (KE[toWx] === fromWx) return { k: '克我', say: '对方来克我，主受阻、有压力' };
  return { k: '', say: '' };
}

// 进神退神：动爻化出之爻与本爻同五行，地支顺行者为进神，逆行者退神
const ZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
function jinTui(fromZhi, toZhi) {
  const a = ZHI_ORDER.indexOf(fromZhi), b = ZHI_ORDER.indexOf(toZhi);
  if (a < 0 || b < 0 || ZHI_WX[a] !== ZHI_WX[b]) return '';
  const fwd = (b - a + 12) % 12, back = (a - b + 12) % 12;
  if (fwd > 0 && fwd < back) return '进神';
  if (back > 0 && back < fwd) return '退神';
  return '';
}
// 五行生克逆映射：SHENG_INV[x]=能生x者（原神），KE_INV[x]=能克x者（忌神）
const SHENG_INV = { 金: '土', 木: '水', 水: '金', 火: '木', 土: '火' };
const KE_INV = { 金: '火', 木: '金', 水: '土', 火: '水', 土: '木' };

// 五行墓库：金墓丑、木墓未、水墓辰、火墓戌、土墓辰
const MU = { 金: '丑', 木: '未', 水: '辰', 火: '戌', 土: '辰' };
export function muZhi(wx) { return MU[wx] || ''; }

// 日辰（占卦当日地支）对一爻的作用：生扶/克伤/比扶、暗动、日破、冲空则实
function dayEffect(yao, dayZhi) {
  const dWX = ZHI_WX[ZHI.indexOf(dayZhi)];
  const e = { sheng: false, ke: false, bi: false, anDong: false, riPo: false, chongKong: false };
  if (SHENG[dWX] === yao.wx) e.sheng = true;          // 日辰生爻
  else if (KE[dWX] === yao.wx) e.ke = true;           // 日辰克爻
  else if (dWX === yao.wx) e.bi = true;               // 日辰比扶（临日建）
  if (chongZhi(dayZhi) === yao.zhi) {                 // 日辰冲爻
    if (yao.kong) e.chongKong = true;                 // 旬空逢冲 → 冲空则实
    else if (!yao.moving) {
      const yueWang = (yao.wang === '旺' || yao.wang === '相');
      if (yueWang) e.anDong = true;                    // 旺相静爻被日冲 → 暗动
      else e.riPo = true;                              // 休囚静爻被日冲 → 日破
    }
  }
  return e;
}

// 动爻化出之爻（变爻）对原爻（用神）之关系：回头生/克/泄/耗/比
export function huiTouShen(origWx, bianWx) {
  if (!bianWx) return '';
  if (origWx === bianWx) return '比和';
  if (SHENG[bianWx] === origWx) return '回头生';
  if (KE[bianWx] === origWx) return '回头克';
  if (SHENG[origWx] === bianWx) return '回头泄';
  if (KE[origWx] === bianWx) return '回头耗';
  return '';
}

// 反吟：本卦与变卦六爻阴阳全反（如乾之坤、泰之否），主反复颠倒、事多不宁
function isFanYin(benLines, bianLines) {
  if (!bianLines) return false;
  for (let i = 0; i < 6; i++) if (benLines[i] === bianLines[i]) return false;
  return true;
}

// 应期法则：综合用神状态给出「何时应验」的多条候选（远应年月、近应日时）——口语化重写
function yingQi(ysQin, yong, res) {
  const out = [];
  const yWX = yong.wx;
  const dZhi = res.when.day.zhi;
  // 1) 用神旺相而静 → 待冲动/值日
  if ((yong.wang === '旺' || yong.wang === '相' || yong.byDay === '比助') && !yong.moving) {
    out.push('用神有劲又不动，吉凶应得慢——远则等到年、月，近则等到日、时；等它被冲动、或等' + yWX + '当值的那天/那月，就差不多到时候了。');
  }
  // 2) 与日辰相合 → 合待冲
  if (yong.heDay) out.push('用神跟日辰（' + res.when.day.gz + '）合住了，要等把合神冲开（' + chongZhi(dZhi) + '）的那天/那月才应。');
  // 3) 逢日辰冲（静爻）→ 冲待合
  if (yong.chongDay && !yong.moving) out.push('用神被日辰冲，要等合住冲神（' + LIUHE[dZhi] + '）的那天/那月才稳下来。');
  // 4) 旬空 → 出空
  if (yong.kong) out.push('用神在旬空（' + res.kong.join('、') + '），得等"出空"——出旬、被填实、或被冲空——才应事。');
  // 5) 月破 → 出月/填实/逢合
  if (yong.poMonth) out.push('用神逢月破（被月建冲的' + yong.zhi + '），眼下不成；等出月、等' + yong.zhi + '值日（填实）、或等合住它的那天，才有望转机。');
  // 6) 休囚无气 → 待生旺
  if (yong.wang === '休' || yong.wang === '囚' || yong.wang === '死') {
    out.push('用神没力气，得等它被生旺——等长生、帝旺、或旺相的月日（生扶' + yWX + '的五行当值）才起得来。');
  }
  // 7) 受动爻忌神克 → 制杀之期（制杀 = 能克住忌神之五行）
  const jiDong = res.ben.yaos.filter(y => y.moving && y.qin !== ysQin && KE[y.wx] === yWX);
  if (jiDong.length) {
    const zhiSha = [...new Set(jiDong.map(y => KE_INV[y.wx]))];
    out.push('用神被动爻忌神（' + jiDong.map(y => y.zhi).join('、') + '）克着，要等"制杀"的时机——也就是能克住那忌神的五行（' + zhiSha.join('、') + '）当值那天/那月，才解得开。');
  }
  // 8) 伏藏 → 引拔出现
  if (yong.fu) out.push('用神还伏着没显，等伏神所临那支值日、或冲开压它的飞神那天，用神才出来应事。');
  if (!out.length) out.push('用神中正得位，时机多在它值日、值月，或动爻/变爻所临地支当值之时（"远应年月，近应日时"）。');
  return out;
}

// 用神取法（书中次序）：世爻持用 > 动爻用神 > 临日月用神 > 静爻用神 > 伏神
function pickYongYao(ben, qin) {
  const cands = ben.yaos.filter(y => y.qin === qin);
  if (!cands.length) return null;
  let y = cands.find(c => c.shi);                       // 1) 持世
  if (!y) y = cands.find(c => c.moving);               // 2) 发动
  if (!y) y = cands.find(c => c.byMonth === '比助' || c.byDay === '比助'); // 3) 临日月
  if (!y) y = cands.find(c => c.wang === '旺' || c.wang === '相') || cands[0]; // 4) 旺相/静爻
  return y;
}

// 依据问题解读本卦（白话，按六爻书规：取用→原神忌神→旺衰旬空月破→世用生克→进神退神→综合）
export function interpret(question, res) {
  const ys = pickYongShen(question);
  const lines = [];
  if (!ys) {
    lines.push('没识别到明确的"用神"。你在「所问之事」里带上 财 / 工作 / 考试 / 子女 / 朋友 这类词，系统就能自动锁定用神，给你定向解读。');
    return { yong: null, lines };
  }
  const ben = res.ben;
  let yong = pickYongYao(ben, ys.qin);
  const shi = ben.yaos[ben.shi - 1];
  const dayGz = res.when.day.gz, monthGz = res.when.month.gz;
  lines.push('你问的是「' + question + '」，系统把【' + ys.label + '】定为"用神"——也就是你问的那件事本身；以第' + ben.shi + '爻的世爻代表"你（求测人）"。下面就是拿你这爻和用神爻来比。');

  // 用神伏藏
  if (!yong) {
    let fuYao = null;
    for (const y of ben.yaos) if (y.fu && y.fu.qin === ys.qin) { fuYao = y; break; }
    if (fuYao) {
      lines.push('这个用神没直接出现在卦面上，它"伏"在第' + fuYao.pos + '爻底下（伏神：' + fuYao.fu.zhi + fuYao.fu.wx + '）。伏着的意思是事还藏着没显，要等冲、合、或它值日那个时机被引出来才动。');
      yong = { qin: ys.qin, wx: fuYao.fu.wx, zhi: fuYao.fu.zhi, pos: fuYao.pos, fu: fuYao.fu, wang: '平', kong: false, poMonth: false, moving: false, byMonth: '', byDay: '' };
    } else {
      lines.push('用神【' + ys.qin + '】既不上卦也无伏神，说明这件事在卦里没显现，或者你问的角度偏了，换个问法再占更准。');
      lines.push('【白话总断】用神不现，局面不明，别急着动，先静观其变。');
      return { yong: ys, lines };
    }
  }

  const posTxt = yong.pos + '爻' + (yong.shi ? '（世爻）' : yong.ying ? '（应爻）' : '') + (yong.fu ? '（伏神）' : '');
  lines.push('用神在第' + posTxt + '，五行属' + yong.wx + '，目前是【' + (yong.wang || '平') + '】——旺相就是有劲、好使；休囚死就是没力气。');
  if (yong.moving) {
    lines.push('用神是动爻，说明这事变化快、信号强，重点看它变出去那一爻。');
    if (yong.bian) {
      const jt = jinTui(yong.zhi, yong.bian.zhi);
      if (jt) lines.push('它化出【' + jt + '】（变作' + yong.bian.zhi + yong.bian.wx + '）：进神是越变越好、往前走；退神是往回缩、势头退。');
      const ht = huiTouShen(yong.wx, yong.bian.wx);
      if (ht && ht !== '比和') lines.push('变爻回过头来【' + ht + '】它（变作' + yong.bian.zhi + yong.bian.wx + '）：回头生是越变越旺，回头克是成了反被它拖累，回头泄是你要付出，回头耗是你要损耗。');
      else if (!jt) lines.push('它化出' + yong.bian.zhi + yong.bian.wx + '（比和），平平稳稳转、没大起落。');
    }
  }
  if (yong.kong) lines.push('用神落在"旬空"（' + res.kong.join('、') + '），等于暂时歇着没发力，要等出空（被冲、被填实）才应事。');
  if (yong.poMonth) lines.push('用神"逢月破"（被月建冲），气散了使不上劲，想成的事多半难成，宜缓一缓或换路子。');
  if (yong.fu) lines.push('用神是伏神，得等被引拔（冲、合、值日）才显出力量。');

  // 世用生克
  const r = wxRel(shi.wx, yong.wx);
  lines.push('你（世爻·' + shi.wx + '）和这事（用神·' + yong.wx + '）的关系是【' + (r.k || '不类') + '】——' + (r.say || '') + '。');

  // 原神 / 忌神
  const yuanWx = SHENG_INV[yong.wx];
  const jiWx = KE_INV[yong.wx];
  const yuanYaos = ben.yaos.filter(y => y.wx === yuanWx && y.qin !== ys.qin);
  const jiYaos = ben.yaos.filter(y => y.wx === jiWx && y.qin !== ys.qin);
  const yuanDong = yuanYaos.find(y => y.moving);
  const jiDong = jiYaos.find(y => y.moving);
  if (yuanYaos.length) {
    const w = yuanYaos.map(y => y.wang).join('、');
    lines.push('生用神的"原神"（属' + yuanWx + '）在第' + yuanYaos.map(y => y.pos + '爻').join('、') + '，' + (w || '平') +
      (yuanDong ? '，而且原神在动、主动来生助用神，是吉上加吉' : '。原神有气，用神就有源头，不算孤。'));
  } else {
    lines.push('卦里没有明显来生用神的"原神"，用神少了一层外力帮衬，成事更靠你自己发力或等时机。');
  }
  if (jiYaos.length) {
    const w = jiYaos.map(y => y.wang).join('、');
    lines.push('克用神的"忌神"（属' + jiWx + '）在第' + jiYaos.map(y => y.pos + '爻').join('、') + '，' + (w || '平') +
      (jiDong ? '，而且忌神在动、主动来克害用神，要提防阻碍、最好先化解' : '。忌神要是被制住，凶也成不了气候。'));
  } else {
    lines.push('卦里没有明摆着的忌神来克用神，外头的干扰不多。');
  }

  // 日辰旺衰（断卦第一提纲）
  const de = dayEffect(yong, res.when.day.zhi);
  if (de.bi) lines.push('用神"临日辰"（' + dayGz + '），就像正当正午的太阳，最旺最有劲，这事多半能倚仗。');
  else if (de.sheng) lines.push('当天的"日辰"（' + dayGz + '）在生扶用神，像旱天降甘霖，化险为夷、有人帮一把。');
  else if (de.ke) lines.push('"日辰"（' + dayGz + '）在克用神，雪上加霜，要防外面有人压你。');
  if (de.anDong) lines.push('用神被日辰冲起，是"暗动"——静里生动，忽然有苗头，反而借上力。');
  if (de.riPo) lines.push('用神本来就没力气、又被日辰冲破，叫"日破"，这爻破了没用，谋事难成。');
  if (de.chongKong) lines.push('用神空着、又被日辰冲，是"冲空则实"，一出空就发动、事能起来。');

  // 入墓
  if (muZhi(yong.wx) && yong.zhi === muZhi(yong.wx)) {
    lines.push('用神"入墓"（' + yong.zhi + '，是' + yong.wx + '的墓库），事被捂住了，要等冲墓、出墓那天才显力。');
  }

  // 反吟
  if (isFanYin(res.ben.lines, res.bian ? res.bian.lines : null)) {
    lines.push('本卦和变卦六爻全反过来，是"反吟"，主反复颠倒、进两步退一步、心里不踏实。');
  }

  // 提纲
  lines.push('两个大背景先记牢：当天"日辰"' + dayGz + '（最能左右一爻强弱，断卦的头号提纲）和当月"月建"' + monthGz + '（管整月气运）。它俩生扶用神，事就容易成；克伤用神，事就卡。');

  // 综合判断（书规）
  const yWang = (yong.wang === '旺' || yong.wang === '相');
  const yYou = (yong.wang === '休' || yong.wang === '囚' || yong.wang === '死');
  const yBad = yong.kong || yong.poMonth;
  const rel = r.k;
  let tone;
  if (yBad) tone = '凶';
  else if (yYou && (rel === '克我' || rel === '我生')) tone = '凶';
  else if (jiDong && !yuanDong) tone = '凶';
  else if (yWang && (rel === '生我' || rel === '比和' || rel === '我克')) tone = '吉';
  else if (rel === '生我') tone = '吉';
  else if (rel === '克我') tone = '凶';
  else if (rel === '我生') tone = '平';
  else if (rel === '我克') tone = '平偏吉';
  else tone = '平';

  let concl;
  if (tone === '吉') concl = '综合看，用神得令、跟你（世爻）相生或比和，原神有气、忌神没张狂，这事能成，放胆去抓。';
  else if (tone === '平偏吉') concl = '综合看，用神不算弱，你得出点力（我克是拿得住、比和是稳），事能成但不轻松，稳着推就行。';
  else if (tone === '平') concl = '综合看，用神不软不硬，得你花心思（世生用神是你在付出），成不成看人谋，踏实干。';
  else concl = '综合看，用神受制、落空或破、或遭忌神动克，阻力不小，宜守不宜攻，等出空、过月、原神得力时再动。';
  lines.push('【白话总断】' + concl);

  // 应期（何时应验）——算卦先生必给
  lines.push('【应期推断】' + yingQi(ys.qin, yong, res).join(''));
  return { yong: ys, lines };
}
export function fromLines(lines6, movingIdx, when, question) {
  const tosses = lines6.map((v, i) => {
    const moving = movingIdx.indexOf(i) !== -1;
    return { sum: v ? (moving ? 9 : 7) : (moving ? 6 : 8), coins: [] };
  });
  return paipan(tosses, when, question);
}
