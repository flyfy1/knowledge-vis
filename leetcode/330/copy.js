window.LESSON_COPY = {
  "docTitle": [
    "330 · 按要求补齐数组",
    "330 · Patching Array"
  ],
  "title": [
    "#330 · 按要求补齐数组",
    "#330 · Patching Array"
  ],
  "back": [
    "← 知识索引",
    "← Knowledge Index"
  ],
  "collection": [
    "LeetCode 讲解集",
    "LeetCode lessons"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "hard": [
    "困难",
    "Hard"
  ],
  "intro": [
    "你手里只有 1 和 3，各用一次，怎样用最少的新数字组成 1 到 6 的每个整数？",
    "You have 1 and 3, each usable once. What is the fewest new numbers needed to form every integer from 1 to 6?"
  ],
  "constraints": [
    "目标是用所选元素的和组成 1..n 的每个整数，n 是目标上界。官方约束：已升序排列的正整数数组；1 ≤ 长度 ≤ 1000，nums[i] ≤ 10000，1 ≤ n ≤ 2³¹−1。返回补入元素的最少个数。",
    "The goal is to form each integer 1..n by adding chosen elements; n is the target upper limit. Official constraints: sorted positive integers; length 1–1000, nums[i] ≤ 10000, 1 ≤ n ≤ 2³¹−1. Return the minimum number of inserted elements."
  ],
  "nav0": [
    "1 · 亲手凑数",
    "1 · Make the sums"
  ],
  "nav1": [
    "2 · 两段覆盖",
    "2 · Two intervals"
  ],
  "nav2": [
    "3 · 逐步补齐",
    "3 · Patch by patch"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav4": [
    "5 · 写成代码",
    "5 · Implement"
  ],
  "s0t": [
    "哪些数字现在凑不出来？",
    "Which sums are missing?"
  ],
  "s0e": [
    "子集和就是选出一些元素相加；每个位置的元素最多选一次，不要求位置相邻。补数（patch）是插入一个正整数。对 nums=[1,3]，不选得 0，选一个得 1 或 3，全选得 4。所以目标 [1,6] 中缺 2、5、6。每个目标可重新选择元素，并不消耗下一个目标的元素。",
    "A subset sum adds chosen elements, using each array occurrence at most once; positions need not be adjacent. A patch inserts one positive integer. With nums=[1,3], choosing nothing gives 0, one element gives 1 or 3, and both give 4. Thus 2, 5 and 6 are missing from [1,6]. Each target gets its own choice of elements; forming one target does not consume elements for another."
  ],
  "handTask": [
    "保持 nums=[1,3]、n=6 不变，试选一个补数，逐格看每个和的组成。补 2 后：2=2，5=2+3，6=1+2+3。原来有缺口，补一次就全覆盖，所以最少恰好是 1。",
    "Keep nums=[1,3] and n=6 fixed. Try one patch and inspect each sum’s witness. With patch 2: 2=2, 5=2+3, 6=1+2+3. There was a gap before, and one patch covers everything, so the minimum is exactly 1."
  ],
  "handLabel": [
    "试补一个数（只改变本实验）",
    "Try one patch (changes only this experiment)"
  ],
  "noPatch": [
    "不补数",
    "No patch"
  ],
  "possible": [
    "{s} · 可组成",
    "{s} · Reachable"
  ],
  "missing": [
    "{s} · 缺口",
    "{s} · Missing"
  ],
  "noWitness": [
    "没有可选的组合",
    "No subset makes this sum"
  ],
  "handRead": [
    "当前元素：[{items}]；[1,6] 中已覆盖 {count}/6 个目标。",
    "Current elements: [{items}]; {count}/6 targets in [1,6] are reachable."
  ],
  "baseline": [
    "一个正确的基线：先枚举 0 个补数，再枚举 1 个、2 个……；补数只需在 1..n 内选，允许重复。对每种候选，枚举全部子集并检查 1..n 是否都出现。第一个成功的补数个数就是最优值。但原数组的 m 个元素加上 k 个补数，共有 2^(m+k) 个子集，补数候选组合也迅速增多；n 最大约 21 亿，不能逐个检查目标。我们需要保存“连续覆盖到哪里”，而不是所有子集。",
    "A correct baseline tries zero patches, then one, two, and so on. Enumerate patch multisets from 1..n, allowing duplicates. For each candidate, enumerate every subset and check whether all targets 1..n appear. The first successful patch count is minimal. But m original elements plus k patches have 2^(m+k) subsets, and patch combinations also multiply. With n near 2.1 billion, checking each target is too costly. We need to remember the extent of uninterrupted coverage instead of all subsets."
  ],
  "s1t": [
    "一个新数能把连续覆盖延长多少？",
    "How far can one new value extend coverage?"
  ],
  "s1e": [
    "现在只改一个条件：已有元素是 [1,2]，能组成 [0,3] 的所有整数。加入 x 后，不用 x 的和仍在 [0,3]；使用 x 的和是把旧和全部加 x，恰好得到 [x,x+3]。两段没有空隙的条件是 x≤4。比如 x=3 得到 [0,6]，x=4 得到 [0,7]，而 x=5 漏掉 4。",
    "Change just one condition: the available elements are [1,2], which form every integer in [0,3]. After adding x, sums without x still fill [0,3]. Sums using x add x to each old sum, filling [x,x+3]. The intervals have no gap exactly when x≤4. For x=3 they cover [0,6]; x=4 covers [0,7]; x=5 misses 4."
  ],
  "xTask": [
    "只改变新数 x，观察两个区间和下面的实际和。比较 x=3、4、5：最远的无缺口延伸是哪一个？",
    "Change only x and inspect both intervals and the actual sums below. Compare x=3, 4 and 5: which gives the farthest extension without a gap?"
  ],
  "xLabel": [
    "加入 [1,2] 的新数 x",
    "New value x added to [1,2]"
  ],
  "oldInterval": [
    "不用 x：旧区间",
    "Without x: old interval"
  ],
  "newInterval": [
    "使用 x：平移后的区间",
    "Using x: shifted interval"
  ],
  "joined": [
    "x={x} ≤ 4：两段相接或重叠，连续覆盖到 {end}。",
    "x={x} ≤ 4: the intervals touch or overlap, covering every sum through {end}."
  ],
  "gapRead": [
    "x={x} > 4：第一段止于 3，第二段从 {x} 开始；4 仍无法组成。",
    "x={x} > 4: the first interval ends at 3 and the second starts at {x}; 4 is still missing."
  ],
  "derive": [
    "把第一个未覆盖的正整数叫作 miss。刚才 miss=4：旧区间是 [0,miss−1]，新数 x 产生 [x,x+miss−1]。当 x≤miss，两段合成 [0,miss+x−1]，新的 miss=旧 miss+x。这就是循环不变式：每次操作前后，都能组成 [0,miss) 中的每个整数（右端 miss 不包含在内），只使用已处理元素。",
    "Call the first uncovered positive sum miss. Above, miss=4: the old interval is [0,miss−1], and value x produces [x,x+miss−1]. When x≤miss, they join into [0,miss+x−1], so new miss = old miss + x. This yields a loop invariant: before and after every operation, the processed elements form every integer in [0,miss), excluding the right endpoint miss."
  ],
  "greedy": [
    "若下一个原数 ≤miss，免费使用它；若它 >miss，后面原数因已排序也都更大，正数相加不可能补出 miss，必须插入某个 ≤miss 的数。贪心选择（每次取最大的安全扩展）就是插入 miss，使新 miss=2×旧 miss。选择比 miss 大的数会留下 miss；选择更小的数虽能接上，却延伸得更短。",
    "If the next original value is ≤miss, consume it for free. If it is >miss, all later original values are also larger because the input is sorted; sums of positive values cannot fill miss. Some patch ≤miss is necessary. The greedy choice—the largest safe immediate extension—is miss itself, making new miss twice the old value. A larger patch leaves miss uncovered; a smaller patch joins the intervals but extends them less."
  ],
  "proof": [
    "为什么局部选择不会吃亏？先把所有可接上的原数免费用完。任何成功方案都必须用一个 ≤miss 的补数来填当前缺口；把这个补数换成 miss，用相同一次插入就覆盖至少同样长的前缀。原来能接上的后续原数和补数仍能接上，因为覆盖上界只会更大。逐次这样替换就得到贪心方案，补数个数不增加。起初 miss=1（只有空集的 0）；最终 miss>n 时全部目标已覆盖。",
    "Why is the local choice globally safe? First consume all original values that can extend coverage for free. Every successful plan must use a patch ≤miss to close the current gap. Replacing that patch with miss covers at least as long a prefix with the same one insertion. Any later original value or patch that could extend the old prefix can still extend this larger one. Repeating this replacement produces the greedy plan without increasing its patch count. Initially miss=1 because only the empty sum 0 is covered; when miss>n, every target is covered."
  ],
  "wrong": [
    "容易误判：只看总和是否 ≥n。[1,4] 的总和是 5，却无法组成 2；更大的元素也不能修复这个小缺口。必须要求“每个整数都可组成”，而不是只有最远的一个和。",
    "Tempting mistake: check only whether the total sum is ≥n. The sum of [1,4] is 5, but 2 is impossible; larger elements cannot fix that small gap. We need every integer to be reachable, not just one large sum."
  ],
  "s2t": [
    "每次消费或补数后，边界如何改变？",
    "What changes after each consume or patch?"
  ],
  "traceTask": [
    "miss 是只用已处理元素时，第一个未覆盖的和；i 是已消费的原数组元素数；patches 是已插入个数。选择预设会从头开始本实验。先读“操作前”，再执行一次操作，对照“操作后”和累计记录。灰色虚线的缺口只在前面的逐和实验使用；这里的区间数字是精确值，不按长度绘图。",
    "miss is the first sum not covered by processed elements; i counts consumed original elements; patches counts inserted elements. Changing the preset restarts this experiment. Read “before,” apply one operation, then compare “after” and the retained ledger. Dashed missing-sum tiles belong to the earlier experiments; here interval endpoints are exact numbers, not lengths drawn to scale."
  ],
  "sim": [
    "可视化是 JavaScript 状态模拟，不是在浏览器执行下方的 Python。每帧是一次完整操作之后；第 0 帧还未操作。所有操作均保留，没有省略。",
    "This is a JavaScript state simulation, not execution of the Python below. Each frame follows one complete operation; frame 0 is before the loop. Every operation is retained, with no omissions."
  ],
  "presetLabel": [
    "输入预设（更换会重启）",
    "Input preset (changing restarts)"
  ],
  "p0": [
    "[1,3]；n=6 · 手算",
    "[1,3]; n=6 · Hand example"
  ],
  "p1": [
    "[1,5,10]；n=20 · 连补两次",
    "[1,5,10]; n=20 · Two patches"
  ],
  "p2": [
    "[1,2,2]；n=5 · 重复值",
    "[1,2,2]; n=5 · Duplicates"
  ],
  "p3": [
    "[2]；n=8 · 缺少 1",
    "[2]; n=8 · Missing 1"
  ],
  "p4": [
    "[1]；n=1 · 最小目标",
    "[1]; n=1 · Smallest target"
  ],
  "p5": [
    "[10000]；n=2147483647 · 最大目标",
    "[10000]; n=2147483647 · Maximum target"
  ],
  "prev": [
    "← 撤回一步",
    "← Undo one operation"
  ],
  "next": [
    "执行一次消费 / 补数 →",
    "Apply one consume / patch →"
  ],
  "reset": [
    "重置本实验",
    "Reset this experiment"
  ],
  "last": [
    "跳到完整结果",
    "Show complete result"
  ],
  "inputRead": [
    "nums=[{nums}]；n={n}；待处理原数：{pending}",
    "nums=[{nums}]; n={n}; pending original values: {pending}"
  ],
  "none": [
    "无",
    "none"
  ],
  "frame": [
    "已完成 {at}/{total} 次操作；miss={miss}，i={i}，patches={patches}。",
    "Completed {at}/{total} operations; miss={miss}, i={i}, patches={patches}."
  ],
  "beforeLabel": [
    "操作前：已连续覆盖",
    "Before: complete coverage"
  ],
  "afterLabel": [
    "操作后：已连续覆盖",
    "After: complete coverage"
  ],
  "initial": [
    "尚未操作。已处理元素为空，只能组成空集和 0，miss=1。",
    "No operation yet. With no processed elements, only the empty sum 0 is reachable, so miss=1."
  ],
  "consumeRead": [
    "下一个原数 {x} ≤ 操作前 miss={before}：消费它，miss={before}+{x}={miss}，补数个数不变。",
    "Next original value {x} ≤ before-miss {before}: consume it; miss={before}+{x}={miss}, with no added patch."
  ],
  "patchRead": [
    "待处理原数大于 {before} 或已耗尽：插入 {x}，miss={before}+{x}={miss}，补数个数加 1。",
    "The next original value is greater than {before}, or none remains: insert {x}; miss={before}+{x}={miss}, adding one patch."
  ],
  "done": [
    "结束：miss={miss} > n={n}；最少补 {patches} 个数。剩余原数无需再消费。",
    "Finished: miss={miss} > n={n}; the minimum is {patches} patches. Remaining original values need not be consumed."
  ],
  "ledgerTitle": [
    "累计操作记录（每行是完成后的状态）",
    "Operation ledger (each row is a completed state)"
  ],
  "ledgerHint": [
    "窄屏可横向滚动表格；每行同时保留旧边界和新边界。",
    "On narrow screens, scroll the table horizontally. Every row retains both the old and new boundaries."
  ],
  "empty": [
    "还没有操作。",
    "No operations yet."
  ],
  "order": [
    "次数",
    "Operation"
  ],
  "oldMiss": [
    "旧 miss",
    "Old miss"
  ],
  "action": [
    "本次动作",
    "Action"
  ],
  "newMiss": [
    "新 miss",
    "New miss"
  ],
  "patchCount": [
    "累计补数",
    "Patches so far"
  ],
  "consume": [
    "消费原数 {x}",
    "Consume original {x}"
  ],
  "patch": [
    "插入 {x}",
    "Patch {x}"
  ],
  "s3t": [
    "新数组的最少补数是多少？",
    "How many patches does a new array need?"
  ],
  "s3e": [
    "独立练习：nums=[1,2,7]，n=10。miss 表示第一个无法组成的正整数。先在心里推进完整过程，再选择最少补数个数并揭晓；本题与上面的预设互不影响。",
    "Independent exercise: nums=[1,2,7], n=10. miss is the first positive sum you cannot form. Work through the whole process mentally, then choose the minimum patch count and reveal. This exercise is independent of the presets above."
  ],
  "legend": [
    "最少要补几个数？",
    "How many patches are necessary?"
  ],
  "reveal": [
    "核对并解释",
    "Check and explain"
  ],
  "await": [
    "先选择，再核对；答案尚未揭晓。",
    "Choose first, then check; the answer is still hidden."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还不对。",
    "Not quite."
  ],
  "answer": [
    "最少 1 个：消费 1、2 后 miss=4；7>4，必须补一个 ≤4 的数。补 4 后 miss=8，再消费 7 得 miss=15>10。0 个只看到了总和 10，却忽略了 4；2 个可以是先补 1（miss=5）再补 5（miss=10），但比直接补 4 多用了一次；补 4 同时也产生 5、6、7。",
    "The minimum is 1. Consuming 1 and 2 gives miss=4. Since 7>4, at least one patch ≤4 is needed. Patch 4 to reach miss=8, then consume 7 to reach miss=15>10. Choosing 0 mistakes a large total (10) for continuous coverage and misses 4; choosing 2 could patch 1 (miss=5) and then 5 (miss=10), but uses an extra insertion compared with patching 4, which also creates 5, 6 and 7."
  ],
  "s4t": [
    "怎样把覆盖证明写成 Python？",
    "How does the coverage proof become Python?"
  ],
  "s4e": [
    "官方 Python3 接口为 Solution.minPatches(nums, n)，返回最少插入个数。代码不修改 nums。miss 表示只用已处理元素能连续覆盖 [0,miss)；i 指向下一个原数，patches 只在真正插入时增加。",
    "The official Python3 interface is Solution.minPatches(nums, n), returning the minimum insertion count. The code leaves nums unchanged. miss describes complete coverage [0,miss) using processed elements; i points to the next original value, and patches increases only for an insertion."
  ],
  "map1": [
    "初始化 miss=1、i=0、patches=0；while miss<=n 意味着目标里仍有缺口。miss>n 就停止，不能误写为 miss>=n。",
    "Initialize miss=1, i=0, patches=0. while miss<=n means some target is still uncovered. Stop when miss>n; stopping at miss>=n would be premature."
  ],
  "map2": [
    "if i<len(nums) and nums[i]<=miss 对应免费消费：miss+=nums[i] 后 i+=1。等号必须保留：原数恰好等于缺口时也能接上。",
    "if i<len(nums) and nums[i]<=miss is the free-consume branch: miss+=nums[i], then i+=1. Keep the equality: an original value equal to the gap also joins the intervals."
  ],
  "map3": [
    "else 对应补入旧 miss：miss+=miss，同时 patches+=1，但 i 不动。例如 [1,3] 消费 1 后 miss=2；补 2 得 miss=4；再消费 3 得 miss=7，返回 1。",
    "else inserts the old miss: miss+=miss and patches+=1, leaving i unchanged. For [1,3], consuming 1 gives miss=2; patching 2 gives miss=4; consuming 3 gives miss=7. Return 1."
  ],
  "cost": [
    "令 m=len(nums)。每个原数至多消费一次，每次补数使 miss 翻倍，因此时间 O(m+log n)，额外空间 O(1)（按官方固定整数范围的算术计）。最多补 31 次；Python 整数不会发生 32 位溢出。教学模拟为保留逐帧历史使用 O(T²) 条记录，T 是操作次数；这不是提交代码的空间。",
    "Let m=len(nums). Each original value is consumed at most once; each patch doubles miss. Time is O(m+log n), with O(1) auxiliary space under the official fixed integer bounds. At most 31 patches are needed; Python integers avoid 32-bit overflow. The teaching simulation retains O(T²) ledger entries across snapshots, where T is the number of operations; this is not the submission’s space usage."
  ],
  "boundaries": [
    "边界：缺少 1 时必须先补 1；重复值按不同位置各用一次（[1,2,2] 无需补数）；原数耗尽后继续翻倍补数；n=1 时只需能组成 1；miss>n 后可忽略剩余原数。官方输入非空、正数且已排序；本实现不负责验证或排序任意输入。",
    "Boundaries: if 1 is absent, patch 1 first. Duplicate occurrences are each usable once ([1,2,2] needs no patches). After originals run out, keep doubling with patches. For n=1, only 1 must be reachable. Once miss>n, ignore remaining originals. Official inputs are nonempty, positive and sorted; this implementation does not validate or sort arbitrary inputs."
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "source": [
    "查看官方接口的完整解法",
    "Inspect the complete official-interface solution"
  ],
  "copied": [
    "已复制完整源代码。",
    "Complete source copied."
  ],
  "fallback": [
    "剪贴板不可用，请在下方选中源代码手动复制。",
    "Clipboard unavailable. Select the source below and copy it manually."
  ],
  "manual": [
    "手动复制源代码",
    "Source for manual copying"
  ],
  "related1": [
    "重看：连续覆盖的证明",
    "Revisit the coverage proof"
  ],
  "related2": [
    "分发糖果：比较另一种贪心证明",
    "Candy: compare another greedy proof"
  ],
  "language": [
    "选择语言",
    "Choose language"
  ],
  "navigation": [
    "讲解步骤",
    "Lesson steps"
  ],
  "verify": [
    "自查方法：离线实际调用 Solution().minPatches；独立的广度优先搜索枚举可达和集合及每一种补数，求小输入的最少插入个数，再与 Python 和网页模拟对照。另检查中间覆盖区间、输入不变性及最大边界。",
    "Self-check method: execute Solution().minPatches offline. An independent breadth-first search enumerates reachable-sum sets and every possible patch to find the minimum on small inputs, then compares with Python and the browser model. Also check intermediate coverage, input immutability and maximum boundaries."
  ],
  "foot": [
    "作者自查候选；独立评审待进行。数值测试与浏览器模拟不代表 LeetCode 已接受提交，也不代表真实学习者已掌握。",
    "Author self-checked candidate; independent review pending. Computational tests and browser simulations do not establish LeetCode acceptance or actual learner understanding."
  ],
  "baselineSource": [
    "小输入的穷举基线（不能用于大约束）",
    "Tiny-input exhaustive baseline (does not scale)"
  ],
  "baselineGuide": [
    "这里 k 是候选补数个数。combinations_with_replacement 枚举允许重复的补数组合；product 枚举每个元素的“选 / 不选”。sums 收集这些和，all 检查每个目标。最多试到 n 个 1 就一定成功。",
    "Here k is the trial patch count. combinations_with_replacement enumerates patch multisets, allowing duplicates; product enumerates whether to choose each element. sums collects their sums, and all checks every target. Trying up to n copies of 1 guarantees a solution."
  ]
};
