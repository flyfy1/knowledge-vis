'use strict';
/* ============================================================
   复数 · 乘 i 就是转 90° — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    s4rounding: "符号恒等式是精确的；下方显示的分量和模最多保留 2 位小数、角度最多 1 位。请勿用舍入后的操作数回算精确等式。",
    editTask4: "试着用坐标把两数都设为 1+i：先预测乘积的模与辐角，再应用，对照图与下方读数。",
    editFirst: "z₁ · 第一个数",
    editSecond: "z₂ · 第二个数",
    editStepRange: "这个数值无法用 0.1 步长可靠调整；请输入较小的坐标，或直接应用有限坐标。",
    editTitle: "坐标输入 · 键盘或数值",
    editTarget: "目标复数",
    editReal: "实部 Re",
    editImag: "虚部 Im（不含 i）",
    editApply: "应用坐标",
    editHelp: "输入有限坐标；Tab 切换控件，↑/↓ 只把当前草稿增减 0.1，Enter 或应用才更新图。与拖动相同：先吸附到 0.1 网格，再按下面的绘图范围限制。下方读数给出实际应用值。",
    editRange1: "绘图范围：实部、虚部分别限制到 −5…5。这是图的范围，不是复数的数学范围。",
    editRange2: "绘图范围：每个输入复数的两分量分别限制到 −4.2…4.2；和仍由两数实算。此范围只为绘图。",
    editRange4: "绘图范围：每个输入复数的模最多 2.6。吸附后超出圆盘时，按比例缩到圆周且不改方向；最终分量可能不在 0.1 网格上。此范围只为绘图。",
    editFinite: "请把两个坐标都填为有限数字；空值或未写完的数字不会更新原图。",
    editRange: "坐标太大，超出本页数值计算范围；请用较小的有限坐标。原图未改变。",
    editApplied: "已更新 {target} = {z}；原图和下方读数已同步。",
    editAdjusted: "已按吸附与绘图范围应用 {target} = {z}；输入框已同步实际坐标。",
    editUnchanged: "{target} 坐标未改变，保留当前精确值。",
    docTitle: '复数 · 乘 i 就是转 90° —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '复数 · 乘法是旋转加伸缩',
    tagline: '课本里 i 是空降的：「规定 i² = −1」，背下来、会算、但不知道它是什么。这一页换个讲法：先把数从一条线请回一张平面——复数（形如 a + bi 的数，a、b 都是实数）就是平面上的一个点、一根箭头；加法是把箭头平移，乘法是把箭头旋转加伸缩。于是 i² = −1 不必背：乘 i 就是转 90°，转两次正好掉头指向 −1。这一页所有的模、辐角、和、积，都只由 (a, b) 当场实算，图和读数同源。',
    nav0: '0 数轴不够用', nav1: '1 点与箭头', nav2: '2 加法是平移', nav3: '3 乘 i 转 90°',
    nav4: '4 乘法对账台', nav5: '5 自测', nav6: '6 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 复数 Complex Numbers —— 一步一交互系列',

    /* ---------- 第 0 步：数轴不够用 ---------- */
    s0k: '第 0 步 · 数轴不够用',
    s0t: '数轴不够用：x² = −1 的解站在哪里？',
    s0e: '这一步要回答：<strong>方程 x² = −1 的解，到底站在哪里？</strong>你已经知道：实数全排在一条数轴上，而任何实数的平方都 ≥ 0——正数平方是正数，负数平方也是正数，0 的平方是 0。下面这台探针让你亲手验：拖着 x 沿数轴走，上方描出的轨迹是 x² 的全部取值，它贴着数轴上方走，却永远够不到 −1 那条横线。找不到不是因为没找仔细——是这条线上根本没有它的位置。',
    s0xLab: '平方探针 x（沿数轴拖）',
    s0open: '把数轴竖起来当一条边：展开平面 ⤢',
    s0close: '收起平面 ↩',
    s0ro: '探针 x = {x}：x² = <b>{sq}</b> ≥ 0。把 x 从负拖到正，平方一路描出一条抛物线，最低点就是 0——离 −1 还差着整整一条「够不到」的距离。',
    s0roB: '平面展开了：横着的还是原来那条<strong>实轴</strong>，新竖起来的这条叫<strong>虚轴</strong>，两条轴张成的平面叫<strong>复平面</strong>。原点正上方一个单位的那个点，就是待认领的候选：本页接下来把它认作 i，并一步步验明——它的平方真的是 −1（第 3 步见分晓）。',
    s0conc: '结论：x² = −1 在实数里无解，缺的不是某个数、是一个<strong>维度</strong>。给数轴加一条垂直的轴，数就从「线上的点」升级为「平面上的点」；新轴上的单位记作 <strong>i</strong>。这一步先只承诺一件事：i² = −1 在本页会变成看得见的事实，不靠背。',
    s0hint: '为什么非得加一整条轴，而不是只添一个点？因为数要能运算：添进来的点和原来的实数相加、相乘，结果还得有地方站——一张平面才装得下这一整套新数。下一站先把「平面上的点」这套读法认全。',
    cSq: 'y = x² 的轨迹',
    cNeg: '−1：平方永远够不到',
    cClaim: '？待认领的点',
    cAxisX: '数轴（实数）',
    cRe: '实轴 Re',
    cIm: '虚轴 Im',

    /* ---------- 第 1 步：复数是平面上的点 ---------- */
    s1k: '第 1 步 · 复平面上的点',
    s1t: '复数是平面上的点：钉住它要么 (a, b)，要么（模，辐角）',
    s1e: '这一步要回答：<strong>一个复数，要几个数才能钉住？</strong>图上是一个复平面：横轴是实轴、纵轴是虚轴。拖动点 z，读数四栏全部由它的坐标 (a, b) 当场实算：a 叫<strong>实部</strong>、b 叫<strong>虚部</strong>（注意：虚部是 b 这个实数本身，不带 i），写法记作 z = a + bi；从原点向 z 拉出的箭头，长度叫<strong>模</strong> |z|——就是勾股定理里那根斜边；箭头与实轴正半轴的夹角（逆时针量）叫<strong>辐角</strong> θ。辐角有很多个等价写法，本页统一取<strong>辐角主值</strong>：归到 (−180°, 180°] 里的那一个。',
    s1preLab: '预设点巡演：',
    s1pA: '3 + 4i',
    s1pB: '−4（纯实数）',
    s1pC: '3i（纯虚数）',
    s1pD: '单位圆上 · 50°',
    s1ro: "z ≈ <b>{z}</b>：实部 a ≈ <span>{a}</span>，虚部 b ≈ <span>{b}</span>；模 |z| = √(a² + b²) ≈ <b>{m}</b>（斜边由勾股实算）；辐角 θ ≈ <b>{ang}</b>（从实轴正半轴逆时针量）。数字由未舍入坐标计算后显示为近似值。",
    s1roOrigin: 'z = <b>0</b>：实部 a = 0，虚部 b = 0；模 |z| = <b>0</b>；辐角 <b>—（原点没有辐角）</b>——箭头缩成一个点，没有方向可量。任何页面位置只要模为 0，都按这个口径读。',
    s1conc: '结论：钉住一个点有两套办法——坐标 (a, b)，或者（模，辐角）。它们是<strong>同一根箭头的两种读法</strong>：前者说「向右走几、向上走几」，后者说「多长、朝哪个方向」。下一步加法用第一套读法最顺，乘法则要靠第二套——先都认熟。',
    s1hint: '边界逐个验：把点拖到负实轴上，辐角读作 +180° 而不是 −180°——主值区间的右端是闭的。拖到单位圆上（虚线圈）时模恒为 1，只剩角度在变；这时箭头尖的坐标正是 (cos θ, sin θ)，这个读法的出处在<a href="../trig/#step1">三角函数页第 1 步</a>。',
    cUnit: '单位圆',

    /* ---------- 第 2 步：加法 = 平移 ---------- */
    s2k: '第 2 步 · 加法',
    s2t: '加法 = 平移：和的坐标就是两边坐标各自相加',
    s2e: '这一步要回答：<strong>两个复数相加，图上到底动了什么？</strong>图上有两根可拖的箭头 z₁、z₂，第三根绿箭头是它们的和 z₁ + z₂，用<strong>平行四边形法则</strong>画出（以 z₁、z₂ 为邻边张成平行四边形，对角线就是和；等价地看，z₂ 的箭头首尾相接到 z₁ 的尖端，落点相同）。拖任意一根，下面三栏对账会逐栏核对：和的实部、虚部是不是恰好两边各自相加。',
    s2roSum: 'z₁ = <span>{z1}</span>，z₂ = <span>{z2}</span>，z₁ + z₂ = <b>{sum}</b>',
    s2roRe: '实部对账：{a1} + {a2} = <b>{s}</b> ✓（正是和的实部）',
    s2roIm: '虚部对账：{b1} + {b2} = <b>{s}</b> ✓（正是和的虚部）',
    s2conc: '结论：加 z₂，就是把整幅图沿 z₂ 这根箭头<strong>平移</strong>那么远；和的横、纵坐标恰是两边各自相加。这与向量加法是同一件事——复数加法 = 分量相加 = 平移，只对加法成立。',
    s2hint: '先埋一个反差：乘法<strong>不是</strong>分量相乘。(1 + i) × (1 + i) 若按分量乘会得 1 + 1i 之类怪东西，真实答案第 4 步在对账台上见——乘法动的是模和角，不是分量。',

    /* ---------- 第 3 步：乘 i：转 90° ---------- */
    s3k: '第 3 步 · 乘 i',
    s3t: '乘 i：什么都不改，只转 90°',
    s3e: '这一步要回答：<strong>i 自己到底「是」什么？</strong>选一个起点，按「× i」按钮连着按：每按一次，箭头就逆时针转 90°——盯住读数：模纹丝不动，辐角每次恰好 +90°（超过 180° 就按主值归回来）。落点和弧线全程留痕，连按四次，箭头回到原来的方向。下面还有一条单位点巡演：1 → i → −1 → −i → 1，落点逐个钉在坐标轴上。',
    s3startLab: '起点 z：',
    s3p1: '1（单位点）',
    s3p2: '3 + 2i',
    s3mul: '× i（转 90°）',
    s3reset: '重置 ↺',
    s3prog: '已乘 i {k} 次（每 4 次回到原方向）',
    s3ro: '当前 z = <b>{z}</b>：模 = <b>{m}</b>（乘 i 前后一模一样）；辐角 = <b>{ang}</b>。',
    s3back: '转满一圈了：四次 90° 正好 360°，箭头回到起点方向——i 的幂以 4 为周期。',
    s3pow: '单位点巡演（全部由连乘实算）：i¹ = <b>{p1}</b>，i² = <b>{p2}</b>，i³ = <b>{p3}</b>，i⁴ = <b>{p4}</b>。看 i² 落在哪：从 1 出发转两次 90° 就是掉头 180°，落在 −1 上。',
    s3conc: '收口：<strong>×i = 逆时针旋转 90°</strong>，所以 i² = 转两次 = 掉头 = −1。<strong>i² = −1 是转出来的，不是背出来的。</strong>「i 是 √−1 的记号」和「i 是转 90° 的动作」是同一个 i 的两副面孔：前者是它的名字，后者是它的行为。',
    s3hint: '换起点 3 + 2i 再连按四次：四个落点不在坐标轴上，但模始终是 √13、辐角每次 +90°、第四次严丝合缝回到 (3, 2)——周期 4 对任何起点都成立，因为转四次就是转一整圈。',

    /* ---------- 第 4 步：一般乘法对账台 ---------- */
    s4k: '第 4 步 · 一般乘法',
    s4t: '一般乘法 = 模相乘、角相加：对账台',
    s4e: '这一步要回答：<strong>乘上任意一个复数，模和角各发生什么？</strong>先把两件事分开验明：乘一个正实数（如下方预设 2）只伸缩不转；乘一个模为 1 的数只转不伸缩。任意乘数 z₂ 则是两件事叠加。拖动 z₁（被乘）与 z₂（乘数），绿箭头是乘积 z₁·z₂；下面对账台三组读数全部实算：模对账、角对账、还有一条代数路 (a₁a₂ − b₁b₂, a₁b₂ + b₁a₂)——两条路同源互证。',
    s4z2Lab: '把乘数 z₂ 换成预设：',
    s4pA: '2（纯实数 · 只伸缩）',
    s4pB: '模 1 · 60°（只旋转）',
    s4pC: '1 + i（转 45° 又放大 √2 倍）',
    s4roProd: 'z₁ ≈ <span>{z1}</span>，z₂ ≈ <span>{z2}</span> ⟹ z₁·z₂ ≈ <b>{prod}</b>',
    s4roMod: "模恒等式：|z₁z₂| = |z₁| × |z₂|。显示两因子模：|z₁| ≈ {a}，|z₂| ≈ {b}；用未舍入值相乘后显示 |z₁|·|z₂| ≈ <b>{p}</b>，直接求乘积模得 |z₁z₂| ≈ <b>{q}</b>。",
    s4roArg: "角对账：显示 θ₁ ≈ {a}，θ₂ ≈ {b}；未舍入角相加并归到主值区间后 ≈ <b>{s}</b>，直接算乘积辐角 ≈ <b>{t}</b>。",
    s4roArgOrigin: '角对账：有一边是原点（模 0、没有辐角），这一行只核模、不核角。',
    s4roAlg: "代数恒等式：(a₁a₂ − b₁b₂, a₁b₂ + b₁a₂)。显示坐标：a₁ ≈ {a1}，b₁ ≈ {b1}，a₂ ≈ {a2}，b₂ ≈ {b2}；用未舍入坐标算乘积 ≈ <b>{alg}</b>，图也使用同一结果。",
    s4conc: '结论：<strong>乘法法则——模相乘、角相加</strong>。乘上谁，就按谁的模伸缩、按谁的辐角旋转。条件写明：角度相加后必须按主值区间归一化（340° 与 −20° 是同一个方向，本页统一写 −20°）；乘数或被乘数是 0 时，乘积是原点、无辐角可言。',
    s4hint: '本演台把两个点限制在模 ≤ 2.6 的圆盘内，免得乘积跑出图外——法则本身对任意大小的复数都成立。先用预设 1 + i 验一组：z₁ = 2 + i 时乘积辐角应比原来恰好多 45°、模恰好多乘 √2，对账台会当场打勾。',

    /* ---------- 第 5 步：自测 ---------- */
    s5k: '第 5 步 · 自测',
    s5t: '自测：转得对不对，当场验',
    s5e: '三道题的判定都由与正文同源的实算给出：落点由连乘算、模由勾股算，不预设答案表。答对一题锁定一题（答题后去拖正文的点，不会冲掉这里的判定）；答错会按你的错法给出诊断，可以再试。',
    q1t: '题 1 · 连乘两次 i',
    q1d: 'z = 3 + 2i，连乘两次 i（即 z·i²），落在哪里？先在心里转：一次 90°、再一次 90°。',
    q1ok: '✓ 对了：连乘两次 i 就是转 180° 掉头，(3, 2) 落到 <b>{z}</b>。顺带说，这正是 z·i² = −z 的几何样子。',
    q1noA: '✗ (−3, 2) 只是把实部单独变了号，不是任何一次 90° 旋转的落点：转一次是 (a, b) → (−b, a)，落到 (−2, 3)，两个分量换了位；连转两次是掉头 180°，(3, 2) 的两个分量要一起变号。',
    q1noB: '✗ (3, −2) 只是把虚部单独变了号（沿实轴翻了个镜像），也不是转反方向的落点：顺时针转一次落到 (2, −3)，转两次与逆时针两次相同、仍是 (−3, −2)。×i 是<strong>逆时针</strong>转 90°：两个分量换位、新实部变号。',
    q1noC: '✗ 这是起点本身：乘 i 两次不是原地不动，而是掉头 180°——坐标两个分量都要变号。',
    q2t: '题 2 · 谁的模大',
    q2d: '|3 + 4i| 与 |−4 + 3i|，哪个大？别急着选——两个模都由勾股实算，算完再比。',
    q2oA: '3 + 4i 更大',
    q2oB: '−4 + 3i 更大',
    q2oC: '一样大',
    q2ok: '✓ 对：|3 + 4i| = <b>{a}</b>，|−4 + 3i| = <b>{b}</b>，相等。两个点方向不同、离原点的距离却一样——模只看长度，不看方向。',
    q2no: '✗ 再算一遍：|3 + 4i| = √（3² + 4²） = <b>{a}</b>；|−4 + 3i| = √（(−4)² + 3²） = <b>{b}</b>。负号在平方里会消失——模只看长度，不看方向。',
    q3t: '题 3 · 判断',
    q3d: '判断这句话：「乘积的模，等于两个模之和。」',
    q3true: '对', q3false: '错',
    q3ok: '✓ 判断正确，这句话是<b>错的</b>：拿一组现成的数当场验——取 z₁ = z₂ = 1 + i，|z₁|·|z₂| = <b>{prod}</b>，正好等于 |(1 + i)²| = |2i| = <b>{val}</b>；若按「模之和」会算出 <b>{sum}</b>，对不上。乘积的模是两模之<strong>积</strong>，不是之和。你也可以回第 4 步自己再拖一组验。',
    q3no: '✗ 这句话其实是错的。拿一组数当场验：z₁ = z₂ = 1 + i 时乘积的模是 <b>{val}</b>；两模之积是 <b>{prod}</b>、两模之和是 <b>{sum}</b>——乘积的模跟哪个相等？回第 4 步对账台拖一组也能自证。',
    s5hint: '三题收口：① 连乘两次 i = 掉头，落点两个分量都变号；② 模只认长度：(3, 4) 与 (−4, 3) 是同一组勾股数换了位置与符号，模都是 5；③ 模相乘、角相加——「和」只出现在角那一边，模这边永远是乘。',

    /* ---------- 第 6 步：终章 ---------- */
    s6k: '第 6 步 · 终章',
    s6t: '终章：一张平面，两种运算',
    s6e: '复数不是一条要背的法则，是把数放回平面之后自然长出来的运算。收口三张卡：',
    c1h: '复数是平面上的点',
    c1: 'z = a + bi 与平面上的点、与从原点出发的箭头一一对应。钉住它有两种读法：坐标 (a, b)，或（模，辐角）——模是箭头的长度，辐角是它的方向（本页取主值 (−180°, 180°]）。',
    c2h: '加法是平移',
    c2: '和的坐标 = 两边坐标各自相加，图上就是沿着加数的箭头平移一次——平行四边形的对角线。加法只动位置，不动方向和长度的读法。',
    c3h: '乘法是旋转 + 伸缩',
    c3: '模相乘、角相加：乘上谁，就按谁的模伸缩、按谁的辐角旋转。乘 i 是其中最纯粹的一例——模 1、角 90°，只转不伸缩；i² = −1 就是「转两次正好掉头」。',
    s6fin: '两个方向先各留一句话：<strong>除法</strong>是乘法的逆——角相减、模相除，本页不展开。再往前一步埋一条线：如果这个点自己转起来、角度随时间均匀长大，它的位置就是 e<sup>iθ</sup> 在单位圆上跑——那是<strong>欧拉公式</strong>的入口，本页只点名。',
    s6lkTrig: '辐角 θ 的那个点转起来、把身高摊开，就是正弦波——去三角函数页看它动起来 →',
    s6lkEigen: "去特征值页选择“旋转缩放：复 λ”预设：这一例没有实特征方向，特征值是一对非实复数；看看旋转与缩放怎样在矩阵中结合 →",
    s6lkFourier: '相位就是起始角：傅里叶页每个圆的起始位置，正是本页辐角的用处——去傅里叶页看 →',
  },
  en: {
    s4rounding: "The symbolic identities are exact. Displayed components and moduli use up to2 decimal places; angles use up to1. Do not treat rounded operands as exact when recomputing.",
    editTask4: "Try setting both numbers to1+i using coordinates. Predict the product’s modulus and angle, then apply and compare the plot with the readouts.",
    editFirst: "z₁ · first number",
    editSecond: "z₂ · second number",
    editStepRange: "A0.1 step cannot reliably adjust this value. Enter smaller coordinates, or apply finite coordinates directly.",
    editTitle: "Coordinate entry · keyboard or numbers",
    editTarget: "Complex number to edit",
    editReal: "Real part Re",
    editImag: "Imaginary part Im (without i)",
    editApply: "Apply coordinates",
    editHelp: "Enter finite coordinates. Tab moves between controls; ↑/↓ changes only the draft by0.1. Enter or Apply updates the plot. As with dragging, coordinates snap to a0.1 grid before the drawing limit below is applied. The readouts show the actual applied values.",
    editRange1: "Drawing range: each component is clipped to−5…5. This limits the drawing, not complex numbers themselves.",
    editRange2: "Drawing range: each input component is clipped to−4.2…4.2; their sum is still calculated from the two numbers. This is a drawing limit only.",
    editRange4: "Drawing range: each input number has modulus at most2.6. After snapping, a point outside the disk is scaled toward the origin to the boundary without changing its angle; the resulting components need not remain on the0.1 grid. This is a drawing limit only.",
    editFinite: "Enter a finite number in both fields. Empty or incomplete numbers do not change the plot.",
    editRange: "These coordinates exceed this page’s numerical calculation range. Use smaller finite coordinates. The plot is unchanged.",
    editApplied: "Updated {target} = {z}; the existing plot and readouts now agree.",
    editAdjusted: "Applied snapping and drawing limits: {target} = {z}. The fields now show the actual coordinates.",
    editUnchanged: "{target} is unchanged; its current exact coordinates are preserved.",
    docTitle: 'Complex Numbers · Multiplying by i Is a 90° Turn — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Complex Numbers · Multiplication Is Rotation Plus Scaling',
    tagline: 'In the textbook, i drops out of the sky: “define i² = −1”. You memorise it, you can compute with it, but you never learn what it is. This page tells it differently: first bring numbers back from a line onto a plane — a complex number (a number of the form a + bi, with a and b real) is a point on the plane, an arrow; addition slides the arrow, multiplication rotates and scales it. Then i² = −1 needs no memorising: multiplying by i is a 90° turn, and two turns point you exactly at −1. Every modulus, argument, sum and product on this page is computed on the spot from (a, b) alone — picture and readout share one source.',
    nav0: '0 The Line Is Not Enough', nav1: '1 Points & Arrows', nav2: '2 Addition Slides', nav3: '3 ×i Turns 90°',
    nav4: '4 Multiplication Bench', nav5: '5 Self-Test', nav6: '6 Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Complex Numbers —— one interaction at a time',

    s0k: 'Step 0 · The Number Line Is Not Enough',
    s0t: 'The Number Line Is Not Enough: Where Does the Solution of x² = −1 Stand?',
    s0e: 'This step answers one question: <strong>the solution of x² = −1 — where does it stand?</strong> You already know: the real numbers fill a single line, and every real square is ≥ 0 — positive squared is positive, negative squared is positive, 0 squared is 0. The probe below lets you check by hand: drag x along the line and the trace above draws every value x² can take; it hugs the region above the line yet never reaches the −1 line. It is not hiding — there is simply no room for it on this line.',
    s0xLab: 'Square probe x (drag along the line)',
    s0open: 'Stand the line up as one edge: unfold the plane ⤢',
    s0close: 'Fold the plane away ↩',
    s0ro: 'Probe x = {x}: x² = <b>{sq}</b> ≥ 0. Drag x from negative to positive and the square traces a parabola whose lowest point is 0 — a whole unreachable gap away from −1.',
    s0roB: 'The plane is unfolded: the horizontal axis is still the original <strong>real axis</strong>; the newly raised one is the <strong>imaginary axis</strong>, and together they span the <strong>complex plane</strong>. The point one unit above the origin is the candidate to be claimed: this page now adopts it as i, and verifies step by step that its square really is −1 (the reveal is in Step 3).',
    s0conc: 'Conclusion: x² = −1 has no real solution — what is missing is not a number but a <strong>dimension</strong>. Add a perpendicular axis to the line and numbers graduate from “points on a line” to “points on a plane”; the unit on the new axis is written <strong>i</strong>. For now just one promise: on this page i² = −1 becomes something you can see, not something you memorise.',
    s0hint: 'Why a whole new axis, and not just one extra point? Because numbers must stay computable: the new point added to, and multiplied by, the old reals must have somewhere to land — only a whole plane holds the entire new number system. Next stop: learn to read “a point on the plane” fluently.',
    cSq: 'the trace of y = x²',
    cNeg: '−1: squares never reach it',
    cClaim: '? the point to be claimed',
    cAxisX: 'number line (reals)',
    cRe: 'real axis Re',
    cIm: 'imag axis Im',

    s1k: 'Step 1 · A Point on the Complex Plane',
    s1t: 'A Complex Number Is a Point: Pin It by (a, b), or by (Modulus, Argument)',
    s1e: 'This step answers: <strong>how many numbers does it take to pin down one complex number?</strong> The picture is a complex plane: horizontal real axis, vertical imaginary axis. Drag the point z and all four readouts are computed live from its coordinates (a, b): a is the <strong>real part</strong>, b is the <strong>imaginary part</strong> (mind this: the imaginary part is the real number b itself, without the i), written z = a + bi; the arrow from the origin to z has length called the <strong>modulus</strong> |z| — the hypotenuse of Pythagoras’ theorem; the angle from the positive real axis, measured counter-clockwise, is the <strong>argument</strong> θ. Arguments have many equivalent writings; this page always uses the <strong>principal value</strong>: the one normalised into (−180°, 180°].',
    s1preLab: 'Preset tour:',
    s1pA: '3 + 4i',
    s1pB: '−4 (pure real)',
    s1pC: '3i (pure imaginary)',
    s1pD: 'On the unit circle · 50°',
    s1ro: "z ≈ <b>{z}</b>: real part a ≈ <span>{a}</span>, imaginary part b ≈ <span>{b}</span>; modulus |z| = √(a² + b²) ≈ <b>{m}</b> (computed by Pythagoras); argument θ ≈ <b>{ang}</b> (counter-clockwise from the positive real axis). Displayed numbers are rounded after calculation from unrounded coordinates.",
    s1roOrigin: 'z = <b>0</b>: real part a = 0, imaginary part b = 0; modulus |z| = <b>0</b>; argument <b>— (the origin has no argument)</b> — the arrow has shrunk to a point and there is no direction to measure. Anywhere on this page, a point of modulus 0 is read this way.',
    s1conc: 'Conclusion: there are two ways to pin the point — coordinates (a, b), or (modulus, argument). They are <strong>two readings of the same arrow</strong>: one says “how far right, how far up”, the other says “how long, pointing which way”. Addition next door reads most naturally in the first; multiplication will need the second — get fluent in both.',
    s1hint: 'Check the boundaries one by one: drag the point onto the negative real axis and the argument reads +180°, not −180° — the right end of the principal interval is closed. On the unit circle (the dashed ring) the modulus stays 1 and only the angle moves; there the arrow tip’s coordinates are exactly (cos θ, sin θ) — that reading is established in <a href="../trig/#step1">Step 1 of the trigonometry page</a>.',
    cUnit: 'unit circle',

    s2k: 'Step 2 · Addition',
    s2t: 'Addition = Sliding: the Sum’s Coordinates Are the Two Sides Added Separately',
    s2e: 'This step answers: <strong>when two complex numbers are added, what actually moves in the picture?</strong> Two draggable arrows z₁ and z₂ are on stage; the green arrow is their sum z₁ + z₂, drawn by the <strong>parallelogram rule</strong> (span a parallelogram with z₁, z₂ as adjacent sides and the diagonal is the sum; equivalently, attach z₂’s arrow head-to-tail at z₁’s tip — same landing point). Drag either arrow and the three check rows below verify, row by row, that the sum’s real and imaginary parts are exactly the two sides added separately.',
    s2roSum: 'z₁ = <span>{z1}</span>, z₂ = <span>{z2}</span>, z₁ + z₂ = <b>{sum}</b>',
    s2roRe: 'Real-part check: {a1} + {a2} = <b>{s}</b> ✓ (exactly the sum’s real part)',
    s2roIm: 'Imaginary-part check: {b1} + {b2} = <b>{s}</b> ✓ (exactly the sum’s imaginary part)',
    s2conc: 'Conclusion: adding z₂ <strong>slides</strong> the whole picture along z₂’s arrow by exactly that much; the sum’s horizontal and vertical coordinates are the two sides added separately. It is the same thing as vector addition — complex addition = component-wise addition = translation, and it holds for addition only.',
    s2hint: 'Plant a contrast: multiplication is <strong>not</strong> component-wise. If (1 + i) × (1 + i) were multiplied component-wise you would get something odd like 1 + 1i; the true answer appears on the bench in Step 4 — multiplication moves modulus and angle, not components.',

    s3k: 'Step 3 · Multiply by i',
    s3t: 'Multiply by i: Nothing Changes Except a 90° Turn',
    s3e: 'This step answers: <strong>what is i, itself?</strong> Pick a starting point and keep pressing “× i”: each press turns the arrow 90° counter-clockwise — watch the readout: the modulus does not budge, the argument gains exactly +90° each time (wrapping back by the principal value past 180°). Landing points and arcs stay on stage the whole time; press four times and the arrow faces its original direction again. Below runs the unit-point tour: 1 → i → −1 → −i → 1, landings pinned one by one on the axes.',
    s3startLab: 'Starting point z:',
    s3p1: '1 (the unit point)',
    s3p2: '3 + 2i',
    s3mul: '× i (turn 90°)',
    s3reset: 'Reset ↺',
    s3prog: 'Multiplied by i {k} times (every 4 turns restore the direction)',
    s3ro: 'Current z = <b>{z}</b>: modulus = <b>{m}</b> (identical before and after ×i); argument = <b>{ang}</b>.',
    s3back: 'A full turn: four 90° turns make 360°, and the arrow faces its starting direction again — the powers of i cycle with period 4.',
    s3pow: 'The unit-point tour (all computed by repeated multiplication): i¹ = <b>{p1}</b>, i² = <b>{p2}</b>, i³ = <b>{p3}</b>, i⁴ = <b>{p4}</b>. Watch where i² lands: two 90° turns from 1 are a 180° about-face, landing on −1.',
    s3conc: 'The verdict: <strong>×i = a 90° counter-clockwise rotation</strong>, so i² = two turns = an about-face = −1. <strong>i² = −1 is turned into existence, not memorised into it.</strong> “i is the notation for √−1” and “i is the action of turning 90°” are two faces of the same i: the first is its name, the second is its behaviour.',
    s3hint: 'Switch the start to 3 + 2i and press four more times: the landings are off-axis, yet the modulus stays √13 throughout, the argument gains 90° each press, and the fourth press lands exactly back on (3, 2) — period 4 holds for every start, because four turns are one full turn.',

    s4k: 'Step 4 · General Multiplication',
    s4t: 'General Multiplication = Moduli Multiply, Arguments Add: the Checking Bench',
    s4e: 'This step answers: <strong>multiplying by an arbitrary complex number — what happens to modulus and to angle?</strong> First verify the two halves separately: multiplying by a positive real (preset 2 below) only scales and never turns; multiplying by a number of modulus 1 only turns and never scales. An arbitrary multiplier z₂ stacks the two. Drag z₁ (the multiplicand) and z₂ (the multiplier); the green arrow is the product z₁·z₂. The bench below checks three groups, all computed live: the modulus check, the angle check, and an algebraic route (a₁a₂ − b₁b₂, a₁b₂ + b₁a₂) — two roads, one source, cross-verified.',
    s4z2Lab: 'Set the multiplier z₂ to a preset:',
    s4pA: '2 (pure real · scale only)',
    s4pB: 'Modulus 1 · 60° (rotate only)',
    s4pC: '1 + i (turn 45°, scale by √2)',
    s4roProd: 'z₁ ≈ <span>{z1}</span>, z₂ ≈ <span>{z2}</span> ⟹ z₁·z₂ ≈ <b>{prod}</b>',
    s4roMod: "Modulus identity: |z₁z₂| = |z₁| × |z₂|. Displayed factor moduli: |z₁| ≈ {a}, |z₂| ≈ {b}. Multiplying unrounded values gives |z₁|·|z₂| ≈ <b>{p}</b>; computing the product’s modulus directly gives |z₁z₂| ≈ <b>{q}</b>.",
    s4roArg: "Angle check: displayed θ₁ ≈ {a}, θ₂ ≈ {b}. Adding unrounded angles and normalising to the principal interval gives ≈ <b>{s}</b>; the product’s argument calculated directly is ≈ <b>{t}</b>.",
    s4roArgOrigin: 'Angle check: one side is the origin (modulus 0, no argument) — this row checks the modulus only, not the angle.',
    s4roAlg: "Algebraic identity: (a₁a₂ − b₁b₂, a₁b₂ + b₁a₂). Displayed coordinates: a₁ ≈ {a1}, b₁ ≈ {b1}, a₂ ≈ {a2}, b₂ ≈ {b2}. Calculating from unrounded coordinates gives the product ≈ <b>{alg}</b>; the plot uses that same result.",
    s4conc: 'Conclusion: <strong>the multiplication law — moduli multiply, arguments add</strong>. Multiplying by a number scales you by its modulus and rotates you by its argument. Conditions, stated: after adding, angles must be normalised into the principal interval (340° and −20° are the same direction; this page writes −20°); if either factor is 0, the product is the origin and has no argument.',
    s4hint: 'This bench keeps both points inside the disc of modulus ≤ 2.6 so the product stays in frame — the law itself holds for complex numbers of any size. Verify a group with preset 1 + i: with z₁ = 2 + i, the product’s argument should be exactly 45° more than before and its modulus exactly √2 times — the bench ticks both on the spot.',

    s5k: 'Step 5 · Self-Test',
    s5t: 'Self-Test: Turn It Right, Checked on the Spot',
    s5e: 'All three verdicts come from the same live computation as the main text: landings from repeated multiplication, moduli from Pythagoras — no pre-written answer table. Get one right and it locks (dragging points in the main text afterwards will not wash the verdict away); get one wrong and the feedback diagnoses your exact wrong turn, and you may retry.',
    q1t: 'Question 1 · Multiply by i twice',
    q1d: 'z = 3 + 2i. Multiply by i twice (that is, z·i²) — where does it land? Turn it in your head first: 90° once, then 90° again.',
    q1ok: '✓ Correct: two multiplications by i are a 180° about-face, and (3, 2) lands on <b>{z}</b>. Incidentally, this is exactly what z·i² = −z looks like geometrically.',
    q1noA: '✗ (−3, 2) only flips the sign of the real part — it is not the landing of any 90° turn: one turn sends (a, b) → (−b, a), landing on (−2, 3) with the two coordinates swapped; two turns are a 180° about-face, so both coordinates of (3, 2) flip sign together.',
    q1noB: '✗ (3, −2) only flips the sign of the imaginary part (a mirror flip across the real axis) — it is not a wrong-way turn either: one clockwise turn lands on (2, −3), and two clockwise turns give the same (−3, −2) as two counter-clockwise ones. ×i turns <strong>counter-clockwise</strong> by 90°: the coordinates swap and the new real part flips sign.',
    q1noC: '✗ That is the starting point itself: multiplying by i twice is not staying put — it is a 180° about-face, and both coordinates flip sign.',
    q2t: 'Question 2 · Whose modulus is bigger',
    q2d: '|3 + 4i| versus |−4 + 3i| — which is bigger? Do not rush: both moduli are computed by Pythagoras; compute first, then compare.',
    q2oA: '3 + 4i is bigger',
    q2oB: '−4 + 3i is bigger',
    q2oC: 'They are equal',
    q2ok: '✓ Correct: |3 + 4i| = <b>{a}</b> and |−4 + 3i| = <b>{b}</b> — equal. The two points point in different directions yet sit at the same distance from the origin: the modulus sees length only, never direction.',
    q2no: '✗ Compute once more: |3 + 4i| = √(3² + 4²) = <b>{a}</b>; |−4 + 3i| = √((−4)² + 3²) = <b>{b}</b>. The minus sign vanishes inside the square — the modulus sees length only, never direction.',
    q3t: 'Question 3 · True or false',
    q3d: 'Judge this claim: “The modulus of a product equals the sum of the two moduli.”',
    q3true: 'True', q3false: 'False',
    q3ok: '✓ Correct judgment — the claim is <b>false</b>: test it on the spot with a ready-made set of numbers — with z₁ = z₂ = 1 + i, |z₁|·|z₂| = <b>{prod}</b>, exactly |(1 + i)²| = |2i| = <b>{val}</b>; the “sum of moduli” would give <b>{sum}</b>, which does not match. The modulus of a product is the <strong>product</strong> of the moduli, not the sum. You can also drag your own group on the Step 4 bench to re-verify.',
    q3no: '✗ The claim is actually false. Test it with numbers on the spot: with z₁ = z₂ = 1 + i, the product’s modulus is <b>{val}</b>; the product of the moduli is <b>{prod}</b> and the sum of the moduli is <b>{sum}</b> — which one does the product’s modulus equal? Dragging a group on the Step 4 bench proves it yourself, too.',
    s5hint: 'The three, wrapped up: (1) multiplying by i twice is an about-face — both coordinates flip sign; (2) the modulus recognises length only: (3, 4) and (−4, 3) are the same Pythagorean pair, swapped and sign-flipped, both of modulus 5; (3) moduli multiply, arguments add — the “sum” lives on the angle side only; on the modulus side it is always a product.',

    s6k: 'Step 6 · Finale',
    s6t: 'Finale: One Plane, Two Operations',
    s6e: 'Complex numbers are not a rule to memorise — they are the arithmetic that grows naturally once numbers are put back on the plane. Three closing cards:',
    c1h: 'A complex number is a point on the plane',
    c1: 'z = a + bi corresponds one-to-one with a point of the plane and with an arrow from the origin. Pin it two ways: coordinates (a, b), or (modulus, argument) — the modulus is the arrow’s length, the argument its direction (principal value (−180°, 180°] on this page).',
    c2h: 'Addition is sliding',
    c2: 'The sum’s coordinates are the two sides’ coordinates added separately; in the picture it is one slide along the added number’s arrow — the diagonal of the parallelogram. Addition moves position only.',
    c3h: 'Multiplication is rotation + scaling',
    c3: 'Moduli multiply, arguments add: multiplying by a number scales you by its modulus and rotates you by its argument. Multiplying by i is the purest case — modulus 1, angle 90°, rotation with no scaling; and i² = −1 is simply “two turns make an about-face”.',
    s6fin: 'One sentence each for two roads ahead: <strong>division</strong> is the inverse of multiplication — arguments subtract, moduli divide — not expanded on this page. And one planted thread: if this point starts turning on its own, its angle growing uniformly with time, its position is e<sup>iθ</sup> running on the unit circle — the doorway to <strong>Euler’s formula</strong>, named here only.',
    s6lkTrig: 'The very point at angle θ, set turning and with its height unrolled, is the sine wave — watch it move on the trigonometry page →',
    s6lkEigen: "On the eigenvalues page, choose the “Rotation–scaling: complex λ” preset: this example has two non-real eigenvalues and no real eigen-direction. Explore how rotation and scaling combine in a matrix →",
    s6lkFourier: 'Phase is a starting angle: where each circle starts on the Fourier page is exactly what this page’s argument is for — see it on the Fourier page →',
  }
};

/* ===== 语言机制（照全站规范：knowledge-lang 共享键） ===== */
let _lang = null;
let _langMem = 'zh';
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
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
document.addEventListener('DOMContentLoaded', initLangToggle);
