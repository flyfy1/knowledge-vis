'use strict';

(function () {

const $ = id => document.getElementById(id);
const CONTROL_API = window.FEEDBACK_CONTROL;
const t = (...args) => window.FEEDBACK_I18N.t(...args);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const COLORS = ['#67d7f9', '#ffb454', '#7ee2a8', '#ff7a93'];
const state = {
  showPBaseline: true,
  disturbance: false,
  lab: { setpoint: 1, Kp: 3.2, Ki: 1.2, Kd: 1.4 },
};

function number(id) { return Number($(id).value); }
function fmt(value, digits = 2) { return Number(value).toFixed(digits); }
function settle(value) { return value === null ? t('settleNA') : fmt(value, 1) + t('seconds'); }

function fitCanvas(canvas) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(260, canvas.clientWidth || 900);
  const height = Number(canvas.getAttribute('height')) || 330;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawResponse(id, runs, options = {}) {
  const canvas = $(id);
  if (!canvas) return;
  const { ctx, width: W, height: H } = fitCanvas(canvas);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1621';
  ctx.fillRect(0, 0, W, H);
  const plot = { left: 48, right: W - 16, top: 18, bottom: H - 88 };
  const allPoints = runs.flatMap(run => run.result.points);
  const setpoint = runs[0]?.result.config.setpoint || 1;
  const maxY = Math.max(setpoint * 1.18, ...allPoints.map(point => point.output), 0.6) * 1.08;
  const minY = Math.min(0, ...allPoints.map(point => point.output)) - 0.08;
  const maxT = runs[0]?.result.config.duration || 12;
  const xMap = value => plot.left + (value / maxT) * (plot.right - plot.left);
  const yMap = value => plot.bottom - ((value - minY) / (maxY - minY)) * (plot.bottom - plot.top);

  ctx.font = '11px system-ui,sans-serif';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const yValue = minY + (maxY - minY) * i / 4;
    const y = yMap(yValue);
    ctx.strokeStyle = i === 0 ? '#3a465e' : '#1d2635';
    ctx.beginPath(); ctx.moveTo(plot.left, y); ctx.lineTo(plot.right, y); ctx.stroke();
    ctx.fillStyle = '#7e8ea3'; ctx.textAlign = 'right'; ctx.fillText(yValue.toFixed(1), plot.left - 7, y + 4);
  }
  for (let i = 0; i <= 6; i += 1) {
    const x = plot.left + (plot.right - plot.left) * i / 6;
    ctx.strokeStyle = '#1d2635'; ctx.beginPath(); ctx.moveTo(x, plot.top); ctx.lineTo(x, plot.bottom); ctx.stroke();
    ctx.fillStyle = '#7e8ea3'; ctx.textAlign = 'center'; ctx.fillText((maxT * i / 6).toFixed(0) + 's', x, plot.bottom + 17);
  }
  ctx.strokeStyle = '#ffb454'; ctx.setLineDash([7, 5]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(plot.left, yMap(setpoint)); ctx.lineTo(plot.right, yMap(setpoint)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ffb454'; ctx.textAlign = 'left'; ctx.fillText('r', plot.right - 12, yMap(setpoint) - 7);

  runs.forEach((run, runIndex) => {
    if (!run.result.points.length) return;
    ctx.strokeStyle = run.color || COLORS[runIndex % COLORS.length];
    ctx.lineWidth = run.dashed ? 1.7 : 2.5;
    ctx.setLineDash(run.dashed ? [6, 5] : []);
    ctx.beginPath();
    run.result.points.forEach((point, index) => {
      const x = xMap(point.t), y = yMap(point.output);
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke(); ctx.setLineDash([]);
  });

  // The lower band keeps effort visible without turning the lesson into a
  // second chart: learners can see saturation and the sign of the push.
  const effortTop = plot.bottom + 39, effortBottom = H - 16;
  ctx.strokeStyle = '#28374a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(plot.left, (effortTop + effortBottom) / 2); ctx.lineTo(plot.right, (effortTop + effortBottom) / 2); ctx.stroke();
  ctx.fillStyle = '#7e8ea3'; ctx.textAlign = 'left'; ctx.fillText('u', 9, effortTop + 10); ctx.textAlign = 'right'; ctx.fillText('+20', plot.left - 7, effortTop + 4); ctx.fillText('−20', plot.left - 7, effortBottom + 4);
  runs.forEach((run, runIndex) => {
    ctx.strokeStyle = run.color || COLORS[runIndex % COLORS.length]; ctx.lineWidth = 1.2; ctx.setLineDash(run.dashed ? [5, 4] : []); ctx.beginPath();
    run.result.points.forEach((point, index) => {
      const x = xMap(point.t), y = effortBottom - ((clamp(point.control, -20, 20) + 20) / 40) * (effortBottom - effortTop);
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }); ctx.stroke(); ctx.setLineDash([]);
  });
  let legendX = plot.left + 10;
  ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'left';
  runs.forEach((run, runIndex) => {
    const color = run.color || COLORS[runIndex % COLORS.length];
    ctx.fillStyle = color; ctx.fillRect(legendX, 5, 18, 3); ctx.fillText(run.label, legendX + 24, 10); legendX += 24 + ctx.measureText(run.label).width + 16;
  });
  if (options.note) { ctx.fillStyle = '#9aaabd'; ctx.fillText(options.note, plot.left + 4, H - 3); }
}

function drawSetpoint() {
  const canvas = $('setpointCanvas');
  const { ctx, width: W, height: H } = fitCanvas(canvas);
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#0d1621'; ctx.fillRect(0, 0, W, H);
  const setpoint = number('setpoint');
  const result = CONTROL_API.simulate({ setpoint, Kp: 2.4, Ki: 1.2, Kd: 1.4, duration: 2 });
  const sample = result.points[result.points.length - 1];
  const left = 50, right = W - 26, y = H / 2 + 12, scale = value => left + (value / 4.2) * (right - left);
  ctx.strokeStyle = '#3a465e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
  ctx.font = '12px system-ui,sans-serif'; ctx.fillStyle = '#9aaabd'; ctx.textAlign = 'left'; ctx.fillText('0', left, y + 31); ctx.textAlign = 'right'; ctx.fillText('4.0', right, y + 31);
  const outputX = scale(sample.output), targetX = scale(setpoint);
  ctx.strokeStyle = '#ffb454'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(left, y - 16); ctx.lineTo(targetX, y - 16); ctx.stroke();
  ctx.strokeStyle = '#67d7f9'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(left, y + 16); ctx.lineTo(outputX, y + 16); ctx.stroke();
  ctx.fillStyle = '#ffb454'; ctx.beginPath(); ctx.arc(targetX, y - 16, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#67d7f9'; ctx.beginPath(); ctx.arc(outputX, y + 16, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8edf4'; ctx.textAlign = 'left'; ctx.fillText(t('setpoint') + '  r', left, y - 42); ctx.fillText(t('output') + '  y', left, y + 59);
  ctx.fillStyle = '#ff7a93'; ctx.textAlign = 'center'; ctx.font = '700 16px system-ui,sans-serif'; ctx.fillText('e = ' + fmt(sample.error, 2), (targetX + outputX) / 2, y + 5);
  $('setpointValue').textContent = t('setpointVal', { v: fmt(setpoint, 1) });
  $('setpointReadout').textContent = t('s0readout', { r: fmt(setpoint, 1), y: fmt(sample.output, 2), e: fmt(sample.error, 2) });
}

function drawP() {
  const setpoint = number('setpoint');
  const Kp = number('kp');
  const current = CONTROL_API.simulate({ setpoint, Kp, Ki: 0, Kd: 0 });
  const runs = [{ result: current, label: 'P', color: '#67d7f9' }];
  if (state.showPBaseline && Math.abs(Kp - 2.4) > 0.01) runs.push({ result: CONTROL_API.simulate({ setpoint, Kp: 2.4, Ki: 0, Kd: 0 }), label: 'P baseline', color: '#9aaabd', dashed: true });
  drawResponse('pCanvas', runs);
  $('kpValue').textContent = fmt(Kp, 1);
  $('pReadout').textContent = t('s1metrics', { kp: fmt(Kp, 1), error: fmt(current.metrics.finalError, 2), overshoot: fmt(current.metrics.overshootPercent, 1), settling: settle(current.metrics.settlingTime) });
}

function drawPI() {
  const setpoint = number('setpoint'); const Kp = number('piKp'); const Ki = number('ki');
  const current = CONTROL_API.simulate({ setpoint, Kp, Ki, Kd: 0, disturbance: state.disturbance });
  const baseline = CONTROL_API.simulate({ setpoint, Kp, Ki: 0, Kd: 0, disturbance: state.disturbance });
  drawResponse('iCanvas', [{ result: current, label: 'PI', color: '#67d7f9' }, { result: baseline, label: 'P', color: '#9aaabd', dashed: true }]);
  $('piKpValue').textContent = fmt(Kp, 1); $('kiValue').textContent = fmt(Ki, 1);
  $('iReadout').textContent = t('s2metrics', { ki: fmt(Ki, 1), error: fmt(current.metrics.finalError, 2), control: fmt(current.metrics.maxControl, 1), state: current.metrics.stable ? t('stable') : t('unstable') });
}

function drawPID() {
  const setpoint = number('setpoint'); const Kp = number('pidKp'); const Ki = number('pidKi'); const Kd = number('kd');
  const current = CONTROL_API.simulate({ setpoint, Kp, Ki, Kd });
  const baseline = CONTROL_API.simulate({ setpoint, Kp, Ki, Kd: 0 });
  drawResponse('dCanvas', [{ result: current, label: 'PID', color: '#67d7f9' }, { result: baseline, label: 'PI', color: '#9aaabd', dashed: true }]);
  $('pidKpValue').textContent = fmt(Kp, 1); $('pidKiValue').textContent = fmt(Ki, 1); $('kdValue').textContent = fmt(Kd, 1);
  $('dReadout').textContent = t('s3metrics', { kd: fmt(Kd, 1), overshoot: fmt(current.metrics.overshootPercent, 1), settling: settle(current.metrics.settlingTime), crossings: current.metrics.signChanges });
}

function drawLab() {
  const lab = state.lab;
  const current = CONTROL_API.simulate(lab);
  const baseline = CONTROL_API.simulate({ ...lab, Kd: 0 });
  drawResponse('labCanvas', [{ result: current, label: 'PID', color: '#67d7f9' }, { result: baseline, label: 'PI', color: '#9aaabd', dashed: true }]);
  $('labSetpointValue').textContent = fmt(lab.setpoint, 1); $('labKpValue').textContent = fmt(lab.Kp, 1); $('labKiValue').textContent = fmt(lab.Ki, 1); $('labKdValue').textContent = fmt(lab.Kd, 1);
  $('labReadout').textContent = t('s4metrics', { kp: fmt(lab.Kp, 1), ki: fmt(lab.Ki, 1), kd: fmt(lab.Kd, 1), overshoot: fmt(current.metrics.overshootPercent, 1), error: fmt(current.metrics.finalError, 2) });
}

function refresh() {
  drawSetpoint(); drawP(); drawPI(); drawPID(); drawLab();
  const disturbanceButton = $('disturbance');
  if (disturbanceButton) disturbanceButton.textContent = state.disturbance ? t('disturbanceOn') : t('disturbanceOff');
}
window.refreshFeedbackControl = refresh;

function bindRange(id, fn) { $(id).addEventListener('input', fn); }
function syncLab() {
  state.lab = { setpoint: number('labSetpoint'), Kp: number('labKp'), Ki: number('labKi'), Kd: number('labKd') };
  drawLab();
}

function setup() {
  bindRange('setpoint', refresh); bindRange('kp', drawP); bindRange('piKp', drawPI); bindRange('ki', drawPI); bindRange('pidKp', drawPID); bindRange('pidKi', drawPID); bindRange('kd', drawPID);
  ['labSetpoint', 'labKp', 'labKi', 'labKd'].forEach(id => bindRange(id, syncLab));
  $('pReset').addEventListener('click', () => { $('kp').value = 2.4; drawP(); });
  $('pBaseline').addEventListener('click', () => { state.showPBaseline = !state.showPBaseline; drawP(); });
  $('iReset').addEventListener('click', () => { $('piKp').value = 2.4; $('ki').value = 0; state.disturbance = false; drawPI(); refresh(); });
  $('dReset').addEventListener('click', () => { $('pidKp').value = 2.4; $('pidKi').value = 0; $('kd').value = 0; drawPID(); });
  $('disturbance').addEventListener('click', () => { state.disturbance = !state.disturbance; drawPI(); refresh(); });
  $('labRun').addEventListener('click', drawLab);
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const presets = { soft: [1.8, 0.5, 1.8], balanced: [3.2, 1.2, 1.4], fast: [7.2, 2.8, 0.35] };
    const [Kp, Ki, Kd] = presets[button.dataset.preset];
    $('labKp').value = Kp; $('labKi').value = Ki; $('labKd').value = Kd; syncLab();
  }));
  $('checkQuiz').addEventListener('click', () => {
    const choice = document.querySelector('input[name="quiz"]:checked');
    $('quizFeedback').textContent = choice && choice.value === 'b' ? t('correct') : t('wrong');
    $('quizFeedback').style.color = choice && choice.value === 'b' ? '#7ee2a8' : '#ffb454';
  });
  const links = [...document.querySelectorAll('.nav-step')];
  const steps = [...document.querySelectorAll('.step')];
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) links.forEach((link, index) => link.classList.toggle('active', index === steps.indexOf(entry.target)));
  }), { rootMargin: '-25% 0px -60% 0px' });
  steps.forEach(step => navObserver.observe(step));
  window.addEventListener('resize', refresh);
  refresh();
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', setup);
})();
