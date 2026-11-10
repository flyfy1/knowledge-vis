'use strict';
// Chemical equilibrium lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '化学平衡 · 人数不变，人还在跑',
    back: '← 知识索引',
    compare: '对照另一版本：化学平衡 · 人数不变，人还在跑 →',
    navLabel: '化学平衡步骤导航',
    tagline: '可逆反应进行到一定程度，各物质的量就不再变化——可反应真的停了吗？这一页用 200 个会随机变身的粒子模拟 A ⇌ B，所有个数、速率和比例都从模拟里数出来：先看平衡怎样形成、什么相等，再加料、改温度、加催化剂，看平衡点哪些会动、哪些不会。',
    nav0: '0 停了吗', nav1: '1 走向平衡', nav2: '2 加料', nav3: '3 温度', nav4: '4 催化剂', nav5: '5 收束',
    play: '播放', pause: '暂停',
    perTick: '次/步',

    s0k: '第 0 步 · 平了，停了吗？',
    s0t: '计数曲线已经走平，反应是不是停了？',
    s0e: '这一步要回答：一个<strong>可逆反应</strong>（正、逆两个方向都能进行的反应）各物质的量不再变化时，粒子还在反应吗？本页用最简单的可逆反应 A ⇌ B：A 变成 B 叫<strong>正反应</strong>，B 变回 A 叫<strong>逆反应</strong>。画面是一个模拟：青色粒子是 A，橙色是 B。规则只有一条：每过一个时间步（简称「步」），每个 A 以 2% 的概率变成 B，每个 B 以 3% 的概率变回 A，各粒子互不影响；刚变身的粒子会闪一下白圈。「个数」图的横轴是步数，纵轴是个数。开场已经在平衡附近：200 个粒子里 A 约 120、B 约 80。模型说明：粒子的移动只是示意，这里的转变概率与碰撞无关。',
    ff0: '快进 100 步', track: '跟踪一个粒子',
    c0box: '模拟 · 第 {t} 步 · 共 {N} 个粒子',
    c0plot: '个数（最近 300 步）',
    c0strip: '被跟踪粒子：每一竖条是一步，青 = A，橙 = B',
    lgA: 'A 的个数', lgB: 'B 的个数', lgFlash: '白圈 = 这一步刚变身', lgTrack: '被跟踪的粒子',
    s0readout: '第 {t} 步：A {a} 个，B {b} 个。至今 A→B 共 {f} 次，B→A 共 {r} 次；最近 30 步平均每步 A→B {wf} 次、B→A {wr} 次。{trk}',
    trk: '被跟踪的粒子已经变身 {k} 次，现在是 {s}。',
    s0hint: '观察顺序：按「播放」，先看「个数」图：两条线只在一个水平附近小幅抖动；再看读数里的两个累计次数——它们一直在涨，而且涨得差不多快。按「跟踪一个粒子」，看它在 A、B 之间来回变。个数不变，不是因为没有粒子在反应，而是两个方向的转变次数互相抵消。这种状态叫动态平衡。',

    s1k: '第 1 步 · 走向平衡',
    s1t: '从全是 A 开始，体系怎样走到平衡？平衡时什么相等？',
    s1e: '这一步要回答：平衡是怎样形成的，平衡时究竟是什么相等？<strong>反应速率</strong>在这里指每步发生多少次转变：正反应速率 ≈ A 的个数 × 2%，逆反应速率 ≈ B 的个数 × 3%（A、B 在同一容器里，个数正比于浓度）。从 200 个 A 出发：起初只有正反应；B 越多，逆反应越快；A 越少，正反应越慢。两个速率相等时，个数不再变：A 的个数 × 2% = B 的个数 × 3%，即 B/A = 2% ÷ 3% ≈ 0.67。这个比值叫<strong>平衡常数</strong> K = [B]/[A]（方括号表示浓度）。上半幅画个数，下半幅画两个速率（实测：最近 30 步的平均）；虚线是按规则算出的期望值，不是模拟。',
    fromA: '从纯 A 重来', fromB: '从纯 B 重来',
    c1counts: '个数（实线 = 模拟，虚线 = 期望）',
    c1rates: '速率：每步转变次数（实线 = 最近 30 步实测，虚线 = 期望）',
    lgVf: '正反应速率 A→B', lgVr: '逆反应速率 B→A', lgExp: '虚线 = 期望值',
    s1readout: '第 {t} 步：A {a}、B {b}，B/A = {q}（K = {K}）。正反应速率 {vf} 次/步，逆反应速率 {vr} 次/步（实测，最近 30 步平均）。{state}',
    stateBefore: '还在靠近平衡：期望在第 {s} 步前后走平（与平衡的差距只剩起点的 5%）。',
    stateAfter: '已过期望的走平时刻（第 {s} 步）：两个速率只剩随机涨落的差别。',
    s1hint: '观察顺序：从纯 A 按「播放」，盯住下半幅：橙线（逆反应）从 0 爬升，青线（正反应）往下走，大约第 {s} 步后两条线交汇并贴在一起；同时上半幅两条线走平。再按「从纯 B 重来」：起点相反，终点的个数一样——平衡位置由 K 决定，与从哪边出发无关。注意平衡时 A 与 B 的个数并不相等（约 120 对 80），相等的是两个速率。',

    s2k: '第 2 步 · 加一把料',
    s2t: '在平衡时突然加入 50 个 A，体系会怎样？',
    s2e: '这一步要回答：平衡被打破后往哪个方向走，走到哪里停？判断方向用<strong>浓度商</strong> Q = [B]/[A]：写法和 K 一样，只是代入此刻的个数。Q < K 时正反应比逆反应快，净结果是 A 变成 B；Q > K 时反过来；Q = K 时两个速率相等，就是平衡。加入 A 让 Q 突然变小，体系于是向生成 B 的方向移动。<strong>勒夏特列原理</strong>：改变平衡体系的条件，平衡向减弱这种改变的方向移动——是「减弱」，不是「抵消」。「个数」图上的竖虚线标出加料时刻；模拟最多 300 个粒子。',
    addA: '加入 50 个 A', addB: '加入 50 个 B', restart: '重来',
    c2box: '模拟 · 第 {t} 步 · 共 {N} 个粒子',
    c2plot: '个数（最近 400 步；竖虚线 = 加料）',
    s2readout: '第 {t} 步，共 {N} 个：A {a}、B {b}，Q = {q}，K = {K} → {dir}。{plan}',
    qLess: 'Q < K，正反应净多：A 在变成 B',
    qMore: 'Q > K，逆反应净多：B 在变回 A',
    qNear: 'Q ≈ K（差距在随机涨落范围内）：平衡',
    planNone: '先播放到走平，再加料。',
    planA: '加料前的平衡（按 K）是 A {a0}、B {b0}；按 K 预计新平衡 A {a1}、B {b1}：加进来的 50 个 A 里约 {c} 个会变成 B，但 A 仍比加料前多 {d} 个——扰动被减弱，没有被抵消。',
    planB: '加料前的平衡（按 K）是 A {a0}、B {b0}；按 K 预计新平衡 A {a1}、B {b1}：加进来的 50 个 B 里约 {c} 个会变回 A，但 B 仍比加料前多 {d} 个——扰动被减弱，没有被抵消。',
    capNote: '已到 300 个粒子的上限。',
    s2hint: '观察顺序：先播放到计数走平，再按「加入 50 个 A」：青线（A）一下跳高，橙线（B）不动。接着读数显示 Q < K，青线慢慢下降、橙线慢慢上升，直到 Q 回到 K 附近。比较新旧水平：A 没有回到原来的高度，B 却比原来高。',

    s3k: '第 3 步 · 温度',
    s3t: '升温以后，平衡点为什么会移动？',
    s3e: '这一步要回答：温度改变的是什么？每次转变都要越过一道能量门槛，叫<strong>活化能</strong> Ea；温度越高，越过门槛的机会越大，转变概率按阿伦尼乌斯关系 p ∝ e^(−Ea/RT) 增长（R 是气体常数，T 是热力学温度；<a class="xlink" href="../../../chemistry/reactions/activation-energy/#step2">→ 活化能页第 2 步：速率常数随温度指数增长</a>）。本页设正反应门槛 30 kJ/mol、逆反应 20 kJ/mol，两者之差 ΔH = +10 kJ/mol，即正反应<strong>吸热</strong>。门槛高的方向对温度更敏感，所以升温时正反应概率涨得更多，K 变大，平衡向吸热方向（生成 B）移动；降温反之。拖「温度」后按「测平衡占比」：程序在这个温度下先等 5 个弛豫时间（每个约 1/(p正 + p逆) 步，让旧平衡的痕迹消失），再取 1200 步的平均，得到 B 的占比，记成一个点。实线是公式：B 占比 = K / (1 + K)。',
    temp: '温度 T（K）',
    measure: '测平衡占比', clear: '清除测量点',
    c3box: '模拟 · {T} K · 第 {t} 步',
    c3plot: 'B 的占比随温度（点 = 实测，线 = 公式，空心圈 = 此刻）',
    lgTheory: '公式 K/(1+K)', lgMeasured: '实测（1200 步平均）', lgNow: '此刻的占比（会抖动）',
    s3readout: '{T} K：每步正反应概率 {pf}，逆反应概率 {pr}，K = {K}，公式给出 B 占比 {x}。{meas}',
    measYes: '实测 {m}（与公式差 {d} 个百分点）。',
    measNo: '这个温度还没测。',
    s3hint: '观察顺序：先在 300 K 测一个点，再升到 340 K、降到 260 K 各测一次：点沿着实线往右上走，温度越高，B 越多。再看读数里的两个概率：升温时两个都变大（反应都变快），但正反应变大得更多——这才是平衡点移动的原因。温度既改快慢，也改终点。',

    s4k: '第 4 步 · 催化剂',
    s4t: '催化剂让反应变快，会不会也让平衡多生成一些 B？',
    s4e: '这一步要回答：催化剂改变的是速度还是终点？<strong>催化剂</strong>给反应提供一条门槛更低的路线，而且正、逆两个方向的门槛降低同样多（本页降 3.5 kJ/mol），所以两个转变概率乘上同一个倍数（300 K 时约 {fac} 倍），比值 K 不变。两组模拟用同一个随机种子、都从 200 个 A 出发，只有一组加了催化剂。「B 的个数」图画两组模拟，虚线是期望值；竖线标出期望的走平时刻（与平衡的差距只剩起点的 5%）。',
    c4plain: '不加催化剂 · 第 {t} 步',
    c4cat: '加催化剂 · 第 {t} 步',
    c4plot: 'B 的个数随步数（竖线 = 期望的走平时刻）',
    lgPlain: '不加催化剂', lgCat: '加催化剂',
    s4readout: '第 {t} 步：不加催化剂 B {b0} 个，加催化剂 B {b1} 个。期望的走平时刻：第 {s0} 步 vs 第 {s1} 步（快约 {fx} 倍）。{tail}',
    tailWait: '跑完 600 步后比较终点。',
    tailDone: '第 200–600 步的平均 B 占比：{x0} vs {x1}，公式值 {x}——终点相同，差别只是模拟的随机涨落。',
    s4hint: '观察顺序：按「播放」，看两条实线：粉色（加催化剂）很快冲到平台，橙色（不加）慢慢爬上来，最后两条线在同一高度抖动。催化剂只改快慢，不改终点；要改终点，得改温度或浓度。',

    s5k: '第 5 步 · 收束',
    s5t: '平衡 = 两个方向一样快，不是停了',
    s5fin: '可逆反应走到<strong>化学平衡</strong>时，正、逆反应速率相等，各物质的量不再变化，但每个粒子仍在不停地转变——<strong>动态平衡</strong>。平衡位置由 K 决定：加料让 Q 偏离 K，体系向减弱扰动的方向移动，直到 Q 回到 K；改温度改变的是 K 本身，吸热方向在升温时受益；催化剂让两个方向同样加速，只缩短到达平衡的时间，不改变终点。',
    formula: '平衡：v正 = v逆，Q = K\nK = [B]/[A] = p正 / p逆　　B 占比 = K / (1 + K)',
    boundary: '这页的模型边界：A ⇌ B 是一步完成的单分子反应，每个粒子的转变概率固定、彼此独立；粒子的移动只是示意，没有模拟碰撞。温度用阿伦尼乌斯式定量示意，门槛 30 / 20 kJ/mol 与基准概率都是教学设定，不对应某个真实反应。真实反应常有多个分子参与（K 的写法不同），还受压强、体积等条件影响。模拟有随机涨落：粒子越少，抖动越大；本页所有「实测」都来自固定种子的模拟。',
    linksTitle: '接着看',
    lk1: '→ 反应速率第 0 步：碰上了也不一定反应',
    lk2: '→ 活化能第 4 步：逆反应也要翻山，山高不同，快慢不同',
    lk3: '→ 酸碱平衡第 0 步：弱酸在解离与结合之间来回走',
    lk4: '→ 质量守恒第 1 步：反应前后逐个数原子',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《化学平衡 · 人数不变，人还在跑》的平行版本。'
  },
  en: {
    pageTitle: 'Chemical Equilibrium · Still Moving at Balance',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Chemical Equilibrium · Still Moving at Balance →',
    navLabel: 'Chemical equilibrium steps',
    tagline: 'Once a reversible reaction has run for a while, the amounts stop changing — but has the reaction really stopped? This page simulates A ⇌ B with 200 particles that switch at random, and every count, rate and share is counted from the simulation. See how equilibrium forms and what is actually equal, then add material, change the temperature and add a catalyst to find out what moves the balance point and what does not.',
    nav0: '0 Stopped?', nav1: '1 Reaching balance', nav2: '2 Add material', nav3: '3 Temperature', nav4: '4 Catalyst', nav5: '5 Wrap-up',
    play: 'Play', pause: 'Pause',
    perTick: 'per step',

    s0k: 'Step 0 · Flat, so stopped?',
    s0t: 'The count curves have gone flat. Has the reaction stopped?',
    s0e: 'The question here: when the amounts in a <strong>reversible reaction</strong> (one that can run both ways) stop changing, are particles still reacting? This page uses the simplest one, A ⇌ B: A turning into B is the <strong>forward reaction</strong>, B turning back into A the <strong>reverse reaction</strong>. The picture is a simulation — cyan particles are A, orange are B — with a single rule: at every time step (“step” for short), each A becomes B with probability 2% and each B becomes A with probability 3%, every particle independently; a particle that has just switched flashes a white ring. The “counts” chart has steps across and number of particles up. It opens already near balance: of 200 particles, about 120 are A and 80 are B. Model note: the particles’ motion is only for show; in this model the chance to switch has nothing to do with collisions.',
    ff0: 'Skip 100 steps', track: 'Track one particle',
    c0box: 'Simulation · step {t} · {N} particles',
    c0plot: 'Counts (last 300 steps)',
    c0strip: 'Tracked particle: one bar per step, cyan = A, orange = B',
    lgA: 'Number of A', lgB: 'Number of B', lgFlash: 'White ring = just switched', lgTrack: 'Tracked particle',
    s0readout: 'Step {t}: {a} A, {b} B. So far A→B has happened {f} times and B→A {r} times; over the last 30 steps, {wf} A→B and {wr} B→A per step on average. {trk}',
    trk: 'The tracked particle has switched {k} times and is now {s}.',
    s0hint: 'What to watch: press “Play” and look at the counts chart first — both lines only jitter around one level. Then look at the two running totals in the readout: they keep climbing, at about the same pace. Press “Track one particle” and watch it flip between A and B. The counts hold steady not because nothing reacts, but because the switches in the two directions cancel out. That state is called dynamic equilibrium.',

    s1k: 'Step 1 · Reaching balance',
    s1t: 'Starting from all A, how does the system reach balance — and what is equal once it gets there?',
    s1e: 'The question here: how does equilibrium form, and what exactly is equal at equilibrium? The <strong>reaction rate</strong> here means how many switches happen per step: the forward rate ≈ number of A × 2%, the reverse rate ≈ number of B × 3% (A and B share one container, so counts are proportional to concentrations). Starting from 200 A, only the forward reaction runs at first; the more B there is, the faster the reverse reaction, and the fewer A, the slower the forward one. When the two rates are equal, the counts stop changing: number of A × 2% = number of B × 3%, so B/A = 2% ÷ 3% ≈ 0.67. That ratio is the <strong>equilibrium constant</strong> K = [B]/[A] (square brackets mean concentration). The upper chart shows counts, the lower one the two rates (measured: average over the last 30 steps); dashed lines are the values expected from the rule, not the simulation.',
    fromA: 'Restart from all A', fromB: 'Restart from all B',
    c1counts: 'Counts (solid = simulation, dashed = expected)',
    c1rates: 'Rates: switches per step (solid = last-30-step measurement, dashed = expected)',
    lgVf: 'Forward rate A→B', lgVr: 'Reverse rate B→A', lgExp: 'Dashed = expected',
    s1readout: 'Step {t}: {a} A, {b} B, B/A = {q} (K = {K}). Forward rate {vf} per step, reverse rate {vr} per step (measured, last-30-step average). {state}',
    stateBefore: 'Still approaching balance: expected to level off around step {s} (when the gap to balance is down to 5% of the start).',
    stateAfter: 'Past the expected levelling-off point (step {s}): the two rates now differ only by random fluctuation.',
    s1hint: 'What to watch: from all A, press “Play” and keep your eye on the lower chart — the orange line (reverse) climbs from 0, the cyan line (forward) falls, and after about step {s} they meet and stay together; meanwhile the two lines in the upper chart level off. Then press “Restart from all B”: opposite start, same final counts — the balance point is set by K, not by which side you start from. Note that at balance A and B are not equal (about 120 to 80); it is the two rates that are equal.',

    s2k: 'Step 2 · Add material',
    s2t: 'Suddenly add 50 A to a system at balance. What happens?',
    s2e: 'The question here: once balance is disturbed, which way does the system move, and where does it stop? The direction is read from the <strong>reaction quotient</strong> Q = [B]/[A] — written like K, but with the counts right now. If Q < K the forward reaction outpaces the reverse and the net effect is A turning into B; if Q > K the reverse wins; at Q = K the rates are equal, which is balance. Adding A suddenly lowers Q, so the system shifts toward making B. <strong>Le Chatelier’s principle</strong>: change a condition of a system at equilibrium and the equilibrium shifts so as to reduce that change — reduce, not undo. Dashed vertical lines in the counts chart mark each addition; the simulation holds at most 300 particles.',
    addA: 'Add 50 A', addB: 'Add 50 B', restart: 'Restart',
    c2box: 'Simulation · step {t} · {N} particles',
    c2plot: 'Counts (last 400 steps; dashed line = material added)',
    s2readout: 'Step {t}, {N} particles: {a} A, {b} B, Q = {q}, K = {K} → {dir}. {plan}',
    qLess: 'Q < K, the forward reaction wins: A is turning into B',
    qMore: 'Q > K, the reverse reaction wins: B is turning back into A',
    qNear: 'Q ≈ K (within random fluctuation): at balance',
    planNone: 'Play until the counts level off, then add material.',
    planA: 'Balance before the addition (from K): {a0} A, {b0} B. From K, the new balance should be {a1} A, {b1} B: about {c} of the 50 added A will turn into B, yet there are still {d} more A than before — the disturbance is reduced, not undone.',
    planB: 'Balance before the addition (from K): {a0} A, {b0} B. From K, the new balance should be {a1} A, {b1} B: about {c} of the 50 added B will turn back into A, yet there are still {d} more B than before — the disturbance is reduced, not undone.',
    capNote: 'The 300-particle limit has been reached.',
    s2hint: 'What to watch: play until the counts level off, then press “Add 50 A”. The cyan line (A) jumps up and the orange line (B) does not move. The readout now shows Q < K: the cyan line drifts down and the orange line drifts up until Q is back near K. Compare old and new levels — A does not return to where it was, and B ends up higher than before.',

    s3k: 'Step 3 · Temperature',
    s3t: 'Why does the balance point move when you heat the system?',
    s3e: 'The question here: what does temperature actually change? Every switch has to clear an energy barrier, the <strong>activation energy</strong> Ea; the hotter it is, the better the odds of clearing it, and the switching probability grows as in the Arrhenius relation p ∝ e^(−Ea/RT) (R is the gas constant, T the absolute temperature; <a class="xlink" href="../../../chemistry/reactions/activation-energy/#step2">→ Activation energy, step 2: rate constants grow exponentially with temperature</a>). Here the forward barrier is 30 kJ/mol and the reverse 20 kJ/mol; the difference ΔH = +10 kJ/mol makes the forward reaction <strong>endothermic</strong> (it absorbs heat). The direction with the higher barrier is more sensitive to temperature, so heating boosts the forward probability more, K grows, and the balance shifts toward the endothermic side (more B); cooling does the opposite. Set the temperature and press “Measure balance share”: the program first waits five relaxation times at that temperature (each about 1/(p_fwd + p_rev) steps, enough to erase the old balance), then averages the B share over 1200 steps and plots it as a dot. The solid line is the formula B share = K / (1 + K).',
    temp: 'Temperature T (K)',
    measure: 'Measure balance share', clear: 'Clear measurements',
    c3box: 'Simulation · {T} K · step {t}',
    c3plot: 'Share of B against temperature (dots = measured, line = formula, ring = right now)',
    lgTheory: 'Formula K/(1+K)', lgMeasured: 'Measured (1200-step average)', lgNow: 'Share right now (jitters)',
    s3readout: '{T} K: forward probability {pf} per step, reverse {pr}, K = {K}; the formula gives a B share of {x}. {meas}',
    measYes: 'Measured {m} ({d} percentage points from the formula).',
    measNo: 'Not measured at this temperature yet.',
    s3hint: 'What to watch: measure one dot at 300 K, then one at 340 K and one at 260 K — the dots climb along the line to the upper right: the hotter, the more B. Then compare the two probabilities in the readout: heating raises both (everything speeds up), but the forward one rises more, and that is what moves the balance point. Temperature changes the speed and the endpoint.',

    s4k: 'Step 4 · Catalyst',
    s4t: 'A catalyst speeds a reaction up. Does it also leave more B at balance?',
    s4e: 'The question here: does a catalyst change the speed or the endpoint? A <strong>catalyst</strong> opens a route with a lower barrier, lowered by the same amount in both directions (3.5 kJ/mol here), so both switching probabilities are multiplied by the same factor (about {fac} at 300 K) and their ratio K is unchanged. Two simulations share one random seed and both start from 200 A; only one has the catalyst. The “number of B” chart shows both runs, with dashed expected values; vertical lines mark the expected levelling-off points (gap to balance down to 5% of the start).',
    c4plain: 'No catalyst · step {t}',
    c4cat: 'With catalyst · step {t}',
    c4plot: 'Number of B against steps (vertical lines = expected levelling-off)',
    lgPlain: 'No catalyst', lgCat: 'With catalyst',
    s4readout: 'Step {t}: {b0} B without the catalyst, {b1} B with it. Expected levelling-off: step {s0} vs step {s1} (about {fx} times faster). {tail}',
    tailWait: 'Run all 600 steps to compare the endpoints.',
    tailDone: 'Average B share over steps 200–600: {x0} vs {x1}, formula {x} — the same endpoint; the gap is only random fluctuation.',
    s4hint: 'What to watch: press “Play” and follow the two solid lines. Pink (with catalyst) shoots up to its plateau, orange (without) climbs slowly, and in the end both jitter at the same height. A catalyst changes how fast, not where; to move the endpoint you need temperature or concentration.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Equilibrium means both directions run equally fast — not that they stop',
    s5fin: 'When a reversible reaction reaches <strong>chemical equilibrium</strong>, the forward and reverse rates are equal and the amounts stop changing, yet every particle keeps switching — a <strong>dynamic equilibrium</strong>. Where it settles is set by K: adding material pushes Q away from K and the system shifts to reduce the disturbance until Q is back at K; changing temperature changes K itself, favouring the endothermic direction when heated; a catalyst speeds both directions equally, shortening the time to balance without moving the endpoint.',
    formula: 'balance: v_fwd = v_rev, Q = K\nK = [B]/[A] = p_fwd / p_rev　　B share = K / (1 + K)',
    boundary: 'Where this model stops: A ⇌ B is a one-step, single-particle reaction with fixed, independent switching probabilities; the particles’ motion is only for show and no collisions are simulated. Temperature is treated quantitatively with the Arrhenius form, but the 30 / 20 kJ/mol barriers and base probabilities are teaching choices, not a real reaction. Real reactions often involve several molecules (so K is written differently) and depend on pressure, volume and more. The simulation fluctuates at random — fewer particles, bigger jitter — and every “measured” value on this page comes from a fixed-seed simulation.',
    linksTitle: 'Where to next',
    lk1: '→ Reaction rates, step 0: a collision does not always make a reaction',
    lk2: '→ Activation energy, step 4: the reverse reaction climbs a hill too — different heights, different speeds',
    lk3: '→ Acid–base equilibrium, step 0: a weak acid goes back and forth between splitting and recombining',
    lk4: '→ Mass conservation, step 1: count the atoms before and after',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Chemical Equilibrium · Still Moving at Balance”.'
  }
};

const LANG_KEY = 'knowledge-lang';
function initialLang() {
  try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'zh' || saved === 'en') return saved; } catch (_) { /* storage blocked */ }
  return typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
}
let lang = typeof window === 'undefined' ? 'zh' : initialLang();
function t(key, params = {}) {
  let text = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* storage denied: keep the in-memory value */ }
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
