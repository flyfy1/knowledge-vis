'use strict';
// Pythagorean theorem lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '勾股定理 · 斜边上的那块正方形',
    back: '← 知识索引',
    compare: '对照另一版本：勾股定理 · 一步一交互 →',
    navLabel: '勾股定理步骤导航',
    tagline: '在方格纸上先向东、再向北走，绕了一个直角；直接走直线能少走多少？答案藏在三块正方形里：两条短边上的正方形，面积加起来正好等于最长边上的那一块。七步里你会先量出这个规律，再看它为什么只属于直角，用拼图证明它，然后拿它算距离、判直角、找整数解。',
    nav0: '0 抄近路', nav1: '1 铰链', nav2: '2 拼图证明', nav3: '3 两点距离', nav4: '4 反过来判', nav5: '5 整数斜边', nav6: '6 收束',

    s0k: '第 0 步 · 先量一量',
    s0t: '直着走过去，比绕一个直角少走多少？',
    s0e: '这一步要回答：在方格纸上先向东走 a 格、再向北走 b 格，如果从起点直接拉一条直线到终点，这条直线 c 有多长？这三条线围成一个<strong>直角三角形</strong>：有一个角是 90°（直角）的三角形。夹住直角的两条边叫<strong>直角边</strong>（这里是 a 和 b），对着直角的那条边叫<strong>斜边</strong>（这里是 c），它是三条边里最长的。图上的尺子按画出来的长度量 c，精确到 0.01 格。',
    eastSlider: '向东走 a 格', northSlider: '向北走 b 格',
    c0title: '方格纸：一格边长为 1',
    s0lgWalk: '绕路：直角边 a、b', s0lgLine: '直线：斜边 c', s0lgRuler: '尺子刻度（每格一刻）',
    s0readout: 'a = {a}，b = {b}：绕路走 a + b = {sum} 格，直线 c ≈ {c} 格，省下约 {save} 格。三个「自己乘自己」：a×a = {a2}，b×b = {b2}，c×c ≈ {c2}（用未取整的 c 算）。',
    thA: 'a', thB: 'b', thSum: 'a + b', thC: 'c（量出）', thA2: 'a×a', thB2: 'b×b', thC2: 'c×c',
    tableCap: '你试过的每一组（最新的在最上面，最多 8 行）',
    clearTable: '清空表格',
    s0hint: '观察顺序：先保持 b = 4，把 a 从 1 拖到 8，看表里「a + b」和「c」两列：c 总比 a + b 短，但短多少看不出简单规律。再看最后三列：c×c 和 a×a、b×b 之间有什么关系？每试一组，表格就多记一行。',

    s1k: '第 1 步 · 等号从哪来',
    s1t: '这个等号，是直角的功劳吗？',
    s1e: '这一步要回答：上一步发现 c×c 总等于 a×a + b×b。是任何三角形都这样，还是只有带直角的才这样？一个数自己乘自己叫这个数的<strong>平方</strong>，a×a 写作 a²。在几何里，a² 就是边长为 a 的正方形的面积：a 行 a 列的小方格。下面在三角形的三条边上各向外搭一个正方形，面积分别是 a²、b²、c²。把边 a 和边 b 想成用铰链连在一起：拖「夹角」改变两边之间的角度，第三条边 c 跟着变长或变短，a、b 本身不变。曲线图（宽屏在右边，窄屏在下面）的横轴是夹角（单位：度），纵轴是面积（单位：小方格）；橙色水平线是两块小正方形的面积和 a² + b²，青色曲线是大正方形的面积 c²，只描出你拖过的角度。',
    aHinge: '边 a', bHinge: '边 b', angleSlider: '边 a 与边 b 的夹角 θ（度）', snap90: '回到 90°',
    c1a: '三条边上各搭一个正方形', c1b: '面积随夹角 θ 的变化（横轴：度）',
    s1lgA: 'a² 正方形', s1lgB: 'b² 正方形', s1lgC: 'c² 正方形（夹角对面那条边上）', s1lgSum: 'a² + b²（不随夹角变）',
    s1readout: 'θ = {deg}°：a² = {a2}，b² = {b2}，两块合计 {sum}；第三边 c ≈ {c}，c² ≈ {c2}。{verdict}',
    s1eq: '两块小正方形的面积正好等于大正方形：c² = a² + b²。',
    s1gt: 'c² 比 a² + b² 大 {d}：夹角大于 90°，对面的边被撑长了。',
    s1lt: 'c² 比 a² + b² 小 {d}：夹角小于 90°，对面的边被收短了。',
    s1hint: '观察顺序：保持 a = 3、b = 4，把夹角从 30° 慢慢拖到 150°。曲线图里青色曲线一路上升，只在一处碰到橙色水平线，那里正好是 90°。再换几组 a、b（换边会清掉曲线），交点还是在 90°。所以等号只属于直角；不是直角时，c² 比 a² + b² 大还是小，取决于角比直角大还是小。',

    s2k: '第 2 步 · 证明',
    s2t: '怎样知道它对每一个直角三角形都成立？',
    s2e: '这一步要回答：前两步只试了一些数。怎样说明对<strong>任何</strong>直角边 a、b，都有 a² + b² = c²？用具体的数去试叫<strong>验算</strong>，只能管试过的那几组；不依赖具体数字、对所有情形都成立的推理叫<strong>证明</strong>。做法：取一个边长为 a + b 的正方形框，放进四个<strong>全等</strong>的直角三角形（全等：形状、大小完全一样，叠起来能重合），直角边都是 a 和 b。摆法甲：四个三角形各占一个角，中间空出一个斜放的正方形，它的四条边都是斜边 c，面积是 c²。摆法乙：把其中三个三角形平移（不转、不翻）到新位置，空出来的变成边长为 a 和边长为 b 的两块正方形，面积合计 a² + b²。',
    legA: '直角边 a', legB: '直角边 b',
    move2: '挪动三角形（一次一个）', reset2: '放回摆法甲',
    c2a: '摆法甲：中间空出 c²', c2b: '摆法乙：挪三个三角形',
    s2lgTri: '四个全等的直角三角形', s2lgHoleC: '空出的 c²', s2lgHoleAB: '空出的 a² 和 b²', s2lgGhost: '虚线：三角形原来的位置',
    s2progress: '已挪动 {k}/3 个三角形（右下角那个三角形不用动）。',
    s2readout: '{prog}框的面积 (a + b)² = {frame}；四个三角形共 4 × ({a} × {b} ÷ 2) = {tris}。摆法甲空出 {frame} − {tris} = {hA}，这块是 c²，所以 c ≈ {c}。摆法乙空出 a² + b² = {a2} + {b2} = {hB}。同一个框、同样四个三角形，空出的面积一定相同：a² + b² = c²。',
    s2hint: '观察顺序：先按「挪动三角形」，看「摆法乙」框里三个三角形一个接一个滑到新位置，虚线留着它们原来的位置；挪完后，中间斜放的空洞变成了两块正着放的正方形。再拖 a、b：两个框和所有数字一起重算，空出的面积始终相等。推理里没用到 a、b 的具体数值，所以结论对所有直角三角形都成立。',

    s3k: '第 3 步 · 拿来算距离',
    s3t: '坐标格上的两个点，直线距离是多少？',
    s3e: '这一步要回答：在<strong>坐标</strong>格上（每个点用一对数 (x, y) 标出位置：从原点先横着数 x 格，再竖着数 y 格），已知两点的坐标，不用尺子，怎样算它们的直线距离？从 A 到 B 先横着走、再竖着走，正好拐了一个直角：横着走的长度 Δx 是两点 x 坐标之差，竖着走的长度 Δy 是 y 坐标之差（Δ 读作「德尔塔」，在这里就是「差」）。这两段是直角边，A 到 B 的直线是斜边，所以距离 d² = Δx² + Δy²，d = √(Δx² + Δy²)。符号 <strong>√</strong> 叫<strong>平方根</strong>，它把平方倒回去：√25 = 5，因为 5² = 25（<a class="xlink" href="../../../math/algebra/coordinate-plane/#step6">→ 坐标系页第 6 步：一条线段的方向、长度与中点</a>）。',
    bxSlider: 'B 点的 x', bySlider: 'B 点的 y',
    c3title: '坐标格（点格点也可以移动 B）',
    s3lgA: 'A = (2, 1)，固定', s3lgB: 'B（可移动）', s3lgPath: '横、竖两段路 Δx、Δy', s3lgD: '直线距离 d', s3lgTrail: '试过的 B：实心 = 距离是整数',
    s3readout: 'B = ({x}, {y})：Δx = |{x} − 2| = {dx}，Δy = |{y} − 1| = {dy}；d² = {dx}² + {dy}² = {d2}，d = √{d2} {dv}。',
    s3whole: '= {d}，正好是整数',
    s3approx: '≈ {d}，不是整数',
    s3same: 'B 和 A 重合，两点距离是 0。',
    s3five: '离 A 恰好 5 格的格点，你已找到 {k}/{n} 个。',
    s3hint: '观察顺序：拖 B 的 x 和 y（或直接点一个格点），看两段直角边和斜边一起变。每个试过的 B 都留下一个小点：实心点到 A 的距离恰好是整数。挑战：找出图上所有离 A 恰好 5 格的格点（提示：不只是正右方和正上方）。',

    s4k: '第 4 步 · 反过来用',
    s4t: '只给三条边的长度，怎么判断有没有直角？',
    s4e: '这一步要回答：手里只有三根木棍的长度，不画图，怎么知道它们拼成的三角形是不是直角三角形？把定理反过来用：取最长的一根当 c，比较 c² 和另外两根的平方和 a² + b²。相等 → 有一个直角，这叫勾股定理的<strong>逆定理</strong>（把定理的条件和结论对调后，仍然成立）。c² 更大 → 最长边对着的角比直角大，叫<strong>钝角三角形</strong>；c² 更小 → 三个角都比直角小，叫<strong>锐角三角形</strong>。这和第 1 步铰链实验的方向一致。比较之前先确认能拼成：两根短的加起来必须比最长的长。',
    stick1: '木棍 1', stick2: '木棍 2', stick3: '木棍 3',
    c4title: '三根木棍拼成的三角形（最长边放在底下）',
    s4lgSides: '三条边', s4lgAngle: '最长边对着的角', s4lgRight: '直角参照（90°）',
    s4readout: '最长边 c = {c}：c² = {c2}；另外两边 a² + b² = {a}² + {b}² = {sum}。{cmp} → {kind}（最长边对着的角约 {ang}°，从拼出的图形量得）。',
    cmpEq: 'c² = a² + b²', cmpGt: 'c² 比 a² + b² 大 {d}', cmpLt: 'c² 比 a² + b² 小 {d}',
    kindRight: '直角三角形', kindAcute: '锐角三角形', kindObtuse: '钝角三角形',
    s4bad: '两根短的 {a} + {b} = {s}，不比最长的 {c} 长，合不拢，拼不成三角形。',
    quizTitle: '先判再揭晓',
    quizQ: '第 {i}/{n} 题：三根木棍长 {a}、{b}、{c}，拼成的是哪种三角形？',
    qRight: '直角', qAcute: '锐角', qObtuse: '钝角', qNext: '下一题', qRestart: '再来一轮',
    qOk: '答对了。{why}',
    qNo: '不对，是{kind}。{why}',
    qWhy: '最长边 {c}² = {c2}，{a}² + {b}² = {sum}。上面的木棍已换成这一组。',
    qScore: '已答 {n} 题，答对 {k} 题。',
    s4hint: '观察顺序：先把三根木棍设成 3、4、5，读数显示 c² = a² + b²、角正好 90°。只把 5 改成 6，最长边对着的角变钝；再把它改成 2，最长的变成了长 4 的那根，要拿它重新比较。最后在下面的测验里先选答案再揭晓：揭晓后选项锁定，按「下一题」才继续。',

    s5k: '第 5 步 · 整数够用吗',
    s5t: '直角边是整数时，斜边也是整数吗？',
    s5e: '这一步要回答：直角边 a、b 都是整数时，斜边 c = √(a² + b²) 一定是整数吗？下图每一个点代表一组直角边：横坐标是 a，纵坐标是 b（都从 1 到 20）。如果 a² + b² 正好是某个整数的平方（例如 9 + 16 = 25 = 5²），这个点就点亮。点一下图上的点，或拖下面的滑杆，都能选中一组。三个都是整数、满足 a² + b² = c² 的数，叫<strong>勾股数</strong>。',
    a5Slider: '直角边 a', b5Slider: '直角边 b', rays5: '画出倍数线', qSlider: '分母 q',
    c5title: '哪些整数直角边的斜边也是整数（横 a，竖 b）',
    s5lgLit: '点亮：斜边是整数', s5lgSel: '当前选中的一点', s5lgRay: '倍数线：同一组勾股数的 1、2、3… 倍',
    s5readout: 'a = {a}，b = {b}：a² + b² = {s}。{res}　｜　1 到 20 的 400 组直角边里，点亮的只有 {n} 个点。',
    s5whole: '{s} = {c}²，斜边 c = {c}，是整数；这一组是 {pa}、{pb}、{pc} 的 {k} 倍。',
    s5wholePrim: '{s} = {c}²，斜边 c = {c}，是整数；{a}、{b}、{c} 已经不能再约小。',
    s5not: '{s} 不是任何整数的平方，c = √{s} ≈ {c}，不是整数。',
    s5sqrt2: '最简单的 a = b = 1：c = √2 ≈ 1.41421356…。能不能写成分数 p/q？分母取 q = {q}，最接近的分子是 p = {p}：p² = {p2}，而 2q² = {tq2}，差 {miss}。p² 和 2q² 都是整数，只要不相等就至少差 1。',
    s5sqrt2Tail: '不论分母取多大，它们都不会相等：√2 不是分数，小数也永远写不完、不循环。这样的数叫<strong>无理数</strong>（<a class="xlink" href="../../../math/arithmetic/real-number-line/#step1">→ 实数轴页第 1 步：为什么 √2 写不成 p/q</a>）。',
    s5hint: '观察顺序：先看图：亮点很少，而且排成从左下角原点出发的几条直线。按「画出倍数线」，每条线上是同一组勾股数的倍数，比如 3-4-5、6-8-10、9-12-15。再把 a、b 都拖到 1，读下方 √2 那一行，拖「分母 q」看分数能不能凑出 √2。',

    s6k: '第 6 步 · 收束', s6t: '一个直角，三块正方形，一条等式',
    s6fin: '回头看：<strong>第 0 步</strong>量出直线比绕路短，而且 c×c 总等于 a×a + b×b；<strong>第 1 步</strong>用铰链看出这个等号只在夹角正好 90° 时成立；<strong>第 2 步</strong>用同一个框、同样四个三角形的两种摆法，证明它对所有直角三角形成立；<strong>第 3 步</strong>拿它算坐标格上两点的距离；<strong>第 4 步</strong>反过来，用 c² 和 a² + b² 的比较判断直角、锐角、钝角；<strong>第 5 步</strong>发现整数斜边很少见，而 1、1 的斜边 √2 连分数都写不成。',
    formula: 'a² + b² = c²\nc = √(a² + b²)\nd = √(Δx² + Δy²)',
    boundary: '适用范围：等式 a² + b² = c² 只对直角三角形成立，c 必须是对着直角的那条边；不是直角时，c² 比 a² + b² 大还是小取决于角是钝角还是锐角（第 1、4 步）。判断时要先确认三条边能拼成三角形。本页的三角形都画在平面上；在地球表面这样的弯曲面上画大三角形时，等式不再精确成立。',
    linksTitle: '接着去哪儿',
    lk1: '→ 实数轴页第 0 步：把边长为 1 的正方形对角线 √2 放到数轴上',
    lk2: '→ 坐标系页第 6 步：线段的方向、长度与中点',
    lk3: '→ 三角函数页第 1 步：单位圆上的点 (cos θ, sin θ)，到圆心的距离总是 1',
    lk4: '→ 空间对角线页第 1 步：长方体里连用两次勾股定理',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《勾股定理 · 一步一交互》的平行版本。'
  },
  en: {
    pageTitle: 'The Pythagorean Theorem · The Square on the Long Side',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Pythagorean Theorem · One Interaction at a Time →',
    navLabel: 'Pythagorean theorem steps',
    tagline: 'Walk east, then north on squared paper, turning one right angle. How much shorter is the straight line back? The answer lives in three squares: the squares on the two short sides together fill exactly the square on the longest side. Over seven steps you will measure the pattern, see why it belongs to right angles only, prove it with a jigsaw, then use it to find distances, detect right angles and hunt for whole-number answers.',
    nav0: '0 Shortcut', nav1: '1 Hinge', nav2: '2 Jigsaw proof', nav3: '3 Distance', nav4: '4 Run it backwards', nav5: '5 Whole numbers', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Measure first',
    s0t: 'How much shorter is the straight line than going round the corner?',
    s0e: 'The question here: on squared paper, walk a squares east and then b squares north. If you stretch a straight line from the start to the finish, how long is that line c? The three lines make a <strong>right triangle</strong>: a triangle with one 90° corner (a right angle). The two sides that meet at the right angle are the <strong>legs</strong> (here a and b); the side facing the right angle is the <strong>hypotenuse</strong> (here c), and it is always the longest of the three. The ruler on the picture measures the drawn length of c to 0.01 of a square.',
    eastSlider: 'Walk east a squares', northSlider: 'Walk north b squares',
    c0title: 'Squared paper: each square is 1 unit wide',
    s0lgWalk: 'Round the corner: legs a, b', s0lgLine: 'Straight line: hypotenuse c', s0lgRuler: 'Ruler ticks (one per unit)',
    s0readout: 'a = {a}, b = {b}: going round the corner covers a + b = {sum} units; the straight line c ≈ {c}, saving about {save}. Each side times itself: a×a = {a2}, b×b = {b2}, c×c ≈ {c2} (from the unrounded c).',
    thA: 'a', thB: 'b', thSum: 'a + b', thC: 'c (measured)', thA2: 'a×a', thB2: 'b×b', thC2: 'c×c',
    tableCap: 'Every pair you have tried (newest first, up to 8 rows)',
    clearTable: 'Clear the table',
    s0hint: 'What to try: keep b = 4 and drag a from 1 to 8, watching the “a + b” and “c” columns. The straight line is always shorter, but by no obvious amount. Now look at the last three columns: how is c×c related to a×a and b×b? Each new pair adds a row.',

    s1k: 'Step 1 · Where the equals sign comes from',
    s1t: 'Does that equals sign come from the right angle?',
    s1e: 'The question here: the last step found c×c always matching a×a + b×b. Does every triangle do that, or only ones with a right angle? A number times itself is its <strong>square</strong>, and a×a is written a². In geometry, a² is the area of a square with side a: a rows of a little unit squares. Below, a square is built outward on each side of the triangle, with areas a², b² and c². Picture sides a and b joined by a hinge: drag the angle and the third side c stretches or shrinks while a and b stay the same. In the graph (to the right on wide screens, below on narrow ones), the horizontal axis is the angle (in degrees) and the vertical axis is area (in unit squares). The orange level line is a² + b², the cyan curve is c², drawn only where you have dragged.',
    aHinge: 'Side a', bHinge: 'Side b', angleSlider: 'Angle θ between a and b (degrees)', snap90: 'Back to 90°',
    c1a: 'A square on every side', c1b: 'Areas as the angle θ changes (degrees)',
    s1lgA: 'square a²', s1lgB: 'square b²', s1lgC: 'square c² (on the side facing the angle)', s1lgSum: 'a² + b² (does not depend on θ)',
    s1readout: 'θ = {deg}°: a² = {a2}, b² = {b2}, together {sum}; third side c ≈ {c}, c² ≈ {c2}. {verdict}',
    s1eq: 'The two small squares exactly match the big one: c² = a² + b².',
    s1gt: 'c² exceeds a² + b² by {d}: the angle is wider than 90°, so the opposite side is pushed longer.',
    s1lt: 'c² falls short of a² + b² by {d}: the angle is narrower than 90°, so the opposite side is pulled shorter.',
    s1hint: 'What to try: keep a = 3 and b = 4 and drag the angle slowly from 30° to 150°. The cyan curve climbs all the way and touches the orange line at a single point — exactly 90°. Change a or b (this clears the curve) and the crossing stays at 90°. So the equals sign belongs to the right angle; otherwise c² is bigger or smaller than a² + b² depending on whether the angle is wider or narrower than a right angle.',

    s2k: 'Step 2 · Proof',
    s2t: 'How can we be sure it works for every right triangle?',
    s2e: 'The question here: so far we have only tried some numbers. How do we know a² + b² = c² for <strong>any</strong> legs a and b? Trying particular numbers is <strong>checking</strong>; it covers only the cases you tried. An argument that never relies on particular numbers, and so covers every case, is a <strong>proof</strong>. Take a square frame with side a + b and four <strong>congruent</strong> right triangles (congruent: identical in shape and size, so one sits exactly on top of another), each with legs a and b. Layout 1: one triangle in each corner, leaving a tilted square in the middle whose sides are all hypotenuses c — area c². Layout 2: slide three of the triangles (no turning, no flipping) to new spots, and the empty space becomes two upright squares, side a and side b — area a² + b².',
    legA: 'Leg a', legB: 'Leg b',
    move2: 'Slide the triangles (one at a time)', reset2: 'Back to layout 1',
    c2a: 'Layout 1: the gap is c²', c2b: 'Layout 2: slide three triangles',
    s2lgTri: 'four congruent right triangles', s2lgHoleC: 'gap c²', s2lgHoleAB: 'gaps a² and b²', s2lgGhost: 'dashed: where the triangles started',
    s2progress: 'Moved {k}/3 triangles (the bottom-right one stays put). ',
    s2readout: '{prog}Frame area (a + b)² = {frame}; four triangles cover 4 × ({a} × {b} ÷ 2) = {tris}. Layout 1 leaves {frame} − {tris} = {hA}: that gap is c², so c ≈ {c}. Layout 2 leaves a² + b² = {a2} + {b2} = {hB}. Same frame, same four triangles, so the leftover area must be the same: a² + b² = c².',
    s2hint: 'What to try: press “Slide the triangles” and watch three triangles in the Layout 2 frame glide one by one, with dashed outlines marking where they began. When they finish, the tilted gap has turned into two upright squares. Then drag a and b: both frames and every number are recomputed, and the leftover areas always agree. The argument never used particular values of a and b, which is why it holds for every right triangle.',

    s3k: 'Step 3 · Put it to work',
    s3t: 'How far apart are two points on a grid?',
    s3e: 'The question here: on a <strong>coordinate</strong> grid (each point is named by a pair (x, y): count x squares across from the origin, then y squares up), how can you get the straight-line distance between two points from their coordinates alone, without a ruler? Going from A to B across and then up turns exactly one right angle. The run across, Δx, is the difference of the x-coordinates; the rise, Δy, is the difference of the y-coordinates (Δ, “delta”, just means “difference” here). Those two runs are the legs and the straight line AB is the hypotenuse, so d² = Δx² + Δy² and d = √(Δx² + Δy²). The sign <strong>√</strong> is the <strong>square root</strong>, which undoes squaring: √25 = 5 because 5² = 25 (<a class="xlink" href="../../../math/algebra/coordinate-plane/#step6">→ Coordinate plane, step 6: a segment’s direction, length and midpoint</a>).',
    bxSlider: 'x of point B', bySlider: 'y of point B',
    c3title: 'Coordinate grid (tap a grid point to move B)',
    s3lgA: 'A = (2, 1), fixed', s3lgB: 'B (movable)', s3lgPath: 'the two runs Δx, Δy', s3lgD: 'straight-line distance d', s3lgTrail: 'places B has been: filled = whole-number distance',
    s3readout: 'B = ({x}, {y}): Δx = |{x} − 2| = {dx}, Δy = |{y} − 1| = {dy}; d² = {dx}² + {dy}² = {d2}, d = √{d2} {dv}.',
    s3whole: '= {d}, a whole number',
    s3approx: '≈ {d}, not a whole number',
    s3same: 'B sits on A; the distance is 0.',
    s3five: 'Grid points exactly 5 from A found so far: {k}/{n}.',
    s3hint: 'What to try: drag B’s x and y (or tap a grid point) and watch both legs and the hypotenuse move together. Every B you try leaves a dot; filled dots are a whole number of units from A. Challenge: find every grid point on the picture that is exactly 5 from A (hint: not only straight right and straight up).',

    s4k: 'Step 4 · Run it backwards',
    s4t: 'Given only three side lengths, how can you tell whether there is a right angle?',
    s4e: 'The question here: you have three sticks and know only their lengths. Without drawing, can you tell whether the triangle they make has a right angle? Run the theorem backwards: call the longest stick c and compare c² with the sum of the other two squares, a² + b². If they are equal, there is a right angle — this is the <strong>converse</strong> of the theorem (swap its condition and conclusion and it is still true). If c² is bigger, the angle facing the longest side is wider than a right angle: an <strong>obtuse triangle</strong>. If c² is smaller, all three angles are narrower than a right angle: an <strong>acute triangle</strong>. That matches what the hinge showed in step 1. First check that the sticks close up at all: the two shorter ones must add up to more than the longest.',
    stick1: 'Stick 1', stick2: 'Stick 2', stick3: 'Stick 3',
    c4title: 'Triangle from the three sticks (longest at the bottom)',
    s4lgSides: 'the three sides', s4lgAngle: 'angle facing the longest side', s4lgRight: 'right-angle reference (90°)',
    s4readout: 'Longest side c = {c}: c² = {c2}; the other two give a² + b² = {a}² + {b}² = {sum}. {cmp} → {kind} (the angle facing the longest side is about {ang}°, measured from the drawn triangle).',
    cmpEq: 'c² = a² + b²', cmpGt: 'c² is {d} more than a² + b²', cmpLt: 'c² is {d} less than a² + b²',
    kindRight: 'a right triangle', kindAcute: 'an acute triangle', kindObtuse: 'an obtuse triangle',
    s4bad: 'The two shorter sticks give {a} + {b} = {s}, which is not more than the longest, {c}. They cannot close up into a triangle.',
    quizTitle: 'Decide first, then reveal',
    quizQ: 'Question {i}/{n}: sticks of length {a}, {b} and {c}. What kind of triangle do they make?',
    qRight: 'Right', qAcute: 'Acute', qObtuse: 'Obtuse', qNext: 'Next question', qRestart: 'Start a new round',
    qOk: 'Correct. {why}',
    qNo: 'Not quite — it is {kind}. {why}',
    qWhy: 'Longest side {c}² = {c2}, and {a}² + {b}² = {sum}. The sticks above now show this set.',
    qScore: 'Answered {n}, correct {k}.',
    s4hint: 'What to try: set the sticks to 3, 4, 5 — the readout shows c² = a² + b² and exactly 90°. Change only the 5 to 6 and the angle facing the longest side turns obtuse; now change it to 2, and the stick of length 4 becomes the longest, so the comparison is made against it instead. Then take the quiz below: pick an answer before the reveal. Once revealed the choices lock until you press “Next question”.',

    s5k: 'Step 5 · Are whole numbers enough?',
    s5t: 'If both legs are whole numbers, is the hypotenuse one too?',
    s5e: 'The question here: when legs a and b are whole numbers, must the hypotenuse c = √(a² + b²) be a whole number as well? Each dot below stands for one pair of legs: a across and b up, both from 1 to 20. A dot lights up when a² + b² is exactly the square of a whole number (like 9 + 16 = 25 = 5²). Tap a dot or use the sliders to pick a pair. Three whole numbers with a² + b² = c² are called a <strong>Pythagorean triple</strong>.',
    a5Slider: 'Leg a', b5Slider: 'Leg b', rays5: 'Draw the multiple lines', qSlider: 'Denominator q',
    c5title: 'Legs with a whole-number hypotenuse (a across, b up)',
    s5lgLit: 'lit: whole-number hypotenuse', s5lgSel: 'selected dot', s5lgRay: 'multiple line: 1×, 2×, 3×… of one triple',
    s5readout: 'a = {a}, b = {b}: a² + b² = {s}. {res}  |  Of the 400 leg pairs from 1 to 20, only {n} dots light up.',
    s5whole: '{s} = {c}², so c = {c}, a whole number; this is {k} × the triple {pa}, {pb}, {pc}.',
    s5wholePrim: '{s} = {c}², so c = {c}, a whole number; {a}, {b}, {c} cannot be scaled down any further.',
    s5not: '{s} is not the square of any whole number, so c = √{s} ≈ {c}, not a whole number.',
    s5sqrt2: 'The simplest case, a = b = 1, gives c = √2 ≈ 1.41421356…. Could it be a fraction p/q? With denominator q = {q} the closest numerator is p = {p}: p² = {p2}, while 2q² = {tq2}, a gap of {miss}. Both are whole numbers, so whenever they differ they differ by at least 1.',
    s5sqrt2Tail: 'However large you make the denominator, they never match: √2 is not a fraction, and its decimal never ends or repeats. Such a number is called <strong>irrational</strong> (<a class="xlink" href="../../../math/arithmetic/real-number-line/#step1">→ Real number line, step 1: why √2 cannot be written as p/q</a>).',
    s5hint: 'What to try: first just look. Lit dots are rare, and they line up along a few straight lines from the origin in the bottom-left corner. Press “Draw the multiple lines”: each line carries multiples of one triple, such as 3-4-5, 6-8-10, 9-12-15. Then drag a and b both to 1, read the √2 line below, and drag the denominator q to see whether any fraction lands exactly on √2.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One right angle, three squares, one equation',
    s6fin: 'Looking back: <strong>step 0</strong> measured that the straight line is shorter than going round, and that c×c always matched a×a + b×b. <strong>Step 1</strong> used a hinge to show the equals sign holds only when the angle is exactly 90°. <strong>Step 2</strong> proved it for every right triangle with two layouts of the same frame and the same four triangles. <strong>Step 3</strong> used it to measure distance on a grid. <strong>Step 4</strong> ran it backwards, comparing c² with a² + b² to tell right, acute and obtuse apart. <strong>Step 5</strong> found that whole-number hypotenuses are rare, and that the hypotenuse of legs 1 and 1, √2, is not even a fraction.',
    formula: 'a² + b² = c²\nc = √(a² + b²)\nd = √(Δx² + Δy²)',
    boundary: 'Where it holds: a² + b² = c² is true only for right triangles, and c must be the side facing the right angle. Without a right angle, c² is larger or smaller than a² + b² according to whether the angle is obtuse or acute (steps 1 and 4). When judging from side lengths, first make sure the sides can form a triangle at all. Every triangle here is drawn on a flat plane; draw a huge triangle on a curved surface such as the Earth and the equation is no longer exact.',
    linksTitle: 'Where to next',
    lk1: '→ Real number line, step 0: put √2, the diagonal of a unit square, on the number line',
    lk2: '→ Coordinate plane, step 6: a segment’s direction, length and midpoint',
    lk3: '→ Trigonometry, step 1: the point (cos θ, sin θ) on the unit circle is always 1 from the centre',
    lk4: '→ Space diagonal, step 1: Pythagoras used twice inside a box',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Pythagorean Theorem · One Interaction at a Time”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
