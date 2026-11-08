'use strict';
/* ============================================================
   Mandelbrot 分形讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: 'Mandelbrot 分形 · 无限放大',
    back: '← 知识索引',
    pageTitle: 'Mandelbrot 分形',
    tagline: '一行幼儿园算术——z 一遍遍平方再加 c——画出了一张无限复杂的地图。这一页带你对着它一直放大：放大一千亿倍，风景还没看完。',
    nav0: '0 钩子', nav1: '1 一个点的一生', nav2: '2 分界线', nav3: '3 颜色从哪来',
    nav4: '4 往里钻', nav5: '5 迷你布罗特', nav6: '6 朱利亚集',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · Mandelbrot 分形 —— 一步一交互系列',

    /* ---------- 第 0 步 ---------- */
    s0k: '第 0 步 · 先玩起来',
    s0t: '放大一千亿倍，还没到底',
    s0e: '这就是 Mandelbrot 集的全貌：中央偏右一颗「心脏形」主体，左侧拖着一条细长的天线，周围还伸出芽苞、触须和螺旋。它来自一行公式：从 z = 0 出发，反复计算 <strong>z ← z² + c</strong>。c 是图上的点——迭代下去跑不远的点涂黑，跑掉的按跑掉的快慢上色。<strong>现在就上手</strong>：在图上拖出一个框放大（触屏上用一根手指拖框，效果一样），或用滚轮缩放、双击放大，看看细节是不是越挖越多。',
    s0reset: '回到全景',
    s0ro: '放大倍数 <span>{zoom}</span> · 中心 <span>{cx}, {cy}</span> · 迭代上限 <span>{iter}</span>',
    s0hint: '拖框（触屏用手指拖）/ 滚轮 / 双击都能放大。往左边的天线尖端、或是主体边缘的螺旋群里钻——那里藏着这页后面要细看的东西。',
    cZoom: '放大',

    /* ---------- 第 1 步 ---------- */
    s1k: '第 1 步 · 一个点的一生',
    s1t: '反复按 z² + c：一个点的两种命运',
    s1e: '先不管整张图，只盯住<strong>一个点 c</strong>：从 z₀ = 0 出发，一遍遍代入 z ← z² + c，轨道只有两种结局——要么很快冲出图上那个半径为 2 的圆（<strong>逃逸</strong>，这个 c 不属于集合），要么一直在圆内打转（<strong>留下</strong>，c 属于集合）。在图上点选或拖动 c，或用下面的预设，看轨道一步步长出来。',
    s1step: '单步 →', s1play: '▶ 播放', s1pause: '⏸ 暂停', s1reset: '重置轨道',
    s1pEsc: '预设：逃逸的点', s1pStay: '预设：留下的点', s1pCycle: '预设：打转的点',
    s1roC: '当前 c = <span>{c}</span>',
    s1roStep: '第 {n} 步：z = {z}，|z| = <span>{mod}</span>（还在圆内）',
    s1roEsc: '第 {n} 步：z = {z}，|z| = <span>{mod}</span> &gt; 2 —— 冲出逃逸圆！这个 c <strong>逃逸</strong>了，不属于集合。',
    s1roStay: '已经走了 {n} 步，|z| = {mod}，始终没出圆——这个 c <strong>留下</strong>了，属于 Mandelbrot 集。',
    s1roCycle: '第 {n} 步：z = {z}，|z| = <span>{mod}</span>——轨道开始重复打转（周期循环），永远不会逃逸。',
    s1hint: '换一个 c（在图上点选、拖动，或按下面的预设）后，轨道会回到 z₀ 重新开始、不会自己继续往前长——再按「单步 →」或「▶ 播放」，看新轨道一步步长出来。圆不是装饰：第 2 步会证明，只要 |z| 一旦超过 2，就再也回不来了。所以「冲出圆」= 宣判逃逸。',
    s1accel: '播放会逐渐加速：前 10 步每帧走 1 步，之后每帧 2 步、第 30 步起每帧 5 步。加速只是「一帧多走几步」——每一步都真实计算并画在图上，读数始终对应当前这一步，没有跳步。',
    cEscCircle: '逃逸圆 |z| = 2',
    cPointC: 'c',

    /* ---------- 第 2 步 ---------- */
    s2k: '第 2 步 · 分界线',
    s2t: '为什么偏偏是 2',
    s2e: '判据只有一句话：<strong>|z| 一旦超过 2，就永不回头。</strong>算一笔账：若某一步 |z| &gt; 2 且 |z| ≥ |c|，则下一步 |z² + c| ≥ |z|² − |c| ≥ |z|·(|z| − 1)，而括号里的数大于 1——于是 |z| 每一步都被乘上一个越来越大的倍数，像雪球一样滚走，再也停不下来。所以画这张图时，每个点只需盯到它出圆为止。',
    s2iter: '最大迭代上限（观察多久才下判决）',
    s2ro: '迭代上限 <span>{iter}</span> · 判为「留下」的黑色区域约占 <span>{pct}%</span>',
    s2note: '拖动滑杆看黑色区域的变化：上限太小（比如 5），很多其实会慢慢逃逸的边界点还没跑掉，就被冤枉成「留下」，黑区胖了一圈；上限拉大，黑区才收紧成真正的集合边界。放得越深，这条边界越难判——所以深缩放时迭代上限必须自动调高（第 0、4 步的读数里能看到）。',
    s2diagT: '雪球是怎么滚走的：c = 0.8 时 |z| 的每一步',
    cWall: '逃逸线 |z| = 2',

    /* ---------- 第 3 步 ---------- */
    s3k: '第 3 步 · 颜色从哪来',
    s3t: '颜色 = 每个点挣扎了多久',
    s3e: '黑白版只回答「在不在集里」。可图上的颜色也全是信息：<strong>颜色由逃逸所需的迭代步数决定</strong>——跑得越慢、越靠近边界，步数越大。切换下面三种着色看同一幅图：阶梯色带按整数步数上色，相邻色带之间会「咔哒」一下跳变（那是整数计数的断层）；平滑着色用公式把步数修成小数，断层就被抹平了。',
    s3bw: '① 黑白', s3band: '② 阶梯色带', s3smooth: '③ 平滑着色',
    pal0: '深空', pal1: '熔岩', pal2: '极光',
    s3ro: '当前着色：<span>{mode}</span> · 调色板：<span>{pal}</span>（切换不重算迭代，只换上色方式）',
    s3formulaT: '平滑步数 ν = n + 1 − log₂(ln|zₙ|)',
    s3note: 'n 是逃逸时的整数步数，|zₙ| 是逃逸那一刻的模长：逃得越「勉强」，小数部分越大。把 ν 当作「带小数的步数」再上色，色带之间的台阶就消失了。本页所有图都用这个公式，与你看到的实现完全一致。',

    /* ---------- 第 4 步 ---------- */
    s4k: '第 4 步 · 往里钻',
    s4t: '著名地点巡游',
    s4e: '这张图的边界上有几个「景点」值得专门去看。点下面的书签飞过去（坐标都是实测过的构图），到了之后还能继续用滚轮和拖框自己深挖。注意读数里<strong>每像素代表的尺度</strong>：它会小到要用科学计数法来写。',
    bm0: '海马谷', bm1: '象谷', bm2: '顶部螺旋', bm3: '迷你布罗特',
    s4reset: '回到全景',
    s4ro: '放大倍数 <span>{zoom}</span> · 中心 <span>{cx}, {cy}</span> · 每像素 <span>{pix}</span> · 迭代上限 <span>{iter}</span>',
    s4warn: '⚠️ 已接近双精度浮点的极限：普通数字只有约 15–16 位有效数字，放大到约 10¹³–10¹⁴ 倍后，相邻像素会开始算出同一个 c，画面出现方块与重复。这不是图形的尽头——数学上边界依然无限复杂——只是这块屏幕的算术到头了；再往深处需要任意精度或扰动算法。',
    s4hint: '书签只是起点：任何一处边界都能继续往里钻。螺旋的中心、触须的分叉处，是细节最密的地方。',

    /* ---------- 第 5 步 ---------- */
    s5k: '第 5 步 · 自相似',
    s5t: '里面还有一个它自己',
    s5e: '在主体上方的螺旋与触须丛深处，藏着一座小岛：<strong>整张 Mandelbrot 集以小一号的模样再次出现</strong>。但它不是复制粘贴——把小图的轮廓叠回大图对比，触须的数目和细节并不完全一样：这是<em>近似</em>自相似，「分形」和普通图案的区别正在这里。',
    s5mini: '迷你布罗特全景', s5drill: '再往它里面钻一层', s5home: '回到整图',
    s5overlay: '叠上整图的轮廓对比',
    s5ro: '当前：<span>{where}</span> · 放大倍数 <span>{zoom}</span> · 每像素 <span>{pix}</span>',
    s5whereMini: '迷你布罗特（主体上方）', s5whereDeep: '迷你布罗特内部', s5whereHome: '整幅图',
    s5note: '这样的小岛在边界上无处不在、数不清——每一个都连着自己的螺旋和触须，每一个里面又藏着更小的岛。这正是「放大一千亿倍还没到底」的原因。',
    cInset: '整图 · 小岛在这里',

    /* ---------- 第 6 步 ---------- */
    s6k: '第 6 步 · 终章',
    s6t: '每个点都是一张新图：朱利亚集',
    s6e: '最后把视角倒过来：不再让 c 满平面跑，而是<strong>固定一个 c</strong>，让平面上的每个点当 z₀ 去迭代同一条公式 z ← z² + c——得到的图叫这个 c 的<strong>朱利亚集</strong>。在左图上点选或拖动 c，右图实时重画。规律只有一条，而且不会说反：<strong>c 在 Mandelbrot 集中，朱利亚集是连通的一整块；c 在集外，立刻碎成尘埃。</strong>',
    s6leftT: 'Mandelbrot 图 · 点选 c',
    s6rightT: 'c 的朱利亚集',
    j0: 'c = −0.123 + 0.745i（集内）', j1: 'c = −0.8 + 0.156i', j2: 'c = 0.5 + 0.5i（集外）',
    s6roIn: 'c = <span>{c}</span>：在 Mandelbrot 集中 → 右图的朱利亚集<strong>连通</strong>，是一整块。',
    s6roOut: 'c = <span>{c}</span>：不在 Mandelbrot 集中 → 右图的朱利亚集<strong>碎成尘埃</strong>。',
    s6roTest: '（用 {iter} 步迭代判定）',
    s6note: '沿着左图的边界慢慢拖：朱利亚集会在「连通的团」与「尘埃」之间千变万化——贴边界的 c 给出的图最精细。所以说 Mandelbrot 集是所有朱利亚集的地图：你在左边点到哪里，右边就是那里的风景。',
    s6fin: '回头看这一页：一条 z ← z² + c，先决定一个点的命运，再给整个平面染色，放大下去又长出小岛和螺旋，最后发现它还是所有朱利亚集的索引。<strong>同样是一行公式生出整个世界</strong>——和傅里叶页里那些旋转的圆，是同一种震撼。'
  },
  en: {
    docTitle: 'The Mandelbrot Set · Zoom Forever',
    back: '← Knowledge Index',
    pageTitle: 'The Mandelbrot Set',
    tagline: 'One line of primary-school arithmetic — square z, add c, repeat — draws a map of infinite complexity. This page lets you zoom into it: a hundred billion times deeper, and the scenery is still not finished.',
    nav0: '0 Hook', nav1: "1 One point's life", nav2: '2 Why 2?', nav3: '3 Where colour comes from',
    nav4: '4 Dive in', nav5: '5 Mini-brots', nav6: '6 Julia sets',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · The Mandelbrot Set — the One Interaction at a Time series',

    s0k: 'Step 0 · Start playing',
    s0t: 'Zoom in a hundred billion times — still no bottom',
    s0e: 'This is the Mandelbrot set in full: a cardioid "heart" just right of centre, a long thin antenna trailing off to the left, ringed with bulbs, tendrils and spirals. It comes from a single line of maths: start from z = 0 and keep computing <strong>z ← z² + c</strong>. Each point of the picture is a c — if the iteration never runs away, the point is painted black; if it escapes, it is coloured by how fast it got out. <strong>Try it now</strong>: drag a box on the picture to zoom in (on a touchscreen, drag the box with one finger — it works exactly the same way), or use the mouse wheel, or double-click — and watch the detail keep growing.',
    s0reset: 'Back to full view',
    s0ro: 'Zoom <span>{zoom}</span> · Centre <span>{cx}, {cy}</span> · Iteration cap <span>{iter}</span>',
    s0hint: 'Drag a box (one finger on a touchscreen), scroll, or double-click to zoom. Dive toward the tip of the antenna on the left, or into the spiral clusters along the edge of the main body — that is where the rest of this page will look closely.',
    cZoom: 'zoom',

    s1k: 'Step 1 · The life of one point',
    s1t: 'Square, add c, repeat: the two fates of a point',
    s1e: 'Forget the whole picture for a moment and watch <strong>one single c</strong>: starting from z₀ = 0, apply z ← z² + c over and over. The orbit has only two possible endings — it soon bursts out of the circle of radius 2 drawn here (<strong>it escapes</strong>, and this c is not in the set), or it wanders inside the circle forever (<strong>it stays</strong>, and c belongs to the set). Click or drag on the plane to place c, or use the presets, and watch the orbit grow step by step.',
    s1step: 'Step →', s1play: '▶ Play', s1pause: '⏸ Pause', s1reset: 'Reset orbit',
    s1pEsc: 'Preset: an escaping point', s1pStay: 'Preset: a point that stays', s1pCycle: 'Preset: a point that cycles',
    s1roC: 'Current c = <span>{c}</span>',
    s1roStep: 'Step {n}: z = {z}, |z| = <span>{mod}</span> (still inside the circle)',
    s1roEsc: 'Step {n}: z = {z}, |z| = <span>{mod}</span> &gt; 2 — it has burst out of the escape circle! This c <strong>escapes</strong>; it is not in the set.',
    s1roStay: '{n} steps walked, |z| = {mod}, and it has never left the circle — this c <strong>stays</strong>; it belongs to the Mandelbrot set.',
    s1roCycle: 'Step {n}: z = {z}, |z| = <span>{mod}</span> — the orbit has started repeating (a cycle); it will never escape.',
    s1hint: 'After you change c (click or drag on the plane, or use a preset below), the orbit restarts at z₀ and does not keep growing on its own — press Step → or ▶ Play again to watch the new orbit grow. The circle is not decoration: step 2 proves that once |z| passes 2 it can never come back. Crossing the circle is the verdict.',
    s1accel: 'Playback speeds up as it goes: one step per beat for the first 10 steps, then 2 steps per beat, and 5 per beat from step 30 on. Speeding up only means several steps per beat — every step is still really computed and drawn, and the readout always shows the true current step. Nothing is skipped.',
    cEscCircle: 'escape circle |z| = 2',
    cPointC: 'c',

    s2k: 'Step 2 · The dividing line',
    s2t: 'Why exactly 2?',
    s2e: 'The criterion is one sentence: <strong>once |z| exceeds 2, it never comes back.</strong> Here is the arithmetic: if at some step |z| &gt; 2 and |z| ≥ |c|, then the next step gives |z² + c| ≥ |z|² − |c| ≥ |z|·(|z| − 1), and the factor in brackets is greater than 1 — so |z| is multiplied by an ever-growing factor at every step, snowballing away for good. That is why drawing this picture only ever requires watching each point until it leaves the circle.',
    s2iter: 'Iteration cap (how long you watch before judging)',
    s2ro: 'Iteration cap <span>{iter}</span> · area judged "stays" (black) ≈ <span>{pct}%</span> of the frame',
    s2note: 'Drag the slider and watch the black region: with a tiny cap (say 5), many boundary points that would eventually escape have not left yet and get wrongly convicted as "staying" — the black region is a fat rough draft. Raise the cap and it tightens onto the true boundary. The deeper you zoom, the slower the boundary points escape — which is why deep zooms must raise the cap automatically (watch the readouts in steps 0 and 4).',
    s2diagT: 'How the snowball runs away: |z| step by step for c = 0.8',
    cWall: 'escape line |z| = 2',

    s3k: 'Step 3 · Where the colour comes from',
    s3t: 'Colour = how long each point struggled',
    s3e: 'The black-and-white version only answers "in or out". But the colours are all information too: <strong>colour is decided by the number of iterations a point needed to escape</strong> — the slower it runs, the closer it lives to the boundary, the larger the count. Switch between the three colourings of the same view below: banded colouring uses the integer count, and neighbouring bands visibly "click" as they jump (that is the quantisation of whole numbers); smooth colouring uses a formula to turn the count into a fraction, and the steps melt away.',
    s3bw: '① Black & white', s3band: '② Banded', s3smooth: '③ Smooth',
    pal0: 'Deep space', pal1: 'Lava', pal2: 'Aurora',
    s3ro: 'Colouring: <span>{mode}</span> · Palette: <span>{pal}</span> (switching re-colours only — the iterations are not recomputed)',
    s3formulaT: 'Smooth count ν = n + 1 − log₂(ln|zₙ|)',
    s3note: 'n is the integer step at which the point escaped, and |zₙ| is its modulus at that moment: the more "reluctantly" it escaped, the larger the fractional part. Treating ν as a step count with decimals and colouring by it makes the terraces between bands vanish. Every picture on this page uses exactly this formula — the implementation you are looking at is the real thing.',

    s4k: 'Step 4 · Dive in',
    s4t: 'A tour of the famous places',
    s4e: 'The boundary of this picture has a few "sights" worth a dedicated trip. Click a bookmark to fly there (every coordinate has been test-rendered for its composition), then keep digging with the wheel and drag-box. Watch the <strong>scale of a single pixel</strong> in the readout: it soon needs scientific notation.',
    bm0: 'Seahorse Valley', bm1: 'Elephant Valley', bm2: 'Top spiral', bm3: 'Mini-Brot',
    s4reset: 'Back to full view',
    s4ro: 'Zoom <span>{zoom}</span> · Centre <span>{cx}, {cy}</span> · One pixel = <span>{pix}</span> · Iteration cap <span>{iter}</span>',
    s4warn: '⚠️ Approaching the limit of double-precision floating point: ordinary numbers carry only about 15–16 significant digits, so beyond a zoom of roughly 10¹³–10¹⁴, neighbouring pixels start computing the very same c and the picture breaks into blocks and repeats. This is not the end of the fractal — mathematically the boundary is still infinitely detailed — it is the end of this screen\u2019s arithmetic. Going deeper takes arbitrary precision or perturbation methods.',
    s4hint: 'Bookmarks are just starting points: every stretch of boundary can be dug further. The centres of spirals and the forks of tendrils are where the detail is densest.',

    s5k: 'Step 5 · Self-similarity',
    s5t: 'Inside it, there is another one',
    s5e: 'Deep in the spirals and tendrils above the main body hides a small island: <strong>the whole Mandelbrot set, appearing again at a smaller size</strong>. But it is not copy-and-paste — lay the outline of the full set over the little one and the tendrils and details do not match exactly. The self-similarity is <em>approximate</em>, and that is exactly what separates a fractal from an ordinary pattern.',
    s5mini: 'The mini-Brot in full', s5drill: 'Drill one level deeper into it', s5home: 'Back to the whole set',
    s5overlay: 'Overlay the outline of the full set',
    s5ro: 'Now viewing: <span>{where}</span> · Zoom <span>{zoom}</span> · One pixel = <span>{pix}</span>',
    s5whereMini: 'a mini-Brot (above the main body)', s5whereDeep: 'inside the mini-Brot', s5whereHome: 'the full set',
    s5note: 'Islands like this are everywhere along the boundary, beyond counting — each carries its own spirals and tendrils, and each hides smaller islands inside. That is why a hundred billion times deeper still is not the bottom.',
    cInset: 'Full set · the island is here',

    s6k: 'Step 6 · Finale',
    s6t: 'Every point is a new picture: Julia sets',
    s6e: 'Finally, turn the viewpoint around: instead of letting c roam the whole plane, <strong>fix one c</strong> and let every point of the plane serve as z₀ for the same formula z ← z² + c. The picture you get is the <strong>Julia set</strong> of that c. Click or drag c on the left picture and the right one redraws in real time. There is one rule, and it never comes out backwards: <strong>if c is in the Mandelbrot set, its Julia set is one connected piece; if c is outside, it shatters into dust.</strong>',
    s6leftT: 'The Mandelbrot set · click to pick c',
    s6rightT: 'The Julia set of c',
    j0: 'c = −0.123 + 0.745i (inside)', j1: 'c = −0.8 + 0.156i', j2: 'c = 0.5 + 0.5i (outside)',
    s6roIn: 'c = <span>{c}</span>: inside the Mandelbrot set → the Julia set on the right is <strong>connected</strong>, a single piece.',
    s6roOut: 'c = <span>{c}</span>: outside the Mandelbrot set → the Julia set on the right has <strong>shattered into dust</strong>.',
    s6roTest: '(judged with {iter} iterations)',
    s6note: 'Drag slowly along the boundary of the left picture: the Julia set morphs endlessly between connected blobs and dust — the c values hugging the boundary give the most intricate pictures. That is the sense in which the Mandelbrot set is a map of all Julia sets: wherever you point on the left, the right shows you the scenery there.',
    s6fin: 'Look back over this page: one rule, z ← z² + c, first decides the fate of a single point, then paints a whole plane, then grows islands and spirals as you zoom, and finally turns out to be the index of all Julia sets. <strong>One line of formula, an entire world</strong> — the same shock as the spinning circles on the Fourier page.'
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
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
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
