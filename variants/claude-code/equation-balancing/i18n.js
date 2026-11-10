'use strict';
// Equation-balancing lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '化学方程式配平 · 每种原子一杆秤',
    back: '← 知识索引',
    compare: '对照另一版本：化学方程式配平 →',
    navLabel: '方程式配平步骤导航',
    tagline: '化学反应只是把原子拆开、重新组合，原子既不会多出来，也不会消失。所以一个方程式写得对不对，有一个很朴素的检验：箭头两边每种原子各数一遍，个数必须一样。本页给每种元素配一杆秤，你来调分子前面的数字，直到所有秤都平——再看看为什么只能调这个数字、遇到奇数怎么办、怎样一步算出答案。',
    nav0: '0 数一数', nav1: '1 只改系数', nav2: '2 一杆一杆来', nav3: '3 先用半个', nav4: '4 秤就是等式', nav5: '5 自己配', nav6: '6 收束',
    cAria: '分子示意图与每种元素的秤',
    resetCoef: '系数全部设回 1',
    eqLeft: '反应物', eqRight: '生成物',
    minus: '减少 {f} 的系数', plusA: '增加 {f} 的系数',
    cntItem: '{el}：左 {L}，右 {R}',
    stOk: '每杆秤都平了：已配平，而且是最简整数比。',
    stOkNotMin: '每杆秤都平了，但系数还有公因数 {g}，可以同时除以 {g} 化成最简。',
    stOkHalf: '每杆秤都平了，但有半个分子：把所有系数 ×2 才是能写进方程式的答案。',
    stBad: '还有 {n} 种元素不平：{list}。',
    lgMol: '分子里的原子（颜色见下）：',
    lgHalf: '虚线框 = 半个分子（并不存在）',

    s0k: '第 0 步 · 先数清楚',
    s0t: '氢气燃烧生成水，写成 H₂ + O₂ → H₂O 对吗？',
    s0e: '这一步要回答：这个式子两边的原子数对得上吗？先认识方程式的写法。<strong>化学方程式</strong>用化学式描述反应：箭头左边是<strong>反应物</strong>（反应前的物质），右边是<strong>生成物</strong>（反应后的物质）。化学式右下角的小数字叫<strong>下标</strong>，表示一个分子里这种原子有几个：H₂O 里有 2 个 H、1 个 O（1 不写）。写在化学式前面的大数字叫<strong>系数</strong>，表示有几个这样的分子（1 也不写）。反应只是原子重新组合，原子不会凭空出现或消失（<a class="xlink" href="../../../chemistry/reactions/mass-conservation/#step1">→ 质量守恒页第 1 步：把分子拆成原子来数</a>），所以每种元素在箭头两边的原子数必须相等。调系数让它们相等，就叫<strong>配平</strong>。图上半部分是分子示意，每个小球是一个原子；下半部分每种元素一杆秤，左盘放左边的这种原子，右盘放右边的，哪边多秤就往哪边沉。',
    s0hint: '观察顺序：先不动任何按钮，读下方两杆秤：H 左 2 右 2，是平的；O 左 2 右 1，往左沉。把 H₂O 的系数加到 2：O 秤平了，但 H 秤变成左 2 右 4、往右沉。再把 H₂ 加到 2，两杆都平。配平常常是这样「按下葫芦浮起瓢」，要来回调几次。',

    s1k: '第 1 步 · 能改的只有系数',
    s1t: '让氧平衡，为什么不能直接把 H₂O 改成 H₂O₂？',
    s1e: '这一步要回答：上一步氧不平时，有两种「省事」的改法：在 H₂O 前面加系数 2，或者把 H₂O 的下标改成 H₂O₂。两种改法都能让氧的个数对上，哪一种合法？关键在于：<strong>下标决定这是什么物质</strong>，<strong>系数只决定有几个</strong>。改系数，水还是水，只是变成了 2 个水分子；改下标，H₂O₂ 就成了另一种物质——过氧化氢（常用来消毒伤口的「双氧水」），它根本不是这个反应的生成物。所以配平时只能改系数，化学式本身一个字也不能动。',
    fixCoef: '改系数：写成 2H₂O', fixSub: '改下标：写成 H₂O₂',
    r1coef: '改系数：H₂ + O₂ → 2H₂O。氧平了（左 2，右 2），氢变成左 2 右 4，还需要接着把 H₂ 改成 2。但生成物仍然是水，每个分子仍是 2 个 H、1 个 O。',
    r1sub: '改下标：H₂ + O₂ → H₂O₂。两杆秤都平了（H 2 = 2，O 2 = 2），但这写的是氢气和氧气生成过氧化氢，已经不是「氢气燃烧生成水」这个反应了。数字对上了，物质却错了。',
    s1hint: '观察顺序：分别按两个按钮，看图中右边生成物的分子：改系数时还是「两个白球夹一个红球」的水分子，只是多了一个；改下标时分子变成了两个红球连在一起的另一种形状。秤平不平只是必要条件，物质写对是前提。',
    q1: '想一想：Fe + O₂ → Fe₂O₃ 里氧不平（左 2，右 3），哪种做法是对的？',
    q1a: '把 Fe₂O₃ 改成 Fe₂O₂，这样两边都是 2 个 O', q1b: '只改各物质前面的系数，例如在 O₂ 和 Fe₂O₃ 前面写数字', q1c: '把 O₂ 改成 O₃，这样两边都是 3 个 O',
    check: '核对',
    fb1ok: '对。Fe₂O₂ 和 O₃（臭氧）都是改了下标、换了物质；只能改系数。这个反应配平后是 4Fe + 3O₂ → 2Fe₂O₃。',
    fb1no: '再看看：哪个选项没有改动任何化学式？改了下标，就换成了另一种物质。',

    s2k: '第 2 步 · 一杆一杆来',
    s2t: '甲烷燃烧有三种元素，先调哪杆秤？',
    s2e: '这一步要回答：天然气的主要成分甲烷燃烧，CH₄ + O₂ → CO₂ + H₂O，三种元素 C、H、O 都要平，从哪里下手最省事？一个好用的顺序是：<strong>先配出现在物质最少的元素，最后配单独成一种物质的元素</strong>。这里 C 只在 CH₄ 和 CO₂ 里，H 只在 CH₄ 和 H₂O 里，先配它们；O 在 O₂、CO₂、H₂O 三处都有，但 O₂ 里只有 O，最后改 O₂ 的系数不会打乱已经平好的 C 和 H。这只是一个经验顺序，不是唯一做法，换个顺序也能配平，只是可能要多绕几步。',
    hintBtn: '提示下一步',
    hintFix: '提示：先看 {el}（左 {L}，右 {R}）。把 {f} 的系数改成 {to}。',
    hintLcm: '提示：先看 {el}（左 {L}，右 {R}）。只改一个系数补不齐：含 {el} 的分子里分别有 {per} 个 {el}，让两边都凑到它们的公倍数（例如 {lcm}）。',
    hintDone: '已经全部配平，不需要提示了。',
    log: '你的操作记录（共 {n} 次）：{list}',
    logEmpty: '你的操作记录：还没有改动。',
    s2hint: '观察顺序：先只看 C 秤（已经平了），再看 H 秤：左 4 右 2，把 H₂O 改成 2。然后看 O 秤：右边现在是 2 + 2 = 4 个 O，把 O₂ 改成 2。卡住时按「提示下一步」，它会按上面说的顺序指出下一杆不平的秤。操作记录会列出你每一次改动，可以回头看是哪一步让哪杆秤平了。',

    s3k: '第 3 步 · 奇数怎么办',
    s3t: '乙烷燃烧时 O₂ 怎么也配不成整数，怎么办？',
    s3e: '这一步要回答：乙烷 C₂H₆ 燃烧，C₂H₆ + O₂ → CO₂ + H₂O。按上一步的顺序：C 要 2 个 CO₂，H 要 3 个 H₂O。这时右边的 O 是 2 × 2 + 3 = 7 个，是奇数；可每个 O₂ 带 2 个 O，几个 O₂ 都只能凑出偶数。一个办法是先允许<strong>半个分子</strong>：写 3.5 个 O₂，氧就平了。真实世界没有半个分子，所以最后把<strong>所有系数同时 ×2</strong>，得到全是整数的答案。所有系数同乘一个数，每杆秤两边都同样翻倍，平的仍然是平的。这一步的系数按钮每次加减 0.5。',
    double: '所有系数 ×2',
    s3hint: '观察顺序：先把 CO₂ 调到 2、H₂O 调到 3，看 C 和 H 两杆秤变平；再把 O₂ 一点点加到 3.5，O 秤也平了，但图里会出现一个虚线框的半个 O₂ 分子。按「所有系数 ×2」：系数变成 2、7、4、6，半个分子消失，三杆秤仍然是平的。',

    s4k: '第 4 步 · 每杆秤是一条等式',
    s4t: '能不能不靠试，直接算出丙烷燃烧的系数？',
    s4e: '这一步要回答：液化气里的丙烷燃烧，C₃H₈ + O₂ → CO₂ + H₂O，能不能像解题一样算出系数？用字母代替系数：a C₃H₈ + b O₂ → c CO₂ + d H₂O。每杆秤平，就是一条等式：左边的原子数 = 右边的原子数。三种元素给出三条等式（列在下面），四个未知数只有三条等式，所以先令 a = 1，再一条一条往下解：C 秤给出 c，H 秤给出 d，最后 O 秤给出 b。所有系数同时乘一个数也满足这些等式，所以配平的答案有无数组，都是<strong>最简整数比</strong>（各系数没有大于 1 的公因数）的整数倍；方程式按惯例写最简的那组。',
    solve: '令 a = 1，逐条解出',
    reduce: '约成最简',
    eqLine: '{el} 秤：{text}　→　{lhs} = {rhs}　{mark}',
    solving: '第 {k}/4 步：{what}',
    solveA: '令 a = 1', solveC: '由 C 秤 3a = c 得 c = 3', solveD: '由 H 秤 8a = 2d 得 d = 4', solveB: '由 O 秤 2b = 2c + d 得 b = 5',
    r4: '当前系数 a = {a}，b = {b}，c = {c}，d = {d}；最大公因数 {g}。{status}',
    s4hint: '观察顺序：先按「令 a = 1，逐条解出」，看系数按 a → c → d → b 的顺序依次填好，每填一个，对应的等式就打上 ✓。再按「所有系数 ×2」：2、10、6、8 也让三条等式都成立，读数显示公因数 2；按「约成最简」回到 1、5、3、4。本页用电脑把 1 到 12 的所有组合都试了一遍：能配平丙烷燃烧的只有 1、5、3、4 和 2、10、6、8 两组，正是最简比和它的 2 倍。',

    s5k: '第 5 步 · 自己配',
    s5t: '六个反应，你能各配平几个？',
    s5e: '这一步要回答：遇到没见过的反应，能不能用前面的办法自己配平？选一个反应，用 − / + 调系数，直到每杆秤都平并且是最简整数比，它就会记入完成清单。可以用的办法：先配出现在物质最少的元素；遇到奇偶不合，就让两边凑最小公倍数；需要时列出每种元素的等式来算。注意 Fe₂O₃、MgO、KCl 这类物质不是由分子组成的，图里把一个化学式单位画成一团，只是为了方便数原子。',
    rx_ammonia: '合成氨', rx_magnesium: '镁带燃烧', rx_chlorate: '氯酸钾分解', rx_iron: '炼铁', rx_lime: '熟石灰与盐酸', rx_aluminium: '铝与盐酸',
    done: '完成清单 {k}/6：{list}',
    doneNone: '完成清单 0/6：还没有配平的反应。',
    s5hint: '观察顺序：先选「合成氨」热身，再挑战「氯酸钾分解」（氧是 3 对 2，要凑 6）和「铝与盐酸」（氯是 1 对 3，氢是 1 对 2）。换反应时，当前反应的系数会重置为 1，已经完成的不会从清单里消失。「提示下一步」只指出一杆不平的秤和一个改法，不直接给出答案。',

    s6k: '第 6 步 · 收束', s6t: '配平，就是把每种原子的账对上',
    s6fin: '回顾。<strong>第 0 步</strong>：方程式两边每种元素的原子数必须相等，因为反应只是原子重新组合。<strong>第 1 步</strong>：只能改系数，改下标就换了物质。<strong>第 2 步</strong>：先配出现在物质最少的元素，单质（如 O₂）留到最后。<strong>第 3 步</strong>：遇到奇数，先用半个分子凑平，再把所有系数 ×2。<strong>第 4 步</strong>：每杆秤是一条等式，令一个系数为 1 就能逐条解出；答案写成最简整数比。<strong>第 5 步</strong>：同样的办法适用于各种反应。',
    formula: '每种元素：左边原子数 = 右边原子数\n原子数 = 系数 × 下标（对每种物质相加）\n答案取最简整数比',
    boundary: '适用范围：本页只数原子，不涉及离子方程式里的电荷平衡，也不标状态（气体、沉淀等）和反应条件（点燃、高温、催化剂）。方程式配平只说明原子守恒，不说明反应能不能发生、发生得多快、能不能进行到底。提示和「只有两组」的结论来自对系数 1 到 12 的穷举。',
    linksTitle: '接着去看',
    lk1: '→ 质量守恒 第 2 步：原子数对上了，反应前后的质量也就对上了',
    lk2: '→ 分子与原子 第 4 步：用「原子账本」区分物理变化和化学变化',
    lk3: '→ 燃烧三角 第 0 步：本页那些燃烧反应需要哪三个条件',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《化学方程式配平》的平行版本。'
  },
  en: {
    pageTitle: 'Balancing Chemical Equations · One Scale per Element',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Balancing Chemical Equations →',
    navLabel: 'Equation-balancing steps',
    tagline: 'A chemical reaction only takes atoms apart and puts them back together in new ways; no atom appears from nowhere and none disappears. So there is a plain test of whether an equation is right: count each kind of atom on both sides of the arrow, and the counts must match. This page gives every element its own scale. You adjust the numbers in front of the formulas until every scale is level, then see why that is the only number you may change, what to do about odd numbers, and how to work the answer out directly.',
    nav0: '0 Count', nav1: '1 Coefficients only', nav2: '2 One scale at a time', nav3: '3 Use a half first', nav4: '4 Scales are equations', nav5: '5 Your turn', nav6: '6 Wrap-up',
    cAria: 'Molecule picture and one balance scale per element',
    resetCoef: 'Set all coefficients back to 1',
    eqLeft: 'reactants', eqRight: 'products',
    minus: 'Decrease the coefficient of {f}', plusA: 'Increase the coefficient of {f}',
    cntItem: '{el}: left {L}, right {R}',
    stOk: 'Every scale is level: balanced, and in lowest whole numbers.',
    stOkNotMin: 'Every scale is level, but the coefficients share a factor of {g}; divide them all by {g} for the simplest form.',
    stOkHalf: 'Every scale is level, but there is half a molecule: multiply every coefficient by 2 to get an answer you can write down.',
    stBad: '{n} element(s) still unbalanced: {list}.',
    lgMol: 'Atoms in the molecules (colours below):',
    lgHalf: 'dashed box = half a molecule (does not exist)',

    s0k: 'Step 0 · Count first',
    s0t: 'Hydrogen burns to make water. Is H₂ + O₂ → H₂O right?',
    s0e: 'This step asks: do the atoms on the two sides of this equation match up? First, how an equation is written. A <strong>chemical equation</strong> describes a reaction with formulas: to the left of the arrow are the <strong>reactants</strong> (what you start with), to the right the <strong>products</strong> (what you end with). The small number at the lower right of a symbol is a <strong>subscript</strong>: how many of that atom are in one molecule. H₂O has 2 H and 1 O (a 1 is not written). The large number in front of a formula is a <strong>coefficient</strong>: how many of those molecules there are (again, 1 is not written). A reaction only rearranges atoms; none appear or vanish (<a class="xlink" href="../../../chemistry/reactions/mass-conservation/#step1">→ Conservation of mass, step 1: break molecules into atoms and count</a>). So each element must have the same number of atoms on both sides. Adjusting coefficients until they do is called <strong>balancing</strong>. The top of the picture shows the molecules, one ball per atom; underneath, each element has a scale, with that element’s atoms from the left side in the left pan and from the right side in the right pan. The scale tips towards the heavier side.',
    s0hint: 'What to try: before touching anything, read the two scales. H: left 2, right 2, level. O: left 2, right 1, tipped left. Raise the coefficient of H₂O to 2: the O scale levels, but H becomes left 2, right 4 and tips right. Now raise H₂ to 2 and both are level. Balancing often goes like this: fixing one scale upsets another, and you go back and forth a few times.',

    s1k: 'Step 1 · Only coefficients may change',
    s1t: 'Why not just change H₂O into H₂O₂ to fix the oxygen?',
    s1e: 'This step asks: when oxygen was off in the last step, there were two “quick” fixes: put a 2 in front of H₂O, or change the subscript to make H₂O₂. Both make the oxygen count match. Which one is allowed? The key: <strong>subscripts decide what the substance is</strong>; <strong>coefficients only decide how many</strong>. Change a coefficient and water is still water, just two molecules of it. Change a subscript and H₂O₂ is a different substance, hydrogen peroxide (the antiseptic in a first-aid kit), which is not a product of this reaction at all. So when balancing you may change coefficients only; the formulas themselves stay exactly as they are.',
    fixCoef: 'Change a coefficient: write 2H₂O', fixSub: 'Change a subscript: write H₂O₂',
    r1coef: 'Changing a coefficient: H₂ + O₂ → 2H₂O. Oxygen is level (left 2, right 2); hydrogen is now left 2, right 4, so H₂ still needs to become 2. But the product is still water, each molecule still 2 H and 1 O.',
    r1sub: 'Changing a subscript: H₂ + O₂ → H₂O₂. Both scales are level (H 2 = 2, O 2 = 2), but this now says hydrogen and oxygen make hydrogen peroxide. It is no longer the reaction “hydrogen burns to make water”. The numbers match; the substance is wrong.',
    s1hint: 'What to try: press each button and look at the product molecules in the picture. With the coefficient change it is still the water shape, one red ball between two white ones, just one more of them. With the subscript change the molecule has a new shape with two red balls joined. A level scale is necessary, but writing the right substances comes first.',
    q1: 'Think: in Fe + O₂ → Fe₂O₃ the oxygen is off (left 2, right 3). Which fix is correct?',
    q1a: 'Change Fe₂O₃ to Fe₂O₂ so both sides have 2 O', q1b: 'Change only the coefficients, e.g. put numbers in front of O₂ and Fe₂O₃', q1c: 'Change O₂ to O₃ so both sides have 3 O',
    check: 'Check',
    fb1ok: 'Right. Fe₂O₂ and O₃ (ozone) both change a subscript and so change the substance; only coefficients may change. Balanced, this reaction is 4Fe + 3O₂ → 2Fe₂O₃.',
    fb1no: 'Look again: which option leaves every formula untouched? Changing a subscript turns it into a different substance.',

    s2k: 'Step 2 · One scale at a time',
    s2t: 'Methane burning involves three elements. Which scale first?',
    s2e: 'This step asks: methane, the main part of natural gas, burns as CH₄ + O₂ → CO₂ + H₂O. All three elements, C, H and O, must balance. Where is the easiest place to start? A handy order: <strong>first the elements that appear in the fewest substances, last the element that forms a substance on its own</strong>. Here C appears only in CH₄ and CO₂, and H only in CH₄ and H₂O, so do those first. O appears in O₂, CO₂ and H₂O, but O₂ contains nothing else, so changing O₂ last cannot upset the C and H you have already levelled. This is a rule of thumb, not the only way; another order also works, it may just take more back-and-forth.',
    hintBtn: 'Hint for the next move',
    hintFix: 'Hint: look at {el} (left {L}, right {R}). Change the coefficient of {f} to {to}.',
    hintLcm: 'Hint: look at {el} (left {L}, right {R}). No single change fixes it: the molecules containing {el} hold {per} of it, so bring both sides to a common multiple (for example {lcm}).',
    hintDone: 'Everything is balanced; no hint needed.',
    log: 'Your moves ({n} so far): {list}',
    logEmpty: 'Your moves: nothing changed yet.',
    s2hint: 'What to try: look at the C scale first (already level), then H: left 4, right 2, so make H₂O 2. Now O: the right side has 2 + 2 = 4 O, so make O₂ 2. If you get stuck, “Hint for the next move” points at the next unbalanced scale in the order above. The move list records every change, so you can look back and see which move levelled which scale.',

    s3k: 'Step 3 · What about odd numbers',
    s3t: 'When ethane burns, O₂ will not come out as a whole number. Now what?',
    s3e: 'This step asks: ethane, C₂H₆, burns as C₂H₆ + O₂ → CO₂ + H₂O. Following the order from the last step, C needs 2 CO₂ and H needs 3 H₂O. That puts 2 × 2 + 3 = 7 O on the right, an odd number, yet each O₂ brings 2 O, so any number of O₂ gives an even count. One way out is to allow <strong>half a molecule</strong> for a moment: 3.5 O₂ makes the oxygen level. Real reactions have no half molecules, so finish by <strong>multiplying every coefficient by 2</strong> to get whole numbers. Multiplying all coefficients by the same number doubles both sides of every scale, so level scales stay level. In this step the coefficient buttons move in steps of 0.5.',
    double: 'Multiply every coefficient by 2',
    s3hint: 'What to try: set CO₂ to 2 and H₂O to 3 and watch the C and H scales level. Then raise O₂ bit by bit to 3.5: the O scale levels too, but a half O₂ molecule appears in a dashed box. Press “Multiply every coefficient by 2”: the coefficients become 2, 7, 4, 6, the half molecule is gone, and all three scales stay level.',

    s4k: 'Step 4 · Each scale is an equation',
    s4t: 'Can you work out the coefficients for burning propane without trial and error?',
    s4e: 'This step asks: propane, the fuel in gas cylinders, burns as C₃H₈ + O₂ → CO₂ + H₂O. Can the coefficients be calculated like a maths problem? Use letters for them: a C₃H₈ + b O₂ → c CO₂ + d H₂O. Each level scale is one equation: atoms on the left = atoms on the right. Three elements give the three equations listed below. With four unknowns and three equations, set a = 1 and solve one equation at a time: the C scale gives c, the H scale gives d, and finally the O scale gives b. Multiplying every coefficient by the same number still satisfies the equations, so there are endless answers, all whole-number multiples of the <strong>lowest whole-number ratio</strong> (coefficients with no common factor bigger than 1). By convention the equation is written with that simplest set.',
    solve: 'Set a = 1 and solve in turn',
    reduce: 'Reduce to simplest',
    eqLine: '{el} scale: {text}　→　{lhs} = {rhs}　{mark}',
    solving: 'Stage {k}/4: {what}',
    solveA: 'set a = 1', solveC: 'the C scale 3a = c gives c = 3', solveD: 'the H scale 8a = 2d gives d = 4', solveB: 'the O scale 2b = 2c + d gives b = 5',
    r4: 'Current coefficients a = {a}, b = {b}, c = {c}, d = {d}; greatest common factor {g}. {status}',
    s4hint: 'What to try: press “Set a = 1 and solve in turn” and watch the coefficients fill in the order a → c → d → b, each one ticking its equation. Then press “Multiply every coefficient by 2”: 2, 10, 6, 8 also satisfies all three equations, and the readout shows a common factor of 2. “Reduce to simplest” takes you back to 1, 5, 3, 4. This page had a computer try every combination from 1 to 12: only 1, 5, 3, 4 and 2, 10, 6, 8 balance propane burning, the simplest ratio and its double.',

    s5k: 'Step 5 · Your turn',
    s5t: 'Six reactions. How many can you balance?',
    s5e: 'This step asks: faced with a reaction you have not seen, can you balance it using the methods so far? Pick a reaction and use − / + to adjust the coefficients until every scale is level and the numbers are in lowest terms; it then goes on your done list. Tools you have: start with the elements in the fewest substances; when odd and even clash, bring both sides to the lowest common multiple; when needed, write one equation per element and solve. Note that substances such as Fe₂O₃, MgO and KCl are not made of molecules; the picture draws one formula unit as a cluster only to make the atoms easy to count.',
    rx_ammonia: 'Making ammonia', rx_magnesium: 'Burning magnesium', rx_chlorate: 'Heating potassium chlorate', rx_iron: 'Smelting iron', rx_lime: 'Slaked lime + hydrochloric acid', rx_aluminium: 'Aluminium + hydrochloric acid',
    done: 'Done list {k}/6: {list}',
    doneNone: 'Done list 0/6: nothing balanced yet.',
    s5hint: 'What to try: warm up with “Making ammonia”, then take on “Heating potassium chlorate” (oxygen is 3 against 2, so aim for 6) and “Aluminium + hydrochloric acid” (chlorine is 1 against 3, hydrogen 1 against 2). Switching reactions resets the current coefficients to 1; finished reactions stay on the done list. “Hint for the next move” only points at one unbalanced scale and one possible change; it does not give the answer away.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Balancing means making every element’s books add up',
    s6fin: 'Looking back. <strong>Step 0</strong>: each element needs the same number of atoms on both sides, because a reaction only rearranges atoms. <strong>Step 1</strong>: change coefficients only; changing a subscript changes the substance. <strong>Step 2</strong>: start with the elements in the fewest substances and leave lone elements such as O₂ till last. <strong>Step 3</strong>: if an odd number gets in the way, level it with half a molecule, then multiply everything by 2. <strong>Step 4</strong>: each scale is an equation; set one coefficient to 1 and solve in turn, then write the lowest whole-number ratio. <strong>Step 5</strong>: the same methods work on all kinds of reactions.',
    formula: 'For every element: atoms on the left = atoms on the right\natoms = coefficient × subscript (summed over substances)\nwrite the lowest whole-number ratio',
    boundary: 'Scope: this page counts atoms only. It does not cover charge balance in ionic equations, state symbols (gas, precipitate and so on) or conditions (ignition, heat, catalysts). A balanced equation says atoms are conserved; it does not say whether the reaction happens, how fast, or whether it goes to completion. The hints and the “only two sets” result come from trying every coefficient from 1 to 12.',
    linksTitle: 'Where to go next',
    lk1: '→ Conservation of mass, step 2: once the atoms match, the masses before and after match too',
    lk2: '→ Molecules and atoms, step 4: an atom ledger tells physical change from chemical change',
    lk3: '→ The fire triangle, step 0: the three things the burning reactions on this page need',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Balancing Chemical Equations”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshBalance === 'function') window.refreshBalance();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EB_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
