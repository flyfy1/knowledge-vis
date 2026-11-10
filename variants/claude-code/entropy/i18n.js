'use strict';
// Entropy lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '熵 · 平均要问几个是非题',
    back: '← 知识索引',
    compare: '对照另一版本：熵 · 惊讶的平均值 →',
    navLabel: '熵步骤导航',
    tagline: '朋友心里想着一个答案，你只能问「是不是」，平均要问几次才能猜中？这个次数有一个下限，它只取决于各种答案的概率，叫作熵。七步里你会从猜数游戏出发，得到「惊讶」的公式，再看熵怎样成为压缩的极限，以及用错了概率要多付多少。',
    nav0: '0 猜数', nav1: '1 惊讶', nav2: '2 硬币', nav3: '3 六种天气', nav4: '4 压缩', nav5: '5 用错概率', nav6: '6 收束',

    sym_sun: '晴', sym_cloud: '多云', sym_rain: '雨', sym_fog: '雾', sym_snow: '雪', sym_hail: '冰雹',

    s0k: '第 0 步 · 猜数游戏',
    s0t: 'N 种情况一样可能，至少要问几个是非题才能确定是哪一种？',
    s0e: '这一步要回答：朋友从 N 张牌里随机选了一张，每张被选中的可能一样大；你只能问回答「是」或「否」的问题，最少要问几个？最省的问法是每次把剩下的牌分成尽量相等的两份，问「是不是在前一份里」。不管回答是什么，都能排除大约一半。下图上方是 N 张牌，每一行是一个问题之后还剩下的牌（青色）。答案「是」和「否」一样可能时，一个问题带来的信息定为 <strong>1 比特</strong>。',
    c0aria: '猜数游戏：每个问题之后剩下的牌，以及历次游戏所用的问题数',
    lg0Left: '还剩下的候选', lg0Out: '已排除', lg0Secret: '朋友选的牌', lg0Avg: '平均问题数（理论）',
    nItems: '牌的张数 N', play0: '玩一局（自动对半问）', many0: '连玩 50 局', clear: '清空',
    c0top: '每问一次，剩下的牌', c0bot: '历次游戏用了几个问题（纵轴：局数）',
    s0readout: 'N = {N}：log₂ N = {lg}。对半问时每局要问 {k} 或 {k1} 个问题，平均 {avg} 个。{played}',
    s0readoutPow: 'N = {N}：log₂ N = {lg}。N 是 2 的幂，每局恰好问 {k} 个问题。{played}',
    s0played: '已玩 {g} 局，平均用了 {m} 个问题。',
    s0cleared: '（改了 N，之前的记录已清空。）',
    s0hint: '观察顺序：先保持 N = 8，按「玩一局」：三行之后只剩一张，每局都是 3 个问题，log₂ 8 = 3。再把 N 拖到 6 并「连玩 50 局」：有的局 2 个问题，有的 3 个，平均约 2.67，比 log₂ 6 ≈ 2.585 略多，因为 6 张牌不能每次正好分成两半。N 翻一倍，只多一个问题，这就是对数。（同样的「每次砍半」也是<a class="xlink" href="../../../computing/algorithms/binary-search/#step1">二分查找第 1 步：每次砍掉一半</a>。）',

    s1k: '第 1 步 · 惊讶',
    s1t: '一件概率为 p 的事发生了，它带来多少信息？',
    s1e: '这一步要回答：上一步每张牌的概率都是 1/N，信息是 log₂ N 比特；概率不相等时，单个结果的信息怎么算？把一件事发生时的信息量叫作它的<strong>惊讶度</strong>，记 I(p)。我们要求它满足：越不可能的事越惊讶；两件<strong>独立</strong>（互不影响）的事同时发生，概率相乘，惊讶应该相加。满足「乘法变加法」的只有对数，所以 <strong>I(p) = −log₂ p</strong>（单位比特）。p = 1/2 时是 1 比特，p = 1/8 时是 3 比特，正好对上第 0 步的 log₂ N。确定会发生的事（p = 1）不带来任何信息。',
    c1aria: '惊讶度曲线，以及两件独立事件的惊讶相加与概率相乘的对照',
    lg1A: '事件 A', lg1B: '事件 B', lg1AB: 'A 和 B 同时发生（概率相乘）',
    p1a: '事件 A 的概率', p1b: '事件 B 的概率',
    c1top: '惊讶度 I(p) = −log₂ p（比特）', c1mid: '用 −log₂ p：A 的惊讶 + B 的惊讶 与 一起发生的惊讶', c1bot: '换成 1/p：A 的 + B 的 与 一起发生的',
    s1readout: 'I(A) = {ia} 比特，I(B) = {ib} 比特，相加 {sum}；A、B 一起发生的概率 {pab}，I = {iab} 比特，相等。若用 1/p 当惊讶：{ra} + {rb} = {rsum}，而 1/(p·q) = {rab}，对不上。',
    s1hint: '观察顺序：拖两个滑杆，看中间一行：青色和橙色接起来的长度，总是等于绿色那一条。再看最下一行同样的比较换成 1/p：两条长度一般对不上（只有两个概率之和恰好为 1 时才凑巧相等）。把 A 的概率拖到 1：I = 0，它的青色段消失，必然发生的事没有信息。',

    s2k: '第 2 步 · 一枚不公平的硬币',
    s2t: '正面概率是 0.9 的硬币，平均每次抛出多少信息？',
    s2e: '这一步要回答：结果有好几种、概率各不相同时，平均每次得到多少信息？把每种结果的惊讶度按它的概率加权平均，就是<strong>熵</strong>：H = Σ p·(−log₂ p)。对一枚正面概率为 p 的硬币，H(p) = p·(−log₂ p) + (1 − p)·(−log₂(1 − p))。上图横轴是 p，白线是 H(p)；竖线上青色、橙色两段是正面、反面各自贡献的 p·I。下图是一次模拟：抛 200 次，每抛一次记下这次结果的惊讶度，画出到目前为止的平均值。',
    c2aria: '硬币的熵随正面概率变化的曲线，以及抛硬币的累计平均惊讶',
    lg2H: '熵 H(p)', lg2Heads: '正面贡献 p·I(正)', lg2Tails: '反面贡献 (1 − p)·I(反)', lg2Run: '平均惊讶（模拟，旧的变灰）',
    pCoin: '正面概率 p', flip2: '抛 200 次',
    c2top: '硬币的熵 H(p)（比特）', c2bot: '前 n 次的平均惊讶（横轴：抛的次数）',
    s2readout: 'p = {p}：正面惊讶 {ih} 比特，反面 {it} 比特；熵 H = {h} 比特。{run}',
    s2run: '这次抛了 {n} 次，平均惊讶 {m}。',
    s2hint: '观察顺序：先在 p = 0.9 按「抛 200 次」：正面出得多，每次只带来 0.15 比特；偶尔的反面带来 3.3 比特，下图曲线被它往上拽一下，再慢慢落回。多按几次，旧的路径变灰，都向白色虚线 H = 0.469 靠拢。再拖 p：H 在 p = 0.5 时最大（1 比特），在 0 或 1 附近趋向 0；越能猜到结果，平均信息越少。',

    s3k: '第 3 步 · 六种天气',
    s3t: '六种结果、概率不均时，熵怎么看？',
    s3e: '这一步要回答：结果不止两种时，熵由什么决定？设想一个地方的天气只有六种，概率由「集中程度」α 控制：α = 0 时六种一样可能，α 越大越偏向「晴」。上图是各天气的概率。下图把熵画成面积：每种天气是一个矩形，宽度是它的概率 p，高度是它的惊讶度 −log₂ p；所有矩形宽度加起来是 1，面积加起来就是熵 H，也就是矩形的平均高度（虚线）。',
    c3aria: '六种天气的概率，以及以概率为宽、惊讶度为高的面积图',
    alpha: '集中程度 α（0 = 六种一样可能）',
    c3top: '各天气的概率', c3bot: '宽 = 概率，高 = 惊讶度（比特）；虚线 = 熵 H',
    lg3H: '熵 H（平均高度）',
    s3readout: 'α = {a}：H = {h} 比特（最大可能值 log₂ 6 = {max}）。最常见的「{top}」惊讶 {itop} 比特，最少见的「{low}」惊讶 {ilow} 比特。',
    s3hint: '观察顺序：先拖到 α = 0：六个矩形一样宽一样高，H = log₂ 6 ≈ 2.585，这是六种结果能有的最大熵。再往右拖：罕见天气的矩形越来越高，却也越来越窄，对面积的贡献反而变小；「晴」的矩形变宽变矮。总面积 H 一路下降：结果越可预测，平均信息越少。',

    s4k: '第 4 步 · 压缩的极限',
    s4t: '要把天气记录写成 0 和 1，平均每天最少要几个比特？',
    s4e: '这一步要回答：给每种天气分配一串 0/1（码字），常见的用短码、罕见的用长码，平均每天最少要几位？码字之间不能有一个是另一个的开头（<strong>前缀码</strong>），这样一串 0/1 才能唯一读回。<strong>哈夫曼编码</strong>是一种做法：反复把两个概率最小的合并成一个，最后长成一棵树，从树根走到某种天气，左 0 右 1，就是它的码字。上图就是这棵树，下表是每种天气的码字。香农证明：任何前缀码的平均码长 L 都不小于熵 H，而哈夫曼码满足 <strong>H ≤ L &lt; H + 1</strong>。下图比较一次编 1 天、2 天、3 天（把几天的天气合成一个符号再编码）时，平均每天用几位。',
    c4aria: '哈夫曼编码树，以及按块编码时每天的平均码长与熵的比较',
    lg4Block: '平均码长 L（每天）', lg4H: '熵 H', lg4Bound: '上界 H + 1/k',
    c4top: '哈夫曼树（叶子 = 天气，层数 = 码长）', c4bot: '一次编 k 天，平均每天的码长（比特）',
    th_sym: '天气', th_p: '概率', th_i: '惊讶 −log₂ p', th_code: '码字', th_len: '码长',
    encode4: '随机抽 1000 天来编码',
    s4readout: 'α = {a}：H = {h}，哈夫曼平均码长 L = {l}（≥ H 且 < H + 1）。一次编 2 天：每天 {l2}；3 天：每天 {l3}。{enc}',
    s4enc: '抽了 1000 天，编码共 {bits} 位，每天 {per} 位。',
    s4hint: '观察顺序：先在 α = 0.5 看表：最常见的天气码字最短。按「随机抽 1000 天来编码」：每天用的位数接近 L，而 L 只比 H 多一点。再把 α 拖到 2：「晴」占 86%，单独编码时它至少也要 1 位，L = 1.156 远大于 H = 0.661；一次编 3 天，降到每天 0.683。块越大，越能贴近 H，但永远不会低于 H。',

    s5k: '第 5 步 · 用错了概率',
    s5t: '按错误的概率设计编码，要多付多少比特？',
    s5e: '这一步要回答：真实的天气按 p 出现，你却以为是 q，并按 q 给每种天气分配了 −log₂ q 位的码（码长与惊讶度一致的理想编码），平均每天要用多少位？答案是<strong>交叉熵</strong> H(p, q) = Σ p·(−log₂ q)：权重仍是真实频率 p，长度却是按 q 定的。它永远不小于 H(p)，多出来的部分叫 <strong>KL 散度</strong>：D(p‖q) = H(p, q) − H(p) ≥ 0，只有 q = p 时为 0。上图每个矩形宽 = 真实概率 p，橙色高 = 按 q 定的码长，青色虚线高 = 按 p 定的码长；两者面积之差就是 KL。下图是交叉熵随模型 α 的变化。',
    c5aria: '按模型分布编码时的面积图，以及交叉熵随模型参数的变化',
    lg5Q: '按模型 q 的码长 −log₂ q', lg5P: '按真实 p 的码长 −log₂ p', lg5Curve: '交叉熵 H(p, q)，随模型 α',
    alphaP: '真实分布的 α', alphaQ: '模型 q 的 α', zero5: '模型认定「冰雹」不可能（q = 0）',
    c5top: '宽 = 真实概率 p，高 = 码长（比特）', c5bot: '交叉熵随模型 α（虚线 = 真实熵 H(p)）',
    s5readout: 'H(p) = {h}，交叉熵 H(p, q) = {ce}，KL = {kl} 比特：每天平均多用 {kl} 位。',
    s5inf: 'H(p) = {h}，交叉熵 = ∞：冰雹真实概率 {ph} > 0，模型却给它 q = 0，按模型它的码长是无穷大，一次冰雹就无法编码。',
    s5hint: '观察顺序：保持真实 α = 0.5，把模型 α 从 −1 拖到 2：下图曲线在模型 α = 0.5 处最低，正好等于 H(p) = 2.157，两边都抬高；模型 α = 1.5 时交叉熵 3.02，多付 0.862 比特。上图在模型更集中时，罕见天气的橙色柱高出虚线很多。最后按「模型认定冰雹不可能」：交叉熵变成无穷大。机器学习分类器训练时最小化的正是交叉熵，所以模型不该给真实可能发生的事零概率。',

    s6k: '第 6 步 · 收束',
    s6t: '一个数，三种读法',
    s6fin: '熵 H = Σ p·(−log₂ p) 有三种读法：<strong>平均惊讶</strong>，每个结果的信息按概率加权；<strong>平均问题数的下限</strong>，最聪明的是非题策略平均也要问这么多；<strong>压缩极限</strong>，任何前缀码平均每个符号至少用 H 位，按块编码可以任意接近。用错的分布 q 去编码，要多付 KL 散度 D(p‖q) 那么多位。',
    formula: 'I(p) = −log₂ p\nH(p) = Σ pᵢ·(−log₂ pᵢ) ≤ log₂ N\nH(p) ≤ L(哈夫曼) < H(p) + 1\nH(p, q) = H(p) + D(p‖q)',
    boundary: '适用范围：本页假设每天的天气彼此独立、概率不变；真实天气前后相关，利用前一天的信息可以压得更短（条件熵更小）。熵只看概率，不看「意义」。码长 −log₂ q 是理想值，实际码长要取整。热力学里的熵（玻尔兹曼、吉布斯）与这里的公式同形，只差一个常数和对数底，但描述的是物理系统的微观状态数。',
    linksTitle: '接着去看',
    lk1: '决策树第 0 步：用熵量一组数据有多「混」 →',
    lk2: '决策树第 1 步：信息增益，选能让熵降得最多的那一刀 →',
    lk3: '大模型采样第 1 步：温度怎样把下一个词的分布捏尖或摊平 →',
    lk4: '二分查找第 3 步：每次砍半，所以只要 log₂ n 步 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《熵 · 惊讶的平均值》的平行版本。'
  },
  en: {
    pageTitle: 'Entropy · How Many Yes/No Questions, on Average',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Entropy · The Average of Surprise →',
    navLabel: 'Entropy step navigation',
    tagline: 'A friend has an answer in mind and you may only ask yes/no questions. How many do you need, on average? There is a floor to that number, set only by the probabilities of the possible answers. It is called entropy. In seven steps you will go from a guessing game to the formula for “surprise”, see why entropy is the limit of compression, and measure what it costs to use the wrong probabilities.',
    nav0: '0 Guessing', nav1: '1 Surprise', nav2: '2 A coin', nav3: '3 Six weathers', nav4: '4 Compression', nav5: '5 Wrong odds', nav6: '6 Wrap-up',

    sym_sun: 'sun', sym_cloud: 'cloud', sym_rain: 'rain', sym_fog: 'fog', sym_snow: 'snow', sym_hail: 'hail',

    s0k: 'STEP 0 · A GUESSING GAME',
    s0t: 'With N equally likely possibilities, how few yes/no questions pin down the answer?',
    s0e: 'This step asks: a friend picks one of N cards at random, each equally likely, and you may only ask questions answered “yes” or “no”. What is the fewest you need? The thriftiest strategy splits the remaining cards into two piles as equal as possible and asks “is it in the first pile?”. Whatever the answer, about half the cards are ruled out. The top of the chart shows the N cards; each row shows the cards still in play (cyan) after one more question. When “yes” and “no” are equally likely, the information from one answer is defined as <strong>1 bit</strong>.',
    c0aria: 'Guessing game: the cards left after each question, and how many questions each game took',
    lg0Left: 'Still possible', lg0Out: 'Ruled out', lg0Secret: 'The friend’s card', lg0Avg: 'Average questions (theory)',
    nItems: 'Number of cards N', play0: 'Play one game (halving)', many0: 'Play 50 games', clear: 'Clear',
    c0top: 'Cards left after each question', c0bot: 'Questions used per game (up: number of games)',
    s0readout: 'N = {N}: log₂ N = {lg}. Halving takes {k} or {k1} questions per game, {avg} on average. {played}',
    s0readoutPow: 'N = {N}: log₂ N = {lg}. N is a power of 2, so every game takes exactly {k} questions. {played}',
    s0played: 'Games played: {g}; {m} questions on average.',
    s0cleared: '(N changed, so the earlier record was cleared.)',
    s0hint: 'What to try: keep N = 8 and press “Play one game”: after three rows one card is left, and every game takes 3 questions — log₂ 8 = 3. Then drag N to 6 and press “Play 50 games”: some games take 2 questions and some 3, about 2.67 on average, a little more than log₂ 6 ≈ 2.585, because 6 cards cannot always be split exactly in half. Doubling N costs just one more question; that is what a logarithm is. (The same halving drives <a class="xlink" href="../../../computing/algorithms/binary-search/#step1">binary search, step 1: cut the range in half each time</a>.)',

    s1k: 'STEP 1 · SURPRISE',
    s1t: 'An event of probability p has happened. How much information does it carry?',
    s1e: 'This step asks: in the last step every card had probability 1/N and carried log₂ N bits; when probabilities differ, what is the information in a single outcome? Call the information an event delivers when it happens its <strong>surprise</strong>, I(p). We ask two things of it: the less likely the event, the bigger the surprise; and when two <strong>independent</strong> events (neither affects the other) both happen, their probabilities multiply, so their surprises should add. Only the logarithm turns multiplication into addition, so <strong>I(p) = −log₂ p</strong>, in bits. p = 1/2 gives 1 bit and p = 1/8 gives 3 bits, matching step 0’s log₂ N. A certain event (p = 1) carries no information at all.',
    c1aria: 'The surprise curve, and how surprises add while probabilities multiply for two independent events',
    lg1A: 'Event A', lg1B: 'Event B', lg1AB: 'A and B together (probabilities multiply)',
    p1a: 'Probability of A', p1b: 'Probability of B',
    c1top: 'Surprise I(p) = −log₂ p (bits)', c1mid: 'With −log₂ p: surprise of A + of B vs. of both together', c1bot: 'With 1/p instead: A’s + B’s vs. both together',
    s1readout: 'I(A) = {ia} bits, I(B) = {ib} bits, sum {sum}; A and B together have probability {pab}, I = {iab} bits — equal. Using 1/p as surprise: {ra} + {rb} = {rsum}, but 1/(p·q) = {rab} — no match.',
    s1hint: 'What to try: drag the two sliders and watch the middle row: the cyan and orange segments joined end to end always match the green bar. The bottom row makes the same comparison with 1/p, and the lengths generally disagree (they only match by coincidence when the two probabilities add up to exactly 1). Drag A’s probability to 1: I = 0 and its cyan segment vanishes — a certain event tells you nothing.',

    s2k: 'STEP 2 · AN UNFAIR COIN',
    s2t: 'A coin lands heads 90% of the time. How much information does each toss give, on average?',
    s2e: 'This step asks: with several outcomes of unequal probability, how much information do you get per trial on average? Weight each outcome’s surprise by its probability and add them up; that is <strong>entropy</strong>: H = Σ p·(−log₂ p). For a coin with heads probability p, H(p) = p·(−log₂ p) + (1 − p)·(−log₂(1 − p)). In the top chart p runs across and the white curve is H(p); the cyan and orange pieces of the vertical line are the shares p·I contributed by heads and by tails. The bottom chart is a simulation: toss 200 times, record the surprise of each result, and plot the running average.',
    c2aria: 'The entropy of a coin against its heads probability, and the running average surprise of simulated tosses',
    lg2H: 'Entropy H(p)', lg2Heads: 'Heads share p·I(heads)', lg2Tails: 'Tails share (1 − p)·I(tails)', lg2Run: 'Average surprise (simulated; older runs grey)',
    pCoin: 'Heads probability p', flip2: 'Toss 200 times',
    c2top: 'Entropy of the coin H(p) (bits)', c2bot: 'Average surprise of the first n tosses (n across)',
    s2readout: 'p = {p}: heads carries {ih} bits, tails {it} bits; entropy H = {h} bits. {run}',
    s2run: 'This run: {n} tosses, average surprise {m}.',
    s2hint: 'What to try: at p = 0.9 press “Toss 200 times”. Heads come up often and bring only 0.15 bits each; the occasional tails brings 3.3 bits and yanks the bottom curve up before it settles again. Press a few more times: older paths turn grey, and all drift toward the white dashed line H = 0.469. Then drag p: H peaks at p = 0.5 (1 bit) and sinks toward 0 near either end — the easier the outcome is to guess, the less you learn on average.',

    s3k: 'STEP 3 · SIX KINDS OF WEATHER',
    s3t: 'With six outcomes of unequal probability, how should we picture entropy?',
    s3e: 'This step asks: with more than two outcomes, what sets the entropy? Imagine a place with just six kinds of weather, whose probabilities are set by a “concentration” α: at α = 0 all six are equally likely, and larger α tilts the odds toward sun. The top chart shows each weather’s probability. The bottom chart draws entropy as area: each weather is a rectangle whose width is its probability p and whose height is its surprise −log₂ p. The widths add up to 1, so the total area is the entropy H, which is also the average height (dashed line).',
    c3aria: 'Probabilities of six kinds of weather, and an area chart with probability as width and surprise as height',
    alpha: 'Concentration α (0 = all six equally likely)',
    c3top: 'Probability of each weather', c3bot: 'Width = probability, height = surprise (bits); dashed = H',
    lg3H: 'Entropy H (average height)',
    s3readout: 'α = {a}: H = {h} bits (the most possible is log₂ 6 = {max}). The most common, “{top}”, carries {itop} bits of surprise; the rarest, “{low}”, {ilow} bits.',
    s3hint: 'What to try: drag to α = 0 first: six rectangles of equal width and height, H = log₂ 6 ≈ 2.585, the largest entropy six outcomes can have. Then drag right: the rare weathers’ rectangles get taller but also narrower, so they contribute less area, while sun’s rectangle gets wider and lower. The total area H keeps falling: the more predictable the outcome, the less you learn on average.',

    s4k: 'STEP 4 · THE LIMIT OF COMPRESSION',
    s4t: 'Writing the weather log in 0s and 1s, how few bits per day can you get away with?',
    s4e: 'This step asks: give each weather a string of 0s and 1s (a codeword), short ones for common weather and long ones for rare weather — how few bits per day are needed on average? No codeword may be the start of another (a <strong>prefix code</strong>), so that a stream of bits reads back uniquely. <strong>Huffman coding</strong> is one way to build one: keep merging the two least likely items into one until a single tree remains; the path from the root to a weather, 0 for left and 1 for right, is its codeword. The top chart is that tree and the table lists the codewords. Shannon proved that no prefix code can have average length L below the entropy H, and Huffman’s code achieves <strong>H ≤ L &lt; H + 1</strong>. The bottom chart compares coding 1, 2 or 3 days at a time (treating several days’ weather as one symbol) by the bits used per day.',
    c4aria: 'The Huffman code tree, and the bits per day when coding blocks of days compared with the entropy',
    lg4Block: 'Average code length L (per day)', lg4H: 'Entropy H', lg4Bound: 'Upper bound H + 1/k',
    c4top: 'Huffman tree (leaves = weather, depth = code length)', c4bot: 'Coding k days at once: bits per day',
    th_sym: 'Weather', th_p: 'Probability', th_i: 'Surprise −log₂ p', th_code: 'Codeword', th_len: 'Length',
    encode4: 'Encode 1000 random days',
    s4readout: 'α = {a}: H = {h}, Huffman average length L = {l} (≥ H and < H + 1). Coding 2 days at once: {l2} per day; 3 days: {l3} per day. {enc}',
    s4enc: 'Drew 1000 days; the encoding used {bits} bits, {per} per day.',
    s4hint: 'What to try: at α = 0.5 read the table: the commonest weather gets the shortest codeword. Press “Encode 1000 random days”: the bits per day land close to L, and L is only a little above H. Then drag α to 2: sun is 86% of days, yet on its own it still needs at least 1 bit, so L = 1.156 is far above H = 0.661; coding 3 days at a time brings it down to 0.683 per day. Bigger blocks get ever closer to H but never below it.',

    s5k: 'STEP 5 · THE WRONG PROBABILITIES',
    s5t: 'Design the code with the wrong probabilities, and how many extra bits do you pay?',
    s5e: 'This step asks: the weather really follows p, but you believe q and give each weather a codeword of −log₂ q bits (the ideal code whose lengths match the surprises). How many bits per day do you use on average? The answer is the <strong>cross-entropy</strong> H(p, q) = Σ p·(−log₂ q): the weights are still the true frequencies p, but the lengths come from q. It is never below H(p), and the excess is the <strong>KL divergence</strong>: D(p‖q) = H(p, q) − H(p) ≥ 0, zero only when q = p. In the top chart each rectangle is as wide as the true probability p; the orange height is the length set by q, the cyan dashed height the length set by p, and the difference in area is the KL divergence. The bottom chart shows the cross-entropy as the model’s α changes.',
    c5aria: 'Area chart for coding with the model distribution, and cross-entropy against the model parameter',
    lg5Q: 'Length from model q, −log₂ q', lg5P: 'Length from the truth p, −log₂ p', lg5Curve: 'Cross-entropy H(p, q) against the model α',
    alphaP: 'α of the true distribution', alphaQ: 'α of the model q', zero5: 'Model rules out hail (q = 0)',
    c5top: 'Width = true probability p, height = code length (bits)', c5bot: 'Cross-entropy against model α (dashed = true entropy H(p))',
    s5readout: 'H(p) = {h}, cross-entropy H(p, q) = {ce}, KL = {kl} bits: {kl} extra bits per day on average.',
    s5inf: 'H(p) = {h}, cross-entropy = ∞: hail really happens with probability {ph} > 0, but the model gives it q = 0, so its codeword would be infinitely long and a single hailstorm cannot be encoded.',
    s5hint: 'What to try: keep the true α = 0.5 and drag the model α from −1 to 2. The bottom curve bottoms out at model α = 0.5, exactly at H(p) = 2.157, and rises on both sides; at model α = 1.5 the cross-entropy is 3.02, an extra 0.862 bits. In the top chart, a more concentrated model pushes the orange bars of rare weather far above the dashed ones. Finally press “Model rules out hail”: the cross-entropy becomes infinite. Classifiers in machine learning are trained by minimising exactly this cross-entropy, which is why a model should never give zero probability to something that can really happen.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'One number, three readings',
    s6fin: 'Entropy H = Σ p·(−log₂ p) reads three ways: <strong>average surprise</strong>, each outcome’s information weighted by its probability; <strong>a floor on the average number of questions</strong>, which even the cleverest yes/no strategy cannot beat; and <strong>the limit of compression</strong>: any prefix code needs at least H bits per symbol on average, and coding in blocks gets arbitrarily close. Coding with the wrong distribution q costs an extra D(p‖q) bits, the KL divergence.',
    formula: 'I(p) = −log₂ p\nH(p) = Σ pᵢ·(−log₂ pᵢ) ≤ log₂ N\nH(p) ≤ L(Huffman) < H(p) + 1\nH(p, q) = H(p) + D(p‖q)',
    boundary: 'Where it holds: this page assumes each day’s weather is independent with fixed probabilities; real weather is correlated from day to day, and using yesterday’s weather compresses further (the conditional entropy is smaller). Entropy looks only at probabilities, never at “meaning”. Code lengths −log₂ q are ideal values; real codewords must be whole bits. Thermodynamic entropy (Boltzmann, Gibbs) has the same form up to a constant and the base of the logarithm, but it counts the microscopic states of a physical system.',
    linksTitle: 'Where to next',
    lk1: 'Decision trees, step 0: using entropy to measure how “mixed” a group is →',
    lk2: 'Decision trees, step 1: information gain — the cut that lowers entropy most →',
    lk3: 'LLM sampling, step 1: how temperature sharpens or flattens the next-word distribution →',
    lk4: 'Binary search, step 3: halving each time means only log₂ n steps →',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Entropy · The Average of Surprise”.'
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
  if (typeof window.refreshEntropy === 'function') window.refreshEntropy();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ENTROPY_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
