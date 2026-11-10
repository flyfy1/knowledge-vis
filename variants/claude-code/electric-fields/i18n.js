'use strict';
// Electric field lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '电场 · 给空间里每一点配一支箭头',
    back: '← 知识索引',
    compare: '对照另一版本：电场 · 看不见的力画成图 →',
    navLabel: '电场步骤导航',
    tagline: '带电的物体隔着空气也能推、拉别的电荷。与其每次都去算「谁推谁」，不如先给空间里每一点记下一支箭头：放一个单位正电荷到这里，它会受多大的力、朝哪边。这一张箭头图就是电场。八步里你会量出它、叠加它、把它画成场线和等势线，最后用它把电子的路线掰弯。',
    nav0: '0 试探电荷', nav1: '1 一个点电荷', nav2: '2 叠加', nav3: '3 场线', nav4: '4 等势线', nav5: '5 平行板', nav6: '6 电子偏转', nav7: '7 收束',

    s0k: '第 0 步 · 怎样量一个看不见的东西',
    s0t: '试探电荷换大换小，受力在变，什么没变？',
    s0e: '这一步要回答：怎样用一个数说清「这一点的电场有多强」？左边固定着一个<strong>源电荷</strong> Q = +2 nC（1 nC = 10⁻⁹ 库仑），它不会动。在离它 r 的 P 点放一个很小的<strong>试探电荷</strong> q，只用来探测、小到不会推动源电荷。按库仑定律，q 受的力 F = kQq/r²（k ≈ 8.99×10⁹ N·m²/C²）：q 加倍，F 也加倍。所以比值 F/q 与 q 无关，只由 Q 和 P 点的位置决定。这个比值叫 P 点的<strong>电场强度</strong> E = F/q，单位 N/C：放一个 +1 C 电荷到这里会受到的力。方向规定为正电荷受力的方向；负电荷受力与 E 相反。',
    qSlider: '试探电荷 q（nC）', rSlider: '到源电荷的距离 r（cm）',
    c0a: '源电荷 Q 与试探电荷 q', c0b: '受力 F（μN）随 q（nC）',
    s0lgQ: '源电荷 Q = +2 nC', s0lgq: '试探电荷 q', s0lgF: 'q 受的力', s0lgLine: '每条线 = 一个 r，斜率 = E',
    s0readout: 'q = {q} nC 放在 r = {r} cm 处，受力 F = {F} μN，{dir}。F/q = {E} N/C，换任何非零的 q 都是这个数：这就是 P 点的电场强度，等于 kQ/r² = {Ef} N/C。',
    s0zero: 'q = 0：没有电荷就没有力，F/q 无从谈起。换一个非零的 q（正负都行）。P 点的电场强度仍是 kQ/r² = {Ef} N/C，它不需要 q 在场。',
    dirAway: '方向背离 Q（向右）', dirToward: '方向指向 Q（向左）',
    s0hint: '观察顺序：先固定 r，把 q 从 −1 拖到 +1：「源电荷 Q 与试探电荷 q」图里力的箭头随 q 伸缩、过 0 时掉头；「受力 F 随 q」图里留下的点排成一条过原点的直线，斜率就是 E。再换一个 r 重复：得到另一条直线，r 越小越陡。直线的斜率只由 r 决定，与 q 无关。',

    s1k: '第 1 步 · 一个点电荷的场',
    s1t: '离点电荷远一倍，电场强度变成多少？',
    s1e: '这一步要回答：一个点电荷 Q 周围的电场 E（放 +1 C 电荷时受的力，N/C）怎样随距离变？由上一步 E = F/q = <strong>kQ/r²</strong>：大小与距离的平方成反比，方向沿着连线，Q 为正时向外指，Q 为负时向里指。「点电荷周围的电场方向」图在每个格点画一支箭头：箭头只表示方向，<strong>亮度</strong>表示强弱（越亮越强）。真实的强弱差得太多，同样长度画不下，所以准确的大小看「E 随 r」图：横轴是 r，纵轴是 E。',
    QSlider: '点电荷 Q（nC）', r1Slider: '探测点距离 r（cm）',
    c1a: '点电荷周围的电场方向（亮 = 强）', c1b: 'E（kN/C）随 r（cm）',
    s1lgArrow: '格点上的场方向', s1lgP: '探测点 P 与它的场', s1lgCurve: '曲线 E = k|Q|/r²', s1lgTwice: '距离 2r 处',
    s1readout: 'Q = {Q} nC，P 在 r = {r} cm：E = k|Q|/r² = {E} N/C，{dir}。{twice}',
    s1twice: '在 2r = {r2} cm 处 E = {E2} N/C，正好是它的 {ratio}。',
    s1far: '（2r 超出了图的范围，把 r 调到 5 cm 以内再比较。）',
    s1out: '方向背离 Q', s1in: '方向指向 Q',
    s1zero: 'Q = 0：没有源电荷，各处 E = 0，图上没有箭头。',
    s1hint: '观察顺序：先只拖 r，看「E 随 r」图里白点沿曲线滑动、橙点总在 2r 处，读数里的比值始终是 1/4。再只拖 Q：「E 随 r」图整条曲线按同一比例升降；Q 变成负数时方向图里所有箭头一起掉头指向电荷。',

    s2k: '第 2 步 · 两个电荷一起',
    s2t: '两个电荷同时在场，某一点的电场怎么求？',
    s2e: '这一步要回答：Q₁ 和 Q₂ 同时存在时，P 点的电场 E（放 +1 C 电荷时受的总力）是什么？每个电荷对 P 点电荷的力互不干扰、可以按矢量相加，所以每个电荷各自产生的场也按矢量相加：<strong>E = E₁ + E₂</strong>，这叫电场的<strong>叠加原理</strong>。「矢量相加」就是把两支箭头首尾相接，或画成平行四边形取对角线；方向不同时，合场的大小一般不等于两个大小之和。图中三支箭头按同一比例画。Q₁ = +2 nC 固定在 (−3, 0) cm，Q₂ 在 (+3, 0) cm。',
    Q2Slider: '第二个电荷 Q₂（nC）', pxSlider: 'P 的横坐标 x（cm）', pySlider: 'P 的纵坐标 y（cm）',
    c2a: '在图上点一下也能移动 P',
    s2lgE1: 'E₁（来自 Q₁）', s2lgE2: 'E₂（来自 Q₂）', s2lgE: '合场 E = E₁ + E₂',
    s2readout: 'P = ({x}, {y}) cm：E₁ = {e1} N/C，E₂ = {e2} N/C，合场 E = ({ex}, {ey}) N/C，大小 {e} N/C。{note}',
    s2null: '这里两个场大小相等、方向相反，合场为 0：放在这里的电荷不受电场力。',
    s2sum: '两个大小之和是 {s} N/C，合场只有它的 {p}%：方向不同就会部分抵消。',
    s2same: '两支箭头同向，合场大小正好是两者之和。',
    s2hint: '观察顺序：先把 Q₂ 设成 +2，把 P 放到 (0, 0)：两支箭头等长反向，合场为 0。再把 Q₂ 拖到 −2：同一点两支箭头都向右，合场是单个的两倍。然后在图上到处点 P，看平行四边形怎样变形。',

    s3k: '第 3 步 · 把场画成线',
    s3t: '整片电场长什么样？哪些线从正电荷出发、落到负电荷上？',
    s3e: '这一步要回答：不逐点画箭头，怎样一眼看出整片电场的形状？从正电荷出发，每走一小步都沿着当地电场 E（放 +1 C 电荷时的受力方向）的方向，描出的曲线叫<strong>电场线</strong>（<a class="xlink" href="../../../physics/electromagnetism/magnets/#step2">→ 磁铁 第 2 步：铁屑排出的磁感线，可以对照看</a>）。它从正电荷出发、到负电荷终止或跑向远方；任一点只有一个方向，所以两条线不会相交。约定每 nC 画 8 条线（上下各 4 条），于是线多的电荷带电多，线密的地方场强。起点不按等角度排，而是让每条线分到同样多的「出射量」，这样落到另一个电荷上的线数才和电荷量成比例。',
    Q1Slider: '左边电荷 Q₁（nC）',
    c3a: '电场线（每 nC 8 条）',
    s3lgPos: '正电荷', s3lgNeg: '负电荷', s3lgLine: '电场线（箭头沿 E）',
    s3opp: '从 {big} nC 发出 {nb} 条线，其中 {land} 条落到 {small} nC 上（正好每 nC 8 条），其余 {esc} 条跑向远方：{big} nC 的线比 {small} nC 能接住的多。',
    s3equal: '两个电荷等量异号：{nb} 条线中 {land} 条落到对面的电荷上；最外侧的线绕得很远才回来，有 {esc} 条在画面外绕回。',
    s3same: '两个电荷同号：{n1} 条和 {n2} 条线各自向外散开，没有一条连接两者；两电荷之间有一点 E = 0，线在那里被推开。',
    s3single: '只有一个电荷：{n} 条线均匀地{dir}。',
    s3outw: '向外辐射', s3inw: '从远方汇聚进来',
    s3none: '两个电荷都为 0：没有电场，也就没有电场线。',
    s3hint: '观察顺序：保持 Q₁ = +3，把 Q₂ 从 −1 拖到 −3：落到 Q₂ 上的线从 8 条变成 24 条。再把 Q₂ 拖成正数：再也没有线连接两者，中间出现空白。线条疏密就是场强：电荷附近线挤在一起，远处散开。',

    s4k: '第 4 步 · 等势线',
    s4t: '电荷在哪些路线上移动，电场不对它做功？',
    s4e: '这一步要回答：除了场线，还有什么办法描述电场？把 +1 C 的电荷从很远处搬到 P 点，要克服电场做的功叫 P 点的<strong>电势</strong> V，单位伏特（V），点电荷的电势是 V = kQ/r，几个电荷就把各自的 V 直接相加（不用管方向）。电势相等的点连成<strong>等势线</strong>，图中相邻两条相差 ΔV。电荷沿等势线移动时电势不变，电场不做功，所以电场 E（放 +1 C 电荷时的受力）处处与等势线<strong>垂直</strong>，指向电势降低的方向；等势线越密，电势降得越快，场越强：<strong>E = ΔV/Δs</strong>（Δs 是沿场方向走的距离，1 V/m = 1 N/C）。Q₁ = +2 nC 在左，Q₂ 可调。',
    dVSlider: '相邻等势线的间隔 ΔV（V）',
    c4a: '等势线（暖色 V > 0，冷色 V < 0）与淡色电场线',
    s4lgHi: 'V > 0 的等势线', s4lgLo: 'V < 0 的等势线', s4lgField: '电场线', s4lgP: 'P 点的场方向',
    s4readout: 'P = ({x}, {y}) cm：V = {V} V，E = {E} N/C。以 P 为中点顺着 E 走 1 mm，V 降低 {dv} V，ΔV/Δs = {grad} V/m，与 E 相差不到 1%；沿等势线走 1 mm，V 只变 {dvt} V。把 1 nC 的正电荷从 P 移到很远处，电场做功 qV = {W} μJ。',
    tooNear: 'P 离电荷太近（不到 0.6 cm），那里的场急剧变大，换一个位置看。',
    s4hint: '观察顺序：先把 P 放在两电荷之间，看青色箭头总是和穿过它的等势线垂直。再只拖 ΔV：等势线变疏或变密，但每条线的形状不变（ΔV 只改变画法）。最后把 Q₂ 拖成正数：等势线变成包住两个电荷的大圈。',

    s5k: '第 5 步 · 平行板里的匀强电场',
    s5t: '很多点电荷排成两块板，中间的电场为什么变得处处一样？',
    s5e: '这一步要回答：实验里常用的<strong>匀强电场</strong>（各处大小、方向都相同的电场）是怎么来的？把两块正方形板（边长 12 cm，相距 4 cm）各分成 N × N 个小格，每格中心放一个点电荷：上板共 +10 nC，下板共 −10 nC。板间任一点的场是这 2N² 个点电荷的场按矢量叠加（第 2 步）。N = 1 时就是两个点电荷，中间的场很不均匀；格子越细，横向的分量越互相抵消，中间的场越接近同一个值，板外的场则相互抵消而变弱。图是过板中心的竖直截面，颜色表示场强 E（放 +1 C 电荷时受力的大小）。',
    NSlider: '每块板每边的点电荷数 N',
    c5a: '截面上的场强（越亮越强）与场方向',
    s5lgPlus: '上板 +10 nC', s5lgMinus: '下板 −10 nC', s5lgBox: '统计均匀度的中央区域',
    s5readout: '每块板 {n2} 个点电荷。中心 E = {E0} N/C，向下；中央虚线框内各点与中心相差最多 {dev}%；上板外 2 cm 处只有 {out} N/C（中心的 {outp}%）。无限大平板的公式 σ/ε₀ = {ideal} N/C，这里是它的 {ratio}%：板只有 12 cm 宽，不是无限大。',
    s5hint: '观察顺序：从 N = 1 开始慢慢加到 15。N = 1 时亮斑集中在两个电荷附近、中间暗；N 增大后板间亮度变匀、板外变暗，读数里的「相差最多」大体从一百多 % 降到几 %（N 很小时会随奇偶来回跳：N 为奇数时正好有一排电荷落在这个截面上）。N 超过 10 后几乎不再变：剩下的不均匀来自板的边缘，而不是格子太粗。',

    s6k: '第 6 步 · 让电子穿过去',
    s6t: '电子横着射进匀强电场，会走出什么路线？',
    s6e: '这一步要回答：知道了电场 E，怎样预言电荷的运动？两块平行板间加电压 U、相距 d，板间近似是匀强电场，大小 <strong>E = U/d</strong>（上板电势高，E 向下）。电子带负电（电荷量 e = 1.60×10⁻¹⁹ C，质量 m = 9.11×10⁻³¹ kg），受力 eE 向上，加速度 a = eU/(md) 不变。水平方向不受力，速度一直是 v₀。这和水平抛出的小球一模一样，只是「重力」换成了电场力（<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step0">→ 抛体与圆周 第 0 步：平抛的球与直落的球同时落地</a>）：在板内走了水平距离 x 时，竖直偏移 <strong>y = a x²/(2v₀²)</strong>，是一条抛物线。出板后不再受力，沿直线飞到荧光屏。板长 L = 4 cm，d = 1 cm，屏在板后 8 cm。电子的重力约 10⁻²⁹ N，比电场力小十几个数量级，忽略。',
    USlider: '偏转电压 U（V）', v0Slider: '入射速度 v₀（×10⁷ m/s）', clearPaths: '清除旧轨迹',
    c6a: '侧视（cm）：电子从左射入，打到右边的屏上',
    s6lgPath: '当前轨迹', s6lgOld: '之前试过的轨迹', s6lgSpot: '屏上光点',
    s6readout: 'E = U/d = {E} N/C，a = eU/(md) = {a}×10¹⁵ m/s²。在板内飞了 {t} ns，偏移 y₁ = {y1} mm，出板时偏角 {phi}°；屏上光点在中心上方 {Y} mm。',
    s6hit: 'E = U/d = {E} N/C，a = {a}×10¹⁵ m/s²。偏得太快：飞到 x = {xh} cm 时已经撞上上板（只差 {gap} cm 就能出板）。减小 U 或加大 v₀。',
    s6hint: '观察顺序：先只把 U 加倍（如 100 → 200 V），看光点离中心的距离也加倍；再回到 100 V，只把 v₀ 加倍（2.0 → 4.0），光点距离变成原来的 1/4，因为电子在板里待的时间减半、偏移与时间的平方成正比。旧轨迹会留在图上作对照。图的横竖刻度不一定相同，距离以刻度为准。',

    s7k: '第 7 步 · 收束',
    s7t: '电场的四句话',
    s7fin: '<strong>电场 = 空间每一点上「放 +1 C 电荷会受的力」。</strong>它不需要试探电荷在场就存在；几个电荷的场按矢量相加；场线和等势线是同一片场的两种画法，处处垂直；匀强电场里电荷的运动就是一道抛体题。',
    formula: 'E = F/q　E点 = kQ/r²　E = E₁ + E₂　V = kQ/r　E = ΔV/Δs　E板 = U/d',
    boundary: '适用范围：源电荷固定不动、周围是真空（或空气）；试探电荷小到不改变源电荷；变化很快的电荷（会产生磁场和电磁波）不在本页范围内。场线的条数是画法约定，不是物理量。',
    quizPrompt: '想一想：电子以 v₀ 射入偏转电场，出板时偏移 y₁。其他不变，只把 v₀ 加倍，偏移变成？',
    quizA: 'y₁/2：速度快一倍，偏得少一半', quizB: 'y₁/4：在板里的时间减半，偏移与时间平方成正比', quizC: '不变：电场力和速度无关',
    check: '核对', correct: '对。y₁ = a t²/2，t = L/v₀。v₀ 加倍，t 减半，y₁ 变成 1/4。在第 6 步把 v₀ 从 2.0 拖到 4.0 可以验证。',
    wrong: '再看看第 6 步：电场力确实与速度无关，但电子在板里待的时间与 v₀ 有关，偏移又与时间的平方成正比。',
    linksTitle: '接着去看',
    lk1: '→ 抛体与圆周 第 0 步：平抛运动，和电子偏转同一套数学',
    lk2: '→ 磁场与洛伦兹力 第 4 步：再加一个磁场，只有一种速度能走直线',
    lk3: '→ 磁铁 第 2 步：磁感线和电场线的异同',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《电场 · 看不见的力画成图》的平行版本。'
  },
  en: {
    pageTitle: 'Electric Fields · An Arrow at Every Point in Space',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Electric Fields · Drawing an Invisible Force →',
    navLabel: 'Electric field steps',
    tagline: 'A charged object can push and pull other charges across empty space. Instead of working out who pushes whom every time, record one arrow at every point: the force a unit positive charge would feel if you put it there. That map of arrows is the electric field. Over eight steps you will measure it, add fields together, draw it as field lines and equipotentials, and finally use it to bend an electron’s path.',
    nav0: '0 Test charge', nav1: '1 One charge', nav2: '2 Adding fields', nav3: '3 Field lines', nav4: '4 Equipotentials', nav5: '5 Plates', nav6: '6 Electron beam', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Measuring something invisible',
    s0t: 'Make the test charge bigger or smaller: the force changes, so what stays the same?',
    s0e: 'This step asks: what single number says how strong the field is at a point? On the left sits a fixed <strong>source charge</strong>, Q = +2 nC (1 nC = 10⁻⁹ coulomb), which does not move. At a point P a distance r away we place a tiny <strong>test charge</strong> q, used only to probe, small enough not to disturb the source. Coulomb’s law gives the force on it, F = kQq/r² (k ≈ 8.99×10⁹ N·m²/C²): double q and F doubles. So the ratio F/q does not depend on q at all, only on Q and where P is. That ratio is the <strong>electric field strength</strong> at P, E = F/q, in N/C: the force a +1 C charge would feel there. Its direction is the direction of the force on a positive charge; a negative charge is pushed the opposite way.',
    qSlider: 'Test charge q (nC)', rSlider: 'Distance from the source r (cm)',
    c0a: 'Source charge Q and test charge q', c0b: 'Force F (μN) against q (nC)',
    s0lgQ: 'source Q = +2 nC', s0lgq: 'test charge q', s0lgF: 'force on q', s0lgLine: 'one line per r; slope = E',
    s0readout: 'q = {q} nC at r = {r} cm feels F = {F} μN, {dir}. F/q = {E} N/C, the same for any non-zero q: that is the field strength at P, equal to kQ/r² = {Ef} N/C.',
    s0zero: 'q = 0: no charge, no force, so F/q means nothing. Pick a non-zero q (either sign). The field at P is still kQ/r² = {Ef} N/C; it does not need q to be there.',
    dirAway: 'pointing away from Q (right)', dirToward: 'pointing toward Q (left)',
    s0hint: 'What to try: keep r fixed and drag q from −1 to +1. In the “Source charge Q and test charge q” picture the force arrow grows and shrinks with q and flips as q crosses 0; in the “Force F against q” chart the dots line up on a straight line through the origin whose slope is E. Then pick another r and repeat: a new line, steeper for smaller r. The slope depends on r only, never on q.',

    s1k: 'Step 1 · The field of one point charge',
    s1t: 'Twice as far from a point charge, how strong is the field?',
    s1e: 'This step asks: how does the field E around a point charge Q (the force on a +1 C charge, in N/C) change with distance? From step 0, E = F/q = <strong>kQ/r²</strong>: its size falls as one over the distance squared, and it points along the line to the charge, outward for positive Q and inward for negative Q. The “Field direction around one charge” picture puts an arrow at every grid point. The arrows show direction only; <strong>brightness</strong> shows strength (brighter is stronger), because the real range is far too wide to draw with lengths. For exact sizes read the “E against r” chart: distance r across, E up.',
    QSlider: 'Point charge Q (nC)', r1Slider: 'Probe distance r (cm)',
    c1a: 'Field direction around one charge (bright = strong)', c1b: 'E (kN/C) against r (cm)',
    s1lgArrow: 'field direction at grid points', s1lgP: 'probe P and its field', s1lgCurve: 'curve E = k|Q|/r²', s1lgTwice: 'at distance 2r',
    s1readout: 'Q = {Q} nC, P at r = {r} cm: E = k|Q|/r² = {E} N/C, {dir}. {twice}',
    s1twice: 'At 2r = {r2} cm, E = {E2} N/C, exactly {ratio} of that.',
    s1far: '(2r is off the plot; bring r below 5 cm to compare.)',
    s1out: 'pointing away from Q', s1in: 'pointing toward Q',
    s1zero: 'Q = 0: no source, so E = 0 everywhere and there are no arrows.',
    s1hint: 'What to try: drag only r and watch the white dot in the “E against r” chart slide along the curve while the orange dot stays at 2r; the ratio in the readout is always 1/4. Then drag only Q: the whole curve scales up or down, and when Q turns negative every arrow in the direction picture flips to point at the charge.',

    s2k: 'Step 2 · Two charges at once',
    s2t: 'With two charges present, how do you find the field at a point?',
    s2e: 'This step asks: with Q₁ and Q₂ both present, what is the field E at P (the total force on a +1 C charge there)? The forces from the two charges do not interfere with each other and add as vectors, so the fields each charge makes add as vectors too: <strong>E = E₁ + E₂</strong>, the <strong>superposition principle</strong>. Adding vectors means putting the arrows tip to tail, or drawing the parallelogram and taking its diagonal; when the directions differ, the size of the total is generally less than the sum of the sizes. All three arrows are drawn to the same scale. Q₁ = +2 nC is fixed at (−3, 0) cm and Q₂ sits at (+3, 0) cm.',
    Q2Slider: 'Second charge Q₂ (nC)', pxSlider: 'P, x coordinate (cm)', pySlider: 'P, y coordinate (cm)',
    c2a: 'Tap or click the picture to move P',
    s2lgE1: 'E₁ (from Q₁)', s2lgE2: 'E₂ (from Q₂)', s2lgE: 'total E = E₁ + E₂',
    s2readout: 'P = ({x}, {y}) cm: E₁ = {e1} N/C, E₂ = {e2} N/C, total E = ({ex}, {ey}) N/C, size {e} N/C. {note}',
    s2null: 'Here the two fields are equal and opposite and the total is 0: a charge placed here feels no electric force.',
    s2sum: 'The two sizes add up to {s} N/C but the total is only {p}% of that: different directions partly cancel.',
    s2same: 'The two arrows point the same way, so the total is exactly the sum of the sizes.',
    s2hint: 'What to try: set Q₂ to +2 and put P at (0, 0): the two arrows are equal and opposite and the total is 0. Now drag Q₂ to −2: at the same point both arrows point right and the total is twice either one. Then click around the picture and watch the parallelogram change shape.',

    s3k: 'Step 3 · Drawing the field as lines',
    s3t: 'What does the whole field look like? Which lines run from the positive charge to the negative one?',
    s3e: 'This step asks: without drawing an arrow at every point, how can you see the shape of the whole field at a glance? Start at a positive charge and keep taking small steps in the direction of the local field E (the direction of the force on a +1 C charge). The curve you trace is an <strong>electric field line</strong> (<a class="xlink" href="../../../physics/electromagnetism/magnets/#step2">→ Magnets, step 2: the lines iron filings make, for comparison</a>). Field lines start on positive charges and end on negative ones or run off into the distance; since every point has just one field direction, two lines never cross. By convention we draw 8 lines per nC (4 above the axis, 4 below), so a bigger charge has more lines, and where lines crowd the field is strong. The starting points are not spaced at equal angles: each line is given an equal share of the charge’s outflow, which is what makes the number landing on the other charge proportional to its charge.',
    Q1Slider: 'Left charge Q₁ (nC)',
    c3a: 'Field lines (8 per nC)',
    s3lgPos: 'positive charge', s3lgNeg: 'negative charge', s3lgLine: 'field line (arrow along E)',
    s3opp: '{big} nC sends out {nb} lines; {land} of them land on {small} nC (exactly 8 per nC) and the other {esc} run off into the distance: {big} nC has more lines than {small} nC can take in.',
    s3equal: 'Equal and opposite charges: {land} of the {nb} lines land on the other charge; the outermost ones loop a long way round, and {esc} of them make their loop outside the picture.',
    s3same: 'Charges of the same sign: {n1} and {n2} lines each spread outward and none connects the two. Between the charges there is a point where E = 0, and the lines are pushed apart there.',
    s3single: 'Only one charge: its {n} lines {dir} evenly.',
    s3outw: 'radiate outward', s3inw: 'converge from far away',
    s3none: 'Both charges are 0: no field, so no field lines.',
    s3hint: 'What to try: keep Q₁ = +3 and drag Q₂ from −1 to −3: the lines landing on Q₂ go from 8 to 24. Then make Q₂ positive: no line joins the two any more and an empty gap opens between them. The spacing of the lines is the field strength: crowded near the charges, spread out far away.',

    s4k: 'Step 4 · Equipotentials',
    s4t: 'Along which paths can a charge move without the field doing any work on it?',
    s4e: 'This step asks: besides field lines, how else can a field be described? The work needed to bring +1 C from very far away to P, against the field, is the <strong>electric potential</strong> V at P, measured in volts (V). For a point charge V = kQ/r, and for several charges you simply add their V values (no directions involved). Points with equal potential join up into <strong>equipotential lines</strong>; neighbouring lines in the picture differ by ΔV. A charge moving along an equipotential keeps the same potential, so the field does no work on it. That forces the field E (the force on a +1 C charge) to be <strong>perpendicular</strong> to the equipotentials everywhere, pointing toward lower potential. The closer the lines, the faster V drops and the stronger the field: <strong>E = ΔV/Δs</strong>, with Δs the distance moved along the field (1 V/m = 1 N/C). Q₁ = +2 nC is on the left; Q₂ is adjustable.',
    dVSlider: 'Gap between neighbouring equipotentials ΔV (V)',
    c4a: 'Equipotentials (warm V > 0, cool V < 0) and faint field lines',
    s4lgHi: 'equipotential, V > 0', s4lgLo: 'equipotential, V < 0', s4lgField: 'field line', s4lgP: 'field direction at P',
    s4readout: 'P = ({x}, {y}) cm: V = {V} V, E = {E} N/C. Step 1 mm along E, centred on P, and V drops by {dv} V, so ΔV/Δs = {grad} V/m, within 1% of E; step 1 mm along the equipotential and V changes by only {dvt} V. Moving a +1 nC charge from P to far away, the field does work qV = {W} μJ.',
    tooNear: 'P is too close to a charge (under 0.6 cm), where the field shoots up; try another spot.',
    s4hint: 'What to try: put P between the charges and notice the cyan arrow always crosses the equipotential through it at a right angle. Then drag only ΔV: the lines thin out or crowd together but each keeps its shape (ΔV changes only how the map is drawn). Finally make Q₂ positive: the equipotentials become big loops around both charges.',

    s5k: 'Step 5 · A uniform field between plates',
    s5t: 'Line up many point charges into two plates: why does the field between them become the same everywhere?',
    s5e: 'This step asks: where does the <strong>uniform field</strong> used in so many experiments (the same size and direction everywhere) come from? Take two square plates, 12 cm on a side and 4 cm apart, divide each into N × N small squares, and put a point charge at the centre of each: +10 nC in total on the top plate, −10 nC on the bottom. The field at any point between them is the vector sum of the fields of all 2N² charges (step 2). With N = 1 it is just two point charges and the field in between is far from even. As the grid gets finer, the sideways parts cancel more and more, the field in the middle settles to one value, and outside the plates the contributions cancel and the field weakens. The picture is the vertical cross-section through the middle of the plates; colour shows the field strength E (the size of the force on a +1 C charge).',
    NSlider: 'Point charges along each edge of a plate, N',
    c5a: 'Field strength on the cross-section (brighter = stronger) and direction',
    s5lgPlus: 'top plate +10 nC', s5lgMinus: 'bottom plate −10 nC', s5lgBox: 'central region used for the evenness figure',
    s5readout: '{n2} point charges per plate. Centre E = {E0} N/C, pointing down; inside the dashed box no point differs from the centre by more than {dev}%; 2 cm above the top plate the field is only {out} N/C ({outp}% of the centre). The infinite-plate formula σ/ε₀ gives {ideal} N/C, and the centre here is {ratio}% of it: the plates are only 12 cm wide, not infinite.',
    s5hint: 'What to try: start at N = 1 and work up to 15. At N = 1 the bright spots sit around two charges and the middle is dark; as N grows, the gap brightens evenly and the outside darkens, and the “differs by at most” figure falls, broadly, from over a hundred percent to a few (at small N it jumps between odd and even: for odd N one row of charges lies right in this cross-section). Beyond N = 10 it hardly changes: what unevenness is left comes from the plate edges, not from the grid being coarse.',

    s6k: 'Step 6 · Sending an electron through',
    s6t: 'Fire an electron sideways into a uniform field: what path does it take?',
    s6e: 'This step asks: once you know the field E, how do you predict how a charge moves? Two parallel plates a distance d apart with a voltage U across them give, to a good approximation, a uniform field of size <strong>E = U/d</strong> between them (top plate at higher potential, so E points down). An electron is negative (charge e = 1.60×10⁻¹⁹ C, mass m = 9.11×10⁻³¹ kg), so it is pushed up with force eE and a constant acceleration a = eU/(md). Nothing pushes it sideways, so its horizontal speed stays v₀. This is exactly a ball thrown horizontally, with the electric force in place of gravity (<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step0">→ Projectiles, step 0: a thrown ball and a dropped ball land together</a>): after covering a horizontal distance x inside the plates it has risen <strong>y = a x²/(2v₀²)</strong>, a parabola. After the plates no force acts and it flies straight to the screen. Plate length L = 4 cm, d = 1 cm, screen 8 cm beyond the plates. The electron’s weight, about 10⁻²⁹ N, is more than ten orders of magnitude smaller than the electric force and is ignored.',
    USlider: 'Deflecting voltage U (V)', v0Slider: 'Entry speed v₀ (×10⁷ m/s)', clearPaths: 'Clear old paths',
    c6a: 'Side view (cm): electron enters left, hits the screen',
    s6lgPath: 'current path', s6lgOld: 'paths tried before', s6lgSpot: 'spot on the screen',
    s6readout: 'E = U/d = {E} N/C, a = eU/(md) = {a}×10¹⁵ m/s². It spends {t} ns between the plates, rises y₁ = {y1} mm and leaves at {phi}°; the spot lands {Y} mm above the centre of the screen.',
    s6hit: 'E = U/d = {E} N/C, a = {a}×10¹⁵ m/s². It bends too fast and hits the top plate at x = {xh} cm, {gap} cm short of the exit. Lower U or raise v₀.',
    s6hint: 'What to try: double only U (say 100 → 200 V) and the spot moves twice as far from the centre. Back at 100 V, double only v₀ (2.0 → 4.0) and the distance drops to a quarter: the electron spends half as long between the plates and the rise goes with the time squared. Old paths stay on the picture for comparison. The two axes may not share a scale; read distances off the ticks.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'Electric fields in four sentences',
    s7fin: '<strong>The electric field is, at every point, the force a +1 C charge would feel there.</strong> It exists whether or not a test charge is present; fields of several charges add as vectors; field lines and equipotentials are two drawings of the same field and cross at right angles; and motion in a uniform field is a projectile problem.',
    formula: 'E = F/q　E_point = kQ/r²　E = E₁ + E₂　V = kQ/r　E = ΔV/Δs　E_plates = U/d',
    boundary: 'Where this holds: source charges held still, in vacuum (or air); test charges too small to disturb the sources. Rapidly changing charges, which also make magnetic fields and electromagnetic waves, are beyond this page. The number of field lines is a drawing convention, not a physical quantity.',
    quizPrompt: 'Think: an electron enters the deflecting field at v₀ and leaves displaced by y₁. Keep everything else the same and double v₀. What is the displacement now?',
    quizA: 'y₁/2: twice as fast, half the bend', quizB: 'y₁/4: half the time between the plates, and the rise goes with time squared', quizC: 'Unchanged: the electric force does not depend on speed',
    check: 'Check', correct: 'Right. y₁ = a t²/2 with t = L/v₀. Doubling v₀ halves t, so y₁ drops to a quarter. Drag v₀ from 2.0 to 4.0 in step 6 to see it.',
    wrong: 'Look again at step 6: the electric force really does not depend on speed, but the time spent between the plates does, and the rise goes with that time squared.',
    linksTitle: 'Where to go next',
    lk1: '→ Projectiles, step 0: horizontal launch, the same maths as the electron beam',
    lk2: '→ Magnetic force, step 4: add a magnetic field and only one speed goes straight',
    lk3: '→ Magnets, step 2: how magnetic field lines compare with electric ones',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Electric Fields · Drawing an Invisible Force”.'
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
