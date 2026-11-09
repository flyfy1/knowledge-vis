'use strict';
// Author: Claude Code (claude-opus-5-5), 2026-11-08.

const STRINGS = {
  zh: {
    pageTitle: '无知之幕 · 不知道自己会是谁时，你选哪种社会',
    back: '← 知识索引',
    navLabel: '无知之幕步骤导航',
    tagline: '如果你得先选一种社会，然后才知道自己会落在其中哪个位置，你会怎么选？罗尔斯和海萨尼都从这个设想出发，却得出了不同的规则：一个看最差的位置，一个看平均。',
    nav0: '0 先选再抽', nav1: '1 平均原则', nav2: '2 最大最小', nav3: '3 风险态度', nav4: '4 拉平的代价', nav5: '5 收束',

    s0k: '第 0 步 · 一个思想实验', s0t: '先选社会，再揭开幕布看自己是谁',
    s0e: '这一步要回答：不知道自己会是谁时，选择会变成什么样的问题？哲学家罗尔斯（John Rawls，《正义论》，1971）设想一层<strong>无知之幕</strong>：选择社会规则的人不知道自己的阶层、财富、社会地位。下面三种社会各有 5 个人数相同的<strong>位置</strong>，柱子高度是该位置的<strong>福祉分</strong>（本页虚构的抽象单位，不是钱）。选一种社会，再按「揭开幕布」，随机落到一个位置。',
    soc: '社会', socA: 'A · 人人一样', socB: 'B · 高增长、差距大', socC: 'C · 托底的增长',
    choose: '我选', lift: '揭开幕布', again: '再来一次', resetDraws: '清空记录',
    s0pick: '先选一种社会。',
    s0readout: '你选了 {soc}，这次落在第 {pos} 位（从最差数起），福祉分 {v}。已抽 {n} 次，平均 {avg}，最差一次 {worst}。',
    s0ready: '你选了 {soc}。按「揭开幕布」看你落在哪。',
    s0hint: '每抽一次，对应位置下方就多一个点（历史保留；换一种社会再换回来，原来的记录还在，「清空记录」只清当前社会）。多抽几次，你会同时感到两件事：「平均下来不错」和「万一落在最底下」。下面两步分别把这两种想法写成规则。',

    s1k: '第 1 步 · 第一种规则', s1t: '平均原则：既然谁都可能是，就算平均',
    s1e: '这一步要回答：如果你落在每个位置的机会一样大，该怎么比较？经济学家海萨尼（John Harsanyi，1975 年批评罗尔斯的论文）主张：完全不知道时，就假设落在每个位置的<strong>概率相等</strong>，于是该选<strong>平均福祉</strong>最高的社会（<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ 期望值第 0 步：随机游戏「平均」能拿多少</a>）。按这个规则，B（平均 45）胜出。下图是从所选社会里反复抽取时，<strong>累计平均</strong>（抽到的分数之和 ÷ 次数）怎样走向这个平均值。',
    draw100: '再抽 100 次', s1readout: '{soc}：平均 {mean} · 已抽 {n} 次，累计平均 {run}',
    s1hint: '观察顺序：选 B，连按几次「再抽 100 次」，看折线怎样越来越贴近虚线（平均值）。再换成 A、C 比较。平均原则只看这条虚线，不看折线一路上抽到过多低的分数。',

    s2k: '第 2 步 · 第二种规则', s2t: '最大最小原则：先保证最差的位置',
    s2e: '这一步要回答：如果这个选择只做一次、改不了，还该只看平均吗？罗尔斯认为，幕后的选择决定你一生的前景、无法重来，所以应采用<strong>最大最小原则</strong>（maximin）：比较各个社会<strong>最差位置</strong>的福祉，选最差位置最好的那个。他给出三条适用条件：没有或只有很不可靠的依据去估计自己落在哪个位置的概率；最大最小原则选出的结果本身是可以接受、能够与之共处的，比它多出来的收益不那么要紧；而别的选项有无法接受、无法与之共处的坏结果。罗尔斯后来说，第一条作用较小，关键在后两条。按这个规则，A（最差 30）胜出，B 的最差只有 10。',
    s2readout: '最差位置：A {a} · B {b} · C {c} → 最大最小原则选 {win}；平均原则选 {avgWin}',
    s2hint: '图中红框标出每个社会的最差位置。两条规则面对同样三张图，选出了不同的社会：分歧不在数据，而在「怎么对待自己可能落到底」。',

    s3k: '第 3 步 · 把两者接起来', s3t: '风险态度 η：从「只看平均」到「只看最差」',
    s3e: '这一步要回答：两条规则之间有没有中间地带？这里用一个<strong>教学用的旋钮</strong>（不是罗尔斯或海萨尼本人的提法）：<strong>风险厌恶程度 η</strong>（eta）。对每个社会算一个<strong>确定性等价</strong>——你愿意用来换掉「随机落到一个位置」的那个确定分数。η = 0 时它就是平均值；η 越大，低分位置的分量越重；η 很大时它接近最差位置。这和「保费高于期望损失仍有人买保险」是同一种心理（<a class="xlink" href="../../../probability/basics/expected-value/#step4">→ 期望值第 4 步</a>）。',
    eta: '风险厌恶 η', s3readout: 'η = {eta} · 确定性等价：A {a} · B {b} · C {c} → 选 {win}',
    s3hint: '观察顺序：把 η 从 0 慢慢拖到 8，看右图竖线扫过三条曲线：先是 B 最高，约 η = 0.8 后 C 最高，约 η = 3.5 后 A 最高。C 这种「托底的增长」只在中间地带胜出。',
    ceAxis: '确定性等价', etaAxis: 'η',

    s4k: '第 4 步 · 拉平有代价时', s4t: '再分配越多，底层越好，但蛋糕可能变小',
    s4e: '这一步要回答：如果可以从 B 出发做再分配，各条规则会选多大力度？设<strong>再分配比例 t</strong>：每个位置交出 t 份福祉，汇总后平均分回。再假设拉平会让总量缩小到原来的 (1 − k·t²)，<strong>效率损失 k</strong> 是本页随手设定的教学参数，不来自任何数据。下图三条线随 t 变化：平均、最差位置、以及当前 η（风险厌恶：越大越看重低分位置）下的确定性等价（愿意用来换掉「随机落到一个位置」的确定分数）；圆点是各自的最好 t。平均原则选平均最高的 t，最大最小原则选最差位置最好的 t。',
    tLabel: '再分配比例 t', kLabel: '效率损失 k（教学假设）', eta4: '风险厌恶 η',
    s4readout: 't = {t}：平均 {mean} · 最差 {min} · 确定性等价 {ce}　｜　最好的 t：平均原则 {tAvg} · 最大最小原则 {tMin} · η = {eta} 时 {tEta}',
    s4hint: '观察顺序：先把 k 设为 0（拉平没有代价）——最大最小原则会一直拉到 t = 1，平均原则无所谓。再把 k 调大，看最大最小原则的最好 t 怎样停在中间：再往下拉，底层也会因蛋糕变小而受损。',
    anyT: '任意 t（各 t 相同）', tieMark: '（并列，显示精度内相同）',
    mean: '平均', worst: '最差', ceShort: '确定性等价', tAxis: '再分配比例 t',
    bars: '当前 t 下的 5 个位置',

    s5k: '收束', s5t: '同一层幕，两种谨慎',
    s5fin: '无知之幕把「对我好不好」变成「对任何一个位置好不好」。<strong>平均原则</strong>把每个位置看得一样可能，求平均；<strong>最大最小原则</strong>认为这次选择不可重来，先保护最差的位置。它们的分歧可以读成对风险的不同态度，但罗尔斯本人强调的是选择情境的特殊性，不只是性格上怕不怕风险。',
    formula: '平均原则：max 平均(x)　最大最小：max 最小(x)　确定性等价（教学）：[平均(x^(1−η))]^(1/(1−η))',
    boundary: '模型边界：社会只有 5 个位置、福祉分是虚构的抽象单位；风险厌恶 η 与效率损失 k 是本页的教学参数，不是罗尔斯或海萨尼的原始表述，也不是对现实社会的估计。页面不声称真实人群在幕后会怎么选。',
    quizPrompt: '下面哪一句准确描述了两条规则的分歧？',
    quizA: '海萨尼认为最差位置不重要，罗尔斯认为平均不重要。', quizB: '海萨尼假设落在每个位置的概率相等、于是求平均；罗尔斯认为这种一次性、决定一生、而别的选项可能坏到无法接受的选择，应先保证最差位置。', quizC: '两人用的数据不同，所以结论不同。',
    check: '检查判断', correct: '正确：分歧在于怎样对待不确定性，而不在数据。', wrong: '再看第 2 步：同样三张图，两条规则为什么选得不同？',
    lk1: '↗ 伦理与决策第 1 步：把期望收益和不确定性分开写',
    lk2: '↗ 伦理与决策第 2 步：「结果更好」不能抹掉被迫承担的伤害',
    lk3: '↗ 期望值第 4 步：保费高于期望损失，为什么还有人买',
    lk4: '↗ 风险分摊第 1 步：把很多人放在一起，人均损失会怎样',
    foot: 'visual.integ.life · 无知之幕 Veil of Ignorance',
    posLabel: '位置',
  },
  en: {
    pageTitle: 'The Veil of Ignorance · Choosing a Society Before You Know Who You Will Be',
    back: '← Knowledge index',
    navLabel: 'Veil of ignorance steps',
    tagline: 'Suppose you must pick a society first and only then learn which position in it you will occupy. How do you choose? Rawls and Harsanyi both start from this picture yet reach different rules: one looks at the worst position, the other at the average.',
    nav0: '0 Choose, then draw', nav1: '1 Average rule', nav2: '2 Maximin', nav3: '3 Risk attitude', nav4: '4 Cost of levelling', nav5: '5 Wrap-up',

    s0k: 'Step 0 · A thought experiment', s0t: 'Choose a society, then lift the veil to see who you are',
    s0e: 'This step asks: what kind of problem does choosing become when you do not know who you will be? The philosopher John Rawls (<em>A Theory of Justice</em>, 1971) imagines a <strong>veil of ignorance</strong>: whoever chooses the rules of society does not know their class, wealth or social status. Each of the three societies below has five equally sized <strong>positions</strong>; bar height is that position’s <strong>well-being score</strong> (an abstract unit invented for this page, not money). Pick a society, then press “Lift the veil” to land in a random position.',
    soc: 'Society', socA: 'A · Everyone equal', socB: 'B · High growth, wide gaps', socC: 'C · Growth with a floor',
    choose: 'I choose', lift: 'Lift the veil', again: 'Again', resetDraws: 'Clear record',
    s0pick: 'Pick a society first.',
    s0readout: 'You chose {soc} and landed in position {pos} (counting from the worst), score {v}. Draws so far: {n}, average {avg}, worst draw {worst}.',
    s0ready: 'You chose {soc}. Press “Lift the veil” to see where you land.',
    s0hint: 'Each draw adds a dot under that position (history is kept; switching to another society and back keeps each society’s record, and “Clear record” clears only the current one). After a few draws you will feel two thoughts at once: “on average it is fine” and “what if I end up at the bottom?”. The next two steps turn each thought into a rule.',

    s1k: 'Step 1 · The first rule', s1t: 'The average rule: you could be anyone, so take the average',
    s1e: 'This step asks: if every position is equally likely to be yours, how should you compare? The economist John Harsanyi (in a 1975 critique of Rawls) argued that under complete ignorance you should assume an <strong>equal probability</strong> of occupying each position, and so choose the society with the highest <strong>average well-being</strong> (<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ Expected value, step 0: what a random game pays “on average”</a>). By this rule B (average 45) wins. The chart shows how the <strong>running average</strong> (sum of scores drawn ÷ number of draws) approaches that average when you draw repeatedly from your chosen society.',
    draw100: 'Draw 100 more', s1readout: '{soc}: average {mean} · draws: {n}, running average {run}',
    s1hint: 'What to do: choose B and press “Draw 100 more” a few times; watch the line settle onto the dashed average. Then switch to A or C. The average rule looks only at the dashed line, not at how low some of the individual draws were.',

    s2k: 'Step 2 · The second rule', s2t: 'Maximin: secure the worst position first',
    s2e: 'This step asks: if the choice is made once and cannot be undone, should you still look only at the average? Rawls argued that the choice behind the veil fixes your whole life prospects and cannot be repeated, so the parties should use the <strong>maximin rule</strong>: compare the well-being of each society’s <strong>worst position</strong> and pick the society whose worst position is best. He gives three conditions for this: there is no basis, or only a very insecure one, for estimating the probability of landing in each position; the maximin choice is itself an acceptable outcome one can live with, so gains above it matter relatively little; and the other options have outcomes one could not accept and live with. Rawls later said the first condition plays a minor role and the second and third are the crucial ones. By this rule A (worst 30) wins; B’s worst is only 10.',
    s2readout: 'Worst position: A {a} · B {b} · C {c} → maximin picks {win}; the average rule picks {avgWin}',
    s2hint: 'Red boxes mark each society’s worst position. Facing the same three charts, the two rules pick different societies: the disagreement is not about the data but about how to treat the chance of ending up at the bottom.',

    s3k: 'Step 3 · Connect the two', s3t: 'Risk attitude η: from “only the average” to “only the worst”',
    s3e: 'This step asks: is there middle ground between the two rules? Here is a <strong>teaching knob</strong> (not Rawls’s or Harsanyi’s own formulation): the <strong>degree of risk aversion η</strong> (eta). For each society compute a <strong>certainty equivalent</strong> — the sure score you would accept in place of landing in a random position. At η = 0 it equals the average; the larger η, the more weight the low positions get; for very large η it approaches the worst position. It is the same attitude that makes people buy insurance priced above the expected loss (<a class="xlink" href="../../../probability/basics/expected-value/#step4">→ Expected value, step 4</a>).',
    eta: 'Risk aversion η', s3readout: 'η = {eta} · certainty equivalent: A {a} · B {b} · C {c} → picks {win}',
    s3hint: 'What to do: drag η slowly from 0 to 8 and watch the vertical line sweep the three curves on the right: B is highest at first, C after about η = 0.8, A after about η = 3.5. C, “growth with a floor”, wins only in the middle ground.',
    ceAxis: 'certainty equivalent', etaAxis: 'η',

    s4k: 'Step 4 · When levelling has a cost', s4t: 'More redistribution helps the bottom — but the pie may shrink',
    s4e: 'This step asks: starting from B, how much redistribution would each rule choose? Let the <strong>redistribution share t</strong> be the fraction of each position’s score that is pooled and shared equally. Suppose levelling shrinks the total by the factor (1 − k·t²); the <strong>efficiency loss k</strong> is a teaching parameter invented for this page, not taken from any data. The chart shows three lines against t: the average, the worst position, and the certainty equivalent (the sure score you would accept instead of a random position) at the current η (risk aversion: the larger, the more the low positions count); dots mark each line’s best t. The average rule picks the t with the highest average; maximin picks the t whose worst position is best.',
    tLabel: 'Redistribution share t', kLabel: 'Efficiency loss k (teaching assumption)', eta4: 'Risk aversion η',
    s4readout: 't = {t}: average {mean} · worst {min} · certainty equivalent {ce}　|　best t: average rule {tAvg} · maximin {tMin} · at η = {eta}: {tEta}',
    s4hint: 'What to do: first set k to 0 (levelling is free) — maximin pushes all the way to t = 1, while the average rule does not care. Then raise k and watch maximin’s best t stop in the middle: levelling further would hurt even the bottom, because the pie shrinks.',
    anyT: 'any t (all tie)', tieMark: ' (tie at display precision)',
    mean: 'average', worst: 'worst', ceShort: 'cert. equiv.', tAxis: 'redistribution share t',
    bars: 'the 5 positions at the current t',

    s5k: 'Wrap-up', s5t: 'One veil, two kinds of caution',
    s5fin: 'The veil of ignorance turns “is this good for me?” into “is this good for whichever position I might hold?”. The <strong>average rule</strong> treats every position as equally likely and averages; the <strong>maximin rule</strong> holds that this choice cannot be repeated and protects the worst position first. Their disagreement can be read as different attitudes to risk, but Rawls himself stresses the special features of the choice situation, not just a temperament that fears risk.',
    formula: 'average rule: max mean(x)　maximin: max min(x)　certainty equivalent (teaching): [mean(x^(1−η))]^(1/(1−η))',
    boundary: 'Model limits: each society has only five positions and the well-being scores are invented abstract units; risk aversion η and efficiency loss k are this page’s teaching parameters, not Rawls’s or Harsanyi’s original statements and not estimates of any real society. The page makes no claim about how real people would choose behind the veil.',
    quizPrompt: 'Which sentence describes the disagreement between the two rules accurately?',
    quizA: 'Harsanyi thinks the worst position does not matter; Rawls thinks the average does not matter.', quizB: 'Harsanyi assumes each position is equally likely and so averages; Rawls holds that a one-off, life-shaping choice, where the other options could turn out unacceptably bad, should secure the worst position first.', quizC: 'They used different data, so they reached different conclusions.',
    check: 'Check', correct: 'Right: the disagreement is about how to treat uncertainty, not about the data.', wrong: 'Look at step 2 again: why do the two rules pick differently from the same three charts?',
    lk1: '↗ Ethics & decisions, step 1: keep expected benefit and uncertainty separate',
    lk2: '↗ Ethics & decisions, step 2: a better outcome does not erase coerced harm',
    lk3: '↗ Expected value, step 4: why people pay premiums above the expected loss',
    lk4: '↗ Risk pooling, step 1: what happens to the average loss when many people pool',
    foot: 'visual.integ.life · The Veil of Ignorance',
    posLabel: 'position',
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
  if (typeof window.refreshVeil === 'function') window.refreshVeil();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.VEIL_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
