'use strict';
// Kalman filter lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '卡尔曼滤波 · 两份不准的消息，怎样合成一份更准的',
    back: '← 知识索引',
    compare: '对照另一版本：卡尔曼滤波 · 在预测与测量之间称重 →',
    navLabel: '卡尔曼滤波步骤导航',
    tagline: '一台小车在直走廊里移动。它真正在哪儿，谁也看不见：手里只有两份都带误差的消息——按运动规律推算出的「预测」，和激光测距仪给的「测量」。这页要求的是：每一刻该怎样把两份消息合成一个估计，而且知道这个估计有多不准。七步里，权重 K 会从「误差最小」这一个要求里自己算出来。',
    nav0: '0 两份消息', nav1: '1 一测再测', nav2: '2 预测与更新', nav3: '3 调噪声假设', nav4: '4 估出速度', nav5: '5 测量中断', nav6: '6 收束',

    s0k: '第 0 步 · 一次合成',
    s0t: '预测说 10.0 m，测量说 11.2 m，该取哪个数？',
    s0e: '这一步要回答：两份互相独立、各有误差的位置消息，按什么比例混合，合成的估计误差最小？用<strong>标准差 σ</strong>描述误差的典型大小（单位 m）：预测的 σ 记 σₚ，测量的 σ 记 σᵣ；它们的平方叫<strong>方差</strong>，预测方差记 P = σₚ²，测量方差记 R = σᵣ²。混合规则是 估计 = (1 − w)·预测 + w·测量，w 是给测量的权重。两份误差独立时，估计的方差是 <strong>(1 − w)²P + w²R</strong>。它在 <strong>w = K = P / (P + R)</strong> 处最小——这就是<strong>卡尔曼增益</strong> K：谁的方差小，谁拿到的权重就大。',
    sp0: '预测的误差 σₚ（m）', sr0: '测量的误差 σᵣ（m）', w0: '给测量的权重 w',
    snapK: '把 w 设成最优 K',
    c0a: '位置的可能分布（横轴：位置 m）', c0b: '合成估计的误差 σ，随权重 w 变化（横轴：w）',
    s0lgP: '预测 10.0 m ± σₚ', s0lgZ: '测量 11.2 m ± σᵣ', s0lgB: '按你的 w 合成', s0lgK: '最优点 w = K',
    s0readout: '你的 w = {w}：估计 {x} m，误差 σ = {sd} m，比最优多 {ex}%。最优 K = P/(P+R) = {K}：估计 {bx} m，σ = {bsd} m——比预测（{sp} m）和测量（{sr} m）都小。',
    s0hint: '观察顺序：先保持两个 σ 不变，只拖 w，看下图白点沿曲线移动、在橙色竖线（K）处最低；再把「测量的误差」调大，看橙线左移——测量越不准，给它的权重越小。上图的钟形曲线是每份消息的可能位置：越窄越确定。',

    s1k: '第 1 步 · 一测再测',
    s1t: '同一个位置测 30 次，第 k 次测量还该给多大权重？',
    s1e: '这一步要回答：小车停着不动，激光反复测它的位置（每次 σᵣ = 0.5 m，互相独立），每来一次测量就用第 0 步的规则合成一次，权重 K 会怎样变？上一轮合成的结果就是下一轮的「预测」，它的方差 P 每合成一次就变小：P 新 = (1 − K)·P。所以 K = P/(P + R) 一路下降——已经攒下的证据越多，新测量能改动的就越少。起点是一个<strong>先验</strong>猜测：3.0 m，误差 σ₀ 由你设定（真实位置 5.00 m，页面知道，滤波器不知道）。σ₀ 很大时，K 依次是 1、1/2、1/3……，估计恰好等于测量的<strong>算术平均</strong>，误差按 σᵣ/√k 缩小（<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ 中心极限定理第 3 步：平均值的误差为什么是 σ/√n</a>）。σ₀ 很小时，滤波器过分相信那个错的 3.0 m（<a class="xlink" href="../../../probability/inference/bayes-updating/#step5">→ 贝叶斯更新第 5 步：数据要多到什么程度才能冲淡成见</a>）。',
    s01: '先验 3.0 m 的误差 σ₀（m）',
    next1: '再测一次', play1: '连测到 30 次', reset1: '清空重来', reroll1: '换一组测量噪声',
    c1a: '估计随测量次数 k 变化（纵轴：位置 m）', c1b: '每次测量拿到的权重 K（纵轴：K）',
    s1lgZ: '测量值', s1lgX: '卡尔曼估计 ±2σ', s1lgM: '测量的算术平均', s1lgT: '真实位置 5.00 m', s1lgR: '1/k（参照）',
    s1none: '还没有测量（k = 0/30）：估计就是先验 3.0 m，σ = {s0} m。按「再测一次」开始。',
    s1readout: '已测 {k}/30 次。这一次 K = {K}；估计 {x} m（真实 5.00 m，差 {err} m），滤波器自报误差 σ = {sd} m；同样 {k} 次测量的算术平均为 {mean} m。',
    s1hint: '观察顺序：先把 σ₀ 设成 10 m、连测到 30 次，看下图柱子贴着灰色 1/k 曲线、上图青线与白色虚线（平均）几乎重合；再把 σ₀ 设成 0.1 m 重来，看柱子从一开始就很矮，青线迟迟爬不到 5 m。灰带是滤波器自报的 ±2σ 范围，σ₀ 太小时真值会落在带外——它对自己太有把握。',

    s2k: '第 2 步 · 预测与更新',
    s2t: '小车在动，误差为什么不会一直缩小到 0？',
    s2e: '这一步要回答：小车每秒被看不见的磕碰推着随机挪一点，估计的误差会怎样演变？每一秒分两半步。<strong>预测</strong>：按运动规律把估计往前推一秒；位置可能被推了未知的一下，方差加上<strong>过程噪声</strong> Q = σ_q²（σ_q 是每秒随机位移的典型大小），P⁻ = P + Q，误差变大。<strong>更新</strong>：来了一次测量（方差 R = σᵣ²），用 K = P⁻/(P⁻ + R) 合成，P = (1 − K)·P⁻，误差变小。一涨一落之间，P 会停在一个<strong>稳态</strong>：每次涨的恰好等于每次落的。注意这条递推里没有测量值本身——误差怎么变，在测量到来之前就能算出来。',
    sq2: '过程噪声 σ_q（m/秒）', sr2: '测量误差 σᵣ（m）',
    play2: '逐半步播放 25 秒', all2: '全部显示',
    c2a: '估计误差 σ = √P 的锯齿（纵轴：m；横轴：秒 k）', c2b: '每秒的增益 K（纵轴：K）',
    s2lgUp: '预测：误差涨', s2lgDown: '更新：误差落', s2lgSS: '稳态值',
    s2progress: '已播放 {c}/25 秒。',
    s2readout: '{prog}稳态：预测后 σ⁻ = {pm} m，更新后 σ = {pp} m，K∞ = {K}（从第 {n} 秒起 K 与 K∞ 相差不到 1%）。σ_q/σᵣ = {ratio}。',
    s2hint: '观察顺序：先按「逐半步播放」，看上图每一秒先往上一笔（预测）、再往下一笔（更新），锯齿的上下沿各自贴向橙色虚线；再只拖「过程噪声」，看锯齿整体抬高、K∞ 变大——小车越爱乱跑，旧估计越不值钱，滤波器越听测量的。起点误差固定为 2 m。',

    s3k: '第 3 步 · 噪声假设',
    s3t: '如果滤波器猜错了过程噪声 σ_q，会发生什么？',
    s3e: '这一步要回答：滤波器必须事先假定过程噪声 σ_q 有多大；假定值与真实值不同时，估计会怎样变差？这是一段<strong>模拟</strong>：小车随机游走 120 秒，真实 σ_q = 0.3 m/秒，测量误差 σᵣ = 1.0 m（滤波器知道 σᵣ）。滑杆只改滤波器的<strong>假定</strong> σ_q，不改数据。比较的指标是<strong>均方根误差 RMSE</strong>：第 20–119 秒里「估计 − 真实位置」平方后取平均再开方，单位 m，越小越好。滤波器自己还会报一个误差（稳态 σ）。假定的 σ_q 偏小时，它会把误差报小好几倍；假定接近真实值时，它与实测 RMSE 相差在 20% 以内（实测值本身也随这段数据起伏）。',
    q3: '滤波器假定的 σ_q（m/秒，对数刻度）', reroll3: '换一段模拟数据',
    c3a: '120 秒的轨迹（纵轴：位置 m）', c3b: '误差 vs 假定的 σ_q（横轴对数）',
    s3lgT: '真实位置', s3lgZ: '测量', s3lgX: '估计', s3lgR: '实测 RMSE', s3lgC: '滤波器自报的 σ', s3lgM: '直接用测量的 RMSE', s3lgQ: '真实 σ_q = 0.3',
    s3readout: '假定 σ_q = {q} m/秒（真实 0.3）：实测 RMSE = {rmse} m，滤波器自报 σ = {cl} m，{verdict}。直接用测量的 RMSE = {mr} m。这段数据里 RMSE 最小出现在假定 σ_q = {bq}（RMSE {br} m）。',
    verdictOver: '自报偏小——过分自信', verdictUnder: '自报偏大——过分谨慎', verdictOk: '自报与实测相差不到 20%',
    s3hint: '观察顺序：先把假定 σ_q 拖到最左（0.01），看「120 秒的轨迹」图里青线反应迟钝、拐弯总是慢半拍，「误差 vs 假定的 σ_q」图里青点（实测 RMSE）高、橙点（自报 σ）却很低——它自以为很准；再拖到最右（3），青线几乎贴着每个测量点抖动；最后拖回竖线附近。「换一段模拟数据」看最低点是否仍在真实值附近——本页 5 段数据里，最低点都落在网格的 0.28 或 0.35 上。',

    s4k: '第 4 步 · 没测过的量',
    s4t: '只测位置，凭什么能估出速度？',
    s4e: '这一步要回答：小车以大约 1.2 m/秒匀速行驶（速度每秒随机变化约 0.02 m/秒），激光只测位置（σᵣ = 1.5 m），滤波器能不能把速度也估出来？把<strong>状态</strong>写成两个数：位置 p 和速度 v。预测：p ← p + v·1 秒，v 不变。关键在<strong>协方差矩阵 P</strong>：对角线是 p、v 各自的方差，非对角线说明两者的误差怎样一起变；用<strong>相关系数 ρ</strong>（−1 到 1）概括。预测一步后，速度估得偏大会让位置也偏大，ρ 变正。于是一次测量发现「位置比预测远了」，增益的两个分量 K_p、K_v 就同时把位置和速度往上修。「误差的 2σ 椭圆」图画的是误差的 <strong>2σ 椭圆</strong>：真实（p, v）有约 86% 的机会落在其中；椭圆倾斜就是 ρ ≠ 0（<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step5">→ 特征向量第 5 步：椭圆的主方向就是协方差的特征向量</a>）。',
    k4: '时刻 k（秒）', play4: '从 0 播放到 40 秒', reroll4: '换一组噪声', zoom4: '椭圆放大 ×5（只改显示）',
    c4a: '位置（纵轴：m）', c4b: '速度（纵轴：m/秒）', c4c: '误差的 2σ 椭圆（横：位置 m，纵：速度 m/秒）',
    s4lgT: '真实值', s4lgZ: '测量（只有位置）', s4lgX: '估计 ±2σ', s4lgE: '当前椭圆', s4lgH: '之前各秒的椭圆',
    s4readout: '第 {k}/40 秒：速度估计 {v} ± {sv} m/秒（真实 {vt}），位置误差 σ = {sp} m，ρ = {rho}，增益 K_p = {kp}、K_v = {kv}。到此为止，真实速度落在 ±2σ 带内的秒数：{cov}/{k}。',
    s4start: '第 0 秒：还没有测量。先验 p = 0 ± {sp0} m、v = 0 ± {sv0} m/秒，ρ = 0（椭圆不倾斜）。',
    zoomOn: '（椭圆已放大 ×5）',
    s4hint: '观察顺序：按「播放」，先看「速度」图：速度估计从 0 出发，几秒内爬到 1.2 附近，灰带收窄——这个量从没被测过。同时看「误差的 2σ 椭圆」图：第 1、2 秒椭圆迅速倾斜（ρ 变正），之后整体缩小。越往后椭圆越小，打开「放大 ×5」看它的倾斜仍在。',

    s5k: '第 5 步 · 测量中断',
    s5t: '激光被挡住几秒，估计会怎样？',
    s5e: '这一步要回答：小车驶过一段激光照不到的区域（灰色阴影），连续几秒没有测量，误差会怎样增长，恢复测量后又要多久收回？没有测量时，只做<strong>预测</strong>那半步：估计按当前速度往前推，方差只涨不落。位置误差会持续上涨，而且速度的不确定（σ_v）越大涨得越快：速度差一点，每一秒都会累加成新的位置偏差，间隔 t 秒后单是这一项就贡献 σ_v·t。上图画的是<strong>估计 − 真实位置</strong>（单位 m）和滤波器自报的 ±2σ 带；下图是位置误差 σ_p 随时间的锯齿。数据与第 4 步同一模型、固定一组噪声。',
    g5a: '中断开始于第几秒', g5b: '中断持续秒数',
    c5a: '估计误差：估计 − 真实位置（纵轴：m）', c5b: '位置误差 σ_p（纵轴：m）',
    s5lgE: '估计 − 真实', s5lgB: '自报 ±2σ', s5lgG: '无测量的秒',
    s5readout: '中断前一刻：σ_p = {before} m，速度误差 σ_v = {sv} m/秒。中断最后一秒 σ_p = {peak} m，是中断前的 {ratio} 倍。{rec}中断期间「估计 − 真实」最大 {maxerr} m。',
    s5rec: '恢复测量后第 {n} 次测量，σ_p 回到中断前的 1.1 倍以内。',
    s5norec: '到第 50 秒，σ_p 还没回到中断前的 1.1 倍以内。',
    s5none: '没有中断（持续 0 秒）：σ_p 稳在约 {ss} m。把「中断持续秒数」往右拖。',
    s5hint: '观察顺序：先保持「开始于」不变，把「持续秒数」从 0 逐格拉到 15，看下图阴影里那段一路上升、没有锯齿（没有测量把它拉下来），上图灰带同步张开；再看阴影右侧，几次测量就把误差收回来。最后把「开始于」挪到最左（第 5 秒）：那时速度还没估准（读数里的 σ_v 大好几倍），同样长的中断让误差涨得快得多。',

    s6k: '第 6 步 · 收束',
    s6t: '卡尔曼滤波到底做了哪几件事？',
    s6fin: '每一秒都是同一套两半步：<strong>预测</strong>按模型把估计往前推、方差加上 Q；<strong>更新</strong>按 K = P⁻/(P⁻ + R) 把测量合进来、方差乘以 (1 − K)。K 不是凭经验调的旋钮，而是「让合成估计的方差最小」的解（第 0 步）；它随证据积累而下降（第 1 步），在动态问题里停在预测涨、测量落的平衡点（第 2 步）。状态有多个分量时，协方差把它们连在一起，所以测一个量也能修正另一个（第 4 步）；没有测量时，误差按模型增长（第 5 步）。',
    formula: '预测：x⁻ = F·x，P⁻ = F·P·Fᵀ + Q\n更新：K = P⁻Hᵀ(H·P⁻Hᵀ + R)⁻¹，x = x⁻ + K(z − H·x⁻)，P = (I − K·H)·P⁻',
    boundary: '式中 F 是运动模型（第 4 步里 p ← p + v·1 秒），H 挑出被测的分量（第 4 步里只挑位置），z 是测量值。适用条件：模型是线性的（F、H 是矩阵），噪声是零均值、互相独立的高斯噪声，Q 和 R 已知。此时卡尔曼滤波在所有估计方法中均方误差最小；噪声不是高斯时，它仍是线性估计里最好的。Q、R 假设错了，自报误差就不可信（第 3 步）。模型非线性时要用扩展卡尔曼（EKF，先局部线性化）或无迹卡尔曼（UKF，用几个采样点传递分布）等变体。本页所有数据都是模拟，不是实测。',
    linksTitle: '接着去哪儿',
    lk1: '→ 贝叶斯更新第 2 步：后验 = 先验 × 似然比，卡尔曼更新是它的高斯版本',
    lk2: '→ PID 控制第 0 步：估计出状态之后，控制器怎样用误差去推它',
    lk3: '→ 特征向量第 5 步：协方差椭圆的主方向',
    lk4: '→ 中心极限定理第 3 步：σ/√n 是条铁律',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《卡尔曼滤波 · 在预测与测量之间称重》的平行版本。'
  },
  en: {
    pageTitle: 'Kalman Filter · Two Unreliable Reports, One Better Estimate',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Kalman Filter · Weighing Prediction Against Measurement →',
    navLabel: 'Kalman filter steps',
    tagline: 'A small robot moves along a straight corridor. Nobody can see exactly where it is. All you have are two reports, both wrong by some amount: a prediction worked out from how it moves, and a reading from a laser rangefinder. The job: at every moment, blend the two into one estimate, and know how far off that estimate is likely to be. Over seven steps, the weight K falls out of a single demand: make the error as small as possible.',
    nav0: '0 Two reports', nav1: '1 Measure again', nav2: '2 Predict & update', nav3: '3 Noise guess', nav4: '4 Velocity', nav5: '5 Dropout', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · ONE BLEND',
    s0t: 'The prediction says 10.0 m, the laser says 11.2 m. Which number do you use?',
    s0e: 'The question here: two independent position reports, each with its own error. In what proportion should you mix them so that the blend is as accurate as possible? Describe the typical size of an error by its <strong>standard deviation σ</strong> (in metres): σₚ for the prediction, σᵣ for the measurement. Their squares are <strong>variances</strong>: P = σₚ² for the prediction, R = σᵣ² for the measurement. The blend is estimate = (1 − w)·prediction + w·measurement, where w is the weight on the measurement. With independent errors, the blend has variance <strong>(1 − w)²P + w²R</strong>. That is smallest at <strong>w = K = P / (P + R)</strong>, and this K is the <strong>Kalman gain</strong>: whichever report has the smaller variance gets the bigger say.',
    sp0: 'Prediction error σₚ (m)', sr0: 'Measurement error σᵣ (m)', w0: 'Weight on the measurement w',
    snapK: 'Set w to the best K',
    c0a: 'Where the robot could be (x-axis: position, m)', c0b: 'Error σ of the blend as the weight w changes (x-axis: w)',
    s0lgP: 'Prediction 10.0 m ± σₚ', s0lgZ: 'Measurement 11.2 m ± σᵣ', s0lgB: 'Blend at your w', s0lgK: 'Best point w = K',
    s0readout: 'Your w = {w}: estimate {x} m, error σ = {sd} m, {ex}% worse than the best. Best K = P/(P+R) = {K}: estimate {bx} m, σ = {bsd} m. That beats both the prediction ({sp} m) and the measurement ({sr} m).',
    s0hint: 'What to try: keep both σ values fixed and drag only w. The white dot slides along the lower curve and bottoms out at the orange line (K). Then raise the measurement error and watch the orange line move left: the less trustworthy the laser, the less weight it gets. The bell curves on top show where each report places the robot; narrower means surer.',

    s1k: 'STEP 1 · MEASURE AGAIN',
    s1t: 'Measure the same spot 30 times. How much weight should reading k still get?',
    s1e: 'The question here: the robot is parked, and the laser keeps measuring its position (σᵣ = 0.5 m each time, independent errors). Each new reading is blended in with the rule from step 0. What happens to the weight K? The result of one blend is the “prediction” for the next, and its variance P shrinks with every blend: P_new = (1 − K)·P. So K = P/(P + R) keeps falling. The more evidence you already have, the less any one new reading can move you. It all starts from a <strong>prior</strong> guess of 3.0 m, with an error σ₀ that you choose. (The true position is 5.00 m; the page knows this, the filter does not.) With a huge σ₀ the gains run 1, 1/2, 1/3, …, the estimate is exactly the <strong>running average</strong> of the readings, and its error shrinks like σᵣ/√k (<a class="xlink" href="../../../probability/statistics/central-limit-theorem/#step3">→ Central limit theorem, step 3: why an average’s error goes as σ/√n</a>). With a tiny σ₀ the filter trusts the wrong 3.0 m far too much (<a class="xlink" href="../../../probability/inference/bayes-updating/#step5">→ Bayesian updating, step 5: how much data it takes to wash out a prior</a>).',
    s01: 'Error σ₀ of the 3.0 m prior (m)',
    next1: 'One more reading', play1: 'Run to 30 readings', reset1: 'Start over', reroll1: 'New measurement noise',
    c1a: 'Estimate after k readings (y-axis: position, m)', c1b: 'Weight K given to each reading (y-axis: K)',
    s1lgZ: 'Readings', s1lgX: 'Kalman estimate ±2σ', s1lgM: 'Running average', s1lgT: 'True position 5.00 m', s1lgR: '1/k (reference)',
    s1none: 'No readings yet (k = 0/30): the estimate is the 3.0 m prior with σ = {s0} m. Press “One more reading” to begin.',
    s1readout: '{k}/30 readings. This one got K = {K}. Estimate {x} m (truth 5.00 m, off by {err} m); the filter rates its own error at σ = {sd} m. The plain average of the same {k} readings is {mean} m.',
    s1hint: 'What to try: set σ₀ to 10 m and run to 30. The bars on the lower plot hug the grey 1/k curve, and the cyan line almost coincides with the dashed white average. Then set σ₀ to 0.1 m and start over: the bars are short from the start, and the cyan line takes ages to climb towards 5 m. The grey band is the filter’s own ±2σ claim; with σ₀ too small the truth sits outside it. The filter is too sure of itself.',

    s2k: 'STEP 2 · PREDICT AND UPDATE',
    s2t: 'Once the robot moves, why does the error stop shrinking?',
    s2e: 'The question here: every second, unseen bumps shove the robot by a small random amount. How does the estimate’s error evolve? Each second has two halves. <strong>Predict</strong>: push the estimate forward one second using the motion model. The robot may have been bumped by an unknown amount, so the variance grows by the <strong>process noise</strong> Q = σ_q² (σ_q is the typical random shift per second): P⁻ = P + Q. <strong>Update</strong>: blend in a reading of variance R = σᵣ² with K = P⁻/(P⁻ + R), giving P = (1 − K)·P⁻, a smaller error. Between the rise and the fall, P settles at a <strong>steady state</strong> where each rise exactly cancels each fall. Notice that the readings themselves never appear in this recursion: how the error evolves can be worked out before a single reading arrives.',
    sq2: 'Process noise σ_q (m per second)', sr2: 'Measurement error σᵣ (m)',
    play2: 'Play 25 seconds, half-step by half-step', all2: 'Show all',
    c2a: 'Sawtooth of the error σ = √P (y: m; x: second k)', c2b: 'Gain K each second (y-axis: K)',
    s2lgUp: 'Predict: error rises', s2lgDown: 'Update: error falls', s2lgSS: 'Steady-state values',
    s2progress: '{c}/25 seconds played. ',
    s2readout: '{prog}Steady state: σ⁻ = {pm} m after predicting, σ = {pp} m after updating, K∞ = {K} (K is within 1% of K∞ from second {n} on). σ_q/σᵣ = {ratio}.',
    s2hint: 'What to try: press play and watch each second draw one stroke up (predict) and one stroke down (update). The top and bottom edges of the sawtooth each close in on an orange dashed line. Then drag only the process noise: the whole sawtooth lifts and K∞ grows. The more the robot wanders, the less an old estimate is worth, and the more the filter listens to the laser. The starting error is fixed at 2 m.',

    s3k: 'STEP 3 · THE NOISE ASSUMPTION',
    s3t: 'What if the filter guesses the process noise σ_q wrong?',
    s3e: 'The question here: the filter has to be told how big the process noise σ_q is. When that assumption is off, how does the estimate suffer? This is a <strong>simulation</strong>: the robot random-walks for 120 seconds with a true σ_q of 0.3 m per second, and readings have σᵣ = 1.0 m (the filter knows σᵣ). The slider changes only the filter’s <strong>assumed</strong> σ_q, never the data. The yardstick is the <strong>root-mean-square error (RMSE)</strong>: over seconds 20–119, square each “estimate − true position”, average, take the square root. It is in metres, and smaller is better. The filter also reports its own error (its steady-state σ). With σ_q assumed too small, it understates its error several times over; with σ_q near the truth, it lands within 20% of the measured RMSE (the measured value itself wobbles with the particular run).',
    q3: 'Filter’s assumed σ_q (m per second, log scale)', reroll3: 'New simulated run',
    c3a: 'The 120-second run (y-axis: position, m)', c3b: 'Error vs assumed σ_q (log x-axis)',
    s3lgT: 'True position', s3lgZ: 'Readings', s3lgX: 'Estimate', s3lgR: 'Measured RMSE', s3lgC: 'Filter’s own σ', s3lgM: 'RMSE of raw readings', s3lgQ: 'True σ_q = 0.3',
    s3readout: 'Assumed σ_q = {q} m/s (true 0.3): measured RMSE = {rmse} m, filter’s own σ = {cl} m, {verdict}. Using the raw readings gives RMSE = {mr} m. In this run the lowest RMSE comes at an assumed σ_q of {bq} (RMSE {br} m).',
    verdictOver: 'too low: the filter is overconfident', verdictUnder: 'too high: the filter is overcautious', verdictOk: 'within 20% of the measured value',
    s3hint: 'What to try: drag the assumed σ_q all the way left (0.01). In “The 120-second run” the cyan line is sluggish and always takes corners late; in “Error vs assumed σ_q” the cyan dot (measured RMSE) is high while the orange dot (its own σ) is low: it thinks it is doing well. Drag it all the way right (3): the cyan line jitters along with every reading. Then come back to the vertical line. Use “New simulated run” to see whether the minimum stays near the truth. In this page’s 5 runs it always lands on the grid point 0.28 or 0.35.',

    s4k: 'STEP 4 · THE UNMEASURED QUANTITY',
    s4t: 'You only measure position. How can you possibly estimate velocity?',
    s4e: 'The question here: the robot drives at about 1.2 m/s (its speed drifts by about 0.02 m/s each second), and the laser measures position only (σᵣ = 1.5 m). Can the filter recover the velocity too? Write the <strong>state</strong> as two numbers: position p and velocity v. Predict: p ← p + v·(1 s); v stays put. The key is the <strong>covariance matrix P</strong>. Its diagonal holds the variances of p and v; its off-diagonal says how their errors move together, summed up by the <strong>correlation ρ</strong> (from −1 to 1). After one prediction, a velocity that is too high also leaves the position too high, so ρ turns positive. When a reading then says “further along than predicted”, the two parts of the gain, K_p and K_v, push position and velocity up together. The “2σ error ellipse” plot shows exactly that <strong>2σ ellipse</strong>: the true (p, v) lies inside it about 86% of the time, and a tilted ellipse means ρ ≠ 0 (<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step5">→ Eigenvectors, step 5: the ellipse’s axes are the covariance’s eigenvectors</a>).',
    k4: 'Time k (s)', play4: 'Play from 0 to 40 s', reroll4: 'New noise', zoom4: 'Zoom ellipse ×5 (display only)',
    c4a: 'Position (y-axis: m)', c4b: 'Velocity (y-axis: m/s)', c4c: '2σ error ellipse (x: position m, y: velocity m/s)',
    s4lgT: 'Truth', s4lgZ: 'Readings (position only)', s4lgX: 'Estimate ±2σ', s4lgE: 'Current ellipse', s4lgH: 'Ellipses of earlier seconds',
    s4readout: 'Second {k}/40: velocity estimate {v} ± {sv} m/s (truth {vt}), position error σ = {sp} m, ρ = {rho}, gains K_p = {kp}, K_v = {kv}. Seconds so far with the true velocity inside the ±2σ band: {cov}/{k}.',
    s4start: 'Second 0: no readings yet. Prior p = 0 ± {sp0} m, v = 0 ± {sv0} m/s, ρ = 0 (the ellipse is upright).',
    zoomOn: ' (ellipse zoomed ×5)',
    s4hint: 'What to try: press play and watch the “Velocity” plot first. The velocity estimate starts at 0 and climbs to about 1.2 within a few seconds while the grey band narrows, even though velocity is never measured. Meanwhile, in the “2σ error ellipse” plot, the ellipse tilts sharply in seconds 1–2 (ρ turns positive) and then shrinks. It gets small later on; switch on “Zoom ×5” to see that the tilt is still there.',

    s5k: 'STEP 5 · SENSOR DROPOUT',
    s5t: 'The laser is blocked for a few seconds. What happens to the estimate?',
    s5e: 'The question here: the robot passes a stretch the laser cannot see (grey shading), so there are no readings for several seconds. How fast does the error grow, and how long does it take to recover once readings return? With no reading, only the <strong>predict</strong> half-step runs: the estimate coasts forward at its current velocity, and the variance only rises. The position error keeps climbing, and the larger the velocity uncertainty (σ_v), the faster it climbs: a slightly wrong velocity adds fresh position error every second, so after t seconds that term alone contributes σ_v·t. The top plot shows <strong>estimate − true position</strong> (in m) with the filter’s own ±2σ band; the bottom plot is the sawtooth of the position error σ_p. The model is the one from step 4, with one fixed set of noise.',
    g5a: 'Dropout starts at second', g5b: 'Dropout length (s)',
    c5a: 'Estimate error: estimate − true position (y-axis: m)', c5b: 'Position error σ_p (y-axis: m)',
    s5lgE: 'Estimate − truth', s5lgB: 'Own ±2σ band', s5lgG: 'Seconds without readings',
    s5readout: 'Just before the dropout: σ_p = {before} m, velocity error σ_v = {sv} m/s. In the dropout’s last second σ_p = {peak} m, {ratio}× the value before. {rec}The largest “estimate − truth” during the dropout is {maxerr} m.',
    s5rec: 'After readings return, the {n}-th one brings σ_p back within 1.1× its pre-dropout value. ',
    s5norec: 'By second 50, σ_p has not yet come back within 1.1× its pre-dropout value. ',
    s5none: 'No dropout (length 0 s): σ_p holds at about {ss} m. Drag the dropout length to the right.',
    s5hint: 'What to try: leave the start alone and step the length from 0 up to 15. Inside the shading the bottom curve climbs without a single tooth (no reading pulls it down), and the grey band on top opens up with it. Then look just right of the shading: a few readings pull the error back down. Finally move the start all the way left (second 5). The velocity is not pinned down yet (σ_v in the readout is several times larger), so a dropout of the same length lets the error grow much faster.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'So what does a Kalman filter actually do?',
    s6fin: 'Every second runs the same two halves. <strong>Predict</strong> pushes the estimate forward with the model and adds Q to the variance. <strong>Update</strong> blends in the reading with K = P⁻/(P⁻ + R) and multiplies the variance by (1 − K). K is not a knob tuned by feel. It is the solution to “make the blend’s variance as small as possible” (step 0). It falls as evidence piles up (step 1), and in a moving problem it settles where the predict rise balances the update fall (step 2). With several state components, the covariance ties them together, so measuring one corrects another (step 4). With no readings, the error grows as the model dictates (step 5).',
    formula: 'Predict: x⁻ = F·x,  P⁻ = F·P·Fᵀ + Q\nUpdate: K = P⁻Hᵀ(H·P⁻Hᵀ + R)⁻¹,  x = x⁻ + K(z − H·x⁻),  P = (I − K·H)·P⁻',
    boundary: 'Here F is the motion model (in step 4, p ← p + v·1 s), H picks out the measured part (in step 4, position only), and z is the reading. When this holds: the model is linear (F and H are matrices), the noise is zero-mean, independent and Gaussian, and Q and R are known. Then the Kalman filter has the lowest mean-square error of any estimator; with non-Gaussian noise it is still the best linear one. If Q or R is wrong, its self-reported error cannot be trusted (step 3). For nonlinear models you need variants such as the extended Kalman filter (EKF, which linearises locally) or the unscented Kalman filter (UKF, which pushes a few sample points through the model). Every data set on this page is simulated, not measured.',
    linksTitle: 'Where to go next',
    lk1: '→ Bayesian updating, step 2: posterior = prior × likelihood ratio; the Kalman update is its Gaussian version',
    lk2: '→ PID control, step 0: once the state is estimated, how a controller uses the error to push it',
    lk3: '→ Eigenvectors, step 5: the principal directions of a covariance ellipse',
    lk4: '→ Central limit theorem, step 3: σ/√n is an iron law',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Kalman Filter · Weighing Prediction Against Measurement”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]);
  if (text === undefined) text = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
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
  if (typeof window.refreshKalman === 'function') window.refreshKalman();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.KALMAN_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
