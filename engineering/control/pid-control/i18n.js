'use strict';

const STRINGS = {
  zh: {
    pageTitle: '反馈控制 · 先看差多少，再决定推多少',
    back: '← 知识索引',
    navLabel: '反馈控制步骤导航',
    tagline: '设定值是你想要的，输出是系统现在的。反馈控制把两者之间的误差变成动作；调参，就是决定它追得多快、刹得多早、记得多久。',
    nav0: '0 设定值与误差', nav1: '1 P：看现在', nav2: '2 I：记账', nav3: '3 D：看趋势', nav4: '4 稳定性检查', nav5: '5 收束',
    s0k: '第 0 步 · 先定义问题', s0t: '设定值不是输出，误差才是控制器的入口',
    s0e: '把目标 <strong>设定值 r</strong> 拖到 0.5–4.0。系统输出 y 从 0 出发；控制器每一步只先问一个问题：<strong>还差多少？</strong> 这就是误差 e = r − y。设定值改变，误差会立刻改变；输出不会瞬移，它只能通过控制动作追过去。',
    setpoint: '设定值 r', output: '当前输出 y', error: '误差 e = r − y', setpointVal: '{v}', outputVal: '{v}', errorVal: '{v}', s0readout: 'r={r} · y={y} · e={e}',
    s0note: '拖动设定值，观察误差先跳变、输出再追赶。控制器永远对误差做出反应。',
    s1k: '第 1 步 · 只看现在', s1t: 'P：差得越多，推得越狠',
    s1e: '比例控制只看此刻的误差：<strong>u = Kp·e</strong>。Kp 太小，系统追得慢；Kp 变大，追得更快，但也更容易越过目标。注意曲线最后留下的缝：只靠 P，系统通常需要保留一点误差才能提供持续的力，所以会有<strong>稳态误差</strong>。',
    kp: '比例增益 Kp', reset: '重置', run: '运行', pause: '暂停', compareP: '显示 P 基线',
    s1metrics: 'Kp={kp} · 稳态误差 {error} · 超调 {overshoot}% · 收敛 {settling}',
    s1hint: '把 Kp 拉到高位，先预测曲线会变快还是会开始摆动，再看结果。',
    s2k: '第 2 步 · 把过去加进来', s2t: 'I：把残留误差一笔一笔记账',
    s2e: '积分项不只看现在，还把过去的误差累加：<strong>u = Kp·e + Ki·∫e dt</strong>。坡度、摩擦或负载会让系统长期偏离目标；I 项会持续累积这笔账，直到误差被吃掉。账记太快会带来积分饱和：系统越过目标后，积累的“旧账”还没花完，于是慢慢摆回来。',
    ki: '积分增益 Ki', disturbance: '加入 5 s 扰动',
    s2metrics: 'Ki={ki} · 末段平均误差 {error} · 最大控制力 {control} · {state}',
    s2hint: '先把 Ki 设为 0，再逐步增加；比较末段误差，不要只看第一秒。',
    disturbanceOn: '扰动：开', disturbanceOff: '扰动：关', stable: '已稳定', unstable: '仍在摆动',
    s3k: '第 3 步 · 看趋势再刹车', s3t: 'D：不是等到了才刹，而是看见速度就提前刹',
    s3e: '微分项观察误差变化率：<strong>u = Kp·e + Kd·de/dt</strong>。当输出快速冲向目标时，D 项提前给出反向动作，压低超调、缩短摆动。它的代价也很明确：噪声同样是“变化”，Kd 太大时会把测量毛刺放大成控制抖动。',
    kd: '微分增益 Kd', s3metrics: 'Kd={kd} · 峰值超调 {overshoot}% · 收敛 {settling} · 误差换向 {crossings} 次',
    s3hint: '固定 Kp、Ki，只改变 Kd。青色曲线表示当前 PID，虚线是没有 D 的基线。',
    s4k: '第 4 步 · 调参实验室', s4t: '稳定不是“越快越好”：用三条误解检查自己',
    s4e: '现在可以同时调 Kp、Ki、Kd。观察响应曲线、控制输出和指标，再回答下面的判断题。每个选项都对应一个真实的工程取舍：速度、超调、噪声和饱和不能同时无限变好。',
    setpointShort: '设定值', runAgain: '重新运行', presetSoft: '温和', presetBalanced: '均衡', presetFast: '激进',
    quizPrompt: '哪一句最准确？', quizA: 'Kp 越大越好，响应一定更稳定。', quizB: 'Kd 能减少超调，但过大时会放大噪声。', quizC: 'Ki 只影响第一秒，稳态误差与它无关。', check: '检查判断', correct: '正确：D 抑制趋势，但也会放大测量噪声；调参是权衡。', wrong: '再想一步：反馈项各看不同时间尺度，增大一个参数会改变别的代价。',
    s4metrics: '当前参数：Kp={kp} · Ki={ki} · Kd={kd} · 超调 {overshoot}% · 末段误差 {error}',
    s5k: '第 5 步 · 收束', s5t: '同一条闭环，三种时间尺度',
    s5e: 'P 看<strong>现在</strong>差多少，I 记<strong>过去</strong>欠了多少，D 看<strong>未来趋势</strong>会不会冲过头。设定值、误差、控制量和响应曲线必须彼此对得上；如果曲线看起来漂亮，却说不出是哪一项在起作用，就还没有真正读懂闭环。',
    formula: 'e = r − y　　u = Kp·e + Ki·∫e dt + Kd·de/dt',
    boundary: '模型边界：这里用一个带惯性、阻尼和弹簧回拉的二阶对象，固定步长数值积分；真实系统还会有采样延迟、饱和、噪声和非线性。',
    foot: 'visual.integ.life · 反馈控制 Feedback Control',
    settleNA: '未收敛', seconds: ' s',
  },
  en: {
    pageTitle: 'Feedback Control · Measure the gap, then choose the push', back: '← Knowledge index', navLabel: 'Feedback control steps',
    tagline: 'The setpoint is what you want; the output is what you have. Feedback turns their error into action. Tuning decides how fast it chases, how early it brakes, and how long it remembers.',
    nav0: '0 Setpoint & error', nav1: '1 P: now', nav2: '2 I: memory', nav3: '3 D: trend', nav4: '4 Stability check', nav5: '5 Wrap-up',
    s0k: 'Step 0 · Define the problem', s0t: 'The setpoint is not the output — error is the controller’s doorway',
    s0e: 'Drag the target <strong>setpoint r</strong> from 0.5 to 4.0. The plant output y starts at 0; the controller first asks one question at every step: <strong>how far off are we?</strong> That is the error e = r − y. A new setpoint changes the error instantly; the output cannot teleport, so it has to chase through control action.',
    setpoint: 'Setpoint r', output: 'Current output y', error: 'Error e = r − y', setpointVal: '{v}', outputVal: '{v}', errorVal: '{v}', s0readout: 'r={r} · y={y} · e={e}', s0note: 'Move the setpoint: the error jumps first, then the output catches up. The controller always acts on error.',
    s1k: 'Step 1 · Look at now', s1t: 'P: the farther off, the harder it pushes', s1e: 'Proportional control sees only the present error: <strong>u = Kp·e</strong>. Small Kp chases slowly; larger Kp chases faster but is more likely to cross the target. Notice the gap left at the end: P alone usually needs some error to keep producing force, so a <strong>steady-state error</strong> remains.',
    kp: 'Proportional gain Kp', reset: 'Reset', run: 'Run', pause: 'Pause', compareP: 'Show P baseline', s1metrics: 'Kp={kp} · steady error {error} · overshoot {overshoot}% · settle {settling}', s1hint: 'Before moving Kp high, predict whether the curve will speed up or start to sway.',
    s2k: 'Step 2 · Add the past', s2t: 'I: keep an account of leftover error', s2e: 'The integral term adds past error: <strong>u = Kp·e + Ki·∫e dt</strong>. A slope, friction or load can hold the output away from target; I keeps adding that account until the error is paid off. If it records too aggressively, integral windup leaves a backlog after the output crosses the target, so it swings back slowly.',
    ki: 'Integral gain Ki', disturbance: 'Add a disturbance at 5 s', s2metrics: 'Ki={ki} · final mean error {error} · max control {control} · {state}', s2hint: 'Set Ki to 0 first, then raise it step by step. Compare the final error, not just the first second.', disturbanceOn: 'Disturbance: on', disturbanceOff: 'Disturbance: off', stable: 'settled', unstable: 'still swaying',
    s3k: 'Step 3 · Brake from the trend', s3t: 'D: brake before you arrive', s3e: 'The derivative term watches how fast the error changes: <strong>u = Kp·e + Kd·de/dt</strong>. When the output rushes toward target, D applies an early counter-action to reduce overshoot and ringing. Its cost is just as clear: noise is also “change”, so a large Kd can turn measurement speckles into twitchy control.',
    kd: 'Derivative gain Kd', s3metrics: 'Kd={kd} · peak overshoot {overshoot}% · settle {settling} · error reversals {crossings}', s3hint: 'Hold Kp and Ki fixed; change only Kd. Cyan is the current PID, dashed is the no-D baseline.',
    s4k: 'Step 4 · Tuning lab', s4t: 'Stable does not mean “as fast as possible”: check three misconceptions', s4e: 'Now tune Kp, Ki and Kd together. Read the response, control effort and metrics, then answer the check below. Each option is a real engineering trade-off: speed, overshoot, noise and saturation cannot all improve without limit.', setpointShort: 'Setpoint', runAgain: 'Run again', presetSoft: 'Gentle', presetBalanced: 'Balanced', presetFast: 'Aggressive', quizPrompt: 'Which statement is most accurate?', quizA: 'Higher Kp is always better; it must be more stable.', quizB: 'Kd can reduce overshoot, but too much amplifies noise.', quizC: 'Ki only affects the first second; steady-state error is unrelated.', check: 'Check', correct: 'Correct: D suppresses trend, but also amplifies measurement noise; tuning is a trade-off.', wrong: 'Look again: each term watches a different time scale, and raising one changes the other costs.', s4metrics: 'Current: Kp={kp} · Ki={ki} · Kd={kd} · overshoot {overshoot}% · final error {error}',
    s5k: 'Step 5 · Wrap-up', s5t: 'One loop, three time scales', s5e: 'P sees how far off <strong>now</strong>, I remembers the debt from the <strong>past</strong>, and D watches the <strong>future trend</strong> so the response does not shoot past. Setpoint, error, control and response must agree; if the curve looks good but you cannot say which term is acting, you have not read the loop yet.', formula: 'e = r − y　　u = Kp·e + Ki·∫e dt + Kd·de/dt', boundary: 'Model boundary: this lesson uses a second-order plant with inertia, damping and a spring-like pull, integrated at a fixed step. Real systems add sampling delay, saturation, noise and nonlinearities.', foot: 'visual.integ.life · Feedback Control', settleNA: 'not settled', seconds: ' s',
  },
};

let lang = 'zh';
try { lang = localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { /* memory fallback */ }
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.replaceAll(`{${name}}`, String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* ignore denied storage */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => button.classList.toggle('active', button.dataset.lang === lang));
  if (typeof window.refreshFeedbackControl === 'function') window.refreshFeedbackControl();
}
window.FEEDBACK_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
