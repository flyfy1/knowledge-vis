'use strict';
// Exponentials & logarithms strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '指数与对数 · 乘了几次，就是对数',
    back: '← 知识索引',
    compare: '对照另一版本：指数与对数 · 翻倍与逆问 →',
    navLabel: '指数与对数步骤导航',
    tagline: '两个培养皿，一个每小时多 3 个细胞，一个每小时数量翻一倍。一天之后差多少？反过来，已知长到了 6 倍，过了多久？前一个问题的答案叫指数，后一个叫对数。六步里你会看到：对数就是在数「乘了几次」，所以它能把乘法变成加法。',
    nav0: '0 加还是乘', nav1: '1 指数函数', nav2: '2 反过来问', nav3: '3 对数尺', nav4: '4 对数刻度', nav5: '5 自测 · 收束',

    s0k: '第 0 步 · 两种增长',
    s0t: '每小时加 3，和每小时乘 2，谁会赢？赢多少？',
    s0e: '这一步要回答：两个培养皿都从 1 个细胞开始。A 皿每小时<strong>增加 3 个</strong>；B 皿里每个细胞每小时分裂成两个，数量<strong>乘 2</strong>。到第 t 小时，A 有 1 + 3t 个，B 有 2<sup>t</sup> 个（2 自乘 t 次）。哪一皿多？多出多少？下面的柱状图横轴是小时 t，纵轴是细胞个数；纵轴刻度会随你选的 t 自动放大，好让最高的柱子装得下。像 B 这样「每过相同的时间，就乘上同一个倍数」的增长叫<strong>指数增长</strong>；像 A 这样「每过相同的时间，加上同一个数」的叫线性增长。',
    hourSlider: '看到第 t 小时', play0: '从 0 播到 24 小时',
    s0lgA: 'A 皿：每小时 +3', s0lgB: 'B 皿：每小时 ×2',
    c0title: '细胞个数（纵轴刻度随 t 自动放大）',
    c0A: 'A：+3', c0B: 'B：×2', c0over: 'B 反超',
    thHour: '小时 t', thA: 'A 皿', thdA: 'A 比上一小时', thB: 'B 皿', thrB: 'B 比上一小时',
    s0readout: '第 {t} 小时：A = 1 + 3×{t} = {A}，B = {Bx} = {B}。{lead}',
    leadA: 'A 还领先，多 {d} 个。',
    leadTie: '两皿一样多。',
    leadB: 'B 领先，是 A 的 {ratio} 倍。B 从第 {over} 小时起一直领先。',
    playing: '（播放中 {t}/24）',
    s0hint: '观察顺序：先把 t 拖到 3 和 4，看表格里 B 在哪一小时超过 A；再拖到 24。A 的柱子被压成贴地的一条线——A 并没有变少，是纵轴被 B 撑大了。表格里 A 每行都「+3」，B 每行都「×2」：差别就在加和乘。',

    s1k: '第 1 步 · 指数函数',
    s1t: '倍数不是 2、时间不是整数时，曲线长什么样？',
    s1e: '这一步要回答：把「每过 1 个单位就乘 a」画成连续的曲线 <strong>y = a<sup>x</sup></strong>，叫<strong>指数函数</strong>；a 叫<strong>底数</strong>（每过 1 个单位乘的那个倍数），x 叫<strong>指数</strong>（过了多少个单位）。x 不是整数时也有意义：半个单位乘的数，自己乘两次必须等于 a，所以 a<sup>0.5</sup> = √a。x 为负就是往回走：每退 1 个单位除以 a，所以 a<sup>−1</sup> = 1/a。x = 0 是「一次也没乘」，所以任何底数都有 a<sup>0</sup> = 1。本页只取 a > 0：底数为负时，a<sup>0.5</sup> 这样的值在实数里不存在。图中横轴是 x，纵轴是 y = a<sup>x</sup>；橙色台阶表示从 x 走到 x + 1，高度乘了 a。',
    baseSlider: '底数 a', xSlider: '指数 x（探针位置）', clearGhosts: '清掉试过的曲线',
    s1lgCurve: '当前曲线 y = aˣ', s1lgGhost: '你试过的其他底数', s1lgStep: '从 x 走到 x + 1：乘了 a',
    c1title: 'y = aˣ（横轴 x，纵轴 y）',
    s1readout: 'a = {a}，x = {x}：{p0} ≈ {y}；再往右走 1：{p1} ≈ {y1}，正好是前者的 {ratio} 倍。{trend}',
    trendUp: 'a > 1：x 每加 1，y 都乘一个大于 1 的数，曲线一路上升，越升越快。',
    trendDown: '0 < a < 1：x 每加 1，y 都乘一个小于 1 的数，曲线一路下降、贴近 0 但永远不到 0。这就是衰减，比如药物在体内按固定比例减少。',
    trendFlat: 'a = 1：乘 1 等于没乘，y 恒为 1，是一条水平线。所以指数函数要求 a ≠ 1。',
    s1hint: '观察顺序：先把 x 放在 0.5，按 a = 2 看 2^0.5 ≈ 1.414，读数里它再乘一次 2 的结果；然后只拖底数 a，留意所有曲线（包括灰色的旧曲线）都穿过同一点 (0, 1)，而且永远在横轴上方。a 越过 1 时，上升变成下降。',

    s2k: '第 2 步 · 反过来问',
    s2t: '已知 2 的几次方等于 6，这个「几次方」怎么求？',
    s2e: '这一步要回答：上一步是给指数求结果；现在反过来，给结果求指数。2 的几次方是 8？答 3，因为 2 × 2 × 2 = 8。这个「几次方」有个名字：<strong>对数</strong>，写作 <strong>log<sub>2</sub> 8 = 3</strong>，读作「以 2 为底 8 的对数」。一般地，a<sup>x</sup> = y 的那个 x 就记作 <strong>log<sub>a</sub> y</strong>：a 仍叫底数（每次乘的倍数），y 叫<strong>真数</strong>（想达到的结果），对数就是「要乘几次 a 才能到 y」。要求 a > 0、a ≠ 1、y > 0：正数怎么乘都得不到 0 或负数，所以 log<sub>2</sub>(−4) 没有实数答案。图中横轴是 x、纵轴是 y；橙色横线是目标 y，它与曲线的交点往下落，落在横轴上的位置就是对数。',
    baseLabel: '底数 a：', baseGroup: '选择底数', targetSlider: '目标 y（真数）', presetLabel: '常用目标：', bisect: '一步步夹出指数',
    s2lgCurve: '曲线 y = aˣ', s2lgTarget: '目标高度 y 与它对应的 x', s2lgBand: '答案目前被夹在其中的区间；横轴上的短线是试过的 x（绿 = 偏小，红 = 偏大）',
    c2title: '从目标高度 y 找回指数 x',
    s2readoutExact: '{L} {y} = {x}：{a} 自乘 {x} 次正好是 {y}，这是精确的整数答案。',
    s2readoutExactNeg: '{L} {y} = {x}：指数为负表示往回除，{y} = 1 ÷ {pabs}，精确。',
    s2readout: '{L} {y} ≈ {x}（保留 3 位小数）。它不是整数：{Plo} = {plo} < {y} < {phi} = {Phi}，所以答案夹在 {lo} 和 {hi} 之间。精确写法就是 {L} {y}。',
    guess0: '整数夹逼：{Plo} = {plo} < {y} < {phi} = {Phi}，答案在 [{lo}, {hi}] 中。',
    guessBig: '试 {mid}：{Pmid} ≈ {p}，比 {y} 大，答案在 [{lo}, {mid}] 中。',
    guessSmall: '试 {mid}：{Pmid} ≈ {p}，比 {y} 小，答案在 [{mid}, {hi}] 中。',
    guessEnd: '{k} 次折半后区间宽 {w}，中点 {mid}；真值 {L} {y} ≈ {x}。',
    guessExact: '{y} 恰好是 {a} 的整数次幂，不用夹逼。',
    bisectProgress: '已折半 {k}/{N} 次。',
    s2hint: '观察顺序：先按预设 8 和 32，读出两个整数答案；换底数 3，把目标拖到 81 附近（或用读数核对 log₃81 = 4）。再按预设 6，按「一步步夹出指数」：橙色区间每次缩小一半，横轴上留下每次试过的 x，看它逼近 2.585。最后按 1/8，看对数为负。',

    s3k: '第 3 步 · 对数尺',
    s3t: '为什么对数能把乘法变成加法？',
    s3e: '这一步要回答：log<sub>2</sub> m 数的是「从 1 出发，乘几次 2 到 m」（对数就是这个次数）。先乘到 m、再接着乘到 m × n，总次数就是两段次数相加：<strong>log<sub>2</sub>(m × n) = log<sub>2</sub> m + log<sub>2</sub> n</strong>。把每个数 v 画在离起点 log<sub>2</sub> v 远的地方，就得到一把<strong>对数尺</strong>：1、2、4、8… 等距排开，每一格代表「再乘一次 2」。在这把尺上，两个数相乘只要把两段长度首尾相接。同理，把 m 自乘 k 次就是把同一段接 k 次：<strong>log<sub>2</sub>(m<sup>k</sup>) = k × log<sub>2</sub> m</strong>。计算器出现以前，人们就用两把这样的尺子相对滑动来做乘法（计算尺）。',
    kSlider: '下方：m 自乘 k 次',
    s3lgM: '一段 log₂ m', s3lgN: '接上一段 log₂ n', s3lgK: '同一段 log₂ m 接 k 次',
    c3top: '上：m × n 在对数尺上是两段相加', c3bot: '下：mᵏ 是同一段接 k 次',
    s3readout: 'log₂ {m} + log₂ {n} ≈ {lm} + {ln} = {sum}，落点 {psum} = {mn}，正是 {m} × {n}。下方：{k} × log₂ {m} ≈ {kl}，落点 {pk} = {mk}{off}。',
    offRuler: '（超出尺子右端 1024，箭头被截断）',
    s3hint: '观察顺序：先让 n = 1，看青色那段长度为 0（乘 1 等于没乘，log₂1 = 0）；再把 n 调成 2，青色正好一格；把 m 和 n 都换成 2 的整数次幂（如 8 和 4），两段长度都是整数格。最后拖 k，看绿色那段一格一格地加长。',

    s4k: '第 4 步 · 对数刻度',
    s4t: '一张图里，怎样同时看清 2 和 1600 万？',
    s4e: '这一步要回答：第 0 步里 B 皿一大，A 皿就被压成一条线。办法是换成<strong>对数刻度</strong>：纵轴上相等的距离代表相等的<strong>倍数</strong>，而不是相等的差。这正是上一步的对数尺竖起来用。在对数刻度上，指数增长 y = r<sup>t</sup> 变成一条直线，因为每过 1 小时都乘 r，都往上走同样的 log r 格。下面的滑杆改每小时的增长倍数 r，图里点出每一次翻倍的时刻，两次翻倍之间的时长叫<strong>翻倍时间</strong> T，满足 r<sup>T</sup> = 2，也就是 T = log<sub>r</sub> 2。纵轴刻度可以按 2 的幂标，也可以按 10 的幂标：同一条线不动，只是读数换了一把尺子（<strong>换底</strong>）。',
    rSlider: '每小时增长倍数 r', axisLabel: '纵轴：', axisGroup: '纵轴刻度', axLin: '普通刻度', axLog: '对数刻度',
    tickLabel: '刻度标：', tickGroup: '刻度按哪个底数标', tk2: '2 的幂', tk10: '10 的幂',
    s4lgExp: '指数增长 y = rᵗ', s4lgLin: '第 0 步的 A 皿 1 + 3t', s4lgDbl: '每次翻倍的时刻',
    c4titleLin: '普通刻度：相等距离 = 相差相同的个数', c4titleLog: '对数刻度：相等距离 = 相差相同的倍数',
    c4x: '小时 t',
    s4readout: 'r = {r}：翻倍时间 T（满足 {r}ᵀ = 2）≈ {T} 小时（72 法则估 {r72} 小时{note}）。24 小时后 y = {r}²⁴ ≈ {y24}，log₂ y ≈ {l2}，log₁₀ y ≈ {l10}，两者之比 {ratio} = log₂ 10，与 r 无关。',
    r72good: '，r 接近 1 时这个估算很准',
    r72bad: '，r 离 1 越远估算越偏，它只适用于小增长率',
    s4hint: '观察顺序：在普通刻度下把 r 从 2 往下拖，橙色的 A 皿线从贴地变得看得见；切到对数刻度，青色变成直线，白点等距排开（每隔 T 小时翻一倍）。再在「2 的幂 / 10 的幂」之间切换：线不动，只是刻度数字变了。最后把 r 拖到 1.07 附近，比较 T 与 72 法则。',

    s5k: '第 5 步 · 自测与收束',
    s5t: '用「乘了几次」回答三个问题',
    s5e: '这一步要回答：前面的结论你能不能用上？每题都可以回到前面某一步的图上核对；答完按「检查答案」，每题会说明对错的理由。',
    q1: '① log₂(1/8) 等于多少？（提示：1/8 是从 1 出发往回除几次 2？）',
    q1a: '3', q1b: '−3', q1c: '1/3',
    q2: '② 某种细胞每小时数量乘 3。要变成原来的 81 倍，需要几小时？',
    q2a: '27 小时', q2b: '4 小时', q2c: '78 小时',
    q3: '③ 已知 2¹⁰ = 1024 ≈ 1000。那么 2²⁰ 大约是多少？',
    q3a: '大约 2000', q3b: '大约 20000', q3c: '大约 100 万',
    check: '检查答案',
    q1ok: '对：1 ÷ 2 ÷ 2 ÷ 2 = 1/8，往回除了 3 次，所以 log₂(1/8) = {v}。负的对数表示真数在 0 和 1 之间。',
    q1no: '再想想：{pick} 不对。3 是 log₂8；1/8 要从 1 往回除 3 次 2，往回走记作负数，答案是 {v}。',
    q2ok: '对：3 × 3 × 3 × 3 = 81，所以 log₃81 = {v}，需要 {v} 小时。',
    q2no: '再想想：{pick} 是把「乘」当成了「加」或「除」。81 = 3⁴，乘 4 次 3 就到了，log₃81 = {v}。',
    q3ok: '对：2²⁰ = 2¹⁰ × 2¹⁰ ≈ 1000 × 1000 = 100 万（精确值 {v}）。指数相加对应真数相乘，这就是第 3 步的对数尺。',
    q3no: '再想想：{pick} 是把指数翻倍当成了结果翻倍。2²⁰ = 2¹⁰ × 2¹⁰ ≈ 1000 × 1000，约 100 万（精确值 {v}）。',
    q0: '这一题还没选。',
    s5fin: '一条线索串起全页。<strong>第 0 步</strong>：加相同的数是线性增长，乘相同的倍数是指数增长，后者迟早会远远甩开前者。<strong>第 1 步</strong>：y = a<sup>x</sup> 都过 (0, 1)，a > 1 上升、0 < a < 1 下降。<strong>第 2 步</strong>：反过来问「乘几次 a 才到 y」，答案就是 log<sub>a</sub> y，不是整数时也是一个确定的数。<strong>第 3 步</strong>：对数数的是乘法次数，所以乘法变加法、乘方变乘法。<strong>第 4 步</strong>：对数刻度把指数增长拉成直线，不同底数的对数只差一个固定倍数。',
    formula: 'aˣ = y  ⟺  x = logₐ y\nlogₐ(m·n) = logₐ m + logₐ n\nlogₐ(mᵏ) = k · logₐ m',
    boundary: '适用范围：底数 a > 0 且 a ≠ 1，真数 y > 0。本页的细胞是理想模型：真实的培养皿会受空间和养分限制，长到一定数量后不再按固定倍数增长。72 法则只是 r 接近 1 时的近似，本页读数里同时给出了精确值。',
    linksTitle: '接着去哪',
    lk1: '→ 一次函数第 0 步：每走一步加同样的高度，就是本页 A 皿的直线',
    lk2: '→ 数列与求和第 2 步：等比数列，就是本页 B 皿每小时的细胞数',
    lk3: '→ 复利第 2 步：72 法则，翻倍时间的速算',
    lk4: '→ 信息熵第 1 步：用对数给「意外」标价，−log₂ p',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《指数与对数 · 翻倍与逆问》的平行版本。'
  },
  en: {
    pageTitle: 'Exponentials & Logarithms · Counting the Multiplications',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Exponentials & Logarithms · Doubling and the Reverse Question →',
    navLabel: 'Exponentials and logarithms steps',
    tagline: 'Two dishes of cells: one gains 3 cells an hour, the other doubles every hour. How far apart are they after a day? And backwards: if a colony has grown sixfold, how long did that take? The first answer is an exponential, the second a logarithm. Over six steps you will see that a logarithm simply counts how many times you multiplied — which is why it turns multiplication into addition.',
    nav0: '0 Add or multiply', nav1: '1 Exponential function', nav2: '2 The reverse question', nav3: '3 The log ruler', nav4: '4 Log scale', nav5: '5 Check · Wrap-up',

    s0k: 'Step 0 · Two kinds of growth',
    s0t: 'Adding 3 an hour vs. doubling every hour: who wins, and by how much?',
    s0e: 'This step asks: both dishes start with a single cell. Dish A <strong>gains 3 cells</strong> every hour; in dish B every cell splits in two each hour, so the count is <strong>multiplied by 2</strong>. After t hours A holds 1 + 3t cells and B holds 2<sup>t</sup> (2 multiplied by itself t times). Which dish has more, and by how much? In the bar chart the horizontal axis is the hour t and the vertical axis is the number of cells; the vertical scale stretches with your t so the tallest bar always fits. Growth like B’s — <strong>the same factor</strong> applied over each equal stretch of time — is called <strong>exponential growth</strong>; growth like A’s, adding the same amount each time, is linear.',
    hourSlider: 'Look at hour t', play0: 'Play from 0 to 24 hours',
    s0lgA: 'Dish A: +3 per hour', s0lgB: 'Dish B: ×2 per hour',
    c0title: 'Number of cells (vertical scale stretches with t)',
    c0A: 'A: +3', c0B: 'B: ×2', c0over: 'B pulls ahead',
    thHour: 'Hour t', thA: 'Dish A', thdA: 'A vs. last hour', thB: 'Dish B', thrB: 'B vs. last hour',
    s0readout: 'Hour {t}: A = 1 + 3×{t} = {A}, B = {Bx} = {B}. {lead}',
    leadA: 'A is still ahead, by {d} cells.',
    leadTie: 'The dishes are level.',
    leadB: 'B leads, with {ratio} times as many cells as A. B has been ahead ever since hour {over}.',
    playing: '(playing {t}/24)',
    s0hint: 'What to watch: drag t to 3 and then 4 and find the hour in the table where B overtakes A; then drag to 24. A’s bars flatten into a line along the floor — A did not shrink, the vertical axis was stretched to fit B. Every row of the table adds 3 for A and multiplies by 2 for B: that is the whole difference.',

    s1k: 'Step 1 · The exponential function',
    s1t: 'What does the curve look like when the factor isn’t 2 and time isn’t a whole number?',
    s1e: 'This step asks: draw “multiply by a for every unit of x” as a continuous curve, <strong>y = a<sup>x</sup></strong>. That is the <strong>exponential function</strong>; a is the <strong>base</strong> (the factor applied per unit) and x the <strong>exponent</strong> (how many units have passed). Fractional x still makes sense: the factor for half a unit, applied twice, has to give a, so a<sup>0.5</sup> = √a. Negative x means going backwards: each unit back divides by a, so a<sup>−1</sup> = 1/a. And x = 0 means “no multiplications yet”, so a<sup>0</sup> = 1 for every base. We keep a > 0: with a negative base, values like a<sup>0.5</sup> do not exist among the real numbers. The horizontal axis is x and the vertical axis is y = a<sup>x</sup>; the orange step goes from x to x + 1 and shows the height being multiplied by a.',
    baseSlider: 'Base a', xSlider: 'Exponent x (probe)', clearGhosts: 'Clear earlier curves',
    s1lgCurve: 'Current curve y = aˣ', s1lgGhost: 'Bases you tried earlier', s1lgStep: 'From x to x + 1: multiplied by a',
    c1title: 'y = aˣ (x across, y up)',
    s1readout: 'a = {a}, x = {x}: {p0} ≈ {y}; one more unit to the right, {p1} ≈ {y1}, exactly {ratio} times as much. {trend}',
    trendUp: 'a > 1: each unit of x multiplies y by more than 1, so the curve keeps rising, faster and faster.',
    trendDown: '0 < a < 1: each unit of x multiplies y by less than 1, so the curve falls towards 0 without ever reaching it. That is decay — a drug cleared from the body at a fixed percentage per hour, for instance.',
    trendFlat: 'a = 1: multiplying by 1 changes nothing, so y stays at 1 — a flat line. That is why an exponential function needs a ≠ 1.',
    s1hint: 'What to watch: set x to 0.5 and press a = 2 to read 2^0.5 ≈ 1.414 and what one more factor of 2 gives. Then drag only the base a: every curve, including the grey earlier ones, passes through the same point (0, 1) and stays above the horizontal axis. As a crosses 1, rising turns into falling.',

    s2k: 'Step 2 · The reverse question',
    s2t: '2 to what power makes 6 — and how do you find that power?',
    s2e: 'This step asks: so far we chose the exponent and got a result. Now turn it round: given the result, find the exponent. 2 to what power is 8? Three, because 2 × 2 × 2 = 8. That “what power” has a name, the <strong>logarithm</strong>: <strong>log<sub>2</sub> 8 = 3</strong>, read “log base 2 of 8”. In general the x with a<sup>x</sup> = y is written <strong>log<sub>a</sub> y</strong>: a is still the base (the factor you keep multiplying by) and y is the <strong>argument</strong> (the value you want to reach), so the logarithm counts how many factors of a it takes to get to y. It needs a > 0, a ≠ 1 and y > 0: multiplying positive numbers never gives zero or a negative, so log<sub>2</sub>(−4) has no real answer. The horizontal axis is x and the vertical axis y; the orange line is the target y, and where it meets the curve, dropping straight down to the axis gives the logarithm.',
    baseLabel: 'Base a:', baseGroup: 'Choose the base', targetSlider: 'Target y (the argument)', presetLabel: 'Handy targets:', bisect: 'Close in on the exponent',
    s2lgCurve: 'Curve y = aˣ', s2lgTarget: 'Target height y and its x', s2lgBand: 'Interval the answer is trapped in so far; short ticks on the axis are the x values tried (green = too small, red = too big)',
    c2title: 'From a target height y back to the exponent x',
    s2readoutExact: '{L} {y} = {x}: {a} multiplied by itself {x} times is exactly {y} — an exact whole-number answer.',
    s2readoutExactNeg: '{L} {y} = {x}: a negative exponent means dividing back, {y} = 1 ÷ {pabs}, exactly.',
    s2readout: '{L} {y} ≈ {x} (to 3 decimals). It is not a whole number: {Plo} = {plo} < {y} < {phi} = {Phi}, so the answer lies between {lo} and {hi}. Its exact name is simply {L} {y}.',
    guess0: 'Whole-number bracket: {Plo} = {plo} < {y} < {phi} = {Phi}, so the answer is in [{lo}, {hi}].',
    guessBig: 'Try {mid}: {Pmid} ≈ {p}, more than {y}, so the answer is in [{lo}, {mid}].',
    guessSmall: 'Try {mid}: {Pmid} ≈ {p}, less than {y}, so the answer is in [{mid}, {hi}].',
    guessEnd: 'After {k} halvings the interval is {w} wide, centred on {mid}; the true value {L} {y} ≈ {x}.',
    guessExact: '{y} is a whole-number power of {a}; there is nothing to close in on.',
    bisectProgress: 'Halved {k}/{N} times.',
    s2hint: 'What to watch: press the presets 8 and 32 and read two whole-number answers; switch to base 3 and drag the target near 81 (or check log₃81 = 4 in the readout). Then press preset 6 and “Close in on the exponent”: the orange interval halves each time, every x tried leaves a tick on the axis, and the ticks home in on 2.585. Finally press 1/8 and watch the logarithm turn negative.',

    s3k: 'Step 3 · The log ruler',
    s3t: 'Why does a logarithm turn multiplication into addition?',
    s3e: 'This step asks: log<sub>2</sub> m counts how many factors of 2 take you from 1 to m (that count is the logarithm). Multiply up to m, then keep going up to m × n, and the total count is the two counts added: <strong>log<sub>2</sub>(m × n) = log<sub>2</sub> m + log<sub>2</sub> n</strong>. Place every number v at a distance log<sub>2</sub> v from the start and you get a <strong>log ruler</strong>: 1, 2, 4, 8, … sit evenly spaced, each gap meaning “one more factor of 2”. On this ruler, multiplying two numbers means laying their two lengths end to end. Likewise, multiplying m by itself k times lays the same length down k times: <strong>log<sub>2</sub>(m<sup>k</sup>) = k × log<sub>2</sub> m</strong>. Before calculators, people multiplied by sliding two such rulers against each other — the slide rule.',
    kSlider: 'Lower ruler: m multiplied k times',
    s3lgM: 'A length log₂ m', s3lgN: 'Followed by a length log₂ n', s3lgK: 'The length log₂ m laid down k times',
    c3top: 'Top: m × n is two lengths added on the log ruler', c3bot: 'Bottom: mᵏ is one length laid down k times',
    s3readout: 'log₂ {m} + log₂ {n} ≈ {lm} + {ln} = {sum}, landing on {psum} = {mn}, which is {m} × {n}. Below: {k} × log₂ {m} ≈ {kl}, landing on {pk} = {mk}{off}.',
    offRuler: ' (past the ruler’s end at 1024, so the arrow is cut off)',
    s3hint: 'What to watch: first set n = 1 — the cyan length shrinks to nothing (multiplying by 1 does nothing, log₂1 = 0). Set n = 2 and the cyan length is exactly one gap. Pick powers of 2 for both m and n (say 8 and 4) and both lengths are whole gaps. Finally drag k and watch the green chain grow one copy at a time.',

    s4k: 'Step 4 · Log scale',
    s4t: 'How can one chart show both 2 and 16 million clearly?',
    s4e: 'This step asks: back in step 0, once dish B got large, dish A was flattened into a line. The fix is a <strong>log scale</strong>: equal distances on the vertical axis stand for equal <strong>factors</strong> rather than equal differences — it is the log ruler of the last step, stood on its end. On a log scale, exponential growth y = r<sup>t</sup> becomes a straight line, because every hour multiplies by r and so climbs the same log r. The slider sets the hourly growth factor r; the chart marks each moment the count doubles, and the time between doublings is the <strong>doubling time</strong> T, with r<sup>T</sup> = 2, i.e. T = log<sub>r</sub> 2. The axis can be labelled in powers of 2 or powers of 10: the line itself does not move, only the ruler you read it with changes (<strong>change of base</strong>).',
    rSlider: 'Hourly growth factor r', axisLabel: 'Vertical axis:', axisGroup: 'Vertical scale', axLin: 'Ordinary scale', axLog: 'Log scale',
    tickLabel: 'Label ticks in:', tickGroup: 'Which base labels the ticks', tk2: 'powers of 2', tk10: 'powers of 10',
    s4lgExp: 'Exponential growth y = rᵗ', s4lgLin: 'Dish A from step 0, 1 + 3t', s4lgDbl: 'Each doubling',
    c4titleLin: 'Ordinary scale: equal distance = equal difference', c4titleLog: 'Log scale: equal distance = equal factor',
    c4x: 'hour t',
    s4readout: 'r = {r}: doubling time T (where {r}ᵀ = 2) ≈ {T} hours (the rule of 72 estimates {r72} hours{note}). After 24 hours y = {r}²⁴ ≈ {y24}; log₂ y ≈ {l2}, log₁₀ y ≈ {l10}, and their ratio {ratio} = log₂ 10 does not depend on r.',
    r72good: ', very close while r is near 1',
    r72bad: ', and it drifts further off the further r is from 1 — it is only meant for small growth rates',
    s4hint: 'What to watch: on the ordinary scale, drag r down from 2 and dish A’s orange line rises off the floor. Switch to the log scale: the cyan curve becomes a straight line and the white dots sit evenly spaced, one doubling every T hours. Toggle between powers of 2 and powers of 10 — the line stays put, only the tick numbers change. Finally set r near 1.07 and compare T with the rule of 72.',

    s5k: 'Step 5 · Check and wrap-up',
    s5t: 'Three questions, answered by counting multiplications',
    s5e: 'This step asks: can you use what you found? Each question can be checked on one of the earlier charts; press “Check answers” and each answer comes back with the reason it is right or wrong.',
    q1: '① What is log₂(1/8)? (Hint: how many times do you divide 1 by 2 to reach 1/8?)',
    q1a: '3', q1b: '−3', q1c: '1/3',
    q2: '② A culture multiplies by 3 every hour. How many hours until it is 81 times its starting size?',
    q2a: '27 hours', q2b: '4 hours', q2c: '78 hours',
    q3: '③ 2¹⁰ = 1024 ≈ 1000. Roughly how big is 2²⁰?',
    q3a: 'about 2,000', q3b: 'about 20,000', q3c: 'about a million',
    check: 'Check answers',
    q1ok: 'Right: 1 ÷ 2 ÷ 2 ÷ 2 = 1/8 — three divisions back, so log₂(1/8) = {v}. A negative logarithm means the argument lies between 0 and 1.',
    q1no: 'Not quite: {pick} is wrong. 3 is log₂8; reaching 1/8 takes three divisions by 2 back from 1, and going backwards counts as negative, so the answer is {v}.',
    q2ok: 'Right: 3 × 3 × 3 × 3 = 81, so log₃81 = {v} and it takes {v} hours.',
    q2no: 'Not quite: {pick} treats the growth as adding or dividing. 81 = 3⁴ — four factors of 3 — so log₃81 = {v}.',
    q3ok: 'Right: 2²⁰ = 2¹⁰ × 2¹⁰ ≈ 1000 × 1000 = a million (exactly {v}). Adding exponents means multiplying the numbers — the log ruler of step 3.',
    q3no: 'Not quite: {pick} doubles the result instead of doubling the exponent. 2²⁰ = 2¹⁰ × 2¹⁰ ≈ 1000 × 1000, about a million (exactly {v}).',
    q0: 'No answer picked yet.',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: adding the same amount is linear growth, multiplying by the same factor is exponential growth, and the second always leaves the first far behind in the end. <strong>Step 1</strong>: every y = a<sup>x</sup> passes through (0, 1), rising when a > 1 and falling when 0 < a < 1. <strong>Step 2</strong>: asking “how many factors of a reach y?” gives log<sub>a</sub> y — a definite number even when it is not whole. <strong>Step 3</strong>: a logarithm counts multiplications, so products become sums and powers become products. <strong>Step 4</strong>: a log scale straightens exponential growth, and logarithms in different bases differ only by a fixed factor.',
    formula: 'aˣ = y  ⟺  x = logₐ y\nlogₐ(m·n) = logₐ m + logₐ n\nlogₐ(mᵏ) = k · logₐ m',
    boundary: 'Scope: base a > 0 with a ≠ 1, argument y > 0. The cells on this page are an idealised model: a real dish runs short of space and food, and growth stops being a fixed factor per hour. The rule of 72 is only an approximation for r near 1; the readouts show the exact value alongside it.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear functions, step 0: adding the same height for every step is dish A’s straight line',
    lk2: '→ Sequences & series, step 2: geometric sequences are dish B’s hourly counts',
    lk3: '→ Compound interest, step 2: the rule of 72, a quick estimate of doubling time',
    lk4: '→ Entropy, step 1: pricing surprise with a logarithm, −log₂ p',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Exponentials & Logarithms · Doubling and the Reverse Question”.'
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
