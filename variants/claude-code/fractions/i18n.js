'use strict';
// Strings for the Claude Code edition of the fractions lesson. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Placeholders {x} are filled by app.js; every number in them comes from model.js.

const STRINGS = {
  zh: {
    pageTitle: '分数 · 把整体切开来数',
    back: '← 知识索引',
    compare: '对照另一版本：分数 · 把整体切开来数（原版）→',
    navLabel: '分数课步骤导航',
    tagline: '桌上有一条长度为 1 的纸带。把它平均切开、取走几份，就得到一个分数。这一页要弄清楚：分数是多少、落在数轴哪里、两个分数谁大、怎么相加、比 1 还多怎么写、写成小数为什么有时写不完。所有计算都用整数精确完成，写不完的小数一律标「≈」。',
    nav0: '0 切与取', nav1: '1 数轴上的点', nav2: '2 等值分数', nav3: '3 比大小', nav4: '4 加法', nav5: '5 比 1 还多', nav6: '6 写成小数', nav7: '7 收束',

    s0k: '第 0 步 · 切与取', s0t: '「四分之三」到底是多少？',
    s0e: '这一步要回答：写成 3/4 的数，说的是多少？把一条纸带当作<strong>整体</strong>，它的长度算作 1。把它<strong>平均</strong>切成 4 份（每份一样长），每份就是 1/4；涂上其中 3 份，涂色部分就是 <strong>3/4</strong>，读作「四分之三」。横线下面的数叫<strong>分母</strong>：整体平均切成了几份；横线上面的数叫<strong>分子</strong>：取了其中几份。',
    den0: '分母：平均切成几份', num0: '分子：取几份', uneven: '故意切得不一样长',
    s0read: '整条平均切成 {b} 份，每份是 {unit}；取 {a} 份，就是 {f}，读作「{say}」。',
    s0zero: '一份也不取，涂色部分是 0：{f} = 0。',
    s0whole: '取满 {b} 份就是整条：{f} = 1。',
    s0uneven: '这次 {b} 份长短不一。涂上前 {a} 份，涂色部分实际占整条的 {share}，{verdict}。只数份数不够——分数要求每份一样长。',
    s0notEq: '<span class="bad">不是 {f}</span>', s0eq: '碰巧也等于 {f}',
    s0one: '只切成 1 份时，那 1 份就是整条，没法切得不一样长。',
    took: '取了 {a} 份', cutInto: '平均切成 {b} 份', cutUneven: '切成 {b} 份（不一样长）',
    shaded: '涂色部分', whole1: '整条 = 1',
    s0hint: '观察顺序：先看默认的 3/4；再只拖分母、不动分子——份数越多，每份越短，同样取 3 份，涂色就越少。最后勾上「故意切得不一样长」：份数没变，涂色部分占整条的多少却变了。纸带里写的是每一份的大小（放得下时才写）。',

    s1k: '第 1 步 · 分数是一个数', s1t: '3/4 在数轴上落在哪里？',
    s1e: '这一步要回答：3/4 只是「4 份里的 3 份」，还是一个和 1、2 一样实实在在的数？把纸带平放到<strong>数轴</strong>上：数轴是一条标了 0、1 的直线，越往右表示的数越大（<a class="xlink" href="../../../math/arithmetic/negative-numbers/#step0">→ 负数页第 0 步：数轴往 0 的左边还能长</a>）。纸带左端对准 0，右端对准 1。从 0 出发，每次往右跳一份那么长（1/4），跳 3 次停下的点就是 3/4。它在 0 和 1 之间一个确定的位置——分数是一个数。',
    hop: '从 0 开始跳', pause: '暂停', resume: '继续',
    s1prog: '已跳 {k} / {a} 次，每次跳 {unit} 那么长，现在到了 {pos}。',
    s1done: '跳了 {hops}、每次 {unit}，停在 {f}：离 0 有 {aParts}，离 1 还差 {restParts}（{restF}）。',
    s1zero: '一次也不跳，就停在 0：{f} = 0。',
    s1one: '跳满 {b} 次正好到 1：{f} = 1。',
    bar1: '纸带（整条 = 1）',
    s1hint: '观察顺序：按「从 0 开始跳」，看每一跳的弧线留在数轴上，纸带上对应的那份同时变亮；跳到第几次，读数就数到第几次。再把分子定在 1，分母从 2 拖到 12：1/2、1/3 …… 1/12 越来越靠近 0，因为每份越来越短。跳的动画只是把「一份一份加起来」放慢给你看；减弱动态时直接画出结果。',

    s2k: '第 2 步 · 等值分数', s2t: '1/2 和 2/4 是同一个数吗？',
    s2e: '这一步要回答：写法不同的两个分数，会不会是同一个数？最上面一行是原来的分数。往下每一行，把原来的每一份<strong>再平均切成</strong>更多小份：分母（切成几份）和分子（取几份）都乘上同一个数，涂色的长度一点没变，数轴上的落点也还是那一个。落点相同的分数叫<strong>等值分数</strong>：同一个数的不同写法。反过来，把小份合并回大份，就是分子、分母同时除以同一个数，叫<strong>约分</strong>；能同时整除分子和分母的数叫<strong>公因数</strong>，除了 1 再没有公因数时，叫<strong>最简分数</strong>。',
    den2: '原分数的分母', num2: '原分数的分子', m2: '再切细：每份切成几小份',
    s2read: '{chain}：分子、分母同乘 {m}，涂色长度不变，落在数轴同一点。',
    s2simp: '{f} 还能约分：分子、分母同除以公因数 {g}，得到最简分数 {s}。',
    s2simplest: '{f} 已经是最简分数（分子、分母除了 1 没有公因数）。',
    s2hint: '观察顺序：先保持 1/2，把「再切细」从 1 拖到 5：一行行更细的纸带出现，橙色的右边缘始终对齐在同一条竖虚线上，数轴上的点不动。再把原分数改成 2/4 或 4/6，看读数告诉你它能约成什么。这个滑杆只改「怎么切」，不改涂了多长。',

    s3k: '第 3 步 · 比大小', s3t: '2/3 和 3/5，哪个大？大多少？',
    s3e: '这一步要回答：两个分数的份不一样大时，怎样比？2/3 的每份是 1/3，3/5 的每份是 1/5，份不一样大，拿「2 份」和「3 份」直接比没有意义。办法是<strong>通分</strong>：把两条纸带都切成同样大的小份，再数份数。小份的总数（新的分母）要同时是两个分母的倍数，这样的数叫<strong>公倍数</strong>，最小的那个叫<strong>最小公倍数</strong>。3 和 5 的最小公倍数是 15：2/3 = 10/15，3/5 = 9/15。10 小份比 9 小份多，所以 2/3 更大，大 1/15。',
    fA: '橙色分数', fB: '青色分数', numA: '橙色分子', denA: '橙色分母', numB: '青色分子', denB: '青色分母',
    common: '通分：切成同样大的小份', uncommon: '撤销通分',
    s3before: '橙色 {f1} 的每份是 {u1}，青色 {f2} 的每份是 {u2}：份不一样大，还不能直接数份数。按「通分」。',
    s3beforeSame: '两个分母一样，份本来就一样大：直接数，{cmp}',
    s3after: '都切成 {L} 小份（{L} 是 {b1} 和 {b2} 的最小公倍数）：{f1} = {g1}，{f2} = {g2}。{cmp}',
    s3gt: '橙色 {p1}，青色 {p2}，橙色多，所以 {f1} > {f2}，大 {diff}。',
    s3lt: '橙色 {p1}，青色 {p2}，橙色少，所以 {f1} < {f2}，小 {diff}。',
    s3eq: '橙色 {p1}，青色 {p2}，一样多，所以 {f1} = {f2}：它们是等值分数。',
    eachPart: '每份 {u}', nowIs: '通分后 = {g}',
    s3hint: '观察顺序：先不通分，看两条纸带：份的大小不同，很难数。按「通分」，两条都被细线切成同样大的小份，再数橙色、青色各涂了几小份。然后把青色调成 4/6，看两条涂色的右边缘完全对齐。下方数轴上的两个点由分数本身决定，通分只改切法，不会挪动它们。',

    s4k: '第 4 步 · 加法', s4t: '1/2 + 1/3 等于多少？为什么不是 2/5？',
    s4e: '这一步要回答：两个分数相加，到底加的是什么？加法就是把两段长度首尾相接：先从 0 走 1/2（橙段），再接着走 1/3（青段），终点就是和。常见的错法是分子加分子、分母加分母：(1+1)/(2+3) = 2/5。看数轴：2/5 比 1/2 自己还短，怎么会是「1/2 再加上一段」？毛病在于 1/2 的份和 1/3 的份不一样大，份数不能直接相加。先<strong>通分</strong>（都换成同样大的小份，2 和 3 的最小公倍数是 6）：1/2 = 3/6，1/3 = 2/6，3 小份加 2 小份是 5 小份，和是 5/6。',
    showGrid: '显示通分后的小格', showWrong: '显示错法「分子加分子、分母加分母」的落点',
    s4read: '{f1} + {f2}：通分到 {L} 小份，{g1} + {g2} = {raw}{simp}{mixed}。',
    s4simp: ' = {s}（约分）', s4mixed: '，比 1 多，也就是 {m}',
    s4wrong: '错法得到 {w}：它落在 {lo} 和 {hi} 之间，比正确的和小 {gap}。',
    s4wrongEq: '错法得到 {w}：它就等于加数 {f1} 本身，等于什么都没加上，比正确的和小 {gap}。',
    sumLbl: '和', wrongLbl: '错法',
    s4hint: '观察顺序：橙段是第一个加数，青段接在它后面，绿点是和。随便改两个分母，看粉色的「错法」落点：它总夹在两个加数之间，从来到不了绿点（两个加数都大于 0 时总是这样）。打开「通分后的小格」，数一数橙段、青段各占几小格。',

    s5k: '第 5 步 · 比 1 还多', s5t: '7/4 比一整条还长，怎么画、怎么读？',
    s5e: '这一步要回答：分子比分母大的分数是什么样？7/4 的意思没变：每份是 1/4，取 7 份。可一整条只有 4 份，放满一条还剩 3 份，只好再拿一条新的。分子小于分母的分数比 1 小，叫<strong>真分数</strong>；分子大于或等于分母的，等于或大于 1，叫<strong>假分数</strong>。把假分数里凑满的整条单独写在前面，就成了<strong>带分数</strong>：7/4 = 1¾，读作「一又四分之三」。凑满几条、还剩几份，正好是一道带余数的除法：7 ÷ 4 = 1 余 3（<a class="xlink" href="../../../math/arithmetic/division-remainder/#step1">→ 除法与余数第 1 步：余数为什么必须比除数小</a>）。',
    den5: '分母：每条切成几份', num5: '分子：一共取几份',
    fill: '一份一份放',
    s5read: '{f}：{a} ÷ {b} = {q} 余 {r}，凑满 {strips}，还剩 {parts}，所以 {f} = {mixed}（读作「{say}」）。{kind}',
    s5readWhole: '{f}：{a} ÷ {b} = {q} 余 0，正好凑满 {strips}，所以 {f} = {q}。{kind}',
    s5prog: '已放 {k} / {a} 份：已凑满 {strips}，第 {next} 条上有 {parts}。',
    cPart1: '{n} 份', cPartN: '{n} 份', cPiece1: '{n} 小份', cPieceN: '{n} 小份', cHop1: '{n} 次', cHopN: '{n} 次', cStrip1: '{n} 条', cStripN: '{n} 条',
    k_proper: '这是真分数，比 1 小。', k_whole: '这是假分数，正好等于整数 {q}。', k_improper: '这是假分数，比 1 大。',
    s5hint: '观察顺序：分母保持 4，把分子从 1 拖到 12：每放满 4 份就多出一整条，数轴上的点依次越过 1、2、3。按「一份一份放」能看到放满一条才换下一条。剩下的份数总比分母小，否则还能再凑一整条。',

    s6k: '第 6 步 · 写成小数', s6t: '3/8 写成小数是多少？1/3 为什么写不完？',
    s6e: '这一步要回答：分数怎样变成小数，为什么有的写得完、有的写不完？分数也是除法：3/8 = 3 ÷ 8，把 3 平均分成 8 份。用竖式一位一位地除，每一位都做同一件事：把<strong>余数</strong>（还没分完的部分）乘 10，再除以 8，商写进小数的下一位，余数留给下一步。余数总比除数小，只可能是 0 到 7。圆圈上排着所有可能的余数，箭头记录余数怎样一步步变。余数变成 0，就除尽了，叫<strong>有限小数</strong>；某个余数第二次出现，后面每一步都会照原样重复，数字就一圈一圈循环下去，叫<strong>循环小数</strong>，写不完，只能写近似值并标「≈」。重复的那段数字叫<strong>循环节</strong>（<a class="xlink" href="../../../math/arithmetic/real-number-line/#step2">→ 实数页第 2 步：1/4 写得完、1/3 一直重复，√2 两样都不是</a>）。',
    den6: '分母（除数）', num6: '分子（被除数）',
    next: '再除一位', toEnd: '一直除到底', restart: '从头再除',
    s6start: '{a} ÷ {b} 不够 1，整数部分是 0，从余数 {a} 开始。按「再除一位」。',
    s6step: '第 {k} 位：余数 {r} × 10 = {r10}，{r10} ÷ {b} = {d} 余 {nr}。到这里写出 {sofar}',
    s6term: '余数变成 0，除尽了：{f} = {dec}，是有限小数。',
    s6rep: '余数 {r} 第二次出现，后面只会照抄：{f} = {dec}，是循环小数，循环节「{cyc}」，四舍五入到 4 位 ≈ {approx}。',
    remRing: '可能的余数', startLbl: '起点', doneLbl: '除尽',
    s6hint: '观察顺序：先看 3/8，连按「再除一位」，箭头走到 0 就停；再换成 1/3、1/6、1/7，看箭头绕回一个走过的余数，圈出循环。规律（先约成最简分数再看）：分母只有因数 2 和 5 时除得尽，含有别的因数（如 3、7、11）就会循环。本页分母 2–12 的每一个分数都按竖式逐个核对过这条规律。',

    s7k: '第 7 步 · 收束', s7t: '一句话记住分数',
    s7fin: '<strong>分数是一个数</strong>：把 1 平均切成 b 份、取 a 份，就是数轴上的 a/b。同一个点可以有很多写法（等值分数），约到最简最好认；比大小、做加法，都要先把份切成一样大（通分）；分子比分母大时，凑满的整条写在前面（带分数）；分数也是除法，写成小数时，分母（最简后）只含 2 和 5 才除得尽，否则循环。',
    formula: 'a/b = (a×m)/(b×m)　·　a/b + c/d 先通分　·　a/b = a ÷ b',
    boundary: '本页只讲分子、分母都是不超过几十的非负整数的分数；乘法、除法和负分数留给后面。纸带长度和数轴刻度是按比例画的，但屏幕像素有限，很细的小格只能示意，读数里的数才是精确的。',
    quizPrompt: '小测：下面哪一句是对的？',
    quizA: '1/3 + 1/4 = 2/7', quizB: '2/3 比 3/5 大', quizC: '1/6 写成小数能除尽',
    check: '看答案',
    correct: '对。通分到 15 小份：2/3 = 10/15，3/5 = 9/15。另外两句：1/3 + 1/4 = {sum}，不是 2/7；1/6 = {dec}，分母 6 里有因数 3，会循环。',
    wrong: '再想想：第一句里两个分母不一样，份数能直接相加吗？第三句的分母 6 里，有没有 2 和 5 以外的因数？',
    noPick: '先选一项。',
    linksTitle: '接着去哪儿',
    lk1: '→ 实数页第 1 步：√2 为什么写不成分数',
    lk2: '→ 除法与余数第 1 步：带分数里剩下的份，为什么总比分母少',
    lk3: '→ 负数页第 0 步：数轴往 0 的左边继续长',
    lk4: '→ 蒙特卡洛第 1 步：比例长大了就是概率',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分数 · 把整体切开来数》的平行版本。'
  },

  en: {
    pageTitle: 'Fractions · Cutting the Whole to Count',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Fractions · Cutting the Whole to Count (original) →',
    navLabel: 'Fractions lesson steps',
    tagline: 'On the table lies a strip of paper of length 1. Cut it into equal parts, take a few, and you have a fraction. This page works out how big a fraction is, where it sits on the number line, which of two fractions is bigger, how to add them, how to write one bigger than 1, and why some never end as decimals. All the arithmetic is exact, done with whole numbers; any decimal that cannot be written out in full is marked “≈”.',
    nav0: '0 Cut & take', nav1: '1 A point on the line', nav2: '2 Equivalent', nav3: '3 Which is bigger', nav4: '4 Adding', nav5: '5 More than 1', nav6: '6 As a decimal', nav7: '7 Wrap-up',

    s0k: 'STEP 0 · CUT AND TAKE', s0t: 'How much is “three quarters”, really?',
    s0e: 'This step answers: what amount does 3/4 stand for? Treat a strip of paper as <strong>the whole</strong> and call its length 1. Cut it into 4 <strong>equal</strong> parts (all the same length) and each part is 1/4; shade 3 of them and the shaded piece is <strong>3/4</strong>, “three quarters”. The number under the line is the <strong>denominator</strong>: how many equal parts the whole was cut into. The number above it is the <strong>numerator</strong>: how many of those parts you took.',
    den0: 'Denominator: equal parts', num0: 'Numerator: parts taken', uneven: 'Cut the parts unevenly on purpose',
    s0read: 'The strip is cut into {b} equal parts, each {unit}; take {a} of them and you have {f}, read “{say}”.',
    s0zero: 'Take none and nothing is shaded: {f} = 0.',
    s0whole: 'Take all {b} parts and you have the whole strip: {f} = 1.',
    s0uneven: 'This time the {b} parts have different lengths. Shade the first {a} and they actually cover {share} of the strip, {verdict}. Counting parts is not enough: a fraction needs every part to be the same size.',
    s0notEq: '<span class="bad">not {f}</span>', s0eq: 'which happens to equal {f} anyway',
    s0one: 'With just 1 part, that part is the whole strip, so there is nothing to cut unevenly.',
    took: '{a} taken', cutInto: '{b} equal parts', cutUneven: '{b} parts (uneven)',
    shaded: 'shaded', whole1: 'whole strip = 1',
    s0hint: 'What to try: start from the default 3/4. Then drag only the denominator and leave the numerator alone — more parts means shorter parts, so the same 3 parts shade less. Finally tick “Cut the parts unevenly”: the count of parts stays put, yet the share of the strip that is shaded changes. Each part is labelled with its size whenever the label fits.',

    s1k: 'STEP 1 · A FRACTION IS A NUMBER', s1t: 'Where does 3/4 land on the number line?',
    s1e: 'This step answers: is 3/4 just “3 parts out of 4”, or a number as real as 1 or 2? Lay the strip on a <strong>number line</strong>: a straight line marked with 0 and 1, where further right means bigger (<a class="xlink" href="../../../math/arithmetic/negative-numbers/#step0">→ Negative numbers, step 0: the line keeps going left of 0</a>). The strip’s left end sits on 0 and its right end on 1. Start at 0 and hop right one part at a time (each hop 1/4 long); after 3 hops you stand on 3/4. That is one definite spot between 0 and 1 — a fraction is a number.',
    hop: 'Hop from 0', pause: 'Pause', resume: 'Resume',
    s1prog: '{k} of {a} hops done, each {unit} long; you are now at {pos}.',
    s1done: '{hops} of {unit} each, landing on {f}: {aParts} from 0, still {restParts} ({restF}) short of 1.',
    s1zero: 'No hops at all, so you stay on 0: {f} = 0.',
    s1one: '{b} hops take you exactly to 1: {f} = 1.',
    bar1: 'strip (whole = 1)',
    s1hint: 'What to try: press “Hop from 0” and watch each hop leave its arc on the line while the matching part of the strip lights up; the readout counts the hops as they happen. Then fix the numerator at 1 and drag the denominator from 2 to 12: 1/2, 1/3 … 1/12 crowd towards 0, because each part keeps getting shorter. The hopping is just “adding one part at a time”, slowed down so you can see it; with reduced motion the result is drawn straight away.',

    s2k: 'STEP 2 · EQUIVALENT FRACTIONS', s2t: 'Are 1/2 and 2/4 the same number?',
    s2e: 'This step answers: can two fractions that look different be the same number? The top row is the fraction you start with. Each row below <strong>cuts every part again</strong> into smaller equal pieces: the denominator (how many parts) and the numerator (how many taken) are both multiplied by the same number, yet the shaded length does not change at all and the point on the number line stays put. Fractions that land on the same point are <strong>equivalent fractions</strong> — different names for one number. Going the other way, merging small pieces back into bigger ones divides top and bottom by the same number; that is <strong>simplifying</strong>. A number that divides both top and bottom exactly is a <strong>common factor</strong>, and when 1 is the only one left the fraction is in <strong>simplest form</strong>.',
    den2: 'Starting denominator', num2: 'Starting numerator', m2: 'Cut finer: pieces per part',
    s2read: '{chain}: top and bottom both multiplied by {m}, same shaded length, same point on the line.',
    s2simp: '{f} can be simplified: divide top and bottom by the common factor {g} to get {s} in simplest form.',
    s2simplest: '{f} is already in simplest form (top and bottom share no factor except 1).',
    s2hint: 'What to try: keep 1/2 and drag “Cut finer” from 1 to 5. Finer and finer strips appear, yet the right edge of the orange always lines up on the same dashed line and the point on the number line never moves. Then change the starting fraction to 2/4 or 4/6 and let the readout tell you what it simplifies to. This slider only changes how the strip is cut, never how much is shaded.',

    s3k: 'STEP 3 · WHICH IS BIGGER', s3t: '2/3 or 3/5 — which is bigger, and by how much?',
    s3e: 'This step answers: how do you compare two fractions whose parts are different sizes? In 2/3 each part is 1/3; in 3/5 each part is 1/5. Comparing “2 parts” with “3 parts” is meaningless when the parts differ. The fix is a <strong>common denominator</strong>: cut both strips into pieces of one shared size, then count. The number of pieces has to be a multiple of both denominators — a <strong>common multiple</strong> — and the smallest one is the <strong>least common multiple</strong>. For 3 and 5 it is 15: 2/3 = 10/15 and 3/5 = 9/15. Ten pieces beat nine, so 2/3 is bigger, by 1/15.',
    fA: 'Orange fraction', fB: 'Teal fraction', numA: 'Orange numerator', denA: 'Orange denominator', numB: 'Teal numerator', denB: 'Teal denominator',
    common: 'Common denominator: same-size pieces', uncommon: 'Undo the common cut',
    s3before: 'Orange {f1} has parts of {u1}; teal {f2} has parts of {u2}. The parts differ in size, so you cannot just count them yet. Press “Common denominator”.',
    s3beforeSame: 'Both denominators match, so the parts are already the same size: just count. {cmp}',
    s3after: 'Both cut into {L} pieces ({L} is the least common multiple of {b1} and {b2}): {f1} = {g1} and {f2} = {g2}. {cmp}',
    s3gt: 'Orange has {p1} and teal has {p2}, so {f1} > {f2}, by {diff}.',
    s3lt: 'Orange has {p1} and teal has {p2}, so {f1} < {f2}, by {diff}.',
    s3eq: 'Orange has {p1} and teal has {p2} — the same — so {f1} = {f2}: they are equivalent.',
    eachPart: 'parts of {u}', nowIs: 'now {g}',
    s3hint: 'What to try: before pressing anything, look at the two strips — the parts differ in size and are hard to count. Press “Common denominator”: thin lines cut both strips into pieces of one size, so you can count the orange and teal pieces directly. Then set teal to 4/6 and watch the two shaded edges line up exactly. The two points on the number line are fixed by the fractions themselves; the common cut changes how you count, not where they sit.',

    s4k: 'STEP 4 · ADDING', s4t: 'What is 1/2 + 1/3? Why isn’t it 2/5?',
    s4e: 'This step answers: when you add two fractions, what exactly are you adding? Addition puts two lengths end to end: walk 1/2 from 0 (orange), then another 1/3 (teal); where you stop is the sum. A classic slip is to add tops and add bottoms: (1+1)/(2+3) = 2/5. But look at the line — 2/5 is shorter than 1/2 on its own, so how could it be “1/2 plus a bit more”? The trouble is that halves and thirds are different-sized parts, and you cannot just add their counts. Find a <strong>common denominator</strong> first (same-size pieces; the least common multiple of 2 and 3 is 6): 1/2 = 3/6 and 1/3 = 2/6, so 3 pieces plus 2 pieces make 5 pieces, and the sum is 5/6.',
    showGrid: 'Show the common-denominator pieces', showWrong: 'Show where “tops plus tops, bottoms plus bottoms” lands',
    s4read: '{f1} + {f2}: over {L} pieces, {g1} + {g2} = {raw}{simp}{mixed}.',
    s4simp: ' = {s} (simplified)', s4mixed: ', which is more than 1: {m}',
    s4wrong: 'The slip gives {w}: it lands between {lo} and {hi}, short of the true sum by {gap}.',
    s4wrongEq: 'The slip gives {w}: exactly the addend {f1} itself, as if nothing had been added — short of the true sum by {gap}.',
    sumLbl: 'sum', wrongLbl: 'slip',
    s4hint: 'What to try: the orange segment is the first fraction, the teal one is laid right after it, and the green dot is the sum. Change both denominators however you like and watch the pink “slip” point: it always sits between the two fractions and never reaches the green dot (true whenever both fractions are bigger than 0). Switch on the common-denominator pieces and count how many each segment covers.',

    s5k: 'STEP 5 · MORE THAN 1', s5t: '7/4 is longer than a whole strip — how do you draw it and say it?',
    s5e: 'This step answers: what does a fraction with a bigger top than bottom look like? 7/4 still means parts of 1/4, seven of them. But a whole strip only holds 4 parts, so after filling one strip there are 3 left over and you need a second strip. A fraction whose numerator is smaller than its denominator is less than 1 and is called a <strong>proper fraction</strong>; one whose numerator is equal or bigger is 1 or more and is an <strong>improper fraction</strong>. Pull the full strips out front and you get a <strong>mixed number</strong>: 7/4 = 1¾, “one and three quarters”. How many full strips and how many parts left over is exactly a division with remainder: 7 ÷ 4 = 1 remainder 3 (<a class="xlink" href="../../../math/arithmetic/division-remainder/#step1">→ Division and remainders, step 1: why the remainder must be smaller than the divisor</a>).',
    den5: 'Denominator: parts per strip', num5: 'Numerator: parts in total',
    fill: 'Place one part at a time',
    s5read: '{f}: {a} ÷ {b} = {q} remainder {r}, so {strips} with {parts} left over: {f} = {mixed} (“{say}”). {kind}',
    s5readWhole: '{f}: {a} ÷ {b} = {q} remainder 0, exactly {strips}: {f} = {q}. {kind}',
    s5prog: '{k} of {a} parts placed: {strips} so far, {parts} on strip {next}.',
    cPart1: '{n} part', cPartN: '{n} parts', cPiece1: '{n} piece', cPieceN: '{n} pieces', cHop1: '{n} hop', cHopN: '{n} hops', cStrip1: '{n} full strip', cStripN: '{n} full strips',
    k_proper: 'This is a proper fraction, less than 1.', k_whole: 'This is an improper fraction equal to the whole number {q}.', k_improper: 'This is an improper fraction, more than 1.',
    s5hint: 'What to try: keep the denominator at 4 and drag the numerator from 1 to 12. Every 4 parts complete another strip, and the point on the number line steps past 1, 2 and 3. Press “Place one part at a time” to see one strip fill before the next begins. The parts left over are always fewer than the denominator — otherwise they would make another full strip.',

    s6k: 'STEP 6 · AS A DECIMAL', s6t: 'What is 3/8 as a decimal? Why does 1/3 never end?',
    s6e: 'This step answers: how does a fraction become a decimal, and why do some stop while others go on forever? A fraction is also a division: 3/8 = 3 ÷ 8, sharing 3 equally into 8. Long division produces one digit at a time, and every digit comes from the same move: take the <strong>remainder</strong> (the part not yet shared out), multiply it by 10, divide by 8; the quotient is the next decimal digit and the new remainder carries on. A remainder is always smaller than the divisor, so here it can only be 0 to 7. The circle lists every possible remainder and the arrows record how the remainder changes step by step. Reach 0 and the division is finished: a <strong>terminating decimal</strong>. Meet a remainder for the second time and every later step repeats exactly, so the digits cycle forever: a <strong>repeating decimal</strong>, which can only be written approximately, with “≈”. The block of digits that repeats is the <strong>repetend</strong> (<a class="xlink" href="../../../math/arithmetic/real-number-line/#step2">→ Real numbers, step 2: 1/4 stops, 1/3 repeats, √2 does neither</a>).',
    den6: 'Denominator (divisor)', num6: 'Numerator (dividend)',
    next: 'Divide one more digit', toEnd: 'Divide to the end', restart: 'Start the division again',
    s6start: '{a} ÷ {b} is less than 1, so the whole-number part is 0 and we start with remainder {a}. Press “Divide one more digit”.',
    s6step: 'Digit {k}: remainder {r} × 10 = {r10}, and {r10} ÷ {b} = {d} remainder {nr}. So far: {sofar}',
    s6term: 'The remainder hit 0, so the division is finished: {f} = {dec}, a terminating decimal.',
    s6rep: 'Remainder {r} has come round again, so everything after this repeats: {f} = {dec}, a repeating decimal with repetend “{cyc}”; rounded to 4 places ≈ {approx}.',
    remRing: 'possible remainders', startLbl: 'start', doneLbl: 'done',
    s6hint: 'What to try: start with 3/8 and keep pressing “Divide one more digit” — the arrows stop when they reach 0. Then switch to 1/3, 1/6 and 1/7 and watch the arrows swing back to a remainder they have already visited, closing a loop. The rule (after simplifying first): if the denominator has no prime factors other than 2 and 5 the division ends; any other factor (3, 7, 11 …) makes it repeat. Every fraction with denominator 2–12 on this page has been checked against long division.',

    s7k: 'STEP 7 · WRAP-UP', s7t: 'Fractions in one breath',
    s7fin: '<strong>A fraction is a number</strong>: cut 1 into b equal parts, take a of them, and you have the point a/b on the number line. One point has many names (equivalent fractions), and the simplest is easiest to read. To compare or add, first make the parts the same size (common denominator). When the top outgrows the bottom, pull the full wholes out front (mixed number). And a fraction is a division: as a decimal it ends only if its simplified denominator is made of 2s and 5s; otherwise it repeats.',
    formula: 'a/b = (a×m)/(b×m)  ·  a/b + c/d: common denominator first  ·  a/b = a ÷ b',
    boundary: 'This page sticks to fractions whose tops and bottoms are whole numbers up to a few dozen, none negative; multiplying, dividing and negative fractions come later. Strips and number lines are drawn to scale, but screens have only so many pixels — the finest pieces are a sketch, and the numbers in the readouts are the exact ones.',
    quizPrompt: 'Quick check: which statement is true?',
    quizA: '1/3 + 1/4 = 2/7', quizB: '2/3 is bigger than 3/5', quizC: '1/6 is a terminating decimal',
    check: 'Check',
    correct: 'Right. Over 15 pieces, 2/3 = 10/15 and 3/5 = 9/15. As for the others: 1/3 + 1/4 = {sum}, not 2/7; and 1/6 = {dec} repeats, because 6 has the factor 3.',
    wrong: 'Think again: in the first one the denominators differ — can you just add the counts of parts? In the third, does 6 have any factor other than 2 and 5?',
    noPick: 'Pick one first.',
    linksTitle: 'Where next',
    lk1: '→ Real numbers, step 1: why √2 cannot be written as a fraction',
    lk2: '→ Division and remainders, step 1: why the leftover parts in a mixed number are fewer than the denominator',
    lk3: '→ Negative numbers, step 0: the number line keeps going left of 0',
    lk4: '→ Monte Carlo, step 1: ratios grow up into probability',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Fractions · Cutting the Whole to Count”.'
  }
};

// How a fraction is read aloud. zh: 四分之三; en: three quarters.
const ZH_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const EN_ORD = { 1: ['whole', 'wholes'], 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'], 8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'], 11: ['eleventh', 'elevenths'], 12: ['twelfth', 'twelfths'] };
function sayFraction(l, a, b) {
  if (l === 'zh') return (b === 2 && a === 1 ? '二分之一' : ZH_NUM[b] + '分之' + ZH_NUM[a]);
  return EN_NUM[a] + ' ' + EN_ORD[b][a === 1 ? 0 : 1];
}
function sayMixed(l, q, r, b) {
  if (l === 'zh') return ZH_NUM[q] + '又' + sayFraction(l, r, b);
  return EN_NUM[q] + ' and ' + (r === 1 && b === 2 ? 'a half' : sayFraction(l, r, b));
}

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = localStorage.getItem('knowledge-lang') || ((typeof navigator !== 'undefined' && (navigator.language || '').startsWith('zh')) ? 'zh' : 'en'); } catch (_) {
  lang = (typeof navigator !== 'undefined' && (navigator.language || '').startsWith('zh')) ? 'zh' : 'en';
}
if (lang !== 'zh' && lang !== 'en') lang = 'zh';
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
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', String(on)); });
  if (typeof window.refreshFractions === 'function') window.refreshFractions();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS, sayFraction, sayMixed };
if (typeof window !== 'undefined') window.FRAC_I18N = { t, setLang, getLang: () => lang, say: (a, b) => sayFraction(lang, a, b), sayMixed: (q, r, b) => sayMixed(lang, q, r, b) };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
