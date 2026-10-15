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
 *   status   "live" = 已上线（可点击） | "planned" = 筹备中（灰卡不可点）
 *   path     相对路径（live 时必填）
 * ============================================================ */

/* 分类注册表：数组顺序即索引页筛选 chips 的展示顺序。
 * 新增分类先在此注册（id + 双语名），条目的 category 引用 id。 */
window.KNOWLEDGE_CATEGORIES = [
  { id: "signal",      name: { zh: "信号与系统", en: "Signals & Systems" } },
  { id: "probability", name: { zh: "概率与统计", en: "Probability & Statistics" } },
  { id: "computing",   name: { zh: "计算与智能", en: "Computing & AI" } },
  { id: "math",        name: { zh: "数学基础",   en: "Mathematical Foundations" } }
];

window.KNOWLEDGE_PAGES = [
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
    status: "live",
    path: "entropy/"
  }
];
