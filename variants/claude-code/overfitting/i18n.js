'use strict';
// Overfitting lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '过拟合 · 把噪声也背下来的曲线',
    back: '← 知识索引',
    compare: '对照另一版本：过拟合 →',
    navLabel: '过拟合步骤导航',
    tagline: '12 个带噪声的点，一条可以随意弯曲的多项式。曲线越灵活，离这些点就越近；可它预测新数据时反而可能更差。七步里你会亲眼看到这条分界线在哪，它为什么随噪声、数据量和抽到的那批数据移动，以及「适可而止」的训练怎样把它拉回来。',
    nav0: '0 拟合', nav1: '1 新数据', nav2: '2 噪声', nav3: '3 数据量', nav4: '4 换一批', nav5: '5 早停', nav6: '6 收束',

    s0k: '第 0 步 · 拟合',
    s0t: '曲线越弯，离训练点越近——越弯就越好吗？',
    s0e: '这一步要回答：手上有 12 个观测点，横坐标 x 在 −1 到 1 之间，纵坐标 y 是某个未知规律加上随机误差。想找一条曲线描述 x 与 y 的关系，用来预测以后的新 x。候选曲线是 d 次<strong>多项式</strong>：d 叫<strong>次数</strong>，曲线有 d + 1 个可调的<strong>系数</strong>；d 越大，曲线能拐的弯越多，我们说它越<strong>灵活</strong>。系数用<strong>最小二乘</strong>确定：让 12 个点到曲线的竖直距离的平方和最小（<a class="xlink" href="../../../probability/statistics/regression-correlation/#step1">→ 回归页第 1 步：最小二乘拟合一条直线</a>）。好坏先用<strong>训练 RMSE</strong> 衡量：在这 12 个点上把「预测 − 实际」平方、取平均、再开方，单位与 y 相同，越小表示曲线离训练点越近。数据是模拟的，真实规律先藏起来。',
    c0a: '训练点与 d 次多项式',
    c0b: '训练 RMSE（你试过的 d）',
    lgTrain: '训练点', lgFit: '拟合曲线', lgTruth: '真实规律（白色虚线）', lgTrainErr: '训练 RMSE',
    dSlider: '次数 d',
    showTruth: '显示真实规律', hideTruth: '隐藏真实规律',
    s0hint: '观察顺序：把 d 从 0 一格一格拖到 11，看「训练 RMSE」图：每试一个 d 留下一个点，它几乎一路下降，到 d = 11 变成 0——12 个系数正好能让曲线穿过 12 个点。再看「训练点与 d 次多项式」图：d = 11 的曲线在点与点之间大起大落，冲出画面。最后点「显示真实规律」，比较哪个 d 的曲线最像它。',
    s0readout: 'd = {d}：{k} 个系数，训练 RMSE = {train}。{note}',
    s0interp: '曲线穿过了全部 12 个点。',

    s1k: '第 1 步 · 新数据',
    s1t: '换一批没见过的点，误差还会这么小吗？',
    s1e: '这一步要回答：训练 RMSE 小，只说明曲线记住了这 12 个点；它预测新数据准不准？从同一个规律、同样大小的噪声里再模拟 400 个<strong>测试点</strong>（拟合时没有用到），用同一个公式在它们上面算<strong>测试 RMSE</strong>（越小越好）。就算猜中了真实规律，测试 RMSE 也降不到 0，因为测试点自己带着噪声：真实规律在这 400 个点上的 RMSE 约 0.24，叫<strong>噪声底线</strong>。<strong>过拟合</strong> = 训练误差很小，测试误差却明显变大：曲线把训练点上的噪声也当成规律记了下来。',
    c1a: '训练点、测试点与拟合',
    c1b: 'RMSE 随次数 d',
    lgTest: '测试点', lgTestErr: '测试 RMSE', lgFloor: '噪声底线', lgOver: '三角 = 超出纵轴（数值见读数）',
    s1hint: '观察顺序：拖 d，同时看「RMSE 随次数 d」图上的两个点：青色（训练）一路下降；橙色（测试）先降后升，在 d = 3 最低，约 0.29，离噪声底线 0.24 不远。d 到 9 以后测试 RMSE 冲出图顶（画成三角）。两条曲线之间的距离，就是过拟合的程度。',
    s1readout: 'd = {d}：训练 RMSE {train}，测试 RMSE {test}，差距 {gap}。这组数据上测试 RMSE 最小的是 d = {best}（{bestTest}）；噪声底线 {floor}。',

    s2k: '第 2 步 · 噪声',
    s2t: '过拟合该怪曲线太灵活，还是怪数据有噪声？',
    s2e: '这一步要回答：同样 12 个 x、同样的真实规律，只改噪声大小 σ（随机误差的标准差，单位与 y 相同），最佳次数和过拟合程度会怎样变？每个点的随机误差 = σ × 一个固定的标准正态随机数，所以拖 σ 时各点只在竖直方向按比例偏离真实规律，别的都不变。<strong>测试 RMSE</strong> 仍在 400 个测试点上计算，它们的噪声也随 σ 同步缩放，噪声底线约为 0.96 σ。',
    c2a: '拟合（σ = {s}）',
    c2b: '测试 RMSE 随次数 d',
    lgCur: '当前 σ', lgOld: '试过的其他 σ',
    sSlider: '噪声 σ',
    clear2: '清除旧曲线',
    s2hint: '观察顺序：先把 σ 拖到 0，看「测试 RMSE 随次数 d」图：曲线一路降到接近 0，d 再高也不变差——没有噪声，就没有东西可背。再依次试 σ = 0.1、0.25、0.5，每个 σ 留下一条淡线：σ 越大，整条曲线越高，最佳次数停在低次（d = 3），高次那一端升得越陡。保持 d = 9 拖 σ，看「拟合」图里曲线怎样随噪声扭动。',
    s2readout: 'σ = {s}：测试 RMSE 最小的是 d = {best}（{bt}，噪声底线 {floor}）。当前 d = {d}：训练 RMSE {train}，测试 RMSE {test}。',

    s3k: '第 3 步 · 数据量',
    s3t: '同样灵活的曲线，多给数据能不能治好过拟合？',
    s3e: '这一步要回答：次数固定在 d = 9（10 个系数），训练点从 10 个加到 120 个，测试 RMSE 会怎样？训练点按顺序取自同一批 120 个模拟点（x 随机落在 −1 到 1 之间，σ = 0.25），所以加点只是在已有的点之后添新点。<strong>学习曲线</strong> = 训练 RMSE 和测试 RMSE 随训练点数 n 变化的曲线（测试仍是那 400 个点，噪声底线约 0.24）。',
    c3a: '前 {n} 个点，9 次多项式',
    c3b: '学习曲线：RMSE 随 n',
    nSlider: '训练点数 n',
    s3hint: '观察顺序：n = 10 时 10 个系数正好穿过 10 个点，训练 RMSE 为 0，测试 RMSE 冲出图顶；看「前 n 个点」图，曲线最离谱的地方正是还没有训练点的空档。慢慢加点：n 在 20 到 30 之间测试 RMSE 骤降，n ≥ 40 以后两条线都贴近噪声底线 0.24。训练 RMSE 反而慢慢上升——点多了，曲线没法再迁就每一个点。',
    s3readout: 'n = {n}：训练 RMSE {train}，测试 RMSE {test}（噪声底线 {floor}）。',

    s4k: '第 4 步 · 换一批',
    s4t: '换一批训练数据，拟合出的曲线会变多少？',
    s4e: '这一步要回答：测试误差大，是因为曲线系统性地偏了，还是因为它对手上这一批数据太敏感？每按一次「再抽一批」，就从同一规律重新模拟 12 个训练点（σ = 0.25），再拟合一条 d 次多项式。<strong>偏差²</strong>：所有批次曲线的平均与真实规律之差的平方，在 −1 到 1 上 41 个等距 x 处取平均，衡量系统性偏离。<strong>方差</strong>：各批曲线围绕它们的平均曲线的散布（同样在 41 个 x 上取平均），衡量对数据的敏感程度。两者单位都是 y 的平方，越小越好；对新数据的期望均方误差约等于 偏差² + 方差 + σ²。',
    c4a: '{b} 批数据的拟合',
    c4b: '偏差²与方差（200 批平均）',
    lgBatch: '每批的拟合', lgMean: '各批平均', lgBias: '偏差²', lgVar: '方差', lgNow4: '白点 = 你抽的批次估计',
    dSlider4: '次数 d（换 d 会清空已抽的批次）',
    add1: '再抽一批', add5: '再抽 5 批', clear4: '清空批次',
    s4hint: '观察顺序：d = 1 时按几次「再抽 5 批」：直线们挤在一起（方差约 0.011），但平均线明显偏离白色虚线（偏差² 约 0.055）。换到 d = 9 再抽：曲线在两端乱甩，方差约 3.7，平均线却离真实规律不远。d = 3 时两者都小（约 0.001 和 0.024）。「偏差²与方差」图给出 200 批的平均：偏差²随 d 下降，方差随 d 上升。',
    s4readout: 'd = {d}，已抽 {b} 批：这些批次估计的偏差² = {b2}，方差 = {v}。200 批的平均：偏差² {B2}，方差 {V}，偏差² + 方差 + σ² = {sum}。',
    s4need: 'd = {d}，已抽 {b} 批：至少抽 2 批才能估计方差。200 批的平均：偏差² {B2}，方差 {V}。',

    s5k: '第 5 步 · 早停',
    s5t: '不降低次数，能不能让训练「适可而止」？',
    s5e: '这一步要回答：11 次多项式（12 个系数）配 12 个点，最小二乘解必然穿过每个点。如果仍用它，但改用<strong>梯度下降</strong>训练——从全部系数为 0 出发，每一步把系数朝训练误差下降最快的方向挪一小步（<a class="xlink" href="../../../computing/ml/gradient-descent/#step6">→ 梯度下降页第 6 步：当场训一个模型</a>）——并在中途停下，会怎样？为了决定何时停，另外模拟 40 个<strong>验证点</strong>：不参与训练，只用来看误差；400 个测试点仍只用于最后汇报。<strong>早停</strong> = 在验证 RMSE 最低的那一步停下。数据就是第 0 步那 12 个点。',
    c5a: '第 {k} 步的拟合',
    c5b: 'RMSE 随步数（对数轴）',
    lgVal: '验证 RMSE', lgTest5: '测试 RMSE', lgStop: '竖线 = 早停点（验证 RMSE 最低）',
    kSlider: '梯度下降步数',
    play5: '从头训练', toStop: '跳到早停点',
    s5hint: '观察顺序：按「从头训练」或拖滑杆。最初几步，水平线很快长成大致的形状，训练与验证 RMSE 一起下降；验证 RMSE 在第 6 步最低（竖线）。之后训练 RMSE 继续下降，验证 RMSE 却一路上升到 2.6 以上，曲线慢慢变成第 0 步里 d = 11 那种穿过每个点的样子。在这组数据上，梯度下降先拟合平缓的大形状，最后才去迁就单个点的噪声，所以早停起到了限制灵活度的作用。',
    s5readout: '第 {k} 步：训练 RMSE {train}，验证 RMSE {val}，测试 RMSE {test}。早停点在第 {stop} 步（验证 {vstop}，测试 {tstop}）；一直训练到第 {last} 步，测试 RMSE 是 {tend}。{prog}',
    s5prog: '（训练中）',

    s6k: '第 6 步 · 收束',
    s6t: '误差的三个来源，三种对策',
    s6fin: '训练误差只说明曲线离<strong>见过</strong>的点有多近；要知道它对新数据好不好，必须在没用过的点上测。灵活度一高，曲线就开始把<strong>噪声</strong>当规律记住：训练误差继续降，测试误差先降后升。对新数据的误差可以拆成三份：<strong>偏差²</strong>（太僵硬，系统性地偏）、<strong>方差</strong>（太灵活，换一批数据就变样）和 <strong>σ²</strong>（噪声本身，谁也消不掉）。对策：按验证误差挑灵活度；多收集数据；或者保留灵活的模型、用早停等办法限制它。',
    formula: 'RMSE = √( 平均 (预测 − 实际)² )\n期望均方误差 ≈ 偏差² + 方差 + σ²\n早停：在验证 RMSE 最低的那一步停',
    boundary: '适用范围：本页全部是模拟数据（已知的光滑规律 + 高斯噪声，种子固定），模型只有一元多项式。「最佳次数 d = 3」「第 6 步早停」都只属于这组数据。实际工作里，验证集用来挑模型或停止点，测试集只在最后用一次；如果拿测试集反复挑选，测试误差也会变得过于乐观。常见的做法还有交叉验证和正则化（给系数大小加惩罚）。',
    linksTitle: '接着去哪',
    lk1: '→ 回归页第 1 步：最小二乘怎样定出一条直线',
    lk2: '→ 决策树页第 3 步：树越深越好吗？同样的过拟合',
    lk3: '→ 梯度下降页第 6 步：当场训一个模型',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《过拟合》的平行版本。'
  },
  en: {
    pageTitle: 'Overfitting · A Curve That Memorises the Noise',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Overfitting →',
    navLabel: 'Overfitting steps',
    tagline: 'Twelve noisy points and a polynomial that can bend as much as it likes. The more flexible the curve, the closer it gets to those points — and the worse it may predict new data. Over seven steps you will see exactly where that line is crossed, why it moves with the noise, the amount of data and the particular batch you happened to draw, and how training that stops in time pulls it back.',
    nav0: '0 Fitting', nav1: '1 New data', nav2: '2 Noise', nav3: '3 More data', nav4: '4 New batches', nav5: '5 Early stopping', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Fitting',
    s0t: 'A bendier curve gets closer to the training points — is bendier better?',
    s0e: 'This step asks: we have 12 observations. Each has an x between −1 and 1 and a y that is some unknown rule plus random error. We want a curve that describes how y depends on x, so we can predict y for new x. The candidates are <strong>polynomials</strong> of <strong>degree</strong> d, which have d + 1 adjustable <strong>coefficients</strong>; the larger d, the more turns the curve can make — it is more <strong>flexible</strong>. The coefficients come from <strong>least squares</strong>: make the sum of squared vertical distances from the 12 points to the curve as small as possible (<a class="xlink" href="../../../probability/statistics/regression-correlation/#step1">→ Regression, step 1: least squares for a straight line</a>). For now we judge the fit by its <strong>training RMSE</strong>: square each “prediction − actual” on these 12 points, average, take the square root. It is in the units of y, and smaller means the curve passes closer to the training points. The data are simulated; the true rule stays hidden for now.',
    c0a: 'Training points, degree-d fit',
    c0b: 'Training RMSE (d values tried)',
    lgTrain: 'training points', lgFit: 'fitted curve', lgTruth: 'true rule (white dashed)', lgTrainErr: 'training RMSE',
    dSlider: 'Degree d',
    showTruth: 'Show the true rule', hideTruth: 'Hide the true rule',
    s0hint: 'What to try: step d from 0 up to 11 and watch the “Training RMSE” chart. Every d you try leaves a dot; they fall almost all the way, reaching 0 at d = 11 — twelve coefficients can thread a curve through twelve points. Now look at the “Training points, degree-d fit” chart: the degree-11 curve swings wildly between points and shoots off the chart. Finally press “Show the true rule” and judge which d looks most like it.',
    s0readout: 'd = {d}: {k} coefficients, training RMSE = {train}. {note}',
    s0interp: 'The curve passes through all 12 points.',

    s1k: 'Step 1 · New data',
    s1t: 'On points it has never seen, is the error still this small?',
    s1e: 'This step asks: a small training RMSE only shows that the curve remembers these 12 points — how well does it predict new data? We simulate 400 more <strong>test points</strong> from the same rule with the same amount of noise (they are not used in the fit) and compute the <strong>test RMSE</strong> on them with the same formula (smaller is better). Even a perfect guess of the true rule cannot bring test RMSE to 0, because the test points carry their own noise: the true rule scores about 0.24 on these 400 points — the <strong>noise floor</strong>. <strong>Overfitting</strong> means a tiny training error but a clearly larger test error: the curve has memorised the noise on the training points as if it were part of the rule.',
    c1a: 'Training, test points and fit',
    c1b: 'RMSE against degree d',
    lgTest: 'test points', lgTestErr: 'test RMSE', lgFloor: 'noise floor', lgOver: 'triangle = off the top of the axis (value in the readout)',
    s1hint: 'What to try: drag d and watch the two dots on the “RMSE against degree d” chart. Cyan (training) keeps falling; orange (test) falls and then rises, bottoming out at d = 3 with about 0.29, not far above the 0.24 noise floor. From d = 9 on, test RMSE leaves the top of the chart (drawn as a triangle). The gap between the two curves is how much the model overfits.',
    s1readout: 'd = {d}: training RMSE {train}, test RMSE {test}, gap {gap}. On this data set the lowest test RMSE is at d = {best} ({bestTest}); noise floor {floor}.',

    s2k: 'Step 2 · Noise',
    s2t: 'Is overfitting the fault of a flexible curve, or of noisy data?',
    s2e: 'This step asks: keep the same 12 x values and the same true rule, change only the noise level σ (the standard deviation of the random error, in units of y). How do the best degree and the amount of overfitting change? Each point’s error is σ times a fixed standard-normal number, so dragging σ only moves the points vertically, in proportion, away from the true rule — nothing else changes. <strong>Test RMSE</strong> is still measured on the 400 test points, whose noise scales with σ too, so the noise floor is about 0.96 σ.',
    c2a: 'Fit at σ = {s}',
    c2b: 'Test RMSE against degree d',
    lgCur: 'current σ', lgOld: 'other σ values tried',
    sSlider: 'Noise σ',
    clear2: 'Clear old curves',
    s2hint: 'What to try: first drag σ to 0 and look at the “Test RMSE against degree d” chart. The curve falls close to 0 and stays there however high d goes — with no noise, there is nothing to memorise. Then try σ = 0.1, 0.25 and 0.5 in turn, each leaving a faint curve: the larger σ, the higher the whole curve, the best degree stays low (d = 3), and the high-degree end climbs more steeply. Hold d = 9 while dragging σ and watch the curve in the “Fit at σ” chart twist with the noise.',
    s2readout: 'σ = {s}: lowest test RMSE at d = {best} ({bt}; noise floor {floor}). Current d = {d}: training RMSE {train}, test RMSE {test}.',

    s3k: 'Step 3 · More data',
    s3t: 'Same flexible curve — can more data cure the overfitting?',
    s3e: 'This step asks: with the degree fixed at d = 9 (10 coefficients), what happens to the test RMSE as the training set grows from 10 points to 120? Training points are taken in order from one batch of 120 simulated points (x scattered at random over −1 to 1, σ = 0.25), so adding points only appends new ones after those already there. A <strong>learning curve</strong> plots training RMSE and test RMSE against the number of training points n (the test set is still the same 400 points; noise floor about 0.24).',
    c3a: 'First {n} points, degree 9',
    c3b: 'Learning curve: RMSE vs n',
    nSlider: 'Training points n',
    s3hint: 'What to try: at n = 10, ten coefficients thread exactly through ten points — training RMSE is 0 and test RMSE is off the top of the chart; in the “First n points” chart the curve goes most wrong exactly where there are no training points yet. Add points slowly: somewhere between n = 20 and 30 test RMSE collapses, and from n = 40 on both lines hug the 0.24 noise floor. Training RMSE actually creeps up — with more points, the curve can no longer bend to suit every single one.',
    s3readout: 'n = {n}: training RMSE {train}, test RMSE {test} (noise floor {floor}).',

    s4k: 'Step 4 · New batches',
    s4t: 'Draw a fresh batch of training data — how much does the fitted curve change?',
    s4e: 'This step asks: when test error is large, is the curve systematically off, or just too sensitive to the particular batch it was given? Each press of “Draw a batch” simulates 12 new training points from the same rule (σ = 0.25) and fits a new degree-d polynomial. <strong>Bias²</strong>: the squared difference between the average of all the batch curves and the true rule, averaged over 41 evenly spaced x in [−1, 1] — how far off the model is systematically. <strong>Variance</strong>: how widely the batch curves scatter around their own average (also averaged over the 41 x) — how sensitive the model is to the data. Both are in units of y squared, and smaller is better; the expected squared error on new data is approximately bias² + variance + σ².',
    c4a: 'Fits to {b} batches',
    c4b: 'Bias² and variance (200 batches)',
    lgBatch: 'fit to one batch', lgMean: 'average of batches', lgBias: 'bias²', lgVar: 'variance', lgNow4: 'white dots = estimate from your batches',
    dSlider4: 'Degree d (changing d clears the batches)',
    add1: 'Draw a batch', add5: 'Draw 5 batches', clear4: 'Clear batches',
    s4hint: 'What to try: at d = 1 press “Draw 5 batches” a few times. The straight lines bunch together (variance about 0.011), but their average misses the white dashed curve clearly (bias² about 0.055). Switch to d = 9 and draw again: the curves thrash at both ends, variance is about 3.7, yet their average stays close to the true rule. At d = 3 both are small (about 0.001 and 0.024). The “Bias² and variance” chart shows averages over 200 batches: bias² falls with d and variance rises.',
    s4readout: 'd = {d}, {b} batches drawn: from these batches, bias² = {b2} and variance = {v}. Averages over 200 batches: bias² {B2}, variance {V}; bias² + variance + σ² = {sum}.',
    s4need: 'd = {d}, {b} batches drawn: you need at least 2 batches to estimate the variance. Averages over 200 batches: bias² {B2}, variance {V}.',

    s5k: 'Step 5 · Early stopping',
    s5t: 'Without lowering the degree, can training simply stop in time?',
    s5e: 'This step asks: a degree-11 polynomial (12 coefficients) with 12 points has a least-squares solution that passes through every point. What if we keep that model but train it with <strong>gradient descent</strong> — start with every coefficient at 0 and, at each step, nudge the coefficients a little in the direction that lowers the training error fastest (<a class="xlink" href="../../../computing/ml/gradient-descent/#step6">→ Gradient descent, step 6: train a model right there</a>) — and stop partway? To decide when to stop we simulate 40 <strong>validation points</strong>: they take no part in training and are only used to watch the error; the 400 test points are still kept for the final report. <strong>Early stopping</strong> means stopping at the step where validation RMSE is lowest. The data are the same 12 points as in step 0.',
    c5a: 'Fit after {k} steps',
    c5b: 'RMSE against steps (log)',
    lgVal: 'validation RMSE', lgTest5: 'test RMSE', lgStop: 'vertical line = early-stopping point (lowest validation RMSE)',
    kSlider: 'Gradient-descent steps',
    play5: 'Train from scratch', toStop: 'Jump to the stopping point',
    s5hint: 'What to try: press “Train from scratch” or drag the slider. In the first few steps the flat line quickly takes on the rough shape, and training and validation RMSE fall together; validation RMSE is lowest at step 6 (the vertical line). After that training RMSE keeps falling but validation RMSE climbs all the way past 2.6, and the curve slowly turns into the step-0, degree-11 curve that threads every point. On this data set gradient descent fits the broad, gentle shape first and only later bends to the noise on individual points, so stopping early acts as a limit on flexibility.',
    s5readout: 'Step {k}: training RMSE {train}, validation RMSE {val}, test RMSE {test}. The stopping point is step {stop} (validation {vstop}, test {tstop}); training all the way to step {last} ends with test RMSE {tend}.{prog}',
    s5prog: ' (training…)',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Three sources of error, three remedies',
    s6fin: 'Training error only says how close the curve passes to points it has <strong>seen</strong>; to know how it does on new data you have to measure on points it was not fitted to. Once flexibility is high enough, the curve starts memorising <strong>noise</strong> as if it were the rule: training error keeps falling while test error falls and then rises. Error on new data splits into three parts: <strong>bias²</strong> (too stiff, systematically off), <strong>variance</strong> (too flexible, changes with every batch) and <strong>σ²</strong> (the noise itself, which nobody can remove). Remedies: choose the flexibility by validation error; collect more data; or keep the flexible model and restrain it, for example by stopping early.',
    formula: 'RMSE = √( mean of (prediction − actual)² )\nexpected squared error ≈ bias² + variance + σ²\nearly stopping: stop where validation RMSE is lowest',
    boundary: 'Limits: everything here is simulated (a known smooth rule plus Gaussian noise, fixed seeds) and the only models are one-variable polynomials. “Best degree d = 3” and “stop at step 6” belong to this data set alone. In real work a validation set picks the model or the stopping point and a test set is used once, at the end; choosing repeatedly on the test set makes test error look too good as well. Cross-validation and regularisation (penalising large coefficients) are other common tools.',
    linksTitle: 'Where to go next',
    lk1: '→ Regression, step 1: how least squares picks a line',
    lk2: '→ Decision trees, step 3: is a deeper tree always better? The same overfitting',
    lk3: '→ Gradient descent, step 6: train a model right there',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Overfitting”.'
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
