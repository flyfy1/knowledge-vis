'use strict';
// Recursion and divide-and-conquer strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '递归与分治 · 问题怎样一层层变小',
    back: '← 知识索引',
    compare: '对照另一版本：递归与分治 · 把大问题劈成小问题 →',
    navLabel: '递归与分治步骤导航',
    tagline: '递归就是函数在算完之前先调用自己，去解一个更小的同类问题。这一页用真正在跑的代码数清楚几件事：调用栈有多深；每次「减一」和「减半」差多少；分治的递归树每层花多少、哪一层说了算；什么时候递归会重复劳动；切得不均时会退化成什么样。',
    nav0: '0 调用栈', nav1: '1 减一与减半', nav2: '2 分、治、合', nav3: '3 递归树记账', nav4: '4 重复子问题', nav5: '5 切得不均', nav6: '6 收束',
    play: '播放', pause: '暂停', stepOne: '单步 →', toStart: '回到开始', evSlider: '执行到第几个事件',

    s0k: '第 0 步 · 调用栈',
    s0t: '函数调用自己时，谁在等谁？',
    s0e: '这一步要回答：一个函数还没算完就又调用了自己，计算机怎样记住「回来以后还要做什么」？例子是求 3 的 n 次方：<strong>pow(n) = 3 × pow(n − 1)</strong>，并规定 <strong>pow(0) = 1</strong>。后一条叫<strong>基础情形</strong>：不再调用自己、直接给出答案的最小情形；没有它，调用会无穷无尽。每次调用都在内存里占一块记录（参数 n、回来后要乘的 3），叫<strong>栈帧</strong>；所有还没返回的栈帧一层压一层，叫<strong>调用栈</strong>。新的调用压在最上面，最上面的最先返回（后进先出）。这里一个<strong>事件</strong>指一次调用（压入一帧）或一次返回（弹出一帧）。',
    nPow: '求 pow(n)，n =',
    s0lgWait: '等待下一层结果的栈帧', s0lgBase: '基础情形 / 已拿到结果、即将返回', s0lgDepth: '栈深度的历史（已发生的事件）',
    c0stack: '调用栈（最上面是最新的调用）', c0depth: '栈里的帧数 · 横轴：事件序号',
    frameWait: 'pow({k}) = 3 × pow({k1})  等待中',
    frameBase: 'pow(0) = 1  基础情形',
    frameReady: 'pow({k}) = 3 × {v} = {r}  即将返回',
    stackEmpty: '栈是空的',
    s0start: '还没开始',
    s0call: '调用 pow({k})，压入一帧',
    s0callBase: '调用 pow(0)：基础情形，直接得到 1',
    s0ret: 'pow({k}) 返回 {v}，弹出一帧',
    s0done: '全部返回：pow({n}) = {v}',
    s0readout: '事件 {s}/{E}：{what}　·　栈里现在 {depth} 帧（全程最深 {max} 帧 = n + 1）　·　已做乘法 {mults} 次',
    s0hint: '观察顺序：页面打开时停在栈最深的那一刻。先按「回到开始」，再按「播放」，看橙色栈帧一层层往上压，直到绿色的 pow(0)；随后栈从顶上一层层弹出，每弹一层就把结果交给下面那一层，那一层变绿、算出自己的值。下图青色曲线记下了栈深度的全过程：先爬升到 n + 1 帧，再一路降回 0。换一个 n 会回到事件 0；n 越大，山越高——递归每深一层就要多占一帧内存。',

    s1k: '第 1 步 · 每次缩小多少',
    s1t: '同样算 3 的 n 次方，一次减 1 和一次减半，差多少？',
    s1e: '这一步要回答：递归要走多深，由什么决定？上一步每次把 n 减 1，要 n + 1 层才碰到基础情形。换一种写法：3 的 n 次方 = (3 的 ⌊n/2⌋ 次方)²，n 为奇数时再乘一个 3（⌊n/2⌋ 表示 n/2 向下取整）。于是 <strong>pow(n) 只调用一次 pow(⌊n/2⌋)</strong>，把结果自乘，奇数时再乘 3；基础情形仍是 pow(0) = 1。两种写法答案相同，差别只在每层把问题缩小多少：减 1 要走 n 步，减半只要约 log₂ n 步（log₂ n：n 要连续除以 2 多少次才降到 1；<a class="xlink" href="../../../computing/algorithms/binary-search/#step1">→ 二分查找第 1 步也是每次砍半</a>）。本步只数两样东西：<strong>栈帧数</strong>（调用链有几层，也是调用栈最深时的帧数）和<strong>乘法次数</strong>，不真的算出 3 的 n 次方这个大数。',
    nExp: '指数 n',
    s1lgLin: '一次减 1：栈帧数', s1lgHalf: '一次减半：栈帧数', s1lgNow: '当前 n', s1lgOdd: '链上的奇数：这一层多乘一次 3',
    c1chain: '减半写法的调用链：pow(n) → pow(⌊n/2⌋) → … → pow(0)', c1plot: '栈帧数（纵轴对数刻度，每格大 10 倍）· 横轴：n',
    s1readout: 'n = {n}：一次减 1 要 {fl} 帧、{ml} 次乘法；一次减半要 {fh} 帧、{mh} 次乘法（每层一次自乘，该层数字为奇数时再乘一次 3）。作为对照，3 的 {n} 次方有 {dig} 位十进制数字。',
    s1hint: '观察顺序：把 n 从 13 一路拖到 1024。上图的调用链只多出几格：n 每翻一倍，链子才长一格。下图橙线随 n 一直往上走，青色台阶几乎是平的（注意纵轴是对数刻度）。再比较 n = 1023 和 n = 1024：1023 链上每格都是奇数，乘法最多（20 次）；1024 每格都是偶数，乘法只要 12 次。',

    s2k: '第 2 步 · 分、治、合',
    s2t: '归并排序的递归树，实际按什么顺序执行？',
    s2e: '这一步要回答：一个「劈成两半」的递归，执行时先做什么、后做什么？<strong>分治</strong>指三个动作：<strong>分</strong>（把问题切成更小的同类问题）、<strong>治</strong>（递归地解决每一份；小到只剩 1 个数时就是基础情形，天然有序）、<strong>合</strong>（把子问题的答案拼成整体答案）。<strong>归并排序</strong>：把一串数切成左右两半，各自排好，再<strong>归并</strong>——两个已排好的序列各看最前面的数，取较小的放进结果，直到取完。每次「拿两个数比大小」算一次<strong>比较</strong>。下图每个方框是一次调用，负责一段数；同一行是同一递归深度，方框里的数是这次调用此刻的样子（排好后显示排好的顺序）。事件分两种：进入一次调用，或完成一次归并。',
    s2lgTodo: '还没被调用', s2lgStack: '正在调用栈上（从顶行往下的这条路）', s2lgDone: '已排好并返回',
    c2tree: '归并排序的递归树（第 0 行是整串，往下每行切一半）',
    newNumbers: '换一组数（回到事件 0）',
    s2start: '还没开始，8 个数是 [{vals}]',
    s2enter: '进入调用：负责 [{vals}] 这 {len} 个数，先切成两半',
    s2leaf: '进入调用：只剩 [{vals}] 一个数，是基础情形，直接返回',
    s2merge: '归并 [{a}] 和 [{b}] → [{out}]，比较 {c} 次',
    s2readout: '事件 {k}/{E}：{what}　·　调用栈 {depth} 层　·　累计比较 {cmp} 次（这组数做完共 {total} 次；8 个数最坏要 {worst} 次）',
    s2hint: '观察顺序：按「单步」一下下走，或按「播放」。执行顺序不是一行一行做完：程序先一路钻到左下角，左半边全部排好返回之后，才去碰右半边——这就是调用栈的后进先出。橙色边框的路径就是此刻的调用栈，它最多 4 层（log₂ 8 + 1）。每次归并时看读数里的比较次数：一边先取完，剩下的直接接上，不用再比。',

    s3k: '第 3 步 · 递归树记账',
    s3t: '递归树每层花多少？哪一层说了算？',
    s3e: '这一步要回答：知道一个分治算法「切成几份、每份多大、切和合花多少」，能不能不跑程序就估出总工作量？用<strong>递推式</strong>描述：<strong>T(n) = a · T(n/2) + n^d</strong>。意思是：规模为 n 的问题切成 a 个规模为 n/2 的子问题，切分与合并本身花 n^d 份工作（d = 0 表示固定花 1 份，d = 1 表示和 n 成正比，d = 2 表示和 n² 成正比）。把所有调用画成<strong>递归树</strong>（每个调用是一个结点，它的子问题挂在下一层）：第 k 层有 a^k 个调用，每个规模 n/2^k，各花 (n/2^k)^d，整层合计 n^d · (a/2^d)^k。所以相邻两层的工作量之比固定为 <strong>r = a / 2^d</strong>：r &lt; 1 时越往下越少，顶层说了算；r = 1 时每层一样多，总量 = 每层 × 层数；r &gt; 1 时越往下越多，最底层（全是规模 1 的调用）说了算。这里 n = 2^m，最底层每个调用规模为 1、各花 1 份。',
    aSlider: '切成 a 份', dSlider: '切与合的花费 n^d，d =', mSlider: '规模 n = 2^m，m =',
    presetsLabel: '常见算法：',
    pBinary: '二分查找 (a=1, d=0)', pMax: '分治求最大值 (a=2, d=0)', pMerge: '归并排序 (a=2, d=1)', pKara: 'Karatsuba 乘法 (a=3, d=1)', pFour: '四块乘法 (a=4, d=1)',
    s3lgBar: '这一层的工作量', s3lgMax: '工作量最大的一层', s3lgRatio: 'T(n) ÷ 预测规律（走平 = 规律对）',
    c3bars: '递归树每层工作量（条长按最大一层缩放；右侧是这一层合计）', c3ratio: 'T(n) ÷ 预测规律 · 横轴 m（n = 2^m）',
    levelTag: '第 {k} 层',
    regTop: '越往下越少，顶层占全部的 {share}%',
    regEven: '每层一样多（各 {each} 份），共 {levels} 层',
    regBottom: '越往下越多，最底层占全部的 {share}%',
    s3readout: 'a = {a}、d = {d}、n = {n}：相邻层之比 r = a/2^d = {r}，{regime}。总工作量 T(n) = {T}；预测规律 {law} = {L}，二者之比 {ratio}。',
    s3hint: '观察顺序：先点「归并排序」，把 m 从 1 拖到 10：每层的条一样长（r = 1），层数随 m 增加，总量 ≈ n × 层数。再点「Karatsuba 乘法」：条越往下越长，最底层最长；下图白点很快走平，说明 T(n) 跟着 n^1.585 增长。再点「四块乘法」对比：同样把数字切成两半，只是多算了一次子乘法（4 次而不是 3 次），r 从 1.5 变成 2，增长变成 n²。最后把 d 拖到 2、a 拖到 1：条越往下越短，顶层独占大半。白点的高度本身不重要，只看它随 m 是否走平。',

    s4k: '第 4 步 · 重复的子问题',
    s4t: '为什么照抄定义的斐波那契递归，会慢到算不完？',
    s4e: '这一步要回答：把问题切成小问题，总是划算吗？斐波那契数规定 fib(0) = 0、fib(1) = 1（两个基础情形），之后每个等于前两个之和：fib(k) = fib(k − 1) + fib(k − 2)。照抄成递归，fib(k) 调用 fib(k − 1) 和 fib(k − 2)，而 fib(k − 1) 里又会再调用一次 fib(k − 2)……两份子问题<strong>互相重叠</strong>，同一个小问题被从头算很多遍。对比上一节的归并排序：那里左右两半是不同的数，从不重复。补救办法叫<strong>记忆化</strong>：第一次算出 fib(k) 就记进表里，以后再被调用直接查表返回（仍算一次调用，但不再往下展开）。',
    nFib: '求 fib(n)，n =',
    s4lgNaive: '照抄定义：fib(k) 被调用的次数', s4lgMemo: '记忆化：fib(k) 被调用的次数',
    c4bars: '求 fib(n) 时，每个 fib(k) 被调用几次（纵轴对数刻度）· 横轴：k', c4calls: '总调用次数（纵轴对数刻度）· 横轴：n',
    s4readout: 'fib({n}) = {v}。照抄定义：共 {cn} 次调用（= 2·fib({n1}) − 1），其中 fib(1) 被调用 {c1} 次、fib(2) 被调用 {c2} 次；记忆化：共 {cm} 次调用（= 2n − 1）。前者是后者的 {x} 倍。',
    s4hint: '观察顺序：把 n 从 8 往右拖。上图橙色柱越靠左（子问题越小）越高：fib(1) 被调用的次数恰好等于 fib(n) 本身。绿色柱永远不超过 2：每个子问题只真正算一次，第二次是查表。下图橙线在对数纵轴上是一条斜直线——n 每加 1，调用次数约乘 1.618（指数增长）；绿线几乎贴底。',

    s5k: '第 5 步 · 切得不均',
    s5t: '每次切得不均匀，分治还管用吗？',
    s5e: '这一步要回答：分治一定要切成相等的两半吗？像<strong>快速排序</strong>那样：选一个数作<strong>基准</strong>，把其余 n − 1 个数分成「比它小」和「比它大」两份（每个数和基准比较一次，共 n − 1 次比较），再对两份分别递归。两份多大取决于基准选得好不好。这里让较小的那份固定占其余数的比例 p（向下取整）：p = 0.5 是对半切；p = 0 表示较小那份是空的，每层只剥掉基准这一个数。上图把 n = 256 的整个递归画成<strong>冰柱图</strong>：每一行是一层递归，每段横条是这一层里一个调用负责的那段数；冰柱有多高，递归就有多深。',
    pSlider: '较小一份的占比 p',
    clearHist: '清除记录',
    s5lgNow: '当前 p', s5lgTried: '试过的 p', s5lgRef: '参照线：n·log₂n（下）与 n(n−1)/2（上）',
    c5ice: 'n = 256 的递归冰柱图（每行一层；纵向满格 = 256 层）', c5plot: '总比较次数（双对数坐标）· 横轴：n',
    s5readout: 'p = {p}：n = 256 时递归深 {depth} 层、共比较 {cmp} 次，是 n·log₂n = 2048 的 {ratio} 倍。n 从 1024 翻倍到 2048，比较次数变成原来的 {grow} 倍（n·log₂n 规律约 2.2 倍，n² 规律 4 倍）。',
    s5hint: '观察顺序：从 p = 0.5 开始往左拖。冰柱慢慢变高，但只要 p 大于 0，它仍远矮于 256 层；下图曲线和下面那条 n·log₂n 虚线大致平行，p 越小整条越往上挪（常数变大），n 翻倍时比较次数约变 2.2–2.3 倍。拖到 p = 0：冰柱变成高 256 层的三角形，曲线贴上 n(n−1)/2 那条虚线，n 翻倍时变 4 倍——每层只少一个数，等于退化成第 1 步的「一次减 1」。灰线是试过的 p，按「清除记录」清掉。',

    s6k: '第 6 步 · 收束',
    s6t: '递归的成本，就是递归树的形状',
    s6fin: '写一个递归，要回答三件事：<strong>基础情形</strong>是什么（第 0 步）；每层把问题缩小多少（第 1 步：减 1 要 n 层，减半只要约 log₂ n 层）；子问题的答案怎样合起来（第 2 步）。成本可以在递归树上一层层记账（第 3 步）：每层一样多时是「每层 × 层数」，否则看哪一层占大头。两个常见的坑：子问题互相重叠会重复劳动，要记忆化（第 4 步）；切得太偏，树会变深，最坏退化成 n 层（第 5 步）。',
    formula: 'T(n) = a·T(n/2) + n^d，相邻层之比 r = a / 2^d\nr < 1：顶层主导，≈ n^d\nr = 1：每层相同，≈ n^d · log₂n\nr > 1：底层主导，≈ n^(log₂a)',
    boundary: '适用范围：本页只数调用次数、乘法次数和比较次数，不测真实运行时间（缓存、函数调用开销、编译器把尾递归改成循环等都没算进去）。第 3 步的规律只针对「切成 a 个一样大的 n/2」这一类递推式，且 n 取 2 的整数次幂；第 5 步的比例 p 是人为固定的，真实快速排序的基准通常随机选取。调用栈的容量也有上限：深度上万的递归在很多语言里会栈溢出。',
    linksTitle: '接着去哪儿',
    lk1: '→ 二分查找第 1 步：每次砍掉一半，为什么只要 log₂ n 次',
    lk2: '→ 排序第 2 步：归并排序与其他排序在同一组数据上比赛',
    lk3: '→ 图算法第 1 步：用栈一路钻到底的搜索（和本页的调用栈同一个道理）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《递归与分治 · 把大问题劈成小问题》的平行版本。'
  },
  en: {
    pageTitle: 'Recursion & Divide-and-Conquer · How a Problem Shrinks, Level by Level',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Recursion and Divide-and-Conquer · Splitting a Big Problem Into Small Ones →',
    navLabel: 'Recursion and divide-and-conquer steps',
    tagline: 'Recursion means a function, before it has finished, calls itself on a smaller version of the same problem. This page counts things with code that really runs: how deep the call stack gets; what separates “subtract one” from “halve”; what each level of a divide-and-conquer tree costs and which level dominates; when recursion repeats its own work; and what a lopsided split degrades into.',
    nav0: '0 Call stack', nav1: '1 Minus one vs halve', nav2: '2 Divide, conquer, combine', nav3: '3 Tree accounting', nav4: '4 Repeated work', nav5: '5 Lopsided splits', nav6: '6 Wrap-up',
    play: 'Play', pause: 'Pause', stepOne: 'Step →', toStart: 'Back to start', evSlider: 'Run up to event',

    s0k: 'STEP 0 · THE CALL STACK',
    s0t: 'When a function calls itself, who is waiting for whom?',
    s0e: 'The question here: a function calls itself before it has finished — how does the computer remember what is left to do when the inner call comes back? Our example computes 3 to the power n: <strong>pow(n) = 3 × pow(n − 1)</strong>, with <strong>pow(0) = 1</strong>. That second rule is the <strong>base case</strong>: the smallest input, answered directly without another call. Without it the calls would never stop. Every call gets a small record in memory (its n, and the “× 3” still owed) called a <strong>stack frame</strong>; the frames of all calls that have not yet returned pile up into the <strong>call stack</strong>. A new call goes on top, and the top one returns first (last in, first out). An <strong>event</strong> here is one call (a frame pushed) or one return (a frame popped).',
    nPow: 'Compute pow(n), n =',
    s0lgWait: 'Frame waiting for the result below it', s0lgBase: 'Base case / result in hand, about to return', s0lgDepth: 'Stack depth so far (events that happened)',
    c0stack: 'Call stack (newest call on top)', c0depth: 'Frames on the stack · horizontal: event number',
    frameWait: 'pow({k}) = 3 × pow({k1})  waiting',
    frameBase: 'pow(0) = 1  base case',
    frameReady: 'pow({k}) = 3 × {v} = {r}  returning',
    stackEmpty: 'The stack is empty',
    s0start: 'Nothing has run yet',
    s0call: 'Call pow({k}): push a frame',
    s0callBase: 'Call pow(0): base case, the answer is 1',
    s0ret: 'pow({k}) returns {v}: pop a frame',
    s0done: 'Everything returned: pow({n}) = {v}',
    s0readout: 'Event {s}/{E}: {what}  ·  {depth} frames on the stack now (deepest {max} = n + 1)  ·  {mults} multiplications so far',
    s0hint: 'What to watch: the page opens at the moment the stack is deepest. Press Back to start, then Play. Orange frames pile up one by one until the green pow(0); then the stack unwinds from the top, each popped frame handing its result to the one below, which turns green and computes its own value. The cyan curve below records the depth over the whole run: up to n + 1 frames, then back down to 0. Changing n restarts at event 0; a bigger n makes a taller mountain — every extra level of recursion costs one more frame of memory.',

    s1k: 'STEP 1 · HOW MUCH SMALLER EACH TIME',
    s1t: 'Same 3 to the n: how different are “minus one” and “halve”?',
    s1e: 'The question here: what decides how deep a recursion goes? Step 0 shrinks n by one per call, so it needs n + 1 levels to reach the base case. Rewrite it: 3 to the n equals (3 to the ⌊n/2⌋) squared, times one more 3 when n is odd (⌊n/2⌋ means n/2 rounded down). Now <strong>pow(n) makes a single call, pow(⌊n/2⌋)</strong>, squares the result, and multiplies by 3 if n is odd; the base case is still pow(0) = 1. Both give the same answer; they differ only in how much each level shrinks the problem. Subtracting one takes n steps; halving takes about log₂ n (log₂ n: how many times you can halve n before reaching 1; <a class="xlink" href="../../../computing/algorithms/binary-search/#step1">→ binary search, step 1, halves the same way</a>). We count only two things: <strong>frames</strong> (the length of the call chain, which is also the deepest the stack gets) and <strong>multiplications</strong>. We never build the huge number 3 to the n itself.',
    nExp: 'Exponent n',
    s1lgLin: 'Minus one: frames', s1lgHalf: 'Halve: frames', s1lgNow: 'Current n', s1lgOdd: 'Odd link: one extra × 3 on that level',
    c1chain: 'Call chain of the halving version: pow(n) → pow(⌊n/2⌋) → … → pow(0)', c1plot: 'Frames (log scale, each gridline ×10) · horizontal: n',
    s1readout: 'n = {n}: minus one needs {fl} frames and {ml} multiplications; halving needs {fh} frames and {mh} multiplications (one squaring per level, plus one × 3 when that level’s number is odd). For scale, 3 to the {n} has {dig} decimal digits.',
    s1hint: 'What to watch: drag n from 13 all the way to 1024. The chain in the top panel gains only a few boxes: n has to double to add one link. In the bottom panel the orange line keeps climbing while the cyan staircase is almost flat (mind the log scale). Then compare n = 1023 with n = 1024: every link of 1023 is odd, so it needs the most multiplications (20); every link of 1024 is even, so it needs only 12.',

    s2k: 'STEP 2 · DIVIDE, CONQUER, COMBINE',
    s2t: 'In what order does merge sort actually walk its recursion tree?',
    s2e: 'The question here: when a recursion splits its problem in half, what happens first and what happens later? <strong>Divide and conquer</strong> is three moves: <strong>divide</strong> (cut the problem into smaller problems of the same kind), <strong>conquer</strong> (solve each piece recursively; a single number is the base case and is already sorted) and <strong>combine</strong> (build the whole answer from the pieces). <strong>Merge sort</strong> cuts a list into a left and a right half, sorts each, then <strong>merges</strong> them: look at the front of both sorted halves, move the smaller one to the output, repeat until both are empty. Each “compare two numbers” counts as one <strong>comparison</strong>. In the picture each box is one call responsible for a stretch of numbers; one row is one recursion depth, and a box shows its numbers as they are right now (sorted once that call has finished). There are two kinds of event: entering a call, and finishing a merge.',
    s2lgTodo: 'Not called yet', s2lgStack: 'On the call stack (the path down from the top row)', s2lgDone: 'Sorted and returned',
    c2tree: 'Merge sort’s recursion tree (each row halves the one above)',
    newNumbers: 'New numbers (back to event 0)',
    s2start: 'Nothing has run yet; the 8 numbers are [{vals}]',
    s2enter: 'Enter a call for [{vals}] ({len} numbers); split it in two first',
    s2leaf: 'Enter a call for [{vals}] alone: base case, return at once',
    s2merge: 'Merge [{a}] and [{b}] → [{out}], {c} comparisons',
    s2readout: 'Event {k}/{E}: {what}  ·  call stack {depth} deep  ·  {cmp} comparisons so far (this list needs {total} in total; the worst case for 8 numbers is {worst})',
    s2hint: 'What to watch: press Step to go one event at a time, or Play. The tree is not filled in row by row: the program dives straight to the bottom-left corner, and only after the whole left half is sorted and returned does it touch the right half — last in, first out. The orange-outlined path is the call stack at this moment; it is never more than 4 deep (log₂ 8 + 1). At each merge, check the comparison count: once one side runs out, the rest of the other side is copied without comparing.',

    s3k: 'STEP 3 · ACCOUNTING ON THE TREE',
    s3t: 'What does each level of the tree cost, and which level wins?',
    s3e: 'The question here: if you know how a divide-and-conquer algorithm splits (how many pieces, how big) and what dividing and combining cost, can you estimate the total work without running it? Write it as a <strong>recurrence</strong>: <strong>T(n) = a · T(n/2) + n^d</strong>. A problem of size n becomes a subproblems of size n/2, and the dividing plus combining costs n^d units of work (d = 0: a fixed 1 unit; d = 1: proportional to n; d = 2: proportional to n²). Draw every call as a node of the <strong>recursion tree</strong>, with its subproblems hanging one level below. Level k holds a^k calls of size n/2^k, each costing (n/2^k)^d, so the whole level costs n^d · (a/2^d)^k. Neighbouring levels therefore differ by a fixed factor <strong>r = a / 2^d</strong>. If r &lt; 1 the levels shrink going down and the top level dominates; if r = 1 every level costs the same and the total is (one level) × (number of levels); if r &gt; 1 they grow going down and the bottom level — all the size-1 calls — dominates. Here n = 2^m, so the bottom calls have size 1 and cost 1 each.',
    aSlider: 'Pieces a', dSlider: 'Divide + combine cost n^d, d =', mSlider: 'Size n = 2^m, m =',
    presetsLabel: 'Known algorithms:',
    pBinary: 'Binary search (a=1, d=0)', pMax: 'Max by halves (a=2, d=0)', pMerge: 'Merge sort (a=2, d=1)', pKara: 'Karatsuba multiply (a=3, d=1)', pFour: 'Four-block multiply (a=4, d=1)',
    s3lgBar: 'Work on this level', s3lgMax: 'The most expensive level', s3lgRatio: 'T(n) ÷ predicted law (flat = law holds)',
    c3bars: 'Work per level (scaled to the largest; total on the right)', c3ratio: 'T(n) ÷ predicted law · horizontal: m (n = 2^m)',
    levelTag: 'L{k}',
    regTop: 'levels shrink going down; the top level is {share}% of the total',
    regEven: 'every level costs the same ({each} each), {levels} levels',
    regBottom: 'levels grow going down; the bottom level is {share}% of the total',
    s3readout: 'a = {a}, d = {d}, n = {n}: level ratio r = a/2^d = {r}; {regime}. Total work T(n) = {T}; predicted law {law} = {L}, ratio {ratio}.',
    s3hint: 'What to watch: click Merge sort and drag m from 1 to 10. Every bar has the same length (r = 1); only the number of levels grows, so the total ≈ n × levels. Click Karatsuba multiply: bars grow toward the bottom, the bottom level is longest, and the white dots below level off quickly — T(n) grows like n^1.585. Click Four-block multiply for contrast: the same halving of the digits, but one extra sub-multiplication (4 instead of 3), so r goes from 1.5 to 2 and the growth becomes n². Finally set d = 2 and a = 1: bars shrink toward the bottom and the top level takes most of the bill. The height of the white dots does not matter; only whether they level off as m grows.',

    s4k: 'STEP 4 · REPEATED SUBPROBLEMS',
    s4t: 'Why does Fibonacci, coded straight from its definition, take forever?',
    s4e: 'The question here: is splitting into smaller problems always a good deal? Fibonacci numbers start with fib(0) = 0 and fib(1) = 1 (two base cases); after that each is the sum of the previous two: fib(k) = fib(k − 1) + fib(k − 2). Coded literally, fib(k) calls fib(k − 1) and fib(k − 2) — but fib(k − 1) calls fib(k − 2) again inside it. The two subproblems <strong>overlap</strong>, so the same small problem is solved from scratch many times. Contrast merge sort: its two halves hold different numbers and never repeat. The fix is <strong>memoisation</strong>: the first time fib(k) is computed, write it in a table; any later call just looks it up and returns (it still counts as a call, but it does not expand further).',
    nFib: 'Compute fib(n), n =',
    s4lgNaive: 'Straight from the definition: calls to fib(k)', s4lgMemo: 'Memoised: calls to fib(k)',
    c4bars: 'Calls to each fib(k) while computing fib(n) (log scale) · horizontal: k', c4calls: 'Total calls (log scale) · horizontal: n',
    s4readout: 'fib({n}) = {v}. Straight from the definition: {cn} calls (= 2·fib({n1}) − 1), including {c1} calls to fib(1) and {c2} to fib(2). Memoised: {cm} calls (= 2n − 1). That is {x} times fewer.',
    s4hint: 'What to watch: drag n up from 8. In the top panel the orange bars get taller to the left, where the subproblems are smaller: fib(1) is called exactly fib(n) times. The green bars never exceed 2: each subproblem is really computed once, and the second visit is a table lookup. In the bottom panel the orange line is straight on the log scale — every +1 in n multiplies the calls by about 1.618 (exponential growth); the green line hugs the floor.',

    s5k: 'STEP 5 · LOPSIDED SPLITS',
    s5t: 'If every split is uneven, does divide-and-conquer still pay off?',
    s5e: 'The question here: must the two halves be equal? Take <strong>quicksort</strong>: pick one number as the <strong>pivot</strong>, sort the other n − 1 numbers into “smaller” and “larger” (one comparison each, n − 1 in all), then recurse on both parts. How big the parts are depends on how good the pivot was. Here the smaller part always gets a fixed share p of the other numbers (rounded down): p = 0.5 is an even split; p = 0 means the smaller part is empty, so each level peels off just the pivot. The top panel draws the whole recursion for n = 256 as an <strong>icicle chart</strong>: each row is one recursion level and each bar is the stretch of numbers one call handles. The taller the icicle, the deeper the recursion.',
    pSlider: 'Share of the smaller part p',
    clearHist: 'Clear history',
    s5lgNow: 'Current p', s5lgTried: 'Earlier p values', s5lgRef: 'Reference: n·log₂n (lower) and n(n−1)/2 (upper)',
    c5ice: 'Recursion of n = 256, one row per level (full height = 256)', c5plot: 'Total comparisons (log–log) · horizontal: n',
    s5readout: 'p = {p}: for n = 256 the recursion is {depth} levels deep with {cmp} comparisons, {ratio} × n·log₂n = 2048. Doubling n from 1024 to 2048 multiplies the comparisons by {grow} (an n·log₂n law gives about 2.2, an n² law gives 4).',
    s5hint: 'What to watch: start at p = 0.5 and drag left. The icicle grows taller, but as long as p is above 0 it stays far short of 256 levels, and in the bottom panel the curve runs roughly parallel to the lower n·log₂n line, shifting up as p shrinks (a bigger constant): doubling n multiplies the work by about 2.2–2.3. At p = 0 the icicle becomes a 256-level triangle and the curve lands on the upper n(n−1)/2 line, growing 4× per doubling — each level removes one number, which is exactly step 1’s “minus one”. Grey curves are earlier p values; Clear history removes them.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'The cost of a recursion is the shape of its tree',
    s6fin: 'Writing a recursion means answering three questions: what is the <strong>base case</strong> (step 0); how much smaller does each level make the problem (step 1: minus one needs n levels, halving about log₂ n); and how do the sub-answers combine (step 2). The cost can be tallied level by level on the recursion tree (step 3): when all levels cost the same it is “per level × levels”, otherwise look at the level that dominates. Two classic traps: overlapping subproblems repeat work unless you memoise (step 4), and lopsided splits make the tree deeper, in the worst case n levels (step 5).',
    formula: 'T(n) = a·T(n/2) + n^d, level ratio r = a / 2^d\nr < 1: top level dominates, ≈ n^d\nr = 1: all levels equal, ≈ n^d · log₂n\nr > 1: bottom level dominates, ≈ n^(log₂a)',
    boundary: 'Scope: this page counts calls, multiplications and comparisons; it does not time anything (caches, call overhead, compilers turning tail recursion into loops are all left out). The step 3 rule covers only recurrences that split into a equal pieces of size n/2, with n a power of two. The share p in step 5 is fixed by hand; real quicksort usually picks its pivot at random. And the call stack has a limit: recursions tens of thousands deep overflow it in many languages.',
    linksTitle: 'Where to go next',
    lk1: '→ Binary search, step 1: why halving needs only log₂ n rounds',
    lk2: '→ Sorting, step 2: merge sort racing other sorts on the same data',
    lk3: '→ Graph algorithms, step 1: a stack that dives all the way down (the same idea as this page’s call stack)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Recursion and Divide-and-Conquer · Splitting a Big Problem Into Small Ones”.'
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
  if (typeof window.refreshRecursion === 'function') window.refreshRecursion();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.REC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
