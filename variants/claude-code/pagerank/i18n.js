'use strict';
// PageRank lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'PageRank · 链接是带权重的选票',
    back: '← 知识索引',
    compare: '对照另一版本：PageRank · 随机冲浪者最后停在哪 →',
    navLabel: 'PageRank 步骤导航',
    tagline: '七张网页、十二条链接。谁最重要？数链入次数是一种答案，但一条来自重要页面的链接显然该比十条来自无名小站的更值钱。七步里你会把这个直觉变成一个可以算出来的数：先当它是选票，再当它是一个随机上网的人，最后看它怎样被陷阱、阻尼系数和刷链接改变。',
    nav0: '0 数选票', nav1: '1 随机冲浪', nav2: '2 迭代', nav3: '3 陷阱', nav4: '4 阻尼系数', nav5: '5 刷链接', nav6: '6 收束',

    s0k: '第 0 步 · 数选票',
    s0t: '被链接最多的页面，就是最重要的页面吗？',
    s0e: '这一步要回答：七张网页 A–G 之间有 12 条<strong>链接</strong>（箭头：从 X 指向 Y 表示 X 页上有一条通往 Y 的链接）。G 的<strong>链入数</strong>（指向它的箭头条数）最多，有 4 条；B 只有 1 条。按链入数排，G 第一。<strong>PageRank</strong> 换了一种数法：把每条链接当成一张选票，但票有轻重——一张页面把自己的分数<strong>平分</strong>给它的每条外链，再乘以 d = 0.85；另外每张页面都有一份人人相同的基本分 (1 − d)/7。于是：页面分数 = 基本分 + 所有指向它的页面传过来的份额。这个定义是循环的（分数取决于别人的分数），第 2 步会讲怎么解出来；这里先看结果。全部分数加起来等于 1。',
    c0a: '链接图（圆的面积 ∝ 所选指标）',
    c0b: '每页的 {metric}',
    byIn: '按链入数', byPr: '按 PageRank',
    metricIn: '链入数', metricPr: 'PageRank',
    pick0: '看哪一页怎样投票',
    s0hint: '观察顺序：先按「按链入数」，看 G 的圆最大。再按「按 PageRank」：G 缩小、B 变大——B 唯一的链入来自 A，而 A 只链向 B，A 的全部选票都给了它；G 的 4 张票来自 C、D、E、F，其中三张来自几乎没人链接的页面，而且每张都要和别的链接平分。再在「看哪一页怎样投票」里选 A 和 F，读数会算出它们每条外链带走多少分。',
    s0readout: '按 PageRank 排序：{order}。{page} 的分数 {score}，有 {outs} 条外链，每条带走 0.85 × {score} ÷ {outs} = {share}，分别给 {targets}。',
    s0dead: '{page} 没有外链。',

    s1k: '第 1 步 · 随机冲浪',
    s1t: 'PageRank 能不能理解成「一个人随便上网，最常待在哪」？',
    s1e: '这一步要回答：上一步那个循环定义到底在量什么？想象一个<strong>随机冲浪者</strong>：每一步，他以概率 d = 0.85 从当前页面的外链里随机点一条；以概率 1 − d = 0.15 厌倦了，随机跳到七张页面中的任意一张（这叫<strong>随机跳转</strong>）。走很多步之后，他停在每张页面上的<strong>频率</strong>（停留步数 ÷ 总步数）会稳定下来——这个长期频率正好等于上一步的 PageRank。随机数来自固定种子的伪随机数生成器。',
    c1a: '冲浪者的位置（橙点）与最近几步的路线',
    c1b: '停留频率随步数（横轴对数）：B 与 G',
    lgSurfer: '冲浪者', lgTrail: '最近 8 步（虚线 = 随机跳转）', lgB: 'B 的停留频率', lgG: 'G 的停留频率', lgPrLine: '虚线 = PageRank',
    walk1: '走 1 步', walk100: '走 100 步', walkAuto: '连续走到 20000 步', reset1: '清零',
    s1hint: '观察顺序：先点几次「走 1 步」，看橙点沿箭头移动，偶尔随机跳到别处（虚线）。再点「连续走到 20000 步」：「停留频率」图里 B 和 G 的曲线一开始乱跳，然后分别贴向各自的虚线（PageRank）；最后 B 的频率稳定在 G 之上，和第 0 步的排序一致。读数里的 TV 是七张页面上「频率与 PageRank 之差」绝对值之和的一半，越小越吻合。',
    s1readout: '已走 {n} 步{prog}，其中随机跳转 {jumps} 次。B 的频率 {fb}（PageRank {pb}），G 的频率 {fg}（PageRank {pg}）。TV = {tv}。',
    s1empty: '还没走。点「走 1 步」或「连续走到 20000 步」。',
    s1prog: '（行走中）',

    s2k: '第 2 步 · 迭代',
    s2t: '不模拟冲浪者，怎样直接算出 PageRank？',
    s2e: '这一步要回答：与其让一个人走两万步，不如让「一大群冲浪者」同时走。设第 k 轮时冲浪者在各页的比例是 r<sub>k</sub>（七个数，和为 1）。下一轮，每页的人按规则分流：85% 平分到它的外链，15% 平均撒到七页上。于是 r<sub>k+1</sub> = 0.15/7 + 0.85 × （指向该页的各页比例 ÷ 它们的外链数之和）。这正是第 0 步的循环定义，只是左右两边分属相邻两轮。从 r<sub>0</sub> = 每页 1/7 出发反复做，这叫<strong>幂迭代</strong>（<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step3">→ 特征向量页第 3 步：幂迭代</a>）。衡量离终点多远用 L1 距离：七页上 |r<sub>k</sub> − 最终值| 之和。',
    c2a: '第 {k} 轮：各页比例（圆面积）',
    c2b: '离终点的 L1 距离随轮数（纵轴对数）',
    lgDist: '实际距离', lgBound: '虚线 = 上限 0.85^k × 初始距离',
    kSlider: '迭代轮数 k',
    play2: '从 k = 0 播放',
    s2hint: '观察顺序：按「从 k = 0 播放」或拖 k。圆从七个一样大开始，几轮之内 C、A、B 长大、D、E、F 缩小；「L1 距离」图里实线在对数坐标上一路下降。虚线是理论保证：每一轮距离至少乘以 d = 0.85。这张图上实际缩得更快：平均每轮约乘 0.64，单轮在 0.4 到 0.85 之间跳动（误差会在几张页面之间来回转）。各轮比例之和始终是 1。',
    s2readout: 'k = {k}：A {a}，B {b}，C {c}，G {g}；比例之和 {sum}。离终点的 L1 距离 {dist}{ratio}。',
    s2ratio: '，比上一轮缩小为 {r} 倍',

    s3k: '第 3 步 · 陷阱',
    s3t: '为什么一定要有「随机跳转」？',
    s3e: '这一步要回答：如果去掉随机跳转（d = 1），冲浪者只能顺着链接走，会出什么问题？两种网页结构会坏事。<strong>蜘蛛陷阱</strong>：一组页面只互相链接、没有链接出去（这里改成 F 和 G 只链向彼此），人走进去就出不来。<strong>死胡同</strong>：一张页面没有任何外链（这里去掉 G 的外链），人到这里无路可走。本页对死胡同的处理是：在死胡同的人全部随机跳到任意一页，就像它链向了所有七页。拖 d 看随机跳转的比例 1 − d 怎样救场。',
    c3a: '链接图：{variant}',
    c3b: '{what}随迭代轮数',
    vNormal: '原图', vTrap: '蜘蛛陷阱（F ⇄ G）', vDead: '死胡同（G 无外链）',
    whatTrap: 'F + G 两页的总比例', whatDead: '全部比例之和',
    lgCurD: '实线 = 当前 d', lgD1: '虚线 = d = 1（不跳转）', lgLeak: '虚线 = 不处理死胡同（份额直接丢掉）',
    dSlider3: '阻尼系数 d（跟随链接的概率）',
    s3hint: '观察顺序：选「蜘蛛陷阱」，看「F + G 两页的总比例」图：虚线（d = 1）一路爬向 100%，其余五页最终分数全是 0；实线（d = 0.85）停在约 64%。把 d 往 0.5 拖，陷阱的份额降到约 42%。再选「死胡同」：虚线（份额直接丢掉）里总和很快漏到约 49% 才停住（把 d 拖到 1 会一路漏到 0），分数加起来不再是 1；实线（按「跳到任意页」处理）始终是 1。',
    s3readout: '{variant}，d = {d}：{body}',
    s3bodyNormal: '各页分数：{scores}。',
    s3bodyTrap: 'F + G 最终占 {fg}；d = 1 时第 40 轮已占 {fg1}，其余五页的分数趋于 0。',
    s3bodyDead: '按「跳到任意页」处理，总和保持 {sum}；若把死胡同的份额直接丢掉，第 60 轮总和只剩 {leak}。',

    s4k: '第 4 步 · 阻尼系数',
    s4t: '阻尼系数 d 变一变，排名会变吗？',
    s4e: '这一步要回答：d 是冲浪者跟着链接走的概率，1 − d 是随机跳转的概率。d 越小，每页那份人人相同的基本分 (1 − d)/7 越大，链接结构的影响越小；d → 0 时七页都是 1/7。d 越大，分数越由链接决定，但迭代收敛得越慢（收敛 = 相邻两轮的 L1 变化小于 10<sup>−8</sup>）。实际常用 d = 0.85。',
    c4a: '各页 PageRank 随 d（竖线 = 当前 d）',
    c4b: 'd = {d} 时的分数',
    dSlider4: '阻尼系数 d',
    s4hint: '观察顺序：从 d = 0 往右拖。d = 0 时七条线重合在 1/7；d 增大，线开始分叉。注意 G（链入最多）和 B（只有 A 一条链入）：d 小时 G 在 B 之上，大约在 d = 0.65 处 B 超过 G——d 越大，「谁链向你」越比「有多少链向你」重要。读数里的迭代次数随 d 增加。',
    s4readout: 'd = {d}：排名 {order}；迭代 {it} 轮收敛。{cross}',
    s4crossBefore: '此时 G 仍在 B 之上。', s4crossAfter: '此时 B 已超过 G。',

    s5k: '第 5 步 · 刷链接',
    s5t: '造一堆假页面链向自己，能把排名刷上去吗？',
    s5e: '这一步要回答：D 的分数很低（第 5 名）。D 的主人能不能自己造 m 张假页面，每张只链向 D（这叫<strong>链接农场</strong>），把 D 刷上去？对比另一条路：说服重要的 A 页加一条链向 D 的链接（A 的分数会在 B 和 D 之间平分）。假页面也算进总页数，所以页数从 7 变成 7 + m，基本分 (1 − d)/(7 + m) 也随之变小。d = 0.85。',
    c5a: '链接图：{m} 张假页面链向 D{extra}',
    c5b: 'D 的分数随假页面数 m',
    c5extra: '，A 也链向 D',
    lgFarm: '实线 = 只靠假页面', lgBoth: '橙线 = 假页面 + A 也链向 D（按下按钮后出现）', lgAlink: '虚线 = 不造假页面、只加 A → D 这一条链接', lgFake: '小点 = 假页面',
    mSlider: '假页面数 m',
    aLink: 'A 也链向 D',
    s5hint: '观察顺序：拖 m，看「D 的分数」图：前几张假页面提升明显，之后越来越平——每张假页面只有一份基本分可投，页数越多这份越小。m 拉到 40，D 也只到约 0.114；而虚线（只加 A → D 一条链接）是约 0.135，D 还会超过 B 升到第 4 名。测试里即使加到 1000 张假页面，D 也只到约 0.127。再按「A 也链向 D」，看两种手段叠加。',
    s5readout: 'm = {m}{extra}：D 的分数 {score}，在七张真实页面中排第 {rank}。只加 A → D 一条链接时 D 为 {alink}。',

    s6k: '第 6 步 · 收束',
    s6t: '一个定义，三种读法',
    s6fin: 'PageRank 有三种等价的读法：<strong>选票</strong>——每页把分数平分给外链，加上一份人人相同的基本分；<strong>随机冲浪者</strong>——一个以概率 d 点链接、以概率 1 − d 随机跳转的人，长期停在各页的频率；<strong>幂迭代</strong>——让一整群冲浪者同时走，比例收敛到的那组数。随机跳转让陷阱和死胡同无法吞掉全部份额，也保证迭代收敛；d 决定链接结构有多大分量。',
    formula: 'r(j) = (1 − d)/N + d · Σ_{i→j} r(i) / out(i)\n每轮离终点的距离至少乘以 d\n死胡同：份额平均分给全部 N 页',
    boundary: '适用范围：本页是 7 页的玩具网络，随机跳转对所有页面一视同仁，没有个性化跳转，也没有反作弊。真实搜索引擎的排序结合了大量别的信号，网页图有数十亿个节点；「d = 0.65 附近 B 超过 G」「1000 张假页面也不如 A 的一条链接」只是这张图上的结果，换一张图数值会不同。',
    linksTitle: '接着去哪',
    lk1: '→ 马尔可夫链页第 3 步：稳态分布',
    lk2: '→ 特征向量页第 3 步：幂迭代为什么会收敛到主特征向量',
    lk3: '→ 图算法页第 0 步：把地图看成节点和边',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《PageRank · 随机冲浪者最后停在哪》的平行版本。'
  },
  en: {
    pageTitle: 'PageRank · Links as Weighted Votes',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: PageRank · Where the Random Surfer Ends Up →',
    navLabel: 'PageRank steps',
    tagline: 'Seven web pages, twelve links. Which page matters most? Counting incoming links is one answer — but surely one link from an important page should be worth more than ten from pages nobody visits. Over seven steps you will turn that intuition into a number you can compute: first as votes, then as a person browsing at random, and finally see how traps, the damping factor and link farming change it.',
    nav0: '0 Counting votes', nav1: '1 Random surfer', nav2: '2 Iteration', nav3: '3 Traps', nav4: '4 Damping', nav5: '5 Link farms', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Counting votes',
    s0t: 'Is the most linked-to page the most important one?',
    s0e: 'This step asks: seven pages A–G are joined by 12 <strong>links</strong> (an arrow from X to Y means page X has a link to Y). G has the most <strong>in-links</strong> (arrows pointing at it): 4. B has just 1. Ranked by in-links, G wins. <strong>PageRank</strong> counts differently. Every link is a vote, but votes carry weight: a page <strong>splits</strong> its own score evenly across its outgoing links and multiplies it by d = 0.85; on top of that every page gets the same base score (1 − d)/7. So a page’s score = base score + the shares passed on by every page that links to it. The definition is circular (your score depends on other pages’ scores); step 2 shows how to solve it. Here, just look at the answer. All the scores add up to 1.',
    c0a: 'Link graph (circle area ∝ chosen measure)',
    c0b: '{metric} of each page',
    byIn: 'By in-links', byPr: 'By PageRank',
    metricIn: 'In-links', metricPr: 'PageRank',
    pick0: 'See how one page votes',
    s0hint: 'What to try: press “By in-links” — G has the biggest circle. Then press “By PageRank”: G shrinks and B grows. B’s only in-link comes from A, and A links to B alone, so A’s whole vote goes to B. G’s four votes come from C, D, E and F — three of them pages hardly anyone links to — and each vote is split with other links. Then pick A and F under “See how one page votes”; the readout works out how much each of their links carries.',
    s0readout: 'Ranked by PageRank: {order}. {page} has score {score} and {outs} outgoing links; each carries 0.85 × {score} ÷ {outs} = {share}, to {targets}.',
    s0dead: '{page} has no outgoing links.',

    s1k: 'Step 1 · Random surfer',
    s1t: 'Can PageRank be read as “where someone browsing at random spends their time”?',
    s1e: 'This step asks: what is that circular definition actually measuring? Picture a <strong>random surfer</strong>. At every step, with probability d = 0.85 they click one of the current page’s links at random; with probability 1 − d = 0.15 they get bored and jump to any of the seven pages at random (a <strong>random jump</strong>). After many steps, the <strong>frequency</strong> with which they are on each page (steps spent there ÷ total steps) settles down — and that long-run frequency is exactly the PageRank from step 0. The random numbers come from a seeded pseudo-random generator.',
    c1a: 'Surfer’s position (orange dot) and recent path',
    c1b: 'Visit frequency against steps (log axis): B and G',
    lgSurfer: 'surfer', lgTrail: 'last 8 moves (dashed = random jump)', lgB: 'B’s visit frequency', lgG: 'G’s visit frequency', lgPrLine: 'dashed = PageRank',
    walk1: 'Walk 1 step', walk100: 'Walk 100 steps', walkAuto: 'Keep walking to 20,000', reset1: 'Reset',
    s1hint: 'What to try: press “Walk 1 step” a few times and watch the orange dot follow the arrows, now and then jumping somewhere at random (dashed). Then press “Keep walking to 20,000”: in the “Visit frequency” chart the B and G curves jump around at first, then settle onto their own dashed lines (the PageRank values); in the end B’s frequency sits above G’s, matching the ranking in step 0. TV in the readout is half the sum, over the seven pages, of |frequency − PageRank|; smaller means a closer match.',
    s1readout: '{n} steps so far{prog}, {jumps} of them random jumps. B’s frequency {fb} (PageRank {pb}); G’s frequency {fg} (PageRank {pg}). TV = {tv}.',
    s1empty: 'No steps yet. Press “Walk 1 step” or “Keep walking to 20,000”.',
    s1prog: ' (walking…)',

    s2k: 'Step 2 · Iteration',
    s2t: 'Without simulating a surfer, how do you compute PageRank directly?',
    s2e: 'This step asks: instead of one person taking twenty thousand steps, let a whole crowd of surfers move at once. Let r<sub>k</sub> be the share of the crowd on each page in round k (seven numbers adding up to 1). In the next round each page’s crowd splits by the rules: 85% divides evenly among its links, 15% spreads evenly over all seven pages. So r<sub>k+1</sub> = 0.15/7 + 0.85 × (sum, over pages linking here, of their share ÷ their number of links). That is exactly step 0’s circular definition, with the two sides belonging to consecutive rounds. Start from r<sub>0</sub> = 1/7 on every page and repeat: this is <strong>power iteration</strong> (<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step3">→ Eigenvectors, step 3: power iteration</a>). Distance from the final answer is measured by the L1 distance: the sum over the seven pages of |r<sub>k</sub> − final value|.',
    c2a: 'Round {k}: share on each page (circle area)',
    c2b: 'L1 distance to the final answer against rounds (log axis)',
    lgDist: 'actual distance', lgBound: 'dashed = bound 0.85^k × starting distance',
    kSlider: 'Round k',
    play2: 'Play from k = 0',
    s2hint: 'What to try: press “Play from k = 0” or drag k. The circles start equal; within a few rounds C, A and B grow while D, E and F shrink. In the “L1 distance” chart the solid line falls steadily on the log axis. The dashed line is the guarantee: each round multiplies the distance by at most d = 0.85. On this graph it actually shrinks faster: about 0.64 per round on average, with single rounds anywhere between 0.4 and 0.85 (the error sloshes back and forth between pages). The shares always add up to 1.',
    s2readout: 'k = {k}: A {a}, B {b}, C {c}, G {g}; shares add up to {sum}. L1 distance to the final answer {dist}{ratio}.',
    s2ratio: ', {r} times the previous round’s',

    s3k: 'Step 3 · Traps',
    s3t: 'Why is the random jump necessary at all?',
    s3e: 'This step asks: if we remove the random jump (d = 1), so the surfer can only follow links, what goes wrong? Two kinds of structure cause trouble. A <strong>spider trap</strong>: a group of pages that only link to each other and never out (here F and G are changed to link only to each other) — once you are in, you never leave. A <strong>dead end</strong>: a page with no outgoing links at all (here G loses its link) — the surfer has nowhere to go. This page handles dead ends like this: everyone at a dead end jumps to a random page, as if it linked to all seven. Drag d to see how the jump share 1 − d rescues things.',
    c3a: 'Link graph: {variant}',
    c3b: '{what} against rounds',
    vNormal: 'original', vTrap: 'spider trap (F ⇄ G)', vDead: 'dead end (G has no links)',
    whatTrap: 'Combined share of F + G', whatDead: 'Sum of all shares',
    lgCurD: 'solid = current d', lgD1: 'dashed = d = 1 (no jumps)', lgLeak: 'dashed = dead end not handled (its share is simply lost)',
    dSlider3: 'Damping factor d (probability of following a link)',
    s3hint: 'What to try: choose “spider trap” and look at the “Combined share of F + G” chart. The dashed line (d = 1) climbs towards 100% and the other five pages end with nothing; the solid line (d = 0.85) levels off at about 64%. Drag d down towards 0.5 and the trap’s share drops to about 42%. Then choose “dead end”: on the dashed line (share simply lost) the total quickly leaks down to about 49% before levelling off (drag d to 1 and it drains all the way to 0), so the scores no longer add up to 1; the solid line (jump anywhere) stays at 1.',
    s3readout: '{variant}, d = {d}: {body}',
    s3bodyNormal: 'scores {scores}.',
    s3bodyTrap: 'F + G end up with {fg}; at d = 1 they already hold {fg1} by round 40 and the other five pages head to 0.',
    s3bodyDead: 'with the jump-anywhere rule the total stays {sum}; if the dead end’s share is simply dropped, only {leak} is left by round 60.',

    s4k: 'Step 4 · Damping',
    s4t: 'Change the damping factor d — does the ranking change?',
    s4e: 'This step asks: d is the probability that the surfer follows a link; 1 − d is the probability of a random jump. The smaller d, the bigger the equal base score (1 − d)/7 every page gets, and the less the link structure matters; as d → 0 every page tends to 1/7. The larger d, the more the scores are decided by links — but the iteration converges more slowly (converged = the L1 change between rounds drops below 10<sup>−8</sup>). The value usually quoted is d = 0.85.',
    c4a: 'PageRank of each page against d (vertical line = current d)',
    c4b: 'Scores at d = {d}',
    dSlider4: 'Damping factor d',
    s4hint: 'What to try: drag from d = 0 to the right. At d = 0 all seven lines sit together at 1/7; as d grows they fan out. Watch G (the most in-links) and B (a single in-link, from A): for small d G is above B, and around d = 0.65 B overtakes G — the larger d, the more “who links to you” outweighs “how many link to you”. The iteration count in the readout grows with d.',
    s4readout: 'd = {d}: ranking {order}; converged in {it} rounds. {cross}',
    s4crossBefore: 'G is still above B here.', s4crossAfter: 'B has overtaken G here.',

    s5k: 'Step 5 · Link farms',
    s5t: 'Can you push a page up by creating fake pages that link to it?',
    s5e: 'This step asks: D scores low (5th). Could D’s owner create m fake pages, each linking only to D (a <strong>link farm</strong>), and push D up? Compare a different route: persuading the important page A to add one link to D (A’s score is then split between B and D). Fake pages count as pages too, so there are 7 + m pages and the base score (1 − d)/(7 + m) shrinks accordingly. d = 0.85.',
    c5a: 'Link graph: {m} fake pages link to D{extra}',
    c5b: 'D’s score against the number of fake pages m',
    c5extra: '; A also links to D',
    lgFarm: 'solid = fake pages only', lgBoth: 'orange = fake pages plus the A → D link (appears after pressing the button)', lgAlink: 'dashed = no fake pages, just one extra link A → D', lgFake: 'small dots = fake pages',
    mSlider: 'Fake pages m',
    aLink: 'A also links to D',
    s5hint: 'What to try: drag m and watch the “D’s score” chart. The first few fake pages help noticeably, then the curve flattens — each fake page only has its base score to vote with, and that shrinks as the page count grows. At m = 40 D reaches only about 0.114, while the dashed line (just one extra link A → D) is about 0.135 and lifts D past B into 4th place. In the tests, even 1000 fake pages only bring D to about 0.127. Then press “A also links to D” to combine the two.',
    s5readout: 'm = {m}{extra}: D scores {score}, ranked {rank} among the seven real pages. With only the single link A → D, D scores {alink}.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One definition, three readings',
    s6fin: 'PageRank has three equivalent readings. <strong>Votes</strong>: every page splits its score across its links, plus everyone gets the same base score. <strong>Random surfer</strong>: the long-run share of time spent on each page by someone who clicks a link with probability d and jumps at random with probability 1 − d. <strong>Power iteration</strong>: the numbers a whole crowd of surfers settles into. The random jump stops traps and dead ends from swallowing the scores and guarantees the iteration converges; d sets how much weight the link structure gets.',
    formula: 'r(j) = (1 − d)/N + d · Σ_{i→j} r(i) / out(i)\neach round multiplies the distance to the answer by at most d\ndead end: its share is spread evenly over all N pages',
    boundary: 'Limits: this is a seven-page toy web; the random jump treats every page alike (no personalised jumps) and there is no anti-spam modelling. Real search ranking combines many other signals over a graph with billions of nodes. “B overtakes G near d = 0.65” and “1000 fake pages are worth less than one link from A” are results for this graph only; another graph gives other numbers.',
    linksTitle: 'Where to go next',
    lk1: '→ Markov chains, step 3: the steady-state distribution',
    lk2: '→ Eigenvectors, step 3: why power iteration converges to the leading eigenvector',
    lk3: '→ Graph algorithms, step 0: a map as nodes and edges',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “PageRank · Where the Random Surfer Ends Up”.'
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
