(() => {
  'use strict';

  const COPY = {
    zh: {
      back: '← 知识索引', eyebrow: '生物学 × 神经信号', title: '动作电位：一次脉冲如何跑过神经元', tagline: '先把膜电位推到阈值，再跟着 Na⁺、K⁺ 通道走完一次尖峰。拖动参数，看“全或无”和不应期从曲线里出现。', nav0: '0 找到阈值', nav1: '1 看尖峰分期', nav2: '2 追踪不应期', nav3: '3 收束检查',
      s0k: '第 0 步 · 阈值是分水岭', s0title: '刺激更强，尖峰会变得更高吗？', s0explain: '静息膜电位约为 <strong>−70 mV</strong>。小刺激只留下一个小小的局部电位；一旦跨过阈值，电压门控 Na⁺ 通道会把它推成完整尖峰。把刺激来回推过阈值，找出“全或无”的分界。', stimulusLab: '刺激强度', thresholdLab: '阈值', windowLab: '观察窗口', peakLabel: '峰值膜电位', stateLabel: '响应类型', latencyLabel: '到达阈值', s0hint: '<strong>因果链：</strong>刺激使膜去极化 → 超过阈值 → Na⁺ 内流的正反馈把电压推到约 +30 mV。', next1: '继续：把尖峰拆成三个阶段 →',
      s1k: '第 1 步 · 离子通道接力', s1title: '同一条曲线，为什么会先上冲再跌落？', s1explain: 'Na⁺ 通道先快开，电位迅速上升；随后 Na⁺ 通道失活、K⁺ 通道打开，K⁺ 外流让膜电位下降，甚至短暂低于静息值。移动时间游标，把曲线和通道状态对齐。', timeLab: '尖峰内时刻', leakLab: '漏电流', naTitle: '快速内流', naBody: '去极化段打开，随后失活。', kTitle: '延迟外流', kBody: '复极化与超极化由它主导。', leakTitle: '背景漏电', leakBody: '把膜电位轻轻拉回静息线。', next2: '继续：发得太近会发生什么？ →',
      s2k: '第 2 步 · 不应期设定上限', s2title: '为什么神经信号不会无限加速？', s2explain: '一次尖峰后，Na⁺ 通道需要从失活状态恢复，K⁺ 通道也要关回去。绝对不应期内无法再发，随后是相对不应期——更强的刺激才可能触发下一次。拖动频率与不应期，数一秒最多能发几次。', freqLab: '输入刺激频率', refractoryLab: '不应期', inputLabel: '输入脉冲数', outputLabel: '成功动作电位', maxRateLabel: '理论上限', s2hint: '<strong>关键差异：</strong>频率编码通常改变“单位时间发几次”，而不是把每个动作电位的峰值越堆越高。', next3: '继续：做一次概念检查 →',
      s3k: '第 3 步 · 收束', s3title: '把曲线读成一句因果解释', s3explain: '选出正确说法。反馈会指出你混淆了阈值、峰值和频率编码中的哪一层。', quizQ: '当刺激已经超过阈值时，再把刺激强度加倍，单个动作电位会：', qA: '峰值也加倍', qB: '峰值近似不变，但可能改变发放频率', qC: '完全不再产生动作电位', finishTitle: '因果链闭合：', finishBody: '阈值触发 Na⁺ 正反馈，K⁺ 外流完成复极化，不应期把“全或无”的尖峰排成可编码的脉冲列。', foot: '双语交互切片 · 神经动作电位',
      thresholdState: '超过阈值 · 完整尖峰', subthresholdState: '低于阈值 · 局部电位', ms: 'ms', mv: 'mV', noSpike: '未跨过', phaseRest: '静息', phaseStimulus: '局部去极化', phaseDepolarize: '去极化 · Na⁺ 内流', phaseRepolarize: '复极化 · K⁺ 外流', phaseHyperpolarize: '超极化 · 不应期', phaseReadout: (phase, v) => `t = ${phase.t.toFixed(1)} ms，Vₘ = ${v.toFixed(0)} mV：${phase.label}`, inputSummary: (input, output) => `1 秒里送入 ${input} 个刺激，成功触发 ${output} 个动作电位。`, good: '答对了：动作电位遵循全或无；更强输入通常通过提高发放频率编码。', bad: '再看第 0 步：跨过阈值后尖峰大小由通道动力学决定，刺激强度主要改变是否和多久再次触发。'
    },
    en: {
      back: '← Knowledge index', eyebrow: 'BIOLOGY × NEURAL SIGNALS', title: 'Action potentials: how one pulse travels', tagline: 'Push membrane voltage to threshold, then follow Na⁺ and K⁺ channels through one spike. Drag the controls until all-or-none and refractoriness appear in the curves.', nav0: '0 Find threshold', nav1: '1 Read the spike phases', nav2: '2 Track refractoriness', nav3: '3 Close the chain',
      s0k: 'Step 0 · Threshold is the divide', s0title: 'Does a stronger stimulus make a taller spike?', s0explain: 'The resting membrane sits near <strong>−70 mV</strong>. A small stimulus leaves a local potential; once threshold is crossed, voltage-gated Na⁺ channels turn it into a full spike. Push the stimulus across the threshold and find the all-or-none boundary.', stimulusLab: 'stimulus strength', thresholdLab: 'threshold', windowLab: 'view window', peakLabel: 'peak membrane voltage', stateLabel: 'response type', latencyLabel: 'threshold crossing', s0hint: '<strong>Causal chain:</strong> stimulus depolarizes the membrane → threshold opens Na⁺ positive feedback → voltage rises near +30 mV.', next1: 'Continue: split the spike into three phases →',
      s1k: 'Step 1 · Ion channels take turns', s1title: 'Why does one curve rise and then fall?', s1explain: 'Na⁺ channels open fast and voltage rises; then Na⁺ inactivates while K⁺ opens, and K⁺ efflux brings voltage down below rest for a moment. Move the time cursor to align curve and channel state.', timeLab: 'time inside spike', leakLab: 'leak current', naTitle: 'fast inward flow', naBody: 'Opens during depolarization, then inactivates.', kTitle: 'delayed outward flow', kBody: 'Drives repolarization and the undershoot.', leakTitle: 'background leak', leakBody: 'Gently pulls voltage back toward rest.', next2: 'Continue: what if pulses arrive too close? →',
      s2k: 'Step 2 · Refractoriness sets the ceiling', s2title: 'Why can neural signals not accelerate forever?', s2explain: 'After a spike, Na⁺ channels must recover from inactivation and K⁺ channels must close. No new spike can start in the absolute refractory window; a stronger input may work in the relative window. Tune frequency and refractory time, then count the spikes per second.', freqLab: 'input stimulus rate', refractoryLab: 'refractory period', inputLabel: 'input pulses', outputLabel: 'successful action potentials', maxRateLabel: 'theoretical ceiling', s2hint: '<strong>Key distinction:</strong> rate coding changes how many spikes arrive per second, not the height of each all-or-none spike.', next3: 'Continue: check one concept →',
      s3k: 'Step 3 · Close the chain', s3title: 'Turn the curve into a causal sentence', s3explain: 'Choose the correct statement. Feedback will tell you whether threshold, peak voltage, or rate coding got mixed up.', quizQ: 'Once a stimulus is above threshold, doubling its strength makes one action potential:', qA: 'twice as tall', qB: 'about the same height, while firing rate may change', qC: 'impossible to produce', finishTitle: 'Causal chain closed: ', finishBody: 'Threshold starts Na⁺ positive feedback, K⁺ efflux repolarizes the membrane, and refractoriness spaces all-or-none spikes into a code.', foot: 'Bilingual interactive slice · Action potentials',
      thresholdState: 'above threshold · full spike', subthresholdState: 'below threshold · local potential', ms: 'ms', mv: 'mV', noSpike: 'not reached', phaseRest: 'resting', phaseStimulus: 'local depolarization', phaseDepolarize: 'depolarization · Na⁺ in', phaseRepolarize: 'repolarization · K⁺ out', phaseHyperpolarize: 'hyperpolarization · refractory', phaseReadout: (phase, v) => `t = ${phase.t.toFixed(1)} ms, Vₘ = ${v.toFixed(0)} mV: ${phase.label}`, inputSummary: (input, output) => `${input} stimuli entered in 1 second; ${output} action potentials got through.`, good: 'Correct: action potentials are all-or-none; stronger inputs usually encode through firing rate.', bad: 'Return to Step 0: after threshold, channel dynamics set spike size; input strength mainly changes whether and how soon another spike starts.'
    }
  };

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const smooth = x => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
  const thresholdMv = threshold => -70 + clamp(Number(threshold), 0.35, 0.85) * 27;
  const triggered = ({ stimulus = .7, threshold = .55 } = {}) => Number(stimulus) >= Number(threshold);

  function voltageAt(t, { stimulus = .7, threshold = .55, leak = .1 } = {}) {
    const time = Math.max(0, Number(t));
    const stim = clamp(Number(stimulus), 0, 1);
    const th = clamp(Number(threshold), 0.35, .85);
    const lk = clamp(Number(leak), 0, .4);
    const rest = -70;
    if (!triggered({ stimulus: stim, threshold: th })) {
      // A subthreshold response decays back to rest and never becomes a spike.
      return rest + 9 * (stim / th) * Math.exp(-time / (2.8 + lk * 2));
    }
    if (time < .85) return rest + 7 * smooth(time / .85);
    if (time < 1.95) return -63 + 98 * smooth((time - .85) / 1.1);
    if (time < 3.05) return 35 - 110 * smooth((time - 1.95) / 1.1);
    if (time < 4.9) return -75 - (8 + lk * 5) * smooth((time - 3.05) / 1.85);
    return -83 + 13 * smooth((time - 4.9) / 3.1);
  }

  function phaseAt(t, { stimulus = .7, threshold = .55 } = {}) {
    const time = Math.max(0, Number(t));
    if (!triggered({ stimulus, threshold })) return { id: 'local', labelKey: 'phaseStimulus', t: time };
    if (time < .85) return { id: 'rest', labelKey: 'phaseRest', t: time };
    if (time < 1.95) return { id: 'depolarize', labelKey: 'phaseDepolarize', t: time };
    if (time < 3.05) return { id: 'repolarize', labelKey: 'phaseRepolarize', t: time };
    if (time < 8) return { id: 'hyperpolarize', labelKey: 'phaseHyperpolarize', t: time };
    return { id: 'rest', labelKey: 'phaseRest', t: time };
  }

  function simulateWaveform({ stimulus = .7, threshold = .55, leak = .1, duration = 12, step = .1 } = {}) {
    const points = [];
    const total = Math.max(0, Number(duration));
    const dt = Math.max(.01, Number(step));
    for (let t = 0; t <= total + 1e-9; t += dt) points.push({ t: Number(t.toFixed(4)), v: voltageAt(t, { stimulus, threshold, leak }) });
    return points;
  }

  function firstThresholdCrossing({ stimulus = .7, threshold = .55, leak = .1, limit = 12, step = .01 } = {}) {
    if (!triggered({ stimulus, threshold })) return null;
    const target = thresholdMv(threshold);
    for (let t = 0; t <= limit; t += step) if (voltageAt(t, { stimulus, threshold, leak }) >= target) return Number(t.toFixed(2));
    return null;
  }

  function pulseTrain({ frequency = 40, durationMs = 1000, refractoryMs = 3 } = {}) {
    const f = clamp(Number(frequency), 0, 1000);
    const duration = Math.max(0, Number(durationMs));
    const refractory = Math.max(0, Number(refractoryMs));
    if (f === 0 || duration === 0) return { input: [], output: [], maxRate: refractory > 0 ? 1000 / refractory : Infinity };
    const interval = f > 0 ? 1000 / f : Infinity;
    const input = [];
    for (let t = 0; t < duration - 1e-9; t += interval) input.push(Number(t.toFixed(5)));
    const output = [];
    for (const t of input) if (!output.length || t - output[output.length - 1] >= refractory - 1e-9) output.push(t);
    return { input, output, maxRate: refractory > 0 ? 1000 / refractory : Infinity };
  }

  function setupCanvas(canvas, height) {
    if (!canvas || typeof window === 'undefined') return null;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(280, canvas.clientWidth || 800);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function frame(ctx, w, h, { yMin = -90, yMax = 45, xMax = 12, yLabel = 'mV', xLabel = 'ms' } = {}) {
    const pad = { l: 48, r: 20, t: 22, b: 36 };
    ctx.font = '12px system-ui'; ctx.lineWidth = 1; ctx.strokeStyle = '#273b50'; ctx.fillStyle = '#9fb1c4';
    for (let i = 0; i <= 4; i++) { const y = pad.t + (h - pad.t - pad.b) * i / 4; const value = yMax - (yMax - yMin) * i / 4; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.fillText(`${value.toFixed(0)}`, 8, y + 4); }
    ctx.fillText(yLabel, 8, 14); ctx.fillText(xLabel, w - 26, h - 10);
    return pad;
  }

  function drawWaveform(canvasId = 'membraneCanvas', options = {}, highlightTime = null) {
    const c = setupCanvas(document.getElementById(canvasId), canvasId === 'membraneCanvas' ? 320 : 300); if (!c) return;
    const { stimulus = .7, threshold = .55, leak = .1, window: duration = 12 } = options;
    const { ctx, width: w, height: h } = c; const pad = frame(ctx, w, h, { xMax: duration });
    const x = t => pad.l + (w - pad.l - pad.r) * t / duration; const y = v => h - pad.b - (h - pad.t - pad.b) * (v + 90) / 135;
    ctx.strokeStyle = '#ffbf69'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(pad.l, y(thresholdMv(threshold))); ctx.lineTo(w - pad.r, y(thresholdMv(threshold))); ctx.stroke(); ctx.setLineDash([]);
    const data = simulateWaveform({ stimulus, threshold, leak, duration, step: .08 }); ctx.strokeStyle = triggered({ stimulus, threshold }) ? '#69e5ff' : '#a8b6c7'; ctx.lineWidth = 3; ctx.beginPath(); data.forEach((d, i) => i ? ctx.lineTo(x(d.t), y(d.v)) : ctx.moveTo(x(d.t), y(d.v))); ctx.stroke();
    if (highlightTime != null) { const v = voltageAt(highlightTime, { stimulus, threshold, leak }); ctx.fillStyle = '#7ee2a8'; ctx.beginPath(); ctx.arc(x(highlightTime), y(v), 6, 0, Math.PI * 2); ctx.fill(); }
    return data;
  }

  function drawPhase() {
    const time = Number(document.getElementById('phaseTime').value); const leak = Number(document.getElementById('leak').value);
    const c = setupCanvas(document.getElementById('phaseCanvas'), 300); if (!c) return;
    const { ctx, width: w, height: h } = c; const pad = frame(ctx, w, h, { xMax: 8 }); const x = t => pad.l + (w - pad.l - pad.r) * t / 8; const y = v => h - pad.b - (h - pad.t - pad.b) * (v + 90) / 135;
    const bands = [[.85, 1.95, '#7ee2a8'], [1.95, 3.05, '#ffbf69'], [3.05, 8, '#ff8094']]; bands.forEach(([a, b, col]) => { ctx.fillStyle = `${col}16`; ctx.fillRect(x(a), pad.t, x(b) - x(a), h - pad.t - pad.b); });
    ctx.strokeStyle = '#69e5ff'; ctx.lineWidth = 3; ctx.beginPath(); const data = simulateWaveform({ stimulus: .8, threshold: .55, leak, duration: 8, step: .06 }); data.forEach((d, i) => i ? ctx.lineTo(x(d.t), y(d.v)) : ctx.moveTo(x(d.t), y(d.v))); ctx.stroke();
    const v = voltageAt(time, { stimulus: .8, threshold: .55, leak }); ctx.fillStyle = '#f2f6fa'; ctx.beginPath(); ctx.arc(x(time), y(v), 6, 0, Math.PI * 2); ctx.fill();
    const phase = phaseAt(time, { stimulus: .8, threshold: .55 }); phase.label = t(COPY[lang][phase.labelKey] ? phase.labelKey : 'phaseRest');
    const na = document.getElementById('naState'), k = document.getElementById('kState'), lk = document.getElementById('leakState');
    na.textContent = phase.id === 'depolarize' ? (lang === 'zh' ? '开放' : 'open') : phase.id === 'repolarize' || phase.id === 'hyperpolarize' ? (lang === 'zh' ? '失活' : 'inactivated') : (lang === 'zh' ? '关闭' : 'closed');
    k.textContent = phase.id === 'repolarize' || phase.id === 'hyperpolarize' ? (lang === 'zh' ? '开放' : 'open') : (lang === 'zh' ? '关闭' : 'closed');
    lk.textContent = (lang === 'zh' ? '微弱' : 'small');
    document.getElementById('phaseTimeOut').textContent = `${time.toFixed(1)} ${t('ms')}`; document.getElementById('leakOut').textContent = leak.toFixed(2); document.getElementById('phaseReadout').textContent = t('phaseReadout')({ ...phase, label: t(phase.labelKey) }, v);
  }

  function drawTrain() {
    const frequency = Number(document.getElementById('frequency').value); const refractory = Number(document.getElementById('refractory').value); const train = pulseTrain({ frequency, refractoryMs: refractory });
    const c = setupCanvas(document.getElementById('trainCanvas'), 280); if (!c) return; const { ctx, width: w, height: h } = c; const pad = frame(ctx, w, h, { yMin: 0, yMax: 1.2, xMax: 1000, yLabel: 'spikes', xLabel: 'ms' }); const x = ms => pad.l + (w - pad.l - pad.r) * ms / 1000;
    ctx.strokeStyle = '#69e5ff'; ctx.lineWidth = 2; train.input.forEach(ti => { ctx.beginPath(); ctx.moveTo(x(ti), h - pad.b); ctx.lineTo(x(ti), pad.t + 58); ctx.stroke(); });
    ctx.strokeStyle = '#7ee2a8'; ctx.lineWidth = 4; train.output.forEach(to => { ctx.beginPath(); ctx.moveTo(x(to), h - pad.b); ctx.lineTo(x(to), pad.t + 18); ctx.stroke(); });
    ctx.fillStyle = '#9fb1c4'; ctx.font = '12px system-ui'; ctx.fillText(lang === 'zh' ? '输入刺激' : 'input', pad.l, pad.t + 75); ctx.fillStyle = '#7ee2a8'; ctx.fillText(lang === 'zh' ? '成功动作电位' : 'successful spikes', pad.l, pad.t + 16);
    document.getElementById('frequencyOut').textContent = `${frequency} Hz`; document.getElementById('refractoryOut').textContent = `${refractory.toFixed(1)} ${t('ms')}`; document.getElementById('inputPulses').textContent = train.input.length; document.getElementById('outputPulses').textContent = train.output.length; document.getElementById('maxRate').textContent = `${train.maxRate.toFixed(0)} Hz`; document.getElementById('trainCanvas').setAttribute('aria-label', t('inputSummary')(train.input.length, train.output.length));
  }

  let lang = 'zh';
  const $ = id => document.getElementById(id); const t = key => COPY[lang][key] ?? COPY.zh[key] ?? key;
  function drawAll() {
    const options = { stimulus: +$('stimulus').value, threshold: +$('threshold').value, leak: +$('leak').value, window: +$('window').value };
    drawWaveform('membraneCanvas', options); const points = simulateWaveform(options); const peak = Math.max(...points.map(p => p.v)); const crossing = firstThresholdCrossing(options); $('stimulusOut').textContent = options.stimulus.toFixed(2); $('thresholdOut').textContent = options.threshold.toFixed(2); $('windowOut').textContent = `${options.window} ${t('ms')}`; $('peakVoltage').textContent = `${peak.toFixed(0)} ${t('mv')}`; $('spikeState').textContent = triggered(options) ? t('thresholdState') : t('subthresholdState'); $('latency').textContent = crossing == null ? t('noSpike') : `${crossing.toFixed(2)} ${t('ms')}`;
    drawPhase(); drawTrain();
  }
  function translate() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; document.querySelectorAll('[data-i18n]').forEach(el => { if (COPY[lang][el.dataset.i18n] != null) el.textContent = COPY[lang][el.dataset.i18n]; }); document.querySelectorAll('[data-i18n-html]').forEach(el => { if (COPY[lang][el.dataset.i18nHtml] != null) el.innerHTML = COPY[lang][el.dataset.i18nHtml]; }); document.querySelectorAll('#langToggle button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang)); drawAll();
  }
  function wire() {
    try { const saved = localStorage.getItem('knowledge-lang'); if (saved === 'zh' || saved === 'en') lang = saved; } catch (_) {}
    document.querySelectorAll('#langToggle button').forEach(b => b.onclick = () => { lang = b.dataset.lang; try { localStorage.setItem('knowledge-lang', lang); } catch (_) {} translate(); });
    ['stimulus', 'threshold', 'window', 'leak', 'phaseTime', 'frequency', 'refractory'].forEach(id => $(id).addEventListener('input', drawAll));
    document.querySelectorAll('.quiz-options button').forEach(btn => btn.onclick = () => { document.querySelectorAll('.quiz-options button').forEach(b => b.classList.remove('selected', 'wrong')); const good = btn.dataset.answer === 'correct'; btn.classList.add(good ? 'selected' : 'wrong'); $('quizFeedback').textContent = good ? t('good') : t('bad'); $('quizFeedback').className = `quiz-feedback ${good ? 'good' : 'bad'}`; });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) document.querySelectorAll('.nav-step').forEach((n, i) => n.classList.toggle('active', i === Number(entry.target.dataset.step))); }), { rootMargin: '-28% 0px -62%' }); document.querySelectorAll('.step').forEach(s => observer.observe(s));
  }

  const API = { clamp, thresholdMv, triggered, voltageAt, phaseAt, simulateWaveform, firstThresholdCrossing, pulseTrain, maxFiringRate: refractoryMs => 1000 / Math.max(1e-9, Number(refractoryMs)) };
  if (typeof module !== 'undefined') module.exports = API;
  if (typeof window !== 'undefined') { window.ActionPotential = API; document.addEventListener('DOMContentLoaded', () => { wire(); translate(); }); }
})();
