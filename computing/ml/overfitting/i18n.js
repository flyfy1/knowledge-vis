const STR = {
  zh: {
    docTitle: '过拟合 · 训练误差一路降，测试误差半路拐头', back: '← 知识索引', pageTitle: '过拟合',
    tagline: '用多项式去拟合带噪声的点：曲线越灵活，训练误差越小，可没见过的数据上的误差却会先降后升。看清拐点，再看数据量、换批数据和正则化怎样改变它。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 拟合曲线', nav1: '1 训练 vs 测试', nav2: '2 数据越多', nav3: '3 换批数据', nav4: '4 正则化', nav5: '5 终章',
    s0k: '第 0 步 · 拟合一条曲线', s0t: '曲线该有多弯？',
    s0e: '这一步要回答：用多项式去拟合 12 个带噪声的点，曲线应该多「弯」？<strong>多项式的次数</strong> d 越大，曲线越灵活（d 次多项式有 d+1 个可调系数）。点是在真实曲线 y = sin(2πx)（白色虚线）上加了随机噪声（标准差 0.25）得到的；橙线是用<strong>最小二乘</strong>（让各点到曲线的竖直误差平方和最小）拟合出的曲线。拖动次数 d：d = 0、1 时曲线太僵硬，抓不住起伏（欠拟合）；d = 11 时曲线刚好穿过每个点，却在点与点之间乱晃（过拟合）。读数里的<strong>训练 RMSE</strong> 是曲线到这 12 个点的平均误差（均方根），越小说明越贴着训练点。',
    s0dL: '多项式次数 d', s0reset: '重置', cv0: '训练点、真实曲线与拟合曲线',
    s0Cap: '12 个训练点、真实曲线与拟合', s0Leg: '白虚线 = 真实 sin(2πx)；青点 = 带噪声的训练点；橙线 = 拟合',
    s0v0: '曲线太僵硬，连整体起伏都没抓住。', s0v1: '曲线大致跟上了起伏。', s0v2: '曲线非常贴近这 12 个点，但点与点之间可能剧烈摆动。',
    s0ro: '次数 d = <b>{d}</b>（{p} 个系数）：训练 RMSE = <b>{tr}</b>。{v}',
    s0term: 'RMSE = 误差平方的平均再开方，单位与 y 相同。训练 RMSE 只说明对已见数据的贴合程度。',
    s1k: '第 1 步 · 训练误差与测试误差', s1t: '贴得越紧就越好吗？',
    s1e: '这一步要回答：在训练点上误差越小，在没见过的点上也越小吗？页面另外准备了 300 个没参与拟合的<strong>测试点</strong>（同一条真实曲线、同样大小的噪声）。青线是各次数的训练 RMSE，橙线是测试 RMSE，绿色虚线是噪声本身的标准差：即使完全知道真实曲线，测试误差也只能降到这条线附近。拖动「次数 d」看竖线移动：训练误差一路下降（d = 11 时几乎为 0），测试误差却先降后升，最低点就是「刚好」的复杂度。再拖「噪声」：噪声变大，最佳次数怎样变化？',
    s1dL: '多项式次数 d', s1zL: '噪声标准差', s1reset: '重置', cv1: '训练与测试 RMSE 随次数的变化',
    s1Cap: 'RMSE 随多项式次数的变化（纵轴截断在 0.6）', s1Ax: '次数 d：0 → 11', s1LegTr: '青 = 训练 RMSE', s1LegTe: '橙 = 测试 RMSE', s1LegN: '绿虚线 = 噪声标准差',
    s1ro: 'd = <b>{d}</b>，噪声 {sg}：训练 RMSE <b>{tr}</b>，测试 RMSE <b>{te}</b>；本页 12 个训练点下测试误差最低的次数是 <b>{b}</b>（{bt}）。',
    s1term: '测试 RMSE 只能用拟合时没见过的点来算；纵轴在 0.6 处截断，更高的值贴在图的上沿。',
    s2k: '第 2 步 · 数据越多越稳', s2t: '加数据能治过拟合吗？',
    s2e: '这一步要回答：固定一条很灵活的曲线（d = 9），样本数 n 增加会怎样？拖动「训练点数 n」：上图是用 n 个点拟合出的曲线，下图是<strong>学习曲线</strong>：横轴 n，青线是训练 RMSE，橙线是测试 RMSE。n 很小时橙线冲出图外（曲线在点间乱晃）；n 增大后两线逐渐靠拢到噪声线附近，说明足够的数据能约束住灵活的模型。注意：每个 n 的点都是按固定种子重新生成的，同一 n 的数值依赖这个种子。',
    s2nL: '训练点数 n', s2reset: '重置', cv2: '拟合曲线与学习曲线',
    s2Cap: 'n = {n} 个点，d = {d} 的拟合', s2Lc: '学习曲线（纵轴截断在 1.2）', s2Ax: '训练点数 n：10 → 80', s2Leg: '青 = 训练，橙 = 测试，绿虚线 = 噪声',
    s2ro: 'n = <b>{n}</b>，d = {d}：训练 RMSE {tr}，测试 RMSE <b>{te}</b>，差距（测试 − 训练）<b>{gap}</b>。',
    s2term: '学习曲线 = 误差随训练点数的变化；差距小说明模型没有只记住训练点。',
    s3k: '第 3 步 · 换批数据', s3t: '同一个模型，换一批数据会怎样？',
    s3e: '这一步要回答：高次拟合为什么「不稳定」？每按一次按钮，就用一批新的 12 个带噪声的点重新拟合一次，橙色细线累积在图上，绿线是这些拟合的平均。拖动次数 d：d 小时，每次拟合都差不多，但整体偏离真实曲线（<strong>偏差</strong>大）；d 大时，平均线接近真实曲线，但每次拟合各不相同，散布很大（<strong>方差</strong>大）。读数给出两者的数值：偏差² = 平均拟合与真实曲线之差的平方的平均；方差 = 各次拟合偏离平均拟合的平方的平均（都在 0 到 1 之间的 41 个格点上算，至少 2 批才有值）。',
    s3dL: '多项式次数 d', s3mL: '已拟合的批数', s3add: '再来一批数据', s3add5: '再来 5 批', s3reset: '清空所有拟合', cv3: '多批训练数据的拟合曲线与平均',
    s3Cap: 'd = {d}：各批拟合（橙）与平均（绿）', s3Leg: '白虚线 = 真实曲线；橙细线 = 每批的拟合；绿 = 平均拟合',
    s3ro: '已拟合 <b>{m}</b> 批，d = {d}：偏差² = <b>{b}</b>，方差 = <b>{v}</b>。',
    s3term: '偏差² 衡量「平均下来偏了多少」，方差衡量「换批数据晃了多少」；最多 20 批，数值有随机涨落。',
    s4k: '第 4 步 · 正则化', s4t: '能不能不减次数，也管住曲线？',
    s4e: '这一步要回答：不降低次数，怎样让灵活的曲线别乱晃？<strong>岭回归（L2 正则化）</strong>在最小化误差平方和的同时惩罚系数的大小：目标 = Σ(误差)² + λ·Σ(系数)²。λ 越大，系数被压得越小，曲线越平滑。固定 d = 11、12 个点，拖动 λ（对数刻度）：λ 极小时曲线穿过每个点（训练误差 0）并乱晃；适中的 λ 让测试误差大幅下降；λ 太大则曲线被压平，重新欠拟合。白点是扫描范围内测试误差最低的 λ。',
    s4lL: '惩罚强度 λ（对数）', s4reset: '重置', cv4: '岭回归拟合与误差随 λ 的变化',
    s4Cap: 'd = {d}，12 个点，岭回归拟合', s4Lc: 'RMSE 随 λ（对数轴）', s4Ax: 'λ：1e-9 → 10', s4Leg: '青 = 训练，橙 = 测试，白点 = 测试最低',
    s4ro: 'λ = 10^{l}：训练 RMSE <b>{tr}</b>，测试 RMSE <b>{te}</b>；扫描范围内测试误差最低的 λ = 10^{bl}（{bt}）。',
    s4term: 'λ 是我们设的惩罚强度（超参数），应当用没参与拟合的数据来选；本页用同一批测试点来选，真实使用时要另留验证集。',
    s5k: '第 5 步 · 终章', s5t: '收束：灵活度要刚刚好',
    s5e: '训练误差只会随灵活度下降，没见过的数据上的误差先降后升；数据量、正则化和对「换批数据会晃多少」的认识，是管住它的三个抓手。',
    c1t: '欠拟合与过拟合', c1b: '太僵硬抓不住规律，太灵活把噪声也记下来（第 0 步）。',
    c2t: '训练 ≠ 测试', c2b: '训练误差一路降，测试误差先降后升，最低点是刚好的复杂度（第 1 步）。',
    c3t: '数据与正则化', c3b: '更多数据或适度的 λ 都能约束灵活的模型（第 2、4 步）。',
    c4t: '偏差与方差', c4b: '次数小：偏差大方差小；次数大：偏差小方差大（第 3 步）。',
    modelT: '模型与局限',
    modelB: '数据来自 sin(2πx) 加高斯噪声，模型只有一元多项式（用 Chebyshev 基求解）；训练点与测试点由固定种子生成，数值随种子变化；最佳次数和最佳 λ 都是在这套数据上得到的。真实问题还需要验证集或交叉验证，并且模型和噪声要复杂得多。',
    linksT: '想从别处继续',
    link1: '决策树 · 长多深：同样的「训练升、新数据先升后降」出现在树上', link2: '梯度下降 · 生死线：拟合参数时怎样一步步下坡', link3: '蒙特卡洛 · 误差尺度：随机抽样的结果为什么会晃',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Overfitting · Training Error Keeps Falling, Test Error Turns Back', back: '← Knowledge Index', pageTitle: 'Overfitting',
    tagline: 'Fit noisy points with a polynomial: the more flexible the curve, the smaller the training error, yet the error on unseen data first falls and then rises. Find the turning point, then see how data size, resampling and regularisation change it.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Fit a curve', nav1: '1 Train vs test', nav2: '2 More data', nav3: '3 New samples', nav4: '4 Regularisation', nav5: '5 Finale',
    s0k: 'Step 0 · Fit a curve', s0t: 'How curvy should the curve be?',
    s0e: 'This step answers: when fitting 12 noisy points with a polynomial, how “bendy” should the curve be? The larger the <strong>polynomial degree</strong> d, the more flexible the curve (a degree-d polynomial has d+1 adjustable coefficients). The points are the true curve y = sin(2πx) (white dashed) plus random noise (standard deviation 0.25); the orange curve is the <strong>least-squares</strong> fit (it minimises the sum of squared vertical errors from the points to the curve). Drag the degree d: at d = 0 or 1 the curve is too stiff to follow the wiggle (underfitting); at d = 11 it passes through every point yet swings wildly between them (overfitting). The <strong>training RMSE</strong> in the readout is the curve’s average error (root-mean-square) on these 12 points; smaller means it hugs the training points more closely.',
    s0dL: 'Polynomial degree d', s0reset: 'Reset', cv0: 'Training points, true curve and fitted curve',
    s0Cap: '12 training points, true curve and fit', s0Leg: 'white dashed = true sin(2πx); cyan = noisy training points; orange = fit',
    s0v0: 'The curve is too stiff to catch even the overall wiggle.', s0v1: 'The curve roughly follows the wiggle.', s0v2: 'The curve hugs these 12 points very closely, but may swing wildly between them.',
    s0ro: 'Degree d = <b>{d}</b> ({p} coefficients): training RMSE = <b>{tr}</b>. {v}',
    s0term: 'RMSE = square root of the mean squared error, in the same unit as y. Training RMSE only says how closely the curve matches data it has already seen.',
    s1k: 'Step 1 · Training error and test error', s1t: 'Is a tighter fit always better?',
    s1e: 'This step answers: if the error on the training points is smaller, is the error on unseen points smaller too? The page keeps 300 extra <strong>test points</strong> that never took part in the fit (the same true curve, the same noise size). The cyan line is the training RMSE at each degree, the orange line the test RMSE, and the green dashed line is the noise’s own standard deviation: even knowing the true curve exactly, the test error can only fall to about this line. Drag “degree d” and watch the vertical line move: training error falls all the way (almost 0 at d = 11) while test error falls and then rises; its lowest point is the “just right” complexity. Then drag “noise”: how does the best degree change as the noise grows?',
    s1dL: 'Polynomial degree d', s1zL: 'Noise standard deviation', s1reset: 'Reset', cv1: 'Training and test RMSE against degree',
    s1Cap: 'RMSE against polynomial degree (vertical axis cut at 0.6)', s1Ax: 'degree d: 0 → 11', s1LegTr: 'cyan = training RMSE', s1LegTe: 'orange = test RMSE', s1LegN: 'green dashed = noise standard deviation',
    s1ro: 'd = <b>{d}</b>, noise {sg}: training RMSE <b>{tr}</b>, test RMSE <b>{te}</b>; with these 12 training points the degree with the lowest test error is <b>{b}</b> ({bt}).',
    s1term: 'Test RMSE can only be computed on points the fit has not seen; the vertical axis is cut at 0.6, so larger values stick to the top edge.',
    s2k: 'Step 2 · More data, more stability', s2t: 'Can more data cure overfitting?',
    s2e: 'This step answers: keep a very flexible curve (d = 9) and increase the number of samples n; what happens? Drag “training points n”: the upper picture is the curve fitted to n points and the lower one is the <strong>learning curve</strong>: n across, training RMSE in cyan, test RMSE in orange. With very small n the orange line shoots off the chart (the curve swings between the points); as n grows the two lines move together toward the noise line, showing that enough data can hold a flexible model in check. Note: the points for each n are regenerated from a fixed seed, so the numbers for a given n depend on that seed.',
    s2nL: 'Training points n', s2reset: 'Reset', cv2: 'Fitted curve and learning curve',
    s2Cap: 'Fit of d = {d} to n = {n} points', s2Lc: 'Learning curve (vertical axis cut at 1.2)', s2Ax: 'training points n: 10 → 80', s2Leg: 'cyan = training, orange = test, green dashed = noise',
    s2ro: 'n = <b>{n}</b>, d = {d}: training RMSE {tr}, test RMSE <b>{te}</b>, gap (test − training) <b>{gap}</b>.',
    s2term: 'Learning curve = error against the number of training points; a small gap means the model is not just memorising the training points.',
    s3k: 'Step 3 · New samples', s3t: 'Same model, a different batch of data: what changes?',
    s3e: 'This step answers: why is a high-degree fit “unstable”? Each press of the button refits on a fresh batch of 12 noisy points; the thin orange lines pile up on the chart and the green line is their average. Drag the degree d: for small d every fit is similar but the whole family sits away from the true curve (large <strong>bias</strong>); for large d the average is close to the true curve but the individual fits all differ and scatter widely (large <strong>variance</strong>). The readout gives both numbers: bias² = the mean over the grid of the squared gap between the average fit and the true curve; variance = the mean of the squared deviation of each fit from the average fit (both computed on 41 grid points between 0 and 1, and defined only from 2 batches on).',
    s3dL: 'Polynomial degree d', s3mL: 'Batches fitted', s3add: 'Add one more batch', s3add5: 'Add 5 batches', s3reset: 'Clear all fits', cv3: 'Fits to many batches of training data and their average',
    s3Cap: 'd = {d}: batch fits (orange), average (green)', s3Leg: 'white dashed = true curve; thin orange = fit per batch; green = average fit',
    s3ro: '<b>{m}</b> batch(es) fitted, d = {d}: bias² = <b>{b}</b>, variance = <b>{v}</b>.',
    s3term: 'Bias² measures “how far off the average is”, variance “how much it wobbles from batch to batch”; at most 20 batches, so the numbers fluctuate randomly.',
    s4k: 'Step 4 · Regularisation', s4t: 'Can we keep the curve in check without lowering the degree?',
    s4e: 'This step answers: without lowering the degree, how do we stop a flexible curve from swinging? <strong>Ridge regression (L2 regularisation)</strong> minimises the sum of squared errors and also penalises the size of the coefficients: objective = Σ(error)² + λ·Σ(coefficient)². The larger λ, the smaller the coefficients and the smoother the curve. Fix d = 11 and 12 points and drag λ (log scale): with a tiny λ the curve passes through every point (training error 0) and swings; a moderate λ cuts the test error sharply; a huge λ flattens the curve and underfits again. The white dot is the λ with the lowest test error in the scanned range.',
    s4lL: 'Penalty strength λ (log)', s4reset: 'Reset', cv4: 'Ridge fit and error against λ',
    s4Cap: 'd = {d}, 12 points, ridge fit', s4Lc: 'RMSE against λ (log axis)', s4Ax: 'λ: 1e-9 → 10', s4Leg: 'cyan = training, orange = test, white dot = lowest test',
    s4ro: 'λ = 10^{l}: training RMSE <b>{tr}</b>, test RMSE <b>{te}</b>; the λ with the lowest test error in the scanned range is 10^{bl} ({bt}).',
    s4term: 'λ is a penalty strength we choose (a hyperparameter) and should be picked with data that did not take part in the fit; this page picks it with the same test points, whereas real work keeps a separate validation set.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: flexibility should be just right',
    s5e: 'Training error only falls with flexibility, while error on unseen data falls and then rises; data size, regularisation and knowing how much a fit wobbles from sample to sample are the three handles to control it.',
    c1t: 'Underfit and overfit', c1b: 'Too stiff misses the pattern; too flexible memorises the noise (step 0).',
    c2t: 'Training ≠ test', c2b: 'Training error falls all the way, test error falls then rises, and its minimum is the right complexity (step 1).',
    c3t: 'Data and regularisation', c3b: 'More data or a moderate λ both rein in a flexible model (steps 2 and 4).',
    c4t: 'Bias and variance', c4b: 'Low degree: high bias, low variance; high degree: low bias, high variance (step 3).',
    modelT: 'Model and limits',
    modelB: 'The data are sin(2πx) plus Gaussian noise and the model is just a one-variable polynomial (solved in the Chebyshev basis); training and test points come from fixed seeds, so numbers change with the seed; the best degree and best λ were found on this data set. Real problems also need a validation set or cross-validation, and have far more complex models and noise.',
    linksT: 'Continue elsewhere',
    link1: 'Decision trees · how deep: the same “training rises, new data rises then falls” shows up in trees', link2: 'Gradient descent · the life-or-death line: how parameters are fitted by stepping downhill', link3: 'Monte Carlo · error scale: why random sampling results wobble',
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
