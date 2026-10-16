'use strict';
/* ============================================================
   反馈与控制讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '反馈与控制 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '反馈与控制',
    tagline: '一辆双轮车，天生站不住。让它站住的不是更大的电机，而是一个每秒转几百圈的圈：量一下、算一下、推一下。这一页把这个圈一层层拆开——先让你亲手当一回控制器。',
    nav0: '0 钩子', nav1: '1 没有反馈', nav2: '2 闭环', nav3: '3 只有 P',
    nav4: '4 加上 D', nav5: '5 I 与扰动', nav6: '6 真实世界',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 反馈与控制 Feedback & Control —— 一步一交互系列',

    /* ---------- 通用读数 ---------- */
    rTheta: '倾角 θ', rOmega: '角速度', rMotor: '电机出力', rState: '状态',
    stStanding: '站立中', stWobbling: '站立（摆动中）', stFallen: '已倒下',
    stOsc: '持续摆动', stJitter: '高频抖动', stConverged: '已收敛', stOffset: '站稳但有稳态误差', stRunning: '进行中',
    btnPush: '推一把', btnKick: '踢一脚', btnStand: '扶起来', btnReset: '重置',
    cFallen: '倒了！', cDrag: '按住车身拖动，松手看它抢救',

    /* ---------- 第 0 步 ---------- */
    s0k: '第 0 步 · 先看奇迹',
    s0t: '推它，它不倒',
    s0e: '这辆双轮车没有支架，脚下也没有秘密机关。它就这么站着——你<strong>推它一把</strong>，它晃两下自己站回来。再把「控制」关掉推一次：同一辆车，立刻倒。差别只在一个看不见的圈里：传感器每秒几百次量角度，控制器算出该使多大劲，电机马上执行。这一页就把这个圈拆开看。',
    s0ctrl: '控制', s0on: '开', s0off: '关',
    s0hint: '也可以直接按住车身拖向一边，松手看它怎么把自己抢救回来——控制开着的时候，它还会跟你的手较劲。',

    /* ---------- 第 1 步 ---------- */
    s1k: '第 1 步 · 没有反馈的世界',
    s1t: '先让它倒，再亲手救它',
    s1e: '左边是控制关掉的双轮车。拖动起始角度、放手——它不会「慢慢倒」，而是<strong>越倒越快</strong>：倾角像滚雪球一样指数长大，计时器告诉你它活了多久。右边是秋千（悬挂摆）：同一条摆的方程，只是平衡点一个在山顶、一个在谷底。谷底的那个你随便推，它只是晃；山顶的这个，呼吸都是扰动。',
    s1ang: '起始角度',
    s1invIdle: '拖好角度，点「放手！」',
    s1release: '放手！',
    s1inv: '倒立摆（控制关）', s1hang: '悬挂摆（秋千）',
    s1alive: '存活', s1aliveBest: '本轮最好',
    s1hangNote: '悬挂摆：等幅摆动，不发散、不衰减（模型里没有摩擦）。',
    s1mt: '轮到你当控制器',
    s1me: '现在换你来闭环：用 <strong>◀ ▶</strong> 方向键（或按住下面的按钮）给轮子加减速，在它倒下前把车身推回竖直。目标：<strong>活过 10 秒</strong>。先说结论：你大概率撑不过几秒——不是手慢，是人的反馈环只有约 5–10 Hz（看清、判断、按下要一两百毫秒），而这根杆的倾角<strong>每约 0.16 秒就翻一倍</strong>。机器的圈每秒转 480 次，这才是它站得住的真正原因。',
    s1start: '开始挑战', s1again: '再来一次',
    s1score: '本次存活', s1best: '最好成绩',
    s1keys: '键盘 ◀ ▶ 或按住按钮；按住越久、推得越持续。',
    s1idle: '点「开始挑战」，从 3° 的小倾斜开始。',

    /* ---------- 第 2 步 ---------- */
    s2k: '第 2 步 · 把圈闭上',
    s2t: '传感器 → 控制器 → 电机 → 再回到传感器',
    s2e: '看上面的回路图：信号沿着圈跑——传感器量到角度，控制器算出该出多大的力，电机驱动轮子，车身角度改变，又被传感器量到……周而复始。下面这辆车装的正是这个圈，只是控制器里只有一条最朴素的规则：<strong>往哪边倾，就往哪边开；倾得越狠，开得越猛。</strong>拖动增益，让它先站住再说（晃，是意料之中的）。 <a class="fourier-link" href="../lti/#step2">回路里每个盒子都有自己的 h：先看系统对一记冲激的回答 →</a>',
    s2gain: '规则增益 K',
    s2reveal: '点破一下：这条「出力与倾斜程度成比例」的规则有个名字——<strong>比例控制，P</strong>。写成公式是 u = Kp·e，其中 e = 目标角度 − 当前角度（目标是竖直，0°）。车往右倾时 e 为负，u 为负，轮子就按这个符号向右加速去追倾倒的方向——方向由误差的符号自动搞定，你拖的 Kp 决定追得有多凶。后面三步，我们给它陆续加上 D 和 I。',
    cSensor: '角度传感器', cError: '误差 e', cCtrl: '控制器', cMotor: '电机', cPlant: '车身 · 倾角 θ',

    /* ---------- 第 3 步 ---------- */
    s3k: '第 3 步 · 只留 P',
    s3t: 'P：太软倒、太硬晃',
    s3e: '现在只准用 P。把 Kp 从小往大扫一遍：<strong>太小</strong>——电机追不上重力，车慢慢倒给你看；<strong>适中</strong>——站是站住了，却来回摆个不停，看下方的 θ(t) 曲线，等幅的摆动不会自己停；<strong>太大</strong>——纠正快得发疯，高频狂抖。P 的毛病一句话：它只看「现在差多少」，不看「正在往哪儿倒、倒得有多快」，所以永远在过冲的两岸横跳。',
    s3kp: 'Kp',
    s3mSoft: '太软 Kp=8', s3mMid: '适中 Kp=20', s3mHard: '过硬 Kp=70',
    s3peak: '峰值倾角（近 3 秒）',
    s3note: '本页模型没有摩擦，所以纯 P 的摆动是真的等幅、不衰减——不是画错了。真实小车上那点摩擦会让摆动慢慢收掉，但收得有多慢，取决于运气。',

    /* ---------- 第 4 步 ---------- */
    s4k: '第 4 步 · 加上 D',
    s4t: 'D：提前刹车',
    s4e: '给控制器再装一只看趋势的眼睛：<strong>D 项正比于倾角的变化率</strong>——倒得越快，刹得越狠。下方曲线里，灰色虚线是只有 P 的老样子，青色实线是同一辆车、同一组 Kp、加上 Kd 之后。点「扰动一下」同时踢两辆车一脚，再拖动 Kd，看青线怎样在几秒内躺平。',
    s4kp: 'Kp（两辆车共用）', s4kd: 'Kd',
    s4disturb: '扰动一下（同时踢两辆车）',
    s4settlePD: 'PD 收敛时间', s4settleP: 'P 收敛时间', s4notYet: '尚未收敛',
    s4note: 'Kd 也不是越大越好：它对「变化」太敏感，传感器稍微有点噪声就会被放大成抽搐——第 6 步会兑现这个伏笔。在这里先把 Kd 拉满试试：车身会变得神经质地僵硬，一有风吹草动就猛踩刹车。',
    cPonly: '只有 P', cPD: 'P + D',

    /* ---------- 第 5 步 ---------- */
    s5k: '第 5 步 · 加上 I 与扰动',
    s5t: '站得稳，还要站得直',
    s5e: '把车开上斜坡：PD 能站住，却会永远<strong>歪着一个固定的角度</strong>——这叫稳态误差：P 的出力要靠「留一点误差」来维持，就像弹簧总得压着一点才有力。打开 <strong>Ki</strong>：它把误差一笔一笔记账，攒够了就把车多推一把，直到误差被吃光、车回到真正的竖直。但 Ki 太大（试着拉过 250）会矫枉过正：积分攒过了头，车身陷入慢悠悠的大幅摆动，停不下来。',
    s5slope: '坡度', s5kp: 'Kp', s5ki: 'Ki', s5kd: 'Kd',
    s5ss: '稳态误差（近 2.5 秒平均倾角）',
    s5presetT: '实测预设（坡度 3° + 踢一脚的实测指标）',
    pSteady: '温和', pBalanced: '均衡', pSport: '运动',
    pSteadyM: '峰值 3.7° · 约 4.6 s 收敛 · 误差 0.0°',
    pBalancedM: '峰值 5.2° · 约 2.6 s 收敛 · 误差 −0.1°',
    pSportM: '峰值 5.9° · 约 0.7 s 收敛 · 误差 −0.3°',
    s5note: '三个预设不是拍脑袋写的：开发时用与本页完全相同的仿真逐个跑出来的，指标就写在按钮下面。随便改任意一个参数，预设的保证就作废——这正是调参的日常。',
    s5formulaNote: '完整公式：u = Kp·e + Ki·∫e dt + Kd·de/dt，e = 目标角度 − 当前角度。积分项带防饱和钳制：电机顶到上限时，积分不会继续无脑累积。',

    /* ---------- 第 6 步 ---------- */
    s6k: '第 6 步 · 终章',
    s6t: '真实世界，专治调好的参数',
    s6e: '第 5 步的参数已经调得很好了。现在把真实世界的三个坑一个一个打开——每一个，都专治「实验室里调好的参数」。',
    s6base: '当前参数：均衡预设 {30, 6, 6}（平地）',
    s6delay: '① 传感器延迟', s6noise: '② 测量噪声', s6sat: '③ 电机推力上限',
    s6delayNote: '信号晚到，控制器就永远在纠正「过去的姿势」：100 ms 出头开始自激振荡，150 ms 直接倒。这里的毫秒数是实打实的：延迟步数 × 仿真步长（1/480 秒）。工程解法：用模型做预测、给相位留裕度。',
    s6noiseNote: '角度读数毛毛糙糙，D 项第一个遭殃——它专盯变化，而噪声全是假变化：电机出力长满毛刺，车身高频细抖。工程解法：滤波，或者让 D 只看模型估计的变化率。',
    s6satNote: '把推力上限拉到 4 附近再踢一脚：不是控制器算不出来，是电机给不出来——再聪明的算法也变不出力气。工程解法：留裕度；接近饱和时先停积分（防饱和）。',
    s6demo: '一键演示：随机推力下活 30 秒',
    s6demoNote: '演示会先关掉三个坑，用均衡预设硬扛随机方向的推搡。',
    s6demoRun: '演示中… {t} s / 30 s', s6demoDone: '演示完成：30 秒，纹丝不倒。',
    s6fin: '收个尾：<strong>同一个圈，正在别处转着</strong>——你的体温（下丘脑是传感器、汗腺与血管是执行器）、空调、无人机的悬停、汽车的定速巡航、正在着陆的火箭，骨架全是这一页的圈：量一下、算一下、推一下。你亲手调过的 P、I、D 三个字母，就是它们的共同语言。',
    s6lkLap: '调参就是在搬极点：极点位置决定系统性格 →', s6lkKal: '先估计、再行动：卡尔曼与控制合体的 LQG →', s6lkLti: '这台机器守的两条公理：线性与时不变 →',
    s6assumpT: '本页的简化模型（如实标注）',
    s6assump: '车身看作一点质量，摆长 L = 0.5 m；无摩擦、轮子不打滑；基座加速度由电机直接给出（忽略电机与轮子自身的动力学）；坡度以「重力方向在小车坐标中偏转」建模；控制器与仿真同频 480 Hz，导数带 12 ms 低通、积分带防饱和钳制；仿真固定步长 1/480 s、半隐式欧拉积分，与屏幕刷新率无关。基座在画面中的左右移动只是出力大小的示意，不反馈进角度动力学。',
  },
  en: {
    docTitle: 'Feedback & Control · One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Feedback & Control',
    tagline: 'A two-wheeled robot is born unable to stand. What keeps it up is not a bigger motor but a loop spinning hundreds of times a second: measure, compute, push. This page takes that loop apart, layer by layer — and first, it lets you be the controller.',
    nav0: '0 Hook', nav1: '1 No feedback', nav2: '2 Closing the loop', nav3: '3 P only',
    nav4: '4 Adding D', nav5: '5 I & disturbances', nav6: '6 The real world',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Feedback & Control — one interaction at a time',

    rTheta: 'Tilt θ', rOmega: 'Angular velocity', rMotor: 'Motor output', rState: 'State',
    stStanding: 'Standing', stWobbling: 'Standing (swaying)', stFallen: 'Fallen',
    stOsc: 'Oscillating', stJitter: 'High-frequency jitter', stConverged: 'Settled', stOffset: 'Settled with offset', stRunning: 'Running',
    btnPush: 'Give it a push', btnKick: 'Kick it', btnStand: 'Stand it up', btnReset: 'Reset',
    cFallen: 'Down it goes!', cDrag: 'Drag the body sideways, let go, watch it recover',

    s0k: 'Step 0 · The trick first',
    s0t: 'Push it — it won’t fall',
    s0e: 'This two-wheeled robot has no stand and no hidden gimmick under the floor. It just stands there — <strong>give it a push</strong> and it wobbles twice and rights itself. Now switch “Control” off and push again: same robot, down instantly. The whole difference lives inside one invisible loop: a sensor measures the tilt hundreds of times a second, a controller computes how hard to push back, and the motor obeys at once. This page takes that loop apart.',
    s0ctrl: 'Control', s0on: 'On', s0off: 'Off',
    s0hint: 'You can also grab the body, drag it sideways and let go to watch it rescue itself — with control on, it will even wrestle your hand.',

    s1k: 'Step 1 · A world without feedback',
    s1t: 'Let it fall first — then save it yourself',
    s1e: 'On the left, the robot with control off. Set a starting angle and let go — it does not topple “slowly”: it falls <strong>faster and faster</strong>, the tilt growing exponentially like a snowball, while the timer tells you how long it lived. On the right, a swing (a hanging pendulum): the same pendulum equation, except one balance point sits on a hilltop and the other in a valley. Poke the valley one and it merely sways; the hilltop one treats a breath as a disturbance.',
    s1ang: 'Starting angle',
    s1invIdle: 'Set an angle, then press “Let go!”',
    s1release: 'Let go!',
    s1inv: 'Inverted pendulum (control off)', s1hang: 'Hanging pendulum (swing)',
    s1alive: 'Survived', s1aliveBest: 'Best this round',
    s1hangNote: 'The swing keeps a constant amplitude — no growth, no decay (the model has no friction).',
    s1mt: 'Your turn to be the controller',
    s1me: 'Now you close the loop: use the <strong>◀ ▶</strong> arrow keys (or hold the buttons) to speed up and slow down the wheels, pushing the body back to vertical before it falls. Goal: <strong>survive 10 seconds</strong>. Fair warning — you probably won’t last a few: not because your hands are slow, but because a human feedback loop runs at only about 5–10 Hz (seeing, deciding and pressing takes a hundred milliseconds or two), while this rod’s tilt <strong>doubles roughly every 0.16 s</strong>. The machine’s loop runs 480 times a second. That, more than anything, is why it can stand.',
    s1start: 'Start the challenge', s1again: 'Try again',
    s1score: 'You survived', s1best: 'Best',
    s1keys: 'Arrow keys ◀ ▶, or hold the buttons — the longer you hold, the harder it pushes.',
    s1idle: 'Press “Start the challenge” — you begin from a gentle 3° lean.',

    s2k: 'Step 2 · Closing the loop',
    s2t: 'Sensor → controller → motor → back to sensor',
    s2e: 'Watch the loop diagram above: the signal runs around the ring — the sensor measures the tilt, the controller computes how much force is needed, the motor drives the wheels, the tilt changes, and the sensor measures again… forever. The robot below runs exactly this loop, with the simplest rule a controller can have: <strong>lean one way, drive that way; the harder the lean, the harder the drive.</strong> Drag the gain and get it standing first (swaying is expected). <a class="fourier-link" href="../lti/#step2">Every box in the loop has its own h: start with the answer to one impulse →</a>',
    s2gain: 'Rule gain K',
    s2reveal: 'Time to name it: a rule that pushes in proportion to the error is called <strong>proportional control — P</strong>. Written out: u = Kp·e, where e = target angle − current angle (the target is upright, 0°). Lean right and e goes negative, u goes negative, and the wheels accelerate rightwards, chasing the fall — the sign of the error steers automatically; the Kp you just dragged decides how hard it chases. Over the next three steps we bolt on D, then I.',
    cSensor: 'Angle sensor', cError: 'Error e', cCtrl: 'Controller', cMotor: 'Motor', cPlant: 'Body · tilt θ',

    s3k: 'Step 3 · P only',
    s3t: 'P: too soft it falls, too hard it shakes',
    s3e: 'Now P is all you get. Sweep Kp from small to large: <strong>too small</strong> — the motor can’t outrun gravity and the robot sinks in slow motion; <strong>about right</strong> — it stands, but sways back and forth forever (watch the θ(t) strip below: a constant-amplitude wave that never dies); <strong>too large</strong> — corrections come so violently fast that it buzzes at high frequency. P’s flaw in one line: it only asks “how far off am I now?”, never “which way am I falling, and how fast?” — so it overshoots, forever, in both directions.',
    s3kp: 'Kp',
    s3mSoft: 'Too soft Kp=8', s3mMid: 'About right Kp=20', s3mHard: 'Too hard Kp=70',
    s3peak: 'Peak tilt (last 3 s)',
    s3note: 'This page’s model has no friction, so a pure-P sway is genuinely constant-amplitude — it is not drawn wrong. On a real robot, a whisper of friction would let it die out eventually, at a pace left to luck.',

    s4k: 'Step 4 · Adding D',
    s4t: 'D: braking before you arrive',
    s4e: 'Give the controller a second eye, one that watches the trend: <strong>the D term is proportional to the rate of change of the tilt</strong> — the faster it is falling, the harder it brakes. In the strip below, the grey dashed curve is P alone; the cyan curve is the same robot, same Kp, with Kd added. Press “Disturb” to kick both robots at once, then drag Kd and watch the cyan curve lie flat within seconds.',
    s4kp: 'Kp (shared by both)', s4kd: 'Kd',
    s4disturb: 'Disturb (kick both robots)',
    s4settlePD: 'PD settling time', s4settleP: 'P settling time', s4notYet: 'not settled yet',
    s4note: 'Kd is not “the bigger the better” either: it is hypersensitive to change, and the tiniest sensor noise gets amplified into twitching — step 6 will cash that cheque. For now, slam Kd to the top here: the body turns nervously rigid, slamming the brakes at every breeze.',
    cPonly: 'P only', cPD: 'P + D',

    s5k: 'Step 5 · Adding I, and a disturbance',
    s5t: 'Standing is not enough — it must stand straight',
    s5e: 'Drive the robot onto a slope: PD keeps it up, but forever <strong>leaning at one fixed angle</strong> — steady-state error. P only pushes as hard as the leftover error demands, the way a spring only pushes while it stays compressed. Now switch on <strong>Ki</strong>: it keeps a running ledger of the error, and once the ledger grows, it pushes that extra bit until the error is eaten and the robot stands truly vertical. But crank Ki too far (try past 250) and it over-corrects: the ledger overflows, and the body sinks into a slow, wide, endless sway.',
    s5slope: 'Slope', s5kp: 'Kp', s5ki: 'Ki', s5kd: 'Kd',
    s5ss: 'Steady-state error (mean tilt, last 2.5 s)',
    s5presetT: 'Measured presets (figures from a 3° slope + kick test run)',
    pSteady: 'Gentle', pBalanced: 'Balanced', pSport: 'Sport',
    pSteadyM: 'Peak 3.7° · settles ≈4.6 s · error 0.0°',
    pBalancedM: 'Peak 5.2° · settles ≈2.6 s · error −0.1°',
    pSportM: 'Peak 5.9° · settles ≈0.7 s · error −0.3°',
    s5note: 'These presets were not guessed: each was run in the exact simulation this page uses, and the measured figures are printed right under the buttons. Touch any parameter afterwards and the guarantee is void — that is everyday tuning life.',
    s5formulaNote: 'The full law: u = Kp·e + Ki·∫e dt + Kd·de/dt, with e = target angle − current angle. The integral carries an anti-windup clamp: once the motor is at its limit, the integral stops piling up.',

    s6k: 'Step 6 · Finale',
    s6t: 'The real world, picking on your tuned parameters',
    s6e: 'The parameters from step 5 are nicely tuned now. Time to open the three traps of the real world, one at a time — each of them specialises in humiliating “lab-tuned” parameters.',
    s6base: 'Parameters in use: the Balanced preset {30, 6, 6}, on flat ground',
    s6delay: '① Sensor delay', s6noise: '② Measurement noise', s6sat: '③ Motor force limit',
    s6delayNote: 'Late signals mean the controller keeps correcting a posture that has already changed: past roughly 100 ms it starts oscillating on its own, and by 150 ms it falls. The milliseconds here are honest: delay steps × the simulation step of 1/480 s. In engineering: predict with a model, and keep phase margin in reserve.',
    s6noiseNote: 'A gritty angle reading hits D first — D watches change, and noise is nothing but fake change: the motor output grows fur and the body shivers at high frequency. In engineering: filter, or let D watch a model-estimated rate instead of the raw sensor.',
    s6satNote: 'Drag the force limit down near 4 and kick it: the controller knows exactly what to do — the motor simply cannot do it. No algorithm can conjure force. In engineering: keep headroom, and freeze the integral near saturation (anti-windup).',
    s6demo: 'One-click demo: survive 30 s of random shoves',
    s6demoNote: 'The demo first switches all three traps off, then lets the Balanced preset take randomly aimed shoves.',
    s6demoRun: 'Demo running… {t} s / 30 s', s6demoDone: 'Demo complete: 30 seconds, never fell.',
    s6fin: 'To close: <strong>the same loop is spinning elsewhere</strong> — your body temperature (hypothalamus as sensor, sweat glands and blood vessels as actuators), air conditioning, a hovering drone, cruise control, a landing rocket — all share this page’s skeleton: measure, compute, push. The three letters you tuned by hand, P, I and D, are their common language.',
    s6lkLap: 'Tuning moves poles: pole locations are the system’s character →', s6lkKal: 'Estimate first, then act: LQG, where Kalman meets control →', s6lkLti: 'The two axioms this machine obeys: linearity and time-invariance →',
    s6assumpT: 'This page’s simplified model (stated honestly)',
    s6assump: 'The body is a point mass on a rod of length L = 0.5 m; no friction, no wheel slip; the base acceleration is supplied directly by the motor (motor and wheel dynamics ignored); a slope is modelled as gravity tilting inside the robot’s frame; controller and simulation both run at 480 Hz, the derivative passes a 12 ms low-pass filter and the integral has an anti-windup clamp; the simulation uses a fixed 1/480 s step with semi-implicit Euler, independent of your screen’s refresh rate. The base sliding left and right on screen only visualises the output — it does not feed back into the tilt dynamics.',
  }
};

let _lang = null;
let _langMem = 'zh';
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
document.addEventListener('DOMContentLoaded', initLangToggle);
