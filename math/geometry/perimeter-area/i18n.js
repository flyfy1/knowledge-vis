'use strict';
/* ============================================================
   周长 vs 面积 · 绳子和地砖 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '周长 vs 面积 · 绳子和地砖 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '周长 vs 面积 · 绳子和地砖',
    tagline: '一根 24 米的绳子围菜园，怎么围，里面的地一样大吗？这一页专治一个最常见的混淆：周长和面积不是一回事——周长是绕一圈的绳子长，面积是里面铺的地砖数。同一根绳子，围得越扁面积越小；反过来面积一样，绳子却能差出一倍多。',
    nav0: '0 绳子围地', nav1: '1 面积账本', nav2: '2 同面积 · 不同周长', nav3: '3 自测', nav4: '4 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 周长与面积 Perimeter & Area —— 一步一交互系列',

    s0k: '第 0 步 · 绳子围地',
    s0t: '一根绳子围地：周长不变，面积在变',
    s0e: '这一步要回答：<strong>周长一样，面积就一样吗？</strong>一根 <strong>24 米</strong>的绳子围一个长方形菜园。先把两个词分清：<strong>周长</strong>是绕图形一周的长度——就是这根绳子的长；<strong>面积</strong>是图形里面的大小——按 1 米 × 1 米的方格地砖来数，铺满要多少块。拖动右下角的圆点（或拉滑杆）改变长和宽，看着绳子账和地砖账各自动什么。',
    s0lenLab: '长（米）',
    s0rope: '绳子账（周长）：{l} + {w} + {l} + {w} = <b>{p} 米</b>——长和宽怎么变，四条边加起来永远是这根绳子的 {p} 米。',
    s0area: '地砖账（面积）：{l} × {w} = <b>{a} 平方米</b>，里面正好铺了 {a} 块 1 米见方的地砖。',
    s0explore: '它还能更大吗？往正方形方向挪一挪，看面积怎么涨——顶在哪儿，先自己找找。',
    s0vs: '这个围法离最大面积 {max} 平方米还差 {d} 平方米。往正方形方向挪一挪，看面积怎么涨。',
    s0square: '正方形！长 = 宽 = 6 米时面积达到 <b>{max} 平方米</b>——同一根绳子能围出的最大一块地。',
    s0hint: '看仔细：拖动时<strong>绳子账纹丝不动</strong>（周长只管一圈有多长），<strong>地砖账上蹿下跳</strong>（面积管里面有多大）。两个量各管各的——这是这一页的全部秘密。',
    c0title: '面积 {a} 平方米',
    cLen: '长 {v} 米', cWid: '宽 {v} 米', cDrag: '拖我',

    s1k: '第 1 步 · 面积账本',
    s1t: '11 种围法一字排开：面积先升后降',
    s1e: '这一步要回答：<strong>24 米绳子的所有围法里，哪一种面积最大？</strong>长只能取整数米，从 1 到 11 共 11 种围法，全列在账本里：周长（绕一圈的绳子长）一列纹丝不动，面积（里面的地砖数）一列先升后降。点任意一行（或点上面的柱子），第 0 步的菜园会跟着变。',
    thL: '长（米）', thW: '宽（米）', thP: '周长（米）', thA: '面积（平方米）',
    s1ro: '现在选中的是长 {l} 米、宽 {w} 米：周长 {p} 米，面积 <b>{a} 平方米</b>。',
    s1roPeak: '长 6 米、宽 6 米——正方形！周长还是 {p} 米，面积 <b>{a} 平方米</b>，是 11 种围法里的最大。',
    s1hint: '规律是账本自己讲出来的：长和宽<strong>越接近，面积越大</strong>；长 = 宽（正方形）时达到顶峰。注意口径：这里只列了整数米的长方形——结论其实对一切长方形都成立，但这一页只给你看整数的证据。',
    c1title: '每种围法的面积（平方米）',

    s2k: '第 2 步 · 反过来',
    s2t: '面积一样，周长一样吗？',
    s2e: '这一步要回答：<strong>面积相同，周长就相同吗？</strong>把条件反过来钉住：面积（里面的地砖数）固定为 <strong>24 平方米</strong>，整数边长只有四种围法。逐个切换，看下面四根「绳子条」——它们按周长（绕一圈的长度）成比例画出，选哪种就亮哪根。',
    s2lab: '选一种围法：',
    s2ro: '面积：{l} × {w} = <b>24 平方米</b>（四种围法都一样）；周长：2 ×（{l} + {w}）= <b>{p} 米</b>。',
    s2roDiff: '四种围法面积全是 24 平方米，周长却从 {min} 米到 {max} 米——最扁的那块地，绕一圈要多走 {d} 米。面积相同，周长可以差很远。',
    s2hint: '为什么越扁周长越长？面积钉死时，压扁一头就要拉长另一头，而<strong>周长数的是两条长边加两条宽边</strong>，拉长的那头在账上要出现两次。两个量各管各的账，谁也代替不了谁。',
    c2area: '面积 24 平方米',
    c2rope: '周长 {p} 米',

    s3k: '第 3 步 · 自测',
    s3t: '先分清：比的是一圈，还是里面',
    s3e: '这一步要回答：<strong>你会不会把周长和面积搞混？</strong>两道题，都不用计算器——用前面几步的图和账本就能判。',
    s3q1: '判断题：两个图形周长相等，它们的面积一定相等。',
    s3q1a: '一定相等', s3q1b: '不一定',
    s3counterShow: '显示反例',
    s3counterAgain: '重现反例',
    s3q1win: '答对了——<b>不一定</b>！看下面的反例：同样是 24 米的绳子（周长相等），11 × 1 的地只有 11 平方米，6 × 6 的地有 36 平方米，面积差了 25 平方米。',
    s3q1winFixed: '改对了——<b>不一定</b>！看下面的反例：同样是 24 米的绳子（周长相等），11 × 1 的地只有 11 平方米，6 × 6 的地有 36 平方米，面积差了 25 平方米。',
    s3q1lose: '这题的答案是<b>不一定</b>。看下面的反例：同样 24 米绳子围出的两块地，面积一个 11 平方米、一个 36 平方米——周长相等，面积并不相等。',
    c3idle: '反例会出现在这里：两块周长相等的地并排比',
    c3a: '11 × 1：周长 24 米 · 面积 11 平方米',
    c3b: '6 × 6：周长 24 米 · 面积 36 平方米',
    s3q2: '应用题：20 米篱笆围一个长方形花圃，四边都要围。下面哪种围法面积最大？',
    s3q2o1: '9 米 × 1 米',
    s3q2o2: '6 米 × 4 米',
    s3q2o3: '5 米 × 5 米',
    s3q2o4: '7 米 × 3 米',
    s3q2win: '答对了：<b>5 米 × 5 米</b>，面积 25 平方米。20 米篱笆意味着长 + 宽 = 10 米；四个选项的面积算出来分别是 9、24、25、21 平方米——第 1 步的账本说过，长宽越接近面积越大，两个数完全相等时最大。',
    s3q2lose: '不对。四种围法的周长都是 20 米（长 + 宽都等于 10 米），面积分别是 9、24、25、21 平方米，区别只在长宽有多接近：越接近，面积越大。再试一次。',
    s3q2wall: '挑战口径（答完再看）：如果花圃有一边靠墙，篱笆只围三边，账本就变成 长 + 2 × 宽 = 20——口径和前面不同，答案也会不同。那是另一道题，这一页不展开。',
    s3hint: '两道题的钥匙是同一把：<strong>先问比的是一圈（周长）还是里面（面积）</strong>，再去账本里找证据，别让两个量互相冒充。',

    s4k: '第 4 步 · 终章',
    s4t: '一圈，还是里面',
    s4e: '收束成一句话：<strong>周长量一圈，面积量里面。</strong>下面三块地周长都是 24 米，面积却一个比一个大——这一页的全部内容，都在这张图里了。',
    c4p: '周长 24 米',
    c4a: '面积 {a} 平方米',
    c1h: '周长 = 一圈',
    c1: '周长是绕图形一周的长度，单位是米——像一根绳子、一道篱笆。它只管边界有多长，不管里面装了什么。',
    c2h: '面积 = 里面',
    c2: '面积是图形里面的大小，单位是平方米——像铺地砖、刷油漆。它只管要多少块 1 米见方的格子，不管边界绕多远。',
    c3h: '同绳不同积 · 同积不同绳',
    c3: '周长固定时越接近正方形面积越大（第 0、1 步）；面积固定时越扁周长越长（第 2 步）。两个方向都说明同一件事：这两个量谁也推不出谁。',
    s4fin: '下次再看到「围起来」，先问一句：题目问的是一圈还是里面？问对了，账就不会算错。',
    lkArea: '面积 = 长 × 宽 是从哪来的？去看乘法是面积：点阵变成地砖 →',
    lkFrac: '面积数的「一格」凭什么算数？去看分数：把整体切成等份 →'
  },
  en: {
    docTitle: 'Perimeter vs Area · The Rope and the Tiles — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Perimeter vs Area · The Rope and the Tiles',
    tagline: 'A 24-metre rope fences a garden plot. Reshape it — does the land inside stay the same size? This page untangles the most common mix-up in primary maths: perimeter and area are not the same thing. Perimeter is the rope around the edge; area is the tiles covering the inside. The same rope, pulled flatter, encloses far less — and the same area can need a rope more than twice as long.',
    nav0: '0 One Rope', nav1: '1 The Ledger', nav2: '2 Same Area · New Perimeter', nav3: '3 Quiz', nav4: '4 Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Perimeter & Area —— one interaction at a time',

    s0k: 'Step 0 · One Rope',
    s0t: 'One Rope: the Perimeter Stays, the Area Moves',
    s0e: 'This step answers: <strong>if the perimeter is the same, is the area the same?</strong> A rope <strong>24 metres</strong> long fences a rectangular garden. Two words, kept apart from the start: the <strong>perimeter</strong> is the distance around the shape — the length of this rope; the <strong>area</strong> is the size of the inside — counted in 1 m × 1 m square tiles, as many as it takes to cover the plot. Drag the round handle at the corner (or use the slider) to change the length and width, and watch which ledger moves and which does not.',
    s0lenLab: 'Length (m)',
    s0rope: 'Rope ledger (perimeter): {l} + {w} + {l} + {w} = <b>{p} m</b> — reshape it any way you like, the four sides always add up to this rope’s {p} m.',
    s0area: 'Tile ledger (area): {l} × {w} = <b>{a} m²</b> — exactly {a} one-metre square tiles fit inside.',
    s0explore: 'Could it get bigger? Nudge it toward a square and watch the area climb — find the top yourself first.',
    s0vs: 'This shape is {d} m² short of the maximum {max} m². Nudge it toward a square and watch the area climb.',
    s0square: 'A square! With length = width = 6 m, the area reaches <b>{max} m²</b> — the most land this rope can enclose.',
    s0hint: 'Look closely: while you drag, the <strong>rope ledger never moves</strong> (perimeter only measures the way around), while the <strong>tile ledger jumps up and down</strong> (area measures the inside). Each measures its own thing — that is the whole secret of this page.',
    c0title: 'Area {a} m²',
    cLen: 'length {v} m', cWid: 'width {v} m', cDrag: 'drag',

    s1k: 'Step 1 · The Ledger',
    s1t: 'All 11 Ways in a Row: Area Rises, Then Falls',
    s1e: 'This step answers: <strong>of all the ways to spend a 24 m rope, which gives the most land?</strong> With whole-metre sides there are exactly 11 ways, all listed in the ledger: the perimeter column (the rope around) never changes, while the area column (the tiles inside) rises and then falls. Click any row — or any bar above — and the garden in Step 0 follows.',
    thL: 'Length (m)', thW: 'Width (m)', thP: 'Perimeter (m)', thA: 'Area (m²)',
    s1ro: 'Selected: length {l} m, width {w} m — perimeter {p} m, area <b>{a} m²</b>.',
    s1roPeak: 'Length 6 m, width 6 m — a square! Perimeter still {p} m, area <b>{a} m²</b>, the largest of all 11 ways.',
    s1hint: 'The pattern is spoken by the ledger itself: <strong>the closer the length and width, the larger the area</strong>, peaking when they are equal (a square). Scope note: this page lists whole-metre rectangles as its evidence; the conclusion in fact holds for all rectangles.',
    c1title: 'Area of each way (m²)',

    s2k: 'Step 2 · Flip It Around',
    s2t: 'Same Area — Same Perimeter?',
    s2e: 'This step answers: <strong>if the area is the same, is the perimeter the same?</strong> Now pin the other quantity down: the area (the tiles inside) is fixed at <strong>24 m²</strong>, and whole-metre sides allow exactly four shapes. Switch between them and watch the four “rope bars” below — each is drawn in proportion to its perimeter (the distance around); the one you pick lights up.',
    s2lab: 'Choose a shape:',
    s2ro: 'Area: {l} × {w} = <b>24 m²</b> (the same for all four); perimeter: 2 × ({l} + {w}) = <b>{p} m</b>.',
    s2roDiff: 'All four shapes have area 24 m², yet their perimeters run from {min} m to {max} m — the flattest plot makes you walk {d} m more to get around it. Same area, very different perimeters.',
    s2hint: 'Why does flatter mean longer around? With the area pinned, squashing one side stretches the other — and the <strong>perimeter counts two lengths plus two widths</strong>, so the stretched side is billed twice. Each quantity keeps its own ledger; neither can stand in for the other.',
    c2area: 'Area 24 m²',
    c2rope: 'Perimeter {p} m',

    s3k: 'Step 3 · Quiz',
    s3t: 'First Ask: Around, or Inside?',
    s3e: 'This step answers: <strong>can you keep perimeter and area apart?</strong> Two questions, no calculator needed — the pictures and ledgers from the earlier steps are all the evidence required.',
    s3q1: 'True or false: if two shapes have equal perimeters, their areas must be equal.',
    s3q1a: 'Must be equal', s3q1b: 'Not necessarily',
    s3counterShow: 'Show the counterexample',
    s3counterAgain: 'Show it again',
    s3q1win: 'Correct — <b>not necessarily</b>! Look at the counterexample below: the same 24 m rope (equal perimeters), yet 11 × 1 gives only 11 m² while 6 × 6 gives 36 m² — the areas differ by 25 m².',
    s3q1winFixed: 'That’s the fix — <b>not necessarily</b>! Look at the counterexample below: the same 24 m rope (equal perimeters), yet 11 × 1 gives only 11 m² while 6 × 6 gives 36 m² — the areas differ by 25 m².',
    s3q1lose: 'The answer is <b>not necessarily</b>. Look at the counterexample below: two plots fenced by the same 24 m rope have areas 11 m² and 36 m² — equal perimeters, unequal areas.',
    c3idle: 'The counterexample appears here: two equal-perimeter plots, side by side',
    c3a: '11 × 1: perimeter 24 m · area 11 m²',
    c3b: '6 × 6: perimeter 24 m · area 36 m²',
    s3q2: 'Word problem: a 20 m fence encloses a rectangular flower bed on all four sides. Which shape gives the largest area?',
    s3q2o1: '9 m × 1 m',
    s3q2o2: '6 m × 4 m',
    s3q2o3: '5 m × 5 m',
    s3q2o4: '7 m × 3 m',
    s3q2win: 'Correct: <b>5 m × 5 m</b>, area 25 m². A 20 m fence means length + width = 10 m; the four areas work out to 9, 24, 25 and 21 m² — and Step 1’s ledger said it plainly: the closer the two numbers, the larger the product — largest when they are equal.',
    s3q2lose: 'Not quite. All four shapes have perimeter 20 m (length + width = 10 m in each) and their areas are 9, 24, 25 and 21 m²; they differ only in how close the length and width are — closer means larger area. Try again.',
    s3q2wall: 'Challenge scope (read after answering): if one side of the flower bed is a wall, the fence covers only three sides and the ledger becomes length + 2 × width = 20 — a different scope from the earlier steps, and a different answer. That is another problem, not covered on this page.',
    s3hint: 'Both questions turn on the same key: <strong>ask first whether it is the way around (perimeter) or the inside (area)</strong>, then find the evidence in the ledger — never let one quantity impersonate the other.',

    s4k: 'Step 4 · Finale',
    s4t: 'Around, or Inside',
    s4e: 'It all compresses into one sentence: <strong>perimeter measures the way around; area measures the inside.</strong> The three plots below are all fenced by the same 24 m rope, yet their areas keep growing — everything on this page is in this one picture.',
    c4p: 'Perimeter 24 m',
    c4a: 'Area {a} m²',
    c1h: 'Perimeter = the Way Around',
    c1: 'Perimeter is the distance around a shape, in metres — like a rope or a fence. It only cares how long the boundary is, never what is inside it.',
    c2h: 'Area = the Inside',
    c2: 'Area is the size of the inside, in square metres — like tiling a floor or painting a wall. It only counts how many 1 m squares fit, never how far the boundary runs.',
    c3h: 'Same Rope, New Area · Same Area, New Rope',
    c3: 'Fix the perimeter and the squarer shape wins (Steps 0–1); fix the area and the flatter shape runs longer around (Step 2). Both directions say the same thing: neither quantity can be deduced from the other.',
    s4fin: 'Next time a problem says “fence it in” or “cover it up”, ask first: is it asking about the way around, or the inside? Ask the right question and the ledger cannot go wrong.',
    lkArea: 'Where does area = length × width come from? See Multiplication Is Area: dots grow into tiles →',
    lkFrac: 'Why does one grid cell count as a unit? See Fractions: cutting a whole into equal parts →'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
