'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "化学",
    stageBadge: "初中",
    foot: "化学方程式配平 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '化学方程式配平 · 左右两边原子数一个都不能差',
    pageTitle: '化学方程式配平',
    tagline: '化学反应不会凭空多出或消失原子，所以方程式两边每种原子数必须相等——配平就是调系数，把每杆小天平都调平。',
    nav0: '0 为什么要配平', nav1: '1 从哪个元素下手', nav2: '2 奇数对偶数', nav3: '3 最简整数比', nav4: '4 自己试试', nav5: '5 收束',
    coef1: '第 1 个物质的系数', coef2: '第 2 个物质的系数', coef3: '第 3 个物质的系数', coef4: '第 4 个物质的系数',
    lblL: '反应物侧', lblR: '生成物侧', lblBal: '平', lblOff: '不平',
    rx0: '氢气 + 氧气 → 水', rx3: '氮气 + 氢气 → 氨', rx4: '丙烷燃烧', rx5: '氯酸钾加热分解', rx6: '铝 + 盐酸', rx7: '镁燃烧',
    s0k: '第 0 步 · 为什么要配平',
    s0t: 'H₂ + O₂ → H₂O 这样写，哪里不对？',
    s0e: '这一步要回答：把氢气和氧气生成水写成 H₂ + O₂ → H₂O，为什么还不能算对？<strong>化学方程式</strong>用化学式和箭头表示反应：箭头左边是<strong>反应物</strong>，右边是<strong>生成物</strong>。化学式前面的数字叫<strong>系数</strong>（有几个这样的分子，等于 1 时省略不写）；化学式里的小下标则是一个分子里的原子数，配平时<strong>只改系数，不改下标</strong>。每种原子各有一杆小天平，左边和右边的个数不等就会翘起来。拖系数，让每杆天平都平。',
    s0stage: '每个元素一杆小天平：左盘是反应物侧该原子的总数，右盘是生成物侧；平了变绿，翘了变粉',
    s0canvas: '氢和氧两杆小天平，系数改变时两侧原子数与横梁倾斜随之变化',
    s0ro: '{eq}：{tally}。{verdict}',
    s0ok: '两杆都平了：这个方程式配平了。',
    s0no: '还没平：有元素左右个数不等，先改系数。',
    s0result: '结论：配平的要求是每种原子左右总数相等。条件：只改系数、不改化学式；本页反应都按理想的完全反应处理。',
    s1k: '第 1 步 · 从哪个元素下手',
    s1t: '一个反应里有好几种元素，先配哪一种？',
    s1e: '这一步要回答：甲烷燃烧 CH₄ + O₂ → CO₂ + H₂O，几种原子都不平时，按什么顺序配最省事？经验是先配只出现在一种反应物、一种生成物里的元素（这里是 C、H），最后才配到处都有的氧。拖滑杆走完 4 个阶段，看哪一杆天平在哪一步被调平。',
    s1stage: '三杆小天平：碳、氢、氧；滑杆走到第几阶段，系数就是该阶段的结果',
    s1canvas: '甲烷燃烧的三杆小天平，随阶段依次被调平：先碳、再氢、最后氧',
    s1st: '配平阶段',
    st0: '起点：所有系数都是 1',
    st1: '先看碳：左 1 个、右 1 个，已经平，系数不用动',
    st2: '再配氢：左 4 个、右 2 个，把 H₂O 的系数改成 2，氢平了',
    st3: '最后配氧：右边 CO₂ 里 2 个 + 2 个 H₂O 里 2 个 = 4 个，把 O₂ 的系数改成 2，氧也平了',
    s1ro: '阶段 {st}：{note}。当前 {eq}，{tally}。',
    s1result: '结论：先配出现次数少的元素，最后配氧或氢这类到处都有的。条件：这是一条经验顺序，不是唯一方法；有的反应需要先配奇数。',
    s2k: '第 2 步 · 奇数对偶数',
    s2t: 'Fe + O₂ → Fe₂O₃，氧一边是 2、一边是 3，怎么办？',
    s2e: '这一步要回答：氧原子左边每个 O₂ 带 2 个，右边每个 Fe₂O₃ 带 3 个，怎样才能相等？办法是找 2 和 3 的最小公倍数 6：让左边有 6 个氧、右边也有 6 个氧，再回头配铁。拖系数试，卡住了点「给个提示」，会告诉你下一个该改哪个系数。',
    s2stage: '铁、氧两杆小天平；系数改变时，两边原子数立刻重算',
    s2canvas: '铁和氧两杆小天平，系数调到 4、3、2 时同时平衡',
    s2hint: '给个提示', s2reset: '系数全设为 1',
    s2ro: '{eq}：{tally}。{verdict}',
    s2hintMsg: '提示：下一个该把第 {i} 个物质的系数改成 {v}（最小整数解里它是 {v}）。',
    s2solved: '配平了，而且是最简整数比。',
    s2solvedBig: '平了，但各系数还可以同除以 {g}，化成最简整数比。',
    s2result: '结论：奇数对偶数时，用最小公倍数找系数。条件：要求系数是正整数；有解的反应才能这样配。',
    s3k: '第 3 步 · 最简整数比',
    s3t: '4 H₂ + 2 O₂ → 4 H₂O 也平，为什么答案写 2 : 1 : 2？',
    s3e: '这一步要回答：系数同时乘 2、乘 3 之后仍然平，为什么还要写最简的那一组？因为配平给出的是分子个数的<strong>比例</strong>，约定写成最小的整数比（各系数没有大于 1 的公因数）。拖倍数 k，看原子数同步放大，天平始终是平的。',
    s3stage: '氢、氧两杆小天平：倍数 k 变大，两侧原子数同比放大，仍然平衡',
    s3canvas: '氢氧反应的小天平：倍数变化时数量变大但始终平衡',
    s3k2: '倍数 k',
    s3ro: '{eq}：{tally}。{verdict}',
    s3simple: '最简整数比（系数没有公因数）。',
    s3notSimple: '平衡，但系数有公因数 {g}，还可以约简。',
    s3result: '结论：配平结果取最小的整数比。条件：系数必须是正整数（不能有半个分子）；比例由原子守恒决定。',
    s4k: '第 4 步 · 自己试试',
    s4t: '换几个反应，自己把它们配平',
    s4e: '这一步要回答：给你一个没见过的反应，怎么用前面的办法把它配平？选一个反应，拖系数，直到每杆天平都平，并且是最简整数比。每配对一个反应，会记入下面的完成清单。',
    s4stage: '小天平随你的系数实时更新；全部变绿且系数没有公因数才算完成',
    s4canvas: '你选的反应的小天平：每个元素一杆',
    s4rx: '选一个反应', s4reset: '系数全设为 1',
    s4ro: '{eq}：{tally}。{verdict} 已完成 {n} / {tot} 个：{list}',
    s4done: '完成',
    s4list0: '（还没有）',
    s4result: '结论：先配出现次数少的元素，奇偶不齐用最小公倍数，最后约成最简整数比。条件：方法对本页这类简单反应有效；复杂的氧化还原反应需要更系统的方法。',
    s5k: '第 5 步 · 收束', s5t: '把配平说给别人听',
    s5e: '配平 = 调系数，让每种原子左右个数相等，并化成最简整数比。',
    f1t: '规则', f1b: '只改系数、不改下标；每个元素一杆天平，全部调平。',
    f2t: '顺序', f2b: '先配只出现一次的元素，最后配氧、氢；奇偶不齐用最小公倍数。',
    f3t: '检查', f3b: '数一遍两边每种原子；系数化成最简整数比。',
    modelT: '模型实话',
    model1: '本页把反应都当作完全进行的理想反应，不讨论反应能否发生、速度或可逆性。',
    model2: '小天平只数原子个数；真实配平还要考虑电荷（离子方程式）和状态符号。',
    model3: '提示和最小整数解由程序穷举到系数 12 得出；超出这个范围的反应本页不涉及。',
    nextT: '继续看（站内）',
    l1: '质量守恒 · 第 2 步：配不平时，原子数和天平质量同时报警',
    l2: '分子与原子 · 第 4 步：分子变、原子账不变',
    l3: '化学平衡 · 第 0 步：反应其实可以两头走（本页只讲单向的理想反应）'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Chemistry",
    stageBadge: "Junior High",
    foot: "Balancing Chemical Equations · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Balancing Chemical Equations · Every Atom Count Must Match',
    pageTitle: 'Balancing Chemical Equations',
    tagline: 'Reactions never create or destroy atoms, so every element must have equal counts on both sides — balancing means adjusting coefficients until every little scale is level.',
    nav0: '0 Why balance', nav1: '1 Where to start', nav2: '2 Odd meets even', nav3: '3 Simplest ratio', nav4: '4 Try it', nav5: '5 Recap',
    coef1: 'Coefficient of substance 1', coef2: 'Coefficient of substance 2', coef3: 'Coefficient of substance 3', coef4: 'Coefficient of substance 4',
    lblL: 'Reactants', lblR: 'Products', lblBal: 'level', lblOff: 'off',
    rx0: 'Hydrogen + oxygen → water', rx3: 'Nitrogen + hydrogen → ammonia', rx4: 'Propane burning', rx5: 'Potassium chlorate decomposing', rx6: 'Aluminium + hydrochloric acid', rx7: 'Magnesium burning',
    s0k: 'Step 0 · Why balance',
    s0t: 'What is wrong with writing H₂ + O₂ → H₂O?',
    s0e: 'This step asks: why is H₂ + O₂ → H₂O, hydrogen and oxygen making water, not yet a correct equation? A <strong>chemical equation</strong> uses formulas and an arrow: <strong>reactants</strong> on the left, <strong>products</strong> on the right. The number in front of a formula is its <strong>coefficient</strong> (how many of that molecule; omitted when it is 1); the small subscripts inside a formula count atoms in one molecule, so when balancing you <strong>change coefficients only, never subscripts</strong>. Each element gets a little scale; unequal counts tip it. Drag the coefficients until every scale is level.',
    s0stage: 'One little scale per element: the left pan is that atom’s total on the reactant side, the right pan the product side; green when level, pink when off',
    s0canvas: 'Hydrogen and oxygen scales: atom totals and beam tilt change with the coefficients',
    s0ro: '{eq}: {tally}. {verdict}',
    s0ok: 'Both scales are level: the equation is balanced.',
    s0no: 'Not level yet: some element differs between sides, so change a coefficient.',
    s0result: 'Takeaway: balancing means each element has equal totals on both sides. Holds when only coefficients change, never formulas; all reactions here are treated as ideal and complete.',
    s1k: 'Step 1 · Where to start',
    s1t: 'With several elements to fix, which one first?',
    s1e: 'This step asks: in methane burning, CH₄ + O₂ → CO₂ + H₂O, when several atoms are off, in what order is balancing easiest? A good habit is to start with elements that show up in only one reactant and one product (here C and H) and leave oxygen, which is everywhere, for last. Drag the slider through four stages and see which scale gets levelled when.',
    s1stage: 'Three little scales: carbon, hydrogen, oxygen; the stage slider sets the coefficients to that stage’s result',
    s1canvas: 'Three scales for methane burning being levelled in turn: carbon, then hydrogen, then oxygen',
    s1st: 'Balancing stage',
    st0: 'Start: every coefficient is 1',
    st1: 'Carbon first: 1 on the left, 1 on the right, already level, nothing to change',
    st2: 'Then hydrogen: 4 on the left, 2 on the right; make the H₂O coefficient 2 and hydrogen levels',
    st3: 'Oxygen last: the right has 2 in CO₂ plus 2 in two H₂O = 4, so make the O₂ coefficient 2 and oxygen levels too',
    s1ro: 'Stage {st}: {note}. Now {eq}, {tally}.',
    s1result: 'Takeaway: fix the elements that appear least often first and leave everywhere-elements like O or H for last. A rule of thumb, not the only method; some reactions need an odd count handled first.',
    s2k: 'Step 2 · Odd meets even',
    s2t: 'In Fe + O₂ → Fe₂O₃ oxygen is 2 on one side and 3 on the other — now what?',
    s2e: 'This step asks: each O₂ on the left holds 2 oxygen atoms and each Fe₂O₃ on the right holds 3 — how can the totals match? Use the least common multiple of 2 and 3, which is 6: get 6 oxygen atoms on each side, then go back and fix iron. Drag the coefficients; if you are stuck press “Give me a hint” to be told which coefficient to change next.',
    s2stage: 'Iron and oxygen scales; the atom counts on both sides are recomputed as you change coefficients',
    s2canvas: 'Iron and oxygen scales both level when the coefficients reach 4, 3, 2',
    s2hint: 'Give me a hint', s2reset: 'Set all coefficients to 1',
    s2ro: '{eq}: {tally}. {verdict}',
    s2hintMsg: 'Hint: change the coefficient of substance {i} to {v} next (it is {v} in the smallest whole-number solution).',
    s2solved: 'Balanced, and in the simplest whole-number ratio.',
    s2solvedBig: 'Level, but every coefficient can be divided by {g} to reach the simplest ratio.',
    s2result: 'Takeaway: when odd meets even, use the least common multiple to find the coefficients. Holds for positive whole-number coefficients and reactions that have a solution.',
    s3k: 'Step 3 · Simplest ratio',
    s3t: '4 H₂ + 2 O₂ → 4 H₂O is level too — so why write 2 : 1 : 2?',
    s3e: 'This step asks: multiply every coefficient by 2 or 3 and it still balances, so why write the smallest set? Balancing gives the <strong>ratio</strong> of molecule counts, and by convention we write it as the smallest whole-number ratio (no common factor above 1). Drag the multiplier k and watch the atom counts scale up in step while the scales stay level.',
    s3stage: 'Hydrogen and oxygen scales: as k grows both pans grow in proportion and stay level',
    s3canvas: 'Hydrogen–oxygen scales: counts grow with the multiplier but stay balanced',
    s3k2: 'Multiplier k',
    s3ro: '{eq}: {tally}. {verdict}',
    s3simple: 'Simplest whole-number ratio (no common factor).',
    s3notSimple: 'Level, but the coefficients share a factor of {g}, so it can be reduced.',
    s3result: 'Takeaway: the balanced result is written as the smallest whole-number ratio. Holds for positive whole coefficients (no half molecules); the ratio is fixed by conservation of atoms.',
    s4k: 'Step 4 · Try it',
    s4t: 'Swap reactions and balance them yourself',
    s4e: 'This step asks: given a reaction you have not seen, how do you balance it with the methods so far? Pick a reaction and drag coefficients until every scale is level and the ratio is in simplest form. Each reaction you finish goes into the checklist below.',
    s4stage: 'The scales follow your coefficients live; all green and no common factor counts as done',
    s4canvas: 'Scales for the chosen reaction, one per element',
    s4rx: 'Pick a reaction', s4reset: 'Set all coefficients to 1',
    s4ro: '{eq}: {tally}. {verdict} Finished {n} / {tot}: {list}',
    s4done: 'done',
    s4list0: '(none yet)',
    s4result: 'Takeaway: start with the least frequent elements, use the least common multiple for odd/even mismatches, then reduce to the simplest ratio. Works for simple reactions like these; complex redox reactions need a more systematic method.',
    s5k: 'Step 5 · Recap', s5t: 'Explain balancing to a friend',
    s5e: 'Balancing = adjusting coefficients so each atom count matches on both sides, then reducing to the simplest whole-number ratio.',
    f1t: 'Rule', f1b: 'Change coefficients only, never subscripts; one scale per element, all level.',
    f2t: 'Order', f2b: 'Start with elements that appear once; leave O and H for last; use the least common multiple for odd/even mismatches.',
    f3t: 'Check', f3b: 'Count every atom on both sides; reduce coefficients to the simplest whole-number ratio.',
    modelT: 'Honest model notes',
    model1: 'Every reaction here is treated as ideal and complete; whether it happens, how fast, or whether it is reversible is out of scope.',
    model2: 'The scales count atoms only; real balancing also tracks charge (ionic equations) and state symbols.',
    model3: 'The hints and smallest solutions come from an exhaustive search up to coefficient 12; reactions beyond that are not covered.',
    nextT: 'Keep going (on this site)',
    l1: 'Mass Conservation · step 2: when it does not balance, atom counts and the balance mass both warn',
    l2: 'Molecules & Atoms · step 4: molecules change, the atom ledger does not',
    l3: 'Chemical Equilibrium · step 0: reactions can run both ways (this page covers one-way ideal reactions only)'
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
