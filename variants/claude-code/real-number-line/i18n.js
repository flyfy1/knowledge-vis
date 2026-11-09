'use strict';
// Real numbers & the number line lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '实数与数轴 · 分数打不中的点',
    back: '← 知识索引',
    compare: '对照另一版本：实数与数轴 · √2 落在哪一点 →',
    navLabel: '实数与数轴步骤导航',
    tagline: '用圆规把正方形的对角线转到数轴上，笔尖会落在一个确定的点。这个点离 0 有多远？我们会一位一位放大去读它的小数，派分数去「打」它，再证明没有哪个分数能正好打中——数轴上除了分数，还住着别的数。',
    nav0: '0 转下来', nav1: '1 放大读小数', nav2: '2 分数来打靶', nav3: '3 为什么打不中', nav4: '4 给数分类', nav5: '5 别的根号', nav6: '6 收束',

    s0k: '第 0 步 · 一个确定的点',
    s0t: '把对角线转到数轴上，笔尖落在哪里？',
    s0e: '这一步要回答：一条线段能不能「搬」到数轴上，变成一个点、一个数？<strong>数轴</strong>是一条标了 0、1、2… 的直线，线上每个点到 0 的距离就是它代表的数（<a class="xlink" href="../../../math/arithmetic/negative-numbers/#step0">→ 负数页第 0 步：数轴向左也能延长</a>）。在 0 到 1 上立一个宽 1、高 b 的长方形，从 0 到右上角的<strong>对角线</strong>长度可以用勾股定理算：√(1² + b²)（<a class="xlink" href="../../../math/geometry/pythagoras/#step1">→ 勾股定理页第 1 步：两个小正方形的面积合起来等于大正方形</a>）。<strong>√</strong> 读作「根号」，√a 是「平方后等于 a 的那个正数」。把圆规尖扎在 0、另一脚放在对角线顶端，绕 0 转下来：转动不改变长度，所以笔尖落地的点到 0 的距离就是对角线长。',
    bSlider: '长方形的高 b', swing: '转下来多少', swingBtn: '用圆规转下来',
    c0a: '圆规绕 0 转动对角线',
    lgDiag: '对角线（长度不变）', lgArc: '笔尖走过的圆弧', lgLand: '已经落地的点',
    s0readout: '对角线长 = √(1² + {b}²) = √{n} ≈ {v}。笔尖现在在离数轴 {y} 高、离 0 恰好 {v} 远的地方。',
    s0landed: '落地了：这个点在数轴上 {v} 处，它代表的数就是 √{n}。',
    s0hint: '观察顺序：先保持 b = 1，按「用圆规转下来」（或拖「转下来多少」），看笔尖沿圆弧落到 1 和 2 之间，留下一个点。再把 b 换成 2、3 重复：落点 √5、√10 也都留在数轴上。√4 那样的数很熟悉，√2、√5 到底是多少，要放大了看，这是下一步。',

    s1k: '第 1 步 · 放大读小数',
    s1t: '落点在 1 和 2 之间，再放大能读出几位？',
    s1e: '这一步要回答：一个点在数轴上的位置，怎样写成小数？办法是不停地放大：把 1 到 2 这一段等分成 10 份，看点落在第几份，就得到小数点后第一位；再把那一份等分成 10 份，得到第二位……每放大一层多读出一位。上面一行是整段，下面每一行是上一行里高亮那一格放大 10 倍的样子。选不同的数来比较：分数 7/8 读几层就读完了，后面全是 0，这叫<strong>有限小数</strong>；1/3、1/7 的数字会一段一段重复，叫<strong>无限循环小数</strong>（重复的那一段叫<strong>循环节</strong>）；√2 和 √3 的数字一直读不完，也看不出重复。位数用整数运算精确算出，不是四舍五入的近似。',
    pick: '选一个数', zoom: '读到小数第几位',
    c1a: '每一行把上一行的高亮格放大 10 倍',
    s1read: '{name} = {dec}（读到小数第 {k} 位）。',
    s1term: '它在小数第 {k} 位结束，后面全是 0：放大几次后，点正好落在刻度线上。',
    s1rep: '「{block}」从小数第 {s} 位起一直重复，循环节 {L} 位。',
    s1irr: '前 {k} 位里没有出现一直重复的一段；只看数字还不能断定，第 3 步会证明它永远不会循环。',
    s1hint: '观察顺序：先选 √2，把「读到小数第几位」从 1 拖到 8：每多一行，高亮格里的数字就是新读出的一位，每行两端的数也多一位。再换成 7/8 和 1/7 各拖一遍：7/8 从第 3 行起，点正好压在刻度线上；1/7 的数字按 142857 一组反复出现。',

    s2k: '第 2 步 · 分数来打靶',
    s2t: '能找到一个分数正好等于 √2 吗？',
    s2e: '这一步要回答：既然 √2 在 1.41 和 1.42 之间，会不会有某个<strong>分数</strong> p/q（p、q 是正整数）恰好等于它？分母越大，分数在数轴上排得越密，好像总该有一个打中。滑杆定分母的上限 N：上图把 1.30 到 1.53 之间分母不超过 N 的所有分数都画成刻度（分母越小刻度越高），橙线是 √2；下图对每个分母 q，取离 √2 最近的分数，画出它的<strong>误差</strong>（|p/q − √2|，分数离 √2 有多远；纵轴每格差 10 倍，越低越近）。还有一个更干脆的检验：如果 p/q = √2，两边平方就有 p² = 2q²，也就是 p² − 2q² = 0。',
    nSlider: '分母上限 N',
    c2a: '1.30 到 1.53 之间的分数（分母 ≤ {N}）', c2b: '各分母的最小误差（越低越近）',
    lgRoot: '√2', lgBest: '目前最近的分数', lgRec: '刷新纪录的分母',
    s2readout: '分母不超过 {N} 时，离 √2 最近的是 {p}/{q} = {v}，误差约 {e}。检验：{p}² − 2 × {q}² = {gap}，不是 0。',
    s2hint: '观察顺序：把 N 从 1 慢慢拖到 60。上图刻度越来越密，橙线附近却始终空着一条缝；下图的点有高有低，刷新纪录的分母（如 5、12、29）一个比一个低，但没有一个落到 0。再看读数里的 p² − 2q²：它总是 1、−1 或更远的整数，从来不是 0。这只说明「试过的都不行」，下一步说明为什么永远不行。',

    s3k: '第 3 步 · 为什么打不中',
    s3t: 'p² 和 2q² 为什么永远不相等？',
    s3e: '这一步要回答：上一步只试了有限多个分数，怎样确定<strong>没有任何</strong>分数 p/q 满足 p² = 2q²？方法是数「因数 2」：把一个正整数反复除以 2，直到除不尽，能除几次是确定的。p 里有几个 2，p² = p × p 里就有两倍那么多，所以 p² 里 2 的个数一定是<strong>偶数</strong>；q² 同理也是偶数个，2q² 再多乘一个 2，就是<strong>奇数</strong>个。一边偶数个、一边奇数个，两个数不可能相等。所以 √2 不能写成两个整数之比。不能写成两个整数之比的数叫<strong>无理数</strong>；能写成的（整数、分数）叫<strong>有理数</strong>。',
    pSlider: '分子 p', qSlider: '分母 q', closest: '把 p 调到最接近 q × √2',
    c3a: '把两边各自的因数 2 两两配对',
    pairLbl: '成对', aloneLbl: '落单',
    s3readout: 'p² = {pp}，可以写成 {a} 个 2 相乘再乘 {pr}，2 的个数 {a} 是偶数；2q² = {qq}，可以写成 {b} 个 2 相乘再乘 {qr}，2 的个数 {b} 是奇数。',
    s3diff: '两边相差 {d}，不相等。',
    s3hint: '观察顺序：先按「把 p 调到最接近 q × √2」，让两边尽量接近；再随便拖 q。左边的 2 总能两两配成对，右边总剩一个落单的（粉色）。无论 p、q 取什么，这个落单的 2 都消不掉，所以两边永远差一点。',

    s4k: '第 4 步 · 给数分类',
    s4t: '这些数，哪些是有理数，哪些是无理数？',
    s4e: '这一步要回答：看到一个数，怎样判断它是有理数（能写成两个整数之比）还是无理数？看它的小数：有限小数和无限循环小数都能写回分数，是有理数；无限不循环小数是无理数。有理数和无理数合起来叫<strong>实数</strong>，数轴上每一个点都对应一个实数，每个实数也都在数轴上有自己的点。分数在数轴上本来就有位置（<a class="xlink" href="../../../math/arithmetic/fractions/#step1">→ 分数页第 1 步：分数也是数轴上的一个点</a>）。逐个点下面的数，把它放到数轴上，读它的小数和理由。',
    c4a: '放到数轴上的数（绿 = 有理数，橙 = 无理数）',
    lgRat: '有理数', lgIrr: '无理数',
    n_f34: '3/4', n_f13: '1/3', n_fm27: '−2/7', n_s9: '√9', n_s8: '√8', n_f227: '22/7', n_pi: 'π', n_pat: '0.1010010001…',
    r_term: '{name} = {dec}：有限小数，在小数第 {k} 位结束。分母约分后只含因数 2 和 5 的分数都是这样。有理数。',
    r_rep: '{name} = {dec}…：「{block}」从小数第 {s} 位起一直重复（循环节 {L} 位）。无限循环小数，有理数。',
    r_int: '{name} = {dec}：9 = 3²，所以 √9 正好是整数 3 = 3/1。有理数。',
    r_s8: '{name} = {dec}…：√8 = 2 × √2。如果 √8 是两个整数之比，√2 = √8 ÷ 2 也会是，这和第 3 步矛盾。无理数。',
    r_pi: '{name} = {dec}…：圆周长与直径之比。数学家已经证明它是无理数（本页不证明）。和 22/7 = 3.142857… 很接近，但不相等。',
    r_pat: '{name} = {dec}…：两个 1 之间的 0 一次比一次多一个，所以没有哪一段数字会一直重复下去。无限不循环小数，无理数。',
    s4count: '已放上 {k}/8 个数：{r} 个有理数，{i} 个无理数。',
    s4none: '还没有放数：点下面任意一个按钮。',
    s4hint: '观察顺序：先点 22/7，再点 π：两个点在数轴上几乎重合，小数却从第 3 位起就分开了，一个循环、一个不循环。再点 √9 和 √8：同样带根号，一个是整数，一个是无理数——有没有根号不决定是不是无理数。',

    s5k: '第 5 步 · 别的根号',
    s5t: '√n 落在哪两个整数之间？什么时候是整数？',
    s5e: '这一步要回答：任给一个正整数 n，√n 在数轴的什么位置，它是有理数还是无理数？图中曲线是 y = x²：横坐标 x 取多少，纵坐标就是 x 的平方。从纵轴上的 n 横着走到曲线，再竖直落到横轴，落点的 x 满足 x² = n，就是 √n。如果 n 是<strong>完全平方数</strong>（某个整数的平方，如 1、4、9、16），√n 正好是整数；否则它夹在两个相邻整数之间，而且是无理数。理由和第 3 步一样，只是不只数 2：n 不是完全平方数时，总有某个质因数在 n 里出现奇数次，p² = n × q² 两边这个质因数的个数一奇一偶，不可能相等。',
    nRoot: '被开方的数 n',
    c5a: '曲线 y = x²：从 n 横走到曲线，再落到横轴',
    lgSq: '完全平方数的根（整数）', lgNs: '其他（无理数）',
    s5sq: '√{n} = {r}，因为 {r}² = {n}：{n} 是完全平方数，√{n} 是整数。',
    s5irr: '√{n} = {dec}…（12 位）。{lo}² = {lo2} < {n} < {hi2} = {hi}²，所以 √{n} 在 {lo} 和 {hi} 之间；{n} 不是完全平方数，√{n} 是无理数。',
    s5count: '横轴上已标 {k} 个根，其中 {s} 个是整数。',
    s5hint: '观察顺序：从 n = 1 一格一格拖到 50。落点停在整数刻度上（绿色）只发生在 1、4、9、16、25、36、49；其余落点都在两个整数之间（橙色）。越往右，相邻两个整数之间排的根越多：曲线越来越陡，n 每加 1，根挪得越来越少。',

    s6k: '第 6 步 · 收束',
    s6t: '数轴上住着哪些数',
    s6fin: '对角线可以用圆规转到数轴上，所以 √2 是数轴上一个确定的点；放大可以一位一位读出它的小数，却读不完、也不循环；任何分数都打不中它，因为 p² 里因数 2 的个数是偶数，2q² 里是奇数。',
    formula: '有理数 = 能写成 p/q 的数 = 有限小数或无限循环小数\n无理数 = 无限不循环小数，如 √2、√8、π\n实数 = 有理数 + 无理数 = 数轴上的全部点',
    boundary: '注意范围：本页的 p、q 都是整数（q ≠ 0）；「√n 要么是整数、要么是无理数」只对正整数 n 成立，√(1/4) = 1/2 这类分数的根另当别论。π 是无理数是已证明的定理，本页没有证明。数轴上的点画得再细，也只能分辨到像素，看不出 1.4142 和 √2 的差别，所以本页靠数字和证明，而不是靠眼睛。',
    linksTitle: '接着看',
    lk1: '→ 勾股定理页第 6 步：勾股数与 √2',
    lk2: '→ 负数页第 0 步：数轴向左延长，0 以下还有数',
    lk3: '→ 分数页第 1 步：分数也是数轴上的一个点',
    lk4: '→ 坐标系页第 0 步：一条数轴给一个点「地址」，两条才能定位平面',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《实数与数轴 · √2 落在哪一点》的平行版本。'
  },
  en: {
    pageTitle: 'Real Numbers & the Number Line · The Point No Fraction Hits',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Real Numbers & the Number Line · Where √2 Lands →',
    navLabel: 'Real number line steps',
    tagline: 'Swing the diagonal of a square down onto the number line with a compass and the tip lands on one definite point. How far is it from 0? We read its decimal one digit at a time by zooming in, fire fractions at it, and then prove that no fraction can ever hit it exactly — the number line holds more than fractions.',
    nav0: '0 Swing it down', nav1: '1 Zoom in', nav2: '2 Fractions take aim', nav3: '3 Why they miss', nav4: '4 Sort the numbers', nav5: '5 Other roots', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · ONE DEFINITE POINT',
    s0t: 'Swing a diagonal down onto the number line — where does the tip land?',
    s0e: 'The question here: can a line segment be “moved” onto the number line and become one point, one number? The <strong>number line</strong> is a straight line marked 0, 1, 2, …; each point stands for its distance from 0 (<a class="xlink" href="../../../math/arithmetic/negative-numbers/#step0">→ Negative numbers, step 0: the line carries on to the left of 0</a>). Stand a rectangle of width 1 and height b on the stretch from 0 to 1. Pythagoras gives the length of its <strong>diagonal</strong> from 0 to the top-right corner: √(1² + b²) (<a class="xlink" href="../../../math/geometry/pythagoras/#step1">→ Pythagoras, step 1: the two small squares’ areas fill the big one</a>). The sign <strong>√</strong> is “square root”: √a is the positive number whose square is a. Put a compass point at 0, the pencil at the diagonal’s top end, and swing it down. Turning does not change a length, so the spot where the pencil lands is exactly one diagonal-length from 0.',
    bSlider: 'Rectangle height b', swing: 'How far it has swung', swingBtn: 'Swing it down',
    c0a: 'A compass turns the diagonal about 0',
    lgDiag: 'diagonal (length unchanged)', lgArc: 'arc traced by the pencil', lgLand: 'points already landed',
    s0readout: 'Diagonal = √(1² + {b}²) = √{n} ≈ {v}. The pencil is now {y} above the line and exactly {v} from 0.',
    s0landed: 'Landed: the point sits at {v} on the line, and the number it stands for is √{n}.',
    s0hint: 'What to watch: keep b = 1, press “Swing it down” (or drag “How far it has swung”) and watch the pencil follow the arc down to a point between 1 and 2, which stays marked. Then set b to 2 and 3 and swing again: √5 and √10 stay on the line too. A number like √4 is familiar; what √2 and √5 actually are needs a closer look, which is the next step.',

    s1k: 'STEP 1 · ZOOM IN',
    s1t: 'It lands between 1 and 2 — how many digits can we read by zooming?',
    s1e: 'The question here: how does a position on the number line turn into a decimal? Keep zooming. Cut the stretch from 1 to 2 into 10 equal parts and see which part the point is in: that is the first digit after the decimal point. Cut that part into 10 again for the second digit, and so on — every zoom reads one more digit. The top row is the whole stretch; each row below is the highlighted cell of the row above, blown up 10 times. Compare different numbers. The fraction 7/8 runs out after a few zooms and then shows only zeros: a <strong>terminating decimal</strong>. The digits of 1/3 and 1/7 come round in the same block again and again: a <strong>repeating decimal</strong> (the block is called the <strong>period</strong>). The digits of √2 and √3 never run out and show no repeating block. The digits come from exact integer arithmetic, not rounding.',
    pick: 'Pick a number', zoom: 'Decimal places read',
    c1a: 'Each row blows up the highlighted cell above it 10 times',
    s1read: '{name} = {dec} (read to {k} decimal places).',
    s1term: 'It stops at decimal place {k} and is all zeros after that: a few zooms in, the point sits exactly on a tick mark.',
    s1rep: '“{block}” repeats for ever from decimal place {s}; the period is {L} digits long.',
    s1irr: 'No block of digits keeps repeating in the first {k} places. Looking at digits alone cannot settle it; step 3 proves it never repeats.',
    s1hint: 'What to watch: pick √2 and drag “Decimal places read” from 1 to 8. With each new row, the digit in the highlighted cell is the newly read digit, and the numbers at the row ends gain a digit. Then do the same with 7/8 and with 1/7: from the third row on, 7/8 sits right on a tick mark; the digits of 1/7 come round as 142857 again and again.',

    s2k: 'STEP 2 · FRACTIONS TAKE AIM',
    s2t: 'Is there a fraction exactly equal to √2?',
    s2e: 'The question here: √2 lies between 1.41 and 1.42 — could some <strong>fraction</strong> p/q (p and q whole numbers) be exactly equal to it? The bigger the denominators you allow, the more tightly fractions pack the line, so surely one of them hits. The slider sets the largest denominator N. The top panel draws every fraction between 1.30 and 1.53 with denominator up to N as a tick (smaller denominators get taller ticks); the orange line is √2. The bottom panel takes, for each denominator q, the fraction closest to √2 and plots its <strong>error</strong> |p/q − √2| — how far it misses; each grid step on the vertical axis is a factor of 10, lower is closer. There is an even blunter test: if p/q = √2, squaring gives p² = 2q², that is, p² − 2q² = 0.',
    nSlider: 'Largest denominator N',
    c2a: 'Fractions between 1.30 and 1.53 (denominator ≤ {N})', c2b: 'Smallest miss for each denominator (lower = closer)',
    lgRoot: '√2', lgBest: 'closest fraction so far', lgRec: 'record-breaking denominators',
    s2readout: 'With denominators up to {N}, the closest fraction to √2 is {p}/{q} = {v}, missing by about {e}. Test: {p}² − 2 × {q}² = {gap}, not 0.',
    s2hint: 'What to watch: drag N slowly from 1 to 60. The ticks crowd together, yet a gap always stays open around the orange line. In the bottom panel the record-breaking denominators (such as 5, 12, 29) each sit lower than the last, but none reaches 0. In the readout, p² − 2q² is always 1, −1 or further — never 0. That only shows every fraction tried so far misses; the next step shows why every fraction must.',

    s3k: 'STEP 3 · WHY THEY MISS',
    s3t: 'Why can p² never equal 2q²?',
    s3e: 'The question here: step 2 only tried finitely many fractions. How can we be sure that <strong>no</strong> fraction p/q has p² = 2q²? Count factors of 2. Divide a whole number by 2 again and again until it stops dividing evenly; the number of times you can do it is fixed. Whatever count of 2s p has, p² = p × p has twice as many, so p² always contains an <strong>even</strong> number of 2s. So does q², and 2q² has one more 2 on top: an <strong>odd</strong> number. An even count on one side and an odd count on the other — the two numbers cannot be equal. So √2 cannot be written as a ratio of two whole numbers. A number that cannot be written that way is called <strong>irrational</strong>; one that can (whole numbers and fractions) is <strong>rational</strong>.',
    pSlider: 'Numerator p', qSlider: 'Denominator q', closest: 'Set p as close to q × √2 as possible',
    c3a: 'Pairing up the factors of 2 on each side',
    pairLbl: 'paired', aloneLbl: 'left over',
    s3readout: 'p² = {pp}, which is {a} twos multiplied together, times {pr}: an even count of 2s, {a}. 2q² = {qq}, which is {b} twos multiplied together, times {qr}: an odd count of 2s, {b}.',
    s3diff: 'They differ by {d}, so they are not equal.',
    s3hint: 'What to watch: press “Set p as close to q × √2 as possible” to make the two sides nearly equal, then drag q anywhere. On the left the 2s always pair off; on the right one is always left over (pink). Whatever p and q are, that spare 2 never goes away, so the two sides always miss.',

    s4k: 'STEP 4 · SORT THE NUMBERS',
    s4t: 'Which of these numbers are rational, and which irrational?',
    s4e: 'The question here: given a number, how can you tell whether it is rational (a ratio of two whole numbers) or irrational? Look at its decimal. Terminating and repeating decimals can both be turned back into fractions, so they are rational; a decimal that never ends and never repeats is irrational. Rational and irrational numbers together are the <strong>real numbers</strong>: every point on the number line is a real number, and every real number has its own point on the line. Fractions already have their places there (<a class="xlink" href="../../../math/arithmetic/fractions/#step1">→ Fractions, step 1: a fraction is a point on the number line too</a>). Press the numbers below one by one to put them on the line and read their decimals and the reason.',
    c4a: 'Numbers placed on the line (green = rational, orange = irrational)',
    lgRat: 'rational', lgIrr: 'irrational',
    n_f34: '3/4', n_f13: '1/3', n_fm27: '−2/7', n_s9: '√9', n_s8: '√8', n_f227: '22/7', n_pi: 'π', n_pat: '0.1010010001…',
    r_term: '{name} = {dec}: a terminating decimal that stops at decimal place {k}. Every fraction whose reduced denominator has no prime factors but 2 and 5 behaves like this. Rational.',
    r_rep: '{name} = {dec}…: “{block}” repeats for ever from decimal place {s} (a period of {L} digits). A repeating decimal, so rational.',
    r_int: '{name} = {dec}: 9 = 3², so √9 is exactly the whole number 3 = 3/1. Rational.',
    r_s8: '{name} = {dec}…: √8 = 2 × √2. If √8 were a ratio of whole numbers, so would √2 = √8 ÷ 2 be — which step 3 rules out. Irrational.',
    r_pi: '{name} = {dec}…: a circle’s circumference divided by its diameter. Mathematicians have proved it is irrational (not proved on this page). It is close to 22/7 = 3.142857…, but not equal.',
    r_pat: '{name} = {dec}…: each run of 0s between the 1s is one longer than the last, so no block of digits ever repeats for good. It never ends and never repeats: irrational.',
    s4count: '{k}/8 numbers placed: {r} rational, {i} irrational.',
    s4none: 'Nothing placed yet — press any of the buttons below.',
    s4hint: 'What to watch: press 22/7, then π. The two points almost coincide on the line, yet their decimals part ways at the third place — one repeats, the other does not. Then press √9 and √8: both carry a root sign, but one is a whole number and the other irrational. A root sign alone does not make a number irrational.',

    s5k: 'STEP 5 · OTHER ROOTS',
    s5t: 'Between which whole numbers does √n lie — and when is it whole?',
    s5e: 'The question here: for any whole number n, where on the line is √n, and is it rational or irrational? The curve is y = x²: whatever x is, the height is x squared. Go across from n on the vertical axis to the curve, then straight down to the horizontal axis. Where you land, x² = n, so that x is √n. If n is a <strong>perfect square</strong> (a whole number squared, like 1, 4, 9, 16), √n is a whole number; otherwise it sits between two neighbouring whole numbers and is irrational. The reason is step 3 again, counting any prime, not just 2: when n is not a perfect square, some prime appears in n an odd number of times, so in p² = n × q² that prime appears an even number of times on one side and an odd number on the other.',
    nRoot: 'The number n under the root',
    c5a: 'Curve y = x²: across from n to the curve, then down',
    lgSq: 'roots of perfect squares (whole)', lgNs: 'all the others (irrational)',
    s5sq: '√{n} = {r}, since {r}² = {n}: {n} is a perfect square, so √{n} is a whole number.',
    s5irr: '√{n} = {dec}… (12 places). {lo}² = {lo2} < {n} < {hi2} = {hi}², so √{n} lies between {lo} and {hi}. {n} is not a perfect square, so √{n} is irrational.',
    s5count: '{k} roots marked on the horizontal axis, {s} of them whole numbers.',
    s5hint: 'What to watch: drag n from 1 to 50 one notch at a time. The landing point sits on a whole-number tick (green) only at 1, 4, 9, 16, 25, 36 and 49; every other one falls between two whole numbers (orange). Further right, more roots crowd between neighbouring whole numbers: the curve gets steeper, so each step of n moves the root less.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Who lives on the number line',
    s6fin: 'A compass swings the diagonal onto the line, so √2 is one definite point there. Zooming reads its decimal one digit at a time, but the digits never end and never repeat. No fraction hits it, because p² holds an even number of 2s and 2q² an odd number.',
    formula: 'rational = can be written p/q = terminating or repeating decimal\nirrational = never ends, never repeats: √2, √8, π\nreal = rational + irrational = every point on the line',
    boundary: 'Mind the limits: p and q here are whole numbers with q ≠ 0. “√n is either whole or irrational” holds for whole numbers n; roots of fractions, such as √(1/4) = 1/2, are a separate matter. That π is irrational is a proved theorem this page does not prove. However finely the line is drawn, a screen only resolves pixels and cannot tell 1.4142 from √2, so this page relies on digits and proof, not on the eye.',
    linksTitle: 'Where to next',
    lk1: '→ Pythagoras, step 6: Pythagorean triples and √2',
    lk2: '→ Negative numbers, step 0: the line carries on below 0',
    lk3: '→ Fractions, step 1: a fraction is a point on the line too',
    lk4: '→ Coordinate plane, step 0: one line gives a point an address; a plane needs two',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Real Numbers & the Number Line · Where √2 Lands”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
