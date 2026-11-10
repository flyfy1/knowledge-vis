'use strict';
// Kepler orbits lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '开普勒轨道 · 椭圆、扫面积与凌日',
    back: '← 知识索引',
    compare: '对照另一版本：轨道运动 · 椭圆、速度与凌日 →',
    navLabel: '开普勒轨道步骤导航',
    tagline: '一颗行星绕恒星转：它离恒星有多近、多远？什么时候跑得快？一圈要多久？我们又怎样从几百光年外看出它的存在？七步里，同一套两体引力模型先给出开普勒三定律，再算出行星挡住星光的「凌日」有多深、多长、多难碰上。',
    nav0: '0 椭圆', nav1: '1 扫面积', nav2: '2 速度', nav3: '3 周期', nav4: '4 凌日', nav5: '5 对齐', nav6: '6 收束',
    au: 'AU',

    s0k: '第 0 步 · 轨道的形状',
    s0t: '恒星不在轨道中心：行星离它最近和最远各是多少？',
    s0e: '这一步要回答：知道一条轨道的「大小」和「扁度」，能不能直接写出行星离恒星的最近距离和最远距离？开普勒第一定律说：行星轨道是<strong>椭圆</strong>，恒星位于椭圆的一个<strong>焦点</strong>上，另一个焦点是空的。描述椭圆用两个数：<strong>半长轴 a</strong>（最长直径的一半，代表轨道大小）和<strong>偏心率 e</strong>（焦点离中心的距离 c 除以 a，代表扁度；e = 0 是圆，越接近 1 越扁）。距离单位用 <strong>AU</strong>（天文单位，约 1.496 亿千米，即日地平均距离）。本步固定 a = 1 AU，只改 e。椭圆上任一点到两个焦点的距离之和恒等于 2a（<a class="xlink" href="../../../math/geometry/conic-sections/#step2">→ 圆锥曲线页第 2 步：用一根线和两颗图钉画椭圆</a>），由此可推出最近点<strong>近日点</strong>的距离 a(1 − e)、最远点<strong>远日点</strong>的距离 a(1 + e)。',
    eSlider: '偏心率 e', pSlider: '点 P 沿椭圆的位置（参数角，度）',
    preEarth: '地球 0.017', preMars: '火星 0.093', preMercury: '水星 0.206', preHalley: '哈雷彗星 0.967',
    c0: '轨道平面（恒星在一个焦点上，a = 1 AU）',
    lbStar: '恒星', lbEmpty: '空焦点', lbPeri: '近日点', lbApo: '远日点', lbCenter: '中心',
    s0lgOrbit: '椭圆轨道', s0lgR1: 'r₁：P 到恒星', s0lgR2: 'r₂：P 到空焦点', s0lgC: '焦点到中心 c = a·e',
    s0readout: 'e = {e}：近日点 a(1 − e) = {rp} AU，远日点 a(1 + e) = {ra} AU，远/近 = {ratio} 倍；短半轴 b = a√(1 − e²) = {b} AU。点 P：r₁ = {r1} AU，r₂ = {r2} AU，r₁ + r₂ = {sum} AU = 2a。',
    s0hint: '观察顺序：先只拖「点 P 的位置」，看橙色 r₁ 和绿色 r₂ 一长一短此消彼长，读数里的和始终是 2.000 AU；再只拖 e（或点四个预设），看恒星（黄点）离中心越来越远，近日点贴向恒星。地球的 e 只有 0.017，近、远日点只差约 3%，所以画出来几乎是正圆；地球在 1 月初过近日点，正值北半球冬天，可见四季不是由日地距离决定的（<a class="xlink" href="../../../earth/astronomy/seasons-orbit/#step0">→ 四季页第 0 步：北半球夏天地球离太阳最近吗？</a>）。',

    s1k: '第 1 步 · 相等时间',
    s1t: '相等的时间里，行星走过的弧长一样吗？扫过的面积呢？',
    s1e: '这一步要回答：把一圈的时间平均切成 12 段，每段里行星在轨道上走了多远、恒星到行星的连线扫过了多大面积？开普勒第二定律说：这条连线在相等时间里扫过<strong>相等面积</strong>。原因是引力始终指向恒星，不会让行星绕恒星的转动变快或变慢——物理上叫<strong>角动量守恒</strong>；而单位时间扫过的面积正好等于角动量的一半除以行星质量，所以它是常数。本页按<strong>开普勒方程</strong> M = E − e·sin E 由时间求位置（它就是第二定律写成的式子）：M 是平均近点角 = 2π × 已过时间 ÷ 周期，E 是上一步的参数角。阴影面积则另外用多边形逐块实测。',
    playSlices: '按相等时间走一圈', showSlices: '全部显示',
    c1: '每段时间相同：1/12 周期',
    s1lgSlice: '扫过的扇形（两色交替）', s1lgDot: '每 1/12 周期的位置', s1lgPlanet: '行星',
    s1progress: '已走 {c}/12 段 · ',
    s1readout: '{prog}e = {e}：每块扇形实测面积都是椭圆的 {share}%（= 1/12）；但每段弧长不同，最长 / 最短 = {arcRatio} 倍。',
    s1hint: '观察顺序：先把 e 设为 0（正圆），按「按相等时间走一圈」，12 个白点等距；再把 e 拖到 0.6 重播：近日点一侧白点稀疏（走得快），远日点一侧挤在一起（走得慢），可每块扇形的面积仍然相同——近处的扇形短而宽，远处的长而窄。',

    s2k: '第 2 步 · 速度',
    s2t: '近日点比远日点快多少？速度由什么决定？',
    s2e: '这一步要回答：已知轨道和行星此刻离恒星的距离 r，能不能算出它此刻的速度 v？能量守恒给出<strong>活力公式</strong>：<strong>v² = GM (2/r − 1/a)</strong>。G 是万有引力常量，M 是恒星质量，GM 合起来描述恒星引力有多强（这里取太阳的值）。离得越近（r 越小），v 越大；速度只取决于 r 和 a，与行星处在轨道哪一侧无关。在近日点和远日点，速度恰好垂直于连线，于是上一步的角动量守恒给出更简单的比例：<strong>v近 / v远 = r远 / r近 = (1 + e)/(1 − e)</strong>（<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step3">→ 引力与轨道页第 3 步：靠近中心为什么更快</a>）。本步仍以 a = 1 AU、绕太阳为例。',
    qSlider: '时刻 t / T（从近日点算起的一圈比例）', playOrbit: '播放一圈',
    c2a: '轨道上的速度箭头（长度 ∝ 速度）', c2b: '速度 v（km/s）随时间 t/T',
    s2lgPlanet: '行星与速度箭头', s2lgTrace: '已走过的 v(t)', s2lgFull: '整圈 v(t)',
    s2readout: 't/T = {q}：r = {r} AU，v = {v} km/s（活力公式）。近日点 {vp} km/s、远日点 {va} km/s，二者之比 {vr} = r远 / r近 = {rr}。同 a 的圆轨道速度 {vc} km/s。',
    s2hint: '观察顺序：保持 e = 0.5，从 0 起拖「时刻 t/T」，看「轨道上的速度箭头」图里箭头在近日点最长、远日点最短，「速度 v」图把走过的 v(t) 描成实线。注意 v(t) 不是左右对称的平缓起伏：近日点附近的高峰窄而陡（快的时间短），远日点附近的低谷宽而平（慢的时间长）。再改 e：e = 0 时 v 恒为 29.78 km/s，即地球的平均轨道速度。',

    s3k: '第 3 步 · 周期',
    s3t: '轨道放大一倍，一圈要多久？轨道变扁，周期变不变？',
    s3e: '这一步要回答：周期 T 由什么决定？开普勒第三定律说：<strong>T² ∝ a³</strong>。绕太阳时，用「年」量 T、用 AU 量 a，比例系数正好是 1：<strong>T = √(a³) 年</strong>。准确形式是 T = 2π√(a³/GM)，只含 a，不含 e（<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step4">→ 引力与轨道页第 4 步：轨道越大一圈越久</a>）。轨道图让两颗行星同时从近日点出发：青色走半长轴为 a 的圆，橙色走同样 a、偏心率 e 的椭圆。周期图用<strong>对数坐标</strong>（每格代表 10 倍）：横轴 a，纵轴 T，斜线是 T = √(a³)，圆点是八大行星和哈雷彗星的实测周期。',
    aSlider: '半长轴 a（AU，对数刻度）', e3Slider: '橙色轨道的偏心率 e', playLaps: '同时放两圈', pause: '暂停',
    c3a: '同一个 a：圆（青）与椭圆（橙）', c3b: '周期 T（年）对半长轴 a（AU），对数坐标',
    s3lgCirc: '圆轨道', s3lgEll: '同 a 的椭圆轨道', s3lgLaw: 'T = √(a³)', s3lgBody: '实测周期',
    s3laps: '已完成圈数：青 {c} · 橙 {e}',
    s3lapProgress: '已放 {lap} 圈 · ',
    s3readout: '{prog}a = {a} AU：T = √(a³) = {T} 年（{d} 天），两条轨道相同。动画把一圈压缩成 6 秒。哈雷彗星 e = 0.967，a = 17.83 AU，公式给 {th} 年，实测约 75.3 年。',
    s3hint: '观察顺序：按「同时放两圈」，看橙色在近日点冲到前面、在远日点被青色追回，每到一圈结束两者恰好同时回到起点（计数相同）。再拖 e 到 0.9 重放，结论不变。最后拖 a：周期图里的白圈沿斜线移动，a 放大 4 倍，T 放大 8 倍（√(4³) = 8）。',
    b_mercury: '水星', b_venus: '金星', b_earth: '地球', b_mars: '火星', b_jupiter: '木星', b_saturn: '土星', b_uranus: '天王星', b_neptune: '海王星', b_halley: '哈雷',

    s4k: '第 4 步 · 凌日',
    s4t: '行星从恒星前面经过时，星光少了多少？持续多久？',
    s4e: '这一步要回答：我们看不见遥远的行星本身，但当它从恒星和我们之间穿过（<strong>凌日</strong>），会挡住一小块星面。被挡的比例就是亮度下降的比例，叫<strong>凌日深度</strong>：把恒星看成亮度均匀的圆盘（忽略边缘较暗的「临边昏暗」），完全进入后深度 = (行星半径 Rp ÷ 恒星半径 R★)²。持续时间取决于行星在轨道上跑多快：轨道越近，周期越短（第 3 步），穿过星面越快。这里设恒星是太阳、轨道为圆、行星正好穿过星面中心。Rp 用<strong>地球半径 R⊕</strong>（约 6371 km）计；木星约 11.2 R⊕。下图是<strong>光变曲线</strong>：横轴是离凌日中点的小时数，纵轴是亮度比未遮挡时下降了多少（0 = 没挡住）。',
    rpSlider: '行星半径 Rp（地球半径 R⊕）', a4Slider: '轨道半径 a（AU，对数刻度）', xSlider: '行星位置（以恒星半径计，0 = 正中）', sweep4: '让行星穿过星面',
    c4a: '从地球方向看恒星（行星按真实比例画）', c4b: '光变曲线：亮度下降多少，对时间（小时）',
    s4lgStar: '恒星盘', s4lgPlanet: '行星', s4lgCurve: '已扫过的光变曲线', s4lgFull: '完整曲线',
    s4readout: 'Rp = {rp} R⊕，a = {a} AU：周期 {P} 天；深度 (Rp/R★)² = {depth}；全程 {dur} 小时。此刻离中点 {dt} 小时，亮度下降 {f}。',
    s4axis: '纵轴随深度自动缩放',
    s4hint: '观察顺序：先按「让行星穿过星面」，看下图曲线：入盘时亮度沿斜边下降，整颗进入后是平底，出盘时回升。再只改 Rp：平底的深度按 Rp² 变化（半径加倍，深度变 4 倍；纵轴会自动缩放，以读数为准）。最后只改 a：深度不变，但全程时间随 a 拉长（大约按 √a）。地球大小、1 AU 时深度约 84 ppm（ppm = 百万分之一），全程约 13 小时；木星大小时约 1%。',

    s5k: '第 5 步 · 对齐',
    s5t: '为什么大多数行星系统我们根本看不到凌日？',
    s5e: '这一步要回答：轨道要倾斜到什么程度，凌日才会消失？从远处看，轨道面与视线的夹角用<strong>倾角 i</strong> 表示：i = 90° 时我们正好从侧面看轨道。行星经过恒星前方时，在天空上离星面中心的最近距离（以恒星半径计）叫<strong>碰撞参数 b = (a/R★)·cos i</strong>。只要 b < 1 + Rp/R★，行星的圆盘就会碰到星面，发生凌日。所以 i 只要比 90° 小一点点，轨道离恒星越远，就越容易擦过去。对于朝向完全随机的轨道（cos i 在 0 到 1 之间均匀分布），能看到凌日的比例约为 <strong>(R★ + Rp)/a</strong>。本步行星取木星大小（11.2 R⊕），恒星仍是太阳，轨道为圆。',
    iSlider: '倾角 i（度）', a5Slider: '轨道半径 a（AU，对数刻度）', drawMany: '随机摆 500 个轨道', clearMany: '清空',
    c5a: '从地球看：行星划过的路径', c5b: '随机朝向的轨道：cos i（0 到 1）',
    s5lgStar: '恒星盘', s5lgTrack: '行星划过的路径（离星面中心最近 = b）', s5lgHit: '会凌日', s5lgMiss: '擦过去', s5lgBand: '凌日区间 cos i < (R★+Rp)/a',
    s5yes: '会发生凌日', s5no: '不会凌日（从星面旁擦过）',
    s5readout: 'a = {a} AU，i = {i}°：b = {b}，{verdict}。凌日要求 i > {imin}°。随机朝向时能看到凌日的比例 (R★+Rp)/a = {p}%；{sim}',
    s5sim: '已随机摆 {n} 个，其中 {h} 个凌日（{f}%）。',
    s5nosim: '按「随机摆 500 个轨道」做实验。',
    s5hint: '观察顺序：保持 a = 0.05 AU，从 90° 往下拖 i，看「从地球看」图里的路径从星面中央移到边缘，再移出星面——过了 {imin0}° 就看不到凌日了。再把 a 拉到 1 AU：窗口缩到约 0.29°。最后按几次「随机摆 500 个轨道」：「随机朝向」图的条带里每个点是一个随机朝向，落在橙色区间里的会凌日，统计比例逐渐贴近公式值。改 a 会清空实验。',

    s6k: '第 6 步 · 收束', s6t: '一套引力，三条定律，一种找行星的办法',
    s6fin: '<strong>第 0 步</strong>：轨道是椭圆，恒星在焦点上，近、远日点距离为 a(1 ∓ e)。<strong>第 1 步</strong>：相等时间扫过相等面积（角动量守恒），所以近处走得快。<strong>第 2 步</strong>：速度由活力公式给出，只取决于 r 和 a；近、远日点速度之比 = (1 + e)/(1 − e)。<strong>第 3 步</strong>：周期只看 a，T² ∝ a³。<strong>第 4 步</strong>：凌日深度 ≈ (Rp/R★)²，时长由轨道速度决定。<strong>第 5 步</strong>：只有轨道几乎侧对我们才会凌日，随机朝向下概率约 (R★ + Rp)/a，所以一颗 1 AU 处的行星只有约 0.5% 的机会被这样发现。',
    formula: 'r = a(1 − e·cos E)　M = E − e·sin E\nv² = GM (2/r − 1/a)\nT = 2π √(a³/GM)\n深度 ≈ (Rp/R★)²　P ≈ (R★ + Rp)/a',
    boundary: '适用范围：两体问题，行星质量相对恒星可忽略，不考虑其他行星的扰动和相对论修正（如水星近日点进动）。行星实测周期取常用参考值。凌日部分假设圆轨道、亮度均匀的恒星盘（真实恒星边缘较暗，光变曲线底部会呈弧形）、恒星为太阳；偏心轨道的凌日时长还要看凌日发生在轨道哪一段。第 5 步的随机实验是模拟，不是观测数据。',
    linksTitle: '接着去哪儿',
    lk1: '→ 万有引力与轨道 第 2 步：轨道为什么只在两个半径之间来回',
    lk2: '→ 圆锥曲线 第 1 步：用一个数（偏心率）区分圆、椭圆、抛物线、双曲线',
    lk3: '→ 四季 第 0 步：北半球夏天地球离太阳最近吗',
    lk4: '→ 黑体辐射 第 2 步：恒星在哪个波段最亮',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《轨道运动 · 椭圆、速度与凌日》的平行版本。'
  },
  en: {
    pageTitle: 'Kepler Orbits · Ellipses, Swept Areas and Transits',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Orbital Motion · Ellipses, Speed & Transits →',
    navLabel: 'Kepler orbits steps',
    tagline: 'A planet circles a star. How close does it get, and how far? When does it move fastest? How long is one lap? And how can we tell it is there from hundreds of light years away? In seven steps one two-body gravity model gives Kepler’s three laws, then works out how deep, how long and how rare a planet’s “transit” across its star is.',
    nav0: '0 Ellipse', nav1: '1 Areas', nav2: '2 Speed', nav3: '3 Period', nav4: '4 Transit', nav5: '5 Alignment', nav6: '6 Wrap-up',
    au: 'AU',

    s0k: 'Step 0 · The shape of an orbit',
    s0t: 'The star is not at the centre. How near and how far does the planet get?',
    s0e: 'The question here: if you know an orbit’s size and how squashed it is, can you write down the planet’s closest and farthest distance from the star? Kepler’s first law says the orbit is an <strong>ellipse</strong> with the star at one <strong>focus</strong>; the other focus is empty. Two numbers describe the ellipse: the <strong>semi-major axis a</strong> (half the longest diameter, the orbit’s size) and the <strong>eccentricity e</strong> (the distance c from centre to focus divided by a, its flatness; e = 0 is a circle, values near 1 are very elongated). Distances are in <strong>AU</strong> (astronomical units, about 149.6 million km, the mean Earth–Sun distance). This step fixes a = 1 AU and changes only e. For every point on an ellipse the distances to the two foci add up to 2a (<a class="xlink" href="../../../math/geometry/conic-sections/#step2">→ Conic sections, step 2: drawing an ellipse with string and two pins</a>), and that gives the nearest point, <strong>perihelion</strong>, at a(1 − e) and the farthest, <strong>aphelion</strong>, at a(1 + e).',
    eSlider: 'Eccentricity e', pSlider: 'Position of point P on the ellipse (parameter angle, degrees)',
    preEarth: 'Earth 0.017', preMars: 'Mars 0.093', preMercury: 'Mercury 0.206', preHalley: 'Halley’s comet 0.967',
    c0: 'Orbital plane (star at one focus, a = 1 AU)',
    lbStar: 'Star', lbEmpty: 'Empty focus', lbPeri: 'Perihelion', lbApo: 'Aphelion', lbCenter: 'Centre',
    s0lgOrbit: 'Elliptical orbit', s0lgR1: 'r₁: P to the star', s0lgR2: 'r₂: P to the empty focus', s0lgC: 'Focus to centre c = a·e',
    s0readout: 'e = {e}: perihelion a(1 − e) = {rp} AU, aphelion a(1 + e) = {ra} AU, far/near = {ratio}×; semi-minor axis b = a√(1 − e²) = {b} AU. Point P: r₁ = {r1} AU, r₂ = {r2} AU, r₁ + r₂ = {sum} AU = 2a.',
    s0hint: 'What to try: first drag only the position of P. The orange r₁ and green r₂ trade length, and their sum in the readout stays at 2.000 AU. Then drag only e (or press the four presets): the star (yellow dot) moves away from the centre and perihelion closes in on it. Earth’s e is only 0.017, so its nearest and farthest distances differ by about 3% and the orbit looks like a circle. Earth passes perihelion in early January, in the northern winter, so the seasons are not caused by distance (<a class="xlink" href="../../../earth/astronomy/seasons-orbit/#step0">→ Seasons, step 0: is Earth closest to the Sun in the northern summer?</a>).',

    s1k: 'Step 1 · Equal times',
    s1t: 'In equal times, does the planet cover equal arcs? Equal areas?',
    s1e: 'The question here: cut one lap into 12 equal stretches of time. In each, how far does the planet move along its orbit, and how much area does the star–planet line sweep? Kepler’s second law says the line sweeps <strong>equal areas in equal times</strong>. The reason: gravity always points at the star, so it can never speed up or slow down the planet’s turning about the star; physicists call this <strong>conservation of angular momentum</strong>, and the area swept per unit time is exactly half the angular momentum divided by the planet’s mass, so it stays constant. The page finds the position at each time from <strong>Kepler’s equation</strong> M = E − e·sin E (the second law written as a formula): M, the mean anomaly, is 2π × time elapsed ÷ period, and E is the parameter angle from step 0. The shaded areas are then measured separately, polygon by polygon.',
    playSlices: 'Run one lap in equal times', showSlices: 'Show all',
    c1: 'Every slice takes the same time: 1/12 of a period',
    s1lgSlice: 'Swept sector (alternating colours)', s1lgDot: 'Position every 1/12 period', s1lgPlanet: 'Planet',
    s1progress: '{c}/12 slices done · ',
    s1readout: '{prog}e = {e}: every measured sector is {share}% of the ellipse (= 1/12), but the arcs differ: longest / shortest = {arcRatio}×.',
    s1hint: 'What to try: set e to 0 (a circle) and press “Run one lap in equal times”: the 12 white dots are evenly spaced. Drag e to 0.6 and run it again: the dots spread out near perihelion (fast) and bunch up near aphelion (slow), yet every sector has the same area. Near the star the sectors are short and wide; far away they are long and thin.',

    s2k: 'Step 2 · Speed',
    s2t: 'How much faster is perihelion than aphelion, and what sets the speed?',
    s2e: 'The question here: knowing the orbit and the planet’s present distance r from the star, can you work out its present speed v? Energy conservation gives the <strong>vis-viva equation</strong>: <strong>v² = GM (2/r − 1/a)</strong>. G is the gravitational constant and M the star’s mass; together GM measures how strong the star’s pull is (the Sun’s value here). The closer in (smaller r), the faster; the speed depends only on r and a, not on which side of the orbit the planet is on. At perihelion and aphelion the velocity is exactly perpendicular to the star–planet line, so angular momentum conservation from step 1 gives a simpler ratio: <strong>v_peri / v_aph = r_aph / r_peri = (1 + e)/(1 − e)</strong> (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step3">→ Gravity and orbits, step 3: why it moves faster near the centre</a>). The example is still a = 1 AU around the Sun.',
    qSlider: 'Time t / T (fraction of a lap since perihelion)', playOrbit: 'Play one lap',
    c2a: 'Velocity arrow on the orbit (length ∝ speed)', c2b: 'Speed v (km/s) against time t/T',
    s2lgPlanet: 'Planet and velocity arrow', s2lgTrace: 'v(t) so far', s2lgFull: 'v(t) over the full lap',
    s2readout: 't/T = {q}: r = {r} AU, v = {v} km/s (vis-viva). Perihelion {vp} km/s, aphelion {va} km/s, ratio {vr} = r_aph / r_peri = {rr}. A circular orbit with the same a moves at {vc} km/s.',
    s2hint: 'What to try: keep e = 0.5 and drag time t/T up from 0. In the orbit plot the arrow is longest at perihelion and shortest at aphelion; the speed plot draws the v(t) you have covered as a solid line. Note that v(t) is not a gentle symmetric wave: the peak near perihelion is narrow and steep (the fast part is brief) and the trough near aphelion is wide and flat (the slow part lasts). Then change e: at e = 0 the speed stays at 29.78 km/s, Earth’s mean orbital speed.',

    s3k: 'Step 3 · Period',
    s3t: 'Double the orbit: how long is a lap? Squash it: does the period change?',
    s3e: 'The question here: what sets the period T? Kepler’s third law says <strong>T² ∝ a³</strong>. Around the Sun, measuring T in years and a in AU, the constant is exactly 1: <strong>T = √(a³) years</strong>. The precise form is T = 2π√(a³/GM): it contains a but not e (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step4">→ Gravity and orbits, step 4: bigger orbits take longer</a>). In the orbit plot two planets leave perihelion together: cyan follows a circle of radius a, orange an ellipse with the same a and eccentricity e. The period plot uses <strong>log scales</strong> (each grid step is a factor of 10): a across, T up; the line is T = √(a³) and the dots are the measured periods of the eight planets and Halley’s comet.',
    aSlider: 'Semi-major axis a (AU, log scale)', e3Slider: 'Eccentricity e of the orange orbit', playLaps: 'Run both for two laps', pause: 'Pause',
    c3a: 'Same a: circle (cyan) and ellipse (orange)', c3b: 'Period T (years) vs semi-major axis a (AU), log scales',
    s3lgCirc: 'Circular orbit', s3lgEll: 'Ellipse with the same a', s3lgLaw: 'T = √(a³)', s3lgBody: 'Measured periods',
    s3laps: 'Laps done: cyan {c} · orange {e}',
    s3lapProgress: '{lap} laps run · ',
    s3readout: '{prog}a = {a} AU: T = √(a³) = {T} years ({d} days), the same for both orbits. The animation squeezes one lap into 6 s. Halley’s comet has e = 0.967 and a = 17.83 AU; the formula gives {th} years, the measured period is about 75.3.',
    s3hint: 'What to try: press “Run both for two laps”. Orange pulls ahead near perihelion and cyan catches up near aphelion, and at the end of every lap the two are back at the start together (same count). Drag e to 0.9 and run again: same result. Finally drag a: the white ring in the period plot slides along the line; make a 4 times larger and T becomes 8 times longer (√(4³) = 8).',
    b_mercury: 'Mercury', b_venus: 'Venus', b_earth: 'Earth', b_mars: 'Mars', b_jupiter: 'Jupiter', b_saturn: 'Saturn', b_uranus: 'Uranus', b_neptune: 'Neptune', b_halley: 'Halley',

    s4k: 'Step 4 · Transit',
    s4t: 'When a planet crosses in front of its star, how much light is lost, and for how long?',
    s4e: 'The question here: we cannot see a distant planet itself, but when it passes between its star and us (a <strong>transit</strong>) it hides a small patch of the star’s face. The fraction hidden is the fraction of light lost, called the <strong>transit depth</strong>. Treating the star as a uniformly bright disc (ignoring the darker rim, “limb darkening”), the depth once the planet is fully on the disc is (planet radius Rp ÷ star radius R★)². The duration depends on how fast the planet moves along its orbit: the closer the orbit, the shorter the period (step 3) and the quicker it crosses. Here the star is the Sun, the orbit is circular and the planet crosses the centre of the disc. Rp is in <strong>Earth radii R⊕</strong> (about 6371 km); Jupiter is about 11.2 R⊕. The lower plot is the <strong>light curve</strong>: hours from mid-transit across, the drop in brightness from the unblocked star up (0 = nothing blocked).',
    rpSlider: 'Planet radius Rp (Earth radii R⊕)', a4Slider: 'Orbit radius a (AU, log scale)', xSlider: 'Planet position (in star radii, 0 = centre)', sweep4: 'Send the planet across',
    c4a: 'The star seen from Earth (planet drawn to scale)', c4b: 'Light curve: brightness drop vs time (hours)',
    s4lgStar: 'Stellar disc', s4lgPlanet: 'Planet', s4lgCurve: 'Light curve so far', s4lgFull: 'Full curve',
    s4readout: 'Rp = {rp} R⊕, a = {a} AU: period {P} days; depth (Rp/R★)² = {depth}; total duration {dur} hours. Now {dt} hours from mid-transit, brightness down by {f}.',
    s4axis: 'vertical axis rescales with the depth',
    s4hint: 'What to try: press “Send the planet across” and watch the light curve: the brightness slopes down as the planet enters the disc, stays flat while it is fully on, and climbs back as it leaves. Then change only Rp: the depth of the flat bottom goes as Rp² (double the radius, four times the depth; the vertical axis rescales, so read the number). Finally change only a: the depth stays put but the duration stretches with a (roughly as √a). An Earth-size planet at 1 AU gives about 84 ppm (parts per million) for about 13 hours; a Jupiter-size one about 1%.',

    s5k: 'Step 5 · Alignment',
    s5t: 'Why do we see no transits at all in most planetary systems?',
    s5e: 'The question here: how far must an orbit be tilted before the transit disappears? Seen from afar, the angle between the orbital plane and our line of sight is described by the <strong>inclination i</strong>: at i = 90° we see the orbit exactly edge-on. As the planet passes in front of the star, its closest approach to the centre of the disc on the sky, in star radii, is the <strong>impact parameter b = (a/R★)·cos i</strong>. Whenever b < 1 + Rp/R★ the planet’s disc touches the star and a transit happens. So the further out the orbit, the smaller the tilt away from 90° that makes the planet miss. For orbits facing random directions (cos i spread evenly between 0 and 1), the fraction that transit is about <strong>(R★ + Rp)/a</strong>. The planet here is Jupiter-size (11.2 R⊕), the star is still the Sun, the orbit circular.',
    iSlider: 'Inclination i (degrees)', a5Slider: 'Orbit radius a (AU, log scale)', drawMany: 'Place 500 random orbits', clearMany: 'Clear',
    c5a: 'Seen from Earth: the planet’s path', c5b: 'Randomly oriented orbits: cos i (0 to 1)',
    s5lgStar: 'Stellar disc', s5lgTrack: 'Planet path (closest approach to the centre = b)', s5lgHit: 'Transits', s5lgMiss: 'Misses', s5lgBand: 'Transit range cos i < (R★+Rp)/a',
    s5yes: 'a transit happens', s5no: 'no transit (it passes beside the disc)',
    s5readout: 'a = {a} AU, i = {i}°: b = {b}, {verdict}. A transit needs i > {imin}°. With random orientations the fraction that transit is (R★+Rp)/a = {p}%; {sim}',
    s5sim: '{n} placed so far, {h} transit ({f}%).',
    s5nosim: 'press “Place 500 random orbits” to run the experiment.',
    s5hint: 'What to try: keep a = 0.05 AU and drag i down from 90°. In the sky view the path moves from the middle of the disc to its edge and then off it; below {imin0}° there is no transit. Then pull a out to 1 AU: the window shrinks to about 0.29°. Finally press “Place 500 random orbits” a few times: each dot in the cos i strip is one random orientation, those inside the orange band transit, and the running fraction settles towards the formula. Changing a clears the experiment.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One law of gravity, three laws of orbits, one way to find planets',
    s6fin: '<strong>Step 0</strong>: the orbit is an ellipse with the star at a focus; perihelion and aphelion sit at a(1 ∓ e). <strong>Step 1</strong>: equal areas in equal times (angular momentum is conserved), so the planet is fast when close. <strong>Step 2</strong>: the speed follows vis-viva and depends only on r and a; the perihelion-to-aphelion speed ratio is (1 + e)/(1 − e). <strong>Step 3</strong>: the period depends only on a, T² ∝ a³. <strong>Step 4</strong>: the transit depth is about (Rp/R★)², the duration set by the orbital speed. <strong>Step 5</strong>: only nearly edge-on orbits transit; with random orientations the chance is about (R★ + Rp)/a, so a planet at 1 AU has only about a 0.5% chance of being found this way.',
    formula: 'r = a(1 − e·cos E)　M = E − e·sin E\nv² = GM (2/r − 1/a)\nT = 2π √(a³/GM)\ndepth ≈ (Rp/R★)²　P ≈ (R★ + Rp)/a',
    boundary: 'Scope: the two-body problem, with the planet’s mass negligible next to the star’s; no tugs from other planets and no relativistic corrections (such as Mercury’s perihelion precession). Measured periods are standard reference values. The transit steps assume a circular orbit, a uniformly bright stellar disc (real stars are darker at the rim, which rounds the bottom of the light curve) and a Sun-like star; on an eccentric orbit the duration also depends on where along the orbit the transit falls. The random experiment in step 5 is a simulation, not observational data.',
    linksTitle: 'Where to go next',
    lk1: '→ Gravity and orbits, step 2: why an orbit swings between two radii',
    lk2: '→ Conic sections, step 1: one number (eccentricity) tells circle, ellipse, parabola and hyperbola apart',
    lk3: '→ Seasons, step 0: is Earth closest to the Sun in the northern summer?',
    lk4: '→ Blackbody radiation, step 2: in which band a star shines brightest',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Orbital Motion · Ellipses, Speed & Transits”.'
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
