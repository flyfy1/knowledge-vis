'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "化学",
    stageBadge: "初中",
    foot: "溶解与饱和 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '溶解与饱和 · 糖一勺勺加，搅到某个点再也不化',
    pageTitle: '溶解与饱和',
    tagline: '一勺勺往水里加盐，开始全化掉，加到某个点再也不化——这个「装满」的状态叫饱和，它不是不动了，而是溶解和结晶一样快。',
    nav0: '0 加到不化', nav1: '1 热了多化', nav2: '2 动态平衡', nav3: '3 多浓才算饱', nav4: '4 把晶体取出', nav5: '5 收束',
    solNaCl: '食盐 NaCl', solKNO3: '硝酸钾 KNO₃',
    unitG: 'g', unitC: '℃', unitS: 's', unitGs: 'g/s', unitPer100: 'g / 100 g 水',
    lblDis: '已溶解', lblUnd: '没溶解的固体', lblRate: '速率 (g/s)', lblAmt: '质量 (g)', lblRd: '溶解速率', lblRp: '结晶速率', lblCr: '析出晶体',
    s0k: '第 0 步 · 加到不化',
    s0t: '一勺勺加盐，到哪一勺开始再也不化？',
    s0e: '这一步要回答：往 100 g 20 ℃ 的水里一勺勺加盐（每勺 5 g），到第几勺开始有盐沉在杯底？<strong>溶解</strong>是固体的小颗粒分散进水里；<strong>溶解度</strong>是一定温度下 100 g 水最多能溶解的该物质质量（g）；加到溶解不了更多就叫<strong>饱和溶液</strong>。每按一次「加一勺」，看溶解的点和沉底的固体怎么变。',
    s0stage: '烧杯：分散在水里的点是已溶解的盐，杯底的白色颗粒是没溶解的盐（20 ℃，100 g 水）',
    s0canvas: '烧杯示意图：加盐后水中点数增加，加到饱和后杯底开始堆积未溶解的盐',
    s0add: '加一勺盐（+5 g）', s0reset: '倒掉重来',
    s0ro: '已加 {n} 勺 = {added} g；溶解 {dis} g，杯底剩 {und} g；{state}',
    s0unsat: '还没饱和，还能再溶解 {room} g。',
    s0sat: '饱和了：20 ℃ 时 100 g 水最多溶解 {S} g，再加的盐只能沉在底下。',
    s0result: '结论：溶解有上限，上限就是溶解度；超出上限的盐不溶。条件：本页水量 100 g、温度 20 ℃，溶解度由表内插值得到，数据为近似值。',
    s1k: '第 1 步 · 热了多化',
    s1t: '温度升高，能溶解的更多吗？',
    s1e: '这一步要回答：同样 60 g 溶质放进 100 g 水里，温度改变，溶解度和沉底的量怎么变？左图是溶解度曲线（横轴温度，纵轴 100 g 水最多溶解的克数），右图是烧杯。拖温度，再换一种物质比较：有的受温度影响很大，有的几乎没变。',
    s1stage: '溶解度曲线：横轴温度（℃），纵轴溶解度（g / 100 g 水）；橙点是当前温度；烧杯里放了 60 g 溶质、100 g 水',
    s1canvas: '两种物质的溶解度曲线与烧杯：硝酸钾随温度陡升，食盐几乎不变',
    s1sol: '溶质', s1T: '温度',
    s1ro: '{sol}：{T} ℃ 时溶解度 {S} g / 100 g 水；60 g 里溶解 {dis} g，沉底 {und} g。',
    s1result: '结论：多数固体温度越高溶解度越大，但程度因物质而异（硝酸钾陡，食盐平）。条件：数据取自常见溶解度表的近似折线；个别物质（如熟石灰）反而随温度降低。',
    s2k: '第 2 步 · 动态平衡',
    s2t: '饱和以后，溶解停了吗？',
    s2e: '这一步要回答：杯底还有固体、溶液已饱和时，溶解真的停了吗？模型：固体表面不断往水里溶解（速率 kd，g/s），溶液里的颗粒也不断回到固体表面结晶（速率与浓度成正比）。<strong>动态平衡</strong>指两个相反的过程速率相等，宏观上不再变化。按「开始」，看两条速率线靠拢，以及杯里的量停止变化。',
    s2stage: '上：两条速率线（溶解 / 结晶，g/s）随时间靠拢；下：溶解量与剩余固体量（g）随时间的变化',
    s2canvas: '随时间展开的曲线：溶解速率和结晶速率靠拢到相等，溶解量趋于定值',
    s2m: '放入的固体总量', s2run: '开始', s2pause: '暂停', s2reset: '重来',
    s2ro: '第 {t} s：溶解速率 {rd} g/s，结晶速率 {rp} g/s；已溶解 {c} g，剩余固体 {m} g。{state}',
    s2net: '溶解比结晶快，溶液还在变浓。',
    s2eq: '两个速率相等：动态平衡，饱和——两个过程都没停，只是互相抵消。',
    s2none: '固体已全部溶完（放入量没超过溶解度），溶液没饱和，不再有结晶。',
    s2result: '结论：饱和 = 溶解与结晶速率相等（动态平衡），不是静止。条件：一阶速率模型，kc = 0.08 /s 取教学值；动画 1 s 对应模型 4 s。',
    s3k: '第 3 步 · 多浓才算饱',
    s3t: '怎么用一个数说清溶液有多浓，什么时候饱和？',
    s3e: '这一步要回答：溶液有多浓，怎么判断饱和没饱和？<strong>溶质质量分数</strong> = 已溶解的溶质质量 ÷ 溶液总质量（溶质 + 水）。拖溶质质量和水量，选物质和温度：溶质多于「溶解度 × 水量 ÷ 100」时，多的部分沉底，溶液浓度停在饱和值。',
    s3stage: '左：烧杯颜色越深越浓；右：竖条是浓度，横线是该温度下的饱和浓度',
    s3canvas: '烧杯和浓度竖条：浓度随溶质增加上升，到饱和线后不再上升',
    s3sol: '溶质', s3T: '温度', s3m: '溶质质量', s3w: '水的质量',
    s3ro: '溶解 {dis} g，沉底 {und} g；溶液质量分数 {w}%，该温度饱和值 {ws}%；{state}',
    s3unsat: '不饱和：还能再溶解 {room} g。',
    s3sat: '正好饱和。',
    s3over: '饱和，且还有 {und} g 沉在底下。',
    s3result: '结论：饱和溶液的质量分数 = S ÷ (100 + S)，只由溶解度（温度和物质）决定，与水量多少无关。条件：S 为本页近似数据；本页不讨论过饱和。',
    s4k: '第 4 步 · 把晶体取出',
    s4t: '怎样把溶在水里的物质重新取出来？',
    s4e: '这一步要回答：想从饱和溶液里得到晶体，该降温还是蒸发？起点：80 ℃ 时 100 g 水里溶了刚好饱和量的溶质。<strong>降温</strong>使溶解度变小，多出的溶质结晶；<strong>蒸发</strong>是水变少，能溶的也少了。选物质，拖温度降下来，再按几次「蒸发 10 g 水」。',
    s4stage: '烧杯：杯底的晶体是析出量；右侧读数给出水量、溶解度、析出晶体',
    s4canvas: '饱和溶液降温或蒸发后，杯底晶体越积越多',
    s4sol: '溶质', s4T: '降到的温度', s4evap: '蒸发 10 g 水', s4reset: '回到 80 ℃ 饱和',
    s4ro: '{sol}：开始溶解 {d0} g；现在 {T} ℃、水 {w} g，溶解度 {S} g/100 g，最多溶 {cap} g，析出晶体 {cr} g。',
    s4hint: '提示：硝酸钾降温就析出很多；食盐降温几乎不出，要靠蒸发。',
    s4result: '结论：溶解度随温度陡升的物质宜降温结晶，随温度变化小的宜蒸发结晶。条件：数据为近似折线，忽略结晶水与过饱和。',
    s5k: '第 5 步 · 收束', s5t: '把溶解和饱和说给别人听',
    s5e: '一定温度下、一定量的水里，某物质能溶的有上限；到上限就是饱和，此时溶解和结晶还在进行，只是速率相等。',
    f1t: '上限', f1b: '溶解度：一定温度下 100 g 水最多溶解的克数；超出的沉底（第 0–1 步）。',
    f2t: '动态', f2b: '饱和是溶解与结晶速率相等的动态平衡，不是停了（第 2 步）。',
    f3t: '取出', f3b: '降温或蒸发都会让溶解不了的部分析出晶体，用哪种看溶解度怎么随温度变（第 4 步）。',
    modelT: '模型实话',
    model1: '溶解度取常见表值的线性插值，是近似；真实曲线是弯的，数据随资料略有差异。',
    model2: '第 2 步是一阶速率玩具模型，用来演示「速率靠拢到相等」，不是真实溶解动力学。',
    model3: '本页不含过饱和、结晶水、溶解放热吸热与离子相互作用。',
    nextT: '继续看（站内）',
    l1: '化学平衡 · 第 0 步：正反两个过程速率相等的更一般图景',
    l2: '粒子与物态 · 第 3 步：表面的粒子怎样离开（和溶解是相反的方向）',
    l3: '反应速率 · 第 0 步：速率由什么决定'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Chemistry",
    stageBadge: "Junior High",
    foot: "Dissolution & Saturation · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Dissolution & Saturation · Keep Adding, Until It Stops Dissolving',
    pageTitle: 'Dissolution & Saturation',
    tagline: 'Add salt to water spoon by spoon: at first it all disappears, then at some point it will not dissolve any more. That “full” state is saturation — not frozen, but dissolving and crystallising at the same speed.',
    nav0: '0 Until it stops', nav1: '1 Hotter, more', nav2: '2 Dynamic balance', nav3: '3 How concentrated', nav4: '4 Get crystals out', nav5: '5 Recap',
    solNaCl: 'Table salt NaCl', solKNO3: 'Potassium nitrate KNO₃',
    unitG: 'g', unitC: '°C', unitS: 's', unitGs: 'g/s', unitPer100: 'g per 100 g water',
    lblDis: 'Dissolved', lblUnd: 'Undissolved solid', lblRate: 'Rate (g/s)', lblAmt: 'Mass (g)', lblRd: 'Dissolving rate', lblRp: 'Crystallising rate', lblCr: 'Crystals out',
    s0k: 'Step 0 · Until it stops',
    s0t: 'Adding salt spoon by spoon, when does it stop dissolving?',
    s0e: 'This step asks: add salt (5 g a spoon) to 100 g of water at 20 °C — at which spoon does salt start to sit on the bottom? <strong>Dissolving</strong> means solid particles spreading out through the water; <strong>solubility</strong> is the most of a substance, in grams, that 100 g of water can dissolve at a given temperature; once no more will dissolve the liquid is a <strong>saturated solution</strong>. Press “Add a spoon” and watch the dissolved dots and the solid on the bottom.',
    s0stage: 'Beaker: dots spread in the water are dissolved salt, white grains on the bottom are undissolved salt (20 °C, 100 g water)',
    s0canvas: 'Beaker diagram: dots in the water increase with each spoon; past saturation salt piles on the bottom',
    s0add: 'Add a spoon of salt (+5 g)', s0reset: 'Empty and start over',
    s0ro: '{n} spoons = {added} g added; {dis} g dissolved, {und} g left on the bottom; {state}',
    s0unsat: 'not saturated yet, room for {room} g more.',
    s0sat: 'saturated: at 20 °C 100 g of water dissolves at most {S} g; anything more just sinks.',
    s0result: 'Takeaway: dissolving has a ceiling, the solubility; salt beyond it stays solid. Holds for 100 g of water at 20 °C here; solubility is interpolated from a table, so values are approximate.',
    s1k: 'Step 1 · Hotter, more',
    s1t: 'Does a higher temperature dissolve more?',
    s1e: 'This step asks: put the same 60 g of solute in 100 g of water — how do solubility and the amount on the bottom change with temperature? The left chart is the solubility curve (x: temperature, y: most grams that 100 g of water dissolves); the right is the beaker. Drag the temperature, then switch substances: some depend strongly on temperature, some hardly at all.',
    s1stage: 'Solubility curves: x temperature (°C), y solubility (g per 100 g water); the orange dot is the current temperature; the beaker holds 60 g solute and 100 g water',
    s1canvas: 'Solubility curves for two substances and a beaker: potassium nitrate climbs steeply, table salt barely changes',
    s1sol: 'Solute', s1T: 'Temperature',
    s1ro: '{sol}: at {T} °C the solubility is {S} g per 100 g water; of the 60 g, {dis} g dissolve and {und} g sit on the bottom.',
    s1result: 'Takeaway: for most solids a higher temperature means higher solubility, but by very different amounts (steep for KNO₃, flat for salt). Data are a simple polyline through typical table values; a few substances (like slaked lime) behave the opposite way.',
    s2k: 'Step 2 · Dynamic balance',
    s2t: 'Once saturated, has dissolving stopped?',
    s2e: 'This step asks: with solid on the bottom and a saturated solution, has dissolving really stopped? Model: the solid’s surface keeps dissolving into the water (rate kd, g/s), and particles in the water keep returning to the solid surface (rate proportional to concentration). <strong>Dynamic equilibrium</strong> means two opposite processes run at equal rates, so nothing changes on the large scale. Press “Start” and watch the two rate lines close in while the amounts level off.',
    s2stage: 'Top: two rate lines (dissolving / crystallising, g/s) closing in over time; bottom: dissolved amount and remaining solid (g) over time',
    s2canvas: 'Time curves: dissolving and crystallising rates converge to equal and the dissolved amount levels off',
    s2m: 'Total solid put in', s2run: 'Start', s2pause: 'Pause', s2reset: 'Start over',
    s2ro: 't = {t} s: dissolving {rd} g/s, crystallising {rp} g/s; dissolved {c} g, solid left {m} g. {state}',
    s2net: 'Dissolving is faster than crystallising, so the solution is still getting stronger.',
    s2eq: 'The two rates are equal: dynamic equilibrium, saturated — neither process has stopped, they cancel.',
    s2none: 'All the solid has dissolved (you did not exceed the solubility), so the solution is unsaturated and nothing crystallises.',
    s2result: 'Takeaway: saturated = dissolving and crystallising at equal rates (dynamic equilibrium), not standing still. Holds in a first-order rate model with kc = 0.08 /s chosen for teaching; the animation runs 4 model seconds per real second.',
    s3k: 'Step 3 · How concentrated',
    s3t: 'How can one number say how strong a solution is and when it is saturated?',
    s3e: 'This step asks: how do you judge how concentrated a solution is and whether it is saturated? <strong>Mass fraction of solute</strong> = dissolved solute mass ÷ total solution mass (solute + water). Drag the solute mass and water mass and pick a substance and temperature: if there is more solute than “solubility × water ÷ 100”, the excess sinks and the concentration stops at the saturation value.',
    s3stage: 'Left: darker beaker = stronger; right: the vertical bar is concentration and the line is the saturation level at this temperature',
    s3canvas: 'Beaker and concentration bar: concentration rises with solute until the saturation line, then stops',
    s3sol: 'Solute', s3T: 'Temperature', s3m: 'Solute mass', s3w: 'Water mass',
    s3ro: '{dis} g dissolved, {und} g on the bottom; mass fraction {w}%, saturation value at this temperature {ws}%; {state}',
    s3unsat: 'unsaturated: room for {room} g more.',
    s3sat: 'exactly saturated.',
    s3over: 'saturated, with {und} g still on the bottom.',
    s3result: 'Takeaway: a saturated solution has mass fraction S ÷ (100 + S), set by solubility alone (substance and temperature) and independent of the amount of water. S here is approximate; supersaturation is not covered.',
    s4k: 'Step 4 · Get crystals out',
    s4t: 'How do you get a dissolved substance back out?',
    s4e: 'This step asks: to get crystals from a saturated solution, should you cool it or evaporate it? Start: 100 g of water at 80 °C holding exactly the saturated amount. <strong>Cooling</strong> lowers the solubility, so the excess crystallises; <strong>evaporating</strong> removes water, so less can stay dissolved. Pick a substance, drag the temperature down, and press “Evaporate 10 g of water” a few times.',
    s4stage: 'Beaker: crystals on the bottom are the amount that has come out; the readout lists water, solubility and crystals',
    s4canvas: 'A saturated solution cooled or evaporated: crystals pile up on the bottom',
    s4sol: 'Solute', s4T: 'Cooled down to', s4evap: 'Evaporate 10 g water', s4reset: 'Back to saturated at 80 °C',
    s4ro: '{sol}: started with {d0} g dissolved; now {T} °C, {w} g of water, solubility {S} g/100 g, at most {cap} g can stay dissolved, crystals out {cr} g.',
    s4hint: 'Hint: KNO₃ gives lots of crystals just by cooling; salt barely does, so use evaporation.',
    s4result: 'Takeaway: substances whose solubility climbs steeply with temperature suit cooling crystallisation; those that barely change suit evaporation. Data are a simple polyline; water of crystallisation and supersaturation are ignored.',
    s5k: 'Step 5 · Recap', s5t: 'Explain dissolving and saturation to a friend',
    s5e: 'At a given temperature, a given amount of water can hold only so much of a substance; at that limit it is saturated, and dissolving and crystallising still go on at equal rates.',
    f1t: 'A ceiling', f1b: 'Solubility: the most grams 100 g of water dissolves at one temperature; the rest sinks (steps 0–1).',
    f2t: 'Dynamic', f2b: 'Saturation is a dynamic equilibrium of equal dissolving and crystallising rates, not a stop (step 2).',
    f3t: 'Getting it out', f3b: 'Cooling or evaporating leaves too much to stay dissolved, so crystals form; which one suits depends on the solubility curve (step 4).',
    modelT: 'Honest model notes',
    model1: 'Solubility is a linear interpolation of typical table values — approximate; real curves bend and sources differ slightly.',
    model2: 'Step 2 is a first-order toy model to show rates converging to equality, not real dissolution kinetics.',
    model3: 'Supersaturation, water of crystallisation, heat of solution and ionic interactions are not covered.',
    nextT: 'Keep going (on this site)',
    l1: 'Chemical Equilibrium · step 0: the more general picture of two opposite rates equalising',
    l2: 'Particles & States · step 3: how surface particles escape (the opposite direction from dissolving)',
    l3: 'Reaction Rates · step 0: what sets a rate'
  }
};
let currentLang = null;
function getLang() {
  if (currentLang) return currentLang;
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'zh' || saved === 'en') return currentLang = saved;
  } catch (e) { /* in-memory fallback */ }
  return currentLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
function t(key, params) {
  const p = params || {};
  return STR[getLang()][key].replace(/\{(\w+)\}/g, (_, n) => String(p[n]));
}
function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('knowledge-lang', lang); } catch (e) { /* keep currentLang */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(el => {
    const on = el.dataset.lang === lang;
    el.classList.toggle('active', on);
    el.setAttribute('aria-pressed', String(on));
  });
  if (typeof window.onLang === 'function') window.onLang();
}
getLang();
if (typeof module !== 'undefined') module.exports = { STR };
