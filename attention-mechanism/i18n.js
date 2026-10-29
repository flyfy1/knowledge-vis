const STR = {
  zh: {
    docTitle: '注意力机制 · 每个词决定看谁', back: '← 知识索引', pageTitle: '注意力机制 · 每个词决定看谁',
    tagline: '从「查询与键的点积」到 softmax 权重、加权求和，再到整句的注意力矩阵：每个词怎样决定「看谁多一点」。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 查询与键', nav1: '1 分数变权重', nav2: '2 加权求和', nav3: '3 整句矩阵', nav4: '4 为何除以 √d', nav5: '5 终章',
    tok0: 'The', tok1: 'cat', tok2: 'sat', tok3: 'on', tok4: 'the', tok5: 'mat',
    s0k: '第 0 步 · 查询与键', s0t: '一个词怎样决定「看谁」？',
    s0e: '这一步要回答：一个词（查询）怎样给其他词打「相关度」分？每个词有一个<strong>键向量</strong>（彩色箭头，表示「我是什么」）；正在提问的词发出一个<strong>查询向量</strong>（白色箭头，表示「我想找什么」）。两者的<strong>点积</strong> q·k = |q||k|cosθ 就是相关度分数：方向越一致分越高，反向则为负。先点选提问的词，再拖动「旋转查询」：长度不变，看哪个键最先被指向、下方柱高怎样变化；再拖「拉长查询」：方向不变，分数按比例放大。这里的向量是手工设定的二维玩具数据，不是训练出来的。',
    s0tokL: '选择提问的词', s0rotL: '旋转查询（度）', s0mulL: '拉长查询（倍）', s0reset: '重置查询', cv0: '二维平面上的键向量、查询向量与点积分数柱',
    s0Q: '白色 = 「{w}」的查询', s0Keys: '彩色 = 各词的键', s0Bars: '分数 = 查询 · 键（点积）',
    s0ro: '「{w}」的查询长度 <b>{n}</b>，得分最高的键是「<b>{top}</b>」，分数 <b>{s}</b>（点积 = |q||k|cosθ，θ 为两向量夹角）。',
    s0term: '点积 = 对应分量相乘再相加；它的大小同时受夹角（方向）和长度影响。',
    s1k: '第 1 步 · 分数变权重', s1t: '怎样把分数变成「看多少」？',
    s1e: '这一步要回答：分数有正有负，怎样变成加起来等于 1 的「注意力权重」？<strong>softmax</strong> 先把每个分数 s 变成 e^(β·s)（恒为正，β 是锐度），再除以总和。上图是「sat」对各词的原始分数（步骤 0 的默认查询），下图是权重。拖动「锐度 β」，查询和键保持不变：β 变大，最高分的词几乎独占权重；β 趋向 0，权重趋于平均（每词 1/6）。β = 0.71 就是标准做法 1/√d_k（本页 d_k = 2，第 4 步解释为什么要除以 √d_k）。',
    s1bL: '锐度 β（标准值 0.71）', s1reset: '重置锐度', cv1: '原始分数与 softmax 权重的柱图',
    s1Sc: '「{w}」对每个词的原始分数', s1W: 'softmax 权重（β = {b}）', s1Uni: '平均线 1/6',
    s1ro: 'β = {b}：权重最大的是「<b>{top}</b>」，占 <b>{m}</b>；熵 <b>{h}</b> 比特（均匀分布为 {hm} 比特）；六个权重之和 {sum}。',
    s1term: '熵 = 衡量权重有多分散：全部平均时最大，集中到一个词时为 0（单位：比特，越小越集中）。',
    s2k: '第 2 步 · 加权求和', s2t: '权重怎样变成输出？',
    s2e: '这一步要回答：知道了「看谁多一点」，这个词的新表示是什么？每个词还有一个<strong>值向量</strong>（细箭头，表示「我能提供的内容」）。输出 = 各值向量按权重相加：o = Σ wⱼ·vⱼ。粗箭头把「权重 × 值」首尾相连，白点就是输出。拖动「查询方向」（长度不变，用标准的 1/√d_k）：看权重柱和粗箭头链怎样改变，绿线是输出点走过的轨迹；按「扫描」自动转一圈，亮线是已走过的部分。因为权重非负且和为 1，输出总落在值向量围成的范围之内。',
    s2thL: '查询方向（度）', s2play: '▶ 扫描一圈', s2pause: '⏸ 暂停', s2reset: '重置并停止', cv2: '值向量、加权链、输出点轨迹和权重柱',
    s2Out: '输出 o', s2Cap: '细箭头 = 值；粗链 = 权重×值', s2Wt: '当前权重',
    s2ro: '查询方向 <b>{d}°</b>：权重最大的是「<b>{top}</b>」；输出 o = (<b>{ox}</b>, <b>{oy}</b>)；轨迹已画 {k} / {n} 段。',
    s2term: '值向量 = 词「可被取走的内容」；输出是它们的加权平均，所以不会跑出这些向量围成的范围。',
    s3k: '第 3 步 · 整句矩阵', s3t: '整句话一起看：注意力矩阵',
    s3e: '这一步要回答：六个词同时各自提问，会得到怎样的表格？每一行是提问的词，每一列是被看的词，格子里是权重（行内相加为 1，越亮越大）。拖动「旋转所有查询」：键不变，相当于改变查询的生成方式（教学上代替训练出的权重矩阵），图案跟着重排。点「因果遮罩」：每个词只能看自己和前面的词（语言模型逐词生成时的做法），被遮住格子的权重为 0，其余重新归一。下方柱图是所选行的权重。',
    s3thL: '旋转所有查询（度）', s3tokL: '选择要细看的行', s3reset: '重置矩阵', cv3: '六个词的注意力权重矩阵与所选行的柱图',
    s3Cols: '列 = 被看的词（键）', s3Rows: '行 = 提问的词', s3Row: '「{w}」这一行的权重',
    s3Mf: '无遮罩（每个词看全句）', s3Mc: '因果遮罩（只看自己和前面）', s3MaskOn: '因果遮罩：开（点击关闭）', s3MaskOff: '因果遮罩：关（点击开启）',
    s3ro: '查询旋转 <b>{th}°</b>，{mode}：各行权重之和在 {lo}–{hi} 之间；上三角（只看后面的词）的权重合计 <b>{up}</b>。选中「{w}」：最关注「<b>{top}</b>」，权重 <b>{tv}</b>。',
    s3term: '遮罩后被遮格子取 0，再对剩下的格子做 softmax，所以每一行仍然相加为 1。',
    s4k: '第 4 步 · 为何除以 √d', s4t: '为什么要除以 √d_k？',
    s4e: '这一步要回答：向量维度 d 变大后，点积会怎样？随机向量 q 与 k（每个分量服从标准正态分布）的点积，标准差约为 √d。维度越大，分数越分散，softmax 越容易变成「一个词独占」；此时 softmax 饱和、梯度很小（本页只演示权重的集中程度，不演示训练）。把分数除以 √d 后，标准差回到约 1。拖动「维度 d」，其他不变：看橙色直方图（未缩放，横轴固定为 ±64）变宽、青色直方图（缩放后，横轴固定为 ±4）基本不变，以及下方单次试验里橙色柱是否「一柱擎天」。数据来自 300 次随机试验，每次 8 个键。',
    s4eL: '维度 d（2 的幂）', s4reset: '重置维度', cv4: '点积直方图（未缩放与缩放后）与单次试验的权重柱',
    s4HU: '未缩放点积 q·k 的分布（标准差 {sd}）', s4HS: '缩放后 q·k/√d 的分布（标准差 {sd}）', s4Trial: '单次试验：8 个键的权重', s4Leg: '橙色 = 未缩放 softmax，青色 = 缩放后 softmax',
    s4ro: 'd = <b>{d}</b>：未缩放点积的标准差 <b>{sr}</b>（理论 √d = {ts}），缩放后 <b>{ss}</b>；8 个键里最大权重的平均值：未缩放 <b>{mu}</b>，缩放后 <b>{ms}</b>。',
    s4term: '标准差 = 数据偏离平均值的典型幅度。随机试验会有小起伏，√d 是期望值。',
    s5k: '第 5 步 · 终章', s5t: '收束：三步算出一个词的新表示',
    s5e: '一个词怎样「环顾四周」：先用查询和键的点积打分，再用 softmax 变成权重，最后对值向量加权求和。',
    c1t: '点积 = 相关度', c1b: '查询与键越同向分越高；长度也会放大分数（第 0 步）。',
    c2t: 'softmax = 权重', c2b: '把分数变成非负且和为 1 的权重；β 越大越集中（第 1 步）。',
    c3t: '加权求和 = 输出', c3b: '输出是值向量的加权平均，落在这些向量围成的范围内（第 2 步）。',
    c4t: '缩放与遮罩', c4b: '除以 √d_k 防止高维时权重塌缩成一个词；因果遮罩让每个词只看自己和前面（第 3、4 步）。',
    modelT: '模型与局限',
    modelB: '全页是手工设定的二维玩具向量（d_k = 2），不是训练出的 Q、K、V；真实模型使用高维向量、多个注意力头，以及由数据学出的线性投影。注意力权重只描述这一层怎样混合信息，不等于对模型输出原因的完整解释。第 4 步是随机模拟，数字会随随机种子起伏。',
    linksT: '想从别处继续',
    link1: '熵 · 惊讶标价：本页读数里的「熵」是怎么定义的', link2: '线性变换 · 基向量记账：真实模型里 Q、K、V 正是矩阵对向量的变换', link3: '梯度下降 · 生死线：这些投影矩阵靠梯度下降训练',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Attention · Every Word Decides Where to Look', back: '← Knowledge Index', pageTitle: 'Attention · Every Word Decides Where to Look',
    tagline: 'From the dot product of query and key, through softmax weights and a weighted sum, to a whole-sentence attention matrix: how each word decides whom to look at.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Query & key', nav1: '1 Scores to weights', nav2: '2 Weighted sum', nav3: '3 Sentence matrix', nav4: '4 Why divide by √d', nav5: '5 Finale',
    tok0: 'The', tok1: 'cat', tok2: 'sat', tok3: 'on', tok4: 'the', tok5: 'mat',
    s0k: 'Step 0 · Query and key', s0t: 'How does a word decide whom to look at?',
    s0e: 'This step answers: how does one word (the query) score every other word for relevance? Each word has a <strong>key vector</strong> (coloured arrow: “what I am”). The word asking sends out a <strong>query vector</strong> (white arrow: “what I am looking for”). Their <strong>dot product</strong> q·k = |q||k|cosθ is the relevance score: the more aligned the directions the higher the score, and opposite directions score negative. First pick the asking word, then drag “rotate query”: with the length fixed, which key does it point at first, and how do the bars change? Then drag “stretch query”: the direction stays and scores scale up in proportion. The vectors are hand-set 2-D toy data, not trained.',
    s0tokL: 'Choose the asking word', s0rotL: 'Rotate query (degrees)', s0mulL: 'Stretch query (times)', s0reset: 'Reset query', cv0: 'Key vectors, query vector and dot-product score bars in a 2-D plane',
    s0Q: 'white = query of “{w}”', s0Keys: 'coloured = key of each word', s0Bars: 'score = query · key (dot product)',
    s0ro: 'The query of “{w}” has length <b>{n}</b>; the highest-scoring key is “<b>{top}</b>” with score <b>{s}</b> (dot product = |q||k|cosθ, θ the angle between the vectors).',
    s0term: 'Dot product = multiply matching components and add; its size depends on both the angle (direction) and the lengths.',
    s1k: 'Step 1 · Scores to weights', s1t: 'How do scores become “how much to look”?',
    s1e: 'This step answers: scores can be positive or negative, so how do they become attention weights that add up to 1? <strong>Softmax</strong> turns each score s into e^(β·s) (always positive; β is the sharpness) and divides by the total. The top chart shows the raw scores of “sat” against every word (the default query from step 0); the bottom chart shows the weights. Drag “sharpness β” with query and keys fixed: as β grows, the top-scoring word takes almost all the weight; as β → 0, the weights approach an even split (1/6 each). β = 0.71 is the standard choice 1/√d_k (here d_k = 2; step 4 explains why we divide by √d_k).',
    s1bL: 'Sharpness β (standard value 0.71)', s1reset: 'Reset sharpness', cv1: 'Bar charts of raw scores and softmax weights',
    s1Sc: 'Raw scores of “{w}” against every word', s1W: 'Softmax weights (β = {b})', s1Uni: 'even split 1/6',
    s1ro: 'β = {b}: the largest weight is on “<b>{top}</b>”, <b>{m}</b> of the total; entropy <b>{h}</b> bits (an even split gives {hm} bits); the six weights sum to {sum}.',
    s1term: 'Entropy = how spread out the weights are: largest when all are equal, 0 when one word takes everything (unit: bits; smaller = more concentrated).',
    s2k: 'Step 2 · The weighted sum', s2t: 'How do weights become an output?',
    s2e: 'This step answers: once we know “who to look at more”, what is this word’s new representation? Each word also has a <strong>value vector</strong> (thin arrow: “the content I can offer”). The output is the weighted sum of the values: o = Σ wⱼ·vⱼ. The thick arrows chain “weight × value” head to tail, and the white dot is the output. Drag “query direction” (length fixed, standard 1/√d_k scaling): watch how the weight bars and the arrow chain change; the green line is the path the output has traced; press “Sweep” to turn through a full circle automatically, the bright part being what has been covered. Because the weights are non-negative and sum to 1, the output always stays inside the region spanned by the value vectors.',
    s2thL: 'Query direction (degrees)', s2play: '▶ Sweep full turn', s2pause: '⏸ Pause', s2reset: 'Reset and stop', cv2: 'Value vectors, weighted chain, output trace and weight bars',
    s2Out: 'output o', s2Cap: 'thin = values; thick = weight × value', s2Wt: 'Current weights',
    s2ro: 'Query direction <b>{d}°</b>: the largest weight is on “<b>{top}</b>”; output o = (<b>{ox}</b>, <b>{oy}</b>); trace drawn {k} / {n} segments.',
    s2term: 'Value vector = the content a word can hand over; the output is their weighted average, so it never leaves the region these vectors span.',
    s3k: 'Step 3 · The sentence matrix', s3t: 'The whole sentence at once: the attention matrix',
    s3e: 'This step answers: if all six words ask at the same time, what table do we get? Each row is an asking word, each column a word being looked at, and each cell is a weight (rows add up to 1; brighter = larger). Drag “rotate all queries”: the keys stay put, which stands in for changing how queries are produced (a teaching substitute for trained weight matrices), and the pattern rearranges. Press “causal mask”: each word may only see itself and the words before it (how a language model generates word by word); masked cells get weight 0 and the rest are renormalised. The bar chart below shows the weights of the selected row.',
    s3thL: 'Rotate all queries (degrees)', s3tokL: 'Choose a row to inspect', s3reset: 'Reset matrix', cv3: 'Attention weight matrix of six words and bars of the selected row',
    s3Cols: 'columns = words looked at (keys)', s3Rows: 'rows = asking words', s3Row: 'Weights in the row of “{w}”',
    s3Mf: 'no mask (every word sees the whole sentence)', s3Mc: 'causal mask (only itself and earlier words)', s3MaskOn: 'Causal mask: on (click to turn off)', s3MaskOff: 'Causal mask: off (click to turn on)',
    s3ro: 'Query rotation <b>{th}°</b>, {mode}: row sums lie between {lo} and {hi}; the weight in the upper triangle (looking at later words) totals <b>{up}</b>. Selected “{w}”: it attends most to “<b>{top}</b>” with weight <b>{tv}</b>.',
    s3term: 'Masked cells are set to 0 before softmax runs over the remaining cells, so every row still sums to 1.',
    s4k: 'Step 4 · Why divide by √d', s4t: 'Why divide by √d_k?',
    s4e: 'This step answers: what happens to dot products when the dimension d grows? For random vectors q and k (each component standard normal), the dot product has a standard deviation of about √d. The larger d is, the more spread out the scores, and the easier softmax collapses onto one word; softmax then saturates and its gradient becomes tiny (this page shows only how concentrated the weights get, not training). Dividing the scores by √d brings the standard deviation back to about 1. Drag “dimension d” with everything else fixed: the orange histogram (unscaled, axis fixed at ±64) widens while the cyan one (scaled, axis fixed at ±4) barely changes, and in the single trial below the orange bar may take almost everything. The data come from 300 random trials of 8 keys each.',
    s4eL: 'Dimension d (power of 2)', s4reset: 'Reset dimension', cv4: 'Dot-product histograms (unscaled and scaled) and the weight bars of one trial',
    s4HU: 'Unscaled dot product q·k (standard deviation {sd})', s4HS: 'Scaled q·k/√d (standard deviation {sd})', s4Trial: 'One trial: weights over 8 keys', s4Leg: 'orange = unscaled softmax, cyan = scaled softmax',
    s4ro: 'd = <b>{d}</b>: standard deviation of the unscaled dot product <b>{sr}</b> (theory √d = {ts}), scaled <b>{ss}</b>; average largest weight among 8 keys: unscaled <b>{mu}</b>, scaled <b>{ms}</b>.',
    s4term: 'Standard deviation = the typical size of deviations from the mean. Random trials wobble a little; √d is the expected value.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: three steps to a word’s new representation',
    s5e: 'How a word “looks around”: score with the dot product of query and key, turn scores into weights with softmax, then take the weighted sum of the values.',
    c1t: 'Dot product = relevance', c1b: 'The more query and key point the same way, the higher the score; length scales the score too (step 0).',
    c2t: 'Softmax = weights', c2b: 'Scores become non-negative weights that sum to 1; a larger β concentrates them (step 1).',
    c3t: 'Weighted sum = output', c3b: 'The output is a weighted average of the values and stays inside the region they span (step 2).',
    c4t: 'Scaling and masking', c4b: 'Dividing by √d_k keeps the weights from collapsing onto one word in high dimension; the causal mask lets each word see only itself and earlier words (steps 3 and 4).',
    modelT: 'Model and limits',
    modelB: 'Everything here is a hand-set 2-D toy (d_k = 2), not trained Q, K and V; real models use high-dimensional vectors, several attention heads, and linear projections learned from data. Attention weights describe how one layer mixes information; they are not a complete explanation of why a model gave its output. Step 4 is a random simulation, so its numbers wobble with the seed.',
    linksT: 'Continue elsewhere',
    link1: 'Entropy · pricing surprise: where the “entropy” readout on this page comes from', link2: 'Linear transform · basis ledger: in real models Q, K and V are matrix transforms of vectors', link3: 'Gradient descent · the life-or-death line: these projection matrices are trained by gradient descent',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result'
  }
};
let currentLang = 'en';
function t(key, vars = {}) { let out = (STR[currentLang] && STR[currentLang][key]) || key; return out.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''); }
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (_) {}
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { b.classList.toggle('active', b.dataset.lang === currentLang); b.setAttribute('aria-pressed', b.dataset.lang === currentLang ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (_) {}
  setLang(saved === 'zh' || saved === 'en' ? saved : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
