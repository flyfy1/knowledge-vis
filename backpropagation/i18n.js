const STR = {
  zh: {
    docTitle: '反向传播 · 误差沿网络回流', back: '← 知识索引', pageTitle: '反向传播 · 误差沿网络回流',
    tagline: '输出错了，每个权重该负多少责任？用最小的网络，从「推一下看变化」走到链式法则、梯度下降，再看深层网络里梯度为什么会消失。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 前向与损失', nav1: '1 推一下看变化', nav2: '2 反向算账', nav3: '3 走下坡', nav4: '4 深层梯度', nav5: '5 终章',
    s0k: '第 0 步 · 前向与损失', s0t: '网络现在错得有多离谱？',
    s0e: '这一步要回答：给定两个权重，这个小网络的输出离目标差多远？网络只有一条链：输入 x = 1，乘权重 w1 得到 a，经过 σ（sigmoid，把任意数压到 0 到 1 之间）得到 h，再乘权重 w2 得到输出 ŷ。<strong>损失</strong> L = ½(ŷ − 1.2)² 衡量输出与目标 1.2 的差距，越小越好。拖动两个权重（或直接点击下方的损失地图）：观察链上的数字怎样逐个变化，以及你的位置落在地图的亮处（损失小）还是暗处（损失大）。',
    s0w1L: '权重 w1', s0w2L: '权重 w2', s0reset: '重置权重', cv0: '网络链条与 w1–w2 损失地图',
    s0Fwd: '前向：数字从左往右流', s0Land: '损失地图（目标 {T}）：亮 = 损失小',
    s0ro: 'a = <b>{a}</b>，h = <b>{h}</b>，ŷ = <b>{y}</b>（目标 {T}），损失 L = <b>{L}</b>。',
    s0term: '损失地图：横轴 w1、纵轴 w2，每个点的颜色是该权重组合下的损失，越亮越小；亮带是满足 w2·σ(w1) = 1.2 的组合。',
    s1k: '第 1 步 · 推一下看变化', s1t: '把一个权重推一下，损失变多少？',
    s1e: '这一步要回答：不用微积分，怎样量出「某个权重该为损失负多少责任」？办法：把这个权重增加一个很小的量 ε，看损失变化多少，再除以 ε，得到<strong>斜率</strong>（权重每增加 1 个单位，损失大约变多少）。曲线是只动所选权重、其余固定时的损失；橙色割线连着原位置和被推过的位置（红点），白色虚线是精确切线（下一步用反向传播算出）。选一个权重，把 ε 从 1 拖向 10^-5：橙线怎样靠近白色虚线？再拖「位置」换一个起点重试。',
    s1b1: '推 w1', s1b2: '推 w2', s1pL: '被推权重的位置', s1eL: '推的幅度 ε（对数）', s1reset: '重置', cv1: '损失曲线、割线与切线',
    s1Ax: '横轴：{w}（另一个权重固定）', s1Leg: '橙 = 推一下得到的割线', s1Leg2: '白虚线 = 精确切线',
    s1ro: '对 {w}：推一下得到的斜率 <b>{sec}</b>；精确斜率 <b>{ex}</b>；差 <b>{d}</b>。ε 越小越接近；到 10^-5 时浮点舍入误差仍可忽略。',
    s1term: 'ε = 推的幅度；割线 = 过两点的直线，斜率 = (L(w+ε) − L(w))/ε；ε → 0 时割线变成切线。每个权重都要推一次，参数一多就太贵：这正是反向传播要解决的问题。',
    s2k: '第 2 步 · 反向算账', s2t: '怎样一次反向扫描就算出所有权重的责任？',
    s2e: '这一步要回答：不逐个去推，能不能从损失出发一路往回乘，一次算出每个权重的斜率？<strong>链式法则</strong>：L 依赖 ŷ，ŷ 依赖 w2，所以 dL/dw2 = (dL/dŷ)·(dŷ/dw2)。下方账本从后往前：先算 dL/dŷ，再乘各处的「本地斜率」（ŷ = w2·h 对 w2 的斜率是 h，对 h 的斜率是 w2；h = σ(a) 的斜率是 h(1−h)；a = w1·x 对 w1 的斜率是 x）。拖动「反向进行到第几步」（或按「自动演示」），每前进一步出现一行新账；改变 w1、w2，所有数字随之重算。读数把反向传播的结果与第 1 步的「推一下」做对照。',
    s2w1L: '权重 w1', s2w2L: '权重 w2', s2stL: '反向进行到第几步', s2play: '▶ 自动演示', s2pause: '⏸ 暂停', s2reset: '重置并停止', cv2: '前向数值与反向账本',
    s2Fwd: '前向数值（上）', s2Bwd: '反向账本（越往下越靠近输入）',
    s2ro: '已反向算到第 <b>{st} / 4</b> 步：dL/dw2 = <b>{w2}</b>，dL/dw1 = <b>{w1}</b>（— 表示还没算到）。对照（中心差分，ε = 10^-5）：dL/dw2 ≈ {n2}，dL/dw1 ≈ {n1}；两种方法最大差距 {e}。',
    s2term: '本地斜率 = 链上相邻两个量之间的变化率；反向传播就是把它们从后往前连乘，每个量只算一次。',
    s3k: '第 3 步 · 走下坡', s3t: '知道了每个权重的责任，怎样让损失变小？',
    s3e: '这一步要回答：拿到反向传播算出的梯度，权重该怎么改？<strong>梯度</strong>是损失对各个权重的斜率排成的向量，指向损失增长最快的方向；<strong>梯度下降</strong>每步把权重沿反方向挪一点：w ← w − η·梯度，其中 η 叫<strong>学习率</strong>（每步挪多远）。点击损失地图选起点（或拖起点滑杆），按「走一步」或「自动运行」：白线是权重走过的轨迹，下方曲线是损失随步数的变化。试试 η = 0.2（稳步下降）、η = 5（在谷底两侧来回跳而不收敛）、η = 8（直接飞出地图）；这些现象只对本页的小网络和这个起点成立。',
    s3w1L: '起点 w1', s3w2L: '起点 w2', s3etaL: '学习率 η', s3step: '走一步', s3run: '▶ 自动运行', s3pause: '⏸ 暂停', s3reset: '重置轨迹与参数', cv3: '损失地图上的梯度下降轨迹与损失曲线',
    s3Land: '损失地图：绿 = 起点，橙 = 当前，白线 = 轨迹', s3Curve: '损失随步数变化',
    s3ro: '第 <b>{k}</b> 步：w1 = {w1}，w2 = {w2}，损失 <b>{L}</b>，梯度长度 {g}，η = {eta}。{note}',
    s3n_idle: '按「走一步」或「自动运行」开始。', s3n_run: '运行中……', s3n_done: '损失已低于 10^-6，停止。', s3n_out: '权重飞出范围，停止（η 过大）。', s3n_max: '达到 400 步仍未收敛，停止。',
    s3term: '梯度的方向是损失增长最快的方向，所以要走反方向；η 太小走得慢，太大会越过谷底。',
    s4k: '第 4 步 · 深层梯度', s4t: '层数多了，靠前的层还听得到误差吗？',
    s4e: '这一步要回答：把网络加深，反向传回来的责任（梯度）会怎样？这里用 n 个单神经元串成的链：每层 a = w·(上一层输出)，经激活函数得到输出，最后输出与目标 0.5 比较。柱高是每一层权重的梯度大小（对数轴，1e-3 即千分之一）。反向时每过一层都要乘「w × 激活函数的斜率」，这个因子小于 1，层数越多梯度越小（梯度消失）。试试：保持 w = 1，切换 sigmoid / tanh / ReLU，把层数加到 12；再把 w 拖到 2.0，看连乘是缩小还是放大。',
    s4nL: '层数 n', s4wL: '每层权重 w', s4actL: '激活函数', s4reset: '重置', cv4: '各层权重梯度大小的柱图',
    act_sigmoid: 'sigmoid', act_tanh: 'tanh', act_relu: 'ReLU',
    s4Cap: '每层权重的梯度大小 |dL/dw|（对数轴）', s4Ax: '层号（1 = 最靠近输入）',
    s4ro: '{n} 层、w = {w}、激活 {act}：输出 ŷ = {y}；第 1 层梯度 <b>{g1}</b>，第 {n} 层梯度 <b>{gn}</b>，最后一层 / 第 1 层 ≈ <b>{ratio}</b>。第 1 层处的因子 w·f′ = {fac}。',
    s4term: '梯度消失 = 靠前层的梯度小到几乎为零，权重基本不更新。本页只算一次梯度、不训练；结论只对这条各层权重相同的单神经元链成立。',
    s5k: '第 5 步 · 终章', s5t: '收束：用一次反向扫描分好责任',
    s5e: '前向算出损失，反向沿链式法则一次连乘出每个权重的梯度，梯度下降据此修改权重；网络一深，连乘因子决定梯度是消失还是增长。',
    c1t: '前向算损失', c1b: '数字从输入流到输出，再与目标比较得到损失（第 0 步）。',
    c2t: '推一下太贵', c2b: '每个权重都要多算一次前向才能量斜率，参数多了不可行（第 1 步）。',
    c3t: '反向连乘', c3b: '链式法则从损失往回乘本地斜率，一次扫描得到所有梯度（第 2 步）。',
    c4t: '下坡与深度', c4b: '梯度下降用学习率 η 走下坡；层数越深，连乘因子决定梯度消失还是增长（第 3、4 步）。',
    modelT: '模型与局限',
    modelB: '全页是极小的单路径网络（1 个输入、1 个隐藏单元、1 个输出，没有偏置，没有批量数据）。真实网络有成千上万个权重和多条路径，反向传播在每个节点把多条路径的责任相加。第 3 步的收敛与振荡现象只对本页的损失和起点成立；第 4 步只比较一次梯度，不是训练曲线。',
    linksT: '想从别处继续',
    link1: '梯度下降 · 二维地形：学习率与地形形状怎样影响下坡', link2: '导数 · 割线逼近：「推一下」得到的割线怎样变成切线', link3: '注意力机制 · 为何除以 √d：softmax 饱和同样会让梯度变小',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Backpropagation · Error Flows Back Through the Network', back: '← Knowledge Index', pageTitle: 'Backpropagation · Error Flows Back Through the Network',
    tagline: 'When the output is wrong, how much blame does each weight carry? Use the smallest network to go from “nudge and see” to the chain rule and gradient descent, then see why gradients vanish in deep networks.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Forward & loss', nav1: '1 Nudge and see', nav2: '2 Backward ledger', nav3: '3 Downhill', nav4: '4 Deep gradients', nav5: '5 Finale',
    s0k: 'Step 0 · Forward pass and loss', s0t: 'How wrong is the network right now?',
    s0e: 'This step answers: given two weights, how far is this tiny network’s output from the target? The network is one chain: input x = 1, multiplied by weight w1 gives a, passed through σ (the sigmoid, which squeezes any number into 0 to 1) gives h, multiplied by weight w2 gives the output ŷ. The <strong>loss</strong> L = ½(ŷ − 1.2)² measures the gap between the output and the target 1.2; smaller is better. Drag the two weights (or click the loss map below): watch the numbers along the chain change one by one, and whether your position lands on a bright part of the map (small loss) or a dark part (large loss).',
    s0w1L: 'Weight w1', s0w2L: 'Weight w2', s0reset: 'Reset weights', cv0: 'The network chain and the w1–w2 loss map',
    s0Fwd: 'Forward: numbers flow left to right', s0Land: 'Loss map (target {T}): bright = small loss',
    s0ro: 'a = <b>{a}</b>, h = <b>{h}</b>, ŷ = <b>{y}</b> (target {T}), loss L = <b>{L}</b>.',
    s0term: 'Loss map: w1 across, w2 up; each point is coloured by the loss at that weight pair, brighter meaning smaller. The bright band is the set of pairs with w2·σ(w1) = 1.2.',
    s1k: 'Step 1 · Nudge and see', s1t: 'Nudge one weight: how much does the loss change?',
    s1e: 'This step answers: without calculus, how can we measure how much blame one weight carries? Add a tiny amount ε to that weight, see how much the loss changes, and divide by ε to get the <strong>slope</strong> (roughly how much the loss changes per unit increase of the weight). The curve is the loss when only the chosen weight moves and the other is fixed; the orange secant joins the original position to the nudged one (red dot), and the dashed white line is the exact tangent (computed by backpropagation in the next step). Pick a weight and drag ε from 1 toward 10^-5: how does the orange line approach the white dashed one? Then drag “position” to try another starting point.',
    s1b1: 'Nudge w1', s1b2: 'Nudge w2', s1pL: 'Position of the nudged weight', s1eL: 'Nudge size ε (log scale)', s1reset: 'Reset', cv1: 'Loss curve, secant and tangent',
    s1Ax: 'horizontal axis: {w} (the other weight fixed)', s1Leg: 'orange = secant from the nudge', s1Leg2: 'white dashed = exact tangent',
    s1ro: 'For {w}: the nudge gives slope <b>{sec}</b>; exact slope <b>{ex}</b>; difference <b>{d}</b>. The smaller ε, the closer; down to 10^-5 floating-point rounding error is still negligible.',
    s1term: 'ε = size of the nudge; secant = the line through two points, slope = (L(w+ε) − L(w))/ε; as ε → 0 the secant becomes the tangent. Every weight needs its own nudge, which gets too expensive with many parameters: exactly the problem backpropagation solves.',
    s2k: 'Step 2 · The backward ledger', s2t: 'How can one backward sweep give every weight’s share of blame?',
    s2e: 'This step answers: instead of nudging weights one at a time, can we start at the loss and multiply backwards to get every weight’s slope in one pass? The <strong>chain rule</strong>: L depends on ŷ and ŷ depends on w2, so dL/dw2 = (dL/dŷ)·(dŷ/dw2). The ledger below runs back to front: first dL/dŷ, then multiply by each “local slope” (for ŷ = w2·h the slope is h with respect to w2 and w2 with respect to h; for h = σ(a) it is h(1−h); for a = w1·x it is x with respect to w1). Drag “how far backward we have gone” (or press “Auto demo”): each step reveals a new line of the ledger; change w1 or w2 and every number is recomputed. The readout compares the backpropagation result with the “nudge” from step 1.',
    s2w1L: 'Weight w1', s2w2L: 'Weight w2', s2stL: 'How far backward we have gone', s2play: '▶ Auto demo', s2pause: '⏸ Pause', s2reset: 'Reset and stop', cv2: 'Forward values and the backward ledger',
    s2Fwd: 'Forward values (top)', s2Bwd: 'Backward ledger (lower = closer to the input)',
    s2ro: 'Backward progress <b>{st} / 4</b>: dL/dw2 = <b>{w2}</b>, dL/dw1 = <b>{w1}</b> (— means not reached yet). Cross-check (central difference, ε = 10^-5): dL/dw2 ≈ {n2}, dL/dw1 ≈ {n1}; the two methods differ by at most {e}.',
    s2term: 'Local slope = the rate of change between two neighbouring quantities on the chain; backpropagation multiplies them from back to front, computing each quantity once.',
    s3k: 'Step 3 · Downhill', s3t: 'Knowing each weight’s share, how do we shrink the loss?',
    s3e: 'This step answers: given the gradient from backpropagation, how should the weights change? The <strong>gradient</strong> is the vector of the loss’s slopes with respect to each weight and points where the loss grows fastest; <strong>gradient descent</strong> moves the weights a little the opposite way each step: w ← w − η·gradient, where η is the <strong>learning rate</strong> (how far each step goes). Click the loss map to choose a start (or drag the start sliders) and press “Step” or “Auto run”: the white line is the path the weights took and the curve below is the loss against step count. Try η = 0.2 (steady descent), η = 5 (bouncing across the valley without converging) and η = 8 (flying off the map); these behaviours hold only for this tiny network and this start.',
    s3w1L: 'Start w1', s3w2L: 'Start w2', s3etaL: 'Learning rate η', s3step: 'Step', s3run: '▶ Auto run', s3pause: '⏸ Pause', s3reset: 'Reset path and parameters', cv3: 'Gradient descent path on the loss map and the loss curve',
    s3Land: 'Loss map: green start, orange now, white path', s3Curve: 'Loss against step count',
    s3ro: 'Step <b>{k}</b>: w1 = {w1}, w2 = {w2}, loss <b>{L}</b>, gradient length {g}, η = {eta}. {note}',
    s3n_idle: 'Press “Step” or “Auto run” to start.', s3n_run: 'Running…', s3n_done: 'Loss is below 10^-6; stopped.', s3n_out: 'Weights left the range; stopped (η too large).', s3n_max: 'Reached 400 steps without converging; stopped.',
    s3term: 'The gradient points toward the fastest loss growth, so we step the opposite way; a small η is slow, a large one overshoots the valley.',
    s4k: 'Step 4 · Deep gradients', s4t: 'With many layers, can the early layers still hear the error?',
    s4e: 'This step answers: when the network gets deeper, what happens to the blame (gradient) that flows back? The model is a chain of n single neurons: each layer computes a = w·(previous output), applies the activation, and the final output is compared with the target 0.5. Bar height is the gradient size of each layer’s weight (log axis; 1e-3 means one thousandth). Going backward, each layer multiplies the signal by “w × the activation’s slope”; if that factor is below 1, more layers mean a smaller gradient (a vanishing gradient). Try it: keep w = 1, switch between sigmoid, tanh and ReLU and raise the depth to 12; then drag w up to 2.0 and see whether the product shrinks or grows.',
    s4nL: 'Layers n', s4wL: 'Weight in every layer w', s4actL: 'Activation', s4reset: 'Reset', cv4: 'Bar chart of the weight gradient size in every layer',
    act_sigmoid: 'sigmoid', act_tanh: 'tanh', act_relu: 'ReLU',
    s4Cap: 'Gradient size |dL/dw| of each layer’s weight (log axis)', s4Ax: 'layer (1 = closest to the input)',
    s4ro: '{n} layers, w = {w}, {act}: output ŷ = {y}; layer-1 gradient <b>{g1}</b>, layer-{n} gradient <b>{gn}</b>, last layer / first layer ≈ <b>{ratio}</b>. Factor w·f′ at layer 1 = {fac}.',
    s4term: 'Vanishing gradient = early layers get gradients so small their weights barely update. This page computes one gradient and does no training; the conclusion holds only for this chain of identical-weight single neurons.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: assigning the blame in one backward sweep',
    s5e: 'The forward pass computes the loss, the backward pass multiplies local slopes by the chain rule to get every weight’s gradient in one sweep, and gradient descent uses them to change the weights; in a deep network the product of factors decides whether gradients vanish or grow.',
    c1t: 'Forward gives the loss', c1b: 'Numbers flow from input to output and are compared with the target to give the loss (step 0).',
    c2t: 'Nudging is expensive', c2b: 'Measuring each slope costs one more forward pass per weight, which is infeasible for many parameters (step 1).',
    c3t: 'Multiply backwards', c3b: 'The chain rule multiplies local slopes from the loss backwards and yields all gradients in one sweep (step 2).',
    c4t: 'Downhill and depth', c4b: 'Gradient descent walks downhill with learning rate η; in deep chains the product of factors decides whether gradients vanish or grow (steps 3 and 4).',
    modelT: 'Model and limits',
    modelB: 'Everything here is a tiny single-path network (1 input, 1 hidden unit, 1 output, no bias, no batch of data). Real networks have thousands of weights and many paths, and backpropagation sums the blame from several paths at each node. The convergence and oscillation in step 3 hold only for this loss and start; step 4 compares a single gradient and is not a training curve.',
    linksT: 'Continue elsewhere',
    link1: 'Gradient descent · 2-D terrain: how learning rate and terrain shape the descent', link2: 'Derivative · secant approach: how the nudge’s secant turns into a tangent', link3: 'Attention · why divide by √d: softmax saturation also shrinks gradients',
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
