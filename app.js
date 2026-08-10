// app.js —— 易卦研习：路由 + 全部页面（原生 ES Module，无构建）
import { TRIGRAM, HEX, cast, search, combine, allTrigrams, sampleWords, UNITS, BASIC, dailyHex, hexYaos, triYaos, TRIS } from './data.js';
import * as store from './store.js';
import { fourPillars, GAN, ZHI, SHICHEN, hourZhiIndex, lunarDate } from './calendar.js';
import { paipan as liuPaipan, tossSix, YONGSHEN, LIUSHEN } from './liuyao.js';
import { byTime as mhByTime, byNumbers as mhByNumbers, byChars as mhByChars, byRandom as mhByRandom, WAIYING, hexOf as mhHexOf } from './meihua.js';
import { paipan as qmPaipan, nowPaipan as qmNowPaipan, POS_NAME, RING } from './qimen.js';

const app = document.getElementById('app');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function go(route) { location.hash = route; }
function back() { window.history.length > 1 ? history.back() : go('#/'); }

/* ---------- 爻线图 ---------- */
function yaoRow(yang, opts = {}) {
  const cls = ['yao', yang ? '' : 'yin', opts.moving ? 'moving' : '', opts.old ? 'old' : ''].filter(Boolean).join(' ');
  return `<div class="${cls}"></div>`;
}
function hexHTML(yaos, small) {
  return `<div class="hex ${small ? 'small' : ''}">${yaos.map(y => yaoRow(y.yang, y)).join('')}</div>`;
}
function sixYaoFromLines(lines, movingIdx = []) {
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const pos = i + 1;
    const m = movingIdx.indexOf(i) !== -1;
    out.push({ pos, yang: lines[i] === 1, moving: m, old: m });
  }
  return out;
}
function triHTML(key, small) {
  const yaos = triYaos(key).slice().reverse().map((v, i) => ({ pos: 3 - i, yang: v === 1, moving: false, old: false }));
  return hexHTML(yaos, small);
}

/* ---------- 状态 ---------- */
const S = {
  demo: { casting: false, result: null },
  scan: { tab: 0, kw: '', main: null, others: [], searched: false, samples: [], loKey: null, upKey: null, combo: null },
  atlas: { filter: 'all', upKey: null },
  lessonQA: {},
  liuyao: { result: null, question: '', when: null },
  meihua: { result: null, method: 'time', inputs: {} },
  qimen: { result: null, when: null }
};

/* ---------- 导航高亮 ---------- */
function setNav(route) {
  document.querySelectorAll('.nav-link').forEach(a => {
    const r = a.dataset.route;
    a.classList.toggle('active', r && route.startsWith(r.replace('#', '')));
  });
  if (siteNav) siteNav.classList.remove('open');
}
if (navToggle && siteNav) navToggle.addEventListener('click', () => siteNav.classList.toggle('open'));

// 全局委托：所有带 data-route 的元素（含 #app 之外顶部导航、术数应用下拉）统一导航
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-route]');
  if (!el) return;
  e.preventDefault();
  go(el.dataset.route);
});

/* ===================== 首页 ===================== */
function homeHTML() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const tN = dailyHex(todayStr);
  if (store.getDailySeed() !== todayStr) { store.addCollected(tN); store.setDailySeed(todayStr); }
  const today = HEX[tN - 1];
  const learned = store.getLearned();
  let total = 0, done = 0;
  UNITS.forEach(u => u.lessons.forEach(l => { total++; if (learned.includes(l.id)) done++; }));
  const pct = total ? Math.round(done / total * 100) : 0;

  return `
  <section class="hero">
    <div class="hero-inner">
      <h1>易卦研习</h1>
      <p>从《易经》本经出发，读懂六十四卦、万物类象，再进入六爻、梅花、奇门三式应用。传统文化，也可以很新潮。</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-route="#/atlas">翻开六十四卦</button>
        <button class="btn btn-secondary" data-route="#/liuyao">起一卦看看</button>
      </div>
    </div>
  </section>
  <div class="page">
    <div class="daily-card" data-route="#/detail?n=${tN}">
      <div class="daily-hex">${hexHTML(sixYaoFromLines(hexYaos(tN)), true)}</div>
      <div class="daily-meta">
        <div class="daily-title">今日一卦</div>
        <div class="daily-name">${esc(today.name)}</div>
        <div class="subtitle">下${esc(TRIGRAM[today.lo].name)} · 上${esc(TRIGRAM[today.up].name)} · ${esc(today.y)}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">学习闯关进度</div>
      <div class="card-sub">已完成 ${done}/${total} 关</div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
      <button class="btn btn-ink btn-sm" data-route="#/learn">继续闯关</button>
    </div>
    <h2 style="margin-top:10px">四大研习模块</h2>
    <div class="grid">
      <div class="mod-card" data-route="#/atlas">
        <div class="mod-icon">📜</div>
        <div class="mod-title">六十四卦图鉴</div>
        <div class="mod-desc">文王卦序全收录，每卦配卦象、上下卦取象、白话解读与类象卡。</div>
        <span class="mod-tag">已集 ${store.count()}/64</span>
      </div>
      <div class="mod-card jade" data-route="#/scan">
        <div class="mod-icon">🔍</div>
        <div class="mod-title">万物归卦</div>
        <div class="mod-desc">查一物归于哪一卦，或上下两象拼出六十四卦，训练取象思维。</div>
        <span class="mod-tag">生活类象</span>
      </div>
      <div class="mod-card gold" data-route="#/learn">
        <div class="mod-icon">🎓</div>
        <div class="mod-title">闯关学习</div>
        <div class="mod-desc">Duolingo 式关卡：阴阳爻、八卦、认卦配对，边玩边记。</div>
        <span class="mod-tag">${pct}% 完成</span>
      </div>
      <div class="mod-card ink" data-route="#/basic">
        <div class="mod-icon">📐</div>
        <div class="mod-title">基础原理</div>
        <div class="mod-desc">太极生两仪、四象、八卦，先天后天、爻位取象，一文讲透。</div>
        <span class="mod-tag">图文详解</span>
      </div>
    </div>
    <h2 style="margin-top:28px">三式应用</h2>
    <div class="grid">
      <div class="mod-card" data-route="#/liuyao">
        <div class="mod-icon">🪙</div>
        <div class="mod-title">六爻纳甲</div>
        <div class="mod-desc">金钱卦起卦，自动装卦、纳甲、配六亲六神、查旬空月破。</div>
        <span class="mod-tag">京房纳甲</span>
      </div>
      <div class="mod-card jade" data-route="#/meihua">
        <div class="mod-icon">🌸</div>
        <div class="mod-title">梅花易数</div>
        <div class="mod-desc">时间、数字、字数起卦，体用互变，五行生克断吉凶。</div>
        <span class="mod-tag">邵雍心法</span>
      </div>
      <div class="mod-card gold" data-route="#/qimen">
        <div class="mod-icon">🧭</div>
        <div class="mod-title">奇门遁甲</div>
        <div class="mod-desc">时家奇门转盘排盘：地盘、天盘九星、八门、八神四盘合一。</div>
        <span class="mod-tag">拆补定局</span>
      </div>
    </div>
  </div>`;
}
function homeBind() {
  app.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => go(el.dataset.route)));
}

/* ===================== 学习首页 ===================== */
function learnHTML() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const tN = dailyHex(todayStr);
  if (store.getDailySeed() !== todayStr) { store.addCollected(tN); store.setDailySeed(todayStr); }
  const today = HEX[tN - 1];
  const learned = store.getLearned();
  let total = 0, done = 0;
  UNITS.forEach(u => u.lessons.forEach(l => { total++; if (learned.includes(l.id)) done++; }));
  const pct = total ? Math.round(done / total * 100) : 0;

  const unitsHTML = UNITS.map((u, ui) => {
    const nodes = u.lessons.map((l, li) => {
      const isDone = learned.includes(l.id);
      const isCur = !isDone && (ui === 0 || UNITS[ui - 1].lessons.every(x => learned.includes(x.id)));
      return `<div class="lesson-node ${isDone ? 'done' : ''} ${isCur ? 'current' : ''}" data-u="${ui}" data-l="${li}">${isDone ? '✓' : (li + 1)}</div>`;
    }).join('');
    return `<div class="unit"><div class="unit-head"><div class="unit-color" style="background:${u.color}"></div><div class="unit-title">${esc(u.title)}</div></div><div class="lessons">${nodes}</div></div>`;
  }).join('');

  return `
  <div class="page">
    <h1>闯关学习</h1>
    <div class="card daily-card" data-route="#/detail?n=${tN}">
      <div class="daily-hex">${hexHTML(sixYaoFromLines(hexYaos(tN)), true)}</div>
      <div class="daily-meta">
        <div class="daily-title">今日一卦 · 自动收入图鉴</div>
        <div class="daily-name">${esc(today.name)}</div>
        <div class="subtitle">${esc(today.y)}</div>
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="card-title" style="margin:0">学习进度</span>
        <span class="tag jade">${done}/${total}</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
    </div>
    ${unitsHTML}
    <div class="grid">
      <div class="mod-card" data-route="#/basic"><div class="mod-title">基础原理图文详解</div><div class="mod-desc">太极 → 八卦 → 六十四卦的生成链与爻位取象。</div></div>
      <div class="mod-card jade" data-route="#/trigram"><div class="mod-title">八卦取象词典</div><div class="mod-desc">形态、事物、场所、味道、家人、身体、数字。</div></div>
    </div>
  </div>`;
}
function learnBind() {
  app.querySelectorAll('.lesson-node').forEach(el => el.addEventListener('click', () => go(`#/lesson?u=${el.dataset.u}&l=${el.dataset.l}`)));
  app.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => go(el.dataset.route)));
}

/* ===================== 起卦（投铜钱） ===================== */
function demoHTML() {
  const st = S.demo;
  let body = `
  <div class="page">
    <h1>投三枚铜钱起卦</h1>
    <p class="subtitle">古法金钱卦：三枚铜钱掷六次，从下往上成六爻。老阳老阴为动爻，一变而成之卦。</p>
    <div class="card" style="text-align:center">
      <button class="btn btn-primary" id="castBtn" ${st.casting ? 'disabled' : ''}>🪙 投铜钱 · 得一卦</button>
      <p class="subtitle" style="margin-top:10px">点按六次，每次三枚铜钱同时翻转</p>
    </div>`;
  if (st.casting) {
    body += `<div class="card" style="text-align:center"><div style="display:flex;gap:12px;justify-content:center;margin:16px 0"><div class="toss-coin flip">钱</div><div class="toss-coin flip">钱</div><div class="toss-coin flip">钱</div></div><p>铜钱翻转中…</p></div>`;
  }
  if (st.result) {
    const r = st.result;
    const yaos = buildYaosTopDown(r.ben, r.tosses);
    const collected = store.isCollected(r.orig.n);
    const bianName = r.bian ? r.bian.name : '无变卦（六爻安静）';
    body += `
    <div class="card" style="text-align:center">
      <div style="margin-bottom:14px">${hexHTML(yaos)}</div>
      <div class="gua-title">${esc(r.orig.name)}</div>
      <div class="gua-sub">下${esc(TRIGRAM[r.orig.lo].name)} · 上${esc(TRIGRAM[r.orig.up].name)}</div>
      ${r.bian ? `<div class="gua-sub" style="margin-top:6px">变卦：${esc(r.bian.name)}</div>` : ''}
      <div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary ${collected ? 'btn-ink' : ''}" id="collectBtn">${collected ? '✓ 已收入图鉴' : '收入图鉴'}</button>
        <button class="btn btn-ink" data-route="#/detail?n=${r.orig.n}">看详解</button>
        <button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark)" id="recastBtn">再投一次</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">卦象白话</div>
      <p>${esc(r.orig.d)}</p>
      <p><strong>卦辞大意：</strong>${esc(r.orig.y)}</p>
    </div>`;
  }
  body += `</div>`;
  return body;
}
function demoBind() {
  const btn = app.querySelector('#castBtn');
  if (btn && !S.demo.casting) btn.addEventListener('click', () => {
    S.demo.casting = true;
    render();
    setTimeout(() => {
      const res = cast();
      store.addCollected(res.orig.n);
      S.demo = { casting: false, result: { orig: res.orig, ben: res.ben, tosses: res.tosses, bian: res.changed } };
      render();
    }, 650);
  });
  app.querySelector('#collectBtn')?.addEventListener('click', () => {
    if (S.demo.result) { store.toggleCollected(S.demo.result.orig.n); render(); }
  });
  app.querySelector('#recastBtn')?.addEventListener('click', () => { S.demo.result = null; render(); });
  app.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => go(el.dataset.route)));
}
function keyOfLines(l3) { return Object.keys(TRIGRAM).find(k => TRIGRAM[k].lines.every((v,i)=>v===l3[i])); }
function buildYaosTopDown(ben, tosses) {
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const ch = tosses ? (tosses[i].moving || tosses[i].ch) : false;
    out.push({ pos: 6 - i, yang: ben[i] === 1, moving: ch, old: ch });
  }
  return out;
}

/* ===================== 万物归卦 ===================== */
function scanHTML() {
  const st = S.scan;
  const tabs = ['查一物', '两象组卦'];
  const tabBar = tabs.map((t, i) => `<button class="btn btn-sm ${i === st.tab ? 'btn-ink' : 'btn-secondary'}" style="${i !== st.tab ? 'color:var(--ink);border-color:var(--line-dark)' : ''}" data-i="${i}">${t}</button>`).join('');

  let body = `
  <div class="page">
    <h1>万物归卦</h1>
    <p class="subtitle">《易学入门》说：读懂一卦，先看懂卦里的「象」。查一查身边事物归在哪一卦。</p>
    <div style="display:flex;gap:8px;margin-bottom:18px">${tabBar}</div>`;

  if (st.tab === 0) {
    body += `
    <div class="card">
      <div class="form-inline">
        <div class="form-row" style="flex:1"><input id="scanInput" placeholder="输入任何事物，如：手机、石头、大海" value="${esc(st.kw)}"></div>
        <button class="btn btn-primary" id="scanBtn">查询</button>
      </div>
      <p class="subtitle">试试：手机、电脑、汽车、书本、米饭、河流、高山、门窗…</p>
    </div>`;
    if (st.searched) {
      if (st.main) {
        const t = TRIGRAM[st.main];
        body += `
        <div class="card" style="text-align:center">
          <div style="font-size:48px;margin-bottom:6px">${triHTML(st.main)}</div>
          <div class="gua-title">${t.name}卦</div>
          <div class="gua-sub">五行${t.images.wuxing} · ${t.nature} · ${t.desc}</div>
          <div style="margin-top:14px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${t.images.things.slice(0,8).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div>
          <button class="btn btn-ink btn-sm" style="margin-top:16px" data-route="#/trigram">看完整取象词典</button>
        </div>`;
      } else {
        body += `<div class="card" style="text-align:center"><p>没有直接对应，试试换个词，或在下方「两象组卦」里自己归类。</p><button class="btn btn-ink btn-sm" data-route="#/trigram">八卦速览</button></div>`;
      }
      if (st.others.length) {
        body += `<div class="card"><div class="card-title">也可能相关</div><div style="display:flex;gap:8px;flex-wrap:wrap">${st.others.map(k=>`<span class="tag">${TRIGRAM[k].name}</span>`).join('')}</div></div>`;
      }
    }
  } else {
    const trigrams = Object.keys(TRIGRAM);
    const pick = (label, key) => {
      const sel = key === 'lo' ? st.loKey : st.upKey;
      return `<div class="form-row"><label class="form-label">${label}</label><select id="${key}Sel"><option value="">选八卦</option>${trigrams.map(k=>`<option value="${k}" ${sel===k?'selected':''}>${TRIGRAM[k].name} · ${TRIGRAM[k].nature}</option>`).join('')}</select></div>`;
    };
    body += `
    <div class="card">
      <div class="form-inline">${pick('下卦（内卦）', 'lo')}${pick('上卦（外卦）', 'up')}</div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn btn-primary" id="comboBtn">组卦</button>
        <button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark)" id="randCombo">随机两象</button>
      </div>
    </div>`;
    if (st.combo) {
      const h = st.combo;
      body += `
      <div class="card" style="text-align:center">
        <div style="font-size:42px;margin-bottom:10px">${hexHTML(sixYaoFromLines(hexYaos(h.n)))}</div>
        <div class="gua-title">${esc(h.name)}</div>
        <div class="gua-sub">下${esc(TRIGRAM[h.lo].name)} · 上${esc(TRIGRAM[h.up].name)}</div>
        <p>${esc(h.y)}</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn btn-primary" id="collectCombo">收入图鉴</button>
          <button class="btn btn-ink" data-route="#/detail?n=${h.n}">看详解</button>
        </div>
      </div>`;
    }
  }
  body += `</div>`;
  return body;
}
function scanBind() {
  const st = S.scan;
  app.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { S.scan.tab = +b.dataset.i; render(); }));
  app.querySelector('#scanBtn')?.addEventListener('click', doSearch);
  app.querySelector('#scanInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  app.querySelector('#comboBtn')?.addEventListener('click', () => {
    const lo = app.querySelector('#loSel').value, up = app.querySelector('#upSel').value;
    S.scan.loKey = lo; S.scan.upKey = up;
    S.scan.combo = lo && up ? combine(lo, up) : null;
    render();
  });
  app.querySelector('#randCombo')?.addEventListener('click', () => {
    const keys = Object.keys(TRIGRAM);
    S.scan.loKey = keys[Math.floor(Math.random()*8)];
    S.scan.upKey = keys[Math.floor(Math.random()*8)];
    S.scan.combo = combine(S.scan.loKey, S.scan.upKey);
    render();
  });
  app.querySelector('#collectCombo')?.addEventListener('click', () => {
    if (S.scan.combo) { store.addCollected(S.scan.combo.n); render(); }
  });
  app.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => go(el.dataset.route)));
}
function doSearch() {
  const kw = app.querySelector('#scanInput').value.trim();
  S.scan.kw = kw; S.scan.searched = true;
  const res = search(kw);
  S.scan.main = res.length ? res[0].key : null;
  S.scan.others = res.slice(1).map(x => x.key);
  render();
}

/* ===================== 六十四卦图鉴 ===================== */
function atlasHTML() {
  const collected = store.getCollected();
  const PURE = HEX.filter(h => h.lo === h.up).map(h => h.n);
  const achieves = [
    { n: 8, t: '初识八卦' }, { n: 16, t: '渐入门径' }, { n: 32, t: '卦海过半' }, { n: 64, t: '六十四全通' }
  ];
  const got = collected.length;
  const ach = achieves.filter(a => got >= a.n).pop();
  const filters = [['all','全部'],['collected','已集'],['locked','未集']].concat(Object.keys(TRIGRAM).map(k=>['up:'+k,'上'+TRIGRAM[k].name]));
  const filterBar = filters.map(([v,l]) => `<button class="btn btn-sm ${S.atlas.filter===v?'btn-ink':'btn-secondary'}" style="${S.atlas.filter!==v?'color:var(--ink);border-color:var(--line-dark)':''}" data-f="${v}">${l}</button>`).join('');

  const list = HEX.filter(h => {
    const c = store.isCollected(h.n) || PURE.indexOf(h.n) !== -1;
    if (S.atlas.filter === 'collected') return c;
    if (S.atlas.filter === 'locked') return !c;
    if (S.atlas.filter.startsWith('up:')) return h.up === S.atlas.filter.slice(3);
    return true;
  }).map(h => {
    const unlocked = store.isCollected(h.n) || PURE.indexOf(h.n) !== -1;
    return `<div class="atlas-item ${unlocked?'':'locked'}" data-n="${h.n}">
      ${unlocked ? `<div>${triHTML(h.lo,true)}${triHTML(h.up,true)}</div><div class="atlas-name">${esc(h.name)}</div><div class="atlas-sub">下${TRIGRAM[h.lo].name} · 上${TRIGRAM[h.up].name}</div>` : `<div style="font-size:28px">?</div><div class="atlas-name">未解锁</div><div class="atlas-sub">去起卦或组卦</div>`}
    </div>`;
  }).join('');

  return `
  <div class="page">
    <h1>六十四卦图鉴</h1>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div><span class="card-title" style="margin:0">已集 ${got}/64</span>${ach ? `<span class="tag seal" style="margin-left:8px">${ach.t}</span>` : ''}</div>
        <div class="progress-wrap" style="width:180px;margin:0"><div class="progress-bar" style="width:${got/64*100}%"></div></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${filterBar}</div>
    <div class="atlas-grid">${list}</div>
  </div>`;
}
function atlasBind() {
  app.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { S.atlas.filter = b.dataset.f; render(); }));
  app.querySelectorAll('.atlas-item:not(.locked)').forEach(el => el.addEventListener('click', () => go(`#/detail?n=${el.dataset.n}`)));
}

/* ===================== 单卦详情 ===================== */
function detailHTML(n) {
  const h = HEX.find(x => x.n === +n);
  if (!h) return `<div class="page"><div class="card nf-card"><div class="nf-title">未找到此卦</div><div class="nf-sub">六十四卦图鉴里都有，去看看吧。</div><button class="btn btn-primary" data-route="#/atlas">打开图鉴</button></div></div>`;
  const collected = store.isCollected(h.n);
  const tLo = TRIGRAM[h.lo], tUp = TRIGRAM[h.up];
  return `
  <div class="page">
    <div class="card" style="text-align:center">
      <div style="font-size:56px;margin:10px 0">${hexHTML(sixYaoFromLines(hexYaos(h.n)))}</div>
      <div class="gua-title">${esc(h.name)}</div>
      <div class="gua-sub">下${esc(tLo.name)} · 上${esc(tUp.name)}</div>
      <p style="max-width:560px;margin:14px auto 0">${esc(h.d)}</p>
      <div style="margin-top:18px;display:flex;gap:10px;justify-content:center">
        <button class="btn ${collected?'btn-ink':'btn-primary'}" id="toggleCollect">${collected?'移出图鉴':'收入图鉴'}</button>
        <button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark)" data-route="#/atlas">返回图鉴</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">卦辞大意</div>
      <p>${esc(h.y)}</p>
    </div>
    <div class="grid">
      <div class="card"><div class="card-title">下卦 · ${esc(tLo.name)}（${tLo.nature}）</div><p>${esc(tLo.desc)}</p><div style="display:flex;gap:6px;flex-wrap:wrap">${tLo.images.things.slice(0,6).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div></div>
      <div class="card"><div class="card-title">上卦 · ${esc(tUp.name)}（${tUp.nature}）</div><p>${esc(tUp.desc)}</p><div style="display:flex;gap:6px;flex-wrap:wrap">${tUp.images.things.slice(0,6).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div></div>
    </div>
    <div class="card">
      <div class="card-title">卦象取类</div>
      <table>
        <tr><th>类别</th><th>下卦（${tLo.name}）</th><th>上卦（${tUp.name}）</th></tr>
        ${[['五行','wuxing'],['形态','shape'],['场所','places'],['味道','taste'],['家人','family'],['身体','body'],['先天数','num.xiantian'],['洛书数','num.luoshu']].map(([label,key])=>{
          const a = key.includes('.') ? tLo.images[key.split('.')[0]][key.split('.')[1]] : (Array.isArray(tLo.images[key])?tLo.images[key].slice(0,3).join('、'):tLo.images[key]);
          const b = key.includes('.') ? tUp.images[key.split('.')[0]][key.split('.')[1]] : (Array.isArray(tUp.images[key])?tUp.images[key].slice(0,3).join('、'):tUp.images[key]);
          return `<tr><td>${label}</td><td>${esc(String(a))}</td><td>${esc(String(b))}</td></tr>`;
        }).join('')}
      </table>
    </div>
  </div>`;
}
function detailBind(n) {
  app.querySelector('#toggleCollect')?.addEventListener('click', () => { store.toggleCollected(+n); render(); });
  app.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => go(el.dataset.route)));
}

/* ===================== 基础原理 ===================== */
function basicHTML() {
  const stages = [
    { t: '太极生两仪', d: '太极是未分化的整体；一动就分出阴阳。阴为柔、静、收敛；阳为刚、动、生发。' },
    { t: '两仪生四象', d: '阴阳再各分老少：老阳、少阴、少阳、老阴。老阳老阴会变化，就是起卦时的「动爻」。' },
    { t: '四象生八卦', d: '三爻叠成一卦，共八个基本卦：乾天、坤地、震雷、巽风、坎水、离火、艮山、兑泽。' },
    { t: '八卦成六十四卦', d: '上卦加下卦，8×8 得六十四卦。下卦为内、为近；上卦为外、为远。' }
  ];
  const stageHTML = stages.map((s,i)=>`<div class="stage"><div class="stage-no">${i+1}</div><div class="stage-body"><div class="stage-title">${s.t}</div><div class="stage-text">${s.d}</div></div></div>`).join('');
  return `
  <div class="page">
    <h1>基础原理</h1>
    <div class="card">${stageHTML}</div>
    <div class="card"><div class="card-title">先天八卦与后天八卦</div>
      <p><strong>先天八卦</strong>讲对待、讲本体：乾南坤北，离东坎西，震东北巽西南，艮西北兑东南。</p>
      <p><strong>后天八卦</strong>讲流行、讲应用：离南坎北，震东兑西，巽东南坤西南，艮东北乾西北。</p>
    </div>
    <div class="card"><div class="card-title">爻位之象</div>
      <table><tr><th>爻位</th><th>人体</th><th>阶段</th><th>位置感</th></tr>
      <tr><td>初爻</td><td>足、趾</td><td>开始</td><td>最下、民间</td></tr>
      <tr><td>二爻</td><td>小腿、股</td><td>渐起</td><td>地道、臣位</td></tr>
      <tr><td>三爻</td><td>腰、腹</td><td>多凶</td><td>人位、近事</td></tr>
      <tr><td>四爻</td><td>胸、背</td><td>多惧</td><td>近君、外事</td></tr>
      <tr><td>五爻</td><td>颈、首</td><td>功成</td><td>君位、尊位</td></tr>
      <tr><td>上爻</td><td>顶、颠</td><td>极反</td><td>过亢、事终</td></tr></table>
    </div>
  </div>`;
}

/* ===================== 八卦取象词典 ===================== */
function trigramHTML() {
  const cards = Object.keys(TRIGRAM).map(k => {
    const t = TRIGRAM[k];
    return `<div class="accordion" data-k="${k}">
      <div class="acc-head"><span>${t.name} · ${t.nature}（${t.images.wuxing}）</span></div>
      <div class="acc-body">
        <p><strong>形态：</strong>${esc(t.images.shape)}</p>
        <p><strong>常见事物：</strong>${esc(t.images.things.join('、'))}</p>
        <p><strong>场所：</strong>${esc(t.images.places.join('、'))}</p>
        <p><strong>味道：</strong>${esc(t.images.taste)} · <strong>家人：</strong>${esc(t.images.family)} · <strong>身体：</strong>${esc(t.images.body)}</p>
        <p><strong>先天数：</strong>${t.images.num.xiantian} · <strong>洛书数：</strong>${t.images.num.luoshu}</p>
      </div>
    </div>`;
  }).join('');
  return `
  <div class="page">
    <h1>八卦取象词典</h1>
    <p class="subtitle">《易学入门》说：想读懂一卦，先要看懂卦里的「象」。同一个卦，可对应形态、事物、场所、味道、家人、身体部位等。</p>
    ${cards}
  </div>`;
}
function trigramBind() {
  app.querySelectorAll('.accordion').forEach(el => {
    const head = el.querySelector('.acc-head');
    if (head) head.addEventListener('click', () => el.classList.toggle('open'));
  });
}

/* ===================== 关卡 ===================== */
function lessonHTML() {
  const { u, l } = parseHash().params;
  const ui = +u, li = +l;
  const unit = UNITS[ui]; const les = unit && unit.lessons[li];
  if (!unit || !les) return `<div class="page"><div class="card nf-card"><div class="nf-title">关卡不存在</div></div></div>`;
  const learned = store.isLearned(les.id);
  let body = `<div class="page"><h1>${esc(unit.title)}</h1><div class="card"><div class="card-title">第 ${li+1} 关 · ${esc(les.title)}</div><p>${esc(les.learn || '')}</p></div>`;
  les.quiz.forEach((q, qi) => {
    body += `<div class="card" data-q="${qi}">`;
    if (q.type === 'pair') {
      body += `<div class="card-title">拼出目标卦：${esc(q.target)}</div><div style="display:flex;gap:20px;flex-wrap:wrap"><div><div class="form-label">下卦</div><div class="tri-pick" style="display:flex;gap:8px;flex-wrap:wrap">${Object.keys(TRIGRAM).map(k=>`<button class="btn btn-sm btn-secondary tri-btn" data-k="${k}" data-side="lo" data-q="${qi}" style="color:var(--ink);border-color:var(--line-dark)">${TRIGRAM[k].name}</button>`).join('')}</div></div><div><div class="form-label">上卦</div><div class="tri-pick" style="display:flex;gap:8px;flex-wrap:wrap">${Object.keys(TRIGRAM).map(k=>`<button class="btn btn-sm btn-secondary tri-btn" data-k="${k}" data-side="up" data-q="${qi}" style="color:var(--ink);border-color:var(--line-dark)">${TRIGRAM[k].name}</button>`).join('')}</div></div></div><div class="matchPreview" data-q="${qi}" style="margin:18px 0;text-align:center"></div><button class="btn btn-primary matchCheck" data-q="${qi}">检查</button>`;
    } else {
      const lines = q.lines ? `<div style="text-align:center;font-size:46px;margin:10px 0">${hexHTML(sixYaoFromLines(q.lines.split('').map(Number)), true)}</div>` : '';
      body += `<div class="card-title">题目</div>${lines}<p>${esc(q.q)}</p><div style="display:flex;flex-direction:column;gap:10px">${q.options.map((opt,i)=>`<button class="btn btn-secondary opt" data-q="${qi}" data-i="${i}" style="justify-content:flex-start;color:var(--ink);border-color:var(--line-dark)">${esc(opt)}</button>`).join('')}</div>`;
    }
    body += `<div class="fb" data-q="${qi}" style="margin-top:14px;display:none"></div></div>`;
  });
  body += learned ? `<div class="tip">本关已通过。可返回学习地图继续闯关。</div>` : '';
  body += `<button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark)" data-route="#/learn">← 返回学习地图</button></div>`;
  return body;
}
function lessonBind() {
  const { u, l } = parseHash().params;
  const ui = +u, li = +l;
  const les = UNITS[ui].lessons[li];
  const key = ui + '_' + li;
  if (!S.lessonQA[key]) S.lessonQA[key] = {};
  const done = S.lessonQA[key];
  const mark = (qi) => { done[qi] = true; if (les.quiz.every((_, i) => done[i])) { store.addLearned(les.id); render(); } };

  app.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
    const qi = +b.dataset.q, i = +b.dataset.i, q = les.quiz[qi];
    const ok = q.answer === i;
    const fb = app.querySelector(`.fb[data-q="${qi}"]`);
    fb.style.display = 'block';
    fb.innerHTML = `<div style="color:${ok?'var(--jade)':'var(--seal)'};font-weight:700">${ok?'✓ 答对':'✗ 答错'}：${esc(q.expl)}</div>`;
    if (ok) mark(qi);
  }));
  const ms = {};
  app.querySelectorAll('.tri-btn').forEach(b => b.addEventListener('click', () => {
    const qi = +b.dataset.q, side = b.dataset.side, k = b.dataset.k;
    (ms[qi] = ms[qi] || {})[side] = k;
    app.querySelectorAll(`.tri-btn[data-q="${qi}"][data-side="${side}"]`).forEach(x => x.classList.remove('btn-ink'));
    b.classList.add('btn-ink');
    const s = ms[qi];
    if (s.lo && s.up) app.querySelector(`.matchPreview[data-q="${qi}"]`).innerHTML = hexHTML(sixYaoFromLines(TRIGRAM[s.lo].lines.concat(TRIGRAM[s.up].lines).map(Number)), true) + `<div style="margin-top:8px">${TRIGRAM[s.lo].name}下 · ${TRIGRAM[s.up].name}上</div>`;
  }));
  app.querySelectorAll('.matchCheck').forEach(btn => btn.addEventListener('click', () => {
    const qi = +btn.dataset.q, q = les.quiz[qi], s = ms[qi] || {};
    const ok = s.lo === q.lo && s.up === q.up;
    const fb = app.querySelector(`.fb[data-q="${qi}"]`);
    fb.style.display = 'block';
    fb.innerHTML = `<div style="color:${ok?'var(--jade)':'var(--seal)'};font-weight:700">${ok?'✓ 拼对':'✗ 再试一次'}：${esc(q.expl)}</div>`;
    if (ok) mark(qi);
  }));
  app.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => go(el.dataset.route)));
}

/* ===================== 六爻纳甲 ===================== */
function liuyaoHTML() {
  const st = S.liuyao;
  let body = `
  <div class="page">
    <h1>六爻纳甲</h1>
    <p class="subtitle">京房纳甲法：铜钱摇卦 → 装地支 → 配六亲六神 → 定世应 → 查旬空月破。源自《火珠林》《卜筮正宗》《增删卜易》。</p>
    <div class="card">
      <div class="form-row"><label class="form-label">所问之事</label><input id="lyQuestion" placeholder="如：问此次求职能否成" value="${esc(st.question || '')}"></div>
      <div class="form-inline">
        <div class="form-row"><label class="form-label">公历日期</label><input type="datetime-local" id="lyTime"></div>
        <button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark);margin-bottom:14px" id="lyNow">用现在</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" id="lyCast">🪙 自动摇卦</button>
        <button class="btn btn-jade" id="lyManual">手动指定动爻</button>
      </div>
    </div>`;
  if (st.result) {
    const r = st.result, ben = r.ben;
    body += `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div class="card-title" style="margin:0">${esc(ben.name)} · ${ben.label} · ${ben.palace}宫（${ben.palaceWx}）</div><div class="tag seal">世${ben.shi} 应${ben.ying}</div></div>
      <div class="table-wrap"><table>
        <tr><th>爻位</th><th>干支</th><th>五行</th><th>六亲</th><th>六神</th><th>状态</th><th>变爻</th></tr>
        ${ben.yaos.slice().reverse().map(y => `<tr>
          <td>${y.pos}爻${y.shi?' <span class="tag seal">世</span>':''}${y.ying?' <span class="tag jade">应</span>':''}</td>
          <td>${y.gan}${y.zhi}</td><td>${y.wx}</td><td>${y.qin}</td><td>${y.shen}</td>
          <td>${[y.moving?'动':'',y.kong?'空':'',y.poMonth?'破':'',y.wang?'旺':''].filter(Boolean).join(' ')}</td>
          <td>${y.bian ? y.bian.gan+y.bian.zhi+'·'+y.bian.qin : '-'}</td>
        </tr>`).join('')}
      </table></div>
      ${r.bian ? `<p><strong>变卦：</strong>${r.bian.name}</p>` : ''}
    </div>
    <div class="card"><div class="card-title">用神参考</div><div class="grid">${YONGSHEN.map(y=>`<div><strong>${y.qin}</strong>：${y.use}</div>`).join('')}</div></div>
    <div class="card"><div class="card-title">简断</div>${r.summary.map(s=>`<p>${esc(s)}</p>`).join('')}</div>`;
  }
  body += `</div>`;
  return body;
}
function liuyaoBind() {
  const st = S.liuyao;
  if (st.when) app.querySelector('#lyTime').value = fmtDTLocal(st.when);
  app.querySelector('#lyNow')?.addEventListener('click', () => { S.liuyao.when = nowDT(); render(); });
  app.querySelector('#lyCast')?.addEventListener('click', () => {
    const q = app.querySelector('#lyQuestion').value;
    const when = parseDT(app.querySelector('#lyTime').value) || nowDT();
    const tosses = tossSix();
    S.liuyao = { question: q, when, result: liuPaipan(tosses, when, q) };
    render();
  });
  app.querySelector('#lyManual')?.addEventListener('click', () => {
    const q = app.querySelector('#lyQuestion').value;
    const when = parseDT(app.querySelector('#lyTime').value) || nowDT();
    const lines = [1,0,1,0,1,1];
    S.liuyao = { question: q, when, result: liuPaipan(lines.map((v,i)=> ({ sum: v ? (i===2?9:7) : (i===2?6:8) })), when, q) };
    render();
  });
}
function nowDT() { const d = new Date(); return { y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate(), h:d.getHours(), mi:d.getMinutes() }; }
function fmtDTLocal(w) { return `${w.y}-${String(w.m).padStart(2,'0')}-${String(w.d).padStart(2,'0')}T${String(w.h).padStart(2,'0')}:${String(w.mi).padStart(2,'0')}`; }
function parseDT(s) { if (!s) return null; const [date,time]=s.split('T'); const [y,m,d]=date.split('-').map(Number); const [h,mi]=time.split(':').map(Number); return {y,m,d,h,mi}; }

/* ===================== 梅花易数 ===================== */
function meihuaHTML() {
  const st = S.meihua;
  const methods = [['time','年月日时'],['numbers','数字起卦'],['chars','字数/报字'],['random','心动起卦']];
  const methodBar = methods.map(([k,l])=>`<button class="btn btn-sm ${st.method===k?'btn-ink':'btn-secondary'}" style="${st.method!==k?'color:var(--ink);border-color:var(--line-dark)':''}" data-m="${k}">${l}</button>`).join('');
  let inputArea = '';
  if (st.method === 'time') inputArea = `<div class="form-inline"><div class="form-row"><label class="form-label">公历时间</label><input type="datetime-local" id="mhTime"></div><button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark);margin-bottom:14px" id="mhNow">用现在</button></div>`;
  else if (st.method === 'numbers') inputArea = `<div class="form-row"><label class="form-label">数字（空格或逗号分隔，留一个则前后拆分）</label><input id="mhNums" placeholder="如：23 45 或 12345"></div>`;
  else if (st.method === 'chars') inputArea = `<div class="form-row"><label class="form-label">文字（字数起卦或单字）</label><input id="mhChars" placeholder="如：前程"></div>`;
  else inputArea = `<p class="subtitle">心动则占，随机取象。</p>`;

  let body = `
  <div class="page">
    <h1>梅花易数</h1>
    <p class="subtitle">邵雍心法：象、数、理、占。先起卦，再看体用生克、互卦变卦，最后合外应。参考贾双萍《梅花易数预测学》。</p>
    <div class="card">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${methodBar}</div>
      ${inputArea}
      <button class="btn btn-primary" id="mhCast">起卦</button>
    </div>`;
  if (st.result) {
    const r = st.result;
    body += `
    <div class="grid">
      <div class="card" style="text-align:center"><div class="card-title">本卦</div><div style="font-size:42px;margin:10px 0">${hexHTML(sixYaoFromLines(r.lines))}</div><div class="gua-title">${r.ben.name}</div><div class="gua-sub">动爻：${r.dong}</div></div>
      <div class="card" style="text-align:center"><div class="card-title">互卦</div><div style="font-size:42px;margin:10px 0">${hexHTML(sixYaoFromLines(TRIGRAM[r.hu.loKey].lines.concat(TRIGRAM[r.hu.upKey].lines).map(Number)))}</div><div class="gua-title">${r.hu.name}</div></div>
      <div class="card" style="text-align:center"><div class="card-title">变卦</div><div style="font-size:42px;margin:10px 0">${hexHTML(sixYaoFromLines(TRIGRAM[r.bian.loKey].lines.concat(TRIGRAM[r.bian.upKey].lines).map(Number)))}</div><div class="gua-title">${r.bian.name}</div></div>
    </div>
    <div class="card">
      <div class="card-title">体用关系</div>
      <p>体卦：<strong>${r.ti.name}（${r.ti.wx}）</strong>，${r.ti.pos}，代表求测主体；用卦：<strong>${r.yong.name}（${r.yong.wx}）</strong>，${r.yong.pos}，代表所占之事。</p>
      <p>当下：<strong>${r.rel.t}</strong> — ${r.rel.say}</p>
    </div>
    <div class="card"><div class="card-title">断卦步骤</div>${r.judge.map(j=>`<p><strong>${j.t}</strong>：${j.s}</p>`).join('')}</div>
    <div class="card"><div class="card-title">三要十应 · 外应参考</div><div class="grid">${WAIYING.slice(0,6).map(w=>`<div><strong>${w.k}</strong>：${w.v}</div>`).join('')}</div></div>`;
  }
  body += `</div>`;
  return body;
}
function meihuaBind() {
  const st = S.meihua;
  app.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { S.meihua = { ...st, method: b.dataset.m, result: null }; render(); }));
  if (st.when) app.querySelector('#mhTime').value = fmtDTLocal(st.when);
  app.querySelector('#mhNow')?.addEventListener('click', () => { S.meihua.when = nowDT(); render(); });
  app.querySelector('#mhCast')?.addEventListener('click', () => {
    let r;
    if (st.method === 'time') {
      const w = parseDT(app.querySelector('#mhTime').value) || nowDT();
      S.meihua.when = w;
      r = mhByTime(w);
    } else if (st.method === 'numbers') {
      const raw = app.querySelector('#mhNums').value;
      const nums = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      r = mhByNumbers(nums.length ? nums : [1]);
    } else if (st.method === 'chars') {
      const ch = app.querySelector('#mhChars').value;
      r = mhByChars(ch, nowDT());
    } else {
      r = mhByRandom();
    }
    S.meihua.result = r;
    render();
  });
}

/* ===================== 奇门遁甲 ===================== */
function qimenHTML() {
  const st = S.qimen;
  let body = `
  <div class="page">
    <h1>奇门遁甲</h1>
    <p class="subtitle">时家奇门转盘法：定节气 → 拆补定局 → 布地盘三奇六仪 → 值符值使 → 天盘九星、人盘八门、神盘八神。参考《奇门遁甲入门讲义》。</p>
    <div class="card">
      <div class="form-inline">
        <div class="form-row"><label class="form-label">公历时间</label><input type="datetime-local" id="qmTime"></div>
        <button class="btn btn-secondary" style="color:var(--ink);border-color:var(--line-dark);margin-bottom:14px" id="qmNow">用现在</button>
      </div>
      <div class="form-row"><label class="form-label">所问之事（可选）</label><input id="qmQuestion" placeholder="如：问出行吉凶"></div>
      <button class="btn btn-primary" id="qmCast">排盘</button>
    </div>`;
  if (st.result) {
    const r = st.result;
    const order = [4,9,2,3,5,7,8,1,6]; // 视觉九宫顺序：左上、上、右上、左、中、右、左下、下、右下
    const cells = order.map(pos => {
      const star = r.starAt[pos]?.name || (pos===5?'天禽':'？');
      const door = r.doorAt[pos]?.name || (pos===5?'寄坤二':'？');
      const spirit = r.spiritAt[pos]?.name || (pos===5?'值符寄':'—');
      return `<div class="qm-cell ${pos===5?'center':''}">
        <div class="qm-pos">${POS_NAME[pos]}</div>
        <div class="qm-star">${star}</div>
        <div class="qm-door">${door}</div>
        <div class="qm-spirit">${spirit}</div>
        <div>地<span class="qm-stem">${r.dipan[pos]}</span> 天<span class="qm-tian">${r.tianPan[pos]}</span></div>
      </div>`;
    }).join('');
    body += `
    <div class="card" style="text-align:center">
      <div style="font-size:20px;font-weight:700;margin-bottom:6px">${r.when.year.gz}年 ${r.when.month.gz}月 ${r.when.day.gz}日 ${r.when.hour.gz}时</div>
      <div class="subtitle">${r.term.name} · ${r.yuan} · ${r.dun}遁${r.ju}局 · 旬空${r.kong.join('')}</div>
      <div class="subtitle">值符${r.zhiFu.star}（遁${r.zhiFu.yi}）落${POS_NAME[r.zhiFu.starAt]} · 值使${r.zhiShi.door}落${POS_NAME[r.zhiShi.pos]}</div>
    </div>
    <div class="qimen-board">${cells}</div>
    <div class="card"><div class="card-title">占断要点</div>${r.tip.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
  }
  body += `</div>`;
  return body;
}
function qimenBind() {
  const st = S.qimen;
  if (st.when) app.querySelector('#qmTime').value = fmtDTLocal(st.when);
  app.querySelector('#qmNow')?.addEventListener('click', () => { S.qimen.when = nowDT(); render(); });
  app.querySelector('#qmCast')?.addEventListener('click', () => {
    const w = parseDT(app.querySelector('#qmTime').value) || nowDT();
    const q = app.querySelector('#qmQuestion').value;
    S.qimen = { when: w, result: qmPaipan(w, q) };
    render();
  });
}

/* ===================== 书库 ===================== */
function libraryHTML() {
  const refs = [
    { t: '《周易》本经', d: '六十四卦原文与十翼，一切术数的源头。' },
    { t: '张延生《易学入门》《易学应用》', d: '从象数思维理解八卦万物类象，去神秘化的现代讲解。' },
    { t: '野鹤老人《增删卜易》', d: '六爻实战经典，强调「野鹤老人」经验与用神、日辰、动变。' },
    { t: '《卜筮正宗》', d: '六爻启蒙与正宗装卦法，六亲、六神、世应、旬空月破。' },
    { t: '《火珠林》', d: '京房纳甲法源头之一，奠定后世六爻装卦基础。' },
    { t: '贾双萍《梅花易数预测学》', d: '现代整理梅花易数体用、万物类象、外应三要十应。' },
    { t: '《奇门遁甲入门讲义》', d: '转盘奇门基础：三奇六仪、九星八门八神、拆补定局。' }
  ];
  return `
  <div class="page">
    <h1>书库</h1>
    <p class="subtitle">本站内容参考以下传统典籍与现代整理本，供进一步研习。</p>
    <div class="grid">${refs.map(r=>`<div class="card"><div class="card-title">${esc(r.t)}</div><p>${esc(r.d)}</p></div>`).join('')}</div>
  </div>`;
}

/* ===================== 路由 ===================== */
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const params = {};
  if (qs) {
    qs.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }
  return { path, params, raw };
}

function render() {
  const { path, params } = parseHash();
  setNav(path);
  window.scrollTo(0, 0);
  let html = '', bind = null;
  switch (path) {
    case '/': html = homeHTML(); bind = homeBind; break;
    case '/learn': html = learnHTML(); bind = learnBind; break;
    case '/lesson': html = lessonHTML(); bind = lessonBind; break;
    case '/demo': html = demoHTML(); bind = demoBind; break;
    case '/scan': html = scanHTML(); bind = scanBind; break;
    case '/atlas': html = atlasHTML(); bind = atlasBind; break;
    case '/detail': html = detailHTML(params.n); bind = () => detailBind(params.n); break;
    case '/basic': html = basicHTML(); bind = null; break;
    case '/trigram': html = trigramHTML(); bind = trigramBind; break;
    case '/liuyao': html = liuyaoHTML(); bind = liuyaoBind; break;
    case '/meihua': html = meihuaHTML(); bind = meihuaBind; break;
    case '/qimen': html = qimenHTML(); bind = qimenBind; break;
    case '/library': html = libraryHTML(); bind = null; break;
    default: html = homeHTML(); bind = homeBind;
  }
  app.innerHTML = html;
  if (bind) bind();
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
