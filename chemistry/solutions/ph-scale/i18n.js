'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "化学",
    stageBadge: "初中",
    foot: "pH 标度 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: 'pH 标度 · 从电池酸到肥皂水的一条刻度',
    pageTitle: 'pH 标度',
    tagline: '酸得多厉害、碱得多厉害，用一条 0 到 14 的刻度就能说清——pH 每差 1，酸碱的「劲」差 10 倍。',
    nav0: '0 一条刻度', nav1: '1 差 1 是 10 倍', nav2: '2 指示剂变色', nav3: '3 酸碱中和', nav4: '4 稀释能变碱吗', nav5: '5 收束',
    it0: '电池酸', it1: '柠檬汁', it2: '食醋', it3: '黑咖啡', it4: '纯水', it5: '小苏打溶液', it6: '肥皂水', it7: '家用氨水', it8: '漂白水',
    ind0: '万能指示剂', ind1: '石蕊', ind2: '酚酞', ind3: '甲基橙',
    kindAcid: '酸性', kindNeutral: '中性', kindBase: '碱性',
    unitMol: 'mol/L', unitMl: 'mL', s1len: '长度刻度', s1lin: '线性比较', lblChart: '你记录的样品色卡',
    s0k: '第 0 步 · 一条刻度',
    s0t: '怎么用一个数说明一杯水有多酸或多碱？',
    s0e: '这一步要回答：为什么可以用一条 0–14 的数轴比较电池酸、柠檬汁和肥皂水？<strong>pH</strong> 是衡量溶液酸碱程度的数：pH 小于 7 是<strong>酸性</strong>，等于 7 是<strong>中性</strong>（纯水），大于 7 是<strong>碱性</strong>。彩条上的颜色是万能指示剂在该 pH 的颜色。选一种常见液体，或直接拖滑杆，看标记落在哪里。',
    s0stage: '横轴：pH 0–14，颜色是万能指示剂的颜色；橙色标记是当前位置，圆点是其他常见物质的典型 pH',
    s0canvas: 'pH 彩色刻度条：标记随所选物质移动，小于 7 酸、大于 7 碱',
    s0item: '常见液体', s0ph: '直接拖 pH',
    s0ro: '{name}：pH ≈ {ph}，{kind}；氢离子浓度 [H⁺] ≈ {h} mol/L。',
    s0custom: '自定义溶液',
    s0result: '结论：pH 越小越酸，越大越碱，7 为中性。条件：物质的 pH 是典型近似值（因浓度、配方而异）；数轴在 25 ℃ 的水溶液里成立。',
    s1k: '第 1 步 · 差 1 是 10 倍',
    s1t: 'pH 3 和 pH 6 的酸，到底差多少倍？',
    s1e: '这一步要回答：pH 差 3，酸的「劲」是差 3 倍吗？不是。pH = −log₁₀[H⁺]，<strong>[H⁺]</strong> 指每升溶液里氢离子的物质的量（mol/L，数越大越酸）。pH 每降 1，[H⁺] 变成 10 倍，所以 pH 相差 Δ，[H⁺] 相差 10^Δ 倍。拖两个滑杆，看左边柱子（pH 刻度）差多少格，右边就差多少个「10 倍」。',
    s1stage: '左：两个溶液的 pH 柱（越长越酸，长度 = 14 − pH）；右：同样两个溶液的 [H⁺] 倍数',
    s1canvas: 'A、B 两个溶液的 pH 对比：pH 差几格，氢离子浓度就差 10 的几次方倍',
    s1a: '溶液 A 的 pH', s1b: '溶液 B 的 pH',
    s1ro: 'A：pH {a}，[H⁺] = {ha} mol/L；B：pH {b}，[H⁺] = {hb} mol/L。pH 差 {d}，[H⁺] 相差 {ratio} 倍（{who}）。',
    s1whoA: 'A 更酸', s1whoB: 'B 更酸', s1whoEq: '一样酸',
    s1result: '结论：pH 是对数刻度，差 1 个单位 = 10 倍，差 3 个单位 = 1000 倍。条件：25 ℃ 水溶液；浓度很大或很小时 pH 公式只是近似。',
    s2k: '第 2 步 · 指示剂变色',
    s2t: '怎么用颜色判断一杯溶液的 pH 范围？',
    s2e: '这一步要回答：滴几滴指示剂，颜色怎么告诉我们酸碱？<strong>指示剂</strong>是遇酸碱会变色的物质，每种只在自己的 pH 范围里变色：石蕊在 pH 4.5–8.3 之间由红变蓝，酚酞在 8.2–10 之间由无色变粉红，甲基橙在 3.1–4.4 之间由红变黄，万能指示剂则连续变色。选指示剂、拖样品的 pH，按「滴入并记录」，把每次的颜色累积在下面的色卡里。',
    s2stage: '上：烧杯里滴入指示剂后的颜色；中：该指示剂在 0–14 的整条颜色带；下：你记录过的样品色卡',
    s2canvas: '指示剂在不同 pH 下的颜色：烧杯、整条颜色带和记录的色卡',
    s2ind: '指示剂', s2ph: '样品的 pH', s2rec: '滴入并记录', s2clear: '清空色卡',
    s2ro: '{ind}：pH {ph} 的样品呈 {desc}；已记录 {n} 个样品。',
    s2d0: '该指示剂变色范围之外的颜色（酸侧）', s2d1: '变色范围内的过渡色', s2d2: '该指示剂变色范围之外的颜色（碱侧）',
    s2result: '结论：指示剂只能告诉你 pH 落在哪一段，不能给出精确值；要选变色范围覆盖你关心 pH 的那一种。条件：颜色是简化的示意色，真实颜色因浓度和光线而异。',
    s3k: '第 3 步 · 酸碱中和',
    s3t: '往盐酸里滴氢氧化钠，pH 怎么走？',
    s3e: '这一步要回答：往 20 mL 0.1 mol/L 盐酸里加 0.1 mol/L 氢氧化钠，pH 怎样变化，在哪一点突然跳变？酸里的 H⁺ 与碱里的 OH⁻ 结合成水，叫<strong>中和</strong>。加的碱刚好抵消酸时是<strong>化学计量点</strong>（强酸强碱时 pH = 7）。拖滴入的体积，看曲线上的点和烧杯颜色。',
    s3stage: '曲线：横轴加入的碱（mL），纵轴 pH；橙点是当前位置；右边烧杯用万能指示剂着色',
    s3canvas: '滴定曲线：加碱时 pH 先缓慢上升，在 20 mL 附近陡然跳到 7 以上',
    s3v: '加入的氢氧化钠', s3reset: '重新滴',
    s3ro: '加入 {v} mL 碱：{state}；pH = {ph}。',
    s3before: '还剩 {x} mmol 酸没被中和',
    s3eq: '刚好中和（化学计量点），溶液只剩盐和水',
    s3after: '碱过量 {x} mmol',
    s3result: '结论：中和点附近 pH 变化极陡，差一两滴就从酸性翻到碱性。条件：强酸强碱、体积可加、25 ℃；弱酸弱碱的曲线形状不同。',
    s4k: '第 4 步 · 稀释能变碱吗',
    s4t: '不断加水稀释酸，pH 会越过 7 变成碱吗？',
    s4e: '这一步要回答：把 pH 2 的酸不断稀释，pH 会一路升高到 7 以上吗？<strong>稀释</strong>是加水让浓度变小。酸越稀 [H⁺] 越小，pH 靠近 7，但水自己也电离出约 10⁻⁷ mol/L 的 H⁺，所以酸怎么稀也不会变成碱。拖稀释倍数（10 的几次方），看 pH 曲线贴近 7。',
    s4stage: '曲线：横轴稀释倍数的指数 e（稀释 10^e 倍），纵轴 pH；虚线是 pH = 7；右边烧杯用万能指示剂着色',
    s4canvas: '稀释曲线：pH 随稀释上升，趋近 7 但不越过',
    s4e2: '稀释倍数的指数 e', s4reset: '回到没稀释',
    s4ro: '稀释 10^{e} 倍：[H⁺] ≈ {h} mol/L，pH = {ph}，{kind}。',
    s4result: '结论：稀释酸只会让 pH 无限趋近 7，不会越过。条件：起始 pH 2 的强酸，[H⁺] = 10⁻² / 10^e + 10⁻⁷；该近似忽略了活度与温度变化。',
    s5k: '第 5 步 · 收束', s5t: '把 pH 说给别人听',
    s5e: 'pH 把酸碱程度排成一条 0–14 的刻度：7 中性，越小越酸，越大越碱，每差 1 是 10 倍。',
    f1t: '刻度', f1b: 'pH = −log₁₀[H⁺]；小于 7 酸，等于 7 中性，大于 7 碱（第 0–1 步）。',
    f2t: '读法', f2b: '指示剂只告诉 pH 的范围；中和点附近 pH 极陡（第 2–3 步）。',
    f3t: '极限', f3b: '稀释酸只会无限趋近 7，不会变成碱（第 4 步）。',
    modelT: '模型实话',
    model1: '常见物质的 pH 是典型近似值，实际随浓度和品牌变化。',
    model2: '指示剂颜色是示意色；变色范围取常见教材数值。',
    model3: '本页只处理强酸强碱和 25 ℃ 的水溶液；弱酸、缓冲和温度对水电离的影响见其他页。',
    nextT: '继续看（站内）',
    l1: '指数与对数 · 第 2 步：对数为什么把「10 倍」变成「差 1」',
    l2: '缓冲溶液 · 第 2 步：加酸或加碱时 pH 怎样被稳住',
    l3: '酸碱平衡 · 第 0 步：弱酸里分子在两边来回走'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Chemistry",
    stageBadge: "Junior High",
    foot: "The pH Scale · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'The pH Scale · One Ruler from Battery Acid to Soapy Water',
    pageTitle: 'The pH Scale',
    tagline: 'How acidic or alkaline something is can be placed on one 0-to-14 ruler — and each step of 1 on it is a factor of 10.',
    nav0: '0 One ruler', nav1: '1 One step = ×10', nav2: '2 Indicator colours', nav3: '3 Neutralising', nav4: '4 Dilute to base?', nav5: '5 Recap',
    it0: 'Battery acid', it1: 'Lemon juice', it2: 'Vinegar', it3: 'Black coffee', it4: 'Pure water', it5: 'Baking soda solution', it6: 'Soapy water', it7: 'Household ammonia', it8: 'Bleach',
    ind0: 'Universal indicator', ind1: 'Litmus', ind2: 'Phenolphthalein', ind3: 'Methyl orange',
    kindAcid: 'acidic', kindNeutral: 'neutral', kindBase: 'alkaline',
    unitMol: 'mol/L', unitMl: 'mL', s1len: 'length scale', s1lin: 'linear comparison', lblChart: 'Colour chart of your recorded samples',
    s0k: 'Step 0 · One ruler',
    s0t: 'How can one number say how acidic or alkaline a liquid is?',
    s0e: 'This step asks: why can one 0–14 ruler compare battery acid, lemon juice and soapy water? <strong>pH</strong> is a number for how acidic a solution is: below 7 is <strong>acidic</strong>, 7 is <strong>neutral</strong> (pure water), above 7 is <strong>alkaline</strong>. The colours on the bar are what universal indicator shows at each pH. Pick a common liquid or drag the slider and see where the marker lands.',
    s0stage: 'x-axis: pH 0–14, coloured as universal indicator would show; the orange marker is the current position, dots are other everyday liquids at typical pH',
    s0canvas: 'A coloured pH bar: the marker follows the chosen liquid, below 7 acid, above 7 alkaline',
    s0item: 'Everyday liquid', s0ph: 'Or drag the pH',
    s0ro: '{name}: pH ≈ {ph}, {kind}; hydrogen ion concentration [H⁺] ≈ {h} mol/L.',
    s0custom: 'Custom solution',
    s0result: 'Takeaway: lower pH is more acidic, higher is more alkaline, 7 is neutral. Holds with typical approximate values (they vary with concentration and recipe) for water solutions at 25 °C.',
    s1k: 'Step 1 · One step = ×10',
    s1t: 'How many times stronger is a pH 3 acid than a pH 6 one?',
    s1e: 'This step asks: if pH differs by 3, is the acid 3 times as strong? No. pH = −log₁₀[H⁺], and <strong>[H⁺]</strong> is the amount of hydrogen ions per litre (mol/L; bigger means more acidic). Each pH drop of 1 multiplies [H⁺] by 10, so a pH difference of Δ means [H⁺] differs by 10^Δ. Drag the two sliders: the gap between the pH bars on the left shows how many “×10”s you get on the right.',
    s1stage: 'Left: pH bars for two solutions (longer = more acidic, length = 14 − pH); right: how many times more [H⁺] they hold',
    s1canvas: 'Two solutions A and B: the pH gap in steps sets the hydrogen ion ratio as a power of ten',
    s1a: 'pH of solution A', s1b: 'pH of solution B',
    s1ro: 'A: pH {a}, [H⁺] = {ha} mol/L; B: pH {b}, [H⁺] = {hb} mol/L. pH differs by {d}, so [H⁺] differs by a factor of {ratio} ({who}).',
    s1whoA: 'A is more acidic', s1whoB: 'B is more acidic', s1whoEq: 'equally acidic',
    s1result: 'Takeaway: pH is a logarithmic scale — 1 unit is ×10, 3 units is ×1000. Holds for water solutions at 25 °C; at very high or very low concentrations the pH formula is only approximate.',
    s2k: 'Step 2 · Indicator colours',
    s2t: 'How can a colour tell you the pH range of a solution?',
    s2e: 'This step asks: add a few drops of indicator — how does its colour show acid or base? An <strong>indicator</strong> is a substance that changes colour with acidity, each only within its own pH range: litmus turns from red to blue between pH 4.5 and 8.3, phenolphthalein from colourless to pink between 8.2 and 10, methyl orange from red to yellow between 3.1 and 4.4, and universal indicator changes continuously. Choose an indicator and a sample pH, press “Add drops and record”, and build a colour chart below.',
    s2stage: 'Top: the beaker with indicator added; middle: this indicator’s whole colour band over pH 0–14; bottom: the colour chart of samples you recorded',
    s2canvas: 'Indicator colours at different pH: the beaker, the full colour band and the recorded chart',
    s2ind: 'Indicator', s2ph: 'Sample pH', s2rec: 'Add drops and record', s2clear: 'Clear chart',
    s2ro: '{ind}: a sample at pH {ph} shows {desc}; {n} samples recorded.',
    s2d0: 'the colour below its change range (acid side)', s2d1: 'a transition colour inside its change range', s2d2: 'the colour above its change range (alkaline side)',
    s2result: 'Takeaway: an indicator only tells which stretch the pH falls in, not an exact value; pick one whose change range covers the pH you care about. Colours are simplified illustrations that vary with concentration and light.',
    s3k: 'Step 3 · Neutralising',
    s3t: 'Drip sodium hydroxide into hydrochloric acid — how does the pH move?',
    s3e: 'This step asks: add 0.1 mol/L sodium hydroxide to 20 mL of 0.1 mol/L hydrochloric acid — how does pH change and where does it jump? H⁺ from the acid combines with OH⁻ from the base to make water: <strong>neutralisation</strong>. When the added base exactly cancels the acid you are at the <strong>equivalence point</strong> (pH 7 for a strong acid with a strong base). Drag the volume added and watch the dot on the curve and the beaker colour.',
    s3stage: 'Curve: x is base added (mL), y is pH; the orange dot is now; the beaker on the right is coloured by universal indicator',
    s3canvas: 'Titration curve: pH rises slowly, then jumps steeply past 7 near 20 mL',
    s3v: 'Sodium hydroxide added', s3reset: 'Start over',
    s3ro: '{v} mL of base added: {state}; pH = {ph}.',
    s3before: '{x} mmol of acid still unneutralised',
    s3eq: 'exactly neutralised (equivalence point), only salt and water left',
    s3after: '{x} mmol of base in excess',
    s3result: 'Takeaway: near the equivalence point pH changes extremely steeply, so a drop or two flips it from acidic to alkaline. Holds for strong acid + strong base, additive volumes, 25 °C; weak acids and bases give different curves.',
    s4k: 'Step 4 · Dilute to base?',
    s4t: 'Keep diluting an acid — does its pH cross 7 and become alkaline?',
    s4e: 'This step asks: dilute a pH 2 acid again and again — does the pH keep rising past 7? <strong>Diluting</strong> means adding water to lower the concentration. The more dilute the acid, the smaller [H⁺] and the closer pH gets to 7, but water itself supplies about 10⁻⁷ mol/L of H⁺, so no amount of dilution turns an acid into a base. Drag the dilution exponent (10 to the e) and watch the curve hug 7.',
    s4stage: 'Curve: x is the dilution exponent e (diluted 10^e times), y is pH; the dashed line is pH = 7; the beaker on the right is coloured by universal indicator',
    s4canvas: 'Dilution curve: pH rises with dilution and approaches 7 but never crosses it',
    s4e2: 'Dilution exponent e', s4reset: 'Back to undiluted',
    s4ro: 'Diluted 10^{e} times: [H⁺] ≈ {h} mol/L, pH = {ph}, {kind}.',
    s4result: 'Takeaway: diluting an acid only pushes the pH toward 7, never past it. Holds for a strong acid starting at pH 2 with [H⁺] = 10⁻² / 10^e + 10⁻⁷; the approximation ignores activity and temperature effects.',
    s5k: 'Step 5 · Recap', s5t: 'Explain pH to a friend',
    s5e: 'pH lays acidity out on one 0–14 ruler: 7 is neutral, lower is more acidic, higher is more alkaline, and each step is a factor of 10.',
    f1t: 'The ruler', f1b: 'pH = −log₁₀[H⁺]; below 7 acidic, 7 neutral, above 7 alkaline (steps 0–1).',
    f2t: 'Reading it', f2b: 'Indicators give a pH range; near the equivalence point pH is very steep (steps 2–3).',
    f3t: 'The limit', f3b: 'Diluting an acid approaches 7 forever but never becomes a base (step 4).',
    modelT: 'Honest model notes',
    model1: 'Everyday pH values are typical approximations; real ones vary with concentration and brand.',
    model2: 'Indicator colours are illustrations; change ranges use common textbook values.',
    model3: 'Only strong acids and bases at 25 °C in water are handled here; weak acids, buffers and temperature effects on water’s ionisation live on other pages.',
    nextT: 'Keep going (on this site)',
    l1: 'Exponentials & Logs · step 2: why a logarithm turns “×10” into “+1”',
    l2: 'Buffer Capacity · step 2: how pH is held steady when acid or base is added',
    l3: 'Acid–Base Equilibrium · step 0: molecules moving both ways in a weak acid'
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
