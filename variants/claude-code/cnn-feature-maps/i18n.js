'use strict';
// CNN feature-map strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'CNN 特征图 · 九个数字决定看见什么',
    back: '← 知识索引',
    compare: '对照另一版本：卷积神经网络的特征图 · 小窗口怎样“看”图 →',
    navLabel: 'CNN 特征图步骤导航',
    tagline: '卷积神经网络（CNN）认图，第一步只是拿一个 3×3 的小窗口在图上滑动，每到一处做一次加权求和。这九个权重决定了窗口对什么起反应：竖边、横边、斜边、平均亮度……这一页从一个像素算起，看特征图怎样产生、尺寸怎样变、ReLU 和池化丢掉了什么，再把两张特征图叠成第二层认出「角」，最后让梯度下降自己学出这九个数。',
    nav0: '0 一个像素', nav1: '1 换核', nav2: '2 尺寸', nav3: '3 ReLU 与池化', nav4: '4 第二层', nav5: '5 学出核', nav6: '6 收束',
    lgGrey: '亮度：黑 0 → 白 1', lgPos: '特征为正（颜色越深数越大）', lgNeg: '特征为负',
    imgSquare: '方块', imgDisc: '圆', imgDiagonal: '斜线', imgT: '字母 T',
    cInput: '输入图（14×14）', cKernel: '核（3×3 权重）',
    rc: '第 {i} 行第 {j} 列',

    s0k: '第 0 步 · 一个像素',
    s0t: '特征图上的一个像素，是怎么算出来的？',
    s0e: '这一步要回答：给一张灰度图和一个 3×3 的<strong>卷积核</strong>（九个权重数字），输出图上的一个像素等于什么？图像在计算机里是一格格的<strong>像素</strong>，每格一个亮度：0 是黑、1 是白；这里的图是 14×14，中间有个白方块。把 3×3 的<strong>窗口</strong>放在图上某处，窗口里九个亮度和核的九个数<strong>对应相乘、再全部相加</strong>，就得到输出的一个像素。窗口每挪一格算一次，所有位置的结果排成一张新图，叫<strong>特征图</strong>。窗口必须整个落在图内，所以 14×14 的图只有 12×12 个位置。这里的核是<strong>竖直边缘核</strong>：右列为正、左列为负，所以窗口里右边比左边亮时输出为正，左边更亮时为负，左右一样亮时正负相消得 0。（深度学习里的「卷积」不把核翻转，数学上叫互相关；<a class="xlink" href="../../../signal/systems/convolution/#step4">→ 卷积页第 4 步：图像卷积核</a>）',
    rowSlider: '窗口左上角在第几行', colSlider: '窗口左上角在第几列',
    scan: '扫过整张图', clearMap: '清空特征图',
    s0lgWin: '当前窗口 / 当前输出像素',
    c0map: '特征图（12×12，已算过的位置）',
    s0readout: '窗口覆盖第 {r0}–{r1} 行、第 {c0}–{c1} 列：{terms} = {sum}。特征图已算 {v}/144 个位置。',
    s0hint: '观察顺序：先按「扫过整张图」，看窗口一行行扫过、「特征图」逐格填满：方块左边缘两列变橙（左暗右亮），右边缘两列变蓝（左亮右暗），方块内部和背景都是 0（左右一样亮，正负相消）。再拖两个滑杆，把窗口放到边缘上和方块内部，对照读数里的九个乘积。',

    s1k: '第 1 步 · 换核',
    s1t: '换一组九个数，为什么就看见了不同的东西？',
    s1e: '这一步要回答：核里的九个数怎样决定特征图突出什么？同一张图换不同的核。<strong>边缘核</strong>一侧为正、对侧为负、总和为 0：亮度平坦处正负相消输出 0，只在亮度突变处有响应；转动角度 θ 就是改变它比较的方向（θ = 0° 比较左右，90° 比较上下，45° 和 135° 比较两条斜对角）。<strong>模糊核</strong>九个都是 1/9，输出就是窗口里的平均亮度。<strong>锐化核</strong>中心 5、上下左右各 −1，总和为 1：平坦处保持原亮度，边缘处把差别放大。<strong>原样核</strong>只有中心是 1，输出就是原图（四周少一圈）。特征图的颜色按这张图里绝对值最大的数缩放。',
    kerEdge: '边缘（方向 θ）', kerBlur: '模糊', kerSharpen: '锐化', kerIdentity: '原样',
    angleSlider: '边缘核的方向 θ（度；只对边缘核起作用）',
    c1map: '特征图（12×12）',
    s1readout: '{ker}：九个权重之和 {sum}。特征图最大值 {max}（{at}），最小值 {min}；绝对值超过最大绝对值一半的位置有 {strong} 个。',
    s1hint: '观察顺序：选「方块」+「边缘」，把 θ 从 0° 转到 90°：亮起的从左右两条竖边换成上下两条横边；45° 时最强的是左上角（正）和右下角（负）。换「斜线」再转 θ：45° 时整张特征图都是 0（这个方向上亮度没有变化），135° 时最强。最后比较「模糊」和「锐化」：模糊把方块边缘变成过渡带；锐化让边缘内侧比 1 还亮（最高 3）、外侧比 0 还暗（最低 −1）。',

    s2k: '第 2 步 · 尺寸',
    s2t: '特征图有多大？补零和步幅怎样改变它？',
    s2e: '这一步要回答：输入 n×n、核 k×k，输出有几行几列？窗口每次挪动的格数叫<strong>步幅</strong> s；在图像四周补上 p 圈 0 叫<strong>补零</strong>（padding），让窗口也能骑在图的边上。窗口能放的位置数（也就是输出边长）是 <strong>⌊(n + 2p − k)/s⌋ + 1</strong>（⌊ ⌋ 表示向下取整）。补零让输出变大、图边上的内容不被丢掉；步幅大于 1 时跳着放窗口，输出缩小，乘法次数也少。这里 n = 14、k = 3，核是竖直边缘核，图是方块。',
    padSlider: '补零圈数 p', strideSlider: '步幅 s',
    s2lgPad: '补上的 0', s2lgPos: '一个窗口的中心',
    c2in: '补零后的输入与窗口位置',
    c2out: '特征图（{o}×{o}）',
    s2readout: 'p = {p}、s = {s}：输出边长 = ⌊(14 + 2×{p} − 3)/{s}⌋ + 1 = {o}，共 {cells} 个输出像素，每个 9 次乘法，共 {mults} 次。{miss}',
    s2miss: '最右 {m} 列和最下 {m} 行从未进入任何窗口。',
    s2hint: '观察顺序：先只拖 p：p = 1 时输出正好也是 14×14（常用的「尺寸不变」设置）。再只拖 s：s = 2 时青点隔一格出现，输出边长约减半，乘法次数约变为 1/4。p = 0、s = 3 时 (14 − 3)/3 除不尽，最右 2 列和最下 2 行从未被任何窗口碰到。',

    s3k: '第 3 步 · ReLU 与池化',
    s3t: '扔掉负数、缩小尺寸之后，特征还在吗？',
    s3e: '这一步要回答：卷积之后，CNN 常再做两件事，它们各保留什么、丢掉什么？<strong>ReLU</strong>（整流）：负数变 0，正数不变——只保留「左暗右亮」这一种方向的响应，相反方向留给别的核去管。<strong>最大池化</strong>：把特征图切成 q×q 的小块，每块只留最大的那个数，边长缩小到约 1/q。池化保留了「这一块里有没有强响应、有多强」，丢掉了它在块内的确切位置。这里用竖直边缘核；q = 1 表示不池化。',
    reluToggle: 'ReLU：负数变 0',
    poolSlider: '池化块大小 q',
    s3lgBlock: '一个池化块',
    c3feat: '卷积后的特征图（12×12）', c3featRelu: '卷积 + ReLU（12×12）', c3pool: '最大池化后（{o}×{o}）',
    on: '开', off: '关',
    s3readout: 'ReLU {state}：卷积结果里负数 {neg} 个{gone}、正数 {pos} 个。池化 q = {q}：12×12 → {o}×{o}，数字个数从 144 减到 {cout}；最大值 {mx} 仍然保留。',
    s3gone: '（已全部变成 0）',
    s3hint: '观察顺序：选「圆」，先关掉 ReLU：圆的左侧边缘为橙、右侧为蓝。打开 ReLU：蓝色全部消失，只剩左侧。再把 q 从 1 拖到 3：图变得粗糙，但橙色仍沿着圆的左侧排列，最大值不变；数字个数从 144 降到 36 再到 16。',

    s4k: '第 4 步 · 第二层',
    s4t: '两张边缘特征图叠起来，能认出「角」吗？',
    s4e: '这一步要回答：第二层能不能用第一层的结果认出更复杂的形状？取两张经过 ReLU 的特征图：<strong>V</strong>（竖直边缘核，左暗右亮处为正）和 <strong>H</strong>（水平边缘核，即 θ = 90°，上暗下亮处为正），各自除以自己的最大值，使两者最大都是 1。第二层对每个位置算 <strong>ReLU(V + H − c)</strong>：两张图对应位置相加，减去门槛 c（神经网络里叫<strong>偏置</strong>，这里取 −c），负数变 0。只有一种边缘时 V + H 至多是 1；左边缘和上边缘交汇处——左上角——两者同时为正，和才超过 1。这一层相当于一个 1×1 的卷积：两个输入通道的权重都是 1。',
    biasSlider: '门槛 c',
    s4lgOn: '第二层输出为正', s4lgPeak: 'V + H 最大的位置',
    c4V: 'V：竖直边缘（ReLU，最大为 1）', c4H: 'H：水平边缘（ReLU，最大为 1）', c4out: '第二层：ReLU(V + H − c)',
    s4readout: 'c = {c}：第二层有 {n} 个位置为正{where}。V + H 的最大值 {hi}（{at}），第二大的值 {lo}。',
    s4where: '，在{at}',
    s4hint: '观察顺序：选「方块」，把 c 从 0 慢慢拖到 2：c = 0 时左边缘和上边缘整条亮着；c 到 1 时只剩左上角一个点；c 到 1.5 时连它也熄灭。所以 c 落在 1（含）到 1.5（不含）之间时，这个「神经元」就是左上角探测器。换「字母 T」，同一段门槛也只留下它左上角那一点；换「圆」，留下的是左上方一段弧上的 7 个点——圆没有尖角，但左上那段弧同时带着左边缘和上边缘，最像角。要找另外三个角，需要另外三组方向相反的边缘核；真实 CNN 第二层有几十上百个这样的组合，而且是学出来的，不是手设的。',

    s5k: '第 5 步 · 学出核',
    s5t: '九个数能不能不靠人设计，自己学出来？',
    s5e: '这一步要回答：只给出「想要的输出图」，能不能反推出核？准备一张训练图（字母 T 加随机斑点，让九个权重都会被用到）和目标特征图（用竖直边缘核算出，但训练时假装不知道这个核）。从九个 0 出发，计算<strong>损失</strong>：当前输出与目标在 144 个位置上差值平方的平均（越小越好）。再算出每个权重的<strong>梯度</strong>：这个权重增加一点点，损失会变化多快。然后让每个权重往损失下降的方向挪一步：新权重 = 旧权重 − <strong>学习率</strong> × 梯度。这就是<a class="xlink" href="../../../computing/ml/gradient-descent/#step0">梯度下降（→ 梯度下降第 0 步：学习率的生死线）</a>，一步步重复。',
    lrSlider: '学习率',
    train1: '训练 1 步', train10: '训练 10 步', train100: '训练 100 步（动画）', reset: '重置为九个 0',
    s5lgLoss: '损失曲线（全部历史）',
    c5learn: '学到的核', c5target: '目标核（训练时假装不知道）', c5out: '学到的核算出的特征图', c5loss: '损失（纵轴对数刻度）· 横轴：训练步数',
    s5readout: '已训练 {t} 步，学习率 {lr}：损失 {loss}（起点 {l0}）；九个权重与目标的最大偏差 {err}。',
    s5div: '已训练 {t} 步，学习率 {lr}：损失冲到 {loss}，越训越大——发散了。按「重置」，把学习率调到 0.56 以下再试。',
    s5hint: '观察顺序：保持学习率 0.3，按「训练 100 步」：损失曲线一路下降，学到的核逐渐长成目标的样子（左列负、右列正，中间一行是 ±2）。再按两次（共 300 步），最大偏差降到 0.01 以下。然后重置，把学习率拖到 0.6 再训练：损失越来越大、权重越跳越远——步子太大，每一步都越过了谷底。对这张训练图，稳定的上限约是 0.56（由损失曲面的弯曲程度决定）。',

    s6k: '第 6 步 · 收束',
    s6t: '卷积层，就是一组会学习的小窗口',
    s6fin: '一个卷积层是同一个小窗口在图上处处重复使用：每个输出像素是窗口里九个亮度的加权和（第 0 步）；九个权重决定它对什么起反应——边缘、平均、锐化（第 1 步）；补零和步幅决定输出多大（第 2 步）；ReLU 和池化丢掉负数和块内位置，留下「哪里有、有多强」（第 3 步）；几张特征图再加权组合，就能认出角这样更复杂的图案（第 4 步）；而这些权重不必手设，可以用梯度下降从例子里学出来（第 5 步）。',
    formula: '输出[i][j] = Σₐ Σ_b 核[a][b] · 输入[i·s + a − p][j·s + b − p]\n输出边长 = ⌊(n + 2p − k)/s⌋ + 1\n新权重 = 旧权重 − 学习率 × 梯度',
    boundary: '适用范围：本页只有单通道灰度图、单个 3×3 核、没有偏置项（第 4 步的门槛 c 除外），第 4 步的第二层是手设的 1×1 组合；真实 CNN 有彩色多通道输入，每层几十到几百个核，权重全部一起用反向传播学出来。第 5 步的目标图由一个已知的核生成，所以一定存在完美解；真实任务的目标是类别标签，没有这样的「标准答案核」。学习率上限约 0.56 只属于这张训练图。',
    linksTitle: '接着去哪儿',
    lk1: '→ 卷积第 4 步：图像卷积核（数学上的卷积要翻转核）',
    lk2: '→ 梯度下降第 0 步：学习率大了为什么会发散',
    lk3: '→ 反向传播第 2 步：多层网络里梯度怎样一层层算回来',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《卷积神经网络的特征图 · 小窗口怎样“看”图》的平行版本。'
  },
  en: {
    pageTitle: 'CNN Feature Maps · Nine Numbers Decide What Gets Seen',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: CNN Feature Maps · How a Small Window “Sees” an Image →',
    navLabel: 'CNN feature map steps',
    tagline: 'A convolutional neural network (CNN) starts reading an image by sliding a 3×3 window across it and taking one weighted sum at each stop. Those nine weights decide what the window responds to: vertical edges, horizontal edges, diagonals, average brightness… We start from a single pixel, then see how a feature map is produced, how its size changes, what ReLU and pooling throw away, how a second layer stacks two maps to find a corner — and finally let gradient descent learn the nine numbers on its own.',
    nav0: '0 One pixel', nav1: '1 Swap kernels', nav2: '2 Size', nav3: '3 ReLU & pooling', nav4: '4 Second layer', nav5: '5 Learn a kernel', nav6: '6 Wrap-up',
    lgGrey: 'Brightness: black 0 → white 1', lgPos: 'Positive feature (deeper = larger)', lgNeg: 'Negative feature',
    imgSquare: 'Square', imgDisc: 'Disc', imgDiagonal: 'Diagonal', imgT: 'Letter T',
    cInput: 'Input image (14×14)', cKernel: 'Kernel (3×3 weights)',
    rc: 'row {i}, column {j}',

    s0k: 'STEP 0 · ONE PIXEL',
    s0t: 'How is one pixel of a feature map computed?',
    s0e: 'The question here: given a grey image and a 3×3 <strong>kernel</strong> (nine weights), what is one pixel of the output? Inside a computer an image is a grid of <strong>pixels</strong>, each holding a brightness: 0 is black, 1 is white. Ours is 14×14 with a white square in the middle. Place a 3×3 <strong>window</strong> somewhere on it, <strong>multiply</strong> the nine brightnesses by the kernel’s nine numbers position by position, and <strong>add</strong> the nine products: that is one output pixel. Move the window one cell and repeat; the results, laid out by position, form a new image called a <strong>feature map</strong>. The window must sit fully inside the picture, so a 14×14 image allows only 12×12 positions. This kernel is a <strong>vertical-edge kernel</strong>: positive in the right column, negative in the left, so the output is positive where the right side of the window is brighter, negative where the left is brighter, and 0 where both sides match. (Deep-learning “convolution” does not flip the kernel; mathematically it is cross-correlation — <a class="xlink" href="../../../signal/systems/convolution/#step4">→ convolution, step 4: image kernels</a>.)',
    rowSlider: 'Window top-left: row', colSlider: 'Window top-left: column',
    scan: 'Sweep the whole image', clearMap: 'Clear the feature map',
    s0lgWin: 'Current window / current output pixel',
    c0map: 'Feature map (12×12, positions computed so far)',
    s0readout: 'Window over rows {r0}–{r1}, columns {c0}–{c1}: {terms} = {sum}. Feature map: {v}/144 positions computed.',
    s0hint: 'What to watch: press “Sweep the whole image”. The window scans row by row and the feature map fills in cell by cell: the square’s left edge turns orange in two columns (dark on the left, bright on the right), the right edge turns blue, and the inside and the background stay 0 (both sides equally bright, so the products cancel). Then drag the two sliders to put the window on an edge and inside the square, and check the nine products in the readout.',

    s1k: 'STEP 1 · SWAP KERNELS',
    s1t: 'Why does a different set of nine numbers see different things?',
    s1e: 'The question here: how do the nine numbers decide what a feature map highlights? Keep the image, change the kernel. An <strong>edge kernel</strong> is positive on one side, negative on the other and sums to 0: on flat brightness the products cancel to 0, so it responds only where brightness jumps. Turning its angle θ changes which direction it compares (θ = 0°: left vs right; 90°: top vs bottom; 45° and 135°: the two diagonals). A <strong>blur kernel</strong> holds nine copies of 1/9, so the output is the window’s average brightness. A <strong>sharpen kernel</strong> has 5 in the centre and −1 above, below, left and right, summing to 1: flat areas keep their brightness and edges get exaggerated. The <strong>identity kernel</strong> is 1 in the centre only, so the output is the image itself (one ring smaller). Feature-map colours are scaled to the largest absolute value in that map.',
    kerEdge: 'Edge (angle θ)', kerBlur: 'Blur', kerSharpen: 'Sharpen', kerIdentity: 'Identity',
    angleSlider: 'Edge kernel angle θ (degrees; edge kernel only)',
    c1map: 'Feature map (12×12)',
    s1readout: '{ker}: the nine weights sum to {sum}. Feature map maximum {max} ({at}), minimum {min}; {strong} positions exceed half the largest absolute value.',
    s1hint: 'What to watch: pick Square + Edge and turn θ from 0° to 90°: the response moves from the two vertical sides to the top and bottom; at 45° the strongest spots are the top-left corner (positive) and bottom-right corner (negative). Switch to Diagonal and turn θ: at 45° the whole feature map is 0 (brightness does not change in that direction), at 135° it is strongest. Finally compare Blur and Sharpen: blur turns the square’s edge into a ramp; sharpen pushes the inner side of the edge above 1 (up to 3) and the outer side below 0 (down to −1).',

    s2k: 'STEP 2 · SIZE',
    s2t: 'How big is the feature map, and how do padding and stride change it?',
    s2e: 'The question here: with an n×n input and a k×k kernel, how many rows and columns does the output have? The number of cells the window moves each time is the <strong>stride</strong> s; surrounding the image with p rings of zeros is <strong>padding</strong>, which lets the window straddle the border. The number of window positions — the output side length — is <strong>⌊(n + 2p − k)/s⌋ + 1</strong> (⌊ ⌋ means round down). Padding makes the output bigger and keeps border content; a stride above 1 skips positions, shrinking the output and the number of multiplications. Here n = 14, k = 3, the kernel is the vertical-edge kernel and the image is the square.',
    padSlider: 'Padding rings p', strideSlider: 'Stride s',
    s2lgPad: 'Padded zeros', s2lgPos: 'Centre of one window',
    c2in: 'Padded input and window positions',
    c2out: 'Feature map ({o}×{o})',
    s2readout: 'p = {p}, s = {s}: output side = ⌊(14 + 2×{p} − 3)/{s}⌋ + 1 = {o}, so {cells} output pixels at 9 multiplications each, {mults} in total. {miss}',
    s2miss: 'The rightmost {m} columns and bottom {m} rows never enter any window.',
    s2hint: 'What to watch: drag only p first: at p = 1 the output is 14×14 again (the common “same size” setting). Then drag only s: at s = 2 the cyan dots appear every other cell, the side length roughly halves and the multiplications drop to about a quarter. With p = 0 and s = 3, (14 − 3)/3 is not a whole number, and the rightmost 2 columns and bottom 2 rows are never touched by any window.',

    s3k: 'STEP 3 · RELU & POOLING',
    s3t: 'After throwing away negatives and shrinking the map, is the feature still there?',
    s3e: 'The question here: after convolution a CNN usually does two more things — what does each keep and what does it discard? <strong>ReLU</strong> (rectification) sets negatives to 0 and keeps positives, so only the “dark left, bright right” responses survive; the opposite direction is left to other kernels. <strong>Max pooling</strong> cuts the map into q×q blocks and keeps only the largest number in each, shrinking the side to about 1/q. Pooling keeps whether a block has a strong response and how strong; it discards exactly where in the block it was. We use the vertical-edge kernel; q = 1 means no pooling.',
    reluToggle: 'ReLU: negatives to 0',
    poolSlider: 'Pooling block size q',
    s3lgBlock: 'One pooling block',
    c3feat: 'Feature map after convolution (12×12)', c3featRelu: 'Convolution + ReLU (12×12)', c3pool: 'After max pooling ({o}×{o})',
    on: 'on', off: 'off',
    s3readout: 'ReLU {state}: the convolution output has {neg} negative cells{gone} and {pos} positive ones. Pooling q = {q}: 12×12 → {o}×{o}, from 144 numbers down to {cout}; the maximum {mx} survives.',
    s3gone: ' (all set to 0)',
    s3hint: 'What to watch: pick Disc and switch ReLU off: the disc’s left rim is orange and its right rim blue. Switch ReLU on: the blue disappears and only the left side remains. Then drag q from 1 to 3: the map gets coarse, but the orange still follows the left side of the disc and the maximum does not change; the count of numbers drops from 144 to 36 to 16.',

    s4k: 'STEP 4 · SECOND LAYER',
    s4t: 'Can two edge maps, stacked, recognise a corner?',
    s4e: 'The question here: can a second layer use the first layer’s results to recognise a more complex shape? Take two feature maps after ReLU: <strong>V</strong> (vertical-edge kernel, positive where it is dark on the left and bright on the right) and <strong>H</strong> (horizontal-edge kernel, θ = 90°, positive where it is dark above and bright below), each divided by its own maximum so both top out at 1. The second layer computes <strong>ReLU(V + H − c)</strong> at every position: add the two maps cell by cell, subtract a threshold c (a neural network’s <strong>bias</strong>, here −c) and zero out negatives. Where only one kind of edge is present, V + H is at most 1; where the left edge meets the top edge — the top-left corner — both are positive and the sum exceeds 1. This layer is a 1×1 convolution with weight 1 on each of the two input channels.',
    biasSlider: 'Threshold c',
    s4lgOn: 'Second layer output is positive', s4lgPeak: 'Where V + H is largest',
    c4V: 'V: vertical edges (ReLU, max 1)', c4H: 'H: horizontal edges (ReLU, max 1)', c4out: 'Second layer: ReLU(V + H − c)',
    s4readout: 'c = {c}: {n} positions are positive in the second layer{where}. The largest V + H is {hi} ({at}); the second largest is {lo}.',
    s4where: ', at {at}',
    s4hint: 'What to watch: pick Square and drag c slowly from 0 to 2. At c = 0 the whole left edge and top edge are lit; by c = 1 only the top-left corner remains; at c = 1.5 even that goes dark. So for c from 1 (inclusive) up to 1.5 (exclusive), this “neuron” is a top-left corner detector. Switch to Letter T and the same band leaves only its top-left corner; switch to Disc and it leaves 7 points along the top-left arc — a disc has no sharp corner, but that stretch of arc carries both a left edge and a top edge, so it is the most corner-like part. Finding the other three corners needs three more pairs of edge kernels facing other ways; a real CNN’s second layer has dozens or hundreds of such combinations, and they are learned, not set by hand.',

    s5k: 'STEP 5 · LEARN A KERNEL',
    s5t: 'Can the nine numbers be learned instead of designed?',
    s5e: 'The question here: given only the output we want, can we work back to the kernel? Take a training image (the letter T plus random speckles, so every one of the nine weights gets exercised) and a target feature map (made with the vertical-edge kernel, which training pretends not to know). Start from nine zeros and compute the <strong>loss</strong>: the mean of the squared differences between the current output and the target over all 144 positions (smaller is better). Then compute each weight’s <strong>gradient</strong>: how fast the loss changes if that weight grows a little. Move every weight a step downhill: new weight = old weight − <strong>learning rate</strong> × gradient. That is <a class="xlink" href="../../../computing/ml/gradient-descent/#step0">gradient descent (→ gradient descent, step 0: the learning-rate cliff)</a>, repeated step after step.',
    lrSlider: 'Learning rate',
    train1: 'Train 1 step', train10: 'Train 10 steps', train100: 'Train 100 steps (animated)', reset: 'Reset to nine zeros',
    s5lgLoss: 'Loss curve (full history)',
    c5learn: 'Learned kernel', c5target: 'Target kernel (hidden from training)', c5out: 'Feature map from the learned kernel', c5loss: 'Loss (log scale) · horizontal: training steps',
    s5readout: '{t} steps at learning rate {lr}: loss {loss} (started at {l0}); the largest gap between a learned weight and the target is {err}.',
    s5div: '{t} steps at learning rate {lr}: the loss has shot up to {loss} and grows with every step — training diverged. Press Reset and try a learning rate below 0.56.',
    s5hint: 'What to watch: keep the learning rate at 0.3 and press “Train 100 steps”: the loss curve falls steadily and the learned kernel takes on the target’s shape (left column negative, right column positive, ±2 in the middle row). Press it twice more (300 steps in all) and the largest gap drops below 0.01. Then reset, set the learning rate to 0.6 and train again: the loss grows and the weights jump further and further — each step is too big and overshoots the bottom of the valley. For this training image the stable limit is about 0.56 (set by how sharply the loss surface curves).',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'A convolution layer is a set of small windows that learn',
    s6fin: 'A convolution layer reuses one small window everywhere on the image: each output pixel is a weighted sum of the nine brightnesses under it (step 0); the nine weights decide what it responds to — edges, averages, sharpening (step 1); padding and stride set how big the output is (step 2); ReLU and pooling discard negatives and exact positions within a block, keeping “where, and how strong” (step 3); weighted combinations of several maps can recognise richer patterns such as corners (step 4); and the weights need not be designed by hand — gradient descent can learn them from examples (step 5).',
    formula: 'out[i][j] = Σₐ Σ_b kernel[a][b] · in[i·s + a − p][j·s + b − p]\noutput side = ⌊(n + 2p − k)/s⌋ + 1\nnew weight = old weight − learning rate × gradient',
    boundary: 'Scope: this page uses one grey channel, a single 3×3 kernel and no bias term (apart from the step 4 threshold c); the step 4 second layer is a hand-set 1×1 combination. Real CNNs take colour, multi-channel input, use dozens to hundreds of kernels per layer, and learn all the weights together with backpropagation. The step 5 target comes from a known kernel, so a perfect answer exists; in real tasks the targets are class labels, with no such “answer kernel”. The learning-rate limit of about 0.56 belongs to this training image only.',
    linksTitle: 'Where to go next',
    lk1: '→ Convolution, step 4: image kernels (mathematical convolution flips the kernel)',
    lk2: '→ Gradient descent, step 0: why too large a learning rate diverges',
    lk3: '→ Backpropagation, step 2: how gradients are passed back layer by layer',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “CNN Feature Maps · How a Small Window “Sees” an Image”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshCnn === 'function') window.refreshCnn();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CNN_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
