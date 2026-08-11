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

// 各字 Unicode 码点之和（数字环境无法取真笔画，码点求和稳定且可复现，作为「画数」近似）
function sumCodes(s) { let t = 0; for (const ch of s) t += ch.codePointAt(0); return t; }

/** 三、报字起卦：一字以码点为数，多字前后分（取各字码点之和） */
export function byChars(str, date) {
  const s = (str || '').replace(/\s/g, '');
  if (!s) return null;
  const p = date ? fourPillars(date.y, date.m, date.d, date.h, date.mi || 0) : null;
  const hz = date ? hourZhiIndex(date.h) + 1 : 0;
  if (s.length === 1) {
    const code = s.codePointAt(0);
    return make(code, code + hz, code + hz, {
      method: '一字起卦',
      detail: '单字取其码点为上卦，加时数 ' + hz + ' 为下卦。'
    });
  }
  const half = Math.ceil(s.length / 2);
  const upStr = s.slice(0, half), loStr = s.slice(half);
  const up = sumCodes(upStr), lo = sumCodes(loStr);
  return make(up, lo, up + lo + hz, {
    method: '字数起卦',
    detail: '「' + s + '」前 ' + upStr.length + ' 字码点之和 ' + up + ' 为上卦，后 ' + loStr.length + ' 字码点之和 ' + lo + ' 为下卦，两数之和加时数 ' + hz + ' ÷6 取余为动爻。',
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

  // 卦气旺衰（依农历月）
  const lunarMonth = (meta && meta.lunar && meta.lunar.month) || null;
  const tiQi = lunarMonth ? guaQi(tiWx, lunarMonth) : null;
  const yongQi = lunarMonth ? guaQi(yongWx, lunarMonth) : null;

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
    tiQi, yongQi,
    judge: judge(tiKey, yongKey, bianYongKey, huLo, huUp, dongInLower, dong, tiQi, yongQi)
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

function judge(tiKey, yongKey, bianYongKey, huLoKey, huUpKey, dongInLower, dong, tiQi, yongQi) {
  const ti = wxOf(tiKey);
  const r = relation(ti, wxOf(yongKey));
  const rb = relation(ti, wxOf(bianYongKey));
  const rh = relation(ti, wxOf(huLoKey));
  const out = [];
  out.push({ t: '一、谁主谁客', s: '动爻在第' + dong + '爻、在' + (dongInLower ? '下卦' : '上卦') + '，所以' + (dongInLower ? '下卦是"用"、上卦是"体"' : '上卦是"用"、下卦是"体"') + '。一句大白话：体卦' + TRIGRAM[tiKey].name + '（' + ti + '）代表"你、事情的主体"，用卦' + TRIGRAM[yongKey].name + '（' + wxOf(yongKey) + '）代表"你问的那件事"。' });
  out.push({ t: '二、眼下这一关（体用关系）', s: r.t + '：' + r.say });
  if (tiQi) {
    out.push({ t: '三、当下气运（卦气旺衰）', s: '现在是' + tiQi.s + '，体卦' + TRIGRAM[tiKey].name + '属' + ti + '，处在【' + tiQi.v + '】——' + tiQi.t +
      (yongQi ? '用卦' + TRIGRAM[yongKey].name + '属' + wxOf(yongKey) + '，处在【' + yongQi.v + '】。' : '') + '卦气旺，事就来得快、有劲；衰，就来得慢、使不上力。' });
  }
  out.push({ t: (tiQi ? '四' : '三') + '、中间这段（互卦）', s: '互卦是' + TRIGRAM[huLoKey].name + '下' + TRIGRAM[huUpKey].name + '上，管事情进行到一半时的波折。它跟体卦' + rh.t + '，' + rh.say });
  out.push({ t: (tiQi ? '五' : '四') + '、最后落点（变卦）', s: '用卦最后变成' + TRIGRAM[bianYongKey].name + '（' + wxOf(bianYongKey) + '），' + rb.t + '，' + rb.say + '——这就是整件事最终的走向。' });
  out.push({ t: (tiQi ? '六' : '五') + '、快慢（应期）', s: '动爻在' + (dongInLower ? '内卦（初到三爻），事近、应得早' : '外卦（四到上爻），事远、应得迟') + '；再合卦气旺衰：体卦当令则快，失令则慢。远应年、月，近应日、时。' });
  const score = r.good * 2 + rb.good * 2 + rh.good;
  let concl;
  if (score >= 12) concl = '通盘看，你这头强、对方弱，又有生扶，是能成的事。';
  else if (score >= 8) concl = '通盘看，有吉有凶但偏顺，事能成，就是得花力气。';
  else if (score >= 5) concl = '通盘看，付出多、收获少，宜守不宜进，缓一缓转机就来了。';
  else concl = '通盘看，你这头受制又没帮手，阻力大，先停一停、换个法子。';
  out.push({ t: (tiQi ? '七' : '六') + '、总断', s: concl + '梅花这法子，卦是骨架、象是血肉；再把起卦当时看到的、听到的「外应」合进来，才算看全。' });
  return out;
}
// 由体用还原上下卦（judge 内用于应期表述）
function upKeyOfGuess(tiKey, yongKey, dongInLower) { return dongInLower ? tiKey : yongKey; }
function loKeyOfGuess(tiKey, yongKey, dongInLower) { return dongInLower ? yongKey : tiKey; }

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

// 把体用结果与「所问之事」用白话挂钩（无问题时也给出总览）
export function tailor(question, r) {
  const rel = r.rel;
  let s = '';
  if (question) s += '你问的是「' + question + '」。';
  else s += '（没填所问之事，先给个总览；填上问题，解读会更准。）';
  s += '起得本卦' + r.ben.name + '（上' + TRIGRAM[r.ben.upKey].name + '下' + TRIGRAM[r.ben.loKey].name + '），动第' + r.dong + '爻。';
  s += '体卦为' + r.ti.name + '（' + r.ti.wx + '，代表你 / 事情主体），用卦为' + r.yong.name +
    '（' + r.yong.wx + '，代表所占之事）。二者关系为【' + rel.t + '】——' + rel.say;
  if (r.tiQi) s += '卦气上，体卦于' + r.tiQi.s + '为【' + r.tiQi.v + '】' + (r.yongQi ? '，用卦为【' + r.yongQi.v + '】' : '') + '。';
  s += '变卦为' + r.bian.name + '（用卦所变），互卦为' + r.hu.name + '。';
  // 体用五态断语
  if (rel.k === '用生体') s += '用生体，外来生扶、有人有助，事多吉。';
  else if (rel.k === '体克用') s += '体克用，事在掌握、虽费心力终得，为吉。';
  else if (rel.k === '比和') s += '体用比和，彼此帮衬，事多顺遂。';
  else if (rel.k === '体生用') s += '体生用，我去生他、出多入少，谋事多耗。';
  else if (rel.k === '用克体') s += '用克体，事来掣肘、阻力明显，宜守不宜进。';
  s += '再合起卦时的外应（天时、地理、人事、声音、五色等），方为完卦。';
  return s;
}

/* ============ 分类占断（用体之诀） ============ */
// 依《梅花易数》"体用总诀"逐事占断：以体为我/事主，用为所占之事/对方。
const CATE = [
  { key: 'hunyin', name: '婚姻感情', test: /婚|感情|对象|恋爱|妻|夫|姻缘|嫁娶|复合/,
    v: { '体克用': '体克用，婚事可成但稍迟，你方主动有力', '用克体': '用克体，婚姻难成，对方或外力掣肘', '体生用': '体生用，因婚有耗、成之费力或成而反损', '用生体': '用生体，婚事易成，且多得对方资助之财', '比和': '体用比和，婚姻和顺可成' } },
  { key: 'qiuCai', name: '求财', test: /财|钱|赚|收入|生意|经营|投资|买卖|利|薪|报酬/,
    v: { '体克用': '体克用，有财可得，事在掌握', '用克体': '用克体，无财甚至破财', '体生用': '体生用，难成或因财有失', '用生体': '用生体，即得财、财源自来', '比和': '体用比和，利快意、财易聚' } },
  { key: 'jiaoYi', name: '交易', test: /交易|成交|卖|购|买|签单|谈生意/,
    v: { '体克用': '体克用，有财、交易可成', '用克体': '用克体，交易不成', '体生用': '体生用，难成或因交易有失', '用生体': '用生体，即成且必有财', '比和': '体用比和，交易易成' } },
  { key: 'chuXing', name: '出行', test: /出行|出门|旅行|外出|出远门|旅游|搬迁|动身/,
    v: { '体克用': '体克用，可行、所至多得意', '用克体': '用克体，出则有祸', '体生用': '体生用，出行有破耗之失', '用生体': '用生体，有意外之财', '比和': '体用比和，出行顺快' } },
  { key: 'xingRen', name: '行人', test: /行人|人回|归期|他回|何时回|人在外/,
    v: { '体克用': '体克用，行人归迟', '用克体': '用克体，行人不归', '体生用': '体生用，行人未归', '用生体': '用生体，行人即归', '比和': '体用比和，归期不日' } },
  { key: 'shiWu', name: '失物', test: /丢|失|遗失|找不|丢失|被盗|不见/,
    v: { '体克用': '体克用，可寻、迟得', '用克体': '用克体，不可寻', '体生用': '体生用，物难见', '用生体': '用生体，物易寻', '比和': '体用比和，物不失' } },
  { key: 'jiBing', name: '疾病', test: /病|疾|健康|身|症|医|身体|养生|安危/,
    v: { '体克用': '体克用，病易安、勿药有喜', '用克体': '用克体，虽药无功', '体生用': '体生用，病难愈、迁延', '用生体': '用生体，即愈', '比和': '体用比和，疾病易安' } },
  { key: 'guanSong', name: '官讼', test: /讼|官司|诉讼|打官司|纠纷|是非|争|告/,
    v: { '体克用': '体克用，已胜人', '用克体': '用克体，人胜己', '体生用': '体生用，非为失理、或因官有所丧', '用生体': '用生体，不止得理、因讼有所得', '比和': '体用比和，官讼最吉、必有主和' } },
  { key: 'qiuMing', name: '求名', test: /名|晋升|升职|求职|考公|功名|学业|考试|文凭/,
    v: { '体克用': '体克用，得名', '用克体': '用克体，功名不成', '体生用': '体生用，得名费力', '用生体': '用生体，功名即得', '比和': '体用比和，功名可成' } },
  { key: 'qiuMou', name: '求谋', test: /谋|计划|打算|想做|办成|成否|能否/,
    v: { '体克用': '体克用，谋望可成', '用克体': '用克体，谋事不成', '体生用': '体生用，谋事费力、多耗', '用生体': '用生体，谋事易遂', '比和': '体用比和，谋为易得' } }
];
export function pickCate(q) {
  const s = (q || '').replace(/\s/g, '');
  for (const c of CATE) if (c.test.test(s)) return c;
  return null;
}
// 分类占断白话（结合卦气旺衰定应期速迟）
export function categorical(question, r) {
  const c = pickCate(question);
  if (!c) return null;
  const rel = r.rel;
  let s = '这一问归到【' + c.name + '】这一类。体卦是你（' + r.ti.name + '·' + r.ti.wx + '），用卦是这事（' + r.yong.name + '·' + r.yong.wx + '）。';
  s += c.v[rel.k] || '';
  // 卦气旺衰定应期速迟
  if (r.tiQi) {
    if (r.tiQi.v === '旺') s += '而且体卦正当时令、旺，应事快；';
    else if (r.tiQi.v === '相') s += '体卦次旺，事能成但稍慢；';
    else if (r.tiQi.v === '休' || r.tiQi.v === '囚' || r.tiQi.v === '死') s += '体卦失令、气弱，事来得迟、急了难成；';
    else s += '体卦平气，按中道办；';
  }
  // 专科象意
  if (c.key === 'jiBing') {
    const med = { qian: '凉药', dui: '凉药', li: '热药', kan: '冷药', gen: '温补', kun: '温化', zhen: '发散', xun: '疏风' };
    s += '医药取向：体卦是' + r.ti.name + '（属' + r.ti.wx + '），' + (med[r.ti.key] ? '可往「' + med[r.ti.key] + '」的方向考虑' : '随证论治') + '。';
  } else if (c.key === 'chuXing') {
    const xiang = { qian: '宜动、利西北', zhen: '主动、防虚惊', kun: '宜静、利陆路', gen: '宜静、路上或有阻', xun: '宜走水路', li: '宜陆路、防文书麻烦', kan: '防丢东西', dui: '主口舌纷争' };
    s += '出行象意：体卦' + r.ti.name + '，' + (xiang[r.ti.key] || '顺着时令走就稳') + '。';
  }
  return s;
}
