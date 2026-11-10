'use strict';
// Interest rates & bonds lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '利率与债券 · 老债券为什么要降价',
    back: '← 知识索引',
    compare: '对照另一版本：利率与债券 · 利率升为什么债价跌 →',
    navLabel: '利率与债券步骤导航',
    tagline: '一张债券把未来每年付多少钱写死在合同里，可它今天的价格却天天在变：市场利率一升，老债券就得降价。七步里你会把债券拆成一串现金，学会把未来的钱折回今天，再看着市场把一张老债券的价格一轮轮压到新利率上。',
    nav0: '0 买到了什么', nav1: '1 贴现', nav2: '2 定价', nav3: '3 加息之后', nav4: '4 期限', nav5: '5 久期', nav6: '6 收束',

    s0k: '第 0 步 · 拆开一张债券',
    s0t: '买下一张债券，你到底买到了什么？',
    s0e: '这一步要回答：买下一张债券，手里握着的是哪几笔钱、各在什么时候到手？<strong>债券</strong>是一张借条：发行者今天向你借钱，承诺以后按约定还（<a class="xlink" href="../../../investment/basics/stocks-bonds/#step2">→ 股票与债券页第 2 步：借条上写了什么</a>）。本页的债券都是虚构的：<strong>面值</strong> 100，就是到期时还给你的本金；每年按<strong>票息率</strong>付一次利息，叫<strong>票息</strong>（票息 = 票息率 × 面值，票息率 4% 就是每年拿 4）；最后一年连本金一起还。<strong>期限</strong>是从现在到还本还有几年。这些钱写进了合同，发行以后不会再改。',
    couponRate: '票息率', years: '期限 n（年）',
    c0: '合同承诺的现金：每年到手多少',
    lgCoupon: '票息', lgPrincipal: '本金（面值 100）',
    s0readout: '票息率 {c}%、期限 {n} 年：第 1 到第 {n} 年每年拿 {cpn}，第 {n} 年另拿回本金 100。合计拿到 {total}（= {n} × {cpn} + 100）。',
    s0hint: '观察顺序：先只拖票息率，只有青色的票息柱一起变高变矮；再只拖期限，柱子变多，橙色的本金总在最后一年。记住这一点：以后市场利率怎么变，这些柱子都不变。会变的只是今天有人愿意为这一串钱付多少。下面几步用的就是你在这里设好的债券。',

    s1k: '第 1 步 · 未来的钱',
    s1t: '10 年后才到手的 100，今天值多少？',
    s1e: '这一步要回答：一笔要等 t 年才拿到的 100，放在今天相当于多少钱？先定义<strong>市场利率</strong> r：现在新借钱、新存钱一年能拿到的利率，所有人都能按它借贷。今天存进 x，按 r 每年复利，t 年后变成 x·(1+r)^t。要让它到时正好是 100，倒推得 <strong>x = 100 / (1+r)^t</strong>。这个 x 叫这 100 的<strong>现值</strong>，从未来倒推回今天的动作叫<strong>贴现</strong>（<a class="xlink" href="../../../investment/rates/compound-interest/#step3">→ 复利与贴现页第 3 步：贴现的来历</a>）。1/(1+r)^t 叫<strong>贴现因子</strong>：未来的 1 块钱在今天值多少。',
    rate: '市场利率 r', wait: '等待年数 t',
    c1: '未来 100 今天值多少（横轴：等待年数）',
    lgCurve: '当前 r 的现值曲线', lgTried: '试过的其他 r', lgNow: '当前 t 的现值',
    s1readout: 'r = {r}%，t = {t} 年：贴现因子 1/(1+r)^t = {d}，现值 = {pv}。验算：今天存 {pv}，按 {r}% 复利 {t} 年 → {back}。{tried}',
    s1tried: '　｜　已试过 r = {list}',
    s1hint: '观察顺序：先固定 r，只拖 t：点沿曲线往右下走，等得越久，今天值得越少。再拖 r：整条曲线往下压，而且按比例算，越远的年份被压得越多（r 从 5% 升到 6%，1 年后的 100 少了约 1%，30 年后的 100 少了约 25%）；每个试过的 r 都留下一条淡色曲线作对照。把 r 拖到 0：曲线变成一条平线，没有利息，也就谈不上贴现。',

    s2k: '第 2 步 · 给债券定价',
    s2t: '这一串钱，今天一共值多少？',
    s2e: '这一步要回答：把第 0 步那张债券的每一笔钱都按市场利率 r 贴现回今天，加起来是多少？这个和就是这张债券此刻的合理<strong>价格</strong>：<strong>价格 = Σ 第 t 年的钱 / (1+r)^t</strong>，每一项都是上一步的现值。图「每一笔钱今天值百分之几」里，每根柱是那一笔钱的现值占合同金额的比例，也就是贴现因子（空框是 100%）；图「现值接起来」把这些现值首尾相接，长条总长就是价格，虚线是面值 100；图「价格对市场利率」画出同一张债券在每个 r 下的价格。价格高于面值叫<strong>溢价</strong>，低于面值叫<strong>折价</strong>。',
    c2a: '每一笔钱今天值百分之几（空框 = 100%）',
    c2b: '现值接起来 = 价格（虚线 = 面值 100）',
    c2c: '价格对市场利率 r',
    lgPvCoupon: '票息的现值', lgPvPrincipal: '最后一年（本金 + 票息）的现值', lgFace: '面值 100', lgPriceDot: '当前价格（白点是试过的 r）',
    s2bond: '债券：票息率 {c}%、期限 {n} 年（在第 0 步修改）。',
    s2readout: 'r = {r}%：价格 = {terms} = {p}。{verdict}',
    s2more: '（共 {n} 项）',
    s2par: '恰好等于面值：r 等于票息率，每年的票息正好是 100 在市场上该得的利息。',
    s2discount: '比面值低 {gap}（折价）：r 高于票息率 {c}%，票息给得比市场少，只能靠少付钱补回来。',
    s2premium: '比面值高 {gap}（溢价）：r 低于票息率 {c}%，票息给得比市场多，买家愿意多付。',
    s2hint: '观察顺序：只拖 r。「每一笔钱今天值百分之几」里，r 一升，所有柱一起变矮，越靠右的缩得越多；「现值接起来」里，橙色那段（本金加最后一次票息，最大也最远）缩掉的金额最多，整条长条随之变短，越过虚线就从溢价变成折价；「价格对市场利率」里的点沿曲线往右下走。r 正好等于票息率时，长条的端点正好落在虚线上。',

    s3k: '第 3 步 · 加息之后',
    s3t: '刚买的债券，利率一升，为什么卖不回 100？',
    s3e: '这一步要回答：你按面值 100 买了一张期限 10 年、票息率 4% 的债券，当时市场利率也是 4%。第二天市场利率变成 r_new，你想卖掉它，能卖多少？买家手里还有另一个选择：花 100 买一张新发行的债券，票息率就是 r_new。买家用<strong>到期收益率</strong>来比较：照你的要价买下、一直拿到期，相当于每年赚多少；算法是找出一个利率，用它把这串现金贴现回今天，正好等于付出的价钱。到期收益率比 r_new 高，买家会抢；比 r_new 低，没人买。所以价格只能停在到期收益率正好等于 r_new 的地方（<a class="xlink" href="../../../math/applied/supply-demand/#step0">→ 供需均衡页第 0 步：价格停在买卖两边都接受的地方</a>）。',
    newRate: '新的市场利率 r_new', ask: '你的要价',
    search3: '让市场来定价（逐轮对半试价）',
    c3a: '买家的到期收益率对你的要价',
    c3b: '每年票息的差额：金额（空框）与现值（实心）',
    lgYield: '到期收益率曲线', lgRnew: '新的市场利率 r_new', lgAsk: '你的要价', lgTrial: '市场试过的价',
    lgShort: '每年少拿的票息', lgExtra: '每年多拿的票息',
    s3progress: '市场试价第 {k}/{N} 轮 · ',
    s3readout: '要价 {p}：买家的到期收益率 {y}%，新债给 {rn}%。→ {verdict}　｜　{market}',
    s3cheap: '比新债划算，买家会抢，价格会被抬上去。',
    s3dear: '不如新债，没人买，只能降价。',
    s3fair: '和新债一样划算：这就是市场价。',
    s3below: '市场价 {fair} = 100 − {sf}：新债每年多给 {gap}，这张老债每年少拿 {gap}，10 年的差额贴现回今天合计 {sf}，正好是折价。',
    s3above: '市场价 {fair} = 100 + {sf}：这张老债每年比新债多拿 {gap}，10 年的差额贴现回今天合计 {sf}，正好是溢价。',
    s3same: '市场价 {fair}：r_new 等于票息率 4%，没有差额，价格还是面值。',
    s3hint: '观察顺序：先把 r_new 拖到 5%，再拖要价：「买家的到期收益率对你的要价」里的点沿曲线走，要价越高，买家的收益率越低，只有一个要价让它正好碰到 r_new 那条横线。再按「让市场来定价」：每一轮在剩下的价格区间里取中间价试一次，太便宜（收益率高于 r_new）就抬价，太贵就降价，留下的点一轮轮逼近交点，最后停在市场价上。「每年票息的差额」说明折价从哪来。最后把 r_new 拖到 4% 以下，一切反过来。',

    s4k: '第 4 步 · 期限',
    s4t: '同样加息 1 个百分点，2 年期和 30 年期谁跌得多？',
    s4e: '这一步要回答：市场利率变化同样大小，期限不同的债券价格各变多少？下面三张虚构债券的票息率都是 4%，原来的市场利率也是 4%，所以起点价格都是面值 100（第 2 步：r 等于票息率时价格等于面值）。把市场利率改成新值，三张债券各自按第 2 步的办法重新贴现。期限越长，少拿（或多拿）票息的年份越多，本金也要多贴现好些年，所以对利率越敏感。',
    newRate4: '新的市场利率', sweep4: '把利率从 1% 扫到 8%',
    c4a: '价格对市场利率（起点 4%、100）',
    c4b: '价格变化（相对于 100）',
    lgM2: '2 年期', lgM10: '10 年期', lgM30: '30 年期', lgStart: '起点：4%、价格 100',
    yrShort: '{n} 年',
    s4readout: '市场利率 4% → {r}%：2 年期 {p2}（{d2}）· 10 年期 {p10}（{d10}）· 30 年期 {p30}（{d30}）',
    s4hint: '观察顺序：从 4% 往右拖到 5%，看三个点各自往下掉多少：30 年期掉得最多，2 年期几乎不动；「价格变化」的横条把差距直接摆在一起。再往左拖到 3%，三张都涨，排序不变。三条曲线都穿过 (4%, 100)，越长的越陡；而且都向上弯，这个弯会在下面的判断题里用到。',
    quizPrompt: '想一想：利率从 4% 升到 5%，30 年期跌了 {d}%。如果利率从 4% 降到 3%，它会涨多少？',
    quizA: '也是 {d}%，涨跌对称', quizB: '比 {d}% 多', quizC: '比 {d}% 少',
    check: '核对',
    correct: '对。曲线向上弯，利率越低的地方越陡：降到 3% 时涨 {up}%，比升到 5% 时的跌幅 {d}% 大。把滑杆拖到 3% 自己核对。',
    wrong: '再看看「价格对市场利率」里 30 年期那条曲线：它在 3% 附近和 5% 附近哪边更陡？拖到两边读数对比。',

    s5k: '第 5 步 · 一个数概括敏感度',
    s5t: '「平均要等多久」为什么能预报跌幅？',
    s5e: '这一步要回答：能不能用一个数说清一张债券对利率有多敏感？把每一笔钱的现值看成时间轴上的一块砝码：放在第 t 年，重量就是那一年钱的现值（第 1 步）。让这根轴平衡的支点位置记作 D，叫<strong>久期</strong>，单位是年，意思是「按现值加权，平均要等多少年才拿到钱」。D 越大，钱越集中在远处，而越远的钱被贴现得越狠、对利率越敏感。由此有一个直线估算：利率升 1 个百分点，价格大约变化 <strong>−D/(1+r) × 1%</strong>。本步的市场利率固定为 4%。',
    c5a: '每笔钱的现值放在第几年，三角是平衡点 D',
    c5b: '久期 D 对期限 n（单位：年）',
    lgBal: '平衡点 D', lgZero: '零息债（票息 0%）：D = n', lgDc: '当前票息率的 D',
    s5readout: '票息率 {c}%、期限 {n} 年、r = 4%：D = {D} 年。利率升 1 个百分点：估算 {a1}%，精确 {e1}%；降 1 个百分点：估算 {a2}%，精确 {e2}%。',
    s5hint: '观察顺序：先把票息率拖到 0%：只剩最后一块砝码，平衡点就在第 n 年，D = n。再调高票息率：前面的砝码变重，三角往左（往现在）移，D 比 n 小，所以期限相同时票息越高越不敏感。然后拖期限：「久期 D 对期限 n」里的点沿曲线走，有票息时 D 涨得比期限慢。估算是一条直线，只看价格曲线在当前点的斜率；真实曲线向上弯，所以估算总是略低估涨幅、略高估跌幅。本步所有滑杆组合里，D 不到 10 年时误差不超过 0.7 个百分点，D 越大误差越大。',

    s6k: '第 6 步 · 收束', s6t: '利率升，老债券降价，是为了让新买家拿到新利率',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，债券是一串写死的现金，利率变了它也不变；<strong>第 1 步</strong>，未来的钱要按市场利率贴现，等得越久、利率越高，今天值得越少；<strong>第 2 步</strong>，价格就是所有现值之和，r 高于票息率就折价，低于就溢价；<strong>第 3 步</strong>，加息以后，老债券必须降价到新买家也能拿到新利率，折价正好等于少拿的票息的现值；<strong>第 4 步</strong>，期限越长，同样的利率变化带来的价格变化越大；<strong>第 5 步</strong>，久期 D 是按现值加权的平均等待时间，用它可以估算价格变化。如果不卖、发行者也不违约，持有到期仍然拿满合同上的每一笔钱：中途的价格下跌，是「现在卖掉」才会兑现的损失。',
    formula: '现值 = 未来的钱 / (1+r)^t\n价格 = Σ 第 t 年的钱 / (1+r)^t\n价格变化 ≈ −D / (1+r) × 利率变化',
    boundary: '适用范围：本页的债券、利率和价格都是虚构的教学示例，不是行情，也不预测利率走势，不构成投资建议。模型假设每年付一次票息、在付息日刚过时报价（没有应计利息），所有年份用同一个市场利率贴现（真实市场里不同期限的利率不同），发行者一定按约定付款（没有违约风险），不计税费。第 3 步的「逐轮对半试价」是示意市场找价的过程，不是真实的成交机制。久期估算只对较小的利率变化好用。',
    linksTitle: '接着去哪儿',
    lk1: '→ 复利与贴现页第 3 步：现值和贴现从哪来',
    lk2: '→ 股票与债券页第 2 步：债券这张借条写了什么',
    lk3: '→ 供需均衡页第 0 步：价格为什么停在均衡点',
    lk4: '→ 风险与回报页第 3 步：为什么承担波动要更高的回报',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《利率与债券 · 利率升为什么债价跌》的平行版本。'
  },
  en: {
    pageTitle: 'Interest Rates & Bonds · Why an Old Bond Has to Get Cheaper',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Interest Rates & Bonds · Why Do Bond Prices Fall When Rates Rise →',
    navLabel: 'Interest rates and bonds steps',
    tagline: 'A bond fixes in writing how much it will pay you each year, yet its price moves every day: when market rates rise, an old bond has to get cheaper. In seven steps you will take a bond apart into a stream of payments, learn to pull future money back to today, and watch the market push an old bond’s price, round by round, onto the new rate.',
    nav0: '0 What you buy', nav1: '1 Discounting', nav2: '2 Pricing', nav3: '3 After a hike', nav4: '4 Maturity', nav5: '5 Duration', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Taking a bond apart',
    s0t: 'When you buy a bond, what exactly do you get?',
    s0e: 'This step asks: when you buy a bond, which payments do you actually hold, and when does each one arrive? A <strong>bond</strong> is an IOU: the issuer borrows your money today and promises to pay it back on agreed terms (<a class="xlink" href="../../../investment/basics/stocks-bonds/#step2">→ Stocks & Bonds, step 2: what the IOU says</a>). Every bond on this page is made up. Its <strong>face value</strong> is 100, the principal you get back at the end. Once a year it pays interest at the <strong>coupon rate</strong>; that payment is the <strong>coupon</strong> (coupon = coupon rate × face value, so 4% means 4 a year). The final year pays the last coupon plus the principal. The <strong>maturity</strong> is how many years remain until the principal comes back. All of this is written into the contract and never changes after the bond is issued.',
    couponRate: 'Coupon rate', years: 'Maturity n (years)',
    c0: 'Promised cash, year by year',
    lgCoupon: 'coupon', lgPrincipal: 'principal (face value 100)',
    s0readout: 'Coupon rate {c}%, maturity {n} years: you get {cpn} in each of years 1 to {n}, plus the 100 principal in year {n}. Total received: {total} (= {n} × {cpn} + 100).',
    s0hint: 'What to try: move only the coupon rate and just the cyan coupon bars grow or shrink together; move only the maturity and you get more bars, with the orange principal always in the last year. Keep this in mind: whatever market rates do later, these bars stay put. The only thing that changes is how much someone will pay today for this stream of cash. The next steps use the bond you set up here.',

    s1k: 'Step 1 · Money that arrives later',
    s1t: 'What is 100 that arrives in 10 years worth today?',
    s1e: 'This step asks: if you have to wait t years for 100, what is it worth right now? First define the <strong>market rate</strong> r: the yearly rate anyone can borrow or save at today. Put x in the bank today and let it compound at r; after t years it has grown to x·(1+r)^t. For that to be exactly 100, you need <strong>x = 100 / (1+r)^t</strong>. That x is the <strong>present value</strong> of the 100, and working backwards from the future like this is called <strong>discounting</strong> (<a class="xlink" href="../../../investment/rates/compound-interest/#step3">→ Compound Interest, step 3: where discounting comes from</a>). The factor 1/(1+r)^t is the <strong>discount factor</strong>: what one unit of money in the future is worth today.',
    rate: 'Market rate r', wait: 'Years to wait t',
    c1: 'What a future 100 is worth today, by years to wait',
    lgCurve: 'present value at the current r', lgTried: 'other rates you tried', lgNow: 'present value at the current t',
    s1readout: 'r = {r}%, t = {t} years: discount factor 1/(1+r)^t = {d}, present value = {pv}. Check: save {pv} today at {r}% for {t} years → {back}.{tried}',
    s1tried: '  |  rates tried: {list}',
    s1hint: 'What to try: hold r fixed and move only t. The dot slides down the curve: the longer you wait, the less it is worth today. Then move r: the whole curve sinks, and in proportion the far years sink the most (going from 5% to 6% takes about 1% off a 100 due in one year, but about 25% off a 100 due in 30 years). Every rate you try leaves a faint curve behind for comparison. Set r to 0 and the curve goes flat: with no interest there is nothing to discount.',

    s2k: 'Step 2 · Pricing the bond',
    s2t: 'What is that whole stream of cash worth today?',
    s2e: 'This step asks: discount every payment of the bond from step 0 back to today at the market rate r, and add them up. What do you get? That sum is the bond’s fair <strong>price</strong> right now: <strong>price = Σ cash in year t / (1+r)^t</strong>, where each term is a present value from the last step. In “Each payment’s worth today”, each bar is that payment’s present value as a share of its contract amount, which is just the discount factor (the outline is 100%). “Present values end to end” lays those present values in a row; the length of the strip is the price, and the dashed line marks the face value of 100. “Price vs market rate” shows what the same bond is worth at every r. A price above face value is a <strong>premium</strong>; below face value, a <strong>discount</strong>.',
    c2a: 'Each payment’s worth today (outline = 100%)',
    c2b: 'Present values end to end = price (dashed = 100)',
    c2c: 'Price vs market rate r',
    lgPvCoupon: 'present value of a coupon', lgPvPrincipal: 'present value of the last year (principal + coupon)', lgFace: 'face value 100', lgPriceDot: 'current price (white dots: rates you tried)',
    s2bond: 'Bond: coupon rate {c}%, maturity {n} years (change it in step 0). ',
    s2readout: 'r = {r}%: price = {terms} = {p}. {verdict}',
    s2more: ' ({n} terms)',
    s2par: 'Exactly face value: r equals the coupon rate, so each coupon is precisely the interest 100 earns in the market.',
    s2discount: '{gap} below face value (a discount): r is above the {c}% coupon rate, so the coupons pay less than the market and the buyer makes up for it by paying less.',
    s2premium: '{gap} above face value (a premium): r is below the {c}% coupon rate, so the coupons beat the market and buyers will pay extra.',
    s2hint: 'What to try: move only r. In “Each payment’s worth today”, raising r shrinks every bar, and the further right, the more it shrinks. In “Present values end to end”, the orange piece (principal plus last coupon, the biggest and the furthest away) loses the most money, and the whole strip gets shorter and flips from premium to discount as it crosses the dashed line. In “Price vs market rate” the dot slides down and to the right. When r equals the coupon rate, the end of the strip lands exactly on the dashed line.',

    s3k: 'Step 3 · After a rate hike',
    s3t: 'You just bought a bond. Rates rise. Why can’t you sell it for 100?',
    s3e: 'This step asks: you paid face value, 100, for a 10-year bond with a 4% coupon, at a time when the market rate was also 4%. The next day the market rate is r_new and you want to sell. What can you get? Your buyer has an alternative: pay 100 for a newly issued bond whose coupon rate is r_new. Buyers compare using the <strong>yield to maturity</strong>: what yearly return they earn if they pay your asking price and hold to the end. To compute it, find the one rate that discounts the bond’s cash back to exactly the price paid. If that yield beats r_new, buyers rush in; if it falls short, nobody buys. So the price can only settle where the yield equals r_new (<a class="xlink" href="../../../math/applied/supply-demand/#step0">→ Supply & Demand, step 0: prices settle where both sides agree</a>).',
    newRate: 'New market rate r_new', ask: 'Your asking price',
    search3: 'Let the market set the price (halve the gap each round)',
    c3a: 'Buyer’s yield vs your asking price',
    c3b: 'Yearly coupon gap and its present value',
    lgYield: 'yield curve', lgRnew: 'new market rate r_new', lgAsk: 'your asking price', lgTrial: 'prices the market tried',
    lgShort: 'coupon you miss each year', lgExtra: 'extra coupon you get each year',
    s3progress: 'Market round {k}/{N} · ',
    s3readout: 'Asking {p}: the buyer’s yield to maturity is {y}%, a new bond pays {rn}%. → {verdict}  |  {market}',
    s3cheap: 'Better than a new bond: buyers rush in and bid the price up.',
    s3dear: 'Worse than a new bond: nobody buys, so the price has to come down.',
    s3fair: 'Exactly as good as a new bond: this is the market price.',
    s3below: 'Market price {fair} = 100 − {sf}: a new bond pays {gap} more every year, so this old one is {gap} short each year; those 10 shortfalls, discounted to today, add up to {sf}, which is exactly the discount.',
    s3above: 'Market price {fair} = 100 + {sf}: this old bond pays {gap} more than a new one every year; those 10 extras, discounted to today, add up to {sf}, which is exactly the premium.',
    s3same: 'Market price {fair}: r_new equals the 4% coupon rate, there is no gap, and the price stays at face value.',
    s3hint: 'What to try: set r_new to 5%, then move your asking price. In “Buyer’s yield vs your asking price” the dot rides the curve: the higher you ask, the lower the buyer’s yield, and only one price makes it touch the r_new line. Now press “Let the market set the price”: each round tries the middle of the remaining price range, raises the price if it was too cheap (yield above r_new) and cuts it if too dear. The trail of dots closes in on the crossing and stops at the market price. “Yearly coupon gap” shows where the discount comes from. Finally drag r_new below 4% and everything flips.',

    s4k: 'Step 4 · Maturity',
    s4t: 'Same one-point hike: who falls further, the 2-year or the 30-year?',
    s4e: 'This step asks: when the market rate moves by the same amount, how much do bonds of different maturities move? The three made-up bonds below all pay a 4% coupon, and the market rate starts at 4%, so each starts at face value, 100 (step 2: when r equals the coupon rate the price equals face value). Set a new market rate and each bond is re-discounted exactly as in step 2. The longer the maturity, the more years of missing (or extra) coupons there are, and the more years the principal is discounted over, so the more the price reacts.',
    newRate4: 'New market rate', sweep4: 'Sweep the rate from 1% to 8%',
    c4a: 'Price vs market rate (start: 4%, 100)',
    c4b: 'Price change (relative to 100)',
    lgM2: '2-year', lgM10: '10-year', lgM30: '30-year', lgStart: 'start: 4%, price 100',
    yrShort: '{n} yr',
    s4readout: 'Market rate 4% → {r}%: 2-year {p2} ({d2}) · 10-year {p10} ({d10}) · 30-year {p30} ({d30})',
    s4hint: 'What to try: drag from 4% right to 5% and see how far each dot drops: the 30-year falls the most and the 2-year barely moves; the bars in “Price change” put the gaps side by side. Drag left to 3% and all three rise, in the same order. All three curves pass through (4%, 100), and the longer the bond, the steeper its curve. They all bend upward too, which matters for the question below.',
    quizPrompt: 'Think it through: when the rate rises from 4% to 5%, the 30-year bond falls {d}%. If the rate instead falls from 4% to 3%, how much does it rise?',
    quizA: 'Also {d}%: up and down are symmetric', quizB: 'More than {d}%', quizC: 'Less than {d}%',
    check: 'Check',
    correct: 'Right. The curve bends upward, so it is steeper at lower rates: at 3% the bond gains {up}%, more than the {d}% it loses at 5%. Drag the slider to 3% and see for yourself.',
    wrong: 'Look again at the 30-year curve in “Price vs market rate”: is it steeper around 3% or around 5%? Drag to each side and compare the readouts.',

    s5k: 'Step 5 · One number for sensitivity',
    s5t: 'Why does “how long you wait, on average” predict the drop?',
    s5e: 'This step asks: can a single number capture how sensitive a bond is to rates? Treat the present value of each payment as a weight on a timeline: it sits at year t and weighs as much as that year’s present value (step 1). The point where the timeline balances is called D, the <strong>duration</strong>, measured in years. It means “how many years you wait for your money, on average, weighting each payment by its present value.” A larger D puts more of the money far away, and far-off money is discounted hardest and reacts most to rates. That gives a straight-line estimate: if rates rise one percentage point, the price changes by about <strong>−D/(1+r) × 1%</strong>. The market rate in this step is fixed at 4%.',
    c5a: 'Each payment’s present value by year; triangle = D',
    c5b: 'Duration D vs maturity n (years)',
    lgBal: 'balance point D', lgZero: 'zero-coupon bond (0% coupon): D = n', lgDc: 'D at the current coupon rate',
    s5readout: 'Coupon rate {c}%, maturity {n} years, r = 4%: D = {D} years. Rates up one point: estimate {a1}%, exact {e1}%. Rates down one point: estimate {a2}%, exact {e2}%.',
    s5hint: 'What to try: first set the coupon rate to 0%. Only the last weight is left, so the balance point sits at year n and D = n. Raise the coupon rate: the early weights get heavier, the triangle slides left toward today, and D drops below n. So at the same maturity, a higher coupon means less sensitivity. Then move the maturity: in “Duration D vs maturity n” the dot rides the curve, and with coupons D grows more slowly than n. The estimate is a straight line that only uses the slope of the price curve at the current point; the real curve bends upward, so the estimate always slightly understates gains and overstates losses. Across every slider setting in this step, the error stays under 0.7 percentage points while D is below 10 years, and it grows as D gets larger.',

    s6k: 'Step 6 · Wrap-up', s6t: 'When rates rise, old bonds get cheaper so new buyers can earn the new rate',
    s6fin: 'Looking back: in <strong>step 0</strong> a bond is a fixed stream of cash that does not change when rates do; in <strong>step 1</strong> future money is discounted at the market rate, so the longer the wait and the higher the rate, the less it is worth today; in <strong>step 2</strong> the price is the sum of those present values, at a discount when r is above the coupon rate and a premium when below; in <strong>step 3</strong> after a hike an old bond must fall until a new buyer earns the new rate, and the discount is exactly the present value of the coupons it is short; in <strong>step 4</strong> the longer the maturity, the more the price moves for the same rate change; in <strong>step 5</strong> the duration D, a present-value-weighted average wait, lets you estimate that move. If you never sell and the issuer pays as promised, you still collect every payment in the contract: a fall in price along the way is a loss only if you sell at that moment.',
    formula: 'present value = future cash / (1+r)^t\nprice = Σ cash in year t / (1+r)^t\nprice change ≈ −D / (1+r) × rate change',
    boundary: 'Scope: every bond, rate and price on this page is a made-up teaching example. It is not market data, does not forecast rates, and is not investment advice. The model assumes one coupon a year, prices quoted just after a coupon date (no accrued interest), a single market rate for every year (real markets have different rates for different maturities), an issuer that always pays (no default risk), and no taxes or fees. The “halve the gap each round” search in step 3 illustrates how a market homes in on a price; it is not how trades actually happen. The duration estimate is only reliable for small rate changes.',
    linksTitle: 'Where to go next',
    lk1: '→ Compound Interest, step 3: where present value and discounting come from',
    lk2: '→ Stocks & Bonds, step 2: what the bond IOU actually says',
    lk3: '→ Supply & Demand, step 0: why a price settles at equilibrium',
    lk4: '→ Risk & Return, step 3: why bearing more swings demands a higher return',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Interest Rates & Bonds · Why Do Bond Prices Fall When Rates Rise”.'
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
  if (typeof window.refreshBonds === 'function') window.refreshBonds();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BOND_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
