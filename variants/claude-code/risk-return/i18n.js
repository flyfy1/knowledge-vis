'use strict';
// Risk & return lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '风险与回报 · 为什么风险大的东西要许诺更多',
    back: '← 知识索引',
    compare: '对照另一版本：风险与回报 · 为什么风险大承诺回报高 →',
    navLabel: '风险与回报步骤导航',
    tagline: '手里有 100 元，放一年。一个选择稳稳多 3 元，另一个要掷骰子：可能多赚不少，也可能亏。两个平均一样多时，你选哪个？要让你改选掷骰子，得再多给你什么？六步里你会看到：「许诺的回报更高」不是风险的奖品，而是说服人承担风险的价钱，而且价钱付了，结果仍然要看骰子。',
    nav0: '0 先选一个', nav1: '1 风险是散开', nav2: '2 平均要靠很多次', nav3: '3 多给多少才肯换', nav4: '4 许诺不等于到手', nav5: '5 收束',

    s0k: '第 0 步 · 先选，再看',
    s0t: '平均拿回一样多，你选稳的还是掷骰子的？',
    s0e: '这一步要回答：两个选择的<strong>平均回报</strong>相同，它们还有什么不同？<strong>回报率</strong>是一年下来钱多了（或少了）百分之几：100 元变成 103 元，回报率就是 +3%。这里有两个虚构的选择，各放进 100 元，放一年：<strong>A「稳稳」</strong>每年固定 +3%；<strong>B「骰子」</strong>掷一个公平的六面骰子，六个面分别是 −17%、−9%、−1%、+7%、+15%、+23%。B 的平均回报（六个面加起来再除以 6）也是 +3%。先凭直觉选一个，再看下图。',
    pickA: 'A「稳稳」：一年后一定是 103 元', pickB: 'B「骰子」：一年后 83 到 123 元，看骰子',
    pickedA: '你选了 A。平均和 B 一样，都是 103 元，但 A 没有坏年份。这种「平均相同就要稳的」偏好叫<strong>不喜欢风险</strong>；第 3 步会问：B 要多给你多少，你才肯换？',
    pickedB: '你选了 B。平均和 A 一样，都是 103 元，可 B 有一半的面拿回不到 100 元。你愿意为可能的 123 元承担这份不确定；第 3 步会看到，不是每个人都愿意，B 得多给才能说服他们。',
    c0a: '一年后手里有多少钱（元）',
    rowA: 'A', rowB: 'B',
    lgA: 'A「稳稳」', lgB: 'B「骰子」的六个面', lgAvg: '平均（虚线）', lgStart: '本金 100 元',
    roll0: '替 B 掷一次骰子',
    money: '{v} 元',
    s0readout: 'A：一年后 {a}。B：六个面分别得 {amts}，平均 {avg}；有 {loss} 个面拿回不到 100 元。{last}',
    s0last: '刚才掷了 {n} 次，最近一次是 {r}%，拿回 {amt}。',
    s0none: '还没掷过骰子。',
    s0hint: '观察顺序：先选一个；再看图里两行，橙点是 B 的六个面，青点是 A（六个面都落在同一处）；最后按「掷一次」几下，每次只亮一个橙点，上方的小格记下它出现过几次。真正放钱的那一年，你只会得到其中一个点。',

    s1k: '第 1 步 · 风险指的是什么',
    s1t: 'B 的骰子面拉得越开，变的是什么？平均又变不变？',
    s1e: '这一步要回答：说 B「风险更大」，具体是哪个数更大？这里把 B 的平均固定在 +3%，只调<strong>摆幅 s</strong>：最好的面是 3% + s，最坏的面是 3% − s，六个面在两者之间等距排开。图上每个橙点到虚线（平均）有一段粉色连线，它的长度就是这个面离平均有多远。把六段长度取平均，得到<strong>平均偏离</strong>：结果通常离平均有多远（单位是百分点，越大越散）。本页说的<strong>风险</strong>就是这种散开程度，不是「平均变低」。正式课里常用的方差、标准差也是衡量散开的数，只是算法不同（<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ 概率分布第 2 步：方差怎样量出散布</a>）。',
    swing: '摆幅 s（百分点）',
    lgDev: '离平均的距离', lgTried: '试过的摆幅',
    c1a: 'B 的六个面（回报率 %）', c1b: '平均偏离（百分点）随摆幅变化',
    s1readout: '摆幅 {s}：六个面从 {lo}% 到 {hi}%，平均仍是 {avg}%。平均偏离 = 六段距离的平均 = {mad} 个百分点（恰好是摆幅的 0.6 倍）。亏钱的面：{loss}/6。',
    s1hint: '观察顺序：只拖摆幅。看上图：虚线（平均）一动不动，橙点向两边散开，粉色连线变长；看下图：每拖一次留下一个白点，它们排成一条直线。摆幅为 0 时 B 就变成了 A。',

    s2k: '第 2 步 · 平均是怎么来的',
    s2t: '平均 +3% 是「每年拿 3%」，还是「很多年平均下来 3%」？',
    s2e: '这一步要回答：B 的平均回报 +3% 到底在哪里能看到？平均是对<strong>很多次</strong>结果说的：掷很多次骰子，把回报率加起来除以次数，这个<strong>累计平均</strong>才会靠近 +3%。可是放钱的一年只掷一次。下面按 s = 20 的 B，连续掷 100 次（模拟，固定种子，每次刷新结果相同）：「累计平均回报」一图里橙点是每一次的回报率，白线是到目前为止的累计平均；「六个面各出现几次」一图数每个面出现的次数，粉色柱是亏钱的面（<a class="xlink" href="../../../probability/basics/expected-value/#step2">→ 期望第 2 步：多次平均为什么靠近期望</a>）。',
    play2: '连掷 100 次', seed2: '换一组骰子（新种子）',
    c2a: '累计平均回报（%）：第几次掷', c2b: '六个面各出现几次',
    lgRoll: '单次回报率', lgRun: '累计平均', lgLossBar: '亏钱的面',
    lgAvg3: '平均 +3%（虚线）', lgExpCount: '每个面理论上的次数：已掷次数 ÷ 6（虚线）',
    s2progress: '已掷 {k}/100 次。',
    s2readout: '{prog}第 {set} 组骰子：累计平均 {run}%（目标 +3%）；其中 {lossN} 次亏钱，占 {lossPct}%（理论上是一半）。单次回报最低 {lo}%、最高 {hi}%。',
    s2hint: '观察顺序：按「连掷 100 次」，先看白线：开头几次上下乱跳，越往后越贴近虚线 +3%；再看橙点：直到最后一次，单次结果仍然散在 −17% 到 +23%。换几组骰子比较：五组的白线终点都落在 +3% 上下 2.5 个百分点以内，比单次结果的 ±20 个百分点窄得多；而前十次的走法每组都不同。',

    s3k: '第 3 步 · 风险的价钱',
    s3t: 'B 的平均要比 A 高多少，人们才肯放下 A 去买 B？',
    s3e: '这一步要回答：为什么风险大的东西通常<strong>许诺</strong>更高的平均回报？设想一个虚构的小市场：100 位买家，人人都能拿到 A 的 +3%。每位买家心里有一个要求：B 的平均回报至少要比 A 高出「自己的补偿比例 × 摆幅」，他才肯换。补偿比例从 0.005 到 0.5 排开，代表有人很不在乎波动，有人很在乎。B 比 A 多许诺的那部分平均回报叫<strong>风险溢价</strong>（= B 的平均 − 3%）。卖 B 的人想卖给足够多的买家，就只能抬高许诺；摆幅越大，要抬得越多。',
    avgB: 'B 许诺的平均回报（%）',
    c3a: '上：两个选择的回报率（%）　下：100 位买家', c3b: '要说服多少人，需要多少溢价',
    lgYes: '愿意买 B', lgNo: '仍然选 A', lgNow: '当前的摆幅与溢价',
    c3bHalf: '50 人', c3bMost: '90 人',
    s3readout: '摆幅 {s}，B 许诺平均 {m}%，风险溢价 {p} 个百分点 → 100 位买家里 {n} 位愿意买 B。在这个摆幅下，要说服一半买家至少需要 {half} 个百分点，说服 90 位需要 {most} 个百分点。B 这一年落后 A 的面：{behind}/6。',
    s3hint: '观察顺序：先保持摆幅 20、把平均从 3% 往上拖，看「100 位买家」格子一格格变绿，「要说服多少人」一图里的白点往上走；再保持平均不动、把摆幅拖大，绿格变少：同样的许诺，在波动更大时说服不了那么多人。「要说服多少人」一图里的两条线就是说服 50 人、90 人需要的溢价，它们随摆幅一起变陡。',

    s4k: '第 4 步 · 许诺不等于到手',
    s4t: 'B 许诺平均 +8%，放很多年，就一定比 A 多吗？',
    s4e: '这一步要回答：付了风险溢价以后，持有 B 是否就稳赚？把 B 设成第 3 步里能说服一半买家的样子：平均 +8%、摆幅 20（六个面 −12%、−4%、+4%、+12%、+20%、+28%），每年掷一次，赚的钱接着参与下一年的增长（这叫<strong>复利</strong>：<a class="xlink" href="../../../investment/rates/compound-interest/#step0">→ 复利与贴现第 0 步</a>）。「200 条模拟路径」一图画出 100 元走过的 200 种可能（模拟，固定种子），纵轴每往上一格钱翻一倍；青线是 A 的 +3% 复利，白线是按许诺的 +8% 每年复利。「精确概率」一图的两条曲线不是模拟，是把所有可能的掷法逐一算出来得到的精确概率：粉线是「几年后落后 A 的机会」，绿线是「几年后连本金都没保住的机会」。',
    years: '持有年数',
    seed4: '换一批模拟路径',
    c4a: '200 条模拟路径：持有 t 年后的钱（元，每格翻倍）', c4b: '精确概率（%）随年数变化',
    lgPaths: 'B 的模拟路径（到所选年数时落后 A 的画成粉色）', lgSafeLine: 'A：每年 +3%', lgPromise: '按许诺 +8% 复利', lgBehind: '落后 A 的机会', lgLossCurve: '亏本的机会',
    s4readout: '持有 {T} 年：A 一定是 {safe}；按 +8% 复利算是 {promised}（这也是 B 所有结果的平均）。但 B 的中位数（一半结果多于它、一半少于它）只有 {median}。落后 A 的机会 {behind}%，亏本的机会 {loss}%（精确值）；这批模拟里 200 条路径有 {simBehind} 条落后 A。',
    s4hint: '观察顺序：先把年数拖到 1，再一格格拖到 20。「200 条模拟路径」：橙色路径像扇子一样张开，大多数在青线之上，但总有一些落在下面、变成粉色；「精确概率」：粉线、绿线一路下降，却到 20 年也没有降到 0。再看读数：中位数总比白线低，因为几条特别好的路径把平均拉高了。',

    s5k: '第 5 步 · 收束',
    s5t: '一句话：风险是散开，溢价是说服人承担散开的价钱',
    s5fin: '把六步连起来：两个选择平均一样时，B 多出来的只有<strong>散开</strong>（第 0、1 步）；平均要靠很多次才看得见，可一年只掷一次（第 2 步）；大多数人不白白承担散开，所以风险大的东西必须<strong>许诺</strong>更高的平均回报，这部分多出的叫风险溢价（第 3 步）；许诺的是平均，不是每个人的结果，放很多年落后的机会会变小，但不会变成零（第 4 步）。',
    formula: '回报率 = (年末 − 年初) ÷ 年初\n风险溢价 = 风险选择的平均回报 − 稳妥选择的回报\n平均偏离 = 各结果离平均的距离的平均',
    assume: '模型假设：本页全部数字都是虚构的教学例子，没有真实公司、行情或产品。B 是公平骰子，六个面等可能，每年独立重掷；买家的「补偿比例」是为了讲清机制设的均匀分布，现实中人们要求的补偿受很多因素影响，也不一定与摆幅成正比。没有费用、税和通胀；「风险更大回报更高」说的是许诺的平均，不保证某一只、某一年真的更高。',
    notAdvice: '这不是投资建议。本页只讲「为什么」，不推荐任何选择。',
    linksTitle: '接着去哪里',
    lk1: '→ 概率分布第 2 步：方差怎样量出「散开」',
    lk2: '→ 期望第 2 步：平均为什么要靠很多次才看得见',
    lk3: '→ 分散投资第 1 步：几个会一起涨跌的选择放在一起，散开会怎样变化',
    lk4: '→ 复利与贴现第 0 步：每年的回报怎样一年年滚起来',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《风险与回报 · 为什么风险大承诺回报高》的平行版本。'
  },
  en: {
    pageTitle: 'Risk & Return · Why Riskier Things Must Promise More',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Risk & Return · Why Do Riskier Things Usually Promise More →',
    navLabel: 'Risk and return steps',
    tagline: 'You have $100 to put away for a year. One choice adds a steady $3; the other rolls a die and might gain a lot or lose some. If both pay the same on average, which do you take? And what would it take to make you switch to the die? Over six steps you will see that a higher promised return is not a prize for risk — it is the price of persuading people to carry it, and even after the price is paid, the die still decides.',
    nav0: '0 Pick one', nav1: '1 Risk is spread', nav2: '2 Averages need many tries', nav3: '3 What it takes to switch', nav4: '4 A promise is not a payout', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Choose first, then look',
    s0t: 'Same payout on average — the steady one or the die?',
    s0e: 'The question here: if two choices have the same <strong>average return</strong>, what else separates them? A <strong>return</strong> is how many percent your money grew (or shrank) over the year: $100 becoming $103 is a return of +3%. Here are two invented choices, each holding $100 for one year. <strong>A, “Steady”</strong>, pays +3% every year. <strong>B, “Die”</strong>, rolls a fair six-sided die whose faces pay −17%, −9%, −1%, +7%, +15% and +23%. B’s average return (add the six faces, divide by 6) is also +3%. Trust your gut and pick one, then look at the chart.',
    pickA: 'A “Steady”: exactly $103 after a year', pickB: 'B “Die”: $83 to $123 after a year, depending on the roll',
    pickedA: 'You picked A. On average it pays the same $103 as B, but it has no bad years. Preferring the sure thing when averages match is called being <strong>risk-averse</strong>. Step 3 asks: how much more would B have to offer before you switch?',
    pickedB: 'You picked B. On average it pays the same $103 as A, yet half of B’s faces hand back less than $100. You are willing to carry that uncertainty for a shot at $123 — step 3 shows that not everyone is, and B has to offer more to win them over.',
    c0a: 'Money in hand after one year ($)',
    rowA: 'A', rowB: 'B',
    lgA: 'A “Steady”', lgB: 'B “Die”: its six faces', lgAvg: 'Average (dashed)', lgStart: 'The $100 you put in',
    roll0: 'Roll B’s die once',
    money: '${v}',
    s0readout: 'A: {a} after a year. B: the six faces give {amts}; average {avg}; {loss} faces hand back less than $100. {last}',
    s0last: 'Rolled {n} times so far; the latest was {r}%, leaving {amt}.',
    s0none: 'No rolls yet.',
    s0hint: 'What to watch: pick one first. Then read the two rows — orange dots are B’s six faces, the cyan dot is A (all six of its outcomes land on the same spot). Finally press “Roll” a few times: each roll lights up a single orange dot, and the tally boxes above count how often each face came up. In the one real year your money is in, you get exactly one of those dots.',

    s1k: 'Step 1 · What “risk” measures',
    s1t: 'Pull B’s faces further apart — what changes, and does the average move?',
    s1e: 'The question here: when we call B “riskier”, which number is bigger? B’s average is locked at +3%; you only change the <strong>swing s</strong>. The best face pays 3% + s, the worst 3% − s, and the six faces sit evenly in between. Each orange dot has a pink line to the dashed average; its length is how far that face lands from the average. Average those six lengths and you get the <strong>average distance from the mean</strong>: how far a result typically lands from the average (in percentage points; bigger means more spread). On this page, <strong>risk</strong> means exactly this spread — not a lower average. Textbooks usually measure spread with variance or standard deviation instead; they are computed differently but answer the same question (<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ Probability distributions, step 2: how variance measures spread</a>).',
    swing: 'Swing s (percentage points)',
    lgDev: 'Distance from the average', lgTried: 'Swings you tried',
    c1a: 'B’s six faces (return, %)', c1b: 'Average distance from the mean (pts) vs swing',
    s1readout: 'Swing {s}: the faces run from {lo}% to {hi}% and the average stays {avg}%. Average distance from the mean = mean of the six pink lengths = {mad} points (exactly 0.6 × the swing). Faces that lose money: {loss}/6.',
    s1hint: 'What to watch: move only the swing. In the top chart the dashed average never moves while the orange dots fan out and the pink lines grow. In the bottom chart every swing you try leaves a white dot, and the dots line up on a straight line. At a swing of 0, B simply becomes A.',

    s2k: 'Step 2 · Where an average lives',
    s2t: 'Does “+3% on average” mean 3% each year, or 3% across many years?',
    s2e: 'The question here: where can you actually see B’s +3% average? An average describes <strong>many</strong> tries: roll the die again and again, add up the returns and divide by the number of rolls, and that <strong>running average</strong> creeps toward +3%. But a year with your money in it gets a single roll. Below, B with s = 20 is rolled 100 times in a row (simulated with a fixed seed, so it is the same on every load). In the “running average” chart each orange dot is one roll’s return and the white line is the average so far; the “how often each face came up” chart counts the faces, with money-losing faces in pink (<a class="xlink" href="../../../probability/basics/expected-value/#step2">→ Expected value, step 2: why many tries settle near the expected value</a>).',
    play2: 'Roll 100 times', seed2: 'Fresh die (new seed)',
    c2a: 'Running average return (%) by roll number', c2b: 'How often each face came up',
    lgRoll: 'One roll’s return', lgRun: 'Running average', lgLossBar: 'Money-losing faces',
    lgAvg3: 'Average +3% (dashed)', lgExpCount: 'Expected count per face: rolls so far ÷ 6 (dashed)',
    s2progress: 'Rolled {k}/100. ',
    s2readout: '{prog}Die set {set}: running average {run}% (target +3%); {lossN} rolls lost money, {lossPct}% of them (half, in theory). Single rolls ranged from {lo}% to {hi}%.',
    s2hint: 'What to watch: press “Roll 100 times” and follow the white line — it jumps around early, then hugs the +3% dashed line. Now look at the orange dots: right to the last roll, single results still scatter from −17% to +23%. Try a few fresh dice: in all five sets the line ends within 2.5 points of +3% — far tighter than the ±20-point scatter of single rolls — yet the first ten rolls look different every time.',

    s3k: 'Step 3 · The price of risk',
    s3t: 'How much more than A must B pay on average before people give up A for it?',
    s3e: 'The question here: why do riskier things usually <strong>promise</strong> a higher average return? Picture an invented little market of 100 buyers, all of whom can get A’s +3%. Each buyer will switch to B only if B’s average beats A by at least “my personal compensation ratio × swing”. The ratios run evenly from 0.005 to 0.5 — some buyers barely mind the swings, others mind a lot. The extra average B promises over A is the <strong>risk premium</strong> (= B’s average − 3%). Whoever sells B and wants enough buyers has to raise the promise, and the bigger the swing, the more it has to rise.',
    avgB: 'Average return B promises (%)',
    c3a: 'Top: each choice’s returns (%) · Bottom: 100 buyers', c3b: 'Premium needed to win over a crowd',
    lgYes: 'Willing to buy B', lgNo: 'Still prefers A', lgNow: 'Current swing and premium',
    c3bHalf: '50 buyers', c3bMost: '90 buyers',
    s3readout: 'Swing {s}, B promises {m}% on average, a risk premium of {p} points → {n} of 100 buyers will take B. At this swing, winning over half the buyers takes at least {half} points and winning 90 takes {most}. Faces where B trails A this year: {behind}/6.',
    s3hint: 'What to watch: keep the swing at 20 and raise B’s average from 3% — the buyer grid turns green square by square and the white dot in “premium needed” climbs. Then hold the average and widen the swing: green squares disappear, because the same promise persuades fewer people when the ride is bumpier. The two lines in “premium needed” show what it takes to win 50 and 90 buyers; both get steeper as the swing grows.',

    s4k: 'Step 4 · A promise is not a payout',
    s4t: 'B promises +8% on average. Hold it for years — is it sure to beat A?',
    s4e: 'The question here: once the risk premium is paid, is holding B a sure win? Set B to what persuaded half the buyers in step 3: average +8%, swing 20 (faces −12%, −4%, +4%, +12%, +20%, +28%). Roll once a year, and let each year’s gain keep growing the next year — that is <strong>compounding</strong> (<a class="xlink" href="../../../investment/rates/compound-interest/#step0">→ Compound interest, step 0</a>). The “200 simulated paths” chart shows 200 possible journeys of $100 (simulated, fixed seed); each grid line up means the money has doubled. The cyan line is A compounding at +3%; the white line is the promised +8% compounding every year. The curves in the “exact chance” chart are not simulated: they are exact probabilities from working through every possible sequence of rolls — pink is the chance of trailing A after that many years, green the chance of ending below the $100 you started with.',
    years: 'Years held',
    seed4: 'New batch of simulated paths',
    c4a: '200 simulated paths: money after t years ($, doubling grid)', c4b: 'Exact chance (%) by years held',
    lgPaths: 'B’s simulated paths (pink if behind A at the chosen year)', lgSafeLine: 'A: +3% a year', lgPromise: 'Promised +8% compounding', lgBehind: 'Chance of trailing A', lgLossCurve: 'Chance of a loss',
    s4readout: 'After {T} years A is exactly {safe}; compounding the promised +8% gives {promised} (which is also the average over all of B’s outcomes). But B’s median — half of outcomes above it, half below — is only {median}. Chance of trailing A: {behind}%; chance of a loss: {loss}% (exact). In this simulated batch, {simBehind} of 200 paths trail A.',
    s4hint: 'What to watch: drag the years to 1, then step up to 20. In “200 simulated paths”, the orange paths fan out like a hand of cards; most stay above the cyan line, but some always fall below it and turn pink. In “exact chance”, the pink and green curves keep falling yet never reach 0, even at 20 years. In the readout, the median always sits below the white line, because a few very lucky paths pull the average up.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'In one line: risk is spread, and the premium is the price of carrying it',
    s5fin: 'Put the six steps together. When two choices share an average, the only thing B adds is <strong>spread</strong> (steps 0–1). An average shows up only over many tries, but a year gets a single roll (step 2). Most people will not carry spread for free, so riskier things have to <strong>promise</strong> a higher average return; that extra is the risk premium (step 3). What is promised is the average, not anyone’s result: over many years the chance of trailing shrinks, but it does not reach zero (step 4).',
    formula: 'return = (end − start) ÷ start\nrisk premium = risky choice’s average return − safe choice’s return\naverage distance from the mean = mean of each result’s distance from the average',
    assume: 'Model assumptions: every number on this page is an invented teaching example — no real company, market or product. B is a fair die with six equally likely faces, re-rolled independently each year. The buyers’ compensation ratios are spread evenly just to show the mechanism; in reality what people demand depends on many things and need not be proportional to the swing. No fees, taxes or inflation. “Riskier pays more” is about the promised average; it does not guarantee that any particular choice or year actually pays more.',
    notAdvice: 'This is not investment advice. The page explains the “why” and recommends nothing.',
    linksTitle: 'Where to go next',
    lk1: '→ Probability distributions, step 2: how variance measures spread',
    lk2: '→ Expected value, step 2: why an average needs many tries to show up',
    lk3: '→ Diversification, step 1: what happens to spread when you combine choices that move together',
    lk4: '→ Compound interest, step 0: how yearly returns snowball',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Risk & Return · Why Do Riskier Things Usually Promise More”.'
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
if (typeof window !== 'undefined') window.RR_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
