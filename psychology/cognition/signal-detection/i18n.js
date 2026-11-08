'use strict';
// Author: Claude Code (claude-opus-5-5), 2026-11-08.

const STRINGS = {
  zh: {
    pageTitle: '信号检测论 · 分得清，和愿意说“有”，是两回事',
    back: '← 知识索引',
    navLabel: '信号检测论步骤导航',
    tagline: '判断「有没有」时，正确率混在一起的其实是两件事：你分辨信号和噪声的能力，以及你多愿意说「有」。信号检测论用 d\' 和判据 c 把它们拆开。',
    nav0: '0 同样 80%', nav1: '1 证据强度', nav2: '2 判据 c', nav3: '3 敏感度 d\'', nav4: '4 ROC 曲线', nav5: '5 最佳判据', nav6: '6 收束',

    s0k: '第 0 步 · 一个问题', s0t: '两位检测者都对了 80%，谁更会分辨？',
    s0e: '这一步要回答：只看「正确率」能不能比较两位检测者？下面是一个<strong>假设的教学例子</strong>（取自 Birmingham 大学 Georgeson 的讲义）：各看 100 张有肿瘤、100 张无肿瘤的片子。每次只有两种回答「有」或「没有」，于是只有四种结果：有肿瘤说「有」叫<strong>命中</strong>，有肿瘤说「没有」叫<strong>漏报</strong>，没肿瘤说「有」叫<strong>虚报</strong>（误报），没肿瘤说「没有」叫<strong>正确拒绝</strong>。两边的总正确率都是 80%。',
    docs: '医生', machine: '机器', present: '有肿瘤 100 张', absent: '无肿瘤 100 张',
    hit: '命中', miss: '漏报', fa: '虚报', cr: '正确拒绝',
    predictPrompt: '先凭直觉押一个（第 4 步揭晓）：', predA: '医生更会分辨', predB: '机器更会分辨', predC: '一样，都是 80%',
    predSaved: '已记下你的猜测：{p}。到第 4 步看答案。',
    s0hint: '注意机器几乎不漏报，但虚报多；医生两种错误一样多。正确率把这两种错误加在了一起。',

    s1k: '第 1 步 · 模型', s1t: '每次判断背后，都有一个看不见的「证据强度」',
    s1e: '这一步要回答：同一张片子，为什么有时判对、有时判错？信号检测论假设：每看一次，脑中（或机器里）产生一个<strong>证据强度 x</strong>，它每次都有随机起伏。没有信号时，x 来自<strong>噪声分布</strong>（灰色，平均 0）；有信号时，x 来自<strong>信号分布</strong>（青色，平均更高）。两者是同样宽的正态分布（<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ 二项与正态第 3 步：正态曲线长什么样</a>）。观察者只定一条线叫<strong>判据</strong>：x 超过它就说「有」。',
    runTrials: '再做 20 次试验', resetTrials: '清空',
    s1readout: '已做 {n} 次（一半有信号）· 命中 {hit} · 漏报 {miss} · 虚报 {fa} · 正确拒绝 {cr}　｜　命中率 H 实测 {H} · 模型 {Hm}　虚报率 F 实测 {F} · 模型 {Fm}',
    s1empty: '按按钮做试验：每个点是一次试验的证据强度 x，上排为有信号，下排为无信号；点在判据线右边就是回答「有」。',
    s1hint: '本步固定两分布相距 1.5 个标准差、判据在正中间。<strong>命中率 H</strong> = 有信号时说「有」的比例；<strong>虚报率 F</strong> = 无信号时说「有」的比例。多做几轮，看实测比例怎样靠近模型给的面积（图中涂色部分）。',

    s2k: '第 2 步 · 第一个量', s2t: '判据 c：只改「多愿意说有」，不改分辨能力',
    s2e: '这一步要回答：把判据线左右移，会发生什么？<strong>判据 c</strong> 衡量判据线离两个分布正中间有多远，单位是标准差：c &lt; 0 叫<strong>宽松</strong>（更爱说「有」），c &gt; 0 叫<strong>严格</strong>，c = 0 叫<strong>无偏</strong>。往左移，<strong>命中率 H</strong>（有信号时说「有」的比例）和<strong>虚报率 F</strong>（无信号时说「有」的比例）<em>一起</em>上升：少漏报，就得多虚报。两条分布的距离没变。',
    cLabel: '判据 c（负=宽松，正=严格）',
    s2readout: 'c = {c} · H = {H} · F = {F} · 每 100 次有信号漏报 {miss} 次、每 100 次无信号虚报 {fa} 次 · 用 H、F 反算 c = −[z(H)+z(F)]/2 = {cBack}',
    s2hint: '观察顺序：从 c = 1 拖到 c = −1，看两块涂色面积一起变大；松手后旧判据线变淡留在图上。反算的 c 用的是 z(·)：把一个比例换成「标准正态里左边占这么多面积的位置」，单位是标准差。',

    s3k: '第 3 步 · 第二个量', s3t: '敏感度 d\'：两个分布离得多远',
    s3e: '这一步要回答：什么才是真正的「分辨能力」？<strong>敏感度 d\'</strong>（读作 d-prime）= 信号分布和噪声分布平均值的距离，以它们共同的标准差为单位。d\' = 0 时两条曲线重合，怎么判都是瞎猜；d\' 越大，重叠越少。实验里看不到分布，只看得到 H（命中率：有信号时说「有」的比例）和 F（虚报率：无信号时说「有」的比例），所以要反算：<strong>d\' = z(H) − z(F)</strong>，其中 z(p) 是把比例 p 换成标准正态中对应位置（单位：标准差）的换算。',
    dLabel: '敏感度 d\'',
    s3readout: 'd\' = {d} · c = {c} · H = {H} · F = {F} · 反算 z(H) − z(F) = {dBack} · 正确率 {pc}%',
    s3hint: '观察顺序：保持 c（判据：判据线离两分布正中间几个标准差）不动，只拖 d\'——H 升、F 降，正确率上升。再保持 d\' 不动、拖 c（第 2 步）——反算出的 d\' 不变。这个「不变」只在本页的等方差正态模型里成立。',

    s4k: '第 4 步 · 一张图看全', s4t: 'ROC 曲线：同一个 d\'，所有判据画成一条弧',
    s4e: '这一步要回答：怎样一眼看出两位检测者谁更会分辨？把判据从严到松扫一遍，每个判据给出一对 (虚报率 F, 命中率 H)，连起来就是 <strong>ROC 曲线</strong>（受试者工作特征曲线）。同一条曲线上的点 d\'（敏感度：两分布平均值相距几个标准差）相同，只是判据 c 不同；曲线越鼓向左上角，d\' 越大。对角线是 d\' = 0（瞎猜）。图上标出了第 0 步的医生和机器。',
    s4readout: '当前点：F = {F}，H = {H}（d\' = {d}，c = {c}）　｜　医生：d\' = {dDoc}，c = {cDoc}　机器：d\' = {dMac}，c = {cMac}',
    reveal: '揭晓：机器在更鼓的那条曲线上（d\' ≈ 2.36 &gt; 1.68），所以更会分辨；它的正确率没更高，是因为判据很宽松（c ≈ −0.87），用很多虚报换来了极少漏报。{you}',
    youRight: '你猜对了。', youWrong: '你在第 0 步猜的是「{p}」。',
    s4hint: '观察顺序：只拖 c，当前点沿着一条曲线滑；只拖 d\'，点跳到另一条曲线。这些弧形是在「两分布等宽的正态」假设下画的；真实数据的 ROC 若不对称，说明这个假设不成立，d\' 也就随判据变。',
    rocF: '虚报率 F', rocH: '命中率 H',

    s5k: '第 5 步 · 用起来', s5t: '最好的判据，取决于错误有多贵、信号有多常见',
    s5e: '这一步要回答：判据该放在哪？答案不是「正中间」。设<strong>基础率</strong>（每次试验里真有信号的比例）为 p，一次<strong>漏报</strong>的代价是 m，一次<strong>虚报</strong>的代价是 f。每次试验的<strong>期望代价</strong> = p·(1−H)·m + (1−p)·F·f，其中 H 是命中率（有信号时说「有」的比例）、F 是虚报率（无信号时说「有」的比例）。下图画出它随判据 c（判据线离两分布正中间的距离，负 = 宽松）的变化，绿点是最低处。漏报越贵、信号越常见，最佳判据越宽松（更左）。这和贝叶斯里「先验 × 似然比」是同一笔账（<a class="xlink" href="../../../probability/inference/bayes-updating/#step2">→ 贝叶斯更新第 2 步：后验 = 先验 × 似然比</a>）。',
    baseRate: '基础率 p（真有信号的比例）', costRatio: '漏报代价 ÷ 虚报代价', yourC: '你的判据 c',
    s5readout: '最佳 c = {best}（期望代价 {bestCost}）· 你的 c = {c}（期望代价 {cost}）{verdict}',
    near: ' · 已经很接近最佳', far: ' · 还能更低', offChart: '（在图示范围 −2.5…2.5 之外，绿点画在边缘）',
    s5hint: '期望代价按本页模型（d\' = 1.5）计算，单位是「虚报一次 = 1」。试试：把漏报代价调到 10（比如漏诊很严重），看最佳判据往哪移；再把基础率调到 0.05。',
    costAxis: '期望代价 / 次', cAxis: '判据 c',

    s6k: '收束', s6t: '先拆开，再比较',
    s6fin: '任何「有 / 没有」的判断都同时含有两样东西：<strong>d\'</strong>（分得多清）和 <strong>c</strong>（多愿意说有）。只看正确率或只看命中率，会把两者混在一起。先用 H、F 把它们拆开，再按错误的代价选判据。',
    formula: 'H = P(说有 | 有信号)　F = P(说有 | 无信号)　d\' = z(H) − z(F)　c = −[z(H) + z(F)]/2',
    boundary: '模型边界：本页假设两种试验的证据强度都是同样宽的正态分布（等方差模型）；试验数据由固定种子的随机数生成，是模拟不是实测。H 或 F 等于 0 或 1 时 z 为无穷大，实际分析需要修正。医生与机器是讲义里的假设例子，不代表真实诊断水平。',
    quizPrompt: '一位雷达员换了更严格的判据，少喊「有」了。按本页模型，他的 d\' 会怎样？',
    quizA: '上升：他犯的虚报少了。', quizB: '不变：判据只移动 H 和 F，不改两个分布的距离。', quizC: '下降：他的命中也少了。',
    check: '检查判断', correct: '正确：H 和 F 一起降，z(H) − z(F) 不变（在等方差模型里）。', wrong: '再看第 3 步：只拖 c 时，反算出的 d\' 变了吗？',
    lk1: '↗ 记忆与注意第 1 步：干扰越多，命中率越低',
    lk2: '↗ 假设检验第 2 步：「冤枉公平硬币」就是虚报',
    lk3: '↗ 假设检验第 3 步：硬币真有偏时能否揪出来，就是命中率',
    lk4: '↗ 贝叶斯更新第 2 步：先验 × 似然比',
    foot: 'visual.integ.life · 信号检测论 Signal Detection Theory',
  },
  en: {
    pageTitle: 'Signal Detection Theory · Telling Apart vs. Willing to Say “Yes”',
    back: '← Knowledge index',
    navLabel: 'Signal detection steps',
    tagline: 'When you judge “is it there or not?”, your accuracy mixes two things: how well you can tell signal from noise, and how willing you are to say “yes”. Signal detection theory separates them as d\' and the criterion c.',
    nav0: '0 Both 80%', nav1: '1 Evidence', nav2: '2 Criterion c', nav3: '3 Sensitivity d\'', nav4: '4 ROC curve', nav5: '5 Best criterion', nav6: '6 Wrap-up',

    s0k: 'Step 0 · A question', s0t: 'Two detectors are both 80% correct — which one discriminates better?',
    s0e: 'This step asks: can you compare two detectors by accuracy alone? Below is a <strong>hypothetical teaching example</strong> (from M. Georgeson’s University of Birmingham handout): each reads 100 X-rays with a tumour and 100 without. Each answer is “yes” or “no”, so there are only four outcomes: tumour + “yes” is a <strong>hit</strong>, tumour + “no” a <strong>miss</strong>, no tumour + “yes” a <strong>false alarm</strong>, no tumour + “no” a <strong>correct rejection</strong>. Both are 80% correct overall.',
    docs: 'Doctors', machine: 'Machine', present: 'Tumour, 100 plates', absent: 'No tumour, 100 plates',
    hit: 'hit', miss: 'miss', fa: 'false alarm', cr: 'correct rejection',
    predictPrompt: 'Make a gut call first (revealed in step 4):', predA: 'The doctors discriminate better', predB: 'The machine discriminates better', predC: 'Equal — both are 80%',
    predSaved: 'Your guess is recorded: {p}. See step 4 for the answer.',
    s0hint: 'Notice the machine almost never misses but raises many false alarms; the doctors make equal numbers of both errors. Accuracy simply adds the two kinds of error together.',

    s1k: 'Step 1 · The model', s1t: 'Behind every judgement is an invisible “evidence strength”',
    s1e: 'This step asks: why is the same kind of plate sometimes judged right and sometimes wrong? Signal detection theory assumes that each look produces an <strong>evidence strength x</strong> (in a brain or a machine) that fluctuates randomly. Without a signal, x comes from the <strong>noise distribution</strong> (grey, mean 0); with a signal, from the <strong>signal distribution</strong> (cyan, higher mean). Both are normal curves of the same width (<a class="xlink" href="../../../probability/basics/binomial-normal/#step3">→ Binomial & normal, step 3: what the normal curve looks like</a>). The observer sets one line, the <strong>criterion</strong>: if x is beyond it, say “yes”.',
    runTrials: 'Run 20 more trials', resetTrials: 'Clear',
    s1readout: '{n} trials (half with signal) · hits {hit} · misses {miss} · false alarms {fa} · correct rejections {cr}　|　hit rate H measured {H} · model {Hm}　false-alarm rate F measured {F} · model {Fm}',
    s1empty: 'Press the button to run trials: each dot is one trial’s evidence x — top row with signal, bottom row without. A dot right of the criterion line means the answer was “yes”.',
    s1hint: 'This step fixes the distributions 1.5 standard deviations apart, with the criterion exactly in the middle. <strong>Hit rate H</strong> = share of signal trials answered “yes”; <strong>false-alarm rate F</strong> = share of noise trials answered “yes”. Run a few rounds and watch the measured shares approach the model’s areas (shaded).',

    s2k: 'Step 2 · The first measure', s2t: 'Criterion c: change how willing you are to say yes, not how well you see',
    s2e: 'This step asks: what happens when the criterion line slides? The <strong>criterion c</strong> measures how far the line sits from the midpoint between the two distributions, in standard deviations: c &lt; 0 is <strong>lax</strong> (more “yes”), c &gt; 0 is <strong>strict</strong>, c = 0 is <strong>unbiased</strong>. Slide left and the <strong>hit rate H</strong> (share of signal trials answered “yes”) and the <strong>false-alarm rate F</strong> (share of noise trials answered “yes”) rise <em>together</em>: fewer misses cost more false alarms. The distance between the distributions does not change.',
    cLabel: 'Criterion c (negative = lax, positive = strict)',
    s2readout: 'c = {c} · H = {H} · F = {F} · per 100 signal trials {miss} misses; per 100 noise trials {fa} false alarms · c recovered from H, F: −[z(H)+z(F)]/2 = {cBack}',
    s2hint: 'What to do: drag from c = 1 to c = −1 and watch both shaded areas grow; when you let go, the old criterion line stays faded on the chart. The recovered c uses z(·): it turns a proportion into “the position on a standard normal with that much area to its left”, in standard deviations.',

    s3k: 'Step 3 · The second measure', s3t: 'Sensitivity d\': how far apart the distributions are',
    s3e: 'This step asks: what is real “discrimination ability”? <strong>Sensitivity d\'</strong> (“d-prime”) is the distance between the means of the signal and noise distributions, measured in their common standard deviation. At d\' = 0 the curves coincide and every judgement is a guess; the larger d\', the less they overlap. Experiments never show the distributions, only H (hit rate: share of signal trials answered “yes”) and F (false-alarm rate: share of noise trials answered “yes”), so d\' is recovered as <strong>d\' = z(H) − z(F)</strong>, where z(p) converts a proportion p to its position on a standard normal (in standard deviations).',
    dLabel: 'Sensitivity d\'',
    s3readout: 'd\' = {d} · c = {c} · H = {H} · F = {F} · recovered z(H) − z(F) = {dBack} · accuracy {pc}%',
    s3hint: 'What to do: hold c (the criterion: how many standard deviations the line sits from the midpoint) and move only d\' — H rises, F falls, accuracy improves. Then hold d\' and move c (step 2) — the recovered d\' stays put. That invariance holds only in this page’s equal-variance normal model.',

    s4k: 'Step 4 · One picture', s4t: 'The ROC curve: one d\', every criterion, one arc',
    s4e: 'This step asks: how can you see at a glance who discriminates better? Sweep the criterion from strict to lax; each criterion gives a pair (false-alarm rate F, hit rate H). Joined up, they form the <strong>ROC curve</strong> (receiver operating characteristic). Points on one curve share the same d\' (sensitivity: how many standard deviations apart the two means are) and differ only in criterion c; the more a curve bows toward the top-left, the larger d\'. The diagonal is d\' = 0 (guessing). The doctors and the machine from step 0 are marked.',
    s4readout: 'Current point: F = {F}, H = {H} (d\' = {d}, c = {c})　|　Doctors: d\' = {dDoc}, c = {cDoc}　Machine: d\' = {dMac}, c = {cMac}',
    reveal: 'Answer: the machine sits on the more bowed curve (d\' ≈ 2.36 &gt; 1.68), so it discriminates better. Its accuracy is no higher because its criterion is very lax (c ≈ −0.87): it buys very few misses with many false alarms. {you}',
    youRight: 'You guessed right.', youWrong: 'In step 0 you guessed “{p}”.',
    s4hint: 'What to do: move only c and the point slides along one curve; move only d\' and it jumps to another curve. These arcs assume equal-width normal distributions; if real ROC data are asymmetric, that assumption fails and d\' changes with the criterion.',
    rocF: 'false-alarm rate F', rocH: 'hit rate H',

    s5k: 'Step 5 · Put it to work', s5t: 'The best criterion depends on what errors cost and how common the signal is',
    s5e: 'This step asks: where should the criterion go? Not necessarily in the middle. Let the <strong>base rate</strong> (share of trials that really contain a signal) be p, the cost of one <strong>miss</strong> m, and of one <strong>false alarm</strong> f. The <strong>expected cost</strong> per trial is p·(1−H)·m + (1−p)·F·f, where H is the hit rate (share of signal trials answered “yes”) and F the false-alarm rate (share of noise trials answered “yes”). The chart plots it against the criterion c (the line’s distance from the midpoint; negative = lax); the green dot is the minimum. The costlier a miss and the more common the signal, the laxer (further left) the best criterion. This is the same bookkeeping as Bayes’ “prior × likelihood ratio” (<a class="xlink" href="../../../probability/inference/bayes-updating/#step2">→ Bayes updating, step 2: posterior = prior × likelihood ratio</a>).',
    baseRate: 'Base rate p (share with a signal)', costRatio: 'Miss cost ÷ false-alarm cost', yourC: 'Your criterion c',
    s5readout: 'best c = {best} (expected cost {bestCost}) · your c = {c} (expected cost {cost}){verdict}',
    near: ' · already close to the best', far: ' · can go lower', offChart: ' (outside the plotted range −2.5…2.5; the green dot sits at the edge)',
    s5hint: 'Expected cost uses this page’s model (d\' = 1.5), in units of “one false alarm = 1”. Try raising the miss cost to 10 (say, a missed diagnosis is serious) and see where the best criterion moves; then set the base rate to 0.05.',
    costAxis: 'expected cost / trial', cAxis: 'criterion c',

    s6k: 'Wrap-up', s6t: 'Separate first, then compare',
    s6fin: 'Every yes/no judgement contains two things at once: <strong>d\'</strong> (how clearly you tell them apart) and <strong>c</strong> (how willing you are to say yes). Accuracy alone, or hit rate alone, mixes them up. Separate them with H and F first, then choose the criterion by what the errors cost.',
    formula: 'H = P(yes | signal)　F = P(yes | noise)　d\' = z(H) − z(F)　c = −[z(H) + z(F)]/2',
    boundary: 'Model limits: this page assumes the evidence on both kinds of trial is normal with equal width (the equal-variance model); trial data come from a fixed-seed random generator — simulated, not measured. When H or F is 0 or 1, z is infinite and real analyses need a correction. The doctors and machine are the handout’s hypothetical example, not real diagnostic performance.',
    quizPrompt: 'A radar operator adopts a stricter criterion and says “yes” less often. In this page’s model, what happens to their d\'?',
    quizA: 'It rises: they make fewer false alarms.', quizB: 'It stays the same: the criterion moves H and F, not the distance between the distributions.', quizC: 'It falls: they also get fewer hits.',
    check: 'Check', correct: 'Right: H and F fall together, so z(H) − z(F) is unchanged (in the equal-variance model).', wrong: 'Look at step 3 again: when only c moved, did the recovered d\' change?',
    lk1: '↗ Memory & attention, step 1: more distractors, fewer hits',
    lk2: '↗ Hypothesis testing, step 2: “convicting a fair coin” is a false alarm',
    lk3: '↗ Hypothesis testing, step 3: catching a truly biased coin is a hit',
    lk4: '↗ Bayes updating, step 2: prior × likelihood ratio',
    foot: 'visual.integ.life · Signal Detection Theory',
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
  if (typeof window.refreshSDT === 'function') window.refreshSDT();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SDT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
