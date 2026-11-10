'use strict';
// Lorentz-force lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '洛伦兹力 · 只拐弯，不加速',
    back: '← 知识索引',
    compare: '对照另一版本：磁场与洛伦兹力 · 力总是垂直于速度 →',
    navLabel: '洛伦兹力步骤导航',
    tagline: '一个带电粒子飞进磁场，磁场对它有力，可它的速率一点没变，只是不停地拐弯。已知：粒子的电荷、质量、速度和磁场强弱。想求：力朝哪、圆多大、转一圈多久，以及人们怎样利用这几条称原子质量、造加速器。',
    nav0: '0 力朝哪', nav1: '1 不做功', nav2: '2 半径', nav3: '3 周期', nav4: '4 质谱仪', nav5: '5 回旋加速器', nav6: '6 收束',
    lgV: '速度 v', lgF: '洛伦兹力 F', lgB: '磁场 B（× 向里，· 向外）',

    s0k: '第 0 步 · 方向',
    s0t: '带电粒子在磁场里运动，磁场对它的力朝哪边？',
    s0e: '这一步要回答：磁场推一个运动的电荷时，往哪个方向推？<strong>磁场</strong>用磁感应强度 B 描述（单位特斯拉 T），本页所有平面图里 B 都垂直于屏幕：画 × 表示穿进屏幕，画 · 表示穿出屏幕（<a class="xlink" href="../../../physics/electromagnetism/magnets/#step2">→ 磁铁第 2 步：用铁屑看见磁场</a>）。磁场对运动电荷的力叫<strong>洛伦兹力</strong>。速度 v 与 B 垂直时，它的大小 F = qvB（q 是电荷量）。方向用<strong>左手定则</strong>：伸开左手，让磁感线垂直穿入手心，四指指向正电荷的运动方向，拇指所指就是力的方向；负电荷受力方向相反。这里用教学单位：|q| = 1，v = 1，B = 1，所以 F = 1。',
    ang0: '速度方向（从右方起逆时针，度）', qPos: '正电荷 +q', qNeg: '负电荷 −q', bIn: 'B 穿进屏幕 ×', bOut: 'B 穿出屏幕 ·',
    c0a: '粒子、速度 v 与洛伦兹力 F',
    cw: '顺时针', ccw: '逆时针',
    s0readout: 'v 指向 {va}°，F 指向 {fa}°：F 是把 v {dir}转 90° 得到的，两者夹角 {ang}°（F·v = {dot}）。大小 F = |q|vB = {F}。',
    s0hint: '观察顺序：先只拖速度方向：橙色力箭头跟着转，始终和青色速度箭头成直角。再只切换「负电荷」：力箭头反向。再把电荷换回正、切换 B 的方向：力箭头也反向。电荷和 B 同时反向，力回到原来的方向。',

    s1k: '第 1 步 · 不做功',
    s1t: '洛伦兹力一直推着粒子，粒子会越跑越快吗？',
    s1e: '这一步要回答：一个始终存在的力，为什么不改变速率？力让物体动能增加，靠的是<strong>做功</strong>：一小段时间 Δt 里，力做的功 = F·v·cosθ·Δt，θ 是力和速度的夹角。洛伦兹力始终和速度成 90°，cos 90° = 0，它一点功也不做，动能 ½mv² 不变，速率也就不变；它只改变速度的方向。作为对照，换成方向固定的<strong>电场力</strong> qE（<a class="xlink" href="../../../physics/electromagnetism/electric-fields/#step4">→ 电场第 4 步：放开一个电荷，电场力推着它加速</a>）：它不随速度转，与速度的夹角小于 90°，持续做正功，粒子越来越快。两种情况从同一点、以同样的速度（向右，速率 1）出发。教学单位：m = 1，q = +1，B = 1（穿进屏幕），E = 0.2（向上）。功由数值积分 ∫F·v dt 算出，不是用公式写的。',
    t1: '已经过的时间 t', fieldB: '磁场 B', fieldE: '电场 E（对照）', play1: '从 t = 0 播放',
    s1lgB: '磁场中的路径与动能', s1lgE: '电场中的路径与动能（对照）',
    c1a: '路径（等比例坐标）', c1b: '动能 ½mv² 随时间',
    s1readout: '{field}，t = {t}：速率 {v}，动能 {ke}；力与速度夹角 {ang}°；力累计做功 {w}（动能变化 {dke}）。',
    s1nameB: '磁场', s1nameE: '电场',
    s1hint: '观察顺序：先选「磁场」并播放：粒子画出一个圆，下图青色动能线一直是水平的。再选「电场」播放：路径弯成抛物线，粉色动能线向上翘。读数里的夹角：磁场中始终 90°，电场中从 90° 开始逐渐变小。两条历史线都留在图上，方便对比。',

    s2k: '第 2 步 · 半径',
    s2t: '粒子转的圆有多大？由谁决定？',
    s2e: '这一步要回答：已知速度、磁场、质量和电荷，圆的半径是多少？速率不变、力始终垂直于速度，粒子做<strong>匀速圆周运动</strong>，需要一个指向圆心、大小 mv²/r 的力（<strong>向心力</strong>，<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step3">→ 抛体与圆周第 3 步：做圆周运动需要多大的向心力</a>）。这里提供它的正是洛伦兹力 qvB。令两者相等：qvB = mv²/r，得 <strong>r = mv/(qB)</strong>。速度越大圆越大：转弯需要的力随 v² 增长，洛伦兹力却只随 v 增长；B 或 q 越大，圆越小；质量越大越难拐弯。页面不直接画公式的圆：它用数值积分（RK4，步长 0.002）把粒子推完一整圈，把离起点最远的距离（直径）除以 2 作为<strong>测得的半径</strong>，再与公式比。教学单位，q = +1，B 穿进屏幕。',
    v2: '速度 v', B2: '磁场 B', m2: '质量 m', play2: '绕一圈', clearRec: '清除记录',
    c2a: '轨迹（等比例坐标，起点在原点）', c2b: '测得的半径 与 mv/(qB)',
    s2lgNow: '当前轨迹', s2lgOld: '之前试过的轨迹', s2lgLine: 'r = mv/(qB)', s2lgPts: '测得的半径',
    s2readout: 'v = {v}，B = {B}，m = {m}：公式 r = mv/(qB) = {rf}，数值积分测得 r = {rm}（相差 {dev}）。已记录 {n} 组。',
    s2hint: '观察顺序：每次只动一个滑杆。只把 v 从 1 拖到 2：圆的直径翻倍，旧圆留作灰色对照；只把 B 从 1 拖到 2：圆缩成一半；只把 m 从 1 拖到 2：圆翻倍。「测得的半径 与 mv/(qB)」图每次多一个白点，所有点都落在同一条斜率为 1 的直线上：测得的半径就是 mv/(qB)。',

    s3k: '第 3 步 · 周期',
    s3t: '跑得快的粒子圆更大，它绕一圈用的时间更长吗？',
    s3e: '这一步要回答：<strong>周期</strong> T（绕一整圈所用的时间）和速度有什么关系？直觉是：快的粒子圆大、路长，可能慢一些回来。算一下：T = 周长 ÷ 速率 = 2πr/v = 2π·(mv/qB)/v = <strong>2πm/(qB)</strong>，速度约掉了。圆的周长和速度同比例变大，两者恰好抵消。页面让三个粒子（q = +1，速度 0.5、1、1.5）同时从原点、沿同一方向出发：它们的圆在起点相切，大小不同。下图是每个粒子的速度方向已经转过多少圈（转过的角度 ÷ 360°）随时间的变化，由数值积分测出。T 只取决于 m、q、B；这一条要到速度接近光速时才失效（见第 5 步）。',
    B3: '磁场 B', m3: '质量 m（三个粒子相同）', t3: '已经过的时间 t', play3: '从 t = 0 播放两圈',
    s3lg1: 'v = 0.5', s3lg2: 'v = 1', s3lg3: 'v = 1.5', s3lgT: '公式周期 T 的整数倍',
    c3a: '三个粒子的轨迹（等比例坐标）', c3b: '速度方向已转过的圈数 随时间',
    s3readout: 'B = {B}，m = {m}：半径 {r1}、{r2}、{r3}；公式 T = 2πm/(qB) = {T}。\n数值积分测得三者转满一圈用时 {T1}、{T2}、{T3}。t = {t}：三者都已转过 {laps} 圈。',
    s3hint: '观察顺序：按播放，盯住三个速度箭头：无论哪一时刻它们都互相平行，说明三者转过的角度一样；每到一个周期，三个粒子同时回到原点。下图三条线完全重合。再把 B 加倍：三条线一起变陡，周期减半；把 m 加倍：周期加倍。',

    s4k: '第 4 步 · 质谱仪',
    s4t: '同位素化学性质几乎相同，怎样把它们分开、称出质量？',
    s4e: '这一步要回答：怎样用磁场「称」原子的质量？同一种元素的<strong>同位素</strong>质子数相同、中子数不同，所以质量不同（<a class="xlink" href="../../../chemistry/matter/atomic-structure/#step1">→ 原子结构第 1 步：质子数决定元素，中子只改质量</a>）。<strong>质谱仪</strong>先让带一个元电荷 e = 1.602 × 10⁻¹⁹ C 的正离子从静止经电压 U 加速：电场做功 eU 全部变成动能，eU = ½mv²，v = √(2eU/m)。离子再从狭缝垂直进入匀强磁场 B，走半个圆，打在与狭缝齐平的底片上，落点到狭缝的距离 <strong>x = 2r = (2/B)·√(2mU/e)</strong>。所以质量大的落得更远，x 与 √m 成正比；反过来由落点算质量：m = eB²x²/(8U)。这里是氖的三种同位素 ²⁰Ne、²¹Ne、²²Ne（真实质量，SI 单位，忽略离子少一个电子的质量）。上图是装置（比例固定，刻度为厘米）；下图把底片上的落点附近放大，刻度为毫米。',
    U4: '加速电压 U（V）', B4: '磁场 B（T）',
    iso20: '²⁰Ne（19.992 u）', iso21: '²¹Ne（20.994 u）', iso22: '²²Ne（21.991 u）',
    c4a: '离子源 → 加速 → 狭缝 → 磁场中的半圆 → 底片（厘米）', c4b: '底片落点放大（毫米，以 ²¹Ne 落点为中心）',
    s4readout: '落点 x：²⁰Ne {x0} cm，²¹Ne {x1} cm，²²Ne {x2} cm；²⁰Ne 与 ²²Ne 相距 {dx} mm（是 x 的 {rel}）。\n²⁰Ne 进入磁场的速度 {v0} km/s。由 ²²Ne 的落点反推：m = eB²x²/(8U) = {mr} u。',
    s4hint: '观察顺序：先只调 U：所有半圆一起变大，下图三个落点之间的距离也变大（都与 √U 成正比）。再只调 B：所有半圆一起变小（与 1/B 成正比）。无论怎样调，两种同位素的间距总是落点距离的约 4.9%：比例由质量比 √(21.991/19.992) 决定，调 U 和 B 只能整体放大或缩小。',

    s5k: '第 5 步 · 回旋加速器',
    s5t: '怎样用几万伏的电压，把质子加速到上千万电子伏？',
    s5e: '这一步要回答：第 3 步的「周期与速度无关」有什么用？<strong>回旋加速器</strong>：两个 D 形空心金属盒放在匀强磁场里，中间留一条窄缝，缝上加交变电压 U。质子每穿过一次窄缝被电场加速一次，获得能量 eU；在盒内，磁场让它走半圈回到窄缝。半圈用时 T/2 = πm/(eB)，与速度无关，所以只要交变电压的频率等于<strong>回旋频率</strong> f_c = eB/(2πm)，质子每次回到窄缝时电压恰好换了方向，次次都被加速。能量变大，半径 r = √(2mE_k)/(eB) 跟着变大，走到 D 盒边缘 R 时被引出，最大动能 <strong>E_max = e²B²R²/(2m)</strong>，与 U 无关；U 只决定要过多少次窄缝。<strong>电子伏特</strong> eV 是一个元电荷经过 1 V 电压获得的能量，1 MeV = 1.602 × 10⁻¹³ J。页面逐次过缝记账：R = 0.5 m，质子，窄缝很薄、忽略穿缝时间、不计相对论。δ 是交变电压频率比回旋频率高出的百分比：δ ≠ 0 时，每次到缝的时刻与电压峰值错开一点，错开量逐次累积。',
    B5: '磁场 B（T）', U5: '缝上电压 U（kV）', d5: '频率偏差 δ（%）', play5: '播放加速过程', end5: '直接看结果',
    s5lgPath: '本次轨迹与能量', s5lgPrev: '上一次设置的能量曲线', s5lgMax: '引出能量 E_max',
    c5a: 'D 形盒与质子轨迹（等比例）', c5b: '动能（MeV）随时间（μs）',
    st_extracted: '已引出：过缝 {n} 次、用时 {t} μs 后到达 R，动能 {e} MeV。',
    st_stalled: '失步：相位逐次错开，先被加速、后被减速，第 {n} 次过缝时被减速到停下；途中最高 {peak} MeV。',
    st_limit: '过缝 {n} 次后仍未到达 R，最高 {peak} MeV。',
    s5progress: '播放中：第 {k}/{n} 次过缝，{e} MeV。',
    s5readout: 'f_c = {fc} MHz，交变电压 {frf} MHz（δ = {d}%）。{status}\nE_max = e²B²R²/(2m) = {emax} MeV；同步时需过缝 {need} 次。此设置下 |δ| 不超过约 {tol}% 才能引出。按相对论，{emax} MeV 的质子质量增加 {g}%，回旋周期也变长 {g}%。',
    s5hint: '观察顺序：先保持 δ = 0 播放：轨迹一圈圈向外扩，「动能随时间」图里能量沿直线上升，到 E_max 停止。把 U 加倍：圈数减半，但 E_max 不变；把 B 加大：E_max 按 B² 增大。再把 δ 拖到 0.5%：能量先升后降，质子没到边缘就停下（灰线是上一次的曲线，留作对照）。读数最后一句给出相对论修正的大小：在默认设置下，质子到出口时周期已变长约 1.3%，是允许偏差（约 0.13%）的近 10 倍。这是普通回旋加速器难以把质子推到更高能量的主要原因（后来的等时性回旋加速器让 B 随半径略微增强来补偿）。',

    s6k: '第 6 步 · 收束', s6t: '只拐弯、不加速，却能称质量、造加速器',
    s6fin: '回头串一遍。<strong>第 0 步</strong>：洛伦兹力 F = qvB，用左手定则定方向，始终垂直于速度。<strong>第 1 步</strong>：因为垂直，它不做功，速率不变，只改方向。<strong>第 2 步</strong>：它充当向心力，qvB = mv²/r，r = mv/(qB)。<strong>第 3 步</strong>：周期 T = 2πm/(qB) 与速度无关。<strong>第 4 步</strong>：同样加速的离子，半径与 √m 成正比，质谱仪由落点称出质量。<strong>第 5 步</strong>：周期与速度无关，让固定频率的交变电压能一次次给质子加速，最大能量由 B 和 D 盒半径决定。',
    formula: 'F = qvB（v ⊥ B）\nr = mv/(qB)\nT = 2πm/(qB)',
    boundary: '适用范围：本页是单个带电粒子在匀强磁场中的运动，速度与 B 垂直；若速度有沿 B 的分量，力只与垂直分量有关，F = qvB·sinθ，粒子沿 B 方向匀速前进、同时转圈，走螺旋线。不计重力、辐射和粒子间作用。第 0–3 步是教学单位，第 4–5 步是 SI 单位。回旋加速器按非相对论计算，只给出相对论修正的大小作对比；真实加速器还有穿缝时间、磁场边缘和束流聚焦等问题。',
    quizPrompt: '想一想：一台回旋加速器已经调好给质子用（B、频率都不变）。改放氘核（电荷与质子相同，质量约为 2 倍）进去，会怎样？',
    quizA: '照样加速到 D 盒边缘，只是最终能量减半', quizB: '回旋周期变成 2 倍，与电压不同步，几乎加速不起来', quizC: '氘核更重，加速得更快',
    check: '核对', correct: '对。T = 2πm/(qB)：质量加倍，周期加倍，回旋频率只剩一半。按第 5 步的默认设置逐次记账，氘核一次过缝加速、下一次就被减速，最高只到 {peak} MeV（就是一次过缝的 eU）。要加速氘核，得把频率减半或把 B 加倍。',
    wrong: '再想想：哪个量与速度无关、却与质量有关？质量加倍后，氘核回到窄缝时电压是什么方向？',
    linksTitle: '接着去哪里',
    lk1: '→ 抛体与圆周第 3 步：圆周运动需要多大的向心力',
    lk2: '→ 电场第 4 步：电场力怎样让电荷加速',
    lk3: '→ 电磁感应第 1 步：磁通量变化产生电压',
    lk4: '→ 狭义相对论第 5 步：能量与光速，速度越快越难加速',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《磁场与洛伦兹力 · 力总是垂直于速度》的平行版本。'
  },
  en: {
    pageTitle: 'The Lorentz Force · It Turns, It Never Speeds Up',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Magnetic Force · The Force Is Always Sideways to the Velocity →',
    navLabel: 'Lorentz force steps',
    tagline: 'A charged particle flies into a magnetic field. The field pushes on it, yet its speed does not change one bit; it just keeps turning. Given: the particle’s charge, mass and velocity, and the field strength. Wanted: which way the force points, how big the circle is, how long a lap takes, and how people use these facts to weigh atoms and build accelerators.',
    nav0: '0 Direction', nav1: '1 No work', nav2: '2 Radius', nav3: '3 Period', nav4: '4 Mass spectrometer', nav5: '5 Cyclotron', nav6: '6 Wrap-up',
    lgV: 'velocity v', lgF: 'Lorentz force F', lgB: 'field B (× into the screen, · out)',

    s0k: 'Step 0 · Direction',
    s0t: 'A charge moves through a magnetic field. Which way does the field push it?',
    s0e: 'This step asks: when a magnetic field pushes on a moving charge, in which direction? A <strong>magnetic field</strong> is described by its strength B (in tesla, T). In every diagram on this page B points straight through the screen: × means into the screen, · means out of it (<a class="xlink" href="../../../physics/electromagnetism/magnets/#step2">→ Magnets, step 2: iron filings make the field visible</a>). The push of a magnetic field on a moving charge is the <strong>Lorentz force</strong>, F = q v × B. When the velocity v is perpendicular to B its size is F = qvB, where q is the charge. For the direction, use the <strong>right-hand rule</strong>: point your fingers along v, curl them toward B, and your thumb gives F for a positive charge; for a negative charge the force is reversed. Teaching units here: |q| = 1, v = 1, B = 1, so F = 1.',
    ang0: 'Velocity direction (degrees, counter-clockwise from right)', qPos: 'Positive charge +q', qNeg: 'Negative charge −q', bIn: 'B into the screen ×', bOut: 'B out of the screen ·',
    c0a: 'The particle, its velocity v and the Lorentz force F',
    cw: 'clockwise', ccw: 'counter-clockwise',
    s0readout: 'v points at {va}°, F at {fa}°: F is v turned 90° {dir}, and the angle between them is {ang}° (F·v = {dot}). Size F = |q|vB = {F}.',
    s0hint: 'What to try: first drag only the velocity direction. The orange force arrow turns with it and stays at a right angle to the cyan velocity arrow. Then switch only to “Negative charge”: the force flips. Switch back to positive and flip B instead: the force flips again. Flip both the charge and B and the force points the original way.',

    s1k: 'Step 1 · No work',
    s1t: 'The Lorentz force never lets go. Does the particle keep speeding up?',
    s1e: 'This step asks: how can a force that is always there leave the speed unchanged? A force raises an object’s kinetic energy by doing <strong>work</strong>: in a short time Δt the work is F·v·cosθ·Δt, where θ is the angle between force and velocity. The Lorentz force is always at 90° to the velocity, and cos 90° = 0, so it does no work at all. Kinetic energy ½mv² stays fixed, and so does the speed; only the direction changes. For contrast, switch to an <strong>electric force</strong> qE of fixed direction (<a class="xlink" href="../../../physics/electromagnetism/electric-fields/#step4">→ Electric fields, step 4: release a charge and the field accelerates it</a>). It does not turn with the velocity, its angle to the velocity is below 90°, it keeps doing positive work, and the particle goes faster and faster. Both runs start at the same point with the same velocity (to the right, speed 1). Teaching units: m = 1, q = +1, B = 1 (into the screen), E = 0.2 (upward). The work is a numerical integral of F·v over time, not a formula.',
    t1: 'Elapsed time t', fieldB: 'Magnetic field B', fieldE: 'Electric field E (contrast)', play1: 'Play from t = 0',
    s1lgB: 'path and kinetic energy in the magnetic field', s1lgE: 'path and kinetic energy in the electric field (contrast)',
    c1a: 'Path (equal-scale axes)', c1b: 'Kinetic energy ½mv² over time',
    s1readout: '{field}, t = {t}: speed {v}, kinetic energy {ke}; angle between force and velocity {ang}°; work done by the force so far {w} (change in kinetic energy {dke}).',
    s1nameB: 'Magnetic field', s1nameE: 'Electric field',
    s1hint: 'What to try: choose “Magnetic field” and play. The particle draws a circle and the cyan kinetic-energy line below stays flat. Then choose “Electric field” and play: the path bends into a parabola and the pink energy line climbs. Watch the angle in the readout: always 90° in the magnetic field, starting at 90° and shrinking in the electric field. Both traces stay on the chart for comparison.',

    s2k: 'Step 2 · Radius',
    s2t: 'How big is the circle, and what sets its size?',
    s2e: 'This step asks: given the speed, field, mass and charge, what is the radius of the circle? With constant speed and a force always perpendicular to the velocity, the particle is in <strong>uniform circular motion</strong>, which needs a force of size mv²/r pointing at the centre (the <strong>centripetal force</strong>; <a class="xlink" href="../../../physics/mechanics/projectile-circular/#step3">→ Projectiles & circular motion, step 3: how much centripetal force a circle needs</a>). Here the Lorentz force qvB supplies it. Set the two equal: qvB = mv²/r, so <strong>r = mv/(qB)</strong>. Faster means a bigger circle, because the force needed to turn grows as v² while the Lorentz force only grows as v; a stronger B or a larger charge means a smaller circle; more mass means harder to turn. The page does not draw the formula’s circle. It pushes the particle around a full lap by numerical integration (RK4, step 0.002), takes the largest distance from the start point (a diameter) and halves it: that is the <strong>measured radius</strong>, compared with the formula. Teaching units, q = +1, B into the screen.',
    v2: 'Speed v', B2: 'Field B', m2: 'Mass m', play2: 'Go once around', clearRec: 'Clear record',
    c2a: 'Path (equal-scale axes, start at the origin)', c2b: 'Measured radius against mv/(qB)',
    s2lgNow: 'current path', s2lgOld: 'paths tried before', s2lgLine: 'r = mv/(qB)', s2lgPts: 'measured radius',
    s2readout: 'v = {v}, B = {B}, m = {m}: formula r = mv/(qB) = {rf}; measured by numerical integration r = {rm} (difference {dev}). Settings recorded: {n}.',
    s2hint: 'What to try: move one slider at a time. Drag only v from 1 to 2: the diameter doubles, with the old circle left in grey. Drag only B from 1 to 2: the circle shrinks to half. Drag only m from 1 to 2: the circle doubles. Each setting adds a white dot to the “measured radius against mv/(qB)” chart, and every dot lands on the same line of slope 1: the measured radius is mv/(qB).',

    s3k: 'Step 3 · Period',
    s3t: 'A faster particle runs a bigger circle. Does its lap take longer?',
    s3e: 'This step asks: how does the <strong>period</strong> T (the time for one full lap) depend on speed? Intuition says the fast particle has a bigger circle and a longer road, so it might come back later. Work it out: T = circumference ÷ speed = 2πr/v = 2π·(mv/qB)/v = <strong>2πm/(qB)</strong>. The speed cancels: the circumference grows in step with the speed. The page launches three particles (q = +1, speeds 0.5, 1 and 1.5) at the same moment from the origin in the same direction, so their circles touch at the start and differ in size. The bottom chart shows how many laps each particle’s velocity direction has turned through (angle turned ÷ 360°) over time, measured by numerical integration. T depends only on m, q and B; this stops being true only near the speed of light (see step 5).',
    B3: 'Field B', m3: 'Mass m (same for all three)', t3: 'Elapsed time t', play3: 'Play two laps from t = 0',
    s3lg1: 'v = 0.5', s3lg2: 'v = 1', s3lg3: 'v = 1.5', s3lgT: 'whole multiples of the formula period T',
    c3a: 'Paths of the three particles (equal-scale axes)', c3b: 'Laps the velocity has turned through, over time',
    s3readout: 'B = {B}, m = {m}: radii {r1}, {r2}, {r3}; formula T = 2πm/(qB) = {T}.\nMeasured by numerical integration, the three take {T1}, {T2}, {T3} to turn a full lap. At t = {t} all three have turned through {laps} laps.',
    s3hint: 'What to try: press play and watch the three velocity arrows. At every moment they are parallel, so all three have turned through the same angle, and at each whole period all three are back at the origin together. The three lines below lie exactly on top of one another. Double B: the lines steepen together and the period halves. Double m: the period doubles.',

    s4k: 'Step 4 · Mass spectrometer',
    s4t: 'Isotopes behave almost alike in chemistry. How do you separate and weigh them?',
    s4e: 'This step asks: how can a magnetic field weigh atoms? <strong>Isotopes</strong> of one element have the same number of protons and different numbers of neutrons, so their masses differ (<a class="xlink" href="../../../chemistry/matter/atomic-structure/#step1">→ Atomic structure, step 1: the proton count fixes the element; neutrons only change the mass</a>). A <strong>mass spectrometer</strong> first accelerates positive ions carrying one elementary charge e = 1.602 × 10⁻¹⁹ C from rest through a voltage U. The electric work eU all becomes kinetic energy, eU = ½mv², so v = √(2eU/m). Each ion then passes a slit into a uniform field B at right angles, follows half a circle and strikes a detector plate level with the slit, a distance <strong>x = 2r = (2/B)·√(2mU/e)</strong> from the slit. Heavier ions land farther out, with x proportional to √m; turned around, the landing point gives the mass: m = eB²x²/(8U). The ions here are the three isotopes of neon, ²⁰Ne, ²¹Ne and ²²Ne (real masses, SI units, ignoring the missing electron’s mass). The top drawing is the apparatus at a fixed scale, ruled in centimetres; the bottom strip magnifies the landing spots, ruled in millimetres.',
    U4: 'Accelerating voltage U (V)', B4: 'Field B (T)',
    iso20: '²⁰Ne (19.992 u)', iso21: '²¹Ne (20.994 u)', iso22: '²²Ne (21.991 u)',
    c4a: 'Ion source → acceleration → slit → half circle in the field → plate (cm)', c4b: 'Landing spots magnified (mm, centred on the ²¹Ne spot)',
    s4readout: 'Landing distance x: ²⁰Ne {x0} cm, ²¹Ne {x1} cm, ²²Ne {x2} cm; ²⁰Ne and ²²Ne land {dx} mm apart ({rel} of x).\n²⁰Ne enters the field at {v0} km/s. Working back from the ²²Ne spot: m = eB²x²/(8U) = {mr} u.',
    s4hint: 'What to try: first change only U. All the half circles grow together, and so do the gaps between the three spots below (everything scales as √U). Then change only B: all the half circles shrink together (as 1/B). Whatever you do, the gap between the two isotopes stays about 4.9% of the landing distance: the ratio is fixed by the mass ratio through √(21.991/19.992), and U and B only zoom the whole picture in or out.',

    s5k: 'Step 5 · Cyclotron',
    s5t: 'How do tens of kilovolts push a proton to over ten million electronvolts?',
    s5e: 'This step asks: what is “the period does not depend on speed” good for? A <strong>cyclotron</strong> puts two hollow D-shaped metal boxes (“dees”) in a uniform magnetic field, with a narrow gap between them and an alternating voltage U across the gap. Each time a proton crosses the gap the electric field gives it energy eU; inside a dee the magnetic field carries it half a turn back to the gap. Half a turn takes T/2 = πm/(eB), independent of speed, so if the voltage alternates at the <strong>cyclotron frequency</strong> f_c = eB/(2πm), the voltage has just reversed every time the proton returns, and every crossing speeds it up. As the energy grows the radius r = √(2mE_k)/(eB) grows with it; at the dee edge R the proton is extracted with the maximum kinetic energy <strong>E_max = e²B²R²/(2m)</strong>, which does not depend on U: U only decides how many crossings it takes. One <strong>electronvolt</strong> (eV) is the energy an elementary charge gains through 1 V; 1 MeV = 1.602 × 10⁻¹³ J. The page keeps the books crossing by crossing: R = 0.5 m, protons, a very thin gap with no transit time, no relativity. δ is how far, in percent, the voltage frequency sits above the cyclotron frequency: with δ ≠ 0 each arrival at the gap is a little off the voltage peak, and the offset builds up crossing after crossing.',
    B5: 'Field B (T)', U5: 'Gap voltage U (kV)', d5: 'Frequency offset δ (%)', play5: 'Play the acceleration', end5: 'Jump to the result',
    s5lgPath: 'this run’s path and energy', s5lgPrev: 'energy curve of the previous setting', s5lgMax: 'extraction energy E_max',
    c5a: 'The dees and the proton’s path (equal scale)', c5b: 'Kinetic energy (MeV) over time (μs)',
    st_extracted: 'Extracted: reached R after {n} crossings and {t} μs, with {e} MeV.',
    st_stalled: 'Out of step: the phase slips a little each time, so the proton is sped up, then slowed down, and is brought to rest at crossing {n}; the highest energy on the way was {peak} MeV.',
    st_limit: 'Still short of R after {n} crossings; highest energy {peak} MeV.',
    s5progress: 'Playing: crossing {k}/{n}, {e} MeV.',
    s5readout: 'f_c = {fc} MHz, gap voltage at {frf} MHz (δ = {d}%). {status}\nE_max = e²B²R²/(2m) = {emax} MeV; in step it takes {need} crossings. With these settings |δ| must stay within about {tol}% for extraction. By relativity a {emax} MeV proton is {g}% heavier, and its cyclotron period is {g}% longer.',
    s5hint: 'What to try: play with δ = 0 first. The path spirals outward lap by lap and the energy in the “kinetic energy over time” chart climbs in a straight line, stopping at E_max. Double U: half the crossings, the same E_max. Raise B: E_max grows as B². Then drag δ to 0.5%: the energy rises and falls again, and the proton stops before reaching the edge (the grey line is the previous run, kept for comparison). The last sentence of the readout gives the size of the relativistic correction: at the default settings the period has stretched by about 1.3% by extraction, nearly 10 times the allowed offset (about 0.13%). That is the main reason a plain cyclotron struggles to push protons higher (later isochronous cyclotrons compensate by letting B rise slightly with radius).',

    s6k: 'Step 6 · Wrap-up', s6t: 'It only turns, never speeds up, and still weighs atoms and builds accelerators',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: the Lorentz force F = qvB, with its direction from the right-hand rule, is always perpendicular to the velocity. <strong>Step 1</strong>: being perpendicular, it does no work, so the speed stays fixed and only the direction changes. <strong>Step 2</strong>: it serves as the centripetal force, qvB = mv²/r, so r = mv/(qB). <strong>Step 3</strong>: the period T = 2πm/(qB) does not depend on speed. <strong>Step 4</strong>: ions given the same acceleration have radii proportional to √m, so a mass spectrometer reads mass from the landing point. <strong>Step 5</strong>: because the period ignores speed, a fixed-frequency voltage can boost a proton over and over; the top energy is set by B and the dee radius.',
    formula: 'F = qvB (v ⊥ B)\nr = mv/(qB)\nT = 2πm/(qB)',
    boundary: 'Scope: this page follows a single charged particle in a uniform magnetic field with its velocity perpendicular to B. If the velocity has a part along B, the force only cares about the perpendicular part, F = qvB·sinθ, and the particle drifts steadily along B while it circles: a helix. Gravity, radiation and interactions between particles are ignored. Steps 0–3 use teaching units, steps 4–5 SI units. The cyclotron is treated non-relativistically, with the size of the relativistic correction shown only for comparison; real machines also deal with gap transit time, field edges and beam focusing.',
    quizPrompt: 'Think: a cyclotron is tuned for protons (B and the frequency stay as they are). Put deuterons in instead (same charge as a proton, about twice the mass). What happens?',
    quizA: 'They still reach the dee edge, just with half the final energy', quizB: 'Their period doubles, they fall out of step with the voltage and barely get going', quizC: 'Deuterons are heavier, so they accelerate faster',
    check: 'Check', correct: 'Right. T = 2πm/(qB): double the mass, double the period, half the cyclotron frequency. Keeping the books with step 5’s default settings, a deuteron is sped up at one crossing and slowed down at the next, and never gets past {peak} MeV (one crossing’s worth, eU). To accelerate deuterons, halve the frequency or double B.',
    wrong: 'Look again: which quantity ignores speed but depends on mass? With twice the mass, which way does the voltage point when the deuteron gets back to the gap?',
    linksTitle: 'Where to go next',
    lk1: '→ Projectiles & circular motion, step 3: how much centripetal force a circle needs',
    lk2: '→ Electric fields, step 4: how an electric force accelerates a charge',
    lk3: '→ Electromagnetic induction, step 1: changing magnetic flux makes a voltage',
    lk4: '→ Special relativity, step 5: energy and the speed of light, why fast things are hard to speed up',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Magnetic Force · The Force Is Always Sideways to the Velocity”.'
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
  if (typeof window.refreshLorentz === 'function') window.refreshLorentz();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MF_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
