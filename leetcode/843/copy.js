window.COPY = {
  "docTitle": [
    "#843 猜猜这个单词",
    "#843 Guess the Word"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "hard": [
    "困难 · 交互式问题",
    "Hard · Interactive problem"
  ],
  "intro": [
    "你不能读取秘密单词，只能花一次提问，换来一个 0 到 6 的数字。怎样让这个数字排除更多可能？",
    "You cannot read the secret word. Spend one call to receive a number from 0 to 6. How can that number rule out more possibilities?"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "1 · 数一数",
    "1 · Count"
  ],
  "nav1": [
    "2 · 排除",
    "2 · Eliminate"
  ],
  "nav2": [
    "3 · 选提问",
    "3 · Choose"
  ],
  "nav3": [
    "4 · 预测",
    "4 · Predict"
  ],
  "nav4": [
    "5 · 实现",
    "5 · Implement"
  ],
  "s0t": [
    "一次回复到底数什么？",
    "What does one reply count?"
  ],
  "s0e": [
    "把秘密 acckzz 与提问 ccbazz 并排：第 2、5、6 位相同，所以回复 3。匹配指同一个位置上的字母相同。不是数共同字母：abcdef 与 fedcba 字母集合相同，但匹配数是 0。",
    "Place secret acckzz beside guess ccbazz: positions 2, 5 and 6 match, so the reply is 3. A match means equal letters at the same position. Shared letters are insufficient: abcdef and fedcba contain the same letters but score 0."
  ],
  "contract": [
    "官方输入是 1–100 个互不重复的六位小写单词；秘密一定在列表中。Master.guess(word) 返回位置匹配数；列表外的提问返回 −1。必须真正猜中秘密，不能只推断出来。每例允许 10–30 次调用，预算不传给解题函数。",
    "The official input contains 1–100 unique six-letter lowercase words; the secret is in the list. Master.guess(word) returns positional matches, or −1 for a guess outside the list. You must actually call it with the secret, rather than merely deduce it. Each case allows 10–30 calls; the budget is not passed to your function."
  ],
  "handTask": [
    "保持两个单词不变，显示对照；看带 ✓ 的位置，再隐藏并自己算一次。位置从 1 开始。",
    "Keep the two words fixed. Show the comparison, inspect the ✓ positions, then hide it and count again. Positions start at 1."
  ],
  "handToggle": [
    "显示 / 隐藏逐位对照",
    "Show / hide position comparison"
  ],
  "handHidden": [
    "秘密 acckzz · 提问 ccbazz · 先自己数一数。",
    "Secret acckzz · Guess ccbazz · Count first."
  ],
  "handResult": [
    "匹配位置 2、5、6 → 回复 3。每列：上方秘密 / 下方提问。",
    "Matching positions 2, 5, 6 → reply 3. Each column: secret above / guess below."
  ],
  "s1t": [
    "回复 3 后，哪些词还可能是秘密？",
    "After reply 3, which words remain possible?"
  ],
  "s1e": [
    "候选词指与所有已知回复一致的词。仍用 [acckzz, ccbazz, eiowzz, abcczz]：向 ccbazz 提问，与四个词逐一比较得到 [3, 6, 2, 2]。若回复 3，只留下 acckzz；但还得提问 acckzz 收到 6 才算成功。",
    "A candidate is a word consistent with every reply so far. Keep [acckzz, ccbazz, eiowzz, abcczz]. Comparing guess ccbazz with each gives [3, 6, 2, 2]. If the reply is 3, only acckzz remains; you still need to guess acckzz and receive 6 to succeed."
  ],
  "baseline": [
    "最简单的基线按原顺序逐个提问，直到回复 6。最多需要 n 次调用、O(1) 额外空间；100 个词时可能超过 10 次预算。离线过滤不花 Master 调用，所以应先用每个回复排除不一致的词。",
    "A simple baseline guesses each original word in order until reply 6. It needs up to n calls and O(1) extra space; with 100 words it may exceed a budget of 10. Offline comparisons cost no Master calls, so use each reply to discard inconsistent words."
  ],
  "wrong": [
    "诱人的错误规则：保留匹配数 ≥ 回复的词。上例会把 ccbazz 的 6 也保留，可如果它真是秘密，回复就该是 6，而不是 3。必须相等。",
    "Tempting wrong rule: keep words whose score is at least the reply. That retains ccbazz with score 6 above, but if it were the secret the reply would be 6, not 3. Equality is required."
  ],
  "invariant": [
    "不变式（每轮都保持的事实）：C 恰好包含与全部历史回复一致的词。开始时 C 是整个列表。真实秘密与刚收到的回复必然相等，所以过滤不会误删它；每个不相等的词都不能产生这条回复，必须删除。归纳后，历史一致性一直成立。",
    "Invariant—a fact preserved each round: C contains exactly the words consistent with the entire reply history. Initially C is the whole list. The true secret must reproduce the new reply, so filtering cannot delete it; every unequal score contradicts that reply and must be removed. Repeating this argument preserves consistency with all earlier replies."
  ],
  "s2t": [
    "下一次提问，最坏会留下多少词？",
    "How many words could the next guess leave?"
  ],
  "s2e": [
    "对每个合法提问，把当前候选词按可能回复 0–6 分组，称为桶。桶中数字是词数。回复 6 立即成功，因此只比较 0–5 桶中的最大词数，称为最坏桶。选最坏桶最小的提问，就是这里的 minimax：先看最坏情况，再让它尽量小。",
    "For each legal guess, group the current candidates by possible reply 0–6. Each group is a bucket; its number counts words. Reply 6 succeeds immediately, so the worst bucket is the largest count among replies 0–5. Choosing the guess with the smallest worst bucket is this lesson’s minimax rule: minimize the worst immediate outcome."
  ],
  "derive": [
    "同一四词例中，acckzz 的桶为 2:[eiowzz]、3:[ccbazz]、4:[abcczz]、6:[acckzz]，最坏只留 1；ccbazz 的回复 2 会留两个词，最坏为 2。因此先问 acckzz 更能控制剩余量。平局优先当前候选，再按原列表顺序；已问过的词不再问。被排除的原列表词仍是合法探针。",
    "In the same four-word example, acckzz gives buckets 2:[eiowzz], 3:[ccbazz], 4:[abcczz], 6:[acckzz], so its worst bucket has 1 word. Guess ccbazz can leave two words on reply 2, giving worst size 2. Thus acckzz controls the remaining count better. Ties prefer a current candidate, then original input order; never repeat a used guess. An eliminated original word is still a legal probe."
  ],
  "formula": [
    "C_new = {w ∈ C_old : match(guess, w) = reply}；choose = argmin max(|B₀|,…,|B₅|)",
    "C_new = {w ∈ C_old : match(guess, w) = reply}; choose = argmin max(|B₀|,…,|B₅|)"
  ],
  "limit": [
    "这里只优化下一次回复，不是整棵决策树的最优解。实现不读取预算，也不在第十次后提前返回；候选仍在就继续，收到 6 才成功。官方每例预算为 10–30，并说明测试可用合理策略解决。这不证明本启发式对每个这样的列表都在预算内；它可能超出某例预算。",
    "This optimizes one reply, not the entire decision tree. The implementation cannot read the budget and does not return early after ten calls: it continues while candidates remain, succeeding only on reply 6. Official cases allow 10–30 calls and admit a reasonable strategy. This does not prove that this heuristic fits every such case’s budget; it can exceed a case’s allowance."
  ],
  "progress": [
    "为什么会停止？若有 c 个候选，提问其中一个，失败时最多留下 c−1 个。minimax 的最坏桶不会更大，所以失败必严格减少候选。已问失败的词不在候选中；只剩一个词时，它的最坏桶为 0，平局优先候选，必实际提问它。因此真实回复下至多 n 次成功；这是终止证明，不是 10 次或 30 次预算证明。",
    "Why does this stop? With c candidates, guessing one leaves at most c−1 on failure. Minimax’s worst bucket cannot be larger, so failure strictly shrinks C. Failed guesses are no longer candidates. A lone candidate has worst bucket 0 and wins the candidate tie preference, so it is actually guessed. Truthful replies therefore give success in at most n calls. This proves termination, not a ten- or thirty-call budget guarantee."
  ],
  "scrollHint": [
    "窄屏可横向滚动表格，查看回复 4–6、最坏桶和选择状态。",
    "On narrow screens, scroll the table horizontally to inspect replies 4–6, worst size, and selection state."
  ],
  "presets": [
    "切换场景会重置本实验；预测题独立。",
    "Changing the preset restarts this experiment; the prediction is independent."
  ],
  "presetLabel": [
    "场景",
    "Scenario"
  ],
  "preset0": [
    "四词 · 秘密 eiowzz",
    "Four words · secret eiowzz"
  ],
  "preset1": [
    "官方两词 · khaled",
    "Official two words · khaled"
  ],
  "preset2": [
    "一个词",
    "One word"
  ],
  "preset3": [
    "全不匹配 · 最后一个词",
    "All disjoint · last word"
  ],
  "preset4": [
    "分组平局 · aabbbb",
    "Bucket ties · aabbbb"
  ],
  "sim": [
    "教学模拟：JavaScript 用公开的固定秘密生成回复，不运行下方 Python。成对列表场景的预算也公开给模拟器；提交函数无法读取它。其余五个场景均在 10 次内成功。表格展示下一次提问前的候选与桶大小，账本保留已完成调用；预算耗尽时停止模拟，不会假装成功。",
    "Teaching simulation: JavaScript uses the disclosed fixed secret, not the Python below. Paired scenarios also disclose a budget to the simulator; the submission cannot read it. The other five scenarios all succeed within ten calls. The table shows candidates and buckets before the next guess; the ledger retains completed calls. The simulator stops on budget exhaustion without claiming success."
  ],
  "prev": [
    "撤回一轮",
    "Back one round"
  ],
  "next": [
    "提问并过滤一轮",
    "Guess and filter one round"
  ],
  "reset": [
    "重置本实验",
    "Reset experiment"
  ],
  "end": [
    "跳到最后一轮",
    "Go to final round"
  ],
  "frame": [
    "已完成 {k} 次调用；剩余 {n} 个候选词。秘密：{secret}。",
    "Calls completed: {k}; {n} candidates remain. Secret: {secret}."
  ],
  "found": [
    "已实际提问秘密并收到 6。",
    "The secret was actually guessed and returned 6."
  ],
  "candidateTitle": [
    "当前候选词 C",
    "Current candidates C"
  ],
  "tableTitle": [
    "下一轮的探针比较（0–6 是回复值）",
    "Next-round probe comparison (0–6 are replies)"
  ],
  "probe": [
    "探针",
    "Probe"
  ],
  "worst": [
    "最坏桶",
    "Worst bucket"
  ],
  "state": [
    "状态",
    "State"
  ],
  "chosen": [
    "下一次选择",
    "Chosen next"
  ],
  "used": [
    "已提问",
    "Used"
  ],
  "available": [
    "可用",
    "Available"
  ],
  "ledgerTitle": [
    "累计提问账本",
    "Cumulative guess ledger"
  ],
  "empty": [
    "尚未提问。",
    "No calls yet."
  ],
  "history": [
    "提问 {guess} → 回复 {reply}；{before} 个候选 → {after} 个：{words}",
    "Guess {guess} → reply {reply}; {before} candidates → {after}: {words}"
  ],
  "s3t": [
    "把规则带到一组新词",
    "Transfer the rule to new words"
  ],
  "s3e": [
    "这一步要判断哪些候选与新回复一致。新列表 [aaaaaa, aaaabb, aabbbb, bbbbbb]；提问 aaaabb 收到 4。保持单词不变，先选剩余候选，再核对。这里匹配仍指相同位置的相同字母。",
    "Which candidates agree with a new reply? Fresh list: [aaaaaa, aaaabb, aabbbb, bbbbbb]. Guess aaaabb receives 4. Keep the words fixed, choose the remaining candidates, then check. A match still means equal letters at equal positions."
  ],
  "legend": [
    "会保留哪些词？",
    "Which words survive?"
  ],
  "option0": [
    "只有 aaaabb",
    "Only aaaabb"
  ],
  "option1": [
    "aaaaaa 和 aabbbb",
    "aaaaaa and aabbbb"
  ],
  "option2": [
    "aaaaaa、aaaabb 和 aabbbb",
    "aaaaaa, aaaabb and aabbbb"
  ],
  "reveal": [
    "核对并解释",
    "Check and explain"
  ],
  "pending": [
    "先选择，再核对；答案尚未显示。",
    "Choose first, then check; the answer is hidden."
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查相等条件。",
    "Check the equality condition."
  ],
  "answer": [
    "逐词匹配数是 [4, 6, 4, 2]，所以保留 aaaaaa 和 aabbbb。aaaabb 自身的 6 与回复 4 矛盾，不能因为“至少 4”而保留。两个词都符合当前回复；还不能判断哪个是真秘密。",
    "The scores are [4, 6, 4, 2], so retain aaaaaa and aabbbb. Guess aaaabb scores 6 against itself, contradicting reply 4; “at least 4” is insufficient. Both survivors fit the reply; it does not yet identify the secret."
  ],
  "s4t": [
    "把候选集合写进官方接口",
    "Implement the candidate set in the official interface"
  ],
  "s4e": [
    "Python 的 findSecretWord 返回 None，通过 Master.guess 进行调用；Master 由评测器提供，不要自行实现。secret 和 allowedGuesses 都不是参数。收到 6 就返回；即使只剩一个候选，也必须调用它。",
    "Python findSecretWord returns None and interacts through Master.guess, supplied by the judge; do not implement Master. Neither secret nor allowedGuesses is a parameter. Return on reply 6; even a lone candidate must be guessed."
  ],
  "map1": [
    "matches[i][j] 预先记录两个词的位置匹配数。zip 把对应位置配对，sum 对每个相等的 True 加 1。候选与探针在代码中是原列表下标。",
    "matches[i][j] caches positional matches between two words. zip pairs equal positions; sum adds 1 for each True equality. Candidates and probes are original-list indices in the code."
  ],
  "map2": [
    "buckets[score] += 1 对当前候选计数；最大桶不包含成功回复 6。key 按最坏桶、是否非候选、原下标依次比较，实现明确的平局规则。used 集合记录已用探针。",
    "buckets[score] += 1 counts current candidates. The maximum excludes successful reply 6. key compares worst size, whether the probe is outside C, then original index, implementing the stated tie rule. The used set records prior probes."
  ],
  "map3": [
    "列表推导式只保留 matches[probe][i] == reply 的下标。while candidates 不凭调用次数提前结束；一个候选仍要实际提问。真实回复下候选不会耗尽；若回复矛盾导致空集，函数返回也不代表成功。只有收到 6 才成功；接口没有预算参数或读取预算的方法。",
    "The comprehension keeps only indices with matches[probe][i] == reply. while candidates does not stop early at an arbitrary call count; a singleton still needs its actual guess. Truthful replies cannot empty C. If inconsistent replies empty it, returning is not success. Only reply 6 succeeds; the interface supplies no budget argument or getter."
  ],
  "cost": [
    "令 n 是词数，L=6 是长度，G≤n 是实际调用轮数。预计算 O(n²L) 时间、O(n²) 空间；每轮比较 n 个探针与至多 n 个候选，O(n²) 时间。总计 O(n²L + Gn²) 时间，最坏 O(n³+n²L)，O(n²) 额外空间。G≤n 不意味着 G≤allowedGuesses。浏览器的历史快照不计入提交空间。",
    "Let n be the word count, L=6 the length, and G≤n the actual calls. Precomputation takes O(n²L) time and O(n²) space. Each round compares n probes with at most n candidates in O(n²) time. Total: O(n²L + Gn²) time, worst case O(n³+n²L), and O(n²) auxiliary space. G≤n does not imply G≤allowedGuesses. Browser history snapshots are separate teaching storage."
  ],
  "boundaries": [
    "边界：一个词也要调用一次；回复 0 可合法排除大量词；回复 6 立即停止。列表非空、唯一、定长保证匹配 6 只对应自身。官方不允许猜列表外的词，本实现始终从原列表提问；若回复不真实，不变式的前提就不成立。",
    "Boundaries: one word still needs one call; reply 0 can eliminate many words; reply 6 stops immediately. Nonempty, unique, fixed-length words make score 6 identify exactly one word. Guesses must belong to the original list, as every probe here does. Untruthful replies violate the invariant’s premise."
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
    "查看官方接口 Python 源码",
    "View Python submission source"
  ],
  "copied": [
    "完整源码已复制。",
    "Full source copied."
  ],
  "manualCopy": [
    "自动复制不可用。下方已全选，请按 Ctrl+C（macOS 为 ⌘C）。",
    "Automatic copy unavailable. The full source is selected below; press Ctrl+C (⌘C on macOS)."
  ],
  "budgetExample": [
    "预算实验：成对列表由前缀 a/b 加上五个相同后缀字母组成，后缀依次取 c…l（20 词）、c…m（22 词）、c…n（24 词）。22 词时，首次问 accccc 得到四桶：回复 0、1 各有 10 词，回复 5、6 各有 1 词。若秘密 bmmmmm，回复 0 留下 bddddd…bmmmmm。后续每次最多单独区分一个词；第 10 次后只剩 bmmmmm，但第 11 次实际提问才成功。可切到预算 10 的不可能对照：应显示“耗尽”，不能显示“找到”。全秘密回归的最大调用数为 20/22/24 词分别 10/11/12；这是有限证据，不是通用预算保证。",
    "Budget experiment: paired words use prefix a/b followed by five copies of one suffix letter: c…l (20 words), c…m (22), or c…n (24). With 22 words, first probe accccc gives four buckets: replies 0 and 1 have 10 words each; replies 5 and 6 have 1 each. For secret bmmmmm, reply 0 leaves bddddd…bmmmmm. Each later probe can single out at most one word. After call 10 only bmmmmm remains, but call 11 must actually guess it. Switch to the infeasible budget-10 control: it must show exhausted, not found. All-secret regressions take at most 10/11/12 calls for 20/22/24 words respectively. This is finite evidence, not a universal budget guarantee."
  ],
  "known": [
    "已推断唯一候选，但尚未实际猜中；还需一次调用。",
    "One candidate is known, but has not been successfully guessed; one call is still needed."
  ],
  "exhausted": [
    "模拟预算已耗尽，未成功。即使已知唯一候选，也不能算猜中。",
    "Simulation budget exhausted; not successful. Knowing a lone candidate does not count as guessing it."
  ],
  "preset5": [
    "20 词 · 预算 10 · blllll",
    "20 words · budget 10 · blllll"
  ],
  "preset6": [
    "22 词 · 预算 11 · bmmmmm",
    "22 words · budget 11 · bmmmmm"
  ],
  "preset7": [
    "24 词 · 预算 30 · bnnnnn",
    "24 words · budget 30 · bnnnnn"
  ],
  "preset8": [
    "22 词 · 不可行预算 10 对照",
    "22 words · infeasible budget-10 control"
  ],
  "related1": [
    "二分查找：用观测排除不可能的区域 ↗",
    "Binary search: eliminate impossible regions ↗"
  ],
  "related2": [
    "数独：维护一致的候选状态 ↗",
    "Sudoku: maintain consistent candidates ↗"
  ],
  "title": [
    "#843 · 猜猜这个单词",
    "#843 · Guess the Word"
  ]
};
