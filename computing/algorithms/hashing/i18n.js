const STR = {
  zh: {
    docTitle: '哈希 · 把任意输入压成固定指纹', back: '← 知识索引', pageTitle: '哈希 · 把任意输入压成固定指纹',
    tagline: '任意长度的输入变成固定长度的指纹：雪崩效应、哈希表里的冲突、生日悖论，以及指纹到底要多少位才够。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 指纹', nav1: '1 雪崩效应', nav2: '2 哈希表', nav3: '3 生日悖论', nav4: '4 指纹多长', nav5: '5 终章',
    s0k: '第 0 步 · 指纹', s0t: '怎样把任意长的文字压成固定长度的指纹？',
    s0e: '这一步要回答：<strong>哈希函数</strong>怎样把任意长度的输入变成固定长度的「指纹」？本页用的是教学用的 32 位哈希（FNV-1a 再加一步混合，<strong>不是</strong>加密哈希）：输出永远是 32 个二进制位（0 或 1），不管输入是 1 个字符还是 1 万个字符。在文本框里输入文字，或点预设：32 个格子（亮 = 1）怎样变化。预设 abc 与 abd 只差一个字符，指纹却面目全非。滑块「只取最后 k 位」模拟更短的指纹（哈希表常用 h mod 2^k）：变暗的位被丢弃，读数里是保留部分的数值。同样的输入永远得到同样的输出（确定性）。',
    s0tL: '输入文字', s0kL: '只取最后 k 位', s0p4: '清空（空输入）', s0reset: '重置', cv0: '输入的 32 位哈希指纹',
    s0Cap: '{n} 字节 → 32 位指纹（亮 = 1，暗 = 丢弃）', s0Hex: '十六进制：0x{h}', s0Low: '最后 {k} 位的数值：{v}', s0Dir: '同一输入永远得到同一指纹；不同输入也可能撞上同一个（见第 3 步）',
    s0ro: '输入 <b>{n}</b> 字节 → 指纹 <b>0x{h}</b>（十进制 {d}，其中 {ones} 个 1）；只取最后 {k} 位 = <b>{v}</b>（共 {m} 种可能）。',
    s0term: '字节 = 8 个二进制位；中文等字符按 UTF-8 编码占多个字节。mod = 取余数。',
    s1k: '第 1 步 · 雪崩效应', s1t: '改一个比特，指纹会变多少？',
    s1e: '这一步要回答：输入只差 1 个二进制位时，输出会差多少？好的哈希函数应该有<strong>雪崩效应</strong>：翻转输入的任意 1 位，输出的 32 位里大约一半会翻转。下图是一条随机的 8 字节消息（共 64 个输入位）：上排是原指纹，下排是翻转第 p 位后的指纹，橙色格子是变了的位。拖动「翻转第几位」；再按「批量统计」：对 20 条新消息各翻转全部 64 位，共 1280 次，把每次变了多少位累积成直方图，应当以 16 为中心。柱子越集中在 16 附近，说明扩散越好。',
    s1pL: '翻转第几位（0–63）', s1new: '换一条消息', s1run: '批量统计 1280 次翻转', s1reset: '清空统计并重置', cv1: '翻转前后的指纹与累计的变化位数直方图',
    s1A: '原消息的指纹 0x{h}', s1B: '翻转第 {p} 位后：0x{h}（橙 = 变了的位）', s1Hist: '{n} 次翻转：每次变了几位（虚线 = 当前）', s1Ax: '变了的位数 0 → 32',
    s1ro: '翻转输入第 {p} 位：输出变了 <b>{cur}</b> 位。累计 {n} 次翻转：平均变 <b>{mean}</b> 位，标准差 {sd}（理想的随机输出：平均 16，标准差约 2.83）。',
    s1term: '雪崩效应是好哈希的性质，不等于安全：本页的哈希没有抗攻击设计，不能用于密码或签名。',
    s2k: '第 2 步 · 哈希表', s2t: '用指纹当地址：钥匙落进哪个格子？',
    s2e: '这一步要回答：怎样用哈希把东西快速放进、找出来？<strong>哈希表</strong>有 m 个格子（桶），一个键放进第 h(键) mod m 号桶。下图把键 key-001、key-002…… 依次放进去：多个键落进同一个桶叫<strong>冲突</strong>，同桶的键排成一列（橙色）。拖动键的个数 n 和桶数 m，保持其中一个不变，看冲突怎样变化。<strong>装载因子</strong> α = n / m：α 越大，冲突越多。读数把「实际占用的桶数」与公式给出的期望值 m·(1 − (1 − 1/m)ⁿ) 对照（公式假设哈希均匀随机；本页是一组确定的键，两者不会完全相等）。',
    s2nL: '键的个数 n', s2mL: '桶数 m', s2reset: '重置', cv2: '哈希表的桶与落入的键',
    s2Cap: '{n} 个键 → {m} 个桶（橙 = 该桶有多个键）', s2Ax: '格子里的数字 = 键的编号（key-编号）',
    s2ro: 'n = <b>{n}</b> 个键放进 m = <b>{m}</b> 个桶，装载因子 α = {a}；实际占用 {occ} 个桶，公式期望 {eo}；有 <b>{coll}</b> 个键与更早的键同桶；最长的桶有 {mx} 个键。',
    s2term: '冲突 = 两个不同的键被分到同一个桶；本页用「同桶排成一列」处理冲突。',
    s3k: '第 3 步 · 生日悖论', s3t: '为什么冲突比想象中来得早？',
    s3e: '这一步要回答：往 m 个格子里随机放 n 个东西，n 多大就几乎必然有两个撞在一起？经典例子是生日：m = 365，只要 n = 23 个人，就有约 50% 的概率两人同生日，因为要比较的不是「每人 vs 365 天」，而是 n(n−1)/2 对人。<strong>精确概率</strong>：P(至少一次冲突) = 1 − (1 − 1/m)(1 − 2/m)…(1 − (n−1)/m)。选一个 m，拖动 n，再按「做 1 / 100 / 1000 次实验」：每次实验随机放 n 个，看有没有撞；橙线是已做实验里「撞过」的比例，绿色虚线是精确概率，实验越多越贴近。n 约为 1.18·√m 时概率约 50%。拖动 n 或换 m 会清空已做的实验。',
    s3nL: '放入的个数 n', s3m0: 'm = 365（生日）', s3m1: 'm = 65536 = 2¹⁶', s3m2: 'm = 2³² ≈ 43 亿', s3r1: '做 1 次实验', s3r100: '做 100 次', s3r1000: '做 1000 次', s3reset: '清空实验并重置', cv3: '生日悖论的实验比例与精确概率',
    s3Cap: 'n = {n} 个放进 m = {m} 个格子', s3Ax: '实验次数 → {n}', s3Leg: '橙 = 撞过的比例，绿虚线 = 精确概率', s3Curve: '精确概率随 n 变化（n：0 → 100）',
    s3ro: 'n = <b>{n}</b>，m = {m}：精确概率 <b>{ex}</b>；已做 {trials} 次实验，撞过的比例 <b>{emp}</b>（± {se}）；n 约为 {n50} 时概率达到 50%。',
    s3term: '实验用固定随机种子；± 是标准误 √(p(1−p)/次数)。m 很大时曲线在 n ≤ 100 内几乎贴着 0，请看读数里的 50% 位置。',
    s4k: '第 4 步 · 指纹多长', s4t: '要避免撞车，指纹要多少位？',
    s4e: '这一步要回答：给大量文件做指纹，要多长才几乎不会撞？假设哈希输出像均匀随机的 k 位数，n 个对象至少有一次冲突的概率约为 1 − e^(−n(n−1)/2^(k+1))（概率很小时约等于 n(n−1)/2^(k+1)）。纵轴是冲突概率的对数（1e-6 = 百万分之一），横轴是指纹位数 k。拖动 n（以 10 的幂计）和 k：n 不变时，k 每多 1 位，概率约减半；读数还给出把概率压到百万分之一以下大约需要几位。32 位指纹到了百万级对象就几乎必撞，要到 128 位左右才能当作「不会撞」。',
    s4xL: '对象个数 n（10 的幂）', s4kL: '指纹位数 k', s4reset: '重置', cv4: '冲突概率随指纹位数的变化',
    s4Cap: 'n = 10^{x} 个对象时的冲突概率', s4Ax: '指纹位数 k：8 → 128', s4Leg: '纵轴 = 冲突概率（对数，下限 1e-30）',
    s4ro: 'n = <b>{n}</b>，k = <b>{k}</b> 位：冲突概率约 <b>{p}</b>；要压到百万分之一以下大约需要 {need} 位。',
    s4term: '假设哈希输出均匀随机、相互独立；真实哈希（尤其非加密的）可能有偏差，攻击者还可能故意制造冲突，本页不涉及。',
    s5k: '第 5 步 · 终章', s5t: '收束：固定长度的指纹，免不了撞车',
    s5e: '哈希把任意输入压成固定长度的指纹：好的哈希会让输出像随机数，而像随机数就意味着冲突遵循生日悖论，只能靠增加位数来压低。',
    c1t: '固定长度指纹', c1b: '任意长输入 → 32 位输出，同输入同输出（第 0 步）。',
    c2t: '雪崩效应', c2b: '改 1 个输入位，输出平均约一半的位变化（第 1 步）。',
    c3t: '冲突不可避免', c3b: '把无限的输入压到有限的格子里，必有冲突；哈希表要处理它（第 2 步）。',
    c4t: '生日悖论与位数', c4b: '冲突在 n ≈ √m 就出现；位数 k 每加 1，冲突概率约减半（第 3、4 步）。',
    modelT: '模型与局限',
    modelB: '页面用的哈希是教学用的 FNV-1a + 一步混合，不是加密哈希；概率估计假设输出均匀随机。本页不涉及抗碰撞攻击、加盐、密码存储和加密哈希的安全性。第 3 步的精确概率公式是精确的，第 4 步的指数公式是近似。',
    linksT: '想从别处继续',
    link1: '数与计数 · 排列组合：生日悖论背后的「配对数 n(n−1)/2」', link2: '熵 · 惊讶标价：k 位指纹最多携带 k 比特的信息', link3: '蒙特卡洛 · 比例即概率：用大量随机实验估计概率',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Hashing · Squeezing Any Input Into a Fixed Fingerprint', back: '← Knowledge Index', pageTitle: 'Hashing · Squeezing Any Input Into a Fixed Fingerprint',
    tagline: 'Any-length input becomes a fixed-length fingerprint: the avalanche effect, collisions in hash tables, the birthday paradox, and how many bits a fingerprint really needs.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Fingerprint', nav1: '1 Avalanche', nav2: '2 Hash table', nav3: '3 Birthday paradox', nav4: '4 How long', nav5: '5 Finale',
    s0k: 'Step 0 · The fingerprint', s0t: 'How do we squeeze any length of text into a fixed-size fingerprint?',
    s0e: 'This step answers: how does a <strong>hash function</strong> turn input of any length into a fixed-length “fingerprint”? This page uses a teaching 32-bit hash (FNV-1a plus one mixing step; it is <strong>not</strong> a cryptographic hash): the output is always 32 binary digits (0 or 1), whether the input is one character or ten thousand. Type text in the box or press a preset and watch the 32 cells (lit = 1) change. The presets abc and abd differ by a single character, yet the fingerprints look nothing alike. The slider “keep only the last k bits” imitates a shorter fingerprint (hash tables often use h mod 2^k): dimmed bits are discarded and the readout shows the value of the part that is kept. The same input always gives the same output (determinism).',
    s0tL: 'Input text', s0kL: 'Keep only the last k bits', s0p4: 'Clear (empty input)', s0reset: 'Reset', cv0: 'The 32-bit hash fingerprint of the input',
    s0Cap: '{n} bytes → 32-bit fingerprint (dim = dropped)', s0Hex: 'hexadecimal: 0x{h}', s0Low: 'value of the last {k} bits: {v}', s0Dir: 'Same input, same fingerprint; different inputs may share one (step 3)',
    s0ro: '<b>{n}</b>-byte input → fingerprint <b>0x{h}</b> (decimal {d}, {ones} ones); keeping the last {k} bits = <b>{v}</b> (out of {m} possible values).',
    s0term: 'Byte = 8 binary digits; characters such as Chinese take several bytes in UTF-8. mod = the remainder after division.',
    s1k: 'Step 1 · The avalanche effect', s1t: 'Change one bit: how much does the fingerprint change?',
    s1e: 'This step answers: when the input differs in just 1 binary digit, how much does the output differ? A good hash function shows the <strong>avalanche effect</strong>: flipping any 1 input bit flips about half of the 32 output bits. The picture shows a random 8-byte message (64 input bits): the top row is the original fingerprint, the bottom row the fingerprint after flipping bit p, and orange cells are the bits that changed. Drag “bit to flip”; then press “Run statistics”: for 20 new messages every one of the 64 bits is flipped (1280 flips in all) and the number of changed output bits is accumulated into a histogram that should be centred on 16. The more the bars cluster around 16, the better the diffusion.',
    s1pL: 'Bit to flip (0–63)', s1new: 'New message', s1run: 'Run statistics: 1280 flips', s1reset: 'Clear statistics and reset', cv1: 'Fingerprints before and after the flip, and the histogram of changed bits',
    s1A: 'Fingerprint of the original message 0x{h}', s1B: 'After flipping bit {p}: 0x{h} (orange = changed bits)', s1Hist: '{n} flips: bits changed each time (dashed = now)', s1Ax: 'bits changed 0 → 32',
    s1ro: 'Flipping input bit {p} changed <b>{cur}</b> output bit(s). Over {n} flips: on average <b>{mean}</b> bits changed, standard deviation {sd} (an ideal random output gives mean 16, standard deviation about 2.83).',
    s1term: 'The avalanche effect is a property of a good hash, not the same as security: the hash on this page has no attack-resistant design and must not be used for passwords or signatures.',
    s2k: 'Step 2 · The hash table', s2t: 'Use the fingerprint as an address: which slot does a key land in?',
    s2e: 'This step answers: how do we use a hash to store and find things fast? A <strong>hash table</strong> has m slots (buckets) and puts a key into bucket number h(key) mod m. The picture drops keys key-001, key-002, … in one after another: several keys landing in the same bucket is a <strong>collision</strong>, and keys in one bucket are stacked in a column (orange). Drag the number of keys n and the number of buckets m, keeping one fixed, and see how collisions change. The <strong>load factor</strong> α = n / m: the larger α, the more collisions. The readout compares the actual number of occupied buckets with the expected value m·(1 − (1 − 1/m)ⁿ) (the formula assumes a uniformly random hash; this page uses one fixed set of keys, so the two will not match exactly).',
    s2nL: 'Number of keys n', s2mL: 'Number of buckets m', s2reset: 'Reset', cv2: 'The buckets of a hash table and the keys that landed in them',
    s2Cap: '{n} keys → {m} buckets (orange = bucket holds several keys)', s2Ax: 'number in a cell = key number (key-number)',
    s2ro: 'n = <b>{n}</b> keys into m = <b>{m}</b> buckets, load factor α = {a}; {occ} buckets actually occupied versus {eo} expected by the formula; <b>{coll}</b> key(s) share a bucket with an earlier key; the longest bucket holds {mx} key(s).',
    s2term: 'Collision = two different keys assigned to the same bucket; this page handles collisions by stacking keys in one column per bucket.',
    s3k: 'Step 3 · The birthday paradox', s3t: 'Why do collisions arrive earlier than you expect?',
    s3e: 'This step answers: if n things are dropped at random into m slots, how big must n be before two almost surely collide? The classic example is birthdays: with m = 365, just n = 23 people give about a 50% chance that two share a birthday, because what is compared is not “each person against 365 days” but n(n−1)/2 pairs of people. <strong>Exact probability</strong>: P(at least one collision) = 1 − (1 − 1/m)(1 − 2/m)…(1 − (n−1)/m). Choose an m, drag n, then press “1 / 100 / 1000 experiments”: each experiment drops n items at random and checks for a collision; the orange line is the fraction of experiments so far that had a collision and the green dashed line is the exact probability, which the orange line approaches as experiments accumulate. The probability is about 50% when n ≈ 1.18·√m. Dragging n or changing m clears the experiments done so far.',
    s3nL: 'Number dropped n', s3m0: 'm = 365 (birthdays)', s3m1: 'm = 65536 = 2¹⁶', s3m2: 'm = 2³² ≈ 4.3 billion', s3r1: 'Run 1 experiment', s3r100: 'Run 100', s3r1000: 'Run 1000', s3reset: 'Clear experiments and reset', cv3: 'Experimental fraction and exact probability for the birthday paradox',
    s3Cap: 'n = {n} dropped into m = {m} slots', s3Ax: 'experiments → {n}', s3Leg: 'orange = observed, green dashed = exact', s3Curve: 'Exact probability against n (n: 0 → 100)',
    s3ro: 'n = <b>{n}</b>, m = {m}: exact probability <b>{ex}</b>; {trials} experiments done, fraction with a collision <b>{emp}</b> (± {se}); the probability reaches 50% around n ≈ {n50}.',
    s3term: 'Experiments use a fixed random seed; ± is the standard error √(p(1−p)/count). For very large m the curve hugs 0 within n ≤ 100, so read the 50% point from the readout.',
    s4k: 'Step 4 · How long a fingerprint', s4t: 'How many bits does a fingerprint need to avoid collisions?',
    s4e: 'This step answers: when fingerprinting a huge number of files, how long must the fingerprint be to almost never collide? Assume the hash output behaves like a uniformly random k-bit number; then n objects have at least one collision with probability about 1 − e^(−n(n−1)/2^(k+1)) (about n(n−1)/2^(k+1) when small). The vertical axis is the logarithm of the collision probability (1e-6 = one in a million) and the horizontal axis the fingerprint length k. Drag n (as a power of 10) and k: with n fixed, every extra bit of k roughly halves the probability; the readout also tells you roughly how many bits push it below one in a million. A 32-bit fingerprint almost surely collides at a million objects, and only around 128 bits can collisions be treated as “never happens”.',
    s4xL: 'Number of objects n (power of 10)', s4kL: 'Fingerprint length k', s4reset: 'Reset', cv4: 'Collision probability against fingerprint length',
    s4Cap: 'Collision probability for n = 10^{x} objects', s4Ax: 'fingerprint length k: 8 → 128', s4Leg: 'vertical axis = collision probability (log, floor 1e-30)',
    s4ro: 'n = <b>{n}</b>, k = <b>{k}</b> bits: collision probability about <b>{p}</b>; about {need} bits push it below one in a million.',
    s4term: 'Assumes hash outputs that are uniformly random and independent; real hashes (especially non-cryptographic ones) can be biased and an attacker may craft collisions deliberately, which this page does not cover.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: fixed-size fingerprints cannot avoid collisions',
    s5e: 'A hash squeezes any input into a fixed-length fingerprint: a good hash makes the output look random, and looking random means collisions follow the birthday paradox and can only be pushed down by adding bits.',
    c1t: 'Fixed-length fingerprint', c1b: 'Any-length input → 32-bit output; the same input gives the same output (step 0).',
    c2t: 'Avalanche effect', c2b: 'Changing 1 input bit changes about half of the output bits (step 1).',
    c3t: 'Collisions are unavoidable', c3b: 'Squeezing unlimited inputs into finite slots must collide; hash tables have to handle it (step 2).',
    c4t: 'Birthday paradox and bits', c4b: 'Collisions appear around n ≈ √m; every extra bit k roughly halves the probability (steps 3 and 4).',
    modelT: 'Model and limits',
    modelB: 'The hash used here is a teaching FNV-1a plus one mixing step, not a cryptographic hash; the probability estimates assume uniformly random output. This page does not cover collision attacks, salting, password storage or the security of cryptographic hashes. The probability formula in step 3 is exact; the exponential formula in step 4 is an approximation.',
    linksT: 'Continue elsewhere',
    link1: 'Numbers and counting · combinatorics: the “n(n−1)/2 pairs” behind the birthday paradox', link2: 'Entropy · pricing surprise: a k-bit fingerprint carries at most k bits of information', link3: 'Monte Carlo · proportion is probability: estimating a probability from many random experiments',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result'
  }
};
let currentLang = 'en';
function t(key, vars = {}) { let out = (STR[currentLang] && STR[currentLang][key]) || key; return out.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''); }
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (_) {}
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { b.classList.toggle('active', b.dataset.lang === currentLang); b.setAttribute('aria-pressed', b.dataset.lang === currentLang ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (_) {}
  setLang(saved === 'zh' || saved === 'en' ? saved : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
