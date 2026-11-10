'use strict';
// Inverted-pendulum lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '反馈与控制 · 一根倒立的杆靠什么站住',
    back: '← 知识索引',
    compare: '对照另一版本：反馈与控制 · 双轮车为什么倒不下去 →',
    navLabel: '反馈与控制步骤导航',
    tagline: '双轮平衡车、手指上立着的扫帚，都是一根倒立的杆：天生往下倒，靠底下不停地挪动才站得住。这一页从「它多快倒下」出发，一项一项加上反馈：只看偏角、再看偏角变化的快慢、再管住车的位置；然后让延迟和电机极限来拆台，看每一步分别解决了什么、又留下了什么。所有曲线都由同一个模拟器算出。',
    nav0: '0 天生会倒', nav1: '1 只看偏角', nav2: '2 加上 D', nav3: '3 延迟', nav4: '4 管住位置', nav5: '5 电机极限', nav6: '6 收束',
    play: '放手（播放这一次）',
    tAxis: '时间 s',

    s0k: '第 0 步 · 不控制',
    s0t: '没人管时，它多快倒下？杆越长越难扶还是越好扶？',
    s0e: '这一步要回答：倒立的杆为什么天生站不住，倒下有多快？把车简化成一根长 L 的轻杆顶着一个质点，杆的下端连在车轮轴上。θ 是杆偏离竖直的角度（向右倾为正，单位：度）。只要偏一点，重力就把它往同一边拉得更偏：θ″ = (g/L)·sin θ，g = 9.81 m/s²——偏得越多拉得越狠，这叫<strong>不稳定平衡</strong>。小角度时 θ 大约按 e^(t/τ) 增长，<strong>时间常数</strong> τ = √(L/g)：每过 τ 秒，偏角放大约 2.7 倍。第一张图是车和杆，第二张图是偏角随时间的变化（横轴：时间 s，纵轴：θ，度），偏到 60° 算倒下；灰线是你之前试过的设置。',
    L0Label: '杆长 L（m）', th0Label: '初始偏角 θ₀（°）',
    c0a: '车与杆', c0b: '偏角 θ（横轴：时间 s；纵轴：度）',
    lgNow: '橙线：这一次', lgGhost: '灰线：之前的设置', lgFall: '红色虚线：60°，算倒下',
    s0readout: 'L = {L} m：τ = √(L/g) = {tau} s；从 {th}° 倒到 60° 用了 {tf} s，约 {n} 个 τ。{cmp}',
    s0cmp: '上一次（L = {Lp} m，同样的 θ₀）用了 {tp} s：杆长之比 {rL}，倒下时间之比 {rt}，恰好是 √{rL} = {sq}。',
    s0hint: '观察顺序：保持初始偏角不变，把 L 从 0.5 m 拖到 2 m，按「放手」：倒下时间正好变成 2 倍——按杆长的平方根变慢。所以长杆更好扶：手指上立扫帚比立铅笔容易，因为留给你反应的时间长。再只把 θ₀ 减小：倒下变慢，但只慢一点——起点每小约 2.7 倍，只多出约一个 τ。',

    s1k: '第 1 步 · 比例控制',
    s1t: '只按偏角推车，偏多少推多少，够不够？',
    s1e: '这一步要回答：最简单的反馈——杆往右倒，车就往右加速，把杆底追到质点下面——能不能让它站住？<strong>反馈</strong>就是用测到的状态决定接下来的动作。这里车的加速度 u = Kp·θ，Kp 叫<strong>比例增益</strong>（单位 m/s² 每弧度，滑杆用 g 的倍数表示）。车往右加速时，杆受到向左的惯性作用，于是小角度时 θ″ ≈ ((g − Kp)/L)·θ（L = 0.5 m，θ₀ = 5°）。Kp < g：推得不够，杆照样倒，只是慢一些；Kp > g：杆被推回来，却会冲过头，在两边来回摆，角频率 ω = √((Kp − g)/L)。',
    kpLabel: '比例增益 Kp（以 g 为单位）',
    c1b: '偏角 θ（横轴：时间 s；纵轴：度）',
    s1readout: 'Kp = {k} g = {kp} m/s² 每弧度。{state}',
    s1fell: '小于 g，推得不够：{tf} s 后倒下（不控制时是 {tf0} s）。',
    s1swing: '大于 g：杆来回摆，4 s 里最大偏角一直是 {amp}°，摆幅没有变小；周期 {per} s（小角度公式 2π/ω = {perF} s）。',
    s1hint: '观察顺序：从 Kp = 0.5 g 开始，依次试 0.9 g、1.5 g、3 g，每次按「放手」，旧曲线留成灰色。低于 g 时曲线都冲向 60°；超过 g 后变成等幅摆动，Kp 越大摆得越快，但永远停不下来——只看偏角大小的控制器不知道杆正在往哪边转。',

    s2k: '第 2 步 · 比例 + 微分',
    s2t: '再看偏角变化得多快：加上 D 项，为什么摆动就停了？',
    s2e: '这一步要回答：怎样让第 1 步的来回摆动衰减下去？让推力还跟着<strong>角速度</strong> ω = dθ/dt（偏角变化的快慢）走：u = Kp·θ + Kd·ω，Kd 叫<strong>微分增益</strong>。杆往回摆时 ω 与 θ 反号，D 项提前减小推力，相当于给摆动加了阻尼。小角度时 L·θ″ + Kd·θ′ + (Kp − g)·θ = 0，解是 e^(st) 的组合，s 取方程 L·s² + Kd·s + (Kp − g) = 0 的两个根，叫<strong>极点</strong>：实部为负表示衰减，越负衰减越快；虚部不为 0 表示振荡。常用两个数描述形状：<strong>固有角频率</strong> ωn = √((Kp − g)/L)，<strong>阻尼比</strong> ζ = Kd/(2L·ωn)（<a class="xlink" href="../../../engineering/control/step-response/#step1">→ 阶跃响应第 1 步：阻尼比决定冲过头还是慢慢爬</a>）。这里 Kp 固定为 2g、L = 0.5 m，所以 ωn ≈ 4.43 rad/s。',
    kdLabel: '微分增益 Kd（m/s² 每 rad/s）',
    c2a: '偏角 θ（横轴：时间 s；纵轴：度）', c2b: '极点（横：实部；纵：虚部；单位 1/s）',
    lgPole: '橙点：当前两个极点', lgTrail: '白点：试过的 Kd 的极点',
    s2readout: 'Kd = {kd}：ζ = {z}，极点 {poles}。{settle}',
    s2settle: '偏角进入初值的 ±2% 并不再出来，用了 {ts} s。',
    s2never: '6 s 内没有稳定到初值的 ±2% 以内。',
    s2hint: '观察顺序：把 Kd 从 0 往上加。第二张图里两个极点从虚轴上（等幅摆动）沿圆弧向左移，在实轴上会合（ζ = 1），再一左一右分开；第一张图的摆动随之变成衰减振荡、再变成不冲过头的慢慢回正。稳定时间在 ζ 约 0.7 到 1 之间最短：ζ 太小摆得久，太大回得慢。',

    s3k: '第 3 步 · 延迟',
    s3t: '传感器和电机都要时间：反应慢一点会怎样？',
    s3e: '这一步要回答：控制器看到的永远是「刚才」的偏角，延迟会不会把调好的系统拖垮？测量、计算、电机响应都要时间，合起来叫<strong>延迟</strong> Δ：车在 t 时刻的加速度按 t − Δ 时刻的 θ 和 ω 来定。这里用第 2 步 ζ = 0.7 的参数（Kp = 2g，L = 0.5 m，θ₀ = 5°），只改延迟。第一张图是偏角；第二张图每试一个延迟留一个点：横轴是延迟（ms），纵轴是第 8–10 s 里的最大偏角（倒下记作 60°）。',
    dLabel: '延迟 Δ（ms）', clearDots: '清空点',
    c3a: '偏角 θ（横轴：时间 s；纵轴：度）', c3b: '第 8–10 s 的最大偏角（横轴：延迟 ms；纵轴：度）',
    lgDot: '白点：试过的延迟', lgCrit: '红色虚线：临界延迟',
    s3readout: 'Δ = {d} ms：{state}这组参数下，延迟超过约 {crit} ms 就失稳。',
    s3ok: '摆动衰减，第 8–10 s 的最大偏角 {pk}°。',
    s3bad: '摆动不再衰减，第 8–10 s 的最大偏角 {pk}°。',
    s3fell: '{tf} s 后倒下。',
    s3hint: '观察顺序：从 0 开始逐步加大延迟，每次按「放手」。几十毫秒内几乎看不出差别；接近临界值时衰减越来越慢；越过它，摆动一圈比一圈大。推力总是晚到，D 项「提前刹车」的作用被抵消，本该减小的摆动反而被推大。常见的对策是把回路调慢一些（减小增益），代价是回正也变慢。',

    s4k: '第 4 步 · 管住位置',
    s4t: '杆站住了，车却一路开远：怎样把车也叫回来？',
    s4e: '这一步要回答：只看杆的控制器漏掉了什么？第 2 步的控制器只关心 θ 和 ω，看不见车的位置 x 和速度 v：杆扶正时车往往还带着速度，于是一直匀速开走。把 x、v 也放进反馈：u = Kp·θ + Kd·ω + Kx·x + Kv·v。四个增益怎么选？把线性化后闭环方程的四个极点都放到 −p 上（p 越大回得越快，也越费力），这叫<strong>极点配置</strong>。一个反直觉的结果：要把车开回原点，车得先往外多走一点，让杆先倒向家的方向，然后才能往回加速——否则一往回开，杆就向外倒。',
    loopOn: '位置回路：开', loopOff: '位置回路：关', sc1: '场景：倾斜 5° 起步', sc2: '场景：停在 0.5 m 处，叫回原点',
    pLabel: '极点位置 p（1/s，位置回路打开时有效）',
    c4a: '车与杆（青色旗：原点 x = 0）', c4b: '偏角 θ（横轴：时间 s；纵轴：度）', c4c: '车的位置 x（横轴：时间 s；纵轴：m）',
    lgFlag: '青色旗：原点', lgX: '青线：车的位置 x',
    s4pd1: '只用 PD：杆在 {ts} s 内扶正，但 8 s 时车在 {x} m，还在以 {v} m/s 开走。',
    s4pd2: '只用 PD：杆一直是正的，控制器什么也不做，车就停在 0.5 m——它看不见位置。',
    s4loop: '位置回路，p = {p}：Kp = {kp}，Kd = {kd}，Kx = {kx}，Kv = {kv}。8 s 时车在 {x} m。{extra}',
    s4wrong: '回原点之前，车先往外走到 {xm} m（多走 {dx} cm），杆最多倾 {th}°。',
    s4back: '车最远到 {xm} m，最后回到原点附近。',
    s4hint: '观察顺序：先关着位置回路，选「倾斜 5° 起步」：x(t) 的末段变成一条斜线——匀速开走。打开位置回路再看：x 回到 0。再选「叫回原点」，盯住 x(t) 的开头：曲线先往上翘一点，再往下走。把 p 调大，回得更快，但开头那一下反向也更明显，杆倾得更多。',

    s5k: '第 5 步 · 电机极限',
    s5t: '电机有极限：被猛推一下，还救得回来吗？',
    s5e: '这一步要回答：电机最多只能给出加速度 a_max，这给「扶得住的扰动」划了一条硬边界。车直立不动时被人推了一下，杆获得角速度 ω₀（°/s）。小角度时，正在倒下的那部分运动是 z = θ + τ·ω（τ = √(L/g)，第 0 步的时间常数）；车的加速度最多能把它往回拉 a_max/g，所以只有 |z| < a_max/g 时才有救——对直立起步的杆，就是 ω₀ < a_max/(g·τ)。这是任何控制器都越不过的线性上限。下面用第 2 步的控制器（Kp = 2g，ζ = 0.7），要求的加速度超过 a_max 时被截在 a_max，这叫<strong>饱和</strong>。第一张图是偏角；第二张图每试一组留一个点（横：a_max，纵：ω₀），虚线是线性上限，实线是这个控制器实测的边界。',
    aLabel: '电机最大加速度 a_max（m/s²）', wLabel: '推一下的角速度 ω₀（°/s）',
    c5a: '偏角 θ（横轴：时间 s；纵轴：度）', c5b: '救得回来吗？（横：a_max m/s²；纵：ω₀ °/s）',
    lgBound: '虚线：线性上限', lgMeas: '实线：实测边界', lgYes: '绿点：救回来了', lgNo: '红点：倒了',
    s5readout: 'a_max = {a} m/s²，ω₀ = {w}°/s：{state}线性上限 {wb}°/s，这个控制器实测的边界 {wm}°/s。',
    s5ok: '救回来了（最大偏角 {pk}°，电机有 {sat}% 的时间顶在极限上）。',
    s5fell: '没救回来，{tf} s 后倒下。',
    s5hint: '观察顺序：固定 a_max = 5 m/s²，把 ω₀ 从 100°/s 往上加，每次按「放手」：接近边界时电机长时间顶在极限，杆在大角度处僵持很久才回来；越过边界就倒。再换几个 a_max：推力小时实测边界几乎贴着虚线；推力大时实测边界落在虚线下方——大角度时线性分析不再准确，而且这个 PD 控制器也没有把推力用到极致。',

    s6k: '第 6 步 · 收束',
    s6t: '站住靠的是回路，不是力气',
    s6fin: '倒立的杆天生不稳定，偏角按 e^(t/τ) 放大，τ = √(L/g)，杆越长越好扶（第 0 步）。只按偏角推车，增益要超过 g 才推得回来，但会一直摆（第 1 步）；加上看角速度的 D 项，极点移到左半平面，摆动衰减，ζ 约 0.7 到 1 时最快稳住（第 2 步）。延迟把 D 项的提前量吃掉，超过临界值就失稳（第 3 步）。只管杆的控制器管不住车的位置；把 x、v 也放进反馈并配置极点，车能回家，但要先反向走一步（第 4 步）。电机有极限时，能扶住的扰动有一条任何控制器都越不过的边界（第 5 步）。',
    formula: 'θ″ = (g·sin θ − u·cos θ) / L\nu = Kp·θ + Kd·ω (+ Kx·x + Kv·v)\nτ = √(L/g)，  ω₀ < a_max / (g·τ)',
    boundary: '适用范围：模型是轻杆加质点、杆底跟着车走，电机给出要求的加速度（第 5 步之前没有上限），没有摩擦、车轮打滑和测量噪声；真实的双轮车还要考虑车身质量、电机动态和传感器噪声。临界延迟、实测边界等数值只对本页的参数成立。全部为模拟数据。',
    linksTitle: '接着去哪儿',
    lk1: '→ PID 控制第 3 步：D 不是等到了才刹，而是看见速度就提前刹',
    lk2: '→ 阶跃响应第 4 步：两个旋钮其实是复平面上的一个点',
    lk3: '→ 拉普拉斯变换第 4 步：极点位置就是系统的性格',
    lk4: '→ 卡尔曼滤波第 6 步：传感器有噪声时，先估计再控制（LQG）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《反馈与控制 · 双轮车为什么倒不下去》的平行版本。'
  },
  en: {
    pageTitle: 'Feedback & Control · What Keeps an Upside-Down Pole Standing',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Feedback & Control · Why the Two-Wheeled Bot Never Falls →',
    navLabel: 'Feedback and control steps',
    tagline: 'A two-wheeled balancing robot and a broom on your fingertip are the same thing: an upside-down pole that wants to fall and only stays up because its base keeps moving. Starting from how fast it falls, this page adds feedback one term at a time — the tilt, then how fast the tilt changes, then the cart’s position — and then lets delay and a motor limit try to break it, so you can see what each step fixes and what it leaves behind. Every curve comes from the same simulator.',
    nav0: '0 Born to fall', nav1: '1 Tilt only', nav2: '2 Add D', nav3: '3 Delay', nav4: '4 Position', nav5: '5 Motor limit', nav6: '6 Wrap-up',
    play: 'Let go (play this run)',
    tAxis: 'time s',

    s0k: 'Step 0 · No control',
    s0t: 'Left alone, how fast does it fall — and is a longer pole harder or easier to hold?',
    s0e: 'The question here: why can’t an upside-down pole stand by itself, and how fast does it go? Model the robot as a light rod of length L with a point mass on top, its lower end on the wheel axle. θ is the rod’s tilt from vertical (positive = leaning right, in degrees). Any tilt lets gravity pull it further the same way: θ″ = (g/L)·sin θ, with g = 9.81 m/s² — the further it leans, the harder it is pulled. That is an <strong>unstable equilibrium</strong>. For small angles θ grows roughly like e^(t/τ) with <strong>time constant</strong> τ = √(L/g): every τ seconds the tilt grows about 2.7-fold. The first picture shows cart and rod; the second shows the tilt over time (across: time in s; up: θ in degrees), with 60° counted as fallen. Grey lines are settings you tried before.',
    L0Label: 'Rod length L (m)', th0Label: 'Starting tilt θ₀ (°)',
    c0a: 'Cart and rod', c0b: 'Tilt θ (across: time in s; up: degrees)',
    lgNow: 'Orange: this run', lgGhost: 'Grey: earlier settings', lgFall: 'Red dashed: 60°, counted as fallen',
    s0readout: 'L = {L} m: τ = √(L/g) = {tau} s; falling from {th}° to 60° took {tf} s, about {n} τ. {cmp}',
    s0cmp: 'The previous run (L = {Lp} m, same θ₀) took {tp} s: lengths in the ratio {rL}, fall times in the ratio {rt} — exactly √{rL} = {sq}.',
    s0hint: 'What to watch: keep the starting tilt fixed, drag L from 0.5 m to 2 m and press “Let go”: the fall takes exactly twice as long — it slows with the square root of the length. That is why a long pole is easier to balance: a broom on your finger beats a pencil because it gives you more time to react. Then shrink only θ₀: the fall slows, but only a little — each 2.7-fold smaller start adds only about one τ.',

    s1k: 'Step 1 · Proportional control',
    s1t: 'Push the cart in proportion to the tilt — is that enough?',
    s1e: 'The question here: the simplest feedback — rod leans right, cart accelerates right to get back under the mass — can it hold the rod up? <strong>Feedback</strong> means using what you measure to choose what to do next. Here the cart’s acceleration is u = Kp·θ, where Kp is the <strong>proportional gain</strong> (m/s² per radian; the slider counts it in multiples of g). Accelerating right gives the rod a leftward inertial kick, so for small angles θ″ ≈ ((g − Kp)/L)·θ (L = 0.5 m, θ₀ = 5°). Kp < g: not enough push, the rod still falls, just slower. Kp > g: the rod is pushed back but overshoots and swings from side to side at angular frequency ω = √((Kp − g)/L).',
    kpLabel: 'Proportional gain Kp (in units of g)',
    c1b: 'Tilt θ (across: time in s; up: degrees)',
    s1readout: 'Kp = {k} g = {kp} m/s² per radian. {state}',
    s1fell: 'Below g, not enough push: it falls after {tf} s (without control it takes {tf0} s).',
    s1swing: 'Above g: the rod swings back and forth, its largest tilt over 4 s stays {amp}° — the swing never shrinks; period {per} s (small-angle formula 2π/ω = {perF} s).',
    s1hint: 'What to watch: start at Kp = 0.5 g and try 0.9 g, 1.5 g and 3 g, pressing “Let go” each time; old curves stay in grey. Below g every curve heads for 60°. Above g they turn into swings of constant size — faster for larger Kp, but they never stop. A controller that only looks at how far the rod leans cannot tell which way it is currently turning.',

    s2k: 'Step 2 · Proportional + derivative',
    s2t: 'Also watch how fast the tilt is changing — why does a D term stop the swinging?',
    s2e: 'The question here: how do you make the step 1 swinging die away? Let the push also follow the <strong>angular velocity</strong> ω = dθ/dt (how fast the tilt is changing): u = Kp·θ + Kd·ω, where Kd is the <strong>derivative gain</strong>. As the rod swings back, ω has the opposite sign to θ, so the D term eases off the push early — it acts as damping. For small angles L·θ″ + Kd·θ′ + (Kp − g)·θ = 0, solved by combinations of e^(st), where s takes the two roots of L·s² + Kd·s + (Kp − g) = 0: the <strong>poles</strong>. A negative real part means decay, faster the more negative; a non-zero imaginary part means oscillation. Two numbers describe the shape: the <strong>natural frequency</strong> ωn = √((Kp − g)/L) and the <strong>damping ratio</strong> ζ = Kd/(2L·ωn) (<a class="xlink" href="../../../engineering/control/step-response/#step1">→ Step response, step 1: damping ratio decides overshoot versus a slow crawl</a>). Here Kp is fixed at 2g and L = 0.5 m, so ωn ≈ 4.43 rad/s.',
    kdLabel: 'Derivative gain Kd (m/s² per rad/s)',
    c2a: 'Tilt θ (across: time in s; up: degrees)', c2b: 'Poles (across: real part; up: imaginary; 1/s)',
    lgPole: 'Orange dots: the two poles now', lgTrail: 'White dots: poles of Kd values tried',
    s2readout: 'Kd = {kd}: ζ = {z}, poles {poles}. {settle}',
    s2settle: 'The tilt entered ±2% of its start and stayed there after {ts} s.',
    s2never: 'It did not settle within ±2% of its start in 6 s.',
    s2hint: 'What to watch: raise Kd from 0. In the second plot the two poles leave the imaginary axis (steady swinging), slide left along an arc, meet on the real axis (ζ = 1) and split apart left and right. In the first plot the swinging becomes a decaying wobble, then a slow return with no overshoot. Settling is quickest for ζ between about 0.7 and 1: too small and it swings for long, too large and it creeps back.',

    s3k: 'Step 3 · Delay',
    s3t: 'Sensors and motors take time — what does a slow reaction do?',
    s3e: 'The question here: the controller always sees the tilt as it was a moment ago — can that delay wreck a well-tuned loop? Measuring, computing and the motor’s response all take time, together the <strong>delay</strong> Δ: the cart’s acceleration at time t is set from θ and ω at time t − Δ. We use the step 2 settings with ζ = 0.7 (Kp = 2g, L = 0.5 m, θ₀ = 5°) and change only the delay. The first plot is the tilt; the second leaves a dot for every delay you try: across is the delay (ms), up is the largest tilt between 8 and 10 s (a fall counts as 60°).',
    dLabel: 'Delay Δ (ms)', clearDots: 'Clear the dots',
    c3a: 'Tilt θ (across: time in s; up: degrees)', c3b: 'Largest tilt, 8–10 s (across: delay ms; up: degrees)',
    lgDot: 'White dots: delays tried', lgCrit: 'Red dashed: critical delay',
    s3readout: 'Δ = {d} ms: {state} With these settings, a delay above about {crit} ms makes it unstable.',
    s3ok: 'the swinging dies away; largest tilt between 8 and 10 s is {pk}°.',
    s3bad: 'the swinging no longer dies away; largest tilt between 8 and 10 s is {pk}°.',
    s3fell: 'it falls after {tf} s.',
    s3hint: 'What to watch: raise the delay step by step from 0, pressing “Let go” each time. A few tens of milliseconds make almost no difference; near the critical value the decay gets slower and slower; past it, each swing is bigger than the last. The push always arrives late, cancelling the D term’s early braking, so a swing that should shrink gets pushed bigger. The usual remedy is a slower loop (lower gains), at the price of a slower recovery.',

    s4k: 'Step 4 · Holding position',
    s4t: 'The rod stays up but the cart drives off — how do you call the cart back too?',
    s4e: 'The question here: what does a rod-only controller miss? The step 2 controller only cares about θ and ω; it cannot see the cart’s position x or speed v. By the time the rod is upright the cart usually still has some speed, so it keeps rolling away. Put x and v into the feedback too: u = Kp·θ + Kd·ω + Kx·x + Kv·v. How to pick four gains? Place all four poles of the linearised closed loop at −p (larger p returns faster but works harder) — this is <strong>pole placement</strong>. One counter-intuitive result: to drive back home, the cart first has to move a little further out so the rod tips towards home; only then can it accelerate back. Drive straight home and the rod falls outward.',
    loopOn: 'Position loop: on', loopOff: 'Position loop: off', sc1: 'Scene: start tilted 5°', sc2: 'Scene: parked at 0.5 m, call it home',
    pLabel: 'Pole location p (1/s, used when the position loop is on)',
    c4a: 'Cart and rod (cyan flag: origin x = 0)', c4b: 'Tilt θ (across: time in s; up: degrees)', c4c: 'Cart position x (across: time in s; up: m)',
    lgFlag: 'Cyan flag: origin', lgX: 'Cyan line: cart position x',
    s4pd1: 'PD only: the rod is upright within {ts} s, but at 8 s the cart is at {x} m and still rolling away at {v} m/s.',
    s4pd2: 'PD only: the rod is upright the whole time, so the controller does nothing and the cart stays at 0.5 m — it cannot see position.',
    s4loop: 'Position loop, p = {p}: Kp = {kp}, Kd = {kd}, Kx = {kx}, Kv = {kv}. At 8 s the cart is at {x} m. {extra}',
    s4wrong: 'Before heading home the cart first moves out to {xm} m ({dx} cm further), and the rod tilts at most {th}°.',
    s4back: 'The cart gets as far as {xm} m and ends up back near the origin.',
    s4hint: 'What to watch: with the position loop off, pick “start tilted 5°”: the end of x(t) becomes a straight slope — rolling away at constant speed. Turn the loop on and x returns to 0. Then pick “call it home” and watch the start of x(t): the curve first ticks up a little, then heads down. Raise p and it gets home faster, but that initial reverse move grows and the rod tilts more.',

    s5k: 'Step 5 · Motor limit',
    s5t: 'The motor has a limit — after a hard shove, can it still be saved?',
    s5e: 'The question here: the motor can only deliver accelerations up to a_max, and that draws a hard line around which disturbances can be caught. The robot is standing still and gets shoved, giving the rod an angular velocity ω₀ (°/s). For small angles the falling part of the motion is z = θ + τ·ω (τ = √(L/g), the step 0 time constant); the cart can pull it back by at most a_max/g, so it is only savable while |z| < a_max/g — for a rod starting upright, ω₀ < a_max/(g·τ). No controller can beat this linear bound. Below we use the step 2 controller (Kp = 2g, ζ = 0.7); any demanded acceleration beyond a_max is clipped to a_max — <strong>saturation</strong>. The first plot is the tilt; the second leaves a dot for every pair you try (across: a_max; up: ω₀). The dashed line is the linear bound, the solid line this controller’s measured limit.',
    aLabel: 'Motor’s maximum acceleration a_max (m/s²)', wLabel: 'Shove: angular velocity ω₀ (°/s)',
    c5a: 'Tilt θ (across: time in s; up: degrees)', c5b: 'Saved? (across: a_max m/s²; up: ω₀ °/s)',
    lgBound: 'Dashed: linear bound', lgMeas: 'Solid: measured limit', lgYes: 'Green: saved', lgNo: 'Red: fell',
    s5readout: 'a_max = {a} m/s², ω₀ = {w}°/s: {state} Linear bound {wb}°/s; this controller’s measured limit {wm}°/s.',
    s5ok: 'saved (largest tilt {pk}°, motor at its limit {sat}% of the time).',
    s5fell: 'not saved; it falls after {tf} s.',
    s5hint: 'What to watch: fix a_max = 5 m/s² and raise ω₀ from 100°/s, pressing “Let go” each time. Near the limit the motor sits at full output for a long time and the rod hangs at a large angle before coming back; past the limit it falls. Then try other a_max values: with a weak motor the measured limit almost touches the dashed line; with a strong one it falls below — at large angles the linear analysis is no longer accurate, and this PD controller does not squeeze every bit out of the motor.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'It stands because of the loop, not the muscle',
    s6fin: 'An upside-down rod is unstable by nature: its tilt grows like e^(t/τ), τ = √(L/g), and a longer rod is easier to hold (step 0). Pushing in proportion to the tilt needs a gain above g to push back, and then it swings for ever (step 1). Adding a D term that watches the angular velocity moves the poles into the left half-plane and the swinging dies away, fastest for ζ around 0.7 to 1 (step 2). Delay eats the D term’s head start, and past a critical value the loop goes unstable (step 3). A rod-only controller cannot hold the cart’s position; feed x and v back too and place the poles, and the cart comes home — after first stepping the wrong way (step 4). With a limited motor, the disturbances you can catch have a boundary no controller can cross (step 5).',
    formula: 'θ″ = (g·sin θ − u·cos θ) / L\nu = Kp·θ + Kd·ω (+ Kx·x + Kv·v)\nτ = √(L/g),  ω₀ < a_max / (g·τ)',
    boundary: 'Where this holds: the model is a light rod with a point mass whose base follows the cart, and the motor delivers whatever acceleration is asked (with no cap before step 5); there is no friction, wheel slip or sensor noise. A real two-wheeled robot also has body mass, motor dynamics and noisy sensors. Numbers such as the critical delay and the measured limit hold only for this page’s settings. Everything is simulated.',
    linksTitle: 'Where to go next',
    lk1: '→ PID control, step 3: D brakes early, as soon as it sees the speed',
    lk2: '→ Step response, step 4: the two knobs are really one point in the complex plane',
    lk3: '→ The Laplace transform, step 4: pole locations are the system’s character',
    lk4: '→ Kalman filtering, step 6: with noisy sensors, estimate first, then control (LQG)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Feedback & Control · Why the Two-Wheeled Bot Never Falls”.'
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
