'use strict';
// Interference strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '波的干涉 · 两列波相加出的地图',
    back: '← 知识索引',
    compare: '对照另一版本：波的干涉 · 闹与静的图样 →',
    navLabel: '波的干涉步骤导航',
    tagline: '在水面上用两根小棒同步点水，两圈圈波纹交叠，水面上会出现几条几乎不动的「静线」，静线之间水面起伏得格外厉害。两列波明明都在往外跑，为什么这张闹与静的地图却钉在原地？七步里你会从一个点的上下振动出发，算出这张地图，再看它在什么条件下会动起来。',
    nav0: '0 一列波', nav1: '1 一点相加', nav2: '2 整张地图', nav3: '3 相位差', nav4: '4 频率不同', nav5: '5 量波长', nav6: '6 自测收束',
    play: '暂停', resume: '播放', unitCm: ' cm',
    lbS1: 'S₁', lbS2: 'S₂', lbS: 'S', lbP: 'P', lbLam: 'λ',
    slow: '教学慢放：周期 T = 1 s',

    s0k: '第 0 步 · 一列波',
    s0t: '一列水波经过 P 点时，P 处的水面是怎样动的？',
    s0e: '这一步要回答：波传到某一点，那一点的水面怎么动？俯视图是从上往下看的水面，亮的是波峰、暗的是波谷，<strong>波源</strong> S 在不停地上下点水。在水面上任选一点 P，曲线图画出 P 处水面高度 y 随时间的变化（最近 3 秒，最右端是此刻）。相邻两个波峰之间的距离叫<strong>波长</strong> λ；水面最高处离平静水面的高度叫<strong>振幅</strong> A，本页取 A = 1 mm；完成一次上下振动所用的时间叫<strong>周期</strong> T。P 处的振动和波源一模一样，只是晚了一点：波从 S 走到 P 需要时间，距离 r 每多一个波长，就晚一个周期。用式子写：y = A·sin(2πt/T − 2πr/λ)（<a class="xlink" href="../../../math/geometry/trigonometry/#step2">→ 三角函数第 2 步：把圆上点的高度摊开就是正弦波</a>）。',
    pxS: 'P 的横坐标', pyS: 'P 的纵坐标', lamS: '波长 λ',
    c0title: '俯视：水面（亮 = 波峰，暗 = 波谷）', c0btitle: 'P 处的水面高度 y（mm），最近 3 秒',
    s0lgCrest: '波峰', s0lgTrough: '波谷', s0lgTrace: 'P 处的 y(t)',
    s0readout: 'P 到波源 r = {r} cm = {c} 个波长，所以 P 比波源晚 {c} 个周期（{lag} s）开始同样的振动。P 处振幅 {A} mm，周期 {T} s；此刻 y = {y} mm。水面上的这一点只上下动，不随波跑远。',
    s0hint: '观察顺序：先不动 P，看曲线图：P 处的水面只是按正弦规律上下动，最高 1 mm、最低 −1 mm，每 1 s 一次。再拖 P 的纵坐标让它离波源远一点，曲线整体往右挪（更晚），形状不变。最后拖波长：λ 越小，俯视图的圈越密。可以在俯视图上直接点选 P。',

    s1k: '第 1 步 · 两列波在一点相加',
    s1t: '再加一个波源，P 处的水面现在怎么动？',
    s1e: '这一步要回答：两列波同时到达 P，P 的振动是什么？两个波源 S₁、S₂ 相距 d = 6 cm，同时、同样地点水（同频率、同振幅、步调一致），λ = 2 cm。<strong>叠加原理</strong>：P 处的水面高度就是两列波各自引起的高度直接相加，y = y₁ + y₂（水波振幅不大时成立）。相加的结果取决于两列波到达 P 时的步调：P 到两个波源的距离 r₁、r₂ 之差叫<strong>路程差</strong> Δr = r₂ − r₁。Δr 每多一个波长，第二列波就晚一个完整周期，步调又对齐；Δr 是半个波长，第二列波晚半个周期，一个到波峰时另一个正好到波谷。曲线图同时画出 y₁、y₂ 和它们的和。',
    preset0: 'Δr = 0', presetHalf: 'Δr = λ/2', presetOne: 'Δr = λ',
    c1title: '俯视：两个波源同时点水', c1btitle: 'P 处：y₁、y₂ 与 y = y₁ + y₂（mm）',
    s1lgY1: 'y₁（来自 S₁）', s1lgY2: 'y₂（来自 S₂）', s1lgSum: 'y = y₁ + y₂',
    s1readout: 'r₁ = {r1} cm，r₂ = {r2} cm，路程差 Δr = {dr} cm = {c} λ。合振动的振幅 B = {B} mm（单列波是 1 mm）。{kind}',
    kind_loud: 'Δr 是整数个波长：两列波步调一致，振幅加倍到 2 mm，这是加强点。',
    kind_still: 'Δr 是半整数个波长：两列波步调正好相反，任何时刻都相互抵消，这一点始终不动，是静点。',
    kind_partial: 'Δr 不是整数也不是半整数个波长：部分抵消，振幅介于 0 和 2 mm 之间。',
    s1hint: '观察顺序：依次按 Δr = 0、λ/2、λ 三个按钮，只看曲线图的粗线：第一个和第三个上下摆动 2 mm，第二个是一条平线，两条细线却都在动，说明两列波都到了，只是正好抵消。再在俯视图里随意点几个点，读数里的 Δr 和振幅 B 跟着变。',

    s2k: '第 2 步 · 整张地图',
    s2t: '俯视图的波纹一直在动，为什么说闹与静的位置是固定的？',
    s2e: '这一步要回答：哪些地方加强、哪些地方抵消，会不会随时间变？上一步说明，同频、步调一致的两个波源，某点的振幅只由路程差决定：B = 2A·|cos(π·Δr/λ)|，式子里没有时间 t。所以振幅分布是一张固定的地图。路程差相同的点连成的线是<strong>双曲线</strong>（到两个定点的距离之差为定值的点的轨迹）：Δr = 0、±λ、±2λ… 的线上全部加强，Δr = ±λ/2、±3λ/2… 的线上全部静止。两列波叠加后强弱分布稳定不变的现象，叫<strong>干涉</strong>。切到「振幅地图」可以直接看到每一点的振幅 B。',
    vField: '此刻的水面', vAmp: '振幅地图', showLines: '画出加强线与静线', dS: '两波源间距 d',
    c2title_field: '俯视：此刻的水面', c2title_amp: '俯视：每一点的振幅 B（亮 = 大）',
    s2lgLoud: '加强线 Δr = 整数 × λ', s2lgStill: '静线 Δr = 半整数 × λ',
    s2readout: 'd = {d} cm，λ = {lam} cm：两波源之间有 {nl} 条加强线、{ns} 条静线（只有 |Δr| < d 的线存在，所以 d ÷ λ 越大线越多）。P 处 Δr = {c} λ，振幅 {B} mm。',
    s2hint: '观察顺序：先保持「此刻的水面」并勾选「画出加强线与静线」：波纹一直往外跑，粉色虚线上的水面却始终不动。再切到「振幅地图」，亮带和暗带正好落在两组线上。然后拖波长：λ 越小，线越密；拖间距：d 越大，线越多。',

    s3k: '第 3 步 · 相位差',
    s3t: '如果两个波源一开始步调就不一样，地图会怎么变？',
    s3e: '这一步要回答：决定加强和抵消的，到底是路程差还是别的什么？描述「振动进行到一个周期的哪一步」的角度叫<strong>相位</strong>，一个周期是 360°；两个振动的相位之差叫<strong>相位差</strong>。现在让 S₂ 比 S₁ 晚 φ 开始点水。在 P 点，第二列波总共落后 δ = 360°·Δr/λ + φ：前一项来自多走的路，后一项来自起步晚。δ 是 360° 的整数倍就加强，是 180° 的奇数倍就静止，振幅 B = 2A·|cos(δ/2)|。φ 是常数，所以地图仍然固定，只是整体挪动；只要相位差保持不变（这样的两个波源叫<strong>相干波源</strong>），就有稳定的图样。',
    phiS: 'S₂ 起步落后的相位 φ', phi0: 'φ = 0°', phi180: 'φ = 180°',
    c3title: '俯视：振幅地图（亮 = 振幅大）',
    s3readout: 'P 处：路程差贡献 {path}°，起步差 φ = {phi}°，合计 δ = {delta}°（相当于 {red}°）。振幅 B = {B} mm。{kind}',
    s3hint: '观察顺序：P 放在中垂线上（Δr = 0）不动，把 φ 从 0° 拖到 180°：中垂线从最亮的加强线变成静线，整张地图连续地平移，加强线和静线对调；拖到 360° 又回到原样。读数里的 δ 把两部分加在一起。',

    s4k: '第 4 步 · 频率不同',
    s4t: '如果两个波源的频率稍有不同，还能得到稳定的地图吗？',
    s4e: '这一步要回答：「图样固定」需要什么条件？让 S₂ 每秒点水的次数（<strong>频率</strong>）是 S₁ 的 f₂/f₁ 倍。两列波的相位差不再是常数，而是每秒多变化 360°×(f₂ − f₁)。于是每一点的振幅时大时小，加强线和静线在水面上不停地移动，地图不再固定。在 P 点，响与静交替一次所用的时间是 1 ÷ |f₂ − f₁|，这叫<strong>拍</strong>（<a class="xlink" href="../../../physics/waves/sound-waves/#step2">→ 声波第 2 步：两个音调几乎一样的声音为什么忽强忽弱</a>）。曲线图画出 P 处最近 20 秒的振动，看外面那层包络怎样鼓起又收拢。',
    ratioS: '频率比 f₂ / f₁',
    c4title: '俯视：此刻各点的振幅（亮 = 大）', c4btitle: 'P 处的 y（mm），最近 20 秒',
    s4lgEnv: '包络 ±2A·|cos(Δ/2)|',
    s4stable: 'f₂ = f₁：相位差不随时间变，地图固定，P 处振幅一直是 {B} mm。',
    s4beat: 'f₂ − f₁ = {df} Hz：相位差每秒变化 {dps}°，P 处的振幅在 0 到 2 mm 之间来回变化，每 {Tb} s 重复一次；此刻是 {B} mm。加强线以同样的节奏在水面上移动。',
    s4hint: '观察顺序：频率比保持 1.00，俯视图的亮带不动；拖到 1.05，亮带开始缓慢扫过水面，曲线图里 P 点的振动变成一鼓一收的一串「包」，每包 20 s。频率比越接近 1，包越长；差得越多，地图变化越快，肉眼看到的只剩一片乱纹。',

    s5k: '第 5 步 · 用干涉量波长',
    s5t: '只量地图上条纹的间距，能反推出波长吗？',
    s5e: '这一步要回答：干涉图样怎样变成一把量波长的尺子？在离波源 L = {L} cm 处沿直线放一排探测器（俯视图里的虚线），振幅图画出这条线上每一点的振幅。正中间是 Δr = 0 的加强点，旁边第一个加强点满足 |Δr| = λ。当 L 远大于 d、而且这个点离中线不远时，可以近似认为第一个加强点离中线 x₁ ≈ λ·L ÷ d。反过来，量出 x₁、d、L 就能估算 λ ≈ x₁·d ÷ L。光的<a class="xlink" href="../../../physics/modern/double-slit/#step0">双缝实验</a>就是用这个办法量出了光的波长，那里的 L 是 d 的上万倍，近似非常准。',
    c5title: '俯视：振幅地图与探测线', c5btitle: '探测线上的振幅 B（mm），横轴 x（cm）',
    s5lgExact: '实际加强点（解方程得到）', s5lgApprox: '近似位置 m·λL/d',
    s5readout: '第一个加强点实际在 x₁ = {x1} cm，近似公式给出 {xa} cm。用 x₁ 反推：λ ≈ {est} cm，真实 λ = {lam} cm，偏差 {err}%。{note}',
    s5none: 'd = {d} cm 不大于 λ = {lam} cm：两波源之间只有中央一条加强线，没有第一个加强点可量。',
    s5good: '偏差小于 5%，近似可用。', s5bad: '偏差较大：这个点离中线太远（角度大），或者 L 相对 d 不够大。',
    s5hint: '观察顺序：先看振幅图，加强点的竖线（实际）和三角（近似）几乎重合在中央附近，越往两边差得越多。再保持 d 不变、把 λ 调小：第一个加强点更靠近中线、角度更小，读数里的偏差随之减小。改 d 的效果有两面：d 大了角度变小，但 L 相对 d 又不够大了。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '三道题，用路程差和相位差判断',
    q1: '① 两个同步点水的波源，λ = 2 cm。某点的路程差 Δr = 3 cm，这一点是？',
    q1a: '加强点', q1b: '静点', q1c: '振幅介于两者之间',
    q2: '② 上一步里 Δr = λ/2 的静点，如果把波长减半（波源位置不变），它变成什么？',
    q2a: '仍是静点', q2b: '加强点', q2c: '说不准',
    q3: '③ 让 S₂ 比 S₁ 晚 180° 起步，中垂线上的点（Δr = 0）会怎样？它那里有没有波到达？',
    q3a: '加强，两列波都到达', q3b: '静止，因为没有波到达', q3c: '静止，两列波都到达但正好抵消',
    check: '检查答案',
    fb1ok: '① 对：Δr = 3 cm = 1.5λ，是半整数个波长，两列波步调相反，这一点始终不动。', fb1no: '① 再想想：3 cm 是几个波长？整数个加强，半整数个静止。',
    fb2ok: '② 对：Δr 没变，但用新的波长量，它从 0.5 个波长变成了 1 个波长，静点变成加强点。', fb2no: '② 再想想：Δr 是几何距离，不随波长变；用新波长去量它是几个 λ？',
    fb3ok: '③ 对：Δr = 0，但起步差 180°，δ = 180°，两列波都到了，振幅一样大，只是步调相反，相加为零。', fb3no: '③ 再想想：静点处两列波各自都在振动（第 1 步曲线图的两条细线），是相加之后才抵消的。',
    fbNone: '先选一个选项。',
    s6fin: '回顾：<strong>第 0 步</strong>，一列波经过的每一点都按正弦规律上下振动，离波源越远起步越晚；<strong>第 1 步</strong>，两列波在一点直接相加，路程差为整数个波长时加强、为半整数个波长时抵消；<strong>第 2 步</strong>，振幅只由路程差决定，与时间无关，所以闹与静构成一张固定的双曲线地图；<strong>第 3 步</strong>，真正起作用的是到达时的相位差 δ = 360°·Δr/λ + φ；<strong>第 4 步</strong>，频率不同时相位差随时间变，地图不再固定；<strong>第 5 步</strong>，条纹间距可以反推出波长。',
    formula: 'y = y₁ + y₂\nδ = 360°·Δr/λ + φ\nB = 2A·|cos(δ/2)|',
    boundary: '适用范围：本页假设两列波振幅相同且不随距离衰减、水面完全遵守叠加原理、两波源只是点。真实水波离波源越远越弱，两列波到达某点的振幅一般不相等，静点处只能「几乎不动」而不是严格为零。为了看清，周期放慢到 1 s，俯视图的亮暗是按模型逐点算出来的，不是实拍。第 5 步的近似只在 L 远大于 d、角度小时准确。',
    linksTitle: '接着去哪',
    lk1: '→ 驻波第 0 步：两列波迎面跑，波形为什么停下来',
    lk2: '→ 双缝实验第 0 步：光的明暗条纹间距由什么决定',
    lk3: '→ 声波第 2 步：频率相近的两个声音叠加出「拍」',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《波的干涉 · 闹与静的图样》的平行版本。'
  },
  en: {
    pageTitle: 'Interference · The Map Two Waves Draw',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Interference · A Pattern of Loud and Still →',
    navLabel: 'Interference steps',
    tagline: 'Tap a water surface with two little rods in step and the two sets of ripples overlap. A few “still lines” appear where the water barely moves, and between them the surface heaves harder than ever. Both waves keep running outward — so why does this map of loud and still stay pinned in place? In seven steps you will start from one point bobbing up and down, compute the map, and then see what it takes to make it move.',
    nav0: '0 One wave', nav1: '1 Add at a point', nav2: '2 The whole map', nav3: '3 Phase', nav4: '4 Frequencies', nav5: '5 Measure λ', nav6: '6 Self-test',
    play: 'Pause', resume: 'Play', unitCm: ' cm',
    lbS1: 'S₁', lbS2: 'S₂', lbS: 'S', lbP: 'P', lbLam: 'λ',
    slow: 'slowed down: period T = 1 s',

    s0k: 'Step 0 · One wave',
    s0t: 'As a water wave passes a point P, how does the water at P move?',
    s0e: 'The question here: when a wave reaches a point, what does the water there do? The top-down view looks down on the water: bright is a crest, dark a trough, and the <strong>source</strong> S keeps tapping the surface. Pick any point P; the graph plots the water height y at P against time (the last 3 seconds, now at its right edge). The distance between neighbouring crests is the <strong>wavelength</strong> λ. How high the water rises above its calm level is the <strong>amplitude</strong> A, 1 mm on this page; the time for one full up-and-down is the <strong>period</strong> T. P moves exactly like the source, only later: the wave needs time to travel from S to P, one full period for every wavelength of distance r. As a formula: y = A·sin(2πt/T − 2πr/λ) (<a class="xlink" href="../../../math/geometry/trigonometry/#step2">→ Trigonometry, step 2: unroll a point’s height on a circle and you get a sine wave</a>).',
    pxS: 'P across', pyS: 'P up', lamS: 'Wavelength λ',
    c0title: 'From above: the water (bright = crest, dark = trough)', c0btitle: 'Water height y at P (mm), last 3 s',
    s0lgCrest: 'Crest', s0lgTrough: 'Trough', s0lgTrace: 'y(t) at P',
    s0readout: 'P is r = {r} cm from the source, which is {c} wavelengths, so P starts the same motion {c} periods ({lag} s) later. Amplitude at P {A} mm, period {T} s; right now y = {y} mm. This bit of water only bobs up and down; it does not travel off with the wave.',
    s0hint: 'What to try: leave P alone and watch the graph — the water at P just rises and falls like a sine, up to 1 mm and down to −1 mm, once a second. Then drag “P up” to move it further from the source: the curve slides right (later) without changing shape. Finally drag the wavelength: the smaller λ, the tighter the rings. You can also click the top-down view to place P.',

    s1k: 'Step 1 · Two waves add at a point',
    s1t: 'Add a second source. How does the water at P move now?',
    s1e: 'The question here: when two waves reach P together, what does P do? Sources S₁ and S₂, d = 6 cm apart, tap at the same moments in the same way (same frequency, same amplitude, in step), with λ = 2 cm. The <strong>superposition principle</strong>: the water height at P is simply the sum of what each wave alone would give, y = y₁ + y₂ (true for small water waves). What the sum looks like depends on how the two waves are in step when they arrive. The difference of P’s distances to the two sources is the <strong>path difference</strong> Δr = r₂ − r₁. Each extra wavelength of Δr delays the second wave by one whole period, bringing it back into step; half a wavelength delays it by half a period, so one wave is at a crest when the other is at a trough. The graph draws y₁, y₂ and their sum.',
    preset0: 'Δr = 0', presetHalf: 'Δr = λ/2', presetOne: 'Δr = λ',
    c1title: 'From above: two sources tapping together', c1btitle: 'At P: y₁, y₂ and y = y₁ + y₂ (mm)',
    s1lgY1: 'y₁ (from S₁)', s1lgY2: 'y₂ (from S₂)', s1lgSum: 'y = y₁ + y₂',
    s1readout: 'r₁ = {r1} cm, r₂ = {r2} cm, path difference Δr = {dr} cm = {c} λ. Amplitude of the combined motion B = {B} mm (one wave alone gives 1 mm). {kind}',
    kind_loud: 'Δr is a whole number of wavelengths: the waves arrive in step and the amplitude doubles to 2 mm — a point of reinforcement.',
    kind_still: 'Δr is a whole number plus a half: the waves arrive exactly out of step and cancel at every instant, so this point never moves — a still point.',
    kind_partial: 'Δr is neither a whole nor a half-odd number of wavelengths: the waves partly cancel, and the amplitude lies between 0 and 2 mm.',
    s1hint: 'What to try: press Δr = 0, λ/2 and λ in turn and watch only the thick line in the graph. The first and third swing by 2 mm; the second is flat — yet both thin lines are still moving, so both waves have arrived and simply cancel. Then click a few points in the top-down view; Δr and the amplitude B in the readout follow.',

    s2k: 'Step 2 · The whole map',
    s2t: 'The ripples in the top-down view never stop moving. Why call the loud and still places fixed?',
    s2e: 'The question here: do the places that reinforce or cancel change with time? Step 1 showed that for two in-step sources of the same frequency, a point’s amplitude depends only on the path difference: B = 2A·|cos(π·Δr/λ)|, with no time t in it. So the amplitudes form a fixed map. Points sharing one path difference lie on a <strong>hyperbola</strong> (the set of points whose distances to two fixed points differ by a constant). Every point on Δr = 0, ±λ, ±2λ… reinforces; every point on Δr = ±λ/2, ±3λ/2… stays still. A steady pattern of strong and weak places made by two overlapping waves is called <strong>interference</strong>. Switch to “Amplitude map” to see each point’s amplitude B directly.',
    vField: 'Water right now', vAmp: 'Amplitude map', showLines: 'Draw reinforcing and still lines', dS: 'Source spacing d',
    c2title_field: 'From above: the water right now', c2title_amp: 'From above: amplitude B at each point (bright = large)',
    s2lgLoud: 'Reinforcing line Δr = whole × λ', s2lgStill: 'Still line Δr = half-odd × λ',
    s2readout: 'd = {d} cm, λ = {lam} cm: between the sources there are {nl} reinforcing lines and {ns} still lines (only lines with |Δr| < d exist, so the larger d ÷ λ, the more lines). At P, Δr = {c} λ and the amplitude is {B} mm.',
    s2hint: 'What to try: keep “Water right now” and tick “Draw reinforcing and still lines”. The ripples keep running outward, yet the water on the pink dashed lines never moves. Switch to “Amplitude map”: the bright and dark bands sit exactly on the two sets of lines. Then drag the wavelength (smaller λ, denser lines) and the spacing (larger d, more lines).',

    s3k: 'Step 3 · Phase difference',
    s3t: 'What if the two sources start out of step? How does the map change?',
    s3e: 'The question here: is it really the path difference that decides, or something more? The angle that says how far a vibration has got through its cycle is its <strong>phase</strong>; one cycle is 360°. The gap between two phases is the <strong>phase difference</strong>. Now let S₂ start tapping φ later than S₁. At P the second wave lags by δ = 360°·Δr/λ + φ in total: the first part from the longer path, the second from the late start. A whole multiple of 360° reinforces, an odd multiple of 180° cancels, and B = 2A·|cos(δ/2)|. Since φ is constant, the map is still fixed — it just shifts. As long as the phase difference stays constant (such sources are called <strong>coherent</strong>), the pattern is steady.',
    phiS: 'Phase φ by which S₂ starts late', phi0: 'φ = 0°', phi180: 'φ = 180°',
    c3title: 'From above: amplitude map (bright = large)',
    s3readout: 'At P: path contributes {path}°, late start φ = {phi}°, total δ = {delta}° (same as {red}°). Amplitude B = {B} mm. {kind}',
    s3hint: 'What to try: leave P on the centre line (Δr = 0) and drag φ from 0° to 180°. The centre line turns from the brightest reinforcing line into a still line; the whole map slides smoothly and the two sets of lines swap places. At 360° it is back where it started. The readout adds the two parts of δ.',

    s4k: 'Step 4 · Different frequencies',
    s4t: 'If the two sources tap at slightly different rates, is the map still steady?',
    s4e: 'The question here: what does a fixed pattern actually require? Let S₂ tap f₂/f₁ times as often as S₁ (its <strong>frequency</strong>, taps per second). The phase difference is no longer constant: it grows by 360°×(f₂ − f₁) every second. So each point’s amplitude swells and shrinks, the reinforcing and still lines sweep across the water, and the map is no longer fixed. At P, loud and quiet alternate once every 1 ÷ |f₂ − f₁| seconds: these are <strong>beats</strong> (<a class="xlink" href="../../../physics/waves/sound-waves/#step2">→ Sound waves, step 2: why two nearly equal pitches swell and fade</a>). The graph shows the last 20 s at P; watch the outer envelope bulge and pinch.',
    ratioS: 'Frequency ratio f₂ / f₁',
    c4title: 'From above: amplitude at each point right now (bright = large)', c4btitle: 'y at P (mm), last 20 s',
    s4lgEnv: 'Envelope ±2A·|cos(Δ/2)|',
    s4stable: 'f₂ = f₁: the phase difference does not change with time, the map is fixed and P’s amplitude stays at {B} mm.',
    s4beat: 'f₂ − f₁ = {df} Hz: the phase difference grows by {dps}° each second, so P’s amplitude swings between 0 and 2 mm, repeating every {Tb} s; right now it is {B} mm. The reinforcing lines sweep across the water at the same rhythm.',
    s4hint: 'What to try: with the ratio at 1.00 the bright bands in the top-down view stay put. Drag it to 1.05: the bands start to sweep slowly across the water, and in the graph P’s motion becomes a string of swelling “packets”, 20 s each. The closer the ratio to 1, the longer the packets; the further apart, the faster the map changes until the eye sees only a jumble.',

    s5k: 'Step 5 · Measuring λ with interference',
    s5t: 'Measuring only the spacing of the bands, can you work out the wavelength?',
    s5e: 'The question here: how does an interference pattern become a ruler for wavelength? Put a row of detectors along a line L = {L} cm from the sources (the dashed line in the top-down view); the amplitude graph plots the amplitude along it. The centre is the Δr = 0 reinforcing point; the next one out has |Δr| = λ. When L is much larger than d and that point is not far from the centre line, it sits at roughly x₁ ≈ λ·L ÷ d. Turn it round: measure x₁, d and L and you can estimate λ ≈ x₁·d ÷ L. The <a class="xlink" href="../../../physics/modern/double-slit/#step0">double-slit experiment</a> measures the wavelength of light this way; there L is tens of thousands of times d, so the estimate is excellent.',
    c5title: 'From above: amplitude map and detector line', c5btitle: 'Amplitude B along the detector line (mm) against x (cm)',
    s5lgExact: 'Actual reinforcing points (solved)', s5lgApprox: 'Estimate m·λL/d',
    s5readout: 'The first reinforcing point is actually at x₁ = {x1} cm; the estimate gives {xa} cm. Working back from x₁: λ ≈ {est} cm against the true λ = {lam} cm, off by {err}%. {note}',
    s5none: 'd = {d} cm is not more than λ = {lam} cm: only the central reinforcing line exists between the sources, so there is no first point to measure.',
    s5good: 'Within 5% — the estimate is usable.', s5bad: 'Well off: the point is too far from the centre line (a large angle), or L is not large enough compared with d.',
    s5hint: 'What to try: in the amplitude graph the vertical lines (actual) and triangles (estimate) nearly coincide near the centre and drift apart further out. Then hold d and make λ smaller: the first reinforcing point moves toward the centre, the angle shrinks, and so does the error in the readout. Changing d cuts both ways: a larger d shrinks the angle, but then L is no longer much larger than d.',

    s6k: 'Step 6 · Self-test and wrap-up',
    s6t: 'Three questions, settled by path and phase difference',
    q1: '① Two in-step sources, λ = 2 cm. A point has path difference Δr = 3 cm. What is it?',
    q1a: 'A reinforcing point', q1b: 'A still point', q1c: 'Somewhere in between',
    q2: '② A still point with Δr = λ/2: if the wavelength is halved (sources unmoved), what does it become?',
    q2a: 'Still a still point', q2b: 'A reinforcing point', q2c: 'Can’t tell',
    q3: '③ S₂ starts 180° late. What happens on the centre line (Δr = 0)? Do any waves reach it?',
    q3a: 'Reinforcement; both waves arrive', q3b: 'Stillness, because no wave arrives', q3c: 'Stillness; both waves arrive but cancel',
    check: 'Check answers',
    fb1ok: '① Right: Δr = 3 cm = 1.5λ, a whole number plus a half, so the waves arrive out of step and the point never moves.', fb1no: '① Not quite: how many wavelengths is 3 cm? Whole numbers reinforce, halves cancel.',
    fb2ok: '② Right: Δr has not changed, but measured in the new wavelength it goes from 0.5 to 1 wavelength — the still point becomes a reinforcing one.', fb2no: '② Not quite: Δr is a distance and does not change with λ. How many new wavelengths fit into it?',
    fb3ok: '③ Right: Δr = 0 but the 180° late start makes δ = 180°. Both waves arrive with equal size, exactly out of step, and add to zero.', fb3no: '③ Not quite: at a still point each wave on its own is still moving (the two thin lines in step 1); they cancel only once added.',
    fbNone: 'Pick an option first.',
    s6fin: 'The thread. <strong>Step 0</strong>: every point a wave passes rises and falls like a sine, starting later the further it is from the source. <strong>Step 1</strong>: two waves simply add at a point; a whole number of wavelengths of path difference reinforces, a half-odd number cancels. <strong>Step 2</strong>: the amplitude depends on the path difference only, not on time, so loud and still form a fixed map of hyperbolas. <strong>Step 3</strong>: what really counts is the arrival phase difference δ = 360°·Δr/λ + φ. <strong>Step 4</strong>: with different frequencies the phase difference drifts and the map moves. <strong>Step 5</strong>: band spacing lets you work back to the wavelength.',
    formula: 'y = y₁ + y₂\nδ = 360°·Δr/λ + φ\nB = 2A·|cos(δ/2)|',
    boundary: 'Scope: this page assumes both waves have the same amplitude that does not fade with distance, that the water obeys superposition exactly, and that the sources are points. Real water waves weaken with distance, so the two waves usually arrive with different sizes and a “still” point only nearly stops rather than exactly. For legibility the period is slowed to 1 s; the light and dark in the top-down views are computed point by point from the model, not filmed. The estimate in step 5 is accurate only when L is much larger than d and the angle is small.',
    linksTitle: 'Where to go next',
    lk1: '→ Standing waves, step 0: two waves running head-on — why the waveform stops',
    lk2: '→ Double-slit experiment, step 0: what sets the spacing of light and dark fringes',
    lk3: '→ Sound waves, step 2: two close frequencies add up to beats',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Interference · A Pattern of Loud and Still”.'
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
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n, window.PAGE_PARAMS || {}); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml, window.PAGE_PARAMS || {}); });
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
