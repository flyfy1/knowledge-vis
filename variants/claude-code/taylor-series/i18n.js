'use strict';
// Taylor series lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '泰勒级数 · 在一点上对齐，能走多远',
    back: '← 知识索引',
    compare: '对照另一版本：泰勒级数 · 把曲线一项项贴上去 →',
    navLabel: '泰勒级数步骤导航',
    tagline: '计算器只会加减乘除，可它能给出 e^0.3 和 sin 2。办法是：在一个点上，让一个多项式和函数的值、斜率、弯曲……逐个对齐。这一页回答三件事：对齐的系数从哪来、对齐几项能准到什么程度、离那个点多远就再也贴不上了。',
    nav0: '0 贴合的阶', nav1: '1 系数从哪来', nav2: '2 一项项加', nav3: '3 误差上界', nav4: '4 能走多远', nav5: '5 拿来算数', nav6: '6 收束',

    s0k: '第 0 步 · 先自己贴',
    s0t: '一条抛物线要怎样摆，才能在 x = 0 附近最贴近 eˣ？',
    s0e: '这一步要回答：用二次多项式 <strong>P(x) = c₀ + c₁x + c₂x²</strong> 去近似 eˣ，三个系数怎么选，才能让 x 靠近 0 时误差缩得最快？这里的<strong>误差</strong>指 |eˣ − P(x)|：同一个 x 上真值与近似值之差的绝对值，越小越好。eˣ 在 0 处的值、斜率（一阶导数，曲线有多陡）、弯曲程度（二阶导数，斜率变化得有多快）都等于 1（<a class="xlink" href="../../../math/calculus/derivative/#step2">→ 导数页第 2 步：每一点的斜率</a>）；P 在 0 处的值是 c₀，斜率是 c₁，二阶导数是 2c₂。左图画两条曲线；右图横轴是离开 0 的距离 h，纵轴是 h 处的误差，两轴都按 10 倍一格（对数刻度）。在这种刻度下，如果误差约等于 C·hᵖ，图上就是一条斜率为 p 的直线，<strong>p 叫误差的阶</strong>：p 越大，h 缩小时误差掉得越快。',
    c0a: 'eˣ 与你的抛物线 P(x)', c0b: '误差 |eˣ − P(h)| 对 h（对数刻度）',
    lgF0: 'eˣ', lgP0: '你的 P(x)', lgRef0: '斜率 1、2、3 的参照线',
    c0s: '常数项 c₀（P 在 0 处的值）', c1s: '一次项 c₁（P 在 0 处的斜率）', c2s: '二次项 c₂（P″(0) 的一半）',
    match0: '按导数对齐：c₀ = 1，c₁ = 1，c₂ = 1/2',
    s0readout: '在 0 处的差：值 {d0}，斜率 {d1}，二阶导数 {d2}　｜　误差：h = 0.1 时 {e1}，h = 0.2 时 {e2}，后者是前者的 {ratio} 倍　｜　右图斜率 ≈ {slope}，误差的阶 p = {order}（误差约 ∝ hᵖ）',
    s0hint: '观察顺序：先保持 c₀ = 1，把 c₁ 从 0.5 拖到 1，看右图的线从斜率约 1 变陡到约 2，「后者是前者的几倍」从约 2 变成约 4；再把 c₂ 拖到 0.5，斜率变成约 3、倍数约 8。反过来，只要值没对齐（c₀ ≠ 1），右图就是一条平线：h 再小误差也不缩。每多对齐一阶导数，阶 p 就加 1。',

    s1k: '第 1 步 · 系数从哪来',
    s1t: '要对齐第 k 阶导数，第 k 个系数 cₖ 必须是多少？',
    s1e: '这一步要回答：上一步凑出了 c₂ = 1/2，一般的 cₖ 有没有公式？把多项式 P(x) = c₀ + c₁x + … + c₈x⁸ 求 k 次导数，再代入 x = 0：次数低于 k 的项求导后已经变成 0；次数高于 k 的项还带着 x 的因子，代入 0 也是 0；只有 cₖxᵏ 留下一个常数 <strong>k!·cₖ</strong>（k! 读作 k 的阶乘，= 1·2·…·k，并约定 0! = 1）。要让它等于函数的 k 阶导数 f⁽ᵏ⁾(0)，只能取 <strong>cₖ = f⁽ᵏ⁾(0) / k!</strong>。这样定出系数的多项式叫 f 在 0 处的 <strong>n 次泰勒多项式</strong> Pₙ；把项一直加下去的无穷和叫<strong>泰勒级数</strong>。柱状图画出 c₀ 到 c₈；下方一排方块列出每一项求 k 次导数后在 0 处剩下什么。',
    fnPick: '选择函数',
    c1a: '泰勒系数 cₖ = f⁽ᵏ⁾(0)/k!',
    lgC1: '系数 cₖ', lgK1: '当前选中的 k',
    kSlider: '求导次数 k',
    fn_exp: 'eˣ', fn_sin: 'sin x', fn_cos: 'cos x', fn_ln1p: 'ln(1+x)', fn_geo: '1/(1−x)',
    stripHit: '第 {j} 项：{j}!·c{j}', stripZero: '第 {j} 项：0',
    s1readout: '{fn}：f⁽{k}⁾(0) = {d}，{k}! = {kf}，所以 c{k} = {d} ÷ {kf} = {c}。',
    s1hint: '观察顺序：先选 eˣ，拖 k：它的每阶导数都是 1，系数就是 1/k!，柱子迅速变矮。再换 sin x：导数按 0、1、0、−1 循环，偶数位的柱子全为 0，奇数位正负交替。ln(1+x) 的系数是 ±1/k，变矮得慢得多；1/(1−x) 的系数全是 1，一点都不变矮。系数变矮的快慢，第 4 步会再见到。',

    s2k: '第 2 步 · 一项项加',
    s2t: '给 sin x 一项项加高次项，贴合的范围怎样扩大？',
    s2e: '这一步要回答：泰勒多项式 Pₙ（在 0 处与 sin x 对齐到第 n 阶导数的多项式，系数按上一步的公式）次数越高，在离 0 多远的地方还能用？我们用一个具体标准：<strong>好用范围</strong> = 最大的 r，使得 |x| ≤ r 时误差 |sin x − Pₙ(x)| 都小于 0.01（误差：同一 x 上真值与近似之差的绝对值）。图中浅绿带就是这个范围；每个试过的次数会留下一条灰线，方便对比。',
    c2a: 'sin x 与泰勒多项式 Pₙ(x)',
    lgSin: 'sin x', lgPn: '当前 Pₙ(x)', lgOld: '试过的低次 P', lgWin: '误差 < 0.01 的范围',
    nSlider: '次数 n', play2: '从 n = 0 加到 15', clear2: '清除灰线',
    s2readout: '{prog}n = {n}：在 |x| ≤ {r} 内，Pₙ 与 sin x 处处相差不到 0.01。{same}',
    s2progress: '已加到第 {c}/{N} 次 · ',
    s2same: 'sin x 的偶数次系数为 0，所以 P{n} 和 P{m} 是同一个多项式。',
    s2hint: '观察顺序：按播放，或手动从 n = 1 往上拖。每过一个奇数次，绿带向两侧各扩约 0.65–0.75（n = 1 时 ±0.39，n = 15 时 ±5.50）；偶数次不变。绿带外，Pₙ 很快冲出画面：多项式的高次项终究会压过有界的 sin x。所以每个固定的 n 只在一段有限范围内好用；范围随 n 变大，并且对 sin x 来说没有上限。',

    s3k: '第 3 步 · 不用真值也知道误差',
    s3t: '算 sin x 时手里没有真值，怎么事先知道加到第几项就够了？',
    s3e: '这一步要回答：误差 |sin x − Pₙ(x)|（真值与 n 次泰勒多项式之差）能不能只用 x 和 n 估出上限？泰勒定理的<strong>拉格朗日余项</strong>说：误差等于 f⁽ⁿ⁺¹⁾(ξ)·xⁿ⁺¹/(n+1)!，ξ 是 0 和 x 之间的某个数。sin 的任何一阶导数都在 −1 到 1 之间，所以 <strong>误差 ≤ |x|ⁿ⁺¹ / (n+1)!</strong>，这叫<strong>误差上界</strong>：保证不会更大，但实际可能小得多。图的横轴是次数 n，纵轴是误差，按 10 倍一格（对数刻度）。',
    c3a: 'sin x 在给定 x 处：实际误差与上界（对数刻度）',
    lgAct: '实际误差', lgBound: '上界 |x|ⁿ⁺¹/(n+1)!', lgTol: '目标 10⁻⁶',
    xSlider3: '求值点 x',
    s3readout: 'x = {x}：按上界，n ≥ {nb} 就能保证误差 < 10⁻⁶；实际误差在 n = {na} 时已低于 10⁻⁶。图中凡是高于 10⁻¹³ 的白点都在橙线下方（实际 ≤ 上界）。',
    s3hint: '观察顺序：只拖 x。x ≤ 2 时，橙线从一开始就往下掉；x > 2 时，橙线先升后降：相邻两点的比是 x/(n+2)，n + 2 小于 x 时上界还在变大，n + 2 超过 x 以后阶乘才占上风。白点总在橙线下方。白点隔一个才降一次，因为 sin 的偶数次系数为 0，Pₙ 和 Pₙ₊₁ 有时是同一个多项式。白点最后停在 10⁻¹⁴ 以下：那是计算机的舍入误差，不再是少加项造成的截断误差，橙线可以继续往下走，白点不会；算出来恰好为 0 的画在最底边。',

    s4k: '第 4 步 · 能走多远',
    s4t: '1/(1+x²) 在整条实数轴上都光滑，为什么它的级数离中心稍远就失效？',
    s4e: '这一步要回答：泰勒级数（把泰勒多项式的项一直加下去）在离中心多远处还会<strong>收敛</strong>，即项数越多越接近真值？答案是一个距离 R，叫<strong>收敛半径</strong>：|x − a| < R 处收敛，|x − a| > R 处发散（项越加越大）。这里把中心 a 也变成可调的：泰勒多项式改成 Σ cₖ(x − a)ᵏ，cₖ = f⁽ᵏ⁾(a)/k!。函数 1/(1+x²) 在实数上没有任何断点，但把 x 换成<strong>复数</strong>（平面上的点，横坐标是实部、纵坐标是虚部）以后，x = ±i 时分母 1 + x² = 0（<a class="xlink" href="../../../math/algebra/complex-numbers/#step1">→ 复数页第 1 步：复数是平面上的点</a>）。复分析的一个定理说：R 等于中心到最近的这种<strong>奇点</strong>（函数在那里没有定义或趋于无穷的点）的距离，所以 R = √(1 + a²)。右图是复平面，绿色圆盘就是收敛范围；它在实数轴上截出的那一段，正是左图的绿带。',
    c4a: '实数轴上：1/(1+x²) 与 n 次泰勒多项式', c4b: '复平面：中心 a、奇点 ±i、收敛圆',
    lgLor: '1/(1+x²)', lgPn4: '中心为 a 的 n 次泰勒多项式', lgDisk: '收敛范围 |x − a| < R', lgPole: '奇点 ±i',
    aSlider: '中心 a', nSlider4: '次数 n',
    s4readout: '中心 a = {a}：最近的奇点 ±i 距离 R = √(1+a²) = {R}，收敛区间 ({lo}, {hi})。n = {n}：圈内的 x = a + 0.8R = {xin} 处误差 {ein}；圈外的 x = a + 1.2R = {xout} 处误差 {eout}。',
    s4hint: '观察顺序：先保持 a = 0，把 n 从 0 拖到 40：绿带（−1 到 1）里青线越来越贴白线，带外青线上下乱甩、离白线越来越远；读数里圈内误差变小、圈外误差变大。再把 a 拖到 2：右图的圆变大（半径 √5 ≈ 2.24），左图绿带随之变宽并右移。实数轴上看不到任何原因，原因在复平面上。',
    quizPrompt: '想一想：以 0 为中心，1/(1+x²) 的泰勒级数在 x = 1.5 处为什么不收敛？',
    quizA: '函数在 x = 1.5 处不可导', quizB: '复平面上 ±i 处分母为 0，它们离中心 0 的距离是 1，而 1.5 > 1', quizC: '项数还不够多，加到 100 项就会收敛',
    check: '核对', correct: '对。收敛半径由离中心最近的奇点决定，与实数轴上是否光滑无关。1.5 在圈外，项越加越大。',
    wrong: '再看看：在实数轴上这个函数处处可导。拖 n 看看 x = 1.5 处的误差是越加越小还是越来越大，再看右图的圆。',

    s5k: '第 5 步 · 拿来算数',
    s5t: '用级数算 eˣ，要加多少项？x 是负数时为什么更麻烦？',
    s5e: '这一步要回答：直接把 eˣ 的泰勒级数 1 + x + x²/2! + x³/3! + …（每一项是 xᵏ/k!）加起来求值，要几项才能准到<strong>相对误差</strong> ≤ 10⁻⁶？相对误差 = |部分和 − eˣ| ÷ eˣ，即误差占真值的比例，越小越好；<strong>部分和</strong>指只加前 N 项得到的和。上图每根柱子是一项 xᵏ/k!（青色为正、粉色为负）；下图记下每个试过的 x 需要的项数 N。',
    c5a: '每一项 xᵏ/k!（k = 0…29）', c5b: '需要的项数 N（相对误差 ≤ 10⁻⁶）',
    lgTerm: '正的项', lgNeg: '负的项', lgN: '试过的 x 所需项数', lgCut: '橙虚线左边：加到这里就够了',
    xSlider5: '求值点 x', sweep5: '从 x = −5 扫到 5',
    s5readout: '{prog}x = {x}：加 {N} 项后相对误差 {rel} ≤ 10⁻⁶（eˣ = {ex}，部分和 {S}）。最大的一项是 {maxT}。{neg}',
    s5progress: '已试 {c}/{N} 个 x · ',
    s5neg: '这里正负项互相抵消：最大的项比结果大 {ratio} 倍，舍入误差会按这个倍数放大。更稳的算法是先算 e^{ax}（只要 {Npos} 项），再取倒数。',
    s5hint: '观察顺序：按扫描，或手动拖 x。|x| 越大，柱子先变高（xᵏ 在长）再变矮（k! 追上来），需要的项数越多；在 x = ±5 之间，正数一侧最多 {nPos5} 项，负数一侧最多 {nNeg5} 项。x < 0 时柱子正负交替，大项几乎全被抵消，这正是负数一侧更费项的原因。',

    s6k: '第 6 步 · 收束',
    s6t: '一句话：在一点上对齐 n 阶导数，误差就按 hⁿ⁺¹ 收缩，但只在收敛圆里成立',
    s6fin: '回顾：对齐值、斜率、弯曲，误差的阶就一步步提高（第 0 步）；对齐第 k 阶导数唯一的办法是 cₖ = f⁽ᵏ⁾(a)/k!（第 1 步）；次数越高好用范围越大（第 2 步），而拉格朗日余项让我们不看真值就能决定加几项（第 3 步）；但级数能走多远由复平面上最近的奇点决定（第 4 步）；拿来算数时，还要留心正负项抵消（第 5 步）。',
    formula: 'Pₙ(x) = Σₖ₌₀ⁿ f⁽ᵏ⁾(a)/k! · (x − a)ᵏ\n|f(x) − Pₙ(x)| ≤ max|f⁽ⁿ⁺¹⁾| · |x − a|ⁿ⁺¹ / (n+1)!\n收敛半径 R = 中心到最近奇点的距离',
    boundary: '适用范围：系数公式要求 f 在 a 处有足够多阶导数；余项估计要求能给 f⁽ⁿ⁺¹⁾ 定一个上限。收敛也不等于收敛到 f：e^(−1/x²)（x = 0 处补为 0）在 0 处各阶导数都是 0，级数处处收敛到 0，却不等于函数本身。泰勒近似是局部的：它只在一点附近准；要在整段区间上均匀地近似，往往用傅里叶级数或别的方法。',
    linksTitle: '接着去看',
    lk1: '导数 · 第 2 步：每一点的斜率（cₖ 用到的 f⁽ᵏ⁾ 从这里来）→',
    lk2: '牛顿法 · 第 0 步：用切线（一次泰勒多项式）找根 →',
    lk3: '极限 · 第 4 步：数列的 ε–N 定义（「收敛」的严格说法）→',
    lk4: '傅里叶 · 第 5 步：频谱视角（整体近似，与泰勒的局部近似对照）→',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《泰勒级数 · 把曲线一项项贴上去》的平行版本。'
  },
  en: {
    pageTitle: 'Taylor Series · Match at One Point, Then See How Far It Reaches',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Taylor Series · Patch the Curve Term by Term →',
    navLabel: 'Taylor series steps',
    tagline: 'A calculator can only add and multiply, yet it hands you e^0.3 and sin 2. The trick: at one point, make a polynomial agree with the function in value, slope, bend, and so on. This page answers three questions: where those coefficients come from, how accurate n of them make you, and how far from the point the match can possibly hold.',
    nav0: '0 Order of contact', nav1: '1 Where cₖ comes from', nav2: '2 Term by term', nav3: '3 Error bound', nav4: '4 How far', nav5: '5 Computing', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Fit one by hand',
    s0t: 'How should a parabola sit to hug eˣ as closely as possible near x = 0?',
    s0e: 'This step asks: if you approximate eˣ with a quadratic <strong>P(x) = c₀ + c₁x + c₂x²</strong>, which three coefficients make the error shrink fastest as x approaches 0? Here <strong>error</strong> means |eˣ − P(x)|, the gap between true and approximate value at the same x; smaller is better. At 0, eˣ has value 1, slope 1 (first derivative: how steep the curve is) and second derivative 1 (how fast the slope itself changes) (<a class="xlink" href="../../../math/calculus/derivative/#step2">→ Derivative, step 2: a slope at every point</a>). P has value c₀, slope c₁ and second derivative 2c₂ there. The left plot shows both curves. The right plot puts the distance h from 0 across and the error at h up the side, both on log scales (each grid line is ×10). On those axes an error of roughly C·hᵖ is a straight line of slope p, and <strong>p is called the order of the error</strong>: the larger p, the faster the error drops as h shrinks.',
    c0a: 'eˣ and your parabola P(x)', c0b: 'error |eˣ − P(h)| vs h (log scales)',
    lgF0: 'eˣ', lgP0: 'your P(x)', lgRef0: 'reference slopes 1, 2, 3',
    c0s: 'constant c₀ (P’s value at 0)', c1s: 'linear c₁ (P’s slope at 0)', c2s: 'quadratic c₂ (half of P″(0))',
    match0: 'Match derivatives: c₀ = 1, c₁ = 1, c₂ = 1/2',
    s0readout: 'Gaps at 0: value {d0}, slope {d1}, second derivative {d2}  |  error at h = 0.1: {e1}, at h = 0.2: {e2}, ratio {ratio}  |  right-plot slope ≈ {slope}, order p = {order} (error roughly ∝ hᵖ)',
    s0hint: 'What to try: keep c₀ = 1 and drag c₁ from 0.5 to 1. The right-hand line steepens from slope ≈ 1 to ≈ 2 and the ratio goes from about 2 to about 4. Then set c₂ to 0.5: slope ≈ 3, ratio ≈ 8. Conversely, if the value is off (c₀ ≠ 1) the right-hand line goes flat: shrinking h no longer shrinks the error. Each extra derivative you match adds one to p.',

    s1k: 'Step 1 · Where the coefficients come from',
    s1t: 'To match the k-th derivative, what must the k-th coefficient cₖ be?',
    s1e: 'This step asks: step 0 needed c₂ = 1/2; is there a rule for every cₖ? Differentiate P(x) = c₀ + c₁x + … + c₈x⁸ k times and set x = 0. Terms of degree below k have already become 0; terms of degree above k still carry a factor of x, so they vanish at 0 too; only cₖxᵏ leaves a constant, <strong>k!·cₖ</strong> (k factorial, 1·2·…·k, with 0! = 1). For that to equal the function’s k-th derivative f⁽ᵏ⁾(0), the only choice is <strong>cₖ = f⁽ᵏ⁾(0) / k!</strong>. The polynomial built this way is the <strong>degree-n Taylor polynomial</strong> Pₙ of f at 0; keep adding terms forever and you get the <strong>Taylor series</strong>. The bars show c₀ to c₈; the row of tiles below lists what each term leaves at 0 after k derivatives.',
    fnPick: 'Choose a function',
    c1a: 'Taylor coefficients cₖ = f⁽ᵏ⁾(0)/k!',
    lgC1: 'coefficient cₖ', lgK1: 'selected k',
    kSlider: 'number of derivatives k',
    fn_exp: 'eˣ', fn_sin: 'sin x', fn_cos: 'cos x', fn_ln1p: 'ln(1+x)', fn_geo: '1/(1−x)',
    stripHit: 'term {j}: {j}!·c{j}', stripZero: 'term {j}: 0',
    s1readout: '{fn}: f⁽{k}⁾(0) = {d} and {k}! = {kf}, so c{k} = {d} ÷ {kf} = {c}.',
    s1hint: 'What to try: pick eˣ and drag k. Every derivative is 1, so the coefficients are 1/k! and the bars collapse fast. Switch to sin x: the derivatives cycle 0, 1, 0, −1, so every even bar is zero and the odd ones alternate in sign. ln(1+x) has coefficients ±1/k, shrinking far more slowly, and 1/(1−x) has every coefficient equal to 1, not shrinking at all. How fast the bars shrink comes back in step 4.',

    s2k: 'Step 2 · Term by term',
    s2t: 'As you add higher terms for sin x, how does the region of good fit grow?',
    s2e: 'This step asks: the higher the degree of the Taylor polynomial Pₙ (the polynomial that matches sin x at 0 up to the n-th derivative, with coefficients from step 1), how far from 0 can you still use it? We use one concrete yardstick: the <strong>usable range</strong> is the largest r such that the error |sin x − Pₙ(x)| stays below 0.01 for every |x| ≤ r (error: the gap between true and approximate value at the same x). The pale green band is that range; every degree you try leaves a grey trace for comparison.',
    c2a: 'sin x and the Taylor polynomial Pₙ(x)',
    lgSin: 'sin x', lgPn: 'current Pₙ(x)', lgOld: 'lower degrees tried', lgWin: 'range where error < 0.01',
    nSlider: 'degree n', play2: 'Add terms from n = 0 to 15', clear2: 'Clear grey traces',
    s2readout: '{prog}n = {n}: for |x| ≤ {r}, Pₙ stays within 0.01 of sin x everywhere. {same}',
    s2progress: 'degree {c}/{N} · ',
    s2same: 'sin x has no even-degree terms, so P{n} and P{m} are the same polynomial.',
    s2hint: 'What to try: press play, or drag n up from 1. Each new odd degree pushes the band out by roughly 0.65–0.75 on each side (±0.39 at n = 1, ±5.50 at n = 15); even degrees change nothing. Outside the band Pₙ shoots off the plot: the top power always overwhelms the bounded sin x eventually. So any fixed n is good only on a finite stretch, but the stretch grows with n, and for sin x it has no upper limit.',

    s3k: 'Step 3 · Knowing the error without the answer',
    s3t: 'When you compute sin x you do not have the true value. How do you know in advance how many terms are enough?',
    s3e: 'This step asks: can the error |sin x − Pₙ(x)| (true value minus the degree-n Taylor polynomial) be capped using only x and n? Taylor’s theorem with the <strong>Lagrange remainder</strong> says the error equals f⁽ⁿ⁺¹⁾(ξ)·xⁿ⁺¹/(n+1)! for some ξ between 0 and x. Every derivative of sin lies between −1 and 1, so <strong>error ≤ |x|ⁿ⁺¹ / (n+1)!</strong>. That is an <strong>error bound</strong>: a guarantee the error is no larger, though the actual error can be far smaller. The plot puts the degree n across and the error up the side on a log scale (each grid line is ×10).',
    c3a: 'sin x at a chosen x: actual error and bound (log scale)',
    lgAct: 'actual error', lgBound: 'bound |x|ⁿ⁺¹/(n+1)!', lgTol: 'target 10⁻⁶',
    xSlider3: 'evaluation point x',
    s3readout: 'x = {x}: the bound guarantees error < 10⁻⁶ once n ≥ {nb}; the actual error is already below 10⁻⁶ at n = {na}. Every white dot above 10⁻¹³ sits below the orange line (actual ≤ bound).',
    s3hint: 'What to try: drag only x. For x ≤ 2 the orange line falls from the start; for x > 2 it first rises and then falls. Neighbouring points differ by the factor x/(n+2), so the bound keeps growing while n + 2 is below x, and only once n + 2 passes x does the factorial win. The white dots always sit below the orange line. They drop only every other step because sin has no even-degree terms, so Pₙ and Pₙ₊₁ are sometimes the same polynomial. The dots finally level off below 10⁻¹⁴: that is the computer’s rounding error, not the truncation error of leaving terms out, so the orange line keeps falling while the dots stop; errors that come out exactly 0 are drawn on the bottom edge.',

    s4k: 'Step 4 · How far it reaches',
    s4t: '1/(1+x²) is smooth on the whole real line. Why does its series fail a little way from the centre?',
    s4e: 'This step asks: how far from the centre does the Taylor series (the Taylor polynomial with terms added forever) still <strong>converge</strong>, meaning more terms bring you closer to the true value? The answer is a distance R, the <strong>radius of convergence</strong>: the series converges where |x − a| < R and diverges (terms keep growing) where |x − a| > R. Here the centre a is adjustable too: the polynomial becomes Σ cₖ(x − a)ᵏ with cₖ = f⁽ᵏ⁾(a)/k!. On the real line 1/(1+x²) has no breaks at all, but let x be a <strong>complex number</strong> (a point in the plane: real part across, imaginary part up) and the denominator 1 + x² is zero at x = ±i (<a class="xlink" href="../../../math/algebra/complex-numbers/#step1">→ Complex numbers, step 1: numbers as points in the plane</a>). A theorem of complex analysis says R is the distance from the centre to the nearest such <strong>singularity</strong> (a point where the function is undefined or blows up), so R = √(1 + a²). The right plot is the complex plane and the green disc is where the series converges; the stretch it cuts out of the real axis is exactly the green band on the left.',
    c4a: 'On the real line: 1/(1+x²) and its degree-n Taylor polynomial', c4b: 'Complex plane: centre a, singularities ±i, disc',
    lgLor: '1/(1+x²)', lgPn4: 'degree-n Taylor polynomial about a', lgDisk: 'convergence region |x − a| < R', lgPole: 'singularities ±i',
    aSlider: 'centre a', nSlider4: 'degree n',
    s4readout: 'Centre a = {a}: the nearest singularities ±i are R = √(1+a²) = {R} away, so the interval of convergence is ({lo}, {hi}). At n = {n}: inside, at x = a + 0.8R = {xin}, the error is {ein}; outside, at x = a + 1.2R = {xout}, it is {eout}.',
    s4hint: 'What to try: keep a = 0 and drag n from 0 to 40. Inside the band (−1 to 1) the cyan curve settles onto the white one; outside it whips up and down and drifts further away, and the readout shows the inside error falling while the outside error grows. Then drag a to 2: the disc on the right grows (radius √5 ≈ 2.24) and the band on the left widens and shifts right. Nothing on the real line explains this; the reason lives in the complex plane.',
    quizPrompt: 'Think: why does the Taylor series of 1/(1+x²) about 0 fail to converge at x = 1.5?',
    quizA: 'The function is not differentiable at x = 1.5', quizB: 'The denominator is zero at ±i in the complex plane, distance 1 from the centre, and 1.5 > 1', quizC: 'Not enough terms yet; at 100 terms it will converge',
    check: 'Check', correct: 'Right. The radius is set by the nearest singularity to the centre, whether or not the function looks smooth on the real line. 1.5 is outside the disc, so the terms keep growing.',
    wrong: 'Look again: on the real line this function is differentiable everywhere. Drag n and watch whether the error at x = 1.5 shrinks or grows, then look at the disc on the right.',

    s5k: 'Step 5 · Computing with it',
    s5t: 'How many terms does it take to compute eˣ from its series, and why are negative x harder?',
    s5e: 'This step asks: if you evaluate eˣ by adding up its Taylor series 1 + x + x²/2! + x³/3! + … (the k-th term is xᵏ/k!), how many terms do you need for a <strong>relative error</strong> ≤ 10⁻⁶? Relative error = |partial sum − eˣ| ÷ eˣ, the error as a fraction of the true value; smaller is better. A <strong>partial sum</strong> is what you get after adding only the first N terms. Each bar on top is one term xᵏ/k! (cyan positive, pink negative); the lower plot records the number of terms N needed for every x you try.',
    c5a: 'each term xᵏ/k! (k = 0…29)', c5b: 'terms needed N (relative error ≤ 10⁻⁶)',
    lgTerm: 'positive term', lgNeg: 'negative term', lgN: 'terms needed at each x tried', lgCut: 'left of the orange dashes: enough terms',
    xSlider5: 'evaluation point x', sweep5: 'Sweep x from −5 to 5',
    s5readout: '{prog}x = {x}: after {N} terms the relative error is {rel} ≤ 10⁻⁶ (eˣ = {ex}, partial sum {S}). The largest term is {maxT}. {neg}',
    s5progress: 'tried {c}/{N} values of x · ',
    s5neg: 'Positive and negative terms cancel here: the largest term is {ratio} times the answer, and rounding errors get magnified by that factor. A steadier method computes e^{ax} first ({Npos} terms) and takes the reciprocal.',
    s5hint: 'What to try: press sweep, or drag x by hand. As |x| grows the bars first rise (xᵏ growing) and then fall (k! catching up), and more terms are needed; between x = ±5 the positive side needs at most {nPos5} terms and the negative side at most {nNeg5}. For x < 0 the bars alternate in sign and the big terms almost cancel, which is exactly why the negative side costs more terms.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'In one line: match n derivatives at a point and the error shrinks like hⁿ⁺¹, but only inside the disc of convergence',
    s6fin: 'Recap: matching value, slope and bend raises the order of the error one step at a time (step 0); the only way to match the k-th derivative is cₖ = f⁽ᵏ⁾(a)/k! (step 1); higher degree widens the usable range (step 2), and the Lagrange remainder tells you how many terms to add without knowing the answer (step 3); but how far the series reaches is set by the nearest singularity in the complex plane (step 4); and when you compute with it, watch for cancellation between positive and negative terms (step 5).',
    formula: 'Pₙ(x) = Σₖ₌₀ⁿ f⁽ᵏ⁾(a)/k! · (x − a)ᵏ\n|f(x) − Pₙ(x)| ≤ max|f⁽ⁿ⁺¹⁾| · |x − a|ⁿ⁺¹ / (n+1)!\nradius R = distance from the centre to the nearest singularity',
    boundary: 'Where this holds: the coefficient rule needs f to have enough derivatives at a; the remainder estimate needs a cap on f⁽ⁿ⁺¹⁾. Converging is not the same as converging to f: e^(−1/x²) (set to 0 at x = 0) has every derivative equal to 0 at 0, so its series converges everywhere to 0, which is not the function. A Taylor approximation is local: it is accurate near one point. To approximate evenly across a whole interval, Fourier series or other methods are often the better tool.',
    linksTitle: 'Where to go next',
    lk1: 'Derivative · step 2: a slope at every point (the f⁽ᵏ⁾ behind each cₖ) →',
    lk2: 'Newton’s method · step 0: root-finding with a tangent, the degree-1 Taylor polynomial →',
    lk3: 'Limits · step 4: the ε–N definition for sequences (what “converges” means precisely) →',
    lk4: 'Fourier · step 5: the spectrum view (global approximation, the counterpart to Taylor’s local one) →',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Taylor Series · Patch the Curve Term by Term”.'
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
