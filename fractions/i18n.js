'use strict';
/* ============================================================
   分数 · 把整体切开来数 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '分数 · 把整体切开来数 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '分数 · 把整体切开来数',
    tagline: '分数不是两个数上下叠着写，而是一个数：把整体切成几等份、取其中几份。看懂这一件事，等值、比大小、加减法就全是同一幅图的推论。这一页所有的格子都真等分、所有的数都用整数精确计算——图上量的、嘴里说的、心里算的，必须是同一个数。',
    nav0: '0 两种切法', nav1: '1 分数是一个数', nav2: '2 等值分数', nav3: '3 比大小',
    nav4: '4 加法先通分', nav5: '5 超过 1 的分数', nav6: '6 终章 · 三张脸',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 分数 Fractions —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '一块巧克力，两种切法',
    s0e: '这一步要回答：<strong>1/2 和 2/4 写法完全不同，到底哪边多？</strong>同一块巧克力，两个人分：左边切成 <strong>2 份、取 1 份</strong>，右边切成 <strong>4 份、取 2 份</strong>。先别急着算，凭眼睛猜一猜哪边多，再把两块叠起来看。',
    s0guessQ: '先猜一猜：哪边拿到的巧克力多？',
    s0bLeft: '左边多', s0bSame: '一样多', s0bRight: '右边多',
    s0bReveal: '叠起来看看',
    s0roIdle: '两块巧克力一模一样大，只是切法不同。选一个你的猜测，再点「叠起来看看」。',
    s0roGuess: '你的猜测：{g}。点「叠起来看看」验证。',
    s0guessLeft: '左边多', s0guessSame: '一样多', s0guessRight: '右边多',
    s0roWin: '猜对了——<b>一样多</b>！叠起来严丝合缝：2/4 就是 1/2，只是把每一份又切了一半，格子变小了，拿到的总量没变。',
    s0roLose: '再看一眼叠合的结果：两块<b>严丝合缝、一样大</b>。2/4 就是 1/2——格子切得更细，拿到的比例没变。',
    s0roReveal: '叠起来严丝合缝：<b>一样多</b>！2/4 就是 1/2——每一份又切了一半，格子变小了，拿到的总量没变。',
    s0hint: '分数的第一课：<strong>切几份（分母）</strong>和<strong>取几份（分子）</strong>要一起看。只看其中一个数，永远猜不准大小。',
    cLeft: '左边：切 2 取 1', cRight: '右边：切 4 取 2', cSame: '完全重合！',

    s1k: '第 1 步 · 分数是一个数',
    s1t: '分母是切法，分子是取法',
    s1e: '这一步要回答：<strong>分数到底是一个数，还是上下叠着的两个数？</strong>拖动滑杆改变切法，点条上的格子（或用按钮）改变取的份数。记住一句话：<strong>分母 = 把整体切成几等份，分子 = 取了其中几份</strong>。下面的细数轴会告诉你，这个分数作为一个数，落在 0 和 1 之间的哪个位置。',
    s1denLab: '切成几等份（分母）',
    s1minus: '− 少取一份', s1plus: '＋ 多取一份', s1clear: '清空', s1full: '取满',
    s1ro: '切成 <span>{b}</span> 等份，取了 <span>{a}</span> 份 → 这个分数是 <b>{a}/{b}</b>',
    s1roZero: '一份都没取 → <b>0/{b}</b>，也就是 0。点格子开始取。',
    s1roFull: '取满了 → <b>{b}/{b} = 1</b>，正好一整个。那取得比一整个还多会怎样？第 5 步见。',
    s1decEq: '换成小数：{f} = {dec}（除得尽，是精确值）',
    s1decAp: '换成小数：{f} ≈ {dec}（除不尽，后面是无限循环的小数，只能写近似值）',
    s1hint: '格子必须<strong>真等分</strong>——这一页每格的宽度都由同一个整体除以份数算出来，误差不超过 1 个像素。分数的世界里，「差不多一样大」不算数。',
    cOne: '整体 = 1', cPos: '它在 0 和 1 之间的位置',

    s2k: '第 2 步 · 等值分数',
    s2t: '切得细，比例不变',
    s2e: '这一步要回答：<strong>1/2、2/4、4/8 写法各不相同，为什么会是同一个数？</strong>把 1/2 的每一格再切成 2 小格，得到 2/4；再切，得到 4/8。三行条的选中部分<strong>右端对齐同一条竖线</strong>——它们是同一个数穿了不同的衣服。穿衣服的规则叫<strong>扩分</strong>（分子分母同乘一个数），脱衣服叫<strong>约分</strong>（同除以公约数）。',
    s2expLab: '扩分（分子分母同乘）：',
    s2redLab: '约分 12/18：',
    s2redStep: '约分一步', s2redGcd: '直接除以最大公约数', s2reset: '回到 1/2', s2reset2: '重来',
    s2roExp: '扩分：{f0} 的分子分母同乘 {k} → <b>{f1}</b>。格子变多了，每格变小了，选中部分的总长一点没变。',
    s2roExpMax: '已经切得很细了（分母 {d}），再乘格子就挤成一团看不清——点「回到 1/2」重新来。',
    s2roRed: '约分一步：{f0} 的分子分母同除以 {p} → <b>{f1}</b>。',
    s2roRedDone: '约分完成：12/18 → <b>2/3</b>。2 和 3 没有大于 1 的公约数了（gcd(2, 3) = 1），2/3 就是 12/18 的最简分数。',
    s2gcd: '最大公约数 gcd(12, 18) = <b>{g}</b>：分子分母一次同除以 {g}，12/18 → 2/3，和一步步约分殊途同归。',
    s2hint: '一串等值分数是同一个数的不同写法，其中最简的那个（分子分母互质——也就是除了 1 以外没有共同的约数）像它的<strong>身份证</strong>。判断两个分数是否相等，靠的不是长相——是约分后身份证是否相同，或者交叉相乘是否相等（下一步）。',
    cRows: '三行对照：选中部分的右端对齐', cExp: '扩分：同乘一个数', cRed: '约分链：12/18 一步步变简',

    s3k: '第 3 步 · 比大小',
    s3t: '先对齐刻度，再比长短',
    s3e: '这一步要回答：<strong>分母不同的两个分数，怎么比大小才靠谱？</strong>两个分母不同的分数，格子不一样细，不能只看分子猜大小。验明有两条路：<strong>交叉相乘</strong>（a/b 与 c/d 比，算 a×d 和 c×b，都是整数，不会算错）；<strong>通分</strong>（把两条都重切成最小公倍数 lcm(b, d) 份，格数直接比）。两条路必须得出同一个结论——这一步还会请你的眼睛先猜一次。',
    s3labA: '左边 a/b', s3labB: '右边 c/d',
    s3next: '换一对', s3guessQ: '先凭眼睛猜：',
    s3bLeft: '左边大', s3bSame: '一样大', s3bRight: '右边大',
    s3verify: '两路验明',
    s3roIdle: '现在比的是 <b>{a}/{b}</b> 和 <b>{c}/{d}</b>。先猜，再点「两路验明」。',
    s3roGuess: '你的猜测：{g}。点「两路验明」验证——改主意也没关系，以最后一次点的为准。',
    s3guessLeft: '左边大', s3guessSame: '一样大', s3guessRight: '右边大',
    s3roCross: '交叉相乘：{a}×{d} = <b>{ad}</b>，{c}×{b} = <b>{cb}</b>。{ad} {rel} {cb}，所以 {a}/{b} {rel} {c}/{d}。',
    s3roLcm: '通分：最小公倍数 lcm({b}, {d}) = <b>{l}</b>。{a}/{b} = {A}/{l}（取 {A} 格），{c}/{d} = {C}/{l}（取 {C} 格）。格数 {A} {rel} {C}，结论相同。',
    s3verdictWin: '猜对了！眼睛、交叉相乘、通分——三方一致：<b>{a}/{b} {rel} {c}/{d}</b>。',
    s3verdictLose: '眼睛这次被不一样细的格子骗了。两条验算路一致：<b>{a}/{b} {rel} {c}/{d}</b>。',
    s3verdictNone: '两条路结论一致：<b>{a}/{b} {rel} {c}/{d}</b>。（下次先猜一猜再验明，更好玩。）',
    relGt: '>', relEq: '=', relLt: '<',
    relGtW: '大于', relEqW: '等于', relLtW: '小于',
    s3hint: '为什么不能只看分子？因为<strong>分子数的是格子个数，格子的大小由分母定</strong>。这就像问「3 厘米和 2 英寸哪个长」——先把单位对齐，答案才有意义。注意：页面若出现「分母越大分数越小」，那只在分子相同时才成立——这里比较的从来是完整的分数。',
    cLcmRow: '通分后（都切成 {l} 份）',

    s4k: '第 4 步 · 加法',
    s4t: '加法：先通分，再相加',
    s4e: '这一步要回答：<strong>分数加法为什么不能「分子加分子、分母加分母」？</strong>最常见的错法就是这么加。错在哪？把 1/2 和 1/3 两块<strong>真实的长度</strong>接起来，和错误答案 2/5 摆在一起看——差距自己会说话。正确做法只有一条：先通分，把两把刻度不一样的尺子换成同一把。',
    s4add: '加法：1/2 + 1/3', s4sub: '减法：5/6 − 1/3',
    s4wrong: '先看看常见的错法', s4right: '再看正确做法', s4reset: '重置',
    s4roIdleAdd: '题目：1/2 + 1/3。先点「常见的错法」，再点「正确做法」，两边对比着看。',
    s4roIdleSub: '题目：5/6 − 1/3。减法和加法同一条规则：先通分，再相减。点「正确做法」看。',
    s4roWrong: '错法：分子加分子、分母加分母 → 2/5。可是把上面两块的真实长度接起来，明明到了 5/6 的位置——比 2/5 长出 <b>13/30</b>（= 5/6 − 2/5）。答案短了一大截，错得很明显。',
    s4roRightAdd: '正确做法：最小公倍数 lcm(2, 3) = <b>6</b>。1/2 重切成 3/6，1/3 重切成 2/6，刻度对齐后分子直接相加：3/6 + 2/6 = <b>5/6</b> ≈ 0.8333…。下面两条严丝合缝对齐，就是证明。',
    s4roRightSub: '减法同理：最小公倍数 lcm(6, 3) = <b>6</b>。1/3 重切成 2/6，从 5/6 里拿走 2 格：5/6 − 2/6 = 3/6，再约分 = <b>1/2</b>。',
    s4hint: '通分不是老师定的规矩，是<strong>没有办法的办法</strong>：格子不一样细，分子就没法直接加减。先把刻度对齐（通分），剩下的就只是数格子。',
    cWrongTag: '错误答案 2/5', cTrueTag: '两块接起来的真实长度', cGapTag: '差了 13/30',
    cResTag: '正确结果', cJoinTag: '接起来', cCutTag: '从 5/6 里拿走这一段',

    s5k: '第 5 步 · 假分数与带分数',
    s5t: '超过 1 的分数：两种写法',
    s5e: '这一步要回答：<strong>分子比分母还大，这个分数还算数吗、该怎么读？</strong>分子比分母还大，天不会塌——那只是<strong>超过一个整体</strong>的意思。7/4 就是「切 4 份取 7 份」：第一个整体取满（4 份），第二个整体再取 3 份。换一种写法：1 个整体又 3/4，写作 <strong>1¾</strong>，叫带分数。同一个数，两种写法，除法就是翻译官。',
    s5barsT: '一格一格数过去：几个整体装得下？',
    s5imp: '假分数写法', s5mix: '带分数写法', s5next: '换一个分数',
    s5roImp: '<b>{n}/{d}</b>：{n} ÷ {d} = {q} 余 {r} → 装满 {q} 个整体，还剩 {r} 份 → 带分数 <b>{q} {r}/{d}</b>（读作 {q} 又 {d} 分之 {r}）。',
    s5roInt: '<b>{n}/{d}</b>：{n} ÷ {d} = {q}，整除！它就是整数 <b>{q}</b>——分数写法的整数，藏得挺深。',
    s5roMix: '带分数 <b>{q} {r}/{d}</b>：{q} 个整体（{qd} 份）再加 {r} 份，共 {n} 份 → 假分数 <b>{n}/{d}</b>。两种写法随时互换。',
    s5roMixInt: '整数 <b>{q}</b>：正好 {q} 个整体（{qd}/{d}），没有零头。',
    s5candT: '分数作用在一个量上：一盒 12 颗糖',
    s5bLab: '取这盒糖的：',
    s5bro: '一盒 <span>12</span> 颗的 <b>{n}/{d}</b>：先把 12 平均分成 {d} 份，每份 12 ÷ {d} = <span>{per}</span> 颗；取 {n} 份 → {per} × {n} = <b>{taken} 颗</b>。图上亮起的正好 {taken} 颗，数一数。',
    s5hint: '假分数和带分数没有谁比谁高级：算账（加减乘除）时假分数顺手，报数（「一又四分之三杯水」）时带分数顺嘴。重要的是随时能互相翻译——翻译的钥匙就是除法：分子 ÷ 分母。',
    cWhole: '整体 {i}',

    s6k: '第 6 步 · 终章',
    s6t: '数轴上的一家人：分数、小数、百分数',
    s6e: '这一步要回答：<strong>分数、小数、百分数是三个数，还是同一个数的三种写法？</strong>最后一个游戏：往 0 到 3 的数轴上放数。分数、小数、百分数轮流登场——<strong>同值的不同写法，必须落在同一个点上</strong>。落点位置全部按真实值计算，量一量就知道有没有作弊。',
    s6next: '落下一个', s6reset: '清空重来',
    s6roIdle: '点「落下一个」，看第一个数落在哪里。',
    s6roItem: '<b>{label}</b> 落在 {val} 处。',
    s6roSame: '<b>{label}</b> 落在 {val} 处——和先落下的 {others} <b>完全同点</b>！写法不同，数相同。',
    s6roRep: '<b>{label}</b> 落在 {val} 处（小数是 {dec}，无限循环，落点按分数真值算，不是按小数近似值算）。',
    s6roDone: '全部落完：1/2 = 0.5 = 50% 同点，5/4 = 1.25 = 125% 同点。三张脸，一个数。',
    c1h: '同一个数的三张脸',
    c1: '分数、小数、百分数只是同一批数的三种写法：分母化成 10 或 100 就得到小数和百分数；除不尽时（比如 1/3）小数会无限循环，只能写 <strong>≈</strong>——但分数写法永远精确。',
    c2h: '从分数往后走',
    c2: '这一页的两件工具会跟你很久：<strong>通分靠最小公倍数，约分靠最大公约数</strong>。到了初中，分式里数字换成字母，规则还是同一套——先对齐刻度，再算分子。',
    c3h: '练一练',
    c3: '光看懂不算会，动手算才算。姊妹站 <strong>homework.integ.life</strong> 上有分数的练习题（通分、约分、比大小、加减法都有），做完当场对答案。',
    s6fin: '分数是孩子遇到的第一个「数可以长得不像整数」的时刻。跨过去，数的世界就宽了一倍：整数之间原来还住着无穷多个数，每一个都能被切出来、量出来、算出来。',
    s6lkMc: '下一站：比例长大了就是概率——撒得够多，频率会露出概率的脸 →',
  },
  en: {
    docTitle: 'Fractions · Cutting the Whole into Equal Parts — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Fractions · One Number, Cut to Size',
    tagline: 'A fraction is not two numbers stacked on top of each other — it is one number: cut the whole into equal parts, take some of them. Once that clicks, equivalence, comparison and addition are all corollaries of the same picture. On this page every cell is truly equal and every value is computed with exact integers — what you measure, what you say and what you compute must be the same number.',
    nav0: '0 Two Ways to Cut', nav1: '1 One Number', nav2: '2 Equivalent Fractions', nav3: '3 Comparing',
    nav4: '4 Add: Align First', nav5: '5 Beyond One Whole', nav6: '6 Finale · Three Faces',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Fractions —— one interaction at a time',

    s0k: 'Step 0 · The Hook',
    s0t: 'One Chocolate Bar, Two Ways to Cut It',
    s0e: 'This step answers: <strong>1/2 and 2/4 are written completely differently — which side is actually more?</strong> The same chocolate bar, shared two ways: on the left it is cut into <strong>2 parts, take 1</strong>; on the right into <strong>4 parts, take 2</strong>. Do not calculate yet: guess with your eyes which side gets more, then stack the two pieces and see.',
    s0guessQ: 'Guess first: who gets more chocolate?',
    s0bLeft: 'Left gets more', s0bSame: 'The same', s0bRight: 'Right gets more',
    s0bReveal: 'Stack them and see',
    s0roIdle: 'Two identical bars, only the cutting differs. Pick a guess, then press “Stack them and see”.',
    s0roGuess: 'Your guess: {g}. Press “Stack them and see” to check.',
    s0guessLeft: 'left gets more', s0guessSame: 'the same', s0guessRight: 'right gets more',
    s0roWin: 'Correct — <b>exactly the same</b>! Stacked, they coincide edge to edge: 2/4 is 1/2, just with every part cut in half once more. The pieces got smaller; the total did not change.',
    s0roLose: 'Look at the stack once more: the two pieces coincide <b>exactly — they are equal</b>. 2/4 is 1/2: the pieces are cut finer, the share is unchanged.',
    s0roReveal: 'Stacked, they coincide exactly: <b>the same amount</b>! 2/4 is 1/2 — every part cut in half once more; smaller pieces, same total.',
    s0hint: 'Lesson one about fractions: <strong>how many parts (the denominator)</strong> and <strong>how many you take (the numerator)</strong> must be read together. Looking at either number alone, you can never tell the size.',
    cLeft: 'Left: cut 2, take 1', cRight: 'Right: cut 4, take 2', cSame: 'Perfect overlap!',

    s1k: 'Step 1 · A Fraction Is One Number',
    s1t: 'Denominator = How You Cut, Numerator = How Many You Take',
    s1e: 'This step answers: <strong>is a fraction one number, or two numbers stacked on top of each other?</strong> Drag the slider to change the cutting, click cells on the bar (or use the buttons) to change how many you take. One sentence to keep: <strong>the denominator says into how many equal parts the whole is cut; the numerator says how many of them you take</strong>. The thin number line below shows where this fraction, as a number, sits between 0 and 1.',
    s1denLab: 'Cut into how many equal parts (denominator)',
    s1minus: '− Take one fewer', s1plus: '+ Take one more', s1clear: 'Clear', s1full: 'Take all',
    s1ro: 'Cut into <span>{b}</span> equal parts, took <span>{a}</span> of them → the fraction is <b>{a}/{b}</b>',
    s1roZero: 'Took none → <b>0/{b}</b>, which is 0. Click the cells to start taking.',
    s1roFull: 'Took everything → <b>{b}/{b} = 1</b>, exactly one whole. What if you take more than a whole? See Step 5.',
    s1decEq: 'As a decimal: {f} = {dec} (it divides exactly — this is the precise value)',
    s1decAp: 'As a decimal: {f} ≈ {dec} (it never divides out — the decimal repeats forever, so only an approximation can be written)',
    s1hint: 'The cells must be <strong>truly equal</strong>: on this page every cell width is the same whole divided by the number of parts, off by at most one pixel. In the land of fractions, “about the same size” does not count.',
    cOne: 'the whole = 1', cPos: 'where it sits between 0 and 1',

    s2k: 'Step 2 · Equivalent Fractions',
    s2t: 'Cut Finer, Same Proportion',
    s2e: 'This step answers: <strong>why do 1/2, 2/4 and 4/8 — all written differently — name the same number?</strong> Cut every cell of 1/2 in two and you get 2/4; again, 4/8. In the three rows, the selected parts <strong>end at the very same vertical line</strong> — one number wearing different outfits. Putting an outfit on is called <strong>expanding</strong> (multiply numerator and denominator by the same number); taking it off is <strong>reducing</strong> (divide both by a common factor).',
    s2expLab: 'Expand (multiply top and bottom):',
    s2redLab: 'Reduce 12/18:',
    s2redStep: 'Reduce one step', s2redGcd: 'Divide by the GCD at once', s2reset: 'Back to 1/2', s2reset2: 'Start over',
    s2roExp: 'Expand: multiply numerator and denominator of {f0} by {k} → <b>{f1}</b>. More cells, smaller cells — the total length selected has not moved at all.',
    s2roExpMax: 'Already cut very fine (denominator {d}); multiplying further would squash the cells into a blur — press “Back to 1/2” to restart.',
    s2roRed: 'One reduction step: divide numerator and denominator of {f0} by {p} → <b>{f1}</b>.',
    s2roRedDone: 'Fully reduced: 12/18 → <b>2/3</b>. 2 and 3 share no common factor above 1 (gcd(2, 3) = 1), so 2/3 is the simplest form of 12/18.',
    s2gcd: 'The greatest common divisor gcd(12, 18) = <b>{g}</b>: divide both by {g} in one go, 12/18 → 2/3 — same destination as step by step.',
    s2hint: 'A family of equivalent fractions is one number with many spellings; the simplest spelling (numerator and denominator coprime — sharing no common factor above 1) is like its <strong>ID card</strong>. To test whether two fractions are equal, do not trust their looks — reduce both and compare ID cards, or cross-multiply (next step).',
    cRows: 'Three rows: selected parts end at the same line', cExp: 'Expanding: multiply both by one number', cRed: 'Reduction chain: 12/18, step by step',

    s3k: 'Step 3 · Comparing Fractions',
    s3t: 'Align the Scales First, Then Compare',
    s3e: 'This step answers: <strong>how do you compare two fractions with different denominators — reliably?</strong> With different denominators the cells are different sizes, so comparing numerators alone is meaningless. There are two honest ways to check: <strong>cross-multiplication</strong> (for a/b vs c/d, compute a×d and c×b — plain integers, no room for error) and a <strong>common denominator</strong> (re-cut both bars into lcm(b, d) cells — lcm is the least common multiple of the two denominators — and compare counts). Both roads must reach the same verdict — and your eyes get to guess first.',
    s3labA: 'Left a/b', s3labB: 'Right c/d',
    s3next: 'Another pair', s3guessQ: 'Guess with your eyes first:',
    s3bLeft: 'Left is bigger', s3bSame: 'They are equal', s3bRight: 'Right is bigger',
    s3verify: 'Verify both ways',
    s3roIdle: 'Now comparing <b>{a}/{b}</b> and <b>{c}/{d}</b>. Guess first, then press “Verify both ways”.',
    s3roGuess: 'Your guess: {g}. Press “Verify both ways” to check — changing your mind is fine; only your last pick counts.',
    s3guessLeft: 'left is bigger', s3guessSame: 'they are equal', s3guessRight: 'right is bigger',
    s3roCross: 'Cross-multiply: {a}×{d} = <b>{ad}</b> and {c}×{b} = <b>{cb}</b>. Since {ad} {rel} {cb}, we get {a}/{b} {rel} {c}/{d}.',
    s3roLcm: 'Common denominator: the least common multiple lcm({b}, {d}) = <b>{l}</b>. {a}/{b} = {A}/{l} (takes {A} cells), {c}/{d} = {C}/{l} (takes {C} cells). Counts {A} {rel} {C} — same verdict.',
    s3verdictWin: 'Your eyes win this round! Eyes, cross-multiplication and common denominator — all three agree: <b>{a}/{b} {rel} {c}/{d}</b>.',
    s3verdictLose: 'The differently-sized cells fooled your eyes this time. Both checks agree: <b>{a}/{b} {rel} {c}/{d}</b>.',
    s3verdictNone: 'Both roads agree: <b>{a}/{b} {rel} {c}/{d}</b>. (Next time, guess first — it is more fun.)',
    relGt: '>', relEq: '=', relLt: '<',
    relGtW: 'is greater than', relEqW: 'equals', relLtW: 'is less than',
    s3hint: 'Why not just compare numerators? Because <strong>the numerator counts cells, and the denominator sets the size of each cell</strong>. It is like asking whether 3 centimetres beat 2 inches — align the units first, then the answer means something. And beware the shortcut “bigger denominator means smaller fraction”: that only holds when the numerators are equal. Here we always compare whole fractions.',
    cLcmRow: 'After aligning (both cut into {l} parts)',

    s4k: 'Step 4 · Addition',
    s4t: 'Addition: Align the Scales, Then Add',
    s4e: 'This step answers: <strong>why can’t you add fractions by “adding the tops and adding the bottoms”?</strong> That is the most common mistake. What is wrong with it? Join the <strong>true lengths</strong> of 1/2 and 1/3 end to end, set them next to the wrong answer 2/5 — the gap speaks for itself. The correct route is unique: find a common denominator first, turning two differently-graduated rulers into one.',
    s4add: 'Add: 1/2 + 1/3', s4sub: 'Subtract: 5/6 − 1/3',
    s4wrong: 'See the common mistake first', s4right: 'Now the correct way', s4reset: 'Reset',
    s4roIdleAdd: 'Problem: 1/2 + 1/3. Press “the common mistake” first, then “the correct way”, and compare.',
    s4roIdleSub: 'Problem: 5/6 − 1/3. Subtraction follows the same rule as addition: align first, then subtract. Press “the correct way”.',
    s4roWrong: 'The mistake: add tops, add bottoms → 2/5. But joining the true lengths above clearly reaches the 5/6 mark — longer than 2/5 by <b>13/30</b> (= 5/6 − 2/5). The answer falls well short; the error is plain to see.',
    s4roRightAdd: 'The correct way: the least common multiple lcm(2, 3) = <b>6</b>. Re-cut 1/2 into 3/6 and 1/3 into 2/6; with the scales aligned, the numerators simply add: 3/6 + 2/6 = <b>5/6</b> ≈ 0.8333…. The two bars below line up exactly — that is the proof.',
    s4roRightSub: 'Subtraction, same idea: the least common multiple lcm(6, 3) = <b>6</b>. Re-cut 1/3 into 2/6 and take 2 cells away from 5/6: 5/6 − 2/6 = 3/6, which reduces to <b>1/2</b>.',
    s4hint: 'A common denominator is not a rule teachers invented — it is a necessity: <strong>with cells of different sizes, numerators cannot be added or subtracted directly</strong>. Align the graduations first (that is all “common denominator” means), and what remains is just counting cells.',
    cWrongTag: 'The wrong answer 2/5', cTrueTag: 'The two true lengths, joined', cGapTag: 'short by 13/30',
    cResTag: 'The correct result', cJoinTag: 'joined', cCutTag: 'the part taken away from 5/6',

    s5k: 'Step 5 · Improper Fractions & Mixed Numbers',
    s5t: 'Beyond One Whole: Two Ways to Write It',
    s5e: 'This step answers: <strong>when the numerator is bigger than the denominator, is it still a proper number — and how do you read it?</strong> A numerator bigger than the denominator is not a disaster — it simply means <strong>more than one whole</strong>. 7/4 says “cut into 4, take 7”: fill the first whole (4 parts), then take 3 more from the second. The other spelling: 1 whole and 3/4 more, written <strong>1¾</strong> — a mixed number. Same number, two spellings, and division is the translator.',
    s5barsT: 'Count cell by cell: how many wholes does it fill?',
    s5imp: 'Improper-fraction spelling', s5mix: 'Mixed-number spelling', s5next: 'Another fraction',
    s5roImp: '<b>{n}/{d}</b>: {n} ÷ {d} = {q} remainder {r} → it fills {q} whole(s) with {r} parts left over → the mixed number <b>{q} {r}/{d}</b>.',
    s5roInt: '<b>{n}/{d}</b>: {n} ÷ {d} = {q} exactly! It is the integer <b>{q}</b> in disguise — an integer wearing fraction clothes.',
    s5roMix: 'Mixed number <b>{q} {r}/{d}</b>: {q} whole(s) ({qd} parts) plus {r} more parts makes {n} parts in total → the improper fraction <b>{n}/{d}</b>. The two spellings convert freely.',
    s5roMixInt: 'The integer <b>{q}</b>: exactly {q} wholes ({qd}/{d}), nothing left over.',
    s5candT: 'A fraction acting on a quantity: a box of 12 candies',
    s5bLab: 'Take this fraction of the box:',
    s5bro: '<b>{n}/{d}</b> of a box of <span>12</span>: first split 12 into {d} equal shares — each share is 12 ÷ {d} = <span>{per}</span> candies; take {n} shares → {per} × {n} = <b>{taken} candies</b>. Exactly {taken} candies are lit up in the picture — count them.',
    s5hint: 'Neither spelling is “better”: improper fractions are handier for calculating, mixed numbers are handier for saying out loud (“one and three-quarter cups of water”). What matters is translating freely — and the key is division: numerator ÷ denominator.',
    cWhole: 'whole {i}',

    s6k: 'Step 6 · Finale',
    s6t: 'One Family on the Number Line: Fractions, Decimals, Percents',
    s6e: 'This step answers: <strong>are fractions, decimals and percents three kinds of numbers, or three spellings of the same numbers?</strong> One last game: drop numbers onto a number line from 0 to 3. Fractions, decimals and percents take turns — and <strong>different spellings of the same value must land on exactly the same point</strong>. Every landing position is computed from the true value; measure and check that nobody cheats.',
    s6next: 'Drop the next one', s6reset: 'Clear and restart',
    s6roIdle: 'Press “Drop the next one” and watch where the first number lands.',
    s6roItem: '<b>{label}</b> lands at {val}.',
    s6roSame: '<b>{label}</b> lands at {val} — <b>the exact same point</b> as {others} dropped earlier! Different spelling, same number.',
    s6roRep: '<b>{label}</b> lands at {val} (its decimal is {dec}, repeating forever; the landing uses the exact fraction value, not the decimal approximation).',
    s6roDone: 'All dropped: 1/2 = 0.5 = 50% share a point, and 5/4 = 1.25 = 125% share a point. Three faces, one number.',
    c1h: 'Three Faces of One Number',
    c1: 'Fractions, decimals and percents are three spellings of the same numbers: turn the denominator into 10 or 100 and you get the decimal and the percent. When the division never ends (like 1/3) the decimal repeats forever and only <strong>≈</strong> can be written — but the fraction spelling stays exact.',
    c2h: 'Where Fractions Lead',
    c2: 'Two tools from this page will serve you for years: <strong>common denominators run on the least common multiple; reducing runs on the greatest common divisor</strong>. In junior school the numbers in fractions turn into letters — the rules stay exactly the same: align the scales first, then work on the numerators.',
    c3h: 'Now Practise',
    c3: 'Understanding is not the same as being able to do it. The sister site <strong>homework.integ.life</strong> has fraction exercises (common denominators, reducing, comparing, adding and subtracting) with instant checking.',
    s6fin: 'A fraction is the first moment a child meets “a number that does not look like an integer”. Step across, and the world of numbers doubles in width: between any two integers live infinitely many more numbers, every one of which can be cut out, measured and computed with.',
    s6lkMc: 'Next stop: ratios grow up into probability — toss enough, and frequency shows probability’s face →',
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
