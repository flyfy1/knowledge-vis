'use strict';
// Definite-integral lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '定积分 · 切细、加起来、夹出真值',
    back: '← 知识索引',
    compare: '对照另一版本：定积分 · 把小条加回整体 →',
    navLabel: '定积分步骤导航',
    tagline: '长方形、三角形的面积有公式，曲线围出来的面积没有。办法是切：数格子、切长条，把一块块小面积加起来，让上下两个估计从两边把真值夹住。七步里你会看到这个「切细再加」的极限叫定积分，它不只算面积，还能算路程；最后发现求它有捷径：倒着用导数。',
    nav0: '0 数格子', nav1: '1 切长条', nav2: '2 算路程', nav3: '3 带符号', nav4: '4 累加函数', nav5: '5 自测', nav6: '6 收束',

    s0k: '第 0 步 · 没有公式怎么办',
    s0t: '曲线下的面积没有公式，至少能把它夹在两个数之间吗？',
    s0e: '这一步要回答：y = x² 在 x 从 0 到 1 这一段，曲线和 x 轴之间的那块面积是多少？它一边是弯的，长方形、三角形公式都不对口。最朴素的办法是<strong>数格子</strong>：把边长为 1 的正方形切成 N × N 个小格，每格面积 1/N²。完全落在曲线下方的格子（绿色）加起来比真面积小；凡是碰到这块区域的格子（橙色框，含绿色）加起来比真面积大。真面积一定夹在两者之间。左图横轴 x、纵轴 y；右图记下你试过的每种格子给出的上下界，竖条越短，夹得越紧。',
    gridSlider: '每边切成 N 格',
    c0a: '数格子：{N} × {N} 格', c0b: '面积的上下界 · 横轴是 N',
    lg0In: '完全在曲线下方的格子', lg0Touch: '碰到这块区域的格子', lg0Curve: 'y = x²', lg0Bar: '试过的 N 给出的范围',
    s0readout: '{N} × {N} 格，每格面积 1/{NN}：完全在曲线下方的有 {inside} 格，碰到区域的有 {touch} 格。所以面积在 {lo} 和 {hi} 之间，夹缝宽 {gap}。',
    s0hint: '观察顺序：把 N 从 4 一档档加到 40，看左图绿色格子越来越贴近曲线、橙色框越来越少；右图每档留一根竖条，竖条一根比一根短。格子越细，夹缝越窄，但数格子很费力，下一步换一种更省事的切法。',

    s1k: '第 1 步 · 切长条',
    s1t: '把区域切成 n 条长方形，估计会不会自己变准？',
    s1e: '这一步要回答：怎样让估计随切得更细而自动变准，并且能算出来？把 [0, 1] 等分成 n 条，每条宽 1/n，每条用一个长方形代替：高度取这条左端的函数值叫<strong>左和</strong> L，取右端叫<strong>右和</strong> R，取中点叫中点和 M。这种「高 × 宽，再全部加起来」的和统称<strong>黎曼和</strong>。x² 在这里是增函数，所以左和偏小、右和偏大，真面积夹在中间；算出来 Lₙ = (n − 1)(2n − 1)/(6n²)，Rₙ = (n + 1)(2n + 1)/(6n²)。右图横轴是 n（每格翻一倍），纵轴是和，每试一个 n 就留下 L、R 两个点。',
    nSlider: '条数 n', modeL: '左端点取高', modeR: '右端点取高', modeM: '中点取高',
    modeNameL: '左和', modeNameR: '右和', modeNameM: '中点和',
    c1a: '{n} 条长方形（{mode}）', c1b: '左和、右和随 n · 横轴是 n',
    lg1Strip: '长方形条', lg1L: '左和 L', lg1R: '右和 R', lg1Third: '两侧共同贴近的数',
    s1readout: 'n = {n}，每条宽 1/{n}：左和 L = {L}，右和 R = {R}，中点和 M = {Mm}。真面积在 L 和 R 之间，夹缝 R − L = {gap}，正好是 1/{n}。图上画的是{mode}，共 {sum}。',
    s1more: '继续加大 n：夹缝每次减半。试到 n ≥ 16，看 L 和 R 贴向哪个数。',
    s1concl: 'n 每翻一倍，夹缝减半，L 和 R 从两侧贴向同一个数 1/3（Lₙ、Rₙ 的式子在 n 无限大时都趋于 2n²/6n² = 1/3）。这个数叫 y = x² 在 [0, 1] 上的<strong>定积分</strong>，写作 ∫₀¹ x² dx = 1/3：∫ 是拉长的 S（sum，求和），x² 是每条的高，dx 是每条的宽，被无限切细。取哪一点的高，只影响贴近得快慢（中点和快得多），不影响最后的数。',
    s1hint: '观察顺序：先用「左端点取高」把 n 从 1 拖到 64，看长方形一级级贴紧曲线；右图两串点从上下两侧往中间的虚线挤。再切成「右端点取高」「中点取高」对比：中点和在 n = 4 时就已经很接近。',

    s2k: '第 2 步 · 不只是面积',
    s2t: '把高换成速度、宽换成时间，加起来是什么？',
    s2e: '这一步要回答：同一台「切条加总」的机器，换成速度图会算出什么？一辆车刹车：t 秒时速度 v = 12 − 3t（米/秒），4 秒后停下（模拟）。上图横轴是时间 t（秒），纵轴是速度 v（米/秒）。把 4 秒切成 n 段，每段用这段开始时的速度当作整段的速度：速度 × 时间 = 这段走的路程，单位是 m/s × s = m。所以每条长方形的面积就是一段路程，全部加起来就是总路程的估计（<a class="xlink" href="../../../physics/mechanics/velocity-vt/#step2">→ v-t 图第 2 步：为什么图下面积是路程</a>）。下图是一条路，每加一条，车往前开一段。',
    n2Slider: '切成几段 n', drive2: '一段一段开出去',
    c2a: '速度 v（米/秒）随时间 t（秒）', c2b: '路程一段段累加（米）',
    lg2Strip: '每段：速度 × 时间 = 路程', lg2Road: '已累加的路程', lg2Exact: '真实路程 24 m',
    s2progress: '已加 {c}/{N} 段。',
    s2readout: '{prog}{n} 段，每段 {w} s：合计 {sum} m，比真实路程 24 m 多 {e} m（= 24/{n}）。多出来是因为车在减速，每段都按开头那一刻较快的速度算。',
    s2hint: '观察顺序：先按「一段一段开出去」，看上图长方形逐条亮起、下图的车一段段前进，每段长度就等于对应长方形的面积；再加大 n，看总数从 48 m 一路降到 24.75 m，贴近 24 m。真实路程 24 m 是三角形面积 ½ × 4 × 12。',

    s3k: '第 3 步 · 带符号的累加',
    s3t: '曲线跑到 x 轴下方时，那部分怎么算？',
    s3e: '这一步要回答：被积函数有正有负时，定积分算的是什么？看 y = x² − 1，从 x = 0 积到 x = b。在 x < 1 时 y 为负，长方形「高」是负数，高 × 宽也是负数。定积分把这些带正负号的小块照样加起来，所以 x 轴下方的部分算作负的，结果可以为负，也可以为 0。图中横轴 x、纵轴 y；青色条在 x 轴上方（正），粉色条在下方（负），条宽 0.05。',
    bSlider: '上限 b', zero3: '跳到正负抵消的 b = √3',
    c3: 'y = x² − 1，从 0 积到 {b}',
    lg3Pos: '在 x 轴上方：算正', lg3Neg: '在 x 轴下方：算负',
    s3readout: 'b = {b}：x 轴上方部分 +{pos}，下方部分 {neg}，合起来 ∫₀ᵇ (x² − 1) dx = {net}。{note}',
    s3noteNeg: '下方那块更大，结果是负数：定积分不是面积，是带符号的累加。',
    s3notePos: '上方那块更大，结果是正数；但它仍小于两块面积之和 {abs}。',
    s3noteZero: '两块正好抵消，积分为 0，可两块面积都不是 0。',
    s3hint: '观察顺序：把 b 从 0.1 拖到 1，只有粉色条，积分越来越负；越过 1 后青色条出现，结果开始回升；按按钮跳到 b = √3 ≈ 1.732，正负恰好抵消。',

    s4k: '第 4 步 · 累加函数与导数',
    s4t: '精确值 1/3 不靠切无穷条，能直接算出来吗？',
    s4e: '这一步要回答：有没有不用一直切下去也能拿到精确值的办法？把上限变成变量：A(x) = 从 0 累加到 x 的面积，即 ∫₀ˣ t² dt，叫<strong>累加函数</strong>。A(x) 是累加了多少，它增长得多快是另一回事：在 x 处再多加一条宽 dx 的窄条，A 增加的量 ≈ 这条的高 × 宽 = x² · dx，所以「增加量 ÷ dx」应该接近 x²。这正是导数的意思（<a class="xlink" href="../../../math/calculus/derivative/#step1">→ 导数第 1 步：割线斜率怎样逼近切线斜率</a>）。上图横轴 x、纵轴 y = x²；下图纵轴是 A(x)，青线是用 400 条细条数值累加描出的示意线。',
    x4Slider: '累加到 x', dxSlider: '再多加一条，宽 dx',
    c4a: 'y = x²：从 0 累加到 x，再多加一条宽 dx', c4b: '累加函数 A(x)',
    lg4Area: '已累加的面积 A(x)', lg4Strip: '新加的窄条', lg4Trace: 'A(x)（400 条细条累加的示意描线）', lg4Exact: 'x³/3',
    s4readout: 'x = {x}：A(x) = {A}（描线的数值累加给出 ≈ {Ad}）。再加宽 {dx} 的一条，A 增加 {dA}；增加量 ÷ 宽度 = {rate}，而 x² = {f}，只多 {ex}。dx 越小，两者越接近：A 增长的快慢就是 x²。',
    s4concl: '所以 A 的导数 A′(x) = x²。导数等于 f 的函数叫 f 的<strong>原函数</strong>；x³/3 就是 x² 的一个原函数（求导：(x³/3)′ = x²），青色描线和虚线 x³/3 也确实重合。<strong>微积分基本定理</strong>（牛顿—莱布尼茨公式）：∫ₐᵇ f(x) dx = F(b) − F(a)，F 是 f 的任一原函数。于是 ∫₀¹ x² dx = 1³/3 − 0³/3 = 1/3，不必切无穷条。积分与导数是一对相反的运算。',
    s4hint: '观察顺序：先固定 dx = 0.5，拖 x，看「增加量 ÷ 宽度」总比 x² 大一截；再把 dx 换成 0.2、0.1、0.01，看多出的那一截缩到几乎为 0。最后看下图：数值描线（青）和 x³/3（虚线）贴在一起。',

    s5k: '第 5 步 · 自测',
    s5t: '不看提示，能算、能判断吗？',
    s5e: '这一步要回答：用几何法、夹逼、带符号累加和原函数这四样工具，你能自己算出或判断定积分吗？四题分别对应第 0、1、3、4 步。',
    q1Prompt: '① ∫₀² x dx 等于多少？（提示：y = x 下方是什么形状？）',
    q1A: '1', q1B: '2', q1C: '4',
    q2Prompt: '② y = x² 在 [0, 1] 上切 4 条：左和 0.21875、右和 0.46875。下面哪句对？',
    q2A: '左和偏大、右和偏小', q2B: '左和偏小、右和偏大，真值 1/3 夹在中间', q2C: '两者都等于真值',
    q3Prompt: '③ 「定积分算出来的永远是面积，所以不会是负数。」',
    q3A: '对', q3B: '不对：它是带符号的累加，也可以是路程等量',
    q4Prompt: '④ 用原函数 x³/3，∫₁² x² dx 等于多少？',
    q4A: '7/3', q4B: '8/3', q4C: '3',
    check: '检查', pick: '先选一个答案。',
    q1ok: '对。y = x 下方从 0 到 2 是直角三角形，底 2、高 2，面积 ½ × 2 × 2 = 2。',
    q1no: '再看：y = x、x 轴和竖线 x = 2 围成直角三角形，底 2、高 2。',
    q2ok: '对。x² 在 [0, 1] 上递增，每条左端最低、右端最高，所以 L < 1/3 < R，夹缝 R − L = 1/4。',
    q2no: '回到第 1 步看 n = 4：x² 递增，左端取高的长方形都在曲线下方，右端取高的都伸出曲线。',
    q3ok: '对。曲线在 x 轴下方的部分算负的（第 3 步），高换成速度时累加的是路程（第 2 步）。',
    q3no: '回到第 3 步：y = x² − 1 从 0 积到 1 时结果是 −2/3。',
    q4ok: '对。F(2) − F(1) = 8/3 − 1/3 = 7/3 ≈ 2.33。',
    q4no: '用 F(x) = x³/3：F(2) − F(1) = 8/3 − 1/3。8/3 是从 0 积到 2 的结果。',

    s6k: '第 6 步 · 收束', s6t: '切细、加起来、取极限；求它，就倒着用导数',
    s6fin: '<strong>第 0 步</strong>：曲边面积没有公式，但数格子能把它夹在两个数之间，格子越细夹得越紧。<strong>第 1 步</strong>：切成 n 条长方形，左和、右和从两侧夹住真值，夹缝正好 1/n；n 无限大时两边贴到的数就是定积分 ∫₀¹ x² dx = 1/3。<strong>第 2 步</strong>：高是速度、宽是时间时，加起来的是路程，定积分是「高 × 宽」的累加，不只是面积。<strong>第 3 步</strong>：x 轴下方算负，定积分是带符号的累加。<strong>第 4 步</strong>：累加函数 A(x) 的增长速度就是被积函数，于是 ∫ₐᵇ f(x) dx = F(b) − F(a)。',
    formula: '∫ₐᵇ f(x) dx = lim Σ f(xᵢ)·Δx　（n → ∞）\n∫ₐᵇ f(x) dx = F(b) − F(a)，F′ = f\n∫₀¹ x² dx = 1/3',
    boundary: '适用范围：本页的被积函数都是连续函数，左和、右和、中点和收敛到同一个数；不连续得厉害的函数可能不行。「左和偏小、右和偏大」只在函数递增时成立（第 2 步的刹车速度递减，左和反而偏大）。第 4 步的描线是 400 条细条的数值累加，只是示意，精确值来自原函数。第 2 步的刹车是模拟数据。以后还会用定积分算旋转体的体积、概率分布下的概率。',
    linksTitle: '接着去哪',
    lk1: '→ 速度与 v-t 图第 2 步：图下面积为什么是路程',
    lk2: '→ 导数第 1 步：割线怎样变成切线，导数从哪来',
    lk3: '→ 极限与 ε–δ 第 0 步：「无限贴近」的严格说法',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《定积分 · 把小条加回整体》的平行版本。'
  },
  en: {
    pageTitle: 'The Definite Integral · Slice, Add, Squeeze',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Definite Integral · Adding the Strips Back Up →',
    navLabel: 'Definite integral steps',
    tagline: 'Rectangles and triangles have area formulas; a region bounded by a curve does not. The way in is to slice: count squares, cut strips, add up the small pieces, and let an under-estimate and an over-estimate pin the true value between them. In seven steps you will see that the limit of “slice finer, add up” is the definite integral, that it measures distance as well as area, and that there is a shortcut to it: run the derivative backwards.',
    nav0: '0 Count squares', nav1: '1 Cut strips', nav2: '2 Distance', nav3: '3 Signs', nav4: '4 Accumulation', nav5: '5 Quiz', nav6: '6 Wrap-up',

    s0k: 'Step 0 · No formula, now what?',
    s0t: 'There is no formula for the area under a curve. Can you at least trap it between two numbers?',
    s0e: 'The question: how big is the region between y = x² and the x-axis for x from 0 to 1? One side is curved, so no rectangle or triangle formula fits. The most basic approach is to <strong>count squares</strong>: cut the unit square into N × N small squares, each of area 1/N². The squares lying entirely under the curve (green) add up to less than the true area; every square that touches the region (orange outline, green ones included) adds up to more. The true area must lie between the two. On the left, across is x and up is y; on the right, each grid size you try leaves a bar from its lower to its upper bound, and the shorter the bar, the tighter the trap.',
    gridSlider: 'Squares per side N',
    c0a: 'Counting squares: {N} × {N} grid', c0b: 'Bounds on the area · across: N',
    lg0In: 'Squares fully under the curve', lg0Touch: 'Squares touching the region', lg0Curve: 'y = x²', lg0Bar: 'Range from each N tried',
    s0readout: '{N} × {N} grid, each square 1/{NN}: {inside} squares lie fully under the curve and {touch} touch the region. So the area is between {lo} and {hi}, a gap of {gap}.',
    s0hint: 'What to try: step N up from 4 to 40. On the left the green squares creep up to the curve and the orange outlines thin out; on the right each N leaves a bar, each shorter than the last. Finer squares mean a narrower gap, but counting them is tedious, so the next step slices more cleverly.',

    s1k: 'Step 1 · Cut strips',
    s1t: 'Slice the region into n rectangles. Does the estimate improve by itself?',
    s1e: 'The question: how do you get an estimate that sharpens automatically as you slice finer, and that you can actually compute? Split [0, 1] into n strips of width 1/n and replace each by a rectangle. Taking the height at each strip’s left end gives the <strong>left sum</strong> L; the right end gives the <strong>right sum</strong> R; the midpoint gives the midpoint sum M. Sums of this “height × width, then add everything” kind are called <strong>Riemann sums</strong>. Here x² is increasing, so the left sum falls short and the right sum overshoots, with the true area between; worked out, Lₙ = (n − 1)(2n − 1)/(6n²) and Rₙ = (n + 1)(2n + 1)/(6n²). In the right plot, across is n (doubling at each mark) and up is the sum; each n you try leaves an L dot and an R dot.',
    nSlider: 'Number of strips n', modeL: 'Height at left end', modeR: 'Height at right end', modeM: 'Height at midpoint',
    modeNameL: 'left sum', modeNameR: 'right sum', modeNameM: 'midpoint sum',
    c1a: '{n} rectangles ({mode})', c1b: 'Left and right sums · across: n',
    lg1Strip: 'Rectangles', lg1L: 'Left sum L', lg1R: 'Right sum R', lg1Third: 'The number both sides approach',
    s1readout: 'n = {n}, strips 1/{n} wide: left sum L = {L}, right sum R = {R}, midpoint sum M = {Mm}. The true area lies between L and R, and the gap R − L = {gap} is exactly 1/{n}. The plot shows the {mode}, totalling {sum}.',
    s1more: 'Keep raising n: the gap halves each time. Go to n ≥ 16 and see which number L and R close in on.',
    s1concl: 'Each doubling of n halves the gap, and L and R close in on the same number, 1/3, from either side (as n grows without bound both formulas tend to 2n²/6n² = 1/3). That number is the <strong>definite integral</strong> of y = x² over [0, 1], written ∫₀¹ x² dx = 1/3: ∫ is a stretched S (for sum), x² is each strip’s height and dx its width, sliced infinitely thin. Which point you take the height at changes only how fast the sums close in (the midpoint sum is much faster), not where they end up.',
    s1hint: 'What to try: with “height at left end”, drag n from 1 to 64 and watch the rectangles hug the curve step by step; in the right plot the two rows of dots squeeze in on the dashed line from above and below. Then compare the right-end and midpoint versions: the midpoint sum is already very close at n = 4.',

    s2k: 'Step 2 · More than area',
    s2t: 'Make the height a speed and the width a time. What do you add up?',
    s2e: 'The question: feed a speed graph into the same “slice and add” machine, and what comes out? A car brakes: at time t its speed is v = 12 − 3t metres per second, and it stops after 4 seconds (a simulation). In the top plot, across is time t (seconds) and up is speed v (metres per second). Cut the 4 seconds into n slices and treat each slice as if the car kept the speed it had at the start: speed × time is the distance for that slice, in m/s × s = m. So each rectangle’s area is a stretch of road, and adding them all estimates the total distance (<a class="xlink" href="../../../physics/mechanics/velocity-vt/#step2">→ v–t graphs, step 2: why the area under the graph is distance</a>). The bottom strip is the road: every rectangle you add moves the car on by one stretch.',
    n2Slider: 'Number of slices n', drive2: 'Drive it, one slice at a time',
    c2a: 'Speed v (m/s) against time t (s)', c2b: 'Distance, added slice by slice (m)',
    lg2Strip: 'Each slice: speed × time = distance', lg2Road: 'Distance added so far', lg2Exact: 'True distance 24 m',
    s2progress: '{c}/{N} slices added. ',
    s2readout: '{prog}{n} slices of {w} s: total {sum} m, {e} m more than the true 24 m (that is 24/{n}). The excess comes from braking: every slice uses the faster speed from its start.',
    s2hint: 'What to try: press “Drive it” and watch the rectangles in the top plot light up one by one while the car below moves on by one stretch each time; each stretch is as long as its rectangle’s area. Then raise n: the total drops from 48 m to 24.75 m, closing in on 24 m. The true 24 m is the triangle’s area, ½ × 4 × 12.',

    s3k: 'Step 3 · Accumulating with signs',
    s3t: 'When the curve dips below the x-axis, how does that part count?',
    s3e: 'The question: what does a definite integral measure when the function is sometimes negative? Take y = x² − 1 and integrate from x = 0 to x = b. For x < 1, y is negative, so the rectangle “height” is negative and height × width is negative too. The definite integral adds these signed pieces just the same, so the part below the x-axis counts as negative, and the result can be negative or even zero. Across is x and up is y; cyan strips are above the axis (positive), pink strips below (negative), each 0.05 wide.',
    bSlider: 'Upper limit b', zero3: 'Jump to b = √3, where the signs cancel',
    c3: 'y = x² − 1, integrated from 0 to {b}',
    lg3Pos: 'Above the x-axis: counts positive', lg3Neg: 'Below the x-axis: counts negative',
    s3readout: 'b = {b}: the part above the axis gives +{pos}, the part below gives {neg}, so ∫₀ᵇ (x² − 1) dx = {net}. {note}',
    s3noteNeg: 'The part below is bigger, so the result is negative: a definite integral is a signed total, not an area.',
    s3notePos: 'The part above is bigger, so the result is positive, but still smaller than the two areas added, {abs}.',
    s3noteZero: 'The two parts cancel exactly: the integral is 0, though neither area is.',
    s3hint: 'What to try: drag b from 0.1 to 1: only pink strips, and the integral grows more negative. Past 1 the cyan strips appear and the total climbs back; press the button to jump to b = √3 ≈ 1.732, where the signs cancel exactly.',

    s4k: 'Step 4 · Accumulation and the derivative',
    s4t: 'Can you get the exact 1/3 without slicing forever?',
    s4e: 'The question: is there a way to the exact value that does not need endless slicing? Let the upper limit vary: A(x) = the area accumulated from 0 to x, that is ∫₀ˣ t² dt, called the <strong>accumulation function</strong>. How much A has accumulated is one thing; how fast it is growing is another. Add one more thin strip of width dx at x, and A grows by about height × width = x² · dx, so “growth ÷ dx” should be close to x². That is exactly what a derivative is (<a class="xlink" href="../../../math/calculus/derivative/#step1">→ Derivatives, step 1: how a secant’s slope closes in on the tangent’s</a>). In the top plot, across is x and up is y = x²; in the bottom plot, up is A(x), traced in cyan by adding up 400 thin strips.',
    x4Slider: 'Accumulate up to x', dxSlider: 'One more strip, width dx',
    c4a: 'y = x²: accumulated from 0 to x, plus one strip of width dx', c4b: 'Accumulation function A(x)',
    lg4Area: 'Area accumulated, A(x)', lg4Strip: 'The added strip', lg4Trace: 'A(x) (traced from 400 thin strips)', lg4Exact: 'x³/3',
    s4readout: 'x = {x}: A(x) = {A} (the traced numerical sum gives ≈ {Ad}). Add a strip {dx} wide and A grows by {dA}; growth ÷ width = {rate}, while x² = {f}: an excess of only {ex}. The smaller dx, the closer they get: A grows at the rate x².',
    s4concl: 'So A’s derivative is A′(x) = x². A function whose derivative is f is called an <strong>antiderivative</strong> of f; x³/3 is one for x² (differentiate it: (x³/3)′ = x²), and indeed the cyan trace sits right on the dashed x³/3. The <strong>fundamental theorem of calculus</strong> (the Newton–Leibniz formula): ∫ₐᵇ f(x) dx = F(b) − F(a) for any antiderivative F of f. Hence ∫₀¹ x² dx = 1³/3 − 0³/3 = 1/3, no endless slicing needed. Integration and differentiation undo each other.',
    s4hint: 'What to try: hold dx at 0.5 and drag x: “growth ÷ width” always comes out a bit above x². Then switch dx to 0.2, 0.1 and 0.01 and watch the excess shrink to almost nothing. Finally check the bottom plot: the numerical trace (cyan) and x³/3 (dashed) lie on top of each other.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Without the hints, can you compute and judge?',
    s5e: 'The question: with four tools — geometry, squeezing, signed accumulation and antiderivatives — can you work out or judge a definite integral yourself? The questions go back to steps 0, 1, 3 and 4.',
    q1Prompt: '① What is ∫₀² x dx? (Hint: what shape is under y = x?)',
    q1A: '1', q1B: '2', q1C: '4',
    q2Prompt: '② Slicing y = x² on [0, 1] into 4 strips gives a left sum of 0.21875 and a right sum of 0.46875. Which is true?',
    q2A: 'The left sum overshoots and the right sum falls short', q2B: 'The left sum falls short and the right sum overshoots; 1/3 lies between', q2C: 'Both equal the true value',
    q3Prompt: '③ “A definite integral always gives an area, so it can never be negative.”',
    q3A: 'True', q3B: 'False: it is a signed total, and can be a distance or other quantity',
    q4Prompt: '④ Using the antiderivative x³/3, what is ∫₁² x² dx?',
    q4A: '7/3', q4B: '8/3', q4C: '3',
    check: 'Check', pick: 'Pick an answer first.',
    q1ok: 'Right. Under y = x from 0 to 2 is a right triangle with base 2 and height 2: ½ × 2 × 2 = 2.',
    q1no: 'Look again: y = x, the x-axis and the line x = 2 make a right triangle with base 2 and height 2.',
    q2ok: 'Right. x² increases on [0, 1], so each strip is lowest at its left end and highest at its right: L < 1/3 < R, with gap R − L = 1/4.',
    q2no: 'Go back to step 1 with n = 4: x² is increasing, so left-height rectangles sit under the curve and right-height ones poke above it.',
    q3ok: 'Right. Parts below the x-axis count as negative (step 3), and with speed as the height the total is a distance (step 2).',
    q3no: 'Go back to step 3: integrating y = x² − 1 from 0 to 1 gives −2/3.',
    q4ok: 'Right. F(2) − F(1) = 8/3 − 1/3 = 7/3 ≈ 2.33.',
    q4no: 'Use F(x) = x³/3: F(2) − F(1) = 8/3 − 1/3. 8/3 is the integral from 0 to 2.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Slice, add, take the limit; to compute it, run the derivative backwards',
    s6fin: '<strong>Step 0</strong>: there is no formula for a curved area, but counting squares traps it between two numbers, and finer squares trap it tighter. <strong>Step 1</strong>: with n rectangles, the left and right sums squeeze the true value from either side with a gap of exactly 1/n; the number both reach as n grows without bound is the definite integral, ∫₀¹ x² dx = 1/3. <strong>Step 2</strong>: with speed as the height and time as the width, the total is a distance; a definite integral adds up height × width, not only area. <strong>Step 3</strong>: below the x-axis counts negative, so it is a signed total. <strong>Step 4</strong>: the accumulation function A(x) grows at the rate of the function being integrated, which gives ∫ₐᵇ f(x) dx = F(b) − F(a).',
    formula: '∫ₐᵇ f(x) dx = lim Σ f(xᵢ)·Δx   (n → ∞)\n∫ₐᵇ f(x) dx = F(b) − F(a),  F′ = f\n∫₀¹ x² dx = 1/3',
    boundary: 'Scope: every function integrated here is continuous, so the left, right and midpoint sums all reach the same number; badly discontinuous functions may not. “Left sum short, right sum over” holds only for increasing functions (the braking speed in step 2 decreases, so there the left sum overshoots). The step-4 trace is a numerical sum of 400 thin strips, for illustration; the exact values come from the antiderivative. The braking car in step 2 is simulated. Later you will use definite integrals for volumes of revolution and for probabilities under a distribution.',
    linksTitle: 'Where to go next',
    lk1: '→ Speed and the v–t graph, step 2: why the area under the graph is distance',
    lk2: '→ Derivatives, step 1: how a secant becomes a tangent, and where derivatives come from',
    lk3: '→ Limits and ε–δ, step 0: the precise version of “arbitrarily close”',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Definite Integral · Adding the Strips Back Up”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
