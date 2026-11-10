'use strict';
// Molecules & atoms lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '分子与原子 · 拆开、重组，还是只是挪位置',
    back: '← 知识索引',
    compare: '对照另一版本：分子与原子 →',
    navLabel: '分子与原子步骤导航',
    tagline: '水烧开会变成水蒸气，水通电也会慢慢「变没」。两件事看起来都是水变了，可在看不见的尺度上完全不同：一个只是分子挪了位置，一个是分子被拆开、原子重新组合。本页从读懂 H₂O 这几个字符开始，亲手数原子、数分子，最后用一条判据分清物理变化和化学变化。',
    nav0: '0 读化学式', nav1: '1 同样的原子', nav2: '2 水烧开', nav3: '3 水通电', nav4: '4 判一判', nav5: '5 原子账本', nav6: '6 收束',

    s0k: '第 0 步 · 读化学式',
    s0t: 'H₂O 里的小 2 和 3H₂O 前面的 3，各数的是什么？',
    s0e: '这一步要回答：化学式里的两种数字分别在数什么？先认两个词：<strong>原子</strong>是化学变化里不会再被拆开的最小粒子，比如氢原子 H、氧原子 O；<strong>分子</strong>是几个原子连在一起组成的一个整体，比如一个水分子由 2 个 H 和 1 个 O 连成。化学式右下角的小数字叫<strong>下标</strong>，数的是「一个分子里有几个这种原子」（下标是 1 时不写）；写在最前面的大数字叫<strong>系数</strong>，数的是「有几个这样的分子」。图里的球只是示意：颜色代表元素，大小和距离都不按真实比例。',
    coefSlider: '分子个数（系数）',
    c0a: '分子示意图', c0b: '原子总数（按元素）',
    s0readout: '{coef}{f}：每个分子有 {per}，共 {pm} 个原子；{n} 个分子合计 {tot}，共 {all} 个原子。',
    s0hint: '观察顺序：先选 H₂O，把「分子个数」从 1 拖到 4：示意图里水分子一个个增加，每个都还是 1 个红球连 2 个白球；「原子总数」的柱子按每次 2 个 H、1 个 O 的步子长高。再换 CO₂ 和 CH₄：CH₄ 的「4」只属于 H，C 的下标是 1，所以没写出来。',

    s1k: '第 1 步 · 同样的原子',
    s1t: '同样只有氢和氧，为什么水能喝，过氧化氢却拿来消毒？',
    s1e: '这一步要回答：组成元素相同，是不是就是同一种物质？下面五种物质都只由氢原子、氧原子组成（有的只含其中一种），差别只在<strong>一个分子里各有几个原子、怎样连接</strong>。一种分子对应一种物质：分子不同，物质的性质就不同。柱状图是它们在一个大气压下的<strong>沸点</strong>（液体开始沸腾的温度，手册数据），用来说明它们确实是性质不同的物质。',
    c1a: '分子示意图', c1b: '沸点（°C，一个大气压）', room: '虚线 = 室温 20 °C',
    s1readout: '{f}：一个分子 = {per}。和 H₂O 比：{cmp}。沸点 {bp} °C，室温 20 °C 时是{state}。',
    cmpSame: '就是同一种分子',
    cmpKinds: '元素同样是 H 和 O，但每个分子里的原子个数不同，所以是另一种分子、另一种物质',
    cmpOther: '只含 {els} 一种元素，和 H₂O 不是同一种分子',
    st_solid: '固态', st_liquid: '液态', st_gas: '气态',
    s1hint: '观察顺序：先点 H₂O，再点 H₂O₂：一个分子只多了 1 个 O，沸点就从 100 °C 变成 150.2 °C；过氧化氢还容易分解出氧、能破坏细菌，所以用来消毒。再点 O₂ 和 O₃：都只有氧原子，一个是我们呼吸的氧气，一个是有刺激性气味的臭氧，沸点差了 70 多度。结论：判断是不是同一种物质，要看分子，只看元素不够。',

    s2k: '第 2 步 · 水烧开',
    s2t: '水烧开变成水蒸气，水分子变了吗？',
    s2e: '这一步要回答：把水从 −20 °C 加热到 120 °C（一个大气压），冰化成水、水变成蒸气，水分子本身有没有变？「示意：12 个水分子」图是一段示意动画：温度越高抖得越厉害；0 °C 以下排成整齐的队（冰），0 到 100 °C 挨在一起、能互相滑动（液态水），100 °C 起散开、满框乱飞（水蒸气）。「分子账」实时数画面里每种分子、每种原子各有几个。像这样只改变状态和分子间距离、分子本身不变的变化，叫<strong>物理变化</strong>（物态变化的细节见 <a class="xlink" href="../../../chemistry/matter/particles-states/#step2">→ 粒子与物态页第 2 步：熔化时队形怎样散开</a>）。',
    tSlider: '温度（°C）',
    c2a: '示意：12 个水分子', c2b: '分子账：画面里数到的个数',
    s2readout: '温度 {T} °C · {state} · 画面里：{mols} · 原子：{atoms}。{gas}',
    ph_solid: '冰（固态）', ph_liquid: '液态水', ph_gas: '水蒸气（气态）',
    s2gas: '画框装不下真实比例：100 °C 的水蒸气里，分子之间的平均距离约是液态水的 {r} 倍（体积约 {v} 倍）。',
    s2hint: '观察顺序：只拖温度，从 −20 °C 拖到 120 °C 再拖回来。先看示意图：分子从整齐排队，到挤在一起滑动，再到满框乱飞；再看「分子账」：从头到尾都是 12 个 H₂O、24 个 H、12 个 O，一根柱子都没动。动画是按温度设定的示意运动，不是对真实分子的计算；分子之间的距离也没有按真实比例画。',

    s3k: '第 3 步 · 水通电',
    s3t: '水通电以后，水分子去了哪里？',
    s3e: '这一步要回答：给水通电（实验里常加一点硫酸钠帮助导电），两根电极上冒出气泡，水慢慢变少。水分子去了哪里？每一次反应：2 个 H₂O 被拆成 4 个 H 原子和 2 个 O 原子；H 两两连成 2 个 H₂（氢气，在负极冒出），O 连成 1 个 O₂（氧气，在正极冒出），写成 2H₂O → 2H₂ + O₂。每按一下「通电一次」，示意图就演一次这样的拆开与重组。像这样产生了新种类分子的变化，叫<strong>化学变化</strong>。',
    startSlider: '起始水分子数', zap1: '通电一次', zapAll: '一直通电到水分解完', refill: '重新装水',
    c3a: '示意：拆开与重组', c3b: '个数随反应次数',
    lgH2O: 'H₂O', lgH2: 'H₂', lgO2: 'O₂', lgHat: 'H 原子', lgOat: 'O 原子',
    s3readout: '已反应 {k}/{max} 次 · 剩 {w} 个 H₂O，生成 {h} 个 H₂、{o} 个 O₂{ratio} · 原子：{atoms}，始终不变。',
    s3ratio: '（H₂ : O₂ = 2 : 1）',
    s3hint: '观察顺序：按几次「通电一次」：每次都有 2 个水分子散开，白球两两配成 H₂ 跑进左边的负极管，红球配成 O₂ 跑进右边的正极管。看「个数随反应次数」：H₂O 的线往下走，H₂ 和 O₂ 往上走，H₂ 总是 O₂ 的 2 倍；两条虚线（H 原子、O 原子）一直是平的。对照第 2 步：那里分子个数纹丝不动，这里连分子的种类都变了。改「起始水分子数」会重新装水。',

    s4k: '第 4 步 · 判一判',
    s4t: '物理变化还是化学变化，怎样一眼判断？',
    s4e: '这一步要回答：遇到一个变化，怎样判断它是物理变化还是化学变化？判据只有一条：<strong>比较变化前后的分子种类</strong>。种类没变，只是状态或位置变了 → 物理变化；出现了原来没有的分子 → 化学变化。先选一个场景，自己判断后按「我猜物理变化」或「我猜化学变化」，页面再用这条判据核对，并画出前后的分子。',
    sc_melt: '冰块化成水', sc_alcohol: '酒精敞口放着变少', sc_iodine: '碘受热直接变成紫色蒸气', sc_charcoal: '木炭燃烧', sc_hydrogen: '氢气在氧气里燃烧', sc_ozone: '雷雨时部分氧气变成臭氧', sc_electro: '水通电分解',
    guessPhys: '我猜物理变化', guessChem: '我猜化学变化', resetScore: '重置记分',
    c4a: '变化前 → 变化后',
    s4pick: '「{sc}」：变化前是 {before}。你觉得变化后分子种类变了吗？先猜一下。',
    s4readout: '「{sc}」：前 {before} → 后 {after}。{verdict}{extra}你猜的是{guess}，{right}',
    s4phys: '分子种类没变 → 物理变化。', s4chem: '出现了新分子 {new} → 化学变化。',
    s4ozone: '原子都还是 O，但 O₃ 和 O₂ 是两种分子：元素没变，不代表物质没变。',
    s4carbon: '木炭直接由碳原子堆成，这里把一个 C 原子当作一份来数。',
    gPhys: '物理变化', gChem: '化学变化', rightYes: '猜对了。', rightNo: '这次没猜中。',
    s4score: '已判断 {n}/{N} 个场景，猜对 {c} 个。',
    s4hint: '观察顺序：先选「冰块化成水」和「水通电分解」对照：一个前后都是 H₂O，一个后面出现了 H₂、O₂。再试「雷雨时部分氧气变成臭氧」：前后都只有氧原子，按判据它是哪一种？每个场景只记第一次猜的结果；「重置记分」清空所有记录。',

    s5k: '第 5 步 · 原子账本',
    s5t: '化学变化里，原子会多出来或者少掉吗？',
    s5e: '这一步要回答：化学变化把分子拆开重组，原子的个数和总质量会不会变？用氢气燃烧来数：一开始有 8 个 H₂ 和 4 个 O₂；每发生一次反应 2H₂ + O₂ → 2H₂O，3 个分子变成 2 个分子。拖滑杆看 0 到 4 次反应后的账。<strong>相对质量</strong>按每个原子的相对原子质量相加：H 记 1，O 记 16，所以一个 H₂ 是 2，一个 O₂ 是 32，一个 H₂O 是 18。',
    rSlider: '已发生的反应次数',
    c5a: '示意：分子的样子', c5b: '账本（灰框 = 开始时）',
    barMol: '分子', barH: 'H 原子', barO: 'O 原子', barMass: '相对质量',
    s5readout: '反应 {r}/{max} 次：{mix}。分子共 {m} 个（开始 {m0} 个）；原子 {atoms}（和开始一样）；总相对质量 {mass}（开始 {mass0}）。',
    s5hint: '观察顺序：把滑杆从 0 拖到 4。示意图里 H₂ 和 O₂ 一组组变成 H₂O；账本里「分子」柱从 12 降到 8，可 H 原子、O 原子两根柱子和「相对质量」柱一点没动，始终和灰框对齐。分子数会变，原子数和质量不变：这就是化学反应前后质量守恒的原因（逐项细账见 <a class="xlink" href="../../../chemistry/reactions/mass-conservation/#step1">→ 质量守恒页第 1 步</a>）。',

    s6k: '第 6 步 · 收束',
    s6t: '原子不变，分子才变',
    quizPrompt: '想一想：雷雨时一部分 O₂ 变成 O₃，前后都只有氧原子。这是什么变化？',
    quizA: '物理变化：元素没变', quizB: '化学变化：出现了新的分子 O₃', quizC: '不算变化：原子个数没变',
    check: '核对',
    correct: '对。判据看的是分子种类：O₂ 和 O₃ 是两种分子、两种物质（沸点、气味都不同），所以是化学变化。原子种类和个数都没变，这在任何化学变化里都成立。',
    wrong: '再想想：判据是比较前后的分子种类，不是元素种类。回第 1 步点 O₂ 和 O₃，或在第 4 步选「臭氧」场景看看。',
    s6fin: '一句话：<strong>原子不变，分子才变</strong>。物理变化（冰化成水、水烧开）只让分子换了位置和距离，分子还是原来的分子（第 2 步）；化学变化（水通电、氢气燃烧）把分子拆成原子再重新组合，出现新分子（第 3、4 步），但原子的种类、个数和总质量都不变（第 5 步）。',
    formula: '下标 = 一个分子里这种原子的个数；系数 = 分子的个数\n物理变化：前后分子种类相同\n化学变化：出现新分子；原子种类、个数、总质量不变',
    boundary: '模型边界：球棍图只示意原子怎样连，大小、距离、角度都不按比例；第 2 步的运动是按温度设定的示意，不是分子动力学计算。电解和燃烧都按反应完全进行的理想情形计数。木炭、金属、食盐这类物质不是由一个个分子组成的，对它们要把判据说成「有没有生成新物质」。',
    linksTitle: '接着看',
    lk1: '质量守恒 · 第 1 步：把反应式拆开逐个数原子',
    lk2: '粒子与物态 · 第 2 步：熔化时粒子的队形怎样散开',
    lk3: '原子结构 · 第 1 步：是什么决定一个原子是哪种元素',
    lk4: '配平化学方程式 · 第 0 步：为什么方程式两边要配平',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分子与原子》的平行版本。 · Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Molecules & Atoms”.',

    atomCount: '{k} 个 {e}', plus: ' + ', listSep: '、', molCount: '{k} 个 {f}'
  },
  en: {
    pageTitle: 'Molecules & Atoms · Taken Apart, Rebuilt, or Just Moved',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Molecules & Atoms →',
    navLabel: 'Molecules and atoms steps',
    tagline: 'Boil water and it turns to steam; run electricity through it and it slowly disappears too. Both look like “the water changed”, but at a scale too small to see they are completely different: in one the molecules only move, in the other they are pulled apart and their atoms regroup. This page starts by reading the characters H₂O, has you count atoms and molecules yourself, and ends with one test that separates physical from chemical change.',
    nav0: '0 Reading formulas', nav1: '1 Same atoms', nav2: '2 Boiling', nav3: '3 Electrolysis', nav4: '4 Sort them', nav5: '5 Atom ledger', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Reading formulas',
    s0t: 'What do the small 2 in H₂O and the 3 in front of 3H₂O each count?',
    s0e: 'The question here: what do the two kinds of number in a formula count? Two words first. An <strong>atom</strong> is the smallest particle that a chemical change never splits, such as a hydrogen atom H or an oxygen atom O. A <strong>molecule</strong> is a few atoms joined into one unit — one water molecule is 2 H and 1 O joined together. The small number at the lower right is a <strong>subscript</strong>: how many of that atom are in one molecule (a subscript of 1 is not written). The big number in front is a <strong>coefficient</strong>: how many of those molecules there are. The balls are only a sketch — colour shows the element; sizes and distances are not to scale.',
    coefSlider: 'Number of molecules (coefficient)',
    c0a: 'Molecule sketch', c0b: 'Total atoms by element',
    s0readout: '{coef}{f}: each molecule has {per}, {pm} atoms; {n} molecules together have {tot}, {all} atoms in all.',
    s0hint: 'What to watch: pick H₂O and drag “Number of molecules” from 1 to 4. Water molecules appear one by one in the sketch, each still one red ball joined to two white ones, and the “Total atoms” bars grow by 2 H and 1 O each time. Then try CO₂ and CH₄: in CH₄ the “4” belongs only to H — C has a subscript of 1, so it isn’t written.',

    s1k: 'Step 1 · Same atoms',
    s1t: 'Both are just hydrogen and oxygen — why do we drink water but disinfect with hydrogen peroxide?',
    s1e: 'The question here: if two substances are made of the same elements, are they the same substance? The five below contain only hydrogen and/or oxygen atoms; they differ only in <strong>how many atoms each molecule has and how they are joined</strong>. Each kind of molecule is one substance: different molecule, different properties. The bars show each one’s <strong>boiling point</strong> at one atmosphere (the temperature at which the liquid boils; handbook values) as evidence that they really are different substances.',
    c1a: 'Molecule sketch', c1b: 'Boiling point (°C, 1 atm)', room: 'dashed line = room temperature, 20 °C',
    s1readout: '{f}: one molecule = {per}. Compared with H₂O: {cmp}. Boils at {bp} °C; at room temperature (20 °C) it is a {state}.',
    cmpSame: 'it is the same molecule',
    cmpKinds: 'the elements are the same, H and O, but each molecule has a different number of atoms, so it is a different molecule and a different substance',
    cmpOther: 'it contains only {els}, so it is not the same molecule as H₂O',
    st_solid: 'solid', st_liquid: 'liquid', st_gas: 'gas',
    s1hint: 'What to watch: click H₂O, then H₂O₂. One extra O per molecule moves the boiling point from 100 °C to 150.2 °C, and hydrogen peroxide readily breaks down to release oxygen that damages bacteria — that’s why it disinfects. Then click O₂ and O₃: both are oxygen atoms only, yet one is the oxygen we breathe and the other is sharp-smelling ozone, with boiling points more than 70 degrees apart. Conclusion: whether two things are the same substance depends on the molecule, not just the elements.',

    s2k: 'Step 2 · Boiling',
    s2t: 'When water boils into steam, do the water molecules change?',
    s2e: 'The question here: heat water from −20 °C to 120 °C at one atmosphere — ice melts, water turns to steam — but do the water molecules themselves change? The “Sketch: 12 water molecules” animation shows them. The hotter it is, the harder they jiggle; below 0 °C they sit in a neat array (ice), from 0 to 100 °C they touch and slide past each other (liquid water), and from 100 °C they spread out and fly around the whole box (steam). The “molecule ledger” counts every kind of molecule and atom in the picture as it runs. A change like this, where only the state and the spacing change and the molecules stay the same, is a <strong>physical change</strong> (more on changes of state: <a class="xlink" href="../../../chemistry/matter/particles-states/#step2">→ Particles & States, step 2: how the array breaks up on melting</a>).',
    tSlider: 'Temperature (°C)',
    c2a: 'Sketch: 12 water molecules', c2b: 'Ledger: counts in the picture',
    s2readout: 'Temperature {T} °C · {state} · in the picture: {mols} · atoms: {atoms}. {gas}',
    ph_solid: 'ice (solid)', ph_liquid: 'liquid water', ph_gas: 'steam (gas)',
    s2gas: 'The box can’t show the real scale: in steam at 100 °C the molecules are on average about {r} times farther apart than in liquid water (about {v} times the volume).',
    s2hint: 'What to watch: drag only the temperature, from −20 °C up to 120 °C and back. In the sketch, the molecules go from a neat array, to sliding in a huddle, to flying all over the box; in the ledger it is 12 H₂O, 24 H and 12 O the whole time — not one bar moves. The motion is a sketch set by the temperature, not a calculation of real molecules, and the spacing is not drawn to scale.',

    s3k: 'Step 3 · Electrolysis',
    s3t: 'Run electricity through water — where do the water molecules go?',
    s3e: 'The question here: pass a current through water (a little sodium sulfate is usually added so it conducts) and bubbles rise from both electrodes while the water slowly goes down. Where do the water molecules go? In each reaction, 2 H₂O are pulled apart into 4 H atoms and 2 O atoms; the H pair up into 2 H₂ (hydrogen, at the negative electrode) and the O join into 1 O₂ (oxygen, at the positive electrode): 2H₂O → 2H₂ + O₂. Each press of “Run current once” acts out one such split and regroup. A change that makes a new kind of molecule is a <strong>chemical change</strong>.',
    startSlider: 'Water molecules at the start', zap1: 'Run current once', zapAll: 'Keep going until the water is gone', refill: 'Refill with water',
    c3a: 'Sketch: split and regroup', c3b: 'Counts by number of reactions',
    lgH2O: 'H₂O', lgH2: 'H₂', lgO2: 'O₂', lgHat: 'H atoms', lgOat: 'O atoms',
    s3readout: '{k}/{max} reactions · {w} H₂O left, {h} H₂ and {o} O₂ made{ratio} · atoms: {atoms}, unchanged throughout.',
    s3ratio: ' (H₂ : O₂ = 2 : 1)',
    s3hint: 'What to watch: press “Run current once” a few times. Each time 2 water molecules come apart; the white balls pair into H₂ and head to the negative-electrode tube on the left, the red balls pair into O₂ and head to the positive-electrode tube on the right. On “Counts by number of reactions” the H₂O line falls while H₂ and O₂ rise, with H₂ always twice O₂; the two dashed lines (H atoms, O atoms) stay flat. Compare step 2: there the molecule counts never moved; here even the kinds of molecule change. Changing the starting number refills the water.',

    s4k: 'Step 4 · Sort them',
    s4t: 'Physical or chemical — how can you tell at a glance?',
    s4e: 'The question here: given a change, how do you decide whether it is physical or chemical? There is one test: <strong>compare the kinds of molecule before and after</strong>. Same kinds, only the state or position changed → physical change. A molecule that wasn’t there before → chemical change. Pick a scenario, decide for yourself, then press “I say physical” or “I say chemical”; the page checks with the test and draws the molecules before and after.',
    sc_melt: 'An ice cube melting', sc_alcohol: 'Alcohol in an open dish going down', sc_iodine: 'Iodine turning straight to violet vapour', sc_charcoal: 'Charcoal burning', sc_hydrogen: 'Hydrogen burning in oxygen', sc_ozone: 'Some oxygen turning to ozone in a thunderstorm', sc_electro: 'Splitting water with electricity',
    guessPhys: 'I say physical', guessChem: 'I say chemical', resetScore: 'Reset score',
    c4a: 'Before → after',
    s4pick: '“{sc}”: before, there is {before}. Do you think the kinds of molecule change? Make a guess first.',
    s4readout: '“{sc}”: before {before} → after {after}. {verdict}{extra}You said {guess}: {right}',
    s4phys: 'Same kinds of molecule → physical change. ', s4chem: 'A new molecule appears ({new}) → chemical change. ',
    s4ozone: 'The atoms are still all O, but O₃ and O₂ are two different molecules: same element does not mean same substance. ',
    s4carbon: 'Charcoal is built straight from carbon atoms; here one C atom counts as one unit. ',
    gPhys: 'physical', gChem: 'chemical', rightYes: 'correct.', rightNo: 'not this time.',
    s4score: '{n}/{N} scenarios judged, {c} correct.',
    s4hint: 'What to watch: start by comparing “An ice cube melting” with “Splitting water with electricity” — one is H₂O before and after, the other ends with H₂ and O₂. Then try “Some oxygen turning to ozone”: only oxygen atoms on both sides — which kind of change does the test say it is? Only your first guess on each scenario is scored; “Reset score” clears everything.',

    s5k: 'Step 5 · Atom ledger',
    s5t: 'In a chemical change, can atoms appear or disappear?',
    s5e: 'The question here: a chemical change takes molecules apart and rebuilds them — does the number of atoms or the total mass change? Count it with hydrogen burning: start with 8 H₂ and 4 O₂; each reaction 2H₂ + O₂ → 2H₂O turns 3 molecules into 2. Drag the slider to see the books after 0 to 4 reactions. <strong>Relative mass</strong> adds up each atom’s relative atomic mass: H counts 1 and O counts 16, so one H₂ is 2, one O₂ is 32 and one H₂O is 18.',
    rSlider: 'Reactions so far',
    c5a: 'Sketch: the molecules', c5b: 'Ledger (grey outline = at the start)',
    barMol: 'Molecules', barH: 'H atoms', barO: 'O atoms', barMass: 'Rel. mass',
    s5readout: '{r}/{max} reactions: {mix}. {m} molecules (started with {m0}); atoms {atoms} (same as at the start); total relative mass {mass} (started at {mass0}).',
    s5hint: 'What to watch: drag the slider from 0 to 4. In the sketch, H₂ and O₂ turn into H₂O group by group; in the ledger the “Molecules” bar drops from 12 to 8, but the H atoms, O atoms and “Rel. mass” bars don’t move — they stay level with the grey outlines. The number of molecules changes; the number of atoms and the mass don’t. That is why mass is conserved in reactions (the item-by-item count: <a class="xlink" href="../../../chemistry/reactions/mass-conservation/#step1">→ Mass Conservation, step 1</a>).',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Atoms stay; molecules change',
    quizPrompt: 'Think: in a thunderstorm some O₂ turns into O₃, and both sides contain only oxygen atoms. What kind of change is it?',
    quizA: 'Physical: the element didn’t change', quizB: 'Chemical: a new molecule, O₃, appeared', quizC: 'Not a change at all: the number of atoms is the same',
    check: 'Check',
    correct: 'Right. The test looks at kinds of molecule: O₂ and O₃ are two molecules and two substances (different boiling points, different smell), so it is a chemical change. The kinds and numbers of atoms stay the same — which is true of every chemical change.',
    wrong: 'Look again: the test compares kinds of molecule, not kinds of element. Go back to step 1 and click O₂ and O₃, or pick the ozone scenario in step 4.',
    s6fin: 'In one line: <strong>atoms stay; molecules change</strong>. A physical change (ice melting, water boiling) only moves molecules and changes their spacing — they are still the same molecules (step 2). A chemical change (electrolysis, hydrogen burning) takes molecules apart into atoms and regroups them into new molecules (steps 3 and 4), while the kinds of atom, their numbers and the total mass stay the same (step 5).',
    formula: 'Subscript = how many of that atom in one molecule; coefficient = how many molecules\nPhysical change: same kinds of molecule before and after\nChemical change: a new molecule appears; atom kinds, numbers and total mass unchanged',
    boundary: 'Model limits: the ball-and-stick pictures only show which atoms are joined; sizes, distances and angles are not to scale. The motion in step 2 is a sketch set by temperature, not a molecular-dynamics calculation. Electrolysis and burning are counted as if they go to completion. Substances such as charcoal, metals and table salt are not made of separate molecules; for them the test reads “has a new substance formed?”.',
    linksTitle: 'Where to next',
    lk1: 'Mass Conservation · step 1: take the equation apart and count every atom',
    lk2: 'Particles & States · step 2: how the particles’ array breaks up on melting',
    lk3: 'Atomic Structure · step 1: what decides which element an atom is',
    lk4: 'Balancing Chemical Equations · step 0: why both sides must balance',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分子与原子》的平行版本。 · Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Molecules & Atoms”.',

    atomCount: '{k} {e}', plus: ' + ', listSep: ', ', molCount: '{k} {f}'
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
  if (typeof window.refreshMolecules === 'function') window.refreshMolecules();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MA_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
