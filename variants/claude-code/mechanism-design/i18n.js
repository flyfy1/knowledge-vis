'use strict';
// Mechanism design lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '机制设计 · 让说真话成为最好的出价',
    back: '← 知识索引',
    compare: '对照另一版本：机制设计与拍卖 · 报价如何改变结果 →',
    navLabel: '机制设计步骤导航',
    tagline: '卖家手里有一件东西，它值多少钱只有买家自己心里清楚。卖家能不能定一条规则，让每个人老老实实报出心里价，自己还不吃亏？前四步你当竞拍者，摸清两种规则下怎样出价最划算；后两步你坐到卖家的位置上，看规则怎样决定收入。',
    nav0: '0 第一价', nav1: '1 看不见对手', nav2: '2 第二价', nav3: '3 后悔地图', nav4: '4 卖家收入', nav5: '5 保留价', nav6: '6 收束',
    valueSlider: '你的估值 v', rivalSlider: '对手报价 r', bidSlider: '你的报价 b', bidTruth: '照实报价（b = v）',
    lgCurve: '你的收益随报价 b 的变化（对手报价已知）', lgYou: '白点 = 你当前的报价和收益', lgValue: '橙色虚线 = 你的估值 v', lgRival: '粉色点线 = 对手报价 r',

    s0k: '第 0 步 · 第一价拍卖',
    s0t: '赢了付自己的报价：照实报价能得到什么？',
    s0e: '这一步要回答：如果赢家要付自己报出的价钱，按心里的价钱出价划算吗？设定：一件东西，两个竞拍者——你和一个对手；每人在信封里写一个报价，报得高的人得到东西，平局抛硬币决定。这种规则叫<strong>第一价拍卖</strong>。价钱都用 0～100 的整数表示（单位：元）。你心里认为它值 v，这叫你的<strong>私有估值</strong>：只有你知道，对手不知道。你的<strong>收益</strong> = 赢了时 v 减去付的钱，输了为 0（平局按一半机会算平均收益）。这一步先假设你偷看到了对手的报价 r，看收益怎样随你的报价 b 变化：图的横轴是你的报价 b，纵轴是你的收益。',
    c0: '第一价：收益 vs 你的报价 b（对手报价已知）',
    s0readout: '你报 {b}，对手报 {r}：{res} 照实报价（b = v）此时的收益是 {truth}。{best}',
    s0win: '你赢，付自己的 {pay}，收益 {u}。', s0tie: '平局，抛硬币，平均收益 {u}。', s0lose: '你输，不付钱，收益 0。',
    s0best: '已知 r 时最好的报价是 {bb}，收益 {u}——只比对手多一点点。',
    s0bestNone: '对手报价不低于你的估值，没有能带来正收益的报价，报得比 r 低、不赢最好。',
    s0hint: '观察顺序：先按「照实报价」，白点落在零线上——赢了也只是把 v 原数付出去，白忙一场。再保持 v、r 不动，拖报价 b：b 刚超过 r 时收益最高，此后每多报 1 元就少赚 1 元。最后拖 r，最好的报价跟着 r 走。可真实拍卖里你看不到 r，下一步就拿掉这个前提。',

    s1k: '第 1 步 · 看不见对手',
    s1t: '看不见对手的报价时，第一价拍卖该打几折出价？',
    s1e: '这一步要回答：在第一价拍卖（赢家付自己的报价）里，不知道对手报多少时，报多少最划算？我们用一条规则描述对手——这是本步的<strong>模型假设</strong>，不是事实：对手的估值在 0～100 之间<strong>均匀随机</strong>（每个值机会相同），对手报出估值的 β 倍（β 叫<strong>压价比例</strong>，β = 0.5 就是报一半）。于是对手报价落在 0 到 100β 之间，你报 b 时赢的概率是 min(1, b / (100β))。<strong>期望收益</strong>（同样情形重复很多次，平均每次拿到的收益）= 赢的概率 × (v − b)：报得高赢得多但每次赚得少，报得低每次赚得多但赢得少。在 b ≤ 100β 的范围内它等于 b(v − b)/(100β)，在 b = v/2 处最大，跟 β 无关。上图横轴是你的报价 b、纵轴是期望收益（按公式算）；下图把 400 个模拟对手按各自的报价摆在横轴上（纵向只是为了错开），绿点是你这次能赢下的对手。',
    shadeSlider: '对手压价比例 β', sim400: '模拟 400 场拍卖', jumpBest: '跳到最优报价',
    lgEU: '期望收益曲线（公式）', lgBest: '绿点 = 期望收益最高的报价', lgBeat: '你赢下的模拟对手', lgLost: '你输给的模拟对手', lgTop: '粉色点线 = 对手的最高可能报价 100β',
    c1a: '期望收益 vs 你的报价 b（公式）', c1b: '400 个模拟对手的报价（绿 = 你赢）',
    s1progress: '已模拟 {c}/{N} 场。',
    s1readout: '报 {b}：赢的概率 {p}%，期望收益 {eu}；模拟中赢了 {won}/{n} 场，平均每场收益 {mean}。最优报价 {bb}（期望收益 {beu}）= v/2（{half}）和对手最高报价 100β（{top}）中较小的那个。',
    s1hint: '观察顺序：先按「模拟 400 场拍卖」，看绿点一个个累积，读数里的模拟平均收益向公式值靠拢；再按「跳到最优报价」。接着只拖 β：只要 100β 还高于 v/2，最优报价就停在 v/2 不动。β = 0.5 时，对手报一半，你的最优也是报一半——两边都没有理由单独改变，这叫<strong>均衡</strong>（<a class="xlink" href="../../../math/applied/game-theory/#step2">→ 博弈论页第 2 步：纳什均衡，任何一方单独换招都不会更好</a>）。注意这个「报一半」完全依赖上面的对手假设。',

    s2k: '第 2 步 · 第二价拍卖',
    s2t: '赢了只付对手的报价：多报或少报能占到便宜吗？',
    s2e: '这一步要回答：如果赢家付的是<strong>对手</strong>的报价，还有没有理由不照实报？仍然是两人在信封里报价、报得高的得到东西，只是付款改成对手的报价 r。这种规则叫<strong>第二价拍卖</strong>（也叫维克里拍卖）。关键的变化是：你的报价 b 只决定<strong>赢不赢</strong>，不决定<strong>付多少</strong>。上图和第 0 步一样，是对手报价 r 已知时你的收益随 b 的变化：赢下来以后收益是一条平线 v − r。下图换个角度：固定你的报价 b，让对手的报价 r 从 0 扫到 100，青色实线是你的收益，白色虚线是照实报价（b = v）的收益；粉色区域是两条线不一样的那段 r。',
    lgYourLine: '下图青线 = 你的报价下的收益', lgTruthLine: '白色虚线 = 照实报价（b = v）下的收益', lgZone: '粉色区 = 你和照实报价结果不同的 r',
    c2a: '第二价：收益 vs 你的报价 b（对手报价已知）', c2b: '固定你的报价：收益 vs 对手报价 r',
    s2readout: '你报 {b}，对手报 {r}：{res} 照实报价此时的收益是 {ut}。{zone}',
    s2win: '你赢，付对手的 {pay}，收益 {u}。', s2tie: '平局，抛硬币，平均收益 {u}。', s2lose: '你输，收益 0。',
    s2zoneTruth: '你正在照实报价：不管 r 是多少，结果都和白色虚线一样。',
    s2zoneOver: '你多报了。只有 r 落在 {lo} 到 {hi} 之间时结果才和照实报价不同：那时你赢了，却要付超过估值的 r，收益为负。其余的 r，结果一模一样。',
    s2zoneUnder: '你少报了。只有 r 落在 {lo} 到 {hi} 之间时结果才和照实报价不同：那时你输掉了一场本来能赚 v − r 的拍卖。其余的 r，结果一模一样。',
    s2hint: '观察顺序：先看默认情形（估值 70，对手报 80，你报 90）：白点在零线以下，多报让你花 80 元买下只值 70 元的东西。再按「照实报价」，粉色区消失，下图青线和白色虚线重合。然后随意拖 r 和 b：下图里青线从来没有高过白色虚线——照实报价对任何 r 都不吃亏。',
    quizPrompt: '第二价拍卖里你的估值是 70，你报了 50。对手报多少时，你会后悔没照实报？',
    quizA: '对手报 30', quizB: '对手报 85', quizC: '对手报 60',
    check: '核对', pickOne: '先选一个选项。',
    correct: '对。对手报 60 时你输了；如果照实报 70，你会赢并付 60，收益 10。对手报 30 时两种报法都赢、都付 30；对手报 85 时两种报法都输。',
    wrong: '再想想：你的报价 50 只有在对手报价落在 50～70 之间时才改变结果。',

    s3k: '第 3 步 · 后悔地图',
    s3t: '有没有一个报价，不管对手怎么出都不会后悔？',
    s3e: '这一步要回答：把两种规则摆在一起，哪一种里存在「闭着眼报也不会错」的报价？<strong>后悔值</strong> = 知道对手报价 r 以后，最好的报价能拿到的收益，减去你实际报价拿到的收益（单位同估值；0 表示一点不后悔）。左图（窄屏时在上方）是一张地图：横轴是对手报价 r，纵轴是你的报价 b，每一格的颜色是这一对 (b, r) 的后悔值，越暗越接近 0。白框是你选的那一行，空心圈是这一行里后悔最大的格子；青色虚线是照实报价的那一行 b = v。右图（窄屏时在下方）把每一行的<strong>最大后悔</strong>（这个报价在所有 r 中最坏的情形）画成一条曲线。如果某一行全暗、最大后悔为 0，这个报价就叫<strong>占优策略</strong>：不管对手怎么出，它都不比别的报价差（<a class="xlink" href="../../../math/applied/prisoners-dilemma/#step0">→ 囚徒困境页第 0 步：无论对方怎么出，背叛都更划算，是同一种「占优」</a>）。',
    ruleFirst: '第一价（付自己的报价）', ruleSecond: '第二价（付对手的报价）',
    lgHeat: '后悔值：暗 = 0，亮 = 大', lgRow: '白框 = 你选的报价那一行', lgTruthRow: '青色虚线 = 照实报价 b = v', lgWorstAt: '空心圈 = 这一行最坏的 r', lgWorst: '橙线 = 每个报价的最大后悔', lgSafest: '绿点 = 最大后悔最小的报价',
    c3a: '后悔值（横轴对手 r，纵轴你的 b）', c3b: '最大后悔 vs 你的报价 b',
    s3readout: '{rule}，估值 {v}：报 {b} 时最大后悔 {w}（出现在对手报 {at} 时）。最大后悔最小的报价是 {safe}，它的最大后悔是 {sw}。',
    s3hint: '观察顺序：先选「第二价」，青色虚线那一行全暗，最大后悔曲线在 b = v 处落到 0——照实报价是占优策略。再切到「第一价」，地图里找不到一整行是暗的：曲线最低点在 v/2 附近，最大后悔也只比 v/2 略小；照实报价那一行反而接近 v。拖估值 v，两种规则的这一结论都不变。（本步只考虑整数报价，平局抛硬币。）',

    s4k: '第 4 步 · 卖家收入',
    s4t: '换一种规则，卖家平均能多收钱吗？',
    s4e: '这一步要回答：站到卖家这边，第一价和第二价哪个收入更高？现在有 n 个竞拍者，每人的估值都在 0～100 之间均匀随机、彼此独立（模拟设定）。出价按前面的结论设定：第二价拍卖里人人照实报价，卖家收到<strong>第二高的估值</strong>；第一价拍卖里人人报估值的 (n − 1)/n 倍（两人时就是第 1 步的「报一半」；n 人时这是同样假设下的对称均衡，本页直接采用、不另推导），卖家收到最高估值的 (n − 1)/n 倍。按下按钮模拟 1000 场拍卖。上图横轴是已模拟的场数，纵轴是到目前为止的<strong>平均收入</strong>；下图是单场收入的分布：每 5 元一格，柱高是落进这一格的场数占比。',
    lgFirst: '第一价', lgSecond: '第二价', lgTheory: '白色虚线 = 理论平均收入 100(n − 1)/(n + 1)',
    nSlider: '竞拍人数 n', run1000: '模拟 1000 场', newBatch: '换一批随机估值（共 5 批）',
    c4a: '平均收入随场数累积', c4b: '单场收入的分布（每格 5 元）',
    s4progress: '已模拟 {c}/{N} 场。',
    s4readout: '第 {set} 批，n = {n}，前 {k} 场：第一价平均收入 {mf}，第二价平均收入 {ms}，理论值都是 {th}（第一价出价是估值的 {sh}%）。单场收入的标准差（越小越稳）：第一价 {df}（理论 {tdf}），第二价 {ds}（理论 {tds}）。',
    s4hint: '观察顺序：按「模拟 1000 场」，两条平均线开头乱跳，越往后越贴近白色虚线；下图橙色分布更窄、更集中，青色分布更散。再拖 n：竞拍人越多，两种规则的收入一起上涨，依旧相等。这叫收入等价：估值独立同分布、大家风险中性（只看平均收益）、都按均衡出价时，两种规则的期望收入相同；任何一条前提不成立，结论都可能改变。',

    s5k: '第 5 步 · 保留价',
    s5t: '卖家定一个底价，能多收多少？要付出什么代价？',
    s5e: '这一步要回答：卖家能不能改规则，收得比第 4 步更多？办法之一是<strong>保留价</strong> R：最高报价低于 R 就流拍（不卖），否则赢家付「第二高报价和 R 中较大的那个」。这仍是第二价规则，照实报价依然是占优策略，所以下面按人人照实报价计算；估值仍是 0～100 均匀随机，卖家自己对东西的估值设为 0。上图横轴是保留价 R：橙线是卖家的<strong>期望收入</strong>；绿线是<strong>期望总价值</strong>——东西最后落到的那个人的估值，流拍算 0，衡量东西有没有到最看重它的人手里；粉色阴影是比 R = 0 时少掉的总价值。下图是<strong>流拍概率</strong>。',
    reserveSlider: '保留价 R', jumpBestR: '跳到收入最高的 R',
    lgRevenue: '期望收入（卖家）', lgWelfare: '期望总价值（得主的估值，流拍为 0）', lgLostWelfare: '粉色阴影 = 比 R = 0 少掉的总价值', lgNoSale: '流拍概率', lgBestR: '橙色点线 = 收入最高的 R',
    c5a: '期望收入与总价值 vs 保留价 R', c5b: '流拍概率 vs 保留价 R',
    s5readout: 'R = {R}，n = {n}：期望收入 {rev}（R = 0 时 {rev0}），期望总价值 {wel}（R = 0 时 {wel0}），流拍概率 {ns}%。收入最高的保留价是 R = {bR}，收入 {bRev}，比不设底价多 {gain}。',
    s5hint: '观察顺序：从 R = 0 往右拖，橙线先升后降、在 R = 50 处最高；同时绿线一路下降、粉色阴影变大，下图流拍概率上升。再拖 n：最优保留价始终是 50，但竞拍人越多，底价能多收的钱越少。卖家多收的钱，是靠让一部分本该成交的买卖流拍换来的——收入和总价值在这里方向相反。「最优底价 = 估值上限的一半」只适用于均匀分布，换一种估值分布，最优底价就不同。',

    s6k: '第 6 步 · 收束',
    s6t: '规则决定激励：把说真话变成最好的选择',
    s6fin: '回顾一下。<strong>第 0 步</strong>：第一价拍卖里照实报价的收益恒为 0，最好的报价取决于你看不到的对手报价。<strong>第 1 步</strong>：对手看不见时，在均匀估值的假设下最好报估值的一半，双方都这样报就是均衡。<strong>第 2 步</strong>：第二价拍卖里报价只决定赢不赢、不决定付多少，多报、少报都只在某一段 r 上吃亏。<strong>第 3 步</strong>：后悔地图里第二价有一整行零后悔——照实报价是占优策略；第一价没有。<strong>第 4 步</strong>：在标准假设下两种规则平均收入相等，第一价更稳。<strong>第 5 步</strong>：保留价能让卖家多收钱，代价是有时该卖的没卖出去。这就是<strong>机制设计</strong>：先想好希望参与者怎样行动，再反过来设计规则，让那样行动恰好符合他们自己的利益。',
    formula: '第一价收益：赢时 u = v − b\n第二价收益：赢时 u = v − r\n两人、均匀估值时第一价最优：b* = v/2\nn 人的期望收入（两种规则相同）：100(n − 1)/(n + 1)',
    boundary: '适用范围：单件物品；估值独立、私有（不受别人估值影响）；竞拍者风险中性、不串通、没有预算限制；第 1、4、5 步还假设估值在 0～100 均匀分布。如果东西的真实价值大家都拿不准（共同价值，比如一块油田的储量），会出现「赢家的诅咒」，本页结论不能直接套用。真实拍卖（广告竞价、频谱拍卖）的规则复杂得多，一次卖多件东西或有预算限制时，第二价规则「说真话最好」的性质往往不再成立。',
    linksTitle: '接着去哪儿',
    lk1: '→ 博弈论 第 2 步：纳什均衡——第 1 步里「双方都报一半」就是一个例子',
    lk2: '→ 囚徒困境 第 0 步：另一个占优策略，后果却是两败俱伤',
    lk3: '→ 拍卖入门 第 3 步：英式拍卖叫价一路升高，最后的价格为什么接近第二高估值',
    lk4: '→ 期望值 第 2 步：只玩几次很乱，玩很多次为什么贴近期望',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《机制设计与拍卖 · 报价如何改变结果》的平行版本。'
  },
  en: {
    pageTitle: 'Mechanism Design · Making the Truth Your Best Bid',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Mechanism Design & Auctions · How Bids Change Outcomes →',
    navLabel: 'Mechanism design steps',
    tagline: 'A seller has one item, and only the buyers know what it is worth to them. Can the seller write a rule that makes everyone report their true value without losing money? In the first four steps you are a bidder, working out the best bid under two rules; in the last two you sit in the seller’s chair and see how the rule decides the revenue.',
    nav0: '0 First price', nav1: '1 Bidding blind', nav2: '2 Second price', nav3: '3 Regret map', nav4: '4 Revenue', nav5: '5 Reserve price', nav6: '6 Wrap-up',
    valueSlider: 'Your value v', rivalSlider: 'Rival’s bid r', bidSlider: 'Your bid b', bidTruth: 'Bid your value (b = v)',
    lgCurve: 'Your payoff as a function of your bid b (rival’s bid known)', lgYou: 'White dot = your current bid and payoff', lgValue: 'Orange dashes = your value v', lgRival: 'Pink dots = rival’s bid r',

    s0k: 'Step 0 · First-price auction',
    s0t: 'If the winner pays their own bid, what does bidding your value get you?',
    s0e: 'The question here: when the winner pays whatever they bid, is it smart to bid what the item is really worth to you? The setting: one item, two bidders — you and a rival. Each of you writes one bid in a sealed envelope, the higher bid wins, and a tie is settled by a coin toss. This rule is a <strong>first-price auction</strong>. Prices are whole numbers from 0 to 100 (say, dollars). The item is worth v to you; that is your <strong>private value</strong> — you know it, your rival does not. Your <strong>payoff</strong> is v minus what you pay if you win, and 0 if you lose (a tie counts as a half chance). For now, pretend you have peeked at the rival’s bid r and watch how your payoff depends on your bid b: the horizontal axis is your bid b, the vertical axis your payoff.',
    c0: 'First price: payoff vs your bid b (rival’s bid known)',
    s0readout: 'You bid {b}, the rival bids {r}: {res} Bidding your value (b = v) would pay {truth} here. {best}',
    s0win: 'you win and pay your own {pay}, so your payoff is {u}.', s0tie: 'a tie, settled by a coin toss: average payoff {u}.', s0lose: 'you lose and pay nothing: payoff 0.',
    s0best: 'Knowing r, the best bid is {bb}, for a payoff of {u} — just a hair above the rival.',
    s0bestNone: 'The rival bid at least your value, so no bid earns anything; the best you can do is bid below r and lose.',
    s0hint: 'What to try: press “Bid your value” first — the white dot sits on the zero line, because winning just hands the full v back to the seller. Then keep v and r fixed and drag your bid b: the payoff peaks just above r and falls one dollar for every extra dollar you bid. Finally drag r and watch the best bid follow it. In a real auction you cannot see r, so the next step takes that peek away.',

    s1k: 'Step 1 · Bidding blind',
    s1t: 'When you cannot see the rival’s bid, how far below your value should you bid?',
    s1e: 'The question here: in a first-price auction (the winner pays their own bid), what bid is best when you do not know the rival’s? We describe the rival by a rule — a <strong>modelling assumption</strong> for this step, not a fact: the rival’s value is <strong>uniformly random</strong> between 0 and 100 (every value equally likely), and the rival bids β times that value (β is the <strong>shading factor</strong>; β = 0.5 means bidding half). So the rival’s bid lies between 0 and 100β, and your chance of winning with bid b is min(1, b / (100β)). Your <strong>expected payoff</strong> — the average payoff per auction if the same situation were repeated many times — is the chance of winning × (v − b). Bid high and you win more often but keep less each time; bid low and you keep more but rarely win. While b ≤ 100β this equals b(v − b)/(100β), which peaks at b = v/2 whatever β is. The top chart plots expected payoff (from the formula) against your bid b; the bottom chart places 400 simulated rivals along the axis at their bids (spread vertically only so they do not overlap), green where your bid beats them.',
    shadeSlider: 'Rival’s shading factor β', sim400: 'Simulate 400 auctions', jumpBest: 'Jump to the best bid',
    lgEU: 'Expected payoff (formula)', lgBest: 'Green dot = the bid with the highest expected payoff', lgBeat: 'Simulated rivals you beat', lgLost: 'Simulated rivals who beat you', lgTop: 'Pink dots = the rival’s highest possible bid, 100β',
    c1a: 'Expected payoff vs your bid b (formula)', c1b: '400 simulated rivals’ bids (green = you win)',
    s1progress: 'Simulated {c}/{N} auctions. ',
    s1readout: 'Bid {b}: {p}% chance of winning, expected payoff {eu}; in the simulation you won {won}/{n} auctions, averaging {mean} per auction. Best bid {bb} (expected payoff {beu}) = the smaller of v/2 ({half}) and the rival’s top bid 100β ({top}).',
    s1hint: 'What to try: press “Simulate 400 auctions” and watch the green dots pile up while the simulated average payoff in the readout closes in on the formula; then press “Jump to the best bid”. Now drag only β: as long as 100β stays above v/2, the best bid sits at v/2 and does not move. At β = 0.5 the rival bids half and your best reply is also to bid half — neither side gains by changing alone, which is an <strong>equilibrium</strong> (<a class="xlink" href="../../../math/applied/game-theory/#step2">→ Game theory, step 2: a Nash equilibrium, where no one gains by switching alone</a>). Bear in mind that “bid half” rests entirely on the assumption about the rival above.',

    s2k: 'Step 2 · Second-price auction',
    s2t: 'If the winner pays the rival’s bid, can overbidding or underbidding ever help?',
    s2e: 'The question here: if the winner pays the <strong>rival’s</strong> bid, is there any reason left not to bid your value? Still two sealed bids and the higher one wins, but now the winner pays the rival’s bid r. This rule is a <strong>second-price auction</strong> (also called a Vickrey auction). The crucial change: your bid b decides only <strong>whether</strong> you win, not <strong>what</strong> you pay. The top chart is the same view as step 0 — your payoff against your bid b with r known; once you win, the payoff is flat at v − r. The bottom chart turns things around: fix your bid b and sweep the rival’s bid r from 0 to 100. The solid cyan line is your payoff; the white dashed line is the payoff from bidding your value (b = v); the pink band marks the values of r where the two differ.',
    lgYourLine: 'Bottom chart, cyan = payoff with your bid', lgTruthLine: 'White dashes = payoff from bidding your value (b = v)', lgZone: 'Pink band = rival bids where you and the truthful bid part ways',
    c2a: 'Second price: payoff vs your bid b (rival’s bid known)', c2b: 'Your bid held fixed: payoff vs rival’s bid r',
    s2readout: 'You bid {b}, the rival bids {r}: {res} Bidding your value would pay {ut} here. {zone}',
    s2win: 'you win and pay the rival’s {pay}, so your payoff is {u}.', s2tie: 'a tie, settled by a coin toss: average payoff {u}.', s2lose: 'you lose: payoff 0.',
    s2zoneTruth: 'You are bidding your value: whatever r is, you get exactly the white dashed line.',
    s2zoneOver: 'You overbid. Only when r falls between {lo} and {hi} does anything change: then you win but pay an r above your value, so your payoff is negative. For every other r the result is identical.',
    s2zoneUnder: 'You underbid. Only when r falls between {lo} and {hi} does anything change: then you lose an auction that would have earned you v − r. For every other r the result is identical.',
    s2hint: 'What to try: start from the defaults (value 70, rival 80, you 90): the white dot is below zero — overbidding just bought a 70-dollar item for 80. Press “Bid your value”: the pink band vanishes and the cyan line lands on the white dashes. Then drag r and b freely: in the bottom chart the cyan line never rises above the white dashes — bidding your value never does worse, whatever r is.',
    quizPrompt: 'In a second-price auction your value is 70 and you bid 50. For which rival bid will you wish you had bid 70?',
    quizA: 'The rival bids 30', quizB: 'The rival bids 85', quizC: 'The rival bids 60',
    check: 'Check', pickOne: 'Pick an option first.',
    correct: 'Right. Against 60 you lose; bidding 70 would have won and paid 60, a payoff of 10. Against 30 both bids win and pay 30; against 85 both lose.',
    wrong: 'Think again: a bid of 50 changes the result only when the rival’s bid falls between 50 and 70.',

    s3k: 'Step 3 · Regret map',
    s3t: 'Is there a bid you will never regret, whatever the rival does?',
    s3e: 'The question here: putting the two rules side by side, which one has a bid you could place with your eyes closed? <strong>Regret</strong> = the payoff of the best bid once you know the rival’s bid r, minus the payoff your actual bid got (same units as the value; 0 means no regret at all). The left chart (on top on narrow screens) is a map: the rival’s bid r runs across, your bid b runs up, and each cell is coloured by the regret of that pair (b, r) — the darker, the closer to 0. The white frame is the row you picked, the hollow ring its worst cell, and the cyan dashes the truthful row b = v. The right chart (below on narrow screens) plots each row’s <strong>worst regret</strong> (that bid’s regret in its worst case over all r). If some row is dark all the way across, with worst regret 0, that bid is a <strong>dominant strategy</strong>: whatever the rival does, it is never worse than any other bid (<a class="xlink" href="../../../math/applied/prisoners-dilemma/#step0">→ Prisoner’s dilemma, step 0: defecting pays whatever the other player does — the same kind of dominance</a>).',
    ruleFirst: 'First price (pay your own bid)', ruleSecond: 'Second price (pay the rival’s bid)',
    lgHeat: 'Regret: dark = 0, bright = large', lgRow: 'White frame = the row of your bid', lgTruthRow: 'Cyan dashes = the truthful row b = v', lgWorstAt: 'Ring = the worst r for that row', lgWorst: 'Orange = worst regret of each bid', lgSafest: 'Green dots = bids with the smallest worst regret',
    c3a: 'Regret (rival’s r across, your b up)', c3b: 'Worst regret vs your bid b',
    s3readout: '{rule}, value {v}: bidding {b} has a worst regret of {w} (when the rival bids {at}). The bid with the smallest worst regret is {safe}, at {sw}.',
    s3hint: 'What to try: pick “Second price” first — the row on the cyan dashes is dark end to end, and the worst-regret curve drops to 0 at b = v: bidding your value is a dominant strategy. Switch to “First price” — no row is dark all the way across; the curve bottoms out near v/2, with a worst regret still just under v/2, while the truthful row climbs to nearly v. Drag the value v: neither conclusion changes. (Whole-number bids only; ties go to a coin toss.)',

    s4k: 'Step 4 · Revenue',
    s4t: 'Does either rule earn the seller more on average?',
    s4e: 'The question here: from the seller’s side, which rule brings in more money, first price or second price? Now there are n bidders, each with a value drawn uniformly and independently between 0 and 100 (a simulation setting). Bids follow the earlier steps: in a second-price auction everyone bids their value, so the seller collects the <strong>second-highest value</strong>; in a first-price auction everyone bids (n − 1)/n of their value (with two bidders that is step 1’s “bid half”; for n bidders it is the symmetric equilibrium under the same assumptions, used here without derivation), so the seller collects (n − 1)/n of the highest value. The button simulates 1000 auctions. The top chart shows the <strong>average revenue</strong> so far against the number of auctions; the bottom chart shows how single-auction revenue is spread: bins of 5 dollars, bar height = share of auctions landing in that bin.',
    lgFirst: 'First price', lgSecond: 'Second price', lgTheory: 'White dashes = expected revenue in theory, 100(n − 1)/(n + 1)',
    nSlider: 'Number of bidders n', run1000: 'Simulate 1000 auctions', newBatch: 'Draw a new batch of values (5 batches)',
    c4a: 'Running average revenue', c4b: 'Revenue per auction (bins of 5)',
    s4progress: 'Simulated {c}/{N} auctions. ',
    s4readout: 'Batch {set}, n = {n}, first {k} auctions: first price averages {mf}, second price {ms}; theory says {th} for both (first-price bids are {sh}% of value). Spread of single-auction revenue (standard deviation, smaller = steadier): first price {df} (theory {tdf}), second price {ds} (theory {tds}).',
    s4hint: 'What to try: press “Simulate 1000 auctions”: both running averages jump about early on and settle onto the white dashes; below, the orange distribution is narrower and more concentrated, the cyan one more spread out. Then drag n: more bidders lift both revenues together, and they stay equal. This is revenue equivalence: with independent, identically distributed values, risk-neutral bidders (who care only about average payoff) and equilibrium bidding, the two rules earn the same on average. Break any one of those conditions and the conclusion can change.',

    s5k: 'Step 5 · Reserve price',
    s5t: 'If the seller sets a floor price, how much more comes in — and at what cost?',
    s5e: 'The question here: can the seller change the rules to earn more than in step 4? One way is a <strong>reserve price</strong> R: if the highest bid is below R, the item goes unsold; otherwise the winner pays the larger of the second-highest bid and R. It is still a second-price rule, so bidding your value is still dominant, and everything below assumes truthful bids; values are again uniform on 0–100, and the item is worth 0 to the seller. In the top chart, R runs across: the orange line is the seller’s <strong>expected revenue</strong>; the green line is the <strong>expected total value</strong> — the value of whoever ends up with the item, 0 if it goes unsold, a measure of whether the item reaches the person who values it most; the pink shading is the total value lost compared with R = 0. The bottom chart shows the <strong>chance of no sale</strong>.',
    reserveSlider: 'Reserve price R', jumpBestR: 'Jump to the revenue-maximising R',
    lgRevenue: 'Expected revenue (seller)', lgWelfare: 'Expected total value (the winner’s value, 0 if unsold)', lgLostWelfare: 'Pink shading = total value lost vs R = 0', lgNoSale: 'Chance of no sale', lgBestR: 'Orange dots = revenue-maximising R',
    c5a: 'Revenue and total value vs reserve R', c5b: 'Chance of no sale vs reserve R',
    s5readout: 'R = {R}, n = {n}: expected revenue {rev} ({rev0} at R = 0), expected total value {wel} ({wel0} at R = 0), chance of no sale {ns}%. The revenue-maximising reserve is R = {bR}, earning {bRev}, which is {gain} more than no reserve.',
    s5hint: 'What to try: drag R up from 0: the orange line rises, peaks at R = 50, then falls; meanwhile the green line keeps dropping, the pink shading grows, and the chance of no sale climbs. Then drag n: the best reserve stays at 50, but the more bidders there are, the less a reserve adds. The seller’s extra money is paid for by sales that should have happened and did not — here revenue and total value pull in opposite directions. “Best reserve = half the top value” holds only for uniform values; a different value distribution gives a different best reserve.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Rules shape incentives: make telling the truth the best move',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: in a first-price auction, bidding your value always pays 0, and the best bid depends on a rival bid you cannot see. <strong>Step 1</strong>: bidding blind, with uniformly distributed values, the best bid is half your value, and both sides bidding half is an equilibrium. <strong>Step 2</strong>: in a second-price auction your bid decides only whether you win, not what you pay; overbidding and underbidding each hurt only over one band of rival bids. <strong>Step 3</strong>: the regret map shows a whole row of zero regret under second price — bidding your value is dominant — and none under first price. <strong>Step 4</strong>: under the standard assumptions both rules earn the same on average, with first price steadier. <strong>Step 5</strong>: a reserve price earns the seller more, at the cost of sometimes not selling at all. That is <strong>mechanism design</strong>: decide how you want participants to behave, then work backwards to a rule under which behaving that way is in their own interest.',
    formula: 'First price, if you win: u = v − b\nSecond price, if you win: u = v − r\nTwo bidders, uniform values, first price: b* = v/2\nExpected revenue with n bidders (both rules): 100(n − 1)/(n + 1)',
    boundary: 'Scope: one item; independent private values (your value does not depend on anyone else’s); bidders are risk-neutral, do not collude and have no budget limits; steps 1, 4 and 5 also assume values uniform on 0–100. When nobody is sure what the item is really worth (common values, such as the oil under a plot of land), the winner’s curse appears and these results do not carry over directly. Real auctions — ad auctions, spectrum auctions — use far more complicated rules, and with several items or budget limits the second-price “truth is best” property often no longer holds.',
    linksTitle: 'Where to go next',
    lk1: '→ Game theory, step 2: Nash equilibrium — step 1’s “both bid half” is one example',
    lk2: '→ Prisoner’s dilemma, step 0: another dominant strategy, this time leaving both players worse off',
    lk3: '→ Auction basics, step 3: an English auction’s rising calls, and why the final price lands near the second-highest value',
    lk4: '→ Expected value, step 2: why a few plays are noisy and many plays settle near the expectation',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Mechanism Design & Auctions · How Bids Change Outcomes”.'
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
  if (typeof window.refreshMechanism === 'function') window.refreshMechanism();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MECH_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
