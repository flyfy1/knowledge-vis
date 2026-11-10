'use strict';
// Binary search lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '二分查找 · 问一次，排除一半',
    back: '← 知识索引',
    compare: '对照另一版本：二分查找 · 每次砍掉一半 →',
    navLabel: '二分查找步骤导航',
    tagline: '在一百万个排好序的数里找一个，最坏要看几次？逐个看要一百万次，二分查找只要 20 次。它的全部秘诀是：每看一次，就把还可能的范围砍掉一半。七步里你会从猜数字游戏出发，写出 lo、mid、hi 的循环，看看差一个 +1 会怎样出错，再把同一招用到「求 √2」这种不是数组的问题上。',
    nav0: '0 猜数字', nav1: '1 lo·mid·hi', nav2: '2 次数', nav3: '3 差一个 1', nav4: '4 重复值', nav5: '5 不止数组', nav6: '6 收束',

    s0k: '第 0 步 · 一个游戏',
    s0t: '我心里想一个 1 到 100 的整数，你最少要问几次才能保证猜中？',
    s0e: '这一步要回答：每次只能得到「大了」「小了」「对了」三种回答时，怎样提问才最省？每个回答都会把<strong>候选范围</strong>（仍有可能是答案的那些数）缩成一段：说「小了」，你猜的数和它左边的都可以划掉；说「大了」，它和它右边的都划掉。图上每一行是一次回答后的候选范围，从上往下累积。如果每次都猜候选范围正中间的数，不管答案在哪，剩下的都不超过原来的一半：100 → 50 → 25 → 12 → 6 → 3 → 1，最多问 7 次。',
    c0: '每一行：问过第 k 次后还剩的候选数（1 到 100）',
    s0lgLeft: '候选范围', s0lgGuess: '这一行的猜测', s0lgNext: '你下一次要猜的数', s0lgHit: '猜中',
    g0Slider: '你的猜测',
    ask0: '就猜这个数', mid0: '替我猜正中间', new0: '换一个秘密数',
    s0none: '还没猜。', ans_hit: '猜 {g}：对了！', ans_higher: '猜 {g}：小了，答案更大。', ans_lower: '猜 {g}：大了，答案更小。',
    s0readout: '{fb}已问 {k} 次，候选范围 {lo} 到 {hi}，还剩 {left} 个数。',
    s0solved: '用了 {k} 次；每次猜正中间的话，1 到 100 里任何数最多 {w} 次。',
    s0hint: '观察顺序：先随便拖滑杆猜几次（比如总是从小往大猜 10、20、30……），看每行青色段缩短得多慢；按「换一个秘密数」重来，这次只按「替我猜正中间」：每一行的青色段大约是上一行的一半，7 行之内一定变绿。白色竖线是你下一次要猜的位置，猜在范围外面的数不会让范围变小。',

    s1k: '第 1 步 · 写成循环',
    s1t: '在排好序的数组里，lo、mid、hi 每一步怎么动？',
    s1e: '这一步要回答：把猜数字搬到数组里，算法的每一步具体做什么？数组有 24 个从小到大排好的数，下标（位置编号）从 0 到 23。用两个下标 <strong>lo</strong> 和 <strong>hi</strong> 记住候选范围：目标如果在数组里，就一定在 lo 到 hi 之间（含两端）。每一步取正中间的下标 <strong>mid</strong> = ⌊(lo + hi)/2⌋（⌊ ⌋ 表示向下取整），看一眼 a[mid]：等于目标就找到了；比目标小，目标只可能在右边，令 lo = mid + 1；比目标大，令 hi = mid − 1。mid 本身已经看过，所以两边都要跳过它。「目标若存在就在 [lo, hi] 里」这句话每一步都保持成立，叫<strong>循环不变量</strong>。当 lo > hi，候选范围空了，说明目标不在数组里，此时 lo 正好是它应该插入的位置。',
    c1: '每行一步：亮格 = [lo, hi]，橙格 = a[mid]',
    s1lgIn: '候选范围 [lo, hi] 内', s1lgOut: '已排除', s1lgMid: '这一步看的 a[mid]', s1lgHit: '找到',
    x1Slider: '要找的数',
    next1: '下一步（走完后从头）', run1: '从头播放',
    s1start: '开始：lo = 0，hi = {hi}，整个数组都是候选。',
    s1eq: 'a[{mid}] = {v}，正是目标。',
    s1lt: 'a[{mid}] = {v} < {x}：目标只可能在右边，新范围 [{lo}, {hi}]。',
    s1gt: 'a[{mid}] = {v} > {x}：目标只可能在左边，新范围 [{lo}, {hi}]。',
    s1found: '找到：下标 {i}，看了 {k} 次。',
    s1absent: '候选范围空了（lo = {lo} > hi = {hi}）：不在数组里，看了 {k} 次；它该插入在下标 {lo}。',
    s1readout: '已走 {k} 步。{status}',
    s1hint: '观察顺序：先保持目标 61，按「下一步」一步步看：每一行亮格（候选范围）都比上一行短一半左右，橙格是这一步看的数。再把目标拖到 62 这类不在数组里的数：最后一行全部变暗，读数给出它该插入的位置。不管目标是多少，24 个数最多看 5 次。',

    s2k: '第 2 步 · 次数怎样增长',
    s2t: '数组变大一千倍，二分查找要多看几次？',
    s2e: '这一步要回答：n 个数时，二分查找最坏要看几次？每看一次，候选范围至少减半（准确地说，剩下的不超过原来的一半），所以看 k 次后最多剩 n / 2ᵏ 个。最坏情况下的次数是 <strong>⌊log₂n⌋ + 1</strong>（log₂n 是「2 的几次方等于 n」）。下图横轴是 n，按 ×10 取刻度（对数刻度），纵轴是最坏次数：它是一级级的台阶，n 每翻一倍才多一级。对比<strong>线性查找</strong>（从头逐个看），最坏要看 n 次。',
    c2: '最坏需要看几次 vs 数组长度 n（横轴对数刻度）',
    s2lgStair: '二分查找最坏次数 ⌊log₂n⌋ + 1', s2lgNow: '当前 n',
    p2Slider: '数组长度 n（按 ×10 拖动）',
    s2readout: 'n = {n}：二分查找最坏看 {b} 次；线性查找最坏看 {lin} 次，平均约 {avg} 次。最坏情况下，线性查找要多看约 {ratio} 倍。',
    s2hint: '观察顺序：把 n 从 1 拖到十亿：台阶从 1 级爬到 30 级，而线性查找的次数跟着 n 一起涨到十亿。在 n = 1,000、1,000,000、1,000,000,000 停一下：最坏次数是 10、20、30，n 每乘 1000，只多 10 次，因为 2¹⁰ = 1024 ≈ 1000。前提是数组已经排好序；排序本身要花约 n·log₂n 次比较，只查一次时不划算，要查很多次才值得。',

    s3k: '第 3 步 · 差一个 1',
    s3t: '把 mid + 1 写成 mid，会出什么事？',
    s3e: '这一步要回答：为什么二分查找以容易写错出名？问题几乎都出在边界上。这里有 4 个版本，只差一个字符：<strong>正确版</strong>就是第 1 步的写法；<strong>lo = mid 版</strong>把 lo = mid + 1 写成 lo = mid；<strong>lo < hi 版</strong>把循环条件 lo ≤ hi 写成 lo < hi；<strong>hi = mid 版</strong>把 hi = mid − 1 写成 hi = mid。数组是 10, 20, …, 80（8 个数），目标取 5, 10, 15, …, 85 一共 17 个，其中 8 个在数组里、9 个不在。下面的方格对每个版本、每个目标都真的跑一遍：绿色是答案对，粉色是答案错，紫色是死循环（lo、hi 不再变化，算法永远停不下来；这里一旦状态重复就判为死循环）。',
    c3a: '所选版本的前几步（每行一步）', c3b: '4 个版本 × 17 个目标（5 到 85）',
    s3lgMid: '这一步看的 a[mid]', s3lgRight: '方格：答案对', s3lgWrong: '方格：答案错', s3lgLoop: '方格：死循环',
    verLabel: '版本：', v_ok: '正确版', v_loMid: 'lo = mid 版', v_ltHi: 'lo < hi 版', v_hiMid: 'hi = mid 版',
    vshort_ok: '正确', vshort_loMid: 'lo=mid', vshort_ltHi: 'lo<hi', vshort_hiMid: 'hi=mid',
    x3Slider: '目标',
    s3loop: '死循环：卡在 lo = {lo}、hi = {hi}，第 {k} 步后状态开始重复',
    s3found: '找到下标 {i}', s3missed: '报告「不在」，可它就在下标 {i}', s3absent: '正确报告「不在」',
    s3readout: '{ver}找 {x}：{res}。这个版本在 17 个目标上：{R} 个对、{Wr} 个错、{L} 个死循环（共 {N} 个）。',
    s3hint: '观察顺序：先选「lo = mid 版」、目标 80：前几行里亮格缩到两格后就不再变，橙格一直停在同一格，这就是死循环。原因：只剩两格时 mid = lo，令 lo = mid 等于原地不动。再选「lo < hi 版」：没有死循环，但目标 10、30、50、80 被说成「不在」，因为范围缩到一格时循环就退出了，那一格从没被看过。「hi = mid 版」在目标比所有数都小（如 5）时也会卡住。检查标准都是第 1 步那句不变量：每一步要么排除 mid，要么结束。',

    s4k: '第 4 步 · 有重复值时',
    s4t: '同一个数出现好几次，怎么找到第一个、数出有几个？',
    s4e: '这一步要回答：数组里有重复值时，「找到一个」够不够？第 1 步的算法遇到相等就停，停在哪个副本取决于 mid 碰巧落在哪。很多时候我们要的是位置边界：<strong>左边界</strong> = 第一个 ≥ 目标的位置，<strong>右边界</strong> = 第一个 > 目标的位置。两者都用同一个思路：不在相等时停下，而是继续把范围往左（或往右）收，直到范围缩成一个位置。这里用半开区间 [lo, hi)（含 lo、不含 hi），起始 [0, n)，结束时 lo = hi 就是答案。右边界 − 左边界 = 目标出现的次数；目标不存在时两者相等，次数为 0，这个位置正是插入点。',
    c4: '16 个数（含重复），上排是值，下排是位置编号',
    c4b: '看了几次：找到一个 / 左边界 / 右边界',
    s4lgRun: '等于目标的那一段', s4lgAny: '第 1 步算法停下的那个副本', s4lgLB: '左边界：第一个 ≥ 目标', s4lgUB: '右边界：第一个 > 目标',
    x4Slider: '目标',
    s4any: '第 1 步算法停在下标 {i}', s4none: '第 1 步算法报告「不在」',
    s4readout: '目标 {x}：{any}；左边界 {lb}，右边界 {ub}，共出现 {cnt} 次。看的次数：找到一个 {ka} 次，左边界 {kl} 次，右边界 {ku} 次（n = {n}）。',
    s4hint: '观察顺序：目标设为 15（出现 4 次）：橙框停在下标 11，是 4 个 15 里的第 4 个，并不是第一个；青色三角在 8、紫色三角在 12，相减得 4。把目标拖到 4、9、21 再看：橙框落在哪个副本是碰巧，两个三角永远夹住整段。拖到 5、13 这类不存在的数：两个三角重合，次数为 0，重合处就是插入点。下方条形：两个边界每次都看 4 或 5 次，不会因为找边界而变慢。',

    s5k: '第 5 步 · 不止是数组',
    s5t: '没有数组，也能二分吗？比如求 √2',
    s5e: '这一步要回答：二分真正需要的是什么？不是数组，而是一个<strong>单调的是非问题</strong>：随着 x 变大，答案从「否」变成「是」以后就不再变回来。求 √c 时问「x² ≥ c 吗？」：x 小时答否，过了 √c 就一直答是。从区间 [0, c] 开始（c ≥ 1 时 √c 一定在里面），每次问区间中点，答「是」就把右端移到中点，答「否」就把左端移过去；真正的 √c 永远夹在两端之间。这叫<strong>二分法</strong>（bisection）。k 次之后区间宽度正好是 c / 2ᵏ：每问 10 次宽度缩小 1024 倍，约多确定 3 位小数（<a class="xlink" href="../../../math/calculus/newton-method/#step5">→ 牛顿法页第 5 步：二分法与牛顿法比速度</a>）。',
    c5a: '前几次的区间（横轴 0 到 {top}）', c5b: '区间宽度（对数刻度）随提问次数',
    s5lgInt: '当前区间 [左端, 右端]', s5lgTrue: '真正的 √c', s5lgW: '区间宽度（灰虚线为 40 次的全程）',
    c5Slider: '要开方的数 c', k5Slider: '已问次数 k',
    s5readout: '√{c}：问了 {k} 次后，答案夹在 {lo} 和 {hi} 之间，宽度 {w}，已确定小数点后 {d} 位。（真值 {sq}）',
    s5hint: '观察顺序：保持 c = 2，把 k 从 0 拖到 40：「前几次的区间」图里前 8 行的青色段每行减半，越来越窄地贴住橙色虚线；「区间宽度」图里宽度沿一条直线下降（对数刻度上，每次乘 1/2 就是直线），k = 10、20、30 时分别确定 2、5、8 位小数。换别的 c，直线整体平移，斜率不变：每次提问只带来 1 个「是/否」，最多把不确定性砍掉一半。',

    s6k: '第 6 步 · 收束',
    s6t: '能砍一半的地方，就能用二分',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，每次问正中间，1 到 100 最多 7 次；<strong>第 1 步</strong>，lo、hi 夹住候选范围，每一步看 a[mid] 并排除它和一半的候选；<strong>第 2 步</strong>，最坏 ⌊log₂n⌋ + 1 次，n 乘 1000 只多约 10 次；<strong>第 3 步</strong>，边界差一个 1 就会死循环或漏掉答案，判断标准是不变量；<strong>第 4 步</strong>，不在相等时停下，就能找到左右边界并数出重复次数；<strong>第 5 步</strong>，只要问题对 x 单调，就能在连续的区间上二分，每 10 次约多 3 位小数。',
    formula: '最坏次数：⌊log₂n⌋ + 1\n不变量：目标若存在，必在 [lo, hi] 中\n二分法：k 次后区间宽度 = 初始宽度 / 2ᵏ',
    boundary: '适用范围：二分查找要求数组已按同一种顺序排好，且能在常数时间内按下标读取任意元素（链表做不到）；这里的「次数」指看了几个元素，每次得到小于、等于、大于三种结果之一。第 2 步的次数是最坏情况。第 3 步的 4 个版本只在本页 8 个数、17 个目标上逐一检验过。第 5 步的二分法要求问题对 x 单调（或连续函数在两端异号），它只保证夹住答案，速度是每次一位二进制，比牛顿法慢但从不发散。',
    linksTitle: '接着去哪儿',
    lk1: '→ 排序页第 0 步：二分查找的前提是排好序，排序要花多少次比较',
    lk2: '→ 牛顿法页第 5 步：二分法每次一位，牛顿法位数翻倍',
    lk3: '→ 哈希页第 2 步：不排序，平均一次就找到',
    lk4: '→ 指数与对数页第 2 步：log₂n 为什么增长得这么慢',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《二分查找 · 每次砍掉一半》的平行版本。'
  },
  en: {
    pageTitle: 'Binary Search · One Look, Half Gone',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Binary Search · Halve the Candidates →',
    navLabel: 'Binary search steps',
    tagline: 'To find one number among a million sorted ones, how many do you have to look at in the worst case? Checking them one by one takes a million looks; binary search takes 20. The whole trick: every look cuts the range of possible answers in half. Over seven steps you start from a guessing game, write the lo, mid, hi loop, see how a single missing +1 breaks it, and then use the same move on a problem that is not an array at all: finding √2.',
    nav0: '0 Guessing', nav1: '1 lo·mid·hi', nav2: '2 How many', nav3: '3 Off by one', nav4: '4 Duplicates', nav5: '5 Beyond arrays', nav6: '6 Wrap-up',

    s0k: 'Step 0 · A game',
    s0t: 'I am thinking of a whole number from 1 to 100. How few questions guarantee you find it?',
    s0e: 'The question here: when every answer is just “higher”, “lower” or “got it”, how should you ask to waste the fewest questions? Each answer shrinks the <strong>candidate range</strong> (the numbers that could still be the answer) to one stretch: “higher” crosses out your guess and everything below it; “lower” crosses out your guess and everything above. Each row of the chart is the candidate range after one more answer, stacking downward. If you always guess the middle of the candidate range, then wherever the answer is, at most half the range survives: 100 → 50 → 25 → 12 → 6 → 3 → 1, so at most 7 questions.',
    c0: 'Each row: candidates left after question k (1 to 100)',
    s0lgLeft: 'candidate range', s0lgGuess: 'guess made on that row', s0lgNext: 'your next guess', s0lgHit: 'found',
    g0Slider: 'your guess',
    ask0: 'Guess this number', mid0: 'Guess the middle for me', new0: 'New secret number',
    s0none: 'No guesses yet. ', ans_hit: 'Guessed {g}: got it! ', ans_higher: 'Guessed {g}: higher, the answer is bigger. ', ans_lower: 'Guessed {g}: lower, the answer is smaller. ',
    s0readout: '{fb}{k} questions so far; candidates {lo} to {hi}, {left} numbers left.',
    s0solved: ' Took {k}; guessing the middle every time finds any number from 1 to 100 in at most {w}.',
    s0hint: 'What to try: first drag the slider and guess a few times however you like (say 10, 20, 30, … from the bottom up) and see how slowly each cyan bar shrinks. Press “New secret number” and this time only press “Guess the middle for me”: each row’s cyan bar is about half the one above, and it turns green within 7 rows. The white line marks your next guess; a guess outside the range does not shrink it at all.',

    s1k: 'Step 1 · As a loop',
    s1t: 'In a sorted array, how do lo, mid and hi move at each step?',
    s1e: 'The question here: moving the guessing game into an array, what exactly does each step do? The array holds 24 numbers in increasing order, at indices (position numbers) 0 to 23. Two indices, <strong>lo</strong> and <strong>hi</strong>, remember the candidate range: if the target is in the array at all, it lies between lo and hi, both included. Each step takes the middle index <strong>mid</strong> = ⌊(lo + hi)/2⌋ (⌊ ⌋ means round down) and looks at a[mid]. Equal to the target: found. Smaller: the target can only be to the right, so lo = mid + 1. Larger: hi = mid − 1. mid itself has now been checked, so both moves skip past it. The statement “if the target exists, it is in [lo, hi]” stays true at every step; it is the <strong>loop invariant</strong>. Once lo > hi the range is empty, so the target is not in the array, and lo is exactly where it would be inserted.',
    c1: 'One row per step: lit = [lo, hi], orange = a[mid]',
    s1lgIn: 'inside the range [lo, hi]', s1lgOut: 'ruled out', s1lgMid: 'a[mid] looked at this step', s1lgHit: 'found',
    x1Slider: 'number to find',
    next1: 'Next step (restarts at the end)', run1: 'Play from the start',
    s1start: 'Start: lo = 0, hi = {hi}; the whole array is a candidate. ',
    s1eq: 'a[{mid}] = {v}, which is the target. ',
    s1lt: 'a[{mid}] = {v} < {x}: the target can only be to the right; new range [{lo}, {hi}]. ',
    s1gt: 'a[{mid}] = {v} > {x}: the target can only be to the left; new range [{lo}, {hi}]. ',
    s1found: 'Found at index {i} after {k} looks.',
    s1absent: 'The range is empty (lo = {lo} > hi = {hi}): not in the array, after {k} looks; it would be inserted at index {lo}.',
    s1readout: '{k} steps taken. {status}',
    s1hint: 'What to try: keep the target at 61 and press “Next step” to go one step at a time. Each row’s lit cells (the candidate range) are about half as many as the row above, and the orange cell is the number looked at in that step. Then drag the target to a number missing from the array, such as 62: the last row goes completely dark and the readout gives the insertion position. Whatever the target, 24 numbers take at most 5 looks.',

    s2k: 'Step 2 · How the count grows',
    s2t: 'Make the array a thousand times bigger: how many more looks?',
    s2e: 'The question here: with n numbers, how many looks does binary search need in the worst case? Every look at least halves the candidate range (precisely, what survives is at most half), so after k looks at most n / 2ᵏ remain. The worst-case count is <strong>⌊log₂n⌋ + 1</strong> (log₂n is the power of 2 that gives n). The chart puts n across on a ×10 scale (a log scale) and the worst-case count up: a staircase that climbs one stair each time n doubles. Compare <strong>linear search</strong> (look at each element from the start), whose worst case is n looks.',
    c2: 'Worst-case looks vs array length n (log scale across)',
    s2lgStair: 'binary search worst case ⌊log₂n⌋ + 1', s2lgNow: 'current n',
    p2Slider: 'array length n (drag in ×10 steps)',
    s2readout: 'n = {n}: binary search needs at most {b} looks; linear search needs up to {lin}, about {avg} on average. In the worst case linear search looks about {ratio} times as often.',
    s2hint: 'What to try: drag n from 1 to a billion. The staircase climbs from 1 to 30 stairs, while linear search’s count grows all the way to a billion with n. Pause at n = 1,000, 1,000,000 and 1,000,000,000: the worst cases are 10, 20 and 30. Multiplying n by 1000 adds only 10 looks, because 2¹⁰ = 1024 ≈ 1000. All this assumes the array is already sorted; sorting costs about n·log₂n comparisons, which does not pay off for a single lookup, only for many.',

    s3k: 'Step 3 · Off by one',
    s3t: 'Write mid instead of mid + 1, and what goes wrong?',
    s3e: 'The question here: why is binary search famous for being easy to get wrong? Almost every bug sits at a boundary. Here are 4 versions that differ by a single character: the <strong>correct version</strong> is the one from step 1; the <strong>lo = mid version</strong> writes lo = mid instead of lo = mid + 1; the <strong>lo < hi version</strong> loops while lo < hi instead of lo ≤ hi; the <strong>hi = mid version</strong> writes hi = mid instead of hi = mid − 1. The array is 10, 20, …, 80 (8 numbers) and the targets are 5, 10, 15, …, 85, 17 in all: 8 in the array, 9 not. The grid below really runs every version on every target: green means the right answer, pink a wrong answer, violet an endless loop (lo and hi stop changing and the algorithm never halts; here a repeated state counts as a loop).',
    c3a: 'Chosen version, first steps (one row each)', c3b: '4 versions × 17 targets (5 to 85)',
    s3lgMid: 'a[mid] looked at this step', s3lgRight: 'grid: right answer', s3lgWrong: 'grid: wrong answer', s3lgLoop: 'grid: endless loop',
    verLabel: 'Version:', v_ok: 'correct', v_loMid: 'lo = mid', v_ltHi: 'lo < hi', v_hiMid: 'hi = mid',
    vshort_ok: 'correct', vshort_loMid: 'lo=mid', vshort_ltHi: 'lo<hi', vshort_hiMid: 'hi=mid',
    x3Slider: 'target',
    s3loop: 'endless loop: stuck at lo = {lo}, hi = {hi}; the state starts repeating after step {k}',
    s3found: 'found at index {i}', s3missed: 'reports “absent”, but it is at index {i}', s3absent: 'correctly reports “absent”',
    s3readout: 'Version “{ver}” looking for {x}: {res}. On the 17 targets this version gets {R} right, {Wr} wrong and {L} endless loops (of {N}).',
    s3hint: 'What to try: pick the “lo = mid” version and target 80. In the first rows the lit cells shrink to two and then stop changing, with the orange cell stuck in place: that is the endless loop. Why: with two cells left, mid = lo, so setting lo = mid does not move. Then pick “lo < hi”: no loops, but targets 10, 30, 50 and 80 are reported absent, because the loop exits when the range is down to one cell, and that cell is never looked at. The “hi = mid” version also gets stuck when the target is smaller than everything (such as 5). The test in every case is step 1’s invariant: each step must either rule out mid or finish.',

    s4k: 'Step 4 · With duplicates',
    s4t: 'When a value appears several times, how do you find the first one and count them?',
    s4e: 'The question here: with repeated values, is “find one” good enough? Step 1’s algorithm stops at the first equal element it hits, and which copy that is depends on where mid happens to land. Often what we want is a boundary: the <strong>left boundary</strong> is the first position ≥ the target, the <strong>right boundary</strong> the first position > the target. Both use one idea: do not stop on equality; keep squeezing the range to the left (or right) until it is a single position. This uses the half-open interval [lo, hi) (lo included, hi not), starting from [0, n) and ending when lo = hi, which is the answer. Right boundary − left boundary = how many times the target occurs; for a missing target the two coincide, the count is 0, and that position is the insertion point.',
    c4: '16 numbers (with repeats): values on top, positions below',
    c4b: 'Looks: find one / left / right boundary',
    s4lgRun: 'the stretch equal to the target', s4lgAny: 'the copy step 1’s algorithm stops on', s4lgLB: 'left boundary: first ≥ target', s4lgUB: 'right boundary: first > target',
    x4Slider: 'target',
    s4any: 'step 1’s algorithm stops at index {i}', s4none: 'step 1’s algorithm reports “absent”',
    s4readout: 'Target {x}: {any}; left boundary {lb}, right boundary {ub}, so it occurs {cnt} times. Looks: find one {ka}, left boundary {kl}, right boundary {ku} (n = {n}).',
    s4hint: 'What to try: set the target to 15 (it occurs 4 times). The orange frame stops at index 11, the fourth of the four 15s, not the first; the cyan triangle sits at 8 and the violet at 12, and their difference is 4. Drag to 4, 9 and 21: which copy the orange frame lands on is luck, while the two triangles always bracket the whole run. Drag to a missing value such as 5 or 13: the triangles coincide, the count is 0, and that spot is the insertion point. The bars below: each boundary search takes 4 or 5 looks, so finding boundaries costs nothing extra.',

    s5k: 'Step 5 · Beyond arrays',
    s5t: 'Can you halve without an array? Finding √2, for example',
    s5e: 'The question here: what does halving really need? Not an array, but a <strong>monotone yes/no question</strong>: as x grows, once the answer flips from “no” to “yes” it never flips back. To find √c, ask “is x² ≥ c?”: small x says no, and everything past √c says yes. Start from the interval [0, c] (for c ≥ 1, √c is surely inside), ask about its midpoint, and move the right end to the midpoint on “yes”, the left end on “no”; the true √c always stays between the two ends. This is the <strong>bisection method</strong>. After k questions the interval is exactly c / 2ᵏ wide: every 10 questions shrink it 1024-fold, pinning down about 3 more decimal places (<a class="xlink" href="../../../math/calculus/newton-method/#step5">→ Newton’s method, step 5: a speed race between bisection and Newton</a>).',
    c5a: 'The first intervals (0 to {top} across)', c5b: 'Interval width (log scale) by question',
    s5lgInt: 'current interval [left, right]', s5lgTrue: 'the true √c', s5lgW: 'interval width (grey dashed: the full 40)',
    c5Slider: 'number to square-root, c', k5Slider: 'questions asked, k',
    s5readout: '√{c}: after {k} questions the answer lies between {lo} and {hi}, an interval {w} wide, with {d} decimal places settled. (True value {sq}.)',
    s5hint: 'What to try: keep c = 2 and drag k from 0 to 40. In the “first intervals” chart the cyan bar halves on each of the first 8 rows, closing in on the orange dashed line; in the “interval width” chart the width falls along a straight line (halving every time is a straight line on a log scale), settling 2, 5 and 8 decimal places at k = 10, 20 and 30. Try another c: the line shifts but keeps its slope, because each question brings a single yes/no and can cut the uncertainty by at most half.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Wherever you can cut in half, you can binary search',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: always asking about the middle finds any number from 1 to 100 in at most 7 questions. <strong>Step 1</strong>: lo and hi bracket the candidates, and each step looks at a[mid] and rules it out along with half the rest. <strong>Step 2</strong>: the worst case is ⌊log₂n⌋ + 1 looks, so multiplying n by 1000 adds only about 10. <strong>Step 3</strong>: an off-by-one at a boundary loops forever or misses the answer, and the invariant is how you check. <strong>Step 4</strong>: refusing to stop on equality finds the left and right boundaries and counts duplicates. <strong>Step 5</strong>: any question that is monotone in x can be bisected on a continuous interval, at about 3 decimal places per 10 questions.',
    formula: 'worst-case looks: ⌊log₂n⌋ + 1\ninvariant: if the target exists, it is in [lo, hi]\nbisection: width after k questions = starting width / 2ᵏ',
    boundary: 'Scope: binary search needs the array sorted in one consistent order and constant-time access to any index (a linked list cannot do that); a “look” here means examining one element and learning less, equal or greater. Step 2’s counts are worst cases. Step 3’s four versions were checked only on this page’s 8 numbers and 17 targets. Step 5’s bisection needs a question that is monotone in x (or a continuous function with opposite signs at the ends); it guarantees to bracket the answer, gaining one binary digit per step, slower than Newton’s method but never diverging.',
    linksTitle: 'Where to go next',
    lk1: '→ Sorting, step 0: binary search needs sorted data; what sorting costs',
    lk2: '→ Newton’s method, step 5: bisection gains one bit per step, Newton doubles the digits',
    lk3: '→ Hashing, step 2: no sorting, about one look on average',
    lk4: '→ Exponents & logarithms, step 2: why log₂n grows so slowly',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Binary Search · Halve the Candidates”.'
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
  if (typeof window.refreshBinarySearch === 'function') window.refreshBinarySearch();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
