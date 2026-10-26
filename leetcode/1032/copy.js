window.LESSON_COPY = {
  "docTitle": [
    "#1032 · 字符流",
    "#1032 · Stream of Characters"
  ],
  "title": [
    "#1032 · 字符流",
    "#1032 · Stream of Characters"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode knowledge index"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "intro": [
    "字母一个个到来。刚刚拼成了 ab，下一个 x 到来后还算匹配吗？从末尾亲手检查，再把重复的检查合并。",
    "Letters arrive one at a time. You just formed ab. Does it still count after x arrives? Check the ending by hand, then share the repeated checks."
  ],
  "language": [
    "页面语言",
    "Page language"
  ],
  "navigation": [
    "学习步骤",
    "Lesson steps"
  ],
  "nav1": [
    "1 · 只看结尾",
    "1 · Only the ending"
  ],
  "nav2": [
    "2 · 合并检查",
    "2 · Share checks"
  ],
  "nav3": [
    "3 · 逐字回看",
    "3 · Scan backward"
  ],
  "nav4": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav5": [
    "5 · Python 实现",
    "5 · Python implementation"
  ],
  "h1": [
    "1 · ab 后再来一个 x，会怎样？",
    "1 · What happens when x follows ab?"
  ],
  "p1": [
    "这一步要回答：当前字符流是否以词表中的某个词结尾？字符流就是按到达顺序连起来的字母。每次 query（查询）先加上一个字母，再返回 true 或 false。后缀是紧贴当前结尾的一段连续字符，必须非空。固定词表 [ab, cb]，依次输入 a、b、x。先想答案，再按按钮检查。",
    "This step asks: does the current stream end with a listed word? A stream is the letters joined in arrival order. Each query appends one letter, then returns true or false. A suffix is a nonempty contiguous piece ending at the newest letter. Keep words [ab, cb] fixed and receive a, b, x. Work out the answers before advancing."
  ],
  "handHint": [
    "每次加入一个字母；看下方保留的每次结果。退回可重做。这里只改到达的字母数，不改词表。",
    "Append one letter at a time and inspect the retained results below. Rewind to replay. Only the number of received letters changes; the word list stays fixed."
  ],
  "handPrev": [
    "退回一个字母",
    "Undo one letter"
  ],
  "handNext": [
    "加入下一个字母",
    "Append next letter"
  ],
  "handInitial": [
    "还没有查询；词表 = [ab, cb]。",
    "No queries yet; words = [ab, cb]."
  ],
  "handState": [
    "已加入 {n}/3 个字母；当前字符流 = {stream}。",
    "Received {n}/3 letters; current stream = {stream}."
  ],
  "limits": [
    "官方边界：1–2000 个词，每词 1–200 个小写英文字母；每次查询一个小写英文字母，最多 40000 次。只问是否存在匹配，不要求最长词。空词不在输入范围内。",
    "Official limits: 1–2000 words, each 1–200 lowercase English letters; one lowercase English letter per query, at most 40000 queries. We only need a match, not the longest match. Empty words are outside the input contract."
  ],
  "h2": [
    "2 · 为什么从最后一个字母开始？",
    "2 · Why start at the newest letter?"
  ],
  "p2": [
    "这一步要回答：检查 ab 和 cb 时，什么工作可以共用？直接办法是对每个词检查 stream.endswith(word)，即字符流是否以该词结尾。设 L 为最长词的长度，只留最后 L 个字母也足够：任何更早的字母都不可能落在长度不超过 L 的后缀里。下面是正确的直接办法；它保留跨查询的状态。",
    "This step asks: what work can ab and cb share? The direct method tests stream.endswith(word) for every word: does the stream end with that word? Let L be the longest word length. Keeping just the newest L letters is sufficient: no older letter can belong to a suffix of length at most L. This correct baseline preserves state between queries."
  ],
  "baseSource": [
    "查看直接办法（Python）",
    "Inspect the direct baseline (Python)"
  ],
  "baseCost": [
    "设 S 为所有词的长度之和。每次字符串拼接、截取最多花 O(L)，逐词比较最坏 O(S)，合计 O(L+S) 时间。保存词表和窗口用 O(S+L) 空间。词多时，我们反复比较相同的结尾字母。",
    "Let S be the sum of all word lengths. Concatenating and slicing costs up to O(L); comparing every word costs O(S) in the worst case, for O(L+S) time per query. Words and the window use O(S+L) space. With many words, we repeatedly compare the same ending letters."
  ],
  "derive": [
    "在 ab 这个字符流上：ab 和 cb 都先要求最后一个字母是 b。检查 b 一次即可。再往前读 a，它通向 ab；如果读到 c，则通向 cb。把词反过来，ab→ba，cb→bc，公共的第一步都是 b。字典树（trie）把共同开头合成一条字符边；根是空路径，走过一条边就读一个字母。把反转的词放进去，就合并了共同结尾。",
    "For stream ab, both ab and cb first require the newest letter to be b. Check b once. Reading the preceding a then selects ab; a preceding c would select cb. Reverse the words: ab→ba and cb→bc now share their first step b. A trie is a tree of character edges that shares common beginnings. Its root is the empty path; each edge reads one letter. Inserting reversed words shares their endings."
  ],
  "terminalDef": [
    "为什么 b 还不够？反向路径 b 只是词的一部分，不是完整的 ab 或 cb。必须在完整词的终点存一个“完整词”标记。这个终点不一定是叶子（没有后续边的节点）：若词表是 [a, ba]，路径 a 已经是完整词，同时还能接着走 b。",
    "Why is b alone insufficient? The reversed path b is only part of a word, not the complete ab or cb. Mark each complete word’s endpoint as terminal. A terminal need not be a leaf (a node with no outgoing edges): with words [a, ba], path a is already a complete word and also has a b edge."
  ],
  "wrong": [
    "两个诱人的错误：①“以前出现过就一直 true”——词表 [ab, cb] 的 abx 没有匹配的后缀；②“匹配后清空历史”——词表 [aa] 的 aaa 在第 2、3 次查询都应为 true，两个 aa 共用中间的 a。",
    "Two tempting mistakes: (1) “Once seen, always true” fails on abx with words [ab, cb]: no matching suffix remains. (2) “Clear history after a match” fails on aaa with words [aa]: queries 2 and 3 are both true because the two aa occurrences overlap."
  ],
  "h3": [
    "3 · 一条边能排除哪些词？",
    "3 · What does one edge rule out?"
  ],
  "p3": [
    "这一步要回答：反向扫描何时可以停？字典树用字符边共享反转词的开头；根表示还没读字母，“完整词”标记表示走到这里恰好读完一个词。每次查询把新字母放入缓冲区（最近至多 L 个字母），然后从根重新向前回看。不要沿用上次查询停下的节点。先保留词表，逐步观察同一查询中的路径，再换预设。",
    "This step asks: when can the backward scan stop? A trie shares the beginnings of reversed words through character edges. The root means no letters read; a terminal marks an entire word. Each query adds the new letter to the buffer (the newest at most L letters), then starts again at the root and scans backward. Do not resume from the previous query’s node. Step through a query with its word list fixed before changing presets."
  ],
  "formula": [
    "成功走过 k 条边后：路径 = 当前字符流长度为 k 的后缀的反转。",
    "After k successful edges: path = reverse of the current stream’s length-k suffix."
  ],
  "preset": [
    "实验预设（更换会重置本实验）",
    "Experiment preset (changing restarts this experiment)"
  ],
  "preset0": [
    "共享 b：ab / cb",
    "Shared b: ab / cb"
  ],
  "preset1": [
    "官方示例：cd / f / kl",
    "Official example: cd / f / kl"
  ],
  "preset2": [
    "部分路径不算词：ab，输入 b",
    "A partial path is not a word: ab, receive b"
  ],
  "preset3": [
    "终点仍有分支：a / ba",
    "Terminal with a child: a / ba"
  ],
  "preset4": [
    "重叠匹配：aa",
    "Overlapping matches: aa"
  ],
  "preset5": [
    "丢弃过早字母：abc",
    "Discard old letters: abc"
  ],
  "preset6": [
    "重复词：ab / ab",
    "Duplicate words: ab / ab"
  ],
  "preset7": [
    "走完三条边：cab",
    "Follow all three edges: cab"
  ],
  "experimentInput": [
    "词表 = [{words}]；待输入 = {stream}；L = {limit}。",
    "Words = [{words}]; incoming stream = {stream}; L = {limit}."
  ],
  "traceHint": [
    "每帧完成一次加入或一次字符边检查。按“完成下一步”，先看缓冲区，再看路径和停止原因。底部保留所有已完成查询；退回会恢复整个状态。预设不影响上方手算或下方预测。",
    "Each frame completes one append or one character-edge check. Use “Complete next operation”: inspect the buffer, then the path and stopping reason. All completed queries remain below; rewind restores the whole state. Presets do not affect the hand example or prediction."
  ],
  "bufferTitle": [
    "缓冲区 · 左旧右新",
    "Buffer · oldest left, newest right"
  ],
  "emptyBuffer": [
    "空缓冲区",
    "Empty buffer"
  ],
  "state": [
    "已到达 {count} 个字母；已完成 {done} 次查询；当前查询 = {query}。",
    "Letters received: {count}; queries completed: {done}; current query: {query}."
  ],
  "pathState": [
    "本次已走路径 = {path}；k = {k}。",
    "Current successful path = {path}; k = {k}."
  ],
  "emptyPath": [
    "根（空路径）",
    "root (empty path)"
  ],
  "graphTitle": [
    "固定的反向字典树",
    "Fixed reversed trie"
  ],
  "legend": [
    "每块写出从根开始的完整反向路径；“下一条边”列出可读字符。文字“已走路径”表示路径上的节点，“当前节点”单独标出当前位置，颜色只作辅助。“完整词”表示终点，不等于叶子。",
    "Each box gives its entire reversed path from the root; “Next edges” lists readable letters. “On path” labels visited nodes, while “Current node” marks the scan position separately. Color is supplementary. “Complete word” marks a terminal, not necessarily a leaf."
  ],
  "nodePath": [
    "路径：{path}",
    "Path: {path}"
  ],
  "nextEdges": [
    "下一条边：{edges}",
    "Next edges: {edges}"
  ],
  "noEdges": [
    "无",
    "none"
  ],
  "completeWord": [
    "完整词：{word}",
    "Complete word: {word}"
  ],
  "notTerminal": [
    "不是完整词",
    "Not a complete word"
  ],
  "visited": [
    "已走路径",
    "On path"
  ],
  "current": [
    "当前节点",
    "Current node"
  ],
  "initialEvent": [
    "尚未加入字母；从根开始。查询结果尚未产生。",
    "No letters appended. Start at the root; there is no query result yet."
  ],
  "appendEvent": [
    "加入 {letter}，仅保留最后 {limit} 个字母。从根开始；尚未检查边，本次结果待定。",
    "Appended {letter}, retaining only the newest {limit} letters. Restarted at the root; no edge checked yet, result pending."
  ],
  "edgeEvent": [
    "已读 {ch}：路径 {path} 存在，但不是完整词。结果仍待定，必须再读前一个字母。",
    "Read {ch}: path {path} exists but is not a complete word. Result still pending; read the preceding letter next."
  ],
  "terminalEvent": [
    "已读 {ch}：路径 {path} 到达完整词 {match}，本次返回 true。即使还有更长的词也不必继续。",
    "Read {ch}: path {path} reaches complete word {match}; this query returns true. No need to continue even if longer words exist."
  ],
  "missingEvent": [
    "尝试路径 {tested}：没有字符 {ch} 的边。本次返回 false；所有更长的候选后缀也都需要这条缺失的边。",
    "Tried path {tested}: no {ch} edge exists. This query returns false; every longer candidate suffix would also require this missing edge."
  ],
  "exhaustedEvent": [
    "已读 {ch}，路径 {path} 存在但不是完整词；缓冲区已经读完，本次返回 false。",
    "Read {ch}: path {path} exists but is not a complete word. The buffer is exhausted, so this query returns false."
  ],
  "progress": [
    "操作 {index}/{total} · {status}",
    "Operation {index}/{total} · {status}"
  ],
  "active": [
    "可继续逐步检查",
    "more operations available"
  ],
  "ended": [
    "本预设所有查询已完成",
    "all queries in this preset completed"
  ],
  "prev": [
    "退回一步",
    "Undo operation"
  ],
  "next": [
    "完成下一步",
    "Complete next operation"
  ],
  "reset": [
    "重置本实验",
    "Reset experiment"
  ],
  "end": [
    "到全部查询结束",
    "Finish all queries"
  ],
  "historyTitle": [
    "已完成的查询 · 保留历史",
    "Completed queries · retained history"
  ],
  "noHistory": [
    "尚无已完成的查询。",
    "No queries completed yet."
  ],
  "historyRow": [
    "第 {q} 次 · {prefix} → {result}；{reason}",
    "Query {q} · {prefix} → {result}; {reason}"
  ],
  "matchReason": [
    "结尾匹配 {match}",
    "ending matches {match}"
  ],
  "noMatchReason": [
    "结尾无词匹配",
    "no listed word matches the ending"
  ],
  "simulation": [
    "这是有界的 JavaScript 教学模拟，不是在执行下方 Python 提交。预设最多 12 个字母，展示所有操作，没有跳步。模拟保存完整快照以便退回，Python 只存字典树和最近 L 个字母。",
    "This is a bounded JavaScript teaching simulation, not execution of the Python submission below. Presets have at most 12 letters; every operation is shown with no omissions. The simulation saves full snapshots for rewind; Python stores only the trie and newest L letters."
  ],
  "proof": [
    "为什么成立？把“每次成功走 k 条边，路径就是当前长度 k 后缀的反转”称为不变量，即每步都保持的事实。开始 k=0，空路径成立；再读前一个字母，恰好给后缀增加一个字母，所以事实继续成立。遇到完整词，反转回来就是所需后缀；缺边时，任何更长匹配都得经过同一条缺边，因而都不可能。读完而没有终点则没有候选词。最长词只有 L 个字母，所以丢弃更早的字母不影响判断。",
    "Why does this work? Call “after k successful edges, the path reverses the current length-k suffix” an invariant: a fact preserved at every step. It holds at k=0 for the empty path. Reading the preceding letter extends that suffix by exactly one letter, preserving the fact. A terminal therefore gives a matching suffix. If an edge is missing, every longer match would need that same edge and is impossible. Exhausting the buffer without a terminal leaves no candidate. No word exceeds L letters, so discarding older letters cannot affect the answer."
  ],
  "h4": [
    "4 · 不找最长词，结果会错吗？",
    "4 · Must we find the longest word?"
  ],
  "p4": [
    "这一步要回答：词表 [bc, abc]，已经输入 ab，再加入 c，应在哪里停？后缀必须贴着最新字符 c 结束。反向字典树从根读最新字符；终点标记表示已读完一个完整词。预测本次的路径和返回值。这组数据独立于上方实验。",
    "This step asks: with words [bc, abc] and stream ab, where should the scan stop after c arrives? A suffix must end at the newest c. The reversed trie reads the newest letter from its root; a terminal marks a complete word. Predict the path and return value for this query. This case is independent of the experiment above."
  ],
  "choose": [
    "选择后再揭晓",
    "Choose, then reveal"
  ],
  "opt0": [
    "必须读 c → b → a，到叶子 abc 才能返回 true。",
    "Must read c → b → a and reach leaf abc before returning true."
  ],
  "opt1": [
    "读 c → b，完整词 bc 已足够，返回 true。",
    "Read c → b; complete word bc is sufficient, return true."
  ],
  "opt2": [
    "从根先读 a，缺少 a 边，因此返回 false。",
    "Read a first from the root; no a edge, so return false."
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
    "需要修正预测。",
    "Revise that prediction."
  ],
  "explanation": [
    "路径 c 不是完整词，继续读 b；路径 cb 是 bc 的反转，已到终点，返回 true。虽然 cb 还有 a 边通向 abc，但题目只要求存在一个后缀。选项 1 多做了非必要检查；选项 3 把后缀检查方向弄反了。",
    "Path c is not a complete word, so read b. Path cb reverses bc and is terminal: return true. Although cb has an a edge leading to abc, the problem only asks for one suffix. Option 1 adds an unnecessary requirement; option 3 scans in the wrong direction."
  ],
  "h5": [
    "5 · 把不变量写进 Python",
    "5 · Put the invariant into Python"
  ],
  "p5": [
    "这一步要回答：哪些代码保存跨查询的字母，哪些代码只用于当前扫描？字典树共享反转词的路径；完整词用 # 标记，它不可能与小写输入字符冲突。self.root 保存词表，self.buffer 保存最近的字母；局部变量 node 每次查询都重回根。",
    "This step asks: which code preserves letters across queries, and which state belongs only to the current scan? The trie shares reversed word paths. The marker # denotes a complete word and cannot collide with lowercase input. self.root stores the dictionary; self.buffer stores recent letters; local node restarts at the root on every query."
  ],
  "mapping": [
    "deque(maxlen=L) 是两端队列，append 加入新字母时会自动丢弃超过 L 的最早字母。reversed 从后往前迭代，不复制整个窗口。构建时 node[ch] = {} 新建字符边；查询时 node.get(ch) 取子节点，缺边返回 None。以 ab 为例：先找 b，再找 a，随后发现 # 并返回 True，对应实验的“完整词”帧。",
    "deque(maxlen=L) is a double-ended queue: append automatically discards the oldest letter when more than L are stored. reversed iterates backward without copying the window. During construction, node[ch] = {} creates a character edge. During queries, node.get(ch) gets a child or returns None for a missing edge. For ab, follow b, then a, then find # and return True: the experiment’s terminal frame."
  ],
  "costs": [
    "设 S 为词表总字符数，L 为最长词长度，t 为累计到达的字母数。构建用 O(S) 时间；每次查询最坏检查 min(t,L) 个字符，时间 O(min(t,L))；总存储 O(S+L)，含字典树和缓冲区。字典操作按通常的期望 O(1) 计。提前命中会减少本次工作，但最坏仍可读满 L=200 个字符。教学快照另占空间，不计入提交的复杂度。",
    "Let S be total word characters, L the longest word length, and t the letters received so far. Construction takes O(S) time; a query checks at most min(t,L) characters, for O(min(t,L)) worst-case time. Total storage is O(S+L), including trie and buffer, with usual expected O(1) dictionary operations. An early terminal reduces this query’s work, but worst-case scans can still read L=200 characters. Teaching snapshots use extra space outside submission costs."
  ],
  "boundaries": [
    "边界：单字母词在第一条边即可命中；重复词只重复设置同一终点；匹配后保留缓冲区才能处理重叠；零次查询时只完成构建；部分路径不是完整词。输入词表不会被修改。空词、大小写转换和任意 Unicode 不属于本题约定。",
    "Boundaries: a one-letter word can match on the first edge; duplicates mark the same terminal again; keep the buffer after a match to support overlaps; zero queries require only construction; a partial path is not a word. The input word list is not mutated. Empty words, case conversion and arbitrary Unicode are outside this problem’s contract."
  ],
  "source": [
    "展开官方接口的 Python 解法",
    "Open Python solution for the official interface"
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
    "已复制完整 Python 源码。",
    "Full Python source copied."
  ],
  "manual": [
    "自动复制不可用。下方已选中完整源码；请用系统复制快捷键。",
    "Automatic copy unavailable. The full source below is selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "完整 Python 源码（只读，手动复制）",
    "Full Python source (read-only, manual copy)"
  ],
  "related": [
    "继续学习",
    "Continue learning"
  ],
  "link1": [
    "重看反向路径的不变量",
    "Revisit the backward-path invariant"
  ],
  "link2": [
    "#212：在网格里沿字典树搜索单词",
    "#212: follow trie paths to find grid words"
  ],
  "link3": [
    "#336：用反转关系寻找回文对",
    "#336: use reversal to find palindrome pairs"
  ],
  "trieLink": [
    "在 #212 看字典树如何共享单词开头 →",
    "See #212: how a trie shares word beginnings →"
  ]
};
