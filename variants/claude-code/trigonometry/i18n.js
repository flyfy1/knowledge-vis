'use strict';
// Trigonometry lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '三角函数 · 一个点绕圆走',
    back: '← 知识索引',
    compare: '对照另一版本：三角函数 · 单位圆 →',
    navLabel: '三角函数步骤导航',
    tagline: '一个点从 (1, 0) 出发，沿半径为 1 的圆逆时针走。走过的角度是输入；点的横坐标、纵坐标、连线的斜率是输出，分别叫 cos、sin、tan。七步里你会先用长度量角度，再定义这三个函数，把它们展开成波，看清 tan 在哪里断开、四个象限怎样互相借值，最后用「转动的箭头」把波拉伸、加速、平移、相加。',
    nav0: '0 弧度', nav1: '1 定义', nav2: '2 展开成波', nav3: '3 正切', nav4: '4 对称', nav5: '5 振幅与频率', nav6: '6 两波相加', nav7: '7 收束',

    s0k: '第 0 步 · 角度的单位',
    s0t: '能不能用一段长度来量一个角？',
    s0e: '这一步要回答：「度」把一圈人为地分成 360 份；有没有一种不靠约定的量法？以角的顶点为圆心画一个半径为 r 的圆，角在圆上截出一段弧，弧长记作 s。角越大，弧越长；圆越大，弧也越长。把弧长除以半径，s ÷ r 只跟角有关、跟圆的大小无关，这个比值就叫角的<strong>弧度</strong>：1 弧度就是「弧长恰好等于半径」的那个角。左图橙色弧每过一个半径换一次颜色；右图把同一段弧拉直，刻度以「几个半径长」为单位。',
    c0aria: '圆上的弧与拉直后的弧长', c0title: '弧（每段一个半径长）与拉直后的长度',
    c0line: '拉直的弧长，单位：半径',
    lgArc: '弧（每个颜色段长一个半径）', lgRadius: '两条半径', lgUnit: '半径为 1 的参考圆',
    thetaRad: '角 θ（弧度）', radius: '圆的半径 r', play0: '转满一圈',
    s0readout: 'θ = {th} 弧度 = {deg}°。半径 r = {r} 时弧长 s = r·θ = {s}，s ÷ r = {th}，正好是 θ；弧上放得下 {n} 个完整的半径。',
    s0hint: '观察顺序：先把 θ 拖到 1，弧恰好是一个半径长，读数显示 1 弧度约 57.3°。再只改「圆的半径」，弧长 s 跟着变，但 s ÷ r 和右图拉直后的长度都不变。最后按「转满一圈」：一圈放得下 6 个完整的半径，还剩约 0.283 个，所以一圈是 2π ≈ 6.283 弧度 = 360°。',

    s1k: '第 1 步 · 定义',
    s1t: '从 (1, 0) 出发转过角 θ，点落在哪里？',
    s1e: '这一步要回答：在半径为 1 的圆（<strong>单位圆</strong>）上，从 (1, 0) 出发逆时针转过角 θ（顺时针转记为负角），落点 P 的坐标是多少？我们把这两个坐标定义成两个函数：横坐标叫 <strong>cos θ</strong>（余弦），纵坐标叫 <strong>sin θ</strong>（正弦），即 P = (cos θ, sin θ)。青色线段是横坐标，橙色线段是纵坐标；它们和半径 OP 围成一个斜边为 1 的直角三角形，所以勾股定理直接给出 cos²θ + sin²θ = 1（<a class="xlink" href="../../../math/geometry/pythagoras/#step2">→ 勾股定理页第 2 步：拼图证明</a>）。在第二、三、四象限，线段指向负方向，对应的坐标就是负数：这个定义对任何角都成立，不再局限于锐角三角形。',
    c1aria: '单位圆上的点 P 及其坐标', c1title: '单位圆：P = (cos θ, sin θ)（可在图上拖动 P）',
    lgCos: '横坐标 cos θ', lgSin: '纵坐标 sin θ', lgP: '点 P',
    thetaDeg: '角 θ（度）',
    quad: '第 {q} 象限', onAxis: '在坐标轴上',
    s1readout: 'θ = {d}（{where}）：cos θ = {c}，sin θ = {s}；cos²θ + sin²θ = {sum}。',
    s1hint: '观察顺序：依次点 30°、45°、60°：读数给出精确值 1/2、√2/2、√3/2，并且 30° 的 sin 等于 60° 的 cos。点 90°：横坐标为 0。再点 135°、210°、300°，看哪个坐标变成负数。最后在图上拖动 P 绕一圈，cos²θ + sin²θ 始终是 1。',

    s2k: '第 2 步 · 展开成波',
    s2t: '点一直转下去，它的高度怎样随角度变化？',
    s2e: '这一步要回答：把 θ 当横轴、把 P 的高度 sin θ 当纵轴，画出来是什么形状？左边是单位圆，右边是图像，两边纵向比例相同，所以 P 的高度沿虚线水平地搬到右图（窄屏上圆在上、图在下，不画虚线，靠同色圆点对应）。转一圈（θ 从 0 到 2π）描出的就是<strong>正弦曲线</strong>：从 0 升到 1（θ = π/2），回到 0（θ = π），降到 −1（θ = 3π/2），再回到 0。再转一圈，曲线完全重复：这叫<strong>周期</strong>为 2π。打开「同时画 cos」可以看到横坐标描出的曲线，它和正弦曲线形状完全相同，只是整体向左挪了 π/2：cos θ = sin(θ + π/2)。',
    c2aria: '单位圆与正弦曲线', c2title: '左：单位圆；右：高度 sin θ 随 θ 的变化',
    lgSinCurve: 'sin θ（P 的高度）', lgCosCurve: 'cos θ（P 的横坐标）', lgLink: '把高度水平搬到图上',
    play2: '转一圈并描出曲线', showCos: '同时画 cos θ',
    s2progress: '已转 {c}°/{N}°。',
    s2readout: 'θ = {th}（{deg}°）：sin θ = {s}，cos θ = {c}，sin(θ + π/2) = {cs}（与 cos θ 相同）。',
    s2hint: '观察顺序：按「转一圈并描出曲线」，盯着虚线：P 在圆顶时曲线到最高点，在圆底时到最低点，过左右两端时曲线穿过 0。再打开「同时画 cos θ」重转一次，比较两条曲线的峰：cos 的峰在 θ = 0，sin 的峰在 θ = π/2，相差 π/2。',

    s3k: '第 3 步 · 正切',
    s3t: 'OP 的倾斜程度怎样表示？它在哪里不存在？',
    s3e: '这一步要回答：半径 OP 有多陡？直线的陡峭程度用<strong>斜率</strong>表示：竖直方向变化 ÷ 水平方向变化。OP 从 (0, 0) 到 (cos θ, sin θ)，所以斜率是 sin θ ÷ cos θ，记作 <strong>tan θ</strong>（正切）。几何上，把 OP 所在直线延长到竖线 x = 1，交点高度正好是 tan θ（水平走 1，竖直走「斜率」那么多）。当 cos θ = 0（θ = 90°、270°）时 OP 竖直，与 x = 1 平行、永不相交，除以 0 没有意义：tan θ <strong>无定义</strong>。靠近 90° 时交点飞得很高，但仍是一个有限的数；跨过 90°，直线换到另一侧，交点从上方跳到下方，tan θ 变号。',
    c3aria: '单位圆、直线 OP 与竖线 x = 1', c3title: 'OP 的延长线与竖线 x = 1 的交点',
    c3baria: 'tan θ 在 0° 到 360° 的图像', c3btitle: 'tan θ（0° 到 360°）',
    lgTan: 'tan θ：交点高度', lgX1: '竖线 x = 1', lgPole: 'tan 无定义的位置',
    s3readout: 'θ = {d}：sin θ = {s}，cos θ = {c}，tan θ = sin θ ÷ cos θ = {tn}。',
    s3undef: 'θ = {d}：cos θ = {c}，sin θ = {s}。OP 竖直，与 x = 1 平行，永不相交；除数为 0，tan θ 无定义。',
    s3off: '交点在画面之外（箭头所指），这只是画不下，不是无定义。',
    s3hint: '观察顺序：依次点 89.9°、90°、90.1°：tan 先是约 573，然后无定义，然后约 −573。再点 45° 和它转半圈后的位置（拖到 225°）：两次是同一条直线，tan 都是 1，所以 tan 每 180° 重复一次。右图的竖虚线标出无定义的角，曲线在那里断开，而不是连成竖线。',

    s4k: '第 4 步 · 对称',
    s4t: '知道第一象限的值，怎样得到其他象限？',
    s4e: '这一步要回答：为什么只背 0° 到 90° 的值就够了？任取一个角 θ，从 P 向 x 轴作最短的转动，转过的那个锐角叫<strong>参考角</strong> α（0° 到 90°，图中青色弧）。单位圆关于 x 轴、y 轴和原点都对称，所以与 P 互为镜像的四个点 α、180° − α、180° + α、360° − α（灰色）的坐标只差正负号：数值都是 cos α 和 sin α，符号由所在象限决定。第一象限两个坐标都为正；第二象限 x 为负；第三象限都为负；第四象限 y 为负。',
    c4aria: '单位圆上互为镜像的四个点', c4title: '单位圆：一个角与它的三个镜像',
    lgYour: '你选的角 θ', lgMirror: '另外三个镜像点', lgRef: '参考角 α',
    s4readout: 'θ = {d}（{where}），参考角 α = {a}。sin θ 符号 {ss}，cos θ 符号 {cs}：sin θ = {s}（|sin α| = {sa}），cos θ = {c}（|cos α| = {ca}）。',
    s4hint: '观察顺序：把 θ 从 0° 慢慢拖到 360°，灰色矩形的四个角始终是同一组镜像；读数里两个绝对值只随参考角变，符号随象限变。停在 150°：参考角 30°，sin 150° = sin 30° = 0.5，cos 150° = −cos 30°。',

    s5k: '第 5 步 · 振幅、频率、相位',
    s5t: '圆变大、转得快、起点换一处，波形怎样变？',
    s5e: '这一步要回答：y = A·sin(ω t + φ) 里三个数各管什么？把单位圆换成半径 A 的圆，点每单位时间转过 ω 弧度，在 t = 0 时从角 φ 出发；在时刻 t，点的高度就是 A·sin(ω t + φ)。所以：<strong>振幅</strong> A 是圆的半径，决定波的最高点；<strong>角频率</strong> ω 是转速，转一圈要 2π ÷ ω，这就是周期 T；<strong>初相</strong> φ 是起点，φ 为正时波形整体左移 φ ÷ ω。灰色虚线是 sin t（A = 1、ω = 1、φ = 0）作对照；绿点标出每个波峰，第一个波峰出现在 t = (π/2 − φ) ÷ ω（再按周期折回 [0, T)）。',
    c5aria: '半径 A 的圆与它描出的波', c5title: '左：半径 A 的圆；右：y = A·sin(ωt + φ)，t 从 0 到 4π',
    lgWave: 'A·sin(ωt + φ)', lgBase: '对照：sin t', lgPeak: '波峰',
    ampA: '振幅 A', omega: '角频率 ω（弧度/单位时间）', phase: '初相 φ',
    play5: '从 t = 0 开始转',
    s5readout: 'A = {A}，ω = {w}，φ = {phi}：周期 T = 2π ÷ ω = {T}（{Tpi}），最高点 {A}；第一个波峰在 t = {pk}，0 到 4π 内共 {n} 个波峰。',
    s5hint: '观察顺序：一次只动一个滑杆。只拖 A：波峰变高变低，峰的位置不动。只拖 ω：从 1 拖到 2，周期从 2π 缩到 π，4π 内的波峰从 2 个变成 4 个。只拖 φ：拖到 90°，整条波向左挪了 π/2，变成 cos 的样子。改完按「从 t = 0 开始转」看点怎样把波画出来。',

    s6k: '第 6 步 · 两波相加',
    s6t: '同频率的一个 cos 加一个 sin，会得到新的波形吗？',
    s6e: '这一步要回答：a·cos t + b·sin t 是什么形状？上一步说明，一个正弦波就是一根旋转箭头的高度。b·sin t 是长 b、角度 t 的箭头（绿）；a·cos t = a·sin(t + π/2) 是长 a、始终比它超前 90° 的箭头（青）。把两根箭头首尾相接，合成箭头（白）长度不变、跟着一起转，所以和仍是同频率的正弦波：a·cos t + b·sin t = R·sin(t + φ)，其中 R = √(a² + b²)（两根箭头互相垂直，用勾股定理），φ 是合成箭头比绿箭头超前的角，tan φ = a ÷ b。右图白色粗线是两波之和，橙色虚线是 R·sin(t + φ)，两条线完全重合。这是傅里叶分析的起点（<a class="xlink" href="../../../signal/transforms/fourier/#step2">→ 傅里叶页第 2 步：复杂波形 = 简单波形相加</a>）。',
    c6aria: '首尾相接的两根旋转箭头及其和', c6title: '左：两根箭头首尾相接；右：两波及其和',
    lgA: 'a·cos t', lgB: 'b·sin t', lgSum: '两者之和', lgR: 'R·sin(t + φ)',
    coefA: 'cos 的系数 a', coefB: 'sin 的系数 b', tSlider: '时刻 t（弧度）', play6: '让箭头转一圈',
    s6readout: 'a = {a}，b = {b}：R = √(a² + b²) = {R}，φ = {phi}°。数值上，和在 t = {at} 附近取最大值 {mx}（= R）。当前 t = {t}：a·cos t + b·sin t = {y}，R·sin(t + φ) = {yr}。',
    s6hint: '观察顺序：默认 a = b = 1：R = √2 ≈ 1.414，φ = 45°，和的峰值比任何一个分量都高，但又不到 2，因为两个分量的峰不在同一时刻。按「让箭头转一圈」，看白箭头尖的高度沿虚线描出白色曲线。再把 a 拖到 0：只剩 sin，φ = 0。最后让 a = 1、b = −1：φ = 135°：tan φ = a ÷ b = −1，但 φ 要按点 (b, a) 实际所在的象限（第二象限）来取，所以不是 −45°。',

    s7k: '第 7 步 · 收束',
    s7t: '一个圆，给出了哪些东西？',
    s7fin: '全页只有一个对象：单位圆上转动的点。<strong>第 0 步</strong>用弧长 ÷ 半径定义了弧度，一圈是 2π。<strong>第 1 步</strong>把落点坐标定义为 (cos θ, sin θ)，勾股定理给出 cos²θ + sin²θ = 1。<strong>第 2 步</strong>把高度展开成周期 2π 的正弦曲线，cos 是它左移 π/2。<strong>第 3 步</strong>把斜率定义为 tan θ，它在 90° + k·180° 无定义、每 180° 重复。<strong>第 4 步</strong>用对称把一切角化为参考角。<strong>第 5、6 步</strong>里，振幅、频率、相位就是圆的半径、转速和起点，同频率的波相加仍是同频率的波。',
    formula: 'P = (cos θ, sin θ)，cos²θ + sin²θ = 1，tan θ = sin θ ÷ cos θ（cos θ ≠ 0）\nA·sin(ωt + φ)：周期 2π ÷ ω\na·cos t + b·sin t = √(a² + b²)·sin(t + φ)，tan φ = a ÷ b',
    boundary: '适用范围：页面上的数值都是双精度浮点计算；0°、90°、180°、270° 的坐标按精确值处理，所以 tan 90° 显示为无定义而不是一个巨大的数。第 6 步的合成只对同一频率的两个波成立；频率不同时，和不再是一个正弦波（那正是傅里叶分析要处理的情形）。',
    linksTitle: '相关页面',
    lk1: '勾股定理页第 2 步：拼图证明，cos²θ + sin²θ = 1 从这里来 →',
    lk2: '复数页第 4 步：乘一个复数 = 转一个角，旋转在代数里的写法 →',
    lk3: '傅里叶页第 3 步：正弦波是圆在墙上的影子 →',
    lk4: '傅里叶页第 2 步：复杂波形 = 简单波形相加 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《三角函数 · 单位圆》的平行版本。',
  },
  en: {
    pageTitle: 'Trigonometric Functions · One Point Going Round a Circle',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Trigonometric Functions · The Unit Circle →',
    navLabel: 'Trigonometry step navigation',
    tagline: 'A point starts at (1, 0) and walks anticlockwise round a circle of radius 1. The angle it has turned is the input; its horizontal position, its height and the slope of the line to it are the outputs, called cos, sin and tan. In seven steps you will measure angles with a length, define the three functions, unroll them into waves, find where tan breaks, borrow values between quadrants, and finally stretch, speed up, shift and add waves using turning arrows.',
    nav0: '0 Radians', nav1: '1 Definition', nav2: '2 Unrolling', nav3: '3 Tangent', nav4: '4 Symmetry', nav5: '5 Amplitude & frequency', nav6: '6 Adding waves', nav7: '7 Wrap-up',

    s0k: 'Step 0 · A unit for angles',
    s0t: 'Can you measure an angle with a length?',
    s0e: 'This step asks: degrees split a turn into 360 parts by convention. Is there a way of measuring that does not rely on a convention? Draw a circle of radius r centred on the corner of the angle; the angle cuts off an arc of length s. A bigger angle gives a longer arc, and so does a bigger circle. Divide the arc by the radius and s ÷ r depends only on the angle, not on the size of the circle. That ratio is the angle in <strong>radians</strong>: 1 radian is the angle whose arc is exactly one radius long. On the left the orange arc changes colour after every radius; on the right the same arc is straightened out and measured in radii.',
    c0aria: 'Arc on the circle and the straightened arc length', c0title: 'The arc (one radius per segment) and its straightened length',
    c0line: 'Straightened arc length, in radii',
    lgArc: 'Arc (each colour segment is one radius long)', lgRadius: 'The two radii', lgUnit: 'Reference circle of radius 1',
    thetaRad: 'Angle θ (radians)', radius: 'Circle radius r', play0: 'Go once round',
    s0readout: 'θ = {th} rad = {deg}°. With radius r = {r} the arc is s = r·θ = {s}, and s ÷ r = {th}, which is θ itself; {n} whole radii fit along the arc.',
    s0hint: 'What to try: drag θ to 1. The arc is exactly one radius long, and the readout shows 1 radian is about 57.3°. Then change only the circle radius: the arc length s changes, but s ÷ r and the straightened length on the right do not. Finally press "Go once round": six whole radii fit in one turn with about 0.283 of a radius to spare, so a full turn is 2π ≈ 6.283 radians = 360°.',

    s1k: 'Step 1 · Definition',
    s1t: 'Start at (1, 0) and turn through θ. Where do you land?',
    s1e: 'This step asks: on the circle of radius 1 (the <strong>unit circle</strong>), start at (1, 0) and turn anticlockwise through θ (clockwise turns count as negative angles). What are the coordinates of the landing point P? We define two functions as those coordinates: the horizontal one is <strong>cos θ</strong> (cosine) and the vertical one is <strong>sin θ</strong> (sine), so P = (cos θ, sin θ). The cyan segment is the horizontal coordinate, the orange one the vertical; together with the radius OP they form a right triangle with hypotenuse 1, so Pythagoras gives cos²θ + sin²θ = 1 straight away (<a class="xlink" href="../../../math/geometry/pythagoras/#step2">→ Pythagoras, step 2: the jigsaw proof</a>). In the second, third and fourth quadrants a segment points the negative way and that coordinate is negative: the definition works for every angle, not just the acute angles of a triangle.',
    c1aria: 'Point P on the unit circle and its coordinates', c1title: 'Unit circle: P = (cos θ, sin θ) (drag P on the picture)',
    lgCos: 'Horizontal coordinate cos θ', lgSin: 'Vertical coordinate sin θ', lgP: 'Point P',
    thetaDeg: 'Angle θ (degrees)',
    quad: 'quadrant {q}', onAxis: 'on an axis',
    s1readout: 'θ = {d} ({where}): cos θ = {c}, sin θ = {s}; cos²θ + sin²θ = {sum}.',
    s1hint: 'What to try: click 30°, 45° and 60° in turn. The readout gives the exact values 1/2, √2/2 and √3/2, and sin 30° equals cos 60°. Click 90°: the horizontal coordinate is 0. Then click 135°, 210° and 300° and see which coordinate turns negative. Finally drag P all the way round on the picture: cos²θ + sin²θ stays at 1.',

    s2k: 'Step 2 · Unrolling into a wave',
    s2t: 'Keep the point turning. How does its height change with the angle?',
    s2e: 'This step asks: plot θ across and the height sin θ of P up. What shape do you get? The unit circle is on the left and the graph on the right, at the same vertical scale, so the height of P carries straight across along the dashed line (on narrow screens the circle sits above the graph, there is no dashed line, and matching coloured dots pair them up). One turn (θ from 0 to 2π) traces the <strong>sine curve</strong>: it rises from 0 to 1 (θ = π/2), returns to 0 (θ = π), falls to −1 (θ = 3π/2) and comes back to 0. A second turn repeats it exactly: the curve has <strong>period</strong> 2π. Switch on "Also draw cos θ" to see the curve traced by the horizontal coordinate. It has exactly the same shape, just shifted left by π/2: cos θ = sin(θ + π/2).',
    c2aria: 'Unit circle and sine curve', c2title: 'Left: unit circle; right: the height sin θ against θ',
    lgSinCurve: 'sin θ (height of P)', lgCosCurve: 'cos θ (horizontal position of P)', lgLink: 'Height carried across to the graph',
    play2: 'Go once round and trace the curve', showCos: 'Also draw cos θ',
    s2progress: 'Turned {c}°/{N}°. ',
    s2readout: 'θ = {th} ({deg}°): sin θ = {s}, cos θ = {c}, sin(θ + π/2) = {cs} (the same as cos θ).',
    s2hint: 'What to try: press "Go once round and trace the curve" and watch the dashed line. When P is at the top of the circle the curve is at its highest, at the bottom it is at its lowest, and as P passes the far left or right the curve crosses 0. Then switch on "Also draw cos θ" and go round again; compare the peaks: cos peaks at θ = 0, sin at θ = π/2, a gap of π/2.',

    s3k: 'Step 3 · Tangent',
    s3t: 'How do you describe how steep OP is, and where does that fail?',
    s3e: 'This step asks: how steep is the radius OP? The steepness of a line is its <strong>slope</strong>: vertical change ÷ horizontal change. OP runs from (0, 0) to (cos θ, sin θ), so its slope is sin θ ÷ cos θ, written <strong>tan θ</strong> (tangent). Geometrically, extend the line through OP until it meets the vertical line x = 1; the height of that meeting point is exactly tan θ (go 1 across and you go up by the slope). When cos θ = 0 (θ = 90°, 270°) OP is vertical, parallel to x = 1, and never meets it; dividing by 0 means nothing, so tan θ is <strong>undefined</strong>. Close to 90° the meeting point shoots very high but is still a finite number; past 90° the line swings to the other side, the meeting point jumps from above to below, and tan θ changes sign.',
    c3aria: 'Unit circle, line OP and the vertical line x = 1', c3title: 'Where the line through OP meets x = 1',
    c3baria: 'Graph of tan θ from 0° to 360°', c3btitle: 'tan θ (0° to 360°)',
    lgTan: 'tan θ: height of the meeting point', lgX1: 'Vertical line x = 1', lgPole: 'Where tan is undefined',
    s3readout: 'θ = {d}: sin θ = {s}, cos θ = {c}, tan θ = sin θ ÷ cos θ = {tn}.',
    s3undef: 'θ = {d}: cos θ = {c}, sin θ = {s}. OP is vertical, parallel to x = 1, and never meets it; the divisor is 0, so tan θ is undefined.',
    s3off: ' The meeting point is off the picture (see the arrow); that only means it does not fit, not that it is undefined.',
    s3hint: 'What to try: click 89.9°, 90° and 90.1° in turn: tan is about 573, then undefined, then about −573. Then click 45° and drag to half a turn later (225°): both are the same line, so tan is 1 both times and tan repeats every 180°. On the right the dashed verticals mark the undefined angles; the curve breaks there instead of joining up with a vertical stroke.',

    s4k: 'Step 4 · Symmetry',
    s4t: 'If you know the first quadrant, how do you get the others?',
    s4e: 'This step asks: why is it enough to know the values from 0° to 90°? For any angle θ, the acute angle between OP and the nearer half of the x-axis is the <strong>reference angle</strong> α (0° to 90°, the cyan arc). The unit circle is symmetric about the x-axis, the y-axis and the origin, so the four mirror points α, 180° − α, 180° + α and 360° − α (grey) have coordinates that differ only in sign: the sizes are always cos α and sin α, and the signs depend on the quadrant. In the first quadrant both coordinates are positive; in the second x is negative; in the third both are negative; in the fourth y is negative.',
    c4aria: 'Four mirror-image points on the unit circle', c4title: 'Unit circle: an angle and its three mirror images',
    lgYour: 'Your angle θ', lgMirror: 'The other three mirror points', lgRef: 'Reference angle α',
    s4readout: 'θ = {d} ({where}), reference angle α = {a}. Sign of sin θ: {ss}; sign of cos θ: {cs}. sin θ = {s} (|sin α| = {sa}), cos θ = {c} (|cos α| = {ca}).',
    s4hint: 'What to try: drag θ slowly from 0° to 360°. The four corners of the grey rectangle are always the same set of mirror images; in the readout the two sizes change only with the reference angle and the signs only with the quadrant. Stop at 150°: the reference angle is 30°, sin 150° = sin 30° = 0.5 and cos 150° = −cos 30°.',

    s5k: 'Step 5 · Amplitude, frequency, phase',
    s5t: 'Bigger circle, faster turning, different start: how does the wave change?',
    s5e: 'This step asks: what does each of the three numbers in y = A·sin(ωt + φ) control? Replace the unit circle by a circle of radius A, let the point turn ω radians per unit of time, and start it at angle φ when t = 0; at time t its height is A·sin(ωt + φ). So the <strong>amplitude</strong> A is the radius and sets the highest point; the <strong>angular frequency</strong> ω is the turning speed, and one turn takes 2π ÷ ω, which is the period T; the <strong>phase</strong> φ is the starting point, and a positive φ shifts the whole wave left by φ ÷ ω. The grey dashed line is sin t (A = 1, ω = 1, φ = 0) for comparison; green dots mark every peak, and the first one is at t = (π/2 − φ) ÷ ω, folded back into [0, T) by the period.',
    c5aria: 'Circle of radius A and the wave it traces', c5title: 'Left: circle of radius A; right: y = A·sin(ωt + φ), t from 0 to 4π',
    lgWave: 'A·sin(ωt + φ)', lgBase: 'For comparison: sin t', lgPeak: 'Peaks',
    ampA: 'Amplitude A', omega: 'Angular frequency ω (radians per unit time)', phase: 'Phase φ',
    play5: 'Turn from t = 0',
    s5readout: 'A = {A}, ω = {w}, φ = {phi}: period T = 2π ÷ ω = {T} ({Tpi}), highest point {A}; the first peak is at t = {pk}, and there are {n} peaks between 0 and 4π.',
    s5hint: 'What to try: move one slider at a time. Only A: the peaks rise and fall but stay where they are. Only ω: from 1 to 2 the period shrinks from 2π to π and the peaks in 0 to 4π go from 2 to 4. Only φ: at 90° the whole wave moves left by π/2 and looks like cos. After each change press "Turn from t = 0" to watch the point draw the wave.',

    s6k: 'Step 6 · Adding waves',
    s6t: 'Add a cos and a sin of the same frequency. Do you get a new kind of wave?',
    s6e: 'This step asks: what shape is a·cos t + b·sin t? The last step showed that a sine wave is the height of a turning arrow. b·sin t is an arrow of length b at angle t (green); a·cos t = a·sin(t + π/2) is an arrow of length a that always leads it by 90° (cyan). Put the two arrows tip to tail: the combined arrow (white) has a fixed length and turns with them, so the sum is still a sine wave of the same frequency: a·cos t + b·sin t = R·sin(t + φ), where R = √(a² + b²) (the two arrows are at right angles, so Pythagoras applies) and φ is how far the combined arrow leads the green one, with tan φ = a ÷ b. On the right the thick white line is the sum and the orange dashed line is R·sin(t + φ); they coincide exactly. This is where Fourier analysis starts (<a class="xlink" href="../../../signal/transforms/fourier/#step2">→ Fourier, step 2: complicated waves are sums of simple ones</a>).',
    c6aria: 'Two turning arrows tip to tail and their sum', c6title: 'Left: two arrows tip to tail; right: the two waves and their sum',
    lgA: 'a·cos t', lgB: 'b·sin t', lgSum: 'Their sum', lgR: 'R·sin(t + φ)',
    coefA: 'cos coefficient a', coefB: 'sin coefficient b', tSlider: 'Time t (radians)', play6: 'Turn the arrows once round',
    s6readout: 'a = {a}, b = {b}: R = √(a² + b²) = {R}, φ = {phi}°. Numerically the sum is largest, {mx} (= R), near t = {at}. At the current t = {t}: a·cos t + b·sin t = {y}, R·sin(t + φ) = {yr}.',
    s6hint: 'What to try: by default a = b = 1, so R = √2 ≈ 1.414 and φ = 45°. The sum peaks higher than either part but below 2, because the two parts peak at different times. Press "Turn the arrows once round" and watch the height of the white arrow tip trace the white curve along the dashed line. Then drag a to 0: only sin is left and φ = 0. Finally set a = 1, b = −1: φ = 135°: tan φ = a ÷ b = −1, but φ has to be read from the quadrant the point (b, a) actually lies in (the second), so it is not −45°.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'What did one circle give us?',
    s7fin: 'The whole page had one object: a point turning on the unit circle. <strong>Step 0</strong> defined radians as arc length ÷ radius, with a full turn being 2π. <strong>Step 1</strong> defined the landing point as (cos θ, sin θ), and Pythagoras gave cos²θ + sin²θ = 1. <strong>Step 2</strong> unrolled the height into a sine curve of period 2π, with cos being that curve shifted left by π/2. <strong>Step 3</strong> defined the slope as tan θ, undefined at 90° + k·180° and repeating every 180°. <strong>Step 4</strong> used symmetry to reduce every angle to a reference angle. In <strong>steps 5 and 6</strong> amplitude, frequency and phase turned out to be the circle\'s radius, speed and starting point, and adding waves of one frequency gave another wave of that frequency.',
    formula: 'P = (cos θ, sin θ), cos²θ + sin²θ = 1, tan θ = sin θ ÷ cos θ (cos θ ≠ 0)\nA·sin(ωt + φ): period 2π ÷ ω\na·cos t + b·sin t = √(a² + b²)·sin(t + φ), tan φ = a ÷ b',
    boundary: 'Scope: every number on the page is a double-precision calculation; the coordinates at 0°, 90°, 180° and 270° are treated as exact, which is why tan 90° shows as undefined rather than as a huge number. The combination in step 6 only works for two waves of the same frequency; with different frequencies the sum is no longer a single sine wave (which is exactly the situation Fourier analysis deals with).',
    linksTitle: 'Related pages',
    lk1: 'Pythagoras, step 2: the jigsaw proof behind cos²θ + sin²θ = 1 →',
    lk2: 'Complex numbers, step 4: multiplying by a complex number turns by an angle, rotation in algebra →',
    lk3: 'Fourier, step 3: a sine wave is the shadow of a circle →',
    lk4: 'Fourier, step 2: complicated waves are sums of simple ones →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Trigonometric Functions · The Unit Circle".',
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
  if (typeof window.refreshTrig === 'function') window.refreshTrig();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.TRIG_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
