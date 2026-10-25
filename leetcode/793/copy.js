window.LESSON_COPY = {
  "docTitle": [
    "#793 · 阶乘函数后 K 个零",
    "#793 · Preimage Size of Factorial Zeroes Function"
  ],
  "title": [
    "#793 · 阶乘函数后 K 个零",
    "#793 · Preimage Size of Factorial Zeroes Function"
  ],
  "back": [
    "← LeetCode 知识目录",
    "← LeetCode lessons"
  ],
  "hard": [
    "困难 · 数学 · Python",
    "HARD · MATH · PYTHON"
  ],
  "intro": [
    "24! 末尾有 4 个零，25! 却有 6 个。恰好 5 个零的阶乘去哪了？",
    "24! ends in 4 zeroes, but 25! ends in 6. Where is the factorial with exactly 5 trailing zeroes?"
  ],
  "constraints": [
    "输入整数 k，0 ≤ k ≤ 10⁹。返回满足 f(x)=k 的非负整数 x 的个数，而不是其中一个 x。",
    "Input an integer k, 0 ≤ k ≤ 10⁹. Return the number of nonnegative integers x with f(x)=k, rather than one such x."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "1 · 数零",
    "1 · Count zeroes"
  ],
  "nav1": [
    "2 · 五个或零个",
    "2 · Five or none"
  ],
  "nav2": [
    "3 · 两个边界",
    "3 · Two boundaries"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav4": [
    "5 · Python",
    "5 · Python"
  ],
  "s0t": [
    "为什么 25! 一次多了两个零？",
    "Why does 25! add two zeroes at once?"
  ],
  "s0e": [
    "阶乘 x! 是 1 到 x 的乘积，约定 0!=1。f(x) 表示 x! 十进制末尾的零的个数。一个零需要一个因子 10，即一对 2 和 5；阶乘中的 2 至少和 5 一样多，所以只需数 5。10!=3628800：5 和 10 各提供一个 5，因此 f(10)=2。",
    "The factorial x! multiplies the integers 1 through x, with 0!=1. Let f(x) count zeroes at the right end of its decimal representation. Each zero needs a factor 10: a pair of 2 and 5. A factorial has at least as many factors of 2 as of 5, so count the 5s. For 10!=3628800, 5 and 10 each supply one 5, giving f(10)=2."
  ],
  "s0derive": [
    "24! 中的 5 来自 5、10、15、20，共 4 个。乘上 25=5×5 时又添两个，得到 6。每个 5 的倍数贡献一层；25 的倍数再贡献一层；125 的倍数再添一层，依此类推。⌊x/d⌋ 表示 x 除以 d 后向下取整。",
    "In 24!, the factors 5, 10, 15 and 20 supply four 5s. Multiplying by 25=5×5 adds two more, giving six. Every multiple of 5 contributes one layer; every multiple of 25 contributes another; every multiple of 125 adds another, and so on. The notation ⌊x/d⌋ means divide x by d and round down."
  ],
  "zeroFormula": [
    "f(x) = ⌊x/5⌋ + ⌊x/25⌋ + ⌊x/125⌋ + …",
    "f(x) = ⌊x/5⌋ + ⌊x/25⌋ + ⌊x/125⌋ + …"
  ],
  "handTask": [
    "保持计数规则不变：把 x 从 24 调到 25，再退回。看下面贡献清单中新增的 25 为什么出现两次。此手算实验只开放 x=0…30。",
    "Keep the counting rule fixed: move x from 24 to 25, then back. Watch why the new factor 25 appears twice in the contribution ledger. This hand-calculation lab covers only x=0…30."
  ],
  "xLabel": [
    "阶乘输入 x",
    "Factorial input x"
  ],
  "minus": [
    "x 减 1",
    "Decrease x by 1"
  ],
  "plus": [
    "x 加 1",
    "Increase x by 1"
  ],
  "reset": [
    "重置此实验",
    "Reset this experiment"
  ],
  "handRead": [
    "当前 x={x}；f({x})={z} 个末尾零。",
    "Current x={x}; f({x})={z} trailing zeroes."
  ],
  "layer": [
    "{d} 的倍数：{items} → 本层 {n} 个 5",
    "Multiples of {d}: {items} → {n} factors of 5 in this layer"
  ],
  "none": [
    "无",
    "none"
  ],
  "handLimit": [
    "清单列的是乘积中的因子，不是阶乘的十进制数字；同一个 25 在两层出现，表示它含有两个 5。此范围内更高层贡献为 0。",
    "The ledger lists factors in the product, rather than decimal digits of the factorial. Listing 25 in two layers accounts for its two factors of 5. Higher layers contribute zero within this lab range."
  ],
  "s1t": [
    "为什么答案只能是 0 或 5？",
    "Why can the answer only be 0 or 5?"
  ],
  "s1e": [
    "哪些输入 x 会得到同一个末尾零数 k？这些输入的集合叫作原像。先看 k=5：表中每张卡片列出一段输入 x 及共同的输出 f(x)。20…24 都得到 4，25…29 都得到 6；5 被跳过了。",
    "Which inputs x give the same trailing-zero count k? That set of inputs is called its preimage. Start with k=5: each card shows an input block x and its shared output f(x). Inputs 20…24 all give 4; inputs 25…29 all give 6. The value 5 is skipped."
  ],
  "block": [
    "输入 x={a}…{b}",
    "Inputs x={a}…{b}"
  ],
  "blockOutput": [
    "共同输出 f(x)={z}",
    "Shared output f(x)={z}"
  ],
  "proof": [
    "把非负整数写成 x=5q+r，q 是整除 5 的商，余数 r 在 0…4。上式给出 f(5q+r)=q+f(q)，与 r 无关。q 增加 1 时，q+f(q) 至少增加 1，因为增加乘积因子不会减少 5。因此每组恰好五个输入共享一个输出，不同组的输出严格增加。一个 k 要么没有对应组，要么恰好对应五个 x。",
    "Write a nonnegative integer as x=5q+r, where q is the quotient on division by 5 and the remainder r is in 0…4. The formula gives f(5q+r)=q+f(q), independent of r. Increasing q by one increases q+f(q) by at least one: adding factors cannot remove any 5s. Thus exactly five inputs share each block’s output, and outputs of different blocks strictly increase. A value k has either no matching block or exactly five matching inputs."
  ],
  "wrong": [
    "诱人的错误：直接令 x=5k，或者只算 ⌊x/5⌋。k=5 时，这两种想法都会把 25 当成答案；但 f(25)=5+1=6，根本不匹配。只返回某个 x 也不符合题目要求：k=0 的答案是五个输入 0…4 的个数 5。",
    "A tempting mistake is to set x=5k, or to count only ⌊x/5⌋. For k=5, both ideas treat 25 as a match, but f(25)=5+1=6. Returning one x also misses the requested quantity: for k=0, the answer is 5, counting the five inputs 0…4."
  ],
  "baseline": [
    "一个正确基线：逐个检查 x=0…5(k+1)−1，累加 f(x)=k 的次数。后面都不可能匹配，因为 f(5(k+1))≥k+1，且 f 不会下降。下面代码避免构造巨大阶乘，但仍扫描 O(k+1) 个 x，每次至多 O(log(k+2)) 次整除；总时间 O((k+1)log(k+2))、辅助空间 O(1)。k=10⁹ 时要扫描约五十亿个输入。",
    "A correct baseline checks every x from 0 through 5(k+1)−1 and counts matches. Later inputs cannot match: f(5(k+1))≥k+1, and f never decreases. The code below avoids constructing a huge factorial, but still scans O(k+1) inputs with up to O(log(k+2)) divisions each: O((k+1)log(k+2)) time and O(1) auxiliary space. At k=10⁹ this means about five billion inputs."
  ],
  "baseSource": [
    "查看正确扫描基线（Python）",
    "Inspect the correct scanning baseline (Python)"
  ],
  "s2t": [
    "不扫描所有 x，怎样数出匹配区间？",
    "How can we count matches without scanning every x?"
  ],
  "s2e": [
    "定义 f(x) 为 x! 的末尾零数，它单调不减，即 x 增大时输出不会变小。定义 L(t) 为第一个满足 f(x)≥t 的非负整数 x。满足 f(x)=k 的输入，正好从 L(k) 到 L(k+1)−1。因此个数是两个边界之差；如果 k 被跳过，两个边界会重合。",
    "Let f(x) be the trailing-zero count of x!. It is monotone: increasing x never decreases the output. Define L(t) as the first nonnegative integer x with f(x)≥t. Inputs with f(x)=k run exactly from L(k) through L(k+1)−1. Their count is the difference of these boundaries. When k is skipped, the two boundaries coincide."
  ],
  "countFormula": [
    "匹配个数 = L(k+1) − L(k)",
    "Number of matches = L(k+1) − L(k)"
  ],
  "invariant": [
    "二分查找每次保留以下事实（不变量）：L(t) 位于闭区间 [lo,hi]，所有 x<lo 都不够，所有 x≥hi 都够。初始 lo=0；hi=5(t+1) 一定够，因为仅第一层就有 t+1 个 5。取 mid=⌊(lo+hi)/2⌋。",
    "Binary search preserves these facts, called an invariant: L(t) lies in the closed interval [lo,hi], every x<lo is insufficient, and every x≥hi is sufficient. Initially lo=0; hi=5(t+1) is sufficient because its first layer alone supplies t+1 factors of 5. Test mid=⌊(lo+hi)/2⌋."
  ],
  "direction": [
    "若 f(mid)<t，则 mid 及其左侧全部不够，令 lo=mid+1；否则 mid 及其右侧都够，令 hi=mid，保留 mid，因为它可能就是第一个。每次区间都缩小；lo=hi 时，不变量证明这就是 L(t)。k=5 的两个搜索分别得到 L(5)=25 与 L(6)=25，差为 0。",
    "If f(mid)<t, mid and everything to its left are insufficient, so set lo=mid+1. Otherwise mid and everything to its right are sufficient; set hi=mid and keep mid because it might be the first. Each comparison shrinks the interval. At lo=hi, the invariant proves this is L(t). For k=5, the searches find L(5)=25 and L(6)=25, giving zero matches."
  ],
  "traceTask": [
    "选择 k 会重新开始两个搜索。先前进一次，读测试前区间、mid 的 f 值和新边界；再后退、重放，检查历史完全恢复。第一阶段求 L(k)，第二阶段求 L(k+1)。",
    "Selecting k restarts both searches. Advance once and read the interval before the test, f(mid), and the new bounds. Rewind and replay to restore the same history. Phase one finds L(k); phase two finds L(k+1)."
  ],
  "presetLabel": [
    "选择 k（更换会重启轨迹）",
    "Choose k (changing it restarts the trace)"
  ],
  "sim": [
    "算法状态模拟；并非在浏览器执行 Python 提交。每帧在一次比较完成后显示新边界，历史保留测试前边界。阶段起点没有已完成比较；没有省略步骤。",
    "Algorithm-state simulation; it does not execute the Python submission in the browser. Each comparison frame shows updated bounds and retains the pre-test bounds in its history. Phase-start frames have no completed comparison for that phase. No comparisons are omitted."
  ],
  "prev": [
    "后退一帧",
    "Previous frame"
  ],
  "next": [
    "下一次搜索操作",
    "Next search operation"
  ],
  "end": [
    "完成两个搜索",
    "Finish both searches"
  ],
  "frame": [
    "帧 {i}/{n} · 阶段 {phase}/2 · k={k} · 当前目标 t={target}",
    "Frame {i}/{n} · Phase {phase}/2 · k={k} · Current target t={target}"
  ],
  "loLabel": [
    "当前下界 lo",
    "Current lower bound lo"
  ],
  "hiLabel": [
    "当前上界 hi",
    "Current upper bound hi"
  ],
  "start": [
    "本阶段开始：lo=0，hi=5×({target}+1)={hi}；尚未测试 mid。",
    "Phase start: lo=0, hi=5×({target}+1)={hi}; no midpoint tested yet."
  ],
  "rowLow": [
    "测试前 [{a},{b}]：mid={mid}，f(mid)={z} < {target}。排除 x≤{mid}；新范围 [{lo},{hi}]。",
    "Before [{a},{b}]: mid={mid}, f(mid)={z} < {target}. Discard x≤{mid}; new range [{lo},{hi}]."
  ],
  "rowHigh": [
    "测试前 [{a},{b}]：mid={mid}，f(mid)={z} ≥ {target}。保留 mid 为可能的首个输入；新范围 [{lo},{hi}]。",
    "Before [{a},{b}]: mid={mid}, f(mid)={z} ≥ {target}. Keep mid as a possible first input; new range [{lo},{hi}]."
  ],
  "boundaryDone": [
    "本阶段已定位 L({target})={lo}。",
    "This phase has located L({target})={lo}."
  ],
  "waiting": [
    "两个搜索尚未全部结束；最终匹配个数待定。",
    "Both searches are not yet complete; the final match count is pending."
  ],
  "leftDone": [
    "已完成 L({k})={left}；正在求另一边界。",
    "Completed L({k})={left}; finding the other boundary."
  ],
  "result": [
    "最终：L({kp})={right}，L({k})={left}；匹配个数={right}−{left}={result}。",
    "Final: L({kp})={right}, L({k})={left}; match count={right}−{left}={result}."
  ],
  "history": [
    "已完成比较的历史（按发生顺序，含两个阶段）",
    "Completed comparisons (chronological, across both phases)"
  ],
  "empty": [
    "尚无比较记录。",
    "No comparisons yet."
  ],
  "s3t": [
    "把规则带到一次更大的跳跃",
    "Transfer the rule to a larger jump"
  ],
  "s3e": [
    "新问题：给定 k，有多少非负整数 x 的阶乘末尾恰好有 k 个零？不运行上面的搜索，利用五个一组与额外的 5 因子来预测。选择答案后再揭晓；此练习独立于上面的实验。",
    "Fresh question: for the selected k, how many nonnegative integers x have exactly k trailing zeroes in x!? Predict using five-input blocks and extra factors of 5, without running the search above. Choose before revealing. This exercise is independent of the experiments above."
  ],
  "quizLabel": [
    "选择新题（更换会清除本题答案）",
    "Choose a fresh question (clears this answer)"
  ],
  "predictionLegend": [
    "预测匹配输入的个数",
    "Predict the number of matching inputs"
  ],
  "option0": [
    "0 个输入",
    "0 inputs"
  ],
  "option1": [
    "5 个输入",
    "5 inputs"
  ],
  "option2": [
    "1 个输入",
    "1 input"
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal and explain"
  ],
  "await": [
    "先选择一个答案，再揭晓。更改选择会隐藏旧反馈。",
    "Choose an answer, then reveal. Changing the choice hides the old feedback."
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "需要修正。",
    "Revise your prediction."
  ],
  "answer29": [
    "答案是 0。f(124)=24+4=28；125=5³ 使下一步增加 3，f(125)=25+5+1=31。29（以及 30）被跳过。L(29)=L(30)=125，所以差为 0；相邻 x 不一定带来相邻的零数。",
    "The answer is 0. f(124)=24+4=28; 125=5³ makes the next step add three, so f(125)=25+5+1=31. The output skips 29 (and 30). L(29)=L(30)=125, so the difference is zero; consecutive x need not give consecutive zero counts."
  ],
  "answer31": [
    "答案是 5。f(125)=25+5+1=31；126…129 不引入新的 5，仍为 31。f(130)=26+5+1=32，所以 L(31)=125、L(32)=130，差为 5。选择 1 会漏掉同一组其余四个输入。",
    "The answer is 5. f(125)=25+5+1=31; inputs 126…129 introduce no new factor of 5 and still give 31. Since f(130)=26+5+1=32, L(31)=125 and L(32)=130; their difference is five. Choosing one misses the other four inputs in the block."
  ],
  "s4t": [
    "把边界证明写成 Python",
    "Turn the boundary proof into Python"
  ],
  "s4e": [
    "代码如何对应轨迹？这是官方支持的 Python 接口：Solution.preimageSizeFZF(k) 返回一个整数。f(x) 是 x! 的末尾零数；L(t) 是第一个 f(x)≥t 的输入。浏览器的轨迹是教学模拟，下面的文件才是实际提交源码。",
    "How does the code match the trace? The officially supported Python interface is Solution.preimageSizeFZF(k), returning an integer. Here f(x) counts trailing zeroes in x!, and L(t) is the first input with f(x)≥t. The browser trace is a teaching simulation; the file below is the actual submission source."
  ],
  "map1": [
    "zeros：反复 x//=5 得到 ⌊x/5⌋、⌊x/25⌋ 等，累加所有层；0 不进入循环，所以 f(0)=0。",
    "zeros: repeated x//=5 produces ⌊x/5⌋, ⌊x/25⌋, and later layers. Sum them all. Zero never enters the loop, giving f(0)=0."
  ],
  "map2": [
    "first_at_least：lo、hi、mid 与轨迹同名。if 分支对应“不够，排除 mid”；else 对应“够，保留 mid”。返回的 lo 就是 L(target)。",
    "first_at_least: lo, hi, and mid have the same names as in the trace. The if branch discards an insufficient mid; else keeps a sufficient mid. The returned lo is L(target)."
  ],
  "map3": [
    "最后一行求 L(k+1)−L(k)。代码先求右边界，轨迹先展示左边界；两次搜索相互独立，所以顺序不影响结果。",
    "The final line returns L(k+1)−L(k). The code computes the right boundary first, while the trace presents the left boundary first. The searches are independent, so their order does not affect the result."
  ],
  "cost": [
    "以 k 为输入值，并按固定宽度整数算术计费：每次 zeros 最多 O(log(k+2)) 次整除，每次二分最多 O(log(k+2)) 次比较，共两次搜索，总时间 O(log²(k+2))，辅助空间 O(1) 个整数单元。+2 让 k=0 时成本仍有意义。官方范围内最大搜索上界 5,000,000,010；Python 整数不会溢出。若计入任意大整数的位成本，单次算术并非常数。",
    "With k as the input value and fixed-width integer arithmetic as the cost model, zeros uses O(log(k+2)) divisions, and each binary search uses O(log(k+2)) comparisons. Two searches cost O(log²(k+2)) time and O(1) auxiliary integer cells. The +2 keeps the bound meaningful at k=0. The largest search upper bound in the official range is 5,000,000,010; Python integers do not overflow. Under arbitrary-precision bit costs, individual arithmetic operations are not constant time."
  ],
  "bounds": [
    "边界：k=0 返回 5（x=0…4）；k=5 返回 0；k=3 返回 5。25、125 等处必须计入额外的 5。教学轨迹保存每次比较及历史，空间至多 O(log²(k+2))，不属于提交的 O(1) 辅助空间。源码不构造阶乘、不修改输入。",
    "Boundaries: k=0 returns 5 (x=0…4), k=5 returns 0, and k=3 returns 5. Extra factors of 5 at 25, 125, and later powers must be counted. Teaching frames retain comparisons and copied history, using up to O(log²(k+2)) space; this is separate from the submission’s O(1) auxiliary space. The source never constructs a factorial or mutates the input."
  ],
  "source": [
    "查看完整 Python 提交源码",
    "View the complete Python submission source"
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "copied": [
    "已复制完整源码。",
    "Complete source copied."
  ],
  "copying": [
    "正在复制…",
    "Copying…"
  ],
  "fallback": [
    "自动复制不可用；完整源码已选中，请用系统复制快捷键。",
    "Automatic copy is unavailable; the complete source is selected. Use your system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整 Python 源码",
    "Manually copy the complete Python source"
  ],
  "related1": [
    "延伸 #4：用比较决定二分方向",
    "Continue to #4: comparisons decide binary-search direction"
  ],
  "related2": [
    "延伸 #668：寻找第一个足够的值",
    "Continue to #668: find the first sufficient value"
  ]
};
