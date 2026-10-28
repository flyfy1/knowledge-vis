/* ============================================================
 * 知识索引配置 —— visual.integ.life 首页的卡片与分类筛选从这里生成。
 *
 * 新增一个知识页时：
 *   1. 在本站根目录下建子目录（如 convolution/），放入该页的 index.html 等文件；
 *   2. 在 KNOWLEDGE_PAGES 里加一条记录，status 设为 "live"、category 填分类 id；
 *   3. 重新部署即可，首页与筛选不用改。
 *
 * 字段说明（UI-I18N-SPEC.md「分类与标签」一节为权威约定）：
 *   slug     唯一标识（与子目录名一致）
 *   title    {zh, en} 双语标题（兼容旧格式：纯字符串）
 *   desc     {zh, en} 双语一句话说明（兼容旧格式：纯字符串）
 *   tags     双语细标签 [{zh, en}...]（兼容旧格式：字符串数组）
 *   category 分类 id（见下方 KNOWLEDGE_CATEGORIES，如 "signal"）
 *   stage    学段 id（见下方 KNOWLEDGE_STAGES："primary" 小学 / "junior" 初中 / "senior" 高中 / "university" 大学；缺省按 "university"）
 *   status   "live" = 已上线（可点击） | "planned" = 筹备中（灰卡不可点）
 *   path     相对路径（live 时必填）
 * ============================================================ */

/* 分类注册表：数组顺序即索引页筛选 chips 的展示顺序。
 * 新增分类先在此注册（id + 双语名），条目的 category 引用 id。 */
window.KNOWLEDGE_CATEGORIES = [
  { id: "physics", name: { zh: "物理与电路", en: "Physics & Circuits" } },
  { id: "signal",      name: { zh: "信号与系统", en: "Signals & Systems" } },
  { id: "probability", name: { zh: "概率与统计", en: "Probability & Statistics" } },
  { id: "computing",   name: { zh: "计算与智能", en: "Computing & AI" } },
  { id: "math",        name: { zh: "数学基础",   en: "Mathematical Foundations" } },
  { id: "chemistry",   name: { zh: "化学", en: "Chemistry" } },
  { id: "biology",     name: { zh: "生物", en: "Biology" } },
  { id: "earth",       name: { zh: "地球与太空", en: "Earth & Space" } },
  { id: "leetcode",    name: { zh: "LeetCode 专区", en: "LeetCode" } }
];

/* 学段注册表（2026-10-16 增设）：与分类正交的第二维度，索引页有独立筛选行。
 * 条目可省略 stage，省略时按 "university" 呈现。 */
window.KNOWLEDGE_STAGES = [
  { id: "primary",    name: { zh: "小学", en: "Primary" } },
  { id: "junior",     name: { zh: "初中", en: "Junior High" } },
  { id: "senior",     name: { zh: "高中", en: "Senior High" } },
  { id: "university", name: { zh: "大学", en: "University" } }
];

window.KNOWLEDGE_PAGES = [
  {
    slug: "frozen-bubble",
    title: { zh: "冰冻肥皂泡 · 水膜里的结晶", en: "Frozen Soap Bubbles · Ice in a Thin Film" },
    desc: { zh: "亲手放入冰核，对比枝状生长、潜热驱动的流动与两种环境的冻结趋势，分清薄膜和冰晶的颜色。", en: "Seed a crystal, compare branching growth and heat-driven transport in two environments, and separate film color from ice optics." },
    tags: [{ zh: "相变", en: "Phase Change" }, { zh: "表面张力", en: "Surface Tension" }],
    category: "physics", stage: "junior", status: "live", path: "frozen-bubble/"
  },
  {
    slug: "power-converters",
    title: { zh: "升压与降压 · 能量去哪了？", en: "Buck & Boost · Follow the Energy" },
    desc: { zh: "从电感、电容与开关出发，走完 Buck / Boost 的电流回路，推导电压比例并核对功率账本。", en: "Explore inductors, capacitors and switches; trace buck and boost current paths, derive voltage ratios and balance power." },
    tags: [{ zh: "电路", en: "Circuits" }, { zh: "能量守恒", en: "Energy Conservation" }],
    category: "physics", stage: "university", status: "live", path: "power-converters/"
  },
  {
    slug: "atlas",
    title: { zh: "数学与物理 · 知识地图", en: "Mathematics & Physics · Knowledge Atlas" },
    desc: {
      zh: "从几何、运动、光、波动、电路与测量开始。探索概念之间的联系，查看每条关系的解释依据，再进入对应的交互讲解。",
      en: "Start with geometry, motion, light, waves, circuits and measurement. Explore connections between concepts, read why they connect, and open the supporting interactive lessons."
    },
    tags: [{ zh: "概念关系", en: "Concept Connections" }, { zh: "探索路线", en: "Exploration Routes" }],
    category: "math",
    stage: "university",
    status: "live",
    path: "atlas/"
  },
  {
    slug: "leetcode",
    title: { zh: "LeetCode · 一步一步想出来", en: "LeetCode · Reason Your Way to the Solution" },
    desc: {
      zh: "从手算、猜测与反例出发，逐步推导算法，再用 Python 实现。首篇 2916：从子数组到区间更新、平方和与懒标记。",
      en: "Derive algorithms through small examples, predictions and counterexamples, then implement them in Python. First lesson: 2916, from subarrays to interval updates and lazy propagation."
    },
    tags: [{ zh: "算法推导", en: "Algorithm Derivation" }, { zh: "交互题解", en: "Interactive Lessons" }, { zh: "Python", en: "Python" }],
    category: "leetcode",
    stage: "university",
    status: "live",
    path: "leetcode/"
  },
  {
    slug: "fourier",
    title: { zh: "傅里叶变换 · 一步一交互", en: "The Fourier Transform · One Interaction at a Time" },
    desc: {
      zh: "任何波形、任何图形，都能拆成一堆旋转的圆。从一条正弦波开始，七步亲手拼出傅里叶变换，最后画任意图形让圆圈重画出来。",
      en: "Any waveform — any picture — can be taken apart into rotating circles. Start from a single sine wave, build the Fourier transform with your own hands in seven steps, then draw any shape and watch the circles redraw it."
    },
    tags: [
      { zh: "频域", en: "Frequency Domain" },
      { zh: "变换", en: "Transform" },
      { zh: "旋转与圆", en: "Rotation & Circles" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "fourier/"
  },
  {
    slug: "convolution",
    title: { zh: "卷积 · 一步一交互", en: "Convolution · One Interaction at a Time" },
    desc: {
      zh: "把一张照片变糊、把声音加上回声、把抖动的数据变平滑，背后是同一台机器：卷积。七步亲手滑动、翻卷、相乘、求和，最后看它在频域里和傅里叶相遇。",
      en: "Blurring a photo, adding echo to a sound, smoothing jittery data — behind all of them sits the same machine: convolution. Slide, flip, multiply and sum your way through seven steps, then watch it meet the Fourier transform in the frequency domain."
    },
    tags: [
      { zh: "滑动平均", en: "Moving Average" },
      { zh: "图像处理", en: "Image Processing" },
      { zh: "时域与频域", en: "Time & Frequency" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "convolution/"
  },
  {
    slug: "mandelbrot",
    title: { zh: "Mandelbrot 分形 · 无限放大", en: "The Mandelbrot Set · Zoom Without End" },
    desc: {
      zh: "一行幼儿园算术 z→z²+c，反复按下去，能长出无限复杂的图形。拖动放大一千亿倍细节还在生长，每个点背后还藏着一整张朱利亚集。",
      en: "One line of schoolchild arithmetic, z → z² + c, pressed over and over, grows a picture of endless complexity. Drag to zoom a hundred billion times and the detail is still growing — and behind every point hides an entire Julia set."
    },
    tags: [
      { zh: "分形", en: "Fractals" },
      { zh: "复数迭代", en: "Complex Iteration" },
      { zh: "朱利亚集", en: "Julia Sets" }
    ],
    category: "math",
    stage: "university",
    status: "live",
    path: "mandelbrot/"
  },
  {
    slug: "control",
    title: { zh: "反馈与控制 · 双轮车为什么倒不下去", en: "Feedback & Control · Why the Two-Wheeled Bot Never Falls" },
    desc: {
      zh: "一辆双轮车天生站不住，让它站住的不是更强的电机，而是一个转得够快的圈。亲手当一回控制器、亲手调坏再调好一套 PID，再让延迟、噪声和饱和逐个来拆台。",
      en: "A two-wheeled balancing bot is born unable to stand. What keeps it up is not a stronger motor but a loop that spins fast enough. Take the controller's seat yourself, tune a PID badly then well, and let delay, noise and saturation each try to wreck it."
    },
    tags: [
      { zh: "反馈控制", en: "Feedback Control" },
      { zh: "PID", en: "PID" },
      { zh: "倒立摆", en: "Inverted Pendulum" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "control/"
  },
  {
    slug: "sampling",
    title: { zh: "采样与混叠 · 偷看得太懒，就会看错", en: "Sampling & Aliasing · Peek Too Lazily and You'll See It Wrong" },
    desc: {
      zh: "车轮在视频里为什么会倒转？采样就是每隔一会儿偷看世界一眼——看得太懒，眼睛会连出一波根本不存在的假信号。奈奎斯特的那条线、44.1 kHz 的由来，都在这里亲手玩明白。",
      en: "Why do wheels spin backwards on video? Sampling is peeking at the world every so often — peek too lazily and your eyes will invent a signal that was never there. Play with the Nyquist line and the origin of 44.1 kHz until they click."
    },
    tags: [
      { zh: "采样", en: "Sampling" },
      { zh: "混叠", en: "Aliasing" },
      { zh: "奈奎斯特", en: "Nyquist" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "sampling/"
  },
  {
    slug: "trig",
    title: { zh: "三角函数 · 单位圆", en: "Trigonometric Functions · The Unit Circle" },
    desc: {
      zh: "sin 是身高、cos 是站位、tan 是斜率——三个函数是同一个圆的三个投影。拖着点绕一圈，看正弦波从圆的侧影里长出来；这一页是傅里叶变换的前传。",
      en: "Sine is a height, cosine a position, tangent a slope — three functions that are three projections of one circle. Drag the point around and watch the sine wave grow out of the circle's silhouette; this page is the prequel to the Fourier transform."
    },
    tags: [
      { zh: "单位圆", en: "Unit Circle" },
      { zh: "正弦与余弦", en: "Sine & Cosine" },
      { zh: "弧度", en: "Radians" }
    ],
    category: "math",
    stage: "university",
    status: "live",
    path: "trig/"
  },
  {
    slug: "montecarlo",
    title: { zh: "蒙特卡洛 · 撒豆子算 π", en: "Monte Carlo · Counting π with Scattered Beans" },
    desc: {
      zh: "算不出来的问题，可以撒豆子撒出来：随机撒点落在圆内的比例就是面积比，π 自己浮出来。误差按 1/√N 收缩——想多准一位，点要多撒一百倍。",
      en: "Some problems you can't solve, you can scatter your way to: the fraction of random points landing in a circle is an area ratio, and π surfaces on its own. Error shrinks like 1/√N — one more digit costs a hundred times the points."
    },
    tags: [
      { zh: "蒙特卡洛", en: "Monte Carlo" },
      { zh: "随机模拟", en: "Simulation" },
      { zh: "大数定律", en: "Law of Large Numbers" }
    ],
    category: "probability",
    stage: "university",
    status: "live",
    path: "montecarlo/"
  },
  {
    slug: "laplace",
    title: { zh: "拉普拉斯与 ROC · 给频率配一个寿命", en: "Laplace Transform & ROC · Giving Frequencies a Lifespan" },
    desc: {
      zh: "傅里叶假设每个音永远在响；拉普拉斯多问一句：它在衰减还是在增长？s 平面上的地形、极点与收敛域——同一页里装下傅里叶的切片和控制的战场。",
      en: "Fourier assumes every tone rings forever; Laplace also asks whether it is dying or exploding. Terrain, poles and regions of convergence on the s-plane — one map holding both the Fourier slice and the control battlefield."
    },
    tags: [
      { zh: "拉普拉斯变换", en: "Laplace Transform" },
      { zh: "收敛域", en: "Region of Convergence" },
      { zh: "极点", en: "Poles" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "laplace/"
  },
  {
    slug: "bayes",
    title: { zh: "贝叶斯 · 先查底子，再看证据", en: "Bayes · Check the Base Rate Before the Evidence" },
    desc: {
      zh: "检测说你阳性，你真中招的概率只有 9%——检测没骗你，是底子太薄。先验、似然比、证据连乘：信念更新其实是一本流水账。",
      en: "The test says positive, yet your chance of actually having it is 9% — the test didn't lie; the base rate is thin. Priors, likelihood ratios and chained evidence: belief updating as a running ledger."
    },
    tags: [
      { zh: "贝叶斯更新", en: "Bayesian Updating" },
      { zh: "先验与后验", en: "Prior & Posterior" },
      { zh: "基础率", en: "Base Rate" }
    ],
    category: "probability",
    stage: "university",
    status: "live",
    path: "bayes/"
  },
  {
    slug: "clt",
    title: { zh: "中心极限定理 · 平均值总会变成钟形", en: "Central Limit Theorem · Averages Always Turn Bell-Shaped" },
    desc: {
      zh: "单颗骰子毫无钟形可言，平均起来钟形却拔地而起。不管原料长什么样，均值的分布总是正态——只要方差有限：精度按 σ/√n 定价，民调的 ±3% 也从这里来。",
      en: "A single die has nothing bell-shaped about it, yet average enough dice and the bell rises. Whatever the raw material looks like, means turn normal — as long as the variance is finite. Precision is priced at σ/√n, and polling's ±3% is born here too."
    },
    tags: [
      { zh: "中心极限定理", en: "Central Limit Theorem" },
      { zh: "抽样分布", en: "Sampling Distribution" },
      { zh: "正态逼近", en: "Normal Approximation" }
    ],
    category: "probability",
    stage: "university",
    status: "live",
    path: "clt/"
  },
  {
    slug: "ztransform",
    title: { zh: "Z 变换 · 把 s 平面卷成单位圆", en: "The Z-Transform · Rolling the s-Plane into the Unit Circle" },
    desc: {
      zh: "离散世界没有连续时间，它的拉普拉斯住在一个圆里：z = e^{sT} 把左半平面卷进单位圆内、虚轴卷成圆周。极点在圆内活、圆上鸣、圆外炸。",
      en: "The discrete world has no continuous time; its Laplace lives on a circle. z = e^{sT} rolls the left half-plane inside the unit circle and the axis onto its rim — poles live inside, sing on it, and explode outside."
    },
    tags: [
      { zh: "Z 变换", en: "Z-Transform" },
      { zh: "单位圆", en: "Unit Circle" },
      { zh: "收敛域", en: "ROC" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "ztransform/"
  },
  {
    slug: "gradient-descent",
    title: { zh: "梯度下降 · 摸黑下山", en: "Gradient Descent · Feeling Your Way Downhill" },
    desc: {
      zh: "训练模型，就是在看不见的地形上摸黑下山：坡度是唯一的信息，步子迈多大决定你走到谷底、原地打转还是飞出去。所有神经网络的训练，剥到底就是这一页的循环。",
      en: "Training a model is feeling your way down a landscape you cannot see: the slope is your only information, and your step size decides whether you reach the bottom, spin in place, or fly off. All of neural-network training, stripped down, is this page's loop."
    },
    tags: [
      { zh: "梯度下降", en: "Gradient Descent" },
      { zh: "学习率", en: "Learning Rate" },
      { zh: "优化", en: "Optimization" }
    ],
    category: "computing",
    stage: "university",
    status: "live",
    path: "gradient-descent/"
  },
  {
    slug: "eigen",
    title: { zh: "特征值与特征向量 · 矩阵不转的那些方向", en: "Eigenvalues & Eigenvectors · The Directions a Matrix Cannot Turn" },
    desc: {
      zh: "矩阵把空间里的箭头普遍转走，只有少数方向例外：只被拉长、缩短或翻转。从捏圆的机器一路到 PCA 与谷歌的 PageRank，中间只隔一个问题：哪个方向不会被转走？",
      en: "A matrix turns almost every arrow in space — except a few directions it can only stretch, shrink, or flip. From a circle squeezed into an ellipse to PCA and Google's PageRank, it all comes down to one question: which directions refuse to turn?"
    },
    tags: [
      { zh: "特征值", en: "Eigenvalues" },
      { zh: "特征向量", en: "Eigenvectors" },
      { zh: "主成分分析", en: "PCA" }
    ],
    category: "math",
    stage: "university",
    status: "live",
    path: "eigen/"
  },
  {
    slug: "entropy",
    title: { zh: "熵 · 惊讶的平均值", en: "Entropy · The Average of Surprise" },
    desc: {
      zh: "越意外的事，信息量越大；熵把一个随机源的整体不确定性压成一个数。它既是压缩的绝对极限，也是机器学习损失函数的老祖宗，还与热力学的熵同源同式。",
      en: "The more surprising an event, the more information it carries; entropy compresses a source's total uncertainty into a single number. It is the absolute limit of compression, the ancestor of ML loss functions, and kin to the entropy of thermodynamics."
    },
    tags: [
      { zh: "熵", en: "Entropy" },
      { zh: "信息量", en: "Information" },
      { zh: "哈夫曼编码", en: "Huffman Coding" }
    ],
    category: "probability",
    stage: "university",
    status: "live",
    path: "entropy/"
  },
  {
    slug: "lti",
    title: { zh: "冲激与 LTI · 给系统一巴掌", en: "Impulse & LTI · Slap the System" },
    desc: {
      zh: "想认识一个系统，别逐个试输入——扇它一巴掌，把它对冲激的全部回答 h 录下来。只要它是线性时不变的，这份指纹就决定了它对一切输入的回答；公理垮掉的地方，魔法当场失效给你看。",
      en: "To know a system, don't test input after input — slap it once and record its full answer to an impulse. If it is linear and time-invariant, that fingerprint h decides its answer to everything; where the axioms break, watch the magic fail on the spot."
    },
    tags: [
      { zh: "冲激响应", en: "Impulse Response" },
      { zh: "LTI 系统", en: "LTI Systems" },
      { zh: "线性时不变", en: "Linear Time-Invariant" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "lti/"
  },
  {
    slug: "freqresp",
    title: { zh: "频率响应与滤波 · 按频率挑食的盒子", en: "Frequency Response & Filters · A Box That Eats by Frequency" },
    desc: {
      zh: "LTI 系统对正弦只做两件事：按 |H(ω)| 缩放、按 φ(ω) 迟到。把这两条曲线量出来，你就既会读波特图，也会按指标亲手设计一个滤波器——零点、相位、带通、验收，全是真算。",
      en: "An LTI system does only two things to a sine: scale it by |H(ω)| and delay it by φ(ω). Measure those two curves and you can both read a Bode plot and design a filter to spec — zeros, phase, bandpass, and a bench verdict, all computed for real."
    },
    tags: [
      { zh: "频率响应", en: "Frequency Response" },
      { zh: "滤波器", en: "Filters" },
      { zh: "波特图", en: "Bode Plot" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "freqresp/"
  },
  {
    slug: "modulation",
    title: { zh: "调制与频移 · 把信号搬上高频运走", en: "Modulation · Shipping Signals on a Carrier" },
    desc: {
      zh: "声音跑不远也挤不下——乘一个载波，频谱整体搬家。AM 搬幅度的形状、FM 搬频率的摆动；解调要对准频率与相位，串扰、过调制、抗噪差距，全由真采样与 FFT 现算给你看。",
      en: "Voices can't travel far or share one band — multiply by a carrier and the whole spectrum moves house. AM ships the shape of the amplitude, FM the wobble of frequency; demodulation, crosstalk, overmodulation, and the noise gap, all computed live from real samples and FFTs."
    },
    tags: [
      { zh: "调制", en: "Modulation" },
      { zh: "载波", en: "Carrier" },
      { zh: "频谱搬移", en: "Spectrum Shifting" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "modulation/"
  },
  {
    slug: "kalman",
    title: { zh: "卡尔曼滤波 · 在预测与测量之间称重", en: "Kalman Filter · Weighing Prediction Against Measurement" },
    desc: {
      zh: "真实状态永远看不见：模型预测一份、带噪测量一份，卡尔曼按各自的不确定度当场算出该信谁几成。增益 K 如何自己定下来、如何从位置估出没测过的速度——全是递推真算。",
      en: "The true state is never visible: a model predicts, a noisy sensor measures, and the Kalman filter weighs the two by their uncertainties, live. How gain K settles itself, and how velocity gets estimated from position alone — every step from the real recursion."
    },
    tags: [
      { zh: "卡尔曼滤波", en: "Kalman Filter" },
      { zh: "状态估计", en: "State Estimation" },
      { zh: "预测与更新", en: "Predict–Update" }
    ],
    category: "signal",
    stage: "university",
    status: "live",
    path: "kalman/"
  },
  {
    slug: "sorting",
    title: { zh: "排序与大 O · 增长的形状", en: "Sorting & Big O · The Shape of Growth" },
    desc: {
      zh: "算法之间的差别不在能不能排，在比较次数如何随数据量增长。冒泡、选择、归并、快排、计数排序的每个计数都由真实代码当场数出——连大 O 的形状，都是从实测表里拟合出来的。",
      en: "Algorithms differ not in whether they sort, but in how their comparison counts grow with n. Bubble, selection, merge, quick and counting sort — every count produced live by real code, and the Big O shapes fitted from the measured table itself."
    },
    tags: [
      { zh: "排序算法", en: "Sorting" },
      { zh: "大 O", en: "Big O" },
      { zh: "分而治之", en: "Divide & Conquer" }
    ],
    category: "computing",
    stage: "university",
    status: "live",
    path: "sorting/"
  },
  {
    slug: "fractions",
    title: { zh: "分数 · 把整体切开来数", en: "Fractions · Cutting the Whole to Count" },
    desc: {
      zh: "分数不是两个数上下摆，是一个数：先看 1/2 与 2/4 叠合得严丝合缝，再到等值、比大小、加法先通分、假分数长过一条——运算全部用精确有理数，循环小数老老实实写 ≈。本站第一个小学学段页面。",
      en: "A fraction is one number, not two stacked: watch 1/2 and 2/4 overlap pixel-perfectly, then equivalence, comparison, common denominators, and improper fractions longer than one bar — all arithmetic exact, repeating decimals honestly marked ≈. The site's first primary-school page."
    },
    tags: [
      { zh: "等值分数", en: "Equivalent Fractions" },
      { zh: "通分", en: "Common Denominators" },
      { zh: "数轴", en: "Number Line" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "fractions/"
  },
  {
    slug: "pythagoras",
    title: { zh: "勾股定理 · 一步一交互", en: "The Pythagorean Theorem · One Interaction at a Time" },
    desc: {
      zh: "a²+b²=c² 不是背出来的：3-4-5 先露馅，再用面积灌注和拼图把等式拼出来，拖着顶点怎么拖都等，最后反过来判角、算梯子，并撞见怎么也写不尽的 √2。",
      en: "a²+b²=c², earned rather than memorised: the 3-4-5 coincidence first, then area pouring and a jigsaw proof, dragging the vertex without breaking equality, classifying angles in reverse, a ladder problem, and finally √2 — the length no fraction can write."
    },
    tags: [
      { zh: "拼图证明", en: "Jigsaw Proof" },
      { zh: "直角三角形", en: "Right Triangles" },
      { zh: "勾股数与 √2", en: "Triples & √2" }
    ],
    category: "math",
    stage: "junior",
    status: "live",
    path: "pythagoras/"
  },
  {
    slug: "area-model",
    title: { zh: "乘法是面积 · 点阵铺成一块地", en: "Multiplication Is Area · Arrays Become a Tiled Floor" },
    desc: {
      zh: "先不背口诀，把乘法看成面积：点阵铺成地砖、转个方向读出交换律；一块地切一刀，13×17 自己拆成四块相加——这就是分配律和竖式的来历；最后拿 24 块砖反着拼，反找因数对。",
      en: "Multiplication as area before memorised tables: dot arrays become tiled floors, a quarter-turn shows commutativity, and one cut through a plot splits 13×17 into four blocks that add back up — where the distributive law and the written algorithm come from; ends by factoring 24 tiles in reverse."
    },
    tags: [
      { zh: "面积模型", en: "Area Model" },
      { zh: "分配律", en: "Distributive Law" },
      { zh: "因数对", en: "Factor Pairs" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "area-model/"
  },
  {
    slug: "perimeter-area",
    title: { zh: "周长 vs 面积 · 一根绳子两种账", en: "Perimeter vs Area · One Rope, Two Ledgers" },
    desc: {
      zh: "一根 24 米的绳子围地：绳子账（周长）怎么围都不变，地砖账（面积）却从 11 一路变到 36——越接近正方形越大；再反过来，面积固定时细长形状最费绳子。两个最容易混的量，这次分得清清楚楚。",
      en: "Fence a plot with one 24-metre rope: the rope ledger (perimeter) never changes, but the tile ledger (area) runs from 11 all the way to 36 — the closer to a square, the bigger; then in reverse, fixed area costs the most rope when long and thin. Two quantities everyone mixes up, finally kept apart."
    },
    tags: [
      { zh: "周长", en: "Perimeter" },
      { zh: "面积比较", en: "Comparing Areas" },
      { zh: "正方形最优", en: "The Square Wins" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "perimeter-area/"
  },
  {
    slug: "division-remainder",
    title: { zh: "除法与余数 · 分不完的那一点", en: "Division & Remainders · What Is Left Over" },
    desc: {
      zh: "分糖果分到最后总剩几颗：先动手一份一份发，再到数轴上一格一格跳——余数为什么必须比除数小，跳着跳着就明白了；然后是验算恒等式和星期几的循环，最后两道自测题收口。",
      en: "Sharing sweets until a few are left over: deal them out one share at a time, then hop along the number line — and see for yourself why the remainder must stay smaller than the divisor; then the check identity, weekday cycles, and a two-question self-test."
    },
    tags: [
      { zh: "余数", en: "Remainders" },
      { zh: "验算恒等式", en: "The Check Identity" },
      { zh: "周期循环", en: "Cycles" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "division-remainder/"
  },
  {
    slug: "linear-functions",
    title: { zh: "一次函数 · 斜率是陡缓，截距是起点", en: "Linear Functions · Slope Is Steepness, Intercept Is the Start" },
    desc: {
      zh: "y=kx+b 不背公式，先拖出来：落点一格一格等高抬升、连成直线，k 就是坡的陡缓；整条线上下平移，b 就是还没出发就站的高度；最后两条线相遇，交点同时满足两个方程——平行和重合两种特例也亲手摆得出来。",
      en: "y = kx + b, earned by dragging instead of rote: points rising by equal steps line up straight — k is the steepness; slide the whole line up or down and b is the height you start from before moving; and when two lines meet, their crossing point satisfies both equations at once, with parallel and coincident cases reachable by hand."
    },
    tags: [
      { zh: "斜率", en: "Slope" },
      { zh: "截距", en: "Intercept" },
      { zh: "交点", en: "Intersection" }
    ],
    category: "math",
    stage: "junior",
    status: "live",
    path: "linear-functions/"
  },
  {
    slug: "symmetry-rotation",
    title: { zh: "对称与旋转 · 对折与转圈", en: "Symmetry & Rotation · Folding and Turning" },
    desc: {
      zh: "沿一条线对折、两边严丝合缝，那条线就是对称轴；转过一个角度又变回自己，那是旋转对称。正方形有 4 条轴，平行四边形一条都没有、却转半圈就重合——最后开一台万花筒，只画一小块，图案自己长满。",
      en: "Fold along a line and the two halves match exactly — that line is an axis of symmetry; turn through the right angle and the shape is itself again — rotational symmetry. A square has 4 axes; a parallelogram has none, yet matches itself after half a turn. At the end, a kaleidoscope grows a full pattern from one small wedge you draw."
    },
    tags: [
      { zh: "对称轴", en: "Axes of Symmetry" },
      { zh: "旋转对称", en: "Rotational Symmetry" },
      { zh: "万花筒", en: "Kaleidoscope" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "symmetry-rotation/"
  },
  {
    slug: "parabola",
    title: { zh: "抛物线 · 投篮的弧线", en: "Parabolas · The Arc of a Shot" },
    desc: {
      zh: "投篮的弧线就是抛物线：a 管开口方向与胖瘦；写成顶点式，顶点和对称轴直接写在式子的脸上，随着滑杆搬家；球最后落在哪里，就是图与 x 轴的交点——两个、一个，还是一个都没有，拖一拖全摆得出来。",
      en: "A basketball's arc is a parabola: a sets the opening direction and width; written in vertex form, the curve wears its vertex and axis of symmetry on its face and moves house as you drag; and where the ball lands is exactly where the curve meets the x-axis — two crossings, one touch, or none at all, every case reachable by hand."
    },
    tags: [
      { zh: "顶点式", en: "Vertex Form" },
      { zh: "对称轴", en: "Axis of Symmetry" },
      { zh: "与 x 轴交点", en: "X-Intercepts" }
    ],
    category: "math",
    stage: "junior",
    status: "live",
    path: "parabola/"
  },
  {
    slug: "velocity-vt",
    title: { zh: "速度与 v-t 图 · 面积就是路", en: "Speed and the v–t Graph · Area Is Distance" },
    desc: {
      zh: "先看一场赛跑：位置—时间图像的陡缓就是快慢；换上速度—时间图像，看的是高低、不是陡缓；图像下方的面积，数出来正是走过的路——把加速段切成 4 条、8 条、16 条窄条，台阶和会一步步贴近真路程。",
      en: "Start with a race: on a position–time graph, steepness is speed. Switch to a velocity–time graph and you read height, not steepness — and the area under the graph counts out exactly the distance travelled. Slice the speeding-up stretch into 4, 8, 16 thin strips and watch the step sums close in on the true distance."
    },
    tags: [
      { zh: "位置—时间图", en: "Position–Time Graph" },
      { zh: "速度—时间图", en: "Velocity–Time Graph" },
      { zh: "图像下面积", en: "Area Under Graph" }
    ],
    category: "physics",
    stage: "junior",
    status: "live",
    path: "velocity-vt/"
  },
  {
    slug: "integral",
    title: { zh: "定积分 · 把小条加回整体", en: "The Definite Integral · Adding the Strips Back Up" },
    desc: {
      zh: "曲边围成的面积没有公式可套——那就切：把曲线下切成 1、2、4…32 条长方形，左和与右和从两边夹住真值，缝越切越窄；条无限细时两边贴到的那个数就是定积分。而求它有捷径：找到导数是它自己的那个函数，积分与导数就此接头。",
      en: "No formula fits an area under a curve — so slice it: cut the region into 1, 2, 4 … 32 rectangles, let the left and right sums squeeze the true value from both sides, and watch the gap narrow. The number both sides close in on is the definite integral — and there is a shortcut: find the function whose derivative it is, and integration shakes hands with differentiation."
    },
    tags: [
      { zh: "黎曼和", en: "Riemann Sums" },
      { zh: "左右夹逼", en: "Squeezing Sums" },
      { zh: "原函数", en: "Antiderivative" }
    ],
    category: "math",
    stage: "senior",
    status: "live",
    path: "integral/"
  },
  {
    slug: "reflection-refraction",
    title: { zh: "光的反射与折射 · 拐弯的规矩", en: "Reflection & Refraction · How Light Bends" },
    desc: {
      zh: "光撞上界面会拐弯，拐多少有规矩：反射角等于入射角、而且都从法线量起；进了水会偏向法线；从水里往外射、角度太陡还会全部反射回去；连鱼在水里的位置都是假的——眼睛看到的虚像比真身浅。",
      en: "Light bends at a boundary, and the bending follows rules: the angle of reflection equals the angle of incidence, and both are measured from the normal; entering water it bends toward the normal; leaving water too steeply, it reflects entirely back. Even a fish is not where it looks — the virtual image your eye sees sits shallower than the fish itself."
    },
    tags: [
      { zh: "反射定律", en: "Law of Reflection" },
      { zh: "折射与斯涅尔定律", en: "Snell's Law" },
      { zh: "全反射", en: "Total Internal Reflection" }
    ],
    category: "physics",
    stage: "junior",
    status: "live",
    path: "reflection-refraction/"
  },
  {
    slug: "derivative",
    title: { zh: "导数 · 把平均压成此刻", en: "The Derivative · Squeezing the Average into the Instant" },
    desc: {
      zh: "平均速度谁都会算，可「这一刻」有多快？把区间一点点缩向那一刻：割线从左右两侧靠拢成切线，斜率收敛到的那个数，就是导数。沿着曲线每一点都量一遍，导数们自己又排成一条新曲线——导函数出场。",
      en: "Anyone can compute an average speed — but how fast is it right now? Shrink the interval toward the instant: the secant line closes in from both sides into the tangent, and the number its slope settles on is the derivative. Measure it at every point along the curve and the derivatives line up into a new curve of their own — the derivative function."
    },
    tags: [
      { zh: "割线逼近切线", en: "Secant to Tangent" },
      { zh: "瞬时变化率", en: "Instantaneous Rate" },
      { zh: "导函数", en: "Derivative Function" }
    ],
    category: "math",
    stage: "senior",
    status: "live",
    path: "derivative/"
  },
  {
    slug: "lens",
    title: { zh: "凸透镜成像 · 远近变像", en: "The Convex Lens · Near or Far, the Image Transforms" },
    desc: {
      zh: "蜡烛离凸透镜的远近一变，像的大小、正倒、实虚全跟着变：越过二倍焦距，像由大变小；越过一倍焦距，像从光屏上跳进眼睛里——实像能被屏接住，虚像接不住、只能看。三条特殊光线，就能把像画出来。",
      en: "Slide a candle toward a convex lens and everything about its image changes — size, orientation, real or virtual. Cross twice the focal length and the image starts shrinking; cross one focal length and it leaps off the screen into your eye: a real image can be caught on a screen, a virtual one can only be seen. Three special rays are all it takes to draw exactly where the image lands."
    },
    tags: [
      { zh: "焦距", en: "Focal Length" },
      { zh: "实像与虚像", en: "Real & Virtual Images" },
      { zh: "放大镜", en: "The Magnifier" }
    ],
    category: "physics",
    stage: "junior",
    status: "live",
    path: "lens/"
  },
  {
    slug: "interference",
    title: { zh: "波的干涉 · 闹与静的图样", en: "Interference · A Pattern of Loud and Still" },
    desc: {
      zh: "两列波相遇，每一点的振动就是两者相加：步调一致的地方更闹，步调相反的地方反而安静——而且静点永远静、响点永远响。决定加强还是抵消的，是到两个波源的路程差：整数倍波长加强，半整数倍抵消，图样由几何定死。",
      en: "When two waves meet, every point's motion is the sum of both: where they arrive in step, the motion doubles; where they arrive out of step, it cancels — and the still points stay still forever. The decider is the path difference to the two sources: whole wavelengths reinforce, half wavelengths cancel, and the pattern is fixed by geometry."
    },
    tags: [
      { zh: "叠加原理", en: "Superposition" },
      { zh: "路程差", en: "Path Difference" },
      { zh: "干涉图样", en: "Interference Pattern" }
    ],
    category: "physics",
    stage: "senior",
    status: "live",
    path: "interference/"
  },
  {
    slug: "exp-log",
    title: { zh: "指数与对数 · 翻倍与逆问", en: "Exponentials & Logarithms · Doubling and the Reverse Question" },
    desc: {
      zh: "每小时翻一倍，24 小时就是一千六百多万——指数增长为什么这么猛？反过来问「2 的几次方等于 6」，那个答案就是对数：它不是没算完的小数，而是一个准确的名字。在对数尺上，乘法会变成加法——这就是对数尺的本事。",
      en: "Doubling every hour gives over sixteen million in a day — why is exponential growth so fierce? Ask the question backwards — 2 to what power makes 6? — and the answer is a logarithm: not an unfinished decimal, but an exact name for the exponent. And on a log scale, multiplication turns into addition."
    },
    tags: [
      { zh: "指数增长", en: "Exponential Growth" },
      { zh: "对数", en: "Logarithms" },
      { zh: "对数尺", en: "Log Scale" }
    ],
    category: "math",
    stage: "senior",
    status: "live",
    path: "exp-log/"
  },
  {
    slug: "circle-angles",
    title: { zh: "圆周角 · 为什么恰好是一半", en: "Inscribed Angles · Why Exactly Half" },
    desc: {
      zh: "圆上一点看一条弧，张角永远是圆心看它的恰好一半——拖着点满圆跑都变不了。连一条半径，两个等腰三角形把这一半算得明明白白；弧过半圈，张角正好是直角。",
      en: "From any point on the circle, an arc subtends exactly half the angle it subtends at the centre — drag the point all the way round and it never changes. One extra radius splits the proof into two isosceles triangles; and once the arc passes a semicircle, the angle is exactly a right angle."
    },
    tags: [
      { zh: "圆周角", en: "Inscribed Angle" },
      { zh: "圆心角", en: "Central Angle" },
      { zh: "等腰三角形证明", en: "Isosceles Proof" }
    ],
    category: "math",
    stage: "junior",
    status: "live",
    path: "circle-angles/"
  },
  {
    slug: "complex-numbers",
    title: { zh: "复数 · 平面上的旋转", en: "Complex Numbers · Rotation on the Plane" },
    desc: {
      zh: "复数不是硬凑出来的数：a+bi 就是平面上的一个点。乘以 i，是把这个点逆时针转 90°；一般的乘法是模相乘、角相加。代数算一遍、几何看一遍，两条路永远同一个答案。",
      en: "A complex number is not an invented patch: a+bi is a point on the plane. Multiplying by i rotates that point 90° counterclockwise; multiplication in general multiplies the moduli and adds the angles. Compute it algebraically, watch it geometrically — both roads always land on the same answer."
    },
    tags: [
      { zh: "复数平面", en: "Complex Plane" },
      { zh: "乘 i 是旋转", en: "Multiplying by i" },
      { zh: "模与辐角", en: "Modulus & Argument" }
    ],
    category: "math",
    stage: "senior",
    status: "live",
    path: "complex-numbers/"
  },
  {
    slug: "standing-wave",
    title: { zh: "驻波 · 原地起伏的波", en: "Standing Waves · The Wave That Stays in Place" },
    desc: {
      zh: "两列相同的波迎面相遇，波形不再前进，只在原地起伏：有些点永远不动（波节），有些点振幅翻倍（波腹）。两端固定的弦只放行 L=nλ/2 的台阶，驱动频率踩中台阶，就会共振。",
      en: "Two identical waves travelling towards each other lock into a pattern that no longer travels — it only rises and falls in place: some points never move (nodes), others swing with double amplitude (antinodes). A string fixed at both ends admits only L = nλ/2, and driving it on one of those steps is resonance."
    },
    tags: [
      { zh: "驻波", en: "Standing Wave" },
      { zh: "波节与波腹", en: "Nodes & Antinodes" },
      { zh: "共振", en: "Resonance" }
    ],
    category: "physics",
    stage: "senior",
    status: "live",
    path: "standing-wave/"
  },
  {
    slug: "negative-numbers",
    title: { zh: "负数 · 0 以下的世界", en: "Negative Numbers · The World Below Zero" },
    desc: {
      zh: "温度计掉到 0 以下、电梯下到 B1——负数记的是「在基准的另一边、还差多少」。放上数轴一比就懂：越往左越小，所以 −3 比 −7 暖和。这一页只讲现象和比较，不背法则。",
      en: "Thermometers drop below zero and lifts go down to B1 — negative numbers record 'on the other side of the reference point, and by how much'. Put them on a number line and it clicks: further left means smaller, so −3 is warmer than −7. This page is phenomena and comparison only — no rules to memorise."
    },
    tags: [
      { zh: "数轴", en: "Number Line" },
      { zh: "温度与楼层", en: "Temperature & Floors" },
      { zh: "比大小", en: "Comparing" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "negative-numbers/"
  },
  {
    slug: "pinhole-camera",
    title: { zh: "小孔成像 · 一个孔的相机", en: "Pinhole Camera · A Camera With One Tiny Hole" },
    desc: {
      zh: "没有镜头，只有一个小孔，屏幕上却出现一幅倒过来的画：光沿直线走，物上每一点的光只能穿过小孔落到屏上一个地方。像高由物距、像距的比定死，孔大了画会糊成一片光斑。",
      en: "No lens, just a tiny hole — yet an upside-down picture appears on the screen: light travels straight, so light from each point of the object can pass the hole and land in exactly one place. Image height is fixed by the ratio of the two distances, and a bigger hole blurs the picture into a patch of light."
    },
    tags: [
      { zh: "光的直线传播", en: "Straight-Line Light" },
      { zh: "倒立的像", en: "Inverted Image" },
      { zh: "相似三角形", en: "Similar Triangles" }
    ],
    category: "physics",
    stage: "primary",
    status: "live",
    path: "pinhole-camera/"
  },
  {
    slug: "space-diagonal",
    title: { zh: "空间对角线 · 3D 里的两次勾股", en: "The Space Diagonal · Pythagoras Twice, in 3D" },
    desc: {
      zh: "长方体里最长的那条斜线有多长？把立体压回平面算两次：先在底面用勾股算出对角线，再拿它当一条直角边、竖起高来第二次勾股。拖动 3D 长方体转着看，两次勾股都写在真实的棱上。",
      en: "How long is the longest line inside a box? Flatten the solid back into planes and apply Pythagoras twice: first across the base, then using that diagonal as one leg of a vertical right triangle. Orbit the 3D cuboid and watch both applications drawn on the real edges."
    },
    tags: [
      { zh: "3D 互动", en: "Interactive 3D" },
      { zh: "勾股定理", en: "Pythagoras" },
      { zh: "长方体", en: "Cuboid" }
    ],
    category: "math",
    stage: "junior",
    status: "live",
    path: "space-diagonal/"
  },
  {
    slug: "coordinate-plane",
    title: { zh: "坐标系 · 点的地址", en: "The Coordinate Plane · Addresses for Points" },
    desc: {
      zh: "给平面定一个原点、两条轴，每个点就有了一个地址 (x, y)。换原点，点没动、地址全变；横纵一换位，点沿对角线翻到对面。这套地址系统，是所有函数图像的地基。",
      en: "Fix an origin and two axes, and every point on the plane gets an address (x, y). Move the origin and the points stay exactly where they are while every address shifts; swap the two coordinates and the point flips across the diagonal. This address system is the groundwork under every function graph."
    },
    tags: [
      { zh: "原点与坐标轴", en: "Origin & Axes" },
      { zh: "象限", en: "Quadrants" },
      { zh: "坐标换位", en: "Swapping Coordinates" }
    ],
    category: "math",
    stage: "junior",
    status: "live",
    path: "coordinate-plane/"
  },
  {
    slug: "particles-states",
    title: { zh: "粒子与物态 · 热闹程度即温度", en: "Particles & States · Temperature Is How Wildly They Move" },
    desc: {
      zh: "把物质放大到一颗颗粒子：挤在一起原地抖的是固体，松开能流动的是液体，满屋乱飞的是气体。加热就是让粒子动得更野——温度不是另一样东西，它就是粒子平均动得有多快。升温到熔点、沸点还会各卡一段平台。",
      en: "Zoom into matter as individual particles: packed and jiggling in place is a solid, loosened and flowing is a liquid, flying everywhere is a gas. Heating just makes the particles move more wildly — temperature is not a separate thing, it is how fast they move on average. And at the melting and boiling points, the temperature stalls on a plateau."
    },
    tags: [
      { zh: "粒子模型", en: "Particle Model" },
      { zh: "固液气", en: "Solid, Liquid, Gas" },
      { zh: "熔化与沸腾平台", en: "Melting & Boiling Plateaus" }
    ],
    category: "chemistry",
    stage: "junior",
    status: "live",
    path: "particles-states/"
  },
  {
    slug: "atomic-structure",
    title: { zh: "原子结构 · 质子数定它是谁", en: "Atomic Structure · The Proton Count Decides What It Is" },
    desc: {
      zh: "原子不是实心球：中间一个极小的核几乎占了全部质量，电子在外面按层排布。质子数定它是谁，最外层电子数定它活泼不活泼——改数字、当场算，全部账都摆在明处。",
      en: "An atom is not a solid ball: a tiny nucleus at the centre holds almost all the mass, and electrons arrange themselves in layers outside it. The proton count decides what it is; the outermost electron count decides how reactive it is — change the numbers and watch everything recompute."
    },
    tags: [
      { zh: "质子数与元素", en: "Protons & Elements" },
      { zh: "电子层排布", en: "Electron Layers" },
      { zh: "离子与电荷", en: "Ions & Charge" }
    ],
    category: "chemistry",
    stage: "junior",
    status: "live",
    path: "atomic-structure/"
  },
  {
    slug: "lever-pulley",
    title: { zh: "杠杆与滑轮 · 支点挪一挪，省力见分晓", en: "Levers & Pulleys · Move the Fulcrum, Feel the Trade" },
    desc: {
      zh: "小力凭什么撬动大物？这一页算两本账。转动的账看力矩：力 × 力臂，两边相等就平衡——支点挪一挪，同样的重物要用的力立刻变。可省力从不是白省：功的账本两边永远相等，省几倍力就费几倍距离。到了滑轮组更干脆，不用算，数一数吊着重物的绳子段数，就知道省几倍力。全页 g 取 10 N/kg，力一律用牛顿（N）。",
      en: "How can a small force lift a huge weight? This page keeps two ledgers. The turning ledger is torque: force × lever arm — when both sides match, the lever balances, and sliding the fulcrum changes the force you need at once. But saved force is never free: the work ledger always balances, so every multiple of force saved costs the same multiple of distance. For pulley systems it is even simpler — do not compute, just count the rope segments holding the load. Throughout, g = 10 N/kg and forces are in newtons (N)."
    },
    tags: [
      { zh: "力矩平衡", en: "Torque Balance" },
      { zh: "功不省", en: "Work Is Never Saved" },
      { zh: "数段数定倍数", en: "Count the Rope Segments" }
    ],
    category: "physics",
    stage: "junior",
    status: "live",
    path: "lever-pulley/"
  },
  {
    slug: "equations-balance",
    title: { zh: "方程天平 · 两边同做一件事", en: "Equations on a Balance · Do the Same to Both Sides" },
    desc: {
      zh: "等号不是「算出答案」的信号，是一架天平的指针：指针归零，两边一样重。这一页我们只学一招——不管做什么，对两边同时做相同的事——用这一招把 x 一个人留在天平左边。",
      en: "The equals sign is not a “compute the answer” button; it is the needle of a balance — at zero, both sides weigh the same. This page teaches one move only: whatever you do, do the same to both sides — and use it to leave x alone on the left."
    },
    tags: [
      { zh: "等式性质", en: "Equality Properties" },
      { zh: "解方程", en: "Solving Equations" },
      { zh: "两步方程", en: "Two-Step Equations" }
    ],
    category: "math",
    stage: "primary",
    status: "live",
    path: "equations-balance/"
  },
  {
    slug: "day-night-rotation",
    title: { zh: "昼夜交替 · 地球自己在转", en: "Day and Night · The Earth Itself Is Turning" },
    desc: {
      zh: "不是太阳绕着我们跑：地球绕着自己的轴转，每个地方轮流朝向太阳，于是有了昼夜。转满一圈是一天；站在转动的地面上看，太阳就成了东升西落。",
      en: "The Sun does not circle us: the Earth spins on its own axis and every place takes its turn facing the Sun — that is day and night. One full turn makes a day, and standing on the turning ground, the Sun appears to rise in the east and set in the west."
    },
    tags: [
      { zh: "地球自转", en: "Earth's Rotation" },
      { zh: "晨昏线", en: "The Terminator" },
      { zh: "太阳东升西落", en: "Sunrise in the East" }
    ],
    category: "earth",
    stage: "primary",
    status: "live",
    path: "day-night-rotation/"
  },
  {
    slug: "mass-conservation",
    title: { zh: "质量守恒 · 原子一个都不丢", en: "Mass Conservation · Not a Single Atom Lost" },
    desc: {
      zh: "化学反应看起来变重变轻，原子却一个不多、一个不少，只是重新排队。这一页把反应拆开逐个原子数，再用天平对账：敞口跑掉的气体、从空气里加入的氧，都逃不过这本账。",
      en: "Reactions seem to gain or lose weight, yet not a single atom is created or destroyed — they only reshuffle. Take reactions apart and count atoms one by one, then settle it on a balance: escaping gas and oxygen joining from the air both show up in the ledger."
    },
    tags: [
      { zh: "原子重排", en: "Atom Rearrangement" },
      { zh: "配平", en: "Balancing" },
      { zh: "气体逸出", en: "Escaping Gas" }
    ],
    category: "chemistry",
    stage: "junior",
    status: "live",
    path: "mass-conservation/"
  },
  {
    slug: "cell-structure",
    title: { zh: "细胞 · 生命的最小单位间", en: "The Cell · Life's Smallest Workshop" },
    desc: {
      zh: "把一片叶子放大到单个细胞：膜划出边界，核是总控，线粒体供能，叶绿体造糖。点一点每个工位是干什么的，再把动物细胞和植物细胞并排，找齐三处不同。",
      en: "Zoom into a single cell: the membrane draws the boundary, the nucleus runs the place, mitochondria supply energy, chloroplasts make sugar. Tap each workstation to see its job, then put animal and plant cells side by side and find all three differences."
    },
    tags: [
      { zh: "细胞器", en: "Organelles" },
      { zh: "动植物对照", en: "Plant vs Animal" },
      { zh: "结构与功能", en: "Structure & Function" }
    ],
    category: "biology",
    stage: "junior",
    status: "live",
    path: "cell-structure/"
  },
  {
    slug: "photosynthesis",
    title: { zh: "光合作用 · 用光开工的糖厂", en: "Photosynthesis · A Sugar Factory Run by Light" },
    desc: {
      zh: "叶子用光把水和二氧化碳重排成糖和氧气：方程式逐项点开对原子账；速率随光强和二氧化碳先升后封顶，因为谁最缺谁说了算（限制因素）。",
      en: "A leaf uses light to rearrange water and carbon dioxide into sugar and oxygen: click through the equation and balance the atom ledger; then watch the rate rise with light and CO₂ — and cap out, because the scarcest input rules (the limiting factor)."
    },
    tags: [
      { zh: "原子对账", en: "Atom Ledger" },
      { zh: "光饱和", en: "Light Saturation" },
      { zh: "限制因素", en: "Limiting Factor" }
    ],
    category: "biology",
    stage: "junior",
    status: "live",
    path: "photosynthesis/"
  },
  {
    slug: "population-growth",
    title: { zh: "种群增长 · S 形曲线从哪来", en: "Population Growth · Where the S-Curve Comes From" },
    desc: {
      zh: "没有天花板时种群按倍数狂奔，有了容纳量 K 就被压成 S 形：每一代的实际增长率由 r(1−N/K) 当场实算；把 r 推过安全区，还能亲眼看到离散模型振荡失效。",
      en: "With no ceiling a population multiplies wildly; with carrying capacity K it bends into an S. The effective rate r(1−N/K) is computed generation by generation — and if you push r past the safe zone, you can watch the discrete model oscillate and break."
    },
    tags: [
      { zh: "指数增长", en: "Exponential Growth" },
      { zh: "逻辑斯蒂", en: "Logistic" },
      { zh: "容纳量 K", en: "Carrying Capacity" }
    ],
    category: "math",
    stage: "senior",
    status: "live",
    path: "population-growth/"
  },
  {
    slug: "chemical-equilibrium",
    title: { zh: "化学平衡 · 人数不变，人还在跑", en: "Chemical Equilibrium · Still Moving at Balance" },
    desc: {
      zh: "平衡不是反应停了，而是正、逆两个方向跑得一样快：计数走平，粒子还在互变。加一把料、升一次温，看平衡点如何移动；再验证催化剂只改快慢、不改终点。",
      en: "Equilibrium is not the reaction stopping — it is both directions running equally fast: counts level off while particles keep swapping. Add material, raise the temperature and watch the balance point shift; then check that a catalyst changes only the speed, never the endpoint."
    },
    tags: [
      { zh: "动态平衡", en: "Dynamic Equilibrium" },
      { zh: "勒夏特列", en: "Le Chatelier" },
      { zh: "速率相等", en: "Equal Rates" }
    ],
    category: "chemistry",
    stage: "senior",
    status: "live",
    path: "chemical-equilibrium/"
  },
  {
    slug: "acid-base-equilibrium",
    title: { zh: "酸碱平衡 · 分子在两边来回走", en: "Acid–Base Equilibrium · Molecules Move Both Ways" },
    desc: {
      zh: "从 HA ⇌ H⁺ + A⁻ 的粒子往返出发，拖动 Ka、稀释和共同离子，亲眼看解离比例与 pH 如何一起改写。",
      en: "Start with particles moving through HA ⇌ H⁺ + A⁻, then drag Ka, dilution and a common ion to see dissociation and pH change together."
    },
    tags: [
      { zh: "酸碱平衡", en: "Acid–Base Equilibrium" },
      { zh: "Ka", en: "Ka" },
      { zh: "共同离子效应", en: "Common-Ion Effect" }
    ],
    category: "chemistry",
    stage: "senior",
    status: "live",
    path: "acid-base-equilibrium/"
  },
  {
    slug: "reaction-rates",
    title: { zh: "反应速率 · 数一数成功碰撞", en: "Reaction Rates · Counting Successful Collisions" },
    desc: {
      zh: "反应快慢取决于成功碰撞的次数：碰得越勤、能量达标的比例越大，反应越快。温度、浓度、表面积、催化剂四种提速办法，全在模拟里数给你看。",
      en: "How fast a reaction runs comes down to successful collisions: collide more often, and get more collisions over the energy bar. Temperature, concentration, surface area and catalysts — all four speed-ups, counted live in the simulation."
    },
    tags: [
      { zh: "有效碰撞", en: "Effective Collisions" },
      { zh: "活化能", en: "Activation Energy" },
      { zh: "催化剂", en: "Catalysts" }
    ],
    category: "chemistry",
    stage: "senior",
    status: "live",
    path: "reaction-rates/"
  }
];
