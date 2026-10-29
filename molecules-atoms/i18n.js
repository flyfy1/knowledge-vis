'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "化学",
    stageBadge: "初中",
    foot: "分子与原子 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '分子与原子 · 化学变化的本质是原子重新组合',
    pageTitle: '分子与原子',
    tagline: '水烧开、水通电都是「水变了」，可一个是分子换了位置，一个是分子被拆开重组——原子不变，分子才变。',
    nav0: '0 读分子式', nav1: '1 水烧开', nav2: '2 水通电', nav3: '3 物理还是化学', nav4: '4 原子账本', nav5: '5 收束',
    el_H: '氢', el_O: '氧', el_C: '碳', el_N: '氮',
    mH2: '氢气 H₂', mO2: '氧气 O₂', mH2O: '水 H₂O', mCO2: '二氧化碳 CO₂', mCH4: '甲烷 CH₄', mNH3: '氨 NH₃',
    unitC: '℃', unitEv: '次', lblMol: '分子个数（会变）', lblAtom: '原子总数（不变）',
    s0k: '第 0 步 · 读分子式',
    s0t: '分子式 H₂O 里的小数字是什么意思？',
    s0e: '这一步要回答：H₂O 里的小数字 2 说的是什么？<strong>原子</strong>是化学变化里不能再分的最小粒子；<strong>分子</strong>是几个原子连成的一个小团，是保持物质化学性质的一个单位。分子式里元素符号右下角的小数字，是<strong>这一个分子里</strong>该原子的个数。选一种分子，再拖「分子个数」：分子式前面的系数表示有几个这样的分子。',
    s0stage: '球棍图：不同颜色的球是不同元素的原子，棍表示它们连在一起',
    s0canvas: '分子的球棍示意图：所选分子重复所选个数，每个原子带颜色',
    s0mol: '选一种分子', s0n: '分子个数（系数）',
    s0ro: '{n} 个 {name}：每个分子里的原子 {per}；合计原子 {tot}。',
    s0result: '结论：小数字数的是一个分子里的原子，系数数的是分子个数，二者别混。条件：图中的键角和球大小是示意，不是真实尺寸。',
    s1k: '第 1 步 · 水烧开',
    s1t: '水烧成水蒸气，水分子变了吗？',
    s1e: '这一步要回答：把水加热到沸腾变成水蒸气，是分子本身变了，还是分子之间的距离变了？拖温度滑杆，看 12 个水分子（每个都是一个氧原子连两个氢原子）怎么运动。温度越高分子抖得越凶；到 100 ℃ 附近分子挣脱彼此、散开成气体。数一数每个小团还是不是 H₂O。',
    s1stage: '12 个水分子的示意图（粒子运动是示意，不是真实速度）：每个小团由一个氧原子和两个氢原子组成',
    s1canvas: '12 个水分子：低温时挤在一起抖动，到 100 ℃ 附近散开成气体，每个分子都还是 H₂O',
    s1t2: '温度',
    s1ro: '{T} ℃：{state}。分子 {n} 个，每个仍是 H₂O；原子合计 {atoms}。',
    s1liq: '液态：分子挨着、只在原处抖动',
    s1boil: '沸腾附近：分子正在挣脱，散开',
    s1gas: '气态：分子彼此远离、自由飞行',
    s1result: '结论：物态变化是分子间距离和运动方式变了，分子本身没变，仍是 H₂O（物理变化）。条件：常压，水沸点 100 ℃；本页粒子排布是示意。',
    s2k: '第 2 步 · 水通电',
    s2t: '水通电以后，水分子去了哪里？',
    s2e: '这一步要回答：给水通电，水分子会怎样、产生了什么？电流把水分子拆开，氢、氧原子重新两两结合：2 H₂O → 2 H₂ + O₂。设定水分子个数，按「通电」，一次次反应后水变少、氢分子和氧分子变多，看氢分子数是氧分子的几倍。',
    s2stage: '电解槽示意：左边收集氢气，右边收集氧气；每次反应拆开 2 个水分子',
    s2canvas: '电解槽示意图：水分子逐个被拆成氢分子和氧分子，氢分子数是氧分子数的 2 倍',
    s2n: '水分子起始个数', s2run: '通电，开始反应', s2reset: '重新装水',
    s2ro: '已发生 {e} / {max} 次反应：H₂O {w} 个，H₂ {h} 个，O₂ {o} 个；H₂ ÷ O₂ = {ratio}；原子总数 H {ah}、O {ao}。',
    s2zero: '还没通电；水分子 {w} 个。',
    s2result: '结论：化学变化中分子被拆开、原子重新结合成新分子（新物质）。H₂ 与 O₂ 的个数比 2 : 1。条件：理想反应，100% 完全分解，不计电极与损耗。',
    s3k: '第 3 步 · 物理还是化学',
    s3t: '怎么判断一个变化是物理变化还是化学变化？',
    s3e: '这一步要回答：看一个变化，凭什么说有没有生成新物质？看反应前后的<strong>分子种类</strong>有没有变：分子种类不变（只是位置、间距、混合）是<strong>物理变化</strong>；出现了新种类的分子是<strong>化学变化</strong>。选一个变化，先猜，再看判定。',
    s3stage: '反应前（左）与反应后（右）的分子清单：每行是一种分子及个数',
    s3canvas: '变化前后的分子种类清单对比：种类相同是物理变化，出现新种类是化学变化',
    s3sc: '选一个变化', s3phys: '我猜：物理变化', s3chem: '我猜：化学变化',
    sc0: '冰融化成水', sc1: '水烧开变成水蒸气', sc2: '水通电', sc3: '氢气在氧气中燃烧', sc4: '甲烷燃烧', sc5: '氢气和氧气混在一起（没有火花）',
    s3before: '反应前', s3after: '反应后', s3none: '（无）',
    s3ro: '{name}：反应前 {b}，反应后 {a}。分子种类{diff}——判定：{verdict}。{guess}',
    s3same: '没有变', s3diff: '变了',
    s3phyV: '物理变化', s3chmV: '化学变化',
    s3g0: '先猜一猜，再看你是否猜对。',
    s3gOk: '你猜对了。', s3gNo: '你猜错了：看分子种类有没有变。',
    s3result: '结论：判据是分子种类（有没有新物质）。条件：本页只列了分子；离子化合物与金属的变化判据需另讲。',
    s4k: '第 4 步 · 原子账本',
    s4t: '分子重组时，原子会多出来或少掉吗？',
    s4e: '这一步要回答：甲烷燃烧 CH₄ + 2 O₂ → CO₂ + 2 H₂O 时，分子种类和个数都在变，原子总数变吗？拖「已反应次数」，上排柱子是分子（会变），下排柱子是各元素原子总数（C、H、O）。',
    s4stage: '上：各种分子的个数；下：各元素的原子总数（始终一条线）',
    s4canvas: '甲烷燃烧的两组柱状图：分子个数随反应改变，原子总数不变',
    s4e2: '已反应次数', s4reset: '回到反应前',
    s4ro: '反应 {e} 次：CH₄ {a} 个，O₂ {b} 个，CO₂ {c} 个，H₂O {d} 个；原子总数 C {tc}、H {th}、O {to}（反应前 C {c0}、H {h0}、O {o0}）。',
    s4result: '结论：分子变，原子账不变。条件：理想反应、4 个甲烷分子起步、氧足量；不含不完全燃烧。',
    s5k: '第 5 步 · 收束', s5t: '把分子与原子的故事讲给别人听',
    s5e: '物理变化只改变分子的位置与间距；化学变化拆开分子、重组原子，产生新分子。',
    f1t: '读式', f1b: '分子式右下角的小数字数原子，式前系数数分子。',
    f2t: '判据', f2b: '分子种类不变是物理变化，出现新种类是化学变化（第 1–3 步）。',
    f3t: '不变量', f3b: '化学变化中原子的种类与总数不变，变的是怎么连（第 4 步）。',
    modelT: '模型实话',
    model1: '球棍图的键角和大小是示意；真实原子的尺寸与电子云不能这样画。',
    model2: '粒子运动用确定性函数示意，不是分子动力学模拟；沸点按常压 100 ℃。',
    model3: '本页只讨论分子；离子化合物（如食盐）与金属不由分子构成，判据要另讲。',
    nextT: '继续看（站内）',
    l1: '质量守恒 · 第 1 步：把分子拆成原子逐项数一数',
    l2: '粒子与物态 · 第 2 步：熔化时粒子队形散开，这是物理变化',
    l3: '原子结构 · 第 1 步：原子内部是什么，什么决定元素种类'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Chemistry",
    stageBadge: "Junior High",
    foot: "Molecules & Atoms · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Molecules & Atoms · Chemical Change Rearranges Atoms',
    pageTitle: 'Molecules & Atoms',
    tagline: 'Boiling water and electrolysing water both “change the water”, but one only moves the molecules and the other tears them apart and rebuilds — atoms stay, molecules change.',
    nav0: '0 Read a formula', nav1: '1 Boiling', nav2: '2 Electrolysis', nav3: '3 Physical or chemical', nav4: '4 Atom ledger', nav5: '5 Recap',
    el_H: 'hydrogen', el_O: 'oxygen', el_C: 'carbon', el_N: 'nitrogen',
    mH2: 'Hydrogen H₂', mO2: 'Oxygen O₂', mH2O: 'Water H₂O', mCO2: 'Carbon dioxide CO₂', mCH4: 'Methane CH₄', mNH3: 'Ammonia NH₃',
    unitC: '°C', unitEv: 'events', lblMol: 'Molecule counts (change)', lblAtom: 'Atom totals (constant)',
    s0k: 'Step 0 · Read a formula',
    s0t: 'What does the small number in H₂O mean?',
    s0e: 'This step asks: what does the 2 in H₂O say? An <strong>atom</strong> is the smallest piece that stays intact in a chemical change; a <strong>molecule</strong> is a small cluster of bonded atoms that acts as one unit of a substance. The small number after an element symbol counts atoms <strong>in one molecule</strong>. Pick a molecule, then drag the number of molecules: the coefficient in front of a formula counts how many of them.',
    s0stage: 'Ball-and-stick view: each colour is an element’s atoms, sticks show which atoms are bonded',
    s0canvas: 'Ball-and-stick picture of the chosen molecule repeated the chosen number of times, atoms coloured by element',
    s0mol: 'Pick a molecule', s0n: 'Number of molecules (coefficient)',
    s0ro: '{n} × {name}: atoms in each molecule {per}; total atoms {tot}.',
    s0result: 'Takeaway: the subscript counts atoms in one molecule, the coefficient counts molecules — do not mix them up. Bond angles and ball sizes here are schematic, not true scale.',
    s1k: 'Step 1 · Boiling',
    s1t: 'When water becomes steam, do the water molecules change?',
    s1e: 'This step asks: heating water until it boils into steam — does the molecule itself change, or only the distances between molecules? Drag the temperature and watch 12 water molecules (each is one oxygen atom bonded to two hydrogen atoms). Hotter means wilder shaking; near 100 °C they break free of each other and spread out as gas. Check whether each little cluster is still H₂O.',
    s1stage: 'Twelve water molecules (motion is schematic, not real speeds): each cluster is one oxygen atom and two hydrogen atoms',
    s1canvas: 'Twelve water molecules: packed and jiggling when cold, spreading out as gas near 100 °C, each still H₂O',
    s1t2: 'Temperature',
    s1ro: '{T} °C: {state}. {n} molecules, each still H₂O; total atoms {atoms}.',
    s1liq: 'liquid: molecules touch and only jiggle in place',
    s1boil: 'near boiling: molecules are breaking free and spreading',
    s1gas: 'gas: molecules far apart and flying freely',
    s1result: 'Takeaway: a change of state alters distances and motion, not the molecules, which stay H₂O (a physical change). Holds at normal pressure with a 100 °C boiling point; the arrangement here is schematic.',
    s2k: 'Step 2 · Electrolysis',
    s2t: 'Where do the water molecules go when current runs through water?',
    s2e: 'This step asks: what happens to water molecules under electric current, and what forms? The current tears water molecules apart and the hydrogen and oxygen atoms pair up anew: 2 H₂O → 2 H₂ + O₂. Set the number of water molecules and press “Run current”: with each reaction the water shrinks while hydrogen and oxygen molecules appear; see how many times more H₂ than O₂.',
    s2stage: 'Electrolysis cell: hydrogen collects on the left, oxygen on the right; each reaction splits 2 water molecules',
    s2canvas: 'Electrolysis cell: water molecules are split into hydrogen and oxygen molecules, twice as many H₂ as O₂',
    s2n: 'Starting water molecules', s2run: 'Run current, start reacting', s2reset: 'Refill water',
    s2ro: '{e} / {max} reactions done: H₂O {w}, H₂ {h}, O₂ {o}; H₂ ÷ O₂ = {ratio}; total atoms H {ah}, O {ao}.',
    s2zero: 'No current yet; {w} water molecules.',
    s2result: 'Takeaway: in a chemical change molecules are torn apart and atoms rejoin as new molecules (new substances); H₂ : O₂ = 2 : 1. Holds in this ideal case: complete splitting, no electrode losses.',
    s3k: 'Step 3 · Physical or chemical',
    s3t: 'How do you tell a physical change from a chemical one?',
    s3e: 'This step asks: what shows that a change makes a new substance? Compare the <strong>kinds of molecules</strong> before and after: if the kinds are unchanged (only position, spacing or mixing change) it is a <strong>physical change</strong>; if new kinds of molecules appear it is a <strong>chemical change</strong>. Pick a change, guess first, then see the verdict.',
    s3stage: 'Molecule lists before (left) and after (right): each line is a molecule kind and its count',
    s3canvas: 'Lists of molecule kinds before and after a change: same kinds means physical, new kinds means chemical',
    s3sc: 'Pick a change', s3phys: 'My guess: physical', s3chem: 'My guess: chemical',
    sc0: 'Ice melts into water', sc1: 'Water boils into steam', sc2: 'Electrolysis of water', sc3: 'Hydrogen burns in oxygen', sc4: 'Methane burns', sc5: 'Hydrogen and oxygen mixed (no spark)',
    s3before: 'Before', s3after: 'After', s3none: '(none)',
    s3ro: '{name}: before {b}, after {a}. The molecule kinds {diff} — verdict: {verdict}. {guess}',
    s3same: 'stayed the same', s3diff: 'changed',
    s3phyV: 'physical change', s3chmV: 'chemical change',
    s3g0: 'Guess first, then see whether you were right.',
    s3gOk: 'Your guess was right.', s3gNo: 'Your guess was off: look at whether the molecule kinds changed.',
    s3result: 'Takeaway: the criterion is molecule kinds (is there a new substance). Holds for molecular substances only; ionic compounds and metals need a separate criterion.',
    s4k: 'Step 4 · Atom ledger',
    s4t: 'When molecules regroup, do atoms appear or vanish?',
    s4e: 'This step asks: in methane burning, CH₄ + 2 O₂ → CO₂ + 2 H₂O, molecule kinds and counts all change — does the atom total? Drag “reactions done”: the top bars are molecules (they change), the bottom bars are atom totals per element (C, H, O).',
    s4stage: 'Top: counts of each molecule; bottom: atom totals per element (they stay level)',
    s4canvas: 'Two bar groups for methane burning: molecule counts change, atom totals do not',
    s4e2: 'Reactions done', s4reset: 'Back to before',
    s4ro: 'After {e} reactions: CH₄ {a}, O₂ {b}, CO₂ {c}, H₂O {d}; atom totals C {tc}, H {th}, O {to} (before: C {c0}, H {h0}, O {o0}).',
    s4result: 'Takeaway: molecules change, the atom ledger does not. Holds in this ideal case: start with 4 methane molecules, enough oxygen, no incomplete burning.',
    s5k: 'Step 5 · Recap', s5t: 'Tell the molecule–atom story to a friend',
    s5e: 'A physical change only moves molecules; a chemical change breaks them apart and rebuilds new ones from the same atoms.',
    f1t: 'Read a formula', f1b: 'Subscripts count atoms in one molecule; the coefficient counts molecules.',
    f2t: 'The test', f2b: 'Same molecule kinds: physical. New kinds appear: chemical (steps 1–3).',
    f3t: 'What stays', f3b: 'In a chemical change the atom kinds and totals stay; only the bonding changes (step 4).',
    modelT: 'Honest model notes',
    model1: 'Bond angles and sizes in ball-and-stick pictures are schematic; real atoms and electron clouds cannot be drawn this way.',
    model2: 'Particle motion is a deterministic sketch, not molecular dynamics; the boiling point assumes normal pressure (100 °C).',
    model3: 'This page covers molecules only; ionic compounds such as table salt and metals are not built from molecules and need a different criterion.',
    nextT: 'Keep going (on this site)',
    l1: 'Mass Conservation · step 1: split molecules into atoms and count each element',
    l2: 'Particles & States · step 2: melting loosens the particle pattern — a physical change',
    l3: 'Atomic Structure · step 1: what is inside an atom and what fixes the element'
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
