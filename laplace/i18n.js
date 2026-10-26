'use strict';
/* ============================================================
   拉普拉斯与 ROC 讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '拉普拉斯与 ROC · 给频率配一个寿命 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '拉普拉斯与 ROC',
    tagline: '傅里叶变换只听「永远在响的音」：它默认每个频率都会一直唱下去。可真实信号会衰减、会爆炸。拉普拉斯多问了一句：这个音是在变弱，还是在变强？就这一句，变换从一条曲线变成 s 平面上的一整张地形图——极点、收敛域、稳定性，全成了位置问题。',
    nav0: '0 会死的波', nav1: '1 s 平面', nav2: '2 切片', nav3: '3 同式异域',
    nav4: '4 拖极点', nav5: '5 判读台', nav6: '6 终章 · 全家福',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 拉普拉斯变换 Laplace Transform —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '先问一句：它还活着吗？',
    s0e: '这条波是 e<sup>σt</sup>·cos(ωt)：一首边唱边变音量的歌。σ 是它的「寿命参数」：σ < 0，声音越唱越弱，最后衰死；σ = 0，不强不弱永远唱下去——<strong>这正是傅里叶变换的世界</strong>，它只处理这种「永远在响」的音；σ > 0，声音越唱越响，涨爆出框。真实世界里，衰死和涨爆才是常态。傅里叶管不了它们，拉普拉斯就是来管这个的：<strong>给每个频率 ω，再配一个 σ</strong>。',
    s0sig: 'σ · 衰减（−）/ 增长（+）',
    s0om: 'ω · 频率',
    s0ro: 'σ = <span>{sig}</span> · ω = <span>{om}</span> · 当前状态：<b>{verdict}</b> · 包络 e<sup>σt</sup> 在 t = 6 处 = {env}',
    s0vDecay: '衰减中——唱着唱着就没了',
    s0vEqual: '等幅振荡——傅里叶的理想国',
    s0vGrow: '增长中——会涨爆画框（已钳制显示）',
    s0hint: '把 σ 精确推到 0 停一秒：这条「不死」的波，就是<a class="fourier-link" href="../fourier/#step0">傅里叶页</a>里那些旋转圆画出来的东西。所有真实信号都会死，傅里叶却假设它们不死——它靠的是周期延拓的想象。拉普拉斯不装：它把 σ 写进变换里。下一站你会看到，平面就此多出一整个维度。',
    cvEnv: '包络 ±e^{σt}',
    cvWave: 'e^{σt}·cos(ωt)',

    s1k: '第 1 步 · s 平面',
    s1t: '一张地形图：每个频率都有了寿命坐标',
    s1e: '信号就用最经典的一个：x(t) = e<sup>−at</sup>·u(t)（t < 0 时为 0，t ≥ 0 后指数衰减）。它的拉普拉斯变换是 X(s) = 1/(s + a)，其中 s = σ + jω。先把两根轴认清：<strong>横轴 σ 管寿命</strong>（越往左衰减越快，越往右越容易涨爆），<strong>纵轴 ω 管频率</strong>。固定 a，在整个 s 平面上把 |X(s)| 画成地形：<strong>颜色越亮、地形越高</strong>。有一根尖峰冲破天际——那是<strong>极点</strong>，立在 s = −a 处：分母在那里等于 0，变换在那里发散。拖动探针到处量：X(s) 的值由公式逐点算出，不是看图估的（渲染分辨率只是画布的事，见图下注）。还有个小秘密：这个信号的 |X(s)| 恰等于<strong>到极点距离的倒数</strong>——离尖峰越远，地形越平。',
    s1aLab: 'a（极点在 s = −a，拖动看尖峰搬家）',
    s1formula: 'X(s) = 1 / (s + a)，s = σ + jω，x(t) = e^{−at}·u(t)',
    s1ro: 'a = {a} · 极点在 s = <span>{pole}</span> · 探针 s = <span>{s}</span> · X(s) = <span>{re}</span> {imSign} j·<span>{im}</span> · |X(s)| = <span>{mod}</span> · 到极点距离 = {dist}（1/距离 = {inv}）',
    s1note: '渲染口径：地形在离屏低分辨率网格上逐点按闭式 log<sub>10</sub>(1+|X(s)|) 计算、经 γ = 0.6 幂次提亮（单调映射，只变颜色、不变数值）后放大显示，色标上限钳制在 |X| = 99——极点处的真实值是 ∞，画面上「封顶」只是显示钳制。远处颜色深也不等于值是 0，只是被对数压低了。探针读数与对账一律走闭式原式，不用渲染网格插值。',
    s1hint: '对比一下傅里叶页：那里每个信号只有一条频谱曲线。这里不是一条线，是<strong>一整张图</strong>：横轴 σ 管寿命、纵轴 ω 管频率。第 2 步你会亲手在这张图上切一刀，看傅里叶是怎么从图里掉出来的。',
    cvPole: '极点',
    cvProbe: '探针',
    cvLog: '色标：log₁₀(1+|X(s)|)，γ = 0.6 提亮显示，0 → 2 封顶（极点处真实值 ∞）',

    s2k: '第 2 步 · 切片',
    s2t: '傅里叶，是 σ = 0 处的那一刀',
    s2e: '在第 1 步的地形图上竖着切一刀：固定 σ = σ<sub>0</sub>，沿 ω 方向取一列值，就是右侧的曲线 |X(σ<sub>0</sub> + jω)|。把这一刀拖到 σ<sub>0</sub> = 0——切面正好贴着虚轴，这条曲线有个你认识的名字：<strong>傅里叶幅度谱</strong> 1/√(a² + ω²)，分毫不差。但小心：这一刀必须切在<strong>收敛域</strong>（σ > −a 的那半边）里。把 a 拖成负数，极点跑到右半平面，σ = 0 这一刀就掉出了收敛域——傅里叶谱<strong>不存在</strong>，页面不会给你画一条假的；而 σ<sub>0</sub> 再往右挪一点、回到收敛域里，拉普拉斯的切片照样好好的。',
    s2aLab: 'a（极点在 s = −a）',
    s2sLab: 'σ₀ · 切片位置',
    s2btn0: '切到 σ₀ = 0（傅里叶那一刀）',
    s2roIn: 'a = {a} · σ₀ = <span>{s0}</span> · 此切片在收敛域内（σ₀ > {bd}）✓ · |X(σ₀ + j0)| = <span>{peak}</span>{fNote}',
    s2roOut: 'a = {a} · σ₀ = <span>{s0}</span> · 此切片 <b>不在收敛域内</b>（需要 σ₀ > {bd}）：积分发散，这条谱线不存在——不是没画出来，是它真的没有',
    s2fNote: ' · 这正是傅里叶幅度谱 1/√(a²+ω²)，已与闭式逐点叠合',
    s2hint: '这就是「有些信号没有傅里叶变换、却有拉普拉斯变换」的全部原因：傅里叶只允许站在 σ = 0 这一条线上看世界，线掉出收敛域，它就瞎了；拉普拉斯站满整个平面，总有一片区域能看。采样页里那句「恰好 2f 看相位」是采样版的边界故事，这里是变换版的。',
    cvRocIn: '收敛域 σ > −a',
    cvSlice: '切片 σ₀',
    cvMag: '|X(σ₀+jω)|',
    cvOut: '✗ 不在收敛域内：谱线不存在',
    cvClip2: '峰值 {peak}，顶部已截断（读数为真值）',

    s3k: '第 3 步 · 同式异域',
    s3t: '同一个式子，两个信号',
    s3e: '全页最重要的一场戏。信号 A：e<sup>−at</sup>·u(t)，活在 t ≥ 0；信号 B：−e<sup>−at</sup>·u(−t)，活在 t ≤ 0，符号还反着。算它们的拉普拉斯变换——<strong>代数式一字不差，都是 1/(s + a)</strong>。区别只在收敛域：A 要求 σ > −a，B 要求 σ < −a。切换信号看阴影翻面，再把探针拖到任意一点：同一个 s，对 A 收敛、对 B 可能发散。结论先说死：<strong>只写变换式、不写 ROC，等于没说完</strong>——没有 ROC，你根本不知道说的是哪个信号。',
    s3btnA: '信号 A · 右边 e^{−at}·u(t)',
    s3btnB: '信号 B · 左边 −e^{−at}·u(−t)',
    s3curA: '信号 A（右边）',
    s3curB: '信号 B（左边）',
    s3aLab: 'a（两信号共用，极点同在 s = −a）',
    s3formula: '两个信号的 X(s) 都是 1 / (s + a) —— 式子相同，ROC 不同',
    s3ro: '当前信号：<b>{cur}</b> · 探针 σ = <span>{sig}</span>（ω = {om}）· 对信号 A（需 σ > {bd}）：<b>{va}</b> · 对信号 B（需 σ < {bd}）：<b>{vb}</b>',
    s3conv: '收敛 ✓',
    s3div: '发散 ✗',
    s3hint: '为什么收敛只看 σ、不看 ω？因为 |e<sup>−st</sup>| = e<sup>−σt</sup>：积分收不收敛，只取决于实部 σ 把指数压不压得住，虚部 ω 只是让它在那儿转圈，不帮忙也不捣乱。所以 ROC 永远是竖条带——这也是探针判定只报 σ 的原因。考试里 ROC 画成别的形状，多半画错了。',
    cvRoc: 'ROC（收敛）',
    cvTimeA: 'x(t)：t ≥ 0 才有',
    cvTimeB: 'x(t)：t ≤ 0 才有',

    s4k: '第 4 步 · 拖极点',
    s4t: '系统的性格，写在极点的位置里',
    s4e: '换上二阶系统 H(s) = 1/(s² + 2ζω<sub>0</sub>s + ω<sub>0</sub>²)。它的一对极点可以在 s 平面上拖：拖在实轴上方是一对共轭极点（系统会「嗡嗡」振荡着衰减）；拖回实轴上，极点变成实数——可以落在同一点（临界），也可以<strong>掰开成两个</strong>各走各的（过阻尼）。右边实时重画冲激响应 h(t)（闭式解，不是数值仿真）与它的 ±包络线：<strong>极点实部 σ<sub>p</sub> 就是衰减率</strong>——极点离虚轴越远，包络 e<sup>σ<sub>p</sub>t</sup> 压得越狠。拖到右半平面试试：包络反过来往上张，响应涨爆画框。',
    s4p1: '稳定衰减振荡', s4p2: '临界阻尼', s4p3: '过阻尼', s4p4: '等幅振荡', s4p5: '发散爆炸',
    s4tLab: '包络探针时刻 t',
    s4ro: '极点：<span>{poles}</span> · ζ = <span>{zeta}</span> · ω₀ = <span>{w0}</span> · 状态：<b>{verdict}</b> · t = {te} 处包络 ±E = <span>{env}</span>（E 的定义见图下注）',
    s4vStable: '稳定——响应衰减归零',
    s4vMarginal: '自由响应有界但不衰减归零（可等幅振荡或趋于非零常数）；此因果传递函数不是 BIBO 输入输出稳定',
    s4vUnstable: '不稳定——响应涨爆（画框已钳制）',
    s4note: '口径：欠阻尼时 h(t) = e<sup>σ<sub>p</sub>t</sup>·sin(ω<sub>d</sub>t)/ω<sub>d</sub>，包络 E(t) = e<sup>σ<sub>p</sub>t</sup>/ω<sub>d</sub>；临界时 h(t) = t·e<sup>pt</sup>，曲线自身即包络；过阻尼两实极点 p<sub>1</sub>、p<sub>2</sub> 时 h(t) = (e<sup>p<sub>1</sub>t</sup> − e<sup>p<sub>2</sub>t</sup>)/(p<sub>1</sub> − p<sub>2</sub>)，包络取两分量绝对值之和 (e<sup>p<sub>1</sub>t</sup> + e<sup>p<sub>2</sub>t</sup>)/|p<sub>1</sub> − p<sub>2</sub>|。全部闭式，评审可逐点复算。',
    s4dash: '再说一句读数里的「—」：两个实极点<strong>异号</strong>（一正一负）时，ω<sub>0</sub> = √(p<sub>1</sub>p<sub>2</sub>) 是虚数、ζ 也就没有定义——这一格如实给「—」，不是没算出来；一极点恰在原点时 ω<sub>0</sub> = 0，同样无定义。遇到「—」就直接看极点坐标与状态判读：只要有极点落在右半平面，系统就是不稳定的。',
    s4linkTxt: '控制页里 PID 拼命在做的事，就是把闭环极点往左半平面摁：摁得越深，车站得越稳、回正越快——去那页亲手摁一摁 →',
    s4lkC: '反馈与控制 →',
    s4hint: '手感练习：先把极点拖到贴近虚轴（σ<sub>p</sub> ≈ −0.1），看它把尾音拖得老长；再一口气拖到 σ<sub>p</sub> = −2.5，尾音立刻被掐断。ζ 越小振荡越「飘」，ζ ≥ 1 就完全振不起来了——预置五档挨个点一遍，比背定义快。',
    cvEnv: '±包络 E(t)',
    cvImp: '冲激响应 h(t)',
    cvDrag: '拖我',

    s5k: '第 5 步 · 判读台',
    s5t: '给一条 ROC，断因果与生死',
    s5e: '最后练判读。给一个 H(s) 和一条 ROC（极点把平面切成三条竖带，选一条），三件事当场断清：h(t) 是<strong>右边、双边还是左边</strong>信号；系统<strong>因果</strong>吗；系统<strong>稳定</strong>吗。判据只有两条，请记牢：<strong>因果 ⟺ ROC 在最右极点之右</strong>（此时每个分量都是右边信号）；<strong>稳定 ⟺ ROC 包含虚轴 σ = 0</strong>。换个 H(s) 注意极点跑到右半平面时：想要稳定，就只能选包含虚轴的那条带——而那注定不是因果的。鱼和熊掌，ROC 说了算。',
    s5sysLab: '系统 H(s)',
    s5sys1: 'H₁：极点 −1, −2', s5sys2: 'H₂：极点 +1, −2',
    s5rocLab: '选一条 ROC',
    s5rocR: '右侧带（最右极点之右）', s5rocM: '中间带（两极点之间）', s5rocL: '左侧带（最左极点之左）',
    s5rocRs: '右侧带', s5rocMs: '中间带', s5rocLs: '左侧带',
    s5ro: 'ROC：<span>{roc}</span> · h(t) 形态：<b>{form}</b> · 因果：<b>{causal}</b> · 稳定：<b>{stable}</b>',
    s5formR: '右边信号（t < 0 全为 0）', s5formT: '双边信号（两侧都有）', s5formL: '左边信号（t > 0 全为 0）',
    s5yes: '是', s5no: '否',
    s5why: '判读理由：{why}',
    s5whyCausal: 'ROC 位于最右极点之右，每个极点分量都是右边信号，加起来仍是右边信号 → 因果',
    s5whyNotCausal: 'ROC 不是最右那条带，至少一个分量是左边信号 → h(t) 在 t < 0 不为 0 → 非因果',
    s5whyStable: 'ROC 包含虚轴 σ = 0，冲激响应绝对可积 → 稳定',
    s5whyNotStable: 'ROC 不包含虚轴 σ = 0 → 不稳定',
    s5quizBtn: '随机出题，考考你',
    s5quizQ: '考题：{sys}，ROC 取{roc}。这个系统<strong>稳定</strong>吗？先答，再看判读。',
    s5qStable: '稳定', s5qUnstable: '不稳定',
    s5qRight: '✓ 答对了。', s5qWrong: '✗ 差一点——正确答案看判读。',
    s5hint: '这张判读台把前面四步全用上了：极点位置（第 1 步）、虚轴这条线（第 2 步）、ROC 决定信号（第 3 步）、极点在左/右定生死（第 4 步）。真实工程里选 ROC 不是考试题——因果性是物理世界的硬约束，所以实际系统永远取最右那条带，稳定的问题就变成「极点是否全在左半平面」。',
    cvHt: 'h(t) 形态（闭式）',
    cvClip5: '曲线已冲出画框 ±2.5，截断显示（判读不受影响）',

    s6k: '第 6 步 · 终章',
    s6t: '全家福：半本《信号与系统》，装在一张平面里',
    s6e: '退远一步看全景。这张 s 平面上，住着你这条补课线走过的每一页：<strong>虚轴 jω</strong> 是傅里叶的住所——它只在那条线上活动；<strong>左半平面</strong>是稳定系统的家，控制页的全部战争都是把极点摁进这片区域；采样页让信号在频域里一遍遍复制自己，复制的舞台仍是这张平面。再往后，把这张平面<strong>卷起来</strong>：映射 z = e<sup>sT</sup> 会把左半平面整片卷进一个圆的内部——那个圆，就是下一页的主角：Z 变换的单位圆。',
    s6zNote: '动画里的小点沿虚轴左侧 σ = −0.5 处扫过，取样周期取 T = 0.5；它在 z 平面里的像始终落在半径 |z| = e<sup>σT</sup> = e<sup>−0.25</sup> ≈ 0.779 的圆上（图中橙色虚线圆）——这个数拿图就能自验。左半平面 ↔ 单位圆内，这条对应是 Z 变换稳定性的全部直觉（本页只预告，不判读）。',
    s6linksLab: '回链前几页：',
    s6lkF: '傅里叶变换：圆与波 →', s6lkC: '反馈与控制：摁极点 →', s6lkS: '采样与混叠：频域复制 →',
    s6fin: '收个尾：拉普拉斯做的事，本质上是给傅里叶<strong>多加了一个维度</strong>。频谱从一条线长成一张地形，极点是山峰、ROC 是国境线、虚轴是傅里叶的老家。下次在任何教材里看到 s 平面，先想这张图：每个系统都住在一个地址上，性格写在门牌号里。',
    cvAxis: '虚轴 jω —— 傅里叶住这条线',
    cvLHP: '左半平面 —— 稳定的家（控制页的战场）',
    cvZ: 'z 平面：卷起来',
    cvUnit: '单位圆'
  },
  en: {
    docTitle: 'Laplace & the ROC · A Lifetime for Every Frequency · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Laplace & the ROC',
    tagline: 'The Fourier transform only listens to tones that ring forever — it assumes every frequency keeps singing indefinitely. Real signals decay, or blow up. Laplace asks one extra question: is this tone fading, or growing? That single question turns the transform from a curve into a whole landscape over the s-plane: poles, regions of convergence and stability all become questions of position.',
    nav0: '0 Dying waves', nav1: '1 The s-plane', nav2: '2 The slice', nav3: '3 One formula, two signals',
    nav4: '4 Drag the poles', nav5: '5 The reading desk', nav6: '6 Finale · Family portrait',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Laplace Transform — one interaction per step series',

    s0k: 'Step 0 · The hook',
    s0t: 'First question: is it still alive?',
    s0e: 'This wave is e<sup>σt</sup>·cos(ωt) — a song that changes volume as it sings. σ is its "lifetime parameter": σ < 0 and it fades away; σ = 0 and it sings on forever at constant strength — <strong>that is exactly the Fourier world</strong>, which only handles tones that never die; σ > 0 and it grows until it bursts out of the frame. In the real world, fading and blowing up are the norm. Fourier cannot handle them; Laplace was built for them: <strong>give every frequency ω a partner, σ</strong>.',
    s0sig: 'σ · decay (−) / growth (+)',
    s0om: 'ω · frequency',
    s0ro: 'σ = <span>{sig}</span> · ω = <span>{om}</span> · state: <b>{verdict}</b> · envelope e<sup>σt</sup> at t = 6 is {env}',
    s0vDecay: 'Decaying — it sings itself out',
    s0vEqual: 'Constant amplitude — Fourier’s ideal world',
    s0vGrow: 'Growing — it would burst the frame (clamped for display)',
    s0hint: 'Park σ exactly at 0 for a second: this undying wave is what the rotating circles on <a class="fourier-link" href="../fourier/#step0">the Fourier page</a> draw. Every real signal dies, yet Fourier pretends they don’t — it gets away with it by imagining periodic repetition. Laplace doesn’t pretend: it writes σ into the transform itself. Next step, watch the plane gain a whole new dimension.',
    cvEnv: 'envelope ±e^{σt}',
    cvWave: 'e^{σt}·cos(ωt)',

    s1k: 'Step 1 · The s-plane',
    s1t: 'A landscape: every frequency gets a lifetime coordinate',
    s1e: 'Take the textbook signal: x(t) = e<sup>−at</sup>·u(t) (zero for t < 0, exponentially decaying afterwards). Its Laplace transform is X(s) = 1/(s + a), with s = σ + jω. First, read the two axes: <strong>the horizontal axis σ governs lifetime</strong> (further left decays faster; further right grows more easily), <strong>the vertical axis ω governs frequency</strong>. Fix a and paint |X(s)| over the whole s-plane as terrain: <strong>brighter means higher</strong>. One spike punches through the ceiling — the <strong>pole</strong>, standing at s = −a, where the denominator vanishes and the transform diverges. Drag the probe anywhere: X(s) there is computed from the formula point by point, never read off the picture (render resolution is only about painting — see the note under the figure). One small secret: for this signal, |X(s)| is exactly <strong>the reciprocal of the distance to the pole</strong> — the farther from the spike, the flatter the land.',
    s1aLab: 'a (the pole sits at s = −a; slide and watch the spike move)',
    s1formula: 'X(s) = 1 / (s + a), s = σ + jω, x(t) = e^{−at}·u(t)',
    s1ro: 'a = {a} · pole at s = <span>{pole}</span> · probe s = <span>{s}</span> · X(s) = <span>{re}</span> {imSign} j·<span>{im}</span> · |X(s)| = <span>{mod}</span> · distance to pole = {dist} (1/distance = {inv})',
    s1note: 'Rendering, honestly: the terrain is computed point by point from the closed form log<sub>10</sub>(1+|X(s)|) on a low-resolution offscreen grid, lifted by a γ = 0.6 power (a monotone map — colors change, values don’t) and then upscaled; the color scale saturates at |X| = 99 — the true value at the pole is ∞, so the flat top you see is display clamping. Dark colors far away do not mean zero, either: the values there are simply compressed by the logarithm. Probe readings and all verification use the closed form itself, never interpolation of the render grid.',
    s1hint: 'Compare with the Fourier page: there, each signal owned a single spectrum curve. Here there is no single line — there is <strong>a whole map</strong>: the horizontal axis σ governs lifetime, the vertical axis ω governs frequency. In step 2 you will cut this map with your own hands and watch Fourier fall out of the cut.',
    cvPole: 'pole',
    cvProbe: 'probe',
    cvLog: 'color scale: log₁₀(1+|X(s)|), γ = 0.6 display lift, saturating at 2 (true value at the pole is ∞)',

    s2k: 'Step 2 · The slice',
    s2t: 'Fourier is the cut at σ = 0',
    s2e: 'Cut the terrain of step 1 vertically: fix σ = σ<sub>0</sub> and read the values along ω — that is the curve |X(σ<sub>0</sub> + jω)| on the right. Drag the cut to σ<sub>0</sub> = 0, flush against the imaginary axis, and the curve has a name you know: <strong>the Fourier magnitude spectrum</strong> 1/√(a² + ω²), matching to the last digit. But be careful: the cut must land inside the <strong>region of convergence</strong> (the half where σ > −a). Drag a negative and the pole crosses into the right half-plane; the σ = 0 cut then falls outside the ROC — the Fourier spectrum <strong>does not exist</strong>, and this page will not draw you a fake one. Nudge σ<sub>0</sub> a little further right, back inside the ROC, and the Laplace slice is perfectly healthy again.',
    s2aLab: 'a (pole at s = −a)',
    s2sLab: 'σ₀ · cut position',
    s2btn0: 'Cut at σ₀ = 0 (the Fourier cut)',
    s2roIn: 'a = {a} · σ₀ = <span>{s0}</span> · this cut is inside the ROC (σ₀ > {bd}) ✓ · |X(σ₀ + j0)| = <span>{peak}</span>{fNote}',
    s2roOut: 'a = {a} · σ₀ = <span>{s0}</span> · this cut is <b>outside the ROC</b> (need σ₀ > {bd}): the integral diverges and this spectrum line does not exist — it is not that we failed to draw it; it is genuinely not there',
    s2fNote: ' · this is exactly the Fourier magnitude spectrum 1/√(a²+ω²), overlaid point by point with the closed form',
    s2hint: 'That is the whole reason some signals have no Fourier transform but do have a Laplace transform: Fourier is only allowed to stand on the single line σ = 0 — if that line falls outside the ROC, it is blind. Laplace stands on the entire plane; there is always a region it can see from. The sampling page had its own boundary story ("exactly 2f is about phase"); this is the transform version.',
    cvRocIn: 'ROC: σ > −a',
    cvSlice: 'cut σ₀',
    cvMag: '|X(σ₀+jω)|',
    cvOut: '✗ outside the ROC: this spectrum does not exist',
    cvClip2: 'peak {peak} — top clipped (readout is exact)',

    s3k: 'Step 3 · One formula, two signals',
    s3t: 'The same formula, two different signals',
    s3e: 'The most important act on this page. Signal A: e<sup>−at</sup>·u(t), living on t ≥ 0. Signal B: −e<sup>−at</sup>·u(−t), living on t ≤ 0, with a flipped sign. Compute both Laplace transforms — <strong>the algebra is identical: 1/(s + a)</strong>. The only difference is the region of convergence: A needs σ > −a, B needs σ < −a. Switch signals and watch the shading flip sides; drag the probe anywhere: at one and the same s, the transform converges for A and may diverge for B. The moral, stated plainly: <strong>a transform written without its ROC is an unfinished sentence</strong> — without the ROC you cannot even tell which signal you are talking about.',
    s3btnA: 'Signal A · right-sided e^{−at}·u(t)',
    s3btnB: 'Signal B · left-sided −e^{−at}·u(−t)',
    s3curA: 'Signal A (right-sided)',
    s3curB: 'Signal B (left-sided)',
    s3aLab: 'a (shared; same pole at s = −a)',
    s3formula: 'Both signals have X(s) = 1 / (s + a) — same formula, different ROC',
    s3ro: 'Current signal: <b>{cur}</b> · probe σ = <span>{sig}</span> (ω = {om}) · for signal A (needs σ > {bd}): <b>{va}</b> · for signal B (needs σ < {bd}): <b>{vb}</b>',
    s3conv: 'converges ✓',
    s3div: 'diverges ✗',
    s3hint: 'Why does convergence depend only on σ, never on ω? Because |e<sup>−st</sup>| = e<sup>−σt</sup>: whether the integral converges is decided by whether the real part σ can hold the exponential down; the imaginary part ω only makes it spin in place — it neither helps nor hurts. That is why every ROC is a vertical strip, and why the probe verdict quotes σ alone. If an exam answer draws an ROC in any other shape, it is almost certainly wrong.',
    cvRoc: 'ROC (converges)',
    cvTimeA: 'x(t): lives on t ≥ 0',
    cvTimeB: 'x(t): lives on t ≤ 0',

    s4k: 'Step 4 · Drag the poles',
    s4t: 'A system’s character is written in its pole positions',
    s4e: 'Now a second-order system H(s) = 1/(s² + 2ζω<sub>0</sub>s + ω<sub>0</sub>²). Its pair of poles can be dragged around the s-plane: above the real axis they form a conjugate pair (the system rings as it decays); drag them back onto the real axis and the poles turn real — they can sit on top of each other (critical damping) or be <strong>pulled apart</strong> into two separate real poles (overdamped). On the right, the impulse response h(t) redraws in real time (closed form, not a numerical simulation) together with its ±envelope: <strong>the real part σ<sub>p</sub> of the poles is the decay rate</strong> — the farther left of the axis, the harder the envelope e<sup>σ<sub>p</sub>t</sup> squeezes it down. Drag them into the right half-plane and watch the envelope open upward instead: the response bursts the frame.',
    s4p1: 'Stable ringing decay', s4p2: 'Critically damped', s4p3: 'Overdamped', s4p4: 'Sustained oscillation', s4p5: 'Blow-up',
    s4tLab: 'envelope probe time t',
    s4ro: 'poles: <span>{poles}</span> · ζ = <span>{zeta}</span> · ω₀ = <span>{w0}</span> · state: <b>{verdict}</b> · envelope at t = {te}: ±E = <span>{env}</span> (definition of E in the note under the figure)',
    s4vStable: 'stable — the response decays to zero',
    s4vMarginal: 'bounded free response without asymptotic decay (oscillation or a nonzero constant); this causal transfer function is not BIBO input-output stable',
    s4vUnstable: 'unstable — the response blows up (frame clamped)',
    s4note: 'Conventions: underdamped, h(t) = e<sup>σ<sub>p</sub>t</sup>·sin(ω<sub>d</sub>t)/ω<sub>d</sub> with envelope E(t) = e<sup>σ<sub>p</sub>t</sup>/ω<sub>d</sub>; critically damped, h(t) = t·e<sup>pt</sup> and the curve is its own envelope; overdamped with real poles p<sub>1</sub>, p<sub>2</sub>, h(t) = (e<sup>p<sub>1</sub>t</sup> − e<sup>p<sub>2</sub>t</sup>)/(p<sub>1</sub> − p<sub>2</sub>) and the envelope is the sum of the absolute components, (e<sup>p<sub>1</sub>t</sup> + e<sup>p<sub>2</sub>t</sup>)/|p<sub>1</sub> − p<sub>2</sub>|. Everything is closed form; every point can be recomputed by hand.',
    s4dash: 'One more word on the “—” in the readout: when the two real poles have <strong>opposite signs</strong>, ω₀ = √(p₁p₂) is imaginary and ζ is undefined — the “—” is the honest answer, not a missing computation; a pole sitting exactly at the origin gives ω₀ = 0 and is likewise undefined. When you see “—”, read the pole positions and the verdict instead: any pole in the right half-plane means the system is unstable.',
    s4linkTxt: 'Everything the PID controller does on the control page is one long fight to push the closed-loop poles into the left half-plane: the deeper they go, the steadier the cart and the faster it settles — go push them yourself over there →',
    s4lkC: 'Feedback & Control →',
    s4hint: 'Get the feel of it: park the poles just left of the axis (σ<sub>p</sub> ≈ −0.1) and watch the tail ring on and on; then yank them to σ<sub>p</sub> = −2.5 and the tail is cut off at once. The smaller ζ is, the floatier the ringing; at ζ ≥ 1 it cannot ring at all — click through the five presets; it teaches faster than definitions.',
    cvEnv: '±envelope E(t)',
    cvImp: 'impulse response h(t)',
    cvDrag: 'drag me',

    s5k: 'Step 5 · The reading desk',
    s5t: 'Given an ROC, call causality and survival',
    s5e: 'Final exercise: reading a system. Given an H(s) and one ROC (the poles cut the plane into three vertical strips — pick one), settle three things on the spot: whether h(t) is a <strong>right-sided, two-sided or left-sided</strong> signal; whether the system is <strong>causal</strong>; whether it is <strong>stable</strong>. There are only two rules, and they are worth memorizing: <strong>causal ⟺ the ROC lies to the right of the rightmost pole</strong> (every component is then a right-sided signal); <strong>stable ⟺ the ROC contains the imaginary axis σ = 0</strong>. Switch to the second system, whose poles straddle into the right half-plane: if you want stability you must pick the strip containing the axis — and that strip is never the causal one. You cannot have both; the ROC decides.',
    s5sysLab: 'System H(s)',
    s5sys1: 'H₁: poles −1, −2', s5sys2: 'H₂: poles +1, −2',
    s5rocLab: 'Pick an ROC',
    s5rocR: 'Right strip (right of the rightmost pole)', s5rocM: 'Middle strip (between the poles)', s5rocL: 'Left strip (left of the leftmost pole)',
    s5rocRs: 'right strip', s5rocMs: 'middle strip', s5rocLs: 'left strip',
    s5ro: 'ROC: <span>{roc}</span> · h(t) is: <b>{form}</b> · causal: <b>{causal}</b> · stable: <b>{stable}</b>',
    s5formR: 'right-sided (zero for t < 0)', s5formT: 'two-sided (lives on both sides)', s5formL: 'left-sided (zero for t > 0)',
    s5yes: 'yes', s5no: 'no',
    s5why: 'Reasoning: {why}',
    s5whyCausal: 'the ROC is right of the rightmost pole, so every pole component is a right-sided signal and their sum is right-sided too → causal',
    s5whyNotCausal: 'the ROC is not the rightmost strip, so at least one component is a left-sided signal → h(t) ≠ 0 for t < 0 → not causal',
    s5whyStable: 'the ROC contains the axis σ = 0, so h(t) is absolutely integrable → stable',
    s5whyNotStable: 'the ROC does not contain the axis σ = 0 → unstable',
    s5quizBtn: 'Deal me a random question',
    s5quizQ: 'Question: {sys}, with the {roc} ROC. Is this system <strong>stable</strong>? Answer first, then read the verdict.',
    s5qStable: 'Stable', s5qUnstable: 'Unstable',
    s5qRight: '✓ Correct. ', s5qWrong: '✗ Not quite — see the verdict for the right answer. ',
    s5hint: 'This desk uses everything from the first four steps: pole positions (step 1), the axis as a line that matters (step 2), the ROC choosing the signal (step 3), left versus right half-plane deciding survival (step 4). In the real world, choosing an ROC is not an exam question — causality is a hard physical constraint, so real systems always take the rightmost strip, and the stability question becomes simply “are all the poles in the left half-plane?”',
    cvHt: 'h(t) shape (closed form)',
    cvClip5: 'beyond the ±2.5 frame — clipped (verdicts stand)',

    s6k: 'Step 6 · Finale',
    s6t: 'Family portrait: half of Signals & Systems on one plane',
    s6e: 'Step back and see the whole map. Living on this one s-plane are all the pages of your catch-up line: the <strong>imaginary axis jω</strong> is Fourier’s home — it only ever moves along that line; the <strong>left half-plane</strong> is where stable systems live, and the control page’s entire war is about shoving poles into that territory; the sampling page made signals copy themselves across the frequency axis, and the stage for those copies is still this plane. One more move: <strong>roll the plane up</strong>. The map z = e<sup>sT</sup> wraps the whole left half-plane into the inside of a circle — and that circle is the hero of the next page: the unit circle of the Z-transform.',
    s6zNote: 'In the animation, a point sweeps along the line σ = −0.5 just left of the axis, with sampling period T = 0.5; its image in the z-plane stays on the circle of radius |z| = e<sup>σT</sup> = e<sup>−0.25</sup> ≈ 0.779 (the orange dashed circle) — a number you can verify against the picture yourself. Left half-plane ↔ inside of the unit circle: that single correspondence is the entire intuition behind Z-transform stability (preview only — no verdicts here).',
    s6linksLab: 'Back to the earlier pages:',
    s6lkF: 'Fourier transform: circles & waves →', s6lkC: 'Feedback & control: pushing poles →', s6lkS: 'Sampling & aliasing: copies in frequency →',
    s6fin: 'To wrap up: what Laplace really does is hand Fourier <strong>one extra dimension</strong>. A spectrum grows from a line into a landscape; poles are its peaks, the ROC its borders, the imaginary axis Fourier’s old home. Next time any textbook shows you the s-plane, picture this map first: every system lives at an address on it, and its character is written on the doorplate.',
    cvAxis: 'the axis jω — Fourier lives on this line',
    cvLHP: 'left half-plane — home of stability (the control page’s battlefield)',
    cvZ: 'z-plane: rolled up',
    cvUnit: 'unit circle'
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
