'use strict';
// Vectors lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '向量 · 一个箭头装下两个数',
    back: '← 知识索引',
    compare: '对照另一版本：向量 · 有方向的量 →',
    navLabel: '向量步骤导航',
    tagline: '「往前走 5 米」说不清你到了哪儿，「往东北走 5 米」才说得清。既有大小又有方向的量叫向量：位移、速度、力都是。这一页把向量画成箭头、写成一对数，看它怎样相加、伸缩、拆分，怎样用点积量出两个方向有多「一致」，最后用它算出飞机在侧风里该朝哪儿飞。',
    nav0: '0 箭头与分量', nav1: '1 相加', nav2: '2 伸缩与相减', nav3: '3 拆成两个方向', nav4: '4 点积', nav5: '5 侧风飞行', nav6: '6 收束',

    s0k: '第 0 步 · 箭头与分量',
    s0t: '从一点走到另一点，要记下哪两个数才算把这次移动说清楚？',
    s0e: '这一步要回答：一段移动（<strong>位移</strong>）有长短也有方向，怎样用数写下来？把它画成从起点指向终点的箭头，这样的量叫<strong>向量</strong>，记作 <strong>a</strong>。在坐标纸上，箭头向右（x 方向）走了几格、向上（y 方向）走了几格，这两个数叫 a 的<strong>分量</strong>，写成 a = (aₓ, a_y)；它们等于「终点坐标 − 起点坐标」。箭头的长度叫<strong>模</strong>，记作 |a|：分量是直角三角形的两条直角边，所以 |a| = √(aₓ² + a_y²)（<a class="xlink" href="../../../math/algebra/coordinate-plane/#step6">→ 坐标平面第 6 步：两点间的距离</a>）。方向用<strong>方向角</strong>描述：从 x 轴正方向逆时针转到箭头所转的角度。',
    c0a: '位移 a：从起点到终点（1 格 = 1 单位）',
    lgA0: '向量 a', lgCopy0: '同一个 a 放在别的起点', lgX0: 'x 分量 aₓ', lgY0: 'y 分量 a_y',
    axS: 'x 分量 aₓ（向右为正）', ayS: 'y 分量 a_y（向上为正）', move0: '换一个起点',
    s0readout: '起点 ({px}, {py}) → 终点 ({qx}, {qy})：分量 = 终点 − 起点 = ({ax}, {ay})。模 |a| = √({ax}² + {ay}²) = {m}，方向角 {dir}。',
    s0zero: '零向量：起点和终点重合，模为 0，没有方向。',
    s0hint: '观察顺序：先拖两个分量，看橙色箭头和青、绿两段直角边一起变；再按「换一个起点」，箭头整体搬走，但读数里的分量、模、方向角一个都不变，灰色虚线箭头是它在其他起点的同一份拷贝。所以向量只记「怎么走」，不记「从哪儿走」：起点不同、分量相同的箭头是同一个向量。',
    dirFmt: '{d}°',

    s1k: '第 1 步 · 相加',
    s1t: '先走 a、再走 b，总的位移是什么？它和两步的长度之和有什么关系？',
    s1e: '这一步要回答：两段移动接连发生，合起来等于哪一段移动？把 b 的起点接到 a 的终点（<strong>首尾相接</strong>），从 a 的起点指向 b 的终点的箭头就是<strong>和向量</strong> a + b。用分量算，就是 x 分量相加、y 分量相加：a + b = (aₓ + bₓ, a_y + b_y)，因为向右走的格数和向上走的格数各自累加，互不干扰。这里的 a 就是第 0 步设好的那个向量（分量、模的意思同第 0 步：向右、向上各走几格，箭头长度）。',
    c1a: '首尾相接：先 a 后 b',
    lgA: '向量 a', lgB: '向量 b', lgSum: '和 a + b', lgOther: '另一条路线：先 b 后 a',
    bxS: 'b 的 x 分量 bₓ', byS: 'b 的 y 分量 b_y', other1: '也画出「先走 b 再走 a」',
    s1readout: 'a + b = ({ax} + {bx}, {ay} + {by}) = ({sx}, {sy})。|a + b| = {ms}，而 |a| + |b| = {ma} + {mb} = {mab}：{rel}',
    relLess: '合起来比两段长度之和短（绕了弯）。', relEq: '两者相等：a、b 同方向，没有绕弯。',
    s1hint: '观察顺序：拖 b 的两个分量，看青色和向量的终点始终落在「a 的分量 + b 的分量」那一格。再按「也画出先走 b 再走 a」：两条路线围成一个平行四边形，终点相同，所以 a + b = b + a。最后把 b 调成和 a 同方向（比如 b = (3, 2)），读数里 |a + b| 才等于 |a| + |b|；其余时候总是更短，这叫三角不等式。',

    s2k: '第 2 步 · 伸缩与相减',
    s2t: '把 a 乘一个数 k 会怎样？a − b 又是从哪儿指向哪儿？',
    s2e: '这一步要回答两个问题。第一，<strong>数乘</strong> k·a 是把 a 的每个分量都乘 k：k > 0 时方向不变、长度变成 k 倍；k < 0 时方向反过来；k = 0 时得到<strong>零向量</strong>（长度为 0、没有方向）。第二，<strong>相减</strong> a − b 定义为 a + (−b)，−b 是把 b 掉头的向量（−1 倍）。把 a、b 从同一点画出，a − b 就是从 b 的终点指向 a 的终点的箭头：b 再加上它就回到 a。a、b 沿用第 1 步（分量：向右、向上各走几格）。',
    c2a: '数乘：k·a', c2b: '相减：a − b = a + (−b)',
    lgA2: '原来的 a', lgKA: 'k·a', lgDiff: 'a − b', lgNegB: '−b（从 a 的终点接出）',
    kS: '倍数 k',
    s2readout: 'k·a = {k}·({ax}, {ay}) = ({kx}, {ky})，|k·a| = |{k}|·{ma} = {mk}{dirNote}　｜　a − b = ({ax} − {bx}, {ay} − {by}) = ({dx}, {dy})，|a − b| = {md}',
    dirSame: '，方向与 a 相同', dirOpp: '，方向与 a 相反', dirZero: '，是零向量',
    s2hint: '观察顺序：左图只拖 k。k 从 2 降到 0，橙色箭头沿着 a 所在的直线缩短；过了 0 掉头指向反方向，但始终在同一条直线上。右图不用动：粉色 a − b 从 b 的终点指到 a 的终点；虚线的 −b 从 a 的终点接出，走完也到同一个点，这就是 a − b = a + (−b)。想改 a、b 回第 0、1 步拖。',

    s3k: '第 3 步 · 拆成两个方向',
    s3t: '只给两个方向 e₁、e₂，能不能拼出平面上的任何向量 c？',
    s3e: '这一步要回答：任意给一个目标向量 c，能不能找到两个数 s、t，让 <strong>c = s·e₁ + t·e₂</strong>？这里 e₁ = (2, 0)，e₂ = (1, 2)，两者方向不同。s·e₁ + t·e₂ 叫 e₁、e₂ 的<strong>线性组合</strong>：先沿 e₁ 方向走 s 倍（数乘，同第 2 步），再沿 e₂ 方向走 t 倍（首尾相接，同第 1 步）。图中灰色斜格就是 s、t 取整数时能到的点。<strong>平面向量基本定理</strong>说：只要 e₁、e₂ 不共线（不在同一条直线上），任何 c 都恰好有一组 s、t；这对 e₁、e₂ 叫一组<strong>基底</strong>。按分量写，这是两个方程 2s + t = cₓ、2t = c_y，解出 s = (2cₓ − c_y)/4、t = c_y/2。',
    c3a: '用 s·e₁ + t·e₂ 去够目标 c',
    lgE1: 'e₁ 方向走 s 倍', lgE2: '接着 e₂ 方向走 t 倍', lgC3: '目标 c', lgMix: 's·e₁ + t·e₂ 到达的点', lgLat: 's、t 为整数时的格点',
    cxS: '目标 c 的 x 分量', cyS: '目标 c 的 y 分量', sS: 's（e₁ 的倍数）', tS: 't（e₂ 的倍数）',
    solve3: '解出 s、t', par3: '把 e₂ 换成与 e₁ 平行的 (3, 0)',
    s3readout: '{e2}：s·e₁ + t·e₂ = {s}·(2, 0) + {t}·{e2v} = ({mx}, {my})；目标 c = ({cx}, {cy})，还差 {gap}。{verdict}',
    e2Name: 'e₂ = (1, 2)', e2ParName: 'e₂ = (3, 0)，与 e₁ 平行',
    hit3: '够到了：c = {s}·e₁ + {t}·e₂。',
    sol3: '唯一解是 s = {s}，t = {t}。', noSol3: 'e₁、e₂ 共线，s·e₁ + t·e₂ 只能落在 x 轴上，c 不在这条线上，怎么取都够不到。', manySol3: 'e₁、e₂ 共线而 c 恰好在 x 轴上：能够到，而且有无数组 s、t（例如 s = {s}，t = 0）。',
    s3hint: '观察顺序：先只拖 s、t，看青色折线（先蓝绿、后紫）的终点在斜格上移动，读数里的「还差」变小到 0 就算够到。再改目标 c，按「解出 s、t」，折线自动走到 c。最后按「换成平行的 e₂」：格点全挤到 x 轴上，c 只要不在 x 轴上就永远差一截。',
    quizPrompt: '想一想：e₂ 换成与 e₁ 平行的 (3, 0) 后，为什么大多数 c 都拼不出来？',
    quizA: 's、t 的取值范围不够大', quizB: 's·e₁ + t·e₂ 无论怎么取都落在同一条直线上', quizC: '要用更精细的小数才能拼出来',
    check: '核对', correct: '对。两个平行的方向只能张出一条直线，离开这条线的 c 永远够不到；所以基底要求两个方向不共线。',
    wrong: '再看看：按下平行按钮后，把 s、t 拖到两端，青色终点能离开 x 轴吗？',

    s4k: '第 4 步 · 点积',
    s4t: '两个箭头方向有多「一致」，能不能用一个数说出来？',
    s4e: '这一步要回答：给两个向量 a、b，怎样用一个数衡量它们方向一致的程度？<strong>点积</strong>（也叫数量积）有两种等价的算法：按分量，<strong>a·b = aₓbₓ + a_yb_y</strong>；按几何，<strong>a·b = |a||b|cos θ</strong>，θ 是两箭头之间的<strong>夹角</strong>（0° 到 180°），|a|、|b| 是模（箭头长度）。|b|cos θ 是 b 在 a 所在直线上的<strong>投影</strong>：从 b 的终点向这条直线作垂线得到的「影子」的带符号长度，所以 a·b = |a| × 投影。这里 |a| = 4 固定，a、b 的方向角（从 x 轴正方向逆时针量）和 |b| 可调（cos 的意思见<a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ 三角函数第 1 步：点的坐标</a>）。右图横轴是夹角 θ，纵轴是 a·b，曲线是 |a||b|cos θ，白点是你试过的角度。',
    c4a: 'a、b 与 b 在 a 上的投影', c4b: 'a·b 随夹角 θ 变化',
    lgProj: 'b 在 a 方向上的投影', lgDots: '试过的夹角（按分量算出的 a·b）',
    alS: 'a 的方向角', beS: 'b 的方向角', blS: 'b 的模 |b|', sweep4: '让 b 转一圈',
    s4readout: '{prog}a = ({ax}, {ay})，b = ({bx}, {by})。按分量：{ax}×{bx} + {ay}×{by} = {d1}；按几何：4 × {mb} × cos {th}° = {d2}。投影 = {pr}。{sign}',
    signPos: '夹角小于 90°：点积为正，b 有一部分顺着 a。', signZero: '夹角 90°：点积为 0，两者垂直。', signNeg: '夹角大于 90°：点积为负，b 有一部分逆着 a。',
    s4progress: '已转 {c}/{N} · ',
    s4hint: '观察顺序：只拖 b 的方向角（或按「让 b 转一圈」），保持 |b| 不变。绿色投影随夹角变短，90° 时缩成一个点，再往后跑到 a 的反方向；右图白点沿余弦曲线走，读数里两种算法始终相等。再拖 |b|：曲线整体变高变矮，点积与 |b| 成正比。用途：若 b 是拉力（牛）、a 是位移（米），a·b 就是这个力做的功（焦）：只有顺着位移的那部分力在做功。',

    s5k: '第 5 步 · 侧风飞行',
    s5t: '西风把飞机往东吹，机头要朝西偏多少度，才能正好飞到正北 300 km 处的城市？',
    s5e: '这一步要回答：飞机相对空气的速度（<strong>空速</strong>，大小 200 km/h，方向就是机头方向）和风的速度（向东，大小可调）同时作用，飞机相对地面怎么走？速度也是向量，所以<strong>地速 = 空速 + 风速</strong>（首尾相接，同第 1 步）。左图是这三个速度向量（单位 km/h）；右图是地图（单位 km），虚线是正北的目标航线。<strong>航向角</strong>指机头偏离正北的角度，向东为正、向西为负。要地速正指北，地速的东西分量必须为 0：200·sin φ + 风速 = 0，所以 sin φ = −风速/200。',
    c5a: '速度三角形（km/h）', c5b: '地图：起点、目标与实际航迹（km）',
    lgAir: '空速（机头方向，200 km/h）', lgWind: '风速（向东）', lgGround: '地速 = 空速 + 风速', lgCourse: '正北的目标航线',
    wS: '风速（向东，km/h）', phS: '航向角 φ（向东为正，度）', aim5: '算出正确航向',
    s5readout: '地速 = ({gx}, {gy}) km/h，大小 {gs} km/h，实际朝北偏{side} {tr}°。飞到正北 300 km 的纬度要 {h} 小时，此时偏{side2} {dr} km。{verdict}',
    east: '东', west: '西',
    aimOk: '落在目标城市 0.5 km 以内：机头偏西 {ph}°，地速只剩 {gs} km/h，比无风时的 200 km/h 慢。', aimNeed: '要正好飞到，航向角应为 {ph}°（sin φ = −{w}/200）。',
    s5hint: '观察顺序：先保持航向 0°，把风速从 0 拖到 80：左图紫色风速变长，青色地速斜向东；右图航迹偏东，偏离 = 风速 × 1.5 小时（80 km/h 时 120 km）。再按「算出正确航向」：机头转向西，青色地速转回正北，但它变短了，所以飞得更久。也可以自己拖航向角，看偏离读数什么时候接近 0。本模型假设风速、空速全程不变，不考虑起降和地球曲率。',

    s6k: '第 6 步 · 收束',
    s6t: '一句话：向量是一对分量，加减、伸缩都按分量各算各的，点积把两个方向压成一个数',
    s6fin: '回顾：向量只记「怎么走」，分量 = 终点 − 起点，模由勾股定理给出（第 0 步）；首尾相接的和就是分量相加，且 |a + b| ≤ |a| + |b|（第 1 步）；数乘伸缩或掉头，a − b 从 b 的终点指向 a 的终点（第 2 步）；两个不共线的方向能拼出平面上任何向量（第 3 步）；点积 aₓbₓ + a_yb_y = |a||b|cos θ 用一个数说出方向一致的程度（第 4 步）；速度相加让你算出侧风里的航向（第 5 步）。',
    formula: 'a ± b = (aₓ ± bₓ, a_y ± b_y)　k·a = (k·aₓ, k·a_y)\n|a| = √(aₓ² + a_y²)\na·b = aₓbₓ + a_yb_y = |a||b|cos θ',
    boundary: '适用范围：本页都是平面（二维）向量；三维时多一个 z 分量，规则逐条照搬。夹角和方向角只对非零向量有定义。第 5 步假设风和空速恒定、在平面地图上计算；真实航行还要考虑风随高度和时间变化。',
    linksTitle: '接着去看',
    lk1: '线性变换 · 第 1 步：基向量记账（第 3 步的基底，换一种用法）→',
    lk2: '牛顿定律 · 第 2 步：摩擦与合力（力的相加）→',
    lk3: '抛体与圆周 · 第 2 步：速度的两份（把速度拆成分量）→',
    lk4: '复数 · 第 2 步：加法是平移（复数相加就是向量相加）→',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《向量 · 有方向的量》的平行版本。'
  },
  en: {
    pageTitle: 'Vectors · Two Numbers in One Arrow',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Vectors · Quantities With a Direction →',
    navLabel: 'Vector lesson steps',
    tagline: '“Walk 5 metres” doesn’t say where you end up; “walk 5 metres north-east” does. A quantity with both a size and a direction is a vector: displacements, velocities and forces all are. This page draws vectors as arrows and writes them as pairs of numbers, then shows how they add, stretch and split, how the dot product measures how much two directions agree, and finally how to point a plane through a crosswind.',
    nav0: '0 Arrows & components', nav1: '1 Adding', nav2: '2 Scaling & subtracting', nav3: '3 Two directions', nav4: '4 Dot product', nav5: '5 Crosswind', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Arrows and components',
    s0t: 'To pin down a move from one point to another, which two numbers do you have to write down?',
    s0e: 'This step asks: a move (a <strong>displacement</strong>) has a length and a direction; how do you put it into numbers? Draw it as an arrow from start to end. A quantity like this is a <strong>vector</strong>, written <strong>a</strong>. On grid paper, the number of squares the arrow goes right (x) and up (y) are its <strong>components</strong>, written a = (aₓ, a_y); they equal “end coordinates − start coordinates”. The arrow’s length is its <strong>magnitude</strong> |a|. The components are the two legs of a right triangle, so |a| = √(aₓ² + a_y²) (<a class="xlink" href="../../../math/algebra/coordinate-plane/#step6">→ Coordinate plane, step 6: distance between two points</a>). Direction is given by the <strong>direction angle</strong>: how far you turn anticlockwise from the positive x-axis to reach the arrow.',
    c0a: 'Displacement a: start to end (1 square = 1 unit)',
    lgA0: 'vector a', lgCopy0: 'the same a at other starting points', lgX0: 'x component aₓ', lgY0: 'y component a_y',
    axS: 'x component aₓ (right is +)', ayS: 'y component a_y (up is +)', move0: 'Move the starting point',
    s0readout: 'Start ({px}, {py}) → end ({qx}, {qy}): components = end − start = ({ax}, {ay}). Magnitude |a| = √({ax}² + {ay}²) = {m}, direction angle {dir}.',
    s0zero: 'Zero vector: start and end coincide, so the length is 0 and there is no direction.',
    s0hint: 'What to try: drag the two components and watch the orange arrow and its cyan and green legs change together. Then press “Move the starting point”: the arrow moves as a whole, but the components, magnitude and direction angle in the readout stay exactly the same; the grey dashed arrows are copies of it at other starts. A vector records how you move, not where you started: arrows with different starts and equal components are the same vector.',
    dirFmt: '{d}°',

    s1k: 'Step 1 · Adding',
    s1t: 'Walk a, then b. What is the overall displacement, and how does it compare with the two lengths added up?',
    s1e: 'This step asks: two moves happen one after the other; which single move do they amount to? Put b’s start on a’s end (<strong>head to tail</strong>); the arrow from a’s start to b’s end is the <strong>sum</strong> a + b. In components, add the x parts and add the y parts: a + b = (aₓ + bₓ, a_y + b_y), because the squares moved right and the squares moved up pile up separately. The a here is the vector you set in step 0 (components and magnitude mean the same as there: squares right and up, arrow length).',
    c1a: 'Head to tail: a, then b',
    lgA: 'vector a', lgB: 'vector b', lgSum: 'sum a + b', lgOther: 'the other route: b, then a',
    bxS: 'b’s x component bₓ', byS: 'b’s y component b_y', other1: 'Also draw “b first, then a”',
    s1readout: 'a + b = ({ax} + {bx}, {ay} + {by}) = ({sx}, {sy}). |a + b| = {ms}, while |a| + |b| = {ma} + {mb} = {mab}: {rel}',
    relLess: 'the combined move is shorter than the two lengths added (the path bends).', relEq: 'they are equal: a and b point the same way, so the path does not bend.',
    s1hint: 'What to try: drag b’s components and watch the tip of the cyan sum always land on “a’s components + b’s components”. Then press “Also draw b first, then a”: the two routes enclose a parallelogram and end at the same point, so a + b = b + a. Finally set b in the same direction as a (for example b = (3, 2)); only then does |a + b| equal |a| + |b|. Otherwise it is always shorter: the triangle inequality.',

    s2k: 'Step 2 · Scaling and subtracting',
    s2t: 'What does multiplying a by a number k do? And where does a − b point from and to?',
    s2e: 'This step answers two questions. First, <strong>scalar multiplication</strong> k·a multiplies every component of a by k: for k > 0 the direction stays and the length becomes k times; for k < 0 the direction flips; k = 0 gives the <strong>zero vector</strong> (length 0, no direction). Second, <strong>subtraction</strong> a − b means a + (−b), where −b is b turned around (−1 times b). Draw a and b from the same point and a − b is the arrow from b’s tip to a’s tip: add it to b and you are back at a. a and b carry over from step 1 (components: squares right and up).',
    c2a: 'Scaling: k·a', c2b: 'Subtracting: a − b = a + (−b)',
    lgA2: 'the original a', lgKA: 'k·a', lgDiff: 'a − b', lgNegB: '−b (attached at a’s tip)',
    kS: 'multiplier k',
    s2readout: 'k·a = {k}·({ax}, {ay}) = ({kx}, {ky}), |k·a| = |{k}|·{ma} = {mk}{dirNote}  |  a − b = ({ax} − {bx}, {ay} − {by}) = ({dx}, {dy}), |a − b| = {md}',
    dirSame: ', same direction as a', dirOpp: ', opposite to a', dirZero: ', the zero vector',
    s2hint: 'What to try: on the left, drag only k. As k falls from 2 to 0 the orange arrow shrinks along the line of a; past 0 it turns round, but it never leaves that line. The right plot needs no input: the pink a − b runs from b’s tip to a’s tip, and the dashed −b attached at a’s tip lands on the same point, which is a − b = a + (−b). To change a or b, go back to steps 0 and 1.',

    s3k: 'Step 3 · Two directions',
    s3t: 'Given only two directions e₁ and e₂, can you build every vector c in the plane?',
    s3e: 'This step asks: for any target vector c, can you find two numbers s and t with <strong>c = s·e₁ + t·e₂</strong>? Here e₁ = (2, 0) and e₂ = (1, 2) point in different directions. s·e₁ + t·e₂ is a <strong>linear combination</strong> of e₁ and e₂: go s times along e₁ (scaling, as in step 2), then t times along e₂ (head to tail, as in step 1). The slanted grey grid marks the points reachable with whole-number s and t. The <strong>basis theorem</strong> for plane vectors says: as long as e₁ and e₂ are not collinear (not on one line), every c has exactly one pair s, t; such a pair e₁, e₂ is called a <strong>basis</strong>. In components that is two equations, 2s + t = cₓ and 2t = c_y, so s = (2cₓ − c_y)/4 and t = c_y/2.',
    c3a: 'Reaching the target c with s·e₁ + t·e₂',
    lgE1: 's times along e₁', lgE2: 'then t times along e₂', lgC3: 'target c', lgMix: 'where s·e₁ + t·e₂ lands', lgLat: 'points with whole-number s, t',
    cxS: 'target c, x component', cyS: 'target c, y component', sS: 's (multiple of e₁)', tS: 't (multiple of e₂)',
    solve3: 'Solve for s and t', par3: 'Swap e₂ for (3, 0), parallel to e₁',
    s3readout: '{e2}: s·e₁ + t·e₂ = {s}·(2, 0) + {t}·{e2v} = ({mx}, {my}); target c = ({cx}, {cy}), still {gap} away. {verdict}',
    e2Name: 'e₂ = (1, 2)', e2ParName: 'e₂ = (3, 0), parallel to e₁',
    hit3: 'Reached: c = {s}·e₁ + {t}·e₂.',
    sol3: 'The only solution is s = {s}, t = {t}.', noSol3: 'e₁ and e₂ are collinear, so s·e₁ + t·e₂ can only land on the x-axis. c is off that line, so no choice reaches it.', manySol3: 'e₁ and e₂ are collinear but c happens to lie on the x-axis: it is reachable, in infinitely many ways (for example s = {s}, t = 0).',
    s3hint: 'What to try: first drag only s and t and watch the end of the cyan path (green leg, then violet leg) hop around the slanted grid; when “still … away” reaches 0 you have hit c. Then change the target and press “Solve for s and t”: the path walks to c by itself. Finally press the parallel-e₂ button: the grid collapses onto the x-axis, and any c off that axis stays out of reach.',
    quizPrompt: 'Think: after e₂ is swapped for (3, 0), parallel to e₁, why can most c no longer be built?',
    quizA: 's and t do not range far enough', quizB: 'whatever s and t are, s·e₁ + t·e₂ stays on one line', quizC: 'you would need finer decimals',
    check: 'Check', correct: 'Right. Two parallel directions only span a line, and any c off that line is out of reach; that is why a basis needs two non-collinear directions.',
    wrong: 'Look again: with the parallel button on, drag s and t to their extremes. Does the cyan end ever leave the x-axis?',

    s4k: 'Step 4 · Dot product',
    s4t: 'Can a single number say how much two arrows agree in direction?',
    s4e: 'This step asks: given vectors a and b, how do you measure with one number how closely their directions agree? The <strong>dot product</strong> has two equivalent recipes. By components, <strong>a·b = aₓbₓ + a_yb_y</strong>; by geometry, <strong>a·b = |a||b|cos θ</strong>, where θ is the <strong>angle between</strong> the arrows (0° to 180°) and |a|, |b| are the magnitudes (arrow lengths). |b|cos θ is the <strong>projection</strong> of b onto the line of a: the signed length of the “shadow” you get by dropping a perpendicular from b’s tip to that line, so a·b = |a| × projection. Here |a| = 4 is fixed; the direction angles of a and b (measured anticlockwise from the positive x-axis) and |b| are adjustable (for what cos means, see <a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ Trigonometry, step 1: a point’s coordinates</a>). The right plot puts θ across and a·b up the side; the curve is |a||b|cos θ and the white dots are the angles you have tried.',
    c4a: 'a, b and b’s projection onto a', c4b: 'a·b against the angle θ',
    lgProj: 'projection of b along a', lgDots: 'angles tried (a·b from components)',
    alS: 'direction angle of a', beS: 'direction angle of b', blS: 'magnitude |b|', sweep4: 'Spin b once round',
    s4readout: '{prog}a = ({ax}, {ay}), b = ({bx}, {by}). By components: {ax}×{bx} + {ay}×{by} = {d1}; by geometry: 4 × {mb} × cos {th}° = {d2}. Projection = {pr}. {sign}',
    signPos: 'Angle under 90°: positive, part of b runs along a.', signZero: 'Angle of 90°: zero, the two are perpendicular.', signNeg: 'Angle over 90°: negative, part of b runs against a.',
    s4progress: 'turned {c}/{N} · ',
    s4hint: 'What to try: drag only b’s direction angle (or press “Spin b once round”) with |b| unchanged. The green projection shortens as the angle opens, shrinks to a point at 90° and then reappears pointing against a; on the right the white dots trace the cosine curve, and the two recipes in the readout always agree. Then drag |b|: the curve scales up or down, so the dot product is proportional to |b|. One use: if b is a pulling force (newtons) and a a displacement (metres), a·b is the work the force does (joules); only the part of the force along the motion does work.',

    s5k: 'Step 5 · Flying through a crosswind',
    s5t: 'A westerly wind pushes the plane east. How far off north must the nose point to arrive exactly at a city 300 km due north?',
    s5e: 'This step asks: the plane’s velocity relative to the air (its <strong>airspeed</strong>, 200 km/h in the direction of the nose) and the wind’s velocity (eastward, adjustable) act together; how does the plane move over the ground? Velocities are vectors, so <strong>ground velocity = air velocity + wind velocity</strong> (head to tail, as in step 1). The left plot shows these three velocity vectors (km/h); the right plot is the map (km), with the dashed line as the intended course due north. The <strong>heading</strong> is the angle of the nose away from north, positive east and negative west. For the ground velocity to point due north its east–west component must be 0: 200·sin φ + wind speed = 0, so sin φ = −wind/200.',
    c5a: 'Velocity triangle (km/h)', c5b: 'Map: start, target and actual track (km)',
    lgAir: 'air velocity (nose direction, 200 km/h)', lgWind: 'wind (toward the east)', lgGround: 'ground velocity = air + wind', lgCourse: 'intended course due north',
    wS: 'wind speed (eastward, km/h)', phS: 'heading φ (east is +, degrees)', aim5: 'Work out the right heading',
    s5readout: 'Ground velocity = ({gx}, {gy}) km/h, speed {gs} km/h, actually {tr}° {side} of north. Reaching the latitude 300 km north takes {h} h, by which time the plane is {dr} km {side2}. {verdict}',
    east: 'east', west: 'west',
    aimOk: 'Lands within 0.5 km of the city: nose {ph}° to the west, ground speed down to {gs} km/h, slower than the 200 km/h of still air.', aimNeed: 'To arrive exactly, the heading should be {ph}° (sin φ = −{w}/200).',
    s5hint: 'What to try: keep the heading at 0° and drag the wind from 0 to 80. On the left the violet wind arrow grows and the cyan ground velocity leans east; on the right the track drifts east by wind × 1.5 h (120 km at 80 km/h). Then press “Work out the right heading”: the nose turns west and the cyan ground velocity swings back to due north, but it is shorter, so the flight takes longer. You can also drag the heading yourself and watch when the drift reading nears 0. The model assumes wind and airspeed stay constant and ignores take-off, landing and the Earth’s curvature.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'In one line: a vector is a pair of components; adding and scaling work component by component, and the dot product squeezes two directions into one number',
    s6fin: 'Recap: a vector records how you move; components = end − start, and Pythagoras gives the magnitude (step 0). Adding head to tail is adding components, and |a + b| ≤ |a| + |b| (step 1). Scaling stretches or flips; a − b runs from b’s tip to a’s tip (step 2). Two non-collinear directions can build any vector in the plane (step 3). The dot product aₓbₓ + a_yb_y = |a||b|cos θ says in one number how much two directions agree (step 4). Adding velocities tells you how to steer through a crosswind (step 5).',
    formula: 'a ± b = (aₓ ± bₓ, a_y ± b_y)　k·a = (k·aₓ, k·a_y)\n|a| = √(aₓ² + a_y²)\na·b = aₓbₓ + a_yb_y = |a||b|cos θ',
    boundary: 'Where this holds: everything here is in the plane (2D); in 3D there is one more component, z, and every rule carries over term by term. Angles and direction angles are defined only for non-zero vectors. Step 5 assumes constant wind and airspeed on a flat map; real navigation also deals with wind that changes with height and time.',
    linksTitle: 'Where to go next',
    lk1: 'Linear transformations · step 1: keeping the basis ledger (step 3’s basis, put to another use) →',
    lk2: 'Newton’s laws · step 2: friction and net force (adding forces) →',
    lk3: 'Projectiles & circles · step 2: the two parts of a velocity (splitting velocity into components) →',
    lk4: 'Complex numbers · step 2: addition is a shift (adding complex numbers is adding vectors) →',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Vectors · Quantities With a Direction”.'
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
