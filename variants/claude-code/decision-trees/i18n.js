'use strict';
// Decision-tree lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '决策树 · 一连串是非题怎样分出类别',
    back: '← 知识索引',
    compare: '对照另一版本：决策树与信息增益 →',
    navLabel: '决策树步骤导航',
    tagline: '80 名（模拟的）学生，已知每人每周自习几小时、每晚睡几小时，以及考试是否及格。能不能用几道「是 / 否」题把及格和不及格分开，再拿这几道题去判断新学生？七步里你会先亲手问一道题，再看机器怎样挑题、怎样一层层长成一棵树，以及长得太深、或者太「短视」时会出什么问题。',
    nav0: '0 问一道题', nav1: '1 怎样算「混」', nav2: '2 扫出最好的切法', nav3: '3 长成一棵树', nav4: '4 多深才好', nav5: '5 贪心的盲区', nav6: '6 收束',
    study: '每周自习（小时）', sleep: '每晚睡眠（小时）',
    pass: '及格', fail: '不及格',

    s0k: '第 0 步 · 问一道题',
    s0t: '只许问一道「是 / 否」题，最多能分对多少人？',
    s0e: '这一步要回答：用一个数值特征和一条分界线提一个问题，比如「每周自习少于 5 小时吗？」，把 80 人分成两组，每组都猜成本组人数较多的那一类（<strong>多数类</strong>），能分对多少？图中每个点是一名学生：横轴是每周自习小时数，纵轴是每晚睡眠小时数；青色实心点是及格，橙色空心圈是不及格。这份数据是<strong>模拟</strong>的：按一条隐藏规则生成，并随机翻转了约 8% 的标签，模拟现实中的意外。分界线两侧的底色是这一侧的猜测。',
    featPick: '按哪个特征提问', thrSlider: '分界线位置',
    c0: '80 名学生（横轴：每周自习 h · 纵轴：每晚睡眠 h）',
    lgPass: '及格', lgFail: '不及格', lgGuessPass: '这一侧猜「及格」', lgGuessFail: '这一侧猜「不及格」',
    s0readout: '问题：「{feat}少于 {thr} 吗？」是 → {nl} 人（{kl} 人及格），猜「{gl}」；否 → {nr} 人（{kr} 人及格），猜「{gr}」。分错 {e} 人，正确率 {acc}%。',
    s0hint: '观察顺序：先保持「自习」，把分界线从 0 拖到 12，看读数里分错的人数怎样先降后升；再切到「睡眠」试一遍。能找到的最少分错人数，就是「一道题」的极限；下一步会说明为什么机器不直接用「分错人数」来挑题。',

    s1k: '第 1 步 · 怎样算「混」',
    s1t: '一个分组「混」得多厉害，该用什么数来量？',
    s1e: '这一步要回答：一刀切下去，怎样给它打分？先给一个组的<strong>不纯度</strong>下定义：组里有比例 p 的人及格，组越接近一半一半就越「混」，全是同一类就是 0。三种常见量法：<strong>错分率</strong> min(p, 1 − p)，就是全组猜多数类时的错误比例；<strong>基尼指数</strong> 2p(1 − p)；<strong>熵</strong> −p·log₂p − (1 − p)·log₂(1 − p)，单位是比特（<a class="xlink" href="../../../probability/stochastic/entropy/#step3">→ 熵页第 3 步：二元熵为什么在一半一半时最大</a>）。一刀的得分 = 切前不纯度 − 切后两组不纯度按人数加权的平均，这个差叫<strong>不纯度下降</strong>，用熵算时叫<strong>信息增益</strong>。这里用一个 40 人的小组（28 人及格）单独演示：拖动滑杆决定左边分到几人、其中几人及格，右边是剩下的。',
    nlSlider: '左组人数', klSlider: '左组里的及格人数',
    mError: '错分率', mGini: '基尼指数', mEntropy: '熵',
    c1groups: '切前 40 人与切后的两组（青 = 及格，橙 = 不及格）',
    c1curve: '{m}随及格比例 p：连线在 p = 0.7 处的高度 = 切后平均',
    gParent: '切前 {k}/{n}', gLeft: '左 {k}/{n}', gRight: '右 {k}/{n}',
    s1lgCurve: '所选量法的曲线', s1lgOther: '另外两种量法', s1lgChild: '左右两组', s1lgAvg: '切后加权平均（落在连线上）', s1lgParent: '切前',
    s1readout: '左组 {kl}/{nl} 及格，右组 {kr}/{nr} 及格。不纯度下降：错分率 {de}，基尼指数 {dg}，熵（信息增益）{dh} 比特。{note}',
    s1flat: '错分率一点没降：两组都还是「及格」占多数，猜测不变、错的人数也不变；但基尼指数和熵都降了，它们看得出左组已经变纯。',
    s1allup: '三种量法都下降了。',
    s1none: '两组的及格比例都和切前一样（0.7），哪种量法都不降：这一刀没有带来任何信息。',
    s1hint: '观察顺序：保持默认（左组 12 人全及格），切换三种量法，看曲线上两组的点、它们的连线，以及连线在 p = 0.7 处的点。错分率是折线，两点都在 0.5 右边时连线贴着折线，下降为 0；基尼指数和熵是向上鼓的弧线，连线总在弧线下方，只要两组比例不同，就有下降。再把左组设成 20 人、14 人及格，三种都降为 0。决策树通常用熵或基尼指数，本页后面用熵。',

    s2k: '第 2 步 · 扫出最好的切法',
    s2t: '机器怎样从所有可能的切法里挑出最好的一刀？',
    s2e: '这一步要回答：「最好的一刀」怎样找？办法很笨也很可靠：对每个特征，把分界线从最小值扫到最大值，每个位置都算一次<strong>信息增益</strong>（切前的熵 − 切后两组熵的加权平均，单位比特，越大越好），取最大的那个。分界线只有落在两个相邻数据值之间时，分组才会变化，所以增益曲线是一级一级的台阶。下图记下你扫过的每个位置的增益。',
    scan2: '自动扫一遍', clear2: '清空曲线',
    c2scatter: '当前切法（横轴：自习 h · 纵轴：睡眠 h）',
    c2gain: '信息增益（比特）随分界线位置：{feat}',
    s2lgGain: '扫过位置的信息增益', s2lgNow: '当前位置', s2lgBest: '已扫过的最大值',
    s2readout: '「{feat}少于 {thr}？」左 {nl} 人（{kl} 及格），右 {nr} 人（{kr} 及格）。切前熵 {h0} 比特，切后加权平均 {h1} 比特，信息增益 {g} 比特。{best}',
    s2best: '已扫过位置中增益最大：{feat}少于 {thr}，{g} 比特。',
    s2both: '两个特征都扫完：最好的一刀是「{feat}少于 {thr}」，增益 {g} 比特。',
    s2hint: '观察顺序：先按「自动扫一遍」，看下图的增益曲线从左到右画出来、白点停在最高处；再切到「睡眠」扫一遍。两个特征的最好位置各不相同，机器取增益更大的那个作为第一问。分界线的位置取在两个相邻数据值的正中间。',

    s3k: '第 3 步 · 长成一棵树',
    s3t: '切完一刀后，对两组再各问一道题，会长成什么样？',
    s3e: '这一步要回答：一刀不够时怎么办？对切出的每一组，重复上一步：在组内再扫一遍、挑信息增益最大的一刀。这样一层层往下问，就长成一棵<strong>决策树</strong>：每个分叉是一道题，最底下不再切的组叫<strong>叶子</strong>，叶子猜组内多数类。<strong>深度</strong>是从第一问到叶子最多经过几道题。每一步只看眼前最好的一刀、不回头修改，这种做法叫<strong>贪心</strong>。一组已经全是同一类时就不再切。',
    depthSlider: '最大深度', grow3: '一层层长出来', reset3: '回到深度 0',
    c3: '树切出的长方形（底色 = 叶子的猜测，红圈 = 分错）',
    s3lgWrong: '分错的学生',
    treeTitle: '这棵树的规则（缩进 = 下一层）',
    ruleQ: '{feat}少于 {thr}？', ruleYes: '是', ruleNo: '否',
    ruleLeaf: '猜「{c}」（组内 {k}/{n} 及格）',
    s3readout: '深度上限 {d}（实际 {real}）：{leaves} 片叶子，训练集正确率 {acc}%（分错 {e} 人）。{note}',
    s3same: '这一层的切分没有改变任何猜测，所以正确率不变；但它把一组切纯了一半，下一层才切得出来，这正是第 1 步说的「熵看得见、错分率看不见」。',
    s3hint: '观察顺序：按「一层层长出来」，看长方形一块块细分、红圈越来越少，下方规则一层层展开。注意深度 1 到 2：正确率没变，但第 2 层把「睡得多」的一组切成了全及格，深度 3 就能把剩下的分开。深度再加，树开始专门去圈那两个被翻转标签的点。',

    s4k: '第 4 步 · 多深才好',
    s4t: '树越深，训练集越准；对没见过的学生也越准吗？',
    s4e: '这一步要回答：深度该怎么选？拿<strong>训练集</strong>（用来长树的 80 人）的正确率看，树越深越高，最终能到 100%。但我们关心的是<strong>新数据</strong>：另外按同一规则模拟的 600 名学生，标签翻转的比例与训练集相同，长树时完全没看过。这 600 人的正确率叫<strong>测试正确率</strong>。虚线是「直接用隐藏规则去猜」能得到的正确率：翻转的标签谁也猜不中，所以这是测试正确率的天花板。树去记住训练集里的偶然（例如被翻转的点）而在新数据上变差，叫<strong>过拟合</strong>。',
    depth4: '最大深度', noise4: '标签翻转比例',
    c4curve: '正确率随最大深度（训练集 vs 新数据）',
    c4part: '这个深度的切分（训练集 80 人）',
    s4lgTrain: '训练集正确率', s4lgTest: '新数据（测试）正确率', s4lgCeil: '隐藏规则本身的正确率（天花板）',
    s4readout: '翻转 {nz}%，深度 {d}：{leaves} 片叶子，训练集 {tr}%，测试 {te}%。测试正确率在深度 {bd} 最高（{bt}%），天花板 {ceil}%。',
    s4hint: '观察顺序：保持翻转 8%，把深度从 0 拖到 10，看白线一路升到 100%，青线在深度 3 达到 92%（碰到天花板）后掉到 84%；切分图里会出现专门包住单个点的细长条。再把翻转调到 0：青线不再下降，此时深一点也没有坏处。翻转调大，峰值更低，过深的代价更大。',

    s5k: '第 5 步 · 贪心的盲区',
    s5t: '如果每一刀单看都没用，只有两刀合起来才有用，贪心还能找到吗？',
    s5e: '这一步要回答：贪心只看眼前一刀，会不会错过需要两刀配合的规律？换一份模拟数据：两个特征 a、b 都在 0 到 1 之间，规则是「a、b 恰有一个大于 0.5 时为青色类」，像棋盘的四格（异或）。沿任何一个特征切一刀，两边都还是一半一半，单刀的信息增益接近 0；可是先切 a = 0.5、再在两边各切 b = 0.5，就能全部分对。这里对比两种第一刀：<strong>贪心</strong>（选增益最大的一刀）和<strong>指定</strong>（人为规定第一刀切 a = 0.5，后面仍然贪心）。新数据是另外 600 个按同一规则生成的点。',
    modeGreedy: '第一刀：贪心', modeForce: '第一刀：指定 a < 0.5',
    depth5: '最大深度',
    c5part: '80 个点与树的切分（横轴 a · 纵轴 b）',
    c5gain: '第一刀的信息增益随分界线位置（全部低于 0.05 比特）',
    s5lgA: '沿 a 切', s5lgB: '沿 b 切', s5lgPick: '这次的第一刀',
    s5readout: '第一刀「{feat} 少于 {thr}」，增益 {g} 比特。深度 {d}：{leaves} 片叶子，训练正确率 {tr}%，新数据正确率 {te}%。',
    s5hint: '观察顺序：先看下方增益图：两条线都贴着底，贪心挑的是最高的那个小尖，切在边缘附近。保持「贪心」，把深度从 1 拖到 4：新数据正确率只在 47%–58% 之间，和瞎猜差不多。再按「指定 a < 0.5」：深度 2 就 100% 分对训练点、新数据 99%。贪心不是错，而是看不见「这一刀本身没用、但为下一刀铺路」。',

    s6k: '第 6 步 · 收束', s6t: '一串是非题：好读、好用，但要管住深度',
    s6fin: '回顾。<strong>第 0 步</strong>：一道题把人分成两组，每组猜多数类。<strong>第 1 步</strong>：用不纯度给一刀打分；错分率经常「看不见」进步，熵和基尼指数看得见。<strong>第 2 步</strong>：对每个特征扫遍分界线，取信息增益最大的一刀。<strong>第 3 步</strong>：对每组重复，贪心地长成一棵树。<strong>第 4 步</strong>：太深会把偶然也背下来，新数据上反而变差。<strong>第 5 步</strong>：贪心看不见需要两刀配合的规律。',
    formula: '熵 H(p) = −p·log₂p − (1−p)·log₂(1−p)\n信息增益 = H(切前) − Σ (组人数/总人数)·H(组)\n叶子的猜测 = 组内多数类',
    boundary: '适用范围：本页的数据都是模拟的，只有两个数值特征，一刀只沿一个特征切（与坐标轴平行）。真实的决策树还要处理类别特征、缺失值，通常用剪枝或交叉验证来选深度，也常把许多棵树合起来用（随机森林、梯度提升树）。第 4 步的结论只对这份数据和这些翻转比例成立；「深度 3 最好」不是通用规律。叶子里的多数比例也不是校准过的概率。',
    linksTitle: '接着去哪',
    lk1: '→ 熵，第 3 步：二元熵和「二十个问题」',
    lk2: '→ 过拟合，第 1 步：训练误差和测试误差为什么分道扬镳',
    lk3: '→ 二分查找，第 1 步：每问一次把范围砍半',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《决策树与信息增益》的平行版本。'
  },
  en: {
    pageTitle: 'Decision Trees · Sorting by a Chain of Yes/No Questions',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Decision Trees and Information Gain →',
    navLabel: 'Decision tree steps',
    tagline: 'Eighty (simulated) students: for each we know weekly study hours, nightly sleep hours, and whether they passed the exam. Can a few yes/no questions separate pass from fail, and then judge new students? In seven steps you will ask one question by hand, watch a machine pick its questions and grow them into a tree, and see what goes wrong when the tree grows too deep or looks only one cut ahead.',
    nav0: '0 One question', nav1: '1 Measuring “mixed”', nav2: '2 Scan for the best cut', nav3: '3 Grow a tree', nav4: '4 How deep', nav5: '5 Greedy’s blind spot', nav6: '6 Wrap-up',
    study: 'weekly study (h)', sleep: 'nightly sleep (h)',
    pass: 'pass', fail: 'fail',

    s0k: 'Step 0 · Ask one question',
    s0t: 'With a single yes/no question, how many students can you sort correctly?',
    s0e: 'This step answers: pick one numeric feature and a dividing line, ask a question such as “Does this student study less than 5 hours a week?”, split the 80 students into two groups, and guess each group’s larger class (its <strong>majority class</strong>). How many come out right? Each dot is one student: the horizontal axis is weekly study hours, the vertical axis nightly sleep hours; filled cyan dots passed, hollow orange rings failed. The data are <strong>simulated</strong>: generated from a hidden rule, with about 8% of the labels flipped at random to mimic real-life surprises. The shading on each side of the line is that side’s guess.',
    featPick: 'Feature to ask about', thrSlider: 'Dividing line',
    c0: '80 students (horizontal: weekly study h · vertical: nightly sleep h)',
    lgPass: 'pass', lgFail: 'fail', lgGuessPass: 'side guesses “pass”', lgGuessFail: 'side guesses “fail”',
    s0readout: 'Question: “{feat} below {thr}?” Yes → {nl} students ({kl} passed), guess “{gl}”; no → {nr} students ({kr} passed), guess “{gr}”. {e} sorted wrongly, accuracy {acc}%.',
    s0hint: 'What to try: keep “study” and drag the line from 0 to 12; the number sorted wrongly first falls, then rises. Then switch to “sleep” and try again. The fewest mistakes you can find is the limit of a single question. The next step explains why a machine does not choose its question by counting mistakes.',

    s1k: 'Step 1 · Measuring “mixed”',
    s1t: 'What number should measure how mixed a group is?',
    s1e: 'This step answers: how should one cut be scored? First define a group’s <strong>impurity</strong>: if a share p of the group passed, the closer the group is to half and half the more mixed it is, and a group of one class scores 0. Three common measures: the <strong>error rate</strong> min(p, 1 − p), the fraction wrong when the whole group gets the majority guess; the <strong>Gini index</strong> 2p(1 − p); and <strong>entropy</strong> −p·log₂p − (1 − p)·log₂(1 − p), measured in bits (<a class="xlink" href="../../../probability/stochastic/entropy/#step3">→ Entropy, step 3: why binary entropy peaks at half and half</a>). A cut’s score = impurity before − the size-weighted average impurity of the two groups after. That difference is the <strong>impurity decrease</strong>; computed with entropy it is called <strong>information gain</strong>. Here a separate group of 40 (28 passed) is used: the sliders set how many go left and how many of those passed; the rest go right.',
    nlSlider: 'Size of the left group', klSlider: 'Passes in the left group',
    mError: 'error rate', mGini: 'Gini index', mEntropy: 'entropy',
    c1groups: 'Before the cut and after (cyan = pass, orange = fail)',
    c1curve: '{m} vs pass share p; chord height at p = 0.7 = after',
    gParent: 'before {k}/{n}', gLeft: 'left {k}/{n}', gRight: 'right {k}/{n}',
    s1lgCurve: 'chosen measure', s1lgOther: 'the other two measures', s1lgChild: 'left and right groups', s1lgAvg: 'weighted average after the cut (on the chord)', s1lgParent: 'before the cut',
    s1readout: 'Left group {kl}/{nl} passed, right group {kr}/{nr}. Impurity decrease: error rate {de}, Gini index {dg}, entropy (information gain) {dh} bits. {note}',
    s1flat: 'The error rate did not move at all: both groups still have a pass majority, so the guesses and the number of mistakes stay the same. Gini and entropy both dropped: they can tell that the left group became pure.',
    s1allup: 'All three measures decreased.',
    s1none: 'Both groups have the same pass share as before (0.7), so no measure decreases: this cut carries no information.',
    s1hint: 'What to try: keep the default (12 students on the left, all passed) and switch between the three measures. Watch the two group points on the curve, the chord joining them, and the chord’s point at p = 0.7. The error rate is a bent line: with both points right of 0.5 the chord lies on the line itself, so the decrease is 0. Gini and entropy bulge upwards, so the chord always runs below the curve and any change in the groups’ shares gives a decrease. Then set 20 on the left with 14 passed: all three drop to 0. Decision trees usually use entropy or Gini; the rest of this page uses entropy.',

    s2k: 'Step 2 · Scan for the best cut',
    s2t: 'How does a machine pick the best cut out of all possible ones?',
    s2e: 'This step answers: how is “the best cut” found? By brute force, and reliably: for each feature, sweep the dividing line from the smallest value to the largest, compute the <strong>information gain</strong> at every position (entropy before − size-weighted entropy of the two groups after, in bits, larger is better), and keep the largest. The groups only change when the line passes between two neighbouring data values, so the gain curve is a staircase. The lower plot records the gain at every position you have visited.',
    scan2: 'Sweep automatically', clear2: 'Clear the curve',
    c2scatter: 'Current cut (horizontal: study h · vertical: sleep h)',
    c2gain: 'Information gain (bits) vs line position: {feat}',
    s2lgGain: 'gain at visited positions', s2lgNow: 'current position', s2lgBest: 'largest so far',
    s2readout: '“{feat} below {thr}?” Left {nl} ({kl} passed), right {nr} ({kr} passed). Entropy before {h0} bits, weighted after {h1} bits, information gain {g} bits. {best}',
    s2best: 'Largest gain among visited positions: {feat} below {thr}, {g} bits.',
    s2both: 'Both features swept: the best cut is “{feat} below {thr}”, gain {g} bits.',
    s2hint: 'What to try: press “Sweep automatically” and watch the gain curve draw itself from left to right, with the white dot settling on the peak. Then switch to “sleep” and sweep again. Each feature has its own best position; the machine asks the one with the larger gain first. The line is placed halfway between two neighbouring data values.',

    s3k: 'Step 3 · Grow a tree',
    s3t: 'After the first cut, ask each group another question: what grows?',
    s3e: 'This step answers: what if one cut is not enough? For each group the cut produced, repeat the previous step: sweep again inside that group and take the cut with the largest information gain. Asking layer after layer grows a <strong>decision tree</strong>: each fork is a question, the groups at the bottom that are not cut further are <strong>leaves</strong>, and a leaf guesses its majority class. The <strong>depth</strong> is the largest number of questions from the first one down to a leaf. Taking the best cut available right now and never revising it is called <strong>greedy</strong>. A group that is already all one class is not cut again.',
    depthSlider: 'Maximum depth', grow3: 'Grow layer by layer', reset3: 'Back to depth 0',
    c3: 'The tree’s rectangles (shade = leaf guess, red ring = wrong)',
    s3lgWrong: 'sorted wrongly',
    treeTitle: 'The tree’s rules (indent = next layer)',
    ruleQ: '{feat} below {thr}?', ruleYes: 'yes', ruleNo: 'no',
    ruleLeaf: 'guess “{c}” ({k}/{n} passed here)',
    s3readout: 'Depth limit {d} (actual {real}): {leaves} leaves, training accuracy {acc}% ({e} sorted wrongly). {note}',
    s3same: 'This layer’s cut changes no guess, so accuracy stays put; but it makes one half of a group pure, which lets the next layer finish the job. This is the “entropy sees it, error rate does not” of step 1.',
    s3hint: 'What to try: press “Grow layer by layer”. The rectangles subdivide, the red rings thin out, and the rules below unfold one layer at a time. Note depth 1 to 2: accuracy does not change, but layer 2 turns the “sleeps a lot” group into all passes, and depth 3 can then separate the rest. Go deeper and the tree starts drawing boxes around the two points whose labels were flipped.',

    s4k: 'Step 4 · How deep',
    s4t: 'Deeper trees fit the training set better. Do they also do better on students they have not seen?',
    s4e: 'This step answers: how should the depth be chosen? Accuracy on the <strong>training set</strong> (the 80 students the tree is grown on) rises with depth and can reach 100%. What matters, though, is <strong>new data</strong>: another 600 students simulated from the same rule, with the same share of flipped labels, never seen while growing the tree. Accuracy on those 600 is the <strong>test accuracy</strong>. The dashed line is what “guess with the hidden rule itself” would score: nobody can predict a flipped label, so it is the ceiling for test accuracy. When a tree memorises accidents of the training set (such as flipped points) and gets worse on new data, that is <strong>overfitting</strong>.',
    depth4: 'Maximum depth', noise4: 'Share of flipped labels',
    c4curve: 'Accuracy vs maximum depth (training set vs new data)',
    c4part: 'Cuts at this depth (training set, 80 students)',
    s4lgTrain: 'training accuracy', s4lgTest: 'new-data (test) accuracy', s4lgCeil: 'accuracy of the hidden rule (ceiling)',
    s4readout: 'Flipped {nz}%, depth {d}: {leaves} leaves, training {tr}%, test {te}%. Test accuracy peaks at depth {bd} ({bt}%); ceiling {ceil}%.',
    s4hint: 'What to try: keep 8% flipped and drag the depth from 0 to 10. The white line climbs to 100%, while the cyan line reaches 92% at depth 3 (touching the ceiling) and then falls to 84%; thin slivers that fence in single points appear in the cut map. Then set the flips to 0: the cyan line no longer falls, and extra depth does no harm. Raise the flips and the peak gets lower while going too deep costs more.',

    s5k: 'Step 5 · Greedy’s blind spot',
    s5t: 'If every single cut looks useless and only two cuts together help, can greedy find them?',
    s5e: 'This step answers: greedy looks one cut ahead; can it miss a pattern that needs two cuts working together? A new simulated data set: two features a and b, both between 0 and 1, and the rule “cyan when exactly one of a, b is above 0.5”, like the four squares of a checkerboard (XOR). Any single cut along either feature leaves both sides about half and half, so a single cut gains almost nothing; yet cutting a = 0.5 first and then b = 0.5 on each side sorts everything. Two first cuts are compared: <strong>greedy</strong> (take the cut with the largest gain) and <strong>forced</strong> (the first cut is fixed at a = 0.5, everything after it is still greedy). New data are another 600 points from the same rule.',
    modeGreedy: 'First cut: greedy', modeForce: 'First cut: forced a < 0.5',
    depth5: 'Maximum depth',
    c5part: '80 points and the tree’s cuts (horizontal a · vertical b)',
    c5gain: 'Information gain of the first cut vs line position (all below 0.05 bits)',
    s5lgA: 'cut along a', s5lgB: 'cut along b', s5lgPick: 'the first cut used',
    s5readout: 'First cut “{feat} below {thr}”, gain {g} bits. Depth {d}: {leaves} leaves, training accuracy {tr}%, new-data accuracy {te}%.',
    s5hint: 'What to try: look at the gain plot first: both lines hug the floor, and greedy picks the tallest little spike, near an edge. Keep “greedy” and drag the depth from 1 to 4: new-data accuracy stays between 47% and 58%, hardly better than guessing. Then press “forced a < 0.5”: at depth 2 every training point is right and new data reach 99%. Greedy is not wrong; it simply cannot see that “this cut is useless by itself but sets up the next one”.',

    s6k: 'Step 6 · Wrap-up', s6t: 'A chain of yes/no questions: easy to read, easy to use, but keep the depth in check',
    s6fin: 'The thread. <strong>Step 0</strong>: one question splits the students into two groups, and each group guesses its majority. <strong>Step 1</strong>: score a cut by impurity; the error rate often cannot see progress, while entropy and Gini can. <strong>Step 2</strong>: sweep every dividing line on every feature and keep the cut with the largest information gain. <strong>Step 3</strong>: repeat inside each group and the tree grows greedily. <strong>Step 4</strong>: too deep, and the tree memorises accidents and gets worse on new data. <strong>Step 5</strong>: greedy cannot see patterns that need two cuts working together.',
    formula: 'Entropy H(p) = −p·log₂p − (1−p)·log₂(1−p)\nInformation gain = H(before) − Σ (group size / total)·H(group)\nLeaf guess = majority class in the leaf',
    boundary: 'Scope: all data here are simulated, with two numeric features, and every cut runs along one feature (parallel to an axis). Real decision trees also handle categorical features and missing values, usually choose the depth by pruning or cross-validation, and are often combined into many-tree ensembles (random forests, gradient-boosted trees). The step 4 results hold for this data set and these flip rates only; “depth 3 is best” is not a general law. The majority share in a leaf is not a calibrated probability either.',
    linksTitle: 'Where to go next',
    lk1: '→ Entropy, step 3: binary entropy and “twenty questions”',
    lk2: '→ Overfitting, step 1: why training error and test error part ways',
    lk3: '→ Binary search, step 1: every question halves the range',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Decision Trees and Information Gain”.'
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
