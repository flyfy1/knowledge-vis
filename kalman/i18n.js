'use strict';
/* ============================================================
   卡尔曼滤波讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '卡尔曼滤波 · 怎样结合预测与测量 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '卡尔曼滤波 · 用测量修正预测',
    tagline: '手机定位会抖动，我们却想知道人实际在哪。卡尔曼滤波先用运动模型预测位置，再用传感器的新测量修正预测。模型是对运动规律的简化描述；预测和测量各可能偏多少，决定修正多少。本页用可重复生成的模拟数据演示这个过程。',
    nav0: '0 从抖动读数估位置', nav1: '1 直接测量与平均', nav2: '2 预测—更新', nav3: '3 调整 Q 与 R',
    nav4: '4 权重何时稳定', nav5: '5 同时估位置与速度', nav6: '6 原理与应用',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 卡尔曼滤波 Kalman Filter —— 一步一交互系列',
    lgTruth: '真实位置', lgMeas: '测量（十字标）', lgEst: '卡尔曼估计', lgMa: '滑动平均', lgRaw: '原始测量',

    s0k: '第 0 步 · 从测量估位置',
    s0t: '读数在抖，实际位置在哪里？',
    s0e: '这一步要回答：<strong>带误差的测量，能帮我们更准地估计位置吗？</strong>一个点沿直线移动。图的横轴是时间步，纵轴是位置；十字标是每次测到的位置。测量会随机偏离真实位置，这种随机误差叫噪声。先猜真实位置随时间怎样变化，再点「运行卡尔曼」。最后点「揭晓真实位置」，比较估计和真值。手机定位也要处理类似问题，但实际系统更复杂。',
    s0run: '运行卡尔曼', s0reveal: '揭晓真实位置', s0reset: '重置',
    s0ro0: '尚未运行。十字标是位置测量，真实位置暂未显示。噪声 σ = 1.0；σ 是标准差，表示随机误差的典型大小，不是误差上限。',
    s0roRun: '青色估计线已生成。点「揭晓真实位置」，比较 RMSE（均方根误差）：把每次误差平方、求平均，再开平方；它与位置同单位，越小越准。',
    s0roDone: '这批 90 个点的 RMSE：原始测量 = <span>{rm}</span> · 卡尔曼估计 = <span>{rk}</span>。估计的 RMSE 约为原始测量的 {pct}%。这是本批数据的结果；第 2 步解释怎样算出估计。',
    s0hint: '本场景的数据这样生成：真实位置每步加一个随机扰动（σ = 0.25），称为随机游走；第 45 步另加一次 +3 的突变。测量 = 真值 + 高斯噪声（σ = 1.0）；高斯噪声通常偏得少，偶尔偏得多，正负对称。随机数种子为 7，即固定生成起点，重跑可得同一批数据。第 0 步设 Q = 0.0625、R = 1：Q 是模型每步未能预测的扰动方差，R 是测量误差方差。方差是标准差的平方。这些参数匹配随机噪声，但模型未预知那次突变；第 3 步会换场景调参数。',

    s1k: '第 1 步 · 比较两种简单方法',
    s1t: '取平均以后，为什么还会跟不上？',
    s1e: '这一步要回答：<strong>直接用测量，和先取平均，各有什么代价？</strong>仍看上一批数据。直接用测量，能立刻反映变化，也会保留全部测量噪声。滑动平均是取最近 W 个测量的平均值：随机误差能相互抵消一些，但旧位置也会混进结果。第 45 步突变后，窗口要经过 W 步才完全换成突变后的测量。窗口装满后，每个测量的权重都是 1/W；开始时数据不足，就对已有测量取平均。',
    s1wLab: 'W · 平均最近多少个测量',
    s1showRaw: '原始测量（连线）', s1showMa: '滑动平均', s1showKf: '卡尔曼估计',
    s1ro: '同一批数据的位置 RMSE（越小越准）：原始测量 = <span>{rr}</span> · 滑动平均（W = {w}）= <span>{rm}</span> · 卡尔曼估计 = <span>{rk}</span>',
    s1hint: '先增大 W，观察曲线是否更平滑，以及第 45 步之后是否更慢跟上。再减小 W，对照 RMSE 读数。平滑程度和准确程度要分开看；不同 W 可能改变方法的排名。卡尔曼用预测与测量各自的不确定度计算新测量的权重，下一步会拆开这个计算；权重也可能逐渐稳定。',

    s2k: '第 2 步 · 预测—更新',
    s2t: '新测量来了，预测该改多少？',
    s2e: '这一步要回答：<strong>拿到新测量后，位置估计该改多少？</strong>滤波器保存位置估计 x̂，以及估计误差的方差 P；P 越大，表示它认为估计越不确定。图中的高斯曲线是钟形的，横轴是可能的位置，曲线越高表示附近的位置越可能；中心是 x̂，宽度由标准差 √P 决定。<strong>先预测：</strong>本模型假设下一位置平均不变，所以 x̂⁻ 沿用 x̂，但 P 要加上扰动方差 Q；上标 ⁻ 表示尚未用新测量。<strong>再更新：</strong>z 是新测量，R 是它的误差方差。K 叫卡尔曼增益，表示朝 z 修正多大比例。更新后的估计称为后验，供下一轮继续预测。下面用 Q = 0.0625、R = 1，与第 0 步相同。公式依次回答：预测是什么、修正比例多大、更新后得到什么。',
    s2formula: '预测：x̂⁻ = x̂ ， P⁻ = P + Q ｜ 增益：K = P⁻ / (P⁻ + R) ｜ 更新：x̂ = x̂⁻ + K·(z − x̂⁻) ， P = (1 − K)·P⁻',
    s2nextPred: '预测一步 →', s2nextUpd: '用测量更新 →', s2play: '连播 10 步', s2stop: '停', s2reset: '重置',
    s2roInit: '初始位置估计取第一个测量：x̂ = z[0] = <span>{x0}</span>。初始误差方差 P₀ = 1；下标 ₀ 表示起点。点「预测一步」，开始第 1 步。',
    s2roPred: '第 {k} 步预测：位置估计仍为 x̂⁻ = <span>{xp}</span>；误差方差增至 P⁻ = P + Q = <span>{pp}</span>，对应标准差 √P⁻ = {sp}。青色曲线是预测，灰色是上次更新后的估计。点「用测量更新」，加入 z[{k}]。',
    s2roUpd: '这次修正多少？K = P⁻ / (P⁻ + R) = <span>{K}</span>。测量与预测的差（残差）z − x̂⁻ = <span>{res}</span>。修正后 x̂ = <span>{x}</span>；误差方差降为 P = (1 − K)·P⁻ = <span>{p}</span>。绿色是更新后的分布；橙色以测量 z = {z} 为中心，表示不同位置对这次测量的支持程度，宽度由 R 决定。更新把估计沿预测与测量之差移动了约 {kpct}%。',
    s2roDone: '已到最后一步（k = {k}）。点「重置」可重新逐步查看预测与更新。',
    cvPost: '上次更新后的估计', cvPred: '预测分布', cvMeasBell: '测量支持曲线（R）', cvPostNew: '更新后的估计',
    s2hint: '先点一次预测，再点一次更新，比较曲线中心和宽度。本页这个模型在预测时增加 P，在更新时减小 P。P⁻ 越大，固定 R 下 K 越大；R 越大，固定 P⁻ 下 K 越小。但 P 是按模型计算的不确定度，不是实际误差的实时测量：即使真实位置突然跳变，它也不会因此自动增大。下一步可调 Q、R，查看参数怎样影响结果。',

    s3k: '第 3 步 · 调整 Q 与 R',
    s3t: 'Q 与 R 怎样改变修正幅度？',
    s3e: '这一步要回答：<strong>怎样设定对预测和测量的信任，才能既跟上变化又少抖动？</strong>换一个模拟场景：真实位置缓慢随机变化（每步扰动 σ = 0.05），第 40 步突然增加 +4；灰虚线标出突变时刻，测量噪声 σ = 1。数据不随滑块改变。滑块只改滤波器的假设：<strong>Q</strong> 是模型每步未能预测的扰动方差，<strong>R</strong> 是测量误差方差。除 RMSE 外，再看两个恢复指标：<strong>进入步数</strong>是首次满足估计与真值相差不超过 ±0.5 时，距突变已过的步数；<strong>带内占比</strong>是从突变当步起，误差在此范围内的步数占比。前者越小越快，后者越大越稳。',
    s3qLab: 'Q · 每步未预测扰动的方差', s3rLab: 'R · 测量误差的方差',
    s3kLab: '长期稳定后的增益 K：估计朝新测量移动的距离，占预测与测量之差的比例。<br>当前 Q、R 固定不变时，这个比例会逐渐稳定，称为稳态。本图从 P₀ = 1 开始，最初的 K 与这里显示的稳态值略有不同；第 4 步解释原因。',
    s3ro: '当前 Q、R 的结果：位置 RMSE = <span>{rk}</span> · 进入步数 = <span>{entry}</span> · 带内占比 = <span>{share}</span> · 原始测量 RMSE = <span>{rr}</span>（RMSE 越小越准）',
    s3roNever: '始终没进入',
    s3miniK: '稳态 K = {K}',
    s3roFmt: '进入步数 {entry} · 带内占比 {share}',
    s3pModel: '偏重模型预测', s3pBalanced: '折中设置', s3pMeas: '偏重新测量',
    s3miniRo: 'Q = {q}，R = {r} · 稳态 K = <b>{k}</b> · 位置 RMSE <b>{rmse}</b> · 进入步数 <b>{entry}</b> · 带内占比 <b>{share}</b>',
    s3hint: '先选三档预设，比较下方固定参数的小图。左档 K 小，修正慢，在这批数据中 RMSE 比原始测量还大。右档 1 步进入误差带，但只有约一半时间留在带内：反应快，也更容易跟着测量噪声抖。中档进入较慢，却在带内停留最久，RMSE 最小。再拖滑块，只改变 Q 或 R，观察主图与 K。<strong>这里的排名只适用于本场景</strong>；参数应依据模型遗漏的变化和传感器误差来估计，再用数据检验。',
    cvJump: '位置突变（第 40 步）',

    s4k: '第 4 步 · 稳态',
    s4t: '为什么修正比例会逐渐稳定？',
    s4e: '这一步要回答：<strong>Q、R 一直不变时，K 会怎样变化？</strong>本例跑 300 步，Q = 0.04、R = 2。上图比较两种初始方差 P₀：初值不同，但更新后的 P 都逐渐接近同一个值，这叫收敛；稳定后的值称为固定点。原因是本模型的 P 只由上一步的 P、Q、R 计算，不使用测量值。固定点满足 P = (P + Q)·R / (P + Q + R)：意思是更新一轮后 P 仍不变。这是本例的代数 Riccati 方程，虚线标出它的解。上图纵轴按倍数分隔，等距不代表等差。',
    s4ro1: '稳定值（* 表示稳态）：P* = <span>{pss}</span>，K* = <span>{kss}</span>。300 步后，P₀ = 10 得到 <span>{p1}</span>，P₀ = 0.01 得到 <span>{p2}</span>；差值 <span>{dp}</span>。将 P* 代回方程，两边差 <span>{res}</span>；微小差异来自计算机有限精度。',
    s4ro2: '下图回答：稳定后的卡尔曼估计，能否用固定比例修正来复现？指数平滑就是每次都按同一比例 α 修正：y ← y + α(z − y)，y 是平滑后的估计。第 250 步让它从卡尔曼当前估计开始，设 α = K*；此后 50 步逐点最大差 = <span>{md}</span>。两者起点相同、输入相同，且本次计算中 K 已稳定到与 K* 相同的计算精度，因此曲线重合；不代表两种方法从任意起点都相同。',
    s4hint: '对比两张图：上图说明 P 和 K 在本例中趋于稳定，下图说明固定 K 后的位置更新就是指数平滑。稳定的 α 可以由 Q、R 算出，不必只靠试调。这个结论针对本页的一维随机游走模型；其他运动模型未必等价于这种平滑器。<strong>真实运动突然变化，不会自动改变这里的 P 或 K</strong>；要改变它们，需要调整模型、Q、R，或改变可用测量。下一步换成同时预测位置和速度的模型。',
    cvP10: 'P[k]（P₀ = 10）', cvP001: 'P[k]（P₀ = 0.01）', cvPss: '稳定方差 P*', cvEqK: '卡尔曼（继续递推）', cvEqS: '指数平滑（α = K*）',

    s5k: '第 5 步 · 同时估位置与速度',
    s5t: '只测位置，怎样估出速度？',
    s5e: '这一步要回答：<strong>只测位置，能否同时估计速度？</strong>小车仍沿直线移动；这里的“二维”指状态有 [位置, 速度] 两个分量，不是平面运动。状态就是想追踪的一组量。传感器<strong>只测位置</strong>（十字标，噪声标准差 σ = 1.2）。模型暂按匀速预测：用当前位置加上速度乘以时间间隔，得到下一位置。连续位置读数能约束速度，所以修正位置时也能修正速度。这里 dt = 1，表示每步的时间间隔；速度先恒定，在第 60 步反向，随后再提速。阴影标出运动发生改变的一段。下方矩阵是把这套预测与测量关系写成数字表，不需要先掌握矩阵运算。',
    s5matNote: '矩阵读法：F 用当前位置和速度预测下一状态；H 只取位置，与传感器对应。Q 记录模型未预测的扰动，q 控制其强度；R 是位置测量误差方差。这里 P 扩展成协方差矩阵：对角项分别是位置和速度误差的方差，非对角项表示两种误差的关联。',
    s5symNote: '实现补充：为避免计算机舍入误差破坏对称性，每次更新后用 (P + Pᵀ)/2 替换 P；Pᵀ 表示把行列互换。原始不对称量全程 ≤ 1.7e-16，是极小的数值误差，不是位置或速度的误差。',
    s5manOn: '改变速度：开（反向 + 加速）', s5manOff: '改变速度：关（全程匀速）',
    s5eOff: '这一步要回答：<strong>只测位置，能否同时估计速度？</strong>小车沿直线移动，状态 [位置, 速度] 是要追踪的两个量；“二维”指这两个分量。传感器<strong>只测位置</strong>（噪声标准差 σ = 1.2）。匀速模型用当前位置加上速度乘以时间间隔，预测下一位置；连续位置读数也能约束速度。<strong>速度变化已关闭</strong>：小车全程速度为 0.35，符合匀速假设。测量噪声与开启时是同一种子生成的同一串，只改变真实运动。切换按钮可比较模型符合或不符合运动时的表现。下方矩阵记录预测与测量关系；dt = 1 是每步的时间间隔。',
    s5roOff: '全程位置 RMSE = <span>{rp}</span> · 全程速度 RMSE = <span>{rv}</span>（速度只由位置读数推断）。最后一步的协方差矩阵 P = [[{p00}, {p01}], [{p01}, {p11}]]；它表示模型计算的不确定度。全程矩阵对称、对角项为正；逐步值可经 window.KALMAN 查。',
    s5hintOff: '全程匀速时，小 q 这一档在本场景里最准确，因为它的假设更符合实际运动。再打开速度变化：真速度在第 60、110 步改变，匀速模型无法提前知道，估计需要靠后续位置测量追上。两种模式的噪声相同，适合比较模型失配的影响；模型失配就是假设的运动规律与实际不符。',
    s5qLab: 'q · 模型未预测扰动的强度',
    s5pSmall: 'q = 0.0005 · 少允许速度变化', s5pMid: 'q = 0.02 · 中等扰动强度', s5pBig: 'q = 0.2 · 多允许速度变化',
    s5ro: '全程位置 RMSE = <span>{rp}</span> · 全程速度 RMSE = <span>{rv}</span>（速度只由位置读数推断）。第 60–80 步最大位置误差 = <span>{mx}</span>。最后一步的协方差矩阵 P = [[{p00}, {p01}], [{p01}, {p11}]]；它表示模型计算的不确定度，不是上面的实际误差。全程矩阵对称、对角项为正；逐步值可经 window.KALMAN 查。',
    s5hint: '先比较三档 q，再关闭速度变化，看看排名是否改变。在速度变化开启的本批数据中，q 太小会让滤波器修正速度较慢，反向后位置误差可超过 2；q 太大则让测量噪声引起更大的估计波动。中档总误差较小。q 不会改变小车的真实运动，只改变滤波器允许模型出错的程度；应根据实际运动偏离匀速假设的程度估计，并用数据检验。',
    cvPos: '位置', cvVel: '速度', lgPosTrue: '真位置', lgPosEst: '估计位置', cvMan: '速度变化段（第 60–110 步）', lgVelTrue: '真速度', lgVelEst: '估计速度',

    s6k: '第 6 步 · 终章',
    s6t: '这套更新为什么成立，又能用在哪里？',
    s6e: '这一步要回答：<strong>前面的加权有何依据，怎样接到真实应用？</strong>先看贝叶斯更新：用新证据修正已有判断。预测分布叫先验；似然表示不同真实位置对这次测量的支持程度；结合两者得到的分布叫后验。先验和测量误差都是高斯、且误差独立时，第 2 步的更新均值就是按精度加权的结果。精度是 1/方差：方差越小，权重越大。本站贝叶斯页用离散的二元假设展示相同的更新思想，无需先读过。再看控制：例如先估计小车位置和速度，再据此决定加速或刹车。在线性模型、二次代价和高斯噪声等条件下，卡尔曼估计可与最优控制组成 LQG（线性二次高斯控制）；二次代价指用误差和控制量的平方衡量代价。',
    s6card1T: '阿波罗导航',
    s6card1: '在 1960 年代的阿波罗导航中，卡尔曼滤波的扩展形式用于估计飞船运动。做法与本页相通：先用运动模型预测位置和速度，再用带误差的观测修正估计。航天器运动更复杂，需要更完整的模型。',
    s6card2T: '手机与传感器融合',
    s6card2: '手机定位可结合 GPS 位置与惯性传感器信息：加速度计测加速度，陀螺仪测转动。把不同传感器的信息结合起来，叫传感器融合。卡尔曼类方法可先用运动信息预测，再用位置测量修正，并根据各自误差分配权重。地图蓝点还可能经过道路匹配等处理，不能仅凭它的平滑程度判断用了哪种算法。',
    s6card3T: '非线性世界',
    s6card3: '汽车转弯时，运动关系可能不再是本页这样简单的线性关系；线性指输出是输入的加权和，曲线关系则可能是非线性的。常见扩展有：扩展卡尔曼滤波 EKF，在当前估计附近用线性关系近似；无迹卡尔曼滤波 UKF，让一组有代表性的点通过非线性模型；粒子滤波，用许多候选状态及其权重近似分布，并按观测调整权重。它们都有各自的近似和代价。在线性、高斯且模型与噪声假设正确时，标准卡尔曼滤波给出最小均方误差估计。异常测量、错误模型仍可能让实际结果很差。',
    s6fin: '回到最初的定位问题：<strong>先预测位置，再按不确定度用测量修正，重复进行。</strong>本页用模拟真值检查估计是否准确；实际定位通常没有这样的答案可对照。P 报告的是模型计算的不确定度，参数或模型不合适时，它也可能过于自信。手机在高楼间定位跳动，可能涉及信号反射等多种原因，不能据此断定 P 正在增大。读算法的输出时，要同时问：估计是什么、假设是什么、实际误差如何验证。',
    s6lkB: '贝叶斯更新：怎样用证据修正判断 →', s6lkC: '反馈与控制：怎样根据估计调整行动 →', s6lkL: '冲激与 LTI：线性时不变系统 →'
  },
  en: {
    docTitle: 'Kalman Filter · Combining Predictions and Measurements · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Kalman Filter · Correcting Predictions with Measurements',
    tagline: 'A phone reports a jittery location. How can we estimate where its user actually is? A Kalman filter predicts a position using a motion model, then corrects it with a new sensor reading. The model is a simplified description of how motion works. The correction depends on how uncertain the prediction and the reading are. This page uses reproducible simulated data.',
    nav0: '0 Estimate a Position', nav1: '1 Readings vs. Averages', nav2: '2 Predict–Update', nav3: '3 Adjust Q and R',
    nav4: '4 When Weights Settle', nav5: '5 Position and Velocity', nav6: '6 Principles and Uses',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Kalman Filter — one interaction per step',
    lgTruth: 'True position', lgMeas: 'Measurements (crosses)', lgEst: 'Kalman estimate', lgMa: 'Moving average', lgRaw: 'Raw measurements',

    s0k: 'Step 0 · Estimate a Position',
    s0t: 'The readings jitter. Where is the object?',
    s0e: 'The question: <strong>can noisy readings give us a better estimate of position?</strong> An object moves along a straight line. The horizontal axis shows time steps; the vertical axis shows position. Each cross is a sensor reading. Readings differ randomly from the true position; this random error is called noise. Guess how the position changes, then press “Run the Kalman filter”. Reveal the true position to check the estimate. Phone navigation faces a similar, more complex problem.',
    s0run: 'Run the Kalman filter', s0reveal: 'Reveal the true position', s0reset: 'Reset',
    s0ro0: 'Not run yet. The crosses are position readings; the true positions are hidden. Noise σ = 1.0. Here σ is the standard deviation: a measure of typical error size, not a maximum error.',
    s0roRun: 'The cyan estimate is ready. Reveal the true position to compare RMSE (root mean square error): square each error, average the squares, then take the square root. It has the same units as position; smaller is better.',
    s0roDone: 'RMSE over the same 90 points: raw readings = <span>{rm}</span> · Kalman estimate = <span>{rk}</span>. The estimate has about {pct}% of the raw readings’ RMSE. This result applies to this dataset. Step 2 shows how the estimate is calculated.',
    s0hint: 'For this scene, each true position is the previous one plus a random change (σ = 0.25): a random walk. At step 45, an extra +3 jump is added. Each measurement is truth plus Gaussian noise (σ = 1.0): small errors are more common than large ones, with positive and negative errors equally likely. Seed 7 fixes the random generator’s starting point so the data can be reproduced. The step-0 filter uses Q = 0.0625 and R = 1. Q is the variance of the change the model cannot predict; R is the measurement-error variance. Variance is standard deviation squared. These settings match the random noise, but do not anticipate the jump. Step 3 uses a different scene to explore tuning.',

    s1k: 'Step 1 · Compare Two Simple Methods',
    s1t: 'Why can an average lag behind?',
    s1e: 'The question: <strong>what do we gain and lose by averaging the readings?</strong> Use the same data as before. A raw reading responds immediately to a change, but includes all the sensor noise. A moving average takes the mean of the latest W readings. Some random errors cancel, but older positions remain in the result. After the jump at step 45, it takes W steps for the window to contain only readings from after the jump. Once the window is full, each reading has weight 1/W; at the start, we average the readings available.',
    s1wLab: 'W · number of recent readings to average',
    s1showRaw: 'Raw measurements (connected)', s1showMa: 'Moving average', s1showKf: 'Kalman estimate',
    s1ro: 'Position RMSE on the same data (smaller is better): raw readings = <span>{rr}</span> · moving average (W = {w}) = <span>{rm}</span> · Kalman estimate = <span>{rk}</span>',
    s1hint: 'Increase W and look for less jitter and a slower response after step 45. Then reduce W and compare the RMSE values. Judge smoothness and accuracy separately; changing W can change which method ranks best. A Kalman filter calculates the new reading’s weight from prediction and measurement uncertainty. We unpack that calculation next. The weight can also settle to a constant.',

    s2k: 'Step 2 · Predict–Update',
    s2t: 'How much should a new reading change the prediction?',
    s2e: 'The question: <strong>how much should a new reading change our position estimate?</strong> The filter stores an estimate x̂ and an error variance P. A larger P means the filter considers its estimate less certain. Each Gaussian curve is bell-shaped: its horizontal axis is possible position, and a higher curve means nearby positions are more likely. Its centre is x̂ and its width is set by the standard deviation √P. <strong>Predict:</strong> this model assumes no average change in position, so x̂⁻ stays at x̂ while P grows by the disturbance variance Q. The superscript ⁻ means “before using the new reading”. <strong>Update:</strong> z is the new reading and R its error variance. The Kalman gain K is the fraction of the gap to z that we correct. The updated estimate, called the posterior, feeds the next prediction. We use Q = 0.0625 and R = 1, as in step 0. The formulas give the prediction, the correction fraction, and the updated result, in that order.',
    s2formula: 'Predict: x̂⁻ = x̂ , P⁻ = P + Q ｜ Gain: K = P⁻ / (P⁻ + R) ｜ Update: x̂ = x̂⁻ + K·(z − x̂⁻) , P = (1 − K)·P⁻',
    s2nextPred: 'Predict one step →', s2nextUpd: 'Update with the measurement →', s2play: 'Play 10 steps', s2stop: 'Stop', s2reset: 'Reset',
    s2roInit: 'Start with the first reading as the position estimate: x̂ = z[0] = <span>{x0}</span>. The initial error variance is P₀ = 1; the subscript ₀ marks the starting value. Press “Predict one step” to begin step 1.',
    s2roPred: 'Prediction for step {k}: the position estimate stays at x̂⁻ = <span>{xp}</span>. Error variance grows to P⁻ = P + Q = <span>{pp}</span>, giving standard deviation √P⁻ = {sp}. Cyan is the prediction; grey is the previous updated estimate. Press “Update with the measurement” to use z[{k}].',
    s2roUpd: 'How far do we correct? K = P⁻ / (P⁻ + R) = <span>{K}</span>. The measurement minus the prediction, called the innovation, is z − x̂⁻ = <span>{res}</span>. The corrected estimate is x̂ = <span>{x}</span>. Error variance falls to P = (1 − K)·P⁻ = <span>{p}</span>. Green is the updated distribution. The estimate moves about {kpct}% of the gap from prediction to reading. Orange is centred on the reading z = {z}: it shows how well each possible position explains this reading, with width set by R.',
    s2roDone: 'Last step reached (k = {k}). Press “Reset” to inspect prediction and update again.',
    cvPost: 'Previous updated estimate', cvPred: 'Predicted distribution', cvMeasBell: 'Measurement likelihood (R)', cvPostNew: 'Updated estimate',
    s2hint: 'Click once to predict, then once to update. Compare the curve centres and widths. In this model, prediction increases P and an update reduces it. With R fixed, a larger P⁻ gives a larger K. With P⁻ fixed, a larger R gives a smaller K. But P is uncertainty calculated from the model, not a live measurement of actual error. A surprise jump in the true position does not automatically increase P. Next, adjust Q and R to see how the settings affect the result.',

    s3k: 'Step 3 · Adjust Q and R',
    s3t: 'How do Q and R change the correction?',
    s3e: 'The question: <strong>how can we follow a change without following every bit of noise?</strong> This is a new simulated scene. The true position drifts slowly (per-step disturbance σ = 0.05), then jumps by +4 at step 40, marked by the grey dashed line. Measurement noise is σ = 1. The sliders leave the data unchanged; they change the filter’s assumptions. <strong>Q</strong> is the variance of changes the model cannot predict; <strong>R</strong> is the measurement-error variance. Alongside RMSE, compare two recovery measures. <strong>Entry steps</strong> counts elapsed steps from the jump until the estimate first lies within ±0.5 of the truth. <strong>In-band share</strong> is the fraction of steps, starting with the jump itself, that stay in that range. A smaller entry count means a faster response; a larger share means more time close to the truth.',
    s3qLab: 'Q · variance of unpredicted changes', s3rLab: 'R · measurement-error variance',
    s3kLab: 'Steady-state gain K: the fraction of the gap from prediction to new reading that the estimate moves.<br>With Q and R fixed, this fraction settles over time: its steady state. This run starts at P₀ = 1, so its early gains differ slightly from the steady value shown here. Step 4 explains why.',
    s3ro: 'Results for the current Q and R: position RMSE = <span>{rk}</span> · entry steps = <span>{entry}</span> · in-band share = <span>{share}</span> · raw-reading RMSE = <span>{rr}</span> (smaller RMSE is better)',
    s3roNever: 'never entered',
    s3miniK: 'steady K = {K}',
    s3roFmt: 'entry steps: {entry} · in-band {share}',
    s3pModel: 'Favour the prediction', s3pBalanced: 'Middle setting', s3pMeas: 'Favour new readings',
    s3miniRo: 'Q = {q}, R = {r} · steady K = <b>{k}</b> · position RMSE <b>{rmse}</b> · entry steps <b>{entry}</b> · in-band share <b>{share}</b>',
    s3hint: 'Select each preset and compare the fixed examples below. The left setting has a small K and corrects slowly; on these data, its RMSE exceeds the raw readings’ RMSE. The right setting enters the error band in 1 step but stays there only about half the time: it responds quickly and follows more sensor noise. The middle setting enters more slowly, but spends the most time in the band and has the lowest RMSE. Now change only Q or only R and watch the main plot and K. <strong>This ranking belongs to this scene.</strong> Estimate the parameters from unmodelled motion and sensor errors, then check them against data.',
    cvJump: 'Position jump (step 40)',

    s4k: 'Step 4 · Steady State',
    s4t: 'Why does the correction fraction settle?',
    s4e: 'The question: <strong>what happens to K when Q and R stay fixed?</strong> Run this example for 300 steps with Q = 0.04 and R = 2. The upper plot compares different initial variances P₀. Both approach the same value: they converge to a fixed point. In this model, each P is calculated from the previous P, Q and R, without using the reading itself. At the fixed point, P = (P + Q)·R / (P + Q + R): another update leaves P unchanged. This is the algebraic Riccati equation for this example; the dashed line marks its solution. The vertical axis uses a logarithmic scale: equal distances represent equal ratios, not equal differences.',
    s4ro1: 'Steady values (* marks steady state): P* = <span>{pss}</span>, K* = <span>{kss}</span>. After 300 steps, P₀ = 10 gives <span>{p1}</span> and P₀ = 0.01 gives <span>{p2}</span>; the difference is <span>{dp}</span>. Substituting P* into the equation leaves a difference of <span>{res}</span> between the two sides. Tiny differences reflect finite computer precision.',
    s4ro2: 'The lower plot asks: can a fixed correction fraction reproduce the settled Kalman estimate? Exponential smoothing always corrects by the same fraction α: y ← y + α(z − y), where y is the smoothed estimate. At step 250, start it from the Kalman estimate and set α = K*. The largest pointwise difference over the next 50 steps is <span>{md}</span>. Both methods start together and receive the same readings. In this run, K has settled to K* at computer precision, so the curves overlap. This does not make the methods identical from arbitrary starting points.',
    s4hint: 'Compare the plots. Above, P and K settle; below, updating position with a fixed K is exponential smoothing. Q and R determine the settled α. This equivalence applies to the one-dimensional random-walk model on this page; other motion models need not reduce to this smoother. <strong>A sudden change in real motion does not automatically change P or K here.</strong> Those change when the model, Q, R or available measurements change. Next we use a model that predicts both position and velocity.',
    cvP10: 'P[k] (P₀ = 10)', cvP001: 'P[k] (P₀ = 0.01)', cvPss: 'Steady error variance P*', cvEqK: 'Kalman (recursion continues)', cvEqS: 'Exponential smoother (α = K*)',

    s5k: 'Step 5 · Estimate Position and Velocity',
    s5t: 'How can we estimate velocity from position readings alone?',
    s5e: 'The question: <strong>can we estimate velocity when the sensor measures only position?</strong> The cart still moves along a straight line. “Two-dimensional” means a state with two components, [position, velocity], rather than motion across a plane. A state is the set of quantities we want to track. The sensor <strong>measures position only</strong> (crosses; noise standard deviation σ = 1.2). The model predicts constant velocity: next position is current position plus velocity times elapsed time. Successive position readings constrain velocity, so a position correction can also correct the velocity estimate. Here dt = 1 is the time between steps. The cart starts at constant velocity, reverses at step 60, then speeds up later. The shading marks the changed-motion interval. The matrices below are tables that encode the prediction and measurement rules; you can follow the plots without knowing matrix arithmetic.',
    s5matNote: 'Reading the matrices: F predicts the next state from position and velocity. H selects position, matching the sensor. Q describes disturbances the model cannot predict, with strength set by q; R is the position-reading error variance. P is now a covariance matrix: its diagonal entries are the position- and velocity-error variances, and its off-diagonal entries describe how those errors vary together.',
    s5symNote: 'Implementation note: after each update, P is replaced by (P + Pᵀ)/2 to remove asymmetry from computer rounding; Pᵀ swaps rows and columns. Before this correction, the asymmetry stays at or below 1.7e-16 throughout the run. This tiny numerical discrepancy is not an error in position or velocity.',
    s5manOn: 'Velocity changes: on (reverse + speed up)', s5manOff: 'Velocity changes: off (constant velocity)',
    s5eOff: 'The question: <strong>can we estimate velocity from position readings alone?</strong> The cart moves along a line. Its state [position, velocity] contains the two quantities we track; this is the sense of “two-dimensional” here. The sensor <strong>measures position only</strong> (noise standard deviation σ = 1.2). The constant-velocity model predicts next position as current position plus velocity times elapsed time. Successive position readings also constrain velocity. <strong>Velocity changes are off:</strong> the cart travels at 0.35 throughout, matching the model’s assumption. Sensor noise is the same seeded sequence used with changes on; only the true motion differs. Toggle the buttons to compare when the model fits the motion and when it does not. The matrices below encode prediction and measurement; dt = 1 is the time between steps.',
    s5roOff: 'Position RMSE over the full run = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is inferred from position readings). Final error covariance P = [[{p00}, {p01}], [{p01}, {p11}]]. It describes uncertainty calculated by the model. All matrices are symmetric with positive diagonal entries; step-by-step values are available via window.KALMAN.',
    s5hintOff: 'With constant velocity throughout, the small-q preset is the most accurate here because its assumption fits the motion. Turn velocity changes back on: the true velocity changes at steps 60 and 110. The constant-velocity model cannot anticipate these changes and must catch up using later position readings. Both modes use the same noise, making them a useful comparison of model mismatch: the gap between assumed and actual motion.',
    s5qLab: 'q · strength of unmodelled disturbances',
    s5pSmall: 'q = 0.0005 · expect little velocity change', s5pMid: 'q = 0.02 · moderate disturbance strength', s5pBig: 'q = 0.2 · allow more velocity change',
    s5ro: 'Position RMSE over the full run = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is inferred from position readings). Largest position error during steps 60–80 = <span>{mx}</span>. Final error covariance P = [[{p00}, {p01}], [{p01}, {p11}]]. It describes uncertainty calculated by the model, rather than the actual errors above. All matrices are symmetric with positive diagonal entries; step-by-step values are available via window.KALMAN.',
    s5hint: 'Compare the three q presets, then turn velocity changes off and check whether their ranking changes. With changes on in this dataset, a small q makes velocity corrections slow; after the reversal, position error can exceed 2. A large q makes the estimate respond more strongly to sensor noise. The middle preset has lower overall error. q does not change the cart’s motion. It changes how much error the filter allows in its motion model. Estimate it from departures from constant velocity, then check against data.',
    cvPos: 'Position', cvVel: 'Velocity', lgPosTrue: 'True position', lgPosEst: 'Estimated position', cvMan: 'Changed-motion interval (steps 60–110)', lgVelTrue: 'True velocity', lgVelEst: 'Estimated velocity',

    s6k: 'Step 6 · Finale',
    s6t: 'Why does this update work, and where is it useful?',
    s6e: 'The question: <strong>what justifies this weighting, and how does it connect to real applications?</strong> Bayesian updating means revising an existing judgment using new evidence. The prediction distribution is the prior. The likelihood describes how well each possible true position explains the reading. Combining them gives the posterior. With a Gaussian prior and independent Gaussian measurement error, the updated mean in step 2 is a precision-weighted average. Precision is 1/variance, so a smaller variance gives more weight. The site’s Bayes page illustrates the same idea with discrete, binary hypotheses; no prior reading is needed here. For control, imagine using estimated cart position and velocity to decide when to accelerate or brake. With a linear model, quadratic costs and Gaussian noise, among other conditions, Kalman estimation can be combined with optimal control as LQG: linear-quadratic-Gaussian control. A quadratic cost penalises squared errors and control effort.',
    s6card1T: 'Apollo navigation',
    s6card1: 'In Apollo navigation in the 1960s, an extended form of Kalman filtering helped estimate spacecraft motion. The idea is the one explored here: predict position and velocity with a motion model, then correct the estimate with noisy observations. Spacecraft motion requires a more detailed model.',
    s6card2T: 'Phones & sensor fusion',
    s6card2: 'Phone navigation can combine GPS positions with inertial sensors: accelerometers measure acceleration, and gyroscopes measure rotation. Combining information from different sensors is called sensor fusion. Kalman-based methods can predict motion, correct it with position readings, and weight the information by its uncertainty. A map dot may also be adjusted to match nearby roads. Its smoothness alone does not reveal which algorithm produced it.',
    s6card3T: 'The nonlinear world',
    s6card3: 'A turning vehicle may need more than the simple linear relationships used here. A linear relationship expresses an output as a weighted sum of inputs; a curved relationship may be nonlinear. Common extensions include the extended Kalman filter (EKF), which uses a local linear approximation; the unscented Kalman filter (UKF), which passes representative points through the nonlinear model; and particle filters, which approximate a distribution with many candidate states and adjust their weights using observations. Each has approximation errors and computational costs. For a linear Gaussian system with correct model and noise assumptions, the standard Kalman filter gives the minimum mean-square-error estimate. Bad readings or a wrong model can still produce poor practical results.',
    s6fin: 'Return to the location problem: <strong>predict a position, correct it with a reading according to uncertainty, and repeat.</strong> Here, simulated truth lets us check accuracy. Real navigation rarely offers that answer key. P reports uncertainty calculated from the model; a poor model or poor parameters can make it overconfident. A phone location jumping between tall buildings may involve signal reflections or other problems. It does not tell us that P is growing. When reading an estimate, ask what it says, what it assumes, and how its error can be checked.',
    s6lkB: 'Bayesian updating: revise an estimate with evidence →', s6lkC: 'Feedback and control: act on an estimate →', s6lkL: 'Impulse and LTI: linear time-invariant systems →'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
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
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
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
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
