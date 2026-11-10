'use strict';
// Gradient descent lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '梯度下降 · 只凭坡度找谷底',
    back: '← 知识索引',
    compare: '对照另一版本：梯度下降 · 摸黑下山 →',
    navLabel: '梯度下降步骤导航',
    tagline: '要让一个函数尽量小，却看不到它的全貌，只能在当前位置量出坡度。梯度下降的做法是：朝下坡方向迈一步，步长按坡度定，然后重复。七步里你会看到这条规则为什么管用，步子太大时怎样来回弹甚至飞出去，狭长的山谷为什么拖慢它，以及它怎样拟合真实数据。',
    nav0: '0 一步', nav1: '1 步长', nav2: '2 狭长山谷', nav3: '3 选 η', nav4: '4 两个谷', nav5: '5 拟合数据', nav6: '6 收束',

    s0k: '第 0 步 · 唯一的信息',
    s0t: '只知道脚下的坡度，下一步该往哪走、走多远？',
    s0e: '这一步要回答：如果只能在当前位置 x 量出函数的<strong>坡度</strong>（导数 f′(x)：x 往右挪一点点，f 变化多少倍；<a class="xlink" href="../../../math/calculus/derivative/#step2">→ 导数页第 2 步：每一点的导数</a>），怎样确定下一步？这里的函数是 f(x) = ½(x − 1)²，谷底在 x = 1，但算法看不到这条曲线。梯度下降的规则只有一行：<strong>x新 = x − η · f′(x)</strong>。坡度为正说明右边更高，就往左走；坡度为负就往右走。<strong>η</strong>（读作 eta）叫<strong>学习率</strong>，是步长对坡度的倍数，由人事先选定。坡度的切线（橙色）还能预报这一步能让 f 下降多少：−η · f′(x)²。',
    c0: 'f(x) = ½(x − 1)²：当前点、切线与一步',
    s0lgF: '函数 f(x)（算法看不到）', s0lgX: '当前点 x', s0lgT: '切线（坡度 f′(x)）', s0lgStep: '这一步 −η·f′(x)', s0lgPred: '切线预报的新高度', s0lgGap: '预报与实际的差',
    xSlider: '当前位置 x', etaSlider: '学习率 η',
    next0: '走这一步（x ← x新）',
    dirFlat: '坡度为 0，原地不动', dirLeft: '右边更高，往左走', dirRight: '左边更高，往右走',
    s0down: 'f 下降了', s0up: 'f 反而升高了', s0same: 'f 没有变化',
    s0readout: '在 x = {x}：坡度 f′(x) = {g}，{dir}。这一步 −η·f′(x) = {step}，落到 x新 = {xn}。切线预报 f 变化 {pred}，实际变化 {act}：{verdict}。',
    s0hint: '观察顺序：先保持 η = 0.5，拖 x，看绿色箭头：坡越陡（切线越斜），箭头越长；过了谷底 x = 1，箭头掉头。再固定 x = 4，把 η 从 0.1 拖到 2.4：η 小时，橙色空心圈（切线的预报）和绿点（实际落点）几乎重合；η 越大，粉色虚线标出的差距越大。在这条曲线上，η = 1 一步落到谷底，η = 2 落到对面同样高的地方，f 不变；η 再大，f 反而升高。按「走这一步」会把 x 移到新位置（按滑杆刻度取到 0.1），可以连续按。',

    s1k: '第 1 步 · 把这一步重复下去',
    s1t: '一直重复同一条规则，什么时候走到谷底，什么时候越走越远？',
    s1e: '这一步要回答：学习率 η 取多大，反复迭代才会收敛到谷底？用最简单的碗形 f(x) = ½ a x²，谷底在 0。参数 a 是<strong>曲率</strong>：碗有多弯，a 越大碗越陡。这里坡度 f′(x) = a·x，所以一步更新变成 x新 = (1 − η·a) · x：每走一步，到谷底的距离都乘上同一个<strong>缩放因子 r = 1 − η·a</strong>。|r| < 1 时距离一次次缩小，叫<strong>收敛</strong>；|r| > 1 时一次次放大，叫<strong>发散</strong>。r 为负表示每一步都跨过谷底到对面。于是 η 必须小于 <strong>2 / a</strong>：碗越弯，能用的步子越小。起点固定在 x₀ = 4，每次画 30 步。',
    c1a: '曲线 ½ a x² 上的 30 步（橙线连接相邻两步）', c1b: '到谷底的距离 |x| 随步数 k（对数刻度）',
    s1lgF: 'f(x) = ½ a x²', s1lgPath: '迭代点（x 在谷底右侧）', s1lgNeg: 'x 在谷底左侧', s1lgTol: '起始距离的 1/1000', s1lgHollow: '小于 10⁻⁹（含恰好为 0），压在底边',
    aSlider: '曲率 a', run1: '从 x₀ = 4 播放 30 步',
    progress: '已走 {c}/{N} 步 · ',
    reg_one: '一步到底（r = 0）', reg_mono: '单调逼近，始终在谷底同一侧', reg_osc: '来回跨过谷底，幅度越来越小', reg_bounce: '在 ±4 之间来回弹，永远不靠近', reg_diverge: '来回跨过谷底，越跳越远（发散）',
    s1steps: '{n} 步后距离降到起始的 1/1000 以下', s1never: '永远到不了起始距离的 1/1000',
    s1readout: 'a = {a}，η = {eta}：缩放因子 r = 1 − η·a = {r}，{reg}；{n}。收敛要求 η < 2/a = {lim}。第 30 步 x = {xk}。',
    s1hint: '观察顺序：保持 a = 2，把 η 从 0.05 慢慢拖到 1.5，每停一处看下图「到谷底的距离」：η < 0.5 时是一条下降的直线（对数刻度上，每步乘同一个 r 就是直线），点全是橙色；0.5 < η < 1 时点在橙、粉之间交替，说明每步都跨到谷底对面，但仍在下降；η = 1 时变成水平线；η > 1 时直线向上。再把 a 换成 4：同样的 η 更早发散，界线移到 2/a = 0.5。按播放按钮可以一步步看点怎样落下。',
    quizPrompt: '想一想：a = 2 时，取哪个 η 能一步就落到谷底？',
    quizA: 'η = 0.25', quizB: 'η = 0.5', quizC: 'η = 1',
    check: '核对', pick: '先选一个选项。',
    correct: '对。一步落到谷底要 r = 1 − η·a = 0，也就是 η = 1/a = 0.5。把 η 拖到 0.5，下图第 1 步之后距离直接是 0（空心点压在底边）。不过这要求事先知道曲率 a，梯度下降只量坡度，通常不知道它。',
    wrong: '再看看：一步落到谷底，需要缩放因子 r = 1 − η·a 等于几？把这个 η 设到滑杆上验证一下。',

    s2k: '第 2 步 · 两个方向',
    s2t: '在一个又长又窄的山谷里，为什么下坡方向不指向谷底？',
    s2e: '这一步要回答：变量不止一个时，梯度下降为什么会走「之」字？函数换成两个变量：f(x, y) = ½(x² + κ y²)，谷底在 (0, 0)。<strong>梯度</strong> ∇f = (x, κy) 是由两个方向的坡度组成的箭头，指向上坡最陡的方向；更新规则仍是一行：位置新 = 位置 − η · ∇f。俯视图上画的是<strong>等高线</strong>：同一个椭圆上 f 的值相同。两个方向的曲率不同，x 方向是 1，y 方向是 κ；<strong>κ</strong>（读作 kappa）叫<strong>条件数</strong>，是最陡与最缓曲率之比，κ 越大，山谷越窄长。下坡方向 −∇f（绿色箭头）总垂直于脚下的等高线，而不是对准谷底（灰色虚线）。拆开看，两个方向各自就是第 1 步的一维问题：x 方向每步乘 1 − η，y 方向每步乘 1 − η·κ。η 必须小于 2/κ，否则陡的 y 方向发散；可是 η 一小，缓的 x 方向每步只缩一点点。两图坐标相同比例，角度可以直接看（<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step4">→ 特征向量页第 4 步：一般的碗怎样转到这样的主轴上</a>）。',
    c2a: '俯视等高线：起点 (−4.5, 1.8) 出发的路径', c2b: '到谷底的距离（对数刻度）随步数',
    s2lgC: '等高线', s2lgG: '起点处的下坡方向 −∇f', s2lgLine: '直指谷底的连线 / 到达线 0.01', s2lgPath: '迭代路径', s2lgMin: '谷底 (0, 0)',
    kSlider: '条件数 κ', run2: '播放 200 步',
    s2div: '陡的 y 方向发散，路径飞出山谷', s2bounce: 'y 方向在两侧来回弹，永远不停', s2arrive: '{n} 步后离谷底不到 0.01',
    s2readout: 'κ = {k}，η = {eta}：起点处下坡方向与谷底方向相差 {ang}°。每步缩放：x 方向 1 − η = {rg}，y 方向 1 − η·κ = {rs}；稳定要求 η < 2/κ = {lim}。{state}。',
    s2hint: '观察顺序：保持 κ = 10、η = 0.15，按播放：路径先在窄的 y 方向来回跨（y 方向每步乘 −0.5），很快贴到山谷底线，然后沿 x 方向慢慢挪（每步只乘 0.85）。把 η 拖过 0.2，y 方向的因子小于 −1，路径从山谷里弹出去；把 η 降到 0.05，不再来回跨，但「到谷底的距离」那条线变得很平，要一百多步。最后把 κ 拖到 1：等高线变成圆，绿色箭头正对谷底，夹角为 0°。',

    s3k: '第 3 步 · 学习率怎么选',
    s3t: '学习率取多大，到谷底所需的步数最少？',
    s3e: '这一步要回答：在第 2 步的山谷里，η 选多大最快，最快又有多快？仍用 f(x, y) = ½(x² + κ y²) 和同一个起点，「到达」指离谷底不到 0.01。横轴把 η 写成稳定上限 2/κ 的几分之几（η ÷ (2/κ)），这样不同的 κ 可以放在同一把尺子上；超过 1 就发散（粉色区域）。两个方向的缩放因子是 1 − η 和 1 − η·κ（条件数 κ 是陡、缓两个方向曲率之比）；让两者绝对值相等的 <strong>η* = 2 / (1 + κ)</strong> 使较慢那个方向缩得最快，每步缩放 (κ − 1)/(κ + 1)。注意 η* ÷ (2/κ) = κ/(1 + κ)：κ 越大，最好的 η 越贴近发散的边缘。',
    c3a: '到达所需步数（对数刻度） vs η ÷ (2/κ)', c3b: '用 η* 时的步数 vs 条件数 κ',
    s3lgCurve: '步数曲线（当前 κ）', s3lgNow: '当前选择', s3lgBest: 'η* = 2/(1 + κ)', s3lgDiv: '发散区', s3lgK: '最少步数随 κ', s3lgRef: '参考线 3.1κ',
    qSlider: 'η ÷ (2/κ)', best3: '跳到 η*', never: '到不了',
    s3readout: 'κ = {k}：稳定上限 2/κ = {lim}。当前 η = {q} × 上限 = {eta}，到达需 {n} 步。η* = {eb}（上限的 {qb} 倍），需 {nb} 步，每步缩放 {rate}。',
    s3hint: '观察顺序：先保持 κ = 10，把 η ÷ (2/κ) 从 0.05 拖到 1.1，看上图白点沿青色曲线走：太小时要好几百步，越靠近橙色虚线（η*）越少，过了它又上升，跨过 1 就到不了。按「跳到 η*」看最少步数。再拖 κ：上图的最低点向右贴近 1；下图白点沿橙线移动。从这个起点出发，κ 从 2 到 50 时，最少步数约为 3.1 × κ（灰色参考线），条件数翻倍，步数也翻倍。这个倍数只对本页的起点和 0.01 的到达标准成立。',

    s4k: '第 4 步 · 不止一个谷',
    s4t: '有两个谷时，梯度下降会停在哪一个？',
    s4e: '这一步要回答：曲线不再是一个碗时，最后停在哪里由什么决定？这里 f(x) = 0.04x⁴ − 0.5x² + 0.35x 有两个谷：左边的更低，是<strong>全局最小</strong>（整条曲线上最低的点）；右边的只比附近低，是<strong>局部最小</strong>。中间的驼峰顶坡度为 0。梯度下降每一步只看脚下的坡度（f′(x)），在两个谷底坡度都是 0，都会停下，它分不出哪个更低。下方的色带把 −4 到 4 之间每隔 0.05 的 161 个起点各跑 400 步，按终点着色：绿色到了左谷，橙色到了右谷。',
    c4a: 'f(x) = 0.04x⁴ − 0.5x² + 0.35x 上的前 40 步', c4b: '161 个起点各自的终点（同一个 η）',
    s4lgF: 'f(x)', s4lgPath: '路径（空心圈 = 起点）', s4lgHump: '驼峰顶 x ≈ 0.357', s4lgL: '色带：到左谷（全局最小）', s4lgR: '色带：到右谷（局部最小）', s4lgN: '色带：发散或未停稳',
    x4Slider: '起点 x₀', run4: '播放前 40 步',
    s4left: '左谷，全局最小', s4right: '右谷，局部最小', s4none: '没有停在任何一个谷底',
    s4readout: '起点 {x0}，η = {eta}：400 步后 x = {xe}，f = {fe}，停在{where}。同一 η 下，161 个起点里 {L} 个到左谷、{R} 个到右谷。',
    s4hint: '观察顺序：保持 η = 0.2，把起点从 −4 拖到 4：起点在灰色虚线（驼峰顶）左边就进左谷，右边就进右谷，色带在驼峰处一刀分开。再把起点放到 4，η 从 0.2 慢慢加到 0.8：驼峰外侧坡很陡，大步子会一步跨过驼峰；η ≥ 0.6 时，色带最右端开始变绿，η = 0.8 时最左端也有两个起点被弹进右谷。结论只对这条曲线和这些 η 成立：起点和步长一起决定落进哪个谷，算法本身不保证找到最低的那个。',

    s5k: '第 5 步 · 真实的用法',
    s5t: '用梯度下降拟合一条直线，地形从哪儿来，为什么有时走得特别慢？',
    s5e: '这一步要回答：训练模型时，被最小化的函数是什么，梯度下降在上面怎样走？数据是 24 个模拟点（按 y = 0.8x + 2 再加随机噪声生成）。模型是直线 ŷ = w·u + c，u 是输入特征，c 是 u = 0 处直线的高度。要最小化的是<strong>损失</strong>：所有点上 (ŷ − y)² 的平均，叫<strong>均方误差</strong>，越小说明直线贴得越近。损失只依赖两个参数 (w, c)，所以「地形」画在 (w, c) 平面上，每个数据点都往里贡献一项。这个地形和第 2 步一样是个碗，它的条件数 κ（最陡与最缓曲率之比）由数据决定：特征 u 直接用 x（都在 0.5 到 9.5 之间）时，改 w 和改 c 的效果几乎纠缠在一起，κ ≈ 157；先把 x 减去平均值再当特征，κ 降到约 6.9。另一个开关是<strong>批大小 B</strong>：每一步只用 B 个点算梯度，叫<strong>小批量</strong>；B = 24 就是用全部数据。小批量的梯度只是全部数据梯度的估计，带有随机误差。学习率按 η = 系数 × 2/λmax 设置，λmax 是碗最陡方向的曲率（<a class="xlink" href="../../../computing/ml/backpropagation/#step3">→ 反向传播页第 3 步：神经网络里的梯度也是这样拿来下坡的</a>）。',
    c5a: '数据点与当前拟合的直线', c5b: '损失（均方误差，对数刻度）随更新次数',
    c5cR: '损失等高线：横轴斜率 w，纵轴截距 c', c5cC: '损失等高线：横轴斜率 w，纵轴 c（x 平均处的高度）',
    s5lgData: '数据点', s5lgLine: '当前直线 / 路径 / 损失曲线', s5lgBest: '最小二乘直线 / 最小损失', s5lgC: '等高线', s5lgNow: '当前参数（青点 = 最优）',
    featLabel: '特征 u：', featR: 'u = x（原样）', featC: 'u = x − x 的平均值',
    batchLabel: '批大小：', batchAll: 'B = 24（全部数据）',
    q5Slider: '学习率系数（η = 系数 × 2/λmax）',
    run5: '播放 300 次更新', seed5: '换一种抽样顺序',
    s5readout: '特征 {feat}：碗的条件数 κ = {kappa}，η = {eta}，B = {B}。第 {k} 次更新后损失 {L}（可能的最小值 {Lopt}）；最后 100 次更新的平均损失 {tail}。当前 w = {w}、c = {c}；最优 w = {wo}、c = {co}。',
    s5hint: '观察顺序：先用「u = x（原样）」和 B = 24 按播放：等高线是一条又长又斜的窄谷，路径很快落到谷底线上，然后沿着它爬得很慢，300 次后损失还没到最小值，直线也还偏。切到「u = x − x 的平均值」再播放：等高线接近正圆，几十步就到最优，损失曲线贴上灰色虚线。然后保持居中特征，换 B = 1：路径在最优点附近不停抖动，损失曲线一直毛刺，最后 100 次的平均损失高于最小值；把系数从 0.1 拉到 0.5，这个差距随之变大（5 种抽样顺序都如此）。数据是模拟的；这些结论只覆盖这组数据和滑杆范围。',

    s6k: '第 6 步 · 收束',
    s6t: '一条规则，三个要看的量',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，只用脚下的坡度，规则 x新 = x − η·f′(x) 让 f 下降，前提是 η 不太大；<strong>第 1 步</strong>，在碗里每一步把距离乘 r = 1 − η·a，要求 η < 2/a；<strong>第 2 步</strong>，多个方向曲率不同时，下坡方向垂直于等高线而不对准谷底，陡的方向限制 η，缓的方向决定速度；<strong>第 3 步</strong>，最好的 η* = 2/(1 + κ)，所需步数大致与条件数 κ 成正比；<strong>第 4 步</strong>，有多个谷时，起点和步长一起决定落在哪里；<strong>第 5 步</strong>，训练模型就是在数据造出的损失地形上做同样的事，特征居中能把窄谷变圆，小批量用更便宜的梯度换来抖动。写成一般形式时，θ 代表全部参数，L 是损失，λmax、λmin 是碗最陡、最缓方向的曲率：',
    formula: 'θ ← θ − η · ∇L(θ)\n收敛（二次碗）：0 < η < 2 / λmax\n每步缩放（η* = 2/(λmax + λmin)）：(κ − 1)/(κ + 1)',
    boundary: '适用范围：第 1–3 步的收敛条件和步数估计只对二次函数（碗形）严格成立；一般函数在谷底附近近似为碗，所以结论只在那附近近似可用。本页始终用固定学习率、不加动量，也不用 Adam 等自适应方法，它们会改变上面的速度结论。第 4 步只说明一条曲线上的现象：梯度下降停在坡度为 0 的点，不保证是全局最小。第 5 步数据是模拟的；小批量的抖动大小取决于数据、η 和 B，实践中常把学习率逐渐调小来压低它。',
    linksTitle: '接着去哪儿',
    lk1: '→ 反向传播页第 2 步：神经网络里的梯度是怎样一层层算出来的',
    lk2: '→ 牛顿法页第 0 步：同样靠切线往前跳，目标换成让函数等于 0',
    lk3: '→ 过拟合页第 1 步：训练损失降到最低，不等于在新数据上最好',
    lk4: '→ 特征向量页第 4 步：碗的主轴方向和曲率从哪里来',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《梯度下降 · 摸黑下山》的平行版本。'
  },
  en: {
    pageTitle: 'Gradient Descent · Finding the Bottom by Slope Alone',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Gradient Descent · Feeling Your Way Downhill →',
    navLabel: 'Gradient descent steps',
    tagline: 'You want a function to be as small as possible, but you cannot see its whole shape; all you can measure is the slope where you stand. Gradient descent steps downhill by an amount set by that slope, then repeats. Over seven steps you will see why this works, how a too-large step bounces or flies off, why a long narrow valley slows it down, and how it fits real data.',
    nav0: '0 One step', nav1: '1 Step size', nav2: '2 Narrow valley', nav3: '3 Choosing η', nav4: '4 Two valleys', nav5: '5 Fitting data', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The only information',
    s0t: 'Knowing only the slope underfoot, which way do you step, and how far?',
    s0e: 'The question here: if all you can measure at your current position x is the <strong>slope</strong> (the derivative f′(x): how fast f changes as x moves a tiny bit to the right; <a class="xlink" href="../../../math/calculus/derivative/#step2">→ Derivative, step 2: the derivative at every point</a>), how do you pick the next position? The function is f(x) = ½(x − 1)², with its bottom at x = 1, but the algorithm never sees this curve. Gradient descent is a one-line rule: <strong>x_new = x − η · f′(x)</strong>. A positive slope means higher ground to the right, so you move left; a negative slope sends you right. <strong>η</strong> (eta) is the <strong>learning rate</strong>: how many units you move per unit of slope, chosen in advance. The tangent line (orange) also forecasts how much f will drop: −η · f′(x)².',
    c0: 'f(x) = ½(x − 1)²: current point, tangent and one step',
    s0lgF: 'the function f(x) (hidden from the algorithm)', s0lgX: 'current point x', s0lgT: 'tangent (slope f′(x))', s0lgStep: 'this step, −η·f′(x)', s0lgPred: 'height the tangent forecasts', s0lgGap: 'forecast vs actual',
    xSlider: 'current position x', etaSlider: 'learning rate η',
    next0: 'Take this step (x ← x_new)',
    dirFlat: 'the slope is 0, so you stay put', dirLeft: 'higher to the right, so step left', dirRight: 'higher to the left, so step right',
    s0down: 'f went down', s0up: 'f went up instead', s0same: 'f did not change',
    s0readout: 'At x = {x}: slope f′(x) = {g}; {dir}. The step −η·f′(x) = {step} lands at x_new = {xn}. The tangent forecasts a change in f of {pred}; the actual change is {act}: {verdict}.',
    s0hint: 'What to try: keep η = 0.5 and drag x. The green arrow grows where the slope is steeper (the tangent tilts more) and flips direction once you pass the bottom at x = 1. Then fix x = 4 and drag η from 0.1 to 2.4. For small η the hollow orange circle (the tangent’s forecast) and the green dot (where you actually land) almost coincide; as η grows, the pink dashed gap widens. On this curve η = 1 lands on the bottom in one step, η = 2 lands at the same height on the far side so f does not change, and anything larger makes f go up. “Take this step” moves x to the new point (rounded to the slider’s 0.1 grid); press it repeatedly.',

    s1k: 'Step 1 · Repeat the step',
    s1t: 'Repeating one rule over and over: when do you reach the bottom, and when do you drift away?',
    s1e: 'The question here: how large can the learning rate η be for repeated steps to settle at the bottom? Take the simplest bowl, f(x) = ½ a x², with its bottom at 0. The parameter a is the <strong>curvature</strong>: how sharply the bowl bends; larger a means steeper walls. The slope is f′(x) = a·x, so one update becomes x_new = (1 − η·a) · x: every step multiplies the distance to the bottom by the same <strong>factor r = 1 − η·a</strong>. When |r| < 1 the distance keeps shrinking, which is <strong>convergence</strong>; when |r| > 1 it keeps growing, which is <strong>divergence</strong>. A negative r means each step jumps across the bottom to the other side. So η must stay below <strong>2 / a</strong>: the more curved the bowl, the smaller the steps you can afford. The run always starts at x₀ = 4 and shows 30 steps.',
    c1a: '30 steps on the curve ½ a x² (orange joins consecutive steps)', c1b: 'Distance to the bottom |x| against step k (log scale)',
    s1lgF: 'f(x) = ½ a x²', s1lgPath: 'iterates (x right of the bottom)', s1lgNeg: 'x left of the bottom', s1lgTol: '1/1000 of the starting distance', s1lgHollow: 'below 10⁻⁹ (including exactly 0), pinned to the bottom edge',
    aSlider: 'curvature a', run1: 'Play 30 steps from x₀ = 4',
    progress: '{c}/{N} steps taken · ',
    reg_one: 'straight to the bottom in one step (r = 0)', reg_mono: 'creeps in from one side, never crossing the bottom', reg_osc: 'hops across the bottom each step, by less and less', reg_bounce: 'bounces between ±4 forever, never closer', reg_diverge: 'hops across the bottom by more and more (divergence)',
    s1steps: 'after {n} steps the distance is below 1/1000 of the start', s1never: 'never gets within 1/1000 of the starting distance',
    s1readout: 'a = {a}, η = {eta}: factor r = 1 − η·a = {r}, so it {reg}; {n}. Convergence needs η < 2/a = {lim}. At step 30, x = {xk}.',
    s1hint: 'What to try: keep a = 2 and drag η slowly from 0.05 to 1.5, pausing to read the “distance to the bottom” chart. Below 0.5 it is a falling straight line (multiplying by the same r every step is a straight line on a log scale) and every dot is orange. Between 0.5 and 1 the dots alternate orange and pink, meaning each step crosses to the far side, yet the line still falls. At η = 1 it goes flat, and above 1 it climbs. Then set a = 4: the same η diverges sooner, because the limit has moved to 2/a = 0.5. The play button drops the points one at a time.',
    quizPrompt: 'Think: with a = 2, which η reaches the bottom in a single step?',
    quizA: 'η = 0.25', quizB: 'η = 0.5', quizC: 'η = 1',
    check: 'Check', pick: 'Pick an option first.',
    correct: 'Right. One step to the bottom needs r = 1 − η·a = 0, that is η = 1/a = 0.5. Set η to 0.5 and the distance chart drops to 0 after step 1 (hollow dots on the bottom edge). The catch: this needs the curvature a in advance, and gradient descent only measures slopes, so it usually does not know a.',
    wrong: 'Look again: to land on the bottom in one step, what must the factor r = 1 − η·a be? Put that η on the slider and check.',

    s2k: 'Step 2 · Two directions',
    s2t: 'In a long, narrow valley, why does downhill not point at the bottom?',
    s2e: 'The question here: with more than one variable, why does gradient descent zigzag? Now the function has two variables: f(x, y) = ½(x² + κ y²), bottom at (0, 0). The <strong>gradient</strong> ∇f = (x, κy) is an arrow built from the slopes in both directions, pointing the steepest way uphill; the rule is still one line: position_new = position − η · ∇f. The top-down view shows <strong>contour lines</strong>: f has the same value all along each ellipse. The two directions bend differently, with curvature 1 along x and κ along y; <strong>κ</strong> (kappa) is the <strong>condition number</strong>, the ratio of the steepest to the gentlest curvature, and larger κ means a narrower valley. The downhill direction −∇f (green arrow) always crosses the contour underfoot at a right angle instead of aiming at the bottom (grey dashed line). Taken apart, each direction is the one-dimensional problem of step 1: x is multiplied by 1 − η every step, y by 1 − η·κ. η must stay below 2/κ or the steep y direction diverges, yet a small η barely shrinks the gentle x direction. Both axes use the same scale, so the angles are true (<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step4">→ Eigenvectors, step 4: how a general bowl is rotated onto axes like these</a>).',
    c2a: 'Contours seen from above: the path from (−4.5, 1.8)', c2b: 'Distance to the bottom (log scale) by step',
    s2lgC: 'contour lines', s2lgG: 'downhill direction −∇f at the start', s2lgLine: 'straight line to the bottom / arrival level 0.01', s2lgPath: 'path of the iterates', s2lgMin: 'bottom (0, 0)',
    kSlider: 'condition number κ', run2: 'Play 200 steps',
    s2div: 'the steep y direction diverges and the path leaves the valley', s2bounce: 'y bounces between the two walls forever', s2arrive: 'within 0.01 of the bottom after {n} steps',
    s2readout: 'κ = {k}, η = {eta}: at the start, downhill is {ang}° away from the direction of the bottom. Per-step factors: along x 1 − η = {rg}, along y 1 − η·κ = {rs}; stability needs η < 2/κ = {lim}. Result: {state}.',
    s2hint: 'What to try: keep κ = 10 and η = 0.15 and press play. The path first hops back and forth across the narrow y direction (y is multiplied by −0.5 each step), settles onto the valley floor fast, then crawls along x (multiplied by only 0.85 each step). Push η past 0.2 and the y factor drops below −1, so the path is thrown out of the valley. Lower η to 0.05 and the hopping stops, but the distance line goes nearly flat and takes over a hundred steps. Finally drag κ to 1: the contours become circles, the green arrow points straight at the bottom, and the angle is 0°.',

    s3k: 'Step 3 · Choosing the learning rate',
    s3t: 'Which learning rate reaches the bottom in the fewest steps?',
    s3e: 'The question here: in the valley of step 2, which η is fastest, and how fast is fastest? Same function f(x, y) = ½(x² + κ y²), same start; “arrived” means within 0.01 of the bottom. The horizontal axis measures η as a fraction of the stability limit 2/κ (η ÷ (2/κ)), so every κ shares one ruler; past 1 the run diverges (pink zone). The two per-step factors are 1 − η and 1 − η·κ (the condition number κ is the ratio of steep to gentle curvature). Making their sizes equal gives <strong>η* = 2 / (1 + κ)</strong>, which shrinks the slower direction as fast as possible, by a factor (κ − 1)/(κ + 1) per step. Note that η* ÷ (2/κ) = κ/(1 + κ): the larger κ, the closer the best η sits to the edge of divergence.',
    c3a: 'Steps to arrive (log scale) vs η ÷ (2/κ)', c3b: 'Steps with η* vs condition number κ',
    s3lgCurve: 'steps curve (current κ)', s3lgNow: 'your choice', s3lgBest: 'η* = 2/(1 + κ)', s3lgDiv: 'diverges', s3lgK: 'fewest steps by κ', s3lgRef: 'reference line 3.1κ',
    qSlider: 'η ÷ (2/κ)', best3: 'Jump to η*', never: 'never',
    s3readout: 'κ = {k}: stability limit 2/κ = {lim}. Current η = {q} × limit = {eta}, arriving in {n} steps. η* = {eb} ({qb} of the limit) arrives in {nb} steps, shrinking by {rate} per step.',
    s3hint: 'What to try: keep κ = 10 and drag η ÷ (2/κ) from 0.05 to 1.1, watching the white dot ride the cyan curve in the top chart. Too small costs hundreds of steps; the count falls toward the orange dashed line (η*), rises again past it, and past 1 the run never arrives. Press “Jump to η*” to read the minimum. Then drag κ: the lowest point of the top chart slides right toward 1, and in the lower chart the white dot rides the orange line. From this start, for κ between 2 and 50, the fewest steps come to about 3.1 × κ (grey reference line): double the condition number and you double the steps. That multiplier belongs to this start point and the 0.01 arrival rule only.',

    s4k: 'Step 4 · More than one valley',
    s4t: 'With two valleys, which one does gradient descent end up in?',
    s4e: 'The question here: once the curve is no longer a single bowl, what decides where you stop? Here f(x) = 0.04x⁴ − 0.5x² + 0.35x has two valleys. The left one is lower: the <strong>global minimum</strong>, the lowest point of the whole curve. The right one is only lower than its neighbourhood: a <strong>local minimum</strong>. The hump between them also has zero slope at its top. Each step looks only at the slope underfoot (f′(x)), which is zero at both valley floors, so the algorithm stops at either one and cannot tell which is lower. The strip underneath runs 400 steps from each of 161 starts, every 0.05 from −4 to 4, and colours each start by where it ends: green for the left valley, orange for the right.',
    c4a: 'The first 40 steps on f(x) = 0.04x⁴ − 0.5x² + 0.35x', c4b: 'Where each of 161 starts ends up (same η)',
    s4lgF: 'f(x)', s4lgPath: 'path (hollow circle = start)', s4lgHump: 'top of the hump x ≈ 0.357', s4lgL: 'strip: ends in the left valley (global)', s4lgR: 'strip: ends in the right valley (local)', s4lgN: 'strip: diverged or still moving',
    x4Slider: 'start x₀', run4: 'Play the first 40 steps',
    s4left: 'the left valley, the global minimum', s4right: 'the right valley, a local minimum', s4none: 'neither valley floor',
    s4readout: 'Start {x0}, η = {eta}: after 400 steps x = {xe} and f = {fe}, so it settled in {where}. With this η, of the 161 starts {L} end in the left valley and {R} in the right.',
    s4hint: 'What to try: keep η = 0.2 and drag the start from −4 to 4. Starting left of the grey dashed line (the hump’s top) lands you in the left valley, starting right of it in the right one, and the strip splits cleanly at the hump. Then put the start at 4 and raise η from 0.2 to 0.8. The outer walls are steep, so a big step can clear the hump in one jump: from η = 0.6 the right end of the strip starts turning green, and at η = 0.8 two starts at the far left are thrown into the right valley. This holds for this curve and these η only: the start and the step size together decide the valley, and nothing in the algorithm promises the lowest one.',

    s5k: 'Step 5 · What it is used for',
    s5t: 'Fitting a line by gradient descent: where does the landscape come from, and why is it sometimes so slow?',
    s5e: 'The question here: when you train a model, what function is being minimised, and how does gradient descent move on it? The data are 24 simulated points (made from y = 0.8x + 2 plus random noise). The model is a line ŷ = w·u + c, where u is the input feature and c is the line’s height at u = 0. What gets minimised is the <strong>loss</strong>: the average of (ŷ − y)² over all points, the <strong>mean squared error</strong>; smaller means the line hugs the points more closely. The loss depends only on the two parameters (w, c), so the “landscape” lives on the (w, c) plane, and every data point adds a term to it. Like step 2 it is a bowl, and its condition number κ (steepest over gentlest curvature) is set by the data. With u = x as given (all between 0.5 and 9.5), changing w and changing c have nearly entangled effects and κ ≈ 157; subtract the mean of x first and κ falls to about 6.9. The other switch is the <strong>batch size B</strong>: each step computes the gradient from only B points, a <strong>mini-batch</strong>; B = 24 means all the data. A mini-batch gradient is only an estimate of the full one and carries random error. The learning rate is set as η = factor × 2/λmax, where λmax is the curvature of the bowl’s steepest direction (<a class="xlink" href="../../../computing/ml/backpropagation/#step3">→ Backpropagation, step 3: neural-network gradients are used to go downhill in exactly this way</a>).',
    c5a: 'Data points and the line fitted so far', c5b: 'Loss (mean squared error, log scale) by update',
    c5cR: 'Loss contours: slope w across, intercept c up', c5cC: 'Loss contours: slope w across, c (height at mean x) up',
    s5lgData: 'data points', s5lgLine: 'current line / path / loss curve', s5lgBest: 'least-squares line / lowest loss', s5lgC: 'contour lines', s5lgNow: 'current parameters (cyan dot = optimum)',
    featLabel: 'Feature u:', featR: 'u = x (as given)', featC: 'u = x − mean of x',
    batchLabel: 'Batch size:', batchAll: 'B = 24 (all data)',
    q5Slider: 'learning-rate factor (η = factor × 2/λmax)',
    run5: 'Play 300 updates', seed5: 'New sampling order',
    s5readout: 'Feature {feat}: the bowl’s condition number κ = {kappa}, η = {eta}, B = {B}. After update {k} the loss is {L} (lowest possible {Lopt}); averaged over the last 100 updates it is {tail}. Now w = {w}, c = {c}; best w = {wo}, c = {co}.',
    s5hint: 'What to try: start with “u = x (as given)” and B = 24 and press play. The contours form a long, tilted, narrow valley; the path drops onto its floor quickly, then crawls along it, and after 300 updates the loss has still not reached its minimum and the line is still off. Switch to “u = x − mean of x” and play again: the contours are close to circles, the optimum arrives within a few dozen updates and the loss curve settles onto the grey dashed line. Then keep the centred feature and pick B = 1: the path keeps jittering around the optimum, the loss curve stays ragged, and the last-100 average stays above the minimum; raise the factor from 0.1 to 0.5 and that gap widens (for all 5 sampling orders). The data are simulated; these findings cover this data set and the slider ranges only.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One rule, three things to watch',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: using only the slope underfoot, x_new = x − η·f′(x) lowers f as long as η is not too large. <strong>Step 1</strong>: in a bowl each step multiplies the distance by r = 1 − η·a, which needs η < 2/a. <strong>Step 2</strong>: when directions bend differently, downhill crosses the contours at right angles instead of aiming at the bottom; the steep direction caps η and the gentle one sets the pace. <strong>Step 3</strong>: the best η* = 2/(1 + κ), and the steps needed grow roughly in proportion to the condition number κ. <strong>Step 4</strong>: with several valleys, the start and the step size together decide where you stop. <strong>Step 5</strong>: training a model is the same loop on a loss landscape built from data; centring the feature rounds the valley, and mini-batches trade cheaper gradients for jitter. In general form, θ stands for all the parameters, L for the loss, and λmax, λmin for the curvatures of the bowl’s steepest and gentlest directions:',
    formula: 'θ ← θ − η · ∇L(θ)\nconverges (quadratic bowl): 0 < η < 2 / λmax\nper-step factor (η* = 2/(λmax + λmin)): (κ − 1)/(κ + 1)',
    boundary: 'Scope: the convergence conditions and step counts of steps 1–3 are exact only for quadratic functions (bowls); a general function looks like a bowl near its minimum, so they apply only approximately and only there. The page uses a fixed learning rate throughout, with no momentum and no adaptive methods such as Adam, which change the speed results above. Step 4 shows what happens on one curve: gradient descent stops where the slope is zero, with no promise of the global minimum. The data in step 5 are simulated; how much mini-batches jitter depends on the data, η and B, and in practice the learning rate is often lowered over time to calm it.',
    linksTitle: 'Where to go next',
    lk1: '→ Backpropagation, step 2: how a neural network’s gradient is computed layer by layer',
    lk2: '→ Newton’s method, step 0: another tangent-driven jump, aimed at where the function equals 0',
    lk3: '→ Overfitting, step 1: the lowest training loss is not the best fit for new data',
    lk4: '→ Eigenvectors, step 4: where a bowl’s principal directions and curvatures come from',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Gradient Descent · Feeling Your Way Downhill”.'
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
  const fb = document.getElementById('quizFeedback');
  if (fb && fb.dataset.state) { const choice = document.querySelector('input[name="quiz"]:checked'); fb.textContent = t(choice ? fb.dataset.state : 'pick'); }
  if (typeof window.refreshGradientDescent === 'function') window.refreshGradientDescent();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.GD_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
