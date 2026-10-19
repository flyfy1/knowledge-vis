'use strict';
const STR = {
  "zh": {
    "docTitle": "乘法是面积 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "乘法是面积",
    "tagline": "乘法不是背出来的口诀，是数出来的面积：一块长方形地有几行几列，方格总数就是乘积。这一页把交换律、分配律、两位数竖式，全还原成同一块地的转法与切法。",
    "foot": "乘法是面积 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互图；操作方法见上方说明",
    "nav0": "0 点阵数不清",
    "nav1": "1 点阵变面积",
    "nav2": "2 切一刀",
    "nav3": "3 四块地",
    "nav4": "4 面积找边长",

    "s0k": "第 0 步",
    "s0t": "点阵太多数不清：乘法是数总数的捷径",
    "s0e": "这一步要回答：4 × 6 的得数 24，到底在数什么？这片点阵排成整齐的行列——<strong>行</strong>是横排、<strong>列</strong>是竖排——总数就是点的个数。先用滑杆（或直接在画布上拖）改行数和列数，看读数里的公式；再点「逐个点一遍」，一个一个把点数完，和公式给的总数对一对。这一步只有点，还没有连成面。",
    "s0rowLab": "行数（横排）",
    "s0colLab": "列数（竖排）",
    "s0countBtn": "逐个点一遍",
    "s0ro": "点阵 {r} {rw} × {c} {cw}：公式一眼给出总数 {r} × {c} = {n}。",
    "s0counting": "一个一个数：已数 {k} / {n}……",
    "s0countDone": "数完了，一共点了 {n} {tw}——和公式 {r} × {c} = {n} 一模一样。逐个点数太慢，公式一眼就是答案：乘法是数总数的捷径，前提是排成整齐的行列、每行一样多。",

    "s1k": "第 1 步",
    "s1t": "点阵变成地：乘法就是面积",
    "s1e": "这一步要回答：点连成面之后，乘法在量什么？把每个点撑成一个小方格，点阵就长成了一块长方形的地。<strong>面积</strong>（area）就是这块地占了多少个方格；1 个方格记作 1 平方单位。用滑杆改长 a 和宽 b，看面积读数 S = a × b 怎样跟着变；再点「转个方向」，把整块地旋转 90°，盯住方格总数——看它变不变。",
    "s1aLab": "长 a（横边，单位：格）",
    "s1bLab": "宽 b（竖边，单位：格）",
    "s1rotBtn": "转个方向（旋转 90°）",
    "s1ro": "a = {a}，b = {b} → 面积 S = a × b = {a} × {b} = {s}（单位：方格）。",
    "s1roRot": "转了个方向：a、b 互换成 {a} × {b}，面积还是 {s} {sq}——同一块地，方格一块没多、一块没少。这就是交换律：a × b = b × a。它不是谁规定的，是同一块地换个方向看。",

    "s2k": "第 2 步",
    "s2t": "切一刀：难算的乘法拆成两块好算的",
    "s2e": "这一步要回答：13 × 7 这种不好直接算的乘法，怎么算得又快又对？整块地是 13 列 × 7 行。拖动画布上的竖切线（或用滑杆），把地切成左右两块，分别数两块的面积再相加。盯住三件事：左块、右块、总和——切线走到哪，总和都不许变。这种「切开分别算、再相加」的办法叫<strong>分配律</strong>（distributive law）：切在 10 处，就是 (10 + 3) × 7 = 10 × 7 + 3 × 7。",
    "s2cutLab": "切线位置（在第几列后切开）",
    "s2leftT": "左块",
    "s2rightT": "右块",
    "s2leftRO": "{w} {cw} × 7 行 = {v} 格",
    "s2rightRO": "{w} {cw} × 7 行 = {v} 格",
    "s2total": "两块相加：{l} + {r} = {sum}；整块算：13 × 7 = {sum}。切线拖到哪，总和都不变。",
    "s2best": "现在切线停在整十处（切在 10 列后）：10 × 7 = 70 一眼便知——切在哪都对，切出整十最好算。",

    "s3k": "第 3 步",
    "s3t": "两位数 × 两位数：一块地切成四块",
    "s3e": "这一步要回答：12 × 13 的竖式，为什么算出来是对的？把 12 拆成 10 + 2、13 拆成 10 + 3（整十加零头），横竖各切一刀，地就被切成四块。切线停在 10，是因为整十那部分最好算。点「逐块点亮算一遍」，一块一块看面积；最后对照竖式账——<strong>竖式</strong>就是把乘法列成一列、分步写下来的算法，它的每一步其实都在算其中一块或几块地。",
    "s3aLab": "第一个数（地的宽）",
    "s3bLab": "第二个数（地的高）",
    "s3lightBtn": "逐块点亮算一遍",
    "s3roIdle": "{m} = 10 + {a2}，{n} = 10 + {b2}：横竖各一刀，四块地等你逐块点亮。",
    "s3roLit": "已点亮 {k} / 4 块 · 已点亮面积小计 {sum} 格。",
    "s3roDone": "四块面积：{p1} + {p2} + {p3} + {p4} = {sum}。所以 {m} × {n} = {sum}。",
    "s3vert": "对照竖式：{n} 的个位是 {b2}，{m} × {b2} = {g1}（下排两块 {pb1} + {pb2}）；{n} 的十位是 1，{m} × 10 = {g2}（上排两块 {pt1} + {pt2}）；{g1} + {g2} = {sum}。竖式不是仪式，每一步都在算一块地的面积。",

    "s4k": "第 4 步",
    "s4t": "反过来：知道面积，找边长",
    "s4e": "这一步要回答：只告诉你面积是 24，长和宽可能是多少？拖「试边长」滑杆，把宽从 1 试到 12，画布会照这个宽去拼面积 24 的长方形：正好拼满，就是一组答案；拼不满（最后一行缺格），这个宽就被淘汰。整数答案一共只有四组，试着把它们集齐。乘起来正好等于 24 的两个边长，成对出现，叫<strong>因数对</strong>（factor pair）。",
    "s4wLab": "试边长：宽 w",
    "s4roFound": "宽 {w}、高 {h}：正好拼满，{w} × {h} = 24 ✓ 这是一对因数：{pair}。",
    "s4roAgain": "宽 {w}、高 {h} 也拼得满——不过这对 {pair} 和之前找到的是同一对，只是把地转了个方向，已经记下了。",
    "s4roMiss": "宽 {w}：每行 {w} 格，摆满 {full} 行用掉 {used} 格，还剩 {rem} 格，最后一行缺 {gap} 格——拼不成整齐的长方形，{w} 不是 24 的因数。",
    "s4prog": "因数对收集：已找到 {k} / 4 对。",
    "s4done": "四对集齐！面积 24 的整边长方形只有这四种：1×24、2×12、3×8、4×6。乘积等于 24 的两个数互为因数——因数总是成对出现，一个当宽、一个当高。",
    "s4qT": "自测：14 × 6 = ?",
    "s4qE": "别急着列竖式：把 14 切成 10 + 4，就是两块地 10 × 6 和 4 × 6（图里的竖线就切在 10 处）。先选一个答案，再点「揭晓解析」——答对了才看得到解析。",
    "s4reveal": "揭晓解析",
    "s4qIdle": "还没选答案：先点一个数字，再揭晓。",
    "s4qWrong": "还不对。提示：10 × 6 = 60，4 × 6 = 24，两块加起来是多少？换一个答案再试。",
    "s4qRight": "答对了！解析：14 × 6 = 10 × 6 + 4 × 6 = 60 + 24 = 84。这正是第 2 步「切一刀」的分配律——切在哪都行，切出整十最好算。",
    "s4fin": "这一页从头到尾只讲一件事：乘法的得数，是在数一块长方形地的面积。交换律是把同一块地转个方向看，分配律是把同一块地切开算，竖式是把四块地排队算账。带着这块地，继续往下走：",
    "lkFrac": "整体与部分：去分数页看一个整体怎样切成等份、取其中几份 →",
    "lkPyth": "面积还能当证明用：勾股页第 2 步用两种数法数同一块大正方形，证出 a² + b² = c² →"
  },
  "en": {
    "docTitle": "Multiplication Is Area · One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "Multiplication Is Area",
    "tagline": "Multiplication is not a chant to memorise — it is an area counted in unit squares: give a rectangle its rows and columns, and the total number of squares is the product. On this page the commutative law, the distributive law and two-digit vertical multiplication all turn out to be ways of turning or cutting one and the same plot of land.",
    "foot": "Multiplication Is Area · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive diagram for this step; instructions appear above",
    "nav0": "0 Too Many Dots",
    "nav1": "1 Dots Become Area",
    "nav2": "2 One Cut",
    "nav3": "3 Four Plots",
    "nav4": "4 From Area to Sides",

    "s0k": "Step 0",
    "s0t": "Too many dots to count: multiplication is the shortcut",
    "s0e": "Question: what does the answer 24 in 4 × 6 actually count? This array is laid out in neat rows and columns — a <strong>row</strong> runs sideways, a <strong>column</strong> runs up and down — and the total is simply the number of dots. First change the rows and columns with the sliders (or drag on the canvas) and watch the formula in the readout; then press “Count them one by one” and count every dot, and compare with the total the formula gives. In this step there are only dots — nothing has grown into a surface yet.",
    "s0rowLab": "Rows (sideways)",
    "s0colLab": "Columns (up and down)",
    "s0countBtn": "Count them one by one",
    "s0ro": "An array of {r} {rw} × {c} {cw}: the formula gives the total at a glance, {r} × {c} = {n}.",
    "s0counting": "Counting one by one: {k} / {n} so far…",
    "s0countDone": "Finished — {n} {tw} in all, exactly the formula's {r} × {c} = {n}. Counting one by one is slow; the formula answers at a glance. Multiplication is the shortcut for counting a total — as long as the dots form neat rows and columns with the same number in every row.",

    "s1k": "Step 1",
    "s1t": "Dots become land: multiplication is area",
    "s1e": "Question: once the dots grow into a surface, what is multiplication measuring? Stretch every dot into a small square and the array becomes a rectangular plot of land. Its <strong>area</strong> is how many unit squares the plot covers; one square counts as 1 square unit. Move the sliders for length a and width b and watch the area readout S = a × b follow; then press “Turn it around” to rotate the whole plot by 90° — keep your eyes on the total number of squares and see whether it changes.",
    "s1aLab": "Length a (horizontal side, in squares)",
    "s1bLab": "Width b (vertical side, in squares)",
    "s1rotBtn": "Turn it around (rotate 90°)",
    "s1ro": "a = {a}, b = {b} → area S = a × b = {a} × {b} = {s} (unit: squares).",
    "s1roRot": "Turned around: a and b have swapped to {a} × {b}, and the area is still {s} {sq} — the same plot, not one square more or less. That is the commutative law: a × b = b × a. Nobody decreed it; it is one plot seen from two directions.",

    "s2k": "Step 2",
    "s2t": "One cut: split a hard product into two easy plots",
    "s2e": "Question: how do you work out a product like 13 × 7 quickly and correctly? The whole plot is 13 columns × 7 rows. Drag the vertical cut line on the canvas (or use the slider) to split the land into a left and a right plot, count each plot's area, and add them. Watch three numbers — left, right, total: wherever the cut goes, the total must not change. This “cut, compute separately, then add” method is the <strong>distributive law</strong>: cut at 10, it reads (10 + 3) × 7 = 10 × 7 + 3 × 7.",
    "s2cutLab": "Cut position (after which column)",
    "s2leftT": "Left plot",
    "s2rightT": "Right plot",
    "s2leftRO": "{w} {cw} × 7 rows = {v} squares",
    "s2rightRO": "{w} {cw} × 7 rows = {v} squares",
    "s2total": "Add the two plots: {l} + {r} = {sum}; the whole plot at once: 13 × 7 = {sum}. Drag the cut anywhere — the total never changes.",
    "s2best": "The cut is now at the round ten (after column 10): 10 × 7 = 70 is obvious at a glance — any cut is correct, but cutting out a round ten is the easiest to compute.",

    "s3k": "Step 3",
    "s3t": "Two digits × two digits: one plot in four pieces",
    "s3e": "Question: why does the vertical algorithm for 12 × 13 give the right answer? Split 12 into 10 + 2 and 13 into 10 + 3 (a round ten plus a remainder), cut once vertically and once horizontally, and the land falls into four plots. The cuts sit at 10 because the round-ten part is the easiest to compute. Press “Light up the plots one by one” and read each area; then compare with the vertical ledger — <strong>vertical multiplication</strong> is just the written, step-by-step algorithm, and every step of it computes one or a few of these plots.",
    "s3aLab": "First number (plot width)",
    "s3bLab": "Second number (plot height)",
    "s3lightBtn": "Light up the plots one by one",
    "s3roIdle": "{m} = 10 + {a2} and {n} = 10 + {b2}: one vertical and one horizontal cut — four plots are waiting to be lit.",
    "s3roLit": "Lit {k} / 4 plots · running total of lit area: {sum} squares.",
    "s3roDone": "The four areas: {p1} + {p2} + {p3} + {p4} = {sum}. So {m} × {n} = {sum}.",
    "s3vert": "Match the vertical algorithm: the ones digit of {n} is {b2}, and {m} × {b2} = {g1} (the bottom two plots, {pb1} + {pb2}); the tens digit of {n} is 1, and {m} × 10 = {g2} (the top two plots, {pt1} + {pt2}); {g1} + {g2} = {sum}. Vertical multiplication is no ritual — every step computes the area of a plot.",

    "s4k": "Step 4",
    "s4t": "Backwards: given the area, find the sides",
    "s4e": "Question: if all you are told is that the area is 24, what could the length and width be? Drag the “try a side” slider to test widths from 1 to 12; the canvas tries to tile a rectangle of area 24 with that width. If it tiles exactly, you have found an answer; if it cannot (the last row is left with gaps), that width is ruled out. There are only four integer answers — try to collect them all. Two side lengths whose product is exactly 24 always show up as a pair: a <strong>factor pair</strong>.",
    "s4wLab": "Try a side: width w",
    "s4roFound": "Width {w}, height {h}: it tiles exactly, {w} × {h} = 24 ✓ A factor pair: {pair}.",
    "s4roAgain": "Width {w}, height {h} also tiles — but this pair, {pair}, is one you already found, just with the plot turned around. It is already recorded.",
    "s4roMiss": "Width {w}: {w} squares per row, and {full} full rows use {used} squares. {rem} squares are left over — {gap} short of completing the last row — so they cannot form a tidy rectangle, and {w} is not a factor of 24.",
    "s4prog": "Factor pairs collected: {k} / 4.",
    "s4done": "All four pairs collected! A rectangle of area 24 with integer sides comes in only four shapes: 1×24, 2×12, 3×8, 4×6. Two numbers whose product is 24 are factors of each other — factors always arrive in pairs, one as the width and one as the height.",
    "s4qT": "Quiz: 14 × 6 = ?",
    "s4qE": "Don't reach for the vertical algorithm yet: cut 14 into 10 + 4, giving two plots, 10 × 6 and 4 × 6 (the vertical line in the picture cuts at 10). Pick an answer first, then press “Reveal the working” — the working is shown only if you are right.",
    "s4reveal": "Reveal the working",
    "s4qIdle": "No answer picked yet: choose a number first, then reveal.",
    "s4qWrong": "Not yet. Hint: 10 × 6 = 60 and 4 × 6 = 24 — what do the two plots add up to? Pick another answer and try again.",
    "s4qRight": "Correct! The working: 14 × 6 = 10 × 6 + 4 × 6 = 60 + 24 = 84. This is exactly the distributive law from Step 2's single cut — any cut works, and cutting out a round ten is the easiest.",
    "s4fin": "This whole page has made one point: the answer to a multiplication is the area of a rectangular plot, counted in squares. The commutative law is the same plot turned around, the distributive law is the same plot cut apart, and vertical multiplication is the four plots computed in an orderly queue. Take the plot with you and keep going:",
    "lkFrac": "The whole and its parts: on the fractions page, see how one whole is cut into equal parts and some of them are taken →",
    "lkPyth": "Area can also prove things: step 2 of the Pythagoras page counts one big square in two ways to prove a² + b² = c² →"
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
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
