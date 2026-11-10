'use strict';
// Meiosis lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '减数分裂 · 同一对父母，为什么孩子各不相同',
    back: '← 知识索引',
    compare: '对照另一版本：减数分裂 · 洗牌、切半，造配子 →',
    navLabel: '减数分裂步骤导航',
    tagline: '人的体细胞里有 46 条染色体，精子和卵细胞里却只有 23 条。造精子、卵细胞的那种细胞分裂叫减数分裂：它把染色体数目减半，同时把来自祖辈的染色体重新洗牌。六步里你会看到：为什么必须减半、两次分裂各分开了什么、洗牌能洗出多少种组合、为什么亲兄弟姐妹平均只共享一半染色体，以及分错一次会怎样。',
    nav0: '0 为什么减半', nav1: '1 两次分裂', nav2: '2 独立分配', nav3: '3 交叉互换', nav4: '4 兄弟姐妹', nav5: '5 分错一次', nav6: '6 收束',
    listSepNum: '、',

    s0k: '第 0 步 · 先算一笔账',
    s0t: '如果精子和卵细胞带着全套染色体，几代以后会怎样？',
    s0e: '这一步要回答：为什么造<strong>配子</strong>（精子和卵细胞）时必须把染色体数目减半。<strong>染色体</strong>是细胞核里装着 DNA 的「长条」，人的体细胞里有 46 条，排成 23 对；每一对里的两条形状、大小相同，携带同一批基因，叫<strong>同源染色体</strong>，一条来自母亲、一条来自父亲。成对的这套记作 <strong>2n</strong>（二倍体，人 2n = 46），配子里每对只留一条，记作 <strong>n</strong>（单倍体，n = 23）。精子和卵细胞结合叫<strong>受精</strong>，得到的<strong>受精卵</strong>的染色体数 = 两个配子之和。拖动「代数」，比较配子减半和不减半两种情况。',
    spHuman: '人（2n = 46）', spPea: '豌豆（2n = 14）', spFly: '果蝇（2n = 8）',
    genSlider: '代数 g（第 0 代 = 现在的受精卵）',
    s0lgHalf: '配子减半（n）时的受精卵', s0lgFull: '配子不减半（2n）时的受精卵',
    c0title: '每一代受精卵里的染色体数',
    gen: '第 {g} 代',
    s0readout: '{sp}：第 {g} 代受精卵里，配子减半时是 {half} 条；如果配子带着全套 {twoN} 条，就是 {twoN} × 2^{g} = {full} 条，是原来的 {ratio} 倍。只有「配子先减半、受精再加倍」，数目才能一代代保持不变。',
    s0hint: '观察顺序：先选「人」，把代数从 0 拖到 6，看灰色柱每一代翻一倍、青色柱一直不动；再换成「果蝇」，起点不同，但翻倍的规律一样。',

    s1k: '第 1 步 · 两次分裂',
    s1t: '减数分裂分两次：第一次分开什么，第二次又分开什么？',
    s1e: '这一步要回答：一个 2n 的细胞怎样变成四个 n 的配子。为了看得清，图里只画 3 对同源染色体（n = 3），粉色来自母亲、青色来自父亲。分裂前，每条染色体先把 DNA 复制一份（<a class="xlink" href="../../../biology/cells/dna-replication/#step1">→ DNA 复制页第 1 步：新旧两条链怎样分配</a>），变成由<strong>着丝粒</strong>连在一起的两根<strong>姐妹染色单体</strong>，形如「X」。之后，同源的两条染色体靠在一起配对（叫<strong>联会</strong>），相邻的两根单体可能交换一段（<strong>交叉互换</strong>，第 3 步细看）。<strong>第一次分裂</strong>分开的是同源染色体：每对各去一边，于是每个子细胞只剩 n 条（但每条仍是两根单体）。<strong>第二次分裂</strong>才把姐妹染色单体拉开。「对照：有丝分裂」是普通体细胞的分裂方式：只分一次，姐妹单体分开，两个子细胞都是 2n。曲线图记录每一阶段<strong>每个细胞里</strong>有几条染色体（数着丝粒）、几个 DNA 分子（数单体）。',
    modeMeiosis: '减数分裂', modeMitosis: '对照：有丝分裂',
    stageSlider: '阶段', playStages: '从头播放', reroll1: '换一种排列和交换位置',
    st_meiosis_0: '分裂前：未复制', st_meiosis_1: '复制完成：每条两根单体', st_meiosis_2: '同源染色体配对，可能交叉互换', st_meiosis_3: '第一次分裂中期：成对排在中央', st_meiosis_4: '第一次分裂后期：同源染色体分开', st_meiosis_5: '第一次分裂结束：两个细胞', st_meiosis_6: '第二次分裂中期', st_meiosis_7: '第二次分裂结束：四个配子',
    st_mitosis_0: '分裂前：未复制', st_mitosis_1: '复制完成：每条两根单体', st_mitosis_2: '前期：染色体变粗，各自独立', st_mitosis_3: '中期：排成一列', st_mitosis_4: '后期：姐妹单体分开', st_mitosis_5: '结束：两个细胞',
    c1btitle: '每个细胞里的数目（横轴：阶段）',
    s1lgM: '粉：来自母亲', s1lgP: '青：来自父亲', s1lgChr: '绿线：染色体数（数着丝粒）', s1lgDna: '橙线：DNA 分子数（数单体）',
    s1readout: '{mode} · 阶段 {s}「{name}」：{cells} 个细胞，每个细胞 {chr} 条染色体、{dna} 个 DNA 分子。',
    s1tailMeiosis: '最后：4 个细胞，各 {n} 条，正好是开始时 {two} 条的一半；其中带交换片段的单体有 {rec} 根。',
    s1tailMitosis: '最后：2 个细胞，各 {two} 条，和开始时一样多，而且两个细胞的染色体完全相同。',
    s1hint: '观察顺序：在「减数分裂」下把阶段从 0 拖到 7，盯住绿线：它只在阶段 5（第一次分裂结束）掉一半；橙线则在阶段 1 翻倍、阶段 5 和 7 各减半。再切到「有丝分裂」，绿线在后期先翻倍再回到 6。',

    s2k: '第 2 步 · 独立分配',
    s2t: '每对同源染色体朝哪边，能排出多少种配子？',
    s2e: '这一步要回答：不考虑交叉互换，一个人最多能产生多少种不同的配子。第一次分裂中期，每一对同源染色体排在细胞中央，母源那条朝上还是朝下是随机的，而且各对之间<strong>互不影响</strong>，这叫<strong>独立分配</strong>。每对有 2 种朝向，n 对就有 2 × 2 × … × 2 = 2ⁿ 种组合（概率相乘的规则见 <a class="xlink" href="../../../probability/basics/genetics-probability/#step2">→ 遗传与概率第 2 步：两个性状的概率怎样相乘</a>）。上半图是最近一次分裂的排列：中央虚线上方的染色体进入一个细胞，下方的进入另一个。下半图统计全部配子的类型：每根柱子下面的小方块就是这种配子的「配方」，从上到下依次是第 1、2、… 对，颜色表示这一对来自母亲还是父亲。',
    nSlider: '同源染色体对数 n', s2lgLast: '橙柱：最近一次分裂产生的两种配子', s2lgExp: '虚线：每种的平均期望数',
    once2: '做 1 次减数分裂', many2: '再做 50 次', clear2: '清空',
    c2top: '最近一次的排列（虚线上方 → 一个细胞，下方 → 另一个）', c2bot: '配子类型统计（虚线：平均每种应有多少）',
    s2readout: 'n = {n}：共有 2^{n} = {types} 种配子。已做 {runs} 次减数分裂、得到 {gam} 个配子，出现过其中 {seen} 种；平均每种应有 {exp} 个。{note}',
    s2note1: '注意：一次减数分裂只产生 2 种配子（每种 2 个，两两「互补」），要多次分裂才能把所有组合凑齐。',
    s2human: '人有 23 对，单靠独立分配就有 2^23 = {human} 种配子。',
    s2empty: 'n = {n}：共有 2^{n} = {types} 种配子。按「做 1 次」看一次分裂得到哪些配子。',
    s2hint: '观察顺序：n = 3 时先按几次「做 1 次」，每次只有两根柱子各涨 2；再按「再做 50 次」，8 根柱子都涨到虚线附近。把 n 调到 4，种类翻倍成 16，每种分到的配子就少一半。',

    s3k: '第 3 步 · 交叉互换',
    s3t: '同一条染色体上的两个基因，会不会被拆开？',
    s3e: '这一步要回答：同一条染色体上的两个基因能否分进不同的配子。<strong>基因</strong>是染色体上的一段 DNA，同一位置的不同版本叫<strong>等位基因</strong>，这里用 A/a、B/b 表示：母源染色体上是 A 和 B，父源上是 a 和 b。如果没有交换，配子只会是 AB 或 ab（与亲代相同的「亲本型」），这种「绑在一起遗传」叫<strong>连锁</strong>。配对时，一根母源单体和一根父源单体会在某处断开、互换后半段，这就是<strong>交叉互换</strong>。本页假设每次分裂恰好在随机位置交换一次。只有交换点落在 A 与 B 之间，才会产生 Ab、aB 这种「重组型」配子，而且 4 根单体里只有 2 根参与交换。重组型配子占全部配子的比例叫<strong>重组率</strong>。上半图是四根单体，下半图记录每个距离下测到的重组率。',
    distSlider: 'B 与 A 的距离（占染色体全长）',
    once3: '做 1 次减数分裂', many3: '再做 100 次', clear3: '清空',
    c3top: '四根染色单体与最近一次的交换点', c3bot: '重组率与基因距离（线：理论值 = 距离 ÷ 2）',
    s3lgCross: '白色竖线：交换点', s3lgDot: '圆点：在该距离下实测的重组率（越大越可信）',
    s3readout: '距离 {d}：已做 {runs} 次，{total} 个配子中 AB {AB}、ab {ab}、Ab {Ab}、aB {aB}。实测重组率 {rf}%，理论值 {exp}%。',
    s3empty: '距离 {d}：理论重组率 = 距离 ÷ 2 = {exp}%。按「做 1 次」看交换点落在哪里。',
    s3last: '最近一次交换点在 {c}，{where}',
    s3between: '落在 A 与 B 之间：产生 2 个重组型配子。', s3outside: '没有落在 A 与 B 之间：4 个配子都是亲本型。',
    s3hint: '观察顺序：先用默认距离按「再做 100 次」，看圆点落在直线附近；再把距离拖小、拖大各测一组。距离拉到最大时重组率也只接近 {max}%：因为每次只有一半的单体参与交换。',

    s4k: '第 4 步 · 兄弟姐妹',
    s4t: '同一对父母的两个孩子，平均共享多少条染色体？',
    s4e: '这一步要回答：独立分配对一个家庭意味着什么。父亲的每对染色体里，一条来自祖父、一条来自祖母，他给孩子的那条随机是其中之一；母亲那边同理（外祖父或外祖母）。两个孩子在某一位置上拿到同一位祖辈的那条，概率是 1/2，各位置互不影响。这里不考虑交叉互换，只数整条染色体。上半图是最近一对兄弟姐妹：每对染色体画两格，左格来自父亲，右格来自母亲，颜色表示它最初来自哪位祖辈；两人相同的位置下面画绿点。下半图是很多对兄弟姐妹的「共享比例」分布。',
    pairsSlider: '染色体对数 n',
    once4: '生一对兄弟姐妹', many4: '再生 200 对', clear4: '清空',
    s4lgGF: '祖父', s4lgGM: '祖母', s4lgMGF: '外祖父', s4lgMGM: '外祖母', s4lgSame: '绿点：两人这一条相同',
    c4kid1: '孩子 1', c4kid2: '孩子 2', c4bot: '共享比例的分布（虚线：平均值）',
    s4readout: '最近一对共享 {k}/{two} 条（{pct}%）。已生 {runs} 对，平均共享 {mean}%，标准差 {sd} 个百分点（理论 50% 与 {sdT} 个百分点）。两人 {two} 条全都相同的概率是 1/2^{two} = 1/{inv}。',
    s4empty: 'n = {n}：理论上平均共享 50%，标准差 {sdT} 个百分点；{two} 条全都相同的概率是 1/{inv}。按「生一对」试试。',
    s4hint: '观察顺序：n = 23 时连按「再生 200 对」，分布堆在 50% 附近；把 n 拖到 2，分布变得很散，两个孩子 4 条全同的情况也不罕见。对数越多，「恰好一半」越稳。',

    s5k: '第 5 步 · 分错一次',
    s5t: '某一对染色体没分开，配子和受精卵会怎样？',
    s5e: '这一步要回答：减数分裂出错时，后果取决于错在哪一次分裂。<strong>不分离</strong>指该分开的染色体没有分开、一起进了同一个细胞。图里只画出出错的那一对（比如人的第 21 号），其余 22 对正常、只在数字里算上。第一次分裂不分离：同源的两条一起走，另一个细胞一条都没有；第二次分裂不分离：某个细胞里的两根姐妹单体没拉开。最后一行把每个配子和一个正常的卵细胞（23 条）结合，看受精卵的总数：多一条叫<strong>三体</strong>（如 21 三体，即唐氏综合征），少一条叫<strong>单体</strong>。',
    s5lgEgg: '浅灰：卵细胞带来的那一条', s5lgBad: '橙色边框：染色体数不正常', ndNone: '正常分裂', ndI: '第一次分裂不分离', ndII: '第二次分裂不分离',
    c5rowP: '亲代细胞（已复制，只画出错的这一对）', c5row0: '第一次分裂后', c5row1: '配子', c5row2: '与正常卵细胞（23 条）受精后',
    cnt: '{c} 条',
    s5readout: '{mode}：4 个配子分别有 {gam} 条染色体，其中正常的 {normal} 个；受精卵分别是 {zyg} 条。{tail}',
    s5tailNone: '全部正常。', s5tailI: '错在第一次：4 个配子全部异常，两个多一条、两个少一条。', s5tailII: '错在第二次：只有出错的那个细胞产生的 2 个配子异常，另一边 2 个正常。',
    s5hint: '观察顺序：依次按三个按钮，数「配子」一行里正常的有几个：4 个、0 个、2 个。再看最后一行：47 条是三体，45 条是单体。',

    s6k: '第 6 步 · 收束',
    s6t: '减数分裂做成了两件事',
    s6fin: '<strong>减半：</strong>复制一次、分裂两次，2n 变成 n；受精再合成 2n，数目代代不变。<strong>第一次分开同源染色体，第二次分开姐妹单体</strong>：数目在第一次分裂结束时减半。<strong>洗牌：</strong>各对朝向独立，n 对给出 2ⁿ 种配子；交叉互换又把同一条染色体上的基因重新组合，重组率随距离增大，但在本页的「每次恰好一次交换」模型里不超过 50%。<strong>结果：</strong>亲兄弟姐妹平均共享一半染色体，几乎不可能完全相同；而某一对分错一次，就可能得到 47 或 45 条的受精卵。',
    quizPrompt: '小测：人的一个正常精子里有几条染色体？',
    quizA: '46 条，和体细胞一样', quizB: '23 条，每对同源染色体各一条', quizC: '92 条，因为复制过一次',
    check: '核对', correct: '对：减数分裂后每对只留一条，n = 23；和 23 条的卵细胞结合后回到 46。', wrong: '再看第 1 步阶段 7：每个配子里每对同源染色体只剩一条。',
    boundary: '模型的边界：第 1 步只画 3 对，长度不按比例；第 1、3 步假设每对恰好交换一次、位置均匀随机，真实细胞里交换次数不定，相邻交换还会互相影响，重组率与距离也不是严格的直线；第 4 步没有算交叉互换（算上之后两个孩子更难相同）；没有画性染色体，也没有画卵细胞形成时「一大三小」的不等分裂。',
    linksTitle: '接着看',
    lk1: '→ 遗传与概率第 2 步：两个性状的概率怎样相乘',
    lk2: '→ DNA 复制第 1 步：复制后新旧链怎样分配',
    lk3: '→ 遗传与概率第 0 步：孩子拿到的等位基因从哪里来',
    lk4: '→ 自然选择第 1 步：个体之间的差异怎样一代代累积',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《减数分裂 · 洗牌、切半，造配子》的平行版本。'
  },
  en: {
    pageTitle: 'Meiosis · Same Parents, Different Children',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Meiosis · Shuffle, Halve, Make Gametes →',
    navLabel: 'Meiosis steps',
    tagline: 'Your body cells hold 46 chromosomes, yet a sperm or an egg holds only 23. The cell division that makes sperm and eggs is meiosis: it halves the chromosome number and, along the way, reshuffles the chromosomes inherited from grandparents. In six steps you will see why halving is unavoidable, what each of the two divisions separates, how many combinations the shuffle can deal, why full siblings share only about half their chromosomes, and what one mistake does.',
    nav0: '0 Why halve', nav1: '1 Two divisions', nav2: '2 Assortment', nav3: '3 Crossing over', nav4: '4 Siblings', nav5: '5 One mistake', nav6: '6 Wrap-up',
    listSepNum: ', ',

    s0k: 'STEP 0 · DO THE SUMS FIRST',
    s0t: 'If sperm and eggs carried the full set, what would happen after a few generations?',
    s0e: 'This step answers: why the chromosome number must be halved when <strong>gametes</strong> (sperm and eggs) are made. A <strong>chromosome</strong> is one of the long DNA-carrying strands in the nucleus; a human body cell has 46, in 23 pairs. The two in a pair match in shape and size and carry the same set of genes; they are <strong>homologous chromosomes</strong>, one from the mother and one from the father. The paired set is written <strong>2n</strong> (diploid; 2n = 46 in humans); a gamete keeps one of each pair, written <strong>n</strong> (haploid; n = 23). Sperm meeting egg is <strong>fertilisation</strong>, and the chromosome count of the resulting <strong>zygote</strong> (fertilised egg) is the sum of the two gametes. Drag “generations” to compare gametes that halve with gametes that do not.',
    spHuman: 'Human (2n = 46)', spPea: 'Pea (2n = 14)', spFly: 'Fruit fly (2n = 8)',
    genSlider: 'Generation g (0 = today’s zygote)',
    s0lgHalf: 'Zygote when gametes are halved (n)', s0lgFull: 'Zygote when gametes are not halved (2n)',
    c0title: 'Chromosomes in the zygote, generation by generation',
    gen: 'Gen {g}',
    s0readout: '{sp}: in generation {g} a zygote has {half} chromosomes if gametes are halved. If gametes carried the full {twoN}, it would have {twoN} × 2^{g} = {full}, which is {ratio} times as many. Only “halve in the gametes, double at fertilisation” keeps the number fixed from one generation to the next.',
    s0hint: 'What to watch: choose “Human” and drag the generation from 0 to 6. The grey bar doubles every generation while the cyan bar stays put. Switch to “Fruit fly”: a different start, the same doubling.',

    s1k: 'STEP 1 · TWO DIVISIONS',
    s1t: 'Meiosis divides twice: what does the first division separate, and what does the second?',
    s1e: 'This step answers: how one 2n cell becomes four n gametes. To keep it readable, only 3 homologous pairs are drawn (n = 3): pink from the mother, cyan from the father. Before dividing, each chromosome copies its DNA (<a class="xlink" href="../../../biology/cells/dna-replication/#step1">→ DNA Replication, step 1: how old and new strands are shared</a>) and becomes two <strong>sister chromatids</strong> joined at the <strong>centromere</strong>, an X shape. Then the two homologs of each pair line up side by side (<strong>synapsis</strong>), and neighbouring chromatids may swap a stretch (<strong>crossing over</strong>, step 3 looks closer). <strong>Division I</strong> separates the homologs: one of each pair goes each way, so each daughter cell has only n chromosomes (each still two chromatids). <strong>Division II</strong> finally pulls the sister chromatids apart. “Compare: mitosis” is how ordinary body cells divide: once, sisters split, and both daughters are 2n. The chart records, at each stage, how many chromosomes (count centromeres) and how many DNA molecules (count chromatids) sit <strong>in each cell</strong>.',
    modeMeiosis: 'Meiosis', modeMitosis: 'Compare: mitosis',
    stageSlider: 'Stage', playStages: 'Play from the start', reroll1: 'New line-up and crossover points',
    st_meiosis_0: 'Before division: not yet copied', st_meiosis_1: 'Copied: two chromatids each', st_meiosis_2: 'Homologs pair up, may cross over', st_meiosis_3: 'Metaphase I: pairs line up in the middle', st_meiosis_4: 'Anaphase I: homologs pulled apart', st_meiosis_5: 'End of division I: two cells', st_meiosis_6: 'Metaphase II', st_meiosis_7: 'End of division II: four gametes',
    st_mitosis_0: 'Before division: not yet copied', st_mitosis_1: 'Copied: two chromatids each', st_mitosis_2: 'Prophase: chromosomes condense, unpaired', st_mitosis_3: 'Metaphase: one single line', st_mitosis_4: 'Anaphase: sisters pulled apart', st_mitosis_5: 'Done: two cells',
    c1btitle: 'Counts in each cell (across: stage)',
    s1lgM: 'Pink: from the mother', s1lgP: 'Cyan: from the father', s1lgChr: 'Green line: chromosomes (count centromeres)', s1lgDna: 'Orange line: DNA molecules (count chromatids)',
    s1readout: '{mode} · stage {s} “{name}”: {cells} cell(s), each with {chr} chromosomes and {dna} DNA molecules.',
    s1tailMeiosis: 'At the end: 4 cells with {n} each, exactly half the starting {two}; {rec} of the chromatids carry a swapped stretch.',
    s1tailMitosis: 'At the end: 2 cells with {two} each, as many as at the start, and the two cells hold identical chromosomes.',
    s1hint: 'What to watch: under “Meiosis”, drag the stage from 0 to 7 and follow the green line: it halves only at stage 5 (end of division I). The orange line doubles at stage 1 and halves at stages 5 and 7. Switch to “Mitosis”: the green line doubles at anaphase, then returns to 6.',

    s2k: 'STEP 2 · INDEPENDENT ASSORTMENT',
    s2t: 'Each pair faces one way or the other — how many kinds of gamete does that make?',
    s2e: 'This step answers: ignoring crossing over, how many different gametes one person can make. At metaphase I each homologous pair sits in the middle of the cell, and whether the maternal copy faces up or down is random and <strong>independent of every other pair</strong>. This is <strong>independent assortment</strong>. Each pair has 2 ways to face, so n pairs give 2 × 2 × … × 2 = 2ⁿ combinations (the multiplication rule is in <a class="xlink" href="../../../probability/basics/genetics-probability/#step2">→ Genetics & Probability, step 2: how probabilities of two traits multiply</a>). The top panel is the latest line-up: chromosomes above the dashed middle line go into one cell, those below into the other. The bottom panel tallies every gamete by type: the little squares under each bar are that gamete’s “recipe”, pair 1, 2, … from top to bottom, coloured by whether that pair came from the mother or the father.',
    nSlider: 'Homologous pairs n', s2lgLast: 'Orange bars: the two kinds made by the latest division', s2lgExp: 'Dashes: expected count per kind',
    once2: 'Run 1 meiosis', many2: 'Run 50 more', clear2: 'Clear',
    c2top: 'Latest line-up (above dashes → one cell, below → other)', c2bot: 'Gamete types (dashes: expected count per type)',
    s2readout: 'n = {n}: there are 2^{n} = {types} kinds of gamete. Meioses so far: {runs}, making {gam} gametes and covering {seen} of the kinds; each kind should average {exp}. {note}',
    s2note1: 'Note: one meiosis makes only 2 kinds of gamete (two of each, complementary to each other); it takes many divisions to fill in every combination.',
    s2human: 'Humans have 23 pairs, so independent assortment alone gives 2^23 = {human} kinds of gamete.',
    s2empty: 'n = {n}: there are 2^{n} = {types} kinds of gamete. Press “Run 1 meiosis” to see what a single division makes.',
    s2hint: 'What to watch: with n = 3, press “Run 1 meiosis” a few times; each time only two bars grow, by 2 each. Then press “Run 50 more” and all 8 bars climb to near the dashed line. Set n to 4: the kinds double to 16 and each gets half as many gametes.',

    s3k: 'STEP 3 · CROSSING OVER',
    s3t: 'Two genes on the same chromosome — can they be split up?',
    s3e: 'This step answers: whether two genes on one chromosome can end up in different gametes. A <strong>gene</strong> is a stretch of DNA on a chromosome; different versions at the same spot are <strong>alleles</strong>, written here A/a and B/b. The maternal chromosome carries A and B, the paternal one a and b. Without any swapping, gametes could only be AB or ab (the “parental” types), and genes inherited together like this are said to be <strong>linked</strong>. During pairing, one maternal and one paternal chromatid can break at the same point and swap their far ends: <strong>crossing over</strong>. This page assumes exactly one swap per meiosis at a random point. Only a swap that lands between A and B gives the “recombinant” gametes Ab and aB, and only 2 of the 4 chromatids take part. The share of recombinant gametes among all gametes is the <strong>recombination frequency</strong>. The top panel shows the four chromatids; the bottom panel logs the recombination frequency measured at each distance.',
    distSlider: 'Distance from A to B (share of chromosome length)',
    once3: 'Run 1 meiosis', many3: 'Run 100 more', clear3: 'Clear',
    c3top: 'Four chromatids and the latest crossover point', c3bot: 'Recombination % vs distance (line: distance ÷ 2)',
    s3lgCross: 'White line: crossover point', s3lgDot: 'Dots: frequency measured at that distance (bigger = more gametes)',
    s3readout: 'Distance {d}: {runs} meioses, {total} gametes: AB {AB}, ab {ab}, Ab {Ab}, aB {aB}. Measured recombination frequency {rf}%, theory {exp}%.',
    s3empty: 'Distance {d}: theory says recombination frequency = distance ÷ 2 = {exp}%. Press “Run 1 meiosis” to see where a swap lands.',
    s3last: 'Latest crossover at {c}: {where}',
    s3between: 'between A and B, so 2 recombinant gametes.', s3outside: 'not between A and B, so all 4 gametes are parental.',
    s3hint: 'What to watch: at the default distance press “Run 100 more” and see the dot land near the line. Then measure a short and a long distance. Even at the largest distance the frequency only gets close to {max}%, because each swap involves just half of the chromatids.',

    s4k: 'STEP 4 · SIBLINGS',
    s4t: 'Two children of the same parents — how many chromosomes do they share on average?',
    s4e: 'This step answers: what independent assortment means for a family. In each of the father’s pairs, one chromosome came from his father and one from his mother; he passes one of the two at random. The same goes for the mother and her parents. At any one position, two children get the same grandparent’s copy with probability 1/2, independently of every other position. Crossing over is ignored here; only whole chromosomes are counted. The top panel is the latest pair of siblings: each chromosome pair is two cells, the left one from the father and the right one from the mother, coloured by the grandparent it first came from; a green dot marks positions where both children match. The bottom panel is the spread of the “shared share” over many sibling pairs.',
    pairsSlider: 'Chromosome pairs n',
    once4: 'One pair of siblings', many4: '200 more pairs', clear4: 'Clear',
    s4lgGF: 'Paternal grandfather', s4lgGM: 'Paternal grandmother', s4lgMGF: 'Maternal grandfather', s4lgMGM: 'Maternal grandmother', s4lgSame: 'Green dot: both children match here',
    c4kid1: 'Child 1', c4kid2: 'Child 2', c4bot: 'Share of chromosomes in common (dashes: mean)',
    s4readout: 'The latest pair shares {k}/{two} chromosomes ({pct}%). Over {runs} pairs the mean is {mean}% with a standard deviation of {sd} points (theory: 50% and {sdT} points). The chance that all {two} match is 1/2^{two} = 1/{inv}.',
    s4empty: 'n = {n}: on average siblings share 50%, standard deviation {sdT} points; the chance that all {two} match is 1/{inv}. Press “One pair of siblings”.',
    s4hint: 'What to watch: with n = 23 press “200 more pairs” a few times; the spread piles up around 50%. Drag n down to 2: the spread is wide, and siblings matching on all 4 is no longer rare. The more pairs, the more reliably the share sits near one half.',

    s5k: 'STEP 5 · ONE MISTAKE',
    s5t: 'One pair fails to separate — what happens to the gametes and the zygote?',
    s5e: 'This step answers: when meiosis goes wrong, the outcome depends on which division the mistake happens in. <strong>Nondisjunction</strong> means chromosomes that should separate do not, and both go into the same cell. Only the faulty pair is drawn (say human chromosome 21); the other 22 pairs divide normally and are just counted. Nondisjunction in division I: both homologs go the same way and the other cell gets none. In division II: the two sister chromatids in one cell fail to part. The last row joins each gamete with a normal egg (23 chromosomes) and counts the zygote: one extra is a <strong>trisomy</strong> (trisomy 21 is Down syndrome), one missing is a <strong>monosomy</strong>.',
    s5lgEgg: 'Light grey: the copy brought by the egg', s5lgBad: 'Orange outline: abnormal chromosome count', ndNone: 'Normal division', ndI: 'Nondisjunction in division I', ndII: 'Nondisjunction in division II',
    c5rowP: 'Parent cell (copied; only the faulty pair drawn)', c5row0: 'After division I', c5row1: 'Gametes', c5row2: 'After fertilising a normal egg (23)',
    cnt: '{c}',
    s5readout: '{mode}: the 4 gametes have {gam} chromosomes; {normal} of them are normal. The zygotes have {zyg}. {tail}',
    s5tailNone: 'All normal.', s5tailI: 'A division I mistake: all 4 gametes are abnormal, two with one extra and two with one missing.', s5tailII: 'A division II mistake: only the 2 gametes from the faulty cell are abnormal; the other 2 are normal.',
    s5hint: 'What to watch: press the three buttons in turn and count the normal gametes: 4, 0, 2. Then read the bottom row: 47 is a trisomy, 45 a monosomy.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Meiosis gets two jobs done',
    s6fin: '<strong>Halving:</strong> copy once, divide twice, and 2n becomes n; fertilisation restores 2n, so the count holds steady across generations. <strong>Division I separates homologs, division II separates sisters</strong>: the count halves at the end of division I. <strong>Shuffling:</strong> pairs face independently, so n pairs give 2ⁿ kinds of gamete; crossing over recombines genes on the same chromosome, more often the farther apart they are, but never above 50% in this page’s “exactly one swap” model. <strong>Consequences:</strong> full siblings share about half their chromosomes and are almost never identical; and one pair dividing wrongly can give a zygote with 47 or 45.',
    quizPrompt: 'Quick check: how many chromosomes are in one normal human sperm cell?',
    quizA: '46, the same as a body cell', quizB: '23, one from each homologous pair', quizC: '92, because the DNA was copied',
    check: 'Check', correct: 'Right: after meiosis each pair keeps one, n = 23; joining a 23-chromosome egg brings it back to 46.', wrong: 'Look at stage 7 in step 1: each gamete keeps only one chromosome from every pair.',
    boundary: 'Where the model stops: step 1 draws 3 pairs, not to scale; steps 1 and 3 assume exactly one evenly random swap per pair, while real cells vary in the number of swaps, nearby swaps interfere, and frequency is not strictly a straight line in distance; step 4 ignores crossing over (which makes identical siblings even less likely); sex chromosomes are not drawn, nor is the uneven “one big, three small” division in egg formation.',
    linksTitle: 'Where to next',
    lk1: '→ Genetics & Probability, step 2: how probabilities of two traits multiply',
    lk2: '→ DNA Replication, step 1: how copied strands are shared',
    lk3: '→ Genetics & Probability, step 0: where a child’s alleles come from',
    lk4: '→ Natural Selection, step 1: how differences between individuals add up over generations',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Meiosis · Shuffle, Halve, Make Gametes”.'
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
  if (typeof window.refreshMeiosis === 'function') window.refreshMeiosis();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MEIOSIS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
