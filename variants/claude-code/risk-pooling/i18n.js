'use strict';
// Risk pooling lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '风险池化与保险 · 把一场赌局变成一笔账',
    back: '← 知识索引',
    compare: '对照另一版本：风险池化与保险 · 一万人各摊一点 →',
    navLabel: '风险池化步骤导航',
    tagline: '一户人家每年有 1% 的可能遭遇一场 1 万元的损失（比如一场火灾），否则什么也不发生。对这一户来说，这是一场 0 或 1 万元的赌局，没法做预算。如果很多户约好平摊每年的损失，会怎样？六步里你会看到：「人多」怎样把赌局变成一笔几乎算得准的账；要多收多少钱才不怕赔穿；以及两种让池子失灵的情形：大家同时出事，和只有高风险的人留下。',
    nav0: '0 平摊', nav1: '1 √N 定律', nav2: '2 定价', nav3: '3 一起出事', nav4: '4 只剩高风险', nav5: '5 收束',
    moneyFmt: '{v} 元',
    axesFmt: '「{c}」：横轴是{x}，纵轴是{y}。',

    s0k: '第 0 步 · 平摊',
    s0t: '一户扛不住的损失，如果 N 户平摊，每户每年要出多少？',
    s0e: '这一步要回答：把很多户的损失合起来平摊，每户每年的花费会怎样变化？设定（模拟）：每户每年独立地以概率 p 遭受一次 1 万元损失。一户的<strong>期望损失</strong>是 p × 1 万元，即很多年平均下来每年损失多少，p = 1% 时是 100 元（<a class="xlink" href="../../../probability/basics/expected-value/#step4">→ 期望页第 4 步：保险为什么按期望来比较</a>）。N 户约好：每年把当年所有损失加起来，平均分摊。图里是同样 40 年中，每户每年分摊到的钱。柱子越贴近橙色虚线（期望损失），这笔账越好预算。',
    shareN: '一起平摊的户数 N', p0: '每户每年出事的概率 p', reroll0: '换 40 年',
    c0a: '每户每年分摊的钱（40 年）', axYear: '第几年', axCost: '每户分摊的钱（元）',
    s0lgBar: '每户当年分摊', s0lgClip: '超出图顶（截断，实际值见读数）', s0lgExp: '期望损失 p × 1 万元',
    s0readout: 'N = {n}：40 年里有 {yl} 年出现损失；每户每年平均分摊 {avg}（期望 {exp}），最多的一年 {max}，各年之间的标准差 {sd}（理论 {sdth}）。',
    s0hint: '观察顺序：保持 p = 1%，把 N 从 1 拖到 10000。N = 1 时，大多数年份是 0，偶尔一年要掏 1 万元（粉色柱，超出图顶的部分被截断）；N = 100 时，每年在 0 到几百元之间跳；N = 10000 时，每年都在 100 元上下很窄的范围里。按「换 40 年」看另一段经历。标准差衡量各年偏离平均的典型大小，理论值是 1 万元 × √(p(1 − p)/N)。',

    s1k: '第 1 步 · 平方根定律',
    s1t: '户数多 100 倍，每户的账稳多少？',
    s1e: '这一步要回答：每户分摊额的起伏随 N 怎样缩小？固定 p = 1%，对每个 N 模拟 400 年。每户每年分摊额 = 1 万元 × 当年出事户数 ÷ N。<strong>标准差</strong>（各年分摊额偏离平均的平方取平均、再开方）衡量它年年起伏多大。理论值 σ = 1 万元 × √(p(1 − p)/N)：总损失的方差与 N 成正比，平摊时要除以 N²，所以每户分摊额的方差按 1/N 缩小，标准差按 1/√N 缩小，这就是<strong>平方根定律</strong>（<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ 中心极限定理页第 3 步：精度的代价按 √n 计</a>）。「标准差 vs N」图的两条轴都用对数刻度（相邻刻度相差 10 倍），1/√N 在上面是一条下斜的直线。',
    lawN: '户数 N',
    c1a: '每户分摊额的标准差 vs N（对数刻度）', c1b: 'N 户时，400 年分摊额的分布',
    s1lgSim: '模拟（400 年）', s1lgTh: '理论 1 万元 × √(p(1−p)/N)', s1lgExp: '期望 100 元',
    s1readout: 'N = {n}：400 年里分摊额平均 {m}，标准差实测 {sd}、理论 {th}。「坏年份」（分摊额超过期望的 2 倍，即 200 元）的精确概率 {bad}。',
    s1hint: '观察顺序：拖 N，看「标准差 vs N」图里青点沿直线往下走：N 从 100 到 10000（大 100 倍），标准差从约 100 元降到约 10 元（小 10 倍）。再看「分布」图：N 小时分摊额只能取少数几个值（1 万元 ÷ N 的整数倍），N 大时堆成窄窄的一座山。坏年份概率在 N ≥ 100 以后迅速变小；N 很小时它会忽高忽低，因为出事户数只能是整数。',

    s2k: '第 2 步 · 定价',
    s2t: '每户多交多少，池子才几乎不会赔穿？',
    s2e: '这一步要回答：保费要比期望损失高多少，才能把「当年赔款超过保费总额」（叫<strong>赔穿</strong>）的概率压到目标 ε 以下？设定：每户出事概率 p = 1%，每次赔 1 万元；每户交保费 (1 + θ) × 100 元，θ 叫<strong>附加费率</strong>，即比期望损失多收的比例。当年出事户数 K 服从<strong>二项分布</strong>：N 次独立尝试、每次成功概率 p，恰好成功 k 次的概率（<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ 二项分布到正态页第 0 步：k 次成功有几条路径</a>）。保费总额够赔 k* 次时，赔穿概率 = P(K > k*)，这里用二项分布精确计算。对每个 N，取让赔穿概率 ≤ ε 的最小 k*，就得到所需的最小附加费率 θ = k* ÷ (N·p) − 1。',
    loadN: '户数 N', eps2: '可接受的赔穿概率 ε',
    epsName0: '5%（约 20 年一遇）', epsName1: '1%（约 100 年一遇）', epsName2: '0.1%（约 1000 年一遇）',
    c2a: '当年出事户数 K 的概率（粉色 = 赔穿）', c2b: '所需附加费率 θ vs N（对数刻度）', axK: '出事户数 K', axProb: '概率', axN: '户数 N（对数刻度）', axTheta: '附加费率 θ（对数刻度）', axSd: '标准差（元，对数刻度）', axFreq: '占 400 年的比例',
    s2lgPmf: 'K 的概率（二项分布）', s2lgK: '保费能赔的上限 k*', s2lgRuin: '赔穿的部分', s2lgCurve: '三种 ε 的曲线（当前 ε 加粗）', s2lgNorm: '当前 ε 的正态近似',
    s2readout: 'N = {n}，ε = {eps}：保费总额至少要够赔 k* = {k} 次（平均出事 {mean} 户）。每户保费 {prem}，附加费率 θ = {theta}；精确赔穿概率 {ruin}。正态近似给出 θ ≈ {norm}。',
    s2hint: '观察顺序：先固定 ε = 1%，把 N 从 10 拖到 100000：「K 的概率」图里的山相对于自己的平均越来越窄，赔穿所需的余量也越来越小；「附加费率」图里的点沿曲线下降。N = 10 时每户要多交 900%（保费总额至少要够赔一次，即 1 万元由 10 户分担）；N ≥ 1000 以后，N 每大 100 倍，所需附加费率大约降到 1/10。再换 ε：要求越严（1000 年一遇），曲线越高。当 ε 是 1% 或 0.1% 时，读数里的正态近似在 N 小时明显偏低，例如 N = 100、ε = 1% 时精确值 300%、近似值约 231%，因为 N 小时出事户数的分布向右偏。',

    s3k: '第 3 步 · 一起出事',
    s3t: '暴风雨的年份家家同时受灾，户数再多还管用吗？',
    s3e: '这一步要回答：损失不再互相独立时，池子还能把账摊平吗？设定（模拟）：普通年份每户出事概率 p₀ = 1%；但每年有 q 的概率是<strong>暴风雨年</strong>，这一年里每户的出事概率都升到 p₁。同一年里各户仍各自掷骰子，但大家共用同一个「这一年好不好」，这叫<strong>共同冲击</strong>。第一张图是 10000 户的池子 40 年里每户的分摊额，橙色柱是暴风雨年。第二张图比较标准差随 N 的变化：平均出事概率相同、但各户完全独立（虚线），和有共同冲击（实线）。共同冲击那部分起伏只取决于「这一年是不是暴风雨年」，平摊给再多户也不会变小，所以标准差有一个下限：1 万元 × (p₁ − p₀) × √(q(1 − q))。',
    p1: '暴风雨年的出事概率 p₁', q3: '暴风雨年的频率 q', reroll3: '换 40 年',
    c3a: '10000 户：每户每年分摊额（橙色 = 暴风雨年）', c3b: '每户分摊额的标准差 vs N（对数刻度）',
    s3lgCalm: '普通年', s3lgStorm: '暴风雨年', s3lgCorr: '有共同冲击', s3lgInd: '平均概率相同但独立', s3lgFloor: '下限',
    s3readout: 'p₁ = {p1}，q = {q}：平均出事概率 {pbar}。N = 10000 时，有共同冲击的标准差是 {sd}，各户独立时只有 {ind}；下限 {floor}。{nstar}这 40 年里有 {ns} 个暴风雨年。',
    s3nstar: 'N 超过约 {n} 户以后，起伏主要来自共同冲击，再加人几乎不再降低波动。',
    s3nofloor: '现在没有共同冲击（p₁ = p₀ 或 q = 0），下限为 0，两条线重合。',
    s3hint: '观察顺序：先看默认设定（p₁ = 5%，q = 10%）：第一张图里普通年份的柱子几乎一样高，暴风雨年突然高出好几倍；第二张图里实线从 N 约 1000 起就贴在下限上，虚线却一直往下走。把 q 或 p₁ 拖到最小：下限降到 0，实线贴回虚线。所以对保险人威胁最大的不是单个客户出事，而是很多客户同时出事；地震、洪水这类风险靠单纯扩大池子分散不掉，常见的做法是再保险、跨地区分散，或由政府兜底。',

    s4k: '第 4 步 · 只剩高风险',
    s4t: '每户风险不同，却交一样的保费，谁会先走？',
    s4e: '这一步要回答：按全池平均定价时，池子会不会自己散掉？设定（模拟）：1000 户的年出事概率各不相同，从 0.2% 到 8% 在对数刻度上均匀分布（全体平均约 2.1%）。保险人看不出谁的风险高，只能统一收费：保费 = 1.1 × 池中各户期望损失的平均（附加费率 10%）。每户愿付的最高价 = (1 + m) × 自己的期望损失，m 表示多怕风险：m = 100% 就是愿意付到自己期望损失的 2 倍来换安心。保费高于愿付价的户退出；退出的多是低风险户，池子的平均风险上升，下一轮保费更高，可能又走一批。这叫<strong>逆向选择</strong>：统一价格把低风险的人挑出去了。',
    m4: '愿付加价 m（相对自己的期望损失）', next4: '下一轮', run4: '一直算到稳定', reset4: '回到第 0 轮',
    c4a: '每户的愿付价（按风险排开）与当前保费', c4b: '每一轮的统一保费与留下的比例', axRisk: '年出事概率（对数刻度）', axWtp: '愿付价（元，对数刻度）', axRound: '轮次', axPrem: '统一保费（元）', axShare: '留下的比例', axPremShare: '保费（元，上）与留下的比例（下）',
    s4lgIn: '还在池中的户', s4lgOut: '已退出的户', s4lgPrem: '当前统一保费', s4lgEl: '期望损失 p × 1 万元',
    s4readout: '第 {k} 轮：统一保费 {prem}，池中还剩 {share}%（平均出事概率 {mp}）。{state}',
    s4stable: '已稳定：下一轮没有人再退出。', s4going: '下一轮还会有人退出。', s4empty: '池子空了：最后留下的人也嫌贵，市场消失。',
    s4rated: '对照：如果能按各户风险分别定价（每户付 1.1 × 自己的期望损失），m = {m} 时会留下 {share}% 的户。',
    s4hint: '观察顺序：先把 m 设为 100%，反复按「下一轮」：第一张图里的保费水平线一轮轮抬高，左边（低风险）的点一段段变灰；第二张图的保费一轮比一轮高，最后停住，只剩约三成的户。再把 m 调到 0（只愿按期望损失付钱）并按「一直算到稳定」：第 4 轮时池子彻底空掉。改动 m 会回到第 0 轮。即使 m = 300%（愿付到期望损失的 4 倍），风险最低的约四成户也会走。按风险分档定价、强制参保或补贴是常见的应对，读数最后一行给出按风险定价时的对照。',

    s5k: '第 5 步 · 收束', s5t: '人多能平掉的，和人多也平不掉的',
    s5fin: '回头看：<strong>第 0 步</strong>，一户人家面对 0 或 1 万元的赌局；N 户平摊，每户每年的账围着期望损失 p × 1 万元小幅起伏。<strong>第 1 步</strong>，起伏的标准差是 1 万元 × √(p(1 − p)/N)，按 1/√N 缩小。<strong>第 2 步</strong>，要把赔穿概率压到 ε，附加费率随 N 增大才降得下来：以 ε = 1% 为例，N = 10 时要 900%，N = 10 万时只要 7.4%。<strong>第 3 步</strong>，共同冲击让起伏有一个不随 N 下降的下限。<strong>第 4 步</strong>，统一定价会把低风险的人挤出去，池子可能缩到只剩高风险户，甚至消失。',
    formula: '分摊的标准差 = L·√(p(1−p)/N)\n附加费率 θ = k*/(Np) − 1\n（k* 取 P(K > k*) ≤ ε 的最小值）\n共同冲击下限 = L·(p₁−p₀)·√(q(1−q))',
    boundary: '适用范围：本页每户只有「出事 / 不出事」两种结果，损失固定为 1 万元（L）；真实保险的损失金额有大有小，少数巨额损失会让平均值收敛得更慢。赔穿概率只看一年，不含资本金、投资收益和经营费用。共同冲击用两状态模型（普通年 / 暴风雨年）表示；逆向选择中每户的「愿付价」是极简化的假设。所有数据都是模拟或精确计算，不是真实保险公司的数据。',
    linksTitle: '接着去哪儿',
    lk1: '→ 期望页第 4 步：保险为什么按期望来比较',
    lk2: '→ 中心极限定理页第 3 步：精度的代价按 √n 计',
    lk3: '→ 二项分布到正态页第 4 步：n 要多大，正态近似才够用',
    lk4: '→ 泊松过程页第 2 步：固定一段时间里的到达个数怎样分布',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《风险池化与保险 · 一万人各摊一点》的平行版本。'
  },
  en: {
    pageTitle: 'Risk Pooling & Insurance · Turning a Gamble into a Budget',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Risk Pooling & Insurance · Ten Thousand People Each Chip In →',
    navLabel: 'Risk pooling steps',
    tagline: 'Each year a household has a 1% chance of a $10,000 loss (a fire, say) and otherwise nothing happens. For that one household it is a gamble between $0 and $10,000, impossible to budget for. What if many households agree to split each year’s losses? Over six steps you will see how numbers turn the gamble into a bill you can almost predict, how much extra must be charged so the pot rarely runs dry, and two ways a pool fails: everyone hit at once, and only the risky staying in.',
    nav0: '0 Sharing', nav1: '1 √N law', nav2: '2 Pricing', nav3: '3 Hit together', nav4: '4 Only the risky', nav5: '5 Wrap-up',
    moneyFmt: '${v}',
    axesFmt: '“{c}”: horizontal axis {x}, vertical axis {y}.',

    s0k: 'Step 0 · Sharing',
    s0t: 'A loss one household cannot carry, split among N. What does each pay per year?',
    s0e: 'This step asks: if many households pool their losses and split them evenly, how does each one’s yearly cost behave? The setting (simulated): every household independently suffers one $10,000 loss in a year with probability p. A household’s <strong>expected loss</strong> is p × $10,000, what it loses per year on average over many years: $100 when p = 1% (<a class="xlink" href="../../../probability/basics/expected-value/#step4">→ Expected Value, step 4: why insurance is compared by expectation</a>). N households agree to add up each year’s losses and split them equally. The chart shows what each household paid in each of the same 40 years. The closer the bars sit to the orange dashed line (the expected loss), the easier the bill is to budget.',
    shareN: 'Households sharing, N', p0: 'Yearly chance of a loss, p', reroll0: 'Another 40 years',
    c0a: 'Each household’s share per year (40 years)', axYear: 'year', axCost: 'share per household ($)',
    s0lgBar: 'Share that year', s0lgClip: 'Above the top (cut off; see readout)', s0lgExp: 'Expected loss p × $10,000',
    s0readout: 'N = {n}: losses occurred in {yl} of the 40 years; each household paid {avg} a year on average (expected {exp}), {max} in the worst year, with a year-to-year standard deviation of {sd} (theory {sdth}).',
    s0hint: 'What to try: keep p = 1% and drag N from 1 to 10000. With N = 1 most years cost nothing and the odd year costs $10,000 (pink bars, cut off at the top). With N = 100 the yearly share jumps around between $0 and a few hundred. With N = 10000 every year lands in a narrow band around $100. “Another 40 years” shows a different history. The standard deviation measures how far a typical year sits from the average; in theory it is $10,000 × √(p(1 − p)/N).',

    s1k: 'Step 1 · The square-root law',
    s1t: 'A hundred times more households: how much steadier is each one’s bill?',
    s1e: 'This step asks: how fast does the wobble in each household’s share shrink as N grows? Fix p = 1% and simulate 400 years for each N. Each year a household pays $10,000 × (number of losses that year) ÷ N. The <strong>standard deviation</strong> (average the squared distances from the mean, then take the square root) measures how much that share swings from year to year. In theory σ = $10,000 × √(p(1 − p)/N): the variance of the total loss grows in proportion to N, splitting divides it by N², so the variance of each share shrinks like 1/N and its standard deviation like 1/√N. This is the <strong>square-root law</strong> (<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ Central Limit Theorem, step 3: precision costs √n</a>). In the “standard deviation vs N” chart both axes are logarithmic (each tick ten times the last), so 1/√N is a straight falling line.',
    lawN: 'Households N',
    c1a: 'Standard deviation of each share vs N (log scales)', c1b: 'Distribution of the share over 400 years, at this N',
    s1lgSim: 'Simulated (400 years)', s1lgTh: 'Theory $10,000 × √(p(1−p)/N)', s1lgExp: 'Expected $100',
    s1readout: 'N = {n}: over 400 years the share averaged {m}, standard deviation simulated {sd}, theory {th}. Exact chance of a “bad year” (share above twice the expected loss, i.e. above $200): {bad}.',
    s1hint: 'What to try: drag N and watch the cyan dot walk down the straight line in the “standard deviation vs N” chart. From N = 100 to 10000 (a hundred times more) the standard deviation falls from about $100 to about $10 (ten times less). Then look at the distribution chart: for small N the share can only take a handful of values (whole multiples of $10,000 ÷ N); for large N it piles into one narrow hill. The bad-year chance drops fast once N ≥ 100; for very small N it jumps up and down, because the number of losses has to be a whole number.',

    s2k: 'Step 2 · Pricing',
    s2t: 'How much extra must each household pay so the pot almost never runs dry?',
    s2e: 'This step asks: how far above the expected loss must the premium be to push the chance that one year’s claims exceed all the premiums collected (<strong>ruin</strong>) below a target ε? The setting: each household has p = 1% of a $10,000 claim; each pays (1 + θ) × $100, where θ is the <strong>loading</strong>, the share charged on top of the expected loss. The number of claims K in a year follows a <strong>binomial distribution</strong>: the chance of exactly k successes in N independent tries that each succeed with probability p (<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ Binomial to Normal, step 0: counting the paths to k successes</a>). If the premiums cover k* claims, the ruin probability is P(K > k*), computed here exactly from the binomial. For each N, take the smallest k* that keeps ruin ≤ ε; the minimum loading is then θ = k* ÷ (N·p) − 1.',
    loadN: 'Households N', eps2: 'Acceptable ruin probability ε',
    epsName0: '5% (about 1 year in 20)', epsName1: '1% (about 1 year in 100)', epsName2: '0.1% (about 1 year in 1000)',
    c2a: 'Chance of K claims in a year (pink = ruin)', c2b: 'Loading θ needed vs N (log scales)', axK: 'claims K', axProb: 'probability', axN: 'households N (log scale)', axTheta: 'loading θ (log scale)', axSd: 'standard deviation ($, log scale)', axFreq: 'fraction of the 400 years',
    s2lgPmf: 'Chance of K (binomial)', s2lgK: 'Claims the premiums cover, k*', s2lgRuin: 'Ruin region', s2lgCurve: 'Curves for the three ε (current one bold)', s2lgNorm: 'Normal approximation, current ε',
    s2readout: 'N = {n}, ε = {eps}: the premiums must cover at least k* = {k} claims (expected {mean}). Premium per household {prem}, loading θ = {theta}; exact ruin probability {ruin}. The normal approximation gives θ ≈ {norm}.',
    s2hint: 'What to try: fix ε = 1% and drag N from 10 to 100000. In the “chance of K” chart the hill gets narrower relative to its own mean, so the margin needed for the pink tail shrinks; in the loading chart the dot slides down the curve. At N = 10 each household must pay 900% extra (the premiums must cover at least one claim, $10,000 split ten ways); once N ≥ 1000, every hundredfold increase in N cuts the loading to roughly a tenth. Then change ε: the stricter the target (1 year in 1000), the higher the curve. With ε at 1% or 0.1%, the normal approximation in the readout is clearly too low for small N, for example about 231% against the exact 300% at N = 100 and ε = 1%, because the claim count is skewed to the right when N is small.',

    s3k: 'Step 3 · Hit together',
    s3t: 'In a storm year every household is hit at once. Does a bigger pool still help?',
    s3e: 'This step asks: can a pool still even out the bill when losses are no longer independent? The setting (simulated): in an ordinary year each household’s chance of a loss is p₀ = 1%, but with probability q the year is a <strong>storm year</strong>, in which everyone’s chance rises to p₁. Within a year households still roll their own dice, but they all share the same “good year or bad year”; this is a <strong>common shock</strong>. The first chart shows each household’s share in a 10000-household pool over 40 years, with storm years in orange. The second compares how the standard deviation falls with N: with the same average chance but fully independent households (dashed), and with the common shock (solid). The common-shock part of the swing depends only on whether the year is a storm year, so splitting it among more households never shrinks it, and the standard deviation has a floor: $10,000 × (p₁ − p₀) × √(q(1 − q)).',
    p1: 'Chance of a loss in a storm year, p₁', q3: 'How often storm years come, q', reroll3: 'Another 40 years',
    c3a: '10000 households: each one’s yearly share (orange = storm year)', c3b: 'Standard deviation of each share vs N (log scales)',
    s3lgCalm: 'Ordinary year', s3lgStorm: 'Storm year', s3lgCorr: 'With common shock', s3lgInd: 'Same average chance, independent', s3lgFloor: 'Floor',
    s3readout: 'p₁ = {p1}, q = {q}: average chance of a loss {pbar}. At N = 10000 the standard deviation is {sd} with the common shock, only {ind} if households were independent; floor {floor}. {nstar}There were {ns} storm years in these 40.',
    s3nstar: 'Beyond about {n} households the swing comes mostly from the common shock, and adding people barely reduces it. ',
    s3nofloor: 'There is no common shock right now (p₁ = p₀ or q = 0): the floor is 0 and the two lines coincide. ',
    s3hint: 'What to try: start with the defaults (p₁ = 5%, q = 10%). In the first chart ordinary years are almost equally tall and storm years jump several times higher; in the second the solid line lies on the floor from about N = 1000 while the dashed line keeps falling. Drag q or p₁ to its minimum: the floor drops to 0 and the solid line rejoins the dashed one. So the biggest threat to an insurer is not one customer’s loss but many customers losing at once; risks like earthquakes and floods cannot be spread away simply by growing the pool, and are usually handled by reinsurance, spreading across regions, or a government backstop.',

    s4k: 'Step 4 · Only the risky stay',
    s4t: 'Households differ in risk but pay the same premium. Who leaves first?',
    s4e: 'This step asks: if the price is set from the pool’s average, can the pool unravel by itself? The setting (simulated): 1000 households whose yearly chances of a loss spread evenly on a log scale from 0.2% to 8% (about 2.1% on average). The insurer cannot tell who is risky, so it charges one price: premium = 1.1 × the average expected loss of the households in the pool (a 10% loading). Each household will pay at most (1 + m) × its own expected loss, where m says how much it dislikes risk: m = 100% means paying up to twice its expected loss for peace of mind. Households whose limit is below the premium leave. Those leaving are mostly low-risk, so the pool’s average risk rises, next round’s premium rises, and more may go. This is <strong>adverse selection</strong>: a single price filters out the low-risk customers.',
    m4: 'Extra m a household will pay (over its own expected loss)', next4: 'Next round', run4: 'Run until stable', reset4: 'Back to round 0',
    c4a: 'Each household’s limit (sorted by risk) and the current premium', c4b: 'Premium and share staying, round by round', axRisk: 'yearly chance of a loss (log scale)', axWtp: 'limit ($, log scale)', axRound: 'round', axPrem: 'Single premium ($)', axShare: 'Share staying', axPremShare: 'premium ($, top) and share staying (bottom)',
    s4lgIn: 'Still in the pool', s4lgOut: 'Has left', s4lgPrem: 'Current single premium', s4lgEl: 'Expected loss p × $10,000',
    s4readout: 'Round {k}: single premium {prem}, {share}% of households still in (average chance of a loss {mp}). {state}',
    s4stable: 'Stable: nobody leaves in the next round.', s4going: 'More households will leave next round.', s4empty: 'The pool is empty: even the last ones found it too dear, and the market is gone.',
    s4rated: 'For comparison: if each household could be charged by its own risk (1.1 × its own expected loss), {share}% would stay at m = {m}.',
    s4hint: 'What to try: set m to 100% and press “Next round” repeatedly. In the first chart the premium line climbs round by round and the dots on the left (low risk) turn grey in batches; in the second the premium rises each round and then stops, with about three in ten households left. Then set m to 0 (willing to pay only the expected loss) and press “Run until stable”: by round 4 the pool is completely empty. Changing m returns to round 0. Even at m = 300% (paying up to four times the expected loss) the lowest-risk four in ten leave. Pricing by risk class, compulsory cover and subsidies are the usual responses; the last line of the readout shows the risk-rated comparison.',

    s5k: 'Step 5 · Wrap-up', s5t: 'What numbers can smooth out, and what they cannot',
    s5fin: 'Looking back: <strong>step 0</strong>, one household faces a gamble between $0 and $10,000; split among N households, each one’s yearly bill wobbles gently around the expected loss p × $10,000. <strong>Step 1</strong>, the wobble’s standard deviation is $10,000 × √(p(1 − p)/N), shrinking like 1/√N. <strong>Step 2</strong>, to hold ruin to ε the loading only comes down as N grows: with ε = 1% it is 900% at N = 10 and only 7.4% at N = 100000. <strong>Step 3</strong>, a common shock gives the wobble a floor that does not fall with N. <strong>Step 4</strong>, a single price squeezes out the low-risk households, and the pool may shrink to the risky few or vanish.',
    formula: 'SD of a share = L·√(p(1−p)/N)\nloading θ = k*/(Np) − 1\n(k* smallest with P(K > k*) ≤ ε)\nshock floor = L·(p₁−p₀)·√(q(1−q))',
    boundary: 'Where this holds: every household here has only two outcomes, loss or no loss, and the loss is always $10,000 (L); real claims vary in size, and a few huge ones make averages settle much more slowly. Ruin is judged one year at a time, without capital, investment income or running costs. The common shock is a two-state model (ordinary year or storm year), and each household’s “limit” in the adverse-selection step is a deliberately bare assumption. Every number is a simulation or an exact calculation, not data from a real insurer.',
    linksTitle: 'Where to next',
    lk1: '→ Expected Value, step 4: why insurance is compared by expectation',
    lk2: '→ Central Limit Theorem, step 3: precision costs √n',
    lk3: '→ Binomial to Normal, step 4: how large n must be before the normal curve is good enough',
    lk4: '→ The Poisson Process, step 2: how many arrivals land in a fixed window',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Risk Pooling & Insurance · Ten Thousand People Each Chip In”.'
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
