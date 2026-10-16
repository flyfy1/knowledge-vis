'use strict';
/* ============================================================
   卡尔曼滤波讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '卡尔曼滤波 · 在预测与测量之间称重 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '卡尔曼滤波 · 称重',
    tagline: '你永远看不到真实状态，只能在「模型说它在哪」和「传感器说它在哪」之间做取舍。卡尔曼滤波把这场拔河做成一台秤：权重不由人拍脑袋，而是由两边各自的不确定度当场算出来。本页每一步都用带种子的同一批真数据，当场算给你看。',
    nav0: '0 抖动的十字标', nav1: '1 两种笨办法', nav2: '2 预测—更新', nav3: '3 K 的拔河',
    nav4: '4 稳态', nav5: '5 二维追踪', nav6: '6 终章 · 来路与去向',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 卡尔曼滤波 Kalman Filter —— 一步一交互系列',
    lgTruth: '真路（真值）', lgMeas: '测量（十字标）', lgEst: '卡尔曼估计', lgMa: '滑动平均', lgRaw: '原始测量',

    s0k: '第 0 步 · 钩子',
    s0t: '十字标全在抖，真路在哪',
    s0e: '一个点正沿着一条<strong>看不见的真路</strong>运动，你能拿到的只有带噪声的测量——图上的十字标，抖得厉害。先凭眼睛猜：真路大概在哪？然后点「运行卡尔曼」，看一条平滑的估计线怎样浮现；最后揭晓真路，当场对账。你的手机 GPS 每一秒都在解这同一道题。',
    s0run: '运行卡尔曼', s0reveal: '揭晓真路', s0reset: '重置',
    s0ro0: '还没运行。图上只有测量十字标（噪声 σ = 1.0）；真路藏着，估计还没生成。',
    s0roRun: '估计线（青）已生成。它到底准不准？点「揭晓真路」，两条 RMSE 当场对账。',
    s0roDone: '对账（同一批 90 个点）：原始测量的 RMSE = <span>{rm}</span> · 卡尔曼估计的 RMSE = <span>{rk}</span>——估计把误差压到了原始的约 {pct}%。它凭什么？第 2 步把这台秤拆开给你看。',
    s0hint: '先把口径说清（全页通用）：真路是随机游走（每步扰动 σ = 0.25），并在第 45 步突然跳变 +3；测量 = 真值 + 高斯噪声（σ = 1.0）。数据由种子 7 的伪随机数生成，任何人都能复算。第 0 步的滤波器用 Q = 0.0625、R = 1——恰好是真值的噪声参数；第 3 步你会看到，参数给错时这台秤怎样失灵。',

    s1k: '第 1 步 · 两种笨办法',
    s1t: '直接信，或者抹平——各输在哪',
    s1e: '同一批数据，先试两种不用动脑的策略。<strong>策略 A：直接用测量</strong>——不迟到，但把噪声原样端上来，抖。<strong>策略 B：滑动平均</strong>（拿最近 W 个测量取平均）——抖是压下去了，可真路在第 45 步跳变时，它要花 W 步才慢慢爬过去，滞后写在脸上。两条策略的「信测量多少」都是<strong>写死的</strong>：A 永远全信，B 永远信 1/W。',
    s1wLab: 'W · 滑动平均的窗宽',
    s1showRaw: '原始测量（连线）', s1showMa: '滑动平均', s1showKf: '卡尔曼（先露个脸）',
    s1ro: '对真值的 RMSE：原始测量 = <span>{rr}</span> · 滑动平均（W = {w}）= <span>{rm}</span> · 卡尔曼 = <span>{rk}</span>（同一批数据、同一条真路）',
    s1hint: '拖一拖 W：窗越大越平滑、跳变处爬得越慢——平滑与滞后是同一枚硬币。卡尔曼的权重不是写死的：它随「预测有多不确定」实时变化（下一步看它怎样呼吸）。在这个场景里它同时赢了两条笨办法；但这不是保证书——第 3 步把参数调拧，它照样输给你看。',

    s2k: '第 2 步 · 预测—更新',
    s2t: '一步一步跳给你看：钟的呼吸',
    s2e: '卡尔曼记的不是一个数，而是一口<strong>高斯钟</strong>：中心是估计 x̂，胖瘦是不确定度 P。一步分两半：<strong>预测</strong>——按模型往前走，钟只会变胖（P 加上过程噪声 Q）；<strong>更新</strong>——新测量 z 到了（它自己也是一口钟，胖瘦由 R 定），两口钟按精度加权合成一口更瘦的后验钟，权重就是 <strong>K</strong>。下面单步推进，一步一停，数字全印在公式行下面（Q = 0.0625，R = 1，与第 0 步同一台滤波器）。',
    s2formula: '预测：x̂⁻ = x̂ ， P⁻ = P + Q ｜ 增益：K = P⁻ / (P⁻ + R) ｜ 更新：x̂ = x̂⁻ + K·(z − x̂⁻) ， P = (1 − K)·P⁻',
    s2nextPred: '预测一步 →', s2nextUpd: '用测量更新 →', s2play: '连播 10 步', s2stop: '停', s2reset: '重置',
    s2roInit: '起点：拿第一个测量当初始估计 x̂ = z[0] = <span>{x0}</span>，P₀ = 1。点「预测一步」开始第 1 步。',
    s2roPred: '预测（走向第 {k} 步）：先变胖——x̂⁻ = <span>{xp}</span>，P⁻ = P + Q = <span>{pp}</span>（√P⁻ = {sp}）。图上青钟是预测，灰钟是上一步留下的后验。点「用测量更新」，把 z[{k}] 请进来。',
    s2roUpd: '更新：K = P⁻ / (P⁻ + R) = <span>{K}</span> · 残差 z − x̂⁻ = <span>{res}</span> · x̂ = <span>{x}</span>，P = (1 − K)·P⁻ = <span>{p}</span>。后验钟（绿）比预测钟瘦，并被橙色的测量钟（中心 z = {z}）拉过去约 {kpct}%。',
    s2roDone: '已经走到最后一步（k = {k}）。点「重置」重来，或回到上一步的场景慢慢拖。',
    cvPost: '后验（上一步的信念）', cvPred: '预测钟（变胖了）', cvMeasBell: '测量钟（宽由 R 定）', cvPostNew: '后验钟（变瘦了）',
    s2hint: '盯着 P 的呼吸：预测时必涨（世界会自己变），更新时必落（证据总归是证据）。K 就是这口呼吸的阀门——预测越不确定（P⁻ 大），K 越大、新测量说话越响；测量越不靠谱（R 大），K 越小。下一歩把 Q、R 交到你手里。',

    s3k: '第 3 步 · K 的拔河',
    s3t: 'Q 与 R：你信模型，还是信尺子',
    s3e: '换一个场景：真值先躺平、在第 40 步突然跳变 +4（灰虚线处），然后继续躺平（带每步 σ = 0.05 的小扰动），测量噪声 σ = 1。滤波器的两个旋钮：<strong>Q</strong> 是你认定的「世界有多爱变」，<strong>R</strong> 是你认定的「尺子有多不准」。恢复得好不好用两把尺量（都按定义真算）：<strong>进入步数</strong> = 阶跃后估计第一次落进真值 ±0.5 带内的步数；<strong>带内占比</strong> = 阶跃之后的全部步数里，估计待在带内的比例——光快不够，还得待得住。',
    s3qLab: 'Q · 过程噪声（世界有多爱变）', s3rLab: 'R · 测量噪声（尺子有多不准）',
    s3kLab: '稳态增益 K：每来一个新测量，估计朝它挪这么多。<br>（当前 Q、R 下长跑后的收敛值——K 的来历第 4 步细看。这里印的是稳态值，本图滤波从 P₀ = 1 起跑，前几步的 K 还略有不同。）',
    s3ro: '当前这组 Q、R：RMSE = <span>{rk}</span> · 进入步数 = <span>{entry}</span> · 带内占比 = <span>{share}</span> · 参照：原始测量 RMSE = <span>{rr}</span>',
    s3roNever: '始终没进入',
    s3miniK: '稳态 K = {K}',
    s3roFmt: '进入步数 {entry} · 带内占比 {share}',
    s3pModel: '信模型', s3pBalanced: '均衡', s3pMeas: '信测量',
    s3miniRo: 'Q = {q}，R = {r} · K = <b>{k}</b> · RMSE <b>{rmse}</b> · 进入 <b>{entry}</b> · 带内 <b>{share}</b>',
    s3hint: '三档小图是同一场景的三台滤波器，数字当场算。看左档：在这个场景里它比原始测量还差——太信模型，阶跃之后几十步都没追回来；右档 1 步就扑进带内，却只在一半的时间里待得住，另一半被噪声拽出去；中档进入不最快、待得最久、总误差最小。<strong>没有哪档是「正确答案」</strong>：Q、R 是你对世界的声明，声明错了，最优滤波也救不了你。',
    cvJump: '阶跃（第 40 步）',

    s4k: '第 4 步 · 稳态',
    s4t: '跑久了，K 自己定下来',
    s4e: '把滤波器放到一条长数据上跑 300 步（Q = 0.04，R = 2），盯着 P 看：不管初值 P₀ 给多大或多小，P 都收敛到<strong>同一个固定点</strong>——因为 P 的递推只由 Q、R 决定，与数据无关。这个固定点是代数 Riccati 方程 P = (P + Q)·R / (P + Q + R) 的解，图上虚线就是它。',
    s4ro1: 'Riccati 解：P* = <span>{pss}</span>，K* = <span>{kss}</span> · 跑满 300 步：P₀ = 10 的跑到 <span>{p1}</span>，P₀ = 0.01 的跑到 <span>{p2}</span>，两者相差 <span>{dp}</span> · 把 P* 代回方程，残差 = <span>{res}</span>（浮点尾数级）',
    s4ro2: '等价演示：跑到第 250 步时 P 早已站稳。让一支<strong>指数平滑器</strong>（y ← y + α(z − y)，α 就取 K*）与卡尔曼站在同一个状态起跑，此后 50 步两条轨迹逐点最大差 = <span>{md}</span>。这个 0 不是量不出来：第 250 步时 P 已收敛到浮点不动点（与闭式 P* 逐位相同），卡尔曼该步的 K 与闭式 K* 也逐位相同——同状态、同增益、同输入，两条递推此后每一步都恒等，差恰为 0 是推出来的事实。',
    s4hint: '这就是卡尔曼最动人的落点：花哨的「最优滤波」，站稳之后就是你早已会用的指数平滑——只不过平滑系数 α 不再靠手调，而是由 Q、R 算出来的。反过来也成立：如果你的世界真的平稳，卡尔曼不会比一支调对 α 的平滑器更神；它的本事在于<strong>环境变时 P 会重新呼吸</strong>（回第 2 步看）。',
    cvP10: 'P[k]（P₀ = 10）', cvP001: 'P[k]（P₀ = 0.01）', cvPss: 'Riccati 稳态 P*', cvEqK: '卡尔曼（继续递推）', cvEqS: '指数平滑（α = K*）',

    s5k: '第 5 步 · 二维追踪',
    s5t: '估出一个没量过的量：速度',
    s5e: '升维：小车沿直线运动，状态是 [位置, 速度]。传感器<strong>只测位置</strong>（十字标，σ = 1.2），速度从没被直接量过——但滤波器照样能把它估出来，因为模型知道「位置的变化就是速度」。小车的速度分三段：匀速、突然反向（第 60 步，机动段阴影）、再加速。状态方程用的四个矩阵印在下面，dt = 1。',
    s5matNote: 'F 推进状态，H 挑出能测的分量，Q 是过程噪声（q 缩放），R 是测量噪声方差：',
    s5symNote: '数值卫生：每步更新后把 P 对称化（取 (P + Pᵀ)/2）。复算表明，不对称量本身全程 ≤ 1.7e-16——这一步不掩盖任何数值问题，只是把浮点账做平。',
    s5manOn: '机动段：开（反向 + 加速）', s5manOff: '机动段：关（全程匀速）',
    s5eOff: '升维：小车沿直线运动，状态是 [位置, 速度]。传感器<strong>只测位置</strong>（十字标，σ = 1.2），速度从没被直接量过——但滤波器照样能把它估出来，因为模型知道「位置的变化就是速度」。<strong>机动段已关</strong>：小车全程匀速（速度恒为 0.35），现实与「匀速模型」严丝合缝；测量噪声还是同一种子抽出的同一串，只换真值剖面——和机动开启时对照着看。状态方程用的四个矩阵印在下面，dt = 1。',
    s5roOff: '位置 RMSE = <span>{rp}</span> · 速度 RMSE = <span>{rv}</span>（速度从没被测过）· 当前协方差 P = [[{p00}, {p01}], [{p01}, {p11}]]（全程对称、对角元为正，逐步值可经 window.KALMAN 查）',
    s5hintOff: '现实不拐弯时，「太信模型」这一档在这个场景里反而最准——因为模型这次说的就是真话。机动开启时的滞后不是滤波器笨，是真值在第 60、110 步背着模型改了主意。q 的正确大小从来不在滤波器里，在你对现实有多守规矩的判断里。',
    s5qLab: 'q · 过程噪声强度（小车有多「野」）',
    s5pSmall: 'q = 0.0005 · 太信模型', s5pMid: 'q = 0.02 · 适中', s5pBig: 'q = 0.2 · 太信测量',
    s5ro: '位置 RMSE = <span>{rp}</span> · 速度 RMSE = <span>{rv}</span>（速度从没被测过）· 机动窗（第 60–80 步）最大位置误差 = <span>{mx}</span> · 当前协方差 P = [[{p00}, {p01}], [{p01}, {p11}]]（全程对称、对角元为正，逐步值可经 window.KALMAN 查）',
    s5hint: '第 3 步的拔河在二维重演：q 给得太小，滤波器笃信「匀速」，小车一反向就被拖出 2 以上的误差；q 给得太大，它又把测量噪声当成速度的抖动往回捞。中间那档在这个场景里总误差最小。真实导航里没有「正确」的 q——只有对运动烈度的诚实估计。',
    cvPos: '位置', cvVel: '速度', lgPosTrue: '真位置', lgPosEst: '估计位置', cvMan: '机动段（第 60–110 步）', lgVelTrue: '真速度', lgVelEst: '估计速度',

    s6k: '第 6 步 · 终章',
    s6t: '它从哪来，到哪去',
    s6e: '收个尾。卡尔曼更新的形状，其实你在本站见过它的亲戚：<strong>贝叶斯更新</strong>。高斯先验碰上高斯似然，后验均值恰好是按<strong>精度（1/方差）加权</strong>的平均——第 2 步那口后验钟，就是这条公式在连续世界里的样子（贝叶斯页处理的是二元假设的离散亲戚，思想同源、形状不同）。而估计还有另一半：<strong>控制</strong>——没有状态估计，反馈就无从下手；把最优估计与最优控制拼起来，就是 LQG。',
    s6card1T: '阿波罗导航',
    s6card1: '卡尔曼滤波的成名战：1960 年代它被装进阿波罗的导航计算机，用稀疏又带噪声的观测把飞船的状态一路估到月球。估计理论从此成了航天器的标准配置。',
    s6card2T: '手机与传感器融合',
    s6card2: '你的手机每一秒都在融合 GPS、加速度计、陀螺仪：每个传感器各有一口「钟」的胖瘦，融合就是第 2 步的加权，一遍遍地做。地图上那条稳稳贴着路走的蓝线，就是这么来的。',
    s6card3T: '非线性世界',
    s6card3: '真实世界很少是线性高斯的。补救路线定性地说：EKF 把非线性在当前估计处线性化，UKF 用一组采样点穿过非线性，粒子滤波干脆养一群假设去碰运气。再往外，模型写错、野值、滤波发散，都是工程现场要另行处理的功课——本页的干净结论只在线性高斯的世界里全额成立。',
    s6fin: '卡尔曼滤波教的与其说是一条算法，不如说是一种<strong>诚实</strong>：永远同时报告你的答案和你的不确定；让下一个证据按权重改口；参数声明错了，就当众输给你看。这台秤拆完装回去了——下次你的手机定位在高楼之间跳来跳去，你会知道：那是它的 P 正在变胖。',
    s6lkB: '贝叶斯更新：信念如何改口 →', s6lkC: '反馈与控制：估计的另一半 →', s6lkL: '冲激与 LTI →'
  },
  en: {
    docTitle: 'Kalman Filter · Weighing Prediction Against Measurement · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Kalman Filter · The Weighing',
    tagline: 'You never get to see the true state — only what your model predicts and what your noisy sensor reports. A Kalman filter turns that tug-of-war into a scale: the weights are never guessed, they are computed on the spot from how uncertain each side is. Every number on this page is computed live, from the same seeded data.',
    nav0: '0 Jittery Crosses', nav1: '1 Two Naive Fixes', nav2: '2 Predict–Update', nav3: '3 The Q–R Tug-of-War',
    nav4: '4 Steady State', nav5: '5 Tracking in 2D', nav6: '6 Finale · Origins & Reach',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Kalman Filter — one interaction per step',
    lgTruth: 'Truth (hidden path)', lgMeas: 'Measurements (crosses)', lgEst: 'Kalman estimate', lgMa: 'Moving average', lgRaw: 'Raw measurements',

    s0k: 'Step 0 · The Hook',
    s0t: 'The crosses jitter — where is the true path?',
    s0e: 'A point is moving along a <strong>path you cannot see</strong>. All you get are noisy measurements — the crosses on the plot, jittering badly. Guess with your eyes first: where does the true path run? Then press “Run the Kalman filter” and watch a smooth estimate emerge; finally, reveal the truth and settle the score. Your phone’s GPS solves this exact problem every second.',
    s0run: 'Run the Kalman filter', s0reveal: 'Reveal the truth', s0reset: 'Reset',
    s0ro0: 'Not run yet. The plot shows only the measurement crosses (noise σ = 1.0); the truth is hidden and no estimate exists.',
    s0roRun: 'The estimate (cyan) is drawn. How good is it, really? Press “Reveal the truth” and compare the two RMSEs on the spot.',
    s0roDone: 'The reckoning (same 90 points): raw-measurement RMSE = <span>{rm}</span> · Kalman-estimate RMSE = <span>{rk}</span> — the estimate cuts the error to about {pct}% of the raw one. How? Step 2 takes the scale apart.',
    s0hint: 'Ground rules, stated once for the whole page: the truth is a random walk (per-step jitter σ = 0.25) that jumps by +3 at step 45; measurements are truth plus Gaussian noise (σ = 1.0). The data comes from a seeded generator (seed 7), so anyone can reproduce it exactly. The step-0 filter uses Q = 0.0625 and R = 1 — exactly the truth’s noise parameters. In step 3 you will see what happens when those are declared wrong.',

    s1k: 'Step 1 · Two Naive Fixes',
    s1t: 'Trust it raw, or smooth it flat — each loses its own way',
    s1e: 'Same data, two strategies that require no thought. <strong>Strategy A: use the measurements as-is</strong> — never late, but the noise is served untouched: jitter. <strong>Strategy B: a moving average</strong> over the last W measurements — the jitter is ironed out, but when the truth jumps at step 45 the average needs W steps to crawl over: lag, written on its face. Both strategies have their trust <strong>hard-wired</strong>: A always trusts fully; B always trusts 1/W.',
    s1wLab: 'W · moving-average window',
    s1showRaw: 'Raw measurements (connected)', s1showMa: 'Moving average', s1showKf: 'Kalman (a first glimpse)',
    s1ro: 'RMSE against the truth: raw measurements = <span>{rr}</span> · moving average (W = {w}) = <span>{rm}</span> · Kalman = <span>{rk}</span> (same data, same hidden path)',
    s1hint: 'Drag W: a wider window is smoother and slower over the jump — smoothness and lag are the same coin. The Kalman weight is not hard-wired: it moves with how uncertain the prediction currently is (watch it breathe in the next step). On this scenario it beats both naive fixes at once — but that is no blanket guarantee: tune its parameters wrong in step 3 and it will lose in front of you.',

    s2k: 'Step 2 · Predict–Update',
    s2t: 'One step at a time: watch the bell breathe',
    s2e: 'A Kalman filter does not remember a number; it remembers a <strong>Gaussian bell</strong>: the centre is the estimate x̂, the width is the uncertainty P. Each step has two halves. <strong>Predict</strong> — step forward with the model, and the bell can only fatten (P grows by the process noise Q). <strong>Update</strong> — a new measurement z arrives (it is a bell too, its width set by R), and the two bells merge, precision-weighted, into a thinner posterior bell; the weight is <strong>K</strong>. Step through it below, one half-step at a time, with every number printed (Q = 0.0625, R = 1 — the same filter as step 0).',
    s2formula: 'Predict: x̂⁻ = x̂ , P⁻ = P + Q ｜ Gain: K = P⁻ / (P⁻ + R) ｜ Update: x̂ = x̂⁻ + K·(z − x̂⁻) , P = (1 − K)·P⁻',
    s2nextPred: 'Predict one step →', s2nextUpd: 'Update with the measurement →', s2play: 'Play 10 steps', s2stop: 'Stop', s2reset: 'Reset',
    s2roInit: 'Start: take the first measurement as the initial estimate, x̂ = z[0] = <span>{x0}</span>, P₀ = 1. Press “Predict one step” to begin step 1.',
    s2roPred: 'Predict (toward step {k}): fatten first — x̂⁻ = <span>{xp}</span>, P⁻ = P + Q = <span>{pp}</span> (√P⁻ = {sp}). The cyan bell is the prediction; the grey one is last step’s posterior. Now press “Update” and let z[{k}] in.',
    s2roUpd: 'Update: K = P⁻ / (P⁻ + R) = <span>{K}</span> · innovation z − x̂⁻ = <span>{res}</span> · x̂ = <span>{x}</span>, P = (1 − K)·P⁻ = <span>{p}</span>. The posterior bell (green) is thinner than the prediction and has been pulled about {kpct}% of the way toward the orange measurement bell (centred at z = {z}).',
    s2roDone: 'That was the last step (k = {k}). Press “Reset” to go again.',
    cvPost: 'Posterior (previous belief)', cvPred: 'Prediction bell (fatter)', cvMeasBell: 'Measurement bell (width from R)', cvPostNew: 'Posterior bell (thinner)',
    s2hint: 'Watch P breathe: it always rises on prediction (the world moves on its own) and always falls on update (evidence is evidence). K is the valve on that breath — the more uncertain the prediction (large P⁻), the larger K and the louder the new measurement speaks; the less trustworthy the measurement (large R), the smaller K. Next step, the Q and R knobs are yours.',

    s3k: 'Step 3 · The Q–R Tug-of-War',
    s3t: 'Q and R: do you trust the model, or the ruler?',
    s3e: 'A new scene: the truth lies flat, jumps by +4 at step 40 (grey dashed line), then lies flat again (with a small per-step jitter of σ = 0.05); measurement noise is σ = 1. The filter has two knobs: <strong>Q</strong> is your declared “how much the world likes to change”, <strong>R</strong> your declared “how bad the ruler is”. Recovery is scored two ways (both computed by these definitions): <strong>entry steps</strong> — how many steps after the jump until the estimate first lands inside the ±0.5 band around the truth; <strong>in-band share</strong> — of all steps after the jump, the fraction the estimate spends inside that band. Fast is not enough; it also has to stay.',
    s3qLab: 'Q · process noise (how restless the world is)', s3rLab: 'R · measurement noise (how bad the ruler is)',
    s3kLab: 'Steady-state gain K: how far the estimate moves toward each new measurement.<br>(The converged value for the current Q and R after a long run — where K comes from is step 4. This is the steady value; the plotted filter starts from P₀ = 1, so its first few K values differ slightly.)',
    s3ro: 'This Q, R pair: RMSE = <span>{rk}</span> · entry steps = <span>{entry}</span> · in-band share = <span>{share}</span> · reference: raw-measurement RMSE = <span>{rr}</span>',
    s3roNever: 'never entered',
    s3miniK: 'steady K = {K}',
    s3roFmt: 'entry steps: {entry} · in-band {share}',
    s3pModel: 'Trust the model', s3pBalanced: 'Balanced', s3pMeas: 'Trust the measurements',
    s3miniRo: 'Q = {q}, R = {r} · K = <b>{k}</b> · RMSE <b>{rmse}</b> · entry <b>{entry}</b> · in-band <b>{share}</b>',
    s3hint: 'The three small plots run the same scene with three declarations, all numbers computed live. Look at the left one: here it does worse than the raw measurements — it trusts the model so hard that dozens of steps after the jump it still has not caught up. The right one dives into the band in a single step, yet spends only about half its time inside it, dragged out by noise the rest of the time. The middle one enters slowest of the two that enter, stays longest, and has the smallest total error. <strong>None of them is “the correct answer”</strong>: Q and R are declarations about the world, and a wrong declaration is something no optimality can rescue.',
    cvJump: 'the jump (step 40)',

    s4k: 'Step 4 · Steady State',
    s4t: 'Run it long enough and K settles itself',
    s4e: 'Put the filter on a long run — 300 steps, Q = 0.04, R = 2 — and watch P: no matter how large or small the initial P₀, P converges to <strong>the same fixed point</strong>, because the P recursion is driven by Q and R alone, not by the data. That fixed point solves the algebraic Riccati equation P = (P + Q)·R / (P + Q + R); the dashed line is that solution.',
    s4ro1: 'Riccati solution: P* = <span>{pss}</span>, K* = <span>{kss}</span> · after 300 steps: starting from P₀ = 10 lands on <span>{p1}</span>, from P₀ = 0.01 on <span>{p2}</span> — a difference of <span>{dp}</span> · plugging P* back into the equation leaves a residual of <span>{res}</span> (floating-point dust)',
    s4ro2: 'The equivalence demo: by step 250, P has long settled. Start an <strong>exponential smoother</strong> (y ← y + α(z − y), with α set to K*) from exactly the Kalman filter’s state at step 250 and run both for 50 more steps: the largest pointwise difference between the two traces is <span>{md}</span>. That 0 is not a failure to measure: by step 250, P has converged to its floating-point fixed point (bit-for-bit the closed-form P*), and the filter’s gain K there equals the closed-form K* bit for bit — same state, same gain, same inputs — so the two recursions are identical at every later step. The difference is exactly 0 by derivation.',
    s4hint: 'This is the most quietly astonishing stop on the page: the fancy “optimal filter”, once settled, <em>is</em> the exponential smoother you already knew — except its α was never hand-tuned; it was computed from Q and R. The converse holds too: in a truly stationary world a Kalman filter is no magic beyond a well-tuned smoother. Its real talent is that when conditions change, P starts breathing again (go back to step 2 and watch).',
    cvP10: 'P[k] (P₀ = 10)', cvP001: 'P[k] (P₀ = 0.01)', cvPss: 'Riccati steady state P*', cvEqK: 'Kalman (recursion continues)', cvEqS: 'Exponential smoother (α = K*)',

    s5k: 'Step 5 · Tracking in 2D',
    s5t: 'Estimating a quantity nobody measured: velocity',
    s5e: 'One dimension up: a cart moves along a line, its state is [position, velocity]. The sensor <strong>measures position only</strong> (the crosses, σ = 1.2); velocity is never measured directly — yet the filter estimates it anyway, because the model knows position changes <em>are</em> velocity. The cart’s velocity comes in three acts: cruise, a sudden reversal (step 60, the shaded manoeuvre stretch), then faster cruise. The four matrices of the state model are printed below; dt = 1.',
    s5matNote: 'F advances the state, H picks out the measurable part, Q is the process noise (scaled by q), R the measurement-noise variance:',
    s5symNote: 'Numerical hygiene: after each update, P is symmetrised (replaced by (P + Pᵀ)/2). Recomputation shows the raw asymmetry itself never exceeds 1.7e-16 across the whole run — this step hides no numerical problem; it just keeps the floating-point books tidy.',
    s5manOn: 'Manoeuvre: on (reversal + speedup)', s5manOff: 'Manoeuvre: off (constant velocity)',
    s5eOff: 'One dimension up: a cart moves along a line, its state is [position, velocity]. The sensor <strong>measures position only</strong> (the crosses, σ = 1.2); velocity is never measured directly — yet the filter estimates it anyway, because the model knows position changes <em>are</em> velocity. <strong>Manoeuvre off</strong>: the cart cruises at one constant velocity (0.35 throughout), so reality and the constant-velocity model agree exactly; the measurement noise is the same sequence drawn from the same seed — only the truth profile changed. Compare it with the manoeuvre-on run. The four matrices of the state model are printed below; dt = 1.',
    s5roOff: 'Position RMSE = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is never measured) · current covariance P = [[{p00}, {p01}], [{p01}, {p11}]] (symmetric, with positive diagonal, at every step — step-by-step values are exposed via window.KALMAN)',
    s5hintOff: 'When reality never turns, the “trust the model too much” preset is the most accurate one on this scene — because this time the model is simply telling the truth. The lag with the manoeuvre on was not the filter being stupid; the truth changed its mind at steps 60 and 110 behind the model’s back. The right size of q never lives inside the filter; it lives in your judgement of how well-behaved reality is.',
    s5qLab: 'q · process-noise strength (how wild the cart is)',
    s5pSmall: 'q = 0.0005 · trust the model too much', s5pMid: 'q = 0.02 · moderate', s5pBig: 'q = 0.2 · trust the measurements too much',
    s5ro: 'Position RMSE = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is never measured) · largest position error in the manoeuvre window (steps 60–80) = <span>{mx}</span> · current covariance P = [[{p00}, {p01}], [{p01}, {p11}]] (symmetric, with positive diagonal, at every step — step-by-step values are exposed via window.KALMAN)',
    s5hint: 'Step 3’s tug-of-war, replayed in 2D: with q too small the filter is so sure of “constant velocity” that the reversal drags it past 2 units of error; with q too large it starts mistaking measurement noise for changes in velocity and hauls that noise aboard. The middle setting has the smallest total error on this scene. Out in real navigation there is no “correct” q — only an honest estimate of how violent the motion is.',
    cvPos: 'Position', cvVel: 'Velocity', lgPosTrue: 'True position', lgPosEst: 'Estimated position', cvMan: 'Manoeuvre (steps 60–110)', lgVelTrue: 'True velocity', lgVelEst: 'Estimated velocity',

    s6k: 'Step 6 · Finale',
    s6t: 'Where it comes from, where it goes',
    s6e: 'To close. The shape of the Kalman update has a relative you have met on this site: <strong>Bayes’ rule</strong>. A Gaussian prior meeting a Gaussian likelihood yields a posterior whose mean is exactly the <strong>precision-weighted</strong> (1/variance) average of the two — the posterior bell of step 2 is that formula living in the continuous world. (The Bayes page works the discrete cousin — updating over binary hypotheses; same ancestry, different shape.) Estimation also has a second half: <strong>control</strong>. With no state estimate there is nothing to feed back; optimal estimation plus optimal control is LQG.',
    s6card1T: 'Apollo navigation',
    s6card1: 'The Kalman filter’s famous debut: in the 1960s it flew in Apollo’s navigation computer, turning sparse, noisy observations into a spacecraft state estimate all the way to the Moon. State estimation has been standard equipment on spacecraft ever since.',
    s6card2T: 'Phones & sensor fusion',
    s6card2: 'Your phone fuses GPS, accelerometer and gyroscope every second: each sensor carries its own fat or thin “bell”, and fusing them is step 2’s weighting, done over and over. The blue line that glides steadily along the road on your map is exactly that.',
    s6card3T: 'The nonlinear world',
    s6card3: 'The real world is rarely linear and Gaussian. The standard escapes, qualitatively: the EKF linearises the nonlinearity around the current estimate; the UKF pushes a small set of sample points through it; particle filters keep a whole crowd of hypotheses and let luck sort them out. Beyond that, a mis-specified model, outliers and filter divergence are separate engineering battles — the clean conclusions of this page hold in full only in the linear-Gaussian world.',
    s6fin: 'What the Kalman filter really teaches is less an algorithm than a kind of <strong>honesty</strong>: always report your answer together with your uncertainty; let the next piece of evidence revise you, weighted as it deserves; and when your declared parameters are wrong, lose in public. The scale is taken apart and put back together — next time your phone’s dot jumps around between tall buildings, you will know: that is its P, fattening.',
    s6lkB: 'Bayesian updating: how beliefs change their mind →', s6lkC: 'Feedback & control: the other half →', s6lkL: 'Impulse & LTI →'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
