'use strict';
// ODE phase-portrait lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '微分方程相图 · 兔与狐的闭合回路',
    back: '← 知识索引',
    compare: '对照另一版本：微分方程相图 · 捕食者与猎物的回路 →',
    navLabel: '相图步骤导航',
    tagline: '一片草地上有兔子和狐狸。兔子多了，狐狸吃得饱、跟着变多；狐狸多了，兔子被吃少，狐狸又饿得变少。我们只知道「此刻的数量决定此刻的变化率」这条规则，想求的是：几十年后两种动物各有多少，这场拉锯会不会停下来。八步里你会从变化率走出时间曲线，再把它画成相平面上的一条闭合回路，看懂回路为什么闭合、什么会让它不再闭合。',
    nav0: '0 变化率', nav1: '1 时间曲线', nav2: '2 相平面', nav3: '3 零线', nav4: '4 守恒量', nav5: '5 数值误差', nav6: '6 拥挤', nav7: '7 收束',

    s0k: '第 0 步 · 规则说了什么',
    s0t: '此刻有这么多兔子和狐狸，下一小段时间里它们各增减多少？',
    s0e: '这一步要回答：给定此刻的兔子数 x 和狐狸数 y，两者的<strong>变化率</strong>（每年增加多少，负数表示减少）是多少？本页用的是<strong>洛特卡–沃尔泰拉模型</strong>，一对写明变化率的方程，也就是<strong>微分方程</strong>：<br>兔：x′ = a·x − b·x·y<br>狐：y′ = −c·y + d·x·y<br>x 以「百只」计，y 以「十只」计，时间以「年」计；a = 1，b = 0.5，c = 1，d = 0.25。每一项都有具体含义：a·x 是兔子自己繁殖；b·x·y 是被吃掉的兔子，兔狐相遇越多吃得越多；c·y 是狐狸自然死亡；d·x·y 是狐狸靠吃兔子添的幼崽。x′ 读作「x 的变化率」，就是 x 对时间的导数（<a class="xlink" href="../../../math/calculus/derivative/#step3">→ 导数页第 3 步：导数在说什么</a>）。',
    xNow: '兔子 x（百只）', yNow: '狐狸 y（十只）', stepOnce: '按变化率走 0.1 年', reset0: '回到默认',
    c0a: '兔子：各项与净变化率（百只/年）', c0b: '狐狸：各项与净变化率（十只/年）',
    bBirth: '繁殖', bEaten: '被吃', bNet: '净', bGain: '添崽', bDie: '死亡',
    s0lgPlus: '使数量增加的项', s0lgMinus: '使数量减少的项', s0lgNet: '净变化率 = 两项相加',
    s0readout: '此刻 x = {x}（{xa} 只兔），y = {y}（{ya} 只狐）。兔：x′ = {birth} − {eaten} = {dx} 百只/年，{xs}；狐：y′ = −{die} + {gain} = {dy} 十只/年，{ys}。',
    up: '正在增加', down: '正在减少', flat: '此刻不变',
    s0hint: '观察顺序：先把狐狸 y 拖到 2 以上、保持兔子不变，看兔子的「被吃」条超过「繁殖」条，净变化率变负；再把兔子 x 拖到 4 以上，看狐狸的「添崽」条超过「死亡」条。按「按变化率走 0.1 年」会用当前的净变化率把两个滑杆各推一小步，这就是下一步把整段未来算出来的办法。',

    s1k: '第 1 步 · 一小步一小步走',
    s1t: '从某个起点出发，两种群几十年里怎样起落？谁的高峰先到？',
    s1e: '这一步要回答：知道了每一刻的变化率（上一步的 x′、y′），整段未来是什么样？办法就是上一步那个按钮：用当前变化率往前推一小段时间，再用新状态的变化率推下一段。这里每步 0.005 年，并用一种更准的推法（第 5 步再细讲），一共推 30 年。下图横轴是时间（年），纵轴是数量：青线是兔子 x（百只），橙线是狐狸 y（十只）。两条竖虚线分别标出兔子的第一个高峰和它之后狐狸的第一个高峰。',
    x0: '起点兔子 x₀（百只）', y0: '起点狐狸 y₀（十只）', play1: '播放 30 年',
    c1: '数量随时间（横轴：年）',
    s1lgX: '兔子 x（百只）', s1lgY: '狐狸 y（十只）', s1lgPk: '各自第一个高峰的时刻',
    s1progress: '已画到 t = {t} / 30 年。',
    s1readout: '{prog}兔子在 {xMin}–{xMax} 之间起落，狐狸在 {yMin}–{yMax} 之间起落。兔子第一个高峰在 t = {tR} 年，狐狸的高峰晚 {lag} 年（t = {tF}）；同一形状每 {per} 年重复一次。',
    s1eq: '起点 (4, 2) 正好让两个变化率都为 0：兔子的繁殖与被吃相抵，狐狸的添崽与死亡相抵，两条线是水平的，什么也不会发生。挪开一格试试。',
    s1hint: '观察顺序：先按「播放 30 年」，看两条线怎样一前一后起落，狐狸的高峰总落在兔子高峰之后；再把狐狸起点 y₀ 调小，起落幅度变大、重复间隔也变长一点。把两个滑杆调到 x₀ = 4、y₀ = 2 会看到一个特别的起点。下一步用的就是这里设好的起点。',

    s2k: '第 2 步 · 换一种画法',
    s2t: '把时间藏起来，只看 (x, y) 这一对数，会看出什么？',
    s2e: '这一步要回答：同一条解，换一种画法能看出时间曲线看不出的什么？右图是<strong>相平面</strong>：横轴是兔子 x（百只），纵轴是狐狸 y（十只），每个点代表一种「兔多少、狐多少」的状态。随着时间推进，状态点在平面上移动，走过的路径叫<strong>轨线</strong>。灰色小箭头是<strong>方向场</strong>：在每个位置按方程算出 (x′, y′)，画出状态下一刻往哪走（箭头只表示方向，长度统一）。左图仍是上一步的时间曲线，竖线是当前时刻。',
    tCursor: '当前时刻 t（年）', play2: '让状态点走 30 年',
    c2a: '时间曲线（横轴：年）', c2b: '相平面：横轴兔 x，纵轴狐 y',
    s2lgTraj: '轨线（已走过的部分更亮）', s2lgField: '方向场', s2lgNow: '当前状态点', s2lgEq: '平衡点 (4, 2)',
    s2readout: 't = {t} 年：兔 x = {x}，狐 y = {y}，此刻状态正往{dir}移动。从起点出发 {per} 年后状态点回到距起点 {gap} 的地方，即同一条闭合曲线，然后一圈一圈重复。',
    s2eqr: '起点就是平衡点 (4, 2)：轨线缩成一个点，状态永远停在那里。回到第 1 步把起点挪开。',
    dirR: '右', dirL: '左', dirU: '上', dirD: '下', dirBoth: '{h}{v}',
    s2hint: '观察顺序：先按「让状态点走 30 年」，盯着右图的点：它沿逆时针方向绕一圈又回到原处，左图的竖线同时扫过一个起落。再拖「当前时刻」，对比两图：兔子最多（右图最右端）时狐狸正在增加，狐狸最多（最上端）时兔子正在减少。',

    s3k: '第 3 步 · 为什么绕圈',
    s3t: '平面上哪里兔子不变、哪里狐狸不变？状态为什么总绕着一个点转？',
    s3e: '这一步要回答：不解方程，能不能直接看出轨线绕着哪一点、朝哪个方向转？把上一步的变化率分开看。兔子的变化率 x′ = x·(a − b·y)，在 y = a/b = 2 这条横线上为 0：横线上方狐狸多，兔子减少；下方兔子增加。狐狸的变化率 y′ = y·(d·x − c)，在 x = c/d = 4 这条竖线上为 0：右边兔子够吃，狐狸增加；左边狐狸减少。这样「某个变化率为 0」的线叫<strong>零线</strong>。两条零线的交点 (4, 2) 处两个变化率都为 0，状态一旦在这里就不再变，叫<strong>平衡点</strong>。两条零线把平面切成四块，每块里 (x′, y′) 的正负固定，所以状态只能按「右上 → 左上 → 左下 → 右下」依次经过四块，也就是绕着平衡点逆时针转。',
    px: '探测点兔子 x（百只）', py: '探测点狐狸 y（十只）',
    c3: '零线与四个区域（点图上任意位置也能移动探测点）',
    s3lgNx: '兔子零线 y = 2（x′ = 0）', s3lgNy: '狐狸零线 x = 4（y′ = 0）', s3lgV: '探测点的变化方向（青 = 水平分量 x′，橙 = 竖直分量 y′）', s3lgQ: '各区域的大致流向',
    s3readout: '探测点 ({x}, {y})：x′ = {dx}（兔{xs}），y′ = {dy}（狐{ys}）。{where}',
    s3eqNote: '这里就是平衡点：两个变化率都为 0。',
    s3onNx: '探测点在兔子零线上：只有竖直方向的变化。', s3onNy: '探测点在狐狸零线上：只有水平方向的变化。', s3inQ: '它在{q}区域，状态往{dir}移动。',
    qRU: '右上', qLU: '左上', qLD: '左下', qRD: '右下',
    s3hint: '观察顺序：保持狐狸 y 不变，把兔子 x 从 3 拖到 5，看橙色竖直分量在越过 x = 4 时由向下变成向上；再保持 x 不变，把 y 从 1.5 拖到 2.5，看青色水平分量在越过 y = 2 时由向右变成向左。',
    quizPrompt: '小测：兔子 600 只（x = 6）、狐狸 30 只（y = 3），接下来两者分别怎样变？',
    quizA: '兔子增加、狐狸增加', quizB: '兔子减少、狐狸增加', quizC: '兔子减少、狐狸减少',
    check: '检查', correct: '对。y = 3 在兔子零线 y = 2 之上，狐狸太多，兔子减少；x = 6 在狐狸零线 x = 4 之右，兔子够吃，狐狸增加。状态正往左上走。', wrong: '再想想：先看 y = 3 在横线 y = 2 的哪一侧决定兔子，再看 x = 6 在竖线 x = 4 的哪一侧决定狐狸。可以把探测点拖到 (6, 3) 核对。',

    s4k: '第 4 步 · 守恒量',
    s4t: '绕一圈为什么恰好回到原处，而不是偏一点、慢慢螺旋出去？',
    s4e: '这一步要回答：上一步只说明状态会绕着平衡点转，没说明它会精确闭合。答案是有一个量沿轨线始终不变，叫<strong>守恒量</strong>：<br>H(x, y) = d·x − c·ln x + b·y − a·ln y<br>用链式法则求它随时间的变化率，代入两个方程，各项恰好两两抵消，结果为 0。所以 H 在一条轨线上是常数，轨线只能沿 H 的某条等高线走；H 的等高线围着平衡点闭合，轨线也就闭合。平衡点处 H 最小，离平衡点越远 H 越大。左图从平衡点正下方的不同高度出发（x₀ = 4），每试一个起点留下一圈；右图记下每圈走一周所用的时间，叫<strong>周期</strong>（年）。',
    y4: '起点狐狸 y₀（x₀ 固定为 4）', clear4: '清空已画的圈',
    c4a: '相平面：每个起点一圈', c4b: '周期（年）vs 起点低于平衡点多少',
    s4lgNow: '当前这一圈', s4lgOld: '试过的圈', s4lgDot: '各圈的周期', s4lgLim: '小圈极限 2π/√(a·c) ≈ 6.283 年',
    s4readout: '起点 (4, {y0})，H = {h}（平衡点 H = {hs}）。沿这一圈数值计算的 H 最大与最小只差 {spread}，只是计算舍入的量级；周期 {per} 年，是小圈极限 6.283 年的 {ratio} 倍。',
    s4hint: '观察顺序：把起点 y₀ 从 1.9 一格一格拖到 0.2，左图的圈一层层套在外面、彼此不相交（每圈的 H 不同）；右图的点逐渐升高：圈越大，绕一周越慢。y₀ 接近 2 时周期趋近虚线 2π ≈ 6.283 年。本页只试了 x₀ = 4 这条竖线上的起点。',

    s5k: '第 5 步 · 数值解会说谎吗',
    s5t: '电脑一小步一小步推出来的轨线，还会精确闭合吗？',
    s5e: '这一步要回答：前面的曲线都是电脑一步一步推出来的近似解，近似会不会破坏「H 守恒、轨线闭合」？两种推法：<strong>欧拉法</strong>每步只在起点算一次变化率，沿它直线走 Δt；<strong>RK4</strong>（四阶龙格–库塔法）每步在起点、中点、终点附近算四次变化率再加权平均，与第 1 步用的方法相同。左图虚线是精确的闭合圈，彩色线是所选方法推 30 年的结果；右图是 H 相对初值的偏移 H(t) − H(0)，精确解应恒为 0，所以这里的任何偏移都是<strong>数值误差</strong>，不是兔狐的生态现象。',
    mEuler: '欧拉法', mRK4: 'RK4', dt5: '步长 Δt（年）',
    c5a: '相平面：精确圈 vs 数值解', c5b: 'H(t) − H(0)（横轴：年）',
    s5lgExact: '精确闭合圈（极小步长 RK4）', s5lgNum: '所选方法的数值解', s5lgH: 'H 的偏移',
    s5readout: '{m}，Δt = {dt} 年：{tail}',
    s5ok: '推满 30 年后 H 偏移 {d}，相当于起点与平衡点 H 差值的 {pct}%。把 Δt 减半，偏移缩小到 1/{ratio}。',
    s5esc: '推到 t = {t} 年时数值解冲出了第一象限（数量变成负数），只好停下。此时 H 已偏移 {d}。精确解永远不会离开第一象限，这完全是步长太大造成的。',
    s5hint: '观察顺序：先选欧拉法，把 Δt 从 0.005 逐格加大到 0.3：轨线向外螺旋越来越明显，右图 H 一路向上，Δt = 0.2 以上会冲出第一象限。再换 RK4 看同样的 Δt：轨线贴着虚线，H 的偏移小于 2×10⁻⁴。读数里的「Δt 减半缩小到 1/…」：欧拉在 Δt ≤ 0.02 时约 1/2（误差与 Δt 成正比），RK4 约 1/19 到 1/23（误差大约与 Δt⁴ 成正比）。',

    s6k: '第 6 步 · 加上拥挤',
    s6t: '如果草地只养得起有限的兔子，回路还会闭合吗？',
    s6e: '这一步要回答：前面的兔子在没有狐狸时会无限增长，这不现实。给兔子加一个<strong>容纳量</strong> K（百只）：草地最多养得起的兔子数，兔子越接近 K 繁殖越慢：x′ = a·x·(1 − x/K) − b·x·y（<a class="xlink" href="../../../biology/ecology/logistic-growth/#step2">→ 逻辑斯谛增长页第 2 步：世界装不下时增长怎样放慢</a>）。狐狸方程不变。兔子的零线变成一条斜线 y = 2·(1 − x/K)，平衡点移到 (4, 2·(1 − 4/K))。平衡点附近的走法由<strong>雅可比矩阵</strong>（把方程在平衡点附近近似成线性方程时的系数表）的两个<strong>特征值</strong> λ 决定：实部为负就会靠拢，带虚部就是边转边靠拢（<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step2">→ 特征向量页第 2 步：λ 的正负与大小意味着什么</a>）。起点固定为 (6, 1)，算 60 年。',
    K6: '容纳量 K（百只兔）', Kinf: 'K = ∞（去掉拥挤项）',
    c6a: '相平面：兔子零线变斜', c6b: '数量随时间（横轴：年）',
    s6lgTraj: '轨线', s6lgNx: '兔子零线', s6lgNy: '狐狸零线 x = 4', s6lgEq: '平衡点',
    s6readout: '{K}：{kind}特征值 λ = {l1}、{l2}。60 年后离平衡点还有 {dist}；用来衡量离平衡点远近的量 V（为 0 表示正好在平衡点）降到初值的 {vr} 倍。',
    Klabel: 'K = {K}', KlabelInf: 'K = ∞',
    kSpiral: '平衡点 ({x}, {y})，状态边转圈边靠拢（螺旋），', kNode: '平衡点 ({x}, {y})，状态不再转圈、直接滑向平衡点，', kCenter: '平衡点 ({x}, {y})，没有拥挤时轨线闭合、永不靠拢（第 4 步的情形），', kExtinct: '兔子最多只能长到 {x}，养不活狐狸（需要 x 达到 4）：狐狸灭绝，平衡点 ({x}, 0)，',
    s6hint: '观察顺序：从 K = 40 开始往小拖：轨线从几乎闭合变成越转越紧的螺旋，右图的起落逐渐衰减。拖到 K < 2 + 2√2 ≈ 4.83 时状态不再转圈；K ≤ 4 时狐狸那条线落到 0。按「K = ∞」回到闭合回路，对照差别。',

    s7k: '第 7 步 · 收束',
    s7t: '这一页你做了什么',
    s7fin: '你从一对只写着「此刻的变化率」的方程出发，一小步一小步推出了两种群的未来：兔子先涨，狐狸跟着涨，兔子被吃少，狐狸再饿少。把时间藏起来，这段反复的起落就是相平面上的一条闭合回路。两条零线说明它<strong>绕着平衡点逆时针转</strong>；守恒量 H 说明它<strong>精确闭合</strong>；数值方法若步长太大会让 H 漂移、圈向外螺旋，那是计算误差；给兔子加上容纳量后，H 不再守恒，回路变成<strong>螺旋或直线式地靠拢</strong>，由平衡点的特征值决定。',
    formula: 'x′ = a·x·(1 − x/K) − b·x·y\ny′ = −c·y + d·x·y\nK = ∞：H = d·x − c·ln x + b·y − a·ln y 守恒',
    boundary: '适用范围：本页是连续数量、参数恒定、没有随机性的模型，用作理解机制，不预测真实的兔狐数量。真实种群数量很小时会灭绝，而这里的方程允许数量无限接近 0 后再回升；季节、迁移、多物种都没有考虑。',
    linksTitle: '接着去看',
    lk1: '种群生态页第 2 步：捕食者介入后种群怎样波动 →', lk2: '逻辑斯谛增长页第 3 步：K 为什么是渐近线 →', lk3: '特征向量页第 2 步：λ 的性格 →', lk4: '导数页第 3 步：导数在说什么 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《微分方程相图 · 捕食者与猎物的回路》的平行版本。'
  },
  en: {
    pageTitle: 'ODE Phase Portraits · The Closed Loop of Rabbits and Foxes',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: ODE Phase Portraits · Predators and Prey in a Loop →',
    navLabel: 'Phase portrait steps',
    tagline: 'A meadow holds rabbits and foxes. More rabbits feed more foxes; more foxes eat the rabbits down; then the foxes go hungry and dwindle. All we are told is a rule — the numbers right now set how fast they change right now — and we want to know how many of each there will be decades later, and whether the tug-of-war ever settles. In eight steps you will walk from rates of change to time curves, redraw them as a closed loop in the phase plane, and see why the loop closes and what makes it stop closing.',
    nav0: '0 Rates', nav1: '1 Time curves', nav2: '2 Phase plane', nav3: '3 Nullclines', nav4: '4 Conserved', nav5: '5 Numerical error', nav6: '6 Crowding', nav7: '7 Wrap-up',

    s0k: 'Step 0 · What the rule says',
    s0t: 'With this many rabbits and foxes right now, how fast is each population changing?',
    s0e: 'This step answers: given the current number of rabbits x and foxes y, what is each one’s <strong>rate of change</strong> (how much it grows per year; negative means shrinking)? The page uses the <strong>Lotka–Volterra model</strong>, a pair of equations that state the rates of change — a system of <strong>differential equations</strong>:<br>rabbits: x′ = a·x − b·x·y<br>foxes: y′ = −c·y + d·x·y<br>x counts hundreds of rabbits, y counts tens of foxes, time is in years; a = 1, b = 0.5, c = 1, d = 0.25. Every term means something: a·x is rabbits breeding; b·x·y is rabbits eaten, more of them the more often rabbits and foxes meet; c·y is foxes dying naturally; d·x·y is fox cubs paid for by eaten rabbits. Read x′ as “the rate of change of x”, the derivative of x with respect to time (<a class="xlink" href="../../../math/calculus/derivative/#step3">→ Derivative, step 3: what a derivative tells you</a>).',
    xNow: 'Rabbits x (hundreds)', yNow: 'Foxes y (tens)', stepOnce: 'Follow the rates for 0.1 yr', reset0: 'Back to default',
    c0a: 'Rabbits: terms and net rate (hundreds/yr)', c0b: 'Foxes: terms and net rate (tens/yr)',
    bBirth: 'born', bEaten: 'eaten', bNet: 'net', bGain: 'cubs', bDie: 'died',
    s0lgPlus: 'terms that add', s0lgMinus: 'terms that remove', s0lgNet: 'net rate = the two combined',
    s0readout: 'Right now x = {x} ({xa} rabbits), y = {y} ({ya} foxes). Rabbits: x′ = {birth} − {eaten} = {dx} hundred/yr, {xs}; foxes: y′ = −{die} + {gain} = {dy} ten/yr, {ys}.',
    up: 'rising', down: 'falling', flat: 'momentarily steady',
    s0hint: 'What to try: hold the rabbits fixed and push foxes y above 2 — the rabbits’ “eaten” bar overtakes “born” and their net rate turns negative. Then push rabbits x above 4 and watch the foxes’ “cubs” bar overtake “died”. “Follow the rates for 0.1 yr” nudges both sliders by the current net rates — exactly how the next step computes the whole future.',

    s1k: 'Step 1 · One small step at a time',
    s1t: 'From a given start, how do the two populations rise and fall over decades — and whose peak comes first?',
    s1e: 'This step answers: once we know the rate of change at every moment (step 0’s x′ and y′), what does the whole future look like? The recipe is step 0’s button: push forward a short time using the current rates, then use the new state’s rates for the next push. Here each push is 0.005 years, using a more accurate push rule (step 5 explains it), for 30 years in all. The horizontal axis is time in years, the vertical axis is the count: cyan is rabbits x (hundreds), orange is foxes y (tens). The two dashed lines mark the rabbits’ first peak and the first fox peak after it.',
    x0: 'Starting rabbits x₀ (hundreds)', y0: 'Starting foxes y₀ (tens)', play1: 'Play 30 years',
    c1: 'Counts over time (horizontal: years)',
    s1lgX: 'rabbits x (hundreds)', s1lgY: 'foxes y (tens)', s1lgPk: 'time of each one’s first peak',
    s1progress: 'Drawn up to t = {t} / 30 yr. ',
    s1readout: '{prog}Rabbits swing between {xMin} and {xMax}, foxes between {yMin} and {yMax}. The rabbits’ first peak is at t = {tR} yr; the foxes peak {lag} yr later (t = {tF}). The same shape repeats every {per} years.',
    s1eq: 'The start (4, 2) makes both rates zero: rabbit births balance rabbits eaten, fox cubs balance fox deaths. Both lines stay flat and nothing ever happens. Move one slider a notch.',
    s1hint: 'What to try: press “Play 30 years” and watch the two lines take turns — the fox peak always lands after the rabbit peak. Then lower the starting foxes y₀: the swings get bigger and the repeat time a little longer. Set x₀ = 4 and y₀ = 2 to find a special start. The next step uses the start you set here.',

    s2k: 'Step 2 · Draw it differently',
    s2t: 'Hide time and look only at the pair (x, y). What shows up?',
    s2e: 'This step answers: what does a different picture of the same solution reveal that the time curves hide? The right panel is the <strong>phase plane</strong>: rabbits x (hundreds) across, foxes y (tens) up, so every point is one state — “this many rabbits, this many foxes”. As time runs, the state point moves, and the path it traces is a <strong>trajectory</strong>. The small grey arrows are the <strong>direction field</strong>: at each spot the equations give (x′, y′), drawn as the direction the state moves next (direction only; all arrows have the same length). The left panel is still step 1’s time curves; the vertical line is the current time.',
    tCursor: 'Current time t (yr)', play2: 'Run the state for 30 years',
    c2a: 'Time curves (horizontal: years)', c2b: 'Phase plane: rabbits x across, foxes y up',
    s2lgTraj: 'trajectory (the part already travelled is brighter)', s2lgField: 'direction field', s2lgNow: 'current state', s2lgEq: 'equilibrium (4, 2)',
    s2readout: 't = {t} yr: rabbits x = {x}, foxes y = {y}; the state is heading {dir}. {per} yr after the start the state comes back to within {gap} of where it began — one closed curve, traced again and again.',
    s2eqr: 'The start is the equilibrium (4, 2): the trajectory shrinks to a single point and the state stays put forever. Go back to step 1 and move the start.',
    dirR: 'right', dirL: 'left', dirU: 'up', dirD: 'down', dirBoth: '{v} and to the {h}',
    s2hint: 'What to try: press “Run the state for 30 years” and follow the dot on the right: it goes round anticlockwise and returns to where it started, while the line on the left sweeps one rise-and-fall. Then drag “Current time” and compare: when rabbits peak (rightmost point) foxes are rising; when foxes peak (top point) rabbits are falling.',

    s3k: 'Step 3 · Why it circles',
    s3t: 'Where in the plane do rabbits hold steady, and where do foxes? Why does the state always circle one point?',
    s3e: 'This step answers: without solving anything, can we see which point the trajectory circles and which way it turns? Split the rates. The rabbit rate x′ = x·(a − b·y) is zero on the horizontal line y = a/b = 2: above it there are too many foxes and rabbits fall; below it rabbits grow. The fox rate y′ = y·(d·x − c) is zero on the vertical line x = c/d = 4: to its right there is enough food and foxes grow; to its left they decline. A line where one rate is zero is a <strong>nullcline</strong>. Where the two cross, at (4, 2), both rates vanish: a state placed there never changes, so it is an <strong>equilibrium</strong>. The nullclines cut the plane into four regions, each with fixed signs of (x′, y′), so the state can only pass through them in the order upper-right → upper-left → lower-left → lower-right — anticlockwise around the equilibrium.',
    px: 'Probe rabbits x (hundreds)', py: 'Probe foxes y (tens)',
    c3: 'Nullclines and four regions (tap anywhere to move the probe)',
    s3lgNx: 'rabbit nullcline y = 2 (x′ = 0)', s3lgNy: 'fox nullcline x = 4 (y′ = 0)', s3lgV: 'probe’s direction of change (cyan = horizontal part x′, orange = vertical part y′)', s3lgQ: 'rough flow in each region',
    s3readout: 'Probe ({x}, {y}): x′ = {dx} (rabbits {xs}), y′ = {dy} (foxes {ys}). {where}',
    s3eqNote: 'This is the equilibrium: both rates are zero.',
    s3onNx: 'The probe sits on the rabbit nullcline: it only moves vertically.', s3onNy: 'The probe sits on the fox nullcline: it only moves horizontally.', s3inQ: 'It is in the {q} region, heading {dir}.',
    qRU: 'upper-right', qLU: 'upper-left', qLD: 'lower-left', qRD: 'lower-right',
    s3hint: 'What to try: hold foxes y fixed and drag rabbits x from 3 to 5 — the orange vertical arrow flips from down to up as it crosses x = 4. Then hold x fixed and drag y from 1.5 to 2.5 — the cyan horizontal arrow flips from right to left as it crosses y = 2.',
    quizPrompt: 'Quick check: with 600 rabbits (x = 6) and 30 foxes (y = 3), how does each population change next?',
    quizA: 'Rabbits rise, foxes rise', quizB: 'Rabbits fall, foxes rise', quizC: 'Rabbits fall, foxes fall',
    check: 'Check', correct: 'Right. y = 3 is above the rabbit nullcline y = 2 — too many foxes, so rabbits fall; x = 6 is right of the fox nullcline x = 4 — enough food, so foxes rise. The state heads up and to the left.', wrong: 'Not quite. Decide rabbits by which side of the line y = 2 the value y = 3 lies on, then foxes by which side of x = 4 the value x = 6 lies on. Drag the probe to (6, 3) to check.',

    s4k: 'Step 4 · A conserved quantity',
    s4t: 'Why does one lap end exactly where it began, instead of drifting off into a spiral?',
    s4e: 'This step answers: step 3 only shows that the state circles the equilibrium, not that it closes up exactly. The reason is a quantity that never changes along a trajectory — a <strong>conserved quantity</strong>:<br>H(x, y) = d·x − c·ln x + b·y − a·ln y<br>Differentiate it in time with the chain rule, substitute the two equations, and the terms cancel in pairs: the result is 0. So H is constant on each trajectory and the trajectory must follow one contour of H; those contours close around the equilibrium, so the trajectory closes too. H is smallest at the equilibrium and grows with distance from it. On the left, each start straight below the equilibrium (x₀ = 4) leaves one loop; on the right, each loop’s <strong>period</strong> — the time for one lap, in years — is recorded.',
    y4: 'Starting foxes y₀ (x₀ fixed at 4)', clear4: 'Clear the loops',
    c4a: 'Phase plane: one loop per start', c4b: 'Period (yr) vs how far below equilibrium',
    s4lgNow: 'current loop', s4lgOld: 'loops tried', s4lgDot: 'period of each loop', s4lgLim: 'small-loop limit 2π/√(a·c) ≈ 6.283 yr',
    s4readout: 'Start (4, {y0}), H = {h} (equilibrium H = {hs}). Along this loop the computed H varies by only {spread} — rounding-level noise. Period {per} yr, {ratio} × the small-loop limit of 6.283 yr.',
    s4hint: 'What to try: drag y₀ from 1.9 down to 0.2 one notch at a time. On the left the loops nest one outside another and never cross (each has its own H); on the right the dots climb: bigger loops take longer. As y₀ approaches 2 the period approaches the dashed line 2π ≈ 6.283 yr. Only starts on the line x₀ = 4 are tried here.',

    s5k: 'Step 5 · Can a numerical solution lie?',
    s5t: 'When a computer builds the trajectory step by step, does it still close exactly?',
    s5e: 'This step answers: every curve so far was built step by step by the computer — does the approximation break “H is conserved, loops close”? Two push rules: <strong>Euler’s method</strong> evaluates the rate once, at the start of the step, and moves in a straight line for Δt; <strong>RK4</strong> (fourth-order Runge–Kutta) evaluates it four times — at the start, twice near the middle and near the end — and takes a weighted average; it is the method step 1 used. On the left, the dashed curve is the exact closed loop and the coloured curve is 30 years of the chosen method; on the right is H’s drift from its starting value, H(t) − H(0). The exact solution keeps it at 0, so any drift here is <strong>numerical error</strong>, not something rabbits and foxes do.',
    mEuler: 'Euler', mRK4: 'RK4', dt5: 'Step size Δt (yr)',
    c5a: 'Phase plane: exact loop vs numerical', c5b: 'H(t) − H(0) (horizontal: years)',
    s5lgExact: 'exact closed loop (RK4, tiny step)', s5lgNum: 'chosen method’s solution', s5lgH: 'drift of H',
    s5readout: '{m}, Δt = {dt} yr: {tail}',
    s5ok: 'after the full 30 years H has drifted by {d}, which is {pct}% of the H gap between the start and the equilibrium. Halving Δt shrinks the drift to 1/{ratio}.',
    s5esc: 'at t = {t} yr the numerical solution left the first quadrant (a count went negative) and had to stop. By then H had drifted by {d}. The exact solution can never leave the first quadrant; this is purely the step being too large.',
    s5hint: 'What to try: pick Euler and raise Δt notch by notch from 0.005 to 0.3 — the trajectory spirals outward more and more, H climbs on the right, and from Δt = 0.2 the solution escapes the quadrant. Switch to RK4 at the same Δt: the curve hugs the dashed loop and the drift stays below 2×10⁻⁴. The readout’s “halving Δt shrinks it to 1/…”: about 1/2 for Euler at Δt ≤ 0.02 (error proportional to Δt), about 1/19 to 1/23 for RK4 (error roughly proportional to Δt⁴).',

    s6k: 'Step 6 · Add crowding',
    s6t: 'If the meadow can only feed so many rabbits, does the loop still close?',
    s6e: 'This step answers: so far rabbits with no foxes would grow without limit, which is unrealistic. Give them a <strong>carrying capacity</strong> K (hundreds): the most rabbits the meadow can feed, with breeding slowing as x nears K: x′ = a·x·(1 − x/K) − b·x·y (<a class="xlink" href="../../../biology/ecology/logistic-growth/#step2">→ Logistic growth, step 2: how growth slows in a finite world</a>). The fox equation is unchanged. The rabbit nullcline tilts into the line y = 2·(1 − x/K) and the equilibrium moves to (4, 2·(1 − 4/K)). How states move near it is set by the two <strong>eigenvalues</strong> λ of the <strong>Jacobian matrix</strong> — the table of coefficients you get by approximating the equations by linear ones near the equilibrium. A negative real part means states close in; an imaginary part means they circle while closing in (<a class="xlink" href="../../../math/linear-algebra/eigenvectors/#step2">→ Eigenvectors, step 2: what the sign and size of λ mean</a>). The start is fixed at (6, 1); we run 60 years.',
    K6: 'Carrying capacity K (hundred rabbits)', Kinf: 'K = ∞ (remove crowding)',
    c6a: 'Phase plane: the rabbit nullcline tilts', c6b: 'Counts over time (horizontal: years)',
    s6lgTraj: 'trajectory', s6lgNx: 'rabbit nullcline', s6lgNy: 'fox nullcline x = 4', s6lgEq: 'equilibrium',
    s6readout: '{K}: {kind}eigenvalues λ = {l1}, {l2}. After 60 years the state is still {dist} from the equilibrium; V, a measure of distance from the equilibrium (0 means exactly there), is down to {vr} × its starting value.',
    Klabel: 'K = {K}', KlabelInf: 'K = ∞',
    kSpiral: 'equilibrium ({x}, {y}); states circle as they close in (a spiral); ', kNode: 'equilibrium ({x}, {y}); states no longer circle but slide straight in; ', kCenter: 'equilibrium ({x}, {y}); without crowding the loops close and never close in (step 4’s case); ', kExtinct: 'rabbits can only reach {x}, too few to feed foxes (they need x to reach 4): foxes die out and the equilibrium is ({x}, 0); ',
    s6hint: 'What to try: start at K = 40 and drag down. The near-closed loop becomes a tightening spiral and the swings on the right die away. Below K = 2 + 2√2 ≈ 4.83 the state stops circling; at K ≤ 4 the fox line drops to 0. Press “K = ∞” to get the closed loop back for comparison.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'What you did on this page',
    s7fin: 'You started from two equations that only state “the rate of change right now” and pushed them, small step by small step, into a future: rabbits rise, foxes follow, rabbits get eaten down, foxes go hungry. Hide time and that repeating rise-and-fall is one closed loop in the phase plane. The two nullclines show that it <strong>turns anticlockwise around the equilibrium</strong>; the conserved quantity H shows that it <strong>closes exactly</strong>; a numerical method with too large a step makes H drift and the loop spiral outward — a computing error. Give the rabbits a carrying capacity and H is no longer conserved: the loop <strong>spirals or slides into the equilibrium</strong>, as its eigenvalues dictate.',
    formula: 'x′ = a·x·(1 − x/K) − b·x·y\ny′ = −c·y + d·x·y\nK = ∞: H = d·x − c·ln x + b·y − a·ln y is conserved',
    boundary: 'Scope: this is a model of continuous counts with fixed parameters and no randomness — for understanding the mechanism, not for forecasting real rabbits and foxes. A real population that gets very small dies out, while these equations let a count sink arbitrarily close to 0 and recover; seasons, migration and other species are ignored.',
    linksTitle: 'Where to go next',
    lk1: 'Population ecology, step 2: how populations swing once a predator arrives →', lk2: 'Logistic growth, step 3: why K is an asymptote →', lk3: 'Eigenvectors, step 2: the character of λ →', lk4: 'Derivative, step 3: what a derivative tells you →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “ODE Phase Portraits · Predators and Prey in a Loop”.'
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
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
