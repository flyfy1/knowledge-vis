'use strict';
// Author: Claude Code (claude-opus-5-5), 2026-11-08. Same i18n mechanism as pid-control.

const STRINGS = {
  zh: {
    pageTitle: '阶跃响应 · 阻尼比决定冲多远，固有频率决定多快',
    back: '← 知识索引',
    navLabel: '阶跃响应步骤导航',
    tagline: '让一个有惯性、有回拉、有阻尼的系统突然换到新目标，它不会瞬移过去：要么冲过头再摆回来，要么慢慢爬过去。两个数——阻尼比 ζ 和固有频率 ωn——就能把这条曲线的形状说清楚。',
    nav0: '0 阶跃', nav1: '1 阻尼比 ζ', nav2: '2 超调与峰值', nav3: '3 固有频率 ωn', nav4: '4 极点', nav5: '5 设计挑战', nav6: '6 收束',

    s0k: '第 0 步 · 先看现象', s0t: '目标突然跳一下，输出怎样追过去？',
    s0e: '这一步要回答：一个带质量、弹簧和阻尼的系统，被要求<strong>突然</strong>换到新位置时，会怎样走过去？「突然换目标」叫<strong>阶跃输入</strong>：目标值 u 在 t = 0 从 0 跳到 1 并一直保持（图里橙色虚线）。系统输出 y 随时间画出来的曲线叫<strong>阶跃响应</strong>（青色实线）。它最后停在 1，这个最终值叫<strong>稳态值</strong>。按下按钮，看上方滑块（代表输出位置）和下方曲线一起走。',
    applyStep: '施加阶跃', replay: '重放', pause: '暂停', resume: '继续', scrub: '拖动查看任一时刻 t', s0progress: '模拟时间 t = {t} s / {T} s · 当前输出 y = {y}',
    s0done: '走完了：输出先冲到 {peak}（比稳态值 1 高出 {po}%），来回摆几次后停在 1 附近。',
    s0hint: '横轴是时间（秒），纵轴是输出 y；橙色虚线是阶跃目标。本步固定 ζ = 0.3、ωn = 2 rad/s，下一步再改。播放是教学慢放：10 s 模型时间用 4 s 播完；可随时暂停，或拖动时间滑杆逐刻查看。',

    s1k: '第 1 步 · 第一个旋钮', s1t: '阻尼比 ζ：冲过头，还是慢慢爬',
    s1e: '这一步要回答：阻尼多一点、少一点，曲线的形状怎么变？<strong>阻尼</strong>是和速度成正比、把运动能量耗掉的那部分力（<a class="xlink" href="../../../physics/waves/resonance/#step1">→ 共振页第 1 步：阻尼怎样一点点带走能量</a>）。<strong>阻尼比 ζ</strong>（zeta）把它换成一个无单位的数：实际阻尼除以「刚好不再来回摆」所需的阻尼。ζ &lt; 1 叫<strong>欠阻尼</strong>，会冲过目标再摆回；ζ = 1 叫<strong>临界阻尼</strong>；ζ &gt; 1 叫<strong>过阻尼</strong>，不冲过但爬得慢。',
    zeta: '阻尼比 ζ', clearTrails: '清除旧曲线',
    s1readout: 'ζ = {z} · {regime} · 超调 {po}% · 2% 调节时间 {ts}',
    regime_under: '欠阻尼：冲过 1 再来回摆', regime_critical: '临界阻尼：不冲过 1 的情况里最快到达（ωn 固定时）', regime_over: '过阻尼：不冲过，但爬得慢',
    s1hint: '观察顺序：保持 ωn = 2 不变，只拖 ζ。每次松手，旧曲线会变淡留在图上，方便对比。先从 0.1 拖到 1，再拖到 2，看第一次越过 1 的那个尖峰怎样消失。读数口径：超调 = 最高点比稳态值 1 高出的百分比；2% 调节时间 = 进入并一直留在 1 ± 2% 内所需的时间（第 2、3 步细讲）。',

    s2k: '第 2 步 · 读第一个指标', s2t: '超调只看 ζ，和快慢无关',
    s2e: '这一步要回答：冲过头冲多少，由谁决定？<strong>超调</strong>（overshoot）= 曲线最高点比稳态值 1 高出的部分，用稳态值的百分比表示，越小越「稳」。<strong>峰值时间 tp</strong> = 从阶跃开始到这个最高点的时间。对欠阻尼（0 &lt; ζ &lt; 1）的理想二阶系统，教科书给出 <strong>超调 = e^(−ζπ/√(1−ζ²)) × 100%</strong>：式子里只有 ζ。右图画的就是这条公式，圆点是当前曲线上实际读出的超调。',
    wn: '固有频率 ωn (rad/s)',
    s2readout: '超调：曲线实测 {po}% · 公式 {poF}%　｜　峰值时间 tp：实测 {tp} · 公式 π/ωd = {tpF}',
    s2hint: '观察顺序：先只拖 ζ，看圆点沿右图曲线走；再固定 ζ、只拖 ωn——左图的尖峰左右移动，但高度和圆点都不动。',
    poAxis: '超调 %', zetaAxis: 'ζ',

    s3k: '第 3 步 · 第二个旋钮', s3t: '固有频率 ωn：同一个形状，压缩或拉长时间',
    s3e: '这一步要回答：怎样让系统更快，又不改变它冲过头的比例？<strong>固有频率 ωn</strong> 是没有阻尼时系统自己来回摆的角频率（单位 rad/s），弹簧越硬、质量越小，ωn 越大。<strong>2% 调节时间 ts</strong> = 输出进入并<em>一直留在</em> 1 ± 0.02 这条带里所需的时间，越小越快。ζ 不变时，把 ωn 加倍，整条曲线沿时间轴压缩一半：超调（最高点高出稳态值的百分比）不变，峰值时间和调节时间都减半。常用估算 ts ≈ 4/(ζωn)，它来自包络 e^(−ζωn·t) 降到约 2%（e^(−4) ≈ 1.8%）的时间。',
    s3readout: 'ωn = {w} rad/s · 2% 调节时间：实测 {ts} · 估算 4/(ζωn) = {tsF} · 超调 {po}%',
    s3hint: '观察顺序：保持 ζ 不变，把 ωn 从 1 拖到 4，旧曲线留在图上。浅绿色带是 1 ± 2%；竖线标出每条曲线进入并留在带里的时刻。估算只看包络衰减（忽略包络前的系数，也不管振荡何时恰好落进带内），所以实测可能比它短也可能比它长；在 0.1 ≤ ζ ≤ 0.95 时两者相差在 ±25% 以内。',

    s4k: '第 4 步 · 换一张图', s4t: '两个旋钮，其实是复平面上的一个点',
    s4e: '这一步要回答：ζ 和 ωn 能不能画在同一张图上？这个系统的<strong>极点</strong>是让 s² + 2ζωn·s + ωn² 等于零的两个 s 值，画在复平面上（横轴实部、纵轴虚部；<a class="xlink" href="../../../signal/transforms/laplace/#step4">→ 拉普拉斯页第 4 步：系统的性格写在极点位置里</a>）。欠阻尼时它们是一对 −ζωn ± j·ωd，其中 ωd = ωn√(1−ζ²)。读法：极点<strong>离虚轴越远</strong>（ζωn 越大），振荡衰减越快；<strong>越高</strong>（ωd 越大），摆得越快；<strong>与负实轴的夹角 θ</strong> 满足 cos θ = ζ，夹角越小超调越小。',
    s4readout: '极点 = {re} ± {im}j · 到原点距离 ωn = {w} · cos θ = ζ = {z} · 衰减速率 ζωn = {sig} /s',
    s4readoutReal: '极点 = {p1}、{p2}（都在实轴上：不振荡）· ζ = {z}',
    s4hint: '观察顺序：先只拖 ζ——极点沿以原点为圆心、半径 ωn 的圆弧滑动；再只拖 ωn——极点沿一条过原点的射线移动。右图虚线是包络 1 ± e^(−ζωn·t)/√(1−ζ²)，振荡总在它里面。',
    reAxis: '实部 Re', imAxis: '虚部 Im',

    s5k: '第 5 步 · 用起来', s5t: '设计挑战：超调 ≤ 10%，2% 调节时间 ≤ 2 s',
    s5e: '这一步要回答：给定指标，怎样反推 ζ 和 ωn？要求：<strong>超调</strong>（最高点比稳态值高出的百分比）不超过 10%，<strong>2% 调节时间</strong>（进入并留在 1 ± 2% 带内的时间）不超过 2 s。左图虚线是两条要求；右图是复平面，绿色区域是<em>按公式估算</em>两条都满足的极点位置：夹角 θ ≤ 53.8°（即 ζ ≥ 0.59，对应超调 10%）且离虚轴至少 2（ζωn ≥ 2，对应 4/(ζωn) ≤ 2 s）。估算和实测会有一点出入，判断「过/不过」以左图模拟曲线的实测值为准。',
    s5readout: '超调 {po}%（要求 ≤ 10%）{poOk} · 2% 调节时间 {ts}（要求 ≤ 2 s）{tsOk}',
    pass: '✓', fail: '✗', allPass: '两条都满足。注意：这只是众多解之一。',
    quizPrompt: '一个系统超调 30%，你想把它降到 5% 以下，又不想变慢太多。先该动哪个？',
    quizA: '增大 ωn：系统更快，超调自然变小。', quizB: '增大 ζ：超调只由 ζ 决定；再用 ωn 把速度补回来。', quizC: '两个都不用动，加一个滤波器就行。',
    check: '检查判断', correct: '正确：超调公式里只有 ζ。先用 ζ 定形状，再用 ωn 定时间尺度。', wrong: '再看第 2 步右图：拖 ωn 时超调圆点动了吗？',

    s6k: '收束', s6t: '一个形状参数，一个时间参数',
    s6fin: 'ζ 决定曲线的<strong>形状</strong>：冲多远、摆几下。ωn 决定曲线的<strong>时间尺度</strong>：同一形状被压缩或拉长。在复平面上，它们就是极点的夹角和到原点的距离。',
    formula: 'y″ + 2ζωn·y′ + ωn²·y = ωn²·u　　超调 = e^(−ζπ/√(1−ζ²))　　ts ≈ 4/(ζωn)',
    boundary: '模型边界：这里是理想二阶系统——没有零点、没有饱和、没有延迟，用 RK4、步长 0.005 s 数值积分；公式只在 0 < ζ < 1 时成立，调节时间公式是估算。真实闭环（比如加了 PID 的系统）往往不是纯二阶，指标要以实测曲线为准。',
    lk1: '↗ 反馈控制第 3 步：D 项怎样提前刹车、压低超调',
    lk2: '↗ 共振第 1 步：阻尼怎样一点点带走能量',
    lk3: '↗ 拉普拉斯第 4 步：极点位置与稳定性',
    foot: 'visual.integ.life · 阶跃响应 Step Response',
    na: '不适用', notSettled: '本次模拟内未稳定', seconds: ' s',
  },
  en: {
    pageTitle: 'Step Response · Damping Sets the Overshoot, Natural Frequency Sets the Speed',
    back: '← Knowledge index',
    navLabel: 'Step response steps',
    tagline: 'Ask a system with inertia, a restoring spring and damping to jump to a new target, and it cannot teleport: it either shoots past and swings back, or creeps up slowly. Two numbers — the damping ratio ζ and the natural frequency ωn — describe the whole shape.',
    nav0: '0 The step', nav1: '1 Damping ratio ζ', nav2: '2 Overshoot & peak', nav3: '3 Natural frequency ωn', nav4: '4 Poles', nav5: '5 Design challenge', nav6: '6 Wrap-up',

    s0k: 'Step 0 · See it first', s0t: 'The target jumps — how does the output follow?',
    s0e: 'This step asks: when a mass on a spring with damping is told to move to a new position <strong>all at once</strong>, what path does it take? An instant change of target is a <strong>step input</strong>: the target u jumps from 0 to 1 at t = 0 and stays there (orange dashed line). The output y plotted over time is the <strong>step response</strong> (cyan line). Where it finally rests, 1, is the <strong>steady-state value</strong>. Press the button and watch the slider block on top (the output position) move together with the curve below.',
    applyStep: 'Apply the step', replay: 'Replay', pause: 'Pause', resume: 'Resume', scrub: 'Drag to inspect any moment t', s0progress: 'Simulated time t = {t} s / {T} s · output y = {y}',
    s0done: 'Done: the output first reaches {peak} ({po}% above the steady-state value 1), swings a few times, then rests near 1.',
    s0hint: 'Horizontal axis: time in seconds; vertical axis: output y; orange dashed line: the step target. This step fixes ζ = 0.3 and ωn = 2 rad/s; the next steps let you change them. Playback is teaching slow motion: 10 s of model time plays in 4 s; pause at any moment or drag the time slider to inspect each instant.',

    s1k: 'Step 1 · The first knob', s1t: 'Damping ratio ζ: overshoot or creep',
    s1e: 'This step asks: how does the shape change with more or less damping? <strong>Damping</strong> is the force proportional to velocity that drains motion energy (<a class="xlink" href="../../../physics/waves/resonance/#step1">→ Resonance, step 1: how damping removes energy</a>). The <strong>damping ratio ζ</strong> (zeta) turns it into a unitless number: actual damping divided by the damping that just stops the back-and-forth swing. ζ &lt; 1 is <strong>underdamped</strong> (passes the target, swings back); ζ = 1 is <strong>critically damped</strong>; ζ &gt; 1 is <strong>overdamped</strong> (never passes, but slow).',
    zeta: 'Damping ratio ζ', clearTrails: 'Clear old curves',
    s1readout: 'ζ = {z} · {regime} · overshoot {po}% · 2% settling time {ts}',
    regime_under: 'underdamped: passes 1, then swings', regime_critical: 'critically damped: fastest without passing 1 (for fixed ωn)', regime_over: 'overdamped: never passes 1, but slow',
    s1hint: 'What to do: keep ωn = 2 fixed and move only ζ. Each time you let go, the previous curve fades and stays for comparison. Drag from 0.1 to 1, then to 2, and watch the first spike above 1 disappear. Readout terms: overshoot = how far the peak rises above the steady-state value 1, in percent; 2% settling time = time to enter and stay within 1 ± 2% (steps 2 and 3 explain both).',

    s2k: 'Step 2 · Read the first metric', s2t: 'Overshoot depends on ζ alone, not on speed',
    s2e: 'This step asks: what decides how far past the target it goes? <strong>Overshoot</strong> is how far the highest point rises above the steady-state value 1, as a percentage of that value; smaller is calmer. <strong>Peak time tp</strong> is the time from the step to that highest point. For an ideal underdamped second-order system (0 &lt; ζ &lt; 1) the textbook result is <strong>overshoot = e^(−ζπ/√(1−ζ²)) × 100%</strong>, and only ζ appears in it. The right chart plots that formula; the dot is the overshoot measured on the current curve.',
    wn: 'Natural frequency ωn (rad/s)',
    s2readout: 'Overshoot: measured on curve {po}% · formula {poF}%　|　Peak time tp: measured {tp} · formula π/ωd = {tpF}',
    s2hint: 'What to do: first move only ζ and watch the dot travel along the right-hand curve. Then hold ζ and move only ωn — the spike on the left slides sideways, but its height and the dot stay put.',
    poAxis: 'overshoot %', zetaAxis: 'ζ',

    s3k: 'Step 3 · The second knob', s3t: 'Natural frequency ωn: the same shape, squeezed or stretched in time',
    s3e: 'This step asks: how do you make the system faster without changing how far it overshoots? The <strong>natural frequency ωn</strong> is the angular frequency at which the system would swing on its own with no damping (rad/s); a stiffer spring or a lighter mass raises it. The <strong>2% settling time ts</strong> is the time it takes the output to enter the band 1 ± 0.02 and <em>stay</em> there; smaller is faster. With ζ fixed, doubling ωn squeezes the whole curve to half its length in time: the same overshoot (how far the peak rises above the steady-state value), half the peak time and settling time. A common estimate is ts ≈ 4/(ζωn): the time for the envelope e^(−ζωn·t) to shrink to about 2% (e^(−4) ≈ 1.8%).',
    s3readout: 'ωn = {w} rad/s · 2% settling time: measured {ts} · estimate 4/(ζωn) = {tsF} · overshoot {po}%',
    s3hint: 'What to do: keep ζ fixed and drag ωn from 1 to 4; previous curves stay on the chart. The pale green band is 1 ± 2%; each vertical tick marks when that curve enters the band for good. The estimate only tracks how fast the envelope decays (it drops the envelope’s leading factor and ignores exactly when the swing falls inside the band), so the measured time can be shorter or longer; for 0.1 ≤ ζ ≤ 0.95 they differ by at most about ±25%.',

    s4k: 'Step 4 · A different picture', s4t: 'Two knobs are really one point in the complex plane',
    s4e: 'This step asks: can ζ and ωn be drawn on one chart? The system’s <strong>poles</strong> are the two values of s that make s² + 2ζωn·s + ωn² equal zero, plotted in the complex plane (real part across, imaginary part up; <a class="xlink" href="../../../signal/transforms/laplace/#step4">→ Laplace, step 4: a system’s character is written in its pole positions</a>). When underdamped they are the pair −ζωn ± j·ωd, with ωd = ωn√(1−ζ²). How to read them: the <strong>farther from the imaginary axis</strong> (larger ζωn), the faster the swing dies out; the <strong>higher</strong> (larger ωd), the faster it swings; the <strong>angle θ from the negative real axis</strong> satisfies cos θ = ζ, so a smaller angle means less overshoot.',
    s4readout: 'poles = {re} ± {im}j · distance from origin ωn = {w} · cos θ = ζ = {z} · decay rate ζωn = {sig} /s',
    s4readoutReal: 'poles = {p1}, {p2} (both on the real axis: no swing) · ζ = {z}',
    s4hint: 'What to do: move only ζ first — the poles slide along a circle of radius ωn around the origin. Then move only ωn — they slide along a ray through the origin. The dashed lines on the right are the envelope 1 ± e^(−ζωn·t)/√(1−ζ²); the swing always stays inside it.',
    reAxis: 'Re', imAxis: 'Im',

    s5k: 'Step 5 · Put it to work', s5t: 'Design challenge: overshoot ≤ 10%, 2% settling time ≤ 2 s',
    s5e: 'This step asks: given a specification, how do you work back to ζ and ωn? The requirement: <strong>overshoot</strong> (how far the peak rises above the steady-state value, in percent) at most 10%, and <strong>2% settling time</strong> (time to enter and stay within 1 ± 2%) at most 2 s. The dashed lines on the left are the two limits; the right chart is the complex plane, where the green region holds the pole positions that meet both <em>according to the formulas</em>: angle θ ≤ 53.8° (ζ ≥ 0.59, the ζ for 10% overshoot) and at least 2 away from the imaginary axis (ζωn ≥ 2, so 4/(ζωn) ≤ 2 s). Estimate and measurement differ slightly, so pass/fail is judged from the values measured on the simulated curve.',
    s5readout: 'overshoot {po}% (need ≤ 10%) {poOk} · 2% settling time {ts} (need ≤ 2 s) {tsOk}',
    pass: '✓', fail: '✗', allPass: 'Both met. This is one solution among many.',
    quizPrompt: 'A system overshoots by 30%. You want it under 5% without slowing it down much. What do you change first?',
    quizA: 'Raise ωn: a faster system overshoots less.', quizB: 'Raise ζ: overshoot depends on ζ alone; then use ωn to win back the speed.', quizC: 'Neither — just add a filter.',
    check: 'Check', correct: 'Right: only ζ appears in the overshoot formula. Set the shape with ζ, then the time scale with ωn.', wrong: 'Look at the right chart in step 2 again: did the overshoot dot move when you dragged ωn?',

    s6k: 'Wrap-up', s6t: 'One shape parameter, one time parameter',
    s6fin: 'ζ sets the <strong>shape</strong> of the curve: how far it overshoots and how many times it swings. ωn sets the <strong>time scale</strong>: the same shape, squeezed or stretched. In the complex plane they are the pole angle and its distance from the origin.',
    formula: 'y″ + 2ζωn·y′ + ωn²·y = ωn²·u　　overshoot = e^(−ζπ/√(1−ζ²))　　ts ≈ 4/(ζωn)',
    boundary: 'Model limits: this is an ideal second-order system — no zeros, no saturation, no delay — integrated with RK4 at a 0.005 s step. The formulas hold only for 0 < ζ < 1, and the settling-time formula is an estimate. Real closed loops (for example a plant under PID control) are often not purely second-order, so trust the measured curve over the formula.',
    lk1: '↗ Feedback control, step 3: how the D term brakes early and cuts overshoot',
    lk2: '↗ Resonance, step 1: how damping removes energy',
    lk3: '↗ Laplace, step 4: pole positions and stability',
    foot: 'visual.integ.life · Step Response',
    na: 'n/a', notSettled: 'not settled within this run', seconds: ' s',
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
  if (typeof window.refreshStepResponse === 'function') window.refreshStepResponse();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.STEP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
