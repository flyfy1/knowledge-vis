'use strict';
// Newton's method lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '牛顿法 · 顺着切线找零点',
    back: '← 知识索引',
    compare: '对照另一版本：牛顿法求根 · 沿切线一刀跳向零点 →',
    navLabel: '牛顿法步骤导航',
    tagline: '想求 √2，也就是让 x² − 2 = 0 的那个 x。曲线不好解，直线好解：在当前猜测处画一条切线，看它在哪儿穿过横轴，就是下一个猜测。七步里你会看到这一招为什么每步让正确位数大约翻倍，什么时候它会慢下来、来回打转或被甩到远处，以及起点怎样决定它最后落到哪个根。',
    nav0: '0 一条切线', nav1: '1 反复做', nav2: '2 位数翻倍', nav3: '3 重根变慢', nav4: '4 失灵', nav5: '5 起点与归宿', nav6: '6 收束',

    s0k: '第 0 步 · 一条切线',
    s0t: '手里有一个猜测 x₀，怎样用切线得到更好的猜测？',
    s0e: '这一步要回答：已知 f(x) = x² − 2 在 x₀ 处的值和斜率，怎样算出离 √2 更近的 x₁？使 f(x) = 0 的 x 叫 f 的<strong>根</strong>，这里就是 √2 ≈ 1.41421。曲线在 x₀ 处的<strong>切线</strong>是过点 (x₀, f(x₀))、斜率等于导数 f′(x₀) 的直线（<a class="xlink" href="../../../math/calculus/derivative/#step1">→ 导数页第 1 步：割线逼近切线</a>）。在 x₀ 附近，切线和曲线几乎重合，所以把「曲线的零点」换成「切线的零点」：解 f(x₀) + f′(x₀)(x − x₀) = 0，得 <strong>x₁ = x₀ − f(x₀) / f′(x₀)</strong>。上图橙线是切线，绿点是 x₁。下图横轴是 x₀，纵轴是<strong>误差</strong>（与真根的距离）的对数刻度：每往下一格，误差缩小到十分之一。灰线是 x₀ 的误差，青线是走一步之后 x₁ 的误差。',
    c0: 'x² − 2 的切线与一步后的误差',
    c0a: 'f(x) = x² − 2：x₀ 处的切线与交点 x₁',
    c0b: '误差（对数刻度）随起点 x₀ 变化',
    lgCurve: '曲线 f(x)', lgTangent: '切线', lgX0: '当前猜测 x₀', lgX1: '新猜测 x₁', s0lgE0: 'x₀ 的误差', s0lgE1: 'x₁ 的误差（点 = 试过的 x₀）',
    x0Slider: '起点 x₀', clearTrail: '清空试过的点',
    s0readout: 'x₀ = {x0}：f(x₀) = {f}，f′(x₀) = {d}，x₁ = x₀ − f/f′ = {x1}。误差从 {e0} 变成 {e1}；新误差 ÷ 旧误差² = {q}，正好等于 1/(2x₀) = {c}。',
    s0hint: '观察顺序：把 x₀ 从 3.5 慢慢拖到 1.5：上图绿点总落在 √2 的右边、而且比 x₀ 更靠近绿色虚线；下图青线始终在灰线下方，越靠近 √2 两者差得越多（误差 0.1 走一步变成约 0.003）。再把 x₀ 拖到 0.47（√2 的三分之一）以下：切线很平，x₁ 被甩到右边很远，这时一步反而让误差变大。适用条件：f′(x₀) ≠ 0。',

    s1k: '第 1 步 · 反复做',
    s1t: '一步不够，把新猜测再当起点，会怎样？',
    s1e: '这一步要回答：把 x₁ 当新的起点再做一次、一直做下去，猜测会怎样变化？把上一步的输出当作下一步的输入，叫<strong>迭代</strong>：x₂ = x₁ − f(x₁)/f′(x₁)，以此类推，这就是<strong>牛顿法</strong>。上图每一步先从 xₙ 竖直走到曲线（灰色虚线），再顺着切线滑到横轴（橙线），落点就是 xₙ₊₁。下图是每一步的<strong>正确位数</strong> = −log₁₀(相对误差)，相对误差是误差 ÷ 根的大小；例如 3 位表示前 3 位有效数字已经对了。双精度浮点数最多大约 16 位，所以柱子到 16 封顶。三个函数可选：x² − 2（根 √2）、cos x − x（根约 0.739，没有初等公式）、eˣ − 3（根 ln 3）。',
    c1: '牛顿法逐步迭代的路径与正确位数',
    c1a: '{fn}：竖直到曲线，再顺切线到横轴',
    c1b: '每步的正确位数（16 = 双精度上限）',
    s1lgX: '各步的猜测 xₙ（绿 = 最新）', lgRoot: '真根', s1lgBar: '正确位数',
    fnSq2: 'x² − 2', fnCos: 'cos x − x', fnExp: 'eˣ − 3',
    fnNameSq2: 'f(x) = x² − 2', fnNameCos: 'f(x) = cos x − x', fnNameExp: 'f(x) = eˣ − 3',
    oneStep: '走一步', runAll: '连续走到第 8 步', restart: '回到起点',
    s1row: 'x{i} = {x}（{d} 位）', sep: '；',
    s1readout: '已走 {n}/{N} 步，真根 = {root}。',
    s1hint: '观察顺序：先选 x² − 2，按「走一步」三四次：上图的橙色折线越来越短，很快就看不出来了；下图的柱子先慢后快，大约 0.5 → 1.5 → 3.3 → 6.8 → 13.9 位，每步接近翻倍。再换 cos x − x、eˣ − 3 重复。改起点或换函数会回到第 0 步。eˣ − 3 从 3.2 出发时前几步较慢，因为起点离根远，切线近似还不准。',

    s2k: '第 2 步 · 位数翻倍',
    s2t: '为什么正确位数每步大约翻一倍？比「每次砍一半」快多少？',
    s2e: '这一步要回答：同样求 √a，牛顿法和二分法各要几步？<strong>二分法</strong>先把根夹在一个区间里（这里是 [0, a]），每次取中点、留下根所在的那一半，误差每步缩小一半，也就是每步只多约 0.3 位（<a class="xlink" href="../../../computing/algorithms/binary-search/#step1">→ 二分查找第 1 步：每次砍掉一半</a>）。牛顿法则不同：靠近根时，新误差 ≈ C × 旧误差²，C = f″/(2f′)（在根处取值），对 x² − a 来说 C = 1/(2√a)。误差平方一次，位数就大约翻一倍：10⁻³ 变成约 10⁻⁶。这叫<strong>二次收敛</strong>。图上横轴是步数，纵轴是正确位数，牛顿法从 x₀ = a 出发。',
    c2: '求 √{a}：每步的正确位数',
    s2lgN: '牛顿法（x₀ = a）', s2lgB: '二分法（区间 [0, a]）', s2lgTen: '10 位',
    aSlider: '被开方数 a',
    s2readout: '√{a} = {r}。达到 10 位：牛顿 {n10} 步，二分 {b10} 步；达到 15 位：牛顿 {n15} 步，二分 {b15} 步。牛顿各步位数：{digs}。靠近根时 新误差 ÷ 旧误差² = {ratios}，理论值 1/(2√a) = {c}。',
    s2hint: '观察顺序：先看 a = 2：橙线前几步几乎贴着底，然后突然竖起来，4 步到 10 位；紫线是一条匀速爬升的斜线，要 29 步。把 a 拖到 100：牛顿要多走几步（起点 100 离根 10 较远，前几步每步只是大约减半），但一旦接近，仍然几步就到 15 位。本页 a = 2…100 中，牛顿到 10 位要 4–7 步，二分要 27–35 步（a = 4、16、64 时二分的中点恰好落在根上，是巧合，不计）。',

    s3k: '第 3 步 · 重根',
    s3t: '根是「切」过横轴而不是「穿」过去时，还那么快吗？',
    s3e: '这一步要回答：如果曲线在根处与横轴相切，牛顿法会怎样？用 f(x) = (x − 1)^k (x + 1)：k = 1 时曲线在 x = 1 处穿过横轴，这叫<strong>单根</strong>；k = 2 或 3 时曲线在那里贴着横轴，这叫 k <strong>重根</strong>，此时 f′(1) = 0。上一步的二次收敛要求 f′(根) ≠ 0。重根附近 f 和 f′ 同时趋于 0，每步只把误差乘以一个固定比例 (k − 1)/k：k = 2 时每步减半，k = 3 时每步只缩到 2/3。这叫<strong>线性收敛</strong>，在对数图上是一条直线，而不是越来越陡的曲线。纵轴是误差（对数刻度），横轴是步数。',
    c3: '误差（对数）随步数：f(x) = (x − 1)^k (x + 1)',
    kLabel: '根的重数',
    s3lgK: 'k = {k}',
    s3readout1: 'k = 1（单根），x₀ = {x0}：{n6} 步就把误差降到 10⁻⁶ 以下，之后直接落到舍入误差；靠近根时 新误差 ÷ 旧误差² ≈ {q}（理论 f″/(2f′) = 0.5）。',
    s3readoutK: 'k = {k}，x₀ = {x0}：靠近根时 新误差 ÷ 旧误差 = {r}，理论 (k − 1)/k = {th}；到 10⁻⁶ 要 {n6} 步。误差最小只到 {fl}：再往下 f 的值已小到被舍入误差淹没。',
    s3hint: '观察顺序：先选 k = 1 再选 k = 2、k = 3（试过的曲线会保留）。k = 1 的线像悬崖一样掉下去；k = 2 是一条均匀下降的直线，每步降 log₁₀2 ≈ 0.3 格；k = 3 的直线更平，而且停在 10⁻⁸ 附近不再下降。改起点 x₀，只会让各条线左右平移一点，斜率不变。',

    s4k: '第 4 步 · 失灵',
    s4t: '切线不总是指向根：什么时候牛顿法会走丢？',
    s4e: '这一步要回答：起点选得不好时，会发生什么？用 f(x) = x³ − 2x + 2，它只有一个实根，约 −1.7693。三种麻烦：一是<strong>切线水平</strong>，f′(x₀) = 0 时切线与横轴平行、没有交点（这里在 x = ±√(2/3) ≈ ±0.8165，粉色虚线）；靠近这里时切线很平，下一步被甩到很远。二是<strong>循环</strong>：从 0 出发，切线落在 1；从 1 出发，又落回 0，永远来回跳。三是绕远路：先被甩出去，再慢慢走回来。上图是前 12 步的路径；下图是 xₙ 随步数的变化，超出 −3…3 的点画成空心圈贴在边上。',
    c4: 'x³ − 2x + 2 上的牛顿法：路径与数列',
    c4a: 'f(x) = x³ − 2x + 2：前 12 步的切线路径',
    c4b: 'xₙ 随步数 n 变化（空心 = 超出范围）',
    s4lgFlat: '切线水平处 ±0.8165', s4lgSeq: '各步的 xₙ',
    presets: '试试：',
    s4head: 'x₀ = {x0}，f′(x₀) = {d}：',
    s4root: '第 {at} 步到达根 {r}（误差 < 10⁻⁹）；途中离原点最远到过 x = {far}。',
    s4cycle: '陷入循环：在 {a} 和 {b} 之间来回跳，60 步也到不了根。',
    s4flat: '第 {n} 步落在 x = {x}，这里切线水平，与横轴没有交点，方法无法继续。',
    s4wander: '60 步内既没到根，也没有进入两步一循环。',
    s4hint: '观察顺序：依次按上面的预设。x₀ = 0：上图橙线在 0 和 1 之间来回，下图点在两条水平位置上交替。x₀ = 0.1：起点不在 0，最后仍被吸进同一个循环。x₀ = 0.8165：几乎踩在切线水平处，第一步被甩到 −54407，再用 31 步慢慢走回根。x₀ = −2：4 步就到。x₀ = 0.5：先跳到右边又被弹回左边，8 步到。再自己慢慢拖动起点，找找哪些区间会掉进循环。',

    s5k: '第 5 步 · 起点与归宿',
    s5t: '有好几个根时，起点决定会落到哪一个？',
    s5e: '这一步要回答：f(x) = x³ − x 有三个根 −1、0、1，从不同起点出发会分别落到哪个根？把会落到同一个根的起点全体叫这个根的<strong>吸引盆地</strong>。中间的色带给 −2 到 2 之间每个起点按终点上色：粉 = −1，橙 = 0，青 = 1，灰 = 80 步内没落到任何根。大部分区域很规整：离某个根近，就落到它。但在 1/√5 ≈ 0.447 与 1/√3 ≈ 0.577 之间（以及对称的负数一侧），粉色和青色一段段交替，越靠近 0.447 色带越窄：这里切线很平，一点点起点差别就会把下一步甩到完全不同的地方。0.447 左边紧挨着就是橙色，所以三种归宿在这一点附近挤在一起。下方色带是放大镜：以当前起点为中心、按放大倍数显示一段更窄的区间（上方色带里的白色虚线框）。',
    c5: 'x³ − x 的吸引盆地与放大镜',
    c5a: 'f(x) = x³ − x：从当前起点出发的前 10 步',
    c5b: '起点 −2…2 按终点上色',
    c5c: '放大镜：起点 {lo} … {hi}',
    s5lgA: '落到 −1', s5lgB: '落到 0', s5lgC: '落到 1', s5lgNow: '当前起点', s5lgWin: '放大窗口',
    zoomSlider: '放大倍数（10 的幂）',
    s5to: '第 {n} 步落到根 {r}', s5none: '80 步内没落到任何根',
    s5readout: '起点 {x0}：{where}。放大窗口 {lo} … {hi} 里，颜色切换了 {sw} 次，出现了 {k} 种终点。',
    s5hint: '观察顺序：把起点从 0.3 慢慢拖到 0.7（放大倍数留在 ×10）：0.447 以下是橙色，0.577 以上是青色，中间粉青交替，上图的路径也跟着时而甩向左边、时而落在右边。然后把起点停在 0.447，把放大倍数依次拉到 ×10、×100、×1000：每一级都能在窗口里看到三种颜色、好几次切换，放大并没有让边界变整齐。色带的分辨率等于屏幕像素，像素之间更细的结构看不到。',

    s6k: '第 6 步 · 收束', s6t: '一条切线，一次求解',
    s6fin: '回头看一遍。<strong>第 0 步</strong>：把曲线换成切线，解一个一次方程，得到 x₁ = x₀ − f(x₀)/f′(x₀)。<strong>第 1 步</strong>：反复做，就是牛顿法。<strong>第 2 步</strong>：单根附近误差每步被平方，位数大约翻倍，几步顶得上二分法几十步。<strong>第 3 步</strong>：重根处 f′ = 0，退化成每步乘 (k − 1)/k 的线性收敛，能达到的精度也变差。<strong>第 4 步</strong>：切线水平、循环、被甩远，都是起点不够近时的代价。<strong>第 5 步</strong>：多个根时，起点决定归宿，盆地边界附近极其敏感。',
    formula: 'xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)\n单根：eₙ₊₁ ≈ (f″/2f′)·eₙ²\nk 重根：eₙ₊₁ ≈ ((k − 1)/k)·eₙ',
    boundary: '适用范围：本页是一元、光滑的实函数，用双精度浮点数计算（约 16 位有效数字）。「位数翻倍」只在单根、f′(根) ≠ 0、起点足够近时成立；起点远时前几步可能很慢、发散或循环。第 4 步「循环」「走丢」按 60 步内的表现分类，第 5 步按 80 步内是否到达某个根上色，色带分辨率由屏幕像素决定。实际软件常把牛顿法和二分法结合：先用二分把根夹住，再用牛顿法加速。',
    linksTitle: '接着去哪',
    lk1: '→ 导数，第 1 步：割线怎样逼近切线',
    lk2: '→ 泰勒级数，第 0 步：一项项贴近曲线，切线就是只保留一次项',
    lk3: '→ 二分查找，第 1 步：每次砍掉一半的区间',
    lk4: '→ 梯度下降，第 0 步：沿斜率找最低点，另一种用导数的迭代',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《牛顿法求根 · 沿切线一刀跳向零点》的平行版本。'
  },
  en: {
    pageTitle: 'Newton’s Method · Follow the Tangent to the Root',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Newton’s Method · Leap to the Root Along a Tangent →',
    navLabel: 'Newton’s method steps',
    tagline: 'We want √2, the x that makes x² − 2 = 0. A curve is hard to solve; a straight line is easy. Draw the tangent at your current guess and see where it crosses the axis: that is your next guess. Over seven steps you will see why each step roughly doubles the correct digits, when the method slows down, loops or gets flung far away, and how the starting point decides which root it lands on.',
    nav0: '0 One tangent', nav1: '1 Repeat', nav2: '2 Digits double', nav3: '3 Repeated roots', nav4: '4 Failures', nav5: '5 Where it lands', nav6: '6 Wrap-up',

    s0k: 'Step 0 · One tangent',
    s0t: 'Given a guess x₀, how does a tangent line give a better one?',
    s0e: 'This step asks: knowing the value and the slope of f(x) = x² − 2 at x₀, how do we get an x₁ closer to √2? An x that makes f(x) = 0 is a <strong>root</strong> of f; here it is √2 ≈ 1.41421. The <strong>tangent</strong> at x₀ is the straight line through (x₀, f(x₀)) whose slope is the derivative f′(x₀) (<a class="xlink" href="../../../math/calculus/derivative/#step1">→ Derivative, step 1: secants closing in on the tangent</a>). Near x₀ the tangent and the curve almost coincide, so we swap “where the curve hits zero” for “where the tangent hits zero”: solving f(x₀) + f′(x₀)(x − x₀) = 0 gives <strong>x₁ = x₀ − f(x₀) / f′(x₀)</strong>. In the top panel the orange line is the tangent and the green dot is x₁. The bottom panel puts x₀ across and the <strong>error</strong> (distance from the true root) up the side on a log scale: each grid line down means ten times smaller. Grey is the error of x₀, cyan the error of x₁ after one step.',
    c0: 'Tangent to x² − 2 and the error after one step',
    c0a: 'f(x) = x² − 2: tangent at x₀ and where it lands, x₁',
    c0b: 'Error (log scale) against the starting point x₀',
    lgCurve: 'curve f(x)', lgTangent: 'tangent', lgX0: 'current guess x₀', lgX1: 'new guess x₁', s0lgE0: 'error of x₀', s0lgE1: 'error of x₁ (dots = x₀ values tried)',
    x0Slider: 'Starting point x₀', clearTrail: 'Clear tried points',
    s0readout: 'x₀ = {x0}: f(x₀) = {f}, f′(x₀) = {d}, x₁ = x₀ − f/f′ = {x1}. The error goes from {e0} to {e1}; new error ÷ old error² = {q}, exactly 1/(2x₀) = {c}.',
    s0hint: 'What to try: slide x₀ slowly from 3.5 down to 1.5. The green dot always lands right of √2 and closer to the dashed green line than x₀ was; below, the cyan curve stays under the grey one, and the gap widens as you near √2 (an error of 0.1 becomes about 0.003 in one step). Then go below 0.47 (a third of √2): the tangent is nearly flat, x₁ is thrown far to the right, and one step makes the error worse. Assumption: f′(x₀) ≠ 0.',

    s1k: 'Step 1 · Repeat',
    s1t: 'One step is not enough; what if the new guess becomes the next starting point?',
    s1e: 'This step asks: if we restart from x₁, and keep going, how do the guesses evolve? Feeding each output back in as the next input is called <strong>iteration</strong>: x₂ = x₁ − f(x₁)/f′(x₁), and so on. That is <strong>Newton’s method</strong>. In the top panel each step drops straight from xₙ to the curve (dashed grey), then slides down the tangent to the axis (orange), landing on xₙ₊₁. The bottom panel shows the <strong>correct digits</strong> at each step, −log₁₀(relative error), where the relative error is the error divided by the size of the root; 3 digits means the first three significant digits are right. Double-precision numbers carry about 16 digits, so the bars stop at 16. Three functions to try: x² − 2 (root √2), cos x − x (root ≈ 0.739, no closed form) and eˣ − 3 (root ln 3).',
    c1: 'Newton iterations: the path and the correct digits',
    c1a: '{fn}: drop to the curve, slide down the tangent',
    c1b: 'Correct digits per step (16 = double-precision limit)',
    s1lgX: 'guesses xₙ (green = latest)', lgRoot: 'true root', s1lgBar: 'correct digits',
    fnSq2: 'x² − 2', fnCos: 'cos x − x', fnExp: 'eˣ − 3',
    fnNameSq2: 'f(x) = x² − 2', fnNameCos: 'f(x) = cos x − x', fnNameExp: 'f(x) = eˣ − 3',
    oneStep: 'One step', runAll: 'Run to step 8', restart: 'Back to start',
    s1row: 'x{i} = {x} ({d} digits)', sep: '; ',
    s1readout: '{n}/{N} steps taken; true root = {root}.',
    s1hint: 'What to try: pick x² − 2 and press “One step” three or four times. The orange zigzag shrinks until you can no longer see it, while the bars grow slowly and then fast, roughly 0.5 → 1.5 → 3.3 → 6.8 → 13.9 digits, nearly doubling each step. Repeat with cos x − x and eˣ − 3. Changing the start or the function goes back to step 0. From 3.2, eˣ − 3 starts slowly because the start is far from the root and the tangent is still a poor stand-in for the curve.',

    s2k: 'Step 2 · Digits double',
    s2t: 'Why do the correct digits roughly double each step, and how much faster is that than halving?',
    s2e: 'This step asks: to find √a, how many steps do Newton’s method and bisection each need? <strong>Bisection</strong> traps the root in an interval (here [0, a]), takes the midpoint and keeps the half that holds the root. The error halves every step, which adds only about 0.3 digits per step (<a class="xlink" href="../../../computing/algorithms/binary-search/#step1">→ Binary search, step 1: cut the range in half each time</a>). Newton’s method is different: near the root, new error ≈ C × (old error)², with C = f″/(2f′) evaluated at the root; for x² − a, C = 1/(2√a). Squaring the error roughly doubles the digits: 10⁻³ becomes about 10⁻⁶. This is <strong>quadratic convergence</strong>. Steps run across and correct digits up; Newton starts from x₀ = a.',
    c2: 'Finding √{a}: correct digits at each step',
    s2lgN: 'Newton (x₀ = a)', s2lgB: 'bisection (interval [0, a])', s2lgTen: '10 digits',
    aSlider: 'Number under the root, a',
    s2readout: '√{a} = {r}. To reach 10 digits: Newton {n10} steps, bisection {b10}; to reach 15 digits: Newton {n15}, bisection {b15}. Newton’s digits by step: {digs}. Near the root, new error ÷ old error² = {ratios}; theory 1/(2√a) = {c}.',
    s2hint: 'What to try: start with a = 2. The orange line hugs the floor for a few steps, then shoots up: 10 digits in 4 steps. The violet line is a steady ramp that needs 29. Slide a to 100: Newton takes a few more steps (starting at 100 is far from the root 10, and early steps only about halve the error), but once close it still reaches 15 digits in a handful. For a = 2…100 on this page, Newton needs 4–7 steps to reach 10 digits and bisection 27–35 (for a = 4, 16 and 64 a bisection midpoint lands exactly on the root by coincidence; those are left out).',

    s3k: 'Step 3 · Repeated roots',
    s3t: 'When the curve only touches the axis at the root, is it still that fast?',
    s3e: 'This step asks: what happens to Newton’s method when the curve is tangent to the axis at the root? Take f(x) = (x − 1)^k (x + 1). With k = 1 the curve crosses the axis at x = 1: a <strong>simple root</strong>. With k = 2 or 3 it just touches the axis there: a root of <strong>multiplicity</strong> k, where f′(1) = 0. The quadratic convergence of the last step needs f′(root) ≠ 0. Near a repeated root f and f′ both go to 0, and each step only multiplies the error by a fixed factor (k − 1)/k: halving for k = 2, shrinking to 2/3 for k = 3. This is <strong>linear convergence</strong>, a straight line on the log plot instead of an ever-steeper curve. The error (log scale) runs up, the step number across.',
    c3: 'Error (log) by step: f(x) = (x − 1)^k (x + 1)',
    kLabel: 'Multiplicity',
    s3lgK: 'k = {k}',
    s3readout1: 'k = 1 (simple root), x₀ = {x0}: the error is below 10⁻⁶ after {n6} steps and then drops straight to rounding level; near the root, new error ÷ old error² ≈ {q} (theory f″/(2f′) = 0.5).',
    s3readoutK: 'k = {k}, x₀ = {x0}: near the root, new error ÷ old error = {r}, theory (k − 1)/k = {th}; reaching 10⁻⁶ takes {n6} steps. The error bottoms out at {fl}: below that, the values of f are swamped by rounding error.',
    s3hint: 'What to try: pick k = 1, then k = 2 and k = 3 (curves you have tried stay on the chart). The k = 1 line drops off a cliff; k = 2 is a straight line falling log₁₀2 ≈ 0.3 of a decade per step; k = 3 is flatter still and stalls near 10⁻⁸. Changing the start x₀ only shifts the lines a little sideways; the slopes do not change.',

    s4k: 'Step 4 · Failures',
    s4t: 'The tangent does not always point at the root: when does Newton’s method get lost?',
    s4e: 'This step asks: what happens with a poorly chosen start? Take f(x) = x³ − 2x + 2, which has a single real root near −1.7693. Three kinds of trouble. First, a <strong>flat tangent</strong>: where f′(x₀) = 0 the tangent is parallel to the axis and never meets it (here at x = ±√(2/3) ≈ ±0.8165, dashed pink); close to there the tangent is nearly flat and the next step lands far away. Second, a <strong>cycle</strong>: from 0 the tangent lands on 1, from 1 it lands back on 0, forever. Third, the long way round: flung out first, then crawling back. The top panel shows the first 12 steps; the bottom panel shows xₙ by step, with points beyond −3…3 drawn as hollow rings at the edge.',
    c4: 'Newton’s method on x³ − 2x + 2: path and sequence',
    c4a: 'f(x) = x³ − 2x + 2: first 12 tangent steps',
    c4b: 'xₙ by step n (hollow = off the chart)',
    s4lgFlat: 'flat tangent at ±0.8165', s4lgSeq: 'xₙ at each step',
    presets: 'Try:',
    s4head: 'x₀ = {x0}, f′(x₀) = {d}:',
    s4root: 'reaches the root {r} at step {at} (error < 10⁻⁹); on the way it got as far out as x = {far}.',
    s4cycle: 'caught in a cycle, bouncing between {a} and {b}; no root after 60 steps.',
    s4flat: 'step {n} lands on x = {x}, where the tangent is flat and never meets the axis; the method cannot continue.',
    s4wander: 'within 60 steps it neither reaches the root nor settles into a two-step cycle.',
    s4hint: 'What to try: press the presets in turn. x₀ = 0: the orange path bounces between 0 and 1 and the dots below alternate between two levels. x₀ = 0.1: not starting at 0, yet it is pulled into the same cycle. x₀ = 0.8165: almost on the flat-tangent point, the first step is flung to −54407, then it takes 31 steps to walk back to the root. x₀ = −2: there in 4 steps. x₀ = 0.5: jumps right, bounces back left, there in 8. Then drag the start yourself and look for the stretches that fall into the cycle.',

    s5k: 'Step 5 · Where it lands',
    s5t: 'With several roots, how does the starting point decide which one you reach?',
    s5e: 'This step asks: f(x) = x³ − x has three roots, −1, 0 and 1; from each starting point, which one does Newton’s method reach? All the starting points that end at the same root form that root’s <strong>basin of attraction</strong>. The middle strip colours every start between −2 and 2 by where it ends: pink = −1, orange = 0, cyan = 1, grey = no root within 80 steps. Most of it is orderly: start near a root and you reach it. But between 1/√5 ≈ 0.447 and 1/√3 ≈ 0.577 (and the mirror image on the negative side) pink and cyan bands alternate, getting narrower towards 0.447: the tangents there are nearly flat, so a tiny change in the start throws the next step somewhere completely different. Just left of 0.447 the strip turns orange, so all three destinations crowd together around that point. The bottom strip is a magnifier: a narrower range centred on the current start, at the chosen zoom (the dashed white box on the middle strip).',
    c5: 'Basins of attraction of x³ − x, with a magnifier',
    c5a: 'f(x) = x³ − x: first 10 steps from the start',
    c5b: 'Starts −2…2, coloured by where they end',
    c5c: 'Magnifier: starts {lo} … {hi}',
    s5lgA: 'ends at −1', s5lgB: 'ends at 0', s5lgC: 'ends at 1', s5lgNow: 'current start', s5lgWin: 'magnifier window',
    zoomSlider: 'Zoom (power of 10)',
    s5to: 'reaches the root {r} at step {n}', s5none: 'reaches no root within 80 steps',
    s5readout: 'Start {x0}: {where}. In the magnifier window {lo} … {hi} the colour changes {sw} times and {k} different roots appear.',
    s5hint: 'What to try: with the zoom at ×10, slide the start slowly from 0.3 to 0.7. Below 0.447 it is orange, above 0.577 cyan, and in between pink and cyan alternate, while the path above is flung left one moment and lands right the next. Then park the start at 0.447 and raise the zoom to ×10, ×100, ×1000: at every level the window shows all three colours and several switches; zooming in does not tidy the boundary up. The strips are only as fine as the screen pixels, so structure finer than a pixel stays hidden.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One tangent, one easy equation',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: swap the curve for its tangent and solve a linear equation: x₁ = x₀ − f(x₀)/f′(x₀). <strong>Step 1</strong>: repeat, and that is Newton’s method. <strong>Step 2</strong>: near a simple root the error is squared each step, so the digits roughly double; a few steps beat dozens of bisections. <strong>Step 3</strong>: at a repeated root f′ = 0, and convergence slows to linear, multiplying the error by (k − 1)/k each step, with less reachable accuracy. <strong>Step 4</strong>: flat tangents, cycles and wild jumps are the price of starting too far away. <strong>Step 5</strong>: with several roots the start decides the destination, and near basin boundaries the decision is extremely sensitive.',
    formula: 'xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)\nSimple root: eₙ₊₁ ≈ (f″/2f′)·eₙ²\nRoot of multiplicity k: eₙ₊₁ ≈ ((k − 1)/k)·eₙ',
    boundary: 'Scope: smooth real functions of one variable, computed in double precision (about 16 significant digits). “Digits double” holds only for a simple root with f′(root) ≠ 0 and a close enough start; from far away the first steps can be slow, diverge or cycle. Step 4 classifies cycles and lost runs by their first 60 steps; step 5 colours by whether a root is reached within 80 steps, at the resolution of the screen’s pixels. Practical solvers often combine the two methods: bisection to trap the root, then Newton to finish fast.',
    linksTitle: 'Where to go next',
    lk1: '→ Derivative, step 1: how secants close in on the tangent',
    lk2: '→ Taylor series, step 0: matching a curve term by term; the tangent keeps only the linear term',
    lk3: '→ Binary search, step 1: halve the remaining range every time',
    lk4: '→ Gradient descent, step 0: follow the slope downhill, another iteration built on derivatives',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Newton’s Method · Leap to the Root Along a Tangent”.'
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
  if (typeof window.refreshNewton === 'function') window.refreshNewton();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.NEWTON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
