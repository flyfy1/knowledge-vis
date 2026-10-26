window.LESSON_COPY = {
  "docTitle": [
    "#854 相似度为 K 的字符串",
    "#854 K-Similar Strings"
  ],
  "title": [
    "#854 · 相似度为 K 的字符串",
    "#854 · K-Similar Strings"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "intro": [
    "把 abc 排成 bca：你可以交换任意两个位置。如何保证交换次数最少？",
    "Rearrange abc into bca. You may exchange any two positions. How can you guarantee the fewest swaps?"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "nav0": [
    "1 · 亲手交换",
    "1 · Swap by hand"
  ],
  "s0t": [
    "亲手交换",
    "Swap by hand"
  ],
  "nav1": [
    "2 · 保留选择",
    "2 · Keep alternatives"
  ],
  "s1t": [
    "保留选择",
    "Keep alternatives"
  ],
  "nav2": [
    "3 · 安全缩减搜索",
    "3 · Prune safely"
  ],
  "s2t": [
    "安全缩减搜索",
    "Prune safely"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "s3t": [
    "先预测",
    "Predict first"
  ],
  "nav4": [
    "5 · 映射到 Python",
    "5 · Map to Python"
  ],
  "s4t": [
    "映射到 Python",
    "Map to Python"
  ],
  "s0e": [
    "这一步要回答：abc → bca 的最少交换次数是多少？一次交换把两个位置的字母互换，不要求相邻。先交换下标 0、1，abc → bac；再交换 1、2，bac → bca，共 2 次。三处都不同，一次交换至多改变两处，所以 1 次不够。",
    "How many swaps does abc → bca need? A swap exchanges the letters at two positions; they need not be adjacent. Swap indices 0 and 1: abc → bac. Then swap 1 and 2: bac → bca, taking 2 swaps. All three positions differ initially, and one swap changes at most two positions, so 1 cannot suffice."
  ],
  "contract": [
    "题目保证 s1、s2 是异位词（每种字母的数量相同），等长且长度为 1…20，只含 a…f。返回最小非负次数 k；已经相等时返回 0。下标从 0 开始。官方例子：ab → ba 为 1；abc → bca 为 2。空串和非异位词不属于输入范围。",
    "The inputs s1 and s2 are anagrams: each letter has the same count in both. Their common length is 1…20 and letters are a…f. Return the smallest nonnegative swap count k; equal strings need 0. Indices start at 0. Official examples: ab → ba needs 1; abc → bca needs 2. Empty strings and non-anagrams are outside the contract."
  ],
  "handTask": [
    "先按第一步，再按第二步；保持目标 bca 不变，观察历史中的哪两处改变。撤销可恢复上一步。",
    "Apply the first swap, then the second. Keep target bca fixed and inspect which two positions change in the history. Undo restores the previous state."
  ],
  "swapA": [
    "交换 (0, 1)",
    "Swap (0, 1)"
  ],
  "swapB": [
    "交换 (1, 2)",
    "Swap (1, 2)"
  ],
  "undo": [
    "撤销一次交换",
    "Undo one swap"
  ],
  "reset": [
    "重置此实验",
    "Reset this experiment"
  ],
  "manualRead": [
    "已交换 {n} 次；当前 {s}；目标 bca。",
    "Swaps made: {n}; current: {s}; target: bca."
  ],
  "history": [
    "交换历史（从初始状态开始）",
    "Swap history (including the initial state)"
  ],
  "s1e": [
    "这一步要回答：为什么不能只挑第一个可用的字母？把完整字符串看作一个状态，每次交换连到下一个状态。广度优先搜索（BFS）先检查 0 次能到的状态，再检查 1 次、2 次……每次边的代价都是 1，所以第一次遇到目标的层数就是最少次数。",
    "Why not always take the first available letter? Treat the whole string as a state, with a swap leading to another state. Breadth-first search (BFS) checks states reachable in 0 swaps, then 1, then 2, and so on. Every edge costs 1, so the first layer reaching the target gives the minimum count."
  ],
  "wrong": [
    "反例：aabbcc → abcabc。若每次修好第一个错误位置，却只用最左边的可用字母，会走 aabbcc → ababcc → abcbac → abcabc，花 3 次。保留另一个选择则可走 aabbcc → abbacc（交换 1、3）→ abcabc（交换 2、4），只花 2 次。重复字母并不代表后续状态等价。初始有 4 处不同，所以至少需要 2 次。",
    "Counterexample: aabbcc → abcabc. Fixing the first mismatch using only the leftmost available letter gives aabbcc → ababcc → abcbac → abcabc, taking 3 swaps. Another choice gives aabbcc → abbacc (swap 1,3) → abcabc (swap 2,4), taking only 2. Repeated letters do not make the resulting suffixes equivalent. Four positions initially differ, so at least 2 swaps are necessary."
  ],
  "baseline": [
    "正确基线：从每个状态枚举所有 i < j 的交换，把尚未访问过的字符串放入队列。deque 是两端队列，popleft 取出最早加入的项；seen 集合防止同一字符串被反复加入。下方代码独立求最少交换次数。",
    "A correct baseline enumerates every swap i < j from each state and enqueues unseen strings. deque is a double-ended queue; popleft removes the earliest entry. The seen set prevents repeated enqueueing of the same string. The code below independently finds the minimum swap count."
  ],
  "baselineCode": [
    "展开正确基线 Python",
    "Open correct baseline Python"
  ],
  "baselineCost": [
    "设 n 是长度，S 是不同排列数，S = n! / ∏c!（c 为每种字母的个数）。每个状态有 O(n²) 种交换，每次复制、拼接、哈希字符串需 O(n)，故保守时间 O(Sn³)，空间 O(Sn)。长度到 20 时，穷举排列仍可能非常大；下一步减少每个状态要尝试的交换，并非把问题变成多项式时间。",
    "Let n be the length and S the number of distinct permutations: S = n! / ∏c!, where c is each letter count. Each state has O(n²) swaps, and copying, joining and hashing a string costs O(n) per swap. A conservative bound is O(Sn³) time and O(Sn) space. At length 20 the permutation count can be huge. Next we reduce the swaps tried per state; this does not make the problem polynomial."
  ],
  "s2e": [
    "这一步要回答：哪些交换可以安全地保留？在 abc → bca 中，首个不匹配下标 i=0，需要 b。只有 j=1 带着 b，交换后 bac 的位置 0 已正确。接着 i=1 需要 c，从 j=2 取来，得到 bca。正确前缀（i 左边连续已匹配的位置）始终不动。",
    "Which swaps can we safely retain? In abc → bca, the first mismatch is at index i=0 and needs b. Only j=1 carries b; swapping gives bac, with position 0 correct. Next i=1 needs c, taken from j=2, giving bca. The correct prefix—the consecutive matching positions before i—stays untouched."
  ],
  "rule": [
    "对当前字符串 state，令 i 为最左边 state[i] ≠ s2[i] 的下标。只尝试 j > i 且 state[j] = s2[i] 且 state[j] ≠ s2[j]。最后一个条件避免从已经正确的位置借字母。异位词保证：未匹配部分中一定有一个尚未放对的所需字母。仍须保留所有这样的 j，而非贪心选一个。",
    "For the current string state, let i be the leftmost index with state[i] ≠ s2[i]. Try only j > i with state[j] = s2[i] and state[j] ≠ s2[j]. The last condition avoids borrowing a letter from an already correct position. Equal character counts guarantee that the unmatched part contains a misplaced copy of the needed letter. Keep every such j rather than choosing one greedily."
  ],
  "proof": [
    "为什么至少有一条最优路径留下来？暂时给重复字母贴上不同标签，指定每个标签最终去哪里。沿每个标签的目标位置前进，直到回到起点，就形成一个环。这些移动分解成互不相交的环：例如 abc → bca 是 0→2→1→0 的一个三位置环。一个长度 L 的环最少用 L−1 次交换；一次交换至多把一个环拆成两个，而逐次拆出正确位置能达到这个界。所有标签分配中选择总环数最多的一个，就得到最少交换次数。",
    "Why does at least one optimal route survive? Temporarily tag repeated letters and assign each tag a target position. Following each tag’s destination until returning to the start forms a cycle. These movements split into disjoint cycles: abc → bca has the three-position cycle 0→2→1→0. A cycle of length L needs L−1 swaps: one swap can increase the cycle count by at most one, and splitting off correct positions achieves this bound. Among all tag assignments, one with the most cycles therefore uses the fewest swaps."
  ],
  "proof2": [
    "已经匹配的位置可在最优标签分配中单独成环：若标签还在长环里，把同字母的两个目标互换即可拆出它，不增加代价。对包含首错 i 的环，让其中要送到 i 的字母所在位置为 j。它在未匹配后缀内且当前不正确；交换 i、j 会拆出一个正确位置，并把剩下的环长度减一。因此它符合上述条件，且恰好消耗最优解的一次交换。",
    "An already matching position can be a singleton cycle in an optimal assignment: if it belongs to a longer cycle, exchanging the destinations of two identical letters splits it off without increasing cost. In the cycle containing the first mismatch i, let j hold the letter destined for i. It lies in the unmatched suffix and is misplaced. Swapping i and j splits off a correct position and shortens the remaining cycle by one. Thus this swap meets our conditions and consumes exactly one swap of an optimal solution."
  ],
  "invariant": [
    "不变量：每次扩展都保持已正确的前缀，且保留至少一条最短完成路径。BFS 的前沿是恰好 d 次交换才首次到达的字符串集合；处理完整个 d 层再进入 d+1 层。seen 只去掉已入队的相同字符串，不去掉不同的后缀选择。",
    "Invariant: each expansion preserves the correct prefix and retains at least one shortest completion. A BFS frontier contains strings first reached in exactly d swaps; finish depth d before entering d+1. The seen set removes only strings already enqueued, not distinct suffix choices."
  ],
  "traceTask": [
    "选择预设会重启本搜索。按“扩展一层”，查看父字符串、首错 i、候选 j 及每个交换后的子字符串，再看新前沿。历史保留已处理各层。每个快照表示整层扩展完成后的时刻；目标所在层出现时停止，尚未展开该层。",
    "Changing the preset restarts this search. Expand one layer: inspect each parent string, its first mismatch i, candidate indices j and resulting children, then the new frontier. History retains processed layers. Each snapshot is after a complete layer expansion. Stop when a frontier contains the target, before expanding that frontier."
  ],
  "sim": [
    "交互是 JavaScript 教学模拟，不执行下方 Python 提交。只展示这些小输入的完整搜索，无省略层。",
    "This is a JavaScript teaching simulation; it does not execute the Python submission below. These small presets show the complete search with no omitted layers."
  ],
  "presetLabel": [
    "搜索输入（更换会重置）",
    "Search input (changing resets trace)"
  ],
  "preset0": [
    "预设 A",
    "Case A"
  ],
  "preset1": [
    "预设 B",
    "Case B"
  ],
  "preset2": [
    "预设 C",
    "Case C"
  ],
  "preset3": [
    "预设 D",
    "Case D"
  ],
  "preset4": [
    "预设 E",
    "Case E"
  ],
  "preset5": [
    "预设 F",
    "Case F"
  ],
  "preset6": [
    "预设 G",
    "Case G"
  ],
  "prev": [
    "返回上一层",
    "Previous layer"
  ],
  "next": [
    "扩展一层",
    "Expand one layer"
  ],
  "end": [
    "跳到目标层",
    "Jump to target layer"
  ],
  "input": [
    "初始 {a}；目标 {b}；下标从 0 开始。",
    "Start: {a}; target: {b}; zero-based indices."
  ],
  "frame": [
    "快照 {at}/{max}；当前层 d={d} 次交换；累计入队 {seen} 个不同字符串；{status}",
    "Snapshot {at}/{max}; depth d={d} swaps; cumulative distinct strings enqueued: {seen}; {status}"
  ],
  "pending": [
    "尚未在前沿找到目标。",
    "target not yet in frontier."
  ],
  "found": [
    "目标已在前沿：最少 {d} 次交换。",
    "target in frontier: minimum {d} swaps."
  ],
  "frontTitle": [
    "当前前沿：每个字符串首次到达所需交换次数相同",
    "Current frontier: every string first reached at this depth"
  ],
  "eventsTitle": [
    "刚完成的扩展：父状态 → 每个候选子状态",
    "Expansion just completed: parent → each candidate child"
  ],
  "noEvents": [
    "尚未进行交换扩展。",
    "No swap expansion yet."
  ],
  "event": [
    "父状态 {state}；首错 i={i}，需要 {want}；候选 j=[{js}]。",
    "Parent {state}; first mismatch i={i}, needs {want}; candidate j=[{js}]."
  ],
  "child": [
    "交换 ({i}, {j}) → {child}；{status}",
    "Swap ({i}, {j}) → {child}; {status}"
  ],
  "fresh": [
    "首次到达，加入新前沿。",
    "first visit, enqueue in new frontier."
  ],
  "duplicate": [
    "已入队，跳过重复。",
    "already enqueued, skip duplicate."
  ],
  "layer": [
    "深度 {d}（{d} 次交换）：{s}",
    "Depth {d} ({d} swaps): {s}"
  ],
  "noHistory": [
    "尚无已处理层。",
    "No processed layers yet."
  ],
  "s3e": [
    "这一步要回答：在全新输入 abcb → bbca 中，首错 i=0，需要 b。哪些 j 能在不拆动已正确位置的前提下修好 i，并保留最优完成路径？这里 j 是源字符串 abcb 的下标。先作选择，再揭晓。",
    "For the fresh input abcb → bbca, the first mismatch is i=0 and needs b. Which j values can fix i while leaving already correct positions intact and retaining an optimal completion? Here j is an index in the source abcb. Choose before revealing."
  ],
  "predictionLegend": [
    "选择允许的候选下标集合",
    "Choose the allowed candidate index set"
  ],
  "option0": [
    "{1, 3}：所有带 b 的位置",
    "{1, 3}: every position holding b"
  ],
  "option1": [
    "{3}：只从尚未放对的位置取 b",
    "{3}: take b only from a misplaced position"
  ],
  "option2": [
    "{1}：只取最左边的 b",
    "{1}: take only the leftmost b"
  ],
  "reveal": [
    "验证并解释",
    "Check and explain"
  ],
  "await": [
    "尚未揭晓。请选择，再验证。",
    "Not revealed. Choose, then check."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查字母条件。",
    "Check the letter condition again."
  ],
  "answer": [
    "答案是 {3}。abcb 的 j=3 是 b，目标该处要 a，所以它尚未放对。交换 (0,3) 直接得到 bbca，只需 1 次。j=1 虽然也是 b，却已经正确；若从那里借字母，会得到 bacb，还需交换 (1,3) 才到目标。保留所需字母还不够，必须排除已经放对的来源。",
    "The answer is {3}. At j=3, abcb has b while the target needs a there, so this b is misplaced. Swapping (0,3) immediately gives bbca in 1 swap. Index 1 also holds b but is already correct. Borrowing it gives bacb, requiring another swap (1,3). Matching the needed letter alone is insufficient; exclude already correct sources."
  ],
  "s4e": [
    "这一步要回答：如何把逐层搜索写成提交？Python 方法接收 s1、s2 并返回整数。浏览器图中的整层对应队列中相同 depth 的所有项；队列先入先出保证层序。下面是可下载的完整源文件，未在浏览器中执行。",
    "How does the layer search become a submission? The Python method takes s1 and s2 and returns an integer. A whole visual layer corresponds to all queue items with the same depth. First-in-first-out order ensures layer order. Below is the complete downloadable source; the browser does not execute it."
  ],
  "map1": [
    "queue 保存 (state, depth)；popleft 取出最早状态。先判断等于目标，再扫描首错 i，避免已相等时扫描越界。",
    "queue stores (state, depth); popleft removes the earliest state. Test for the target before scanning for i, so equal strings never scan out of bounds."
  ],
  "map2": [
    "for j 对应候选列表；两个字符条件落实“不借正确字母”。list(state) 复制字符，交换后 join 拼回字符串；父状态保持不变。",
    "The for j loop creates the candidate list; its two character guards avoid borrowing correct letters. list(state) copies the characters, then join rebuilds the string after a swap; the parent stays unchanged."
  ],
  "map3": [
    "seen 在入队时记录 nxt；同一字符串首次到达已经最短，再次到达无需保留。depth+1 正是图中下一层。",
    "seen records nxt when enqueued. Its first arrival is already shortest, so later arrivals can be discarded. depth+1 is the next visual layer."
  ],
  "cost": [
    "成本：n 为长度，S = n! / ∏c! 为不同排列数（c 为每种字母的个数），V≤S 为实际访问数。每个状态最多 n 个候选，各需 O(n) 字符复制与哈希，故保守时间 O(Vn²)，空间 O(Vn)（队列和集合中的字符串）。可用 S 替代 V 写最坏上界。剪枝减少分支，但仍可能是阶乘规模。页面为可回退保留完整小样例快照，这部分不是 Python 提交的辅助空间。",
    "Cost: n is the length; S = n! / ∏c! counts distinct permutations (c is each letter count); V≤S counts states actually visited. At most n candidates per state each cost O(n) for copying and hashing, giving conservative O(Vn²) time and O(Vn) space for queued and visited strings. Replacing V by S gives a worst-case bound. Pruning reduces branching but the search may still be factorial. The page stores complete small-case snapshots for rewind; that storage is separate from submission space."
  ],
  "boundaries": [
    "边界：相等字符串立即返回 0；单字符一定相等；重复字母要保留不同子字符串；任意两处可交换，不是相邻交换距离。题目保证异位词，因此合法输入不会返回 −1。长度 20 不代表可以放心枚举 20! 种排列。",
    "Boundaries: equal strings return 0 immediately; single-character anagrams are equal. Repeated letters can produce distinct children. Swaps are between any two positions, not restricted to adjacent positions. The anagram promise makes −1 unreachable for valid inputs. Length 20 does not make enumerating 20! permutations practical."
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
    "展开完整 Python 源码",
    "Open complete Python source"
  ],
  "copied": [
    "已复制完整源码。",
    "Complete source copied."
  ],
  "fallback": [
    "自动复制不可用；完整源码已选中，请使用系统复制快捷键。",
    "Automatic copy unavailable. Complete source selected; use the system copy shortcut."
  ],
  "manualCopy": [
    "手动复制完整 Python 源码",
    "Manually copy complete Python source"
  ],
  "related1": [
    "单词接龙 II：比较 BFS 的最短层与多条路径",
    "Word Ladder II: compare shortest BFS layers and multiple paths"
  ],
  "related2": [
    "滑动谜题：比较交换生成的状态图",
    "Sliding Puzzle: compare a state graph generated by swaps"
  ],
  "bridgeTitle": [
    "先看清：改分配，还是交换字母？",
    "First distinguish reassignment from a real swap"
  ],
  "bridgeIntro": [
    "目标始终是 abca。a₀、a₁ 只是给两个 a 暂贴的标签，不是新字符。箭头 i → j 表示：把当前位置 i 的字母分配到目标位置 j。这是证明中的分配示例，与下方 BFS 实验分别操作。",
    "The target stays abca. Tags a₀ and a₁ only distinguish the two a occurrences; they are not new characters. An arrow i → j assigns the letter currently at position i to target position j. This proof example is separate from the BFS experiment below."
  ],
  "bridgeFrame": [
    "状态 {n}/4 · {action}",
    "Snapshot {n}/4 · {action}"
  ],
  "bridgeTarget": [
    "固定目标：abca",
    "Fixed target: abca"
  ],
  "bridgeCurrent": [
    "当前字符串：{s}",
    "Current string: {s}"
  ],
  "bridgePosition": [
    "位置 {i}",
    "Position {i}"
  ],
  "bridgeDestination": [
    "目的地 {i} → {j}",
    "Destination {i} → {j}"
  ],
  "bridgeChanged": [
    "目的地已改",
    "Destination changed"
  ],
  "bridgeMoved": [
    "字母已交换",
    "Token swapped"
  ],
  "bridgeCycles": [
    "环：{cycles}",
    "Cycles: {cycles}"
  ],
  "bridgeCost": [
    "按当前分配还需交换",
    "Swaps needed for this assignment"
  ],
  "bridgeSpent": [
    "已做实际交换",
    "Actual swaps so far"
  ],
  "bridgeAction0": [
    "从一份任意分配开始",
    "Start with an arbitrary assignment"
  ],
  "bridgeAction1": [
    "只改两个 a 的目的地",
    "Reassign only the two a destinations"
  ],
  "bridgeAction2": [
    "交换位置 1、2",
    "Swap positions 1 and 2"
  ],
  "bridgeAction3": [
    "交换位置 2、3",
    "Swap positions 2 and 3"
  ],
  "bridgeExplain0": [
    "这份分配把四个位置连成一个环，所以按它还需 4−1=3 次交换。先想一想：两个目的地都需要 a，若只互换两个 a 的目的地，有字母移动吗？实际要花几次交换？按“下一状态”查看。",
    "This assignment puts all four positions in one cycle, so following it needs 4−1=3 swaps. Predict first: both destinations need a. If we only exchange the two a destinations, will any letters move? How many actual swaps will that cost? Choose Next snapshot to see."
  ],
  "bridgeExplain1": [
    "没有字母移动，实际花费 0 次交换。只把 0→3、1→0 改成 0→0、1→3；字符串仍是 aabc。位置 0 单独成环，按新分配还需 4−2=2 次。原题答案并没有从 3 变成 2：原先的 3 只是较差分配的代价，不是原题的下界。",
    "No letters move, so this costs 0 actual swaps. Only 0→3 and 1→0 change to 0→0 and 1→3; the string is still aabc. Position 0 becomes its own cycle, and this assignment needs 4−2=2 swaps. The original answer did not fall from 3 to 2: 3 was the cost of the worse assignment, not a lower bound for the original problem."
  ],
  "bridgeExplain2": [
    "这次真的交换了位置 1、2 的 a₁ 和 b，aabc → abac。两个字母各自带着其分配的目的地移动。实际已花 1 次；位置 1 也正确了，只剩位置 2、3 的二元环，按当前分配还需 1 次。",
    "This time we really swap a₁ and b at positions 1 and 2: aabc → abac. Each token moves with its assigned destination. We have spent 1 actual swap; position 1 is now correct too. Only the two-position cycle 2,3 remains, requiring 1 more swap for this assignment."
  ],
  "bridgeExplain3": [
    "再交换位置 2、3 的 a₁ 和 c，abac → abca。实际共花 2 次；四个位置各自成环，还需 0 次。初始串有三个位置不对，一次交换至多改变两个位置，所以 1 次不够；这两次交换确实达到了原题最优值 2。",
    "Swap a₁ and c at positions 2 and 3: abac → abca. We spent 2 actual swaps; all four positions are singletons, with 0 swaps left. Initially three positions were wrong and one swap changes at most two positions, so 1 cannot suffice. These two swaps therefore attain the original optimum of 2."
  ],
  "bridgeConclusion": [
    "上例展示的是“有一条最优路线可以这样走”。下面的论证说明，首错位置一定有一个符合条件的最优搭档 j，但并未告诉我们怎样直接找到它。因此仍要保留所有符合条件的 j，不能只选第一个。",
    "The example shows that an optimal route can work this way. The argument below establishes that the first mismatch has an eligible optimal partner j, but does not tell us how to find that partner directly. We must still keep every eligible j, not greedily choose the first one."
  ],
  "bridgePrev": [
    "上一状态",
    "Previous snapshot"
  ],
  "bridgeNext": [
    "下一状态",
    "Next snapshot"
  ],
  "bridgeReset": [
    "重置分配示例",
    "Reset assignment example"
  ]
};
