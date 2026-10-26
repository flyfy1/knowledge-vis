window.LESSON_COPY = {
  "docTitle": [
    "#906 · 超级回文数",
    "#906 · Super Palindromes"
  ],
  "title": [
    "#906 · 超级回文数",
    "#906 · Super Palindromes"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "课程步骤",
    "Lesson steps"
  ],
  "badge": [
    "Hard · 数学 · 枚举",
    "Hard · Math · Enumeration"
  ],
  "intro": [
    "11 × 11 = 121：根与平方都能倒着读。怎样找全这样的数？",
    "11 × 11 = 121: both root and square read the same backwards. How do we find them all?"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "s0": [
    "1 · 两次回文检查",
    "1 · Two palindrome checks"
  ],
  "s1": [
    "2 · 只造可能的根",
    "2 · Build only possible roots"
  ],
  "s2": [
    "3 · 逐个平方，保留证据",
    "3 · Square and keep the evidence"
  ],
  "s3": [
    "4 · 先预测，再揭晓",
    "4 · Predict before revealing"
  ],
  "s4": [
    "5 · 从证明到 Python",
    "5 · From proof to Python"
  ],
  "q0": [
    "在 [4, 1000] 中，为什么 121 算、676 却不算？",
    "In [4, 1000], why does 121 count while 676 does not?"
  ],
  "statement": [
    "输入 left、right 是正整数的十进制字符串。求闭区间 [left, right] 内的超级回文数个数；闭区间包含两端。回文数的数字正反读相同。超级回文数既是回文数，又是某个正整数回文数的平方。",
    "Inputs left and right are decimal strings for positive integers. Count super-palindromes in the inclusive interval [left, right], including both endpoints. A palindrome has the same digits forwards and backwards. A super-palindrome is itself a palindrome and is the square of a positive palindromic integer."
  ],
  "hand": [
    "先手算：2² = 4，3² = 9，11² = 121，22² = 484，四组的根与平方都回文。4² = 16 不行：根虽回文，平方不是。676 = 26² 也不行：平方虽回文，根不是。",
    "Calculate by hand: 2² = 4, 3² = 9, 11² = 121, and 22² = 484. In each pair both numbers are palindromes. 4² = 16 fails because its square is not a palindrome. 676 = 26² fails because its root is not a palindrome."
  ],
  "examples": [
    "官方例子：[4, 1000] 的答案为 4；[1, 2] 的答案为 1（只有 1 = 1²）。不是把区间内所有回文数都算进去。",
    "Official examples: [4, 1000] has answer 4; [1, 2] has answer 1 (only 1 = 1²). Counting every palindrome in the interval would overcount."
  ],
  "constraints": [
    "约束：1 ≤ left ≤ right ≤ 10¹⁸ − 1；两串长度为 1…18，只含数字且没有前导零。0 和空区间不属于输入。",
    "Constraints: 1 ≤ left ≤ right ≤ 10¹⁸ − 1. Both strings have 1–18 digits and no leading zeros. Zero and empty intervals are outside the input contract."
  ],
  "q1": [
    "已知每个答案必须有回文根，为什么还要逐个试所有整数根？",
    "If every answer needs a palindromic root, why try every integer root?"
  ],
  "baseline": [
    "先用可靠的慢方法：从根 1 试到整数平方根 b。b 是满足 b² ≤ right 的最大整数；更大的根平方必定越界。对每个根检查它和平方是否回文，再检查左边界。对 [4,1000]，b = 31，需要试 31 个根。",
    "Start with a reliable baseline: try roots 1 through the integer square root b, the largest integer with b² ≤ right. Larger roots necessarily square past the interval. Test both root and square for palindromicity, then the lower bound. For [4,1000], b = 31, so this tries 31 roots."
  ],
  "baselineCost": [
    "R = int(right)。慢方法耗时 O(√R log R)，临时空间 O(log R)（反转数字串）。R 接近 10¹⁸ 时需要约十亿个根。我们要省掉试非回文根的工作。代码中的 str 把整数变成数字串，[::-1] 得到倒序串；isqrt 算出上面定义的整数平方根，range 的终点不包含在内，所以用 isqrt(high)+1。",
    "Let R = int(right). This baseline takes O(√R log R) time and O(log R) temporary space for digit reversal. Near 10¹⁸ it tries about a billion roots. We want to avoid testing non-palindromic roots. In the code, str converts an integer to digits, [::-1] reverses a string, and isqrt computes the integer square root defined above. range excludes its stop value, hence isqrt(high)+1."
  ],
  "mirror": [
    "把“种子”定义为根的前半段（奇数位时含中间一位）。种子 12：奇数位根把最后一位 2 留作中间，只倒转前面的 1，得到 12 + 1 = 121（这里 + 表示拼接）；偶数位根倒转整个 12，得到 12 + 21 = 1221。种子 1 对应 1 和 11。因此两种长度都要生成，否则会漏掉 11² = 121。",
    "Define a seed as the first half of a root, including the middle digit for odd lengths. For seed 12, the odd-length construction keeps the final 2 as the middle and reverses only the preceding 1: 12 + 1 = 121, where + means concatenation. The even construction reverses all of 12: 12 + 21 = 1221. Seed 1 yields 1 and 11. Both parities are necessary or we miss 11² = 121."
  ],
  "proof": [
    "为什么找得全且不重复？任取一个正整数回文根：它的位数决定奇偶分支，它的前半段唯一决定种子，后半段被回文要求强制确定。反过来每次镜像都产生回文根。种子从 1 开始，因此没有前导零，也不会生成 0。奇偶分支的位数不同，同一分支的不同种子也不会生成同一个根。",
    "Why complete and unique? Take any positive palindromic root. Its digit-length parity chooses the branch, and its first half uniquely determines the seed; palindromicity forces the remaining digits. Conversely, mirroring always produces a palindromic root. Starting seeds at 1 avoids leading zeros and zero. Opposite branches have different length parity, and distinct seeds within a branch cannot give the same root."
  ],
  "invariant": [
    "于是得到不变量（每次测试后始终成立的事实）：count 恰好等于已测试的不同根中，平方位于闭区间且仍然回文的个数。初始为 0；通过两项检查才加 1。每个正整数的平方根唯一，所以不会重复计数。每个分支内根随种子递增：同位数时前半段变大会使整个根变大；跨位数时，如奇数位 9 → 101、偶数位 99 → 1001，也只会变大。因此超过 b 后该分支可以停止。",
    "This gives an invariant, a fact true after every test: count is exactly the number of distinct tested roots whose squares lie in the inclusive interval and are palindromes. Start at 0; add 1 only after both checks pass. Positive squares have unique positive roots, so no answer is counted twice. Within each branch, increasing a seed of the same length increases the leading half and hence the root. Length transitions also increase it: odd roots go 9 → 101 and even roots 99 → 1001. Once a root exceeds b, that branch can stop."
  ],
  "wrong": [
    "诱人的错误规则：“只要根回文就加 1。”反例是 4² = 16。镜像只保证根回文，不保证乘法后的数字回文。仍须检查平方。",
    "A tempting wrong rule is “increment for every palindromic root.” The counterexample 4² = 16 disproves it. Mirroring guarantees the root, not the digits after multiplication. The square still needs checking."
  ],
  "q2": [
    "每次测试后，累计计数为什么加 1，或者保持不变？",
    "After each test, why does the cumulative count increase or stay unchanged?"
  ],
  "task": [
    "保持区间不变，点击“测试下一个根”，看新增卡片上的平方、区间检查和回文检查。此前卡片保留，只有同时通过两项的卡片让累计数增加。后退会恢复之前的全部证据。切换场景会从零开始。",
    "Keep the interval fixed and choose “Test next root.” Inspect the new card’s square, range check, and palindrome check. Earlier cards remain; only cards passing both checks increase the cumulative count. Back restores all earlier evidence. Changing a preset restarts at zero."
  ],
  "simulation": [
    "教学模拟，不会执行下方 Python。用 BigInt 精确计算；列出当前场景中所有平方不超过 right 的回文根，无省略。为便于手算，显示顺序按根递增；Python 则先完成奇数位分支，再完成偶数位分支，最终计数相同。整数平方根是平方不超过 right 的最大整数。模拟保留卡片历史，额外占用空间不计入提交代码。",
    "Teaching simulation; it does not execute the Python below. BigInt keeps arithmetic exact. Every palindromic root with square ≤ right is included for the selected preset. The view sorts roots numerically for hand checking; Python finishes the odd-length branch before the even-length branch, giving the same final count. The integer square root is the largest integer whose square is ≤ right. Stored card history uses extra space outside the submission."
  ],
  "preset": [
    "场景（切换后重新开始）",
    "Preset (changing it restarts the trace)"
  ],
  "p0": [
    "[4, 1000]",
    "[4, 1000]"
  ],
  "p1": [
    "[1, 2]",
    "[1, 2]"
  ],
  "p2": [
    "[676, 676]",
    "[676, 676]"
  ],
  "p3": [
    "[121, 121]",
    "[121, 121]"
  ],
  "p4": [
    "[10000, 15000]",
    "[10000, 15000]"
  ],
  "p5": [
    "[100, 120]",
    "[100, 120]"
  ],
  "prev": [
    "退回一次测试",
    "Undo one test"
  ],
  "next": [
    "测试下一个根",
    "Test next root"
  ],
  "reset": [
    "重置此场景",
    "Reset this preset"
  ],
  "end": [
    "完成所有测试",
    "Complete all tests"
  ],
  "position": [
    "已测试根的数量（拖动可回看）",
    "Number of tested roots (seek to revisit)"
  ],
  "progress": [
    "区间 [{left}, {right}] · 已测试 {step}/{total} 个候选根",
    "Interval [{left}, {right}] · {step}/{total} candidate roots tested"
  ],
  "initial": [
    "尚未测试任何根。累计计数 = 0。",
    "No roots tested yet. Cumulative count = 0."
  ],
  "operation": [
    "刚完成：根 {root} → 平方 {square}。本次增加 {delta}；累计 {before} → {count}。",
    "Just completed: root {root} → square {square}. Added {delta}; cumulative {before} → {count}."
  ],
  "legend": [
    "卡片显示已完成测试；“当前”标记最后一次测试，不表示通过。通过/拒绝均用文字标记。",
    "Cards show completed tests. “Current” marks the most recent test, not acceptance. Both acceptance and rejection have text labels."
  ],
  "seedLine": [
    "种子 {seed} · {mode} · 追加反转部分「{reverse}」",
    "Seed {seed} · {mode} · append reversed part “{reverse}”"
  ],
  "odd": [
    "奇数位根（中间位只用一次）",
    "Odd-length root (middle used once)"
  ],
  "even": [
    "偶数位根（整个种子镜像）",
    "Even-length root (mirror full seed)"
  ],
  "empty": [
    "空串",
    "empty string"
  ],
  "checks": [
    "平方在区间内：{range}；平方回文：{pal}。",
    "Square in range: {range}; square palindrome: {pal}."
  ],
  "yes": [
    "是",
    "yes"
  ],
  "no": [
    "否",
    "no"
  ],
  "accept": [
    "通过 · 累计 {count}",
    "Accepted · cumulative {count}"
  ],
  "reject": [
    "拒绝 · 累计 {count}",
    "Rejected · cumulative {count}"
  ],
  "current": [
    "当前（刚完成）",
    "Current (just completed)"
  ],
  "pending": [
    "当前累计 = {count}；还剩 {remaining} 个根待测。这还不是最终答案。",
    "Cumulative so far = {count}; {remaining} roots remain. This is not the final answer."
  ],
  "final": [
    "全部完成 · 最终答案 = {count} 个超级回文数。",
    "All tests complete · final answer = {count} super-palindromes."
  ],
  "q3": [
    "把同一条完整性规则迁移到一个没演示过的区间，会得到多少个？",
    "How many survive when you apply the completeness rule to an unseen interval?"
  ],
  "quiz": [
    "新题：[40000, 50000] 中有多少个超级回文数？先想哪些回文根的平方能落入该区间，再选答案。",
    "Fresh case: how many super-palindromes lie in [40000, 50000]? First identify the palindromic roots whose squares fit, then choose."
  ],
  "option0": [
    "1 个：只注意到 202²",
    "1: notice only 202²"
  ],
  "option1": [
    "3 个：所有回文根都算",
    "3: count every palindromic root"
  ],
  "option2": [
    "2 个：平方也必须回文",
    "2: the square must also be palindromic"
  ],
  "reveal": [
    "核对并揭晓理由",
    "Check and reveal reasoning"
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "再核对两项条件。",
    "Check both conditions again."
  ],
  "answer": [
    "答案是 2。200² = 40000，224² = 50176，所以可能的整数根是 200…223；其中回文根只有 202、212、222。202² = 40804，212² = 44944 都回文；222² = 49284 不回文。偶数位根在这里没有候选。只算 202² 会漏掉 212²；把三个根全算入则多算 222。",
    "The answer is 2. Since 200² = 40000 and 224² = 50176, possible integer roots are 200…223. Only 202, 212, and 222 are palindromes. 202² = 40804 and 212² = 44944 are palindromes; 222² = 49284 is not. No even-length roots fit here. Counting only 202² misses 212²; counting all three roots wrongly includes 222."
  ],
  "q4": [
    "完整枚举与两项过滤，分别对应代码的哪几行？",
    "Which lines implement complete enumeration and the two filters?"
  ],
  "map0": [
    "limit = isqrt(high)：整数平方根，精确得到根的上界。Python 整数没有这里的浮点舍入问题。int 把输入数字串转成整数。",
    "limit = isqrt(high) is the integer square root, an exact upper bound on roots. Python integers avoid floating-point rounding here. int converts the input digit strings to integers."
  ],
  "map1": [
    "odd 决定根的位数奇偶。s[:-1] 删除种子的末位，使奇数位根的中间位不会被复制；[::-1] 反转字符串。s + tail[::-1] 是拼接。例如 s=\"12\"、odd=True 得到 \"121\"。root > limit 时只退出当前分支的 while。",
    "odd chooses digit-length parity. s[:-1] drops the final seed digit so an odd root uses its middle once; [::-1] reverses a string. s + tail[::-1] concatenates them: s=\"12\", odd=True gives \"121\". root > limit breaks only the current branch’s while loop."
  ],
  "map2": [
    "square 在闭区间且 digits == digits[::-1] 才 count += 1。这维持“count = 已测试根中合格平方的数量”的不变量。while 每次增加 seed，两个分支都终止后，每个合法根恰好被检查一次。",
    "Increment count only when square lies in the inclusive interval and digits == digits[::-1]. This maintains the invariant “count equals qualifying squares of tested roots.” Each while iteration increases seed; after both branches finish, every legal root has been checked exactly once."
  ],
  "cost": [
    "令 R = int(right)。根约有 R¹ᐟ² 的量级，种子只需它一半的位数，因此有 O(R¹ᐟ⁴) 个。每次构造、平方和检查涉及 O(log R) 位（本题最多 18 位，算术视作有界操作）：时间 O(R¹ᐟ⁴ log R)，临时空间 O(log R)。在最大输入时根上界为 999999999，奇数位种子 99999 个、偶数位种子 9999 个，共 109998 次候选测试。",
    "Let R = int(right). Roots have magnitude about R¹ᐟ²; seeds need only half their digits, giving O(R¹ᐟ⁴) candidates. Construction and checking touch O(log R) digits (at most 18 here, treating arithmetic as bounded operations): O(R¹ᐟ⁴ log R) time and O(log R) temporary space. At the maximum input the root bound is 999999999: 99999 odd-length seeds plus 9999 even-length seeds, or 109998 candidate tests."
  ],
  "boundaries": [
    "边界：left = right 时仍须检查该平方；1 = 1² 要算；0 不在范围内。不要用浮点开方取整：大整数附近可能舍入到错误边界。代码用 isqrt，并保留 low ≤ square ≤ high 的闭区间检查。输入字符串不被修改。",
    "Boundaries: equal endpoints still require checking that value; 1 = 1² counts; zero is excluded. Do not round a floating-point square root near large integer boundaries. The code uses isqrt and keeps the inclusive low ≤ square ≤ high check. Input strings are unchanged."
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
    "官方 Python 提交接口 · 完整源码",
    "Official Python submission interface · full source"
  ],
  "copied": [
    "完整源码已复制。",
    "Full source copied."
  ],
  "fallback": [
    "自动复制不可用。完整源码已选中，请按 Ctrl+C（macOS 用 ⌘C）。",
    "Automatic copying is unavailable. Full source selected; press Ctrl+C (⌘C on macOS)."
  ],
  "verify": [
    "复算方法：小范围内扫描所有整数根，独立检查根与平方，和生成法逐项比较。上方模拟用于观察因果；这里展示的是可提交的 Python 类方法。",
    "To cross-check, scan every integer root on small ranges and independently test root and square, then compare with generation. The simulation above illustrates the mechanism; this source is the submittable Python class method."
  ],
  "related": [
    "继续学习",
    "Continue learning"
  ],
  "related0": [
    "#132：用两端与内部判断回文",
    "#132: test palindromes from endpoints and interior"
  ],
  "related1": [
    "#60：按前缀组织候选的计数",
    "#60: count candidates by their prefixes"
  ],
  "foot": [
    "数字实验使用精确整数；交互模拟与源码执行分开。",
    "Experiments use exact integers; the interactive simulation is separate from source execution."
  ]
};
