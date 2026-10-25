window.LESSON_COPY = {
  "docTitle": [
    "#514 · 自由之路",
    "#514 · Freedom Trail"
  ],
  "title": [
    "#514 · 自由之路",
    "#514 · Freedom Trail"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode knowledge index"
  ],
  "meta": [
    "算法 · 困难 · Python",
    "ALGORITHMS · HARD · PYTHON"
  ],
  "tagline": [
    "转得最近，未必总步数最少。让每个可能停点保留自己的最便宜历史。",
    "The nearest next letter can cost more overall. Keep a cheapest history for each possible stopping position."
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
    "先用手转四步",
    "Count four steps by hand"
  ],
  "s1": [
    "最近的字母会误导",
    "The nearest letter can mislead"
  ],
  "s2": [
    "为每个停点记账",
    "Keep a cost at each endpoint"
  ],
  "s3": [
    "先预测，再揭晓",
    "Predict before revealing"
  ],
  "s4": [
    "把账本写成 Python",
    "Turn the ledger into Python"
  ],
  "statement": [
    "怎样用最少步数拼出 key？ring 是按固定顺序刻字的环，key 是要依次输入的字符串。位置是字符在 ring 中从 0 开始的下标；最初位置 0 对准顶部。每转一格花 1 步，每输入一个字母还必须按按钮花 1 步，按下后转盘不复位。",
    "How few steps spell key? ring gives letters in fixed circular order; key gives the letters to enter in order. A position is a zero-based index in ring; position 0 initially faces the top. Each one-place rotation costs 1 step, and each entered letter also needs a 1-step button press. Pressing does not reset the dial."
  ],
  "hand": [
    "试算 ring=\"abc\", key=\"ca\"：从 a(0) 跨过接缝到 c(2)，只转 1 格，按 1 次；再从 c(2) 到 a(0)，转 1 格，按 1 次。总计 (1+1)+(1+1)=4。圆周距离就是两个方向中较短的格数，不是下标差本身。下图固定显示刻字顺序，↔ 表示两端相邻。",
    "Try ring=\"abc\", key=\"ca\": cross the seam from a(0) to c(2) in 1 rotation, then press once. From c(2) to a(0), rotate 1 place and press once. Total: (1+1)+(1+1)=4. Circular distance counts places on the shorter of the two arcs, rather than just the index difference. The strip fixes the engraved order; ↔ marks adjacent ends."
  ],
  "constraints": [
    "官方范围：ring 与 key 长度均为 1…100，只有小写英文字母，并保证 key 能拼出。官方例子：godding / gd → 4；godding / godding → 13。每个 key 字母都要按一次，因此答案至少是 key 的长度。",
    "Official bounds: both lengths are 1…100, letters are lowercase English, and key is guaranteed spellable. Official examples: godding / gd → 4; godding / godding → 13. Every key letter needs a press, so the answer is at least the key length."
  ],
  "wrong": [
    "为什么不能每次只选最近的匹配字母？ring=\"abxxcbx\" 的 b 在位置 1 和 5，c 在 4。选 b(1)：转 1 + 按 1，再转 3 + 按 1，共 6。选 b(5)：转 2 + 按 1，再转 1 + 按 1，共 5。眼前多转一格，下一步却省两格。",
    "Why not always choose the nearest matching letter? In ring=\"abxxcbx\", b occurs at 1 and 5, and c at 4. Via b(1): rotate 1 + press 1, then rotate 3 + press 1, totaling 6. Via b(5): rotate 2 + press 1, then rotate 1 + press 1, totaling 5. One extra rotation now saves two later."
  ],
  "baseline": [
    "正确的基线：枚举每个 key 字母的所有匹配停点组合，对每条路线累加较短圆弧和按钮成本，最后取最小值。设 n=len(ring)，m=len(key)，粗略上界为 O(m·n^m) 时间、O(m) 递归空间。大量路线反复到达同一个停点；长度 100 时不能靠枚举组合。问题不在两个方向，而在每个字母可能有很多副本。",
    "A correct baseline enumerates every combination of matching endpoints for the key, sums shortest-arc rotations and presses along each route, and takes the minimum. With n=len(ring), m=len(key), a loose bound is O(m·n^m) time and O(m) recursion space. Many routes repeatedly reach the same endpoint; length 100 rules out enumerating combinations. The branching comes from repeated letters, rather than the two directions alone."
  ],
  "derive": [
    "完成同样多的 key 字母后，若两条路线都停在位置 p，它们接下来可做的操作完全相同。所以只留其中成本较小的一条；较贵路线不可能靠相同的后续操作反超。但不同位置不能这样合并：刚才 b(1) 与 b(5) 的未来不同。状态就是“已输入的字母数 + 当前停点”，动态规划就是为每个这样的状态保存最小成本。",
    "After spelling the same number of key letters, two routes ending at the same position p have exactly the same future options. Keep only the cheaper route: the dearer route cannot overtake it using the same continuation. Different endpoints cannot be merged this way: b(1) and b(5) had different futures. A state means “letters entered + current endpoint”; dynamic programming saves the minimum cost for each state."
  ],
  "labIntro": [
    "这一步要回答：输入下一个字母后，每个停点的最小累计步数是多少？previous[p] 表示已输入当前前缀、停在 p 的最小成本；current[q] 是输入下一个字母并停在 q 的最小成本。前缀就是 key 开头已输入的那一段。只允许 ring[q] 等于下一个字母的 q；不匹配的位置不能按下输入。",
    "What is the cheapest cumulative cost at each endpoint after entering the next letter? previous[p] is the minimum cost to spell the current prefix and stop at p; current[q] is the cost after entering the next letter and stopping at q. A prefix is the initial part of key already entered. Only q with the required letter is allowed; pressing at a different letter would enter the wrong character."
  ],
  "formula": [
    "current[q] = min over p (previous[p] + min(|q−p|, n−|q−p|) + 1)",
    "current[q] = min over p (previous[p] + min(|q−p|, n−|q−p|) + 1)"
  ],
  "formulaExplain": [
    "这里 n 是环长，p 遍历上一层的可达停点，q 遍历下一字母的匹配停点。内层 min 选短圆弧，+1 是这次按钮；外层 min 比较所有来源。任意更长转法到达同一 q 都更贵，无需保留。",
    "Here n is ring length, p ranges over reachable endpoints in the previous layer, and q ranges over positions of the next letter. The inner min chooses the shorter arc; +1 pays for this press. The outer min compares all sources. A longer rotation reaching the same q costs more and need not be kept."
  ],
  "proof": [
    "不变量（每层完成后始终成立的事实）：这一层每个停点存着输入该前缀并停在那里的真正最小成本。开始时只有位置 0、成本 0。任意合法路线的最后一按必有某个旧停点 p；枚举所有 p 和所有匹配 q，不会漏路线。旧成本已最小，再取短圆弧并加一次按钮，得到该路线的最好版本。取最小值便保持不变量。最后对所有停点再取最小值，因为题目不要求转回起点。",
    "Invariant (a fact true after every completed layer): each stored endpoint has the true minimum cost to spell that prefix and end there. Initially only position 0 has cost 0. Every legal route’s final press comes from some old endpoint p. Enumerating every p and every matching q misses none. The old cost is already minimal; a shortest arc plus one press gives the best version of that route. Taking the minimum preserves the invariant. Finally minimize across endpoints, since the problem never asks to return to the start."
  ],
  "simulation": [
    "教学模拟：每一帧是一个字母的全部转移完成之后，不是执行 Python。固定刻字位置的环形示意中，带“可停”标签的位置都是可能终点，不代表同时有多个转盘。账本保留历史；— 表示本层未存储该位置，不是成本 0。 窄屏可横向滚动表格；键盘聚焦表格后用左右方向键。",
    "Teaching simulation: each frame follows all transitions for one letter; this does not execute Python. In the fixed-position ring schematic, every “reachable” label marks a possible endpoint, rather than simultaneous physical dials. The ledger retains history; — means no stored state at that position, rather than cost 0. On narrow screens, scroll tables sideways; keyboard users can focus a table and use the arrow keys."
  ],
  "experiment": [
    "先选“最近选择反例”，保持输入不变，按“输入下一字母”。先比较 b 的两个停点成本，再输入 c，查看候选账本：旧成本 3 的路线怎样胜过旧成本 2？用后退恢复，再前进核对。更换预设会重置此实验，预测题独立保留。",
    "Choose “nearest-choice counterexample” and keep the input fixed. Use “Enter next letter”. Compare the two b endpoint costs, then enter c and inspect the candidates: how does old cost 3 beat old cost 2? Rewind and replay to check. Changing preset resets this experiment; the prediction is independent."
  ],
  "presets": [
    "输入预设（更换会重置实验）",
    "Input preset (changing resets the experiment)"
  ],
  "p0": [
    "手算：abc / ca",
    "Hand count: abc / ca"
  ],
  "p1": [
    "最近选择反例：abxxcbx / bc",
    "Nearest-choice counterexample: abxxcbx / bc"
  ],
  "p2": [
    "官方例 1：godding / gd",
    "Official example 1: godding / gd"
  ],
  "p3": [
    "官方例 2：godding / godding",
    "Official example 2: godding / godding"
  ],
  "p4": [
    "单格重复：a / aaa",
    "Single position repeated: a / aaa"
  ],
  "p5": [
    "全部相同：aaaa / aa",
    "All equal: aaaa / aa"
  ],
  "p6": [
    "跨接缝：abcde / e",
    "Across the seam: abcde / e"
  ],
  "prev": [
    "退回上一层",
    "Back one layer"
  ],
  "next": [
    "输入下一字母",
    "Enter next letter"
  ],
  "reset": [
    "重置实验",
    "Reset experiment"
  ],
  "end": [
    "完成全部字母",
    "Complete all letters"
  ],
  "position": [
    "已输入字母数",
    "Letters already entered"
  ],
  "ledgerTitle": [
    "各层最小累计步数（含按钮）",
    "Minimum cumulative steps by layer (presses included)"
  ],
  "layer": [
    "已输入前缀",
    "Entered prefix"
  ],
  "initial": [
    "未输入",
    "No letters yet"
  ],
  "candidatesTitle": [
    "刚完成这一层的所有候选",
    "All candidates for the just-completed layer"
  ],
  "candidateEmpty": [
    "还没有输入字母：初始位置 0，成本 0。",
    "No letter entered yet: initial position 0, cost 0."
  ],
  "from": [
    "来源 p",
    "Source p"
  ],
  "to": [
    "终点 q",
    "Target q"
  ],
  "old": [
    "旧成本",
    "Old cost"
  ],
  "distance": [
    "转动格数",
    "Rotations"
  ],
  "press": [
    "按钮",
    "Press"
  ],
  "total": [
    "候选总成本",
    "Candidate total"
  ],
  "result": [
    "比较结果",
    "Comparison"
  ],
  "winner": [
    "达到该终点最小值（可并列）",
    "Minimum for this target (ties allowed)"
  ],
  "loser": [
    "同终点有更便宜路线",
    "A cheaper route reaches this target"
  ],
  "reachable": [
    "可停",
    "reachable"
  ],
  "inactive": [
    "未存储",
    "not stored"
  ],
  "summary": [
    "ring=\"{ring}\" · key=\"{key}\" · 已输入 {i}/{m} 个字母",
    "ring=\"{ring}\" · key=\"{key}\" · entered {i}/{m} letters"
  ],
  "progress": [
    "当前层最小累计成本：{cost} 步；{status}",
    "Cheapest cumulative cost in this layer: {cost} steps; {status}"
  ],
  "pending": [
    "还未拼完 key，不是最终答案",
    "key is incomplete; this is not the final answer"
  ],
  "finished": [
    "key 已拼完，这是最终答案",
    "key is complete; this is the final answer"
  ],
  "quiz": [
    "新情境：ring=\"abxxxcbxx\", key=\"bc\"，初始位置 0。b 在 1 和 6，c 在 5。最少总步数（包括两次按钮）是多少？先选，再揭晓。",
    "Fresh case: ring=\"abxxxcbxx\", key=\"bc\", starting at 0. b is at 1 and 6; c is at 5. What is the minimum total, including both presses? Choose before revealing."
  ],
  "option0": [
    "7 步",
    "7 steps"
  ],
  "option1": [
    "4 步",
    "4 steps"
  ],
  "option2": [
    "6 步",
    "6 steps"
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
    "这个选择漏算了必要步骤，或丢掉了更好的停点。",
    "This choice misses necessary steps or discards a better endpoint."
  ],
  "quizReason": [
    "到 b(1) 的累计成本 2，到 b(6) 的成本 4，两个都要留。到 c(5)：从 1 来要 2+4+1=7；从 6 来要 4+1+1=6，所以答案 6。7 是只留最近 b 的结果；4 只算转动，漏了两次按钮。同一停点可合并，不同停点不能凭当前成本删掉。",
    "The cumulative costs at b(1) and b(6) are 2 and 4; retain both. At c(5), coming from 1 costs 2+4+1=7; coming from 6 costs 4+1+1=6. Thus 6 is optimal. 7 keeps only the nearest b; 4 counts rotations but omits two presses. Merge routes at the same endpoint, but do not discard different endpoints just because one currently costs more."
  ],
  "codeIntro": [
    "怎样让代码保持“同前缀、同停点只留最小成本”？previous={0:0} 是零字母的起点。外层 for char in key 输入一个字母；enumerate(ring) 找所有匹配终点；previous.items() 比较所有来源。current[target]=best 对应候选账本每组的最小值。",
    "How does code keep only the minimum for each prefix and endpoint? previous={0:0} is the zero-letter start. for char in key enters one letter; enumerate(ring) finds every matching endpoint; previous.items() compares every source. current[target]=best corresponds to the minimum of each target group in the candidate ledger."
  ],
  "map": [
    "例如反例第二层：target=4 时，source=1 给出 2+3+1=6，source=5 给出 3+1+1=5，于是 current[4]=5。previous=current 必须在所有终点算完后执行，防止把同一个字母重复输入。最后 return min(previous.values()) 允许结束在任何位置。",
    "For the counterexample’s second layer, target=4 gets 2+3+1=6 from source=1 and 3+1+1=5 from source=5, so current[4]=5. Assign previous=current only after computing all targets, to avoid entering the same letter repeatedly. Finally return min(previous.values()) permits any ending position."
  ],
  "boundaries": [
    "边界：一个刻字位置也要按 m 次；重复输入当前字母可以不转，但按钮不可省。重复刻字可有并列最优，代码无需选唯一赢家。跨接缝用 n−gap，正对面的两条圆弧同长也无妨。合法输入非空且总能拼出，所以每个新字母都至少有一个终点，最终 min 不会对空集合操作。代码不修改输入。",
    "Boundaries: even a one-position ring requires m presses. Repeating the current letter needs no rotation, but still needs a press. Duplicate letters may tie; no unique winner is required. Crossing the seam uses n−gap; equal opposite arcs cause no issue. Valid inputs are nonempty and spellable, so every new letter has an endpoint and the final min never sees an empty collection. Inputs are not mutated."
  ],
  "cost": [
    "令 n 为 ring 长度，m 为 key 长度。时间 O(m n²)：每个字母扫描 n 个终点，每个匹配终点最多比较 n 个来源。额外空间 O(n)：只留前后两个成本字典；每层完成后丢弃旧字典，这叫滚动存储。长度均为 100 时至多约 100 万次来源比较。教学模拟另外保存历史与候选，最多 O(m n²) 空间，不属于提交成本。",
    "Let n be ring length and m be key length. Time O(m n²): each letter scans n endpoints and each matching endpoint compares at most n sources. Auxiliary space O(n): only two cost dictionaries are retained; dropping the old one after each layer is rolling storage. Lengths of 100 give at most about one million source comparisons. The teaching simulation additionally retains history and candidates, using up to O(m n²) space; that is separate from submission cost."
  ],
  "verify": [
    "作者自查使用逐格旋转与按键的独立最短路径搜索，对照 Python 返回值及浏览器每层成本；覆盖穷举小输入、固定种子随机输入、官方例子和最大边界。这是自查，不是 LeetCode 接收记录、独立教学评审或真实学习者成效。",
    "Author checks use an independent shortest-path search over individual rotations and presses to compare Python results and every browser cost layer. Coverage includes exhaustive small cases, seeded random cases, official examples and maximum bounds. These are self-checks, not LeetCode acceptance, independent teaching review, or observed learner outcomes."
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
    "查看官方接口 Python 解法",
    "View Python solution for the official interface"
  ],
  "manualLabel": [
    "自动复制不可用；完整源码已选中，请手动复制。",
    "Automatic copying is unavailable; the full source is selected for manual copying."
  ],
  "copyOk": [
    "已复制完整 Python 源码。",
    "Full Python source copied."
  ],
  "copyFallback": [
    "请从已选中的文本框手动复制。",
    "Copy manually from the selected text box."
  ],
  "related": [
    "联系已有概念",
    "Connect to related ideas"
  ],
  "related0": [
    "第 174 题：保存足够的动态规划状态 →",
    "Problem 174: retain sufficient dynamic programming state →"
  ],
  "related1": [
    "第 403 题：不同状态有不同的未来 →",
    "Problem 403: different states have different futures →"
  ],
  "foot": [
    "作者候选 · 独立评审待进行 · 图示为教学模拟",
    "Author candidate · Independent review pending · Diagrams are teaching simulations"
  ]
};
