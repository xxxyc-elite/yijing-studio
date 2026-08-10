// calendar.js —— 干支历法引擎：儒略日 / 二十四节气 / 四柱 / 旬空
// 节气用太阳视黄经天文算法求解（精度约 1 分钟，足够定节令）。时区固定东八区。

export const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行 / 阴阳
export const GAN_WX = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
export const ZHI_WX = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
export const ZHI_ANIMAL = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
// 地支藏干（本气、中气、余气）
export const ZHI_CANG = {
  子: ['癸'], 丑: ['己', '癸', '辛'], 寅: ['甲', '丙', '戊'], 卯: ['乙'],
  辰: ['戊', '乙', '癸'], 巳: ['丙', '庚', '戊'], 午: ['丁', '己'], 未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'], 酉: ['辛'], 戌: ['戊', '辛', '丁'], 亥: ['壬', '甲']
};

export const TERMS = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
];
// 十二「节」（分月用），对应黄经
export const JIE = [
  { name: '立春', lon: 315, zhi: '寅' }, { name: '惊蛰', lon: 345, zhi: '卯' },
  { name: '清明', lon: 15, zhi: '辰' }, { name: '立夏', lon: 45, zhi: '巳' },
  { name: '芒种', lon: 75, zhi: '午' }, { name: '小暑', lon: 105, zhi: '未' },
  { name: '立秋', lon: 135, zhi: '申' }, { name: '白露', lon: 165, zhi: '酉' },
  { name: '寒露', lon: 195, zhi: '戌' }, { name: '立冬', lon: 225, zhi: '亥' },
  { name: '大雪', lon: 255, zhi: '子' }, { name: '小寒', lon: 285, zhi: '丑' }
];

/* ---------- 儒略日 ---------- */
export function jdFromUTC(y, m, d, h = 0, mi = 0, s = 0) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const day = d + (h + mi / 60 + s / 3600) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}
// 本地（东八区）日期 → 儒略日
export function jdLocal(y, m, d, h = 0, mi = 0) {
  return jdFromUTC(y, m, d, h, mi) - 8 / 24;
}
export function jdToLocalDate(jd) {
  let z = jd + 0.5 + 8 / 24;
  const Z = Math.floor(z);
  const F = z - Z;
  let A = Z;
  if (Z >= 2299161) { const a = Math.floor((Z - 1867216.25) / 36524.25); A = Z + 1 + a - Math.floor(a / 4); }
  const B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const dd = B - D - Math.floor(30.6001 * E) + F;
  const mm = E < 14 ? E - 1 : E - 13;
  const yy = mm > 2 ? C - 4716 : C - 4715;
  const day = Math.floor(dd);
  const hf = (dd - day) * 24;
  const hh = Math.floor(hf);
  const mi = Math.round((hf - hh) * 60);
  return { y: yy, m: mm, d: day, h: hh, mi: mi >= 60 ? 59 : mi };
}

/* ---------- 太阳视黄经 ---------- */
export function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.000289 * Math.sin(3 * Mr);
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
  return ((lambda % 360) + 360) % 360;
}
// 求「公历 year 年内」太阳视黄经首次 == lon 的儒略日
export function termJD(year, lon) {
  // 元旦太阳黄经约 280°，据此估算日序，保证结果落在该公历年内
  let est = jdFromUTC(year, 1, 1, 12) + (((lon - 280) % 360 + 360) % 360) * 365.2422 / 360;
  for (let i = 0; i < 8; i++) {
    let cur = sunLongitude(est);
    let diff = lon - cur;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    est += diff * 365.2422 / 360;
  }
  return est;
}
// 某公历年内的 24 节气，按时间先后排序（小寒 → 冬至）
export function yearTerms(year) {
  const out = [];
  for (let i = 0; i < 24; i++) {
    const lon = (315 + i * 15) % 360;
    const jd = termJD(year, lon);
    out.push({ name: TERMS[i], lon, jd, date: jdToLocalDate(jd) });
  }
  out.sort((a, b) => a.jd - b.jd);
  return out;
}
// 找出 jd 之前最近的「节」（含跨年）
export function currentJie(jd) {
  const d = jdToLocalDate(jd);
  const cand = [];
  for (const yy of [d.y - 1, d.y, d.y + 1]) {
    for (const j of JIE) cand.push({ name: j.name, zhi: j.zhi, lon: j.lon, jd: termJD(yy, j.lon) });
  }
  cand.sort((a, b) => a.jd - b.jd);
  let cur = cand[0], next = cand[1];
  for (let i = 0; i < cand.length; i++) {
    if (cand[i].jd <= jd) { cur = cand[i]; next = cand[i + 1] || cand[i]; }
  }
  return { cur, next };
}
// 找出 jd 之前最近的「节气」（24 个都算，奇门定局用）
export function currentTerm(jd) {
  const d = jdToLocalDate(jd);
  const cand = [];
  for (const yy of [d.y - 1, d.y, d.y + 1]) {
    for (let i = 0; i < 24; i++) {
      const lon = (315 + i * 15) % 360;
      cand.push({ name: TERMS[i], lon, jd: termJD(yy, lon) });
    }
  }
  cand.sort((a, b) => a.jd - b.jd);
  let cur = cand[0], next = cand[1];
  for (let i = 0; i < cand.length; i++) {
    if (cand[i].jd <= jd) { cur = cand[i]; next = cand[i + 1] || cand[i]; }
  }
  return { cur, next };
}

/* ---------- 朔望月 / 农历 ---------- */
// 第 k 个朔（新月）的儒略日（Meeus 简化式，误差约分钟级）
export function newMoonJD(k) {
  const T = k / 1236.85, r = Math.PI / 180;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T * T * T + 0.00000000073 * T * T * T * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T * T * T;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T;
  const O = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T;
  const c = -0.4072 * Math.sin(Mp * r) + 0.17241 * E * Math.sin(M * r)
    + 0.01608 * Math.sin(2 * Mp * r) + 0.01039 * Math.sin(2 * F * r)
    + 0.00739 * E * Math.sin((Mp - M) * r) - 0.00514 * E * Math.sin((Mp + M) * r)
    + 0.00208 * E * E * Math.sin(2 * M * r) - 0.00111 * Math.sin((Mp - 2 * F) * r)
    - 0.00057 * Math.sin((Mp + 2 * F) * r) + 0.00056 * E * Math.sin((2 * Mp + M) * r)
    - 0.00042 * Math.sin(3 * Mp * r) + 0.00042 * E * Math.sin((M + 2 * F) * r)
    + 0.00038 * E * Math.sin((M - 2 * F) * r) - 0.00024 * E * Math.sin((2 * Mp - M) * r)
    - 0.00017 * Math.sin(O * r) - 0.00007 * Math.sin((Mp + 2 * M) * r);
  return jde + c;
}
// 本地日历日的「日序」（东八区 0 时对应的整数）
function localDayNo(jd) { return Math.floor(jd + 0.5 + 8 / 24); }
// 求 jd 之前（含）最近一个朔的本地日序
function lastNewMoonDayNo(jd) {
  let k = Math.floor((jd - 2451550.09766) / 29.530588861) + 1;
  while (newMoonJD(k) > jd) k--;
  while (newMoonJD(k + 1) <= jd) k++;
  return { k, dayNo: localDayNo(newMoonJD(k)) };
}
/**
 * 公历 → 农历（定朔定气，中气置闰）
 * @returns {{year:number,month:number,day:number,leap:boolean,monthName:string,dayName:string}}
 */
export function lunarDate(y, m, d) {
  const jd = jdLocal(y, m, d, 12);
  const today = localDayNo(jd);
  // 上一个冬至
  let wsY = y;
  let ws = termJD(y, 270);
  if (jd < ws) { wsY = y - 1; ws = termJD(wsY, 270); }
  const ws2 = termJD(wsY + 1, 270);
  // 冬至所在朔望月 = 十一月
  const nm11 = lastNewMoonDayNo(ws);
  const nm11n = lastNewMoonDayNo(ws2);
  const nMonths = Math.round((newMoonJD(nm11n.k) - newMoonJD(nm11.k)) / 29.530588861);
  const leapYear = nMonths === 13; // 两个十一月之间有 13 个朔望月 → 需置闰
  // 列出各月
  const months = [];
  for (let i = 0; i <= nMonths; i++) {
    const k = nm11.k + i;
    const start = localDayNo(newMoonJD(k));
    const end = localDayNo(newMoonJD(k + 1)) - 1;
    months.push({ k, start, end, no: 0, leap: false });
  }
  // 判断每月是否含中气（中气黄经 = 270,300,330,0,...）
  function hasZhongQi(mo) {
    for (let yy = wsY; yy <= wsY + 2; yy++) {
      for (let i = 0; i < 12; i++) {
        const lon = (270 + i * 30) % 360;
        const t = localDayNo(termJD(yy, lon));
        if (t >= mo.start && t <= mo.end) return true;
      }
    }
    return false;
  }
  let no = 11, leapDone = false;
  for (let i = 0; i < months.length; i++) {
    const mo = months[i];
    if (leapYear && !leapDone && i > 0 && !hasZhongQi(mo)) {
      mo.leap = true; mo.no = months[i - 1].no; leapDone = true;
    } else {
      mo.no = no; no = no % 12 + 1;
      if (mo.no === 11 && i > 0) { /* 下一冬至月 */ }
    }
  }
  const cur = months.find((mo) => today >= mo.start && today <= mo.end) || months[0];
  const day = today - cur.start + 1;
  // 农历年份：正月初一起算
  let lyear = wsY + 1;
  if (cur.no >= 11 && months.indexOf(cur) < months.findIndex((mo) => mo.no === 1)) lyear = wsY;
  const MN = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const DN = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  return {
    year: lyear, month: cur.no, day, leap: cur.leap,
    monthName: (cur.leap ? '闰' : '') + MN[cur.no] + '月',
    dayName: DN[day] || String(day)
  };
}

/* ---------- 干支 ---------- */
export function gz(i) { i = ((i % 60) + 60) % 60; return GAN[i % 10] + ZHI[i % 12]; }
export function gzIndex(gan, zhi) {
  const g = GAN.indexOf(gan), z = ZHI.indexOf(zhi);
  for (let i = 0; i < 60; i++) if (i % 10 === g && i % 12 === z) return i;
  return -1;
}
// 日干支序号（0=甲子）。以 (JDN+49)%60 为准，JDN 取当地中午
export function dayGZIndex(y, m, d) {
  const jdn = Math.floor(jdFromUTC(y, m, d, 12) + 0.5);
  return ((jdn + 49) % 60 + 60) % 60;
}
// 旬首 与 旬空
export function xunInfo(gzIdx) {
  const xun = Math.floor(gzIdx / 10);          // 0..5
  const headIdx = xun * 10;                     // 甲子/甲戌/甲申/甲午/甲辰/甲寅
  const headZhi = headIdx % 12;
  const kong = [ZHI[(headZhi + 10) % 12], ZHI[(headZhi + 11) % 12]];
  return { xun, head: gz(headIdx), headIdx, kong };
}

/**
 * 四柱排盘
 * @param {number} y 公历年
 * @param {number} mo 月 1-12
 * @param {number} d 日
 * @param {number} h 时 0-23
 * @param {number} mi 分
 * @param {boolean} lateZi 晚子时(23点后)是否换日，默认 true（子时起新日）
 */
export function fourPillars(y, mo, d, h = 12, mi = 0, lateZi = true) {
  const jd = jdLocal(y, mo, d, h, mi);
  const { cur: jie, next } = currentJie(jd);

  // 年柱：以立春为界
  const lichunThis = termJD(y, 315);
  let yearForGZ = y;
  if (jd < lichunThis) yearForGZ = y - 1;
  const yIdx = ((yearForGZ - 1984) % 60 + 60) % 60;  // 1984 甲子年

  // 月柱：节令定月支，五虎遁定月干
  const mZhi = jie.zhi;
  const mZhiIdx = ZHI.indexOf(mZhi);
  const yGan = yIdx % 10;
  // 甲己之年丙作首 → 寅月干 = (年干%5)*2 + 2
  const firstMonthGan = ((yGan % 5) * 2 + 2) % 10;
  const monthsFromYin = (mZhiIdx - 2 + 12) % 12;
  const mGan = (firstMonthGan + monthsFromYin) % 10;
  const mIdx = (() => { for (let i = 0; i < 60; i++) if (i % 10 === mGan && i % 12 === mZhiIdx) return i; return 0; })();

  // 日柱（23点后换日）
  let dy = y, dm = mo, dd = d;
  if (lateZi && h >= 23) {
    const t = new Date(Date.UTC(y, mo - 1, d));
    t.setUTCDate(t.getUTCDate() + 1);
    dy = t.getUTCFullYear(); dm = t.getUTCMonth() + 1; dd = t.getUTCDate();
  }
  const dIdx = dayGZIndex(dy, dm, dd);

  // 时柱：五鼠遁
  const hZhiIdx = Math.floor(((h + 1) % 24) / 2);
  const dGan = dIdx % 10;
  const hGan = ((dGan % 5) * 2 + hZhiIdx) % 10;
  const hIdx = (() => { for (let i = 0; i < 60; i++) if (i % 10 === hGan && i % 12 === hZhiIdx) return i; return 0; })();

  return {
    jd,
    jie, nextJie: next,
    year: { idx: yIdx, gz: gz(yIdx), gan: GAN[yIdx % 10], zhi: ZHI[yIdx % 12] },
    month: { idx: mIdx, gz: gz(mIdx), gan: GAN[mIdx % 10], zhi: ZHI[mIdx % 12] },
    day: { idx: dIdx, gz: gz(dIdx), gan: GAN[dIdx % 10], zhi: ZHI[dIdx % 12] },
    hour: { idx: hIdx, gz: gz(hIdx), gan: GAN[hIdx % 10], zhi: ZHI[hIdx % 12] },
    xunkong: xunInfo(dIdx).kong,
    hourXun: xunInfo(hIdx)
  };
}

/* ---------- 五行生克 ---------- */
export const WX = ['金', '木', '水', '火', '土'];
export function shengKe(a, b) {
  // a 对 b 的关系
  const sheng = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' };
  const ke = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' };
  if (a === b) return '比和';
  if (sheng[a] === b) return '生';
  if (ke[a] === b) return '克';
  if (sheng[b] === a) return '被生';
  if (ke[b] === a) return '被克';
  return '';
}
export function wxSheng(a) { return { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' }[a]; }
export function wxKe(a) { return { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' }[a]; }

// 时辰名
export const SHICHEN = [
  { zhi: '子', range: '23:00–01:00' }, { zhi: '丑', range: '01:00–03:00' },
  { zhi: '寅', range: '03:00–05:00' }, { zhi: '卯', range: '05:00–07:00' },
  { zhi: '辰', range: '07:00–09:00' }, { zhi: '巳', range: '09:00–11:00' },
  { zhi: '午', range: '11:00–13:00' }, { zhi: '未', range: '13:00–15:00' },
  { zhi: '申', range: '15:00–17:00' }, { zhi: '酉', range: '17:00–19:00' },
  { zhi: '戌', range: '19:00–21:00' }, { zhi: '亥', range: '21:00–23:00' }
];
export function hourZhiIndex(h) { return Math.floor(((h + 1) % 24) / 2); }
