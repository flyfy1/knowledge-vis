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
  }
];
