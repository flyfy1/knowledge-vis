'use strict';
// Complex numbers strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '复数 · 半个掉头是什么数',
    back: '← 知识索引',
    compare: '对照另一版本：复数 · 平面上的旋转 →',
    navLabel: '复数步骤导航',
    tagline: '乘 −1，数轴上的箭头掉个头。那么，什么运算做两次正好等于掉头？在数轴上找不到：任何实数乘两次，结果都不是负数。答案是「转 90°」，这就得离开数轴、走进平面。七步里你会看到：复数是平面上的点，加法是平移，乘法是旋转加伸缩，而 i² = −1 只是「转两次 90°」。',
    nav0: '0 半个掉头', nav1: '1 平面上的点', nav2: '2 加法', nav3: '3 乘 i', nav4: '4 乘法', nav5: '5 连乘', nav6: '6 自测 · 收束',

    s0k: '第 0 步 · 数轴不够用',
    s0t: '什么运算做两次，等于乘 −1？',
    s0e: '这一步要回答：乘 −1 把数轴上指向 1 的箭头掉头指向 −1。能不能把这个掉头拆成两个一样的半步？先在数轴上试：乘一个实数 k 两次就是乘 k²，而 k² 永远 ≥ 0，所以没有哪个实数乘两次能得到 −1。换个看法：掉头就是把箭头<strong>转 180°</strong>。转 φ 再转 φ 等于转 2φ，所以「半个掉头」就是转 90°。下图横轴是原来的数轴，白色箭头指向 1；滑杆让它绕原点逆时针转 φ（青色），再转一次 φ（橙色）。看第一次转完时箭头落在哪里：它离开了数轴。',
    phiSlider: '每次转的角度 φ',
    s0lgStart: '起点：指向 1 的箭头', s0lgOne: '转一次 φ', s0lgTwo: '再转一次 φ（共 2φ）', s0lgTarget: '目标 −1',
    axisRe: '数轴',
    s0readout: '转 φ = {phi}°：第一次落在 ({x1}, {y1})，第二次（共转 {phi2}°）落在 ({x2}, {y2})。{note}',
    s0hit: '正好落在 −1：转 {phi}° 两次就是乘 −1。而第一次的落点 ({x1}, {y1}) 不在数轴上，它是一个新的数。',
    s0miss: '离 −1 还差 {d}。',
    s0hint: '观察顺序：把 φ 从 0 慢慢拖大，盯住橙色箭头，找它落到 −1（粉色圈）的角度；再看那时青色箭头停在哪里：正上方，数轴之外。φ = 270° 是另一个答案（往下转）。',

    s1k: '第 1 步 · 平面上的点',
    s1t: '一个复数要用几个数才能确定？',
    s1e: '这一步要回答：上一步「转 90°」落在数轴正上方一个单位处。把那个点叫作 <strong>i</strong>，在数轴上竖起第二根轴，数就从「线上的点」变成「平面上的点」。平面上每个点写成 <strong>z = a + bi</strong>（a、b 是实数），叫<strong>复数</strong>：a 是<strong>实部</strong>（横坐标），b 是<strong>虚部</strong>（纵坐标；虚部是 b 这个实数本身，不带 i）。横轴叫实轴，纵轴叫虚轴，整个平面叫<strong>复平面</strong>。同一个点也可以用箭头来读：箭头长度叫<strong>模</strong> |z|，由勾股定理得 √(a² + b²)（<a class="xlink" href="../../../math/geometry/pythagoras/#step5">→ 勾股定理第 5 步：两点之间的距离</a>）；从实轴正方向逆时针转到箭头的角叫<strong>辐角</strong> arg z，本页取 −180° 到 180°（含 180°）之间的那个值。原点的箭头长度为 0，没有方向，所以没有辐角。',
    reSlider: '实部 a', imSlider: '虚部 b', presetLabel: '试试：', prUnit: '单位圆上 40°', prO: '原点',
    s1lgArrow: '箭头 z（长度是模）', s1lgParts: '实部 a、虚部 b', s1lgArg: '辐角（从实轴正方向量起）',
    s1readout: 'z = {z}：实部 {a}，虚部 {b}；模 |z| = {expr} = {m}；辐角 {arg}。',
    argNone: '无（原点没有方向）',
    s1hint: '观察顺序：先按 3 + 4i，读出模正好是 5（3、4、5 的直角三角形）；按 −2，辐角是 180°；按 2i，辐角是 90°；按「单位圆上 40°」，模是 1，只剩方向在变。最后按「原点」，看辐角为什么空着。也可以直接在图上拖点。',

    s2k: '第 2 步 · 加法',
    s2t: '两个复数相加，图上发生了什么？',
    s2e: '这一步要回答：z = a + bi 和 w = c + di 相加，在复平面（横轴实部、纵轴虚部）上是什么动作？代数上只能实部和实部相加、虚部和虚部相加：<strong>z + w = (a + c) + (b + d)i</strong>。图上，就是把 z 沿着 w 的箭头<strong>平移</strong>：两根箭头首尾相接，或者画成平行四边形，对角线就是和。这和向量相加是同一件事（<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">→ 向量第 1 步：向量加法</a>）。灰色的 F 形图案和橙色虚线描出的那个，说明加 w 让平面上的每一个点都移动同一根箭头。',
    zRe: 'z 的实部', zIm: 'z 的虚部', wRe: 'w 的实部', wIm: 'w 的虚部',
    s2lgZ: 'z', s2lgW: 'w（也画在 z 的箭头末端）', s2lgSum: 'z + w', s2lgShape: '一个图形，和它每点都加上 w 之后',
    s2readout: 'z + w = ({za} + {wa}) + ({zb} + {wb})i = {s}。横坐标只和横坐标相加，纵坐标只和纵坐标相加；平行四边形的对角线落在 {s}。',
    s2hint: '观察顺序：只拖 w 的两个滑杆，看绿色的和与橙色虚线图案一起移动，移动的方向和距离正是 w 的箭头；把 w 设成 0（两个滑杆都拖到 0），和就是 z 本身。也可以在图上拖动离手指最近的 z 或 w。',

    s3k: '第 3 步 · 乘 i',
    s3t: '乘一次 i，点会去哪里？',
    s3e: '这一步要回答：任意一点 z = a + bi 乘上 i，会落在哪里？只用 i² = −1 展开：i·(a + bi) = ai + b·i² = <strong>−b + ai</strong>，也就是坐标 (a, b) 变成 (−b, a)。新点到原点的距离是 √(b² + a²)，和原来一样；两根箭头的点积 a·(−b) + b·a = 0，说明它们垂直。所以<strong>乘 i 就是绕原点逆时针转 90°</strong>，长度不变。第 0 步里「转 90°」的落点就是 i 本身（1 乘 i）。按「× i」一次次地乘：青色是点 z 的落点（编号是乘过几次），橙色是 F 形图案的每个点一起乘 i 的结果，灰色是之前的落点。',
    timesI: '× i', reset: '重新开始', prog3: '已乘 {k} 次',
    s3lgZ: 'z 和它的落点（编号 = 乘了几次）', s3lgF: '图案的每个点都乘 i', s3lgHist: '之前的位置',
    s3readout: '乘了 {k} 次 i：i{ks} = {ik}，所以落点是 {zk}；模 {m}（与开始时相同），辐角 {arg}。{last}',
    s3last: '最后一次：i × ({prev}) = {cur}，坐标 ({pa}, {pb}) → ({ca}, {cb})。',
    s3start: '还没乘。按「× i」。',
    s3hint: '观察顺序：按 4 次「× i」，看点和图案每次转四分之一圈，第 4 次回到起点；第 2 次时点正好在起点的对面，也就是乘了 −1（i² = −1 就是这么来的）。再改 z 的滑杆，换个起点重来。',

    s4k: '第 4 步 · 一般的乘法',
    s4t: '乘上任意一个复数 w，模和辐角各发生什么？',
    s4e: '这一步要回答：上一步乘 i 只转不伸；乘一个正实数（比如 2）只伸不转。一般的 w 呢？把 w 用模 r 和辐角 φ 写成 <strong>w = r(cos φ + i sin φ)</strong>（cos、sin 就是单位圆上那一点的横、纵坐标，<a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ 三角函数第 1 步：单位圆上点的坐标</a>）。结论是：<strong>乘 w，就是把每个点绕原点转 φ，再把到原点的距离乘 r</strong>。于是 |z·w| = |z|·|w|（模相乘），arg(z·w) = arg z + arg w（辐角相加，再化到 −180° 到 180°）。下面同时走两条路：代数展开 (a + bi)(c + di) = (ac − bd) + (ad + bc)i，和「模相乘、角相加」，看它们是否落在同一点。',
    rSlider: 'w 的模 r', fSlider: 'w 的辐角 φ', presetW: '常用的 w：',
    s4lgW: 'w', s4lgZ: 'z', s4lgZW: 'z·w', s4lgShape: '图案（灰）和它乘 w 之后（橙）',
    s4readout: 'w = {w}（模 {r}，辐角 {f}）；z = {z}（模 {mz}，辐角 {az}）。代数展开：z·w = {zw}。几何：模 {mz} × {r} = {mzw}，辐角 {az} + {f} = {sa}{wrap}。两条路相差 {gap}。',
    wrapNote: '，化到主值是 {v}',
    s4zero: 'w = {w}，z = {z}：其中有一个是 0，乘积是 0，落在原点；原点没有辐角，「角相加」这条不适用，只剩「模相乘」：{mz} × {r} = 0。',
    s4hint: '观察顺序：先按 w = 2，图案只放大、不转；按 w = i，只转 90°、不放大；按 w = 1 + i，既转 45° 又放大 √2 ≈ 1.414 倍。然后自己拖 r 和 φ：橙色图案随 φ 转、随 r 伸缩，形状始终不变。在图上拖动可以直接移动 w。',

    s5k: '第 5 步 · 一直乘下去',
    s5t: '从 1 出发，一次次乘同一个 w，点会走出什么路线？',
    s5e: '这一步要回答：从 1 出发，乘 w，再乘 w……第 n 次落在 <strong>wⁿ</strong>。按上一步，每乘一次就转 φ、长度乘 r，所以 wⁿ 的模是 rⁿ、辐角是 nφ。r = 1 时点一直在单位圆（半径 1 的圆，灰色虚线）上转；r < 1 时一圈圈往里收，r > 1 时往外放。如果 r = 1 且 nφ 正好是 360° 的整数倍，乘 n 次又回到 1，这时 w 叫 <strong>1 的 n 次方根</strong>，比如 i⁴ = 1。',
    nSlider: '乘的次数 n', play5: '一步步乘下去',
    pre5a: 'i，乘 4 次', pre5b: '转 72°，乘 5 次', pre5c: '往里收的螺旋', pre5d: '往外放的螺旋',
    s5lgW: 'w', s5lgPath: '1, w, w², …, wⁿ（依次连线）', s5lgUnit: '单位圆 |z| = 1',
    s5readout: '{prog}w = {w}。w{ns} = {wn}：模 {r}{ns} = {rn}，辐角 {n} × {f} = {nf}{wrap}。{note}',
    s5back: '回到了 1：w 是 1 的 {n} 次方根。',
    s5off: '（有的点跑出了画面。）',
    multiplying: '（连乘中 {k}/{N}）',
    s5hint: '观察顺序：按「i，乘 4 次」，四个点正好是 1、i、−1、−i，回到起点；按「转 72°，乘 5 次」，五个点排成正五边形。再试两个螺旋：只把 r 从 1 往下或往上拖一点，路线就从圆变成螺旋。按「一步步乘下去」可以看每一步的转动。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '三个问题，先想图，再算数',
    s6e: '这一步要回答：前面的结论你能不能用上？每题都可以回到前面某一步的图上核对；答完按「检查答案」，每题会说明理由。',
    q1: '① z = 3 + 2i，连续乘两次 i，落在哪里？',
    q1a: '−3 + 2i', q1b: '−3 − 2i', q1c: '3 − 2i',
    q2: '② |3 + 4i| 和 |−4 + 3i|，哪个大？',
    q2a: '|3 + 4i| 大', q2b: '一样大', q2c: '|−4 + 3i| 大',
    q3: '③ (1 + i)² 等于多少？',
    q3a: '2', q3b: '2i', q3c: '1 + i',
    check: '检查答案',
    q1ok: '对：乘一次 i 得 −2 + 3i，再乘一次得 {v}。乘两次 i 就是转 180°，等于乘 −1，两个分量一起变号。',
    q1no: '再想想：{pick} 只改了一个分量的符号，那是沿坐标轴翻折，不是旋转。转两次 90° 等于转 180°，两个分量一起变号：{v}。',
    q2ok: '对：两个模都是 √(9 + 16) = {v}。模只量长度、不管方向；其实 −4 + 3i = i·(3 + 4i)，就是把 3 + 4i 转了 90°。',
    q2no: '再想想：{pick} 不对。模是 √(a² + b²)，两个都是 √(9 + 16) = {v}，负号在平方后就没了。',
    q3ok: '对：1 + i 的模是 √2、辐角 45°；平方后模 √2 × √2 = 2，辐角 45° + 45° = 90°，正是 {v}。代数验算：(1 + i)² = 1 + 2i + i² = 2i。',
    q3no: '再想想：{pick} 不对。按「模相乘、角相加」：模 √2 × √2 = 2，辐角 45° + 45° = 90°，落在虚轴上，是 {v}。代数：(1 + i)² = 1 + 2i + i² = 2i。',
    q0: '这一题还没选。',
    s6fin: '一条线索串起全页。<strong>第 0 步</strong>：实数乘两次不会得负数，但转 90° 两次就是掉头，于是需要数轴之外的点。<strong>第 1 步</strong>：复数 a + bi 就是平面上的点 (a, b)，也可以读成箭头的模和辐角。<strong>第 2 步</strong>：加法是分量相加，图上是平移。<strong>第 3 步</strong>：乘 i 把 (a, b) 变成 (−b, a)，是逆时针转 90°，所以 i² = −1。<strong>第 4 步</strong>：乘 w 是转 arg w、伸缩 |w| 倍：模相乘、角相加。<strong>第 5 步</strong>：一直乘同一个 w，点沿圆或螺旋前进，回到 1 时 w 就是 1 的方根。',
    formula: 'i² = −1（转 90° 两次 = 掉头）\nz + w：分量相加 = 平移\n|z·w| = |z|·|w|，arg(z·w) = arg z + arg w',
    boundary: '适用范围：辐角取 −180° 到 180°（含 180°）之间的值，相加后要重新化到这个范围；原点没有辐角，「角相加」只对两个非零复数成立。本页没有讲除法（它是乘法的逆：模相除、角相减）和欧拉公式。画面只是复平面的一个窗口，超出的点会被截掉，读数仍按模型计算。',
    linksTitle: '接着去哪',
    lk1: '→ 勾股定理第 5 步：两点之间的距离，就是这里的模',
    lk2: '→ 向量第 1 步：向量加法，和复数加法是同一件事',
    lk3: '→ 三角函数第 1 步：单位圆上点的坐标 (cos θ, sin θ)',
    lk4: '→ 二维线性变换第 0 步：网格变形；乘 w 是其中只旋转和缩放、不改变形状的那一类',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《复数 · 平面上的旋转》的平行版本。'
  },
  en: {
    pageTitle: 'Complex Numbers · What Is Half a U-turn?',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Complex Numbers · Rotation on the Plane →',
    navLabel: 'Complex number steps',
    tagline: 'Multiplying by −1 turns the arrow on the number line around. So which operation, done twice, gives exactly that U-turn? None on the number line: multiply by any real number twice and the result is never negative. The answer is “turn by 90°”, and that means leaving the line for the plane. Over seven steps you will see that complex numbers are points of the plane, addition is a shift, multiplication is a turn plus a stretch — and i² = −1 just says “two quarter turns”.',
    nav0: '0 Half a U-turn', nav1: '1 Points of the plane', nav2: '2 Addition', nav3: '3 Times i', nav4: '4 Multiplication', nav5: '5 Keep multiplying', nav6: '6 Check · Wrap-up',

    s0k: 'Step 0 · The number line runs out',
    s0t: 'Which operation, done twice, multiplies by −1?',
    s0e: 'This step asks: multiplying by −1 swings the arrow pointing at 1 round to point at −1. Can that U-turn be split into two identical halves? Try the number line first: multiplying by a real number k twice multiplies by k², and k² is never negative, so no real number does it. Look at it another way: a U-turn is a <strong>turn through 180°</strong>. Turning by φ and then by φ again is a turn of 2φ, so “half a U-turn” is a 90° turn. The horizontal axis below is the old number line, and the white arrow points at 1; the slider turns it anticlockwise about 0 by φ (cyan) and then by φ again (orange). Watch where the arrow sits after the first turn: off the number line.',
    phiSlider: 'Angle φ of each turn',
    s0lgStart: 'Start: the arrow to 1', s0lgOne: 'After one turn φ', s0lgTwo: 'After a second turn (2φ in all)', s0lgTarget: 'Target −1',
    axisRe: 'number line',
    s0readout: 'Turn φ = {phi}°: after one turn the tip is at ({x1}, {y1}); after the second ({phi2}° in all) it is at ({x2}, {y2}). {note}',
    s0hit: 'Exactly on −1: two turns of {phi}° multiply by −1. And the first landing point ({x1}, {y1}) is not on the number line — it is a new number.',
    s0miss: 'Still {d} away from −1.',
    s0hint: 'What to watch: drag φ up slowly from 0, keep your eye on the orange arrow and find the angle where it lands on −1 (the pink ring). Then see where the cyan arrow stopped: straight up, off the number line. φ = 270° is the other answer (turning downwards).',

    s1k: 'Step 1 · Points of the plane',
    s1t: 'How many numbers does it take to pin down a complex number?',
    s1e: 'This step asks: the quarter turn of the last step landed one unit straight above the number line. Call that point <strong>i</strong>, stand a second axis up through 0, and numbers stop being points on a line and become points of a plane. Every point is written <strong>z = a + bi</strong> with a and b real, and is called a <strong>complex number</strong>: a is the <strong>real part</strong> (across) and b the <strong>imaginary part</strong> (up; the imaginary part is the real number b itself, without the i). The horizontal axis is the real axis, the vertical one the imaginary axis, and the whole plane the <strong>complex plane</strong>. The same point can be read as an arrow: its length is the <strong>modulus</strong> |z| = √(a² + b²) by Pythagoras (<a class="xlink" href="../../../math/geometry/pythagoras/#step5">→ Pythagoras, step 5: the distance between two points</a>), and the angle turned anticlockwise from the positive real axis to the arrow is the <strong>argument</strong> arg z, taken here between −180° and 180° (180° included). At the origin the arrow has length 0 and no direction, so there is no argument.',
    reSlider: 'Real part a', imSlider: 'Imaginary part b', presetLabel: 'Try:', prUnit: 'Unit circle at 40°', prO: 'Origin',
    s1lgArrow: 'Arrow z (its length is the modulus)', s1lgParts: 'Real part a, imaginary part b', s1lgArg: 'Argument (from the positive real axis)',
    s1readout: 'z = {z}: real part {a}, imaginary part {b}; modulus |z| = {expr} = {m}; argument {arg}.',
    argNone: 'none (the origin has no direction)',
    s1hint: 'What to watch: press 3 + 4i and the modulus comes out at exactly 5 (the 3-4-5 right triangle); press −2 and the argument is 180°; press 2i and it is 90°; press “Unit circle at 40°” and the modulus is 1, so only the direction changes. Finally press “Origin” and see why the argument is blank. You can also drag the point in the figure.',

    s2k: 'Step 2 · Addition',
    s2t: 'When two complex numbers are added, what happens in the picture?',
    s2e: 'This step asks: adding z = a + bi and w = c + di — what does that do on the complex plane (real part across, imaginary part up)? Algebra only lets real parts add to real parts and imaginary to imaginary: <strong>z + w = (a + c) + (b + d)i</strong>. In the picture that is a <strong>shift</strong> of z along w’s arrow: put the arrows head to tail, or draw the parallelogram, and the diagonal is the sum. It is exactly vector addition (<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">→ Vectors, step 1: adding vectors</a>). The grey F and its orange dashed copy show that adding w moves every point of the plane by the same arrow.',
    zRe: 'Real part of z', zIm: 'Imaginary part of z', wRe: 'Real part of w', wIm: 'Imaginary part of w',
    s2lgZ: 'z', s2lgW: 'w (also drawn from the tip of z)', s2lgSum: 'z + w', s2lgShape: 'A shape, and the same shape with w added to every point',
    s2readout: 'z + w = ({za} + {wa}) + ({zb} + {wb})i = {s}. Across-coordinates add only to across-coordinates, up only to up; the parallelogram’s diagonal ends at {s}.',
    s2hint: 'What to watch: drag only w’s two sliders and the green sum moves together with the orange dashed shape, by exactly w’s arrow; set w to 0 (both sliders at 0) and the sum is z itself. In the figure you can drag whichever of z and w is nearer your finger.',

    s3k: 'Step 3 · Times i',
    s3t: 'Multiply by i once — where does a point go?',
    s3e: 'This step asks: take any point z = a + bi and multiply by i; where does it land? Expand using only i² = −1: i·(a + bi) = ai + b·i² = <strong>−b + ai</strong>, so the coordinates (a, b) become (−b, a). The new point is √(b² + a²) from the origin, the same distance as before, and the dot product of the two arrows, a·(−b) + b·a = 0, says they are perpendicular. So <strong>multiplying by i is a 90° anticlockwise turn about the origin</strong>, with no change of length. The quarter turn of step 0 landed on i itself (1 times i). Press “× i” again and again: cyan marks where z lands (numbered by how many times you have multiplied), orange is every point of the F multiplied by i at once, and grey shows earlier positions.',
    timesI: '× i', reset: 'Start again', prog3: 'Multiplied {k} times',
    s3lgZ: 'z and where it lands (number = times multiplied)', s3lgF: 'Every point of the shape times i', s3lgHist: 'Earlier positions',
    s3readout: 'Multiplied by i {k} times: i{ks} = {ik}, so the point is now {zk}; modulus {m} (as at the start), argument {arg}. {last}',
    s3last: 'Last press: i × ({prev}) = {cur}, coordinates ({pa}, {pb}) → ({ca}, {cb}).',
    s3start: 'Nothing multiplied yet. Press “× i”.',
    s3hint: 'What to watch: press “× i” four times — the point and the shape turn a quarter turn each time and are back where they started on the fourth press. On the second press the point is directly opposite its start, i.e. multiplied by −1: that is where i² = −1 comes from. Then change z’s sliders and start from somewhere else.',

    s4k: 'Step 4 · Multiplication in general',
    s4t: 'Multiply by any complex number w — what happens to modulus and argument?',
    s4e: 'This step asks: multiplying by i turned without stretching; multiplying by a positive real number such as 2 stretches without turning. What about a general w? Write w through its modulus r and argument φ as <strong>w = r(cos φ + i sin φ)</strong> (cos and sin are the across and up coordinates of a point on the unit circle, <a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ Trigonometry, step 1: coordinates of a point on the unit circle</a>). The claim: <strong>multiplying by w turns every point about the origin by φ and multiplies its distance from the origin by r</strong>. So |z·w| = |z|·|w| (moduli multiply) and arg(z·w) = arg z + arg w (arguments add, then brought back between −180° and 180°). Below, both roads run side by side — the algebraic expansion (a + bi)(c + di) = (ac − bd) + (ad + bc)i, and “multiply the moduli, add the angles” — to see whether they land on the same point.',
    rSlider: 'Modulus r of w', fSlider: 'Argument φ of w', presetW: 'Handy w:',
    s4lgW: 'w', s4lgZ: 'z', s4lgZW: 'z·w', s4lgShape: 'Shape (grey) and the shape times w (orange)',
    s4readout: 'w = {w} (modulus {r}, argument {f}); z = {z} (modulus {mz}, argument {az}). Expanding: z·w = {zw}. Geometrically: modulus {mz} × {r} = {mzw}, argument {az} + {f} = {sa}{wrap}. The two roads differ by {gap}.',
    wrapNote: ', which is {v} as a principal value',
    s4zero: 'w = {w}, z = {z}: one of them is 0, so the product is 0, at the origin. The origin has no argument, so “angles add” does not apply; only “moduli multiply” survives: {mz} × {r} = 0.',
    s4hint: 'What to watch: press w = 2 and the shape only grows, without turning; press w = i and it only turns 90°, without growing; press w = 1 + i and it turns 45° and grows by √2 ≈ 1.414. Then drag r and φ yourself: the orange shape turns with φ and stretches with r, and its shape never changes. Dragging in the figure moves w directly.',

    s5k: 'Step 5 · Keep multiplying',
    s5t: 'Start at 1 and keep multiplying by the same w — what path does the point trace?',
    s5e: 'This step asks: start from 1, multiply by w, then by w again… after n multiplications you are at <strong>wⁿ</strong>. By the last step each multiplication turns by φ and scales the length by r, so wⁿ has modulus rⁿ and argument nφ. With r = 1 the point keeps going round the unit circle (radius 1, the grey dashed circle); with r < 1 it spirals in, with r > 1 it spirals out. If r = 1 and nφ is a whole number of full turns (a multiple of 360°), n multiplications bring you back to 1, and w is called an <strong>n-th root of 1</strong> — for example i⁴ = 1.',
    nSlider: 'Number of multiplications n', play5: 'Multiply step by step',
    pre5a: 'i, 4 times', pre5b: 'Turn 72°, 5 times', pre5c: 'Spiral in', pre5d: 'Spiral out',
    s5lgW: 'w', s5lgPath: '1, w, w², …, wⁿ (joined in order)', s5lgUnit: 'Unit circle |z| = 1',
    s5readout: '{prog}w = {w}. w{ns} = {wn}: modulus {r}{ns} = {rn}, argument {n} × {f} = {nf}{wrap}. {note}',
    s5back: 'Back at 1: w is an {n}-th root of 1.',
    s5off: '(Some points have left the picture.)',
    multiplying: '(multiplying {k}/{N}) ',
    s5hint: 'What to watch: press “i, 4 times” — the four points are exactly 1, i, −1, −i, and the path closes. Press “Turn 72°, 5 times” and the five points make a regular pentagon. Then the spirals: nudge r just below or above 1 and the circle opens into a spiral. “Multiply step by step” shows each turn in turn.',

    s6k: 'Step 6 · Check and wrap-up',
    s6t: 'Three questions: picture it first, then compute',
    s6e: 'This step asks: can you use what you found? Each question can be checked on one of the earlier figures; press “Check answers” and each answer comes back with its reason.',
    q1: '① Start from z = 3 + 2i and multiply by i twice. Where do you land?',
    q1a: '−3 + 2i', q1b: '−3 − 2i', q1c: '3 − 2i',
    q2: '② Which is larger, |3 + 4i| or |−4 + 3i|?',
    q2a: '|3 + 4i|', q2b: 'They are equal', q2c: '|−4 + 3i|',
    q3: '③ What is (1 + i)²?',
    q3a: '2', q3b: '2i', q3c: '1 + i',
    check: 'Check answers',
    q1ok: 'Right: one factor of i gives −2 + 3i, a second gives {v}. Two factors of i are a 180° turn — multiplying by −1 — so both components change sign.',
    q1no: 'Not quite: {pick} changes the sign of only one component, which is a reflection in an axis, not a turn. Two quarter turns make a half turn, so both components change sign: {v}.',
    q2ok: 'Right: both moduli are √(9 + 16) = {v}. The modulus measures length and ignores direction; in fact −4 + 3i = i·(3 + 4i), which is 3 + 4i turned through 90°.',
    q2no: 'Not quite: {pick} is wrong. The modulus is √(a² + b²), and both are √(9 + 16) = {v}; the minus sign disappears when squared.',
    q3ok: 'Right: 1 + i has modulus √2 and argument 45°; squaring gives modulus √2 × √2 = 2 and argument 45° + 45° = 90°, which is {v}. Check by algebra: (1 + i)² = 1 + 2i + i² = 2i.',
    q3no: 'Not quite: {pick} is wrong. Multiply the moduli and add the angles: √2 × √2 = 2 and 45° + 45° = 90°, a point on the imaginary axis, {v}. By algebra: (1 + i)² = 1 + 2i + i² = 2i.',
    q0: 'No answer picked yet.',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: no real number squared is negative, but two quarter turns make a U-turn, so we need points off the number line. <strong>Step 1</strong>: the complex number a + bi is the point (a, b), which can also be read as an arrow’s modulus and argument. <strong>Step 2</strong>: addition adds components, which in the picture is a shift. <strong>Step 3</strong>: multiplying by i sends (a, b) to (−b, a), a 90° anticlockwise turn, hence i² = −1. <strong>Step 4</strong>: multiplying by w turns by arg w and stretches by |w| — moduli multiply, angles add. <strong>Step 5</strong>: multiplying by the same w again and again moves the point along a circle or a spiral, and when it returns to 1, w is a root of 1.',
    formula: 'i² = −1 (two 90° turns = a U-turn)\nz + w: add components = shift\n|z·w| = |z|·|w|, arg(z·w) = arg z + arg w',
    boundary: 'Scope: arguments are taken between −180° and 180° (180° included), and after adding they are brought back into that range; the origin has no argument, so “angles add” holds only for two non-zero numbers. This page does not cover division (the reverse of multiplication: divide the moduli, subtract the angles) or Euler’s formula. Each figure is only a window onto the complex plane; points outside it are cut off, while the readouts still come from the model.',
    linksTitle: 'Where to go next',
    lk1: '→ Pythagoras, step 5: the distance between two points is the modulus here',
    lk2: '→ Vectors, step 1: adding vectors is the same thing as adding complex numbers',
    lk3: '→ Trigonometry, step 1: the coordinates (cos θ, sin θ) of a point on the unit circle',
    lk4: '→ 2-D linear transforms, step 0: warping the grid; multiplying by w is the kind that only turns and scales, keeping shapes intact',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Complex Numbers · Rotation on the Plane”.'
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
