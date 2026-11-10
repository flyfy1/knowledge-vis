'use strict';
// Double-slit lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '双缝实验 · 条纹是一颗一颗攒出来的',
    back: '← 知识索引',
    compare: '对照另一版本：双缝实验 · 一颗一颗的粒子，也走出干涉条纹 →',
    navLabel: '双缝实验步骤导航',
    tagline: '让光或电子穿过两条靠得很近的窄缝，屏上会出现明暗相间的条纹。七步里你先用「两条路差多少」算出条纹在哪、间距多大，再把粒子一颗一颗发出去，看条纹怎样从随机的落点里长出来；最后看为什么一旦知道粒子走了哪条缝，条纹就会变淡，以及为什么棒球永远拍不出条纹。',
    nav0: '0 路程差', nav1: '1 条纹间距', nav2: '2 缝宽与包络', nav3: '3 一颗一颗', nav4: '4 走哪条缝', nav5: '5 物质波', nav6: '6 收束',

    s0k: '第 0 步 · 亮还是暗',
    s0t: '屏上的某一点，凭什么亮、凭什么暗？',
    s0e: '这一步要回答：屏上一点 P 是亮还是暗，由什么决定？同一束激光照到两条极窄的缝 S₁、S₂ 上，两条缝就像两个步调完全一致的波源。从它们出发的波分别走过距离 r₁、r₂ 到达 P，两段距离之差叫<strong>路程差</strong> Δ = r₂ − r₁。如果 Δ 是波长 λ 的整数倍，两列波到达时波峰对波峰，叠起来振幅加倍，P 处亮（<strong>相长</strong>）；如果 Δ 是半个波长的奇数倍，波峰对波谷，正好抵消，P 处暗（<strong>相消</strong>）。人眼和探测器感受的是<strong>光强</strong>（正比于振幅的平方），两列等幅波叠加后的相对亮度是 cos²(πΔ/λ)：1 为最亮，0 为全黑。本步设定：红色激光 λ = 650 nm，缝距 d = 0.25 mm，缝到屏的距离 L = 1.00 m（<a class="xlink" href="../../../physics/waves/interference/#step1">→ 干涉页第 1 步：两个波源相遇，加强还是抵消只看路程差</a>）。',
    yP: 'P 点在屏上的位置 y（mm）',
    sweep0: '扫一遍屏幕', clear0: '清除轨迹',
    c0geo: '示意图（缝距已放大）；屏幕右侧画 P 点的亮度',
    c0wave: '到达 P 的两列波与它们的和（横轴：时间，单位为周期）',
    s0lg1: '来自 S₁ 的波', s0lg2: '来自 S₂ 的波', s0lgSum: '两者之和', s0lgTrail: '走过的位置留下的亮度点',
    s0readout: '{prog}P 在 y = {y} mm：Δ = r₂ − r₁ = {dnm} nm = {dl} 个波长（相位差 {deg}°），相对亮度 cos²(πΔ/λ) = {I}。{verdict}',
    s0prog: '已扫过屏幕 {pct}%。',
    verdictBright: 'Δ 接近整数个波长：亮纹。', verdictDark: 'Δ 接近半波长的奇数倍：暗纹。', verdictMid: '介于两者之间：半明半暗。',
    s0hint: '观察顺序：从 y = 0 开始慢慢向一侧拖 P，盯住下方两条波：橙色波相对青色波每错开半个周期，白色的和就被压平、右侧的亮度点落到 0；错开满一个周期，两者又对齐、重新变亮。右侧留下的点连起来就是屏上的亮度分布；按「扫一遍屏幕」可以自动描完整条。',

    s1k: '第 1 步 · 条纹有多密',
    s1t: '相邻两条亮纹相距多远，由谁决定？',
    s1e: '这一步要回答：相邻亮纹之间的距离——<strong>条纹间距</strong> Δy——由哪几个量决定？上一步看到，从中央亮纹走到下一条亮纹，路程差 Δ 正好多出一个波长 λ。屏离得很远（L 远大于 d 和 y）时，Δ ≈ d·y/L；令 d·Δy/L = λ，得到 <strong>Δy ≈ λL/d</strong>：波长越长、屏越远，条纹越疏；缝距越大，条纹越密。下图上方是屏幕上看到的样子（颜色按波长近似着色，亮度 = 相对亮度），下方是亮度曲线，横轴是屏上位置；灰色虚线是默认设置（650 nm、0.25 mm、1 m）留作对照。本步仍把缝看作极窄。',
    lam1: '波长 λ（nm）', d1: '缝距 d（mm）', L1: '缝到屏 L（m）', reset1: '回到默认设置',
    c1strip: '屏幕上看到的条纹', c1curve: '相对亮度 − 屏上位置 y（mm）',
    s1lgNow: '当前设置', s1lgGhost: '默认设置（对照）', s1lgDy: 'Δy：中央亮纹到下一条亮纹',
    s1readout: '实测间距（由精确的路程差 Δ = λ 求出）Δy = {meas} mm；公式 λL/d = {approx} mm，两者相差 {rel}%。和默认设置比：λ ×{kl}、L ×{kL}、d ×{kd}，于是 Δy ×{ky}（= λ 的倍数 × L 的倍数 ÷ d 的倍数）。',
    s1hint: '观察顺序：每次只动一个滑杆。把 λ 从 650 拖到 400 nm，条纹变密、颜色变蓝；把 L 加倍，间距跟着加倍；把 d 加倍，间距减半。对一对读数里的倍数：Δy 的倍数总等于 λ 的倍数乘 L 的倍数、再除以 d 的倍数。',

    s2k: '第 2 步 · 缝有宽度',
    s2t: '为什么条纹越往外越暗，有的亮纹干脆消失？',
    s2e: '这一步要回答：真实的缝有宽度 a，它怎样改变屏上的图样？有宽度的一条缝本身就会把光散开：缝内各点发出的波互相叠加，形成中间宽、两边弱的<strong>单缝衍射</strong>图样。它的相对亮度是 sinc²(πa·sinθ/λ)，其中 sinc(x) = sin x / x，θ 是从缝看向 P 偏离中线的角度（sinθ ≈ y/L）；它第一次降到 0 的位置在 y ≈ λL/a。双缝条纹整体被这条曲线罩住，所以叫<strong>包络</strong>：总亮度 = 包络 × 双缝条纹。缝越窄，包络越宽。如果某条亮纹恰好（或几乎）落在包络的零点上，它就被抹掉，叫<strong>缺级</strong>。设定：λ = 650 nm、L = 1.00 m。',
    a2: '缝宽 a（µm）', d2: '缝距 d（mm）',
    c2strip: '屏幕上看到的条纹', c2curve: '相对亮度 − 屏上位置 y（mm）',
    s2lgI: '总亮度 = 包络 × 双缝条纹', s2lgEnv: '包络（单缝衍射）', s2lgZero: '包络第一个零点',
    s2readout: '包络第一个零点在 y = ±{y0} mm（≈ λL/a）。d/a = {r}，中央包络里能看到 {n} 条亮纹（级次 m 指这条亮纹处路程差含几个 λ；只有 |m| < d/a、且没被包络零点吞掉的级次才算）。{miss}',
    s2missing: '第 ±{m} 级亮纹几乎正落在包络零点上，被抹掉（缺级）。',
    s2hint: '观察顺序：先固定 d = 0.25 mm，把 a 从 20 µm 慢慢加到 200 µm：橙色虚线包络收窄，中央包络里的亮纹越来越少。再固定 a 改 d：条纹变密变疏，包络却一动不动——包络只由 a 决定，条纹间距只由 d 决定。试试 a = 50 µm、d = 0.25 mm，看第 ±5 级亮纹消失。',

    s3k: '第 3 步 · 一次一颗',
    s3t: '粒子一颗一颗地飞过去，条纹还在吗？',
    s3e: '这一步要回答：把光调得极弱，让光子（或电子）一次只飞过一颗，屏上会怎样？每颗粒子在探测屏上只留下<strong>一个点</strong>，落在哪里事先无法知道；但上一步的亮度曲线给出了它落在各处的<strong>概率分布</strong>：某处越亮，粒子落在那里的机会越大，暗纹处几乎为零。这里的落点是按这条曲线随机抽样得到的（设定：λ = 650 nm、d = 0.25 mm、a = 50 µm、L = 1 m，屏幕只截取 ±14 mm，屏外的不计），演示的是量子力学的预言本身，不模拟探测器如何「看见」粒子（<a class="xlink" href="../../../physics/modern/quantum-basics/#step1">→ 量子基础页第 1 步：测量是按概率抽取一个结果</a>）。真实实验里，1909 年 G. I. Taylor 用极弱的光、1989 年外村彰团队用一次一个的电子，都看到条纹由这样的点逐渐攒出。',
    fire1: '发射 1 颗', fire10: '发射 10 颗', fire100: '发射 100 颗', fire1000: '发射 1000 颗', reset3: '清屏',
    c3screen: '探测屏：每个点是一颗粒子的落点', c3hist: '落点统计：每 0.2 mm 一格的颗数',
    s3lgHit: '落点', s3lgNew: '最新的落点', s3lgBar: '每格颗数', s3lgTheory: '按亮度曲线预期的颗数',
    s3readout: '{prog}已到达 {n} 颗。落在暗纹区（亮度不到峰值 5% 的地方，占屏幕宽度 {w}%）的有 {k} 颗，占 {s}%；按亮度曲线预期是 {e}%。',
    s3prog: '正在发射：{c}/{N}。',
    s3empty: '还没有粒子到达。先按「发射 1 颗」，看第一个点落在哪。',
    s3hint: '观察顺序：先按几次「发射 1 颗」——每次只多一个点（带圈的那个），位置看不出规律；再按「发射 100 颗」「发射 1000 颗」，看下方直方图逐渐贴近橙色预期曲线。暗纹区占了屏幕四成多的宽度，却只收到约 2% 的粒子。',
    quizPrompt: '只发射一颗粒子时，屏上会出现什么？',
    quizA: '一整套很淡的条纹', quizB: '一个点，落在哪里是随机的，但更可能落在亮纹处', quizC: '一个点，总落在正中央',
    check: '核对', correct: '对。一颗粒子只给出一个落点；条纹是大量落点的统计分布，正中央只是概率最高的地方之一。', wrong: '再看看：每按一次「发射 1 颗」，屏上只多出一个点，而且每次位置都不同。',

    s4k: '第 4 步 · 知道走哪条缝',
    s4t: '如果设法知道粒子走了哪条缝，条纹会怎样？',
    s4e: '这一步要回答：路径信息和条纹之间有什么关系？设想缝后有个装置，粒子经过时会在它身上留下「记号」。用<strong>可区分度</strong> D 衡量这个记号能在多大程度上告诉你路径：D = 0 完全不知道，D = 1 确定知道；按记号去猜，猜对的概率是 (1 + D)/2。条纹的明暗反差用<strong>对比度</strong>（也叫可见度）V = (I最大 − I最小)/(I最大 + I最小) 衡量：1 表示暗纹全黑，0 表示没有条纹。理想情况下 V = √(1 − D²)，即 V² + D² = 1：路径信息拿得越多，条纹越淡；D = 1 时屏上只剩两条单缝图样之和（<a class="xlink" href="../../../physics/modern/quantum-basics/#step2">→ 量子基础页第 2 步：相位让两种可能相加或抵消</a>）。设定：λ = 650 nm、d = 0.25 mm、L = 1 m，缝宽 a = 20 µm（窄缝，包络在 ±8 mm 内只从 1 缓降到约 0.8）。上方的点是用同一组随机数、按当前曲线抽出的 1500 个落点。',
    D4: '路径可区分度 D',
    c4screen: '1500 个落点（按当前曲线抽样）', c4curve: '相对亮度 − 屏上位置 y（mm）',
    s4lgNow: '当前 D 下的亮度', s4lgIdeal: 'D = 0：理想条纹', s4lgSum: 'D = 1：两条单缝之和', s4lgRead: '读对比度用的最亮处与第一暗处',
    s4readout: 'D = {D}：按记号猜路径，猜对的概率 {g}%。从曲线读中央条纹：最亮处 {hi}，旁边第一暗处 {lo}，对比度 V = {vm}；公式 √(1 − D²) = {vf}；V² + D² = {sum}。',
    s4hint: '观察顺序：从 D = 0 往右拖，盯住上方的点：暗纹里的点越来越多，条纹慢慢糊掉；下方白线从贴着灰色虚线（理想条纹）变成贴着橙色虚线（两条单缝之和）。注意 D = 0.5 时 V 仍有 0.87：一点路径信息只让条纹略淡，D 要接近 1，条纹才几乎消失。',

    s5k: '第 5 步 · 物质也是波',
    s5t: '电子能干涉，为什么棒球不能？',
    s5e: '这一步要回答：既然电子会干涉，飞过门口的棒球为什么从不出条纹？德布罗意提出：动量为 p 的任何粒子都对应一个波长 <strong>λ = h/p</strong>（<strong>德布罗意波长</strong>），h = 6.626×10⁻³⁴ J·s 是普朗克常数，动量 p 约等于质量 m × 速度 v（速度接近光速时再乘相对论因子 γ，本页已计入）。把各种东西送进同一台想象中的双缝装置（缝距 d = 1 µm、屏距 L = 1 m），条纹间距 Δy = λL/d。下面的标尺是<strong>对数刻度</strong>：每往右一大格，长度大 10 倍。电子（1961 年）、中子（1988 年）和 C₆₀ 足球烯分子（1999 年）都已在实验中测到干涉条纹。',
    obj_electron: '电子', obj_neutron: '中子', obj_c60: 'C₆₀ 分子', obj_dust: '1 µm 尘粒', obj_baseball: '棒球',
    speed5: '速度：典型值 ×10^k，k =',
    c5: '长度标尺（米，对数刻度）',
    ref_proton: '质子', ref_atom: '原子', ref_light: '可见光波长', ref_hair: '头发丝',
    markLam: 'λ', markDy: 'Δy',
    s5lgLam: '德布罗意波长 λ', s5lgDy: '条纹间距 Δy', s5lgHist: '看过的其他物体的 λ',
    s5readout: '{obj}：m = {m} kg，v = {v} m/s → λ = {lam} m；条纹间距 Δy = {dy} m，是原子直径（约 0.1 nm）的 {ratio}。{verdict}',
    ratioTimes: '{x} 倍', ratioFrac: '{x} 分之一',
    verdictSee: '间距在微米以上，探测器分得清。', verdictHard: '间距比 1 µm 小，要分辨得把缝做得更密、屏放得更远。', verdictNever: '间距比原子还小，没有任何尺子分辨得出：条纹在原理上存在，实际上永远看不到。',
    s5hint: '观察顺序：依次点五种物体，看青色 λ 标记从原子尺度一路滑到比质子还小 10¹⁸ 倍以上的地方；再选「棒球」把速度拖到最慢——λ 只变大 10 倍，在 36 个数量级的标尺上几乎不动。看过的物体会留下灰色刻痕。',

    s6k: '第 6 步 · 收束',
    s6t: '把双缝实验收成三句话',
    s6fin: '<strong>一、亮暗只看路程差。</strong>Δ 为整数个波长时亮、半波长奇数倍时暗；条纹间距 Δy ≈ λL/d，缝宽 a 决定包络，零点在 λL/a。<br><strong>二、条纹是概率分布。</strong>单个粒子只留下一个随机的点，大量落点按亮度曲线堆出条纹。<br><strong>三、路径信息与条纹此消彼长。</strong>理想情况下 V² + D² = 1；任何有动量的东西都有波长 λ = h/p，但宏观物体的条纹小到永远量不出。',
    formula: 'Δy ≈ λL/d　　包络零点 ≈ λL/a\nV = √(1 − D²)　　λ = h/p',
    boundary: '适用范围：远场、单色、相干光源的理想模型；缝内照明均匀；没有考虑光源大小、波长展宽和探测器分辨率（它们也会让条纹变淡）。第 3、4 步的落点是按理论曲线抽样，不是探测过程的模拟。V² + D² = 1 只在理想情况下取等号，一般只有 V² + D² ≤ 1。',
    linksTitle: '接着去看',
    lk1: '→ 干涉页第 1 步：两个波源相遇，路程差决定加强还是抵消',
    lk2: '→ 量子基础页第 2 步：相位让两种可能相加或抵消',
    lk3: '→ 光电效应页第 1 步：光一份一份地交出能量',
    lk4: '→ 量子隧穿页第 0 步：同一套波动描述让粒子穿过势垒',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《双缝实验 · 一颗一颗的粒子，也走出干涉条纹》的平行版本。'
  },
  en: {
    pageTitle: 'The Double-Slit Experiment · Fringes, One Particle at a Time',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Double-Slit Experiment · Single Particles Still Build Fringes →',
    navLabel: 'Double-slit steps',
    tagline: 'Send light or electrons through two closely spaced slits and a pattern of bright and dark bands appears on the screen. Over seven steps you will work out where the bands sit and how far apart they are from one idea, the difference between two paths. Then you will fire particles one at a time and watch the bands grow out of random dots, see why learning which slit each particle took washes the bands out, and find out why a baseball can never make any.',
    nav0: '0 Path difference', nav1: '1 Spacing', nav2: '2 Slit width', nav3: '3 One at a time', nav4: '4 Which slit', nav5: '5 Matter waves', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Bright or dark',
    s0t: 'What makes one spot on the screen bright and another dark?',
    s0e: 'This step asks: what decides whether a point P on the screen is bright or dark? One laser beam lights two very narrow slits, S₁ and S₂, so the slits act like two sources vibrating in perfect step. Their waves travel distances r₁ and r₂ to reach P; the difference is the <strong>path difference</strong> Δ = r₂ − r₁. If Δ is a whole number of wavelengths λ, the waves arrive crest on crest and the amplitude doubles: P is bright (<strong>constructive</strong> interference). If Δ is an odd number of half wavelengths, crest meets trough and they cancel: P is dark (<strong>destructive</strong>). Eyes and detectors respond to <strong>intensity</strong>, which goes as the amplitude squared, so the relative brightness of two equal waves is cos²(πΔ/λ): 1 is fully bright, 0 fully dark. Setup for this step: a red laser with λ = 650 nm, slit spacing d = 0.25 mm, slits to screen L = 1.00 m (<a class="xlink" href="../../../physics/waves/interference/#step1">→ Interference, step 1: when two sources meet, only the path difference decides</a>).',
    yP: 'Position of P on the screen, y (mm)',
    sweep0: 'Sweep the screen', clear0: 'Clear trail',
    c0geo: 'Sketch, slits enlarged; brightness at P on the right',
    c0wave: 'Waves arriving at P and their sum (time in periods)',
    s0lg1: 'wave from S₁', s0lg2: 'wave from S₂', s0lgSum: 'their sum', s0lgTrail: 'brightness left at visited positions',
    s0readout: '{prog}P at y = {y} mm: Δ = r₂ − r₁ = {dnm} nm = {dl} wavelengths (phase difference {deg}°), relative brightness cos²(πΔ/λ) = {I}. {verdict}',
    s0prog: '{pct}% of the screen swept. ',
    verdictBright: 'Δ is close to a whole number of wavelengths: a bright band.', verdictDark: 'Δ is close to an odd number of half wavelengths: a dark band.', verdictMid: 'Somewhere in between: partly bright.',
    s0hint: 'What to try: start at y = 0 and drag P slowly to one side while watching the two waves below. Each time the orange wave slips half a period behind the cyan one, the white sum flattens and the brightness dot on the right drops to 0; after a full period they line up again and the spot is bright. The dots left on the right trace the brightness across the screen; “Sweep the screen” draws the whole curve for you.',

    s1k: 'Step 1 · How close are the bands?',
    s1t: 'What sets the distance between neighbouring bright bands?',
    s1e: 'This step asks: which quantities set the <strong>fringe spacing</strong> Δy, the distance from one bright band to the next? Step 0 showed that going from the central bright band to the next one adds exactly one wavelength λ to the path difference. With a distant screen (L much larger than d and y), Δ ≈ d·y/L; setting d·Δy/L = λ gives <strong>Δy ≈ λL/d</strong>. Longer waves and a farther screen spread the bands out; wider slit spacing packs them together. The strip at the top is what the screen looks like (tinted by wavelength, brightness = relative brightness); below it is the brightness curve against position on the screen. The grey dashed curve is the default setup (650 nm, 0.25 mm, 1 m) for comparison. The slits are still treated as very narrow.',
    lam1: 'Wavelength λ (nm)', d1: 'Slit spacing d (mm)', L1: 'Slits to screen L (m)', reset1: 'Back to defaults',
    c1strip: 'What the screen shows', c1curve: 'Relative brightness vs position y (mm)',
    s1lgNow: 'current setup', s1lgGhost: 'default setup (reference)', s1lgDy: 'Δy: central band to the next bright band',
    s1readout: 'Measured spacing (solved from the exact path difference Δ = λ) Δy = {meas} mm; the formula λL/d gives {approx} mm, a difference of {rel}%. Against the defaults: λ ×{kl}, L ×{kL}, d ×{kd}, so Δy ×{ky} (= λ factor × L factor ÷ d factor).',
    s1hint: 'What to try: move one slider at a time. Drag λ from 650 down to 400 nm and the bands crowd together and turn blue; double L and the spacing doubles; double d and it halves. Check the factors in the readout: the Δy factor always equals the λ factor times the L factor, divided by the d factor.',

    s2k: 'Step 2 · Slits have width',
    s2t: 'Why do the bands fade further out, and why do some vanish?',
    s2e: 'This step asks: real slits have a width a; how does that change the pattern? A single slit of finite width spreads light by itself: waves from different points across the opening add up to a <strong>single-slit diffraction</strong> pattern, broad in the middle and weak at the sides. Its relative brightness is sinc²(πa·sinθ/λ), where sinc(x) = sin x / x and θ is the angle from the slit to P measured from the centre line (sinθ ≈ y/L). It first falls to zero at y ≈ λL/a. The two-slit bands sit underneath this curve, so it is called the <strong>envelope</strong>: total brightness = envelope × two-slit bands. Narrower slits give a wider envelope. A bright band that lands on (or right next to) a zero of the envelope is wiped out, a <strong>missing order</strong>. Setup: λ = 650 nm, L = 1.00 m.',
    a2: 'Slit width a (µm)', d2: 'Slit spacing d (mm)',
    c2strip: 'What the screen shows', c2curve: 'Relative brightness vs position y (mm)',
    s2lgI: 'total = envelope × two-slit bands', s2lgEnv: 'envelope (single-slit diffraction)', s2lgZero: 'first zero of the envelope',
    s2readout: 'The envelope first reaches zero at y = ±{y0} mm (≈ λL/a). d/a = {r}, and {n} bright bands are visible inside the central envelope (the order m counts how many wavelengths the path difference holds at a band; only orders with |m| < d/a that the envelope zero has not swallowed count). {miss}',
    s2missing: 'Order ±{m} lands almost exactly on the envelope zero and is wiped out (a missing order).',
    s2hint: 'What to try: hold d at 0.25 mm and raise a slowly from 20 µm to 200 µm. The orange dashed envelope narrows and fewer bands fit inside it. Then hold a and change d: the bands crowd or spread, but the envelope does not move. The envelope depends only on a; the spacing depends only on d. Try a = 50 µm with d = 0.25 mm and watch order ±5 disappear.',

    s3k: 'Step 3 · One at a time',
    s3t: 'If particles go through one by one, are the bands still there?',
    s3e: 'This step asks: turn the light down so far that photons (or electrons) pass one at a time. What does the screen show? Each particle leaves just <strong>one dot</strong> on the detector, and where it lands cannot be predicted in advance. The brightness curve from step 2 is the <strong>probability distribution</strong> of where it lands: the brighter a place, the more likely a particle ends up there, and the dark bands get almost none. Here the landing points are drawn at random from that curve (setup: λ = 650 nm, d = 0.25 mm, a = 50 µm, L = 1 m; only ±14 mm of screen is kept and anything outside is ignored). So this shows the quantum prediction itself, not a model of how a detector registers a particle (<a class="xlink" href="../../../physics/modern/quantum-basics/#step1">→ Quantum basics, step 1: a measurement samples one outcome by probability</a>). Real experiments saw exactly this build-up: G. I. Taylor with extremely faint light in 1909, and Akira Tonomura’s team with electrons sent one at a time in 1989.',
    fire1: 'Fire 1', fire10: 'Fire 10', fire100: 'Fire 100', fire1000: 'Fire 1000', reset3: 'Clear screen',
    c3screen: 'Detector screen: each dot is where one particle landed', c3hist: 'Hit counts in 0.2 mm bins',
    s3lgHit: 'landing point', s3lgNew: 'latest landing point', s3lgBar: 'hits per bin', s3lgTheory: 'counts expected from the brightness curve',
    s3readout: '{prog}{n} particles so far. In the dark bands (below 5% of peak brightness, {w}% of the screen width): {k} hits, {s}% of the total; the brightness curve predicts {e}%.',
    s3prog: 'Firing: {c}/{N}. ',
    s3empty: 'No particles yet. Press “Fire 1” and see where the first one lands.',
    s3hint: 'What to try: press “Fire 1” a few times. Each press adds a single dot (the circled one), and the positions show no obvious pattern. Then use “Fire 100” and “Fire 1000” and watch the histogram settle onto the orange expected curve. The dark bands cover more than 40% of the screen yet collect only about 2% of the particles.',
    quizPrompt: 'If you fire a single particle, what appears on the screen?',
    quizA: 'A complete but very faint set of bands', quizB: 'One dot at a random place, more likely in a bright band', quizC: 'One dot, always at the centre',
    check: 'Check', correct: 'Right. One particle gives one landing point; the bands are the statistics of many landing points, and the centre is just one of the most likely spots.', wrong: 'Look again: each “Fire 1” adds exactly one dot, and it lands somewhere different every time.',

    s4k: 'Step 4 · Which slit?',
    s4t: 'What happens to the bands if you find out which slit a particle used?',
    s4e: 'This step asks: how are path information and the bands related? Imagine a device behind the slits on which a passing particle leaves a mark. The <strong>distinguishability</strong> D measures how much that mark tells you about the path: D = 0 means nothing, D = 1 means you know for certain; guessing from the mark, you are right with probability (1 + D)/2. The strength of the bands is measured by the <strong>visibility</strong> V = (I_max − I_min)/(I_max + I_min): 1 means the dark bands are fully black, 0 means there are no bands at all. In the ideal case V = √(1 − D²), so V² + D² = 1. The more path information you collect, the fainter the bands; at D = 1 only the sum of two single-slit patterns is left (<a class="xlink" href="../../../physics/modern/quantum-basics/#step2">→ Quantum basics, step 2: phase lets two possibilities add or cancel</a>). Setup: λ = 650 nm, d = 0.25 mm, L = 1 m, slit width a = 20 µm (narrow, so within ±8 mm the envelope only eases from 1 down to about 0.8). The dots at the top are 1500 landing points drawn from the current curve with the same set of random numbers.',
    D4: 'Path distinguishability D',
    c4screen: '1500 landing points drawn from the current curve', c4curve: 'Relative brightness vs position y (mm)',
    s4lgNow: 'brightness at the current D', s4lgIdeal: 'D = 0: ideal bands', s4lgSum: 'D = 1: sum of two single slits', s4lgRead: 'brightest point and first dark spot used for V',
    s4readout: 'D = {D}: guessing the path from the mark is right {g}% of the time. Reading the central band off the curve: brightest {hi}, first dark spot beside it {lo}, visibility V = {vm}; the formula √(1 − D²) gives {vf}; V² + D² = {sum}.',
    s4hint: 'What to try: drag D up from 0 and watch the dots at the top. More and more land in the dark bands and the pattern blurs; the white curve below moves from the grey dashed ideal bands onto the orange dashed sum of two single slits. Note that at D = 0.5 the visibility is still 0.87: a little path information only dims the bands, and D has to get close to 1 before they nearly vanish.',

    s5k: 'Step 5 · Matter is a wave too',
    s5t: 'Electrons interfere. Why not baseballs?',
    s5e: 'This step asks: if electrons interfere, why does a baseball flying through a doorway never show bands? De Broglie proposed that anything with momentum p has a wavelength <strong>λ = h/p</strong>, its <strong>de Broglie wavelength</strong>. Here h = 6.626×10⁻³⁴ J·s is Planck’s constant and the momentum p is roughly mass m × speed v (near the speed of light it picks up the relativistic factor γ, which this page includes). Send everything through the same imagined double slit (spacing d = 1 µm, screen L = 1 m), so the fringe spacing is Δy = λL/d. The ruler below uses a <strong>logarithmic scale</strong>: each major division to the right is 10 times longer. Electrons (1961), neutrons (1988) and C₆₀ buckyball molecules (1999) have all produced interference bands in real experiments.',
    obj_electron: 'Electron', obj_neutron: 'Neutron', obj_c60: 'C₆₀ molecule', obj_dust: '1 µm dust grain', obj_baseball: 'Baseball',
    speed5: 'Speed: typical value ×10^k, k =',
    c5: 'Length ruler (metres, log scale)',
    ref_proton: 'proton', ref_atom: 'atom', ref_light: 'visible light λ', ref_hair: 'hair',
    markLam: 'λ', markDy: 'Δy',
    s5lgLam: 'de Broglie wavelength λ', s5lgDy: 'fringe spacing Δy', s5lgHist: 'λ of other objects you looked at',
    s5readout: '{obj}: m = {m} kg, v = {v} m/s → λ = {lam} m; fringe spacing Δy = {dy} m, which is {ratio} the width of an atom (about 0.1 nm). {verdict}',
    ratioTimes: '{x} times', ratioFrac: '1/{x} of',
    verdictSee: 'A spacing above a micrometre: a detector can resolve it.', verdictHard: 'Below 1 µm: resolving it needs a finer grating or a farther screen.', verdictNever: 'Smaller than an atom, so no ruler could ever resolve it. The bands exist in principle and will never be seen.',
    s5hint: 'What to try: click through the five objects and watch the cyan λ marker slide from atomic sizes down to more than 10¹⁸ times smaller than a proton. Then pick the baseball and drag its speed to the minimum: λ grows only tenfold and barely moves on a ruler spanning 36 powers of ten. Objects you have viewed leave grey tick marks.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'The double slit in three sentences',
    s6fin: '<strong>1. Bright or dark depends only on the path difference.</strong> A whole number of wavelengths gives a bright band, an odd number of half wavelengths a dark one; the spacing is Δy ≈ λL/d, and the slit width a sets an envelope whose first zero is at λL/a.<br><strong>2. The bands are a probability distribution.</strong> One particle leaves one random dot; many dots pile up along the brightness curve.<br><strong>3. Path information and bands trade off.</strong> Ideally V² + D² = 1. Anything with momentum has a wavelength λ = h/p, but for everyday objects the bands are far too fine to ever measure.',
    formula: 'Δy ≈ λL/d　　envelope zero ≈ λL/a\nV = √(1 − D²)　　λ = h/p',
    boundary: 'Where this holds: an idealised far-field model with a single-wavelength, coherent source and evenly lit slits. Source size, wavelength spread and detector resolution are left out (each of them also dims the bands). The dots in steps 3 and 4 are sampled from the theoretical curve, not simulated detections. V² + D² = 1 holds with equality only in the ideal case; in general V² + D² ≤ 1.',
    linksTitle: 'Where to go next',
    lk1: '→ Interference, step 1: when two sources meet, the path difference decides',
    lk2: '→ Quantum basics, step 2: phase lets two possibilities add or cancel',
    lk3: '→ Photoelectric effect, step 1: light hands over energy in single photons',
    lk4: '→ Quantum tunnelling, step 0: the same wave description lets particles cross a barrier',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Double-Slit Experiment · Single Particles Still Build Fringes”.'
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
  if (typeof window.refreshDoubleSlit === 'function') window.refreshDoubleSlit();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.DSLIT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
