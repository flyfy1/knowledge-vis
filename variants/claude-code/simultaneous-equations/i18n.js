'use strict';
// Simultaneous equations lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '二元一次方程组 · 两张收据定出一个价格',
    back: '← 知识索引',
    compare: '对照另一版本：二元一次方程组 · 两条直线的交点 →',
    navLabel: '方程组步骤导航',
    tagline: '一张收据写着「1 个苹果加 2 个梨共 10 元」，单凭它算不出苹果多少钱；再来一张「3 个苹果加 1 个梨共 15 元」，答案就只剩一个。七步里你会看到：一个方程画出来是一条直线，两个方程的共同解是两条直线的交点；代入法和加减法是把交点算出来的两种办法；以及什么时候交点不存在，什么时候到处都是。',
    nav0: '0 一张收据', nav1: '1 两张收据', nav2: '2 代入法', nav3: '3 加减法', nav4: '4 无解与无穷解', nav5: '5 算回价格', nav6: '6 收束',
    lgA: '方程 A：x + 2y = 10',
    clearPts: '清除记录',

    s0k: '第 0 步 · 一个方程',
    s0t: '只有一张收据，苹果和梨各多少钱？',
    s0e: '这一步要回答：只知道「1 个苹果 + 2 个梨 = 10 元」，能定出两种水果的单价吗？设苹果每个 x 元、梨每个 y 元，收据就是方程 <strong>x + 2y = 10</strong>，记作方程 A。它含两个未知数，未知数都只是一次（没有 x²、xy 这样的项），所以叫<strong>二元一次方程</strong>。能让等号两边相等的一对数 (x, y) 叫它的一个<strong>解</strong>。在坐标平面上（横轴是 x，纵轴是 y），每个解就是一个点（<a class="xlink" href="../../../math/algebra/coordinate-plane/#step2">→ 坐标平面页第 2 步：一对数怎样对应一个点</a>）。拖动 x，页面按 y = (10 − x) ÷ 2 算出配套的 y，并把这个解点留在图上。',
    s0x: '苹果单价 x（元）',
    s0lgPts: '已找到的解点',
    sweep0: '从 0 扫到 10',
    s0readout: 'x = {x} 时 y = {y}。检验：{x} + 2 × {y} = {lhs}，等于 10，所以 ({x}, {y}) 是一个解。图上已留下 {n} 个解点。',
    s0hint: '观察顺序：把 x 从 0 慢慢拖到 10（或按扫描按钮），看留下的点排成什么形状；点足够多、铺开足够宽之后，图上会画出它们所在的整条直线 A。滑杆每次走 0.5，所以最多留下 21 个点；但 x 取它们之间的任何数（比如 3.14）也有配套的 y，所以解有无穷多个，连起来是一整条直线。单凭这张收据，没法从这条线上挑出「真正的价格」。',

    s1k: '第 1 步 · 再来一张收据',
    s1t: '同时满足两张收据的点在哪里？',
    s1e: '这一步要回答：再加上第二张收据「3 个苹果 + 1 个梨 = 15 元」，也就是方程 B：<strong>3x + y = 15</strong>，哪个点能同时满足两个方程？把几个方程放在一起、要求同一对 (x, y) 全部满足，叫<strong>方程组</strong>；同时满足它们的 (x, y) 叫方程组的解。为了看出一个点离满足某个方程还差多少，定义<strong>偏差</strong> = 左边 − 右边：偏差是 0，说明这个点在那条直线上；偏差为正，说明按这对价格算出的总价比收据多。拖动点的 x 和 y，读数给出两个偏差；试过的点都会留在图上，按它满足了几个方程着色。上方的按钮可以换一组方程（第 1–3 步共用）。',
    ptX: '点的 x', ptY: '点的 y',
    s1lgBoth: '两个都满足', s1lgA: '只满足 A', s1lgB: '只满足 B', s1lgNone: '都不满足',
    s1readout: '点 ({x}, {y})：偏差 A = {ea}，偏差 B = {eb}。{verdict}',
    s1both: '两个偏差都是 0：这一点就是方程组的解。',
    s1onlyA: '只满足方程 A，还不满足 B。',
    s1onlyB: '只满足方程 B，还不满足 A。',
    s1none: '两个方程都不满足。',
    s1hint: '观察顺序：先只拖 y，把点放到青色直线 A 上（偏差 A 变成 0）；然后让点沿着 A 走（默认这组：x 每增加 1，y 就要减少 0.5），看偏差 B 怎样一步步变小，直到它也变成 0。两个偏差同时为 0 的点只有一个，就是两条直线的交点。换一组方程再找一次。',

    s2k: '第 2 步 · 代入法',
    s2t: '不靠试，怎样把交点算出来？',
    s2e: '这一步要回答：能不能直接算出交点，而不是拖着点去找？<strong>代入法</strong>的思路：先从方程 A 把 x 写成含 y 的式子（默认这组是 x = 10 − 2y）。这样 x 和 y 就被绑在直线 A 上，只剩 y 一个未知数。再把这个式子<strong>代入</strong>方程 B（用它替换 B 里的 x），B 就变成只含 y 的一元一次方程，可以照天平的办法解（<a class="xlink" href="../../../math/algebra/equation-scale/#step4">→ 天平页第 4 步：两步方程怎么解</a>）。上图的白点只能沿直线 A 走；下图的横轴是这个白点的 y，纵轴是它在方程 B 上的偏差（左边 − 右边）。',
    s2y: '白点的 y（x 由方程 A 决定）',
    s2lgPt: '直线 A 上的点',
    missB: '偏差 B',
    c2a: '白点只能沿直线 A 走', c2b: '下图：横轴是白点的 y，纵轴是它的偏差 B',
    s2lgRes: '下图：这个点的偏差 B',
    next2: '下一行', reset2: '重来',
    s2prog: '推导第 {c}/{N} 行 · ',
    s2done: '推导完成 · ',
    s2readout: '{prog}白点 ({x}, {y}) 在直线 A 上，它的偏差 B = {r}。',
    d1: '由方程 A，把 x 用 y 表示', d2: '代入方程 B（用上一行替换 x）', d3: '去括号', d4: '合并含 y 的项', d5: '把常数移到右边', d6: '两边同除以 y 的系数', d7: '回代：把 y 代回第一行求 x', d8: '用方程 B 检验',
    s2hint: '观察顺序：先拖 y，白点沿直线 A 滑动，下图记下每个 y 的偏差 B，这些点也排成一条直线，它穿过 0 线的位置就是答案的 y。再按「下一行」逐行看推导；图会跟着走：「合并」那行的 y 系数就是下图直线的斜率，「同除」那行得到的 y 就是下图穿过 0 线的位置，白点会停在交点上。',

    s3k: '第 3 步 · 加减法',
    s3t: '两个方程相减，为什么能让一个未知数消失？',
    s3e: '这一步要回答：不代入，能不能把两个方程直接加减，让一个未知数消失？如果某个 (x, y) 同时满足 A 和 B，那么把 A 两边都乘同一个数 m，再从 B 里减掉，等式仍然成立。所以 <strong>B − m·A</strong> 也是一个关于 x、y 的方程，原来的解一定满足它，它的直线一定经过交点。拖 m，绿色直线就绕着交点转。当 m 恰好让 y 的系数变成 0，新方程里只剩 x，直线变成一条竖线，交点的 x 可以直接读出；让 x 的系数变成 0，就变成横线。这就是<strong>加减消元法</strong>（m 为负数时，相当于把两个方程相加）。',
    s3m: '乘数 m（计算 B − m·A）',
    s3lgC: 'B − m·A', s3lgTried: '试过的 m',
    elimY: '转到消去 y 的 m', elimX: '转到消去 x 的 m', clearLines: '清除记录',
    s3readout: 'm = {m}：B − m·A 得到 {eq}。{note}',
    s3elimY: 'y 消掉了，直接得到 x = {x}。',
    s3elimX: 'x 消掉了，直接得到 y = {y}。',
    s3keep: '两个未知数都还在，但这条线仍经过交点 ({x}, {y})。',
    s3hint: '观察顺序：方程组不变，只拖 m，看绿线怎样总穿过同一个白点；淡绿色是试过的线。再按两个按钮，m 会转到让某个系数为 0 的值，绿线变成竖线或横线。换一组方程，找出这组的两个特殊 m（它们等于 B 和 A 中同一个未知数系数的比）。',

    s4k: '第 4 步 · 一定只有一个解吗',
    s4t: '两条直线不相交，或者干脆重合，会怎样？',
    s4e: '这一步要回答：方程组是不是总有恰好一组解？固定方程 A：x + 2y = 10，第二个方程改成 B：kx + 2y = c，拖 k 和 c。直线的倾斜程度只由 x、y 两个系数的比决定。用 <strong>D = A 的 x 系数 × B 的 y 系数 − B 的 x 系数 × A 的 y 系数</strong> 来判断（这里 D = 1 × 2 − k × 2）：D ≠ 0 时两线倾斜程度不同，必定相交于一点，恰有一组解；D = 0 时两线一样斜，要么平行（没有公共点，无解），要么重合（是同一条直线，有无穷多组解）。',
    s4k_: 'B 中 x 的系数 k', s4c_: 'B 的右边 c',
    s4lgX: '交点', s4lgTrail: '试过的交点',
    s4one: 'D = {D} ≠ 0：两线相交于 ({x}, {y})，恰有一组解。{off}',
    s4off: '交点已在图外。',
    s4none: 'D = 0 且 c ≠ 10：两条直线平行，没有公共点，方程组无解。',
    s4many: 'D = 0 且 c = 10：B 和 A 是同一个方程，两条直线重合，线上每一点都是解，有无穷多组解。',
    s4hint: '观察顺序：先保持 c = 15，把 k 从 3 慢慢拖向 1，看淡色记录的交点沿直线 A 越跑越远（跑出图外后读数仍给出坐标）；k = 1 时 D = 0，两线平行，交点消失。再保持 k = 1，把 c 拖到 10，两条线重合。',
    quizPrompt: '想一想：x + y = 3 和 2x + 2y = 7 组成的方程组有几组解？',
    quizA: '恰好一组', quizB: '没有解', quizC: '无穷多组',
    check: '核对',
    correct: '对。D = 1 × 2 − 2 × 1 = 0，两条线一样斜。把第一个方程两边乘 2，得到 2x + 2y = 6，和 2x + 2y = 7 矛盾，所以两线平行，没有解。',
    wrong: '再想想：先算 D = 1 × 2 − 2 × 1。D = 0 时，再把第一个方程两边乘 2，和第二个方程比一比右边。',

    s5k: '第 5 步 · 用起来',
    s5t: '只给两张收据，能把真实价格算回来吗？',
    s5e: '这一步要回答：方程组能不能从结果倒推出原因？先由你定好真实单价：苹果 p 元、梨 q 元。页面按它们开出两张收据。然后假装忘掉 p、q，只凭收据上的数量和总价解方程组，看算回来的 x、y 是否就是你设的 p、q。第二张收据可以换成「2 个苹果 + 4 个梨」，它的每样数量都正好是第一张的 2 倍。',
    s5p: '真实的苹果单价 p（元）', s5q: '真实的梨单价 q（元）',
    s5lg1: '收据 1 的直线', s5lg2: '收据 2 的直线', s5lgSol: '解出的 (x, y)',
    rc: '收据 {i}：{a} 个苹果 + {b} 个梨 = {c} 元',
    copyOn: '换回「3 个苹果 + 1 个梨」', copyOff: '把收据 2 换成「2 个苹果 + 4 个梨」',
    s5one: '方程组：{e1}，{e2}。D = {D}，解得 x = {x}、y = {y}，和设定的 p = {p}、q = {q} {match}。',
    s5match: '一致', s5mismatch: '不一致',
    s5many: '方程组：{e1}，{e2}。D = 0：第二个方程正好是第一个的 2 倍，两条直线重合，满足两张收据的 (x, y) 有无穷多组，算不回 p = {p}、q = {q}。',
    s5hint: '观察顺序：先拖 p、q，看两张收据的总价跟着变，两条直线的交点始终落在 (p, q)，解出的价格和设定一致。再换收据 2：新收据只是把第一张的数量翻倍，没有带来新信息，两条直线重合，价格算不回来。要定出两个未知数，需要两条「不成倍数」的信息。',

    s6k: '第 6 步 · 收束',
    s6t: '一个方程是一条线，两个方程定一个点',
    s6fin: '一个二元一次方程有无穷多组解，画出来是一条直线；两个方程组成方程组，共同的解就是两条直线的交点。<strong>代入法</strong>让点只沿一条直线走，把问题变成一个未知数；<strong>加减法</strong>把两个方程组合成一条仍穿过交点的竖线或横线。两种方法算出的是同一个点，D 决定这个点是否存在且唯一。',
    formula: 'a₁x + b₁y = c₁，a₂x + b₂y = c₂\nD = a₁b₂ − a₂b₁ ≠ 0  ⇒  x = (c₁b₂ − c₂b₁) ÷ D，y = (a₁c₂ − a₂c₁) ÷ D',
    boundary: '适用范围：本页只讨论两个未知数、两个一次方程。D = 0 时要么无解、要么无穷多解，不能用上面的公式。三个及以上的未知数道理相同（每个方程是空间里的一个平面），通常用矩阵来系统地消元。',
    linksTitle: '接着看',
    lk1: '→ 一次函数页第 3 步：两条线相遇，交点是共同的解',
    lk2: '→ 天平页第 4 步：代入之后剩下的那个两步方程',
    lk3: '→ 线性变换页第 3 步：可逆还是坍缩，D = 0 在矩阵里意味着什么',
    lk4: '→ 鸡兔同笼页第 1 步：「假设全是鸡」其实就是在消元',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《二元一次方程组 · 两条直线的交点》的平行版本。'
  },
  en: {
    pageTitle: 'Simultaneous Equations · Two Receipts Pin Down a Price',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Simultaneous Equations · Where Two Lines Meet →',
    navLabel: 'Simultaneous equations steps',
    tagline: 'A receipt says “1 apple and 2 pears cost 10”. On its own it can’t tell you the price of an apple. Add a second one, “3 apples and 1 pear cost 15”, and only one answer is left. In seven steps you will see that one equation draws a line, that the shared solution of two equations is where their lines cross, how substitution and elimination calculate that point, and when the point doesn’t exist or is everywhere.',
    nav0: '0 One receipt', nav1: '1 Two receipts', nav2: '2 Substitution', nav3: '3 Elimination', nav4: '4 None or infinitely many', nav5: '5 Recover prices', nav6: '6 Wrap-up',
    lgA: 'Equation A: x + 2y = 10',
    clearPts: 'Clear trail',

    s0k: 'Step 0 · One equation',
    s0t: 'With one receipt, what do an apple and a pear cost?',
    s0e: 'This step asks: knowing only that 1 apple + 2 pears = 10, can you work out both prices? Let an apple cost x and a pear cost y. The receipt becomes the equation <strong>x + 2y = 10</strong>, which we call equation A. It has two unknowns, each appearing only to the first power (no x², no xy), so it is a <strong>linear equation in two unknowns</strong>. Any pair (x, y) that makes both sides equal is a <strong>solution</strong>. On the coordinate plane (x across, y up) each solution is a point (<a class="xlink" href="../../../math/algebra/coordinate-plane/#step2">→ Coordinate plane, step 2: how a pair of numbers becomes a point</a>). Drag x; the page works out the matching y = (10 − x) ÷ 2 and leaves that solution on the graph.',
    s0x: 'Apple price x',
    s0lgPts: 'Solutions found so far',
    sweep0: 'Sweep x from 0 to 10',
    s0readout: 'With x = {x}, y = {y}. Check: {x} + 2 × {y} = {lhs}, which is 10, so ({x}, {y}) is a solution. {n} solutions are marked so far.',
    s0hint: 'What to watch: drag x slowly from 0 to 10 (or press sweep) and look at the shape the points make; once there are enough of them spread wide enough, the graph draws the whole line A they sit on. The slider moves in steps of 0.5, so at most 21 points appear, yet any x in between (say 3.14) has a matching y too. There are infinitely many solutions, and together they fill a whole line. This receipt alone cannot pick out the “real” prices from that line.',

    s1k: 'Step 1 · A second receipt',
    s1t: 'Which point fits both receipts?',
    s1e: 'This step asks: add a second receipt, 3 apples + 1 pear = 15, which is equation B: <strong>3x + y = 15</strong>. Which point satisfies both equations at once? Equations taken together, where one pair (x, y) must satisfy all of them, form a <strong>system of equations</strong>; a pair that satisfies them all is a solution of the system. To see how far a point is from satisfying an equation, define its <strong>miss</strong> = left side − right side. A miss of 0 means the point lies on that line; a positive miss means those prices would make the receipt total too high. Drag the point’s x and y; the readout gives both misses, and every point you try stays on the graph, coloured by how many equations it satisfies. The buttons above switch to another system (shared by steps 1–3).',
    ptX: 'Point x', ptY: 'Point y',
    s1lgBoth: 'fits both', s1lgA: 'fits A only', s1lgB: 'fits B only', s1lgNone: 'fits neither',
    s1readout: 'Point ({x}, {y}): miss A = {ea}, miss B = {eb}. {verdict}',
    s1both: 'Both misses are 0: this point solves the system.',
    s1onlyA: 'It satisfies A but not yet B.',
    s1onlyB: 'It satisfies B but not yet A.',
    s1none: 'It satisfies neither equation.',
    s1hint: 'What to watch: first drag only y to put the point on the cyan line A (miss A becomes 0). Then walk along A (for the default system, each +1 in x needs −0.5 in y) and watch miss B shrink step by step until it is 0 too. Exactly one point has both misses at 0, and it is where the two lines cross. Switch to another system and find it again.',

    s2k: 'Step 2 · Substitution',
    s2t: 'How do you calculate the crossing instead of hunting for it?',
    s2e: 'This step asks: can we calculate the crossing point directly instead of dragging around for it? <strong>Substitution</strong> starts by solving equation A for x in terms of y (for the default system, x = 10 − 2y). That ties x and y to line A and leaves a single unknown, y. Then <strong>substitute</strong> the expression into equation B (replace B’s x with it). B becomes a one-unknown linear equation that you can solve the balance-scale way (<a class="xlink" href="../../../math/algebra/equation-scale/#step4">→ Balance scale, step 4: two-step equations</a>). In the top panel the white point can only move along line A; the bottom panel plots that point’s y across and its miss on equation B (left − right) up.',
    s2y: 'Point’s y (line A sets x)',
    s2lgPt: 'point on line A',
    missB: 'miss B',
    c2a: 'The white point stays on line A', c2b: 'Bottom: the white point’s y across, its miss on B up',
    s2lgRes: 'bottom: that point’s miss on B',
    next2: 'Next line', reset2: 'Start over',
    s2prog: 'line {c}/{N} of the working · ',
    s2done: 'working complete · ',
    s2readout: '{prog}the white point ({x}, {y}) is on line A; its miss on B is {r}.',
    d1: 'Solve A for x in terms of y', d2: 'Substitute into B (replace x with the line above)', d3: 'Expand the brackets', d4: 'Collect the y terms', d5: 'Move the constant to the right', d6: 'Divide both sides by the y coefficient', d7: 'Back-substitute y into the first line', d8: 'Check with equation B',
    s2hint: 'What to watch: drag y first. The white point slides along line A while the bottom panel records the miss on B for each y; those dots also fall on a line, and where it crosses 0 is the answer’s y. Then press “Next line” to step through the working; the graph follows along. The y coefficient in the “collect” line is the slope of the bottom line, the y from the “divide” line is where it crosses 0, and the white point stops at the crossing.',

    s3k: 'Step 3 · Elimination',
    s3t: 'Why does subtracting one equation from the other make an unknown vanish?',
    s3e: 'This step asks: without substituting, can adding or subtracting the equations make one unknown disappear? If some (x, y) satisfies both A and B, then multiplying both sides of A by a number m and subtracting from B leaves a true equation. So <strong>B − m·A</strong> is another equation in x and y that the solution must satisfy, which means its line must pass through the crossing. Drag m and the green line swings around that point. When m makes the y coefficient exactly 0, only x is left and the line becomes vertical, so you can read off x. When m kills the x coefficient, the line becomes horizontal. This is <strong>elimination</strong> (a negative m amounts to adding the equations).',
    s3m: 'Multiplier m (compute B − m·A)',
    s3lgC: 'B − m·A', s3lgTried: 'lines tried',
    elimY: 'Turn to the m that removes y', elimX: 'Turn to the m that removes x', clearLines: 'Clear trail',
    s3readout: 'm = {m}: B − m·A gives {eq}. {note}',
    s3elimY: 'y is gone, so x = {x} directly.',
    s3elimX: 'x is gone, so y = {y} directly.',
    s3keep: 'Both unknowns remain, but the line still passes through the crossing ({x}, {y}).',
    s3hint: 'What to watch: keep the system and drag only m. The green line always passes through the same white point; faint green lines are ones you tried. Then press the two buttons: m turns to the value that zeroes a coefficient and the green line goes vertical or horizontal. Switch systems and find its two special values of m (each is the ratio of the same unknown’s coefficients in B and A).',

    s4k: 'Step 4 · Always exactly one solution?',
    s4t: 'What if the lines never meet, or are the same line?',
    s4e: 'This step asks: does a system always have exactly one solution? Keep equation A: x + 2y = 10 and make the second equation B: kx + 2y = c, then drag k and c. How steeply a line slopes depends only on the ratio of its x and y coefficients. Decide with <strong>D = (x coefficient of A) × (y coefficient of B) − (x coefficient of B) × (y coefficient of A)</strong>, here D = 1 × 2 − k × 2. When D ≠ 0 the lines slope differently and must cross at exactly one point: one solution. When D = 0 they slope the same, so they are either parallel (no common point, no solution) or the same line (infinitely many solutions).',
    s4k_: 'x coefficient k in B', s4c_: 'Right side c of B',
    s4lgX: 'crossing', s4lgTrail: 'crossings tried',
    s4one: 'D = {D} ≠ 0: the lines cross at ({x}, {y}), exactly one solution. {off}',
    s4off: 'The crossing is now off the graph.',
    s4none: 'D = 0 and c ≠ 10: the lines are parallel with no common point, so the system has no solution.',
    s4many: 'D = 0 and c = 10: B is the same equation as A, the lines coincide, every point on them is a solution, so there are infinitely many.',
    s4hint: 'What to watch: keep c = 15 and drag k slowly from 3 towards 1. The faint trail shows the crossing running further and further along line A (once it leaves the graph the readout still gives its coordinates). At k = 1, D = 0: the lines are parallel and the crossing is gone. Then keep k = 1 and drag c to 10: the two lines merge.',
    quizPrompt: 'Think: how many solutions does the system x + y = 3, 2x + 2y = 7 have?',
    quizA: 'Exactly one', quizB: 'None', quizC: 'Infinitely many',
    check: 'Check',
    correct: 'Right. D = 1 × 2 − 2 × 1 = 0, so the lines slope the same. Doubling the first equation gives 2x + 2y = 6, which contradicts 2x + 2y = 7, so the lines are parallel and there is no solution.',
    wrong: 'Not quite. Work out D = 1 × 2 − 2 × 1 first. If D = 0, double the first equation and compare its right side with the second.',

    s5k: 'Step 5 · Putting it to work',
    s5t: 'Given only two receipts, can you recover the real prices?',
    s5e: 'This step asks: can a system work backwards from results to causes? First you set the real prices: an apple costs p and a pear costs q. The page prints two receipts from them. Then pretend you have forgotten p and q, solve the system using only the quantities and totals on the receipts, and see whether the x and y you get are the p and q you set. Receipt 2 can be swapped for “2 apples + 4 pears”, where each quantity is exactly twice receipt 1’s.',
    s5p: 'Real apple price p', s5q: 'Real pear price q',
    s5lg1: 'receipt 1 line', s5lg2: 'receipt 2 line', s5lgSol: 'solved (x, y)',
    rc: 'Receipt {i}: {a} apples + {b} pears = {c}',
    copyOn: 'Swap back to “3 apples + 1 pear”', copyOff: 'Swap receipt 2 for “2 apples + 4 pears”',
    s5one: 'System: {e1}, {e2}. D = {D}; solving gives x = {x}, y = {y}, which {match} the prices you set, p = {p} and q = {q}.',
    s5match: 'match', s5mismatch: 'do not match',
    s5many: 'System: {e1}, {e2}. D = 0: the second equation is exactly twice the first, the lines coincide, infinitely many (x, y) fit both receipts, and p = {p}, q = {q} cannot be recovered.',
    s5hint: 'What to watch: drag p and q first. Both receipt totals change, the two lines always cross at (p, q), and the solved prices match what you set. Then swap receipt 2: the new receipt only doubles the first one’s quantities and brings no new information, so the lines coincide and the prices can’t be recovered. Pinning down two unknowns takes two pieces of information that are not multiples of each other.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One equation is a line; two equations fix a point',
    s6fin: 'A linear equation in two unknowns has infinitely many solutions, which draw a line. Put two such equations together and their shared solution is where the lines cross. <strong>Substitution</strong> keeps the point on one line and turns the problem into one unknown; <strong>elimination</strong> combines the equations into a vertical or horizontal line that still passes through the crossing. Both reach the same point, and D decides whether that point exists and is unique.',
    formula: 'a₁x + b₁y = c₁,  a₂x + b₂y = c₂\nD = a₁b₂ − a₂b₁ ≠ 0  ⇒  x = (c₁b₂ − c₂b₁) ÷ D,  y = (a₁c₂ − a₂c₁) ÷ D',
    boundary: 'Scope: this page covers two linear equations in two unknowns. When D = 0 there is either no solution or infinitely many, and the formula above does not apply. Three or more unknowns work the same way (each equation is a plane in space); there, matrices organise the elimination.',
    linksTitle: 'Where to next',
    lk1: '→ Linear functions, step 3: where two lines meet is the shared solution',
    lk2: '→ Balance scale, step 4: the two-step equation left after substituting',
    lk3: '→ Linear transformations, step 3: invertible or collapsed, what D = 0 means for a matrix',
    lk4: '→ Chickens and rabbits, step 1: “suppose they’re all chickens” is elimination in disguise',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Simultaneous Equations · Where Two Lines Meet”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
