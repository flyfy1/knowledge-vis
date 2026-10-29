'use strict';
const STR = {
  zh: {
    docTitle: '密度 · 同样大小，谁「密」',
    languageLabel: '语言切换',
    back: '← 知识索引',
    catBadge: '物理与电路',
    stageBadge: '初中',
    pageTitle: '密度',
    tagline: '同样大的铁块和木块，天平一称就分出高下——「每立方厘米里装了多少质量」就是密度。',
    navLabel: '步骤导航',
    nav0: '0 称一称',
    nav1: '1 越大越密？',
    nav2: '2 每格装多少',
    nav3: '3 浮还是沉',
    nav4: '4 测石头',
    nav5: '5 收束',
    foot: '密度 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页',
    unitG: 'g',
    unitCm3: 'cm³',
    unitDens: 'g/cm³',
    matCork: '软木', matWood: '松木', matIce: '冰', matWater: '水', matAl: '铝', matFe: '铁', matAu: '金',
    matSalt: '盐水', matOil: '植物油',
    // step 0
    s0k: '第 0 步 · 称一称',
    s0t: '体积一样的两块，哪边装的质量多？',
    s0e: '这一步要回答：两块<strong>体积相同</strong>的材料放上天平，哪一边更重，重多少倍？<strong>质量</strong>指物体里含有多少物质，用天平称，单位克（g）；<strong>体积</strong>指它占多大空间，单位立方厘米（cm³）。改两边的材料或共同的体积，看横梁怎么倾斜。',
    s0stage: '天平：左右托盘里的方块体积相同，横梁倾斜角由两边质量之差决定',
    s0canvas: '天平示意图：左右两个体积相同的方块，横梁向质量大的一边倾斜',
    s0left: '左盘材料', s0right: '右盘材料', s0vol: '共同体积 V',
    s0ro: '左：{ml} g　右：{mr} g　{verdict}',
    s0heavL: '左边重，是右边的 {r} 倍。',
    s0heavR: '右边重，是左边的 {r} 倍。',
    s0eq: '两边一样重（同种材料或密度相同）。',
    s0result: '结论：体积相同时，质量不同，说明「每立方厘米里装的物质」不同。这个数叫密度。条件：材料均匀、实心。',
    // step 1
    s1k: '第 1 步 · 越大越密？',
    s1t: '同一种材料，块越大，密度也越大吗？',
    s1e: '这一步要回答：同一种材料切大切小，质量与体积的比值会变吗？选材料，拖体积，按「记录这个点」把 (V, m) 画成点，点越多越能看出排成什么线。质量读数带约 ±2% 的模拟称量误差。',
    s1stage: '横轴：体积 V（cm³）；纵轴：质量 m（g）；每个点是一次称量',
    s1canvas: '质量对体积的散点图：记录的点沿过原点的直线排列',
    s1mat: '材料', s1vol: '体积 V',
    s1rec: '记录这个点 (V, m)', s1clear: '清空所有点',
    s1now: '现在：V = {v} cm³，称得 m = {m} g，m/V = {r} g/cm³',
    s1fit: '已记录 {n} 个点，拟合斜率 = {k} g/cm³（理论值 {rho} g/cm³）',
    s1none: '还没有记录点；按「记录这个点」开始。',
    s1result: '结论：m 与 V 成正比，比值（斜率）不随块的大小变，只由材料决定——这就是密度。条件：均匀材料；称量有误差，所以用多个点平均。',
    // step 2
    s2k: '第 2 步 · 每格装多少',
    s2t: '密度 ρ = m/V 里，m 和 V 怎么算、单位是什么？',
    s2e: '这一步要回答：把 <strong>密度</strong>写成公式 ρ = m ÷ V，一块材料的质量怎么由体积算出来？每个方格是 1 cm³ 的小格，格里每个小点代表 0.25 g 质量（只是记账，不是真原子）；密度越大，每格点越多。选材料，拖块的格数。',
    s2stage: '每个方格 = 1 cm³；每个点 = 0.25 g 的物质（示意记账）',
    s2canvas: '方格阵列：每格点数代表密度，格数代表体积',
    s2mat: '材料', s2cells: '体积 V（格数，每格 1 cm³）',
    s2ro: 'ρ = {rho} g/cm³ = {rhoSi} kg/m³；V = {v} cm³ → m = ρ·V = {m} g；画图用 {dots} 个点（每点 0.25 g，取整）',
    s2note: '换算：1 g/cm³ = 1000 kg/m³。每格点数（取整后）只为画图，读数用精确密度。',
    s2result: '结论：同一材料每格点数相同（ρ 不变），格数翻倍质量翻倍。公式 m = ρ·V 与 ρ = m/V 是同一件事。',
    // step 3
    s3k: '第 3 步 · 浮还是沉',
    s3t: '把物体放进液体，凭什么判断它浮还是沉？',
    s3e: '这一步要回答：物体放进液体后，浮或沉由什么决定？比较物体的密度 ρ物 与液体的密度 ρ液：ρ物 小于 ρ液 就浮，大于就沉。选液体，拖物体密度，按「松手」看它停在哪。浮着时浸入液面下的比例 = ρ物 ÷ ρ液（原理见浮力页）。',
    s3stage: '水槽：灰色方块是物体；虚线是液面',
    s3canvas: '水槽示意图：物体在液体里浮起或沉底，浸入深度随密度比变化',
    s3liq: '液体', s3obj: '物体密度 ρ物',
    s3drop: '松手，看它停在哪', s3lift: '拿起来重放',
    s3ro: 'ρ物 = {ro} g/cm³，ρ液 = {rl} g/cm³ → {verdict}',
    s3float: '浮在液面，约 {p}% 浸入液体。',
    s3sink: '下沉到底（ρ物 > ρ液）。',
    s3neutral: '刚好悬浮（ρ物 = ρ液）。',
    s3ready: '物体还在液面上方；按「松手」。',
    s3result: '结论：看密度比。条件：实心均匀物体、静止液体；空心物体（如轮船）要用整体平均密度。',
    // step 4
    s4k: '第 4 步 · 测石头',
    s4t: '形状不规则的小物体，体积怎么量？',
    s4e: '这一步要回答：不规则物体没法用尺量体积，怎么办？把它浸入量筒的水里，<strong>液面升高的体积</strong>就是它的体积（排水法）。选一个物体（质量已用天平称好），按「放入水中」，读出升高的体积，再算 ρ = m ÷ V。',
    s4stage: '量筒：水面刻度单位 mL（1 mL = 1 cm³）',
    s4canvas: '量筒示意图：放入物体后水面上升，升高的体积等于物体体积',
    s4obj: '物体', s4o0: '小块 A（m = 13.5 g）', s4o1: '小块 B（m = 39.5 g）', s4o2: '小块 C（m = 96.5 g）',
    s4go: '放入水中', s4out: '取出',
    s4ro0: '物体质量 {m} g；放入前水面 {v0} mL。按「放入水中」读升高量。',
    s4ro1: '水面 {v0} mL → {v1} mL，升高 {dv} mL = 物体体积；ρ = {m} ÷ {dv} = {rho} g/cm³，最接近 {name}。',
    s4result: '结论：排水法把形状问题变成读刻度。条件：物体沉入水中且不吸水、不溶于水；量筒刻度有读数误差。',
    // step 5
    s5k: '第 5 步 · 收束',
    s5t: '把「密度」说给别人听',
    s5e: '密度是物质的一种特性：每单位体积里有多少质量。',
    f1t: '定义', f1b: 'ρ = m ÷ V，单位 g/cm³ 或 kg/m³；1 g/cm³ = 1000 kg/m³。',
    f2t: '特性', f2b: '同种均匀材料，m 与 V 成正比，比值不随块的大小变（第 1 步）。',
    f3t: '用途', f3b: '比密度判浮沉（第 3 步）；排水法测体积，再求 ρ 认材料（第 4 步）。',
    modelT: '模型实话',
    model1: '表中密度取常温常压（约 20 ℃、1 atm）的典型值；温度变了，同一材料的密度会略变，水在 4 ℃ 最密，冰比水轻。',
    model2: '本页天平、量筒都是理想示意，质量读数带模拟的 ±2% 误差；真实材料有杂质、气孔，密度会偏离表值。',
    model3: '方格里的点只是记账（每点 0.25 g），不是原子；原子质量与排列疏密共同决定真实材料的密度。',
    nextT: '继续看（站内）',
    l1: '粒子与物态 · 第 0 步：固体里的粒子排得多紧，为什么密度大',
    l2: '粒子与物态 · 第 2 步：熔化时队形散开，体积与密度怎么变',
    l3: '质量守恒 · 第 0 步：质量是怎么称、怎么守恒的'
  },
  en: {
    docTitle: 'Density · Same Size, Different Stuff',
    languageLabel: 'Language',
    back: '← Knowledge Index',
    catBadge: 'Physics & Circuits',
    stageBadge: 'Junior High',
    pageTitle: 'Density',
    tagline: 'An iron block and a wood block of the same size: one weighing tells them apart. Density is how much mass fits in each cubic centimetre.',
    navLabel: 'Step navigation',
    nav0: '0 Weigh them',
    nav1: '1 Bigger = denser?',
    nav2: '2 Per cell',
    nav3: '3 Float or sink',
    nav4: '4 Odd stone',
    nav5: '5 Recap',
    foot: 'Density · Built by Claude Sonnet via Mini Claude Code · static bilingual page',
    unitG: 'g',
    unitCm3: 'cm³',
    unitDens: 'g/cm³',
    matCork: 'Cork', matWood: 'Pine wood', matIce: 'Ice', matWater: 'Water', matAl: 'Aluminium', matFe: 'Iron', matAu: 'Gold',
    matSalt: 'Salt water', matOil: 'Cooking oil',
    s0k: 'Step 0 · Weigh them',
    s0t: 'Same volume: which side holds more mass?',
    s0e: 'This step asks: put two pieces of <strong>equal volume</strong> on a balance — which side is heavier, and by what factor? <strong>Mass</strong> is how much matter an object contains, measured on a balance in grams (g); <strong>volume</strong> is how much space it fills, in cubic centimetres (cm³). Change either material or the shared volume and watch the beam tilt.',
    s0stage: 'Balance: the blocks have equal volume; the beam tilts by the mass difference',
    s0canvas: 'Balance diagram: two equal-volume blocks, beam tilting toward the larger mass',
    s0left: 'Left pan', s0right: 'Right pan', s0vol: 'Shared volume V',
    s0ro: 'Left: {ml} g   Right: {mr} g   {verdict}',
    s0heavL: 'Left is heavier, {r}× the right.',
    s0heavR: 'Right is heavier, {r}× the left.',
    s0eq: 'Equal mass (same material or same density).',
    s0result: 'Takeaway: equal volume but different mass means different amounts of matter per cm³. That number is density. Holds for uniform, solid pieces.',
    s1k: 'Step 1 · Bigger = denser?',
    s1t: 'Does a bigger piece of the same material have a higher density?',
    s1e: 'This step asks: if you cut the same material bigger or smaller, does mass ÷ volume change? Pick a material, drag the volume, and press “Record this point” to plot (V, m); more points show what line they fall on. Mass readings carry a simulated ±2% weighing error.',
    s1stage: 'x-axis: volume V (cm³); y-axis: mass m (g); each dot is one weighing',
    s1canvas: 'Mass versus volume scatter: recorded points line up along a line through the origin',
    s1mat: 'Material', s1vol: 'Volume V',
    s1rec: 'Record this point (V, m)', s1clear: 'Clear all points',
    s1now: 'Now: V = {v} cm³, weighed m = {m} g, m/V = {r} g/cm³',
    s1fit: '{n} points recorded; fitted slope = {k} g/cm³ (true value {rho} g/cm³)',
    s1none: 'No points yet; press “Record this point” to start.',
    s1result: 'Takeaway: m is proportional to V, and the ratio (the slope) does not depend on piece size — only on the material. That is density. Holds for uniform material; weighing has error, so averaging many points helps.',
    s2k: 'Step 2 · Per cell',
    s2t: 'In ρ = m/V, how do m and V connect, and what are the units?',
    s2e: 'This step asks: write <strong>density</strong> as ρ = m ÷ V — how is a piece’s mass found from its volume? Each square is a 1 cm³ cell, and each dot in it stands for 0.25 g of material (bookkeeping, not real atoms). Denser material has more dots per cell. Pick a material and drag the number of cells.',
    s2stage: 'Each square = 1 cm³; each dot = 0.25 g of matter (illustrative bookkeeping)',
    s2canvas: 'Grid of cells: dots per cell show density, number of cells shows volume',
    s2mat: 'Material', s2cells: 'Volume V (cells of 1 cm³)',
    s2ro: 'ρ = {rho} g/cm³ = {rhoSi} kg/m³; V = {v} cm³ → m = ρ·V = {m} g; drawn with {dots} dots (0.25 g each, rounded)',
    s2note: 'Conversion: 1 g/cm³ = 1000 kg/m³. Dots per cell are rounded for drawing only; readouts use the exact density.',
    s2result: 'Takeaway: the same material has the same dots per cell (ρ fixed); twice the cells means twice the mass. m = ρ·V and ρ = m/V say the same thing.',
    s3k: 'Step 3 · Float or sink',
    s3t: 'Put an object in a liquid: what decides float or sink?',
    s3e: 'This step asks: what decides whether an object floats or sinks? Compare the object’s density ρ_obj with the liquid’s ρ_liq: lower floats, higher sinks. Pick a liquid, drag the object’s density, press “Let go”. A floating object sits submerged by the fraction ρ_obj ÷ ρ_liq (the reason is on the buoyancy page).',
    s3stage: 'Tank: the grey block is the object; the dashed line is the liquid surface',
    s3canvas: 'Tank diagram: object floating or resting on the bottom, with immersion depth following the density ratio',
    s3liq: 'Liquid', s3obj: 'Object density ρ_obj',
    s3drop: 'Let go and see where it settles', s3lift: 'Lift it back up',
    s3ro: 'ρ_obj = {ro} g/cm³, ρ_liq = {rl} g/cm³ → {verdict}',
    s3float: 'floats, about {p}% submerged.',
    s3sink: 'sinks to the bottom (ρ_obj > ρ_liq).',
    s3neutral: 'hangs just submerged (ρ_obj = ρ_liq).',
    s3ready: 'The object is above the liquid; press “Let go”.',
    s3result: 'Takeaway: compare the densities. Holds for solid, uniform objects in still liquid; hollow objects (like ships) use their overall average density.',
    s4k: 'Step 4 · Odd stone',
    s4t: 'How do you find the volume of an irregular object?',
    s4e: 'This step asks: you cannot measure an odd shape with a ruler — so what then? Lower it into water in a measuring cylinder: the <strong>rise in water level</strong> equals its volume (displacement method). Choose an object (mass already weighed), press “Lower into water”, read the rise, then compute ρ = m ÷ V.',
    s4stage: 'Measuring cylinder: scale in mL (1 mL = 1 cm³)',
    s4canvas: 'Measuring cylinder diagram: the water rises when the object goes in; the rise equals the object volume',
    s4obj: 'Object', s4o0: 'Piece A (m = 13.5 g)', s4o1: 'Piece B (m = 39.5 g)', s4o2: 'Piece C (m = 96.5 g)',
    s4go: 'Lower into water', s4out: 'Take it out',
    s4ro0: 'Object mass {m} g; water level before: {v0} mL. Press “Lower into water” to read the rise.',
    s4ro1: 'Level {v0} mL → {v1} mL, rise {dv} mL = object volume; ρ = {m} ÷ {dv} = {rho} g/cm³, closest to {name}.',
    s4result: 'Takeaway: displacement turns a shape problem into a scale reading. Holds if the object sinks, absorbs no water and does not dissolve; cylinder readings have error.',
    s5k: 'Step 5 · Recap',
    s5t: 'Explain density to a friend',
    s5e: 'Density is a property of a material: how much mass sits in each unit of volume.',
    f1t: 'Definition', f1b: 'ρ = m ÷ V, in g/cm³ or kg/m³; 1 g/cm³ = 1000 kg/m³.',
    f2t: 'Property', f2b: 'For one uniform material, m is proportional to V, so the ratio does not depend on piece size (step 1).',
    f3t: 'Use', f3b: 'Compare densities to predict float or sink (step 3); use displacement to get volume, then ρ to identify a material (step 4).',
    modelT: 'Honest model notes',
    model1: 'Table densities are typical values at room conditions (about 20 °C, 1 atm). Temperature shifts them slightly; water is densest near 4 °C and ice is lighter than water.',
    model2: 'The balance and cylinder here are idealised, and mass readings carry a simulated ±2% error; real materials have impurities and pores, so their density drifts from table values.',
    model3: 'The dots in cells are bookkeeping (0.25 g each), not atoms; real density comes from atom mass and how tightly atoms are packed.',
    nextT: 'Keep going (on this site)',
    l1: 'Particles & States · step 0: how tightly solid particles pack, and why that means high density',
    l2: 'Particles & States · step 2: how melting loosens the pattern and changes volume and density',
    l3: 'Mass Conservation · step 0: how mass is weighed and why it is conserved'
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
