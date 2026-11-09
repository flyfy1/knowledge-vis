'use strict';
// Space diagonal lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys and {placeholders} are identical in zh and en (tests/core.cjs checks both).

const STRINGS = {
  zh: {
    pageTitle: '空间对角线 · 箱子里最长的棍子',
    back: '← 知识索引',
    compare: '对照另一版本：空间对角线 · 3D 里的两次勾股 →',
    navLabel: '空间对角线步骤导航',
    tagline: '一只宽 4、深 3、高 12 的长盒子里，能斜着放进去的最长直棍有多长？不需要新公式：把勾股定理用两次，先在底面，再在一个竖着的截面里。每张 3D 图都可以拖动转着看。',
    nav0: '0 最远的两个角', nav1: '1 底面', nav2: '2 竖起来', nav3: '3 合成一式', nav4: '4 换条路线', nav5: '5 放得进吗', nav6: '6 收束',
    lgEdge: '棱（沿一个方向）', lgFace: '面对角线（斜穿一个面）', lgSpace: '空间对角线（穿过盒子内部）',
    lgBase: '底面 a × b', lgE: '底面对角线 e', lgC: '高 c', lgD: '空间对角线 d', lgSlice: '竖着的截面（宽 e、高 c）',
    lgCurve: '当前底面下 d 随 c 的变化', lgGhost: '改 a 或 b 之前的那条曲线', lgNow: '现在的盒子',
    lgF: '第一段：面对角线 f', lgLast: '第二段：剩下的那条棱',
    lgStickIn: '棍子在箱内的部分', lgStickOut: '露在箱外的部分',
    sa: '宽 a', sb: '深 b', sc: '高 c', sL: '棍长 L（cm）',
    check: '检查',
    dragHint: '拖动可旋转',

    s0k: '第 0 步 · 提出问题',
    s0t: '盒子里，哪两个角离得最远？',
    s0e: '这一步要回答：在一个<strong>长方体</strong>（六个面都是长方形的盒子）里，连接两个<strong>顶点</strong>（角）的线段，哪一种最长？长方体有 8 个顶点，两两相连一共 28 条线段，只分三种：<strong>棱</strong>（盒子的边，只沿一个方向）、<strong>面对角线</strong>（斜穿一个面，跨两个方向）、<strong>空间对角线</strong>（穿过盒子内部、连接相对的两个顶点，三个方向都跨）。图中盒子宽 a = 4、深 b = 3、高 c = 12，单位都相同（比如分米）。',
    kEdge: '显示 12 条棱', kFace: '显示 12 条面对角线', kSpace: '显示 4 条空间对角线',
    spinOn: '暂停旋转', spinOff: '继续旋转',
    c0title: '长方体 4 × 3 × 12', c0strip: '28 条线段的长度', c0row_edge: '棱', c0row_face: '面对角线', c0row_space: '空间对角线',
    s0readout: '28 条线段：棱 {ne} 条，最长 {le}；面对角线 {nf} 条，最长 {lf}；空间对角线 {ns} 条，每条都是 {ls}。最长的是空间对角线。',
    s0edge: '现在亮的是棱：每条只沿宽、深、高中的一个方向，长度就是 4、3 或 12。',
    s0face: '现在亮的是面对角线：斜穿一个面，有三种长度——底面 {f1}、正面 {f2}、侧面 {f3}。',
    s0space: '现在亮的是空间对角线：四条都穿过盒子正中，一样长，都是 {d}。下面几步就来算这个数。',
    s0hint: '观察顺序：依次按三个按钮，看亮起的线段跨了几个方向：棱只沿一个方向，面对角线斜穿一个面，空间对角线从盒子里面穿过。拖动画面（手机上左右滑）可以转动盒子；旋转只改变视角，不改变任何长度。',

    s1k: '第 1 步 · 第一次勾股',
    s1t: '底面那条斜线 e 有多长？',
    s1e: '这一步要回答：从底面一个角到底面对面的那个角，斜线 e 有多长？底面是一个 a × b 的长方形，<strong>底面对角线</strong> e 把它切成两个直角三角形，两条直角边正好是 a 和 b。<strong>勾股定理</strong>说：直角三角形两条直角边的平方和，等于斜边的平方。所以 e² = a² + b²。右边（窄屏时在下方）把这块底面平放画出来，方便看清直角。',
    c1left: '长方体', c1right: '底面平放',
    s1readout: 'e² = a² + b² = {a}² + {b}² = {a2} + {b2} = {e2}，所以 e = √{e2} {eq} {e}。',
    s1hint: '观察顺序：先只拖 a，看青色底面变宽、绿色斜线 e 跟着变长；再只拖 b。a = 4、b = 3 时 e 正好是 5。高 c 不影响 e，因为 e 整条躺在底面上。',

    s2k: '第 2 步 · 第二次勾股',
    s2t: '从 e 的终点往上走，怎么到最远的角？',
    s2e: '这一步要回答：已经知道底面对角线 e，怎样算出空间对角线 d？从 e 的终点竖直往上走一个高 c，就到了离出发点最远的顶点。e 躺在底面上，c 垂直于底面，所以 e ⊥ c（互相垂直），e、c 和 d 正好围成一个<strong>直角三角形</strong>，d 是斜边。这个三角形立在一块斜切盒子的长方形<strong>截面</strong>里（图中紫色半透明的那块，宽 e、高 c）。第二次用勾股定理：d² = e² + c²。',
    c2left: '长方体与竖着的截面', c2right: '截面平放',
    s2readout: 'd² = e² + c² = {e2} + {c}² = {e2} + {c2} = {d2}，所以 d = √{d2} {eq} {d}。e² 直接用上一步的 {e2}，不先把 e 四舍五入再平方。',
    s2hint: '观察顺序：只拖高 c。紫色截面变高、橙色 d 变长，绿色 e 一点不变，因为 e 只由底面的 a、b 决定。a = 4、b = 3、c = 12 时 d = 13。',

    s3k: '第 3 步 · 合成一个式子',
    s3t: '两次勾股能合成一步吗？每条棱各影响谁？',
    s3e: '这一步要回答：两步能不能合成一个式子，三条棱又各自影响哪个量？把 e² = a² + b² 代进 d² = e² + c²，得到 <strong>d² = a² + b² + c²</strong>，也就是 d = √(a² + b² + c²)：三条棱各平方一次，加起来再开方。右图（窄屏时在下方）横轴是高 c，纵轴是长度；橙色曲线是底面不变（e 不变）时 d 随 c 的变化。c 很小时 d 接近 e（盒子压扁，对角线几乎贴着底面）；c 很大时 d 接近 c（盒子细高，对角线几乎竖直）。',
    c3left: '长方体', c3right: 'd 随高 c 的变化（e = {e}）', c3x: '高 c', c3de: 'd = e', c3dc: 'd = c',
    s3readout: '现在 a = {a}、b = {b}、c = {c}：d² = {a2} + {b2} + {c2} = {d2}，d {eq} {d}。{move}{cube}',
    s3moveAB: '你刚改了 {k}：底面变了，e 和 d 一起变，曲线整条换了位置。',
    s3moveC: '你刚改了 c：e 不变，白点沿同一条曲线移动。',
    s3cube: '三条棱相等，这是立方体：d = a√3 ≈ {k}。',
    thMove: '改了', rowStart: '起始',
    clearLedger: '清空账本',
    s3hint: '观察顺序：先保持 a、b 不动，只拖 c：账本里 e 那一列不变，d 在变，白点沿橙色曲线走。再保持 b、c 不动，只拖 a：e 和 d 两列一起变，曲线整条换位置（虚线是换之前的那条）。账本里刚变过的格子会标亮。',

    s4k: '第 4 步 · 换一条路线',
    s4t: '先算别的面，答案会变吗？',
    s4e: '这一步要回答：第一次勾股一定要用底面吗？从同一个角出发，也可以先斜穿正面（用 a 和 c），再沿深度走 b；或者先斜穿侧面（用 b 和 c），再沿宽度走 a。每条路线都是「一条面对角线 f + 剩下的那条棱」，这两段互相垂直，所以都能用两次勾股。三条路线的终点是同一个顶点，结果必然相同：三种算法都是把 a²、b²、c² 各加一次，只是先加哪两个不同。盒子尺寸沿用第 3 步设好的值。',
    rtBase: '先底面（a、b），再高 c', rtFront: '先正面（a、c），再深 b', rtSide: '先侧面（b、c），再宽 a',
    nBase: '先底面', nFront: '先正面', nSide: '先侧面',
    c4left: '路线：{name}', c4right: '这条路线的直角三角形',
    s4readout: '路线「{name}」：第一次 f² = {p}² + {q}² = {f2}，f {eq1} {f}；第二次 d² = f² + {r}² = {f2} + {r2} = {d2}，d {eq2} {d}。',
    s4all: '三条路线算出的 d：先底面 {d1}，先正面 {d2}，先侧面 {d3}，完全相同。',
    s4hint: '观察顺序：依次按三个路线按钮，看绿色面对角线换到了哪个面、紫色的第二段换成了哪条棱；橙色 d 始终是同一条线，读数里的 d 也不变。',

    s5k: '第 5 步 · 用起来',
    s5t: '一根 60 cm 的细棍，放得进这只箱子吗？',
    s5e: '这一步要回答：已知箱子的尺寸，最长能斜放多长的细棍？箱子内部长 50 cm、宽 40 cm、高 30 cm。最长的放法是沿空间对角线：d = √(50² + 40² + 30²) = √5000 ≈ 70.71 cm。比这更长的棍子，不管怎样斜放，都会有一截露在箱外。这里把棍子当成没有粗细的线段；真实的棍子有粗细，能放下的长度会比 70.71 cm 短一些。',
    c5title: '箱子 50 × 40 × 30 cm',
    s5in: '棍长 {L} cm ≤ 对角线 {d} cm：放得进，还余 {s} cm。',
    s5out: '棍长 {L} cm > 对角线 {d} cm：放不进，沿对角线放也会露出约 {s} cm。',
    s5hint: '观察顺序：把棍长从 60 慢慢往上拖，看绿色棍子什么时候顶到对面的角，再长就有一截变成红色露在外面。分界在 70.71 cm：70 cm 放得进，71 cm 放不进。',
    quizPrompt: '小测：一个长方体的三条棱长是 1、2、2，它的空间对角线 d 是多少？',
    quizRight: '对。d² = 1² + 2² + 2² = 1 + 4 + 4 = 9，d = 3。',
    quizWrong: '再算一次：d² = a² + b² + c²，先把三个平方加起来，再开方。可以回到第 3 步看这个式子。',
    noChoice: '先选一个答案。',

    s6k: '第 6 步 · 收束', s6t: '空间对角线 = 勾股定理用两次',
    s6fin: '<strong>第 0 步</strong>：长方体两顶点之间的 28 条线段分棱、面对角线、空间对角线三种，空间对角线最长。<strong>第 1 步</strong>：底面对角线 e² = a² + b²。<strong>第 2 步</strong>：e 与高 c 垂直，围成竖着的直角三角形，d² = e² + c²。<strong>第 3 步</strong>：合起来 d² = a² + b² + c²；改 c 时 e 不变，改 a 或 b 时 e、d 一起变。<strong>第 4 步</strong>：先算哪个面都行，d 不变。<strong>第 5 步</strong>：50 × 40 × 30 cm 的箱子最长能放约 70.71 cm 的细棍。',
    formula: 'e² = a² + b²\nd² = e² + c² = a² + b² + c²\nd = √(a² + b² + c²)',
    boundary: '适用范围：这两次勾股都依赖「互相垂直」：底面的 a ⊥ b、截面里的 e ⊥ c。所以公式只适用于长方体（包括立方体）这种三组棱两两垂直的盒子；斜的平行六面体不能这样算。第 5 步把棍子当成没有粗细的线段，真实物体要再留出粗细。',
    linksTitle: '接着去哪儿',
    lk1: '→ 勾股定理第 2 步：用拼图证明 a² + b² = c²，这里用到的两次都靠它',
    lk2: '→ 勾股定理第 5 步：平面上两点的距离用横、纵坐标差；空间里多一个高度差，就是本页的 d',
    lk3: '→ 立体几何第 1 步：长方体的表面积与体积，同一组 a、b、c 的另外两种量法',
    lk4: '→ 向量第 0 步：箭头与分量；本页的 d 就是分量为 (a, b, c) 的箭头的长度',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《空间对角线 · 3D 里的两次勾股》的平行版本。'
  },
  en: {
    pageTitle: 'The Space Diagonal · The Longest Stick in a Box',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Space Diagonal · Pythagoras Twice, in 3D →',
    navLabel: 'Space diagonal steps',
    tagline: 'A tall box is 4 wide, 3 deep and 12 high. What is the longest straight stick that fits inside if you lay it at a slant? No new formula is needed: use Pythagoras twice, once across the floor and once inside an upright slice. Every 3D picture can be dragged to turn it.',
    nav0: '0 The farthest corners', nav1: '1 The floor', nav2: '2 Stand it up', nav3: '3 One formula', nav4: '4 Another route', nav5: '5 Will it fit', nav6: '6 Wrap-up',
    lgEdge: 'edge (one direction)', lgFace: 'face diagonal (across one face)', lgSpace: 'space diagonal (through the inside)',
    lgBase: 'floor a × b', lgE: 'floor diagonal e', lgC: 'height c', lgD: 'space diagonal d', lgSlice: 'upright slice (e wide, c high)',
    lgCurve: 'd as c changes, for the current floor', lgGhost: 'the curve before you changed a or b', lgNow: 'the box right now',
    lgF: 'first leg: face diagonal f', lgLast: 'second leg: the edge that is left',
    lgStickIn: 'rod inside the case', lgStickOut: 'part sticking out',
    sa: 'Width a', sb: 'Depth b', sc: 'Height c', sL: 'Stick length L (cm)',
    check: 'Check',
    dragHint: 'drag to turn',

    s0k: 'Step 0 · The question',
    s0t: 'Which two corners of a box are farthest apart?',
    s0e: 'This step answers: inside a <strong>cuboid</strong> (a box whose six faces are all rectangles), which segment joining two <strong>vertices</strong> (corners) is longest? A cuboid has 8 vertices, so there are 28 segments joining pairs of them, and they come in just three kinds: <strong>edges</strong> (the sides of the box, along one direction only), <strong>face diagonals</strong> (slanting across one face, covering two directions) and <strong>space diagonals</strong> (running through the inside from a corner to the opposite corner, covering all three directions). The box shown is a = 4 wide, b = 3 deep and c = 12 high, all in the same unit (say decimetres).',
    kEdge: 'Show the 12 edges', kFace: 'Show the 12 face diagonals', kSpace: 'Show the 4 space diagonals',
    spinOn: 'Pause turning', spinOff: 'Resume turning',
    c0title: 'Cuboid 4 × 3 × 12', c0strip: 'Lengths of the 28 segments', c0row_edge: 'edges', c0row_face: 'face diagonals', c0row_space: 'space diagonals',
    s0readout: '28 segments: {ne} edges, longest {le}; {nf} face diagonals, longest {lf}; {ns} space diagonals, each exactly {ls}. The space diagonal is the longest.',
    s0edge: 'Lit now: the edges. Each runs along just one of width, depth or height, so its length is 4, 3 or 12.',
    s0face: 'Lit now: the face diagonals. They cross one face and come in three lengths: floor {f1}, front {f2}, side {f3}.',
    s0space: 'Lit now: the space diagonals. All four pass through the centre of the box and have the same length, {d}. The next steps work out that number.',
    s0hint: 'What to try: press the three buttons in turn and count how many directions each lit segment covers: an edge follows one, a face diagonal slants across one face, a space diagonal passes through the inside. Drag the picture (swipe sideways on a phone) to turn the box; turning only changes your view, never a length.',

    s1k: 'Step 1 · Pythagoras, first time',
    s1t: 'How long is the slanting line e across the floor?',
    s1e: 'This step answers: from one corner of the floor to the opposite corner of the floor, how long is the slanting line e? The floor is an a × b rectangle. Its diagonal, the <strong>floor diagonal</strong> e, cuts it into two right-angled triangles whose shorter sides are exactly a and b. <strong>Pythagoras’ theorem</strong> says that in a right-angled triangle the squares of the two shorter sides add up to the square of the longest side. So e² = a² + b². On the right (below, on narrow screens) the floor is laid flat so the right angle is easy to see.',
    c1left: 'Cuboid', c1right: 'Floor laid flat',
    s1readout: 'e² = a² + b² = {a}² + {b}² = {a2} + {b2} = {e2}, so e = √{e2} {eq} {e}.',
    s1hint: 'What to try: drag only a and watch the cyan floor widen and the green line e grow; then drag only b. With a = 4 and b = 3, e is exactly 5. The height c has no effect on e, because e lies entirely in the floor.',

    s2k: 'Step 2 · Pythagoras, second time',
    s2t: 'From the end of e, how do you reach the farthest corner?',
    s2e: 'This step answers: once the floor diagonal e is known, how do we get the space diagonal d? From the far end of e, go straight up by the height c and you arrive at the corner farthest from the start. e lies in the floor and c stands perpendicular to the floor, so e ⊥ c (they meet at a right angle), and e, c and d form a <strong>right-angled triangle</strong> with d as its longest side. That triangle stands inside a rectangular <strong>slice</strong> cut diagonally through the box (the translucent violet panel, e wide and c high). Pythagoras a second time: d² = e² + c².',
    c2left: 'Cuboid and the upright slice', c2right: 'Slice laid flat',
    s2readout: 'd² = e² + c² = {e2} + {c}² = {e2} + {c2} = {d2}, so d = √{d2} {eq} {d}. We reuse e² = {e2} from the last step instead of rounding e and squaring it again.',
    s2hint: 'What to try: drag only the height c. The violet slice grows taller and the orange d gets longer, while the green e does not move at all: e depends only on the floor’s a and b. With a = 4, b = 3 and c = 12, d = 13.',

    s3k: 'Step 3 · One formula',
    s3t: 'Can the two steps become one, and which edge affects what?',
    s3e: 'This step answers: can the two steps be merged into one formula, and which quantity does each edge change? Put e² = a² + b² into d² = e² + c² and you get <strong>d² = a² + b² + c²</strong>, that is d = √(a² + b² + c²): square each edge, add, take the square root. In the right-hand chart (below, on narrow screens) the horizontal axis is the height c and the vertical axis is length; the orange curve shows how d changes with c while the floor (and so e) stays fixed. For small c, d is close to e (a flattened box, its diagonal almost lying on the floor); for large c, d is close to c (a tall thin box, its diagonal almost vertical).',
    c3left: 'Cuboid', c3right: 'd against height c (e = {e})', c3x: 'height c', c3de: 'd = e', c3dc: 'd = c',
    s3readout: 'Now a = {a}, b = {b}, c = {c}: d² = {a2} + {b2} + {c2} = {d2}, d {eq} {d}. {move}{cube}',
    s3moveAB: 'You just changed {k}: the floor changed, so e and d both moved and the whole curve shifted.',
    s3moveC: 'You just changed c: e stayed the same and the white dot slid along the same curve.',
    s3cube: 'All three edges are equal, so this is a cube: d = a√3 ≈ {k}.',
    thMove: 'changed', rowStart: 'start',
    clearLedger: 'Clear the ledger',
    s3hint: 'What to try: first keep a and b still and drag only c. In the ledger the e column stays put while d changes, and the white dot slides along the orange curve. Then keep b and c still and drag only a: the e and d columns change together and the whole curve moves (the dashed one is where it was). Cells that just changed are highlighted.',

    s4k: 'Step 4 · Another route',
    s4t: 'If you start with a different face, does the answer change?',
    s4e: 'This step answers: must the first Pythagoras be done on the floor? From the same corner you could first slant across the front (using a and c) and then go back by the depth b, or slant across the side (using b and c) and then across by the width a. Every route is “one face diagonal f plus the edge that is left”, and those two legs meet at a right angle, so Pythagoras works twice on each. All three routes end at the same corner, so they must agree: each one adds a², b² and c² once, only in a different order. The box keeps the size you set in step 3.',
    rtBase: 'Floor first (a, b), then height c', rtFront: 'Front first (a, c), then depth b', rtSide: 'Side first (b, c), then width a',
    nBase: 'floor first', nFront: 'front first', nSide: 'side first',
    c4left: 'Route: {name}', c4right: 'This route’s right triangle',
    s4readout: 'Route “{name}”: first f² = {p}² + {q}² = {f2}, f {eq1} {f}; then d² = f² + {r}² = {f2} + {r2} = {d2}, d {eq2} {d}.',
    s4all: 'd from the three routes: floor first {d1}, front first {d2}, side first {d3}. Identical.',
    s4hint: 'What to try: press the three route buttons in turn. Watch which face the green diagonal moves to and which edge becomes the violet second leg; the orange d stays the very same line, and so does the d in the readout.',

    s5k: 'Step 5 · Putting it to use',
    s5t: 'Does a 60 cm rod fit in this case?',
    s5e: 'This step answers: given the size of a case, what is the longest thin rod that fits at a slant? Inside, the case is 50 cm long, 40 cm wide and 30 cm high. The longest way in is along the space diagonal: d = √(50² + 40² + 30²) = √5000 ≈ 70.71 cm. Any longer rod pokes out however you tilt it. The rod is treated as a line with no thickness; a real rod has some, so the longest one that fits is a little shorter than 70.71 cm.',
    c5title: 'Case 50 × 40 × 30 cm',
    s5in: 'Rod {L} cm ≤ diagonal {d} cm: it fits, with {s} cm to spare.',
    s5out: 'Rod {L} cm > diagonal {d} cm: it does not fit; even along the diagonal about {s} cm sticks out.',
    s5hint: 'What to try: drag the rod length up slowly from 60 and watch for the moment the green rod touches the far corner; any longer and a red piece sticks out of the case. The boundary is 70.71 cm: 70 cm fits, 71 cm does not.',
    quizPrompt: 'Quick check: a cuboid has edges 1, 2 and 2. How long is its space diagonal d?',
    quizRight: 'Right. d² = 1² + 2² + 2² = 1 + 4 + 4 = 9, so d = 3.',
    quizWrong: 'Try again: d² = a² + b² + c². Add the three squares first, then take the square root. Step 3 has the formula.',
    noChoice: 'Pick an answer first.',

    s6k: 'Step 6 · Wrap-up', s6t: 'The space diagonal is Pythagoras used twice',
    s6fin: '<strong>Step 0</strong>: the 28 corner-to-corner segments of a cuboid are edges, face diagonals and space diagonals, and the space diagonal is the longest. <strong>Step 1</strong>: the floor diagonal has e² = a² + b². <strong>Step 2</strong>: e is perpendicular to the height c, forming an upright right triangle, so d² = e² + c². <strong>Step 3</strong>: together, d² = a² + b² + c²; changing c leaves e alone, changing a or b moves e and d together. <strong>Step 4</strong>: whichever face you start with, d is the same. <strong>Step 5</strong>: a 50 × 40 × 30 cm case takes a thin rod of up to about 70.71 cm.',
    formula: 'e² = a² + b²\nd² = e² + c² = a² + b² + c²\nd = √(a² + b² + c²)',
    boundary: 'Scope: both uses of Pythagoras rely on right angles, a ⊥ b on the floor and e ⊥ c in the slice. So the formula holds for cuboids (cubes included), whose three sets of edges are mutually perpendicular, and not for a slanted box (a parallelepiped). Step 5 treats the rod as a line with no thickness; a real object needs room for its width.',
    linksTitle: 'Where to go next',
    lk1: '→ Pythagoras, step 2: a jigsaw proof of a² + b² = c², the fact used twice on this page',
    lk2: '→ Pythagoras, step 5: distance between two points from their coordinate differences; add a height difference and you get this page’s d',
    lk3: '→ Solid geometry, step 1: surface area and volume, two other measurements of the same a, b, c',
    lk4: '→ Vectors, step 0: arrows and components; d is the length of the arrow with components (a, b, c)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Space Diagonal · Pythagoras Twice, in 3D”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') {
  try { lang = window.localStorage.getItem('knowledge-lang') || ''; } catch (_) { lang = ''; }
  if (!lang) { try { lang = (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'; } catch (_) { lang = 'zh'; } }
}
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
