'use strict';
// Molecular shapes lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '分子构型 · 只靠「互相躲开」能算出多少',
    back: '← 知识索引',
    compare: '对照另一版本：分子构型 · 电子对互相躲开 →',
    navLabel: '分子构型步骤导航',
    tagline: '中心原子周围有几团电子：有的连着别的原子，有的不成键。它们都带负电、互相排斥，于是尽量躲开。只凭「躲开」这一条，能不能算出甲烷是正四面体、水分子是弯的？本页用一个能亲手调的模型算一遍，拿实验键角对账，看它在哪里失灵，最后看形状怎样决定分子有没有极性。',
    nav0: '0 只有推力', nav1: '1 为何不是平的', nav2: '2 孤对电子', nav3: '3 数电子域', nav4: '4 极性', nav5: '5 收束',
    yaw: '转动视角（只改观察方向）',

    s0k: '第 0 步 · 只有推力',
    s0t: 'N 团电子围着中心原子，最后会停在哪里？',
    s0e: '这一步要回答：中心原子周围有 N 团电子，彼此只会互相排斥，它们最终会怎样排开？<strong>电子域</strong>指中心原子周围一团集中的电子：一根化学键（单键、双键都只算一团），或一对不成键的<strong>孤对电子</strong>。这一步先让所有电子域一模一样。模型：每个电子域是一个点，只能在以中心原子为球心的球面上滑动（离核距离固定）；任意两点之间像同号电荷一样互相推（同号电荷的推力怎样随距离变弱，见 <a class="xlink" href="../../../physics/electromagnetism/electric-fields/#step0">→ 电场页第 0 步：一个点电荷周围的场</a>）。总排斥能 E = Σ 1/r，对所有两两组合求和，r 是两点间距离，球半径取 1；E 越小越稳定。每一轮，每个点都顺着自己受到的推力在球面上挪一小段，E 随之下降，直到降不动为止。「电子域互相躲开、尽量拉开角度」这个想法叫 <strong>VSEPR（价层电子对互斥理论）</strong>。',
    nSlider: '电子域个数 N', kSlider: '查看第几轮', play0: '从随机位置松开', reseed0: '换个随机起点',
    c0a: '三维视图：电子域与轨迹', c0b: '总排斥能 E 随轮数',
    s0lgDom: '电子域（点）', s0lgTrail: '走过的轨迹', s0lgCore: '中心原子',
    s0readout: '第 {k}/{K} 轮 · 总排斥能 E = {E} · 两两夹角：{angles}{done}',
    s0done: '。E 已不再下降，这就是最终排布。',
    s0min: '最小夹角 {m}°（还在挪动）',
    s0hint: '观察顺序：先按「从随机位置松开」，在「三维视图」里看每个点拖出的轨迹，同时看「总排斥能 E 随轮数」那条曲线先陡降、后变平。曲线变平时，读数里的夹角就是答案。再把 N 从 2 拖到 6，每个 N 重放一次：2 → 180°；3 → 120°，三点共面；4 → 109.5°，不是 90°；5 → 90°、120° 两种夹角并存；6 → 相邻全是 90°。「换个随机起点」用另一组初始位置，最后的夹角和刚才一样，只是整体朝向不同。「查看第几轮」可以拖回中途任意一轮。',

    s1k: '第 1 步 · 为什么不是平的',
    s1t: '四团电子为什么不排成平面十字？',
    s1e: '这一步要回答：画在纸上，甲烷 CH₄ 的四个 H 像一个十字，相邻夹角 90°；可教科书说是 109.5°。哪种排法的排斥能更小？把四个电子域分成两对：上面一对在左右方向张开，下面一对在前后方向张开，两对互相垂直。滑杆调的是<strong>同一对内部的夹角 θ</strong>。θ = 180° 时四个点全落在一个平面上，就是平面十字（相邻夹角 90°）；θ 变小，上面一对往上收、下面一对往下收，两对之间的<strong>跨对夹角</strong>随之变大。总排斥能仍按第 0 步的 E = Σ 1/r 算，越小越稳定。',
    tSlider: '同对夹角 θ', flat1: '设成平面十字（180°）', clear1: '清除记录',
    c1a: '三维视图：四个电子域', c1b: '总排斥能 E 与 θ',
    s1lgPair1: '上面一对', s1lgPair2: '下面一对', s1lgCurve: 'E(θ)', s1lgDot: '试过的 θ',
    s1readout: '同对夹角 θ = {t}° · 跨对夹角 = {a}° · 最小夹角 {m}° · E = {E}（比 E 最小处高 {d}）',
    s1hint: '观察顺序：从 θ = 180°（平面十字）往小拖，盯住「总排斥能 E 与 θ」曲线上的青点：E 先下降，在 θ ≈ 109.5° 见底，再往小拖又升高。见底那一刻，读数里同对夹角和跨对夹角相等，六个夹角都是 109.47°：四个点正好是<strong>正四面体</strong>的四个顶点。平面十字的问题是相邻两点只隔 90°；正四面体把最近的两点也拉开到 109.5°，所以更稳定。白点是你试过的每个 θ。',

    s2k: '第 2 步 · 孤对电子',
    s2t: '孤对电子为什么把键角挤小？',
    s2e: '这一步要回答：NH₃ 的中心原子 N 周围也是 4 个电子域，可实测 H–N–H 是 106.7°，不是 109.5°；H₂O 更小，104.5°。差别在<strong>孤对电子</strong>：不成键、只被中心原子一个核拉住的一对电子。它离核更近，在核周围铺得更开，推起邻居来比成键电子对更狠。模型用一个数表示「更狠」：孤对的<strong>排斥权重 λ</strong>。两团电子之间的排斥按「权重 × 权重 ÷ 距离」计，成键对权重为 1，孤对为 λ；λ = 1 就回到第 0 步的「完全一样」。<strong>键角</strong>指两个成键原子与中心原子构成的夹角，孤对本身不算在键角里。λ 是模型参数，不是测出来的量：这一步就是看它取多大时，模型键角能对上实验。',
    domSlider: '电子域个数 N', loneSlider: '其中孤对电子', lamSlider: '孤对排斥权重 λ',
    c2a: '三维视图：粉色是孤对', c2b: '最小键角与 λ',
    s2lgBond: '成键原子', s2lgLone: '孤对电子', s2lgCurve: '模型最小键角', s2lgRef: '实验值',
    s2readout: '电子域 N = {N}，其中孤对 {L} 对（{axe}）→ {shape}。键角：{angles}。{extra}',
    s2ref: '{mol} 实验 {v}°',
    s2noLone: '没有孤对，λ 不起作用。',
    s2eqTie: 'λ = 1 时孤对和成键对一模一样，放在轴向还是腰上能量相同。',
    s2eq: '孤对都在「腰上」（赤道位置）：那里离它 90° 的邻居只有 2 个，轴向位置有 3 个。',
    s2ll: '两对孤对相隔 {v}°。',
    s2fail: '注意：模型把两对孤对放成只隔 {v}°，实验（如 XeF₄）是上下相对 180°。这个简单模型在这里失灵，见第 3 步。',
    s2fit: '离 {mol} 实验值差 {d}°。',
    s2hint: '观察顺序：先保持 N = 4、孤对 1（NH₃ 那种），把 λ 从 1 往大拖：「三维视图」里三个原子往下合拢；「最小键角与 λ」曲线上的青点往下走，碰到橙色虚线（NH₃ 实验 106.7°）时 λ ≈ 1.25。再把孤对改成 2（H₂O 那种），λ 留在 1.25：模型键角 104.4°，紧挨 H₂O 实验的 104.5°。同一个 λ 同时对上两种分子，所以后面几步都固定 λ = 1.25。再试 N = 5：孤对总是跑到「腰上」。',

    s3k: '第 3 步 · 数电子域',
    s3t: '拿到分子式，怎样数出电子域？模型对得上实验吗？',
    s3e: '这一步要回答：给你 NH₃、SO₂、ClF₃ 这样的分子式，怎样知道中心原子周围有几个电子域、几对孤对？模型预测的键角又准不准？数法三步：① 中心原子最外层有几个电子，叫<strong>价电子</strong>（最外层电子决定化学性质，见 <a class="xlink" href="../../../chemistry/matter/atomic-structure/#step3">→ 原子结构页第 3 步：最外层电子</a>）；② 每连一个原子，用掉的电子数等于键的级数：单键 1 个，双键 2 个；③ 剩下的电子两两成对，就是孤对。电子域 N = 连着的原子数 + 孤对数，双键也只算一个电子域。然后用第 2 步定下的 λ = 1.25 让模型排开，和实验键角（气态分子，标准数据表）对比。下表一次列出全部 11 个分子，点一行或点按钮看三维形状。',
    c3a: '三维视图：模型给出的形状',
    s3lgBond: '成键原子', s3lgLone: '孤对电子', s3lgCore: '中心原子',
    thMol: '分子', thAxe: 'AXₘEₙ', thModel: '模型键角', thExp: '实验键角', thDiff: '差',
    s3readout: '{mol}：中心 {c} 有 {v} 个价电子，连 {X} 个 {x}，用掉 {used} 个，剩 {left} 个 → {L} 对孤对。电子域 N = {X} + {L} = {N}（{axe}），形状：{shape}。模型键角 {model}，实验 {exp}。{note}',
    noteSO2: '模型偏小约 5°：S=O 是双键，一个双键电子域比单键更「胖」，会把 O–S–O 撑开；本模型把所有成键域都当成一样，没算这一点。',
    noteXeF4: '模型在这里失灵：它把两对孤对放成只隔约 95°，四个 F 被挤歪；实验是两对孤对上下相对（180°），四个 F 在一个平面上、夹角正好 90°。两对孤对之间的实际排斥比「权重相乘」强得多，这个简单模型没抓住。',
    noteClF3: '两对孤对都占「腰上」的位置，三个 F 排成 T 字；模型键角比实验小 {a}–{b}°。',
    noteGood: '模型与实验相差不超过 {d}°。',
    s3hint: '观察顺序：先依次点 CH₄、NH₃、H₂O：都是 4 个电子域，孤对从 0 增加到 2，键角从 109.5° 一路收小，模型和实验差都在 1° 以内。再对比 BF₃ 与 NH₃：都连 3 个原子，NH₃ 多一对孤对，一个是平面三角形、一个是三角锥形。最后看表里「差」最大的两行 SO₂ 和 XeF₄，读一读它们的说明：模型在哪里不灵、为什么。',

    s4k: '第 4 步 · 极性',
    s4t: '形状为什么决定分子有没有极性？',
    s4e: '这一步要回答：CO₂ 和 H₂O 都是一个中心原子连两个原子，为什么 H₂O 有极性、CO₂ 没有？<strong>电负性</strong>是原子争夺共用电子的本事（鲍林标度，数越大越能抢；它在周期表上怎样变化，见 <a class="xlink" href="../../../chemistry/matter/periodic-trends/#step0">→ 元素周期律页第 0 步</a>）。一根键两端电负性不同，共用电子就偏向一边，形成<strong>键偶极</strong>：画成一支箭头，从电负性小的一端指向大的一端，长度取两端电负性之差 ΔEN。所有键偶极<strong>按方向相加</strong>后剩下的叫<strong>净偶极</strong>；剩 0 就是非极性分子。注意：这里的箭头长度是电负性差，不是实测的偶极矩（单位德拜 D），也没有算孤对电子自己的贡献，所以只用它判断「是不是 0」，不比大小。',
    bendSlider: '键角 θ（两根键相同，每根 ΔEN = 1.24）', clear4: '清除记录',
    c4a: 'AX₂ 分子：键偶极与净偶极', c4b: '净偶极与键角 θ', c4c: '三维视图：键偶极与净偶极',
    s4lgBond: '键偶极', s4lgNet: '净偶极', s4lgCurve: '2 × 1.24 × cos(θ/2)', s4lgDot: '试过的 θ',
    s4readoutA: '键角 θ = {t}° · 净偶极 = 2 × 1.24 × cos({h}°) = {n}（电负性差单位）{z}',
    s4zero: '：两支箭头正好反向，完全抵消。',
    s4readoutB: '{mol}：每根 {c}–{x} 键 ΔEN = {d}，{dir}。{k} 根键偶极按模型形状相加，净偶极 = {n} → {verdict}。实测偶极矩 {D} D。',
    dirOut: '箭头指向 {x}', dirIn: '箭头指向中心的 {c}',
    polar: '不为 0，有极性', nonpolar: '抵消为 0，非极性',
    s4hint: '观察顺序：先只拖键角 θ：在「AX₂ 分子」图里看两支青色键偶极和橙色净偶极。θ = 180°（CO₂ 那样的直线）时两支正好反向，净偶极为 0；θ 越小，净偶极越长；H₂O 的 104.5° 附近约为 1.5。白点记下你试过的角。然后点下面的分子按钮：凡是净偶极算出来为 0 的，实测偶极矩也是 0；不为 0 的，实测也不为 0。CH₄ 的 C–H 键本身有偶极（箭头指向 C），但四支按正四面体排开，加起来正好是 0。',

    s5k: '第 5 步 · 收束',
    s5t: '一条规则走了多远',
    quizPrompt: '想一想：BF₃ 和 NH₃ 都是一个中心原子连 3 个原子，为什么 NH₃ 有极性而 BF₃ 没有？',
    quizA: 'N 的电负性比 B 大，所以 NH₃ 才有键偶极', quizB: 'N 上多一对孤对电子，三个键被推成三角锥，键偶极不再在一个平面里互相抵消', quizC: 'NH₃ 比 BF₃ 轻',
    check: '核对',
    correct: '对。BF₃ 的 B–F 键偶极其实更大（ΔEN = 1.94），但三支在一个平面上互成 120°，加起来为 0。NH₃ 多了一对孤对，4 个电子域排成四面体，三个 H 只占其中三个顶点，键偶极全朝一侧，加不成 0。',
    wrong: '再想想：BF₃ 的 B–F 键偶极（ΔEN = 1.94）比 N–H（0.84）还大，可 BF₃ 没有极性。回第 4 步分别点 BF₃ 和 NH₃，看三支箭头的排法。',
    s5fin: '本页只用了一条规则：<strong>中心原子周围的电子域互相排斥、尽量拉开角度</strong>。电子域都一样时，它直接给出 180°、120°、109.5°、90° 这些角（第 0、1 步）；给孤对电子一个稍大的推力 λ = 1.25，NH₃、H₂O 的键角就和实验差不到 1°（第 2、3 步）；形状一定，键偶极能不能抵消也就定了（第 4 步）。',
    formula: '电子域 N = 连着的原子数 + 孤对数\n孤对数 = (价电子数 − 成键用掉的电子数) ÷ 2\n排斥能 E = Σ wᵢwⱼ / rᵢⱼ（成键 w = 1，孤对 w = λ）',
    boundary: '模型边界：电子域被当成球面上的点，没有轨道、键长和原子大小；所有成键域一样「胖」，所以双键分子（SO₂）偏差约 5°；两对孤对之间的排斥被低估，XeF₄ 这样的分子会排错。净偶极只用电负性差、不含孤对的贡献，只能判断是否为 0。真实键角来自量子力学计算或光谱、衍射实验，这个模型只是抓住了主要原因。',
    linksTitle: '接着看',
    lk1: '原子结构 · 第 3 步：最外层电子为什么决定化学性质',
    lk2: '元素周期律 · 第 0 步：电负性在周期表上怎样分布',
    lk3: '电场 · 第 0 步：同号电荷的推力怎样随距离变弱',
    lk4: '同分异构 · 第 3 步：同样的原子换种连法，沸点差多少',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分子构型 · 电子对互相躲开》的平行版本。 · Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Molecular Shapes · Electron Pairs Keeping Out of Each Other”.',

    shape_linear: '直线形', shape_trigonal: '平面三角形', shape_bent: '弯曲形（V 形）', shape_tetrahedral: '正四面体形', shape_pyramidal: '三角锥形',
    shape_bipyramidal: '三角双锥形', shape_seesaw: '跷跷板形', shape_tshape: 'T 形', shape_octahedral: '正八面体形', shape_squarePyramidal: '四方锥形', shape_squarePlanar: '平面正方形',
    shapeOf: '原子排成{s}',
    angleList: '{v}°×{n}', sep: '，', orSep: ' / '
  },
  en: {
    pageTitle: 'Molecular Shapes · How Far “Keep Away” Gets You',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Molecular Shapes · Electron Pairs Keeping Out of Each Other →',
    navLabel: 'Molecular shapes steps',
    tagline: 'A central atom is surrounded by a few clumps of electrons: some hold other atoms, some don’t bond at all. They are all negative, so they push each other away. Is that one rule enough to work out that methane is a tetrahedron and water is bent? This page runs a model you can tune, checks its bond angles against experiment, shows where it breaks, and ends with how shape decides whether a molecule is polar.',
    nav0: '0 Pure repulsion', nav1: '1 Why not flat', nav2: '2 Lone pairs', nav3: '3 Counting domains', nav4: '4 Polarity', nav5: '5 Wrap-up',
    yaw: 'Turn the view (viewing direction only)',

    s0k: 'Step 0 · Pure repulsion',
    s0t: 'Where do N clumps of electrons around an atom come to rest?',
    s0e: 'The question here: a central atom has N clumps of electrons around it, and all they do is repel one another. How do they end up arranged? An <strong>electron domain</strong> is one such clump: a chemical bond (single or double, it counts once) or a non-bonding <strong>lone pair</strong>. For now every domain is identical. The model: each domain is a point that can only slide over a sphere centred on the atom (its distance from the nucleus is fixed), and every pair of points pushes apart like two like charges (how that push fades with distance: <a class="xlink" href="../../../physics/electromagnetism/electric-fields/#step0">→ Electric Fields, step 0: the field of one point charge</a>). The total repulsion energy is E = Σ 1/r over every pair, with r the distance between the two points on a sphere of radius 1; lower E means more stable. Each round, every point slides a little along the push it feels, E drops, and this repeats until E stops dropping. “Domains spread out as far as they can” is the idea behind <strong>VSEPR (valence-shell electron-pair repulsion)</strong>.',
    nSlider: 'Number of domains N', kSlider: 'Show round', play0: 'Release from random spots', reseed0: 'New random start',
    c0a: '3D view: domains and their paths', c0b: 'Total repulsion E by round',
    s0lgDom: 'Electron domain (point)', s0lgTrail: 'Path so far', s0lgCore: 'Central atom',
    s0readout: 'Round {k}/{K} · total repulsion E = {E} · pair angles: {angles}{done}',
    s0done: '. E has stopped falling — this is the final arrangement.',
    s0min: 'smallest angle {m}° (still moving)',
    s0hint: 'What to watch: press “Release from random spots” and follow the paths each point traces in the 3D view, while the “Total repulsion E by round” curve falls steeply and then flattens. Once it is flat, the angles in the readout are the answer. Then drag N from 2 to 6 and replay each: 2 → 180°; 3 → 120°, all in one plane; 4 → 109.5°, not 90°; 5 → a mix of 90° and 120°; 6 → every neighbour at 90°. “New random start” begins somewhere else and lands on the same angles, just turned a different way. “Show round” lets you scrub back to any moment of the run.',

    s1k: 'Step 1 · Why not flat',
    s1t: 'Why don’t four domains lie flat as a cross?',
    s1e: 'The question here: drawn on paper, the four H atoms of methane CH₄ form a cross with 90° between neighbours, yet textbooks say 109.5°. Which arrangement has less repulsion? Split the four domains into two pairs: the upper pair opens left–right, the lower pair opens front–back, so the two pairs are at right angles to each other. The slider sets the <strong>angle θ inside each pair</strong>. At θ = 180° all four points lie in one plane — the flat cross, with 90° between neighbours. As θ shrinks, the upper pair folds up, the lower pair folds down, and the <strong>angle across pairs</strong> grows. Repulsion is still E = Σ 1/r from step 0; lower is more stable.',
    tSlider: 'Angle inside a pair θ', flat1: 'Set the flat cross (180°)', clear1: 'Clear trail',
    c1a: '3D view: four domains', c1b: 'Total repulsion E vs θ',
    s1lgPair1: 'Upper pair', s1lgPair2: 'Lower pair', s1lgCurve: 'E(θ)', s1lgDot: 'θ you tried',
    s1readout: 'Angle inside a pair θ = {t}° · angle across pairs = {a}° · smallest angle {m}° · E = {E} ({d} above the lowest E)',
    s1hint: 'What to watch: start at θ = 180° (the flat cross) and drag down while watching the cyan dot on the “Total repulsion E vs θ” curve. E falls, bottoms out near θ ≈ 109.5°, then rises again. At the bottom the readout shows the inside and across angles are equal — all six angles are 109.47°, and the four points sit on the corners of a <strong>regular tetrahedron</strong>. The flat cross loses because neighbours are only 90° apart; the tetrahedron pushes even the closest pair out to 109.5°. White dots mark every θ you tried.',

    s2k: 'Step 2 · Lone pairs',
    s2t: 'Why do lone pairs squeeze the bond angle?',
    s2e: 'The question here: nitrogen in NH₃ also has 4 electron domains, yet the measured H–N–H angle is 106.7°, not 109.5°; in H₂O it is even smaller, 104.5°. The difference is the <strong>lone pair</strong>: a pair of electrons that bonds to nothing and is held by the central nucleus alone. It sits closer to the nucleus and spreads wider around it, so it shoves its neighbours harder than a bonding pair does. The model puts one number on “harder”: the lone pair’s <strong>repulsion weight λ</strong>. Two domains repel by weight × weight ÷ distance, with weight 1 for a bonding pair and λ for a lone pair; λ = 1 is step 0’s “all identical”. A <strong>bond angle</strong> is the angle between two bonded atoms as seen from the central atom — lone pairs are not part of any bond angle. λ is a model setting, not a measurement: this step is about finding the λ at which the model’s angles match experiment.',
    domSlider: 'Number of domains N', loneSlider: 'Of which lone pairs', lamSlider: 'Lone-pair weight λ',
    c2a: '3D view: pink = lone pair', c2b: 'Smallest bond angle vs λ',
    s2lgBond: 'Bonded atom', s2lgLone: 'Lone pair', s2lgCurve: 'Model smallest bond angle', s2lgRef: 'Experiment',
    s2readout: 'N = {N} domains, {L} of them lone pairs ({axe}) → {shape}. Bond angles: {angles}. {extra}',
    s2ref: '{mol} measured {v}°',
    s2noLone: 'No lone pairs, so λ has no effect.',
    s2eqTie: 'At λ = 1 a lone pair is identical to a bond, so axial and waist positions have the same energy.',
    s2eq: 'Lone pairs sit on the “waist” (equatorial positions): there only 2 neighbours are 90° away, versus 3 at an axial position.',
    s2ll: 'The two lone pairs are {v}° apart.',
    s2fail: 'Note: the model puts the two lone pairs only {v}° apart; experiment (e.g. XeF₄) has them opposite, at 180°. This simple model fails here — see step 3.',
    s2fit: '{d}° from the measured {mol}.',
    s2hint: 'What to watch: keep N = 4 with 1 lone pair (like NH₃) and drag λ up from 1. In the 3D view the three atoms fold downwards; on the “Smallest bond angle vs λ” curve the cyan dot slides down and meets the orange dashed line (NH₃ measured, 106.7°) at λ ≈ 1.25. Now switch to 2 lone pairs (like H₂O) and leave λ at 1.25: the model gives 104.4°, right next to the measured 104.5°. One λ fits two different molecules, so the rest of the page fixes λ = 1.25. Then try N = 5: lone pairs always move to the waist.',

    s3k: 'Step 3 · Counting domains',
    s3t: 'From a formula to a domain count — does the model match experiment?',
    s3e: 'The question here: given a formula like NH₃, SO₂ or ClF₃, how do you know how many domains and lone pairs the central atom has — and how good are the model’s angles? Count in three moves: ① how many electrons the central atom has in its outer shell, its <strong>valence electrons</strong> (why the outer shell matters: <a class="xlink" href="../../../chemistry/matter/atomic-structure/#step3">→ Atomic Structure, step 3: the outermost electrons</a>); ② each attached atom uses up as many of them as the bond order — 1 for a single bond, 2 for a double; ③ whatever is left pairs up into lone pairs. Domains N = attached atoms + lone pairs; a double bond is still one domain. The model then spreads them out with step 2’s λ = 1.25, and we compare with measured angles (gas-phase molecules, standard tables). The table lists all 11 molecules at once; click a row or a button to see the 3D shape.',
    c3a: '3D view: the shape the model gives',
    s3lgBond: 'Bonded atom', s3lgLone: 'Lone pair', s3lgCore: 'Central atom',
    thMol: 'Molecule', thAxe: 'AXₘEₙ', thModel: 'Model angles', thExp: 'Measured', thDiff: 'Diff.',
    s3readout: '{mol}: central {c} has {v} valence electrons and bonds to {X} × {x}, using {used}; {left} are left → {L} lone pair(s). Domains N = {X} + {L} = {N} ({axe}), shape: {shape}. Model angles {model}, measured {exp}. {note}',
    noteSO2: 'The model is about 5° low: S=O is a double bond, and a double-bond domain is “fatter” than a single bond, which props O–S–O open. The model treats every bonding domain the same, so it misses this.',
    noteXeF4: 'The model breaks here: it puts the two lone pairs only about 95° apart and bends the four F atoms out of line. Experimentally the lone pairs sit opposite each other (180°) and the four F atoms are flat with exactly 90° between neighbours. Real lone-pair–lone-pair repulsion is much stronger than “weight × weight”, and this simple model does not capture it.',
    noteClF3: 'Both lone pairs take waist positions and the three F atoms form a T; the model angles are {a}–{b}° smaller than measured.',
    noteGood: 'Model and experiment agree to within {d}°.',
    s3hint: 'What to watch: click CH₄, NH₃ and H₂O in turn. All have 4 domains; as lone pairs go from 0 to 2 the angle closes from 109.5°, and the model stays within 1° of experiment. Then compare BF₃ with NH₃: both bond to 3 atoms, but NH₃ has one more lone pair, so one is trigonal planar and the other a pyramid. Finally look at the two rows with the biggest “Diff.” — SO₂ and XeF₄ — and read their notes: where the model fails, and why.',

    s4k: 'Step 4 · Polarity',
    s4t: 'Why does shape decide whether a molecule is polar?',
    s4e: 'The question here: CO₂ and H₂O both have one central atom bonded to two others, so why is H₂O polar and CO₂ not? <strong>Electronegativity</strong> is how strongly an atom pulls on shared electrons (Pauling scale, bigger pulls harder; how it varies across the table: <a class="xlink" href="../../../chemistry/matter/periodic-trends/#step0">→ Periodic Trends, step 0</a>). When the two ends of a bond differ, the shared electrons lean one way, giving a <strong>bond dipole</strong>: an arrow from the less to the more electronegative end, as long as the difference ΔEN. Adding all the bond dipoles <strong>as arrows</strong> leaves the <strong>net dipole</strong>; if nothing is left, the molecule is non-polar. Note that arrow length here is an electronegativity difference, not a measured dipole moment (in debye, D), and lone pairs’ own contribution is left out — so use it to tell zero from non-zero, not to rank sizes.',
    bendSlider: 'Bond angle θ (two identical bonds, ΔEN = 1.24 each)', clear4: 'Clear trail',
    c4a: 'AX₂ molecule: bond and net dipoles', c4b: 'Net dipole vs bond angle θ', c4c: '3D view: bond and net dipoles',
    s4lgBond: 'Bond dipole', s4lgNet: 'Net dipole', s4lgCurve: '2 × 1.24 × cos(θ/2)', s4lgDot: 'θ you tried',
    s4readoutA: 'Bond angle θ = {t}° · net dipole = 2 × 1.24 × cos({h}°) = {n} (ΔEN units){z}',
    s4zero: ': the two arrows point exactly opposite and cancel.',
    s4readoutB: '{mol}: each {c}–{x} bond has ΔEN = {d}, {dir}. Adding the {k} bond dipoles in the model’s shape gives a net dipole of {n} → {verdict}. Measured dipole moment {D} D.',
    dirOut: 'arrow pointing to {x}', dirIn: 'arrow pointing in to the central {c}',
    polar: 'non-zero, polar', nonpolar: 'cancels to 0, non-polar',
    s4hint: 'What to watch: first drag only θ and look at the two cyan bond dipoles and the orange net dipole in the “AX₂ molecule” picture. At θ = 180° (a straight line, like CO₂) they point exactly opposite and the net is 0; the smaller θ gets, the longer the net arrow — about 1.5 near water’s 104.5°. White dots record the angles you tried. Then click the molecule buttons: every molecule whose computed net dipole is 0 also has a measured dipole moment of 0, and every non-zero one is non-zero in experiment too. CH₄’s C–H bonds each have a dipole (pointing in to C), but four of them spread as a tetrahedron add up to exactly 0.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'How far one rule went',
    quizPrompt: 'Think: BF₃ and NH₃ both have one central atom bonded to 3 others. Why is NH₃ polar while BF₃ is not?',
    quizA: 'N is more electronegative than B, so only NH₃ has bond dipoles', quizB: 'N carries an extra lone pair that pushes the three bonds into a pyramid, so the bond dipoles no longer cancel within a plane', quizC: 'NH₃ is lighter than BF₃',
    check: 'Check',
    correct: 'Right. BF₃’s B–F bond dipoles are actually bigger (ΔEN = 1.94), but the three lie in one plane at 120° and sum to 0. NH₃’s extra lone pair makes 4 domains in a tetrahedron; the three H atoms take three corners, all bond dipoles lean the same way, and they cannot sum to 0.',
    wrong: 'Look again: BF₃’s B–F dipole (ΔEN = 1.94) is bigger than N–H (0.84), yet BF₃ is non-polar. Go back to step 4 and click BF₃ and NH₃ to compare how their three arrows are arranged.',
    s5fin: 'The page used a single rule: <strong>the electron domains around a central atom repel and spread as far apart as they can</strong>. With identical domains it gives 180°, 120°, 109.5° and 90° directly (steps 0 and 1). Give lone pairs a slightly stronger push, λ = 1.25, and NH₃ and H₂O land within 1° of experiment (steps 2 and 3). Once the shape is fixed, so is whether the bond dipoles can cancel (step 4).',
    formula: 'Domains N = attached atoms + lone pairs\nLone pairs = (valence electrons − electrons used in bonds) ÷ 2\nRepulsion E = Σ wᵢwⱼ / rᵢⱼ (bond w = 1, lone pair w = λ)',
    boundary: 'Model limits: domains are points on a sphere — no orbitals, bond lengths or atom sizes. Every bonding domain is equally “fat”, so a double-bonded molecule (SO₂) is off by about 5°, and lone-pair–lone-pair repulsion is underestimated, so molecules like XeF₄ come out wrong. The net dipole uses electronegativity differences only and ignores lone pairs, so it can only say zero or not. Real bond angles come from quantum-mechanical calculations or from spectroscopy and diffraction; this model captures the main cause, not the details.',
    linksTitle: 'Where to next',
    lk1: 'Atomic Structure · step 3: why the outermost electrons set the chemistry',
    lk2: 'Periodic Trends · step 0: how electronegativity is spread across the table',
    lk3: 'Electric Fields · step 0: how the push between like charges fades with distance',
    lk4: 'Isomers · step 3: same atoms, different connections, different boiling points',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分子构型 · 电子对互相躲开》的平行版本。 · Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Molecular Shapes · Electron Pairs Keeping Out of Each Other”.',

    shape_linear: 'linear', shape_trigonal: 'trigonal planar', shape_bent: 'bent', shape_tetrahedral: 'tetrahedral', shape_pyramidal: 'trigonal pyramidal',
    shape_bipyramidal: 'trigonal bipyramidal', shape_seesaw: 'seesaw', shape_tshape: 'T-shaped', shape_octahedral: 'octahedral', shape_squarePyramidal: 'square pyramidal', shape_squarePlanar: 'square planar',
    shapeOf: 'atoms form a {s} shape',
    angleList: '{v}° ×{n}', sep: ', ', orSep: ' / '
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
  if (typeof window.refreshShapes === 'function') window.refreshShapes();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
