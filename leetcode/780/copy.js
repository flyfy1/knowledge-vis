'use strict';
window.LESSON_COPY = {
  "docTitle": [
    "#780 · 到达终点",
    "#780 · Reaching Points"
  ],
  "title": [
    "#780 · 到达终点",
    "#780 · Reaching Points"
  ],
  "back": [
    "← LeetCode 专区",
    "← LeetCode collection"
  ],
  "hard": [
    "困难 · 算法 · Python",
    "Hard · Algorithms · Python"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "intro": [
    "把两个数字写在纸上：每次把一个改成两数之和。给定起点 (sx, sy) 和终点 (tx, ty)，能否到达？只求真或假，不求最少步数。",
    "Write two numbers on paper. Replace either one by their sum. Given start (sx, sy) and target (tx, ty), can you get there? Return a boolean, not the fewest moves."
  ],
  "constraints": [
    "官方范围：1 ≤ sx, sy, tx, ty ≤ 10⁹；可以不做任何操作。",
    "Official range: 1 ≤ sx, sy, tx, ty ≤ 10⁹; zero moves are allowed."
  ],
  "nav0": [
    "0 · 亲手相加",
    "0 · Add by hand"
  ],
  "nav1": [
    "1 · 唯一的来路",
    "1 · A forced way back"
  ],
  "nav2": [
    "2 · 取余与边界",
    "2 · Remainder & boundary"
  ],
  "nav3": [
    "3 · 预测新输入",
    "3 · Predict a new case"
  ],
  "nav4": [
    "4 · Python 与成本",
    "4 · Python & costs"
  ],
  "s0t": [
    "从 (1,1) 到 (3,5)，每一步改了什么？",
    "What changes on the way from (1,1) to (3,5)?"
  ],
  "s0e": [
    "这一步要回答：什么才是合法的一步？点 (x,y) 的两个坐标是有顺序的数字。只能改一个：把 x 改成 x+y，或把 y 改成 x+y。先加到 y：(1,1)→(1,2)；再加到 x：(1,2)→(3,2)；再加到 y：(3,2)→(3,5)。每次另一坐标不变，因此这是一条可达路径。可达指存在一串合法操作，包括零步。",
    "The question: what makes one move legal? A point (x,y) is an ordered pair of numbers. Change just one: replace x by x+y, or y by x+y. Add into y: (1,1)→(1,2); into x: (1,2)→(3,2); then into y: (3,2)→(3,5). The other coordinate stays fixed each time, so this is a reachable path. Reachable means some legal sequence exists, including zero moves."
  ],
  "handTask": [
    "依次点「加到 y、加到 x、加到 y」，看保留的路径。再撤销，确认原坐标和历史一起恢复。试错不代表无解；这一步只在试一条路径。",
    "Click Add into y, Add into x, then Add into y. Inspect the retained path. Undo to restore both coordinates and history. A failed attempt does not prove impossibility; here you are exploring just one path."
  ],
  "handLimit": [
    "手算模拟：固定起点 (1,1)，目标 (3,5)；仅为控制画面，两数之和超过 20 时停止添加。这不是官方输入限制。",
    "Hand simulation: fixed start (1,1), target (3,5). To keep it small, adding stops when the sum exceeds 20. This is not an official input limit."
  ],
  "addX": [
    "加到 x：x ← x+y",
    "Add into x: x ← x+y"
  ],
  "addY": [
    "加到 y：y ← x+y",
    "Add into y: y ← x+y"
  ],
  "undo": [
    "撤销上一步",
    "Undo last move"
  ],
  "reset": [
    "重置本实验",
    "Reset this experiment"
  ],
  "handRead": [
    "当前 ({x}, {y})；已做 {n} 次加法。{status}",
    "Current ({x}, {y}); {n} additions made. {status}"
  ],
  "hit": [
    "这条路径已到达 (3,5)。",
    "This path has reached (3,5)."
  ],
  "exploring": [
    "这条路径尚未到达 (3,5)。",
    "This path has not reached (3,5)."
  ],
  "pathLabel": [
    "本次尝试保留的全部点",
    "All retained points in this attempt"
  ],
  "s1t": [
    "为什么倒着走不需要猜方向？",
    "Why is the backward direction forced?"
  ],
  "s1e": [
    "这一步要回答：终点前一步只能是什么？正数相加后，被改的坐标必然比另一个大。(3,5) 中 5 较大，所以最后一定改了 y：原来的 y=5−3=2。随后 (3,2) 的 x 较大，原 x=3−2=1。于是倒推 (3,5)→(3,2)→(1,2)→(1,1)，正好倒转刚才的加法。前驱就是紧挨着当前点的上一个点。",
    "The question: what point could come immediately before the target? With positive inputs, the changed coordinate becomes larger than the other one. In (3,5), 5 is larger, so the last move must have changed y: its old value was 5−3=2. In (3,2), x is larger, so its old value was 3−2=1. Thus (3,5)→(3,2)→(1,2)→(1,1) reverses our additions exactly. A predecessor is the point immediately before the current one."
  ],
  "baseline": [
    "正确基线：从起点向前枚举两种加法，用队列按步数访问点（广度优先搜索），用集合避免重复。两坐标从不减小，超过终点任一坐标的点都可丢弃。最多访问 tx×ty 个正整数点，时间、空间上界均为 O(tx·ty)；10⁹ 级坐标让这个上界毫无实用性。倒着逐次减法虽不分叉，(1,1)→(1,10⁹) 仍需 999,999,999 次减法。",
    "A correct baseline enumerates both forward additions. A queue visits points by move count (breadth-first search), and a set avoids repeats. Neither coordinate decreases, so discard a point if either coordinate exceeds the target. There are at most tx×ty positive grid points: O(tx·ty) time and space upper bounds, impractical at 10⁹-scale coordinates. Backward single subtraction removes branching, but (1,1)→(1,10⁹) still needs 999,999,999 subtractions."
  ],
  "baseSource": [
    "展开可运行的小输入基线",
    "Open runnable small-input baseline"
  ],
  "wrong": [
    "诱人的错误捷径：只检查最大公约数（能同时整除两个数的最大正整数）。加法和减法保持它不变，但相同不代表可达。例如 (2,3) 与 (3,4) 的最大公约数都是 1，可倒推 (3,4)→(3,1) 已低于起点的 y=3，再也不能回到 (2,3)。坐标的下界不能丢。",
    "A tempting shortcut checks only the greatest common divisor: the largest positive integer dividing both numbers. Addition and subtraction preserve it, but equality does not prove reachability. Both (2,3) and (3,4) have gcd 1, yet reversing (3,4)→(3,1) drops below starting y=3. It can never get back to (2,3). The starting lower bounds matter."
  ],
  "equalRule": [
    "若两个目标坐标相等，正数前驱不存在：相减会得到 0。只有它本身就是起点时才能成功。因此 (1,1)→(2,2) 为假，而 (1,1)→(1,1) 用零步为真。",
    "If target coordinates are equal, there is no positive predecessor: subtraction gives 0. Success is possible only when that point is the start itself. Thus (1,1)→(2,2) is false, while (1,1)→(1,1) is true with zero moves."
  ],
  "s2t": [
    "怎样跳过重复减法，又不跳过起点？",
    "How do we batch subtractions without losing the start?"
  ],
  "s2e": [
    "这一步要回答：重复减去同一个数，能压成什么操作？保持起点 (sx,sy) 不变，把当前倒推目标仍叫 (tx,ty)。若 tx>ty，且两者都高于起点，最后几步只能不断从 tx 减去 ty。例如从 (3,17) 撤回 y 的加法：17−3=14、11、8、5、2，共 5 次，得到 (3,2)。取余（模运算）就是 a=q·b+r 中的 r，0≤r<b；因此 17 % 3=2，一次跳过 5 次减法。",
    "The question: what replaces repeated subtraction of the same number? Keep start (sx,sy) fixed and call the current backward target (tx,ty). When tx>ty and both exceed the start, the last moves can only subtract ty from tx. For (3,17), undo y additions: 17−3=14, 11, 8, 5, 2; five subtractions reach (3,2). A remainder (modulo) is r in a=q·b+r, with 0≤r<b. Thus 17 % 3=2 batches those five subtractions."
  ],
  "invariant": [
    "不变量（每次更新后仍成立的判断）：在 tx>sx 且 ty>sy 时，起点可达旧目标，当且仅当可达取余后的目标。因为不变的另一坐标还高于自己的起点，批次中不可能提前撞到起点；每次减法的方向又是唯一的。若取余落到起点之下，沿途也不可能是起点。若余数为 0，便无合法正数来路。每次取余让较大坐标下降，所以循环终止。",
    "Invariant (a statement preserved by an update): while tx>sx and ty>sy, the start reaches the old target exactly when it reaches the remainder target. The unchanged coordinate is still above its starting value, so no intermediate point in the batch can be the start; each subtraction direction is forced. If the remainder falls below the start, no intermediate point could have been the start either. Remainder 0 leaves no positive route. Each update decreases the larger coordinate, so the loop terminates."
  ],
  "boundary": [
    "一旦一坐标到达起点，就先停止取余！若 tx=sx，想从 (sx,sy) 到 (sx,ty)，x 不能再增加，因此只可能反复给 y 加 sx：需要 ty≥sy 且 (ty−sy) % sx=0。ty=sy 时对称。比如 (3,2)→(3,8)，差 8−2=6=2·3，是真；若盲目算 8 % 3=2 恰好撞到起点只是巧合，(3,3)→(3,9) 盲算 9 % 3=0 就会错杀。若坐标落到起点以下，两坐标只增不减，直接判假。",
    "Stop taking remainders once a coordinate reaches its start! If tx=sx, reaching (sx,ty) from (sx,sy) cannot increase x. Only additions of sx into y remain: require ty≥sy and (ty−sy) % sx=0. The ty=sy case is symmetric. For (3,2)→(3,8), difference 8−2=6=2·3 proves true. Blindly doing 8 % 3=2 happens to hit the start, but for (3,3)→(3,9), blind 9 % 3=0 would reject a reachable target. If a coordinate falls below its start, forward moves cannot repair that, so return false."
  ],
  "formula": [
    "tx = sx：ty ≥ sy 且 (ty − sy) % sx = 0；ty = sy 时对称。",
    "tx = sx: ty ≥ sy and (ty − sy) % sx = 0; symmetric when ty = sy."
  ],
  "traceTask": [
    "选择场景会重置本倒推实验。先试 (1,1)→(3,17)，比较批次算式和保留的历史，再试两种边界场景，观察为什么最后不能继续盲目取余。",
    "Choosing a preset resets this backward experiment. Try (1,1)→(3,17), compare each batch equation with the retained history, then try both boundary presets to see why blind modulo must stop."
  ],
  "presetLabel": [
    "倒推输入（更换即重置）",
    "Backward input (change resets trace)"
  ],
  "preset0": [
    "(1,1) → (3,5)",
    "(1,1) → (3,5)"
  ],
  "preset1": [
    "(1,1) → (3,17)",
    "(1,1) → (3,17)"
  ],
  "preset2": [
    "(3,2) → (3,8)",
    "(3,2) → (3,8)"
  ],
  "preset3": [
    "(3,2) → (3,7)",
    "(3,2) → (3,7)"
  ],
  "preset4": [
    "(2,3) → (3,4)",
    "(2,3) → (3,4)"
  ],
  "preset5": [
    "(1,1) → (2,2)",
    "(1,1) → (2,2)"
  ],
  "preset6": [
    "(1,1) → (1,1)",
    "(1,1) → (1,1)"
  ],
  "preset7": [
    "(1,1) → (1,10⁹)",
    "(1,1) → (1,10⁹)"
  ],
  "preset8": [
    "(5,3) → (4,9)",
    "(5,3) → (4,9)"
  ],
  "sim": [
    "JavaScript 教学模拟，不是在浏览器执行 Python。每帧是一次完整取余之后，或一次不改坐标的最终检查之后；历史没有省略批次。最后的余数可能为 0，表示失败的算术状态，不是合法点。",
    "JavaScript teaching simulation, not execution of Python in the browser. Each frame follows one whole modulo update or a final check that leaves coordinates unchanged. No batches are omitted. A final remainder can be 0: a failed arithmetic state, not a legal point."
  ],
  "prev": [
    "退回上一帧",
    "Previous frame"
  ],
  "next": [
    "执行下一批次 / 检查",
    "Next batch / check"
  ],
  "end": [
    "跳到最终检查",
    "Go to final check"
  ],
  "frame": [
    "帧 {i}/{n}；固定起点 ({sx}, {sy})；当前倒推目标 ({x}, {y})。{status}",
    "Frame {i}/{n}; fixed start ({sx}, {sy}); current backward target ({x}, {y}). {status}"
  ],
  "pending": [
    "尚未给出最终判定。",
    "No final verdict yet."
  ],
  "true": [
    "最终结果：可达（true）。",
    "Final result: reachable (true)."
  ],
  "false": [
    "最终结果：不可达（false）。",
    "Final result: unreachable (false)."
  ],
  "start": [
    "还未执行取余；先比较当前目标与起点。",
    "No modulo performed yet; compare the current target with the start."
  ],
  "modRow": [
    "({bx}, {by}) → ({x}, {y})：{axis} 原值 {a} = {q} × {b} + {r}，因此 {a} % {b} = {r}。这一批撤回 {q} 次加法。",
    "({bx}, {by}) → ({x}, {y}): old {axis} value {a} = {q} × {b} + {r}, so {a} % {b} = {r}. This batch undoes {q} additions."
  ],
  "tailY": [
    "x 已等于 sx；只可增加 y。差值 {d}，步长 sx={b}；{d} % {b} = {r}。{status}",
    "x equals sx; only y may increase. Difference {d}, increment sx={b}; {d} % {b} = {r}. {status}"
  ],
  "tailX": [
    "y 已等于 sy；只可增加 x。差值 {d}，步长 sy={b}；{d} % {b} = {r}。{status}",
    "y equals sy; only x may increase. Difference {d}, increment sy={b}; {d} % {b} = {r}. {status}"
  ],
  "below": [
    "当前 ({x}, {y}) 已有坐标低于起点。正向坐标从不减小，所以不可达。",
    "Current ({x}, {y}) has a coordinate below its start. Forward coordinates never decrease, so it is unreachable."
  ],
  "history": [
    "已完成的批次与检查",
    "Completed batches and checks"
  ],
  "empty": [
    "尚无已完成操作。",
    "No operations completed yet."
  ],
  "s3t": [
    "新输入：能从 (2,3) 到 (17,5) 吗？",
    "New input: can (2,3) reach (17,5)?"
  ],
  "s3e": [
    "这一步要回答：你能把“不变的坐标仍高于起点”这一判断，用到没看过的输入吗？保持起点 (2,3) 不变，先判断 (17,5) 倒推后是否还需要边界检查。这里可达仍指存在合法加法序列。选择结论和理由都正确的一项，再揭晓。",
    "The question: can you use the condition that the unchanged coordinate is still above its start on a new input? Keep start (2,3) fixed. Think about whether reversing (17,5) still needs a boundary check. Reachable still means some legal addition sequence exists. Choose the option with both the right verdict and reason, then reveal."
  ],
  "predictionLegend": [
    "结论与理由是什么？",
    "Which verdict and reason are valid?"
  ],
  "option0": [
    "A · 不可达：17 % 5=2 小于 5，必须失败。",
    "A · Unreachable: 17 % 5=2 is below 5, so it must fail."
  ],
  "option1": [
    "B · 可达：两对数的最大公约数相同就足够。",
    "B · Reachable: matching greatest common divisors is sufficient."
  ],
  "option2": [
    "C · 可达：先得 (2,5)，再检查差值 5−3 能否被 2 整除。",
    "C · Reachable: first get (2,5), then check whether 5−3 is divisible by 2."
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal and explain"
  ],
  "await": [
    "先选择，再揭晓；更换选项会清除旧反馈。",
    "Choose before revealing; changing an option clears old feedback."
  ],
  "correct": [
    "结论与理由都正确。",
    "Both verdict and reason are correct."
  ],
  "incorrect": [
    "这一项的理由不成立；正确选项是 C。",
    "That reason does not hold; the correct option is C."
  ],
  "answer": [
    "17 % 5=2，把目标变成 (2,5)，没有低于起点 x=2。不再取余，因为 x 已等于 sx。差 5−3=2，可被 sx=2 整除，所以为真。见证路径：(2,3)→(2,5)→(7,5)→(12,5)→(17,5)。A 把另一个坐标 5 误当作起点下界；B 的公约数只能排除部分失败例，不能证明可达。",
    "17 % 5=2 reduces the target to (2,5), which is not below starting x=2. Stop modulo because x now equals sx. Difference 5−3=2 is divisible by sx=2, so the answer is true. Witness: (2,3)→(2,5)→(7,5)→(12,5)→(17,5). A mistakes the other coordinate 5 for a starting lower bound; B uses a necessary gcd condition as if it were sufficient."
  ],
  "s4t": [
    "把推导放回官方 Python 接口",
    "Put the derivation into the official Python interface"
  ],
  "s4e": [
    "这一步要回答：每个判断具体对应哪行代码？下面是符合官方 Python3 接口的可提交源码 Solution.reachingPoints(self, sx, sy, tx, ty) → bool。参数是四个整数；函数只重新绑定局部整数，没有需要修改的输入容器。上面的可逆画面是教学模拟，源码另用 Python 运行并与正向枚举基线核对。",
    "The question: which code implements each decision? Below is submittable source with the official Python3 interface Solution.reachingPoints(self, sx, sy, tx, ty) → bool. Inputs are four integers; it only rebinds local integers and has no input container to mutate. The reversible display is a teaching simulation; the source is separately run in Python and checked against forward enumeration."
  ],
  "map1": [
    "while tx > sx and ty > sy：只有两坐标都高于起点时才批量倒退。例如 (3,5) 的 5 % 3=2 对应 ty %= tx。",
    "while tx > sx and ty > sy: batch backward moves only while both exceed the start. For (3,5), 5 % 3=2 maps to ty %= tx."
  ],
  "map2": [
    "两个 if 返回式：固定已到达起点的坐标，另一坐标的非负差值必须是固定坐标的整倍数。差值 0 也成立，覆盖零步。",
    "The two if returns fix the coordinate that has reached its start. The other coordinate needs a nonnegative difference divisible by the fixed coordinate. Difference 0 also works, covering zero moves."
  ],
  "map3": [
    "return False：目标落到起点以下且不满足上述任一边界。所有输入均为正数，取余的除数不会为零；0 余数会让循环立刻停止。",
    "return False handles a target that falls below the start and meets neither boundary case. All inputs are positive, so a modulo divisor is never zero; a zero remainder stops the loop immediately."
  ],
  "cost": [
    "时间 O(1 + log M)，M=max(初始 tx, 初始 ty)；每次取余至少把较大坐标换成较小坐标以内的数，至多两轮让最大值至少减半（若两数很接近，一次相减便得到小于一半的余数）。最后整除检查是 O(1)。这是把固定范围整数算术视为常数时间的成本；没有逐次枚举被跳过的加法。额外空间 O(1)。教学画面另存 k 帧及每帧历史，共 O(k²) 个历史条目，不是提交算法的内存。",
    "Time O(1 + log M), M=max(initial tx, initial ty). Modulo replaces the larger coordinate by a value below the smaller; within at most two rounds the maximum at least halves (if the values are close, a single subtraction yields a remainder below half). The final divisibility test is O(1). This treats fixed-range integer arithmetic as constant time and never enumerates the skipped additions. Auxiliary space is O(1). The teaching display stores k frames with their histories, O(k²) history entries, separate from submission memory."
  ],
  "bounds": [
    "边界清单：原点不在输入范围内；目标更小必假；相同起终点为真；相等目标只有零步可成功；共享一个起点坐标时检查差值整除，不能只检查目标坐标整除。官方例 (1,1)→(3,5)、(2,2)、(1,1) 的结果分别为真、假、真。",
    "Boundaries: zero is outside the input domain; a smaller target is false; identical start and target is true; equal target coordinates can succeed only with zero moves; when one starting coordinate is shared, test the difference for divisibility, not just the target coordinate. Official targets (3,5), (2,2), (1,1) from (1,1) give true, false, true."
  ],
  "copy": [
    "复制 Python 源码",
    "Copy Python source"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "source": [
    "展开可提交 Python3 源码",
    "Open submittable Python3 source"
  ],
  "copied": [
    "源码已复制。",
    "Source copied."
  ],
  "fallback": [
    "剪贴板不可用；已选中完整源码，请手动复制。",
    "Clipboard unavailable; the full source is selected for manual copying."
  ],
  "manualCopy": [
    "完整源码（手动复制）",
    "Full source (copy manually)"
  ],
  "related1": [
    "回看：为何前驱方向唯一",
    "Revisit: why the predecessor is forced"
  ],
  "related2": [
    "回看：取余的不变量与边界",
    "Revisit: the modulo invariant and boundary"
  ],
  "scenario0": [
    "(1,1) → (3,5) · 手算原例",
    "(1,1) → (3,5) · hand example"
  ],
  "scenario1": [
    "(1,1) → (3,17) · 批量减法",
    "(1,1) → (3,17) · subtraction batches"
  ],
  "scenario2": [
    "(3,2) → (3,8) · 边界整除",
    "(3,2) → (3,8) · divisible boundary"
  ],
  "scenario3": [
    "(3,2) → (3,7) · 边界余数",
    "(3,2) → (3,7) · boundary remainder"
  ],
  "scenario4": [
    "(2,3) → (3,4) · 公约数陷阱",
    "(2,3) → (3,4) · gcd trap"
  ],
  "scenario5": [
    "(1,1) → (2,2) · 相等目标",
    "(1,1) → (2,2) · equal target"
  ],
  "scenario6": [
    "(1,1) → (1,1) · 零步",
    "(1,1) → (1,1) · zero moves"
  ],
  "scenario7": [
    "(1,1) → (1,10⁹) · 大边界",
    "(1,1) → (1,10⁹) · large boundary"
  ],
  "scenario8": [
    "(5,3) → (4,9) · 目标更小",
    "(5,3) → (4,9) · smaller target"
  ]
};
