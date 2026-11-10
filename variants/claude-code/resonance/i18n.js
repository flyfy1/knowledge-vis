'use strict';
// Resonance lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '共振 · 每一推都落在节拍上',
    back: '← 知识索引',
    compare: '对照另一版本：共振 · 踩中节拍，小推也能荡高 →',
    navLabel: '共振步骤导航',
    tagline: '推秋千的人都知道：不用使大劲，只要每次都在它荡回来的那一刻推，秋千就越荡越高。这一页用一个弹簧振子把这件事算清楚：它自己的节拍由什么决定，阻力怎样让它停下来，推的节拍对准它自己的节拍时，为什么同样的小推力能攒出大振幅，以及这份振幅最终被什么限制住。',
    nav0: '0 自己的节拍', nav1: '1 阻力', nav2: '2 推一推', nav3: '3 共振曲线', nav4: '4 能量账', nav5: '5 收束',

    s0k: '第 0 步 · 不推它',
    s0t: '不推它，弹簧振子自己按什么节拍振动？',
    s0e: '这一步要回答：放手以后，一个弹簧振子来回一次要多久，由什么决定？光滑水平面上，质量为 m 的物块连着一根弹簧。<strong>劲度系数</strong> k 表示弹簧每伸长 1 m 需要多大的拉力，单位 N/m。把物块拉开 10 cm 再放手，弹力 −kx 总指向平衡位置（x 是离开平衡位置的位移），按牛顿第二定律 ma = −kx（<a class="xlink" href="../../../physics/mechanics/newton-laws/#step0">→ 牛顿定律页第 0 步：力怎样决定加速度</a>），物块就来回振动。来回一次的时间叫<strong>周期</strong> T，每秒振动的次数叫<strong>频率</strong> f = 1/T，单位 Hz。不受阻力、不受外力时的振动频率叫<strong>固有频率</strong> f₀，它只由 m 和 k 决定：T = 2π√(m/k)。下图曲线由数值模拟（每 0.002 s 算一步）得出，周期从曲线上量，再和公式对照。',
    mLabel: '物块质量 m（kg）', kLabel: '劲度系数 k（N/m）', release: '拉开 10 cm 再放手',
    s0lgNow: '这一次的位移 x(t)', s0lgOld: '前几次（对照）', s0lgCross: '向上穿过 0 的时刻',
    cSpring: '俯视：物块与弹簧（x 按比例画）', c0b: '位移 x（cm）随时间 t（s）',
    s0readout: 'm = {m} kg，k = {k} N/m：测得周期 {Tm} s（曲线上相邻两次向上穿过 0 的平均间隔）；公式 2π√(m/k) = {Tf} s；固有频率 f₀ = 1/T = {f} Hz。',
    s0hint: '观察顺序：先按「放手」看一遍，白点标出每次向上穿过 0 的时刻，相邻两点之间就是一个周期。保持 k 不变，把 m 从 1 kg 拖到 4 kg 再放手：灰线是上一次，新曲线明显变慢，周期变成 2 倍（m 变 4 倍，√m 变 2 倍）。再保持 m，把 k 加大：弹簧更硬，振得更快。',

    s1k: '第 1 步 · 加上阻力',
    s1t: '阻力会怎样让振动停下来？',
    s1e: '这一步要回答：真实的振动总会慢慢停下来，阻力怎样改变这个运动？给物块加一个和速度方向相反、大小与速度成正比的阻力 f = −bv。<strong>阻力系数</strong> b 的单位是 N·s/m，越大阻力越强。m = 1 kg、k = 40 N/m 保持不变（固有频率约 1.007 Hz）。阻力每时每刻都在把机械能变成内能，所以振幅一次比一次小，而且每振一次剩下的比例都一样，振幅沿一条指数曲线衰减（虚线，10 cm × e^(−bt/2m)），这叫<strong>阻尼振动</strong>。b 增大到 2√(mk) ≈ {bc} N·s/m（<strong>临界阻尼</strong>）及以上时，物块不再越过平衡位置，只会慢慢回到原处。',
    bLabel: '阻力系数 b（N·s/m）',
    s1lgX: '位移 x(t)', s1lgEnv: '衰减包络 ±10 cm·e^(−bt/2m)', s1lgPeak: '每次的最高点',
    c1b: '位移 x（cm）随时间 t（s），m = 1 kg，k = 40 N/m',
    bCritTag: '（临界）',
    s1readUnder: 'b = {b} N·s/m：每振一次，振幅剩下 {rm}%（量相邻两个最高点）；公式 e^(−bT/2m) 给出 {rf}%。振幅减到一半要 {th} s。',
    s1readFree: 'b = 0：没有阻力，每振一次振幅剩下 {rm}%，一直振下去，不会停。',
    s1readOver: 'b = {b} N·s/m，不小于临界值 {bc}：物块一次也没越过平衡位置（穿过 0 的次数 {n}），只是慢慢回到原处。',
    s1hint: '观察顺序：从 b = 0 开始一格一格往右拖：曲线始终贴着虚线包络，包络越来越陡；读数里「每振一次剩下的百分比」越来越小。注意 b 不超过 1.6 时周期变化不到 1%：阻力主要让振幅变小，几乎不改变节拍（阻力再大，振动会明显变慢）。拖到最后两格（临界和更大）：曲线不再穿过 0。',

    s2k: '第 2 步 · 周期性地推',
    s2t: '用一个来回变化的推力推它，最后能荡多大？',
    s2e: '这一步要回答：周期性地推这个振子，振幅最后稳定在多大，跟推的节拍有什么关系？推力 F = F₀cos(Ωt)，大小 F₀ = 1 N 不变，只改推的频率。用<strong>频率比</strong> r = Ω/ω₀ 表示推的频率是固有频率的几倍，r = 1 就是踩准了它自己的节拍（ω = 2πf 是角频率，比值和 f 的比值一样）。阻力系数 b = 0.4 N·s/m。物块从静止开始被推。开始的一段叫<strong>暂态</strong>：物块自己的振动和被推出来的振动混在一起，振幅忽大忽小；阻力会把它自己的那部分慢慢磨掉（每过 2m/b = 5 s 剩下约 37%）。剩下的是和推力同频率、振幅不再变的振动，叫<strong>稳态</strong>（受迫振动）。作为对照：同样 1 N 的力如果一直静静压着，弹簧只伸长 F₀/k = {xs} cm，叫<strong>静态位移</strong>。',
    rLabel: '频率比 r = Ω/ω₀（推的频率 ÷ 固有频率）', push: '从静止开始推（50 s，5 倍速）', reset: '停止并清除',
    s2lgX: '位移 x(t)', s2lgF: '推力 F(t)', s2lgA: '公式算出的稳态振幅 ±A', s2lgOld: '上一次（对照）',
    c2b: '位移 x（cm）随时间 t（s）',
    s2idle: 'r = {r}：按「从静止开始推」开始模拟。',
    s2run: 'r = {r}：已模拟 {t}/50 s。',
    s2done: 'r = {r}：最后 3 个推力周期里，最大位移 {Am} cm（实测）；公式稳态振幅 A = {Af} cm；是静态位移 {xs} cm 的 {ratio} 倍。{old}',
    s2old: '灰线是上一次 r = {r}，稳态振幅 {A} cm。',
    s2hint: '观察顺序：先保持 r = 0.8 按一次，看开头几秒振幅忽大忽小（暂态），之后贴着虚线稳定下来。再把 r 改成 1.0 按一次：同样 1 N 的推力，振幅一路攒到约 40 cm，是静态位移的 16 倍左右；灰线是上一次，可以直接比较。再试 r = 1.5：推得太快，振幅比静态位移还小。',

    s3k: '第 3 步 · 共振曲线',
    s3t: '推的频率连续变化时，稳态振幅怎样变？阻力又改变了什么？',
    s3e: '这一步要回答：把每个频率比 r 的稳态振幅连起来是什么形状？这条线叫<strong>共振曲线</strong>（<strong>稳态振幅</strong>：暂态消失后的振幅）。理论上 A = F₀ / √((k − mΩ²)² + (bΩ)²)。r 远小于 1 时推得很慢，振幅接近静态位移 2.5 cm；r 远大于 1 时推得太快，物块跟不上，振幅趋近 0；r 接近 1 时 k − mΩ² 几乎为 0，分母只剩阻力那一项，振幅冲到最高，这就是<strong>共振</strong>。峰高大约是静态位移的 Q 倍，Q = mω₀/b 叫<strong>品质因数</strong>：阻力越小，Q 越大，峰越高也越窄。每个点都是把模拟跑到稳态后量出的振幅，曲线是公式。',
    bChoose: '阻力系数 b：', sweep: '从 r = 0.2 扫到 2.0', clearDots: '清除测量点',
    c3: '稳态振幅 A（cm）随频率比 r',
    s3lgCurve: '公式曲线（粗线为当前 b）', s3lgDot: '模拟测得（颜色对应 b）',
    s3readout: '{prog}b = {b} N·s/m，r = {r}：稳态振幅 实测 {Am} cm · 公式 {Af} cm。这条曲线的峰在 r = {pr}，峰高 {pA} cm，是静态位移 2.5 cm 的 {ratio} 倍；Q = mω₀/b = {Q}。峰宽 Δr = {dr}（振幅不低于峰值 0.71 倍的那一段），约等于 1/Q = {iq}。',
    s3progress: '扫描 {c}/{N} · ',
    s3hint: '观察顺序：保持 b = 0.4，拖 r 或按扫描：每个 r 留下一个测量点，点落在曲线上。然后换 b = 0.2，再扫一遍：峰高翻倍、峰宽减半。换 b = 1.6：峰矮而宽，峰的位置也略往左移。远离峰的地方（r < 0.5 或 r > 1.5）几条曲线几乎重合：这里阻力不重要，振幅由弹簧（推得慢）或惯性（推得快）决定。',

    s4k: '第 4 步 · 能量的账',
    s4t: '为什么踩准节拍，同样 1 N 的推力就能攒出大振幅？',
    s4e: '这一步要回答：推力在一个周期里是给物块送能量，还是也在拿走能量？推力的<strong>功率</strong> P = F·v（力乘速度，单位 W，即 J/s）：力和速度同向时 P > 0，推力在给物块送能量；反向时 P < 0，推力反而在拿走能量。「推力 F 与速度 v」图画的是稳态时一个周期内的 F 和 v（各自按最大值缩放到 ±1），「推力的功率」图画的是功率 P，绿色面积是正功，粉色是负功。稳态时，一个周期里推力做的净功正好等于阻力消耗的能量（阻力功率 bv²）。<strong>相位差</strong> φ 表示位移比推力晚多少，晚一个整周期记作 360°。b = 0.4 N·s/m。',
    s4lgF: '推力 F（÷ 1 N）', s4lgV: '速度 v（÷ 最大速度）', s4lgPos: '正功：推力送入能量', s4lgNeg: '负功：推力拿走能量',
    c4a: '一个周期内的推力 F 与速度 v（各自缩放到 ±1）', c4b: '推力的功率 P = F·v（W）',
    s4readout: 'r = {r}：这一周期推力做正功 {Wp} J，负功 {Wn} J，净功 {W} J；阻力消耗 {Wd} J（两者相等）；稳态振幅 {A} cm；位移比推力落后 φ = {phi}°。',
    s4hint: '观察顺序：先把 r 拖到 0.5：「推力 F 与速度 v」图里两条曲线的峰错开约四分之一周期，「推力的功率」图里绿色、粉色面积差不多大，净功很小，振幅也小。慢慢拖到 1.0：F 和 v 的峰对齐，粉色消失，推力每时每刻都在送能量，φ 正好 90°。再拖到 1.5：又出现大片粉色。振幅为什么停在某个值，而不是无限增长？送入的能量大约与振幅 A 成正比，阻力消耗的能量与 A² 成正比，A 长到两者相等时就不再变了。',

    s5k: '第 5 步 · 收束', s5t: '共振：推的节拍对上固有节拍，能量只进不出',
    s5fin: '回头看：<strong>第 0 步</strong>，振子有自己的固有频率，T = 2π√(m/k)，只由质量和劲度系数决定。<strong>第 1 步</strong>，阻力让振幅按固定比例一次次衰减，阻力不大时几乎不改变节拍；阻力大到临界值以上就不再振动。<strong>第 2 步</strong>，周期性推力下先有暂态，阻力磨掉暂态后剩下与推力同频的稳态振动。<strong>第 3 步</strong>，推的频率接近固有频率时稳态振幅最大，峰高约为静态位移的 Q 倍，阻力越小峰越高越窄。<strong>第 4 步</strong>，共振时推力和速度始终同向，推力只送能量不拿能量；振幅涨到送入与耗散相等为止。',
    formula: 'T = 2π√(m/k)\nA = F₀ / √((k − mΩ²)² + (bΩ)²)\nQ = mω₀ / b ≈ 峰高 ÷ 静态位移',
    boundary: '适用范围：本页是单个物块、线性弹簧（拉力与伸长成正比）、阻力与速度成正比的理想模型。真实的桥、楼、乐器有很多个固有频率，振幅大时弹簧也不再线性，那时这里的公式只是近似。峰的位置 r = √(1 − b²/2mk) 只在阻力较小时接近 1。第 1–4 步取 m = 1 kg、k = 40 N/m，第 2–4 步取 F₀ = 1 N。动画是加速播放的（第 2 步 5 倍速），模拟步长 0.002 s。',
    quiz: '把阻力系数从 0.4 N·s/m 减到 0.2 N·s/m，其他不变，共振峰的高度变成原来的几倍？',
    quizA: '约 1.4 倍（√2）', quizB: '约 2 倍', quizC: '约 4 倍',
    check: '核对',
    correct: '对。共振时 k − mΩ² 几乎为 0，振幅约为 F₀/(bω₀)，与 b 成反比。按公式算，峰高之比是 {ratio}。回到第 3 步换 b = 0.2 扫一遍就能看到。',
    wrong: '再想想：共振时分母里只剩阻力那一项 bΩ。b 变成一半，分母变成多少？可以回到第 3 步，对比 b = 0.4 和 b = 0.2 两条曲线的峰高。',
    linksTitle: '接着去哪',
    lk1: '→ 驻波页第 4 步：弦有一串固有频率，推力踩中哪一个，弦就按哪种形状振',
    lk2: '→ 频率响应页第 5 步：同一条共振曲线在电路和信号里叫带通，Q 由带宽反推',
    lk3: '→ 牛顿定律页第 0 步：力怎样决定加速度，本页的模拟每一步都在用它',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《共振 · 踩中节拍，小推也能荡高》的平行版本。'
  },
  en: {
    pageTitle: 'Resonance · Every Push Lands on the Beat',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Resonance · Push in Time and a Small Force Goes a Long Way →',
    navLabel: 'Resonance step navigation',
    tagline: 'Anyone who has pushed a swing knows the trick: you don’t push hard, you push at the moment it comes back, and it goes higher and higher. This page works that out with a block on a spring: what sets its own rhythm, how friction makes it stop, why the same small push builds a big swing when its rhythm matches the spring’s, and what finally caps that swing.',
    nav0: '0 Its own beat', nav1: '1 Damping', nav2: '2 Pushing', nav3: '3 The curve', nav4: '4 Energy', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Hands off',
    s0t: 'Left alone, what rhythm does a block on a spring swing to?',
    s0e: 'This step asks: once you let go, how long does one back-and-forth take, and what decides it? A block of mass m sits on a frictionless surface, attached to a spring. The <strong>spring constant</strong> k is the pull needed to stretch the spring by 1 m, in N/m. Pull the block out 10 cm and let go: the spring force −kx always points back to the rest position (x is the displacement from rest), so by Newton’s second law ma = −kx (<a class="xlink" href="../../../physics/mechanics/newton-laws/#step0">→ Newton’s laws, step 0: how force sets acceleration</a>) and the block swings back and forth. The time for one full swing is the <strong>period</strong> T; the number of swings per second is the <strong>frequency</strong> f = 1/T, in Hz. The frequency it swings at with no friction and no push is its <strong>natural frequency</strong> f₀, and it depends only on m and k: T = 2π√(m/k). The curve below comes from a numerical simulation (one step every 0.002 s); the period is measured off the curve and then compared with the formula.',
    mLabel: 'Block mass m (kg)', kLabel: 'Spring constant k (N/m)', release: 'Pull out 10 cm and let go',
    s0lgNow: 'this run’s displacement x(t)', s0lgOld: 'earlier runs (for comparison)', s0lgCross: 'moments it crosses 0 going up',
    cSpring: 'Top view: block and spring (x drawn to scale)', c0b: 'Displacement x (cm) vs time t (s)',
    s0readout: 'm = {m} kg, k = {k} N/m: measured period {Tm} s (mean gap between upward zero crossings on the curve); formula 2π√(m/k) = {Tf} s; natural frequency f₀ = 1/T = {f} Hz.',
    s0hint: 'What to try: press “let go” once; the white dots mark each upward crossing of 0, and the gap between neighbours is one period. Keep k fixed and drag m from 1 kg to 4 kg, then let go again: the grey line is the previous run, and the new curve is visibly slower, with twice the period (4 times m, twice √m). Then keep m and raise k: a stiffer spring swings faster.',

    s1k: 'Step 1 · Add friction',
    s1t: 'How does friction bring the swinging to a stop?',
    s1e: 'This step asks: real oscillations always die out, so how does friction change the motion? Give the block a drag force opposite to its velocity and proportional to it: f = −bv. The <strong>damping coefficient</strong> b is in N·s/m; bigger means stronger drag. m = 1 kg and k = 40 N/m stay fixed (natural frequency about 1.007 Hz). Drag turns mechanical energy into heat all the time, so each swing is smaller than the last, and each swing keeps the same fraction of the one before. The amplitude therefore shrinks along an exponential curve (dashed, 10 cm × e^(−bt/2m)); this is a <strong>damped oscillation</strong>. Once b reaches 2√(mk) ≈ {bc} N·s/m (<strong>critical damping</strong>) or more, the block never crosses the rest position again; it just creeps back.',
    bLabel: 'Damping coefficient b (N·s/m)',
    s1lgX: 'displacement x(t)', s1lgEnv: 'decay envelope ±10 cm·e^(−bt/2m)', s1lgPeak: 'top of each swing',
    c1b: 'Displacement x (cm) vs time t (s), m = 1 kg, k = 40 N/m',
    bCritTag: ' (critical)',
    s1readUnder: 'b = {b} N·s/m: each swing keeps {rm}% of the previous amplitude (measured between neighbouring tops); the formula e^(−bT/2m) gives {rf}%. The amplitude halves in {th} s.',
    s1readFree: 'b = 0: no friction. Each swing keeps {rm}% of the amplitude, and it never stops.',
    s1readOver: 'b = {b} N·s/m, at or above the critical {bc}: the block never crosses the rest position (zero crossings: {n}); it only creeps back.',
    s1hint: 'What to try: start at b = 0 and drag right one notch at a time. The curve always hugs the dashed envelope, and the envelope gets steeper; the readout’s “kept per swing” keeps falling. Notice that for b up to 1.6 the period changes by less than 1%: friction mainly shrinks the swing, not its rhythm (with much more friction the swinging does slow down noticeably). At the last two notches (critical and beyond) the curve no longer crosses 0.',

    s2k: 'Step 2 · Push it periodically',
    s2t: 'Push it with a force that goes back and forth. How big does the swing end up?',
    s2e: 'This step asks: if you push the spring periodically, how big does the swing settle, and how does that depend on your timing? The push is F = F₀cos(Ωt), with F₀ = 1 N fixed; only its frequency changes. The <strong>frequency ratio</strong> r = Ω/ω₀ says how many times faster than the natural frequency you push, so r = 1 means pushing exactly on its own beat (ω = 2πf is the angular frequency; the ratio is the same as for f). The damping is b = 0.4 N·s/m. The block starts at rest. The first stretch is the <strong>transient</strong>: the block’s own swing and the one the push forces on it are mixed together, and the amplitude wobbles. Friction slowly wears the block’s own part away (every 2m/b = 5 s about 37% of it is left). What remains swings at the push’s frequency with a fixed amplitude: the <strong>steady state</strong> (a forced oscillation). For comparison, the same 1 N pressed steadily would stretch the spring by only F₀/k = {xs} cm, the <strong>static displacement</strong>.',
    rLabel: 'Frequency ratio r = Ω/ω₀ (push frequency ÷ natural frequency)', push: 'Push from rest (50 s at 5× speed)', reset: 'Stop and clear',
    s2lgX: 'displacement x(t)', s2lgF: 'push F(t)', s2lgA: 'steady amplitude ±A from the formula', s2lgOld: 'previous run (for comparison)',
    c2b: 'Displacement x (cm) vs time t (s)',
    s2idle: 'r = {r}: press “push from rest” to run the simulation.',
    s2run: 'r = {r}: simulated {t}/50 s.',
    s2done: 'r = {r}: largest displacement over the last 3 push cycles {Am} cm (measured); formula steady amplitude A = {Af} cm; that is {ratio} times the static displacement of {xs} cm. {old}',
    s2old: 'The grey line is the previous run, r = {r}, steady amplitude {A} cm.',
    s2hint: 'What to try: keep r = 0.8 and press once. For the first few seconds the amplitude wobbles (the transient), then it settles against the dashed lines. Now set r = 1.0 and press again: with the same 1 N push the swing builds to about 40 cm, roughly 16 times the static displacement; the grey line is the previous run, so you can compare directly. Then try r = 1.5: pushing too fast, the swing ends up smaller than the static displacement.',

    s3k: 'Step 3 · The resonance curve',
    s3t: 'As the push frequency changes, how does the steady amplitude change, and what does friction do to it?',
    s3e: 'This step asks: join up the steady amplitude for every frequency ratio r; what shape do you get? That line is the <strong>resonance curve</strong> (<strong>steady amplitude</strong>: the amplitude once the transient has died away). In theory A = F₀ / √((k − mΩ²)² + (bΩ)²). For r well below 1 you push slowly and the swing is close to the static displacement, 2.5 cm. For r well above 1 you push too fast, the block can’t keep up, and the swing shrinks toward 0. Near r = 1, k − mΩ² is almost 0, only the friction term is left in the denominator, and the amplitude shoots up: that is <strong>resonance</strong>. The peak is roughly Q times the static displacement, where Q = mω₀/b is the <strong>quality factor</strong>: less friction, bigger Q, a taller and narrower peak. Every dot is an amplitude measured after running the simulation into its steady state; the curve is the formula.',
    bChoose: 'Damping b:', sweep: 'Sweep r from 0.2 to 2.0', clearDots: 'Clear measured dots',
    c3: 'Steady amplitude A (cm) vs frequency ratio r',
    s3lgCurve: 'formula curves (bold = current b)', s3lgDot: 'simulated (colour = b)',
    s3readout: '{prog}b = {b} N·s/m, r = {r}: steady amplitude measured {Am} cm · formula {Af} cm. This curve peaks at r = {pr} with {pA} cm, {ratio} times the 2.5 cm static displacement; Q = mω₀/b = {Q}. Peak width Δr = {dr} (the stretch where the amplitude is at least 0.71 of the peak), close to 1/Q = {iq}.',
    s3progress: 'sweep {c}/{N} · ',
    s3hint: 'What to try: keep b = 0.4 and drag r or press sweep; each r leaves a measured dot, and the dots land on the curve. Then switch to b = 0.2 and sweep again: the peak doubles in height and halves in width. Switch to b = 1.6: a low, broad peak whose top also slides a little to the left. Far from the peak (r < 0.5 or r > 1.5) the curves almost coincide: there friction hardly matters, and the swing is set by the spring (pushing slowly) or by inertia (pushing fast).',

    s4k: 'Step 4 · The energy books',
    s4t: 'Why does the same 1 N push build a big swing when it is on the beat?',
    s4e: 'This step asks: over one cycle, does the push only feed energy in, or does it take some back too? The push delivers <strong>power</strong> P = F·v (force times velocity, in W, i.e. J/s). When force and velocity point the same way, P > 0 and the push is feeding the block energy; when they point opposite ways, P < 0 and the push is taking energy back. The “push F and velocity v” chart shows F and v over one steady cycle (each scaled to ±1 by its own maximum); the “power of the push” chart shows P, with green area for positive work and pink for negative. In the steady state, the net work done by the push over a cycle exactly equals the energy friction burns (friction’s power is bv²). The <strong>phase lag</strong> φ says how far the displacement trails the push, with one whole cycle counted as 360°. b = 0.4 N·s/m.',
    s4lgF: 'push F (÷ 1 N)', s4lgV: 'velocity v (÷ its maximum)', s4lgPos: 'positive work: energy in', s4lgNeg: 'negative work: energy taken back',
    c4a: 'Push F and velocity v over one cycle (each scaled to ±1)', c4b: 'Power of the push P = F·v (W)',
    s4readout: 'r = {r}: this cycle the push does {Wp} J of positive work and {Wn} J of negative work, {W} J net; friction burns {Wd} J (the same); steady amplitude {A} cm; the displacement trails the push by φ = {phi}°.',
    s4hint: 'What to try: drag r to 0.5. On the “push F and velocity v” chart the peaks are about a quarter cycle apart; on the “power of the push” chart the green and pink areas are almost equal, so the net work and the swing are both small. Drag slowly to 1.0: the peaks of F and v line up, the pink disappears, the push is feeding energy in at every instant, and φ is exactly 90°. Drag on to 1.5 and large pink areas come back. Why does the swing stop growing at some size instead of forever? The energy fed in per cycle grows roughly in proportion to the amplitude A, while the energy friction burns grows as A²; A grows until the two are equal.',

    s5k: 'Step 5 · Wrap-up', s5t: 'Resonance: push on the natural beat and energy only flows in',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: the spring has its own natural frequency, T = 2π√(m/k), set only by the mass and the spring constant. <strong>Step 1</strong>: friction shrinks each swing by the same fraction and, while it is light, barely changes the rhythm; beyond critical damping there is no swinging at all. <strong>Step 2</strong>: under a periodic push there is a transient first, and once friction has worn it away a steady swing at the push’s frequency remains. <strong>Step 3</strong>: the steady swing is largest when the push frequency is near the natural frequency, about Q times the static displacement, and less friction means a taller, narrower peak. <strong>Step 4</strong>: at resonance push and velocity always point the same way, so the push only feeds energy in; the swing grows until what goes in equals what friction burns.',
    formula: 'T = 2π√(m/k)\nA = F₀ / √((k − mΩ²)² + (bΩ)²)\nQ = mω₀ / b ≈ peak ÷ static displacement',
    boundary: 'Scope: this page uses one block, a linear spring (force proportional to stretch) and drag proportional to velocity. Real bridges, buildings and instruments have many natural frequencies, and springs stop being linear at large amplitudes, where these formulas are only approximate. The peak position r = √(1 − b²/2mk) is close to 1 only for light damping. Steps 1–4 use m = 1 kg and k = 40 N/m; steps 2–4 use F₀ = 1 N. The animations are sped up (5× in step 2), and the simulation step is 0.002 s.',
    quiz: 'Cut the damping coefficient from 0.4 N·s/m to 0.2 N·s/m and keep everything else. How many times taller is the resonance peak?',
    quizA: 'about 1.4 times (√2)', quizB: 'about 2 times', quizC: 'about 4 times',
    check: 'Check',
    correct: 'Right. At resonance k − mΩ² is almost 0, so the amplitude is about F₀/(bω₀), inversely proportional to b. From the formula, the ratio of the peak heights is {ratio}. Go back to step 3 and sweep with b = 0.2 to see it.',
    wrong: 'Think again: at resonance only the friction term bΩ is left in the denominator. Halve b, and what happens to the denominator? You can go back to step 3 and compare the peaks for b = 0.4 and b = 0.2.',
    linksTitle: 'Where to go next',
    lk1: '→ Standing waves, step 4: a string has a whole ladder of natural frequencies, and the one you push on sets its shape',
    lk2: '→ Frequency response, step 5: the same resonance curve in circuits and signals is a band-pass, and Q is read off the bandwidth',
    lk3: '→ Newton’s laws, step 0: how force sets acceleration; every step of this page’s simulation uses it',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Resonance · Push in Time and a Small Force Goes a Long Way”.'
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
