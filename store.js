// store.js —— 网页版收藏/进度存储（localStorage 替代小程序 wx.storage）
const KEY = 'yj_collected';       // 已集卦象序号数组
const LEARNED = 'yj_learned';     // 已学关卡 id 数组
const DAILY = 'yj_daily_seed';     // 当天已自动收入每日一卦的日期标记

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (e) { return []; }
}
function write(key, v) {
  localStorage.setItem(key, JSON.stringify(v));
}

export function getCollected() { return read(KEY); }
export function isCollected(n) { return getCollected().indexOf(n) !== -1; }
export function addCollected(n) {
  const a = getCollected();
  if (n && a.indexOf(n) === -1) { a.push(n); write(KEY, a); }
  return a;
}
export function toggleCollected(n) {
  const a = getCollected();
  const i = a.indexOf(n);
  if (i === -1) a.push(n); else a.splice(i, 1);
  write(KEY, a);
  return a;
}
export function count() { return getCollected().length; }

export function getLearned() { return read(LEARNED); }
export function isLearned(id) { return getLearned().indexOf(id) !== -1; }
export function addLearned(id) {
  const a = getLearned();
  if (id && a.indexOf(id) === -1) { a.push(id); write(LEARNED, a); }
  return a;
}

// 每日一卦：当天首次进入自动收入，之后读真实状态，避免切页被覆盖
export function getDailySeed() { return localStorage.getItem(DAILY) || ''; }
export function setDailySeed(d) { localStorage.setItem(DAILY, d); }
