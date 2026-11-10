'use strict';
// Multi-armed bandit lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '多臂老虎机 · 边试边赚的取舍',
    back: '← 知识索引',
    compare: '对照另一版本：多臂老虎机 · 探索还是利用 →',
    navLabel: '多臂老虎机步骤导航',
    tagline: '四台外观一样的机器，每台的中奖率固定但你看不见。每拉一次，你既在赚（中奖），也在学（多知道一点这台机器）。问题是：拉看起来最好的那台，还是去试试拉得少的？七步里，你会先亲手玩一局，再把「试多少」量化成一个代价，最后比较四种策略怎样在探索与利用之间分配有限的次数。',
    nav0: '0 亲手玩', nav1: '1 先试后定', nav2: '2 ε-贪心', nav3: '3 UCB', nav4: '4 汤普森采样', nav5: '5 四种策略', nav6: '6 收束',

    s0k: '第 0 步 · 问题本身',
    s0t: '20 次机会，四台看不出差别的机器，你怎么分配？',
    s0e: '这一步要回答：中奖率看不见时，有限的拉动次数该怎么分？四台机器 A–D 每拉一次，要么中奖（记 1）要么不中（记 0），各自的中奖概率固定不变、彼此独立，这种设定叫<strong>多臂老虎机</strong>（每台机器叫一条「臂」）。你唯一能看到的是每台的<strong>估计中奖率</strong> = 中奖次数 ÷ 拉的次数；拉得越少，这个估计越不可靠（<a class="xlink" href="../statistical-inference/#step1">→ 统计推断（Claude Code 版）第 1 步：样本少时估计晃多大</a>）。用完 20 次后可以揭晓真实中奖率，并算出你的<strong>遗憾</strong>（regret）：每拉一次，记下「最好那台的中奖率 − 你拉的这台的中奖率」，全部加起来。它衡量的是「因为没一直拉最好的，平均少中了几次」，越小越好；只有知道真实中奖率的模拟才算得出来。',
    pull: '拉 {m}', reveal0: '揭晓真实中奖率', newGame0: '换一局（重新洗牌，清空记录）',
    c0: '估计中奖率（柱）与每一次的结果（方块）',
    s0lgEst: '估计中奖率', s0lgWin: '中奖', s0lgLose: '没中', s0lgTrue: '真实中奖率（揭晓后）',
    s0readout: '已拉 {k}/{B} 次，中奖 {w} 次。{arms}',
    s0arm: '{m}：{w}/{n}', s0armNone: '{m}：没拉过',
    s0reveal: '　｜　真实中奖率 {truth}；最好的是 {bm}（{bp}）。你的遗憾 = {reg}：平均来说，比 {k} 次都拉 {bm} 少中 {reg} 次（全拉 {bm} 期望中 {ideal} 次）。',
    s0hint: '观察顺序：先每台各拉两三次，看柱子（估计中奖率）怎么跳；再决定把剩下的次数押在哪台。用完 20 次后按「揭晓」，比较你的估计和绿色刻度（真实值），读出遗憾。「换一局」会重新打乱哪台最好，并清空所有记录。',

    s1k: '第 1 步 · 先试后定',
    s1t: '每台先试 m 次，再一直拉估计最好的那台，m 取多少合适？',
    s1e: '这一步要回答：「试」的代价和「不试」的代价，怎样此消彼长？最简单的策略叫<strong>先试后定</strong>（explore-then-commit）：每台机器先各拉 m 次（<strong>探索</strong>，为了学），然后把剩下的次数全部押在估计中奖率最高的那台上（<strong>利用</strong>，为了赚；并列时随机挑一台）。总共 T = 400 次。机器的真实中奖率是 A 0.35、B 0.55、C 0.65、D 0.45。遗憾分两部分：试的时候，拉了 m 次不是最好的三台，代价 m ×（0.30 + 0.10 + 0.20）= 0.6m；定下来以后，若押错了台，剩下每次都要亏。左图是押中每台的概率（按二项分布精确算出：m 次里中几次的概率；<a class="xlink" href="../../../probability/basics/binomial-normal/#step1">→ 二项与正态第 1 步：钉板上的二项分布</a>），右图是期望遗憾随 m 的变化。',
    mSlider: '每台先试 m 次', sim1: '模拟 200 局', clear1: '清空模拟',
    c1a: '押在哪台：精确概率（柱）与模拟比例（点）', c1b: '期望遗憾随 m 的变化（T = 400）',
    s1lgProb: '精确概率', s1lgSim: '模拟比例', s1lgCurve: '期望遗憾', s1lgMin: '最小处',
    s1readout: 'm = {m}：先试 {k} 次，试的代价 {ex}；押中最好的 C 的概率 {pc}；期望遗憾 {reg}（T = 400，精确值）。{sim}',
    s1sim: '　｜　已模拟 {N} 局：押在 A/B/C/D 的分别为 {a}/{b}/{c}/{d} 局。',
    s1nosim: '',
    s1hint: '观察顺序：先把 m 放在 1（每台只试 1 次就认定，最「贪心」的版本）：押中 C 的概率只有 34%，期望遗憾 48.5。再慢慢加大 m：押中的概率上升，右图曲线先降后升，在 m = 20 达到最低 24.4；m 再大，试的代价 0.6m 就压过了押对带来的好处。按「模拟 200 局」看点逐渐靠近柱顶（模拟是随机的，会有散布）；改 m 会清空模拟记录。',

    s2k: '第 2 步 · ε-贪心',
    s2t: '一直留一点点随机，能不能既不锁死、又不浪费？',
    s2e: '这一步要回答：先试后定只在开头探索；能不能一边利用一边探索？<strong>贪心</strong>策略：每台先拉 1 次，以后每次都拉当前估计最高的那台，估计随结果不断更新。<strong>ε-贪心</strong>：每次以概率 ε（读作 epsilon）随便挑一台（探索），否则照贪心拉（利用）。机器仍是第 1 步那四台，T = 1000 次，每个 ε 用同样的 200 组随机数各模拟一遍，取平均遗憾（下称遗憾，即每次「最好中奖率 − 所拉中奖率」的累计和）。',
    epsSlider: '探索概率 ε',
    c2a: '平均遗憾随拉动次数 t 的累积（200 局平均）', c2b: '1000 次后的平均遗憾随 ε 的变化',
    s2lgCur: '你选的 ε', s2lgGreedy: 'ε = 0（贪心）', s2lgTen: 'ε = 0.1', s2lgGrid: '各个 ε（逐个算完后补齐）',
    s2readout: 'ε = {e}：1000 次后平均遗憾 {r}；最后 100 次里拉中最好机器 C 的比例 {late}。对照：贪心 {rg}（{lg}），ε = 0.1 为 {r1}（{l1}）。{prog}',
    s2prog: '右图曲线计算中：{c}/{N} 个 ε。',
    s2hint: '观察顺序：先把 ε 放在 0：青线和灰色虚线（贪心）重合，几乎是一条直线，1000 次后平均遗憾高达 73.7。原因是约一半的模拟一开始运气不好，就锁死在不是 C 的机器上，此后每一步都在亏；最后 100 次里只有 52% 拉的是 C。再把 ε 拉到 0.5：又是一条直线，这回是因为每一步都有一半概率乱拉，遗憾 81.3。把 ε 放在 0.05–0.1 之间，青线开头弯下来、后段斜率变小。在本页的 51 个 ε 上，ε = 0.08 时最低（约 30.7）。ε-贪心的遗憾曲线后段仍是斜线，因为探索永远不停。',

    s3k: '第 3 步 · UCB',
    s3t: '能不能只在「值得怀疑」的机器上多试几次？',
    s3e: '这一步要回答：与其随机探索，能不能按「还有多不确定」来决定试哪台？<strong>UCB</strong>（置信上界，Upper Confidence Bound）给每台机器算一个乐观的分数：<strong>指数</strong> = 估计中奖率 + 奖励项，奖励项 = c·√(2 ln t ÷ n)。其中 t 是已经进行到第几次，n 是这台被拉过几次，c 是可调的探索权重（c = 1 就是教科书里的 UCB1）。每次拉指数最高的那台。拉得少的机器 n 小，奖励项大，所以会被「给个机会」；拉多了奖励项缩小，指数就靠近估计值本身。下面是同一组随机数下的一局（T = 300，真实中奖率仍是 A 0.35、B 0.55、C 0.65、D 0.45）。',
    cSlider: '探索权重 c', tSlider: '进行到第 t 次（拉之前）', play: '播放到第 300 次', pause: '暂停',
    c3a: '每台的指数 = 估计（实心）+ 奖励项（虚框）', c3b: '每台累计被拉的次数',
    s3lgEst: '估计中奖率', s3lgBonus: '奖励项 c·√(2 ln t / n)', s3lgTrue: '真实中奖率', s3lgNext: '下一次要拉的（指数最高）',
    s3readout: '第 {t} 次之前：{arms}　→　下一次拉 {next}。到目前累计遗憾 {reg}。',
    sep: '；',
    s3arm: '{m} 拉 {n} 次、估计 {e}、奖励 {b}、指数 {i}', s3armNew: '{m} 还没拉过（指数 ∞）', s3end: '第 {t} 次之后：一局结束。各台被拉 {counts} 次，累计遗憾 {reg}。',
    s3hint: '观察顺序：保持 c = 1，按「播放」：开头奖励项（虚框）很高，四台轮流被拉；随后 C 的线越爬越陡，其他三台的线变平，但每隔一阵还会被拉一次，因为它们的奖励项随 ln t 缓慢回升。300 次后本局四台被拉 43/47/182/28 次。再把 c 改成 0（只看估计，等于贪心）：本局一开始 B 运气好，就被一直拉下去（297 次）；c = 2 时探索太多，C 只被拉 107 次。',

    s4k: '第 4 步 · 汤普森采样',
    s4t: '把「不确定」画成一条曲线，从里面抽签决定拉哪台？',
    s4e: '这一步要回答：能不能让「这台是最好的可能性有多大」直接决定拉它的频率？对每台机器，用一条曲线表示「它的中奖率可能在哪」：中了 w 次、没中 l 次后，这条曲线取 <strong>Beta(1 + w, 1 + l)</strong> 分布（Beta 分布是 0 到 1 上的一种概率分布；起点 Beta(1, 1) 是一条平线，表示什么都还不知道；拉得越多，曲线越窄、越集中在估计值附近）。这条曲线叫<strong>后验分布</strong>（<a class="xlink" href="../../../probability/inference/bayes-updating/#step4">→ 贝叶斯更新第 4 步：硬币的 Beta 曲线怎样随数据更新</a>）。<strong>汤普森采样</strong>：每次从每台的曲线里各随机抽一个数，拉抽到的数最大的那台。于是一台机器被拉的概率，正好等于「按目前的数据，它是最好的那台」的概率。',
    draw4: '从各曲线各抽一个数', draw4x: '连抽 1000 次（只计数）',
    c4a: '每台中奖率的后验分布（越高的地方越可能）', c4b: '每台累计被拉的次数',
    s4lgCurve: '后验分布 Beta(1 + 中, 1 + 不中)', s4lgDraw: '抽到的数（圈出最大的）', s4lgTrue: '真实中奖率',
    s4readout: '第 {t} 次之前：{arms}。{draw}',
    s4arm: '{m} Beta({a}, {b})', s4draw: '刚才抽到 {vals}，拉 {pick}。', s4nodraw: '',
    s4tally: '　｜　已抽 {N} 次，最大值落在 A/B/C/D 的比例 {sim}；按后验精确算出「它是最好的」的概率 {exact}。',
    s4hint: '观察顺序：先把 t 放在 1：四条都是平线，谁都可能被抽中。按「播放」，看 C 的曲线变窄、站到右边，A、D 的曲线停在左边不再变（它们几乎不再被拉）。到第 300 次后，本局四台被拉 8/70/213/9 次，C 是最好的概率约 0.954。随时按「连抽 1000 次」，最大值落在各台的比例会靠近精确概率：这正是下一次拉各台的概率。',

    s5k: '第 5 步 · 四种策略同场',
    s5t: '谁的遗憾最少？答案取决于什么？',
    s5e: '这一步要回答：在同一个问题上，四种策略的长期表现差在哪？机器改成「一台 0.5 + Δ，三台 0.5」：Δ 是最好那台的领先幅度，Δ 越小越难分辨。四种策略：贪心（ε = 0）、ε-贪心（ε = 0.1）、UCB1（c = 1）、汤普森采样，各用同样的 100 组随机数跑 T = 2000 次，画平均遗憾。看曲线的<strong>形状</strong>：如果后段是直线，说明每一步都还在固定地亏（遗憾随 t 线性增长）；如果越来越平，说明亏损在变少（理论上 UCB 和汤普森的期望遗憾只按 ln t 增长）。',
    dLabel: '领先幅度 Δ', d002: '0.02', d005: '0.05', d01: '0.1', d02: '0.2', d03: '0.3', t5Slider: '读数位置 t',
    c5: '平均遗憾随 t 的累积（100 局平均）',
    sGreedy: '贪心', sEps: 'ε-贪心 0.1', sUcb: 'UCB1', sTs: '汤普森',
    s5readout: 'Δ = {d}，到 t = {t}：贪心 {g}、ε-贪心 {e}、UCB1 {u}、汤普森 {s}；最低的是 {best}。（100 局平均，模拟）',
    s5hint: '观察顺序：先选 Δ = 0.1，把 t 拖到 2000：贪心最高（107），因为约一半的局早早锁死在错的机器上；ε-贪心是一条斜线；汤普森最低（44），曲线越来越平。UCB1 的 c = 1 是为了在最坏情况下也有理论保证，在这里探索偏多，遗憾（96）反而高于 ε-贪心。再选 Δ = 0.02 或 0.05：差距太小，所有策略都难分辨，ε-贪心在 t = 2000 时反而最低。所以本页只能说：在 Δ ≥ 0.1 的三种设定下汤普森最低；排名会随 Δ、T 和参数改变。',

    s6k: '第 6 步 · 收束', s6t: '探索是为了以后少亏',
    s6fin: '回顾这条线。<strong>第 0 步</strong>：每拉一次既在赚也在学；遗憾 = 累计的「最好中奖率 − 所拉中奖率」。<strong>第 1 步</strong>：先试后定把取舍摊开——试得少容易押错，试得多白白付出试的代价，中间有个最好的 m。<strong>第 2 步</strong>：贪心会被开头的运气锁死；ε-贪心永远留一点随机，不会锁死，但遗憾一直线性增长。<strong>第 3 步</strong>：UCB 按「还有多不确定」来探索。<strong>第 4 步</strong>：汤普森采样按「是最好的概率」来分配次数。<strong>第 5 步</strong>：谁最好取决于 Δ、T 和参数，要在自己的问题上比。',
    formula: '遗憾(T) = Σₜ (p* − p_拉的)\nUCB 指数 = 估计 + c·√(2 ln t / n)\n汤普森：从 Beta(1 + 中, 1 + 不中) 各抽一个，拉最大的',
    boundary: '适用范围：本页的机器是独立的伯努利臂，中奖率固定不变，每次拉完立刻知道结果；遗憾要用真实中奖率计算，只有模拟里才能算。真实场景（网页 A/B 测试、推荐、临床试验的自适应分组）里，概率会随时间漂移、结果可能延迟、还会依赖用户特征（上下文老虎机），本页的结论不能直接照搬。第 2、5 步的平均遗憾来自固定种子的有限次模拟，曲线有随机起伏；排名只对展示过的参数成立。',
    linksTitle: '接着去哪',
    lk1: '→ 贝叶斯更新第 4 步：硬币的中奖率怎样用 Beta 曲线更新',
    lk2: '→ 蒙特卡洛第 1 步：频率多起来，就会靠近概率',
    lk3: '→ 期望值第 2 步：多次平均为什么会靠近期望',
    lk4: '→ 统计推断（Claude Code 版）第 1 步：估计为什么会晃、晃多大',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《多臂老虎机 · 探索还是利用》的平行版本。'
  },
  en: {
    pageTitle: 'Multi-Armed Bandits · Earning While Learning',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Multi-Armed Bandits · Explore or Exploit →',
    navLabel: 'Multi-armed bandit steps',
    tagline: 'Four identical-looking machines, each with a fixed payout rate you cannot see. Every pull both earns (a win) and teaches (a little more about that machine). The question: pull the one that looks best, or try one you know less about? Over seven steps you first play a round by hand, then turn “how much to try” into a measurable cost, and finally compare four strategies for splitting a limited number of pulls between exploring and exploiting.',
    nav0: '0 Play by hand', nav1: '1 Try, then commit', nav2: '2 ε-greedy', nav3: '3 UCB', nav4: '4 Thompson sampling', nav5: '5 Four strategies', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The problem itself',
    s0t: '20 pulls, four machines that look alike: how do you spend them?',
    s0e: 'This step asks: when the payout rates are hidden, how should a limited number of pulls be split? Each pull of machines A–D either wins (counted as 1) or doesn’t (0); each machine’s win probability is fixed and pulls are independent. This setup is a <strong>multi-armed bandit</strong> (each machine is an “arm”). All you can see is each machine’s <strong>estimated win rate</strong> = wins ÷ pulls; the fewer the pulls, the less reliable it is (<a class="xlink" href="../statistical-inference/#step1">→ Statistical inference (Claude Code edition), step 1: how much a small-sample estimate wobbles</a>). After 20 pulls you can reveal the true rates and compute your <strong>regret</strong>: for every pull, take “best machine’s rate − rate of the machine you pulled”, and add them up. It measures how many wins you gave up on average by not always pulling the best one; smaller is better, and only a simulation that knows the true rates can compute it.',
    pull: 'Pull {m}', reveal0: 'Reveal true rates', newGame0: 'New round (reshuffle, clear history)',
    c0: 'Estimated win rate (bars) and every result (squares)',
    s0lgEst: 'estimated win rate', s0lgWin: 'win', s0lgLose: 'no win', s0lgTrue: 'true win rate (after reveal)',
    s0readout: '{k}/{B} pulls used, {w} wins. {arms}',
    s0arm: '{m}: {w}/{n}', s0armNone: '{m}: not pulled',
    s0reveal: '  |  True rates {truth}; the best is {bm} ({bp}). Your regret = {reg}: on average you won {reg} fewer times than pulling {bm} all {k} times (expected {ideal} wins).',
    s0hint: 'What to try: pull each machine two or three times first and watch the bars (estimated rates) jump around; then decide where to put the rest. After 20 pulls press “Reveal”, compare your estimates with the green ticks (true values) and read your regret. “New round” reshuffles which machine is best and clears all history.',

    s1k: 'Step 1 · Try, then commit',
    s1t: 'Try each machine m times, then pull the best-looking one forever. What m is right?',
    s1e: 'This step asks: how do the cost of trying and the cost of not trying trade off? The simplest strategy is <strong>explore-then-commit</strong>: pull each machine m times (<strong>exploring</strong>, to learn), then spend every remaining pull on the one with the highest estimate (<strong>exploiting</strong>, to earn; ties are broken at random). The horizon is T = 400 pulls. The true rates are A 0.35, B 0.55, C 0.65, D 0.45. Regret comes in two parts. While trying, you pull the three worse machines m times each, costing m × (0.30 + 0.10 + 0.20) = 0.6m. After committing, if you picked the wrong machine, every remaining pull loses. The left chart shows the chance of committing to each machine (exact, from the binomial distribution: the chance of each win count in m pulls; <a class="xlink" href="../../../probability/basics/binomial-normal/#step1">→ Binomial and normal, step 1: the binomial on a Galton board</a>); the right one shows expected regret as m changes.',
    mSlider: 'Tries per machine m', sim1: 'Simulate 200 rounds', clear1: 'Clear simulations',
    c1a: 'Where you commit: exact (bars), simulated (dots)', c1b: 'Expected regret vs m (T = 400)',
    s1lgProb: 'exact probability', s1lgSim: 'simulated share', s1lgCurve: 'expected regret', s1lgMin: 'minimum',
    s1readout: 'm = {m}: {k} tries, trying costs {ex}; chance of committing to the best machine C {pc}; expected regret {reg} (T = 400, exact).{sim}',
    s1sim: '  |  {N} rounds simulated: committed to A/B/C/D in {a}/{b}/{c}/{d} rounds.',
    s1nosim: '',
    s1hint: 'What to try: start at m = 1 (one try each, then commit; the greediest version). The chance of committing to C is only 34% and expected regret is 48.5. Raise m slowly: the chance of picking right goes up, and the right-hand curve falls, bottoms out at m = 20 with 24.4, then rises again, because the trying cost 0.6m outgrows the benefit of picking right. Press “Simulate 200 rounds” and watch the dots approach the bar tops (simulation is random and scatters). Changing m clears the simulated tally.',

    s2k: 'Step 2 · ε-greedy',
    s2t: 'Keep a little randomness forever: does that avoid lock-in without wasting pulls?',
    s2e: 'This step asks: explore-then-commit only explores at the start; can you explore and exploit at the same time? <strong>Greedy</strong>: pull each machine once, then always pull the one with the highest current estimate, updating estimates as results come in. <strong>ε-greedy</strong>: on each pull, with probability ε (“epsilon”) pick a machine at random (explore), otherwise act greedily (exploit). Same four machines as step 1, T = 1000 pulls. Every ε is simulated on the same 200 sets of random numbers and the regret is averaged (regret: the running sum of “best rate − rate pulled”).',
    epsSlider: 'Exploration probability ε',
    c2a: 'Average regret accumulating over pulls t (200 rounds)', c2b: 'Average regret after 1000 pulls vs ε',
    s2lgCur: 'your ε', s2lgGreedy: 'ε = 0 (greedy)', s2lgTen: 'ε = 0.1', s2lgGrid: 'each ε (filled in as computed)',
    s2readout: 'ε = {e}: average regret after 1000 pulls {r}; share of the last 100 pulls on the best machine C {late}. For comparison: greedy {rg} ({lg}), ε = 0.1 {r1} ({l1}). {prog}',
    s2prog: 'Right-hand curve computing: {c}/{N} values of ε.',
    s2hint: 'What to try: set ε = 0 first. The cyan line sits on the grey dashed greedy line, almost straight, and average regret after 1000 pulls is 73.7. The reason: in about half the rounds an unlucky start locks greedy onto a machine other than C, and every pull after that loses; only 52% of the last 100 pulls go to C. Push ε to 0.5: another straight line, this time because every pull has a 50% chance of being random; regret 81.3. Put ε between 0.05 and 0.1 and the cyan line bends down early and settles into a gentler slope. Across this page’s 51 values of ε the lowest is at ε = 0.08 (about 30.7). The tail of an ε-greedy curve stays a slope because exploration never stops.',

    s3k: 'Step 3 · UCB',
    s3t: 'Can you explore only the machines that still deserve doubt?',
    s3e: 'This step asks: instead of exploring at random, can “how uncertain is it still” decide what to try? <strong>UCB</strong> (Upper Confidence Bound) gives every machine an optimistic score: the <strong>index</strong> = estimated rate + a bonus, where bonus = c·√(2 ln t ÷ n). Here t is the current pull number, n is how many times this machine has been pulled, and c is an adjustable exploration weight (c = 1 is textbook UCB1). Always pull the machine with the highest index. A rarely pulled machine has a small n and a big bonus, so it gets a chance; as it is pulled more, the bonus shrinks and the index settles near the estimate. Below is one round on a fixed set of random numbers (T = 300; true rates still A 0.35, B 0.55, C 0.65, D 0.45).',
    cSlider: 'Exploration weight c', tSlider: 'Before pull number t', play: 'Play to pull 300', pause: 'Pause',
    c3a: 'Each machine’s index = estimate (solid) + bonus (dashed box)', c3b: 'Pulls so far, per machine',
    s3lgEst: 'estimated rate', s3lgBonus: 'bonus c·√(2 ln t / n)', s3lgTrue: 'true rate', s3lgNext: 'next pull (highest index)',
    s3readout: 'Before pull {t}: {arms}  →  next pull: {next}. Regret so far {reg}.',
    sep: '; ',
    s3arm: '{m} pulled {n}×, estimate {e}, bonus {b}, index {i}', s3armNew: '{m} not pulled yet (index ∞)', s3end: 'After pull {t}: round over. Pulls per machine {counts}, total regret {reg}.',
    s3hint: 'What to try: keep c = 1 and press “Play”. At first the bonuses (dashed boxes) are tall and the four machines take turns; then C’s line climbs ever more steeply while the others flatten, yet every so often one of them is pulled again because its bonus creeps back up with ln t. After 300 pulls this round splits 43/47/182/28. Now set c = 0 (estimates only, which is greedy): in this round B gets lucky early and is pulled almost forever (297 times). With c = 2 it explores too much and C gets only 107 pulls.',

    s4k: 'Step 4 · Thompson sampling',
    s4t: 'Draw your uncertainty as a curve, then let a lottery from it pick the machine?',
    s4e: 'This step asks: can “how likely is this machine to be the best” set how often it is pulled? For each machine, a curve says where its win rate might be. After w wins and l losses the curve is <strong>Beta(1 + w, 1 + l)</strong> (the Beta distribution is a probability distribution on 0 to 1; the starting point Beta(1, 1) is flat, meaning nothing is known yet; more pulls make it narrower and centred near the estimate). This curve is the <strong>posterior distribution</strong> (<a class="xlink" href="../../../probability/inference/bayes-updating/#step4">→ Bayesian updating, step 4: how a coin’s Beta curve updates with data</a>). <strong>Thompson sampling</strong>: on every pull, draw one random number from each machine’s curve and pull the machine with the largest draw. So the chance a machine is pulled equals the chance, given the data so far, that it is the best one.',
    draw4: 'Draw one number from each curve', draw4x: 'Draw 1000 times (tally only)',
    c4a: 'Posterior for each machine’s win rate (higher = more plausible)', c4b: 'Pulls so far, per machine',
    s4lgCurve: 'posterior Beta(1 + wins, 1 + losses)', s4lgDraw: 'draws (largest circled)', s4lgTrue: 'true rate',
    s4readout: 'Before pull {t}: {arms}. {draw}',
    s4arm: '{m} Beta({a}, {b})', s4draw: 'Just drew {vals}, so pull {pick}.', s4nodraw: '',
    s4tally: '  |  {N} draws so far; the largest landed on A/B/C/D in shares {sim}; exact posterior chance each is best {exact}.',
    s4hint: 'What to try: set t = 1 first: all four curves are flat and any machine can win the draw. Press “Play” and watch C’s curve narrow and move right while A’s and D’s stay put on the left (they are hardly pulled any more). After 300 pulls this round splits 8/70/213/9 and the chance that C is best is about 0.954. At any point, press “Draw 1000 times”: the share of largest draws per machine approaches the exact probabilities, which are exactly the chances of pulling each machine next.',

    s5k: 'Step 5 · Four strategies head to head',
    s5t: 'Who has the least regret, and what does the answer depend on?',
    s5e: 'This step asks: on the same problem, where do the four strategies differ in the long run? The machines are now “one at 0.5 + Δ, three at 0.5”: Δ is the best machine’s lead, and the smaller it is, the harder the machines are to tell apart. The four strategies are greedy (ε = 0), ε-greedy (ε = 0.1), UCB1 (c = 1) and Thompson sampling, each run on the same 100 sets of random numbers for T = 2000 pulls, plotting average regret. Watch the <strong>shape</strong> of each curve: a straight tail means a fixed loss on every pull (regret grows linearly in t); a flattening tail means losses are shrinking (in theory, UCB’s and Thompson’s expected regret grows only like ln t).',
    dLabel: 'Lead Δ', d002: '0.02', d005: '0.05', d01: '0.1', d02: '0.2', d03: '0.3', t5Slider: 'Read-out position t',
    c5: 'Average regret accumulating over t (100 rounds)',
    sGreedy: 'greedy', sEps: 'ε-greedy 0.1', sUcb: 'UCB1', sTs: 'Thompson',
    s5readout: 'Δ = {d}, at t = {t}: greedy {g}, ε-greedy {e}, UCB1 {u}, Thompson {s}; lowest: {best}. (100-round average, simulated)',
    s5hint: 'What to try: pick Δ = 0.1 and drag t to 2000. Greedy is highest (107) because about half the rounds lock onto a wrong machine early; ε-greedy is a straight slope; Thompson is lowest (44) and keeps flattening. UCB1’s c = 1 is chosen to guarantee good behaviour even in the worst case; here it over-explores, and its regret (96) ends up above ε-greedy’s. Now pick Δ = 0.02 or 0.05: the gap is too small for any strategy to resolve, and ε-greedy is actually lowest at t = 2000. So this page can only say that Thompson is lowest at the three settings with Δ ≥ 0.1; rankings change with Δ, T and the parameters.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Exploring now is how you lose less later',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: each pull both earns and teaches; regret is the running sum of “best rate − rate pulled”. <strong>Step 1</strong>: explore-then-commit lays the trade-off bare: too few tries and you commit to the wrong machine, too many and you pay for the trying; some m in between is best. <strong>Step 2</strong>: greedy can be locked in by early luck; ε-greedy keeps a little randomness and never locks in, but its regret keeps growing linearly. <strong>Step 3</strong>: UCB explores according to how uncertain each machine still is. <strong>Step 4</strong>: Thompson sampling hands out pulls according to each machine’s chance of being best. <strong>Step 5</strong>: which strategy wins depends on Δ, T and the parameters, so compare on your own problem.',
    formula: 'regret(T) = Σₜ (p* − p_pulled)\nUCB index = estimate + c·√(2 ln t / n)\nThompson: draw one from each Beta(1 + wins, 1 + losses), pull the largest',
    boundary: 'Scope: the machines here are independent Bernoulli arms with fixed win rates, and each result arrives right after the pull; regret needs the true rates, so it exists only in simulation. Real settings (web A/B tests, recommendations, adaptive clinical trials) have rates that drift, delayed results and dependence on user features (contextual bandits), so the conclusions here do not carry over directly. The average regrets in steps 2 and 5 come from a finite number of fixed-seed simulations and have random wiggles; rankings hold only for the parameters shown.',
    linksTitle: 'Where to go next',
    lk1: '→ Bayesian updating, step 4: updating a coin’s rate with a Beta curve',
    lk2: '→ Monte Carlo, step 1: with more trials, frequencies approach probabilities',
    lk3: '→ Expected value, step 2: why long-run averages approach the expectation',
    lk4: '→ Statistical inference (Claude Code edition), step 1: why estimates wobble, and by how much',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Multi-Armed Bandits · Explore or Exploit”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang] && key in STRINGS[lang] ? STRINGS[lang][key] : key in STRINGS.en ? STRINGS.en[key] : key;
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
  if (typeof window.refreshBandit === 'function') window.refreshBandit();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BANDIT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
