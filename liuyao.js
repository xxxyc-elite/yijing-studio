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
    lines.push('未识别到明确用神。可在「所问之事」里写明 财 / 工作 / 考试 / 子女 / 朋友 等关键词，系统会自动取用神并定向解读。');
    return { yong: null, lines };
  }
  const ben = res.ben;
  let yong = pickYongYao(ben, ys.qin);
  const shi = ben.yaos[ben.shi - 1];
  const dayGz = res.when.day.gz, monthGz = res.when.month.gz;
  lines.push('你问的是「' + question + '」，取【' + ys.label + '】为用神（所占之事的核心），以世爻（第' + ben.shi + '爻）为"我/求测人"。');

  // 用神伏藏
  if (!yong) {
    // 查伏神
    let fuYao = null;
    for (const y of ben.yaos) if (y.fu && y.fu.qin === ys.qin) { fuYao = y; break; }
    if (fuYao) {
      lines.push('用神【' + ys.qin + '】不上本卦，伏于' + fuYao.pos + '爻之下（伏神：' + fuYao.fu.zhi + fuYao.fu.wx + '）。伏神待"冲合"或' +
        '值日方显，所问之事目前潜藏未发，须待时机或外力引动。');
      yong = { qin: ys.qin, wx: fuYao.fu.wx, zhi: fuYao.fu.zhi, pos: fuYao.pos, fu: fuYao.fu, wang: '平', kong: false, poMonth: false, moving: false, byMonth: '', byDay: '' };
    } else {
      lines.push('用神【' + ys.qin + '】不上卦亦无伏神，事体不显，或所问非此，宜换个角度再占。');
      lines.push('【白话总断】用神不现，事机未明，不宜妄动，静观其变为上。');
      return { yong: ys, lines };
    }
  }

  const posTxt = yong.pos + '爻' + (yong.shi ? '（世爻）' : yong.ying ? '（应爻）' : '') + (yong.fu ? '（伏神）' : '');
  lines.push('用神在' + posTxt + '，五行属' + yong.wx + '，' + (yong.wang || '平') + '（按月令论旺衰：旺相有气、休囚死无力）。');
  if (yong.moving) {
    lines.push('用神发动（为动爻），其事变化快、征兆明显，须重点看它变出之爻。');
    if (yong.bian) {
      const jt = jinTui(yong.zhi, yong.bian.zhi);
      if (jt) lines.push('用神化【' + jt + '】（化出' + yong.bian.zhi + yong.bian.wx + '）：进神主事渐向前成、退神主事退缩消退。');
      else lines.push('用神化出' + yong.bian.zhi + yong.bian.wx + '（异五行），为回头生/克/泄/耗，须看所化之爻对用神利弊。');
    }
  }
  if (yong.kong) lines.push('用神落旬空（' + res.kong.join('、') + '），暂时不起作用，须待出空（冲空、填实之日）方能应事。');
  if (yong.poMonth) lines.push('用神逢月破（冲月建之支），气散无力，所谋多难成，宜缓图或另谋。');
  if (yong.fu) lines.push('用神为伏神，须待引拔（冲、合、值日）方显其力。');

  // 世用生克
  const r = wxRel(shi.wx, yong.wx);
  lines.push('世爻属' + shi.wx + '，与用神关系为【' + (r.k || '不类') + '】——' + (r.say || '') + '。');

  // 原神 / 忌神
  const yuanWx = SHENG_INV[yong.wx];   // 生用神者（原神）
  const jiWx = KE_INV[yong.wx];        // 克用神者（忌神）
  const yuanYaos = ben.yaos.filter(y => y.wx === yuanWx && y.qin !== ys.qin);
  const jiYaos = ben.yaos.filter(y => y.wx === jiWx && y.qin !== ys.qin);
  const yuanDong = yuanYaos.find(y => y.moving);
  const jiDong = jiYaos.find(y => y.moving);
  if (yuanYaos.length) {
    const w = yuanYaos.map(y => y.wang).join('、');
    lines.push('原神（生用神的' + yuanWx + '）在' + yuanYaos.map(y => y.pos + '爻').join('、') + '，' + (w || '平') +
      (yuanDong ? '，且原神发动来生助用神，吉上加吉' : '。原神有力则用神有源。'));
  }
  if (jiYaos.length) {
    const w = jiYaos.map(y => y.wang).join('、');
    lines.push('忌神（克用神的' + jiWx + '）在' + jiYaos.map(y => y.pos + '爻').join('、') + '，' + (w || '平') +
      (jiDong ? '，且忌神发动来克害用神，须防阻碍、宜化解' : '。忌神受制则凶不成。'));
  } else {
    lines.push('卦中无明现忌神克用，外扰较少。');
  }

  // 日辰月建提纲
  lines.push('提纲：日辰' + dayGz + '（能冲能合、能生能克，断卦第一枢纽）、月建' + monthGz +
    '（司令一月之权）。二者生扶用神则事成，克伤用神则事阻。');

  // 综合判断（书规）
  const yWang = (yong.wang === '旺' || yong.wang === '相');
  const yYou = (yong.wang === '休' || yong.wang === '囚' || yong.wang === '死');
  const yBad = yong.kong || yong.poMonth;
  const rel = r.k;
  // 世用基本吉凶
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
  if (tone === '吉') concl = '综合看，用神得令、与世爻相生或相比，原神有气而忌神不张，此事可成，宜积极把握。';
  else if (tone === '平偏吉') concl = '综合看，用神中和、你须主动用力（我克为得、比和主稳），事可成但非唾手，稳步推进即可。';
  else if (tone === '平') concl = '综合看，用神不弱不强，需你付出心力（世生用神主耗），成败在人谋，踏实为之。';
  else concl = '综合看，用神受制、落空破或遭忌神动克，此事阻力较大，宜守不宜进，或待出空、过月、原神得力之时再图。';
  lines.push('【白话总断】' + concl);
  return { yong: ys, lines };
}
export function fromLines(lines6, movingIdx, when, question) {
  const tosses = lines6.map((v, i) => {
    const moving = movingIdx.indexOf(i) !== -1;
    return { sum: v ? (moving ? 9 : 7) : (moving ? 6 : 8), coins: [] };
  });
  return paipan(tosses, when, question);
}
