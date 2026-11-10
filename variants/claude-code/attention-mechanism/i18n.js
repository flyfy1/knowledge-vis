'use strict';
// Attention lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '注意力 · 一次按相似度加权的查表',
    back: '← 知识索引',
    compare: '对照另一版本：注意力机制 · 每个词决定看谁 →',
    navLabel: '注意力机制步骤导航',
    tagline: '大语言模型读一句话时，每个词都要从别的词那里取信息：「它」要知道自己指谁。做法出奇地简单：拿自己的查询去和每个词的键比相似度，按相似度把它们的值混在一起。七步里你会从一张四行的小表出发，一路走到整句话的注意力矩阵，再看清它的两个盲点。',
    nav0: '0 软查表', nav1: '1 softmax', nav2: '2 Q、K、V', nav3: '3 整句矩阵', nav4: '4 除以 √d', nav5: '5 词序', nav6: '6 收束',
    keyName: '键 {k} · 值 {v}',
    tok0: '猫', tok1: '追', tok2: '球', tok3: '它', tok4: '累了',
    word0: '狗', word1: '咬', word2: '人',

    s0k: '第 0 步 · 查表的两种方式',
    s0t: '只取最像的那一条，和按相似度把每条都混一点，有什么不同？',
    s0e: '这一步要回答：手里有一个<strong>查询</strong>（想找什么），怎样从一张小表里取出答案？表里有 4 条记录，每条有一个<strong>键</strong>（拿来被比对的二维向量，图中彩色箭头，长度都是 1）和一个<strong>值</strong>（要取出的内容，这里就是一个数）。比对用<strong>点积</strong> q·k = |q| |k| cos θ：两个箭头越同向，得分越高（<a class="xlink" href="../../../computing/ml/embeddings/#step1">→ 词向量页第 1 步：怎样衡量两个词有多相似</a>）。<strong>硬查表</strong>只取得分最高那条的值。<strong>软查表</strong>把 4 个得分变成加起来等于 1 的权重 w（下一步细讲），输出 Σ wⱼ·vⱼ，也就是 4 个值的加权平均。注意力就是软查表。本步查询长度固定为 2.5。',
    q0Slider: '查询方向（°）', sweep0: '把查询转一整圈',
    c0a: '查询（白色）与 4 个键（彩色）', c0b: '输出 vs 查询方向（°）',
    s0lgHard: '硬查表：取得分最高的值', s0lgSoft: '软查表：Σ w·v', s0lgRef: '整圈参考（未走过的部分）',
    s0lgQ: '查询', s0lgW: '键末端圆点的面积 = 软查表给它的权重',
    s0readout: '查询方向 {a}°：得分 {s}；权重 {w}。硬查表取第 {b} 条 → {hard}；软查表 Σ w·v = {soft}。',
    s0hint: '观察顺序：慢慢拖查询方向（或按「转一整圈」）。在「输出 vs 查询方向」图里，橙色的硬查表是台阶：查询越过两个键之间的分界时，输出一下跳 {jmin} 到 {jmax}；青色的软查表平滑过渡，每转 1° 最多变 {slope}。为什么要平滑：模型靠「参数推一点，输出变多少」来学习（<a class="xlink" href="../../../computing/ml/backpropagation/#step1">→ 反向传播页第 1 步：推一下看变化</a>）。台阶上推一点要么完全不变、要么突然跳，这个变化率学不到东西；软查表处处有确定的变化率。',

    s1k: '第 1 步 · 得分变权重',
    s1t: '得分怎样变成权重？「尖锐度」调的是什么？',
    s1e: '这一步要回答：得分可正可负、可大可小，怎样变成「都 ≥ 0、加起来等于 1」的权重？用 <strong>softmax</strong>：wⱼ = e^(β·sⱼ) / Σₖ e^(β·sₖ)。指数保证每项为正，除以总和保证和为 1。β 是<strong>尖锐度</strong>（它的倒数常叫<strong>温度</strong>，<a class="xlink" href="../../../computing/ml/llm-sampling/#step1">→ 文本生成页第 1 步：温度怎样把分布捏尖或摊平</a>）：β = 0 时人人平分；β 越大，得分最高的那条拿走越多。给所有得分同时加一个常数 c，分子分母都乘上 e^(β·c)，权重不变：只有得分之间的差有意义。用<strong>有效条数</strong> 1 / Σ wⱼ² 概括权重有多分散：4 条平分时为 4，全给一条时为 1。本步查询固定在 60°、长度 2，离键 1、键 2 差不多一样近。',
    betaSlider: '尖锐度 β', shiftSlider: '所有得分加上 c',
    c1a: '得分 sⱼ + c', c1b: '权重 wⱼ（和为 1）',
    s1readout: 'β = {b}，c = {c}：得分 {s}；权重 {w}（和 = {sum}）；有效条数 {eff}。',
    s1hint: '观察顺序：先把 c 拖来拖去：「得分」图的柱子整体升降，「权重」图纹丝不动。再拖 β：β = 0 时四根一样高（各 0.25，有效条数 4）；β 增大，键 1 和键 2 抢走几乎全部权重；β = 5 时键 1 拿到 {w5}，有效条数降到 {e5}。',

    s2k: '第 2 步 · 一个词向别的词提问',
    s2t: '在「猫追球，它累了」里，「它」该看哪个词？',
    s2e: '这一步要回答：一句话里，每个词怎样用软查表从别的词那里取信息？例句「猫追球，它累了」切成 5 个词，每个词有一个二维<strong>词向量</strong> x（手工设定，不是训练出来的）。每个词同时扮演三个角色：用 q = W_Q·x 去问（<strong>查询</strong>），用 k = W_K·x 被比对（<strong>键</strong>），用 v = W_V·x 被取走（<strong>值</strong>）。W_Q、W_K、W_V 是三个矩阵（<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step0">→ 线性变换页第 0 步：四个数怎样移动整个平面</a>），真实模型里靠训练得到。这里 W_K、W_V 取单位矩阵（k = v = x），W_Q = 3 × 旋转 φ，只留一个旋钮 φ。得分 = q·k / √2（2 是向量维数 d，第 4 步解释为什么要除以 √d），再对这个词的 5 个得分做 softmax。',
    phiSlider: 'W_Q 的旋转角 φ（°）', askLabel: '提问的词：',
    c2a: '词向量平面：彩点 = 键，箭头 = 查询方向', c2b: '提问词分给每个词的权重',
    s2lgQ: '白色箭头 = 提问词的查询方向', s2lgRing: '彩点外圈越大 = 分到的权重越大',
    s2readout: '「{tok}」提问，φ = {phi}°：得分 {s}；权重 {w}。它最关注「{top}」（{wt}）。',
    s2hint: '观察顺序：先选「它」、φ = 0°（此时 W_Q 和 W_K 只差一个倍数）：查询与自己的键同向，「它」把权重几乎平分给方向相近的「球」（{a0}）和自己（{a1}）。把 φ 拖到 90°：查询转向「猫」，「猫」的权重变成 {a2}。φ 保持 90°，改选「猫」提问：它分给「它」的只有 {a3}。注意力不对称：A 看 B 多，不代表 B 看 A 多，因为 W_Q ≠ W_K。',

    s3k: '第 3 步 · 整句一起算',
    s3t: '五个词同时提问，得到一张什么样的表？',
    s3e: '这一步要回答：所有词同时做第 2 步，得到什么？把每个词提问得到的权重排成一行，就是 5 × 5 的<strong>注意力矩阵</strong> A：第 i 行是第 i 个词分给各词的权重，每行和为 1。每个词的输出 oᵢ = Σⱼ Aᵢⱼ·vⱼ 是值向量的加权平均，所以一定落在所有值向量围成的多边形（凸包）里。写成矩阵就是 <strong>O = softmax(Q·Kᵀ / √d)·V</strong>。逐词生成文字的模型还要加<strong>因果遮罩</strong>：每个词只许看自己和前面的词（后面的词还没生成），做法是在 softmax 之前把右上三角的得分设成 −∞，对应权重就是 0。φ 与第 2 步共用。',
    maskOff: '不遮罩', maskOn: '因果遮罩', maskOffR: '不加遮罩', maskOnR: '加因果遮罩',
    c3a: '注意力矩阵 A（行 = 提问的词，列 = 被看的词）', c3b: '输出 oᵢ（空心圈）与值向量 vⱼ（实心点）',
    s3lgHull: '虚线 = 值向量围成的多边形（凸包）', s3lgPair: '同色的实心点和空心圈属于同一个词',
    s3readout: 'φ = {phi}°，{mask}：每行之和 {sums}；右上三角权重合计 {upper}；第一行 = [{r0}]；5 个输出都在值向量围成的多边形内：{inside}。',
    yes: '是', no: '否',
    s3hint: '观察顺序：先看矩阵每一行的格子（颜色越亮权重越大，数字就是权重），每行加起来都是 1。拖 φ：整张表一起变，空心圈在实心点之间滑动，但从不跑出它们围成的多边形。切到「因果遮罩」：右上三角全部变成 0，第一行只剩「猫」看自己（1.00），最后一行仍能看全部 5 个词。',

    s4k: '第 4 步 · 维数变大以后',
    s4t: '向量维数变大，为什么得分要除以 √d？',
    s4e: '这一步要回答：真实模型的向量有几十到几百维，点积会怎样？设 q、k 的 d 个分量彼此独立，都是均值 0、方差 1 的随机数。q·k 是 d 项乘积之和，方差是 d，所以它的<strong>标准差</strong>（偏离平均值的典型距离）约为 √d。得分的差距一大，softmax 几乎把全部权重给最高的一条，这叫<strong>饱和</strong>。饱和坏在训练：最大权重 w 对自己得分的变化率是 w(1 − w)，w → 1 时它 → 0，误差信号传不回去（<a class="xlink" href="../../../computing/ml/backpropagation/#step4">→ 反向传播页第 4 步：靠前的层还听得到误差吗</a>）。除以 √d 把得分的标准差拉回到 1 左右。本步是<strong>模拟</strong>：每个 d 做 400 次试验，每次 1 个查询、8 个键，分量取标准正态随机数（固定随机种子，结果可复现）。',
    dSlider: '向量维数 d',
    c4a: '未缩放得分 q·k 的分布', c4a2: '缩放后 q·k / √d 的分布', c4b: '8 个键中最大权重的平均值', c4b2: '梯度 w(1 − w) 的平均值',
    s4lgRaw: '未缩放', s4lgSc: '除以 √d', s4lgNow: '当前 d',
    s4readout: 'd = {d}：q·k 的标准差 {sd}（√d = {rd}），除以 √d 后为 {sds}。8 个键里最大权重平均 {mr}（缩放后 {ms}）；梯度 w(1 − w) 平均 {gr}（缩放后 {gs}）。',
    s4hint: '观察顺序：把 d 从 1 拖到 512。两张分布图里，未缩放的得分越摊越宽（标准差跟着 √d 涨，d = 512 时约 {sd512}），缩放后的形状基本不变。曲线图里，未缩放时最大权重从 {m1} 升到 {m512}，梯度从 {g1} 掉到 {g512}；缩放后，在全部 d 上最大权重保持在 {msLo}–{msHi}，梯度保持在 {gsLo}–{gsHi}。',

    s5k: '第 5 步 · 注意力的盲点',
    s5t: '「狗咬人」和「人咬狗」，注意力分得出来吗？',
    s5e: '这一步要回答：注意力看得见词的顺序吗？回到公式：每个词的输出只取决于它的查询和所有词的键、值，求和不在乎先后。所以把句子里的词换个位置，每个词的输出原样跟着走：单靠注意力，「狗咬人」里的「狗」和「人咬狗」里的「狗」得到完全相同的输出。（因果遮罩按位置遮挡，会带进顺序；本步不加遮罩。）补救办法是<strong>位置编码</strong>：给第 t 个位置的词向量加上一个只取决于 t 的向量 pₜ，这里 pₜ = a·(sin 1.1(t+1), cos 1.1(t+1))，a 是强度。同一个词放在不同位置，输入就不同了。本步 W_Q = 3 × 旋转 50°，W_K = W_V = 单位矩阵。',
    aSlider: '位置编码强度 a',
    c5a: '输出：实心 = 「狗咬人」，空心 = 「人咬狗」',
    c5b: '两种语序的输出距离 vs 强度 a',
    s5lgIn: '小方块 = 加上位置编码后的输入（只画「狗咬人」）',
    s5readout: 'a = {a}：同一个词在两种语序下的输出相差（距离）：{gaps}。',
    s5hint: '观察顺序：a = 0 时，每个词的实心点和空心圈完全重合，读数全是 0：注意力分不出这两句话。把 a 慢慢调大：三个词的实心点与空心圈都分开了，「两种语序的输出距离」图里三条曲线都离开 0。「狗」和「人」是因为它们在两句里换了位置，自己的输入变了；「咬」两句都在第 2 位，自己的输入没变，它的输出也变了，是因为另外两个词的键和值变了。',

    s6k: '第 6 步 · 收束', s6t: '注意力 = 相似度打分 + softmax + 加权平均',
    s6fin: '回顾。<strong>第 0 步</strong>：注意力是软查表，按相似度把所有值混在一起，输出随查询平滑变化，可以学习。<strong>第 1 步</strong>：softmax 把得分变成和为 1 的权重，只有得分差有意义，β 控制尖锐程度。<strong>第 2 步</strong>：每个词经三个矩阵变成查询、键、值，W_Q ≠ W_K 让注意力不对称。<strong>第 3 步</strong>：整句一起算得到每行和为 1 的矩阵，输出在值向量的凸包里；因果遮罩挡住后文。<strong>第 4 步</strong>：维数为 d 时点积标准差约 √d，除以 √d 防止饱和、保住梯度。<strong>第 5 步</strong>：注意力本身对词序视而不见，要靠位置编码。',
    formula: 'Attention(Q, K, V) = softmax(Q·Kᵀ / √d)·V\nwⱼ = e^(β·sⱼ) / Σₖ e^(β·sₖ)',
    boundary: '适用范围：本页所有词向量和矩阵都是手工设定的二维玩具，没有经过训练；真实模型的维数是几十到几千，有多个注意力头并行、多层堆叠，还有残差连接、归一化和前馈层。例句里「它指猫」只是我们选 φ 让它成立，不代表真实模型的权重会这样分配；注意力权重也不等于模型做出判断的完整解释。第 4 步是固定种子的随机模拟，数值会随种子小幅变化，√d 是期望意义上的结论。第 5 步只演示一种正弦位置编码，真实模型还有可学习的、相对位置的等多种做法。',
    linksTitle: '接着去哪',
    lk1: '→ 词向量页第 1 步：怎样衡量两个词有多相似',
    lk2: '→ 文本生成页第 1 步：温度怎样把分布捏尖或摊平',
    lk3: '→ 反向传播页第 4 步：层数多了，靠前的层还听得到误差吗',
    lk4: '→ 线性变换页第 0 步：四个数，拖动整个平面',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《注意力机制 · 每个词决定看谁》的平行版本。'
  },
  en: {
    pageTitle: 'Attention · A Lookup Weighted by Similarity',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Attention · Every Word Decides Where to Look →',
    navLabel: 'Attention mechanism steps',
    tagline: 'When a large language model reads a sentence, every word pulls information from the other words: “it” needs to know what it refers to. The method is surprisingly simple: compare your query with every word’s key, and blend their values in proportion to the similarity. In seven steps you will go from a four-row lookup table to the attention matrix of a whole sentence, and then see its two blind spots.',
    nav0: '0 Soft lookup', nav1: '1 Softmax', nav2: '2 Q, K, V', nav3: '3 The matrix', nav4: '4 Divide by √d', nav5: '5 Word order', nav6: '6 Wrap-up',
    keyName: 'key {k} · value {v}',
    tok0: 'cat', tok1: 'chased', tok2: 'ball', tok3: 'it', tok4: 'tired',
    word0: 'dog', word1: 'bites', word2: 'man',

    s0k: 'Step 0 · Two ways to look something up',
    s0t: 'Take only the best match, or blend every entry by similarity: what is the difference?',
    s0e: 'This step asks: given a <strong>query</strong> (what you are looking for), how do you pull an answer out of a small table? The table has 4 entries. Each has a <strong>key</strong> (a 2-D vector it is compared by, drawn as a coloured arrow of length 1) and a <strong>value</strong> (the content to retrieve, here just a number). The comparison is the <strong>dot product</strong> q·k = |q| |k| cos θ: the more two arrows point the same way, the higher the score (<a class="xlink" href="../../../computing/ml/embeddings/#step1">→ Embeddings, step 1: how to measure how similar two words are</a>). A <strong>hard lookup</strong> returns the value with the top score. A <strong>soft lookup</strong> turns the 4 scores into weights w that add up to 1 (next step) and returns Σ wⱼ·vⱼ, a weighted average of the 4 values. Attention is a soft lookup. The query length is fixed at 2.5 in this step.',
    q0Slider: 'Query direction (°)', sweep0: 'Turn the query a full circle',
    c0a: 'The query (white) and the 4 keys (coloured)', c0b: 'Output vs query direction (°)',
    s0lgHard: 'hard lookup: value with the top score', s0lgSoft: 'soft lookup: Σ w·v', s0lgRef: 'full-circle reference (not yet visited)',
    s0lgQ: 'query', s0lgW: 'dot area at each key tip = its soft-lookup weight',
    s0readout: 'Query direction {a}°: scores {s}; weights {w}. The hard lookup takes entry {b} → {hard}; the soft lookup gives Σ w·v = {soft}.',
    s0hint: 'What to try: drag the query direction slowly (or press “Turn the query a full circle”). In the “Output vs query direction” chart the orange hard lookup is a staircase: when the query crosses the boundary between two keys, the output jumps by {jmin} to {jmax}. The cyan soft lookup glides, changing by at most {slope} per degree. Why smoothness matters: a model learns from “nudge a parameter, see how much the output moves” (<a class="xlink" href="../../../computing/ml/backpropagation/#step1">→ Backpropagation, step 1: nudge and see</a>). On a staircase a nudge either changes nothing or causes a sudden jump, so that rate of change teaches nothing; the soft lookup has a definite rate of change everywhere.',

    s1k: 'Step 1 · Scores into weights',
    s1t: 'How do scores become weights, and what does “sharpness” control?',
    s1e: 'This step asks: scores can be positive or negative, large or small; how do they become weights that are all ≥ 0 and add up to 1? With <strong>softmax</strong>: wⱼ = e^(β·sⱼ) / Σₖ e^(β·sₖ). The exponential makes every term positive and dividing by the total makes them sum to 1. β is the <strong>sharpness</strong> (its reciprocal is usually called the <strong>temperature</strong>, <a class="xlink" href="../../../computing/ml/llm-sampling/#step1">→ LLM sampling, step 1: how temperature sharpens or flattens a distribution</a>): at β = 0 everyone gets an equal share; the larger β, the more the top score takes. Add the same constant c to every score and both the top and the bottom of the fraction are multiplied by e^(β·c), so the weights do not change: only differences between scores matter. The <strong>effective count</strong> 1 / Σ wⱼ² summarises how spread out the weights are: 4 for an even split over 4 entries, 1 when one entry takes everything. Here the query is fixed at 60° with length 2, roughly as close to key 1 as to key 2.',
    betaSlider: 'Sharpness β', shiftSlider: 'Add c to every score',
    c1a: 'Scores sⱼ + c', c1b: 'Weights wⱼ (sum to 1)',
    s1readout: 'β = {b}, c = {c}: scores {s}; weights {w} (sum = {sum}); effective count {eff}.',
    s1hint: 'What to try: first drag c back and forth: the bars in the “Scores” chart rise and fall together while the “Weights” chart does not move at all. Then drag β: at β = 0 all four bars are equal (0.25 each, effective count 4); as β grows, keys 1 and 2 take almost all the weight; at β = 5 key 1 gets {w5} and the effective count drops to {e5}.',

    s2k: 'Step 2 · One word asks the others',
    s2t: 'In “The cat chased the ball; it was tired”, which word should “it” look at?',
    s2e: 'This step asks: inside a sentence, how does each word use a soft lookup to pull information from the others? The example “The cat chased the ball; it was tired” is cut into 5 words (cat, chased, ball, it, tired), each with a 2-D <strong>word vector</strong> x (set by hand, not trained). Every word plays three roles at once: it asks with q = W_Q·x (its <strong>query</strong>), is compared by k = W_K·x (its <strong>key</strong>) and is retrieved as v = W_V·x (its <strong>value</strong>). W_Q, W_K and W_V are three matrices (<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step0">→ Linear transforms, step 0: four numbers move the whole plane</a>) that a real model learns in training. Here W_K and W_V are the identity (k = v = x) and W_Q = 3 × a rotation by φ, leaving a single knob φ. Score = q·k / √2 (2 is the vector dimension d; step 4 explains the √d), and softmax is applied to the word’s 5 scores.',
    phiSlider: 'Rotation of W_Q, φ (°)', askLabel: 'Word asking:',
    c2a: 'Word plane: dots = keys, arrow = query direction', c2b: 'Weight the asking word gives each word',
    s2lgQ: 'white arrow = the asking word’s query direction', s2lgRing: 'bigger ring around a dot = more weight',
    s2readout: '“{tok}” asks, φ = {phi}°: scores {s}; weights {w}. It attends most to “{top}” ({wt}).',
    s2hint: 'What to try: choose “it” with φ = 0° (W_Q is then just a multiple of W_K): the query points along its own key, so “it” splits its weight almost evenly between “ball” ({a0}), which points the same way, and itself ({a1}). Drag φ to 90°: the query swings toward “cat”, whose weight becomes {a2}. Keep φ = 90° and let “cat” ask: it gives “it” only {a3}. Attention is not symmetric: A looking hard at B does not mean B looks hard at A, because W_Q ≠ W_K.',

    s3k: 'Step 3 · The whole sentence at once',
    s3t: 'When all five words ask at once, what kind of table do you get?',
    s3e: 'This step asks: what comes out when every word does step 2 at the same time? Write each word’s weights as one row and you get the 5 × 5 <strong>attention matrix</strong> A: row i holds the weights word i gives each word, and every row sums to 1. Each word’s output oᵢ = Σⱼ Aᵢⱼ·vⱼ is a weighted average of the value vectors, so it always lies inside the polygon they enclose (their convex hull). As matrices: <strong>O = softmax(Q·Kᵀ / √d)·V</strong>. Models that generate text word by word also apply a <strong>causal mask</strong>: each word may look only at itself and earlier words (later ones have not been generated yet). Before the softmax the scores in the upper-right triangle are set to −∞, so their weights become 0. φ is shared with step 2.',
    maskOff: 'No mask', maskOn: 'Causal mask', maskOffR: 'no mask', maskOnR: 'causal mask',
    c3a: 'Attention matrix A (row = asking word, column = word looked at)', c3b: 'Outputs oᵢ (rings) and value vectors vⱼ (dots)',
    s3lgHull: 'dashed = polygon enclosed by the value vectors (convex hull)', s3lgPair: 'a dot and a ring of the same colour belong to the same word',
    s3readout: 'φ = {phi}°, {mask}: row sums {sums}; total weight in the upper-right triangle {upper}; first row = [{r0}]; all 5 outputs inside the polygon of the value vectors: {inside}.',
    yes: 'yes', no: 'no',
    s3hint: 'What to try: first read each row of the matrix (brighter = larger weight; the numbers are the weights); every row adds up to 1. Drag φ: the whole table changes and the rings slide among the dots but never leave the polygon they enclose. Switch to “Causal mask”: the upper-right triangle drops to 0, the first row is just “cat” looking at itself (1.00), and the last row can still see all 5 words.',

    s4k: 'Step 4 · When vectors get long',
    s4t: 'As the vector dimension grows, why divide the scores by √d?',
    s4e: 'This step asks: real models use vectors with tens to hundreds of components; what happens to the dot product? Suppose the d components of q and k are independent random numbers with mean 0 and variance 1. Then q·k is a sum of d products, its variance is d, and its <strong>standard deviation</strong> (the typical distance from the average) is about √d. Once the scores are far apart, softmax hands nearly all the weight to the top one: this is <strong>saturation</strong>. Saturation hurts training: the rate at which the largest weight w changes with its own score is w(1 − w), which goes to 0 as w → 1, so the error signal cannot get back (<a class="xlink" href="../../../computing/ml/backpropagation/#step4">→ Backpropagation, step 4: do early layers still hear the error?</a>). Dividing by √d brings the standard deviation of the scores back to about 1. This step is a <strong>simulation</strong>: for each d, 400 trials, each with 1 query and 8 keys whose components are standard normal random numbers (fixed seed, so the results repeat).',
    dSlider: 'Vector dimension d',
    c4a: 'Distribution of the raw scores q·k', c4a2: 'Distribution of the scaled scores q·k / √d', c4b: 'Average largest weight among 8 keys', c4b2: 'Average gradient w(1 − w)',
    s4lgRaw: 'raw', s4lgSc: 'divided by √d', s4lgNow: 'current d',
    s4readout: 'd = {d}: standard deviation of q·k {sd} (√d = {rd}), {sds} after dividing by √d. Average largest weight among 8 keys {mr} ({ms} scaled); average gradient w(1 − w) {gr} ({gs} scaled).',
    s4hint: 'What to try: drag d from 1 to 512. In the two distribution charts the raw scores spread wider and wider (the standard deviation grows like √d, about {sd512} at d = 512) while the scaled ones keep roughly the same shape. In the curve charts, without scaling the largest weight climbs from {m1} to {m512} and the gradient falls from {g1} to {g512}; with scaling, across every d, the largest weight stays within {msLo}–{msHi} and the gradient within {gsLo}–{gsHi}.',

    s5k: 'Step 5 · A blind spot',
    s5t: '“Dog bites man” vs “man bites dog”: can attention tell them apart?',
    s5e: 'This step asks: can attention see word order? Look at the formula again: each word’s output depends only on its own query and on every word’s key and value, and a sum does not care about order. So if you shuffle the words, each word’s output simply moves with it: on attention alone, “dog” in “dog bites man” gets exactly the same output as “dog” in “man bites dog”. (A causal mask blocks by position and so does bring in order; this step uses no mask.) The fix is a <strong>positional encoding</strong>: add to the word vector at position t a vector pₜ that depends only on t, here pₜ = a·(sin 1.1(t+1), cos 1.1(t+1)) with strength a. The same word at a different position then has a different input. In this step W_Q = 3 × a rotation by 50° and W_K = W_V = identity.',
    aSlider: 'Positional-encoding strength a',
    c5a: 'Outputs: filled = “dog bites man”, ring = “man bites dog”',
    c5b: 'Output distance between the two orders vs a',
    s5lgIn: 'small squares = inputs after adding the positional encoding (“dog bites man” only)',
    s5readout: 'a = {a}: distance between the same word’s outputs in the two orders: {gaps}.',
    s5hint: 'What to try: at a = 0 each word’s filled dot sits exactly inside its ring and the readout is all zeros: attention cannot tell the two sentences apart. Raise a slowly: all three words’ dots and rings separate, and all three curves in the “Output distance between the two orders” chart leave 0. For “dog” and “man” this is because they swap positions, so their own inputs change. “bites” is second in both sentences, so its own input does not change; its output moves anyway because the keys and values of the other two words changed.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Attention = similarity scores + softmax + a weighted average',
    s6fin: 'Looking back. <strong>Step 0</strong>: attention is a soft lookup that blends all values by similarity, so its output changes smoothly with the query and can be learned. <strong>Step 1</strong>: softmax turns scores into weights that sum to 1; only score differences matter and β sets the sharpness. <strong>Step 2</strong>: three matrices turn each word into a query, a key and a value, and W_Q ≠ W_K makes attention asymmetric. <strong>Step 3</strong>: the whole sentence gives a matrix whose rows sum to 1, with outputs inside the convex hull of the values; a causal mask hides later words. <strong>Step 4</strong>: in d dimensions the dot product’s standard deviation is about √d, and dividing by √d prevents saturation and keeps the gradient alive. <strong>Step 5</strong>: attention by itself is blind to word order; positional encodings fix that.',
    formula: 'Attention(Q, K, V) = softmax(Q·Kᵀ / √d)·V\nwⱼ = e^(β·sⱼ) / Σₖ e^(β·sₖ)',
    boundary: 'Scope: every word vector and matrix on this page is a hand-set 2-D toy; nothing was trained. Real models use tens to thousands of dimensions, run several attention heads side by side, stack many layers, and add residual connections, normalisation and feed-forward layers. “It refers to the cat” holds in the example only because we chose φ to make it so; it does not show how a real model’s weights would fall, and attention weights are not a full explanation of a model’s decision. Step 4 is a fixed-seed random simulation, so its numbers shift a little with the seed; √d is a statement about the expected size. Step 5 shows one sinusoidal positional encoding; real models also use learned and relative-position schemes, among others.',
    linksTitle: 'Where to go next',
    lk1: '→ Embeddings, step 1: how to measure how similar two words are',
    lk2: '→ LLM sampling, step 1: how temperature sharpens or flattens a distribution',
    lk3: '→ Backpropagation, step 4: with many layers, do early ones still hear the error?',
    lk4: '→ Linear transforms, step 0: four numbers move the whole plane',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Attention · Every Word Decides Where to Look”.'
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
  if (typeof window.refreshAttention === 'function') window.refreshAttention();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ATT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
