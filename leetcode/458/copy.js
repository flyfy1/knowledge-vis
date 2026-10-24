window.LESSON_COPY = {
  "docTitle": [
    "#458 · 可怜的小猪",
    "#458 · Poor Pigs"
  ],
  "title": [
    "#458 · 可怜的小猪",
    "#458 · Poor Pigs"
  ],
  "back": [
    "← LeetCode 知识课",
    "← LeetCode lessons"
  ],
  "meta": [
    "HARD · 组合数学 · Python",
    "HARD · COMBINATORICS · Python"
  ],
  "tagline": [
    "三桶液体，只有一桶有毒。一次等待只能告诉你生或死；两次等待为什么能多分出一种情况？",
    "Three buckets, exactly one poisoned. One wait reveals alive or dead. Why can two waits distinguish a third possibility?"
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
  "s0": [
    "1 · 先算三桶",
    "1 · Start with three buckets"
  ],
  "s1": [
    "2 · 结果为什么相乘",
    "2 · Why outcomes multiply"
  ],
  "s2": [
    "3 · 亲手跑喂食计划",
    "3 · Run the feeding schedule"
  ],
  "s3": [
    "4 · 先预测，再揭晓",
    "4 · Predict before revealing"
  ],
  "s4": [
    "5 · 从证明到 Python",
    "5 · From proof to Python"
  ],
  "statement": [
    "怎样在 30 分钟内区分三桶？设 buckets=3、minutesToDie=15、minutesToTest=30。恰好一桶有毒；喝到它的小猪在等待 15 分钟后死亡，其余存活。每次可瞬时让一只小猪喝任意多桶，每桶也可给多只小猪喝。随后必须完整等待，期间不能喂其他小猪；下一次只喂活着的小猪。目标是求一定能定位毒桶的最少小猪数。",
    "How can we distinguish three buckets in 30 minutes? Set buckets=3, minutesToDie=15, minutesToTest=30. Exactly one bucket is poisoned; pigs that drink it die after the 15-minute wait, and others survive. Feeding is instantaneous: a pig may drink from any number of buckets, and a bucket may feed many pigs. Then wait the full interval, feeding no other pigs during it; only living pigs can be fed next. Find the fewest pigs that guarantee identifying the poisoned bucket."
  ],
  "hand": [
    "只用一只：在第 0 分钟喝第 1 桶。第 15 分钟若仍活着，就喝第 2 桶。完全不喝第 3 桶。于是毒桶为 1 → 第 15 分钟死亡；毒桶为 2 → 第 30 分钟死亡；毒桶为 3 → 第 30 分钟仍存活。三种观察互不相同，所以一只就够；零只没有任何观察，无法区分三桶。",
    "Use one pig: at minute 0, feed bucket 1. If it is alive at minute 15, feed bucket 2. Never feed bucket 3. Poison in bucket 1 means death at minute 15; bucket 2 means death at minute 30; bucket 3 means survival at minute 30. These observations differ, so one pig suffices. Zero pigs produce no observations and cannot distinguish three buckets."
  ],
  "handCaption": [
    "手算记录：每一列是假设不同毒桶，不是三个小猪。",
    "Hand ledger: each column assumes a different poisoned bucket, not three pigs."
  ],
  "poison1": [
    "毒桶 1",
    "Poison 1"
  ],
  "poison2": [
    "毒桶 2",
    "Poison 2"
  ],
  "poison3": [
    "毒桶 3",
    "Poison 3"
  ],
  "timeLabel": [
    "观察时刻",
    "Observation time"
  ],
  "at15": [
    "15 分钟后",
    "After 15 minutes"
  ],
  "at30": [
    "30 分钟后",
    "After 30 minutes"
  ],
  "dead": [
    "死亡",
    "Dead"
  ],
  "alive": [
    "存活",
    "Alive"
  ],
  "alreadyDead": [
    "已死亡，不再喂食",
    "Already dead; no more feeding"
  ],
  "roundIntro": [
    "完整轮次是一次喂食加一次完整等待。记 R=⌊minutesToTest/minutesToDie⌋，即最多完成的等待次数；上例 R=2。小猪的结果是“第几轮死亡”或“直到截止仍存活”，共 R+1 种。剩下不足一次等待的分钟无法观察新一次死亡。",
    "A complete round is feeding followed by one full wait. Let R=⌊minutesToTest/minutesToDie⌋, the number of waits that fit; here R=2. A pig’s outcome is its death round, or survival through the deadline: R+1 possibilities. Leftover minutes shorter than a wait cannot reveal another death."
  ],
  "baselineTitle": [
    "保守基线：每只只测一桶",
    "A conservative baseline: one bucket per pig"
  ],
  "baseline": [
    "用 B−1 只小猪（B 是桶数），每只在第一轮喝一桶，留下最后一桶不测。哪只死亡就定位哪桶；全存活则是最后一桶。只需一轮且总能成功，但桶数增大就浪费小猪。下面的基线构造需 O(B) 次分配和 O(B) 空间；它返回计划，不是官方要求的最小数。",
    "With B−1 pigs (B is the bucket count), feed each a different bucket in round 1 and reserve the last bucket. A death identifies its bucket; all surviving identifies the reserved bucket. One round always suffices, but this uses many pigs as B grows. The baseline below builds a plan in O(B) assignments and O(B) space; it returns a schedule, not the official minimum count."
  ],
  "wrong": [
    "容易漏算：两轮只算“死亡在第 1 或第 2 轮”，会认为一只只能区分两桶。刚才的第 3 桶反驳了它：一直存活也是信息。另一种浪费是只看最后生死；上例会错过两种不同的死亡时间。",
    "Tempting mistake: count only death in round 1 or round 2, so one pig seems limited to two buckets. Bucket 3 refutes it: survival is information too. Looking only at final alive/dead also wastes information by merging two different death times."
  ],
  "examples": [
    "官方例子：(4,15,15) → 2；(4,15,30) → 2。约束：1≤buckets≤1000，1≤minutesToDie≤minutesToTest≤100。时间单位均为分钟，桶在本课从 1 编号。",
    "Official examples: (4,15,15) → 2; (4,15,30) → 2. Constraints: 1≤buckets≤1000, 1≤minutesToDie≤minutesToTest≤100. Times are minutes; this lesson labels buckets starting at 1."
  ],
  "combine": [
    "两轮等待时，两只小猪怎样区分九桶？把一只小猪的结果写成数字：0 表示截止仍存活，1/2 表示第 1/2 轮死亡。每桶分配一对不同的数字 (A,B)，A 对应第一只，B 对应第二只。格子是桶号；行是 A 的数字，列是 B 的数字。",
    "With two waits, how can two pigs distinguish nine buckets? Write each pig’s outcome as a digit: 0 means surviving the deadline; 1 or 2 means dying in round 1 or 2. Assign every bucket a different pair (A,B), one digit for each pig. Cells are bucket IDs; rows give A’s digit and columns give B’s digit."
  ],
  "gridCaption": [
    "两只小猪 × 各三种结果：九个不同的结果对",
    "Two pigs × three outcomes each: nine distinct pairs"
  ],
  "construct": [
    "把数字变成喂食计划：桶的第 p 个数字若为 r>0，就在第 r 轮给第 p 只小猪喝它；数字 0 则永远不给这只喝。例如桶 6 的 (A,B)=(2,1)：第 0 分钟给 B 喝，第 15 分钟给仍活着的 A 喝；若桶 6 有毒，B 在第 15 分钟、A 在第 30 分钟死亡。每只每轮可混喝多桶，恰好一桶有毒，因此其他桶不影响结果。若小猪已经死去，后面的喂食直接跳过。",
    "Turn digits into a schedule: if a bucket’s digit for pig p is r>0, feed that bucket to pig p in round r; digit 0 means never feed it to that pig. Bucket 6 has (A,B)=(2,1): feed B at minute 0 and the still-living A at minute 15. If bucket 6 is poisoned, B dies at minute 15 and A at minute 30. A pig can pool many buckets each round. Exactly one is poisoned, so the others do not affect its outcome. Skip later feeding once a pig has died."
  ],
  "bound": [
    "为什么既不可能更少，又确实够用？记 R=⌊minutesToTest/minutesToDie⌋ 为完整等待数，S=R+1 为每只的结果数，p 为小猪数。每只最多 S 种结果，所以 p 只最多形成 S^p 个不同结果向量，也就是可区分的桶数上限，称为容量。若桶更多，至少两桶产生相同观察，无法保证分清。即使根据早先的死亡临时改计划，固定规则下完整观察向量仍至多 S^p 种，所以上限依然成立。",
    "Why is this both necessary and sufficient? Let R=⌊minutesToTest/minutesToDie⌋ count complete waits, S=R+1 count outcomes per pig, and p count pigs. Each pig has at most S outcomes, so p pigs give at most S^p different outcome vectors. This upper limit on distinguishable buckets is called capacity. More buckets force at least two to share an observation. Even if later feeding adapts to earlier deaths, a fixed strategy still yields at most S^p full observation vectors, so the same bound applies."
  ],
  "sufficient": [
    "反过来，只要桶数 buckets≤S^p，取 buckets 个不同的 p 位数字向量，按上面的轮次喂食即可。最终观察唯一还原毒桶的向量。所以容量上限可以达到；求的是使 S^p≥buckets 的最小整数 p，不需要真的分配或模拟所有桶。",
    "Conversely, if buckets≤S^p, choose buckets distinct vectors of p digits and feed according to their round numbers. The final observations uniquely recover the poisoned bucket’s vector. The bound is attainable. We need the smallest integer p with S^p≥buckets; the submission need not assign or simulate every bucket."
  ],
  "labIntro": [
    "这份计划真的能逐步排除桶吗？这里 T=minutesToTest（总时间）、D=minutesToDie（一次等待时间），完整轮次 R=⌊T/D⌋，数字 0 表示整段时间不喝该桶，正数字表示喂它的轮次。候选桶是“指定结果与目前观察一致”的桶。选毒桶只是在设定模拟真值；小猪的观察用来筛选候选，不会直接读取这个选择。",
    "Does the schedule actually eliminate buckets? Here T=minutesToTest is total time and D=minutesToDie is one wait, so complete rounds are R=⌊T/D⌋. Digit 0 means never feed that bucket to this pig; a positive digit is its feeding round. A candidate bucket is one whose assigned outcomes match observations so far. Selecting the poison sets the simulation’s ground truth; candidate filtering uses the observations, not a direct lookup of that selection."
  ],
  "simulation": [
    "教学模拟，不是执行 Python 提交。每帧是完成一次等待后的状态；没有跳过轮次。所有桶计划和已完成观察都保留。Python 只计算数量，不保存这些卡片或历史。",
    "Teaching simulation, not execution of the Python submission. Each frame follows one completed wait; no rounds are omitted. All bucket plans and completed observations remain visible. Python only counts pigs and stores none of these cards or history."
  ],
  "experiment": [
    "先保持预设不变，选一个毒桶；点“完成下一次等待”，先看每只的观察，再看候选标签变少。退回再前进应恢复相同候选。切换预设或毒桶会重启本实验，预测题保持不变。",
    "Keep the preset fixed and select a poisoned bucket. Complete the next wait, inspect each pig’s observation, then watch candidate labels narrow. Back then forward should restore the same candidates. Changing preset or poison restarts this experiment; the prediction exercise stays unchanged."
  ],
  "presets": [
    "预设（切换会重启）",
    "Preset (changes restart)"
  ],
  "p0": [
    "3 桶 · 15/30 分钟 · 一只三种结果",
    "3 buckets · 15/30 min · three outcomes"
  ],
  "p1": [
    "9 桶 · 15/30 分钟 · 两只组合",
    "9 buckets · 15/30 min · two pigs combine"
  ],
  "p2": [
    "4 桶 · 15/15 分钟 · 官方例 1",
    "4 buckets · 15/15 min · official example 1"
  ],
  "p3": [
    "4 桶 · 15/30 分钟 · 官方例 2",
    "4 buckets · 15/30 min · official example 2"
  ],
  "p4": [
    "10 桶 · 15/30 分钟 · 超过九桶",
    "10 buckets · 15/30 min · beyond nine"
  ],
  "p5": [
    "1 桶 · 15/30 分钟 · 无需小猪",
    "1 bucket · 15/30 min · no pigs needed"
  ],
  "p6": [
    "8 桶 · 15/44 分钟 · 余下 14 分钟",
    "8 buckets · 15/44 min · 14 minutes left"
  ],
  "p7": [
    "27 桶 · 10/20 分钟 · 三位数字",
    "27 buckets · 10/20 min · three digits"
  ],
  "poisonLabel": [
    "模拟毒桶（切换会重启）",
    "Simulated poison (changes restart)"
  ],
  "bucketOption": [
    "第 {b} 桶",
    "Bucket {b}"
  ],
  "prev": [
    "退回上一次等待",
    "Back one wait"
  ],
  "next": [
    "完成下一次等待",
    "Complete next wait"
  ],
  "reset": [
    "重置等待进度",
    "Reset waits"
  ],
  "end": [
    "到最后一次完整等待",
    "Go to final full wait"
  ],
  "position": [
    "已完成等待次数",
    "Completed waits"
  ],
  "summary": [
    "B={b}；R=⌊{t}/{d}⌋={r}；S=R+1={s}；最少小猪 p={p}。",
    "B={b}; R=⌊{t}/{d}⌋={r}; S=R+1={s}; minimum pigs p={p}."
  ],
  "progress": [
    "已完成 {i}/{r} 次等待 · 经过 {time} 分钟 · 候选 {n} 桶：{c}。",
    "Completed {i}/{r} waits · {time} minutes elapsed · {n} candidate buckets: {c}."
  ],
  "leftover": [
    "完整等待结束于第 {time} 分钟；截止 {t} 分钟，余下 {left} 分钟不能再完成一次等待。",
    "Full waits end at minute {time}; deadline {t} leaves {left} minutes, too short for another wait."
  ],
  "pig": [
    "小猪 {p}",
    "Pig {p}"
  ],
  "never": [
    "从不喝的桶：{b}。",
    "Never drinks buckets: {b}."
  ],
  "none": [
    "无",
    "none"
  ],
  "plan": [
    "第 {r} 轮（{time} 分钟喂）：桶 {b}。",
    "Round {r} (feed at minute {time}): buckets {b}."
  ],
  "observedAlive": [
    "当前观察：已等 {i} 轮，仍存活。",
    "Current observation: alive; completed waits: {i}."
  ],
  "observedDead": [
    "当前观察：第 {r} 轮死亡。",
    "Current observation: died in round {r}."
  ],
  "noPigs": [
    "只有一桶，已知它有毒；零只小猪，空的结果向量已经唯一。",
    "There is only one bucket, known to be poisoned. Zero pigs and an empty outcome vector already identify it."
  ],
  "capacityTitle": [
    "数量计算账本：每多一只，容量乘以 S",
    "Counting ledger: each extra pig multiplies capacity by S"
  ],
  "capacityItem": [
    "p={p} → 容量 {c}",
    "p={p} → capacity {c}"
  ],
  "bucketTitle": [
    "所有桶的计划数字（按小猪 A、B、C 顺序）",
    "All bucket digits (pig order A, B, C)"
  ],
  "bucketHeading": [
    "桶 {b}",
    "Bucket {b}"
  ],
  "digits": [
    "数字：{digits}",
    "Digits: {digits}"
  ],
  "emptyVector": [
    "空向量",
    "empty vector"
  ],
  "possible": [
    "仍是候选",
    "Still a candidate"
  ],
  "excluded": [
    "与观察不符，已排除",
    "Excluded: observation differs"
  ],
  "found": [
    "唯一候选",
    "Only candidate"
  ],
  "bucketGuide": [
    "数字卡片是分配计划，始终保留；下方标签才是当前候选状态。数字 0 直到截止仍存活；在截止前，尚未到喂食轮次的正数字也可能仍存活。",
    "Digit cards retain the assigned plan; the label below shows current candidacy. Digit 0 survives through the deadline. Before the deadline, a later positive digit can also still be alive."
  ],
  "historyTitle": [
    "已完成的喂食与观察记录",
    "Completed feeding and observation history"
  ],
  "noHistory": [
    "尚未等待：没有观察可排除桶。",
    "No waits yet: no observations to exclude buckets."
  ],
  "historyRound": [
    "第 {r} 轮完成 · 第 {time} 分钟",
    "Round {r} completed · minute {time}"
  ],
  "feedHistory": [
    "{p} 喝桶 {b} → {result}",
    "{p} drank buckets {b} → {result}"
  ],
  "skipHistory": [
    "{p} 已死，本轮跳过喂食。",
    "{p} was already dead; skipped feeding this round."
  ],
  "quiz": [
    "新情境：17 桶，minutesToDie=10，minutesToTest=20。保证找出毒桶最少要几只？先选，再验证。",
    "Fresh case: 17 buckets, minutesToDie=10, minutesToTest=20. How many pigs guarantee identification? Choose before verifying."
  ],
  "option0": [
    "2 只",
    "2 pigs"
  ],
  "option1": [
    "3 只",
    "3 pigs"
  ],
  "option2": [
    "5 只",
    "5 pigs"
  ],
  "reveal": [
    "验证并揭晓理由",
    "Verify and reveal why"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "这个选择不是最小可行值。",
    "That choice is not the minimum that works."
  ],
  "quizReason": [
    "有两轮完整等待，每只三种结果。两只最多 3²=9 桶，三只可区分 3³=27 桶，因此 9<17≤27，答案是 3。选 2 会让至少两桶共享结果；选 5 只算最终生死的二元结果，漏用了死亡轮次。",
    "Two complete waits give three outcomes per pig. Two pigs distinguish at most 3²=9 buckets; three distinguish 3³=27. Since 9<17≤27, the answer is 3. Choosing 2 forces buckets to share an outcome. Choosing 5 counts only final binary alive/dead and misses the death round."
  ],
  "codeIntro": [
    "怎样把可区分结果的证明变成几行代码？令 rounds 为完整等待数，states=rounds+1 为每只的结果数，pigs 为已计入的小猪数，capacity 为这些小猪能区分的最多桶数。初始零只只有一种空观察，所以 capacity=1。",
    "How does the outcome proof become a few lines of code? rounds counts complete waits; states=rounds+1 counts outcomes per pig; pigs counts pigs included so far; capacity is how many buckets they can distinguish. Zero pigs have one empty observation, so capacity starts at 1."
  ],
  "invariant": [
    "循环不变量（每次检查条件前都成立的事实）：capacity=states^pigs。初始 1=states^0；加入一只后 capacity 乘 states，pigs 加 1，等式保持。循环按 0、1、2…只顺序检查，第一次 capacity≥buckets 时返回；上限证明排除了所有更小值，构造证明当前值可行。",
    "Loop invariant (a fact true before every condition check): capacity=states^pigs. Initially 1=states^0. Adding a pig multiplies capacity by states and increases pigs by 1, preserving the equality. The loop tries 0,1,2… pigs and stops at the first capacity≥buckets. The upper bound rules out every smaller count; the feeding construction makes this count feasible."
  ],
  "map1": [
    "rounds = minutesToTest // minutesToDie：对应实验的完整等待数；不能把 44/15 向上取成 3。",
    "rounds = minutesToTest // minutesToDie maps to completed waits in the experiment; 44/15 must not round up to 3."
  ],
  "map2": [
    "capacity *= states; pigs += 1：对应数量账本相邻两格，例如九桶时 (1,3) → (2,9)。while capacity < buckets 保留恰好够用的情况，不再多加一只。",
    "capacity *= states; pigs += 1 maps to adjacent ledger entries, such as (1,3) → (2,9) for nine buckets. while capacity < buckets stops when capacity is exactly enough, avoiding an extra pig."
  ],
  "boundaries": [
    "边界：一桶答案为 0，因为已经知道毒桶；一次完整等待有两种结果；合法输入总有至少一轮，因此 states≥2，容量严格增长、循环终止。恰好 S^p 桶不多加一只，S^p+1 则需要下一只。1000 桶、15/60 分钟时，5⁴=625<1000≤3125=5⁵，答案 5。无需浮点对数，避免整数幂边界的舍入误差。",
    "Boundaries: one bucket needs 0 pigs because its identity is known. One complete wait gives two outcomes. Valid inputs always allow at least one wait, so states≥2 and capacity strictly grows until termination. Exactly S^p buckets need no extra pig; S^p+1 needs one more. For 1000 buckets with 15/60 minutes, 5⁴=625<1000≤3125=5⁵, giving 5 pigs. Integer multiplication avoids floating logarithm rounding at exact powers."
  ],
  "cost": [
    "设 R=⌊minutesToTest/minutesToDie⌋。时间 O(1+log_(R+1) buckets)，额外空间 O(1) 个机器字（官方范围内最多 10 次乘法，整数很小）。这是数量提交的成本；教学模拟另存 B×p 个数字和每轮观察，不属于提交的额外空间。",
    "Let R=⌊minutesToTest/minutesToDie⌋. Time is O(1+log_(R+1) buckets), with O(1) auxiliary machine words (at most 10 multiplications and small integers under official bounds). This is the counting submission’s cost. The teaching simulation separately stores B×p digits and round observations; that storage is not submission space."
  ],
  "verify": [
    "作者自查使用独立的组合计数递推、结果向量枚举及逐轮喂食模拟，对比 Python 和浏览器核心。测试覆盖官方例子、整数幂边界、一桶、未满一轮的余时和最大输入。通过这些测试不等于 LeetCode 已接收提交，也不等于独立教学评审或真实学习者验证。",
    "Author checks compare Python and the browser core against an independent combinatorial recurrence, enumerated outcome vectors, and round-by-round feeding simulation. They cover official examples, exact-power boundaries, one bucket, incomplete leftover time, and maximum inputs. Passing is not a LeetCode acceptance, an independent teaching review, or evidence from real learners."
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
    "查看官方接口的 Python 解法",
    "View Python solution for the official interface"
  ],
  "manualLabel": [
    "自动复制不可用；源码已选中，请手动复制。",
    "Automatic copying is unavailable; source is selected for manual copying."
  ],
  "copyOk": [
    "已复制完整 Python 源码。",
    "Full Python source copied."
  ],
  "copyFallback": [
    "请在下方已选中的文本框手动复制。",
    "Copy manually from the selected text box below."
  ],
  "related": [
    "继续联系已有概念",
    "Connect to related ideas"
  ],
  "related0": [
    "第 60 题：按容量分块定位 →",
    "Problem 60: locate a rank using block sizes →"
  ],
  "related1": [
    "第 440 题：计数后跳过整组 →",
    "Problem 440: count and skip a whole group →"
  ],
  "foot": [
    "作者候选 · 教学模拟与真实提交执行分开 · 独立评审待进行",
    "Author candidate · Teaching simulation and submission execution are separate · Independent review pending"
  ]
};
