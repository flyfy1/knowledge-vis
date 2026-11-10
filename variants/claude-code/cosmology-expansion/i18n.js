'use strict';
// Cosmic expansion lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '宇宙膨胀 · 每一段距离都按同一比例变长',
    back: '← 知识索引',
    compare: '对照另一版本：宇宙膨胀 · 空间本身在变大 →',
    navLabel: '宇宙膨胀步骤导航',
    tagline: '天文学家看到：越远的星系，光谱越往红端移，而且退得越快。这不是所有星系从某个中心炸开，而是星系之间的距离都在按同一个比例变长。七步里你会从这一句话出发，推出哈勃定律，在带噪声的模拟数据里量出 H₀，看光波怎样被拉长成红移，算出宇宙的年龄，最后分清「离我们多远」到底有几种说法。',
    nav0: '0 尺度因子', nav1: '1 哈勃定律', nav2: '2 量出 H₀', nav3: '3 红移', nav4: '4 膨胀史', nav5: '5 三种距离', nav6: '6 收束',

    s0k: '第 0 步 · 一个比例',
    s0t: '如果所有距离都乘上同一个数，站在哪个星系上看，景象会不同吗？',
    s0e: '这一步要回答：「宇宙在膨胀」具体是什么意思，膨胀有没有中心？在大尺度上（几亿光年以上），宇宙各处看起来差不多，各个方向也差不多（<strong>均匀、各向同性</strong>）。在这样的宇宙里，膨胀只能有一种样子：任意两个星系之间的距离都乘上同一个随时间变化的数 a(t)，叫<strong>尺度因子</strong>，约定今天 a = 1。把每个星系今天的位置记作 χ（读作 kai，叫<strong>共动坐标</strong>，像印在气球表面的格点，膨胀时不变），某时刻两星系的实际距离就是 <strong>d = a · χ</strong>。距离单位 Mpc（百万秒差距，约 326 万光年）。下图总把你选的「参照星系」放在中央：空心圈是 a = 1 时的位置，实心点是当前 a 下的位置。',
    aSlider: '尺度因子 a', homeBtn: '换一个参照星系', homeTip: '也可以直接点图中的星系',
    c0a: '以参照星系为中心（空心圈：a = 1 时的位置）',
    s0lgHome: '参照星系', s0lgMarked: '标记的星系 A、B、C', s0lgNow: '当前位置', s0lgRef: 'a = 1 时的位置',
    s0readout: '参照星系 ({home})，a 从 1 变到 {a}：到 A {dA1} → {dA} Mpc，到 B {dB1} → {dB} Mpc，到 C {dC1} → {dC} Mpc。三段距离都 ×{a}，与方向、远近无关。',
    s0hint: '观察顺序：先拖 a，看所有星系从中央的参照星系向外散开（a < 1 时向内收拢），每个实心点都沿着从中央出发的直线离开自己的空心圈。再按「换一个参照星系」或直接点另一个星系：画面换了中心，看到的还是同一种「所有星系都在远离我」的景象，三段距离的倍数仍然都是 a。所以膨胀没有中心，每个星系都可以说自己在中心。图中只画了一块区域；格点向四面八方无限延伸，没有边。',

    s1k: '第 1 步 · 速度',
    s1t: '距离都按同一比例变长，为什么越远的星系退得越快？',
    s1e: '这一步要回答：从 d = a · χ 出发，星系的退行速度和距离有什么关系？χ 不变，只有 a 在变，所以速度 v = dd/dt = (da/dt) · χ = (da/dt ÷ a) · d。括号里的量对所有星系都相同，记作 <strong>H = (da/dt)/a</strong>，叫<strong>哈勃参数</strong>，它今天的值记作 H₀（<strong>哈勃常数</strong>）。于是 <strong>v = H₀ · d</strong>：退行速度与距离成正比，这就是<strong>哈勃定律</strong>。道理和第 0 步一样：每段距离每秒都增加同样的百分比，原本长的那段增加的绝对量就多。H₀ 的单位是 km/s/Mpc：距离每多 1 Mpc，退行速度多几 km/s。观测值约 67–73，本页用 70。1/H₀ 有时间的量纲，叫<strong>哈勃时间</strong>：H₀ = 70 时约 140 亿年。',
    H0: '哈勃常数 H₀（km/s/Mpc）',
    c1a: '从参照星系看到的退行速度（箭头长度 ∝ 速度）', c1b: '退行速度 v（km/s）随距离 d（Mpc）',
    s1lgHome: '参照星系', s1lgArrow: '速度箭头', s1lgPts: '视野内的每个星系', s1lgLine: 'v = H₀ · d',
    s1readout: '参照星系 ({home})，H₀ = {H}：A 在 {dA} Mpc，退行 {vA} km/s；B 在 {dB} Mpc，退行 {vB} km/s；C 在 {dC} Mpc，退行 {vC} km/s。三者的 v ÷ d 都是 {H} km/s/Mpc。哈勃时间 1/H₀ = {tH} Gyr（十亿年）。',
    s1hint: '观察顺序：先看上图：箭头都从中央向外，越远的箭头越长。下图把视野内每个星系画成一个点，横轴是距离、纵轴是速度，所有点都落在过原点的一条直线上，斜率就是 H₀。拖 H₀，箭头整体变长或变短，直线变陡或变平。再换参照星系：上图换了中心，下图的点几乎原样落在同一条线上。',

    s2k: '第 2 步 · 真实的数据',
    s2t: '星系还有自己的乱动，怎样从数据里量出 H₀？',
    s2e: '这一步要回答：真实星系除了随膨胀退行，还有被周围引力拉着的<strong>本动速度</strong>（典型几百 km/s，方向随机），量到的速度 = H₀·d + 本动。只看近处几个星系能量准 H₀ 吗？这里用<strong>模拟数据</strong>：真值 H₀ = 70，40 个星系的距离在 2 Mpc 到「最远距离」之间均匀分布，本动速度取均值 0、标准差 300 km/s 的随机数（假设距离量得完全准）。用<strong>过原点的最小二乘</strong>求斜率：H = Σ(v·d) ÷ Σ(d²)，即找一条过原点、让各点竖直偏差的平方和最小的直线（<a class="xlink" href="../../../probability/statistics/regression-correlation/#step1">→ 回归与相关第 1 步：最小二乘怎样定出一条线</a>）。本动只有几百 km/s，而退行速度随距离增大，所以样本越远，本动占的比例越小。',
    dmax: '样本最远距离（Mpc）', reroll2: '换一组模拟数据', clear2: '清除记录',
    c2a: '哈勃图：量到的速度 v（km/s）随距离 d（Mpc）', c2b: '拟合出的 H₀ 随样本最远距离（Mpc）',
    s2lgPts: '模拟星系', s2lgTrue: '真值 v = 70d', s2lgFit: '拟合直线', s2lgBand: '预计误差范围（±1σ）', s2lgHist: '你量过的结果',
    s2readout: '第 {s}/6 组 · 最远 {dmax} Mpc：拟合 H₀ = {h} km/s/Mpc（真值 70，偏差 {e}%）。在 {dmax} Mpc 处退行速度是 {vmax} km/s，300 km/s 的本动只占 {pct}%；预计误差约 ±{sig} km/s/Mpc。',
    s2hint: '观察顺序：先把最远距离放在 10 Mpc，看上图的点散得厉害，橙色拟合线和虚线（真值）分得开；按几次「换一组模拟数据」，下图在同一横坐标上留下几个散开的点。再把最远距离拖到 200 Mpc 以上重复：点贴紧直线，下图的点收进很窄的带子里。在本页 6 组模拟里，最远 20 Mpc 时偏差最大达 6%，最远 200 Mpc 时都在 1% 以内。这就是天文学家要用很远的星系（再配合可靠的距离测量）定 H₀ 的原因。',

    s3k: '第 3 步 · 红移',
    s3t: '光在膨胀的空间里走了几十亿年，到达时波长变成了多少？',
    s3e: '这一步要回答：远方星系的光为什么偏红，偏多少？光在路上时，空间仍在膨胀，光波的波峰之间的距离也像星系间的距离一样，跟着 a 一起变长。所以从尺度因子 a发 时发出、今天（a = 1）收到的光，波长被拉长为 <strong>λ收 = λ发 ÷ a发</strong>。天文学家用<strong>红移</strong> z 描述拉长了多少：<strong>1 + z = λ收 ÷ λ发 = 1 ÷ a发</strong>。z = 1 表示光发出时宇宙里的距离只有今天的一半。这和第 1 步的速度无关：红移只记录光在路上空间被拉长了几倍，不是光源「跑开」引起的多普勒效应（<a class="xlink" href="../../../physics/waves/doppler-effect/#step1">→ 多普勒效应第 1 步：运动的波源怎样挤密、拉疏波前</a>）。只在 z 远小于 1 时，cz 才近似等于退行速度。',
    aEmit: '光发出时的尺度因子 a发', play3: '看光一路走来',
    c3a: '路上的一段光（竖线：共动格点）', c3b: '氢 Hα 谱线位置（nm，对数坐标）',
    s3lgWave: '光波（此刻）', s3lgStart: '刚发出时', s3lgRest: '静止波长 656.3 nm', s3lgObs: '此刻的波长', s3lgVis: '可见光 380–750 nm',
    s3readout: 'a发 = {ae} → 1 + z = {opz}，z = {z}。氢 Hα 线 656.3 nm，到达时 {lobs} nm{vis}。按 Ωm = 0.3 的模型（第 4 步），这束光在路上走了 {tl} Gyr。若硬套 v = cz，会得到 {cz}c；z 不小时这个式子没有意义。',
    s3prog: '光在路上：此刻 a = {a}，波长已拉长到 {l} nm · ',
    visIn: '，仍是可见光', visOut: '，已在红外，人眼看不见',
    s3hint: '观察顺序：先把 a发 放在 0.5，按「看光一路走来」：竖线（共动格点）一路拉开，波峰的间距跟着同比例变大，淡色是刚发出时的样子；下图粉色竖线从 656 nm 走到 1313 nm。再把 a发 拖到 0.1：z = 9，波长拉长 10 倍。下图横轴是对数刻度，波长每乘同一个倍数，粉色竖线就移同样的距离。',

    s4k: '第 4 步 · 膨胀史',
    s4t: '膨胀一直是同样快吗？宇宙有多大年纪？',
    s4e: '这一步要回答：a(t) 是怎样随时间变的？宇宙的年龄是多少？膨胀速率由宇宙里装的东西决定，这条关系叫<strong>弗里德曼方程</strong>：<strong>H² = H₀² · (Ωm / a³ + ΩΛ)</strong>。Ωm 是今天物质（含暗物质）占总能量密度的份额，物质被摊薄，密度按 1/a³ 下降；ΩΛ 是<strong>暗能量</strong>（这里取最简单的宇宙学常数）的份额，它的密度不随膨胀变。本页假设空间是平的，所以 Ωm + ΩΛ = 1；观测约为 0.3 和 0.7，忽略辐射。物质的引力让膨胀<strong>减速</strong>，暗能量让它<strong>加速</strong>：两者之比随 a 变化，所以早期减速、后来加速，转折点在 Ωm/a³ = 2ΩΛ 处。从 a = 0（大爆炸）积分到 a = 1，就得到<strong>宇宙年龄</strong>。',
    Om: '物质份额 Ωm（ΩΛ = 1 − Ωm）',
    c4a: '尺度因子 a 随宇宙时间（Gyr，从大爆炸算起）', c4b: '膨胀速率 da/dt（每 Gyr）',
    s4lgCurve: '当前 Ωm', s4lgOld: '试过的 Ωm', s4lgNow: '今天（a = 1）', s4lgAcc: '由减速转为加速',
    s4readout: 'Ωm = {Om}，ΩΛ = {OL}：宇宙年龄 {age} Gyr，是哈勃时间 1/H₀ = {tH} Gyr 的 {ratio} 倍。减速参数 q₀ = {q0}（负值表示今天在加速）。{acc}',
    s4acc: '在 a = {a}（z = {z}，大爆炸后 {t} Gyr）由减速转为加速。', s4accFuture: '要到 a = {a}（今天之后）才开始加速。', s4accNever: '没有暗能量，膨胀一直在减速。',
    s4hint: '观察顺序：先看 Ωm = 0.3：上图曲线开始时很陡，然后弯下来（减速），后来又翘起来（加速）；下图的膨胀速率曲线先降后升：下降表示减速、上升表示加速，绿点是谷底，也就是转折点。再把 Ωm 拖到 1（没有暗能量）：曲线一直弯向下，年龄缩短到 1/H₀ 的 2/3 ≈ 9.3 Gyr，比已知最老的恒星还年轻，这正是暗能量被认真对待的理由之一。拖 Ωm 时淡色线保留之前的曲线；各条线在 a = 1 时斜率相同（都等于 H₀），只是「今天」落在不同的年龄上。',

    s5k: '第 5 步 · 三种距离',
    s5t: '说一个星系「离我们 X 亿光年」，指的是哪一种距离？',
    s5e: '这一步要回答：光在路上走的时候空间在变大，那么「星系离我们多远」有几种答案？以红移 z 的星系为例（Ωm = 0.3，H₀ = 70）。<strong>光行距离</strong>：光在路上走了多少年，就记作多少光年（等于回看时间乘光速），常见于新闻报道。<strong>共动距离</strong>：此刻、也就是今天，星系与我们之间的实际间隔，χ = c·∫dz / H(z)；光走过的每一小段在它身后都被继续拉长，所以它比光行距离大。<strong>发出时的距离</strong>：光发出那一刻星系离我们多远，等于 χ ÷ (1 + z)。另外，今天的退行速度 v = H₀ · χ 在 χ 超过 c/H₀（<strong>哈勃距离</strong>，约 140 亿光年）时大于光速。这不违反相对论：没有任何东西在本地超过身边的光，是空间在变大。',
    zSlider: '红移 z',
    c5a: '距离（Gly，十亿光年）随红移 z',
    s5lgCo: '共动距离（今天的间隔）', s5lgLt: '光行距离（光走了多久）', s5lgEm: '发出时的距离', s5lgH: '哈勃距离 c/H₀',
    s5readout: 'z = {z}：光走了 {lt} Gyr，光行距离 {lt} Gly；今天它离我们 {co} Gly（共动距离）；光发出时它只离我们 {em} Gly。今天它的退行速度是 {v}c{vNote}。',
    s5vNote: '，超过光速，但它在本地并没有追过任何光',
    s5hint: '观察顺序：从 z = 0 往右拖：起初三条线几乎重合（近处空间来不及变大多少）；到 z = 1 时，今天的距离 10.8 Gly 已是光行距离 7.7 Gly 的约 1.4 倍。继续拖：绿色的「发出时的距离」在 z ≈ 1.6 处最大，约 5.7 Gly，之后反而变小。更远的星系，光发出时离我们更近，只是那时空间本身小，光又要逆着膨胀走很久。z = 1.46 以外，今天的退行速度超过光速。',

    s6k: '第 6 步 · 收束', s6t: '一个比例 a(t)，推出全部观测',
    s6fin: '回顾这条链。<strong>第 0 步</strong>：均匀膨胀就是所有距离乘同一个 a(t)，没有中心。<strong>第 1 步</strong>：由此直接推出 v = H₀d，H₀ = (da/dt)/a。<strong>第 2 步</strong>：本动速度让近处的测量很乱，样本越远，H₀ 量得越准。<strong>第 3 步</strong>：光波跟着空间拉长，1 + z = 1/a发。<strong>第 4 步</strong>：物质让膨胀减速、暗能量让它加速，Ωm = 0.3 时宇宙年龄约 13.5 Gyr。<strong>第 5 步</strong>：光行距离、今天的距离、发出时的距离是三件不同的事。',
    formula: 'd = a · χ\nv = H₀ · d,  H = (da/dt)/a\n1 + z = 1 / a发\nH² = H₀² (Ωm/a³ + ΩΛ)',
    boundary: '适用范围：本页的宇宙是均匀、各向同性、空间平直的，只含物质和宇宙学常数，忽略辐射（它在 z ≤ 10 范围内对距离和年龄的影响小于 0.1%）。星系、恒星、原子靠自身引力或电磁力束缚，不随膨胀变大；膨胀只体现在星系团以上的尺度。第 2 步是模拟数据，假设距离量得完全准；真实测量还要面对距离误差，目前不同方法给出的 H₀（约 67 与约 73）仍不一致。参数取整数 H₀ = 70、Ωm = 0.3，用来讲道理，不是最新的精确拟合值。',
    linksTitle: '接着去哪',
    lk1: '→ 多普勒效应第 1 步：运动的波源怎样挤密、拉疏波前（与宇宙学红移对比）',
    lk2: '→ 回归与相关第 1 步：最小二乘怎样定出一条线',
    lk3: '→ 引力透镜第 2 步：用宇宙学距离算出爱因斯坦环的大小',
    lk4: '→ 相对论第 0 步：光速对所有观察者相同意味着什么',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《宇宙膨胀 · 空间本身在变大》的平行版本。'
  },
  en: {
    pageTitle: 'Cosmic Expansion · Every Distance Stretching by the Same Factor',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Cosmic Expansion · Space Itself Gets Larger →',
    navLabel: 'Cosmic expansion steps',
    tagline: 'Astronomers see that the farther away a galaxy is, the more its spectrum is shifted to the red and the faster it recedes. That is not galaxies flying out from some centre; it is every distance between galaxies growing by the same factor. Over seven steps you will start from that one sentence, derive Hubble’s law, measure H₀ from noisy simulated data, watch light waves stretch into redshift, work out the age of the universe, and finally sort out how many different things “how far away” can mean.',
    nav0: '0 Scale factor', nav1: '1 Hubble’s law', nav2: '2 Measuring H₀', nav3: '3 Redshift', nav4: '4 Expansion history', nav5: '5 Three distances', nav6: '6 Wrap-up',

    s0k: 'Step 0 · One factor',
    s0t: 'If every distance is multiplied by the same number, does the view depend on which galaxy you stand on?',
    s0e: 'This step asks: what exactly does “the universe is expanding” mean, and does the expansion have a centre? On large scales (hundreds of millions of light-years and up) the universe looks much the same everywhere and in every direction (<strong>homogeneous and isotropic</strong>). In such a universe expansion can take only one form: the distance between any two galaxies is multiplied by the same time-dependent number a(t), the <strong>scale factor</strong>, with a = 1 today by convention. Label each galaxy by its position today, χ (“chi”), its <strong>comoving coordinate</strong>, like a grid printed on a balloon that does not change as the balloon inflates. The actual distance between two galaxies at any moment is then <strong>d = a · χ</strong>. Distances are in Mpc (megaparsecs, about 3.26 million light-years). The map always keeps your chosen “home” galaxy at the centre: open rings are positions at a = 1, filled dots are positions at the current a.',
    aSlider: 'Scale factor a', homeBtn: 'Pick another home galaxy', homeTip: 'or click a galaxy on the map',
    c0a: 'Centred on the home galaxy (rings: positions at a = 1)',
    s0lgHome: 'home galaxy', s0lgMarked: 'marked galaxies A, B, C', s0lgNow: 'current position', s0lgRef: 'position at a = 1',
    s0readout: 'Home galaxy ({home}), a from 1 to {a}: to A {dA1} → {dA} Mpc, to B {dB1} → {dB} Mpc, to C {dC1} → {dC} Mpc. All three distances scale by {a}, whatever their direction or length.',
    s0hint: 'What to try: drag a and watch every galaxy spread out from the home galaxy at the centre (or close in for a < 1); each filled dot leaves its ring along a straight line from the centre. Then press “Pick another home galaxy” or click a different galaxy: the map recentres, yet the view is the same “everyone is moving away from me”, and all three distances still scale by a. Expansion has no centre; every galaxy can claim to be at the middle. The map shows only a patch; the lattice goes on forever in every direction, with no edge.',

    s1k: 'Step 1 · Speed',
    s1t: 'If every distance grows by the same factor, why do farther galaxies recede faster?',
    s1e: 'This step asks: starting from d = a · χ, how is a galaxy’s recession speed related to its distance? χ stays fixed and only a changes, so the speed is v = dd/dt = (da/dt) · χ = (da/dt ÷ a) · d. The bracketed quantity is the same for every galaxy; call it <strong>H = (da/dt)/a</strong>, the <strong>Hubble parameter</strong>, and its value today H₀, the <strong>Hubble constant</strong>. So <strong>v = H₀ · d</strong>: recession speed is proportional to distance. That is <strong>Hubble’s law</strong>. The reason is step 0 again: every distance grows by the same percentage each second, so a longer distance gains more in absolute terms. H₀ is measured in km/s/Mpc: for each extra Mpc of distance, the speed goes up by that many km/s. Measured values sit around 67–73; this page uses 70. 1/H₀ has units of time and is called the <strong>Hubble time</strong>, about 14 billion years for H₀ = 70.',
    H0: 'Hubble constant H₀ (km/s/Mpc)',
    c1a: 'Recession seen from the home galaxy (arrow length ∝ speed)', c1b: 'Recession speed v (km/s) vs distance d (Mpc)',
    s1lgHome: 'home galaxy', s1lgArrow: 'velocity arrows', s1lgPts: 'every galaxy in view', s1lgLine: 'v = H₀ · d',
    s1readout: 'Home galaxy ({home}), H₀ = {H}: A at {dA} Mpc recedes at {vA} km/s; B at {dB} Mpc at {vB} km/s; C at {dC} Mpc at {vC} km/s. For all three, v ÷ d = {H} km/s/Mpc. Hubble time 1/H₀ = {tH} Gyr (billion years).',
    s1hint: 'What to try: in the upper map every arrow points away from the centre, and the farther galaxies carry longer arrows. The lower chart plots each galaxy in view as a point, distance across and speed up: they all sit on one straight line through the origin, whose slope is H₀. Drag H₀ and the arrows grow or shrink together while the line tilts. Then switch home galaxy: the map recentres and the points in the lower chart land on the very same line.',

    s2k: 'Step 2 · Real data',
    s2t: 'Galaxies also jostle on their own; how do you pull H₀ out of the data?',
    s2e: 'This step asks: besides riding the expansion, real galaxies are tugged around by their neighbours’ gravity, giving them <strong>peculiar velocities</strong> of typically a few hundred km/s in random directions. The measured speed is H₀·d plus that peculiar motion. Can a handful of nearby galaxies pin down H₀? This is <strong>simulated data</strong>: true H₀ = 70, 40 galaxies spread evenly in distance from 2 Mpc out to the “farthest distance”, peculiar velocities drawn at random with mean 0 and standard deviation 300 km/s (and distances assumed exact). The slope comes from <strong>least squares through the origin</strong>, H = Σ(v·d) ÷ Σ(d²): the line through the origin that minimises the sum of squared vertical misses (<a class="xlink" href="../../../probability/statistics/regression-correlation/#step1">→ Regression and correlation, step 1: how least squares picks a line</a>). Peculiar motions stay at a few hundred km/s while recession grows with distance, so the farther the sample reaches, the smaller their share.',
    dmax: 'Farthest distance in the sample (Mpc)', reroll2: 'New simulated sample', clear2: 'Clear results',
    c2a: 'Hubble diagram: measured speed v (km/s) vs distance d (Mpc)', c2b: 'Fitted H₀ vs farthest distance in the sample (Mpc)',
    s2lgPts: 'simulated galaxies', s2lgTrue: 'truth v = 70d', s2lgFit: 'fitted line', s2lgBand: 'expected error (±1σ)', s2lgHist: 'your measurements',
    s2readout: 'Sample {s}/6 · out to {dmax} Mpc: fitted H₀ = {h} km/s/Mpc (truth 70, off by {e}%). At {dmax} Mpc the recession speed is {vmax} km/s, so 300 km/s of peculiar motion is only {pct}% of it; expected error about ±{sig} km/s/Mpc.',
    s2hint: 'What to try: set the farthest distance to 10 Mpc. The points scatter wildly and the orange fit pulls away from the dashed truth; press “New simulated sample” a few times and the lower chart collects scattered results at that distance. Then drag the farthest distance past 200 Mpc and repeat: the points hug the line and the results crowd into a narrow band. Across this page’s six samples, the error reaches 6% at 20 Mpc but stays under 1% at 200 Mpc. That is why astronomers anchor H₀ on distant galaxies (together with reliable distance measurements).',

    s3k: 'Step 3 · Redshift',
    s3t: 'Light that has crossed expanding space for billions of years: what wavelength does it arrive with?',
    s3e: 'This step asks: why is light from distant galaxies reddened, and by how much? While light is on its way, space keeps expanding, and the spacing between wave crests stretches along with a, just like the distances between galaxies. So light emitted when the scale factor was a_emit and received today (a = 1) arrives stretched: <strong>λ_obs = λ_emit ÷ a_emit</strong>. Astronomers measure the stretch with the <strong>redshift</strong> z: <strong>1 + z = λ_obs ÷ λ_emit = 1 ÷ a_emit</strong>. z = 1 means distances in the universe were half today’s when the light set out. This has nothing to do with the speeds in step 1: redshift records how many times space stretched while the light was in transit, not a Doppler shift from a source running away (<a class="xlink" href="../../../physics/waves/doppler-effect/#step1">→ Doppler effect, step 1: how a moving source bunches and spreads its wavefronts</a>). Only for z much smaller than 1 is cz roughly the recession speed.',
    aEmit: 'Scale factor when the light left, a_emit', play3: 'Follow the light home',
    c3a: 'Light in transit (ticks: comoving grid)', c3b: 'Hα line position (nm, log scale)',
    s3lgWave: 'light wave (now)', s3lgStart: 'as emitted', s3lgRest: 'rest wavelength 656.3 nm', s3lgObs: 'current wavelength', s3lgVis: 'visible light 380–750 nm',
    s3readout: 'a_emit = {ae} → 1 + z = {opz}, z = {z}. The hydrogen-alpha line at 656.3 nm arrives at {lobs} nm{vis}. In the Ωm = 0.3 model (step 4) this light spent {tl} Gyr in transit. Forcing v = cz would give {cz}c, a formula that stops meaning anything once z is not small.',
    s3prog: 'Light in transit: a = {a} now, wavelength already {l} nm · ',
    visIn: ', still visible', visOut: ', now infrared and invisible to the eye',
    s3hint: 'What to try: set a_emit to 0.5 and press “Follow the light home”. The comoving ticks spread apart and the crest spacing grows in proportion; the faint wave shows it as emitted. In the lower chart the pink line travels from 656 nm to 1313 nm. Then drag a_emit to 0.1: z = 9 and the wavelength grows tenfold. The lower axis is logarithmic, so multiplying the wavelength by the same factor always moves the pink line the same distance.',

    s4k: 'Step 4 · Expansion history',
    s4t: 'Has the expansion always run at the same pace? How old is the universe?',
    s4e: 'This step asks: how does a(t) change with time, and what is the age of the universe? The expansion rate is set by what the universe contains, through the <strong>Friedmann equation</strong>: <strong>H² = H₀² · (Ωm / a³ + ΩΛ)</strong>. Ωm is today’s share of the total energy density in matter (dark matter included); matter thins out, so its density falls as 1/a³. ΩΛ is the share of <strong>dark energy</strong> (here the simplest version, a cosmological constant), whose density stays fixed as space grows. The page assumes flat space, so Ωm + ΩΛ = 1; observations give about 0.3 and 0.7, and radiation is neglected. Matter’s gravity <strong>slows</strong> the expansion and dark energy <strong>speeds it up</strong>. Their ratio changes with a, so the universe decelerates early and accelerates later, switching where Ωm/a³ = 2ΩΛ. Integrating from a = 0 (the Big Bang) to a = 1 gives the <strong>age of the universe</strong>.',
    Om: 'Matter share Ωm (ΩΛ = 1 − Ωm)',
    c4a: 'Scale factor a vs cosmic time (Gyr since the Big Bang)', c4b: 'Expansion rate da/dt (per Gyr)',
    s4lgCurve: 'current Ωm', s4lgOld: 'Ωm values you tried', s4lgNow: 'today (a = 1)', s4lgAcc: 'switch from slowing to speeding up',
    s4readout: 'Ωm = {Om}, ΩΛ = {OL}: the universe is {age} Gyr old, {ratio} × the Hubble time 1/H₀ = {tH} Gyr. Deceleration parameter q₀ = {q0} (negative means accelerating today). {acc}',
    s4acc: 'The switch to acceleration came at a = {a} (z = {z}, {t} Gyr after the Big Bang).', s4accFuture: 'Acceleration only begins at a = {a}, in the future.', s4accNever: 'With no dark energy, the expansion slows forever.',
    s4hint: 'What to try: start at Ωm = 0.3. The upper curve rises steeply at first, bends over (slowing) and later curls up again (speeding up); the lower rate curve falls and then rises (falling means slowing, rising means speeding up), with the green dot at its minimum, the switch-over. Now drag Ωm to 1 (no dark energy): the curve keeps bending down and the age drops to 2/3 of 1/H₀, about 9.3 Gyr, younger than the oldest known stars, which is one reason dark energy is taken seriously. Faint lines keep earlier curves; at a = 1 they all share the same slope (H₀), but “today” lands at a different age for each.',

    s5k: 'Step 5 · Three distances',
    s5t: 'When a galaxy is said to be “X billion light-years away”, which distance is meant?',
    s5e: 'This step asks: since space grows while the light is travelling, how many answers are there to “how far away is that galaxy”? Take a galaxy at redshift z (Ωm = 0.3, H₀ = 70). The <strong>light-travel distance</strong> counts how many years the light was on its way and calls it that many light-years (lookback time times the speed of light); news stories usually quote this one. The <strong>comoving distance</strong> is the actual separation now, today: χ = c·∫dz / H(z). Every stretch the light has crossed keeps growing behind it, so this is larger than the light-travel distance. The <strong>distance at emission</strong> is how far the galaxy was when the light left, χ ÷ (1 + z). Finally, today’s recession speed v = H₀ · χ exceeds the speed of light once χ passes c/H₀ (the <strong>Hubble distance</strong>, about 14 billion light-years). Relativity is safe: nothing overtakes the light right next to it; space itself is growing.',
    zSlider: 'Redshift z',
    c5a: 'Distance (Gly, billion light-years) vs redshift z',
    s5lgCo: 'comoving (separation today)', s5lgLt: 'light-travel (time in transit)', s5lgEm: 'distance at emission', s5lgH: 'Hubble distance c/H₀',
    s5readout: 'z = {z}: the light travelled for {lt} Gyr, a light-travel distance of {lt} Gly; today the galaxy is {co} Gly away (comoving distance); when the light left it was only {em} Gly away. Its recession speed today is {v}c{vNote}.',
    s5vNote: ', faster than light, yet it never overtakes any light locally',
    s5hint: 'What to try: drag z up from 0. At first the three curves almost coincide (nearby, space has had little time to grow). By z = 1, today’s distance of 10.8 Gly is already about 1.4 times the 7.7 Gly light-travel distance. Keep going: the green distance-at-emission peaks near z ≈ 1.6 at about 5.7 Gly and then shrinks. More distant galaxies were closer to us when their light left; space was smaller then, and the light needed a long time to make headway against the expansion. Beyond z = 1.46, today’s recession speed is faster than light.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One factor a(t) explains every observation here',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: uniform expansion multiplies every distance by the same a(t), and has no centre. <strong>Step 1</strong>: that alone gives v = H₀d with H₀ = (da/dt)/a. <strong>Step 2</strong>: peculiar velocities scramble nearby measurements; the farther the sample, the better H₀ is pinned down. <strong>Step 3</strong>: light waves stretch with space, 1 + z = 1/a_emit. <strong>Step 4</strong>: matter slows the expansion and dark energy speeds it up; with Ωm = 0.3 the universe is about 13.5 Gyr old. <strong>Step 5</strong>: light-travel distance, today’s distance and distance at emission are three different things.',
    formula: 'd = a · χ\nv = H₀ · d,  H = (da/dt)/a\n1 + z = 1 / a_emit\nH² = H₀² (Ωm/a³ + ΩΛ)',
    boundary: 'Scope: the universe on this page is homogeneous, isotropic and spatially flat, holding only matter and a cosmological constant; radiation is neglected (for z ≤ 10 it changes distances and ages by less than 0.1%). Galaxies, stars and atoms are held together by their own gravity or electromagnetism and do not grow with the expansion, which shows up only on scales beyond galaxy clusters. Step 2 uses simulated data with exact distances; real measurements also fight distance errors, and different methods still disagree on H₀ (about 67 versus about 73). The round values H₀ = 70 and Ωm = 0.3 are for explanation, not the latest precise fit.',
    linksTitle: 'Where to go next',
    lk1: '→ Doppler effect, step 1: how a moving source bunches and spreads wavefronts (compare with cosmological redshift)',
    lk2: '→ Regression and correlation, step 1: how least squares picks a line',
    lk3: '→ Gravitational lensing, step 2: sizing an Einstein ring with cosmological distances',
    lk4: '→ Relativity, step 0: what a speed of light shared by every observer implies',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Cosmic Expansion · Space Itself Gets Larger”.'
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
