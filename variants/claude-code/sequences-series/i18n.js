'use strict';
// Sequences & series lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '数列与求和 · 砖塔与麦粒的两种长法',
    back: '← 知识索引',
    compare: '对照另一版本：数列与求和 · 叠砖与棋盘麦粒 →',
    navLabel: '数列与求和步骤导航',
    tagline: '砖塔每往上一层多放几块砖，棋盘每往后一格麦粒翻一倍。已知第一项和「每次怎么变」，想求的是：第 n 项是多少，前 n 项一共多少，加到无穷多项会不会有尽头。七步里你会亲手把一个和倒过来拼成长方形，把另一个和错开一位相减，再看「每次加」和「每次乘」比赛谁先冲到前面。',
    nav0: '0 等差', nav1: '1 倒序相加', nav2: '2 等比', nav3: '3 错位相减', nav4: '4 无穷多项', nav5: '5 加 vs 乘', nav6: '6 收束',

    s0k: '第 0 步 · 每次加同样多',
    s0t: '砖塔第一层放 a₁ 块，往上每层多 d 块，第 n 层有多少块？',
    s0e: '这一步要回答：知道第一层和每层多几块，能不能不一层层数，直接写出第 n 层？按顺序排好的一列数叫<strong>数列</strong>，其中第 n 个数叫第 n <strong>项</strong>，记作 aₙ。相邻两项的差都相同的数列叫<strong>等差数列</strong>，这个差叫<strong>公差</strong> d（<a class="xlink" href="../../../math/algebra/patterns-sequences/#step1">→ 找规律页第 1 步：先找出每次的增量</a>）。从第 1 项到第 n 项要加 n − 1 次 d，所以 <strong>aₙ = a₁ + (n − 1)·d</strong>。下图横轴是第几层 n，纵轴是这一层的砖数 aₙ；每一小格是一块砖。d 为负时数会越来越小，甚至变成负数（画在横轴下方），那时它只是数列，不再是真的砖塔。',
    a1_0: '第一项 a₁', d0: '公差 d',
    c0: '前 10 项：每层的砖数 aₙ（横轴：第几层 n）',
    s0lgA: '各项 aₙ（一小格 = 1）', s0lgD: '橙色 = 比上一层多出的 d 块',
    s0readout: '数列：{list}。通项 aₙ = {a1} + (n − 1)·({d})，例如 a₁₀ = {a1} + 9 × ({d}) = {a10}。{trend}',
    tUp: '每层比上一层多 {d} 块，塔越来越宽。', tFlat: 'd = 0：每层一样多，是一列常数。', tDown: 'd 为负：每层比上一层少 {dd} 块。',
    s0hint: '观察顺序：先保持 a₁ 不变，只拖公差 d，看每根柱子比左边那根多出的橙色段都一样长（就是 d）；再只拖 a₁，整组柱子一起抬高或降低，橙色段不变。',

    s1k: '第 1 步 · 倒过来再加一遍',
    s1t: '一共有多少块砖？有没有不用一层层加的办法？',
    s1e: '这一步要回答：前 n 项的和 <strong>Sₙ</strong> = a₁ + a₂ + … + aₙ 有没有捷径？把整座塔（青色）复制一份，上下倒过来（橙色），并排拼在右边。第 1 行是 a₁ 配 aₙ，第 2 行是 a₂ 配 aₙ₋₁……左边每往下一行多 d 块，右边就少 d 块，所以每一行的总长都是 a₁ + aₙ。n 行拼成一个 n × (a₁ + aₙ) 的长方形，正好是两份 Sₙ，于是 <strong>Sₙ = n·(a₁ + aₙ)/2</strong>。传说高斯小时候就是这样算出 1 + 2 + … + 100 = 100 × 101 / 2 = 5050 的。',
    a1_1: '第一项 a₁', d1: '公差 d', n1: '项数 n', join1: '把倒过来的那份拼上去', split1: '拆开',
    c1: '每一行：青色 aₖ ＋ 橙色 aₙ₊₁₋ₖ（横轴：块数）',
    s1lgOrig: '原来的塔（第 k 行 = aₖ）', s1lgRev: '倒过来的复制（第 k 行 = aₙ₊₁₋ₖ）',
    s1readout: '{prog}a₁ = {a1}，aₙ = a{ns} = {an}。长方形 {n} 行 × {w} 列 = {area} 块，是两份和，所以 S{ns} = {area} ÷ 2 = {s}。逐项相加：{terms} = {direct}，一致。',
    s1progress: '正在拼合……',
    s1hint: '观察顺序：先按「把倒过来的那份拼上去」，看橙色从右侧滑进来，每一行的右端都对齐成一条竖线；再拖 n 或 d，右端仍然对齐，只是长方形变宽变高。',

    s2k: '第 2 步 · 每次乘同样的倍数',
    s2t: '棋盘第 1 格放 1 粒麦子，以后每格翻一倍，第 64 格有多少粒？',
    s2e: '这一步要回答：如果每一项是上一项的同样倍数，项会长多快？相邻两项的比都相同的数列叫<strong>等比数列</strong>，这个比叫<strong>公比</strong> r，第 n 项 <strong>aₙ = a₁·rⁿ⁻¹</strong>（从第 1 项到第 n 项要乘 n − 1 次 r）。棋盘的故事里 a₁ = 1、r = 2（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ 指数与对数页第 0 步：翻倍有多快</a>）。左图是棋盘，颜色越亮这一格麦粒越多；右图纵轴是<strong>对数刻度</strong>：每往上一格乘以 10，所以翻倍的数在图上是一条直线。灰色对照是「每格只多 1 粒」的等差数列。',
    k2: '放到第 k 格', play2: '一格一格放到 64',
    c2a: '棋盘（越亮麦粒越多）', c2b: '第 k 格的粒数（纵轴每格 ×10）',
    s2lgG: '每格翻倍：2ᵏ⁻¹', s2lgA: '对照：每格多 1 粒（第 k 格 k 粒）', s2lgNow: '当前格',
    s2readout: '{prog}第 {k} 格：{g} 粒；前 {k} 格合计 {sum} 粒（= 2^{k} − 1）。若每格只多 1 粒，前 {k} 格合计只有 {lin} 粒。',
    s2full: '整个棋盘约 {t} 吨（假设每粒约 0.04 克）；按全球小麦年产量约 8 亿吨估算，相当于九百多年的产量。',
    s2progress: '已放到第 {k}/64 格。',
    s2hint: '观察顺序：按「一格一格放到 64」，左图前几排几乎全暗，最后一排才突然亮起来：一半的麦粒都在最后一格。右图里青色是一条直线，灰色对照却几乎贴着底部：在对数刻度上，翻倍是匀速爬升，每格加 1 几乎不动。',

    s3k: '第 3 步 · 错开一位再相减',
    s3t: '等比数列的前 n 项和，有没有像倒序相加那样的捷径？',
    s3e: '这一步要回答：Sₙ = a + ar + ar² + … + arⁿ⁻¹ 能不能不逐项相加？等比数列倒过来每行不再等长，倒序相加失效。换个办法：把整个和乘以公比 r，得到 rSₙ = ar + ar² + … + arⁿ，它和 Sₙ 只差「错开一位」。上下对齐后相减，中间的项两两抵消，只剩 Sₙ 的头一项 a 和 rSₙ 的末一项 arⁿ：Sₙ − rSₙ = a − arⁿ。r ≠ 1 时两边除以 1 − r，得 <strong>Sₙ = a·(1 − rⁿ)/(1 − r)</strong>。r = 1 时每项都是 a，Sₙ = n·a。',
    a3: '首项 a', r3: '公比 r', n3: '项数 n', shift3: '错开一位并相减', reset3: '对齐还原',
    c3: '上行 Sₙ，下行 r·Sₙ（错开一位）',
    s3lgS: 'Sₙ 的各项', s3lgR: 'r·Sₙ 的各项', s3lgX: '灰色 = 上下相同、相减抵消',
    s3readout: '{prog}a = {a}，r = {r}，n = {n}：逐项相加 S{ns} = {direct}；公式 {formula} = {s}。',
    s3fr: 'a·(1 − rⁿ)/(1 − r)', s3f1: 'r = 1：n·a',
    s3progress: '正在错位……',
    s3hint: '观察顺序：先按「错开一位并相减」，下行右移一格后，上下相同的格子变灰，只剩左端一格和右端一格；再换几个 r（包括负数和小于 1 的数），公式和逐项相加始终一致。',

    s4k: '第 4 步 · 无穷多项',
    s4t: '无穷多个正数加起来，一定是无穷大吗？',
    s4e: '这一步要回答：首项为 1、公比为 r 的等比数列一直加下去，前 n 项和 Sₙ（也叫<strong>部分和</strong>）会不会停在某个数附近？由上一步，Sₙ = (1 − rⁿ)/(1 − r)。当 |r| < 1 时 rⁿ 越来越接近 0，Sₙ 就越来越接近 1/(1 − r)，这个数叫无穷级数的和，也就是部分和的<strong>极限</strong>；|r| ≥ 1 时 Sₙ 不会靠近任何一个数，叫<strong>发散</strong>。下图横轴是项数 n，纵轴是部分和 Sₙ；虚线是极限，阴影带是「离极限不到 0.01」的范围（<a class="xlink" href="../../../math/calculus/limits-epsilon/#step4">→ 极限页第 4 步：用 ε–N 说清「越来越接近」</a>）。',
    r4: '公比 r（首项 1）', n4: '加到第 n 项',
    c4: '部分和 Sₙ（横轴：项数 n）',
    s4lgS: '部分和 Sₙ', s4lgL: '极限 1/(1 − r)', s4lgB: '离极限 0.01 以内',
    s4conv: '|r| < 1：S{ns} = {s}，极限 1/(1 − r) = {L}，还差 {gap}。差距 = |rⁿ/(1 − r)|，每多一项乘以 |r|；从第 {N} 项起差距小于 0.01。{alt}',
    s4alt: 'r 为负时项正负交替，部分和在极限上下跳动着靠近。',
    s4one: 'r = 1：每项都是 1，S{ns} = {n}，一直增大，发散。',
    s4div: '|r| > 1：S{ns} = {s}，而且每多一项差距越拉越大，发散。',
    s4hint: '观察顺序：先取 r = 0.5，把 n 从 1 拖到 10：点一步步爬向虚线 2，每次补上剩余距离的一半。再取 r = 0.9：极限变成 10，要 66 项才进入阴影带。然后取 r = −0.5：点在 2/3 上下跳动着靠近。最后取 r = 1.05：点越走越高，没有虚线可靠。',

    s5k: '第 5 步 · 加法与乘法赛跑',
    s5t: '一个每天多给一点，一个从 1 分钱开始每天翻倍，谁的总数先领先？',
    s5e: '这一步要回答：等差的「每天多 d」和等比的「每天乘 r」比赛，结局取决于什么？两份零花钱方案：<strong>方案 A</strong> 第 1 天 100 元，以后每天比前一天多 d 元（等差）；<strong>方案 B</strong> 第 1 天 0.01 元，以后每天是前一天的 r 倍（等比）。比较的是到第 n 天为止各自<strong>累计</strong>拿到多少，也就是两个前 n 项和。下图横轴是第几天，纵轴是累计金额（元）；可以切换线性或对数纵轴，这只改变显示方式，不改变数据。',
    d5: '方案 A 每天多给 d 元', r5: '方案 B 每天乘 r', N5: '比较的天数', logOn: '纵轴：对数', logOff: '纵轴：线性',
    c5: '累计金额（元；横轴：第几天）',
    s5lgA: '方案 A 累计（等差求和）', s5lgB: '方案 B 累计（等比求和）', s5lgX: '反超的那一天',
    s5readout: '{N} 天后：A 累计 {A} 元，B 累计 {B} 元。{cross}',
    s5cross: 'B 从第 {k} 天起累计超过 A，之后差距越拉越大。', s5none: '{N} 天内 B 一直没追上 A：r 太小或天数太少。',
    s5hint: '观察顺序：保持 r = 2，d 从 0 拖到 50：反超日只从第 18 天推迟到第 21 天，A 每天多给再多也只能拖延几天。再把 r 降到 1.5：30 天内追不上，把比较天数加到 32 天以上，就会看到它在第 32 天反超。切到对数纵轴，B 的累计几乎是直线，A 却很快变平。',

    s6k: '第 6 步 · 收束',
    s6t: '这一页你做了什么',
    s6fin: '等差数列每次加 d，通项 aₙ = a₁ + (n − 1)d，图像是一级级等高的台阶；把它倒过来拼成长方形，得到 <strong>Sₙ = n(a₁ + aₙ)/2</strong>。等比数列每次乘 r，通项 aₙ = a₁rⁿ⁻¹，在对数刻度上是一条直线；把和错开一位相减，得到 <strong>Sₙ = a₁(1 − rⁿ)/(1 − r)</strong>。|r| < 1 时无穷多项的和有尽头 a₁/(1 − r)，|r| ≥ 1 时发散。只要 r > 1，乘出来的和迟早超过加出来的和，前面落后多少只影响反超来得早晚。',
    formula: '等差：aₙ = a₁ + (n − 1)d，Sₙ = n(a₁ + aₙ)/2\n等比：aₙ = a₁rⁿ⁻¹，Sₙ = a₁(1 − rⁿ)/(1 − r)（r ≠ 1）\n|r| < 1：S∞ = a₁/(1 − r)',
    boundary: '适用范围：本页的数列都由第一项和固定的公差或公比决定；不是每个数列都属于这两类。「乘法迟早赢」要求 r > 1 且两边都一直按规则进行；第 5 步只展示了最多 60 天。第 4 步只画到第 30 项，极限的严格定义见互链页。',
    quizTitle: '小测：这一列是哪一类？', quizArith: '等差', quizGeo: '等比', quizNeither: '都不是', check: '检查', nextQ: '换一列',
    qRight: '对。{why}', qWrong: '再看看：先算相邻两项的差，再算相邻两项的比。{why}',
    whyArith: '相邻差都是 {d}，是等差数列，下一项是 {next}。', whyGeo: '相邻比都是 {r}，是等比数列，下一项是 {next}。', whyNeither: '相邻差（{diffs}）不相等，相邻比也不相等，两类都不是。',
    qProgress: '第 {i}/{N} 题：',
    linksTitle: '接着去看',
    lk1: '找规律页第 1 步：找出每次的增量 →', lk2: '指数与对数页第 0 步：翻倍的世界 →', lk3: '极限页第 4 步：数列的 ε–N →', lk4: '复利页第 4 步：定期存入就是等比求和 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《数列与求和 · 叠砖与棋盘麦粒》的平行版本。'
  },
  en: {
    pageTitle: 'Sequences & Series · Two Ways to Grow: Brick Towers and Wheat Grains',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Sequences & Series · Stacked Bricks and Chessboard Grains →',
    navLabel: 'Sequences & series steps',
    tagline: 'A brick tower gains a few more bricks on each new layer; a chessboard doubles the wheat on each new square. Given the first term and the rule for each step, we want the nth term, the total of the first n terms, and whether adding infinitely many terms can ever stop growing. In seven steps you will turn one sum upside down into a rectangle, shift another sum by one place and subtract, and race “add each time” against “multiply each time”.',
    nav0: '0 Arithmetic', nav1: '1 Reverse & add', nav2: '2 Geometric', nav3: '3 Shift & subtract', nav4: '4 Infinitely many', nav5: '5 Add vs multiply', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Add the same amount each time',
    s0t: 'The bottom layer has a₁ bricks and each layer above has d more. How many bricks are on layer n?',
    s0e: 'This step answers: knowing the first layer and how many bricks each new layer adds, can we write down layer n without counting up layer by layer? A list of numbers in order is a <strong>sequence</strong>; the nth number is its nth <strong>term</strong>, aₙ. A sequence where consecutive terms always differ by the same amount is an <strong>arithmetic sequence</strong>, and that amount is the <strong>common difference</strong> d (<a class="xlink" href="../../../math/algebra/patterns-sequences/#step1">→ Patterns, step 1: find the step size first</a>). Getting from term 1 to term n adds d exactly n − 1 times, so <strong>aₙ = a₁ + (n − 1)·d</strong>. Horizontally: the layer number n; vertically: that layer’s bricks aₙ, one small cell per brick. With a negative d the terms shrink and can even go negative (drawn below the axis); then it is just a sequence, no longer a real tower.',
    a1_0: 'First term a₁', d0: 'Common difference d',
    c0: 'First 10 terms: bricks per layer aₙ (horizontal: layer n)',
    s0lgA: 'terms aₙ (one cell = 1)', s0lgD: 'orange = the d bricks added to the layer below',
    s0readout: 'Sequence: {list}. General term aₙ = {a1} + (n − 1)·({d}); for example a₁₀ = {a1} + 9 × ({d}) = {a10}. {trend}',
    tUp: 'Each layer has {d} more than the one below, so the tower widens.', tFlat: 'd = 0: every layer is the same — a constant sequence.', tDown: 'Negative d: each layer has {dd} fewer than the one below.',
    s0hint: 'What to try: hold a₁ fixed and drag only d — the orange piece each bar adds over its left neighbour is always the same length (that is d). Then drag only a₁: all the bars rise or fall together and the orange pieces don’t change.',

    s1k: 'Step 1 · Add it again, upside down',
    s1t: 'How many bricks in total — is there a way that skips adding layer by layer?',
    s1e: 'This step answers: is there a shortcut for the sum of the first n terms, <strong>Sₙ</strong> = a₁ + a₂ + … + aₙ? Copy the whole tower (cyan), flip the copy upside down (orange) and set it alongside on the right. Row 1 pairs a₁ with aₙ, row 2 pairs a₂ with aₙ₋₁, and so on: each row down, the left part gains d and the right part loses d, so every row has the same length a₁ + aₙ. The n rows form an n × (a₁ + aₙ) rectangle holding exactly two copies of Sₙ, so <strong>Sₙ = n·(a₁ + aₙ)/2</strong>. Legend has it that the young Gauss found 1 + 2 + … + 100 = 100 × 101 / 2 = 5050 exactly this way.',
    a1_1: 'First term a₁', d1: 'Common difference d', n1: 'Number of terms n', join1: 'Slide in the flipped copy', split1: 'Pull apart',
    c1: 'Each row: cyan aₖ + orange aₙ₊₁₋ₖ (horizontal: bricks)',
    s1lgOrig: 'original tower (row k = aₖ)', s1lgRev: 'flipped copy (row k = aₙ₊₁₋ₖ)',
    s1readout: '{prog}a₁ = {a1}, aₙ = a{ns} = {an}. Rectangle {n} rows × {w} columns = {area} bricks — two copies of the sum, so S{ns} = {area} ÷ 2 = {s}. Adding term by term: {terms} = {direct}. They agree.',
    s1progress: 'Sliding together… ',
    s1hint: 'What to try: press “Slide in the flipped copy” and watch the orange part come in from the right until every row ends on the same vertical line. Then drag n or d: the right edge stays straight; only the rectangle’s size changes.',

    s2k: 'Step 2 · Multiply by the same factor each time',
    s2t: 'One grain on the first square of a chessboard, doubling on each square after. How many on square 64?',
    s2e: 'This step answers: if each term is the same multiple of the one before, how fast do the terms grow? A sequence where consecutive terms always have the same ratio is a <strong>geometric sequence</strong>, and that ratio is the <strong>common ratio</strong> r; its nth term is <strong>aₙ = a₁·rⁿ⁻¹</strong> (getting from term 1 to term n multiplies by r exactly n − 1 times). On the chessboard a₁ = 1 and r = 2 (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ Exponents & logarithms, step 0: how fast doubling is</a>). On the left is the board — the brighter a square, the more grains. On the right the vertical axis is a <strong>logarithmic scale</strong>: each gridline up multiplies by 10, so a doubling sequence plots as a straight line. The grey comparison is the arithmetic “one more grain per square”.',
    k2: 'Fill up to square k', play2: 'Fill square by square to 64',
    c2a: 'Chessboard (brighter = more grains)', c2b: 'Grains on square k (each gridline ×10)',
    s2lgG: 'doubling: 2ᵏ⁻¹', s2lgA: 'comparison: one more per square (k on square k)', s2lgNow: 'current square',
    s2readout: '{prog}Square {k}: {g} grains; the first {k} squares hold {sum} (= 2^{k} − 1). With just one more grain per square, the first {k} squares would hold only {lin}.',
    s2full: 'The whole board weighs about {t} tonnes (assuming about 0.04 g per grain) — at a world wheat harvest of roughly 800 million tonnes a year, more than nine hundred years’ worth.',
    s2progress: 'Filled {k}/64 squares. ',
    s2hint: 'What to try: press “Fill square by square to 64”. The first rows of the board stay almost dark and only the last row lights up — half of all the grains sit on the final square. On the right the cyan line is straight while the grey comparison hugs the bottom: on a log scale doubling climbs at a steady pace and adding one barely moves.',

    s3k: 'Step 3 · Shift by one and subtract',
    s3t: 'Is there a shortcut, like reverse-and-add, for the sum of a geometric sequence?',
    s3e: 'This step answers: can Sₙ = a + ar + ar² + … + arⁿ⁻¹ be found without adding term by term? Flipping no longer helps — the rows would not be equal. Instead multiply the whole sum by the ratio r: rSₙ = ar + ar² + … + arⁿ, which is Sₙ “shifted by one place”. Line them up and subtract: the middle terms cancel in pairs, leaving only Sₙ’s first term a and rSₙ’s last term arⁿ: Sₙ − rSₙ = a − arⁿ. For r ≠ 1 divide by 1 − r to get <strong>Sₙ = a·(1 − rⁿ)/(1 − r)</strong>. For r = 1 every term is a and Sₙ = n·a.',
    a3: 'First term a', r3: 'Common ratio r', n3: 'Number of terms n', shift3: 'Shift by one and subtract', reset3: 'Line back up',
    c3: 'Top row Sₙ, bottom row r·Sₙ (shifted one place)',
    s3lgS: 'terms of Sₙ', s3lgR: 'terms of r·Sₙ', s3lgX: 'grey = same above and below, cancels',
    s3readout: '{prog}a = {a}, r = {r}, n = {n}: adding term by term, S{ns} = {direct}; the formula {formula} = {s}.',
    s3fr: 'a·(1 − rⁿ)/(1 − r)', s3f1: 'r = 1: n·a',
    s3progress: 'Shifting… ',
    s3hint: 'What to try: press “Shift by one and subtract”. Once the bottom row moves one cell right, every cell that matches the one above turns grey, leaving one cell at the left end and one at the right. Then try several r, including negative values and values below 1: the formula always agrees with adding term by term.',

    s4k: 'Step 4 · Infinitely many terms',
    s4t: 'Do infinitely many positive numbers always add up to infinity?',
    s4e: 'This step answers: if we keep adding a geometric sequence with first term 1 and ratio r, does the sum of the first n terms, Sₙ (a <strong>partial sum</strong>), settle near some number? From step 3, Sₙ = (1 − rⁿ)/(1 − r). When |r| < 1, rⁿ gets closer and closer to 0, so Sₙ gets closer and closer to 1/(1 − r) — the sum of the infinite series, the <strong>limit</strong> of the partial sums. When |r| ≥ 1, Sₙ approaches no number at all: the series <strong>diverges</strong>. Horizontally: number of terms n; vertically: partial sum Sₙ. The dashed line is the limit, and the shaded band is “within 0.01 of the limit” (<a class="xlink" href="../../../math/calculus/limits-epsilon/#step4">→ Limits, step 4: pinning down “closer and closer” with ε–N</a>).',
    r4: 'Common ratio r (first term 1)', n4: 'Add up to term n',
    c4: 'Partial sums Sₙ (horizontal: number of terms n)',
    s4lgS: 'partial sum Sₙ', s4lgL: 'limit 1/(1 − r)', s4lgB: 'within 0.01 of the limit',
    s4conv: '|r| < 1: S{ns} = {s}, limit 1/(1 − r) = {L}, still {gap} short. The gap is |rⁿ/(1 − r)| and shrinks by a factor |r| with every term; from term {N} on it is below 0.01. {alt}',
    s4alt: 'With negative r the terms alternate in sign, so the partial sums hop above and below the limit as they close in.',
    s4one: 'r = 1: every term is 1, S{ns} = {n}, growing without end — divergent.',
    s4div: '|r| > 1: S{ns} = {s}, and every new term widens the gap — divergent.',
    s4hint: 'What to try: set r = 0.5 and drag n from 1 to 10 — the dots climb towards the dashed line at 2, each time covering half the remaining distance. Set r = 0.9: the limit becomes 10 and it takes 66 terms to enter the band. Set r = −0.5: the dots hop around 2/3 as they close in. Finally r = 1.05: the dots keep rising with no line to settle on.',

    s5k: 'Step 5 · Adding races multiplying',
    s5t: 'One plan gives a little more each day, the other starts at one cent and doubles. Whose total takes the lead?',
    s5e: 'This step answers: when “d more each day” (arithmetic) races “r times as much each day” (geometric), what decides the outcome? Two pocket-money plans: <strong>Plan A</strong> pays 100 yuan on day 1 and d yuan more than the day before after that (arithmetic); <strong>Plan B</strong> pays 0.01 yuan on day 1 and r times the day before after that (geometric). We compare the <strong>running totals</strong> up to day n — two partial sums. Horizontally: the day; vertically: the running total in yuan. You can switch the vertical axis between linear and logarithmic; that changes only the display, not the data.',
    d5: 'Plan A’s daily increase d (yuan)', r5: 'Plan B’s daily factor r', N5: 'Days compared', logOn: 'Vertical axis: log', logOff: 'Vertical axis: linear',
    c5: 'Running total (yuan; horizontal: day)',
    s5lgA: 'plan A total (arithmetic sum)', s5lgB: 'plan B total (geometric sum)', s5lgX: 'the day B overtakes',
    s5readout: 'After {N} days: A has paid {A} yuan in total, B {B} yuan. {cross}',
    s5cross: 'B’s total passes A’s on day {k} and the gap only widens after that.', s5none: 'Within {N} days B never catches A — r is too small or there are too few days.',
    s5hint: 'What to try: keep r = 2 and drag d from 0 to 50 — the overtaking day only moves from day 18 to day 21; however generous A gets, it merely delays the inevitable. Lower r to 1.5: B can’t catch up within 30 days, but stretch the race to 32 days or more and it overtakes on day 32. Switch to the log axis: B’s total is nearly a straight line while A’s flattens fast.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What you did on this page',
    s6fin: 'An arithmetic sequence adds d each time; its general term is aₙ = a₁ + (n − 1)d and it plots as a staircase of equal steps. Flipping it into a rectangle gives <strong>Sₙ = n(a₁ + aₙ)/2</strong>. A geometric sequence multiplies by r each time; its general term is aₙ = a₁rⁿ⁻¹, a straight line on a log scale. Shifting the sum by one place and subtracting gives <strong>Sₙ = a₁(1 − rⁿ)/(1 − r)</strong>. When |r| < 1 the infinite sum settles at a₁/(1 − r); when |r| ≥ 1 it diverges. As long as r > 1, a multiplying sum eventually overtakes an adding one; a head start only changes how soon.',
    formula: 'Arithmetic: aₙ = a₁ + (n − 1)d, Sₙ = n(a₁ + aₙ)/2\nGeometric: aₙ = a₁rⁿ⁻¹, Sₙ = a₁(1 − rⁿ)/(1 − r) (r ≠ 1)\n|r| < 1: S∞ = a₁/(1 − r)',
    boundary: 'Scope: every sequence here is fixed by its first term and a constant difference or ratio; plenty of sequences are neither. “Multiplying eventually wins” needs r > 1 and both plans to keep following their rules; step 5 only shows up to 60 days. Step 4 draws only 30 terms; the rigorous definition of a limit is on the linked page.',
    quizTitle: 'Quick check: which kind is this?', quizArith: 'arithmetic', quizGeo: 'geometric', quizNeither: 'neither', check: 'Check', nextQ: 'Another one',
    qRight: 'Right. {why}', qWrong: 'Look again: first work out the differences between neighbours, then the ratios. {why}',
    whyArith: 'Every difference is {d}, so it is arithmetic; the next term is {next}.', whyGeo: 'Every ratio is {r}, so it is geometric; the next term is {next}.', whyNeither: 'The differences ({diffs}) are not equal and neither are the ratios, so it is neither.',
    qProgress: 'Question {i}/{N}: ',
    linksTitle: 'Where to go next',
    lk1: 'Patterns, step 1: find the step size →', lk2: 'Exponents & logarithms, step 0: a doubling world →', lk3: 'Limits, step 4: ε–N for sequences →', lk4: 'Compound interest, step 4: regular saving is a geometric sum →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Sequences & Series · Stacked Bricks and Chessboard Grains”.'
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
