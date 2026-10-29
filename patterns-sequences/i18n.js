/* patterns-sequences: one dictionary, zh/en keys identical. All page text goes through t(). */
const STR = {
  zh: {
    docTitle: '找规律 · 不画也能报出第 100 个', back: '← 知识索引', pageTitle: '找规律 · 不画也能报出第 100 个',
    tagline: '用火柴棒摆图形：数出前几个，找到“每次多几根”，就能直接算出任意第 n 个。',
    navLabel: '步骤导航', nav0: '0 数一数', nav1: '1 找增量', nav2: '2 拆成组', nav3: '3 换图形', nav4: '4 增量会变', nav5: '5 终章',
    category: '数学基础', stage: '小学', foot: '由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code',
    langLabel: '语言',
    s0k: '第 0 步 · 数一数', s0t: '第 n 个图要用几根火柴？',
    s0e: '这一步要回答：把 n 个正方形排成一排，一共要几根火柴？“第 n 个图”就是由 n 个正方形连成的那一排；相邻的正方形共用中间那根火柴。拖动滑杆改变 n，再按“逐根数一遍”，看数到的根数怎样随 n 增长。',
    s0cv: '火柴棒摆成的一排正方形', s0n: '正方形个数 n', s0count: '逐根数一遍', s0reset: '重置计数',
    s0ro: '第 {n} 个图：共 {total} 根火柴（按图上每根线段逐根数出）。', s0roCount: '正在数：已数 {k} / {total} 根', s0roDone: '数完了：{total} 根。',
    s1k: '第 1 步 · 找增量', s1t: '每多摆一个正方形，多用几根？',
    s1e: '这一步要回答：相邻两个图相比，火柴多了几根？这个“多出来的根数”叫<strong>增量</strong>（后一个图的总数减前一个图的总数）。反复点“再摆一个”，橙色线段是这次新加的，上面的数列把每次的总数和增量都记下来。',
    s1cv: '逐个添加正方形，并记录总数与增量', s1add: '再摆一个', s1reset: '重置为第 1 个图',
    s1ro: '现在是第 {n} 个图，共 {total} 根；这次新加 {d} 根（{total} − {prev}）。', s1ro1: '第 1 个图：4 根，还没有“上一个图”可比，再摆一个试试。', s1roSame: '增量一直是 {d}：每次新加的形状完全一样，所以每次都多这么多根。',
    s2k: '第 2 步 · 拆成组', s2t: '不用画，怎样直接算出第 100 个图？',
    s2e: '这一步要回答：能不能不摆图，直接得到第 n 个的火柴数？看颜色：灰色的 1 根是最左边的“起头”，其余每个正方形各带 3 根同色的新火柴（上、右、下）。所以总数 = 1 + 3 × n。滑杆改变 n，数字框直接试很大的 n，只算不画。',
    s2cv: '把火柴按“起头 1 根 + 每格 3 根”染色', s2n: '正方形个数 n', s2big: '试大数 n（只算不画）',
    s2ro: '第 {n} 个图：1 + 3 × {n} = {total} 根。', s2roBig: 'n = {n}：1 + 3 × {n} = {total} 根；与逐根构造计数 {check} 一致。',
    s2roMore: '（图中只画出前 {shown} 格，其余用省略号表示）',
    s3k: '第 3 步 · 换图形', s3t: '换成三角形或六边形，同样的办法还管用吗？',
    s3e: '这一步要回答：规律的“每次多几根”由什么决定？选一种图形链，相邻两个图形共用一条边。下方折线图的横轴是 n，纵轴是火柴总数，点是真实数出来的。点排成一条直线，说明增量不变；这个不变的增量就是直线上升的“台阶高度”。',
    s3cv: '图形链和火柴总数折线图', s3kind: '选择图形', kSq: '正方形', kTri: '三角形', kHex: '六边形', s3n: '图形个数 n',
    axisN: '个数 n', axisSticks: '火柴总数',
    s3ro: '{kind}链：第 {n} 个图共 {total} 根；增量恒为 {d}，起头 1 根，所以总数 = {d} × n + 1。',
    s4k: '第 4 步 · 增量会变', s4t: '如果每次多出来的根数不一样呢？',
    s4e: '这一步要回答：增量不是常数时，总数还排成直线吗？下面是点阵台阶：第 1 行 1 个点，第 2 行 2 个点……每多一行，新加的点数比上一次多 1。滑杆改变行数 n，看总数和增量两行数列，以及下方的柱子怎样越长越快。',
    s4cv: '点阵台阶与总数、增量数列', s4n: '行数 n', s4ro: '{n} 行台阶共 {total} 个点；刚加的第 {n} 行有 {d} 个点。增量 {list} 一次比一次大 1，不再是常数。',
    s4roLine: '总数会越涨越快，所以不再排成直线；仍有规律：把台阶拼成两份能得到 n(n+1)/2。',
    s5k: '第 5 步 · 终章', s5t: '规律 = 起点 + 每次增加的量',
    s5e: '这一步要回答：学会找规律之后，能反过来用吗？输入一个火柴总数 S，页面按正方形链的规则 S = 3n + 1 反推 n，并检查它是不是整数。',
    s5in: '火柴总数 S', s5roLow: 'S = {s}：只摆 1 个正方形就要 4 根，所以 S 至少是 4。', s5roOk: 'S = {s}：3n + 1 = {s}，n = {n}。所以第 {n} 个图正好用 {s} 根。', s5roNo: 'S = {s}：没有哪个正方形链正好用 {s} 根（(S − 1) ÷ 3 = {q} 不是整数）。',
    recapTitle: '回顾', recap1: '数前几个，算出相邻总数的增量。', recap2: '增量不变时，总数 = 增量 × n + 起头；增量逐次变大时，总数增长越来越快。', recap3: '用公式算出的数，要和真实摆出来数出的数对上，才算规律成立。',
    modelTitle: '模型范围与局限', modelText: '本页的“规律”只对这里规定的摆法成立：一排图形，相邻两个只共用一条边。换一种摆法（比如摆成两行）得到的是另一条规律；而且从前几项看出的规律，没有验证到第 n 项之前，只是猜想。',
    linkLin: '→ 去一次函数页：增量不变的点为什么排成一条直线', linkArea: '→ 去乘法是面积页：把一块拆成两块好算的', linkEq: '→ 去方程天平页：已知总数反推 n 是怎么一步步解出来的',
    done: '本页完成：你能数、找增量、写出规律并反推。'
  },
  en: {
    docTitle: 'Patterns · Name the 100th Without Drawing It', back: '← Knowledge Index', pageTitle: 'Patterns · Name the 100th Without Drawing It',
    tagline: 'Build shapes from matchsticks: count the first few, find how many are added each time, then compute any figure n directly.',
    navLabel: 'Step navigation', nav0: '0 Count', nav1: '1 Find the step', nav2: '2 Group', nav3: '3 Other shapes', nav4: '4 Growing steps', nav5: '5 Wrap-up',
    category: 'Mathematical Foundations', stage: 'Primary', foot: 'Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建',
    langLabel: 'Language',
    s0k: 'STEP 0 · COUNT', s0t: 'How many sticks does figure n need?',
    s0e: 'This step answers: if n squares are lined up in a row, how many matchsticks are used? “Figure n” means the row of n squares, where neighbouring squares share the stick between them. Drag the slider to change n, then press “Count stick by stick” and watch the tally grow.',
    s0cv: 'A row of squares made of matchsticks', s0n: 'Number of squares n', s0count: 'Count stick by stick', s0reset: 'Reset count',
    s0ro: 'Figure {n}: {total} sticks in all (counted from the segments drawn).', s0roCount: 'Counting: {k} of {total} sticks so far', s0roDone: 'Done counting: {total} sticks.',
    s1k: 'STEP 1 · FIND THE STEP', s1t: 'Each new square costs how many sticks?',
    s1e: 'This step answers: compared with the previous figure, how many more sticks are there? That extra amount is the <strong>step</strong> (this figure’s total minus the previous figure’s total). Press “Add another square”; the orange sticks are the new ones, and the sequence above records every total and every step.',
    s1cv: 'Squares added one at a time, with totals and steps recorded', s1add: 'Add another square', s1reset: 'Reset to figure 1',
    s1ro: 'Now figure {n}: {total} sticks; {d} new this time ({total} − {prev}).', s1ro1: 'Figure 1: 4 sticks. There is no earlier figure to compare with yet, so add another.', s1roSame: 'The step stays {d}: each new piece has the same shape, so it always adds the same number.',
    s2k: 'STEP 2 · GROUP', s2t: 'How can we get figure 100 without drawing it?',
    s2e: 'This step answers: can we skip the drawing and compute the total for figure n? Read the colours: the one grey stick on the far left is the “starter”; every square then brings 3 new sticks of its own colour (top, right, bottom). So total = 1 + 3 × n. Drag n, or type a large n into the box and only calculate.',
    s2cv: 'Sticks coloured as “1 starter + 3 per square”', s2n: 'Number of squares n', s2big: 'Try a big n (calculate only)',
    s2ro: 'Figure {n}: 1 + 3 × {n} = {total} sticks.', s2roBig: 'n = {n}: 1 + 3 × {n} = {total} sticks; matches the stick-by-stick construction count {check}.',
    s2roMore: '(Only the first {shown} squares are drawn; the dots stand for the rest.)',
    s3k: 'STEP 3 · OTHER SHAPES', s3t: 'With triangles or hexagons, does the same method work?',
    s3e: 'This step answers: what decides “how many more each time”? Pick a chain of shapes in which neighbours share one side. In the chart below, the x-axis is n, the y-axis is the total number of sticks, and each dot is a real count. If the dots fall on a straight line, the step is constant; that constant is the height of each stair.',
    s3cv: 'A chain of shapes and a chart of stick totals', s3kind: 'Choose a shape', kSq: 'Squares', kTri: 'Triangles', kHex: 'Hexagons', s3n: 'Number of shapes n',
    axisN: 'n shapes', axisSticks: 'sticks',
    s3ro: '{kind} chain: figure {n} uses {total} sticks; the step is always {d} and the starter is 1, so total = {d} × n + 1.',
    s4k: 'STEP 4 · GROWING STEPS', s4t: 'What if the number added changes every time?',
    s4e: 'This step answers: when the step is not constant, do the totals still form a line? Below is a staircase of dots: row 1 has 1 dot, row 2 has 2 dots, and so on, so each new row adds one more dot than the last. Drag the number of rows n and read the totals, the steps, and the bars that grow faster and faster.',
    s4cv: 'Dot staircase with totals and steps', s4n: 'Number of rows n', s4ro: '{n} rows hold {total} dots; the row just added (row {n}) has {d}. The steps {list} each grow by 1, so they are not constant.',
    s4roLine: 'The totals climb faster and faster, so they no longer sit on a line. A pattern is still there: two staircases fit together into n(n+1)/2.',
    s5k: 'STEP 5 · WRAP-UP', s5t: 'A pattern = a start + the amount added each time',
    s5e: 'This step answers: once you know the rule, can you run it backwards? Enter a total number of sticks S; the page uses the squares-chain rule S = 3n + 1 to find n and checks whether it is a whole number.',
    s5in: 'Total sticks S', s5roLow: 'S = {s}: even one square needs 4 sticks, so S must be at least 4.', s5roOk: 'S = {s}: 3n + 1 = {s}, so n = {n}. Figure {n} uses exactly {s} sticks.', s5roNo: 'S = {s}: no chain of squares uses exactly {s} sticks ((S − 1) ÷ 3 = {q} is not a whole number).',
    recapTitle: 'Recap', recap1: 'Count the first few figures and work out the step between neighbouring totals.', recap2: 'If the step is constant, total = step × n + starter; if the step keeps growing, the totals climb faster and faster.', recap3: 'A formula only counts as the rule when its numbers match real, drawn counts.',
    modelTitle: 'Scope and limits of this model', modelText: 'The rule here holds only for the layout we fixed: one row of shapes, neighbours sharing exactly one side. Another layout (say, two rows) has a different rule, and a pattern read off the first few terms stays a conjecture until it is checked further.',
    linkLin: '→ Linear Functions: why a constant step puts points on a straight line', linkArea: '→ Multiplication as Area: split a hard block into two easy ones', linkEq: '→ Equations on a Balance: how to solve backwards from a known total to n',
    done: 'Page complete: you can count, find the step, state the rule and run it backwards.'
  }
};
let currentLang = 'en';
let memLang = null;
function t(key, vars) {
  const d = STR[currentLang] || {};
  const s = Object.prototype.hasOwnProperty.call(d, key) ? d[key] : key;
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ''));
}
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  memLang = currentLang;
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (e) { /* memory fallback */ }
  if (typeof document === 'undefined') return;
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { const on = b.dataset.lang === currentLang; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (e) { saved = memLang; }
  setLang(saved === 'zh' || saved === 'en' ? saved : ((typeof navigator !== 'undefined' && navigator.language) || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
if (typeof module !== 'undefined') module.exports = { STR, t, setLang };
