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
  }
];
