'use strict';
// Mass conservation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '质量守恒 · 原子一个都不丢',
    back: '← 知识索引',
    compare: '对照另一版本：质量守恒 · 原子一个都不丢 →',
    navLabel: '质量守恒步骤导航',
    tagline: '蜡烛越烧越短，镁带烧完反而变重——化学反应好像能让东西变轻、变重。这一页先押一注，再把反应拆成一个个原子来数，最后用天平逐笔对账：原子一个不多、一个不少，只是换了搭档；秤上的每一点变化，都能找到进出的气体。',
    nav0: '0 押注', nav1: '1 数原子', nav2: '2 配平与质量', nav3: '3 敞口', nav4: '4 变重', nav5: '5 收束',

    s0k: '第 0 步 · 塞紧的瓶子',
    s0t: '在塞紧的瓶里让大理石和盐酸反应，冒完气泡再称，读数会变吗？',
    s0e: '这一步要回答：反应把一些物质变成了别的物质，总质量会跟着变吗？锥形瓶连塞子 150 g，瓶里有 10 g 大理石碎块（主要成分是碳酸钙 CaCO₃，本页按纯碳酸钙算）和 100 g 稀盐酸（其中 7.3 g 是氯化氢 HCl，其余是水）。两者一接触，就冒出二氧化碳 CO₂ 气泡，同时生成氯化钙 CaCl₂ 和水。瓶子一直塞紧：什么也进不来，什么也出不去。<strong>反应进度</strong>指碳酸钙已用掉的比例：0% 是还没开始，100% 是全部用完。画面里是瓶子放在天平上；旁边的「瓶内物质」柱，每种颜色是一种物质的质量，单位克（g）。先押一注，再拖滑杆或按「开始反应」。',
    betPrompt: '你押：反应完再称，天平读数会——',
    betUp: '变重', betDown: '变轻', betSame: '不变', betBtn: '押注',
    betDone: '已押：{bet}。现在让反应跑起来。',
    betPick: '先选一个答案。',
    progress: '反应进度',
    run: '开始反应', reset: '回到 0%',
    c0scene: '密闭锥形瓶 · 进度 {p}%',
    c0bar: '瓶内物质（g）',
    lgCaCO3: '碳酸钙 CaCO₃', lgHCl: '氯化氢 HCl（溶在水里）', lgWater: '水 H₂O', lgCaCl2: '氯化钙 CaCl₂', lgCO2: '二氧化碳 CO₂',
    s0readout: '进度 {p}%：碳酸钙 {caco3} g、氯化氢 {hcl} g、水 {water} g、氯化钙 {cacl2} g、二氧化碳 {co2} g，合计 {sum} g；加上瓶子 150 g，天平读数 {reading} g（开始时 {r0} g）。',
    s0verdict: '你押了「{bet}」。密闭瓶的读数从头到尾都是 {r0} g：不变。碳酸钙和氯化氢没了，多出氯化钙、水和二氧化碳——物质变了，总质量没变。为什么？第 1 步把反应拆成原子来数。',
    betNone: '还没押',
    s0hint: '观察顺序：拖动进度，盯住两处——「瓶内物质」柱里的颜色在换（灰色碳酸钙变少，绿色氯化钙、青色二氧化碳变多），柱子的总高度却不动；天平读数也不动。',

    s1k: '第 1 步 · 拆成原子来数',
    s1t: '反应前后的物质完全不同，原子呢？',
    s1e: '这一步要回答：反应时到底什么变了、什么没变？物质由<strong>分子</strong>等微粒构成，分子由<strong>原子</strong>组成。<strong>化学方程式</strong>左边写反应物，右边写生成物；化学式前面的数叫<strong>系数</strong>，表示有几个分子；化学式右下角的小数字表示一个分子里有几个这种原子（<a class="xlink" href="../../../chemistry/matter/molecules-atoms/#step0">→ 分子与原子页第 0 步：怎样读分子式</a>）。图中上排是反应前的分子，下排是反应后的分子；每个小球是一个原子，颜色表示元素，靠在一起的一组小球是一个分子。拖「重排进度」，看每个原子从上排走到下排的哪个位置。',
    rxCarbon: '碳燃烧', rxHydrogen: '氢气燃烧', rxMethane: '甲烷燃烧', rxMarble: '大理石 + 盐酸',
    regroup: '重排进度',
    play1: '播放重排',
    c1top: '反应前：{eq}',
    c1bot: '反应后：{eq}',
    elH: '氢 H', elC: '碳 C', elO: '氧 O', elMg: '镁 Mg', elCl: '氯 Cl', elCa: '钙 Ca',
    row: '{el}：反应前 {l} 个，反应后 {r} 个{mark}',
    s1readout: '{eq}　{rows}。分子拆开后，原子换了搭档；每种原子的个数一个不差。',
    s1hint: '观察顺序：先选「氢气燃烧」，把进度从 0 拖到 100%：两个氢分子、一个氧分子拆开，4 个氢原子和 2 个氧原子重新组成 2 个水分子。再换「大理石 + 盐酸」，跟着钙原子和两个氯原子，看它们最后到了哪个分子里。',

    s2k: '第 2 步 · 配平与质量',
    s2t: '方程式两边原子一样多，质量就一定相等吗？反过来呢？',
    s2e: '这一步要回答：原子个数和总质量是什么关系？每种原子有固定的质量，初中用<strong>相对原子质量</strong>比较轻重：H 1、C 12、O 16（是相对的倍数，不带单位）。一个分子的相对质量是它所有原子之和，例如 H₂O = 2 × 1 + 16 = 18。方程式一边的总质量 = 每种分子的系数 × 它的相对质量，再相加。调系数让每种原子两边一样多，叫<strong>配平</strong>（<a class="xlink" href="../../../chemistry/reactions/equation-balancing/#step1">→ 配平页第 1 步：从哪个元素下手</a>）。上半幅是逐种原子的个数，每种元素两根柱：前一根反应前、后一根反应后；下半幅是天平，两盘分别放两边的总质量，重的一边往下沉。',
    coef: '{sp} 的系数',
    c2bars: '每种原子的个数（前 = 反应前，后 = 反应后）',
    c2beam: '天平：两边的总质量（相对质量）',
    panL: '反应前 {m}', panR: '反应后 {m}',
    lgBefore: '反应前', lgAfter: '反应后',
    s2readout: '{eq}　{rows}；总质量：反应前 {mL}，反应后 {mR}。{verdict}',
    vBalanced: '每种原子都相等 → 已配平，天平也平。',
    vMassOnly: '天平平了，可原子并不逐种相等（{bad}）——质量相等不能证明已配平。',
    vNot: '{bad} 不相等 → 没配平，天平也不平。',
    s2hint: '观察顺序：选「氢气燃烧」，从 1, 1, 1 开始。先把水的系数改成 2，让氧两边相等（这时氢又不等了）；再把氢气的系数改成 2，看天平回正。然后切到「甲烷燃烧」，试试 3, 1, 1, 2：天平居然平了，可碳是 3 对 1。原子逐种相等，质量一定相等；反过来不成立，所以配平要逐种数原子，不能只看秤。',

    s3k: '第 3 步 · 敞口',
    s3t: '同样的反应换成敞口烧杯，读数为什么变小？少的那部分去哪了？',
    s3e: '这一步要回答：敞口时天平读数下降，是质量消失了，还是去了别处？还是第 0 步的 10 g 大理石和 100 g 稀盐酸，装在 150 g 的容器里，只是这次不塞瓶塞。模型假设：二氧化碳一生成就全部飞走，其余物质都留在杯里（真实实验里还有少量二氧化碳溶在水里，少量水会蒸发）。下半幅（宽屏时在旁边）横轴是反应进度，纵轴是天平读数（g）；密闭、敞口各留一条轨迹。',
    sealed: '密闭（塞紧）', open: '敞口（不塞）',
    c3scene: '{mode} · 进度 {p}%',
    c3plot: '天平读数（g）随反应进度',
    modeSealed: '密闭', modeOpen: '敞口',
    lgSealed: '密闭的轨迹', lgOpen: '敞口的轨迹',
    s3readoutOpen: '敞口，进度 {p}%：读数 {r} g，比开始少 {drop} g；到此为止生成的二氧化碳正好 {co2} g，全飞走了。对账：{r} + {co2} = {r0} g。',
    s3readoutSealed: '密闭，进度 {p}%：读数 {r} g，不变；生成的 {co2} g 二氧化碳还在瓶里。',
    s3hint: '观察顺序：先选「密闭」按「开始反应」，留下一条水平线；再选「敞口」按一次，新轨迹一路往下。到 100% 时比较两条线的差：{gap} g，正是生成的二氧化碳的质量。',

    s4k: '第 4 步 · 变重',
    s4t: '镁带在空气里烧成白色粉末，为什么反而变重了？',
    s4e: '这一步要回答：燃烧后固体变重，多出来的质量从哪来？2.4 g 镁带放在 20 g 的坩埚里，在空气中点燃：2Mg + O₂ → 2MgO，生成白色的氧化镁。参加反应的氧气来自空气，原本不在秤上。模型假设：生成的氧化镁全部留在坩埚里（真实实验中会有一部分变成白烟飘走，称出来可能反而偏轻）。下半幅（宽屏时在旁边）横轴是反应进度（镁已烧掉的比例），纵轴是质量（g）：橙线是坩埚里固体的质量，青色虚线是「固体 + 还在空气里、待会儿要参加反应的那部分氧气」。',
    burn: '开始燃烧',
    c4scene: '坩埚 + 镁带 · 进度 {p}%',
    c4plot: '质量（g）随反应进度',
    lgSolid: '坩埚里固体的质量', lgLedger: '固体 + 待参加反应的氧气', lgOxygen: '从空气进来的氧气',
    s4readout: '进度 {p}%：固体 {solid} g（镁 {mg} g + 氧化镁 {mgo} g），从空气里进来的氧气 {o2} g，天平读数 {reading} g。对账：{solid} − {o2} = {mg0} g，正是原来的镁。',
    s4bet: '回到第 0 步的押注：你押了「{bet}」。三种做法，三个答案——密闭瓶：不变（{r0} g）；敞口杯：变轻 {drop} g（二氧化碳跑了）；镁带：变重 {gain} g（氧气进来了）。原子从没多一个、少一个，变的只是秤称到了哪些物质。',
    s4hint: '观察顺序：按「开始燃烧」，看橙线从 2.4 g 往上爬，青色虚线始终平在 {total} g；两线之间的空隙就是还没进来的氧气，烧完时空隙合拢。',

    s5k: '第 5 步 · 收束',
    s5t: '原子只换搭档，所以总质量不变',
    s5fin: '化学反应只是原子<strong>换搭档</strong>：每种原子的个数不变，每个原子的质量也不变，所以参加反应的各物质的质量总和，等于反应后生成的各物质的质量总和——这就是<strong>质量守恒定律</strong>。秤上的读数变了，一定是有东西进出了秤：敞口时气体跑出去，燃烧时空气里的氧气进来。',
    formula: '原子逐种相等 ⇒ 两边质量相等（反过来不成立）\n敞口读数 + 逸出的气体 = 原来的总质量',
    boundary: '这页的模型边界：用相对原子质量按理想比例计算，假设反应完全、气体一次全部逸出或进入；真实实验有误差——少量二氧化碳溶在水里、水分蒸发、镁燃烧冒白烟、套气球时还要考虑空气浮力。质量守恒是原子层面的账，不保证秤的读数一格不差。碳酸钙、氯化钙由离子构成，图中按一个化学式画成一组小球。',
    linksTitle: '接着看',
    lk1: '→ 分子与原子第 4 步：分子重组时，原子会多出来或少掉吗',
    lk2: '→ 配平页第 0 步：为什么方程式一定要配平',
    lk3: '→ 原子结构第 1 步：质子数决定原子是哪种元素',
    lk4: '→ 燃烧三角第 1 步：罩住蜡烛，氧气用完火就灭',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《质量守恒 · 原子一个都不丢》的平行版本。'
  },
  en: {
    pageTitle: 'Mass Conservation · Not a Single Atom Lost',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Mass Conservation · Not a Single Atom Lost →',
    navLabel: 'Mass conservation steps',
    tagline: 'A candle gets shorter as it burns; a magnesium ribbon gets heavier. Reactions seem able to make things lighter or heavier. Place a bet first, then take reactions apart atom by atom, and finally settle the account on a balance: not one atom appears or vanishes — they only change partners — and every change on the scale can be traced to a gas coming or going.',
    nav0: '0 Bet', nav1: '1 Count atoms', nav2: '2 Balancing & mass', nav3: '3 Open cup', nav4: '4 Heavier', nav5: '5 Wrap-up',

    s0k: 'Step 0 · A stoppered flask',
    s0t: 'Marble and acid react inside a stoppered flask. Once the fizzing stops, does the reading change?',
    s0e: 'The question here: a reaction turns some substances into others — does the total mass change too? The flask with its stopper weighs 150 g. Inside are 10 g of marble chips (mostly calcium carbonate, CaCO₃; treated here as pure) and 100 g of dilute hydrochloric acid (7.3 g of it hydrogen chloride, HCl, the rest water). When they meet, carbon dioxide (CO₂) fizzes out and calcium chloride (CaCl₂) and water form. The flask stays stoppered: nothing gets in, nothing gets out. <strong>Reaction progress</strong> is the fraction of the calcium carbonate used up: 0% means not started, 100% means all gone. The picture shows the flask on a balance; next to it, the “inside the flask” bar gives each substance’s mass as a coloured block, in grams (g). Place your bet, then drag the slider or press “Start the reaction”.',
    betPrompt: 'Your bet: after the reaction, the balance reading will —',
    betUp: 'go up', betDown: 'go down', betSame: 'stay the same', betBtn: 'Place bet',
    betDone: 'Bet placed: {bet}. Now run the reaction.',
    betPick: 'Pick an answer first.',
    progress: 'Reaction progress',
    run: 'Start the reaction', reset: 'Back to 0%',
    c0scene: 'Stoppered flask · progress {p}%',
    c0bar: 'Inside the flask (g)',
    lgCaCO3: 'Calcium carbonate CaCO₃', lgHCl: 'Hydrogen chloride HCl (dissolved)', lgWater: 'Water H₂O', lgCaCl2: 'Calcium chloride CaCl₂', lgCO2: 'Carbon dioxide CO₂',
    s0readout: 'Progress {p}%: calcium carbonate {caco3} g, hydrogen chloride {hcl} g, water {water} g, calcium chloride {cacl2} g, carbon dioxide {co2} g — {sum} g in all; with the 150 g flask the balance reads {reading} g (it started at {r0} g).',
    s0verdict: 'You bet “{bet}”. The sealed flask reads {r0} g from start to finish: no change. The calcium carbonate and hydrogen chloride are gone and calcium chloride, water and carbon dioxide have appeared — the substances changed, the total mass did not. Why? Step 1 takes the reaction apart into atoms.',
    betNone: 'no bet yet',
    s0hint: 'What to watch: drag the progress slider and keep an eye on two things — the colours inside the bar swap over (grey calcium carbonate shrinks, green calcium chloride and cyan carbon dioxide grow) while the bar’s total height stays put; and the balance reading does not move.',

    s1k: 'Step 1 · Count the atoms',
    s1t: 'The substances before and after are completely different. What about the atoms?',
    s1e: 'The question here: in a reaction, what changes and what stays? Substances are made of particles such as <strong>molecules</strong>, and molecules are made of <strong>atoms</strong>. A <strong>chemical equation</strong> puts the reactants on the left and the products on the right; the number in front of a formula is its <strong>coefficient</strong> — how many molecules — and a small number at the bottom right of an element tells how many of that atom one molecule holds (<a class="xlink" href="../../../chemistry/matter/molecules-atoms/#step0">→ Molecules & atoms, step 0: how to read a formula</a>). The top row shows the molecules before the reaction, the bottom row the molecules after; each ball is one atom, coloured by element, and a cluster of touching balls is one molecule. Drag “regrouping” and follow each atom from the top row to its place in the bottom row.',
    rxCarbon: 'Carbon burns', rxHydrogen: 'Hydrogen burns', rxMethane: 'Methane burns', rxMarble: 'Marble + acid',
    regroup: 'Regrouping',
    play1: 'Play the regrouping',
    c1top: 'Before: {eq}',
    c1bot: 'After: {eq}',
    elH: 'Hydrogen H', elC: 'Carbon C', elO: 'Oxygen O', elMg: 'Magnesium Mg', elCl: 'Chlorine Cl', elCa: 'Calcium Ca',
    row: '{el}: {l} before, {r} after{mark}',
    s1readout: '{eq}　{rows}. The molecules break up and the atoms change partners, but the count of every kind of atom comes out exactly the same.',
    s1hint: 'What to watch: pick “Hydrogen burns” and drag from 0 to 100%. Two hydrogen molecules and one oxygen molecule come apart, and the 4 hydrogen atoms and 2 oxygen atoms regroup as 2 water molecules. Then switch to “Marble + acid” and follow the calcium atom and the two chlorine atoms to the molecule they end up in.',

    s2k: 'Step 2 · Balancing and mass',
    s2t: 'If both sides have the same atoms, must the masses match? And the other way round?',
    s2e: 'The question here: how are atom counts and total mass related? Every kind of atom has a fixed mass; school chemistry compares them with <strong>relative atomic masses</strong>: H 1, C 12, O 16 (ratios, so no unit). A molecule’s relative mass is the sum over its atoms — H₂O = 2 × 1 + 16 = 18. The total mass of one side of an equation is each coefficient times that molecule’s relative mass, added up. Choosing coefficients so that every kind of atom matches on both sides is called <strong>balancing</strong> the equation (<a class="xlink" href="../../../chemistry/reactions/equation-balancing/#step1">→ Equation balancing, step 1: where to start</a>). The upper chart counts each kind of atom, with two bars per element — the first before, the second after; the lower picture is a balance carrying each side’s total mass, and the heavier side sinks.',
    coef: 'Coefficient of {sp}',
    c2bars: 'Atoms of each element (first bar = before, second = after)',
    c2beam: 'Balance: total mass of each side (relative)',
    panL: 'Before {m}', panR: 'After {m}',
    lgBefore: 'Before', lgAfter: 'After',
    s2readout: '{eq}　{rows}; total mass: {mL} before, {mR} after. {verdict}',
    vBalanced: 'Every kind of atom matches → balanced, and the balance is level.',
    vMassOnly: 'The balance is level, yet the atoms do not match element by element ({bad}) — equal mass does not prove the equation is balanced.',
    vNot: 'counts differ for {bad} → not balanced, and the balance tips.',
    s2hint: 'What to watch: choose “Hydrogen burns” and start at 1, 1, 1. First set water to 2 so the oxygen matches (now hydrogen is off); then set hydrogen to 2 and watch the balance level out. Then switch to “Methane burns” and try 3, 1, 1, 2: the balance is level, yet carbon is 3 against 1. Matching atoms guarantee matching mass, but not the other way round — so balance an equation by counting atoms, not by weighing.',

    s3k: 'Step 3 · The open cup',
    s3t: 'Run the same reaction in an open beaker and the reading drops. Where does the missing mass go?',
    s3e: 'The question here: when the reading drops in an open beaker, has mass vanished or gone somewhere? Same 10 g of marble and 100 g of dilute acid in a 150 g container — this time without a stopper. Model assumption: every bit of carbon dioxide leaves the moment it forms, and everything else stays in the cup (in a real experiment a little CO₂ stays dissolved and a little water evaporates). The lower chart (beside the scene on wide screens) plots the balance reading in grams against reaction progress; the sealed and open runs each leave their own trace.',
    sealed: 'Sealed (stoppered)', open: 'Open (no stopper)',
    c3scene: '{mode} · progress {p}%',
    c3plot: 'Balance reading (g) against reaction progress',
    modeSealed: 'Sealed', modeOpen: 'Open',
    lgSealed: 'Sealed run', lgOpen: 'Open run',
    s3readoutOpen: 'Open, progress {p}%: the balance reads {r} g, {drop} g below the start; the carbon dioxide made so far is exactly {co2} g, and all of it has flown off. Ledger: {r} + {co2} = {r0} g.',
    s3readoutSealed: 'Sealed, progress {p}%: the balance reads {r} g, unchanged; the {co2} g of carbon dioxide made so far is still in the flask.',
    s3hint: 'What to watch: choose “Sealed” and press “Start the reaction” — it leaves a flat line. Then choose “Open” and press it again: the new trace heads down. At 100%, compare the two lines: they differ by {gap} g, exactly the mass of carbon dioxide produced.',

    s4k: 'Step 4 · Heavier',
    s4t: 'A magnesium ribbon burns in air to a white powder. Why is it heavier afterwards?',
    s4e: 'The question here: the solid gains mass when it burns — where does the extra come from? A 2.4 g ribbon of magnesium sits in a 20 g crucible and is lit in air: 2Mg + O₂ → 2MgO, giving white magnesium oxide. The oxygen that reacts comes from the air and was never on the balance. Model assumption: all the magnesium oxide stays in the crucible (in a real experiment some escapes as white smoke, so the result can even read low). The lower chart (beside the scene on wide screens) plots mass in grams against reaction progress — the fraction of magnesium burnt: the orange line is the solid in the crucible, the dashed cyan line is “solid + the oxygen still in the air that is about to react”.',
    burn: 'Light the ribbon',
    c4scene: 'Crucible + magnesium · progress {p}%',
    c4plot: 'Mass (g) against reaction progress',
    lgSolid: 'Solid in the crucible', lgLedger: 'Solid + oxygen yet to react', lgOxygen: 'Oxygen taken in from the air',
    s4readout: 'Progress {p}%: solid {solid} g (magnesium {mg} g + magnesium oxide {mgo} g); oxygen taken in from the air {o2} g; balance reading {reading} g. Ledger: {solid} − {o2} = {mg0} g, exactly the magnesium you started with.',
    s4bet: 'Back to your bet in step 0: you said “{bet}”. Three set-ups, three answers — sealed flask: unchanged ({r0} g); open cup: {drop} g lighter (the carbon dioxide left); magnesium: {gain} g heavier (oxygen came in). Not one atom was created or lost; all that changed was which substances the balance was weighing.',
    s4hint: 'What to watch: press “Light the ribbon”. The orange line climbs from 2.4 g while the dashed cyan line stays level at {total} g; the gap between them is the oxygen that has not come in yet, and it closes when the burning ends.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Atoms only change partners, so the total mass stays the same',
    s5fin: 'A chemical reaction only makes atoms <strong>change partners</strong>: the number of each kind of atom stays the same and each atom keeps its mass, so the total mass of the substances that react equals the total mass of the substances formed — the <strong>law of conservation of mass</strong>. If the reading on a balance changes, something must have crossed onto or off the balance: gas leaving an open cup, or oxygen joining from the air in a fire.',
    formula: 'every element matches ⇒ both sides weigh the same (not the reverse)\nopen-cup reading + gas that escaped = original total',
    boundary: 'Where this model stops: masses use relative atomic masses in ideal proportions, and assume the reaction goes to completion and the gas leaves or enters in full. Real experiments have errors — a little CO₂ stays dissolved, water evaporates, burning magnesium gives off white smoke, and a balloon on the flask feels the air’s buoyancy. Conservation of mass is an account kept in atoms; it does not promise the balance never wavers by a division. Calcium carbonate and calcium chloride are made of ions; each is drawn as one formula’s worth of balls.',
    linksTitle: 'Where to next',
    lk1: '→ Molecules & atoms, step 4: when molecules regroup, can atoms appear or vanish?',
    lk2: '→ Equation balancing, step 0: why an equation has to balance',
    lk3: '→ Atomic structure, step 1: the proton count decides which element an atom is',
    lk4: '→ Fire triangle, step 1: cover a candle and the flame dies when the oxygen runs out',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Mass Conservation · Not a Single Atom Lost”.'
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
