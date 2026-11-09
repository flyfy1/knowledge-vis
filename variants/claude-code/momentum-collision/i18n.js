'use strict';
// Momentum & collisions lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '动量与碰撞 · 谁更难停下',
    back: '← 知识索引',
    compare: '对照另一版本：动量与碰撞 · 速度不是全部 →',
    navLabel: '动量与碰撞步骤导航',
    tagline: '一辆装满货的手推车和一辆空车以同样的速度滑过来，哪一辆更难拦住？答案藏在「质量 × 速度」这个量里。七步里你会用它算出刹车要多久，看清软垫为什么能保护鸡蛋，再追踪两车相撞时这笔「动量账」怎样一分不差地转手。',
    nav0: '0 谁更难停下', nav1: '1 冲量', nav2: '2 软着陆', nav3: '3 碰撞', nav4: '4 动能去哪了', nav5: '5 互推', nav6: '6 收束',

    s0k: '第 0 步 · 只看速度够不够',
    s0t: '同样的刹车力，哪辆车要刹更久？',
    s0e: '这一步要回答：两辆小车受到同样大小的刹车力，哪一辆停下来要更久？只看谁更快，够不够？<strong>质量</strong> m（单位 kg）是物体含有多少物质，越大越难改变它的运动；<strong>速度</strong> v（单位 m/s）是每秒走多少米。把两者相乘得到的量叫<strong>动量</strong>：p = m·v，单位 kg·m/s。刹车力 F 不变时，车每秒减掉的速度是 F ÷ m，所以停下用时 t = v ÷ (F ÷ m) = m·v ÷ F = p ÷ F。小车 B 是固定的对照：2 kg、1.5 m/s，动量 3 kg·m/s。图分三层：上面两条车道，小车每过 0.5 s 在车道下方留一个小点（点越密说明越慢）；中间是「停下用时 对 速度」；下面是「停下用时 对 动量」。',
    massA: '小车 A 的质量', speedA: '小车 A 的速度（向右为正）',
    brake: '两车同时刹车', clearHist: '清空记录',
    s0lgA: '小车 A（由你设定）', s0lgB: '小车 B（固定：2 kg、1.5 m/s）', s0lgHist: '试过的组合', s0lgLine: 't = p ÷ F',
    c0strip: '两车受同样 {F} N 的刹车力 · 位置（m）· t = {clock} s',
    c0mid: '停下用时 t（s）↑ 对 速度 v（m/s）→',
    c0bot: '停下用时 t（s）↑ 对 动量 p = m·v（kg·m/s）→',
    s0readout: 'A：{m} kg × {v} m/s → 动量 p = {p} kg·m/s；停下用时 t = p ÷ F = {p} ÷ {F} = {ta} s，滑行 {da} m。B：p = {pb} kg·m/s，用时 {tb} s，滑行 {db} m。{cmp}（已试 {n} 组）',
    s0Afirst: 'A 比 B 早 {gap} s 停下。', s0Bfirst: 'B 比 A 早 {gap} s 停下。',
    s0same: '两车动量相同：同时停下，滑行距离也相同。',
    s0sameDiffDist: '两车动量相同：同时停下；但滑行距离不同（A {da} m，B {db} m）。',
    s0hint: '观察顺序：先按「两车同时刹车」看谁先停。再拖质量和速度多试几组，每试一组，中、下两图各留一个白点。看中图：速度相同的点高低不一，排不成一条线；再看下图：所有点都落在同一条虚线 t = p ÷ F 上。试着找一组和 B 同时停下的组合（比如 1 kg、3 m/s）：动量相同，停下用时就相同，但滑行距离可以不同——距离还和速度本身有关，第 4 步的「动能」就和这有关。',

    s1k: '第 1 步 · 力 × 时间',
    s1t: '要让动量增加一定的量，力和时间各起什么作用？',
    s1e: '这一步要回答：一辆小车（质量 m，起初以 0.5 m/s 前进）从 t = 0.5 s 起被向前推一段时间 Δt，推力大小 F 不变，它的动量增加多少、由什么决定？由牛顿第二定律 F = m·a，加速度 a 是每秒增加的速度，所以 Δt 秒里速度增加 Δv = F·Δt ÷ m，也就是 <strong>F·Δt = m·Δv = Δp</strong>（<a class="xlink" href="../../../physics/mechanics/newton-laws/#step0">→ 牛顿运动定律第 0 步：亲手调出 F = ma</a>）。力乘以作用时间叫<strong>冲量</strong>，记作 J，单位 N·s（1 N·s = 1 kg·m/s）。上图是推力随时间的变化，阴影长方形的面积 = F × Δt = 冲量；下图是小车动量随时间的变化，被推的那一段直线上升，右侧橙色竖条标出增加量 Δp。',
    force: '推力 F', duration: '推的时间 Δt', massCart: '小车质量 m',
    s1lgF: '推力 F', s1lgJ: '冲量 J = F·Δt（阴影面积）；右侧橙色竖条 = 动量增加量 Δp', s1lgP: '当前小车的动量', s1lgOld: '最近试过的几组',
    c1a: '推力 F（N）↑ 对 时间 t（s）→ · 阴影面积 = 冲量 J',
    c1b: '小车动量 p（kg·m/s）↑ 对 时间 t（s）→',
    s1readout: '冲量 J = F × Δt = {F} N × {dt} s = {J} N·s。动量从 p₀ = {m} × {v0} = {p0} kg·m/s 变成 {p1} kg·m/s，增加 Δp = {J} kg·m/s，正好等于 J。速度从 {v0} m/s 变成 {v1} m/s（Δv = J ÷ m = {dv} m/s）。',
    s1hint: '观察顺序：先保持质量不变，分别设「推力 4 N、时间 0.5 s」和「推力 1 N、时间 2 s」：阴影一个高瘦、一个矮胖，面积却都是 2 N·s，下图两条线最后停在同一高度（灰线是最近试过的几组）。再只拖质量：橙色竖条长度不变（Δp 只看 J），变的是速度增量 Δv = J ÷ m。',

    s2k: '第 2 步 · 软着陆',
    s2t: '同样要停下来，为什么落在软垫上不容易摔坏？',
    s2e: '这一步要回答：一枚 0.06 kg 的蛋以速度 v 落地，要让它停下，地面得给它多大的力？蛋要失去的动量 Δp = m·v 只由落地速度决定，和落在什么上面无关。由上一步 Δp = F·Δt，得 <strong>平均力 F = Δp ÷ Δt</strong>。平均力的意思是：把停下过程中时大时小的力，换成一个大小不变、冲量相同的力。硬地让蛋在几毫秒内停下，软垫把停下用时 Δt 拉长。假设：这枚蛋受到超过 25 N 的平均力就会破——这是为演示设的数字，真实的蛋差别很大；蛋自身的重力约 0.59 N，远小于冲击力，这里不计。图中横轴是停下用时 Δt，纵轴是平均力 F；每个长方形宽 Δt、高 F，面积都等于 Δp；灰色虚线 F = Δp ÷ Δt 是所有长方形右上角的位置。',
    eggSpeed: '落地速度 v', stopTime: '停下用时 Δt',
    s2lgSafe: '平均力不超过承受力：蛋完好', s2lgBreak: '超过承受力：蛋碎', s2lgCurve: 'F = Δp ÷ Δt（各长方形的右上角）', s2lgLimit: '假设的承受力 25 N',
    c2: '平均力 F（N）↑ 对 停下用时 Δt（s）→ · 每块面积 = Δp',
    s2break: '落地速度 {v} m/s → 要抵消的动量 Δp = {m} × {v} = {dp} kg·m/s。用 {dt} s 停下 → 平均力 F = Δp ÷ Δt = {F} N，超过假设的承受力 {lim} N：蛋碎了。停下用时至少要 {tmin} s 才保得住。（已试 {n} 个用时）',
    s2safe: '落地速度 {v} m/s → 要抵消的动量 Δp = {m} × {v} = {dp} kg·m/s。用 {dt} s 停下 → 平均力 F = Δp ÷ Δt = {F} N，不超过 {lim} N：蛋完好。最短可接受用时是 {tmin} s。（已试 {n} 个用时）',
    s2hint: '观察顺序：保持落地速度不变，把「停下用时」从 0.005 s 慢慢拖大：长方形变矮变宽，面积不变；它的右上角沿灰色虚线滑下，越过橙色虚线（25 N）时由红变绿，旧长方形留作对比。再调大落地速度：要抵消的动量变多，整条虚线往上移，保住蛋所需的最短用时也变长（换速度会清空旧长方形）。',
    quizPrompt: '想一想：跳远落进沙坑比落在水泥地上安全，主要是因为？',
    quizA: '沙坑让人的动量变化变小了',
    quizB: '动量变化一样，但沙坑让停下用时变长，平均力就小了',
    quizC: '沙子把人的动量吸收掉了，动量消失了',
    check: '检查答案', pick: '先选一个选项。',
    correct: '对。落地时的速度定了，要抵消的 Δp 就定了；停下用时拉长到 10 倍，平均力就降到十分之一。',
    wrong: '再看图：每块长方形的面积（Δp）都一样，变的只是宽（Δt）和高（F）。动量也不会凭空消失，它传给了沙子和地面。',

    s3k: '第 3 步 · 一失一得',
    s3t: '两车相撞，A 少掉的动量去了哪里？',
    s3e: '这一步要回答：小车 A 撞上小车 B，碰撞前后两车的动量各怎么变？总和怎么变？碰撞时 A 推 B，B 同时也推 A，这两个力大小相等、方向相反（<a class="xlink" href="../../../physics/mechanics/newton-laws/#step4">→ 牛顿运动定律第 4 步：作用力与反作用力</a>），而且作用的时间完全相同。由第 1 步，冲量 = 力 × 时间，所以两车得到的冲量大小相等、方向相反：A 少掉多少动量，B 就多出多少。只要两车之外没有别的力（这里不计摩擦），两车动量之和就不变，这叫<strong>动量守恒</strong>。动量有方向：向右为正、向左为负。碰撞有两种极端：<strong>粘在一起</strong>（碰后一起走）和<strong>弹开</strong>（像弹力球，碰后不损失运动的能量，第 4 步细讲）。上图是轨道，每过 0.5 s 记一次位置（A 的点在上排、B 的点在下排）；下图是两车动量与总和随时间的变化，接触时间按 0.08 s 示意。',
    massB: '小车 B 的质量', speedB: '小车 B 的速度（负 = 向左开来）',
    modeStick: '粘在一起', modeBounce: '弹开（不损失动能）', play3: '播放碰撞',
    modeStickShort: '粘在一起', modeBounceShort: '弹开',
    s3lgA: 'A 的动量', s3lgB: 'B 的动量', s3lgT: '两车动量之和（虚线）',
    c3strip: '轨道位置（m）· t = {clock} s',
    c3p: '动量 p（kg·m/s）↑ 对 时间 t（s）→',
    s3readout: '碰前：A {pa}、B {pb}，总和 {tot} kg·m/s。碰后（{mode}）：A {pa2}、B {pb2}，总和 {tot2} kg·m/s。A 少了 {lose}，B 多了 {gain}：同一对力、同样长的时间，一失一得正好抵消。碰后速度：A {va2} m/s，B {vb2} m/s。',
    s3none: 'B 的速度不小于 A，A 追不上 B，不会相撞：A {pa}、B {pb}，总和 {tot} kg·m/s，始终不变。',
    s3hint: '观察顺序：先按「播放碰撞」，盯住下图 t = 1 s 那一下：青线降多少，橙线就升多少，白色虚线（总和）一直是平的。再切换「粘在一起 / 弹开」重放：碰后两车的速度变了，白线仍然不动。最后把 B 的速度调成负数（迎面开来）：总动量变小，甚至可能为 0，但碰前碰后照样相等。',

    s4k: '第 4 步 · 动能去哪了',
    s4t: '动量每次都守恒，那「运动的能量」呢？',
    s4e: '这一步要回答：碰撞前后，除了动量，运动的能量有没有保住？运动的能量叫<strong>动能</strong>：KE = ½·m·v²，单位焦耳 J。它和速度的平方成正比，没有方向，永远不是负数，所以向左向右的动能不会互相抵消。用<strong>恢复系数</strong> e 描述碰撞有多「弹」：e = 碰后分开的速度 ÷ 碰前接近的速度；e = 0 是粘在一起，e = 1 是完全弹开。本步沿用第 3 步设的两车质量和碰前速度，只改 e。上图是碰后两车的速度随 e 的变化；下图绿线是碰后动能占碰前的比例，灰色虚线是总动量碰后 ÷ 碰前。损失的动能变成了热、声音和车身形变（<a class="xlink" href="../../../physics/mechanics/mechanical-energy/#step2">→ 机械能守恒第 2 步：摩擦怎样把机械能变成热</a>）。',
    eSlider: '恢复系数 e（0 = 粘住，1 = 完全弹开）',
    s4lgVA: 'A 碰后速度', s4lgVB: 'B 碰后速度', s4lgKE: '动能：碰后 ÷ 碰前', s4lgP: '总动量：碰后 ÷ 碰前', s4lgHist: '试过的 e',
    c4a: '碰后速度（m/s）↑ 对 恢复系数 e →',
    c4b: '碰后 ÷ 碰前 ↑ 对 恢复系数 e →',
    s4setup: '（第 3 步的设定：A {ma} kg、{va} m/s；B {mb} kg、{vb} m/s）　',
    s4readout: 'e = {e}：碰后 A {va2} m/s，B {vb2} m/s；分开速度 {sep} m/s = e × 接近速度 {u} m/s。总动量 {p} → {p2} kg·m/s，不变。动能 {k} → {k2} J，留下 {pct}%，损失 {lost} J。',
    s4none: '这组设定里 A 追不上 B，没有碰撞，e 不起作用。回第 3 步把 A 调得比 B 快。',
    s4hint: '观察顺序：把 e 从 0 拖到 1。上图：两个点从同一个速度（粘在一起）逐渐分开。下图：绿点从最低处升到 1，灰色虚线一动不动——不管怎么碰，动量都守恒；动能只有 e = 1 时才一点不损失。白点是试过的 e。回第 3 步改质量或速度，这里的曲线会跟着变，旧记录清空。',

    s5k: '第 5 步 · 从静止互推',
    s5t: '两人原本静止，互相一推，谁滑得更快？',
    s5e: '这一步要回答：冰面上两人静止站着，互推一下后各自以多快的速度滑开？推的时候，两人之间的力大小相等、方向相反、作用时间相同，所以两人获得的冲量大小相等（都是 J）、方向相反。冰面摩擦很小，这里不计。推之前总动量是 0，推之后还是 0：m₁·v₁ + m₂·v₂ = 0，每人的速度大小都是 J ÷ m——质量越大，速度越小。开枪时枪托往后顶（反冲）、火箭向后喷气而向前飞，都是同一个道理。图是冰面俯视：横轴是位置（m），0 是起点；圆越大表示质量越大；起点上方的两支箭头是两人的动量，长度表示大小；每过 0.5 s 记一次位置，点距越大说明滑得越快。',
    mass1: '1 号的质量 m₁', mass2: '2 号的质量 m₂', pushJ: '互推的冲量 J', push5: '推一下',
    s5lg1: '1 号（向左滑）', s5lg2: '2 号（向右滑）', s5lgDots: '每 0.5 s 的位置', s5lgArrow: '箭头 = 动量（长度表示大小）',
    c5: '冰面俯视 · 位置（m）· t = {clock} s',
    s5readout: '推前总动量 0。推后：1 号 p = {p1} kg·m/s（向左 {v1} m/s），2 号 p = {p2} kg·m/s（向右 {v2} m/s），总和 {tot}。速度之比 {v2} ÷ {v1} = {ratio}，正好等于质量之比 {m1} ÷ {m2} = {mr}：轻的快，快的倍数就是重的倍数。{T} 秒后两人分别滑出 {d1} m 和 {d2} m。',
    s5hint: '观察顺序：先按「推一下」看两人滑开，两支箭头始终一样长、方向相反。保持冲量不变，只拖 1 号的质量：1 号越重，它的点距越小，2 号完全不受影响。把两人质量调成一样：左右点距相同、完全对称。最后加大冲量：两人都更快，但速度之比只由质量之比决定。',

    s6k: '第 6 步 · 收束',
    s6t: '一本动量账',
    s6fin: '动量 p = m·v 是把质量和速度一起算的「运动量」，带方向。<strong>只有力作用一段时间才能改变它</strong>：Δp = F·Δt（冲量）。所以同样的 Δp，时间拉得越长，力就越小——软垫、安全气囊、沙坑都靠这一点。两个物体相互作用时，彼此得到的冲量大小相等、方向相反，<strong>总动量不变</strong>，不论粘住还是弹开；而动能只有完全弹开时才不损失。',
    formula: 'p = m·v\nJ = F·Δt = Δp\nmA·vA + mB·vB = mA·vA′ + mB·vB′',
    boundary: '适用范围：一维直线运动；不计摩擦和空气阻力（第 0 步的刹车力除外）；碰撞时外力可以忽略。第 2 步的 25 N 承受力和第 3 步的 0.08 s 接触时间是演示用的设定，不是测量值。',
    linksTitle: '继续探索',
    lk1: '牛顿运动定律 · 第 0 步：F = ma，冲量公式就是它乘上时间 →',
    lk2: '牛顿运动定律 · 第 4 步：作用力与反作用力为什么总相等 →',
    lk3: '机械能守恒 · 第 2 步：摩擦怎样把机械能变成热 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《动量与碰撞 · 速度不是全部》的平行版本。'
  },
  en: {
    pageTitle: 'Momentum & Collisions · Which Cart Is Harder to Stop?',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Momentum & Collisions · Speed Is Not the Whole Story →',
    navLabel: 'Momentum and collisions steps',
    tagline: 'A loaded trolley and an empty one roll towards you at the same speed. Which is harder to stop? The answer lives in one quantity: mass × speed. In seven steps you will use it to work out braking times, see why a soft mat saves an egg, and follow how a collision passes this "momentum account" from one cart to the other without losing a cent.',
    nav0: '0 Harder to stop', nav1: '1 Impulse', nav2: '2 Soft landing', nav3: '3 Collision', nav4: '4 Where KE goes', nav5: '5 Push apart', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Is speed enough?',
    s0t: 'Same braking force: which cart takes longer to stop?',
    s0e: 'The question here: two carts feel the same braking force. Which one takes longer to stop, and is "whichever is faster" the whole answer? <strong>Mass</strong> m (in kg) measures how much stuff an object has; the more it has, the harder its motion is to change. <strong>Speed</strong> v (in m/s) is metres covered per second. Multiply them and you get <strong>momentum</strong>: p = m·v, in kg·m/s. With a steady braking force F, the cart loses F ÷ m of speed every second, so it stops after t = v ÷ (F ÷ m) = m·v ÷ F = p ÷ F. Cart B is a fixed reference: 2 kg at 1.5 m/s, momentum 3 kg·m/s. The figure has three layers: on top, two lanes where each cart drops a dot under its lane every 0.5 s (tighter dots mean slower); in the middle, stopping time against speed; at the bottom, stopping time against momentum.',
    massA: 'Mass of cart A', speedA: 'Speed of cart A (right is positive)',
    brake: 'Brake both carts', clearHist: 'Clear history',
    s0lgA: 'Cart A (you set it)', s0lgB: 'Cart B (fixed: 2 kg, 1.5 m/s)', s0lgHist: 'Combinations tried', s0lgLine: 't = p ÷ F',
    c0strip: 'Both carts braked by the same {F} N · position (m) · t = {clock} s',
    c0mid: 'Stopping time t (s) ↑ vs speed v (m/s) →',
    c0bot: 'Stopping time t (s) ↑ vs momentum p = m·v (kg·m/s) →',
    s0readout: 'A: {m} kg × {v} m/s → momentum p = {p} kg·m/s; stopping time t = p ÷ F = {p} ÷ {F} = {ta} s, sliding {da} m. B: p = {pb} kg·m/s, stops in {tb} s after {db} m. {cmp} ({n} tried)',
    s0Afirst: 'A stops {gap} s before B.', s0Bfirst: 'B stops {gap} s before A.',
    s0same: 'Equal momentum: they stop together and slide the same distance.',
    s0sameDiffDist: 'Equal momentum: they stop at the same moment, yet slide different distances (A {da} m, B {db} m).',
    s0hint: 'What to try: press "Brake both carts" and see who stops first. Then drag mass and speed through several combinations; each one leaves a white dot in the middle and bottom plots. In the middle plot, dots at the same speed sit at different heights and form no line. In the bottom plot, every dot lands on the one dashed line t = p ÷ F. Try to find a combination that stops with B (1 kg at 3 m/s, say): same momentum, same stopping time, though the sliding distance can differ, because distance also depends on speed itself. That links to kinetic energy in step 4.',

    s1k: 'Step 1 · Force × time',
    s1t: 'To add a set amount of momentum, what do force and time each do?',
    s1e: 'The question here: a cart of mass m, already rolling at 0.5 m/s, is pushed forward with a steady force F for a time Δt starting at t = 0.5 s. How much momentum does it gain, and what sets that amount? Newton\'s second law says F = m·a, and acceleration a is the speed gained per second, so over Δt the speed rises by Δv = F·Δt ÷ m. In other words <strong>F·Δt = m·Δv = Δp</strong> (<a class="xlink" href="../../../physics/mechanics/newton-laws/#step0">→ Newton\'s laws, step 0: tune F = ma by hand</a>). Force times the time it acts is called <strong>impulse</strong>, J, measured in N·s (1 N·s = 1 kg·m/s). The top plot shows the push over time; the shaded rectangle\'s area is F × Δt, the impulse. The bottom plot shows the cart\'s momentum over time: it climbs in a straight line during the push, and the orange bar on the right marks the gain Δp.',
    force: 'Push force F', duration: 'Push duration Δt', massCart: 'Cart mass m',
    s1lgF: 'Push force F', s1lgJ: 'Impulse J = F·Δt (shaded area); orange bar on the right = momentum gained Δp', s1lgP: 'Current cart momentum', s1lgOld: 'Recent settings',
    c1a: 'Push F (N) ↑ vs time t (s) → · shaded area = impulse J',
    c1b: 'Cart momentum p (kg·m/s) ↑ vs time t (s) →',
    s1readout: 'Impulse J = F × Δt = {F} N × {dt} s = {J} N·s. Momentum goes from p₀ = {m} × {v0} = {p0} kg·m/s to {p1} kg·m/s, a gain of Δp = {J} kg·m/s, exactly J. Speed goes from {v0} m/s to {v1} m/s (Δv = J ÷ m = {dv} m/s).',
    s1hint: 'What to try: keep the mass fixed and set "4 N for 0.5 s", then "1 N for 2 s". One rectangle is tall and thin, the other short and wide, but both have area 2 N·s, and both momentum lines end at the same height (grey lines are your recent settings). Then drag only the mass: the orange bar keeps its length (Δp depends only on J); what changes is the speed gain Δv = J ÷ m.',

    s2k: 'Step 2 · Soft landing',
    s2t: 'Stopping either way: why does a soft mat keep things from breaking?',
    s2e: 'The question here: a 0.06 kg egg hits the ground at speed v. How hard must the ground push to stop it? The momentum the egg has to lose, Δp = m·v, is fixed by the landing speed; it does not care what the egg lands on. From the last step, Δp = F·Δt, so the <strong>average force is F = Δp ÷ Δt</strong>. "Average force" means: replace the force that rises and falls during the stop by a steady one with the same impulse. Hard ground stops the egg within milliseconds; a soft mat stretches the stopping time Δt. Assumption: this egg breaks if the average force exceeds 25 N. That number is chosen for the demo; real eggs vary a lot. The egg\'s own weight, about 0.59 N, is tiny next to the impact force and is left out. Horizontal axis: stopping time Δt; vertical axis: average force F. Each rectangle is Δt wide and F tall, so every one has area Δp; the grey dashed curve F = Δp ÷ Δt traces their top-right corners.',
    eggSpeed: 'Landing speed v', stopTime: 'Stopping time Δt',
    s2lgSafe: 'Average force within the limit: egg survives', s2lgBreak: 'Over the limit: egg breaks', s2lgCurve: 'F = Δp ÷ Δt (top-right corners)', s2lgLimit: 'Assumed limit 25 N',
    c2: 'Average force F (N) ↑ vs stopping time Δt (s) → · every area = Δp',
    s2break: 'Landing at {v} m/s → momentum to cancel Δp = {m} × {v} = {dp} kg·m/s. Stopped in {dt} s → average force F = Δp ÷ Δt = {F} N, above the assumed {lim} N limit: the egg breaks. It needs at least {tmin} s to survive. (stopping times tried: {n})',
    s2safe: 'Landing at {v} m/s → momentum to cancel Δp = {m} × {v} = {dp} kg·m/s. Stopped in {dt} s → average force F = Δp ÷ Δt = {F} N, within the {lim} N limit: the egg survives. The shortest safe time is {tmin} s. (stopping times tried: {n})',
    s2hint: 'What to try: keep the landing speed fixed and slowly drag the stopping time up from 0.005 s. The rectangle gets lower and wider with the same area; its corner slides down the grey curve and turns from red to green as it crosses the orange 25 N line. Old rectangles stay for comparison. Then raise the landing speed: there is more momentum to cancel, the whole curve moves up, and the shortest safe time grows (changing speed clears the old rectangles).',
    quizPrompt: 'Think: landing in a long-jump sand pit is safer than landing on concrete mainly because…',
    quizA: 'the sand makes the jumper\'s change in momentum smaller',
    quizB: 'the change in momentum is the same, but the sand stretches the stopping time, so the average force is smaller',
    quizC: 'the sand soaks up the jumper\'s momentum and it disappears',
    check: 'Check answer', pick: 'Pick an option first.',
    correct: 'Right. The landing speed fixes Δp; stretch the stopping time tenfold and the average force drops to a tenth.',
    wrong: 'Look at the plot again: every rectangle has the same area (Δp); only the width (Δt) and height (F) trade off. Momentum doesn\'t vanish either; it is handed on to the sand and the ground.',

    s3k: 'Step 3 · One loses, one gains',
    s3t: 'When A hits B, where does A\'s lost momentum go?',
    s3e: 'The question here: cart A runs into cart B. How does each cart\'s momentum change, and what happens to the total? During the hit, A pushes B and B pushes A at the same time. The two forces are equal in size and opposite in direction (<a class="xlink" href="../../../physics/mechanics/newton-laws/#step4">→ Newton\'s laws, step 4: action and reaction</a>), and they act for exactly the same time. By step 1, impulse = force × time, so the two carts receive equal and opposite impulses: whatever A loses, B gains. As long as nothing outside the two carts pushes on them (friction is ignored here), their total momentum stays the same. That is <strong>conservation of momentum</strong>. Momentum has a direction: rightwards is positive, leftwards negative. Two extreme kinds of collision: <strong>sticking together</strong> (they move off as one) and <strong>bouncing apart</strong> (like a rubber ball, with no loss of energy of motion; more in step 4). Top: the track, with a position mark every 0.5 s (A\'s row above, B\'s below). Bottom: each cart\'s momentum and the total over time; the contact is drawn as lasting 0.08 s.',
    massB: 'Mass of cart B', speedB: 'Speed of cart B (negative = coming from the right)',
    modeStick: 'Stick together', modeBounce: 'Bounce apart (no kinetic energy lost)', play3: 'Play the collision',
    modeStickShort: 'stuck together', modeBounceShort: 'bounced apart',
    s3lgA: 'Momentum of A', s3lgB: 'Momentum of B', s3lgT: 'Total of both (dashed)',
    c3strip: 'Track position (m) · t = {clock} s',
    c3p: 'Momentum p (kg·m/s) ↑ vs time t (s) →',
    s3readout: 'Before: A {pa}, B {pb}, total {tot} kg·m/s. After ({mode}): A {pa2}, B {pb2}, total {tot2} kg·m/s. A lost {lose}, B gained {gain}: one pair of forces over one stretch of time, so the loss and the gain cancel exactly. Speeds after: A {va2} m/s, B {vb2} m/s.',
    s3none: 'B is at least as fast as A, so A never catches it and nothing collides: A {pa}, B {pb}, total {tot} kg·m/s throughout.',
    s3hint: 'What to try: press "Play the collision" and watch the bottom plot at t = 1 s. The cyan line drops by exactly as much as the orange line rises, and the white dashed total stays flat. Switch between "Stick together" and "Bounce apart" and replay: the speeds afterwards change, the white line does not. Finally give B a negative speed (driving towards A): the total gets smaller, maybe even zero, but it is still the same before and after.',

    s4k: 'Step 4 · Where kinetic energy goes',
    s4t: 'Momentum survives every collision. What about the energy of motion?',
    s4e: 'The question here: besides momentum, does a collision keep the energy of motion? That energy is called <strong>kinetic energy</strong>: KE = ½·m·v², measured in joules (J). It grows with the square of the speed, has no direction and is never negative, so leftward and rightward kinetic energies cannot cancel. The <strong>coefficient of restitution</strong> e says how bouncy the hit is: e = speed of separation afterwards ÷ speed of approach before. e = 0 means the carts stick; e = 1 means a perfect bounce. This step keeps the masses and starting speeds you set in step 3 and changes only e. Top plot: each cart\'s speed after the hit as e varies. Bottom plot: the green curve is the share of kinetic energy left afterwards; the grey dashed line is total momentum after ÷ before. The missing kinetic energy becomes heat, sound and dented metal (<a class="xlink" href="../../../physics/mechanics/mechanical-energy/#step2">→ Mechanical energy, step 2: how friction turns it into heat</a>).',
    eSlider: 'Restitution e (0 = stick, 1 = perfect bounce)',
    s4lgVA: 'A\'s speed after', s4lgVB: 'B\'s speed after', s4lgKE: 'Kinetic energy: after ÷ before', s4lgP: 'Total momentum: after ÷ before', s4lgHist: 'Values of e tried',
    c4a: 'Speed after (m/s) ↑ vs restitution e →',
    c4b: 'After ÷ before ↑ vs restitution e →',
    s4setup: '(Step 3 settings: A {ma} kg at {va} m/s; B {mb} kg at {vb} m/s) ',
    s4readout: 'e = {e}: after the hit A moves at {va2} m/s, B at {vb2} m/s; separation speed {sep} m/s = e × approach speed {u} m/s. Total momentum {p} → {p2} kg·m/s, unchanged. Kinetic energy {k} → {k2} J: {pct}% kept, {lost} J lost.',
    s4none: 'With these settings A never catches B, so there is no collision and e does nothing. Go back to step 3 and make A faster than B.',
    s4hint: 'What to try: drag e from 0 to 1. Top: the two dots start at one shared speed (stuck together) and spread apart. Bottom: the green dot climbs to 1 while the grey dashed line never moves. Momentum is conserved in every collision; kinetic energy survives intact only at e = 1. White dots mark values you tried. Change the masses or speeds in step 3 and these curves follow (the history clears).',

    s5k: 'Step 5 · Pushing off from rest',
    s5t: 'Two skaters at rest push each other. Who glides away faster?',
    s5e: 'The question here: two people stand still on ice and push each other once. How fast does each glide away? While they push, the forces between them are equal, opposite and last the same time, so each receives an impulse of the same size J in opposite directions. Ice friction is small and ignored. Total momentum is 0 before the push and still 0 after: m₁·v₁ + m₂·v₂ = 0, and each speed is J ÷ m. The heavier skater moves slower. The kick of a rifle against the shoulder (recoil) and a rocket pushing gas backwards to fly forwards work the same way. The figure is the ice seen from above: horizontal axis is position (m) with 0 at the start; bigger circles mean more mass; the two arrows above the start show each skater\'s momentum, longer meaning larger; a mark is left every 0.5 s, so wider spacing means faster gliding.',
    mass1: 'Mass of skater 1, m₁', mass2: 'Mass of skater 2, m₂', pushJ: 'Impulse of the push J', push5: 'Push off',
    s5lg1: 'Skater 1 (glides left)', s5lg2: 'Skater 2 (glides right)', s5lgDots: 'Position every 0.5 s', s5lgArrow: 'Arrow = momentum (length shows size)',
    c5: 'Ice from above · position (m) · t = {clock} s',
    s5readout: 'Total momentum before: 0. After: skater 1 has p = {p1} kg·m/s ({v1} m/s to the left), skater 2 has p = {p2} kg·m/s ({v2} m/s to the right), total {tot}. Speed ratio {v2} ÷ {v1} = {ratio}, exactly the mass ratio {m1} ÷ {m2} = {mr}: the lighter one is faster by the same factor the other is heavier. After {T} s they are {d1} m and {d2} m from the start.',
    s5hint: 'What to try: press "Push off" and watch them separate; the two arrows always match in length and point opposite ways. Keep the impulse fixed and drag only skater 1\'s mass: the heavier skater 1 gets, the tighter its marks, and skater 2 is not affected at all. Make the masses equal: the spacing matches and the picture is symmetric. Finally raise the impulse: both go faster, but their speed ratio is set by the mass ratio alone.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One account of momentum',
    s6fin: 'Momentum p = m·v counts mass and speed together and carries a direction. <strong>Only a force acting over time changes it</strong>: Δp = F·Δt (impulse). So for the same Δp, the longer the stop, the smaller the force; mats, airbags and sand pits all rely on this. When two objects push on each other, their impulses are equal and opposite, so <strong>total momentum is conserved</strong>, whether they stick or bounce. Kinetic energy, on the other hand, is kept in full only by a perfect bounce.',
    formula: 'p = m·v\nJ = F·Δt = Δp\nmA·vA + mB·vB = mA·vA′ + mB·vB′',
    boundary: 'Scope: motion along one straight line; no friction or air resistance (apart from step 0\'s braking force); outside forces negligible during a collision. The 25 N egg limit in step 2 and the 0.08 s contact time in step 3 are demo settings, not measurements.',
    linksTitle: 'Keep exploring',
    lk1: 'Newton\'s laws · step 0: F = ma, of which impulse is the time-multiplied version →',
    lk2: 'Newton\'s laws · step 4: why action and reaction are always equal →',
    lk3: 'Mechanical energy · step 2: how friction turns mechanical energy into heat →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of "Momentum & Collisions · Speed Is Not the Whole Story".'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang][key] || STRINGS.en[key] || key;
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
  if (typeof window.refreshMomentum === 'function') window.refreshMomentum();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MOM_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
