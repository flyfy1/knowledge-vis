'use strict';
// RSA lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'RSA 公钥加密 · 一把人人能锁、只有你能开的锁',
    back: '← 知识索引',
    compare: '对照另一版本：RSA 公钥加密 · 乘起来容易，拆开来难 →',
    navLabel: 'RSA 步骤导航',
    tagline: '你想让任何陌生人都能给你发一个只有你读得懂的数，可你们从没见过面、没商量过任何暗号。RSA 的办法是：把一把「锁」公开发出去，开锁的钥匙留在自己手里。本页用能算到底的小数字，亲手造一对钥匙、加密、解密，再站到窃听者那一边，看这把锁为什么撬不开。',
    nav0: '0 乘与拆', nav1: '1 钟表上的幂', nav2: '2 造钥匙', nav3: '3 加密解密', nav4: '4 快速幂', nav5: '5 窃听者', nav6: '6 收束',

    s0k: '第 0 步 · 锁靠什么',
    s0t: '两个质数乘起来只要一下，从乘积拆回去要多久？',
    s0e: '这一步要回答：有没有一种运算，正着算很快、反着算极慢？候选就是乘法。<strong>质数</strong>是只能被 1 和它自己整除的数（如 2、3、5、7、11）。把两个质数 p、q 乘成 n 很快；反过来只给 n、要找回 p 和 q，最朴素的办法是<strong>试除</strong>：用 2、3、5、7、9……逐个去除 n，直到除尽为止。下面的数据是浏览器<strong>当场实测</strong>的：对每个位数 b，取 2^(b/2) 以下最大的两个质数相乘（两个质数一样大，是试除最费力的情形），再数一数试除法除了多少次。纵轴是对数刻度，每上一格次数乘 10（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ 指数与对数第 2 步：对数问的是「乘了几次 10」</a>）。乘法这边的代价按手算竖式数：p 有几位、q 有几位，就要做「位数 × 位数」次一位数乘法。',
    bitsSlider: 'n 的位数 b（二进制）',
    sweep0: '从 8 位到 40 位全部测一遍', slow0: '慢放这一次试除',
    s0lgDiv: '试除次数（实测）', s0lgMul: '竖式乘法：一位数乘法次数', s0lgScan: '已试过的除数', s0lgRoot: '√n 的位置',
    c0a: '代价（对数刻度）随 n 的位数增长', c0b: '试除的进度：从 2 往上试，直到除尽',
    s0readout: '{prog}b = {b}：p = {p}，q = {q}，n = p × q = {n}（{nb} 位二进制）。乘起来：{dm} 次一位数乘法。拆开来：试除了 {div} 次才在 {f} 处除尽（√n ≈ {root}）。',
    s0prog: '已测 {c}/{N} 种位数 · ',
    s0run: '慢放中：已试 {c} 个除数，还没除尽……',
    s0trend: '位数每加 2，试除次数约乘 {r}；乘法次数只从 {m0} 涨到 {m1}。',
    s0hint: '观察顺序：先拖「n 的位数」，看上图橙点（试除次数）每右移一格就差不多翻一倍、在对数刻度上排成一条斜直线，而青点（乘法次数）几乎贴着底。再按「慢放这一次试除」，看下图的橙条从 2 一路试到 √n 附近才碰到 q——两个质数一样大时，q 就藏在 √n 旁边，前面每个数都得试。',

    s1k: '第 1 步 · 钟表算术',
    s1t: '在一个只有 n 格的钟面上反复乘同一个数，会走到哪里？',
    s1e: '这一步要回答：RSA 做的所有乘法都在「钟面」上进行，乘出来的数会怎样绕圈？<strong>a mod n</strong> 是 a 除以 n 的余数，结果总在 0 到 n − 1 之间，就像钟面只有 n 格，走过头就绕回去（<a class="xlink" href="../../../math/arithmetic/division-remainder/#step3">→ 除法与余数第 3 步：100 天后星期几，用的就是这种绕圈</a>）。从 1 出发，每次乘 a 再取余：1 → a → a² → a³ … mod n。只有有限个格子，所以迟早会走回走过的格子、开始循环。两个数<strong>互质</strong>是指它们除了 1 没有公共因数（最大公因数 gcd = 1，<a class="xlink" href="../../../math/arithmetic/number-combinatorics/#step1">→ 数与组合第 1 步：用「不断取余」求最大公因数</a>）。在 1 到 n 中与 n 互质的数的个数记作 <strong>φ(n)</strong>（欧拉函数），钟面上画成实心点。<strong>欧拉定理</strong>：只要 a 与 n 互质，a^φ(n) mod n 一定等于 1——乘满 φ(n) 次必回原点。',
    nSlider: '钟面格数 n', aSlider: '每次乘的数 a',
    walk1: '一次乘一个 a，慢慢走', s1lgCo: '与 n 互质（共 φ(n) 个）', s1lgNot: '与 n 有公因数', s1lgPath: '橙色路线：1 → a → a² → …', s1lgPhi: '竖虚线：第 φ(n) 次', s1lgOne: '绿点：值为 1',
    c1a: '钟面：0 到 n − 1', c1b: 'aᵏ mod n（横轴：乘了几次 k）',
    s1co: 'a = {a}，n = {n}，互质。{prog}从 1 起依次为 {seq}；第 {ret} 次回到 1（循环长度 {ret}）。φ({n}) = {phi}，{a}^{phi} mod {n} = {pw}；循环长度 {ret} 能整除 {phi}。',
    s1not: 'a = {a}，n = {n}，二者有公因数 {g}。{prog}从 1 起依次为 {seq}；之后在长度 {len} 的圈里打转，再也回不到 1。φ({n}) = {phi}，{a}^{phi} mod {n} = {pw} ≠ 1，欧拉定理的条件不满足。',
    s1prog: '（已走 {c}/{N} 步）',
    s1hint: '观察顺序：先保持 n = 14，把 a 从 2 拖到 13。a 是实心点（与 14 互质）时，橙色路线总会回到 1，而且「aᵏ mod n」图在第 φ(14) = 6 次（竖虚线）时值一定是 1；a 是空心点（如 2、4、7）时，路线绕进一个不含 1 的小圈。再换几个 n 试试：循环长度不一定等于 φ(n)，但总能整除它，所以第 φ(n) 次一定落在 1 上。',

    s2k: '第 2 步 · 造一对钥匙',
    s2t: '用两个质数造锁：公钥 e 已定，哪个 d 能把它抵消？',
    s2e: '这一步要回答：怎样从 p、q 造出一把公开的锁 (n, e) 和一把私藏的钥匙 d？取 n = p × q。由于 p、q 是质数，与 n 互质的数有 <strong>φ(n) = (p − 1)(q − 1)</strong> 个（φ 是上一步的欧拉函数：1 到 n 中与 n 互质的数的个数）。选一个与 φ(n) 互质的 e 当<strong>公钥</strong>，然后找<strong>私钥</strong> d，使 <strong>e × d mod φ(n) = 1</strong>，也就是 e·d = k·φ(n) + 1。为什么要这样？上一步说 m^φ(n) mod n = 1，所以 m^(e·d) = m^(k·φ(n)+1) = (m^φ(n))^k · m，mod n 后正好回到 m。图里每个点是一个候选 d：横轴是 d，纵轴是 e·d mod φ(n)；这些点排成一道道斜线，只有一个点落在高度 1 上，那就是私钥。电脑并不逐个试 d，而是用<strong>扩展欧几里得算法</strong>（在求最大公因数的辗转相除中顺手记下系数）一次求出，过程见下表。',
    pSlider: '质数 p', qSlider: '质数 q', eSlider: '公钥指数 e（与 φ 互质的候选）',
    s2lgPts: '候选 d 的 e·d mod φ', s2lgD: '落在 1 上的 d（私钥）',
    c2a: 'e × d mod φ(n)，横轴为候选 d',
    s2readout: 'n = {p} × {q} = {n}，φ(n) = {pm} × {qm} = {phi}。公钥 (n, e) = ({n}, {e})，私钥 d = {d}。验算：{e} × {d} = {ed} = {k} × {phi} + 1。',
    euTitle: '扩展欧几里得：每行都满足 余数 = s × φ + t × e',
    euR: '余数', euQ: '商', euS: 's', euT: 't',
    euNote: '最后一个非零余数是 1，说明 e 与 φ 互质；那一行的 t = {t}，加上 φ 的整数倍变成 0 到 φ 之间的数，就是 d = {d}。',
    s2hint: '观察顺序：先保持 p、q 不动，拖 e：斜线的倾斜程度跟着 e 变，但每次都恰好有一个点落在高度 1 上（绿色），它的横坐标就是 d。再换 p 或 q：φ(n) 变了，整张图和 d 都要重算。所有数都由当前的 p、q、e 计算；第 3、4、5 步都用这把钥匙。',

    s3k: '第 3 步 · 加密与解密',
    s3t: '锁上再打开，每一个数都能原样回来吗？',
    s3e: '这一步要回答：用上一步的钥匙，把一个数 m 锁起来再打开，结果真的还是 m 吗？要发送的数叫<strong>明文</strong> m（0 ≤ m &lt; n）。任何人都可以用公钥加密：<strong>c = m^e mod n</strong>，c 叫<strong>密文</strong>；只有拿着私钥 d 的人能解密：<strong>m′ = c^d mod n</strong>。上图把每个明文 m 和它的密文 c 画成一个点：点子散得像乱码，看密文猜不出明文。下图是解密的结果 m′ 对 m：按「逐个验证」后，每个验证过的点都落在对角线 m′ = m 上。上一步的推导用到了「m 与 n 互质」；这里连不互质的 m（p 或 q 的倍数）也一并验证。',
    mSlider: '明文 m', check3: '逐个验证全部 n 个明文',
    s3lgAll: '所有 (m, c)', s3lgNow: '当前的 m', s3lgOk: '验证过：解密回到原处',
    c3a: '加密：密文 c = mᵉ mod n', c3b: '解密：m′ = cᵈ mod n 对 m',
    s3readout: '{prog}m = {m} → 加密 c = {m}^{e} mod {n} = {c} → 解密 {c}^{d} mod {n} = {back}。{same}',
    s3same: '回到原处。',
    s3prog: '已验证 {c}/{N} 个明文 · ',
    s3all: '全部 {N} 个明文都解密回原值。其中有 {F} 个加密后完全不变（如 0、1、n − 1）：教科书 RSA 不加处理直接用就会露馅，现实中要先做随机填充。',
    s3hint: '观察顺序：拖「明文 m」，看上图橙点的高度（密文）忽上忽下，相邻的 m 得到毫不相干的 c；再按「逐个验证」，看下图的绿点一个个落上对角线，进度走到 n/n。换第 2 步的 e 或 p、q 会清空验证记录。',

    s4k: '第 4 步 · 快速幂',
    s4t: '真实的 d 有六百多位十进制数，乘 d 次根本做不完，主人怎么解密？',
    s4e: '这一步要回答：合法使用者算 c^d mod n 要多少步？逐次相乘要做 d − 1 次乘法；真实的 d 约有 2048 个二进制位，这个次数比宇宙中的原子还多。<strong>快速幂</strong>（平方-乘法）把 d 写成二进制，从最高位往下读：每读一位，先把当前值<strong>平方</strong>（指数翻倍）；这一位是 1 就<strong>再乘一次底数</strong>（指数加 1）。每一步都先取余，数字永远不超过 n²。这样乘法次数 ≤ 2 ×（二进制位数 − 1）。下表是用当前钥匙真算的一遍；图里比较两种做法的乘法次数，纵轴是对数刻度（每上一格乘 10）。',
    useE: '加密：算 mᵉ', useD: '解密：算 cᵈ', run4: '逐行计算',
    s4lgNaive: '逐次相乘：E − 1 次', s4lgFast: '快速幂：最多 2(L − 1) 次', s4lgNow: '当前指数（L 位）',
    c4a: '乘法次数（对数刻度），横轴为指数的二进制位数 L',
    lad0: '步', lad1: '位', lad2: '操作', lad3: '指数', lad4: '值 mod n',
    opStart: '起点（底数）', opSq: '平方', opMul: '再乘底数',
    s4readout: '{prog}{base}^{E} mod {n}：指数 {E} 的二进制是 {bits}（{L} 位）。快速幂用了 {sq} 次平方 + {mu} 次乘法 = {fast} 次，结果 {v}；逐次相乘要 {naive} 次。2048 位的指数：快速幂最多约 {f2048} 次，逐次相乘约 10^{n2048} 次。',
    s4prog: '已算 {c}/{N} 行 · ',
    s4hint: '观察顺序：先选「解密：算 cᵈ」，按「逐行计算」，看表里的指数怎样按二进制位一路翻倍、加 1，最后正好等于 d；再看图：蓝线（逐次相乘）在对数刻度上直线上升，橙线（快速幂）几乎贴着底。切到「加密：算 mᵉ」：e 很小，两种做法差别不大，所以公钥常选 3 或 65537 这类小数。',

    s5k: '第 5 步 · 站到窃听者那边',
    s5t: '窃听者拿到了 n、e 和密文 c，要多少力气才能读出 m？',
    s5e: '这一步要回答：锁是公开的，撬锁到底难在哪？窃听者知道公钥 (n, e) 和截获的密文 c。只要知道 d 就能解密，而求 d 需要 φ(n) = (p − 1)(q − 1)，也就需要把 n 拆成 p × q（φ 是与 n 互质的数的个数）。上图是窃听者对当前小钥匙真跑一遍试除。现实中的 n 有 2048 位，没法实测，下图只能用公式估<strong>量级</strong>：试除约要 √n / 2 次；已知最快的通用分解方法<strong>数域筛</strong>（GNFS）约要 exp(1.923 · (ln n)^(1/3) · (ln ln n)^(2/3)) 次；合法解密用快速幂，约 1.5·L 次乘法、每次乘法约 L² 次位运算。灰色横线是「每秒 10^18 次运算的超级计算机算一整年」。',
    attack5: '让窃听者试除当前的 n', lSlider: '密钥位数 L（n 的二进制位数）',
    s5lgTried: '已试过的除数', s5lgHit: '除尽：找到 p', s5lgLegit: '合法解密（快速幂）', s5lgGnfs: '数域筛分解（估算）', s5lgTrial: '试除分解（估算）', s5lgYear: '10^18 次/秒 × 1 年',
    c5a: '窃听者对 n = {n} 试除（横轴为除数）', c5b: '运算次数的量级（对数刻度），横轴为密钥位数 L',
    s5idle: '窃听者已知 n = {n}、e = {e}，截获密文 c = {c}。按上面的按钮让她开始试除。',
    s5run: '已试 {c} 个除数……',
    s5done: '试了 {tries} 个除数，在 {p} 处除尽：n = {p} × {q}。于是 φ = {phi}，用扩展欧几里得得 d = {d}，解密 {c}^{d} mod {n} = {m}。小钥匙一瞬间就被撬开。',
    s5scale: 'L = {L} 位：合法解密约 10^{lg} 次位运算；数域筛约 10^{gn} 次，按每秒 10^18 次要{yrs}；试除约 10^{tr} 次。',
    yrsSmall: '不到 1 秒', yrsSec: '约 10^{x} 秒', yrsYear: '约 10^{x} 年',
    s5hint: '观察顺序：先按「让窃听者试除」，看上图灰点一个个试过去，碰到橙点（p）就停，读数给出她算出的 d 和明文。再拖「密钥位数 L」：青线（合法解密）几乎是平的，橙线（数域筛）在 L 约 1000 位附近越过灰色「一年」线，之后一路远离；试除的红线很快冲出图顶。这些曲线都只是量级估算，常数和低阶项都没算。',
    quizPrompt: '想一想：窃听者手里已有 n、e 和密文 c。她要解密，真正缺的是哪一样？',
    quizA: 'e 的值——公钥里少了它就没法算',
    quizB: 'φ(n)，等价于知道 n 的两个质因数 p、q',
    quizC: '一台更快的计算机，好把 c 开 e 次方',
    check: '核对', correct: '对。e 和 n 都是公开的；有了 φ(n)，扩展欧几里得一步就能算出 d。而求 φ(n) 和分解 n 一样难，这正是锁的强度所在。', wrong: '再想想：e 本来就公开在公钥里，「开 e 次方」在钟面算术里也没有捷径。窃听者缺的是能求出 d 的 φ(n)，也就是 p 和 q。',

    s6k: '第 6 步 · 收束', s6t: '一把锁的三个零件',
    s6fin: '回头串一遍。<strong>第 0 步</strong>：乘两个质数很快，拆回去的试除次数随位数指数增长。<strong>第 1 步</strong>：钟面上反复乘 a，只要 a 与 n 互质，乘满 φ(n) 次必回到 1。<strong>第 2 步</strong>：取 e·d = k·φ(n) + 1，则 m 的 e·d 次方回到 m；d 由扩展欧几里得求出。<strong>第 3 步</strong>：c = m^e mod n 锁上、c^d mod n 打开，全部明文都原样回来。<strong>第 4 步</strong>：快速幂让合法的加密解密只需约 2 × 位数次乘法。<strong>第 5 步</strong>：窃听者要 d 就得有 φ(n)，也就得分解 n，而 2048 位的 n 远超现有算力。',
    formula: 'n = p·q，φ(n) = (p−1)(q−1)\ne·d mod φ(n) = 1\nc = mᵉ mod n，m = cᵈ mod n',
    boundary: '适用范围：本页是「教科书 RSA」——质数很小、没有随机填充、不做签名。小质数只为能算到底，任何人都能当场拆开；真实密钥用 1024 位以上的随机质数，并且必须先填充（第 3 步看到有的明文加密后不变，这就是不填充的漏洞之一）。第 0 步的次数是浏览器实测；第 5 步对 2048 位的估算只看量级，公式忽略了常数和低阶项（作为对照：2020 年公开分解的 829 位挑战数 RSA-250 用了约 2700 个 CPU 核年）。没有模拟量子计算机：Shor 算法能在多项式时间内分解，足够大的量子计算机会让 RSA 失效。实际系统中，RSA 多用来交换一把对称密钥或做数字签名，大量数据由对称加密处理。',
    linksTitle: '接着去哪儿',
    lk1: '→ 除法与余数第 3 步：「星期几」就是 mod 7 的钟表算术',
    lk2: '→ 数与组合第 1 步：辗转相除求最大公因数，扩展欧几里得的前身',
    lk3: '→ 哈希第 4 步：指纹要多少位才撞不上，同样是用位数换安全',
    lk4: '→ 指数与对数第 2 步：为什么「每加几位就翻倍」要用对数刻度看',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《RSA 公钥加密 · 乘起来容易，拆开来难》的平行版本。'
  },
  en: {
    pageTitle: 'RSA Encryption · A Lock Anyone Can Close, Only You Can Open',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: RSA Public-Key Encryption · Easy to Multiply, Hard to Split →',
    navLabel: 'RSA steps',
    tagline: 'You want any stranger to be able to send you a number only you can read, yet you have never met and never agreed on a secret. RSA’s answer: publish a “lock” for everyone and keep the only key. With numbers small enough to compute by hand, you will build a key pair, encrypt, decrypt, and then switch sides to see why the eavesdropper cannot pick the lock.',
    nav0: '0 Multiply vs split', nav1: '1 Powers on a clock', nav2: '2 Make keys', nav3: '3 Lock & unlock', nav4: '4 Fast powers', nav5: '5 Eavesdropper', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What the lock rests on',
    s0t: 'Multiplying two primes takes a moment. How long does splitting the product take?',
    s0e: 'This step asks: is there an operation that is fast forwards and painfully slow backwards? Multiplication is the candidate. A <strong>prime</strong> is a number divisible only by 1 and itself (2, 3, 5, 7, 11, …). Multiplying primes p and q into n is quick. Given only n, the plainest way back to p and q is <strong>trial division</strong>: divide n by 2, 3, 5, 7, 9, … until one goes in evenly. The data below is <strong>measured live</strong> in your browser: for each bit size b we multiply the two largest primes below 2^(b/2) (equal-sized primes are the hardest case for trial division) and count how many divisions it takes to split the product. The vertical axis is logarithmic: each gridline up is ten times more (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ Exponents & logs, step 2: a logarithm asks “how many tens”</a>). For multiplication we count the schoolbook method: a d₁-digit number times a d₂-digit number takes d₁ × d₂ single-digit products.',
    bitsSlider: 'Size of n, b (binary digits)',
    sweep0: 'Measure every size from 8 to 40 bits', slow0: 'Replay this trial division slowly',
    s0lgDiv: 'trial divisions (measured)', s0lgMul: 'schoolbook: single-digit products', s0lgScan: 'divisors tried', s0lgRoot: 'where √n is',
    c0a: 'Cost (log scale) as n gets more bits', c0b: 'Trial division: try upward from 2 until one divides',
    s0readout: '{prog}b = {b}: p = {p}, q = {q}, n = p × q = {n} ({nb} bits). Multiplying: {dm} single-digit products. Splitting: {div} trial divisions before {f} divides evenly (√n ≈ {root}).',
    s0prog: '{c}/{N} sizes measured · ',
    s0run: 'Replaying: {c} divisors tried, none divides yet…',
    s0trend: 'Each extra 2 bits multiplies the divisions by about {r}; the multiplication count only grows from {m0} to {m1}.',
    s0hint: 'What to try: drag the size of n and watch the orange dots (trial divisions) roughly double with every step right, lining up as a straight slope on the log scale, while the cyan dots (multiplications) hug the floor. Then press “Replay this trial division slowly”: in the lower chart the orange bar creeps up from 2 and only meets q near √n. With equal-sized primes, q sits right next to √n, so every candidate before it has to be tried.',

    s1k: 'Step 1 · Clock arithmetic',
    s1t: 'On a clock with only n marks, where does multiplying by the same number again and again lead?',
    s1e: 'This step asks: every multiplication in RSA happens on a “clock”. How do the products travel round it? <strong>a mod n</strong> is the remainder when a is divided by n; it always lies between 0 and n − 1, like a clock face with n marks where going past the top wraps round (<a class="xlink" href="../../../math/arithmetic/division-remainder/#step3">→ Division & remainders, step 3: finding the weekday 100 days out uses the same wrap-around</a>). Start at 1 and keep multiplying by a, taking the remainder each time: 1 → a → a² → a³ … mod n. There are only finitely many marks, so sooner or later you land on a mark you have visited and start looping. Two numbers are <strong>coprime</strong> when they share no factor except 1 (their greatest common divisor is 1, <a class="xlink" href="../../../math/arithmetic/number-combinatorics/#step1">→ Numbers & counting, step 1: the gcd by repeated remainders</a>). The number of values from 1 to n that are coprime to n is written <strong>φ(n)</strong> (Euler’s totient); they are the filled dots on the clock. <strong>Euler’s theorem</strong>: whenever a is coprime to n, a^φ(n) mod n is exactly 1 — after φ(n) multiplications you are back at the start.',
    nSlider: 'Marks on the clock, n', aSlider: 'Multiplier a',
    walk1: 'Walk it one multiplication at a time', s1lgCo: 'coprime to n (φ(n) of them)', s1lgNot: 'shares a factor with n', s1lgPath: 'orange route: 1 → a → a² → …', s1lgPhi: 'dashed line: k = φ(n)', s1lgOne: 'green: value is 1',
    c1a: 'Clock face: 0 to n − 1', c1b: 'aᵏ mod n (across: number of multiplications k)',
    s1co: 'a = {a}, n = {n}, coprime. {prog}Starting from 1: {seq}; back at 1 after {ret} multiplications (loop length {ret}). φ({n}) = {phi} and {a}^{phi} mod {n} = {pw}; the loop length {ret} divides {phi}.',
    s1not: 'a = {a}, n = {n}, sharing the factor {g}. {prog}Starting from 1: {seq}; after that it circles a loop of length {len} that never contains 1. φ({n}) = {phi} and {a}^{phi} mod {n} = {pw} ≠ 1: Euler’s condition fails.',
    s1prog: '({c}/{N} moves so far) ',
    s1hint: 'What to try: keep n = 14 and drag a from 2 to 13. When a is a filled dot (coprime to 14), the orange route always returns to 1, and in the aᵏ mod n chart the value at k = φ(14) = 6 (dashed line) is always 1. When a is hollow (2, 4, 7, …), the route falls into a small loop without 1. Then try other n: the loop length is not always φ(n), but it always divides φ(n), which is why the φ(n)-th power lands on 1.',

    s2k: 'Step 2 · Making a key pair',
    s2t: 'Build a lock from two primes: with e fixed, which d undoes it?',
    s2e: 'This step asks: how do p and q become a public lock (n, e) and a private key d? Set n = p × q. Because p and q are prime, exactly <strong>φ(n) = (p − 1)(q − 1)</strong> numbers are coprime to n (φ is step 1’s totient: how many of 1…n share no factor with n). Pick a <strong>public exponent</strong> e coprime to φ(n), then find the <strong>private exponent</strong> d with <strong>e × d mod φ(n) = 1</strong>, i.e. e·d = k·φ(n) + 1. Why that? Step 1 says m^φ(n) mod n = 1, so m^(e·d) = m^(k·φ(n)+1) = (m^φ(n))^k · m, which is m again mod n. Each dot in the chart is a candidate d: across is d, up is e·d mod φ(n). The dots fall on slanted stripes, and exactly one sits at height 1: that is the private key. Computers don’t try every d; the <strong>extended Euclidean algorithm</strong> (the repeated-remainder gcd, keeping track of coefficients along the way) gets it in one pass, shown in the table.',
    pSlider: 'Prime p', qSlider: 'Prime q', eSlider: 'Public exponent e (candidates coprime to φ)',
    s2lgPts: 'e·d mod φ for each candidate d', s2lgD: 'the d that lands on 1 (private key)',
    c2a: 'e × d mod φ(n), across: candidate d',
    s2readout: 'n = {p} × {q} = {n}, φ(n) = {pm} × {qm} = {phi}. Public key (n, e) = ({n}, {e}); private key d = {d}. Check: {e} × {d} = {ed} = {k} × {phi} + 1.',
    euTitle: 'Extended Euclid: every row satisfies remainder = s × φ + t × e',
    euR: 'remainder', euQ: 'quotient', euS: 's', euT: 't',
    euNote: 'The last non-zero remainder is 1, so e and φ are coprime. That row’s t = {t}; shifted by a multiple of φ into the range 0…φ it becomes d = {d}.',
    s2hint: 'What to try: hold p and q and drag e. The stripes tilt differently for each e, yet exactly one dot always sits at height 1 (green); its position across is d. Then change p or q: φ(n) changes, and the whole picture and d are recomputed. Every number comes from the current p, q, e, and steps 3, 4 and 5 use this key.',

    s3k: 'Step 3 · Locking and unlocking',
    s3t: 'Lock a number and unlock it again: does every number come back intact?',
    s3e: 'This step asks: with step 2’s key, if you lock a number m and then unlock it, do you really get m back? The number to send is the <strong>plaintext</strong> m (0 ≤ m &lt; n). Anyone can encrypt with the public key: <strong>c = m^e mod n</strong>, the <strong>ciphertext</strong>. Only the holder of d can decrypt: <strong>m′ = c^d mod n</strong>. The upper chart plots every plaintext m against its ciphertext c: the dots look scattered at random, and the ciphertext gives no hint of the plaintext. The lower chart plots the decrypted m′ against m: press “Check every plaintext” and each checked dot lands on the diagonal m′ = m. Step 2’s argument assumed m is coprime to n; here the multiples of p or q are checked too.',
    mSlider: 'Plaintext m', check3: 'Check every one of the n plaintexts',
    s3lgAll: 'all (m, c)', s3lgNow: 'current m', s3lgOk: 'checked: decrypts back to m',
    c3a: 'Encrypt: ciphertext c = mᵉ mod n', c3b: 'Decrypt: m′ = cᵈ mod n against m',
    s3readout: '{prog}m = {m} → encrypt c = {m}^{e} mod {n} = {c} → decrypt {c}^{d} mod {n} = {back}. {same}',
    s3same: 'Back where it started.',
    s3prog: '{c}/{N} plaintexts checked · ',
    s3all: 'All {N} plaintexts decrypt to themselves. {F} of them are not changed by encryption at all (0, 1 and n − 1 among them): used raw, textbook RSA gives these away, which is why real systems add random padding first.',
    s3hint: 'What to try: drag the plaintext m and watch the orange dot’s height (the ciphertext) jump around, with neighbouring m giving unrelated c. Then press “Check every plaintext” and watch the green dots settle on the diagonal one by one until the count reaches n/n. Changing e, p or q in step 2 clears the checks.',

    s4k: 'Step 4 · Fast powers',
    s4t: 'A real d has over six hundred decimal digits. Multiplying d times can never finish, so how does the owner decrypt?',
    s4e: 'This step asks: how many steps does the legitimate owner need for c^d mod n? Multiplying one factor at a time takes d − 1 products, and with a real d of about 2048 bits that is more than the number of atoms in the universe. <strong>Fast exponentiation</strong> (square-and-multiply) writes d in binary and reads it from the top bit down: for each bit, <strong>square</strong> the running value (doubling the exponent), and if the bit is 1, <strong>multiply by the base once more</strong> (adding 1 to the exponent). Reduce mod n after every step, so the numbers never exceed n². That needs at most 2 × (number of bits − 1) products. The table works it out for the current key; the chart compares the product counts of both methods on a log scale (each gridline up is ten times more).',
    useE: 'Encrypt: compute mᵉ', useD: 'Decrypt: compute cᵈ', run4: 'Work it row by row',
    s4lgNaive: 'one at a time: E − 1 products', s4lgFast: 'fast powers: at most 2(L − 1)', s4lgNow: 'current exponent (L bits)',
    c4a: 'Products needed (log scale), across: bits L in the exponent',
    lad0: 'Row', lad1: 'Bit', lad2: 'Operation', lad3: 'Exponent', lad4: 'Value mod n',
    opStart: 'start (base)', opSq: 'square', opMul: 'times the base',
    s4readout: '{prog}{base}^{E} mod {n}: the exponent {E} is {bits} in binary ({L} bits). Fast powers used {sq} squarings + {mu} extra products = {fast}, giving {v}; one at a time would take {naive}. For a 2048-bit exponent: at most about {f2048} products with fast powers, about 10^{n2048} one at a time.',
    s4prog: '{c}/{N} rows done · ',
    s4hint: 'What to try: choose “Decrypt: compute cᵈ”, press “Work it row by row”, and watch the exponent in the table double and add 1 bit by bit until it equals d exactly. Then read the chart: the blue line (one at a time) climbs straight up the log scale while the orange line (fast powers) stays near the floor. Switch to “Encrypt: compute mᵉ”: e is small, so the two methods barely differ, which is one reason public exponents such as 3 or 65537 are popular.',

    s5k: 'Step 5 · The eavesdropper’s side',
    s5t: 'The eavesdropper has n, e and the ciphertext c. How much work does reading m take?',
    s5e: 'This step asks: the lock is public, so where exactly is the difficulty in picking it? The eavesdropper knows the public key (n, e) and the intercepted ciphertext c. Knowing d would let her decrypt; computing d needs φ(n) = (p − 1)(q − 1), which means splitting n into p × q (φ counts the numbers coprime to n). The upper chart runs a real trial division against the current toy key. A real n has 2048 bits and can’t be measured, so the lower chart can only estimate <strong>orders of magnitude</strong> from formulas: trial division takes about √n / 2 tries; the fastest known general-purpose method, the <strong>number field sieve</strong> (GNFS), takes about exp(1.923 · (ln n)^(1/3) · (ln ln n)^(2/3)) operations; legitimate decryption with fast powers takes about 1.5·L products of about L² bit operations each. The grey line is “a supercomputer doing 10^18 operations per second for a whole year”.',
    attack5: 'Let the eavesdropper trial-divide the current n', lSlider: 'Key size L (bits in n)',
    s5lgTried: 'divisors tried', s5lgHit: 'divides evenly: p found', s5lgLegit: 'legitimate decryption (fast powers)', s5lgGnfs: 'number field sieve (estimate)', s5lgTrial: 'trial division (estimate)', s5lgYear: '10^18 ops/s for 1 year',
    c5a: 'Eavesdropper trial-dividing n = {n} (across: divisor)', c5b: 'Operations, order of magnitude (log scale); across: key size L',
    s5idle: 'The eavesdropper knows n = {n} and e = {e}, and has intercepted c = {c}. Press the button above to set her trial-dividing.',
    s5run: '{c} divisors tried so far…',
    s5done: 'After {tries} divisors, {p} divides evenly: n = {p} × {q}. So φ = {phi}, extended Euclid gives d = {d}, and {c}^{d} mod {n} = {m}. A toy key falls in an instant.',
    s5scale: 'L = {L} bits: legitimate decryption ≈ 10^{lg} bit operations; number field sieve ≈ 10^{gn} operations, {yrs} at 10^18 per second; trial division ≈ 10^{tr}.',
    yrsSmall: 'under a second', yrsSec: 'about 10^{x} seconds', yrsYear: 'about 10^{x} years',
    s5hint: 'What to try: press “Let the eavesdropper trial-divide” and watch the grey dots tick past until the orange one (p) stops her; the readout shows the d and plaintext she recovers. Then drag the key size L: the cyan line (legitimate decryption) is nearly flat, the orange line (number field sieve) crosses the grey one-year line around 1000 bits and keeps pulling away, and the red trial-division line shoots off the top almost at once. All of these curves are order-of-magnitude estimates; constants and lower-order terms are ignored.',
    quizPrompt: 'Think it through: the eavesdropper already has n, e and the ciphertext c. What is the one thing she is really missing?',
    quizA: 'The value of e, without which the formula can’t be used',
    quizB: 'φ(n), which is the same as knowing the two prime factors p and q',
    quizC: 'A faster computer to take the e-th root of c',
    check: 'Check', correct: 'Right. e and n are both public; with φ(n), extended Euclid gives d in one pass. Finding φ(n) is as hard as splitting n, and that is where the lock gets its strength.', wrong: 'Not quite: e is already published in the public key, and there is no shortcut for “e-th roots” in clock arithmetic. What she lacks is φ(n), i.e. p and q, from which d follows.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Three parts make the lock',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: multiplying two primes is quick, while the trial divisions to split them grow exponentially with the number of bits. <strong>Step 1</strong>: on a clock, repeated multiplication by a returns to 1 after φ(n) steps whenever a is coprime to n. <strong>Step 2</strong>: choose e·d = k·φ(n) + 1 and the (e·d)-th power of m is m again; extended Euclid finds d. <strong>Step 3</strong>: c = m^e mod n locks, c^d mod n unlocks, and every plaintext comes back. <strong>Step 4</strong>: fast powers keep honest encryption and decryption at about 2 × bits products. <strong>Step 5</strong>: to get d the eavesdropper needs φ(n), hence the factors of n, and a 2048-bit n is far beyond today’s computing power.',
    formula: 'n = p·q,  φ(n) = (p−1)(q−1)\ne·d mod φ(n) = 1\nc = mᵉ mod n,  m = cᵈ mod n',
    boundary: 'Scope: this page is “textbook RSA”: tiny primes, no random padding, no signatures. The primes are small only so everything can be computed in full, and anyone can split them on the spot; real keys use random primes of 1024 bits or more and must be padded first (step 3 showed plaintexts that encryption leaves unchanged, one of the leaks of unpadded RSA). Step 0’s counts are measured in the browser; step 5’s estimates for 2048 bits are orders of magnitude only, with constants and lower-order terms dropped (for calibration: RSA-250, an 829-bit challenge number factored publicly in 2020, took about 2,700 CPU core-years). Quantum computers are not modelled: Shor’s algorithm factors in polynomial time, and a large enough quantum computer would break RSA. In practice RSA mostly exchanges a symmetric key or makes digital signatures, and bulk data is encrypted symmetrically.',
    linksTitle: 'Where to go next',
    lk1: '→ Division & remainders, step 3: “what weekday?” is clock arithmetic mod 7',
    lk2: '→ Numbers & counting, step 1: the gcd by repeated remainders, the root of extended Euclid',
    lk3: '→ Hashing, step 4: how many bits a fingerprint needs, another trade of length for safety',
    lk4: '→ Exponents & logs, step 2: why “doubles every few bits” is best read on a log scale',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “RSA Public-Key Encryption · Easy to Multiply, Hard to Split”.'
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
  if (typeof window.refreshRSA === 'function') window.refreshRSA();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.RSA_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
