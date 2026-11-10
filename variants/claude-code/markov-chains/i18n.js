'use strict';
// Markov-chain lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '马尔可夫链 · 下一步只看现在',
    back: '← 知识索引',
    compare: '对照另一版本：马尔可夫链 · 下一步只看现在 →',
    navLabel: '马尔可夫链步骤导航',
    tagline: '城里有三个共享单车站：地铁、大学、公园。每辆车每天被骑走一次或留在原地，明天停在哪个站只取决于今天在哪，跟它前几天去过哪里无关。只要知道「从每个站去各站的概率」，能不能算出一个月后车都在哪？六步里你会看到：车队分布会忘掉起点、停在一个稳态；稳态是一种进出平衡；忘得多快由一个特征值决定；什么时候它会失灵；最后用同样的工具算出抛硬币等一个图案要多久。',
    nav0: '0 一辆车', nav1: '1 一整个车队', nav2: '2 稳态', nav3: '3 忘得多快', nav4: '4 失灵', nav5: '5 等一个图案', nav6: '6 收束',
    st0: '地铁', st1: '大学', st2: '公园', sep: '，',

    s0k: '第 0 步 · 一辆车',
    s0t: '这辆车今天在大学站，明天在各站的概率是多少？知道它昨天在哪有没有用？',
    s0e: '这一步要回答：要预测一辆车明天停在哪，需要知道它的哪些历史？把每个站叫作一个<strong>状态</strong>。<strong>转移概率</strong> P<sub>ij</sub> 是「今天在 i 站，明天在 j 站」的概率；把它们排成表就是<strong>转移矩阵</strong> P，每一行是一个出发站，行内三个数加起来等于 1。这个模型的核心假设叫<strong>无记忆性</strong>（马尔可夫性）：只要知道今天在哪，昨天、前天在哪都不再提供任何信息。图中箭头越粗概率越大，橙色是从车现在所在站出发的箭头；回到自己的小圈是「留在原站」。这些概率是教学设定，不是真实数据；模拟正是按无记忆规则生成的，下面「按昨天在哪分开统计」的那张表让你从数据里亲眼验证这一点。',
    c0title: '三个站之间的转移：箭头越粗，概率越大',
    c0strip: '这辆车最近 {n} 个位置（左旧右新）',
    s0lgOut: '从车现在所在站出发的转移', s0lgOther: '其他转移',
    go0a: '把车放到地铁站', go0b: '放到大学站', go0c: '放到公园站',
    day0: '过 1 天', days0: '连过 1000 天', clear0: '清空记录',
    mat0cap: '转移矩阵 P（行：今天在哪；列：明天在哪）',
    cond0cap: '今天在大学站的车，第二天去了哪：按「昨天在哪」分开统计',
    fromTo: '今天 \\ 明天', yest: '昨天在{s}', tomorrowAt: '明天{s}', cases: '次数', rowTruth: 'P 的大学行',
    s0readout: '已走 {days} 天，车现在在{s}站。明天的概率只看这一行：{row}。',
    s0hint: '观察顺序：先按几次「过 1 天」，看橙色箭头跟着车换站，下方色条记下走过的站。再按「连过 1000 天」两三次：分开统计的那张表里三行（昨天在地铁、大学、公园）的比例都靠近最下面一行 0.1、0.7、0.2；昨天在哪，没有改变明天的去向。这是模拟规则本身保证的；真实单车是否无记忆，要拿真实数据这样检验。',

    s1k: '第 1 步 · 一整个车队',
    s1t: '300 辆车今早全在地铁站，n 天后车队怎样分布在三个站？',
    s1e: '这一步要回答：不追踪每一辆车，能不能直接算出车队的分布？记第 t 天在各站的车所占的份额为一行数 π<sub>t</sub>。明天某站的份额 = 各站今天的份额 × 从那里来这个站的概率，再加起来：<strong>π<sub>t+1</sub> = π<sub>t</sub> P</strong>。反复乘 P，就得到任意一天的分布（<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step3">→ 特征向量第 3 步：反复乘同一个矩阵，主方向会自己浮出来</a>）。上图是选中那天三个站各有多少车（白色竖线是后面要讲的稳态份额），下图是份额逐日的变化，虚线是稳态份额。车数是 300 × 份额四舍五入，代表平均情况，不是一次模拟。',
    st1_m: '全在地铁出发', st1_u: '全在大学出发', st1_p: '全在公园出发', st1_even: '三站平分出发',
    c1a: '第 {day} 天各站份额（白线：稳态）', c1b: '各站份额随天数变化',
    s1lgPi: '稳态份额', s1lgBar: '上图白线：稳态份额',
    t1: '第几天', play1: '从第 0 天播放到第 20 天',
    s1readout: '第 {day} 天：{now}（车数约为 {bikes}）。稳态：{pi}。与稳态的差距（总变差距离：各站份额差的绝对值之和的一半）{gap}。',
    s1hint: '观察顺序：选「全在地铁出发」按播放，三条线在前几天剧烈变化，大约一周后贴到虚线上。再选「全在公园出发」「三站平分出发」重播：开头完全不同，终点却是同一组份额：地铁约 31%、大学约 40%、公园约 29%。车队「忘掉」了起点。',

    s2k: '第 2 步 · 稳态是一种平衡',
    s2t: '有没有一种分布，过一天之后完全不变？',
    s2e: '这一步要回答：上一步所有起点最后停在同一组份额，这组份额有什么特别？看一个站一天里的进出：<strong>流出</strong> = 今天在这里的份额 × 离开的概率（1 − 留下的概率），<strong>流入</strong> = 其他各站的份额 × 来这里的概率之和。每个站都进出相等时，明天的分布和今天一模一样，即 <strong>πP = π</strong>，这样的 π 叫<strong>稳态分布</strong>（平稳分布）。注意稳态不是车不动了：每天仍有大量车在站间流动，只是进出抵消。下面可以自己设定今天的份额，看各站的流出（粉）和流入（绿）。',
    c2title: '一天里各站的流出与流入（占全部车的份额）',
    s2lgOut: '流出：份额 × 离开的概率', s2lgIn: '流入：其他站份额 × 来这里的概率',
    a2: '今天在地铁的份额', b2: '今天在大学的份额', c2l: '在公园的份额（自动 = 剩下的）',
    step2b: '过一天', solve2: '直接解出稳态（解 πP = π）',
    s2readout: '今天：{now}。过一天：{next}。各站：{flows}。一天里分布变化了 {gap}（总变差距离），{st}。',
    flowItem: '{s}出 {o}、进 {i}',
    s2steady: '每个站进出相等，分布不再变：这就是稳态', s2moving: '还有站进出不等，分布会继续变',
    s2hint: '观察顺序：先保持默认（地铁 60%）：地铁的粉柱远高于绿柱，车在净流出。连按「过一天」，粉绿两柱逐渐等高。再按「直接解出稳态」：三站都是粉绿等高，变化为 0，份额是 13/42 ≈ 31.0%、17/42 ≈ 40.5%、12/42 ≈ 28.6%。每站每天仍有约 12%–16% 的车流出、同样多的车流入。',

    s3k: '第 3 步 · 忘掉起点要多久',
    s3t: '从一个站出发，要过多少天，车队分布才看不出起点？',
    s3e: '这一步要回答：收敛的快慢由什么决定？用第 1 步的总变差距离（各站份额差的绝对值之和的一半，0 表示与稳态完全一样）衡量离稳态多远，画在<strong>对数纵轴</strong>上：每往下一格，距离缩小到十分之一，于是「每天缩小同一个比例」会画成一条直线。这个比例最终由 P 的<strong>第二大特征值的模</strong> |λ₂| 决定：P 总有特征值 1，对应的就是稳态 π（<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step6">→ 特征向量第 6 步：稳态是 λ = 1 的特征向量</a>）；其余特征值的模都小于 1，偏离稳态的部分每天大约乘上 |λ₂|。滑杆加一点<strong>黏性</strong> s：每辆车每天先以概率 s 原地不动，否则照常按 P 走。稳态不变，特征值变成 (1 − s)λ + s，更靠近 1。',
    c3title: '与稳态的距离（对数纵轴）随天数变化',
    s3lg0: '从地铁出发', s3lg1: '从大学出发', s3lg2: '从公园出发', s3lgLam: '按 |λ₂| 每天缩小的参考线', s3lg01: '距离 0.01',
    s3l: '黏性 s（每天额外原地不动的概率）',
    s3readout: 's = {s}：除 1 以外的特征值为 {l1} 与 {l2}，|λ₂| = {lam}。从任何站出发，{days} 天后距离都降到 0.01 以下并保持。稳态仍是 {pi}。',
    s3hint: '观察顺序：s = 0 时三条线很快贴着白色虚线往下走，6 天内全部低于 0.01。把 s 拖到 0.5：线变平，|λ₂| = 0.7，要 14 天；拖到 0.9：|λ₂| = 0.94，要 78 天。读数里的稳态份额一直没变：黏性只拖慢速度，不改终点。',

    s4k: '第 4 步 · 什么时候会失灵',
    s4t: '是不是每条马尔可夫链都会忘掉起点、走到唯一的稳态？',
    s4e: '这一步要回答：前几步的「终点与起点无关」需要什么条件？对有限个状态的链，两个条件就够：<strong>不可约</strong>（从任何站出发，迟早都能到达任何站）和<strong>非周期</strong>（不会被锁死在固定的节奏里，比如只能隔两天回来一次）。下面换三张转移图对照：原来的单车网络；「转圈」（每辆车每天必定换到下一个站）；「断开」（公园与另外两站之间没有车来往）。下图实线从地铁出发，虚线从公园出发。',
    pr_normal: '原来的网络', pr_cycle: '转圈：每天必换下一站', pr_split: '断开：公园自成一体',
    c4a: '转移图（箭头越粗，概率越大）', c4b: '各站份额随天数变化',
    s4lgA: '实线：从地铁出发', s4lgB: '虚线：从公园出发',
    s4readout_normal: '第 30 天：从地铁出发 {a}；从公园出发 {b}。两条线重合，起点已被忘掉（|λ₂| = {lam}）。',
    s4readout_cycle: '从地铁出发，第 29 天是 {a1}，第 30 天是 {a}：全部车每天整体换一站，分布永远在转圈，不收敛（另外两个特征值的模 = {lam}）。各三分之一是稳态，但从单一站出发永远到不了。',
    s4readout_split: '第 30 天：从地铁出发 {a}；从公园出发 {b}。公园的车永远留在公园，终点取决于起点：稳态不唯一（特征值 1 出现了两次，|λ₂| = {lam}）。',
    s4hint: '观察顺序：先看「原来的网络」：实线和虚线几天后重合。换「转圈」：每条线在 0 和 1 之间来回跳，三天一个周期，永不平息（违反非周期）。换「断开」：从地铁出发的车在地铁和大学之间各占一半，从公园出发的车一直 100% 在公园（违反不可约）。',

    s5k: '第 5 步 · 等一个图案',
    s5t: '反复抛硬币，平均要抛几次才第一次出现 HH？HT 呢？',
    s5e: '这一步要回答：同样是连着两次、每次出现的概率都是 1/4 的图案，等待时间一样吗？用一条马尔可夫链来记「已经凑出了图案的多少」：状态 ∅ 表示还没开头，H 表示末尾已对上第一个字母，依此类推；最后一个状态（双圈）一旦到达就停止，叫<strong>吸收态</strong>。橙色箭头表示下一次抛出 H（正面）时去哪，青色表示抛出 T（反面）时去哪。设 E<sub>s</sub> 是从状态 s 出发还要抛的平均次数，看下一次抛：<strong>E<sub>s</sub> = 1 + ½E<sub>抛 H 后的状态</sub> + ½E<sub>抛 T 后的状态</sub></strong>，吸收态 E = 0，解这组方程就得到期望等待次数（<strong>首步分析</strong>）。下图是模拟出的等待次数分布（紫）与精确分布（橙色虚线），绿线是精确期望。',
    c5a: '等待 {pat} 的状态图', c5b: '第几次抛时第一次出现（40+ 合并为最后一格）',
    s5lgH: '下一次是 H', s5lgT: '下一次是 T', s5lgSim: '模拟的比例', s5lgEx: '精确概率', s5lgE: '精确期望',
    run5a: '再模拟 100 次', run5b: '再模拟 1000 次', reset5: '换一串随机数重来',
    s5empty: '{pat}：精确期望 {E} 次。四个图案的期望：{others}。按「再模拟 100 次」开始。',
    s5readout: '{pat}：已模拟 {n} 次，平均第 {mean} 次出现，精确期望 {E} 次。四个图案的期望：{others}。',
    s5hint: '观察顺序：先看 HH 的状态图：在 H 状态抛出 T，青色箭头把你送回 ∅，前功尽弃。再换 HT：在 H 状态再抛 H，橙色小圈让你留在 H，进度没丢。所以 HH 平均要 6 次，HT 只要 4 次。各按几次「再模拟 1000 次」，紫色柱贴近橙色虚线，平均值靠近绿线。HHH（14 次）和 HTH（10 次）也是同样的道理。',

    s6k: '第 6 步 · 收束',
    s6t: '一个转移矩阵能告诉你什么',
    s6fin: '<strong>马尔可夫链</strong>只用一个转移矩阵 P 描述「下一步只看现在」的随机过程。分布每天乘一次 P；在<strong>不可约</strong>且<strong>非周期</strong>的有限链里，无论从哪出发都会收敛到唯一的<strong>稳态</strong> π，它满足 πP = π，也就是每个状态进出相等。收敛快慢看第二大特征值的模 |λ₂|：离 1 越近，忘掉起点越慢。把某些状态设成只进不出（吸收态），同样的矩阵还能算等待时间和到达概率。',
    formula: 'π_{t+1} = π_t · P\n稳态：π P = π，Σ π = 1（每站进 = 出）\n与稳态的距离 ≈ C·|λ₂|^t',
    boundary: '适用范围：本页只讲有限个状态、时间一格一格走、转移概率不随时间变化的链；单车网络的概率是教学设定，不是任何城市的数据；无记忆性是模型假设，真实系统要用数据检验；|λ₂| 描述的是长期的缩小比例，最初几天可能更快或更慢；模拟用固定种子的伪随机数。',
    linksTitle: '接着去哪',
    lk1: '→ PageRank 第 1 步：随机点链接，最后停在哪里',
    lk2: '→ 特征向量第 6 步：稳态是 λ = 1 的特征向量',
    lk3: '→ 特征向量第 3 步：乘上一百次，主方向自己浮出来',
    lk4: '→ 概率与频率第 4 步：连出好几次红色，下一次会补偿吗（完全无记忆的极端情形）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《马尔可夫链 · 下一步只看现在》的平行版本。'
  },
  en: {
    pageTitle: 'Markov Chains · The Next Step Depends Only on Now',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Markov Chains · The Next Step Depends Only on Now →',
    navLabel: 'Markov chain steps',
    tagline: 'A town has three bike-share stations: Metro, Campus and Park. Each bike is ridden once a day or stays put, and where it ends up tomorrow depends only on where it is today, not on where it was the days before. If all you know is the chance of going from each station to each other one, can you work out where the bikes will be in a month? In six steps you will see the fleet forget its starting point and settle into a steady state; see that the steady state is a balance of flows; find that one eigenvalue sets how fast the start is forgotten; see when all this breaks; and finally use the same tool to work out how long you wait for a pattern of coin tosses.',
    nav0: '0 One bike', nav1: '1 The fleet', nav2: '2 Steady state', nav3: '3 How fast', nav4: '4 Failures', nav5: '5 Waiting', nav6: '6 Wrap-up',
    st0: 'Metro', st1: 'Campus', st2: 'Park', sep: ', ',

    s0k: 'Step 0 · One bike',
    s0t: 'This bike is at Campus today. Where will it be tomorrow, and does knowing where it was yesterday help?',
    s0e: 'This step answers: to predict where a bike will be tomorrow, how much of its history do you need? Call each station a <strong>state</strong>. The <strong>transition probability</strong> P<sub>ij</sub> is the chance of being at j tomorrow given you are at i today; laid out as a table they form the <strong>transition matrix</strong> P, one row per starting station, with each row adding up to 1. The model’s key assumption is <strong>memorylessness</strong> (the Markov property): once you know where the bike is today, where it was yesterday or the day before adds no information. Thicker arrows mean larger probabilities; orange arrows leave the station the bike is at now; the small loop back to a station means “stays put”. These probabilities are teaching values, not real data. The simulation is generated by exactly this memoryless rule, and the table below that splits by yesterday lets you check that in the data yourself.',
    c0title: 'Transitions: thicker arrow = higher probability',
    c0strip: 'The bike’s last {n} positions (oldest left, newest right)',
    s0lgOut: 'transitions from the bike’s current station', s0lgOther: 'other transitions',
    go0a: 'Put the bike at Metro', go0b: 'At Campus', go0c: 'At Park',
    day0: 'Next day', days0: 'Run 1000 days', clear0: 'Clear the record',
    mat0cap: 'Transition matrix P (row: where today; column: where tomorrow)',
    cond0cap: 'Bikes at Campus today: where they went next, split by where they were yesterday',
    fromTo: 'today \\ tomorrow', yest: 'yesterday at {s}', tomorrowAt: 'next: {s}', cases: 'count', rowTruth: 'Campus row of P',
    s0readout: '{days} days walked; the bike is now at {s}. Tomorrow’s probabilities come from this row alone: {row}.',
    s0hint: 'What to try: press “Next day” a few times and watch the orange arrows follow the bike while the strip below records its stops. Then press “Run 1000 days” two or three times: the three rows of the table split by yesterday (yesterday at Metro, Campus, Park) all approach the bottom row 0.1, 0.7, 0.2; where the bike was yesterday does not change where it goes next. Here that is guaranteed by the simulation rule itself; whether real bikes are memoryless has to be checked like this on real data.',

    s1k: 'Step 1 · The whole fleet',
    s1t: 'All 300 bikes start the morning at Metro. How is the fleet spread over the stations n days later?',
    s1e: 'This step answers: can you compute the fleet’s distribution without tracking every bike? Write the shares of bikes at each station on day t as a row of numbers π<sub>t</sub>. Tomorrow’s share at a station is each station’s share today times the chance of moving from there to here, summed: <strong>π<sub>t+1</sub> = π<sub>t</sub> P</strong>. Multiply by P again and again and you get the distribution on any day (<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step3">→ Eigenvectors, step 3: multiply by the same matrix many times and the dominant direction emerges</a>). The top chart shows how many bikes each station has on the chosen day (white ticks mark the steady-state shares explained next); the bottom chart shows the shares day by day, with the steady-state shares dashed. Bike counts are 300 × share, rounded: they describe the average, not one simulation.',
    st1_m: 'All start at Metro', st1_u: 'All start at Campus', st1_p: 'All start at Park', st1_even: 'Split evenly',
    c1a: 'Shares on day {day} (white tick: steady state)', c1b: 'Share at each station, day by day',
    s1lgPi: 'steady-state share', s1lgBar: 'top chart white tick: steady-state share',
    t1: 'Day', play1: 'Play from day 0 to day 20',
    s1readout: 'Day {day}: {now} (about {bikes} bikes). Steady state: {pi}. Distance from the steady state (total variation: half the sum of the absolute differences in share) {gap}.',
    s1hint: 'What to try: choose “All start at Metro” and press play. The three lines swing hard for the first few days and lie on the dashes after about a week. Replay from “All start at Park” and “Split evenly”: the beginnings are completely different, the ending is the same set of shares, Metro about 31%, Campus about 40%, Park about 29%. The fleet has “forgotten” where it started.',

    s2k: 'Step 2 · The steady state is a balance',
    s2t: 'Is there a distribution that stays exactly the same after one day?',
    s2e: 'This step answers: every start in step 1 ended at the same shares; what is special about them? Look at the traffic at one station over a day. <strong>Outflow</strong> = today’s share here × the chance of leaving (1 − the chance of staying); <strong>inflow</strong> = the sum over the other stations of their share × their chance of coming here. When every station has inflow equal to outflow, tomorrow’s distribution is identical to today’s, <strong>πP = π</strong>, and such a π is called the <strong>stationary distribution</strong> (steady state). The steady state is not bikes standing still: plenty of bikes still move between stations every day, the flows just cancel. Set today’s shares yourself and compare each station’s outflow (pink) and inflow (green).',
    c2title: 'One day’s outflow and inflow (share of all bikes)',
    s2lgOut: 'outflow: share × chance of leaving', s2lgIn: 'inflow: other stations’ shares × chance of coming here',
    a2: 'Share at Metro today', b2: 'Share at Campus today', c2l: 'Share at Park (the rest)',
    step2b: 'Next day', solve2: 'Solve for the steady state (πP = π)',
    s2readout: 'Today: {now}. After one day: {next}. Stations: {flows}. The distribution changed by {gap} in one day (total variation): {st}.',
    flowItem: '{s} out {o}, in {i}',
    s2steady: 'inflow equals outflow everywhere, so the distribution no longer changes. This is the steady state', s2moving: 'some station still has unequal flows, so the distribution will keep changing',
    s2hint: 'What to try: start from the default (60% at Metro). Metro’s pink bar towers over its green one: bikes are draining away. Press “Next day” repeatedly and the pink and green bars level up. Then press “Solve for the steady state”: every station has equal bars, the change is 0, and the shares are 13/42 ≈ 31.0%, 17/42 ≈ 40.5%, 12/42 ≈ 28.6%. Each station still sends out about 12%–16% of all bikes every day, and takes in just as many.',

    s3k: 'Step 3 · How long to forget the start',
    s3t: 'Starting from one station, how many days until the fleet no longer shows where it began?',
    s3e: 'This step answers: what sets the speed of convergence? Measure the distance from the steady state with step 1’s total variation distance (half the sum of absolute share differences; 0 means identical) and plot it on a <strong>logarithmic vertical axis</strong>, where each gridline down is ten times smaller, so “shrinking by the same factor every day” draws a straight line. In the long run that factor is the <strong>modulus of the second-largest eigenvalue</strong> of P, |λ₂|. P always has eigenvalue 1, and it belongs to the steady state π (<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step6">→ Eigenvectors, step 6: the steady state is the eigenvector with λ = 1</a>); every other eigenvalue has modulus below 1, and the departure from the steady state is multiplied by roughly |λ₂| each day. The slider adds <strong>stickiness</strong> s: each day every bike first stays put with probability s, and otherwise moves according to P. The steady state is unchanged, but each eigenvalue becomes (1 − s)λ + s, closer to 1.',
    c3title: 'Distance from the steady state (log axis) against days',
    s3lg0: 'starting at Metro', s3lg1: 'starting at Campus', s3lg2: 'starting at Park', s3lgLam: 'reference: shrinking by |λ₂| per day', s3lg01: 'distance 0.01',
    s3l: 'Stickiness s (extra chance of staying put each day)',
    s3readout: 's = {s}: the eigenvalues other than 1 are {l1} and {l2}, so |λ₂| = {lam}. From any station the distance falls below 0.01 and stays there after {days} days. The steady state is still {pi}.',
    s3hint: 'What to try: at s = 0 the three lines dive along the white dashes and are all below 0.01 within 6 days. Drag s to 0.5: the lines flatten, |λ₂| = 0.7, and it takes 14 days; at 0.9, |λ₂| = 0.94 and it takes 78 days. The steady-state shares in the readout never change: stickiness slows the journey but not the destination.',

    s4k: 'Step 4 · When it fails',
    s4t: 'Does every Markov chain forget its start and reach a single steady state?',
    s4e: 'This step answers: what does “the destination does not depend on the start” need? For a chain with finitely many states, two conditions are enough: <strong>irreducible</strong> (from any station you can sooner or later reach any station) and <strong>aperiodic</strong> (not locked into a fixed rhythm, such as returning only every third day). Compare three transition diagrams: the original bike network; a “cycle” (every bike moves on to the next station every day); and a “split” (no bikes travel between Park and the other two). Solid lines start at Metro, dashed lines at Park.',
    pr_normal: 'Original network', pr_cycle: 'Cycle: always move on', pr_split: 'Split: Park on its own',
    c4a: 'Transition diagram (thicker arrow, higher probability)', c4b: 'Share at each station, day by day',
    s4lgA: 'solid: starting at Metro', s4lgB: 'dashed: starting at Park',
    s4readout_normal: 'Day 30: starting at Metro {a}; starting at Park {b}. The lines coincide and the start is forgotten (|λ₂| = {lam}).',
    s4readout_cycle: 'Starting at Metro, day 29 is {a1} and day 30 is {a}: the whole fleet moves on one station every day, so the distribution cycles forever and never converges (the other two eigenvalues have modulus {lam}). One third each is a steady state, but you never reach it from a single station.',
    s4readout_split: 'Day 30: starting at Metro {a}; starting at Park {b}. Bikes at Park stay at Park forever, so the destination depends on the start: the steady state is not unique (eigenvalue 1 appears twice, |λ₂| = {lam}).',
    s4hint: 'What to try: start with the original network, where solid and dashed lines merge after a few days. Switch to the cycle: every line jumps between 0 and 1 with a three-day rhythm and never calms down (aperiodicity fails). Switch to the split: bikes starting at Metro end half at Metro and half at Campus, bikes starting at Park stay 100% at Park (irreducibility fails).',

    s5k: 'Step 5 · Waiting for a pattern',
    s5t: 'Toss a coin repeatedly. How many tosses until HH first appears, on average? And HT?',
    s5e: 'This step answers: both patterns are two tosses long and each has probability 1/4 at any given spot, so are the waits the same? Use a Markov chain to record how much of the pattern you have built so far: state ∅ means nothing yet, H means the last toss matches the first letter, and so on. The last state (double circle) ends the game once reached; it is called an <strong>absorbing state</strong>. Orange arrows show where you go if the next toss is H (heads), cyan arrows if it is T (tails). Let E<sub>s</sub> be the average number of tosses still needed from state s and look at the next toss: <strong>E<sub>s</sub> = 1 + ½E<sub>state after H</sub> + ½E<sub>state after T</sub></strong>, with E = 0 at the absorbing state. Solving these equations gives the expected wait (<strong>first-step analysis</strong>). Below, the simulated distribution of waits (violet) is compared with the exact one (orange dashes); the green line is the exact mean.',
    c5a: 'State diagram for waiting for {pat}', c5b: 'Toss on which it first appears (40+ in the last bin)',
    s5lgH: 'next toss is H', s5lgT: 'next toss is T', s5lgSim: 'simulated share', s5lgEx: 'exact probability', s5lgE: 'exact mean',
    run5a: 'Simulate 100 more', run5b: 'Simulate 1000 more', reset5: 'Restart with new random numbers',
    s5empty: '{pat}: exact expected wait {E} tosses. Expected waits for the four patterns: {others}. Press “Simulate 100 more” to start.',
    s5readout: '{pat}: {n} simulated waits, average {mean} tosses, exact expectation {E}. Expected waits for the four patterns: {others}.',
    s5hint: 'What to try: look at the diagram for HH first. A T in state H sends you back to ∅ along a cyan arrow and all progress is lost. Switch to HT: another H in state H keeps you at H on an orange loop, so nothing is lost. That is why HH takes 6 tosses on average and HT only 4. Press “Simulate 1000 more” a few times for each: the violet bars settle onto the orange dashes and the average approaches the green line. HHH (14) and HTH (10) work the same way.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What one transition matrix tells you',
    s6fin: 'A <strong>Markov chain</strong> describes a random process where the next step depends only on now, using nothing but a transition matrix P. The distribution is multiplied by P once per day; in a finite chain that is <strong>irreducible</strong> and <strong>aperiodic</strong> it converges from any start to a single <strong>steady state</strong> π with πP = π, meaning inflow equals outflow at every state. The speed of convergence is set by the second-largest eigenvalue modulus |λ₂|: the closer to 1, the slower the start is forgotten. Make some states enter-only (absorbing) and the same matrix gives waiting times and the chances of ending up in each place.',
    formula: 'π_{t+1} = π_t · P\nsteady state: π P = π, Σ π = 1 (in = out at every state)\ndistance from it ≈ C·|λ₂|^t',
    boundary: 'Scope: this page covers chains with finitely many states, time moving in whole steps, and transition probabilities that do not change over time. The bike-network probabilities are teaching values, not data from any city; memorylessness is a modelling assumption that real systems must be tested against; |λ₂| describes the long-run shrink factor, and the first few days can be faster or slower; simulations use a seeded pseudo-random generator.',
    linksTitle: 'Where to go next',
    lk1: '→ PageRank, step 1: click links at random; where do you end up?',
    lk2: '→ Eigenvectors, step 6: the steady state is the eigenvector with λ = 1',
    lk3: '→ Eigenvectors, step 3: multiply a hundred times and the main direction emerges',
    lk4: '→ Probability and frequency, step 4: after several reds, is blue “due”? (the extreme case with no memory at all)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Markov Chains · The Next Step Depends Only on Now”.'
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
  if (typeof window.refreshMarkov === 'function') window.refreshMarkov();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
