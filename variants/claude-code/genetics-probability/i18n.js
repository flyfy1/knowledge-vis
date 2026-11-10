'use strict';
// Genetics & probability lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '遗传与概率 · 一株豌豆里的抛硬币',
    back: '← 知识索引',
    compare: '对照另一版本：遗传与概率 · 从配子到表型 →',
    navLabel: '遗传与概率步骤导航',
    tagline: '孟德尔的豌豆给出了 3:1 和 9:3:3:1，可这些比例是从哪来的？七步里你会从「一株豌豆把哪个基因传下去」出发，一路推到 Punnett 方格、一小批后代里的随机波动、两对基因的乘法法则、基因连锁，最后用条件概率回答「一株紫花是杂合子的概率」。页面上每个数都由当前设置实时算出。',
    nav0: '0 分离', nav1: '1 方格', nav2: '2 一小批后代', nav3: '3 两对基因', nav4: '4 连锁', nav5: '5 条件概率', nav6: '6 收束',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《遗传与概率 · 从配子到表型》的平行版本。',
    clearRecord: '清空记录',
    phAB: '紫花圆粒', phAb: '紫花皱粒', phaB: '白花圆粒', phab: '白花皱粒', purple: '紫花', white: '白花', round: '圆粒', wrinkled: '皱粒', treeRoot: '紫花植株',

    s0k: '第 0 步 · 一个亲本',
    s0t: '一株豌豆会把哪一个等位基因传给后代？',
    s0e: '这一步要回答：一株豌豆会把它的哪一个花色基因传下去，概率各是多少？每株豌豆的细胞里有两份花色基因（一份来自父本、一份来自母本），每一份叫一个<strong>等位基因</strong>：A 让花开成紫色，a 让花开成白色。两份合起来叫<strong>基因型</strong>，例如 Aa。产生<strong>配子</strong>（花粉或卵细胞这样的生殖细胞）时，两份等位基因彼此分开，每个配子只带走其中一份；带走哪一份就像抛一枚公平的硬币，各占 1/2。这就是<strong>分离定律</strong>（<a class="xlink" href="../../../biology/cells/meiosis/#step1">→ 减数分裂页第 1 步：两次分裂怎样把成对的染色体分开</a>）。',
    parentGeno: '亲本基因型',
    c0aria: '亲本产生的配子序列，以及配子中 A 的比例随数量的变化',
    c0top: '亲本 {g} 最近产生的配子（最新的在最前）',
    c0bot: '已产生的配子中 A 的比例（虚线 = 理论值 {theory}）',
    c0empty: '还没有配子：按「产生 1 个配子」',
    axGametes: '配子数',
    lgA: '等位基因 A（紫花）', lga: '等位基因 a（白花）', lgShare: 'A 的比例',
    oneGamete: '产生 1 个配子', fiftyGametes: '再产生 50 个',
    s0readout0: '亲本 {g}：还没有配子。理论上配子带 A 的概率是 {theory}，带 a 的概率是 {theoryA}。',
    s0readout: '亲本 {g}：已产生 {n} 个配子，其中 A {nA} 个、a {na} 个，A 占 {share}（理论 {theory}）。',
    s0hint: '观察顺序：先选 Aa，连按几次「产生 1 个配子」，看配子一会儿是 A、一会儿是 a，没有固定规律；再按几次「再产生 50 个」，看比例曲线在 50% 上下摆动，摆幅越来越小。换成 AA 或 aa，曲线直接贴在 100% 或 0%：纯合子只有一种等位基因可给。1/2 说的是长期比例，并不保证每两个配子里恰好有一个 A。',

    s1k: '第 1 步 · 两个亲本',
    s1t: '两个亲本的配子随机相遇，后代会是什么样？',
    s1e: '这一步要回答：两个亲本杂交，后代每种基因型、每种花色的概率各是多少？受精时，父本的一个配子和母本的一个配子随机结合，两边的「抽取」互不影响（<strong>相互独立</strong>），所以某种组合的概率 = 两个配子概率的乘积。<strong>Punnett 方格</strong>把这件事画成一张表：行标是亲本 1 的两种配子，列标是亲本 2 的两种配子，每一格是一种组合，概率都是 1/2 × 1/2 = 1/4，格里写的是后代的基因型。<strong>表型</strong>是看得见的性状，这里就是花色：只要有一个 A 就开紫花（A 对 a <strong>完全显性</strong>），只有 aa 开白花。所以要先把基因型合并，才得到表型比例。',
    parent1: '亲本 1', parent2: '亲本 2',
    c1aria: 'Punnett 方格与基因型、表型概率条',
    c1sq: 'Punnett 方格：{g1} × {g2}', c1geno: '基因型概率', c1pheno: '表型概率',
    lgPurple: '紫花（至少一个 A）', lgWhite: '白花（aa）',
    s1readout: '{g1} × {g2}：基因型 AA : Aa : aa = {gAA} : {gAa} : {gaa}，表型 紫花 : 白花 = {dom} : {rec}。按 4 格计数：基因型 {cAA} : {cAa} : {caa}，表型 {cdom} : {crec}。',
    s1hint: '观察顺序：先让两个亲本都是 Aa，数方格的 4 格：AA 1 格、Aa 2 格、aa 1 格，紫花一共 3 格，这就是 1:2:1 和 3:1。再把亲本 2 换成 aa（这种和隐性纯合子的杂交叫测交），方格变成 2 格 Aa、2 格 aa，紫 : 白 = 1 : 1。最后试 AA × aa：四格全是 Aa，全部紫花。',

    s2k: '第 2 步 · 一小批后代',
    s2t: '两株 Aa 杂交，4 株后代一定是 3 紫 1 白吗？',
    s2e: '这一步要回答：3:1 是一个概率，落到一小批后代身上会是什么样？Aa × Aa 的每株后代都独立地以 1/4 的概率开白花。n 株后代里白花的株数 k 是随机的，它服从<strong>二项分布</strong>：P(k 株白花) = C(n, k) · (1/4)^k · (3/4)^(n−k)。其中 C(n, k) 是「n 株里哪 k 株开白花」的挑法数（<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ 排列组合页第 3 步：组合数 C(n, k) 怎么数</a>），(1/4)^k · (3/4)^(n−k) 是其中任意一种挑法发生的概率。紫色柱子是理论概率；按「模拟 100 批」会用随机数真的「种」出 100 批，每批 n 株，橙点标出每个 k 实际出现的比例。',
    nLabel: '每批后代株数 n',
    c2aria: '白花株数 k 的二项分布柱状图与模拟比例',
    c2title: '{n} 株后代里白花株数 k 的概率',
    axK: '白花株数 k',
    lgTheory: '理论概率（二项分布）', lgSim: '模拟中各 k 出现的比例',
    simFamilies: '模拟 100 批',
    s2readout: 'n = {n}：最可能的白花株数是 k = {mode}（概率 {pm}）；一株白花都没有的概率 = (3/4)^{n} = {p0}。{quarter}{sim}',
    s2quarter: '白花恰好占 1/4（k = {k}）的概率是 {pq}。',
    s2noQuarter: '{n} 不是 4 的倍数，白花不可能恰好占 1/4。',
    s2sim: '已模拟 {f} 批：平均每批 {mean} 株白花（理论 n/4 = {th}）。',
    s2hint: '观察顺序：先把 n 拖到 4，看 k = 1（恰好 3 紫 1 白）的柱子只有约 42%，k = 0（4 株全是紫花）也有约 32%。按「模拟 100 批」，橙点落在柱顶附近但不完全重合，多按几次会越来越贴近。再把 n 拖到 10：柱子铺得更开，每一个具体的 k 都不太可能，但平均仍是 n/4。改 n 会清空模拟记录。',
    quizPrompt: '想一想：两株 Aa 豌豆杂交，得到 4 株后代。哪句话对？',
    quizA: '一定是 3 株紫花、1 株白花', quizB: '恰好 3 紫 1 白的概率约 42%，不到一半', quizC: '4 株全是紫花是不可能的',
    check: '核对',
    correct: '对。P(k = 1) = 4 × (1/4) × (3/4)³ ≈ {p1}，不到一半；4 株全紫 P(k = 0) = (3/4)⁴ ≈ {p0}，并不罕见。3:1 描述的是大量后代的长期比例。',
    wrong: '再看柱状图：把 n 拖到 4，k = 1 那根柱子有多高？k = 0 那根是不是 0？',

    s3k: '第 3 步 · 两对基因',
    s3t: '同时看花色和种子形状，9:3:3:1 是怎么来的？',
    s3e: '这一步要回答：两对基因一起遗传时，四种表型的概率各是多少？第二对基因控制种子形状：B 让种子圆粒（显性），b 让种子皱粒（隐性）。如果两对基因位于不同的染色体上，形成配子时它们各自分离、互不影响，这叫<strong>自由组合定律</strong>（<a class="xlink" href="../../../biology/cells/meiosis/#step2">→ 减数分裂页第 2 步：不同对染色体怎样随机组合</a>）。于是 AaBb 产生 AB、Ab、aB、ab 四种配子，各 1/4，方格变成 4 × 4 = 16 格。还有一条捷径，叫<strong>乘法法则</strong>：两件相互独立的事同时发生的概率，等于各自概率的乘积。紫花的概率 × 圆粒的概率 = 紫花圆粒的概率。面积图把这个乘法画了出来：竖着切一刀按花色分，横着切一刀按种子形状分，每一块的面积就是一种表型的概率。',
    geneA: '花色', geneB: '种子形状',
    c3aria: '16 格 Punnett 方格，按四种表型着色',
    c3baria: '乘法法则的面积图',
    c3sq: '16 格方格：{p1} × {p2}',
    c3area: '乘法法则：面积 = 花色概率 × 种子概率',
    s3readout: '{p1} × {p2}：按 16 格计数，紫花圆粒 : 紫花皱粒 : 白花圆粒 : 白花皱粒 = {c}。乘法法则：{prod}。两种算法给出同一组概率。',
    s3hint: '观察顺序：先让两对都是「杂合 × 杂合」，数方格：紫花圆粒 9 格、紫花皱粒 3 格、白花圆粒 3 格、白花皱粒 1 格；再看面积图，9/16 正是 3/4 × 3/4 那一大块。然后只把花色换成 Aa × aa：面积图的竖线移到正中（紫花概率变为 1/2），方格比例变成 3 : 1 : 3 : 1，而横线一动不动，因为种子形状的概率没变。',

    s4k: '第 4 步 · 连锁',
    s4t: '两对基因挨在同一条染色体上，还能自由组合吗？',
    s4e: '这一步要回答：如果 A 和 B 在同一条染色体上，AaBb 产生的四种配子还是各占 1/4 吗？设这株亲本的一条染色体上是 A 和 B，另一条上是 a 和 b（记作 AB/ab）。同一条染色体上的基因倾向于一起进入配子，这叫<strong>连锁</strong>。只有当减数分裂时这一对染色体在两个基因之间发生<strong>交换</strong>（互换一段），才会产生 Ab、aB 这两种<strong>重组型</strong>配子；AB、ab 叫<strong>亲本型</strong>。重组型配子占全部配子的比例叫<strong>重组率</strong> r：r = 0 表示两个基因从不分开；r = 50% 时四种配子各 1/4，和自由组合分不出来（<a class="xlink" href="../../../biology/cells/meiosis/#step3">→ 减数分裂页第 3 步：交换怎样发生</a>）。想读出配子比例，可以做<strong>测交</strong>：让 AB/ab 与 aabb（白花皱粒）杂交，aabb 只能给出 ab 配子，所以后代的表型直接显示第一个亲本给了哪种配子。',
    testcross: '测交：× aabb', selfcross: '自交：× AB/ab',
    rLabel: '重组率 r',
    c4aria: '亲本染色体与四种配子的概率，以及后代表型概率',
    c4chrom: '亲本 AB/ab 的四种配子（灰底 = 重组型）',
    c4bars: '后代表型概率（虚线 = 自由组合时的值）',
    lgParental: '亲本型', lgRecomb: '重组型', lgIndep: '自由组合时的值', lgSimDot: '模拟比例',
    simOffspring: '模拟 200 株后代',
    s4readoutTC: 'r = {r}：配子 AB、ab 各 {par}，Ab、aB 各 {rec}。测交后代 紫花圆粒 : 紫花皱粒 : 白花圆粒 : 白花皱粒 = {ratio}。{sim}',
    s4readoutSelf: 'r = {r}：自交后代 紫花圆粒 {pAB}、紫花皱粒 {pAb}、白花圆粒 {paB}、白花皱粒 {pab}（自由组合时为 56.25%、18.75%、18.75%、6.25%）。{sim}',
    s4sim: '已模拟 {n} 株：重组型表型（紫花皱粒 + 白花圆粒）占 {obs}，据此估计 r ≈ {obs}。',
    s4simSelf: '模拟只对测交有效：自交后代的表型不能直接读出配子。',
    s4hint: '观察顺序：选「测交」，把 r 从 50% 慢慢拖到 0：两根亲本型柱子（紫花圆粒、白花皱粒）从 25% 长到 50%，两根重组型柱子缩到 0，虚线标的是自由组合时的 25%。按「模拟 200 株后代」，用重组型所占比例反推 r，这正是遗传学家估算重组率的办法；估计值会在真实 r 附近随机偏一点。再切到「自交」：r = 50% 时回到 9:3:3:1，r 越小，紫花圆粒和白花皱粒越多。改 r 或切换杂交方式会清空模拟记录。',

    s5k: '第 5 步 · 条件概率',
    s5t: '一株紫花后代是杂合子 Aa 的概率是多少？',
    s5e: '这一步要回答：已知 Aa × Aa 的某株后代开紫花，它是 Aa 的概率是多少？知道了「开紫花」这个<strong>证据</strong>，aa 那一格就不可能了，要划掉；剩下 3 格同样可能，其中 Aa 占 2 格，所以 P(Aa | 紫花) = 2/3，而不是 1/2。「P(X | Y)」读作「在 Y 成立的条件下 X 的概率」，叫<strong>条件概率</strong>：先按证据划掉不可能的格（分母变小），再在剩下的格里数。遗传咨询里常这样推算：一个显性表型的个体携带隐性基因的概率，以及它的后代出现隐性性状的概率。',
    evidence: '已知证据', evNone: '没有证据', evDom: '后代开紫花', evRec: '后代开白花',
    askIs: '问：它是', partnerLabel: '这株紫花再与', partnerAa0: '白花 aa 杂交', partnerAa1: '紫花 Aa 杂交', pnAa0: '白花 aa', pnAa1: '紫花 Aa',
    c5aria: 'Aa × Aa 的方格，与证据矛盾的格被划掉',
    c5sq: 'Aa × Aa：划掉与证据矛盾的格',
    c5baria: '概率树：紫花后代再杂交时出现白花的两条路径',
    c5tree: '紫花植株 × {partner}：通向白花后代的路径',
    s5readoutNone: '没有证据：4 格都可能，其中 {target} 占 {hit} 格，P({target}) = {p}。',
    s5readout: '证据：{ev}。划掉矛盾的格后剩 {kept} 格，其中 {target} 占 {hit} 格：P({target} | {ev}) = {p}。',
    s5readoutB: '这株紫花是 AA（概率 1/3）时，与{partner}杂交，后代开白花的概率是 {wAA}；是 Aa（概率 2/3）时是 {wAa}。合计 P(白花) = 1/3 × {wAA} + 2/3 × {wAa} = {total}。',
    s5hint: '观察顺序：先选「没有证据」、问「Aa」，得 1/2（4 格中占 2 格）；再选「后代开紫花」，aa 那格被划掉，同一个问题的答案变成 2/3：证据改变的是分母。然后看概率树：每条路径上的概率相乘，两条路径再相加，就是下一代开白花的概率；把杂交对象换成 Aa，再看结果怎样变。',

    s6k: '第 6 步 · 收束',
    s6t: '这些比例背后，是哪几条概率规则？',
    s6fin: '回顾：分离让每个配子以 1/2 的概率带走一个等位基因；受精是两次相互独立的抽取，所以方格里每格的概率是两个配子概率的乘积；显性关系把基因型合并成表型，得到 3:1；两对基因在不同染色体上时，再用一次乘法法则，得到 9:3:3:1；在同一条染色体上时，配子比例改由重组率 r 决定；有了表型这样的证据，就在剩下的格子里重新数。所有这些比例都是概率：一小批后代会围绕它们随机波动，后代越多越接近。',
    formula: 'P(Aa 亲本的配子带 A) = 1/2\nP(两件独立的事同时发生) = P(第一件) × P(第二件)\nP(X | 证据) = 符合证据且是 X 的格数 ÷ 符合证据的格数（各格等可能时）',
    boundary: '适用范围：本页假设完全显性，配子形成与受精都是公平随机的，各株后代彼此独立，没有选择、没有突变；自由组合只适用于位于不同染色体上（或在同一条染色体上相距很远）的基因；重组率最大为 50%。不完全显性、伴性遗传、多基因控制的性状不在本页范围内。',
    linksTitle: '接着去看',
    lk1: '减数分裂 · 第 2 步：不同对染色体怎样随机组合 →',
    lk2: '减数分裂 · 第 3 步：交换怎样产生重组型配子 →',
    lk3: '排列组合 · 第 3 步：组合数 C(n, k) →',
    lk4: '自然选择 · 第 4 步：偶然与选择，随机波动在种群里的后果 →'
  },
  en: {
    pageTitle: 'Genetics & Probability · Coin Flips Inside a Pea Plant',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Genetics & Probability · From Gametes to Phenotypes →',
    navLabel: 'Genetics and probability steps',
    tagline: 'Mendel\'s peas gave us 3:1 and 9:3:3:1, but where do those ratios come from? Over seven steps you will start from "which gene does one pea plant pass on?" and work your way through Punnett squares, the random scatter in a small batch of offspring, the product rule for two genes and gene linkage, ending with conditional probability: how likely is a purple-flowered plant to be a hidden carrier? Every number on the page is computed live from the current settings.',
    nav0: '0 Segregation', nav1: '1 Punnett square', nav2: '2 A small batch', nav3: '3 Two genes', nav4: '4 Linkage', nav5: '5 Conditional', nav6: '6 Wrap-up',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Genetics & Probability · From Gametes to Phenotypes".',
    clearRecord: 'Clear the record',
    phAB: 'purple, round', phAb: 'purple, wrinkled', phaB: 'white, round', phab: 'white, wrinkled', purple: 'purple', white: 'white', round: 'round', wrinkled: 'wrinkled', treeRoot: 'purple plant',

    s0k: 'Step 0 · One parent',
    s0t: 'Which of its two alleles does a pea plant pass on?',
    s0e: 'This step asks: which of its flower-colour genes does a pea plant pass on, and with what probability? Every pea plant carries two copies of the flower-colour gene in its cells, one inherited from each parent; each copy is called an <strong>allele</strong>. Allele A makes the flower purple, allele a makes it white. The pair together is the <strong>genotype</strong>, for example Aa. When the plant makes <strong>gametes</strong> (reproductive cells such as pollen or egg cells), the two alleles separate and each gamete gets just one of them; which one is like the toss of a fair coin, 1/2 each. This is the <strong>law of segregation</strong> (<a class="xlink" href="../../../biology/cells/meiosis/#step1">→ Meiosis, step 1: how two divisions pull paired chromosomes apart</a>).',
    parentGeno: 'Parent genotype',
    c0aria: 'The sequence of gametes from one parent and the share carrying A as the count grows',
    c0top: 'Latest gametes from parent {g} (newest first)',
    c0bot: 'Share of gametes so far carrying A (dashed = theory, {theory})',
    c0empty: 'No gametes yet: press "Make 1 gamete"',
    axGametes: 'gametes',
    lgA: 'allele A (purple)', lga: 'allele a (white)', lgShare: 'share carrying A',
    oneGamete: 'Make 1 gamete', fiftyGametes: 'Make 50 more',
    s0readout0: 'Parent {g}: no gametes yet. In theory a gamete carries A with probability {theory} and a with probability {theoryA}.',
    s0readout: 'Parent {g}: {n} gametes so far, {nA} carrying A and {na} carrying a, so A makes up {share} (theory {theory}).',
    s0hint: 'What to try: choose Aa and press "Make 1 gamete" a few times; the gametes come out A, then a, with no fixed pattern. Then press "Make 50 more" a few times and watch the share curve wobble around 50% with ever smaller swings. Switch to AA or aa and the curve sits flat at 100% or 0%: a plant with two identical alleles has only one kind to give. "1/2" describes the long-run share; it does not promise exactly one A in every two gametes.',

    s1k: 'Step 1 · Two parents',
    s1t: 'When two parents\' gametes meet at random, what do the offspring look like?',
    s1e: 'This step asks: when two parents are crossed, how likely is each offspring genotype and each flower colour? At fertilisation one gamete from each parent combines at random, and the two draws do not influence each other (they are <strong>independent</strong>), so the probability of a combination is the product of the two gamete probabilities. A <strong>Punnett square</strong> lays this out as a table: the row headers are parent 1\'s two gametes, the column headers are parent 2\'s, and every cell is one combination with probability 1/2 × 1/2 = 1/4, labelled with the offspring\'s genotype. The <strong>phenotype</strong> is the visible trait, here the flower colour: a single A is enough for purple (A is <strong>completely dominant</strong> over a), and only aa is white. So genotypes have to be pooled before you get the phenotype ratio.',
    parent1: 'Parent 1', parent2: 'Parent 2',
    c1aria: 'Punnett square with genotype and phenotype probability bars',
    c1sq: 'Punnett square: {g1} × {g2}', c1geno: 'Genotype probabilities', c1pheno: 'Phenotype probabilities',
    lgPurple: 'purple (at least one A)', lgWhite: 'white (aa)',
    s1readout: '{g1} × {g2}: genotypes AA : Aa : aa = {gAA} : {gAa} : {gaa}; phenotypes purple : white = {dom} : {rec}. Counting the 4 cells: genotypes {cAA} : {cAa} : {caa}, phenotypes {cdom} : {crec}.',
    s1hint: 'What to try: make both parents Aa and count the 4 cells: AA 1, Aa 2, aa 1, with 3 purple in all; that is 1:2:1 and 3:1. Switch parent 2 to aa (crossing with a recessive homozygote is called a test cross): the square becomes 2 Aa and 2 aa, purple : white = 1 : 1. Finally try AA × aa: all four cells are Aa and every plant is purple.',

    s2k: 'Step 2 · A small batch',
    s2t: 'Cross two Aa plants and get 4 offspring: must it be 3 purple and 1 white?',
    s2e: 'This step asks: 3:1 is a probability, so what happens in a small batch of offspring? Each offspring of Aa × Aa is white with probability 1/4, independently of the others. The number of white plants k among n offspring is random and follows a <strong>binomial distribution</strong>: P(k white) = C(n, k) · (1/4)^k · (3/4)^(n−k). Here C(n, k) counts the ways to choose which k of the n plants are white (<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ Counting & Permutations, step 3: how to count C(n, k)</a>), and (1/4)^k · (3/4)^(n−k) is the probability of any one such choice. The purple bars are the theoretical probabilities; "Simulate 100 batches" uses random numbers to actually "grow" 100 batches of n plants each, and the orange dots mark how often each k really turned up.',
    nLabel: 'Offspring per batch n',
    c2aria: 'Binomial bar chart of the number of white offspring k, with simulated shares',
    c2title: 'Chance of k white plants among {n} offspring',
    axK: 'white plants k',
    lgTheory: 'theoretical probability (binomial)', lgSim: 'share of simulated batches with each k',
    simFamilies: 'Simulate 100 batches',
    s2readout: 'n = {n}: the most likely number of white plants is k = {mode} (probability {pm}); the chance of no white plant at all is (3/4)^{n} = {p0}. {quarter}{sim}',
    s2quarter: 'The chance that exactly 1/4 are white (k = {k}) is {pq}. ',
    s2noQuarter: '{n} is not a multiple of 4, so exactly 1/4 white is impossible. ',
    s2sim: '{f} batches simulated so far: on average {mean} white plants per batch (theory n/4 = {th}).',
    s2hint: 'What to try: set n to 4. The bar for k = 1 (exactly 3 purple and 1 white) is only about 42%, and k = 0 (all four purple) is about 32%. Press "Simulate 100 batches": the orange dots land near the bar tops without matching them exactly, and pressing again pulls them closer. Then drag n to 10: the bars spread out, any particular k becomes fairly unlikely, yet the average stays n/4. Changing n clears the simulation record.',
    quizPrompt: 'Think it through: two Aa pea plants are crossed and produce 4 offspring. Which statement is true?',
    quizA: 'It will be exactly 3 purple and 1 white', quizB: 'Exactly 3 purple and 1 white has about a 42% chance, under half', quizC: 'Four purple plants is impossible',
    check: 'Check',
    correct: 'Right. P(k = 1) = 4 × (1/4) × (3/4)³ ≈ {p1}, under half; all four purple, P(k = 0) = (3/4)⁴ ≈ {p0}, is not rare at all. 3:1 describes the long-run share over many offspring.',
    wrong: 'Look at the bar chart again: set n to 4. How tall is the bar for k = 1? Is the bar for k = 0 really zero?',

    s3k: 'Step 3 · Two genes',
    s3t: 'Tracking flower colour and seed shape together: where does 9:3:3:1 come from?',
    s3e: 'This step asks: when two genes are inherited together, how likely is each of the four phenotypes? A second gene controls seed shape: B gives round seeds (dominant), b gives wrinkled seeds (recessive). If the two genes sit on different chromosomes, they separate independently when gametes form; this is the <strong>law of independent assortment</strong> (<a class="xlink" href="../../../biology/cells/meiosis/#step2">→ Meiosis, step 2: how different chromosome pairs sort at random</a>). So AaBb makes four kinds of gamete, AB, Ab, aB and ab, at 1/4 each, and the square grows to 4 × 4 = 16 cells. There is also a shortcut, the <strong>product rule</strong>: the probability that two independent events both happen is the product of their probabilities. P(purple) × P(round) = P(purple and round). The area diagram draws this multiplication: one vertical cut splits by flower colour, one horizontal cut by seed shape, and each block\'s area is the probability of one phenotype.',
    geneA: 'Flower colour', geneB: 'Seed shape',
    c3aria: '16-cell Punnett square coloured by the four phenotypes',
    c3baria: 'Area diagram of the product rule',
    c3sq: '16-cell square: {p1} × {p2}',
    c3area: 'Product rule: area = colour probability × shape probability',
    s3readout: '{p1} × {p2}: counting the 16 cells, purple round : purple wrinkled : white round : white wrinkled = {c}. Product rule: {prod}. Both methods give the same probabilities.',
    s3hint: 'What to try: keep both genes at "heterozygote × heterozygote" and count the square: 9 purple round, 3 purple wrinkled, 3 white round, 1 white wrinkled. In the area diagram, 9/16 is exactly the big 3/4 × 3/4 block. Now change only the colour cross to Aa × aa: the vertical line in the area diagram moves to the middle (P(purple) becomes 1/2), the square becomes 3 : 1 : 3 : 1, and the horizontal line does not move, because the seed-shape probabilities have not changed.',

    s4k: 'Step 4 · Linkage',
    s4t: 'If two genes sit on the same chromosome, do they still assort independently?',
    s4e: 'This step asks: if A and B lie on the same chromosome, are the four gametes of AaBb still 1/4 each? Suppose one of the parent\'s chromosomes carries A and B and its partner carries a and b (written AB/ab). Genes on the same chromosome tend to enter a gamete together; this is called <strong>linkage</strong>. Only when the two partner chromosomes <strong>cross over</strong> between the two genes during meiosis (swapping a segment) do the <strong>recombinant</strong> gametes Ab and aB appear; AB and ab are the <strong>parental</strong> types. The share of gametes that are recombinant is the <strong>recombination frequency</strong> r: r = 0 means the genes never separate; at r = 50% the four gametes are 1/4 each and you cannot tell linkage from independent assortment (<a class="xlink" href="../../../biology/cells/meiosis/#step3">→ Meiosis, step 3: how crossing over happens</a>). To read off the gamete shares, use a <strong>test cross</strong>: cross AB/ab with aabb (white, wrinkled). Since aabb can only give ab gametes, each offspring\'s phenotype reveals exactly which gamete the first parent contributed.',
    testcross: 'Test cross: × aabb', selfcross: 'Self-cross: × AB/ab',
    rLabel: 'Recombination frequency r',
    c4aria: 'Parent chromosomes, the probabilities of the four gametes, and offspring phenotype probabilities',
    c4chrom: 'The four gametes of parent AB/ab (grey = recombinant)',
    c4bars: 'Offspring phenotype probabilities (dashed = independent assortment)',
    lgParental: 'parental type', lgRecomb: 'recombinant type', lgIndep: 'value under independent assortment', lgSimDot: 'simulated share',
    simOffspring: 'Simulate 200 offspring',
    s4readoutTC: 'r = {r}: gametes AB and ab are {par} each, Ab and aB {rec} each. Test-cross offspring purple round : purple wrinkled : white round : white wrinkled = {ratio}. {sim}',
    s4readoutSelf: 'r = {r}: self-cross offspring are purple round {pAB}, purple wrinkled {pAb}, white round {paB}, white wrinkled {pab} (independent assortment gives 56.25%, 18.75%, 18.75%, 6.25%). {sim}',
    s4sim: '{n} offspring simulated: recombinant phenotypes (purple wrinkled + white round) make up {obs}, so r is estimated at about {obs}.',
    s4simSelf: 'The simulation only works for the test cross: self-cross phenotypes do not reveal the gametes directly.',
    s4hint: 'What to try: choose "Test cross" and drag r slowly from 50% down to 0. The two parental bars (purple round, white wrinkled) grow from 25% to 50% while the two recombinant bars shrink to 0; the dashed line marks the 25% of independent assortment. Press "Simulate 200 offspring" and read r back from the recombinant share; this is how geneticists estimate recombination frequencies, and the estimate scatters a little around the true r. Then switch to "Self-cross": at r = 50% you are back at 9:3:3:1, and the smaller r gets, the more purple round and white wrinkled plants there are. Changing r or the cross clears the simulation record.',

    s5k: 'Step 5 · Conditional probability',
    s5t: 'How likely is a purple-flowered offspring to be a heterozygote Aa?',
    s5e: 'This step asks: an offspring of Aa × Aa has purple flowers; how likely is it to be Aa? Knowing the <strong>evidence</strong> "purple" rules out the aa cell, so cross it off. The remaining 3 cells are equally likely and 2 of them are Aa, so P(Aa | purple) = 2/3, not 1/2. "P(X | Y)" reads "the probability of X given that Y holds" and is called a <strong>conditional probability</strong>: first cross off the cells the evidence rules out (the denominator shrinks), then count within what is left. Genetic counselling uses exactly this reasoning: how likely is someone with the dominant phenotype to carry the recessive allele, and how likely are their offspring to show the recessive trait?',
    evidence: 'Evidence', evNone: 'No evidence', evDom: 'Offspring is purple', evRec: 'Offspring is white',
    askIs: 'Ask: is it', partnerLabel: 'Cross this purple plant with', partnerAa0: 'a white aa plant', partnerAa1: 'a purple Aa plant', pnAa0: 'white aa', pnAa1: 'purple Aa',
    c5aria: 'The Aa × Aa square with the cells that contradict the evidence crossed off',
    c5sq: 'Aa × Aa: cells that contradict the evidence are crossed off',
    c5baria: 'Probability tree: the two paths to a white offspring when the purple plant is crossed again',
    c5tree: 'Purple plant × {partner}: paths to a white offspring',
    s5readoutNone: 'No evidence: all 4 cells are possible, {target} fills {hit} of them, so P({target}) = {p}.',
    s5readout: 'Evidence: {ev}. After crossing off the contradicting cells {kept} remain, and {target} fills {hit} of them: P({target} | {ev}) = {p}.',
    s5readoutB: 'If the purple plant is AA (probability 1/3), a cross with a {partner} plant gives white offspring with probability {wAA}; if it is Aa (probability 2/3), with probability {wAa}. In total P(white) = 1/3 × {wAA} + 2/3 × {wAa} = {total}.',
    s5hint: 'What to try: choose "No evidence" and ask "Aa": 1/2 (2 of 4 cells). Then choose "Offspring is purple": the aa cell is crossed off and the same question now gives 2/3; the evidence changed the denominator. Then read the probability tree: multiply along each path and add the two paths to get the chance of a white offspring in the next generation. Switch the partner to Aa and see how the result changes.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Which probability rules sit behind these ratios?',
    s6fin: 'Recap: segregation sends each allele into a gamete with probability 1/2; fertilisation is two independent draws, so each cell of the square is the product of two gamete probabilities; dominance pools genotypes into phenotypes and gives 3:1; for two genes on different chromosomes the product rule applies once more and gives 9:3:3:1; for genes on the same chromosome the gamete shares are set by the recombination frequency r instead; and evidence such as a phenotype means recounting among the cells that remain. All of these ratios are probabilities: a small batch of offspring scatters around them, and larger batches come closer.',
    formula: 'P(a gamete of an Aa parent carries A) = 1/2\nP(two independent events both happen) = P(first) × P(second)\nP(X | evidence) = cells that fit the evidence and are X ÷ cells that fit the evidence (when all cells are equally likely)',
    boundary: 'Scope: this page assumes complete dominance, fair random gamete formation and fertilisation, offspring that are independent of each other, and no selection or mutation. Independent assortment only holds for genes on different chromosomes (or far apart on the same one), and the recombination frequency never exceeds 50%. Incomplete dominance, sex-linked inheritance and traits controlled by many genes are outside the scope of this page.',
    linksTitle: 'Where to go next',
    lk1: 'Meiosis · step 2: how different chromosome pairs sort at random →',
    lk2: 'Meiosis · step 3: how crossing over makes recombinant gametes →',
    lk3: 'Counting & Permutations · step 3: combinations C(n, k) →',
    lk4: 'Natural Selection · step 4: chance versus selection, random scatter in a population →'
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
  if (typeof window.refreshGenetics === 'function') window.refreshGenetics();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.GENE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
