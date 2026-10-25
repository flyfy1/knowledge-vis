'use strict';
window.COPY = {
  "docTitle": [
    "#960 · 删列造序 III",
    "#960 · Delete Columns to Make Sorted III"
  ],
  "back": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "index": [
    "知识索引",
    "Knowledge Index"
  ],
  "heading": [
    "#960 · 删列造序 III",
    "#960 · Delete Columns to Make Sorted III"
  ],
  "intro": [
    "两行字符共用一把“列剪刀”：每剪一列，两行都失去该位置。怎样剪得最少，让每行从左到右不下降？",
    "Two rows share one set of column cuts. Every cut removes that position from both rows. How few cuts make each row nondecreasing?"
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
    "1 · 共用剪刀",
    "1 · Shared cuts"
  ],
  "nav1": [
    "2 · 枚举与误区",
    "2 · Choices and traps"
  ],
  "nav2": [
    "3 · 保留链",
    "3 · Kept chains"
  ],
  "nav3": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav4": [
    "5 · Python 实现",
    "5 · Python"
  ],
  "s0": [
    "1 · 这一刀剪哪里？",
    "1 · Where should the cut go?"
  ],
  "p0": [
    "问题：对 [\"bac\", \"abc\"]，最少删几列？列是同一竖排的位置，下面使用从 0 开始的列下标。目标是每行不下降，即后一个字符不小于前一个；允许相等。不要求两行之间有序。",
    "Question: for [\"bac\", \"abc\"], what is the minimum number of deleted columns? A column is one shared position; indices below start at 0. Each row must be nondecreasing: every next character is at least the previous one. Equality is allowed. The rows need not be ordered relative to one another."
  ],
  "handReveal": [
    "显示 / 隐藏手算",
    "Show / hide hand calculation"
  ],
  "hand": [
    "原样保留时，第一行 b > a，失败。删列 1，保留列 [0,2]，得到 \"bc\" 和 \"ac\"：b ≤ c，a ≤ c。因此 1 次删除可行，而 0 次不行，最小值是 1。注意 \"bc\" > \"ac\" 没关系。",
    "Keeping everything fails because the first row has b > a. Delete column 1 and keep [0,2]: the rows become \"bc\" and \"ac\", with b ≤ c and a ≤ c. One deletion works and zero does not, so the minimum is 1. It is fine that \"bc\" > \"ac\"."
  ],
  "s1": [
    "2 · 为什么不能看到就保留？",
    "2 · Why not keep the first legal column?"
  ],
  "p1": [
    "问题：怎样保证没有漏掉更好的选择？子序列是按原顺序保留的一组位置。基线方法尝试每列的“删 / 留”两种选择，再逐行检查。三列共有 8 种选择；[0,1,2] 失败，[0,2] 成功，[1,2] 也成功。保留最多 2 列等价于删除最少 1 列。",
    "Question: how can we avoid overlooking a better choice? A subsequence keeps selected positions in their original order. The baseline tries delete/keep for every column, then checks every row. Three columns give eight choices: [0,1,2] fails, [0,2] works, and [1,2] works too. Keeping at most two columns means deleting at least one."
  ],
  "baselineIntro": [
    "以下基线返回最少删除数。choices 从空位置列表开始，每遇到一列就复制已有选择，并加上保留这列的版本。它只适合小输入，可用来独立核对。",
    "This baseline returns the minimum deletion count. Starting from an empty list of indices, choices duplicates each selection with a version that keeps the next column. Use it only on small inputs as an independent check."
  ],
  "baselineCost": [
    "n 是行数，m 是列数。共有 2^m 组选择，每组最多检查 nm 个字符：时间 O(nm·2^m)，此处保存所有选择需 O(m·2^m) 空间。官方 n、m 均为 1 到 100，字符串等长且只含小写英文字母；m=100 时不能这样枚举。",
    "Let n be the number of rows and m the number of columns. There are 2^m selections, each checking at most nm characters: O(nm·2^m) time. This version stores all selections in O(m·2^m) space. Official inputs have 1–100 rows and columns, equal-length lowercase English strings; enumeration is impractical at m=100."
  ],
  "wrong": [
    "诱人的错误：先保留第一个合法列，再一路追加。对 [\"cab\",\"abc\"]，先留列 0 后，第一行的 c 挡住 a、b，只能留 1 列。但跳过列 0 可留 [1,2]，得到 \"ab\"、\"bc\"，留 2 列。只看第一行也不行：[\"abc\",\"cba\"] 中任何两列都会让第二行下降。",
    "Tempting mistake: keep the first legal column, then append greedily. For [\"cab\",\"abc\"], keeping column 0 first leaves c blocking both a and b in the first row, so only one column survives. Skipping 0 lets us keep [1,2], giving \"ab\" and \"bc\": two columns. Checking only the first row also fails: in [\"abc\",\"cba\"], any two columns decrease in the second row."
  ],
  "s2": [
    "3 · 每个结尾各记一个最好长度",
    "3 · Keep a best length for every ending"
  ],
  "p2": [
    "问题：为什么“最后保留哪一列”足够概括过去？回到 [\"bac\",\"abc\"]：列 0 单独保留，长度 1。列 1 不能接在 0 后，因为第一行 b > a，所以它也从长度 1 开始。列 2 可接 0：b ≤ c 且 a ≤ c，得到长度 2；它也可接 1：a ≤ c 且 b ≤ c，仍为 2。两条链同样好。",
    "Question: why does the last kept column summarize the past? Return to [\"bac\",\"abc\"]. Column 0 alone has length 1. Column 1 cannot follow 0 because b > a in row 0, so it also starts at length 1. Column 2 can follow 0: b ≤ c and a ≤ c, giving length 2. It can also follow 1: a ≤ c and b ≤ c, again giving 2. Both chains are optimal."
  ],
  "derive": [
    "称 i → j 兼容，意思是 i < j 且每行 strs[r][i] ≤ strs[r][j]，r 是行下标。定义 dp[j] 为以列 j 结尾的最长合法保留链长度。追加 j 只需检查前一列 i：每行的 ≤ 可传递，较早字符已经不大于 i。无需重新检查整个历史。",
    "Call i → j compatible when i < j and strs[r][i] ≤ strs[r][j] in every row, where r is the row index. Define dp[j] as the longest valid kept chain ending at column j. To append j, only the preceding column i needs checking: ≤ is transitive within each row, and earlier kept characters are already at most those in i. We avoid rechecking the entire history."
  ],
  "formula": [
    "dp[j] = max({1} ∪ {dp[i] + 1 : 0 ≤ i < j 且 i → j 兼容})；答案 = m − max(dp)",
    "dp[j] = max({1} ∪ {dp[i] + 1 : 0 ≤ i < j and i → j is compatible}); answer = m − max(dp)"
  ],
  "proof": [
    "不变量（每完成一列都成立的陈述）：已完成的 dp[j] 恰是该结尾的最长长度。单列总合法，故初值为 1。任意更长合法链都有前一列 i；去掉 j 后的长度不超过 dp[i]，所以原链不超过 dp[i]+1。反过来，给以 i 结尾的最优链追加兼容的 j 就能达到该值。枚举全部 i 得到精确最大值。按 j 递增计算时，所有依赖已完成；最终最优链必有某个结尾，因此 m−max(dp) 就是最少删除数。",
    "Invariant—a statement true after each completed column: every completed dp[j] is exactly the longest length for that ending. One column is always valid, so start at 1. Any longer valid chain has a preceding column i. Removing j leaves a chain of length at most dp[i], bounding the original by dp[i]+1. Conversely, appending a compatible j to an optimal chain ending at i attains that value. Trying every i gives the exact maximum. Increasing j ensures all dependencies are complete. A longest chain has some ending, so m−max(dp) is the minimum deletion count."
  ],
  "guide": [
    "操作：选择预设会重置此模拟。逐次“完成下一列”，观察下方所有候选的逐行比较和 dp 的旧值 → 新值，再后退核对。输入固定，变化的是已完成的列数。",
    "Try this: changing the preset resets this simulation. Complete one column at a time; inspect every candidate’s row comparisons and the old → new dp value, then rewind to check it. The input stays fixed; only the number of completed columns changes."
  ],
  "presets": [
    "模拟输入（更换会重置）",
    "Simulation input (changing resets)"
  ],
  "preset0": [
    "手算 · bac / abc",
    "Worked · bac / abc"
  ],
  "preset1": [
    "官方 1 · babca / bbazb",
    "Official 1 · babca / bbazb"
  ],
  "preset2": [
    "递减 · edcba",
    "Decreasing · edcba"
  ],
  "preset3": [
    "已排序 · ghi / def / abc",
    "Sorted · ghi / def / abc"
  ],
  "preset4": [
    "相等 · aaa / bbb",
    "Equal · aaa / bbb"
  ],
  "preset5": [
    "贪心陷阱 · cab / abc",
    "Greedy trap · cab / abc"
  ],
  "sim": [
    "这是 JavaScript 教学模拟，没有运行下方 Python 提交。每帧在一整列的全部候选检查完成后；不省略候选。图表保留教学快照和一条最优链，Python 只存 dp 长度。",
    "This is a JavaScript teaching simulation; it does not execute the Python submission below. Each frame follows all candidate checks for one column; no candidates are omitted. The display stores teaching snapshots and one optimal chain; Python stores only dp lengths."
  ],
  "prev": [
    "← 撤回一列",
    "← Undo one column"
  ],
  "next": [
    "完成下一列 →",
    "Complete next column →"
  ],
  "reset": [
    "重置模拟",
    "Reset simulation"
  ],
  "end": [
    "完成全部列",
    "Complete all columns"
  ],
  "progress": [
    "已完成列：{k}/{m}；当前完成的列 j = {j}",
    "Completed columns: {k}/{m}; just-completed column j = {j}"
  ],
  "inputCaption": [
    "输入：行 r × 原始列下标；◆ 表示当前完成列",
    "Input: row r × original column index; ◆ marks the just-completed column"
  ],
  "row": [
    "行 {r}",
    "Row {r}"
  ],
  "caption": [
    "保留的计算记录；— 表示尚未计算，非零值",
    "Retained calculation ledger; — means not computed, not zero"
  ],
  "th0": [
    "结尾列 j",
    "Ending column j"
  ],
  "th1": [
    "dp[j]：保留列数",
    "dp[j]: kept columns"
  ],
  "th2": [
    "完成状态",
    "Completion state"
  ],
  "done": [
    "已完成",
    "Complete"
  ],
  "pendingCell": [
    "尚未计算",
    "Not computed"
  ],
  "current": [
    "◆ 当前完成",
    "◆ Just completed"
  ],
  "pairsTitle": [
    "当前列的全部候选（按 i 递增）",
    "All candidates for this column (in increasing i)"
  ],
  "initial": [
    "还未处理列。下一步将完成列 0，单列长度为 1。",
    "No column processed yet. Next completes column 0, whose singleton length is 1."
  ],
  "singleton": [
    "列 0 没有前一列；dp[0] = 1。",
    "Column 0 has no predecessor; dp[0] = 1."
  ],
  "comparison": [
    "行 {r}：{a} {op} {b}（{status}）",
    "Row {r}: {a} {op} {b} ({status})"
  ],
  "pass": [
    "通过",
    "pass"
  ],
  "fail": [
    "不通过",
    "fail"
  ],
  "candidate": [
    "候选 {i} → {j}：{checks}。兼容，候选长度 dp[{i}]+1 = {candidate}；dp[{j}]：{old} → {value}。",
    "Candidate {i} → {j}: {checks}. Compatible, candidate length dp[{i}]+1 = {candidate}; dp[{j}]: {old} → {value}."
  ],
  "reject": [
    "候选 {i} → {j}：{checks}。至少一行下降，拒绝；dp[{j}]：{old} → {value}。",
    "Candidate {i} → {j}: {checks}. At least one row decreases: reject; dp[{j}]: {old} → {value}."
  ],
  "path": [
    "已完成列中的一条最长链：[{path}]，长度 {length}。保留后的各行：{rows}。并列时保留先找到的链。",
    "One longest chain among completed columns: [{path}], length {length}. Resulting rows: {rows}. Ties retain the first chain found."
  ],
  "notFinal": [
    "尚未处理所有列，暂不报告最终最少删除数。",
    "Some columns remain; the final minimum deletion count is not yet reported."
  ],
  "result": [
    "最终最少删除列数 = {m} − {length} = {answer}。",
    "Final minimum deleted columns = {m} − {length} = {answer}."
  ],
  "s3": [
    "4 · 新输入，先作预测",
    "4 · Predict a fresh input"
  ],
  "p3": [
    "问题：对 [\"azbc\",\"abcd\"]，最少删除几列？下标仍从 0 开始。想一想：第一行的 z 会阻挡后续哪些列？只选一个答案，再揭晓。此题与上方模拟独立。",
    "Question: for [\"azbc\",\"abcd\"], how many columns must be deleted at minimum? Indices still start at 0. Which later columns does z in the first row block? Choose an answer before revealing. This exercise is independent of the simulation."
  ],
  "legend": [
    "预测最少删除列数",
    "Predict the minimum deletion count"
  ],
  "opt0": [
    "0 列",
    "0 columns"
  ],
  "opt1": [
    "2 列",
    "2 columns"
  ],
  "opt2": [
    "1 列",
    "1 column"
  ],
  "reveal": [
    "核对并揭晓",
    "Check and reveal"
  ],
  "pending": [
    "先选择答案；推导尚未揭晓。",
    "Choose an answer; the derivation is still hidden."
  ],
  "chosen": [
    "已选择。点击“核对并揭晓”查看推导。",
    "Choice recorded. Use Check and reveal to see the derivation."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查每个结尾的最好长度。",
    "Recheck the best length for each ending."
  ],
  "explanation": [
    "dp = [1,2,2,3]。列 2 的 b 不能接在 z 后，但可接列 0 的 a；列 3 的 c 接列 2，保留 [0,2,3] 得到 \"abc\"、\"acd\"。所以 4−3=1。0 不行，因为 z>b；2 虽可行，却漏掉了长度 3 的链。",
    "dp = [1,2,2,3]. Column 2’s b cannot follow z, but it can follow column 0’s a. Column 3’s c follows column 2. Keeping [0,2,3] gives \"abc\" and \"acd\", so 4−3=1. Zero fails because z>b; two deletions are feasible but miss the length-3 chain."
  ],
  "s4": [
    "5 · 把不变量写成 Python",
    "5 · Turn the invariant into Python"
  ],
  "p4": [
    "问题：如何用官方接口返回最少删除数？Python 3 的 Solution.minDeletionSize 接收等长字符串列表 strs，返回整数，不修改输入。",
    "Question: how do we return the minimum deletion count through the official interface? Python 3’s Solution.minDeletionSize takes the equal-length string list strs, returns an integer, and does not mutate the input."
  ],
  "mapping": [
    "n、m 分别是行数和列数。dp = [1] * m 给每个结尾单列起点；外层 j 依次完成列；内层 i 遍历所有前一列。compatible 初始为 True，任一行下降即设 False 并 break（停止本次逐行检查）。通过时，用 max 保留较长链。比如手算的 i=0、j=2，dp[2] 从 1 变 2；再试 i=1 得 2，原值保持。最后用 m 减去所有结尾的最大长度。",
    "n and m are row and column counts. dp = [1] * m starts every ending with a singleton. The outer j loop completes columns in order; the i loop tries every predecessor. compatible starts True; a decrease in any row sets it False and break stops that row check. If it passes, max retains the longer chain. In the worked case, i=0, j=2 changes dp[2] from 1 to 2. Trying i=1 also gives 2, so it stays 2. Finally subtract the largest ending length from m."
  ],
  "cost": [
    "提交成本：最多 m(m−1)/2 对列，每对最多检查 n 行，因此时间 O(nm²)，辅助空间 O(m)。n、m ≤ 100，最多 495000 次行比较。教学模拟另外保存历史，不计入提交的空间。",
    "Submission cost: at most m(m−1)/2 column pairs, each checking at most n rows: O(nm²) time and O(m) auxiliary space. With n,m ≤ 100 there are at most 495000 row comparisons. The teaching simulation stores additional history, which is not submission space."
  ],
  "boundaries": [
    "边界：一列时不必删除；所有字符相等时全部保留，比较应使用 > 来拒绝而不是 ≥；严格递减的单行只能留一列，删 m−1。多行中每一行都必须通过同一条链；分别给每行求最长链再取长度，无法保证位置一致。官方输入不含空列表或空字符串。",
    "Boundaries: one column needs no deletion. Equal characters can all stay, so reject with > rather than ≥. A strictly decreasing single row keeps only one column and deletes m−1. Every row must share the same chain: taking lengths of separate longest chains does not ensure matching positions. Official inputs exclude empty lists and empty strings."
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
    "已复制完整源代码。",
    "Full source copied."
  ],
  "copyFallback": [
    "自动复制不可用。已选中完整源码，请使用系统复制快捷键。",
    "Automatic copying is unavailable. The full source is selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "完整 Python 源码（只读）",
    "Full Python source (read only)"
  ],
  "related": [
    "继续关联概念",
    "Related concepts"
  ],
  "rel1": [
    "#115 · 子序列与位置选择",
    " #115 · Subsequences and position choices"
  ],
  "rel2": [
    "#801 · 按状态保留最优值",
    " #801 · Retaining an optimum per state"
  ],
  "foot": [
    "每次连接都要通过所有行；每个结尾各留一个最优长度。",
    "Every link must pass all rows; keep an optimum for each ending."
  ]
};
