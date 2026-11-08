'use strict';
const STR = {
  "zh": {
    "docTitle": "勾股定理 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "勾股定理",
    "tagline": "给你直角三角形的两条边，怎样求第三条？从 3、4、5 出发，用面积证明，再拖动、判角、量距离。这里的图都是数学模型，不是现实测量。",
    "foot": "勾股定理 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互几何图；操作方法见上方说明",
    "guessAll": "每个直角三角形都成立",
    "guessOnly": "只是 3-4-5 的巧合",
    "guessIdle": "先选一个猜测，再逐组验算。",
    "guessEcho": "你的猜测：{guess}。已打开 {n}/3 组；首次验算后猜测锁定。这里只检验例子，下一步继续追问原因。",
    "right": "直角",
    "acute": "锐角",
    "obtuse": "钝角",
    "notRight": "非直角三角形",
    "pour": "倒过去：逐格填入大正方形",
    "fillRO": "进度 {pct}% · 已流入 {n}/25 平方单位；a² = 9，b² = 16，c² = 25。",
    "fillDone": "9 + 16 = 25，一格不差。",
    "source": "原来的两块面积",
    "target": "流入 c² 的格子",
    "piece": "拼一步：保留已摆的三角形",
    "aLab": "直角边 a（长度单位）",
    "bLab": "直角边 b（长度单位）",
    "proofRO": "拼图 {k}/4 · a = {a}，b = {b}，c ≈ {c}；大正方形边长 a+b = {L}。",
    "book1": "数法一 · 整块展开",
    "book2": "数法二 · 三角形与中间",
    "bookWait": "此栏仅为已放三角形的面积小计，尚不是大正方形总面积；拼满后再比较两栏。",
    "proofDone": "两栏扣去相同的 2ab：a² + b² = c²，即 {aa} + {bb} = {cc}。中间四边都长 c，相邻的两个锐角（各小于 90°）之和为 90°，所以中间确实是正方形。",
    "unlock": "松开直角（改成自由三角形）",
    "geomRO": "当前 a = {a}，b = {b}；面积 a² = {aa}，b² = {bb}，c² = {cc}（平方单位）。",
    "measure": "尺子直量 c（图上两端坐标距离）≈ {c}",
    "root": "开方 √(a²+b²) ≈ {c}",
    "diff": "两路长度差 ≈ {d}；{rel}，R 处：{kind}。",
    "degenerate": "边长为 0 或三点共线，图形退化；此时不构成三角形。",
    "xLab": "顶点横位置（键盘可调）",
    "yLab": "顶点纵位置（键盘可调）",
    "choose": "先判断，再揭晓",
    "reveal": "揭晓并计分",
    "next": "下一题",
    "quizSides": "本题三边 {a}、{b}、{c}；最长边记作 c。",
    "quizGuess": "你的判定：{g}。",
    "quizResult": "真值：{kind}。c² = {cc}，a²+b² = {sum}，差值 c²−(a²+b²) = {diff}。{result}",
    "correct": "答对了。",
    "incorrect": "这题未答对，按两数比较再看一次。",
    "score": "答了 {n} 题，对 {k} 题。",
    "dLab": "梯底离墙 d（m）",
    "ladderRO": "d = {d} m；高度 h = √(25−{dd}) ≈ {h} m。",
    "ladderWarn": "接近 5 m：高度趋 0；这是几何极限，不是安全使用梯子的建议。",
    "distanceRO": "P = (1, 1)，Q = ({x}, {y})；Δx = {dx}，Δy = {dy}；直线距离 ≈ {c} 个长度单位。",
    "wall": "墙",
    "ground": "地面",
    "ladder": "5 m 梯子",
    "kLab": "倍数 k（每个新值留一行）",
    "unitTriangle": "点开 1-1 直角三角形",
    "irrational": "两直角边都是 1，斜边 c = √2 ≈ 1.414…（√2 是平方为 2 的非负数）；它的小数写不尽也不循环，不能写成整数之比。这叫无理数，但数轴上位置确切。",
    "irrIdle": "整数只是特例。点开 1-1 三角形，看看斜边是否仍是整数。",
    "history": "已保留 {n} 行精确整数验算。",
    "family": "族 / 三边",
    "check": "平方和验算",
    "linkTrig": "单位圆：cos²θ + sin²θ = 1 怎样由勾股定理得到 →",
    "linkFractions": "分数的三张脸：对照 √2 为什么不在其中（本站此处解释）→",
    "linkEigen": "向量是一根箭头：拖动 v，看看矩阵怎样改变它 →",
    "nav0": "0 3、4、5 的巧合？",
    "s0k": "第 0 步",
    "s0t": "3、4、5 的巧合？",
    "s0e": "这一步要回答：3²+4²=5² 是巧合吗？已知三组边长，先猜再点开验算 a²、b²、c²（各数乘自己）。直角是 90° 的角；直角边 a、b 是夹住它的两边，斜边 c 是对着它的最长边。第三组不是直角三角形；这一步只积累例子，不作普遍结论。图上小方框标直角，数字是边长，单位相同。",
    "nav1": "1 用面积看",
    "s1k": "第 1 步",
    "s1t": "用面积看：两个小正方形装满一个大正方形",
    "s1e": "这一步要回答：三个平方数真是三块面积吗？沿用 3-4-5，a、b 是夹着直角的边，c 是对面的斜边。平方的几何意义是边长×边长的正方形面积。一格为 1 平方单位；青色 a²=9、橙色 b²=16、斜置的目标 c²=25。保持边长不变，点「倒过去」，看原格子变空、目标逐格装满，再对照进度和面积。这是面积等量的演示，下一步才证明一般情况。",
    "nav2": "2 拼图证明",
    "s2k": "第 2 步",
    "s2t": "拼图证明：同一块大正方形，两种数法",
    "s2e": "这一步要回答：不用量边，为什么任意直角三角形都成立？a、b 是夹住直角的边，斜边 c 对着直角；全等就是一模一样、可以重合。按四次「拼一步」，保留四块全等三角形；每块面积 ab/2，中间留下边长 c 的正方形。读两栏账本，再扣掉两边相同的面积。滑杆只改边长，已放的块保留并重算。验算只管试过的数，证明说明所有 a、b>0 都成立的原因。",
    "nav3": "3 拖着验证",
    "s3k": "第 3 步",
    "s3t": "拖着验证：怎么拖都等？",
    "s3e": "这一步要回答：拖动直角顶点，等式还成立吗？a、b 是顶点 R 两侧的边，c 是另外两端之间的边；平方根 √ 就是反过来问「哪个非负数的平方等于它」。先保持直角，拖图中橙点 R（或调横、纵位置），看面积与两路 c 并排对账。尺子读数来自图上两端坐标距离，开方读数来自 a²+b²，均是模型计算，非实物测量。开启「松开直角」时仍保留原图形；之后两端固定，只拖 R，两数不再保证相等。对非退化三角形，R 处偏离 90° 时两数不相等；锐角小于 90°，钝角大于 90°。淡点保留访问位置，图中三块小正方形按当前面积同比例画出。读数保留两位小数；极小的非零差值可能显示为 0.00，角的判定使用未舍入的坐标。",
    "nav4": "4 反过来判",
    "s4k": "第 4 步",
    "s4t": "反过来判：给三边，判角",
    "s4e": "这一步要回答：只给三边，怎么判角？先确认两短边之和大于最长边，再把最长边叫 c，另两边叫 a、b。逆定理就是反过来说：a²+b²=c² 也能保证有直角；若 c² 更大则最大角为钝角（>90°），更小则全是锐角（<90°）。先选判定再揭晓，比较的是这组三边的平方、单位相同；差值为 0、正、负分别对应直、钝、锐，不是越大越好。下一题才解锁选项。",
    "nav5": "5 拿去用",
    "s5k": "第 5 步",
    "s5t": "拿去用：梯子、屏幕与两点距离",
    "s5e": "这一步要回答：知道斜边和一条直角边，另一条怎么求？直角边夹住 90°，斜边在对面；开方 √ 取平方的非负逆运算。模型一把墙与地面当直角，梯长 5 m，改底距 d，看高度 √(25−d²)；屏幕的宽、高、对角线也是同一关系。模型二横轴 x 向右、纵轴 y 向上，一格 1 单位；固定 P=(1,1)，拖 Q 或调坐标，看横差 Δx、纵差 Δy 与直线距离同步。距离公式就是勾股定理用在坐标上；淡线保留走过的距离线。两者都在求横平竖直两段路之外的直线捷径。",
    "nav6": "6 终章",
    "s6k": "第 6 步",
    "s6t": "终章：勾股数与 √2",
    "s6e": "这一步要回答：哪些整数组合给出直角，斜边必须是整数吗？√2 表示平方为 2 的非负数。勾股数是满足 a²+b²=c² 的三个正整数，a、b 是直角两边，c 是对面的斜边。拖 k=1…6，把 3k、4k、5k 的新组合逐行留在表里；另两行是 5-12-13、8-15-17。每行精确比较整数平方和，没有舍入。再点开 1-1 三角形：<a class=\"fourier-link\" href=\"../fractions/#step6\">分数是整数之比，有分数、小数、百分数三种表示</a>；无理数就是不能写成两个整数之比的数；√2 是其中一个。若假设 √2=p/q 且已约到不能再约，则 p²=2q² 使 p 为偶数，代回又使 q 为偶数，矛盾。因此勾股数是特例，不是定理的边界。",
    "degenerateKind": "退化图形",
    "nearDegenerate": "边长很小，接近退化；仍构成三角形，但读数精度有限。",
    "remainingArea": "中央剩余面积 = (a+b)² − 4(ab/2)",
    "parityTitle": "展开：为什么 p、q 都必须是偶数？",
    "parityExplain": "奇数可写成 2n+1（n 是整数），其平方为 4n²+4n+1，仍是奇数。因此，平方为偶数时，原数也必须是偶数。由 p²=2q² 得 p 为偶数；令 p=2r（r 是整数），代入得 4r²=2q²，即 q²=2r²，所以 q 也为偶数。p、q 都能被 2 整除，与 p/q 已约到不能再约矛盾。"
  },
  "en": {
    "docTitle": "The Pythagorean Theorem · One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "The Pythagorean Theorem",
    "tagline": "Given two sides of a right triangle, how do we find the third? Start with 3, 4, 5, prove the area rule, then drag, classify and measure distances. These are mathematical models, not physical measurements.",
    "foot": "The Pythagorean Theorem · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive geometry; instructions appear above",
    "guessAll": "Every right triangle",
    "guessOnly": "Only a 3-4-5 coincidence",
    "guessIdle": "Make a prediction before opening the examples.",
    "guessEcho": "Your prediction: {guess}. Opened {n}/3 examples; the first check locks your prediction. Examples alone do not prove a rule.",
    "right": "Right",
    "acute": "Acute",
    "obtuse": "Obtuse",
    "notRight": "Not a right triangle",
    "pour": "Pour the cells into the large square",
    "fillRO": "Progress {pct}% · Transferred {n}/25 square units; a² = 9, b² = 16, c² = 25.",
    "fillDone": "9 + 16 = 25, with no cells left over.",
    "source": "The two source areas",
    "target": "Cells transferred into c²",
    "piece": "Place one more triangle",
    "aLab": "Leg a (length units)",
    "bLab": "Leg b (length units)",
    "proofRO": "Puzzle {k}/4 · a = {a}, b = {b}, c ≈ {c}; outer side a+b = {L}.",
    "book1": "Count 1 · Expand the whole",
    "book2": "Count 2 · Triangles and centre",
    "bookWait": "This is only the subtotal of placed triangles, not the whole square’s area. Compare the two totals after all four are placed.",
    "proofDone": "Subtract the same 2ab from both counts: a² + b² = c², so {aa} + {bb} = {cc}. All four inner sides have length c; adjacent acute angles (each less than 90°) complete a right angle, so the centre really is a square.",
    "unlock": "Release the right angle (free triangle)",
    "geomRO": "Current a = {a}, b = {b}; areas a² = {aa}, b² = {bb}, c² = {cc} (square units).",
    "measure": "Ruler c (distance between drawn endpoints) ≈ {c}",
    "root": "Square root √(a²+b²) ≈ {c}",
    "diff": "Length difference ≈ {d}; {rel}; at R: {kind}.",
    "degenerate": "A side is zero or the points are collinear: the shape is degenerate, not a triangle.",
    "xLab": "Vertex horizontal position (keyboard alternative)",
    "yLab": "Vertex vertical position (keyboard alternative)",
    "choose": "Choose an angle type, then reveal",
    "reveal": "Reveal and score",
    "next": "Next question",
    "quizSides": "Sides: {a}, {b}, {c}; c is the longest side.",
    "quizGuess": "Your choice: {g}.",
    "quizResult": "Answer: {kind}. c² = {cc}, a²+b² = {sum}, difference c²−(a²+b²) = {diff}. {result}",
    "correct": "Correct.",
    "incorrect": "This choice was incorrect; compare the two squared quantities again.",
    "score": "Answered {n}; correct {k}.",
    "dLab": "Foot of ladder from wall d (m)",
    "ladderRO": "d = {d} m; height h = √(25−{dd}) ≈ {h} m.",
    "ladderWarn": "Near 5 m: height approaches zero; this is a geometric limit, not advice for using a ladder.",
    "distanceRO": "P = (1, 1), Q = ({x}, {y}); Δx = {dx}, Δy = {dy}; straight-line distance ≈ {c} length units.",
    "wall": "Wall",
    "ground": "Ground",
    "ladder": "5 m ladder",
    "kLab": "Multiplier k (each new value adds a row)",
    "unitTriangle": "Open the 1-1 right triangle",
    "irrational": "Both legs are 1, so c = √2 ≈ 1.414… (the nonnegative number whose square is 2). Its decimal never ends or repeats, and it cannot be a ratio of integers. It is irrational, but has an exact position on the number line.",
    "irrIdle": "Integers are special cases. Open the 1-1 triangle to see a noninteger hypotenuse.",
    "history": "Saved {n} rows of exact integer checks.",
    "family": "Family / sides",
    "check": "Squared-area check",
    "linkTrig": "Unit circle: why cos²θ + sin²θ = 1 follows from this theorem →",
    "linkFractions": "Three faces of fractions: compare with √2, excluded for the reason explained here →",
    "linkEigen": "A vector is an arrow: drag v and see how a matrix changes it →",
    "nav0": "0 Coincidence?",
    "s0k": "Step 0",
    "s0t": "A 3, 4, 5 coincidence?",
    "s0e": "Question: is 3²+4²=5² a coincidence? Given three sets of side lengths, predict, then compare a², b² and c² (each number times itself). A right angle is 90°; its adjacent sides a and b are legs, and its opposite, longest side c is the hypotenuse. The third triangle is not right. These examples raise a question, not a proof. A tiny square marks 90°; edge labels use the same length unit.",
    "nav1": "1 Areas",
    "s1k": "Step 1",
    "s1t": "See it as areas: two small squares fill a large one",
    "s1e": "Question: are the three squares actual areas? Keep the 3-4-5 triangle: a and b meet at 90°, and c is the opposite hypotenuse. Squaring a length gives the area of a square of that side. Each cell is one square unit: cyan a²=9, orange b²=16, tilted target c²=25. Press Pour without changing the sides; watch source cells empty and target cells fill, matching the progress and area. This illustrates equal areas; the general proof comes next.",
    "nav2": "2 Proof",
    "s2k": "Step 2",
    "s2t": "A puzzle proof: one square, two counts",
    "s2e": "Question: why does this work for any right triangle without measuring? Legs a and b meet at 90°; hypotenuse c is opposite. Congruent means identical shapes that fit exactly over one another. Place four congruent triangles, one per click; each has area ab/2 and they enclose a square of side c. Compare both counts and subtract the shared area. Sliders change side lengths, preserving placed pieces and recalculating the ledger. Checking covers tested numbers; a proof explains every a,b>0.",
    "nav3": "3 Drag",
    "s3k": "Step 3",
    "s3t": "Drag and check: when does equality hold?",
    "s3e": "Question: does equality survive moving the right-angle vertex? Sides a and b meet at R; c joins their other endpoints. A square root √ asks which nonnegative number squares to the given value. Keep the right angle, drag orange R (or use position sliders), and compare areas and both c values side by side. The ruler uses drawn endpoint coordinates; the square-root route uses a²+b². Both are model calculations, not physical measurements. Releasing the angle keeps the current shape unchanged. Then the endpoints stay fixed and only R moves, so equality is no longer guaranteed. For a nondegenerate triangle, the two values differ when the angle at R is not 90°; acute means less than 90°, obtuse means greater than 90°. Faint dots save visited positions; three small squares share an area scale. Readings are rounded to two decimals, so tiny nonzero differences may display as 0.00; angles use unrounded coordinates.",
    "nav4": "4 Classify",
    "s4k": "Step 4",
    "s4t": "Reverse the rule: classify from three sides",
    "s4e": "Question: how can three sides tell us the angles? First check that the two shorter sides sum to more than the longest. Call the longest c and the others a,b. The converse reverses the theorem: a²+b²=c² guarantees a right angle. Larger c² gives an obtuse largest angle (>90°); smaller c² makes every angle acute (<90°). Choose, then reveal the squared values in the same units. A zero, positive or negative difference means right, obtuse or acute; larger is not “better”. Next question unlocks the choices.",
    "nav5": "5 Apply",
    "s5k": "Step 5",
    "s5t": "Use it: ladders, screens and point distances",
    "s5e": "Question: given a hypotenuse and a leg, how do we find the other leg? Legs meet at 90°; the hypotenuse is opposite. √ takes the nonnegative inverse of squaring. Model 1 assumes a vertical wall and level ground: a 5 m ladder has height √(25−d²) as its foot moves distance d. Screen width, height and diagonal follow the same rule. Model 2 has x rightwards, y upwards, one unit per cell; fix P=(1,1), move Q or its coordinate sliders, and compare horizontal change Δx, vertical change Δy and distance. The distance formula is this theorem in coordinates. Faint lines preserve previous distances. Both models find a straight shortcut instead of two perpendicular segments.",
    "nav6": "6 Finale",
    "s6k": "Step 6",
    "s6t": "Finale: integer triples and √2",
    "s6e": "Question: which integer triples make right triangles, and must the hypotenuse be an integer? √2 is the nonnegative number whose square is 2. Pythagorean triples are positive integers satisfying a²+b²=c²; a,b are the legs and c the opposite hypotenuse. Move k=1…6 to save each new 3k,4k,5k row beside 5-12-13 and 8-15-17. Every row compares exact integer squares without rounding. Then open the 1-1 triangle. <a class=\"fourier-link\" href=\"../fractions/#step6\">Fractions are ratios of integers, with fraction, decimal and percent forms</a>. An irrational number cannot be a ratio of integers; √2 is one. If √2=p/q in lowest terms, p²=2q² makes p even; substitution makes q even too, contradicting lowest terms. Integer triples are special cases, not limits of the theorem.",
    "degenerateKind": "degenerate shape",
    "nearDegenerate": "A side is very small, close to degeneracy. This is still a triangle, but the displayed precision is limited.",
    "remainingArea": "Remaining central area = (a+b)² − 4(ab/2)",
    "parityTitle": "Expand: why must both p and q be even?",
    "parityExplain": "An odd integer is 2n+1 for some integer n. Its square is 4n²+4n+1, which is still odd. Therefore, if a square is even, the original integer must be even. From p²=2q², p is even. Write p=2r for an integer r: substitution gives 4r²=2q², or q²=2r², so q is even too. Both p and q are divisible by 2, contradicting the assumption that p/q is in lowest terms."
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
