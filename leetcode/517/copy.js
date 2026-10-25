window.COPY = {
  "docTitle": [
    "#517 · 超级洗衣机",
    "#517 · Super Washing Machines"
  ],
  "back": [
    "← LeetCode 知识课",
    "← LeetCode lessons"
  ],
  "title": [
    "#517 · 超级洗衣机",
    "#517 · Super Washing Machines"
  ],
  "intro": [
    "三台机器里有 [1,0,5] 件衣服。一次可以让多台机器各送出一件，最少几轮才能都变成 2？",
    "Three machines hold [1,0,5] dresses. Several machines may each send one dress in a move. How few moves make every count 2?"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "badge": [
    "困难 · Python · 守恒",
    "Hard · Python · Conservation"
  ],
  "language": [
    "选择语言",
    "Choose language"
  ],
  "nav": [
    "课程步骤",
    "Lesson steps"
  ],
  "s0": [
    "一轮的含义",
    "One move"
  ],
  "s1": [
    "两个瓶颈",
    "Two bottlenecks"
  ],
  "s2": [
    "扫描实验",
    "Scan experiment"
  ],
  "s3": [
    "先预测",
    "Predict first"
  ],
  "s4": [
    "实现与边界",
    "Code & boundaries"
  ],
  "q0": [
    "问题：中间那台能在收到衣服的同一轮送出衣服吗？",
    "Question: can the middle machine receive and send in the same move?"
  ],
  "rules": [
    "输入是从左到右的衣服件数，输出是最少轮数，不可行则返回 -1。一轮中，每台被选中的机器向一个相邻机器送一件；可同时收衣，但送出的衣服必须在本轮开始时已有。第一轮中间机器是空的，不能送。",
    "The input gives dress counts from left to right; the output is the fewest moves, or -1 if impossible. In one move, each selected machine sends one dress to one neighbor. It may also receive, but it must own its outgoing dress at the start of that move. The empty middle machine cannot send in move 1."
  ],
  "hand": [
    "总数 6 ÷ 3 台 = 目标每台 2 件。右端必须净送出 5−2=3 件，所以至少 3 轮。下面的 3 轮合法方案恰好做到：下界与方案相等，故这个例子的答案是 3。",
    "Total 6 ÷ 3 machines gives a target of 2 dresses each. The rightmost machine must send out a net 5−2=3 dresses, so at least 3 moves are needed. The legal three-move schedule below meets this bound, proving the answer is 3 for this example."
  ],
  "scheduleHint": [
    "这是手工方案的模拟，不是 Python 提交的执行。按“下一轮”，先看发送箭头，再比较上一行与当前行；历史保留全部已完成轮。",
    "This simulates a hand-built schedule; it does not execute the Python submission. Choose “Next move,” read the send arrows, then compare the previous and current rows. All completed moves remain visible."
  ],
  "movePrev": [
    "上一轮",
    "Previous move"
  ],
  "moveNext": [
    "下一轮",
    "Next move"
  ],
  "reset": [
    "回到起点",
    "Reset to start"
  ],
  "end": [
    "到终点",
    "Go to end"
  ],
  "moveStatus": [
    "已完成 {k}/3 轮 · 当前 [{a}] · 目标每台 2 件",
    "Completed {k}/3 moves · Current [{a}] · Target: 2 per machine"
  ],
  "m0": [
    "起点：[1,0,5]；尚未发送。",
    "Start: [1,0,5]; no sends yet."
  ],
  "m1": [
    "第 1 轮：机器 3 → 2；[1,0,5] → [1,1,4]。",
    "Move 1: machine 3 → 2; [1,0,5] → [1,1,4]."
  ],
  "m2": [
    "第 2 轮：机器 2 → 1，机器 3 → 2，同时发送；[1,1,4] → [2,1,3]。机器 2 送的是上一轮已有的那一件。",
    "Move 2: machines 2 → 1 and 3 → 2 send simultaneously; [1,1,4] → [2,1,3]. Machine 2 sends the dress it already held."
  ],
  "m3": [
    "第 3 轮：机器 3 → 2；[2,1,3] → [2,2,2]。全部相等。",
    "Move 3: machine 3 → 2; [2,1,3] → [2,2,2]. All counts are equal."
  ],
  "machine": [
    "机器 {i}",
    "Machine {i}"
  ],
  "q1": [
    "问题：不用搜索所有传衣方案，怎样读出不可避免的等待？",
    "Question: how can we read unavoidable waiting without searching every schedule?"
  ],
  "baseline": [
    "可靠但昂贵的基线：广度优先搜索（BFS），就是先列出所有 1 轮可达的数组，再列出所有 2 轮可达的数组，首次达到全相等时返回层数。每台非空机器选择“不送／向左／向右”，只保留有效邻居，按旧数组同时结算。它避免把同时发送错算成逐个发送。",
    "A reliable but expensive baseline is breadth-first search (BFS): enumerate arrays reachable in one move, then two moves, and return the first depth reaching equal counts. Each nonempty machine chooses stay, left, or right, restricted to valid neighbors. Apply all choices to the old array simultaneously, rather than moving dresses sequentially."
  ],
  "baselineSource": [
    "查看小输入基线 Python（非正式解）",
    "View small-input baseline Python (not the submission)"
  ],
  "pipelineExample": [
    "空机器传递实例 [0,0,6]：目标 2，切口 −2、−4，故 M=4。合法方案是 [0,0,6] → [0,1,5] → [1,1,4] → [2,1,3] → [2,2,2]。起初中间机器等待一轮，但右端要送的 4 件已覆盖这轮启动等待。",
    "Empty-relay example [0,0,6]: target 2, cuts −2 and −4, so M=4. A legal schedule is [0,0,6] → [0,1,5] → [1,1,4] → [2,1,3] → [2,2,2]. The middle machine waits initially, but the right endpoint’s four sends already cover that startup delay."
  ],
  "baselineCost": [
    "设总衣服数为 S、机器数为 n。保持总数的数组最多有 C(S+n−1,n−1) 种，每个数组最多检查 3ⁿ 组动作，每组需 O(n) 时间；存储所有状态需要 O(n·C(S+n−1,n−1)) 空间。这只适合作为小输入的独立核对器，无法处理 n=10⁴。我们改为计算必须跨过每条边界的净衣服数。",
    "With S dresses and n machines, there are at most C(S+n−1,n−1) arrays conserving the total. Each has at most 3ⁿ action combinations, taking O(n) time each; storing the states costs O(n·C(S+n−1,n−1)) space. This is only a small-input oracle, not a solution for n=10⁴. Instead, compute the net dresses that must cross each boundary."
  ],
  "cut": [
    "把目标每台件数记为 a=总数/n；若除不尽，整数件衣服无法平分，直接 -1。定义 dᵢ=machines[i]−a，表示第 i 台比目标多多少件。切口是相邻两台之间的边界。切口左边所有 d 的和 bᵢ 是左段的净多余量：正数必须向右送，负数必须从右接收。",
    "Let a=total/n be the target count. If it is not an integer, equal integer counts are impossible: return -1. Define dᵢ=machines[i]−a, the surplus at machine i. A cut is the boundary between neighbors. The sum bᵢ of all d values to its left is that prefix’s net surplus: positive means net sends right, negative means net receives from the right."
  ],
  "cutHand": [
    "对 [1,0,5]，a=2：d=[−1,−2,+3]。第一条切口左边差 1 件，所以 b₁=−1；第二条左边共差 3 件，所以 b₂=−3。每条边界每轮朝所需方向最多跨一件，因而至少 max(|−1|,|−3|)=3 轮。最后的 b₃=0 表示全体守恒，右侧没有真实邻居。",
    "For [1,0,5], a=2 and d=[−1,−2,+3]. The first cut’s left side lacks 1 dress, so b₁=−1. The second cut’s left side lacks 3 in total, so b₂=−3. At most one dress crosses a boundary in the required direction per move, giving at least max(|−1|,|−3|)=3 moves. The final b₃=0 records global conservation; there is no neighbor beyond the end."
  ],
  "wrong": [
    "只看切口会错：[0,3,0] 的目标为 1，切口为 −1、+1，最大绝对值只有 1。但中间机器需要向左右各送一件，一轮不能送两件，实际要 2 轮。还必须计入每台的正剩余 dᵢ；负 dᵢ 不取绝对值作为单机约束，因为一台机器可同时从两边收衣。例如 [3,0,3] 的中间差 2 件，但两端可同时送来，1 轮即可。",
    "Cuts alone fail on [0,3,0]: target 1, cut balances −1 and +1, largest magnitude 1. Yet the middle machine must send one dress each way and cannot send twice in one move. It needs 2 moves. Include each positive surplus dᵢ. Do not use |dᵢ| as a sender bound for a deficit: a machine can receive from both neighbors at once. For example, [3,0,3] lacks 2 dresses in the middle, but both ends can fill it in one move."
  ],
  "formula": [
    "最少轮数 M = maxᵢ ( |bᵢ|, dᵢ )，其中 bᵢ = d₁+…+dᵢ，且总数可整除 n。",
    "Minimum moves M = maxᵢ ( |bᵢ|, dᵢ ), where bᵢ = d₁+…+dᵢ, provided the total is divisible by n."
  ],
  "proofTitle": [
    "为什么这两个下界也足够？",
    "Why do these lower bounds suffice?"
  ],
  "proof": [
    "令 b₀=0 表示最左端外侧没有流量。看任意一台机器：它向左必须净送 max(0,−bᵢ₋₁) 件，向右必须净送 max(0,bᵢ) 件。若两边都向外，这两项之和正好是 dᵢ；若仅一边向外，其发送量就是相邻切口的绝对值；若两边都向内，它不用发。所以所有机器所需的发送次数都不超过 M。",
    "Set b₀=0 for the outer boundary at the left end. For any machine, the required net sends are max(0,−bᵢ₋₁) to the left and max(0,bᵢ) to the right. If both directions point out, their sum is exactly dᵢ. If only one points out, its sends equal the magnitude of that adjacent cut. If both point in, it need not send. Thus every machine needs at most M sends."
  ],
  "proof2": [
    "还要排除“衣服还没到，导致额外轮数”。可将固定方向的流排成流水线：中间机器有旧衣时可同轮接收与发送；缺货时才等待上游。沿任一单向路径，每经过一台初始缺货机器，上游所需流量会增加至少一件（目标 a≥1）。因此每一轮启动等待都已包含在上游更大的切口流量中，不会在最大切口之外另加路径长度。两边外送的源机器按总发送数安排左右轮次；两边内收的汇机器没有接收容量限制。路径无环，无需逆向来回搬；这些流水线可在 M 轮内完成。若 a=0，非负件数意味着起点已全为零。结合必要下界，得到上式。",
    "We must also rule out extra waiting for dresses to arrive. Route the fixed-direction flows as pipelines: a machine holding an old dress can receive and send in the same move; only a stock shortage forces it to wait upstream. Along a directed path, every initially empty relay increases the required upstream flow by at least one dress (the target a≥1). Each startup delay is therefore already covered by the larger upstream cut demand, rather than added again as path length. A source feeding both sides allocates its moves to their total send count; a sink receiving from both sides has no receive-capacity limit. There are no directed cycles or necessary backtracking, so these pipelines finish within M moves. If a=0, nonnegative counts mean the input is already all zero. Together with the lower bound, this gives the formula."
  ],
  "q2": [
    "问题：处理到第 i 台以后，需要记住什么？",
    "Question: what must we remember after processing machine i?"
  ],
  "scanDef": [
    "本实验扫描原始数组，不搬动衣服。目标 a 是总数/n；d 是当前机器件数减 a；b 是已经处理的左段所有 d 的和。ans 是已处理的切口 |b| 与单机 d 中最大的下界。每次只加一个 d，保留旧 b→新 b 及所有已完成行；最后 b=0，ans 才成为最终答案。",
    "This experiment scans the original array; it does not move dresses. The target a is total/n; d is the current count minus a; b is the sum of d over the processed prefix. ans is the largest cut bound |b| or sender bound d seen so far. Each step adds one d. The ledger retains old b→new b and every completed row. At the end b=0, and ans becomes the final answer."
  ],
  "preset": [
    "选择数组（会重启本扫描）",
    "Choose an array (restarts this scan)"
  ],
  "p0": [
    "[1,0,5] · 原例",
    "[1,0,5] · Worked"
  ],
  "p1": [
    "[0,3,0] · 单机瓶颈",
    "[0,3,0] · Sender"
  ],
  "p2": [
    "[0,0,6] · 空机传递",
    "[0,0,6] · Relay"
  ],
  "p3": [
    "[0,2,0] · 不可平分",
    "[0,2,0] · Impossible"
  ],
  "p4": [
    "[2,2,2] · 已平衡",
    "[2,2,2] · Balanced"
  ],
  "p5": [
    "[0] · 单台零件",
    "[0] · Single machine"
  ],
  "scanHint": [
    "按“处理下一台”，比较当前卡片与表中新行。切换 [0,3,0] 与 [0,0,6]，观察分别由 d 和 |b| 决定答案。浅色边框和文字“当前”表示刚处理的项；“待处理”不是零值。",
    "Choose “Process next machine” and compare the current card with the new ledger row. Switch between [0,3,0] and [0,0,6] to see d and |b| determine the answer respectively. A highlighted border and “Current” mark the just-processed item; “Pending” does not mean zero."
  ],
  "prev": [
    "撤回上一台",
    "Undo last machine"
  ],
  "next": [
    "处理下一台",
    "Process next machine"
  ],
  "position": [
    "已处理机器数",
    "Machines processed"
  ],
  "progress": [
    "已处理 {k}/{n} 台 · 原始 [{a}] · 目标 a={target}",
    "Processed {k}/{n} machines · Original [{a}] · Target a={target}"
  ],
  "initial": [
    "尚未处理：b=0，ans=0。",
    "Nothing processed yet: b=0, ans=0."
  ],
  "partial": [
    "刚处理机器 {i}：d={count}−{target}={d}；b={old}+({d})={balance}；ans=max({before}, |{balance}|, {d})={answer}（当前下界）。",
    "Just processed machine {i}: d={count}−{target}={d}; b={old}+({d})={balance}; ans=max({before}, |{balance}|, {d})={answer} (bound so far)."
  ],
  "finished": [
    "扫描结束：b={balance}；最终最少 {answer} 轮。",
    "Scan complete: b={balance}; final minimum {answer} moves."
  ],
  "impossible": [
    "总数 {total} 不能被 {n} 整除：最终答案 -1。不扫描，也没有整数目标。",
    "Total {total} is not divisible by {n}: final answer -1. No scan or integer target exists."
  ],
  "na": [
    "不存在",
    "None"
  ],
  "pending": [
    "待处理",
    "Pending"
  ],
  "current": [
    "当前",
    "Current"
  ],
  "done": [
    "已处理",
    "Processed"
  ],
  "tableHint": [
    "窄屏可横向滚动下表查看完整 b 与 ans；每行保留机器编号。",
    "On narrow screens, scroll the table horizontally for the full b and ans columns; each row retains its machine number."
  ],
  "ledger": [
    "扫描历史表，可横向滚动",
    "Scan history table, scroll horizontally"
  ],
  "h0": [
    "机器 i（从 1 开始）",
    "Machine i (1-based)"
  ],
  "h1": [
    "原始件数",
    "Original count"
  ],
  "h2": [
    "d=件数−a",
    "d=count−a"
  ],
  "h3": [
    "旧 b → 新 b",
    "Old b → new b"
  ],
  "h4": [
    "当前下界 ans",
    "Bound so far ans"
  ],
  "empty": [
    "尚无完成行。",
    "No completed rows yet."
  ],
  "q3": [
    "问题：接收的拥挤是否也限制为每轮一件？",
    "Question: is receiving also limited to one dress per move?"
  ],
  "quiz": [
    "新输入 [4,0,0,4]，目标每台 2 件。不要搬衣模拟：用切口与单机下界预测最少轮数。",
    "Fresh input [4,0,0,4], target 2 each. Predict the minimum moves from cut and sender bounds, without simulating transfers."
  ],
  "o0": [
    "4 轮：把两端发送数加起来",
    "4 moves: add both endpoint send counts"
  ],
  "o1": [
    "1 轮：两边同时行动就够了",
    "1 move: both ends act simultaneously"
  ],
  "o2": [
    "2 轮：取并行瓶颈的最大值",
    "2 moves: take the largest parallel bottleneck"
  ],
  "reveal": [
    "核对并解释",
    "Check and explain"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再看每轮的发送限制。",
    "Revisit the per-move send limit."
  ],
  "answer": [
    "d=[2,−2,−2,2]，b=[2,0,−2,0]，最大 |b| 与最大 d 都是 2。两端每轮各送一件，2 轮后得到 [2,2,2,2]。4 误把可并行的工作相加；1 忽略每个端点都要送两件。",
    "d=[2,−2,−2,2], b=[2,0,−2,0]; both max |b| and max d are 2. Each endpoint sends one dress inward per move, yielding [2,2,2,2] after 2 moves. Choosing 4 adds parallel work; choosing 1 overlooks each endpoint’s two sends."
  ],
  "q4": [
    "问题：哪一行代码维护刚才的守恒关系？",
    "Question: which line maintains the conservation relation we just used?"
  ],
  "mapping": [
    "官方 Python3 接口是 Solution.findMinMoves(machines: list[int]) -> int。balance += surplus 将上一段多余量加上当前 d，保持 balance 等于当前前缀总数减去该前缀应有总数。answer = max(...) 同时覆盖切口与单机瓶颈；循环开始前二者为 0，循环结束后覆盖所有位置。Python 不修改输入。",
    "The official Python3 interface is Solution.findMinMoves(machines: list[int]) -> int. balance += surplus adds the current d to the previous prefix surplus, preserving balance = actual prefix total minus required prefix total. answer = max(...) covers both cut and sender bottlenecks. Both start at 0; the loop covers every position. The Python code does not mutate the input."
  ],
  "cost": [
    "提交代码：sum 与主循环各访问 n 台，O(n) 时间、O(1) 辅助空间（固定数量整数）。本课为回看存储完整快照，使用 O(n²) 教学存储，不是提交空间；预设最多 3 台。浏览器只是模拟扫描；Python 在独立本地测试中执行。",
    "Submission: sum and the loop each visit n machines, giving O(n) time and O(1) auxiliary space (a fixed number of integers). This lesson keeps full snapshots for rewind, using O(n²) teaching storage, not submission space; presets have at most 3 machines. The browser only simulates the scan; Python runs in separate local tests."
  ],
  "boundaries": [
    "边界：单台必已相等，返回 0；全零或本来相等也返回 0；不可整除返回 -1；空数组不在官方约束中。n≤10⁴，每台≤10⁵，总数≤10⁹，Python 整数精确。负数、环形邻居和一台同轮送两件都不在模型内。",
    "Boundaries: one machine is already equal, so return 0; all-zero or already equal arrays also return 0; a nondivisible total returns -1. Empty arrays are outside the official constraints. With n≤10⁴ and counts≤10⁵, total≤10⁹; Python integers remain exact. Negative counts, circular neighbors, and sending two dresses from one machine in a move are outside this model."
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
    "查看可提交的 Python 源码",
    "View submittable Python source"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "copyFallback": [
    "剪贴板不可用；下方已选中完整源码，请手动复制。",
    "Clipboard unavailable; the full source below is selected for manual copying."
  ],
  "manual": [
    "手动复制完整源码",
    "Manually copy full source"
  ],
  "related": [
    "继续比较这些不变量",
    "Compare these invariants next"
  ],
  "related0": [
    "接雨水：两端的局部信息如何给出安全下界",
    "Trapping Rain Water: how boundary information gives a safe bound"
  ],
  "related1": [
    "分发糖果：相邻约束为何需要两侧信息",
    "Candy: why neighbor constraints need information from both sides"
  ],
  "foot": [
    "作者自查候选；尚未独立评审，也不声称 LeetCode 提交通过。",
    "Author self-checked candidate; independent review is pending. No accepted LeetCode submission is claimed."
  ]
};
