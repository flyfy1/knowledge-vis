'use strict';
// Gravity and orbits lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '万有引力与轨道 · 一颗炮弹怎样变成卫星',
    back: '← 知识索引',
    compare: '对照另一版本：万有引力与轨道 · 横着扔出去，会落下、绕圈还是飞走 →',
    navLabel: '万有引力与轨道步骤导航',
    tagline: '从一座假想的高塔上把炮弹水平打出去：慢了落地，快一点绕地球转圈，再快就一去不回。决定这一切的只有一条规则：引力与距离的平方成反比。七步里你会用这条规则检验月亮、发射炮弹、算出「逃逸速度」，再从模拟出来的轨道里量出开普勒的两条定律。',
    nav0: '0 平方反比', nav1: '1 牛顿的炮弹', nav2: '2 能飞多高', nav3: '3 等面积', nav4: '4 周期定律', nav5: '5 一天一圈', nav6: '6 收束',

    s0k: '第 0 步 · 平方反比',
    s0t: '离地球越远，引力减弱得有多快？',
    s0e: '这一步要回答：同一个物体离地心越来越远，地球拉它的力怎样变小？牛顿的<strong>万有引力定律</strong>说：引力与两者质量的乘积成正比，与中心距离 r 的平方成反比。所以离地心的距离变成 n 倍，物体受到的<strong>重力加速度</strong> g（每秒速度增加多少，单位 m/s²）变成 1/n²。地面上 g₀ ≈ 9.82 m/s²（本页用地球平均半径 R⊕ = 6371 km 和 GM = 3.986×10¹⁴ m³/s² 算出），所以 g(r) = g₀·(R⊕/r)²。牛顿自己做过一个检验：月球离地心约 60.3 R⊕，如果平方反比是对的，那里的 g 应该是地面的 1/60.3²；而月球每 27.32 天绕地一圈，由它的圆周运动算出的向心加速度 4π²r/T² 应该与之相等。',
    r0Slider: '离地心的距离 r（地球半径 R⊕）', moonBtn: '跳到月球的距离（60.3 R⊕）',
    c0a: '重力加速度 g（m/s²，对数纵轴）随 r 的变化',
    s0lgCurve: 'g₀·(R⊕/r)²', s0lgNow: '当前距离', s0lgMoon: '月球的向心加速度（由周期算出）',
    s0readout: 'r = {r} R⊕（离地面 {alt} km）：g = {g} m/s²，是地面的 1/{r2}，即 {pct}%。',
    s0moon: '月球检验：平方反比给出 {g} m/s²；由月球的轨道半径和周期算出它的向心加速度 {a} m/s²，两者相差 {d}%。',
    s0hint: '观察顺序：拖 r，看橙点沿曲线下滑：r 从 1 到 2，g 降到 1/4；到 10，只剩 1/100。纵轴是对数刻度（每格缩小 10 倍），所以平方反比在图上是一条平滑下降的曲线。按「跳到月球的距离」：曲线在 60.3 R⊕ 给出 0.00270 m/s²，月球的标记（黄色圆圈，0.00272 m/s²）几乎落在同一点上，相差约 1%。',

    s1k: '第 1 步 · 牛顿的炮弹',
    s1t: '炮弹打得越快，最后会落地、绕圈还是飞走？',
    s1e: '这一步要回答：从 1000 km 高的假想高塔上把炮弹水平打出去（真实没有这么高的塔，空气阻力也忽略），速度 v 不同，路径有哪几种？炮弹一边向前飞，一边被引力拉向地心；地面是弯的，飞得够快时，它往下落的同时地面也在「往下弯」，于是永远落不到地上，这就是<strong>轨道</strong>。路径由计算机一小步一小步算出来（每步 2 秒，按第 0 步的平方反比更新速度），不是画上去的。在这个高度：低于约 7.08 km/s 会撞到地面；正好 7.35 km/s（<strong>圆轨道速度</strong> √(GM/r)）走一个圆；介于两者之间或更快时走<strong>椭圆</strong>；达到 10.40 km/s（<strong>逃逸速度</strong> √(2GM/r)）就再也回不来。（<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step4">→ 抛体与圆周运动页第 4 步：把炮弹平着射得越来越快</a>）',
    v1Slider: '发射速度 v（km/s）', fire1: '发射（画出路径）', circ1: '设为圆轨道速度', esc1: '设为逃逸速度', clear1: '清除旧路径',
    c1a: '从 1000 km 高塔水平发射（俯视）',
    s1lgNow: '本次路径', s1lgOld: '之前的路径', s1lgEarth: '地球', s1lgTower: '发射点',
    s1ground: 'v = {v} km/s：撞地。飞了 {min} 分钟，沿地面落在发射点前方 {km} km 处。',
    s1ellA: 'v = {v} km/s：椭圆轨道，发射点是最高点（远地点，高 {ha} km），最低点（近地点）高 {hp} km；绕一圈 {min} 分钟。',
    s1ellP: 'v = {v} km/s：椭圆轨道，发射点是最低点（近地点，高 {hp} km），最高点（远地点）高 {ha} km；绕一圈 {min} 分钟。',
    s1circ: 'v = {v} km/s：圆轨道，高度始终约 {ha} km；绕一圈 {min} 分钟。',
    s1esc: 'v = {v} km/s：逃逸。速度不低于这个高度的逃逸速度 {ve} km/s，飞出画面（离地心 {rk} km）时仍有 {vend} km/s，并且还在远离。',
    s1far: 'v = {v} km/s：仍然是椭圆（低于这个高度的逃逸速度 {ve} km/s），但远地点高 {ha} km，在画面之外；绕一圈要 {h} 小时。画面只显示离地心 6 R⊕ 以内的一段，远地点高度和周期由能量与周期公式算出。',
    s1prog: '（已画 {c}/{N} 段）',
    s1hint: '观察顺序：从 v = 5 开始发射，再依次试 7、7.2、8、9.5、10.5；每条旧路径都留在图上做对比。注意 7.08 附近：低一点擦着地面撞上，高一点就绕回发射点。按「设为圆轨道速度」得到一个圆；按「设为逃逸速度」看它飞出画面。画面会按当前路径自动缩放。',

    s2k: '第 2 步 · 能飞多高',
    s2t: '竖直向上打，速度要多大才回不来？',
    s2e: '这一步要回答：把东西从地面竖直向上发射，速度 v 时能升多高？如果 g 处处等于 g₀，答案是 h = v²/(2g₀)，速度再大也总会落回来。但 g 随高度按第 0 步减小，越往上拉得越轻，所以实际升得更高。用<strong>能量</strong>算：每千克物体的动能是 ½v²，<strong>引力势能</strong>是 −GM/r（离得无穷远时为 0，越靠近地心越低）。上升时动能换成势能，两者之和 E 不变；动能用完的地方就是最高点。E ≥ 0 时，势能走到无穷远也只升到 0，动能永远用不完，这就是<strong>逃逸</strong>。由 ½v² = GM/R⊕ 得逃逸速度 √(2GM/R⊕) ≈ 11.19 km/s。逃逸只看能量，不看方向：第 1 步水平发射时同样是 √2 倍圆轨道速度。（<a class="xlink" href="../../../physics/mechanics/mechanical-energy/#step0">→ 机械能页第 0 步：下落时能量去了哪里</a>）',
    v2Slider: '竖直发射速度 v（km/s）',
    c2a: '每千克的能量（MJ/kg）随 r（R⊕）', c2b: '最高点高度（千 km）随发射速度（km/s）',
    s2lgU: '引力势能 −GM/r', s2lgFlat: '若 g 不变的势能（直线）', s2lgE: '总能量 E', s2lgTrue: '平方反比下的高度', s2lgFlatH: 'g 不变时的高度 v²/(2g₀)',
    s2readout: 'v = {v} km/s：总能量 E = {E} MJ/kg。平方反比下最高升到 {h} km；若 g 不变只能升 {hf} km，实际是它的 {k} 倍。',
    s2esc: 'v = {v} km/s：总能量 E = {E} MJ/kg ≥ 0，动能永远用不完，它不再回来（逃逸速度 {ve} km/s）。若 g 不变，它只会升到 {hf} km 就落回。',
    s2hint: '观察顺序：慢慢把 v 从 3 拖到 12。能量图里，水平的总能量线与弯曲的势能曲线的交点就是最高点；与直线的交点是「g 不变」的估算。v 小时两点几乎重合（v = 3 时 494 km 对 458 km）；v = 9 时已差近 3 倍；v 越过 11.19，总能量线升到 0 以上，再也碰不到曲线。速度图同时记下两种高度：一条向上猛冲，一条只是平缓的抛物线。',

    s3k: '第 3 步 · 等面积',
    s3t: '卫星在椭圆上忽快忽慢，有什么量是均匀的？',
    s3e: '这一步要回答：椭圆轨道上，卫星离地近时快、远时慢，有没有什么东西是匀速增加的？把一圈的时间平均切成 12 份，每份里从地心到卫星的连线扫过一块扇形。开普勒第二定律说：<strong>相等时间扫过相等面积</strong>。原因是引力总是指向地心，不会让卫星「绕着地心转」的趋势变强或变弱：<strong>角动量</strong>（这里可以理解为 r × 垂直于连线的速度分量）保持不变，而它正好是扫面积速率的 2 倍。所以近地点速度 ÷ 远地点速度 = 远地距离 ÷ 近地距离。这里的轨道和第 1 步一样从 1000 km 高处水平发射，面积用模拟出的每一步（1 秒）累加。（<a class="xlink" href="../../../variants/claude-code/kepler-orbits/#step1">→ 开普勒轨道 Claude 版第 1 步：相等时间内的弧长与面积</a>）',
    v3Slider: '发射速度 v（km/s，发射点为近地点）', play3: '让卫星走一圈（按 12 等份时间着色）',
    c3a: '轨道与 12 块等时扇形', c3b: '每份时间：扫过面积与走过路程（÷ 平均）',
    s3lgA: '扇形（相邻两色交替）', s3lgSat: '卫星', s3lgArea: '面积 ÷ 平均', s3lgPath: '路程 ÷ 平均',
    s3readout: 'v = {v} km/s：近地点离地心 {rp} km，远地点 {ra} km，周期 {T} 小时。12 块面积最大与最小只差 {spread}%；而路程最长的一份是最短的 {lr} 倍。近地点速度 ÷ 远地点速度 = {vr}，正好等于远地距离 ÷ 近地距离 {rr}。{prog}',
    s3prog: '（已走 {c}/12 份）',
    s3hint: '观察顺序：先用默认 v = 9 按「让卫星走一圈」：每一份时间画出一块扇形，靠近地球时扇形又短又宽，远处时又细又长。看下面的柱状图：青色的面积柱一样高，橙色的路程柱高低悬殊。再把 v 拖到 7.4（几乎是圆）：路程柱也变得一样高，因为圆上的速度不变。',

    s4k: '第 4 步 · 周期定律',
    s4t: '轨道越大，转一圈要多久？形状重要吗？',
    s4e: '这一步要回答：一圈的时间 T（<strong>周期</strong>）由什么决定？把椭圆最远点与最近点到地心的距离取平均，叫<strong>半长轴</strong> a（圆轨道的 a 就是半径）。开普勒第三定律说 T² 与 a³ 成正比；牛顿由平方反比引力推出比例系数：T² = 4π²a³/GM。这里用模拟检验：每次选一个发射高度和速度，计算机算出一圈，测出周期 T 和 a，在对数坐标里描一个点。对数坐标里 T ∝ a^1.5 是一条斜率 1.5 的直线。注意测量完全不用这条公式：T 是数到卫星转回发射方向所用的时间，a 是轨迹上的最远和最近距离的平均。',
    h4Slider: '发射高度（km）', q4Slider: '发射速度 ÷ 该高度的圆轨道速度', add4: '发射并测量周期', clear4: '清空测量点',
    c4a: '测过的轨道（同一比例）', c4b: 'lg T（小时）对 lg a（千 km）',
    s4lgLaw: 'T² = 4π²a³/GM（斜率 1.5）', s4lgPt: '模拟测得的点', s4lgLast: '最新一次',
    s4readout: '最新一次：高 {h} km、{q} 倍圆轨道速度 → 测得 T = {T} 小时，a = {a} km。T²/a³ 与 4π²/GM 之比为 {ratio}。已测 {n} 条轨道。',
    s4crash: '高 {h} km、{q} 倍圆轨道速度：近地点低于地面，卫星会撞上地球，测不出周期。把速度比调大一点。',
    s4none: '还没有测量点：选好高度和速度，按「发射并测量周期」。',
    s4hint: '观察顺序：先在 h = 1000 km 下分别用 0.95、1、1.2 倍速度各测一次，再把高度改成 20000 km 测几次。所有点都落在同一条斜率 1.5 的直线上：形状再扁，只要 a 相同，周期就相同。T²/a³ 与 4π²/GM 之比与 1 只差数值积分的微小误差（小于百万分之一）。',

    s5k: '第 5 步 · 一天一圈',
    s5t: '卫星要放多高，才能一天正好绕地球一圈？',
    s5e: '这一步要回答：圆轨道的高度怎样决定周期和速度，哪个高度的周期正好是「一天」？由第 4 步，圆轨道的周期 T = 2π√(a³/GM)，速度 v = √(GM/a)，a = R⊕ + 高度。越高转得越慢、一圈也越长。「一天」要用地球相对恒星自转一圈的时间，<strong>恒星日</strong> 23 小时 56 分（86164 秒）：在赤道上空这个高度向东转，卫星就和地面保持相对静止，这就是<strong>地球静止轨道</strong>。反解 a = ∛(GM·T²/4π²)。（<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step5">→ 抛体与圆周运动页第 5 步：轨道高度与速度、周期</a>）',
    alt5Slider: '轨道高度（km，对数刻度）', geo5: '求出周期正好一个恒星日的高度',
    c5a: 'lg 周期（小时）对 lg 高度（km）',
    s5lgCurve: '圆轨道 T = 2π√(a³/GM)', s5lgNow: '当前高度', s5lgDay: '一个恒星日',
    satISS: '国际空间站 约 420 km', satGPS: 'GPS 卫星 20200 km', satGEO: '地球静止轨道', satMoon: '月球（离地心 384400 km）',
    s5readout: '高度 {alt} km（a = {a} km）：速度 {v} km/s，周期 {T}。',
    s5geo: '这就是地球静止轨道：高度约 {alt} km，周期正好一个恒星日。',
    s5moon: '用同一公式算出月球周期 {d} 天，比实测 27.32 天略长：月球自身质量也在拉地球，两者绕公共质心转（本页忽略）。',
    s5hint: '观察顺序：先把高度拖到最低，读空间站一圈约 93 分钟；再往右拖，看周期曲线一路上升，经过 GPS（约 12 小时）。按「求出周期正好一个恒星日的高度」，橙点落在虚线上，约 35790 km。最后拖到最右：月球按公式约 27.45 天。',
    unitR: '（刻度 R⊕）',
    hMin: '{m} 分钟', hHour: '{h} 小时', hDay: '{d} 天',

    s6k: '第 6 步 · 收束', s6t: '一条平方反比，管住落地、绕圈和飞走',
    s6fin: '回看这条线。<strong>第 0 步</strong>：引力按 1/r² 减弱，月球的向心加速度正好对上。<strong>第 1 步</strong>：水平发射时，速度决定路径：撞地、椭圆、圆、逃逸，分界是 √(GM/r) 和 √(2GM/r)。<strong>第 2 步</strong>：用能量看，E < 0 时一定会转回来，E ≥ 0 时一去不回；越高拉力越小，所以实际能升得比「g 不变」高得多。<strong>第 3 步</strong>：角动量守恒让连线在相等时间扫过相等面积，近处快、远处慢。<strong>第 4 步</strong>：周期只由半长轴决定，T² ∝ a³。<strong>第 5 步</strong>：反解 T = 一个恒星日，得到约 35790 km 高的静止轨道。',
    formula: 'g = GM/r²\nv圆 = √(GM/r)，v逃 = √(2GM/r)\nE = ½v² − GM/r\nT² = 4π²a³/GM',
    boundary: '适用范围：本页把地球当成不动的质点（球对称时与真实地球的外部引力相同），只算地球一个天体的引力，忽略空气阻力和地球自转；路径由 RK4 数值积分得到（步长 1–2 秒），与闭式解的差别远小于图上能看出的程度。真实卫星还受地球扁率、月球和太阳的牵引；月球周期的计算忽略了月球自身质量。',
    linksTitle: '接着去看',
    lk1: '→ 牛顿运动定律页第 0 步：力怎样改变速度',
    lk2: '→ 抛体与圆周运动页第 4 步：平射的炮弹越来越快会怎样',
    lk3: '→ 开普勒轨道 Claude 版第 3 步：轨道放大一倍，周期变多少',
    lk4: '→ 引力透镜页第 0 步：光经过大质量天体时也会拐弯',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《万有引力与轨道 · 横着扔出去，会落下、绕圈还是飞走》的平行版本。'
  },
  en: {
    pageTitle: 'Gravity and Orbits · How a Cannonball Becomes a Satellite',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Gravity and Orbits · Throw It Sideways: Fall, Circle or Escape →',
    navLabel: 'Gravity and orbits steps',
    tagline: 'Fire a cannonball sideways from an imaginary tall tower: too slow and it lands, a bit faster and it circles the Earth, faster still and it never comes back. One rule decides all of it: gravity falls off with the square of distance. Over seven steps you will test that rule against the Moon, fire the cannon, work out the escape speed, and measure two of Kepler’s laws from simulated orbits.',
    nav0: '0 Inverse square', nav1: '1 Newton’s cannon', nav2: '2 How high', nav3: '3 Equal areas', nav4: '4 Period law', nav5: '5 Once a day', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Inverse square',
    s0t: 'Move away from the Earth: how fast does gravity fade?',
    s0e: 'This step asks: as an object moves farther from the Earth’s centre, how does the Earth’s pull weaken? Newton’s <strong>law of universal gravitation</strong> says the force is proportional to the product of the two masses and inversely proportional to the square of the centre-to-centre distance r. So multiply the distance by n and the <strong>gravitational acceleration</strong> g (how much speed is gained each second, in m/s²) drops to 1/n². At the surface g₀ ≈ 9.82 m/s² (computed here from the mean Earth radius R⊕ = 6371 km and GM = 3.986×10¹⁴ m³/s²), so g(r) = g₀·(R⊕/r)². Newton ran a check himself: the Moon is about 60.3 R⊕ from the Earth’s centre, so if the inverse square holds, g there should be 1/60.3² of the surface value; and since the Moon circles the Earth every 27.32 days, the centripetal acceleration of that circular motion, 4π²r/T², ought to match.',
    r0Slider: 'Distance from the Earth’s centre r (Earth radii R⊕)', moonBtn: 'Jump to the Moon’s distance (60.3 R⊕)',
    c0a: 'g (m/s², log axis) against distance r',
    s0lgCurve: 'g₀·(R⊕/r)²', s0lgNow: 'current distance', s0lgMoon: 'Moon’s centripetal acceleration (from its period)',
    s0readout: 'r = {r} R⊕ ({alt} km above the ground): g = {g} m/s², which is 1/{r2} of the surface value, i.e. {pct}%.',
    s0moon: 'The Moon test: the inverse square gives {g} m/s²; the Moon’s orbital radius and period give a centripetal acceleration of {a} m/s². They differ by {d}%.',
    s0hint: 'What to try: drag r and watch the orange dot slide down the curve. From r = 1 to 2, g drops to a quarter; at 10 only a hundredth is left. The vertical axis is logarithmic (each gridline is 10× smaller), so the inverse square shows up as a smooth falling curve. Press “Jump to the Moon’s distance”: the curve gives 0.00270 m/s² at 60.3 R⊕, and the Moon’s marker (the yellow ring, 0.00272 m/s²) lands almost on the same spot, about 1% away.',

    s1k: 'Step 1 · Newton’s cannon',
    s1t: 'Fire faster and faster: does the ball land, circle or fly away?',
    s1e: 'This step asks: fire a cannonball horizontally from an imaginary tower 1000 km tall (no real tower is that tall, and we ignore air drag). What kinds of path do different speeds v give? The ball moves forward while gravity pulls it towards the centre; the ground curves away, so if it goes fast enough, the ground drops away as fast as the ball falls and it never lands. That is an <strong>orbit</strong>. The paths are computed step by step (2 seconds per step, updating the velocity with step 0’s inverse square), not drawn by hand. At this height: below about 7.08 km/s it hits the ground; at exactly 7.35 km/s (the <strong>circular speed</strong> √(GM/r)) it traces a circle; in between, or faster, it traces an <strong>ellipse</strong>; at 10.40 km/s (the <strong>escape speed</strong> √(2GM/r)) it never returns. (<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step4">→ Projectiles and circular motion, step 4: firing the cannonball faster and faster</a>)',
    v1Slider: 'Launch speed v (km/s)', fire1: 'Fire (draw the path)', circ1: 'Set circular speed', esc1: 'Set escape speed', clear1: 'Clear old paths',
    c1a: 'Fired sideways from a 1000 km tower',
    s1lgNow: 'this path', s1lgOld: 'earlier paths', s1lgEarth: 'Earth', s1lgTower: 'launch point',
    s1ground: 'v = {v} km/s: it hits the ground after {min} minutes, {km} km ahead of the launch point along the surface.',
    s1ellA: 'v = {v} km/s: an elliptical orbit. The launch point is the highest point (apogee, {ha} km up) and the lowest point (perigee) is {hp} km up; one lap takes {min} minutes.',
    s1ellP: 'v = {v} km/s: an elliptical orbit. The launch point is the lowest point (perigee, {hp} km up) and the highest point (apogee) is {ha} km up; one lap takes {min} minutes.',
    s1circ: 'v = {v} km/s: a circular orbit, staying about {ha} km up; one lap takes {min} minutes.',
    s1esc: 'v = {v} km/s: escape. The speed is at least this height’s escape speed of {ve} km/s; leaving the frame ({rk} km from the centre) it still has {vend} km/s and is still moving away.',
    s1far: 'v = {v} km/s: still an ellipse (below this height’s escape speed of {ve} km/s), but its apogee is {ha} km up, outside the frame; one lap takes {h} hours. The frame only shows the part within 6 R⊕ of the centre; the apogee height and period come from the energy and period formulas.',
    s1prog: '({c}/{N} segments drawn)',
    s1hint: 'What to try: fire at v = 5, then try 7, 7.2, 8, 9.5 and 10.5 in turn; every old path stays for comparison. Watch around 7.08: a little slower and it clips the ground, a little faster and it swings back to the launch point. “Set circular speed” gives a circle; “Set escape speed” sends it off the frame. The frame rescales to fit the current path.',

    s2k: 'Step 2 · How high',
    s2t: 'Fire straight up: how fast before it never comes back?',
    s2e: 'This step asks: launch something straight up from the ground at speed v. How high does it rise? If g were g₀ everywhere, the answer would be h = v²/(2g₀), and however fast you went it would always fall back. But g weakens with height as in step 0, so the pull eases off as it climbs and it rises higher. Use <strong>energy</strong>: per kilogram, kinetic energy is ½v² and <strong>gravitational potential energy</strong> is −GM/r (zero infinitely far away, lower the closer to the centre). On the way up kinetic energy turns into potential energy and their sum E stays fixed; the top is where the kinetic energy runs out. If E ≥ 0, the potential only climbs to 0 even infinitely far away, so the kinetic energy never runs out: that is <strong>escape</strong>. ½v² = GM/R⊕ gives the escape speed √(2GM/R⊕) ≈ 11.19 km/s. Escape depends on energy, not direction: step 1’s horizontal launch needed √2 times the circular speed too. (<a class="xlink" href="../../../physics/mechanics/mechanical-energy/#step0">→ Mechanical energy, step 0: where the energy goes as a ball falls</a>)',
    v2Slider: 'Vertical launch speed v (km/s)',
    c2a: 'Energy per kg (MJ/kg) against r (R⊕)', c2b: 'Peak height (1000 km) vs launch speed (km/s)',
    s2lgU: 'potential energy −GM/r', s2lgFlat: 'potential if g stayed constant (a line)', s2lgE: 'total energy E', s2lgTrue: 'height with the inverse square', s2lgFlatH: 'height with constant g, v²/(2g₀)',
    s2readout: 'v = {v} km/s: total energy E = {E} MJ/kg. With the inverse square it peaks at {h} km; with constant g it would reach only {hf} km, so the true height is {k}× that.',
    s2esc: 'v = {v} km/s: total energy E = {E} MJ/kg ≥ 0, so the kinetic energy never runs out and it never comes back (escape speed {ve} km/s). With constant g it would turn round at {hf} km.',
    s2hint: 'What to try: drag v slowly from 3 to 12. In the energy chart the flat total-energy line meets the curved potential at the peak, and meets the straight line at the constant-g estimate. For small v the two points almost coincide (494 km against 458 km at v = 3); by v = 9 they differ nearly threefold; past 11.19 the energy line rises above 0 and never touches the curve again. The speed chart records both heights: one shoots upwards, the other is a gentle parabola.',

    s3k: 'Step 3 · Equal areas',
    s3t: 'A satellite speeds up and slows down around its ellipse. Does anything grow steadily?',
    s3e: 'This step asks: on an elliptical orbit the satellite is fast near the Earth and slow far away. Does anything increase at a steady rate? Cut one lap into 12 equal stretches of time; in each, the line from the Earth’s centre to the satellite sweeps out a wedge. Kepler’s second law says <strong>equal times sweep equal areas</strong>. The reason: gravity always points at the centre, so it can neither boost nor brake the satellite’s tendency to turn around the centre. That <strong>angular momentum</strong> (here, r times the part of the velocity perpendicular to the line) stays fixed, and it is exactly twice the rate of sweeping area. So speed at perigee ÷ speed at apogee = apogee distance ÷ perigee distance. The orbit is launched horizontally from 1000 km up, as in step 1, and the areas are added up from every simulated 1-second step. (<a class="xlink" href="../../../variants/claude-code/kepler-orbits/#step1">→ Kepler orbits, Claude edition, step 1: arcs and areas in equal times</a>)',
    v3Slider: 'Launch speed v (km/s; the launch point is perigee)', play3: 'Fly one lap (coloured in 12 equal times)',
    c3a: 'Orbit with 12 equal-time wedges', c3b: 'Per time slice: area and path length (÷ average)',
    s3lgA: 'wedges (two alternating colours)', s3lgSat: 'satellite', s3lgArea: 'area ÷ average', s3lgPath: 'distance ÷ average',
    s3readout: 'v = {v} km/s: perigee {rp} km and apogee {ra} km from the centre, period {T} hours. The largest and smallest of the 12 areas differ by only {spread}%, while the longest stretch of path is {lr}× the shortest. Speed at perigee ÷ speed at apogee = {vr}, exactly apogee distance ÷ perigee distance {rr}. {prog}',
    s3prog: '({c}/12 slices flown)',
    s3hint: 'What to try: with the default v = 9, press “Fly one lap”. Each time slice paints one wedge: near the Earth the wedges are short and fat, far away long and thin. Look at the bar chart below: the cyan area bars are all the same height, while the orange distance bars differ wildly. Then drag v to 7.4 (almost a circle): the distance bars level out too, because speed is constant on a circle.',

    s4k: 'Step 4 · The period law',
    s4t: 'The bigger the orbit, the longer a lap. Does the shape matter?',
    s4e: 'This step asks: what sets the time for one lap, the <strong>period</strong> T? Average the farthest and nearest distances of an ellipse from the centre and you get the <strong>semi-major axis</strong> a (for a circle, a is the radius). Kepler’s third law says T² is proportional to a³; Newton derived the constant from the inverse-square pull: T² = 4π²a³/GM. Here we test it by simulation: pick a launch height and speed, the computer flies one lap, measures T and a, and plots a point on log axes, where T ∝ a^1.5 is a straight line of slope 1.5. The measurement never uses the formula: T is counted until the satellite is back at its launch direction, and a is the average of the largest and smallest distances on the computed path.',
    h4Slider: 'Launch height (km)', q4Slider: 'Launch speed ÷ circular speed at that height', add4: 'Launch and measure the period', clear4: 'Clear measurements',
    c4a: 'Orbits measured (same scale)', c4b: 'lg T (hours) against lg a (thousand km)',
    s4lgLaw: 'T² = 4π²a³/GM (slope 1.5)', s4lgPt: 'points measured in simulation', s4lgLast: 'latest',
    s4readout: 'Latest: {h} km up at {q}× circular speed → measured T = {T} hours, a = {a} km. T²/a³ divided by 4π²/GM is {ratio}. {n} orbits measured.',
    s4crash: '{h} km up at {q}× circular speed: the perigee is below the ground, so the satellite would hit the Earth and no period can be measured. Raise the speed ratio a little.',
    s4none: 'No measurements yet: choose a height and speed, then press “Launch and measure the period”.',
    s4hint: 'What to try: at h = 1000 km, measure once each at 0.95, 1 and 1.2 times circular speed; then change the height to 20000 km and measure a few more. Every point lands on the same slope-1.5 line: however squashed the orbit, the same a means the same period. T²/a³ divided by 4π²/GM differs from 1 only by tiny integration error (under one part in a million).',

    s5k: 'Step 5 · Once a day',
    s5t: 'How high must a satellite be to go round exactly once a day?',
    s5e: 'This step asks: how does a circular orbit’s height set its period and speed, and which height gives a period of exactly “one day”? From step 4, a circular orbit has period T = 2π√(a³/GM) and speed v = √(GM/a), with a = R⊕ + height. Higher means slower and a longer lap. “One day” has to be the time the Earth takes to turn once relative to the stars, the <strong>sidereal day</strong> of 23 h 56 min (86164 s): a satellite at that height over the equator, heading east, stays fixed above the ground. That is the <strong>geostationary orbit</strong>. Solve backwards: a = ∛(GM·T²/4π²). (<a class="xlink" href="../../../physics/mechanics/projectile-circular/#step5">→ Projectiles and circular motion, step 5: orbit height, speed and period</a>)',
    alt5Slider: 'Orbit height (km, log scale)', geo5: 'Find the height for one sidereal day',
    c5a: 'lg period (hours) against lg height (km)',
    s5lgCurve: 'circular orbit T = 2π√(a³/GM)', s5lgNow: 'current height', s5lgDay: 'one sidereal day',
    satISS: 'Space Station, about 420 km', satGPS: 'GPS satellites, 20200 km', satGEO: 'geostationary orbit', satMoon: 'the Moon (384400 km from the centre)',
    s5readout: 'Height {alt} km (a = {a} km): speed {v} km/s, period {T}.',
    s5geo: 'This is the geostationary orbit: about {alt} km up, with a period of exactly one sidereal day.',
    s5moon: 'The same formula gives the Moon a period of {d} days, a little longer than the measured 27.32: the Moon’s own mass pulls on the Earth too, and both circle their common centre of mass (ignored here).',
    s5hint: 'What to try: drag the height all the way down and read about 93 minutes per lap for the Space Station; then drag right and watch the period climb past GPS (about 12 hours). Press “Find the height for one sidereal day”: the orange dot lands on the dashed line at about 35790 km. Finally drag to the far right: the formula gives the Moon about 27.45 days.',
    unitR: ' · ticks in R⊕',
    hMin: '{m} minutes', hHour: '{h} hours', hDay: '{d} days',

    s6k: 'Step 6 · Wrap-up', s6t: 'One inverse square decides landing, circling and leaving',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: gravity weakens as 1/r², and the Moon’s centripetal acceleration matches. <strong>Step 1</strong>: fired horizontally, speed picks the path: crash, ellipse, circle, escape, with √(GM/r) and √(2GM/r) as the dividing lines. <strong>Step 2</strong>: in energy terms, E < 0 always brings it back and E ≥ 0 never does; the pull weakens with height, so it climbs far higher than the constant-g estimate. <strong>Step 3</strong>: conserved angular momentum makes the line sweep equal areas in equal times, fast near and slow far. <strong>Step 4</strong>: the period depends only on the semi-major axis, T² ∝ a³. <strong>Step 5</strong>: set T to one sidereal day and solve: the geostationary orbit, about 35790 km up.',
    formula: 'g = GM/r²\nv_circ = √(GM/r), v_esc = √(2GM/r)\nE = ½v² − GM/r\nT² = 4π²a³/GM',
    boundary: 'Scope: this page treats the Earth as a fixed point mass (outside a spherical Earth the pull is the same), counts only the Earth’s gravity, and ignores air drag and the Earth’s rotation. Paths come from RK4 numerical integration (1–2 second steps), which differs from the exact solutions by far less than the charts can show. Real satellites also feel the Earth’s flattening and the pull of the Moon and Sun; the Moon’s period here ignores the Moon’s own mass.',
    linksTitle: 'Where to go next',
    lk1: '→ Newton’s laws, step 0: how a force changes velocity',
    lk2: '→ Projectiles and circular motion, step 4: a sideways cannonball fired faster and faster',
    lk3: '→ Kepler orbits, Claude edition, step 3: double the orbit, and how the period changes',
    lk4: '→ Gravitational lensing, step 0: light bends near a massive body too',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Gravity and Orbits · Throw It Sideways: Fall, Circle or Escape”.'
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
  if (typeof window.refreshOrbits === 'function') window.refreshOrbits();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ORBIT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
