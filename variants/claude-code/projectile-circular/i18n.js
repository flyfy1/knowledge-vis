'use strict';
// Projectiles & circular motion lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '抛体与圆周 · 同一个 g，从抛物线到绕地球',
    back: '← 知识索引',
    compare: '对照另一版本：抛体与圆周 · 一直在掉，但总掉不到地上 →',
    navLabel: '抛体与圆周步骤导航',
    tagline: '平台边松手和推出去的两个球、朝不同角度扔出的球、绳子拴着转圈的小球、开过拱桥的汽车、山顶上的大炮。每一步都追问同一件事：重力（或指向圆心的力）每过一段时间把速度改变了多少、往哪个方向改。答案连起来，就是炮弹为什么能一直往下掉，却永远掉不到地上。',
    nav0: '0 平抛', nav1: '1 抛射角', nav2: '2 速度怎样变', nav3: '3 匀速圆周', nav4: '4 拱桥', nav5: '5 牛顿的大炮', nav6: '6 收束',
    lgNow: '当前', lgTried: '你试过的车速', clearTraj: '清除旧轨迹',

    s0k: '第 0 步 · 运动的分解',
    s0t: '横着推出去的球，会比直接松手的球晚落地吗？',
    s0e: '这一步要回答：水平方向的速度会不会让物体掉得慢一些？在 20 m 高的平台边，同一时刻做两件事：一个球直接松手（橙色圆圈），另一个球以水平速度 v₀ 推出去（青色实心球）。只有水平初速度、之后只受重力的运动叫<strong>平抛</strong>。「侧视图」画出两个球的<strong>频闪</strong>位置（每 0.2 s 拍一张），同一时刻的两个位置用灰色虚线连起来。下面两张图把运动拆成两个方向：「高度 y 与时间 t」和「水平位置 x 与时间 t」。（不计空气阻力，g = 9.8 m/s²。）',
    c0a: '侧视图 · 平台高 20 m（单位 m）', c0b: '高度 y (m) 与时间 t (s)', c0c: '水平位置 x (m) 与时间 t (s)',
    s0lgDrop: '直接松手的球', s0lgThrow: '水平推出的球', s0lgSame: '同一时刻的两个位置',
    v0Slider: '水平初速度 v₀（m/s）', play0: '同时放手（真实时间）',
    s0readout: 'v₀ = {v} m/s：两个球都在 t = {T} s 落地；推出的球落在 {x} m 远处（= v₀ × {T} s）。每张频闪里两球一样高。',
    s0progress: '下落中 t = {t} s · ',
    s0hint: '观察顺序：只拖 v₀。「侧视图」里青色球越推越远，但每条灰色虚线始终是水平的：同一时刻两球一样高。「高度 y 与时间 t」图里两个球的点落在同一条曲线 y = 20 − ½gt² 上，改 v₀ 这条曲线不动；「水平位置 x 与时间 t」图里推出的球是一条直线，斜率就是 v₀，松手的球一直在 x = 0。结论：<strong>水平方向匀速、竖直方向自由落体，两个方向互不影响</strong>；落地时间只由高度决定，t = √(2h/g)。',

    s1k: '第 1 步 · 斜抛与射程',
    s1t: '出手速度一样，朝什么角度扔得最远？',
    s1e: '这一步要回答：出手速度固定为 20 m/s，<strong>抛射角</strong> θ（出手速度与水平面的夹角）怎样决定<strong>射程</strong>（落回出手高度时走过的水平距离）？把初速度拆成水平分量 v₀cosθ 和竖直分量 v₀sinθ：竖直分量决定在空中待多久，T = 2v₀sinθ ÷ g；水平分量决定这段时间里每秒走多远。所以射程 R = v₀cosθ × T = v₀² sin2θ ÷ g。「轨迹」图画出当前角度的轨迹（青色）和最近试过的 6 条（白色）。「射程与抛射角」图的橙色曲线是不计空气阻力的公式。按「加上空气阻力」换成一个示意的阻力模型：阻力造成的减速度 = 0.01 × 速率²（单位 m/s²，方向与速度相反）。这时没有简单公式，轨迹用数值方法一小步一小步算出来（绿色曲线）。',
    c1a: '轨迹（侧视，单位 m）', c1b: '射程 R (m) 与抛射角 θ (°)',
    s1lgOld: '之前的轨迹（最近 6 条）', s1lgIdeal: '不计空气阻力', s1lgDrag: '有空气阻力（示意模型）',
    thSlider1: '抛射角 θ（°）', dragToggle: '加上空气阻力',
    s1readIdeal: 'θ = {th}°，不计阻力：飞行 {T} s，最高 {H} m，射程 {R} m。互余的角 {c}° 射程同样是 {R} m。45° 时最远：{Rmax} m。',
    s1readDrag: 'θ = {th}°，有阻力：飞行 {T} s，最高 {H} m，射程 {R} m（不计阻力是 {Ri} m）。互余的角 {c}° 射程是 {Rc} m，两者不再相等。有阻力时最远的角约 {opt}°，射程 {Ropt} m。',
    s1hint: '观察顺序：先不加阻力，把 θ 从 15° 拖到 75°：落点先变远再变近，45° 最远；30° 和 60° 落在同一点（sin2θ 相同），只是 60° 飞得更高、更久。再按「加上空气阻力」：所有射程都变短，下落段比上升段陡（轨迹不再左右对称），最远的角度降到约 43°，互余的两个角里低的那个更远。这个阻力模型只是示意，真实的球还和形状、旋转有关。',

    s2k: '第 2 步 · 速度的变化',
    s2t: '抛出去以后，速度每过一段时间变了多少？',
    s2e: '这一步要回答：抛体的速度方向一直在变，那「速度的变化」有什么规律？把每一刻的速度写成水平分量 vx 和竖直分量 vy（<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">→ 向量第 1 步：两个箭头怎样合成一个</a>），出手速度 20 m/s。「轨迹与速度箭头」图在每 0.25 s 的频闪位置上画出当时的速度。「速度图」把这些速度箭头都从同一个原点画出来，横轴是 vx、纵轴是 vy（单位 m/s）；相邻两个箭头尖端之间的粉色小箭头，就是这 0.25 s 里速度的变化 Δv（后一个速度减去前一个速度）。白色箭头是时刻滑杆选中的那一刻。',
    c2a: '轨迹与速度箭头（每 0.25 s）', c2b: '速度图：vy 与 vx (m/s)',
    s2lgV: '每 0.25 s 的速度', s2lgNow: '选中时刻的速度', s2lgDv: '速度的变化 Δv',
    thSlider2: '抛射角 θ（°）', tSlider2: '时刻（占全程飞行时间的比例）',
    s2readout: 't = {t} s（全程 {T} s）：vx = {vx} m/s，vy = {vy} m/s，速率 {s} m/s，方向与水平成 {dir}°。每 0.25 s 的 Δv = ({dvx}, {dvy}) m/s：水平不变，竖直减少 g × 0.25 s。',
    s2hint: '观察顺序：先拖时刻：「轨迹与速度箭头」图里白色箭头一路往下转，上升时变短，最高点只剩水平的 vx（速率最小，但不为 0），下落时又变长；「速度图」里所有箭头的尖端落在同一条竖直线上（vx 不变），间隔相等。再改抛射角：这条竖直线左右移动、长短改变，但每个粉色 Δv 都一样：竖直向下、2.45 m/s。所以整个飞行中加速度的大小和方向都不变，就是 g。下一步换成圆周运动，同样画速度图，看 Δv 指向哪里。',

    s3k: '第 3 步 · 匀速圆周运动',
    s3t: '速率不变，为什么还有加速度？',
    s3e: '这一步要回答：小球沿半径 r 的圆以不变的速率 v 转动（<strong>匀速圆周运动</strong>），它的速度在变吗？加速度多大、指向哪里？速度是有方向的量：大小不变而方向在转，速度就在变。「圆周」图上，青色箭头是某一刻的速度 v₁，紫色箭头是 Δt 之后的速度 v₂，两者都沿切线、与半径垂直。「速度图」把 v₁、v₂ 从同一点画出来：两个箭头一样长，尖端都在半径为 v 的圆上，粉色箭头是 Δv = v₂ − v₁。平均加速度 = Δv ÷ Δt。「平均加速度与 Δt」图画出 Δt 取不同值时平均加速度的大小，灰色虚线是 v²/r。',
    c3a: '圆周（俯视）', c3b: '速度图（v₁、v₂ 从同一点画起）', c3c: '平均加速度 |Δv| ÷ Δt (m/s²) 与 Δt (s)',
    s3lgV1: '速度 v₁', s3lgV2: 'Δt 之后的速度 v₂', s3lgCurve: '|Δv| ÷ Δt（当前 r、v）', s3lgLimit: '极限 v²/r',
    rSlider3: '半径 r（m）', vSlider3: '速率 v（m/s）', dtSlider3: '时间间隔 Δt（s）', spin: '转起来 / 停下（真实速度）',
    s3readout: 'r = {r} m，v = {v} m/s：转一圈 {T} s。Δt = {dt} s 时转过 {ang}°，|Δv| ÷ Δt = {am} m/s²，Δv 与「指向圆心」方向的夹角 {off}°。Δt 越小，平均加速度越接近 v²/r = {a} m/s²。',
    s3wide: 'r = {r} m，v = {v} m/s：转一圈 {T} s。Δt = {dt} s 时转过 {ang}°，已超过半圈：|Δv| ÷ Δt = {am} m/s²，但这时的 Δv 已不能代表某一刻的加速度。把 Δt 调小，平均加速度会接近 v²/r = {a} m/s²。',
    s3hint: '观察顺序：先把 Δt 从大往小拖：「速度图」里 v₁、v₂ 的夹角变小，粉色 Δv 变短，但 |Δv| ÷ Δt 沿橙色曲线爬向灰色虚线 v²/r；Δv 一直指向圆心（读数里的夹角是 0）。再改 r 和 v：v 加倍，向心加速度变成 4 倍；r 加倍，向心加速度减半。这个指向圆心的加速度叫<strong>向心加速度</strong>，a = v²/r。要产生它，必须有一个指向圆心的合力 F = mv²/r（<a class="xlink" href="../../../physics/mechanics/newton-laws/#step2">→ 牛顿运动定律第 2 步：合力决定加速度</a>）。按「转起来」看小球按真实速度转动。',

    s4k: '第 4 步 · 向心力从哪里来',
    s4t: '汽车开过拱桥顶，桥面要托住它多大的力？',
    s4e: '这一步要回答：车在拱桥最高点时，桥面对车向上的<strong>支持力</strong> N 有多大？车快到什么程度会离开桥面？桥面是半径 r = 40 m 的圆弧，车的质量 1000 kg。在最高点，车正沿圆弧拐弯，需要指向圆心（竖直向下）的向心加速度 v²/r。向下的力是重力 mg，向上的是支持力 N，合力 mg − N 提供这个加速度：mg − N = mv²/r，所以 N = m(g − v²/r)。而支持力只能往上推、不能往下拉，所以 N 最小是 0。「拱桥与两条路径」图里白线是桥面；橙色虚线是假如桥面在最高点突然消失、车只受重力、以速度 v 水平飞出时走的抛物线。',
    c4a: '拱桥（半径 40 m）与两条路径 · 单位 m', c4b: '支持力 N ÷ 重力 mg 与车速 v (m/s)',
    s4lgBridge: '桥面（圆弧）', s4lgFree: '只受重力时的抛物线', s4lgN: '当前车速', s4lgW: '重力 mg（箭头长度 = 车重）', s4lgNf: '支持力 N（同一比例）',
    vSlider4: '车速 v（m/s）',
    s4readOn: 'v = {v} m/s：需要的向心加速度 v²/r = {need} m/s²，小于 g。桥面要托 N = {N} N，是车重的 {pct}%。抛物线比桥面弯得快，车贴着桥面走。',
    s4readOff: 'v = {v} m/s：需要的向心加速度 v²/r = {need} m/s²，大于 g。只靠重力不能让车拐这么急的弯，桥面又不能往下拉车，N = 0。抛物线比桥面弯得慢，车离开桥面飞起来。',
    s4hint: '观察顺序：从 0 往上拖车速。「支持力 N ÷ 重力 mg」图里点沿 1 − v²/(gr) 往下走：车越快，桥托得越少（坐在车里会觉得身体变轻）。到 v = √(gr) ≈ 19.8 m/s 时 N = 0，重力恰好全部用来提供向心加速度，这叫<strong>完全失重</strong>。「拱桥与两条路径」图里，在桥顶附近，橙色抛物线在这之前落在桥面下方（车要靠桥托着、沿桥面拐弯），之后抬到桥面上方（车自己的下落跟不上桥面弯下去的速度，于是离开桥面）。离桥顶远些，桥面越来越陡，抛物线迟早还会落到桥面下方；决定车离不离开桥面的，只是桥顶这一小段弯得有多急。记住这个条件：<strong>v² = g r</strong>，下一步它还会出现。',
    quizPrompt: '想一想：把拱桥半径换成 160 m（4 倍），车刚好在桥顶离开桥面的速度变成多少？',
    quizA: '还是约 19.8 m/s', quizB: '约 39.6 m/s（2 倍）', quizC: '约 79.2 m/s（4 倍）',
    check: '核对', correct: '对。临界条件 v = √(gr)：r 变成 4 倍，v 变成 √4 = 2 倍，√(9.8 × 160) ≈ 39.6 m/s。弯越平缓（半径越大），同样车速需要的向心加速度越小。',
    wrong: '提示：临界条件是 v²/r = g，即 v = √(gr)。r 乘 4，v 乘几？',

    s5k: '第 5 步 · 从抛体到卫星',
    s5t: '炮弹一直在往下掉，为什么能永远掉不到地上？',
    s5e: '这一步要回答：水平速度大到什么程度，抛出去的东西会绕着地球转，而不再落回地面？这是牛顿的思想实验：设想一座 100 km 高、没有空气的山，山顶的大炮水平开炮。离开炮口后炮弹只受地球引力，引力指向地心，大小与到地心距离的平方成反比（山顶处 g ≈ 9.52 m/s²）。「地球与炮弹轨迹」图按比例画出地球和轨迹（用每秒一步的数值积分算出），白色是之前打过的轨迹。「1 秒内的两段距离」图回答关键问题：1 秒内炮弹往下掉 ½g × (1 s)² ≈ 4.76 m（橙线，与速度无关）；同时它水平飞出 v × 1 s，在这段距离上，球形的地面比水平线弯下去多少（绿线，速度越大弯得越多）。',
    c5a: '地球与炮弹轨迹（按比例）', c5b: '1 秒内的距离 (m) 与炮口速度 v (km/s)',
    s5lgEarth: '地球（半径 6371 km）', s5lgOld: '之前的轨迹', s5lgFall: '1 秒内下落 ½g·(1 s)²', s5lgDrop: '1 秒内地面弯下去的量',
    vSlider5: '炮口速度 v（km/s）', fire: '开炮（动画 1 秒 = 实际 1000 秒）',
    s5progress: '飞行中 t = {t} 分钟 · ',
    s5readZero: 'v = 0：炮弹竖直落下，{t} 分钟后落到山脚。',
    s5readCrash: 'v = {v} km/s：炮弹飞了 {t} 分钟、绕地心转过 {deg}° 后落地。1 秒内地面只弯下去 {drop} m，比炮弹下落的 {fall} m 少，所以它离地面越来越近。',
    s5readCircle: 'v = {v} km/s：近似圆轨道（最高点与最低点相差不到 10 km），绕一圈 {T} 分钟。1 秒内地面弯下去 {drop} m，和炮弹下落的 {fall} m 几乎相等：它一直在掉，地面也以同样的速度往下「让开」。',
    s5readEllipse: 'v = {v} km/s：椭圆轨道。最低点就是山顶（离地 100 km），最高点离地 {hmax} km，绕一圈 {T} 分钟。1 秒内地面弯下去 {drop} m，比炮弹下落的 {fall} m 多，所以它先越飞越高。',
    s5hint: '观察顺序：从小往大拖炮口速度，每次按「开炮」。速度小时轨迹是一段短弧（在地面附近看就是平抛的抛物线）；越快落得越远，绕地球走得越远。拖到 7.85 km/s 时，「1 秒内的两段距离」图里两条线相交：每秒下落的 4.76 m 恰好等于地面弯下去的量，炮弹绕地球一圈回到山顶。这个速度叫<strong>环绕速度</strong>，满足 v² = g r（r 是到地心的距离），和上一步拱桥的条件是同一个式子；在地面高度算出来约 7.9 km/s，叫第一宇宙速度。再快就成了椭圆，最高点在山顶对面。速度达到约 11.1 km/s（山顶处的<strong>逃逸速度</strong>）时炮弹不再回来；本页滑杆只到 9 km/s。',

    s6k: '第 6 步 · 收束',
    s6t: '同一个规律：力每秒把速度改变多少',
    s6fin: '第 0 步：水平匀速、竖直自由落体，两个方向互不影响，落地时间只看高度。第 1 步：射程 R = v₀² sin2θ ÷ g，不计阻力时 45° 最远、互余角射程相同；加上阻力，这些对称都被打破。第 2 步：抛体在每段相等时间里的 Δv 都相同，竖直向下、大小 gΔt。第 3 步：匀速圆周的 Δv 指向圆心，a = v²/r。第 4 步：拱桥顶上 N = m(g − v²/r)，v² = gr 时完全失重、车离开桥面。第 5 步：炮弹足够快时，每秒下落的量刚好等于地面弯下去的量，它一直在掉，却总掉不到地上。',
    formula: 'x = v₀t，y = h − ½gt²\nR = v₀² sin2θ ÷ g\na = v²/r，F合 = mv²/r\n环绕条件：v² = g·r',
    boundary: '适用范围：第 0–2 步不计空气阻力、g 恒定（第 1 步的阻力只是示意模型）；第 3 步是匀速圆周；第 4 步把车当作质点，只看最高点那一刻；第 5 步把地球当作均匀球体，不计空气和地球自转，100 km 的山是假想的，轨迹用每秒一步的数值积分算出，落地、近似圆、椭圆的分类用解析公式判断。',
    linksTitle: '接着去哪里',
    lk1: '牛顿运动定律 · 第 2 步：合力决定加速度 →',
    lk2: '向量 · 第 1 步：两个向量怎样合成一个 →',
    lk3: '万有引力与轨道 · 第 1 步：从同一高度横着扔，速度不同路径怎样变 →',
    lk4: '万有引力与轨道 · 第 4 步：轨道越大，一圈要多久 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《抛体与圆周 · 一直在掉，但总掉不到地上》的平行版本。'
  },
  en: {
    pageTitle: 'Projectiles & Circular Motion · One g, from Parabola to Orbit',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Projectiles & Circular Motion · Always Falling, Never Landing →',
    navLabel: 'Projectiles and circular motion step navigation',
    tagline: 'Two balls at a ledge, one dropped and one pushed; a ball thrown at different angles; a ball whirled on a string; a car over a humpback bridge; a cannon on a mountain. Every step asks the same thing: how much does gravity (or a pull towards a centre) change the velocity in a given time, and in which direction? Put the answers together and you see why a cannonball can keep falling and never land.',
    nav0: '0 Thrown sideways', nav1: '1 Launch angle', nav2: '2 How velocity changes', nav3: '3 Circular motion', nav4: '4 The bridge', nav5: '5 Newton’s cannon', nav6: '6 Wrap-up',
    lgNow: 'Current', lgTried: 'Speeds you tried', clearTraj: 'Clear old paths',

    s0k: 'STEP 0 · SPLITTING THE MOTION',
    s0t: 'Does a ball pushed off sideways land later than one simply let go?',
    s0e: 'This step asks: does sideways speed make a body fall any slower? At the edge of a 20 m ledge two things happen at the same instant: one ball is simply let go (orange ring) and the other is pushed off horizontally at speed v₀ (solid cyan ball). Motion with only a horizontal starting velocity and only gravity afterwards is called a <strong>horizontal launch</strong>. The “Side view” shows both balls’ <strong>strobe</strong> positions (one snapshot every 0.2 s), and the two positions taken at the same instant are joined by a grey dashed line. The two plots below split the motion into its two directions: “Height y against time t” and “Horizontal position x against time t”. (No air resistance; g = 9.8 m/s².)',
    c0a: 'Side view · ledge 20 m high (metres)', c0b: 'Height y (m) against time t (s)', c0c: 'Horizontal position x (m) against time t (s)',
    s0lgDrop: 'Ball let go', s0lgThrow: 'Ball pushed sideways', s0lgSame: 'The two positions at one instant',
    v0Slider: 'Horizontal launch speed v₀ (m/s)', play0: 'Release both (real time)',
    s0readout: 'v₀ = {v} m/s: both balls land at t = {T} s; the pushed ball lands {x} m out (= v₀ × {T} s). In every strobe frame the two balls are at the same height.',
    s0progress: 'Falling: t = {t} s · ',
    s0hint: 'What to watch: drag only v₀. In “Side view” the cyan ball lands further out, yet every grey dashed line stays level: at any instant the two balls are equally high. In “Height y against time t” both balls sit on the same curve y = 20 − ½gt², which does not move when v₀ changes; in “Horizontal position x against time t” the pushed ball traces a straight line whose slope is v₀, while the dropped ball stays at x = 0. Conclusion: <strong>steady speed sideways, free fall downwards, and neither affects the other</strong>; the time to land depends only on the height, t = √(2h/g).',

    s1k: 'STEP 1 · ANGLED LAUNCH AND RANGE',
    s1t: 'Same launch speed: at what angle does it go furthest?',
    s1e: 'This step asks: with the launch speed fixed at 20 m/s, how does the <strong>launch angle</strong> θ (between the launch velocity and the horizontal) set the <strong>range</strong> (the horizontal distance covered by the time it is back at launch height)? Split the launch velocity into a horizontal part v₀cosθ and a vertical part v₀sinθ. The vertical part decides how long the ball stays up, T = 2v₀sinθ ÷ g; the horizontal part decides how far it goes each second of that time. So the range is R = v₀cosθ × T = v₀² sin2θ ÷ g. “Path” shows the present angle’s path (cyan) and the last 6 you tried (white). The orange curve in “Range against launch angle” is the formula without air resistance. “Add air resistance” switches to an illustrative drag model: drag slows the ball by 0.01 × speed² (in m/s², opposite to the velocity). There is no simple formula then, so the path is worked out numerically in many small steps (green curve).',
    c1a: 'Path (side view, metres)', c1b: 'Range R (m) against launch angle θ (°)',
    s1lgOld: 'Earlier paths (last 6)', s1lgIdeal: 'No air resistance', s1lgDrag: 'With air resistance (illustrative model)',
    thSlider1: 'Launch angle θ (°)', dragToggle: 'Add air resistance',
    s1readIdeal: 'θ = {th}°, no drag: {T} s in the air, {H} m high, range {R} m. The complementary angle {c}° also gives {R} m. Furthest at 45°: {Rmax} m.',
    s1readDrag: 'θ = {th}°, with drag: {T} s in the air, {H} m high, range {R} m (without drag {Ri} m). The complementary angle {c}° gives {Rc} m — no longer equal. With drag the best angle is about {opt}°, range {Ropt} m.',
    s1hint: 'What to watch: without drag, drag θ from 15° to 75°. The landing point moves out and then back in, furthest at 45°; 30° and 60° land on the same spot (same sin2θ), the 60° throw just goes higher and stays up longer. Now press “Add air resistance”: every range shrinks, the way down is steeper than the way up (the path is no longer symmetric), the best angle drops to about 43°, and of two complementary angles the lower one now wins. This drag model is only illustrative; a real ball also depends on its shape and spin.',

    s2k: 'STEP 2 · HOW THE VELOCITY CHANGES',
    s2t: 'Once thrown, how much does the velocity change in each stretch of time?',
    s2e: 'This step asks: a projectile’s direction keeps changing — is there a pattern in how its velocity changes? Write the velocity at each instant as a horizontal part vx and a vertical part vy (<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">→ Vectors, step 1: how two arrows combine into one</a>); the launch speed is 20 m/s. “Path and velocity arrows” draws the velocity at each strobe position, every 0.25 s. The “Velocity diagram” redraws all of those arrows from one common origin, with vx across and vy up (in m/s); the small pink arrow between two neighbouring tips is the velocity change Δv over that 0.25 s (the later velocity minus the earlier one). The white arrow is the instant picked by the time slider.',
    c2a: 'Path and velocity arrows (every 0.25 s)', c2b: 'Velocity diagram: vy against vx (m/s)',
    s2lgV: 'Velocity every 0.25 s', s2lgNow: 'Velocity at the chosen instant', s2lgDv: 'Velocity change Δv',
    thSlider2: 'Launch angle θ (°)', tSlider2: 'Instant (fraction of the flight time)',
    s2readout: 't = {t} s (flight {T} s): vx = {vx} m/s, vy = {vy} m/s, speed {s} m/s, at {dir}° to the horizontal. Every 0.25 s Δv = ({dvx}, {dvy}) m/s: nothing sideways, and g × 0.25 s less upwards.',
    s2hint: 'What to watch: first drag the instant. In “Path and velocity arrows” the white arrow keeps turning downwards — shorter on the way up, only the horizontal vx left at the top (the lowest speed, but not zero), longer again on the way down. In the “Velocity diagram” every tip sits on one vertical line (vx never changes), evenly spaced. Then change the angle: the line shifts sideways and changes length, but every pink Δv is the same — straight down, 2.45 m/s. So throughout the flight the acceleration has one size and one direction: it is g. The next step swaps in circular motion and draws the same diagram to see where Δv points.',

    s3k: 'STEP 3 · UNIFORM CIRCULAR MOTION',
    s3t: 'If the speed never changes, why is there an acceleration?',
    s3e: 'This step asks: a ball goes round a circle of radius r at a steady speed v (<strong>uniform circular motion</strong>) — is its velocity changing, and if so, how large is the acceleration and where does it point? Velocity has a direction: the size stays the same but the direction turns, so the velocity does change. In “Circle”, the cyan arrow is the velocity v₁ at one instant and the violet arrow is the velocity v₂ a time Δt later; both run along the tangent, at right angles to the radius. The “Velocity diagram” draws v₁ and v₂ from one point: equal lengths, both tips on a circle of radius v, and the pink arrow is Δv = v₂ − v₁. The average acceleration is Δv ÷ Δt. “Average acceleration against Δt” plots its size for different Δt, with v²/r as a grey dashed line.',
    c3a: 'Circle (seen from above)', c3b: 'Velocity diagram (v₁, v₂ from one point)', c3c: 'Average acceleration |Δv| ÷ Δt (m/s²) against Δt (s)',
    s3lgV1: 'Velocity v₁', s3lgV2: 'Velocity v₂ after Δt', s3lgCurve: '|Δv| ÷ Δt (present r, v)', s3lgLimit: 'Limit v²/r',
    rSlider3: 'Radius r (m)', vSlider3: 'Speed v (m/s)', dtSlider3: 'Time interval Δt (s)', spin: 'Spin / stop (real speed)',
    s3readout: 'r = {r} m, v = {v} m/s: one turn takes {T} s. With Δt = {dt} s the ball turns {ang}°, |Δv| ÷ Δt = {am} m/s², and Δv is {off}° away from “towards the centre”. The smaller Δt, the closer the average gets to v²/r = {a} m/s².',
    s3wide: 'r = {r} m, v = {v} m/s: one turn takes {T} s. With Δt = {dt} s the ball turns {ang}°, more than half a turn: |Δv| ÷ Δt = {am} m/s², but this Δv no longer stands for the acceleration at any one instant. Shrink Δt and the average approaches v²/r = {a} m/s².',
    s3hint: 'What to watch: first drag Δt from large to small. In the “Velocity diagram” the angle between v₁ and v₂ closes and the pink Δv shrinks, but |Δv| ÷ Δt climbs the orange curve towards the grey v²/r line; Δv always points at the centre (the readout angle stays 0). Then change r and v: double v and the acceleration becomes 4 times as big; double r and it halves. This centre-pointing acceleration is the <strong>centripetal acceleration</strong>, a = v²/r. Producing it takes a net force towards the centre, F = mv²/r (<a class="xlink" href="../../../physics/mechanics/newton-laws/#step2">→ Newton’s laws, step 2: the net force sets the acceleration</a>). Press “Spin” to watch the ball go round at its real speed.',

    s4k: 'STEP 4 · WHERE THE CENTRIPETAL FORCE COMES FROM',
    s4t: 'A car crests a humpback bridge: how hard must the road hold it up?',
    s4e: 'This step asks: at the top of the bridge, how big is the road’s upward <strong>normal force</strong> N on the car, and how fast must the car go to leave the road? The road is an arc of radius r = 40 m and the car has a mass of 1000 kg. At the top the car is turning along the arc, so it needs a centripetal acceleration v²/r pointing at the centre — straight down. The forces are its weight mg downwards and N upwards, and their net mg − N supplies that acceleration: mg − N = mv²/r, so N = m(g − v²/r). A road can push up but cannot pull down, so N can be no less than 0. In “Bridge and two paths” the white line is the road; the orange dashed line is the parabola the car would follow if the road vanished at the top and only gravity acted, with the car moving off level at speed v.',
    c4a: 'Bridge (radius 40 m) and two paths · metres', c4b: 'Normal force N ÷ weight mg against car speed v (m/s)',
    s4lgBridge: 'Road surface (arc)', s4lgFree: 'Parabola under gravity alone', s4lgN: 'Present speed', s4lgW: 'Weight mg (arrow length = the car’s weight)', s4lgNf: 'Normal force N (same scale)',
    vSlider4: 'Car speed v (m/s)',
    s4readOn: 'v = {v} m/s: the centripetal acceleration needed, v²/r = {need} m/s², is less than g. The road must push N = {N} N, {pct}% of the car’s weight. The parabola curves away faster than the road, so the car stays on it.',
    s4readOff: 'v = {v} m/s: the centripetal acceleration needed, v²/r = {need} m/s², is more than g. Gravity alone cannot bend the path that sharply and the road cannot pull the car down, so N = 0. The parabola curves away more slowly than the road, and the car leaves the surface.',
    s4hint: 'What to watch: drag the speed up from 0. In “Normal force N ÷ weight mg” the point slides down 1 − v²/(gr): the faster the car, the less the road holds it up (you feel lighter in your seat). At v = √(gr) ≈ 19.8 m/s, N = 0 — all of gravity is busy supplying the centripetal acceleration; this is <strong>weightlessness</strong>. In “Bridge and two paths” near the top, the orange parabola dips below the road before that speed (the car needs the road to hold it on the curve) and rises above it afterwards (the car’s own fall cannot keep up with how fast the road curves away, so it lifts off). Further from the top the road gets steeper and the parabola eventually drops below it anyway; whether the car leaves the road depends only on how sharply the road bends right at the top. Keep the condition in mind: <strong>v² = g r</strong>. It comes back in the next step.',
    quizPrompt: 'Think: if the bridge radius were 160 m (4 times), what speed would just lift the car off the top?',
    quizA: 'Still about 19.8 m/s', quizB: 'About 39.6 m/s (twice)', quizC: 'About 79.2 m/s (4 times)',
    check: 'Check', correct: 'Right. The threshold is v = √(gr): r grows 4 times, v grows √4 = 2 times, √(9.8 × 160) ≈ 39.6 m/s. The gentler the curve (larger radius), the less centripetal acceleration a given speed needs.',
    wrong: 'Hint: the threshold is v²/r = g, i.e. v = √(gr). Multiply r by 4 — what does v get multiplied by?',

    s5k: 'STEP 5 · FROM PROJECTILE TO SATELLITE',
    s5t: 'A cannonball keeps falling. How can it never reach the ground?',
    s5e: 'This step asks: how much sideways speed does it take for a launched object to circle the Earth instead of coming back down? This is Newton’s thought experiment: picture a mountain 100 km high with no air, and a cannon on top firing horizontally. Once out of the barrel the shell feels only the Earth’s gravity, pointing at the Earth’s centre and falling off with the square of the distance to it (at the summit g ≈ 9.52 m/s²). “Earth and the shell’s path” draws the Earth and the path to scale (worked out numerically one second at a time); white paths are earlier shots. “Two distances in one second” answers the key question: in one second the shell falls ½g × (1 s)² ≈ 4.76 m (orange line, the same at every speed); in that second it also travels v × 1 s sideways, and over that distance the round Earth drops away below a straight line by some amount (green line, larger at higher speed).',
    c5a: 'Earth and the shell’s path (to scale)', c5b: 'Distance in one second (m) against muzzle speed v (km/s)',
    s5lgEarth: 'Earth (radius 6371 km)', s5lgOld: 'Earlier paths', s5lgFall: 'Fall in one second, ½g·(1 s)²', s5lgDrop: 'How far the ground curves away in one second',
    vSlider5: 'Muzzle speed v (km/s)', fire: 'Fire (1 s of animation = 1000 s)',
    s5progress: 'In flight: t = {t} min · ',
    s5readZero: 'v = 0: the shell drops straight down and reaches the foot of the mountain after {t} min.',
    s5readCrash: 'v = {v} km/s: the shell flies for {t} min and sweeps {deg}° round the Earth’s centre before it lands. In one second the ground curves away only {drop} m, less than the {fall} m the shell falls, so it keeps getting closer to the ground.',
    s5readCircle: 'v = {v} km/s: a near-circular orbit (highest and lowest points differ by under 10 km), {T} min per turn. In one second the ground curves away {drop} m, almost exactly the {fall} m the shell falls: it never stops falling, and the ground keeps dropping away just as fast.',
    s5readEllipse: 'v = {v} km/s: an elliptical orbit. The lowest point is the summit (100 km up) and the highest is {hmax} km up; one turn takes {T} min. In one second the ground curves away {drop} m, more than the {fall} m the shell falls, so at first it climbs.',
    s5hint: 'What to watch: drag the muzzle speed from low to high and press “Fire” each time. At low speed the path is a short arc (close to the ground it is just the parabola of a horizontal launch); faster shots land further round the Earth. At 7.85 km/s the two lines in “Two distances in one second” cross: the 4.76 m the shell falls each second equals how far the ground curves away, and the shell goes all the way round back to the summit. That is the <strong>orbital speed</strong>, satisfying v² = g r (r measured from the Earth’s centre) — the same condition as on the bridge in the last step; worked out at ground level it is about 7.9 km/s, the first cosmic velocity. Faster still gives an ellipse, highest on the far side from the summit. At about 11.1 km/s (the <strong>escape speed</strong> at the summit) the shell never comes back; this slider stops at 9 km/s.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'One rule: how much a force changes the velocity each second',
    s6fin: 'Step 0: steady speed sideways and free fall downwards, independent of each other; the landing time depends only on the height. Step 1: range R = v₀² sin2θ ÷ g; without drag 45° goes furthest and complementary angles tie, and drag breaks both symmetries. Step 2: in equal times a projectile’s Δv is always the same, straight down with size gΔt. Step 3: in uniform circular motion Δv points at the centre, a = v²/r. Step 4: at the top of the bridge N = m(g − v²/r); at v² = gr the car is weightless and lifts off. Step 5: fast enough, the shell falls each second exactly as far as the ground curves away — always falling, never landing.',
    formula: 'x = v₀t, y = h − ½gt²\nR = v₀² sin2θ ÷ g\na = v²/r, F_net = mv²/r\nOrbit condition: v² = g·r',
    boundary: 'Where this holds: steps 0–2 ignore air resistance and take g as constant (the drag in step 1 is only an illustrative model); step 3 is uniform circular motion; step 4 treats the car as a point and looks only at the instant at the top; step 5 treats the Earth as a uniform sphere with no air and no rotation, the 100 km mountain is imaginary, the paths come from numerical integration one second at a time, and the crash / near-circle / ellipse labels come from exact formulas.',
    linksTitle: 'Where to go next',
    lk1: 'Newton’s laws · step 2: the net force sets the acceleration →',
    lk2: 'Vectors · step 1: how two vectors combine into one →',
    lk3: 'Gravity and orbits · step 1: thrown sideways from one height at different speeds →',
    lk4: 'Gravity and orbits · step 4: the bigger the orbit, the longer one turn takes →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Projectiles & Circular Motion · Always Falling, Never Landing”.'
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
