'use strict';
// Number theory & counting lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '数论与组合 · 先拆成质数，再把方法数清',
    back: '← 知识索引',
    compare: '对照另一版本：数论与组合 · 把结构算出来 →',
    navLabel: '数论与组合步骤导航',
    tagline: '一个整数能拆成哪些质数相乘？两个数共有的最大因数怎么找？在方格街区里走最短路有几条？三个问题看着不相干，用的却是同一个办法：先把对象拆成最小的部件，再数这些部件能怎样组合。页面上的每个数字都由当前滑杆当场算出。',
    nav0: '0 质数积木', nav1: '1 因数表', nav2: '2 切正方形', nav3: '3 两盏灯', nav4: '4 街区路径', nav5: '5 讲不讲顺序', nav6: '6 收束与自测',

    s0k: '第 0 步 · 拆到底',
    s0t: '把一个数一直拆下去，最后剩下的「积木」每次都一样吗？',
    s0e: '这一步要回答：把 n 写成两个更小的数相乘（比如 360 = 12 × 30），再把能拆的数继续拆，直到拆不动为止——最后得到的那组数，会不会因为拆法不同而不同？拆不动的数叫<strong>质数</strong>：大于 1，而且只能被 1 和它自己整除，比如 2、3、5、7、11。大于 1 又能拆的数叫<strong>合数</strong>，比如 12 = 3 × 4。下图叫<strong>因数树</strong>：每个分叉表示「上面的数 = 下面两个数相乘」，青色圆是还能拆的合数，橙色圆是拆到底的质数。第一刀有好几种切法，切法一变，整棵树都会变。',
    nSlider: '要拆的数 n', nextSplit: '换一种第一刀', resetSplit: '回到第一种',
    s0lgC: '合数（还能拆）', s0lgP: '质数（拆到底）',
    s0readout: '第一刀：{n} = {a} × {b}（{n} 共有 {J} 种第一刀，这是第 {j} 种）。橙色质数从小到大：{leaves}，所以 {n} = {pf}。到现在你试过 {tried} 种第一刀，得到的质数组{same}。',
    sameYes: '每一次都相同', sameNo: '出现了不同（这不应该发生）',
    s0prime: '{n} 是质数：除了 1 × {n} 没有别的拆法，它自己就是一块积木。',
    s0hint: '观察顺序：保持 n 不变，连按几次「换一种第一刀」，看树的形状怎么变、橙色质数组有没有变；再拖 n 换个数重复。这个「拆法不同、积木相同」的事实叫<strong>算术基本定理</strong>：每个大于 1 的整数写成质数之积的方式只有一种（不计先后）。页面上你只看了几个数；测试把 2–400 的每个数、每种第一刀都核过一遍。为什么 1 不算质数？因为乘几个 1 都不改变结果，若 1 算质数，「只有一种写法」就不成立了。',

    s1k: '第 1 步 · 因数表',
    s1t: '不一个个去试除，能直接说出 n 有几个因数吗？',
    s1e: '这一步要回答：n 的<strong>因数</strong>（能整除 n 的正整数；12 的因数是 1、2、3、4、6、12）一共有几个？上一步把 n 拆成了质数积木，例如 72 = 2³ × 3²（2³ 表示 3 个 2 相乘，右上角的小数字叫<strong>指数</strong>，即这个质数用了几块）。72 的每个因数都只能从这些积木里取一部分：2 取 0、1、2 或 3 块（4 种），3 取 0、1 或 2 块（3 种），两种取法互不影响，所以因数有 4 × 3 = 12 个。下表把这件事摆成一张乘法表：左列是 n 的最小质因数的各次幂，顶行是 n 去掉这个质因数后剩下那部分的全部因数，每格 = 行首 × 列首。',
    n1Slider: '数 n', pickSlider: '选中的因数（按表中顺序）',
    s1lgPick: '选中的因数 d', s1lgMate: '它的搭档 n ÷ d', s1lgHead: '行首 / 列首（灰色）',
    s1readout: '{n} = {pf}。表有 {r} 行 × {c} 列 = {d} 格，恰好是 {n} 的全部因数，一个不多一个不少（各指数加 1 再相乘：{formula} = {d}）。选中 {x}，它的搭档 {n} ÷ {x} = {y}。{sq}',
    sqYes: '{n} = {s} × {s} 是完全平方数：{s} 和自己配对，所以因数个数是奇数。',
    sqNo: '{n} 不是完全平方数：因数两两配对，所以个数是偶数。',
    s1hint: '观察顺序：先拖 n，数一数表的行数和列数，对照读数里的乘式；再拖「选中的因数」，看橙框和青框——一个往大走，另一个就往小走，两者相乘总是 n。最后试 36、64、100 这样的完全平方数，看有没有一个格子自己配自己。',

    s2k: '第 2 步 · 切正方形',
    s2t: '两个数最大的公共因数，能不能不分解质因数就找出来？',
    s2e: '这一步要回答：同时整除 a 和 b 的数里最大的那个，叫<strong>最大公因数</strong>，记作 gcd(a, b)。分解质因数能找到它，但数一大就难分解。另一个办法：画一个 a × b 的长方形，切掉尽可能大的正方形（边长 = 短边），剩下一条窄长方形，再对它重复，直到正好切完。最后那种正方形的边长就是 gcd。为什么？切一次就是一次带余除法 a = q × b + r：q 是切下几个正方形（商），r 是剩下的宽（余数，0 ≤ r < b；<a class="xlink" href="../../../math/arithmetic/division-remainder/#step1">→ 除法与余数第 1 步：余数为什么一定比除数小</a>）。凡是同时整除 a 和 b 的数，也整除 r = a − q × b；反过来，同时整除 b 和 r 的数也整除 a。所以 a、b 的公因数和 b、r 的公因数是同一批，gcd 不变，数却越来越小。这就是<strong>欧几里得算法</strong>（辗转相除法）。',
    aSlider: '长 a', bSlider: '宽 b', cutStep: '一刀一刀切', cutAll: '直接切完',
    s2lg: '同一种颜色 = 同一次除法切下的正方形；正方形里的数是边长（太小时不标）',
    s2progress: '已做 {c}/{N} 次除法：',
    s2more: '……还没切完，继续按「一刀一刀切」。', sep: '；',
    s2readout: '{prog}{chain}。共 {steps} 次除法、切出 {sq} 个正方形，gcd({a}, {b}) = {g}。用质因数核对：{a} = {pfa}，{b} = {pfb}，每个质数取两边较少的那份，乘出来也是 {g2}。{coprime}',
    coprimeNote: 'gcd = 1，叫 {a} 和 {b} 「互质」：没有比 1 大的公因数，最后切成 1 × 1 的小方格。',
    s2hint: '观察顺序：先按「一刀一刀切」，每一刀对应读数里的一个算式，同一种颜色的正方形来自同一次除法；再把 a、b 拖到 89 和 55（两个相邻的斐波那契数），看为什么它们最费事：每次只切得下一个正方形。在本页 6–120 的滑杆范围里，任何一对数最多做 9 次除法，89 和 55 正是最慢的一对。',

    s3k: '第 3 步 · 两盏灯',
    s3t: '两盏灯一起闪过之后，要等多久才会再一起闪？',
    s3e: '这一步要回答：灯 A 每 a 秒闪一次，灯 B 每 b 秒闪一次，第 0 秒一起闪；下一次一起闪是第几秒？A 闪的时刻是 a 的<strong>倍数</strong>（a、2a、3a……），B 闪的时刻是 b 的倍数，两盏灯一起闪的时刻是它们的<strong>公倍数</strong>，最早的那个叫<strong>最小公倍数</strong>，记作 lcm(a, b)。从质因数看：公倍数里每个质数的份数必须既够 a 用、又够 b 用，所以取两边较多的那份；上一步的 gcd 取的是较少的那份。较多加较少，正好是两边的份数之和，于是 gcd × lcm = a × b。给分数通分时找的最小公分母，就是两个分母的最小公倍数（<a class="xlink" href="../../../math/arithmetic/fractions/#step4">→ 分数第 4 步：加法为什么先通分</a>）。',
    laSlider: '灯 A 的间隔 a（秒）', lbSlider: '灯 B 的间隔 b（秒）', play3: '从第 0 秒开始播放', showAll3: '显示整段',
    lampA: '灯 A', lampB: '灯 B', sec: '秒',
    s3lgA: '灯 A 闪', s3lgB: '灯 B 闪', s3lgBoth: '两盏一起闪', s3lgNow: '播放到的时刻',
    s3readout: '{prog}A 每 {a} 秒、B 每 {b} 秒：第 0 秒之后第一次一起闪在第 {l} 秒，这时 A 闪了 {na} 次、B 闪了 {nb} 次（不算第 0 秒）。lcm({a}, {b}) = {l}，gcd = {g}，{g} × {l} = {gl} = {a} × {b}。{note}',
    s3playing: '播放中：第 {t} 秒，A 已闪 {ca} 次，B 已闪 {cb} 次。',
    noteCoprime: '{a} 和 {b} 互质，lcm 就是两数之积。',
    noteDivides: '{s} 整除 {L}，lcm 就是较大的 {L}。',
    noteShared: '两数有公因数 {g}，所以不必等满 {a} × {b} = {ab} 秒。',
    s3hint: '观察顺序：先按「从第 0 秒开始播放」，看两行闪光一格格出现，直到橙色竖线处第一次对齐；再固定 b = 8，把 a 从 5 拖到 6，等待时间从 40 秒缩到 24 秒——因为 6 和 8 有公因数 2。最后试 a = 4、b = 8，一个整除另一个时会怎样。',

    s4k: '第 4 步 · 街区路径',
    s4t: '只许向右、向上走，从左下角到右上角有多少条最短路？',
    s4e: '这一步要回答：街区宽 r 格、高 u 格，每条最短路都要向右走 r 步、向上走 u 步，共 r + u 步，不同的路只差在哪几步向上。数法一（加法）：到达一个路口的走法数 = 从它左边过来的走法数 + 从它下边过来的走法数，因为最后一步只能从这两处来。从左下角（1 种）开始逐个相加，就得到图中每个路口的数；斜着看这些数，正是<strong>杨辉三角</strong>（也叫帕斯卡三角）。数法二（挑选）：从 r + u 步里挑出哪 u 步向上，挑法数叫<strong>组合数</strong>，记作 C(r + u, u)，读作「从 r + u 个里选 u 个」，等于 (r + u)! ÷ (u! × r!)，其中 k! 读作「k 的阶乘」，是 1 × 2 × … × k。两种数法必须得到同一个数（<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ 二项分布第 0 步：钉板上的小球也在数同样的路</a>）。',
    rSlider: '宽 r（向右的步数）', uSlider: '高 u（向上的步数）', walk4: '逐条画出全部路径', clear4: '清空已画的路',
    s4lgNum: '路口旁的数 = 走到这里的走法数', s4lgCur: '当前这一条路', s4lgUsed: '已画过的路（越亮 = 越多路经过）',
    s4readout: '{prog}{r} × {u} 街区，右上角的数是 {N}。用组合数：C({n}, {u}) = {n}! ÷ ({u}! × {r}!) = {N}。两种数法相同。',
    s4progress: '已画 {c}/{N} 条，当前：{word}（R = 向右，U = 向上）。',
    s4hint: '观察顺序：先按「逐条画出全部路径」，看计数一直走到右上角那个数为止，被很多路经过的街段会越画越亮；再把 r、u 对调（比如 4 × 2 和 2 × 4），路口上的数整体翻了个面，总数却不变：挑哪 u 步向上，就等于挑哪 r 步向右，所以 C(n, u) = C(n, r)。',

    s5k: '第 5 步 · 讲不讲顺序',
    s5t: '「选 3 个人」和「选 3 个人并排好座位」差几倍？',
    s5e: '这一步要回答：从 n 个字母里挑 k 个，讲究先后顺序有多少种，不讲究又有多少种？讲顺序的叫<strong>排列</strong>，记作 P(n, k)：第一个位置有 n 种选法，第二个剩 n − 1 种……分步做的事，每一步的选法数相乘（<strong>乘法原理</strong>），所以 P(n, k) = n × (n − 1) × … × (n − k + 1)。不讲顺序的就是上一步的组合数 C(n, k)。下图每一列是一组字母（一个组合），列里的每个点是这组字母的一种先后顺序。同一组 k 个字母能排出 k! 种顺序，所以每列点数一样多：数全部的点得 P(n, k)，数列得 C(n, k)，于是 C(n, k) = P(n, k) ÷ k!（<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ 排列组合第 3 步：从排列里除掉重复的顺序</a>）。',
    poolSlider: '字母总数 n', kSlider: '挑出的个数 k', groupSlider: '查看第几组',
    s5lgCol: '一列 = 一个组合', s5lgDot: '一个点 = 一种排列', s5lgPick: '正在查看的组',
    s5readout: '从 {n} 个字母里挑 {k} 个：排列 P({n}, {k}) = {P}，组合 C({n}, {k}) = {C}，每组有 {k}! = {kf} 种顺序，{C} × {kf} = {P}。第 {j} 组「{set}」的全部顺序：{list}。',
    s5hint: '观察顺序：固定 n，把 k 从 1 拖到 3，看每列的点数从 1 变 2 再变 6——这正是排列数比组合数多出的倍数 k!；再拖「查看第几组」，读数会列出这一列每个点对应的顺序。',

    s6k: '第 6 步 · 收束',
    s6t: '收束：拆开、对齐、数清——再做几道迁移题',
    s6fin: '回头看这六步，用的是同一个思路：<strong>先拆成最小的部件，再数部件的组合</strong>。质因数是整数的部件，而且拆法唯一；因数 = 从每种质数里各取几块，所以个数是各指数加 1 的乘积；gcd 取两边较少的那份，lcm 取较多的那份，欧几里得算法不分解也能求出 gcd；一条最短路 = 一串 R 和 U，数路就是数「哪几步向上」，加法规则长出杨辉三角；讲顺序与否相差 k! 倍。',
    formula: 'n = p₁^e₁ × p₂^e₂ × …   →   因数个数 = (e₁ + 1)(e₂ + 1)…\ngcd(a, b) = gcd(b, a mod b)，gcd × lcm = a × b\nC(n, k) = C(n − 1, k − 1) + C(n − 1, k) = n! ÷ (k! (n − k)!) = P(n, k) ÷ k!',
    boundary: '适用范围：本页只讨论正整数；因数个数公式要先把 n 分解成质数；路径计数只许向右、向上走（最短路）。数大了以后，分解质因数会很慢，而欧几里得算法仍然很快——这正是密码学里常用它的原因之一。',
    quizTitle: '迁移检查：题目由页面随机出，答案由同一套计算核对',
    newQ: '出一道新题', checkQ: '核对', showQ: '看答案', ansLabel: '你的答案',
    qDiv: '{n} 一共有几个因数？',
    qGcd: '{a} 和 {b} 的最大公因数是多少？',
    qLcm: '两盏灯每 {a} 秒和每 {b} 秒各闪一次，第 0 秒一起闪。下一次一起闪是第几秒？',
    qPath: '宽 {r} 格、高 {u} 格的街区，只向右、向上走，从左下角到右上角有几条最短路？',
    whyDiv: '{n} = {pf}，各指数加 1 再相乘：{formula} = {ans}。',
    whyGcd: '{chain}，最后一个非零除数是 {ans}。',
    whyLcm: 'gcd({a}, {b}) = {g}，lcm = {a} × {b} ÷ {g} = {ans}。',
    whyPath: '共 {n} 步，挑出哪 {u} 步向上：C({n}, {u}) = {ans}。',
    qRight: '答对了。{why}', qWrong: '还不对，再试一次；需要时可按「看答案」。提示：{tip}', qShown: '答案是 {ans}。{why}', qEmpty: '先填一个整数。',
    tipDiv: '先分解质因数，再用第 1 步的乘法表思路。', tipGcd: '用第 2 步的切正方形：大数除以小数取余数，重复。', tipLcm: '最小公倍数 = 两数之积 ÷ 最大公因数。', tipPath: '从 r + u 步里挑出向上的 u 步。',
    linksTitle: '接着去哪里',
    lk1: '→ 分数第 4 步：通分时的最小公分母就是 lcm',
    lk2: '→ 除法与余数第 1 步：欧几里得算法每一刀都是一次带余除法',
    lk3: '→ 排列组合第 3 步：组合 = 排列 ÷ 重复的顺序',
    lk4: '→ 二项分布第 0 步：钉板上的路径数也是杨辉三角',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《数论与组合 · 把结构算出来》的平行版本。'
  },
  en: {
    pageTitle: 'Number Theory & Counting · Split into Primes, Then Count the Ways',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Number Theory & Counting · Compute the Structure →',
    navLabel: 'Number theory and counting steps',
    tagline: 'Which primes multiply to make a given whole number? How do you find the largest number that divides two others? How many shortest routes cross a city grid? Three unrelated-looking questions with one shared move: break the object into its smallest parts, then count how those parts can combine. Every number on this page is computed live from the sliders.',
    nav0: '0 Prime blocks', nav1: '1 Divisor table', nav2: '2 Cutting squares', nav3: '3 Two lamps', nav4: '4 Grid routes', nav5: '5 Order or not', nav6: '6 Wrap-up & check',

    s0k: 'Step 0 · Split all the way',
    s0t: 'Keep splitting a number until you can’t — do you always end with the same blocks?',
    s0e: 'This step asks: write n as a product of two smaller numbers (say 360 = 12 × 30), keep splitting anything that still splits, and stop when nothing does. Could a different way of splitting leave you with a different set of pieces? A number that cannot be split is a <strong>prime</strong>: it is bigger than 1 and its only divisors are 1 and itself — 2, 3, 5, 7, 11. A number bigger than 1 that can be split is <strong>composite</strong>, like 12 = 3 × 4. The picture is a <strong>factor tree</strong>: each fork says “the number above = the two below multiplied”, cyan circles are composites that still split, orange circles are primes. The first cut can be made in several ways, and changing it reshapes the whole tree.',
    nSlider: 'Number to split, n', nextSplit: 'Try another first cut', resetSplit: 'Back to the first cut',
    s0lgC: 'composite (still splits)', s0lgP: 'prime (fully split)',
    s0readout: 'First cut: {n} = {a} × {b} (cut {j} of the {J} possible first cuts of {n}). Orange primes in order: {leaves}, so {n} = {pf}. Across the {tried} first cuts you have tried, the set of primes {same}.',
    sameYes: 'has been identical every time', sameNo: 'changed (this should never happen)',
    s0prime: '{n} is prime: apart from 1 × {n} it has no split, so it is a block on its own.',
    s0hint: 'What to watch: keep n fixed and press “Try another first cut” a few times — the tree changes shape; does the orange set change? Then drag n and repeat. “Different cuts, same blocks” is the <strong>Fundamental Theorem of Arithmetic</strong>: every whole number above 1 is a product of primes in exactly one way, ignoring order. On the page you only see a few numbers; the tests check every number from 2 to 400 under every first cut. Why isn’t 1 prime? Multiplying by extra 1s changes nothing, so if 1 counted, “exactly one way” would fail.',

    s1k: 'Step 1 · Divisor table',
    s1t: 'Without trial division, can you say straight away how many divisors n has?',
    s1e: 'This step asks: how many <strong>divisors</strong> does n have — positive whole numbers that divide it exactly (12 has 1, 2, 3, 4, 6, 12)? Step 0 broke n into prime blocks, e.g. 72 = 2³ × 3² (2³ means three 2s multiplied; the small raised number is the <strong>exponent</strong>, how many blocks of that prime there are). Every divisor of 72 is built from some of those blocks: take 0, 1, 2 or 3 of the 2s (4 choices) and 0, 1 or 2 of the 3s (3 choices). The two choices are independent, so 72 has 4 × 3 = 12 divisors. The table lays this out as a multiplication table: the left column holds the powers of the smallest prime in n, the top row holds every divisor of what is left of n once that prime is removed, and each cell is row head × column head.',
    n1Slider: 'Number n', pickSlider: 'Selected divisor (in table order)',
    s1lgPick: 'selected divisor d', s1lgMate: 'its partner n ÷ d', s1lgHead: 'row / column heads (grey)',
    s1readout: '{n} = {pf}. The table has {r} rows × {c} columns = {d} cells — exactly the divisors of {n}, none missing and none repeated (add 1 to each exponent and multiply: {formula} = {d}). Selected {x}; its partner is {n} ÷ {x} = {y}. {sq}',
    sqYes: '{n} = {s} × {s} is a perfect square: {s} pairs with itself, so the divisor count is odd.',
    sqNo: '{n} is not a perfect square: the divisors pair off, so the count is even.',
    s1hint: 'What to watch: drag n first and count the rows and columns against the product in the readout. Then drag the selected divisor: the orange box and the cyan box move in opposite directions, and their product is always n. Finally try perfect squares such as 36, 64 or 100 — look for a cell that is its own partner.',

    s2k: 'Step 2 · Cutting squares',
    s2t: 'Can you find the largest common divisor of two numbers without factorising them?',
    s2e: 'This step asks: among the numbers that divide both a and b, the largest is the <strong>greatest common divisor</strong>, gcd(a, b). Prime factors will give it, but big numbers are hard to factorise. Here is another route. Draw an a × b rectangle, cut off the largest squares you can (side = the short side), and you are left with a thinner rectangle; repeat until nothing is left over. The side of the last squares is the gcd. Why? Each round of cutting is a division with remainder, a = q × b + r: q is how many squares you cut (the quotient) and r is the leftover width (the remainder, 0 ≤ r < b; <a class="xlink" href="../../../math/arithmetic/division-remainder/#step1">→ Division & remainders, step 1: why the remainder is always smaller than the divisor</a>). Anything that divides both a and b also divides r = a − q × b, and anything dividing both b and r also divides a. So the pair (a, b) and the pair (b, r) share exactly the same common divisors: the gcd stays put while the numbers shrink. This is <strong>Euclid’s algorithm</strong>.',
    aSlider: 'Length a', bSlider: 'Width b', cutStep: 'Cut one round at a time', cutAll: 'Cut everything',
    s2lg: 'Same colour = squares cut in the same division; the number inside is the side (omitted when too small)',
    s2progress: '{c}/{N} divisions done: ',
    s2more: '… not finished yet — keep pressing “Cut one round at a time”.', sep: '; ',
    s2readout: '{prog}{chain}. That is {steps} divisions and {sq} squares, so gcd({a}, {b}) = {g}. Check with primes: {a} = {pfa}, {b} = {pfb}; keep the smaller share of each prime and you also get {g2}. {coprime}',
    coprimeNote: 'gcd = 1, so {a} and {b} are coprime: no common divisor above 1, and the cutting ends in 1 × 1 squares.',
    s2hint: 'What to watch: press “Cut one round at a time” — each round matches one equation in the readout, and squares of one colour come from one division. Then set a and b to 89 and 55, two neighbouring Fibonacci numbers, and see why they are the slowest case: every round cuts just one square. Across this page’s slider range (6 to 120), no pair needs more than 9 divisions, and 89 and 55 are the pair that needs all 9.',

    s3k: 'Step 3 · Two lamps',
    s3t: 'Two lamps flash together. How long until they flash together again?',
    s3e: 'This step asks: lamp A flashes every a seconds, lamp B every b seconds, and both flash at second 0. When is the next time they flash together? A flashes at the <strong>multiples</strong> of a (a, 2a, 3a, …), B at the multiples of b, so they coincide at the <strong>common multiples</strong>, and the first one is the <strong>least common multiple</strong>, lcm(a, b). In prime terms, a common multiple must hold enough of each prime for a and enough for b, so it takes the larger share; the gcd from step 2 takes the smaller share. Larger plus smaller is the two shares added together, which is why gcd × lcm = a × b. The lowest common denominator you look for when adding fractions is exactly the lcm of the denominators (<a class="xlink" href="../../../math/arithmetic/fractions/#step4">→ Fractions, step 4: why adding needs a common denominator</a>).',
    laSlider: 'Lamp A interval a (s)', lbSlider: 'Lamp B interval b (s)', play3: 'Play from second 0', showAll3: 'Show the whole stretch',
    lampA: 'Lamp A', lampB: 'Lamp B', sec: 's',
    s3lgA: 'lamp A flashes', s3lgB: 'lamp B flashes', s3lgBoth: 'both flash', s3lgNow: 'playback time',
    s3readout: '{prog}A every {a} s, B every {b} s: after second 0 they first flash together at second {l}, by which point A has flashed {na} times and B {nb} times (not counting second 0). lcm({a}, {b}) = {l}, gcd = {g}, and {g} × {l} = {gl} = {a} × {b}. {note}',
    s3playing: 'Playing: second {t}; A has flashed {ca} times, B {cb} times. ',
    noteCoprime: '{a} and {b} are coprime, so the lcm is simply their product.',
    noteDivides: '{s} divides {L}, so the lcm is just the larger number, {L}.',
    noteShared: 'They share the factor {g}, so you don’t have to wait the full {a} × {b} = {ab} seconds.',
    s3hint: 'What to watch: press “Play from second 0” and watch both rows fill in until they line up at the orange line. Then hold b = 8 and move a from 5 to 6: the wait drops from 40 s to 24 s, because 6 and 8 share a factor of 2. Finally try a = 4, b = 8 — what happens when one divides the other?',

    s4k: 'Step 4 · Grid routes',
    s4t: 'Moving only right or up, how many shortest routes run from the bottom-left corner to the top-right?',
    s4e: 'This step asks: the grid is r blocks wide and u blocks tall, so every shortest route takes r steps right and u steps up, r + u steps in all; two routes differ only in which steps go up. Count it one way (adding): the number of ways into a corner = the ways into the corner on its left + the ways into the corner below it, because the last step must come from one of those two. Start with 1 at the bottom-left and add your way across to get every number on the picture; read them along the diagonals and you have <strong>Pascal’s triangle</strong>. Count it another way (choosing): pick which u of the r + u steps go up. That count is a <strong>binomial coefficient</strong>, C(r + u, u), read “r + u choose u”, and it equals (r + u)! ÷ (u! × r!), where k! (“k factorial”) means 1 × 2 × … × k. Both ways must land on the same number (<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ Binomial & normal, step 0: the balls on a Galton board count the same routes</a>).',
    rSlider: 'Width r (steps right)', uSlider: 'Height u (steps up)', walk4: 'Draw every route, one by one', clear4: 'Clear the drawn routes',
    s4lgNum: 'number at a corner = ways to reach it', s4lgCur: 'the route being drawn', s4lgUsed: 'routes already drawn (brighter = more routes use it)',
    s4readout: '{prog}On a {r} × {u} grid the top-right number is {N}. By choosing: C({n}, {u}) = {n}! ÷ ({u}! × {r}!) = {N}. Both counts agree.',
    s4progress: '{c}/{N} routes drawn; current: {word} (R = right, U = up). ',
    s4hint: 'What to watch: press “Draw every route, one by one” and follow the count up to the top-right number; streets used by many routes glow brighter as they are drawn over. Then swap r and u (4 × 2 versus 2 × 4): the corner numbers flip over, but the total doesn’t change — choosing which u steps go up is the same as choosing which r steps go right, so C(n, u) = C(n, r).',

    s5k: 'Step 5 · Order or not',
    s5t: 'How many times more ways are there to seat 3 people in order than just to pick them?',
    s5e: 'This step asks: choose k letters out of n. How many ways are there if order matters, and how many if it doesn’t? Ordered selections are <strong>permutations</strong>, P(n, k): n choices for the first slot, n − 1 for the second, and so on. When a task happens in stages you multiply the number of choices at each stage (the <strong>multiplication principle</strong>), so P(n, k) = n × (n − 1) × … × (n − k + 1). Unordered selections are the binomial coefficients C(n, k) from step 4. In the picture each column is one set of letters (one combination) and each dot in it is one order of those letters. A set of k letters can be ordered in k! ways, so every column has the same number of dots: counting dots gives P(n, k), counting columns gives C(n, k), hence C(n, k) = P(n, k) ÷ k! (<a class="xlink" href="../../../probability/basics/counting-permutations/#step3">→ Counting, step 3: divide out the repeated orders</a>).',
    poolSlider: 'Letters available, n', kSlider: 'Letters chosen, k', groupSlider: 'Column to inspect',
    s5lgCol: 'one column = one combination', s5lgDot: 'one dot = one permutation', s5lgPick: 'column being inspected',
    s5readout: 'Choosing {k} of {n} letters: P({n}, {k}) = {P} permutations, C({n}, {k}) = {C} combinations, {k}! = {kf} orders per set, and {C} × {kf} = {P}. Column {j}, “{set}”, in every order: {list}.',
    s5hint: 'What to watch: hold n and raise k from 1 to 3 — the dots per column go 1, 2, 6 — exactly the factor k! by which permutations outnumber combinations. Then drag “Column to inspect”: the readout lists which order each dot stands for.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Wrap-up: split, line up, count — then try a few fresh problems',
    s6fin: 'All six steps ran on one idea: <strong>break things into their smallest parts, then count how the parts combine</strong>. Primes are the parts of a whole number, and the split is unique. A divisor takes some blocks of each prime, so the count is the product of (exponent + 1). The gcd keeps the smaller share of each prime and the lcm the larger, and Euclid’s algorithm finds the gcd with no factorising at all. A shortest route is a string of R’s and U’s, so counting routes means counting which steps go up, and the adding rule grows Pascal’s triangle. Caring about order multiplies the count by k!.',
    formula: 'n = p₁^e₁ × p₂^e₂ × …   →   number of divisors = (e₁ + 1)(e₂ + 1)…\ngcd(a, b) = gcd(b, a mod b),  gcd × lcm = a × b\nC(n, k) = C(n − 1, k − 1) + C(n − 1, k) = n! ÷ (k! (n − k)!) = P(n, k) ÷ k!',
    boundary: 'Where this applies: positive whole numbers only; the divisor formula needs n factorised first; route counting assumes right/up moves only (shortest routes). For large numbers, factorising becomes very slow while Euclid’s algorithm stays fast — one reason cryptography leans on it.',
    quizTitle: 'Transfer check: the page draws a random problem and checks it with the same calculations',
    newQ: 'New problem', checkQ: 'Check', showQ: 'Show answer', ansLabel: 'Your answer',
    qDiv: 'How many divisors does {n} have?',
    qGcd: 'What is the greatest common divisor of {a} and {b}?',
    qLcm: 'Two lamps flash every {a} s and every {b} s, together at second 0. At what second do they next flash together?',
    qPath: 'On a grid {r} blocks wide and {u} tall, moving only right or up, how many shortest routes go from bottom-left to top-right?',
    whyDiv: '{n} = {pf}; add 1 to each exponent and multiply: {formula} = {ans}.',
    whyGcd: '{chain}; the last non-zero divisor is {ans}.',
    whyLcm: 'gcd({a}, {b}) = {g}, so lcm = {a} × {b} ÷ {g} = {ans}.',
    whyPath: '{n} steps in all; choose which {u} go up: C({n}, {u}) = {ans}.',
    qRight: 'Correct. {why}', qWrong: 'Not yet — try again, or press “Show answer”. Hint: {tip}', qShown: 'The answer is {ans}. {why}', qEmpty: 'Enter a whole number first.',
    tipDiv: 'Factorise first, then think of the step 1 table.', tipGcd: 'Cut squares as in step 2: divide the larger by the smaller, keep the remainder, repeat.', tipLcm: 'lcm = product of the two ÷ their gcd.', tipPath: 'Choose which u of the r + u steps go up.',
    linksTitle: 'Where to go next',
    lk1: '→ Fractions, step 4: the lowest common denominator is an lcm',
    lk2: '→ Division & remainders, step 1: every cut in Euclid’s algorithm is a division with remainder',
    lk3: '→ Counting, step 3: combinations = permutations ÷ repeated orders',
    lk4: '→ Binomial & normal, step 0: Galton-board routes are Pascal’s triangle too',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Number Theory & Counting · Compute the Structure”.'
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
  if (typeof window.refreshNC === 'function') window.refreshNC();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.NC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
