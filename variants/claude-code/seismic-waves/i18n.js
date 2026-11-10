'use strict';
// Seismic waves lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '地震波探地心 · 没人去过的地核，是怎样被量出来的',
    back: '← 知识索引',
    compare: '对照另一版本：地震波探地心 · 地核是被波“照”出来的 →',
    navLabel: '地震波步骤导航',
    tagline: '人类钻得最深的井也只有十几千米，地心却在 6371 km 以下。我们对地球内部的了解，几乎都来自地震波：它们什么时候到、从哪里绕过来、在哪里消失。七步里你会用两种波的时间差算出震源距离、定出震中，再看波线在地球里怎样拐弯，以及液态外核怎样投下一片「影子」，让人量出地核的大小。',
    nav0: '0 时间差', nav1: '1 定震中', nav2: '2 波线拐弯', nav3: '3 影区', nav4: '4 S 波与走时', nav5: '5 量地核', nav6: '6 收束',

    s0k: '第 0 步 · S − P 时间差',
    s0t: 'P 波先到、S 波后到，相差的时间能说出震源多远吗？',
    s0e: '这一步要回答：一个地震台只记下一条地震图，能不能算出震源离它多远？地震同时发出两种体波。<strong>P 波</strong>（纵波）让岩石沿传播方向一压一松，跑得快；<strong>S 波</strong>（横波）让岩石垂直于传播方向来回错动，跑得慢，而且液体不能被「错动」，所以 S 波穿不过液体。本页取地壳里的典型速度 v_P = 6.0 km/s、v_S = 3.5 km/s。距离 d 时 P 波用 d/v_P 秒，S 波用 d/v_S 秒，两者之差叫 <strong>S − P 时间</strong>：d·(1/v_S − 1/v_P)。反过来 d = S − P × 8.4 km/s：差 1 秒，大约远 8.4 km。这和看到闪电后数秒算雷声多远是同一个道理（<a class="xlink" href="../../../physics/waves/sound-waves/#step4">→ 声波页第 4 步：由闪电和雷声的时间差算距离</a>）。',
    d0Slider: '震源到台站的距离 d（km）', play0: '从震源发出（重放）',
    c0a: '剖面：P 波（快）与 S 波（慢）的波前', c0b: '台站记下的地震图（示意波形，横轴：秒）',
    s0lgP: 'P 波', s0lgS: 'S 波', s0lgSP: 'S − P 间隔', s0lgSt: '台站',
    s0readout: 'd = {d} km：P 波 {tp} 秒后到，S 波 {ts} 秒后到，S − P = {sp} 秒。反算：{sp} × 8.4 ≈ {back} km。{prog}',
    s0prog: '（已过 {t} 秒）',
    s0hint: '观察顺序：先按「从震源发出」，看剖面里青色的 P 波前先扫过台站，橙色的 S 波前随后才到，地震图上同时画出两段波形。再拖 d：S − P 间隔（绿色）与 d 成正比，d 翻倍，间隔也翻倍；100 km 对应约 11.9 秒。地震图的形状只是示意，时刻是按速度算出来的。',

    s1k: '第 1 步 · 定震中',
    s1t: '只知道「离台站多远」，怎样找到震中在哪？',
    s1e: '这一步要回答：上一步只给出距离，不给方向，怎样定出<strong>震中</strong>（震源正上方的地面点）？以每个台站为圆心、以它算出的距离为半径画圆，震中一定在圆上。两个圆一般交于两点，分不清是哪一个；第三个台站的圆把答案定成一点。这里用 400 km × 400 km 的平面地图，三个台站 A、B、C，S − P 按第 0 步的速度由真实震中算出。真实观测有误差：可以让台站 B 的时钟偏差 δ 秒，看三个圆不再交于一点。此时用<strong>最小二乘</strong>估计：找一个点，使它到三台站的距离与三个半径之差的平方和最小。',
    ex1: '真实震中 x（km）', ey1: '真实震中 y（km）', dl1: '台站 B 的时钟偏差 δ（秒）',
    c1a: '地图（km）：三个台站的距离圆',
    s1lgSt: '台站', s1lgCirc: '距离圆', s1lgTrue: '真实震中', s1lgEst: '估计的震中',
    s1readout: 'S − P：A {a} 秒、B {b} 秒、C {c} 秒 → 半径 {ra}、{rb}、{rc} km。最小二乘估计在 ({x}, {y})，离真实震中 {miss} km；三个圆与估计点的距离误差均方根 {rms} km。',
    s1hint: '观察顺序：先保持 δ = 0，拖震中的 x、y：三个圆总是交于红色真实震中，估计点与它重合。再把 δ 拖到 +2：B 的圆变大，三个圆围出一个小三角形，估计点（白色十字）落在三角形里，偏离真实位置约 15 km（震中在 (180, 200) 时）。δ 每 1 秒误差相当于半径差约 8.4 km。',

    s2k: '第 2 步 · 波线拐弯',
    s2t: '越深的岩石传得越快，波线会怎样走？',
    s2e: '这一步要回答：如果波速随深度增大，从地面斜着向下出发的波线会走直线吗？不会。和光穿过不同介质时一样（<a class="xlink" href="../../../physics/optics/reflection-refraction/#step2">→ 反射与折射页第 2 步：光穿过界面为什么拐弯</a>），波每穿过一层界面都会折射，满足 sin i / v 处处相同（i 是波线与竖直方向的夹角，v 是该层波速），这个不变量叫<strong>射线参数</strong>。进入更快的层，sin i 变大，波线更斜；到某一层需要 sin i ≥ 1 时，它进不去，只能折回地面。这里用 6 层、每层 8 km、波速从 4.0 到 8.0 km/s 的简化分层；真实地球的速度是连续变化的，波线就是一条平滑的弧。',
    i2Slider: '出射角 i₀（与竖直方向的夹角，度）',
    c2a: '分层剖面（横轴：距离 km，纵轴：深度 km）',
    s2lgRay: '当前波线', s2lgFan: '其他出射角', s2lgLayer: '颜色越深，波速越快',
    s2readout: 'i₀ = {i}°：sin i / v = {q}（每层都相同）。各层中的角度：{angles}。{fate}',
    s2turn: '到第 {k} 层（{v} km/s）时需要 sin i ≥ 1，进不去，于是在 {z} km 深处折回，在 {x} km 外回到地面。',
    s2pass: '穿过了全部 6 层（48 km 深），更深处本页没有画出。',
    s2hint: '观察顺序：把 i₀ 从 80° 慢慢拖到 10°：越陡的波线（i₀ 越小）钻得越深；每穿过一层，读数里的角度都变大，但 sin i / v 一直不变。i₀ 小于 30° 时，6 层都穿得过去。灰色细线是其他出射角，用来比较。',

    s3k: '第 3 步 · 影区',
    s3t: '把波线扇射进整个地球，为什么有一片地面收不到直达的 P 波？',
    s3e: '这一步要回答：从一个震源向地球内部发出许多条 P 波线，它们在地面上落在哪里？地面上两点之间的距离用<strong>震中距</strong> Δ 表示：从地心看两点所张的角（0° 到 180°）。这里把地球切成 10 km 厚的薄球壳，每层速度取自一个简化的地球速度模型，按射线参数 r·sin i / v 不变（第 2 步的规则在球里的形式）逐层追踪。<strong>地核</strong>从地心向外到 3480 km（深 2891 km 处是<strong>核幔边界</strong>）；外核是液体，P 波在那里从约 13.7 km/s 骤降到约 8.1 km/s。波线进入慢层会向法线偏折，被「掰」向地心，于是在某段 Δ 内没有直达 P 波落地，这段叫 <strong>P 波影区</strong>。1913 年古登堡就是由影区定出了核幔边界的深度；1936 年莱曼在影区里发现微弱的 P 波，推断出固态<strong>内核</strong>。',
    i3Slider: '高亮波线的出射角 i₀（度）', modeNo: '假如没有地核', modeOuter: '只有液态外核', modeFull: '外核 + 固态内核',
    c3a: '地球剖面上的 P 波线（震源在顶部，只画右半边）',
    s3lgRay: '高亮波线', s3lgMantle: '只穿过地幔的波线', s3lgCore: '穿过地核的波线', s3lgShadow: '影区',
    s3readout: '{mode}：{shadow} 高亮波线 i₀ = {i}°：落在 Δ = {d}°，走了 {t} 分钟，最深到 {z} km，{via}。',
    s3noShadow: '没有影区，0° 到 180° 都有 P 波到达。',
    s3shadow: '影区 {a}° 到 {b}°，那里收不到任何 P 波。',
    s3shadowWeak: '直达 P 波在 {a}° 以外消失；{b}° 起有穿过内核的波回来，外核波要到 {c}° 才回来。',
    s3viaMantle: '只穿过地幔', s3viaCore: '穿过了地核', s3viaDeep: '穿过了地心附近',
    s3hint: '观察顺序：先点「假如没有地核」：波线铺满整个半圆，地面每处都有 P 波。再点「只有液态外核」：碰到核幔边界的波线被掰向地心，地面上出现红色影区，本模型是 97°–141°（教科书常写约 104°–140°，边缘处还有沿核幔边界绕射的弱波）。最后点「外核 + 固态内核」：内核里的波速更快，把一部分波线送回影区内侧（114° 起）。拖 i₀，可以单独看一条波线。',

    s4k: '第 4 步 · S 波与走时',
    s4t: '远处的台站为什么完全收不到 S 波？',
    s4e: '这一步要回答：S 波能不能穿过地核？S 波靠岩石来回错动传播，液体不能承受这种错动，所以 S 波一碰到液态外核就传不过去（它可以转换成 P 波继续走，本页不追踪这种转换）。结果是直达 S 波只能到达约 101° 以内，101° 以外是 S 波的影区，比 P 波的影区大得多。这是外核是液体的主要证据。下面的<strong>走时曲线</strong>画出各种波从震源到震中距 Δ 处所需的时间：P 波、S 波，以及穿过地核的 P 波（记作 PKP，K 代表地核）。距离越远，S − P 越大，这和第 0 步一样能用来估算距离。',
    st4Slider: '台站的震中距 Δ（度）',
    c4a: 'S 波线：碰到液态外核就停下', c4b: '走时曲线（横轴：Δ 度，纵轴：分钟）',
    s4lgS: 'S 波线 / S 走时', s4lgP: 'P 走时', s4lgPKP: 'PKP 走时（穿过地核）', s4lgSt: '台站',
    s4readout: 'Δ = {d}°（沿地面约 {km} km）：{list}',
    s4arrP: 'P 波 {t} 分钟到', s4arrPKP: 'PKP {t} 分钟到', s4arrS: 'S 波 {t} 分钟到', s4sp: 'S − P = {t} 分钟',
    s4none: '没有任何直达或穿核的 P 波和 S 波到达（P 波影区）', s4noS: '没有 S 波（S 波影区）',
    s4hint: '观察顺序：把台站从 10° 拖到 180°。走时图上，橙色 S 曲线在约 101° 处中断；青色 P 曲线在约 97° 中断，绿色 PKP 从约 114° 才开始。读数会列出这里能收到的每一种波；S − P 从 10° 的约 1.8 分钟增大到 90° 的约 11 分钟。',

    s5k: '第 5 步 · 量地核',
    s5t: '只凭影区从哪里开始，能不能量出地核有多大？',
    s5e: '这一步要回答：如果不知道地核多大，能不能由影区的起点反推出来？思路是：先假设一个地核半径，在模型里追踪波线，算出直达 P 波在哪个 Δ 消失；再与观测比较，调到两者一致为止，这种做法叫<strong>反演</strong>。地核越大，波线越早碰到它，影区就越早开始。这里的「观测」是模拟的：用同一个速度模型和真实核半径 3480 km 算出的影区起点 97.2°。地幔速度按深度延续，地核内的速度按半径同比例缩放。',
    rc5Slider: '假设的地核半径（km）',
    c5a: '地球剖面：假设的地核与 P 波线', c5b: '影区起点 Δ（度）随假设的地核半径（km）',
    s5lgModel: '模型给出的影区起点', s5lgObs: '模拟观测 97.2°', s5lgNow: '当前假设',
    s5readout: '假设地核半径 {rc} km（核幔边界深 {depth} km）：影区从 {d}° 开始，比观测 97.2° {diff}。{verdict}',
    s5early: '早 {x}°', s5late: '晚 {x}°', s5same: '只差 {x}°',
    s5match: '与观测吻合：反推出的地核半径约 3480 km，与地震学给出的数值一致。',
    s5more: '地核还要{dir}一些。', s5bigger: '大', s5smaller: '小',
    s5hint: '观察顺序：先把半径拖到 2500 km：地核小，波线要走得更远才碰到它，影区从 124° 才开始。再拖到 4500 km：影区提前到约 70°。「影区起点」曲线一路下降，与 97.2° 的虚线只交于一点：半径约 3480 km，深约 2891 km。因为曲线单调，一个影区起点只对应一个地核大小。',

    s6k: '第 6 步 · 收束', s6t: '地核是被「没收到的波」量出来的',
    s6fin: '回看这条线。<strong>第 0 步</strong>：P 波快、S 波慢，S − P 时间给出距离，每秒约 8.4 km。<strong>第 1 步</strong>：三个台站的距离圆交出震中，时钟有误差时用最小二乘。<strong>第 2 步</strong>：波速随深度增大，sin i / v 不变，波线向上弯回地面。<strong>第 3 步</strong>：液态外核让 P 波骤然变慢，波线被掰向地心，地面出现 P 波影区；内核又把部分波送回影区。<strong>第 4 步</strong>：S 波穿不过液体，101° 以外收不到，这说明外核是液体。<strong>第 5 步</strong>：影区起点随地核大小单调变化，反推出核半径约 3480 km。',
    formula: 'd = (S − P) / (1/v_S − 1/v_P) ≈ 8.4 km/s × (S − P)\nsin i / v = 常数（分层）；r·sin i / v = 常数（球层）\n影区起点：直达 P 波刚好擦过核幔边界的那条波线',
    boundary: '适用范围：第 0、1 步用恒定的地壳波速和平面地图，震源取在地面；第 2 步是 6 层简化分层；第 3–5 步用简化的球对称速度模型（含 400 km、670 km 两处间断），只追踪透射波，不算反射、绕射和 P、S 互相转换，所以影区边缘是「硬」的，真实地震图上会有弱的绕射波。地震图波形是示意，不是实测记录。',
    linksTitle: '接着去看',
    lk1: '→ 声波页第 0 步：波传播时，介质里是什么在动',
    lk2: '→ 反射与折射页第 2 步：折射为什么偏向法线',
    lk3: '→ 板块构造页第 0 步：地球的外壳不是一整块',
    lk4: '→ 声波页第 4 步：由闪电和雷声的时间差算距离',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《地震波探地心 · 地核是被波“照”出来的》的平行版本。'
  },
  en: {
    pageTitle: 'Seismic Waves · How We Measured a Core Nobody Has Visited',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Seismic Waves · The Core Was “Lit Up” by Waves →',
    navLabel: 'Seismic waves steps',
    tagline: 'The deepest hole ever drilled reaches only about a dozen kilometres, yet the centre of the Earth lies 6371 km down. Nearly everything we know about the deep interior comes from earthquake waves: when they arrive, which way round they come, and where they vanish. Over seven steps you will turn the gap between two waves into a distance, locate an epicentre, watch rays bend inside the Earth, and see how the liquid outer core casts a “shadow” that lets us measure the core’s size.',
    nav0: '0 Time gap', nav1: '1 Epicentre', nav2: '2 Bending rays', nav3: '3 Shadow zone', nav4: '4 S & travel times', nav5: '5 Sizing the core', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The S − P gap',
    s0t: 'P arrives first, S later. Does the gap tell us how far away the quake was?',
    s0e: 'This step asks: from one seismogram recorded at one station, can we tell how far away the source was? A quake sends out two kinds of body wave at once. The <strong>P wave</strong> (primary, compressional) squeezes and stretches rock along its direction of travel and is fast; the <strong>S wave</strong> (secondary, shear) shakes rock sideways, across its direction of travel, and is slower. A liquid cannot be sheared, so S waves cannot cross liquids. We use typical crustal speeds v_P = 6.0 km/s and v_S = 3.5 km/s. Over a distance d, P takes d/v_P seconds and S takes d/v_S, and the difference is the <strong>S − P time</strong>: d·(1/v_S − 1/v_P). Turned round, d = S − P × 8.4 km/s: each second of gap means about 8.4 km. It is the same idea as counting seconds between lightning and thunder (<a class="xlink" href="../../../physics/waves/sound-waves/#step4">→ Sound waves, step 4: distance from the lightning–thunder gap</a>).',
    d0Slider: 'Source-to-station distance d (km)', play0: 'Send from the source (replay)',
    c0a: 'Cross-section: P (fast) and S (slow) wavefronts', c0b: 'Seismogram at the station (illustrative, seconds)',
    s0lgP: 'P wave', s0lgS: 'S wave', s0lgSP: 'S − P gap', s0lgSt: 'station',
    s0readout: 'd = {d} km: P arrives after {tp} s, S after {ts} s, so S − P = {sp} s. Working back: {sp} × 8.4 ≈ {back} km. {prog}',
    s0prog: '({t} s elapsed)',
    s0hint: 'What to try: press “Send from the source” and watch the cyan P front sweep past the station first, with the orange S front arriving later; the seismogram draws both wave trains as they come in. Then drag d: the S − P gap (green) is proportional to d, so doubling d doubles the gap; 100 km gives about 11.9 s. The seismogram’s shape is only illustrative; its arrival times are computed from the speeds.',

    s1k: 'Step 1 · Locating the epicentre',
    s1t: 'If all we know is “how far from each station”, how do we find where it happened?',
    s1e: 'This step asks: step 0 gives a distance but no direction, so how do we pin down the <strong>epicentre</strong> (the point on the surface directly above the source)? Draw a circle round each station with its computed distance as the radius; the epicentre must lie on every circle. Two circles usually cross at two points, which leaves a choice; a third station’s circle settles it. The map is a flat 400 km × 400 km square with stations A, B and C, and each S − P is computed from the true epicentre with step 0’s speeds. Real readings carry errors: you can set station B’s clock off by δ seconds and watch the three circles stop meeting at one point. Then we use a <strong>least-squares</strong> estimate: the point whose distances to the three stations differ least from the three radii, in the sense of the smallest sum of squared differences.',
    ex1: 'True epicentre x (km)', ey1: 'True epicentre y (km)', dl1: 'Station B clock error δ (s)',
    c1a: 'Map (km): the three stations’ distance circles',
    s1lgSt: 'stations', s1lgCirc: 'distance circles', s1lgTrue: 'true epicentre', s1lgEst: 'estimated epicentre',
    s1readout: 'S − P: A {a} s, B {b} s, C {c} s → radii {ra}, {rb}, {rc} km. The least-squares estimate is ({x}, {y}), {miss} km from the true epicentre; the circles miss the estimate by an RMS of {rms} km.',
    s1hint: 'What to try: keep δ = 0 and drag the epicentre’s x and y: the three circles always meet at the red true epicentre, and the estimate sits right on it. Then drag δ to +2: B’s circle grows, the three circles enclose a small triangle, and the estimate (white cross) lands inside it, about 15 km off (with the epicentre at (180, 200)). Each second of error is about 8.4 km of radius.',

    s2k: 'Step 2 · Bending rays',
    s2t: 'Deeper rock carries waves faster. What path does a ray take?',
    s2e: 'This step asks: if wave speed increases with depth, does a ray launched downwards at a slant travel in a straight line? No. Just as with light crossing between materials (<a class="xlink" href="../../../physics/optics/reflection-refraction/#step2">→ Reflection and refraction, step 2: why light turns at an interface</a>), the wave refracts at every boundary so that sin i / v stays the same everywhere (i is the ray’s angle from the vertical, v the layer’s speed). That invariant is called the <strong>ray parameter</strong>. Entering a faster layer makes sin i larger and the ray flatter; at the layer where it would need sin i ≥ 1 it cannot enter and turns back up. We use 6 layers, 8 km each, with speeds from 4.0 to 8.0 km/s; in the real Earth speed changes smoothly, and the ray becomes a smooth arc.',
    i2Slider: 'Take-off angle i₀ (from the vertical, degrees)',
    c2a: 'Layered cross-section (distance km across, depth km down)',
    s2lgRay: 'current ray', s2lgFan: 'other take-off angles', s2lgLayer: 'darker = faster layer',
    s2readout: 'i₀ = {i}°: sin i / v = {q} (the same in every layer). Angle in each layer: {angles}. {fate}',
    s2turn: 'Layer {k} ({v} km/s) would need sin i ≥ 1, so the ray cannot enter: it turns back at {z} km depth and reaches the surface again {x} km away.',
    s2pass: 'It passes through all 6 layers (48 km deep); deeper parts are not drawn here.',
    s2hint: 'What to try: drag i₀ slowly from 80° down to 10°. The steeper the ray (smaller i₀), the deeper it gets; with every layer crossed the angle in the readout grows, yet sin i / v never changes. Below 30° the ray gets through all 6 layers. Thin grey rays show other take-off angles for comparison.',

    s3k: 'Step 3 · The shadow zone',
    s3t: 'Fire rays into the whole Earth: why does one stretch of ground get no direct P waves?',
    s3e: 'This step asks: send many P rays from one source into the Earth. Where do they come back up? Distance between two places on the surface is given as the <strong>epicentral distance</strong> Δ: the angle the two points make at the Earth’s centre (0° to 180°). The Earth is cut into 10 km thick spherical shells, each with a speed from a simplified Earth model, and rays are traced shell by shell keeping r·sin i / v fixed (step 2’s rule, in its spherical form). The <strong>core</strong> extends 3480 km out from the centre (the <strong>core–mantle boundary</strong> is 2891 km down). The outer core is liquid, and P waves drop there from about 13.7 km/s to about 8.1 km/s. Entering a slower layer bends a ray towards the normal, pulling it towards the centre, so over a range of Δ no direct P wave reaches the surface: the <strong>P-wave shadow zone</strong>. In 1913 Gutenberg used the shadow zone to fix the depth of the core–mantle boundary; in 1936 Lehmann found faint P waves inside the shadow and inferred a solid <strong>inner core</strong>.',
    i3Slider: 'Take-off angle of the highlighted ray i₀ (degrees)', modeNo: 'Suppose there were no core', modeOuter: 'Liquid outer core only', modeFull: 'Outer core + solid inner core',
    c3a: 'P rays in a slice of the Earth (source at the top, right half only)',
    s3lgRay: 'highlighted ray', s3lgMantle: 'rays through the mantle only', s3lgCore: 'rays through the core', s3lgShadow: 'shadow zone',
    s3readout: '{mode}: {shadow} Highlighted ray i₀ = {i}°: lands at Δ = {d}° after {t} minutes, reaching {z} km deep; it {via}.',
    s3noShadow: 'no shadow zone, P waves arrive everywhere from 0° to 180°.',
    s3shadow: 'shadow zone from {a}° to {b}°, where no P wave arrives at all.',
    s3shadowWeak: 'direct P vanishes beyond {a}°; waves through the inner core return from {b}°, and those through the outer core only from {c}°.',
    s3viaMantle: 'stays in the mantle', s3viaCore: 'passes through the core', s3viaDeep: 'passes close to the centre',
    s3hint: 'What to try: first click “Suppose there were no core”: rays fill the whole half-circle and P waves reach every point. Then click “Liquid outer core only”: rays that hit the core–mantle boundary get pulled towards the centre and a red shadow zone appears on the surface, 97°–141° in this model (textbooks often quote about 104°–140°, and weak waves diffracted along the boundary blur its edge). Finally click “Outer core + solid inner core”: faster speeds in the inner core send some rays back into the inner part of the shadow (from 114°). Drag i₀ to follow a single ray.',

    s4k: 'Step 4 · S waves and travel times',
    s4t: 'Why do distant stations get no S waves at all?',
    s4e: 'This step asks: can S waves cross the core? S waves travel by shearing rock sideways, and a liquid cannot resist shear, so an S wave stops at the liquid outer core (it can convert into a P wave and carry on, but this page does not follow conversions). As a result direct S waves only reach about 101°, and everything beyond is the S-wave shadow, far larger than the P shadow. That is the main evidence that the outer core is liquid. The <strong>travel-time curves</strong> below show how long each wave takes to reach epicentral distance Δ: P, S, and P waves through the core (labelled PKP, K for the core). The farther away, the larger S − P, which can be used to judge distance as in step 0.',
    st4Slider: 'Station’s epicentral distance Δ (degrees)',
    c4a: 'S rays: they stop at the liquid outer core', c4b: 'Travel times (Δ in degrees across, minutes up)',
    s4lgS: 'S rays / S travel time', s4lgP: 'P travel time', s4lgPKP: 'PKP travel time (through the core)', s4lgSt: 'station',
    s4readout: 'Δ = {d}° (about {km} km along the surface): {list}',
    s4arrP: 'P arrives at {t} min', s4arrPKP: 'PKP at {t} min', s4arrS: 'S at {t} min', s4sp: 'S − P = {t} min',
    s4none: 'no direct or core-crossing P and no S wave arrives (P shadow zone)', s4noS: 'no S wave (S shadow zone)',
    s4hint: 'What to try: drag the station from 10° to 180°. In the travel-time chart the orange S curve breaks off at about 101°; the cyan P curve stops at about 97°, and the green PKP only starts at about 114°. The readout lists every wave that reaches the station; S − P grows from about 1.8 minutes at 10° to about 11 minutes at 90°.',

    s5k: 'Step 5 · Sizing the core',
    s5t: 'Knowing only where the shadow begins, can we measure the core?',
    s5e: 'This step asks: if we did not know the core’s size, could we infer it from where the shadow zone starts? The idea: assume a core radius, trace rays through the model, work out the Δ where direct P disappears, compare with observation, and adjust until they match. This is called <strong>inversion</strong>. The bigger the core, the sooner rays hit it and the earlier the shadow begins. The “observation” here is simulated: the shadow start of 97.2° computed from the same speed model with the real core radius of 3480 km. Mantle speeds carry on with depth, and speeds inside the core are rescaled in proportion to its radius.',
    rc5Slider: 'Assumed core radius (km)',
    c5a: 'Slice of the Earth: assumed core and P rays', c5b: 'Shadow start Δ (degrees) against the assumed core radius (km)',
    s5lgModel: 'shadow start from the model', s5lgObs: 'simulated observation 97.2°', s5lgNow: 'current assumption',
    s5readout: 'Assumed core radius {rc} km (core–mantle boundary {depth} km down): the shadow begins at {d}°, {diff} the observed 97.2°. {verdict}',
    s5early: '{x}° before', s5late: '{x}° after', s5same: 'only {x}° from',
    s5match: 'That matches: the inferred core radius is about 3480 km, as seismology finds.',
    s5more: 'The core needs to be a little {dir}.', s5bigger: 'bigger', s5smaller: 'smaller',
    s5hint: 'What to try: drag the radius to 2500 km: with a small core, rays travel farther before meeting it, and the shadow only starts at 124°. Drag to 4500 km: the shadow moves in to about 70°. The shadow-start curve falls all the way and crosses the 97.2° dashed line just once, at a radius of about 3480 km, about 2891 km deep. Because the curve is monotonic, each shadow start corresponds to just one core size.',

    s6k: 'Step 6 · Wrap-up', s6t: 'The core was measured by the waves that never arrived',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: P is fast, S is slow, and the S − P time gives distance, about 8.4 km per second. <strong>Step 1</strong>: three stations’ distance circles meet at the epicentre; with clock errors, use least squares. <strong>Step 2</strong>: speed grows with depth, sin i / v stays fixed, and rays curve back up to the surface. <strong>Step 3</strong>: the liquid outer core abruptly slows P waves, pulling rays towards the centre and leaving a P shadow zone on the surface; the inner core sends some waves back into it. <strong>Step 4</strong>: S waves cannot cross liquid and vanish beyond 101°, which shows the outer core is liquid. <strong>Step 5</strong>: the shadow start changes steadily with core size, and working back gives a core radius of about 3480 km.',
    formula: 'd = (S − P) / (1/v_S − 1/v_P) ≈ 8.4 km/s × (S − P)\nsin i / v = constant (layers); r·sin i / v = constant (shells)\nShadow start: the direct P ray that just grazes the core',
    boundary: 'Scope: steps 0–1 use constant crustal speeds and a flat map with the source at the surface; step 2 is a simplified 6-layer model; steps 3–5 use a simplified spherically symmetric speed model (with breaks at 400 km and 670 km) and follow transmitted rays only, with no reflections, diffraction or P–S conversions, so the shadow edges are “hard” where real seismograms show weak diffracted waves. The seismogram’s waveform is illustrative, not a recording.',
    linksTitle: 'Where to go next',
    lk1: '→ Sound waves, step 0: what actually moves when a wave travels',
    lk2: '→ Reflection and refraction, step 2: why refraction bends towards the normal',
    lk3: '→ Plate tectonics, step 0: the Earth’s outer shell is not one piece',
    lk4: '→ Sound waves, step 4: distance from the lightning–thunder gap',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Seismic Waves · The Core Was “Lit Up” by Waves”.'
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
  if (typeof window.refreshSeismic === 'function') window.refreshSeismic();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SEIS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
