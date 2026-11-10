'use strict';
// Stocks & bonds lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '股票与债券 · 一家面包店的两种凭证',
    back: '← 知识索引',
    compare: '对照另一版本：股票与债券 · 买到的到底是什么 →',
    navLabel: '股票与债券步骤导航',
    tagline: '街角有一家虚构的面包店，想买一台新烤炉，钱不够。它可以把店分成很多小份卖给大家（股票），也可以向大家借钱、写下借条（债券）。同样花 1000 元，买股票和买债券，到手的是完全不同的东西。五步里你会看清：谁分利润、谁拿固定利息、店倒闭时谁先拿钱、股价又是怎么定出来的。',
    nav0: '0 股票：一份所有权', nav1: '1 债券：一张借条', nav2: '2 好年景与坏年景', nav3: '3 倒闭时谁先拿', nav4: '4 股价怎么来', nav5: '5 收束',

    s0k: '第 0 步 · 股票',
    s0t: '买了面包店的 10 股，你到底拥有什么？',
    s0e: '这一步要回答：买股票时，你买到的是什么？面包店把自己分成 <strong>100 份一样大的股份</strong>，每份卖 100 元。<strong>股票</strong>就是这种股份的凭证：买了 k 股，你就拥有这家店的 k%。拥有意味着两件事：店里赚的<strong>利润</strong>（卖面包收的钱减去所有成本）有你的一份；开会做决定时，一股一票。这家店每年把一半利润拿出来按股份发给大家，叫<strong>分红</strong>；另一半留在店里继续用（买面粉、修机器），这部分没变成你手里的现金，但仍然属于全体股东。上图 100 个小方块是 100 股，青色是你的；下图横条是今年的利润，绿色是发出来的分红，紫色是留在店里的，亮框框住的是属于你的部分。',
    c0a: '上：100 股中你持有的股份；下：今年利润分成分红和留存两部分',
    c0top: '面包店的 100 股',
    c0bot: '今年的利润（元）：分红 + 留在店里',
    lgMine: '你的股份', lgOthers: '别人的股份', lgDiv: '分红（发出来的现金）', lgKept: '留在店里的利润',
    kSlider: '你买了几股 k', profitSlider: '面包店今年的利润',
    s0readout: '你买了 {k} 股，花了 {cost}，拥有面包店的 {frac}，开会时有 {k} 票（共 100 票）。今年利润 {p}：分红一共 {div}，你拿到 {mine}；留在店里的 {kept} 中，有 {keptMine} 也算你的那一份。',
    s0zero: '你买了 {k} 股，花了 {cost}，拥有面包店的 {frac}，开会时有 {k} 票（共 100 票）。今年没有赚钱，所以没有分红——股东拿多少，要看店赚多少。',
    s0hint: '观察顺序：先只拖「你买了几股」：上图青色方块变多，下图亮框跟着按同样的比例变宽。再只拖「今年的利润」：方块不变，亮框却跟着利润一起伸缩，拖到 0 时分红没了。股东的收入不是事先说好的，而是跟着利润走。',

    s1k: '第 1 步 · 债券',
    s1t: '买一张债券，换来的是什么？',
    s1e: '这一步要回答：买债券时，你买到的是什么？<strong>债券</strong>是一张借条：你借给面包店 1000 元（叫<strong>面值</strong>），面包店写明每年付你多少利息、哪年把 1000 元还给你。每年的利息占面值的比例叫<strong>票息率</strong>，还钱的那一年叫<strong>到期</strong>。和股票不同：你不拥有面包店，开会没有投票权；利息是事先写死的，店里赚多赚少都不变（前提是店还付得起，第 3 步会看付不起时怎样）。图的横轴是第几年，每根柱是那一年你收到的钱：绿色是利息，青色是到期还回来的 1000 元本金；白线是到那年为止一共收回了多少。',
    c1a: '一张债券每年付给你的利息和到期还本的柱状图，白线是累计收到的钱',
    c1title: '每年收到的钱（元）与累计',
    lgCoupon: '每年的利息', lgBack: '到期还回的本金 1000', lgCum: '累计收到',
    cSlider: '票息率 c', TSlider: '几年后到期 T',
    s1readout: '票息率 {c}、{T} 年到期：每年收利息 {cp}，一共收 {T} 次，第 {T} 年还回本金 {face}。总共拿回 {total}，其中利息 {int}。这些数字都写在借条上，不管面包店那几年赚多少。',
    s1hint: '观察顺序：先拖「票息率」：每根绿色柱同样变高，白线变陡。再拖「几年后到期」：柱子变多，青色的本金柱一直出现在最后一年。注意图里没有任何东西跟着利润变——这正是债券和第 0 步股票的区别。',

    s2k: '第 2 步 · 好年景与坏年景',
    s2t: '同样花 1000 元，买股票和买债券，在好年和坏年各拿到什么？',
    s2e: '这一步要回答：利润高的年份和亏钱的年份，股东和债主各得到什么？面包店借了 5000 元（发了 5 张面值 1000 的债券，票息率 8%），所以每年要付 <strong>400 元利息</strong>。你手里有两种选择，都花 1000 元：<strong>买 10 股</strong>（10% 的所有权）或者<strong>买 1 张债券</strong>（每年 80 元利息）。规则是：店里一年的<strong>经营利润</strong>（还没付利息前赚的钱）先拿去付利息，不够就用店里存的 1000 元现金补；付完利息<strong>剩下的，不管是赚是亏，都归股东</strong>，所以股东也叫「剩余索取者」。这里股东的那份按「赚了或亏了多少」算，不管它有没有当作分红发出来。上图横轴是经营利润，纵轴是你这一年得到的（元，负数表示你那份亏了）：橙线是债券，青线是 10 股。下图在你按「演 8 年」后，逐年画出 8 个虚构年份里两种选择的结果。',
    c2a: '上：一年中你从债券和 10 股得到的钱随经营利润变化；下：8 个虚构年份逐年对比',
    c2top: '你这一年得到的（元）随经营利润',
    c2bot: '8 个虚构年份：每年得到的（元）',
    lgStock: '10 股（花 1000）', lgBond: '1 张债券（花 1000）',
    opSlider: '面包店这一年的经营利润（付利息前）',
    run2: '演 8 年', clear2: '清空',
    s2readout: '经营利润 {p}：面包店先付利息 {paid}（你那张债券拿 {b}），剩下 {own} 归股东，你的 10 股分到 {s}。{cmp}',
    s2more: '这一年股票比债券多。', s2less: '这一年债券比股票多。', s2same: '这一年两者一样多。',
    s2be: '经营利润超过 {be} 时，10 股那份才比债券多。',
    s2idle: '按「演 8 年」，看 8 个虚构年份里两种选择逐年拿到什么。',
    s2run: '8 个虚构年份（第 {k}/{N} 年）：债券累计 {bc}，10 股累计 {sc}。10 股最好的一年 {best}，最差的一年 {worst}；债券每年都是 {fixed}。',
    s2hint: '观察顺序：拖经营利润从 −2000 到 6000：橙线几乎是平的，只在亏得很厉害、连店里现金都不够付利息时才往下掉；青线是一条斜线，好年多拿、坏年亏钱。两线交在白点处。再按「演 8 年」：下图一年一年长出来，青柱忽高忽低，橙柱一样高。这 8 年的数字是编的，换一串年份，结果可能完全不同。',

    s3k: '第 3 步 · 倒闭时',
    s3t: '面包店开不下去了，卖掉家当的钱先给谁？',
    s3e: '这一步要回答：店倒闭时，债主和股东谁先拿钱？面包店把烤炉、桌椅、存货全部卖掉，一共卖得 V 元。规则叫<strong>清偿顺序</strong>：先还借的钱，<strong>债主（买债券的人）排在前面</strong>，最多拿回欠他们的 5000 元；还完债还有剩，才轮到<strong>股东</strong>按股份分。上图横条是卖得的钱怎样分：橙色给债主，青色给股东，虚线框是欠债主的 5000 元。下图横轴是卖得多少钱，纵轴是你拿回的钱（元）：橙线是你那张 1000 元债券，青线是你那 10 股（当初也花了 1000 元）。',
    c3a: '上：卖得的钱先分给债主、再分给股东；下：你的债券和 10 股各拿回多少随卖得的钱变化',
    c3top: '卖得的钱怎样分（元）',
    c3bot: '你拿回的钱（元）随卖得的钱',
    lgLenders: '分给债主', lgOwners: '分给股东', lgOwed: '欠债主的 5000',
    VSlider: '卖掉家当一共卖得 V',
    s3readout: '卖得 {V}：债主拿 {L}（欠他们 5000 的 {lp}），股东拿 {O}。你的债券拿回 {mb}（借出 1000），你的 10 股拿回 {ms}（当初花了 1000）。',
    s3hint: '观察顺序：把 V 从 0 慢慢拖到 12000。V 不到 5000 时，钱全给了债主，青色一点都没有，你的 10 股拿回 0；V 超过 5000 后，橙色停在 5000 不再变，多出来的全是青色。债券拿回的钱最多就是 1000；股票拿回的钱没有上限，但排在后面。',
    quizPrompt: '小测：如果卖掉家当只得到 4000 元，你那 10 股能拿回多少？',
    quizA: '400 元（4000 的 10%）', quizB: '0 元', quizC: '1000 元',
    check: '检查',
    correct: '对。4000 元还不够还欠债主的 5000 元，全部给了债主，股东排在后面，一分也拿不到。你那张债券拿回 {bond}。',
    wrong: '想一想清偿顺序：先还债主的 5000，有剩才轮到股东。4000 够不够还债？',

    s4k: '第 4 步 · 股价',
    s4t: '面包还是那些面包，股价为什么会变？',
    s4e: '这一步要回答：股票的价格是谁定的？面包店卖出股份以后，这些股份可以在人和人之间买卖，买卖的地方叫<strong>股票市场</strong>。价格不是面包店定的，而是想买的人和想卖的人谈出来的。这里有 10 个想买的人，各自心里有一个「最多愿意出多少」；10 个想卖的人，各自有一个「最少要卖多少」。把买家从出价高到低排，卖家从要价低到高排，只要下一位买家的出价还不低于下一位卖家的要价，就能成交一股；能成交的最后一对附近，就是<strong>成交价</strong>（类似供求曲线的交点，<a class="xlink" href="../../../math/applied/supply-demand/#step0">→ 供求页第 0 步：两条线的交点为什么就是价格</a>）。上图横轴是第几股，纵轴是价格（元）：绿色台阶是买家的出价，粉色台阶是卖家的要价，白点是成交价。滑杆模拟一条消息：每个买家愿意出的价都多（或少）同样的钱。下图记录你试过的每种消息下的成交价。',
    c4a: '上：买家出价与卖家要价两条台阶及成交价；下：不同消息下的成交价',
    c4top: '买家出价与卖家要价（元），按第几股排列',
    c4bot: '成交价（元）随消息',
    lgBuyers: '买家最多愿意出', lgSellers: '卖家最少要卖', lgPrice: '成交价',
    moodSlider: '消息：每位买家多愿意出（元）',
    s4readout: '消息 {m}：成交 {q} 股，成交价约 {p}（在 {lo} 到 {hi} 之间都能成交，这里取中间）。面包店的利润一分没变。',
    s4hint: '观察顺序：把消息从 0 拖到 +30：绿色台阶整体抬高，和粉色台阶的交点右移、上移，成交价变高，成交的股数也变多。再拖到 −30：价格下跌。下图把你试过的每个价格都留下来。面包店本身什么都没变，变的只是大家对它的看法；人们愿意出多少，通常取决于他们估计这份所有权将来能带来多少利润。',

    s5k: '第 5 步 · 收束', s5t: '买到的到底是什么',
    thAspect: '比较项', thStock: '股票', thBond: '债券',
    rowWhat: '买到什么', rowPay: '拿到什么钱', rowBad: '亏钱的年份', rowFail: '倒闭时', rowPrice: '价格',
    stWhat: '一小份所有权，一股一票', bdWhat: '一张借条：借给公司的钱，没有投票权',
    stPay: '利润中属于你的那份（发出来的分红 + 留在公司的部分），多少不固定', bdPay: '事先写死的利息，到期还本',
    stBad: '你那份跟着亏', bdBad: '照样拿利息，只要公司还付得起',
    stFail: '排在债主后面，常常拿不到钱', bdFail: '排在前面，最多拿回欠你的',
    stPrice: '由买卖双方的看法决定，会随消息涨跌', bdPrice: '也可以转卖，价格会随利率变（见下面的链接）',
    s5fin: '回顾：<strong>第 0 步</strong>股票是所有权，你分到利润的一份，也有投票权。<strong>第 1 步</strong>债券是借条，利息和还本日期事先写好。<strong>第 2 步</strong>利息先付，剩下的归股东：好年股东多拿，坏年股东先亏，债主的收入几乎不变。<strong>第 3 步</strong>倒闭时先还债主，股东拿剩下的。<strong>第 4 步</strong>股价是买卖双方谈出来的，消息一变，价格就变，哪怕面包店本身没变。所以，「股票风险大、可能赚得多；债券更稳、赚得有限」不是一句口号，而是这些规则的结果。',
    boundary: '适用范围：面包店、价格、利润和 8 个年份都是编的，不对应任何真实公司或行情。真实情况更复杂：公司还有别的债主（比如供应商、银行），可以不分红，也可能借了钱却付不起利息（违约）；债券也能在市场上买卖，价格会随利率变化。本页只讲这两种凭证是什么，不是投资建议。',
    linksTitle: '接着去哪',
    lk1: '→ 供求页第 0 步：价格为什么落在两条线的交点',
    lk2: '→ 风险与回报第 3 步：为什么风险大的东西要承诺更高的回报',
    lk3: '→ 利率与债券第 3 步：利率上升时，旧债券为什么变便宜',
    lk4: '→ 分散投资第 1 步：几样东西一起涨跌时，组合有多稳',
    money: '{v} 元',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《股票与债券 · 买到的到底是什么》的平行版本。'
  },
  en: {
    pageTitle: 'Stocks & Bonds · Two Kinds of Paper from One Bakery',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Stocks & Bonds · What Do You Actually Buy →',
    navLabel: 'Stocks and bonds step navigation',
    tagline: 'A made-up corner bakery wants a new oven and does not have the money. It can split the shop into many small pieces and sell them (stocks), or borrow from people and write them an IOU (bonds). Spend $1,000 on each and you end up holding two very different things. In five steps you will see who shares the profit, who gets fixed interest, who is paid first if the shop closes, and where a share price comes from.',
    nav0: '0 A stock: a slice of ownership', nav1: '1 A bond: an IOU', nav2: '2 Good years and bad', nav3: '3 Who is paid first', nav4: '4 Where prices come from', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Stocks',
    s0t: 'You bought 10 shares of the bakery. What do you actually own?',
    s0e: 'The question for this step: when you buy a stock, what are you buying? The bakery divides itself into <strong>100 equal shares</strong> and sells each for $100. A <strong>stock</strong> is a claim on such shares: hold k shares and you own k% of the shop. Owning means two things. A share of the <strong>profit</strong> (money from selling bread minus every cost) is yours, and when owners meet to decide something, each share is one vote. Every year this bakery pays half its profit out to the owners in proportion to their shares, which is called a <strong>dividend</strong>. The other half stays in the shop to be used (flour, repairs). That half never reaches your pocket as cash, but it still belongs to the owners. In the top panel the 100 small squares are the 100 shares, and yours are cyan. The bottom bar is this year’s profit: green is paid out as dividends, violet stays in the shop, and the bright outline marks the part that is yours.',
    c0a: 'Top: the shares you hold out of 100. Bottom: this year’s profit split into dividends and money kept in the shop',
    c0top: 'The bakery’s 100 shares',
    c0bot: 'This year’s profit ($): dividends + kept in the shop',
    lgMine: 'Your shares', lgOthers: 'Other people’s shares', lgDiv: 'Dividends (cash paid out)', lgKept: 'Profit kept in the shop',
    kSlider: 'Shares you bought, k', profitSlider: 'The bakery’s profit this year',
    s0readout: 'You bought {k} shares for {cost}, so you own {frac} of the bakery and have {k} votes out of 100. Profit this year is {p}: dividends total {div}, of which you get {mine}; of the {kept} kept in the shop, {keptMine} is your share too.',
    s0zero: 'You bought {k} shares for {cost}, so you own {frac} of the bakery and have {k} votes out of 100. The shop made no profit this year, so there is no dividend. What owners receive depends on what the shop earns.',
    s0hint: 'What to try: first drag only “Shares you bought”. More squares turn cyan and the bright outline below widens in the same proportion. Then drag only “The bakery’s profit”. The squares stay put, but the outline grows and shrinks with the profit, and at 0 the dividend disappears. An owner’s income is not agreed in advance; it follows the profit.',

    s1k: 'Step 1 · Bonds',
    s1t: 'Buy one bond. What do you get for it?',
    s1e: 'The question for this step: when you buy a bond, what are you buying? A <strong>bond</strong> is an IOU. You lend the bakery $1,000 (the <strong>face value</strong>), and the bakery writes down how much interest it will pay you each year and in which year it will pay the $1,000 back. The yearly interest as a share of the face value is the <strong>coupon rate</strong>; the year the money comes back is <strong>maturity</strong>. Unlike a stock, you do not own any of the bakery and you get no vote; the interest is fixed in advance and does not change with how much the shop earns (as long as it can still pay; step 3 looks at what happens when it cannot). Across is the year; each bar is the money you receive that year: green is interest, cyan is the $1,000 paid back at maturity. The white line is the running total received so far.',
    c1a: 'Bar chart of the interest a bond pays you each year and the principal at maturity, with the running total as a white line',
    c1title: 'Money received each year ($) and running total',
    lgCoupon: 'Interest each year', lgBack: '$1,000 paid back at maturity', lgCum: 'Total received so far',
    cSlider: 'Coupon rate c', TSlider: 'Years to maturity T',
    s1readout: 'Coupon rate {c}, maturing in {T} years: you receive {cp} of interest each year, {T} times, and get {face} back in year {T}. In all you receive {total}, of which {int} is interest. Every one of these numbers is written on the IOU, whatever the bakery earns in those years.',
    s1hint: 'What to try: drag “Coupon rate” first. Every green bar rises by the same amount and the white line gets steeper. Then drag “Years to maturity”: more bars appear, and the cyan principal bar always sits in the last year. Notice that nothing in this chart moves with profit. That is exactly the difference from the stock in step 0.',

    s2k: 'Step 2 · Good years and bad',
    s2t: 'Spend $1,000 on stock or on a bond: what do you get in a good year and in a bad one?',
    s2e: 'The question for this step: in a high-profit year and in a losing year, what do owners and lenders each get? The bakery has borrowed $5,000 (five bonds of $1,000 at an 8% coupon), so it owes <strong>$400 of interest</strong> every year. You have two choices, each costing $1,000: <strong>buy 10 shares</strong> (10% ownership) or <strong>buy one bond</strong> ($80 of interest a year). The rule: the year’s <strong>operating profit</strong> (what the shop earns before paying interest) goes to pay the interest first, topped up from the $1,000 of cash in the till if needed. <strong>Whatever is left, gain or loss, belongs to the owners</strong>, which is why owners are called “residual claimants”. Here the owners’ share counts what was gained or lost, whether or not it was paid out as a dividend. In the top panel, across is operating profit and up is what you get this year in dollars (negative means your share lost money): orange is the bond, cyan the 10 shares. After you press “Play 8 years”, the bottom panel draws both choices year by year through eight invented years.',
    c2a: 'Top: what the bond and the 10 shares bring you in one year, against operating profit. Bottom: eight invented years compared year by year',
    c2top: 'What you get this year ($) against operating profit',
    c2bot: 'Eight invented years: what you get each year ($)',
    lgStock: '10 shares (cost $1,000)', lgBond: 'One bond (cost $1,000)',
    opSlider: 'The bakery’s operating profit this year (before interest)',
    run2: 'Play 8 years', clear2: 'Clear',
    s2readout: 'Operating profit {p}: the bakery pays {paid} of interest first (your bond gets {b}), the remaining {own} belongs to the owners, and your 10 shares get {s}. {cmp}',
    s2more: 'This year the stock beats the bond.', s2less: 'This year the bond beats the stock.', s2same: 'This year they are equal.',
    s2be: 'Only when operating profit is above {be} do the 10 shares beat the bond.',
    s2idle: 'Press “Play 8 years” to see what each choice brings, year by year, over eight invented years.',
    s2run: 'Eight invented years (year {k}/{N}): the bond has brought {bc} in total, the 10 shares {sc}. The shares’ best year was {best} and their worst {worst}; the bond paid {fixed} every year.',
    s2hint: 'What to try: drag operating profit from −2000 to 6000. The orange line is almost flat; it only drops when the loss is so deep that even the cash in the till cannot cover the interest. The cyan line slopes: more in good years, a loss in bad ones. They cross at the white dot. Then press “Play 8 years”: the bottom chart grows one year at a time, the cyan bars jump around and the orange bars stay level. These eight years are made up; a different run of years could turn out completely differently.',

    s3k: 'Step 3 · If the shop closes',
    s3t: 'The bakery shuts down. Who gets the money from selling everything?',
    s3e: 'The question for this step: if the shop closes, who is paid first, lenders or owners? The bakery sells its oven, tables and stock for V dollars in total. The rule is the <strong>order of repayment</strong>: debts come first, so <strong>lenders (bondholders) are at the front of the queue</strong> and get back up to the $5,000 they are owed; only if something is left do the <strong>owners</strong> share it by their shares. The top bar shows how the sale money is split: orange to lenders, cyan to owners, with a dashed box for the $5,000 owed to lenders. In the bottom panel, across is how much the sale raised and up is what you get back in dollars: orange for your $1,000 bond, cyan for your 10 shares (which also cost $1,000).',
    c3a: 'Top: the sale money goes to lenders first, then owners. Bottom: what your bond and your 10 shares get back, against the sale money',
    c3top: 'How the sale money is split ($)',
    c3bot: 'What you get back ($) against the sale money',
    lgLenders: 'To lenders', lgOwners: 'To owners', lgOwed: '$5,000 owed to lenders',
    VSlider: 'Money raised by selling everything, V',
    s3readout: 'Sale raises {V}: lenders get {L} ({lp} of the 5000 owed), owners get {O}. Your bond gets back {mb} (you lent 1000); your 10 shares get back {ms} (they cost 1000).',
    s3hint: 'What to try: drag V slowly from 0 to 12000. Below 5000, every dollar goes to lenders, there is no cyan at all, and your 10 shares get back nothing. Above 5000, the orange stops growing at 5000 and everything extra is cyan. A bond can get back at most its $1,000; shares have no ceiling but stand at the back of the queue.',
    quizPrompt: 'Quick check: if selling everything raises only $4,000, how much do your 10 shares get back?',
    quizA: '$400 (10% of 4000)', quizB: '$0', quizC: '$1,000',
    check: 'Check',
    correct: 'Right. $4,000 is not even enough to repay the $5,000 owed to lenders, so all of it goes to them. Owners stand behind them and get nothing. Your bond gets back {bond}.',
    wrong: 'Think about the order of repayment: the $5,000 owed to lenders comes first, and owners only share what is left. Is $4,000 enough to repay the debt?',

    s4k: 'Step 4 · Share prices',
    s4t: 'Same bakery, same bread. Why does the share price move?',
    s4e: 'The question for this step: who sets the price of a share? Once the bakery has sold its shares, people can sell them on to each other, and the place where that happens is the <strong>stock market</strong>. The price is not set by the bakery; it is agreed between people who want to buy and people who want to sell. Here there are ten would-be buyers, each with a top price in mind, and ten would-be sellers, each with a lowest acceptable price. Line buyers up from the highest offer down and sellers from the lowest asking price up. As long as the next buyer offers at least what the next seller asks, one share changes hands. Around the last pair that can trade sits the <strong>trading price</strong> (much like the crossing of supply and demand curves, <a class="xlink" href="../../../math/applied/supply-demand/#step0">→ Supply & demand, step 0: why the crossing point is the price</a>). In the top panel, across is the share number and up is price in dollars: the green staircase is what buyers offer, the pink staircase what sellers ask, and the white dot is the trading price. The slider plays a piece of news: every buyer is willing to pay the same amount more (or less). The bottom panel keeps the trading price for every piece of news you try.',
    c4a: 'Top: buyers’ offers and sellers’ asking prices as two staircases with the trading price. Bottom: trading price under different news',
    c4top: 'Buyers’ offers and sellers’ asks ($), by share number',
    c4bot: 'Trading price ($) against the news',
    lgBuyers: 'Most a buyer will pay', lgSellers: 'Least a seller will take', lgPrice: 'Trading price',
    moodSlider: 'News: how much more each buyer will pay ($)',
    s4readout: 'News {m}: {q} shares trade at about {p} (any price from {lo} to {hi} would clear; this takes the middle). The bakery’s profit has not changed by a cent.',
    s4hint: 'What to try: drag the news from 0 to +30. The green staircase lifts, its crossing with the pink one moves up and to the right, the price rises and more shares change hands. Drag to −30 and the price falls. The bottom panel keeps every price you have tried. Nothing about the bakery itself changed, only what people think of it; how much people will pay usually depends on how much profit they expect that slice of ownership to bring in future.',

    s5k: 'Step 5 · Wrap-up', s5t: 'What you actually buy',
    thAspect: 'Aspect', thStock: 'Stock', thBond: 'Bond',
    rowWhat: 'What you buy', rowPay: 'What money you get', rowBad: 'In a losing year', rowFail: 'If the company fails', rowPrice: 'Price',
    stWhat: 'A slice of ownership, one vote per share', bdWhat: 'An IOU: money lent to the company, no vote',
    stPay: 'Your share of the profit (dividends paid out + what stays in the company); not fixed', bdPay: 'Interest fixed in advance, principal back at maturity',
    stBad: 'Your share loses money too', bdBad: 'Interest still arrives, as long as the company can pay',
    stFail: 'Behind the lenders; often nothing left', bdFail: 'At the front; at most what you are owed',
    stPrice: 'Set by what buyers and sellers think; moves with news', bdPrice: 'Can be resold too; the price moves with interest rates (see the links below)',
    s5fin: 'The thread. <strong>Step 0</strong>: a stock is ownership; you get a share of the profit and a vote. <strong>Step 1</strong>: a bond is an IOU, with interest and a repayment date written in advance. <strong>Step 2</strong>: interest is paid first and owners keep what is left, so in good years owners get more, in bad years owners lose first, and lenders’ income barely changes. <strong>Step 3</strong>: if the company fails, lenders are repaid first and owners get the remainder. <strong>Step 4</strong>: a share price is agreed between buyers and sellers, and news moves it even when the bakery itself is unchanged. So “stocks are riskier and may earn more; bonds are steadier and earn a set amount” is not a slogan; it follows from these rules.',
    boundary: 'Scope: the bakery, the prices, the profits and the eight years are invented and describe no real company or market. Real life is messier: companies owe other people too (suppliers, banks), may skip dividends, and can fail to pay interest they owe (default); bonds are also traded, and their prices move with interest rates. This page only explains what the two kinds of paper are. It is not investment advice.',
    linksTitle: 'Where to go next',
    lk1: '→ Supply & demand, step 0: why the price sits where two curves cross',
    lk2: '→ Risk & return, step 3: why riskier things have to promise more',
    lk3: '→ Interest rates & bonds, step 3: why older bonds get cheaper when rates rise',
    lk4: '→ Diversification, step 1: how steady a mix is when things rise and fall together',
    money: '${v}',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Stocks & Bonds · What Do You Actually Buy”.'
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
  if (typeof window.refreshStocks === 'function') window.refreshStocks();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SB_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
