'use strict';
// Expected-value lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '期望 · 彩票、骰子、保险放在同一台秤上',
    back: '← 知识索引',
    compare: '对照另一版本：期望 · 彩票、骰子、保险放在同一台秤上 →',
    navLabel: '期望步骤导航',
    tagline: '一局游戏、一张彩票、一份保单，结果都不确定，但每一种结果有多大可能、值多少钱是知道的。把它们放到同一台秤上，秤的平衡点就是「期望」。六步里你会找到这个点，看它在什么意义上是平均，用它给游戏定价，再看它管不到的地方。',
    nav0: '0 平衡点', nav1: '1 长期平均', nav2: '2 公平价', nav3: '3 相加', nav4: '4 保险', nav5: '5 悖论', nav6: '6 收束',

    s0k: '第 0 步 · 一台秤',
    s0t: '一局可能拿到好几种钱数，平均每局拿多少？',
    s0e: '这一步要回答：一局游戏的结果是随机的（掷之前不知道是哪一个），但每个结果 x（拿到的钱，元）出现的<strong>概率</strong> p 是知道的，那么「平均每局拿多少」该怎么算？把每个结果当成一块砝码：放在数轴上 x 的位置，重量是它的概率 p。秤杆绕支点 g 转动的净效果是 Σ p·(x − g)，正数往右倒、负数往左倒。秤恰好放平时 Σ p·(x − g) = 0，也就是 g = Σ p·x。这个平衡点叫<strong>期望</strong>，记作 E = Σ p·x：每个结果乘上它的概率，再全部加起来（<a class="xlink" href="../../../probability/basics/probability-distribution/#step1">→ 概率分布页第 1 步：期望是概率加权的重心</a>）。',
    game_die: '按点数给钱（1–6 元）', game_six: '掷出 6 给 12 元', game_max2: '两颗骰子，按大的给钱',
    c0title: '砝码 = 概率，位置 = 拿到的钱（元）',
    s0lgL: '支点左边的砝码', s0lgR: '支点右边的砝码', s0lgF: '支点 g', s0lgT: '你松手过的支点位置',
    g0: '支点位置 g（元）', find0: '让支点自己滑到平衡处',
    s0readout: '支点 g = {g} 元：左边的转动效果 Σp·(g − x) = {l}，右边 Σp·(x − g) = {r}，净值 {tq}，{state}。',
    s0level: '秤是平的', s0right: '右边更重，秤往右倒', s0left: '左边更重，秤往左倒',
    s0formula: '平衡点 = 期望 E = {terms} = {E} 元。',
    s0hidden: '（秤放平后，这里给出平衡点的算式。）',
    s0hint: '观察顺序：先选一个游戏，拖支点找让秤放平的位置（每次松手会在数轴上留一道灰色刻痕）；找不到再按按钮。然后换「掷出 6 给 12 元」：砝码几乎都压在 0 上，平衡点却在 2 元，这一局你永远拿不到 2 元。再换「两颗骰子，按大的给钱」：大点数更重，平衡点偏到 3.5 右边。',

    s1k: '第 1 步 · 长期平均',
    s1t: '一局永远拿不到 3.5 元，期望在什么意义上是「平均」？',
    s1e: '这一步要回答：期望 E 是秤的平衡点，可它往往不是任何一局真能拿到的钱数，它和「真的玩很多局」有什么关系？这里反复玩<strong>第 0 步选中的那个游戏</strong>（用电脑的伪随机数模拟，局与局互不影响）。<strong>累计平均</strong> = 到目前为止拿到的钱 ÷ 已玩局数。<strong>大数定律</strong>说：各局独立、规则不变时，局数 n 越多，累计平均离 E 越近，想多近都可以。近到什么程度由<strong>标准差</strong> σ 决定：σ = √(Σ p·(x − E)²)，是单独一局离 E 的典型距离；n 局的平均离 E 的典型距离缩成 σ/√n。绿色带是 E ± 2σ/√n，大约 95% 的重来里，平均值都在带内。',
    c1a: '累计平均（元）随局数变化',
    c1b: '各结果出现的比例（青）与概率（橙色虚线）',
    s1lgAvg: '累计平均', s1lgE: '期望 E', s1lgBand: 'E ± 2σ/√n（约 95% 的重来落在带内）',
    play10: '再玩 10 局', play100: '再玩 100 局', play1000: '再玩 1000 局', reset1: '换一串随机数重来',
    s1empty: '还没玩。{name} 的期望 E = {E} 元。按「再玩 10 局」开始。',
    s1readout: '已玩 {n}/{N} 局：累计平均 {m} 元，期望 {E} 元，差 {gap} 元；此时带宽 2σ/√n = {w} 元（单局标准差 σ = {sd} 元），平均值{inside}。',
    inside: '在带内', outside: '在带外（约 5% 的重来会这样）',
    s1hint: '观察顺序：连按几次「再玩 10 局」，看青色折线开头大起大落；再按「再玩 1000 局」，折线收进越来越窄的绿色带，下图青柱逼近橙色虚线。横轴是对数刻度：每一大格局数多十倍，带宽只缩到约 1/3（√10 ≈ 3.16）。换一串随机数，前几十局的样子完全不同，但最后都收向 E。',

    s2k: '第 2 步 · 公平价',
    s2t: '每局先付入场费 c，c 是多少才算公平？',
    s2e: '这一步要回答：已经知道每局平均拿回 E 元，入场费 c 该定多少？每局的<strong>净收益</strong> = 拿回的钱 − c，它的期望是 E − c（期望可以逐项减去一个固定数）。E − c = 0 时没人占便宜，c = E 叫<strong>公平价</strong>。c 高于 E 时，差额就是庄家每局平均赚走的钱；它占入场费的比例 (c − E)/c 叫<strong>庄家优势</strong>。上图把「平均拿回的 E」拆成每个奖项的贡献 p·x（概率 × 奖金），首尾相接；下图是 5 位模拟玩家各玩 1000 局的累计净收益。',
    tk_roulette: '轮盘押红：10 元', tk_dice: '骰子摊：4 元', tk_scratch: '刮刮乐（虚构奖表）：10 元',
    c2a: '每局（元）：付出的与平均拿回的',
    c2pay: '付出 c = {c}', c2get: '平均拿回 E = {E}，按奖项拆开',
    c2b: '5 位玩家 1000 局的累计净收益（元）',
    s2lgPay: '入场费 c', s2lgExp: '期望净收益 1000·(E − c)', s2lgPath: '模拟玩家的累计净收益',
    tierItem: '奖 {x} 元 × 概率 {p} = {c}',
    c2: '入场费 c（元）', new2: '换 5 位玩家',
    s2readout: '平均拿回 E = {E} 元，入场费 c = {c} 元，每局净收益期望 E − c = {net} 元：{verdict}。1000 局的期望净收益 {exp} 元；这 5 位玩家实际是 {ends} 元。',
    s2fair: '公平', s2house: '庄家优势 {edge}', s2player: '玩家占便宜（没有赌场会这样定价）',
    sep: '、',
    s2hint: '观察顺序：先看轮盘：粉色的入场费条比下面一行长出一小截（每局差 0.27 元，即 2.7%），5 条折线大多跟着橙色虚线往下走，但 1000 局里也有人赢。把 c 拖到 E 附近，虚线变平。再换刮刮乐：100000 元头奖每张只有十万分之一的机会，可它对 E 的贡献（1 元）和 10 元小奖一样大。1000 张里出现头奖的机会只有约 1%，所以玩家折线通常落在虚线下方；每中一次 1000 元奖，折线就跳高一截。',

    s3k: '第 3 步 · 期望可以相加',
    s3t: '掷 n 颗骰子、按点数之和给钱，期望是多少？骰子互相牵连会改变答案吗？',
    s3e: '这一步要回答：几个随机量加在一起，期望怎么算？答案是<strong>期望的线性</strong>：E[X + Y] = E[X] + E[Y]，不管 X、Y 是否互相影响都成立（把 Σ p·(x + y) 拆成两个和就看出来了）。一颗骰子的期望是 3.5（第 0 步的平衡点），所以 n 颗之和的期望总是 3.5n。下面用三种「牵连方式」验证：<strong>各掷各的</strong>（独立）；<strong>全都一样</strong>（只掷一颗，其余照抄）；<strong>两两相反</strong>（每两颗一组，第二颗显示 7 减第一颗）。柱子是点数之和的概率，橙色三角是平衡点（期望），绿色横杠是平衡点 ± 一个标准差（离期望的典型距离）。',
    md_indep: '各掷各的', md_same: '全都一样', md_mirror: '两两相反',
    n3: '骰子个数 n',
    c3title: '{n} 颗骰子点数之和的概率',
    s3lgBar: '点数之和的概率', s3lgE: '平衡点 = 期望', s3lgSd: '期望 ± 一个标准差',
    s3readout: '{mode}：期望 = {E}，3.5 × n = {n35}，两者相等；标准差 = {sd}。对照：各掷各的时标准差为 σ√n = {indep}，全都一样时为 σn = {same}（σ ≈ 1.708 是一颗骰子的标准差）。',
    s3hint: '观察顺序：固定 n = 4，依次点三种方式：柱子形状变化很大（钟形、六根等距的柱、一根柱），橙色三角却一动不动地停在 14。再拖 n：三角每次右移 3.5。期望只管「重心在哪」，不管「摊得多开」；摊得多开要看标准差，它确实取决于骰子之间怎么牵连。',

    s4k: '第 4 步 · 保险',
    s4t: '保险公司平均要赚你的钱，买保险是不是犯傻？',
    s4e: '这一步要回答：保费 = (1 + 附加费率) × 期望赔付，高于你的期望损失，按第 2 步的算法你是吃亏的一方，为什么人们还买？设定：一所房子每年以概率 p 失火，损失 200,000 元（不失火就是 0）。不买保险，你的<strong>期望损失</strong>是 p × 200,000，但真实结果只有两种：0，或者一下子 200,000。买了保险，确定付出保费，没有别的结果。保险公司同时卖出 N 份这样的保单，各家是否失火<strong>互不相关</strong>；它关心的是每单平均赔付 = 200,000 × 失火户数 ÷ N。由第 1 步，这个平均的典型波动是 σ/√N，N 越大越窄（<a class="xlink" href="../../../probability/stochastic/risk-pooling/#step1">→ 风险分摊页第 1 步：把很多人放在一起，人均损失会怎样</a>）。',
    c4a: '你：一年后的损失（元）',
    c4no: '不买：圆点面积 ∝ 概率', c4yes: '买：确定付出保费',
    c4b: '保险公司：每单平均赔付（元），N = {N}',
    s4lgSafe: '不失火 / 赔付不超过保费', s4lgHit: '失火损失 / 赔付超过保费', s4lgE: '期望损失 p × 200,000（上图三角，下图虚线）', s4lgPrem: '保费',
    p4: '每年失火概率 p', l4: '附加费率', n4: '保险公司的保单数 N',
    s4readout: '你：不买时期望损失 {pL} 元，但实际是 0 或 {L} 元，有 {pp}% 的可能是后者（单户标准差 {sd} 元）；买保险确定付 {prem} 元，比期望损失多 {extra} 元。保险公司：{N} 份保单，每单平均赔付的标准差缩到 {sdN} 元，而每单多收 {extra} 元；总赔付超过总保费的概率为 {pl}（按二项分布精确计算）。{off}',
    s4off: '另有 {o} 的概率落在图右侧之外。',
    s4hint: '观察顺序：先把 N 拖到最右（100,000）：下图的柱子挤成一个窄峰，几乎全在绿色保费线左边，保险公司几乎稳赚。再把附加费率拖到 0%：保费线和虚线重合，总赔付超过保费的概率不再随 N 消失，N 越大反而越接近一半（N = 100,000 时约 49%），所以保险公司一定要收附加费。最后看上图：对你来说只有一个结果，0 或 200,000，没有「平均」可以依靠。',

    s5k: '第 5 步 · 圣彼得堡悖论',
    s5t: '一个期望无限大的游戏，你愿意花多少钱玩一局？',
    s5e: '这一步要回答：如果期望可以无限大，按「公平价 = 期望」，入场费再高都划算，这对吗？游戏规则：反复抛一枚公平硬币，直到第一次出现正面；如果第 k 次才出现，你拿 2<sup>k</sup> 元。第 k 档的概率是 1/2<sup>k</sup>，奖金是 2<sup>k</sup>，所以<strong>每一档对期望的贡献都是 1 元</strong>，档数无穷，期望无限大。真实的赌场最多只能付出 2<sup>K</sup> 元（K 次及以后都按 2<sup>K</sup> 付），这时期望 = K + 1 元。上图是累计平均，下图把平均值按档拆开：第 k 档贡献 = 该档出现的局数 × 2<sup>k</sup> ÷ 总局数，理论值（橙色虚线）是 1，封顶那一档是 2。',
    c5a: '累计平均（元）随局数变化',
    c5b: '各档对平均值的贡献（元），K = {K}',
    s5lgAvg: '累计平均', s5lgE: '期望 K + 1（封顶后）', s5lgLog: '参考线 log₂n + 2', s5lgOver: '超出图顶的贡献',
    k5: '封顶档数 K（赌场最多付 2^K 元）', k5cap: '封顶金额（元）：',
    play5a: '再玩 100 局', play5b: '再玩 1000 局', reset5: '换一串随机数重来',
    s5empty: '封顶 K = {K}，最多付 {cap} 元，期望 = {E} 元。按「再玩 100 局」开始。',
    s5readout: '已玩 {n} 局：累计平均 {m} 元，期望 {E} 元（K = {K}）。其中 {small} 的局只拿到 2 或 4 元，单局最多拿到 {mx} 元。参考线此处为 {lg} 元。',
    s5hint: '观察顺序：保持 K = 20（封顶约 100 万元，期望 21 元），连按「再玩 1000 局」到 10,000 局：多数时候累计平均大致沿灰色点线爬升，低于橙色虚线；偶尔一局大奖会把它一下子顶到很高，之后又慢慢落回来；下图前几档贴着 1，后面大多是 0，偶尔一档冒出图顶（粉色三角）。要等这些罕见的档都出现，得玩约 2^K 局。再把 K 拖到 3：期望只有 4 元，几百局内平均就稳在虚线上。拖 K 会清空已玩的局。点线 log₂n + 2 是经验参考：多次重来时累计平均的中位数大致沿它增长，不是精确预测。',

    s6k: '第 6 步 · 收束',
    s6t: '期望能回答什么，不能回答什么',
    s6fin: '期望是一个分布的<strong>平衡点</strong>：每个结果乘它的概率再相加。它的意义来自<strong>重复</strong>：独立地玩很多局，累计平均会收向它，偏差约为 σ/√n。所以它是反复下注的人（赌场、保险公司）的正确账本，也让「公平价」「庄家优势」有了准确的定义。期望还可以直接相加，不需要独立。但它只说重心在哪，不说摊得多开：只玩一次、损失大到伤筋动骨，或者大部分期望藏在极少出现的结果里（圣彼得堡），只看期望会做错决定。',
    formula: 'E = Σ p·x（平衡点）\n累计平均 → E，偏差约 σ/√n（独立重复）\nE[X + Y] = E[X] + E[Y]（不要求独立）',
    boundary: '适用范围：本页骰子、硬币、轮盘都是理想的公平器具；随机结果来自固定种子的伪随机数；失火概率与 200,000 元损失是教学设定，保险部分假设各户独立（一场洪水淹没所有人时不成立）；刮刮乐奖表是虚构的。这里不讨论效用函数、税费和本金上限，也不构成任何赌博或保险建议。',
    linksTitle: '接着去哪',
    lk1: '→ 概率分布第 1 步：期望不是「最常见的数」，而是概率加权的重心',
    lk2: '→ 蒙特卡洛第 1 步：频率多起来，就会露出概率的脸',
    lk3: '→ 风险分摊第 1 步：把很多人放在一起，人均损失会怎样',
    lk4: '→ 多臂老虎机第 0 步：期望未知时，哪台机器最值得拉',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《期望 · 彩票、骰子、保险放在同一台秤上》的平行版本。'
  },
  en: {
    pageTitle: 'Expected Value · Lotteries, Dice and Insurance on One Scale',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Expected Value · Lotteries, Dice and Insurance on One Scale →',
    navLabel: 'Expected value steps',
    tagline: 'A game, a lottery ticket, an insurance policy: you never know the outcome in advance, but you do know how likely each outcome is and what it is worth. Put them on a scale and the point where it balances is the expected value. In six steps you will find that point, see in what sense it is an average, use it to price a game, and then see what it cannot tell you.',
    nav0: '0 Balance', nav1: '1 Long run', nav2: '2 Fair price', nav3: '3 Adding', nav4: '4 Insurance', nav5: '5 Paradox', nav6: '6 Wrap-up',

    s0k: 'Step 0 · A scale',
    s0t: 'One play can pay several different amounts. What does it pay on average?',
    s0e: 'This step answers: the outcome of one play is random (you do not know it before you roll), but the <strong>probability</strong> p of each outcome x (the money you receive, in yuan) is known. How do you work out the average payout per play? Treat every outcome as a weight placed at position x on a number line, with mass p. The net turning effect about a pivot g is Σ p·(x − g): positive tips the beam right, negative tips it left. The beam is level exactly when Σ p·(x − g) = 0, that is g = Σ p·x. That balance point is the <strong>expected value</strong>, E = Σ p·x: multiply each outcome by its probability and add them all up (<a class="xlink" href="../../../probability/basics/probability-distribution/#step1">→ Probability distributions, step 1: the mean is the probability-weighted centre</a>).',
    game_die: 'Pay the face value (¥1–6)', game_six: '¥12 on a six', game_max2: 'Two dice, pay the larger',
    c0title: 'Weight = probability, position = payout (yuan)',
    s0lgL: 'weights left of the pivot', s0lgR: 'weights right of the pivot', s0lgF: 'pivot g', s0lgT: 'where you let go of the pivot',
    g0: 'Pivot position g (yuan)', find0: 'Let the pivot slide to balance',
    s0readout: 'Pivot g = {g}: turning effect on the left Σp·(g − x) = {l}, on the right Σp·(x − g) = {r}, net {tq}; {state}. ',
    s0level: 'the beam is level', s0right: 'the right side is heavier and the beam tips right', s0left: 'the left side is heavier and the beam tips left',
    s0formula: 'Balance point = expected value E = {terms} = {E} yuan.',
    s0hidden: '(Once the beam is level, the sum for the balance point appears here.)',
    s0hint: 'What to try: pick a game and drag the pivot until the beam is level (each time you let go, a grey notch stays on the number line); press the button if you get stuck. Then switch to “¥12 on a six”: almost all the weight sits on 0, yet the balance point is at 2, an amount no single play ever pays. Then try “Two dice, pay the larger”: the high faces are heavier, so the balance point moves right of 3.5.',

    s1k: 'Step 1 · The long run',
    s1t: 'No single play pays ¥3.5. In what sense is the expected value an “average”?',
    s1e: 'This step answers: E is the balance point of the scale, yet it is often not an amount any one play can pay. How does it relate to actually playing many times? Here we repeat <strong>the game you picked in step 0</strong> (simulated with a pseudo-random generator; plays do not influence one another). The <strong>running average</strong> is the money received so far divided by the number of plays. The <strong>law of large numbers</strong> says that when plays are independent and the rules never change, the running average gets as close to E as you like once n is large enough. How close is set by the <strong>standard deviation</strong> σ = √(Σ p·(x − E)²), the typical distance of a single play from E; the average of n plays sits a typical σ/√n from E. The green band is E ± 2σ/√n: in about 95% of replays the average lies inside it.',
    c1a: 'Running average (yuan) vs plays',
    c1b: 'Observed share (cyan) vs probability (dashes)',
    s1lgAvg: 'running average', s1lgE: 'expected value E', s1lgBand: 'E ± 2σ/√n (about 95% of replays stay inside)',
    play10: 'Play 10 more', play100: 'Play 100 more', play1000: 'Play 1000 more', reset1: 'Restart with new random numbers',
    s1empty: 'Nothing played yet. {name} has expected value E = {E} yuan. Press “Play 10 more” to start.',
    s1readout: '{n}/{N} plays: running average {m} yuan against E = {E}, a gap of {gap}; the band half-width 2σ/√n is now {w} (single-play standard deviation σ = {sd}). The average is {inside}.',
    inside: 'inside the band', outside: 'outside the band (about 5% of replays do this)',
    s1hint: 'What to try: press “Play 10 more” a few times and watch the cyan line swing wildly at first; then press “Play 1000 more” and see it settle into the narrowing green band while the cyan bars below approach the orange dashes. The horizontal axis is logarithmic: each major division is ten times more plays, yet the band only shrinks to about a third (√10 ≈ 3.16). Restart with new random numbers: the first few dozen plays look completely different, but every run closes in on E.',

    s2k: 'Step 2 · Fair price',
    s2t: 'Each play costs an entry fee c. What fee is fair?',
    s2e: 'This step answers: you know a play returns E yuan on average, so what should the entry fee c be? The <strong>net gain</strong> of one play is the payout minus c, and its expectation is E − c (a fixed amount comes straight out of an expectation). When E − c = 0 nobody has the edge, so c = E is the <strong>fair price</strong>. When c is above E, the difference is what the house keeps per play on average; as a share of the fee, (c − E)/c, it is called the <strong>house edge</strong>. The top chart splits the average return E into each prize’s contribution p·x (probability × prize), laid end to end; the bottom chart follows five simulated players through 1000 plays each.',
    tk_roulette: 'Roulette, red: ¥10', tk_dice: 'Dice stall: ¥4', tk_scratch: 'Scratch card (made-up prizes): ¥10',
    c2a: 'Per play (yuan): paid vs returned on average',
    c2pay: 'You pay c = {c}', c2get: 'Average return E = {E}, split by prize',
    c2b: 'Five players’ net gain over 1000 plays (yuan)',
    s2lgPay: 'entry fee c', s2lgExp: 'expected net gain 1000·(E − c)', s2lgPath: 'simulated players’ cumulative net gain',
    tierItem: 'prize ¥{x} × probability {p} = {c}',
    c2: 'Entry fee c (yuan)', new2: 'Five new players',
    s2readout: 'Average return E = {E} yuan, fee c = {c}, expected net gain per play E − c = {net}: {verdict}. Over 1000 plays the expected net is {exp} yuan; these five players actually ended at {ends}.',
    s2fair: 'fair', s2house: 'house edge {edge}', s2player: 'the player has the edge (no casino would price it like this)',
    sep: ', ',
    s2hint: 'What to try: start with roulette. The pink fee bar sticks out a little past the row below it (¥0.27 per play, 2.7%), and most of the five lines follow the orange dashes downhill, though somebody can still be ahead after 1000 plays. Drag c to about E and the dashes go flat. Then switch to the scratch card: the ¥100,000 jackpot has a one-in-100,000 chance per card, yet it contributes as much to E (¥1) as the ¥10 prize. The chance of hitting it at all in 1000 cards is only about 1%, so the players’ lines usually end below the dashes; each ¥1000 win makes a line jump up.',

    s3k: 'Step 3 · Expectations add',
    s3t: 'Roll n dice and get paid their total. What is the expected value, and does it change if the dice are linked?',
    s3e: 'This step answers: how do you find the expected value of several random amounts added together? The answer is <strong>linearity of expectation</strong>: E[X + Y] = E[X] + E[Y], whether or not X and Y influence each other (split Σ p·(x + y) into two sums and you can see it). One die has expected value 3.5 (the balance point from step 0), so the total of n dice always has expected value 3.5n. Three ways of linking the dice test this: <strong>independent</strong> (each die rolled separately); <strong>all the same</strong> (roll one die and copy it); <strong>opposite pairs</strong> (dice come in pairs and the second shows 7 minus the first). Bars are the probabilities of each total; the orange triangle is the balance point (the expected value); the green bar is the balance point ± one standard deviation (the typical distance from it).',
    md_indep: 'Independent', md_same: 'All the same', md_mirror: 'Opposite pairs',
    n3: 'Number of dice n',
    c3title: 'Probability of each total of {n} dice',
    s3lgBar: 'probability of the total', s3lgE: 'balance point = expected value', s3lgSd: 'expected value ± one standard deviation',
    s3readout: '{mode}: expected value = {E}, 3.5 × n = {n35}, the same; standard deviation = {sd}. For comparison, independent dice give σ√n = {indep} and identical dice give σn = {same} (σ ≈ 1.708 is one die’s standard deviation).',
    s3hint: 'What to try: hold n = 4 and click the three linkings in turn. The bars change completely (a bell, six evenly spaced bars, a single bar) while the orange triangle never moves from 14. Then drag n: the triangle steps right by 3.5 each time. The expected value only says where the centre is, not how spread out the total is; the spread is measured by the standard deviation, and that does depend on how the dice are linked.',

    s4k: 'Step 4 · Insurance',
    s4t: 'The insurer expects to make money from you. Is buying insurance a mistake?',
    s4e: 'This step answers: the premium is (1 + loading) × the expected payout, more than your expected loss, so by step 2 you are on the losing side. Why do people buy? Setting: a house burns down in a given year with probability p, a loss of ¥200,000 (otherwise nothing). Without insurance your <strong>expected loss</strong> is p × 200,000, but the actual outcome is one of only two: 0, or ¥200,000 at once. With insurance you pay the premium for certain and nothing else can happen. The insurer sells N such policies and the fires are <strong>unrelated to one another</strong>; what matters to it is the average payout per policy, 200,000 × number of fires ÷ N. By step 1, that average typically wobbles by σ/√N, so it narrows as N grows (<a class="xlink" href="../../../probability/stochastic/risk-pooling/#step1">→ Risk pooling, step 1: what happens to the loss per person when many people pool</a>).',
    c4a: 'You: your loss after one year (yuan)',
    c4no: 'No insurance: dot area ∝ probability', c4yes: 'Insured: the premium, for certain',
    c4b: 'Insurer: payout per policy (yuan), N = {N}',
    s4lgSafe: 'no fire / payout within the premium', s4lgHit: 'fire loss / payout above the premium', s4lgE: 'expected loss p × 200,000 (triangle above, dashes below)', s4lgPrem: 'premium',
    p4: 'Yearly fire probability p', l4: 'Loading', n4: 'Insurer’s number of policies N',
    s4readout: 'You: uninsured, your expected loss is {pL} yuan, but the real outcome is 0 or {L}, the latter with probability {pp}% (standard deviation for one house {sd}); insured, you pay {prem} for certain, {extra} more than the expected loss. Insurer: with {N} policies the average payout per policy has a standard deviation of only {sdN}, while it charges {extra} extra per policy; the chance that total payouts exceed total premiums is {pl} (exact binomial calculation). {off}',
    s4off: 'A further {o} of the probability lies off the right edge of the chart.',
    s4hint: 'What to try: drag N all the way right (100,000). The bars squeeze into a narrow peak almost entirely left of the green premium line, so the insurer almost surely profits. Now drag the loading to 0%: the premium line sits on the dashes, and the chance that payouts exceed premiums no longer vanishes with N; it actually creeps towards one half (about 49% at N = 100,000), which is why an insurer must charge a loading. Finally look at the top chart: for you there is only one outcome, 0 or 200,000, and no average to lean on.',

    s5k: 'Step 5 · The St Petersburg paradox',
    s5t: 'A game with an infinite expected value: how much would you pay to play once?',
    s5e: 'This step answers: if an expected value can be infinite, then by “fair price = expected value” any fee would be worth paying. Is that right? The rules: toss a fair coin until the first head; if it arrives on toss k you receive 2<sup>k</sup> yuan. Tier k has probability 1/2<sup>k</sup> and prize 2<sup>k</sup>, so <strong>every tier contributes exactly ¥1 to the expected value</strong>; there are infinitely many tiers, so the expected value is infinite. A real casino can pay at most 2<sup>K</sup> yuan (tier K and beyond all pay 2<sup>K</sup>), and then the expected value is K + 1. The top chart is the running average; the bottom chart splits that average by tier: tier k contributes (games that ended in tier k) × 2<sup>k</sup> ÷ (all games). In theory (orange dashes) that is 1 per tier, and 2 for the capped tier.',
    c5a: 'Running average (yuan) vs games played',
    c5b: 'Each tier’s share of the average (yuan), K = {K}',
    s5lgAvg: 'running average', s5lgE: 'expected value K + 1 (with the cap)', s5lgLog: 'reference line log₂n + 2', s5lgOver: 'contribution above the top of the chart',
    k5: 'Cap tier K (the casino pays at most 2^K yuan)', k5cap: 'Cap (yuan): ',
    play5a: 'Play 100 more', play5b: 'Play 1000 more', reset5: 'Restart with new random numbers',
    s5empty: 'Cap K = {K}, at most {cap} yuan, expected value {E} yuan. Press “Play 100 more” to start.',
    s5readout: '{n} games played: running average {m} yuan, expected value {E} (K = {K}). {small} of the games paid only 2 or 4 yuan; the biggest single payout was {mx}. The reference line is at {lg} here.',
    s5hint: 'What to try: keep K = 20 (a cap of about a million yuan, expected value 21) and press “Play 1000 more” up to 10,000 games. Most of the time the running average climbs roughly along the grey dotted line, below the orange dashes; now and then one huge payout kicks it far up, after which it slowly sinks back; below, the first tiers sit near 1, most later ones are 0, and now and then one shoots above the chart (pink triangle). To see all those rare tiers you would need about 2^K games. Now drag K to 3: the expected value is only 4, and within a few hundred games the average settles on the dashes. Moving K clears the games played. The dotted line log₂n + 2 is an empirical guide (over many replays the median running average grows roughly along it), not an exact prediction.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What the expected value can and cannot tell you',
    s6fin: 'The expected value is the <strong>balance point</strong> of a distribution: each outcome times its probability, added up. Its meaning comes from <strong>repetition</strong>: play independently many times and the running average closes in on it, off by about σ/√n. That makes it the right ledger for anyone who bets over and over (a casino, an insurer), and it gives “fair price” and “house edge” precise meanings. Expected values also add, with no need for independence. But the expected value says where the centre is, not how spread out things are. When you play only once and the loss would cripple you, or when most of the expected value hides in outcomes that almost never occur (St Petersburg), the expected value alone leads to bad decisions.',
    formula: 'E = Σ p·x (the balance point)\nrunning average → E, off by about σ/√n (independent repeats)\nE[X + Y] = E[X] + E[Y] (no independence needed)',
    boundary: 'Scope: the dice, coins and roulette wheel here are ideal fair devices; random outcomes come from a seeded pseudo-random generator; the fire probability and the ¥200,000 loss are teaching values, and the insurance step assumes houses burn independently (one flood that hits everyone breaks this); the scratch-card prizes are made up. Utility, taxes and limited bankrolls are not covered, and none of this is gambling or insurance advice.',
    linksTitle: 'Where to go next',
    lk1: '→ Probability distributions, step 1: the mean is not the most common value but the probability-weighted centre',
    lk2: '→ Monte Carlo, step 1: with more trials, frequencies show the probabilities',
    lk3: '→ Risk pooling, step 1: what happens to the loss per person when many people pool',
    lk4: '→ Multi-armed bandits, step 0: when the expected values are unknown, which machine is worth pulling',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Expected Value · Lotteries, Dice and Insurance on One Scale”.'
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
  if (typeof window.refreshExpectedValue === 'function') window.refreshExpectedValue();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EV_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
