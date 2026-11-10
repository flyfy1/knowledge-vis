'use strict';
// Periodic trends lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '元素周期律 · 外层电子感到多大的核',
    back: '← 知识索引',
    compare: '对照另一版本：元素周期律 · 周期表上的渐变 →',
    navLabel: '元素周期律步骤导航',
    tagline: '把原子半径、电离能、电负性涂到周期表上，会看到清楚的渐变：往右越来越「紧」，往下越来越「松」。为什么？本页用一个能算的解释——外层电子实际感到的核电荷，也就是有效核电荷——把三种性质的走向串起来，再看清它在哪几处被例外打破，最后让你先预测、后用数据检验。',
    nav0: '0 热图', nav1: '1 沿周期', nav2: '2 电离能的台阶', nav3: '3 沿族向下', nav4: '4 预测与检验', nav5: '5 收束',
    prop_r: '原子半径', prop_ie: '第一电离能', prop_en: '电负性',
    propIn_r: '原子半径', propIn_ie: '第一电离能', propIn_en: '电负性',
    unit_r: ' pm', unit_ie: ' kJ/mol', unit_en: '',
    none: '无数据',

    s0k: '第 0 步 · 热图',
    s0t: '三种性质涂到周期表上，各是什么样的渐变？',
    s0e: '这一步要回答：原子半径、电离能、电负性在周期表上是不是乱的？表里是第 1 到第 5 <strong>周期</strong>（横行，电子层数相同；电子怎样分层见 <a class="xlink" href="../../../chemistry/matter/atomic-structure/#step2">→ 原子结构页第 2 步</a>）的主族元素，按<strong>族</strong>（竖列，外层电子数相同）排好。三种性质：<strong>原子半径</strong>取共价半径，即两个同种原子成键时核间距的一半（pm，1 pm = 10⁻¹² m）；<strong>第一电离能</strong>是把气态原子最外面一个电子拿走所需的能量（kJ/mol），越大越难拿走；<strong>电负性</strong>是原子在化学键里争夺共用电子的本事（鲍林标度，没有单位），越大越能抢。稀有气体几乎不成键，本页不给它们半径和电负性，格子显示为灰色。',
    c0a: '主族元素周期表（颜色 = 所选性质）', c0title: '主族元素周期表（颜色 = 所选性质）· {prop}',
    s0readout: '{name}（{sym}，Z = {Z}，第 {p} 周期第 {g} 族）：原子半径 {r} · 第一电离能 {ie} · 电负性 {en}。',
    s0scale: '颜色从深蓝（小）到黄（大）：{lo} – {hi}',
    elSlider: '选元素（也可点格子）',
    s0hint: '观察顺序：先按「原子半径」，看颜色：每一竖列从上往下变亮（变大），最大的在左下角；第 2、3 周期从左往右一路变深（变小），第 4、5 周期在左半段缩得很快，右半段几乎持平（相差 1–2 pm）。再按「第一电离能」和「电负性」：两者的颜色方向都和半径相反，右上角最大。再用滑杆或点格子逐个看数值：同一横行里有几处没有严格按顺序变，后面第 2、3 步专门看。',

    s1k: '第 1 步 · 沿周期',
    s1t: '同一周期从左到右，原子为什么反而变小？',
    s1e: '这一步要回答：从 Li 到 F，原子核里多了 6 个质子、外面多了 6 个电子，原子却从 128 pm 缩到 57 pm，为什么？关键是外层电子实际感到的吸引。内层电子挡在核和外层电子之间，抵消掉一部分核电荷，这叫<strong>屏蔽</strong>；外层电子感到的净电荷叫<strong>有效核电荷</strong> Zeff = Z − S，S 是屏蔽常数。<strong>斯莱特规则</strong>是一个经验估算：同一层的其他电子每个屏蔽 0.35，内一层的每个屏蔽 0.85，更内层的每个屏蔽 1。同一周期往右，每多 1 个质子，新增电子在同一层、只挡掉 0.35，所以 Zeff 每步约加 0.65，外层被拉得更紧。模型再假设半径 r ∝ n*²/Zeff（n* 是有效主量子数，第 2、3 周期就是层数 2、3，第 4、5 周期取 3.7、4.0），比例常数用全部 29 个有半径的元素一起拟合。',
    perSlider: '周期', grpSlider: '族内位置（从左数第几个）',
    c1a: '原子示意：橙色 = 最外层电子', c1b: '共价半径：实测与模型（pm）',
    s1lgData: '实测共价半径', s1lgModel: '模型 k·n*²/Zeff', s1lgOuter: '最外层电子', s1lgInner: '内层电子',
    s1readout: '{name}（Z = {Z}）：最外层是第 {n} 层，有 {v} 个电子。屏蔽 S = {S}，有效核电荷 Zeff = {Z} − {S} = {zf}。模型半径 {pred} pm，实测 {r} pm。',
    s1noR: '{name} 是稀有气体，本页没有它的共价半径；Zeff = {zf}，照样是本周期最大。',
    s1fit: '全部 29 个元素上，模型值与实测值的相关系数 {c}（1 表示完全同步）。',
    s1hint: '观察顺序：先保持第 2 周期，把族内位置从 1 拖到 7：原子示意里核电荷 +Z 逐个增加，橙色外层电子逐个增加，但电子层数不变；读数里 Zeff 每步加 0.65，「共价半径」图里实测点一路走低。橙色虚线是模型：方向完全对上，但往右缩得比实测更快（F 模型 31 pm，实测 57 pm），说明斯莱特规则只是粗估。再换第 3 周期：同样的规律重复一遍。第 4、5 周期的右半段，实测几乎持平，模型却还在下降：这是模型的又一处偏差。',

    s2k: '第 2 步 · 电离能的台阶',
    s2t: '电离能总体往右上升，为什么在第 13 族和第 16 族各跌一下？',
    s2e: '这一步要回答：按第 1 步的说法，Zeff 往右一直增大，电离能应该一路上升；可 Be → B、N → O 都是下降。答案在电子住在哪个<strong>轨道</strong>：同一层里电子先填 s 轨道（1 个，最多 2 个电子），再填 p 轨道（3 个，每个最多 2 个电子）。p 电子比同层的 s 电子能量高、离核平均稍远，也被 s 电子挡住一点；p 轨道里电子先一个格一个格地单独住，3 个格都有人以后才开始两个挤一格（<strong>洪特规则</strong>），同一格里两个电子互相排斥。下图的方格就是外层的 s 和 p 轨道，箭头是电子，最后一个（橙色）就是电离时要被拿走的那个。',
    perSlider2: '周期', grpSlider2: '族内位置（从左数第几个）',
    c2a: '最外层轨道：橙色 = 要拿走的电子', c2b: '第一电离能（kJ/mol）',
    s2lgThis: '所选周期', s2lgOther: '其他周期', s2lgDip: '下降的一步',
    s2readout: '{name}：第一电离能 {ie} kJ/mol，比前一个 {prev} {d}。{why}',
    up: '高 {v}', down: '低 {v}',
    s2first: '{name}：第一电离能 {ie} kJ/mol。{why}',
    whyFirst: '它是这一周期的第一个元素，外层只有 1 个 s 电子，离核远、Zeff 小，最容易拿走。',
    whyNormal: '要拿走的电子和前一个元素的处在同一类轨道，Zeff 更大，所以更难拿走。',
    whyNewP: '它是本周期第一个 p 电子：p 电子能量比 s 电子高，又被同层的 2 个 s 电子挡了一下，所以比前一个元素的 s 电子更容易拿走。',
    whyPair: '它的第 4 个 p 电子只能和别的电子挤进同一格，两个电子互相排斥，拿走这一个反而省力。',
    s2hint: '观察顺序：选第 2 周期，把族内位置从 1 拖到 8，看方格里电子一个个住进来，同时看「第一电离能」折线：大多数步都上升，只有两步（橙色线段）下降。在第 13 族看橙色箭头：它独自住进 p 格；在第 16 族看：它和另一个电子挤在同一格。再换第 3、4 周期，下降恰好出现在同样两处。',

    s3k: '第 3 步 · 沿族向下',
    s3t: '同一族从上到下，为什么原子变大、电离能变小？',
    s3e: '这一步要回答：Li、Na、K、Rb 外层都是 1 个电子，往下核电荷从 3 涨到 37，为什么外层电子反而越来越好拿？往下每走一步，原子多一整层电子，新增的质子差不多都被新增的内层电子屏蔽掉，所以 Zeff（斯莱特估算）几乎不变，而外层电子所在的层 n 加 1、离核更远。下面「…：同族从上到下」图里的柱子是所选性质，「有效核电荷 Zeff 与 n*」图里是两者的估算。第 13、14 族在第 4 周期前插进了 10 个 d 电子（过渡金属那一段），它们屏蔽得不完全，Zeff 会跳一下：这就是 Ga 的电负性、电离能反而略高于 Al 的原因。',
    c4wait: '先选一个，数据才显示', c3a: '{prop}：同族从上到下', c3b: '有效核电荷 Zeff 与 n*',
    s3lgZ: 'Zeff（斯莱特）', s3lgN: 'n*（有效主量子数）',
    s3readout: '第 {g} 族 {first} → {last}：{prop}从 {a} 变到 {b}。{mono} Zeff：{zs}。',
    monoUp: '一路增大。', monoDown: '一路减小。', monoFlat: '基本一路{dir}，但 {pairs} 处持平。', monoBreak: '不是一路{dir}：{pairs} 处反了过来。',
    dirUp: '增大', dirDown: '减小',
    s3hint: '观察顺序：先选第 1 族、按「原子半径」：柱子一级比一级高；再看「有效核电荷 Zeff 与 n*」图，Li 1.3 之后 Na、K、Rb 都是 2.2，几乎不动，只有 n* 在长。再按「第一电离能」，柱子一路降。然后换第 13 族并按「电负性」：Al → Ga 反而升高；「有效核电荷 Zeff 与 n*」图里 Zeff 从 3.5 跳到 5.0，就是插进来的 10 个 d 电子屏蔽不完全造成的。',

    s4k: '第 4 步 · 预测与检验',
    s4t: '先用趋势猜，再看数据：规则有多可靠？',
    s4e: '这一步要回答：用「同周期往右半径变小、电离能和电负性变大；同族往下反过来」这条趋势规则去比较两个元素，有多大把握？每题给出同一周期或同一族的两个元素，先点你认为更大的那个，页面再给出数据和规则的预测。这 12 题是固定的，里面有意放进了前两步看到的几个例外。',
    c4a: '两个元素在表里的位置', c4b: '数据对比',
    s4q: '第 {i}/{N} 题：{a} 和 {b}，谁的{prop}更大？',
    s4fb: '你选 {pick}，{ok}实际是 {win} 更大（{a}：{va}，{b}：{vb}）。趋势规则预测 {rule}，{ruleOk}',
    pickYes: '对了。', pickNo: '不对。', ruleYes: '这次规则成立。', ruleNo: '这次规则失灵：{why}',
    ex_newP: '后一个元素的电子是本周期第一个 p 电子，更好拿走（第 2 步）。',
    ex_pair: '后一个元素的电子要和别的电子挤进同一个 p 格，更好拿走（第 2 步）。',
    ex_d: 'Ga 之前插进了 10 个 d 电子，屏蔽不完全，Zeff 跳高（第 3 步）。',
    next4: '下一题', restart4: '从第 1 题重来',
    s4score: '已答 {n}/{N} 题，猜对 {c} 题；规则在这 {n} 题里成立 {r} 次。',
    s4done: '12 题全部答完：趋势规则对了 {r}/12。它在「大方向」上可靠，但同周期的电离能和第 13、14 族向下的电负性要留心例外。',
    s4hint: '观察顺序：先凭直觉选，再读反馈：前半句是数据，后半句是趋势规则的预测。规则失灵的题目，反馈会指回第 2、3 步对应的原因。每题只能选一次；「下一题」前进，「从第 1 题重来」清零得分。',

    s5k: '第 5 步 · 收束',
    s5t: '一个量串起三条趋势',
    quizPrompt: '想一想：K 比 Na 多 8 个质子，可 K 的外层电子反而更容易被拿走（电离能 419 vs 496 kJ/mol）。主要原因是？',
    quizA: '质子多了以后，核对电子的吸引反而变弱', quizB: 'K 的外层电子在第 4 层、离核更远，多出的 8 个质子几乎全被多出的一层内层电子屏蔽（两者 Zeff 都约 2.2）', quizC: 'K 的外层电子比 Na 多',
    check: '核对',
    correct: '对。斯莱特估算里 Na 和 K 的 Zeff 都是 2.2：多出的质子被多出的 8 个内层电子挡掉了，剩下的差别只是 K 的外层电子离核更远（n* 从 3 变成 3.7），所以更容易拿走。',
    wrong: '再看看第 3 步：选第 1 族，在「有效核电荷 Zeff 与 n*」图里对比 Na 和 K 的 Zeff，以及 n*。',
    s5fin: '三条趋势背后是同一个量：<strong>最外层电子感到的有效核电荷 Zeff，以及它离核有多远</strong>。同周期往右，层数不变、Zeff 每步约加 0.65 → 原子变小、电子更难拿走、更会抢电子（第 1 步）。同族往下，Zeff 几乎不变、层数加 1 → 原子变大、电子更好拿、抢电子本事变弱（第 3 步）。例外来自更细的结构：新开 p 轨道、p 电子开始成对（第 2 步），以及插进来的 d 电子（第 3 步）。',
    formula: '有效核电荷 Zeff = Z − S（斯莱特：同层 0.35，内一层 0.85，更内层 1）\n模型半径 r ≈ k · n*² / Zeff\n同周期 →：r 变小，电离能、电负性变大；同族 ↓：反过来',
    boundary: '模型边界：只看第 1–5 周期主族元素；共价半径取一组标准数据，实际随成键环境变化；斯莱特规则是粗估，r ∝ n*²/Zeff 只有一个拟合常数，方向对、幅度偏大（第 2 周期右端尤其明显）。相关只说明两者同步，不等于推导；精确数值要靠量子力学计算。',
    linksTitle: '接着看',
    lk1: '原子结构 · 第 2 步：电子怎样一层层排布',
    lk2: '原子结构 · 第 3 步：为什么最外层电子决定化学性质',
    lk3: '分子构型 · 第 4 步：电负性差怎样决定分子的极性',
    lk4: '电场 · 第 0 步：点电荷的吸引怎样随距离变弱',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《元素周期律 · 周期表上的渐变》的平行版本。 · Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Periodic Trends · Gradients Across the Periodic Table”.',

    el_H: '氢', el_He: '氦', el_Li: '锂', el_Be: '铍', el_B: '硼', el_C: '碳', el_N: '氮', el_O: '氧', el_F: '氟', el_Ne: '氖',
    el_Na: '钠', el_Mg: '镁', el_Al: '铝', el_Si: '硅', el_P: '磷', el_S: '硫', el_Cl: '氯', el_Ar: '氩',
    el_K: '钾', el_Ca: '钙', el_Ga: '镓', el_Ge: '锗', el_As: '砷', el_Se: '硒', el_Br: '溴', el_Kr: '氪',
    el_Rb: '铷', el_Sr: '锶', el_In: '铟', el_Sn: '锡', el_Sb: '锑', el_Te: '碲', el_I: '碘', el_Xe: '氙',
    listSep: '、'
  },
  en: {
    pageTitle: 'Periodic Trends · How Much Nucleus the Outer Electrons Feel',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Periodic Trends · Gradients Across the Periodic Table →',
    navLabel: 'Periodic trends steps',
    tagline: 'Colour the periodic table by atomic radius, ionisation energy or electronegativity and clear gradients appear: atoms get “tighter” to the right and “looser” going down. Why? This page uses one quantity you can calculate — the nuclear charge the outer electrons actually feel, the effective nuclear charge — to tie all three trends together, shows exactly where exceptions break them, and finally has you predict first and check against data.',
    nav0: '0 Heat map', nav1: '1 Across a period', nav2: '2 Steps in IE', nav3: '3 Down a group', nav4: '4 Predict & check', nav5: '5 Wrap-up',
    prop_r: 'Atomic radius', prop_ie: 'First ionisation energy', prop_en: 'Electronegativity',
    propIn_r: 'atomic radius', propIn_ie: 'first ionisation energy', propIn_en: 'electronegativity',
    unit_r: ' pm', unit_ie: ' kJ/mol', unit_en: '',
    none: 'no value',

    s0k: 'Step 0 · Heat map',
    s0t: 'Painted onto the periodic table, what gradient does each property make?',
    s0e: 'The question here: are atomic radius, ionisation energy and electronegativity scattered at random across the table? The table holds the main-group elements of <strong>periods</strong> 1 to 5 (rows: same number of electron shells — how shells fill: <a class="xlink" href="../../../chemistry/matter/atomic-structure/#step2">→ Atomic Structure, step 2</a>), arranged in <strong>groups</strong> (columns: same number of outer electrons). The three properties: <strong>atomic radius</strong> is the covalent radius, half the distance between two nuclei of the same element bonded together (pm, 1 pm = 10⁻¹² m); <strong>first ionisation energy</strong> is the energy needed to pull the outermost electron off a gaseous atom (kJ/mol) — bigger means harder to remove; <strong>electronegativity</strong> is how strongly an atom pulls on shared electrons in a bond (Pauling scale, no unit) — bigger pulls harder. Noble gases hardly bond, so this page gives them no radius or electronegativity; their cells are grey.',
    c0a: 'Main-group periodic table (colour = chosen property)', c0title: 'Main-group table · colour = {prop}',
    s0readout: '{name} ({sym}, Z = {Z}, period {p}, group {g}): atomic radius {r} · first ionisation energy {ie} · electronegativity {en}.',
    s0scale: 'Colour runs from dark blue (small) to yellow (large): {lo} – {hi}',
    elSlider: 'Pick an element (or click a cell)',
    s0hint: 'What to watch: press “Atomic radius” first. Each column brightens (grows) from top to bottom and the largest atom is at the bottom left; periods 2 and 3 darken (shrink) all the way from left to right, while periods 4 and 5 shrink fast on the left and are almost level on the right (within 1–2 pm). Then press “First ionisation energy” and “Electronegativity”: both run the opposite way to radius, largest at the top right. Use the slider or click cells to read values one by one — a few spots in a row break the order; steps 2 and 3 look at them.',

    s1k: 'Step 1 · Across a period',
    s1t: 'Across a period, why do atoms get smaller?',
    s1e: 'The question here: from Li to F the nucleus gains 6 protons and the atom gains 6 electrons, yet it shrinks from 128 pm to 57 pm. Why? What matters is the pull the outer electrons actually feel. Inner electrons sit between the nucleus and the outer electrons and cancel part of the nuclear charge — this is <strong>shielding</strong>; the net charge the outer electron feels is the <strong>effective nuclear charge</strong> Zeff = Z − S, with S the shielding constant. <strong>Slater’s rules</strong> are an empirical estimate: every other electron in the same shell shields 0.35, every electron one shell in shields 0.85, and every electron deeper shields 1. Moving right, each extra proton comes with an electron in the same shell that shields only 0.35, so Zeff rises by about 0.65 per step and the outer shell is pulled in. The model then assumes radius r ∝ n*²/Zeff (n* is the effective principal quantum number: just 2 or 3 for periods 2 and 3, 3.7 and 4.0 for periods 4 and 5), with one constant fitted to all 29 elements that have a radius.',
    perSlider: 'Period', grpSlider: 'Position in the row (from the left)',
    c1a: 'Atom sketch: orange = outermost electrons', c1b: 'Covalent radius: measured vs model (pm)',
    s1lgData: 'Measured covalent radius', s1lgModel: 'Model k·n*²/Zeff', s1lgOuter: 'Outermost electrons', s1lgInner: 'Inner electrons',
    s1readout: '{name} (Z = {Z}): the outermost shell is shell {n}, with {v} electrons. Shielding S = {S}, effective nuclear charge Zeff = {Z} − {S} = {zf}. Model radius {pred} pm, measured {r} pm.',
    s1noR: '{name} is a noble gas, so this page has no covalent radius for it; Zeff = {zf}, still the largest in its period.',
    s1fit: 'Across all 29 elements, model and measured radii have a correlation coefficient of {c} (1 means perfectly in step).',
    s1hint: 'What to watch: stay in period 2 and drag the position from 1 to 7. In the atom sketch the nuclear charge +Z goes up by one each time and so does the number of orange outer electrons, but the number of shells stays the same; in the readout Zeff gains 0.65 per step, and on the “Covalent radius” chart the measured points fall steadily. The orange dashed line is the model: it gets the direction exactly right but shrinks faster than the data (F: model 31 pm, measured 57 pm) — Slater’s rules are only a rough estimate. Switch to period 3: the same pattern repeats. On the right half of periods 4 and 5 the measured radii are almost level while the model keeps falling — another place where the model is off.',

    s2k: 'Step 2 · Steps in IE',
    s2t: 'Ionisation energy rises to the right — so why does it dip at groups 13 and 16?',
    s2e: 'The question here: by step 1, Zeff keeps rising to the right, so ionisation energy should climb all the way — yet Be → B and N → O both go down. The answer is which <strong>orbital</strong> the electron lives in. Within a shell, electrons fill the s orbital first (one orbital, up to 2 electrons), then the p orbitals (three of them, up to 2 electrons each). A p electron has higher energy than an s electron of the same shell, sits slightly farther out on average, and is partly shielded by the s electrons. In the p orbitals, electrons first take one box each, and only pair up once all three boxes are occupied (<strong>Hund’s rule</strong>); two electrons sharing a box repel each other. The boxes below are the outer s and p orbitals, the arrows are electrons, and the last one (orange) is the electron removed on ionisation.',
    perSlider2: 'Period', grpSlider2: 'Position in the row (from the left)',
    c2a: 'Outer orbitals: orange = the electron removed', c2b: 'First ionisation energy (kJ/mol)',
    s2lgThis: 'Chosen period', s2lgOther: 'Other periods', s2lgDip: 'A step down',
    s2readout: '{name}: first ionisation energy {ie} kJ/mol, {d} than {prev}. {why}',
    up: '{v} higher', down: '{v} lower',
    s2first: '{name}: first ionisation energy {ie} kJ/mol. {why}',
    whyFirst: 'It is the first element of its period: one s electron in a new, distant shell with a small Zeff, the easiest to remove.',
    whyNormal: 'The electron removed is in the same kind of orbital as in the previous element, with a larger Zeff, so it is harder to remove.',
    whyNewP: 'This is the period’s first p electron: higher in energy than an s electron and partly shielded by the shell’s 2 s electrons, so it comes off more easily than the previous element’s s electron.',
    whyPair: 'Its fourth p electron has to share a box with another electron; the two repel, so removing this one takes less energy.',
    s2hint: 'What to watch: choose period 2 and drag the position from 1 to 8. Electrons move into the boxes one at a time while the “First ionisation energy” line climbs on most steps — only two steps (orange segments) go down. At group 13, look at the orange arrow: it sits alone in a p box. At group 16, it shares a box with another electron. Switch to periods 3 and 4: the dips appear in exactly the same two places.',

    s3k: 'Step 3 · Down a group',
    s3t: 'Down a group, why do atoms grow and ionisation energy fall?',
    s3e: 'The question here: Li, Na, K and Rb all have one outer electron, and going down the nuclear charge climbs from 3 to 37 — so why does the outer electron get easier to remove? Each step down adds a whole shell of electrons, and the added protons are almost exactly cancelled by the added inner electrons. Zeff (Slater’s estimate) barely changes, while the outer electron’s shell n goes up by one and sits farther out. The bars in “…: down the group” show the chosen property; “Effective nuclear charge Zeff and n*” shows the two estimates. In groups 13 and 14, 10 d electrons (the transition-metal stretch) are inserted before period 4; they shield imperfectly, so Zeff jumps — which is why Ga’s electronegativity and ionisation energy come out slightly higher than Al’s.',
    c4wait: 'Pick one first to show the data', c3a: '{prop}: down the group', c3b: 'Effective nuclear charge Zeff and n*',
    s3lgZ: 'Zeff (Slater)', s3lgN: 'n* (effective principal quantum number)',
    s3readout: 'Group {g}, {first} → {last}: {prop} goes from {a} to {b}. {mono} Zeff: {zs}.',
    monoUp: 'It increases at every step.', monoDown: 'It decreases at every step.', monoFlat: 'It mostly {dir}, but stays level at {pairs}.', monoBreak: 'It does not {dir} all the way: it reverses at {pairs}.',
    dirUp: 'increases', dirDown: 'decreases',
    s3hint: 'What to watch: choose group 1 and press “Atomic radius”: each bar is taller than the last. Now look at Zeff: after Li’s 1.3, Na, K and Rb all sit at 2.2 — almost no change — while only n* grows. Press “First ionisation energy”: the bars fall all the way. Then switch to group 13 and press “Electronegativity”: Al → Ga goes up, and Zeff jumps from 3.5 to 5.0 — the 10 inserted d electrons don’t shield fully.',

    s4k: 'Step 4 · Predict & check',
    s4t: 'Guess from the trend, then check the data: how reliable is the rule?',
    s4e: 'The question here: if you compare two elements with the trend rule — “across a period, radius shrinks while ionisation energy and electronegativity grow; down a group, the reverse” — how sure can you be? Each question gives two elements from the same period or the same group. Click the one you think is larger; the page then shows the data and what the rule predicts. The 12 questions are fixed and deliberately include the exceptions from steps 2 and 3.',
    c4a: 'Where the two elements sit', c4b: 'Data side by side',
    s4q: 'Question {i}/{N}: {a} or {b} — which has the larger {prop}?',
    s4fb: 'You chose {pick}: {ok} {win} is larger ({a}: {va}, {b}: {vb}). The trend rule predicts {rule}: {ruleOk}',
    pickYes: 'correct.', pickNo: 'not quite.', ruleYes: 'the rule holds this time.', ruleNo: 'the rule fails here — {why}',
    ex_newP: 'the second element’s electron is its period’s first p electron, which is easier to remove (step 2).',
    ex_pair: 'the second element’s electron has to pair up in a p box, which makes it easier to remove (step 2).',
    ex_d: '10 d electrons are inserted before Ga; they shield imperfectly and Zeff jumps (step 3).',
    next4: 'Next question', restart4: 'Start again from question 1',
    s4score: '{n}/{N} answered, {c} correct; the rule held in {r} of these {n}.',
    s4done: 'All 12 answered: the trend rule was right {r}/12 times. It is reliable for the broad direction, but watch for exceptions in ionisation energy across a period and electronegativity down groups 13 and 14.',
    s4hint: 'What to watch: pick on instinct first, then read the feedback — first the data, then what the trend rule predicts. When the rule fails, the feedback points back to the cause in step 2 or 3. You get one pick per question; “Next question” moves on and “Start again” resets the score.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'One quantity behind three trends',
    quizPrompt: 'Think: K has 8 more protons than Na, yet its outer electron is easier to remove (ionisation energy 419 vs 496 kJ/mol). What is the main reason?',
    quizA: 'With more protons, the nucleus actually pulls on electrons more weakly', quizB: 'K’s outer electron is in shell 4, farther out, and its 8 extra protons are almost all shielded by the extra shell of inner electrons (both have Zeff ≈ 2.2)', quizC: 'K has more outer electrons than Na',
    check: 'Check',
    correct: 'Right. By Slater’s estimate Na and K both have Zeff = 2.2: the extra protons are cancelled by 8 extra inner electrons, and what is left is that K’s outer electron sits farther out (n* goes from 3 to 3.7), so it comes off more easily.',
    wrong: 'Look at step 3 again: choose group 1 and compare the Zeff and n* of Na and K.',
    s5fin: 'Behind the three trends is one quantity: <strong>the effective nuclear charge Zeff the outermost electrons feel, and how far out they sit</strong>. Across a period the shell stays the same and Zeff rises about 0.65 per step → atoms shrink, electrons get harder to remove, and atoms pull harder on shared electrons (step 1). Down a group Zeff barely moves while the shell number goes up → atoms grow, electrons come off more easily, and the pull weakens (step 3). The exceptions come from finer structure: opening the p orbitals, p electrons starting to pair (step 2), and inserted d electrons (step 3).',
    formula: 'Effective nuclear charge Zeff = Z − S (Slater: same shell 0.35, one shell in 0.85, deeper 1)\nModel radius r ≈ k · n*² / Zeff\nAcross a period →: r shrinks, IE and EN grow; down a group ↓: the reverse',
    boundary: 'Model limits: only main-group elements of periods 1–5. Covalent radii are one standard data set and really vary with the bonding partner. Slater’s rules are a rough estimate, and r ∝ n*²/Zeff has a single fitted constant: right in direction, too strong in size (especially at the right end of period 2). A correlation shows the two move together; it is not a derivation. Precise values need quantum-mechanical calculation.',
    linksTitle: 'Where to next',
    lk1: 'Atomic Structure · step 2: how electrons fill shell by shell',
    lk2: 'Atomic Structure · step 3: why the outermost electrons set the chemistry',
    lk3: 'Molecular Shapes · step 4: how electronegativity differences make a molecule polar',
    lk4: 'Electric Fields · step 0: how a point charge’s pull fades with distance',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《元素周期律 · 周期表上的渐变》的平行版本。 · Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Periodic Trends · Gradients Across the Periodic Table”.',

    el_H: 'Hydrogen', el_He: 'Helium', el_Li: 'Lithium', el_Be: 'Beryllium', el_B: 'Boron', el_C: 'Carbon', el_N: 'Nitrogen', el_O: 'Oxygen', el_F: 'Fluorine', el_Ne: 'Neon',
    el_Na: 'Sodium', el_Mg: 'Magnesium', el_Al: 'Aluminium', el_Si: 'Silicon', el_P: 'Phosphorus', el_S: 'Sulfur', el_Cl: 'Chlorine', el_Ar: 'Argon',
    el_K: 'Potassium', el_Ca: 'Calcium', el_Ga: 'Gallium', el_Ge: 'Germanium', el_As: 'Arsenic', el_Se: 'Selenium', el_Br: 'Bromine', el_Kr: 'Krypton',
    el_Rb: 'Rubidium', el_Sr: 'Strontium', el_In: 'Indium', el_Sn: 'Tin', el_Sb: 'Antimony', el_Te: 'Tellurium', el_I: 'Iodine', el_Xe: 'Xenon',
    listSep: ', '
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  const pick = d => (d && typeof d[key] === 'string' ? d[key] : null);
  let text = pick(STRINGS[lang]) ?? pick(STRINGS.en) ?? key;
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
  if (typeof window.refreshTrends === 'function') window.refreshTrends();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
