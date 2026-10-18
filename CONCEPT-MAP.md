# CONCEPT-MAP.md — 全站概念 → 专讲页/步 映射与逐页加链清单

> 维护规则（SPEC 规则 12）：正文首提某概念、别页有专讲时，深链到 `../<slug>/#stepN`，链接文字写明去学什么；每页终章设互链区（2–4 条，同样带步锚点）。新增页面时在本表登记「自己能被哪些概念链入」。
> 本表由 2026-10-16 全站审计波 2 建立：锚点逐个核对过各页 `index.html` 的 `id="stepN"` 与 `i18n.js` 步骤标题（全站 20 页均为 step0–step6），不是按标题猜的。
> 链的写法（三种既有形态，执行时照抄所在页的现成形态）：
> - **正文内链**：直接在对应 i18n 键的中/英字符串里嵌 `<a class="fourier-link" href="../<slug>/#stepN">…</a>`（样板：kalman `s2e`/`s5e`）。
> - **终章链行**：`index.html` 第 6 步 `.finale` 内一行 `<a class="fourier-link" href="..." data-i18n="s6lkX"></a>` + i18n 双键（样板：kalman `index.html:206-209`、freqresp `index.html:233-235`）。
> - **终章内嵌**：clt / entropy / montecarlo 的终章链写在 `s6fin` 字符串内部，随该键改。
> 「存量补锚」= 链接已存在、只给 href 补 `#stepN`，文案键不动。

---

## 一、主表：概念 → 专讲页/步

LeetCode collection additions (2026-10-17):

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Binary partition and sentinel boundaries | `leetcode/4/#step1` | Derive balanced cuts and monotone search direction |
| Regex prefix states | `leetcode/10/#step1` | Distinguish skipping x* from repeating its atom |
| Candidate heads and heap order | `leetcode/23/#step2` | Track permanent node identity and completed heap operations |
| Groupwise pointer reversal | `leetcode/25/#step2` | Preserve the suffix while rewiring one next pointer |
| Word-aligned windows and multiplicity | `leetcode/30/#step2` | Scan every offset and shrink excess word counts |
| Parenthesis boundary stack | `leetcode/32/#step1` | Excluded indices define maximal valid suffixes |
| Constraint search and undo | `leetcode/37/#step2` | Restore board and all constraint sets after failed choices |
| In-place placement with duplicates | `leetcode/41/#step1` | Prove the answer range and bounded useful swaps |
| Settled water and running maxima | `leetcode/42/#step2` | Prove why the lower known maximum settles one endpoint |
| Wildcard prefix states and rolling rows | `leetcode/44/#step1` | Derive one-left star dependency and two-row memory |
| Grouping subarrays by right endpoint | `leetcode/2916/#step1` | Partition all subarrays without overlap and retain endpoint contribution history |
| Previous occurrence and interval updates | `leetcode/2916/#step2` | Why precisely the starts in `[p+1,r]` gain a new distinct value |
| Updating a sum of squares | `leetcode/2916/#step3` | Derive the sufficient summaries `S`, `Q` and `Q' = Q + 2kS + k²m` |
| Segment trees and lazy propagation | `leetcode/2916/#step4` | Fully covered updates, deferred child values, push-down and return-path merging |

The LeetCode lesson links back to `sorting/#step0` (growth and Big O) and
`sorting/#step2` (recursive partitioning and merging).

| # | 概念（中 / EN） | 专讲 slug#step | 那一步讲清什么 |
| --- | --- | --- | --- |
| 1 | 正弦波三要素（频率/振幅/相位）/ Sine: frequency, amplitude, phase | fourier#step1 | 一条正弦波只有三个旋钮，拖了就懂 |
| 2 | 圆的投影描出正弦波 / A rotating point's projection traces a sine | fourier#step3（trig#step3 同题） | 圆转一圈 = 波一个周期；转速=频率、半径=振幅、起始角=相位 |
| 3 | 单位圆定义 sin/cos / sin & cos on the unit circle | trig#step1 | cos 是站位（横坐标）、sin 是身高（纵坐标） |
| 4 | tan = 斜率 / tan is a slope | trig#step4 | 半径延长线撞 x=1 墙的高度；90° 为何无定义 |
| 5 | 频谱 / 频域视角 / Spectrum & the frequency domain | fourier#step5 | 傅里叶变换本体：任意波形拆成各频率成分的强弱 |
| 6 | 圆圈套圆圈拼波形（傅里叶级数）/ Epicycles build a waveform | fourier#step4 | 圆首尾相连拼方波；吉布斯尖角为何不消失 |
| 7 | DFT 拆任意图形 / DFT of a hand-drawn shape | fourier#step6 | 亲手画的图形被拆成横/竖两串圆再重画 |
| 8 | 卷积四件事（翻转滑动乘加）/ Convolution: flip, slide, multiply, add | convolution#step2 | 离散卷积的完整手艺，输出逐个落账 |
| 9 | 连续卷积 = 重叠面积 / Continuous convolution is overlap area | convolution#step3 | 矩形×矩形卷出三角形，输出值 = 重叠面积 |
| 10 | 图像卷积核 / Image kernels | convolution#step4 | 每个像素都在做 3×3 加权和；模糊/边缘都是换核 |
| 11 | 卷积定理 / Convolution theorem | convolution#step6 | 卷积 = 频域里逐点相乘 |
| 12 | 冲激 δ 与信号分解 / The impulse δ and signal decomposition | lti#step1 | δ[n−k] 像镊子夹出 x[k]；任何信号拆成一串冲激 |
| 13 | 冲激响应 h[n] / Impulse response | lti#step2 | 认识 h 就认识系统对一切输入的回答 |
| 14 | 线性 + 时不变（定义与证伪）/ Linearity & time-invariance | lti#step3 | 两条公理当场可证伪：平方器、时变增益各垮一条 |
| 15 | 阶跃响应 / Step response | lti#step4 | s 是 h 的累积、h 是 s 的差分 |
| 16 | 频率响应：按频率挑食 / Frequency response | freqresp#step0 | 逐档喂纯正弦、量「输出÷输入」的放行率 |
| 17 | 波特图与 dB 读法 / Bode plots & decibels | freqresp#step2 | −3 dB 点、−20 dB/dec、φ(ωc)=−45° 全现场算 |
| 18 | 高通/带通/共振 / High-pass, band-pass, resonance | freqresp#step5 | 同一套数学的三种挑食；Q 由实测带宽反推 |
| 19 | s 平面地形 / The s-plane landscape | laplace#step1 | \|X(s)\| 是地形，极点是尖峰，高 = 到极点距离的倒数 |
| 20 | 傅里叶 = 拉普拉斯在 σ=0 的切片 / Fourier as the σ=0 slice of Laplace | laplace#step2 | 谱 = 地形在 σ=0 处切的一刀；掉出 ROC 就没有谱 |
| 21 | 极点位置即系统性格 / Pole locations are the system's character | laplace#step4 | 左半衰减、轴上等幅、右半爆炸；实部就是衰减率 |
| 22 | ROC 断因果与稳定 / ROC decides causality & stability | laplace#step5 | 因果 ⟺ ROC 在最右极点之右；稳定 ⟺ ROC 含虚轴 |
| 23 | z = e^(sT)：平面卷起来 / Wrapping the plane: z = e^(sT) | ztransform#step0 | 虚轴卷成单位圆、左半平面卷进圆内 |
| 24 | X(z) 是部分和轨迹 / X(z) as a partial-sum trail | ztransform#step2 | 逐项真加，\|q\|<1 螺旋收进极限 |
| 25 | 极点贴圆则频响峰尖 / Poles near the circle sharpen the response | ztransform#step4 | 极点图、h 图、频响图是同一件事的三个侧面 |
| 26 | 单位圆 = 数字世界的虚轴 / The unit circle is the digital jω axis | ztransform#step6 | 在单位圆上求值就是数字频响 |
| 27 | 奈奎斯特线 / The Nyquist line | sampling#step3 | 采样率两倍，差一线都不行 |
| 28 | 混叠的频域面孔（频谱复制）/ Aliasing in the frequency domain | sampling#step4 | 整张频谱以 fs 为周期无限复制 |
| 29 | 抗混叠：先抹掉再采 / Anti-aliasing: blur first, then sample | sampling#step6 | 先决定放弃什么，再采 |
| 30 | 乘法搬频谱（调制）/ Modulation shifts the spectrum | modulation#step1 | 一乘，频谱整包搬到 fc ± B；边带幅值恰为 m/2 |
| 31 | 相干解调的对账 / Coherent demodulation | modulation#step2 | Δf 与 φ 两笔账：拍频与 cos φ 标度 |
| 32 | 反馈回路结构 / The feedback loop | control#step2 | 传感器 → 控制器 → 电机 → 再回到传感器 |
| 33 | P / D / I 各管什么 / What P, D and I each do | control#step3 / #step4 / #step5 | P 太软倒太硬晃；D 提前刹车；I 站得稳还要站得直 |
| 34 | 先验 × 似然比 = 后验（赔率式）/ Posterior = prior × likelihood ratio | bayes#step2 | 换上赔率眼镜，乘法变位移 |
| 35 | 序贯更新：后验变先验 / Sequential updating | bayes#step3 | 一条条加证据，整条赔率链打出来 |
| 36 | 连续后验（抛币 Beta）/ Continuous posteriors (the coin) | bayes#step4 | 每抛一次曲线收紧一点；宽度 = 还剩多少不知道 |
| 37 | 先验洗刷 / Priors wash out | bayes#step5 | 两条先验喂同一序列，均值差 0.300 → 0.010 |
| 38 | 大数定律：频率露出概率的脸 / Law of large numbers | montecarlo#step1 | 一颗一颗撒，频率贴概率；比例与 r 无关当场可验 |
| 39 | 误差按 1/√N 定价 / Error shrinks as 1/√N | montecarlo#step2 | π̂ 轨迹束在 ±2σ 带内收窄，想准一位撒 100 倍 |
| 40 | 蒙特卡洛估面积/积分 / Monte Carlo integration | montecarlo#step3 | 没有公式？撒就完了；心形、五角星都能估 |
| 41 | 维度诅咒 / The curse of dimensionality | montecarlo#step5 | 网格点数 10⁵ → 10¹²，撒点估值仍贴真值 |
| 42 | 随机数从哪来 / Where random numbers come from | montecarlo#step6 | 同一种子重演 10 个点逐位一致 |
| 43 | 钟形涌现 / The bell emerges | clt#step0 | 切 1/2/5/30 颗骰子，平均自己长成钟形 |
| 44 | σ/√n 铁律 / The σ/√n law | clt#step3 | log-log 拟合斜率 −0.506 对理论 −0.50 |
| 45 | 钟形的来历：和的分布 = 卷积 / Why the bell: sums are convolutions | clt#step5 | 矩形 → 三角 → 近钟，最大偏差 0.690 → 0.007 |
| 46 | 样本量与误差范围 / Sample size & margin of error | clt#step6 | 民调 ±3% 的出身；算完当场真跑验覆盖率 |
| 47 | 惊讶 I = −log₂ p / Surprise | entropy#step1 | 用可加性逼出对数，1/p 反例当场穿帮 |
| 48 | 熵 = 平均惊讶 / Entropy is average surprise | entropy#step2 | 采样平均惊讶贴向 H，连理论标准误都给 |
| 49 | 哈夫曼与 H ≤ L < H+1 / Huffman coding | entropy#step4 | 树按步长出来，界由页面按实测值现场判定 |
| 50 | 交叉熵与 KL / Cross-entropy & KL divergence | entropy#step5 | 模型错得有多贵；q 拖到 0 给出 +∞ 并解释 |
| 51 | 特征向量/特征值（定义）/ Eigenvectors & eigenvalues | eigen#step1（定义句在 #step0 末） | 拖箭头转到与 Av 夹角归零，就是特征方向 |
| 52 | 幂迭代 / Power iteration | eigen#step3 | 反复乘 A，向量自己贴向主方向 |
| 53 | 对角化与主轴 / Diagonalisation & principal axes | eigen#step4 | 转到特征坐标交叉项变 0；峡谷的真身 |
| 54 | 方差最大方向 = 最大特征向量（PCA）/ Max-variance direction (PCA) | eigen#step5 | 投影方差由数据真算，与 λ₁ 一致到浮点精度 |
| 55 | 稳态分布与 PageRank / Steady states & PageRank | eigen#step6 | 分布反复乘 M 冻住，冻住的就是 λ=1 的特征向量 |
| 56 | 梯度垂直于等高线 / Gradients are perpendicular to contours | gradient-descent#step1 | 梯度只管脚下最陡，不管谷底在哪 |
| 57 | 条件数 κ 与之字形 / Condition number & zig-zagging | gradient-descent#step2 | 步长迁就最陡方向，沿谷底只能蹭 |
| 58 | 动量 / Momentum | gradient-descent#step3 | 横跳分量互相抵消、沿谷底分量叠加 |
| 59 | SGD：小批量估梯度 / SGD: minibatch gradient estimates | gradient-descent#step4 | 每步只看一小把数据，单步迈得偏但便宜 |
| 60 | 训分类器（交叉熵损失）/ Training a classifier (cross-entropy loss) | gradient-descent#step6 | 决策边界转动、损失曲线同步下降 |
| 61 | 卡尔曼更新：预测 + 按不确定度修正 / The Kalman update | kalman#step2 | 先预测再更新；后验供下一轮当先验 |
| 62 | 二维卡尔曼：只测位置估速度 / 2-D Kalman: velocity from position only | kalman#step5 | 协方差 P 的主方向在这一步现身 |
| 63 | LQG：估计接控制 / LQG: estimation meets control | kalman#step6 | 线性 + 二次代价 + 高斯噪声下估计与最优控制合体 |
| 64 | 迭代映射与逃逸半径 / Iteration & the escape radius | mandelbrot#step1 | 一个点 c 的轨道：冲出半径 2 的圆，或留圆内 |
| 65 | 朱利亚集 / Julia sets | mandelbrot#step6 | 固定 c、每个点当 z₀；c 在集内连通、在集外碎成尘 |
| 66 | 大 O 是形状不是速度 / Big-O is a shape, not a speed | sorting#step4 | 扔掉系数后比增长形状；交叉点 n=997 当场算 |
| 67 | 计数排序绕开比较下界 / Counting sort bypasses the comparison bound | sorting#step5 | 一次都不比较；值域拉爆桶就反噬 |
| 68 | 分数 = 数轴上的一个数 / A fraction is a point on the number line | fractions#step1 | 分母是切法、分子是取法；落点由真值投影 |
| 69 | 通分与最小公倍数 / Common denominators & the LCM | fractions#step3 | 先对齐刻度再比长短；交叉相乘与通分同结论 |


| 70 | 勾股定理 / Pythagorean theorem | pythagoras#step2 | 四个全等直角三角形拼图，同一大正方形两种面积数法证明 a²+b²=c² |
| 71 | 斜边与直角边 / Hypotenuse and legs | pythagoras#step0 | 直角对面的最长边与夹住直角的两边，三组整数验算 |
| 72 | 平方的面积意义 / Squares as areas | pythagoras#step1 | 9 与 16 个单位格逐格装满 25 个单位格 |
| 73 | 勾股逆定理与判角 / Converse and angle classification | pythagoras#step4 | 以最长边平方比较其余两边平方和，先判后揭晓 |
| 74 | 两点距离公式 / Distance formula | pythagoras#step5 | 横纵坐标差的平方和开方；梯子逆求直角边 |
| 75 | 勾股数 / Pythagorean triples | pythagoras#step6 | 3k-4k-5k 累积精确验算，与 5-12-13、8-15-17 对照 |
| 76 | √2 与无理数 / √2 and irrational numbers | pythagoras#step6 | 1-1 直角三角形与奇偶性反证，斜边无需为整数 |

---

## 二、逐页加链清单

图例：**[内链]** 正文内链新增 · **[终章]** 终章互链区新增 · **[补锚]** 存量链只补 `#stepN` · **[处置]** 存量弱链处置 · 依据列注明审计条目或首提位置。链接文字中英成对给出，执行时以所在页语气微调、不得改成泛称（如只写页名不合格）。

### bayes（现存跨页链 0 条）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [终章] | 第 6 步新建终章链行（现仅 `s6linkIdx` 回索引） | clt#step0 | 「样本再多会怎样：去看平均值怎样自己长成钟形 →」/ "What more data does: watch averages grow into a bell →" | 审计 B3 点名：洗刷/大样本可链 CLT |
| 2 | [终章] | 同上 | kalman#step2 | 「后验变先验的工业版：卡尔曼怎样一轮轮更新估计 →」/ "The industrial version of posterior-becomes-prior: how Kalman updates, round after round →" | 审计 B3 点名：后验分布可链卡尔曼第 2 步 |
| 3 | [终章] | 同上 | montecarlo#step1 | 「频率这条路：撒得够多，频率就露出概率的脸 →」/ "The frequency road: toss enough, and frequency shows probability's face →" | 本页第 5 步「先验洗刷 + 频率回访」（nav5/s5）以频率树收束，与蒙特卡洛第 1 步同题 |

### clt（现存 4 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 3 步 `s3e` 内现存 montecarlo 链 | montecarlo#step2 | href 由 `../montecarlo/` 改 `../montecarlo/#step2` | 审计 C3；该步正文谈的正是 1/√N 定价，对方专讲步即第 2 步 |
| 2 | [补锚] | 第 5 步 `s5e` 内现存 convolution 链 | convolution#step3 | 同上改锚 | 审计 C3；clt 本步矩形→三角与卷积第 3 步「矩形×矩形卷出三角形」逐图对应 |
| 3 | [补锚] | 第 6 步 `s6fin` 内现存 montecarlo 链 | montecarlo#step2 | 同上改锚 | 审计 C3 |
| 4 | [补锚] | 第 6 步 `s6fin` 内现存 convolution 链 | convolution#step3 | 同上改锚 | 审计 C3 |

### montecarlo（现存跨页链 0 条）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [终章] | 第 6 步 `s6fin` 内「贝叶斯」一词处做链 | bayes#step4 | （词链，hover 文案即原词）「贝叶斯」/ "Bayes" — 若需展开文字：「去看抛币的后验怎样随数据收窄」/ "watch a coin's posterior narrow with data" | 审计 M3 点名：终章点名贝叶斯却不给链；第 4 步正是连续后验随抛币收窄 |
| 2 | [终章] | 第 6 步 `s6fin` 内「中心极限定理」一词处做链 | clt#step0 | 同上处理：「去看平均值怎样自己长成钟形」/ "watch averages grow into a bell on their own" | 审计 M3 点名；`s6fin` 原文「误差的正态面孔…是…中心极限定理两页的入口」 |
| 3 | [内链] | 第 2 步轨迹束/±2σ 带讲解处（`s2e` 一带） | clt#step3 | 「σ/√n 是条铁律：去看它被 log-log 图验明的样子 →」/ "σ/√n is an iron law: see it verified on a log-log plot →" | 本步误差带按 1/√N 收窄，与 CLT 第 3 步同一条律的专讲 |
| 4 | [内链] | 第 3 步估任意形状面积处（`s3e` 一带） | convolution#step3 | 「面积在卷积页是另一种算出法：输出 = 重叠面积 →」/ "Area computed another way on the convolution page: output = overlap area →" | 本步以撒点估面积；卷积第 3 步以重叠面积定义输出，互为数值/解析两面（补充关系） |

### entropy（现存 3 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 5 步 `s5link` 现存 gradient-descent 链 | gradient-descent#step6 | href 补 `#step6` | 审计 E1；`s5link` 原文即「终章训练分类器时最小化的正是交叉熵」，对方终章即第 6 步 |
| 2 | [补锚] | 第 6 步 `s6fin` 现存 bayes 链 | bayes#step2 | href 补 `#step2` | 审计 E1；终章原文「贝叶斯讲信念如何更新」，更新的公式步是第 2 步赔率式 |
| 3 | [补锚] | 第 6 步 `s6fin` 现存 clt 链 | clt#step0 | href 补 `#step0` | 审计 E1；原文「中心极限讲随机如何收敛成钟形」，钟形涌现步是第 0 步 |
| 4 | [内链]（可选） | 第 2 步采样平均惊讶处（`s2e` 一带） | montecarlo#step0 | 「靠撒样本估一个量：这是蒙特卡洛的通用机器 →」/ "Estimating a quantity by sampling: Monte Carlo's general machine →" | 本步以采样平均逼近 H，方法本体即蒙特卡洛估计（补充关系） |

### fourier（现存跨页链 0 条）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链] | 第 5 步 `s5explain` 讲频谱/频域处 | freqresp#step0 | 「拆出来的频谱拿来干什么：去看滤波器怎样按频率挑食 →」/ "What a spectrum is for: watch a filter pick by frequency →" | 本步首次完整给出频谱概念，其用途专讲在频率响应页 |
| 2 | [内链] | 第 3 步 `s3explain` 圆投影处 | trig#step1 | 「这个圆的正式学名在三角页：sin 是身高、cos 是站位 →」/ "This circle, formally, lives on the trig page: sin is height, cos is position →" | 本步用单位圆投影讲正弦，单位圆定义专讲在 trig 第 1 步 |
| 3 | [终章] | 第 6 步 `.finale` 新建链行 | convolution#step6 | 「卷积定理：时域卷积 = 频域逐点相乘 →」/ "The convolution theorem: convolution becomes pointwise multiplication →" | 终章应用面（finaleText 列均衡器/压缩/降噪皆经频域处理） |
| 4 | [终章] | 同上 | modulation#step1 | 「一乘，频谱就搬家：调制在干什么 →」/ "Multiply once and the spectrum moves house: modulation →" | 同上 |
| 5 | [终章] | 同上 | sampling#step4 | 「采样时频谱会整张复制：混叠的频域面孔 →」/ "Sampling clones the whole spectrum: aliasing in the frequency domain →" | 同上 |

### convolution（现存 1 条，无锚）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字/说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 6 步 `index.html` 现存 `s6link`（回傅里叶页） | fourier#step5 | href 补 `#step5`（本步主题卷积定理的另一半在傅里叶第 5 步频谱视角） | 本步标题即「与傅里叶相遇」 |
| 2 | [内链] | 第 5 步 `s5aNote`「回声 = 原声与一串冲激做卷积」处 | lti#step1 | 「冲激本人：怎样把任何信号拆成一串尖峰 →」/ "The impulse itself: how any signal splits into a train of spikes →" | `s5aNote` 正文直提冲激串（已核原文） |
| 3 | [终章] | 第 6 步链行与 #1 并列新增一行 | lti#step2 | 「h[n]：系统对一记冲激的全部回答 →」/ "h[n]: a system's complete answer to one impulse →" | 卷积的另一操作数就是 h，专讲在 LTI 第 2 步 |

### lti（现存 4 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 2 步 `index.html` 现存 `s2lkC` | convolution#step2 | href 补 `#step2` | 链文案自述「翻转、滑动、乘加的手艺」，即卷积第 2 步 |
| 2 | [补锚] | 第 6 步现存 `s6lkC` | convolution#step2 | href 补 `#step2` | 同上 |
| 3 | [补锚] | 第 6 步现存 `s6lkZ`「h 的代数身份证」 | ztransform#step2 | href 补 `#step2` | H(z) 即 h 的逐项生成函数，Z 变换第 2 步逐项加 X(z) |
| 4 | [补锚] | 第 6 步现存 `s6lkCtl` | control#step2 | href 补 `#step2` | 第 6 步应用卡含控制；回路结构专讲在控制第 2 步 |

### laplace（现存 4 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链] | 第 0 步 `s0hint`「就是傅里叶页里那些旋转圆画出来的东西」一句中「傅里叶页」处做链 | fourier#step0 | （词链）原文已直提对方页，为全页首提处 | 正文直提（已核原文），规则 12 首提必链 |
| 2 | [补锚] | 第 4 步 `index.html` 现存 `s4lkC`（该步 `.finale` 内） | control#step2 | href 补 `#step2` | 第 4 步讲极点位置；反馈回路是极点被搬动的地方，结构专讲在控制第 2 步 |
| 3 | [补锚] | 第 6 步现存 `s6lkF`「傅里叶变换：圆与波」 | fourier#step5 | href 补 `#step5` | 本页第 2 步已定调傅里叶是 σ=0 切片，对方本体步为第 5 步 |
| 4 | [补锚] | 第 6 步现存 `s6lkC`「反馈与控制：摁极点」 | control#step3 | href 补 `#step3` | 「摁极点」的手感步：调 P 就是在搬闭环极点（太软倒、太硬晃） |
| 5 | [补锚] | 第 6 步现存 `s6lkS`「采样与混叠：频域复制」 | sampling#step4 | href 补 `#step4` | 频域复制专讲在采样第 4 步 |

### ztransform（现存 6 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 3 步 `index.html` 现存 `s3lkL` | laplace#step3 | href 补 `#step3` | 两页本步同题：同式两信号只差 ROC |
| 2 | [补锚] | 第 5 步 `index.html` 现存 `s5lkS` | sampling#step4 | href 补 `#step4` | 本步讲混叠是卷时丢层，频域面孔在采样第 4 步 |
| 3 | [补锚] | 第 6 步现存 `s6lkT`「三角函数：圆的第一次出场」 | trig#step0 | href 补 `#step0` | 圆的第一次出场即造波机开场 |
| 4 | [补锚] | 第 6 步现存 `s6lkF` | fourier#step5 | href 补 `#step5` | 傅里叶本体步 |
| 5 | [补锚] | 第 6 步现存 `s6lkL` | laplace#step6 | href 补 `#step6` | 终章对终章：拉普拉斯第 6 步是 s 平面全家福 |
| 6 | [补锚] | 第 6 步现存 `s6lkS` | sampling#step4 | href 补 `#step4` | 同 #2 |

### freqresp（现存 3 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 6 步现存 `s6lkL`「拉普拉斯：从极点读共振」 | laplace#step4 | href 补 `#step4` | 极点位置即性格，正是共振的出处 |
| 2 | [补锚] | 第 6 步现存 `s6lkZ`「Z 变换：单位圆上的频响」 | ztransform#step6 | href 补 `#step6` | 对方第 6 步标题即「单位圆，是数字世界的虚轴」，在圆上求值即频响 |
| 3 | [补锚] | 第 6 步现存 `s6lkLti`「冲激与 LTI：h 的指纹」 | lti#step2 | href 补 `#step2` | h 专讲步 |
| 4 | [内链]（补充） | 第 0 步 `s0e` 末尾编辑性补链 | fourier#step5 | 「这些频率成分是谁拆出来的：傅里叶页的频谱步 →」/ "Who splits a signal into these frequencies: the spectrum step on the Fourier page →" | 全页以频谱为前提但 i18n 全文无一处回链傅里叶（已 grep 核实），属编辑性补链 |

### modulation（现存 3 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 6 步现存 `s6lkF` | fourier#step5 | href 补 `#step5` | 链文案「信号由哪些频率组成」即频谱步 |
| 2 | [补锚] | 第 6 步现存 `s6lkS`「搬家时的翻车现场」 | sampling#step4 | href 补 `#step4` | 翻车即混叠，频域面孔在采样第 4 步 |
| 3 | [补锚] | 第 6 步现存 `s6lkR`「低通与带通本人」 | freqresp#step5 | href 补 `#step5` | 高通/带通/共振专讲步 |
| 4 | [内链]（补充） | 第 3 步 `s3e` RC 解调、τ 取舍处 | freqresp#step2 | 「这个 RC 就是一台低通滤波器：它的波特图读法 →」/ "This RC is a low-pass filter: how to read its Bode plot →" | `s3e` 明说二极管 + RC 解调、τ 太小纹波太大对角切割——τ 取舍即 RC 低通的频响取舍 |

### sampling（现存 3 条，全部无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 4 步 `s4e` 内现存 fourier 链 | fourier#step5 | href 补 `#step5` | 该句谈纯音在频谱上是一根峰，频谱专讲步 |
| 2 | [补锚] | 第 6 步现存 `s6linkF`「回傅里叶页看频谱为什么会复制」 | fourier#step5 | href 补 `#step5` | 同上 |
| 3 | [补锚] | 第 6 步现存 `s6linkC`「去卷积页看模糊核在干什么」 | convolution#step4 | href 补 `#step4` | 模糊核即图像卷积核专讲步；第 6 步正文正是抗混叠预模糊 |
| 4 | [内链]（补充） | 第 4 步 `s4e` 频谱复制句旁再加一条 | ztransform#step5 | 「同一件事在 z 平面的说法：条带与孪生点 →」/ "The same story on the z-plane: strips and twin points →" | Z 变换第 5 步专讲混叠是卷绕丢层，且其 `s5lkS` 已反链本页，互为回链 |

### trig（现存 1 条，无锚）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 6 步现存 `s6linkF`「去傅里叶页：把圆串成链」 | fourier#step4 | href 补 `#step4` | 本页 `s6fin` 自述「再往后一步，就是傅里叶变换」，串圆成链正是傅里叶第 4 步 |
| 2 | [内链]（可选） | 第 6 步 `s6fin` 内「傅里叶变换」一词处做链 | fourier#step4 | 与 #1 同目标；词链与终章链行并存不冲突，执行时二选其一亦可 | `s6fin` 原文已核 |

### control（现存跨页链 0 条）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链] | 第 2 步回路四环节讲解处（`s2e` 一带） | lti#step2 | 「回路里每个盒子都有自己的 h：先看系统对一记冲激的回答 →」/ "Every box in the loop has its own h: start with the answer to one impulse →" | 回路框图中的被控对象/控制器即 LTI 系统（编辑性补链：本页 i18n 未直提 LTI，已 grep 核实） |
| 2 | [终章] | 第 6 步 `.finale` 新建链行 | laplace#step4 | 「调参就是在搬极点：极点位置决定系统性格 →」/ "Tuning moves poles: pole locations are the system's character →" | 拉普拉斯第 4 步已反向以 `s4lkC` 链回本页（待补锚 control#step2） |
| 3 | [终章] | 同上 | kalman#step6 | 「先估计、再行动：卡尔曼与控制合体的 LQG →」/ "Estimate first, then act: LQG, where Kalman meets control →" | kalman `s6e` 明说估计 + 最优控制组成 LQG（已核原文） |
| 4 | [终章] | 同上 | lti#step3 | 「这台机器守的两条公理：线性与时不变 →」/ "The two axioms this machine obeys: linearity and time-invariance →" | 回路分析的前提即 LTI 契约 |

### eigen（现存跨页链 0 条）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链] | 第 4 步 `s4hint`「梯度下降在峡谷里之字形横跳」一句处 | gradient-descent#step2 | （句内链）「去峡谷里看之字形轨迹本身 →」/ "see the zig-zag itself in the canyon →" | 正文直提（已核 `s4hint` 原文） |
| 2 | [内链] | 第 5 步协方差/主成分讲解处（`s5e` 一带） | kalman#step5 | 「这条主方向在卡尔曼里怎么用：只测位置估速度 →」/ "How this principal direction is used in Kalman: velocity from position alone →" | kalman `s5e` 已反链本页第 5 步，此为回链；两页本步同题（协方差主方向） |
| 3 | [终章] | 第 6 步新建链行 | gradient-descent#step2 | 「峡谷的现场：条件数决定之字形 →」/ "The canyon itself: the condition number sets the zig-zag →" | 与 #1 同目标（终章区与正文链并存，本站 kalman 惯例） |
| 4 | [终章] | 同上 | kalman#step5 | 「协方差的主方向：卡尔曼的二维步 →」/ "Covariance's principal directions: Kalman's 2-D step →" | 与 #2 同目标 |

### gradient-descent（现存跨页链 0 条）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链] | 第 2 步 `s2e` κ（条件数）定义处 | eigen#step4 | 「κ 的真身在特征值页：峡谷长宽比 = λ 之比 →」/ "κ's true identity lives on the eigenvalue page: the canyon's aspect ratio is a ratio of λ's →" | 审计 D 组：eigen 第 4 步自述「梯度下降页的峡谷是它」；本步 `s2e` 已核 |
| 2 | [内链] | 第 4 步 `s4e`「每步只抽一小把样本、用它们的平均估梯度」处 | montecarlo#step2 | 「小样本平均的误差按 1/√N 定价：蒙特卡洛的账 →」/ "A small-sample average's error is priced at 1/√N: Monte Carlo's ledger →" | `s4e` 已核：SGD 即以随机样本平均做蒙特卡洛估计 |
| 3 | [终章] | 第 6 步新建链行 | entropy#step5 | 「它最小化的损失是什么：交叉熵与 KL →」/ "What loss it minimises: cross-entropy and KL →" | entropy `s5link` 已反链本页终章（待补锚 #step6），此为回链 |
| 4 | [终章] | 同上 | eigen#step4 | 「峡谷为什么是峡谷：主轴与对角化 →」/ "Why the canyon is a canyon: principal axes and diagonalisation →" | 与 #1 同目标 |

### kalman（已上线，勿重复加链）

已上线清单（2026-10-16 补丁）：

- [内链] 第 2 步 `s2e` → `../bayes/#step3`「昨天的后验，是今天的先验」✓
- [内链] 第 5 步 `s5e` → `../eigen/#step5`「特征值页第 5 步：方差最大的方向」✓
- [终章] `s6lkB` → `../bayes/#step3` ✓ · `s6lkE` → `../eigen/#step5` ✓

仅剩两条存量链未带锚，列为补锚待办（不算新增）：

| # | 类型 | 源步/插入点 | → 目标 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | [补锚] | 第 6 步现存 `s6lkC`「反馈与控制：怎样根据估计调整行动」 | control#step2 | href 由 `../control/` 补为 `../control/#step2`（回路结构步） |
| 2 | [补锚] | 第 6 步现存 `s6lkL`「冲激与 LTI：线性时不变系统」 | lti#step3 | href 补 `#step3`（LTI 两条公理的定义步） |

### mandelbrot（现存 1 条弱链）

| # | 类型 | 源步/插入点 | → 目标 | 说明 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [处置] | 第 6 步现存 `s6link`「回傅里叶页再看看那些圆」 | fourier#step0（若保留） | 该链与 convolution 页同文案，属早期模板回链，与本页主题（迭代/逃逸）概念依据弱。波 2 先补锚 `#step0` 止血，波 3 再议改链或删除 | 盘点发现，如实登记 |
| 2 | [内链]（可选） | 第 1 步迭代/逃逸讲解处（`s1e` 一带） | gradient-descent#step0 | 「另一种迭代：球每步乘一个乘子，过线就飞出去 →」/ "Another iteration: a ball multiplied each step, gone once the multiplier crosses the line →" | 两页同为迭代映射的收敛/发散判据（本页逃逸半径 2 对彼页乘子 (1−2η) 越出 (−1,1)），补充关系 |

### sorting（现存跨页链 0 条；与他页概念交叠少，不强凑）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链]（可选） | 第 2 步 `s2noteRand` 随机 pivot 期望性能处 | montecarlo#step6 | 「『随机抽一个』的随机从哪来：种子与可复现 →」/ "Where the 'pick one at random' randomness comes from: seeds and reproducibility →" | `s2noteRand` 已核：明说随机化给的是期望性能 |
| 2 | [内链]（可选） | 第 3 步 log-log 拟合斜率处（`s3e` 一带） | clt#step3 | 「同款读图法：CLT 页用 log-log 斜率验 σ/√n →」/ "The same plot-reading trick: CLT verifies σ/√n by a log-log slope →" | 两页第 3 步同为 log-log 斜率拟合（方法链，概念弱，如实标注） |

终章互链区：本页暂不设（强凑违反「链接文字须写明去学什么」；待有真关系再补，波 3 复议）。

### fractions（现存跨页链 0 条；小学学段，与他页交叠少）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [终章] | 第 6 步终章收束后新建一行 | montecarlo#step1 | 「下一站：比例长大了就是概率——撒得够多，频率会露出概率的脸 →」/ "Next stop: ratios grow up into probability — toss enough, and frequency shows probability's face →" | 本页第 6 步以分数/小数/百分数同点收束；概率线的频率入口正是蒙特卡洛第 1 步（K12 → 概率的桥） |


### pythagoras（本次新建；出链已实现）

| # | 类型 | 源步/插入点 | → 目标 | 链接文字（中 / EN） | 依据 |
| --- | --- | --- | --- | --- | --- |
| 1 | [内链] / [终章] | 第 6 步 `s6e` / `linkFractions` | fractions#step6 | 「分数的三种表示，对照 √2 为什么不在其中」/ "Three faces of fractions: compare with √2" | 对方仅讲分数/小数/百分数同点；√2 非分数的证明由本页提供，不声称对方讲了无理数 |
| 2 | [终章] | 第 6 步 `linkTrig` | trig#step1 | 「单位圆：cos²θ+sin²θ=1 怎样由勾股定理得到」/ "Unit circle: why cos²θ+sin²θ=1 follows from this theorem" | 已核本工作目录 trig 第 1 步单位圆的 sin/cos 坐标定义 |
| 3 | [终章] | 第 6 步 `linkEigen` | eigen#step1 | 「向量是一根箭头：拖动 v，看看矩阵怎样改变它」/ "A vector is an arrow: drag v and see how a matrix changes it" | 已核本地 knowledge-site/eigen：第 0 步为圆变椭圆；第 1 步直接拖 v 与 Av，依主表 51 修正，不误称对方专讲向量长度 |

本次新页记录独立于下方既有波 2 待办计数，不改历史审计任务总量。

---

## 三、执行计数汇总

| 源页 | 新增内链 | 新增终章 | 存量补锚 | 处置/可选 | 小计（必做） |
| --- | --- | --- | --- | --- | --- |
| bayes | 0 | 3 | 0 | 0 | 3 |
| clt | 0 | 0 | 4 | 0 | 4 |
| montecarlo | 2 | 2 | 0 | 0 | 4 |
| entropy | 0 | 0 | 3 | 可选 1 | 3 |
| fourier | 2 | 3 | 0 | 0 | 5 |
| convolution | 1 | 1 | 1 | 0 | 3 |
| lti | 0 | 0 | 4 | 0 | 4 |
| laplace | 1 | 0 | 4 | 0 | 5 |
| ztransform | 0 | 0 | 6 | 0 | 6 |
| freqresp | 1 | 0 | 3 | 0 | 4 |
| modulation | 1 | 0 | 3 | 0 | 4 |
| sampling | 1 | 0 | 3 | 0 | 4 |
| trig | 0 | 0 | 1 | 可选 1 | 1 |
| control | 1 | 3 | 0 | 0 | 4 |
| eigen | 2 | 2 | 0 | 0 | 4 |
| gradient-descent | 2 | 2 | 0 | 0 | 4 |
| kalman | — 已上线 — | — | 2 | 0 | 2（补锚） |
| mandelbrot | 0 | 0 | 0 | 处置 1 + 可选 1 | 1（处置含补锚） |
| sorting | 0 | 0 | 0 | 可选 2 | 0 |
| fractions | 0 | 1 | 0 | 0 | 1 |
| **合计** | **14** | **17** | **34** | 可选 5 | **66**（含 mandelbrot 处置 1） |

待加链总计：**必做 66 条** = 新增内链 14 + 新增终章 17 + 存量补锚 34（其中 kalman 2 条）+ mandelbrot 存量弱链处置 1 条（处置含补锚）；另有**可选 5 条**（entropy 1、trig 1、mandelbrot 1、sorting 2），执行波次可视余量取舍。各页小计之和与此处一致（66），以各页表格为执行准据。

## 四、留痕与未决

- A 组审计报告（fourier/convolution/sampling/control）在盘点时发现文件本身截断（止于 convolution 第 5 步），sampling/control 两页无独立「跨页链接」小节存世；该两页的链关系依据 SUMMARY.md 汇总（规则 12 最大簇为全站问题）与本表逐页源码盘点补齐，已在各条依据中注明来源。
- mandelbrot → fourier 存量链、sorting 终章缺位两处如实登记，未替它们编造概念关系。
- 本表只建图，未改任何页面代码（kalman 已上线部分除外，系此前补丁）。


<!-- leetcode-51-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Backtracking and constraint sets | `leetcode/51/#step1` | Reject column and diagonal conflicts, restore the exact legal prefix. |
| Enumerating all N-Queens boards | `leetcode/51/#step2` | Keep complete boards while undoing working placements. |

<!-- /leetcode-51-campaign -->


<!-- leetcode-52-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| counting complete search leaves | `leetcode/52/#step2` | Only a complete nonattacking arrangement increments the count. |
| diagonal constraint sets | `leetcode/52/#step1` | Use c, r-c, r+c to reject attacks before descending. |
| count-only backtracking | `leetcode/52/#step4` | Restore constraints while retaining the cumulative integer, without storing boards. |

<!-- /leetcode-52-campaign -->


<!-- leetcode-60-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| factorial blocks | `leetcode/60/#step1` | Equal contiguous blocks for each next digit. |
| zero-based rank | `leetcode/60/#step2` | Choose an unused digit by quotient and retain the remainder. |

<!-- /leetcode-60-campaign -->


<!-- leetcode-65-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Prefix invariant | `leetcode/65/#step1` | Track digits in the current mantissa or exponent part. |
| Grammar validation | `leetcode/65/#step2` | Inspect legal transitions and accepting prefixes. |

<!-- /leetcode-65-campaign -->


<!-- leetcode-68-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| maximal fitting prefix | `leetcode/68/#step0` | Accept consecutive words only while letters plus minimum gaps fit. |
| quotient and remainder | `leetcode/68/#step1` | Give leftmost remainder gaps one extra space. |
| loop invariant | `leetcode/68/#step4` | Maintain a consecutive fitting group and advance without losing words. |

<!-- /leetcode-68-campaign -->


<!-- leetcode-76-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Covering by multiplicity | `leetcode/76/#step0` | A contiguous window must supply every requested copy. |
| Missing-copy invariant | `leetcode/76/#step1` | Maintain the sum of positive count deficits using threshold crossings. |
| Monotone window boundaries | `leetcode/76/#step4` | Discarded starts cannot improve the recorded answer at later right edges. |

<!-- /leetcode-76-campaign -->


<!-- leetcode-84-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| interval minimum | `leetcode/84/#step0` | Area is interval width times its shortest height. |
| monotonic stack | `leetcode/84/#step1` | Pending heights stay nondecreasing. |
| excluded boundaries | `leetcode/84/#step2` | A popped rectangle has width i - left - 1. |

<!-- /leetcode-84-campaign -->


<!-- leetcode-85-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Histogram heights | `leetcode/85/#step1` | Consecutive ones encode rectangles ending at each row. |
| Monotonic stack | `leetcode/85/#step2` | Settle a pending height when a shorter bar fixes its right boundary. |

<!-- /leetcode-85-campaign -->


<!-- leetcode-123-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| cash-state dynamic programming | `leetcode/123/#step1` | Best cash per holding condition and transaction budget. |
| rolling state invariant | `leetcode/123/#step4` | Four previous-prefix maxima suffice for every legal next action. |

<!-- /leetcode-123-campaign -->
