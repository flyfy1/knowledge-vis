'use strict';
// Inscribed angles strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '圆周角 · 站在圆上看一条弦',
    back: '← 知识索引',
    compare: '对照另一版本：圆周角 · 为什么恰好是一半 →',
    navLabel: '圆周角步骤导航',
    tagline: '在圆上画一条弦 AB。站在圆心看它，两条视线张开一个角；站到圆上某一点 P 再看，又是一个角。这两个角有什么关系？P 换个位置，角会不会变？七步里你会拖着 P 满圆跑、亲手量出答案，再用两个等腰三角形说明为什么，最后用它拿一把三角尺找出圆心。',
    nav0: '0 两种角', nav1: '1 拖着 P 跑', nav2: '2 为什么是一半', nav3: '3 直径', nav4: '4 弦的两侧', nav5: '5 找圆心', nav6: '6 自测 · 收束',

    s0k: '第 0 步 · 先认清两种角',
    s0t: '站在圆心看弦 AB，和站在圆上看它，各是哪个角？',
    s0e: '这一步要回答：同一条弦，从两个地方看出去的两个角，各由哪两条线夹成？图里是圆心为 O 的一个圆。连接圆上两点的线段叫<strong>弦</strong>，这里是 AB；从圆心到圆上一点的线段叫<strong>半径</strong>，比如 OA、OB（<a class="xlink" href="../../../math/geometry/circle-intro/#step1">→ 圆的认识第 1 步：半径、直径、弦分别是哪一段</a>）。弦 AB 把圆周分成两段<strong>弧</strong>：小于半圆的那段叫<strong>劣弧</strong>，大于半圆的那段叫<strong>优弧</strong>。顶点在圆心、两边是半径的角叫<strong>圆心角</strong>，这里是紫色的 ∠AOB；顶点在圆上、两边都是弦的角叫<strong>圆周角</strong>，这里是青色的 ∠APB。图中橙色加粗的是 ∠APB 「对着」的那段弧：P 的两条视线之间夹住的那段。',
    pSliderAll: 'P 的位置（离最高点转过的角度）',
    lgCentral: '圆心角 ∠AOB（两边是半径）', lgInscribed: '圆周角 ∠APB（两边是弦）', lgArc: '∠APB 对着的弧',
    arcMajor: '优弧（大于半圆的一段）', arcMinor: '劣弧（小于半圆的一段）',
    s0readout: 'P 在{arc}上。圆心角 ∠AOB = {c}°（顶点在圆心 O，两边是半径 OA、OB）；圆周角 ∠APB = {p}°（顶点在圆上的 P，两边是弦 PA、PB）。两个角都由点的坐标量出。',
    coincide: 'P 和 {pt} 几乎重合：弦 P{pt} 缩成一个点，∠APB 量不出来。把 P 挪开一点。',
    s0hint: '观察顺序：先只拖 P 在上方的优弧上走，看青色角的读数；再把 P 拖过 A 或 B 到下方的劣弧上，看橙色的弧换成了另一段，读数也换了一个数。这一步只认角，规律留给下一步去量。',

    s1k: '第 1 步 · 拖着 P 跑',
    s1t: 'P 在优弧上随便走，∠APB 会变吗？',
    s1e: '这一步要回答：P 只在优弧（大于半圆的那段弧）上移动时，圆周角 ∠APB（顶点在圆上、两边是弦）是变大、变小，还是不变？它和圆心角 ∠AOB（顶点在圆心、两边是半径）有什么关系？旁边的图（窄屏时在下方）把每次量到的结果画成一个点：横轴是 P 的位置（离圆最高点转过的角度，向左为正），纵轴是量得的 ∠APB。紫色虚线是当前的 ∠AOB，灰色虚线是它的一半。拖动 P 或按「让 P 走完整段优弧」，点会一个个留下来；改圆心角会开始一条新记录，旧的保留作对照。',
    cSlider: '圆心角 ∠AOB', pSliderMajor: 'P 在优弧上的位置（离最高点的角度）', walkMajor: '让 P 走完整段优弧', clearTrace: '清空记录',
    lgTrace: '量到的 ∠APB（每个位置一个点）', lgCentralLine: '∠AOB', lgHalfLine: '∠AOB 的一半',
    g1a: 'P 的位置与量得的 ∠APB', g1title: '横轴 P 的位置，纵轴量得的 ∠APB',
    s1readout: '{prog}∠AOB = {c}°；P 在 {s}° 处，量得 ∠APB = {p}°，∠AOB ÷ 2 = {h}°，相差 {diff}°。这条记录里已量了 {n} 个位置，最大值与最小值相差 {spread}°。',
    walking: '（P 走动中 {k}/{N}）',
    s1hint: '观察顺序：先保持圆心角不变，按「让 P 走完整段优弧」，看旁边图里的点排成一条水平线，正好落在灰色虚线（∠AOB 的一半）上；再把圆心角改成 60° 或 140°，重走一遍，新的一条水平线仍然落在新的一半上。',

    s2k: '第 2 步 · 为什么恰好是一半',
    s2t: '量出来是一半，能不能说清它为什么一定是一半？',
    s2e: '这一步要回答：上一步量了很多位置，可量不完所有位置；有没有一个理由，让「一半」对优弧上的每个 P 都成立？要用两件旧知识。<strong>等腰三角形</strong>（有两条边相等的三角形）里，相等两边所对的两个<strong>底角</strong>相等。三角形三个内角加起来是 180°（<a class="xlink" href="../../../math/geometry/polygon-angles/#step0">→ 多边形内角第 0 步：三个角拼成一个平角</a>），所以三角形的一个<strong>外角</strong>（把一条边延长出去，和相邻边夹成的角）等于另外两个内角之和。按「下一步」一笔一笔加辅助线，图和下面的等式同步出现，每个角度都是从图上量出来的。',
    prev: '上一步', next: '下一步', prog: '证明进度 {k}/4',
    lgAlpha: 'α：△OAP 的底角', lgBeta: 'β：△OBP 的底角', lgRadius: '半径（都相等）',
    p0: '起点：P 在优弧上，∠APB = {apb}°，∠AOB = {aob}°。目标：说明 ∠AOB = 2∠APB。',
    p1: '连 OP，延长到圆上的 D，PD 是一条直径。OA、OP、OB 都是半径，长度相等（都量得 {r}）。',
    p2: '△OAP 里 OA = OP，是等腰三角形，两个底角相等：∠OAP = {a1}°，∠OPA = {a2}°，记作 α。同理 △OBP 里 ∠OBP = {b1}°，∠OPB = {b2}°，记作 β。',
    p3: '∠AOD 是 △OAP 在 O 处的外角，等于不相邻的两个内角之和：∠AOD = α + α = 2α。量得 ∠AOD = {aod}°，2α = {a2x}°。同理 ∠BOD = {bod}°，2β = {b2x}°。',
    p4in: 'O 在 ∠APB 里面，直径 PD 把两个角都切成两份：∠AOB = ∠AOD + ∠BOD = 2α + 2β = 2∠APB。量得 {aob}° = 2 × {apb}°。',
    p4out: 'O 在 ∠APB 外面，直径 PD 不在两条弦之间，要用减法：∠AOB = |∠AOD − ∠BOD| = 2|α − β| = 2∠APB。量得 {aob}° = 2 × {apb}°。',
    whereIn: 'O 在 ∠APB 内部，第 4 笔用加法',
    whereOut: 'O 在 ∠APB 外部，第 4 笔用减法',
    s2readout: 'P 在 {s}° 处：{where}。{prog}',
    s2hint: '观察顺序：按「下一步」走完 4 笔，对照每一行等式和图上同色的角；然后在第 4 笔停住，拖 P 靠近 A 或 B，看 O 跑到 ∠APB 外面时，等式从加法换成减法，但结论 ∠AOB = 2∠APB 不变。也可以改圆心角，所有读数一起更新。',

    s3k: '第 3 步 · 弦变成直径',
    s3t: '当弦 AB 正好穿过圆心，∠APB 是多少？',
    s3e: '这一步要回答：如果弦 AB 穿过圆心，成了<strong>直径</strong>（过圆心的弦），P 在圆上的 ∠APB（圆周角）是多少？这时 ∠AOB 是一个平角，180°，按第 1 步的规律，圆周角应该是它的一半：90°，而且两侧的半圆都一样。这个结论有个名字，叫<strong>泰勒斯定理</strong>。滑杆 d 是弦到圆心的距离（半径算作 1）：d = 0 就是直径，d 越大，弦离圆心越远。旁边的图（窄屏时在下方）横轴是 P 的位置（离最高点转过的角度，整整一圈），纵轴是量得的 ∠APB；青点是 P 在 AB 上方弧上量的，橙点是下方弧上量的，灰色虚线是 90°。',
    dSlider: '弦 AB 到圆心的距离 d（半径 = 1）', walkAll: '让 P 绕圆走一整圈',
    lgTraceUpper: 'P 在 AB 上方的弧', lgTraceLower: 'P 在 AB 下方的弧', lg90: '90°',
    g3a: 'P 绕一圈时量得的 ∠APB', g3title: '横轴 P 的位置，纵轴量得的 ∠APB',
    diaYes: 'AB 是直径', diaNo: 'AB 不是直径，∠AOB = {c}°',
    sideUp: 'AB 上方的弧', sideDown: 'AB 下方的弧',
    s3readout: '{prog}d = {d}，{dia}。P 在 {s}°（{side}），量得 ∠APB = {p}°。{ranges}',
    rangeHas: '{side}上量过 {n} 个位置：{lo}°–{hi}°。',
    rangeNone: '{side}还没量过。',
    s3hint: '观察顺序：保持 d = 0，按「让 P 绕圆走一整圈」，图里两侧的点都排在 90° 的灰线上（只在 A、B 两点断开）。再把 d 拖到 0.4 重走：上方的点整体低于 90°，下方的点整体高于 90°，不再是直角。这说明结论要求 AB 真的过圆心，「很长的弦」不行。',

    s4k: '第 4 步 · 弦的两侧',
    s4t: '同一条弦，从两侧的弧上看，两个角有什么关系？',
    s4e: '这一步要回答：P 在优弧（大于半圆的那段）上，Q 在劣弧（小于半圆的那段）上，同一条弦 AB 的两个圆周角 ∠APB 和 ∠AQB 有什么关系？Q 的视线夹住的是优弧，它对应的圆心角不再是 ∠AOB，而是绕到另一边的那个大于 180° 的角，叫<strong>优角</strong>，等于 360° − ∠AOB（图中紫色大弧）。第 1 步的规律对它也成立：∠AQB 是优角的一半。于是 ∠APB + ∠AQB = ½∠AOB + ½(360° − ∠AOB) = 180°：两个角<strong>互补</strong>（和为 180°）。A、P、B、Q 四点都在圆上，连成的四边形叫<strong>圆内接四边形</strong>，这正是说它的一组对角互补。',
    uSlider: 'P 在优弧上的位置（%）', vSlider: 'Q 在劣弧上的位置（%）',
    lgP: '∠APB（P 在优弧上）', lgQ: '∠AQB（Q 在劣弧上）', lgReflex: '优角 360° − ∠AOB',
    s4readout: '∠APB = {p}°，∠AQB = {q}°，和 = {sum}°。优角 = 360° − {c}° = {reflex}°，它的一半是 {half}°，正是 ∠AQB。',
    s4hint: '观察顺序：先只拖 P，∠APB 不变；再只拖 Q，∠AQB 也不变；然后改圆心角，两个读数一个变大、一个变小，和始终是 180°。也可以直接在图上拖：在上面的弧上拖动 P，在下面的弧上拖动 Q。',

    s5k: '第 5 步 · 拿来用',
    s5t: '一个圆，圆心没标出来，怎样用一把三角尺找到它？',
    s5e: '这一步要回答：木工手里有一块圆板，圆心没标；只有一把带直角的三角尺，能不能找出圆心？把三角尺的直角顶点 V 放在圆上，两条直角边各碰到圆上一点 X、Y。第 3 步说直径所对的圆周角是直角；反过来也成立：圆周角是直角时，它对着的弦一定是直径（∠XVY 是 90°，它对着的弧对应的圆心角就是 2 × 90° = 180°，所以 X、O、Y 在一条直线上）。所以 XY 一定穿过圆心。换个位置再画一条，两条直径的交点就是圆心。下图里圆心先不画出，等你画满两条线再揭晓。',
    vPos: '直角顶点 V 在圆上的位置', tilt: '三角尺倾斜的角度', drawLine: '沿两脚落点画线', clearLines: '擦掉画过的线',
    centreLabel: '圆心',
    lgSquare: '三角尺（直角顶点 V）', lgDrawn: '画下的线 XY', lgCentre: '两线交点',
    s5readout: '量得 ∠XVY = {corner}°，XY 长 {len}（半径 = 1，直径就是 2），XY 到圆心的距离 {off}：XY 是一条直径。{after}',
    after0: '按「沿两脚落点画线」把它画下来。',
    after1: '已画 1 条。把 V 挪到别处，再画一条。',
    afterN: '已画 {n} 条。前两条交于一点，它到圆周上点 V、X、Y 的距离分别是 {d1}、{d2}、{d3}，都等于半径：这一点就是圆心。',
    afterPar: '已画 {n} 条，但前两条几乎重合，交点找不准。把 V 挪远一点再画。',
    s5hint: '观察顺序：先拖「倾斜角度」，三角尺转动，X、Y 跟着动，但读数里 XY 的长度一直是 2；按一次画线。再把 V 挪到圆的另一侧，画第二条，圆心出现。三角尺怎么斜都可以，只要直角顶点在圆上。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '三个问题，用前面量出的规律回答',
    s6e: '这一步要回答：前面的结论你能不能用上？答完按「检查答案」，每题会说明理由；拿不准时可以回到对应的步骤去量。',
    q1: '① 圆心角 ∠AOB = 80°，P 在优弧上。∠APB 是多少？',
    q1a: '80°', q1b: '40°', q1c: '160°',
    q2: '② 弦 AB 把圆分成两段弧。P 在优弧上，量得 ∠APB = 65°；Q 在劣弧上。∠AQB 是多少？',
    q2a: '65°', q2b: '130°', q2c: '115°',
    q3: '③ AB 是直径，P 在圆上（不与 A、B 重合）。∠APB 是多少？',
    q3a: '一定是 90°', q3b: '只有 P 在 AB 正上方时才是 90°', q3c: '随 P 的位置变化',
    check: '检查答案',
    q1ok: '对：圆周角是圆心角的一半，80° ÷ 2 = {v}°（在 ∠AOB = 80° 的图上量得 {v}°）。',
    q1no: '再想想：{pick}不对。圆周角的顶点离弦更远，张开得更小，是圆心角的一半：{v}°。',
    q2ok: '对：P、Q 在弦的两侧，两个圆周角互补，180° − 65° = {v}°（在这个图上量得 {v}°）。',
    q2no: '再想想：{pick}不对。Q 对着的是优弧，所对的是优角 360° − 130° = 230°，一半是 {v}°；也可以直接用互补：180° − 65° = {v}°。',
    q3ok: '对：直径所对的圆心角是 180°，圆周角是它的一半，90°，与 P 在哪里无关（泰勒斯定理）。',
    q3no: '再想想：{pick}不对。第 3 步里 d = 0 时，P 绕一整圈，量到的点全部落在 90° 上（只有 A、B 两点量不出来）。',
    q0: '这一题还没选。',
    s6fin: '一条线索串起全页。<strong>第 0 步</strong>：圆心角的顶点在圆心、两边是半径；圆周角的顶点在圆上、两边是弦。<strong>第 1 步</strong>：P 在优弧上怎么走，∠APB 都不变，等于 ∠AOB 的一半。<strong>第 2 步</strong>：连一条直径，两个等腰三角形的外角各是底角的 2 倍，拼起来（或相减）就是一半的理由。<strong>第 3 步</strong>：弦是直径时，圆周角恒为 90°。<strong>第 4 步</strong>：弦两侧的两个圆周角互补，圆内接四边形对角之和是 180°。<strong>第 5 步</strong>：反过来，直角的两脚落在一条直径上，两条直径交出圆心。',
    formula: '∠APB = ½∠AOB（P 在优弧上）\n直径所对的圆周角 = 90°\n∠APB + ∠AQB = 180°（P、Q 在弦的两侧）',
    boundary: '适用范围：平面上的圆；P 不能与 A、B 重合（那时弦 PA 或 PB 缩成一点，角量不出来）。本页角度都由点的坐标计算，显示保留到 0.1°；滑杆每格 1°，所以量到的读数恒定是几何定理的结果，不是测量凑巧。真实纸上量角会有误差，那是另一件事。',
    linksTitle: '接着去哪',
    lk1: '→ 圆的认识第 1 步：半径、直径、弦分别是哪一段',
    lk2: '→ 多边形内角第 0 步：三角形三个角为什么拼成 180°',
    lk3: '→ 勾股定理第 4 步：给三条边，判断是不是直角三角形',
    lk4: '→ 对称与旋转第 2 步：圆绕圆心转任意角度都和自己重合',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《圆周角 · 为什么恰好是一半》的平行版本。'
  },
  en: {
    pageTitle: 'Inscribed Angles · Seeing a Chord from the Circle',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Inscribed Angles · Why Exactly Half →',
    navLabel: 'Inscribed angle steps',
    tagline: 'Draw a chord AB in a circle. Look at it from the centre and your two lines of sight open up an angle; look from a point P on the circle and you get another. How are the two related, and does the second one change as P moves? In seven steps you will drag P all round the circle and measure the answer, explain it with two isosceles triangles, and finally use it to find a circle’s centre with nothing but a set square.',
    nav0: '0 Two angles', nav1: '1 Drag P around', nav2: '2 Why half', nav3: '3 Diameter', nav4: '4 Both sides', nav5: '5 Find the centre', nav6: '6 Check · Wrap-up',

    s0k: 'Step 0 · Two kinds of angle',
    s0t: 'Seen from the centre and seen from the circle, which angle is which?',
    s0e: 'This step asks: one chord, seen from two places — which two lines form each angle? The figure is a circle with centre O. A segment joining two points of the circle is a <strong>chord</strong>, here AB; a segment from the centre to the circle is a <strong>radius</strong>, such as OA or OB (<a class="xlink" href="../../../math/geometry/circle-intro/#step1">→ The circle, step 1: which segment is the radius, the diameter, the chord</a>). The chord cuts the circle into two <strong>arcs</strong>: the one shorter than a semicircle is the <strong>minor arc</strong>, the longer one the <strong>major arc</strong>. An angle with its vertex at the centre and radii for sides is a <strong>central angle</strong> — the violet ∠AOB. An angle with its vertex on the circle and chords for sides is an <strong>inscribed angle</strong> — the cyan ∠APB. The thick orange arc is the one ∠APB “faces”: the stretch of circle caught between P’s two lines of sight.',
    pSliderAll: 'Position of P (degrees round from the top)',
    lgCentral: 'Central angle ∠AOB (sides are radii)', lgInscribed: 'Inscribed angle ∠APB (sides are chords)', lgArc: 'Arc that ∠APB faces',
    arcMajor: 'the major arc (longer than a semicircle)', arcMinor: 'the minor arc (shorter than a semicircle)',
    s0readout: 'P is on {arc}. Central angle ∠AOB = {c}° (vertex at the centre O, sides the radii OA and OB); inscribed angle ∠APB = {p}° (vertex at P on the circle, sides the chords PA and PB). Both are measured from the points’ coordinates.',
    coincide: 'P is almost on top of {pt}: chord P{pt} has shrunk to a point and ∠APB cannot be measured. Move P away a little.',
    s0hint: 'What to watch: first drag P only along the major arc at the top and read the cyan angle; then drag P past A or B onto the minor arc below — the orange arc swaps to the other side and the reading jumps to a different value. This step is just for naming; the pattern comes next.',

    s1k: 'Step 1 · Drag P around',
    s1t: 'As P wanders along the major arc, does ∠APB change?',
    s1e: 'This step asks: while P moves only along the major arc (the part longer than a semicircle), does the inscribed angle ∠APB (vertex on the circle, sides are chords) grow, shrink or stay put — and how does it compare with the central angle ∠AOB (vertex at the centre, sides are radii)? The chart beside it (below it on narrow screens) turns every measurement into a dot: across is P’s position (degrees round from the top of the circle, anticlockwise positive), up is the measured ∠APB. The violet dashed line is the current ∠AOB, the grey dashed line half of it. Drag P or press “Walk P along the major arc” and the dots stay behind; changing the central angle starts a new record and keeps the old one for comparison.',
    cSlider: 'Central angle ∠AOB', pSliderMajor: 'P on the major arc (degrees from the top)', walkMajor: 'Walk P along the major arc', clearTrace: 'Clear the record',
    lgTrace: 'Measured ∠APB (one dot per position)', lgCentralLine: '∠AOB', lgHalfLine: 'Half of ∠AOB',
    g1a: 'Position of P against the measured ∠APB', g1title: 'P’s position across, measured ∠APB up',
    s1readout: '{prog}∠AOB = {c}°; with P at {s}°, ∠APB measures {p}°, and ∠AOB ÷ 2 = {h}° — a difference of {diff}°. This record holds {n} positions, whose largest and smallest readings differ by {spread}°.',
    walking: '(P walking {k}/{N}) ',
    s1hint: 'What to watch: keep the central angle fixed and press “Walk P along the major arc” — the dots in the chart form a flat line sitting exactly on the grey dashed line, half of ∠AOB. Then set the central angle to 60° or 140° and walk again: the new flat line sits on the new half.',

    s2k: 'Step 2 · Why exactly half',
    s2t: 'It measures as half — but why must it be half?',
    s2e: 'This step asks: the last step measured many positions, but never all of them. Is there a reason “half” holds for every P on the major arc? Two old facts do the job. In an <strong>isosceles triangle</strong> (one with two equal sides) the two <strong>base angles</strong> opposite the equal sides are equal. The three angles of a triangle add to 180° (<a class="xlink" href="../../../math/geometry/polygon-angles/#step0">→ Polygon angles, step 0: three angles make a straight line</a>), so an <strong>exterior angle</strong> of a triangle (made by extending one side past a vertex) equals the sum of the two interior angles at the other vertices. Press “Next” to add one construction line at a time; the figure and the equations below appear together, and every angle is measured from the figure.',
    prev: 'Back', next: 'Next', prog: 'Proof {k}/4',
    lgAlpha: 'α: base angle of △OAP', lgBeta: 'β: base angle of △OBP', lgRadius: 'Radii (all equal)',
    p0: 'Start: P on the major arc, ∠APB = {apb}°, ∠AOB = {aob}°. Goal: show ∠AOB = 2∠APB.',
    p1: 'Join OP and extend it to D on the circle, so PD is a diameter. OA, OP and OB are all radii, so they are equal (each measures {r}).',
    p2: 'In △OAP, OA = OP, so it is isosceles and its base angles match: ∠OAP = {a1}°, ∠OPA = {a2}°; call this α. Likewise in △OBP, ∠OBP = {b1}° and ∠OPB = {b2}°; call this β.',
    p3: '∠AOD is the exterior angle of △OAP at O, so it equals the two interior angles at the other vertices: ∠AOD = α + α = 2α. Measured: ∠AOD = {aod}°, 2α = {a2x}°. Likewise ∠BOD = {bod}°, 2β = {b2x}°.',
    p4in: 'O lies inside ∠APB, so the diameter PD splits both angles in two: ∠AOB = ∠AOD + ∠BOD = 2α + 2β = 2∠APB. Measured: {aob}° = 2 × {apb}°.',
    p4out: 'O lies outside ∠APB, so the diameter PD is not between the two chords and we subtract: ∠AOB = |∠AOD − ∠BOD| = 2|α − β| = 2∠APB. Measured: {aob}° = 2 × {apb}°.',
    whereIn: 'O is inside ∠APB, so the last line adds',
    whereOut: 'O is outside ∠APB, so the last line subtracts',
    s2readout: 'P at {s}°: {where}. {prog}',
    s2hint: 'What to watch: press “Next” through all four lines and match each equation with the angle of the same colour in the figure. Then, on line 4, drag P towards A or B: once O falls outside ∠APB the equation switches from adding to subtracting, but ∠AOB = 2∠APB still holds. Changing the central angle updates every reading at once.',

    s3k: 'Step 3 · When the chord is a diameter',
    s3t: 'If chord AB passes right through the centre, what is ∠APB?',
    s3e: 'This step asks: if chord AB passes through the centre, becoming a <strong>diameter</strong> (a chord through the centre), what is the inscribed angle ∠APB for P on the circle? Now ∠AOB is a straight angle, 180°, so by step 1 the inscribed angle should be half of it — 90° — and the same on both semicircles. This result has a name: <strong>Thales’ theorem</strong>. Slider d is the chord’s distance from the centre (taking the radius as 1): d = 0 is a diameter, and the larger d, the further the chord sits from the centre. In the chart beside it (below it on narrow screens), across is P’s position (degrees round from the top, one full turn) and up is the measured ∠APB; cyan dots were measured above AB, orange dots below, and the grey dashed line is 90°.',
    dSlider: 'Distance d from chord AB to the centre (radius = 1)', walkAll: 'Walk P once round the circle',
    lgTraceUpper: 'P on the arc above AB', lgTraceLower: 'P on the arc below AB', lg90: '90°',
    g3a: 'Measured ∠APB as P goes round', g3title: 'P’s position across, measured ∠APB up',
    diaYes: 'AB is a diameter', diaNo: 'AB is not a diameter, ∠AOB = {c}°',
    sideUp: 'the arc above AB', sideDown: 'the arc below AB',
    s3readout: '{prog}d = {d}: {dia}. P at {s}° ({side}) measures ∠APB = {p}°. {ranges}',
    rangeHas: 'On {side}: {n} positions measured, {lo}°–{hi}°. ',
    rangeNone: 'Nothing measured yet on {side}. ',
    s3hint: 'What to watch: keep d = 0 and press “Walk P once round the circle” — on both sides the dots line up on the grey 90° line, broken only at A and B. Then drag d to 0.4 and walk again: the dots above sit below 90°, the dots below sit above it, and neither is a right angle. The theorem really needs AB to pass through the centre; a merely long chord will not do.',

    s4k: 'Step 4 · Both sides of the chord',
    s4t: 'Seen from the two arcs on either side of one chord, how are the two angles related?',
    s4e: 'This step asks: with P on the major arc (longer than a semicircle) and Q on the minor arc (shorter), how are the two inscribed angles ∠APB and ∠AQB on the same chord related? Q’s lines of sight catch the major arc, so its central angle is no longer ∠AOB but the angle going round the other way, larger than 180° — a <strong>reflex angle</strong>, equal to 360° − ∠AOB (the large violet arc). Step 1’s rule holds for it too: ∠AQB is half the reflex angle. So ∠APB + ∠AQB = ½∠AOB + ½(360° − ∠AOB) = 180°: the two angles are <strong>supplementary</strong> (they add to 180°). A, P, B and Q all lie on the circle, and the quadrilateral they form is a <strong>cyclic quadrilateral</strong>; this says its opposite angles add to 180°.',
    uSlider: 'P along the major arc (%)', vSlider: 'Q along the minor arc (%)',
    lgP: '∠APB (P on the major arc)', lgQ: '∠AQB (Q on the minor arc)', lgReflex: 'Reflex angle 360° − ∠AOB',
    s4readout: '∠APB = {p}°, ∠AQB = {q}°, sum = {sum}°. Reflex angle = 360° − {c}° = {reflex}°, and half of it is {half}° — exactly ∠AQB.',
    s4hint: 'What to watch: drag only P and ∠APB stays put; drag only Q and ∠AQB stays put too. Then change the central angle: one reading rises as the other falls, and their sum stays at 180°. You can also drag in the figure — along the upper arc to move P, along the lower arc to move Q.',

    s5k: 'Step 5 · Put it to work',
    s5t: 'A circle with no centre marked: how do you find it with a set square?',
    s5e: 'This step asks: a woodworker has a round board with no centre marked and only a set square with a right-angled corner. Can they find the centre? Put the square’s right-angled corner V on the circle; each of its two edges meets the circle again, at X and Y. Step 3 said that an angle standing on a diameter is a right angle; the reverse holds too: if an inscribed angle is a right angle, the chord it faces must be a diameter (∠XVY is 90°, so the central angle for that arc is 2 × 90° = 180°, putting X, O and Y on one straight line). So XY always passes through the centre. Move the square, draw a second such line, and the two diameters cross at the centre. The centre is hidden in the figure until you have drawn two lines.',
    vPos: 'Corner V on the circle', tilt: 'Tilt of the set square', drawLine: 'Draw the line through X and Y', clearLines: 'Erase the lines',
    centreLabel: 'centre',
    lgSquare: 'Set square (right-angled corner V)', lgDrawn: 'Lines XY drawn so far', lgCentre: 'Where the lines cross',
    s5readout: 'Measured ∠XVY = {corner}°, XY is {len} long (radius = 1, so a diameter is 2), and XY passes {off} from the centre: XY is a diameter. {after}',
    after0: 'Press “Draw the line through X and Y” to keep it.',
    after1: 'One line drawn. Move V somewhere else and draw another.',
    afterN: '{n} lines drawn. The first two cross at a point whose distances to V, X and Y on the circle are {d1}, {d2} and {d3} — each equal to the radius, so this point is the centre.',
    afterPar: '{n} lines drawn, but the first two almost coincide, so their crossing is unreliable. Move V further away and draw again.',
    s5hint: 'What to watch: drag the tilt first — the set square turns, X and Y move with it, yet the readout keeps XY at length 2. Draw one line. Then move V to the other side of the circle, draw a second, and the centre appears. Any tilt works, as long as the corner sits on the circle.',

    s6k: 'Step 6 · Check and wrap-up',
    s6t: 'Three questions, answered with what you measured',
    s6e: 'This step asks: can you use what you found? Press “Check answers” and each answer comes back with its reason; if unsure, go back to the step where you measured it.',
    q1: '① The central angle ∠AOB is 80° and P is on the major arc. What is ∠APB?',
    q1a: '80°', q1b: '40°', q1c: '160°',
    q2: '② Chord AB splits the circle into two arcs. P is on the major arc and ∠APB measures 65°; Q is on the minor arc. What is ∠AQB?',
    q2a: '65°', q2b: '130°', q2c: '115°',
    q3: '③ AB is a diameter and P is on the circle (not at A or B). What is ∠APB?',
    q3a: 'Always 90°', q3b: '90° only when P is straight above the middle of AB', q3c: 'It depends on where P is',
    check: 'Check answers',
    q1ok: 'Right: the inscribed angle is half the central angle, 80° ÷ 2 = {v}° (measured {v}° on a figure with ∠AOB = 80°).',
    q1no: 'Not quite: {pick} is wrong. The inscribed angle’s vertex is further from the chord, so it opens less — half the central angle: {v}°.',
    q2ok: 'Right: P and Q are on opposite sides of the chord, so the angles are supplementary: 180° − 65° = {v}° (measured {v}° on this figure).',
    q2no: 'Not quite: {pick} is wrong. Q faces the major arc, whose central angle is the reflex angle 360° − 130° = 230°, and half of that is {v}°; or use supplementary angles directly, 180° − 65° = {v}°.',
    q3ok: 'Right: a diameter has central angle 180°, so the inscribed angle is half of it, 90°, wherever P is (Thales’ theorem).',
    q3no: 'Not quite: {pick} is wrong. In step 3 with d = 0, P went all the way round and every dot landed on 90° (only A and B themselves could not be measured).',
    q0: 'No answer picked yet.',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: a central angle has its vertex at the centre and radii for sides; an inscribed angle has its vertex on the circle and chords for sides. <strong>Step 1</strong>: wherever P goes on the major arc, ∠APB stays the same — half of ∠AOB. <strong>Step 2</strong>: one diameter makes two isosceles triangles whose exterior angles are twice their base angles; adding (or subtracting) them is the reason for “half”. <strong>Step 3</strong>: on a diameter the inscribed angle is always 90°. <strong>Step 4</strong>: the inscribed angles on the two sides of a chord are supplementary, so opposite angles of a cyclic quadrilateral add to 180°. <strong>Step 5</strong>: in reverse, a right angle’s two edges land on the ends of a diameter, and two diameters cross at the centre.',
    formula: '∠APB = ½∠AOB (P on the major arc)\nAngle standing on a diameter = 90°\n∠APB + ∠AQB = 180° (P, Q on opposite sides of the chord)',
    boundary: 'Scope: circles in the plane; P may not coincide with A or B (chord PA or PB would shrink to a point and the angle would not exist). Every angle here is computed from point coordinates and shown to 0.1°; the slider moves 1° at a time, so the constant readings are a geometric theorem, not a lucky measurement. Measuring on paper adds real errors, which is another story.',
    linksTitle: 'Where to go next',
    lk1: '→ The circle, step 1: which segment is the radius, the diameter, the chord',
    lk2: '→ Polygon angles, step 0: why a triangle’s three angles make 180°',
    lk3: '→ Pythagoras, step 4: given three sides, decide whether the triangle is right-angled',
    lk4: '→ Symmetry & rotation, step 2: a circle turned by any angle about its centre lands on itself',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Inscribed Angles · Why Exactly Half”.'
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
