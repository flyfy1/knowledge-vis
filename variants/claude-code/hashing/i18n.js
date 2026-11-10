'use strict';
// Hashing strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '哈希 · 32 位装下任何一段话',
    back: '← 知识索引',
    compare: '对照另一版本：哈希 · 把任意输入压成固定指纹 →',
    navLabel: '哈希步骤导航',
    tagline: '把一句话、一个文件、甚至一整部电影都压成同样长度的一串位，叫做哈希（也叫散列），得到的那串位叫指纹或哈希值。指纹很短，所以一定有不同的输入撞上同一个指纹。这一页用一个真正在跑的 32 位哈希回答五个问题：它怎么压；输入改一点，指纹变多少；拿指纹当地址时撞了怎么办；撞车为什么比直觉来得早；指纹要多长才够。',
    nav0: '0 指纹', nav1: '1 雪崩', nav2: '2 哈希表', nav3: '3 生日撞车', nav4: '4 要多少位', nav5: '5 收束',

    s0k: '第 0 步 · 指纹',
    s0t: '任意长的文字，怎样变成固定的 32 位？',
    s0e: '这一步要回答：输入可长可短，哈希怎样保证输出总是 32 位？计算机里的文字先变成一串<strong>字节</strong>（每个字节 8 位，取值 0–255；这里用 UTF-8 编码：英文字母占 1 个字节，汉字占 3 个）。本页的哈希叫 <strong>FNV-1a</strong>：准备一个 32 位的<strong>状态</strong>，起点是固定常数 0x811c9dc5（0x 表示十六进制）；每读一个字节做两件事——先把字节<strong>异或</strong>进状态（逐位比较，相同得 0、不同得 1），再把状态乘以质数 16777619，只保留乘积的低 32 位（溢出的高位丢掉）。字节读完，状态就是<strong>指纹</strong>（哈希值）。不论读多少字节，状态始终只有 32 位，所以指纹长度固定。下图每一行是读完一个字节后的状态，第一行是起点。',
    inputLabel: '输入文字（最多 48 个字符）',
    s0lgOne: '这一位是 1', s0lgZero: '这一位是 0', s0lgFinal: '最后一行 = 指纹',
    c0title: '每读一个字节后的 32 位状态（左端是最高位）',
    rowStart: '起点',
    s0readout: '输入 {chars} 个字符 = {bytes} 个字节 → 指纹 0x{hex}（32 位，共 2³² = 4,294,967,296 种可能的指纹）。',
    s0empty: '输入为空：0 个字节，指纹就是起点 0x{hex}。',
    s0hint: '观察顺序：先点「cat」再点「cats」：前 4 行（起点和 c、a、t）完全一样，只多出最后一行，指纹却几乎整个变了。再点那句很长的英文：行数变多，每行仍是 32 格。最后自己输入任何文字（中文也行），看字节数和行数一起变，而指纹始终是 8 个十六进制数字。',

    s1k: '第 1 步 · 雪崩效应',
    s1t: '输入只改 1 位，指纹会变多少位？',
    s1e: '这一步要回答：好的指纹应当「差之毫厘，谬以千里」——输入只差一点，指纹就面目全非，这叫<strong>雪崩效应</strong>。理想情况下，翻转输入的任意 1 位，指纹 32 位中的每一位都有一半机会翻转，平均变 16 位。这里取第 0 步的输入，逐个翻转它的每一位（翻转：0 变 1、1 变 0），比较两种哈希：<strong>FNV-1a</strong>（粉色），和 <strong>FNV-1a + 混合</strong>（绿色）：在 FNV-1a 的结果后面再做一步<strong>末尾混合</strong>（MurmurHash3 的 fmix32：把状态右移若干位异或回自己、再乘一个大奇数，重复两轮），让高位的变化也能传回低位。位的顺序同第 0 步：左端是最高位（第 31 位），右端是最低位（第 0 位）。',
    flipSlider: '翻转输入的第几位',
    c1rows: '原指纹与翻转 1 位后的指纹（橙色 = 这次变了的位）',
    c1barsF: 'FNV-1a：每个输出位被翻转的比例（在已试过的输入位中）',
    c1barsM: 'FNV-1a + 混合：每个输出位被翻转的比例',
    rowMix: '+ 混合',
    s1lgDiff: '这次变了的位', s1lgFnv: 'FNV-1a', s1lgMix: 'FNV-1a + 混合', s1lgHalf: '理想比例 0.5',
    sweepAll: '依次翻转全部位', clearTried: '清空记录',
    s1readout: '翻转第 {byte} 个字节（{ch}）的第 {bit} 位：FNV-1a 变了 {a}/32 位，加混合后变了 {b}/32 位。已试 {v}/{N} 个输入位：平均分别变 {ma} 位和 {mb} 位（理想 16）；FNV-1a 的最低位只在其中 {low}% 的情形下翻转。',
    s1hint: '观察顺序：打开时已把每一位都翻转过一次。拖滑杆看单次翻转（橙色是变了的位）；再按「依次翻转全部位」，看下方两组柱从零开始随试过的位数累积长高。粉色柱在最右边几位（最低的几位）明显偏矮：乘法只把变化往高位推，乘积的低位只取决于两个乘数的低位。最低位只在翻转某个字节的最低位时才变，所以全部试完时恰好是 1/8 = 12.5%；往左数第 k 位（从 0 数）最多只有 (k + 1)/8。绿色柱都聚在 0.5 虚线附近：末尾混合把变化摊到了每一位。改第 0 步的输入会清空记录。',

    s2k: '第 2 步 · 哈希表',
    s2t: '拿指纹当地址，几个键挤进同一个桶怎么办？',
    s2e: '这一步要回答：把指纹当地址用，冲突有多少、代价多大？这是哈希最常见的用途——<strong>哈希表</strong>：准备 m 个<strong>桶</strong>（编号 0 到 m − 1），一个键（比如用户名）放进第「指纹 mod m」号桶（mod：除以 m 取余数）。查找时算一次哈希，直接去那个桶找，不必像二分查找那样比较约 log₂ n 次（<a class="xlink" href="../../../computing/algorithms/binary-search/#step3">→ 二分查找第 3 步：比较次数怎么数</a>）。但 n 个键放进 m 个桶，难免两个键落进同一个桶，这叫<strong>冲突</strong>。这里用<strong>拉链法</strong>处理：同一个桶的键排成一条链，查找时沿链逐个比较。<strong>装载因子</strong> α = n/m，即平均每个桶几个键。键是 item-0、item-1、…… 这样的字符串；「差的哈希」直接把所有字节加起来当指纹，作为反面对照。',
    nKeys: '键的个数 n', mBuckets: '桶数 m',
    goodHash: '好的哈希：FNV-1a + 混合', badHash: '差的哈希：字节相加',
    c2buckets: '每个桶里的键（一列一个桶，从左到右是桶号 0 … m − 1）',
    c2hist: '链长分布：有几个桶的链长为 k · 横轴：k',
    s2lgKey: '一个键', s2lgLong: '最长的链', s2lgExp: '完全随机哈希下的预期桶数',
    s2readout: '{name}：α = n/m = {a}。空桶 {e} 个（完全随机时预期 {ee} 个）；最长链 {L} 个键；查一个已存在的键平均要比较 {p} 次（完全随机时预期 1 + (n − 1)/(2m) = {pe}）。',
    s2hint: '观察顺序：保持 m = 32，把 n 从 0 拖到 200：链越来越长，但下图柱子一直贴着白点（完全随机哈希的预期）。再固定 n 拖 m：α 越小，空桶越多、平均比较次数越接近 1。最后切到「差的哈希」，把 n 拖到 200、m 拖到 40 以上：item-12 和 item-21 这类只是数字换了位置的键，字节和完全相同，必然同桶；200 个键的字节和一共只有 47 种不同的值，桶再多也最多用上 47 个，空桶远多于白点的预期，平均比较次数也明显更大。m 小的时候差别不明显——差的哈希的毛病在桶多时才暴露。',

    s3k: '第 3 步 · 生日撞车',
    s3t: '指纹只有 d 种时，插入多少个键就很可能撞车？',
    s3e: '这一步要回答：冲突比直觉来得早多少？只保留指纹最前面的 b 位，就只有 d = 2^b 种取值。直觉会说「放进 d/2 个才有一半机会撞」，实际只要 √d 的量级。道理和<a class="xlink" href="../../../probability/basics/counting-permutations/#step5">生日问题（→ 排列与组合第 5 步：23 个人里就有一半机会两人同天生日）</a>一样：k 个键两两配对有 k(k − 1)/2 对，每一对都可能撞上。假设每个指纹均匀随机、互相独立，前 k 个键全不重复的概率是 (1 − 1/d)(1 − 2/d)…(1 − (k − 1)/d)，至少撞一次的概率就是 1 减去它。<strong>实验</strong>（真实哈希，不是随机数）：依次哈希「t编号-0」「t编号-1」……只保留前 b 位，记下第一次出现重复时一共插入了几个键；每次实验换一个编号。',
    bSlider: '只保留前 b 位（d = 2^b）',
    runTrials: '再跑 100 次实验', clearTrials: '清空实验',
    c3hist: '每次实验首次撞车时插入的键数（计数柱）· 横轴：键数 k',
    c3cdf: '插入 k 个键时已经撞车的比例 · 横轴：键数 k',
    s3lgExp: '实验：已撞车的实验所占比例', s3lgTheory: '理论：1 − Π(1 − i/d)', s3lgMarks: '竖虚线：√d（左）与理论 50% 点（右）',
    s3readout: 'd = 2^{b} = {d} 种指纹。理论：插入 {k50} 个键时撞车概率首次超过 50%（约 1.18·√d = {approx}，远小于 d/2 = {half}）；插入 √d ≈ {sq} 个键时已达 {psq}%。实验：已跑 {T} 次{med}。',
    s3med: '，首次撞车时插入键数的中位数是 {m}',
    s3none: '，还没开始',
    s3hint: '观察顺序：页面打开时已跑好 100 次。按「再跑 100 次实验」，看上方计数柱一根根长出来、下方青色阶梯逐步贴上橙色理论曲线；多按几次，贴得更紧。再拖 b：每加 2 位，d 变成 4 倍，撞车点却只往右挪到约 2 倍——它跟着 √d 走。换 b 会清空实验。',

    s4k: '第 4 步 · 要多少位',
    s4t: '要几乎不撞车，指纹得有多长？',
    s4e: '这一步要回答：给 N 个对象（文件、数据包、数据库记录）各算一个 b 位指纹，想让「任何两个撞上」的概率低于门槛 p，b 至少要多大？沿用上一步的均匀随机假设：N 个指纹两两配对有 N(N − 1)/2 对，每对撞上的概率是 1/2^b，所以至少一次撞车的概率 <strong>P ≈ 1 − exp(−N(N − 1)/2 ÷ 2^b)</strong>（exp 是以 e 为底的指数函数）；P 很小时约等于「配对数 ÷ 2^b」。关键在平方：N 乘 10，配对数乘 100，指纹要多约 6.6 位（log₂100）才能抵消。',
    nItems: '对象个数 N = 10^x，x =', pTarget: '可接受的撞车概率 p = 10^y，y =',
    c4title: '至少一次撞车的概率 P（纵轴对数刻度）· 横轴：指纹位数 b',
    s4lgCurve: '撞车概率 P', s4lgTarget: '门槛 p', s4lgMarks: '常见长度：32、64、128、256 位（空心 = 低于纵轴下限）', s4lgNeed: '青色竖虚线：满足门槛的最少位数',
    s4readout: 'N = {N}：32 位 P ≈ {p32}；64 位 P ≈ {p64}；128 位 P ≈ {p128}；256 位 P ≈ {p256}。要让 P ≤ {pt}，至少需要 {need} 位。',
    s4hint: '观察顺序：先看 N = 10⁹（十亿个对象）时 64 位的那个点：P 约 2.7%，并不安全；门槛 10⁻⁶ 要求至少 79 位。把 x 每加 1（N 乘 10），曲线整体右移约 6.6 位；把门槛每降 3 个数量级，需要的位数多约 10 位。所以 128 位以上的指纹，即使 N 到了 10¹²，意外撞车的概率也小得可以忽略——前提是哈希表现得像随机的，而且没有人故意去造碰撞。',

    s5k: '第 5 步 · 收束',
    s5t: '指纹有用，因为它短；会撞车，也因为它短',
    s5fin: '哈希把任意长的输入压成固定长度的指纹（第 0 步）。好的哈希让输入的一点改动扩散到指纹的每一位（第 1 步）。把指纹当桶号，一步就能找到位置，但冲突躲不掉，只能用拉链等办法处理，再用足够多的桶让链保持短（第 2 步）。冲突比直觉来得早：d 种指纹在约 1.18·√d 个键时就有一半机会撞车（第 3 步），所以指纹长度要按「对象数的平方」来定（第 4 步）。',
    formula: 'P(至少一次撞车) ≈ 1 − exp(−k(k − 1) / 2d)，d = 2^b\n一半概率撞车：k ≈ 1.18·√d\n要 P ≤ p：b ≥ log₂(N(N − 1) / 2p)（p 很小时）',
    boundary: '适用范围：本页的 FNV-1a 和末尾混合都不是密码学哈希，有人故意构造时可以轻易造出碰撞，不能用于存密码、数字签名或防篡改；那类场合要用 SHA-256 等专门设计的哈希。第 3、4 步的概率公式假设指纹均匀随机、相互独立，真实哈希只是近似满足，第 3 步的实验检验的正是这个近似。哈希表除拉链法外还有开放寻址等做法，本页没有展开。',
    linksTitle: '接着去哪儿',
    lk1: '→ 排列与组合第 5 步：生日问题，23 个人就让概率过半',
    lk2: '→ 二分查找第 3 步：不用哈希时，查找要比较几次',
    lk3: '→ RSA 第 0 步：乘起来容易、倒推回去难——另一种「单向」的计算',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《哈希 · 把任意输入压成固定指纹》的平行版本。'
  },
  en: {
    pageTitle: 'Hashing · Any Text in 32 Bits',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Hashing · Squeezing Any Input Into a Fixed Fingerprint →',
    navLabel: 'Hashing steps',
    tagline: 'Hashing squeezes a sentence, a file or even a whole film into a string of bits of one fixed length, called its fingerprint or hash value. Because the fingerprint is short, some different inputs must share one. Using a 32-bit hash that really runs on this page, we answer five questions: how the squeezing works; how much the fingerprint changes when the input changes a little; what to do when fingerprints used as addresses clash; why clashes arrive sooner than intuition says; and how long a fingerprint must be.',
    nav0: '0 Fingerprint', nav1: '1 Avalanche', nav2: '2 Hash table', nav3: '3 Birthday clash', nav4: '4 How many bits', nav5: '5 Wrap-up',

    s0k: 'STEP 0 · THE FINGERPRINT',
    s0t: 'How does text of any length become exactly 32 bits?',
    s0e: 'The question here: inputs can be short or long, so how does a hash always produce 32 bits? Text is first turned into <strong>bytes</strong> (8 bits each, values 0–255; we use UTF-8, where a Latin letter takes 1 byte and a Chinese character 3). The hash on this page is <strong>FNV-1a</strong>. It keeps a 32-bit <strong>state</strong> that starts at the fixed constant 0x811c9dc5 (0x marks hexadecimal). For each byte it does two things: <strong>XOR</strong> the byte into the state (bit by bit: equal bits give 0, different bits give 1), then multiply the state by the prime 16777619 and keep only the low 32 bits of the product (the overflow is thrown away). When the bytes run out, the state is the <strong>fingerprint</strong> (hash value). However many bytes are read, the state never grows beyond 32 bits — so the fingerprint length is fixed. Each row below is the state after one more byte; the first row is the starting value.',
    inputLabel: 'Input text (up to 48 characters)',
    s0lgOne: 'Bit is 1', s0lgZero: 'Bit is 0', s0lgFinal: 'Last row = the fingerprint',
    c0title: 'The 32-bit state after each byte (most significant bit on the left)',
    rowStart: 'start',
    s0readout: '{chars} characters = {bytes} bytes → fingerprint 0x{hex} (32 bits; 2³² = 4,294,967,296 possible fingerprints).',
    s0empty: 'Empty input: 0 bytes, so the fingerprint is the starting value 0x{hex}.',
    s0hint: 'What to watch: click “cat”, then “cats”. The first 4 rows (start, c, a, t) are identical; only one extra row appears, yet nearly the whole fingerprint changes. Click the long English sentence: more rows, still 32 squares each. Then type anything you like (Chinese works too) and watch the byte count and the rows grow together while the fingerprint stays 8 hex digits.',

    s1k: 'STEP 1 · THE AVALANCHE EFFECT',
    s1t: 'Change one input bit: how many fingerprint bits change?',
    s1e: 'The question here: a good fingerprint should change completely when the input changes only slightly — the <strong>avalanche effect</strong>. Ideally, flipping any single input bit gives every one of the 32 output bits an even chance of flipping, so 16 change on average. We take the input from step 0, flip each of its bits in turn (0 becomes 1, 1 becomes 0), and compare two hashes: plain <strong>FNV-1a</strong> (pink) and <strong>FNV-1a + mixing</strong> (green), which adds a <strong>final mix</strong> after FNV-1a (MurmurHash3’s fmix32: shift the state right, XOR it back into itself, multiply by a large odd number, twice over) so that changes in high bits reach the low bits too. Bit order matches step 0: most significant bit (bit 31) on the left, least significant (bit 0) on the right.',
    flipSlider: 'Input bit to flip',
    c1rows: 'Original vs one-bit-flipped fingerprint (orange = changed this time)',
    c1barsF: 'FNV-1a: share of tried flips that changed each output bit',
    c1barsM: 'FNV-1a + mixing: share of tried flips that changed each bit',
    rowMix: '+ mix',
    s1lgDiff: 'Changed this time', s1lgFnv: 'Plain FNV-1a', s1lgMix: 'FNV-1a + mixing', s1lgHalf: 'Ideal rate 0.5',
    sweepAll: 'Flip every bit in turn', clearTried: 'Clear history',
    s1readout: 'Flip bit {bit} of byte {byte} ({ch}): FNV-1a changes {a}/32 bits, with mixing {b}/32. Over the {v}/{N} input bits tried: {ma} and {mb} bits on average (ideal 16); FNV-1a’s lowest bit flipped in only {low}% of them.',
    s1hint: 'What to watch: the page opens with every bit already flipped once. Drag the slider to see single flips (orange marks the changed bits), then press “Flip every bit in turn” to watch both sets of bars build up from zero as more input bits are tried. The pink bars at the far right (the lowest few bits) are clearly short: multiplication pushes changes only upward, because the low bits of a product depend only on the low bits of the factors. The lowest bit changes only when you flip the lowest bit of some byte — exactly 1/8 = 12.5% once every bit has been tried; bit k (counting from 0) can reach at most (k + 1)/8. The green bars cluster around the dashed 0.5 line: the final mix spreads each change over all bits. Editing the step 0 input clears the history.',

    s2k: 'STEP 2 · HASH TABLES',
    s2t: 'Use the fingerprint as an address: what if keys land in the same bucket?',
    s2e: 'The question here: when fingerprints are used as addresses, how many clashes happen and what do they cost? This is the most common use of hashing, the <strong>hash table</strong>: set up m <strong>buckets</strong> numbered 0 to m − 1 and put each key (say, a user name) into bucket “fingerprint mod m” (mod: the remainder after dividing by m). A lookup computes one hash and goes straight to that bucket, instead of making about log₂ n comparisons the way binary search does (<a class="xlink" href="../../../computing/algorithms/binary-search/#step3">→ binary search, step 3: counting the comparisons</a>). But with n keys in m buckets, some keys inevitably share a bucket — a <strong>collision</strong>. We resolve it by <strong>chaining</strong>: keys in one bucket form a chain, and a lookup walks along it comparing one by one. The <strong>load factor</strong> α = n/m is the average number of keys per bucket. The keys are strings item-0, item-1, …; the “bad hash” simply adds all the bytes up, as a counter-example.',
    nKeys: 'Number of keys n', mBuckets: 'Number of buckets m',
    goodHash: 'Good hash: FNV-1a + mixing', badHash: 'Bad hash: add the bytes',
    c2buckets: 'Keys per bucket (one column each, buckets 0 … m − 1)',
    c2hist: 'Chain lengths: how many buckets hold k keys · horizontal: k',
    s2lgKey: 'One key', s2lgLong: 'Longest chain', s2lgExp: 'Expected bucket count for a perfectly random hash',
    s2readout: '{name}: α = n/m = {a}. {e} empty buckets (a perfectly random hash expects {ee}); longest chain {L} keys; finding a stored key takes {p} comparisons on average (perfectly random: 1 + (n − 1)/(2m) = {pe}).',
    s2hint: 'What to watch: keep m = 32 and drag n from 0 to 200. Chains get longer, but the bars below keep hugging the white dots (what a perfectly random hash would give). Then fix n and drag m: the smaller α, the more empty buckets and the closer the average lookup gets to 1 comparison. Finally switch to the bad hash and set n = 200, m above 40: keys like item-12 and item-21, whose digits are merely swapped, have identical byte sums and must share a bucket; the 200 keys produce only 47 different sums, so at most 47 buckets are ever used, far more stay empty than the white dots predict, and lookups take clearly more comparisons. With few buckets the difference hides — a bad hash shows its flaw when buckets are plentiful.',

    s3k: 'STEP 3 · THE BIRTHDAY CLASH',
    s3t: 'With only d possible fingerprints, how many keys make a clash likely?',
    s3e: 'The question here: how much sooner than intuition do collisions arrive? Keep only the first b bits of the fingerprint and there are just d = 2^b possible values. Intuition says “insert d/2 keys for an even chance of a clash”; in fact it takes only on the order of √d. The reason is the <a class="xlink" href="../../../probability/basics/counting-permutations/#step5">birthday problem (→ permutations and combinations, step 5: 23 people already give an even chance of a shared birthday)</a>: k keys form k(k − 1)/2 pairs, and every pair can clash. If fingerprints are uniformly random and independent, the chance that the first k keys are all different is (1 − 1/d)(1 − 2/d)…(1 − (k − 1)/d), and the chance of at least one clash is 1 minus that. <strong>Experiment</strong> (a real hash, not random numbers): hash “t&lt;id&gt;-0”, “t&lt;id&gt;-1”, … keeping the first b bits, and record how many keys were inserted when the first repeat appeared; each run uses a new id.',
    bSlider: 'Keep the first b bits (d = 2^b)',
    runTrials: 'Run 100 more trials', clearTrials: 'Clear trials',
    c3hist: 'Keys inserted at the first clash, one count per trial · horizontal: keys k',
    c3cdf: 'Share of trials already clashed after k keys · horizontal: keys k',
    s3lgExp: 'Experiment: share of trials that have clashed', s3lgTheory: 'Theory: 1 − Π(1 − i/d)', s3lgMarks: 'Dashed lines: √d (left) and the theoretical 50% point (right)',
    s3readout: 'd = 2^{b} = {d} fingerprints. Theory: the clash probability first passes 50% at {k50} keys (about 1.18·√d = {approx}, far below d/2 = {half}); at √d ≈ {sq} keys it is already {psq}%. Experiment: {T} trials so far{med}.',
    s3med: '; the median number of keys at the first clash is {m}',
    s3none: '; none run yet',
    s3hint: 'What to watch: the page opens with 100 trials already run. Press “Run 100 more trials”: the count bars grow one by one in the top panel, and in the bottom panel the cyan staircase settles onto the orange theory curve; press again and it fits more tightly. Then drag b: each extra 2 bits makes d 4 times larger, yet the clash point moves right only about 2 times — it follows √d. Changing b clears the trials.',

    s4k: 'STEP 4 · HOW MANY BITS',
    s4t: 'How long must a fingerprint be to make clashes practically impossible?',
    s4e: 'The question here: give each of N objects (files, packets, database rows) a b-bit fingerprint; to keep the chance that any two clash below a threshold p, how large must b be? Keep step 3’s assumption of uniform, independent fingerprints. N fingerprints form N(N − 1)/2 pairs, each clashing with probability 1/2^b, so the chance of at least one clash is <strong>P ≈ 1 − exp(−N(N − 1)/2 ÷ 2^b)</strong> (exp is the exponential with base e); when P is small it is about “pairs ÷ 2^b”. The square is what matters: multiply N by 10 and the pairs grow 100-fold, which costs about 6.6 extra bits (log₂100) to cancel.',
    nItems: 'Objects N = 10^x, x =', pTarget: 'Acceptable clash probability p = 10^y, y =',
    c4title: 'Probability of at least one clash P (log scale) · horizontal: bits b',
    s4lgCurve: 'Clash probability P', s4lgTarget: 'Threshold p', s4lgMarks: 'Common sizes: 32, 64, 128, 256 bits (hollow = below the axis)', s4lgNeed: 'Cyan dashed line: fewest bits that meet the threshold',
    s4readout: 'N = {N}: 32 bits P ≈ {p32}; 64 bits P ≈ {p64}; 128 bits P ≈ {p128}; 256 bits P ≈ {p256}. To keep P ≤ {pt} you need at least {need} bits.',
    s4hint: 'What to watch: at N = 10⁹ (a billion objects), look at the 64-bit point: P is about 2.7%, not safe at all; a 10⁻⁶ threshold needs at least 79 bits. Each +1 on x (N times 10) shifts the curve right by about 6.6 bits; each 3 orders of magnitude off the threshold costs about 10 more bits. That is why fingerprints of 128 bits or more make accidental clashes negligible even at N = 10¹² — provided the hash behaves like a random one and nobody is deliberately manufacturing collisions.',

    s5k: 'STEP 5 · WRAP-UP',
    s5t: 'A fingerprint is useful because it is short — and clashes for the same reason',
    s5fin: 'A hash squeezes input of any length into a fixed-length fingerprint (step 0). A good one spreads a tiny input change over every fingerprint bit (step 1). Used as a bucket number, the fingerprint finds a slot in one step, but collisions cannot be avoided, only handled — by chaining, with enough buckets to keep chains short (step 2). Clashes come sooner than intuition says: with d possible fingerprints there is an even chance of one after about 1.18·√d keys (step 3), so fingerprint length has to be set by the square of the number of objects (step 4).',
    formula: 'P(at least one clash) ≈ 1 − exp(−k(k − 1) / 2d), d = 2^b\nEven chance of a clash: k ≈ 1.18·√d\nFor P ≤ p: b ≥ log₂(N(N − 1) / 2p) (small p)',
    boundary: 'Scope: neither FNV-1a nor the final mix is a cryptographic hash. Someone who tries can manufacture collisions easily, so they must not be used for storing passwords, digital signatures or tamper detection; those need purpose-built hashes such as SHA-256. The probability formulas in steps 3 and 4 assume uniformly random, independent fingerprints; real hashes satisfy this only approximately, and step 3’s experiment tests exactly that approximation. Hash tables also come in other designs, such as open addressing, which this page does not cover.',
    linksTitle: 'Where to go next',
    lk1: '→ Permutations and combinations, step 5: the birthday problem, where 23 people pass 50%',
    lk2: '→ Binary search, step 3: how many comparisons a lookup needs without hashing',
    lk3: '→ RSA, step 0: easy to multiply, hard to undo — another kind of one-way computation',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Hashing · Squeezing Any Input Into a Fixed Fingerprint”.'
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
  if (typeof window.refreshHashing === 'function') window.refreshHashing();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.HASH_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
