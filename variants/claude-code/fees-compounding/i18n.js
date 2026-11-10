'use strict';
// Fees & compounding lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '费率与复利 · 每年 1% 为什么能拿走四分之一',
    back: '← 知识索引',
    compare: '对照另一版本：费率与复利 · 1% 的费率怎么吃掉回报 →',
    navLabel: '费率与复利步骤导航',
    tagline: '两个账户各放 20 000 元，投资本身每年都赚 6%，唯一的区别是其中一个每年收 1% 的管理费。30 年后差多少？「1%」听上去像零头，可它每年都收、按越滚越大的余额收，收走的钱还不能再替你生钱。七步里你会把这笔账拆开，并学会怎样读一个费率。',
    nav0: '0 先猜', nav1: '1 一年一年记账', nav2: '2 差距怎样长大', nav3: '3 吃掉的是哪部分', nav4: '4 一次性收费', nav5: '5 贵的要多赚多少', nav6: '6 收束',
    money: '{v} 元', thousand: '{v}万',

    s0k: '第 0 步 · 先猜',
    s0t: '每年 1% 的费，30 年后会拿走终值的多少？',
    s0e: '这一步要回答：一个看上去很小的年费，长期下来有多大分量？两个虚构账户，各放 20 000 元。投资本身每年的<strong>毛回报率</strong>（扣费之前的增长）都是 6%；账户 B 每年年底按余额收 1% 的<strong>管理费</strong>（费率：每年按账户里的钱收几个百分比），账户 A 不收。先猜一个答案再看图：横轴是年数，纵轴是账户里的钱；白线是不收费的 A，青线是收 1% 的 B，粉色区域是两者的差距。',
    quizPrompt: '30 年后，B 比 A 少了 A 终值的大约多少？',
    quizA: '约 1%：费率就是 1%', quizB: '约 10%', quizC: '约 25%', quizD: '约 50%',
    check: '核对',
    correct: '对。少了约 {lost}%，大约四分之一。', wrong: '实际是约 {lost}%，大约四分之一。下面几步拆开看它是怎么来的。',
    c0a: '账户里的钱（元）：第几年',
    lgNoFee: 'A：不收费', lgFee: 'B：每年收 1%', lgGap: '两者的差距',
    s0readout: '30 年后：A 有 {a0}，B 有 {af}，差 {gap}，是 A 终值的 {lost}%。B 只拿到 A 的 {kept}%。',
    s0pending: '先选一个答案，再按「核对」；数字会写在这里。',
    s0hint: '观察顺序：先猜；核对以后看图：前十年两条线几乎贴在一起，粉色区域很窄；越往右，两条线分得越开。差距不是每年加一样多，而是越来越快地变大。',

    s1k: '第 1 步 · 一年一年记账',
    s1t: '差距里，有多少是真交出去的费，多少是这些费本来能赚的钱？',
    s1e: '这一步要回答：30 年的差距是怎么一年年攒出来的？B 每年先随投资增长 6%，再从余额里扣 1%：<strong>A<sub>t</sub> = A<sub>t−1</sub> × 1.06 × 0.99</strong>。因为余额越来越大，每年交的费（「每年交的费」一图的橙柱）也越来越多。另一层更隐蔽：交出去的钱如果留在账户里，往后每年还能再赚 6%，这部分叫<strong>损失的增长</strong>。「累计」一图的橙线是累计交的费，粉线是和 A 的总差距，两线之间的灰色区域就是损失的增长。',
    year: '记到第几年',
    play1: '从第 1 年记到第 30 年',
    c1a: '每年交的费（元）', c1b: '累计：交的费与总差距（元）',
    lgFeeYear: '这一年交的费', lgGapLine: '与 A 的总差距', lgCum: '累计交的费', lgLostGrowth: '损失的增长（差距 − 累计交的费）',
    s1progress: '已记到第 {t}/30 年。',
    s1readout: '{prog}第 {t} 年：B 年初 {start}，涨 6% 后是 {before}，扣 1% 交费 {fee}，年末 {bal}。到这一年累计交费 {cum}，与 A 的差距 {gap}，其中损失的增长 {lg}（占差距 {lgPct}%）。',
    s1hint: '观察顺序：按「从第 1 年记到第 30 年」。「每年交的费」：橙柱一根比一根高（第 1 年 212 元，第 30 年约 858 元）；「累计」：开头两条线重合（第 1 年还没有损失的增长），之后粉线越跑越快，到第 30 年灰色区域已经比累计交的费还大。',

    s2k: '第 2 步 · 差距怎样长大',
    s2t: '费率和年数，哪个让差距长得更快？毛回报率又起什么作用？',
    s2e: '这一步要回答：B 的终值是 A 的几成？把两个公式相除：A 的终值 = 20 000 × 1.06<sup>T</sup>，B 的 = 20 000 × (1.06 × (1 − f))<sup>T</sup>，相除得 <strong>(1 − f)<sup>T</sup></strong>。1.06 被约掉了：按这种收法，保留的比例只看费率 f 和年数 T，和投资赚多少无关。纵轴是这个「保留比例」，横轴是年数；它是一条指数下降的曲线（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step1">→ 指数与对数第 1 步：底数决定曲线</a>）。',
    feeSlider: '年费率 f（%）', yearsSlider: '年数 T',
    c2a: '保留比例 (1 − f)^T（%）：第几年',
    lgKept: '当前费率的保留比例', lgTriedF: '试过的费率', lgNow: '当前设置',
    s2readout: '费率 {f}%、{T} 年：保留 {kept}%，被拿走 {lost}%。粗算 f × T = {fT}%{approx}。',
    s2approxNear: '，费率低、年数短时很接近', s2approxFar: '，比实际多算了 {over} 个百分点：每年 1% 是从剩下的钱里收，所以真实损失比 f × T 少一点',
    s2hint: '观察顺序：先保持 1%，把年数从 0 拖到 50，橙点沿青线下滑，到 30 年是 74%，到 50 年只剩 60%；再保持 30 年，把费率一格格往上拖，每试一个费率留下一条灰线：0.1% 几乎是平的，2% 到 30 年只剩约 55%。',

    s3k: '第 3 步 · 吃掉的是哪部分',
    s3t: '同样 1% 的费，在回报低的年份里为什么更疼？',
    s3e: '这一步要回答：费率吃掉的是「终值」的比例还是「收益」的比例？上一步说按终值算只看 f 和 T。可你真正赚到的是<strong>收益</strong>（终值 − 本金 20 000）。费是按全部余额收的，本金那部分也收，所以当投资本身赚得少时，同样 1% 吃掉的收益比例会大得多。固定 1%、30 年，只拖毛回报率：青线是被拿走的终值比例（平的），橙线是被拿走的收益比例。',
    grossSlider: '毛回报率 r（%）',
    c3a: '被拿走的比例（%）：毛回报率 r（%）',
    lgShareFinal: '占终值的比例（不随 r 变）', lgShareGain: '占收益的比例', lgAll: '100%：收益全被拿走',
    s3readout: '毛回报 {r}%、费率 1%、30 年：A 终值 {a0}（收益 {g0}），B 终值 {af}。费拿走终值的 {sf}%，却拿走收益的 {sg}%。{note}',
    s3noteOver: '超过 100%：B 30 年后连本金都没保住。',
    s3noteOk: '',
    s3hint: '观察顺序：从 6% 往下拖。青线一直停在 26%；橙线越来越陡：r = 6% 时约 31%，r = 2% 时约 58%，r = 1% 时超过 100%。读费率时，要拿它和你预期的回报比，而不是和 100 比。',

    s4k: '第 4 步 · 一次性收费',
    s4t: '买入时一次收 3%，和每年收 0.5%，哪个更贵？',
    s4e: '这一步要回答：不同收法的费怎样放在一起比？有的产品买入时一次性收一笔<strong>申购费</strong>（只收一次），有的每年收管理费。把一次性收费 L 摊成「相当于每年多少」：持有 T 年时，等价年费率 = 1 − (1 − L)<sup>1/T</sup>。持有越久，一次性的费摊得越薄；年费却每年都在。横轴是持有年数，纵轴是等价年费率；橙线是一次性收费摊开后的样子，青线是年费，白点是两者相等的地方。',
    loadSlider: '一次性收费 L（%）', annualSlider: '年费率 f（%）',
    c4a: '等价年费率（%）：持有年数',
    lgLoad: '一次性收费摊到每年', lgAnnual: '每年的费率', lgCross: '两者相等处',
    s4readout: '一次收 {L}%：持有 1 年相当于每年 {e1}%，10 年相当于 {e10}%，30 年相当于 {e30}%。和每年 {f}% 比：{verdict}',
    s4be: '持有满 {be} 年后，一次性收费更便宜。', s4never: '50 年内，一次性收费一直更贵。',
    s4hint: '观察顺序：保持一次性 3%，把年费从 0.1% 拖到 2%：白点（两者相等的年数）越来越往左。再改一次性收费：橙线整体上下移动。短期持有时一次性收费很重（1 年就是整整 3%），长期持有时年费才是大头。',

    s5k: '第 5 步 · 贵的要多赚多少',
    s5t: '一个费率高的产品，每年要比便宜的多赚多少才打平？',
    s5e: '这一步要回答：如果付更高的费，换来的回报得高多少？设便宜的账户年费 0.1%、毛回报 6%。贵的账户年费 f₂，要打平，它的毛回报必须每年都高出：(1.06 × 0.999) ÷ (1 − f₂) − 1.06。绿线是需要多赚的部分，虚线是两个费率之差 f₂ − 0.1%，绿线总在虚线之上一点。关键的区别是：费每年<strong>一定</strong>会收，多赚的回报却不一定有（<a class="xlink" href="../../../investment/basics/risk-return/#step3">→ 风险与回报第 3 步：许诺的回报和到手的回报</a>）。',
    expSlider: '贵的账户年费 f₂（%）',
    c5a: '每年需要多赚的毛回报（百分点）：贵的年费 f₂（%）',
    lgExtra: '需要每年多赚', lgDiff: '两个费率之差',
    s5readout: '年费 {f2}% 对 0.1%：毛回报每年要多出 {x} 个百分点（费率之差是 {d}），而且 30 年里每一年都要多出这么多。否则 30 年后少 {lost}%。',
    s5hint: '观察顺序：把 f₂ 从 0.1% 拖到 2.5%。橙点沿绿线上升，绿线和虚线的距离越来越大：费越高，要多赚的就比费率差还多一点，因为多赚的那部分也要被收费。',

    s6k: '第 6 步 · 收束',
    s6t: '一句话：费率是从每年的回报里扣、对全部余额收、年年复利的',
    s6fin: '把七步连起来：年费按余额收，余额越大交得越多，交出去的钱还会损失往后的增长，所以差距越滚越快（第 0、1 步）；保留比例是 (1 − f)<sup>T</sup>，只看费率和年数（第 2 步）；但它吃掉的收益比例和回报有关，回报越低越疼（第 3 步）；一次性收费要摊成等价年费率才能比（第 4 步）；更贵的产品必须每年都多赚出比费率差还多一点的回报，而费是确定的、回报不是（第 5 步）。下表是不同费率和年数下被拿走的终值比例：',
    tableHead: '年费率', tableYears: '{T} 年',
    formula: '扣费后余额：A_T = P × ((1 + r)(1 − f))^T\n保留比例：(1 − f)^T\n一次性收费 L 摊到 T 年：1 − (1 − L)^(1/T)',
    assume: '模型假设：本页全部数字都是虚构的教学例子，没有真实产品或费率表。毛回报率每年固定（现实中会上下波动）；年费在每年年末按余额收取一次（真实产品常按日计提，结果非常接近）；没有税、没有通胀、没有交易成本，也没有中途存取。',
    notAdvice: '这不是投资建议。本页只教怎样读费率、算账，不推荐任何产品。',
    linksTitle: '接着去哪里',
    lk1: '→ 复利与贴现第 0 步：单利和复利差在哪里',
    lk2: '→ 指数与对数第 1 步：底数怎样决定指数曲线',
    lk3: '→ 风险与回报第 3 步：多许诺的回报从哪里来',
    lk4: '→ 利率与债券第 1 步：未来的钱今天值多少',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《费率与复利 · 1% 的费率怎么吃掉回报》的平行版本。'
  },
  en: {
    pageTitle: 'Fees & Compounding · How 1% a Year Takes a Quarter',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Fees & Compounding · How Does a 1% Fee Eat Returns →',
    navLabel: 'Fees and compounding steps',
    tagline: 'Two accounts each start with $20,000 and both investments earn 6% a year. The only difference: one charges a 1% management fee every year. How far apart are they after 30 years? “1%” sounds like small change, but it is charged every year, on a balance that keeps growing, and money taken out can no longer earn anything for you. Over seven steps you will take that bill apart and learn how to read a fee.',
    nav0: '0 Guess', nav1: '1 Year-by-year ledger', nav2: '2 How the gap grows', nav3: '3 What it eats', nav4: '4 One-time charges', nav5: '5 How much more to break even', nav6: '6 Wrap-up',
    money: '${v}', thousand: '{v}k',

    s0k: 'Step 0 · Guess first',
    s0t: 'A 1% yearly fee — how much of the final value is gone after 30 years?',
    s0e: 'The question here: how much does a fee that looks tiny weigh over the long run? Two invented accounts each start with $20,000. The investment’s <strong>gross return</strong> (growth before any fee) is 6% a year in both. Account B takes a 1% <strong>management fee</strong> at the end of every year (a fee rate: a percentage of whatever is in the account, every year); account A takes nothing. Guess first, then read the chart: across is years, up is money in the account; the white line is fee-free A, the cyan line is B at 1%, and the pink area is the gap.',
    quizPrompt: 'After 30 years, B is short of A by roughly what share of A’s final value?',
    quizA: 'About 1% — the fee is 1%', quizB: 'About 10%', quizC: 'About 25%', quizD: 'About 50%',
    check: 'Check',
    correct: 'Right. About {lost}% is gone — roughly a quarter.', wrong: 'It is actually about {lost}% — roughly a quarter. The next steps take apart where that comes from.',
    c0a: 'Money in the account ($) by year',
    lgNoFee: 'A: no fee', lgFee: 'B: 1% a year', lgGap: 'The gap',
    s0readout: 'After 30 years: A has {a0}, B has {af}, a gap of {gap} — {lost}% of A’s final value. B ends with only {kept}% of what A has.',
    s0pending: 'Pick an answer and press “Check”; the numbers will appear here.',
    s0hint: 'What to watch: guess first. After checking, read the chart: for the first ten years the two lines almost touch and the pink area is thin; further right they pull apart faster and faster. The gap does not grow by the same amount each year — it accelerates.',

    s1k: 'Step 1 · A year-by-year ledger',
    s1t: 'How much of the gap is fees actually paid, and how much is what those fees would have earned?',
    s1e: 'The question here: how does a 30-year gap build up, year by year? Each year B first grows 6% with the investment, then 1% of the balance is taken: <strong>A<sub>t</sub> = A<sub>t−1</sub> × 1.06 × 0.99</strong>. Because the balance keeps growing, the fee paid each year (orange bars in “fee paid each year”) keeps growing too. There is a second, quieter layer: money paid out would have kept earning 6% a year had it stayed — call that <strong>lost growth</strong>. In the “running totals” chart the orange line is total fees paid so far, the pink line is the whole gap to A, and the grey area between them is the lost growth.',
    year: 'Ledger up to year',
    play1: 'Run the ledger from year 1 to 30',
    c1a: 'Fee paid each year ($)', c1b: 'Running totals: fees paid and the whole gap ($)',
    lgFeeYear: 'Fee paid that year', lgGapLine: 'Whole gap to A', lgCum: 'Fees paid so far', lgLostGrowth: 'Lost growth (gap − fees paid)',
    s1progress: 'Ledger at year {t}/30. ',
    s1readout: '{prog}Year {t}: B starts at {start}, grows 6% to {before}, pays a 1% fee of {fee} and ends at {bal}. Fees paid so far {cum}; gap to A {gap}, of which lost growth is {lg} ({lgPct}% of the gap).',
    s1hint: 'What to watch: press “Run the ledger”. In “fee paid each year” each orange bar is taller than the last ($212 in year 1, about $858 in year 30). In “running totals” the two lines start together (no lost growth yet in year 1), then the pink line pulls away faster and faster; by year 30 the grey area is bigger than all the fees paid.',

    s2k: 'Step 2 · How the gap grows',
    s2t: 'Which makes the gap grow faster — the fee or the years? And what does the gross return do?',
    s2e: 'The question here: what fraction of A’s final value does B end with? Divide the two formulas: A ends at 20,000 × 1.06<sup>T</sup>, B at 20,000 × (1.06 × (1 − f))<sup>T</sup>, so the ratio is <strong>(1 − f)<sup>T</sup></strong>. The 1.06 cancels: with this way of charging, the share you keep depends only on the fee f and the years T, not on how much the investment earns. Up is that kept share, across is years; it is an exponential decay curve (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step1">→ Exponentials & logarithms, step 1: the base decides the curve</a>).',
    feeSlider: 'Yearly fee f (%)', yearsSlider: 'Years T',
    c2a: 'Share kept, (1 − f)^T (%), by year',
    lgKept: 'Share kept at the current fee', lgTriedF: 'Fees you tried', lgNow: 'Current setting',
    s2readout: 'Fee {f}%, {T} years: you keep {kept}% and lose {lost}%. The rough estimate f × T gives {fT}%{approx}.',
    s2approxNear: ' — close when fees are low and periods short', s2approxFar: ', overstating the loss by {over} points: each year’s fee is taken from what is left, so the real loss is a little smaller than f × T',
    s2hint: 'What to watch: keep 1% and drag the years from 0 to 50 — the orange dot slides down the cyan line, to 74% at 30 years and just 60% at 50. Then hold 30 years and step the fee up; each fee you try leaves a grey line. At 0.1% the line is almost flat; at 2% only about 55% is left after 30 years.',

    s3k: 'Step 3 · What it eats',
    s3t: 'Why does the same 1% hurt more when returns are low?',
    s3e: 'The question here: does a fee eat a share of the final value or a share of the gains? Step 2 said the share of final value depends only on f and T. But what you actually earned is the <strong>gain</strong> (final value − the $20,000 you put in). The fee is charged on the whole balance, principal included, so when the investment earns little, the same 1% eats a much bigger share of the gain. Fix 1% and 30 years and move only the gross return: the cyan line is the share of final value taken (flat), the orange line the share of the gain taken.',
    grossSlider: 'Gross return r (%)',
    c3a: 'Share taken by the fee (%) vs gross return r (%)',
    lgShareFinal: 'Share of final value (does not depend on r)', lgShareGain: 'Share of the gain', lgAll: '100%: the whole gain is gone',
    s3readout: 'Gross return {r}%, fee 1%, 30 years: A ends at {a0} (a gain of {g0}); B ends at {af}. The fee takes {sf}% of the final value but {sg}% of the gain. {note}',
    s3noteOver: 'Above 100%: after 30 years B has not even kept its principal.',
    s3noteOk: '',
    s3hint: 'What to watch: drag down from 6%. The cyan line sits at 26% throughout; the orange line climbs ever more steeply — about 31% at r = 6%, about 58% at r = 2%, and over 100% at r = 1%. When you read a fee, compare it with the return you expect, not with 100.',

    s4k: 'Step 4 · One-time charges',
    s4t: 'A 3% charge once on the way in, or 0.5% every year — which costs more?',
    s4e: 'The question here: how do you compare fees charged in different ways? Some products take an <strong>entry charge</strong> once when you buy; others take a yearly management fee. Turn a one-time charge L into “what it costs per year”: held for T years, the equivalent yearly fee is 1 − (1 − L)<sup>1/T</sup>. The longer you hold, the thinner the one-time charge is spread; a yearly fee never goes away. Across is years held, up is the equivalent yearly fee; the orange line is the one-time charge spread out, the cyan line the yearly fee, and the white dot marks where they are equal.',
    loadSlider: 'One-time charge L (%)', annualSlider: 'Yearly fee f (%)',
    c4a: 'Equivalent yearly fee (%) by years held',
    lgLoad: 'One-time charge spread per year', lgAnnual: 'Yearly fee', lgCross: 'Where they are equal',
    s4readout: 'A one-time {L}% is like {e1}% a year if held 1 year, {e10}% over 10 years and {e30}% over 30. Against {f}% a year: {verdict}',
    s4be: 'the one-time charge is cheaper once you have held for {be} years.', s4never: 'the one-time charge stays dearer for all 50 years shown.',
    s4hint: 'What to watch: keep the one-time charge at 3% and drag the yearly fee from 0.1% to 2% — the white dot (the break-even year) moves left. Then change the one-time charge: the orange line shifts up or down. For short holds a one-time charge is heavy (held one year it is the full 3%); for long holds the yearly fee is what matters.',

    s5k: 'Step 5 · How much more to break even',
    s5t: 'How much more must a pricier product earn each year just to keep up?',
    s5e: 'The question here: if you pay a higher fee, how much higher must the return be? Say the cheap account charges 0.1% a year on a 6% gross return. For the pricier account, charging f₂, to keep level its gross return must beat 6% every single year by (1.06 × 0.999) ÷ (1 − f₂) − 1.06. The green line is that required extra; the dashed line is simply the fee difference f₂ − 0.1%, and the green line always sits a little above it. The key difference: the fee is <strong>certain</strong> to be charged each year, the extra return is not (<a class="xlink" href="../../../investment/basics/risk-return/#step3">→ Risk & return, step 3: promised return versus what you get</a>).',
    expSlider: 'Pricier account’s yearly fee f₂ (%)',
    c5a: 'Extra gross return needed each year (pts) vs fee f₂ (%)',
    lgExtra: 'Extra needed every year', lgDiff: 'Difference between the fees',
    s5readout: 'A {f2}% fee against 0.1%: the gross return must be {x} points higher every year (the fee difference is {d}), in each of the 30 years. Otherwise it ends {lost}% behind after 30 years.',
    s5hint: 'What to watch: drag f₂ from 0.1% to 2.5%. The orange dot climbs the green line, which pulls slowly away from the dashed line: the higher the fee, the more the required extra exceeds the fee gap, because the extra return gets charged the fee too.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'In one line: a fee comes out of every year’s return, on the whole balance, and compounds',
    s6fin: 'Put the seven steps together. A yearly fee is charged on the balance, so the bigger the balance the more you pay, and money paid out also loses its future growth — the gap snowballs (steps 0–1). The share you keep is (1 − f)<sup>T</sup>, set by the fee and the years alone (step 2), but the share of your gain it takes depends on the return, and hurts more when returns are low (step 3). A one-time charge must be spread into an equivalent yearly fee before you compare (step 4). A pricier product has to out-earn the cheap one every year by a bit more than the fee gap, and the fee is certain while the return is not (step 5). The table shows the share of final value taken at different fees and horizons:',
    tableHead: 'Yearly fee', tableYears: '{T} yrs',
    formula: 'balance after fees: A_T = P × ((1 + r)(1 − f))^T\nshare kept: (1 − f)^T\none-time charge L spread over T years: 1 − (1 − L)^(1/T)',
    assume: 'Model assumptions: every number on this page is an invented teaching example — no real product or fee schedule. The gross return is the same every year (real returns go up and down). The yearly fee is taken once at each year end on the balance (real products often accrue daily; the result is very close). No taxes, inflation, trading costs, deposits or withdrawals.',
    notAdvice: 'This is not investment advice. The page teaches how to read a fee and do the sums; it recommends no product.',
    linksTitle: 'Where to go next',
    lk1: '→ Compound interest, step 0: simple versus compound growth',
    lk2: '→ Exponentials & logarithms, step 1: how the base shapes an exponential curve',
    lk3: '→ Risk & return, step 3: where a higher promised return comes from',
    lk4: '→ Interest rates & bonds, step 1: what future money is worth today',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Fees & Compounding · How Does a 1% Fee Eat Returns”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang] && STRINGS[lang][key];
  if (text === undefined) text = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
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
if (typeof window !== 'undefined') window.FC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
