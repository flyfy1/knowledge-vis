'use strict';
// Bayes lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '贝叶斯更新 · 证据只负责乘一个倍数',
    back: '← 知识索引',
    compare: '对照另一版本：贝叶斯 · 先查底子，再看证据 →',
    navLabel: '贝叶斯步骤导航',
    tagline: '垃圾邮件过滤器报警了，这封邮件是垃圾的概率有多大？答案取决于两样东西：报警之前垃圾邮件本来有多常见，以及报警这件事对垃圾和正常邮件各有多常见。七步里你会先数人头，再把这条规则改写成「先验赔率 × 似然比」，最后用它从一串点击数据里估计一个未知比例。',
    nav0: '0 数一千封', nav1: '1 两个方向', nav2: '2 赔率', nav3: '3 连乘证据', nav4: '4 未知比例', nav5: '5 先验之争', nav6: '6 收束',

    s0k: '第 0 步 · 先数人头',
    s0t: '过滤器报警了，这封邮件有多大可能真是垃圾？',
    s0e: '这一步要回答：已知过滤器的准确程度，一封<strong>被报警</strong>的邮件是垃圾邮件的概率是多少？设定是这样的：过滤器会把 <strong>90%</strong> 的垃圾邮件标出来（报警），也会把 <strong>10%</strong> 的正常邮件误标出来（误报）。报警之前，垃圾邮件在全部邮件里占的比例叫<strong>基础率</strong>，先设为 1%。最不容易出错的算法是数人头：想象 1000 封邮件，按这些比例分好组，再只看被报警的那一组。下面的图里每个小方块是一封邮件；这些人数是按比例算出的期望人数，不是一次随机抽样。',
    quizPrompt: '先猜一猜：基础率 1%，过滤器报警了。这封邮件是垃圾邮件的概率最接近多少？',
    quizA: '90%：过滤器对垃圾邮件 90% 会报警', quizB: '50%：要么是要么不是', quizC: '8%：报警的大多是误报',
    check: '核对',
    correct: '对。1000 封里只有 10 封垃圾，报警 9 封；990 封正常邮件里误报 99 封。报警的 108 封中真正的垃圾只有 9 封，约 8.3%。拖动下面的滑杆看这个数怎样随基础率变化。',
    wrong: '再看看下面的图：报警的邮件（亮色方块）里，橙色和青色各有多少？90% 说的是「垃圾邮件里有多少被报警」，不是「报警的里有多少是垃圾」。',
    c0aria: '1000 封邮件的方块图和报警池组成条',
    lgSpamF: '垃圾 · 报警', lgSpam: '垃圾 · 未报警', lgHamF: '正常 · 误报', lgHam: '正常 · 未报警',
    baseRate: '基础率（报警前垃圾邮件占比）',
    onlyFlagged: '只看被报警的邮件',
    c0grid: '1000 封邮件（每格一封）', c0bar: '报警池：被报警的邮件里，垃圾占多少？',
    s0readout: '1000 封里垃圾 {S} 封，报警其中 {Fs} 封（90%）；正常 {H} 封，误报 {Fh} 封（10%）。报警的一共 {F} 封，真是垃圾的 {Fs} 封：P(垃圾 | 报警) = {Fs}/{F} = {post}。',
    s0hint: '观察顺序：先按「只看被报警的邮件」，未报警的方块变暗，剩下的亮色方块就是你此刻能看到的全部情况；数一数其中橙色占多少，这就是答案。再把基础率从 1% 往上拖：过滤器本身没变（仍是 90% 与 10%），但报警池里橙色的比例一路上升，基础率 10% 时到 50%。',

    s1k: '第 1 步 · 条件概率的两个方向',
    s1t: '「垃圾邮件里 90% 会报警」和「报警的里 90% 是垃圾」是一回事吗？',
    s1e: '这一步要回答：两个方向的<strong>条件概率</strong>各是什么，它们怎样互相换算？P(B | A) 读作「已知 A 发生时 B 的概率」：只在 A 发生的那部分里看 B 占多少。下图是一个面积为 1 的正方形，代表全部邮件。先竖着切：左边宽度 π 是垃圾邮件（π 就是<strong>基础率</strong>，也叫<strong>先验</strong>：看到证据之前的概率），右边宽度 1 − π 是正常邮件。再在每一列里从下往上涂亮报警的部分：垃圾那一列涂到高度 a = P(报警 | 垃圾)，正常那一列涂到高度 b = P(报警 | 正常)。a、b 叫<strong>似然</strong>：在某个假设成立时，看到这条证据的概率。两块亮色面积是 πa 和 (1 − π)b。我们要的<strong>后验</strong> P(垃圾 | 报警) 是「亮色面积里橙色占多少」，这就是<strong>贝叶斯公式</strong>：P(垃圾 | 报警) = πa ÷ (πa + (1 − π)b)。',
    c1aria: '全部邮件的面积图与报警池',
    lg1A: '垃圾且报警：面积 πa', lg1B: '正常且报警：面积 (1 − π)b', lg1N: '未报警',
    prior1: '先验 π（垃圾邮件占比）', hit1: '似然 a = P(报警 | 垃圾)', fa1: '似然 b = P(报警 | 正常)',
    c1mosaic: '全部邮件：宽 = 占比，亮色高度 = 报警率', c1pool: '报警池：把两块亮色面积首尾相接',
    s1readout: 'a = P(报警 | 垃圾) = {a}，是竖着看：橙色列里亮色占多少。P(垃圾 | 报警) = {A} ÷ ({A} + {B}) = {post}，是横着看：报警池里橙色占多少。两者相差 {gap} 个百分点。',
    s1hint: '观察顺序：先只拖先验 π，看橙色列变宽变窄，而 a 那条亮色高度不动；报警池里橙色比例却跟着变。再把 π 固定，把误报率 b 往 1% 拖：正常列里的亮色变矮，报警池里青色缩短，后验上升。想让两种条件概率接近，要 π 不小、b 很小同时成立。',

    s2k: '第 2 步 · 换成赔率',
    s2t: '同一条证据，为什么有时把概率推高很多、有时几乎推不动？',
    s2e: '这一步要回答：能不能把「先验」和「证据强度」拆开，让证据的作用变成一个固定的量？办法是把概率换成<strong>赔率</strong>：赔率 = P ÷ (1 − P)，即「是」对「不是」的比；1% 的赔率是 1 : 99。证据强度用<strong>似然比</strong> LR = P(证据 | 是) ÷ P(证据 | 不是) 表示；第 0 步的过滤器 LR = 0.9 ÷ 0.1 = 9。贝叶斯公式在赔率下变成一次乘法：<strong>后验赔率 = 先验赔率 × LR</strong>（把第 1 步的 πa ÷ (1 − π)b 拆开就是这个式子）。再取对数，乘法变成加法：在「对数赔率」轴上，同一条证据永远把你向右推同样的距离 log₁₀ LR。上图的轴就是对数赔率，刻度换算成了概率；下图横轴是先验、纵轴是后验，画出当前 LR 下两者的关系。',
    c2aria: '对数赔率轴上的先验与后验，以及后验随先验变化的曲线',
    lg2Prior: '先验', lg2Arrow: '证据推动的距离 log₁₀ LR', lg2Post: '后验', lg2Diag: '对角线：LR = 1，证据不改变判断',
    prior2: '先验 P', lr2: '似然比 LR',
    clearHist: '清除记录',
    c2line: '对数赔率轴（刻度标的是对应的概率）', c2curve: '后验（纵）随先验（横）变化，当前 LR',
    s2readout: '先验 {p}，赔率 {po}　×　LR {lr}　=　后验赔率 {qo}，后验 {q}。对数赔率从 {lp} 移到 {lq}，移动 {d}（= log₁₀ {lr}）。',
    s2hint: '观察顺序：保持 LR = 9 不动，把先验从 0.1% 拖到 99.9%。上图每试一个先验都留下一条箭头：箭头长度全都一样，这就是「证据只负责乘一个倍数」。但换算回概率，先验在 1% 附近时后验只到 8%，先验在 50% 时后验到 90%。下图里曲线与对角线的竖直距离，就是概率被推高了多少：先验靠近 0 或 100% 时这段距离很小，LR = 9 时在先验 25% 处最大（25% → 75%）。再改 LR：LR < 1 的证据把箭头掉头向左，LR = 1 时箭头长度为 0。',

    s3k: '第 3 步 · 一条接一条的证据',
    s3t: '一封邮件里出现好几个词，证据怎样累计？',
    s3e: '这一步要回答：有不止一条证据时，后验怎样一步步更新？上一步的规则可以连着用：看完第一条证据得到的后验，就是看第二条证据时的先验。在赔率下就是把各条证据的似然比依次乘上去。下面每张卡片是一个词：它在垃圾邮件里出现的概率、在正常邮件里出现的概率，以及两者之比 LR。连乘有一个前提：<strong>条件独立</strong>，即在「已知是垃圾」时各个词出不出现互不影响，在「已知是正常」时也一样。这正是朴素贝叶斯过滤器的假设；真实邮件里词与词常常相关，这时连乘会高估证据的总强度。',
    c3aria: '证据累计：对数赔率随证据条数变化的阶梯图',
    lg3Up: 'LR > 1：推向垃圾', lg3Down: 'LR < 1：推向正常', lg3Ghost: '打乱前的顺序',
    prior3: '先验（看任何词之前）',
    w_free: '免费', w_prize: '中奖', w_link: '点击链接', w_invoice: '发票', w_attach: '附件', w_meeting: '会议',
    wcard: '垃圾 {s} · 正常 {h}', wlr: 'LR = {lr}',
    undo: '撤销最后一个词', shuffle: '打乱顺序重算', clearAll: '清空',
    c3title: '对数赔率随证据累计（刻度标的是概率）',
    s3readout: '账本：{ledger}　→　后验 {p}（共 {n} 个词）',
    s3empty: '还没有证据：后验 = 先验 {p}。点上面的词按钮把它加进这封邮件。',
    s3shuf: '顺序已打乱：中间经过的概率变了，终点一样。',
    s3hint: '观察顺序：先依次点「免费」「中奖」「会议」，看阶梯两上一下：每一级的高度只由那个词的 LR 决定。再按「打乱顺序重算」：灰色虚线是原来的路径，新路径中途经过的概率不同，但最后落在同一点，因为乘法不分先后。最后把先验拖到 50%：整条阶梯平移，形状不变。',

    s4k: '第 4 步 · 未知的是一个比例',
    s4t: '要估计的不是「是或不是」，而是一个比例时，怎么更新？',
    s4e: '这一步要回答：一个新按钮的点击率 θ（点了的访客占全部访客的比例）未知，看过一批访客之后，θ 可能在哪里、还剩多少不确定？现在假设不止两个，而是 θ 的每一个可能值。做法和前面一样：给 0 到 1 之间每个 θ 一个<strong>先验</strong>权重（这里先取处处相等，表示没有偏好），每来一位访客，就把每个 θ 的权重乘上它的<strong>似然</strong>（点了乘 θ，没点乘 1 − θ），再整体缩放让总面积为 1。得到的曲线叫<strong>后验分布</strong>：曲线下某一段的面积，就是 θ 落在那段的概率。数据是<strong>模拟</strong>的：程序按真实点击率 0.3 生成了 400 位访客；页面把真值画成虚线，现实中你看不到它。<strong>90% 可信区间</strong>指后验面积左右各留 5% 之后中间那一段。',
    c4aria: '点击率的后验分布，以及后验均值和 90% 可信区间随访客数变化',
    lg4Now: '当前后验', lg4Old: '之前的后验（每按一次留一条）', lg4Band: '90% 可信区间', lgTrue: '模拟用的真值 θ = 0.3',
    add1: '再来 1 位访客', add10: '再来 10 位', add100: '再来 100 位', reset: '从头开始',
    c4top: '点击率 θ 的后验分布（纵轴：概率密度）', c4bot: '后验均值与 90% 可信区间，随访客数 n',
    s4readout: '{n}/400 位访客，点了 {k} 位。后验均值 {m}，90% 可信区间 [{lo}, {hi}]，宽 {w}；宽度 × √n = {ws}。',
    s4zero: '0/400 位访客：后验 = 先验（处处相等），均值 0.5，90% 可信区间 [0.05, 0.95]。',
    s4full: '已用完全部 400 位模拟访客。',
    s4hint: '观察顺序：先按几次「再来 1 位访客」，看曲线每次往点了或没点的方向歪一点；再按「再来 100 位」，看旧曲线留成灰色，新曲线又高又窄。下图记录了每个 n 下的区间：区间逐渐收窄；在这串数据里，n = 0 到 400 中只有 n = 21 那一次没围住虚线真值（前 21 位里恰好有 10 位点了）。读数里「宽度 × √n」在 n ≥ 25 以后停在 1.4 到 1.6 之间：区间宽度大致按 1/√n 缩小，数据翻四倍，区间才窄一半。',

    s5k: '第 5 步 · 先验的影响',
    s5t: '两个人先验不同，看了同一批数据，最后会不会意见一致？',
    s5e: '这一步要回答：先验是主观选的，它对结论的影响会不会一直存在？下面两个人看同一串访客（第 4 步那 400 位）。橙色的人事先认为大多数访客会点，先验集中在 0.7 附近；青色的人可以选两种：一种认为很少有人点，先验集中在 0.1 附近；另一种更极端，认定 θ 不可能超过 0.2，把 0.2 以上的先验权重设成 0。每个人都按第 4 步的方法更新。虚线是各自的先验，实线是看过 n 位访客后的<strong>后验</strong>。',
    c5aria: '两种先验在同一批数据下的后验分布与后验均值轨迹',
    lg5A: '先验偏高（集中在 0.7 附近）', lg5Blow: '先验偏低（集中在 0.1 附近）', lg5Bcap: '认定 θ ≤ 0.2', lg5Prior: '虚线：各自的先验',
    n5: '已看的访客数 n', bLow: '青色：先验偏低', bCap: '青色：认定 θ ≤ 0.2', play5: '从 0 播放到 400',
    c5top: '两个人此刻的后验分布', c5bot: '两个人的后验均值，随访客数 n',
    s5readout: 'n = {n}，点了 {k} 位。橙色后验均值 {a}，青色 {b}，两者相差 {gap}。',
    s5capNote: '青色的先验在 0.2 以上为 0：乘上任何似然仍是 0，所以它的后验永远到不了 0.2 以上。',
    s5hint: '观察顺序：先选「先验偏低」，把 n 从 0 拖到 400（或按播放），看下图两条均值线：一开始相差 0.53，n = 400 时只差 0.02，都靠近虚线。数据越多，似然的乘积越尖，先验的影响越小。再切到「认定 θ ≤ 0.2」重来：青色均值贴着 0.2 上不去。先验被数据冲淡有条件：先验必须给真值留下非零的可能，数据也要真的来自这个模型。',

    s6k: '第 6 步 · 收束',
    s6t: '一条规则，三种写法',
    s6fin: '整页只用了一条规则。<strong>数人头</strong>：只看证据发生的那一组，数其中假设成立的比例。<strong>面积</strong>：后验 = 「假设成立且证据出现」的面积 ÷ 「证据出现」的总面积。<strong>赔率</strong>：后验赔率 = 先验赔率 × 似然比，取对数后每条证据只是加上一段固定距离。当未知量是一个连续的比例时，规则不变，只是对每一个可能值都乘一次似然再归一。',
    formula: 'P(H | E) = P(H)·P(E | H) ÷ P(E)\n后验赔率 = 先验赔率 × LR，LR = P(E | H) ÷ P(E | ¬H)\n后验(θ) ∝ 先验(θ) × 似然(数据 | θ)',
    boundary: '适用范围：似然要事先知道且可信（过滤器在你的邮箱里未必还是 90% 与 10%）；多条证据连乘要求条件独立，相关的证据会被重复计数；同一条记录看两遍不是两条证据；先验给某个值零权重时，任何数据都救不回来；本页的点击数据是模拟的，模型与数据来源一致，现实中模型本身也可能错。',
    linksTitle: '接着去看',
    lk1: '遗传概率第 3 步：看到显性表型，倒推基因型（同一种「反过来求」） →',
    lk2: '假设检验第 2 步：p ≤ 0.05 的误判风险，回答的是另一个方向的条件概率 →',
    lk3: '统计推断第 1 步：频率学派的置信区间，与本页可信区间对照 →',
    lk4: '频率与概率第 1 步：转得越多，频率越稳定 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《贝叶斯 · 先查底子，再看证据》的平行版本。'
  },
  en: {
    pageTitle: 'Bayesian Updating · Evidence Only Multiplies the Odds',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Bayes · Check the Base Rate Before the Evidence →',
    navLabel: 'Bayes step navigation',
    tagline: 'The spam filter fires. How likely is it that this email really is spam? It depends on two things: how common spam was before the alarm, and how common the alarm is for spam versus normal mail. Over seven steps you will count heads, rewrite the rule as “prior odds × likelihood ratio”, and finally use it to estimate an unknown rate from a stream of clicks.',
    nav0: '0 Count 1000', nav1: '1 Two directions', nav2: '2 Odds', nav3: '3 Chained evidence', nav4: '4 Unknown rate', nav5: '5 Duelling priors', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · COUNT HEADS FIRST',
    s0t: 'The filter fired. How likely is this email to be spam?',
    s0e: 'This step asks: knowing how accurate the filter is, what is the chance that a <strong>flagged</strong> email is spam? The set-up: the filter flags <strong>90%</strong> of spam, and it also wrongly flags <strong>10%</strong> of normal mail (false alarms). Before any alarm, the share of spam among all mail is the <strong>base rate</strong>; start it at 1%. The hardest method to get wrong is counting: picture 1000 emails split by these proportions, then look only at the flagged group. Each small square below is one email; the counts are expected counts from the proportions, not one random draw.',
    quizPrompt: 'Guess first: base rate 1%, and the filter fires. The chance that this email is spam is closest to…',
    quizA: '90% — the filter catches 90% of spam', quizB: '50% — it either is or it isn’t', quizC: '8% — most alarms are false alarms',
    check: 'Check',
    correct: 'Right. Of 1000 emails only 10 are spam, and 9 of those are flagged; of the 990 normal ones, 99 are false alarms. Among the 108 flagged emails just 9 are spam, about 8.3%. Drag the slider below to see how this moves with the base rate.',
    wrong: 'Look at the picture below: among the flagged emails (bright squares), how many are orange and how many cyan? “90%” is the share of spam that gets flagged, not the share of flagged mail that is spam.',
    c0aria: 'Square chart of 1000 emails and a bar showing what the flagged pool is made of',
    lgSpamF: 'Spam · flagged', lgSpam: 'Spam · not flagged', lgHamF: 'Normal · false alarm', lgHam: 'Normal · not flagged',
    baseRate: 'Base rate (share of spam before any alarm)',
    onlyFlagged: 'Show flagged emails only',
    c0grid: '1000 emails (one per square)', c0bar: 'Flagged pool: how much of it is spam?',
    s0readout: 'Of 1000 emails, {S} are spam and {Fs} of them are flagged (90%); {H} are normal and {Fh} of them are false alarms (10%). {F} are flagged in all, {Fs} of them spam: P(spam | flagged) = {Fs}/{F} = {post}.',
    s0hint: 'What to try: first press “Show flagged emails only”. The unflagged squares fade, and the bright ones left are everything you can actually see once the alarm goes off; the orange share among them is the answer. Then drag the base rate up from 1%. The filter has not changed (still 90% and 10%), yet the orange share of the flagged pool keeps climbing, reaching 50% at a 10% base rate.',

    s1k: 'STEP 1 · TWO DIRECTIONS OF CONDITIONING',
    s1t: 'Is “90% of spam gets flagged” the same as “90% of flagged mail is spam”?',
    s1e: 'This step asks: what are the two directions of <strong>conditional probability</strong>, and how do you convert one into the other? P(B | A) reads “the probability of B given A”: look only at the part where A happened and ask what share of it is B. The square below has area 1 and stands for all mail. Slice it vertically first: the left strip, of width π, is spam (π is the <strong>base rate</strong>, also called the <strong>prior</strong>: the probability before seeing evidence); the right strip, of width 1 − π, is normal mail. Then light up the flagged part of each strip from the bottom: the spam strip up to height a = P(flag | spam), the normal strip up to height b = P(flag | normal). a and b are <strong>likelihoods</strong>: the chance of seeing this evidence if a given hypothesis is true. The two lit areas are πa and (1 − π)b. The <strong>posterior</strong> we want, P(spam | flag), is the orange share of all lit area — which is <strong>Bayes’ rule</strong>: P(spam | flag) = πa ÷ (πa + (1 − π)b).',
    c1aria: 'Area chart of all mail and the flagged pool',
    lg1A: 'Spam and flagged: area πa', lg1B: 'Normal and flagged: area (1 − π)b', lg1N: 'Not flagged',
    prior1: 'Prior π (share of spam)', hit1: 'Likelihood a = P(flag | spam)', fa1: 'Likelihood b = P(flag | normal)',
    c1mosaic: 'All mail: width = share, lit height = flag rate', c1pool: 'Flagged pool: the two lit areas laid end to end',
    s1readout: 'a = P(flag | spam) = {a} reads vertically: how much of the orange strip is lit. P(spam | flag) = {A} ÷ ({A} + {B}) = {post} reads horizontally: how much of the flagged pool is orange. They differ by {gap} percentage points.',
    s1hint: 'What to try: drag only the prior π. The orange strip widens and narrows while its lit height a stays put, yet the orange share of the flagged pool moves. Then hold π and drag the false-alarm rate b toward 1%: the lit part of the normal strip shrinks, the cyan part of the pool gets shorter, and the posterior rises. The two conditional probabilities only come close when π is not small and b is tiny at the same time.',

    s2k: 'STEP 2 · SWITCH TO ODDS',
    s2t: 'Why does the same evidence sometimes move the probability a lot and sometimes barely at all?',
    s2e: 'This step asks: can we separate “the prior” from “the strength of the evidence”, so that evidence acts as one fixed amount? The trick is to trade probability for <strong>odds</strong>: odds = P ÷ (1 − P), the ratio of “yes” to “no”; 1% is odds of 1 : 99. Evidence strength is the <strong>likelihood ratio</strong> LR = P(evidence | yes) ÷ P(evidence | no); the filter of step 0 has LR = 0.9 ÷ 0.1 = 9. In odds, Bayes’ rule is a single multiplication: <strong>posterior odds = prior odds × LR</strong> (split step 1’s πa ÷ (1 − π)b and that is what you get). Take logs and the multiplication becomes addition: on a “log-odds” axis the same evidence always pushes you right by the same distance, log₁₀ LR. The top axis is log-odds, labelled with the matching probabilities; the bottom chart has the prior across and the posterior up, for the current LR.',
    c2aria: 'Prior and posterior on a log-odds axis, and the posterior as a function of the prior',
    lg2Prior: 'Prior', lg2Arrow: 'Push from the evidence, log₁₀ LR', lg2Post: 'Posterior', lg2Diag: 'Diagonal: LR = 1, evidence changes nothing',
    prior2: 'Prior P', lr2: 'Likelihood ratio LR',
    clearHist: 'Clear history',
    c2line: 'Log-odds axis (ticks show the matching probability)', c2curve: 'Posterior (up) against prior (across), current LR',
    s2readout: 'Prior {p}, odds {po}  ×  LR {lr}  =  posterior odds {qo}, posterior {q}. Log-odds moves from {lp} to {lq}, a shift of {d} (= log₁₀ {lr}).',
    s2hint: 'What to try: keep LR = 9 and drag the prior from 0.1% to 99.9%. Each prior you try leaves an arrow on the top axis, and every arrow has the same length — that is “evidence only multiplies the odds”. Converted back to probability, though, a 1% prior only reaches 8%, while a 50% prior reaches 90%. In the bottom chart, the vertical distance between the curve and the diagonal is how far the probability got pushed: it is small when the prior is near 0 or 100%, and for LR = 9 it peaks at a 25% prior (25% → 75%). Then change LR: evidence with LR < 1 turns the arrow around to point left, and at LR = 1 the arrow has zero length.',

    s3k: 'STEP 3 · ONE PIECE OF EVIDENCE AFTER ANOTHER',
    s3t: 'An email contains several telling words. How does the evidence add up?',
    s3e: 'This step asks: with more than one piece of evidence, how does the posterior update step by step? The rule chains: the posterior after the first piece of evidence is the prior for the second. In odds, you multiply in each likelihood ratio in turn. Each card below is a word: how often it appears in spam, how often in normal mail, and their ratio LR. Chaining has a precondition, <strong>conditional independence</strong>: once you know an email is spam, whether one word appears tells you nothing about another, and likewise for normal mail. That is exactly the assumption of a naive Bayes filter. In real mail words are often correlated, and then chaining overstates the total strength of the evidence.',
    c3aria: 'Evidence ledger: a staircase of log-odds against the number of words seen',
    lg3Up: 'LR > 1: pushes toward spam', lg3Down: 'LR < 1: pushes toward normal', lg3Ghost: 'Order before shuffling',
    prior3: 'Prior (before any word)',
    w_free: 'free', w_prize: 'winner', w_link: 'click here', w_invoice: 'invoice', w_attach: 'attachment', w_meeting: 'meeting',
    wcard: 'spam {s} · normal {h}', wlr: 'LR = {lr}',
    undo: 'Undo last word', shuffle: 'Shuffle order and recompute', clearAll: 'Clear',
    c3title: 'Log-odds as evidence accumulates (ticks show probability)',
    s3readout: 'Ledger: {ledger}  →  posterior {p} ({n} words)',
    s3empty: 'No evidence yet: posterior = prior {p}. Press a word button above to add it to this email.',
    s3shuf: 'Order shuffled: the probabilities along the way changed, the end point did not.',
    s3hint: 'What to try: press “free”, “winner”, “meeting” in turn and watch the staircase go up, up, down; the height of each step is set by that word’s LR alone. Then press “Shuffle order and recompute”: the grey dashed line is the old path, the new path passes through different probabilities, yet it lands on the same point, because multiplication does not care about order. Finally drag the prior to 50%: the whole staircase slides, its shape unchanged.',

    s4k: 'STEP 4 · THE UNKNOWN IS A RATE',
    s4t: 'How do you update when the unknown is a proportion, not a yes or no?',
    s4e: 'This step asks: a new button has an unknown click rate θ (the share of visitors who click it). After watching some visitors, where could θ be, and how much uncertainty is left? Now there are not two hypotheses but one for every possible value of θ. The recipe is the same as before: give every θ between 0 and 1 a <strong>prior</strong> weight (here equal everywhere, meaning no preference); for each visitor, multiply every θ’s weight by its <strong>likelihood</strong> (θ if they clicked, 1 − θ if not), then rescale so the total area is 1. The resulting curve is the <strong>posterior distribution</strong>: the area under any stretch of it is the probability that θ lies there. The data are <strong>simulated</strong>: the program generated 400 visitors with a true click rate of 0.3. The page draws the truth as a dashed line; in real life you never see it. A <strong>90% credible interval</strong> is the middle stretch left after trimming 5% of the posterior area from each side.',
    c4aria: 'Posterior distribution of the click rate, and its mean and 90% credible interval as visitors arrive',
    lg4Now: 'Current posterior', lg4Old: 'Earlier posteriors (one per press)', lg4Band: '90% credible interval', lgTrue: 'True θ = 0.3 used by the simulation',
    add1: 'One more visitor', add10: '10 more', add100: '100 more', reset: 'Start over',
    c4top: 'Posterior of the click rate θ (up: probability density)', c4bot: 'Posterior mean and 90% credible interval against visitors n',
    s4readout: '{n}/400 visitors, {k} clicked. Posterior mean {m}, 90% credible interval [{lo}, {hi}], width {w}; width × √n = {ws}.',
    s4zero: '0/400 visitors: posterior = prior (flat), mean 0.5, 90% credible interval [0.05, 0.95].',
    s4full: 'All 400 simulated visitors used.',
    s4hint: 'What to try: press “One more visitor” a few times and watch the curve tilt a little toward clicked or not clicked each time. Then press “100 more”: the old curves stay behind in grey while the new one is taller and narrower. The bottom chart keeps the interval at every n: it narrows, and in this stream it misses the dashed truth only once between n = 0 and 400, at n = 21 (10 of the first 21 visitors happened to click). In the readout, “width × √n” settles between 1.4 and 1.6 once n ≥ 25: the interval shrinks roughly like 1/√n, so you need four times the data to halve it.',

    s5k: 'STEP 5 · HOW MUCH THE PRIOR MATTERS',
    s5t: 'Two people start with different priors and see the same data. Do they end up agreeing?',
    s5e: 'This step asks: the prior is a choice — does its influence on the conclusion last forever? Two people watch the same stream of visitors (the 400 from step 4). The orange one expects most visitors to click, so their prior is concentrated near 0.7. For the cyan one you can pick between two priors: one expects few clicks, concentrated near 0.1; the other is more extreme and insists θ cannot exceed 0.2, giving zero prior weight to everything above 0.2. Both update with step 4’s method. Dashed curves are their priors; solid curves are their <strong>posteriors</strong> after n visitors.',
    c5aria: 'Posteriors under two priors on the same data, and the paths of their posterior means',
    lg5A: 'High prior (concentrated near 0.7)', lg5Blow: 'Low prior (concentrated near 0.1)', lg5Bcap: 'Insists θ ≤ 0.2', lg5Prior: 'Dashed: each prior',
    n5: 'Visitors seen n', bLow: 'Cyan: low prior', bCap: 'Cyan: insists θ ≤ 0.2', play5: 'Play from 0 to 400',
    c5top: 'Both posteriors right now', c5bot: 'Both posterior means against visitors n',
    s5readout: 'n = {n}, {k} clicked. Orange posterior mean {a}, cyan {b}, a gap of {gap}.',
    s5capNote: 'The cyan prior is zero above 0.2; any likelihood times zero is still zero, so this posterior can never move above 0.2.',
    s5hint: 'What to try: pick “low prior” and drag n from 0 to 400 (or press play). In the bottom chart the two mean lines start 0.53 apart and end only 0.02 apart at n = 400, both near the dashed line. The more data, the sharper the product of likelihoods, and the less the prior matters. Then switch to “insists θ ≤ 0.2” and replay: the cyan mean presses against 0.2 and cannot pass it. Priors wash out only under conditions: the prior must leave the truth some non-zero chance, and the data must really come from the model.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'One rule, three ways to write it',
    s6fin: 'The whole page used one rule. <strong>Counting</strong>: look only at the group where the evidence happened and count the share where the hypothesis holds. <strong>Area</strong>: posterior = the area of “hypothesis true and evidence seen” ÷ the total area of “evidence seen”. <strong>Odds</strong>: posterior odds = prior odds × likelihood ratio, and after taking logs each piece of evidence just adds a fixed distance. When the unknown is a continuous rate the rule does not change: multiply every possible value by its likelihood, then renormalise.',
    formula: 'P(H | E) = P(H)·P(E | H) ÷ P(E)\nposterior odds = prior odds × LR, LR = P(E | H) ÷ P(E | ¬H)\nposterior(θ) ∝ prior(θ) × likelihood(data | θ)',
    boundary: 'Where it holds: the likelihoods must be known and trustworthy (the filter may not be 90% and 10% on your inbox); chaining several pieces of evidence needs conditional independence, or correlated evidence gets counted twice; reading the same record twice is not two pieces of evidence; a prior that gives some value zero weight can never be rescued by data; the click data on this page are simulated, so model and data agree — in practice the model itself can be wrong.',
    linksTitle: 'Where to next',
    lk1: 'Genetics probability, step 3: infer the genotype from a dominant trait (the same “reverse” question) →',
    lk2: 'Hypothesis testing, step 2: the false-alarm risk of p ≤ 0.05 answers the other direction of conditioning →',
    lk3: 'Statistical inference, step 1: frequentist confidence intervals, to set beside this page’s credible intervals →',
    lk4: 'Probability as frequency, step 1: the more spins, the steadier the frequency →',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Bayes · Check the Base Rate Before the Evidence”.'
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
  if (typeof window.refreshBayes === 'function') window.refreshBayes();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BAYES_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
