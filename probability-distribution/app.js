(() => {
  'use strict';
  const model = window.DistributionModel;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const state = { center: 5, spread: 1.7, skew: 0, threshold: 7, lang: localStorage.getItem('knowledge-vis-lang') || 'zh' };

  const copy = {
    zh: {
      back: '← 知识索引', eyebrow: '概率 · 一条可重算的因果链', title: '分布、期望与方差 · 随机变量的画像',
      tagline: '随机不是“什么都可能”，而是一张有重量的地图：概率先铺开，期望指出重心，方差量出散布，最后把这些量交给一个决策问题。',
      nav0: '0 先看分布', nav1: '1 期望是重心', nav2: '2 方差是散布', nav3: '3 读尾部概率', nav4: '4 拆掉误解',
      s0k: '第 0 步 · 钩子', s0t: '先别急着算平均：每个结果都有自己的重量', s0e: '下面每根柱子代表一个结果，柱子的高度就是它的概率。拖动参数，让“随机”从一句话变成一张可读的图。',
      legendProbability: '概率 P(X = x)', legendMean: '期望 E[X]', legendThreshold: '阈值', presetLabel: '先试一个形状：', presetBalanced: '对称', presetRight: '右偏', presetLeft: '左偏', presetWide: '更分散',
      s0hint: '柱高不是“结果会落在这里”，而是长期重复实验后落在这里的比例。先看形状，再问形状的数字摘要。', start: '跟着重心走 ↓',
      s1k: '第 1 步 · 加权平均', s1t: '期望不是“最常见的数”，而是概率加权的重心', s1e: '把每个结果乘上自己的概率，再把这些贡献相加。竖线会落在图的重心处：它可以不对应任何一根最高的柱子。', centerLabel: '中心位置', spreadLabel: '分散程度', skewLabel: '偏斜方向', meanMetric: '期望 E[X]', meanUnit: '结果单位', modeMetric: '众数（最高柱）', modeUnit: '最常出现的结果', meanGapMetric: '重心与众数差', meanGapUnit: '偏斜会把它拉开',
      s1hint: '把“期望 = 最可能值”当成定义，会在偏斜分布上出错。期望是把每根柱子按重量放到跷跷板上后，能让它平衡的位置。',
      s2k: '第 2 步 · 距离重心多远', s2t: '方差把“散不散”变成一个数', s2e: '每个结果离期望越远，平方后的代价越大。方差是这些距离的概率加权平均；标准差把它换回原来的单位，更适合直接读。', varianceMetric: '方差 Var(X)', varianceUnit: '平方单位', sdMetric: '标准差 σ', sdUnit: '结果单位', s2hint: '同一个期望可以配上很窄或很宽的分布，所以“平均水平相同”不等于“风险相同”。',
      s3k: '第 3 步 · 从摘要回到问题', s3t: '真正要问的，常常是“至少这么大”的概率', s3e: '拖动阈值，图中右侧的柱子会被圈出来。尾部概率把整张分布接到一个行动门槛：库存够不够、延迟会不会超时、成绩能否过线。', thresholdLabel: '阈值 k', tailMetric: '右尾概率', tailUnit: '达到或超过阈值', zMetric: '离期望的标准差数', zUnit: '阈值的位置', s3hint: '不要把“期望是 5”翻译成“每次都会接近 5”。期望描述的是大量重复后的重心，尾部概率描述的是这一次是否跨过门槛。',
      s4k: '第 4 步 · 误解检查', s4t: '哪一句最准确？先猜，再让分布回答', s4e: '当前图形会随你的参数变化。选一句你认为正确的解释，反馈会指出它把哪一个量混在了一起。', quizMode: '期望就是最高的柱子', quizMean: '期望是概率加权的重心', quizTail: '知道期望，就知道每次结果', formulaSummary: '把整条链写成四行', reset: '恢复默认分布', sources: '概念依据：随机变量的离散分布、期望与方差定义；图形用有限个结果近似展示，所有数值由当前柱高重新计算。', footer: '一个分布不是答案，它是让答案可以重算的起点。',
      meanReadout: '重心在 {mean}；最高柱是 {mode}。当前偏斜让两者相差 {gap}。', spreadReadout: '标准差约 {sd}：典型结果离重心约 {sd} 个单位。', tailReadout: '达到 {threshold} 或更高的概率是 {probability}，这才是这次门槛问题的答案。', feedbackMode: '最高柱是众数 {mode}；期望是 {mean}。众数回答“哪个单点最高”，期望回答“概率加权后在哪里平衡”。', feedbackMean: '答对了：期望 {mean} 是重心，标准差 {sd} 描述它周围的散布。它不保证下一次结果等于 {mean}。', feedbackTail: '这句话把期望和单次结果混在了一起。当前阈值 {threshold} 的右尾概率是 {probability}，分布才给出一次结果的机会。',
      chartTitle: '可调离散概率分布', chartDesc: '柱形图显示每个结果的概率，绿色线是期望，粉色线是阈值。'
    },
    en: {
      back: '← Knowledge index', eyebrow: 'Probability · A causal chain you can recompute', title: 'Distributions, Mean & Variance · The Portrait of a Random Variable',
      tagline: 'Random does not mean “anything goes.” It is a weighted map: probability lays it out, expectation finds its balance point, variance measures spread, and a threshold turns those summaries into a decision.',
      nav0: '0 See the distribution', nav1: '1 Mean is the balance point', nav2: '2 Variance is spread', nav3: '3 Read the tail', nav4: '4 Check the misconception',
      s0k: 'Step 0 · Hook', s0t: 'Before you average, give every outcome its weight', s0e: 'Each bar is an outcome; its height is its probability. Adjust the parameters and turn “random” from a slogan into a readable shape.',
      legendProbability: 'Probability P(X = x)', legendMean: 'Mean E[X]', legendThreshold: 'Threshold', presetLabel: 'Try a shape:', presetBalanced: 'Balanced', presetRight: 'Right-skewed', presetLeft: 'Left-skewed', presetWide: 'More spread',
      s0hint: 'A bar is not a promise about the next trial. It is the share you approach after repeating the experiment many times. Read the shape before asking for a summary number.', start: 'Follow the balance point ↓',
      s1k: 'Step 1 · Weighted average', s1t: 'The mean is not the tallest bar; it is the probability-weighted balance point', s1e: 'Multiply every outcome by its probability and add those contributions. The line lands at the distribution’s balance point, which need not be a bar’s peak.', centerLabel: 'Center', spreadLabel: 'Spread', skewLabel: 'Skew', meanMetric: 'Mean E[X]', meanUnit: 'outcome units', modeMetric: 'Mode (tallest bar)', modeUnit: 'most likely single outcome', meanGapMetric: 'Mean − mode', meanGapUnit: 'skew can pull them apart',
      s1hint: 'Treating “mean = most likely value” as a definition fails on a skewed distribution. The mean is where the weighted bars would balance on a seesaw.',
      s2k: 'Step 2 · Distance from the center', s2t: 'Variance turns “how spread out?” into one number', s2e: 'The farther an outcome is from the mean, the larger its squared cost. Variance averages those costs with probability; standard deviation returns to the original units.', varianceMetric: 'Variance Var(X)', varianceUnit: 'squared units', sdMetric: 'Standard deviation σ', sdUnit: 'outcome units', s2hint: 'The same mean can come with a narrow or wide distribution, so the same average does not mean the same risk.',
      s3k: 'Step 3 · Return to a real question', s3t: 'The useful question is often “at least this large?”', s3e: 'Move the threshold and the bars to its right are highlighted. A tail probability connects the whole distribution to an action: enough inventory, an on-time latency, a passing score.', thresholdLabel: 'Threshold k', tailMetric: 'Right-tail probability', tailUnit: 'at or above threshold', zMetric: 'Standard deviations from mean', zUnit: 'threshold location', s3hint: 'Do not translate “the mean is 5” into “every trial will be near 5.” The mean is a repeated-trial balance point; the tail answers whether this trial crosses the line.',
      s4k: 'Step 4 · Misconception check', s4t: 'Which sentence is most accurate? Guess, then let the distribution answer', s4e: 'The shape changes with your parameters. Pick the explanation you trust; feedback will identify which quantity the other choices confuse.', quizMode: 'The mean is the tallest bar', quizMean: 'The mean is the probability-weighted balance point', quizTail: 'Knowing the mean tells you every outcome', formulaSummary: 'Write the whole chain in four lines', reset: 'Reset the default distribution', sources: 'Concept basis: definitions of a discrete random variable, expectation and variance. The finite bars are a visual approximation; every number is recomputed from the current bars.', footer: 'A distribution is not an answer. It is a starting point that lets the answer be recomputed.',
      meanReadout: 'The balance point is {mean}; the tallest bar is {mode}. Current skew separates them by {gap}.', spreadReadout: 'The standard deviation is about {sd}: a typical outcome is about {sd} units from the balance point.', tailReadout: 'The chance of reaching {threshold} or higher is {probability}; that is the answer to this threshold question.', feedbackMode: 'The tallest bar is the mode {mode}; the mean is {mean}. The mode asks “which single point is highest?” while the mean asks “where does the weighted shape balance?”', feedbackMean: 'Correct: mean {mean} is the balance point, while standard deviation {sd} describes the spread around it. It does not promise the next result equals {mean}.', feedbackTail: 'This mixes up the mean and one trial. At threshold {threshold}, the right-tail probability is {probability}; the distribution gives the chance of crossing the line.',
      chartTitle: 'Adjustable discrete probability distribution', chartDesc: 'Bars show outcome probabilities, the green line is the mean, and the pink line is the threshold.'
    }
  };

  function format(template, values) { return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? ''); }
  function applyLanguage() {
    const lang = state.lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-i18n]').forEach(node => { const key = node.dataset.i18n; if (copy[lang][key]) node.textContent = copy[lang][key]; });
    $$('[data-lang]').forEach(button => button.classList.toggle('active', button.dataset.lang === lang));
    $('#chart-title').textContent = copy[lang].chartTitle;
    $('#chart-desc').textContent = copy[lang].chartDesc;
    render();
  }

  function getState() { return model.buildState(state); }

  function renderChart(current) {
    const svg = $('#distribution-chart');
    svg.querySelectorAll('.dynamic').forEach(node => node.remove());
    const left = 55, top = 24, plotWidth = 760, plotHeight = 250, base = top + plotHeight;
    const maxP = Math.max(...current.probabilities);
    const xFor = value => left + (value / 10) * plotWidth;
    [0, .25, .5, .75, 1].forEach(level => {
      const y = base - level * plotHeight;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', left); line.setAttribute('x2', left + plotWidth); line.setAttribute('y1', y); line.setAttribute('y2', y); line.setAttribute('class', 'chart-grid dynamic'); svg.appendChild(line);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', 6); text.setAttribute('y', y + 5); text.setAttribute('class', 'chart-label dynamic'); text.textContent = `${Math.round(level * maxP * 100)}%`; svg.appendChild(text);
    });
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('x1', left); axis.setAttribute('x2', left + plotWidth); axis.setAttribute('y1', base); axis.setAttribute('y2', base); axis.setAttribute('class', 'chart-axis dynamic'); svg.appendChild(axis);
    current.outcomes.forEach((outcome, index) => {
      const probability = current.probabilities[index];
      const width = plotWidth / 11 - 8;
      const x = xFor(outcome) - width / 2;
      const height = (probability / maxP) * (plotHeight - 20);
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', x); bar.setAttribute('y', base - height); bar.setAttribute('width', width); bar.setAttribute('height', height); bar.setAttribute('rx', 5); bar.setAttribute('class', `bar dynamic${outcome >= current.threshold ? ' tail' : ''}`); bar.setAttribute('aria-label', `${outcome}: ${(probability * 100).toFixed(1)}%`); svg.appendChild(bar);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + width / 2); label.setAttribute('y', base + 23); label.setAttribute('text-anchor', 'middle'); label.setAttribute('class', 'chart-label dynamic'); label.textContent = outcome; svg.appendChild(label);
    });
    const meanLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    meanLine.setAttribute('x1', xFor(current.mean)); meanLine.setAttribute('x2', xFor(current.mean)); meanLine.setAttribute('y1', top - 3); meanLine.setAttribute('y2', base); meanLine.setAttribute('class', 'mean-line dynamic'); svg.appendChild(meanLine);
    const meanLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    meanLabel.setAttribute('x', xFor(current.mean) + 6); meanLabel.setAttribute('y', top + 12); meanLabel.setAttribute('class', 'marker-label dynamic'); meanLabel.textContent = `E[X] ${current.mean.toFixed(2)}`; svg.appendChild(meanLabel);
    const thresholdLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    thresholdLine.setAttribute('x1', xFor(current.threshold)); thresholdLine.setAttribute('x2', xFor(current.threshold)); thresholdLine.setAttribute('y1', top - 3); thresholdLine.setAttribute('y2', base); thresholdLine.setAttribute('class', 'threshold-line dynamic'); svg.appendChild(thresholdLine);
    const thresholdLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    thresholdLabel.setAttribute('x', xFor(current.threshold) + 6); thresholdLabel.setAttribute('y', base - 8); thresholdLabel.setAttribute('class', 'marker-label dynamic'); thresholdLabel.textContent = `${copy[state.lang].legendThreshold} ${current.threshold}`; svg.appendChild(thresholdLabel);
  }

  function render() {
    const current = getState();
    renderChart(current);
    $('#center-value').textContent = current.center.toFixed(1); $('#spread-value').textContent = current.spread.toFixed(1); $('#skew-value').textContent = current.skew.toFixed(1); $('#threshold-value').textContent = current.threshold;
    $('#mean-value').textContent = current.mean.toFixed(2); $('#mode-value').textContent = current.mode; $('#mean-gap-value').textContent = (current.mean - current.mode).toFixed(2);
    $('#variance-value').textContent = current.variance.toFixed(2); $('#sd-value').textContent = current.sd.toFixed(2); $('#tail-value').textContent = `${(current.tailProbability * 100).toFixed(1)}%`; $('#tail-percent').textContent = `${(current.tailProbability * 100).toFixed(1)}%`;
    $('#z-value').textContent = `${current.sd ? ((current.threshold - current.mean) / current.sd).toFixed(2) : '0.00'}σ`;
    $('#mean-readout').textContent = format(copy[state.lang].meanReadout, { mean: current.mean.toFixed(2), mode: current.mode, gap: Math.abs(current.mean - current.mode).toFixed(2) });
    $('#spread-readout').textContent = format(copy[state.lang].spreadReadout, { sd: current.sd.toFixed(2) });
    $('#tail-readout').textContent = format(copy[state.lang].tailReadout, { threshold: current.threshold, probability: `${(current.tailProbability * 100).toFixed(1)}%` });
    $('#tail-fill').style.width = `${current.tailProbability * 100}%`;
    const bandLeft = model.clamp((current.mean - current.sd * 2) / 10, 0, 1) * 100; const bandRight = model.clamp((current.mean + current.sd * 2) / 10, 0, 1) * 100;
    $('#spread-band').style.left = `${bandLeft}%`; $('#spread-band').style.width = `${Math.max(1, bandRight - bandLeft)}%`; $('#spread-mean').style.left = `${model.clamp(current.mean / 10, 0, 1) * 100}%`;
    document.querySelectorAll('.quiz-option').forEach(button => button.classList.remove('selected'));
    $('#feedback').hidden = true;
  }

  function setValues(values) {
    Object.assign(state, values);
    $('#center').value = state.center; $('#spread').value = state.spread; $('#skew').value = state.skew; $('#threshold').value = state.threshold;
    render();
  }

  ['center', 'spread', 'skew', 'threshold'].forEach(id => { $(`#${id}`).addEventListener('input', event => { state[id] = Number(event.target.value); render(); }); });
  $$('[data-lang]').forEach(button => button.addEventListener('click', () => { state.lang = button.dataset.lang; localStorage.setItem('knowledge-vis-lang', state.lang); applyLanguage(); }));
  $$('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const presets = { balanced: { center: 5, spread: 1.7, skew: 0 }, right: { center: 4.6, spread: 1.5, skew: .82 }, left: { center: 5.4, spread: 1.5, skew: -.82 }, wide: { center: 5, spread: 3, skew: 0 } };
    setValues(presets[button.dataset.preset]);
    $$('[data-preset]').forEach(item => item.classList.toggle('active', item === button));
  }));
  $$('.quiz-option').forEach(button => button.addEventListener('click', () => {
    const result = model.misconceptionFeedback(button.dataset.choice, getState()); const feedback = $('#feedback');
    $$('.quiz-option').forEach(item => item.classList.toggle('selected', item === button));
    feedback.hidden = false; feedback.classList.toggle('error', !result.correct); feedback.textContent = format(copy[state.lang][result.key], result.values);
  }));
  $('#reset').addEventListener('click', () => { setValues({ center: 5, spread: 1.7, skew: 0, threshold: 7 }); $$('[data-preset]').forEach(item => item.classList.remove('active')); });
  applyLanguage();
})();
