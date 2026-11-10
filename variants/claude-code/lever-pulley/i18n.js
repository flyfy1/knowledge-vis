'use strict';
// Levers & pulleys lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '杠杆与滑轮 · 力省下来，距离要还回去',
    back: '← 知识索引',
    compare: '对照另一版本：杠杆与滑轮 · 支点挪一挪，省力见分晓 →',
    navLabel: '杠杆与滑轮步骤导航',
    tagline: '小孩能把大人翘起来，一根撬棍能撬动 800 N 的石头，一套滑轮能让人拉起比自己还重的东西。力真的能被放大吗？放大的代价是什么？七步里我们记两本账：转动看力矩，搬运看功。全页按理想情况算：不计摩擦，杠杆、绳子和滑轮都不计重量，g 取 10 N/kg。',
    nav0: '0 跷跷板', nav1: '1 撬棍', nav2: '2 功的账本', nav3: '3 定滑轮', nav4: '4 滑轮组', nav5: '5 自测', nav6: '6 收束',

    s0k: '第 0 步 · 力矩',
    s0t: '大人比小孩重一倍，怎么坐才能让跷跷板平？',
    s0e: '这一步要回答：大人 60 kg、小孩 30 kg，各坐在哪里跷跷板才会平？跷跷板绕中间的<strong>支点</strong>转动（支点是固定不动、板绕着它转的那一点）。每个人受的重力 = 质量 × 10 N/kg，竖直向下：大人 600 N，小孩 300 N。重力让板绕支点转，而且离支点越远，压得越狠。衡量这股转动效果的量叫<strong>力矩</strong> = 力 × <strong>力臂</strong>；力臂是支点到力的作用线的距离，这里力竖直向下，就是人到支点的水平距离。力矩的单位是 N·m。板自己的重量两边一样，互相抵消，不计。',
    dLSlider: '大人离支点（m）', dRSlider: '小孩离支点（m）',
    s0lgF: '箭头 = 重力（越长越大）', s0lgArm: '白色双箭头 = 力臂', s0lgBars: '下方两条 = 两边的力矩（左橙、右青）', s0lgOk: '绿色支点 = 平衡',
    c0b: '两边的力矩（N·m）', barL: '左', barR: '右',
    s0readout: '左边力矩 = 600 N × {dL} m = {ML} N·m；右边力矩 = 300 N × {dR} m = {MR} N·m。{verdict}',
    s0bal: '两边相等：板平衡。',
    s0left: '左边大 {d} N·m：板向大人那边沉。',
    s0right: '右边大 {d} N·m：板向小孩那边沉。',
    s0hint: '观察顺序：先把大人放在 1.0 m、小孩放在 2.0 m：两条力矩条一样长，板转平，支点变绿。再把任意一人往外挪一格（0.2 m）：他那边的力矩条变长，板马上向他那边沉。重的人离支点近一些，照样能平。板倾斜多少度只是示意，力矩的数字才是算出来的；板倾斜时，两边的力臂按同一比例变短，谁大谁小不变。',
    s0concl: '结论：<strong>决定板往哪边转的是力矩 = 力 × 力臂，不是力本身；两边力矩相等就平衡。</strong>（力竖直向下、按板放平时的水平距离算力臂）',

    s1k: '第 1 步 · 杠杆',
    s1t: '撬一块 800 N 的石头，支点垫在哪里最省力？能省多少？',
    s1e: '这一步要回答：同一根 1.5 m 长的撬棍，支点垫在不同位置，手要用多大的力才能撬动 800 N 的石头？一根能绕支点转动的硬杆叫<strong>杠杆</strong>，撬棍就是。手使的力叫<strong>动力</strong> F，要克服的石头重力叫<strong>阻力</strong> G；支点到手的距离叫<strong>动力臂</strong> L动，支点到石头的距离叫<strong>阻力臂</strong> L阻（力臂 = 支点到力的作用线的距离）。按上一步的力矩平衡：F × L动 = G × L阻，所以 F = G × L阻 ÷ L动。按刚好撬起、慢慢抬的平衡情况算，棍的重量不计。',
    LrSlider: '支点到石头 L阻（m）', push: '用力试试',
    s1lgF: '橙色箭头 = 手的力 F', s1lgG: '青色箭头 = 石头重力 G', s1lgArm: '双箭头 = 两段力臂', s1lgDot: '下图：每试一个位置留一个点',
    c1b: '需要的力 F（N）与 L阻（m）', armR: 'L阻', armE: 'L动',
    s1readout: 'L阻 = {Lr} m，L动 = 1.5 − {Lr} = {Le} m → F = 800 × {Lr} ÷ {Le} {eq} {F} N。对账：F × L动 = {Min} N·m，G × L阻 = {Mout} N·m。省力倍数 L动 ÷ L阻 = {gain}。{lift}',
    s1lifted: '按这个力压下去，石头被撬起来了。',
    s1hint: '观察顺序：把支点从石头旁边（0.1 m）慢慢挪到 0.5 m：上图手的箭头越来越长，下图每个试过的位置留下一个点，连成一条往上翘的曲线。支点越贴近石头，L阻 越小、L动 越大，越省力：0.1 m 时只要约 57 N。但支点放在哪里 F 都大于 0，没有「不用力」的位置。按「用力试试」，手按当前算出的 F 压下，石头被撬起。',
    s1concl: '结论：<strong>杠杆平衡：F × L动 = G × L阻。省力倍数 = L动 ÷ L阻，支点越贴近重物越省力。</strong>',

    s2k: '第 2 步 · 功',
    s2t: '省下来的那部分力，是凭空消失了吗？',
    s2e: '这一步要回答：杠杆让力变小了，是不是白占了便宜？换一本账来算：<strong>功</strong> = 力 × 沿力的方向移动的距离，单位焦耳（J）。手压撬棍做的功记作 W入 = F × s，s 是手竖直压下的距离；石头被抬高得到的功记作 W出 = G × h，h 是石头升高的高度。这里石头 800 N，支点到石头（阻力臂）固定 0.3 m，一直撬到石头升高 5 cm；可以换动力臂与阻力臂的比（力臂比）。',
    ratioN: '力臂比 {r}:1', lift2: '撬起',
    s2lgHand: '橙 = 手和它竖直压下的距离 s', s2lgRock: '青 = 石头和它升高的 h', s2lgBars: '下方两条 = 功的账本 W入、W出',
    c2b: '功的账本（J）', wIn: 'W入', wOut: 'W出',
    s2readout: '{prog}力臂比 {r}:1 → F = 800 ÷ {r} {eq} {F} N。手压下 s = {s} m，石头升高 h = {h} m（s ÷ h = {sh}）。W入 = F × s = {Win} J，W出 = G × h = {Wout} J，两本账一样多。',
    s2prog: '撬起 {k}% · ',
    s2hint: '观察顺序：按「撬起」，看撬棍转动时下面两条账本条一起变长、始终一样长。再换 4:1：力只要 200 N，可手要压下 0.2 m，是石头升高的 4 倍；换 2:1：力 400 N，手只压 0.1 m。手和石头绕支点转过同一个角度，各自竖直移动的距离和它到支点的距离成正比，所以 s ÷ h 恰好等于力臂比。两本账相等是几何上必然的，不是近似。',
    s2concl: '结论：<strong>省力必费距离：省几倍力，手就要多走几倍距离；W入 = W出，功的账本从不亏空。</strong>（理想情况：不计摩擦和棍重）',

    s3k: '第 3 步 · 定滑轮',
    s3t: '旗杆顶上那个轮子，到底省不省力？',
    s3e: '这一步要回答：绳子绕过一个轴固定不动的轮子（<strong>定滑轮</strong>）去提 200 N 的重物，手要用多大的力、拉出多长的绳？这里是理想滑轮：不计摩擦，也不计绳和轮的重量。这样一根绳子上处处拉力相等（这个拉力叫<strong>张力</strong>）：重物那一端的张力要托住 200 N，手那一端也就得拉 200 N。',
    pullDown: '竖直往下拉', pullSlant: '斜着拉（45°）', sSlider3: '拉出的绳长 s（m）',
    s3lgF: '橙色箭头 = 手的拉力', s3lgG: '青色箭头 = 重物的重力', s3lgRope: '整根绳同一种颜色 = 处处同样的张力',
    s3readout: '拉力 F = {F} N，拉出绳 s = {s} m，重物升高 h = {h} m。对照直接用手往上提：也要 200 N，手也要上移 {h} m。功：W入 = {Win} J，W出 = {Wout} J。',
    s3hint: '观察顺序：拖「拉出的绳长」，重物升高的距离和拉出的绳一样长，两个箭头一样长。换成斜着拉，箭头还是一样长：方向变了，大小没变。定滑轮的好处是人能站在地上往下拉，不用爬上去往上提。',
    s3concl: '结论：<strong>定滑轮不省力，也不省距离，只改变用力的方向。</strong>（理想滑轮）',

    s4k: '第 4 步 · 滑轮组',
    s4t: '让轮子跟着重物一起动，拉力会变成多少？',
    s4e: '这一步要回答：轴跟着重物一起移动的轮子叫<strong>动滑轮</strong>；定滑轮和动滑轮搭在一起叫<strong>滑轮组</strong>。600 N 的重物挂在下面的动滑轮框上，手要用多大的力？先数绳：直接连着下面那个框（吊着动滑轮和重物）的绳段叫<strong>承重绳段</strong>，数出来有 n 段。理想滑轮（不计摩擦、绳和滑轮的重量）的一根绳上拉力处处相等，n 段一起往上托，每段只要托 G ÷ n。本页的绕法里，手拉的那一段总是从上面的定滑轮垂下来，不连着下面的框，所以不算。',
    nSeg: '{n} 段', count: '数一数承重绳段', sSlider4: '拉出的绳长 s（m）',
    s4lgSeg: '亮色 = 承重绳段（带编号）', s4lgFree: '灰色 = 手拉的一段（不算）', s4lgBars: '下方两条 = 功的账本',
    c4b: '功的账本（J）',
    s4readout: '{prog}承重绳段 n = {n} → F = 600 ÷ {n} = {F} N。拉出 s = {s} m，重物只升高 h = s ÷ n {heq} {h} m。W入 = F × s = {Win} J，W出 = G × h = {Wout} J。',
    s4prog: '已数到第 {k} 段 · ',
    s4hint: '观察顺序：先按「数一数」，看连着下框的绳段一段段亮起并编上号，数完正好是 n。再把绳拉到底（2 m）：n = 2 时重物升 1 m，n = 4 时只升 0.5 m；拉力从 300 N 降到 150 N。下方两条账本条始终一样长。数法口诀：只数连着下面那个框的绳段，从上面垂下来给手拉的那段不算。',
    s4concl: '结论：<strong>省力倍数 = 承重绳段数 n：F = G ÷ n；代价是绳要拉出重物升高距离的 n 倍。</strong>（理想滑轮）',

    s5k: '第 5 步 · 自测',
    s5t: '三道题，答案都由页面上的同一套算式判定',
    q1: '1. 80 kg 的爸爸坐在支点左边 1.0 m，40 kg 的你坐在右边多远，跷跷板才平？',
    q2: '2. 一个滑轮组有 3 段承重绳，吊起 600 N 的重物，手要用多大的力？',
    q3: '3. 一个滑轮组有 4 段承重绳，手拉出 3 m 绳，重物升高多少？',
    optM: '{x} m', optN: '{x} N',
    q1ok: '对：800 N × 1.0 m = 400 N × d，所以 d = {x} m。',
    q1_1: '坐得一样远时，爸爸那边的力矩是你的 2 倍，板会向他沉（回看第 0 步）。',
    q1_05: '你更轻，应该坐得更远，而不是更近：力矩 = 力 × 力臂（回看第 0 步）。',
    q2ok: '对：F = 600 ÷ 3 = {x} N。',
    q2_600: '那是没有动滑轮时的拉力。3 段绳一起往上托，每段只托三分之一（回看第 4 步）。',
    q2_1800: '倍数用反了：承重段数越多越省力，不是越费力（回看第 4 步）。',
    q3ok: '对：h = 3 ÷ 4 = {x} m。省 4 倍力，就要拉出 4 倍长的绳。',
    q3_3: '那是定滑轮的情况。4 段的滑轮组省 4 倍力，重物只升拉出长度的四分之一（回看第 4 步）。',
    q3_12: '反了：手拉出的绳比重物升得多，不是少（回看第 4 步的账本）。',
    check: '核对', score: '已答对 {k}/3 题。', allRight: '三题全对！力矩账和功的账本，你都会记了。',

    s6k: '第 6 步 · 收束',
    s6t: '杠杆与滑轮的三句话',
    card1: '<strong>转动看力矩。</strong>力矩 = 力 × 力臂；两边相等就平衡：F₁ × L₁ = F₂ × L₂。',
    card2: '<strong>省力必费距离。</strong>省几倍力，就要多走几倍距离；W入 = W出，功的账本从不亏空。',
    card3: '<strong>滑轮组数段数。</strong>承重绳段 n 段：F = G ÷ n，绳要拉出 n 倍距离；定滑轮只改方向。',
    boundary: '适用范围：理想情况——不计摩擦，杠杆、绳子和滑轮都不计重量；力矩按竖直力、水平力臂算。真实机械有摩擦和自重，W入 总比 W出 大一些。斜面和轮轴也守同一本功的账本，这里不展开；功和能以后会有专门的页面。',
    linksTitle: '接着去看',
    lk1: '牛顿运动定律页第 2 步：本页不计摩擦；摩擦怎样「吃掉」一部分推力 →',
    lk2: '牛顿运动定律页第 4 步：撬棍压石头，石头也同样大地压撬棍——作用力与反作用力 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《杠杆与滑轮 · 支点挪一挪，省力见分晓》的平行版本。'
  },
  en: {
    pageTitle: 'Levers & Pulleys · Save Force, Pay It Back in Distance',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Levers & Pulleys · Move the Fulcrum, Feel the Trade →',
    navLabel: 'Levers and pulleys steps',
    tagline: 'A child can lift an adult on a seesaw, a crowbar can shift an 800 N rock, and a set of pulleys lets you hoist more than your own weight. Can force really be multiplied? What does it cost? In seven steps we keep two ledgers: torque for turning, work for lifting. Everything is ideal: no friction, weightless bars, ropes and pulleys, and g = 10 N/kg.',
    nav0: '0 Seesaw', nav1: '1 Crowbar', nav2: '2 Work ledger', nav3: '3 Fixed pulley', nav4: '4 Pulley block', nav5: '5 Check', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · TORQUE',
    s0t: 'An adult weighs twice as much as a child. Where should they sit to balance the seesaw?',
    s0e: 'The question: an adult of 60 kg and a child of 30 kg — where must each sit for the seesaw to balance? The seesaw turns about the <strong>pivot</strong> in the middle (the fixed point the board turns around). Each person’s weight is mass × 10 N/kg, straight down: 600 N for the adult, 300 N for the child. Weight turns the board about the pivot, and the further from the pivot, the harder it presses. The measure of that turning effect is <strong>torque</strong> = force × <strong>lever arm</strong>; the lever arm is the distance from the pivot to the force’s line of action — here the force is straight down, so it is the person’s horizontal distance from the pivot. Torque is measured in N·m. The board’s own weight is the same on both sides and cancels out.',
    dLSlider: 'Adult’s distance from the pivot (m)', dRSlider: 'Child’s distance from the pivot (m)',
    s0lgF: 'Arrows = weight (longer = bigger)', s0lgArm: 'White double arrows = lever arms', s0lgBars: 'Bars below = torque on each side (left orange, right cyan)', s0lgOk: 'Green pivot = balanced',
    c0b: 'Torque on each side (N·m)', barL: 'Left', barR: 'Right',
    s0readout: 'Left torque = 600 N × {dL} m = {ML} N·m; right torque = 300 N × {dR} m = {MR} N·m. {verdict}',
    s0bal: 'Equal: the board balances.',
    s0left: 'Left is bigger by {d} N·m: the board tips toward the adult.',
    s0right: 'Right is bigger by {d} N·m: the board tips toward the child.',
    s0hint: 'What to watch: put the adult at 1.0 m and the child at 2.0 m — the two torque bars match, the board levels out and the pivot turns green. Now move either person out by one notch (0.2 m): their torque bar grows and the board tips their way at once. The heavier person can balance by sitting closer. How far the board tilts is only illustrative; the torques are the computed numbers. When the board tilts, both lever arms shrink by the same factor, so which side wins does not change.',
    s0concl: 'Conclusion: <strong>what decides the turn is torque = force × lever arm, not force alone; equal torques balance.</strong> (Forces straight down; lever arms measured with the board level.)',

    s1k: 'STEP 1 · THE LEVER',
    s1t: 'To pry up an 800 N rock, where should the fulcrum go, and how much force does it save?',
    s1e: 'The question: with the same 1.5 m crowbar and the fulcrum in different places, how hard must your hand push to lift an 800 N rock? A rigid bar that turns about a fixed point is a <strong>lever</strong>; a crowbar is one. Your push is the <strong>effort</strong> F; the rock’s weight to overcome is the <strong>load</strong> G. The distance from fulcrum to hand is the <strong>effort arm</strong> L_e, and from fulcrum to rock the <strong>load arm</strong> L_r (lever arm = distance from the fulcrum to the force’s line). From last step’s torque balance: F × L_e = G × L_r, so F = G × L_r ÷ L_e. We take the just-lifting, slow and steady balance case, and ignore the bar’s weight.',
    LrSlider: 'Fulcrum to rock, L_r (m)', push: 'Push it',
    s1lgF: 'Orange arrow = your force F', s1lgG: 'Cyan arrow = rock’s weight G', s1lgArm: 'Double arrows = the two lever arms', s1lgDot: 'Lower chart: one dot per position tried',
    c1b: 'Force needed F (N) against L_r (m)', armR: 'L_r', armE: 'L_e',
    s1readout: 'L_r = {Lr} m, L_e = 1.5 − {Lr} = {Le} m → F = 800 × {Lr} ÷ {Le} {eq} {F} N. Check: F × L_e = {Min} N·m, G × L_r = {Mout} N·m. Force multiplier L_e ÷ L_r = {gain}. {lift}',
    s1lifted: 'Pushing with that force, the rock comes up.',
    s1hint: 'What to watch: slide the fulcrum from right next to the rock (0.1 m) out to 0.5 m. The hand’s arrow above grows, and each position you try leaves a dot below, tracing a curve that bends upward. The closer the fulcrum is to the rock, the shorter L_r and the longer L_e, so the less force: about 57 N at 0.1 m. But wherever the fulcrum goes, F stays above 0 — there is no “free” position. Press “Push it” and the hand pushes with the computed F; the rock lifts.',
    s1concl: 'Conclusion: <strong>a lever balances when F × L_e = G × L_r. The force multiplier is L_e ÷ L_r: the closer the fulcrum to the load, the less force you need.</strong>',

    s2k: 'STEP 2 · WORK',
    s2t: 'The force you saved — did it simply vanish?',
    s2e: 'The question: the lever made the force smaller. Did we get something for nothing? Keep a different ledger: <strong>work</strong> = force × distance moved along the force, measured in joules (J). The work your hand does pushing the bar is W_in = F × s, where s is how far your hand moves down; the work given to the rock is W_out = G × h, where h is how far the rock rises. Here the rock is 800 N, the load arm is fixed at 0.3 m, and we pry until the rock is 5 cm up; you can change the arm ratio (effort arm : load arm).',
    ratioN: 'Arm ratio {r}:1', lift2: 'Pry it up',
    s2lgHand: 'Orange = hand and the distance s it moves down', s2lgRock: 'Cyan = rock and the height h it rises', s2lgBars: 'Bars below = the work ledger W_in, W_out',
    c2b: 'The work ledger (J)', wIn: 'W_in', wOut: 'W_out',
    s2readout: '{prog}Arm ratio {r}:1 → F = 800 ÷ {r} {eq} {F} N. Hand moves down s = {s} m, rock rises h = {h} m (s ÷ h = {sh}). W_in = F × s = {Win} J, W_out = G × h = {Wout} J — the two ledgers match.',
    s2prog: 'prying {k}% · ',
    s2hint: 'What to watch: press “Pry it up” and watch the two ledger bars grow together as the bar turns — always the same length. Switch to 4:1: only 200 N, but the hand travels 0.2 m, four times the rock’s rise. Switch to 2:1: 400 N, and the hand moves just 0.1 m. Hand and rock turn through the same angle about the fulcrum, so each one’s vertical travel is proportional to its distance from the fulcrum, and s ÷ h equals the arm ratio exactly. The ledgers match by geometry, not by approximation.',
    s2concl: 'Conclusion: <strong>saving force costs distance: whatever factor of force you save, your hand travels that factor further; W_in = W_out, the work ledger never runs short.</strong> (Ideal: no friction, weightless bar.)',

    s3k: 'STEP 3 · FIXED PULLEY',
    s3t: 'The wheel at the top of a flagpole — does it save any force?',
    s3e: 'The question: run a rope over a wheel whose axle is fixed in place (a <strong>fixed pulley</strong>) to raise a 200 N load. How hard must you pull, and how much rope do you pull in? The pulley is ideal: no friction, and the rope and wheel weigh nothing. Then the pull is the same all along one rope (that pull is the <strong>tension</strong>): the load’s end must hold up 200 N, so your end must pull 200 N too.',
    pullDown: 'Pull straight down', pullSlant: 'Pull at a slant (45°)', sSlider3: 'Rope pulled in, s (m)',
    s3lgF: 'Orange arrow = your pull', s3lgG: 'Cyan arrow = the load’s weight', s3lgRope: 'One colour for the whole rope = same tension everywhere',
    s3readout: 'Pull F = {F} N, rope pulled s = {s} m, load raised h = {h} m. Compare lifting by hand: also 200 N, and your hand also rises {h} m. Work: W_in = {Win} J, W_out = {Wout} J.',
    s3hint: 'What to watch: drag “Rope pulled in” — the load rises exactly as far as the rope you pull, and the two arrows are the same length. Switch to the slanted pull: the arrows still match; the direction changed, the size did not. What a fixed pulley buys you is standing on the ground and pulling down instead of climbing up and lifting.',
    s3concl: 'Conclusion: <strong>a fixed pulley saves neither force nor distance; it only changes the direction you pull.</strong> (Ideal pulley.)',

    s4k: 'STEP 4 · PULLEY BLOCK',
    s4t: 'Let the wheels move with the load. What does the pull become?',
    s4e: 'The question: a wheel whose axle moves with the load is a <strong>movable pulley</strong>; fixed and movable pulleys together make a <strong>pulley block</strong>. A 600 N load hangs from the lower, moving frame. How hard must you pull? Count rope first: the segments attached directly to that lower frame (holding up the movable pulleys and the load) are the <strong>supporting segments</strong>; say there are n. With ideal pulleys (no friction, weightless rope and wheels) the pull is the same all along the rope, and n segments share the lifting, so each holds only G ÷ n. In the winding on this page, the end you pull always comes down off a fixed pulley at the top and is not attached to the lower frame, so it does not count.',
    nSeg: '{n} segments', count: 'Count the supporting segments', sSlider4: 'Rope pulled in, s (m)',
    s4lgSeg: 'Bright = supporting segments (numbered)', s4lgFree: 'Grey = the end you pull (not counted)', s4lgBars: 'Bars below = the work ledger',
    c4b: 'The work ledger (J)',
    s4readout: '{prog}Supporting segments n = {n} → F = 600 ÷ {n} = {F} N. Pull in s = {s} m and the load rises only h = s ÷ n {heq} {h} m. W_in = F × s = {Win} J, W_out = G × h = {Wout} J.',
    s4prog: 'counted {k} so far · ',
    s4hint: 'What to watch: press “Count” first and the segments attached to the lower frame light up one by one with numbers — the count comes out to exactly n. Then pull all the way (2 m): with n = 2 the load rises 1 m, with n = 4 only 0.5 m, while the pull drops from 300 N to 150 N. The two ledger bars below stay equal. Rule of thumb: count only the segments attached to the lower frame; the end hanging down from the top for your hand does not count.',
    s4concl: 'Conclusion: <strong>the force multiplier equals the number of supporting segments n: F = G ÷ n, and the price is pulling in n times as much rope as the load rises.</strong> (Ideal pulleys.)',

    s5k: 'STEP 5 · CHECK YOURSELF',
    s5t: 'Three questions, each judged with the same formulas the page uses',
    q1: '1. Dad (80 kg) sits 1.0 m left of the pivot. How far right must you (40 kg) sit to balance?',
    q2: '2. A pulley block has 3 supporting segments and lifts a 600 N load. How hard must you pull?',
    q3: '3. A pulley block has 4 supporting segments and you pull in 3 m of rope. How far does the load rise?',
    optM: '{x} m', optN: '{x} N',
    q1ok: 'Right: 800 N × 1.0 m = 400 N × d, so d = {x} m.',
    q1_1: 'At the same distance, Dad’s torque is twice yours and the board tips his way (see step 0).',
    q1_05: 'You are lighter, so you need to sit further out, not closer in: torque = force × lever arm (see step 0).',
    q2ok: 'Right: F = 600 ÷ 3 = {x} N.',
    q2_600: 'That is the pull with no movable pulley. Three segments share the load, so each holds a third (see step 4).',
    q2_1800: 'The factor is upside down: more supporting segments means less force, not more (see step 4).',
    q3ok: 'Right: h = 3 ÷ 4 = {x} m. Four times less force means pulling in four times as much rope.',
    q3_3: 'That is the fixed-pulley case. A 4-segment block saves 4× the force, so the load rises only a quarter of the rope pulled (see step 4).',
    q3_12: 'Backwards: the rope you pull is longer than the load’s rise, not shorter (see the ledger in step 4).',
    check: 'Check', score: '{k}/3 answered correctly.', allRight: 'All three right! You can keep both the torque ledger and the work ledger.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Levers and pulleys in three sentences',
    card1: '<strong>Turning goes by torque.</strong> Torque = force × lever arm; equal torques balance: F₁ × L₁ = F₂ × L₂.',
    card2: '<strong>Saving force costs distance.</strong> Save a factor of force, travel that factor further; W_in = W_out, the work ledger never runs short.',
    card3: '<strong>For a pulley block, count segments.</strong> With n supporting segments, F = G ÷ n and you pull n times the distance; a fixed pulley only turns the direction.',
    boundary: 'Where this holds: ideal machines — no friction, weightless bars, ropes and pulleys; torque from vertical forces and horizontal lever arms. Real machines have friction and weight, so W_in is always a little more than W_out. Ramps and wheel-and-axle obey the same work ledger — not covered here; work and energy will get a page of their own.',
    linksTitle: 'Where to go next',
    lk1: 'Newton’s laws, step 2: this page ignores friction; here is how friction “eats” part of a push →',
    lk2: 'Newton’s laws, step 4: the crowbar presses on the rock and the rock presses back just as hard — action and reaction →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Levers & Pulleys · Move the Fulcrum, Feel the Trade”.'
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
  if (typeof window.refreshLever === 'function') window.refreshLever();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
