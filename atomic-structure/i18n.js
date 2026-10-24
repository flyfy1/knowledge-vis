'use strict';
const STR = {
  "zh": {
    "docTitle": "原子结构 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "原子结构",
    "tagline": "原子不是实心球：中间一个极小的核几乎占了全部质量，电子在外面按层排布。质子数定它是谁，最外层电子数定它活泼不活泼——改数字、当场算，全部账都摆在明处。",
    "foot": "原子结构 · 一步一交互",
    "reset": "重置本步",
    "resetQuiz": "重置自测",
    "navLabel": "步骤导航",
    "canvasLabel": "本步的原子结构示意图；操作方法见上方说明",
    "nav0": "0 放大原子",
    "nav1": "1 质子定身份",
    "nav2": "2 电子分层",
    "nav3": "3 最外层定脾气",
    "nav4": "4 离子",
    "nav5": "5 自测",
    "nav6": "6 收束",
    "lbProton": "质子",
    "lbNeutron": "中子",
    "lbElectron": "电子",
    "lbNucleus": "原子核",
    "lbShell": "第 {n} 层",
    "s0pick": "挑出的这一颗（碳）",
    "s0k": "第 0 步 · 放大",
    "s0t": "把一个原子放大：中间一个核，外面一大片空",
    "s0e": "这一步要回答：一个原子里面是实心的吗？上一页把物质放大成一群<strong>粒子</strong>（构成物质的小单元）；这一页挑出其中一颗——一个碳原子——再放大。拖动滑杆放大它：中间那一小团是<strong>原子核</strong>（原子正中间、几乎扛了全部质量的一小团，里面有质子和中子）；外面圈上的点是<strong>电子</strong>（带负电的小粒子）。圈只是电子大致住的楼层，不是跑道（第 2 步细说）。点「高亮原子核 / 高亮电子」可以分开看这两部分。",
    "zoomLab": "放大程度（键盘可调）",
    "hlNuc": "高亮原子核",
    "hlElec": "高亮电子",
    "s0ro": "画布实测：核的直径 {nd}、整个原子（量到最外层电子圈）直径 {ad}，核只占约 {pct}%——其余全是空的。可真实原子的核只有原子直径的约十万分之一，按真比例画比一个像素还小；这张图把核放大了上万倍才看得见。核虽小，却占了原子质量的约 99.97% 以上（电子的质量小到几乎可以忽略）。",
    "s1k": "第 1 步 · 身份",
    "s1t": "质子数决定它是谁",
    "s1e": "这一步要回答：碳和氧差在哪，是什么让它「是」碳？核里有两种粒子：<strong>质子</strong>（带正电的粒子）和<strong>中子</strong>（不带电、只添重量的粒子）。数一数质子有几个，这个数叫<strong>核电荷数</strong>（每个质子带一份正电荷，核的总正电正好等于质子数）。用下面的 − / + 按钮给核增减质子（一次一个），看元素名怎么变。",
    "zLab": "质子数 Z（核电荷数）",
    "s1ro": "质子数 Z = {z} → 它是 <b>{name}</b>（符号 {sym}）。中子数 N = {n}（这是该元素最常见的中子数），质量数 A = Z + N = {a}（质量数 = 质子数 + 中子数，就是核里粒子的总数）。电子数先跟质子数一样多：{e} 个（中性原子，第 4 步再让它变）。中子只改变质量数 A，不改变它是谁——身份只认质子数。",
    "s1hint": "本页只排到钙：Z 钳在 1…20。名字与符号是查表给的数据，但身份判定不靠查表——Z 是几号，它就是几号元素。",
    "s2k": "第 2 步 · 排布",
    "s2t": "电子分层排布：每层能坐几个有定数",
    "s2e": "这一步要回答：电子在核外是怎么住的，是挤成一团还是有规矩？先选一个原子（快捷钮或用 Z 的 − / +），电子数从跟质子一样多开始。再用电子的 − / + 一个一个增减：页面把电子<strong>逐个填进电子层</strong>（电子大致住的同心圈层）——先填满里层，才轮到外层。看每个电子落座的位置，再对下面的排布式。",
    "presetLab": "快捷原子（选了它，电子数跟着 = Z）：",
    "eLab": "电子数 e",
    "fillBtn": "重新逐个填一次",
    "s2ro": "元素 {sym}（Z = {z}），电子数 e = {e}。排布式：<b>{cfg}</b>（从里层到外层每层各住几个，总和 = {e}）。本页写死的简化容量：第一层最多 2 个、第二层最多 8 个、第三层最多 8 个，再多就进第四层。",
    "s2model": "两句模型说明：①圈只是电子的<strong>住址分区</strong>，是示意画法——电子实际不是沿着圈跑的，落座后只在本层里小幅活动。②每层 2 / 8 / 8 是<strong>初中简化排布规则</strong>，真实排布更细，高中会展开；在本页范围内（Z、e 都不超过 20）按这条规则算出的排布与课本一致。",
    "s3k": "第 3 步 · 脾气",
    "s3t": "最外层决定活泼不活泼",
    "s3e": "这一步要回答：排布里哪一位说了算，为什么氖「高冷」、钠「一点就着」？点对照组的原子逐个看。读数只报三件事：<strong>最外层电子数</strong>（排布式里最后一个数）、这一层满没满、还差几个。图上最外层整层会高亮。用词都是「容易 / 不容易」：这是按最外层满不满做的定性判断，不是「一定会反应」的断言。",
    "cmpLab": "对照组：",
    "s3ro": "{sym}（{name}）：排布 {cfg}。最外层 {outer} 个，本层容量 {cap}，{full}。判定：<b>{verdict}</b>",
    "fullYes": "已填满",
    "fullNo": "还差 {gap} 个才满",
    "vStable": "稳定——最外层已满，不容易得到电子、也不容易失去电子",
    "vLose": "容易失去电子——最外层只有 {outer} 个，甩掉它们比凑满 {cap} 个近得多",
    "vGain": "容易得到电子——只差 {gap} 个就满了，抓几个比甩掉 {outer} 个近",
    "s4k": "第 4 步 · 离子",
    "s4t": "电子得失之后：离子",
    "s4e": "这一步要回答：原子失去或得到电子，会变成什么？先选原子，再拖电子数滑杆。总电荷由一个式子定死：<strong>电荷 = 质子数 − 电子数</strong>（每个质子算 +1、每个电子算 −1）。带了净电荷的原子叫<strong>离子</strong>：带正电的叫阳离子、带负电的叫阴离子。看画布上排布和符号右上角的电荷怎么一起变。",
    "preset4Lab": "一步到位看离子：",
    "s4ro": "{sym}：质子 {z} 个，电子 {e} 个，排布 {cfg}（离子的排布 = 得失电子之后，剩下的电子重新分层）。电荷 = {z} − {e} = <b>{q}</b>。{kind}",
    "kindNeutral": "电荷为 0：还是中性原子，不叫离子。",
    "kindCation": "带正电：这是阳离子，写成 {ion}。",
    "kindAnion": "带负电：这是阴离子，写成 {ion}。",
    "kindBare": "电子全失光了：只剩裸核，质子还在。",
    "s4explore": "探索区：电子多到第四层超过 8 个，已经超出初中 2 / 8 / 8 简化规则能表达的范围。这里的排布式只为数清电子、算对电荷，别把它当作真实分层——真实排布更细，高中会展开。",
    "s5k": "第 5 步 · 自测",
    "s5t": "自测：四道题，全由前面的同一组规矩出题判定",
    "s5e": "每题点一个选项。答对锁定并给出解析；答错只给一句提示，解析不会提前出现——四题的答案在答对之前都不在本页的文字里。",
    "q1t": "①某原子的质子数 Z = 9。它是什么元素？",
    "q1an": "解析：元素身份只认质子数。Z = 9 的原子就是氟（F）——与它有几个电子、几个中子都无关（第 1 步）。顺带核对：F 的排布是 2、7。",
    "dg_q1_Ne": "氖是 Z = 10。题目给的是 9 个质子，数准了再选。",
    "dg_q1_Na": "钠是 Z = 11，比 9 多了两个。",
    "dg_q1_O": "氧是 Z = 8，就差一个——身份只认质子数，差一个就是另一家。",
    "q2t": "②电子数 e = 12 的原子，电子排布式是？",
    "q2an": "解析：按 2 / 8 / 8 逐层填：第一层先填满 2 个，第二层再填满 8 个，剩 2 个进第三层 → 2、8、2（第 2 步）。",
    "dg_q2_2_2_8": "第二层只坐了 2 个就往第三层塞——规矩是先把里层填满。",
    "dg_q2_8_2_2": "第一层最多只能坐 2 个，8 个塞不进第一层。",
    "dg_q2_2_8_1_1": "第三层才坐了 1 个就开第四层——先把当前层填满，或者填到电子用完为止。",
    "q3t": "③钠原子（Na，Z = 11）的最外层电子数是几个？判定是什么？",
    "q3o_lose1": "1 个，容易失去电子",
    "q3o_gain7": "7 个，容易得到电子",
    "q3o_stable8": "8 个，稳定",
    "q3o_lose8": "8 个，容易失去电子",
    "q3an": "解析：Na 的排布是 2、8、1，最外层是最后一个数：1 个。容量 8、只坐 1 个（不到一半），甩掉这 1 个比抓 7 个凑满近得多 → 容易失去电子（第 3 步）。",
    "dg_q3_gain7": "7 是「还差几个满」算出来的（8 − 1），不是最外层的个数。Na 的排布 2、8、1 里，最后一个数才是。",
    "dg_q3_stable8": "8 是第二层的满员数，不是钠的最外层。排布 2、8、1 的最后一个数是 1。",
    "dg_q3_lose8": "方向对了一半（确实容易失去），但个数错了：要失的是最外层的 1 个，不是 8 个。",
    "q4t": "④氧原子（O，Z = 8）现在有电子 e = 10。它是什么？电荷是多少？",
    "q4o_an2": "阴离子，电荷 −2",
    "q4o_cat2": "阳离子，电荷 +2",
    "q4o_neu0": "中性原子，电荷 0",
    "q4o_an1": "阴离子，电荷 −1",
    "q4an": "解析：电荷 = 质子数 − 电子数 = 8 − 10 = −2。电子比质子多 2 个 → 带负电的阴离子 O²⁻；它的排布是 2、8，最外层刚好填满（第 4 步）。",
    "dg_q4_cat2": "正负看谁多：电子 10 个比质子 8 个多，净电荷是负的。先算 8 − 10 再下结论。",
    "dg_q4_neu0": "质子 8、电子 10，数目不相等，电荷不为 0。",
    "dg_q4_an1": "方向对了（阴离子），但电荷算错了一位：8 − 10 = −2，不是 −1。",
    "correct": "答对了，已锁定。",
    "scoreQ": "自测进度：已答对 {k}/4 题。",
    "s5hint": "四题全对，通关。带走四句话：身份只认质子数；排布由电子数按 2 / 8 / 8 逐层填出；脾气看最外层满不满；电荷 = 质子数 − 电子数，得失电子之后就是离子。",
    "s6k": "第 6 步 · 收束",
    "s6t": "一个原子的身份证与脾气，都写在数里",
    "s6e": "这页把一个原子拆成了三个数：<strong>质子数 Z</strong> 定身份、<strong>电子数 e</strong> 定排布与电荷、<strong>最外层电子数</strong>定脾气。三个数全部由页面同一组纯函数当场算出——画布、读数、自测用的是同一套账，你在哪一步改数，别处的结论都跟着重算。原子内部的结构先到这里；一群原子凑在一起会发生什么（结合成分子、反应中谁得谁失），是后面的页面要讲的。",
    "card1t": "模型边界一：尺度",
    "card1b": "核与电子的尺寸是放大示意：真实核直径只有原子直径的约十万分之一，本页画布上放大了上万倍（第 0 步的实测口径）。",
    "card2t": "模型边界二：层圈不是跑道",
    "card2b": "同心圈只是电子的住址分区，是示意画法：电子实际不是沿着圈跑的。真实电子的运动图景，要到以后更深的模型里才展开。",
    "card3t": "模型边界三：简化排布",
    "card3b": "2 / 8 / 8 是初中简化排布规则，本页也只算 Z = 1…20；更重的元素、更细的分层不在本页口径内。中子只按最常见同位素取定值，只影响质量数。",
    "linkParticles": "→ 回粒子页第 1 步：一群粒子的温度——温度是粒子平均动能的读数（粒子页讲「一群」，本页讲「一个」）",
    "s6next": "后续页面（先在此占个位，暂不挂链）：原子怎么结合成分子与化学键、化学反应里质量为什么守恒——都会用到本页的三个数。"
  },
  "en": {
    "docTitle": "Atomic Structure · One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "Atomic Structure",
    "tagline": "An atom is not a solid ball: a tiny nucleus at the centre holds almost all the mass, and electrons arrange themselves in layers outside it. The proton count decides what it is; the outermost electron count decides how reactive it is — change the numbers and watch everything recompute.",
    "foot": "Atomic Structure · One Interaction at a Time",
    "reset": "Reset this step",
    "resetQuiz": "Reset the quiz",
    "navLabel": "Step navigation",
    "canvasLabel": "Diagram of the atomic structure for this step; controls are described above",
    "nav0": "0 Zoom in",
    "nav1": "1 Protons fix identity",
    "nav2": "2 Electron layers",
    "nav3": "3 The outer layer",
    "nav4": "4 Ions",
    "nav5": "5 Quiz",
    "nav6": "6 Wrap-up",
    "lbProton": "proton",
    "lbNeutron": "neutron",
    "lbElectron": "electron",
    "lbNucleus": "nucleus",
    "lbShell": "Layer {n}",
    "s0pick": "the picked one (carbon)",
    "s0k": "STEP 0 · ZOOM IN",
    "s0t": "Zoom into one atom: a tiny nucleus, and a lot of empty space",
    "s0e": "This step answers: is an atom solid inside? The previous page zoomed matter into a crowd of <strong>particles</strong> (the tiny units matter is made of). Here we pick out one of them — a carbon atom — and zoom further. Drag the slider to enlarge it: the small cluster in the middle is the <strong>nucleus</strong> (the tiny lump at the very centre that carries almost all the mass; it holds protons and neutrons), and the dots on the rings are <strong>electrons</strong> (tiny particles with negative charge). The rings only mark roughly which layer an electron lives in — they are not tracks (Step 2 explains). Use the highlight buttons to look at the two parts separately.",
    "zoomLab": "Zoom (arrow keys work)",
    "hlNuc": "Highlight the nucleus",
    "hlElec": "Highlight the electrons",
    "s0ro": "Measured on this canvas: the nucleus spans {nd} units across, the whole atom (out to its outermost electron ring) {ad} — the nucleus is only about {pct}% of the width; the rest is empty space. In a real atom the nucleus is about one hundred-thousandth of the atom's diameter; drawn to true scale it would be smaller than a single pixel. This diagram enlarges the nucleus by well over ten thousand times so it can be seen at all. Tiny as it is, the nucleus holds about 99.97% or more of the atom's mass (electrons weigh almost nothing in comparison).",
    "s1k": "STEP 1 · IDENTITY",
    "s1t": "The proton count decides what it is",
    "s1e": "This step answers: what makes carbon carbon, and oxygen oxygen? The nucleus holds two kinds of particle: <strong>protons</strong> (particles with positive charge) and <strong>neutrons</strong> (particles with no charge that only add weight). Count the protons and you get the <strong>nuclear charge number</strong> (each proton carries one unit of positive charge, so the nucleus's total positive charge is exactly the proton count). Use the − / + buttons to add or remove protons one at a time, and watch the element's name change.",
    "zLab": "Protons Z (nuclear charge number)",
    "s1ro": "Protons Z = {z} → this is <b>{name}</b> (symbol {sym}). Neutrons N = {n} (the most common neutron count for this element); mass number A = Z + N = {a} (the mass number is just the total count of particles in the nucleus). For now the electrons match the protons: {e} (a neutral atom — Step 4 will change that). Neutrons only change the mass number A, never the identity: identity is decided by protons alone.",
    "s1hint": "This page stops at calcium: Z is clamped to 1…20. Names and symbols are data from a table, but the identity itself is not a table lookup — whatever Z is, that is the element with that number.",
    "s2k": "STEP 2 · ARRANGEMENT",
    "s2t": "Electrons sit in layers — each layer has a fixed capacity",
    "s2e": "This step answers: how do the electrons arrange themselves outside the nucleus — in a lump, or by rules? Pick an atom first (a preset, or Z − / +); the electron count starts equal to the proton count. Then add or remove electrons one at a time with the e − / + buttons: the page seats the electrons <strong>one by one into electron layers</strong> (the concentric zones electrons roughly live in) — an inner layer fills completely before the next one starts. Watch where each electron lands, then check the arrangement formula below.",
    "presetLab": "Preset atoms (picking one also sets e = Z):",
    "eLab": "Electrons e",
    "fillBtn": "Replay the seating",
    "s2ro": "Element {sym} (Z = {z}), electrons e = {e}. Arrangement: <b>{cfg}</b> (electrons in each layer, innermost first; they add up to {e}). The fixed simplified capacities on this page: layer 1 holds at most 2, layer 2 at most 8, layer 3 at most 8; any more go to layer 4.",
    "s2model": "Two model notes: (1) The rings are only the electrons' <strong>address zones</strong> — a diagram convention. Electrons do not actually run along the rings; once seated, an electron only shifts a little within its own layer. (2) The 2 / 8 / 8 capacities are a <strong>simplified arrangement rule for middle school</strong>; the real rules are finer and come later. Within this page's range (Z and e up to 20), this rule reproduces the textbook arrangements.",
    "s3k": "STEP 3 · TEMPERAMENT",
    "s3t": "The outermost layer decides how reactive it is",
    "s3e": "This step answers: which number in the arrangement runs the show — why is neon aloof while sodium flares up? Click through the comparison set. The readout reports only three things: the <strong>outermost layer count</strong> (the last number of the arrangement), whether that layer is full, and how many are missing; the outermost layer is highlighted on the diagram. The wording is deliberately 'tends to': this is a qualitative judgement from fullness, not a promise that a reaction will happen.",
    "cmpLab": "Comparison set:",
    "s3ro": "{sym} ({name}): arrangement {cfg}. Outermost layer: {outer}, capacity {cap} — {full}. Verdict: <b>{verdict}</b>",
    "fullYes": "full",
    "fullNo": "{gap} short of full",
    "vStable": "Stable — the outer layer is full, so it neither gains nor loses electrons easily",
    "vLose": "Tends to lose electrons — only {outer} sit in the outer layer; shedding them is much closer than filling all {cap}",
    "vGain": "Tends to gain electrons — just {gap} short of full; grabbing a few beats shedding {outer}",
    "s4k": "STEP 4 · IONS",
    "s4t": "After electrons come and go: ions",
    "s4e": "This step answers: what does an atom become when it loses or gains electrons? Pick an atom, then drag the electron slider. The total charge is fixed by one formula: <strong>charge = protons − electrons</strong> (each proton counts +1, each electron −1). An atom carrying a net charge is an <strong>ion</strong>: positive ones are cations, negative ones are anions. Watch the arrangement on the diagram and the charge at the symbol's top-right corner change together.",
    "preset4Lab": "Jump straight to an ion:",
    "s4ro": "{sym}: protons {z}, electrons {e}, arrangement {cfg} (an ion's arrangement = the electrons that remain, re-layered). Charge = {z} − {e} = <b>{q}</b>. {kind}",
    "kindNeutral": "Charge 0: still a neutral atom, not an ion.",
    "kindCation": "Positively charged: a cation, written {ion}.",
    "kindAnion": "Negatively charged: an anion, written {ion}.",
    "kindBare": "All electrons gone: only the bare nucleus remains — the protons are still there.",
    "s4explore": "Exploration zone: this many electrons puts more than 8 in the fourth layer — beyond what the simplified 2 / 8 / 8 middle-school rule can express. Here the arrangement string only serves to count the electrons so the charge comes out right; do not read it as the real layering — the real rules are finer and come later.",
    "s5k": "STEP 5 · QUIZ",
    "s5t": "Quiz: four questions, all marked by the same rules",
    "s5e": "Pick one option per question. A correct pick locks the question and reveals the worked analysis; a wrong pick earns only a hint — the analysis never appears early, and none of the answers are written anywhere on this page before you earn them.",
    "q1t": "Q1. An atom has proton count Z = 9. Which element is it?",
    "q1an": "Analysis: identity is decided by protons alone. Any atom with Z = 9 is fluorine (F) — its electron and neutron counts are irrelevant (Step 1). Bonus check: fluorine's arrangement is 2, 7.",
    "dg_q1_Ne": "Neon is Z = 10. The question gives 9 protons — count carefully, then pick.",
    "dg_q1_Na": "Sodium is Z = 11 — two more than 9.",
    "dg_q1_O": "Oxygen is Z = 8, just one short — identity counts protons exactly, and one off is a different element.",
    "q2t": "Q2. An atom has e = 12 electrons. What is its electron arrangement?",
    "q2an": "Analysis: fill layer by layer with capacities 2 / 8 / 8: layer 1 takes 2, layer 2 takes 8, the remaining 2 go to layer 3 → 2, 8, 2 (Step 2).",
    "dg_q2_2_2_8": "Layer 2 was left with only 2 while layer 3 took the rest — the rule is to fill the inner layer completely first.",
    "dg_q2_8_2_2": "Layer 1 holds at most 2; 8 cannot fit into it.",
    "dg_q2_2_8_1_1": "Layer 3 got just 1 before layer 4 opened — finish the current layer first, or stop when you run out of electrons.",
    "q3t": "Q3. A sodium atom (Na, Z = 11): how many electrons are in its outermost layer, and what is the verdict?",
    "q3o_lose1": "1 — tends to lose electrons",
    "q3o_gain7": "7 — tends to gain electrons",
    "q3o_stable8": "8 — stable",
    "q3o_lose8": "8 — tends to lose electrons",
    "q3an": "Analysis: sodium's arrangement is 2, 8, 1, so the outermost layer is the last number: 1. With capacity 8 and only 1 seated (at most half), shedding that 1 is far closer than grabbing 7 to fill up → tends to lose electrons (Step 3).",
    "dg_q3_gain7": "7 is the 'how many short of full' number (8 − 1), not the count in the outer layer. In 2, 8, 1, the last number is the outer layer.",
    "dg_q3_stable8": "8 is layer 2's full capacity, not sodium's outer layer. The arrangement 2, 8, 1 ends in 1.",
    "dg_q3_lose8": "Half right on direction (it does tend to lose), wrong on the count: it would lose the 1 outermost electron, not 8.",
    "q4t": "Q4. An oxygen atom (O, Z = 8) currently has e = 10 electrons. What is it, and what is its charge?",
    "q4o_an2": "An anion, charge −2",
    "q4o_cat2": "A cation, charge +2",
    "q4o_neu0": "A neutral atom, charge 0",
    "q4o_an1": "An anion, charge −1",
    "q4an": "Analysis: charge = protons − electrons = 8 − 10 = −2. Two more electrons than protons → a negatively charged anion, O²⁻; its arrangement is 2, 8, with the outer layer exactly full (Step 4).",
    "dg_q4_cat2": "The sign follows whoever has more: 10 electrons beat 8 protons, so the net charge is negative. Compute 8 − 10 before concluding.",
    "dg_q4_neu0": "8 protons and 10 electrons are not equal in number, so the charge is not 0.",
    "dg_q4_an1": "Right direction (anion), wrong charge by one: 8 − 10 = −2, not −1.",
    "correct": "Correct — locked.",
    "scoreQ": "Quiz progress: {k}/4 correct.",
    "s5hint": "All four correct. Take away four sentences: identity is protons alone; the arrangement is the electron count filled layer by layer at 2 / 8 / 8; temperament reads the outermost layer's fullness; charge = protons − electrons, and an atom with a net charge is an ion.",
    "s6k": "STEP 6 · WRAP-UP",
    "s6t": "An atom's identity and temperament are both written in its numbers",
    "s6e": "This page reduced an atom to three numbers: <strong>protons Z</strong> fix the identity, <strong>electrons e</strong> fix the arrangement and the charge, and the <strong>outermost count</strong> fixes the temperament. All three come from one set of functions on this page — the canvas, the readouts and the quiz keep the same books, so changing a number in any step recomputes every conclusion that depends on it. That is as far as the inside of one atom goes here; what happens when atoms join into molecules, and who gains or loses electrons in a reaction, belongs to later pages.",
    "card1t": "Model boundary 1: scale",
    "card1b": "The nucleus and electron sizes are enlarged for the diagram: a real nucleus is about one hundred-thousandth of the atom's diameter, and this canvas enlarges it by well over ten thousand times (Step 0's measured figures).",
    "card2t": "Model boundary 2: rings are not tracks",
    "card2b": "The concentric rings are only the electrons' address zones — a diagram convention. Electrons do not actually run along the rings; their real picture of motion belongs to deeper models later on.",
    "card3t": "Model boundary 3: simplified arrangement",
    "card3b": "The 2 / 8 / 8 capacities are a simplified middle-school rule, and this page only computes Z = 1…20; heavier elements and finer sub-layer rules are outside its scope. Neutrons take the most common isotope's fixed count and only affect the mass number.",
    "linkParticles": "→ Back to Particles & States, Step 1: the temperature of a crowd of particles — temperature reads the particles' average kinetic energy (that page is about a crowd; this one is about a single atom)",
    "s6next": "Coming later (placeholders for now, no links yet): how atoms join into molecules and chemical bonds, and why mass is conserved in a reaction — both will reuse this page's three numbers."
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
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
