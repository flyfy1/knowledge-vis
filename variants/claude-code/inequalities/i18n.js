'use strict';
// Inequalities lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '不等式 · 一条限制，一整段答案',
    back: '← 知识索引',
    compare: '对照另一版本：不等式 · 天平倾斜，答案是一整段 →',
    navLabel: '不等式步骤导航',
    tagline: '方程问「哪个数正好相等」，不等式问「哪些数不超过、不少于」。答案往往不是一个数，而是数轴上的一整段。这一页从一只行李箱出发，看解集怎样画、两边能做哪些变形、为什么乘负数要把不等号翻过来，最后解一道整数的预算题。',
    nav0: '0 一条限制', nav1: '1 端点', nav2: '2 同加同减', nav3: '3 乘负数', nav4: '4 解一次不等式', nav5: '5 整数解', nav6: '6 收束',

    s0k: '第 0 步 · 不等式与解集',
    s0t: '行李箱里还能装多少？',
    s0e: '这一步要回答：一只空行李箱自重 3 kg，航空公司规定连箱带物不能超过 10 kg。箱里再放 x kg 的东西，x 可以是多少？「不超过」写成 <strong>≤</strong>（读作「小于或等于」），所以条件是 3 + x ≤ 10。像这样用 <、≤、>、≥ 把两边连起来的式子叫<strong>不等式</strong>。能让不等式成立的数叫它的<strong>解</strong>，全部的解合在一起叫<strong>解集</strong>。拖动 x：上面的秤条显示总重和 10 kg 限重线；下面的数轴记下每个试过的 x，绿点成立，红点不成立。',
    x0Label: '放进去的重量 x（kg）', try0: '从 0 到 12 逐个试', clr0: '清空试过的点',
    c0top: '秤：箱子 3 kg + 放入 x kg', c0bot: '数轴：试过的 x',
    s0lgOk: '成立（是解）', s0lgNo: '不成立', s0lgLimit: '限重 10 kg',
    s0readout: 'x = {x}：3 + {x} = {s}，{s} {rel} 10，所以 3 + x ≤ 10 {verdict}。已试 {k} 个数：{g} 个成立，{r} 个不成立。',
    yes: '成立', no: '不成立',
    s0all: '0 到 12 每隔 0.5 都试过了：成立的是 0 到 {m} 这一段（含 {m}），{m} 右边全不成立。解不是一个数，而是一整段。',
    s0hint: '观察顺序：先把 x 从 0 慢慢往右拖，看秤条什么时候越过限重线、数轴上的点什么时候由绿变红；再点「从 0 到 12 逐个试」，看绿点连成一段。重量不能是负数，所以这里 x 从 0 开始。',

    s1k: '第 1 步 · 端点',
    s1t: 'x < 7 和 x ≤ 7，差的只是一个点吗？',
    s1e: '这一步要回答：把解集画到数轴上，端点算不算进去？<strong>解集</strong>（所有能让不等式成立的数）是数轴上的一段，用阴影表示。端点 a 本身：不等号带等号（≤ 或 ≥）时 a 也是解，画成<strong>实心圆</strong>；不带等号（< 或 >）时 a 不是解，画成<strong>空心圆</strong>。下面一条数轴把端点附近放大 10 倍、100 倍、1000 倍，看紧挨着端点的数是不是解。',
    opLabel: '不等号', a1Label: '端点 a', z1Label: '放大倍数',
    c1top: '解集：x {op} {a}', c1bot: '端点附近放大 {z} 倍',
    s1lgShade: '阴影 = 解集', s1lgSolid: '实心圆：端点是解', s1lgHollow: '空心圆：端点不是解',
    s1readout: '端点 {a} {is}解，画成{shape}。放大 {z} 倍后，紧挨端点的 {p} 是解（{p} {op} {a}）。',
    isYes: '是', isNo: '不是', solid: '实心圆', hollow: '空心圆',
    s1noMax: '离 {a} 更近的数（比如 {p2}）也还是解，但 {a} 自己不是：x {op} {a} 没有最大的解。',
    s1noMin: '离 {a} 更近的数（比如 {p2}）也还是解，但 {a} 自己不是：x {op} {a} 没有最小的解。',
    s1hasMax: '{a} 自己就是解，所以 x {op} {a} 有最大的解，就是 {a}。',
    s1hasMin: '{a} 自己就是解，所以 x {op} {a} 有最小的解，就是 {a}。',
    s1hint: '观察顺序：先在「≤」和「<」之间来回切换，只看端点的圆在实心和空心之间变，阴影不变；再把放大倍数拖到 1000，看下面数轴上紧挨端点的刻度仍在阴影里。换成 > 或 ≥，阴影翻到右边。',

    s2k: '第 2 步 · 同加同减',
    s2t: '两边同时加上或减去一个数，不等号会变吗？',
    s2e: '这一步要回答：已知 2 < 5，两边都加上同一个数 c，大小关系还在不在？上面的数轴是原来的两个数，下面是加 c 以后的，连线把每个数和它的结果连起来。加 c 就是把每个点向右挪 c（c 是负数就向左挪）：两点一起挪，连线全部平行、一样长，谁在左谁在右不变，相隔的距离也不变。所以两边同加（或同减）一个数，<strong>不等号方向不变</strong>。第 0 步就能这样解：3 + x ≤ 10 两边都减 3，得 x ≤ 7。',
    c2Label: '两边都加上 c（负数就是减去）',
    c2top: '原来：2 < 5', c2bot: '两边都加 {c} 以后',
    s2lgPair: '这两个数', s2lgTrail: '试过的其他 c',
    s2readout: '2 + {cp} = {p}，5 + {cp} = {q}：{p} {rel} {q}，不等号方向没变，两数仍相距 {gap}。',
    s2hint: '观察顺序：把 c 从 −6 拖到 6，看下面两点一起平移、连线始终平行；读数里一直是 <，距离一直是 3。下面数轴上的淡点是你试过的其他 c。',

    s3k: '第 3 步 · 乘负数',
    s3t: '两边同乘一个负数，为什么要把不等号翻过来？',
    s3e: '这一步要回答：已知 −1 < 2，两边都乘同一个数 m 以后会怎样？上面数轴是原来的两个数，下面是乘 m 以后的，连线把每个数和它的结果连起来。乘正数只是把数轴拉长或压短，左右顺序不变；乘负数还会把整条数轴绕 0 翻个面（正数变负、负数变正），原来在左边的跑到右边，连线交叉，所以<strong>不等号要翻过来</strong>。m = 0 时两个数都变成 0，变成相等。记录图记下你试过的每个 m：纵轴是「乘完后右边的数减左边的数」，在 0 上方说明仍是 <，在 0 下方说明变成了 >。',
    m3Label: '两边都乘 m',
    c3top: '原来：−1 < 2', c3bot: '两边都乘 {m} 以后', c3chart: '乘完后：2 × m − (−1) × m',
    s3lgKeep: '差为正：仍是 <', s3lgFlip: '差为负：变成 >',
    s3readout: '(−1) × {mp} = {p}，2 × {mp} = {q}：{p} {rel} {q}。',
    s3keep: '乘正数，不等号方向不变。',
    s3flip: '乘负数，左右颠倒：不等号要从 < 翻成 >。',
    s3zero: '乘 0，两个数都变成 0，变成相等，没法再比谁大。',
    s3hint: '观察顺序：把 m 从 3 慢慢拖到 −3：m 越过 0 的那一下，下面两点先重合，然后交换左右、连线交叉；记录图上的点也从 0 的上方跑到下方。除以 m 就是乘以 1/m，所以除以负数也要翻。',

    s4k: '第 4 步 · 解一次不等式',
    s4t: '怎样解 a·x + b < c 这类不等式？',
    s4e: '这一步要回答：a·x + b 和 c 比大小（a、b、c 是给定的数），解集是哪一段？办法和解方程一样，只多一条规矩：① 两边减 b，方向不变（第 2 步）；② 两边除以 a，a 是正数方向不变，a 是负数方向翻转（第 3 步）。上图把左边 a·x + b 画成直线、把 c 画成水平虚线，直线上满足条件的部分（绿色）正下方就是解集；下图把<strong>解集</strong>（所有能让不等式成立的 x）画在数轴上，实心 / 空心圆表示端点是不是解。再拖「检验点」代入，看算出的真假和它在不在阴影里是否一致。',
    a4Label: '系数 a', b4Label: '常数 b', c4Label: '右边 c', x4Label: '检验点 x',
    c4top: '直线 y = {lhs} 与水平线 y = {c}', c4bot: '解集画在数轴上',
    s4lgLine: '直线 y = a·x + b', s4lgC: '水平线 y = c', s4lgGood: '满足条件的部分 / 解集', s4lgTest: '检验点',
    s4L1: '原式：{lhs} {op} {c}',
    s4L2: '两边减 {bp}：{ax} {op} {r}（方向不变）',
    s4L3pos: '两边除以 {a}（正数）：x {op2} {bound}（方向不变）',
    s4L3neg: '两边除以 {a}（负数）：x {op2} {bound}（方向翻转）',
    s4zeroAll: 'a = 0：左边恒等于 {b}，而 {b} {op} {c} 成立，所以任何 x 都是解。',
    s4zeroNone: 'a = 0：左边恒等于 {b}，而 {b} {op} {c} 不成立，所以没有解。',
    s4test: '检验 x = {x}：{lhsx} = {v}，{v} {op} {c} {tf}；x = {x} {io}阴影里，两者一致。',
    inYes: '在', inNo: '不在',
    s4hint: '观察顺序：先保持 a = 2，拖 b 和 c，看端点怎样移动；再把 a 拖成负数，看直线变成下坡、绿色部分换到另一边、算式第三行出现「方向翻转」。最后把 a 拖到 0：直线变成水平，要么处处满足、要么处处不满足。',

    s5k: '第 5 步 · 整数解',
    s5t: '预算有限，最多能买几本？',
    s5e: '这一步要回答：班里用 M 元网购笔记本，每本 p 元，另付运费 s 元（不管买几本都只付一次），最多能买几本？设买 n 本，花的钱不能超过预算：p·n + s ≤ M。按第 4 步解出 n ≤ (M − s) ÷ p。但本数只能是 0、1、2……这样的整数，所以答案是解集里<strong>最大的整数</strong>：向下取整，不是四舍五入。数轴上阴影是不等式的解集，圆点是整数本数：绿色买得起，红色买不起。',
    M5Label: '预算 M（元）', p5Label: '单价 p（元/本）', s5Label: '运费 s（元）',
    c5top: '花费 = 运费 + 本数 × 单价（最多能买的本数）', c5bot: '本数 n：阴影是解集，圆点是整数',
    s5lgShip: '运费', s5lgBooks: '笔记本', s5lgBudget: '预算线 M', s5lgInt: '买得起的整数本数', s5lgNext: '虚线框：再多买一本',
    s5readout: '{p}·n + {s} ≤ {M} → n ≤ ({M} − {s}) ÷ {p} = {b}。n 只能取整数，所以最多买 {n} 本，花 {cost} 元，剩 {left} 元。',
    s5round: '注意：{b} 四舍五入是 {r}，可买 {r} 本要 {rc} 元，超出预算。',
    s5none: '预算 {M} 元连运费 {s} 元都不够，一本也买不了：解集里没有 0 或正整数。',
    s5hint: '观察顺序：先把单价 p 来回拖，看阴影右端怎样移动、绿点个数怎样变；再试 M = 60、p = 7、s = 5，这时 (M − s) ÷ p 的小数部分大于 0.5，读数会说明为什么不能四舍五入。',

    s6k: '第 6 步 · 收束',
    s6t: '不等式和方程，差在哪里？',
    s6fin: '不等式的解通常不是一个数，而是数轴上的一段。画<strong>解集</strong>时，端点用实心圆（≤、≥，端点是解）或空心圆（<、>，端点不是解）。解法和方程几乎一样，只有一条新规矩：两边同乘或同除一个负数时，不等号要翻转。实际问题里还要看未知数能取哪些值，比如本数只能是整数。',
    formula: '若 a < b，则 a + c < b + c\n若 a < b 且 m > 0，则 m·a < m·b\n若 a < b 且 m < 0，则 m·a > m·b',
    boundary: '适用范围：本页只讲含一个未知数的一次不等式（未知数不在分母里、不带绝对值、没有平方），不讲不等式组。滑杆按固定步长取值；第 0 步假设重量不为负，第 5 步假设本数是 0 或正整数、运费只付一次。',
    linksTitle: '接着去哪',
    lk1: '→ 方程与天平：两边同加同减，天平不倒（第 1 步）',
    lk2: '→ 方程与天平：两边同乘同除（第 2 步）——等号不存在「翻号」',
    lk3: '→ 负数：用温度计比大小（第 1 步）——为什么 −3 < −1',
    lk4: '→ 一次函数：两条线相遇（第 3 步）——第 4 步里直线和水平线的交点',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《不等式 · 天平倾斜，答案是一整段》的平行版本。'
  },
  en: {
    pageTitle: 'Inequalities · One Limit, a Whole Range of Answers',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Inequalities · A Tilted Scale Has a Whole Range of Answers →',
    navLabel: 'Inequality steps',
    tagline: 'An equation asks which number makes two sides exactly equal; an inequality asks which numbers keep one side at most, or at least, the other. The answer is usually not one number but a whole stretch of the number line. Starting from a suitcase, this page shows how to draw that stretch, which moves keep an inequality true, why multiplying by a negative flips the sign, and how to answer a budget question in whole numbers.',
    nav0: '0 One Limit', nav1: '1 End Points', nav2: '2 Add & Subtract', nav3: '3 Negative Factors', nav4: '4 Solve Linear', nav5: '5 Whole Numbers', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Inequalities and solution sets',
    s0t: 'How much more can the suitcase take?',
    s0e: 'This step asks: an empty suitcase weighs 3 kg, and the airline allows at most 10 kg in total. If you pack x kg of things, which values of x are allowed? “At most” is written <strong>≤</strong> (“less than or equal to”), so the rule is 3 + x ≤ 10. A statement that links two sides with <, ≤, > or ≥ is an <strong>inequality</strong>. A number that makes it true is a <strong>solution</strong>, and all the solutions together form the <strong>solution set</strong>. Drag x: the bar at the top shows the total weight against the 10 kg limit; the number line below keeps every x you try, green if it works and red if it does not.',
    x0Label: 'Weight packed x (kg)', try0: 'Try every value from 0 to 12', clr0: 'Clear the tried points',
    c0top: 'Scale: suitcase 3 kg + packed x kg', c0bot: 'Number line: the values of x tried',
    s0lgOk: 'True (a solution)', s0lgNo: 'False', s0lgLimit: '10 kg limit',
    s0readout: 'x = {x}: 3 + {x} = {s}, and {s} {rel} 10, so 3 + x ≤ 10 is {verdict}. Tried {k} values: {g} true, {r} false.',
    yes: 'true', no: 'false',
    s0all: 'Every value from 0 to 12 in steps of 0.5 has been tried: the true ones fill the stretch from 0 to {m} (including {m}), and everything to the right of {m} is false. The answer is not one number but a whole stretch.',
    s0hint: 'What to watch: drag x slowly to the right from 0 and notice when the bar crosses the limit line and the dots turn from green to red. Then press “Try every value from 0 to 12” and watch the green dots join into a stretch. Weights cannot be negative, so x starts at 0 here.',

    s1k: 'Step 1 · End points',
    s1t: 'Is the only difference between x < 7 and x ≤ 7 a single point?',
    s1e: 'This step asks: when the solution set goes on a number line, does the end point belong to it? The <strong>solution set</strong> (every number that makes the inequality true) is a stretch of the line, shown shaded. As for the end point a itself: if the sign includes “equal” (≤ or ≥), a is a solution and gets a <strong>filled dot</strong>; if not (< or >), a is not a solution and gets an <strong>open dot</strong>. The second line zooms in on the end point 10, 100 or 1000 times, so you can check whether the numbers right next to it are solutions.',
    opLabel: 'Sign', a1Label: 'End point a', z1Label: 'Zoom',
    c1top: 'Solution set: x {op} {a}', c1bot: 'Zoomed in {z}× around the end point',
    s1lgShade: 'Shading = solution set', s1lgSolid: 'Filled dot: end point is a solution', s1lgHollow: 'Open dot: end point is not',
    s1readout: 'The end point {a} {is} a solution, so it gets {shape}. Zoomed in {z}×, the neighbour {p} is a solution ({p} {op} {a}).',
    isYes: 'is', isNo: 'is not', solid: 'a filled dot', hollow: 'an open dot',
    s1noMax: 'Numbers even closer to {a} (such as {p2}) are still solutions, yet {a} itself is not: x {op} {a} has no largest solution.',
    s1noMin: 'Numbers even closer to {a} (such as {p2}) are still solutions, yet {a} itself is not: x {op} {a} has no smallest solution.',
    s1hasMax: '{a} itself is a solution, so x {op} {a} has a largest solution: {a}.',
    s1hasMin: '{a} itself is a solution, so x {op} {a} has a smallest solution: {a}.',
    s1hint: 'What to watch: switch back and forth between ≤ and <. Only the dot at the end changes, filled or open; the shading stays put. Then drag the zoom to 1000 and see that the tick right next to the end point is still inside the shading. Pick > or ≥ and the shading moves to the right.',

    s2k: 'Step 2 · Adding and subtracting',
    s2t: 'If you add or subtract the same number on both sides, does the sign change?',
    s2e: 'This step asks: we know 2 < 5. Add the same number c to both sides. Is the order still the same? The top line holds the two original numbers and the bottom line the results after adding c, with a link from each number to its result. Adding c slides every point c to the right (to the left if c is negative). Both points slide together, so the links are all parallel and equally long: the left one stays on the left and the gap between them stays the same. So adding (or subtracting) the same number on both sides <strong>keeps the sign the same way round</strong>. That is how step 0 is solved: take 3 from both sides of 3 + x ≤ 10 and you get x ≤ 7.',
    c2Label: 'Add c to both sides (negative means subtract)',
    c2top: 'Before: 2 < 5', c2bot: 'After adding {c} to both sides',
    s2lgPair: 'The two numbers', s2lgTrail: 'Other values of c tried',
    s2readout: '2 + {cp} = {p} and 5 + {cp} = {q}: {p} {rel} {q}. The sign is unchanged and the two numbers are still {gap} apart.',
    s2hint: 'What to watch: drag c from −6 to 6. The two points below slide together and the links stay parallel; the readout keeps saying < and the gap stays 3. The faint dots on the lower line are the other values of c you have tried.',

    s3k: 'Step 3 · Multiplying by a negative',
    s3t: 'Why does multiplying both sides by a negative number flip the sign?',
    s3e: 'This step asks: we know −1 < 2. What happens if both sides are multiplied by the same number m? The top line holds the two original numbers and the bottom line the results, with a link from each number to its result. Multiplying by a positive number only stretches or squashes the line, so the order stays. Multiplying by a negative number also flips the whole line over at 0 (positives become negative and negatives positive): the left number ends up on the right, the links cross, and <strong>the sign has to be turned round</strong>. At m = 0 both numbers become 0 and are equal. The record chart keeps every m you try: its height is “the right number minus the left number after multiplying”, above 0 if the order is still <, below 0 if it has become >.',
    m3Label: 'Multiply both sides by m',
    c3top: 'Before: −1 < 2', c3bot: 'After multiplying both sides by {m}', c3chart: 'After multiplying: 2 × m − (−1) × m',
    s3lgKeep: 'Positive difference: still <', s3lgFlip: 'Negative difference: now >',
    s3readout: '(−1) × {mp} = {p} and 2 × {mp} = {q}: {p} {rel} {q}.',
    s3keep: 'Multiplying by a positive number keeps the sign the same way round.',
    s3flip: 'Multiplying by a negative number swaps left and right: < has to become >.',
    s3zero: 'Multiplying by 0 turns both numbers into 0; they are equal and neither is bigger.',
    s3hint: 'What to watch: drag m slowly from 3 down to −3. The moment m passes 0, the two points below meet, then swap sides and the links cross; on the record chart the dots move from above 0 to below it. Dividing by m is the same as multiplying by 1/m, so dividing by a negative flips the sign too.',

    s4k: 'Step 4 · Solving linear inequalities',
    s4t: 'How do you solve something like a·x + b < c?',
    s4e: 'This step asks: compare a·x + b with c (a, b and c are given numbers). Which stretch is the solution set? Solve it just like an equation, with one extra rule: ① subtract b from both sides, which keeps the sign (step 2); ② divide both sides by a, which keeps the sign if a is positive and flips it if a is negative (step 3). The top picture draws the left side a·x + b as a line and c as a dashed level line; the part of the line that satisfies the inequality (green) sits right above the solution set. The bottom picture shows the <strong>solution set</strong> (every x that makes it true) on a number line, with a filled or open dot for whether the end point counts. Drag the test point and check that its true/false result matches whether it lies in the shading.',
    a4Label: 'Coefficient a', b4Label: 'Constant b', c4Label: 'Right side c', x4Label: 'Test point x',
    c4top: 'Line y = {lhs} and level line y = {c}', c4bot: 'Solution set on the number line',
    s4lgLine: 'Line y = a·x + b', s4lgC: 'Level line y = c', s4lgGood: 'Part that works / solution set', s4lgTest: 'Test point',
    s4L1: 'Start: {lhs} {op} {c}',
    s4L2: 'Subtract {bp} from both sides: {ax} {op} {r} (sign unchanged)',
    s4L3pos: 'Divide both sides by {a} (positive): x {op2} {bound} (sign unchanged)',
    s4L3neg: 'Divide both sides by {a} (negative): x {op2} {bound} (sign flipped)',
    s4zeroAll: 'a = 0: the left side is always {b}, and {b} {op} {c} is true, so every x is a solution.',
    s4zeroNone: 'a = 0: the left side is always {b}, and {b} {op} {c} is false, so there is no solution.',
    s4test: 'Test x = {x}: {lhsx} = {v}, and {v} {op} {c} is {tf}; x = {x} {io} the shading, so the two agree.',
    inYes: 'lies in', inNo: 'lies outside',
    s4hint: 'What to watch: keep a = 2 and drag b and c to see the end point move. Then make a negative: the line slopes down, the green part jumps to the other side, and the third line of working says “sign flipped”. Finally drag a to 0: the line goes flat and either every x works or none does.',

    s5k: 'Step 5 · Whole-number answers',
    s5t: 'With a fixed budget, how many can you buy?',
    s5e: 'This step asks: a class has M yuan to order notebooks online at p yuan each, plus a delivery charge of s yuan (paid once, however many you buy). How many notebooks at most? If you buy n, the spending must not exceed the budget: p·n + s ≤ M. As in step 4, this gives n ≤ (M − s) ÷ p. But you can only buy 0, 1, 2, … notebooks, so the answer is the <strong>largest whole number</strong> in the solution set: round down, never to the nearest. On the number line the shading is the solution set of the inequality and the dots are whole numbers of notebooks: green if affordable, red if not.',
    M5Label: 'Budget M (yuan)', p5Label: 'Price p (yuan each)', s5Label: 'Delivery s (yuan)',
    c5top: 'Cost = delivery + notebooks × price (for the most you can buy)', c5bot: 'Notebooks n: shading is the solution set, dots are whole numbers',
    s5lgShip: 'Delivery', s5lgBooks: 'Notebooks', s5lgBudget: 'Budget line M', s5lgInt: 'Affordable whole numbers', s5lgNext: 'Dashed box: one more notebook',
    s5readout: '{p}·n + {s} ≤ {M} → n ≤ ({M} − {s}) ÷ {p} = {b}. n must be a whole number, so you can buy at most {n}, spending {cost} yuan with {left} yuan left.',
    s5round: 'Careful: {b} rounds to {r}, but {r} notebooks would cost {rc} yuan, over budget.',
    s5none: 'A budget of {M} yuan does not even cover the {s} yuan delivery, so you cannot buy any: the solution set holds no whole number from 0 up.',
    s5hint: 'What to watch: drag the price p back and forth and watch the right end of the shading move and the number of green dots change. Then try M = 60, p = 7, s = 5: here (M − s) ÷ p has a decimal part above 0.5, and the readout explains why rounding to the nearest would go wrong.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What makes an inequality different from an equation?',
    s6fin: 'An inequality usually has a whole stretch of the number line as its answer, not a single number. When you draw the <strong>solution set</strong>, the end point gets a filled dot (≤, ≥: it is a solution) or an open dot (<, >: it is not). Solving works almost exactly like an equation, with one new rule: multiplying or dividing both sides by a negative number flips the sign. In real problems also check which values the unknown may take; a number of notebooks, for example, must be whole.',
    formula: 'if a < b, then a + c < b + c\nif a < b and m > 0, then m·a < m·b\nif a < b and m < 0, then m·a > m·b',
    boundary: 'Where this holds: only first-degree inequalities in one unknown (no unknown in a denominator, no absolute values, no squares), and no systems of inequalities. Sliders move in fixed steps; step 0 assumes weights are not negative, and step 5 assumes the number of notebooks is a whole number from 0 up and delivery is paid once.',
    linksTitle: 'Where next',
    lk1: '→ Equations as a balance: add or subtract on both sides and it stays level (step 1)',
    lk2: '→ Equations as a balance: multiply or divide both sides (step 2) — an equals sign never flips',
    lk3: '→ Negative numbers: comparing on a thermometer (step 1) — why −3 < −1',
    lk4: '→ Linear functions: where two lines meet (step 3) — the crossing of the line and the level line in step 4',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Inequalities · A Tilted Scale Has a Whole Range of Answers”.'
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
