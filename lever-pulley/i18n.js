'use strict';
/* ============================================================
   杠杆与滑轮 · 支点挪一挪，省力见分晓 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   - 数值口径：全页 g = 10 N/kg，力一律 N；力矩 N·m；功 J
   ============================================================ */
const STR = {
  zh: {
    docTitle: '杠杆与滑轮 · 支点挪一挪，省力见分晓 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '杠杆与滑轮 · 支点挪一挪，省力见分晓',
    tagline: '小力凭什么撬动大物？这一页算两本账。转动的账看力矩：力 × 力臂，两边相等就平衡——支点挪一挪，同样的重物要用的力立刻变。可省力从不是白省：功的账本两边永远相等，省几倍力就费几倍距离。到了滑轮组更干脆，不用算，数一数吊着重物的绳子段数，就知道省几倍力。全页 g 取 10 N/kg，力一律用牛顿（N）。',
    nav0: '0 跷跷板·力矩', nav1: '1 撬棍对账', nav2: '2 功的账本',
    nav3: '3 定滑轮', nav4: '4 动滑轮与滑轮组', nav5: '5 自测·终章',
    start: '开始探索 ↓',
    viewBtn: '回到默认视角',
    dragHint3d: '三维场景 · 拖动旋转视角，也可聚焦画布后用方向键',
    dragHint0: '三维场景 · 拖动旋转视角；拖板上的人也能换位置（或用下方滑杆）',
    glFail: '三维场景没能加载（浏览器未启用 WebGL，或三维库文件缺失），本页暂时无法完整显示。请换用支持 WebGL 的现代浏览器重试。',
    foot: 'visual.integ.life · 杠杆与滑轮 Levers & Pulleys —— 一步一交互系列',

    s0k: '第 0 步 · 跷跷板：力矩登场',
    s0t: '大人往支点挪一挪，就能和小孩坐平',
    s0e: '这一步要回答：<strong>大人比小孩重得多，为什么大人往支点挪一挪，两个人就能坐平？</strong>图上这块板能绕中间那个固定点转动，这个点叫<strong>支点</strong>。人坐得离支点越远就「压得越沉」——量这股转动劲的不是力本身，而是<strong>力矩 = 力 × 力臂</strong>；<strong>力臂</strong>是支点到力的作用线的距离，本页重力竖直向下，力臂就是人到支点的水平距离（图上用双向标尺画出）。拖动板上的人，或用下面的滑杆挪位置，盯住两边的力矩牌。板自重忽略不计——支点在正中，板自己的力矩两边正好抵消。',
    s0aLab: '大人位置（距支点）', s0kLab: '小孩位置（距支点）',
    s0ro: '左边：{fa} N × {da} m = <span>{ml} N·m</span>；右边：{fk} N × {dk} m = <span>{mr} N·m</span>。{verdict}',
    s0vBal: '两边力矩相等——<b>平衡！</b>重的人坐得近，照样能坐平。',
    s0vLeft: '左边力矩大 {diff} N·m，板往左边沉。把大人往支点挪，或把小孩往外挪，找一找平衡点。',
    s0vRight: '右边力矩大 {diff} N·m，板往右边沉。把小孩往支点挪，或把大人往外挪，找一找平衡点。',
    s0hint: '结论：<strong>决定转动的是力矩，不是力本身；两边力矩相等，杠杆就平衡。</strong>一个说明：图上板的倾斜角度是<strong>示意</strong>（力矩差越大、倾得越多），力矩数值是按 g = 10 N/kg 实算的。适用条件：力竖直向下（重力）、板水平时力臂就是到支点的水平距离。',
    cAdult: '大人 60 kg', cKid: '小孩 30 kg', cFulcrum: '支点',
    cBalanced: '✓ 平衡', cTorque: '力矩 {v} N·m', cN: '{v} N', cM: '{v} m',

    s1k: '第 1 步 · 撬棍：支点滑杆对账',
    s1t: '支点垫得越靠石头，手上越轻',
    s1e: '这一步要回答：<strong>撬大石头时，支点垫在哪里最省力、能省多少，能不能当场算出来？</strong>一根能绕支点转的硬杆就是<strong>杠杆</strong>，撬棍正是杠杆。你向下使的力叫<strong>动力</strong>，它的力臂叫<strong>动力臂</strong>；要克服的石头重力叫<strong>阻力</strong>，它的力臂叫<strong>阻力臂</strong>。大石重力 G = 800 N 压在棍的右端，棍长 1.5 m。拖动支点滑杆：支点在棍上一挪，两条力臂此消彼长，所需动力由平衡条件当场算出，对账表两边并排。',
    s1lrLab: '阻力臂 L阻（支点到石头）',
    s1try: '用力试试（按当前 F 撬起石头）',
    s1ro: '阻力臂 L阻 = {lr} m，动力臂 L动 = {ld} m。撬起 800 N 的大石，所需动力 F = <span>{f} N</span>：左力矩 F × L动 = {f} × {ld} = <span>{ml} N·m</span>，右力矩 G × L阻 = 800 × {lr} = <span>{mr} N·m</span>——两边相等，这就是杠杆平衡条件 <strong>F × L动 = G × L阻</strong>。省力倍数 = L动/L阻 = {ratio} 倍。',
    s1hint: '结论：<strong>支点越贴近重物，阻力臂越小、动力臂越大，越省力；省力倍数就是 L动/L阻。</strong>但支点滑到最贴近石头，F 也只是变小，永远大于 0——没有不用力的杠杆。适用条件：静止或匀速撬起的平衡口径，棍自重忽略。',
    cStone800: '大石 G = 800 N', cHand: '手', cLd: '动力臂 {v} m', cLr: '阻力臂 {v} m',
    cLiftArc: '石头沿弧线抬起 {v} m',

    s2k: '第 2 步 · 省力必费距离：功的账本',
    s2t: '力省下的那一份，距离得补回来',
    s2e: '这一步要回答：<strong>力省掉的那一部分，是不是凭空消失了？</strong>先认一个新账目：<strong>功 = 力 × 沿力方向移动的距离</strong>，单位焦耳（J）。还是这根撬棍（石头 G = 600 N），先选一档力臂比，再按「撬起」：撬棍转过一个固定角度，手端沿弧线压下的距离 s 与石头被抬起的弧长 h，都由「力臂 × 转角」当场算出。下方两条「功账本」会同步变长：手做的功 W入 = F × s，石头得到的功 W出 = G × h——盯住看它们是不是严丝合缝一样长。',
    s2ratioLab: '力臂比（动力臂 : 阻力臂）',
    s2play: '▶ 撬起', s2replay: '再撬一次',
    s2ledgerIn: '手做的功 W入 = F × s', s2ledgerOut: '石头得到的功 W出 = G × h',
    s2ro: '动力臂 {ld} m、阻力臂 {lr} m → 动力 F = <span>{f} N</span>。手压下 s = {s} m，石头抬起 h = {h} m：W入 = {f} × {s} = <span>{win} J</span>，W出 = 600 × {h} = <span>{wout} J</span>——两本账分毫不差。',
    s2hint: '结论：<strong>省力必费距离——省力倍数是几，手移动的距离就是几倍；W入 = W出，功的账本从不亏空。</strong>为什么必然相等：同一个转角下，弧长 = 力臂 × 转角，弧长之比就是力臂之比，与力之比正好倒过来相抵——这是几何必然，不是近似。适用条件：理想口径（不计摩擦与棍自重）。',
    cStone600: '石头 G = 600 N', cArcS: 's = {v} m', cArcH: 'h = {v} m',

    s3k: '第 3 步 · 定滑轮：只改方向',
    s3t: '井口那个轮子，一分力都不省',
    s3e: '这一步要回答：<strong>井口、旗杆顶上那个轮子，到底省不省力？</strong>轴固定不动的滑轮叫<strong>定滑轮</strong>。绳的一端吊着重物（G = 200 N），另一端用手拉。拉绳滑杆控制拉出的绳长 s，看重物升起的高度 h；再切换拉的方向（竖直下拉 / 斜向拉），盯住拉力 F 变不变。整条绳用同一种颜色、同一粗细画：理想绳里的张力处处相等（不计摩擦与绳重）。',
    s3down: '竖直下拉', s3diag: '斜向拉',
    s3sLab: '拉出的绳长 s',
    s3ro: '用定滑轮：拉力 F = <span>{f} N</span>，拉出绳长 s = {s} m，重物升起 h = {h} m。<br>对照基线——不用滑轮、直接用手提：F 同样是 200 N，手提多高、重物升多高，s 与 h 一点不差。',
    s3hint: '结论：<strong>定滑轮不省力、不省距离，只改变力的方向。</strong>它值钱的地方正在方向：人可以站在地上往下拉、借上自己的体重，不必爬到高处去抱重物。适用条件：理想滑轮（不计摩擦、绳重）；拉力沿绳任意方向，大小都不变。',
    cWeight200: '重物 G = 200 N', cPullDown: '向下拉', cPullDiag: '斜着拉',

    s4k: '第 4 步 · 动滑轮与滑轮组：数段数定倍数',
    s4t: '轮子跟着重物走，力就分给了几段绳',
    s4bridge: '先数真正吊着动滑轮的绳段，再看 F=G/n：段数越多越省力，但同样绳长让重物升得更少。',
    s4bridge: 'Count the rope sections supporting the moving pulley, then read F=G/n: more sections mean less force, but less lift for the same rope length.',
    s4e: '这一步要回答：<strong>滑轮的轴跟着重物一起动，会怎样？</strong>轴随重物一起移动的滑轮叫<strong>动滑轮</strong>，定、动滑轮搭配成的组合叫<strong>滑轮组</strong>。诀窍只有一句：直接吊着动滑轮与重物的那几段绳，叫<strong>承重绳段</strong>——有几段一起分担，拉力就是总重的几分之一。图上高亮的就是承重段，点「逐段数一数」让它们逐段亮起。先看单个动滑轮，再切滑轮组换段数。（理想口径：不计摩擦、动滑轮自重与绳重。）',
    s4mSingle: '单个动滑轮', s4mGroup: '滑轮组',
    s4nLab: '承重绳段数 n', s4n2: '2 段', s4n3: '3 段', s4n4: '4 段',
    s4count: '逐段数一数',
    s4sLab: '拉绳长度 s',
    s4roA: '单个动滑轮：G = 400 N，承重绳段 n = 2，拉力 F = <span>{f} N</span>，正好是总重的一半。拉绳 s = {s} m，重物升 h = {h} m；功的账本再对一次：W入 = {f} × {s} = <span>{win} J</span>，W出 = 400 × {h} = <span>{wout} J</span>——还是分毫不差。',
    s4roB: '滑轮组：G = 600 N，承重绳段 n = {n}，拉力 F = <span>{f} N</span>。拉绳 s = {s} m，重物升 h = {h} m；W入 = <span>{win} J</span>，W出 = <span>{wout} J</span>，账本照样相等。段数越多，F 越小、同样拉绳下 h 越矮。',
    s4countRo: '数完了：承重绳段共 <b>{n} 段</b>——省力倍数就是 {n} 倍，F = G/{n}。',
    s4ropeNote: '绳长守恒，看得见：手拉出多少绳，几段承重绳就总共缩短多少（每段缩短 h = s/n），手与绳端随拉出的长度一起移动——图上绳子一分不多、一分不少。',
    s4hint: '结论：<strong>省力倍数 = 承重绳段数 n：F = G/n，代价是拉绳距离变成 n 倍（h = s/n）。</strong>数段数口诀：只数图上高亮的、直接挂着动滑轮与重物的段。本页绕法里，偶数段的自由端从动滑轮向上出绳（这段也承重、要数），奇数段的自由端从定滑轮垂下来（不挂重物、不数）。适用条件：理想口径（不计摩擦、动滑轮自重与绳重）。',
    cWeight400: '重物 G = 400 N', cWeight600: '重物 G = 600 N', cAnchor: '固定端', cFreeUp: '拉力 F ↑', cFreeDown: '拉力 F ↓',

    s5k: '第 5 步 · 自测 + 终章',
    s5t: '三道题验三本账，再把账收齐',
    s5e: '三道题的答案都藏在前四步的账里：力矩平衡、数段数、费距离。答对锁定，答错会给你指回对应的那一步。',
    s5q1: '① 跷跷板：80 kg 的爸爸坐在支点左侧 1.0 m 处，40 kg 的你坐在右侧多远，能平衡？',
    s5q1o0: '1.0 m', s5q1o1: '1.6 m', s5q1o2: '2.0 m',
    s5q1hint: '提示：回第 0 步对账——先算爸爸那边的力矩（80×10×1.0），你这边的力是 40×10 N，力臂要让两边力矩相等。',
    s5q1why: '爸爸的力矩 = 800 N × 1.0 m = 800 N·m；你的力是 400 N，力臂 = 800 ÷ 400 = 2.0 m，力矩相等就平衡。',
    s5q2: '② 滑轮组：3 段承重绳吊着 600 N 的重物，拉力多大？',
    s5q2o0: '150 N', s5q2o1: '200 N', s5q2o2: '300 N',
    s5q2hint: '提示：回第 4 步数段数——拉力 F = G/n，n 就是承重绳段数。',
    s5q2why: 'F = G/n = 600 ÷ 3 = 200 N——三段绳一起分担总重。',
    s5q3: '③ 手拉出 3 m 绳，4 段滑轮组，重物升多高？',
    s5q3o0: '0.75 m', s5q3o1: '1.25 m', s5q3o2: '12 m',
    s5q3hint: '提示：回第 4 步看代价——h = s/n，段数越多，同样的拉绳长度升得越少。',
    s5q3why: 'h = s/n = 3 ÷ 4 = 0.75 m——省力 4 倍，就要费 4 倍的绳。',
    s5ok: '✓ 答对了。', s5no: '✗ 不对。', s5idle: '点一个选项作答。',
    s5hint: '三题对账完毕：<strong>2.0 m / 200 N / 0.75 m</strong>——分别是力矩平衡、数段数、费距离这三本账的应用题。',
    c1h: '力矩平衡',
    c1: '转动的账看力矩：两边 <strong>F × L 相等</strong>就平衡（F₁L₁ = F₂L₂）。支点挪一挪、力臂变一变，同样重的物体要用的力立刻不同——大人往支点坐近些，就能和小孩坐平。',
    c2h: '省力必费距离',
    c2: '功的账本两边永远相等：<strong>W入 = W出</strong>。省几倍力，就费几倍距离。任何「省力神器」先拿这本账核对：多出来的功，不存在。',
    c3h: '数段数定倍数',
    c3: '滑轮组不用背公式：数承重绳段数 n，拉力就是 <strong>F = G/n</strong>，代价是拉绳 n 倍距离。定滑轮是特例：一段绳、只改方向，一分力不省。',
    s5fin: '从跷跷板到滑轮组，用的是同一套账：力矩管平衡、功管总量、段数管分担。同族的还有斜面与轮轴——在那里，省下的力照样要拿距离来还。等以后学到「功与能」的专页，这本账还会接着往下记：能量，就是这本账的总账名。'
  },
  en: {
    docTitle: 'Levers & Pulleys · Move the Fulcrum, Feel the Trade — One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Levers & Pulleys · Move the Fulcrum, Feel the Trade',
    tagline: 'How can a small force lift a huge weight? This page keeps two ledgers. The turning ledger is torque: force × lever arm — when both sides match, the lever balances, and sliding the fulcrum changes the force you need at once. But saved force is never free: the work ledger always balances, so every multiple of force saved costs the same multiple of distance. For pulley systems it is even simpler — do not compute, just count the rope segments holding the load. Throughout, g = 10 N/kg and forces are in newtons (N).',
    nav0: '0 Seesaw · Torque', nav1: '1 Pry Bar Ledger', nav2: '2 The Work Ledger',
    nav3: '3 Fixed Pulley', nav4: '4 Movable Pulleys & Systems', nav5: '5 Quiz · Finale',
    start: 'Start exploring ↓',
    viewBtn: 'Reset view',
    dragHint3d: '3D scene · Drag to orbit, or focus the canvas and use the arrow keys',
    dragHint0: '3D scene · Drag to orbit; you can also drag a rider on the board to move them (or use the sliders below)',
    glFail: 'The 3D scenes could not load (WebGL is unavailable, or the library files are missing), so this page cannot display in full. Please retry in a modern WebGL-capable browser.',
    foot: 'visual.integ.life · Levers & Pulleys —— One Interaction per Step series',

    s0k: 'Step 0 · The Seesaw: Torque Enters',
    s0t: 'The adult scoots toward the fulcrum — and balances the child',
    s0e: 'This step answers one question: <strong>an adult weighs far more than a child — why does scooting toward the pivot let the two balance?</strong> The board turns about the fixed point in the middle, called the <strong>fulcrum</strong>. The farther out someone sits, the “heavier” they press — and what measures that turning push is not force alone but <strong>torque = force × lever arm</strong>. The <strong>lever arm</strong> is the distance from the fulcrum to the line of the force; here gravity pulls straight down, so the arm is simply the horizontal distance to the fulcrum (drawn as a double-headed ruler). Drag the people on the board, or use the sliders, and watch the two torque badges. The board’s own weight is ignored — with the fulcrum dead centre, its torque cancels on the two sides.',
    s0aLab: 'Adult position (distance to fulcrum)', s0kLab: 'Child position (distance to fulcrum)',
    s0ro: 'Left: {fa} N × {da} m = <span>{ml} N·m</span>; right: {fk} N × {dk} m = <span>{mr} N·m</span>. {verdict}',
    s0vBal: 'The two torques are equal — <b>balanced!</b> The heavier person sits closer, and it still levels out.',
    s0vLeft: 'The left torque is bigger by {diff} N·m, so the board sinks left. Scoot the adult inward, or the child outward, and hunt for the balance point.',
    s0vRight: 'The right torque is bigger by {diff} N·m, so the board sinks right. Scoot the child inward, or the adult outward, and hunt for the balance point.',
    s0hint: 'Conclusion: <strong>turning is decided by torque, not by force alone; equal torques on the two sides mean balance.</strong> One note: the board’s tilt angle on screen is <strong>schematic</strong> (a bigger torque gap tilts it more), while every torque number is truly computed at g = 10 N/kg. Conditions: forces vertical (gravity), and with the board level the arm is the horizontal distance to the fulcrum.',
    cAdult: 'Adult 60 kg', cKid: 'Child 30 kg', cFulcrum: 'fulcrum',
    cBalanced: '✓ Balanced', cTorque: 'torque {v} N·m', cN: '{v} N', cM: '{v} m',

    s1k: 'Step 1 · Pry Bar: The Fulcrum Ledger',
    s1t: 'Pad the fulcrum closer to the stone, and your hand feels it',
    s1e: 'This step answers: <strong>when prying a boulder, where should the fulcrum go to save the most force — and can the saving be computed on the spot?</strong> A stiff bar that turns about a fulcrum is a <strong>lever</strong>, and a pry bar is one. The force you push down with is the <strong>effort</strong>, its arm the <strong>effort arm</strong>; the boulder’s weight you must overcome is the <strong>resistance</strong>, its arm the <strong>resistance arm</strong>. The boulder weighs G = 800 N and presses on the right end of a 1.5 m bar. Drag the fulcrum slider: as the fulcrum slides, the two arms trade length, the needed effort is computed live from the balance condition, and the ledger shows both sides side by side.',
    s1lrLab: 'Resistance arm Lres (fulcrum to stone)',
    s1try: 'Try it (pry with the current F)',
    s1ro: 'Resistance arm Lres = {lr} m, effort arm Leff = {ld} m. To lift the 800 N boulder you need effort F = <span>{f} N</span>: left torque F × Leff = {f} × {ld} = <span>{ml} N·m</span>, right torque G × Lres = 800 × {lr} = <span>{mr} N·m</span> — equal, which is exactly the lever balance condition <strong>F × Leff = G × Lres</strong>. Force saved: Leff/Lres = {ratio}×.',
    s1hint: 'Conclusion: <strong>the closer the fulcrum hugs the load, the smaller the resistance arm and the longer the effort arm — the more force you save; the saving multiple is Leff/Lres.</strong> But slide the fulcrum until it hugs the stone and F only shrinks — it never reaches zero. There is no effort-free lever. Conditions: the balance bookkeeping of rest or steady prying; the bar’s own weight ignored.',
    cStone800: 'Boulder G = 800 N', cHand: 'hand', cLd: 'effort arm {v} m', cLr: 'resistance arm {v} m',
    cLiftArc: 'stone rises {v} m along its arc',

    s2k: 'Step 2 · Saving Force Costs Distance: The Work Ledger',
    s2t: 'Whatever force you save, distance pays back',
    s2e: 'This step answers: <strong>the part of the force that vanished — did it really disappear for free?</strong> First, a new ledger entry: <strong>work = force × distance moved along the force</strong>, measured in joules (J). Same pry bar (stone G = 600 N): pick an arm ratio, then press “Pry”. The bar turns through one fixed angle; the distance s your hand travels along its arc and the arc length h the stone is lifted are both computed live as “arm × angle”. Below, two “work ledger” bars grow together: the work you put in, Win = F × s, and the work the stone gains, Wout = G × h — watch whether they end up exactly the same length.',
    s2ratioLab: 'Arm ratio (effort arm : resistance arm)',
    s2play: '▶ Pry it up', s2replay: 'Pry again',
    s2ledgerIn: 'Work in Win = F × s', s2ledgerOut: 'Work out Wout = G × h',
    s2ro: 'Effort arm {ld} m, resistance arm {lr} m → effort F = <span>{f} N</span>. Hand presses s = {s} m, stone rises h = {h} m: Win = {f} × {s} = <span>{win} J</span>, Wout = 600 × {h} = <span>{wout} J</span> — the two ledgers match to the last digit.',
    s2hint: 'Conclusion: <strong>saving force always costs distance — save N× the force and your hand travels N× as far; Win = Wout, the work ledger never runs a deficit.</strong> Why it must balance: for one shared angle, arc length = arm × angle, so the arc ratio is the arm ratio — exactly the inverse of the force ratio. It is geometry, not approximation. Conditions: the ideal ledger (no friction, no bar weight).',
    cStone600: 'Stone G = 600 N', cArcS: 's = {v} m', cArcH: 'h = {v} m',

    s3k: 'Step 3 · The Fixed Pulley: Direction Only',
    s3t: 'The wheel at the well mouth saves no force at all',
    s3e: 'This step answers: <strong>that wheel at the well mouth or flagpole top — does it actually save any force?</strong> A pulley whose axle stays fixed is a <strong>fixed pulley</strong>. One end of the rope holds the load (G = 200 N), the other end is in your hand. The rope slider sets how much rope s you pull out; watch the height h the load rises. Then switch the pull direction (straight down / at an angle) and watch whether the pull force F changes. The whole rope is drawn in one colour and one thickness: in an ideal rope the tension is the same everywhere (no friction, no rope weight).',
    s3down: 'Pull straight down', s3diag: 'Pull at an angle',
    s3sLab: 'Rope pulled out, s',
    s3ro: 'With the fixed pulley: pull force F = <span>{f} N</span>, rope pulled s = {s} m, load rises h = {h} m.<br>Baseline for comparison — lifting directly by hand, no pulley: F is still 200 N, and the load rises exactly as far as your hand lifts it; s and h match to the digit.',
    s3hint: 'Conclusion: <strong>a fixed pulley saves neither force nor distance — it only changes the direction of the force.</strong> That direction is exactly what it is worth: you can stand on the ground and pull down, lending your own body weight, instead of climbing up to hug the load. Conditions: ideal pulley (no friction, no rope weight); the pull may point along the rope in any direction, its size never changes.',
    cWeight200: 'Load G = 200 N', cPullDown: 'pull down', cPullDiag: 'angled pull',

    s4k: 'Step 4 · Movable Pulleys & Systems: Count the Segments',
    s4t: 'When the wheel travels with the load, the force is shared by segments',
    s4e: 'This step answers: <strong>what changes when the pulley’s axle moves together with the load?</strong> A pulley whose axle travels with the load is a <strong>movable pulley</strong>; fixed and movable pulleys combined make a <strong>pulley system</strong>. The whole trick is one sentence: the rope segments that directly hold up the movable pulley and the load are the <strong>load-bearing segments</strong> — with that many segments sharing, the pull is that fraction of the total weight. The highlighted segments in the picture are the load-bearing ones; press “Count them one by one” to light them up in turn. Start with a single movable pulley, then switch to the system and change the count. (Ideal bookkeeping: no friction, no movable-pulley or rope weight.)',
    s4mSingle: 'Single movable pulley', s4mGroup: 'Pulley system',
    s4nLab: 'Load-bearing segments n', s4n2: '2 segments', s4n3: '3 segments', s4n4: '4 segments',
    s4count: 'Count them one by one',
    s4sLab: 'Rope pulled, s',
    s4roA: 'Single movable pulley: G = 400 N, load-bearing segments n = 2, pull force F = <span>{f} N</span> — exactly half the weight. Rope pulled s = {s} m, load rises h = {h} m; the work ledger once more: Win = {f} × {s} = <span>{win} J</span>, Wout = 400 × {h} = <span>{wout} J</span> — still matching to the digit.',
    s4roB: 'Pulley system: G = 600 N, load-bearing segments n = {n}, pull force F = <span>{f} N</span>. Rope pulled s = {s} m, load rises h = {h} m; Win = <span>{win} J</span>, Wout = <span>{wout} J</span> — the ledger balances as always. More segments: smaller F, and less rise for the same pull.',
    s4countRo: 'Counted: <b>{n} load-bearing segments</b> in total — the saving multiple is {n}×, F = G/{n}.',
    s4ropeNote: 'Rope length is conserved, visibly: however much rope the hand pulls out, the load-bearing segments shorten by exactly that amount in total (each by h = s/n), and the hand travels with the rope end — the rope on screen is never a bit longer or shorter.',
    s4hint: 'Conclusion: <strong>the saving multiple equals the number of load-bearing segments n: F = G/n, paid for with n× the rope distance (h = s/n).</strong> The counting rule: count only the highlighted segments that directly hold the movable pulley and its load. In this page’s winding, an even count sends the free end up out of the movable pulley (that segment bears load — count it), while an odd count lets the free end hang from a fixed pulley (it holds no load — do not count it). Conditions: ideal bookkeeping (no friction, no movable-pulley or rope weight).',
    cWeight400: 'Load G = 400 N', cWeight600: 'Load G = 600 N', cAnchor: 'fixed end', cFreeUp: 'pull F ↑', cFreeDown: 'pull F ↓',

    s5k: 'Step 5 · Self-Test + Finale',
    s5t: 'Three questions for three ledgers, then settle the accounts',
    s5e: 'Every answer hides in the ledgers of the first four steps: torque balance, segment counting, the distance cost. A correct answer locks; a wrong one points you back to the step that holds the key.',
    s5q1: 'Q1. Seesaw: your 80 kg dad sits 1.0 m to the left of the fulcrum. You weigh 40 kg — how far to the right must you sit to balance?',
    s5q1o0: '1.0 m', s5q1o1: '1.6 m', s5q1o2: '2.0 m',
    s5q1hint: 'Hint: go back to Step 0 and balance the ledger — first compute dad’s torque (80×10×1.0); your force is 40×10 N, and your arm must make the two torques equal.',
    s5q1why: 'Dad’s torque = 800 N × 1.0 m = 800 N·m; your force is 400 N, so your arm = 800 ÷ 400 = 2.0 m — equal torques balance.',
    s5q2: 'Q2. Pulley system: 3 load-bearing segments hold a 600 N load. How big is the pull force?',
    s5q2o0: '150 N', s5q2o1: '200 N', s5q2o2: '300 N',
    s5q2hint: 'Hint: go back to Step 4 and count segments — the pull is F = G/n, with n the number of load-bearing segments.',
    s5q2why: 'F = G/n = 600 ÷ 3 = 200 N — three segments share the weight.',
    s5q3: 'Q3. You pull out 3 m of rope on a 4-segment system. How high does the load rise?',
    s5q3o0: '0.75 m', s5q3o1: '1.25 m', s5q3o2: '12 m',
    s5q3hint: 'Hint: go back to Step 4 and check the cost — h = s/n; more segments, less rise for the same rope.',
    s5q3why: 'h = s/n = 3 ÷ 4 = 0.75 m — saving 4× the force costs 4× the rope.',
    s5ok: '✓ Correct. ', s5no: '✗ Not quite. ', s5idle: 'Tap an option to answer.',
    s5hint: 'All three settled: <strong>2.0 m / 200 N / 0.75 m</strong> — one application each of the torque ledger, the segment count, and the distance cost.',
    c1h: 'Torque balance',
    c1: 'The turning ledger is torque: when <strong>F × L matches on both sides</strong> (F₁L₁ = F₂L₂), the lever balances. Move the fulcrum, change an arm, and the force needed for the same load changes at once — the adult scoots in and balances the child.',
    c2h: 'Saved force costs distance',
    c2: 'The work ledger always balances: <strong>Win = Wout</strong>. Save N× the force, pay N× the distance. Check any “effort-saving gadget” against this ledger first: extra work does not exist.',
    c3h: 'Count segments, get the multiple',
    c3: 'No formula to memorise for pulley systems: count the load-bearing segments n and the pull is <strong>F = G/n</strong>, paid for with n× the rope. The fixed pulley is the special case: one segment, direction only, no force saved at all.',
    s5fin: 'From the seesaw to the pulley system it is one set of books: torque rules balance, work rules the total, segments rule the sharing. The inclined plane and the wheel-and-axle are family too — there, the saved force is likewise repaid in distance. When you later meet the page on work and energy, this same ledger continues: energy is simply the name of its grand total.'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
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
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
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
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
