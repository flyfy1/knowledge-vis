'use strict';
/* ============================================================
   特征值与特征向量讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '特征值与特征向量 · 矩阵不转的那些方向 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '特征值与特征向量 · 矩阵不转的那些方向',
    tagline: '矩阵是一台拉伸机器：它作用在空间上，几乎每根箭头都会被转走——只有少数方向例外，只被拉长、缩短或者翻转，方向（或反方向）纹丝不动。这些方向叫特征向量，拉伸的倍数叫特征值。这一页从「圆被捏成椭圆」开始，亲手把不转的方向一个个拖出来，最后走到谷歌排名背后的那个 λ = 1。',
    nav0: '0 圆变椭圆', nav1: '1 找方向', nav2: '2 λ 的性格', nav3: '3 幂迭代',
    nav4: '4 主轴与对角化', nav5: '5 主成分', nav6: '6 终章 · 稳态',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 特征值与特征向量 Eigenvalues & Eigenvectors —— 一步一交互系列',

    /* ---- 第 0 步 ---- */
    s0k: '第 0 步 · 钩子',
    s0t: '圆被捏成椭圆，只剩两个方向没转',
    s0e: '单位圆上均匀插着 20 根箭头。让矩阵 A 作用一次：圆被捏成椭圆，箭头们普遍被<strong>转走</strong>了——但盯住橙色和粉色的那两对箭头：它们只变长、变短，<strong>方向一条直线没偏</strong>。拖动滑杆，把这场变形在「圆」和「椭圆」之间来回推。整个空间都被拧动了，为什么偏偏这两个方向纹丝不转？这一页就查它们。',
    s0formula: 'A = [[2.2, 0.6], [0.6, 1.0]]（本步固定，全页的矩阵都写成这种 2×2 形式）',
    s0tLab: '变形进度 t（0 = 原样，1 = A 作用完毕）',
    s0play: '播放变形', s0pause: '暂停',
    s0ro: '符号先行：<strong>λ（读作「拉姆达」）就是特征值的记号</strong>——橙色方向：被拉长 <span class="lam1">λ₁ ≈ {l1}</span> 倍 · 粉色方向：缩短到 <span class="lam2">λ₂ ≈ {l2}</span> 倍 · 其余箭头：既伸缩又<strong>转向</strong>',
    s0hint: '先记住判据：<strong>Av 与 v 共线</strong>（同向或反向）时，v 才叫特征向量，共线的倍数（带符号）就是特征值 λ。下一站你亲手拖一根箭头，把它转到共线为止。',
    cv0unit: '单位圆',
    cv0eig1: '特征方向 1（只伸缩）',
    cv0eig2: '特征方向 2（只伸缩）',

    /* ---- 第 1 步 ---- */
    s1k: '第 1 步 · 亲手实验',
    s1t: '拖一根箭头，找到不转的方向',
    s1e: '青色箭头 v 归你拖动（抓住箭头尖，或在图上任意点按拖动）。橙色箭头是 Av——矩阵作用后的它。两根箭头的<strong>夹角</strong>实时算给你看：夹角不为零，说明 v 被转走了；把 v 慢慢转到与 Av <strong>完全共线</strong>（同向、或者恰好反向），夹角归零——你就找到了一个特征向量。注意反向也算数：此时 λ 是负数，Av 是 v 的反方向延长。下方的曲线是「方向角 θ → 夹角」的全景图：它在两个地方触到零，那正是两个特征方向藏身的位置。',
    s1formula: 'Av = λv —— v 是特征向量，λ 是对应的特征值',
    s1presetLab: '矩阵预设：',
    s1p1: 'A 对称经典 [[2,1],[1,2]]',
    s1p2: 'A 一般 [[3,0.5],[0.5,1]]',
    s1p3: 'A 带负 λ [[0.5,1.5],[1.5,0.5]]',
    s1ro: '方向角 θ = <span>{th}°</span> · v 与 Av 夹角 = <span>{ang}°</span> · |Av| / |v| = <span>{sc}</span> · 带符号伸缩比 (v·Av)/|v|² = <span>{lam}</span>',
    s1found: '🎉 <span class="good">找到了！</span> 夹角 ≈ 0 —— v 是特征向量，对应 <b>λ = {lam}</b>{flip}',
    s1flip: '（负号：Av 与 v 反向，箭头被翻了过去，同样是共线）',
    s1near: '很接近了——再微调一点，夹角压到 1° 以内。',
    s1hint: '为什么曲线恰好有两个零点？2×2 矩阵的特征值是二次方程 λ² − (tr A)λ + det A = 0 的两个根（下一站细看）。判别式决定根的性质：两个实根、一个重根、还是一对共轭复数——矩阵的「性格」全写在这个判别式里。',
    cv1v: 'v（拖我）',
    cv1av: 'Av',
    cv1curveT: '方向角 θ 与夹角的关系（0°–180° 一整圈方向）',
    cv1zero: '零点 = 特征方向',

    /* ---- 第 2 步 ---- */
    s2k: '第 2 步 · 特征值的性格',
    s2t: '四个数随便调，λ 当场改命',
    s2e: '这一站把矩阵的四个数 a、b、c、d 全交给你。λ₁、λ₂ 和两条特征方向线实时重算，旁边并排摆着两条<strong>恒等式</strong>：λ₁ + λ₂ 必须等于迹 tr A = a + d，λ₁λ₂ 必须等于行列式 det A——误差在 10⁻¹⁵ 量级，是浮点数最后的倔强。挨个点一遍预设巡演：<strong>负特征值</strong>把箭头翻过去；<strong>两个 λ 都小于 1</strong> 时圆整体缩水；<strong>剪切矩阵</strong>只有一个特征方向（重根、亏损，老实只画一条）；<strong>旋转缩放</strong>判别式小于零，实特征方向<strong>压根不存在</strong>——λ 是一对共轭复数，页面绝不画假方向给你，只给你看真实行为：一圈一圈的螺旋。',
    s2formula: 'λ = (tr A ± √( (a−d)² + 4bc )) / 2，判别式 Δ = (a−d)² + 4bc',
    s2aLab: 'a（左上）', s2bLab: 'b（右上）', s2cLab: 'c（左下）', s2dLab: 'd（右下）',
    s2presetLab: '预设巡演：',
    s2qNeg: '负 λ：翻转',
    s2qShrink: '双 λ < 1：收缩',
    s2qShear: '剪切：重根亏损',
    s2qRot: '旋转缩放：复 λ',
    s2qFree: '回到默认 [[2.2,0.6],[0.6,1.0]]',
    bdL1: 'λ₁ = <b class="l1">{v}</b>',
    bdL2: 'λ₂ = <b class="l2">{v}</b>',
    bdSum: 'λ₁+λ₂ = {s} · tr A = {tr} · 误差 {e}',
    bdProd: 'λ₁λ₂ = {p} · det A = {det} · 误差 {e}',
    bdDelta: '判别式 Δ = {v}',
    s2double: '重根 λ₁ = λ₂ = {lam}，但 A 不是 λI —— 只有一个特征方向。这样的矩阵叫<strong>亏损矩阵</strong>：它凑不齐一整套特征向量。',
    s2scalar: '这是 λI（数量矩阵）：每个方向都是特征方向，λ = {lam} —— 谁都不转，人人都是特征向量。',
    s2complex: 'Δ < 0：特征值是一对共轭复数 λ = α ± βi = <b>{alpha} ± {beta}i</b>，<strong>没有任何实特征方向</strong>。真实行为是旋转 + 缩放：每次作用转过 <span>{ang}°</span>、长度乘 <span>{rho}</span>。',
    s2spiralBtn: '看迭代螺旋',
    s2spiralLab: '同一向量被 A 连乘 12 次的落点（小窗坐标自动缩放）',
    s2spiralStep: '下一步',
    s2spiralPlay: '播放',
    s2spiralPause: '暂停',
    s2spiralReplay: '重播',
    s2spiralRo: '第 <span>{k}</span> / 12 步 · 当前点长度 = <span>{len}</span> · 累计转过 <span>{turn}°</span>',
    s2hint: '负 λ 的读法：λ = −1 不是「缩短到 −1 倍」这种怪话，而是先翻转方向、再伸缩 |λ| 倍。第 1 步的预设 3 里你已经拖到过它。复 λ 也不是数学坏掉：它诚实地告诉你这个变换里藏着旋转——桥梁振动、交流电路、量子力学，复特征值到处都是。',
    cv2line1: 'λ₁ 方向',
    cv2line2: 'λ₂ 方向',
    cv2noline: '无实特征方向',

    /* ---- 第 3 步 ---- */
    s3k: '第 3 步 · 幂迭代',
    s3t: '乘上一百次，主方向自己浮出来',
    s3e: '不知道特征向量在哪没关系——有个笨办法：拿任意向量反复乘 A。每乘一次，结果就朝主特征方向（|λ| 最大的那个）<strong>贴近一点</strong>，因为沿主方向的分量每步放大 |λ₁| 倍，其余分量只放大 |λ₂| 倍，相对差距以 <strong>|λ₂/λ₁|</strong> 的倍率逐歩拉开。用滑杆把 λ₂/λ₁ 从 0.33 推到 0.95：两个特征值越接近，贴近得越慢，误差曲线拖出长长的尾巴。再点「等模反例」：λ₂ = −λ₁ 时两个分量谁也压不倒谁，向量在两个方向之间<strong>永远横跳、永不收敛</strong>——幂迭代的失效情形，页面如实标出，绝不假装收敛。',
    s3formula: 'x ← Ax / |Ax|，反复迭代 —— x 逐歩贴向 |λ| 最大的特征向量',
    s3rLab: 'λ₂/λ₁ 之比 r（λ₁ = 2，方向固定 35°）',
    s3rNA: '不适用',
    s3pFast: 'r = 0.33 快',
    s3pSlow: 'r = 0.90 慢',
    s3pSlower: 'r = 0.95 更慢',
    s3pFail: '等模反例 λ₂ = −λ₁',
    s3rand: '随机起点', s3step: '乘一次', s3play: '连播', s3pause: '暂停', s3run: '一键 60 步', s3reset: '重置',
    s3ro: '步数 k = <span>{k}</span> · 与主特征向量的夹角误差 = <span>{err}°</span> · |λ₂/λ₁| = <span>{r}</span>',
    s3conv: '<span class="good">已收敛</span>——误差小于 0.01°。这个方向就是主特征向量（λ₁ = {lam}），是乘出来的，不是解方程解出来的。',
    s3failNote: '<b class="bad">不收敛（失效情形）：</b> |λ₁| = |λ₂| 时误差不衰减、方向来回横跳。幂迭代再诚实不过：条件不满足，它就当场摆烂给你看。',
    s3chartT: '夹角误差随步数衰减（对数纵轴）',
    s3hint: '误差每步大约乘上 |λ₂/λ₁|——这就是为什么 r = 0.95 的尾巴那么长：0.95¹⁰⁰ 还剩 0.006。数值库和谷歌的 PageRank 找的特征向量，主力正是这个幂迭代（配上各种加速技巧）。终章你会再见到它一次。',
    cv3main: '主特征方向',
    cv3traj: '迭代轨迹',

    /* ---- 第 4 步 ---- */
    s4k: '第 4 步 · 对称矩阵',
    s4t: '主轴、正交与对角化：峡谷的真身',
    s4e: '对称矩阵（b = c）有一条特权：<strong>总可选出一对互相垂直的特征向量</strong>（两个特征值不同时，特征向量自动互相垂直，别无选择；特征值相等的重根情形，同一个特征值名下是一整片平面，照样能从中挑出一对垂直的来）。图上叠的是二次型 xᵀAx 的等高线椭圆——还记得梯度下降页第 2 步的峡谷吗？椭圆的长轴、短轴，恰好就是两个特征方向；条件数 κ = λmax/λmin 就是峡谷的长宽比，特征值在这里正式以真身出场。点「转到特征坐标系」：整个画面转过 θ 角，让特征方向与坐标轴对齐，再看矩阵的读数——<strong>交叉项消失</strong>，A 在新坐标里变成对角阵 Λ，而重构 QΛQᵀ 与 A 的逐元误差是 10⁻¹⁶ 量级：对角化不是近似，是恒等式。',
    s4formula: 'A = QΛQᵀ，Q 的列 = 单位特征向量，Λ = diag(λ₁, λ₂)',
    s4aLab: 'a', s4mLab: 'b = c（对称）', s4dLab: 'd',
    s4rotBtn: '转到特征坐标系', s4unrotBtn: '转回原坐标系',
    bdDot: 'v₁·v₂ = {v}（正交）',
    bdKappa: 'κ = λmax/λmin = {v}（峡谷长宽比）',
    bdRecon: '‖QΛQᵀ − A‖ 逐元最大误差 = {v}',
    bdL1: 'λ₁ = <b class="l1">{v}</b>',
    bdL2: 'λ₂ = <b class="l2">{v}</b>',
    s4matA: '原坐标里的 A：',
    s4matA2: '特征坐标里的 A′ = QᵀAQ：',
    s4cross: '交叉项 A′₁₂ = {v} ≈ 0 —— 新坐标下 xᵀAx = λ₁u² + λ₂v²，两个方向彻底脱钩，各算各的。',
    s4notpd: '注意：当前参数让 A 不再正定（λmin ≤ 0），等高线变成双曲线族，图上只画特征方向线；把 a、d 调大即可回到椭圆。',
    s4hint: '梯度下降在峡谷里之字形横跳，本质是坐标轴与特征方向不对齐：在特征坐标里，两个方向步长各管各的之字形当场消失。「换一组基，让矩阵变对角」——这是线性代数最有生产力的一招，第 5 步的数据压缩、第 6 步的稳态分析，用的都是它。链接：<a class="fourier-link" href="../gradient-descent/#step2">去峡谷里看之字形轨迹本身 →</a>。',
    cv4axis1: 'v₁（λ₁）',
    cv4axis2: 'v₂（λ₂）',

    /* ---- 第 5 步 ---- */
    s5k: '第 5 步 · 数据的主成分',
    s5t: '方差最大的方向，就是最大特征向量',
    s5e: '一团拉长的数据点（60 个，固定随机种子生成，已减去均值中心化）。拖动那根过原点的轴，读数是数据沿这根轴投影的<strong>样本方差</strong>（协方差口径：除以 n − 1，本步全文统一）——转到不同方向，方差随之涨落，涨到最大的那个方向，恰好是协方差矩阵的<strong>最大特征向量</strong>。点「显示主成分」让它自己对齐：第一主成分捕获的方差占比 = λ₁/(λ₁ + λ₂)，第二主成分与它垂直、由 λ₂ 管。把数据换到这对新轴上、再把小轴扔掉，数据就被压缩了——这就是 PCA（主成分分析）的全部本体。 <a class="fourier-link" href="../kalman/#step5">这条主方向在卡尔曼里怎么用：只测位置估速度 →</a>',
    s5formula: '协方差 C = (1/(n−1)) Σ pᵢpᵢᵀ，C 的特征向量 = 主成分方向，特征值 = 沿该方向的方差',
    s5show: '显示主成分', s5hide: '隐藏主成分',
    s5ro: '轴方向角 = <span>{th}°</span> · 沿轴样本方差 = <span>{v}</span>（上限就是 λ₁ = <span>{l1}</span>）',
    s5pc: '主成分读数：λ₁ = <b>{l1}</b>（方差占比 <b>{share}%</b>）· λ₂ = <b>{l2}</b> · 沿 PC1 的投影方差（由数据真算）= <b>{pv}</b>，与 λ₁ 一致到浮点精度',
    s5hint: '为什么方差最大的方向值得当「主成分」？因为数据沿这个方向铺得最开、信息最密，扔掉垂直方向的小方差，损失的信息最少。照片压缩、人脸识别（特征脸 eigenfaces）、金融风险因子——背后都是这一步的协方差特征分解。',
    cv5pc1: 'PC1（λ₁）',
    cv5pc2: 'PC2（λ₂）',
    cv5axis: '你的轴',

    /* ---- 第 6 步 ---- */
    s6k: '第 6 步 · 终章',
    s6t: '稳态：λ = 1 的特征向量，与谷歌的起点',
    s6e: '最后一站，一张 4 个节点的小网：A、B、C、D 互相指着箭头。想象每个节点上站着一群人，每一步，每个人都沿出箭头<strong>均匀随机</strong>地走到下个节点——这就是马尔可夫链，转移矩阵 M 的每一列写明「从这一列的节点出发，落到各行的概率」，所以<strong>每列之和必须恰好是 1</strong>（人不会凭空消失）。从任意初始分布出发，反复乘 M：分布一步步变，最后<strong>冻住不动</strong>——冻住的分布 π 满足 Mπ = π，它正是 M 的一个特征向量，特征值恰好 λ = 1。点「换初始分布」再跑：起点天差地别，终点分毫不差。谷歌的 PageRank 就是把整个互联网当成这张图：稳态分布即网页排名（真实 PageRank 还加了阻尼：每步以 0.15 的概率随机跳到任意页，公式 π ← 0.85·Mπ + 0.15/N，保证链一定收敛；本页的小网本身可达且无周期，不加阻尼也收敛）。',
    s6formula: 'π ← Mπ，稳态 Mπ* = π* —— λ = 1 的特征向量',
    s6step: '走一步', s6play: '连播', s6pause: '暂停', s6run: '一键 80 步', s6reset: '回到均匀分布',
    s6initLab: '初始分布：',
    s6iUni: '均匀', s6iA: '全压 A', s6iD: '全压 D', s6iRand: '随机',
    s6ro: '步数 k = <span>{k}</span> · 当前分布 (A, B, C, D) = <span>{dist}</span> · 与稳态的距离（L1）= <span>{d}</span>',
    s6steady: '稳态 π* = ({dist}) —— 理论值恰好是 (2/9, 1/9, 4/9, 2/9)：C 被三处指着、最受欢迎，与方程组独立解一致（误差 < 10⁻¹²）。换任意初始分布，幂迭代都回到这里。',
    s6colsum: '转移矩阵 M 的列和：{sums}（每列恰好 1 —— 总量守恒，所以 λ = 1 的不变分布必然存在）',
    s6cardsH: '同一个 λ，三副面孔',
    c1h: 'PageRank：稳态即排名',
    c1: '把网页看成节点、链接看成箭头，PageRank 求的就是这张巨图的 λ = 1 特征向量：稳态分量最大的网页最重要。求法还是第 3 步的幂迭代——乘到不动为止。',
    c2h: '振动模态：特征频率',
    c2: '桥梁和建筑的振动方程里，特征向量是<strong>振型</strong>（各部位摆动的相对幅值），特征值给出<strong>固有频率</strong>。工程师避开共振、抗震设计，算的全是特征问题。',
    c3h: '稳定性：回到单位圆',
    c3: '离散系统 x ← Ax 稳定 ⟺ A 的全部特征值 |λ| < 1 —— 与 Z 变换页里「极点在单位圆内才稳定」是同一句话：系统矩阵的特征值，就是极点的真身。链接：<a class="fourier-link" href="../ztransform/#step3">Z 变换</a>。',
    s6fin: '从捏圆的机器到谷歌的排名，中间只隔一个问题：<strong>「哪个方向不会被转走？」</strong>特征向量是矩阵的骨架——看懂了骨架，拉伸、旋转、振动、数据的形状、网络的稳态，全都是同一件事的不同说法。',
    s6lkGd: '峡谷的现场：条件数决定之字形 →', s6lkKal: '协方差的主方向：卡尔曼的二维步 →',
    cv6from: '权重按节点大小显示'
  },
  en: {
    docTitle: 'Eigenvalues & Eigenvectors · The Directions a Matrix Won’t Turn · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Eigenvalues & Eigenvectors · The Directions a Matrix Won’t Turn',
    tagline: 'A matrix is a stretching machine: applied to space, it turns almost every arrow — except a few special directions that only get stretched, shrunk, or flipped, their line never bending. Those directions are eigenvectors; the stretch factors are eigenvalues. We start with a circle squeezed into an ellipse, drag the unturned directions out by hand, and end at the λ = 1 hiding behind Google’s ranking.',
    nav0: '0 Circle → Ellipse', nav1: '1 Find a Direction', nav2: '2 The Character of λ', nav3: '3 Power Iteration',
    nav4: '4 Axes & Diagonalization', nav5: '5 Principal Components', nav6: '6 Finale · Steady State',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Eigenvalues & Eigenvectors — one interaction per step',

    s0k: 'Step 0 · The Hook',
    s0t: 'A circle squeezed into an ellipse — two directions refuse to turn',
    s0e: 'Twenty arrows stand evenly on the unit circle. Apply the matrix A once: the circle is squeezed into an ellipse and the arrows are, almost all of them, <strong>turned</strong>. But watch the orange and pink pairs: they only grow or shrink — <strong>their line does not bend at all</strong>. Drag the slider to push the deformation back and forth between “circle” and “ellipse”. The whole plane is being twisted, so why do exactly these two directions stay put? This page investigates them.',
    s0formula: 'A = [[2.2, 0.6], [0.6, 1.0]] (fixed for this step; every matrix on this page is 2×2 like this)',
    s0tLab: 'Morph t (0 = untouched, 1 = A fully applied)',
    s0play: 'Play the morph', s0pause: 'Pause',
    s0ro: 'Symbols first: <strong>λ (lambda) is the symbol for the eigenvalue</strong> — the orange direction: stretched by <span class="lam1">λ₁ ≈ {l1}</span> · Pink direction: shrunk to <span class="lam2">λ₂ ≈ {l2}</span> · Every other arrow: stretched <strong>and turned</strong>',
    s0hint: 'Memorize the test: v is an eigenvector exactly when <strong>Av is collinear with v</strong> (same or opposite direction); the signed multiple is the eigenvalue λ. Next step, you drag an arrow yourself until it lines up.',
    cv0unit: 'unit circle',
    cv0eig1: 'eigendirection 1 (stretch only)',
    cv0eig2: 'eigendirection 2 (stretch only)',

    s1k: 'Step 1 · Hands On',
    s1t: 'Drag an arrow until it stops turning',
    s1e: 'The cyan arrow v is yours to drag (grab its tip, or press and drag anywhere). The orange arrow is Av — what the matrix does to it. Their <strong>angle</strong> is computed live: nonzero means v got turned; rotate v until it is <strong>exactly collinear</strong> with Av — same direction, or exactly opposite — and the angle hits zero: you have found an eigenvector. Opposite counts, too: then λ is negative and Av is v extended backwards. The curve below maps “direction angle θ → angle between v and Av” for every direction: it touches zero in exactly two places, the hiding spots of the two eigendirections.',
    s1formula: 'Av = λv — v is an eigenvector, λ its eigenvalue',
    s1presetLab: 'Matrix preset:',
    s1p1: 'A classic symmetric [[2,1],[1,2]]',
    s1p2: 'A general [[3,0.5],[0.5,1]]',
    s1p3: 'A with a negative λ [[0.5,1.5],[1.5,0.5]]',
    s1ro: 'Direction θ = <span>{th}°</span> · angle(v, Av) = <span>{ang}°</span> · |Av| / |v| = <span>{sc}</span> · signed stretch (v·Av)/|v|² = <span>{lam}</span>',
    s1found: '🎉 <span class="good">Found it!</span> Angle ≈ 0 — v is an eigenvector with <b>λ = {lam}</b>{flip}',
    s1flip: ' (negative: Av points opposite to v — flipped, but still collinear)',
    s1near: 'Very close — nudge it a little more, get the angle under 1°.',
    s1hint: 'Why exactly two zeros? The eigenvalues of a 2×2 matrix are the two roots of λ² − (tr A)λ + det A = 0 (next step). The discriminant decides their character: two real roots, one repeated root, or a complex-conjugate pair — the whole personality of a matrix is written in that discriminant.',
    cv1v: 'v (drag me)',
    cv1av: 'Av',
    cv1curveT: 'angle(v, Av) vs direction θ (directions wrap at 180°)',
    cv1zero: 'zeros = eigendirections',

    s2k: 'Step 2 · The Character of λ',
    s2t: 'All four entries are yours — watch λ change its fate',
    s2e: 'This step hands you all four entries a, b, c, d. λ₁, λ₂ and the two eigendirection lines are recomputed live, next to two <strong>identities</strong>: λ₁ + λ₂ must equal the trace tr A = a + d, and λ₁λ₂ must equal the determinant — the residuals hover around 10⁻¹⁵, floating point’s last stand. Tour the presets: a <strong>negative eigenvalue</strong> flips its arrow; <strong>both λ below 1</strong> shrink the whole circle; the <strong>shear</strong> has only one eigendirection (a repeated, defective root — the page honestly draws just one line); the <strong>rotation–scaling</strong> has discriminant below zero, so real eigendirections <strong>do not exist</strong> — λ is a complex-conjugate pair, and the page will not fake a direction for you; it shows the true behavior instead: a spiral.',
    s2formula: 'λ = (tr A ± √( (a−d)² + 4bc )) / 2, discriminant Δ = (a−d)² + 4bc',
    s2aLab: 'a (top-left)', s2bLab: 'b (top-right)', s2cLab: 'c (bottom-left)', s2dLab: 'd (bottom-right)',
    s2presetLab: 'Preset tour:',
    s2qNeg: 'Negative λ: the flip',
    s2qShrink: 'Both λ < 1: shrink',
    s2qShear: 'Shear: defective double root',
    s2qRot: 'Rotation–scaling: complex λ',
    s2qFree: 'Back to default [[2.2,0.6],[0.6,1.0]]',
    bdL1: 'λ₁ = <b class="l1">{v}</b>',
    bdL2: 'λ₂ = <b class="l2">{v}</b>',
    bdSum: 'λ₁+λ₂ = {s} · tr A = {tr} · residual {e}',
    bdProd: 'λ₁λ₂ = {p} · det A = {det} · residual {e}',
    bdDelta: 'discriminant Δ = {v}',
    s2double: 'Repeated root λ₁ = λ₂ = {lam}, but A is not λI — there is only ONE eigendirection. Such a matrix is called <strong>defective</strong>: it cannot muster a full set of eigenvectors.',
    s2scalar: 'This is λI (a scalar matrix): every direction is an eigendirection with λ = {lam} — nothing turns, everyone is an eigenvector.',
    s2complex: 'Δ < 0: the eigenvalues are a complex-conjugate pair λ = α ± βi = <b>{alpha} ± {beta}i</b>, and there is <strong>no real eigendirection at all</strong>. The true behavior is rotation + scaling: each application turns vectors by <span>{ang}°</span> and multiplies lengths by <span>{rho}</span>.',
    s2spiralBtn: 'Watch the iteration spiral',
    s2spiralLab: 'One vector multiplied by A 12 times (small window, auto-scaled axes)',
    s2spiralStep: 'Next step',
    s2spiralPlay: 'Play',
    s2spiralPause: 'Pause',
    s2spiralReplay: 'Replay',
    s2spiralRo: 'step <span>{k}</span> / 12 · current length = <span>{len}</span> · turned <span>{turn}°</span> in total',
    s2hint: 'How to read a negative λ: λ = −1 does not mean “shrunk by −1×”; it means flip the direction, then scale by |λ|. You already dragged one in Step 1’s third preset. Complex λ is not broken math either: it honestly reports a rotation hiding inside the transformation — bridges, AC circuits and quantum mechanics are full of complex eigenvalues.',
    cv2line1: 'λ₁ direction',
    cv2line2: 'λ₂ direction',
    cv2noline: 'no real eigendirection',

    s3k: 'Step 3 · Power Iteration',
    s3t: 'Multiply a hundred times — the main direction surfaces on its own',
    s3e: 'No idea where the eigenvector hides? Use the blunt method: multiply any vector by A, over and over. Each multiplication nudges the result <strong>closer to the dominant eigendirection</strong> (the one with largest |λ|), because the component along it grows by |λ₁| per step while the rest grows only by |λ₂| — the relative gap widens by a factor <strong>|λ₂/λ₁|</strong> each step. Push the ratio slider from 0.33 to 0.95: the closer the two eigenvalues, the slower the crawl, and the error curve grows a long tail. Then try the <strong>equal-modulus counterexample</strong>: with λ₂ = −λ₁ neither component can dominate, the vector <strong>hops between two directions forever and never converges</strong> — power iteration’s failure mode, labeled as such, never faked.',
    s3formula: 'x ← Ax / |Ax|, repeat — x creeps toward the eigenvector of largest |λ|',
    s3rLab: 'ratio r = λ₂/λ₁ (λ₁ = 2, direction fixed at 35°)',
    s3rNA: 'n/a',
    s3pFast: 'r = 0.33 fast',
    s3pSlow: 'r = 0.90 slow',
    s3pSlower: 'r = 0.95 slower',
    s3pFail: 'Counterexample λ₂ = −λ₁',
    s3rand: 'Random start', s3step: 'Multiply once', s3play: 'Play', s3pause: 'Pause', s3run: 'Run 60 steps', s3reset: 'Reset',
    s3ro: 'step k = <span>{k}</span> · angle error to dominant eigenvector = <span>{err}°</span> · |λ₂/λ₁| = <span>{r}</span>',
    s3conv: '<span class="good">Converged</span> — error below 0.01°. This direction is the dominant eigenvector (λ₁ = {lam}), obtained by multiplication, not by solving any equation.',
    s3failNote: '<b class="bad">No convergence (failure mode):</b> when |λ₁| = |λ₂| the error does not decay and the direction hops back and forth. Power iteration is honest: when its condition fails, it fails in plain sight.',
    s3chartT: 'angle error vs step (log scale)',
    s3hint: 'The error is multiplied by roughly |λ₂/λ₁| each step — which is why r = 0.95 has such a long tail: 0.95¹⁰⁰ is still 0.006. Numerical libraries and Google’s PageRank find their eigenvectors with exactly this iteration (plus acceleration tricks). You will meet it once more in the finale.',
    cv3main: 'dominant eigendirection',
    cv3traj: 'iteration path',

    s4k: 'Step 4 · Symmetric Matrices',
    s4t: 'Principal axes, orthogonality, diagonalization — the canyon’s true form',
    s4e: 'Symmetric matrices (b = c) enjoy a privilege: <strong>you can always choose a perpendicular pair of eigenvectors</strong> (when the two eigenvalues differ, the eigenvectors are perpendicular automatically — no choice involved; when an eigenvalue repeats, its eigenspace is a whole plane, and a perpendicular pair can still be picked from it). Overlaid are the contour ellipses of the quadratic form xᵀAx — remember the canyon from Step 2 of the Gradient Descent page? The ellipse’s long and short axes are exactly the two eigendirections, and the condition number κ = λmax/λmin is the canyon’s aspect ratio; here the eigenvalues appear in their true form. Press “Rotate into the eigenbasis”: the whole picture turns by θ until the eigendirections line up with the axes, and the matrix readout changes — <strong>the cross term vanishes</strong>, A becomes the diagonal Λ in the new coordinates, and QΛQᵀ reconstructs A with max entry error around 10⁻¹⁶: diagonalization is an identity, not an approximation.',
    s4formula: 'A = QΛQᵀ, columns of Q = unit eigenvectors, Λ = diag(λ₁, λ₂)',
    s4aLab: 'a', s4mLab: 'b = c (symmetric)', s4dLab: 'd',
    s4rotBtn: 'Rotate into the eigenbasis', s4unrotBtn: 'Rotate back',
    bdDot: 'v₁·v₂ = {v} (orthogonal)',
    bdKappa: 'κ = λmax/λmin = {v} (canyon aspect ratio)',
    bdRecon: 'max entry error of ‖QΛQᵀ − A‖ = {v}',
    bdL1: 'λ₁ = <b class="l1">{v}</b>',
    bdL2: 'λ₂ = <b class="l2">{v}</b>',
    s4matA: 'A in the original basis:',
    s4matA2: 'A′ = QᵀAQ in the eigenbasis:',
    s4cross: 'Cross term A′₁₂ = {v} ≈ 0 — in the new coordinates xᵀAx = λ₁u² + λ₂v²: the two directions are fully decoupled, each minding its own business.',
    s4notpd: 'Note: the current parameters make A non-positive-definite (λmin ≤ 0), so the contours become hyperbolas; only the eigendirection lines are drawn. Raise a and d to return to ellipses.',
    s4hint: 'Gradient descent zigzags in the canyon essentially because the coordinate axes are misaligned with the eigendirections: in the eigenbasis each direction takes its own step size and the zigzag vanishes. “Change the basis until the matrix is diagonal” is linear algebra’s most productive move — Step 5’s data compression and Step 6’s steady state both run on it. Link: <a class="fourier-link" href="../gradient-descent/#step2">see the zig-zag itself in the canyon →</a>.',
    cv4axis1: 'v₁ (λ₁)',
    cv4axis2: 'v₂ (λ₂)',

    s5k: 'Step 5 · Principal Components of Data',
    s5t: 'The direction of maximum variance is the top eigenvector',
    s5e: 'An elongated cloud of 60 points (fixed random seed, already mean-centered). Drag the axis through the origin and read the <strong>sample variance</strong> of the data projected onto it (covariance convention: divide by n − 1, used consistently throughout this step) — the variance rises and falls as you turn, and its maximum is attained exactly at the <strong>top eigenvector of the covariance matrix</strong>. Press “Show principal components” and let it align itself: PC1 captures the share λ₁/(λ₁ + λ₂) of the total variance, PC2 is perpendicular to it and governed by λ₂. Rotate the data into this new basis and throw away the small axis, and the data is compressed — that is the whole of PCA (principal component analysis). <a class="fourier-link" href="../kalman/#step5">How this principal direction is used in Kalman: velocity from position alone →</a>',
    s5formula: 'Covariance C = (1/(n−1)) Σ pᵢpᵢᵀ; eigenvectors of C = principal directions, eigenvalues = variance along them',
    s5show: 'Show principal components', s5hide: 'Hide principal components',
    s5ro: 'Axis angle = <span>{th}°</span> · sample variance along axis = <span>{v}</span> (the ceiling is λ₁ = <span>{l1}</span>)',
    s5pc: 'Principal components: λ₁ = <b>{l1}</b> (variance share <b>{share}%</b>) · λ₂ = <b>{l2}</b> · projection variance along PC1 (computed from the data) = <b>{pv}</b>, matching λ₁ to floating-point precision',
    s5hint: 'Why does the max-variance direction deserve to be “principal”? Because the data spreads widest along it and carries the most information there; discarding the small perpendicular variance loses the least. Photo compression, face recognition (eigenfaces), financial risk factors — all run on this step’s covariance eigendecomposition.',
    cv5pc1: 'PC1 (λ₁)',
    cv5pc2: 'PC2 (λ₂)',
    cv5axis: 'your axis',

    s6k: 'Step 6 · Finale',
    s6t: 'The steady state: the λ = 1 eigenvector, and Google’s starting point',
    s6e: 'Final stop: a tiny four-node web — A, B, C, D pointing arrows at each other. Imagine a crowd standing on the nodes; at every step each person walks along an outgoing arrow, <strong>chosen uniformly at random</strong>. That is a Markov chain. Its transition matrix M has, in each column, the probabilities of leaving that column’s node for each row — so <strong>every column sums to exactly 1</strong> (nobody vanishes). Start from any distribution and keep multiplying by M: the distribution shifts, then <strong>freezes</strong> — and a frozen distribution π satisfies Mπ = π: it is an eigenvector of M with eigenvalue exactly λ = 1. Switch the initial distribution and run again: wildly different starts, identical finish. Google’s PageRank treats the whole web as this graph, and the steady distribution is the ranking (real PageRank adds damping: at each step a 0.15 chance of teleporting to a random page, π ← 0.85·Mπ + 0.15/N, to guarantee convergence; this little web is reachable and aperiodic, so it converges undamped).',
    s6formula: 'π ← Mπ, steady state Mπ* = π* — the eigenvector for λ = 1',
    s6step: 'One step', s6play: 'Play', s6pause: 'Pause', s6run: 'Run 80 steps', s6reset: 'Back to uniform',
    s6initLab: 'Initial distribution:',
    s6iUni: 'Uniform', s6iA: 'All on A', s6iD: 'All on D', s6iRand: 'Random',
    s6ro: 'step k = <span>{k}</span> · distribution (A, B, C, D) = <span>{dist}</span> · L1 distance to steady state = <span>{d}</span>',
    s6steady: 'Steady state π* = ({dist}) — in theory exactly (2/9, 1/9, 4/9, 2/9): C, pointed to from three places, is the most popular, matching the independent linear-system solve (error < 10⁻¹²). From any start, power iteration returns here.',
    s6colsum: 'Column sums of M: {sums} (each exactly 1 — total mass is conserved, so an invariant distribution with λ = 1 must exist)',
    s6cardsH: 'One λ, three faces',
    c1h: 'PageRank: the steady state is the ranking',
    c1: 'Treat pages as nodes and links as arrows, and PageRank is the λ = 1 eigenvector of that giant graph: the page with the largest steady-state share is the most important. It is computed by Step 3’s power iteration — multiply until nothing moves.',
    c2h: 'Vibration modes: eigenfrequencies',
    c2: 'In the vibration equations of bridges and buildings, eigenvectors are the <strong>mode shapes</strong> (relative sway of each part) and eigenvalues give the <strong>natural frequencies</strong>. Resonance avoidance and seismic design are, at bottom, eigenvalue problems.',
    c3h: 'Stability: back to the unit circle',
    c3: 'A discrete system x ← Ax is stable ⟺ every eigenvalue satisfies |λ| < 1 — the same sentence as the Z-Transform page’s “poles inside the unit circle”: the system matrix’s eigenvalues ARE the poles. Link: <a class="fourier-link" href="../ztransform/#step3">The Z-Transform</a>.',
    s6fin: 'From the circle-squeezing machine to Google’s ranking, there is only one question in between: <strong>“which direction refuses to be turned?”</strong> Eigenvectors are a matrix’s skeleton — once you see the skeleton, stretching, rotation, vibration, the shape of data and the steady state of a network are all the same story told in different accents.',
    s6lkGd: 'The canyon itself: the condition number sets the zig-zag →', s6lkKal: 'Covariance’s principal directions: Kalman’s 2-D step →',
    cv6from: 'weights shown as node sizes'
  }
};

/* 语言机制（与全站一致） */
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
