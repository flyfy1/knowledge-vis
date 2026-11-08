'use strict';
/* ============================================================
   梯度下降讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '梯度下降 · 摸黑下山 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '梯度下降 · 摸黑下山',
    tagline: '训练一个模型，说到底是在一片看不见的地形上摸黑下山：脚下的坡度（梯度）是你唯一的信息，步子（学习率）迈多大，决定你是走到谷底、原地打转，还是直接飞出去。所有神经网络的训练，剥到最底层就是这一页的循环——先亲手把步子迈飞一次，再一句句往回学。',
    nav0: '0 生死线', nav1: '1 二维地形', nav2: '2 峡谷', nav3: '3 动量',
    nav4: '4 随机梯度', nav5: '5 非凸地形', nav6: '6 终章 · 训模型',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 梯度下降 Gradient Descent —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '一颗球，一条步长生死线',
    s0e: '先把世界简化到只剩一条抛物线：f(x) = x²，谷底在 x = 0。球从 x = 2 出发，规矩只有一条：<strong>x ← x − η·f′(x)</strong>，其中 f′(x) = 2x 是脚下的坡度，η（学习率）是你迈步的胆量。η 太小，球一步步挪蹭；η = 0.5，一步正落谷底；再大一点，球开始在两壁之间横跳着收敛；η = 1，它在 ±2 之间永远弹下去；η 再大——当场飞出去。整个深度学习调来调去的，本质上就是这根滑杆。<strong>先把它玩到飞出去为止。</strong>',
    s0formula: 'xₙ₊₁ = xₙ − η·2xₙ = (1 − 2η)·xₙ',
    s0etaLab: 'η · 学习率（步长）',
    s0step: '迈一步', s0play: '连播', s0pause: '暂停', s0reset: '回到 x = 2',
    s0ro: '步数 n = <span>{n}</span> · x = <span>{x}</span> · |x| = <span>{ax}</span> · 每步乘子 (1 − 2η) = <span>{ratio}</span> · 状态：<b>{verdict}</b>',
    s0vMono: '单调收敛——每步都往谷底挪',
    s0vOne: '一步到位——η = 0.5 正中生死线',
    s0vOsc: '振荡收敛——横跳着逼近谷底',
    s0vStay: '原地振荡——η = 1，乘子 = −1，永远弹下去',
    s0vDiv: '发散——乘子绝对值 > 1，每步都离谷底更远',
    s0vDone: '已落谷底（x = 0）',
    s0divNote: '球已飞出画框：|x| 的真实量级是 10<sup>{k}</sup>（读数里是真值）。页面没有偷偷把球放回去——发散就是发散。',
    s0hint: '为什么分区恰好卡在 0.5 和 1？因为每步 x 都被乘上 (1 − 2η)：乘子在 (−1, 1) 里就收敛，正负号决定单调还是横跳，恰好 −1 就原地打转，出了 ±1 就爆炸。一维的全部命运，一个乘子说了算。后面的每一课，都是在跟这个乘子的高维版本打交道。',
    cv0clip: '球已飞出画框（真值见读数）',
    cv0valley: '谷底 x = 0',

    s1k: '第 1 步 · 二维地形',
    s1t: '梯度永远垂直于等高线',
    s1e: '地形升到二维：一个圆形碗 f(x, y) = ½(x² + y²)，等高线是一圈圈同心圆。<strong>在图上任意点一下放球</strong>，然后一步一步（或连播）看它下山。全场还画了梯度箭头场：每个采样点上的箭头指向 −∇f，也就是「此刻最陡的下坡方向」。盯住箭头和圆的交点看：箭头<strong>处处垂直穿过等高线</strong>，而且越靠近谷底箭头越短——坡度在变小。注意它不指向谷底的「方向情报」有多局限：梯度只告诉你脚下这一小步怎么迈最陡，谷底在哪，它一个字也不说；下山，是把无数次局部判断接成一条全局路径。',
    s1formula: 'f(x, y) = ½(x² + y²)，∇f = (x, y)，x ← x − η·∇f(x)',
    s1etaLab: 'η · 学习率',
    s1step: '迈一步', s1play: '连播', s1pause: '暂停', s1reset: '回到 (2.2, 1.6)',
    s1ro: '步数 n = <span>{n}</span> · 位置 (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · |∇f| = <span>{g}</span>{done}',
    s1done: ' · <b>已到底</b>——|∇f| 小于 10⁻⁶，坡度消失',
    s1hint: '为什么箭头必然垂直于等高线？沿等高线走，f 不变，所以梯度（f 增长最快的方向）与等高线方向点积为零——数学上是恒等式，图上是肉眼可见的直角。这个碗是「各向同性」的：哪个方向坡度都一样，球径直滚向谷底。下一站把碗拉长，麻烦就来了。',
    cv1click: '在图上点一下，把球放在任意位置',
    cv1grad: '箭头 = −∇f（最陡下坡）',

    s2k: '第 2 步 · 峡谷',
    s2t: '条件数决定之字形',
    s2e: '把碗沿一个方向拉长：f(x, y) = ½(x² + κy²)。κ 是<strong>条件数</strong>——地形最陡方向与最缓方向的坡度之比，也就是峡谷的「长宽比」。 <a class="fourier-link" href="../eigen/#step4">κ 的真身在特征值页：峡谷长宽比 = λ 之比 →</a> κ = 1 时还是圆碗；κ 拉大，碗变成一道峡谷：横穿峡谷的坡度极大、沿谷底的坡度极小。麻烦随之而来：步长 η 必须迁就最陡的方向（η < 2/λ<sub>max</sub> 才能不爆炸），于是沿谷底只能慢慢蹭；球在两壁之间横跳（之字形），蹭很久才到谷底。下面读数牌上的每个数字——步长上限、最优步长 η*、收敛率 (κ−1)/(κ+1)——都由地形的特征值 λ 算出，轨迹是当场真迭代的，实测步数和理论步数可以当面对账。',
    s2formula: 'f = ½xᵀAx，A = diag(1, κ)：λmin = 1，λmax = κ',
    s2kapLab: 'κ · 条件数（峡谷长宽比）',
    s2etaLab: 'η · 学习率',
    s2etaStar: 'η 取最优 η*',
    s2step: '迈一步', s2play: '连播', s2pause: '暂停', s2reset: '重置', s2runAll: '一键跑完',
    bdLam: 'λmin = {a} · λmax = {b}',
    bdEtaLim: '稳定上限 2/λmax = {v}',
    bdEtaStar: '最优 η* = 2/(λmin+λmax) = {v}',
    bdRate: '收敛率 (κ−1)/(κ+1) = {v}',
    bdTheory: '理论步数（η = η* 时；误差 → 1/1000）≈ {v}',
    bdMeas: '实测到达步数 = {v}',
    s2ro: '当前 n = <span>{n}</span> · 位置 (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · 状态：<b>{status}</b>',
    s2stRun: '下山中',
    s2stDone: '已到达 ε（‖x‖ ≤ ‖x₀‖/1000）',
    s2stDiv: '已发散——η 超过稳定上限，‖x‖ 冲过 10{supk}',
    s2hint: '理论步数的算式：每步误差最多乘以收敛率 (κ−1)/(κ+1)，所以把误差压到 1/1000 需要约 ln(1000) / ln(1/收敛率) 步。用了 η* 时两个方向的步乘子绝对值恰好相等，理论值和实测值会非常接近——这不是巧合，是 η* 的定义决定的。记住特征值这个词：它在这里先以「地形长宽比」的身份露面，下一页它就是主角。',

    s3k: '第 3 步 · 动量',
    s3t: '让球滚起来：动量',
    s3e: '还是第 2 步的峡谷、同一起点、同一个 η（两边都用 η*），唯一的差别：右边的球有了<strong>惯性</strong>。普通梯度下降每步只看脚下的坡；动量法把上一步的速度留住一部分（β）：<strong>v ← βv − η∇f(x)，x ← x + v</strong>。在峡谷里，横跳的方向每步正负翻转、互相抵消，沿谷底的方向每步同向、不断叠加——球冲过谷底摆两下，随后贴着谷底加速滑行。把 β 拉到 0.9 以上再看：惯性过头，球在谷底两边大幅摆动，反而更慢——动量是药，过量也是毒。',
    s3formula: 'v ← βv − η·∇f(x)，x ← x + v（β = 0 时退化为普通 GD）',
    s3kapLab: 'κ · 条件数',
    s3betaLab: 'β · 动量系数（0 = 普通 GD）',
    s3leftLab: '普通 GD（β = 0）',
    s3rightLab: '动量法（β = {beta}）',
    s3step: '迈一步', s3play: '连播', s3pause: '暂停', s3reset: '重置', s3runAll: '一键跑完',
    s3ro: '两边 η = η* = <span>{eta}</span>（相同）· 已走 <span>{n}</span> 步 · 普通 GD 到达 ε 用 <span>{gd}</span> 步 · 动量到达 ε 用 <span>{mo}</span> 步',
    s3na: '未到达',
    s3hint: '到达 ε 的口径和第 2 步相同：‖x‖ ≤ ‖x₀‖/1000。试着把 β 精确拨回 0：右边轨迹会和左边逐点重合——动量公式在 β = 0 时就是普通 GD，一个字都不差。真实训练里的动量常取 0.9，但那是和别的步长配套的结果；在这张峡谷图、用 η* 配套时，最佳 β 在 0.5 上下，图上看得一清二楚。',

    s4k: '第 4 步 · 随机梯度',
    s4t: '只看几条数据就迈步',
    s4e: '真实训练的数据多到每步都看完不现实。办法：每步只抽一小把样本（一个 batch），用它们的平均梯度迈步——这就是<strong>随机梯度下降（SGD）</strong>。 <a class="fourier-link" href="../montecarlo/#step2">小样本平均的误差按 1/√N 定价：蒙特卡洛的账 →</a> 左边是带种子固定的 {N} 条数据和两条拟合线（随右边参数同步）；右边是损失地形的等高线：青线是每步看全部数据的全批量 GD，光滑笔直；橙线是每步只看 batch 条数据的 SGD，走得歪歪扭扭。每个参数点上方画了两支箭头：青的是全量梯度（准星），橙的是这一步抽到的 batch 的梯度（偏的）——SGD 的每一步都迈得不准，但平均而言方向没错，而且步数便宜得多。把 batch 拉小，抖动变大；拉到全量，抖动消失、两条路径逐点重合。',
    s4formula: 'L(w, b) = (1/N)·Σᵢ (w·xᵢ + b − yᵢ)²，数据种子 = {seed}，N = {N}',
    s4batchLab: 'batch 大小（每步看几条）',
    s4bFull: '全量 {N}',
    s4step: '迈一步', s4play: '连播', s4pause: '暂停', s4reset: '重置',
    s4ro: '步数 k = <span>{k}</span> · 全批量 GD 的全量损失 L = <span>{lg}</span> · SGD 的全量损失 L = <span>{ls}</span> · 本步 batch 梯度与全量梯度的夹角 <span>{ang}°</span>',
    s4lastNote: '（已到末步：粉色箭头是产生这最后一步的那个批次——已无「下一步」可预告）',
    s4hint: '注意读数里的损失：两条路径报的都是「全量损失」（拿全部数据算的），所以可以直接比谁更低——SGD 前期靠步数便宜领先，后期在谷底附近抖着下不去，这正是实际训练里要把学习率逐渐调小（学习率衰减）的原因。还有一件事留到下一步：这种抖动不全是坏事——它能把你从不该停的地方抖出去。',
    cv4gd: '全批量 GD', cv4sgd: '小批量 SGD', cv4true: '全量梯度', cv4batch: 'batch 梯度',
    cv4fitG: '全量 GD 的线', cv4fitS: 'SGD 的线', cv4ols: '最优拟合（闭式解）',

    s5k: '第 5 步 · 非凸地形',
    s5t: '鞍点与假谷底：梯度为零 ≠ 到底了',
    s5e: '真实 AI 的地形不是碗。这张 f(x, y) = (x² − 1)² + y² + 0.3x 有<strong>两个深浅不同的谷</strong>（左谷更深）和一个<strong>鞍点</strong>：鞍点处梯度同样为零，但它只在一个方向上是谷底、另一个方向上是山脊——站在鞍点上，一边是下坡、一边也是下坡（沿山脊），只有横向是上坡。「梯度为零」在非凸世界里什么都不保证。换三个起点放球，看命运如何分岔；再看起点 C：它几乎正落在鞍点上（只偏右一丝），那里 |∇f| ≈ 0.002——没有噪声时，球只能靠这点残余坡度沿山脊磨蹭：默认 η 下要 34 步才滑下山脊、最后落进较浅的右谷；打开「一点噪声」（每步给梯度加 σ = 1.0 的高斯扰动——在别处只是小抖动，在鞍点附近却比梯度本身大几百倍），11 步就被抖下山脊，还落进了更深的左谷。下方读数会把两种模式各自的「离脊步数」按同一判据记下来对账——这正是上一步 SGD 的抖动在真实训练里的另一副面孔。图上的临界点标记都是页面解 ∇f = 0 解出来、再用 Hessian 符号验过类型的，不是手画的。',
    s5formula: 'f(x, y) = (x² − 1)² + y² + 0.3x，∇f = (4x³ − 4x + 0.3, 2y)',
    s5pLeft: '起点 A · 左谷外侧', s5pRight: '起点 B · 右谷外侧', s5pSaddle: '起点 C · 鞍点上',
    s5etaLab: 'η · 学习率',
    s5noiseLab: '一点噪声（每步给梯度加随机扰动）',
    s5step: '迈一步', s5play: '连播', s5pause: '暂停', s5reset: '回到当前起点',
    s5ro: '步数 n = <span>{n}</span> · 位置 (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · |∇f| = <span>{g}</span> · 状态：<b>{status}</b>',
    s5stGo: '下山中',
    s5stWellL: '停在左谷——更深的那个谷底',
    s5stWellR: '停在右谷——较浅的局部谷底（不是全局最优）',
    s5stWellNoiseL: '落进左谷——在谷底附近持续抖动（噪声还开着，不会静止）',
    s5stWellNoiseR: '落进右谷——在谷底附近持续抖动（噪声还开着，不会静止）',
    s5stSaddle: '在鞍点附近慢爬——梯度近零，但这里不是谷底',
    s5stDiv: '已发散（η 太大，飞出地形）',
    s5esc: '离脊步数（同一判据：|x − x<sub>鞍点</sub>| 首次 ≥ 0.5；起点 C、η = {eta}，跑过自动记录，改 η 后清零重记）：无噪声 <span>{plain}</span> · 噪声 <span>{noise}</span>',
    s5hint: '两个谷底的深度差来自 +0.3x 这一项：它把整张地形向左轻轻倾斜。没有它，两谷一样深，鞍点恰在 x = 0；有了它，鞍点位置、两谷深度都挪了位——图上的标记位置是公式解出来的，挪动公式它们就会跟着动。深度学习里没有人能把损失地形画出来，但「初始化决定落进哪个谷、噪声帮忙逃出鞍点」这两件事，每天都在真实训练里发生。',
    cv5minL: '深谷（局部极小）', cv5minR: '浅谷（局部极小）', cv5saddle: '鞍点', cv5start: '起点',

    s6k: '第 6 步 · 终章',
    s6t: '当场训一个模型',
    s6e: '收官：把前五步的东西全用上。数据集是两团带种子固定的点（{N} 个），模型是最简单的<strong>线性回归分类器</strong>：一条直线打分 ŷ = w₁x + w₂y + b 去拟合 0/1 标签，打分恰好 0.5 的那条线就是决策边界。直线转动靠的还是同一条规矩——算损失（均方误差）对参数的梯度，然后 θ ← θ − η·梯度。从随机的初始直线出发（初始准确率只有百分之十几），连播看它一步步转正：上图边界转动，下图损失曲线同步下降，曲线上每个点都是拿当前参数对全部数据<strong>真算</strong>出来的，不是预录的。η 滑杆归你管：这个损失是二次型，η 一旦超过 2/λ<sub>max</sub> ≈ 0.56 就指数级爆掉——调大，当场训飞，损失爆表如实显示。你在第 0 步玩飞的那颗球，和这里训飞的模型，是同一种死法。',
    s6formula: 'ŷ = w₁x + w₂y + b，L = (1/N)Σ(ŷᵢ − yᵢ)²，θ ← θ − η·∇L(θ)，边界 ŷ = 0.5',
    s6etaLab: 'η · 学习率（归你管）',
    s6step1: '走 1 步', s6step10: '走 10 步', s6play: '连播训练', s6pause: '暂停', s6reset: '回到随机初始',
    s6ro: '步数 k = <span>{k}</span> · 损失 L = <span>{loss}</span> · 训练准确率 <span>{acc}%</span> · w = (<span>{w1}</span>, <span>{w2}</span>)，b = <span>{b}</span>{div}',
    s6div: ' · <b>已训飞</b>——损失爆表（η 太大），把 η 调小、重置再来',
    s6cardsH: '这一页的循环，放大之后就是整个 AI 行业',
    c1h: '反向传播 = 梯度的高效算法',
    c1: '模型有十亿个参数时，逐个试探求梯度是不可能的。<strong>反向传播</strong>用链式法则，一次反向扫过计算图，就把每个参数的梯度全算出来——算的还是这一页的 ∇f，只是算得聪明。',
    c2h: 'Adam = 动量 + 自适应步长',
    c2: '第 3 步的动量攒的是方向，<strong>Adam</strong> 再给每个参数配一个自己的步长：它给每个方向记一笔账——那个方向上梯度大小的滑动平均，迈步前先拿梯度除以这笔账。梯度一直大的方向，实际步幅被压回学习率 η 的量级；梯度一直小的方向，则被相对放大——各方向的步幅就这样被归一化到同一量级，不再由谁的梯度大说了算。它是第 2、3 步两味药的合剂，也是今天大多数训练的默认选择。',
    c3h: '大模型训练 = 这个循环 × 10⁹',
    c3: '把参数换成十亿个、数据换成全网文本、地形大到没有任何人画得出来，循环本身一个字没变：<strong>算梯度、迈步、再算梯度</strong>。GPU 集群每秒做万亿次的，就是你在这一页手动做的事。',
    s6fin: '你刚手动做的事——算坡度、迈步、怕飞出去、盼着落进好谷——GPU 集群每秒做万亿次。算法没有变难，是地形大到看不见了。<strong>摸黑下山，就是训练的全部真相。</strong>',
    s6lkEnt: '它最小化的损失是什么：交叉熵与 KL →', s6lkEig: '峡谷为什么是峡谷：主轴与对角化 →',
    cv6a: '类别 A', cv6b: '类别 B', cv6bnd: '决策边界', cv6lossT: '损失曲线 L(k)（逐点真算）', cv6clip: '损失已爆表（真值见读数）'
  },
  en: {
    docTitle: 'Gradient Descent · Downhill in the Dark · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Gradient Descent · Downhill in the Dark',
    tagline: 'Training a model, at bottom, is walking downhill on terrain you cannot see: the slope under your feet (the gradient) is the only information you get, and how big a step you dare to take (the learning rate) decides whether you reach the valley floor, pace in place, or get launched into orbit. Every neural network ever trained runs the loop on this page — so first, crank the step size until something explodes.',
    nav0: '0 The Line', nav1: '1 2D Terrain', nav2: '2 The Canyon', nav3: '3 Momentum',
    nav4: '4 Stochastic', nav5: '5 Non-Convex', nav6: '6 Finale · Train It',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Gradient Descent —— the one-interaction-per-step series',

    s0k: 'Step 0 · The Hook',
    s0t: 'One ball, one step-size line between life and death',
    s0e: 'Shrink the world to a single parabola: f(x) = x², valley floor at x = 0. The ball starts at x = 2 and obeys one rule: <strong>x ← x − η·f′(x)</strong>, where f′(x) = 2x is the slope underfoot and η (the learning rate) is how bold a step you take. Too small, and the ball inches along; η = 0.5 lands it exactly on the floor in one step; a bit larger and it starts bouncing wall to wall as it converges; at η = 1 it bounces between ±2 forever; any larger — it launches clean off the chart. All of deep learning tuning is, at bottom, this one slider. <strong>Play with it until it explodes.</strong>',
    s0formula: 'xₙ₊₁ = xₙ − η·2xₙ = (1 − 2η)·xₙ',
    s0etaLab: 'η · learning rate (step size)',
    s0step: 'Take a step', s0play: 'Play', s0pause: 'Pause', s0reset: 'Back to x = 2',
    s0ro: 'step n = <span>{n}</span> · x = <span>{x}</span> · |x| = <span>{ax}</span> · per-step multiplier (1 − 2η) = <span>{ratio}</span> · state: <b>{verdict}</b>',
    s0vMono: 'monotone convergence — every step moves toward the floor',
    s0vOne: 'one-shot landing — η = 0.5 sits exactly on the line',
    s0vOsc: 'oscillating convergence — bouncing toward the floor',
    s0vStay: 'orbits in place — η = 1, multiplier = −1, bounces forever',
    s0vDiv: 'diverging — |multiplier| > 1, every step lands farther away',
    s0vDone: 'landed on the valley floor (x = 0)',
    s0divNote: 'The ball has left the chart: the true magnitude of |x| is 10<sup>{k}</sup> (the readout shows the true value). Nothing was quietly reset — divergence is divergence.',
    s0hint: 'Why do the regimes break exactly at 0.5 and 1? Because each step multiplies x by (1 − 2η): a multiplier inside (−1, 1) converges, its sign picks monotone versus bouncing, exactly −1 orbits in place, and outside ±1 it explodes. The whole fate of the 1-D problem is one multiplier. Every later step on this page is a fight with the high-dimensional version of that same number.',
    cv0clip: 'ball has left the chart (true value in the readout)',
    cv0valley: 'valley floor x = 0',

    s1k: 'Step 1 · 2-D Terrain',
    s1t: 'The gradient is always perpendicular to the contour lines',
    s1e: 'Now the terrain is two-dimensional: a round bowl f(x, y) = ½(x² + y²) whose contours are concentric circles. <strong>Click anywhere to drop the ball</strong>, then step (or play) and watch it descend. The field of arrows shows −∇f at sampled points — the steepest downhill direction right there. Watch where arrows cross the circles: they pierce every contour <strong>at a right angle</strong>, and they shrink as the floor nears — the slope is dying. Notice how little the gradient tells you: it says how to take the steepest next step, and not one word about where the valley is. Descending means chaining local judgments into a global path.',
    s1formula: 'f(x, y) = ½(x² + y²), ∇f = (x, y), x ← x − η·∇f(x)',
    s1etaLab: 'η · learning rate',
    s1step: 'Take a step', s1play: 'Play', s1pause: 'Pause', s1reset: 'Back to (2.2, 1.6)',
    s1ro: 'step n = <span>{n}</span> · position (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · |∇f| = <span>{g}</span>{done}',
    s1done: ' · <b>at the bottom</b> — |∇f| below 10⁻⁶, the slope is gone',
    s1hint: 'Why must the arrows be perpendicular to the contours? Walking along a contour keeps f constant, so the gradient (the direction of fastest increase) has zero component along it — an identity in the math, a visible right angle on the chart. This bowl is isotropic: the slope is the same in every direction, so the ball rolls straight to the floor. Stretch the bowl, and the trouble starts.',
    cv1click: 'click anywhere to drop the ball',
    cv1grad: 'arrows = −∇f (steepest descent)',

    s2k: 'Step 2 · The Canyon',
    s2t: 'The condition number sets the zigzag',
    s2e: 'Stretch the bowl along one axis: f(x, y) = ½(x² + κy²). κ is the <strong>condition number</strong> — the ratio of the steepest slope to the gentlest, the canyon’s aspect ratio. <a class="fourier-link" href="../eigen/#step4">κ’s true identity lives on the eigenvalue page: the canyon’s aspect ratio is a ratio of λ’s →</a> At κ = 1 it is still a round bowl; crank κ up and it becomes a gorge: brutally steep across, nearly flat along the floor. The trouble follows at once: η must respect the steepest direction (η < 2/λ<sub>max</sub> or it explodes), so progress along the floor crawls, and the ball zigzags wall to wall, inching forward. Every number on the board below — the stability limit, the optimal step η*, the rate (κ−1)/(κ+1) — is computed from the terrain’s eigenvalues λ, the trajectory is iterated live, and the measured step count can be checked against theory on the spot.',
    s2formula: 'f = ½xᵀAx, A = diag(1, κ): λmin = 1, λmax = κ',
    s2kapLab: 'κ · condition number (canyon aspect ratio)',
    s2etaLab: 'η · learning rate',
    s2etaStar: 'Set η to the optimal η*',
    s2step: 'Take a step', s2play: 'Play', s2pause: 'Pause', s2reset: 'Reset', s2runAll: 'Run to the end',
    bdLam: 'λmin = {a} · λmax = {b}',
    bdEtaLim: 'stability limit 2/λmax = {v}',
    bdEtaStar: 'optimal η* = 2/(λmin+λmax) = {v}',
    bdRate: 'rate (κ−1)/(κ+1) = {v}',
    bdTheory: 'theory steps at η = η* (error → 1/1000) ≈ {v}',
    bdMeas: 'measured steps to ε = {v}',
    s2ro: 'now n = <span>{n}</span> · position (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · state: <b>{status}</b>',
    s2stRun: 'descending',
    s2stDone: 'reached ε (‖x‖ ≤ ‖x₀‖/1000)',
    s2stDiv: 'diverged — η is past the stability limit, ‖x‖ blew past 10{supk}',
    s2hint: 'The theory count: each step multiplies the error by at most the rate (κ−1)/(κ+1), so shrinking it to 1/1000 takes about ln(1000) / ln(1/rate) steps. At η = η* the two directions’ multipliers have exactly equal magnitude, so theory and measurement land very close — not a coincidence, but the definition of η* at work. Remember the word eigenvalue: here it appears disguised as a terrain’s aspect ratio; on the next page it takes the lead role.',

    s3k: 'Step 3 · Momentum',
    s3t: 'Let the ball roll: momentum',
    s3e: 'Same canyon as step 2, same start, same η (both sides use η*) — the only difference: the ball on the right has <strong>inertia</strong>. Plain gradient descent looks only at the slope underfoot; momentum keeps a fraction β of the previous velocity: <strong>v ← βv − η∇f(x), x ← x + v</strong>. Inside the canyon the wall-to-wall bounces flip sign every step and cancel, while the along-floor components point the same way and add up — the ball overshoots the floor, swings twice, then accelerates along it. Push β past 0.9 and watch the other face: too much inertia, huge swings across the floor, slower than no momentum at all. Momentum is medicine; overdosed, it is poison.',
    s3formula: 'v ← βv − η·∇f(x), x ← x + v (β = 0 degenerates to plain GD)',
    s3kapLab: 'κ · condition number',
    s3betaLab: 'β · momentum coefficient (0 = plain GD)',
    s3leftLab: 'Plain GD (β = 0)',
    s3rightLab: 'Momentum (β = {beta})',
    s3step: 'Take a step', s3play: 'Play', s3pause: 'Pause', s3reset: 'Reset', s3runAll: 'Run to the end',
    s3ro: 'both sides use η = η* = <span>{eta}</span> (identical) · at step <span>{n}</span> · plain GD reached ε in <span>{gd}</span> steps · momentum reached ε in <span>{mo}</span> steps',
    s3na: 'not yet',
    s3hint: 'ε means the same as in step 2: ‖x‖ ≤ ‖x₀‖/1000. Dial β back to exactly 0 and the right trajectory coincides with the left point for point — at β = 0 the momentum update is plain GD, word for word. Real training often uses β = 0.9, but that pairs with a different step size; on this canyon, with η*, the best β sits near 0.5 — the chart shows it plainly.',

    s4k: 'Step 4 · Stochastic Gradient',
    s4t: 'Take a step after glancing at a few data points',
    s4e: 'Real training data is far too large to read in full before every step. The fix: at each step, sample a small handful of points (a batch), average their gradients, and step with that — <strong>stochastic gradient descent (SGD)</strong>. <a class="fourier-link" href="../montecarlo/#step2">A small-sample average’s error is priced at 1/√N: Monte Carlo’s ledger →</a> On the left, the seeded dataset of {N} points and the two fitted lines (kept in sync with the parameters on the right); on the right, the loss terrain’s contours: the cyan path is full-batch GD, smooth and straight; the orange path is SGD looking at only batch points per step, wobbling its way down. Above each current point sit two arrows: cyan is the full-batch gradient (the true aim), orange is this step’s batch gradient (off target) — every SGD step aims slightly wrong, yet on average it aims right, and each step is far cheaper. Shrink the batch and the wobble grows; set it to full and the wobble vanishes — the two paths coincide point for point.',
    s4formula: 'L(w, b) = (1/N)·Σᵢ (w·xᵢ + b − yᵢ)², data seed = {seed}, N = {N}',
    s4batchLab: 'batch size (points seen per step)',
    s4bFull: 'full {N}',
    s4step: 'Take a step', s4play: 'Play', s4pause: 'Pause', s4reset: 'Reset',
    s4ro: 'step k = <span>{k}</span> · full-batch GD’s true loss L = <span>{lg}</span> · SGD’s true loss L = <span>{ls}</span> · angle between this step’s batch gradient and the full gradient <span>{ang}°</span>',
    s4lastNote: ' (final step: the pink arrow is the batch that produced this last step — there is no “next step” left to preview)',
    s4hint: 'Both losses in the readout are the true full-data loss, so the two paths can be compared fairly: SGD races ahead early on cheap steps, then hovers near the floor, jittering without settling — which is exactly why real training schedules shrink the learning rate over time. And keep the jitter in mind for one more step: it is not all downside — it can shake you out of places you should never have stopped at.',
    cv4gd: 'full-batch GD', cv4sgd: 'mini-batch SGD', cv4true: 'full gradient', cv4batch: 'batch gradient',
    cv4fitG: 'full-batch GD line', cv4fitS: 'SGD line', cv4ols: 'best fit (closed form)',

    s5k: 'Step 5 · Non-Convex Terrain',
    s5t: 'Saddles and false floors: zero gradient ≠ the bottom',
    s5e: 'The terrain of real AI is not a bowl. This f(x, y) = (x² − 1)² + y² + 0.3x has <strong>two valleys of different depths</strong> (the left one is deeper) and a <strong>saddle point</strong>: there the gradient is also zero, yet it is a floor along one direction and a ridge along the other — stand on it and two ways lead down, one way leads up. “Zero gradient” guarantees nothing in a non-convex world. Drop the ball from the three starts and watch fate fork; then look at start C: it sits almost exactly on the saddle (a hair to its right), where |∇f| ≈ 0.002 — with no noise, the ball can only creep along the ridge on that residual slope: at the default η it needs 34 steps to slide off the ridge, and it ends up in the shallower right valley. Turn on “a little noise” (each step adds a Gaussian kick of σ = 1.0 to the gradient — a small jitter elsewhere, but hundreds of times the gradient itself near the saddle) and 11 steps shake it off the ridge, into the deeper left valley no less. The readout below records each mode’s steps-to-leave-the-ridge under one shared criterion, so the two can be checked against each other — the very jitter from the last step, wearing its other face in real training. The critical-point markers on the chart are solved from ∇f = 0 and typed by the Hessian’s signs — not drawn by hand.',
    s5formula: 'f(x, y) = (x² − 1)² + y² + 0.3x, ∇f = (4x³ − 4x + 0.3, 2y)',
    s5pLeft: 'Start A · outside the left valley', s5pRight: 'Start B · outside the right valley', s5pSaddle: 'Start C · on the saddle',
    s5etaLab: 'η · learning rate',
    s5noiseLab: 'a little noise (random kick added to each step’s gradient)',
    s5step: 'Take a step', s5play: 'Play', s5pause: 'Pause', s5reset: 'Back to the current start',
    s5ro: 'step n = <span>{n}</span> · position (<span>{x}</span>, <span>{y}</span>) · f = <span>{f}</span> · |∇f| = <span>{g}</span> · state: <b>{status}</b>',
    s5stGo: 'descending',
    s5stWellL: 'settled in the left valley — the deeper one',
    s5stWellR: 'settled in the right valley — a shallower local minimum (not the global best)',
    s5stWellNoiseL: 'in the left valley — still jittering around the floor (noise is on, so it never sits still)',
    s5stWellNoiseR: 'in the right valley — still jittering around the floor (noise is on, so it never sits still)',
    s5stSaddle: 'crawling near the saddle — gradient ≈ 0, but this is not a valley floor',
    s5stDiv: 'diverged (η too large — flew off the terrain)',
    s5esc: 'steps to leave the ridge (one shared criterion: |x − x<sub>saddle</sub>| first ≥ 0.5; start C, η = {eta}; recorded automatically per run, cleared when η changes): no noise <span>{plain}</span> · noise <span>{noise}</span>',
    s5hint: 'The depth difference comes from the +0.3x term: it tilts the whole terrain slightly leftward. Without it the valleys would tie and the saddle would sit exactly at x = 0; with it, the saddle and both depths shift — and the markers on the chart are solved from the formula, so they would move with it. You cannot draw the loss terrain of a deep network, but “initialization picks your valley, noise helps you escape saddles” happens in real training every day.',
    cv5minL: 'deep valley (local min)', cv5minR: 'shallow valley (local min)', cv5saddle: 'saddle point', cv5start: 'start',

    s6k: 'Step 6 · Finale',
    s6t: 'Train a real model, right here',
    s6e: 'The finale uses everything from the five steps before it. The dataset is two seeded blobs of points ({N} in total); the model is the simplest <strong>linear-regression classifier</strong>: a line scores each point, ŷ = w₁x + w₂y + b, fitted to the 0/1 labels, and the line where the score is exactly 0.5 is the decision boundary. The line turns by the same old rule — take the gradient of the loss (mean squared error) with respect to the parameters, then θ ← θ − η·gradient. Starting from a random line (initial accuracy: barely ten percent), play and watch it swing into place: the boundary rotates above while the loss curve falls below, every point of that curve honestly computed from the current parameters on the full dataset — nothing pre-recorded. The η slider is yours: this loss is a quadratic, so once η passes 2/λ<sub>max</sub> ≈ 0.56 it blows up exponentially — crank it, blow the model up on the spot, and watch the loss honestly peg off the chart. The ball you launched in step 0 and the model you blow up here die the same death.',
    s6formula: 'ŷ = w₁x + w₂y + b, L = (1/N)Σ(ŷᵢ − yᵢ)², θ ← θ − η·∇L(θ), boundary ŷ = 0.5',
    s6etaLab: 'η · learning rate (yours to command)',
    s6step1: '1 step', s6step10: '10 steps', s6play: 'Train (play)', s6pause: 'Pause', s6reset: 'Back to the random start',
    s6ro: 'step k = <span>{k}</span> · loss L = <span>{loss}</span> · training accuracy <span>{acc}%</span> · w = (<span>{w1}</span>, <span>{w2}</span>), b = <span>{b}</span>{div}',
    s6div: ' · <b>blown up</b> — the loss pegged off the scale (η too large); shrink η, reset, and go again',
    s6cardsH: 'This page’s loop, scaled up, is the entire AI industry',
    c1h: 'Backpropagation = gradients, computed efficiently',
    c1: 'With a billion parameters you cannot probe them one at a time. <strong>Backpropagation</strong> runs the chain rule backward through the computation graph once and produces every parameter’s gradient at once — still this page’s ∇f, just computed cleverly.',
    c2h: 'Adam = momentum + per-parameter step sizes',
    c2: 'Step 3’s momentum banks direction; <strong>Adam</strong> additionally gives every parameter its own step size: for each direction it keeps a running average of how large the gradients there have been, and divides the gradient by that average before stepping. A direction whose gradients stay large has its actual step scaled back to the order of the learning rate η; a direction whose gradients stay small is relatively boosted — so step sizes across directions end up normalized to a comparable scale, instead of being dictated by whoever shouts the largest gradient. It is the two medicines of steps 2 and 3 combined, and the default choice of most training today.',
    c3h: 'Training a giant model = this loop × 10⁹',
    c3: 'Swap in a billion parameters and the text of the whole web, on terrain no one can draw, and the loop itself does not change by a single word: <strong>compute the gradient, take a step, compute it again</strong>. What GPU clusters do trillions of times per second is exactly what you just did by hand on this page.',
    s6fin: 'What you just did by hand — feel the slope, take a step, fear the launch, hope for a good valley — GPU clusters do trillions of times per second. The algorithm never got harder; the terrain just grew too big to see. <strong>Walking downhill in the dark is the whole truth of training.</strong>',
    s6lkEnt: 'What loss it minimises: cross-entropy and KL →', s6lkEig: 'Why the canyon is a canyon: principal axes and diagonalisation →',
    cv6a: 'class A', cv6b: 'class B', cv6bnd: 'decision boundary', cv6lossT: 'loss curve L(k) (computed live, point by point)', cv6clip: 'loss off the chart (true value in the readout)'
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
