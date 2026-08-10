// meihua.js —— 梅花易数引擎
// 先天八卦数起卦 / 体用互变 / 五行生克断 / 外应三要
// 体例本《梅花易数》「体用总诀」「八卦万物类占」，并参贾双萍《梅花易数预测学》的现代整理。

import { TRIGRAM, HEX } from './data.js';
import { ZHI, lunarDate, fourPillars, hourZhiIndex } from './calendar.js';

// 先天八卦数：乾一 兑二 离三 震四 巽五 坎六 艮七 坤八
export const XIANTIAN = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];
export function numToTri(n) {
  let i = ((n % 8) + 8) % 8;
  if (i === 0) i = 8;
  return XIANTIAN[i - 1];
}
export function triToNum(key) { return XIANTIAN.indexOf(key) + 1; }

const SHENG = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' };
const KE = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' };
export function wxOf(key) { return TRIGRAM[key].images.wuxing; }

// 卦气旺衰（以四季论）
const SEASON = [
  { m: [1, 2], wang: '木', xiang: '火', xiu: '水', qiu: '金', si: '土', name: '春' },
  { m: [4, 5], wang: '火', xiang: '土', xiu: '木', qiu: '水', si: '金', name: '夏' },
  { m: [7, 8], wang: '金', xiang: '水', xiu: '土', qiu: '火', si: '木', name: '秋' },
  { m: [10, 11], wang: '水', xiang: '木', xiu: '金', qiu: '土', si: '火', name: '冬' },
  { m: [3, 6, 9, 12], wang: '土', xiang: '金', xiu: '火', qiu: '木', si: '水', name: '四季月' }
];
export function guaQi(wx, lunarMonth) {
  const s = SEASON.find((x) => x.m.indexOf(lunarMonth) !== -1) || SEASON[4];
  if (wx === s.wang) return { s: s.name, v: '旺', t: '当令得时，力量最足' };
  if (wx === s.xiang) return { s: s.name, v: '相', t: '受生而次旺，尚有余力' };
  if (wx === s.xiu) return { s: s.name, v: '休', t: '生令而泄，力已渐衰' };
  if (wx === s.qiu) return { s: s.name, v: '囚', t: '克令而受制，力弱' };
  return { s: s.name, v: '死', t: '被令所克，最无力' };
}

/* ============ 起卦 ============ */
// 通用：给上下卦数与动爻数
function make(upNum, loNum, dongNum, meta) {
  const up = numToTri(upNum), lo = numToTri(loNum);
  let dong = ((dongNum % 6) + 6) % 6;
  if (dong === 0) dong = 6;
  return analyze(lo, up, dong, meta);
}

/** 一、年月日时起卦（农历） */
export function byTime(date) {
  const l = lunarDate(date.y, date.m, date.d);
  const p = fourPillars(date.y, date.m, date.d, date.h, date.mi || 0);
  const yz = ZHI.indexOf(p.year.zhi) + 1;       // 年支序数
  const hz = hourZhiIndex(date.h) + 1;          // 时支序数
  const s1 = yz + l.month + l.day;
  const s2 = s1 + hz;
  return make(s1, s2, s2, {
    method: '年月日时起卦',
    detail: '农历' + l.year + '年' + l.monthName + l.dayName + '，' + p.hour.zhi + '时。'
      + '年支' + p.year.zhi + '为' + yz + '，月' + l.month + '，日' + l.day + '，时' + p.hour.zhi + '为' + hz + '。'
      + '（' + yz + '+' + l.month + '+' + l.day + '）=' + s1 + '，÷8 余数为上卦；'
      + '再加时数 ' + hz + ' 得 ' + s2 + '，÷8 余数为下卦；' + s2 + ' ÷6 取余为动爻。',
    lunar: l, pillars: p
  });
}

/** 二、数字起卦：一个数 → 平分；两个数 → 前上后下 */
export function byNumbers(nums) {
  const a = nums.filter((n) => Number.isFinite(n));
  if (a.length === 1) {
    const s = String(Math.abs(Math.trunc(a[0])));
    const half = Math.ceil(s.length / 2);
    const up = Number(s.slice(0, half)) || 1;
    const lo = Number(s.slice(half)) || up;
    return make(up, lo, up + lo, {
      method: '单数起卦',
      detail: '数 ' + s + ' 折为前 ' + up + '、后 ' + lo + '，前为上卦、后为下卦，两数相加 ÷6 取余为动爻。'
    });
  }
  const up = a[0], lo = a[1];
  return make(up, lo, up + lo, {
    method: '双数起卦',
    detail: '上卦取 ' + up + ' ÷8 余数，下卦取 ' + lo + ' ÷8 余数，两数之和 ' + (up + lo) + ' ÷6 取余为动爻。'
  });
}

/** 三、报字起卦：一字以笔画/字数分，两字前后分 */
export function byChars(str, date) {
  const s = (str || '').replace(/\s/g, '');
  if (!s) return null;
  const p = date ? fourPillars(date.y, date.m, date.d, date.h, date.mi || 0) : null;
  const hz = date ? hourZhiIndex(date.h) + 1 : 0;
  if (s.length === 1) {
    // 单字：以 Unicode 笔画近似不可得，改用「字数 + 时」的通行变体
    const code = s.charCodeAt(0) % 100;
    return make(code, code + hz, code + hz, {
      method: '一字起卦',
      detail: '单字取其数为上卦，加时数 ' + hz + ' 为下卦。'
    });
  }
  const half = Math.ceil(s.length / 2);
  const up = s.slice(0, half).length;
  const lo = s.slice(half).length;
  return make(up, lo, up + lo + hz, {
    method: '字数起卦',
    detail: '「' + s + '」共 ' + s.length + ' 字，前 ' + up + ' 字为上卦，后 ' + lo + ' 字为下卦，字数之和加时数 ' + hz + ' ÷6 取余为动爻。',
    pillars: p
  });
}

/** 四、随机起卦（心动则占） */
export function byRandom() {
  const up = 1 + Math.floor(Math.random() * 8);
  const lo = 1 + Math.floor(Math.random() * 8);
  const d = 1 + Math.floor(Math.random() * 6);
  return make(up, lo, d, { method: '心动起卦', detail: '意念所至，随机取上卦、下卦与动爻。' });
}

/* ============ 断卦 ============ */
export function hexOf(loKey, upKey) {
  return HEX.find((h) => h.lo === loKey && h.up === upKey) || null;
}
function linesOf(loKey, upKey) {
  return TRIGRAM[loKey].lines.concat(TRIGRAM[upKey].lines);
}
function keyOfLines(l3) {
  for (const k of Object.keys(TRIGRAM)) {
    const t = TRIGRAM[k].lines;
    if (t[0] === l3[0] && t[1] === l3[1] && t[2] === l3[2]) return k;
  }
  return null;
}

export function analyze(loKey, upKey, dong, meta) {
  const lines = linesOf(loKey, upKey);
  const ben = hexOf(loKey, upKey);

  // 互卦：取二三四为下互，三四五为上互
  const huLo = keyOfLines([lines[1], lines[2], lines[3]]);
  const huUp = keyOfLines([lines[2], lines[3], lines[4]]);
  const hu = hexOf(huLo, huUp);

  // 变卦：动爻反转
  const bl = lines.slice();
  bl[dong - 1] = bl[dong - 1] ? 0 : 1;
  const bianLo = keyOfLines(bl.slice(0, 3)), bianUp = keyOfLines(bl.slice(3, 6));
  const bian = hexOf(bianLo, bianUp);

  // 体用：动爻所在之卦为「用」，另一卦为「体」
  const dongInLower = dong <= 3;
  const tiKey = dongInLower ? upKey : loKey;
  const yongKey = dongInLower ? loKey : upKey;
  // 变卦中「用」的那一半也随之变
  const bianYongKey = dongInLower ? bianLo : bianUp;

  const tiWx = wxOf(tiKey), yongWx = wxOf(yongKey);
  const rel = relation(tiWx, yongWx);

  return {
    meta: meta || {},
    dong,
    lines,
    ben: { ...ben, loKey, upKey },
    hu: { ...hu, loKey: huLo, upKey: huUp },
    bian: { ...bian, loKey: bianLo, upKey: bianUp },
    ti: { key: tiKey, name: TRIGRAM[tiKey].name, wx: tiWx, pos: dongInLower ? '上卦' : '下卦' },
    yong: { key: yongKey, name: TRIGRAM[yongKey].name, wx: yongWx, pos: dongInLower ? '下卦' : '上卦' },
    bianYong: { key: bianYongKey, name: TRIGRAM[bianYongKey].name, wx: wxOf(bianYongKey) },
    huTi: { key: huLo, name: TRIGRAM[huLo].name, wx: wxOf(huLo) },
    huYong: { key: huUp, name: TRIGRAM[huUp].name, wx: wxOf(huUp) },
    rel,
    judge: judge(tiKey, yongKey, bianYongKey, huLo, huUp, dongInLower)
  };
}

export function relation(tiWx, yongWx) {
  if (tiWx === yongWx) return { k: '比和', t: '体用比和', good: 2, say: '体用同气，彼此帮衬，百事顺遂。' };
  if (SHENG[yongWx] === tiWx) return { k: '用生体', t: '用生体', good: 3, say: '外来之力生我，有人相助、有物可得，其事大吉。' };
  if (KE[tiWx] === yongWx) return { k: '体克用', t: '体克用', good: 2, say: '我能制彼，事在掌握，虽费手脚而终得，为吉。' };
  if (SHENG[tiWx] === yongWx) return { k: '体生用', t: '体生用', good: 1, say: '我去生他，是耗费泄气之象，出多入少，谋事多劳。' };
  if (KE[yongWx] === tiWx) return { k: '用克体', t: '用克体', good: 0, say: '彼来制我，事有阻碍、有人掣肘，凡谋皆不利，宜退守。' };
  return { k: '', t: '', good: 1, say: '' };
}

function judge(tiKey, yongKey, bianYongKey, huLoKey, huUpKey, dongInLower) {
  const ti = wxOf(tiKey);
  const r = relation(ti, wxOf(yongKey));
  const rb = relation(ti, wxOf(bianYongKey));
  const rh = relation(ti, wxOf(huLoKey));
  const out = [];
  out.push({ t: '一、体用定主客', s: '动爻在' + (dongInLower ? '下卦' : '上卦') + '，故' + (dongInLower ? '下' : '上') + '为用、' + (dongInLower ? '上' : '下') + '为体。体卦' + TRIGRAM[tiKey].name + '（' + ti + '）为我、为事情主体；用卦' + TRIGRAM[yongKey].name + '（' + wxOf(yongKey) + '）为他、为所占之事。' });
  out.push({ t: '二、看眼下', s: r.t + '：' + r.say });
  out.push({ t: '三、看过程（互卦）', s: '互卦为' + TRIGRAM[huLoKey].name + '下' + TRIGRAM[huUpKey].name + '上，主事情中间一段的曲折。互卦与体' + rh.t.replace('体', '') + '，' + rh.say.replace('其事大吉', '中途有助').replace('为吉', '中途可控') });
  out.push({ t: '四、看结果（变卦）', s: '用卦变为' + TRIGRAM[bianYongKey].name + '（' + wxOf(bianYongKey) + '），' + rb.t + '，' + rb.say + '此为事情最终的落点。' });
  const score = r.good * 2 + rb.good * 2 + rh.good;
  let concl;
  if (score >= 12) concl = '通盘看，体强用弱、生扶有力，是成事之象。';
  else if (score >= 8) concl = '通盘看，吉凶参半而偏顺，事可成但须用力。';
  else if (score >= 5) concl = '通盘看，耗多得少，宜守不宜进，缓则有转机。';
  else concl = '通盘看，体受制而无援，此事阻力大，宜暂停另图。';
  out.push({ t: '五、总断', s: concl + '梅花之法，卦为骨、象为肉；再合当时所见所闻的「外应」，方为完卦。' });
  return out;
}

/* ============ 三要十应（外应） ============ */
export const WAIYING = [
  { k: '天时', v: '晴、雨、雷、风、云、雾——晴主事明，雨主阻滞，雷主惊动，风主变迁。' },
  { k: '地理', v: '所在之地高下、方位、洁秽——高明处主事显，卑湿处主事晦。' },
  { k: '人事', v: '起卦时在场的人、其言语神色——老者主事久，少者主事新，笑语主吉，愁容主忧。' },
  { k: '时令', v: '当时节气与卦气旺衰相参，旺则事速，衰则事迟。' },
  { k: '方卦', v: '来人所自之方位与卦相合则应速，相冲则事变。' },
  { k: '动静', v: '静中忽动、动中忽静，皆为事之征兆。' },
  { k: '言语', v: '偶闻一语，多与所占相关，古谓「谶语」。' },
  { k: '五色', v: '眼前所见之色：青主生发，赤主口舌，白主孝服，黑主暗昧，黄主中和。' },
  { k: '写文', v: '来人所书之字、所持之物，取其数与象。' },
  { k: '声音', v: '所闻声之远近、清浊，清亮主吉，嘶哑主滞。' }
];

// 把体用结果与「所问之事」用白话挂钩
export function tailor(question, r) {
  if (!question) return '';
  const rel = r.rel;
  return '你问的是「' + question + '」。起得本卦' + r.ben.name + '：体卦为' + r.ti.name + '（' + r.ti.wx + '，代表你 / 事情主体），用卦为' + r.yong.name + '（' + r.yong.wx + '，代表所占之事）。二者关系为【' + rel.t + '】——' + rel.say + ' 再合互卦、变卦与起卦时的外应，可推知此事吉凶走向。';
}
