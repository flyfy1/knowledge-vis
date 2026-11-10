'use strict';
// Permutations & combinations lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '排列与组合 · 先乘，再看要不要除',
    back: '← 知识索引',
    compare: '对照另一版本：排列与组合 · 数清楚有多少种 →',
    navLabel: '排列与组合步骤导航',
    tagline: '「有多少种」是概率的地基：在每种情况机会相等时，概率 = 想要的情况数 ÷ 全部情况数。这一页从一张路线图开始，学会分步相乘；再用同一个乘法数排队、数「选几个排成一列」；然后看清排列和组合只差一件事——顺序算不算数，算就不除，不算就除以 k!；最后用它算出一个反直觉的答案：23 个人里，有两人同一天生日的机会已经超过一半。',
    nav0: '0 分步相乘', nav1: '1 全排列', nav2: '2 选 k 个排列', nav3: '3 组合', nav4: '4 顺序算不算', nav5: '5 生日问题', nav6: '6 收束',

    s0k: '第 0 步 · 乘法原理',
    s0t: '从 A 到 D 要过三段路，一共有多少条路线？',
    s0e: '这一步要回答：从 A 城到 B 城有 a 条路，B 到 C 有 b 条，C 到 D 有 c 条，走完全程一共有多少条不同的路线？图的上半部分是路线图，小圆圈里的数字是路的编号。下半部分是<strong>路线树</strong>：从顶点出发，第一层分出 a 个枝（第 1 段走哪条），每个枝再分出 b 个（第 2 段），再各分出 c 个（第 3 段）；最底下每片叶子就是一条完整路线。不管第 1 段选了哪条，第 2 段都还有 b 种选法，所以叶子数 = a × b × c。这叫<strong>乘法原理</strong>：一件事分几步完成，每一步的选法个数不受前面选了什么影响，总方法数就是各步选法数相乘。',
    s0lgRoute: '当前路线', s0lgDone: '已列出的路线', s0lgRoad: '其他路',
    legA: 'A → B 的路数 a', legB: 'B → C 的路数 b', legC: 'C → D 的路数 c',
    nextRoute: '下一条路线', listRoutes: '逐条列出所有路线',
    c0map: '路线图（小圆圈里是路的编号）',
    c0tree: '路线树：每片叶子是一条路线，共 {N} 片',
    s0readout: 'A→B 有 {a} 条，B→C 有 {b} 条，C→D 有 {c} 条，路线数 = {a} × {b} × {c} = {N}。当前是第 {i} 条：依次走 {x} 号、{y} 号、{z} 号路；已列出 {m}/{N} 条。',
    s0hint: '观察顺序：先按「逐条列出所有路线」：路线图上亮起的三段路一组组变化，路线树的叶子从左到右逐个点亮，最后点亮的个数正好是 a × b × c。再只拖一个滑杆，比如把 c 从 4 改成 2：第 2 层的每个枝下面都少了 2 片叶子，总数减半。改滑杆会从第 1 条重新开始。',

    s1k: '第 1 步 · 全排列',
    s1t: 'n 个人排成一排，有多少种排法？',
    s1e: '这一步要回答：n 个人（用不同颜色的方块表示，字母见图例）站成一排，有多少种不同的顺序？把它看成按位置一步步选人：第 1 个位置有 n 个人可选；选定之后，第 2 个位置只剩 n − 1 个；……最后一个位置只剩 1 个。每一步有几种选法只和前面选了几个有关、和选了谁无关，所以按乘法原理相乘：n × (n − 1) × … × 2 × 1。这个积记作 <strong>n!</strong>，读作「n 的<strong>阶乘</strong>」。上方方框里的数是每个位置的可选人数。n ≤ 4 时下方列出全部排法；n 更大时排法多得列不完，下方改画 n! 的增长（纵轴用<strong>对数刻度</strong>：每往上一格乘以 100）。',
    peopleSlider: '人数 n', play1: '逐个排出所有排法（n ≤ 4）',
    c1seats: '每个位置还有几个人可选（从左往右依次选）',
    c1list: '全部 {N} 种排法（每一小条是一种顺序）',
    c1growth: 'n! 增长得有多快（纵轴对数刻度）',
    c1axis: '人数 n',
    s1readout: '{n} 个人排成一排：{prod} = {N} 种。',
    s1listed: '下方列出了全部 {N} 种，已排出 {s} 种。',
    s1tooMany: '{N} 种已经列不完，下方只画数量的增长。',
    s1hint: '观察顺序：先保持 n = 3，按「逐个排出所有排法」：6 小条一条条亮起，数一数，正好 3 × 2 × 1。再把 n 拖到 4：24 条；拖到 8：已有 40320 种；10 人有 3,628,800 种。人数每加 1，种数就再乘上新的人数，所以越长越快。',

    s2k: '第 2 步 · 选 k 个排成一列',
    s2t: 'n 个人里选 k 个排成一列，有几种？',
    s2e: '这一步要回答：不是全部人都上场，只从 n 人里选 k 人排成一列（例如选 3 人站上领奖台的金、银、铜位置），有多少种？仍然按位置一步步选：n × (n − 1) × …，乘到第 k 个位置为止，即 n × (n − 1) × … × (n − k + 1)。这叫从 n 个中取 k 个的<strong>排列数</strong>，记作 <strong>A(n, k)</strong>（课本上写作 A 的下标 n、上标 k，也有书写作 P(n, k)）。另一种写法：把 n 个位置全排好有 n! 种，但我们只关心前 k 个位置，后面 n − k 个位置怎么排都算同一种，于是每种被重复数了 (n − k)! 次，所以 A(n, k) = n! ÷ (n − k)!。青色方框是用到的 k 个位置，灰色是被「砍掉」的部分。',
    s2lgUsed: '用到的 k 个位置', s2lgCut: '被砍掉的 n − k 个位置',
    seatsSlider: '位置数 k',
    c2title: '{n} 人中选 {k} 人排成一列',
    c2used: '青色：前 {k} 个位置的可选人数相乘 = {A}',
    c2cut: '灰色：剩下 {r} 个位置的排法 {r}! = {F}',
    c2all: '全部 {n} 个位置：{n}! = {F}',
    c2eq: 'A({n}, {k}) = {n}! ÷ {r}! = {F} ÷ {G} = {A}',
    emptyProd: '1（一个也不选，只有「不选」这一种）',
    s2readout: 'A({n}, {k}) = {prod} = {A}，也等于 {n}! ÷ {r}! = {F} ÷ {G}。',
    s2zero: 'k = n 时剩下 0 个位置，规定 0! = 1，于是 A(n, n) = n!，回到上一步。',
    s2hint: '观察顺序：保持 n = 8，把 k 从 0 拖到 8：青色方框一个个变多，A(8, k) 依次是 1、8、56、336、1680、6720、20160、40320、40320；最后两个相等，因为排好 7 个位置后，最后一个位置只剩 1 人可选。再拖 n，确认「全部 n! ÷ 砍掉的 (n − k)!」总等于青色方框里的数之积。',

    s3k: '第 3 步 · 组合',
    s3t: '只选人、不排顺序，为什么要除以 k!？',
    s3e: '这一步要回答：如果只关心「选了哪几个人」、不关心顺序（例如选 3 人组成一个小组），有多少种？先照上一步把有顺序的选法全部列出：每一条方块就是一种有先后的选法，共 A(n, k) 条。再按「选了谁」把它们归到一起：同一群 k 个人能排出 k! 种顺序，所以每一组恰好有 k! 条。组的个数就是不计顺序的选法数，叫<strong>组合数</strong>，记作 <strong>C(n, k)</strong>：C(n, k) = A(n, k) ÷ k!。',
    pickSlider: '选几个人 k',
    group3: '按「选了谁」归组', ungroup3: '恢复按顺序排列',
    c3ordered: '有顺序的选法：共 {A} 种（每条是一种）',
    c3grouped: '归组后：{C} 组，每组 {kf} 种顺序',
    s3readout: 'n = {n}，k = {k}：有顺序的选法 A = {A} 种；同一群人有 {kf} 种顺序，所以 C({n}, {k}) = {A} ÷ {kf} = {C}。',
    s3ordered: '现在按选出的先后排列，按「归组」看分组。',
    s3grouped: '现在每个框是同一群人，框里正好 {kf} 条。',
    s3hint: '观察顺序：先保持 n = 5、k = 3，按「按「选了谁」归组」：60 条方块移动到 10 个框里，每框 6 条，颜色相同、只是顺序不同。再把 k 改成 2：每框 2 条；k = 1 时每框 1 条，排列和组合一样多。改 n 或 k 会回到按顺序排列。',

    s4k: '第 4 步 · 顺序算不算',
    s4t: '换个顺序算不算另一种？先判断，再计算',
    s4e: '这一步要回答：遇到一道计数题，怎样决定用 A(n, k) 还是 C(n, k)？只问一句：<strong>把选出来的人（或物）换个顺序，算不算另一种结果？</strong>算，就是<strong>排列</strong>，用 A(n, k)；不算，就是<strong>组合</strong>，用 C(n, k) = A(n, k) ÷ k!。点一个情景，选「顺序算数」或「顺序不算数」，再按「核对」。下方条形图同时画出这个情景的 A 和 C：同样的 n、k，两者之比永远是 k!。',
    sc0btn: '情景 1 · 正副班长', sc1btn: '情景 2 · 两名代表', sc2btn: '情景 3 · 单循环赛', sc3btn: '情景 4 · 主客场', sc4btn: '情景 5 · 领奖台', sc5btn: '情景 6 · 五张手牌',
    sc0q: '10 名同学里选出班长和副班长各 1 人，有多少种选法？',
    sc1q: '10 名同学里选 2 人去参加会议（两人身份相同），有多少种选法？',
    sc2q: '5 支球队打单循环，每两队之间只赛一场，一共要赛几场？',
    sc3q: '5 支球队打主客场双循环，每两队在各自主场各赛一场，一共几场？',
    sc4q: '8 人赛跑，前三名分别得金、银、铜牌，颁奖结果有多少种？',
    sc5q: '从一副 52 张的扑克牌里抓 5 张作为手牌（手牌不分先后），有多少种不同的手牌？',
    sc0why: '甲当班长、乙当副班长，和乙当班长、甲当副班长是两种结果：顺序（职位）算数。',
    sc1why: '选出甲和乙，与选出乙和甲是同一组代表：顺序不算数。',
    sc2why: '甲对乙和乙对甲是同一场比赛：顺序不算数。',
    sc3why: '甲主场对乙、乙主场对甲是两场不同的比赛：顺序（谁是主场）算数。',
    sc4why: '甲金乙银与乙金甲银是不同的颁奖结果：顺序算数。',
    sc5why: '要紧的是手里是哪 5 张，抓牌的先后不改变手牌：顺序不算数。',
    ordYes: '顺序算数（排列）', ordNo: '顺序不算数（组合）',
    check: '核对',
    c4aria: '有顺序与无顺序的数量对比',
    c4title: 'n = {n}，k = {k}：有顺序 vs 无顺序',
    c4A: '有顺序 A({n}, {k}) = {v}',
    c4C: '无顺序 C({n}, {k}) = {v}',
    c4ratio: '两条长度之比 = {k}! = {kf}（同一组的顺序数）',
    s4lgA: '有顺序：A(n, k)', s4lgC: '无顺序：C(n, k)',
    s4readout: '已判断对 {c}/6 个情景。',
    pickFirst: '先选一个答案，再按「核对」。',
    right: '对！', notQuite: '再想想。',
    ansA: '答案：A({n}, {k}) = {v}。', ansC: '答案：C({n}, {k}) = {v}。',
    s4hint: '观察顺序：先读题，问自己「换个顺序算不算另一种」，再选答案、核对，条形图会高亮正确的一条。对照情景 3 和情景 4：同样是 5 支队、每次挑 2 队，单循环是 C(5, 2) = 10 场，主客场是 A(5, 2) = 20 场，正好差 2! = 2 倍；情景 6 的两条差 5! = 120 倍。',

    s5k: '第 5 步 · 生日问题',
    s5t: '一个班多少人，就更可能有两人同一天生日？',
    s5e: '这一步要回答：班上有 n 人，至少两人同一天生日的概率是多少？假设一年 365 天（不算 2 月 29 日），每人的生日落在每一天的机会相等、彼此独立——这是<strong>等可能</strong>模型：每种情况机会相同，所以概率 = 想要的情况数 ÷ 全部情况数。正面数「至少两人同一天」很麻烦，改算它的<strong>对立事件</strong>（两件事恰好一件发生）：「所有人生日都不同」。全部情况：每人 365 种，共 365 的 n 次方种；全都不同：第 1 人 365 种，第 2 人 364 种……正是排列数 A(365, n)。所以 P(至少两人同一天) = 1 − A(365, n) ÷ 365ⁿ。青色曲线是这个公式；白点是电脑模拟 100 个班的结果（伪随机数，每按一次换一批新的班）。',
    s5lgCurve: '公式：至少两人同一天生日的概率', s5lgSim: '模拟：100 个班中出现同生日的比例', s5lgHalf: '50%',
    classSlider: '班级人数 n', sim5: '模拟 100 个班', clear5: '清除模拟点',
    c5title: '至少两人同一天生日的概率（随班级人数 n）',
    c5axis: '班级人数 n',
    s5readout: 'n = {n}：全都不同的概率 = {top} ÷ 365 的 {n} 次方 = {q}；至少两人同一天 = 1 − {q} = {p}（{pc}）。这个班一共有 C({n}, 2) = {pairs} 对人，每一对都可能撞上。',
    s5sim: '模拟 100 个 {n} 人的班：其中 {h} 个班出现了同生日。',
    s5hint: '观察顺序：把 n 从 2 往右拖，看青色曲线：到 n = 23 时第一次越过橙色虚线（50.7%），到 n = 57 时已达 99.0%。直觉之所以出错，是因为要比的不是「有没有人和我同一天」，而是任何一对人：23 人就有 253 对。再在几个 n 上按「模拟 100 个班」，白点散落在曲线附近（每次只有 100 个班，偏差几个百分点很正常）。',

    s6k: '第 6 步 · 收束',
    s6t: '先乘，再问要不要除',
    s6fin: '分步完成的事，各步选法数相乘（<strong>乘法原理</strong>，第 0 步）。n 个人全排：n!（第 1 步）；选 k 个排成一列：A(n, k) = n! ÷ (n − k)!（第 2 步）。只选不排：同一群人的 k! 种顺序算一种，所以 C(n, k) = A(n, k) ÷ k!（第 3 步）。用哪个，只看「换个顺序算不算另一种」（第 4 步）。在等可能模型里，数清楚情况数就能算概率，有时先算对立事件更省事（第 5 步）。',
    formula: '乘法原理：总数 = 各步选法数之积\nn! = n × (n−1) × … × 1，规定 0! = 1\nA(n, k) = n!/(n−k)!，C(n, k) = A(n, k)/k! = n!/(k!(n−k)!)',
    boundary: '适用条件：乘法原理要求每一步的选法个数不受前面选择的影响（选项可以不同，个数要相同）；排列、组合都假设对象互不相同、不重复选取。生日问题假设 365 天等可能且相互独立；真实的生日在各月份并不均匀（这会让撞生日稍微更容易），也有 2 月 29 日。模拟用的是固定种子的伪随机数，不是真实班级的数据。',
    linksTitle: '接着去哪',
    lk1: '→ 数与组合页第 2 步：不重复计数，顺序不重要时除掉重复排列',
    lk2: '→ 二项分布到正态页第 0 步：钉板上数路径，数出杨辉三角和 C(n, k)',
    lk3: '→ 蒙特卡洛页第 1 步：用大量模拟的比例估计概率',
    lk4: '→ 遗传概率页第 1 步：在 Punnett 方格里数等可能的组合',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《排列与组合 · 数清楚有多少种》的平行版本。'
  },
  en: {
    pageTitle: 'Permutations & Combinations · Multiply First, Then Ask Whether to Divide',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Permutations & Combinations · Counting How Many Ways →',
    navLabel: 'Permutations and combinations steps',
    tagline: '“How many ways?” is the foundation of probability: when every outcome is equally likely, probability = favourable outcomes ÷ all outcomes. This page starts with a road map to learn counting by multiplying stages; uses the same multiplication to count line-ups and “choose some and line them up”; then shows that permutations and combinations differ in one thing only — whether order counts, in which case you keep the product, or not, in which case you divide by k!; and ends with a surprising answer: with just 23 people, the chance that two share a birthday is already above one half.',
    nav0: '0 Multiply stages', nav1: '1 Line everyone up', nav2: '2 Line up k', nav3: '3 Combinations', nav4: '4 Does order count?', nav5: '5 Birthdays', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The multiplication principle',
    s0t: 'Three legs from A to D: how many routes are there?',
    s0e: 'The question here: there are a roads from town A to B, b roads from B to C, and c roads from C to D. How many different routes run all the way? The top half of the picture is the road map; the numbers in the small circles label the roads. The bottom half is a <strong>route tree</strong>: from the top node, the first level splits into a branches (which road for leg 1), each of those splits into b (leg 2), and each of those into c (leg 3); every leaf at the bottom is one complete route. Whichever road you took on leg 1, leg 2 still offers b choices, so the number of leaves is a × b × c. This is the <strong>multiplication principle</strong>: when a task is done in stages and the number of choices at each stage does not depend on what was chosen before, the total number of ways is the product of the choices at each stage.',
    s0lgRoute: 'current route', s0lgDone: 'routes already listed', s0lgRoad: 'other roads',
    legA: 'Roads A → B, a', legB: 'Roads B → C, b', legC: 'Roads C → D, c',
    nextRoute: 'Next route', listRoutes: 'List every route',
    c0map: 'Road map (numbers in circles label the roads)',
    c0tree: 'Route tree: each leaf is one route, {N} leaves',
    s0readout: '{a} roads A→B, {b} roads B→C, {c} roads C→D, so routes = {a} × {b} × {c} = {N}. Showing route {i}: roads {x}, {y} and {z} in turn; {m}/{N} listed so far.',
    s0hint: 'What to try: press “List every route”. On the map, the three lit roads change set by set, while the leaves of the tree light up from left to right; the final count is exactly a × b × c. Then move just one slider, say c from 4 to 2: every second-level branch loses 2 leaves and the total halves. Moving a slider starts the listing again from route 1.',

    s1k: 'Step 1 · Lining everyone up',
    s1t: 'How many ways can n people stand in a row?',
    s1e: 'The question here: n people (shown as coloured squares; letters in the legend) stand in a row. How many different orders are there? Fill the row one place at a time: the first place can take any of n people; once it is filled, the second place has n − 1 left; …; the last place has just 1. How many choices each place has depends only on how many people have been placed, not on who, so the multiplication principle gives n × (n − 1) × … × 2 × 1. This product is written <strong>n!</strong> and read “n <strong>factorial</strong>”. The boxes at the top show how many people each place can choose from. For n ≤ 4 every order is listed below; for larger n there are far too many to list, so the lower panel plots how n! grows instead (the vertical axis is a <strong>log scale</strong>: each grid line is 100 times the one below).',
    peopleSlider: 'People n', play1: 'Build every order (n ≤ 4)',
    c1seats: 'How many people each place can still choose from (fill left to right)',
    c1list: 'All {N} orders (each strip is one order)',
    c1growth: 'How fast n! grows (log scale)',
    c1axis: 'people n',
    s1readout: '{n} people in a row: {prod} = {N} orders. ',
    s1listed: 'All {N} are listed below; {s} built so far.',
    s1tooMany: '{N} orders are too many to list, so the lower panel shows only how the count grows.',
    s1hint: 'What to try: keep n = 3 and press “Build every order”. Six strips light up one at a time; count them: 3 × 2 × 1. Drag n to 4 for 24 strips; at 8 there are already 40320 orders, and 10 people have 3,628,800. Each extra person multiplies the count by the new number of people, so it grows faster and faster.',

    s2k: 'Step 2 · Lining up k of n',
    s2t: 'Choose k of n people and line them up: how many ways?',
    s2e: 'The question here: not everyone takes part; you pick k of the n people and put them in order (say, three runners on the gold, silver and bronze steps). How many ways? Fill places one at a time as before: n × (n − 1) × …, stopping at the k-th place, which gives n × (n − 1) × … × (n − k + 1). This is the number of <strong>permutations</strong> of k from n, written <strong>A(n, k)</strong> on this page (many English textbooks write P(n, k) or nPr). Another way to see it: all n places can be ordered in n! ways, but only the first k places matter; however the remaining n − k places are arranged, it is the same line-up, so each one was counted (n − k)! times, and A(n, k) = n! ÷ (n − k)!. Cyan boxes are the k places used; grey ones are the part that gets “cut off”.',
    s2lgUsed: 'the k places used', s2lgCut: 'the n − k places cut off',
    seatsSlider: 'Places k',
    c2title: 'Choose {k} of {n} people and line them up',
    c2used: 'Cyan: the choices for the first {k} places multiplied = {A}',
    c2cut: 'Grey: orders of the remaining {r} places, {r}! = {F}',
    c2all: 'All {n} places: {n}! = {F}',
    c2eq: 'A({n}, {k}) = {n}! ÷ {r}! = {F} ÷ {G} = {A}',
    emptyProd: '1 (choosing nobody has exactly one way: choose nobody)',
    s2readout: 'A({n}, {k}) = {prod} = {A}, which also equals {n}! ÷ {r}! = {F} ÷ {G}. ',
    s2zero: 'When k = n, no places remain; by convention 0! = 1, so A(n, n) = n!, which is step 1 again.',
    s2hint: 'What to try: keep n = 8 and drag k from 0 to 8. The cyan boxes grow one by one, and A(8, k) runs 1, 8, 56, 336, 1680, 6720, 20160, 40320, 40320. The last two are equal because once 7 places are filled, the final place has only 1 person left. Then drag n and check that “all n! ÷ the cut-off (n − k)!” always equals the product of the cyan numbers.',

    s3k: 'Step 3 · Combinations',
    s3t: 'Choosing without order: why divide by k!?',
    s3e: 'The question here: if all that matters is who is chosen, not in what order (say, picking three people for a team), how many ways are there? First list every ordered choice as in the last step: each strip of squares is one ordered pick, A(n, k) strips in all. Then gather them by who was chosen: the same k people can be ordered in k! ways, so every group holds exactly k! strips. The number of groups is the number of unordered choices, the <strong>combinations</strong>, written <strong>C(n, k)</strong>: C(n, k) = A(n, k) ÷ k!.',
    pickSlider: 'People chosen k',
    group3: 'Group by who was chosen', ungroup3: 'Back to ordered picks',
    c3ordered: 'Ordered picks: {A} in all (one per strip)',
    c3grouped: 'Grouped: {C} groups of {kf} orders each',
    s3readout: 'n = {n}, k = {k}: there are A = {A} ordered picks; the same people have {kf} orders, so C({n}, {k}) = {A} ÷ {kf} = {C}. ',
    s3ordered: 'The strips are now in the order they were picked; press “Group” to see the groups.',
    s3grouped: 'Each frame now holds one set of people, with exactly {kf} strips inside.',
    s3hint: 'What to try: keep n = 5, k = 3 and press “Group by who was chosen”. The 60 strips move into 10 frames of 6, same colours in different orders. Change k to 2: 2 strips per frame; at k = 1 each frame holds 1, and permutations and combinations are equally many. Changing n or k returns to the ordered picks.',

    s4k: 'Step 4 · Does order count?',
    s4t: 'Does swapping the order give a different outcome? Decide first, then count',
    s4e: 'The question here: faced with a counting problem, how do you choose between A(n, k) and C(n, k)? Ask one thing: <strong>if you swap the order of what was chosen, is it a different outcome?</strong> If yes, it is a <strong>permutation</strong>, A(n, k); if no, a <strong>combination</strong>, C(n, k) = A(n, k) ÷ k!. Pick a scenario, choose “Order counts” or “Order does not count”, then press “Check”. The bar chart below shows both A and C for that scenario: for the same n and k, their ratio is always k!.',
    sc0btn: 'Scenario 1 · Two officers', sc1btn: 'Scenario 2 · Two delegates', sc2btn: 'Scenario 3 · Round robin', sc3btn: 'Scenario 4 · Home and away', sc4btn: 'Scenario 5 · Podium', sc5btn: 'Scenario 6 · Five-card hand',
    sc0q: 'From 10 students, choose a class president and a vice-president. How many ways?',
    sc1q: 'From 10 students, choose 2 to attend a meeting (both in the same role). How many ways?',
    sc2q: '5 teams play a round robin where each pair meets once. How many matches?',
    sc3q: '5 teams play home and away, so each pair meets once at each team’s ground. How many matches?',
    sc4q: '8 runners race and the top three get gold, silver and bronze. How many possible podiums?',
    sc5q: 'Deal 5 cards from a 52-card deck as a hand (the order you receive them does not matter). How many different hands?',
    sc0why: 'Ana as president with Ben as vice is different from Ben as president with Ana as vice: the order (the roles) counts.',
    sc1why: 'Choosing Ana and Ben is the same pair as choosing Ben and Ana: the order does not count.',
    sc2why: 'Ana’s team against Ben’s is the same match as Ben’s against Ana’s: the order does not count.',
    sc3why: 'Ana’s team at home to Ben’s and Ben’s at home to Ana’s are two different matches: the order (who is at home) counts.',
    sc4why: 'Ana gold, Ben silver is a different podium from Ben gold, Ana silver: the order counts.',
    sc5why: 'What matters is which 5 cards you hold; the order of dealing does not change the hand: the order does not count.',
    ordYes: 'Order counts (permutation)', ordNo: 'Order does not count (combination)',
    check: 'Check',
    c4aria: 'Ordered versus unordered counts',
    c4title: 'n = {n}, k = {k}: ordered vs unordered',
    c4A: 'Ordered A({n}, {k}) = {v}',
    c4C: 'Unordered C({n}, {k}) = {v}',
    c4ratio: 'Ratio of the bar lengths = {k}! = {kf} (orders of one group)',
    s4lgA: 'ordered: A(n, k)', s4lgC: 'unordered: C(n, k)',
    s4readout: '{c}/6 scenarios judged correctly.',
    pickFirst: 'Choose an answer first, then press “Check”.',
    right: 'Correct! ', notQuite: 'Think again. ',
    ansA: ' Answer: A({n}, {k}) = {v}.', ansC: ' Answer: C({n}, {k}) = {v}.',
    s4hint: 'What to try: read the question and ask yourself whether swapping the order gives a different outcome, then choose and check; the bar chart highlights the right bar. Compare scenarios 3 and 4: both pick 2 of 5 teams, yet a round robin is C(5, 2) = 10 matches and home-and-away is A(5, 2) = 20, exactly 2! = 2 times as many; in scenario 6 the two bars differ by 5! = 120 times.',

    s5k: 'Step 5 · The birthday problem',
    s5t: 'How big must a class be before a shared birthday is more likely than not?',
    s5e: 'The question here: in a class of n people, what is the probability that at least two share a birthday? Assume a 365-day year (ignoring 29 February), with each birthday equally likely to fall on any day and independent of the others. That is an <strong>equally likely</strong> model, so probability = favourable outcomes ÷ all outcomes. Counting “at least two share” directly is messy, so count its <strong>complement</strong> (the event that happens exactly when the first does not): “all birthdays differ”. All outcomes: 365 choices per person, 365 to the power n in total. All different: 365 for the first person, 364 for the second, …, which is exactly A(365, n). So P(at least two share) = 1 − A(365, n) ÷ 365ⁿ. The cyan curve is this formula; white dots are simulations of 100 classes (pseudo-random; each press draws a fresh batch).',
    s5lgCurve: 'formula: probability at least two share', s5lgSim: 'simulation: share of 100 classes with a match', s5lgHalf: '50% line',
    classSlider: 'Class size n', sim5: 'Simulate 100 classes', clear5: 'Clear simulated dots',
    c5title: 'Probability at least two share a birthday, by class size n',
    c5axis: 'class size n',
    s5readout: 'n = {n}: probability all differ = {top} ÷ 365 to the power {n} = {q}; at least two share = 1 − {q} = {p} ({pc}). The class has C({n}, 2) = {pairs} pairs of people, and any pair could match. ',
    s5sim: 'Simulating 100 classes of {n}: {h} of them had a shared birthday.',
    s5hint: 'What to try: drag n up from 2 and follow the cyan curve. At n = 23 it first crosses the dashed orange line (50.7%), and by n = 57 it reaches 99.0%. Intuition goes wrong because the question is not “does anyone share my birthday?” but “does any pair match?”, and 23 people make 253 pairs. Then press “Simulate 100 classes” at a few values of n: the white dots scatter around the curve (with only 100 classes each time, being off by a few percentage points is normal).',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Multiply first, then ask whether to divide',
    s6fin: 'For a task done in stages, multiply the choices at each stage (the <strong>multiplication principle</strong>, step 0). Line up all n people: n! (step 1); line up k of them: A(n, k) = n! ÷ (n − k)! (step 2). Choose without ordering: the k! orders of the same people count as one, so C(n, k) = A(n, k) ÷ k! (step 3). Which one to use depends only on whether swapping the order gives a different outcome (step 4). In an equally likely model, counting outcomes gives probabilities, and sometimes the complement is easier to count (step 5).',
    formula: 'multiplication principle: total = product of the choices at each stage\nn! = n × (n−1) × … × 1, with 0! = 1\nA(n, k) = n!/(n−k)!, C(n, k) = A(n, k)/k! = n!/(k!(n−k)!)',
    boundary: 'Where this holds: the multiplication principle needs the number of choices at each stage to be unaffected by earlier choices (the options may differ, but not how many there are); permutations and combinations assume distinct objects chosen without repetition. The birthday problem assumes 365 equally likely, independent days; real birthdays are not spread evenly across the year (which makes matches slightly more likely), and 29 February exists. The simulations use fixed-seed pseudo-random numbers, not data from real classes.',
    linksTitle: 'Where to go next',
    lk1: '→ Number combinatorics, step 2: counting without duplicates when order does not matter',
    lk2: '→ Binomial to Normal, step 0: counting paths on a pegboard gives Pascal’s triangle and C(n, k)',
    lk3: '→ Monte Carlo, step 1: estimating a probability from the share of many simulations',
    lk4: '→ Genetics probability, step 1: counting equally likely combinations in a Punnett square',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Permutations & Combinations · Counting How Many Ways”.'
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
  if (typeof window.refreshCounting === 'function') window.refreshCounting();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
