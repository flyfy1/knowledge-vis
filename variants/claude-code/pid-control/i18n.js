'use strict';
// Feedback-control lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '反馈控制 · 让无人机停在指定高度',
    back: '← 知识索引',
    compare: '对照另一版本：反馈控制 · 先看差多少，再决定推多少 →',
    navLabel: '反馈控制步骤导航',
    tagline: '一架 1 kg 的无人机要停在 5 m 高。螺旋桨能给 0 到 30 N 的升力，重力一直向下拉 9.8 N。控制器每 0.01 s 读一次高度表，决定这一刻推多大力。七步里你会从「差多少就推多少」出发，依次加上 D 和 I，看清每一项解决了什么问题，又带来什么代价。',
    nav0: '0 为什么要测', nav1: '1 P 比例', nav2: '2 D 微分', nav3: '3 I 积分', nav4: '4 推力上限', nav5: '5 调参实验', nav6: '6 收束',

    fly: '▶ 播放飞行（2 倍速）', clearGhost: '清空灰色旧曲线', playing: '播放中 t = {t} s / 10 s。',
    cAlt: '高度 z（m）· 横轴为时间 t（s）', cThrust: '推力 u（N）', cErr: '误差 e = r − z（m），阴影是累计面积', cComp: '推力拆成三项（N）', cInteg: '积分值 ∫e dt（m·s）', cTries: '每次尝试：横轴稳定用时（s），纵轴超调（%）',
    lgOpen: '开环：回放 1 kg 时录下的推力', lgClosed: '闭环：边测边调', lgTarget: '目标高度 r', lgWeight: '悬停所需推力 m·g', lgNow: '当前设置', lgGhost: '之前试过的设置',
    lgP: 'P 项', lgI: 'I 项', lgD: 'D 项', lgU: '实际推力 u（0–30 N）', lgArea: '误差面积', lgPlain: '普通积分器', lgClamp: '钳制积分器', lgSat: '推力顶在 30 N 上限',
    lgBox: '目标区：超调 ≤ 5%、稳定 ≤ 3 s', lgPass: '四条全过', lgFail: '未全过',
    notSettled: '10 s 内未稳定', secs: '{v} s',

    s0k: '第 0 步 · 为什么要测',
    s0t: '既然算得出该推多大力，为什么还要一直测高度？',
    s0e: '这一步要回答：把整段推力事先算好、照着放，能不能代替边测边调？本页的对象是一架模拟无人机。<strong>高度 z</strong>（米）从地面 0 开始。<strong>推力 u</strong>（牛顿）由螺旋桨产生，只能在 0 到 30 N 之间，螺旋桨不能往下拉。重力 m·g 一直向下（m 是质量，g = 9.8 m/s²），空气阻力和速度成正比。想到达的高度叫<strong>设定值 r</strong>，这里 r = 5 m。<strong>误差 e = r − z</strong> 是还差多少：正数表示还太低。橙色是<strong>开环</strong>：把一次成功飞行（质量 1 kg）的推力录下来原样回放，全程不看高度表。青色是<strong>闭环</strong>，也叫反馈：每 0.01 s 读一次高度，按误差现算推力。这个控制器后面几步会一项项搭出来。',
    massSlider: '无人机的真实质量 m（kg）· 推力记录是按 1 kg 录的',
    s0hint: '观察顺序：先保持 m = 1，两条曲线重合，因为回放的正是那次成功飞行。再把 m 拖到 1.1（多挂了 100 g），橙色在悬停段推力不够，一路往下掉直到落地；拖到 0.9，橙色一直往上飘出图外。青色在每个质量下都回到 5 m 附近。按「播放飞行」看两架无人机同时飞一遍，左边小图是它们的实时高度。',
    s0readout: 'm = {m} kg。开环回放：{ol}。闭环：最后 1 秒平均高度 {cl} m，最高到 {peak} m。悬停所需推力 m·g = {w} N，回放里悬停段给的是 {rec} N。',
    olGround: '第 {t} s 落地', olTop: '第 {t} s 冲出图顶（12 m）后仍在上升', olEnd: '10 s 时停在 {z} m',

    s1k: '第 1 步 · P：比例',
    s1t: '只按「差多少」来推，能停在 5 m 吗？',
    s1e: '这一步要回答：最简单的规则「差得越多推得越猛」会把无人机停在哪里？规则写成 <strong>u = Kp · e</strong>：推力等于误差 e（目标减高度）乘一个系数 <strong>Kp</strong>。Kp 叫比例增益，单位 N/m，意思是每差 1 m 多推几牛。这一项叫 <strong>P 项</strong>（比例项）。麻烦出在悬停：要停住，推力必须正好等于重量 m·g = 9.8 N；而按这条规则，推力是 9.8 N 就意味着 e = 9.8 / Kp，不是 0。所以无人机会停在目标下方 <strong>m·g / Kp</strong> 处。这段停下后还剩的误差叫<strong>稳态误差</strong>，这里就是「下沉」。加大 Kp 能减小下沉，但推力对误差反应更猛：冲过目标后又被猛拉回来，于是上下来回晃。',
    kpSlider: '比例增益 Kp（N/m）',
    s1hint: '观察顺序：从 Kp = 5 开始，青色曲线平稳爬升，停在目标线下方约 2 m。再逐步加到 10、20、40，旧曲线留作灰色对照：停的位置越来越接近 5 m，但第一个峰越冲越高，来回穿过目标线的次数变多。推力图里，最后推力都回到粉色的 m·g 线上，这正是要停住所需的那份力。',
    s1readout: 'Kp = {kp} N/m：最后 1 秒平均高度 {fz} m，下沉 {sag} m（理论值 m·g/Kp = {th} m）；最高到 {peak} m，超过目标 {os}%；穿过目标线 {cross} 次。',

    s2k: '第 2 步 · D：微分',
    s2t: '怎样在冲过头之前就先松油门？',
    s2e: '这一步要回答：上一步的晃动来自「快到目标时还在高速上冲」，能不能看着速度提前减力？加一项 <strong>D 项</strong>（微分项）：u = Kp·e + <strong>Kd</strong>·de/dt。de/dt 是误差每秒变化多少；目标不动时，它等于上升速度的相反数，所以无人机上冲越快，D 项减掉的推力越多。<strong>Kd</strong> 叫微分增益，单位 N·s/m，决定减得多狠。本页实际用测得高度的变化率来算 D 项，这样目标跳变的那一刻不会出现推力尖峰；目标不动时两种算法完全相同。这里 Kp 固定为 20（上一步晃得厉害的那档）。这种用阻尼压超调的关系，在<a class="xlink" href="../../../engineering/control/step-response/#step2">阶跃响应页第 2 步（超调只由阻尼比决定）</a>有专门的推导。代价出在测量上：高度表每次读数有几毫米的随机误差，求变化率时要除以 0.01 s，毫米级的抖动就被放大成推力的剧烈抖动。',
    kdSlider: '微分增益 Kd（N·s/m）',
    noiseBtn: '高度表加入 σ = 5 mm 噪声',
    s2hint: '观察顺序：先保持噪声关闭，把 Kd 从 0 逐步加到 2、4、6：第一个峰降下来，穿过目标线的次数变少，Kd ≥ 6 后不再越过目标。注意停的位置没变：D 只看变化，不看差多少，下沉仍是 m·g/Kp ≈ 0.49 m。然后打开噪声：高度曲线几乎不变，推力图却变成一片毛刺，Kd 越大越密。',
    s2readout: 'Kp = 20，Kd = {kd}：最高 {peak} m，超过目标 {os}%，穿过目标线 {cross} 次；最后 1 秒平均高度 {fz} m，下沉 {sag} m。{noise}',
    s2noiseOn: '噪声开：最后 4 秒推力的标准差 {j} N，即推力上下抖动的典型幅度。',
    s2noiseOff: '噪声关：最后 4 秒推力的标准差 {j} N，只来自高度本身的晃动。',

    s3k: '第 3 步 · I：积分',
    s3t: '最后那段下沉，要靠什么才能消掉？',
    s3e: '这一步要回答：P 项在误差为 0 时推力也为 0，所以单靠 P 一定会下沉；需要一项在误差回到 0 后仍能保留推力。<strong>I 项</strong>（积分项）把误差随时间累加：<strong>∫e dt</strong> 就是中图误差曲线下的面积，等于「还差多少 × 差了多久」，单位 m·s；再乘<strong>积分增益 Ki</strong>（单位 N/(m·s)）变成推力。只要还低于目标，面积就继续增长，推力就继续加大；到达目标后面积不再增长，但已经积下的那份推力留了下来，正好托住重量。合起来的控制律 <strong>u = Kp·e + Ki·∫e dt + Kd·de/dt</strong> 就是 <strong>PID 控制器</strong>。这里 Kp = 20、Kd = 6 固定（上一步不越过目标的那组），没有噪声。',
    kiSlider: '积分增益 Ki（N/(m·s)）',
    s3hint: '观察顺序：先把 Ki 拖到 0，这就是上一步：停在约 4.51 m，中图的面积一直在涨，却没有变成推力。再调到 2：中图橙色面积在开头堆起来，下图橙色的 I 项慢慢爬升，10 s 时约 8 N，高度缓缓回升。调回 5（默认值）：I 项爬到约 10 N，青色的 P 项随之缩到接近 0，高度回到 5 m。再加到 10、20：面积积得太多，无人机越过目标，中图出现目标线以上的负面积，把多积的账还回去，超调随之变大。',
    s3readout: 'Ki = {ki}：最后 1 秒平均高度 {fz} m，误差 {sag} m；超调 {os}%；进入并留在 5 m ± 5% 内的时刻 {st}。10 s 时 I 项 {ui} N、P 项 {up} N、D 项 {ud} N，合计 {u} N（重量 9.8 N）。',
    quizPrompt: 'Ki = 5 时，10 s 后误差几乎为 0，推力却仍有约 9.8 N。这份推力主要来自哪一项？',
    quizA: 'P 项：误差还很大', quizB: 'I 项：开头积下的误差面积还在', quizC: 'D 项：无人机还在上升',
    check: '检查答案',
    correct: '对。误差接近 0，P 项就接近 0；速度接近 0，D 项也接近 0。剩下的推力只能来自 I：它记着开头低于目标那段的面积。',
    wrong: '再看下图的最右端：青色 P 和绿色 D 都贴着 0，只有橙色 I 停在约 10 N。',

    s4k: '第 4 步 · 推力上限',
    s4t: '目标定得很高时，I 项为什么会让它冲得更远？',
    s4e: '这一步要回答：螺旋桨最多只能给 30 N，推力顶到上限时，积分项在做什么？目标越高，开头误差越大，控制器算出的推力远超 30 N，但实际只能给 30 N，这叫<strong>饱和</strong>。普通的积分器不知道推力已经封顶，照样把这段大误差全部累加进 ∫e dt，积分越积越多，这叫<strong>积分饱和</strong>（windup）。等无人机到了目标，多积的这笔账要靠越过目标、产生负误差才能慢慢抵消。常用的补救是<strong>积分钳制</strong>：推力已经顶在上限、误差还在要求加力时，暂停积分。两条曲线用同一组增益 Kp = 14、Ki = 8、Kd = 6，唯一的区别是积分器有没有钳制。',
    rSlider: '目标高度 r（m）',
    s4hint: '观察顺序：先把 r 调到 2 m：推力没碰到上限，下图没有粉色带，两条曲线重合。再逐步升到 4、6、8 m：粉色饱和段变长，中图橙色的积分值比青色积得高得多，上图橙色越过目标更远、回落更慢；青色的超调基本不随 r 增大。',
    s4readout: 'r = {r} m：推力顶在 30 N 的时间共 {sat} s（普通积分器）。普通积分器：超调 {osP}%，积分最大 {iP} m·s，稳定于 {stP}。钳制积分器：超调 {osC}%，积分最大 {iC} m·s，稳定于 {stC}。',

    s5k: '第 5 步 · 调参实验',
    s5t: '三个增益一起调，能同时满足四条要求吗？',
    s5e: '这一步要回答：P、I、D 各有好处也各有代价，能不能找到一组同时过关的增益？这里每次飞行都带着 σ = 5 mm 的高度表噪声（和第 2 步一样，固定同一串随机数），目标 5 m。四条要求：<strong>超调</strong> ≤ 5%，即最高点超过目标的部分除以 5 m；<strong>稳定用时</strong> ≤ 3 s，即从这一刻起高度一直留在 4.75–5.25 m（5 m ± 5%）之内；<strong>末段误差</strong> ≤ 0.05 m，即 5 m 减去最后 1 秒平均高度后取绝对值；<strong>推力抖动</strong> ≤ 3 N，即最后 4 秒推力的标准差。前三条看高度，越小越好；第四条看电机受不受得了，也是越小越好。「每次尝试」图把每次尝试画成一个点：横轴稳定用时、纵轴超调，绿框就是前两条要求；超调超过 30% 的点贴在顶边，10 s 内没稳定的点贴在最右边。',
    c5a: '当前设置的高度与推力', c5b: '所有尝试的稳定用时与超调',
    preGentle: '预设：温和 (8, 1, 5)', preStep3: '预设：第 3 步那组 (20, 5, 6)', preAggr: '预设：激进 (40, 30, 3)', awBtn: '积分钳制（第 4 步）', clearTries: '清空尝试点',
    chkOs: '超调 {v}%（要求 ≤ 5%）', chkSt: '稳定用时 {v}（要求 ≤ 3 s）', chkSs: '末段误差 {v} m（要求 ≤ 0.05 m）', chkJ: '推力抖动 {v} N（要求 ≤ 3 N）',
    s5readout: 'Kp = {kp}，Ki = {ki}，Kd = {kd}，积分钳制{aw}：{verdict} 已试 {c} 组，其中 {p} 组四条全过。',
    awOn: '开', awOff: '关', verdictPass: '四条全部满足。', verdictFail: '还差 {n} 条。',
    s5hint: '观察顺序：先按三个预设，看各自卡在哪一条：温和的太慢、末段还差得远；第 3 步那组推力抖得太凶（Kd = 6 把噪声放大了）；激进的冲得太高。然后从「第 3 步那组」出发，先把 Kd 降到 3–4 压住抖动，再减小 Kp 和 Ki 把超调收回来，看「每次尝试」图里的点怎样走进绿框。可行的组合不止一个，例如 Kp = 10、Ki = 4、Kd = 3.5。',

    s6k: '第 6 步 · 收束',
    s6t: '三项各看一段时间',
    s6fin: '<strong>P 看现在</strong>差多少：Kp 越大，下沉越小、反应越快，但越容易来回晃。<strong>D 看变化</strong>的方向和快慢：提前减力，压住超调，代价是把测量噪声放大成推力抖动。<strong>I 看过去</strong>累计欠了多少：消掉重力这类恒定负载造成的下沉，代价是积多了会越过目标；执行器顶到上限时还要钳制它。调参就是在这些代价之间找平衡，而且答案取决于被控对象：换一架更重的无人机、换一个推力上限，好用的增益也会跟着变。',
    formula: 'e = r − z\nu = Kp·e + Ki·∫e dt + Kd·de/dt，再限制在 0 ≤ u ≤ 30 N',
    boundary: '适用范围：本页是模拟，只有竖直方向的运动；质量 1 kg（第 0 步可改）、空气阻力系数 1 N·s/m、推力 0–30 N、控制器每 0.01 s 计算一次，高度表噪声是独立的高斯噪声 σ = 5 mm。真实无人机还有电机响应延迟、姿态与高度的耦合、阵风和电池电压下降，D 项一般会先滤波再用。页面上的具体增益和指标只对这个模型成立，不能直接搬到真实飞行器上。',
    linksTitle: '继续探索',
    lk1: '阶跃响应：为什么超调只由阻尼比决定 →',
    lk2: '倒立摆：用 P、D、I 把一根杆子立住 →',
    lk3: '拉普拉斯：调参就是在搬极点，极点位置决定系统性格 →',
    lk4: '卡尔曼：先估计状态，再据此控制（LQG）→',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《反馈控制 · 先看差多少，再决定推多少》的平行版本。全部曲线来自页面内的模拟。'
  },
  en: {
    pageTitle: 'Feedback Control · Holding a Drone at a Set Height',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Feedback Control · See the Error, Then Act →',
    navLabel: 'Feedback control steps',
    tagline: 'A 1 kg drone has to hover at 5 m. Its rotors can lift with anywhere from 0 to 30 N, and gravity pulls down with 9.8 N the whole time. Every 0.01 s the controller reads the altimeter and decides how hard to push. Over seven steps you start from “push in proportion to how far off you are”, then add D and I, and see what each term fixes and what it costs.',
    nav0: '0 Why measure', nav1: '1 P proportional', nav2: '2 D derivative', nav3: '3 I integral', nav4: '4 Thrust limit', nav5: '5 Tuning lab', nav6: '6 Wrap-up',

    fly: '▶ Play the flight (2× speed)', clearGhost: 'Clear grey traces', playing: 'Playing t = {t} s / 10 s. ',
    cAlt: 'Altitude z (m) · horizontal axis is time t (s)', cThrust: 'Thrust u (N)', cErr: 'Error e = r − z (m); shading is the running area', cComp: 'Thrust split into its three terms (N)', cInteg: 'Integral ∫e dt (m·s)', cTries: 'Every try: settling time (s) across, overshoot (%) up',
    lgOpen: 'Open loop: replay the thrust recorded at 1 kg', lgClosed: 'Closed loop: measure and correct', lgTarget: 'Target altitude r', lgWeight: 'Thrust needed to hover, m·g', lgNow: 'Current setting', lgGhost: 'Settings you tried before',
    lgP: 'P term', lgI: 'I term', lgD: 'D term', lgU: 'Actual thrust u (0–30 N)', lgArea: 'Error area', lgPlain: 'Plain integrator', lgClamp: 'Clamped integrator', lgSat: 'Thrust pinned at the 30 N limit',
    lgBox: 'Target zone: overshoot ≤ 5%, settled ≤ 3 s', lgPass: 'Passes all four', lgFail: 'Misses at least one',
    notSettled: 'not settled within 10 s', secs: '{v} s',

    s0k: 'Step 0 · Why measure',
    s0t: 'If you can work out the thrust in advance, why keep measuring?',
    s0e: 'The question here: can a thrust schedule computed ahead of time replace measuring and correcting as you go? The object on this page is a simulated drone. Its <strong>altitude z</strong> (metres) starts on the ground at 0. The <strong>thrust u</strong> (newtons) comes from the rotors and can only be between 0 and 30 N — rotors cannot pull downward. Gravity m·g always pulls down (m is the mass, g = 9.8 m/s²), and air drag grows with speed. The altitude we want is the <strong>setpoint r</strong>, here r = 5 m. The <strong>error e = r − z</strong> is how far there is still to go; positive means still too low. Orange is <strong>open loop</strong>: the thrust from one successful flight (at 1 kg) is recorded and replayed exactly, never looking at the altimeter. Cyan is <strong>closed loop</strong>, also called feedback: every 0.01 s it reads the altitude and computes the thrust from the error. The next steps build that controller one term at a time.',
    massSlider: 'Drone’s real mass m (kg) · the thrust recording was made at 1 kg',
    s0hint: 'What to watch: keep m = 1 first — the two curves coincide, because the replay is that very flight. Now drag m to 1.1 (an extra 100 g of cargo): during the hover the orange drone is short of thrust and sinks until it hits the ground. At 0.9 it drifts up off the top of the chart. Cyan comes back to about 5 m for every mass. Press “Play the flight” to fly both drones; the small strip on the left shows their live altitude.',
    s0readout: 'm = {m} kg. Open-loop replay: {ol}. Closed loop: average altitude over the last second {cl} m, highest point {peak} m. Hovering needs m·g = {w} N; the replay gives {rec} N during the hover.',
    olGround: 'hits the ground at {t} s', olTop: 'leaves the top of the chart (12 m) at {t} s and keeps climbing', olEnd: 'sits at {z} m at 10 s',

    s1k: 'Step 1 · P: proportional',
    s1t: 'Push only by how far off you are — does it stop at 5 m?',
    s1e: 'The question here: where does the simplest rule, “the further off, the harder you push”, leave the drone? The rule is <strong>u = Kp · e</strong>: thrust equals the error e (target minus altitude) times a factor <strong>Kp</strong>. Kp is the proportional gain, in N/m — how many extra newtons per metre of error. This is the <strong>P term</strong>. The catch is hovering: to hold still, the thrust must equal the weight m·g = 9.8 N exactly, and under this rule a thrust of 9.8 N means e = 9.8 / Kp, which is not zero. So the drone settles <strong>m·g / Kp</strong> below the target. The error left over once things stop moving is the <strong>steady-state error</strong> — here, the sag. A larger Kp shrinks the sag, but the thrust also reacts harder: the drone overshoots, gets yanked back, and bobs up and down.',
    kpSlider: 'Proportional gain Kp (N/m)',
    s1hint: 'What to watch: start at Kp = 5 — the cyan curve climbs smoothly and stops about 2 m below the target line. Step up to 10, 20, 40 and keep the old curves as grey references: the resting point creeps toward 5 m, but the first peak gets taller and the curve crosses the target line more often. In the thrust plot every run ends on the pink m·g line — exactly the force needed to hold still.',
    s1readout: 'Kp = {kp} N/m: average altitude over the last second {fz} m, sag {sag} m (theory m·g/Kp = {th} m); highest point {peak} m, {os}% above the target; crosses the target line {cross} times.',

    s2k: 'Step 2 · D: derivative',
    s2t: 'How do you ease off before you overshoot?',
    s2e: 'The question here: the bobbing in step 1 comes from still climbing fast when the target is near — can we watch the speed and back off early? Add a <strong>D term</strong> (derivative term): u = Kp·e + <strong>Kd</strong>·de/dt. de/dt is how fast the error changes per second; with the target held still, it is minus the climb rate, so the faster the drone shoots upward, the more thrust the D term takes away. <strong>Kd</strong> is the derivative gain, in N·s/m, and sets how hard it backs off. This page computes the D term from the rate of the <em>measured</em> altitude, so a jump in the target does not cause a thrust spike; while the target holds still the two are identical. Kp is fixed at 20 here — the setting that bobbed badly in step 1. Damping that tames overshoot is worked out in detail on <a class="xlink" href="../../../engineering/control/step-response/#step2">the step-response page, step 2 (overshoot depends on the damping ratio alone)</a>. The price is in the measurement: each altimeter reading is off by a few random millimetres, and taking a rate means dividing by 0.01 s, so millimetre jitter turns into violent thrust jitter.',
    kdSlider: 'Derivative gain Kd (N·s/m)',
    noiseBtn: 'Add σ = 5 mm altimeter noise',
    s2hint: 'What to watch: with noise off, raise Kd from 0 to 2, 4, 6 — the first peak drops, the curve crosses the target less often, and from Kd ≥ 6 it no longer goes past the target. Notice the resting point does not move: D looks only at change, not at how far off you are, so the sag stays at m·g/Kp ≈ 0.49 m. Then switch the noise on: the altitude barely changes, but the thrust plot turns into a band of spikes, denser the larger Kd is.',
    s2readout: 'Kp = 20, Kd = {kd}: highest point {peak} m, {os}% above the target, crosses the target line {cross} times; average altitude over the last second {fz} m, sag {sag} m. {noise}',
    s2noiseOn: 'Noise on: thrust standard deviation over the last 4 s is {j} N — the typical size of the thrust jitter.',
    s2noiseOff: 'Noise off: thrust standard deviation over the last 4 s is {j} N, coming only from the altitude’s own bobbing.',

    s3k: 'Step 3 · I: integral',
    s3t: 'What gets rid of that last bit of sag?',
    s3e: 'The question here: the P term gives zero thrust at zero error, so P alone always sags; we need a term that keeps pushing after the error is gone. The <strong>I term</strong> (integral term) adds the error up over time: <strong>∫e dt</strong> is the area under the error curve in the middle plot — “how far off × for how long”, in m·s — and multiplying by the <strong>integral gain Ki</strong> (in N/(m·s)) turns it into thrust. As long as the drone is below the target the area keeps growing and so does the thrust; once it reaches the target the area stops growing, but the thrust already built up stays — just enough to carry the weight. The full rule <strong>u = Kp·e + Ki·∫e dt + Kd·de/dt</strong> is the <strong>PID controller</strong>. Kp = 20 and Kd = 6 are fixed here (the pair that no longer went past the target in step 2), with no noise.',
    kiSlider: 'Integral gain Ki (N/(m·s))',
    s3hint: 'What to watch: first drag Ki to 0 — that is step 2 again: the drone rests at about 4.51 m, and the area in the middle plot keeps growing without turning into thrust. Then set Ki to 2: the orange area piles up early in the middle plot, and the orange I term in the bottom plot climbs slowly, to about 8 N by 10 s, while the altitude creeps back up. Back at 5 (the default) the I term reaches about 10 N, the cyan P term shrinks toward 0, and the altitude returns to 5 m. Go on to 10 and 20: too much area builds up, the drone passes the target, and negative area above the target line appears in the middle plot as the excess is paid back — the overshoot grows.',
    s3readout: 'Ki = {ki}: average altitude over the last second {fz} m, error {sag} m; overshoot {os}%; enters and stays within 5 m ± 5% at {st}. At 10 s the I term gives {ui} N, P {up} N, D {ud} N — {u} N in total (the weight is 9.8 N).',
    quizPrompt: 'With Ki = 5, after 10 s the error is almost zero, yet the thrust is still about 9.8 N. Which term supplies it?',
    quizA: 'The P term — the error is still large', quizB: 'The I term — the error area built up early is still there', quizC: 'The D term — the drone is still climbing',
    check: 'Check answer',
    correct: 'Right. With the error near 0 the P term is near 0, and with the speed near 0 the D term is too. The remaining thrust can only come from I, which remembers the area from when the drone was below the target.',
    wrong: 'Look at the right-hand end of the bottom plot again: cyan P and green D both sit on 0; only the orange I term stays near 10 N.',

    s4k: 'Step 4 · Thrust limit',
    s4t: 'Why does the I term overshoot further when the target is high?',
    s4e: 'The question here: the rotors top out at 30 N — what is the integral doing while the thrust is pinned there? The higher the target, the larger the error at the start, and the controller asks for far more than 30 N; the drone only gets 30 N. That is <strong>saturation</strong>. A plain integrator does not know the thrust is capped and keeps adding the large error into ∫e dt, so the integral grows and grows — <strong>integrator windup</strong>. When the drone reaches the target, that surplus can only be paid back by going past the target and running up negative error. The usual fix is <strong>integrator clamping</strong>: while the thrust is pinned at the limit and the error is still asking for more, stop integrating. Both curves use the same gains, Kp = 14, Ki = 8, Kd = 6; the only difference is whether the integrator is clamped.',
    rSlider: 'Target altitude r (m)',
    s4hint: 'What to watch: set r to 2 m first — the thrust never reaches the limit, there is no pink band in the bottom plot, and the two curves coincide. Raise r to 4, 6, 8 m: the pink saturated stretch gets longer, the orange integral in the middle plot climbs far above the cyan one, and in the top plot orange goes further past the target and comes back more slowly; cyan’s overshoot barely grows with r.',
    s4readout: 'r = {r} m: the thrust is pinned at 30 N for {sat} s (plain integrator). Plain integrator: overshoot {osP}%, largest integral {iP} m·s, settled at {stP}. Clamped integrator: overshoot {osC}%, largest integral {iC} m·s, settled at {stC}.',

    s5k: 'Step 5 · Tuning lab',
    s5t: 'Turning all three gains at once — can you meet four targets together?',
    s5e: 'The question here: P, I and D each help and each cost something — is there a set of gains that passes everything at once? Every flight here carries σ = 5 mm altimeter noise (as in step 2, with the same fixed random sequence), target 5 m. The four targets: <strong>overshoot</strong> ≤ 5% — how far the highest point goes past the target, divided by 5 m; <strong>settling time</strong> ≤ 3 s — from this moment on the altitude stays within 4.75–5.25 m (5 m ± 5%); <strong>final error</strong> ≤ 0.05 m — 5 m minus the average altitude over the last second, ignoring sign; <strong>thrust jitter</strong> ≤ 3 N — the standard deviation of the thrust over the last 4 s. The first three are about the altitude, smaller is better; the fourth is about what the motors can stand, also smaller is better. The “every try” chart plots each try as a point: settling time across, overshoot up; the green box is the first two targets. Points with more than 30% overshoot sit on the top edge, and runs that never settle within 10 s sit on the right edge.',
    c5a: 'Altitude and thrust for the current setting', c5b: 'Settling time and overshoot of every try',
    preGentle: 'Preset: gentle (8, 1, 5)', preStep3: 'Preset: step 3’s gains (20, 5, 6)', preAggr: 'Preset: aggressive (40, 30, 3)', awBtn: 'Integrator clamping (step 4)', clearTries: 'Clear tries',
    chkOs: 'Overshoot {v}% (target ≤ 5%)', chkSt: 'Settling time {v} (target ≤ 3 s)', chkSs: 'Final error {v} m (target ≤ 0.05 m)', chkJ: 'Thrust jitter {v} N (target ≤ 3 N)',
    s5readout: 'Kp = {kp}, Ki = {ki}, Kd = {kd}, integrator clamping {aw}: {verdict} Settings tried so far: {c}; passing all four: {p}.',
    awOn: 'on', awOff: 'off', verdictPass: 'all four targets met.', verdictFail: 'targets still missed: {n}.',
    s5hint: 'What to watch: try the three presets first and see where each one fails — gentle is too slow and still far off at the end; step 3’s gains shake the motors too hard (Kd = 6 amplifies the noise); aggressive overshoots. Then start from step 3’s gains: lower Kd to 3–4 to calm the jitter, then reduce Kp and Ki to bring the overshoot back, and watch the point in the “every try” chart walk into the green box. More than one combination works — for example Kp = 10, Ki = 4, Kd = 3.5.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Each term watches a different stretch of time',
    s6fin: '<strong>P watches the present</strong> — how far off right now: a larger Kp means less sag and a faster response, but more bobbing. <strong>D watches the change</strong> — which way and how fast: it backs off early and tames overshoot, at the price of turning measurement noise into thrust jitter. <strong>I watches the past</strong> — how much has been owed so far: it removes the sag caused by a constant load such as gravity, at the price of overshooting when it builds up too much, and it needs clamping when the actuator hits its limit. Tuning is balancing these costs, and the answer depends on the thing being controlled: a heavier drone or a different thrust limit calls for different gains.',
    formula: 'e = r − z\nu = Kp·e + Ki·∫e dt + Kd·de/dt, then limited to 0 ≤ u ≤ 30 N',
    boundary: 'Scope: this page is a simulation of vertical motion only — mass 1 kg (adjustable in step 0), drag coefficient 1 N·s/m, thrust 0–30 N, the controller updates every 0.01 s, and the altimeter noise is independent Gaussian noise with σ = 5 mm. A real drone also has motor lag, coupling between attitude and altitude, gusts and a sagging battery voltage, and its D term is usually filtered first. The specific gains and numbers here hold for this model only and do not transfer directly to a real aircraft.',
    linksTitle: 'Keep exploring',
    lk1: 'Step response: why overshoot depends on the damping ratio alone →',
    lk2: 'Inverted pendulum: balancing a stick with P, D and I →',
    lk3: 'Laplace: tuning moves poles, and pole positions set a system’s character →',
    lk4: 'Kalman: estimate the state first, then control from it (LQG) →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Feedback Control · See the Error, Then Act”. Every curve comes from the simulation in the page.'
  }
};

let lang = 'zh';
try { const saved = localStorage.getItem('knowledge-lang'); lang = saved === 'en' || saved === 'zh' ? saved : ((typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '')) ? 'zh' : 'en'); } catch (_) { lang = (typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '')) ? 'zh' : 'en'; }

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
  if (typeof window.refreshPid === 'function') window.refreshPid();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PID_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
