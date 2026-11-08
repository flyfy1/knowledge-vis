'use strict';
// Author: Claude Code (claude-opus-5-5), 2026-11-08.

const STRINGS = {
  zh: {
    pageTitle: '元音空间 · 用两个共振峰给元音定位',
    back: '← 知识索引',
    navLabel: '元音空间步骤导航',
    tagline: '男人、女人和孩子说同一个 heed，声音的绝对频率差很多，我们却听成同一个元音。本页用 1952 年 Peterson 与 Barney 测得的 1520 个元音，看元音在两个共振峰组成的平面上怎样排开，以及为什么要「按说话人整体缩放」才能对上。',
    nav0: '0 共振峰', nav1: '1 F1–F2 平面', nav2: '2 三组说话人', nav3: '3 拿男性模板去认', nav4: '4 整体缩放', nav5: '5 收束',
    gm: '男性', gw: '女性', gc: '儿童',

    s0k: '第 0 步 · 一个元音里有什么', s0t: '基频定音高，共振峰定元音',
    s0e: '这一步要回答：一个元音的声音里，哪些数字决定它是哪个元音？浊音的声音每秒重复 F0 次，<strong>基频 F0</strong> 听起来就是音高；它同时含有频率为 F0、2F0、3F0…… 的<strong>谐波</strong>（竖线，<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶第 5 步：从波形到频谱</a>）。从喉到唇的声道像一组共鸣腔，会把某些频率附近的谐波放大：这些放大的峰叫<strong>共振峰</strong>（formant），从低到高记作 F1、F2、F3（<a class="xlink" href="../../../physics/waves/resonance/#step3">→ 共振第 3 步：共振曲线</a>）。选一个词和一组说话人，看谐波和峰的位置。',
    s0readout: '{word} /{ipa}/ · {group}平均：F0 {f0} Hz · F1 {f1} · F2 {f2} · F3 {f3} Hz（{n} 个录音的平均）',
    s0hint: '观察顺序：先固定 heed，在男性和儿童之间切换——竖线（谐波）间距从约 136 Hz 拉宽到约 270 Hz，峰的位置也整体右移。再固定男性、在 heed 和 hod 之间切换：谐波间距只从 136 变到 124 Hz，峰却换了地方。图中峰的形状是本页的示意画法，只有 F0 和 F1–F3 的位置是数据。',
    freqAxis: '频率 Hz', ampAxis: '相对强度（示意）',

    s1k: '第 1 步 · 两个数，一个点', s1t: '把每个元音画成 F1–F2 平面上的一个点',
    s1e: '这一步要回答：只看前两个共振峰，10 个元音能分开吗？下面每个点是 33 位男性说话人某个元音的平均（F1, F2）。<strong>F1–F2 平面</strong>：横轴 F2、纵轴 F1。本页选择让 F2 从右往左增大、F1 从上往下增大，两轴都用<strong>对数刻度</strong>（相同距离代表相同倍数，<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ 指数与对数第 3 步：对数把乘法变成加法</a>）。点一个词看它的位置。',
    s1readout: '{word} /{ipa}/：F1 {f1} Hz · F2 {f2} Hz · F3 {f3} Hz',
    s1er: '注意 heard /ɝ/ 的 F3 只有 {f3} Hz，明显低于其他 9 个元音（都 ≥ {min} Hz）：这和下面讲义所说「/ɝ/ 不能只靠 F1、F2 解释」对得上。',
    s1hint: '数据里能直接看到：heed 和 who\'d 的 F1 最低，had 和 hod 的 F1 最高；heed 的 F2 最高，hawed 的 F2 最低。一门课程讲义对 Peterson 与 Barney 的概括是：除 /ɝ/ 外，美式英语元音大体可以用 F1、F2 解释，相邻元音的区域边界略有重叠（见 BRIEF 来源）。这里画的是平均值，单个录音会散布在点的周围。',

    s2k: '第 2 步 · 换一个人说', s2t: '同一个元音，三组说话人落在不同位置',
    s2e: '这一步要回答：男人、女人、孩子说同一个词，点会重合吗？打开三组<strong>说话人组</strong>：男性 33 人、女性 28 人、儿童 15 人（其中 8 名女孩；儿童每个元音只有 30 个录音）。每组外围的 7 个元音连成一圈（hud、hood、heard 在圈内，只画点）。',
    s2readout: '{word} /{ipa}/ 的 F1 / F2（Hz）：男性 {m1} / {m2} · 女性 {w1} / {w2} · 儿童 {c1} / {c2}　→ 儿童 ÷ 男性：F1 ×{r1}，F2 ×{r2}',
    s2hint: '观察顺序：三组全开，看三圈形状相似、但女性和儿童整体往左下方（F1、F2 都更高）挪了。再换几个词，看「儿童 ÷ 男性」的倍数：大多在 1.2–1.5 之间，但并不完全相同。注意儿童组混有男孩和女孩，人数也最少。',
    show: '显示',

    s3k: '第 3 步 · 只看绝对频率', s3t: '拿男性的 10 个点当模板，去认别人的元音',
    s3e: '这一步要回答：如果只按绝对频率，把一个点认成离它最近的那个元音，会怎样？把男性的 10 个平均点当成<strong>模板</strong>；对女性或儿童的每个元音平均点，找<strong>最近的男性模板</strong>（在对数 F1–F2 平面上量直线距离），箭头指向它。认对是绿色，认错是红色。',
    s3readout: '{group}的 10 个元音平均点：{ok} 个认对，{bad} 个认错{list}',
    s3hint: '对儿童：10 个只认对 3 个，比如儿童的 hid 落到了男性 head 的旁边。说明「F1 = 530 Hz」这个绝对数字本身不告诉你是哪个元音——还要知道是谁在说。',
    asWord: '认成',

    s4k: '第 4 步 · 先看这个人的整体', s4t: '把每组按自己的整体高低缩放，三圈就叠到一起',
    s4e: '这一步要回答：怎样把「谁在说」的影响去掉？本页用一种简单的<strong>归一化</strong>：对每组说话人，先算它 10 个元音 F1 的<strong>几何平均</strong>（相乘再开 10 次方），再把这组所有 F1 都按「本组几何平均 ÷ 男性几何平均」缩小，F2 同样处理。在对数刻度上，这就是把整圈平移。滑杆 λ 从 0（不缩放）到 1（完全缩放）。',
    lambda: '缩放程度 λ',
    s4readout: 'λ = {l} · 女性：与男性同一元音的平均距离 {dw}，认对 {okw}/10 · 儿童：平均距离 {dc}，认对 {okc}/10',
    s4hint: '观察顺序：把 λ 从 0 慢慢拖到 1，看女性和儿童的两圈怎样向男性那一圈平移、红箭头逐个变绿：λ = 1 时两组都是 10/10。距离用对数单位，0.1 约等于差 10%。',

    s5k: '收束', s5t: '元音是平面上的位置，但坐标要先按说话人校准',
    s5fin: '一个元音的音高由<strong>基频</strong>定，元音本身主要由<strong>前两个共振峰</strong>的位置区分；在 F1–F2 平面上，10 个元音排成一圈。不同说话人的整圈高低不同，所以单看绝对频率会认错；先按这个人的整体缩放，再比较位置，三组的平均点就能对上。',
    formula: '缩放后 F = F × (男性几何平均 ÷ 本组几何平均)，F1、F2 分别计算',
    boundary: '模型边界：本页用的是每组 10 个元音的平均值，不是单个录音，真实录音会互相重叠；归一化用到了这组人全部 10 个元音，现实中听者并不一定事先听过一个人说全部元音。数据是 1952 年美国的录音、以 hVd 词读出；本页没有声音，也没有讨论听者实际怎样做到这一点。',
    quizPrompt: '儿童的 hid 平均点被男性模板认成 head，最好的解释是？',
    quizA: '孩子把 hid 读错了。', quizB: '儿童所有元音的 F1、F2 整体偏高，单看绝对频率就落进男性另一个元音附近；按本组整体缩放后就认对了。', quizC: '区分元音主要靠 F3，所以只看 F1、F2 一定会错。',
    check: '检查判断', correct: '正确：问题在于没先扣掉「谁在说」，而不是读错。', wrong: '再看第 4 步：λ 拖到 1 后，儿童的 hid 指向哪里？',
    lk1: '↗ 语音与音位第 0 步：元音之外，辅音靠发音动作区分',
    lk2: '↗ 语音与音位第 1 步：最小对立——heed 和 hid 只差一个元音',
    lk3: '↗ 共振第 3 步：为什么只有某些频率被放大',
    lk4: '↗ 傅里叶第 5 步：把一个声音拆成频谱',
    foot: 'visual.integ.life · 元音空间 Vowel Space',
  },
  en: {
    pageTitle: 'Vowel Space · Placing Vowels by Two Formants',
    back: '← Knowledge index',
    navLabel: 'Vowel space steps',
    tagline: 'When a man, a woman and a child say “heed”, the absolute frequencies differ a lot, yet we hear the same vowel. Using the 1520 vowels Peterson and Barney measured in 1952, this page shows how vowels spread out on a plane of two formants, and why you have to rescale by speaker before they line up.',
    nav0: '0 Formants', nav1: '1 F1–F2 plane', nav2: '2 Three speaker groups', nav3: '3 Recognise with men’s template', nav4: '4 Rescale', nav5: '5 Wrap-up',
    gm: 'Men', gw: 'Women', gc: 'Children',

    s0k: 'Step 0 · What is inside a vowel', s0t: 'F0 sets the pitch; the formants set the vowel',
    s0e: 'This step asks: which numbers in the sound of a vowel decide which vowel it is? A voiced sound repeats F0 times a second; this <strong>fundamental frequency F0</strong> is heard as pitch. The sound also contains <strong>harmonics</strong> at F0, 2F0, 3F0, … (vertical lines; <a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier, step 5: from waveform to spectrum</a>). The vocal tract from larynx to lips acts as a set of resonators that boost harmonics near certain frequencies; these boosted peaks are the <strong>formants</strong>, numbered F1, F2, F3 from low to high (<a class="xlink" href="../../../physics/waves/resonance/#step3">→ Resonance, step 3: the resonance curve</a>). Pick a word and a speaker group and look at where the harmonics and peaks are.',
    s0readout: '{word} /{ipa}/ · {group} average: F0 {f0} Hz · F1 {f1} · F2 {f2} · F3 {f3} Hz (mean of {n} recordings)',
    s0hint: 'What to do: keep “heed” and switch between men and children — the spacing of the lines (harmonics) widens from about 136 Hz to about 270 Hz and the peaks shift right. Then keep men and switch between “heed” and “hod”: the harmonic spacing only changes from 136 to 124 Hz, but the peaks change place. The peak shape is this page’s schematic drawing; only F0 and the positions of F1–F3 are data.',
    freqAxis: 'frequency Hz', ampAxis: 'relative level (schematic)',

    s1k: 'Step 1 · Two numbers, one point', s1t: 'Draw each vowel as a point on the F1–F2 plane',
    s1e: 'This step asks: using only the first two formants, can the ten vowels be told apart? Each point is the average (F1, F2) of one vowel over the 33 men. On the <strong>F1–F2 plane</strong> the horizontal axis is F2 and the vertical axis is F1. This page chooses to let F2 increase from right to left and F1 increase downwards, and uses a <strong>log scale</strong> on both axes (equal distances mean equal ratios; <a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ Exponents & logarithms, step 3: logs turn multiplication into addition</a>). Click a word to see where it sits.',
    s1readout: '{word} /{ipa}/: F1 {f1} Hz · F2 {f2} Hz · F3 {f3} Hz',
    s1er: 'Note that the F3 of “heard” /ɝ/ is only {f3} Hz, clearly below the other nine vowels (all ≥ {min} Hz): this fits the handout’s remark below that /ɝ/ is the exception to “F1 and F2 explain the vowels”.',
    s1hint: 'You can read straight off the data: “heed” and “who’d” have the lowest F1, “had” and “hod” the highest; “heed” has the highest F2 and “hawed” the lowest. A course handout summarises Peterson and Barney as showing that, except for /ɝ/, American English vowels can largely be explained by F1 and F2, with a little overlap at the boundaries between neighbouring vowels (see BRIEF for the source). These are averages; single recordings scatter around each point.',

    s2k: 'Step 2 · Someone else says it', s2t: 'The same vowel lands in different places for three speaker groups',
    s2e: 'This step asks: when a man, a woman and a child say the same word, do the points coincide? Turn on the three <strong>speaker groups</strong>: 33 men, 28 women and 15 children (8 of them girls; the children have only 30 recordings per vowel). Each group’s seven outer vowels are joined into a loop (“hud”, “hood” and “heard” sit inside and are drawn as dots only).',
    s2readout: '{word} /{ipa}/ F1 / F2 (Hz): men {m1} / {m2} · women {w1} / {w2} · children {c1} / {c2}　→ children ÷ men: F1 ×{r1}, F2 ×{r2}',
    s2hint: 'What to do: with all three groups on, see that the three loops have a similar shape but the women’s and children’s loops sit further down and left (higher F1 and F2). Try a few words and read the “children ÷ men” ratios: most are between 1.2 and 1.5, but they are not all the same. Note that the children’s group mixes boys and girls and is the smallest.',
    show: 'Show',

    s3k: 'Step 3 · Absolute frequency only', s3t: 'Use the men’s ten points as templates to recognise other speakers’ vowels',
    s3e: 'This step asks: if you label a point as whichever vowel is closest by absolute frequency, what happens? Treat the men’s ten average points as <strong>templates</strong>. For each of the women’s or children’s vowel averages, find the <strong>nearest men’s template</strong> (straight-line distance on the log F1–F2 plane); the arrow points to it. Green means recognised correctly, red means wrong.',
    s3readout: '{group}’s ten vowel averages: {ok} correct, {bad} wrong{list}',
    s3hint: 'For children only 3 of 10 are right; for example the children’s “hid” lands next to the men’s “head”. So the number “F1 = 530 Hz” on its own does not tell you which vowel it is — you also need to know who is speaking.',
    asWord: 'as',

    s4k: 'Step 4 · Look at the speaker as a whole first', s4t: 'Rescale each group by its own overall level and the loops overlap',
    s4e: 'This step asks: how can you remove the effect of who is speaking? This page uses a simple <strong>normalisation</strong>: for each speaker group, compute the <strong>geometric mean</strong> of its ten F1 values (multiply them and take the 10th root), then scale all that group’s F1 values by “men’s geometric mean ÷ this group’s geometric mean”; F2 likewise. On a log scale this just slides the whole loop. The slider λ goes from 0 (no rescaling) to 1 (full rescaling).',
    lambda: 'Rescaling λ',
    s4readout: 'λ = {l} · women: mean distance to the men’s same vowel {dw}, correct {okw}/10 · children: mean distance {dc}, correct {okc}/10',
    s4hint: 'What to do: drag λ slowly from 0 to 1 and watch the women’s and children’s loops slide onto the men’s and the red arrows turn green one by one: at λ = 1 both groups are 10/10. Distances are in log units; 0.1 is roughly a 10% difference.',

    s5k: 'Wrap-up', s5t: 'A vowel is a position on a plane — after calibrating for the speaker',
    s5fin: 'A vowel’s pitch is set by the <strong>fundamental frequency</strong>; the vowel itself is mainly told apart by the positions of the <strong>first two formants</strong>, and on the F1–F2 plane the ten vowels form a loop. Different speakers’ loops sit at different overall levels, so absolute frequency alone misleads; rescale by the speaker’s overall level first, then compare positions, and the three groups’ averages line up.',
    formula: 'rescaled F = F × (men’s geometric mean ÷ this group’s geometric mean), separately for F1 and F2',
    boundary: 'Model limits: the page uses each group’s ten vowel averages, not single recordings, and real recordings overlap; the normalisation uses all ten vowels of a group, whereas a real listener has not necessarily heard a speaker say every vowel. The data are American recordings from 1952 of hVd words; the page has no audio and does not address how listeners actually do this.',
    quizPrompt: 'The children’s average for “hid” is recognised by the men’s templates as “head”. What is the best explanation?',
    quizA: 'The children mispronounced “hid”.', quizB: 'All of the children’s F1 and F2 values are higher overall, so by absolute frequency they land near a different men’s vowel; after rescaling by the group’s overall level they are recognised correctly.', quizC: 'Vowels are told apart mainly by F3, so F1 and F2 alone must fail.',
    check: 'Check', correct: 'Right: the problem is not removing “who is speaking” first, not a mispronunciation.', wrong: 'Look at step 4 again: at λ = 1, where does the children’s “hid” point?',
    lk1: '↗ Speech sounds, step 0: consonants are told apart by articulation',
    lk2: '↗ Speech sounds, step 1: minimal pairs — “heed” and “hid” differ in one vowel',
    lk3: '↗ Resonance, step 3: why only some frequencies are boosted',
    lk4: '↗ Fourier, step 5: splitting a sound into its spectrum',
    foot: 'visual.integ.life · Vowel Space',
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
  if (typeof window.refreshVowel === 'function') window.refreshVowel();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.VOWEL_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
