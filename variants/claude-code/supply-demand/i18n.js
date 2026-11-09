'use strict';
// Supply & demand lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '供需与市场均衡 · 一条价格线的来回',
    back: '← 知识索引',
    compare: '对照另一版本：供需与市场均衡 · 价格线如何相交 →',
    navLabel: '供需步骤导航',
    tagline: '一座小城的外带咖啡市场（数字是虚构的）：买家看价格决定买多少，卖家看价格决定卖多少。七步里，你先用一条水平的价格线找到两边刚好对上的那个价，再看它怎样被收入、成本、税和补贴推开，最后把「谁得到了什么、谁白白损失了什么」算成面积。',
    nav0: '0 价格线', nav1: '1 走向交点', nav2: '2 曲线移动', nav3: '3 弹性', nav4: '4 税的楔子', nav5: '5 剩余与损失', nav6: '6 收束',
    axP: '价格 P（元/杯）', axQ: '数量 Q（百杯/天）',
    axRound: '轮次', axPrice: '价格（元/杯）', axEps: '需求弹性的大小 |εd|', axPct: '变化（%）', axShare: '买家承担的份额', axT: '每杯税 t（元，负数为补贴）', axDWL: '无谓损失（百元/天）',
    tagD: '需求 D', tagS: '供给 S',

    s0k: '第 0 步 · 两条曲线和一条价格线',
    s0t: '价格定在某一个数时，买家想买的和卖家想卖的一样多吗？',
    s0e: '这一步要回答：给定一个价格，买家想买多少、卖家想卖多少？两者在什么价格刚好相等？横轴是每天的杯数（单位：百杯），纵轴是每杯价格（元）。青色的<strong>需求曲线</strong> D 表示：价格是多少时，全城买家一共想买多少（这里 Qd = 100 − 4P，越贵买得越少）；橙色的<strong>供给曲线</strong> S 表示：价格是多少时，全城的店一共愿意卖多少（Qs = −20 + 6P，越贵越愿意卖；低于约 3.33 元一杯都不卖）。拖动价格，白色水平线就是这个价格；它碰到 D 的位置是想买的量，碰到 S 的位置是想卖的量，两点之间的线段就是差额。差额为 0 的价格叫<strong>均衡价格</strong>，那时的成交量叫<strong>均衡数量</strong>，也就是两条线的<a class="xlink" href="../../../math/algebra/simultaneous-equations/#step1">交点：两个方程同时成立的那一组数 →</a>。',
    pSlider: '价格 P（元/杯）', clear: '清除记录',
    s0lgD: '需求 D：想买的量', s0lgS: '供给 S：想卖的量', s0lgShort: '短缺（想买 > 想卖）', s0lgSur: '过剩（想卖 > 想买）',
    s0short: 'P = {P} 元：买家想买 {qd} 百杯，卖家只想卖 {qs} 百杯，短缺 {g} 百杯（有人排队也买不到）。',
    s0sur: 'P = {P} 元：买家只想买 {qd} 百杯，卖家想卖 {qs} 百杯，过剩 {g} 百杯（卖不掉）。',
    s0eq: 'P = {P} 元：买家想买 {qd} 百杯，卖家想卖 {qs} 百杯，正好相等：这就是均衡价格。',
    s0hint: '观察顺序：只拖价格，从 25 元慢慢拖到 0 元。每个试过的价格都会留下一段淡色的差额线，粉色是过剩、紫色是短缺；它们越靠近中间越短，在一个价格上缩成一个点。这个价格可以直接解出来：100 − 4P = −20 + 6P，得 P = 12 元、Q = 52 百杯。',

    s1k: '第 1 步 · 价格怎样找到交点',
    s1t: '如果价格一开始不在交点，它会自己走过去吗？',
    s1e: '这一步要回答：没有人知道交点在哪时，价格能不能自己走到那里？我们用一条简化的<strong>调价规则</strong>（教学用的假设，不是对真实市场的描述）：每一轮，看现在的差额（想买的减想卖的，单位百杯），价格就按「每差 1 百杯调 k 元」去改：短缺就涨价，过剩就降价。新价格 = 旧价格 + k ×（想买 − 想卖）。在两条线都不碰到坐标轴的范围里，这等价于：每一轮，价格离均衡价的差距都乘以同一个数 r = 1 − k ×（4 + 6）。',
    p1Slider: '起始价格（元/杯）', kSlider: '调价力度 k（元 / 每百杯差额）', run1: '调价 12 轮', clear1: '清除',
    s1lgPath: '每一轮的价格', s1lgEq: '均衡价格 12 元',
    s1idle: 'k = {k}：每轮差距乘以 r = {r}。按「调价 12 轮」开始。',
    s1readout: '第 {n}/{N} 轮：价格 {P} 元，差额 {g} 百杯，离均衡价 {dev} 元。k = {k}：每轮差距乘以 r = {r}（{kind}）。',
    s1left: '价格在第 {n} 轮冲出了 0–28 元的范围，调价规则在这里已经没有意义。k = {k}：r = {r}（{kind}）。',
    kindMono: '0 < r < 1：一路单调靠近',
    kindOsc: '−1 < r < 0：来回摆动但越摆越小',
    kindDiv: 'r < −1：越摆越大，走不到交点',
    kindEdge: 'r = −1：来回摆动幅度不变',
    s1hint: '观察顺序：先保持 k = 0.05，按「调价 12 轮」：副图（宽屏在右、窄屏在下）里价格一路靠近 12 元的虚线，主图里的白线跟着上下移。再把 k 拖到 0.15，同样按一次：价格越过交点又折回来，来回摆着靠近。最后拖到 0.22：摆幅一轮比一轮大。规则是否收敛只取决于 r：|r| < 1 才收敛，也就是 0 < k < 0.2。这说明的是「这一条调价规则」何时稳定，不是说真实市场一定会到达均衡。',

    s2k: '第 2 步 · 曲线自己动了',
    s2t: '城里人收入涨了、咖啡豆变贵了，新的交点在哪里？',
    s2e: '这一步要回答：价格以外的条件变了，交点怎样移动？收入、口味、别的饮品的价格变了，会让<strong>每一个价格</strong>下想买的量都变多或变少，这叫需求曲线<strong>移动</strong>（整条线左右平移）；原料成本、店的数量变了，会让每一个价格下想卖的量都变，这叫供给曲线移动。只是价格变了，引起买的量变，那叫<strong>沿着曲线移动</strong>，曲线本身不动。虚线是原来的两条线和原来的交点，实线是移动后的。',
    dASlider: '需求移动：每个价格下多买（百杯）', dCSlider: '供给移动：每个价格下多卖（百杯）',
    s2lgOld: '原来的曲线与交点', s2lgNew: '移动后的曲线与交点',
    s2readout: '新交点：P = {P} 元、Q = {Q} 百杯。和原来（12 元、52 百杯）比：价格 {dP} 元，数量 {dQ} 百杯。',
    s2hint: '观察顺序：先只把需求往右拖到 +20，交点沿着橙色供给线往右上走：价格和数量都升。归零后，只把供给往左拖到 −20（豆子变贵，每个价格下少卖 20 百杯），交点沿着青色需求线往左上走：价格升、数量降。两个一起动时，价格与数量的变化正好是两次单独移动的和（直线模型下成立）。',
    quizPrompt: '想一想：咖啡豆涨价后咖啡变贵，买的人少了。下面哪种说法对？',
    quizA: '需求曲线向左移动了', quizB: '需求曲线没有动，是沿着它往左上走了', quizC: '供给和需求两条线都向左移动了',
    check: '核对',
    correct: '对。买家对每个价格想买多少没有变（收入、口味都没变），变的是价格，所以是沿着需求曲线移动；真正移动的是供给曲线。把供给拖到 −20 就能看到：青线一动不动，交点沿着它滑上去。',
    wrong: '再想想：需求曲线移动，意思是「同一个价格下想买的量变了」。豆子涨价改变的是卖家的成本，买家在同一个价格下想买多少并没有变。',

    s3k: '第 3 步 · 弹性',
    s3t: '同样是成本上涨，为什么有时主要变贵，有时主要卖得少？',
    s3e: '这一步要回答：供给减少同样的量（每个价格下少卖 20 百杯），价格和数量各变多少，由什么决定？关键是需求有多「敏感」。<strong>需求的价格弹性</strong> εd = 数量变化的百分比 ÷ 价格变化的百分比，在一点上算就是 εd = (dQ/dP) × P / Q。它是负数（越贵买得越少），我们看它的大小 |εd|：大于 1 叫富有弹性（价格涨 1%，买的量降超过 1%），小于 1 叫缺乏弹性。滑杆只改需求曲线的陡峭程度：所有需求线都穿过原来的交点（12 元、52 百杯），所以那一点的价格和数量不变，只有斜率变。',
    bSlider: '需求斜率 b：每贵 1 元少买几百杯',
    s3lgOld: '原来的供给与交点', s3lgNew: '供给减少 20 百杯后', s3lgP: '价格变化 %', s3lgQ: '数量变化 %（取大小）',
    s3readout: 'b = {b}：在原交点 |εd| = {e}（{kind}）。供给减少 20 百杯后，价格涨 {dP} 元（+{pp}%），数量减 {dQ} 百杯（−{qp}%）。',
    elastic: '富有弹性', inelastic: '缺乏弹性', unit: '单位弹性',
    s3hint: '观察顺序：把 b 从 1 拖到 16。主图里的青线从陡变平；副图（宽屏在右、窄屏在下）记下每个试过的 b：横轴是 |εd|，橙点是价格涨了百分之几，青点是数量减了百分之几。需求越缺乏弹性（左边），成本上涨主要变成涨价；越富有弹性（右边），主要变成少卖。两组点正好在 |εd| = 1（单位弹性）处交叉：以原交点为基数，数量变化的百分比 ÷ 价格变化的百分比恰好等于 |εd|，所以单位弹性时两者一样大。',

    s4k: '第 4 步 · 税的楔子',
    s4t: '每杯收 t 元税，钱是买家出还是卖家出？',
    s4e: '这一步要回答：政府对每杯咖啡收 t 元税（向店家收），税最终由谁承担？有了税，买家付的价 Pb 和店家留下的价 Ps 不再相同，中间夹着 t：Pb − Ps = t，这段差叫<strong>税的楔子</strong>。新的成交量 Qt 要同时满足：买家按 Pb 想买 Qt，店家按 Ps 愿卖 Qt。和不收税时的 12 元比，Pb 涨了多少就是买家承担的部分，Ps 降了多少就是店家承担的部分。谁向政府交钱不重要，重要的是两条线的陡峭程度。',
    tSlider: '每杯税 t（元）', b4Slider: '需求斜率 b（同第 3 步：越大需求越有弹性）',
    s4lgSt: '供给 + 税（店家要求的含税价）', s4lgW: '楔子 t = Pb − Ps', s4lgB: '买家承担', s4lgS: '店家承担',
    barTitle: '每杯税 t 由谁承担', shareTitle: '买家份额随 |εd| 变化（点为试过的 b）',
    s4readout: 't = {t} 元，b = {b}：买家付 Pb = {Pb} 元（比 12 元多 {up}），店家留下 Ps = {Ps} 元（比 12 元少 {down}），成交 {Q} 百杯。买家承担 {sh}%，按公式 εs / (εs + |εd|) = {f}%。',
    s4zero: 't = 0：没有税，买家付的和店家拿的都是 12 元。拖动 t 看楔子出现。',
    s4hint: '观察顺序：先保持 b = 4，把 t 从 0 拖到 10：楔子越来越长，成交量越来越小，但买家承担的份额一直是 60%，不随 t 变（直线模型下份额只看斜率）。再固定 t = 4，把 b 从 1 拖到 16：需求越有弹性（买家越容易不买），买家承担得越少、店家承担得越多。副图（宽屏在右、窄屏在下）曲线就是这个份额公式，点是你试过的位置。',

    s5k: '第 5 步 · 剩余与无谓损失',
    s5t: '收税或补贴之后，所有人加起来是赚了还是亏了？',
    s5e: '这一步要回答：把买家、店家、政府三方的得失加起来，税或补贴会让总量变多还是变少？<strong>消费者剩余</strong>（青色面积）：每一杯，买家心里愿付的最高价（需求线的高度）减去实际付的价，全部加起来；<strong>生产者剩余</strong>（绿色面积）：每一杯，店家拿到的价减去做这一杯的成本（供给线的高度），全部加起来；面积就是这种逐杯累加（<a class="xlink" href="../../../math/calculus/integral/#step2">积分就是累加 →</a>）。政府收的税（橙色）算作收入，补贴（紫色）算作支出。三方加起来叫<strong>总剩余</strong>。比不收税时少掉的部分叫<strong>无谓损失</strong>（粉色三角）：那些本来「买家愿付 > 成本」、却因为楔子没有成交（或补贴下「成本 > 买家愿付」却成交了）的杯数，谁也没得到这部分。单位：元 × 百杯 = 百元/天。',
    t5Slider: '每杯税 t（元；负数表示每杯补贴 −t 元）',
    s5lgCS: '消费者剩余', s5lgPS: '生产者剩余', s5lgR: '税收', s5lgG: '补贴支出', s5lgDWL: '无谓损失',
    s5readout: 't = {t}：成交 {Q} 百杯。消费者剩余 {cs}，生产者剩余 {ps}，{govLabel} {gov}，总剩余 {w}（不收税时 {w0}），无谓损失 {dwl} = ½ × t² × b·d/(b+d) = {f}（单位：百元/天）。',
    govTax: '税收', govSub: '补贴支出', govNone: '政府收支',
    s5hint: '观察顺序：先把 t 拖到 5：粉色三角出现，总剩余从 563.33 降到 533.33，少掉的 30 就是三角的面积。再拖到 10：三角面积变成 120，是 t = 5 时的 4 倍，因为损失随 t 的平方增长。最后拖到 −5（每杯补贴 5 元）：成交变多，但新增的那些杯成本高于买家愿付的价，粉色三角出现在交点右边，面积同样是 30。副图（宽屏在右、窄屏在下）记下每个试过的 t。这里只算了这个市场里的三方；如果咖啡给别人带来额外的成本或好处（外部性），结论会变，见收束的链接。',

    s6k: '第 6 步 · 收束', s6t: '两条线、一个交点、几块面积',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，价格线碰到两条曲线的两个点之差是短缺或过剩，差为 0 的地方是均衡；<strong>第 1 步</strong>，按「短缺就涨、过剩就降」调价，只有 |1 − k(b + d)| < 1 时才收敛到交点；<strong>第 2 步</strong>，价格以外的条件让整条线移动，价格变化只是沿线移动；<strong>第 3 步</strong>，同样的供给冲击，需求越缺乏弹性越多地变成涨价；<strong>第 4 步</strong>，税在买卖价之间撑开楔子，买家承担 d/(b + d)；<strong>第 5 步</strong>，税和补贴都留下无谓损失 ½ t² · bd/(b + d)。',
    formula: '均衡：P* = (a − c)/(b + d)，Q* = a − b·P*\n楔子：Pb − Ps = t，买家份额 = d/(b + d) = εs/(εs + |εd|)\n损失：DWL = ½ · t² · b·d/(b + d)',
    boundary: '适用范围：直线需求与供给、价格以外的条件固定、买卖双方都只能接受市场价（没有定价权）、没有时间滞后、没有外部性。数字是虚构的教学市场，不是对任何真实市场的预测；第 1 步的调价规则是教学假设。',
    linksTitle: '接着去哪儿',
    lk1: '→ 交点就是方程组的解：两个方程同时成立（二元一次方程组页第 1 步）',
    lk2: '→ 当生产给别人带来成本：庇古税怎样把账拉回价格（外部性页第 3 步）',
    lk3: '→ 斜率是什么：直线 y = kx + b 每走一步抬高多少（一次函数页第 2 步）',
    lk4: '→ 面积为什么是累加：积分就是累加（积分页第 2 步）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《供需与市场均衡 · 价格线如何相交》的平行版本。'
  },
  en: {
    pageTitle: 'Supply & Demand · One Price Line, Back and Forth',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Supply & Demand · Where the Market Clears →',
    navLabel: 'Supply and demand steps',
    tagline: 'One small city’s takeaway-coffee market (the numbers are made up): buyers look at the price to decide how much to buy, cafés look at it to decide how much to sell. Over seven steps you first use a horizontal price line to find the one price where the two sides match, then watch incomes, costs, taxes and subsidies push it around, and finally turn “who gained what, and what was simply lost” into areas.',
    nav0: '0 Price line', nav1: '1 Finding the crossing', nav2: '2 Shifting curves', nav3: '3 Elasticity', nav4: '4 Tax wedge', nav5: '5 Surplus & loss', nav6: '6 Wrap-up',
    axP: 'price P (yuan/cup)', axQ: 'quantity Q (100 cups/day)',
    axRound: 'round', axPrice: 'price (yuan/cup)', axEps: 'size of demand elasticity |εd|', axPct: 'change (%)', axShare: 'buyers’ share', axT: 'tax per cup t (yuan; negative = subsidy)', axDWL: 'deadweight loss (100 yuan/day)',
    tagD: 'demand D', tagS: 'supply S',

    s0k: 'STEP 0 · TWO CURVES AND A PRICE LINE',
    s0t: 'At a given price, do buyers want exactly as much as sellers want to sell?',
    s0e: 'This step asks: at a given price, how much do buyers want, how much do sellers offer, and at what price are the two equal? The horizontal axis is cups per day (in hundreds), the vertical axis is the price per cup in yuan. The cyan <strong>demand curve</strong> D says how much all the city’s buyers want at each price (here Qd = 100 − 4P: the dearer, the less). The orange <strong>supply curve</strong> S says how much all the cafés are willing to sell at each price (Qs = −20 + 6P: the dearer, the more; below about 3.33 yuan nobody sells). Drag the price: the white horizontal line is that price. Where it meets D is the amount wanted, where it meets S is the amount offered, and the segment between them is the gap. The price with zero gap is the <strong>equilibrium price</strong>, and the amount traded there is the <strong>equilibrium quantity</strong>: the <a class="xlink" href="../../../math/algebra/simultaneous-equations/#step1">crossing point, the pair of numbers that satisfies both equations at once →</a>.',
    pSlider: 'Price P (yuan/cup)', clear: 'Clear the trail',
    s0lgD: 'Demand D: amount wanted', s0lgS: 'Supply S: amount offered', s0lgShort: 'Shortage (wanted > offered)', s0lgSur: 'Surplus (offered > wanted)',
    s0short: 'P = {P} yuan: buyers want {qd} hundred cups but cafés offer only {qs}, a shortage of {g} hundred (some people queue and still miss out).',
    s0sur: 'P = {P} yuan: buyers want only {qd} hundred cups while cafés offer {qs}, a surplus of {g} hundred (left unsold).',
    s0eq: 'P = {P} yuan: buyers want {qd} hundred cups and cafés offer {qs}, exactly equal. This is the equilibrium price.',
    s0hint: 'What to watch: drag only the price, slowly from 25 yuan down to 0. Every price you try leaves a faint gap segment, pink for a surplus and violet for a shortage. They get shorter towards the middle and shrink to a point at one price. You can also solve for it directly: 100 − 4P = −20 + 6P gives P = 12 yuan and Q = 52 hundred cups.',

    s1k: 'STEP 1 · HOW THE PRICE FINDS THE CROSSING',
    s1t: 'If the price starts away from the crossing, does it get there by itself?',
    s1e: 'This step asks: when nobody knows where the crossing is, can the price find its way there? We use a simple <strong>adjustment rule</strong> (a teaching assumption, not a description of real markets): each round, look at the current gap (wanted minus offered, in hundreds of cups) and change the price by k yuan per hundred cups of gap, up when there is a shortage, down when there is a surplus. New price = old price + k × (wanted − offered). As long as neither line touches an axis, this is the same as saying: every round, the distance from the equilibrium price is multiplied by the same number r = 1 − k × (4 + 6).',
    p1Slider: 'Starting price (yuan/cup)', kSlider: 'Adjustment strength k (yuan per 100 cups of gap)', run1: 'Adjust for 12 rounds', clear1: 'Clear',
    s1lgPath: 'price in each round', s1lgEq: 'equilibrium price 12 yuan',
    s1idle: 'k = {k}: each round multiplies the distance by r = {r}. Press “Adjust for 12 rounds” to start.',
    s1readout: 'Round {n}/{N}: price {P} yuan, gap {g} hundred cups, {dev} yuan from equilibrium. k = {k}: each round multiplies the distance by r = {r} ({kind}).',
    s1left: 'In round {n} the price left the 0–28 yuan range, where the rule no longer makes sense. k = {k}: r = {r} ({kind}).',
    kindMono: '0 < r < 1: closes in steadily',
    kindOsc: '−1 < r < 0: swings back and forth, ever smaller',
    kindDiv: 'r < −1: swings grow, never arrives',
    kindEdge: 'r = −1: swings forever at the same size',
    s1hint: 'What to watch: keep k = 0.05 and press “Adjust for 12 rounds”. In the side panel (right on wide screens, below on narrow ones) the price creeps towards the dashed 12-yuan line, and the white line in the main chart moves with it. Then drag k to 0.15 and press again: the price overshoots the crossing, comes back, and swings in. Finally try 0.22: each swing is larger than the last. Whether the rule settles depends only on r: it converges when |r| < 1, that is when 0 < k < 0.2. This is about when this particular rule is stable, not a claim that real markets always reach equilibrium.',

    s2k: 'STEP 2 · WHEN THE CURVES THEMSELVES MOVE',
    s2t: 'Incomes rise, coffee beans get dearer: where is the new crossing?',
    s2e: 'This step asks: when something other than the price changes, how does the crossing move? A change in income, taste or the price of other drinks changes the amount wanted at <strong>every</strong> price; the whole demand curve <strong>shifts</strong> sideways. A change in ingredient costs or in the number of cafés changes the amount offered at every price; the supply curve shifts. When only the price changes and buyers respond, that is a <strong>movement along the curve</strong>; the curve itself stays put. The dashed lines are the original curves and crossing, the solid ones are after the shift.',
    dASlider: 'Demand shift: extra wanted at every price (100 cups)', dCSlider: 'Supply shift: extra offered at every price (100 cups)',
    s2lgOld: 'original curves and crossing', s2lgNew: 'shifted curves and crossing',
    s2readout: 'New crossing: P = {P} yuan, Q = {Q} hundred cups. Compared with the original (12 yuan, 52 hundred): price {dP} yuan, quantity {dQ} hundred cups.',
    s2hint: 'What to watch: first drag only demand to +20. The crossing slides up and to the right along the orange supply line: price and quantity both rise. Reset it, then drag only supply to −20 (dearer beans, 20 hundred fewer cups offered at every price). The crossing slides up and to the left along the cyan demand line: price up, quantity down. With both moved, the changes in price and quantity are exactly the sum of the two separate shifts (true for straight lines).',
    quizPrompt: 'Think about it: after beans got dearer, coffee costs more and people buy less. Which statement is right?',
    quizA: 'The demand curve shifted left', quizB: 'The demand curve did not move; we moved up and left along it', quizC: 'Both supply and demand shifted left',
    check: 'Check',
    correct: 'Right. How much buyers want at each price has not changed (same incomes, same tastes); the price changed, so this is a movement along the demand curve. The curve that really moved is supply. Drag supply to −20 to see it: the cyan line stays still and the crossing slides up along it.',
    wrong: 'Think again: a shift in demand means “a different amount wanted at the same price”. Dearer beans change the cafés’ costs; at any given price, buyers want just as much as before.',

    s3k: 'STEP 3 · ELASTICITY',
    s3t: 'Same rise in costs: why does it sometimes mostly raise the price, and sometimes mostly cut sales?',
    s3e: 'This step asks: when supply falls by the same amount (20 hundred fewer cups at every price), what decides how much the price and the quantity change? The key is how “sensitive” demand is. The <strong>price elasticity of demand</strong> εd = percentage change in quantity ÷ percentage change in price; at a single point, εd = (dQ/dP) × P / Q. It is negative (dearer means less), so we look at its size |εd|: above 1 is called elastic (a 1% price rise cuts purchases by more than 1%), below 1 inelastic. The slider changes only how steep demand is: every demand line passes through the original crossing (12 yuan, 52 hundred cups), so price and quantity there stay the same and only the slope changes.',
    bSlider: 'Demand slope b: hundreds of cups fewer per extra yuan',
    s3lgOld: 'original supply and crossing', s3lgNew: 'after supply falls by 20 hundred', s3lgP: 'price change %', s3lgQ: 'quantity change % (size)',
    s3readout: 'b = {b}: at the original crossing |εd| = {e} ({kind}). After supply falls by 20 hundred cups, the price rises {dP} yuan (+{pp}%) and the quantity drops {dQ} hundred cups (−{qp}%).',
    elastic: 'elastic', inelastic: 'inelastic', unit: 'unit elastic',
    s3hint: 'What to watch: drag b from 1 to 16. In the main chart the cyan line goes from steep to flat. The side panel (right on wide screens, below on narrow ones) keeps every b you tried: the horizontal axis is |εd|, orange dots show how many percent the price rose, cyan dots how many percent the quantity fell. The less elastic demand is (left), the more the cost rise turns into a higher price; the more elastic (right), the more it turns into fewer sales. The two sets of dots cross exactly at |εd| = 1 (unit elasticity): measured from the original crossing, the percentage change in quantity divided by the percentage change in price is exactly |εd|, so at unit elasticity the two are equal.',

    s4k: 'STEP 4 · THE TAX WEDGE',
    s4t: 'A tax of t yuan per cup: do buyers pay it or do cafés?',
    s4e: 'This step asks: the government charges t yuan per cup (collected from the cafés). Who ends up bearing it? With a tax, the price buyers pay, Pb, and the price cafés keep, Ps, are no longer the same; t sits between them: Pb − Ps = t. This gap is the <strong>tax wedge</strong>. The new quantity Qt must satisfy both sides: buyers want Qt at Pb, and cafés will sell Qt at Ps. Compared with the 12 yuan without a tax, the rise in Pb is the buyers’ share and the fall in Ps is the cafés’ share. Who hands the money to the government does not matter; how steep the two lines are does.',
    tSlider: 'Tax per cup t (yuan)', b4Slider: 'Demand slope b (as in step 3: larger = more elastic demand)',
    s4lgSt: 'supply + tax (price cafés need, tax included)', s4lgW: 'wedge t = Pb − Ps', s4lgB: 'paid by buyers', s4lgS: 'paid by cafés',
    barTitle: 'Who bears the tax t on each cup', shareTitle: 'Buyers’ share against |εd| (dots: b you tried)',
    s4readout: 't = {t} yuan, b = {b}: buyers pay Pb = {Pb} yuan ({up} more than 12), cafés keep Ps = {Ps} yuan ({down} less than 12), {Q} hundred cups traded. Buyers bear {sh}%; the formula εs / (εs + |εd|) gives {f}%.',
    s4zero: 't = 0: no tax, so buyers pay and cafés keep the same 12 yuan. Drag t to open the wedge.',
    s4hint: 'What to watch: keep b = 4 and drag t from 0 to 10. The wedge grows and the quantity shrinks, but the buyers’ share stays at 60% whatever t is (with straight lines the share depends only on the slopes). Then hold t = 4 and drag b from 1 to 16: the more elastic demand is (the easier it is for buyers to walk away), the less buyers bear and the more the cafés bear. The curve in the side panel (right on wide screens, below on narrow ones) is that share formula; the dots are where you have been.',

    s5k: 'STEP 5 · SURPLUS AND DEADWEIGHT LOSS',
    s5t: 'After a tax or a subsidy, is everyone together better or worse off?',
    s5e: 'This step asks: add up what buyers, cafés and the government gain or lose. Does a tax or a subsidy make the total bigger or smaller? <strong>Consumer surplus</strong> (cyan area): for each cup, the most a buyer would pay (the height of the demand line) minus what they actually pay, added over all cups. <strong>Producer surplus</strong> (green area): for each cup, the price the café keeps minus the cost of making that cup (the height of the supply line), added up. An area is exactly this kind of cup-by-cup sum (<a class="xlink" href="../../../math/calculus/integral/#step2">integration is accumulation →</a>). Tax revenue (orange) counts as a gain for the government, a subsidy (violet) as a cost. All three together are the <strong>total surplus</strong>. The part lost compared with no tax is the <strong>deadweight loss</strong> (pink triangle): cups that buyers valued above their cost but that the wedge stopped (or, with a subsidy, cups that cost more than buyers valued but were made anyway). Nobody gets that part. Units: yuan × hundreds of cups = hundreds of yuan per day.',
    t5Slider: 'Tax per cup t (yuan; negative means a subsidy of −t per cup)',
    s5lgCS: 'consumer surplus', s5lgPS: 'producer surplus', s5lgR: 'tax revenue', s5lgG: 'subsidy cost', s5lgDWL: 'deadweight loss',
    s5readout: 't = {t}: {Q} hundred cups traded. Consumer surplus {cs}, producer surplus {ps}, {govLabel} {gov}, total surplus {w} (without a tax {w0}), deadweight loss {dwl} = ½ × t² × b·d/(b+d) = {f} (units: 100 yuan/day).',
    govTax: 'tax revenue', govSub: 'subsidy cost', govNone: 'government',
    s5hint: 'What to watch: drag t to 5. The pink triangle appears and the total surplus drops from 563.33 to 533.33; the missing 30 is the triangle’s area. Drag on to 10: the triangle is now 120, four times the area at t = 5, because the loss grows with the square of t. Finally drag to −5 (a subsidy of 5 yuan per cup): more cups are traded, but the extra cups cost more than buyers value them, so a pink triangle appears to the right of the crossing, again with area 30. The side panel (right on wide screens, below on narrow ones) keeps every t you tried. Only the three parties in this market are counted; if coffee imposed extra costs or benefits on others (an externality), the conclusion would change; see the links in the wrap-up.',

    s6k: 'STEP 6 · WRAP-UP', s6t: 'Two lines, one crossing, a few areas',
    s6fin: 'Looking back: <strong>Step 0</strong> — where the price line meets the two curves, the difference is a shortage or a surplus; where it is zero is the equilibrium. <strong>Step 1</strong> — adjusting the price up on shortages and down on surpluses settles at the crossing only when |1 − k(b + d)| < 1. <strong>Step 2</strong> — conditions other than the price shift whole curves; a price change is just a movement along them. <strong>Step 3</strong> — for the same supply shock, the less elastic demand is, the more of it becomes a price rise. <strong>Step 4</strong> — a tax opens a wedge between the buying and selling prices, and buyers bear d/(b + d). <strong>Step 5</strong> — taxes and subsidies alike leave a deadweight loss of ½ t² · bd/(b + d).',
    formula: 'Equilibrium: P* = (a − c)/(b + d), Q* = a − b·P*\nWedge: Pb − Ps = t, buyers’ share = d/(b + d) = εs/(εs + |εd|)\nLoss: DWL = ½ · t² · b·d/(b + d)',
    boundary: 'Where this holds: straight-line demand and supply, all conditions other than the price held fixed, buyers and sellers who take the market price (no pricing power), no time lags and no externalities. The numbers describe a made-up teaching market, not a forecast for any real one; the adjustment rule of step 1 is a teaching assumption.',
    linksTitle: 'Where to go next',
    lk1: '→ The crossing solves a system: two equations true at once (Simultaneous Equations, step 1)',
    lk2: '→ When production costs other people: how a Pigouvian tax pulls the bill back into the price (Externalities, step 3)',
    lk3: '→ What a slope is: how much y = kx + b rises per step (Linear Functions, step 2)',
    lk4: '→ Why an area is a running total: integration is accumulation (Integrals, step 2)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Supply & Demand · Where the Market Clears”.'
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
