window.LESSON_COPY = {
  "docTitle": [
    "1074 · 元素和为目标值的子矩阵数量",
    "1074 · Number of Submatrices That Sum to Target"
  ],
  "title": [
    "#1074 · 元素和为目标值的子矩阵数量",
    "#1074 · Number of Submatrices That Sum to Target"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode lessons"
  ],
  "intro": [
    "一块 2×2 的数字板，为什么能藏着五个和为零的矩形？从逐块相加走到边界计数。",
    "How can a 2×2 board hide five zero-sum rectangles? Start with addition, then learn to count boundaries."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "课程步骤",
    "Lesson steps"
  ],
  "nav1": [
    "1 · 数矩形",
    "1 · Count rectangles"
  ],
  "nav2": [
    "2 · 固定两行",
    "2 · Fix two rows"
  ],
  "nav3": [
    "3 · 数前缀",
    "3 · Count prefixes"
  ],
  "nav4": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav5": [
    "5 · 实现与边界",
    "5 · Code & limits"
  ],
  "h1": [
    "1 · 哪些矩形的和是零？",
    "1 · Which rectangles sum to zero?"
  ],
  "p1": [
    "看这块数字板 [[1,−1],[−1,1]]，目标 target=0。子矩阵就是选取连续几行、连续几列形成的非空矩形；里面每个格子都要相加。行、列编号均从 0 开始，边界包含端点。要返回的是矩形的个数，不是面积，也不是不同总和的个数。",
    "Take the board [[1,−1],[−1,1]] with target=0. A submatrix is a nonempty rectangle of consecutive rows and consecutive columns; add every cell inside it. Row and column indices start at 0, and both ends are included. Return a count of rectangles, not an area or a count of distinct sums."
  ],
  "handHint": [
    "依次查看五个命中矩形。青色边框标出选中的格子；下方保留全部五项，橙色文字标出当前项。数字始终是输入值。",
    "Inspect the five matching rectangles in order. Cyan borders select their cells; the list retains all five, with the current item marked in orange text. Cell numbers always remain the input values."
  ],
  "handPrev": [
    "上一个矩形",
    "Previous rectangle"
  ],
  "handNext": [
    "下一个矩形",
    "Next rectangle"
  ],
  "handRead": [
    "矩形 {i}/5：行 [{top},{bottom}]，列 [{left},{right}]；{sum} = 0。",
    "Rectangle {i}/5: rows [{top},{bottom}], columns [{left},{right}]; {sum} = 0."
  ],
  "rectItem": [
    "行 [{top},{bottom}] × 列 [{left},{right}]",
    "Rows [{top},{bottom}] × columns [{left},{right}]"
  ],
  "handConclusion": [
    "两条横条、两条竖条和整块板：共 5 个。四个单格都是 ±1，不能命中；所以 9 个非空矩形中，恰有这五个。即使两块内容相同，只要边界不同也分别计数。",
    "Two horizontal strips, two vertical strips, and the whole board: 5. All four single cells are ±1 and fail, so these five are exactly the matches among the 9 nonempty rectangles. Equal contents still count separately when their boundaries differ."
  ],
  "constraints": [
    "官方范围：行数 m、列数 n 均为 1…100；元素为 −1000…1000；target 为 −10⁸…10⁸。输入非空且为矩形，无取模要求。",
    "Official limits: m rows and n columns, each 1…100; entries −1000…1000; target −10⁸…10⁸. The input is a nonempty rectangular matrix. No modulus is requested."
  ],
  "h2": [
    "2 · 固定上下边界，能省掉什么？",
    "2 · What can fixed row boundaries save?"
  ],
  "p2": [
    "仍用刚才的板。先只看第 0 行：按列得到 [1,−1]，连续列区间 [0,1] 的和是 0，对应第一条横条。现在把下边界延伸到第 1 行：第 0 列 1+(−1)=0，第 1 列 −1+1=0，得到 [0,0]。这里的行带就是固定 top 到 bottom 的连续几行；压缩列 cols[c] 是该行带里第 c 列的总和。",
    "Keep the same board. With only row 0, column totals are [1,−1]; columns [0,1] sum to 0 and give the first horizontal strip. Extend the bottom to row 1: column 0 becomes 1+(−1)=0, and column 1 becomes −1+1=0, giving [0,0]. A row band means consecutive rows from a fixed top to bottom. A compressed column cols[c] is the sum of column c inside that band."
  ],
  "bandArithmetic": [
    "行带 [0,1] 的 [0,0] 有三个命中列区间：[0,0]、[1,1]、[0,1]，分别还原为两条竖条和整板。最后只取行带 [1,1]，再得到第二条横条。贡献为 1+3+1=5。延伸 bottom 时只加新的一行；换 top 时把 cols 清零。",
    "For band [0,1], [0,0] has three matching column intervals: [0,0], [1,1], [0,1]. They reconstruct the two vertical strips and the whole board. Finally band [1,1] contributes the second horizontal strip. Contributions are 1+3+1=5. Extending bottom adds only the new row; changing top starts cols from zero."
  ],
  "baseline": [
    "直接法先枚举 top、bottom、left、right，再逐格求和。共有 m(m+1)n(n+1)/4 个矩形，每个最多 mn 格：O(m³n³) 时间、O(1) 额外空间。100×100 就有 25,502,500 个矩形。即使用二维前缀和（表中每项保存左上角到该格子的总和）把一次矩形求和降到 O(1)，仍需枚举 O(m²n²) 个矩形。我们要连重复枚举左边界的工作也省掉。",
    "A direct baseline chooses top, bottom, left, right and adds cells. There are m(m+1)n(n+1)/4 rectangles, each with up to mn cells: O(m³n³) time and O(1) auxiliary space. A 100×100 board has 25,502,500 rectangles. Even a two-dimensional prefix table (each entry sums cells from the top-left corner to that cell) giving O(1) rectangle sums still enumerates O(m²n²) rectangles. We want to avoid repeatedly enumerating left boundaries too."
  ],
  "baseSource": [
    "查看独立的逐格基线",
    "Inspect the independent cell-by-cell baseline"
  ],
  "baseHelp": [
    "四层循环选择包含端点的边界；最后两层逐格累加。int(条件) 在相等时为 1，否则为 0，累加的就是命中个数。",
    "Four loops choose inclusive boundaries; the last two add cells. int(condition) is 1 for equality and 0 otherwise, so adding it counts matches."
  ],
  "wrongWindow": [
    "为什么不能用“和太大就删左端”的窗口？行带 [2,−2]、target=0：读到 2 就删掉它，会漏掉随后 2+(−2)=0 的整个区间。负数会把大和拉回目标，和的变化没有单调方向。",
    "Why not shrink a window whenever its sum is too large? For band [2,−2], target=0, discarding 2 immediately loses the later interval 2+(−2)=0. A negative value can bring a large sum back to target; sums do not move in one direction."
  ],
  "h3": [
    "3 · 怎样一次找回所有左边界？",
    "3 · How can we recover all left boundaries at once?"
  ],
  "p3": [
    "对一个固定行带，cols 是各列的总和。前缀 P[p] 定义为边界 p 之前所有列的和，空前缀 P[0]=0。处理列 c 后，s=P[c+1]。列区间 [left,c] 的和是 s−P[left]；因此只要找以前出现过多少次 s−target，就找到了多少个合法 left。seen 是“前缀值 → 出现次数”的字典，而不是只记有没有出现的集合。",
    "For one fixed row band, cols holds column totals. Define prefix P[p] as the sum of columns before boundary p, with empty prefix P[0]=0. After column c, s=P[c+1]. The interval [left,c] sums to s−P[left]. Counting earlier occurrences of s−target therefore counts exactly the valid left boundaries. seen is a dictionary from prefix value to frequency, rather than a set recording only membership."
  ],
  "formula": [
    "P[c+1] − P[left] = target  ⇔  P[left] = s − target",
    "P[c+1] − P[left] = target  ⇔  P[left] = s − target"
  ],
  "derive": [
    "回到 [0,0]、target=0：开始 seen={0:1}，它代表列 0 之前的边界。第一列后 s=0，查到 1 个旧边界，先加 1，再把 seen[0] 改成 2。第二列后 s 仍为 0，现在查到 2 个旧边界，再加 2。1+2=3；集合会丢掉第二个旧边界。必须先查询再插入，否则 target=0 时当前边界会和自己配对，错误地数入空区间。",
    "Return to [0,0], target=0. Start with seen={0:1}, representing the boundary before column 0. After the first column s=0: find 1 earlier boundary, add 1, then increase seen[0] to 2. After the second column s is still 0: now find 2 earlier boundaries and add 2. The result is 1+2=3; a set loses the second earlier boundary. Query before insertion, or for target=0 the current boundary pairs with itself and falsely counts an empty interval."
  ],
  "preset": [
    "矩阵预设",
    "Matrix preset"
  ],
  "presetsHelp": [
    "切换预设会从头重启这个实验。保持目标不变，逐列推进：先看行带与压缩列，再看旧字典的匹配，最后看历史贡献。返回会恢复全部数值；到达新行带时字典重置。",
    "Changing a preset restarts this experiment. Keep its target fixed and advance column by column: inspect the band and column totals, then matches in the old dictionary, then the contribution history. Back restores every value; a new band resets the dictionary."
  ],
  "caseHand": [
    "示例 2 · 2×2 抵消",
    "Example 2 · 2×2 cancellation"
  ],
  "caseCross": [
    "示例 1 · 四角为零",
    "Example 1 · Zero corners"
  ],
  "case904": [
    "示例 3 · 单格 904",
    "Example 3 · Single 904"
  ],
  "caseZeros": [
    "重复前缀 · [0,0]",
    "Repeated prefixes · [0,0]"
  ],
  "caseNegative": [
    "负数回拉 · [2,−2]",
    "Negative recovery · [2,−2]"
  ],
  "caseHit": [
    "单格命中 · [5]",
    "Single match · [5]"
  ],
  "caseTall": [
    "单列 · [1,−1,0]",
    "One column · [1,−1,0]"
  ],
  "input": [
    "输入 matrix={matrix}；target={target}。",
    "Input matrix={matrix}; target={target}."
  ],
  "boardLabel": [
    "矩阵；行列编号从零开始",
    "Matrix; zero-based row and column indices"
  ],
  "rowIndex": [
    "行 {r}",
    "row {r}"
  ],
  "colIndex": [
    "列 {c}",
    "col {c}"
  ],
  "corner": [
    "行 / 列",
    "row / col"
  ],
  "legend": [
    "青色边框＝当前行带；橙色边框＝刚处理的列在行带内的格子。未选格子仍保留原值。下方压缩列 c 对应原矩阵第 c 列。",
    "Cyan border = current row band; orange border = cells in its just-processed column. Unselected cells keep their original values. Compressed column c below corresponds to original column c."
  ],
  "colsLabel": [
    "压缩列 cols：",
    "Compressed columns cols:"
  ],
  "colValue": [
    "列 {c}：{v}",
    "col {c}: {v}"
  ],
  "backStep": [
    "退回上一操作",
    "Previous operation"
  ],
  "next": [
    "执行下一操作",
    "Next operation"
  ],
  "reset": [
    "重置此实验",
    "Reset experiment"
  ],
  "end": [
    "跳到最终结果",
    "Jump to final result"
  ],
  "bandEvent": [
    "已初始化行带 [{top},{bottom}]。cols 已包含这些行；s=0，seen={0:1}，尚未扫描此行带的列。旧行带的贡献保留在历史中，旧字典已清空。",
    "Initialized band [{top},{bottom}]. cols includes these rows; s=0, seen={0:1}, and no column in this band has been scanned. Prior band contributions remain in the history; its dictionary was cleared."
  ],
  "columnEvent": [
    "已处理行带 [{top},{bottom}] 的列 {c}：s 从 {oldS} 加 {value} 得到 {s}；在旧字典查询 {s}−({target})={need}，命中 {hits} 个旧边界，然后插入前缀 {s}。",
    "Processed column {c} of band [{top},{bottom}]: s changed from {oldS} by adding {value}, giving {s}; queried {s}−({target})={need} in the old dictionary, found {hits} earlier boundaries, then inserted prefix {s}."
  ],
  "progress": [
    "操作 {i}/{last}；当前行带累计 {bandTotal} 个；所有已处理列累计 {total} 个矩形。{end}",
    "Operation {i}/{last}; current band subtotal {bandTotal}; all processed columns total {total} rectangles. {end}"
  ],
  "terminal": [
    "已完成所有行带，这是最终答案。",
    "All bands complete: this is the final answer."
  ],
  "inProgress": [
    "尚未完成全部行带。",
    "Some bands remain."
  ],
  "before": [
    "查询前的 seen：{map}",
    "seen before query: {map}"
  ],
  "after": [
    "操作后的 seen：{map}",
    "seen after operation: {map}"
  ],
  "noneBefore": [
    "新行带尚未查询。",
    "No query yet in this new band."
  ],
  "matchLine": [
    "匹配的旧边界 left：{positions}。各自形成列区间：{intervals}。",
    "Matching earlier left boundaries: {positions}. They form column intervals: {intervals}."
  ],
  "noMatch": [
    "本次没有匹配的旧边界，不新增矩形。",
    "No earlier boundary matches this query; no rectangle is added."
  ],
  "ledgerTitle": [
    "累计贡献历史（每行是已处理的一列）",
    "Contribution history (one row per processed column)"
  ],
  "ledgerHelp": [
    "行带用 [top,bottom] 表示。s 是当前前缀，need 是要找的旧前缀；新增是本列命中数，总计覆盖此前所有行带和列。这里只保留小预设的完整历史，没有省略操作。",
    "A band is [top,bottom]. s is the current prefix, need is the wanted earlier prefix; added counts this column, and total includes all processed bands and columns. These small presets retain the full history without skipped operations."
  ],
  "thBand": [
    "行带",
    "Band"
  ],
  "thColumn": [
    "列 c",
    "Column c"
  ],
  "thPrefix": [
    "当前 s",
    "Current s"
  ],
  "thNeed": [
    "所需 need",
    "Wanted need"
  ],
  "thAdded": [
    "新增",
    "Added"
  ],
  "thTotal": [
    "总计",
    "Total"
  ],
  "emptyLedger": [
    "尚无已处理列；总计为 0。",
    "No processed columns yet; total is 0."
  ],
  "simulation": [
    "这是 JavaScript 教学模拟，不会执行下方 Python 提交。图中保存了历史快照；正式算法只保留当前压缩列和字典。",
    "This is a JavaScript teaching simulation; it does not execute the Python submission below. The diagram saves historical snapshots; the submission keeps only current columns and a dictionary."
  ],
  "invariant": [
    "不变量（每次查询前保持的事实）：seen 恰好统计边界 0…c 的前缀，即严格早于新边界 c+1 的全部前缀。初始空前缀使它成立；查询只取合法 left≤c，插入新前缀又使下一列满足它。每个矩形有唯一的 top、bottom、right 和 left，因此不会漏算或重复；扫描完所有行带就得到全部答案。",
    "Invariant (the fact preserved before each query): seen counts exactly prefixes at boundaries 0…c, all strictly earlier than new boundary c+1. The initial empty prefix establishes it. The query uses only legal left≤c; inserting the new prefix establishes it for the next column. Each rectangle has a unique top, bottom, right, and left, so none is missed or duplicated. Scanning all bands therefore gives the full answer."
  ],
  "h4": [
    "4 · 新的一列会贡献几个？",
    "4 · How many does the new column contribute?"
  ],
  "p4": [
    "独立新题：矩阵只有一行 [2,−2,2,−2]，target=0。前缀仍是“边界之前的列之和”，字典保存旧前缀的出现次数。处理最后一列（c=3）时，仅以这一列结尾的非空区间有几个和为 0？不是问整行总共有几个。请先选择，再揭晓。",
    "A fresh case: the matrix is one row [2,−2,2,−2], target=0. A prefix still means the sum before a boundary; the dictionary stores earlier prefix frequencies. When processing the last column (c=3), how many nonempty zero-sum intervals end at that column? This asks about that endpoint, not the whole-row total. Choose before revealing."
  ],
  "choose": [
    "你的预测",
    "Your prediction"
  ],
  "opt0": [
    "1 个：相同前缀只算一次",
    "1: count an equal prefix only once"
  ],
  "opt1": [
    "3 个：把新前缀也算进去",
    "3: include the new prefix too"
  ],
  "opt2": [
    "2 个：每个旧边界分别计数",
    "2: count each earlier boundary separately"
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal and explain"
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "这次预测需要修正。",
    "Revise this prediction."
  ],
  "answer": [
    "最后 s=0，旧前缀（边界 0…3）为 [0,2,0,2]。需要 s−target=0，它在边界 0 和 2 出现两次，所以列 [0,3] 与 [2,3] 各贡献 1，共 2 个。选 1 会丢掉一个合法左边界；选 3 会把新边界 4 和自己配对，计入空区间。整行总数为 4，但本次只问最后一列的贡献。",
    "The final s=0; earlier prefixes at boundaries 0…3 are [0,2,0,2]. We need s−target=0, occurring at boundaries 0 and 2. Intervals [0,3] and [2,3] contribute 1 each, hence 2. Choosing 1 loses a legal left boundary; choosing 3 pairs new boundary 4 with itself and counts an empty interval. The whole-row total is 4, but this question asks only for the last column's contribution."
  ],
  "h5": [
    "5 · 怎样把不变量写进 Python？",
    "5 · How does the invariant become Python?"
  ],
  "p5": [
    "m、n 分别是行、列数。top/bottom 固定包含端点的行带；cols[c] 是行带内第 c 列的总和。前缀是从列 0 开始连续几列的和；s 是当前前缀，seen 把旧前缀值映射到出现次数。每个行带重新令 seen={0:1}、s=0。seen.get(x,0) 读出值 x 的旧次数，不存在就返回 0。查询 s−target 后再增加 seen[s]，保证新边界不会匹配自己。返回整数 answer；代码不会修改 matrix。",
    "m and n are row and column counts. top/bottom fix an inclusive row band; cols[c] sums column c inside it. A prefix sums consecutive columns starting at column 0; s is the current prefix, and seen maps earlier prefix values to frequencies. Each band restarts seen={0:1}, s=0. seen.get(x,0) reads the old frequency of x, or returns 0 if absent. Query s−target before incrementing seen[s] so the new boundary cannot match itself. Return integer answer; the code leaves matrix unchanged."
  ],
  "mapping": [
    "对照行带 [0,1] 的 [0,0]：cols[c] += matrix[bottom][c] 把第二行加进去；第二个 value=0 令 s 仍为 0；answer += seen.get(0,0) 加 2；seen[0] 随后从 2 变 3。模拟中“查询前 / 操作后”的字典正对应这两行的先后次序。",
    "Map band [0,1], cols=[0,0], to code: cols[c] += matrix[bottom][c] adds the second row. The second value=0 keeps s at 0. answer += seen.get(0,0) adds 2, then seen[0] rises from 2 to 3. The simulation's before-query and after-operation dictionaries correspond to these two lines in order."
  ],
  "costs": [
    "共有 m(m+1)/2 个行带；每个用 O(n) 加一行，再用 O(n) 扫列。字典操作按平均 O(1) 计，期望时间 O(m²n)，额外空间 O(n)（cols 与最多 n+1 种前缀）。100×100 仅有 505,000 次前缀查询。这里固定按行配对；高而窄时可转置以选较小维度配对，但这份代码未做该优化。",
    "There are m(m+1)/2 row bands. Each adds a row in O(n) and scans columns in O(n). With average O(1) dictionary operations, expected time is O(m²n) and auxiliary space O(n) for cols and at most n+1 prefix values. A 100×100 board needs 505,000 prefix queries. This code always pairs rows; transposing to pair the smaller dimension can help tall matrices, but is not implemented here."
  ],
  "boundaries": [
    "全零时，每个非空矩形都命中：100×100 的答案为 25,502,500。单格只有一个候选；负数与重复前缀都合法。单列仍要检查所有行带。元素总和的绝对值不超过 10⁷；target 可更大，此时没有匹配。Python 整数不会溢出。空矩阵不在官方输入范围内。",
    "For all zeros and target=0, every nonempty rectangle matches: 100×100 gives 25,502,500. A single cell has one candidate; negatives and repeated prefixes are valid. One column still requires every row band. Any rectangle sum has absolute value at most 10⁷; target may be larger and then cannot match. Python integers do not overflow. Empty matrices are outside the official input contract."
  ],
  "source": [
    "展开官方接口的 Python 3 解法",
    "Open the Python 3 solution for the official interface"
  ],
  "copy": [
    "复制 Python 源码",
    "Copy Python source"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用。完整源码已选中，请使用系统复制快捷键。",
    "Automatic copy is unavailable. Full source is selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整 Python 源码",
    "Manually copy the full Python source"
  ],
  "related": [
    "继续连接这些概念",
    "Connect these ideas"
  ],
  "link1": [
    "回看：一个行带如何变成列区间",
    "Revisit: turn a row band into column intervals"
  ],
  "link2": [
    "#327：用前缀差表示区间和",
    "#327: express range sums as prefix differences"
  ],
  "link3": [
    "#363：固定行带压缩矩阵",
    "#363: compress a matrix with a fixed row band"
  ],
  "footer": [
    "练习目标：能解释每个被计数的左边界，以及为什么当前边界必须最后插入。",
    "Practice goal: explain every counted left boundary and why the current boundary must be inserted last."
  ]
};
