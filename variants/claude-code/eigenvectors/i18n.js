'use strict';
// Eigenvector lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '特征向量 · 只伸缩、不转向的方向',
    back: '← 知识索引',
    compare: '对照另一版本：特征值与特征向量 · 矩阵不转的那些方向 →',
    navLabel: '特征向量步骤导航',
    tagline: '一个 2×2 矩阵 A 把平面上的每根箭头 v 送到另一根箭头 Av，大多数箭头会被转向。少数方向例外：Av 仍落在 v 所在的直线上，只被拉长、缩短或翻转。这些方向叫特征向量，伸缩的倍数叫特征值。六步里你会先用眼睛找、再用方程算，看清哪些矩阵没有这样的方向，然后看它们为什么决定了「反复作用」的结局和一团数据的主轴。',
    nav0: '0 矩阵移动箭头', nav1: '1 找不转的方向', nav2: '2 解方程', nav3: '3 不一定有', nav4: '4 反复作用', nav5: '5 数据的主轴', nav6: '6 收束',

    s0k: '第 0 步 · 矩阵做了什么',
    s0t: '矩阵把一圈箭头送到哪里？有没有箭头没被转向？',
    s0e: '这一步要回答：给定矩阵 A = [[a, b], [c, d]]，它怎样移动平面上的箭头？箭头 v = (x, y) 被送到 <strong>Av</strong> = (a·x + b·y, c·x + d·y)。图中从原点均匀画出 24 根长度为 1 的箭头（淡色，构成虚线单位圆），每根被 A 送到同色的粗箭头；单位圆的像是一个椭圆（灰线）。大多数粗箭头和它的淡色原箭头不在同一条直线上，也就是被<strong>转向</strong>了。如果某个方向上 Av 恰好落在 v 所在的直线上（同向或反向都算），就说 v 是 A 的<strong>特征向量</strong>，Av = λv 中的倍数 λ 叫<strong>特征值</strong>。白色虚线画出了这些方向（由第 2 步的方法算出）。默认矩阵有两条：沿 45° 的箭头被拉长到 2 倍，沿约 116.6° 的箭头被缩短到 0.5 倍。',
    c0aria: '24 根单位箭头及其在矩阵作用下的像', c0title: '淡色：v（单位圆上 24 根）；同色粗箭头：Av',
    lgRing: '同色一对：v（淡）与 Av（粗）', lgCircle: '单位圆', lgEllipse: '单位圆的像（椭圆）', lgEigLine: '特征方向（不被转向）',
    resetA: '恢复默认矩阵',
    s0readout: 'A = {A}。{eig}',
    eigNone: '这个矩阵没有实的特征方向：每根箭头都被转向（特征值是一对共轭复数）。',
    eigAll: '每个方向都是特征方向：所有箭头都只被乘以 {l}。',
    eigOne: '只有一条特征方向：θ ≈ {d}°，特征值 λ = {l}（重根）。',
    eigTwo: '两条特征方向：θ ≈ {d1}° 上 λ₁ = {l1}，θ ≈ {d2}° 上 λ₂ = {l2}。',
    s0hint: '观察顺序：先看默认矩阵，找出与白色虚线重合的那几对箭头：它们的粗箭头仍在原直线上，只是变长或变短。再只拖 b，把它拖到 0：矩阵变成下三角，一条特征方向转到竖直方向（90°）。把 a 拖到 −1、d 拖到 1、b 和 c 拖到 0：沿 x 轴的箭头被翻到反方向（λ = −1），这也算没被转向。后面两步都用你在这里设好的矩阵。',

    s1k: '第 1 步 · 用眼睛找',
    s1t: '转动 v，Av 什么时候正好落回 v 的直线上？',
    s1e: '这一步要回答：不靠公式，怎样找到特征方向？让单位箭头 v 指向角 θ，看 Av 偏离 v 所在直线多少度。右图纵轴就是这个<strong>偏转角</strong>：从 v 的直线量到 Av，逆时针为正，范围 −90° 到 90°（同向和反向都算 0，因为它们在同一条直线上）。θ 只需从 0° 扫到 180°：θ 和 θ + 180° 是同一条直线。偏转角穿过 0 的地方就是特征方向。把 Av 拆成两部分：沿 v 的部分 p·v，其中 p = (v·Av) ÷ (v·v)（<a class="xlink" href="../../../math/linear-algebra/vectors/#step3">→ 向量页第 3 步：点积与投影</a>），和垂直于 v 的剩余部分（粉色）。剩余部分为 0 时 Av = p·v，此时 p 就是特征值。',
    c1aria: 'v、Av 与偏离直线的部分', c1baria: '偏转角随 v 的方向变化', c1title: 'v 与 Av，A = {A}', c1btitle: 'Av 偏离 v 的直线多少度',
    lgV: 'v（单位长）', lgAv: 'Av', lgResid: 'Av 偏离 v 直线的部分', lgTurn: '偏转角（已扫过的方向）',
    dirSlider: 'v 的方向 θ', sweep1: '从 0° 扫到 180°', jumpE1: '跳到特征方向 1', jumpE2: '跳到特征方向 2',
    s1progress: '已扫 {c}/{N} 个方向。',
    s1zero: 'θ = {th}°：Av = 0，没有方向可比；这时 v 是特征值 0 的特征向量。',
    s1exact: 'θ = {th}°：偏离部分为 0（在浮点误差内），Av = {p}·v。这是特征方向，特征值 λ = {p}。',
    s1readout: 'θ = {th}°：Av 偏离 v 的直线 {a}°；沿 v 的系数 p = {p}，偏离部分长 {r}。',
    s1near: '已经很接近特征方向，但偏离部分不为 0，所以还不是。',
    s1hint: '观察顺序：按「从 0° 扫到 180°」，看右图绿线累积成一条曲线，它两次穿过 0，位置正好是白色竖虚线。再按「跳到特征方向 1」：粉色部分消失，读数给出特征值。最后（默认矩阵下）把滑杆拖到 44.5°，离 45° 只差半度：偏转角约 0.4°，读数仍会说「还不是」。特征方向是精确的，不是「差不多」。',

    s2k: '第 2 步 · 用方程算',
    s2t: '不扫描，怎样直接算出特征值？',
    s2e: '这一步要回答：能不能直接解出 λ？Av = λv 可以改写成 (A − λI)v = 0，I 是单位矩阵。要找的是一个非零的 v 被矩阵 A − λI 送到 0：也就是 A − λI 把某个方向整个压扁到原点。一个 2×2 矩阵会压扁某个方向，当且仅当它的<strong>行列式</strong>（它把面积放大的倍数，带正负号）为 0（<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step3">→ 线性变换页第 3 步：det = 0 时平面被压成一条线</a>）。展开得 det(A − λI) = λ² − (a + d)·λ + (ad − bc)，其中 a + d 叫<strong>迹</strong> tr，ad − bc 就是 det A。这个二次式叫<strong>特征多项式</strong>，它的根就是特征值。左图是这个二次式；右图是 A − λI 作用在单位圆上的像（紫色），面积 = π·|det(A − λI)|。λ 取到根时，紫色椭圆压成一条线段，被压扁到 0 的方向（白色虚线）就是特征方向。',
    c2aria: '特征多项式及其根', c2baria: 'A − λI 作用在单位圆上的像', c2title: 'det(A − λI) 随 λ 变化，A = {A}', c2btitle: 'A − λI 作用在单位圆上（λ = {l}）',
    lgPoly: '特征多项式 det(A − λI)', lgRoot: '根 = 特征值', lgShifted: '单位圆在 A − λI 下的像', lgNull: '被压扁到 0 的方向',
    lamSlider: '试验的 λ', jumpL1: '跳到 λ₁', jumpL2: '跳到 λ₂',
    s2head: 'tr = {tr}，det A = {det}，判别式 tr² − 4·det = {disc}。',
    s2roots2: '两个实根 λ₁ = {l1}，λ₂ = {l2}。',
    s2roots1: '一个重根 λ = {l1}。',
    s2rootsC: '没有实根，复根 λ = {re} ± {im}i。',
    s2now: '当前 λ = {l}：det(A − λI) = {d}，紫色区域面积 = {area}。',
    s2flat: '面积为 0：单位圆被压成线段，方向 θ ≈ {d}° 被压到 0，这就是特征方向。',
    s2nearflat: '面积接近 0，但还不是 0：λ 离根还差一点（被压得最扁的方向约 {d}°）。',
    s2hint: '观察顺序：慢慢拖 λ，同时看两张图：左图白点沿抛物线走，右图紫色椭圆越来越扁；白点碰到横轴（绿点）的那一刻，椭圆压成线段。按「跳到 λ₁」「跳到 λ₂」可以精确停在根上，白色虚线的方向和第 1 步找到的方向一致。',

    s3k: '第 3 步 · 不一定有',
    s3t: '每个矩阵都有不转向的方向吗？',
    s3e: '这一步要回答：特征方程 λ² − tr·λ + det = 0 什么时候有实根？看<strong>判别式</strong> tr² − 4·det：大于 0 有两个实根，等于 0 有一个重根，小于 0 没有实根。右图横轴是迹 tr，纵轴是行列式 det，橙色抛物线 det = tr²/4 正是判别式为 0 的边界：点在抛物线下方有两条特征方向，在上方（淡橙色区域）一条也没有。滑杆控制一族矩阵 [[1, 1], [k, 1]]：它的迹固定为 2、行列式为 1 − k、判别式为 4k，所以拖 k 时白点竖直移动并穿过抛物线。四个按钮是几种典型：旋转 30°（每根箭头都转 30°，没有实的特征方向）；剪切 [[1, 1], [0, 1]]（只有水平方向不转）；数乘 1.5·I（每个方向都只放大 1.5 倍）；镜面反射 [[1, 0], [0, −1]]（水平方向 λ = 1，竖直方向 λ = −1）。',
    c3aria: '所选矩阵对一圈箭头的作用', c3baria: '迹–行列式平面', c3title: 'A = {A}', c3btitle: '迹 tr（横）与行列式 det（纵）',
    lgParab: '判别式为 0 的抛物线 det = tr²/4', lgTD: '当前矩阵（灰点是试过的）',
    kSlider: '矩阵 [[1, 1], [k, 1]] 中的 k',
    p3_rotation: '旋转 30°', p3_shear: '剪切', p3_scalar: '数乘 1.5·I', p3_reflection: '镜面反射',
    s3readout: 'tr = {tr}，det = {det}，判别式 = {disc}（抛物线在 tr 处的高度 tr²/4 = {q}）。',
    s3why_complex: '判别式小于 0，点在抛物线上方。',
    s3why_repeated: '判别式为 0，点在抛物线上；重根只给出一条方向。',
    s3why_scalar: '判别式为 0，但矩阵是数乘，所以不止一条，而是全部方向。',
    s3why_two: '判别式大于 0，点在抛物线下方。',
    s3hint: '观察顺序：把 k 从 1 慢慢拖到 −1：两条白色虚线越靠越近，k = 0 时合成一条（剪切），k < 0 时消失，左图每根粗箭头都偏离了自己的直线。再点「旋转 30°」：点在抛物线上方；点「数乘」：点正好在抛物线上，但每个方向都不转。抛物线上的点不一定只有一条方向，要看矩阵是不是数乘。',

    s4k: '第 4 步 · 反复作用',
    s4t: '把 A 一次又一次地作用在同一根箭头上，会发生什么？',
    s4e: '这一步要回答：Aᵏv（作用 k 次）最后指向哪里？把 v 写成两条特征方向上的分量之和：v = c₁e₁ + c₂e₂，其中 Ae₁ = λ₁e₁、Ae₂ = λ₂e₂。每作用一次，两个分量各自只乘自己的特征值：Aᵏv = c₁λ₁ᵏe₁ + c₂λ₂ᵏe₂。若 |λ₁| > |λ₂|，第二项相对第一项每次缩小到 |λ₂/λ₁| 倍，箭头就越来越贴近 e₁ 的直线（<strong>主方向</strong>，白色虚线）。左图把每次的结果缩放到长度 1，只看方向；右图是它与主方向的夹角（对数纵轴，每格缩小 10 倍），点几乎排成直线，说明每次缩小的比例固定。三个矩阵：默认 A（λ = 2 与 0.5，比值 0.25）；斐波那契矩阵 [[1, 1], [1, 0]]（λ = 黄金比 1.618 与 −0.618，比值约 0.382）；「接近」矩阵（λ = 1.2 与 0.7，比值约 0.583，收敛最慢）。',
    c4aria: '反复作用后箭头的方向', c4baria: '与主方向的夹角随作用次数变化', c4title: '方向（缩放到长度 1），A = {A}', c4btitle: '与主方向的夹角（对数刻度）',
    lgIter: 'Aᵏv 的方向（越新越亮）', lgDom: '主方向（|λ| 较大）', lgSub: '另一条特征方向', lgAngK: '第 k 次的夹角',
    p4_default: '默认 A', p4_fib: '斐波那契 [[1, 1], [1, 0]]', p4_close: '接近 [[1, 0.3], [0.2, 0.9]]',
    startSlider: '起始方向', kIter: '作用次数 k', play4: '从 k = 0 连续作用到 12',
    s4readout: '第 {k} 次：与主方向夹角 {ang}°。特征值之比 |λ₂/λ₁| = {q}，主特征值 {l}。',
    s4ratio: '这一次夹角缩小到上一次的 {r} 倍；长度放大了 {g} 倍。',
    s4nodom: '这个矩阵没有唯一的主方向（两个特征值大小相同，或不是两个实特征值）。',
    s4hint: '观察顺序：选默认 A，按「从 k = 0 连续作用到 12」：左图箭头很快贴上白线，右图每次下降约 0.6 格（0.25 倍）。换成「接近」矩阵，下降明显变慢（约 0.583 倍）。选斐波那契矩阵并把起始方向拖到 0°：v = (1, 0)，之后每次的坐标正好是相邻的两个斐波那契数 1, 1, 2, 3, 5, 8…，长度每次放大的倍数趋向 1.618。最后选「接近」矩阵、起始方向拖到 135°：v 恰好落在另一条特征方向上，c₁ = 0，箭头永远不转向主方向。',

    s5k: '第 5 步 · 数据的主轴',
    s5t: '一团数据沿哪个方向散得最开？',
    s5e: '这一步要回答：给一团二维数据点，沿哪条直线投影时，投影值的<strong>方差</strong>（偏离平均值的平方的平均）最大？把每个点投影到方向 u（单位长）的直线上，投影方差等于 uᵀSu，其中 S 是数据的<strong>协方差矩阵</strong> [[x 的方差, x 与 y 的协方差], [协方差, y 的方差]]。S 是对称矩阵（左下 = 右上），对称矩阵的两条特征方向总是互相垂直，且特征值都是实数。投影方差在主特征方向上取最大值 λ₁、在与之垂直的方向上取最小值 λ₂，而 λ₁ + λ₂ 等于两个方差之和。这就是<strong>主成分分析</strong>（PCA）。数据是 160 个用固定种子生成的模拟点，滑杆 ρ 控制两坐标的相关程度（生成时的设定值；样本里实测的相关会略有不同）。',
    c5aria: '数据点、试探方向和主轴', c5baria: '投影方差随方向变化', c5title: '数据、试探方向上的投影与主轴', c5btitle: '投影方差 uᵀSu 随方向变化',
    lgData: '数据点', lgProbe: '试探方向及投影点', lgAxes: '主轴（长度 2√λ）', lgVarCurve: '投影方差曲线',
    rhoSlider: '生成时的相关系数 ρ', probeSlider: '试探方向 θ', jump5: '跳到方差最大的方向',
    s5readout: '沿 θ = {th}° 投影的方差 = {v}。S 的特征值 λ₁ = {l1}（方向 {d1}°）、λ₂ = {l2}（方向 {d2}°），两方向相差 {gap}°；λ₁ + λ₂ = {sum}，x 与 y 的方差之和 = {tr}。',
    s5hint: '观察顺序：拖试探方向，看橙色投影点在直线上散开的宽度和右图白点一起变化；右图最高点正落在一条白色竖虚线上，最低点在另一条上，两者相差 90°。把 ρ 拖到 0：两个特征值接近，曲线变平，主轴方向变得不稳定（换一组数据可能换方向）。拖到 −0.6：主轴转到约 135°。',

    s6k: '第 6 步 · 收束',
    s6t: '特征向量回答了哪些问题？',
    s6fin: '<strong>第 0、1 步</strong>：特征向量是矩阵不转向的方向，Av = λv，λ 是伸缩倍数（负数表示翻转）。<strong>第 2 步</strong>：不必扫描，解特征方程 det(A − λI) = λ² − tr·λ + det = 0 即可；在根上 A − λI 把特征方向压扁到 0。<strong>第 3 步</strong>：判别式为负时没有实的特征方向（如旋转），为 0 时可能只有一条（剪切）也可能全部（数乘）。<strong>第 4 步</strong>：反复作用把箭头推向 |λ| 最大的方向，速度由 |λ₂/λ₁| 决定。<strong>第 5 步</strong>：对称矩阵的特征方向互相垂直，协方差矩阵的主特征方向就是数据散得最开的方向。',
    formula: 'Av = λv（v ≠ 0）\ndet(A − λI) = λ² − (a + d)·λ + (ad − bc) = 0\nAᵏ(c₁e₁ + c₂e₂) = c₁λ₁ᵏe₁ + c₂λ₂ᵏe₂',
    boundary: '适用范围：本页只讲 2×2 实矩阵；「有两条实特征方向」只对判别式为正的矩阵成立。第 1 步的「是特征方向」用浮点容差判断（偏离部分不超过 64 倍机器精度乘以 |Av|），不是精确证明。第 4 步的收束要求 |λ₁| ≠ |λ₂| 且起点在主方向上有分量。第 5 步的数据是固定种子的模拟点，不是实测数据。',
    linksTitle: '相关页面',
    lk1: '线性变换页第 3 步：det = 0 时平面被压成一条线（特征方程从这里来）→',
    lk2: '向量页第 3 步：点积与投影（第 1 步的系数 p）→',
    lk3: 'PageRank 页第 2 步：网页排名就是一个矩阵在特征值 1 上的特征向量 →',
    lk4: '复数页第 4 步：乘一个复数 = 旋转，旋转矩阵的特征值为什么是复数 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《特征值与特征向量 · 矩阵不转的那些方向》的平行版本。',
  },
  en: {
    pageTitle: 'Eigenvectors · The Directions That Only Stretch',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Eigenvalues & Eigenvectors · The Directions a Matrix Cannot Turn →',
    navLabel: 'Eigenvector step navigation',
    tagline: 'A 2×2 matrix A sends every arrow v in the plane to another arrow Av, and most arrows get turned. A few directions are exceptions: Av stays on the line of v and is only stretched, shrunk or flipped. Those directions are eigenvectors and the stretch factors are eigenvalues. In six steps you will find them by eye, then by equation, see which matrices have none, and then see why they decide what repeated application does and where a cloud of data spreads widest.',
    nav0: '0 Moving arrows', nav1: '1 Hunt by eye', nav2: '2 Solve', nav3: '3 Not always', nav4: '4 Repeat', nav5: '5 Data axes', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What a matrix does',
    s0t: 'Where does a matrix send a ring of arrows? Do any escape being turned?',
    s0e: 'This step asks: how does a matrix A = [[a, b], [c, d]] move the arrows of the plane? The arrow v = (x, y) is sent to <strong>Av</strong> = (a·x + b·y, c·x + d·y). The picture draws 24 evenly spaced arrows of length 1 from the origin (faint, forming the dashed unit circle); each is sent to the bold arrow of the same colour, and the unit circle as a whole goes to an ellipse (grey). Most bold arrows are not on the same line as their faint originals: they have been <strong>turned</strong>. If in some direction Av lands on the line of v (pointing either way), v is an <strong>eigenvector</strong> of A, and the factor λ in Av = λv is its <strong>eigenvalue</strong>. The white dashed lines show these directions (computed by the method of step 2). The default matrix has two: arrows along 45° are stretched to twice their length, and arrows along about 116.6° are shrunk to half.',
    c0aria: 'Twenty-four unit arrows and their images under the matrix', c0title: 'Faint: v (24 on the unit circle); bold, same colour: Av',
    lgRing: 'Same-colour pair: v (faint) and Av (bold)', lgCircle: 'Unit circle', lgEllipse: 'Image of the unit circle (ellipse)', lgEigLine: 'Eigen-directions (not turned)',
    resetA: 'Reset the matrix',
    s0readout: 'A = {A}. {eig}',
    eigNone: 'This matrix has no real eigen-direction: every arrow is turned (the eigenvalues are a complex-conjugate pair).',
    eigAll: 'Every direction is an eigen-direction: every arrow is just multiplied by {l}.',
    eigOne: 'Only one eigen-direction: θ ≈ {d}°, eigenvalue λ = {l} (a repeated root).',
    eigTwo: 'Two eigen-directions: λ₁ = {l1} along θ ≈ {d1}°, λ₂ = {l2} along θ ≈ {d2}°.',
    s0hint: 'What to try: with the default matrix, find the pairs of arrows that sit on the white dashed lines: their bold arrows stay on the original line and only get longer or shorter. Then drag only b to 0: the matrix becomes lower triangular and one eigen-direction swings round to vertical (90°). Set a to −1, d to 1 and b, c to 0: arrows along the x-axis get flipped (λ = −1), and that still counts as not turned. The next two steps use the matrix you set here.',

    s1k: 'Step 1 · Hunt by eye',
    s1t: 'Turn v. When does Av land back on the line of v?',
    s1e: 'This step asks: how can you find eigen-directions without a formula? Point the unit arrow v at angle θ and measure how far Av is turned off the line of v. The vertical axis on the right is this <strong>turn angle</strong>: measured from the line of v to Av, anticlockwise positive, from −90° to 90° (same and opposite directions both count as 0, since they are on the same line). θ only needs to sweep from 0° to 180°: θ and θ + 180° are the same line. Wherever the turn angle crosses 0 is an eigen-direction. Split Av into two parts: the part along v, p·v, with p = (v·Av) ÷ (v·v) (<a class="xlink" href="../../../math/linear-algebra/vectors/#step3">→ vectors, step 3: dot product and projection</a>), and what is left over at right angles to v (pink). When the leftover is 0, Av = p·v and p is the eigenvalue.',
    c1aria: 'v, Av and the part of Av off the line of v', c1baria: 'Turn angle against the direction of v', c1title: 'v and Av, A = {A}', c1btitle: 'How far Av is turned off the line of v',
    lgV: 'v (unit length)', lgAv: 'Av', lgResid: 'Part of Av off the line of v', lgTurn: 'Turn angle (directions swept so far)',
    dirSlider: 'Direction θ of v', sweep1: 'Sweep from 0° to 180°', jumpE1: 'Jump to eigen-direction 1', jumpE2: 'Jump to eigen-direction 2',
    s1progress: 'Swept {c}/{N} directions. ',
    s1zero: 'θ = {th}°: Av = 0, so there is no direction to compare; v is an eigenvector with eigenvalue 0.',
    s1exact: 'θ = {th}°: the leftover part is 0 (within floating-point error) and Av = {p}·v. This is an eigen-direction, with eigenvalue λ = {p}.',
    s1readout: 'θ = {th}°: Av is turned {a}° off the line of v; the coefficient along v is p = {p}, and the leftover part has length {r}.',
    s1near: ' Very close to an eigen-direction, but the leftover is not 0, so not yet.',
    s1hint: 'What to try: press "Sweep from 0° to 180°" and watch the green line build up on the right. It crosses 0 twice, exactly at the white dashed verticals. Then press "Jump to eigen-direction 1": the pink part disappears and the readout gives the eigenvalue. Finally (with the default matrix) drag the slider to 44.5°, just half a degree from 45°: the turn angle is about 0.4°, and the readout still says "not yet". An eigen-direction is exact, not "close enough".',

    s2k: 'Step 2 · Solve for it',
    s2t: 'Without sweeping, how do you compute the eigenvalues directly?',
    s2e: 'This step asks: can you solve for λ directly? Rewrite Av = λv as (A − λI)v = 0, where I is the identity matrix. We want a non-zero v that A − λI sends to 0: A − λI must squash some whole direction onto the origin. A 2×2 matrix squashes a direction exactly when its <strong>determinant</strong> (the signed factor by which it scales areas) is 0 (<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step3">→ linear transformations, step 3: det = 0 squashes the plane onto a line</a>). Expanding, det(A − λI) = λ² − (a + d)·λ + (ad − bc), where a + d is the <strong>trace</strong> tr and ad − bc is det A. This quadratic is the <strong>characteristic polynomial</strong>, and its roots are the eigenvalues. The left panel plots it; the right panel shows the image of the unit circle under A − λI (violet), whose area is π·|det(A − λI)|. When λ hits a root, the violet ellipse collapses to a segment, and the direction squashed to 0 (white dashed) is the eigen-direction.',
    c2aria: 'Characteristic polynomial and its roots', c2baria: 'Image of the unit circle under A − λI', c2title: 'det(A − λI) against λ, A = {A}', c2btitle: 'A − λI applied to the unit circle (λ = {l})',
    lgPoly: 'Characteristic polynomial det(A − λI)', lgRoot: 'Roots = eigenvalues', lgShifted: 'Image of the unit circle under A − λI', lgNull: 'Direction squashed to 0',
    lamSlider: 'Trial λ', jumpL1: 'Jump to λ₁', jumpL2: 'Jump to λ₂',
    s2head: 'tr = {tr}, det A = {det}, discriminant tr² − 4·det = {disc}. ',
    s2roots2: 'Two real roots λ₁ = {l1}, λ₂ = {l2}. ',
    s2roots1: 'One repeated root λ = {l1}. ',
    s2rootsC: 'No real roots; complex roots λ = {re} ± {im}i. ',
    s2now: 'Current λ = {l}: det(A − λI) = {d}, violet area = {area}.',
    s2flat: ' The area is 0: the unit circle is squashed to a segment and the direction θ ≈ {d}° goes to 0. That is the eigen-direction.',
    s2nearflat: ' The area is close to 0 but not 0: λ is just off the root (the most squashed direction is about {d}°).',
    s2hint: 'What to try: drag λ slowly and watch both panels. On the left the white dot rides along the parabola; on the right the violet ellipse gets thinner. At the moment the white dot touches the axis (a green dot), the ellipse collapses to a segment. "Jump to λ₁" and "Jump to λ₂" stop exactly on the roots, and the white dashed direction matches what you found in step 1.',

    s3k: 'Step 3 · Not always',
    s3t: 'Does every matrix have directions it does not turn?',
    s3e: 'This step asks: when does λ² − tr·λ + det = 0 have real roots? Look at the <strong>discriminant</strong> tr² − 4·det: positive gives two real roots, zero gives one repeated root, negative gives none. On the right the horizontal axis is the trace tr and the vertical axis the determinant det; the orange parabola det = tr²/4 is exactly where the discriminant is 0. Points below it have two eigen-directions; points above it (the pale orange region) have none. The slider runs through the family [[1, 1], [k, 1]]: its trace is fixed at 2, its determinant is 1 − k and its discriminant is 4k, so dragging k moves the white dot straight up or down through the parabola. The four buttons are typical cases: a 30° rotation (every arrow turns by 30°; no real eigen-direction); a shear [[1, 1], [0, 1]] (only the horizontal direction is not turned); scaling by 1.5·I (every direction is just stretched by 1.5); a mirror reflection [[1, 0], [0, −1]] (horizontal λ = 1, vertical λ = −1).',
    c3aria: 'The chosen matrix acting on a ring of arrows', c3baria: 'Trace–determinant plane', c3title: 'A = {A}', c3btitle: 'Trace tr (across) and determinant det (up)',
    lgParab: 'Zero-discriminant parabola det = tr²/4', lgTD: 'Current matrix (grey dots: ones tried)',
    kSlider: 'k in the matrix [[1, 1], [k, 1]]',
    p3_rotation: 'Rotate 30°', p3_shear: 'Shear', p3_scalar: 'Scale 1.5·I', p3_reflection: 'Mirror',
    s3readout: 'tr = {tr}, det = {det}, discriminant = {disc} (the parabola\'s height at this tr is tr²/4 = {q}). ',
    s3why_complex: ' The discriminant is negative: the point is above the parabola.',
    s3why_repeated: ' The discriminant is 0: the point is on the parabola, and the repeated root gives only one direction.',
    s3why_scalar: ' The discriminant is 0, but the matrix is a scaling, so instead of one direction you get all of them.',
    s3why_two: ' The discriminant is positive: the point is below the parabola.',
    s3hint: 'What to try: drag k slowly from 1 down to −1. The two white dashed lines close in, merge into one at k = 0 (a shear), and vanish for k < 0, when every bold arrow on the left is off its own line. Then click "Rotate 30°": the point is above the parabola. Click "Scale": the point is exactly on the parabola, yet no direction is turned. A point on the parabola does not always mean a single direction; it depends on whether the matrix is a scaling.',

    s4k: 'Step 4 · Apply it again and again',
    s4t: 'Apply A to the same arrow over and over. What happens?',
    s4e: 'This step asks: where does Aᵏv (A applied k times) end up pointing? Write v as a sum of pieces along the two eigen-directions: v = c₁e₁ + c₂e₂, with Ae₁ = λ₁e₁ and Ae₂ = λ₂e₂. Each application multiplies each piece by its own eigenvalue: Aᵏv = c₁λ₁ᵏe₁ + c₂λ₂ᵏe₂. If |λ₁| > |λ₂|, the second piece shrinks relative to the first by |λ₂/λ₁| every time, so the arrow hugs the line of e₁ (the <strong>dominant direction</strong>, white dashed) ever more closely. On the left each result is rescaled to length 1 so that only its direction shows; on the right is its angle to the dominant direction (log scale, each grid line 10 times smaller). The dots fall nearly on a straight line, meaning each step shrinks the angle by a fixed factor. Three matrices: the default A (λ = 2 and 0.5, ratio 0.25); the Fibonacci matrix [[1, 1], [1, 0]] (λ = the golden ratio 1.618 and −0.618, ratio about 0.382); and the "close" matrix (λ = 1.2 and 0.7, ratio about 0.583, the slowest).',
    c4aria: 'Direction of the arrow after repeated application', c4baria: 'Angle to the dominant direction against the number of applications', c4title: 'Directions (rescaled to length 1), A = {A}', c4btitle: 'Angle to the dominant direction (log scale)',
    lgIter: 'Direction of Aᵏv (newer = brighter)', lgDom: 'Dominant direction (larger |λ|)', lgSub: 'The other eigen-direction', lgAngK: 'Angle after k applications',
    p4_default: 'Default A', p4_fib: 'Fibonacci [[1, 1], [1, 0]]', p4_close: 'Close [[1, 0.3], [0.2, 0.9]]',
    startSlider: 'Starting direction', kIter: 'Number of applications k', play4: 'Apply from k = 0 to 12',
    s4readout: 'After {k} applications: {ang}° from the dominant direction. Eigenvalue ratio |λ₂/λ₁| = {q}; dominant eigenvalue {l}.',
    s4ratio: ' This step shrank the angle to {r} times the previous one; the length grew by a factor of {g}.',
    s4nodom: 'This matrix has no single dominant direction (its two eigenvalues have the same size, or it does not have two real eigenvalues).',
    s4hint: 'What to try: with the default A, press "Apply from k = 0 to 12". On the left the arrow quickly settles onto the white line; on the right each step drops about 0.6 of a grid line (a factor of 0.25). Switch to the "close" matrix and the descent is visibly slower (about 0.583). Choose the Fibonacci matrix and drag the starting direction to 0°: v = (1, 0), and the coordinates after each step are consecutive Fibonacci numbers 1, 1, 2, 3, 5, 8, …, while the length grows by a factor approaching 1.618. Finally choose the "close" matrix and set the start to 135°: v lies exactly on the other eigen-direction, c₁ = 0, and the arrow never turns towards the dominant direction.',

    s5k: 'Step 5 · The axes of a data cloud',
    s5t: 'In which direction does a cloud of data spread widest?',
    s5e: 'This step asks: given a cloud of 2-D data points, along which line do their projections have the largest <strong>variance</strong> (the average squared distance from the mean)? Project each point onto the line through direction u (unit length); the variance of the projections is uᵀSu, where S is the data\'s <strong>covariance matrix</strong> [[variance of x, covariance of x and y], [covariance, variance of y]]. S is symmetric (bottom-left = top-right), and a symmetric matrix always has real eigenvalues and two perpendicular eigen-directions. The projected variance is largest, λ₁, along the top eigen-direction and smallest, λ₂, at right angles to it, and λ₁ + λ₂ equals the sum of the two variances. This is <strong>principal component analysis</strong> (PCA). The data are 160 simulated points from a fixed seed; the slider ρ sets how strongly the two coordinates are correlated when the data are generated (the correlation measured in the sample differs slightly).',
    c5aria: 'Data points, the trial direction and the principal axes', c5baria: 'Projected variance against direction', c5title: 'Data, projections and principal axes', c5btitle: 'Projected variance uᵀSu against direction',
    lgData: 'Data points', lgProbe: 'Trial direction and projected points', lgAxes: 'Principal axes (length 2√λ)', lgVarCurve: 'Projected-variance curve',
    rhoSlider: 'Correlation ρ used to generate the data', probeSlider: 'Trial direction θ', jump5: 'Jump to the widest direction',
    s5readout: 'Variance of the projections onto θ = {th}°: {v}. Eigenvalues of S: λ₁ = {l1} (direction {d1}°) and λ₂ = {l2} (direction {d2}°), {gap}° apart; λ₁ + λ₂ = {sum}, and the variance of x plus the variance of y = {tr}.',
    s5hint: 'What to try: drag the trial direction and watch how widely the orange projected points spread along the line, together with the white dot on the right. The highest point of the curve sits on one white dashed vertical, the lowest on the other, 90° apart. Drag ρ to 0: the two eigenvalues come close, the curve flattens and the principal direction becomes unstable (another sample could point elsewhere). At −0.6 the main axis swings round to about 135°.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What did eigenvectors answer?',
    s6fin: '<strong>Steps 0 and 1</strong>: an eigenvector is a direction the matrix does not turn, Av = λv, with λ the stretch factor (negative means flipped). <strong>Step 2</strong>: no sweeping needed; solve det(A − λI) = λ² − tr·λ + det = 0, and at a root A − λI squashes the eigen-direction to 0. <strong>Step 3</strong>: with a negative discriminant there is no real eigen-direction (a rotation); at zero there may be just one (a shear) or all of them (a scaling). <strong>Step 4</strong>: repeated application pushes arrows towards the direction with the largest |λ|, at a speed set by |λ₂/λ₁|. <strong>Step 5</strong>: a symmetric matrix has perpendicular eigen-directions, and the top eigen-direction of a covariance matrix is where the data spread widest.',
    formula: 'Av = λv (v ≠ 0)\ndet(A − λI) = λ² − (a + d)·λ + (ad − bc) = 0\nAᵏ(c₁e₁ + c₂e₂) = c₁λ₁ᵏe₁ + c₂λ₂ᵏe₂',
    boundary: 'Scope: this page covers real 2×2 matrices only; "two real eigen-directions" holds only when the discriminant is positive. Step 1 calls a direction an eigen-direction using a floating-point tolerance (leftover at most 64 machine epsilons times |Av|), not an exact proof. The convergence in step 4 needs |λ₁| ≠ |λ₂| and a starting vector with some component along the dominant direction. The data in step 5 are simulated from a fixed seed, not measurements.',
    linksTitle: 'Related pages',
    lk1: 'Linear transformations, step 3: det = 0 squashes the plane onto a line (where the characteristic equation comes from) →',
    lk2: 'Vectors, step 3: dot product and projection (the coefficient p in step 1) →',
    lk3: 'PageRank, step 2: a page ranking is the eigenvector of a matrix for eigenvalue 1 →',
    lk4: 'Complex numbers, step 4: multiplying by a complex number rotates, which is why a rotation has complex eigenvalues →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Eigenvalues & Eigenvectors · The Directions a Matrix Cannot Turn".',
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
  if (typeof window.refreshEigen === 'function') window.refreshEigen();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EIGEN_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
