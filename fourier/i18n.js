'use strict';
/* ============================================================
 * 傅里叶页字符串字典 + 语言管理（知识站统一双语规范 UI-I18N-SPEC.md）
 * - localStorage 键 knowledge-lang（zh/en），全站共享；读写 try/catch，失败退化为内存变量
 * - 默认：已存值优先，否则按 navigator.language（zh 开头 → zh，否则 en）
 * - 静态文本用 data-i18n（textContent）/ data-i18n-html（innerHTML）/ data-i18n-attr 标注
 * - JS 动态文本与 Canvas 文字一律经 t(key[, vars]) 取值，{name} 占位
 * ============================================================ */
const STR = {
  zh: {
    docTitle: '傅里叶变换 · 一步一交互',
    backToIndex: '← 知识索引',
    docH1: '傅里叶变换',
    tagline: '任何波形、任何图形，都能拆成一堆旋转的圆——这页带你从一条正弦波开始，一步步亲手把它拼出来。',
    navAria: '步骤导航',
    nav0: '0 钩子', nav1: '1 波是什么', nav2: '2 波叠加', nav3: '3 旋转的圆',
    nav4: '4 圆圈套圆圈', nav5: '5 频谱视角', nav6: '6 画你想画的',

    s0kicker: '第 0 步 · 先看结论',
    s0title: '一串旋转的圆，画出一个小人',
    s0explain: '先别管原理，看画面上方和左方那两串转动的圆：上面一串管<strong>横坐标</strong>，左边一串管<strong>纵坐标</strong>，两条投影虚线的交点，就是正在描出小人轮廓的笔尖。这就是傅里叶变换最震撼的一面——<strong>任何图形，都能拆成一堆旋转的圆</strong>。本页会从一条正弦波开始，一步步讲清它为什么成立；最后一步，你还能<strong>亲手画一个图形</strong>，让圆圈们把它画出来。',
    labelN: '谐波项数 N',
    readoutError: '重构误差',
    s0hint: '先别动手，看 N 自己从 1 慢慢涨到 40：圆越多，误差越小、小人越像；想自己控制就拖滑杆（自动播放会停）。数学上这一幕写出来就是：f(t) = Σ (a<sub>k</sub> cos kt + b<sub>k</sub> sin kt)——横、竖坐标各有一套这样的和，每一项对应一个圆。',
    s0start: '开始探索 ↓',

    s1kicker: '第 1 步 · 波是什么',
    s1title: '一条正弦波，只有三个旋钮',
    s1explain: '最简单的波是正弦波。它完全由三个参数决定：<strong>频率</strong>决定它抖得多快，<strong>振幅</strong>决定它摆多高，<strong>相位</strong>决定它从哪里开始。拖动滑杆试试——顺便点「听一听」，频率变高，声音真的会变尖。',
    labelFreq: '频率', labelAmp: '振幅', labelPhase: '相位',
    s1sound: '🔊 听一听这个波', s1soundStop: '⏹ 停止声音',
    s1freeze: '❄ 冻结波形', s1unfreeze: '▶ 继续滚动',
    s1hint: '小知识：声音就是空气的波。频率 1 Hz 在这里是为了看清波形；真实音调要快几百倍，所以播放时会把频率放大到可听范围。想看清「相位」是什么：先点「冻结波形」让波停下，再拖相位滑杆——整条波会整体左右平移，t = 0 参考线处的橙点高度正好等于 sin（相位）。',

    s2kicker: '第 2 步 · 波可以叠加',
    s2title: '复杂波形 = 简单波形相加',
    s2explain: '把几条正弦波在每个时刻的高度直接相加，就得到一条新波形。下面三条彩色波各自可调，最下方白色粗线是它们的和。大图里分量与总和用的是<strong>同一把尺子</strong>：任选一个位置量一量，总和的高度恰好等于三条分量高度之和（为了让总和不画出画布，整张图会一起等比缩放，但比例从不撒谎）。试试点「方波配方」：只用 1、3、5 倍频率、振幅按 1、1/3、1/5 递减，方波的雏形就出现了。',
    s2presetSquare: '方波配方（1 + 3 + 5）', s2presetRandom: '随机一组',
    s2hint: '反过来想：如果任何复杂波形都能这样「加」出来，那它是不是也能被「拆」回这几条正弦波？这正是傅里叶变换在做的事。',

    s3kicker: '第 3 步 · 关键一跳',
    s3title: '正弦波，是圆在墙上的影子',
    s3explain: '一个点绕着圆匀速旋转。盯着它在<strong>竖直方向</strong>上的高度看（虚线是它的投影）：把每个时刻的高度连起来，正好就是一条正弦波。<strong>圆转一圈 = 波的一个周期；转速 = 频率；半径 = 振幅；起始角度 = 相位。</strong>第 1 步的三个旋钮，在这里全变成了圆的属性。记住这个画面，后面全靠它。',
    s3angle: '角度', s3radProj: 'rad，投影高度',
    s3speed: '转速', s3radius: '半径（振幅）',
    s3pause: '⏸ 暂停', s3resume: '▶ 继续',
    s3circleLabel: '圆：匀速旋转', s3waveLabel: '波：投影高度随时间展开 →',

    s4kicker: '第 4 步 · 圆圈套圆圈',
    s4title: '一串圆，接力画出方波',
    s4explain: '把第 3 步的圆首尾相连：第二个圆骑在第一个圆的笔尖上，以 3 倍速旋转；第三个 5 倍速……每个圆贡献一条正弦波（回扣第 2 步），最后一个笔尖的高度轨迹，就是所有波的和。拖动滑杆增加圆的个数，看方波如何成形。',
    s4labelN: '圆的个数 N', s4overLabel: '当前过冲：',
    s4overText: '约 {v}%（按跳变高度计，N 越大越接近 8.9%）',
    s4hint: '注意方波拐角处那个小小的「尖」：无论加多少个圆，它都不会消失，只会变得更窄。这叫<strong>吉布斯现象</strong>：过冲约为跳变高度的 <strong>9%</strong>（从 −1 跳到 +1，跳变是 2，尖会冲到约 1.18）。这是数学写死的常数，不是画得不够精细。',
    s4chainLabel: '圆链：首尾相连的圆', s4waveLabel: '波形：笔尖高度随时间展开 →',

    s5kicker: '第 5 步 · 傅里叶变换本体',
    s5title: '换个视角：从波形到频谱',
    s5explain: '前四步我们都在「拼」。傅里叶变换做的是反向的「拆」：给它任意波形，它告诉你里面每个频率的正弦波各有多强。左边是波形（<strong>时域</strong>），右边是拆解结果（<strong>频域</strong>，叫频谱）。切换波形看一看：方波只含奇数频率，三角波的频谱衰减快得多，锯齿波则每个频率都有份。',
    s5chooseAria: '选择波形',
    s5square: '方波', s5triangle: '三角波', s5saw: '锯齿波', s5ecg: '模拟心电图',
    s5timeTitle: '时域：波形 x(t)', s5specTitle: '频域：频谱（每个频率多强）',
    s5hint: '注：右边柱高按当前波形<strong>自身最强的成分归一化</strong>（最强的那根顶格），看的是成分之间的比例；切换波形时纵轴尺度会跟着变，想比绝对强弱请看下方读数里的幅值。另外「模拟心电图」是教学合成的近似波形，不是真实心电数据；它这种脉冲型波形的能量摊在很多频率上、没有单一主导成分，所以下方读数里每个幅值都偏小、最强的也不在基频处——这正是脉冲型波形的特征，不是算错了。',
    s5topPrefix: '最强的三个成分：', s5topJoiner: '、', s5topItem: '频率 {k}（幅值 {m}）',
    s5formulaText: '别怕，这个公式只是在说一句话：<strong>拿一台转速为 f 的「圆」去和波形逐点相乘再加总</strong>，测出波形里频率 f 的成分有多强、相位差多少。其中的 e<sup>−2πift</sup> 不是别的——它就是第 3 步那个在单位圆上旋转的点（数学家把「旋转」写成了指数的形式）。对每个 f 都测一遍，就得到整条频谱。再补一句桥：本页演示的都是<strong>周期波形</strong>，周期信号只在基频的整数倍上才有成分，所以频谱是一根根分立的柱子——这正是上面公式在周期信号上的样子（数学上叫傅里叶级数）；换成非周期的信号，柱子会密到连成一条连续的曲线。',
    s5axisNote: '频率 →（横轴数字 = 基频的倍数）',

    s6kicker: '第 6 步 · 终章',
    s6title: '现在，画你想画的',
    s6explain: '在下面画布里用鼠标或手指<strong>画一条闭合曲线</strong>（比如一颗心、一个星星、你的名字首字母），或者点一个预设图形。页面会把轮廓点的<strong>横坐标和纵坐标分开</strong>，各做一次真正的离散傅里叶变换（DFT）：上方一串圆负责横坐标，左方一串圆负责纵坐标，两条投影虚线的交点就是笔尖。拖动 N 看误差读数不断下降——<strong>傅里叶变换，就是把一条曲线拆成横竖两个方向上的旋转之和。</strong>',
    s6hint: 'error 口径：重构点与原轮廓点之间的均方根误差 ÷ 图形尺寸 × 100%。N 越大误差越小，但高频圆的半径衰减很快，所以后面加的圆收益越来越小。',
    s6clear: '清除重画', s6heart: '预设：爱心', s6star: '预设：星星', s6person: '预设：卡通小人',
    s6statusHeart: '当前是预设图形「爱心」。拖动 N 看误差变化，或动手画一个！',
    s6statusStar: '当前是预设图形「星星」。尖角处需要更多高频圆才画得锐利。',
    s6statusPerson: '当前是预设图形「卡通小人」，和第 0 步开场是同一个。',
    s6statusCleared: '已清除。在画布上画一条闭合曲线试试！',
    s6statusDrew: '这是你画的图形！拖动 N，看圆圈们越画越像。',

    dcDrawHint: '松手后，圆圈们会把你画的图形重新画出来…',
    dcEmpty1: '在画布上按住鼠标（或手指）画一条闭合曲线',
    dcEmpty2: '或者点一个预设图形',
    dcXLabel: 'x 链（横坐标）', dcYLabel: 'y 链（纵坐标）',

    finaleText: '你手机里的音频均衡器、JPEG 图片压缩、耳机降噪、医院里的核磁共振成像——背后都是同一个思想：<strong>把复杂信号拆成简单的波，处理完再拼回去</strong>。从一条正弦波，到一串能画出任何图形的圆，这就是傅里叶变换。',
    footText: '傅里叶变换交互讲解 · 一步一交互，从正弦波到任意图形。'
  },
  en: {
    docTitle: 'The Fourier Transform · One Interaction at a Time',
    backToIndex: '← Knowledge Index',
    docH1: 'The Fourier Transform',
    tagline: 'Any waveform, any drawing, can be broken down into a sum of rotating circles. Starting from a single sine wave, this page lets you build that idea up yourself, one step at a time.',
    navAria: 'Step navigation',
    nav0: '0 The Hook', nav1: '1 What Is a Wave?', nav2: '2 Adding Waves', nav3: '3 The Rotating Circle',
    nav4: '4 Circles on Circles', nav5: '5 The Spectrum', nav6: '6 Draw Your Own',

    s0kicker: 'Step 0 · The Punchline First',
    s0title: 'A Chain of Rotating Circles Draws a Little Figure',
    s0explain: 'Skip the theory for a moment and just watch. Two chains of circles are turning — one along the top of the frame, one down the left side. The top chain controls the <strong>horizontal (x) coordinate</strong>, the left chain the <strong>vertical (y) coordinate</strong>, and where the two dashed projection lines cross is the pen tip, tracing the outline of a little figure. This is the Fourier transform at its most striking: <strong>any shape at all can be taken apart into a set of rotating circles</strong>. This page starts from a single sine wave and builds up exactly why that is true — and in the final step you can <strong>draw a shape of your own</strong> and let the circles draw it back.',
    labelN: 'Number of harmonics N',
    readoutError: 'reconstruction error',
    s0hint: 'Hands off for a moment: watch N climb on its own from 1 to 40 — the more circles, the smaller the error, the closer the likeness. Drag the slider whenever you want to take over (auto-play then stops). Written in mathematics, this scene is f(t) = Σ (a<sub>k</sub> cos kt + b<sub>k</sub> sin kt) — one such sum for the x coordinate and one for the y, each term corresponding to one circle.',
    s0start: 'Start exploring ↓',

    s1kicker: 'Step 1 · What Is a Wave?',
    s1title: 'A Sine Wave Has Just Three Knobs',
    s1explain: 'The simplest wave of all is the sine wave, and it is completely described by three numbers: <strong>frequency</strong> sets how fast it oscillates, <strong>amplitude</strong> how high it swings, and <strong>phase</strong> where it starts. Drag the sliders and see — then press “Listen”: as the frequency rises, the pitch really does rise with it.',
    labelFreq: 'Frequency', labelAmp: 'Amplitude', labelPhase: 'Phase',
    s1sound: '🔊 Listen to this wave', s1soundStop: '⏹ Stop the sound',
    s1freeze: '❄ Freeze the wave', s1unfreeze: '▶ Resume scrolling',
    s1hint: 'Fun fact: sound is a wave in air. The 1 Hz on screen is slowed right down so you can see the shape; real tones oscillate hundreds of times per second, so playback scales the frequency up into the audible range. To really see what phase is, press “Freeze the wave” first, then drag the phase slider: the whole wave slides left and right, and the orange dot on the t = 0 reference line sits at exactly sin(phase).',

    s2kicker: 'Step 2 · Waves Add Up',
    s2title: 'Complex Waveform = Simple Waves Added Together',
    s2explain: 'Stack a few sine waves — at each instant, simply add their heights — and a brand-new waveform appears. The three coloured waves below can each be tuned; the thick white curve is their sum. In the main plot, the components and the sum are drawn with <strong>one and the same ruler</strong>: pick any point and measure — the height of the sum is exactly the three component heights added together. (To keep the sum inside the frame the whole plot scales up or down, but the proportions never lie.) Try the “square-wave recipe”: use only the 1st, 3rd and 5th multiples of the base frequency, with amplitudes falling as 1, 1/3, 1/5 — and the outline of a square wave is already there.',
    s2presetSquare: 'Square-wave recipe (1 + 3 + 5)', s2presetRandom: 'Random set',
    s2hint: 'Now turn it around: if any complex waveform can be <em>built</em> by adding sine waves, can it also be <em>taken apart</em> back into them? That is exactly what the Fourier transform does.',

    s3kicker: 'Step 3 · The Key Leap',
    s3title: 'A Sine Wave Is a Circle’s Shadow on the Wall',
    s3explain: 'A point travels around a circle at a steady speed. Now watch only its height in the <strong>vertical</strong> direction (the dashed line is its projection): join up that height at every instant and you get, exactly, a sine wave. <strong>One full turn = one cycle of the wave; turning speed = frequency; radius = amplitude; starting angle = phase.</strong> The three knobs from Step 1 have all become properties of a circle. Keep this picture in mind — everything from here on is built on it.',
    s3angle: 'Angle', s3radProj: 'rad, projected height',
    s3speed: 'Spin speed', s3radius: 'Radius (amplitude)',
    s3pause: '⏸ Pause', s3resume: '▶ Resume',
    s3circleLabel: 'Circle: turning at a steady speed', s3waveLabel: 'Wave: projected height, unrolled over time →',

    s4kicker: 'Step 4 · Circles on Circles',
    s4title: 'A Relay of Circles Draws a Square Wave',
    s4explain: 'Now chain the circle from Step 3 to itself: a second circle rides on the tip of the first and turns three times as fast; a third turns five times as fast… Each circle contributes one sine wave (remember Step 2), and the height traced by the final tip is the sum of them all. Drag the slider to add more circles and watch the square wave take shape.',
    s4labelN: 'Number of circles N', s4overLabel: 'Current overshoot: ',
    s4overText: 'approx. {v}% (of the jump height; the larger N, the closer to 8.9%)',
    s4hint: 'Look at the little spike at each corner of the square wave: add as many circles as you like and it never disappears — it only gets narrower. This is the <strong>Gibbs phenomenon</strong>: the overshoot is about <strong>9%</strong> of the jump height (the jump from −1 to +1 is 2, and the spike reaches about 1.18). It is a constant built into the mathematics, not a limit of drawing precision.',
    s4chainLabel: 'Circle chain: circles linked tip to tail', s4waveLabel: 'Waveform: pen-tip height, unrolled over time →',

    s5kicker: 'Step 5 · The Transform Itself',
    s5title: 'A Change of Viewpoint: From Waveform to Spectrum',
    s5explain: 'For four steps we have been <em>building up</em>. The Fourier transform does the reverse — it <em>takes apart</em>: hand it any waveform and it tells you how strong the sine wave at each frequency is inside it. On the left is the waveform (the <strong>time domain</strong>); on the right is the result of the taking-apart (the <strong>frequency domain</strong>, known as the spectrum). Switch between the waveforms and compare: the square wave contains only odd-numbered frequencies, the triangle wave’s spectrum falls off far faster, and the sawtooth has a share of every frequency.',
    s5chooseAria: 'Choose a waveform',
    s5square: 'Square wave', s5triangle: 'Triangle wave', s5saw: 'Sawtooth', s5ecg: 'Simulated ECG',
    s5timeTitle: 'Time domain: waveform x(t)', s5specTitle: 'Frequency domain: spectrum (strength of each frequency)',
    s5hint: 'Note: the bar heights on the right are <strong>normalised to the strongest component of the current waveform</strong> (the strongest bar reaches the top), so read them as proportions between components; the vertical scale changes when you switch waveforms — for absolute strengths, see the amplitudes in the readout below. The “simulated ECG” is a synthetic waveform drawn for teaching, not real cardiac data. Being pulse-like, it spreads its energy over many frequencies with no single dominant component, so every amplitude in its readout is small and the strongest is not at the fundamental frequency — that is a property of pulse-like waveforms, not a miscalculation.',
    s5topPrefix: 'Strongest three components: ', s5topJoiner: ', ', s5topItem: 'frequency {k} (amplitude {m})',
    s5formulaText: 'Don’t let it scare you — the formula says just one thing: <strong>take a circle spinning at rate f, multiply it against the waveform point by point, and add it all up</strong>, and you measure how much of frequency f the waveform contains, and with what phase. The e<sup>−2πift</sup> term is nothing mysterious — it is the point travelling around the unit circle from Step 3 (mathematicians write rotation in exponential form). Measure every f, and you have the whole spectrum. One bridging remark: everything demonstrated on this page is a <strong>periodic</strong> waveform. A periodic signal has components only at integer multiples of its fundamental frequency, so its spectrum is a row of separate bars — and that is exactly what the formula above becomes for periodic signals (mathematicians call it a Fourier series). For a non-periodic signal, the bars would pack together into a continuous curve.',
    s5axisNote: 'frequency → (numbers on the axis = multiples of the fundamental)',

    s6kicker: 'Step 6 · Finale',
    s6title: 'Now Draw Anything You Like',
    s6explain: 'In the canvas below, use your mouse or finger to <strong>draw a closed curve</strong> (a heart, a star, the first letter of your name), or pick a preset shape. The page takes the points of the outline, splits them into their <strong>x and y coordinates</strong>, and runs a genuine discrete Fourier transform (DFT) on each: the chain of circles across the top handles the x coordinate, the chain down the left handles the y coordinate, and where the two dashed projection lines cross is the pen tip. Drag N and watch the error readout keep falling — <strong>that is the Fourier transform: a curve, taken apart into a sum of rotations along two directions.</strong>',
    s6hint: 'How the error is measured: the root-mean-square distance between the reconstructed points and the original outline points, divided by the size of the shape, × 100%. A larger N gives a smaller error, but the radii of high-frequency circles decay quickly, so each extra circle buys less than the one before.',
    s6clear: 'Clear & redraw', s6heart: 'Preset: Heart', s6star: 'Preset: Star', s6person: 'Preset: Cartoon figure',
    s6statusHeart: 'Current preset: “Heart”. Drag N to watch the error change, or draw one of your own!',
    s6statusStar: 'Current preset: “Star”. Sharp corners need more high-frequency circles to come out crisp.',
    s6statusPerson: 'Current preset: “Cartoon figure” — the same one from the opening of Step 0.',
    s6statusCleared: 'Cleared. Try drawing a closed curve on the canvas!',
    s6statusDrew: 'That is your drawing! Drag N and watch the circles trace it more and more faithfully.',

    dcDrawHint: 'Release, and the circles will redraw your shape…',
    dcEmpty1: 'Press and draw a closed curve with your mouse (or finger)',
    dcEmpty2: 'or pick a preset shape',
    dcXLabel: 'x chain (horizontal)', dcYLabel: 'y chain (vertical)',

    finaleText: 'The audio equaliser in your phone, JPEG photo compression, noise-cancelling headphones, MRI imaging in hospitals — behind all of them is the same idea: <strong>break a complex signal into simple waves, work on the pieces, then put them back together</strong>. From a single sine wave to a chain of circles that can draw anything — that is the Fourier transform.',
    footText: 'The Fourier transform, interactively · one interaction per step, from a sine wave to any shape.'
  }
};

/* ---------- 语言状态（全站共享 knowledge-lang） ---------- */
let __langMem = null; // localStorage 不可用时的内存退化
function __readStoredLang() {
  try {
    const v = localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 忽略：退化到内存/默认 */ }
  return __langMem;
}
function __defaultLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.indexOf('zh') === 0 ? 'zh' : 'en';
}
let __lang = __readStoredLang() || __defaultLang();

function t(key, vars) {
  let s = (STR[__lang] && STR[__lang][key] != null) ? STR[__lang][key]
        : (STR.zh && STR.zh[key] != null) ? STR.zh[key] : key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}

function applyLang() {
  document.documentElement.lang = __lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
      const i = pair.indexOf(':');
      if (i > 0) el.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
    });
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === __lang);
  });
  if (typeof window.__onLangChange === 'function') {
    try { window.__onLangChange(__lang); } catch (e) { console.error(e); }
  }
}

function setLang(l) {
  if (l !== 'zh' && l !== 'en') return;
  __lang = l; __langMem = l;
  try { localStorage.setItem('knowledge-lang', l); } catch (e) { /* 内存退化 */ }
  applyLang();
}

window.KI18N = {
  t,
  getLang: () => __lang,
  setLang,
  applyLang
};

/* 切换控件接线 + 首次填充（先定语言再渲染，避免错语言闪烁） */
(function initI18n() {
  const wire = () => {
    document.querySelectorAll('#langToggle button').forEach(b => {
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
    applyLang();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
