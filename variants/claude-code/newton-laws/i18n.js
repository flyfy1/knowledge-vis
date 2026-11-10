'use strict';
// Newton's laws lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '牛顿运动定律 · 先测加速度，再找力',
    back: '← 知识索引',
    compare: '对照另一版本：牛顿运动定律 · F = ma 是调出来的 →',
    navLabel: '牛顿运动定律步骤导航',
    tagline: '一只冰球、一辆小车、一只木箱、两辆被弹簧弹开的车。每一步都先量出物体的加速度，再回头问：是哪些力、多大的力造成了它？六步之后，F = ma 不再是一句口诀，而是你能用频闪照片和受力图自己核对的账。',
    nav0: '0 不推会停吗', nav1: '1 力与加速度', nav2: '2 质量', nav3: '3 摩擦与合力', nav4: '4 连在一起', nav5: '5 互相推开', nav6: '6 收束',

    s0k: '第 0 步 · 第一定律',
    s0t: '没有人再推，运动的东西一定会停下来吗？',
    s0e: '这一步要回答：冰球离手以后，是什么让它停下来？如果把这个原因拿掉，它会怎样？冰球以 4 m/s 的速度离手，此后没有人推它，只有冰面的<strong>摩擦力</strong>（接触面阻碍滑动的力）向后拉它。摩擦力的大小 = μ × 冰球重力，μ 叫<strong>动摩擦因数</strong>，是一个没有单位的数，冰面越光滑 μ 越小。摩擦让冰球每秒减速 μg（g = 9.8 m/s²），所以它滑行 v₀² ÷ (2μg) 米后停下。上图是 12 m 长的冰道，灰圈是<strong>频闪</strong>位置：每隔 0.25 s 拍下冰球一次。下图横轴是 μ，纵轴是滑行距离；你试过的每个 μ 都留下一个白点。',
    muSlider: '动摩擦因数 μ', launch: '发射冰球（真实时间）', clearDots: '清除记录点',
    s0lgPuck: '冰球', s0lgStrobe: '频闪位置（每 0.25 s）', s0lgCurve: '滑行距离 v₀²/(2μg)', s0lgDots: '你试过的 μ',
    c0a: '12 m 冰道（俯视）· 距离 m', c0b: '滑行距离 (m) 随 μ 的变化',
    s0readout: 'μ = {mu}：摩擦每秒让速度减少 {a} m/s，冰球滑 {t} s、{d} m 后停下。',
    s0readoutOff: 'μ = {mu}：摩擦每秒让速度减少 {a} m/s；冰球要滑 {d} m 才停，12 m 冰道不够长，它在 {tx} s 时以 {vx} m/s 冲出冰道。',
    s0readoutZero: 'μ = 0：没有摩擦，速度每秒减少 0，冰球一直保持 4 m/s，3 s 就走完 12 m，冰道再长它也不会停。',
    s0hint: '观察顺序：把 μ 从 0.4 一格一格往 0 拖。上图频闪圈越来越疏、停点越来越远；下图白点沿橙色曲线往上爬：μ 减半，距离就翻倍。μ = 0 时距离不再有限。这就是<strong>牛顿第一定律</strong>：物体不受力（或所受力相互抵消）时，保持静止或匀速直线运动。让冰球停下的是摩擦力，不是「没人推了」。按「发射」可以按真实时间看一遍。',

    s1k: '第 1 步 · 力决定加速度',
    s1t: '拉力加倍，小车的运动会怎样变？',
    s1e: '这一步要回答：用不变的力拉一辆小车，它的速度怎样变？力大小和速度变化快慢是什么关系？小车放在气垫导轨上（几乎没有摩擦），质量 m = 2 kg，从静止开始被一个恒定的水平拉力 F 拉动（单位<strong>牛顿 N</strong>）。<strong>加速度</strong> a 是速度每秒增加多少，单位 m/s²（<a class="xlink" href="../../../physics/mechanics/velocity-vt/#step1">→ 速度–时间图第 1 步：加速度就是 v–t 图的斜率</a>）。频闪每 0.5 s 拍一次，共拍 2 s。匀加速时相邻两次的间隔一个比一个长，而且每次都多出同一段：a × (0.5 s)²。所以只看照片就能读出 a。',
    fSlider1: '拉力 F（N）', replay: '重放 2 s（真实时间）',
    s1lgCart: '小车（2 kg）与频闪位置', s1lgF: '拉力 F', s1lgPts: '你试过的数据点', s1lgFit: '过原点的拟合直线',
    c1a: '气垫导轨 · 距离 m（每 0.5 s 一张频闪）', c1b: '从照片读出的加速度 a (m/s²) 与拉力 F (N)',
    s1readout: 'F = {F} N：相邻间隔 {gaps} m，每次多 {inc} m → a = {inc} ÷ 0.5² = {a} m/s²。',
    s1fit: '已记录 {n} 个点，过原点拟合的斜率 = {k} (m/s²)/N，即 1 ÷ {m} kg。',
    s1fitOne: '再试一个 F，才能看出这些点排成什么形状。',
    s1hint: '观察顺序：只拖 F，m 不变。看上图频闪圈的间隔一起变宽；下图每试一个 F 留一个白点。F = 0 时小车不动（a = 0），F 加倍 a 也加倍：点落在一条过原点的直线上，斜率是 1/m。',

    s2k: '第 2 步 · 质量的作用',
    s2t: '同样的拉力，换一辆更重的车，加速度会差多少？',
    s2e: '这一步要回答：拉力不变时，加速度和质量是什么关系？<strong>质量</strong> m（单位 kg）衡量物体有多难被改变速度。现在拉力固定为 F = 6 N，只改小车质量。频闪每 0.25 s 拍一次，共 1 s。上一步说 a ∝ F；如果 a 与 m 成反比，那么 a 对 m 是一条下弯的曲线，a 对 1/m 就应该是一条过原点的直线。下面两张图用的是同一批数据点：「a 与质量 m」图直接画 a 和 m，「a 与 1/m」图把横轴换成 1/m。',
    mSlider2: '小车质量 m（kg）',
    s2lgNow: '当前小车', s2lgCurve: '6 N ÷ m 的理论线',
    c2a: '6 N 拉力下的频闪 · 距离 m（每 0.25 s）', c2b: 'a (m/s²) 与质量 m (kg)', c2c: 'a (m/s²) 与 1/m (1/kg)',
    s2readout: 'm = {m} kg：照片读出 a = {a} m/s²，m × a = {ma} N，正好等于拉力 6 N。若质量加倍到 {m2} kg，a 会变成 {a2} m/s²（减半）。',
    s2hint: '观察顺序：只拖 m。频闪图里的圈越来越挤；「a 与质量 m」图里白点沿曲线往右下走，「a 与 1/m」图里同一批点排成一条过原点的直线，斜率就是 F = 6 N。两步合起来：<strong>a = F / m</strong>，写成 F = ma，就是<strong>牛顿第二定律</strong>。1 N 的定义就是让 1 kg 获得 1 m/s² 的力。',

    s3k: '第 3 步 · 合力',
    s3t: '推一只木箱，推力全部用来加速了吗？',
    s3e: '这一步要回答：有摩擦时，F = ma 里的 F 是哪个力？木箱 5 kg，放在粗糙地面上，从静止开始用水平推力 F 推。地面对箱子有<strong>摩擦力</strong> f，方向总与（将要发生的）滑动相反。箱子还没动时是<strong>静摩擦</strong>：推多少它就顶回多少，但最多只能顶 μₛ × 重力 = 0.5 × 49 = 24.5 N。一旦滑动就成了<strong>动摩擦</strong>，大小固定为 μₖ × 重力 = 0.4 × 49 = 19.6 N。F = ma 里的 F 是<strong>合力</strong>：所有力按方向相加（同向相加、反向相减）后的结果，这里就是推力减摩擦力。',
    fSlider3: '推力 F（N）',
    s3lgF: '推力 F', s3lgFr: '摩擦力 f', s3lgNet: '合力 F − f',
    c3a: '木箱（5 kg）与频闪 · 距离 m（每 0.5 s，共 2 s）', c3b: '摩擦力 f (N) 与推力 F (N)', c3c: '加速度 a (m/s²) 与推力 F (N)',
    s3readStill: 'F = {F} N ≤ 24.5 N：静摩擦顶回 {f} N，合力 0，箱子不动，a = 0。',
    s3readMove: 'F = {F} N > 24.5 N：箱子滑动，动摩擦 {f} N，合力 {net} N，a = {net} ÷ 5 = {a} m/s²。',
    s3hint: '观察顺序：把 F 从 0 慢慢加到 40。「摩擦力 f 与推力 F」图：F 在 24.5 N 以下时，摩擦点沿 45° 斜线跟着 F 涨（推多少顶多少）；一过 24.5 N，摩擦突然掉到 19.6 N 并保持不变。「加速度 a 与推力 F」图：加速度先一直是 0，然后从约 1 m/s² 起跳——刚好推动时箱子会「一下子窜出去」，因为摩擦一启动就变小了。每次都是从静止重新推，所以不涉及「推着推着减小推力」的情形。',

    s4k: '第 4 步 · 连在一起的物体',
    s4t: '钩码拉小车：绳子的拉力等于钩码的重量吗？',
    s4e: '这一步要回答：两个用绳子连着的物体，加速度和绳子拉力各是多少？小车 m₁ 放在无摩擦的桌面上，绳子跨过桌边的轻滑轮，挂一个钩码 m₂。绳子不可伸长，所以两者加速度大小相同。把小车和钩码看成<strong>一个整体</strong>：绳子对它们的拉力是内部的一对力，相互抵消；从外面驱动整体的只有钩码的重力 m₂g。于是 (m₁ + m₂) a = m₂g。再单看小车：拉它的只有绳子，<strong>绳子拉力</strong> T = m₁a。单看钩码：重力向下、拉力向上，合力 m₂g − T 让它加速向下（<a class="xlink" href="../../../math/linear-algebra/vectors/#step4">→ 向量第 4 步：几个力按方向合成</a>）。',
    m1Slider: '小车质量 m₁（kg）', m2Slider: '钩码质量 m₂（kg）', release: '松手（真实时间）',
    s4lgT: '绳子拉力 T', s4lgW: '钩码重力 m₂g', s4lgNet: '钩码受的合力 m₂g − T', s4lgG: '上限 g = 9.8',
    c4a: '桌面、滑轮与钩码（箭头长度按 m₂g 归一）', c4b: 'a (m/s²) 与钩码质量 m₂ (kg)',
    s4readout: 'a = m₂g ÷ (m₁ + m₂) = {W} ÷ {M} = {a} m/s²；绳子拉力 T = m₁a = {T} N，只有钩码重力 {W} N 的 {pct}%。钩码受的合力 {net} N = m₂a。',
    s4hint: '观察顺序：先固定 m₁，把 m₂ 从小拖到大，看「a 与钩码质量 m₂」图里白点沿曲线上升，但始终在 g 的虚线下方；「桌面、滑轮与钩码」图里紫色拉力箭头总比橙色重力箭头短。再拖 m₁：换了小车，曲线整条换掉（白点随之清空）。按「松手」看小车被拉向滑轮。',
    quizPrompt: '想一想：钩码越挂越重（m₂ 远大于 m₁），加速度会怎样？',
    quizA: '没有上限，挂得越重越快', quizB: '越来越接近 g，但不会超过 g', quizC: '恰好等于 g',
    check: '核对', correct: '对。a = g × m₂ ÷ (m₁ + m₂)，分数总小于 1：整体里永远有一辆小车要一起带着加速。把 m₂ 拖到 2 kg、m₁ 拖到 0.5 kg，读数约 7.8 m/s²，仍在虚线下。',
    wrong: '再看看「a 与钩码质量 m₂」图：把 m₂ 一直拖到最大，白点会越过 g 的虚线吗？再看看公式里分子分母谁更大。',

    s5k: '第 5 步 · 第三定律',
    s5t: '两辆车被弹簧弹开，轻车受的力更大吗？',
    s5e: '这一步要回答：两个物体互相推时，各自受的力和各自的速度变化有什么关系？两辆小车之间夹一根压缩的弹簧（劲度 400 N/m，压缩 0.1 m），放在无摩擦的轨道上。松开后弹簧同时推两辆车：推左车向左，推右车向右。弹簧推得越伸长、力越小，大约几十毫秒后弹簧恢复原长，两车脱离，之后匀速滑行。轨道下面两张图的横轴都是时间（0 到 0.3 s）：「每辆车受的力」图画两车各自受的力（向右为正），「速度」图画两车各自的速度。动画是<strong>教学慢放 ×10</strong>。',
    m1Slider5: '左车质量 m₁（kg）', m2Slider5: '右车质量 m₂（kg）', releaseSpring: '松开弹簧（慢放 ×10）',
    s5lg1: '左车 m₁', s5lg2: '右车 m₂', s5lgSpring: '弹簧',
    c5a: '轨道（中心为 0）· 位置 m', c5b: '每辆车受的力 (N) 与时间 (s)', c5c: '速度 (m/s) 与时间 (s)',
    s5progress: '慢放中 t = {t} s / 0.3 s · ',
    s5readout: '{prog}弹簧推了 {tr} s，两车受力始终等大反向，峰值都是 {Fp} N。分开后 v₁ = {v1} m/s，v₂ = {v2} m/s，速度大小之比 {ratio} = m₂ ÷ m₁。动量 m₁v₁ = {p1}、m₂v₂ = {p2} kg·m/s，总和 {ptot}。',
    s5hint: '观察顺序：先让两车一样重，按「松开」：「每辆车受的力」图里两条曲线互为镜像，「速度」图里两条曲线也是镜像。再把右车加重：力的两条曲线依旧镜像（大小时时相等），但右车速度变小、左车变大。力相同、作用时间相同，所以各自获得的「力 × 时间」相同，质量大的速度变化小。这就是<strong>牛顿第三定律</strong>：甲对乙的力与乙对甲的力大小相等、方向相反、同时出现，分别作用在两个物体上，所以它们不会互相抵消（<a class="xlink" href="../../../physics/mechanics/momentum-collision/#step1">→ 动量第 1 步：力 × 时间（冲量）改变动量</a>）。',

    s6k: '第 6 步 · 收束',
    s6t: '三条定律，一笔账',
    s6fin: '第 0 步：拿掉摩擦，冰球就不再停——<strong>没有合力，速度不变</strong>。第 1–2 步：频闪照片读出的加速度跟拉力成正比、跟质量成反比——<strong>a = F/m</strong>。第 3–4 步：这里的 F 是所有外力按方向相加后的<strong>合力</strong>；分析连在一起的物体时，先选好研究对象，内部的力成对抵消。第 5 步：力总是成对出现，等大反向，作用在两个不同物体上。',
    formula: '第一定律：F合 = 0 ⇔ v 不变\n第二定律：F合 = m·a\n第三定律：F甲对乙 = −F乙对甲',
    boundary: '适用条件：本页所有物体都当作质点、质量不变；在地面参考系（近似为惯性系）里描述；速度远小于光速。摩擦用固定的 μₛ、μₖ 是简化模型，真实摩擦还和速度、表面状况有关；弹簧当作理想弹簧，绳子和滑轮没有质量。',
    linksTitle: '接着去哪里',
    lk1: '速度–时间图 · 第 1 步：加速度是 v–t 图的斜率 →',
    lk2: '向量 · 第 4 步：几个力怎样按方向合成 →',
    lk3: '动量与碰撞 · 第 1 步：力乘时间改变动量 →',
    lk4: '机械能守恒 · 第 2 步：摩擦把机械能变成热 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《牛顿运动定律 · F = ma 是调出来的》的平行版本。'
  },
  en: {
    pageTitle: 'Newton’s Laws of Motion · Measure the Acceleration, Then Find the Force',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Newton’s Laws of Motion · F = ma, Tuned by Hand →',
    navLabel: 'Newton’s laws step navigation',
    tagline: 'A hockey puck, a cart, a wooden crate and two carts flung apart by a spring. Each step first measures how the object accelerates, then asks which forces, and how much force, did it. By the end F = ma is not a slogan but an account you can check yourself against strobe photos and force diagrams.',
    nav0: '0 Does it stop?', nav1: '1 Force', nav2: '2 Mass', nav3: '3 Net force', nav4: '4 Linked bodies', nav5: '5 Pushing apart', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · THE FIRST LAW',
    s0t: 'Once nobody pushes, must a moving thing stop?',
    s0e: 'This step asks: after a puck leaves your hand, what stops it, and what happens if you take that cause away? The puck leaves at 4 m/s and nobody pushes it again; the only thing acting along the ice is <strong>friction</strong> (the force a surface exerts against sliding), pulling backwards. Its size is μ × the puck’s weight, where μ, the <strong>coefficient of kinetic friction</strong>, is a plain number with no unit — the slicker the ice, the smaller μ. Friction takes μg off the speed every second (g = 9.8 m/s²), so the puck stops after v₀² ÷ (2μg) metres. The top panel is a 12 m strip of ice; the grey rings are <strong>strobe</strong> positions, one snapshot every 0.25 s. The bottom panel plots stopping distance against μ, and every μ you try leaves a white dot.',
    muSlider: 'Friction coefficient μ', launch: 'Launch the puck (real time)', clearDots: 'Clear the dots',
    s0lgPuck: 'Puck', s0lgStrobe: 'Strobe positions (every 0.25 s)', s0lgCurve: 'Stopping distance v₀²/(2μg)', s0lgDots: 'μ values you tried',
    c0a: '12 m ice strip (from above) · distance in m', c0b: 'Stopping distance (m) against μ',
    s0readout: 'μ = {mu}: friction removes {a} m/s of speed every second; the puck slides for {t} s and stops after {d} m.',
    s0readoutOff: 'μ = {mu}: friction removes {a} m/s every second; the puck needs {d} m to stop, longer than the 12 m strip, so it leaves the ice at {tx} s still doing {vx} m/s.',
    s0readoutZero: 'μ = 0: no friction, the speed drops by 0 each second, the puck keeps 4 m/s, covers the 12 m in 3 s, and would never stop however long the ice was.',
    s0hint: 'What to watch: drag μ from 0.4 down towards 0 one notch at a time. Up top the strobe rings spread out and the stopping point moves away; below, the white dots climb the orange curve — halve μ and the distance doubles. At μ = 0 the distance is no longer finite. That is <strong>Newton’s first law</strong>: with no force on it (or forces that cancel), a body stays at rest or keeps moving in a straight line at constant speed. What stops the puck is friction, not the lack of a push. Press “Launch” to watch one run in real time.',

    s1k: 'STEP 1 · FORCE SETS THE ACCELERATION',
    s1t: 'Double the pull: how does the cart’s motion change?',
    s1e: 'This step asks: when a steady force pulls a cart, how does its speed change, and how does the size of the force relate to how fast the speed changes? The cart rides on an air track (almost no friction), has mass m = 2 kg, and starts from rest under a constant horizontal pull F (measured in <strong>newtons, N</strong>). <strong>Acceleration</strong> a is how much the speed grows each second, in m/s² (<a class="xlink" href="../../../physics/mechanics/velocity-vt/#step1">→ Velocity–time graphs, step 1: acceleration is the slope of the v–t graph</a>). The strobe fires every 0.5 s for 2 s. Under steady acceleration each gap is longer than the last by the same amount, a × (0.5 s)², so the photo alone tells you a.',
    fSlider1: 'Pull F (N)', replay: 'Replay 2 s (real time)',
    s1lgCart: 'Cart (2 kg) and strobe positions', s1lgF: 'Pull F', s1lgPts: 'Data points you tried', s1lgFit: 'Best line through the origin',
    c1a: 'Air track · distance in m (one strobe frame every 0.5 s)', c1b: 'Acceleration from the photo a (m/s²) against pull F (N)',
    s1readout: 'F = {F} N: gaps {gaps} m, each {inc} m longer than the last → a = {inc} ÷ 0.5² = {a} m/s².',
    s1fit: '{n} points so far; the best line through the origin has slope {k} (m/s²)/N, i.e. 1 ÷ {m} kg.',
    s1fitOne: 'Try another F to see what shape the points make.',
    s1hint: 'What to watch: drag only F; m stays fixed. Up top the strobe gaps all widen together; below, every F you try leaves a white dot. At F = 0 the cart sits still (a = 0); double F and a doubles too — the dots lie on a straight line through the origin whose slope is 1/m.',

    s2k: 'STEP 2 · WHAT MASS DOES',
    s2t: 'Same pull, heavier cart: how much less does it accelerate?',
    s2e: 'This step asks: with the pull held fixed, how does acceleration depend on mass? <strong>Mass</strong> m (in kg) measures how hard it is to change a body’s speed. The pull is now fixed at F = 6 N and only the cart’s mass changes. The strobe fires every 0.25 s for 1 s. The last step found a ∝ F; if a is inversely proportional to m, then a against m is a curve bending down, while a against 1/m should be a straight line through the origin. The two plots below share the same data points: “a against mass m” plots a against m directly, and “a against 1/m” swaps the horizontal axis for 1/m.',
    mSlider2: 'Cart mass m (kg)',
    s2lgNow: 'Current cart', s2lgCurve: 'Prediction 6 N ÷ m',
    c2a: 'Strobe under a 6 N pull · distance in m (every 0.25 s)', c2b: 'a (m/s²) against mass m (kg)', c2c: 'a (m/s²) against 1/m (1/kg)',
    s2readout: 'm = {m} kg: the photo gives a = {a} m/s², and m × a = {ma} N — exactly the 6 N pull. Double the mass to {m2} kg and a becomes {a2} m/s² (half).',
    s2hint: 'What to watch: drag only m. The strobe frames crowd together; in “a against mass m” the dots slide down and right along a curve, while in “a against 1/m” the very same dots line up on a straight line through the origin with slope F = 6 N. Put the two steps together and you get <strong>a = F / m</strong>, usually written F = ma: <strong>Newton’s second law</strong>. One newton is defined as the force that gives 1 kg an acceleration of 1 m/s².',

    s3k: 'STEP 3 · NET FORCE',
    s3t: 'Push a crate: does all of your push go into speeding it up?',
    s3e: 'This step asks: when friction is present, which force is the F in F = ma? A 5 kg crate sits on a rough floor and you push it horizontally, starting from rest. The floor exerts <strong>friction</strong> f, always against the sliding (or the sliding that is about to happen). While the crate has not moved it is <strong>static friction</strong>: it pushes back exactly as hard as you push, up to a ceiling of μₛ × weight = 0.5 × 49 = 24.5 N. Once the crate slides it becomes <strong>kinetic friction</strong>, a fixed μₖ × weight = 0.4 × 49 = 19.6 N. The F in F = ma is the <strong>net force</strong>: all forces added with their directions (same way adds, opposite way subtracts) — here, your push minus friction.',
    fSlider3: 'Push F (N)',
    s3lgF: 'Push F', s3lgFr: 'Friction f', s3lgNet: 'Net force F − f',
    c3a: 'Crate (5 kg) and strobe · distance in m (every 0.5 s for 2 s)', c3b: 'Friction f (N) against push F (N)', c3c: 'Acceleration a (m/s²) against push F (N)',
    s3readStill: 'F = {F} N ≤ 24.5 N: static friction pushes back {f} N, net force 0, the crate stays put, a = 0.',
    s3readMove: 'F = {F} N > 24.5 N: the crate slides, kinetic friction {f} N, net force {net} N, a = {net} ÷ 5 = {a} m/s².',
    s3hint: 'What to watch: raise F slowly from 0 to 40. In “Friction f against push F”: below 24.5 N the friction dots climb the 45° line with F (it matches your push); past 24.5 N friction suddenly drops to 19.6 N and stays there. In “Acceleration a against push F”: the acceleration is 0, then jumps straight to about 1 m/s² — a crate you just manage to budge lurches forward, because friction gets smaller once it slides. Every reading is a fresh push from rest, so easing off mid-slide is not shown.',

    s4k: 'STEP 4 · LINKED BODIES',
    s4t: 'A hanging weight pulls a cart: is the string tension equal to the weight?',
    s4e: 'This step asks: for two bodies tied by a string, what are the acceleration and the string tension? A cart m₁ sits on a frictionless table; a string runs over a light pulley at the edge to a hanging mass m₂. The string does not stretch, so both move with the same size of acceleration. Treat cart and hanging mass as <strong>one system</strong>: the string’s pulls on them are an internal pair that cancel, and the only outside force driving the system is the hanging weight m₂g. So (m₁ + m₂) a = m₂g. Now look at the cart alone: only the string pulls it, so the <strong>tension</strong> is T = m₁a. And the hanging mass alone: weight down, tension up, and the net m₂g − T accelerates it downwards (<a class="xlink" href="../../../math/linear-algebra/vectors/#step4">→ Vectors, step 4: combining forces by direction</a>).',
    m1Slider: 'Cart mass m₁ (kg)', m2Slider: 'Hanging mass m₂ (kg)', release: 'Let go (real time)',
    s4lgT: 'String tension T', s4lgW: 'Hanging weight m₂g', s4lgNet: 'Net force on the weight m₂g − T', s4lgG: 'Ceiling g = 9.8',
    c4a: 'Table, pulley and weight (arrows scaled to m₂g)', c4b: 'a (m/s²) against hanging mass m₂ (kg)',
    s4readout: 'a = m₂g ÷ (m₁ + m₂) = {W} ÷ {M} = {a} m/s²; tension T = m₁a = {T} N, only {pct}% of the {W} N weight. The net force on the weight, {net} N, equals m₂a.',
    s4hint: 'What to watch: hold m₁ and drag m₂ from small to large. In “a against hanging mass m₂” the dots climb the curve but stay below the dashed g line; in the table-and-pulley scene the violet tension arrow is always shorter than the orange weight arrow. Then drag m₁: a different cart means a different curve (the dots are cleared). Press “Let go” to watch the cart pulled to the pulley.',
    quizPrompt: 'Think: if the hanging mass gets much heavier than the cart (m₂ ≫ m₁), what happens to the acceleration?',
    quizA: 'No limit: the heavier, the faster', quizB: 'It creeps towards g but never exceeds it', quizC: 'It equals g exactly',
    check: 'Check', correct: 'Right. a = g × m₂ ÷ (m₁ + m₂), and that fraction is always below 1: the system always has a cart to drag along. Set m₂ = 2 kg and m₁ = 0.5 kg and the reading is about 7.8 m/s² — still under the dashed line.',
    wrong: 'Look at “a against hanging mass m₂” again: drag m₂ all the way up — does any dot cross the dashed g line? Then compare the top and bottom of the fraction.',

    s5k: 'STEP 5 · THE THIRD LAW',
    s5t: 'A spring flings two carts apart: does the lighter one feel a bigger force?',
    s5e: 'This step asks: when two bodies push on each other, how do the forces each one feels compare, and how do their speed changes compare? A compressed spring (stiffness 400 N/m, squeezed by 0.1 m) sits between two carts on a frictionless track. Released, it pushes both at once — the left cart to the left, the right cart to the right. The longer the spring gets the weaker it pushes; after a few hundredths of a second it is back to full length, the carts lose contact and coast at constant speed. The two lower plots share a time axis from 0 to 0.3 s: “Force on each cart” shows the force on each (rightwards positive), “Velocity” shows each cart’s velocity. The animation is <strong>slowed ×10 for teaching</strong>.',
    m1Slider5: 'Left cart mass m₁ (kg)', m2Slider5: 'Right cart mass m₂ (kg)', releaseSpring: 'Release the spring (slowed ×10)',
    s5lg1: 'Left cart m₁', s5lg2: 'Right cart m₂', s5lgSpring: 'Spring',
    c5a: 'Track (centre at 0) · position in m', c5b: 'Force on each cart (N) against time (s)', c5c: 'Velocity (m/s) against time (s)',
    s5progress: 'Playing slowed: t = {t} s of 0.3 s · ',
    s5readout: '{prog}The spring pushes for {tr} s; the two forces are equal and opposite at every instant, both peaking at {Fp} N. After separation v₁ = {v1} m/s and v₂ = {v2} m/s, a speed ratio of {ratio} = m₂ ÷ m₁. Momenta m₁v₁ = {p1} and m₂v₂ = {p2} kg·m/s, total {ptot}.',
    s5hint: 'What to watch: start with equal masses and press “Release”: the two force curves mirror each other, and so do the two velocity curves. Now make the right cart heavier: the force curves still mirror each other (equal size at every instant), but the right cart ends up slower and the left one faster. Same force for the same time gives each cart the same “force × time”, so the heavier one changes speed less. This is <strong>Newton’s third law</strong>: the force A exerts on B and the force B exerts on A are equal in size, opposite in direction and simultaneous — and they act on two different bodies, so they never cancel each other (<a class="xlink" href="../../../physics/mechanics/momentum-collision/#step1">→ Momentum, step 1: force × time (impulse) changes momentum</a>).',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Three laws, one set of books',
    s6fin: 'Step 0: take friction away and the puck never stops — <strong>no net force, no change in velocity</strong>. Steps 1–2: the acceleration read from strobe photos is proportional to the pull and inversely proportional to the mass — <strong>a = F/m</strong>. Steps 3–4: that F is the <strong>net force</strong>, every outside force added by direction; for linked bodies, choose the system first and the internal forces cancel in pairs. Step 5: forces always come in pairs, equal and opposite, acting on two different bodies.',
    formula: 'First law: F_net = 0 ⇔ v constant\nSecond law: F_net = m·a\nThird law: F_A on B = −F_B on A',
    boundary: 'Where this holds: every body here is a point mass of constant mass, described in the ground frame (close to an inertial frame), at speeds far below light. Fixed μₛ and μₖ are a simplified friction model — real friction also depends on speed and surface condition; the spring is ideal and the string and pulley are massless.',
    linksTitle: 'Where to go next',
    lk1: 'Velocity–time graphs · step 1: acceleration is the slope of a v–t graph →',
    lk2: 'Vectors · step 4: how several forces combine by direction →',
    lk3: 'Momentum & collisions · step 1: force times time changes momentum →',
    lk4: 'Mechanical energy · step 2: friction turns mechanical energy into heat →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Newton’s Laws of Motion · F = ma, Tuned by Hand”.'
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
