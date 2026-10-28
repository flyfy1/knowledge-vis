'use strict';
const STR = {
  "zh": {
    "docTitle": "定积分 · 切细了加起来 —— 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "定积分",
    "tagline": "曲线下方的面积没有现成公式，怎么算出精确值？办法是把区域切成越来越细的长方形条、一条条加起来：条越细，和越贴近真值，最后贴到的那个数就是定积分。它和导数正好是一对逆运算。",
    "foot": "定积分 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互图；操作方法见上方说明",
    "nav0": "0 曲边面积没公式",
    "s0k": "第 0 步",
    "s0t": "曲边面积没公式：只能估，还估不准",
    "s0e": "这一步要回答：y = x² 在 [0, 1] 下方这块曲边区域的面积到底是多少？横轴是 x（从 0 到 1），纵轴是 y，区域的上边界是弯曲的抛物线，不再是直线。长方形、三角形、梯形的面积公式你都会，但它们的上边都是直的，套到曲边上只能估。逐个点开下面四种粗估，看它们给出的数：估法不同，答案就不同。哪一个是精确值？这一步先不揭晓——我们需要一个能自己变准的办法。",
    "estRight": "大长方形（按右端高）",
    "estTrap": "梯形（连两端点）",
    "estTri": "三角形（底×高÷2）",
    "estLeft": "大长方形（按左端高）",
    "s0ro": "当前估法「{name}」给出面积 ≈ {v}。",
    "s0note": "四种估法给出 1、0.5、0.5、0 四个不同的数：有的明显偏大、有的明显偏小，但谁也说不准真值在哪。缺的不是某个更聪明的公式，而是「越切越准」的办法——下一步就来。",
    "nav1": "1 黎曼和：切条加起来",
    "s1k": "第 1 步",
    "s1t": "黎曼和：切成细条，一条条加起来",
    "s1e": "这一步要回答：怎样让估算自己变准？把 [0, 1] 等分成 n 条窄长方形（这种「切条求和」叫黎曼和），每条的宽是 1/n，高取条内某一点的函数值：取左端点、右端点还是中点，是三种取高口径。拖动 n 从 1 到 32，看条变细时总和怎么变；再切换取高口径，比较贴近的速度。读数里的和是页面按每条「高 × 宽」逐条实算的，并与闭式公式对账。",
    "nLab": "条数 n（滑杆每格翻倍）",
    "modeL": "左端点取高",
    "modeM": "中点取高",
    "modeR": "右端点取高",
    "s1ro": "n = {n}，{mode}：逐条加总 = {sum}（闭式公式对账：{closed}，一致）。",
    "s1bracket": "同一 n 下：左和 L = {L} ＜ 真值 1/3 ＜ 右和 R = {R}，左右把真值夹在中间；缝宽 R − L = {gap}，恰好 = 1/n。n 每翻一倍，缝约减半。",
    "s1zero": "注意：n = 1 又取左端点时，唯一的这条长方形取的是左端高 f(0) = 0，所以它没有高度、贴着横轴看不见——图没坏。它的面积就是左和 L = 0；换成右端点取高，或看下方夹逼条的右端 R，就能看到另一侧的那条。",
    "s1conc": "把 n 推到 32：左和、右和都贴到 1/3 ≈ 0.3333 附近。细到极限、左右都贴到的那个数，就是这块曲边面积的精确值，记作定积分 ∫₀¹ x² dx = 1/3。记号里 ∫ 是拉长的 S（sum，加总），dx 是每条的宽——一条的宽小到趋于 0；a、b 写在 ∫ 的下、上方，表示从 a 累加到 b。取高口径只影响贴近的快慢（中点通常最快），不影响最后贴到的数。",
    "bracketTitle": "左右夹逼：缝随 n 变窄（横轴是面积值）",
    "nav2": "2 积分就是累加",
    "s2k": "第 2 步",
    "s2t": "换上 v-t 情境：积分积的是「累积量」",
    "s2bridge": "先看同一种切条法换了单位：曲线下的高×宽给面积，速度×时间宽度给路程；累加规则没有变。",
    "s2e": "这一步要回答：积分除了算面积，还管什么？换成速度 v=t（纵轴 m/s，横轴 t，单位 s；0≤t≤2）。本例速度始终非负，所以位移与路程相同。用一条的取样速度乘时间宽度，得到近似贡献；各条相加趋近 2m。取样高度不一定恰好等于该段平均速度。<a class=\"fourier-link\" href=\"../velocity-vt/#step2\">回看已有 v–t 切条例子 →</a> 拖动 n、切换取高口径，看近似如何改变。",
    "s2ro": "n = {n}，{mode}：逐条「速度 × 时间」加总 ≈ {sum} m。精确值是 2 m（整块三角形 ½ × 2 × 2 = 2）。",
    "s2conc": "一般在 a≤b 时，∫v dt 给出位移 x(b)−x(a)，∫|v| dt 才给出路程。本例 v≥0，两者恰好相同；速度可为负时，有符号贡献会抵消。<a class=\"fourier-link\" href=\"../atlas/?trail=travel&node=integral\">试一段往返：回到起点，路程为何不为零？ →</a>",
    "nav3": "3 与导数接头",
    "s3k": "第 3 步",
    "s3t": "面积函数 A(x)：求积分就是找原函数",
    "s3e": "这一步要回答：n 数到 32 还差着一点，精确值 1/3 是怎么不靠数条「算」出来的？把「从 0 累加到 x 的面积」记作面积函数 A(x)：左图阴影就是 A(x)，右图是它随 x 长成的曲线。如果某个函数的导数恰好等于 x²，它就叫 x² 的原函数（求导的逆问题）。拖动 x 探针，对照两个读数：A 的值，和 A 在该点增长的速度 A′(x)。右图的 A 曲线由 400 条细条累加描出，是示意线；读数用原函数给出的精确值，两者口径分开标明。",
    "xLab": "累加终点 x",
    "s3roA": "x = {x}：原函数 A(x) = x³/3 给出精确面积 A = {A}。右图描线是细条累加的示意，会与精确曲线略有出入；读数以原函数为准。",
    "s3roB": "A 在该点的增长速度 A′(x) ≈ {Ap}；原曲线在该点的高度 x² = {f}。两者相等：累加的增长速度，正是被累加的高度本身。",
    "s3conc": "既然 A(x) = x³/3 的导数恰好是 x²，精确值就不必数无穷条：∫₀¹ x² dx = A(1) − A(0) = 1/3 − 0 = 1/3。这条公式叫牛顿—莱布尼茨公式，也就是微积分基本定理：求定积分 = 找原函数在两端的值之差；积分与导数互为逆运算。",
    "aCurveNote": "右：A(x) 曲线（细条累加描线，示意）",
    "nav4": "4 自测",
    "s4k": "第 4 步",
    "s4t": "自测：三道题",
    "s4e": "这一步要回答：前面的三招——几何法、夹逼、逆运算——你会用了吗？逐题作答，选错可以重选；改完其他步骤的参数不会冲掉这里的答题状态。",
    "q1t": "题 1：∫₀² x dx = ?（提示：y = x 在 [0, 2] 下方围成的正是底 2、高 2 的三角形）",
    "q1ok": "✓ 对。三角形面积 ½ × 2 × 2 = 2：定积分有时直接用几何面积就能算，不必切条。",
    "q1no": "✗ 再想想：图下是底 2、高 2 的三角形，面积 = ½ × 底 × 高。",
    "q2t": "题 2：对 y = x² 在 [0, 1] 切 n = 4 条，左和 L₄ = 0.21875、右和 R₄ = 0.46875。谁大？真值在哪？",
    "q2a": "左和更大",
    "q2b": "右和更大，真值 1/3 夹在两者之间",
    "q2c": "两和相等",
    "q2ok": "✓ 对。曲线一路上升，每条的右端都比左端高，所以右和总在上方；真值 1/3 被左右夹住，n 越大缝越窄。",
    "q2no": "✗ 回第 1 步看 n = 4 的读数：曲线上升时，每条右端比左端高，右和更大，真值夹在中间。",
    "q3t": "题 3：判断这句话——「定积分算出来的永远是面积」。",
    "judgeT": "对",
    "judgeF": "错",
    "q3ok": "✓ 这句话是错的：定积分累加带符号的贡献。在正向时间区间，∫v dt 是位移，∫|v| dt 是路程；曲线在轴下方时，有符号积分计入负贡献。",
    "q3no": "✗ 定积分是带符号的累加。在正向时间区间，∫v dt 得到位移，∫|v| dt 得到路程。下方贡献在前者中为负，不能都当成正面积。",
    "score": "答了 {n} 题，对 {k} 题。",
    "nav5": "5 终章",
    "s5k": "第 5 步 · 终章",
    "s5t": "终章：把无数小块加回整体",
    "s5e": "这一步要回答：这一页的三招各是什么、接下来往哪走？定积分的骨架只有三句：切条累加、左右夹逼到极限、求积分就是找原函数。它和导数是同一枚硬币的两面：导数把整体缩到一点看变化，积分把一点点累加回整体。",
    "c1t": "切条累加",
    "c1b": "没有公式的量，先切成许多规则小块（长方形条），每块用「高 × 宽」算，再逐块加总——这就是黎曼和。",
    "c2t": "左右夹逼到极限",
    "c2b": "左和从下、右和从上夹住真值；缝宽恰好 1/n，n 越大缝越窄。细到极限时两边贴到的同一个数，就是定积分。",
    "c3t": "求积分就是找原函数",
    "c3b": "不必真数无穷条：找到导数等于被积函数的原函数 A，定积分 = A(b) − A(a)。积分与导数互为逆运算（微积分基本定理）。",
    "linkDeriv": "导数页第 2 步：每个点都有自己的导数——那里把每点的斜率收集成导函数；本页要找的原函数，正是它的逆问题 →",
    "linkVt": "v–t 第2步：本例速度非负，面积同时等于位移与路程 →",
    "s5fore": "再往后还排着两个方向（暂无专页）：把平面区域绕轴转起来、每条变成薄圆筒累加出体积（旋转体）；把概率密度曲线下的面积累加出概率。骨架仍是同一句：切细、逐块算、加起来。"
  },
  "en": {
    "docTitle": "The Definite Integral · Slice Thin, Add Up — One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "The Definite Integral",
    "tagline": "The area under a curve has no ready-made formula — so how can its exact value be computed? Slice the region into ever thinner rectangles and add them up: the thinner the slices, the closer the sum, and the number it closes in on is the definite integral. It is the exact inverse of the derivative.",
    "foot": "The Definite Integral · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive figure for this step; instructions appear above",
    "nav0": "0 No Formula for a Curved Edge",
    "s0k": "Step 0",
    "s0t": "No formula for a curved edge: estimates only, and they disagree",
    "s0e": "Question: what exactly is the area of the curved region under y = x² on [0, 1]? The horizontal axis is x (0 to 1), the vertical axis is y, and the region's top edge is a bending parabola, not a straight line. You know the formulas for rectangles, triangles and trapezoids, but all of them have straight top edges, so on a curved edge they can only estimate. Open the four crude estimates below one by one and look at the numbers they give: different method, different answer. Which one is exact? Not revealed yet — what we need is a method that sharpens itself.",
    "estRight": "Big rectangle (right-end height)",
    "estTrap": "Trapezoid (join the endpoints)",
    "estTri": "Triangle (base × height ÷ 2)",
    "estLeft": "Big rectangle (left-end height)",
    "s0ro": "The current estimate “{name}” gives area ≈ {v}.",
    "s0note": "The four methods give four different numbers — 1, 0.5, 0.5 and 0: some clearly too big, some clearly too small, and none can say where the true value sits. What is missing is not a cleverer formula but a way to get sharper by slicing — next step.",
    "nav1": "1 Riemann Sums: Slice and Add",
    "s1k": "Step 1",
    "s1t": "Riemann sums: slice thin, add them up",
    "s1e": "Question: how can an estimate sharpen itself? Split [0, 1] into n equal thin rectangles (this “slice and sum” is called a Riemann sum). Each strip has width 1/n, and its height is the function value at one chosen point of the strip: left endpoint, right endpoint, or midpoint — three sampling rules. Drag n from 1 to 32 and watch the total as the strips thin out; then switch the sampling rule and compare how fast each closes in. Every sum in the readouts is computed strip by strip as height × width and checked against the closed-form formula.",
    "nLab": "Number of strips n (each slider notch doubles it)",
    "modeL": "Left endpoints",
    "modeM": "Midpoints",
    "modeR": "Right endpoints",
    "s1ro": "n = {n}, {mode}: strip-by-strip total = {sum} (closed-form check: {closed} — match).",
    "s1bracket": "At the same n: left sum L = {L} < true value 1/3 < right sum R = {R} — the two trap the truth between them; the gap R − L = {gap}, exactly 1/n. Each doubling of n roughly halves the gap.",
    "s1zero": "Note: with n = 1 and the left-endpoint rule, the single strip takes its height at the left end, f(0) = 0, so it has no height and hugs the axis, invisible — the figure is not broken. Its area is exactly the left sum L = 0; switch to the right-endpoint rule, or look at the R end of the squeeze bar below, to see the strip from the other side.",
    "s1conc": "Push n to 32: left and right sums both hug 1/3 ≈ 0.3333. The number both sides close in on in the limit is the exact area, written as the definite integral ∫₀¹ x² dx = 1/3. In the notation, ∫ is an elongated S (for sum), dx is the width of one strip as it shrinks toward 0, and a, b at the bottom and top of ∫ say “accumulate from a to b”. The sampling rule only changes how fast you close in (midpoints are usually fastest), never the number you close in on.",
    "bracketTitle": "Squeezed from both sides: the gap narrows with n (axis = area value)",
    "nav2": "2 Integration Is Accumulation",
    "s2k": "Step 2",
    "s2t": "Same machine, a v–t story: an integral accumulates",
    "s2bridge": "Watch the same slicing rule change units: height × width gives area, while velocity × time-width gives distance; the accumulation is the same.",
    "s2e": "Question: what else can integration accumulate? Use velocity v=t (vertical axis m/s, horizontal time t in s; 0≤t≤2). Velocity is nonnegative here, so displacement and distance coincide. Each sampled velocity times its strip width gives an approximate contribution; the sum approaches2m. A sampled height need not equal the exact average velocity on that strip. <a class=\"fourier-link\" href=\"../velocity-vt/#step2\">Revisit the existing v–t slicing example →</a> Change n and the sampling rule to compare approximations.",
    "s2ro": "n = {n}, {mode}: summing “speed × time” strip by strip ≈ {sum} m. The exact value is 2 m (the whole triangle ½ × 2 × 2 = 2).",
    "s2conc": "In general, for a≤b, ∫v dt gives displacement x(b)−x(a); ∫|v| dt gives distance. They coincide here because v≥0. With negative velocities, signed contributions can cancel. <a class=\"fourier-link\" href=\"../atlas/?trail=travel&node=integral\">Try a return trip: back at the start with nonzero distance →</a>",
    "nav3": "3 Meeting the Derivative",
    "s3k": "Step 3",
    "s3t": "The area function A(x): integrating means finding an antiderivative",
    "s3e": "Question: at n = 32 the sum is still slightly off — how is the exact 1/3 “computed” without counting strips? Write A(x) for “the area accumulated from 0 to x”, the area function: the shaded region in the left figure is A(x), and the right figure is the curve it traces as x grows. A function whose derivative is exactly x² is called an antiderivative of x² (the inverse problem of differentiating). Drag the x probe and compare the two readouts: the value of A, and how fast A is growing at that point, A′(x). The A curve on the right is traced by accumulating 400 fine strips — a schematic sketch; the readouts use the exact values from the antiderivative, and the two are labelled separately.",
    "xLab": "Accumulation endpoint x",
    "s3roA": "x = {x}: the antiderivative A(x) = x³/3 gives the exact area A = {A}. The traced curve on the right is a fine-strip schematic and may sit slightly off the exact curve; the readouts follow the antiderivative.",
    "s3roB": "A grows at the rate A′(x) ≈ {Ap} at this point; the original curve's height there is x² = {f}. They are equal: the accumulation grows exactly at the rate of the height being accumulated.",
    "s3conc": "Since A(x) = x³/3 has derivative exactly x², no infinite counting is needed: ∫₀¹ x² dx = A(1) − A(0) = 1/3 − 0 = 1/3. This formula is the Newton–Leibniz formula, the Fundamental Theorem of Calculus: a definite integral = the difference of an antiderivative at the two endpoints; integration and differentiation undo each other.",
    "aCurveNote": "Right: the A(x) curve (fine-strip traced sketch)",
    "nav4": "4 Quiz",
    "s4k": "Step 4",
    "s4t": "Quiz: three questions",
    "s4e": "Question: can you use the three moves — geometry, squeezing, and the inverse operation? Answer each question; a wrong pick can be re-picked, and changing parameters in other steps will not wipe your answers here.",
    "q1t": "Q1: ∫₀² x dx = ? (Hint: the region under y = x on [0, 2] is exactly a triangle of base 2 and height 2.)",
    "q1ok": "✓ Correct. Triangle area ½ × 2 × 2 = 2: a definite integral can sometimes be read straight off the geometry, no slicing needed.",
    "q1no": "✗ Think again: under the line is a triangle of base 2 and height 2; its area = ½ × base × height.",
    "q2t": "Q2: Slicing y = x² on [0, 1] into n = 4 strips gives left sum L₄ = 0.21875 and right sum R₄ = 0.46875. Which is bigger, and where is the true value?",
    "q2a": "The left sum is bigger",
    "q2b": "The right sum is bigger, and the true value 1/3 is trapped between them",
    "q2c": "The two sums are equal",
    "q2ok": "✓ Correct. The curve keeps rising, so every strip's right end is higher than its left end and the right sum stays on top; the true value 1/3 is trapped between the two, and the trap narrows as n grows.",
    "q2no": "✗ Look back at the n = 4 readout in step 1: on a rising curve each strip's right end beats its left end, so the right sum is bigger and the truth is trapped in between.",
    "q3t": "Q3: True or false — “A definite integral always computes an area.”",
    "judgeT": "True",
    "judgeF": "False",
    "q3ok": "✓ The statement is false: a definite integral accumulates signed contributions. Over forward time, ∫v dt gives displacement; ∫|v| dt gives distance. Contributions below the axis count negatively in the signed integral.",
    "q3no": "✗ A definite integral is a signed accumulation. Over forward time, ∫v dt gives displacement and ∫|v| dt gives distance. Negative contributions cannot all be treated as positive area.",
    "score": "Answered {n}; correct {k}.",
    "nav5": "5 Finale",
    "s5k": "Step 5 · Finale",
    "s5t": "Finale: adding countless small pieces back into a whole",
    "s5e": "Question: what are this page's three moves, and where do they lead? The skeleton of the definite integral is just three sentences: slice and add, squeeze to the limit from both sides, and integrate by finding an antiderivative. It is the other face of the derivative: the derivative shrinks a whole down to a point to read change; the integral accumulates points back into a whole.",
    "c1t": "Slice and add",
    "c1b": "A quantity with no formula is first cut into many regular small pieces (rectangular strips); each piece is height × width, and the pieces are added one by one — that is a Riemann sum.",
    "c2t": "Squeeze to the limit",
    "c2b": "The left sum traps the true value from below, the right sum from above; the gap is exactly 1/n and narrows as n grows. The single number both sides close in on in the limit is the definite integral.",
    "c3t": "Integrate = find an antiderivative",
    "c3b": "No infinite counting needed: find an antiderivative A whose derivative is the integrand, and the definite integral is A(b) − A(a). Integration and differentiation undo each other (the Fundamental Theorem of Calculus).",
    "linkDeriv": "Step 2 of the derivative page: every point has its own derivative — there, the slope at every point is collected into a derivative function; the antiderivative this page hunts for is exactly its inverse problem →",
    "linkVt": "v–t step2: this nonnegative-velocity example has equal displacement and distance →",
    "s5fore": "Two more directions are queued beyond this page (no dedicated page yet): spin a plane region around an axis and accumulate thin cylindrical shells into a volume (solids of revolution); accumulate the area under a probability density curve into a probability. The skeleton stays the same sentence: slice thin, compute each piece, add them up."
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
