'use strict';
// Mechanical energy lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '机械能守恒 · 高度和速度在记同一本账',
    back: '← 知识索引',
    compare: '对照另一版本：机械能守恒 · 过山车的能量账本 →',
    navLabel: '机械能守恒步骤导航',
    tagline: '球往下掉越来越快，过山车冲下坡又爬上坡——高度和速度之间有一本账：少了多少高度，就换来多少速度。五步里你先看一个球自由下落时这本账怎么记，再把它用到过山车和单摆上，然后加上阻力，看少掉的那部分去了哪里，最后算一算为什么车速翻倍，撞击就猛四倍。',
    nav0: '0 下落', nav1: '1 过山车', nav2: '2 单摆', nav3: '3 阻力', nav4: '4 速度的平方', nav5: '5 收束',

    s0k: '第 0 步 · 下落',
    s0t: '球往下掉时，少掉的高度换来了什么？',
    s0e: '这一步要回答：一个球从高处由静止落下，高度越来越小、速度越来越大，两者之间有没有固定的换算？物理里用<strong>能量</strong>来记这本账，单位焦耳（J）。被举高的物体具有<strong>重力势能</strong> E<sub>p</sub> = mgh：m 是质量（kg），h 是离地面的高度（m），g = 9.8 N/kg 表示地球对每千克物体的拉力。运动的物体具有<strong>动能</strong> E<sub>k</sub> = ½mv²：v 是速度（m/s）。两者之和叫<strong>机械能</strong>。下面的球只受重力（不计空气阻力），按「松手」看它下落；也可以拖时间滑杆停在任意时刻。',
    h0Label: '出发高度 h₀（m）', mLabel: '球的质量 m（kg）', tLabel: '时间 t（s）',
    drop: '松手', reset: '回到起点',
    c0scene: '下落的球（每 0.1 s 留一个影子）和此刻的三根能量条（J）',
    c0plot: '能量（J）随已经下落的高度变化',
    barEp: '势能', barEk: '动能', barSum: '合计',
    s0lgEp: '重力势能 Eₚ = mgh', s0lgEk: '动能 Eₖ = ½mv²', s0lgSum: '两者之和', s0lgGhost: '每 0.1 s 的位置',
    s0readout: '{prog}t = {t} s：高度 {h} m，速度 {v} m/s。势能 {Ep} J + 动能 {Ek} J = {sum} J（松手时是 {E0} J）。落地速度 √(2gh₀) = {vi} m/s，和质量无关。',
    s0prog: '正在下落（慢放 3 倍）：',
    s0hint: '观察顺序：先按「松手」，看上面的影子越来越稀——球越落越快；同时橙色势能条变短、青色动能条变长，白色合计条始终一样长。下面的图把这个过程画成两条线：势能每少 1 J，动能就多 1 J。再改质量：两种能量都按比例变大，但落地速度不变——因为 m 在 mgh 和 ½mv² 两边同时出现，可以约掉，所以 v = √(2gh₀)。',

    s1k: '第 1 步 · 过山车',
    s1t: '过山车在轨道上每一处有多快？能冲过所有的坡吗？',
    s1e: '这一步要回答：小车从坡上静止松手，沿着弯弯曲曲的轨道滑行，它在某一处的速度由什么决定？轨道对小车的支持力始终垂直于轨道，不推它也不拉它，不改变它的机械能；如果再忽略摩擦和空气阻力，那么只有重力在做事，机械能保持不变——这就是<strong>机械能守恒</strong>。于是在任何一处，动能 = mg ×（出发高度 − 此处高度），速度只看这处比出发点低多少，与轨道走了什么弯路无关。比出发点还高的地方，动能得是负数，不可能，所以小车到不了：它会在那之前停下、往回滑。小车质量 500 kg（能量用 kJ，1 kJ = 1000 J）。',
    HLabel: '松手高度 H（m）', probeLabel: '探测点的水平位置 x（m）',
    play: '开车', pause: '暂停', restart: '回到起点',
    c1scene: '轨道（竖直方向已放大）：粉色是比出发点高、到不了的地方', c1plot: '轨道上每一处的能量（kJ），横轴是水平位置 x（m）',
    s1lgEp: '势能', s1lgEk: '动能', s1lgTotal: '机械能（出发时的势能）', s1lgNo: '比出发点高：到不了',
    s1readout: '{prog}探测点 x = {x} m：轨道高 {h} m，{probe}小车此刻：t = {t} s，在 x = {cx} m 处，速度 {cv} m/s。{reach}',
    s1probeOk: '比出发点低 {d} m，速度 √(2g×{d}) = {v} m/s；势能 {Ep} kJ + 动能 {Ek} kJ = {E} kJ。',
    s1probeNo: '比出发点高 {d} m，小车到不了这里。',
    s1turn: '小车最远到 x = {x} m 就掉头（那里轨道高度等于出发高度）。',
    s1pass: '小车能冲过 10 m 高的第二个坡，最远到 x = {x} m。',
    s1prog: '行驶中（快放 2 倍）：',
    s1hint: '观察顺序：先把松手高度放在 12 m，按「开车」：小车在低处跑得快、在坡顶慢，到 x ≈ 93 m 又爬回 12 m 高才掉头，来回往返。拖探测点到 x = 30 m（第二个坡顶，10 m 高）：速度 = √(2g×2) ≈ 6.3 m/s。再把松手高度降到 9.5 m：第二个坡的坡顶变成粉色，小车开到坡顶前就退了回来。下面的图里，橙色和青色叠起来的总高度处处相等。',

    s2k: '第 2 步 · 单摆',
    s2t: '换一条路回来，球还能升到原来的高度吗？',
    s2e: '这一步要回答：「只看高度、不看路线」对别的运动也成立吗？用一根 3 m 的细绳挂一个球，从左边拉起一定角度后松手。在悬点正下方钉一颗钉子：球摆到最低点后，绳子被钉子挡住，右半边只能绕钉子转一个更小的圆。路线变了，球在右边能升到多高？绳子的拉力始终垂直于球的运动方向，不改变机械能，所以若不计空气阻力，答案仍由机械能守恒决定：右边的最高点与松手时一样高。这是伽利略做过的实验。钉子最低放到悬点下 1.9 m，保证球在右边升到最高时绳子仍是绷紧的。',
    thLabel: '松手角度 θ（度）', pegLabel: '钉子在悬点下方多深 p（m，0 = 不钉）',
    swing: '松手摆一个来回',
    c2scene: '单摆（虚线是松手高度；保留最近几次的路线）',
    s2lgPath: '这一次的路线', s2lgOld: '之前几次的路线', s2lgLine: '松手高度', s2lgPeg: '钉子',
    s2readout: '{prog}松手高度 {h0} m（比最低点高）。右边绕钉子摆，半径变成 {r} m，模拟得到的最高点 {hm} m，两边相差 {diff} mm；绕钉子转过的最大角度 {phi}°，松手角度 {th}°。',
    s2prog: '摆动中：',
    s2hint: '观察顺序：先不钉钉子（p = 0）按「松手摆一个来回」，球在右边升到虚线就折回。再把钉子放到 1.0 m、1.5 m、1.9 m，各摆一次：右边的弧越来越小、越来越弯，转过的角度越来越大，但每条路线的最高点都正好碰到同一条虚线。之前的路线会留在图上，方便对比。',

    s3k: '第 3 步 · 阻力',
    s3t: '有了阻力，少掉的机械能去了哪里？',
    s3e: '这一步要回答：真实的过山车不会永远来回跑，越跑越低，最后停下。机械能少了，是凭空消失了吗？车轮与轨道之间的摩擦、空气的阻挡，都给小车一个与运动方向相反的力。本页把它们合成一个大小不变的<strong>阻力</strong> f = k × 小车重力（k 是阻力系数，0.05 表示阻力是重力的 5%），这是简化。小车每走一段路，阻力就把 f × 路程 这么多机械能变成车轮、轨道和空气的<strong>内能</strong>（温度略微升高），本页叫它「热」。阻力做功的算法见杠杆滑轮页（<a class="xlink" href="../../../physics/mechanics/lever-pulley/#step2">→ 杠杆与滑轮第 2 步：力乘距离这本账</a>）。把热也记进账本：势能 + 动能 + 热 = 出发时的机械能。',
    kLabel: '阻力系数 k（阻力 = k × 重力）',
    toEnd: '跳到结束',
    c3scene: '轨道（竖直方向已放大）：每 0.5 s 留一个影子', c3plot: '能量账本（kJ）随时间变化',
    s3lgEp: '势能', s3lgEk: '动能', s3lgQ: '热（阻力做的功）', s3lgE0: '出发时的机械能',
    s3readout: '{prog}t = {t} s：势能 {Ep} kJ + 动能 {Ek} kJ + 热 {Q} kJ = {sum} kJ（出发时 {E0} kJ，账差 {err}%）。已走路程 {s} m，热 = f × 路程 = {f} N × {s} m。{end}',
    s3prog: '行驶中（快放 {x} 倍）：',
    s3end: '小车停在 x = {x} m（高 {h} m）。全程走了 {s} m，变成热的机械能 {Q} kJ = 出发时 {E0} kJ − 停下时的势能 {Ep} kJ。',
    s3noEnd: '没有阻力：机械能一直不变，小车会一直往返（这里只模拟前 {T} s）。',
    s3hint: '观察顺序：先用 k = 0.05 按「开车」：小车每次爬坡都比上一次低，影子留在越来越低的地方；下面的账本里粉色的热一层层变厚，橙色和青色此消彼长，但三层叠起来的总高度始终等于白线。把 k 调大到 0.1，小车很快停下、走的路短；调小到 0.02，要跑很久才停。无论 k 多大，停下时的「热」都等于出发时的机械能减去停下处的势能。',

    s4k: '第 4 步 · 速度的平方',
    s4t: '车速翻一倍，撞上去要猛几倍？',
    s4e: '这一步要回答：动能里的速度是平方，这在生活里意味着什么？把动能换算成「从多高掉下来」最直观：从高 h 处自由落下，落地时动能 mgh 等于 ½mv²，所以和速度 v 撞击相当于从 h = v²/(2g) 高处掉下，与质量无关。速度用 km/h 表示时先除以 3.6 换成 m/s。下面按每层楼 3 m 换算成楼层。',
    vLabel: '车速（km/h）',
    c4scene: '等效的坠落高度（每层楼 3 m）', c4plot: '等效高度（m）随车速变化',
    s4lgH: '等效高度', s4lgTried: '试过的车速', s4lgCurve: 'h = v²/(2g)',
    s4readout: '{kmh} km/h = {ms} m/s：一辆 1500 kg 的车动能 {Ek} kJ，相当于从 {h} m（约 {fl} 层楼）高处落下。{cmp}',
    s4cmp: '和一半车速（{half} km/h，{hh} m）比：速度 ×2，等效高度 ×{ratio}。',
    s4hint: '观察顺序：先放在 30 km/h（约一层楼高），再拖到 60 km/h：等效高度不是翻一倍，而是变成约 14 m，接近 5 层楼；拖到 120 km/h，约 57 m，接近 19 层楼。下面的图把试过的车速都留下来，连成一条向上弯的曲线——这就是平方的样子。',

    s5k: '第 5 步 · 收束',
    s5t: '把机械能守恒收成三句话',
    s5fin: '<strong>一、高度和速度在记同一本账。</strong>只有重力做功时，势能 mgh 减少多少，动能 ½mv² 就增加多少，两者之和不变；速度只看比出发点低了多少，与路线、质量无关。<br><strong>二、比出发点高的地方去不了。</strong>过山车翻不过比松手处更高的坡，单摆换条路也只能升回原来的高度。<br><strong>三、有阻力时，账本多一栏「热」。</strong>阻力 × 路程那么多机械能变成内能，势能 + 动能 + 热 仍然等于开始时的机械能。',
    formula: 'Eₚ = mgh　　Eₖ = ½mv²\nmgh₀ = mgh + ½mv² (+ 热)　　v = √(2gΔh)',
    boundary: '适用范围：小球、小车都当作一个点；不计车轮转动的能量；第 0–2、4 步不计任何阻力；第 3 步把摩擦和空气阻力合成一个大小不变的阻力，真实的空气阻力随速度增大；轨道图在竖直方向放大了；数值来自逐步模拟（步长 2 ms，单摆 0.2 ms），账差由测试检查。',
    linksTitle: '接着去看',
    lk1: '→ 杠杆与滑轮第 2 步：省了力就得多走距离，力乘距离这本账',
    lk2: '→ 牛顿运动定律第 2 步：摩擦力「吃掉」一部分推力',
    lk3: '→ 动量与碰撞第 2 步：碰撞时动量守恒，动能却可能变成热',
    lk4: '→ 平抛与圆周第 0 步：平抛和直接下落的球同时落地',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《机械能守恒 · 过山车的能量账本》的平行版本。'
  },
  en: {
    pageTitle: 'Conservation of Mechanical Energy · Height and Speed Share One Ledger',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Conservation of Mechanical Energy · The Roller Coaster’s Energy Ledger →',
    navLabel: 'Mechanical energy steps',
    tagline: 'A falling ball keeps speeding up; a roller coaster dives and climbs again. Height and speed keep a shared ledger: every bit of height lost is paid back as speed. In five steps you will watch that ledger for a ball in free fall, apply it to a coaster and a pendulum, add friction to see where the missing part goes, and work out why doubling a car’s speed makes a crash four times as violent.',
    nav0: '0 Falling', nav1: '1 Coaster', nav2: '2 Pendulum', nav3: '3 Friction', nav4: '4 Speed squared', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Falling',
    s0t: 'As a ball falls, what does the lost height buy?',
    s0e: 'This step asks: when a ball drops from rest, its height shrinks and its speed grows; is there a fixed exchange rate between the two? Physics keeps this account in <strong>energy</strong>, measured in joules (J). A raised object has <strong>gravitational potential energy</strong> E<sub>p</sub> = mgh, where m is the mass (kg), h the height above the ground (m), and g = 9.8 N/kg the pull of the Earth on each kilogram. A moving object has <strong>kinetic energy</strong> E<sub>k</sub> = ½mv², where v is the speed (m/s). Their sum is the <strong>mechanical energy</strong>. The ball below feels only gravity (no air resistance). Press “Let go” to watch it fall, or drag the time slider to stop at any moment.',
    h0Label: 'Starting height h₀ (m)', mLabel: 'Mass of the ball m (kg)', tLabel: 'Time t (s)',
    drop: 'Let go', reset: 'Back to the start',
    c0scene: 'Falling ball (a ghost every 0.1 s) and its three energy bars now (J)',
    c0plot: 'Energy (J) against the distance fallen so far',
    barEp: 'potential', barEk: 'kinetic', barSum: 'total',
    s0lgEp: 'potential energy Eₚ = mgh', s0lgEk: 'kinetic energy Eₖ = ½mv²', s0lgSum: 'their sum', s0lgGhost: 'position every 0.1 s',
    s0readout: '{prog}t = {t} s: height {h} m, speed {v} m/s. Potential {Ep} J + kinetic {Ek} J = {sum} J (it was {E0} J at release). Landing speed √(2gh₀) = {vi} m/s, whatever the mass.',
    s0prog: 'Falling (3× slow motion): ',
    s0hint: 'What to try: press “Let go” and watch the ghosts spread out as the ball speeds up. The orange potential bar shrinks, the cyan kinetic bar grows, and the white total bar never changes length. The graph below draws the same story as two lines: each joule of potential lost is one joule of kinetic gained. Then change the mass: both energies scale up, but the landing speed stays the same, because m appears in both mgh and ½mv² and cancels, leaving v = √(2gh₀).',

    s1k: 'Step 1 · Coaster',
    s1t: 'How fast is the coaster at each point, and can it clear every hill?',
    s1e: 'This step asks: a car is released from rest on a slope and rolls along a winding track; what sets its speed at any point? The track’s push on the car is always perpendicular to the track, so it neither speeds the car up nor slows it down and does not change its mechanical energy. Ignore friction and air resistance too, and only gravity is at work, so the mechanical energy stays fixed: <strong>conservation of mechanical energy</strong>. At any point, then, kinetic energy = mg × (release height − height here), so the speed depends only on how far below the release point you are, not on the twists of the track. Anywhere higher than the release point would need negative kinetic energy, which is impossible, so the car never gets there: it stops short and rolls back. The car has a mass of 500 kg (energies in kJ; 1 kJ = 1000 J).',
    HLabel: 'Release height H (m)', probeLabel: 'Probe position x (m)',
    play: 'Run', pause: 'Pause', restart: 'Back to the start',
    c1scene: 'Track (vertical scale enlarged): pink is higher than the release point', c1plot: 'Energy at each point of the track (kJ) against position x (m)',
    s1lgEp: 'potential', s1lgEk: 'kinetic', s1lgTotal: 'mechanical energy (potential at release)', s1lgNo: 'higher than the release point: unreachable',
    s1readout: '{prog}Probe at x = {x} m: track height {h} m, {probe} The car now: t = {t} s, at x = {cx} m, speed {cv} m/s. {reach}',
    s1probeOk: '{d} m below the release point, so the speed is √(2g×{d}) = {v} m/s; potential {Ep} kJ + kinetic {Ek} kJ = {E} kJ.',
    s1probeNo: '{d} m above the release point, so the car can never get here.',
    s1turn: 'The car gets no further than x = {x} m and turns back (the track there is as high as the release point).',
    s1pass: 'The car clears the 10 m second hill and gets as far as x = {x} m.',
    s1prog: 'Running (2× speed): ',
    s1hint: 'What to try: set the release height to 12 m and press “Run”. The car is fast in the dips and slow over the crests; near x ≈ 93 m it climbs back to 12 m and turns round, shuttling back and forth. Drag the probe to x = 30 m (the second crest, 10 m high): speed = √(2g×2) ≈ 6.3 m/s. Now lower the release height to 9.5 m: the top of the second hill turns pink and the car rolls back before reaching it. In the graph below, the orange and cyan layers always stack to the same total height.',

    s2k: 'Step 2 · Pendulum',
    s2t: 'If the ball comes back by a different path, does it still reach the same height?',
    s2e: 'This step asks: does “only the height matters, not the route” hold for other motions too? Hang a ball on a 3 m string, pull it aside to the left and let go. Put a peg directly below the pivot: once the ball passes the lowest point, the peg catches the string, and on the right the ball swings round a smaller circle centred on the peg. With the route changed, how high does it rise on the right? The string’s pull is always perpendicular to the ball’s motion and does not change the mechanical energy, so, ignoring air resistance, energy conservation still decides: the highest point on the right is exactly as high as the release point. Galileo did this experiment. The peg goes no lower than 1.9 m below the pivot, so the string stays taut at the top of the swing on the right.',
    thLabel: 'Release angle θ (degrees)', pegLabel: 'Peg depth below the pivot p (m, 0 = no peg)',
    swing: 'Let go for one round trip',
    c2scene: 'Pendulum (dashed line = release height; recent paths are kept)',
    s2lgPath: 'this path', s2lgOld: 'earlier paths', s2lgLine: 'release height', s2lgPeg: 'peg',
    s2readout: '{prog}Release height {h0} m above the lowest point. On the right the ball swings round the peg on a {r} m radius; the simulation’s highest point is {hm} m, {diff} mm from the release height. It turns through at most {phi}° round the peg, against the {th}° release angle.',
    s2prog: 'Swinging: ',
    s2hint: 'What to try: with no peg (p = 0) press “Let go for one round trip”: on the right the ball rises to the dashed line and swings back. Then put the peg at 1.0 m, 1.5 m and 1.9 m and swing each time: the right-hand arc gets smaller and tighter and the angle it sweeps grows, yet every path tops out exactly on the same dashed line. Earlier paths stay on the picture for comparison.',

    s3k: 'Step 3 · Friction',
    s3t: 'With friction, where does the missing mechanical energy go?',
    s3e: 'This step asks: a real coaster does not shuttle back and forth for ever; each swing is lower until it stops. Has the mechanical energy simply vanished? Friction between wheels and track and the push of the air both act against the motion. This page lumps them into one <strong>resistive force</strong> of fixed size, f = k × the car’s weight (k is the resistance coefficient; 0.05 means 5% of the weight), which is a simplification. For every stretch of track the car covers, the resistance turns f × distance of mechanical energy into <strong>internal energy</strong> of the wheels, track and air (they warm up very slightly), called “heat” here. For force × distance as work, see the lever page (<a class="xlink" href="../../../physics/mechanics/lever-pulley/#step2">→ Levers and pulleys, step 2: the force × distance ledger</a>). Put the heat in the ledger too: potential + kinetic + heat = the mechanical energy at the start.',
    kLabel: 'Resistance coefficient k (resistance = k × weight)',
    toEnd: 'Skip to the end',
    c3scene: 'Track (vertical scale enlarged): a ghost every 0.5 s', c3plot: 'Energy ledger (kJ) over time',
    s3lgEp: 'potential', s3lgEk: 'kinetic', s3lgQ: 'heat (work done by resistance)', s3lgE0: 'mechanical energy at the start',
    s3readout: '{prog}t = {t} s: potential {Ep} kJ + kinetic {Ek} kJ + heat {Q} kJ = {sum} kJ (at the start {E0} kJ; ledger error {err}%). Distance travelled {s} m; heat = f × distance = {f} N × {s} m. {end}',
    s3prog: 'Running ({x}× speed): ',
    s3end: 'The car stops at x = {x} m ({h} m high). It travelled {s} m in all, and the mechanical energy turned to heat, {Q} kJ, equals the {E0} kJ at the start minus the {Ep} kJ of potential where it stops.',
    s3noEnd: 'No resistance: the mechanical energy never changes and the car would shuttle for ever (only the first {T} s are simulated).',
    s3hint: 'What to try: with k = 0.05 press “Run”. Each climb ends lower than the last, and the ghosts gather lower and lower; in the ledger below the pink heat layer thickens while orange and cyan trade places, yet the three layers always stack to the white line. Raise k to 0.1 and the car stops soon after a short distance; lower it to 0.02 and it runs for a long time. Whatever k is, the heat when it stops equals the starting mechanical energy minus the potential energy where it comes to rest.',

    s4k: 'Step 4 · Speed squared',
    s4t: 'Double a car’s speed: how much harder is the crash?',
    s4e: 'This step asks: kinetic energy contains the speed squared, so what does that mean in everyday life? The clearest way to picture kinetic energy is as a fall. Dropping from a height h, an object lands with kinetic energy mgh = ½mv², so hitting something at speed v is like falling from h = v²/(2g), whatever the mass. A speed in km/h is first divided by 3.6 to get m/s. Below, the height is also counted in storeys of 3 m.',
    vLabel: 'Car speed (km/h)',
    c4scene: 'Equivalent fall height (3 m per storey)', c4plot: 'Equivalent height (m) against speed',
    s4lgH: 'equivalent height', s4lgTried: 'speeds tried', s4lgCurve: 'h = v²/(2g)',
    s4readout: '{kmh} km/h = {ms} m/s: a 1500 kg car carries {Ek} kJ of kinetic energy, like falling from {h} m (about {fl} storeys). {cmp}',
    s4cmp: 'Compared with half the speed ({half} km/h, {hh} m): speed ×2, equivalent height ×{ratio}.',
    s4hint: 'What to try: start at 30 km/h (about one storey), then drag to 60 km/h: the height does not double, it becomes about 14 m, nearly 5 storeys. At 120 km/h it is about 57 m, nearly 19 storeys. The graph below keeps every speed you try, and the dots trace a curve that bends upwards: that is what “squared” looks like.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Conservation of mechanical energy in three sentences',
    s5fin: '<strong>One: height and speed share one ledger.</strong> When only gravity does work, whatever potential energy mgh is lost reappears as kinetic energy ½mv², and their sum stays fixed; the speed depends only on how far below the start you are, not on the route or the mass.<br><strong>Two: nothing gets higher than where it started.</strong> A coaster cannot clear a hill taller than its release point, and a pendulum sent along a different path still only rises to its old height.<br><strong>Three: with resistance, the ledger gains a “heat” column.</strong> Resistance × distance worth of mechanical energy becomes internal energy, and potential + kinetic + heat still equals the starting mechanical energy.',
    formula: 'Eₚ = mgh    Eₖ = ½mv²\nmgh₀ = mgh + ½mv² (+ heat)    v = √(2gΔh)',
    boundary: 'Scope: balls and cars are treated as points; the energy of spinning wheels is ignored; steps 0–2 and 4 have no resistance at all; step 3 lumps friction and air resistance into one force of fixed size, whereas real air resistance grows with speed; the track drawings are stretched vertically; numbers come from step-by-step simulation (2 ms steps, 0.2 ms for the pendulum) and the ledger error is checked by the tests.',
    linksTitle: 'Where to go next',
    lk1: '→ Levers and pulleys, step 2: save force and pay in distance, the force × distance ledger',
    lk2: '→ Newton’s laws, step 2: friction “eats” part of the push',
    lk3: '→ Momentum and collisions, step 2: momentum is conserved in a crash, but kinetic energy can turn into heat',
    lk4: '→ Projectiles and circles, step 0: a thrown ball and a dropped ball land together',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Conservation of Mechanical Energy · The Roller Coaster’s Energy Ledger”.'
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
  if (typeof window.refreshMechEnergy === 'function') window.refreshMechEnergy();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ME_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
