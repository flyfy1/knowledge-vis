'use strict';
// Sorting & Big O lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '排序与大 O · 数一数比较了几次',
    back: '← 知识索引',
    compare: '对照另一版本：排序与大 O · 增长的形状 →',
    navLabel: '排序步骤导航',
    tagline: '把一堆数排好序，不同的方法要花的功夫差得很远。本页不掐秒表，只数一件事：两个元素比了几次大小。七步里你会亲手数出选择排序、插入排序、归并排序和快速排序的比较次数，看它们随数据量 n 怎样增长，最后证明任何只靠比较的排序都省不掉大约 n·log₂n 次。',
    nav0: '0 怎么数', nav1: '1 看输入', nav2: '2 归并', nav3: '3 增长形状', nav4: '4 快排主元', nav5: '5 下界', nav6: '6 收束',

    s0k: '第 0 步 · 拿什么当尺子',
    s0t: '排好 8 个数，选择排序一共要比较几次？',
    s0e: '这一步要回答：怎样衡量一个排序方法快不快，而不受电脑快慢影响？秒数会随机器、语言变化，但<strong>比较次数</strong>（算法问了多少次「a 比 b 小吗？」）只取决于方法本身和输入，所以本页一律数比较次数。先看<strong>选择排序</strong>：从还没排好的部分里逐个比较，找出最小的那个，放到已排好部分的末尾；重复，直到全部排好。第一轮要在 8 个里找最小，比 7 次；第二轮在剩下 7 个里比 6 次……一共 7 + 6 + … + 1 = 28 次，也就是 n(n − 1)/2，n 是元素个数。',
    c0a: '8 根柱子（高度 = 数值）', c0b: '比较计数：共 28 格，每比一次涂橙一格',
    s0lgCmp: '正在比较的两根', s0lgMin: '本轮目前最小的', s0lgDone: '已排好', s0lgTally: '已做的比较',
    next0: '下一次比较', play0: '自动播放到底',
    inputLabel: '输入：', in0Shuffled: '打乱的 8 个数（每按一次换一组）', in0Sorted: '已经排好的 8 个数',
    s0start: '还没开始。', s0cmp: '比较 {a} 和 {b}。', s0place: '本轮结束，把最小值放到第 {i} 位。',
    s0readout: '{status}已比较 {k} 次 / 共 {total} 次（n(n − 1)/2，n = {n}）。',
    s0hint: '观察顺序：按「下一次比较」，看两根橙框柱子（这次比较的一对）和绿色柱子（本轮目前最小的）；每比一次，下方计数格多涂一格；每轮结束，最小值移到青色的已排好部分末尾。按「自动播放到底」走完全程：28 格全部涂满。再换成「已经排好的 8 个数」重播：明明一个都不用动，计数还是 28，因为选择排序不管输入怎样，都要把每一轮比完才知道谁最小。',

    s1k: '第 1 步 · 输入长什么样',
    s1t: '比较次数只取决于 n，还是也取决于输入？',
    s1e: '这一步要回答：同样 n 个数，排列不同时，比较次数会不会变？换成<strong>插入排序</strong>：像整理手里的扑克牌，从左到右逐个拿起一张，向左和已排好的牌逐个比较，遇到不比它大的就停下插入。已排好的输入，每张只比 1 次就停，共 n − 1 次；完全倒序的输入，每张都要一路比到最左，共 n(n − 1)/2 次，和第 0 步的选择排序一样多；随机打乱的输入平均要走到一半，约 n(n − 1)/4 次，另加每张牌停下时的那一次比较（共不到 n 次，n 大时可以忽略）。所以说一个算法要比几次时，必须说明是哪种输入：<strong>最好情况</strong>、<strong>最坏情况</strong>还是<strong>平均情况</strong>。',
    in_sorted: '已排好', in_random: '随机打乱', in_reversed: '完全倒序',
    c1b: '插入排序的比较次数随 n（每个 n 实际排一次）',
    s1lgQ: '参考线 n(n − 1)/4',
    nSlider: '元素个数 n',
    s1readout: 'n = {n}：已排好 {s} 次（n − 1 = {nm1}）；随机打乱 {r} 次（约为 n(n − 1)/4 = {q} 的 {ratio} 倍）；完全倒序 {v} 次（n(n − 1)/2 = {half}）。同一组随机数用选择排序：{sel} 次。',
    s1hint: '观察顺序：先看上排三组输入的柱子，再拖 n 从 2 到 64，看下图三条线：绿色（已排好）贴着底部几乎是直线，粉色（倒序）向上弯成抛物线，紫色（随机）夹在中间，绕着灰色虚线 n(n − 1)/4 上下起伏。随机这条线有起伏，因为每个 n 只用一组打乱的数；它约为最坏情况的一半。',

    s2k: '第 2 步 · 分成两半再合并',
    s2t: '归并排序为什么只要大约 n·log₂n 次比较？',
    s2e: '这一步要回答：能不能比 n² 量级少比很多次？<strong>归并排序</strong>的思路是先把数据切成单个元素（单个元素自然是排好的），再两两<strong>合并</strong>：把两段已排好的序列合成一段，每次只比较两段的开头，把小的那个拿走。合并长度共 m 的两段，最多比 m − 1 次。这里用 n = 16 个数自下而上合并：第 1 层把 1 个与 1 个合成长 2 的段，第 2 层合成长 4，第 3 层长 8，第 4 层合成全部 16 个。段长每层翻倍，所以层数是 <strong>log₂n</strong>（2 的几次方等于 n；这里 log₂16 = 4）；每层所有段加起来最多比 n 次。总数不超过 n·log₂n = 64（<a class="xlink" href="../../../computing/algorithms/recursion-divide/#step4">→ 递归与分治页第 4 步：分而治之怎样算总工作量</a>）。',
    c2row0: '第 0 层：16 个单独的元素', c2row: '第 {d} 层：段长 {w}，本层比较 {c} 次',
    s2lgRun: '同一颜色 = 已排好的一段', s2lgHidden: '还没合并的层',
    next2: '合并下一层', reset2: '换一组数，从头合并',
    s2readout: '已合并 {k}/{L} 层：各层比较 {list} = {tot} 次；上限 n·log₂n = {n} × 4 = {nl}。',
    s2hint: '观察顺序：按「换一组数，从头合并」，再一层层按「合并下一层」：每按一次，颜色段数减半、段长翻倍，竖线分隔的段内都已排好。看每层标题里的比较次数：第 1 层总是 8 次（8 对各比 1 次），往后每层不超过 16 次，因为每次比较都会把一个元素放进结果。4 层合完，总数一定不超过 64。换几组数，各层次数会变，但总上限不变。',

    s3k: '第 3 步 · 增长的形状',
    s3t: 'n 翻倍时，比较次数变成几倍？',
    s3e: '这一步要回答：怎样用一句话概括一个算法的比较次数随 n 怎样增长？下图把四种排序在 n = 8, 16, …, 2048 的随机数上实际运行，每个 n 用 3 组打乱的数取平均。（<strong>快速排序</strong>：随机选一个数作<strong>主元</strong>，把比它小的放左边、大的放右边，再对两边分别重复；第 4 步细看。）<strong>大 O</strong> 只记录增长的形状，忽略常数倍和较小的项：比较次数是 n(n − 1)/2 就记作 O(n²)，n 翻倍时约 ×4；约为常数 × n·log₂n 就记作 O(n log n)，n 翻倍时约 ×2 再多一点。默认坐标两轴都按倍数取刻度（对数刻度），每一格是 ×2 或 ×10，这时 n² 是斜率 2 的直线，n·log n 是斜率略大于 1 的线。',
    c3log: '比较次数 vs n（两轴都是对数刻度）', c3lin: '比较次数 vs n（普通刻度）',
    alg_selection: '选择排序', alg_insertion: '插入排序', alg_quick: '快速排序（随机主元）', alg_merge: '归并排序',
    s3lgN2: '参考 n(n − 1)/2', s3lgNlog: '参考 n·log₂n',
    n3Slider: '最大 n（每格翻一倍）',
    axesLabel: '坐标：', axesLog: '对数刻度', axesLin: '普通刻度',
    s3readout: 'n = {n}：选择 {sel} · 插入 {ins} · 归并 {mer} · 快排 {qu}。从 n = {np} 翻倍到 {n}，次数变为：选择 ×{rs}、插入 ×{ri}、归并 ×{rm}、快排 ×{rq}。归并 ÷ (n·log₂n) = {cm}，快排 ÷ (n·log₂n) = {cq}，选择 ÷ n² = {cs}。',
    s3hint: '观察顺序：把最大 n 从 16 拖到 2048，盯着读数里「翻倍后变成几倍」：选择排序稳定在 ×4 左右，插入排序在 ×3 到 ×5 之间起伏、n 越大越靠近 ×4；归并和快排在 ×2.1 到 ×2.9 之间，并随 n 增大慢慢降向 2。再看「÷」那几项：选择 ÷ n² 趋近 0.5，归并 ÷ (n·log₂n) 停在 0.65 到 0.89 之间，这就是「常数倍」的意思。最后切到「普通刻度」：在 n = 2048 时，两条 n² 曲线冲到一百万到两百万，两条 n log n 的线贴在底部几乎看不见。',

    s4k: '第 4 步 · 快速排序的坏日子',
    s4t: '快速排序什么时候会退化成 n² 那么慢？',
    s4e: '这一步要回答：快速排序平均很快，那它的最坏情况从哪里来？快速排序先选一个<strong>主元</strong>，和其余每个元素各比一次（一段 m 个元素要比 m − 1 次），把小的放左边、大的放右边，主元就落到了最终位置；再对左右两段<strong>递归</strong>（对两段各自重复同样的过程）。下图一行是一层递归：青色是这一层正在划分的段，橙色是主元落下的位置。主元把段分得越均匀，层数越少，约 log₂n 层；如果每次主元都是段里最小（或最大）的，一边是空的、另一边只少一个，就要 n − 1 层，比较次数变成 (n − 1) + (n − 2) + … + 1 = n(n − 1)/2。这里 n = 32。',
    c4: '递归的每一层（从上往下）：段与主元',
    c4x: '数组位置 0 → 31',
    s4lgSeg: '这一层要划分的段', s4lgPiv: '主元落下的位置',
    pivotLabel: '主元：', pv_first: '段的第一个', pv_random: '随机选一个', pv_median3: '首、中、尾三数取中',
    seed4: '换一组随机（打乱的数 / 随机主元）',
    s4readout: '输入「{inp}」，主元取「{piv}」：比较 {c} 次，递归 {d} 层。对照：n(n − 1)/2 = {half}，n·log₂n = {nl}（n = {n}）。',
    s4hint: '观察顺序：先选「已排好」+「段的第一个」：图上是一条斜阶梯，每层只剥掉一个元素，31 层、496 次，正好是 n(n − 1)/2。换「完全倒序」也一样。保持输入不变，把主元换成「随机选一个」或「三数取中」：阶梯变成一棵矮树，只有 5 到 10 层，比较次数降到一两百次。再换「随机打乱」+「段的第一个」，并多按几次「换一组随机」：打乱的输入本身就让首元素像随机主元，次数都在一百多。坏情况来自「主元规则」和「输入」恰好对上，而不是快排本身慢。',

    s5k: '第 5 步 · 不能再快了吗',
    s5t: '只靠比较大小，排序至少要比几次？',
    s5e: '这一步要回答：n·log₂n 是归并排序的运气，还是所有比较排序都绕不开的下限？换个角度看排序：n 个元素有 n! 种可能的先后顺序（n! = n × (n − 1) × … × 1，例如 4! = 24），排序就是找出真实的是哪一种。每次比较只有「是」「否」两种答案，所以每个答案最多能把剩余可能排除一半；最坏情况下，剩余数最多减半，要从 n! 减到 1，至少要比 <strong>⌈log₂(n!)⌉</strong> 次（⌈ ⌉ 表示向上取整）。这与二分查找每次砍掉一半是同一个道理（<a class="xlink" href="../../../computing/algorithms/binary-search/#step0">→ 二分查找页第 0 步：每问一次排除一半</a>）。这里藏起 n 个元素 A、B、C… 的真实顺序，让归并排序去问，每问一次就数一下还剩几种顺序与已得的答案一致。log₂(n!) 增长起来和 n·log₂n 同形状，所以 O(n log n) 已经是比较排序的极限。',
    c5a: '仍然可能的顺序个数（对数刻度，共 {n}! = {N}）', c5b: 'log₂(n!) 与 n·log₂n、归并实测，随 n',
    s5lgLeft: '剩余可能（每次比较后）', s5lgHalf: '每次恰好减半 / 参考 n·log₂n', s5lgLB: '下界 ⌈log₂ n!⌉', s5lgFact: 'log₂(n!)', s5lgMerge: '归并排序实测次数',
    n5Label: '元素个数：',
    next5: '问下一个问题', play5: '从头播放', seed5: '换一种隐藏顺序',
    s5q0: '还没提问。', s5q: '刚问：{p} 排在 {q} 前面吗？答：{ans}。', yes: '是', no: '否',
    s5readout: '{q}已问 {k} 次，{N} 种顺序里还剩 {left} 种可能。n = {n} 时下界 ⌈log₂ {n}!⌉ = ⌈{lg}⌉ = {lb}。',
    s5done: '归并排序共问了 {K} 次，确定了顺序 {ord}；下界是 {lb} 次。',
    s5hint: '观察顺序：图上先显示整次运行。选 n = 4，按「问下一个问题」从第 1 问开始逐问查看（问完后再按会从头开始）：橙线从 24 往下走，最理想时沿灰色虚线每次减半；有的问题减得少于一半（不走运的答案），所以橙线常在虚线上方。粉色竖线是下界 ⌈log₂ 24⌉ = 5：再巧的问法，遇到最不走运的答案也要问到这里。换 n = 5、6 和不同的隐藏顺序：归并排序常常恰好用到下界那么多次，有时多一两次（n = 5 时最多 8 次，下界 7）；答案碰巧顺利时还会少于下界，因为下界说的是最不走运的情况。另一张图把 n 推到 64：粉色 log₂(n!) 与灰色 n·log₂n 同形状，归并实测（青色点）夹在两者附近。',

    s6k: '第 6 步 · 收束',
    s6t: '数比较次数，看增长形状',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，用比较次数当尺子，选择排序永远比 n(n − 1)/2 次；<strong>第 1 步</strong>，插入排序的次数随输入从 n − 1 变到 n(n − 1)/2，所以要说清最好、最坏还是平均；<strong>第 2 步</strong>，归并排序 log₂n 层、每层至多 n 次，共不超过 n·log₂n；<strong>第 3 步</strong>，大 O 只看形状：n 翻倍，O(n²) 约 ×4，O(n log n) 约 ×2 多一点；<strong>第 4 步</strong>，快排平均是 n log n，但主元规则与输入对上时退化成 n²；<strong>第 5 步</strong>，n! 种顺序、每次比较最多减半，所以任何比较排序最坏都要约 log₂(n!) ≈ n·log₂n 次。',
    formula: '选择：n(n − 1)/2　插入：n − 1 … n(n − 1)/2\n归并：≤ n·log₂n　快排：平均 O(n log n)，最坏 n(n − 1)/2\n比较排序下界：⌈log₂(n!)⌉ ≈ n·log₂n − 1.44n',
    boundary: '适用范围：本页只数元素之间的比较，不数交换、移动和内存访问，真实运行时间还受这些和缓存影响。随机数据是固定种子生成的模拟输入，每个 n 只取 1 到 3 组，平均值会有起伏。下界只约束「只靠比较大小」的排序；如果知道键的范围，比如都是 0 到 k 的整数，计数排序只数每个值出现几次，一次比较都不做，工作量约 n + k，可以低于 n log n。',
    linksTitle: '接着去哪儿',
    lk1: '→ 递归与分治页第 4 步：分而治之的总工作量怎么算',
    lk2: '→ 二分查找页第 0 步：每次比较砍掉一半，同一个 log₂',
    lk3: '→ 指数与对数页第 2 步：log₂n 到底是什么',
    lk4: '→ 哈希页第 2 步：不比较大小，也能很快找到元素',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《排序与大 O · 增长的形状》的平行版本。'
  },
  en: {
    pageTitle: 'Sorting & Big O · Counting the Comparisons',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Sorting & Big O · The Shape of Growth →',
    navLabel: 'Sorting steps',
    tagline: 'Sorting a pile of numbers takes wildly different amounts of work depending on the method. This page uses no stopwatch; it counts one thing: how many times two elements were compared. Over seven steps you will count the comparisons of selection, insertion, merge and quick sort by hand, watch how they grow with the number of items n, and finally see why no sort that only compares can get by with fewer than about n·log₂n.',
    nav0: '0 What to count', nav1: '1 The input', nav2: '2 Merging', nav3: '3 Growth', nav4: '4 Pivots', nav5: '5 Lower bound', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Choosing the ruler',
    s0t: 'To sort 8 numbers, how many comparisons does selection sort make?',
    s0e: 'The question here: how do you measure whether a sorting method is fast without it depending on how fast the computer is? Seconds change with the machine and the language, but the <strong>number of comparisons</strong> (how often the algorithm asks “is a smaller than b?”) depends only on the method and the input, so that is what this page counts. Start with <strong>selection sort</strong>: scan the unsorted part, comparing as you go, to find its smallest element; move it to the end of the sorted part; repeat until everything is sorted. Round one finds the smallest of 8, which takes 7 comparisons; round two takes 6 among the remaining 7, and so on: 7 + 6 + … + 1 = 28 in all, which is n(n − 1)/2 with n the number of elements.',
    c0a: '8 bars (height = value)', c0b: 'Tally: 28 cells, one per comparison; used = orange',
    s0lgCmp: 'the pair being compared', s0lgMin: 'smallest so far this round', s0lgDone: 'sorted', s0lgTally: 'comparisons made',
    next0: 'Next comparison', play0: 'Play to the end',
    inputLabel: 'Input:', in0Shuffled: '8 shuffled numbers (new set each press)', in0Sorted: '8 numbers already in order',
    s0start: 'Not started yet. ', s0cmp: 'Comparing {a} and {b}. ', s0place: 'Round over: the smallest goes to position {i}. ',
    s0readout: '{status}{k} of {total} comparisons made (n(n − 1)/2 with n = {n}).',
    s0hint: 'What to try: press “Next comparison” and watch the two orange-framed bars (the pair being compared) and the green bar (the smallest so far this round). Every comparison fills one more tally cell, and at the end of each round the smallest moves to the end of the cyan sorted part. Press “Play to the end” to run it through: all 28 cells fill. Now switch to “8 numbers already in order” and replay. Nothing needs to move, yet the tally still reaches 28: selection sort cannot know which element is smallest until it has finished every round of comparisons, whatever the input.',

    s1k: 'Step 1 · What the input looks like',
    s1t: 'Does the comparison count depend only on n, or on the input too?',
    s1e: 'The question here: for the same n numbers in different orders, does the comparison count change? Switch to <strong>insertion sort</strong>, the way you tidy a hand of cards: take the elements left to right, compare each one leftwards with the already-sorted ones, and stop to insert it as soon as you meet one that is not larger. On sorted input each element stops after 1 comparison, n − 1 in all. On fully reversed input each element has to travel all the way to the left, n(n − 1)/2 in all, as many as selection sort in step 0. On shuffled input an element travels about halfway on average, roughly n(n − 1)/4, plus the one comparison where each element stops (fewer than n in all, negligible for large n). So any claim about how many comparisons an algorithm makes has to say which input: the <strong>best case</strong>, the <strong>worst case</strong> or the <strong>average case</strong>.',
    in_sorted: 'already sorted', in_random: 'shuffled', in_reversed: 'fully reversed',
    c1b: 'Insertion sort comparisons by n (each n actually sorted once)',
    s1lgQ: 'reference n(n − 1)/4',
    nSlider: 'number of elements n',
    s1readout: 'n = {n}: already sorted {s} (n − 1 = {nm1}); shuffled {r} ({ratio} × n(n − 1)/4 = {q}); fully reversed {v} (n(n − 1)/2 = {half}). Selection sort on the same shuffled numbers: {sel}.',
    s1hint: 'What to try: look at the three inputs drawn as bars at the top, then drag n from 2 to 64 and watch the three lines below. Green (already sorted) hugs the bottom as a near-straight line, pink (reversed) bends upward as a parabola, and violet (shuffled) sits in between, wobbling around the grey dashed n(n − 1)/4. The violet line wobbles because each n uses a single shuffled set; it runs at about half the worst case.',

    s2k: 'Step 2 · Split in half, then merge',
    s2t: 'Why does merge sort need only about n·log₂n comparisons?',
    s2e: 'The question here: can we compare far fewer times than the n² family? <strong>Merge sort</strong> first cuts the data into single elements (a single element is trivially sorted), then <strong>merges</strong> them pairwise: to combine two sorted runs into one, compare only the two front elements and take the smaller. Merging two runs of total length m takes at most m − 1 comparisons. Here n = 16 numbers are merged bottom-up: level 1 merges 1 with 1 into runs of 2, level 2 makes runs of 4, level 3 runs of 8, and level 4 merges all 16. The run length doubles every level, so there are <strong>log₂n</strong> levels (the power of 2 that gives n; here log₂16 = 4), and each level makes at most n comparisons across all its runs. The total is at most n·log₂n = 64 (<a class="xlink" href="../../../computing/algorithms/recursion-divide/#step4">→ Recursion & divide-and-conquer, step 4: how to total the work of divide and conquer</a>).',
    c2row0: 'Level 0: 16 single elements', c2row: 'Level {d}: runs of {w}, {c} comparisons',
    s2lgRun: 'one colour = one sorted run', s2lgHidden: 'levels not merged yet',
    next2: 'Merge the next level', reset2: 'New numbers, merge from scratch',
    s2readout: '{k}/{L} levels merged: comparisons per level {list} = {tot}; ceiling n·log₂n = {n} × 4 = {nl}.',
    s2hint: 'What to try: press “New numbers, merge from scratch”, then “Merge the next level” one level at a time. Each press halves the number of colour runs and doubles their length; every run between the vertical dividers is sorted. Read the count in each level’s title: level 1 is always 8 (8 pairs, one comparison each), and no later level exceeds 16, because every comparison sends one element to the output. After 4 levels the total never exceeds 64. Try a few sets: the per-level counts change, the ceiling does not.',

    s3k: 'Step 3 · The shape of growth',
    s3t: 'When n doubles, how many times more comparisons?',
    s3e: 'The question here: how do you sum up, in one phrase, how an algorithm’s comparison count grows with n? The chart runs all four sorts on shuffled numbers for n = 8, 16, …, 2048, averaging 3 shuffles per n. (<strong>Quick sort</strong>: pick one element at random as the <strong>pivot</strong>, put smaller elements to its left and larger to its right, then repeat on each side; step 4 looks closer.) <strong>Big O</strong> keeps only the shape of the growth, dropping constant factors and smaller terms: a count of n(n − 1)/2 is O(n²), about ×4 when n doubles; a count of roughly a constant times n·log₂n is O(n log n), a bit over ×2 when n doubles. By default both axes are scaled by ratios (log scales), so each grid step is ×2 or ×10; then n² is a straight line of slope 2 and n log n a line of slope just over 1.',
    c3log: 'Comparisons vs n (both axes on log scales)', c3lin: 'Comparisons vs n (ordinary scales)',
    alg_selection: 'selection sort', alg_insertion: 'insertion sort', alg_quick: 'quick sort (random pivot)', alg_merge: 'merge sort',
    s3lgN2: 'reference n(n − 1)/2', s3lgNlog: 'reference n·log₂n',
    n3Slider: 'largest n (each notch doubles it)',
    axesLabel: 'Axes:', axesLog: 'log scales', axesLin: 'ordinary scales',
    s3readout: 'n = {n}: selection {sel} · insertion {ins} · merge {mer} · quick {qu}. Doubling n from {np} to {n} multiplied the counts by: selection ×{rs}, insertion ×{ri}, merge ×{rm}, quick ×{rq}. Merge ÷ (n·log₂n) = {cm}, quick ÷ (n·log₂n) = {cq}, selection ÷ n² = {cs}.',
    s3hint: 'What to try: drag the largest n from 16 to 2048 and keep your eye on the “multiplied by” part of the readout. Selection sort settles near ×4, and insertion sort wobbles between ×3 and ×5, closing in on ×4 as n grows; merge and quick sit between ×2.1 and ×2.9 and drift down toward 2 as n grows. Then read the “÷” terms: selection ÷ n² approaches 0.5, and merge ÷ (n·log₂n) stays between 0.65 and 0.89. That is what “a constant factor” means. Finally switch to ordinary scales: at n = 2048 the two n² curves shoot up to between one and two million, while the two n log n lines lie flat along the bottom, almost invisible.',

    s4k: 'Step 4 · Quick sort’s bad day',
    s4t: 'When does quick sort slow down to n²?',
    s4e: 'The question here: quick sort is fast on average, so where does its worst case come from? Quick sort picks a <strong>pivot</strong>, compares it once with every other element of the segment (a segment of m elements costs m − 1 comparisons), puts the smaller ones on its left and the larger on its right, and the pivot lands in its final place; it then <strong>recurses</strong> (repeats the same process on each side separately). Each row of the chart is one level of recursion: cyan marks the segments being split at that level, orange where each pivot lands. The more evenly the pivot splits, the fewer the levels, about log₂n. If the pivot is always the smallest (or largest) in its segment, one side is empty and the other only one shorter, so it takes n − 1 levels and (n − 1) + (n − 2) + … + 1 = n(n − 1)/2 comparisons. Here n = 32.',
    c4: 'Each level of recursion (top to bottom): segments and pivots',
    c4x: 'array position 0 → 31',
    s4lgSeg: 'segment being split at this level', s4lgPiv: 'where the pivot lands',
    pivotLabel: 'Pivot:', pv_first: 'first in segment', pv_random: 'random', pv_median3: 'median of first, middle, last',
    seed4: 'New randomness (shuffle / random pivots)',
    s4readout: 'Input “{inp}”, pivot “{piv}”: {c} comparisons, {d} levels of recursion. For comparison: n(n − 1)/2 = {half}, n·log₂n = {nl} (n = {n}).',
    s4hint: 'What to try: start with “already sorted” and “first in segment”. The chart is a diagonal staircase that peels off one element per level: 31 levels and 496 comparisons, exactly n(n − 1)/2. “Fully reversed” does the same. Keep that input and switch the pivot to “random” or “median of first, middle, last”: the staircase collapses into a short tree of 5 to 10 levels, and the count drops to one or two hundred. Then try “shuffled” with “first in segment” and press “New randomness” a few times: a shuffled input makes the first element behave like a random pivot, and the counts stay in the low hundreds. The bad case comes from the pivot rule and the input lining up, not from quick sort being slow.',

    s5k: 'Step 5 · Can it go faster?',
    s5t: 'Using only comparisons, how few can a sort get away with?',
    s5e: 'The question here: is n·log₂n merge sort’s good luck, or a floor that every comparison sort hits? Look at sorting another way: n elements can be in n! possible orders (n! = n × (n − 1) × … × 1, for example 4! = 24), and sorting means finding out which one is true. Each comparison has only two answers, yes or no, so at most one of them can rule out half or more of the remaining orders; with the unlucky answer the count shrinks by at most half. Getting from n! down to 1 therefore takes at least <strong>⌈log₂(n!)⌉</strong> comparisons in the worst case (⌈ ⌉ means round up). It is the same reason binary search halves its candidates (<a class="xlink" href="../../../computing/algorithms/binary-search/#step0">→ Binary search, step 0: each question rules out half</a>). Here the true order of n elements A, B, C, … is hidden; merge sort asks the questions, and after each one we count how many orders still agree with every answer so far. log₂(n!) grows with the same shape as n·log₂n, so O(n log n) is already the limit for comparison sorts.',
    c5a: 'Orders still possible (log scale, {n}! = {N} in all)', c5b: 'log₂(n!) vs n·log₂n and measured merge sort, by n',
    s5lgLeft: 'orders still possible (after each comparison)', s5lgHalf: 'exact halving / reference n·log₂n', s5lgLB: 'lower bound ⌈log₂ n!⌉', s5lgFact: 'log₂(n!)', s5lgMerge: 'merge sort, measured',
    n5Label: 'Elements:',
    next5: 'Ask the next question', play5: 'Play from the start', seed5: 'New hidden order',
    s5q0: 'No questions yet. ', s5q: 'Just asked: does {p} come before {q}? Answer: {ans}. ', yes: 'yes', no: 'no',
    s5readout: '{q}{k} questions asked; {left} of the {N} orders are still possible. For n = {n} the lower bound is ⌈log₂ {n}!⌉ = ⌈{lg}⌉ = {lb}.',
    s5done: ' Merge sort asked {K} questions and pinned down the order {ord}; the lower bound is {lb}.',
    s5hint: 'What to try: the chart first shows the whole run. Pick n = 4 and press “Ask the next question” to go through it one question at a time (pressing it after the last question starts over). The orange line steps down from 24; at best it would follow the grey dashed line, halving every time, but some questions remove less than half (the unlucky answer), so the orange line often sits above it. The pink vertical line is the lower bound ⌈log₂ 24⌉ = 5: however clever the questions, the unluckiest answers force you to ask at least that many. Try n = 5 and 6 and other hidden orders: merge sort often uses exactly the bound and sometimes one or two more (for n = 5 at most 8, against a bound of 7); with lucky answers it can even finish below the bound, because the bound is about the unluckiest case. The other chart pushes n to 64: pink log₂(n!) has the same shape as grey n·log₂n, and merge sort’s measured counts (cyan dots) sit close to both.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Count comparisons, read the shape of growth',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: with comparisons as the ruler, selection sort always makes n(n − 1)/2. <strong>Step 1</strong>: insertion sort ranges from n − 1 to n(n − 1)/2 depending on the input, so you must say best, worst or average case. <strong>Step 2</strong>: merge sort has log₂n levels of at most n comparisons each, n·log₂n at most. <strong>Step 3</strong>: Big O keeps only the shape; when n doubles, O(n²) goes about ×4 and O(n log n) a little over ×2. <strong>Step 4</strong>: quick sort averages n log n but falls to n² when the pivot rule and the input line up. <strong>Step 5</strong>: n! orders and at most a halving per comparison mean every comparison sort needs about log₂(n!) ≈ n·log₂n in the worst case.',
    formula: 'selection: n(n − 1)/2　insertion: n − 1 … n(n − 1)/2\nmerge: ≤ n·log₂n　quick: average O(n log n), worst n(n − 1)/2\ncomparison-sort lower bound: ⌈log₂(n!)⌉ ≈ n·log₂n − 1.44n',
    boundary: 'Scope: this page counts only comparisons between elements, not swaps, moves or memory accesses, and real running time also depends on those and on caches. The shuffled data are simulated from fixed seeds, with only 1 to 3 shuffles per n, so averages wobble. The lower bound only binds sorts that work purely by comparing; if you know the keys’ range, say integers from 0 to k, counting sort just tallies how often each value occurs, makes no comparisons at all, and does about n + k work, which can beat n log n.',
    linksTitle: 'Where to go next',
    lk1: '→ Recursion & divide-and-conquer, step 4: totalling the work of divide and conquer',
    lk2: '→ Binary search, step 0: halving with every comparison, the same log₂',
    lk3: '→ Exponents & logarithms, step 2: what log₂n really is',
    lk4: '→ Hashing, step 2: finding elements fast without comparing sizes',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Sorting & Big O · The Shape of Growth”.'
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
  if (typeof window.refreshSorting === 'function') window.refreshSorting();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SORT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
