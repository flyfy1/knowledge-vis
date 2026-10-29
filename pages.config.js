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
  { id: "engineering", name: { zh: "工程与控制", en: "Engineering & Control" } },
  { id: "probability", name: { zh: "概率与统计", en: "Probability & Statistics" } },
  { id: "computing",   name: { zh: "计算与智能", en: "Computing & AI" } },
  { id: "math",        name: { zh: "数学基础",   en: "Mathematical Foundations" } },
  { id: "chemistry",   name: { zh: "化学", en: "Chemistry" } },
  { id: "biology",     name: { zh: "生物", en: "Biology" } },
  { id: "psychology",  name: { zh: "心理与认知", en: "Psychology & Cognition" } },
  { id: "language",    name: { zh: "语言与语言学", en: "Language & Linguistics" } },
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
  },
  {
    slug: "bayes-diagnostics",
    title: { zh: "贝叶斯诊断 · 阳性结果说明什么？", en: "Bayes Diagnostics · What Does a Positive Mean?" },
    desc: { zh: "把先验、灵敏度、特异度和后验放进 1,000 人频数树，亲眼看见阳性结果的分母如何改变。", en: "Tune prevalence, sensitivity and specificity in a 1,000-person frequency tree and see how a positive result changes the denominator." },
    tags: [{ zh: "贝叶斯推断", en: "Bayesian Inference" }, { zh: "诊断测试", en: "Diagnostic Testing" }, { zh: "条件概率", en: "Conditional Probability" }],
    category: "probability", stage: "senior", status: "live", path: "bayes-diagnostics/"
  },
  {
    slug: "population-ecology",
    title: { zh: "种群生态学 · 增长如何被反馈改变", en: "Population Ecology · Growth Reshaped by Feedback" },
    desc: { zh: "从内禀增长率 r 和承载力 K 走到捕食者—猎物耦合，拖动参数，追踪资源反馈如何把增长改写成波动。", en: "Move from intrinsic rate r and carrying capacity K to predator–prey coupling, then trace how resource feedback reshapes growth into waves." },
    tags: [{ zh: "逻辑斯蒂增长", en: "Logistic Growth" }, { zh: "承载力", en: "Carrying Capacity" }, { zh: "捕食者—猎物", en: "Predator–Prey" }],
    category: "biology", stage: "senior", status: "live", path: "population-ecology/"
  },
  {
    slug: "feedback-control",
    title: { zh: "反馈控制 · 先看差多少，再决定推多少", en: "Feedback Control · See the Error, Then Act" },
    desc: { zh: "从设定值与误差走到 P、I、D：调参时同时看响应、超调、稳态误差和噪声代价。", en: "Trace setpoint and error into P, I and D, then tune while watching response, overshoot, steady-state error and noise cost." },
    tags: [{ zh: "P/I/D", en: "P/I/D" }, { zh: "动态系统", en: "Dynamic Systems" }, { zh: "稳定性", en: "Stability" }],
    category: "engineering", stage: "senior", status: "live", path: "feedback-control/"
  },
  {
    slug: "genetics-probability",
    title: { zh: "遗传与概率 · 从配子到表型", en: "Genetics & Probability · From Gametes to Phenotypes" },
    desc: { zh: "从等位基因分离到 Punnett 方格、独立分配和条件概率，亲手把 3:1 与 9:3:3:1 拆成一条可追踪的因果链。", en: "Trace segregation, Punnett squares, independent assortment and conditional probability until 3:1 and 9:3:3:1 become causal, recomputable outcomes." },
    tags: [{ zh: "孟德尔遗传", en: "Mendelian Genetics" }, { zh: "Punnett 方格", en: "Punnett Squares" }, { zh: "条件概率", en: "Conditional Probability" }],
    category: "probability", stage: "senior", status: "live", path: "genetics-probability/"
  },
  {
    slug: "supply-demand",
    title: { zh: "供需与市场均衡 · 价格线如何相交", en: "Supply & Demand · Where the Market Clears" },
    desc: { zh: "从 Qd = Qs 的交点出发，拖动税、补贴和曲线斜率，追踪楔子、弹性、剩余与无谓损失。", en: "Start at Qd = Qs, then tune taxes, subsidies and curve slopes to trace wedges, elasticity, surplus and deadweight loss." },
    tags: [{ zh: "市场均衡", en: "Market Equilibrium" }, { zh: "弹性", en: "Elasticity" }, { zh: "剩余", en: "Surplus" }],
    category: "math", stage: "university", status: "live", path: "supply-demand/"
  },
  {
    slug: "binary-search",
    title: { zh: "二分查找 · 每次砍掉一半", en: "Binary Search · Halve the Candidates" },
    desc: { zh: "在有序数组里单步追踪 lo、mid、hi：每次比较排除一半候选，再用滑杆看 O(n) 与 O(log n) 的增长差距。", en: "Step through lo, mid and hi on a sorted array: each comparison removes half the candidates, then compare O(n) and O(log n) as n grows." },
    tags: [{ zh: "二分查找", en: "Binary Search" }, { zh: "不变量", en: "Invariants" }, { zh: "复杂度", en: "Complexity" }],
    category: "computing", stage: "university", status: "live", path: "binary-search/"
  },
  {
    slug: "graph-algorithms",
    title: { zh: "图算法 · 让边带你走", en: "Graph Algorithms · Let Edges Lead" },
    desc: { zh: "在一张可编辑的小图上对比 BFS 队列与 DFS 栈，切换一条边，观察 frontier 和 O(V+E) 如何同步改变。", en: "Compare BFS queues and DFS stacks on an editable graph; toggle one edge and watch the frontier and O(V+E) accounting update together." },
    tags: [{ zh: "BFS", en: "BFS" }, { zh: "DFS", en: "DFS" }, { zh: "复杂度", en: "Complexity" }],
    category: "computing", stage: "university", status: "live", path: "graph-algorithms/"
  },
  {
    slug: "membrane-transport",
    title: { zh: "膜运输 · 梯度如何变成通量", en: "Membrane Transport · From Gradient to Flux" },
    desc: { zh: "拖动内外浓度、通透性和 ATP 泵，追踪梯度如何变成净通量、渗透压和细胞体积变化。", en: "Tune inside/outside concentration, permeability and ATP pumping to trace gradients into net flux, osmosis and cell-volume change." },
    tags: [{ zh: "扩散", en: "Diffusion" }, { zh: "渗透", en: "Osmosis" }, { zh: "主动运输", en: "Active Transport" }],
    category: "biology", stage: "senior", status: "live", path: "membrane-transport/"
  },
  {
    slug: "action-potential",
    title: { zh: "神经动作电位 · 一次脉冲如何跑过神经元", en: "Action Potentials · How One Pulse Travels" },
    desc: { zh: "从静息电位推过阈值，跟着 Na⁺ 内流、K⁺ 外流和不应期走完一次尖峰，再数一秒最多能发几次。", en: "Push resting voltage past threshold, follow Na⁺ in, K⁺ out and refractoriness through one spike, then count the maximum spikes per second." },
    tags: [{ zh: "膜电位", en: "Membrane Voltage" }, { zh: "离子通道", en: "Ion Channels" }, { zh: "不应期", en: "Refractoriness" }],
    category: "biology", stage: "senior", status: "live", path: "action-potential/"
  },
  {
    slug: "orbital-motion",
    title: { zh: "轨道运动 · 椭圆、速度与凌日", en: "Orbital Motion · Ellipses, Speed & Transits" },
    desc: { zh: "把偏心率、轨道相位、速度变化和凌日对齐放在同一张可拖动因果图中。", en: "Put eccentricity, orbital phase, speed variation and transit alignment on one draggable causal map." },
    tags: [{ zh: "开普勒定律", en: "Kepler's Laws" }, { zh: "轨道速度", en: "Orbital Speed" }, { zh: "凌日", en: "Transits" }],
    category: "earth", stage: "university", status: "live", path: "orbital-motion/"
  },
  {
    slug: "geology-plate-tectonics",
    title: { zh: "板块构造 · 边界如何留下证据", en: "Plate Tectonics · How Boundaries Leave Evidence" },
    desc: { zh: "区分张裂、汇聚和转换边界，再把相对运动连到洋脊、海沟与地震证据。", en: "Distinguish divergent, convergent and transform boundaries, then connect relative motion to ridges, trenches and earthquake evidence." },
    tags: [{ zh: "板块边界", en: "Plate Boundaries" }, { zh: "地质时间", en: "Geologic Time" }, { zh: "地震证据", en: "Earthquake Evidence" }],
    category: "earth", stage: "senior", status: "live", path: "geology-plate-tectonics/"
  },
  {
    slug: "climate-energy",
    title: { zh: "气候能量账本 · 太阳光如何变成温度", en: "Climate Energy Ledger · How Sunlight Becomes Temperature" },
    desc: { zh: "从纬度入射、表面反照到红外出射，沿着一束光走完整个气候能量链。", en: "Trace one beam through latitude, surface albedo and infrared escape to balance the climate energy ledger." },
    tags: [{ zh: "能量平衡", en: "Energy Balance" }, { zh: "反照率", en: "Albedo" }, { zh: "温室效应", en: "Greenhouse Effect" }],
    category: "earth", stage: "senior", status: "live", path: "climate-energy/"
  },


  {
    slug: "momentum-collision",
    title: { zh: "动量与碰撞 · 速度不是全部", en: "Momentum & Collisions · Speed Is Not the Whole Story" },
    desc: { zh: "从 p = m·v 到 J = F·Δt，拖动质量、速度、力和时间，追踪碰撞守恒与安全停下的力。", en: "From p = m·v to J = F·Δt, tune mass, speed, force and time to trace collision conservation and safer stopping." },
    tags: [{ zh: "动量", en: "Momentum" }, { zh: "冲量", en: "Impulse" }, { zh: "碰撞", en: "Collisions" }],
    category: "physics", stage: "junior", status: "live", path: "momentum-collision/"
  },


  {
    slug: "network-flow",
    title: { zh: "网络流 · 一封消息的旅程", en: "Network Flow · A Message’s Journey" },
    desc: { zh: "从分包、延迟与带宽，到路由、TCP 握手和拥塞控制：一封消息如何穿过不可靠的网络，逐层拼成可靠的字节流。", en: "From packetization, latency and bandwidth to routing, TCP handshakes and congestion control: watch an unreliable network become a reliable byte stream layer by layer." },
    tags: [{ zh: "计算机网络", en: "Computer Networks" }, { zh: "TCP", en: "TCP" }, { zh: "拥塞控制", en: "Congestion Control" }],
    category: "computing", stage: "university", status: "live", path: "network-flow/"
  },

  {
    slug: "linguistics-phonology",
    title: { zh: "语音与音位 · 从口腔到对立", en: "Speech Sounds & Phonemes · From Mouth to Contrast" },
    desc: {
      zh: "从发音动作、最小对立到音节槽位和复数同化，点击一个特征，追踪它怎样改变结构与意义。",
      en: "From articulation and minimal pairs to syllable slots and plural assimilation, change one feature and trace how structure and meaning move."
    },
    tags: [
      { zh: "语音学", en: "Phonetics" },
      { zh: "音位", en: "Phonemes" },
      { zh: "音节结构", en: "Syllable Structure" }
    ],
    category: "language", stage: "senior", status: "live", path: "linguistics-phonology/"
  },

  {
    slug: "climate-feedback",
    title: { zh: "气候反馈 · 一笔一笔对上能量账", en: "Climate Feedback · Balance the Energy Ledger" },
    desc: { zh: "从 CO₂ 辐射强迫到冰雪、水汽和碳循环反馈，拖动旋钮追踪一条可检验的变暖因果链。", en: "Trace a testable warming chain from CO₂ forcing through ice, water-vapour and carbon-cycle feedbacks." },
    tags: [{ zh: "辐射强迫", en: "Radiative Forcing" }, { zh: "气候反馈", en: "Climate Feedback" }, { zh: "碳循环", en: "Carbon Cycle" }],
    category: "earth", stage: "senior", status: "live", path: "climate-feedback/"
  },

  {
    slug: "linear-transform",
    title: { zh: "二维线性变换 · 矩阵如何挪动平面", en: "2D Linear Transformations · How Matrices Move the Plane" },
    desc: { zh: "拖动矩阵四个参数，观察网格、基向量、行列式面积和特征方向如何一起变化。", en: "Tune four matrix entries and watch the grid, basis vectors, determinant area and eigen-directions move together." },
    tags: [{ zh: "矩阵", en: "Matrices" }, { zh: "行列式", en: "Determinants" }, { zh: "基向量", en: "Basis Vectors" }],
    category: "math", stage: "university", status: "live", path: "linear-transform/"
  },

  {
    slug: "probability-distribution",
    title: { zh: "概率分布 · 随机性也有形状", en: "Probability Distributions · Randomness Has a Shape" },
    desc: { zh: "在离散与连续分布之间切换，拖动参数，看概率质量、密度、均值与方差如何重排。", en: "Switch between discrete and continuous distributions, then tune parameters to see mass, density, mean and variance reorganize." },
    tags: [{ zh: "概率分布", en: "Probability Distributions" }, { zh: "均值与方差", en: "Mean & Variance" }, { zh: "随机变量", en: "Random Variables" }],
    category: "probability", stage: "senior", status: "live", path: "probability-distribution/"
  },

  {
    slug: "thermodynamics",
    title: { zh: "热力学 · 一口气追踪能量", en: "Thermodynamics · Track Energy Through a Gas" },
    desc: { zh: "拖动活塞、切换等温与绝热过程，从 P–V 曲线面积走到第一定律和卡诺效率上限。", en: "Move the piston, compare isothermal and adiabatic paths, then connect P–V area to the first law and Carnot's efficiency ceiling." },
    tags: [{ zh: "第一定律", en: "First Law" }, { zh: "P–V 图", en: "P–V Diagram" }, { zh: "热机", en: "Heat Engines" }],
    category: "physics", stage: "university", status: "live", path: "thermodynamics/"
  },

  {
    slug: "buffer-capacity",
    title: { zh: "缓冲溶液 · 把 pH 稳住", en: "Buffer Capacity · Holding pH Steady" },
    desc: { zh: "调节酸碱加入量、浓度与 pKa，观察共轭对如何吸收扰动，以及缓冲容量何时耗尽。", en: "Tune acid/base additions, concentration and pKa to see a conjugate pair absorb disturbance and reveal when capacity runs out." },
    tags: [{ zh: "缓冲溶液", en: "Buffer Solutions" }, { zh: "pH", en: "pH" }, { zh: "共轭酸碱对", en: "Conjugate Pairs" }],
    category: "chemistry", stage: "senior", status: "live", path: "buffer-capacity/"
  },


  {
    slug: "quantum-basics",
    title: { zh: "量子基础 · 可能性先于结果", en: "Quantum Basics · Possibility Before Outcome" },
    desc: { zh: "从振幅、测量、相位到干涉，拖动一个量子比特的状态，观察概率如何先于结果出现。", en: "From amplitudes and measurement to phase and interference, tune one qubit and watch probability appear before the outcome." },
    tags: [{ zh: "振幅", en: "Amplitudes" }, { zh: "测量", en: "Measurement" }, { zh: "干涉", en: "Interference" }],
    category: "physics", stage: "university", status: "live", path: "quantum-basics/"
  },
  {
    slug: "number-combinatorics",
    title: { zh: "数论与组合 · 把结构算出来", en: "Number Theory & Counting · Compute the Structure" },
    desc: { zh: "用质因数分解、欧几里得算法、gcd/lcm 和 Pascal 行，把“数有多少种”变成可追踪的结构。", en: "Use prime factors, Euclid's algorithm, gcd/lcm and Pascal rows to turn counting into a traceable structure." },
    tags: [{ zh: "质因数", en: "Prime Factors" }, { zh: "最大公因数", en: "GCD" }, { zh: "组合数", en: "Combinations" }],
    category: "math", stage: "junior", status: "live", path: "number-combinatorics/"
  },
  {
    slug: "materials-science",
    title: { zh: "材料科学 · 应力如何变成断裂", en: "Materials Science · When Stress Becomes Fracture" },
    desc: { zh: "比较钢、铝和工程塑料的应力–应变响应，追踪屈服、塑性、韧性和断裂的工程取舍。", en: "Compare steel, aluminium and polymer stress–strain responses, then trace the engineering trade-offs among yield, plasticity, toughness and fracture." },
    tags: [{ zh: "应力–应变", en: "Stress–Strain" }, { zh: "屈服", en: "Yield" }, { zh: "韧性", en: "Toughness" }],
    category: "physics", stage: "university", status: "live", path: "materials-science/"
  },


  {
    slug: "game-theory",
    title: { zh: "博弈论 · 先看对手会怎么选", en: "Game Theory · Look at the Other Choice First" },
    desc: { zh: "在 2×2 收益矩阵里找最佳回应、占优策略和纳什均衡，再看混合策略如何把不确定性算出来。", en: "Use a 2×2 payoff matrix to find best responses, dominant strategies and Nash equilibria, then compute mixed-strategy uncertainty." },
    tags: [{ zh: "收益矩阵", en: "Payoff Matrix" }, { zh: "纳什均衡", en: "Nash Equilibrium" }, { zh: "最佳回应", en: "Best Response" }],
    category: "math", stage: "university", status: "live", path: "game-theory/"
  },
  {
    slug: "neuroscience-basics",
    title: { zh: "神经科学基础 · 从静息到脉冲", en: "Neuroscience Basics · From Rest to Spike" },
    desc: { zh: "从 K⁺/Na⁺ 漏通道和静息电位走到阈值、全或无尖峰与不应期频率上限。", en: "Trace K⁺/Na⁺ leak balance into resting potential, threshold, all-or-none spikes and the refractory firing ceiling." },
    tags: [{ zh: "静息电位", en: "Resting Potential" }, { zh: "阈值", en: "Threshold" }, { zh: "不应期", en: "Refractory Period" }],
    category: "biology", stage: "senior", status: "live", path: "neuroscience-basics/"
  },
  {
    slug: "cosmology-expansion",
    title: { zh: "宇宙膨胀 · 空间本身在变大", en: "Cosmic Expansion · Space Itself Gets Larger" },
    desc: { zh: "拖动尺度因子、哈勃常数和红移，沿着 d=aχ、v=H₀d、λ=(1+z)λ₀ 读懂膨胀宇宙。", en: "Tune the scale factor, Hubble constant and redshift to read an expanding universe through d=aχ, v=H₀d and λ=(1+z)λ₀." },
    tags: [{ zh: "尺度因子", en: "Scale Factor" }, { zh: "哈勃定律", en: "Hubble Law" }, { zh: "红移", en: "Redshift" }],
    category: "earth", stage: "university", status: "live", path: "cosmology-expansion/"
  },


  {
    slug: "distributed-systems",
    title: { zh: "分布式系统 · 多个副本如何像一个值", en: "Distributed Systems · How Replicas Behave Like One Value" },
    desc: { zh: "拖动副本数、读写 quorum 和网络分区，观察复制、一致性与可用性如何互相牵制。", en: "Tune replica count, read/write quorums and partitions to see replication, consistency and availability trade-offs." },
    tags: [{ zh: "副本", en: "Replication" }, { zh: "一致性", en: "Consistency" }, { zh: "Quorum", en: "Quorum" }],
    category: "computing", stage: "university", status: "live", path: "distributed-systems/"
  },
  {
    slug: "psychology-cognition",
    title: { zh: "心理与认知 · 注意、记忆与干扰", en: "Psychology & Cognition · Attention, Memory & Interference" },
    desc: { zh: "用工作记忆容量、注意瓶颈、提取线索和前摄/后摄干扰，理解“记不住”背后的可计算机制。", en: "Use working-memory capacity, attention bottlenecks, retrieval cues and proactive/retroactive interference to model why recall changes." },
    tags: [{ zh: "工作记忆", en: "Working Memory" }, { zh: "注意", en: "Attention" }, { zh: "提取", en: "Retrieval" }],
    category: "psychology", stage: "senior", status: "live", path: "psychology-cognition/"
  },
  {
    slug: "music-theory",
    title: { zh: "音乐理论 · 从音程到终止", en: "Music Theory · From Intervals to Cadence" },
    desc: { zh: "从半音距离和频率比走到音阶级数、和弦功能与终止，建立可计算的听觉理论直觉。", en: "Move from semitone distance and frequency ratios to scale degrees, chord function and cadence with a computable theory intuition." },
    tags: [{ zh: "音程", en: "Intervals" }, { zh: "和弦功能", en: "Chord Function" }, { zh: "终止", en: "Cadence" }],
    category: "math", stage: "senior", status: "live", path: "music-theory/"
  },


  {
    slug: "ethics-decisions",
    title: { zh: "伦理决策 · 把取舍说清楚", en: "Ethical Decisions · Make the Trade-off Visible" },
    desc: { zh: "用后果、权利、公平与同意四个镜头拆开决策，不替你给出道德或政策答案。", en: "Use consequences, rights, fairness and consent to unpack a decision without pretending to supply a moral or policy verdict." },
    tags: [{ zh: "后果", en: "Consequences" }, { zh: "自主同意", en: "Consent" }, { zh: "公平", en: "Fairness" }],
    category: "psychology", stage: "senior", status: "live", path: "ethics-decisions/"
  },
  {
    slug: "statistical-inference",
    title: { zh: "统计推断 · 从样本到判断", en: "Statistical Inference · From Sample to Judgment" },
    desc: { zh: "从抽样分布走到置信区间、z 分数和 p 值，区分“数据有多不确定”和“假设有多不寻常”。", en: "Move from sampling distributions to confidence intervals, z-scores and p-values, separating data uncertainty from how unusual a hypothesis looks." },
    tags: [{ zh: "抽样分布", en: "Sampling Distribution" }, { zh: "置信区间", en: "Confidence Interval" }, { zh: "p 值", en: "p-value" }],
    category: "probability", stage: "senior", status: "live", path: "statistical-inference/"
  },
  {
    slug: "advanced-robotics",
    title: { zh: "高阶机器人学 · 从角度到末端", en: "Advanced Robotics · From Angles to the End Effector" },
    desc: { zh: "拖动平面二连杆的关节角，追踪正/逆运动学、Jacobian 速度映射与奇异位形。", en: "Tune a planar two-link arm and trace forward/inverse kinematics, Jacobian velocity mapping and singular configurations." },
    tags: [{ zh: "正运动学", en: "Forward Kinematics" }, { zh: "逆运动学", en: "Inverse Kinematics" }, { zh: "Jacobian", en: "Jacobian" }],
    category: "computing", stage: "university", status: "live", path: "advanced-robotics/"
  },
  {
    slug: "public-health",
    title: { zh: "公共卫生 · 从曲线到干预", en: "Public Health · From Curves to Interventions" },
    desc: { zh: "用传播曲线、R₀、检测指标与干预取舍，建立流行病学的教学模型直觉。", en: "Build an epidemiology intuition with epidemic curves, R₀, test metrics and intervention trade-offs." },
    tags: [{ zh: "传播曲线", en: "Epidemic Curves" }, { zh: "R₀ 与 Rₑ", en: "R₀ & Rₑ" }, { zh: "敏感度与特异度", en: "Sensitivity & Specificity" }],
    category: "biology", stage: "senior", status: "live", path: "public-health/"
  },
  {
    slug: "computer-graphics",
    title: { zh: "计算机图形学 · 从坐标到画面", en: "Computer Graphics · From Coordinates to Pixels" },
    desc: { zh: "拖动坐标变换、光栅化和漫反射，走完一条简化的 2D 渲染管线。", en: "Tune coordinate transforms, rasterization and diffuse shading through a compact 2D rendering pipeline." },
    tags: [{ zh: "坐标变换", en: "Coordinate Transforms" }, { zh: "光栅化", en: "Rasterization" }, { zh: "漫反射", en: "Diffuse Shading" }],
    category: "computing", stage: "university", status: "live", path: "computer-graphics/"
  },
  {
    slug: "mechanism-auction",
    title: { zh: "机制设计与拍卖 · 报价如何改变结果", en: "Mechanism Design & Auctions · How Bids Change Outcomes" },
    desc: { zh: "比较第一价与第二价拍卖，追踪赢家、付款和收益，理解规则如何塑造激励。", en: "Compare first- and second-price auctions, then trace winners, payments and utilities to see how rules shape incentives." },
    tags: [{ zh: "第一价拍卖", en: "First-Price Auction" }, { zh: "第二价拍卖", en: "Second-Price Auction" }, { zh: "激励", en: "Incentives" }],
    category: "math", stage: "university", status: "live", path: "mechanism-auction/"
  },
  {
    slug: "activation-energy",
    title: { zh: "活化能 · 反应要翻过的那座山", en: "Activation Energy · The Hill a Reaction Has to Climb" },
    desc: { zh: "反应物要先爬上一座能量山才能变成生成物：山多高、有多少分子爬得上去，决定了反应有多快。", en: "Reactants must climb an energy hill before they become products: how high the hill is, and how many molecules can climb it, decides how fast the reaction goes." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "senior", status: "live", path: "activation-energy/"
  },
  {
    slug: "blood-circulation",
    title: { zh: "血液循环", en: "Blood Circulation" },
    desc: { zh: "一滴血从左心室出发，先去全身再回心脏，再去肺里换气——两个环路接在同一颗心脏上，红和蓝只代表含氧量多少。", en: "A drop of blood leaves the left ventricle, visits the whole body, returns to the heart, then goes to the lungs — two loops on one heart, with red and blue showing only oxygen content." },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "junior", status: "live", path: "blood-circulation/"
  },
  {
    slug: "buoyancy-archimedes",
    title: { zh: "浮力与阿基米德", en: "Buoyancy & Archimedes" },
    desc: { zh: "把物体慢慢浸入水里，弹簧秤读数一路掉下去——掉的那部分恰好等于被它排开的水的重量。", en: "Lower an object into water and the spring scale reading keeps dropping — by exactly the weight of the water it pushes aside." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "buoyancy-archimedes/"
  },
  {
    slug: "combustion-triangle",
    title: { zh: "燃烧三要素", en: "The Fire Triangle" },
    desc: { zh: "可燃物、氧气、够高的温度——三条腿缺一不可。灭火不是把火「打」死，而是把其中一条腿抽掉。", en: "Fuel, oxygen and enough heat: you need all three. Putting a fire out does not mean beating it — it means taking one leg away." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "junior", status: "live", path: "combustion-triangle/"
  },
  {
    slug: "conic-sections",
    title: { zh: "圆锥曲线", en: "Conic Sections" },
    desc: { zh: "圆、椭圆、抛物线、双曲线看起来毫不相干，其实是同一个圆锥被不同角度的平面切出来的一家人，一个离心率 e 就能把它们连成一条线。", en: "Circle, ellipse, parabola and hyperbola look unrelated, yet they are one family cut from the same cone by planes at different angles — and a single number, the eccentricity e, strings them on one line." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "senior", status: "live", path: "conic-sections/"
  },
  {
    slug: "contour-lines",
    title: { zh: "等高线", en: "Contour Lines" },
    desc: { zh: "地图上那些一圈圈的曲线，是把山体按相同高度一层层切开、再从正上方看下去的样子——圈越密的地方越陡。", en: "The rings on a map come from slicing a hill at equal heights and looking straight down: where the rings crowd together, the ground is steep." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "junior", status: "live", path: "contour-lines/"
  },
  {
    slug: "density",
    title: { zh: "密度", en: "Density" },
    desc: { zh: "同样大的铁块和木块，天平一称就分出高下——「每立方厘米里装了多少质量」就是密度。", en: "An iron block and a wood block of the same size: one weighing tells them apart. Density is how much mass fits in each cubic centimetre." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "density/"
  },
  {
    slug: "dissolution-saturation",
    title: { zh: "溶解与饱和", en: "Dissolution & Saturation" },
    desc: { zh: "一勺勺往水里加盐，开始全化掉，加到某个点再也不化——这个「装满」的状态叫饱和，它不是不动了，而是溶解和结晶一样快。", en: "Add salt to water spoon by spoon: at first it all disappears, then at some point it will not dissolve any more. That “full” state is saturation — not frozen, but dissolving and crystallising at the same speed." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "junior", status: "live", path: "dissolution-saturation/"
  },
  {
    slug: "dna-replication",
    title: { zh: "DNA 复制与翻译 · 拉链、抄写和流水线", en: "DNA Replication and Translation · A Zipper, a Copy and an Assembly Line" },
    desc: { zh: "碱基像拉链两两配对；复制时每条链都当模板，抄写出 mRNA，核糖体再按密码子一格一格造出蛋白质。", en: "Bases pair up like a zipper; in replication each strand is a template, transcription copies a gene into mRNA, and the ribosome builds a protein codon by codon." },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "senior", status: "live", path: "dna-replication/"
  },
  {
    slug: "doppler-effect",
    title: { zh: "多普勒效应 · 驶近变尖，驶远变沉", en: "The Doppler Effect · Higher as It Approaches, Lower as It Leaves" },
    desc: { zh: "一个发声的源在运动，波前被挤密或拉疏；从波前的间距算出听到的频率，再到掠过时的音调曲线和超音速的马赫锥。", en: "A sound source moves, and its wavefronts bunch up or stretch out; from the wavefront spacing work out the heard frequency, then the pitch curve of a pass-by and the Mach cone." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "doppler-effect/"
  },
  {
    slug: "electric-fields",
    title: { zh: "电场 · 看不见的力画成图", en: "Electric Fields · Drawing an Invisible Force" },
    desc: { zh: "从一个点电荷的场出发，叠加、画场线、画等势面，最后放一个电荷看它怎么动。", en: "Start with one point charge, then add fields, draw field lines and equipotentials, and finally release a charge to watch it move." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "electric-fields/"
  },
  {
    slug: "electrochemistry",
    title: { zh: "电化学 · 电子沿导线跑，还是被电推着跑", en: "Electrochemistry · Electrons Running Down the Wire, or Pushed Along" },
    desc: { zh: "氧化还原反应被拆成两个半电池：自发时电子沿导线流出电流（原电池），外加电压反推时就是电解池。", en: "A redox reaction is split into two half-cells: spontaneously it drives a current through the wire (a galvanic cell), and an applied opposing voltage turns it into an electrolytic cell." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "senior", status: "live", path: "electrochemistry/"
  },
  {
    slug: "electromagnetic-induction",
    title: { zh: "电磁感应 · 磁通量一变，电压就来", en: "Electromagnetic Induction · Change the Flux, Get a Voltage" },
    desc: { zh: "让磁铁穿过线圈，看磁通量的变化率怎样变成电压，再看楞次定律如何定方向、转动线圈如何发电。", en: "Pass a magnet through a coil, see how the rate of change of flux becomes a voltage, then how Lenz\\" },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "electromagnetic-induction/"
  },
  {
    slug: "energy-pyramid",
    title: { zh: "能量金字塔 · 为什么顶级捕食者那么少", en: "The Energy Pyramid · Why Top Predators Are Rare" },
    desc: { zh: "阳光的能量一级一级往上传，每上一级只剩一成左右；顶级食肉动物为什么稀有、人吃素为什么养得活更多人，都能算出来。", en: "Sunlight\\" },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "junior", status: "live", path: "energy-pyramid/"
  },
  {
    slug: "enzymes",
    title: { zh: "酶 · 生物体内的催化剂", en: "Enzymes · Catalysts of the Living World" },
    desc: { zh: "酶用一个形状合适的“口袋”把底物拉到一起，让反应在体温下就能飞快进行：从锁钥配合，到饱和、温度、pH 和抑制剂。", en: "An enzyme pulls substrates together in a pocket of the right shape so reactions run fast at body temperature: from lock-and-key fit to saturation, temperature, pH and inhibitors." },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "senior", status: "live", path: "enzymes/"
  },
  {
    slug: "equation-balancing",
    title: { zh: "化学方程式配平", en: "Balancing Chemical Equations" },
    desc: { zh: "化学反应不会凭空多出或消失原子，所以方程式两边每种原子数必须相等——配平就是调系数，把每杆小天平都调平。", en: "Reactions never create or destroy atoms, so every element must have equal counts on both sides — balancing means adjusting coefficients until every little scale is level." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "junior", status: "live", path: "equation-balancing/"
  },
  {
    slug: "food-web",
    title: { zh: "食物网", en: "Food Webs" },
    desc: { zh: "草、兔、狐连成网——吃与被吃把能量一层层往上送，网里任何一个结点变了，别处也会跟着变。", en: "Grass, rabbit, fox joined into a web — eating and being eaten passes energy up level by level, and a change at any node ripples to others." },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "junior", status: "live", path: "food-web/"
  },
  {
    slug: "isomers",
    title: { zh: "同分异构体 · 同一组原子，不同的拼法", en: "Isomers · The Same Atoms, Put Together Differently" },
    desc: { zh: "分子式相同、原子连接方式不同，就是不同的分子：数骨架、判断“画法不同还是分子不同”，再看单键与双键怎样让镜像般的异构体分得开。", en: "Same molecular formula, different connections between atoms, means different molecules: count the skeletons, tell \"drawn differently\" from \"really different\", and see why double bonds keep cis and trans apart." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "senior", status: "live", path: "isomers/"
  },
  {
    slug: "kinetic-theory",
    title: { zh: "气体压强的微观图景 · 撞墙的账本", en: "The Microscopic Picture of Gas Pressure · A Ledger of Wall Hits" },
    desc: { zh: "盒子里的粒子乱撞：压强是撞墙的冲量账，温度是平均动能，速率分布自己从碰撞里长出来。", en: "Particles in a box bounce around: pressure is a ledger of wall impulses, temperature is mean kinetic energy, and the speed distribution grows out of collisions." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "kinetic-theory/"
  },
  {
    slug: "latitude-longitude",
    title: { zh: "经纬网", en: "Latitude & Longitude" },
    desc: { zh: "地球是个球，没有「上下左右」的格子——但只要说「北纬多少度、东经多少度」，就能在地球表面上定位任意一点。", en: "Earth is a sphere with no built-in grid — yet “so many degrees north, so many east” pins down any point on its surface." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "junior", status: "live", path: "latitude-longitude/"
  },
  {
    slug: "magnetic-force",
    title: { zh: "磁场与洛伦兹力 · 力总是垂直于速度", en: "Magnetic Force · The Force Is Always Sideways to the Velocity" },
    desc: { zh: "从一个带电粒子在磁场里“拐弯”出发，推出圆半径、周期，再用它称离子质量、挑选速度。", en: "Start with a charged particle bending in a magnetic field, derive its radius and period, then use them to weigh ions and pick out a speed." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "magnetic-force/"
  },
  {
    slug: "meiosis",
    title: { zh: "减数分裂 · 洗牌、切半，造配子", en: "Meiosis · Shuffle, Halve, Make Gametes" },
    desc: { zh: "染色体成对配对、交换片段、先分开同源染色体再分开姐妹染色单体：一个二倍体细胞变成四个互不完全相同的单倍体配子。", en: "Chromosomes pair up, swap pieces, first separate the homologs and then the sister chromatids: one diploid cell becomes four haploid gametes that are not all alike." },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "senior", status: "live", path: "meiosis/"
  },
  {
    slug: "molecular-shapes",
    title: { zh: "分子构型 · 电子对互相躲开", en: "Molecular Shapes · Electron Pairs Keeping Out of Each Other\\" },
    desc: { zh: "中心原子周围的电子对彼此排斥，自己排成最分散的队形；水为什么弯、甲烷为什么是正四面体，都从这里来。", en: "Electron pairs around a central atom repel one another and settle into the most spread-out arrangement; that is why water is bent and methane is a regular tetrahedron." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "senior", status: "live", path: "molecular-shapes/"
  },
  {
    slug: "molecules-atoms",
    title: { zh: "分子与原子", en: "Molecules & Atoms" },
    desc: { zh: "水烧开、水通电都是「水变了」，可一个是分子换了位置，一个是分子被拆开重组——原子不变，分子才变。", en: "Boiling water and electrolysing water both “change the water”, but one only moves the molecules and the other tears them apart and rebuilds — atoms stay, molecules change." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "junior", status: "live", path: "molecules-atoms/"
  },
  {
    slug: "natural-selection",
    title: { zh: "自然选择 · 胡椒蛾的颜色为什么翻转", en: "Natural Selection · Why the Peppered Moth Flipped Colour" },
    desc: { zh: "同一种蛾有浅色和深色两种；鸟看得见的先被吃掉，剩下的繁殖——树皮颜色一变，几代之后种群的颜色比例就跟着翻转。", en: "One species of moth comes in light and dark forms; birds eat what they can see, the survivors breed, and when the bark colour changes the colour ratio flips within a few generations." },
    tags: [{ zh: "生物", en: "Biology" }],
    category: "biology", stage: "senior", status: "live", path: "natural-selection/"
  },
  {
    slug: "patterns-sequences",
    title: { zh: "找规律 · 不画也能报出第 100 个", en: "Patterns · Name the 100th Without Drawing It" },
    desc: { zh: "用火柴棒摆图形：数出前几个，找到“每次多几根”，就能直接算出任意第 n 个。", en: "Build shapes from matchsticks: count the first few, find how many are added each time, then compute any figure n directly." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "patterns-sequences/"
  },
  {
    slug: "periodic-trends",
    title: { zh: "元素周期律 · 周期表上的渐变", en: "Periodic Trends · Gradients Across the Periodic Table" },
    desc: { zh: "把原子半径、电离能、电负性涂成热图：沿周期、沿族有规律的渐变，由核电荷和电子层数解释，也有少数例外。", en: "Colour atomic radius, ionisation energy and electronegativity onto the table: they change in regular gradients along periods and groups, explained by nuclear charge and the number of shells, with a few exceptions." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "senior", status: "live", path: "periodic-trends/"
  },
  {
    slug: "ph-scale",
    title: { zh: "pH 标度", en: "The pH Scale" },
    desc: { zh: "酸得多厉害、碱得多厉害，用一条 0 到 14 的刻度就能说清——pH 每差 1，酸碱的「劲」差 10 倍。", en: "How acidic or alkaline something is can be placed on one 0-to-14 ruler — and each step of 1 on it is a factor of 10." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "junior", status: "live", path: "ph-scale/"
  },
  {
    slug: "photoelectric-effect",
    title: { zh: "光电效应 · 光是一份一份的", en: "The Photoelectric Effect · Light Comes in Packets" },
    desc: { zh: "光照金属：频率不到门槛，再亮也打不出电子；过了门槛，电子的最大动能只随频率走，亮度只决定个数。", en: "Light on a metal: below a threshold frequency no electrons come out however bright it is; above it, the electrons\\" },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "photoelectric-effect/"
  },
  {
    slug: "pressure",
    title: { zh: "压强", en: "Pressure" },
    desc: { zh: "穿雪鞋不陷、图钉尖头易摁——同样的力，作用面积越小，压得越狠。「每单位面积上的压力」就是压强。", en: "Snowshoes keep you on top; a thumbtack tip goes in easily. The same force pressed on a smaller area pushes harder: force per unit area is pressure." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "pressure/"
  },
  {
    slug: "resonance",
    title: { zh: "共振 · 踩中节拍，小推也能荡高", en: "Resonance · Push in Time and a Small Force Goes a Long Way" },
    desc: { zh: "从弹簧的固有节拍出发，看阻尼怎样让振动衰减，再看周期性的推力在什么频率下把振幅推到最高。", en: "Start from a spring\\" },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "resonance/"
  },
  {
    slug: "seasons-orbit",
    title: { zh: "地球公转与四季", en: "Earth’s Orbit & the Seasons" },
    desc: { zh: "夏天不是因为地球离太阳近，而是因为地轴斜着——绕太阳一圈，南北半球轮流把「脸」朝向太阳，昼夜长短也跟着轮流占上风。", en: "Summer is not because Earth is closer to the Sun, but because its axis is tilted: around the orbit the hemispheres take turns facing the Sun, and day length swings with them." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "junior", status: "live", path: "seasons-orbit/"
  },
  {
    slug: "titration-curves",
    title: { zh: "滴定曲线 · 终点附近 pH 的“悬崖”", en: "Titration Curves · The pH Cliff Near the End Point" },
    desc: { zh: "往酸里一滴滴加碱：pH 先缓慢爬升，在等当点附近陡然跳升；指示剂变色要对准这个跳升。", en: "Add base to acid drop by drop: pH creeps up, then leaps near the equivalence point; the indicator must change colour right on that leap." },
    tags: [{ zh: "化学", en: "Chemistry" }],
    category: "chemistry", stage: "senior", status: "live", path: "titration-curves/"
  },
  {
    slug: "attention-mechanism",
    title: { zh: "注意力机制 · 每个词决定看谁", en: "Attention · Every Word Decides Where to Look" },
    desc: { zh: "从「查询与键的点积」到 softmax 权重、加权求和，再到整句的注意力矩阵：每个词怎样决定「看谁多一点」。", en: "From the dot product of query and key, through softmax weights and a weighted sum, to a whole-sentence attention matrix: how each word decides whom to look at." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "attention-mechanism/"
  },
  {
    slug: "averaging-leveling",
    title: { zh: "平均数 · 移多补少", en: "Averages · Level by Pouring" },
    desc: { zh: "高低不齐的水杯互相倒一倒，水位齐平的那个高度就是平均数。", en: "Pour water between uneven cups until they are level: the common level is the mean." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "averaging-leveling/"
  },
  {
    slug: "backpropagation",
    title: { zh: "反向传播 · 误差沿网络回流", en: "Backpropagation · Error Flows Back Through the Network" },
    desc: { zh: "输出错了，每个权重该负多少责任？用最小的网络，从「推一下看变化」走到链式法则、梯度下降，再看深层网络里梯度为什么会消失。", en: "When the output is wrong, how much blame does each weight carry? Use the smallest network to go from “nudge and see” to the chain rule and gradient descent, then see why gradients vanish in deep networks." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "backpropagation/"
  },
  {
    slug: "bandit-arms",
    title: { zh: "多臂老虎机 · 探索还是利用", en: "Multi-Armed Bandits · Explore or Exploit" },
    desc: { zh: "五台看不出差别的机器，每台的中奖率你看不见：先亲手拉几次，再看贪心、ε-贪心、UCB 和汤普森采样怎样在「多试试」与「拉最好的」之间取舍。", en: "Five machines that look alike, each with a payout rate you cannot see: pull a few by hand, then watch greedy, ε-greedy, UCB and Thompson sampling trade off “try more” against “pull the best”." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "university", status: "live", path: "bandit-arms/"
  },
  {
    slug: "bar-charts",
    title: { zh: "条形图 · 让数字站成一排比高矮", en: "Bar Charts · Numbers Standing in a Row" },
    desc: { zh: "一排柱子把数字变成长度：读得出谁高谁矮，也看得出平均线把高出和不足补平。", en: "A row of bars turns numbers into lengths: see who is taller, and watch the average line balance the highs against the lows." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "bar-charts/"
  },
  {
    slug: "chicken-rabbit",
    title: { zh: "鸡兔同笼 · 先假设，差额会说话", en: "Chickens & Rabbits · Assume First, Let the Gap Speak" },
    desc: { zh: "知道头数和脚数，先假设“全是鸡”，多出来的脚恰好暴露了兔子有几只。", en: "Know the heads and the feet: assume they are all chickens, and the extra feet give away how many rabbits there are." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "chicken-rabbit/"
  },
  {
    slug: "circle-intro",
    title: { zh: "圆的认识 · 圆规、半径与 π", en: "The Circle · Compass, Radius and π" },
    desc: { zh: "圆规一转画出圆；把圆周拉直量一量，周长总是直径的 3 倍多一点——这个倍数就是 π。", en: "A compass sweeps out a circle; unroll its edge and it is always a little over 3 diameters long: that multiple is π." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "circle-intro/"
  },
  {
    slug: "clock-angles",
    title: { zh: "时钟与角度 · 两根针的赛跑", en: "Clocks & Angles · A Race Between Two Hands" },
    desc: { zh: "时针慢、分针快：知道它们各转多快，就能算出任意时刻两针的夹角，也能找到它们重合的时刻。", en: "The hour hand is slow and the minute hand is fast: know how fast each turns and you can find the angle between them at any time, and when they overlap." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "clock-angles/"
  },
  {
    slug: "decision-trees",
    title: { zh: "决策树与信息增益", en: "Decision Trees and Information Gain" },
    desc: { zh: "每一刀都问一个是非题：怎样挑最能降低混乱度的那一刀，一刀接一刀长成一棵树，又为什么不能长得太深。", en: "Each cut asks a yes/no question: how to pick the cut that reduces disorder the most, grow a tree one cut at a time, and why it should not grow too deep." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "decision-trees/"
  },
  {
    slug: "embeddings",
    title: { zh: "词向量 · 把词摆成地图", en: "Word Embeddings · Words as a Map" },
    desc: { zh: "一个词怎样变成一串数字？数字怎样衡量相似、做类比，机器又怎样不靠手工特征，从「常和谁在一起」里学出它们。", en: "How does a word become a list of numbers? How do the numbers measure similarity and solve analogies, and how can a machine learn them from “who a word keeps company with” instead of hand-made features?" },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "embeddings/"
  },
  {
    slug: "float-sink",
    title: { zh: "浮与沉 · 排开的水托住了谁", en: "Float & Sink · What the Displaced Water Holds Up" },
    desc: { zh: "同一块橡皮泥，捏成球会沉、捏成船会浮：决定浮沉的，是它排开了多少水。", en: "The same plasticine sinks as a ball but floats as a boat: what decides it is how much water it pushes aside." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "primary", status: "live", path: "float-sink/"
  },
  {
    slug: "inequalities",
    title: { zh: "不等式 · 天平倾斜，答案是一整段", en: "Inequalities · A Tilted Scale Has a Whole Range of Answers" },
    desc: { zh: "天平不平的时候，答案不是一个数而是一段范围：在数轴上涂阴影，乘负数时要把不等号翻过来。", en: "When the scale tilts, the answer is a range, not one number: shade it on the number line, and flip the sign when you multiply by a negative." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "inequalities/"
  },
  {
    slug: "intervals-fences",
    title: { zh: "间隔与植树 · 段数和点数差一", en: "Intervals & Fences · Gaps and Posts Differ by One" },
    desc: { zh: "路边种树、锯木头、爬楼梯：数“点”和数“段”总是差一个，看清两头种不种就不会数错。", en: "Planting trees, sawing logs, climbing stairs: counting “points” and counting “gaps” differ by one, and checking the ends tells you which way." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "intervals-fences/"
  },
  {
    slug: "inverse-proportion",
    title: { zh: "反比例函数 · 此消彼长", en: "Inverse Proportion · One Up, One Down" },
    desc: { zh: "长方形面积不变，长越长宽越矮；乘积不变的两个量，图像是一条永远碰不到坐标轴的双曲线。", en: "A rectangle of fixed area gets shorter as it gets longer; two quantities with a constant product graph as a hyperbola that never touches the axes." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "inverse-proportion/"
  },
  {
    slug: "llm-sampling",
    title: { zh: "大语言模型如何逐词生成", en: "How an LLM Writes Word by Word" },
    desc: { zh: "每一步都是一张概率条：温度把它捏尖或摊平，top-k / top-p 砍掉长尾，再随机抽一个词，一个接一个写下去。", en: "Every step is a probability bar chart: temperature sharpens or flattens it, top-k and top-p trim the tail, then one word is drawn at random and appended, again and again." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "llm-sampling/"
  },
  {
    slug: "magnets",
    title: { zh: "磁铁 · 铁屑显出看不见的线", en: "Magnets · Iron Filings Reveal Unseen Lines" },
    desc: { zh: "撒一层铁屑，磁感线自己显形：它们从 N 极出发、回到 S 极，同极相斥、异极相吸。", en: "Sprinkle iron filings and the field lines show themselves: they leave the N pole and return to the S pole; like poles repel, unlike poles attract." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "primary", status: "live", path: "magnets/"
  },
  {
    slug: "mean-median-mode",
    title: { zh: "平均数、中位数、众数之争 · 三个“平均”三个故事", en: "Mean, Median, Mode · Three “Averages”, Three Stories" },
    desc: { zh: "同一组工资，三个“平均”说出三种故事；极端值一进来，只有中位数不慌。", en: "The same list of salaries, three “averages” and three stories; once an extreme value arrives, only the median stays calm." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "junior", status: "live", path: "mean-median-mode/"
  },
  {
    slug: "moon-phases",
    title: { zh: "月相 · 从地球看被照亮的那一半", en: "Moon Phases · The Lit Half, Seen from Earth" },
    desc: { zh: "月亮永远有半边被太阳照亮；我们每晚看到多少，取决于它在轨道上跑到了哪里。", en: "Half the Moon is always lit by the Sun; how much of it we see each night depends on where it is on its orbit." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "primary", status: "live", path: "moon-phases/"
  },
  {
    slug: "overfitting",
    title: { zh: "过拟合", en: "Overfitting" },
    desc: { zh: "用多项式去拟合带噪声的点：曲线越灵活，训练误差越小，可没见过的数据上的误差却会先降后升。看清拐点，再看数据量、换批数据和正则化怎样改变它。", en: "Fit noisy points with a polynomial: the more flexible the curve, the smaller the training error, yet the error on unseen data first falls and then rises. Find the turning point, then see how data size, resampling and regularisation change it." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "overfitting/"
  },
  {
    slug: "pagerank",
    title: { zh: "PageRank · 随机冲浪者最后停在哪", en: "PageRank · Where the Random Surfer Ends Up" },
    desc: { zh: "被链接得最多的网页就最重要吗？用一个随机冲浪者把「重要」变成概率，再用迭代算出来，看阻尼系数和一条新链接怎样改变排名。", en: "Is the most linked-to page the most important? Turn “important” into a probability with a random surfer, compute it by iteration, and see how the damping factor and one new link change the ranking." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "pagerank/"
  },
  {
    slug: "place-value",
    title: { zh: "位值与计数器 · 满十进一", en: "Place Value & the Counting Frame · Ten Makes One" },
    desc: { zh: "同一个数字站在不同的位置，代表的大小差十倍、百倍：计数器上每一列的珠子满十就换成下一列的一颗。", en: "The same digit stands for ten or a hundred times more one place to the left: on a counting frame, ten beads in a column trade for one bead in the next." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "primary", status: "live", path: "place-value/"
  },
  {
    slug: "polygon-angles",
    title: { zh: "多边形内角和 · 撕下来拼一拼", en: "Polygon Angle Sums · Tear and Rearrange" },
    desc: { zh: "三角形的三个角拼在一起是平角 180°；任何多边形都能剖成三角形，内角和就是 (n − 2) × 180°。", en: "A triangle’s three angles fit together into a straight angle of 180°; any polygon can be cut into triangles, so its interior angles add up to (n − 2) × 180°." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "polygon-angles/"
  },
  {
    slug: "probability-frequency",
    title: { zh: "概率与频率 · 转得越多，越贴近概率", en: "Probability & Frequency · The More Spins, the Closer to the Probability" },
    desc: { zh: "一次转盘结果说不准，但转的次数越多，红色出现的频率就越稳定地围着它的概率打转。", en: "One spin cannot be predicted, but with more spins the frequency of red settles ever more steadily around its probability." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "junior", status: "live", path: "probability-frequency/"
  },
  {
    slug: "real-number-line",
    title: { zh: "实数与数轴 · √2 落在哪一点", en: "Real Numbers & the Number Line · Where √2 Lands" },
    desc: { zh: "把单位正方形的对角线转到数轴上，√2 就落在一个确定的点；它不能写成分数，却可以越逼越近。", en: "Swing the diagonal of a unit square onto the number line and √2 lands at one definite point; it cannot be written as a fraction, yet we can close in on it forever." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "real-number-line/"
  },
  {
    slug: "recursion-divide",
    title: { zh: "递归与分治 · 把大问题劈成小问题", en: "Recursion and Divide-and-Conquer · Splitting a Big Problem Into Small Ones" },
    desc: { zh: "从函数调用自己，到汉诺塔、递归树和归并排序：为什么有的递归瞬间完成，有的一辈子也算不完。", en: "From a function calling itself to Towers of Hanoi, recursion trees and merge sort: why some recursions finish instantly and others could not finish in a lifetime." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "recursion-divide/"
  },
  {
    slug: "similarity-scaling",
    title: { zh: "相似与缩放 · 长度、面积、体积各变几倍", en: "Similarity & Scaling · Lengths, Areas and Volumes Each Change Differently" },
    desc: { zh: "投影仪把图像放大 k 倍：边长变 k 倍，面积变 k² 倍，体积变 k³ 倍，而形状和角度不变。", en: "A projector enlarges a picture k times: lengths grow k times, areas k² times, volumes k³ times, while shape and angles stay the same." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "similarity-scaling/"
  },
  {
    slug: "simple-circuits",
    title: { zh: "简单电路 · 电流要走一圈", en: "Simple Circuits · Current Must Go Round" },
    desc: { zh: "电池、开关和灯泡连成一个完整的圈，灯才会亮；断开一处，整圈的电流同时停下。", en: "A battery, a switch and a bulb joined into one complete loop make the bulb light; break it anywhere and the current stops all round at once." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "primary", status: "live", path: "simple-circuits/"
  },
  {
    slug: "simultaneous-equations",
    title: { zh: "二元一次方程组 · 两条直线的交点", en: "Simultaneous Equations · Where Two Lines Meet" },
    desc: { zh: "一个方程有无数个解，再加一个方程就把解“钉”在两条直线的交点上；代入和加减是把它算出来的两种办法。", en: "One equation has endless solutions; a second equation pins the answer to where two lines cross. Substitution and elimination are two ways to calculate it." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "simultaneous-equations/"
  },
  {
    slug: "sound-vibration",
    title: { zh: "声音从振动来 · 米粒会跳的鼓", en: "Sound from Vibration · A Drum with Jumping Rice" },
    desc: { zh: "敲一下鼓，鼓面来回振动，鼓面上的米粒跳起来：声音就是物体的振动通过空气传到耳朵。", en: "Strike a drum and the drumhead vibrates, tossing the rice on it: sound is an object’s vibration carried through the air to your ear." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "primary", status: "live", path: "sound-vibration/"
  },
  {
    slug: "three-views",
    title: { zh: "三视图 · 三张影子拼回立体", en: "Three Views · Three Shadows Rebuild a Solid" },
    desc: { zh: "把积木从正面、侧面、上面各看一眼，得到三张平面图；三张图对齐起来，就能还原出立体的样子。", en: "Look at a stack of blocks from the front, the left and above to get three flat pictures; line them up and you can rebuild the solid." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "three-views/"
  },
  {
    slug: "water-cycle",
    title: { zh: "水的循环 · 一滴水的旅行", en: "The Water Cycle · One Drop’s Journey" },
    desc: { zh: "太阳晒海、水汽上升成云、雨落回山、河流入海：水在海洋、空气和陆地之间不断流动，但总量不变。", en: "The Sun warms the sea, vapour rises into cloud, rain falls on the hills and rivers run to the sea: water moves between ocean, air and land, but the total stays the same." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "primary", status: "live", path: "water-cycle/"
  },
  {
    slug: "wavelets",
    title: { zh: "小波 · 让窗口随频率伸缩", en: "Wavelets · Windows That Stretch With Frequency" },
    desc: { zh: "傅里叶谱说得出「有哪些频率」，说不出「何时」。从加窗口、到让窗口随频率伸缩，再到用最少的数描述突变。", en: "A Fourier spectrum says which frequencies are present, but not when. Add a window, let the window stretch with frequency, then describe sharp changes with very few numbers." },
    tags: [{ zh: "信号与系统", en: "Signals & Systems" }],
    category: "signal", stage: "university", status: "live", path: "wavelets/"
  },
  {
    slug: "hashing",
    title: { zh: "哈希 · 把任意输入压成固定指纹", en: "Hashing · Squeezing Any Input Into a Fixed Fingerprint" },
    desc: { zh: "任意长度的输入变成固定长度的指纹：雪崩效应、哈希表里的冲突、生日悖论，以及指纹到底要多少位才够。", en: "Any-length input becomes a fixed-length fingerprint: the avalanche effect, collisions in hash tables, the birthday paradox, and how many bits a fingerprint really needs." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "hashing/"
  },
  {
    slug: "limits-epsilon",
    title: { zh: "极限与 ε–δ · 你说多近，我就能多近", en: "Limits and ε–δ · Name How Close, and I Can Get That Close" },
    desc: { zh: "把“无限接近”变成一场有规则的博弈：对方先给出 ε（允许的误差），你要找出 δ（x 离 a 多近就够了）。", en: "Turn \"gets arbitrarily close\" into a game with rules: the opponent gives ε (the allowed error) and you must find δ (how close x must be to a)." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "university", status: "live", path: "limits-epsilon/"
  },
  {
    slug: "atmospheric-circulation",
    title: { zh: "大气环流与季风 · 风从哪里来", en: "Atmospheric Circulation & Monsoons · Where Winds Come From" },
    desc: { zh: "赤道多晒、极地少晒，空气因此转圈；地球自转把圈拧成三圈和信风，陆海温差又让风随季节掉头。", en: "The equator gets more sun than the poles, so air turns over in loops; Earth’s spin twists them into three cells and trade winds, and land–sea contrast flips the wind with the season." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "senior", status: "live", path: "atmospheric-circulation/"
  },
  {
    slug: "auctions",
    title: { zh: "拍卖 · 报价与真话", en: "Auctions · Bidding and Telling the Truth" },
    desc: { zh: "同一件东西，四种拍法：为什么第二价格拍卖里说真话最划算，而第一价格拍卖里要“压价”？", en: "One item, four auction rules: why is telling the truth best in a second-price auction, while a first-price auction makes you shade your bid?" },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "senior", status: "live", path: "auctions/"
  },
  {
    slug: "binomial-normal",
    title: { zh: "二项分布到正态 · 钉板上长出的钟形", en: "Binomial to Normal · The Bell Curve Growing on a Pegboard" },
    desc: { zh: "小球在钉板上一层层向左或向右，落点的柱状图随层数增加，越来越像那口钟。", en: "A ball goes left or right at every peg; as the rows increase, the histogram of landing bins looks more and more like the bell." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "senior", status: "live", path: "binomial-normal/"
  },
  {
    slug: "blackbody-radiation",
    title: { zh: "黑体辐射 · 热的物体为什么发光", en: "Blackbody Radiation · Why Hot Things Glow" },
    desc: { zh: "温度越高，颜色从红变白再变蓝；经典理论在紫外一端失败，普朗克的“能量一份一份”把它救了回来。", en: "Hotter things glow from red to white to blue; classical theory fails in the ultraviolet, and Planck’s idea that energy comes in lumps rescues it." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "blackbody-radiation/"
  },
  {
    slug: "carbon-cycle",
    title: { zh: "碳循环 · 大气里的碳去了哪里", en: "The Carbon Cycle · Where the Atmosphere’s Carbon Goes" },
    desc: { zh: "用五个“碳库”的账本，看自然流转为什么平衡、一点点人为排放为什么会累积，又为什么停止排放后降得很慢。", en: "A ledger of five carbon reservoirs shows why natural flows balance, why a small extra emission accumulates, and why the atmosphere falls slowly after emissions stop." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "senior", status: "live", path: "carbon-cycle/"
  },
  {
    slug: "carnot-cycle",
    title: { zh: "卡诺循环 · 热机的效率上限", en: "The Carnot Cycle · The Ceiling on Heat-Engine Efficiency" },
    desc: { zh: "在 p–V 图上走完四步一圈，净功就是围出的面积；效率只由热源和冷源两个温度决定。", en: "Four steps around a p–V loop: the net work is the enclosed area, and the efficiency depends only on the hot and cold temperatures." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "carnot-cycle/"
  },
  {
    slug: "chaos-threebody",
    title: { zh: "混沌与三体 · 初始差一丝，结果天壤", en: "Chaos and the Three-Body Problem · Tiny Differences, Huge Outcomes" },
    desc: { zh: "规则完全确定，结果却无法长期预测：从一个迭代公式，到洛伦兹的蝴蝶，再到三颗星的追逐。", en: "The rules are fully deterministic, yet long-term prediction fails: from a one-line map to Lorenz’s butterfly to three stars chasing each other." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "chaos-threebody/"
  },
  {
    slug: "cnn-feature-maps",
    title: { zh: "卷积神经网络的特征图 · 小窗口怎样“看”图", en: "CNN Feature Maps · How a Small Window “Sees” an Image" },
    desc: { zh: "一个 3×3 的小窗口在图上滑动，边缘、模糊、锐化各是一组数字；把它们堆起来，再让机器自己学出这组数字。", en: "A 3×3 window slides across an image; edges, blur and sharpening are just different sets of nine numbers. Stack them, then let the machine learn the numbers itself." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "cnn-feature-maps/"
  },
  {
    slug: "compound-interest",
    title: { zh: "复利与贴现 · 时间是钱的形状", en: "Compound Interest & Discounting · Time Is the Shape of Money" },
    desc: { zh: "利息也生利息，钱就按倍数生长；反过来，未来的钱折成今天的价值，就是贴现。", en: "When interest earns interest, money grows by multiples; run it backwards and a future amount is worth less today, which is discounting." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "senior", status: "live", path: "compound-interest/"
  },
  {
    slug: "counting-permutations",
    title: { zh: "排列与组合 · 数清楚有多少种", en: "Permutations & Combinations · Counting How Many Ways" },
    desc: { zh: "分步计数画成树，排列与组合只差一句话：顺序算不算数。", en: "Count in steps and draw the tree; permutations and combinations differ by one sentence: does the order matter?" },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "senior", status: "live", path: "counting-permutations/"
  },
  {
    slug: "double-slit",
    title: { zh: "双缝实验 · 一颗一颗的粒子，也走出干涉条纹", en: "The Double-Slit Experiment · Single Particles Still Build Fringes" },
    desc: { zh: "一颗一颗发射电子，条纹自己长出来；一旦知道它走了哪条缝，条纹就消失。", en: "Fire particles one at a time and fringes grow by themselves; the moment you know which slit one took, the fringes vanish." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "double-slit/"
  },
  {
    slug: "expected-value",
    title: { zh: "期望 · 彩票、骰子、保险放在同一台秤上", en: "Expected Value · Lotteries, Dice and Insurance on One Scale" },
    desc: { zh: "期望是长期平均的公平价：用它判断一次下注值不值，也看清为什么买保险明知吃亏还值得。", en: "Expected value is the fair price of a long-run average: use it to judge a bet, and to see why insurance can be worth buying even at a loss on average." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "senior", status: "live", path: "expected-value/"
  },
  {
    slug: "externalities",
    title: { zh: "外部性与公地悲剧 · 账记在谁头上", en: "Externalities & the Tragedy of the Commons · Who Pays the Bill" },
    desc: { zh: "工厂排污的代价落在别人身上，市场就会多生产；庇古税、产权与协商是把这笔账拉回价格里的几种办法。", en: "When a factory’s pollution costs fall on others, the market produces too much; a Pigouvian tax, property rights and bargaining are ways to pull that bill back into the price." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "university", status: "live", path: "externalities/"
  },
  {
    slug: "eye-vision",
    title: { zh: "眼睛与眼镜 · 为什么近视要戴凹透镜", en: "The Eye and Glasses · Why Short-Sightedness Needs a Concave Lens" },
    desc: { zh: "眼睛是一台自带变焦的照相机：晶状体把光聚在视网膜上；聚到视网膜前面就是近视，凹透镜把焦点推回去。", en: "The eye is a camera with a built-in zoom: the lens focuses light on the retina; when focus lands in front of it you are short-sighted and a concave lens pushes it back." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "eye-vision/"
  },
  {
    slug: "gravitational-lensing",
    title: { zh: "引力透镜 · 宇宙里的凸透镜", en: "Gravitational Lensing · A Cosmic Convex Lens" },
    desc: { zh: "大质量天体弯曲时空，路过的光跟着偏折：遥远光源被放大、分成两个像，甚至拉成一个光环。", en: "A massive object bends spacetime and passing light follows: a distant source is magnified, split into two images, even smeared into a ring." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "university", status: "live", path: "gravitational-lensing/"
  },
  {
    slug: "gravity-orbits",
    title: { zh: "万有引力与轨道 · 横着扔出去，会落下、绕圈还是飞走", en: "Gravity and Orbits · Throw It Sideways: Fall, Circle or Escape" },
    desc: { zh: "平方反比的引力加上一点横向速度：轨道从坠落变成椭圆、圆，再到逃逸；开普勒三定律从模拟里自己浮现。", en: "An inverse-square pull plus some sideways speed: the path turns from a crash into an ellipse, a circle, then an escape; Kepler’s three laws emerge from the simulation." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "senior", status: "live", path: "gravity-orbits/"
  },
  {
    slug: "hypothesis-testing",
    title: { zh: "假设检验与 p 值 · 法庭模型判硬币冤不冤", en: "Hypothesis Testing & p-Values · A Courtroom for a Coin" },
    desc: { zh: "先假定硬币公平（无罪推定），再问“如果公平，出现这么极端的结果有多罕见”；显著性水平是愿意冤枉好人的预算。", en: "Presume the coin is fair (innocent until proven guilty), then ask how rare a result this extreme would be if it were; the significance level is the budget for convicting an innocent coin." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "university", status: "live", path: "hypothesis-testing/"
  },
  {
    slug: "markov-chains",
    title: { zh: "马尔可夫链 · 下一步只看现在", en: "Markov Chains · The Next Step Depends Only on Now" },
    desc: { zh: "天气、网页浏览、赌徒的本金：只要“明天只取决于今天”，转移矩阵的幂次里就会浮现一个稳态。", en: "Weather, web browsing, a gambler’s fortune: whenever “tomorrow depends only on today”, a steady state emerges from the powers of the transition matrix." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "university", status: "live", path: "markov-chains/"
  },
  {
    slug: "mechanical-energy",
    title: { zh: "机械能守恒 · 过山车的能量账本", en: "Conservation of Mechanical Energy · The Roller Coaster’s Energy Ledger" },
    desc: { zh: "动能和重力势能此消彼长、总数不变；一旦有摩擦，少掉的机械能变成热，账本照样是平的。", en: "Kinetic and gravitational potential energy trade off while the total stays fixed; add friction and the missing mechanical energy shows up as heat, so the ledger still balances." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "mechanical-energy/"
  },
  {
    slug: "newton-laws",
    title: { zh: "牛顿运动定律 · F = ma 是调出来的", en: "Newton’s Laws of Motion · F = ma, Tuned by Hand" },
    desc: { zh: "在斜面和平地上推箱子：受力箭头与加速度实时对账，F=ma 不是背出来的，是调出来的。", en: "Push a box on ice, on a rough floor and on a ramp: the force arrows and the acceleration stay in step, so F = ma is something you tune, not memorise." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "newton-laws/"
  },
  {
    slug: "newton-method",
    title: { zh: "牛顿法求根 · 沿切线一刀跳向零点", en: "Newton’s Method · Leap to the Root Along a Tangent" },
    desc: { zh: "用切线代替曲线，每一刀都把误差的位数翻倍；失败的几种情形也画给你看。", en: "Replace the curve by its tangent and jump to where the tangent hits zero; each jump roughly doubles the correct digits. The ways it fails are drawn too." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "university", status: "live", path: "newton-method/"
  },
  {
    slug: "ode-phase-portraits",
    title: { zh: "微分方程相图 · 捕食者与猎物的回路", en: "ODE Phase Portraits · Predators and Prey in a Loop" },
    desc: { zh: "兔子与狐狸此消彼长：时间曲线看过程，相平面看全貌，每条轨线是一种命运。", en: "Rabbits and foxes rise and fall together: time curves show the story, the phase plane shows the whole picture, and each trajectory is a fate." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "university", status: "live", path: "ode-phase-portraits/"
  },
  {
    slug: "ohms-law",
    title: { zh: "欧姆定律 · 电流是调出来的", en: "Ohm’s Law · Current You Tune by Hand" },
    desc: { zh: "电压推、电阻挡：I = U/R 不是背的，是在滑杆上一格一格调出来的。", en: "Voltage pushes, resistance holds back: I = V/R isn’t something to memorise but something you tune on a slider." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "ohms-law/"
  },
  {
    slug: "poisson-process",
    title: { zh: "泊松过程 · 随机到达的规律", en: "The Poisson Process · The Pattern in Random Arrivals" },
    desc: { zh: "放射性计数、排队来人：事件随机到达，却有精确的统计规律——间隔是指数分布，窗口里的个数是泊松分布。", en: "Radioactive counts, people joining a queue: arrivals are random yet follow exact statistics — gaps are exponential, counts per window are Poisson." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "university", status: "live", path: "poisson-process/"
  },
  {
    slug: "prisoners-dilemma",
    title: { zh: "囚徒困境与演化博弈 · 合作怎样活下来", en: "The Prisoner’s Dilemma & Evolutionary Games · How Cooperation Survives" },
    desc: { zh: "一次博弈里背叛划算；重复博弈、种群演化里，“以牙还牙”式的合作可以活下来——条件是什么，页面里一格一格调出来。", en: "In a one-shot game, defecting pays; in repeated games and evolving populations tit-for-tat style cooperation can survive — and the page lets you tune the conditions." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "university", status: "live", path: "prisoners-dilemma/"
  },
  {
    slug: "projectile-circular",
    title: { zh: "抛体与圆周 · 一直在掉，但总掉不到地上", en: "Projectiles & Circular Motion · Always Falling, Never Landing" },
    desc: { zh: "把速度劈成水平、竖直两份，各走各的；圆周运动需要不停“拽向圆心”；卫星就是水平速度大到掉下去的曲线总绕着地球转的炮弹。", en: "Split velocity into a horizontal and a vertical part that do not disturb each other; circular motion needs a steady pull toward the centre; a satellite is a cannonball whose fall keeps curving round the Earth." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "senior", status: "live", path: "projectile-circular/"
  },
  {
    slug: "quantum-tunneling",
    title: { zh: "量子隧穿 · 穿墙的是概率，不是子弹", en: "Quantum Tunnelling · What Passes Through the Wall Is a Probability" },
    desc: { zh: "波撞上能量更高的墙：大部分被反弹，一小撮穿了过去——扫描隧道显微镜就靠这一小撮。", en: "A wave hits a wall higher than its energy: most of it bounces back and a small share gets through — and the scanning tunnelling microscope runs on that small share." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "quantum-tunneling/"
  },
  {
    slug: "regression-correlation",
    title: { zh: "回归与相关 · 散点云里拉一条最贴的线", en: "Regression & Correlation · The Best Line Through a Cloud" },
    desc: { zh: "一堆点，一条线，一个数：相关系数 r 说“多贴”，最小二乘线说“怎么贴最好”，还有几个让人上当的陷阱。", en: "A cloud of points, a line and a number: the correlation r says how tightly they follow, the least-squares line says how best to fit them, and a few traps that fool people." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "senior", status: "live", path: "regression-correlation/"
  },
  {
    slug: "relativity",
    title: { zh: "狭义相对论 · 同时性的线倾斜了", en: "Special Relativity · The Lines of “Now” Tilt" },
    desc: { zh: "光速对谁都一样，于是时间会变慢、长度会缩短、“同时”变得因人而异——时空图把这些画给你看。", en: "The speed of light is the same for everyone, so clocks run slow, lengths shrink and “at the same time” depends on who is looking — a spacetime diagram draws it all." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "university", status: "live", path: "relativity/"
  },
  {
    slug: "risk-pooling",
    title: { zh: "风险池化与保险 · 一万人各摊一点", en: "Risk Pooling & Insurance · Ten Thousand People Each Chip In" },
    desc: { zh: "个人遇到的是 0 或 10000 元的赌局；一万人合在一起，却变成一笔几乎可以预先算好的账——大数定律的商业形态，以及它失灵的地方。", en: "One person faces a gamble of $0 or $10,000; ten thousand together face an account that can be worked out ahead of time — the law of large numbers as a business, and where it fails." },
    tags: [{ zh: "概率与统计", en: "Probability & Statistics" }],
    category: "probability", stage: "university", status: "live", path: "risk-pooling/"
  },
  {
    slug: "rsa-encryption",
    title: { zh: "RSA 公钥加密 · 乘起来容易，拆开来难", en: "RSA Public-Key Encryption · Easy to Multiply, Hard to Split" },
    desc: { zh: "把两个大质数相乘只要一步，从乘积倒推两个质数却要天文数字的步数——这种不对称，让“公开的锁、私藏的钥匙”成为可能。", en: "Multiplying two big primes takes one step; recovering them from the product takes an astronomical number — and that asymmetry makes a public lock and a private key possible." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "rsa-encryption/"
  },
  {
    slug: "seismic-waves",
    title: { zh: "地震波探地心 · 地核是被波“照”出来的", en: "Seismic Waves · The Core Was “Lit Up” by Waves" },
    desc: { zh: "地震发出的 P 波和 S 波一前一后到达；它们在地球里拐弯、被挡住的方式，让人从没去过的地核有了名字、大小和状态。", en: "An earthquake sends out P and S waves that arrive one after the other; how they bend and get blocked inside the Earth gave the core — which nobody has visited — a size, a name and a state." },
    tags: [{ zh: "地球与太空", en: "Earth & Space" }],
    category: "earth", stage: "senior", status: "live", path: "seismic-waves/"
  },
  {
    slug: "sequences-series",
    title: { zh: "数列与求和 · 叠砖与棋盘麦粒", en: "Sequences & Series · Stacked Bricks and Chessboard Grains" },
    desc: { zh: "叠砖每层多一块是等差，棋盘麦粒每格翻倍是等比；倒序相加当场拼出求和公式，等比求和则告诉你“无限多项”能不能有尽头。", en: "Bricks with one more per layer are arithmetic, grains that double per square are geometric; add a row backwards to build the sum formula on the spot, and see whether infinitely many terms can add up." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "senior", status: "live", path: "sequences-series/"
  },
  {
    slug: "series-parallel",
    title: { zh: "串联与并联 · 电流的分与合", en: "Series & Parallel · Splitting and Merging Current" },
    desc: { zh: "一条河上两个水闸首尾相接是串联，河水分成两条支流再汇合是并联——电流和电压分别怎样分？粒子流速画出来。", en: "Two sluice gates on one river end to end are in series; a river that splits into two branches and rejoins is in parallel — how do current and voltage divide? The flowing dots show it." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "series-parallel/"
  },
  {
    slug: "shortest-path",
    title: { zh: "最短路 · 从起点像洪水一样漫开", en: "Shortest Path · Flooding Out From the Start" },
    desc: { zh: "迪杰斯特拉算法每次“确认”离起点最近的那个点：最短路径是被“漫到”的顺序逼出来的；也看它怎样在带权地图上绕开泥地，以及什么时候会出错。", en: "Dijkstra’s algorithm “settles” the nearest node at a time: the shortest paths are forced out by the order in which the flood reaches things; see how it detours around mud on a weighted map and when it breaks." },
    tags: [{ zh: "计算与智能", en: "Computing & AI" }],
    category: "computing", stage: "university", status: "live", path: "shortest-path/"
  },
  {
    slug: "solid-geometry",
    title: { zh: "立体几何 · 转一转，再切一刀", en: "Solid Geometry · Turn It, Then Cut It" },
    desc: { zh: "把立方体转到不同角度看，用平面一刀切下去，截面从三角形变成六边形；体积与表面积怎样随尺寸变化，展开图又能不能折回立方体。", en: "View a cube from different angles, then slice it with a plane and watch the cross-section go from triangle to hexagon; see how surface area and volume scale and whether a net folds back into a cube." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "junior", status: "live", path: "solid-geometry/"
  },
  {
    slug: "sound-waves",
    title: { zh: "声音是波 · 看见自己的声音", en: "Sound Is a Wave · Seeing Your Own Voice" },
    desc: { zh: "声音是空气一疏一密的传播：音调管波形的疏密，响度管振幅，音色管波形的形状；速度、波长、频率用 v = fλ 连在一起。本页不播放声音，只画波。", en: "Sound is a pattern of squeezing and loosening carried through air: frequency sets how close the pattern is, amplitude the loudness, and the wave’s shape the timbre; v = fλ ties speed, wavelength and frequency together. This page plays no sound, it only draws the waves." },
    tags: [{ zh: "物理与电路", en: "Physics & Circuits" }],
    category: "physics", stage: "junior", status: "live", path: "sound-waves/"
  },
  {
    slug: "taylor-series",
    title: { zh: "泰勒级数 · 把曲线一项项贴上去", en: "Taylor Series · Patch the Curve Term by Term" },
    desc: { zh: "多项式一项项加上去，曲线在一点附近被逐段贴合到重合；这是“局部”的逼近，与傅里叶“整体”的逼近恰成对照。", en: "Add a polynomial term by term and the curve gets matched ever farther around one point; this is a “local” approximation, the counterpart of Fourier’s “global” one." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "university", status: "live", path: "taylor-series/"
  },
  {
    slug: "vectors",
    title: { zh: "向量 · 有方向的量", en: "Vectors · Quantities With a Direction" },
    desc: { zh: "力的合成是箭头首尾相接，坐标里加法就是分量各自相加；点积让两个箭头“投影”出一个数。", en: "Combining forces is joining arrows head to tail; in coordinates, addition just adds the components; the dot product turns two arrows’ “projection” into a number." },
    tags: [{ zh: "数学基础", en: "Mathematical Foundations" }],
    category: "math", stage: "senior", status: "live", path: "vectors/"
  }

];
