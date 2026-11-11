# Authoring helper confined to this lesson: writes ../copy.js; duplicate keys raise immediately.
import json
from pathlib import Path

R = Path(__file__).resolve().parents[1]
pairs = {}


def c(key, zh, en):
    assert key not in pairs, key
    assert zh.strip() and en.strip(), key
    pairs[key] = [zh, en]


c('docTitle', '1121 · 将数组分成几个递增序列', '1121 · Divide Array Into Increasing Sequences')
c('title', '#1121 · 将数组分成几个递增序列', '#1121 · Divide Array Into Increasing Sequences')
c('back', '← LeetCode 题集', '← LeetCode collection')
c('language', '语言', 'Language')
c('navLabel', '课程步骤', 'Lesson steps')
c('official', '官方题目 ↗', 'Official problem ↗')
c('badge', '困难 · 计数论证', 'Hard · Counting argument')
c('intro', '一个排好序的数组，能不能拆成几条“严格递增、每条至少 k 个数”的序列？看上去要搜索各种拆法，最后却只需要数一个数。',
  'A sorted array: can it be split into sequences that are strictly increasing and each at least k long? It looks like a search over ways to split, yet in the end you only need to count one thing.')
c('contract', '输入非递减数组 nums 和整数 k。把 nums 的每个元素恰好放进一条序列（每条序列保持原来的相对顺序），要求每条序列严格递增、长度至少 k，可以分成一条或多条。能做到就返回 true，否则返回 false。范围：1 ≤ k ≤ nums.length ≤ 10⁵，1 ≤ nums[i] ≤ 10⁵。',
  'Inputs: a non-decreasing array nums and an integer k. Put every element of nums into exactly one sequence (each sequence keeps the original relative order) so that every sequence is strictly increasing with length at least k; one or more sequences are allowed. Return true if this is possible, false otherwise. Bounds: 1 ≤ k ≤ nums.length ≤ 10⁵, 1 ≤ nums[i] ≤ 10⁵.')
c('access', '官方题面仅对订阅用户开放；上面是本页自写的转述，例子也都是自编的。请以官方页面为准。',
  'The official statement is for subscribers only. The text above is this page’s own restatement and all examples are our own; the official page is authoritative.')

steps = [
    ('先拆一次', 'Split one by hand'),
    ('搜索太慢，贪心会错', 'Search is slow, greedy is wrong'),
    ('是什么逼出了很多条序列', 'What forces many sequences'),
    ('像发牌一样分，证明够用', 'Deal like cards to show it is enough'),
    ('在你的输入上走一遍', 'Run it on your own input'),
    ('先预测再揭晓', 'Predict, then reveal'),
    ('对应到 Python', 'Map to Python'),
]
for i, (zh, en) in enumerate(steps, 1):
    c(f'nav{i}', f'{i} · {zh}', f'{i} · {en}')
    c(f'h{i}', f'{i}. {zh}', f'{i}. {en}')

# Step 1
c('p1', '这一步回答：一个合格的拆法长什么样？取 nums = [1, 1, 2, 2, 3, 4]，k = 3。“严格递增”意味着同一条序列里不能有两个相等的数，所以两个 1 必须分在不同的序列里。先自己试着拆，再展开答案。',
  'What does a valid split look like? Take nums = [1, 1, 2, 2, 3, 4] and k = 3. “Strictly increasing” means no sequence may hold two equal numbers, so the two 1s must go to different sequences. Try a split yourself, then open the answer.')
c('handSummary', '展开一种拆法', 'Show one split')
c('handAnswer', '[1, 2, 3] 和 [1, 2, 4]：两条都严格递增，长度都是 3 ≥ k，所以答案是 true。注意 [1, 2, 3, 4] + [1, 2] 不行——第二条只有 2 个数。',
  '[1, 2, 3] and [1, 2, 4]: both strictly increasing, both of length 3 ≥ k, so the answer is true. Note that [1, 2, 3, 4] + [1, 2] does not work — the second sequence has only 2 numbers.')

# Step 2
c('p2', '这一步回答：最直接的两种做法为什么不行？',
  'Why do the two most direct approaches fail?')
c('bruteText', '搜索：把每个元素依次放进某条已有序列的末尾（要比末尾大），或者另起一条，最后检查长度。正确，但分法的数量爆炸：6 个元素分组的方式就有 203 种（贝尔数），20 个元素超过 5 × 10¹³ 种。n 可达 10⁵，不可能逐一尝试。',
  'Search: place each element at the end of some existing sequence (it must exceed the last value) or start a new one, then check lengths at the end. Correct, but the number of splits explodes: 6 elements can be grouped in 203 ways (a Bell number) and 20 elements in more than 5 × 10¹³. With n up to 10⁵, trying them is hopeless.')
c('greedyText', '贪心：先拿出最长的一条（每个不同的值各取一个），剩下的再重复。在 [1, 1, 2, 2, 3, 4]、k = 3 上，它先拿 [1, 2, 3, 4]，剩下 [1, 2] 只有 2 个——于是贪心说 false。可第 1 步已经找到了 true 的拆法。错在哪里？第一条拿得太长，把后面那条需要的 3 和 4 都吃掉了。长度是可以“匀”给别的序列的。',
  'Greedy: take out the longest sequence first (one copy of every distinct value), then repeat on what remains. On [1, 1, 2, 2, 3, 4] with k = 3 it takes [1, 2, 3, 4] and leaves [1, 2], only 2 long — so greedy says false. Yet step 1 found a split that works. What went wrong? The first sequence was too greedy and ate the 3 and the 4 the other sequence needed. Length can be shared out between sequences.')
c('q2', '既然长度可以匀，真正卡住我们的是什么？下一步看一个答案是 false 的例子。',
  'If length can be shared out, what actually blocks us? The next step looks at an example whose answer is false.')

# Step 3
c('p3', '这一步回答：什么情况下无论怎么拆都不行？看 nums = [1, 1, 1, 2, 3, 4, 5, 6]，k = 3。',
  'When is every split doomed? Look at nums = [1, 1, 1, 2, 3, 4, 5, 6] with k = 3.')
c('lowerAsk', '三个 1 必须在三条不同的序列里，所以至少要 3 条序列。每条至少 3 个数，总共至少需要多少个数？数组里有几个？',
  'The three 1s must sit in three different sequences, so there are at least 3 sequences. Each needs at least 3 numbers: how many numbers are needed in total, and how many does the array have?')
c('lowerSummary', '展开', 'Open')
c('lowerAnswer', '至少 3 × 3 = 9 个，但只有 8 个，所以不可能——不必尝试任何拆法。',
  'At least 3 × 3 = 9, but there are only 8, so it is impossible — no split needs to be tried.')
c('lowerRule', '一般地，设出现次数最多的那个值出现了 f 次（下文叫“最大重复次数”）。这 f 个相等的数两两不能同在一条序列里，所以至少有 f 条序列；每条至少 k 个，于是必须有 f × k ≤ n。这是一个必要条件。',
  'In general, let the most repeated value appear f times (the maximum multiplicity). Those f equal numbers must all be in different sequences, so there are at least f sequences; each needs at least k numbers, so f × k ≤ n is required. That is a necessary condition.')
c('freqCaption', '当前输入（第 5 步可修改）的每个值出现次数：', 'How often each value appears in the current input (editable in step 5):')
c('freqRead', '最大重复次数 f = {f}（值 {v}），f × k = {need}，n = {n}。', 'Maximum multiplicity f = {f} (value {v}); f × k = {need}; n = {n}.')
c('q3', '关键问题：反过来，只要 f × k ≤ n，就一定能拆吗？第 1 步的例子 f = 2、k = 3、n = 6 恰好能拆。是巧合吗？',
  'The key question: conversely, whenever f × k ≤ n, is a split always possible? Step 1’s example has f = 2, k = 3, n = 6 and it does split. Coincidence?')

# Step 4
c('p4', '这一步回答：f × k ≤ n 时怎样真正造出一个拆法？像发牌一样：准备 f 堆，按排好的顺序把第 i 个数放进第 i mod f 堆（i 从 0 数起）。',
  'How do we actually build a split when f × k ≤ n? Deal like cards: make f piles and put the i-th number, in sorted order, onto pile i mod f (counting i from 0).')
c('dealExample', '例：[1, 2, 2, 2, 3, 3, 4, 5, 6]，f = 3（三个 2），k = 3。发牌得到 第 0 堆 [1, 2, 4]，第 1 堆 [2, 3, 5]，第 2 堆 [2, 3, 6]。三个 2 正好落进三个不同的堆。',
  'Example: [1, 2, 2, 2, 3, 3, 4, 5, 6], f = 3 (three 2s), k = 3. Dealing gives pile 0 [1, 2, 4], pile 1 [2, 3, 5], pile 2 [2, 3, 6]. The three 2s land on three different piles.')
c('why1', '为什么每堆严格递增：数组已排序，相等的数挨在一起，至多 f 个连续位置；连续 f 个位置除以 f 的余数各不相同，所以相等的数进了不同的堆。每堆按从左到右的顺序收到的数不减，又没有相等的，所以严格递增。',
  'Why every pile is strictly increasing: the array is sorted, so equal numbers sit together in at most f consecutive positions; f consecutive positions have different remainders mod f, so equal numbers go to different piles. Each pile receives numbers left to right, which never decrease and are never equal, so it strictly increases.')
c('why2', '为什么每堆至少 k 个：n 个数轮流发给 f 堆，最少的一堆也有 ⌊n / f⌋ 个；因为 n ≥ f × k，⌊n / f⌋ ≥ k。',
  'Why every pile has at least k numbers: dealing n numbers round-robin over f piles gives the smallest pile ⌊n / f⌋ of them; since n ≥ f × k, ⌊n / f⌋ ≥ k.')
c('conclusion', '于是答案只取决于一个比较：f × k ≤ n。必要（重复的数逼出 f 条序列）且充分（发牌造出拆法）。第 2 步的贪心错在把序列拉长，这里反过来让 f 条序列尽量一样长。',
  'So the answer depends on one comparison: f × k ≤ n. Necessary (repeated numbers force f sequences) and sufficient (dealing builds a split). Step 2’s greedy went wrong by making one sequence long; here the f sequences are kept as equal in length as possible.')

# Step 5
c('p5', '这一步回答：在任意输入上，计数、比较和发牌是怎样一步步进行的？阶段 1 从左到右数相等数字的连续段（数组有序，相等的数相邻）；阶段 2 做比较；阶段 3 发牌，作为构造的证据（不论成败都发，看最短的一堆）。',
  'How do counting, comparing and dealing proceed on any input? Phase 1 measures runs of equal numbers from left to right (the array is sorted, so equal numbers are adjacent); phase 2 compares; phase 3 deals, as evidence for the construction (dealt either way, so you can see the shortest pile).')
c('numsLabel', 'nums（1 到 24 个 1–99 的整数，非递减，用逗号分隔）', 'nums (1 to 24 integers from 1–99, non-decreasing, comma-separated)')
c('kLabel', 'k（1 到 nums 长度）', 'k (1 to len(nums))')
c('apply', '应用（从头开始）', 'Apply (restarts)')
c('presetLabel', '或选一个例子（选择后从头开始）：', 'Or choose an example (restarts):')
c('err_length', '需要 1 到 24 个数；显示内容保持不变。', 'Enter 1 to 24 numbers; the display is unchanged.')
c('err_value', '每个数须是 1 到 99 的整数；显示内容保持不变。', 'Every number must be a whole number from 1 to 99; the display is unchanged.')
c('err_sorted', '题目保证 nums 非递减，请按从小到大输入；显示内容保持不变。', 'The problem guarantees nums is non-decreasing; enter it in order. The display is unchanged.')
c('err_k', 'k 须是 1 到 nums 长度之间的整数；显示内容保持不变。', 'k must be a whole number from 1 to the length of nums; the display is unchanged.')
c('sim', '这是用 JavaScript 写的教学模拟，与下方 Python 的计数相同，并额外演示发牌构造；它不执行 Python。为了能后退，它保存每一步的快照。',
  'This is a teaching simulation in JavaScript: the counting matches the Python below, and it additionally demonstrates the dealing construction. It does not execute Python. To allow going back it keeps a snapshot of every action.')
c('prev', '退回一步', 'Previous action')
c('next', '完成下一步', 'Complete next action')
c('reset', '回到开头', 'Back to start')
c('end', '完成全部', 'Complete all')
c('progress', '已完成 {i}/{total} 步。', '{i}/{total} actions completed.')
c('arrayLabel', 'nums（▲ 当前位置；下方小字是当前连续段长度或所进的堆）', 'nums (▲ current position; small text is the current run length or the pile it went to)')
c('mRun', '当前连续段长度', 'Current run length')
c('mMost', '最大重复次数 f（到目前为止）', 'Max multiplicity f so far')
c('mAnswer', '答案', 'Answer')
c('pending', '尚未完成', 'not finished')
c('pilesTitle', '发牌得到的堆', 'Piles from dealing')
c('pileLabel', '第 {p} 堆（{len} 个）', 'Pile {p} ({len})')
c('noPiles', '阶段 3 才开始发牌。', 'Dealing starts in phase 3.')
c('greedyLabel', '对比：第 2 步的贪心（先拿最长链）会得到 {chains}，判断为 {ok}。', 'Compare: step 2’s greedy (longest chain first) gives {chains} and answers {ok}.')
c('evStart', '开始：n = {n}，k = {k}。阶段 1 从左到右数连续相等的段。', 'Start: n = {n}, k = {k}. Phase 1 measures runs of equal numbers from left to right.')
c('evCountNew', '阶段 1 · 位置 {i}：值 {v} 与前一个不同，连续段重新从 1 开始。f 仍为 {f}。', 'Phase 1 · position {i}: value {v} differs from the previous one, so the run restarts at 1. f stays {f}.')
c('evCountSame', '阶段 1 · 位置 {i}：值 {v} 与前一个相同，连续段变为 {run}。f 为 {f}。', 'Phase 1 · position {i}: value {v} equals the previous one, so the run becomes {run}. f is {f}.')
c('evCountGrew', '阶段 1 · 位置 {i}：值 {v} 的连续段为 {run}，超过之前的最大值，f 更新为 {f}。', 'Phase 1 · position {i}: value {v} has a run of {run}, beating the previous maximum, so f becomes {f}.')
c('evBoundOk', '阶段 2：f × k = {f} × {k} = {need} ≤ n = {n}，答案为 true。接下来发牌，造出一个拆法作为证据。', 'Phase 2: f × k = {f} × {k} = {need} ≤ n = {n}, so the answer is true. Next we deal, building a split as evidence.')
c('evBoundNo', '阶段 2：f × k = {f} × {k} = {need} > n = {n}，答案为 false：至少要 {f} 条序列，却凑不出 {need} 个数。仍然发一次牌，看看差在哪里。', 'Phase 2: f × k = {f} × {k} = {need} > n = {n}, so the answer is false: at least {f} sequences are needed but {need} numbers are not available. We still deal once to see where it falls short.')
c('evDeal', '阶段 3 · 位置 {i}：值 {v} 发到第 {p} 堆（{i} mod {f} = {p}）。', 'Phase 3 · position {i}: value {v} goes to pile {p} ({i} mod {f} = {p}).')
c('evFinalOk', '完成：{f} 堆长度为 {lengths}，最短 {s} ≥ k = {k}，每堆都严格递增。返回 true。', 'Done: the {f} piles have lengths {lengths}; the shortest, {s}, is ≥ k = {k}, and every pile is strictly increasing. Return true.')
c('evFinalNo', '完成：{f} 堆长度为 {lengths}，最短 {s} < k = {k}。任何拆法都至少需要 {f} 条序列，而 {f} × {k} > {n}，所以返回 false。', 'Done: the {f} piles have lengths {lengths}; the shortest, {s}, is < k = {k}. Any split needs at least {f} sequences and {f} × {k} > {n}, so return false.')
c('trueWord', 'true', 'true')
c('falseWord', 'false', 'false')
c('boundaries', '边界：k = 1 时永远是 true（每个数自成一条也行，f × 1 ≤ n）；所有数都相同时 f = n，只有 k = 1 才行；所有数都不同时 f = 1，整个数组就是一条递增序列，k ≤ n 总成立。“非递减”这个前提很要紧：发牌依赖相等的数相邻、每堆按顺序收到不减的数。',
  'Boundaries: k = 1 is always true (every number alone is a sequence, and f × 1 ≤ n); when all numbers are equal, f = n, so only k = 1 works; when all are distinct, f = 1 and the whole array is one increasing sequence, so k ≤ n always holds. The “non-decreasing” guarantee matters: dealing relies on equal numbers being adjacent and on each pile receiving non-decreasing numbers in order.')

# Step 6
c('p6', '这一步检验：nums = [1, 2, 2, 3, 3, 3, 4, 5, 6, 7]，k = 3。答案是什么？', 'Check yourself: nums = [1, 2, 2, 3, 3, 3, 4, 5, 6, 7], k = 3. What is the answer?')
c('choose', '这个输入能拆成每条至少 3 个的严格递增序列吗？', 'Can this input be split into strictly increasing sequences of length at least 3?')
c('opt0', 'false：3 出现 3 次，n = 10 不是 3 的倍数', 'false: 3 appears 3 times and n = 10 is not a multiple of 3')
c('opt1', 'true', 'true')
c('opt2', 'false：先拿最长链 [1..7] 后，剩下的 [2, 3, 3] 不递增', 'false: after taking the longest chain [1..7], the rest [2, 3, 3] is not increasing')
c('reveal', '揭晓', 'Reveal')
c('await', '先选一个答案，再按“揭晓”。', 'Choose an answer, then press Reveal.')
c('correct', '正确。', 'Correct.')
c('wrong0', '不需要整除：堆的长度可以不一样，只要最短的一堆 ≥ k。', 'No divisibility is needed: piles may differ in length as long as the shortest is ≥ k.')
c('wrong2', '这是第 2 步的贪心错误：一条拿得太长，另外的就不够了。', 'That is step 2’s greedy mistake: one sequence takes too much and leaves the others short.')
c('answer', 'f = 3（三个 3），3 × 3 = 9 ≤ 10，所以是 true。发牌：[1, 3, 4, 7]、[2, 3, 5]、[2, 3, 6]。',
  'f = 3 (three 3s), 3 × 3 = 9 ≤ 10, so true. Dealing gives [1, 3, 4, 7], [2, 3, 5], [2, 3, 6].')

# Step 7
c('p7', '这一步回答：代码的每一行来自哪一步，代价多少？接口是 Solution.canDivideIntoSubsequences(nums, k) -> bool。',
  'Which step does each line come from, and what does it cost? The interface is Solution.canDivideIntoSubsequences(nums, k) -> bool.')
c('map1', 'run 和 most：第 5 步阶段 1。因为 nums 有序，相等的数相邻，所以“某个值出现几次”就是“它的连续段有多长”，不需要字典。', 'run and most: phase 1 of step 5. Because nums is sorted, equal numbers are adjacent, so “how often a value appears” is “how long its run is” — no dictionary needed.')
c('map2', 'return most * k <= len(nums)：第 3 步的必要条件，加上第 4 步发牌证明的充分性。发牌本身不需要写进代码——它只是证明。', 'return most * k <= len(nums): step 3’s necessary condition, with sufficiency proved by step 4’s dealing. The dealing itself need not be coded — it is only the proof.')
c('cost', '代价：一次从左到右扫描，O(n) 时间；只存 run 和 most 两个整数，O(1) 额外空间。对比：搜索所有拆法是指数级的。', 'Cost: one left-to-right scan, O(n) time; only two integers, run and most, so O(1) extra space. Compare: searching all splits is exponential.')
c('interfaceNote', '接口名与公开的题解仓库（doocs/leetcode、walkccc）一致；官方页面需订阅，未能直接核对。', 'The method name matches public solution repositories (doocs/leetcode, walkccc); the official page is subscriber-only and could not be checked directly.')
c('source', '查看 Python 源码', 'View Python source')
c('copy', '复制 Python', 'Copy Python')
c('download', '下载 solution.py', 'Download solution.py')
c('copied', '已复制。', 'Copied.')
c('manual', '无法写入剪贴板；已在下面选中全文，请按 Ctrl/Cmd+C。', 'Clipboard unavailable; the full source is selected below — press Ctrl/Cmd+C.')
c('manualLabel', '完整源码（手动复制）', 'Full source (copy manually)')
c('related', '相关概念', 'Related concepts')
c('link1', '必要条件：重复的数逼出多条序列 → 本页第 3 步', 'Necessary condition: repeats force many sequences → step 3 here')
c('link2', '充分性：发牌构造 → 本页第 4 步', 'Sufficiency: the dealing construction → step 4 here')

out = 'window.COPY = ' + json.dumps(pairs, ensure_ascii=False, indent=2) + ';\n'
(R / 'copy.js').write_text(out)
print(len(pairs), 'keys')
