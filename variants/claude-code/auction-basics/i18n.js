'use strict';
// Auctions lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '拍卖 · 该报多少，才不吃亏',
    back: '← 知识索引',
    compare: '对照另一版本：拍卖 · 报价与真话 →',
    navLabel: '拍卖步骤导航',
    tagline: '一件旧吉他要拍卖，你心里觉得它值 60 元。该报 60 吗？报低一点会不会更划算？答案取决于「赢了付多少」这条规则。七步里你会算出第一价格拍卖该压多少价，看清第二价格拍卖为什么说真话最稳，再看几种拍法平均收的钱为何一样，最后碰上「赢了反而亏」的赢家诅咒。',
    nav0: '0 一次出价', nav1: '1 不知对手', nav2: '2 第二价格', nav3: '3 谁收得多', nav4: '4 喊价拍卖', nav5: '5 赢家诅咒', nav6: '6 收束',

    s0k: '第 0 步 · 规则先行',
    s0t: '如果偷看到了对手的出价，你会报多少？',
    s0e: '这一步要回答：在「赢家按自己的报价付钱」的规则下，报价怎样决定你赚多少？先定几个词。<strong>估值 v</strong>：这件东西对你值多少钱，也就是你最多愿意付的价，只有你自己知道。<strong>报价 b</strong>：你写进信封交上去的数。两人各交一个信封，报价高的人赢，平局算对手赢。<strong>第一价格拍卖</strong>：赢家付自己的报价 b。所以赢了的收益是 v − b，输了是 0（不花钱也拿不到东西）。下图横轴是你的报价 b，纵轴是你的收益（元）；对手的报价 r 先假设你偷看到了。',
    c0: '收益（元）随你的报价 b 变化 · 第一价格',
    s0lgPay: '收益曲线', s0lgR: '对手报价 r', s0lgV: '你的估值 v', s0lgYou: '你现在的报价', s0lgBand: '能赚钱的报价区间',
    valueV: '你的估值 v（元）', rivalR: '对手的报价 r（元）', bidB: '你的报价 b（元）',
    s0win: '你报 {b} > 对手 {r}：你赢，付自己的报价 {b} 元，收益 = v − b = {u} 元。',
    s0winLoss: '你报 {b} > 对手 {r}：你赢了，但付的 {b} 元比估值还高，倒亏 {u} 元。',
    s0lose: '你报 {b} ≤ 对手 {r}：对手赢（平局算对手），你收益 0。',
    s0best: '知道 r 时最好的做法：报一个刚好高过 {r} 的数，收益接近 v − r = {g} 元；报得更高只是白多付钱。',
    s0bestNone: '对手报的 {r} 已不低于你的估值 {v}：凡是能赢的报价都会亏钱，最好的选择是不赢。',
    s0hint: '观察顺序：先把 v 留在 60、r 留在 35，从左往右拖「你的报价」：在 r 左边收益一直是 0（输了），一越过 r 就跳上去，然后每多报 1 元收益少 1 元。再拖 r：绿色区间（能赚钱的报价）随之变窄。可是现实里看不到 r，下一步就把它变成未知数。',

    s1k: '第 1 步 · 不知道对手',
    s1t: '看不到对手的出价时，报多少平均最划算？',
    s1e: '这一步要回答：对手报价未知时，第一价格拍卖该报多少？你只知道对手的报价在 0 到 100 元之间「均匀」出现：落在任何一段的可能性与这段的长度成正比。于是报 b 时，<strong>赢的概率</strong>是 b/100（对手报价低于 b 的比例），赢了能赚 v − b。把「赢了的收益 × 赢的概率」叫作<strong>期望收益</strong>（同一场拍卖重复很多次时，平均每次的收益；<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ 期望值页第 0 步：按概率加权相加</a>）。这里它是 (v − b) · b / 100：报高了容易赢但赚得少，报低了赚得多却难赢。这是一条开口向下的抛物线，顶点在 b = v/2。为了不只靠公式，上图放了 4000 个按均匀分布抽出的对手报价；下图白点是你每试一个 b，与这 4000 个对手各拍一次得到的平均收益。把报价有意压到估值以下，叫作<strong>压价</strong>。',
    c1: '4000 个模拟对手与期望收益曲线',
    c1a: '4000 个模拟对手报价：橙色是你能赢的',
    c1b: '期望收益（元）随报价 b 变化 · v = {v}',
    s1lgBeat: '你能赢的对手', s1lgLose: '你会输的对手', s1lgCurve: '公式 (v − b)·b/100', s1lgDot: '模拟平均（每个试过的 b）', s1lgBest: '最优报价 v/2',
    clearDots: '清空试过的点',
    s1readout: '报 {b}：模拟中赢下 {w} 的场次（公式 {wt}）；赢一次赚 v − b = {g} 元；平均每场收益 模拟 {e} 元 · 公式 {et} 元。最优报价 v/2 = {best}，期望收益 {bv} 元。',
    s1hint: '观察顺序：保持 v = 80，把报价从 100 慢慢拖到 0。上图橙色点越来越少（赢得少了），下图白点却先升后降，在 b = 40 附近最高。再换一个 v（会清空白点）：最高点总在 v 的一半。本页 v、b 的所有格点上，模拟平均与公式相差都不到 1 元。适用条件：只有一个对手，你对他报价的估计是 0–100 均匀，你只在乎平均收益。',

    s2k: '第 2 步 · 换一条付款规则',
    s2t: '如果赢家只付对手的报价，说真话会不会吃亏？',
    s2e: '这一步要回答：<strong>第二价格拍卖</strong>（也叫<strong>维克里拍卖</strong>）规定，报价最高的人赢，但只付第二高的报价，在两人拍卖里就是对手的报价 r。现在你的报价只决定「赢不赢」，不再决定「付多少」。下图横轴换成对手的报价 r（因为你不知道它，就把每一种可能都画出来），纵轴是收益：白色虚线是报真实估值 b = v 时的收益，青色是你现在的报价。两条线只在红色区域不同。如果一种报价面对对手的<strong>任何</strong>报价都不比别的报价差，就叫<strong>占优策略</strong>。',
    c2: '收益（元）随对手报价 r 变化 · 第二价格',
    s2lgTruth: '报真话 b = v', s2lgYou: '你的报价 b', s2lgGap: '两者结果不同的区域', s2lgR: '对手的这次报价 r（空心 = 报真话）',
    s2win: '对手报 {r}：你赢，付 {r} 元，收益 {u} 元；',
    s2lose: '对手报 {r}：你输，收益 0；',
    s2truthWin: '报真话会赢，收益 {u} 元。',
    s2truthLose: '报真话也会输，收益 0。',
    s2all: '把 r 从 0 扫到 100：你的报价没有一次比报真话赚得多（最多多赚 {g} 元）。',
    s2same: '你正在报真话。',
    s2under: '少报的代价：对手报在 {lo} 到 {hi} 之间时，你本来能以低于估值的价格赢下，却输掉了，最多少赚接近 {gap} 元；对手报价均匀分布时平均少赚 {el} 元。',
    s2over: '多报的代价：对手报在 {lo} 到 {hi} 之间时，你赢了却要付高于估值的价，最多亏接近 {gap} 元；对手报价均匀分布时平均少赚 {el} 元。',
    s2hint: '观察顺序：先只拖「你的报价」，让它离开 v：无论往下还是往上，红色区域都出现，而青线从不高出白色虚线。再拖「对手的报价」：实心点只会在红色区域里低于空心点。最后把 v 换成别的值，重复一遍。适用条件：单件物品、你知道自己的估值；结论不依赖对手怎样出价。',
    quizPrompt: '第二价格拍卖里，估值 60 元的你想「保证拿下」，报了 90 元。什么情况下这一招会让你比报 60 更差？',
    quizA: '永远不会，报高只会多赢', quizB: '对手报价落在 60 和 90 之间时', quizC: '对手报价低于 60 时',
    check: '核对',
    correct: '对。对手报 60 到 90 之间时，报 60 会输（收益 0），报 90 会赢，但付的价高于 60，倒亏。对手低于 60 时两种报法结果一样；高于 90 时都输。',
    wrong: '再看图：把 v 设为 60、报价设为 90，红色区域在哪一段 r 上？那一段里青线在零线下方。',

    s3k: '第 3 步 · 卖家的账',
    s3t: '两种规则下，卖家平均收到的钱谁多？',
    s3e: '这一步要回答：第一价格拍卖里人人压价，第二价格拍卖里人人说真话，卖家平均能收多少？设有 n 个竞拍者，每人的估值各自独立、在 0–100 元均匀抽取。第一价格时，当所有人都报 v · (n − 1)/n，谁单独改报价都不会让自己的期望收益更高，这样的局面叫<strong>均衡</strong>（n = 2 时就是第 1 步的 v/2）。第二价格时人人报真话。上图是最近一轮：灰柱是各人估值，橙色横杠是各人在第一价格下的报价，两条虚线是两种规则下卖家收到的钱。下图每轮留下两个点（橙 = 第一价格收入，青 = 第二价格收入），粗线是到目前为止的平均。理论上两者平均都是 100 · (n − 1)/(n + 1)，这叫<strong>收入等价</strong>。',
    c3: '一轮拍卖与累计平均收入',
    c3a: '第 {k} 轮：柱 = 估值，橙杠 = 第一价格报价',
    c3a0: '还没开拍：按下方按钮',
    c3b: '每轮收入（点）与累计平均（粗线）',
    s3lgVal: '估值（亮的是最高者）', s3lgFirst: '第一价格：报价与收入', s3lgSecond: '第二价格：收入 = 第二高估值', s3lgTheory: '理论平均 100(n−1)/(n+1)',
    nBidders: '竞拍人数 n', oneRound: '拍 1 轮', hundredRounds: '连拍 100 轮', clearRounds: '清空重来',
    s3empty: 'n = {n}：第一价格均衡报价 = 估值 × {f}。理论上两种规则的平均收入都是 {th} 元。',
    s3last: '本轮：竞拍者 {w} 估值最高（{hv}），第一价格收 {p1} 元，第二价格收 {p2} 元。',
    s3readout: '已拍 {k}/{cap} 轮。平均收入：第一价格 {a1} 元，第二价格 {a2} 元，理论都是 {th} 元。逐轮波动（标准差）：第一价格 {d1}（理论 {t1}），第二价格 {d2}（理论 {t2}）。',
    s3hint: '观察顺序：n 先留在 3，按「连拍 100 轮」：两条粗线开始时分得很开，随轮数增加一起靠向白色虚线；再看点：橙点比青点挤得更紧，因为第一价格每轮收入的标准差只有第二价格的 √((n − 1)/(2n)) 倍（总小于 0.71 倍）。换 n 会清空并重新抽一串估值（种子固定，可重现）。适用条件：估值独立同分布、竞拍者只看平均收益、按均衡出价；这是模拟数据，不是真实拍卖记录。',

    s4k: '第 4 步 · 公开喊价',
    s4t: '价格一点点往上喊或往下喊，最后停在哪？',
    s4e: '这一步要回答：拍卖行里常见的喊价拍卖，和前两步的信封拍卖有什么关系？<strong>英式拍卖</strong>（升价）：价钱从 0 往上涨，谁觉得不值了就退出，剩最后一人时成交，按当时的价付钱。每个人的合理做法是：价钱还低于自己估值就留下。<strong>荷式拍卖</strong>（降价）：价钱从 100 往下降，第一个喊「要」的人按当时价成交。等得越久越便宜，但可能被别人抢先，所以这和第一价格信封拍卖面对同一个取舍：每人打算在估值 × (n − 1)/n 处喊（这里 n = 5，即 0.8 倍）。下图每根柱是一个竞拍者的估值，白色横线是钟面上的当前价。',
    c4: '五个竞拍者的估值与钟面价格',
    c4eng: '英式升价：估值低于价格的人退出',
    c4dut: '荷式降价：粉杠是各人打算喊停的价',
    english: '英式 · 升价', dutch: '荷式 · 降价', play: '开始喊价', newValues: '换一组估值', clockP: '钟面价格（元）',
    lgIn: '还在场上', lgOut: '已退出', lgWinner: '成交者', lgClock: '当前价格', lgVal: '估值', lgPlan: '打算喊停的价',
    s4engEnd: '成交：只剩竞拍者 {w}（估值 {hv}），在价格 {p} 元时第二高的人退出，所以按 {p} 元成交。这正是第二价格信封拍卖的结果：付第二高的估值。',
    s4engRun: '当前价 {p} 元：{k}/{n} 人还在场上，{out} 人已退出。',
    s4dutEnd: '成交：竞拍者 {w}（估值 {hv}）最先喊停，按 {p} 元成交。这正是第一价格信封拍卖里他的均衡报价：估值 × 0.8。',
    s4dutRun: '当前价 {p} 元：还没人喊。粉杠最高的那位会在 {top} 元喊停。',
    s4hint: '观察顺序：先选「英式」，按「开始喊价」或自己拖钟面价格往上：柱子一根根变灰，最后剩一根时价格停在第二高的柱顶。再选「荷式」：价格从 100 往下，碰到最高的粉杠就成交。按「换一组估值」重试几次：英式成交价总等于第二高估值，荷式总等于最高估值的 0.8 倍。这里每人的行为是按上面的规则设定的，不是模拟出来的策略。',

    s5k: '第 5 步 · 赢家诅咒',
    s5t: '大家都估同一件东西的价值，为什么赢家常常亏钱？',
    s5e: '这一步要回答：如果拍品对每个人价值一样，只是谁都不确定值多少，按自己的估计去报价会怎样？这叫<strong>共同价值</strong>拍卖，例如一块油田的开采权：油量是多少，对每家公司都一样。这里真实价值 V = 50 元（竞拍者不知道），每人拿到一个估计 = V + 误差，误差在 −σ 到 +σ 之间均匀、彼此独立，平均来说没有偏差。规则是第一价格，每人都报「自己的估计 − 压价 s」。报价最高的，就是估计最高、也就是误差最大的那个人：赢下拍卖这件事本身，就在挑选最乐观的人。赢家付的价比真实价值高，就是<strong>赢家诅咒</strong>。上图是最近一场：灰点是各人的估计，橙点是赢家，空心橙圈是他实际付的价。下图累计每场赢家的利润 = V − 付的价。',
    c5: '一场共同价值拍卖与赢家利润分布',
    c5a: '第 {k} 场：点 = 各人估计，阴影 = 可能范围',
    c5a0: '还没开拍：按下方按钮',
    c5b: '赢家利润（元）：各格占全部场次的比例',
    s5lgEst: '各人的估计', s5lgWin: '赢家的估计 → 付的价（空心）', s5lgTrue: '真实价值 V = 50', s5lgHist: '赢家利润分布', s5lgTheory: '理论平均利润',
    sigma: '估计误差范围 ±σ（元）', shade: '每人的压价 s（元）', oneAuction: '拍 1 场', manyAuctions: '连拍 500 场', clearHist: '清空',
    s5empty: '理论平均利润 = s − σ(n − 1)/(n + 1) = {th} 元。要不亏，压价至少 {be} 元。',
    s5last: '最近一场：赢家估计 {we}，付 {pay}，利润 {u} 元。',
    s5readout: '已拍 {k} 场：赢家平均利润 {m} 元（理论 {th}），亏钱的场次占 {loss}。不亏所需的压价：至少 σ(n − 1)/(n + 1) = {be} 元。',
    s5hint: '观察顺序：先把压价留在 0，按「连拍 500 场」：每个人的估计平均没有偏差，赢家的利润却几乎都在零线左边。再把人数 n 调大：平均利润更低，因为人越多，最乐观的那个越离谱。最后把压价调到读数里的「不亏所需的压价」：分布的中心移到零线附近。改任何滑杆都会清空直方图（种子固定，可重现）。这是模拟：误差均匀、独立，所有人用同一个压价。',

    s6k: '第 6 步 · 收束', s6t: '规则决定你该说多少',
    s6fin: '回头看一遍。<strong>第 0 步</strong>：第一价格下，报价同时决定「赢不赢」和「付多少」。<strong>第 1 步</strong>：对手未知时这两件事要权衡，一个对手、报价 0–100 均匀时最优是压价到 v/2。<strong>第 2 步</strong>：第二价格把「付多少」交给对手，报真话成为占优策略。<strong>第 3 步</strong>：两种规则平均收入相同，第一价格每轮更稳。<strong>第 4 步</strong>：英式喊价相当于第二价格，荷式相当于第一价格。<strong>第 5 步</strong>：价值共同而不确定时，赢本身就是坏消息，要额外压价。',
    formula: '第一价格（1 个对手，0–100 均匀）：E = (v − b)·b/100，最优 b = v/2\n第二价格：报 b = v 对任何对手报价都不差\n收入等价：E[收入] = 100·(n − 1)/(n + 1)\n赢家诅咒：E[利润] = s − σ·(n − 1)/(n + 1)',
    boundary: '适用范围：单件物品；第 0–4 步每人的估值只自己知道、彼此独立（第 3 步还要求同分布于 0–100 均匀），竞拍者只看平均收益（不怕风险也不贪风险）。没有底价、预算上限、串通，也没有多轮反复的声誉考虑。第 4 步的喊价行为是按规则设定的，不是模拟出来的策略。第 5 步的误差均匀、独立，所有人用同一个压价；真实拍卖里人们会按对手人数调整压价。',
    linksTitle: '接着去哪',
    lk1: '→ 期望值，第 0 步：按概率加权相加，算出「平均能拿多少」',
    lk2: '→ 博弈论，第 2 步：纳什均衡，谁单独换招都不会更好',
    lk3: '→ 蒙特卡洛，第 1 步：模拟次数多起来，频率就逼近概率',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《拍卖 · 报价与真话》的平行版本。'
  },
  en: {
    pageTitle: 'Auctions · How Much Should You Bid?',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Auctions · Bidding and Telling the Truth →',
    navLabel: 'Auction steps',
    tagline: 'An old guitar is up for auction and it is worth 60 to you. Should you bid 60? Would bidding less pay off? It depends on one rule: what the winner pays. Over seven steps you will work out how far to shade a first-price bid, see why truth-telling is the safe bet in a second-price auction, find that different formats raise the same money on average, and meet the winner’s curse, where winning means losing.',
    nav0: '0 One bid', nav1: '1 Unknown rival', nav2: '2 Second price', nav3: '3 Seller’s take', nav4: '4 Open outcry', nav5: '5 Winner’s curse', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Rules first',
    s0t: 'If you could peek at the rival’s bid, what would you bid?',
    s0e: 'This step asks: when the winner pays their own bid, how does your bid decide what you gain? A few words first. Your <strong>value v</strong> is what the item is worth to you, the most you would pay; only you know it. Your <strong>bid b</strong> is the number you seal in an envelope. Two envelopes are opened, the higher bid wins, and a tie goes to the rival. In a <strong>first-price auction</strong> the winner pays their own bid b. So winning earns v − b, and losing earns 0 (no money spent, no item). The chart puts your bid b across and your payoff in yuan up the side. For now, pretend you have seen the rival’s bid r.',
    c0: 'Payoff (yuan) vs your bid b · first price',
    s0lgPay: 'payoff curve', s0lgR: 'rival’s bid r', s0lgV: 'your value v', s0lgYou: 'your current bid', s0lgBand: 'bids that make money',
    valueV: 'Your value v (yuan)', rivalR: 'Rival’s bid r (yuan)', bidB: 'Your bid b (yuan)',
    s0win: 'You bid {b} > rival’s {r}: you win, pay your own {b}, payoff v − b = {u}.',
    s0winLoss: 'You bid {b} > rival’s {r}: you win, but {b} is more than the item is worth to you, so you lose {u}.',
    s0lose: 'You bid {b} ≤ rival’s {r}: the rival wins (ties go to the rival), your payoff is 0.',
    s0best: 'Knowing r, the best move is a bid just above {r}, for a payoff close to v − r = {g}; bidding higher only means paying more.',
    s0bestNone: 'The rival’s {r} is already at or above your value {v}: every winning bid loses money, so the best choice is not to win.',
    s0hint: 'What to try: keep v at 60 and r at 35, then drag your bid from left to right. Left of r the payoff stays at 0 (you lose); the moment you pass r it jumps up, and every extra yuan you bid costs a yuan of payoff. Then drag r: the green band of money-making bids narrows. In real life you cannot see r, so the next step makes it unknown.',

    s1k: 'Step 1 · An unseen rival',
    s1t: 'Without seeing the rival’s bid, what bid pays best on average?',
    s1e: 'This step asks: what should you bid in a first-price auction when the rival’s bid is unknown? All you know is that it is spread <em>uniformly</em> between 0 and 100: any stretch of that range is as likely as any other stretch of the same length. So bidding b gives a <strong>win probability</strong> of b/100 (the share of rival bids below b), and a win earns v − b. Multiply the two and you get the <strong>expected payoff</strong>: the average payoff per auction if the same auction were run many times (<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ Expected value, step 0: weigh each outcome by its probability</a>). Here it is (v − b) · b / 100. Bid high and you win often but earn little; bid low and you earn a lot but rarely win. The result is a downward parabola with its peak at b = v/2. So you do not have to trust the formula alone, the top panel holds 4000 rival bids drawn uniformly, and each white dot below is the average payoff of one bid b against all 4000 of them. Deliberately bidding below your value is called <strong>bid shading</strong>.',
    c1: '4000 simulated rivals and the expected payoff curve',
    c1a: '4000 simulated rival bids: orange = you beat them',
    c1b: 'Expected payoff (yuan) vs bid b · v = {v}',
    s1lgBeat: 'rivals you beat', s1lgLose: 'rivals you lose to', s1lgCurve: 'formula (v − b)·b/100', s1lgDot: 'simulated average (each b you tried)', s1lgBest: 'best bid v/2',
    clearDots: 'Clear tried bids',
    s1readout: 'Bid {b}: won {w} of the simulated auctions (formula {wt}); each win earns v − b = {g}; average payoff per auction: simulated {e} · formula {et}. Best bid v/2 = {best}, expected payoff {bv}.',
    s1hint: 'What to try: keep v = 80 and slide the bid slowly from 100 down to 0. The orange dots thin out (you win less often), yet the white dots rise and then fall, peaking near b = 40. Change v (this clears the dots): the peak is always at half of v. Across every v and b on the sliders, the simulated average stays within 1 yuan of the formula. Assumptions: one rival, your belief about their bid is uniform on 0–100, and you care only about the average payoff.',

    s2k: 'Step 2 · A different payment rule',
    s2t: 'If the winner pays only the rival’s bid, can honesty ever hurt?',
    s2e: 'This step asks: in a <strong>second-price auction</strong> (also called a <strong>Vickrey auction</strong>) the highest bid still wins, but the winner pays the second-highest bid, which with two bidders is the rival’s bid r. Your bid now decides only whether you win, not what you pay. Since you do not know r, the chart puts every possible r across and your payoff up the side. The dashed white line is the payoff of bidding your true value, b = v; the cyan line is your current bid. They differ only inside the red region. A bid that never does worse than any other bid, whatever the rival bids, is called a <strong>dominant strategy</strong>.',
    c2: 'Payoff (yuan) vs rival’s bid r · second price',
    s2lgTruth: 'truthful bid b = v', s2lgYou: 'your bid b', s2lgGap: 'where the two outcomes differ', s2lgR: 'this rival bid r (hollow = truthful)',
    s2win: 'Rival bids {r}: you win, pay {r}, payoff {u};',
    s2lose: 'Rival bids {r}: you lose, payoff 0;',
    s2truthWin: 'a truthful bid would win {u}.',
    s2truthLose: 'a truthful bid would lose too, payoff 0.',
    s2all: 'Sweeping r from 0 to 100, your bid never earns more than the truthful bid; the best it does is +{g}.',
    s2same: 'You are bidding your true value.',
    s2under: 'The cost of underbidding: when the rival bids between {lo} and {hi}, you could have won below your value but lose instead, missing out on up to nearly {gap}; against a uniform rival you give up {el} on average.',
    s2over: 'The cost of overbidding: when the rival bids between {lo} and {hi}, you win but pay more than the item is worth to you, losing up to nearly {gap}; against a uniform rival you give up {el} on average.',
    s2hint: 'What to try: first drag only your bid away from v. Whether you go below or above, a red region appears, and the cyan line never rises above the dashed white one. Then drag the rival’s bid: the solid dot only drops below the hollow one inside the red region. Finally pick another v and repeat. Assumptions: a single item and you know your own value; the conclusion does not depend on how the rival bids.',
    quizPrompt: 'In a second-price auction your value is 60, but to “make sure” you win you bid 90. When does this leave you worse off than bidding 60?',
    quizA: 'Never: a higher bid only wins more often', quizB: 'When the rival bids between 60 and 90', quizC: 'When the rival bids below 60',
    check: 'Check',
    correct: 'Right. If the rival bids between 60 and 90, bidding 60 loses (payoff 0) while bidding 90 wins at a price above 60, a loss. Below 60 both bids give the same result; above 90 both lose.',
    wrong: 'Look at the chart: set v to 60 and your bid to 90. Over which stretch of r is the red region? There the cyan line sits below zero.',

    s3k: 'Step 3 · The seller’s side',
    s3t: 'Under which rule does the seller collect more on average?',
    s3e: 'This step asks: in a first-price auction everyone shades, in a second-price auction everyone bids the truth; what does the seller collect on average? Take n bidders whose values are drawn independently and uniformly from 0–100. In the first-price auction, if everyone bids v · (n − 1)/n, nobody can raise their own expected payoff by changing bid alone; a situation like that is called an <strong>equilibrium</strong> (with n = 2 this is the v/2 of step 1). In the second-price auction everyone bids the truth. The top panel is the latest round: grey bars are values, orange ticks are first-price bids, and the two dashed lines are what the seller collects under each rule. In the bottom panel every round leaves two dots (orange = first-price revenue, cyan = second-price revenue) and the thick lines are running averages. Theory says both averages are 100 · (n − 1)/(n + 1); this is called <strong>revenue equivalence</strong>.',
    c3: 'One auction round and the running average revenue',
    c3a: 'Round {k}: bars = values, ticks = first-price bids',
    c3a0: 'No rounds yet: use the buttons below',
    c3b: 'Revenue per round (dots), running average (lines)',
    s3lgVal: 'values (brighter = highest)', s3lgFirst: 'first price: bids and revenue', s3lgSecond: 'second price: revenue = 2nd-highest value', s3lgTheory: 'theory 100(n−1)/(n+1)',
    nBidders: 'Number of bidders n', oneRound: 'Run 1 round', hundredRounds: 'Run 100 rounds', clearRounds: 'Start over',
    s3empty: 'n = {n}: the first-price equilibrium bid is value × {f}. In theory both rules average {th}.',
    s3last: 'This round: bidder {w} has the highest value ({hv}); first price collects {p1}, second price collects {p2}.',
    s3readout: '{k}/{cap} rounds run. Average revenue: first price {a1}, second price {a2}, theory {th} for both. Round-to-round spread (standard deviation): first price {d1} (theory {t1}), second price {d2} (theory {t2}).',
    s3hint: 'What to try: leave n at 3 and press “Run 100 rounds”. The two thick lines start far apart and both drift toward the dashed white line as rounds pile up. Now look at the dots: the orange ones cluster tighter, because the first-price revenue has a standard deviation only √((n − 1)/(2n)) times the second-price one (always below 0.71×). Changing n clears the rounds and draws a fresh sequence of values (fixed seed, so it is reproducible). Assumptions: independent, identically distributed values, bidders care only about averages and play the equilibrium; these are simulated rounds, not real auction records.',

    s4k: 'Step 4 · Open outcry',
    s4t: 'When the price is called upward or downward, where does it stop?',
    s4e: 'This step asks: how do the open auctions you see in auction houses relate to the sealed envelopes of the last two steps? In an <strong>English auction</strong> the price rises from 0; anyone who no longer finds it worth the price drops out, and the last one standing buys at that price. The sensible plan is to stay in while the price is below your value. In a <strong>Dutch auction</strong> the price falls from 100 and the first to shout “mine” buys at the current price. Waiting makes it cheaper but risks being beaten, the same trade-off as a first-price envelope, so each bidder plans to shout at value × (n − 1)/n (here n = 5, so 0.8×). Each bar is one bidder’s value; the white line is the current price on the clock.',
    c4: 'Five bidders’ values and the clock price',
    c4eng: 'English, rising: bidders below the price drop out',
    c4dut: 'Dutch, falling: pink = where each plans to shout',
    english: 'English · rising', dutch: 'Dutch · falling', play: 'Run the clock', newValues: 'New values', clockP: 'Clock price (yuan)',
    lgIn: 'still in', lgOut: 'dropped out', lgWinner: 'buyer', lgClock: 'current price', lgVal: 'value', lgPlan: 'planned shout',
    s4engEnd: 'Sold: only bidder {w} (value {hv}) remains; the second-highest bidder dropped out at {p}, so the price is {p}. That is exactly the second-price envelope result: the winner pays the second-highest value.',
    s4engRun: 'Price {p}: {k}/{n} bidders still in, {out} dropped out.',
    s4dutEnd: 'Sold: bidder {w} (value {hv}) shouts first and pays {p}. That is exactly their first-price equilibrium bid: value × 0.8.',
    s4dutRun: 'Price {p}: nobody has shouted yet. The highest pink tick will shout at {top}.',
    s4hint: 'What to try: choose English and press “Run the clock”, or drag the price up yourself. Bars turn grey one by one, and with one bar left the price stops at the top of the second-highest bar. Then choose Dutch: the price falls from 100 and the sale happens at the highest pink tick. Press “New values” a few times: the English price always equals the second-highest value, the Dutch price always 0.8 × the highest value. Bidders here follow the stated plans; their behaviour is set by the rules above, not simulated.',

    s5k: 'Step 5 · The winner’s curse',
    s5t: 'If everyone is estimating the same value, why does the winner so often lose money?',
    s5e: 'This step asks: when the item is worth the same to everyone but nobody knows exactly how much, what happens if you bid on your estimate? This is a <strong>common-value</strong> auction, like drilling rights to an oil field: the oil in the ground is the same for every company. Here the true value is V = 50 (unknown to bidders), and each bidder sees an estimate = V + error, with errors uniform between −σ and +σ, independent of each other, and unbiased on average. The rule is first price and everyone bids “my estimate − shade s”. The highest bid comes from the highest estimate, which is the largest error: winning picks out the most optimistic bidder. When the winner pays more than the true value, that is the <strong>winner’s curse</strong>. The top panel is the latest auction: grey dots are estimates, the orange dot is the winner, the hollow orange ring is what they pay. The bottom panel collects every winner’s profit = V − price paid.',
    c5: 'A common-value auction and the distribution of the winner’s profit',
    c5a: 'Auction {k}: dots = estimates, band = possible range',
    c5a0: 'No auctions yet: use the buttons below',
    c5b: 'Winner’s profit (yuan): share of auctions per bin',
    s5lgEst: 'estimates', s5lgWin: 'winner’s estimate → price paid (hollow)', s5lgTrue: 'true value V = 50', s5lgHist: 'winner’s profit', s5lgTheory: 'theoretical mean profit',
    sigma: 'Estimate error range ±σ (yuan)', shade: 'Shade s used by everyone (yuan)', oneAuction: 'Run 1 auction', manyAuctions: 'Run 500 auctions', clearHist: 'Clear',
    s5empty: 'Theoretical mean profit = s − σ(n − 1)/(n + 1) = {th}. To break even, shade by at least {be}.',
    s5last: 'Latest auction: winner’s estimate {we}, paid {pay}, profit {u}.',
    s5readout: '{k} auctions run: the winner’s average profit is {m} (theory {th}); {loss} of auctions end in a loss. Shade needed to break even: at least σ(n − 1)/(n + 1) = {be}.',
    s5hint: 'What to try: keep the shade at 0 and press “Run 500 auctions”. Each estimate is unbiased on average, yet nearly all of the winner’s profits sit left of zero. Raise n: the average profit falls further, because with more bidders the most optimistic one is further off. Finally set the shade to the break-even value in the readout: the centre of the histogram moves to about zero. Moving any slider clears the histogram (fixed seed, so it is reproducible). This is a simulation: errors are uniform and independent, and everyone uses the same shade.',

    s6k: 'Step 6 · Wrap-up', s6t: 'The rule decides how much truth to tell',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: in a first-price auction your bid decides both whether you win and what you pay. <strong>Step 1</strong>: with an unknown rival those two pull against each other; with one rival bidding uniformly on 0–100 the best bid is shaded to v/2. <strong>Step 2</strong>: a second-price auction hands the price to the rival, and bidding the truth becomes a dominant strategy. <strong>Step 3</strong>: both rules raise the same revenue on average, and first price is steadier from round to round. <strong>Step 4</strong>: an English auction behaves like second price, a Dutch auction like first price. <strong>Step 5</strong>: when value is common and uncertain, winning is itself bad news, so shade extra.',
    formula: 'First price (one rival, uniform 0–100): E = (v − b)·b/100, best b = v/2\nSecond price: bidding b = v is never worse, whatever the rival bids\nRevenue equivalence: E[revenue] = 100·(n − 1)/(n + 1)\nWinner’s curse: E[profit] = s − σ·(n − 1)/(n + 1)',
    boundary: 'Scope: a single item. In steps 0–4 each value is private and independent (step 3 also needs them identically uniform on 0–100), and bidders care only about averages (neither fearing nor seeking risk). There are no reserve prices, budgets, collusion or reputations across repeated auctions. The open-outcry behaviour in step 4 is set by the stated plans, not simulated strategy. In step 5 errors are uniform and independent and everyone uses the same shade; real bidders would adjust their shade to the number of rivals.',
    linksTitle: 'Where to go next',
    lk1: '→ Expected value, step 0: weigh outcomes by probability to get the long-run average',
    lk2: '→ Game theory, step 2: Nash equilibrium, where nobody gains by switching alone',
    lk3: '→ Monte Carlo, step 1: with more trials, frequencies close in on probabilities',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Auctions · Bidding and Telling the Truth”.'
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
  const fb = document.getElementById('quizFeedback'); if (fb && fb.dataset.state) fb.textContent = t(fb.dataset.state);
  if (typeof window.refreshAuction === 'function') window.refreshAuction();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.AUCTION_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
