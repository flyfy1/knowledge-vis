---
lang: zh
---

::: strings
docTitle: 熵 · 惊讶的平均值 · 一步一交互
back: ← 知识索引
pageTitle: 熵
tagline: 熵是「平均的惊讶」：越意外的事，发生时带来的信息量越大；熵把一个随机源的整体不确定性压成一个数。它是压缩的绝对极限、机器学习损失函数的老祖宗，还与热力学的熵同源同式。这一页从猜符号游戏开始，让你亲手把这把秤造出来、用它称密码、称模型、称宇宙。
foot: visual.integ.life · 熵 Entropy —— 一步一交互系列
reset: 重置
:::

## 猜下一个符号 {#step0 h2=s0t}

::: strings
nav0: 0 钩子
:::

第 0 步 · 钩子 {#s0k .step-kicker i18n=text}

两台符号机，都只会吐 A、B、C、D 四个符号。**甲机**极偏：七成时候是 A；**乙机**均匀：四个符号各 25%。先猜再揭晓，给自己计分——你会发现甲机的成绩天然好打，乙机怎么猜都只有四分之一的命。这不是运气，这是两个源的「可预测性」不同。而可预测性，是可以称重的。 {#s0e .explain}

::: html step0-1
machA: 甲机 · 极偏（A 占 70%）
guessLab: 猜下一个是：
draw10: 连出 10 个
machB: 乙机 · 均匀（各 25%）
:::

小窍门：甲机永远猜 A，长期命中率就是 70%——「最优猜法」永远是猜概率最大的那个符号。乙机没有这个窍门，因为它每个符号一样「意外」。 {#s0hint .hint}

::: html step0-2
start: 开始探索 ↓
:::

::: strings
s0ro: 已猜 <span>{n}</span> 次 · 猜中 <span>{hits}</span> 次 · 命中率 <span>{rate}</span> · 最近一个：<span>{last}</span>
s0ro0: 还没开始猜——点上面任一符号按钮，先猜再揭晓。
s0hit: ✓ 猜中
s0miss: ✗ 不是
s0H: 两个源的熵先揭晓数字：甲机 H ≈ <span>{hA} bits/符号</span> · 乙机 H = <span>{hB} bits/符号</span>。熵越小的源越好猜——公式在第 2 步亲手算。
:::

## I = −log₂ p：意外是有价的 {#step1 h2=s1t}

::: strings
nav1: 1 惊讶标价
:::

第 1 步 · 惊讶的标价 {#s1k .step-kicker i18n=text}

先给单个事件标价。一件事发生的概率是 p，它真发生时你收获的「惊讶」记为 I。标价要满足两条直觉：**越罕见越惊讶**（p 越小 I 越大，p = 1 时 I = 0）；且在「越罕见越惊讶」这个前提下，能让独立事件的惊讶**相加**的标价只有一种可能——对数（为什么见本步下半）。拖动滑杆，看标价怎么随 p 变。 {#s1e .explain}

::: html step1-1
pLab: 事件概率 p（对数刻度）
pOne: p = 1（必然发生）
pHalf: p = 1/2
:::

为什么必须是对数？ {#s1sub .sub-t tag=h3 i18n=text}

关键要求是**可加性**：两件独立的事同时发生，总惊讶应该等于各自惊讶之和。一枚硬币「正面」的惊讶记 1 份；「两枚同时正面」是 p = 1/4 的事件，它的惊讶必须是 2 份——不多不少。再加码：「四个硬币全正面」是 p = 1/16，可以看成两个独立的「双正面」事件（各 p = 1/4），总惊讶必须是 2 + 2 = 4 份。下面两行账都是页面现算的：对数标价永远对得上，别的标价（比如 1/p）当场穿帮——这正是 I 必须取 −log p 的原因（在单调性假设下，对数是唯一满足可加性的标价）。 {#s1e2 .explain}

::: html step1-2
flipBtn: 掷四枚硬币（等一次「全正面」）
newSeed: 换一颗种子
:::

锚点记三个就够：p = 1/2 → 1 bit，p = 1/8 → 3 bits，p = 1 → 0。「bit」这个单位就是这么来的：一次公平硬币的惊讶，就是 1 个单位。 {#s1hint .hint}

::: strings
dash: —
s1ro: p = <span>{p}</span>（{frac}）· 惊讶 I = −log₂ p = <span>{I} bits</span>
cSurpY: 惊讶 I（bits）
cSurpBar: 这个事件的惊讶
s1add: 对数标价：I(1/4) + I(1/4) = {a} + {a} = <span>{s} bits</span>，而 I(1/16) = <span>{j} bits</span> —— <span class="good">相等 ✓</span><br>若按 1/p 标价：{pa} + {pa} = {ps}，而联合事件标价 {pj} —— <span class="bad">{ps} ≠ {pj} ✗</span>
s1flip0: 还没掷。点上面的按钮，一次掷四枚，看「全正面」多久来一次。
s1flip: 已掷 <span>{n}</span> 组四连掷 · 「全正面」出现 <span>{hits}</span> 次（理论概率 1/16 ≈ 6.25%，长 run 频率会贴过去，短 run 波动大是正常的）· 每次出现交出 I = 4 bits 惊讶 = 两个「双正面」各 2 bits 之和 · 种子 {seed}
:::

## 熵工坊：把惊讶平均一下 {#step2 h2=s2t}

::: strings
nav2: 2 熵工坊
:::

第 2 步 · 熵 {#s2k .step-kicker i18n=text}

单个事件的惊讶会忽大忽小，但一个源发成千上万个符号后，**平均每个符号交出的惊讶会稳定在一个数上**——这个数就是熵 H：把每个符号的惊讶 I = −log₂ p 按它出现的概率加权平均。下面拖滑杆造你自己的分布（权重自动归一化），再开发射器亲眼看平均值贴向 H。约定：p = 0 的符号在求和里按 0·log 0 = 0 计（取极限），它永不出现、也不贡献惊讶。 {#s2e .explain}

::: html step2-1
wLab: 权重
preSkew: 预设：偏态 50/25/15/10
preUni: 预设：均匀（H 最大）
preOne: 预设：几乎单一（H 最小）
sample1: 采样 1 个
sample20: 采样 20 个
sampleRun: 连发采样
resetSamples: 重置采样
:::

均匀分布时 H = 2 bits 达到四符号的最大值：每个符号都一样意外，没法不惊讶。把分布压到几乎单一，H 贴近 0：源几乎没悬念。采样曲线早期会乱跳，样本越多越贴线——这是大数定律在干活（中心极限页的主角）。 {#s2hint .hint}

::: strings
sampleStop: 停
cDistT: 当前分布（柱高 = 概率，柱顶数字 = 该符号的惊讶 I）
cRunT: 运行平均惊讶 → H（纵轴按已见运行均值的最大值自动扩程，曲线不出框）
cHLine: H（理论）
cEmpLine: 经验平均
s2ro: 分布 p = [{p}] · 熵 H = <span>{H} bits/符号</span> · 已采样 <span>{n}</span> 个 · 经验平均惊讶 <span>{emp}</span> · 与 H 相差 <span>{diff}</span>（理论标准误约 σ<sub>I</sub>/√n = {se}；σ<sub>I</sub> 是惊讶 I 的标准差，标准误就是平均惊讶这个平均数自身的典型误差，采样越多越小）· 种子 {seed}
s2ro0: 分布 p = [{p}] · 熵 H = <span>{H} bits/符号</span> · 还没采样——点「采样」看平均惊讶怎么贴向 H · 种子 {seed}
:::

## 一枚硬币的驼峰，与问题的下限 {#step3 h2=s3t}

::: strings
nav3: 3 二元熵与二十问
:::

第 3 步 · 二元熵与二十问 {#s3k .step-kicker i18n=text}

只有两个结果的源（抛硬币），熵是正面概率 p 的函数 H(p)，画出来是著名的**驼峰**：p = 0.5 时峰顶 1 bit，越偏向必然，熵越贴近 0。拖动 p，让点在曲线上走。 {#s3e .explain}

::: html step3-1
pLab3: 正面概率 p
:::

二十问：猜 1–8 里的一个数 {#s3sub .sub-t tag=h3 i18n=text}

「二十问」游戏的本质是：每次问一个是非题，尽量快地定位答案。猜 1–8 的一个数、八个数等可能时，这个源的熵是 log₂8 = **3 bits**，所以任何问法平均至少需要 3 问——而**二分法**（每次问「它 ≤ 中点吗」，把范围砍半）恰好每数都用 3 问，摸到了下限。下面选一个心里数，两种问法各跑一遍，账都是按决策树的深度现算的。 {#s3e2 .explain}

::: html step3-2
qTarget: 心里数：
qRand: 随机选一个
qBinBtn: 用二分法问
qSeqBtn: 用逐个问
:::

为什么平均问数不能低于 H？每个是非题最多切掉一半可能性，信息量至多 1 bit；要交出 H bits 的信息定位答案，平均至少得问 H 次——这和第 4 步「平均码长 ≥ H」是同一堵墙的两种说法。 {#s3hint .hint}

::: strings
s3ro: p = <span>{p}</span> · H(p) = <span>{H} bits</span>（p = 0.5 时最大，恰 1 bit；p → 0 或 1 时归 0）
cCurveT: 二元熵 H(p)
cPeak: 峰顶：p = 0.5，H = 1 bit
qAskLe: 第 {i} 问：它 ≤ {mid} 吗？→ {ans}
qAskEq: 第 {i} 问：它是 {k} 吗？→ {ans}
qYes: 是
qNo: 否
qDeduce: 前 {i} 问全「否」——不用再问，它只能是 {n}（排除法）
qFound: 🎯 找到 {n}，共问了 <span>{c}</span> 次。
qIdle: 先选一个心里数，再点一种问法，看提问记录。
qPicked: 已选心里数：<span>{n}</span>——再点一种问法，看提问记录怎么找到它。
treeT: 二分决策树（每个叶子 = 一个数，深度都是 3）
nodeQ: ≤ {mid}？
s3dro: 二分法：每数问数 [{bd}]，平均 <span>{bm}</span> 问 = H = log₂8 = 3 bits（摸到下限 ✓）· 逐个问：每数问数 [{sd}]，平均 <span>{sm}</span> 问 &gt; H（问法笨，多花的 {extra} 问是浪费）
:::

## 哈夫曼：亲手摸到极限 {#step4 h2=s4t}

::: strings
nav4: 4 哈夫曼编码
:::

第 4 步 · 哈夫曼编码 {#s4k .step-kicker i18n=text}

给符号编二进制码字：高频符号给短码、低频给长码，平均码长能压多低？香农说下限是 H。1952 年哈夫曼给出一个贪心算法能摸到这堵墙上方不到 1 bit 的地方：**反复把概率最小的两个节点合并成一个新节点**，长成一棵树，叶子到根的路径就是码字。下面一步步把树长出来。 {#s4e .explain}

::: html step4-1
s4src: 分布与第 2 步工坊**共享**：在上面第 2 步改滑杆，回到这里树会按新分布重建；下面预设也直接改第 2 步的分布。
preDyadic: 预设：1/2, 1/4, 1/8, 1/8（L 恰好 = H）
hPrev: ← 上一步
hNext: 下一步 →
hPlay: 自动播放
msgLab: 给这条消息编码：
encodeBtn: 编码
:::

**并列取舍规则**（影响树的形状、不影响界）：权重相等时，先进入名单的节点先合并——叶子按 A→D 排，内部节点按生成先后排。换一条规则可能长出另一棵树、另一组 L，但任何哈夫曼树都必须落在 [H, H+1) 里，评审换规则自构树也只能落在这个区间。 {#s4tie .hint}

试试预设 1/2, 1/4, 1/8, 1/8：L 与 H 小数点后三位完全重合——当每个概率都是 1/2 的幂时，哈夫曼恰好严丝合缝地摸到 H。再试均匀分布：L = 2 = H，定长编码本来就是最优的。 {#s4hint .hint}

::: strings
hPause: 暂停
cTreeT: 哈夫曼合并过程（当前步高亮的两个节点即将合并）
s4step: 第 {k}/{total} 步：{desc}
s4stepInit: 初始：{n} 个叶子节点（每个符号一个）
s4stepMerge: 合并 {a}（{pa}）与 {b}（{pb}）→ 新节点 {ab}（{pab}）
s4stepDone: 完成：树已长成，码字见下方读数
s4ro: 熵 H = <span>{H} bits</span> · 哈夫曼平均码长 L = <span>{L} bits/符号</span> · 定长编码（{n} 个会出现的符号一律 {fixed} bits）：<span>{fixed} bits/符号</span> · 每符号省下 {save} bits
s4bound: 界检验：H = {H} ≤ L = {L} &lt; H + 1 = {H1} ✓（香农源编码定理：任何无前缀码 L ≥ H，哈夫曼保证 L &lt; H + 1；此 ✓ 由页面按实测 H 与 L 现场判定，不是印好的）
s4boundBad: 界检验：H = {H}，L = {L}，H + 1 = {H1} —— <span class="bad">没有落在 [H, H+1) 内 ✗</span>（按香农源编码定理这不该发生；若你看到这一行，是页面出了 bug，请记下这个分布）
s4degen: 注意：分布只剩**一个可能的结果**时，哈夫曼树退化为单个叶子——这个符号的码字是**空串**（长 0），L = 0 = H：结果毫无悬念，传达它不需要任何比特，香农的界在这里恰好取等。其余 p = 0 的符号永不出现，已在构树前剔除。
s4codesT: 码字表（码长 = 树深）：
s4codeLine: {s}：p = {p}，码字 <span>{code}</span>（长 {len}）
s4codeZero: {s}：p = 0 —— 不参与编码：它永不出现，不需要码字（也不计入 L）
s4codeEmpty: {s}：p = {p}，码字 <span>（空串）</span>（长 0）—— 唯一可能的结果，不用任何比特就能传达
s4mro: 消息 {msg}（{n} 个符号）→ <span>{bits}</span> · 共 <span>{count} bits</span> · 实测平均 {emp} bits/符号（期望 = n × L = {exp} bits；单条消息的实测会上下浮动，长期平均才贴 L）
s4mro0: 选一条消息、点「编码」，看它变成多长的比特串。
s4mroBad: 这条消息里含有 p = 0 的符号——按当前分布它永不出现，码表里没有它的码字，编不出诚实的比特串。换一条消息，或回第 2 步给它一点概率。
:::

## 模型错得有多贵 {#step5 h2=s5t}

::: strings
nav5: 5 交叉熵与 KL
:::

第 5 步 · 交叉熵与 KL 散度 {#s5k .step-kicker i18n=text}

真实世界按分布 p 发符号，你的模型却以为世界是 q。用 q 的账本给 p 的数据标价，平均惊讶变成**交叉熵** H(p, q)；它比真熵 H(p) 多出的部分，就是模型错付的代价——**KL 散度**。三者关系一句话：H(p, q) = H(p) + KL(p‖q)。拖动 q 的滑杆，看代价怎么涨落。 {#s5e .explain}

::: html step5-1
pLab5: 真实分布 p
preDyadic2: 1/2, 1/4, 1/8, 1/8
preSharp: 极偏 70/10/10/10
qLab5: 你的模型 q
qCopyBtn: 让 q = p（模型完美）
swapBtn: 交换 p ↔ q
smoothLab: 平滑 q：q′ = 0.99·q + 0.01·均匀（ε = 0.01）
s5inf: ⚠ **q 给某个 p 真会发生的符号标了 0。**按 q 的账本，这件事「绝不可能发生」，它一旦发生，惊讶是 +∞——交叉熵与 KL 都是 +∞，页面如实显示 ∞，不拿任何大数糊弄。真实训练里这对应：模型把某个正确类别判了 0 概率，一条样本就能让损失爆表。上面的平滑开关能把 q 每个符号都垫上一点点概率、算出有限的数——但那已经是另一个 q 了，读数会标明「已平滑」。
:::

注：KL 按定义恒 ≥ 0（吉布斯不等式）；浮点误差偶尔会算出 −0.000 量级的负数，本页显示时已钳为 0，数学上它就是 0。 {#s5foot .hint}

回勾：<a class="fourier-link" href="../../../computing/ml/gradient-descent/#step6">梯度下降页</a>终章训练分类器时，最小化的正是这里的交叉熵 H(p, q)——标签分布 p 固定，降交叉熵就等于降 KL(p‖q)，等于让模型 q 向真实 p 靠拢。训练里说的「loss」，大半就是这个数。 {#s5link .hint}

::: strings
cBarsT: p（青）与 q（橙）逐符号对照
lgP: 真实 p
lgQ: 模型 q
lgQS: 模型 q（已平滑）
s5ro: H(p) = <span>{Hp} bits</span> · 交叉熵 H(p, q) = <span>{Hpq} bits</span> · KL(p‖q) = <span>{KL} bits</span> · 分解核对：H(p) + KL = {sum}（残差 {res}）· 反方向 KL(q‖p) = <span>{KLr} bits</span> —— 两个方向不一样：KL 不是距离，是「用错账本的代价」，方向就是账本的方向
s5roInf: H(p) = <span>{Hp} bits</span> · 交叉熵 H(p, q) = <span>+∞</span> · KL(p‖q) = <span>+∞</span> · 反方向 KL(q‖p) = <span>{KLr} bits</span>（有限——方向反过来账就算得出来，这正是 KL 不对称最极端的样子）
s5roSmooth: （已平滑）H(p) = <span>{Hp} bits</span> · 交叉熵 H(p, q′) = <span>{Hpq} bits</span> · KL(p‖q′) = <span>{KL} bits</span> · 分解核对：H(p) + KL = {sum}（残差 {res}）· 反方向 KL(q′‖p) = <span>{KLr} bits</span> —— 注意：这是平滑后 q′ 的账，不是原 q 的（原 q 是 +∞，见下方警告）
s5hint: 先点「让 q = p」看 KL 归零、交叉熵恰好等于 H(p)；再把 q 的某个滑杆拖到 0（而 p 那边不是 0），看 +∞ 警告；最后交换 p ↔ q，对比两个方向的 KL 数字。
:::

## 熵的版图：同一把秤 {#step6 h2=s6t}

::: strings
nav6: 6 熵的版图
:::

第 6 步 · 终章 {#s6k .step-kicker i18n=text}

最后把这把秤拿到三个远房亲戚面前：密码、热力学、压缩软件。它们说的是同一种话——只是单位和常数不同。 {#s6e .explain}

::: html step6-1
pwT: ① 密码强度计
pwD: 密码从字符集里逐位均匀随机选出时，它的熵就是「长度 × 每位比特数」。破解者没有捷径（均匀随机 = 没有可利用的规律），只能逐个试。
lenLab: 密码长度
cs10: 纯数字（10）
cs26: 小写字母（26）
cs62: 大小写+数字（62）
cs94: 全部可打印（94）
rateNote: **口径明示**：期望尝试次数 = 2<sup>H−1</sup>（平均试遍一半空间命中）；速率假设 10<sup>10</sup> 次/秒（离线高速爆破的量级）。前提是密码真随机、人选密码的「熵」远低于这个数——那是另一回事，本卡只称真随机密码。
physT: ② 物理熵：一句真话
physD: 热力学的熵与信息熵**同式不同单位**，不能说「完全一样」：吉布斯公式 S = −k<sub>B</sub>·Σ p·ln p 用自然对数（单位 nats）、乘玻尔兹曼常数 k<sub>B</sub>，单位是焦耳/开尔文；信息熵用 log<sub>2</sub>、单位 bits——两者只差常数倍 k<sub>B</sub>·ln 2。玻尔兹曼墓碑上的 S = k<sub>B</sub>·ln W 是它的特例：W 个微观状态等概率时，吉布斯式恰好化简成它。物理学家与信息论学家量的确实是同一个「不确定性」，只是换算率不同。
compT: ③ 压缩的现实
compD: 回到第 4 步：文件能压多小，下限是它的熵。zip 对普通文本还能压，是因为文本的符号分布远没到均匀、熵低于定长编码；对一个**已经压过**的文件再压，几乎压不动——不是软件偷懒，是它的熵已经被摸到了，剩下的比特个个都是「真惊讶」，没有规律可再利用。加密文件同理：好的密文看起来就该像均匀随机数，熵顶满，无从下手。
s6fin: **收束。**从猜符号的游戏，到密码强度与热力学——熵是同一把秤。它量的不是「混乱」这个形容词，而是「平均而言，你有多意外」。概率线到这里收官：<a class="fourier-link" href="../../inference/bayes-updating/#step2">贝叶斯</a>讲信念如何更新、<a class="fourier-link" href="../../statistics/central-limit-theorem/#step0">中心极限</a>讲随机如何收敛成钟形、这一页讲不确定性本身如何被计量。三件事，其实都是在跟随机打交道时，诚实地记账。
s6linkIdx: ← 回知识索引
:::

::: strings
cTimeT: 期望破解时间
tSec: 1 秒
tDay: 1 天
tYear: 1 年
tUniv: 宇宙年龄
s6ro: 字符集 {size} 种 · 每位 log₂{size} = {per} bits · 总熵 H = <span>{H} bits</span> · 期望尝试 <span>{g}</span> 次 · 期望破解时间 <span>{time}</span>
timeSec: 约 {v} 秒
timeMin: 约 {v} 分钟
timeHour: 约 {v} 小时
timeDay: 约 {v} 天
timeYear: 约 {v} 年
timeUniv: 约 {v} × 宇宙年龄（138 亿年）
:::
