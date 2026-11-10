'use strict';
// Robot-arm kinematics lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '两连杆机械臂 · 角度、位置与速度',
    back: '← 知识索引',
    compare: '对照另一版本：高阶机器人学 · 从角度到末端 →',
    navLabel: '机械臂运动学步骤导航',
    tagline: '一台平面机械臂只有两个关节。控制器手里能改的只有两个角度，可任务总是用「手要到哪、往哪走」来描述。七步里你会从角度算出手的位置，看手能去哪，再倒推回角度；然后看关节转速怎样变成手的速度，为什么手臂伸直时会「卡住」，以及机器人实际怎样一步步迭代出关节角。',
    nav0: '0 正运动学', nav1: '1 工作空间', nav2: '2 逆运动学', nav3: '3 雅可比', nav4: '4 奇异位形', nav5: '5 迭代求解', nav6: '6 收束',
    legendArm1: '第一节臂（长 l₁）', legendArm2: '第二节臂（长 l₂）', legendHand: '手（末端）',

    s0k: '第 0 步 · 从角度到位置',
    s0t: '两个关节各转了多少度，手落在哪里？',
    s0e: '这一步要回答：已知两个关节的角度，手（机械臂的末端）在哪里？俯视一台平面二连杆机械臂：底座固定在原点，第一节臂长 l₁ = 1.0 m，第二节臂长 l₂ = 0.6 m。<strong>关节角</strong>：θ₁ 是第一节臂相对 x 轴转过的角度，θ₂ 是第二节臂相对第一节臂再转过的角度，逆时针为正。从关节角算手的位置叫<strong>正运动学</strong>。两节臂各是一根箭头，手的位置就是两根箭头首尾相接的和（<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">→ 向量页第 1 步：两根箭头怎样相加</a>）；每根箭头的分量是长度乘 cos、sin（<a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ 三角函数页第 1 步：cos、sin 是圆上点的坐标</a>）：<strong>x = l₁ cos θ₁ + l₂ cos(θ₁ + θ₂)，y = l₁ sin θ₁ + l₂ sin(θ₁ + θ₂)</strong>。第二节臂的方向是 θ₁ + θ₂，因为它装在第一节臂上，跟着一起转。',
    t1Slider: '关节角 θ₁（°）', t2Slider: '关节角 θ₂（°）', clearTrail: '清除轨迹',
    c0: '俯视图：机械臂与手走过的轨迹（单位 m）',
    s0lgTrail: '手走过的轨迹', s0lgC2: '只转 θ₂ 时手走的圆', s0lgC1: '只转 θ₁ 时手走的圆',
    s0readout: 'θ₁ = {t1}°，θ₂ = {t2}° → 肘部 ({ex}, {ey}) m，手 ({x}, {y}) m。手离底座 r = {r} m，这个距离只由 θ₂ 决定。',
    s0hint: '观察顺序：先保持 θ₁ 不动、只拖 θ₂，手沿橙色虚线圆走（以肘部为圆心、半径 0.6 m）；再保持 θ₂ 不动、只拖 θ₁，整条手臂像一块硬板绕底座转，手沿灰色虚线圆走，读数里的 r 不变。绿色轨迹记下手到过的每个位置。',

    s1k: '第 1 步 · 手能去哪',
    s1t: '把所有角度组合都试一遍，手能到达哪些地方？',
    s1e: '这一步要回答：两个关节随便转，手能到达的点合起来是什么形状？这个集合叫<strong>工作空间</strong>。「关节空间」图的横轴是 θ₁、纵轴是 θ₂（都从 −180° 到 180°），每个小格是一组角度，颜色表示这组角度让手离底座多远（颜色条见图下）；「工作空间」图把同一组角度对应的手位置画成同色的点。底座、肘部、手三点组成三角形，由余弦定理，手到底座的距离满足 <strong>r² = l₁² + l₂² + 2 l₁ l₂ cos θ₂</strong>，只取决于 θ₂（θ₁ 只是把整个三角形转一圈）。所以 r 最大是 l₁ + l₂（伸直，θ₂ = 0°），最小是 |l₁ − l₂|（完全折回，θ₂ = ±180°），工作空间是一个圆环。',
    l2Slider: '第二节臂长 l₂（m）', rhoSlider: '探测半径 ρ（m）', scan1: '重新扫描关节空间',
    c1a: '关节空间：横轴 θ₁、纵轴 θ₂（°）', c1b: '工作空间：手的位置（m）',
    s1lgNear: '离底座近', s1lgFar: '离底座远', s1lgProbe: '半径恰为 ρ 的角度与位置',
    s1progress: '已扫描 {c}/{N} 行 · ',
    s1readout: '{prog}l₂ = {l2} m：手能到达 {rin} m ≤ r ≤ {rout} m 的圆环。探测半径 ρ = {rho} m：{sol}',
    s1sol2: '关节空间里有两条横线 θ₂ = ±{a}° 让 r = ρ，所以这个圆上每一点都有两组角度能到。',
    s1sol1: '只有 θ₂ = {a}° 一条线（手臂伸直或完全折回），这个圆是工作空间的边界。',
    s1sol0: '没有任何 θ₂ 能让 r = ρ，这个圆在工作空间之外。',
    s1hint: '观察顺序：先按「重新扫描关节空间」，看关节空间图一行一行涂色，工作空间图同时一圈一圈铺开；注意关节空间里颜色只随纵向（θ₂）变化。再拖 ρ：关节空间出现两条关于 θ₂ = 0 对称的横线，工作空间出现对应的圆；把 ρ 拖到圆环外缘 1.6 m，两条线并成 θ₂ = 0° 一条。最后改 l₂：l₂ = l₁ = 1.0 m 时内圈缩成一点，手能碰到底座。',

    s2k: '第 2 步 · 从位置倒推角度',
    s2t: '给定手要去的点，两个关节该转多少？',
    s2e: '这一步要回答：反过来，已知目标点 (x, y)，求关节角 θ₁、θ₂。这叫<strong>逆运动学</strong>。先只看距离：底座、肘部、手三点组成三角形，三边是 l₁、l₂ 和 r = √(x² + y²)（r 是目标离底座的距离）。余弦定理给出 <strong>cos θ₂ = (r² − l₁² − l₂²) / (2 l₁ l₂)</strong>。只有算出的值落在 −1 到 1 之间才有解；θ₂ 可正可负（肘部向两侧弯），所以通常有<strong>两组解</strong>。θ₂ 定下后，<strong>θ₁ = atan2(y, x) − atan2(l₂ sin θ₂, l₁ + l₂ cos θ₂)</strong>：atan2(y, x) 是点 (x, y) 相对 x 轴的方向角，先让第一节臂指向目标，再扣掉第二节臂弯折造成的偏角。',
    txSlider: '目标 x（m）', tySlider: '目标 y（m）',
    c2: '给定目标点，求关节角（可直接拖动目标圈）',
    s2lgA: '解 A：θ₂ > 0', s2lgB: '解 B：θ₂ < 0', s2lgT: '目标点', s2lgReach: '可到达的圆环',
    s2readout: '目标 ({x}, {y}) m，r = {r} m → cos θ₂ = {c}。解 A：θ₁ = {a1}°，θ₂ = {a2}°；解 B：θ₁ = {b1}°，θ₂ = {b2}°。把两组角度代回正运动学，手与目标最多相差 {err} m。{note}',
    s2same: '两组解重合：目标正好在圆环边界上。',
    s2none: '目标 ({x}, {y}) m，r = {r} m → cos θ₂ = {c}，超出 −1 到 1：{why}',
    s2far: '目标比手臂伸直时还远（r > 1.6 m），没有解。',
    s2near: '目标离底座太近（r < 0.4 m），手臂折回也够不到，没有解。',
    s2hint: '观察顺序：拖目标 x 或 y（或在图上拖动目标圈），看实线（解 A）和虚线（解 B）两条手臂都把手送到同一点，两者关于「底座—目标」连线镜像对称。把目标往外拖到圆环边缘，两组解越靠越近，在边缘合成一组（手臂伸直）；再往外，读数说明无解。',

    s3k: '第 3 步 · 从转速到速度',
    s3t: '关节转得快一点，手这一瞬间朝哪走、走多快？',
    s3e: '这一步要回答：两个关节以转速 ω₁、ω₂ 转动时，手的速度 v 是多少？<strong>转速</strong>以 rad/s 计，即每秒转过多少弧度（1 rad ≈ 57.3°）。只转关节 1：整条手臂绕底座转，手沿垂直于「底座→手」的方向走，速度大小 r·ω₁。只转关节 2：手绕肘部转，沿垂直于「肘部→手」的方向走，速度大小 l₂·ω₂。两个一起转，两份速度直接相加：v = J₁ω₁ + J₂ω₂，其中 J₁、J₂ 是「该关节以 1 rad/s 转动时手的速度」。把 J₁、J₂ 当两列排成 2×2 矩阵 J，就是<strong>雅可比矩阵</strong>：<strong>v = J ω</strong>。它是从关节转速到手速度的线性映射（<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step1">→ 线性变换页第 1 步：矩阵把两列按系数合成</a>），但只对当前姿态成立：姿态一变，J 的两列也跟着变。',
    w1Slider: '关节 1 转速 ω₁（rad/s）', w2Slider: '关节 2 转速 ω₂（rad/s）', dtSlider: '预测时长 Δt（s）',
    c3: '关节转速 → 手的速度（箭头长度 = 1 s 内走过的距离）',
    s3lgJ1: 'J₁ω₁：只转关节 1 时手的速度', s3lgJ2: 'J₂ω₂：只转关节 2 时手的速度', s3lgV: 'v = J₁ω₁ + J₂ω₂', s3lgPred: '直线预测：沿 v 走 Δt 秒', s3lgArc: '关节真转 Δt 秒，手的路径与终点',
    s3readout: 'J = [[{a}, {b}], [{c}, {d}]] m/rad，ω = ({w1}, {w2}) rad/s → v = J ω = ({vx}, {vy}) m/s，速度大小 {sp} m/s。Δt = {dt} s 后：直线预测的终点与真实路径终点相差 {gap} m。',
    s3hint: '观察顺序：先把 ω₂ 拖到 0，白色箭头与青色箭头重合，垂直于底座到手的连线；再把 ω₁ 拖到 0、ω₂ 拖回非零，白色箭头换成橙色那根，垂直于肘部到手。两者都不为 0 时，白色箭头是青、橙两根拼成的平行四边形的对角线。最后把 Δt 从 1 s 往小拖：绿色虚线和绿点是关节真按这个转速转 Δt 秒后手走过的弧和终点，白色圆圈是沿白色箭头直线走 Δt 秒的预测。Δt 越小两者越贴合：在默认姿态和转速下，Δt 每减半，两个终点的差距大约变为 1/4。',

    s4k: '第 4 步 · 卡住的姿态',
    s4t: '有没有某种姿态，无论关节怎么转，手都没法朝某个方向动？',
    s4e: '这一步要回答：雅可比 J 在什么姿态下会「失灵」，失灵时会发生什么？让关节转速取遍所有总大小为 1 rad/s 的组合（ω₁² + ω₂² = 1），手的速度端点画出一个椭圆，叫<strong>速度椭圆</strong>（v = J ω，ω 取单位圆）：长半轴 σ₁ 是手最容易走的方向上的速度，短半轴 σ₂ 是最难走的方向上的速度，单位都是每 1 rad/s 关节转速换来的 m/s。椭圆面积是 π σ₁σ₂，而 σ₁σ₂ = |det J|：<strong>行列式</strong> det J 是矩阵把面积放大的倍数，对这台手臂恰好是 <strong>det J = l₁ l₂ sin θ₂</strong>（<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step3">→ 线性变换页第 3 步：det = 0 时平面被压成一条线</a>）。θ₂ = 0°（伸直）或 ±180°（完全折回）时 det J = 0，椭圆压成线段，手沿「底座—手」连线方向（径向）一点也动不了，这种姿态叫<strong>奇异位形</strong>。θ₁ 只把整幅图转一个角度，这里固定为 30°。',
    t2Slider4: '关节角 θ₂（°），θ₁ 固定 30°', sweep4: '从 θ₂ = 90° 扫到 1°',
    c4a: '速度椭圆：ω₁² + ω₂² = 1 时 v 的端点', c4b: '椭圆半轴 σ₁、σ₂（m/s）', c4c: '径向外移 0.2 m/s 所需关节转速 |ω|（rad/s，对数轴）',
    s4lgEll: '速度椭圆（1 m/s 画成 0.3 m）', s4lgS1: 'σ₁ 长半轴', s4lgS2: 'σ₂ 短半轴', s4lgW: '所需 |ω|', s4lgNow: '当前 θ₂',
    s4readout: 'θ₂ = {t2}°：σ₁ = {s1}、σ₂ = {s2}（m/s 每 1 rad/s），det J = {det} m²（= l₁l₂ sin θ₂）。要让手以 0.2 m/s 沿径向向外走，需要 ω₁ = {w1}、ω₂ = {w2} rad/s，合计 |ω| = {w} rad/s。',
    s4sing: 'θ₂ = {t2}°：σ₁ = {s1}、σ₂ = 0，det J = 0 m²。奇异位形：没有任何有限的关节转速能让手沿径向移动。',
    s4hint: '观察顺序：从 θ₂ = 90° 开始慢慢拖向 0°（或按扫描按钮）。在「速度椭圆」图里，椭圆在底座—手连线（灰色虚线）方向上越来越窄，最后压成一条横在连线上的线段；在「椭圆半轴」图里，σ₂ 掉向 0，σ₁ 却不降反升（手沿垂直于连线的方向仍然走得动）；在对数轴图里，维持同样的径向速度，所需关节转速大约按 1/sin θ₂ 飙升：θ₂ = 10° 时约 {w10} rad/s，2° 时约 {w2} rad/s。再拖向 ±180°，是另一种奇异：手臂完全折回，手靠在内圈边上。',

    s5k: '第 5 步 · 机器人怎样真的求解',
    s5t: '没有现成公式时，怎样一步步逼近正确的关节角？',
    s5e: '这一步要回答：第 2 步的公式只对这种两连杆成立；关节一多就没有现成公式，机器人怎样求逆运动学？答案是迭代。先猜一组角度，用正运动学算出手现在在哪，得到到目标的误差 e（一个二维向量，单位 m）；用雅可比把「手要挪 e」翻译成「关节要转 Δθ = J⁻¹ e」，转过去，再看还差多少，重复。这就是<strong>牛顿法</strong>：在当前姿态用 J 把正运动学近似成线性的，一步解出这个线性方程（<a class="xlink" href="../../../math/calculus/newton-method/#step2">→ 牛顿法页第 2 步：每走一步，正确位数大约翻倍</a>）。目标够不着时，手臂会被拉向伸直的奇异位形，J⁻¹ 极大，牛顿法乱跳。<strong>阻尼最小二乘</strong>把每一步改成 Δθ = Jᵀ(J Jᵀ + λ² I)⁻¹ e：<strong>阻尼</strong> λ 越大，每步越保守，在奇异附近不乱跳，代价是在够得着时收敛变慢。λ = 0 就是牛顿法。初始猜测固定为 θ₁ = 0°、θ₂ = 30°。',
    lamSlider: '阻尼 λ（m）', step5: '迭代一步', run5: '连续迭代到第 15 步', reset5: '回到初始猜测', preIn: '目标够得着 (0.9, 0.9)', preOut: '目标够不着 (1.5, 1.0)',
    c5a: '每次迭代后的手臂（越淡越早）', c5b: '手到目标的距离（m，对数轴）',
    s5lgGhost: '较早的迭代', s5lgNow: '当前迭代', s5lgT: '目标点', s5lgErr: '每次迭代的误差',
    s5readout: '{it}手在 ({x}, {y}) m，离目标 {err} m；θ₁ = {t1}°，θ₂ = {t2}°。{note}',
    s5it0: '初始猜测（尚未迭代）：', s5itk: '第 {k}/{N} 次迭代后：',
    s5conv: '在第 {k0} 次迭代后误差首次低于 10⁻⁶ m。',
    s5out: '目标离底座 {r} m，超过最大伸展 1.6 m，最好也只能差 {gap} m。',
    s5hint: '观察顺序：先选「目标够得着」、λ = 0，按「连续迭代」：误差图前几步起伏，之后几乎垂直下坠：第 5、6、7 次迭代后分别约为 {e5}、{e6}、{e7} m，每步指数约翻倍。把 λ 调到 0.3 再跑：变成一条缓坡，每步误差只缩小约 3 倍。再选「目标够不着」：λ = 0 时误差上下乱跳；λ = 0.3 时误差停在 {gapOut} m，手臂伸直指向目标，这正是能到的最近点。改目标或 λ 会回到初始猜测重新开始。',

    s6k: '第 6 步 · 收束', s6t: '角度和位置之间，隔着一个会变的矩阵',
    s6fin: '回顾。<strong>第 0 步</strong>：正运动学把两根臂当箭头相加，从角度直接算出手的位置。<strong>第 1 步</strong>：手离底座的距离只由 θ₂ 决定，工作空间是一个圆环。<strong>第 2 步</strong>：逆运动学用余弦定理倒推，圆环内部每点有两组解，边界上合成一组。<strong>第 3 步</strong>：雅可比 J 把关节转速线性地变成手的速度，但只在当前姿态成立。<strong>第 4 步</strong>：det J = l₁l₂ sin θ₂，伸直或折回时为 0，手在径向动不了，所需转速趋向无穷。<strong>第 5 步</strong>：没有公式时用 J 反复修正；够得着时牛顿法收敛极快，够不着时要加阻尼。',
    formula: 'p = (l₁cos θ₁ + l₂cos(θ₁+θ₂), l₁sin θ₁ + l₂sin(θ₁+θ₂))\nv = J(θ) ω,  det J = l₁ l₂ sin θ₂\nΔθ = Jᵀ(J Jᵀ + λ²I)⁻¹ (p目标 − p)',
    boundary: '适用范围：本页是只有两个转动关节、在一个平面内运动的理想机械臂。没有模拟质量、力矩和电机（动力学），没有关节限位、碰撞和控制延迟；速度关系只讲瞬时的运动学。真实工业臂通常有 6 个或更多关节，手的位置和朝向一共 6 个量，J 是 6×n 矩阵；关节多于 6 个时同一个手位姿有无穷多组解，要另加目标去挑。第 5 步的数字只对本页的初始猜测和两个目标成立，换初值可能收敛到另一组解或收敛得更慢。',
    linksTitle: '接着去哪',
    lk1: '→ 线性变换页第 2 步：行列式是有符号的面积倍率',
    lk2: '→ 牛顿法页第 3 步：切线并不总是带你回家',
    lk3: '→ 向量页第 1 步：两个向量合在一起是哪个箭头',
    lk4: '→ 三角函数页第 1 步：cos 是站位，sin 是身高',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《高阶机器人学 · 从角度到末端》的平行版本。'
  },
  en: {
    pageTitle: 'A Two-Link Robot Arm · Angles, Positions and Speeds',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Advanced Robotics · From Angles to the End Effector →',
    navLabel: 'Robot arm kinematics steps',
    tagline: 'A flat robot arm with just two joints. The controller can only set two angles, yet every task is phrased as “put the hand there, move it that way”. In seven steps you will compute the hand position from the angles, map where the hand can go and work back to the angles; then see how joint speeds become hand velocity, why a straightened arm gets “stuck”, and how a robot actually iterates its way to the joint angles.',
    nav0: '0 Forward kinematics', nav1: '1 Workspace', nav2: '2 Inverse kinematics', nav3: '3 Jacobian', nav4: '4 Singularities', nav5: '5 Iterative solving', nav6: '6 Wrap-up',
    legendArm1: 'link 1 (length l₁)', legendArm2: 'link 2 (length l₂)', legendHand: 'hand (end effector)',

    s0k: 'Step 0 · From angles to position',
    s0t: 'Given how far each joint has turned, where is the hand?',
    s0e: 'This step asks: knowing both joint angles, where is the hand (the tip of the arm)? Look down on a flat two-link arm. Its base is fixed at the origin; link 1 is l₁ = 1.0 m long and link 2 is l₂ = 0.6 m. The <strong>joint angles</strong>: θ₁ is how far link 1 has turned from the x axis, and θ₂ is how far link 2 has turned relative to link 1, counter-clockwise positive. Computing the hand position from the joint angles is called <strong>forward kinematics</strong>. Each link is an arrow, and the hand sits where the two arrows end when placed head to tail (<a class="xlink" href="../../../math/linear-algebra/vectors/#step1">→ Vectors, step 1: adding two arrows</a>); each arrow’s components are its length times cos and sin (<a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ Trigonometry, step 1: cos and sin as coordinates on a circle</a>): <strong>x = l₁ cos θ₁ + l₂ cos(θ₁ + θ₂), y = l₁ sin θ₁ + l₂ sin(θ₁ + θ₂)</strong>. Link 2 points along θ₁ + θ₂ because it is mounted on link 1 and turns with it.',
    t1Slider: 'Joint angle θ₁ (°)', t2Slider: 'Joint angle θ₂ (°)', clearTrail: 'Clear trail',
    c0: 'Top view: the arm and the path of its hand (m)',
    s0lgTrail: 'path of the hand', s0lgC2: 'circle the hand follows when only θ₂ turns', s0lgC1: 'circle the hand follows when only θ₁ turns',
    s0readout: 'θ₁ = {t1}°, θ₂ = {t2}° → elbow at ({ex}, {ey}) m, hand at ({x}, {y}) m. The hand is r = {r} m from the base, a distance set by θ₂ alone.',
    s0hint: 'What to try: hold θ₁ and drag only θ₂; the hand runs along the orange dashed circle (centred on the elbow, radius 0.6 m). Then hold θ₂ and drag only θ₁; the whole arm swings about the base like a rigid board, the hand runs along the grey dashed circle and r in the readout stays put. The green trail keeps every place the hand has been.',

    s1k: 'Step 1 · Where the hand can go',
    s1t: 'Try every pair of angles: which places can the hand reach?',
    s1e: 'This step asks: if both joints turn freely, what shape do all the reachable hand positions make? That set is the <strong>workspace</strong>. In the “Joint space” chart the horizontal axis is θ₁ and the vertical axis θ₂ (both −180° to 180°); each cell is one pair of angles, coloured by how far that pair puts the hand from the base (colour bar below the charts). The “Workspace” chart plots the hand position for the same pair in the same colour. Base, elbow and hand form a triangle, and the law of cosines gives the hand’s distance from the base: <strong>r² = l₁² + l₂² + 2 l₁ l₂ cos θ₂</strong>. It depends on θ₂ alone (θ₁ only spins the whole triangle). So r is at most l₁ + l₂ (straight, θ₂ = 0°) and at least |l₁ − l₂| (folded back, θ₂ = ±180°): the workspace is a ring.',
    l2Slider: 'Length of link 2, l₂ (m)', rhoSlider: 'Probe radius ρ (m)', scan1: 'Rescan joint space',
    c1a: 'Joint space: θ₁ across, θ₂ up (°)', c1b: 'Workspace: hand positions (m)',
    s1lgNear: 'near the base', s1lgFar: 'far from the base', s1lgProbe: 'angles and positions with radius exactly ρ',
    s1progress: 'Scanned {c}/{N} rows · ',
    s1readout: '{prog}l₂ = {l2} m: the hand reaches the ring {rin} m ≤ r ≤ {rout} m. Probe radius ρ = {rho} m: {sol}',
    s1sol2: 'two horizontal lines in joint space, θ₂ = ±{a}°, give r = ρ, so every point on this circle can be reached with two different pairs of angles.',
    s1sol1: 'only the line θ₂ = {a}° (arm straight or fully folded); this circle is the edge of the workspace.',
    s1sol0: 'no θ₂ gives r = ρ; this circle lies outside the workspace.',
    s1hint: 'What to try: press “Rescan joint space” and watch the joint-space chart fill row by row while the workspace chart fills ring by ring; notice that colours in joint space change only vertically (with θ₂). Then drag ρ: two horizontal lines appear in joint space, mirror images about θ₂ = 0, and the matching circle appears in the workspace; drag ρ out to the rim at 1.6 m and the two lines merge into the single line θ₂ = 0°. Finally change l₂: with l₂ = l₁ = 1.0 m the inner hole shrinks to a point and the hand can touch the base.',

    s2k: 'Step 2 · From position back to angles',
    s2t: 'Given where the hand must go, how far should each joint turn?',
    s2e: 'This step asks the reverse question: given a target point (x, y), find θ₁ and θ₂. This is <strong>inverse kinematics</strong>. Start with distances only. Base, elbow and hand form a triangle with sides l₁, l₂ and r = √(x² + y²), the target’s distance from the base. The law of cosines gives <strong>cos θ₂ = (r² − l₁² − l₂²) / (2 l₁ l₂)</strong>. There is a solution only if this value lies between −1 and 1, and θ₂ may be positive or negative (the elbow bends to either side), so there are usually <strong>two solutions</strong>. Once θ₂ is known, <strong>θ₁ = atan2(y, x) − atan2(l₂ sin θ₂, l₁ + l₂ cos θ₂)</strong>: atan2(y, x) is the direction of the point (x, y) from the x axis, so link 1 first aims at the target and then backs off by the angle the bent link 2 adds.',
    txSlider: 'Target x (m)', tySlider: 'Target y (m)',
    c2: 'Given a target, find the joint angles (drag the target ring)',
    s2lgA: 'solution A: θ₂ > 0', s2lgB: 'solution B: θ₂ < 0', s2lgT: 'target', s2lgReach: 'reachable ring',
    s2readout: 'Target ({x}, {y}) m, r = {r} m → cos θ₂ = {c}. Solution A: θ₁ = {a1}°, θ₂ = {a2}°; solution B: θ₁ = {b1}°, θ₂ = {b2}°. Fed back through forward kinematics, both put the hand within {err} m of the target. {note}',
    s2same: 'The two solutions coincide: the target sits exactly on the edge of the ring.',
    s2none: 'Target ({x}, {y}) m, r = {r} m → cos θ₂ = {c}, outside −1 to 1: {why}',
    s2far: 'the target is farther than the straightened arm (r > 1.6 m), so there is no solution.',
    s2near: 'the target is too close to the base (r < 0.4 m); even fully folded the arm cannot get there, so there is no solution.',
    s2hint: 'What to try: drag target x or y (or drag the target ring on the chart) and see the solid arm (solution A) and the dashed arm (solution B) both deliver the hand to the same point, mirror images across the base-to-target line. Drag the target out to the rim of the ring: the two solutions close in and merge at the rim (arm straight); go further and the readout says there is no solution.',

    s3k: 'Step 3 · From joint speeds to hand velocity',
    s3t: 'Turn the joints a little faster: which way, and how fast, does the hand move right now?',
    s3e: 'This step asks: with joints turning at speeds ω₁ and ω₂, what is the hand velocity v? <strong>Joint speed</strong> is in rad/s, radians turned per second (1 rad ≈ 57.3°). Turn joint 1 alone and the whole arm swings about the base: the hand moves at right angles to the base-to-hand line, at speed r·ω₁. Turn joint 2 alone and the hand swings about the elbow: it moves at right angles to the elbow-to-hand line, at speed l₂·ω₂. Turn both and the two velocities simply add: v = J₁ω₁ + J₂ω₂, where J₁ and J₂ are the hand velocities when that one joint turns at 1 rad/s. Stack J₁ and J₂ as the columns of a 2×2 matrix J, the <strong>Jacobian</strong>: <strong>v = J ω</strong>. It maps joint speeds to hand velocity linearly (<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step1">→ Linear transforms, step 1: a matrix mixes its two columns</a>), but only at the current pose: change the pose and both columns change.',
    w1Slider: 'Joint 1 speed ω₁ (rad/s)', w2Slider: 'Joint 2 speed ω₂ (rad/s)', dtSlider: 'Look-ahead Δt (s)',
    c3: 'Joint speeds → hand velocity (arrow length = distance covered in 1 s)',
    s3lgJ1: 'J₁ω₁: hand velocity with joint 1 only', s3lgJ2: 'J₂ω₂: hand velocity with joint 2 only', s3lgV: 'v = J₁ω₁ + J₂ω₂', s3lgPred: 'straight-line prediction: follow v for Δt', s3lgArc: 'hand path and end point when the joints really turn for Δt',
    s3readout: 'J = [[{a}, {b}], [{c}, {d}]] m/rad, ω = ({w1}, {w2}) rad/s → v = J ω = ({vx}, {vy}) m/s, speed {sp} m/s. After Δt = {dt} s the straight-line prediction ends {gap} m from where the hand really ends up.',
    s3hint: 'What to try: drag ω₂ to 0 and the white arrow lies on the cyan one, at right angles to the base-to-hand line. Then drag ω₁ to 0 and ω₂ back to non-zero: the white arrow becomes the orange one, at right angles to the elbow-to-hand line. With both non-zero, the white arrow is the diagonal of the parallelogram built on the cyan and orange arrows. Finally drag Δt down from 1 s: the green dashed arc and green dot show where the hand really goes if the joints keep these speeds for Δt seconds, and the white ring is the prediction from moving straight along the white arrow for Δt. The smaller Δt, the closer they agree: at the default pose and speeds, each halving of Δt cuts the gap between the two end points to about a quarter.',

    s4k: 'Step 4 · Poses where the arm gets stuck',
    s4t: 'Is there a pose where no joint motion can move the hand in some direction?',
    s4e: 'This step asks: at which poses does the Jacobian J “fail”, and what happens then? Let the joint speeds run over every combination with total size 1 rad/s (ω₁² + ω₂² = 1). The tip of the hand velocity traces an ellipse, the <strong>velocity ellipse</strong> (v = J ω with ω on the unit circle). Its long semi-axis σ₁ is the hand speed in the easiest direction and its short semi-axis σ₂ the speed in the hardest one, both in m/s per 1 rad/s of joint speed. The ellipse area is π σ₁σ₂, and σ₁σ₂ = |det J|: the <strong>determinant</strong> det J is the factor by which the matrix scales areas, and for this arm it is exactly <strong>det J = l₁ l₂ sin θ₂</strong> (<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step3">→ Linear transforms, step 3: det = 0 squashes the plane onto a line</a>). At θ₂ = 0° (straight) or ±180° (folded back) det J = 0, the ellipse collapses to a segment and the hand cannot move at all along the base-to-hand line (radially). Such a pose is a <strong>singular configuration</strong>. θ₁ only rotates the whole picture, so it is fixed at 30° here.',
    t2Slider4: 'Joint angle θ₂ (°), θ₁ fixed at 30°', sweep4: 'Sweep θ₂ from 90° to 1°',
    c4a: 'Velocity ellipse: tips of v for ω₁² + ω₂² = 1', c4b: 'Semi-axes σ₁, σ₂ (m/s)', c4c: 'Joint speed |ω| for 0.2 m/s radially outward (rad/s, log axis)',
    s4lgEll: 'velocity ellipse (1 m/s drawn as 0.3 m)', s4lgS1: 'σ₁ long semi-axis', s4lgS2: 'σ₂ short semi-axis', s4lgW: 'required |ω|', s4lgNow: 'current θ₂',
    s4readout: 'θ₂ = {t2}°: σ₁ = {s1}, σ₂ = {s2} (m/s per 1 rad/s), det J = {det} m² (= l₁l₂ sin θ₂). To move the hand radially outward at 0.2 m/s takes ω₁ = {w1}, ω₂ = {w2} rad/s, |ω| = {w} rad/s in total.',
    s4sing: 'θ₂ = {t2}°: σ₁ = {s1}, σ₂ = 0, det J = 0 m². Singular configuration: no finite joint speed moves the hand radially.',
    s4hint: 'What to try: start at θ₂ = 90° and drag slowly toward 0° (or press the sweep button). In the “Velocity ellipse” chart the ellipse gets thinner along the base-to-hand line (grey dashes) until it is a segment lying across that line; in the “Semi-axes” chart σ₂ falls toward 0 while σ₁ even grows (the hand can still move across that line); on the log-axis chart the joint speed needed for the same radial hand speed shoots up roughly as 1/sin θ₂: about {w10} rad/s at θ₂ = 10° and about {w2} rad/s at 2°. Then drag toward ±180° for the other singularity: the arm is folded back with the hand on the inner rim.',

    s5k: 'Step 5 · How a robot really solves it',
    s5t: 'With no formula to hand, how do you home in on the correct joint angles?',
    s5e: 'This step asks: step 2’s formula only works for this two-link arm; with more joints there is no ready-made formula, so how does a robot do inverse kinematics? By iterating. Guess some angles, use forward kinematics to see where the hand is, and get the error e to the target (a 2-D vector, in m). Use the Jacobian to turn “move the hand by e” into “turn the joints by Δθ = J⁻¹ e”, turn them, check the error again, and repeat. This is <strong>Newton’s method</strong>: at the current pose J makes forward kinematics look linear, and one step solves that linear equation (<a class="xlink" href="../../../math/calculus/newton-method/#step2">→ Newton’s method, step 2: correct digits roughly double each step</a>). When the target is out of reach the arm is dragged toward the straight, singular pose, J⁻¹ becomes huge and Newton jumps about. <strong>Damped least squares</strong> changes each step to Δθ = Jᵀ(J Jᵀ + λ² I)⁻¹ e: the larger the <strong>damping</strong> λ, the more cautious each step, so it does not jump about near a singularity, at the price of slower convergence when the target is reachable. λ = 0 is plain Newton. The starting guess is always θ₁ = 0°, θ₂ = 30°.',
    lamSlider: 'Damping λ (m)', step5: 'One iteration', run5: 'Iterate up to 15', reset5: 'Back to the starting guess', preIn: 'Reachable target (0.9, 0.9)', preOut: 'Unreachable target (1.5, 1.0)',
    c5a: 'The arm after each iteration (fainter = earlier)', c5b: 'Hand-to-target distance (m, log axis)',
    s5lgGhost: 'earlier iterations', s5lgNow: 'current iteration', s5lgT: 'target', s5lgErr: 'error after each iteration',
    s5readout: '{it}hand at ({x}, {y}) m, {err} m from the target; θ₁ = {t1}°, θ₂ = {t2}°. {note}',
    s5it0: 'Starting guess (no iterations yet): ', s5itk: 'After iteration {k}/{N}: ',
    s5conv: 'The error first dropped below 10⁻⁶ m after iteration {k0}.',
    s5out: 'The target is {r} m from the base, beyond the 1.6 m full stretch, so the best possible miss is {gap} m.',
    s5hint: 'What to try: choose “Reachable target” with λ = 0 and press “Iterate up to 15”. The error wobbles for a few steps, then drops almost vertically: about {e5}, {e6} and {e7} m after iterations 5, 6 and 7, the exponent roughly doubling each time. Set λ to 0.3 and run again: a gentle slope, each step only cutting the error by about a factor of 3. Now choose “Unreachable target”: with λ = 0 the error jumps up and down; with λ = 0.3 it settles at {gapOut} m with the arm stretched straight toward the target, the closest the hand can get. Changing the target or λ restarts from the initial guess.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Between angles and positions sits a matrix that keeps changing',
    s6fin: 'Looking back. <strong>Step 0</strong>: forward kinematics adds the two links as arrows and gets the hand position straight from the angles. <strong>Step 1</strong>: the hand’s distance from the base depends on θ₂ alone, so the workspace is a ring. <strong>Step 2</strong>: inverse kinematics works backwards with the law of cosines; inside the ring every point has two solutions, which merge on the rim. <strong>Step 3</strong>: the Jacobian J turns joint speeds into hand velocity linearly, but only at the current pose. <strong>Step 4</strong>: det J = l₁l₂ sin θ₂ vanishes when the arm is straight or folded back; the hand cannot move radially and the joint speeds needed blow up. <strong>Step 5</strong>: without a formula, J is used to correct again and again; Newton converges very fast when the target is reachable, and needs damping when it is not.',
    formula: 'p = (l₁cos θ₁ + l₂cos(θ₁+θ₂), l₁sin θ₁ + l₂sin(θ₁+θ₂))\nv = J(θ) ω,  det J = l₁ l₂ sin θ₂\nΔθ = Jᵀ(J Jᵀ + λ²I)⁻¹ (p_target − p)',
    boundary: 'Scope: this page models an ideal arm with two revolute joints moving in one plane. It does not simulate masses, torques or motors (dynamics), joint limits, collisions or control delays; the velocity relation is instantaneous kinematics only. Real industrial arms usually have six or more joints; hand position plus orientation is six numbers and J is a 6×n matrix; with more than six joints one hand pose has infinitely many solutions and an extra goal is needed to choose among them. Step 5’s numbers hold only for this page’s starting guess and its two targets; another starting guess may converge to the other solution, or more slowly.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear transforms, step 2: the determinant is a signed area factor',
    lk2: '→ Newton’s method, step 3: the tangent does not always lead home',
    lk3: '→ Vectors, step 1: which arrow two vectors make together',
    lk4: '→ Trigonometry, step 1: cos is where you stand, sin is how high',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Advanced Robotics · From Angles to the End Effector”.'
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
  if (typeof window.refreshArm === 'function') window.refreshArm();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ARM_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
