'use strict';
// LLM sampling lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '语言模型怎样挑下一个词 · 温度、截断与抽样',
    back: '← 知识索引',
    compare: '对照另一版本：大语言模型如何逐词生成 →',
    navLabel: '逐词生成步骤导航',
    tagline: '语言模型每写一个词，都要先给词表里每个词打分，把分数变成概率，再从中抽一个。七步里你会亲手调这条流水线的每个旋钮：softmax、温度、长尾、top-k 与 top-p、随机抽样，最后看它们怎样决定一段文字是啰嗦、通顺还是混乱。',
    nav0: '0 分数变概率', nav1: '1 温度', nav2: '2 长尾', nav3: '3 截断', nav4: '4 抽样', nav5: '5 逐词写', nav6: '6 收束',

    s0k: '第 0 步 · 分数变概率',
    s0t: '模型给每个词打了分，分数怎样变成概率？',
    s0e: '这一步要回答：语言模型读完「法国的首都是」之后，要从它认识的全部 1000 个词里挑下一个。它先给每个词一个<strong>分数</strong>（logit：任意实数，越大表示模型越看好这个词），再用 <strong>softmax</strong> 把分数变成<strong>概率</strong>：p<sub>i</sub> = e<sup>z<sub>i</sub></sup> ÷ Σ<sub>j</sub> e<sup>z<sub>j</sub></sup>。取指数让每个概率都是正数，除以总和让 1000 个概率加起来正好等于 1。本页的分数是手工设定的玩具数字，不是真实模型的输出；前 10 个词单独画出，其余 990 个词的分数按排名递减，合并成一行「其余 990 词」。（<a class="xlink" href="../../../computing/ml/attention-mechanism/#step1">→ 注意力机制页第 1 步：同一个 softmax 把分数变成权重</a>）',
    c0a: '分数 z（logit，可正可负）',
    c0b: '概率 p = softmax(z)',
    zLyon: '里昂的分数 z',
    shiftAll: '所有分数同加 c',
    s0hint: '观察顺序：先拖「里昂的分数 z」，看「概率 p」图：里昂变长时，巴黎和其余各行一起变短——总和固定为 1，一个词多拿，别的词就得少拿。再拖「所有分数同加 c」：「分数 z」图整体平移，「概率 p」图一点不动，因为公共因子 e<sup>c</sup> 在分子分母里约掉了。softmax 只认分数之<strong>差</strong>。',
    s0readout: '巴黎 p = {pp}，里昂 p = {pl}。两者之比 = e^(z巴黎 − z里昂) = e^{d} = {ratio}。全部 1000 个概率之和 = {sum}。',

    s1k: '第 1 步 · 温度',
    s1t: '同一组分数，怎样让模型挑得更保守或更大胆？',
    s1e: '这一步要回答：不改模型，能不能调节它挑词时有多「冒险」？做法是先把每个分数除以<strong>温度</strong> T，再做 softmax：p<sub>i</sub> ∝ e<sup>z<sub>i</sub>/T</sup>。任意两个词的概率之比变成 e<sup>(z<sub>i</sub> − z<sub>j</sub>)/T</sup>：T &lt; 1 把分数差放大，最高的词更占优；T &gt; 1 把分数差缩小，分布被摊平，<strong>尾部</strong>（前 10 名之外那 990 个低分词）一起抬头。T 只改变分布的形状，不给模型增加任何知识。两个提示可切换：「法国的首都是」（模型很确定）与「这个周末我想去」（好几个答案都说得通）。',
    c1a: '当前 T 下的概率（虚线框 = T = 1）',
    c1b: '占比随温度 T 变化',
    lgNow: '当前 T 的概率', lgRef: 'T = 1 时的概率', lgTop: '最高词占比', lgTail: '尾部 990 词合计',
    promptCapital: '法国的首都是……', promptWeekend: '这个周末我想去……',
    tSlider: '温度 T',
    s1hint: '观察顺序：在「法国的首都是」下把 T 从 1 拖到 0.3，巴黎几乎占满；再拖到 2，「占比随温度 T 变化」图里青色曲线（最高词占比）掉到约 26%，粉色曲线（尾部合计）升过一半。然后换到「这个周末我想去」重复：它在 T = 1 时尾部已有约 15%，两条曲线几乎在 T = 1 附近交叉。',
    s1readout: '「{prompt}」，T = {T}：最高词「{w1}」占 {p1}，第二名「{w2}」占 {p2}，两者之比 e^((z₁ − z₂)/T) = {ratio}；尾部 990 词合计 {tail}。',

    s2k: '第 2 步 · 长尾',
    s2t: '每个尾部词都很不起眼，为什么还要管它们？',
    s2e: '这一步要回答：「这个周末我想去」之后，<strong>尾部</strong>（前 10 名之外的 990 个词）里的每一个词在 T = 1 时概率都不到 2%，可它们合起来有约 15%。模型一个词一个词往下写，每个位置都要抽一次。设每个位置落进尾部的概率都是 q，且各位置互不影响（这是简化假设：真实模型里每个位置的分布都不同），那么一段 L 个词的回复里<strong>至少一次</strong>落进尾部的概率是 1 − (1 − q)<sup>L</sup>，它随 L 很快逼近 1。尾部词不一定是错词，但它们是模型自己最没把握的选择，离题和胡话多半从这里来。',
    c2a: '一次模拟回复：{L} 个位置，粉色 = 抽中了尾部词',
    c2b: '至少一次抽中尾部的概率 1 − (1 − q)^L，横轴为回复长度 L',
    lgStrip: '抽中前 10 名', lgStripTail: '抽中尾部词', lgCurve: '当前 T 的曲线', lgHist: '试过的其他 T',
    lSlider: '回复长度 L（词）',
    reroll2: '再抽一次（T、L 不变）',
    clearHist2: '清除旧曲线',
    s2hint: '观察顺序：先保持 T = 1，拖「回复长度 L」，看「至少一次」图上的白点：L = 30 时已约 99%。再把 T 改成 0.7、1.5 等几个值：每试一个 T，图里留下一条淡色曲线，比较它们升到 50% 所需的 L。上方条带是用当前 T 真的抽了一次的 L 个位置；「再抽一次」只换随机数。',
    s2readout: 'T = {T}：每个位置落进尾部的概率 q = {q}，单个尾部词最多 {maxw}。L = {L} 时至少一次落进尾部的概率 = {pL}；{half}。这次模拟回复里抽中了 {hits} 个尾部词。',
    halfAt: '从 L = {half} 起就达到 50%', halfNever: '即使 L = 1000 也到不了 50%',

    s3k: '第 3 步 · 截断',
    s3t: '抽之前先砍掉尾部：固定留 k 个，还是留够 p 的概率？',
    s3e: '这一步要回答：既然尾部是风险来源，抽之前先砍掉它，砍多少合适？两种常用规则都在温度之后、抽样之前执行，砍完把留下的概率按比例放大，使总和回到 1。<strong>top-k</strong>：只留概率最高的 k 个词。<strong>top-p</strong>（又叫 nucleus 采样）：从最高的词往下累加，留下累计概率刚好达到 p 的最少几个词。本步 T = 1。两张图是两个提示在同一条规则下的结果：青色 = 留下，灰色 = 砍掉；「其余 990 词」一行的青色部分是其中被留下那些词的概率合计。',
    c3a: '「法国的首都是……」：1000 个词里留下 {n} 个',
    c3b: '「这个周末我想去……」：1000 个词里留下 {n} 个',
    lgKept: '留下（截断前的概率）', lgCut: '砍掉',
    methodK: 'top-k', methodP: 'top-p',
    kSlider: 'k（留几个词）', pSlider: 'p（留够多少概率）',
    s3hint: '观察顺序：先选 top-k，k = 5：首都题也留了 5 个词，巴黎以外的 4 个（含里昂、马赛这样的错答案）放大后合计约 6%；周末题却只剩约 59% 的原始概率，「钓鱼」「游泳」这些正常选项被砍。再切到 top-p，p = 0.9：首都题只留巴黎，周末题留下 16 个词。同一个 p，模型确定时留得少、不确定时留得多；固定的 k 做不到这一点。',
    s3readout: '{rule}。首都题：留下 {nA} 个词，覆盖原概率 {mA}，放大后巴黎以外的词合计 {wrongA}。周末题：留下 {nB} 个词，覆盖原概率 {mB}。',
    ruleK: 'top-k，k = {k}', ruleP: 'top-p，p = {p}',

    s4k: '第 4 步 · 抽样',
    s4t: '抽很多次，各词被抽中的频率会对上概率吗？',
    s4e: '这一步要回答：流水线的最后一步是按概率随机抽一个词。抽一次的结果谁也说不准；抽很多次时，每个词被抽中的<strong>频率</strong>（次数 ÷ 总次数）会不会接近它的概率？这里用「这个周末我想去」、T = 1、不截断的分布，抽中尾部 990 词的次数合并成一列。差距用<strong>总变差距离</strong> TV 衡量：对 11 列算 ½ Σ |频率 − 概率|，取值 0 到 1，越小越吻合；它的含义是「至少要改掉多大比例的抽样结果，频率才能和概率完全一致」。随机数来自固定种子的伪随机数生成器，结果可复现。（<a class="xlink" href="../../../probability/stochastic/monte-carlo/#step2">→ 蒙特卡洛页第 2 步：误差为什么按 1/√N 缩小</a>）',
    c4a: '频率（条）与概率（白色刻度）',
    c4b: 'TV 随抽样次数 N 变化（横轴对数刻度）',
    lgFreq: '抽样频率', lgProb: '概率', lgTv: '实测 TV 轨迹', lgTheory: '近似期望 ½Σ√(2p(1−p)/(πN))',
    draw1: '抽 1 次', draw10: '抽 10 次', draw100: '抽 100 次', drawAuto: '连续抽到 10000 次', reset4: '清零',
    s4hint: '观察顺序：先点几次「抽 1 次」：频率条忽长忽短，TV 很大。再点「连续抽到 10000 次」：条形逐渐贴到白色刻度上，「TV 随抽样次数」图里留下一条下降的轨迹，大致贴着虚线走——抽样次数乘 100，TV 大约缩到 1/10。「清零」同时清空计数和轨迹。',
    s4readout: '已抽 {N} 次{prog}。TV = {tv}（同样次数下的近似期望 {exp}）。抽中最多的是「{w}」：{c} 次，频率 {f}，概率 {p}。',
    s4empty: '还没有抽样。点「抽 1 次」或「连续抽到 10000 次」。',
    s4prog: '（连续抽样进行中）',

    s5k: '第 5 步 · 逐词写',
    s5t: '一个词接一个词写下去，温度和截断决定了怎样的文字？',
    s5e: '这一步要回答：把「打分 → 除以温度 → 截断 → 抽一个」重复很多次，写出来的文字长什么样？这里换成一个只有 12 个词的小模型：它只看上一个词来打分（一阶模型，也就是一条马尔可夫链，<a class="xlink" href="../../../probability/stochastic/markov-chains/#step1">→ 马尔可夫链页第 1 步：走一条路径</a>）。符合玩具语法的衔接（如「小猫 → 追着」）分数在 0.4 到 3.0 之间，不合语法的衔接（如「月亮 → 小猫」）分数一律是 −2。每段从句号之后写 24 个词。两个指标：<strong>重复率</strong> = 文中每 3 个相邻词组成的片段里，前面已经出现过的比例（越高越啰嗦）；<strong>不通顺率</strong> = 不合语法的衔接占全部 24 次衔接的比例（越高越乱）。',
    c5: '200 段的平均值随温度 T 变化',
    lgRep: '重复率', lgOdd: '不通顺率', lgRef5: '虚线 = 不截断（p = 1）', lgDot: '白点 = 上面这一段',
    textLabel: '生成的文字（小字 = 抽中这个词时的概率；粉色下划线 = 不合语法的衔接）：',
    pSlider5: 'top-p 的 p',
    write5: '写一段', seed5: '换个种子（T、p 不变）',
    s5hint: '观察顺序：T 拖到 0.2，按「写一段」：几乎总在重复「小猫 追着 一个球 。」，重复率很高、没有粉色下划线。T 拖到 2.5：句子不再重复，粉色下划线却一处接一处。最后保持 T = 1.5，把 p 从 1 降到 0.8：图上粉色曲线在 T = 1.5 处降到接近 0，青色曲线只略升——截断砍掉的正是那些低分的不合语法衔接。',
    s5readout: '这一段（T = {T}，p = {p}，种子 {seed}）：重复率 {rep}，不通顺 {odd} 处（{oddShare}），用到 {distinct} 种词。同设置下 200 段平均：重复率 {mRep}，不通顺率 {mOdd}。',
    s5writing: '正在逐词写：{k}/{n}',

    s6k: '第 6 步 · 收束',
    s6t: '一条流水线，四个旋钮',
    s6fin: '每写一个词，模型都走同一条流水线：<strong>打分</strong>（每个词一个 logit）→ <strong>softmax</strong> 变成概率（只认分数之差）→ <strong>除以温度 T</strong>（T &lt; 1 更保守，T &gt; 1 更冒险）→ <strong>截断</strong>（top-k 固定留 k 个，top-p 按把握程度自动增减）→ <strong>抽一个</strong>（频率随次数逼近概率）。长文本里每个位置的小风险会累积，所以截断和温度一起决定了文字是啰嗦、通顺还是混乱。',
    formula: 'p_i = e^(z_i / T) ÷ Σ_j e^(z_j / T)\n至少一次落进尾部 = 1 − (1 − q)^L\nTV = ½ Σ |频率 − 概率|',
    boundary: '适用范围：本页分数是手工设定的玩具数字；第 5 步的模型只看上一个词，真实模型看整段上下文、词表有几万个词，每个位置的分布都不同，第 2 步的「各位置独立、q 相同」只是估算。实际系统还会用重复惩罚、min-p、束搜索等别的解码方法。温度和截断只改变怎么挑，不会让模型知道得更多，也不能保证说的是真话。',
    linksTitle: '接着去哪',
    lk1: '→ 熵页第 2 步：用一个数衡量分布有多「散」',
    lk2: '→ 注意力机制页第 1 步：softmax 把分数变成权重',
    lk3: '→ 马尔可夫链页第 1 步：只看上一步的随机路径',
    lk4: '→ 蒙特卡洛页第 2 步：抽样误差按 1/√N 缩小',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《大语言模型如何逐词生成》的平行版本。',

    tail: '其余 990 词',
    w_paris: '巴黎', w_lyon: '里昂', w_marseille: '马赛', w_a: '一座', w_beautiful: '美丽的', w_famous: '著名的', w_which: '哪座', w_nice: '尼斯', w_europe: '欧洲', w_rome: '罗马',
    w_hiking: '爬山', w_beach: '海边', w_movie: '看电影', w_camping: '露营', w_shopping: '逛街', w_fishing: '钓鱼', w_museum: '博物馆', w_swimming: '游泳', w_running: '跑步', w_picnic: '野餐',
    tk_stop: '。', tk_cat: '小猫', tk_dog: '小狗', tk_bird: '小鸟', tk_chases: '追着', tk_watches: '看着', tk_finds: '找到', tk_ball: '一个球', tk_fish: '一条鱼', tk_moon: '月亮', tk_shadow: '影子', tk_then: '然后'
  },
  en: {
    pageTitle: 'How a Language Model Picks the Next Word · Temperature, Truncation, Sampling',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: How an LLM Writes Word by Word →',
    navLabel: 'Next-word sampling steps',
    tagline: 'Each time a language model writes a word, it scores every word in its vocabulary, turns the scores into probabilities and draws one. Over seven steps you will turn every knob on that pipeline yourself — softmax, temperature, the long tail, top-k and top-p, random sampling — and then watch them decide whether a passage comes out repetitive, fluent or garbled.',
    nav0: '0 Scores → odds', nav1: '1 Temperature', nav2: '2 The long tail', nav3: '3 Truncation', nav4: '4 Sampling', nav5: '5 Word by word', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Scores into probabilities',
    s0t: 'The model scores every word. How do scores become probabilities?',
    s0e: 'This step asks: after reading “The capital of France is”, a language model has to choose the next word out of all 1000 words it knows. First it gives each word a <strong>score</strong> (a logit: any real number; higher means the model likes the word more). Then <strong>softmax</strong> turns scores into <strong>probabilities</strong>: p<sub>i</sub> = e<sup>z<sub>i</sub></sup> ÷ Σ<sub>j</sub> e<sup>z<sub>j</sub></sup>. The exponential makes every probability positive; dividing by the total makes all 1000 of them add up to exactly 1. The scores here are hand-set toy numbers, not the output of a real model. The top 10 words are drawn one per row; the other 990 have scores that fall with rank and are lumped into a single “other 990 words” row. (<a class="xlink" href="../../../computing/ml/attention-mechanism/#step1">→ Attention, step 1: the same softmax turns scores into weights</a>)',
    c0a: 'Score z (logit, any sign)',
    c0b: 'Probability p = softmax(z)',
    zLyon: 'Score z for “Lyon”',
    shiftAll: 'Add c to every score',
    s0hint: 'What to try: drag “Score z for Lyon” and watch the Probability p chart. As Lyon grows, Paris and every other row shrink — the total is pinned at 1, so one word can only gain what the others lose. Then drag “Add c to every score”: the Score z chart slides sideways while the Probability p chart does not move at all, because the common factor e<sup>c</sup> cancels between numerator and denominator. Softmax only sees <strong>differences</strong> between scores.',
    s0readout: 'Paris p = {pp}, Lyon p = {pl}. Their ratio = e^(z_Paris − z_Lyon) = e^{d} = {ratio}. All 1000 probabilities add up to {sum}.',

    s1k: 'Step 1 · Temperature',
    s1t: 'Same scores — how do you make the model play it safer, or bolder?',
    s1e: 'This step asks: without touching the model, can you control how adventurous its choices are? Divide every score by a <strong>temperature</strong> T before the softmax: p<sub>i</sub> ∝ e<sup>z<sub>i</sub>/T</sup>. The odds between any two words become e<sup>(z<sub>i</sub> − z<sub>j</sub>)/T</sup>. T &lt; 1 stretches the score gaps, so the leader dominates; T &gt; 1 squeezes them, the distribution flattens, and the <strong>tail</strong> — the 990 low-scoring words outside the top 10 — rises together. T reshapes the distribution; it adds no knowledge. Switch between two prompts: “The capital of France is” (the model is sure) and “This weekend I want to go” (several answers make sense).',
    c1a: 'Probabilities at the current T (dashed box = T = 1)',
    c1b: 'Shares as temperature T changes',
    lgNow: 'probability at current T', lgRef: 'probability at T = 1', lgTop: 'top word’s share', lgTail: 'tail of 990 words, combined',
    promptCapital: 'The capital of France is…', promptWeekend: 'This weekend I want to go…',
    tSlider: 'Temperature T',
    s1hint: 'What to try: with “The capital of France is”, drag T from 1 down to 0.3 — Paris takes almost everything. Push it to 2: in the “Shares as temperature T changes” chart the cyan curve (top word’s share) falls to about 26% and the pink curve (tail combined) passes one half. Switch to “This weekend I want to go” and repeat: its tail already holds about 15% at T = 1, and the two curves cross close to T = 1.',
    s1readout: '“{prompt}”, T = {T}: the top word “{w1}” has {p1}, the runner-up “{w2}” has {p2}; their ratio e^((z₁ − z₂)/T) = {ratio}. The 990-word tail holds {tail}.',

    s2k: 'Step 2 · The long tail',
    s2t: 'Each tail word is negligible on its own — so why worry about them?',
    s2e: 'This step asks: after “This weekend I want to go”, every single word in the <strong>tail</strong> (the 990 words outside the top 10) has less than 2% at T = 1, yet together they hold about 15%. A model writes one word at a time and draws at every position. If each position lands in the tail with probability q, and positions don’t affect each other (a simplification: in a real model every position has its own distribution), then a reply of L words hits the tail <strong>at least once</strong> with probability 1 − (1 − q)<sup>L</sup>, which races towards 1 as L grows. Tail words aren’t necessarily wrong, but they are the choices the model itself trusts least — the usual source of drift and nonsense.',
    c2a: 'One simulated reply: {L} positions, pink = a tail word was drawn',
    c2b: 'Chance of at least one tail word, 1 − (1 − q)^L, against reply length L',
    lgStrip: 'drew a top-10 word', lgStripTail: 'drew a tail word', lgCurve: 'curve at current T', lgHist: 'other T values tried',
    lSlider: 'Reply length L (words)',
    reroll2: 'Draw again (same T and L)',
    clearHist2: 'Clear old curves',
    s2hint: 'What to try: keep T = 1 and drag “Reply length L”, watching the white dot on the “at least one” chart — at L = 30 it is already about 99%. Then set T to a few values such as 0.7 and 1.5: each T you try leaves a faint curve behind, so you can compare how long a reply must be before the chance passes 50%. The strip on top is one real draw of L positions at the current T; “Draw again” only changes the random numbers.',
    s2readout: 'T = {T}: each position lands in the tail with q = {q}; no single tail word has more than {maxw}. For L = {L}, the chance of at least one tail word = {pL}; {half}. This simulated reply drew {hits} tail words.',
    halfAt: 'it reaches 50% from L = {half} on', halfNever: 'it stays below 50% even at L = 1000',

    s3k: 'Step 3 · Truncation',
    s3t: 'Cut the tail before drawing: keep a fixed k words, or keep enough to reach p?',
    s3e: 'This step asks: if the tail is where the risk lives, how much of it should be cut before the draw? Two common rules, both applied after temperature and before sampling; whatever survives is scaled back up so the total is 1 again. <strong>Top-k</strong>: keep only the k most probable words. <strong>Top-p</strong> (also called nucleus sampling): walk down from the most probable word, adding up probabilities, and keep the fewest words whose running total reaches p. T = 1 throughout this step. The two charts show the two prompts under the same rule: cyan = kept, grey = cut; in the “other 990 words” row, the cyan part is the combined probability of the tail words that survive.',
    c3a: '“The capital of France is…”: kept {n} of 1000 words',
    c3b: '“This weekend I want to go…”: kept {n} of 1000 words',
    lgKept: 'kept (probability before truncation)', lgCut: 'cut',
    methodK: 'top-k', methodP: 'top-p',
    kSlider: 'k (words to keep)', pSlider: 'p (probability to keep)',
    s3hint: 'What to try: choose top-k with k = 5. The capital prompt still keeps 5 words, so the 4 words other than Paris (including wrong answers like Lyon and Marseille) end up with about 6% between them after rescaling; the weekend prompt keeps only about 59% of its original probability, and perfectly good options such as fishing and swimming are cut. Now switch to top-p with p = 0.9: the capital prompt keeps Paris alone, the weekend prompt keeps 16 words. One p keeps few words when the model is sure and many when it isn’t — a fixed k can’t do that.',
    s3readout: '{rule}. Capital prompt: kept {nA} of 1000 words, covering {mA} of the original probability; words other than Paris get {wrongA} after rescaling. Weekend prompt: kept {nB} of 1000 words, covering {mB}.',
    ruleK: 'Top-k, k = {k}', ruleP: 'Top-p, p = {p}',

    s4k: 'Step 4 · Sampling',
    s4t: 'Draw many times: do the frequencies line up with the probabilities?',
    s4e: 'This step asks: the last stage of the pipeline draws one word at random according to the probabilities. No one can predict a single draw — but over many draws, does the <strong>frequency</strong> of each word (its count ÷ the number of draws) approach its probability? We use “This weekend I want to go” at T = 1 with no truncation, and lump every draw from the 990-word tail into one column. The gap is measured by the <strong>total variation distance</strong> TV = ½ Σ |frequency − probability| over the 11 columns. It runs from 0 to 1 and smaller is better: it is the smallest share of the draws you would have to change to make the frequencies match exactly. The random numbers come from a seeded pseudo-random generator, so runs are reproducible. (<a class="xlink" href="../../../probability/stochastic/monte-carlo/#step2">→ Monte Carlo, step 2: why sampling error shrinks like 1/√N</a>)',
    c4a: 'Frequency (bars) vs probability (white ticks)',
    c4b: 'TV against number of draws N (log axis)',
    lgFreq: 'sampled frequency', lgProb: 'probability', lgTv: 'measured TV trace', lgTheory: 'approx. expectation ½Σ√(2p(1−p)/(πN))',
    draw1: 'Draw 1', draw10: 'Draw 10', draw100: 'Draw 100', drawAuto: 'Keep drawing to 10,000', reset4: 'Reset',
    s4hint: 'What to try: press “Draw 1” a few times — the bars jump about and TV is large. Then press “Keep drawing to 10,000”: the bars settle onto the white ticks and the “TV against number of draws” chart traces a falling line that hugs the dashed curve — 100 times more draws cut TV to roughly a tenth. “Reset” clears the counts and the trace together.',
    s4readout: '{N} draws so far{prog}. TV = {tv} (approximate expectation for this many draws: {exp}). Most drawn: “{w}”, {c} times — frequency {f}, probability {p}.',
    s4empty: 'No draws yet. Press “Draw 1” or “Keep drawing to 10,000”.',
    s4prog: ' (drawing…)',

    s5k: 'Step 5 · Word by word',
    s5t: 'Writing one word after another: what kind of text do temperature and truncation produce?',
    s5e: 'This step asks: repeat “score → divide by temperature → truncate → draw” many times — what does the resulting text look like? We switch to a tiny model with 12 words that scores the next word by looking only at the previous one (a first-order model, i.e. a Markov chain; <a class="xlink" href="../../../probability/stochastic/markov-chains/#step1">→ Markov chains, step 1: walking one path</a>). Transitions that fit its toy grammar (such as “the cat → chases”) score between 0.4 and 3.0; every transition that breaks it (such as “the moon → the cat”) scores −2. Each passage is 24 words starting after a full stop. Two measures: <strong>repeat rate</strong> = the share of three-word windows that already appeared earlier in the passage (higher = more repetitive); <strong>broken rate</strong> = the share of the 24 transitions that break the grammar (higher = more garbled).',
    c5: 'Average over 200 passages, against temperature T',
    lgRep: 'repeat rate', lgOdd: 'broken rate', lgRef5: 'dashed = no truncation (p = 1)', lgDot: 'white dot = the passage above',
    textLabel: 'Generated text (small number = probability the word was drawn with; pink underline = a transition that breaks the grammar):',
    pSlider5: 'Top-p threshold p',
    write5: 'Write a passage', seed5: 'New seed (same T and p)',
    s5hint: 'What to try: drag T to 0.2 and press “Write a passage” — it loops “the cat chases a ball .” over and over: a high repeat rate and no pink underlines. Drag T to 2.5: no more loops, but pink underlines appear one after another. Finally hold T = 1.5 and lower p from 1 to 0.8: on the chart the pink curve at T = 1.5 drops to almost 0 while the cyan curve rises only a little — truncation removes exactly the low-scoring, ungrammatical transitions.',
    s5readout: 'This passage (T = {T}, p = {p}, seed {seed}): repeat rate {rep}, {odd} broken transitions ({oddShare}), {distinct} different words used. Average of 200 passages at these settings: repeat rate {mRep}, broken rate {mOdd}.',
    s5writing: 'Writing word by word: {k}/{n}',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One pipeline, four knobs',
    s6fin: 'For every word it writes, the model runs the same pipeline: <strong>score</strong> each word (a logit) → <strong>softmax</strong> into probabilities (only score differences matter) → <strong>divide by temperature T</strong> (T &lt; 1 plays safe, T &gt; 1 takes risks) → <strong>truncate</strong> (top-k keeps a fixed k; top-p keeps more or fewer depending on how sure the model is) → <strong>draw one</strong> (frequencies approach probabilities as draws pile up). Small risks at each position add up over a long text, so truncation and temperature together decide whether the writing comes out repetitive, fluent or garbled.',
    formula: 'p_i = e^(z_i / T) ÷ Σ_j e^(z_j / T)\nP(at least one tail word) = 1 − (1 − q)^L\nTV = ½ Σ |frequency − probability|',
    boundary: 'Limits: the scores on this page are hand-set toy numbers. The step 5 model looks only at the previous word; real models read the whole context, have tens of thousands of words, and produce a different distribution at every position, so step 2’s “independent positions, same q” is only an estimate. Real systems also use repetition penalties, min-p, beam search and other decoding methods. Temperature and truncation change how the model chooses, not what it knows — they cannot make it more truthful.',
    linksTitle: 'Where to go next',
    lk1: '→ Entropy, step 2: one number for how spread out a distribution is',
    lk2: '→ Attention, step 1: softmax turns scores into weights',
    lk3: '→ Markov chains, step 1: a random path that only remembers the last step',
    lk4: '→ Monte Carlo, step 2: sampling error shrinks like 1/√N',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “How an LLM Writes Word by Word”.',

    tail: 'other 990 words',
    w_paris: 'Paris', w_lyon: 'Lyon', w_marseille: 'Marseille', w_a: 'a', w_beautiful: 'beautiful', w_famous: 'famous', w_which: 'which', w_nice: 'Nice', w_europe: 'Europe', w_rome: 'Rome',
    w_hiking: 'hiking', w_beach: 'to the beach', w_movie: 'to a movie', w_camping: 'camping', w_shopping: 'shopping', w_fishing: 'fishing', w_museum: 'to a museum', w_swimming: 'swimming', w_running: 'running', w_picnic: 'for a picnic',
    tk_stop: '.', tk_cat: 'the cat', tk_dog: 'the dog', tk_bird: 'the bird', tk_chases: 'chases', tk_watches: 'watches', tk_finds: 'finds', tk_ball: 'a ball', tk_fish: 'a fish', tk_moon: 'the moon', tk_shadow: 'a shadow', tk_then: 'then'
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
