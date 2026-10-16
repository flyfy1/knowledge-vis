'use strict';
/* ============================================================
   熵讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值；
     动态状态只存数据，文本由状态现算，切语言按 i18n 键重渲染、不丢状态。
   ============================================================ */
const STR = {
  zh: {
    docTitle: '熵 · 惊讶的平均值 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '熵',
    tagline: '熵是「平均的惊讶」：越意外的事，发生时带来的信息量越大；熵把一个随机源的整体不确定性压成一个数。它是压缩的绝对极限、机器学习损失函数的老祖宗，还与热力学的熵同源同式。这一页从猜符号游戏开始，让你亲手把这把秤造出来、用它称密码、称模型、称宇宙。',
    nav0: '0 钩子', nav1: '1 惊讶标价', nav2: '2 熵工坊', nav3: '3 二元熵与二十问',
    nav4: '4 哈夫曼编码', nav5: '5 交叉熵与 KL', nav6: '6 熵的版图',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 熵 Entropy —— 一步一交互系列',
    reset: '重置', newSeed: '换一颗种子', dash: '—',

    /* ---------- 第 0 步 ---------- */
    s0k: '第 0 步 · 钩子',
    s0t: '猜下一个符号',
    s0e: '两台符号机，都只会吐 A、B、C、D 四个符号。<strong>甲机</strong>极偏：七成时候是 A；<strong>乙机</strong>均匀：四个符号各 25%。先猜再揭晓，给自己计分——你会发现甲机的成绩天然好打，乙机怎么猜都只有四分之一的命。这不是运气，这是两个源的「可预测性」不同。而可预测性，是可以称重的。',
    machA: '甲机 · 极偏（A 占 70%）',
    machB: '乙机 · 均匀（各 25%）',
    guessLab: '猜下一个是：',
    draw10: '连出 10 个',
    s0ro: '已猜 <span>{n}</span> 次 · 猜中 <span>{hits}</span> 次 · 命中率 <span>{rate}</span> · 最近一个：<span>{last}</span>',
    s0ro0: '还没开始猜——点上面任一符号按钮，先猜再揭晓。',
    s0hit: '✓ 猜中',
    s0miss: '✗ 不是',
    s0H: '两个源的熵先揭晓数字：甲机 H ≈ <span>{hA} bits/符号</span> · 乙机 H = <span>{hB} bits/符号</span>。熵越小的源越好猜——公式在第 2 步亲手算。',
    s0hint: '小窍门：甲机永远猜 A，长期命中率就是 70%——「最优猜法」永远是猜概率最大的那个符号。乙机没有这个窍门，因为它每个符号一样「意外」。',

    /* ---------- 第 1 步 ---------- */
    s1k: '第 1 步 · 惊讶的标价',
    s1t: 'I = −log₂ p：意外是有价的',
    s1e: '先给单个事件标价。一件事发生的概率是 p，它真发生时你收获的「惊讶」记为 I。标价要满足两条直觉：<strong>越罕见越惊讶</strong>（p 越小 I 越大，p = 1 时 I = 0）；且在「越罕见越惊讶」这个前提下，能让独立事件的惊讶<strong>相加</strong>的标价只有一种可能——对数（为什么见本步下半）。拖动滑杆，看标价怎么随 p 变。',
    pLab: '事件概率 p（对数刻度）',
    pOne: 'p = 1（必然发生）',
    pHalf: 'p = 1/2',
    s1ro: 'p = <span>{p}</span>（{frac}）· 惊讶 I = −log₂ p = <span>{I} bits</span>',
    cSurpY: '惊讶 I（bits）',
    cSurpBar: '这个事件的惊讶',
    s1sub: '为什么必须是对数？',
    s1e2: '关键要求是<strong>可加性</strong>：两件独立的事同时发生，总惊讶应该等于各自惊讶之和。一枚硬币「正面」的惊讶记 1 份；「两枚同时正面」是 p = 1/4 的事件，它的惊讶必须是 2 份——不多不少。再加码：「四个硬币全正面」是 p = 1/16，可以看成两个独立的「双正面」事件（各 p = 1/4），总惊讶必须是 2 + 2 = 4 份。下面两行账都是页面现算的：对数标价永远对得上，别的标价（比如 1/p）当场穿帮——这正是 I 必须取 −log p 的原因（在单调性假设下，对数是唯一满足可加性的标价）。',
    flipBtn: '掷四枚硬币（等一次「全正面」）',
    s1add: '对数标价：I(1/4) + I(1/4) = {a} + {a} = <span>{s} bits</span>，而 I(1/16) = <span>{j} bits</span> —— <span class="good">相等 ✓</span><br>若按 1/p 标价：{pa} + {pa} = {ps}，而联合事件标价 {pj} —— <span class="bad">{ps} ≠ {pj} ✗</span>',
    s1flip0: '还没掷。点上面的按钮，一次掷四枚，看「全正面」多久来一次。',
    s1flip: '已掷 <span>{n}</span> 组四连掷 · 「全正面」出现 <span>{hits}</span> 次（理论概率 1/16 ≈ 6.25%，长 run 频率会贴过去，短 run 波动大是正常的）· 每次出现交出 I = 4 bits 惊讶 = 两个「双正面」各 2 bits 之和 · 种子 {seed}',
    s1hint: '锚点记三个就够：p = 1/2 → 1 bit，p = 1/8 → 3 bits，p = 1 → 0。「bit」这个单位就是这么来的：一次公平硬币的惊讶，就是 1 个单位。',

    /* ---------- 第 2 步 ---------- */
    s2k: '第 2 步 · 熵',
    s2t: '熵工坊：把惊讶平均一下',
    s2e: '单个事件的惊讶会忽大忽小，但一个源发成千上万个符号后，<strong>平均每个符号交出的惊讶会稳定在一个数上</strong>——这个数就是熵 H：把每个符号的惊讶 I = −log₂ p 按它出现的概率加权平均。下面拖滑杆造你自己的分布（权重自动归一化），再开发射器亲眼看平均值贴向 H。约定：p = 0 的符号在求和里按 0·log 0 = 0 计（取极限），它永不出现、也不贡献惊讶。',
    wLab: '权重',
    preSkew: '预设：偏态 50/25/15/10',
    preUni: '预设：均匀（H 最大）',
    preOne: '预设：几乎单一（H 最小）',
    preSharp: '极偏 70/10/10/10',
    preDyadic2: '1/2, 1/4, 1/8, 1/8',
    sample1: '采样 1 个',
    sample20: '采样 20 个',
    sampleRun: '连发采样',
    sampleStop: '停',
    resetSamples: '重置采样',
    cDistT: '当前分布（柱高 = 概率，柱顶数字 = 该符号的惊讶 I）',
    cRunT: '运行平均惊讶 → H（纵轴按已见运行均值的最大值自动扩程，曲线不出框）',
    cHLine: 'H（理论）',
    cEmpLine: '经验平均',
    s2ro: '分布 p = [{p}] · 熵 H = <span>{H} bits/符号</span> · 已采样 <span>{n}</span> 个 · 经验平均惊讶 <span>{emp}</span> · 与 H 相差 <span>{diff}</span>（理论标准误约 σ<sub>I</sub>/√n = {se}）· 种子 {seed}',
    s2ro0: '分布 p = [{p}] · 熵 H = <span>{H} bits/符号</span> · 还没采样——点「采样」看平均惊讶怎么贴向 H · 种子 {seed}',
    s2hint: '均匀分布时 H = 2 bits 达到四符号的最大值：每个符号都一样意外，没法不惊讶。把分布压到几乎单一，H 贴近 0：源几乎没悬念。采样曲线早期会乱跳，样本越多越贴线——这是大数定律在干活（中心极限页的主角）。',

    /* ---------- 第 3 步 ---------- */
    s3k: '第 3 步 · 二元熵与二十问',
    s3t: '一枚硬币的驼峰，与问题的下限',
    s3e: '只有两个结果的源（抛硬币），熵是正面概率 p 的函数 H(p)，画出来是著名的<strong>驼峰</strong>：p = 0.5 时峰顶 1 bit，越偏向必然，熵越贴近 0。拖动 p，让点在曲线上走。',
    pLab3: '正面概率 p',
    s3ro: 'p = <span>{p}</span> · H(p) = <span>{H} bits</span>（p = 0.5 时最大，恰 1 bit；p → 0 或 1 时归 0）',
    cCurveT: '二元熵 H(p)',
    cPeak: '峰顶：p = 0.5，H = 1 bit',
    s3sub: '二十问：猜 1–8 里的一个数',
    s3e2: '「二十问」游戏的本质是：每次问一个是非题，尽量快地定位答案。猜 1–8 的一个数、八个数等可能时，这个源的熵是 log₂8 = <strong>3 bits</strong>，所以任何问法平均至少需要 3 问——而<strong>二分法</strong>（每次问「它 ≤ 中点吗」，把范围砍半）恰好每数都用 3 问，摸到了下限。下面选一个心里数，两种问法各跑一遍，账都是按决策树的深度现算的。',
    qTarget: '心里数：',
    qRand: '随机选一个',
    qBinBtn: '用二分法问',
    qSeqBtn: '用逐个问',
    qAskLe: '第 {i} 问：它 ≤ {mid} 吗？→ {ans}',
    qAskEq: '第 {i} 问：它是 {k} 吗？→ {ans}',
    qYes: '是', qNo: '否',
    qDeduce: '前 {i} 问全「否」——不用再问，它只能是 {n}（排除法）',
    qFound: '🎯 找到 {n}，共问了 <span>{c}</span> 次。',
    qIdle: '先选一个心里数，再点一种问法，看提问记录。',
    treeT: '二分决策树（每个叶子 = 一个数，深度都是 3）',
    nodeQ: '≤ {mid}？',
    s3dro: '二分法：每数问数 [{bd}]，平均 <span>{bm}</span> 问 = H = log₂8 = 3 bits（摸到下限 ✓）· 逐个问：每数问数 [{sd}]，平均 <span>{sm}</span> 问 &gt; H（问法笨，多花的 {extra} 问是浪费）',
    s3hint: '为什么平均问数不能低于 H？每个是非题最多切掉一半可能性，信息量至多 1 bit；要交出 H bits 的信息定位答案，平均至少得问 H 次——这和第 4 步「平均码长 ≥ H」是同一堵墙的两种说法。',

    /* ---------- 第 4 步 ---------- */
    s4k: '第 4 步 · 哈夫曼编码',
    s4t: '哈夫曼：亲手摸到极限',
    s4e: '给符号编二进制码字：高频符号给短码、低频给长码，平均码长能压多低？香农说下限是 H。1952 年哈夫曼给出一个贪心算法能摸到这堵墙上方不到 1 bit 的地方：<strong>反复把概率最小的两个节点合并成一个新节点</strong>，长成一棵树，叶子到根的路径就是码字。下面一步步把树长出来。',
    s4src: '分布与第 2 步工坊<strong>共享</strong>：在上面第 2 步改滑杆，回到这里树会按新分布重建；下面预设也直接改第 2 步的分布。',
    preDyadic: '预设：1/2, 1/4, 1/8, 1/8（L 恰好 = H）',
    hPrev: '← 上一步',
    hNext: '下一步 →',
    hPlay: '自动播放',
    hPause: '暂停',
    cTreeT: '哈夫曼合并过程（当前步高亮的两个节点即将合并）',
    s4step: '第 {k}/{total} 步：{desc}',
    s4stepInit: '初始：{n} 个叶子节点（每个符号一个）',
    s4stepMerge: '合并 {a}（{pa}）与 {b}（{pb}）→ 新节点 {ab}（{pab}）',
    s4stepDone: '完成：树已长成，码字见下方读数',
    s4ro: '熵 H = <span>{H} bits</span> · 哈夫曼平均码长 L = <span>{L} bits/符号</span> · 定长编码（{n} 个会出现的符号一律 {fixed} bits）：<span>{fixed} bits/符号</span> · 每符号省下 {save} bits',
    s4bound: '界检验：H = {H} ≤ L = {L} &lt; H + 1 = {H1} ✓（香农源编码定理：任何无前缀码 L ≥ H，哈夫曼保证 L &lt; H + 1；此 ✓ 由页面按实测 H 与 L 现场判定，不是印好的）',
    s4boundBad: '界检验：H = {H}，L = {L}，H + 1 = {H1} —— <span class="bad">没有落在 [H, H+1) 内 ✗</span>（按香农源编码定理这不该发生；若你看到这一行，是页面出了 bug，请记下这个分布）',
    s4degen: '注意：分布只剩<strong>一个可能的结果</strong>时，哈夫曼树退化为单个叶子——这个符号的码字是<strong>空串</strong>（长 0），L = 0 = H：结果毫无悬念，传达它不需要任何比特，香农的界在这里恰好取等。其余 p = 0 的符号永不出现，已在构树前剔除。',
    s4codesT: '码字表（码长 = 树深）：',
    s4codeLine: '{s}：p = {p}，码字 <span>{code}</span>（长 {len}）',
    s4codeZero: '{s}：p = 0 —— 不参与编码：它永不出现，不需要码字（也不计入 L）',
    s4codeEmpty: '{s}：p = {p}，码字 <span>（空串）</span>（长 0）—— 唯一可能的结果，不用任何比特就能传达',
    msgLab: '给这条消息编码：',
    encodeBtn: '编码',
    s4mro: '消息 {msg}（{n} 个符号）→ <span>{bits}</span> · 共 <span>{count} bits</span> · 实测平均 {emp} bits/符号（期望 = n × L = {exp} bits；单条消息的实测会上下浮动，长期平均才贴 L）',
    s4mro0: '选一条消息、点「编码」，看它变成多长的比特串。',
    s4mroBad: '这条消息里含有 p = 0 的符号——按当前分布它永不出现，码表里没有它的码字，编不出诚实的比特串。换一条消息，或回第 2 步给它一点概率。',
    s4tie: '<strong>并列取舍规则</strong>（影响树的形状、不影响界）：权重相等时，先进入名单的节点先合并——叶子按 A→D 排，内部节点按生成先后排。换一条规则可能长出另一棵树、另一组 L，但任何哈夫曼树都必须落在 [H, H+1) 里，评审换规则自构树也只能落在这个区间。',
    s4hint: '试试预设 1/2, 1/4, 1/8, 1/8：L 与 H 小数点后三位完全重合——当每个概率都是 1/2 的幂时，哈夫曼恰好严丝合缝地摸到 H。再试均匀分布：L = 2 = H，定长编码本来就是最优的。',

    /* ---------- 第 5 步 ---------- */
    s5k: '第 5 步 · 交叉熵与 KL 散度',
    s5t: '模型错得有多贵',
    s5e: '真实世界按分布 p 发符号，你的模型却以为世界是 q。用 q 的账本给 p 的数据标价，平均惊讶变成<strong>交叉熵</strong> H(p, q)；它比真熵 H(p) 多出的部分，就是模型错付的代价——<strong>KL 散度</strong>。三者关系一句话：H(p, q) = H(p) + KL(p‖q)。拖动 q 的滑杆，看代价怎么涨落。',
    pLab5: '真实分布 p',
    qLab5: '你的模型 q',
    qCopyBtn: '让 q = p（模型完美）',
    swapBtn: '交换 p ↔ q',
    smoothLab: '平滑 q：q′ = 0.99·q + 0.01·均匀（ε = 0.01）',
    cBarsT: 'p（青）与 q（橙）逐符号对照',
    lgP: '真实 p', lgQ: '模型 q', lgQS: '模型 q（已平滑）',
    s5ro: 'H(p) = <span>{Hp} bits</span> · 交叉熵 H(p, q) = <span>{Hpq} bits</span> · KL(p‖q) = <span>{KL} bits</span> · 分解核对：H(p) + KL = {sum}（残差 {res}）· 反方向 KL(q‖p) = <span>{KLr} bits</span> —— 两个方向不一样：KL 不是距离，是「用错账本的代价」，方向就是账本的方向',
    s5roInf: 'H(p) = <span>{Hp} bits</span> · 交叉熵 H(p, q) = <span>+∞</span> · KL(p‖q) = <span>+∞</span> · 反方向 KL(q‖p) = <span>{KLr} bits</span>（有限——方向反过来账就算得出来，这正是 KL 不对称最极端的样子）',
    s5roSmooth: '（已平滑）H(p) = <span>{Hp} bits</span> · 交叉熵 H(p, q′) = <span>{Hpq} bits</span> · KL(p‖q′) = <span>{KL} bits</span> · 分解核对：H(p) + KL = {sum}（残差 {res}）· 反方向 KL(q′‖p) = <span>{KLr} bits</span> —— 注意：这是平滑后 q′ 的账，不是原 q 的（原 q 是 +∞，见下方警告）',
    s5inf: '⚠ <strong>q 给某个 p 真会发生的符号标了 0。</strong>按 q 的账本，这件事「绝不可能发生」，它一旦发生，惊讶是 +∞——交叉熵与 KL 都是 +∞，页面如实显示 ∞，不拿任何大数糊弄。真实训练里这对应：模型把某个正确类别判了 0 概率，一条样本就能让损失爆表。上面的平滑开关能把 q 每个符号都垫上一点点概率、算出有限的数——但那已经是另一个 q 了，读数会标明「已平滑」。',
    s5foot: '注：KL 按定义恒 ≥ 0（吉布斯不等式）；浮点误差偶尔会算出 −0.000 量级的负数，本页显示时已钳为 0，数学上它就是 0。',
    s5link: '回勾：<a class="fourier-link" href="../gradient-descent/">梯度下降页</a>终章训练分类器时，最小化的正是这里的交叉熵 H(p, q)——标签分布 p 固定，降交叉熵就等于降 KL(p‖q)，等于让模型 q 向真实 p 靠拢。训练里说的「loss」，大半就是这个数。',
    s5hint: '先点「让 q = p」看 KL 归零、交叉熵恰好等于 H(p)；再把 q 的某个滑杆拖到 0（而 p 那边不是 0），看 +∞ 警告；最后交换 p ↔ q，对比两个方向的 KL 数字。',

    /* ---------- 第 6 步 ---------- */
    s6k: '第 6 步 · 终章',
    s6t: '熵的版图：同一把秤',
    s6e: '最后把这把秤拿到三个远房亲戚面前：密码、热力学、压缩软件。它们说的是同一种话——只是单位和常数不同。',
    pwT: '① 密码强度计',
    pwD: '密码从字符集里逐位均匀随机选出时，它的熵就是「长度 × 每位比特数」。破解者没有捷径（均匀随机 = 没有可利用的规律），只能逐个试。',
    lenLab: '密码长度',
    cs10: '纯数字（10）',
    cs26: '小写字母（26）',
    cs62: '大小写+数字（62）',
    cs94: '全部可打印（94）',
    cTimeT: '期望破解时间',
    tSec: '1 秒', tDay: '1 天', tYear: '1 年', tUniv: '宇宙年龄',
    s6ro: '字符集 {size} 种 · 每位 log₂{size} = {per} bits · 总熵 H = <span>{H} bits</span> · 期望尝试 <span>{g}</span> 次 · 期望破解时间 <span>{time}</span>',
    timeSec: '约 {v} 秒',
    timeMin: '约 {v} 分钟',
    timeHour: '约 {v} 小时',
    timeDay: '约 {v} 天',
    timeYear: '约 {v} 年',
    timeUniv: '约 {v} × 宇宙年龄（138 亿年）',
    rateNote: '<strong>口径明示</strong>：期望尝试次数 = 2<sup>H−1</sup>（平均试遍一半空间命中）；速率假设 10<sup>10</sup> 次/秒（离线高速爆破的量级）。前提是密码真随机、人选密码的「熵」远低于这个数——那是另一回事，本卡只称真随机密码。',
    physT: '② 物理熵：一句真话',
    physD: '热力学的熵与信息熵<strong>同式不同单位</strong>，不能说「完全一样」：吉布斯公式 S = −k<sub>B</sub>·Σ p·ln p 用自然对数（单位 nats）、乘玻尔兹曼常数 k<sub>B</sub>，单位是焦耳/开尔文；信息熵用 log<sub>2</sub>、单位 bits——两者只差常数倍 k<sub>B</sub>·ln 2。玻尔兹曼墓碑上的 S = k<sub>B</sub>·ln W 是它的特例：W 个微观状态等概率时，吉布斯式恰好化简成它。物理学家与信息论学家量的确实是同一个「不确定性」，只是换算率不同。',
    compT: '③ 压缩的现实',
    compD: '回到第 4 步：文件能压多小，下限是它的熵。zip 对普通文本还能压，是因为文本的符号分布远没到均匀、熵低于定长编码；对一个<strong>已经压过</strong>的文件再压，几乎压不动——不是软件偷懒，是它的熵已经被摸到了，剩下的比特个个都是「真惊讶」，没有规律可再利用。加密文件同理：好的密文看起来就该像均匀随机数，熵顶满，无从下手。',
    s6fin: '<strong>收束。</strong>从猜符号的游戏，到密码强度与热力学——熵是同一把秤。它量的不是「混乱」这个形容词，而是「平均而言，你有多意外」。概率线到这里收官：<a class="fourier-link" href="../bayes/">贝叶斯</a>讲信念如何更新、<a class="fourier-link" href="../clt/">中心极限</a>讲随机如何收敛成钟形、这一页讲不确定性本身如何被计量。三件事，其实都是在跟随机打交道时，诚实地记账。',
    s6linkIdx: '← 回知识索引'
  },
  en: {
    docTitle: 'Entropy · The Average Surprise · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Entropy',
    tagline: 'Entropy is the average surprise: the rarer an event, the more information its occurrence carries, and entropy compresses a source\'s total uncertainty into a single number. It is the absolute limit of compression, the ancestor of machine-learning loss functions, and the same formula as thermodynamic entropy. This page starts with a guessing game and lets you build the scale yourself — then weigh passwords, models, and the universe with it.',
    nav0: '0 Hook', nav1: '1 Pricing Surprise', nav2: '2 Entropy Workshop', nav3: '3 Binary Entropy & 20 Questions',
    nav4: '4 Huffman Coding', nav5: '5 Cross-Entropy & KL', nav6: '6 The Map of Entropy',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Entropy — one interaction per step',
    reset: 'Reset', newSeed: 'New seed', dash: '—',

    /* ---------- Step 0 ---------- */
    s0k: 'Step 0 · Hook',
    s0t: 'Guess the Next Symbol',
    s0e: 'Two symbol machines, each emitting only A, B, C, D. <strong>Machine A</strong> is heavily skewed: A comes up 70% of the time. <strong>Machine B</strong> is uniform: 25% each. Guess first, then reveal, and keep score — you will find A is naturally easy to score on, while B gives you one chance in four no matter what you do. That is not luck; the two sources differ in predictability. And predictability can be weighed.',
    machA: 'Machine A · Skewed (A = 70%)',
    machB: 'Machine B · Uniform (25% each)',
    guessLab: 'Guess the next one:',
    draw10: 'Draw 10',
    s0ro: 'Guesses <span>{n}</span> · hits <span>{hits}</span> · hit rate <span>{rate}</span> · last one: <span>{last}</span>',
    s0ro0: 'No guesses yet — pick a symbol above; guess first, then it reveals.',
    s0hit: '✓ Hit',
    s0miss: '✗ It was',
    s0H: 'The two entropies, numbers first: Machine A H ≈ <span>{hA} bits/symbol</span> · Machine B H = <span>{hB} bits/symbol</span>. The smaller the entropy, the easier the guessing — the formula is built by hand in Step 2.',
    s0hint: 'A trick: on Machine A, always guessing A yields a 70% long-run hit rate — the optimal strategy is always to guess the most probable symbol. Machine B offers no such trick: every symbol is equally surprising.',

    /* ---------- Step 1 ---------- */
    s1k: 'Step 1 · Pricing Surprise',
    s1t: 'I = −log₂ p: Surprise Has a Price',
    s1e: 'First, price a single event. If an event has probability p, the "surprise" you collect when it happens is I. A good price must satisfy two intuitions: <strong>rarer means more surprising</strong> (smaller p, bigger I; p = 1 gives I = 0); and — given that "rarer means more surprising" — exactly one pricing scheme can make the surprises of independent events <strong>add up</strong>: the logarithm (the second half of this step shows why). Drag the slider and watch the price move with p.',
    pLab: 'Event probability p (log scale)',
    pOne: 'p = 1 (certain)',
    pHalf: 'p = 1/2',
    s1ro: 'p = <span>{p}</span> ({frac}) · surprise I = −log₂ p = <span>{I} bits</span>',
    cSurpY: 'Surprise I (bits)',
    cSurpBar: 'Surprise of this event',
    s1sub: 'Why Must It Be a Logarithm?',
    s1e2: 'The key requirement is <strong>additivity</strong>: when two independent events happen together, the total surprise should be the sum of the parts. One coin landing heads is worth 1 unit; "two coins both heads" is a p = 1/4 event and must be worth exactly 2 units. Push further: "four coins all heads" has p = 1/16 and can be seen as two independent "both heads" events (p = 1/4 each), so the total must be 2 + 2 = 4 units. Both ledgers below are computed live by the page: log pricing always balances; any other pricing (say 1/p) is caught red-handed — which is why I must be −log p (under a monotonicity assumption, the logarithm is the unique additive price).',
    flipBtn: 'Flip four coins (wait for "all heads")',
    s1add: 'Log pricing: I(1/4) + I(1/4) = {a} + {a} = <span>{s} bits</span>, and I(1/16) = <span>{j} bits</span> — <span class="good">equal ✓</span><br>With 1/p pricing: {pa} + {pa} = {ps}, but the joint event is priced {pj} — <span class="bad">{ps} ≠ {pj} ✗</span>',
    s1flip0: 'Not flipped yet. Press the button to flip four coins at a time and see how long "all heads" takes.',
    s1flip: 'Flipped <span>{n}</span> groups of four · "all heads" appeared <span>{hits}</span> times (theoretical probability 1/16 ≈ 6.25%; the frequency settles toward it over long runs, short runs fluctuate — that is normal) · each appearance pays I = 4 bits of surprise = two "both heads" worth 2 bits each · seed {seed}',
    s1hint: 'Three anchors are enough: p = 1/2 → 1 bit, p = 1/8 → 3 bits, p = 1 → 0. This is where the unit "bit" comes from: the surprise of one fair coin flip is exactly one unit.',

    /* ---------- Step 2 ---------- */
    s2k: 'Step 2 · Entropy',
    s2t: 'The Entropy Workshop: Average the Surprise',
    s2e: 'A single event\'s surprise jumps around, but after a source emits thousands of symbols, the <strong>average surprise per symbol settles onto one number</strong> — the entropy H: each symbol\'s surprise I = −log₂ p weighted by its own probability. Drag the sliders to build your own distribution (weights auto-normalize), then fire the emitter and watch the average hug H. Convention: a symbol with p = 0 contributes 0·log 0 = 0 (the limit) — it never appears and adds no surprise.',
    wLab: 'weight',
    preSkew: 'Preset: skewed 50/25/15/10',
    preUni: 'Preset: uniform (max H)',
    preOne: 'Preset: nearly single (min H)',
    preSharp: 'Skewed 70/10/10/10',
    preDyadic2: '1/2, 1/4, 1/8, 1/8',
    sample1: 'Sample 1',
    sample20: 'Sample 20',
    sampleRun: 'Auto-sample',
    sampleStop: 'Stop',
    resetSamples: 'Reset samples',
    cDistT: 'Distribution (bar = probability, top number = surprise I)',
    cRunT: 'Running average surprise → H (y-axis auto-expands to the largest running average seen)',
    cHLine: 'H (theory)',
    cEmpLine: 'empirical average',
    s2ro: 'Distribution p = [{p}] · entropy H = <span>{H} bits/symbol</span> · sampled <span>{n}</span> · empirical average surprise <span>{emp}</span> · difference from H <span>{diff}</span> (theoretical standard error ≈ σ<sub>I</sub>/√n = {se}) · seed {seed}',
    s2ro0: 'Distribution p = [{p}] · entropy H = <span>{H} bits/symbol</span> · no samples yet — press "Sample" and watch the average surprise hug H · seed {seed}',
    s2hint: 'The uniform distribution gives H = 2 bits, the maximum for four symbols: every symbol is equally surprising, so you cannot help being surprised. Squash the distribution to nearly a single symbol and H nears 0: the source has almost no suspense. The sampling curve jitters early and hugs the line as samples pile up — the law of large numbers at work (the star of the Central Limit Theorem page).',

    /* ---------- Step 3 ---------- */
    s3k: 'Step 3 · Binary Entropy & Twenty Questions',
    s3t: 'A Coin\'s Hump, and the Floor on Questions',
    s3e: 'For a two-outcome source (a coin flip), entropy is a function H(p) of the heads probability p, and its graph is the famous <strong>hump</strong>: the peak is exactly 1 bit at p = 0.5, and it falls to 0 as the outcome becomes certain. Drag p and ride the curve.',
    pLab3: 'Heads probability p',
    s3ro: 'p = <span>{p}</span> · H(p) = <span>{H} bits</span> (maximum at p = 0.5, exactly 1 bit; → 0 as p → 0 or 1)',
    cCurveT: 'Binary entropy H(p)',
    cPeak: 'Peak: p = 0.5, H = 1 bit',
    s3sub: 'Twenty Questions: Guess a Number from 1–8',
    s3e2: 'The game of twenty questions is, at heart: ask yes/no questions to locate the answer as fast as possible. Guessing one of 1–8, all equally likely, the source entropy is log₂8 = <strong>3 bits</strong>, so any strategy needs at least 3 questions on average — and <strong>binary search</strong> (ask "is it ≤ the midpoint?", halving the range) uses exactly 3 for every number, hitting the floor. Pick a secret number below and run both strategies; the accounts are computed from the decision tree\'s depths.',
    qTarget: 'Secret number:',
    qRand: 'Pick randomly',
    qBinBtn: 'Ask by binary search',
    qSeqBtn: 'Ask one by one',
    qAskLe: 'Q{i}: is it ≤ {mid}? → {ans}',
    qAskEq: 'Q{i}: is it {k}? → {ans}',
    qYes: 'yes', qNo: 'no',
    qDeduce: 'The first {i} answers are all "no" — no need to ask: it can only be {n} (elimination)',
    qFound: '🎯 Found {n} in <span>{c}</span> questions.',
    qIdle: 'Pick a secret number, then choose a strategy to see the question log.',
    treeT: 'Binary decision tree (all leaves at depth 3)',
    nodeQ: '≤ {mid}?',
    s3dro: 'Binary search: questions per number [{bd}], average <span>{bm}</span> = H = log₂8 = 3 bits (hits the floor ✓) · One by one: questions per number [{sd}], average <span>{sm}</span> &gt; H (a clumsy strategy — the extra {extra} questions are waste)',
    s3hint: 'Why can\'t the average beat H? Each yes/no question rules out at most half the possibilities, carrying at most 1 bit; locating an answer worth H bits of information takes at least H questions on average. This is the same wall as "average code length ≥ H" in Step 4, stated two ways.',

    /* ---------- Step 4 ---------- */
    s4k: 'Step 4 · Huffman Coding',
    s4t: 'Huffman: Touching the Limit by Hand',
    s4e: 'Assign binary codewords to symbols: frequent symbols get short codes, rare ones long codes. How low can the average code length go? Shannon says the floor is H. In 1952 Huffman published a greedy algorithm that lands within 1 bit above that wall: <strong>repeatedly merge the two least probable nodes into one</strong>, growing a tree whose root-to-leaf paths are the codewords. Grow the tree step by step below.',
    s4src: 'The distribution is <strong>shared with the Step 2 workshop</strong>: change the sliders in Step 2 above and the tree here rebuilds for the new distribution; the presets below also set the Step 2 distribution.',
    preDyadic: 'Preset: 1/2, 1/4, 1/8, 1/8 (L exactly = H)',
    hPrev: '← Previous step',
    hNext: 'Next step →',
    hPlay: 'Auto-play',
    hPause: 'Pause',
    cTreeT: 'Huffman merging (highlighted pair merges next)',
    s4step: 'Step {k}/{total}: {desc}',
    s4stepInit: 'Start: {n} leaf nodes (one per symbol)',
    s4stepMerge: 'Merge {a} ({pa}) with {b} ({pb}) → new node {ab} ({pab})',
    s4stepDone: 'Done: the tree is grown; codewords in the readout below',
    s4ro: 'Entropy H = <span>{H} bits</span> · Huffman average code length L = <span>{L} bits/symbol</span> · fixed-length code ({fixed} bits for each of the {n} symbols that can occur): <span>{fixed} bits/symbol</span> · saves {save} bits per symbol',
    s4bound: 'Bound check: H = {H} ≤ L = {L} &lt; H + 1 = {H1} ✓ (Shannon\'s source coding theorem: every prefix code has L ≥ H; Huffman guarantees L &lt; H + 1 — and this ✓ is decided live from the measured H and L, not printed in advance)',
    s4boundBad: 'Bound check: H = {H}, L = {L}, H + 1 = {H1} — <span class="bad">outside [H, H+1) ✗</span> (Shannon\'s source coding theorem says this cannot happen; if you see this line, the page has a bug — please note the distribution)',
    s4degen: 'Note: with only <strong>one possible outcome</strong> left, the Huffman tree degenerates to a single leaf — that symbol\'s codeword is the <strong>empty string</strong> (length 0), so L = 0 = H: the outcome holds no suspense and takes no bits at all to convey, and Shannon\'s bound is met with equality. The p = 0 symbols never occur and are excluded before the tree is built.',
    s4codesT: 'Codeword table (code length = tree depth):',
    s4codeLine: '{s}: p = {p}, codeword <span>{code}</span> (length {len})',
    s4codeZero: '{s}: p = 0 — excluded from the code: it never occurs, needs no codeword (and contributes nothing to L)',
    s4codeEmpty: '{s}: p = {p}, codeword <span>(empty string)</span> (length 0) — the only possible outcome takes no bits at all to convey',
    msgLab: 'Encode this message:',
    encodeBtn: 'Encode',
    s4mro: 'Message {msg} ({n} symbols) → <span>{bits}</span> · total <span>{count} bits</span> · measured average {emp} bits/symbol (expectation = n × L = {exp} bits; a single message fluctuates, only the long-run average settles on L)',
    s4mro0: 'Pick a message and press "Encode" to see how long a bit string it becomes.',
    s4mroBad: 'This message contains a symbol with p = 0 — under the current distribution it never occurs, the code table has no codeword for it, and no honest bit string exists. Pick another message, or give it some probability back in Step 2.',
    s4tie: '<strong>Tie-breaking rule</strong> (affects the tree\'s shape, never the bound): among equal weights, the node that entered the list earlier merges first — leaves ordered A→D, internal nodes by creation order. A different rule may grow a different tree and a different L, but every Huffman tree must land in [H, H+1); a reviewer rebuilding the tree with another rule lands in the same interval.',
    s4hint: 'Try the preset 1/2, 1/4, 1/8, 1/8: L and H agree to three decimals — when every probability is a power of 1/2, Huffman fits H exactly, with no slack. Then try uniform: L = 2 = H, and the fixed-length code was optimal all along.',

    /* ---------- Step 5 ---------- */
    s5k: 'Step 5 · Cross-Entropy & KL Divergence',
    s5t: 'How Expensive Is a Wrong Model?',
    s5e: 'The real world emits symbols by distribution p, but your model believes the world is q. Price p\'s data with q\'s ledger and the average surprise becomes the <strong>cross-entropy</strong> H(p, q); the excess over the true entropy H(p) is the price of being wrong — the <strong>KL divergence</strong>. One line ties them together: H(p, q) = H(p) + KL(p‖q). Drag q\'s sliders and watch the price move.',
    pLab5: 'True distribution p',
    qLab5: 'Your model q',
    qCopyBtn: 'Set q = p (perfect model)',
    swapBtn: 'Swap p ↔ q',
    smoothLab: 'Smooth q: q′ = 0.99·q + 0.01·uniform (ε = 0.01)',
    cBarsT: 'p (cyan) vs q (orange), symbol by symbol',
    lgP: 'true p', lgQ: 'model q', lgQS: 'model q (smoothed)',
    s5ro: 'H(p) = <span>{Hp} bits</span> · cross-entropy H(p, q) = <span>{Hpq} bits</span> · KL(p‖q) = <span>{KL} bits</span> · decomposition check: H(p) + KL = {sum} (residual {res}) · reverse direction KL(q‖p) = <span>{KLr} bits</span> — the two directions differ: KL is not a distance, it is the price of the wrong ledger, and a price has a direction',
    s5roInf: 'H(p) = <span>{Hp} bits</span> · cross-entropy H(p, q) = <span>+∞</span> · KL(p‖q) = <span>+∞</span> · reverse KL(q‖p) = <span>{KLr} bits</span> (finite — reverse the direction and the ledger balances again: KL asymmetry in its most extreme form)',
    s5roSmooth: '(smoothed) H(p) = <span>{Hp} bits</span> · cross-entropy H(p, q′) = <span>{Hpq} bits</span> · KL(p‖q′) = <span>{KL} bits</span> · decomposition check: H(p) + KL = {sum} (residual {res}) · reverse KL(q′‖p) = <span>{KLr} bits</span> — note: this is the ledger of the smoothed q′, not of the original q (the original is +∞; see the warning below)',
    s5inf: '⚠ <strong>q assigns 0 to a symbol that p can actually emit.</strong> In q\'s ledger that event "cannot happen"; when it does, the surprise is +∞ — cross-entropy and KL are both +∞, and the page shows ∞ honestly rather than hiding behind a big number. In real training this is a model giving probability 0 to a correct class: a single sample blows the loss to infinity. The smoothing toggle above pads every symbol of q with a little probability and yields finite numbers — but that is a different q, and the readout says "smoothed".',
    s5foot: 'Note: KL is always ≥ 0 by definition (Gibbs\' inequality); floating-point arithmetic occasionally produces a negative value around −0.000, which this page clamps to 0 for display — mathematically it is 0.',
    s5link: 'Callback: the <a class="fourier-link" href="../gradient-descent/">Gradient Descent page</a> ends by training a classifier, and what it minimizes is exactly this cross-entropy H(p, q) — with the label distribution p fixed, lowering cross-entropy is the same as lowering KL(p‖q), i.e. pulling the model q toward the truth p. Most of what training calls "loss" is this number.',
    s5hint: 'First press "Set q = p" and watch KL vanish and cross-entropy equal H(p) exactly. Then drag one of q\'s sliders to 0 where p is not 0, and watch the +∞ warning. Finally swap p ↔ q and compare the two KL directions.',

    /* ---------- Step 6 ---------- */
    s6k: 'Step 6 · Finale',
    s6t: 'The Map of Entropy: One Scale',
    s6e: 'Finally, hold this scale up to three distant relatives: passwords, thermodynamics, and compression software. They all speak the same language — only the units and constants differ.',
    pwT: '① Password Strength Meter',
    pwD: 'When a password is drawn uniformly at random, character by character, its entropy is "length × bits per character". An attacker has no shortcut (uniform randomness leaves no pattern to exploit) and can only try candidates one by one.',
    lenLab: 'Password length',
    cs10: 'Digits only (10)',
    cs26: 'Lowercase (26)',
    cs62: 'Letters+digits (62)',
    cs94: 'All printable (94)',
    cTimeT: 'Expected cracking time',
    tSec: '1 sec', tDay: '1 day', tYear: '1 year', tUniv: 'Age of universe',
    s6ro: 'Alphabet of {size} · log₂{size} = {per} bits per character · total entropy H = <span>{H} bits</span> · expected guesses <span>{g}</span> · expected cracking time <span>{time}</span>',
    timeSec: 'about {v} seconds',
    timeMin: 'about {v} minutes',
    timeHour: 'about {v} hours',
    timeDay: 'about {v} days',
    timeYear: 'about {v} years',
    timeUniv: 'about {v} × the age of the universe (13.8 billion years)',
    rateNote: '<strong>Conventions, stated openly</strong>: expected guesses = 2<sup>H−1</sup> (on average you search half the space); assumed rate 10<sup>10</sup> guesses/second (fast offline cracking territory). This assumes a truly random password — human-chosen passwords have far less entropy than this, which is a different story; this card weighs only truly random ones.',
    physT: '② Physical Entropy: One True Sentence',
    physD: 'Thermodynamic and information entropy are <strong>the same formula in different units</strong> — not "exactly identical": Gibbs\' formula S = −k<sub>B</sub>·Σ p·ln p uses natural logarithms (nats) and multiplies by Boltzmann\'s constant k<sub>B</sub>, giving joules per kelvin; information entropy uses log<sub>2</sub> and bits — the two differ only by the constant factor k<sub>B</sub>·ln 2. Boltzmann\'s tombstone formula S = k<sub>B</sub>·ln W is its special case: when W microstates are equally likely, the Gibbs formula reduces to exactly that. Physicists and information theorists really are measuring the same "uncertainty" — at different exchange rates.',
    compT: '③ The Reality of Compression',
    compD: 'Back to Step 4: how small a file can be compressed is floored by its entropy. Zip still squeezes plain text because text\'s symbol distribution is far from uniform, so its entropy sits below the fixed-length code. Compress an <strong>already-compressed</strong> file again and almost nothing gives — not laziness: its entropy has already been touched, and every remaining bit is "real surprise" with no pattern left to exploit. Encrypted files are the same: good ciphertext should look like uniform random numbers, entropy maxed out, nothing to grab.',
    s6fin: '<strong>To close.</strong> From a guessing game to password strength and thermodynamics, entropy is one scale. It does not measure "disorder" the adjective — it measures "on average, how surprised are you". The probability line closes here: <a class="fourier-link" href="../bayes/">Bayes</a> showed how beliefs update, the <a class="fourier-link" href="../clt/">Central Limit Theorem</a> showed how randomness settles into a bell, and this page showed how uncertainty itself is measured. Three pages, one discipline: keeping honest books when dealing with randomness.',
    s6linkIdx: '← Back to the index'
  }
};

/* ---------- 语言状态 ---------- */
let _lang = null;
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v; // 只认 zh/en 枚举，非法值（如 fr）回退默认推断
  } catch (e) { /* 忽略 */ }
  return null;
}
function saveLang(v) {
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
