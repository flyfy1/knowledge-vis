'use strict';
/* ============================================================
   排序与大 O 讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '排序与大 O · 增长的形状 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '排序与大 O · 增长的形状',
    tagline: '排序算法之间的差别，不在能不能排，而在「比较了多少次」如何随数据量增长。大 O 记的不是秒表，而是增长的形状：n 翻倍时工作量翻几倍。这一页的每个计数都由真实排序代码当场数出来——公式牌上的每个数，都能拿种子自己复算。',
    nav0: '0 双赛道', nav1: '1 O(n²) 家族', nav2: '2 分而治之', nav3: '3 计数台',
    nav4: '4 常数对决', nav5: '5 计数排序', nav6: '6 终章 · 真实世界',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 排序与大 O Sorting & Big O —— 一步一交互系列',

    play: '连播', pause: '暂停', reset: '重置', newSeed: '换个种子', stepCmp: '走一次比较', s5step: '走一步操作',
    seedLab: '种子',
    algBubble: '冒泡', algSelection: '选择', algMerge: '归并', algQuick: '快排', algCounting: '计数',
    presetRandom: '随机', presetNearly: '近乎有序', presetSorted: '已排序', presetReversed: '逆序',
    stRunning: '进行中', stDone: '已排完', stReady: '待开始',
    cmpLab: '比较', swpLab: '交换', movLab: '移动', opsLab: '操作',

    /* ---------- 第 0 步 ---------- */
    s0k: '第 0 步 · 钩子',
    s0t: '同一副乱牌，两种命运',
    s0e: '两条赛道，<strong>同一副牌</strong>（同一个种子生成的同一个数组）：左边冒泡排序，右边归并排序。按下开始，两边<strong>按比较次数推进</strong>——每完成 1 次比较，两边都走相同的时间，所以谁先停下，纯粹由「总共要比多少次」决定，不掺一点手速水分。你会看到归并早早收工，冒泡还在慢慢爬。差距不在谁写得勤快，在<strong>增长形状</strong>。',
    s0leftLab: '冒泡排序 Bubble Sort',
    s0rightLab: '归并排序 Merge Sort',
    s0race: '开始比赛',
    s0ro: '冒泡：比较 <span>{bc}</span> 次 · 交换 <span>{bs}</span> 次（{bst}）｜归并：比较 <span>{mc}</span> 次 · 移动 <span>{mm}</span> 次（{mst}）',
    s0final: '终局：同一副 {n} 张牌，冒泡比较 <b>{bc}</b> 次，归并只比较 <b>{mc}</b> 次——差了约 <b>{x}</b> 倍。而且 n 越大，这个倍数只会越拉越大：这就是后面六步要拆开看的东西。',
    s0hint: '诚实交代：这里的「快慢」是比较次数的快慢，不是秒表。真实耗时还取决于语言、机器与实现细节——但比较次数是算法自己的账，谁也赖不掉。动画节奏的单位是「次比较」，图注与正文都会一直守着这个口径。',

    /* ---------- 第 1 步 ---------- */
    s1k: '第 1 步 · O(n²) 家族',
    s1t: '冒泡与选择：笨办法的账要算清',
    s1e: '<strong>冒泡</strong>：相邻两个比一比，逆序就交换，大个子一路「冒泡」到队尾；本页的冒泡带<strong>早停</strong>——某一趟全程没交换，说明已经有序，立刻收工。<strong>选择</strong>：每轮从没排的部分里扫出最小的，放到位。单步走一遍盯住计数器：选择的比较数<strong>只认 n、不认数据</strong>；冒泡的交换数则严丝合缝等于原数组的<strong>逆序数</strong>（一对顺序反了的元素）。换个种子、换种数据，自己验。',
    s1formula: '选择比较数 ≡ n(n−1)/2 · 冒泡交换数 = 逆序数 · 冒泡（带早停）已排序输入比较数 = n−1',
    s1roB: '冒泡：比较 <span>{c}</span> 次 · 交换 <span>{s}</span> 次（原数组逆序数 = <span>{inv}</span>）· {st}',
    s1roS: '选择：比较 <span>{c}</span> / {f} 次 · 交换 <span>{s}</span> 次 · {st}',
    s1noteBubSorted: '已排序输入 + 早停：冒泡只扫了一趟就收工，比较数恰好 n − 1 = {v}。复杂度表里冒泡「最好 O(n)」写的就是这一幕——前提是带早停，不带早停的实现没这个待遇。',
    s1noteBubDone: '对账：冒泡总交换 {s} 次 = 逆序数 {inv}，分毫不差。每交换一次相邻元素，恰好消掉一个逆序对，一个不多、一个不少。',
    s1noteSel: '对账：选择的比较数 {c} 与公式 n(n−1)/2 = {f} 一致。不管数据是正是反，它每轮都要把没排的部分从头扫到尾——账只由 n 定。',
    s1hint: '试试「逆序」数据：冒泡的交换数会冲到 n(n−1)/2（每个元素对都是逆序），选择却连眼皮都不抬——比较数纹丝不动，变的只是交换数。两个算法同属 O(n²)，性情却完全两样：一个对数据敏感，一个对数据无感。',
    tblAlgo: '算法', tblBest: '最好', tblAvg: '平均', tblWorst: '最坏', tblNote: '计数口径（与本页实现同源）',
    tblBubNote: '带早停；交换数 = 逆序数',
    tblSelNote: '比较数恒 = n(n−1)/2，与数据无关',

    /* ---------- 第 2 步 ---------- */
    s2k: '第 2 步 · 分而治之',
    s2t: '归并与快排：把大问题切小',
    s2e: '<strong>归并</strong>：数组从中间切开（左半 ⌊n/2⌋），递归排好两半，再像拉拉链一样合并——合并时只比两段的「排头」，小的先出。每一层合并的总工作量约 n，层数约 log₂n，相乘就是 n log₂ n。<strong>快排</strong>在本页的规则写明白：<strong>pivot 取最后一个元素</strong>，用 Lomuto 分区把小的扫到左边、大的留在右边，再递归两边。规则不同，账就不同——所以规则必须印在页上。',
    s2panelNote: '两个面板各自独立、计数互不延续——归并这边数的是它自己的比较与移动，切到快排看到的是快排自己的比较与交换，两边的进度互不影响。',
    s2formulaM: '归并：每层 ≈ n 次比较 × log₂n 层 ≈ n·log₂n',
    s2splitLv: '第 {k} 层',
    s2splitCap: '切分长这样：一路从中间切开（左半 ⌊n/2⌋），直到每段只剩 1 个。切分本身<strong>不产生比较、不计数</strong>，所以它不单独成帧——下面的动画从第一次合并开始，正是把这棵切分树自底向上逐段合并回来。',
    s2formulaQ: '快排（本页规则）：pivot = 最后一个元素，Lomuto 分区；随机模式从区间内等概率抽一个当 pivot',
    s2roM: '归并：比较 <span>{c}</span> 次 · 移动 <span>{m}</span> 次 · {st}',
    s2roQ: '快排：比较 <span>{c}</span> 次 · 交换 <span>{s}</span> 次 · pivot 已就位 <span>{p}</span> 个 · {st}',
    s2noteWorst: '退化属实：已排序输入 + 取末元 pivot，每次分区只排定一个元素，比较数走向 n(n−1)/2 = {f}（本局 {c}）。这不是实现写坏了——是这条规则在这种数据上的真实命运，递推式 T(n) = T(n−1) + (n−1) 说的就是它。',
    s2noteRand: '同一副已排序牌、换随机 pivot：比较数降到 {c}。注意口径——随机化给的是<strong>期望</strong>意义上的 n log n：运气再差也可能抽到坏 pivot，它保证的是「再没有哪种输入能稳定地坑你」，不是「每次都快」。',
    s2hint: '归并的「移动」指合并时把元素写入主数组的次数：每层每个元素都要搬一次，所以移动数约 n·log₂n——它拿额外的内存换稳定的形状。快排则原地分区、几乎不占额外空间，代价是形状要看 pivot 的脸色。两种 n log n，账本的构成完全不同。',
    tblMerNote: '切分固定取左半 ⌊n/2⌋；移动 = 写入主数组次数',
    tblQuiNote: 'pivot 取末元（本页规则）；最坏 = 已排序输入',
    s2pivotLab: 'pivot 规则', s2lastP: '取末元', s2randP: '随机抽',

    /* ---------- 第 3 步 ---------- */
    s3k: '第 3 步 · 计数台',
    s3t: '让数字自己画出形状',
    s3e: '同一颗种子、同一类数据（随机排列），把 n 从 50 一路翻倍到 800，四个算法各跑一遍，<strong>比较数全部由计数器真数</strong>。先看表：每翻一倍 n，n² 家族的计数约翻 4 倍，n log n 家族只翻 2.2 倍上下。再看图：横纵都取 log₂，斜率 2 与斜率 1 的参照线旁，散点自己排成的斜率就是增长的形状——不用背，数出来、画出来就是它。快排用随机 pivot，读的是它的<strong>典型情形</strong>；计数台的种子可以换，整张表和斜率会一起重算、自洽不变。',
    s3run: '重新开跑',
    s3ro: '种子 = <span>{seed}</span> · 拟合斜率由本表数值经最小二乘当场算出（方法见图注）· 快排为随机 pivot 的典型情形，其余为随机排列上的实测',
    s3tblCounts: '比较数（真计数）',
    s3tblRatios: '翻倍比（相邻两档计数之比，由表值现算）',
    s3slope: '拟合斜率',
    s3ratioTo: '→',
    s3figNote: '拟合方法：对每条曲线的 5 个点 (log₂ n, log₂ 比较数) 做最小二乘直线拟合，斜率即读数。n² 家族应贴近 2，n log n 家族略高于 1（多出的部分正是 log 因子在对数坐标里留下的小尾巴）。另注意：冒泡与选择两条线在图上几乎重合——两者计数都是约 n²/2，在对数坐标里贴得很紧，n 越大贴得越紧；冒泡线因此描了一层宽宽的粉色边，选择的橙线压在正中，顺着粉边就能把冒泡那条线单独循迹。',
    s3hint: '盯住翻倍比一列看：n 只有 50 时，四个算法的计数差距还不算离谱；到了 800，形状的差距已经变成数量级。这就是「大 O 是长期主义」的意思——它不预测小数据谁赢，它预测的是数据涨上去之后谁先趴下。',
    cvRef2: '参照斜率 2', cvRef1: '参照斜率 1',
    cvAxisY: '比较数（log₂）', cvAxisX: 'n（log₂）',

    /* ---------- 第 4 步 ---------- */
    s4k: '第 4 步 · 常数对决',
    s4t: '大 O 是形状，不是速度',
    s4e: '大 O 把系数扔了，但系数不是不存在。设 A 做的是「重操作」：成本 <strong>100·n·log₂n</strong>；B 做的是「轻操作」：成本 <strong>n²</strong>。A 形状好但单价贵 100 倍，B 形状差但单价便宜。n 小的时候 B 反赢——别急着笑它没出息；n 一路涨上去，两条线必然在某个点换位。交叉点不靠猜：下面两侧各取一个整数 n，把两边成本当场算给你看。',
    s4formula: 'A(n) = 100 · n · log₂n（重操作） vs B(n) = n²（轻操作）',
    s4nLab: 'n（对数滑杆）',
    s4ro: 'n = <span>{n}</span>：A = <span>{a}</span> · B = <span>{b}</span> → <b>{w}</b> 更便宜（差 <span>{d}</span>）',
    s4winA: 'A（形状好）', s4winB: 'B（常数小）',
    s4cross: '交叉点自证：n* = <span>{x}</span> 是第一个 A 更便宜的整数——n = {xm} 时 A = {am} > B = {bm}，B 赢；n = {x} 时 A = {ax} < B = {bx}，A 赢。两侧读数都由成本函数当场算出。',
    s4termT: '主导项：低阶项会被涨没',
    s4termE: '看 f(n) = 2n² + 100n：n 不大时 100n 还占大头，n 涨上去之后，占比的天平完全倒向 2n²。大 O 只留最高阶、扔系数与低阶项，不是因为它们不存在，而是因为<strong>在足够大的 n 面前，它们说了不算</strong>。点几个 n 自己看占比怎么变。',
    s4termRo: 'n = <span>{n}</span>：2n² = <span>{q}</span>（占 <span>{qp}</span>%）· 100n = <span>{l}</span>（占 <span>{lp}</span>%）→ f(n) 的大 O 只记 <b>O(n²)</b>',
    cvCross: '交叉点 n* ≈ {x}',
    s4hint: '诚实区分：这一页从头到尾比的都是<strong>操作次数</strong>，不是真实秒数。真实耗时还受机器、语言、缓存与实现手艺影响——但「n 涨过交叉点之后形状说了算」这件事，在任何机器上都成立。工业实现里「小数据用简单算法」正是活学活用这个交叉点（第 6 步）。',

    /* ---------- 第 5 步 ---------- */
    s5k: '第 5 步 · 线性时间',
    s5t: '计数排序：不靠比较的排法',
    s5e: '数据的值域有界（0 到 k）时，有一招「不讲武德」的排法：<strong>不比较任何一次</strong>——把每个值当成地址，数一遍每个值出现几次（计数桶），再按值从小到大依次把元素倒出来。操作数 = 数一遍（n）+ 扫一遍桶（k+1）+ 倒出来（n），随 n 线性增长。下面全程盯住比较计数器：它从头到尾是 <strong>0</strong>。',
    s5formula: '操作数 = n（计数） + (k+1)（扫桶） + n（输出） = 2n + k + 1 · 比较数 = 0 · 内存 = k + 1 格',
    s5kLab: 'k · 值域上限（值在 0..k）',
    s5blow: '把值域拉到 100000',
    s5blowOff: '回到小值域',
    s5ro: '计数排序：操作 <span>{ops}</span> / {total} · 比较 <span>0</span> 次 · {st}｜同一副数据喂归并：比较 <span>{mc}</span> 次',
    s5roBlow: '值域反噬：n = {n}，k = {k}：计数排序操作 <span>{ops}</span> 次（光扫桶就 {kb} 次）、内存 <span>{mem}</span> 格；同一副数据归并只比较 <span>{mc}</span> 次。它没变慢在 n 上，是被 k 拖死的。',
    s5hint: '口径守则：比较排序有个下界 Ω(n log n)，但它只约束「靠两两比较获取信息」的算法。计数排序压根不比较，所以不是它「打破」了下界，而是它绕开了下界的前提——拿值域当地址用。天下没有白来的线性：值域 k 一旦没边，桶的内存与扫描成本立刻反噬（点上面的按钮试试）。',
    cvIn: '输入（n = {n}）', cvBuckets: '计数桶（值 → 个数）', cvOut: '输出',
    cvBucketsBig: '计数桶 {k} 格——画布只装得下开头一截，剩下的全是空格子',

    /* ---------- 第 6 步 ---------- */
    s6k: '第 6 步 · 终章',
    s6t: '真实世界的排序：混血与直觉',
    c1h: '工业实现都是混血',
    c1: '你每天用的排序几乎都不是纯种：Python 与 Java 的 <strong>Timsort</strong> 以归并为骨架、掺入插入排序，还会先侦测数据里天然有序的片段顺势利用；C++ 标准库的 <strong>introsort</strong> 以快排为主力，递归太深时切换堆排序兜底防退化、浅层换插入排序收尾。没有哪个纯种算法能通吃所有数据，工程的答案是混血。',
    c2h: '小 n 时，简单反而赢',
    c2: '混血算法有个共同细节：片段小到一定程度（几十个元素上下）就切回<strong>插入排序</strong>这种 O(n²) 的简单循环——第 4 步的交叉点说的就是这个理：n 小的时候，常数小、代码直白的算法实际成本更低。O(n²) 在小数据上不是原罪，是性价比。',
    c3h: '选型直觉：先看 n 与数据',
    c3: '面对一堆要排的数据，先问四件事：<strong>n 有多大</strong>（决定形状的权重）、<strong>是否近乎有序</strong>（Timsort 与带早停的算法占便宜）、<strong>值域是否有界</strong>（计数排序的机会）、<strong>要不要稳定</strong>（等值元素的相对次序保不保）。形状优先、常数其次——这把尺，就是这一页的全部内容。',
    s6fin: '回勾一句隔壁的<a class="fourier-link" href="../gradient-descent/#step2">梯度下降</a>：那边算成本，是「每一步多便宜 × 要走多少步」；这边算成本，是「每次比较多便宜 × 要比多少次」。成本永远是两个因子相乘——一个因子管单价，一个管数量，而数量的<strong>增长形状</strong>，最终说了算。学会看形状，你就有了一把丈量一切算法的尺。'
  },
  en: {
    docTitle: 'Sorting & Big O · The Shape of Growth · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Sorting & Big O · The Shape of Growth',
    tagline: 'Sorting algorithms do not differ in whether they can sort, but in how the number of comparisons grows with n. Big O records not the stopwatch but the shape of growth: when n doubles, how many times over does the work multiply? Every counter on this page is incremented by a real sorting implementation as it runs — every number on the formula cards can be re-derived by hand from the seed.',
    nav0: '0 The Race', nav1: '1 The O(n²) Family', nav2: '2 Divide & Conquer', nav3: '3 The Counting Bench',
    nav4: '4 The Constant Duel', nav5: '5 Counting Sort', nav6: '6 Finale · The Real World',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Sorting & Big O — one interaction per step',

    play: 'Play', pause: 'Pause', reset: 'Reset', newSeed: 'New seed', stepCmp: 'One comparison', s5step: 'One operation',
    seedLab: 'Seed',
    algBubble: 'Bubble', algSelection: 'Selection', algMerge: 'Merge', algQuick: 'Quick', algCounting: 'Counting',
    presetRandom: 'Random', presetNearly: 'Nearly sorted', presetSorted: 'Sorted', presetReversed: 'Reversed',
    stRunning: 'running', stDone: 'sorted', stReady: 'ready',
    cmpLab: 'comparisons', swpLab: 'swaps', movLab: 'moves', opsLab: 'ops',

    /* ---------- Step 0 ---------- */
    s0k: 'Step 0 · The Hook',
    s0t: 'The same shuffled deck, two fates',
    s0e: 'Two lanes, <strong>the same deck</strong> (the same array, generated from the same seed): bubble sort on the left, merge sort on the right. Press start and both advance <strong>by comparison count</strong> — each completed comparison buys the same slice of time on both sides, so who finishes first is decided purely by how many comparisons each needs in total. Merge sort clocks out early; bubble sort is still crawling. The gap is not diligence — it is the <strong>shape of growth</strong>.',
    s0leftLab: 'Bubble Sort',
    s0rightLab: 'Merge Sort',
    s0race: 'Start the race',
    s0ro: 'Bubble: <span>{bc}</span> comparisons · <span>{bs}</span> swaps ({bst}) | Merge: <span>{mc}</span> comparisons · <span>{mm}</span> moves ({mst})',
    s0final: 'Final score: on the same {n} cards, bubble needed <b>{bc}</b> comparisons, merge only <b>{mc}</b> — about <b>{x}</b>× fewer. And the larger n gets, the wider that factor grows. The next six steps take this gap apart.',
    s0hint: 'Full disclosure: “faster” here means fewer comparisons, not a faster stopwatch. Real running time also depends on language, hardware and implementation craft — but the comparison count is the algorithm’s own ledger, and it cannot be argued with. The animation’s unit of progress is the comparison, and the captions will keep that accounting honest throughout.',

    /* ---------- Step 1 ---------- */
    s1k: 'Step 1 · The O(n²) Family',
    s1t: 'Bubble and selection: honest bookkeeping for the simple sorts',
    s1e: '<strong>Bubble sort</strong>: compare neighbours, swap if they are out of order, and the large values “bubble” to the end. The version on this page has an <strong>early exit</strong> — a full pass with no swaps means the array is sorted, so it stops at once. <strong>Selection sort</strong>: each round, scan the unsorted part for its minimum and put it in place. Step through and watch the counters: selection’s comparison count <strong>depends only on n, never on the data</strong>; bubble’s swap count equals the array’s <strong>inversion count</strong> exactly (pairs of elements in the wrong relative order). Change the seed, change the data, and check for yourself.',
    s1formula: 'Selection comparisons ≡ n(n−1)/2 · Bubble swaps = inversions · Bubble (early exit) on sorted input: n−1 comparisons',
    s1roB: 'Bubble: <span>{c}</span> comparisons · <span>{s}</span> swaps (inversions of the original array = <span>{inv}</span>) · {st}',
    s1roS: 'Selection: <span>{c}</span> / {f} comparisons · <span>{s}</span> swaps · {st}',
    s1noteBubSorted: 'Sorted input + early exit: bubble finished after a single pass — exactly n − 1 = {v} comparisons. The “best case O(n)” in the table below is precisely this scene, and it exists only because of the early exit; an implementation without one does not get it.',
    s1noteBubDone: 'Reconciled: bubble’s total swaps {s} = inversion count {inv}, to the unit. Every adjacent swap removes exactly one inversion — never more, never less.',
    s1noteSel: 'Reconciled: selection’s comparisons {c} match the formula n(n−1)/2 = {f}. Whatever the data, every round scans the whole unsorted remainder — the bill is set by n alone.',
    s1hint: 'Try the “Reversed” data: bubble’s swaps shoot up to n(n−1)/2 (every pair is an inversion), while selection does not blink — its comparison count does not move at all; only its swaps change. Same O(n²) family, opposite temperaments: one is data-sensitive, the other data-blind.',
    tblAlgo: 'Algorithm', tblBest: 'Best', tblAvg: 'Average', tblWorst: 'Worst', tblNote: 'Counting convention (matches the code on this page)',
    tblBubNote: 'Early exit; swaps = inversions',
    tblSelNote: 'Comparisons always = n(n−1)/2, data-independent',

    /* ---------- Step 2 ---------- */
    s2k: 'Step 2 · Divide & Conquer',
    s2t: 'Merge and quicksort: cut the problem down',
    s2e: '<strong>Merge sort</strong>: split the array in the middle (left half ⌊n/2⌋), sort both halves recursively, then zip them back together — merging only ever compares the two “heads”, smaller one out first. Each level of merging costs about n comparisons in total, there are about log₂n levels, and the product is n log₂ n. <strong>Quicksort</strong> plays by rules printed right here: <strong>the pivot is the last element</strong>, partitioned Lomuto-style — small values swept left, large ones stay right — then recurse on both sides. Different rules, different ledger; that is why the rules are printed on the page.',
    s2panelNote: 'The two panels are independent, and their counts never carry over: the merge panel counts its own comparisons and moves, the quicksort panel its own comparisons and swaps — switching across always shows that side’s own progress.',
    s2formulaM: 'Merge: ≈ n comparisons per level × log₂n levels ≈ n·log₂n',
    s2splitLv: 'Lv {k}',
    s2splitCap: 'This is what the splitting looks like: halve, halve again (left half ⌊n/2⌋), down to segments of one. Splitting itself involves <strong>no comparisons and is never counted</strong>, so it gets no frames of its own — the animation below starts at the first merge and is exactly this split tree being merged back together, bottom-up.',
    s2formulaQ: 'Quicksort (rules on this page): pivot = last element, Lomuto partition; in random mode the pivot is drawn uniformly from the current range',
    s2roM: 'Merge: <span>{c}</span> comparisons · <span>{m}</span> moves · {st}',
    s2roQ: 'Quick: <span>{c}</span> comparisons · <span>{s}</span> swaps · <span>{p}</span> pivots placed · {st}',
    s2noteWorst: 'Degeneration, as promised: sorted input + last-element pivot finalises exactly one element per partition, and the comparison count marches to n(n−1)/2 = {f} (this run: {c}). The implementation is not broken — this is the rule’s true fate on this data, and the recurrence T(n) = T(n−1) + (n−1) says exactly that.',
    s2noteRand: 'Same sorted deck, random pivot instead: comparisons drop to {c}. Mind the wording — randomisation buys n log n <strong>in expectation</strong>: an unlucky draw can still pick a bad pivot. What it guarantees is that no input can reliably ambush you — not that every run is fast.',
    s2hint: 'Merge’s “moves” count writes into the main array during merging: every element is written back once per level, so moves run to about n·log₂n — it trades extra memory for a guaranteed shape. Quicksort partitions in place and needs almost no extra space, but its shape is at the pivot’s mercy. Two flavours of n log n, two completely different ledgers.',
    tblMerNote: 'Split always takes the left ⌊n/2⌋; moves = writes into the main array',
    tblQuiNote: 'Pivot = last element (the rule on this page); worst case = sorted input',
    s2pivotLab: 'Pivot rule', s2lastP: 'Last element', s2randP: 'Random',

    /* ---------- Step 3 ---------- */
    s3k: 'Step 3 · The Counting Bench',
    s3t: 'Let the numbers draw the shape themselves',
    s3e: 'One seed, one data distribution (random permutations), n doubling from 50 to 800, all four algorithms run for real — <strong>every count in the table is counted by the counters, not typed in</strong>. Read the table first: each doubling of n multiplies the n² family’s count by about 4, the n log n family’s by only about 2.2. Then the plot: both axes in log₂, reference lines of slope 1 and slope 2, and the slope the measured points form on their own <em>is</em> the shape of growth — no memorising, just counting and plotting. Quicksort runs with a random pivot, so its row reads its <strong>typical case</strong>; change the bench seed and the whole table plus slopes recompute, staying self-consistent.',
    s3run: 'Run it again',
    s3ro: 'Seed = <span>{seed}</span> · fitted slopes are computed on the spot from this table’s numbers by least squares (method in the figure note) · quicksort = random pivot, typical case; the rest are measured on random permutations',
    s3tblCounts: 'Comparisons (really counted)',
    s3tblRatios: 'Doubling ratios (each ÷ the previous column, computed from the table)',
    s3slope: 'Fitted slope',
    s3ratioTo: '→',
    s3figNote: 'Fitting method: least-squares line through each curve’s 5 points (log₂ n, log₂ comparisons); the slope is the readout. The n² family should hug 2; the n log n family sits a little above 1 — the excess is the log factor’s small tail showing through in log coordinates. Note also that the bubble and selection lines nearly coincide on this plot: both counts run to about n²/2 and hug each other in log coordinates, tighter as n grows. The bubble line is therefore drawn with a wide pink halo and the orange selection line runs down its middle — follow the pink edge to trace bubble on its own.',
    s3hint: 'Watch the doubling ratios: at n = 50 the four counts are still within shouting distance; by n = 800 the shapes have pulled orders of magnitude apart. That is what “Big O is a long game” means — it does not predict who wins on small data; it predicts who collapses first as data grows.',
    cvRef2: 'reference slope 2', cvRef1: 'reference slope 1',
    cvAxisY: 'comparisons (log₂)', cvAxisX: 'n (log₂)',

    /* ---------- Step 4 ---------- */
    s4k: 'Step 4 · The Constant Duel',
    s4t: 'Big O is a shape, not a speed',
    s4e: 'Big O throws the constants away, but constants still exist. Let A do “heavy operations” at cost <strong>100·n·log₂n</strong>, and B do “light operations” at cost <strong>n²</strong>. A has the better shape but a 100× unit price; B has the worse shape and is dirt cheap. For small n, B wins — do not laugh yet; as n grows, the two curves must cross somewhere. The crossing is not guessed: below, one integer n on each side of it has both costs computed in front of you.',
    s4formula: 'A(n) = 100 · n · log₂n (heavy ops) vs B(n) = n² (light ops)',
    s4nLab: 'n (log slider)',
    s4ro: 'n = <span>{n}</span>: A = <span>{a}</span> · B = <span>{b}</span> → <b>{w}</b> is cheaper (by <span>{d}</span>)',
    s4winA: 'A (better shape)', s4winB: 'B (smaller constant)',
    s4cross: 'Crossing, self-verified: n* = <span>{x}</span> is the first integer where A wins — at n = {xm}, A = {am} > B = {bm} (B wins); at n = {x}, A = {ax} < B = {bx} (A wins). Both readouts are computed live from the cost functions.',
    s4termT: 'The dominant term: lower terms get outgrown',
    s4termE: 'Take f(n) = 2n² + 100n. While n is small, the 100n term still holds a big share; as n grows, the balance tips entirely to 2n². Big O keeps only the highest term and drops coefficients and lower terms — not because they do not exist, but because <strong>at large enough n, they no longer get a vote</strong>. Try a few values of n and watch the shares move.',
    s4termRo: 'n = <span>{n}</span>: 2n² = <span>{q}</span> (<span>{qp}</span>%) · 100n = <span>{l}</span> (<span>{lp}</span>%) → f(n) is recorded as <b>O(n²)</b>',
    cvCross: 'crossover n* ≈ {x}',
    s4hint: 'Honest bookkeeping: everything on this step compares <strong>operation counts</strong>, never wall-clock seconds. Real time also depends on hardware, language, caches and craft — but “past the crossover, the shape rules” holds on every machine. Production sorts switching to simple algorithms on small inputs are this crossover, put to work (step 6).',

    /* ---------- Step 5 ---------- */
    s5k: 'Step 5 · Linear Time',
    s5t: 'Counting sort: the sort that never compares',
    s5e: 'When values live in a bounded range (0 to k), there is a gloriously unfair trick: <strong>never compare anything</strong> — treat each value as an address, count how many times each value occurs (the buckets), then pour the elements back out in value order. Operations = one counting pass (n) + one bucket sweep (k+1) + one output pass (n): linear in n. Watch the comparison counter through the whole demo: it stays at <strong>0</strong>.',
    s5formula: 'Ops = n (count) + (k+1) (sweep buckets) + n (output) = 2n + k + 1 · Comparisons = 0 · Memory = k + 1 cells',
    s5kLab: 'k · value-range cap (values in 0..k)',
    s5blow: 'Stretch the range to 100000',
    s5blowOff: 'Back to a small range',
    s5ro: 'Counting sort: <span>{ops}</span> / {total} ops · <span>0</span> comparisons · {st} | Merge sort on the same data: <span>{mc}</span> comparisons',
    s5roBlow: 'The range bites back: n = {n}, k = {k} — counting sort needs <span>{ops}</span> ops ({kb} of them just sweeping buckets) and <span>{mem}</span> memory cells; merge sort sorts the same data with only <span>{mc}</span> comparisons. It did not lose on n — k dragged it down.',
    s5hint: 'Terminology discipline: comparison sorts have a lower bound of Ω(n log n), but it only constrains algorithms that learn through pairwise comparisons. Counting sort never compares, so it does not “break” the bound — it sidesteps the bound’s premise by using values as addresses. Linear time is never free: the moment the range k loses its bounds, bucket memory and sweep cost bite back (try the button above).',
    cvIn: 'Input (n = {n})', cvBuckets: 'Buckets (value → count)', cvOut: 'Output',
    cvBucketsBig: 'Buckets: {k} cells — only the first stretch fits the canvas; the rest are empty cells',

    /* ---------- Step 6 ---------- */
    s6k: 'Step 6 · Finale',
    s6t: 'Sorting in the real world: hybrids and judgement',
    c1h: 'Production sorts are hybrids',
    c1: 'Almost every sort you actually use is a crossbreed: <strong>Timsort</strong> (Python, Java) is built on merge sort, stirs in insertion sort, and first scans the data for naturally ordered runs to exploit; the C++ standard library’s <strong>introsort</strong> leads with quicksort, falls back to heapsort when recursion runs too deep, and finishes shallow pieces with insertion sort. No purebred wins on every dataset — engineering’s answer is the hybrid.',
    c2h: 'For small n, simple wins',
    c2: 'The hybrids share one detail: once a piece shrinks to a few dozen elements, they switch back to a plain O(n²) loop like <strong>insertion sort</strong> — exactly the crossover from step 4: at small n, the low-constant, straightforward algorithm is genuinely cheaper. O(n²) on small data is not a sin; it is value for money.',
    c3h: 'Choosing: look at n and the data first',
    c3: 'Faced with data to sort, ask four questions: <strong>how big is n</strong> (it sets the shape’s weight), <strong>is it nearly sorted</strong> (Timsort and early-exit sorts profit), <strong>is the value range bounded</strong> (counting sort’s opening), <strong>must it be stable</strong> (do equal elements keep their relative order)? Shape first, constants second — that ruler is the whole page.',
    s6fin: 'One line back to the neighbouring page, <a class="fourier-link" href="../gradient-descent/#step2">Gradient Descent</a>: there, cost was “how cheap is each step × how many steps”; here, it is “how cheap is each comparison × how many comparisons”. Cost is always two factors multiplied — one sets the unit price, the other the quantity, and the quantity’s <strong>shape of growth</strong> has the final say. Learn to see the shape, and you own a ruler for every algorithm.'
  }
};

/* 语言机制（与全站一致） */
let _lang = null;
let _langMem = 'zh';
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
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
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
document.addEventListener('DOMContentLoaded', initLangToggle);
