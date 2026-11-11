window.LESSON_COPY = {
  "docTitle": [
    "#1106 · 解析布尔表达式",
    "#1106 · Parsing A Boolean Expression"
  ],
  "title": [
    "#1106 · 解析布尔表达式",
    "#1106 · Parsing A Boolean Expression"
  ],
  "back": [
    "← LeetCode 题集",
    "← LeetCode collection"
  ],
  "meta": [
    "困难 · 栈 · 字符串解析",
    "Hard · Stack · Parsing"
  ],
  "tagline": [
    "遇到右括号，把完整的一组变成一个真假值。",
    "At each closing parenthesis, turn one complete group into one truth value."
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
    "学习步骤",
    "Lesson steps"
  ],
  "s1": [
    "先用手算一组",
    "Calculate one group by hand"
  ],
  "s2": [
    "保留尚未完成的结构",
    "Keep the unfinished structure"
  ],
  "s3": [
    "逐字符观察栈",
    "Inspect the stack character by character"
  ],
  "s4": [
    "先预测括号的作用域",
    "Predict the group’s scope"
  ],
  "s5": [
    "对应到 Python",
    "Connect the rule to Python"
  ],
  "statement": [
    "这一步要回答：字符串 &(t,!(f)) 的值是什么？布尔值只有真（true）和假（false）；字面量 t、f 分别直接表示它们。输入是一条合法的布尔表达式，输出一个布尔值，而不是字符串。",
    "What value does &(t,!(f)) represent? A Boolean has just two values, true and false; the literals t and f directly name them. The input is one valid Boolean expression. Return a Boolean value, rather than a string."
  ],
  "rules": [
    "!(x) 表示非：把一个子表达式 x（一个完整的内层表达式）的真假翻转。&(x,y,…) 表示与：所有子表达式都真才真。|(x,y,…) 表示或：至少一个子表达式真就真。非恰好接收一个子表达式；与、或各接收至少一个。逗号只分隔同组的输入。",
    "!(x) means NOT: flip the truth value of its single subexpression x, a complete inner expression. &(x,y,…) means AND: true only if every child is true. |(x,y,…) means OR: true if at least one child is true. NOT has exactly one child; AND and OR have at least one each. Commas only separate children in the same group."
  ],
  "hand": [
    "先固定外层的 t，只算 !(f)：假取非得到真。再把这个结果放回原处。点击一次看内层，再点击一次看外层；观察已保留的计算过程。",
    "Keep the outer t fixed and calculate !(f) first: NOT false is true. Put that value back in the same place. Click once for the inner group, then once for the outer group; read the retained calculation steps."
  ],
  "handNext": [
    "揭示下一次手算",
    "Reveal next hand calculation"
  ],
  "handReset": [
    "重置手算",
    "Reset hand calculation"
  ],
  "hand0": [
    "还没有替换：先找完整的内层 !(f)。",
    "No replacement yet: start with the complete inner !(f)."
  ],
  "hand1": [
    "!(f) → t，因此 &(t,!(f)) → &(t,t)。",
    "!(f) → t, so &(t,!(f)) → &(t,t)."
  ],
  "hand2": [
    "&(t,t) → t；两个输入都真，最终结果为 true。",
    "&(t,t) → t; both children are true, so the final result is true."
  ],
  "constraints": [
    "官方约束：长度 1…20,000；仅含 t f ! & | ( ) ,；保证表达式合法，不含空白，也没有空输入或空参数组。",
    "Official constraints: length 1…20,000; only t f ! & | ( ) , occur. Expressions are guaranteed valid, with no whitespace, empty input or empty argument groups."
  ],
  "examples": [
    "官方例子：&(|(f)) → false；|(f,f,f,t) → true；!(&(f,t)) → true。",
    "Official examples: &(|(f)) → false; |(f,f,f,t) → true; !(&(f,t)) → true."
  ],
  "baseline": [
    "这一步要回答：直接反复替换时，哪些工作重复了？基线（一个直接但正确的方法）每次找第一个右括号，再往左找最近的左括号。此时组内已没有更深的括号。计算这一组，复制前后文本，把它替换成 t 或 f。对 &(t,!(f))，依次得到 &(t,t)、t，正是刚才的手算。",
    "What work repeats in direct substitution? A baseline, a simple correct method, finds the first closing parenthesis and the nearest opening parenthesis before it. This group contains no deeper parentheses. Evaluate it, copy the surrounding text, and replace the group with t or f. For &(t,!(f)), this produces &(t,t), then t, exactly as in the hand calculation."
  ],
  "baselineSource": [
    "展开：直接替换的 Python 基线",
    "Expand: Python substitution baseline"
  ],
  "baselineAPIs": [
    "代码中的 index 找第一个匹配位置，rfind 找指定范围内最后一个匹配位置；split 把逗号分隔的文本拆成列表，切片 s[:k] 和 s[k:] 复制前后文本。all 要求每个检查都为真，any 只要求至少一个为真。",
    "In the code, index finds the first matching position and rfind finds the last match in the specified range. split turns comma-separated text into a list; slices s[:k] and s[k:] copy the surrounding text. all requires every check to be true; any requires at least one to be true."
  ],
  "baselineCost": [
    "设 n 是输入字符数。最多 O(n) 次替换；每次搜索与文本复制都可能花 O(n)，所以最坏 O(n²) 时间，O(n) 同时存活的额外空间。长串 !(!(!(...t...))) 每次只缩短三个字符，却反复扫描余下文本。20,000 字符时，避免重扫比换一个真假运算更有用。",
    "Let n be the number of input characters. There are O(n) replacements, each potentially requiring O(n) search and copying: O(n²) worst-case time and O(n) live extra space. In !(!(!(...t...))), each replacement removes only three characters but rescans the remaining text. At 20,000 characters, avoiding rescans matters more than changing a Boolean operation."
  ],
  "wrong": [
    "诱人的错误：只要看见 t 就返回真。反例 &(t,!(t))：内层 !(t)=f，外层 &(t,f)=f。即使把所有原始字面量直接按外层运算组合，也丢掉了非的作用域（它只影响自己的括号组）。",
    "Tempting mistake: return true whenever any t appears. Counterexample &(t,!(t)): the inner !(t)=f, then &(t,f)=f. Even combining all raw literals using only the outer operator loses NOT’s scope: it affects only its own group."
  ],
  "derive": [
    "改用栈：一个只在右端追加或删除的列表，右端是最新项。一次从左到右读取；把运算符、左括号和字面量保留在栈上，忽略分隔逗号。遇到右括号时，最近的左括号上方就是这一组已经算好的输入。仅删除这一组和它的运算符，再放回一个结果；外层尚未完成的结构不动。",
    "Use a stack: a list where items are added or removed at the right end, the newest end. Scan once from left to right. Keep operators, opening parentheses and literals; omit separating commas. At a close, the entries above the nearest opening parenthesis are the group’s already evaluated children. Remove just that group and its operator, then push one result. Keep the unfinished outer structure intact."
  ],
  "bridge": [
    "同一例子 &(t,!(f))，栈按左→右从旧到新排列：\n读完 &(t, ：[ & ( t ]\n读完内层 !(f) ：[ & ( t t ]\n读完外层 ) ：[ t ]",
    "Same example &(t,!(f)), stack shown oldest→newest from left to right:\nAfter &(t, : [ & ( t ]\nAfter inner !(f) : [ & ( t t ]\nAfter outer ) : [ t ]"
  ],
  "invariant": [
    "由此得到不变量（每次更新后都成立的事实）：栈就是已读前缀，省略逗号，并把每个已完成的子表达式替换成一个 t 或 f。比如 [ & ( t t ] 仍保留着未完成的外层与，但内层非已变成一个值。",
    "This gives an invariant, a fact preserved after every update: the stack is the processed prefix with commas omitted and every completed subexpression replaced by one t or f. Thus [ & ( t t ] keeps the unfinished outer AND while the inner NOT has become one value."
  ],
  "proof": [
    "为什么不会删错层？右括号关闭最近一个尚未关闭的左括号；更深的组都已经压成字面量，所以上方只剩当前组的输入。取出它们、左括号和紧邻其下的运算符，按规则放回一个结果，就再次满足不变量。初始空栈满足它；结束时，合法输入恰好变成一个字面量。",
    "Why can the reduction not cross into the wrong group? A close matches the nearest still-open parenthesis. Deeper groups have already become literals, so only this group’s children remain above it. Remove those children, the opening parenthesis and its operator immediately below. Push the value prescribed by that operator, restoring the invariant. The empty initial stack satisfies it; at the end, a valid input has become exactly one literal."
  ],
  "task": [
    "这一步要回答：读到某个字符后，哪些结构还没完成？栈是右端最新的列表；t/f 代表真/假。换预设会重置本实验，手算和预测题不变。先固定例子，逐字符前进，比较前后栈；在第一个右括号处看外层 & ( t 是否保留，再后退重放。",
    "Which structures are unfinished after a character is read? The stack is a list with its newest item on the right; t/f mean true/false. Changing the preset restarts this experiment, preserving the hand calculation and prediction. Keep one example fixed, advance character by character and compare both stacks. At the first close, check that the outer & ( t survives, then rewind and replay."
  ],
  "simulation": [
    "教学模拟：JavaScript 生成完整的预设轨迹，不会执行下面的 Python 提交。每帧表示一个字符处理完毕；右括号的一帧包含整组弹出和结果入栈。保留的快照与历史额外占用空间，不计入提交的复杂度。",
    "Teaching simulation: JavaScript generates complete preset traces; it does not execute the Python submission below. Each frame is after one full character operation. A closing-parenthesis frame includes all pops and the result push. Retained snapshots and history use extra teaching memory, outside the submission’s space bound."
  ],
  "preset": [
    "预设表达式（更换即重置轨迹）",
    "Preset expression (changing it restarts the trace)"
  ],
  "case": [
    "例 {number}",
    "Case {number}"
  ],
  "selected": [
    "当前输入：{expression}",
    "Selected input: {expression}"
  ],
  "prev": [
    "退回一个字符",
    "Back one character"
  ],
  "next": [
    "处理下一个字符",
    "Process next character"
  ],
  "reset": [
    "重置轨迹",
    "Reset trace"
  ],
  "end": [
    "处理到末尾",
    "Process to end"
  ],
  "progress": [
    "已处理字符 {count}/{total}；当前字符下标 {index}（从 0 开始）。",
    "Characters processed {count}/{total}; current character index {index} (zero-based)."
  ],
  "none": [
    "无",
    "none"
  ],
  "tokenHint": [
    "输入从左到右；数字是字符下标。青色文字表示已读，橙色下划线和下标表示刚处理的字符（也属于已读），普通文字表示未读。栈中的项是值或语法符号，不是原始下标。",
    "Read input left to right; numbers are character indices. Cyan text means processed. An orange underline and index mark the just-processed character, which is also processed. Plain text is unread. Stack entries are values or syntax tokens, not original indices."
  ],
  "before": [
    "处理这个字符之前",
    "Before this character"
  ],
  "after": [
    "处理这个字符之后",
    "After this character"
  ],
  "empty": [
    "空栈",
    "Empty stack"
  ],
  "stackOrder": [
    "按行阅读：先左→右，再上→下；最后一项最新。",
    "Read rows left→right, then top→bottom. Last item is newest."
  ],
  "initial": [
    "尚未读取字符。两个栈都为空。",
    "No character read yet. Both stacks are empty."
  ],
  "push": [
    "读 {char}：把它追加到栈的右端，等待这一组完成。",
    "Read {char}: append it at the right end, keeping it until its group is complete."
  ],
  "comma": [
    "读逗号：它只分隔输入，所以栈不变。",
    "Read a comma: it only separates children, so the stack is unchanged."
  ],
  "reduce": [
    "读右括号：{operator}({values}) → {value}。弹出这些输入、左括号及运算符，再放回 {value}。",
    "Read a close: {operator}({values}) → {value}. Pop these children, the opening parenthesis and the operator, then push {value}."
  ],
  "waiting": [
    "当前还未读完；栈不是最终答案。",
    "Input remains unread; the current stack is not the final answer."
  ],
  "result": [
    "已读完：栈 [{value}]，返回布尔值 {result}。",
    "All input processed: stack [{value}], return Boolean {result}."
  ],
  "history": [
    "已完成的括号组",
    "Completed groups"
  ],
  "historyHint": [
    "按完成顺序保留每次缩减。初始和只读字面量时没有缩减；后退会恢复当时的历史。",
    "Keep reductions in completion order. There are none initially or for a lone literal. Rewinding restores the history at that instant."
  ],
  "noReductions": [
    "尚无已完成的括号组。",
    "No group completed yet."
  ],
  "ledger": [
    "字符 {index}：{operator}({values}) → {value}",
    "Character {index}: {operator}({values}) → {value}"
  ],
  "flags": [
    "为什么只需两个真假标志？has_true 表示刚弹出的输入中至少有一个 t；has_false 表示至少有一个 f。与为真等价于没有 f；或为真等价于有 t；非只有一个输入，为真等价于没有 t。与、或不依赖输入顺序，所以从右侧弹出不影响结果。即使提前知道值，仍须读完括号结构；本实现处理每个字符。",
    "Why do two presence flags suffice? has_true means at least one popped child is t; has_false means at least one is f. AND is true exactly when no child is f. OR is true exactly when some child is t. NOT has one child and is true exactly when that child is not t. AND and OR are order independent, so popping from the right preserves the value. Even if a value is known early, the nested syntax must still be consumed; this implementation processes every character."
  ],
  "quiz": [
    "新题 |(&(t,f),!(t))：第一个右括号刚处理完时，栈是什么？最终返回什么？栈从左到右排列，右端最新；t/f 表示真/假。先选择，再揭晓。",
    "Fresh case |(&(t,f),!(t)): just after the first closing parenthesis, what is the stack, and what Boolean will eventually be returned? Stacks run left to right, newest on right; t/f mean true/false. Choose before revealing."
  ],
  "o0": [
    "A · 栈 [ | ( t f ]；最终 true",
    "A · Stack [ | ( t f ]; eventually true"
  ],
  "o1": [
    "B · 栈 [ | ( f ]；最终 false",
    "B · Stack [ | ( f ]; eventually false"
  ],
  "o2": [
    "C · 栈 [ f ]；最终 false",
    "C · Stack [ f ]; eventually false"
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal and explain"
  ],
  "correct": [
    "判断正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查括号的作用域。",
    "Check which group the close belongs to."
  ],
  "answer": [
    "第一个右括号只关闭 &(t,f)，它必须整体变成 f，所以栈为 [ | ( f ]。外层 | ( 还没关闭，!(t) 还未读取。随后 !(t)=f，|(f,f)=f，返回 false。A 把与的两个输入留成独立值；C 过早删除了外层。",
    "The first close ends only &(t,f), which must become a single f, leaving [ | ( f ]. The outer | ( is still open and !(t) is unread. Later !(t)=f and |(f,f)=f, returning false. A leaves the AND children as separate values; C removes the outer context too early."
  ],
  "codeIntro": [
    "这一步要回答：同一个栈规则怎样成为官方 Python 提交？Solution.parseBoolExpr 接收字符串 expression，返回 bool。列表 stack 的右端最新；append 追加，pop 删除并返回最后一项，stack[-1] 查看最后一项。",
    "How does this same stack rule become an official Python submission? Solution.parseBoolExpr takes the string expression and returns bool. The newest item is at the right end of list stack. append adds an item; pop removes and returns the last item; stack[-1] reads the last item."
  ],
  "map1": [
    "逗号分支 continue 跳到下一个字符；非右括号分支 stack.append(char) 保留未完成结构。",
    "The comma branch uses continue to move to the next character. The non-close branch uses stack.append(char) to keep unfinished structure."
  ],
  "map2": [
    "右括号分支的 while 弹出字面量，直到遇到左括号。has_true / has_false 记录弹出的输入中是否出现 t / f；随后两次 pop 删除左括号与运算符。",
    "At a close, while pops child literals until the opening parenthesis. has_true / has_false record whether t / f occurred among the popped children. Two further pops remove the opening parenthesis and operator."
  ],
  "map3": [
    "if / elif / else 根据非、与、或计算布尔结果，再把它编码为 t 或 f 入栈。例如 !(f) 弹出 f 后，has_true=False，非运算 not has_true 得到 True，于是放回 t。最后 stack[0] == 't' 把唯一的字面量转成 bool 返回。",
    "if / elif / else compute NOT, AND or OR, then encode the Boolean as t or f and push it. For !(f), popping f leaves has_true=False, so NOT computes not has_true=True and pushes t. Finally stack[0] == 't' converts the single remaining literal to bool."
  ],
  "bounds": [
    "边界：单独 t 或 f 不需要括号缩减；&(f) 与 |(f) 都是合法单输入组；非必须只有一个输入。深层嵌套也用列表保存，不消耗 Python 递归调用栈。官方保证合法，因此不处理空串、空组或缺少括号。",
    "Boundaries: a lone t or f needs no reduction. &(f) and |(f) are valid one-child groups; NOT must have one child. Deep nesting lives in a list, avoiding Python’s recursive-call limit. The official validity guarantee excludes empty strings, empty groups and missing parentheses."
  ],
  "cost": [
    "设 n 为字符数：O(n) 时间，O(n) 额外空间。虽然某个右括号会弹出很多项，但每项只入栈一次、出栈一次；所有 while 循环合起来是 O(n)，不是每个字符都扫描整栈。宽组可同时保留 O(n) 个字面量，深组可保留 O(n) 个括号和运算符。",
    "Let n be the number of characters: O(n) time and O(n) auxiliary space. A single close may pop many entries, but each entry is pushed and popped at most once. All while loops together cost O(n); they do not scan the entire stack for every character. A wide group can retain O(n) literals; a deep group can retain O(n) parentheses and operators."
  ],
  "verification": [
    "可复算的方法：小输入用逐组替换基线，或先生成语法树并独立算出真假，再与此提交比较。浏览器轨迹是规则演示，不是 Python 执行，也不是在线判题结果。",
    "To check the rule, use direct group substitution on small inputs, or generate syntax trees and calculate their truth values independently before comparing the submission. The browser trace demonstrates the rule; it is neither Python execution nor an online judge result."
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
    "展开完整 Python 提交",
    "Expand full Python submission"
  ],
  "copied": [
    "已复制完整源码。",
    "Full source copied."
  ],
  "manual": [
    "自动复制不可用。完整源码已选中，请使用系统复制快捷键。",
    "Automatic copy is unavailable. The full source is selected; use your system copy shortcut."
  ],
  "related": [
    "继续学习括号中的独立上下文",
    "Explore separate contexts inside parentheses"
  ],
  "related0": [
    "基本计算器：保留外层总和与符号",
    "Basic Calculator: preserve outer totals and signs"
  ],
  "related1": [
    "原子的数量：内层计数合并回外层",
    "Number of Atoms: merge inner counts into the parent"
  ],
  "foot": [
    "先保留未完成的结构，再把完成的一组压成一个值。",
    "Keep unfinished structure; compress each completed group to one value."
  ]
};
