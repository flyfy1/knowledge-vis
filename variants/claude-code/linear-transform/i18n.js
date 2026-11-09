'use strict';
// 2D linear maps lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '二维线性变换 · 两根箭头带走整个平面',
    back: '← 知识索引',
    compare: '对照另一版本：二维线性变换 · 矩阵如何挪动平面 →',
    navLabel: '线性变换步骤导航',
    tagline: '一个 2×2 矩阵只有四个数，却能告诉你平面上每一个点被挪到哪里。秘密在于：只要知道两根基本箭头去了哪儿，其余的点都跟着它们走。七步里你会拖动这两根箭头，看网格怎样被拉、被剪、被翻、被压扁，再用面积、可逆性和先后顺序把矩阵读懂。',
    nav0: '0 两根箭头', nav1: '1 坐标不变', nav2: '2 何为线性', nav3: '3 行列式', nav4: '4 逆矩阵', nav5: '5 先后顺序', nav6: '6 收束',

    s0k: '第 0 步 · 四个数',
    s0t: '只知道两根箭头被送到哪里，能推出整个平面去了哪里吗？',
    s0e: '这一步要回答：平面上有无数个点，为什么四个数就能说清一个变换把它们各送到哪里？先认两根<strong>基向量</strong>：e₁ = (1, 0) 是向右一格的箭头，e₂ = (0, 1) 是向上一格的箭头；平面上的格子就是用它们一格一格搭出来的。一个 2×2 <strong>矩阵</strong> A = [[a, b], [c, d]] 规定：e₁ 被送到 Ae₁ = (a, c)（矩阵的第一列），e₂ 被送到 Ae₂ = (b, d)（第二列）。对<strong>线性变换</strong>来说，网格线变换后仍是等距的平行直线，原点不动（为什么，第 2 步再细看），所以格点 (i, j) = i·e₁ + j·e₂ 就被送到 i·Ae₁ + j·Ae₂：整张网格跟着两根箭头走。',
    aSlider: 'Ae₁ 的横坐标 a', cSlider: 'Ae₁ 的纵坐标 c', bSlider: 'Ae₂ 的横坐标 b', dSlider: 'Ae₂ 的纵坐标 d',
    prIdentity: '不动（单位矩阵）', prStretch: '横拉竖压', prShear: '剪切', prRotate: '转 45°', prMirror: '左右翻转', prFlatten: '压成一条线',
    morph0: '从原网格慢慢变过去',
    s0tagQ: '(2, 1) 的像',
    c0title: '灰色：原网格 · 彩色：A 作用后的网格',
    s0lgE1: 'Ae₁（第一列）', s0lgE2: 'Ae₂（第二列）', s0lgGrid: '原网格与 e₁、e₂', s0lgF: '字母 F 及其像（看有没有被翻面）',
    s0readout: 'A = [[{a}, {b}], [{c}, {d}]]：e₁ = (1, 0) 被送到 Ae₁ = ({a}, {c})，e₂ = (0, 1) 被送到 Ae₂ = ({b}, {d})。比如格点 (2, 1) = 2·e₁ + 1·e₂ 被送到 2·Ae₁ + 1·Ae₂ = ({x}, {y})。',
    s0morph: '过渡中：{p}%（矩阵从单位矩阵逐渐变成 A）。',
    s0hint: '观察顺序：先按「剪切」：只有 Ae₂ 斜了过去，竖线全部跟着它倾斜，横线不动。再按「转 45°」「左右翻转」，注意字母 F：翻转后它变成了镜像。然后自己拖四个滑杆：只动 a、c 时只有橙色箭头在动，所有「沿 e₁ 方向」的网格线跟着转。最后按「从原网格慢慢变过去」，看灰色网格怎样连续地变成彩色网格（动画只是把 A 和单位矩阵按比例混合，便于观察）。',

    s1k: '第 1 步 · 坐标不变，换的是基',
    s1t: '点 p = (x, y) 变换后在哪里？',
    s1e: '这一步要回答：知道 A，怎么算任意一点 p 的去处 Ap？把 p = (x, y) 拆开：从原点出发，沿 e₁ 走 x 格，再沿 e₂ 走 y 格，也就是 p = x·e₁ + y·e₂（这是<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">向量加法：箭头首尾相接 →</a>）。线性变换保留这种「走法」：变换后的 Ap 就是沿 Ae₁ 走 x 步、再沿 Ae₂ 走 y 步。所以<strong>坐标 (x, y) 不变，变的是两根基向量</strong>。把它写开，就是矩阵乘向量的规则：Ap = x·(a, c) + y·(b, d) = (ax + by, cx + dy)。这里用的是第 0 步设好的矩阵 A。',
    xSlider: 'x：沿 e₁ 走几步', ySlider: 'y：沿 e₂ 走几步',
    c1a: '原平面：p = x·e₁ + y·e₂', c1b: '变换后：Ap = x·Ae₁ + y·Ae₂',
    s1lgX: '沿第一根基向量走 x 步', s1lgY: '再沿第二根走 y 步', s1lgP: '终点 p / Ap',
    s1readout: 'p = ({x}, {y}) = {x}·e₁ + {y}·e₂　→　Ap = {x}·Ae₁ + {y}·Ae₂ = {x}·({a}, {c}) + {y}·({b}, {d}) = ({px}, {py})',
    s1hint: '观察顺序：先保持 A 不变，拖 x、y：两幅图里的折线走法一模一样（橙段 x 步、绿段 y 步），只是「变换后」那幅图的步子换成了 Ae₁、Ae₂。再回第 0 步改矩阵，回来看：「原平面」那幅图完全不变，「变换后」那幅图的 Ap 跟着新的两根箭头走。读数最后一项就是矩阵乘向量的结果。',

    s2k: '第 2 步 · 什么样的变换算线性',
    s2t: '为什么矩阵变换后，网格线还是等距的平行直线？',
    s2e: '这一步要回答：「线性」到底要求什么？一个变换 T 叫<strong>线性</strong>，要满足两条：先相加再变换，等于先变换再相加，T(u + v) = T(u) + T(v)；先放大再变换，等于先变换再放大，T(λu) = λT(u)（λ 是任意实数）。由第二条取 λ = 0 立刻得到 T(0) = 0：原点必须不动。第 1 步「坐标不变、换基」能成立，靠的正是这两条。下面三个变换都先用同一个矩阵，再分别：什么都不加；整体再平移一段；再把平面掰弯一点。两根箭头 u、v 固定，λ 由滑杆调。',
    mapL: '只用矩阵 A', mapT: 'A 之后再平移', mapN: 'A 之后再掰弯',
    lamSlider: '放大倍数 λ',
    c2title: '网格的像 · 白点落进空心圈才满足第一条',
    s2lgUV: 'u、v 及其像', s2lgSum: 'T(u + v)', s2lgSum2: 'T(u) + T(v)', s2lgLam: 'T(λu) 与 λ·T(u)',
    s2readout: '{name}：原点被送到 ({ox}, {oy})；|T(u + v) − (T(u) + T(v))| = {g1}；λ = {lam} 时 |T(λu) − λ·T(u)| = {g2}。{verdict}',
    vLinear: '两条都满足（误差只是浮点舍入），这是线性变换。',
    vShift: '网格仍是直线，但原点被挪走，第一条规则不成立：平移不是线性变换（叫仿射变换）。',
    vBent: '原点没动，但网格线弯了，第一条规则不成立：不是线性变换。',
    s2hint: '观察顺序：先选「只用矩阵 A」，拖 λ：实心点和空心圈始终重合，两个误差都是 0。换「A 之后再平移」：网格依然笔直，但原点（中心的小十字）被挪走了，白点和空心圈分开了一段固定的距离（正好是平移的长度）；第二条规则只在 λ = 1 时碰巧成立。换「A 之后再掰弯」：原点不动，可是网格弯了，白点和空心圈分开了；λ 离 0 和 1 越远，两个粉色点也分得越开。所以「原点不动」只是必要条件，判断线性要看那两条规则。',

    s3k: '第 3 步 · 行列式',
    s3t: '变换以后，面积放大了几倍？方向会不会翻过来？',
    s3e: '这一步要回答：线性变换把每一块面积都放大同样的倍数吗？这个倍数是多少？单位正方形（以 e₁、e₂ 为两边，面积 1）被送到以 Ae₁、Ae₂ 为两边的平行四边形。它的<strong>带符号面积</strong>就是<strong>行列式</strong> det A = ad − bc：大小是面积的放大倍数，正号表示 e₁ 到 e₂ 的转向（逆时针）保持不变，负号表示整个平面被翻了个面（像照镜子）。因为整张网格的每个小格都变成同样的平行四边形，任何图形的面积都放大同样的 |det A| 倍。这里 Ae₁ 固定（长 1.4，指向 30°），滑杆让 Ae₂（长 1.2）绕原点转一圈，转到的角度记作 θ。',
    thSlider: 'Ae₂ 的方向 θ（度）', sweep3: '让 Ae₂ 转一整圈',
    c3a: '单位正方形与字母 F 的像', c3b: '行列式随 θ 的变化（点为走过的 θ）',
    s3lgPos: 'det > 0：方向保持', s3lgNeg: 'det < 0：翻面', s3lgArc: '弯箭头：从 Ae₁ 转到 Ae₂ 的方向',
    s3readout: 'θ = {th}°：det A = ad − bc = {det}。面积放大 |det| = {abs} 倍：单位正方形的像面积 {sq}，字母 F 的面积 0.81 → {f}（比值 {ratio}）。{orient}',
    oPos: '方向保持：从 Ae₁ 逆时针转到 Ae₂。', oNeg: '方向翻转：从 Ae₁ 要顺时针才能转到 Ae₂，F 变成了镜像。', oZero: 'Ae₁ 与 Ae₂ 在一条直线上：平面被压成一条线，面积变成 0。',
    s3hint: '观察顺序：按「让 Ae₂ 转一整圈」，或自己拖 θ。θ 从 30° 到 210° 之间，Ae₂ 在 Ae₁ 的逆时针一侧，det 为正、平行四边形是青色；越过 210° 后它跑到顺时针一侧，det 变负、图形变粉、F 成了镜像。正好在 30° 和 210°，两根箭头共线，平行四边形压扁成线段，det = 0。副图里描出的曲线是 det = 1.68·sin(θ − 30°)：|det| 最大 1.68 = 1.4 × 1.2，出现在两根箭头垂直时。',

    s4k: '第 4 步 · 逆矩阵',
    s4t: '只看到变换后的点，能不能唯一地找回原来的点？',
    s4e: '这一步要回答：已知 Ap，能不能求出 p？如果能，做这件事的矩阵叫 A 的<strong>逆矩阵</strong> A⁻¹，满足 A⁻¹(Ap) = p。2×2 时有现成公式：A⁻¹ = (1 / det A)·[[d, −b], [−c, a]]。它要除以 det A（第 3 步：面积的放大倍数），所以 det A = 0 时不存在：平面被压成一条线，一整条直线上的点都被送到同一个点，从结果没法分辨原来是哪一个。这里的矩阵是 A = [[1, s], [0.5, 1]]，det A = 1 − 0.5s，s = 2 时恰好为 0。「变换后」那幅图在 Ap 周围画了一个半径 0.2 的小圈，代表测量 Ap 时可能有的误差；「原平面」那幅图是用 A⁻¹ 把这个圈送回去的样子：找回的 p 可能落在它里面的任何地方。',
    sSlider: '参数 s（det A = 1 − 0.5s）',
    c4a: '原平面：p 与「找回来的可能范围」', c4b: '变换后：Ap 与半径 0.2 的误差圈',
    s4lgP: 'p 与 Ap', s4lgErr: '误差圈及其送回去的形状', s4lgKer: '整条被压到同一点的直线（det = 0 时）',
    s4readout: 's = {s}：det A = {det}，A⁻¹ = [[{ia}, {ib}], [{ic}, {id}]]。A⁻¹ 把 Ap = ({ax}, {ay}) 送回 ({bx}, {by}) = p。误差圈送回去后最远偏离 p {far}，是原半径 0.2 的 {g} 倍。',
    s4singular: 's = {s}：det A = 0，没有逆矩阵。方向 ({nx}, {ny}) 上的整条直线都被压到同一个点：从 Ap 无法知道 p 是这条线上的哪一点。',
    s4hint: '观察顺序：把 s 从 0 慢慢拖向 2。「变换后」的网格越来越扁，「原平面」里的椭圆越来越长：det 越接近 0，Ap 上同样 0.2 的误差，找回 p 时会被放得越大（读数里的倍数）。到 s = 2 时网格压成一条线，椭圆消失，取而代之的是一整条粉色直线：它上面所有点都被送到同一个 Ap。再拖过 2，det 变负，逆矩阵又存在了，只是平面被翻了面。这和方程组「无解或无穷多解」的特殊情形是同一回事：<a class="xlink" href="../../../math/algebra/simultaneous-equations/#step4">两条直线平行或重合 →</a>。',

    s5k: '第 5 步 · 先后顺序',
    s5t: '先旋转再剪切，和先剪切再旋转，结果一样吗？',
    s5e: '这一步要回答：连着做两个变换时，顺序重要吗？先做 B 再做 A，合起来还是一个线性变换，它的矩阵是乘积 AB（注意顺序：写在右边的先做）。这里 R 是逆时针旋转 θ，S 是横向剪切（e₁ 不动，e₂ 被推到 (k, 1)）。橙色 F 是先转再剪：S·R；绿色 F 是先剪再转：R·S。灰色是原来的 F。',
    th5Slider: '旋转角 θ（度）', k5Slider: '剪切量 k',
    c5title: '灰：原 F · 橙：S·R · 绿：R·S',
    s5lgO: '先转再剪 S·R', s5lgG: '先剪再转 R·S', s5lgF: '原来的 F',
    s5readout: 'S·R = [[{a1}, {b1}], [{c1}, {d1}]]，R·S = [[{a2}, {b2}], [{c2}, {d2}]]。{same}两种顺序的行列式都是 det S × det R = {d}，面积都不变。',
    sSame: '两者相同：这时顺序无所谓。', sDiff: '两者不同：两个 F 落在不同的地方，顺序有影响。',
    s5hint: '观察顺序：先保持 θ = 90°、k = 1，两个 F 明显分开。把 k 拖到 0（不剪切），两个 F 重合；把 θ 拖到 0° 或 ±180°，也重合（转 180° 就是乘以 −1，和谁都能交换）。其余情况它们都不同。不论顺序，两个 F 的面积始终相同（读数里的行列式），变的是位置和朝向。旋转与旋转之间顺序无所谓，角度直接相加，这在<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">复数乘法：模相乘、角相加 →</a>里还会见到。',

    s6k: '第 6 步 · 收束', s6t: '两列、一个面积、一个顺序',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，矩阵的两列就是 e₁、e₂ 的去处，整张网格跟着它们走；<strong>第 1 步</strong>，坐标不变、基换了，Ap = x·Ae₁ + y·Ae₂ 就是矩阵乘向量；<strong>第 2 步</strong>，线性 = 保持加法与数乘，原点不动、网格仍是等距直线；<strong>第 3 步</strong>，det A = ad − bc 是带符号的面积倍数，负号表示翻面；<strong>第 4 步</strong>，det A ≠ 0 才能倒回去，越接近 0 越难准确倒回；<strong>第 5 步</strong>，AB 先做 B，一般 AB ≠ BA，但 det(AB) = det A · det B。',
    formula: 'Ap = x·(a, c) + y·(b, d) = (ax + by, cx + dy)\ndet A = ad − bc，任意图形面积 × |det A|\nA⁻¹ = (1/det A)·[[d, −b], [−c, a]]（det A ≠ 0）\ndet(AB) = det A · det B，一般 AB ≠ BA',
    boundary: '适用范围：只讲实数的二维线性变换（含旋转、剪切、伸缩、翻转、压扁）；不含平移（第 2 步说明它不是线性的）、三维、数值误差分析。并不是每个矩阵都有「只被拉伸、方向不变」的实方向（比如旋转 45°），这是下一页的问题。',
    linksTitle: '接着去哪儿',
    lk1: '→ 哪些方向只被拉长、不被转动：特征向量（特征向量页第 1 步）',
    lk2: '→ 向量相加：箭头首尾相接（向量页第 1 步）',
    lk3: '→ 乘以 i 就是逆时针转 90°（复数页第 3 步）',
    lk4: '→ det = 0 的另一面：方程组无解或无穷多解（二元一次方程组页第 4 步）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《二维线性变换 · 矩阵如何挪动平面》的平行版本。'
  },
  en: {
    pageTitle: '2D Linear Maps · Two Arrows Carry the Whole Plane',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: 2D Linear Transformations · How Matrices Move the Plane →',
    navLabel: 'Linear map steps',
    tagline: 'A 2×2 matrix holds only four numbers, yet it tells you where every point of the plane goes. The trick: once you know where two basic arrows land, every other point follows them. Over seven steps you will drag those two arrows, watch the grid get stretched, sheared, flipped and flattened, and then read the matrix through area, invertibility and order.',
    nav0: '0 Two arrows', nav1: '1 Same coordinates', nav2: '2 What is linear', nav3: '3 Determinant', nav4: '4 Inverse', nav5: '5 Order', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · FOUR NUMBERS',
    s0t: 'If you only know where two arrows go, can you tell where the whole plane goes?',
    s0e: 'This step asks: the plane has infinitely many points, so how can four numbers say where a map sends every one of them? Meet the two <strong>basis vectors</strong>: e₁ = (1, 0) is one step to the right and e₂ = (0, 1) one step up; the grid is built from them, square by square. A 2×2 <strong>matrix</strong> A = [[a, b], [c, d]] declares that e₁ goes to Ae₁ = (a, c) (the first column) and e₂ goes to Ae₂ = (b, d) (the second column). For a <strong>linear map</strong> the grid lines stay straight, parallel and evenly spaced, and the origin stays put (step 2 looks at why), so the grid point (i, j) = i·e₁ + j·e₂ goes to i·Ae₁ + j·Ae₂: the whole grid follows the two arrows.',
    aSlider: 'x-coordinate of Ae₁, a', cSlider: 'y-coordinate of Ae₁, c', bSlider: 'x-coordinate of Ae₂, b', dSlider: 'y-coordinate of Ae₂, d',
    prIdentity: 'Do nothing (identity)', prStretch: 'Stretch across, squash up', prShear: 'Shear', prRotate: 'Rotate 45°', prMirror: 'Mirror left–right', prFlatten: 'Flatten onto a line',
    morph0: 'Morph slowly from the original grid',
    s0tagQ: 'image of (2, 1)',
    c0title: 'Grey: original grid · colour: the grid after A',
    s0lgE1: 'Ae₁ (first column)', s0lgE2: 'Ae₂ (second column)', s0lgGrid: 'original grid with e₁, e₂', s0lgF: 'the letter F and its image (is it flipped?)',
    s0readout: 'A = [[{a}, {b}], [{c}, {d}]]: e₁ = (1, 0) goes to Ae₁ = ({a}, {c}) and e₂ = (0, 1) goes to Ae₂ = ({b}, {d}). For example, the grid point (2, 1) = 2·e₁ + 1·e₂ goes to 2·Ae₁ + 1·Ae₂ = ({x}, {y}).',
    s0morph: 'Morphing: {p}% (the matrix blends from the identity into A).',
    s0hint: 'What to watch: press “Shear” first. Only Ae₂ tips over, and every vertical line tips with it while the horizontal lines stay put. Then try “Rotate 45°” and “Mirror left–right” and watch the letter F: after the mirror it is reversed. Next drag the four sliders yourself. Moving only a and c moves only the orange arrow, and every grid line running along e₁ turns with it. Finally press “Morph slowly from the original grid” to see the grey grid turn continuously into the coloured one (the animation just blends A with the identity in proportion so you can follow it).',

    s1k: 'STEP 1 · SAME COORDINATES, NEW BASIS',
    s1t: 'Where does the point p = (x, y) end up?',
    s1e: 'This step asks: given A, how do you work out where any point p goes? Break p = (x, y) into moves: from the origin, take x steps along e₁, then y steps along e₂, so p = x·e₁ + y·e₂ (this is <a class="xlink" href="../../../math/linear-algebra/vectors/#step1">vector addition: arrows placed head to tail →</a>). A linear map keeps this recipe: Ap is x steps along Ae₁ followed by y steps along Ae₂. So <strong>the coordinates (x, y) stay the same; the two basis vectors change</strong>. Written out, that is the rule for multiplying a matrix by a vector: Ap = x·(a, c) + y·(b, d) = (ax + by, cx + dy). The matrix here is the one you set in step 0.',
    xSlider: 'x: steps along e₁', ySlider: 'y: steps along e₂',
    c1a: 'Original plane: p = x·e₁ + y·e₂', c1b: 'After the map: Ap = x·Ae₁ + y·Ae₂',
    s1lgX: 'x steps along the first basis vector', s1lgY: 'then y steps along the second', s1lgP: 'end point p / Ap',
    s1readout: 'p = ({x}, {y}) = {x}·e₁ + {y}·e₂　→　Ap = {x}·Ae₁ + {y}·Ae₂ = {x}·({a}, {c}) + {y}·({b}, {d}) = ({px}, {py})',
    s1hint: 'What to watch: keep A fixed and drag x and y. Both pictures take exactly the same route (x orange steps, then y green steps); in the “after” picture the steps are simply Ae₁ and Ae₂. Then go back to step 0, change the matrix and return: the “original plane” picture is unchanged while Ap in the “after” picture follows the new arrows. The last item of the readout is the matrix-times-vector result.',

    s2k: 'STEP 2 · WHAT COUNTS AS LINEAR',
    s2t: 'Why do grid lines stay straight, parallel and evenly spaced under a matrix?',
    s2e: 'This step asks: what exactly does “linear” demand? A map T is <strong>linear</strong> when it obeys two rules. Adding then mapping equals mapping then adding: T(u + v) = T(u) + T(v). Scaling then mapping equals mapping then scaling: T(λu) = λT(u) for any real λ. Taking λ = 0 in the second rule gives T(0) = 0 straight away: the origin must stay put. The “same coordinates, new basis” idea of step 1 works precisely because of these two rules. The three maps below all start with the same matrix and then: add nothing; shift the whole plane; or bend it slightly. The arrows u and v are fixed; the slider sets λ.',
    mapL: 'Matrix A only', mapT: 'A, then shift', mapN: 'A, then bend',
    lamSlider: 'Scale factor λ',
    c2title: 'Grid image · rule 1 holds iff the dot sits in the ring',
    s2lgUV: 'u, v and their images', s2lgSum: 'T(u + v)', s2lgSum2: 'T(u) + T(v)', s2lgLam: 'T(λu) and λ·T(u)',
    s2readout: '{name}: the origin goes to ({ox}, {oy}); |T(u + v) − (T(u) + T(v))| = {g1}; at λ = {lam}, |T(λu) − λ·T(u)| = {g2}. {verdict}',
    vLinear: 'Both rules hold (the gaps are floating-point rounding only): this is a linear map.',
    vShift: 'The grid is still straight, but the origin has moved and rule 1 fails: a shift is not linear (it is called affine).',
    vBent: 'The origin stays put, but the grid lines bend and rule 1 fails: not linear.',
    s2hint: 'What to watch: choose “Matrix A only” and drag λ. The solid dot and the ring always coincide and both gaps are 0. Switch to “A, then shift”: the grid is still straight, but the origin (the small cross at the centre) has moved and the dot and ring sit a fixed distance apart (exactly the length of the shift); rule 2 happens to hold only at λ = 1. Switch to “A, then bend”: the origin stays, yet the grid curves and the dot leaves the ring; the further λ is from 0 and 1, the further apart the two pink points drift too. So “the origin stays put” is necessary but not enough; linearity means the two rules.',

    s3k: 'STEP 3 · THE DETERMINANT',
    s3t: 'After the map, how many times bigger is an area — and can it be flipped?',
    s3e: 'This step asks: does a linear map scale every area by the same factor, and what is that factor? The unit square (sides e₁ and e₂, area 1) goes to the parallelogram with sides Ae₁ and Ae₂. Its <strong>signed area</strong> is the <strong>determinant</strong> det A = ad − bc. Its size is the area scale factor; a plus sign means the turn from e₁ to e₂ (anticlockwise) is kept, a minus sign means the whole plane has been flipped over, like a mirror image. Every little grid square becomes the same parallelogram, so every shape’s area is multiplied by the same |det A|. Here Ae₁ is fixed (length 1.4, pointing at 30°) and the slider swings Ae₂ (length 1.2) around the origin; its angle is θ.',
    thSlider: 'Direction of Ae₂, θ (degrees)', sweep3: 'Swing Ae₂ all the way round',
    c3a: 'Unit square and letter F, mapped', c3b: 'det A against θ (dots: angles visited)',
    s3lgPos: 'det > 0: orientation kept', s3lgNeg: 'det < 0: flipped', s3lgArc: 'curved arrow: the turn from Ae₁ to Ae₂',
    s3readout: 'θ = {th}°: det A = ad − bc = {det}. Areas scale by |det| = {abs}: the unit square’s image has area {sq}, and the letter F goes from 0.81 to {f} (ratio {ratio}). {orient}',
    oPos: 'Orientation kept: Ae₂ is an anticlockwise turn from Ae₁.', oNeg: 'Orientation flipped: getting from Ae₁ to Ae₂ takes a clockwise turn, and the F is mirrored.', oZero: 'Ae₁ and Ae₂ lie on one line: the plane is flattened onto a line and areas become 0.',
    s3hint: 'What to watch: press “Swing Ae₂ all the way round”, or drag θ yourself. Between 30° and 210°, Ae₂ is on the anticlockwise side of Ae₁, det is positive and the parallelogram is cyan. Past 210° it moves to the clockwise side, det turns negative, the shape turns pink and the F is mirrored. At exactly 30° and 210° the two arrows are collinear, the parallelogram collapses to a segment and det = 0. The curve traced in the side panel is det = 1.68·sin(θ − 30°): the largest |det| is 1.68 = 1.4 × 1.2, reached when the two arrows are perpendicular.',

    s4k: 'STEP 4 · THE INVERSE',
    s4t: 'Seeing only where a point landed, can you recover where it started?',
    s4e: 'This step asks: given Ap, can you find p? If you can, the matrix that does it is the <strong>inverse</strong> A⁻¹, with A⁻¹(Ap) = p. For 2×2 matrices there is a ready formula: A⁻¹ = (1 / det A)·[[d, −b], [−c, a]]. It divides by det A (step 3: the area scale factor), so it does not exist when det A = 0: the plane is flattened onto a line, a whole line of points lands on a single point, and the result cannot tell you which one you started from. The matrix here is A = [[1, s], [0.5, 1]], with det A = 1 − 0.5s, exactly 0 at s = 2. In the “after” picture, a small circle of radius 0.2 around Ap stands for the error you might make measuring Ap; the “before” picture shows that circle sent back by A⁻¹: the recovered p could be anywhere inside it.',
    sSlider: 'Parameter s (det A = 1 − 0.5s)',
    c4a: 'Before: p and where it could have come from', c4b: 'After: Ap with a 0.2 error circle',
    s4lgP: 'p and Ap', s4lgErr: 'error circle and its shape when sent back', s4lgKer: 'the whole line squashed onto one point (when det = 0)',
    s4readout: 's = {s}: det A = {det}, A⁻¹ = [[{ia}, {ib}], [{ic}, {id}]]. A⁻¹ sends Ap = ({ax}, {ay}) back to ({bx}, {by}) = p. Sent back, the error circle reaches up to {far} from p, {g} times the original radius 0.2.',
    s4singular: 's = {s}: det A = 0, so there is no inverse. The whole line in the direction ({nx}, {ny}) is squashed onto one point: from Ap you cannot tell which point of that line p was.',
    s4hint: 'What to watch: drag s slowly from 0 towards 2. The grid in the “after” picture gets flatter and the ellipse in the “before” picture gets longer: the closer det is to 0, the more the same 0.2 error in Ap is magnified when you recover p (the factor in the readout). At s = 2 the grid collapses onto a line, the ellipse disappears, and a whole pink line takes its place: every point on it lands on the same Ap. Drag past 2 and det turns negative; the inverse exists again, but the plane is flipped. This is the same story as the special cases of simultaneous equations, no solution or infinitely many: <a class="xlink" href="../../../math/algebra/simultaneous-equations/#step4">two parallel or identical lines →</a>.',

    s5k: 'STEP 5 · ORDER',
    s5t: 'Rotate then shear, or shear then rotate: same result?',
    s5e: 'This step asks: when you apply two maps in a row, does the order matter? Doing B first and then A is again a linear map, and its matrix is the product AB (mind the order: the one written on the right acts first). Here R rotates anticlockwise by θ and S is a horizontal shear (e₁ stays, e₂ is pushed to (k, 1)). The orange F is rotate-then-shear, S·R; the green F is shear-then-rotate, R·S. The grey F is the original.',
    th5Slider: 'Rotation angle θ (degrees)', k5Slider: 'Shear amount k',
    c5title: 'Grey: F · orange: S·R · green: R·S',
    s5lgO: 'rotate then shear S·R', s5lgG: 'shear then rotate R·S', s5lgF: 'original F',
    s5readout: 'S·R = [[{a1}, {b1}], [{c1}, {d1}]], R·S = [[{a2}, {b2}], [{c2}, {d2}]]. {same} Both orders have determinant det S × det R = {d}, so areas are unchanged either way.',
    sSame: 'They are equal: here the order makes no difference.', sDiff: 'They differ: the two F’s land in different places, so the order matters.',
    s5hint: 'What to watch: with θ = 90° and k = 1 the two F’s are clearly apart. Drag k to 0 (no shear) and they coincide; drag θ to 0° or ±180° and they coincide too (a 180° turn is multiplication by −1, which commutes with everything). In every other case they differ. Whatever the order, the two F’s always have the same area (the determinant in the readout); what changes is position and orientation. Rotations commute with each other and their angles simply add, which you will meet again in <a class="xlink" href="../../../math/algebra/complex-numbers/#step4">complex multiplication: lengths multiply, angles add →</a>.',

    s6k: 'STEP 6 · WRAP-UP', s6t: 'Two columns, one area, one order',
    s6fin: 'Looking back: <strong>Step 0</strong> — the matrix’s two columns are where e₁ and e₂ land, and the whole grid follows them. <strong>Step 1</strong> — same coordinates, new basis: Ap = x·Ae₁ + y·Ae₂ is matrix-times-vector. <strong>Step 2</strong> — linear means preserving addition and scaling; the origin stays and grid lines stay straight and evenly spaced. <strong>Step 3</strong> — det A = ad − bc is the signed area factor, with a minus sign for a flip. <strong>Step 4</strong> — you can undo the map only when det A ≠ 0, and the closer it is to 0, the harder it is to undo accurately. <strong>Step 5</strong> — AB means B first; in general AB ≠ BA, but det(AB) = det A · det B.',
    formula: 'Ap = x·(a, c) + y·(b, d) = (ax + by, cx + dy)\ndet A = ad − bc; every area × |det A|\nA⁻¹ = (1/det A)·[[d, −b], [−c, a]] (det A ≠ 0)\ndet(AB) = det A · det B; in general AB ≠ BA',
    boundary: 'Where this holds: real two-dimensional linear maps only (rotations, shears, stretches, flips, flattenings). Shifts (step 2 shows they are not linear), three dimensions and numerical error analysis are left out. Not every matrix has a real direction that is only stretched and never turned (a 45° rotation has none); that is the next page’s question.',
    linksTitle: 'Where to go next',
    lk1: '→ Which directions are only stretched, never turned: eigenvectors (Eigenvectors, step 1)',
    lk2: '→ Adding vectors: arrows head to tail (Vectors, step 1)',
    lk3: '→ Multiplying by i is a 90° anticlockwise turn (Complex Numbers, step 3)',
    lk4: '→ The other face of det = 0: systems with no solution or infinitely many (Simultaneous Equations, step 4)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “2D Linear Transformations · How Matrices Move the Plane”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
