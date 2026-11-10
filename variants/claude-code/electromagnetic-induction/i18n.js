'use strict';
// Electromagnetic induction lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '电磁感应 · 穿过线圈的磁场一变，就有电压',
    back: '← 知识索引',
    compare: '对照另一版本：电磁感应 · 磁通量一变，电压就来 →',
    navLabel: '电磁感应步骤导航',
    tagline: '一圈导线，不接电池，只要穿过它的磁场在变，导线两端就会出现电压。发电机、变压器、无线充电都靠这一条。六步里你先学会数「穿过线圈的磁场有多少」，再看它变得多快决定电压多大、往哪个方向变决定电流朝哪绕，最后亲手转出一台交流发电机。',
    nav0: '0 磁通量', nav1: '1 变得多快', nav2: '2 往哪边绕', nav3: '3 切割磁感线', nav4: '4 发电机', nav5: '5 收束',

    s0k: '第 0 步 · 先数清楚',
    s0t: '线圈斜过来，穿过它的磁场是变多还是变少？',
    s0e: '这一步要回答：怎样用一个数说清「有多少磁场穿过这个线圈」？<strong>磁感应强度</strong> B 描述磁场的强弱，单位特斯拉（T），画成磁感线时，B 越大线越密。线圈围出的面积是 S。线圈的<strong>法线</strong>是垂直于线圈平面的方向，它与 B 的夹角记作 θ。真正「穿过」线圈的只是 B 沿法线方向的那部分，所以定义<strong>磁通量</strong> <strong>Φ = B·S·cosθ</strong>，单位韦伯（Wb，1 Wb = 1 T·m²），可以想成穿过线圈的磁感线条数。θ = 0 时线圈正对磁场，Φ 最大；θ = 90° 时线圈侧对磁场，Φ = 0；θ 超过 90° 后磁场从线圈的另一面穿入，Φ 记为负。「侧视」图里线圈只看得见一条边（橙色），绿色箭头是法线，青色阴影是线圈在垂直于 B 方向上的投影：落在阴影里的磁感线才算穿过线圈。',
    BSlider: '磁感应强度 B（T）', aSlider: '正方形线圈边长 a（cm）', thSlider: '法线与 B 的夹角 θ（°）',
    c0a: '侧视：竖直线是磁感线，橙色是线圈', c0b: 'Φ（mWb）随 θ（°）',
    s0lgCoil: '线圈（侧视）', s0lgNormal: '法线', s0lgThrough: '穿过线圈的磁感线', s0lgCurve: 'Φ = BS·cosθ', s0lgPrev: '上一组设置的曲线', s4lgPrev: '上一组设置的 ε', s3lgTau: 't = τ 处',
    s0readout: 'Φ = B·S·cosθ = {B} T × {S} m² × cos {th}° = {phi} mWb。线圈在垂直于 B 方向上的投影宽 {w} cm，图里有 {n} 条磁感线从中穿过。',
    s0hint: '观察顺序：先只拖 θ，从 0° 拖到 180°：投影宽度变窄、穿过的线变少，90° 时一条不剩，过了 90° 线从另一面穿入，「Φ 随 θ」图上的点沿余弦曲线走到负值。再只拖 B：磁感线变密变疏，整条曲线按同一比例伸缩（灰线是上一组设置的曲线）。最后把边长 a 从 6 cm 拖到 12 cm：侧视图里的阴影带宽度翻倍，但侧视只看得见一个方向的宽度，另一个方向的边也加倍了，所以面积是 4 倍，Φ 也是 4 倍。',

    s1k: '第 1 步 · 法拉第定律',
    s1t: '磁场很强但不变，有没有电压？磁场变得更快呢？',
    s1e: '这一步要回答：线圈两端的电压由什么决定？法拉第发现，只有<strong>穿过线圈的磁通量 Φ（B·S·cosθ）在变化</strong>时，线圈里才会产生电压，叫<strong>感应电动势</strong> ε，大小等于磁通量的变化率乘以匝数 N：<strong>ε = −N·ΔΦ/Δt</strong>（负号表示方向，下一步再讲）。这里线圈有 N = 100 匝、面积 S = 0.01 m²（10 cm × 10 cm），正对磁场。磁场在 τ 秒内从 0 匀速升到 Bmax，保持一会儿，再用 τ 秒降回 0。上图是 B，下图是 ε；下图阴影的面积 ∫ε dt 是「电压 × 时间」的累计。',
    BmaxSlider: '最大磁场 Bmax（T）', tauSlider: '变化用时 τ（s）', run: '按真实速度跑一遍', running: '运行中…',
    c1a: '磁感应强度 B（T）随时间 t（s）', c1b: '感应电动势 ε（V）随时间 t（s）',
    s1lgB: 'B(t)', s1lgE: 'ε(t)，阴影 = ∫ε dt', s1lgOld: '之前试过的 τ',
    s1readout: '{now}上升的 {tau} s 里 ε = −N·S·Bmax/τ = {e} V；B 保持不变的那段，B 有 {B} T 却 ε = 0。上升段阴影面积 ∫ε dt = {area} V·s，正好等于 −N·S·Bmax = {nsb} V·s，与 τ 无关。',
    s1now: 't = {t} s · ',
    s1hint: '观察顺序：先只拖 τ，从 1.2 s 拖到 0.1 s：下图的矩形越来越高、越来越窄，灰色是之前试过的 τ，阴影面积却始终一样：电压 × 时间只由磁通量变了多少决定。再只拖 Bmax：高度和面积一起按比例变。按「按真实速度跑一遍」，B 和 ε 随时间描出来，B 停在高处时 ε 掉回 0。',

    s2k: '第 2 步 · 楞次定律',
    s2t: '磁铁穿过线圈，感应电流朝哪边绕？',
    s2e: '这一步要回答：ε = −N·ΔΦ/Δt 里的负号说的是什么方向？<strong>楞次定律</strong>：感应电流产生的磁场，总是<strong>阻碍</strong>引起它的磁通量变化。穿过线圈的磁通量 Φ 在增加，感应电流的磁场就反着穿过线圈；Φ 在减少，它就顺着补上。换个说法：磁铁靠近时，线圈朝着它的那一面和磁铁同极，把它推开；磁铁离开时，线圈那一面变成异极，把它拉住。这里磁铁沿线圈的轴线（左右方向）运动，线圈 100 匝、半径 2 cm。磁通量以向右穿过为正。「让磁铁穿过线圈」是慢放：动画用 4 秒走完 16 cm，真实磁铁以 1 m/s 只需 0.16 秒。',
    zSlider: '磁铁中心位置 z（cm，线圈在 0）', vSlider: '磁铁速度 v（m/s，正 = 向右）', flip: '把磁铁掉个头', pass: '让磁铁穿过线圈',
    c2a: '侧视：磁铁、线圈与感应电流', c2b: '磁通量 NΦ（mWb）随 z', c2c: '感应电动势 ε（V）随 z',
    s2lgMag: '磁铁（红 N / 蓝 S）', s2lgCur: '线圈上下两端的电流方向：⊙ 流出纸面、⊗ 流入', s2lgInd: '感应电流在线圈中心的磁场', s2lgForce: '线圈对磁铁的力（只画方向）',
    s2readout: '磁铁在 z = {z} cm，{moving}。磁铁的磁场向{fdir}穿过线圈，这部分磁通量正在{trend}，ε = {e} V。感应电流在线圈中心的磁场指向{dir}，线圈靠近磁铁的一面相当于 {face} 极，和磁铁朝向线圈的 {mface} 极{rel}：{effect}。',
    s2still: '磁铁在 z = {z} cm，没有运动：磁通量不变，ε = 0，没有感应电流，也就没有力。',
    s2center: '磁铁正在线圈中心：磁通量最大，但这一瞬间既不增加也不减少，ε = 0。这是电流掉头的时刻。',
    movRight: '以 {v} m/s 向右运动', movLeft: '以 {v} m/s 向左运动',
    trendUp: '增加', trendDown: '减少', dirRight: '右', dirLeft: '左',
    relRepel: '同极相斥', relAttract: '异极相吸', effApproach: '阻碍它靠近', effLeave: '阻碍它离开',
    s2hint: '观察顺序：按「让磁铁穿过线圈」，看下图描出一正一负两个峰：靠近时一个方向，离开时反方向，正中间为 0。再按「把磁铁掉个头」重来，两个峰一起翻转。最后只拖 v：峰高与速度成正比，v 为负（向左）时两个峰也翻转。橙色箭头始终和磁铁的运动方向相反。',

    s3k: '第 3 步 · 导体棒切割磁感线',
    s3t: '推一下导轨上的金属棒就松手，它为什么会慢慢停下？',
    s3e: '这一步要回答：线圈不动、磁场不变，只让电路的一条边运动，会怎样？两根平行导轨相距 L = 0.5 m，左端接电阻 R，放在 B = 1 T、垂直纸面向外的匀强磁场里。金属棒（质量 0.1 kg）以速度 v 向右滑，电路围成的面积每秒增加 L·v，磁通量 Φ（B·面积）每秒增加 B·L·v，所以 <strong>ε = B·L·v</strong>，电流 I = ε/R。按楞次定律，电流要阻碍面积变大：载流的棒在磁场中受到<strong>安培力</strong> F = B·I·L，方向与运动相反（<a class="xlink" href="../../../physics/electromagnetism/magnetic-force/#step0">→ 磁场与洛伦兹力 第 0 步：运动电荷受的磁场力</a>）。没有摩擦，也没人推，棒的动能就一点点变成电阻的热，速度按 v = v₀·e^(−t/τ) 衰减，τ = mR/(B²L²)。',
    v0Slider: '初速度 v₀（m/s）', RSlider: '电阻 R（Ω）', push: '推一下就松手',
    c3a: '俯视：⊙ 是向外的磁场，青色箭头是电流', c3b: '速度 v（m/s）随时间 t（s）',
    s3lgArea: '回路面积（在增大）', s3lgCur: '感应电流', s3lgF: '安培力', s3lgV: 'v(t)', s3lgOld: '之前的 v(t)',
    s3readout: 't = {t} s：v = {v} m/s。ε = BLv = {emf} V，I = ε/R = {I} A，安培力 F = BIL = {F} N（向左）。到此刻电阻共发热 {Q} J，正好等于棒减少的动能。时间常数 τ = mR/(B²L²) = {tau} s，最终总共滑 v₀τ = {xmax} m。',
    s3hint: '观察顺序：按「推一下就松手」，看棒滑出去、越来越慢，「速度随时间」图描出一条衰减曲线，橙色竖虚线标出 t = τ（速度降到 v₀ 的 37%）。只把 R 调大：电流变小、阻力变小，棒滑得更远，曲线下降更慢（灰色是之前的曲线）。只把 v₀ 加倍：曲线形状不变、整体变高，滑行距离加倍。',

    s4k: '第 4 步 · 发电机',
    s4t: '让线圈在磁场里一直转，会得到什么样的电压？',
    s4e: '这一步要回答：怎样让磁通量一直变下去，持续发电？让 N 匝、面积 S = 0.01 m² 的线圈在匀强磁场 B 中以每秒 f 圈匀速转动。线圈法线与 B 的夹角 θ = ωt 一直在变，ω = 2πf 叫<strong>角速度</strong>（每秒转过的弧度）。每匝的磁通量 Φ = B·S·cos ωt（第 0 步），由法拉第定律 ε = −N·ΔΦ/Δt 得 <strong>ε = N·B·S·ω·sin ωt</strong>：电压的大小和方向周期性变化，这就是<strong>交流电</strong>。峰值 ε₀ = NBSω。交流电的<strong>有效值</strong>是指在电阻上产生同样热量的直流电压，对正弦波等于 ε₀/√2。注意 Φ 最大时 ε = 0，Φ = 0（线圈平面与 B 平行）时 ε 最大：电压跟的是 Φ 变化的快慢，不是 Φ 本身（<a class="xlink" href="../../../math/calculus/derivative/#step2">→ 导数 第 2 步：每一点的斜率连成新函数</a>）。',
    fSlider: '转速 f（圈/秒）', B4Slider: '磁感应强度 B（T）', NSlider: '匝数 N', thetaSlider: '此刻转角 θ（°）', spin: '转起来', pause: '暂停',
    c4a: '端视：线圈（橙）绕垂直纸面的轴转，B 向右', c4b: '每匝的磁通量 Φ（mWb）随时间 t（s）', c4c: '感应电动势 ε（V）随时间 t（s）', t3Slider: '已经过的时间 t（s）',
    s4lgCoil: '线圈平面', s4lgN: '法线', s4lgPhi: 'Φ(t)', s4lgE: 'ε(t)',
    s4readout: '峰值 ε₀ = NBSω = {peak} V（ω = 2πf = {w} rad/s），有效值 ε₀/√2 = {rms} V。此刻 θ = {th}°：每匝 Φ = {phi} mWb，ε = {e} V。{note}',
    s4maxPhi: '线圈正对磁场，Φ 最大，但此刻 Φ 不变化，ε = 0。', s4zeroPhi: '线圈平面与 B 平行，Φ = 0，但此刻 Φ 变得最快，ε 达到峰值。',
    s4hint: '观察顺序：按「转起来」，看「Φ」和「ε」两张图错开四分之一周期：Φ（紫）到顶时 ε（青）过零。暂停后拖「此刻转角」，在 θ = 0° 和 90° 处对照读数。再只把 f 加倍：曲线变密，同时峰值也加倍（灰线是上一组设置的 ε，纵轴会自动放宽，两条线同在一张图上比），因为变化更快。B 或 N 加倍只让峰值加倍。家用电网是 50 Hz，比这里快得多。',

    s5k: '第 5 步 · 收束',
    s5t: '电磁感应的三句话',
    s5fin: '<strong>磁通量 Φ = B·S·cosθ 一变，线圈里就有电动势：ε = −N·ΔΦ/Δt。</strong>变得越快电压越大，但「电压 × 时间」只由变了多少决定；方向总是阻碍这个变化；让 B、S、θ 中任何一个持续变化（磁铁穿过、导体棒滑动、线圈转动），就得到持续的电压。',
    formula: 'Φ = B·S·cosθ\nε = −N·ΔΦ/Δt\nε棒 = B·L·v\nε转 = NBSω·sin ωt',
    boundary: '适用范围：本页忽略线圈自身的电感（电流变化在自己身上产生的感应电动势），磁铁看作点状磁偶极子，并按设定的速度匀速运动（真实磁铁会被楞次定律的力拖慢），导轨无摩擦、棒与导轨电阻不计；数值是理想化的教学示例。',
    quizPrompt: '想一想：第 1 步里把变化用时 τ 减半（Bmax 不变），上升段的 ε 和阴影面积 ∫ε dt 会怎样？',
    quizA: 'ε 加倍，面积也加倍', quizB: 'ε 加倍，面积不变', quizC: 'ε 不变，面积减半',
    check: '核对', correct: '对。ε = −N·S·Bmax/τ，τ 减半 ε 加倍；但持续时间也减半，面积 = ε·τ = −N·S·Bmax 不变：它只由磁通量总共变了多少决定。',
    wrong: '再看看第 1 步：拖 τ 时矩形变高了，也变窄了。面积 = 高 × 宽。',
    linksTitle: '接着去看',
    lk1: '→ 磁场与洛伦兹力 第 0 步：棒里的电荷为什么会被推着走',
    lk2: '→ 导数 第 2 步：「变化率」本身就是一个新函数',
    lk3: '→ 磁铁 第 2 步：磁感线长什么样',
    lk4: '→ 欧姆定律 第 0 步：有了电动势，电流由电阻决定',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《电磁感应 · 磁通量一变，电压就来》的平行版本。'
  },
  en: {
    pageTitle: 'Electromagnetic Induction · Change the Field Through a Coil, Get a Voltage',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Electromagnetic Induction · Change the Flux, Get a Voltage →',
    navLabel: 'Electromagnetic induction steps',
    tagline: 'Take a loop of wire with no battery at all: as long as the magnetic field through it is changing, a voltage appears across its ends. Generators, transformers and wireless chargers all rest on that one fact. Over six steps you will learn to count how much field threads a coil, see that how fast it changes sets the size of the voltage and which way it changes sets the direction of the current, and finally spin up an AC generator yourself.',
    nav0: '0 Flux', nav1: '1 How fast', nav2: '2 Which way', nav3: '3 Sliding rod', nav4: '4 Generator', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Counting first',
    s0t: 'Tilt the coil: does more field pass through it, or less?',
    s0e: 'This step asks: what single number says how much magnetic field passes through a coil? The <strong>magnetic field strength</strong> B (in tesla, T) says how strong the field is; drawn as field lines, larger B means denser lines. The coil encloses an area S. Its <strong>normal</strong> is the direction perpendicular to the coil’s plane, and θ is the angle between the normal and B. Only the part of B along the normal really passes through, so we define the <strong>magnetic flux</strong> <strong>Φ = B·S·cosθ</strong>, in webers (Wb; 1 Wb = 1 T·m²); think of it as the number of field lines threading the coil. At θ = 0 the coil faces the field squarely and Φ is largest; at θ = 90° it is edge-on and Φ = 0; beyond 90° the field enters through the other face, so Φ counts as negative. In the side view the coil shows up as a single edge (orange); the green arrow is its normal, and the cyan band is the coil’s extent across the field: only field lines inside that band pass through the coil.',
    BSlider: 'Field strength B (T)', aSlider: 'Side of the square coil a (cm)', thSlider: 'Angle between normal and B, θ (°)',
    c0a: 'Side view: vertical lines are field lines, orange is the coil', c0b: 'Φ (mWb) against θ (°)',
    s0lgCoil: 'coil (edge-on)', s0lgNormal: 'normal', s0lgThrough: 'field lines through the coil', s0lgCurve: 'Φ = BS·cosθ', s0lgPrev: 'curve for the previous setting', s4lgPrev: 'ε for the previous setting', s3lgTau: 'at t = τ',
    s0readout: 'Φ = B·S·cosθ = {B} T × {S} m² × cos {th}° = {phi} mWb. Projected across the field, the coil is {w} cm wide, and {n} field lines in the picture pass through it.',
    s0hint: 'What to try: drag only θ from 0° to 180°. The projected width shrinks and fewer lines pass through; at 90° none do; past 90° they enter through the other face and the dot in the “Φ against θ” plot follows the cosine into negative values. Then drag only B: the lines crowd or thin out and the whole curve scales (grey is the curve for the previous setting). Finally drag the side a from 6 cm to 12 cm: the band in the side view doubles in width, but a side view shows only one width; the other side has doubled too, so the area, and Φ, grow fourfold.',

    s1k: 'Step 1 · Faraday’s law',
    s1t: 'A strong but steady field: is there a voltage? What if the field changes faster?',
    s1e: 'This step asks: what sets the voltage across a coil? Faraday found that a voltage appears only while <strong>the magnetic flux Φ (B·S·cosθ) through the coil is changing</strong>. It is called the <strong>induced electromotive force</strong> (emf) ε, and its size is the rate of change of the flux times the number of turns N: <strong>ε = −N·ΔΦ/Δt</strong> (the minus sign is about direction, the subject of the next step). Here the coil has N = 100 turns and area S = 0.01 m² (10 cm × 10 cm), facing the field squarely. The field rises steadily from 0 to Bmax over τ seconds, holds for a while, then falls back to 0 over another τ seconds. The top plot is B, the bottom one ε; the shaded area under ε, ∫ε dt, is the running total of voltage × time.',
    BmaxSlider: 'Peak field Bmax (T)', tauSlider: 'Time taken to change τ (s)', run: 'Run it in real time', running: 'Running…',
    c1a: 'Field B (T) against time t (s)', c1b: 'Induced emf ε (V) against time t (s)',
    s1lgB: 'B(t)', s1lgE: 'ε(t); shading = ∫ε dt', s1lgOld: 'earlier τ values',
    s1readout: '{now}During the {tau} s rise, ε = −N·S·Bmax/τ = {e} V; while B holds steady at {B} T, ε = 0. The shaded area of the rise, ∫ε dt = {area} V·s, equals −N·S·Bmax = {nsb} V·s whatever τ is.',
    s1now: 't = {t} s · ',
    s1hint: 'What to try: drag only τ from 1.2 s down to 0.1 s. The rectangle in the lower plot gets taller and narrower (grey ones are earlier τ values), yet the shaded area never changes: voltage × time depends only on how much the flux changed. Then drag only Bmax: height and area scale together. Press “Run it in real time” to watch B and ε trace out; while B sits high, ε drops back to 0.',

    s2k: 'Step 2 · Lenz’s law',
    s2t: 'A magnet passes through a coil: which way does the induced current circulate?',
    s2e: 'This step asks: what direction does the minus sign in ε = −N·ΔΦ/Δt describe? <strong>Lenz’s law</strong>: the magnetic field made by the induced current always <strong>opposes</strong> the change in flux that produced it. If the flux Φ through the coil is growing, the induced field threads the coil the opposite way; if Φ is shrinking, it threads the same way to make up the loss. Put another way: as a magnet approaches, the face of the coil toward it becomes the same pole and pushes it back; as it leaves, that face becomes the opposite pole and holds it back. Here the magnet moves along the coil’s axis (left–right); the coil has 100 turns and a 2 cm radius. Flux to the right counts as positive. “Send the magnet through” runs in slow motion: the animation takes 4 s to cover 16 cm, which a real magnet at 1 m/s crosses in 0.16 s.',
    zSlider: 'Magnet centre z (cm; the coil is at 0)', vSlider: 'Magnet velocity v (m/s; positive = rightward)', flip: 'Turn the magnet round', pass: 'Send the magnet through',
    c2a: 'Side view: magnet, coil and induced current', c2b: 'Flux NΦ (mWb) against z', c2c: 'Induced emf ε (V) against z',
    s2lgMag: 'magnet (red N / blue S)', s2lgCur: 'current at the top and bottom of the coil: ⊙ out of the page, ⊗ into it', s2lgInd: 'induced field at the coil centre', s2lgForce: 'force of the coil on the magnet (direction only)',
    s2readout: 'Magnet at z = {z} cm, {moving}. Its field threads the coil pointing {fdir}, and that flux is {trend}; ε = {e} V. The induced current’s field at the coil centre points {dir}, so the face nearest the magnet behaves as the {face} pole of a magnet, which against the magnet’s {mface} pole means {rel}: it {effect}.',
    s2still: 'Magnet at z = {z} cm and not moving: the flux is constant, ε = 0, so there is no induced current and no force.',
    s2center: 'The magnet is right at the coil centre: the flux is at its largest but for this instant neither rising nor falling, so ε = 0. This is the moment the current reverses.',
    movRight: 'moving right at {v} m/s', movLeft: 'moving left at {v} m/s',
    trendUp: 'increasing', trendDown: 'decreasing', dirRight: 'right', dirLeft: 'left',
    relRepel: 'like poles repelling', relAttract: 'unlike poles attracting', effApproach: 'resists the approach', effLeave: 'resists the departure',
    s2hint: 'What to try: press “Send the magnet through” and watch the lower plot trace one positive and one negative peak: one direction on the way in, the other on the way out, zero in the middle. Press “Turn the magnet round” and run it again: both peaks flip. Finally drag only v: the peak height is proportional to speed, and a negative v (moving left) flips both peaks too. The orange arrow always points against the magnet’s motion.',

    s3k: 'Step 3 · A rod cutting field lines',
    s3t: 'Give a metal rod on rails a push and let go: why does it slow to a stop?',
    s3e: 'This step asks: what happens if the field and the coil stay put and only one side of the circuit moves? Two parallel rails L = 0.5 m apart are joined at the left by a resistor R and sit in a uniform field B = 1 T pointing out of the page. A metal rod (0.1 kg) slides right at speed v. The area enclosed by the circuit grows by L·v every second, so the flux Φ (B × area) grows by B·L·v every second, and <strong>ε = B·L·v</strong>, driving a current I = ε/R. By Lenz’s law that current resists the growth: the current-carrying rod feels a magnetic (<strong>Ampère</strong>) force F = B·I·L opposite to its motion (<a class="xlink" href="../../../physics/electromagnetism/magnetic-force/#step0">→ Magnetic force, step 0: the force on a moving charge</a>). With no friction and nobody pushing, the rod’s kinetic energy turns bit by bit into heat in the resistor, and its speed decays as v = v₀·e^(−t/τ) with τ = mR/(B²L²).',
    v0Slider: 'Initial speed v₀ (m/s)', RSlider: 'Resistance R (Ω)', push: 'Give it a push and let go',
    c3a: 'Top view: ⊙ is the field out of the page; cyan arrows are the current', c3b: 'Speed v (m/s) against time t (s)',
    s3lgArea: 'loop area (growing)', s3lgCur: 'induced current', s3lgF: 'Ampère force', s3lgV: 'v(t)', s3lgOld: 'earlier v(t)',
    s3readout: 't = {t} s: v = {v} m/s. ε = BLv = {emf} V, I = ε/R = {I} A, Ampère force F = BIL = {F} N (to the left). So far the resistor has produced {Q} J of heat, exactly the kinetic energy the rod has lost. Time constant τ = mR/(B²L²) = {tau} s; in the end the rod slides v₀τ = {xmax} m.',
    s3hint: 'What to try: press “Give it a push and let go” and watch the rod slide off and slow down while the “speed against time” plot traces a decay; the orange dashed line marks t = τ, where the speed is down to 37% of v₀. Raise only R: the current and the drag both shrink, the rod glides further and the curve falls more slowly (grey is the earlier curve). Double only v₀: same shape, twice as high, twice the distance.',

    s4k: 'Step 4 · A generator',
    s4t: 'Keep a coil spinning in a field: what voltage do you get?',
    s4e: 'This step asks: how can the flux keep changing, so the voltage never stops? Spin a coil of N turns and area S = 0.01 m² in a uniform field B at f turns per second. The angle θ = ωt between its normal and B keeps changing; ω = 2πf is the <strong>angular speed</strong> (radians per second). Each turn has flux Φ = B·S·cos ωt (step 0), and Faraday’s law ε = −N·ΔΦ/Δt gives <strong>ε = N·B·S·ω·sin ωt</strong>: a voltage whose size and direction swing back and forth, that is, <strong>alternating current</strong>. The peak is ε₀ = NBSω. The <strong>effective (RMS) value</strong> of an alternating voltage is the steady voltage that would heat a resistor equally; for a sine wave it is ε₀/√2. Notice that ε = 0 when Φ is largest and ε is largest when Φ = 0 (coil plane parallel to B): the voltage follows how fast Φ changes, not Φ itself (<a class="xlink" href="../../../math/calculus/derivative/#step2">→ Derivative, step 2: slopes at every point make a new function</a>).',
    fSlider: 'Spin rate f (turns per second)', B4Slider: 'Field strength B (T)', NSlider: 'Turns N', thetaSlider: 'Current angle θ (°)', spin: 'Spin it', pause: 'Pause',
    c4a: 'End view: the coil (orange) turns about an axis into the page; B points right', c4b: 'Flux per turn Φ (mWb) against time t (s)', c4c: 'Induced emf ε (V) against time t (s)', t3Slider: 'Elapsed time t (s)',
    s4lgCoil: 'plane of the coil', s4lgN: 'normal', s4lgPhi: 'Φ(t)', s4lgE: 'ε(t)',
    s4readout: 'Peak ε₀ = NBSω = {peak} V (ω = 2πf = {w} rad/s), effective value ε₀/√2 = {rms} V. Right now θ = {th}°: Φ per turn = {phi} mWb, ε = {e} V. {note}',
    s4maxPhi: 'The coil faces the field: Φ is at its largest but not changing at this instant, so ε = 0.', s4zeroPhi: 'The coil’s plane is parallel to B: Φ = 0, but it is changing fastest, so ε is at its peak.',
    s4hint: 'What to try: press “Spin it” and see the “Φ” and “ε” plots sit a quarter period apart: when Φ (violet) peaks, ε (cyan) crosses zero. Pause and drag the current angle to compare the readouts at θ = 0° and 90°. Double only f: the curves pack closer and the peak doubles too (grey is ε for the previous setting; the vertical axis widens so both fit), because the flux changes faster. Doubling B or N only doubles the peak. Mains electricity runs at 50 Hz, far faster than anything here.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Electromagnetic induction in three sentences',
    s5fin: '<strong>Change the flux Φ = B·S·cosθ through a coil and an emf appears: ε = −N·ΔΦ/Δt.</strong> The faster the change, the bigger the voltage, but voltage × time depends only on how much the flux changed; the direction always opposes the change; and keeping any of B, S or θ changing (a magnet passing, a rod sliding, a coil spinning) keeps the voltage coming.',
    formula: 'Φ = B·S·cosθ\nε = −N·ΔΦ/Δt\nε_rod = B·L·v\nε_spin = NBSω·sin ωt',
    boundary: 'Where this holds: this page ignores the coil’s own inductance (the emf a changing current induces in its own circuit), treats the magnet as a point magnetic dipole moving at the set speed (a real one would be slowed by the Lenz force), and assumes frictionless rails with no rod or rail resistance; the numbers are idealised teaching examples.',
    quizPrompt: 'Think: in step 1, halve the change time τ (same Bmax). What happens to ε during the rise and to the shaded area ∫ε dt?',
    quizA: 'ε doubles and so does the area', quizB: 'ε doubles; the area stays the same', quizC: 'ε stays the same; the area halves',
    check: 'Check', correct: 'Right. ε = −N·S·Bmax/τ, so halving τ doubles ε; but it lasts half as long, and the area ε·τ = −N·S·Bmax is unchanged: it depends only on how much the flux changed in total.',
    wrong: 'Look again at step 1: dragging τ makes the rectangle taller and also narrower. Area = height × width.',
    linksTitle: 'Where to go next',
    lk1: '→ Magnetic force, step 0: why the charges in the rod get pushed along',
    lk2: '→ Derivative, step 2: a rate of change is a new function in its own right',
    lk3: '→ Magnets, step 2: what field lines look like',
    lk4: '→ Ohm’s law, step 0: once there is an emf, the resistance sets the current',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Electromagnetic Induction · Change the Flux, Get a Voltage”.'
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
