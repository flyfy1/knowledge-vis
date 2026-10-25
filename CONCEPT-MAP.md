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

The mathematics and physics navigation atlas is at `atlas/?node=fourier`.
It reuses the lesson anchors below; `atlas/data.js` owns its 24 editorial concepts,
directed relationship statements, source links, and suggested routes. Atlas region
positions are not similarity scores or prerequisite claims.

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
| 77 | 乘法（面积模型）/ Multiplication as area | area-model#step2 | 一刀把 13×7 切成 10×7 与 3×7，两块面积之和恒等于整块——分配律是切法，总和不随切点变 |
| 78 | 周长与面积 / Perimeter vs area | perimeter-area#step1 | 同样 24 的周长，面积从 11 排到 36、6×6 达峰——周长相同面积可以差很远，越接近正方形越大 |
| 79 | 除法与余数 / Division and remainders | division-remainder#step1 | 数轴上一格一格跳着分：余数必须比除数小，还能再跳一格就说明还没分完 |
| 80 | 一次函数：斜率与截距 / Slope and intercept | linear-functions#step2 | y=kx+b 实时拼装——k 是每走一步抬高多少，b 是 x=0 时站在多高，直线上每个点代入都验算得上 |
| 81 | 对称轴与旋转对称 / Symmetry axes and rotational symmetry | symmetry-rotation#step2 | 风车转过 360°÷n 就与自己重合；平行四边形没有对称轴、却有 180° 旋转对称——翻和转是两回事 |
| 82 | 抛物线：顶点式与交点 / Parabola: vertex form and intercepts | parabola#step2 | y=a(x−h)²+k 把顶点 (h, k) 写在脸上，对称轴 x=h 跟着顶点一起搬家 |
| 83 | v-t 图面积就是路程 / Area under a v–t graph is distance | velocity-vt#step2 | 速度—时间图像下方的面积就是走过的路；加速段切成窄条数台阶和，条越细、台阶和越贴近真路程 |
| 84 | 定积分：黎曼和夹逼 / Definite integral: Riemann sums squeeze the value | integral#step1 | 曲线下面积切成细条，左和与右和从两侧夹住真值、缝宽恰为 1/n；条无限细时收敛到的数就是定积分 |
| 85 | 全反射与临界角 / Total internal reflection and the critical angle | reflection-refraction#step3 | 光从水射向空气，入射角超过临界角 asin(1/1.33)≈48.8° 时折射线消失、光全部反射回水里 |
| 86 | 导数：割线逼近切线 / Derivative: the secant closes into the tangent | derivative#step1 | 割线两点无限靠拢，斜率从正负两侧收敛到同一个数——那个数就是导数，割线的极限位置就是切线 |
| 87 | 凸透镜：一倍分虚实、二倍分大小 / Convex lens: 1f splits real from virtual, 2f splits size | lens#step2 | 蜡烛越过焦点 F，像由实变虚、跳到透镜同侧；越过 2F，像由放大变缩小——两个点管住全部成像规律 |
| 88 | 干涉：路程差定加强与抵消 / Interference: path difference decides reinforcement | interference#step1 | Δr=kλ 加强、Δr=(k+½)λ 抵消；干涉图样是双曲线族，由路程差的几何定死、不随时间漂移 |
| 89 | 对数是逆问句 / The logarithm is the reverse question | exp-log#step2 | log₂8=3 就是「2 的几次方等于 8」的答案；对数把指数方程的未知数从指数的位置上取下来，成为可以直接算的数 |
| 90 | ROC 含单位圆 ⟺ 稳定 / Stability: the ROC contains the unit circle | ztransform#step3 | Z 变换的收敛域是圆环；单位圆整个落在环内系统才稳定，极点位置与 ROC 形状共同决定稳定性 |
| 91 | 圆周角定理：同弧圆周角 = 圆心角一半 / Inscribed angle theorem | circle-angles#step1 | 角度由坐标向量点积实算；P 在优弧上任意拖动，圆周角恒为圆心角的一半，与位置无关 |
| 92 | 圆周角的证明：两个等腰三角形 / Proof via two isosceles triangles | circle-angles#step2 | 连 OP 后由两组等腰三角形的底角关系推出一半；P 在优弧、劣弧、直径（直角）三种位置分别成立 |
| 93 | 乘 i = 逆时针旋转 90° / Multiplying by i rotates 90° | complex-numbers#step3 | (a,b) 乘 i 得 (−b,a)，正是坐标逆时针转 90°；连乘四次回到原点，轨道由旋转矩阵实算 |
| 94 | 复数乘法 = 模相乘、角相加 / Multiplication: moduli multiply, angles add | complex-numbers#step4 | 代数展开与几何旋转两条路同源实算同一个积，随机参数双路互证 |
| 95 | 驻波的包络：波节不动、波腹 2A / The standing-wave envelope | standing-wave#step1 | 合位移由两列反向波方程实算；每点振幅被包络定死——波节任意时刻位移为 0，波腹达 2A |
| 96 | 两端固定弦的模式：L = nλ/2 / Modes of a fixed-fixed string | standing-wave#step2 | 只有半波长整数倍的波能住进弦长，基频的整数倍 f_n = n·f₁ 才是被放行的台阶 |
| 97 | 负数是基准另一边的量 / Negatives: amounts on the other side of zero | negative-numbers#step0 | 温度与楼层都以 0 为基准：符号记方向、数值记离基准多远 |
| 98 | 数轴上越往左越小 / Further left on the number line means smaller | negative-numbers#step1 | 比较负数靠位置：−3 在 −7 的右边，所以 −3 更大（更暖）；比较由纯函数按位置判定 |
| 99 | 撤回向左走：减法的现象 / Undoing a leftward step | negative-numbers#step3 | 向左走是减，撤回这一步就回到原处——只演示现象，不立「负负得正」法则 |
| 100 | 透镜作图的三条光线 / The three construction rays of a lens | lens#step1 | 透镜成像作图取有代表性的三条光线，交点定像的位置与大小（pinhole-camera 终章深链落点，2026-10-20 补登） |
| 101 | 小孔成像：像高由相似三角形定 / Pinhole imaging: image height from similar triangles | pinhole-camera#step2 | 像高/物高 = 像距/物距；像倒立且左右交换，全部由光的直线传播作图实算 |
| 102 | 空间对角线 = 两次勾股 / The space diagonal is Pythagoras twice | space-diagonal#step1 | 先底面对角线 e=√(a²+b²)，再以 e 与高 c 第二次勾股 d=√(e²+c²)；账本用未舍入的 e²，只对长方体成立（全站首个 3D 页，Three.js 自托管） |
| 103 | 坐标是相对原点的地址 / Coordinates are addresses relative to the origin | coordinate-plane#step2 | 原点一换，所有点的读数同步平移——点没动，地址变了；读数全页钳在 [−6,6] 标尺内 |
| 104 | 坐标换位 = 沿对角线翻折 / Swapping coordinates reflects across the diagonal | coordinate-plane#step4 | (a,b)→(b,a) 是沿 y=x 的翻折；落在对角线上的点（如 (4,4)）换位后不动 |
| 105 | 物态由粒子排布与运动定 / States are particle arrangement and motion | particles-states#step0 | 固态原地振动、液态贴身流动、气态自由乱飞——页面是逐帧真模拟，物态名由模拟量纯函数判定、不读滑杆 |
| 106 | 温度 = 粒子平均动能的读数 / Temperature reads mean particle kinetic energy | particles-states#step1 | 温度读数只能由粒子 RMS 速率映射得到；熔化时升温停在平台（#step2），粒子数全程守恒 |
| 107 | 元素身份只由质子数定 / Element identity is fixed by the proton count alone | atomic-structure#step1 | Z 改 1、身份就换一家；中子只改质量数 A=Z+N、不换身份；身份判定就是查 Z 本身 |
| 108 | 电子按层排布、每层容量有定数 / Electrons arrange in layers of fixed capacity | atomic-structure#step2 | 本页初中简化口径 2/8/8（明示非真实规则）；排布由电子数经纯函数逐层填出，层圈只是住址分区、电子不沿圈公转 |
| 109 | 离子电荷 = 质子数 − 电子数 / Ion charge = protons − electrons | atomic-structure#step4 | 电荷由两数实算：电子多为阴离子、电子少为阳离子；超出 2/8/8 表达范围时页面明示只作电荷记账 |
| 110 | 力矩平衡：力 × 力臂，两边相等就平衡 / Torque balance: force × lever arm, equal on both sides | lever-pulley#step0 | 支点挪动改变力臂比、F 随之实算；倾斜角只是示意、力矩数是实算（3D 页，逻辑与 2D 定版逐字节同源） |
| 111 | 滑轮组省力倍数 = 承重绳段数 / Pulley force multiple = load-bearing rope segments | lever-pulley#step4 | F=G/n、h=s/n 且绳长守恒；本页绕法里奇数段自由端垂自定滑轮不计段、偶数段自由端向上出动滑轮计段 |
| 112 | 等式性质：两边同做一件事，平衡不变 / Do the same to both sides and the balance holds | equations-balance#step1 | 同加同减、同乘同除（除数须整除）都保平衡；只动一边当场破平衡——全页不使用「移项变号」口诀 |
| 113 | 解方程 = 把 x 单独留在一边 / Solving means leaving x alone on one side | equations-balance#step3 | 用等式性质逐步剥离，isIsolated 达标才揭晓，解必代回原式验算 |
| 114 | 两步方程：顺序自定、殊途同归 / Two-step equations: either order works | equations-balance#step4 | 先减后除或先除后减都认，操作历史逐条留轨迹，终点由纯函数判定 |
| 115 | 自转一周 = 一昼夜 / One full rotation = one day-night cycle | day-night-rotation#step2 | 地球绕地轴自转，同一地点随自转角被带过晨昏线；时间带随播放逐段涂出，一圈正好 24 小时 |
| 116 | 东升西落是站在转动地面上的视角 / East-rise west-set is the view from the turning ground | day-night-rotation#step3 | 太阳高度角由自转角实算；把自转反过来，太阳立刻改从西边升起——方向感来自自转方向 |
| 117 | 质量守恒 = 原子重排计数 / Mass conservation = counting rearranged atoms | mass-conservation#step1 | 反应式两边逐种原子计数由纯函数实算，配不平时天平当场倾斜报警 |
| 118 | 敞口「不守恒」是气体在进出 / Open-system surprises are gases moving | mass-conservation#step3 | 逸出量由气体产物质量实算；接上收集气球，总重立刻回来 |
| 119 | 细胞器分工 / Organelles divide the labour | cell-structure#step2 | 膜定边界、核总控、线粒体供能、叶绿体造糖、液泡储物，点选高亮与功能卡同步 |
| 120 | 动植物细胞三处不同 / Three plant-vs-animal differences | cell-structure#step3 | 细胞壁、叶绿体、大液泡——相同结构同色、差异自动标出并自测 |
| 121 | 光合作用的原子账 / The photosynthesis atom ledger | photosynthesis#step1 | 6CO₂+6H₂O 两边 C/H/O 逐项对平，与质量守恒同账 |
| 122 | 限制因素：最短的板定水位 / The limiting factor rules the rate | photosynthesis#step3 | 光与 CO₂ 两因子取小者定速率，补 CO₂ 增产就是抬最短的板 |
| 123 | 逻辑斯蒂：S 形是逐代算出来的 / The logistic S falls out of iteration | population-growth#step2 | 实际增长率 r(1−N/K) 随 N 逼近 K 而减小，同参对照指数线看分家点 |
| 124 | K 是吸引子 / K is an attractor | population-growth#step3 | N₀ 在 K 上方也回落，两个方向的实际增长率符号都指向 K |
| 125 | 平衡 = 正逆速率相等 / Equilibrium means equal forward and reverse rates | chemical-equilibrium#step1 | 两条速率由模拟滑窗实测，相等时计数才走平；平衡浓度可以不等 |
| 126 | 勒夏特列：体系抵抗扰动 / Le Chatelier: the system pushes back | chemical-equilibrium#step2 | 平衡时加料，净变化方向由模拟计数实算，体系在新水平重新走平 |
| 127 | 速率 = 成功碰撞的次数 / Rate means counting successful collisions | reaction-rates#step0 | 成功与失败碰撞分开计数实测，碰上但能量不足不算数 |
| 128 | 催化剂是降门槛，不是催快粒子 / A catalyst lowers the bar, not the speed | reaction-rates#step4 | 降阈值时粒子平均速率不变（实测读数），达标比例上升——与升温改分布对照 |

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


<!-- leetcode-87-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| recursive string partition | `leetcode/87/#step0` | Split contiguous nonempty pieces and independently keep or swap. |
| interval dynamic programming | `leetcode/87/#step1` | Two start positions and a shared length identify a reusable Boolean state. |
| inductive correctness | `leetcode/87/#step4` | Both root alignments are necessary and sufficient when their child states are correct. |

<!-- /leetcode-87-campaign -->


<!-- leetcode-115-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Subsequence counting | `leetcode/115/#step1` | Partition index selections into skipping or using the last source position. |
| Reverse rolling DP | `leetcode/115/#step2` | Keep the previous source-prefix row available during in-place updates. |

<!-- /leetcode-115-campaign -->


<!-- leetcode-123-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| cash-state dynamic programming | `leetcode/123/#step1` | Best cash per holding condition and transaction budget. |
| rolling state invariant | `leetcode/123/#step4` | Four previous-prefix maxima suffice for every legal next action. |

<!-- /leetcode-123-campaign -->


<!-- leetcode-124-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| One-arm gain | `leetcode/124/#step1` | Only a single downward arm can be attached to a parent. |
| Postorder tree DP | `leetcode/124/#step2` | Complete both children before forming a node summary. |

<!-- /leetcode-124-campaign -->


<!-- leetcode-126-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| BFS shortest distances | `leetcode/126/#step1` | First discovery fixes minimum replacements. |
| Multiple shortest parents | `leetcode/126/#step2` | Keep every edge that increases distance by one. |
| Path reconstruction | `leetcode/126/#step4` | Follow decreasing distances to enumerate all answers. |

<!-- /leetcode-126-campaign -->


<!-- leetcode-127-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Breadth-first search | `leetcode/127/#step1` | First-discovery distances in a FIFO queue. |
| Shortest-path invariant | `leetcode/127/#step2` | Why marking words at enqueue time preserves minimum distance. |

<!-- /leetcode-127-campaign -->


<!-- leetcode-132-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Palindrome recurrence | `leetcode/132/#step1` | Reuse the palindrome status of the inner substring. |
| Prefix partition minimum | `leetcode/132/#step2` | Compare every possible last palindrome piece. |

<!-- /leetcode-132-campaign -->


<!-- leetcode-30-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Word-aligned sliding window | `leetcode/30/#step1` | Reuse word counts across aligned starts; shrink excess counts and scan every remainder. |
| Retained window and operation state | `leetcode/30/#step2` | Compare before and after counts and exclusive window boundaries during add, shrink and reset. |

<!-- /leetcode-30-campaign -->


<!-- leetcode-135-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Directional lower bounds | `leetcode/135/#step2` | Derive left and right candy requirements from adjacent rating chains. |
| Componentwise minimum | `leetcode/135/#step4` | Prove feasibility and minimality of the maximum of directional bounds. |

<!-- /leetcode-135-campaign -->


<!-- leetcode-140-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Suffix sentence enumeration | `leetcode/140/#step1` | Derive complete suffix lists and the empty-suffix base case. |
| Output-sensitive word break | `leetcode/140/#step4` | Map enumeration to Python and account for cached strings. |

<!-- /leetcode-140-campaign -->


<!-- leetcode-32-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Validity by hand | `leetcode/32/#step0` | Trace balance from each candidate start; reject negative prefixes and require a zero ending. |
| Excluded boundary stack | `leetcode/32/#step1` | Retain unmatched opening indices and an uncrossable closing boundary to avoid rescanning. |
| Reversible parenthesis scan | `leetcode/32/#step2` | Compare pop, boundary reset, current valid suffix length and historical best. |

<!-- /leetcode-32-campaign -->


<!-- leetcode-149-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Exact undirected direction | `leetcode/149/#step1` | Reduce integer displacement by gcd and normalize its sign. |
| Anchor direction counting | `leetcode/149/#step2` | Count peers sharing one line through a fixed point. |
| Earliest-anchor completeness | `leetcode/149/#step4` | Prove a suffix scan still visits every member of an optimal line. |

<!-- /leetcode-149-campaign -->


<!-- leetcode-154-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Duplicate-aware binary search | `leetcode/154/#step1` | Derive safe interval reductions when endpoint values can be equal. |
| Minimum-preserving invariant | `leetcode/154/#step4` | Keep at least one global minimum while strictly shrinking the interval. |

<!-- /leetcode-154-campaign -->


<!-- leetcode-37-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Sudoku backtracking and restoration | `leetcode/37/#step1` | Cache used digits and restore the board and all three constraint sets after failure. |
| Local validity versus completion | `leetcode/37/#step0` | Hand-calculate a legal move that leaves the next cell without a candidate. |

<!-- /leetcode-37-campaign -->


<!-- leetcode-174-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Backward entry-health DP | `leetcode/174/#step1` | Derive the minimum health before entering each room. |
| Rolling-row dependency invariant | `leetcode/174/#step4` | Reuse a row while preserving right and down successor needs. |

<!-- /leetcode-174-campaign -->


<!-- leetcode-41-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Presence by placement | `leetcode/41/#step1` | Derive x minus one as the destination and bound useful swaps by permanently filled slots. |
| Reversible placement trace | `leetcode/41/#step2` | Follow chained swaps and duplicate stops with explicit operation markers. |

<!-- /leetcode-41-campaign -->


<!-- leetcode-185-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Dense rank | `leetcode/185/#step1` | One plus the number of larger distinct salaries in the same department. |
| Group boundaries | `leetcode/185/#step2` | Restart ranking for each department ID. |

<!-- /leetcode-185-campaign -->


<!-- leetcode-188-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| budget-indexed stock dynamic programming | `leetcode/188/#step1` | Derive holding and flat cash maxima for each transaction budget. |
| daily cash invariant | `leetcode/188/#step4` | Prove old-prefix maxima cover every legal trade history. |

<!-- /leetcode-188-campaign -->


<!-- leetcode-42-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Settled water and running maxima | `leetcode/42/#step2` | Prove why the lower known maximum settles one endpoint. |

<!-- /leetcode-42-campaign -->


<!-- leetcode-212-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Trie prefix pruning | `leetcode/212/#step1` | Share prefixes while preserving terminal markers and child branches. |
| Board backtracking invariant | `leetcode/212/#step2` | A numbered simple path matches the current trie prefix; undo restores it. |

<!-- /leetcode-212-campaign -->


<!-- leetcode-214-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Longest palindromic prefix | `leetcode/214/#step1` | Reduce prepend-only palindrome construction to an equal prefix and suffix. |
| KMP prefix function fallback | `leetcode/214/#step2` | Retain matched borders and fall back without rechecking known characters. |

<!-- /leetcode-214-campaign -->


<!-- leetcode-44-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Repeated prefix pairs | `leetcode/44/#step0` | Follow two recursive paths to the same empty-text and b-star call. |
| Standalone wildcard dependencies | `leetcode/44/#step1` | Derive empty consumption from left and one more character from above. |
| Rolling rows | `leetcode/44/#step4` | Map prefix dependencies to two live rows in the Python solution. |

<!-- /leetcode-44-campaign -->


<!-- leetcode-220-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Index-bounded window | `leetcode/220/#step1` | Retain exactly the preceding positions within the inclusive index distance. |
| Integer value buckets | `leetcode/220/#step2` | Use width valueDiff + 1 and check the current and adjacent buckets. |
| Bucket-window invariant | `leetcode/220/#step4` | Expire before probing and insert only after excluding all earlier witnesses. |

<!-- /leetcode-220-campaign -->


<!-- leetcode-224-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Saved calculator contexts | `leetcode/224/#step2` | Preserve outer total and sign while evaluating a parenthesized term. |
| Iterative expression evaluation | `leetcode/224/#step4` | Map sign, digit accumulation and parenthesis merging to Python. |

<!-- /leetcode-224-campaign -->


<!-- leetcode-218-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| skyline endpoint sweep | `leetcode/218/#step2` | Group equal-coordinate events and retain the tallest unexpired heap root. |
| lazy heap removal | `leetcode/218/#step4` | Prove why expired entries below the root can be removed later. |

<!-- /leetcode-218-campaign -->


## Circuits and energy (2026-10-18)

| Concept | Lesson anchor |
|---|---|
| Voltage, current, power; KCL/KVL | /power-converters/#step0 |
| Inductor, magnetic energy | /power-converters/#step1 |
| Capacitor, electric energy | /power-converters/#step2 |
| Ideal switch/diode; PWM duty | /power-converters/#step3 |
| Buck; volt-second balance | /power-converters/#step4 |
| Boost; two energy paths | /power-converters/#step5 |
| Efficiency and power budget | /power-converters/#step6 |

Atlas adds seven concepts and twelve sourced relations in Circuits & energy. Feedback links to /control/#step2; the converter lesson does not simulate loop dynamics.


<!-- leetcode-239-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Expired index | `leetcode/239/#step2` | Remove indices that have fallen left of the current window. |
| Monotonic decreasing deque | `leetcode/239/#step3` | Keep only candidates whose values decrease from front to back. |
| Amortized linear time | `leetcode/239/#step4` | Each index enters and leaves the deque at most once. |

<!-- /leetcode-239-campaign -->


<!-- leetcode-233-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| place-value cycles | `leetcode/233/#step1` | Each decimal position repeats every 10f numbers. |
| higher/current/lower invariant | `leetcode/233/#step2` | The three parts determine the unfinished cycle contribution. |

<!-- /leetcode-233-campaign -->


<!-- leetcode-262-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Eligibility join | `leetcode/262/#step0` | Keep a trip only when both its client and driver are unbanned. |
| Daily conditional rate | `leetcode/262/#step2` | For each day, divide cancelled eligible requests by all eligible requests. |
| Pandas groupby | `leetcode/262/#step4` | Map the invariant to the official DataFrame callable. |

<!-- /leetcode-262-campaign -->


<!-- leetcode-273-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| 三位分组 | `leetcode/273/#step0` | 按 1000 拆分整数并给每组附加位阶词 |
| 零与空组不变式 | `leetcode/273/#step2` | 空组不产出文字，顶层零才输出 Zero |
| 商与余数扫描 | `leetcode/273/#step3` | 用 num % 1000 和 num // 1000 逐组处理 |

<!-- /leetcode-273-campaign -->


<!-- leetcode-295-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Two-heap split | `leetcode/295/#step2` | Lower max-heap and upper min-heap expose the middle values. |
| Balance invariant | `leetcode/295/#step2` | Every lower value is ≤ every upper value and sizes differ by at most one. |

<!-- /leetcode-295-campaign -->


<!-- leetcode-297-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| preorder with null markers | `leetcode/297/#step0` | Visit node, left, right, and record every empty child. |
| subtree decoding invariant | `leetcode/297/#step2` | Each recursive call consumes exactly one complete subtree encoding. |

<!-- /leetcode-297-campaign -->


<!-- leetcode-301-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Removal budget | `leetcode/301/#step1` | Count unmatched left and right parentheses before searching. |
| Balance invariant | `leetcode/301/#step2` | A prefix balance never becomes negative and ends at zero. |
| Duplicate-free branching | `leetcode/301/#step2` | Skip adjacent equal deletion choices. |

<!-- /leetcode-301-campaign -->


<!-- leetcode-312-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| interval DP | `leetcode/312/#step1` | Fixed boundaries and a final-choice recurrence. |
| DP invariant | `leetcode/312/#step2` | Each saved cell is optimal for its open interval. |
| sentinel boundaries | `leetcode/312/#step3` | Artificial 1s make edge products uniform. |

<!-- /leetcode-312-campaign -->


<!-- leetcode-315-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| 后缀与逆序处理 / Suffix and reverse processing | `leetcode/315/#step2` | 从右向左让已处理集合恰好等于右侧元素。 |
| 前缀和 / Prefix sums | `leetcode/315/#step3` | 按秩累计频率，查询 rank−1 得到严格更小数量。 |

<!-- /leetcode-315-campaign -->


<!-- leetcode-321-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Greedy digit deletion | `leetcode/321/#step1` | Exchange smaller tails while deletion budget remains. |
| Suffix-aware merge | `leetcode/321/#step2` | Resolve equal heads using the entire remaining suffix. |

<!-- /leetcode-321-campaign -->


<!-- leetcode-327-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Prefix differences | `leetcode/327/#step1` | Convert a contiguous sum into a difference of two prefix totals. |
| Cross-half range counting | `leetcode/327/#step2` | Preserve index order by splitting before sorting; count with two monotone boundaries. |

<!-- /leetcode-327-campaign -->


<!-- leetcode-329-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Peak-removal rounds | `leetcode/329/#step2` | Count longest increasing paths by removing ready local peaks. |
| Longest-path recurrence | `leetcode/329/#step1` | Derive one plus the maximum larger-neighbor suffix length. |

<!-- /leetcode-329-campaign -->


<!-- leetcode-330-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| coverage invariant | `leetcode/330/#step1` | Represent every attainable sum below miss by one complete interval. |
| greedy patch | `leetcode/330/#step2` | Patch miss when the next sorted value cannot fill the first gap. |

<!-- /leetcode-330-campaign -->


<!-- leetcode-332-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Ordered Euler traversal | `leetcode/332/#step2` | Consume ticket edges in lexical order, append exhausted airports, then reverse. |

<!-- /leetcode-332-campaign -->


<!-- leetcode-335-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| First-crossing geometry | `leetcode/335/#step1` | Derive the three local intersection tests from closed coordinate spans. |
| Reversible path trace | `leetcode/335/#step2` | Compare prefix coordinates and inclusive inequalities at each move. |

<!-- /leetcode-335-campaign -->


<!-- leetcode-336-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Palindrome pair cancellation | `leetcode/336/#step1` | Two leftover-middle cases derive reversed-trie metadata |
| Linear palindrome boundary flags | `leetcode/336/#step2` | Odd/even mirrored radii mark prefix and suffix palindromes |

<!-- /leetcode-336-campaign -->


<!-- leetcode-352-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Maximal disjoint intervals | `leetcode/352/#step1` | Derive exact coverage, sorted starts and a missing-integer gap. |
| Two-neighbor insertion | `leetcode/352/#step2` | Binary-search a start and inspect both neighboring ranges. |

<!-- /leetcode-352-campaign -->


<!-- leetcode-354-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Equal-width ordering | `leetcode/354/#step1` | Descending height ties reduce strict two-dimensional nesting to LIS. |
| Minimal tails invariant | `leetcode/354/#step2` | First greater-or-equal replacement preserves best attainable ending heights. |

<!-- /leetcode-354-campaign -->


<!-- leetcode-363-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Row-band compression | `leetcode/363/#step1` | Each rectangle becomes an interval in a fixed row band. |
| Eligible earlier prefix | `leetcode/363/#step2` | Choose the smallest earlier q ≥ P−k before inserting P. |

<!-- /leetcode-363-campaign -->


<!-- leetcode-381-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Multiplicity-weighted sampling | `leetcode/381/#step0` | Uniform positions give each value probability count / length. |
| Duplicate-aware swap deletion | `leetcode/381/#step2` | Repair reverse index sets when the tail fills the deleted slot. |

<!-- /leetcode-381-campaign -->


<!-- leetcode-391-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Odd corner invariant | `leetcode/391/#step2` | Toggle corners and combine parity with area to prove exact cover. |
| Coverage baseline | `leetcode/391/#step1` | Count unit-cell coverage independently of the corner test. |

<!-- /leetcode-391-campaign -->


<!-- leetcode-403-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Frog jump reachability | `leetcode/403/#step2` | Keep every possible arrival jump length at each stone. |
| State sufficiency | `leetcode/403/#step1` | Why a reached-stone flag loses legal continuations. |

<!-- /leetcode-403-campaign -->


<!-- leetcode-407-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Minimum escape bottleneck | `leetcode/407/#step1` | Water level is the smallest possible maximum ground height along a path to the boundary. |
| Lowest frontier expansion | `leetcode/407/#step2` | Discover each cell once from the smallest fixed escape level and retain cumulative water. |

<!-- /leetcode-407-campaign -->


<!-- leetcode-410-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Binary search on a feasible cap | `leetcode/410/#step2` | Keep the smallest feasible cap in an inclusive interval. |
| Greedy contiguous partition | `leetcode/410/#step1` | A maximal prefix under a nonnegative sum cap minimizes group count. |

<!-- /leetcode-410-campaign -->


<!-- leetcode-420-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Password run repair | `leetcode/420/#step1` | Derive floor(L/3) replacements per equal-character run. |
| Deletion priority | `leetcode/420/#step2` | Spend compulsory deletions by marginal replacement savings. |

<!-- /leetcode-420-campaign -->


<!-- leetcode-432-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Ordered nonempty count buckets | `leetcode/432/#step2` | Unit count updates need only the immediate neighboring bucket. |
| Constant-time extreme-key queries | `leetcode/432/#step4` | Sentinels and linked key entries expose an extreme representative directly. |

<!-- /leetcode-432-campaign -->


<!-- leetcode-440-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Lexicographical prefix counting | `leetcode/440/#step1` | Count a decimal-prefix group with clipped half-open intervals. |
| Lexicographical rank invariant | `leetcode/440/#step2` | Maintain remaining moves when skipping a prefix group or descending. |

<!-- /leetcode-440-campaign -->


<!-- leetcode-446-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| arithmetic subsequence counting | `leetcode/446/#step0` | Count ordered position selections with equal gaps and at least three terms. |
| endpoint and difference DP | `leetcode/446/#step2` | Store length-two seeds and extend completed source rows. |
| unique penultimate index proof | `leetcode/446/#step4` | Every counted answer belongs to one final position pair. |

<!-- /leetcode-446-campaign -->


<!-- leetcode-458-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Outcome capacity | `leetcode/458/#step1` | Derive the matching counting bound and feeding construction. |
| Reversible feeding schedule | `leetcode/458/#step2` | Observe death rounds and retain consistent bucket candidates. |

<!-- /leetcode-458-campaign -->


<!-- leetcode-460-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| LFU frequency buckets | `leetcode/460/#step2` | Maintain oldest-first keys per frequency and the smallest live frequency. |

<!-- /leetcode-460-campaign -->


<!-- leetcode-466-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Boundary-state cycle skipping | `leetcode/466/#step2` | Equal next-needed character indices repeat the same block gains. |
| Greedy repeated subsequence matching | `leetcode/466/#step1` | Carry unfinished target progress across source blocks. |

<!-- /leetcode-466-campaign -->


<!-- leetcode-472-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Prefix reachability | `leetcode/472/#step1` | Merge cut histories that reach the same prefix boundary. |
| Exclude self-match | `leetcode/472/#step2` | Forbid the edge from 0 to n so a witness uses at least two shorter words. |

<!-- /leetcode-472-campaign -->


<!-- leetcode-479-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Descending palindrome candidates | `leetcode/479/#step1` | Mirror prefixes and scan lengths in descending order. |
| Larger-factor square cutoff | `leetcode/479/#step2` | Test all possible larger factors and stop when x² < p. |

<!-- /leetcode-479-campaign -->


<!-- leetcode-480-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Sliding window median | `leetcode/480/#step0` | Count repeated occurrences and average the middle pair for even k. |
| Count tree rank selection | `leetcode/480/#step2` | Use left subtree counts to preserve the desired occurrence rank. |

<!-- /leetcode-480-campaign -->


<!-- leetcode-514-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Endpoint dynamic programming | `leetcode/514/#step2` | Keep the cheapest spelling cost for every possible dial endpoint. |

<!-- /leetcode-514-campaign -->


<!-- leetcode-282-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Backtracking choices | `leetcode/282/#step1` | Cut or join each digit gap and undo after recursion. |
| Precedence repair with last | `leetcode/282/#step2` | Replace the last additive term when multiplying. |

<!-- /leetcode-282-campaign -->


<!-- leetcode-517-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Cut-flow conservation | `leetcode/517/#step1` | A prefix surplus fixes the net flow across its boundary. |
| Parallel sender bottleneck | `leetcode/517/#step2` | Combine cut throughput and positive local surplus in one scan. |

<!-- /leetcode-517-campaign -->


<!-- leetcode-483-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| All-ones geometric sum | `leetcode/483/#step0` | Read base-k place values as 1+k+...+k^m. |
| Monotone exact search | `leetcode/483/#step2` | Discard impossible integer bases using an inclusive interval invariant. |

<!-- /leetcode-483-campaign -->


<!-- leetcode-493-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| reverse pairs | `leetcode/493/#step0` | Strict doubled comparison at original ordered indices |
| monotone prefix counting | `leetcode/493/#step1` | Sorted right prefix and nondecreasing boundary |
| merge sort counting | `leetcode/493/#step2` | Disjoint within-half and cross-half pair accounting |

<!-- /leetcode-493-campaign -->


<!-- leetcode-488-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Zuma stable board and remaining hand | `leetcode/488/#step2` | Normalize every chain reaction before caching the complete board and hand state. |
| Exact memoized insertion search | `leetcode/488/#step4` | Enumerate all legal successor states, including setup moves, and reuse identical subproblems. |

<!-- /leetcode-488-campaign -->


<!-- leetcode-552-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Attendance counting with six states | `leetcode/552/#step2` | Group valid prefixes by absences used and trailing late run. |
| Counting invariant and rolling arrays | `leetcode/552/#step4` | Maintain disjoint counts with fresh next-day storage. |

<!-- /leetcode-552-campaign -->


<!-- leetcode-546-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Interval DP with a carried boundary | `leetcode/546/#step2` | Remember saved equal-color boxes while clearing the separating interval. |

<!-- /leetcode-546-campaign -->


<!-- leetcode-502-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Affordable profit dominance | `leetcode/502/#step1` | Exchange the first choice without losing any later feasible project. |
| Sorted capital frontier and max heap | `leetcode/502/#step2` | Admit each project once; extract the largest affordable profit. |

<!-- /leetcode-502-campaign -->


<!-- leetcode-591-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| tag-validation | `leetcode/591/#step2` | Ordered pending tags, one enclosing root and opaque CDATA scanning |

<!-- /leetcode-591-campaign -->


<!-- leetcode-564-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Palindrome candidate completeness | `leetcode/564/#step2` | Neighboring prefixes and digit-length boundaries cover the nearest other palindrome. |

<!-- /leetcode-564-campaign -->


<!-- leetcode-587-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| convex hull boundary | `leetcode/587/#step0` | All perimeter trees, including collinear edge trees |
| signed turn | `leetcode/587/#step1` | Integer cross product distinguishes left, straight and right |
| monotone chain | `leetcode/587/#step2` | Repeated strict-right-turn removal in two sorted scans |

<!-- /leetcode-587-campaign -->


<!-- leetcode-600-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Binary suffix counting | `leetcode/600/#step1` | Split valid padded bit strings into leading 0 and leading 10 cases. |
| First-different-bit partition | `leetcode/600/#step2` | Count disjoint smaller-prefix branches and stop the equal path at adjacent ones. |

<!-- /leetcode-600-campaign -->


<!-- leetcode-630-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Deadline ordering | `leetcode/630/#step1` | Exchange adjacent inverted deadlines without losing feasibility. |
| Longest-course removal | `leetcode/630/#step2` | Repair the first overload while preserving an optimal possible count. |
| Max heap | `leetcode/630/#step4` | Negated durations expose the longest retained course. |

<!-- /leetcode-630-campaign -->


<!-- leetcode-629-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Insertion counting bijection | `leetcode/629/#step1` | Insert the unique maximum to add exactly the number of smaller values to its right. |
| Sliding sum over a DP row | `leetcode/629/#step2` | Add the entering count and remove the expired count while retaining separate previous and current rows. |

<!-- /leetcode-629-campaign -->


<!-- leetcode-632-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Minimum-frontier range scan | `leetcode/632/#step2` | Advance the smallest selected row value while maintaining the largest selected value. |

<!-- /leetcode-632-campaign -->


<!-- leetcode-639-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Disjoint final-token counting | `leetcode/639/#step1` | Count valid one-digit and two-digit endings without admitting zero as a wildcard. |
| Rolling prefix decoding counts | `leetcode/639/#step2` | Extend the two preceding prefix counts through disjoint final-token cases. |

<!-- /leetcode-639-campaign -->


<!-- leetcode-601-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Consecutive-ID triple witnesses | `leetcode/601/#step1` | Derive complete runs from overlapping valid triples. |
| Union invariant | `leetcode/601/#step2` | Marked IDs equal the union of all complete triples tested so far. |

<!-- /leetcode-601-campaign -->


<!-- leetcode-664-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Interval DP with shared print turns | `leetcode/664/#step2` | Share the final character’s turn with a matching earlier position and independently repair the gap. |

<!-- /leetcode-664-campaign -->


<!-- leetcode-668-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Multiplication-table threshold count | `leetcode/668/#step1` | Count cells at most x using clipped row prefixes. |
| First sufficient value invariant | `leetcode/668/#step2` | Keep C(lo−1)<k≤C(hi) while shrinking an inclusive value interval. |

<!-- /leetcode-668-campaign -->


<!-- leetcode-679-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Pair-reduction invariant | `leetcode/679/#step2` | Disjoint subexpressions partition the original card identities. |
| Exact rational search | `leetcode/679/#step4` | Fraction values avoid rounding tolerances in the four-card search. |

<!-- /leetcode-679-campaign -->


<!-- leetcode-675-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Ordered shortest paths | `leetcode/675/#step1` | Static walkability makes the sum of shortest required legs optimal. |
| Breadth-first search layers | `leetcode/675/#step2` | Discover each cell once at its shortest unit-cost distance. |

<!-- /leetcode-675-campaign -->


<!-- leetcode-689-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Fixed-middle decomposition | `leetcode/689/#step1` | Bound arbitrary legal triples by independent best side windows. |
| Tie-aware prefix and suffix maxima | `leetcode/689/#step2` | Opposite scan directions require different tie comparisons. |

<!-- /leetcode-689-campaign -->


<!-- leetcode-685-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Two-parent filtering | `leetcode/685/#step2` | Skip the later incoming edge before cycle detection. |
| Filtered forest invariant | `leetcode/685/#step2` | DSU groups equal the undirected components of retained edges. |

<!-- /leetcode-685-campaign -->


<!-- leetcode-699-campaign -->

| Concept | Deep link | What the step teaches |
| --- | --- | --- |
| Positive-width interval overlap | `leetcode/699/#step1` | Strict interval intersection excludes brushing edges. |
| Frozen top-height invariant | `leetcode/699/#step2` | The maximum intersecting earlier top is the exact landing base. |

<!-- /leetcode-699-campaign -->
