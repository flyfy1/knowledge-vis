const STR = {
  zh: {
    docTitle: '递归与分治 · 把大问题劈成小问题', back: '← 知识索引', pageTitle: '递归与分治 · 把大问题劈成小问题',
    tagline: '从函数调用自己，到汉诺塔、递归树和归并排序：为什么有的递归瞬间完成，有的一辈子也算不完。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 调用自己', nav1: '1 汉诺塔', nav2: '2 递归树', nav3: '3 增长速度', nav4: '4 分而治之', nav5: '5 终章',
    s0play: '▶ 自动播放', s0pause: '⏸ 暂停', peg0: 'A', peg1: 'B', peg2: 'C',
    s0k: '第 0 步 · 函数调用自己', s0t: '一个函数调用自己时，发生了什么？',
    s0e: '这一步要回答：递归是怎么「算出来」的？以阶乘 n! = n × (n−1)! 为例（规定 1! = 1，叫<strong>基例</strong>：不用再往下问就能直接回答）。每调用一次 fact(k)，就多一层<strong>调用栈</strong>（图中向下叠的方块，表示「还在等下一层的结果」）；走到基例后才开始自底向上<strong>返回</strong>，把结果一层层乘回来。拖动「执行到第几步」或按「自动播放」：前 n 步方块一层层叠高，后 n 步由内向外变绿并写出值。改 n：栈有多深？',
    s0nL: 'n（求 n!）', s0kL: '执行到第几步', s0reset: '重置', cv0: '阶乘的调用栈',
    s0Cap: '计算 fact({n})：调用栈', s0Base: '← 基例', s0Wait: '← 等下一层', s0Dir: '虚线框 = 还没被调用的层；绿 = 已返回结果', s0Start: '还没有调用。', s0Call: 'fact({a}) 还不知道答案，转去调用 fact({b})。', s0BaseHit: 'fact(1) 是基例，直接得到 1。', s0Ret: 'fact({a}) 收到下一层的结果，算出 {v}。', s0Done: '最终 fact({n}) = {v}。',
    s0ro: 'n = <b>{n}</b>，第 {s} / {tot} 步，栈深 {depth}。{msg}{res}',
    s0term: '调用栈 = 记录「已经开始、还在等结果」的调用的一摞；基例 = 不再递归、直接给出答案的最小情形。没有基例的递归不会停。',
    s1k: '第 1 步 · 汉诺塔', s1t: '怎样把一座塔搬过去？',
    s1e: '这一步要回答：规则是每次只能搬一个盘子、大盘不能压在小盘上，怎样把 n 个盘子从柱 A 搬到柱 C？递归的想法：先把上面的 n−1 个盘子搬到柱 B（借助 C），再把最大的盘子搬到 C，最后把那 n−1 个盘子从 B 搬到 C（借助 A）。搬 n−1 个盘子本身又是同样的问题，所以只要会搬 n−1 个，就会搬 n 个。拖动「第几步」或按「自动播放」：看盘子怎样一步步移动，图下方说明当前处在这三个阶段中的哪一个。步数 T(n) = 2·T(n−1) + 1 = 2ⁿ − 1。',
    s1nL: '盘子数 n', s1kL: '第几步', s1reset: '重置', cv1: '三根柱子与盘子的当前位置',
    s1Cap: '{n} 个盘子，从 A 搬到 C', s1Phase: '最外层的三个阶段：', ph0: '还没开始：目标是把 {n} 个盘子从 A 搬到 C。', ph1: '阶段 1：把上面的 {m} 个盘子搬到柱 B（先腾地方）。', ph2: '阶段 2：把最大的盘子搬到柱 C。', ph3: '阶段 3：把那 {m} 个盘子从柱 B 搬到柱 C。',
    s1Move: '把盘 {d} 从柱 {a} 搬到柱 {b}', s1NoMove: '还没有搬动',
    s1ro: '{n} 个盘子，共需 <b>{tot}</b> 步；现在第 {k} 步：{mv}。递推：{rec}。',
    s1term: 'T(n) = 搬 n 个盘子需要的步数；每多一个盘子，步数翻倍再加 1。这里每步都按递归解法走，它已知是最少的步数（本页不证明）。',
    s2k: '第 2 步 · 递归树', s2t: '三种递归，树长得一样吗？',
    s2e: '这一步要回答：为什么有的递归飞快，有的慢得吓人？把每次调用画成一个方块、它调用的子问题画在下一层，就得到<strong>递归树</strong>。三种典型：汉诺塔（规模减 1，分成 2 个子问题，每个调用做 1 步）；二分查找（规模减半，只进入 1 个子问题，每次比较 1 次）；归并排序（规模减半，分成 2 个子问题，每个调用合并 size 个元素）。选一种、拖动规模：看每层的方块个数怎样变（上图），每层的工作量怎样变（下图的横条）。总工作量 = 各层之和。',
    s2mL: '规模参数 m（汉诺塔 n = m；其余 n = 2^m）', s2reset: '重置', cv2: '递归树与每层工作量',
    k_hanoi: '汉诺塔', k_binary: '二分查找', k_merge: '归并排序',
    s2Cap_hanoi: '汉诺塔 n={m}：每层规模减 1、方块翻倍', s2Cap_binary: '二分查找 n={n}：每层规模减半、只有 1 块', s2Cap_merge: '归并排序 n={n}：规模减半、方块翻倍',
    s2Lv: '第 {d} 层：{n} 个，工作量 {c}', s2Cost: '每层的工作量（横条越长越多）',
    s2ro: '{kind}：{lv} 层，共 {nodes} 个调用，总工作量 <b>{total}</b>（公式 {formula}）。',
    s2term: '「工作量」按各自的基本操作计：汉诺塔每次调用搬 1 个盘；二分查找每层比较 1 次；归并排序每个调用合并 size 个元素（叶子不计）。三者口径不同，只比较增长的形态。',
    s3k: '第 3 步 · 增长速度', s3t: '规模变大，代价差多少？',
    s3e: '这一步要回答：同样是递归，规模变大时代价差多少？图是总工作量随 n 的变化（纵轴是对数：每上一格是 10 倍）：汉诺塔 2ⁿ−1（红）、归并排序 n·log₂n（绿）、线性 n（灰）、二分查找 log₂n + 1（青）。拖动 n：红线冲向天际，青线几乎躺平。读数里按「每秒 10⁹ 步」换算成时间，只为帮你感受量级。汉诺塔 n = 64 要多久？拖到 64 看看。',
    s3nL: '规模 n', s3reset: '重置', cv3: '四种增长曲线（对数纵轴）',
    s3Cap: '总工作量（对数轴）', s3Ax: 'n：1 → 64', g_hanoi: '红 = 汉诺塔 2ⁿ−1', g_merge: '绿 = 归并排序 n·log₂n', g_linear: '灰 = 线性 n', g_binary: '青 = 二分查找 log₂n+1',
    u_y: '年', u_d: '天', u_h: '小时', u_min: '分钟', u_s: '秒', u_ms: '毫秒', u_us: '微秒', u_ns: '纳秒',
    s3ro: 'n = <b>{n}</b>：汉诺塔 {h} 步 ≈ {ht}；归并排序 {m} 步 ≈ {hm}；二分查找 {b} 步。',
    s3term: '指数增长（汉诺塔）与对数、近线性增长的差别是量级的差别，不是常数倍；「每秒 10⁹ 步」只是假设，不是某台机器的实测。',
    s4k: '第 4 步 · 分而治之', s4t: '把大问题劈开，再合起来',
    s4e: '这一步要回答：归并排序的递归树在代码里是按什么顺序执行的？它的思路是<strong>分而治之</strong>：把数组劈成左右两半，各自排好，再把两个有序的半边<strong>合并</strong>成一个有序的整体（合并只需从两边的头部各取较小的那个，不用重新排序）。拖动「执行到第几步」或按「自动播放」：橙框 = 正在劈开的区间，绿框 = 刚合并好的区间，下方是此刻的递归栈（每条 = 一层调用，长度 = 区间大小）。读数里的比较次数不超过 n·log₂n。「换一组数」会换 8 个新的数并回到第 0 步。',
    s4kL: '执行到第几步', s4new: '换一组数（回到第 0 步）', s4reset: '重置为初始数组', cv4: '归并排序的执行过程与递归栈',
    s4Cap: '归并排序 8 个数（橙 = 劈开，绿 = 合并）', s4Stack: '此刻的递归栈（每条 = 一层）', s4Split: '劈开区间 [{a}, {b})', s4Merge: '合并区间 [{a}, {b})（这一步比较 {c} 次）', s4Init: '还没开始。',
    s4ro: '第 <b>{k} / {tot}</b> 步：{what}；递归栈深 {depth}；累计比较 <b>{cmp}</b> 次（上界 n·log₂n = {bound}）。原数组 {orig}；排好后 {fin}。',
    s4term: '区间 [a, b) 表示从位置 a 到 b−1。合并时每放入一个元素最多比较一次，所以一层合并最多 n 次比较，共 log₂n 层。',
    s5k: '第 5 步 · 终章', s5t: '收束：递归树的形状决定代价',
    s5e: '递归 = 基例 + 把问题化成更小的同类问题；调用画成树之后，每层有多少个调用、每个做多少事，就决定了总代价。',
    c1t: '基例与调用栈', c1b: '递归一层层深入，直到基例，再自底向上返回（第 0 步）。',
    c2t: '汉诺塔', c2b: 'T(n) = 2T(n−1) + 1 = 2ⁿ − 1，每个盘子让步数翻倍（第 1 步）。',
    c3t: '树形决定代价', c3b: '缩 1 分 2 → 指数；减半进 1 → 对数；减半分 2 且每层做 n → n·log n（第 2、3 步）。',
    c4t: '分而治之', c4b: '劈开、各自解决、合并；合并比重新排序便宜（第 4 步）。',
    modelT: '模型与局限',
    modelB: '汉诺塔的步数和归并排序的比较次数都是页面里真实执行的精确计数；增长速度的时间换算基于假设的每秒 10⁹ 步。二分查找与汉诺塔都是递归，但递归树的形状不同、代价量级也不同，并不「等价」。本页没有讨论栈溢出、尾递归优化，也没有给出主定理的一般形式。',
    linksT: '想从别处继续',
    link1: '二分查找 · 每次砍半：递归树只有一条链的那一种', link2: '排序 · 分而治之：归并排序与其他排序的竞赛', link3: '指数与对数 · 翻倍的世界：2ⁿ 的增长有多可怕',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Recursion and Divide-and-Conquer · Splitting a Big Problem Into Small Ones', back: '← Knowledge Index', pageTitle: 'Recursion and Divide-and-Conquer · Splitting a Big Problem Into Small Ones',
    tagline: 'From a function calling itself to Towers of Hanoi, recursion trees and merge sort: why some recursions finish instantly and others could not finish in a lifetime.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Calling itself', nav1: '1 Towers of Hanoi', nav2: '2 Recursion tree', nav3: '3 Growth rates', nav4: '4 Divide & conquer', nav5: '5 Finale',
    s0play: '▶ Auto play', s0pause: '⏸ Pause', peg0: 'A', peg1: 'B', peg2: 'C',
    s0k: 'Step 0 · A function calls itself', s0t: 'What happens when a function calls itself?',
    s0e: 'This step answers: how does a recursion actually get its answer? Take the factorial n! = n × (n−1)! (with 1! = 1, called the <strong>base case</strong>: it can be answered without asking further). Each call of fact(k) adds a layer to the <strong>call stack</strong> (the blocks stacked downward in the picture, meaning “still waiting for the next layer’s result”); only after reaching the base case do the layers <strong>return</strong> from the bottom up, multiplying the results back together. Drag “step reached” or press “Auto play”: in the first n steps the blocks pile up, in the last n steps they turn green from the inside out and show their values. Change n: how deep does the stack get?',
    s0nL: 'n (computing n!)', s0kL: 'Step reached', s0reset: 'Reset', cv0: 'The call stack of the factorial',
    s0Cap: 'Computing fact({n}): the call stack', s0Base: '← base case', s0Wait: '← waits for next layer', s0Dir: 'dashed frame = layer not called yet; green = result returned', s0Start: 'No call has been made yet.', s0Call: 'fact({a}) does not know the answer yet and calls fact({b}).', s0BaseHit: 'fact(1) is the base case and returns 1 directly.', s0Ret: 'fact({a}) receives the next layer’s result and computes {v}.', s0Done: 'Final result: fact({n}) = {v}.',
    s0ro: 'n = <b>{n}</b>, step {s} / {tot}, stack depth {depth}. {msg}{res}',
    s0term: 'Call stack = a pile of calls that have started and are still waiting for a result; base case = the smallest case that is answered directly without recursing. A recursion without a base case never stops.',
    s1k: 'Step 1 · Towers of Hanoi', s1t: 'How do you move a whole tower?',
    s1e: 'This step answers: with the rules that only one disk moves at a time and a larger disk may never sit on a smaller one, how do we move n disks from peg A to peg C? The recursive idea: first move the top n−1 disks to peg B (using C), then move the largest disk to C, and finally move those n−1 disks from B to C (using A). Moving n−1 disks is the same problem again, so knowing how to move n−1 means knowing how to move n. Drag “move number” or press “Auto play”: watch the disks move one step at a time, and the text under the picture says which of the three phases we are in. The number of moves is T(n) = 2·T(n−1) + 1 = 2ⁿ − 1.',
    s1nL: 'Number of disks n', s1kL: 'Move number', s1reset: 'Reset', cv1: 'Three pegs and the current positions of the disks',
    s1Cap: '{n} disks, moving from A to C', s1Phase: 'The three phases of the outermost level:', ph0: 'Not started: the goal is to move {n} disks from A to C.', ph1: 'Phase 1: move the top {m} disk(s) to peg B (make room first).', ph2: 'Phase 2: move the largest disk to peg C.', ph3: 'Phase 3: move those {m} disk(s) from peg B onto peg C.',
    s1Move: 'move disk {d} from peg {a} to peg {b}', s1NoMove: 'nothing moved yet',
    s1ro: '{n} disks need <b>{tot}</b> moves; now at move {k}: {mv}. Recurrence: {rec}.',
    s1term: 'T(n) = the number of moves for n disks; each extra disk doubles the count and adds 1. Every move here follows the recursive solution, which is known to use the fewest possible moves (not proved on this page).',
    s2k: 'Step 2 · The recursion tree', s2t: 'Do three recursions grow the same tree?',
    s2e: 'This step answers: why are some recursions lightning fast and others terrifyingly slow? Draw every call as a block with the subproblems it calls on the next level, and you get the <strong>recursion tree</strong>. Three typical cases: Towers of Hanoi (size drops by 1, splits into 2 subproblems, each call does 1 move); binary search (size halves, enters only 1 subproblem, 1 comparison per call); merge sort (size halves, splits into 2 subproblems, each call merges size elements). Pick one and drag the size: see how the number of blocks per level changes (upper picture) and how the work per level changes (horizontal bars below). Total work = the sum over the levels.',
    s2mL: 'Size parameter m (Hanoi n = m; the others n = 2^m)', s2reset: 'Reset', cv2: 'The recursion tree and the work per level',
    k_hanoi: 'Towers of Hanoi', k_binary: 'Binary search', k_merge: 'Merge sort',
    s2Cap_hanoi: 'Hanoi n={m}: size −1 per level, blocks ×2', s2Cap_binary: 'Binary search n={n}: size halves, 1 block per level', s2Cap_merge: 'Merge sort n={n}: size halves, blocks ×2',
    s2Lv: 'level {d}: {n} block(s), work {c}', s2Cost: 'Work per level (longer bar = more)',
    s2ro: '{kind}: {lv} levels, {nodes} calls in all, total work <b>{total}</b> (formula {formula}).',
    s2term: '“Work” counts each one’s basic operation: Hanoi one disk move per call; binary search one comparison per level; merge sort size elements merged per call (leaves free). The three units differ, so only the shapes of growth are compared.',
    s3k: 'Step 3 · Growth rates', s3t: 'As the size grows, how different is the cost?',
    s3e: 'This step answers: all of them are recursions, so how different is the cost as the size grows? The chart shows total work against n (logarithmic vertical axis: each gridline up is 10 times more): Hanoi 2ⁿ−1 (red), merge sort n·log₂n (green), linear n (grey), binary search log₂n + 1 (cyan). Drag n: the red line shoots to the sky while the cyan line nearly lies flat. The readout converts steps to time at “10⁹ steps per second”, only to give a feel for magnitude. How long does Hanoi with n = 64 take? Drag to 64 and see.',
    s3nL: 'Size n', s3reset: 'Reset', cv3: 'Four growth curves (logarithmic vertical axis)',
    s3Cap: 'Total work (log axis)', s3Ax: 'n: 1 → 64', g_hanoi: 'red = Hanoi 2ⁿ−1', g_merge: 'green = merge sort n·log₂n', g_linear: 'grey = linear n', g_binary: 'cyan = binary search log₂n+1',
    u_y: 'years', u_d: 'days', u_h: 'hours', u_min: 'minutes', u_s: 's', u_ms: 'ms', u_us: 'µs', u_ns: 'ns',
    s3ro: 'n = <b>{n}</b>: Hanoi {h} moves ≈ {ht}; merge sort {m} steps ≈ {hm}; binary search {b} steps.',
    s3term: 'The gap between exponential growth (Hanoi) and logarithmic or near-linear growth is a difference of orders of magnitude, not a constant factor; “10⁹ steps per second” is only an assumption, not a measurement of any machine.',
    s4k: 'Step 4 · Divide and conquer', s4t: 'Split the big problem, then put it back together',
    s4e: 'This step answers: in what order does the merge-sort recursion tree actually run in code? The idea is <strong>divide and conquer</strong>: split the array into a left and right half, sort each, then <strong>merge</strong> the two sorted halves into one sorted whole (merging only needs to take the smaller of the two front elements each time, with no re-sorting). Drag “step reached” or press “Auto play”: the orange frame is the range being split, the green frame the range just merged, and below is the recursion stack at that moment (each bar = one level of calls, its length = the range size). The comparison count in the readout never exceeds n·log₂n. “New numbers” swaps in 8 new numbers and goes back to step 0.',
    s4kL: 'Step reached', s4new: 'New numbers (back to step 0)', s4reset: 'Reset to the initial array', cv4: 'How merge sort runs, with its recursion stack',
    s4Cap: 'Merge sort, 8 numbers (orange split, green merge)', s4Stack: 'Recursion stack now (bar = one level)', s4Split: 'split range [{a}, {b})', s4Merge: 'merge range [{a}, {b}) ({c} comparison(s) in this step)', s4Init: 'not started yet',
    s4ro: 'Step <b>{k} / {tot}</b>: {what}; recursion depth {depth}; comparisons so far <b>{cmp}</b> (bound n·log₂n = {bound}). Original {orig}; sorted {fin}.',
    s4term: 'The range [a, b) means positions a to b−1. Merging makes at most one comparison per element placed, so one level of merging costs at most n comparisons over log₂n levels.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: the shape of the recursion tree sets the cost',
    s5e: 'Recursion = a base case + reducing the problem to smaller copies of itself; once the calls are drawn as a tree, how many calls each level has and how much each does decide the total cost.',
    c1t: 'Base case and call stack', c1b: 'Recursion goes deeper layer by layer to the base case, then returns from the bottom up (step 0).',
    c2t: 'Towers of Hanoi', c2b: 'T(n) = 2T(n−1) + 1 = 2ⁿ − 1; each extra disk doubles the moves (step 1).',
    c3t: 'Tree shape sets cost', c3b: 'Shrink by 1 and split in 2 → exponential; halve and enter 1 → logarithmic; halve, split in 2 and do n per level → n·log n (steps 2 and 3).',
    c4t: 'Divide and conquer', c4b: 'Split, solve each part, merge; merging is cheaper than sorting from scratch (step 4).',
    modelT: 'Model and limits',
    modelB: 'The Hanoi move count and the merge-sort comparison count are exact counts from the code actually running on this page; the time conversions for growth rates assume 10⁹ steps per second. Binary search and Towers of Hanoi are both recursions, but their recursion trees have different shapes and their costs different orders of magnitude, so they are not “equivalent”. This page does not discuss stack overflow or tail-call optimisation, and gives no general form of the master theorem.',
    linksT: 'Continue elsewhere',
    link1: 'Binary search · halving: the recursion whose tree is a single chain', link2: 'Sorting · divide and conquer: merge sort in a race against other sorts', link3: 'Exponents and logarithms · a doubling world: how fearsome 2ⁿ growth is',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result'
  }
};
let currentLang = 'en';
function t(key, vars = {}) { let out = (STR[currentLang] && STR[currentLang][key]) || key; return out.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''); }
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (_) {}
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { b.classList.toggle('active', b.dataset.lang === currentLang); b.setAttribute('aria-pressed', b.dataset.lang === currentLang ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (_) {}
  setLang(saved === 'zh' || saved === 'en' ? saved : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
