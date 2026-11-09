'use strict';
// Conic sections lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '圆锥曲线 · 一刀切出四种曲线',
    back: '← 知识索引',
    compare: '对照另一版本：圆锥曲线 →',
    navLabel: '圆锥曲线步骤导航',
    tagline: '拿一个冰淇淋筒那样的圆锥，用一块平板去切它：平着切、斜着切、竖着切，切口分别是圆、椭圆、抛物线、双曲线。它们为什么是一家人？切出来的椭圆为什么偏偏有两个「焦点」？六步里你会从圆锥一路走到纸上的作图法、一个统一的数 e，最后看到焦点为什么能把光聚到一起。',
    nav0: '0 切一刀', nav1: '1 两个球', nav2: '2 钉子和绳', nav3: '3 一个数 e', nav4: '4 反射聚焦', nav5: '5 收束',
    k_circle: '圆', k_ellipse: '椭圆', k_parabola: '抛物线', k_hyperbola: '双曲线',
    tilt: '平面倾角 β（与水平面的夹角）',

    s0k: '第 0 步 · 切一刀',
    s0t: '平面斜到什么程度，切口会从闭合的圈变成张开的线？',
    s0e: '这一步要回答：切口的形状由什么决定？我们的圆锥是<strong>双圆锥</strong>：两个圆锥尖对尖接在一起，中间竖直的线叫<strong>轴</strong>。它的侧面和水平面成 60°（也就是侧面和轴成 30°）。一块平板穿过轴上固定的一点，绕着它转动；平板和水平面的夹角叫<strong>倾角 β</strong>。左图（窄屏时在上方）是从侧面看过去的样子：灰色是圆锥，紫色虚线是平板的边，橙色是平板落在圆锥里面的那一段。右图（窄屏时在下方）把平板转正、正对着它看，画出切口的真实形状（紫色直线就是左图那条紫色虚线）。<strong>抛物线</strong>就是二次函数 y = ax² 的图像那种开口曲线（<a class="xlink" href="../../../math/algebra/parabola/#step1">→ 抛物线页第 1 步：y = ax² 里 a 管开口方向和胖瘦</a>）；<strong>双曲线</strong>有两支，分别在上下两个圆锥上。',
    lgCone: '双圆锥（侧视）', lgPlane: '紫色虚线 = 切割平面', lgCutAxis: '橙色 = 平面在圆锥里的那段', lgCurve: '青色 = 正对平面看到的切口', lgEarlier: '淡色 = 之前试过的倾角',
    sweepTilt: '从平切到竖切扫一遍',
    c0a: '侧面看：圆锥和平面', c0b: '正对平面看：切口的真实形状',
    cmpLess: '倾角 {b}° 比侧面的 {s}° 小：平面只穿过一个圆锥，切口绕一圈闭合。',
    cmpEq: '倾角正好等于侧面的 {s}°：平面和一条侧边平行，切口一头永远合不拢。',
    cmpMore: '倾角 {b}° 比侧面的 {s}° 大：平面同时穿过上下两个圆锥，切口分成两支。',
    shapeEll: '半长轴 a = {a}，半短轴 b = {b}（长度单位同图中网格，平面过轴的位置离尖 1.5）。',
    shapeHyp: '两支各在一个圆锥上，向外无限延伸。',
    shapePar: '只有一支，向一边无限延伸。',
    s0readout: '{cmp} 切口是{kind}。离心率 e = sin β ÷ sin 60° = {e}。{shape}',
    s0hint: '观察顺序：先按「从平切到竖切扫一遍」，看正对平面那张图里的淡色轨迹：β = 0 是圆，β 变大时圆被拉长成椭圆，β = 60° 一头张开成抛物线，再大就分成两支的双曲线。然后手动拖 β，在侧视图里盯住橙色那段：它在 β < 60° 时两头都碰到圆锥，等于 60° 时有一头和侧边平行、永远碰不到。读数里的 e 小于 1、等于 1、大于 1，正好对应这三种情形（e 的几何意义在第 3 步）。平板不过圆锥尖；过尖时会切出一个点或直线，本页不讨论。',

    s1k: '第 1 步 · 两个球',
    s1t: '从圆锥上切下的椭圆，为什么到两个定点的距离之和处处相同？',
    s1e: '这一步要回答：上一步切出的椭圆，和「到两个定点距离之和不变」的椭圆是同一种曲线吗？1822 年丹德林给了一个漂亮的证明。往圆锥里放两个球，一个在平面下方，一个在上方，各自吹大到刚好贴住圆锥侧面（贴在一圈圆上）、同时贴住平面（贴在一个点上）。这两个贴点 F₁、F₂ 就是椭圆的<strong>焦点</strong>。证明只用一条事实：<strong>从球外一点向球引的切线，长度都一样</strong>。取椭圆上任一点 P：PF₁ 是从 P 到小球的切线；顺着圆锥的<strong>母线</strong>（侧面上过尖的直线）从 P 走到小球的接触圆，也是一条从 P 到小球的切线，所以两者等长。大球同理。于是 PF₁ + PF₂ = 母线夹在两个接触圆之间的那段长度——它和 P 在哪儿无关。左图（窄屏时在上方）是侧视（粉色小球、绿色大球、虚线是接触圆、白色粗线是两圆之间的母线段）；右图（窄屏时在下方）是正对平面看到的椭圆。',
    lgS1: '小球与焦点 F₁', lgS2: '大球与焦点 F₂', lgGen: '白线 = 两个接触圆之间的母线段', lgP: '白点 = 椭圆上的点 P', lgPF1: 'PF₁', lgPF2: 'PF₂', lgBar: '底部条：PF₁ + PF₂ 与白色母线段（同一比例）',
    pPos: '点 P 在椭圆上的位置（绕中心的角度）', walkP: '让 P 绕椭圆走一圈',
    c1a: '侧面看：两个球贴住圆锥和平面', c1b: '正对平面：P 到两个焦点',
    circleNote: 'β = 0 时两个焦点重合在圆心，切口是圆。',
    ellNote: '拖动 P，两段一长一短此消彼长，和不变。',
    s1readout: 'PF₁ = {d1}，PF₂ = {d2}，和 = {sum}。母线段长 L = {L}，椭圆长轴 2a = {a2}。沿母线从 P 到两个接触圆：{c1} 和 {c2}（分别等于 PF₁、PF₂）。{note}',
    s1hint: '观察顺序：先按「让 P 绕椭圆走一圈」，看椭圆下方的两色条：粉色和绿色一长一短不停交换，加起来始终和下面的白条一样长。再拖倾角 β：两个球一起变大或变小，焦点移动，白色母线段的长度跟着变，但对同一个 β，和永远等于它。本步只看椭圆（β 从 0° 到 40°）；双曲线的情形是两个球分别在上下两个圆锥里，得到的是距离之差不变。',

    s2k: '第 2 步 · 钉子和绳',
    s2t: '不用圆锥，怎样在纸上直接画出椭圆和双曲线？',
    s2e: '这一步要回答：「到两点距离之和不变」能不能直接拿来作图？在纸上钉两颗钉子 F₁、F₂，相距 2c；拿一根长 2a 的绳子，两头系在钉子上，用笔把绳子绷紧转一圈，笔尖画出的就是椭圆：笔尖 P 时时满足 PF₁ + PF₂ = 2a。把「和」换成「差」：|PF₁ − PF₂| = 2a，画出的就是双曲线的两支。为了写方程，把两颗钉子放在 x 轴上 (−c, 0) 和 (c, 0)，原点在正中：椭圆是 x²/a² + y²/b² = 1，其中 b² = a² − c²；双曲线是 x²/a² − y²/b² = 1，其中 b² = c² − a²。<strong>离心率</strong> e = c/a：钉子离得越开（c 越接近 a），椭圆越扁。行星绕太阳的轨道就是椭圆，太阳在一个焦点上（<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step2">→ 引力与轨道页第 2 步：轨道为什么只在两个半径之间来回</a>）。',
    lgF1: '钉子 F₁ 与 PF₁', lgF2: '钉子 F₂ 与 PF₂', lgPencil: '白点 = 笔尖 P', lgTrail: '笔尖走过的点',
    modeSum: '距离之和 = 2a（椭圆）', modeDiff: '距离之差 = 2a（双曲线）',
    aSlider: 'a（绳长或差的一半）', cSlider: 'c（钉距的一半）', pencilSlider: '笔尖沿曲线走过的比例',
    drawLoop: '自动画一遍', clearTrail: '清除笔迹',
    c2sum: '钉子和绳：PF₁ + PF₂ = 2a', c2diff: '换成差：|PF₁ − PF₂| = 2a',
    s2progress: '已描 {c}/{N} 个点。',
    s2readSum: 'PF₁ = {d1}，PF₂ = {d2}，和 = {s}（绳长 2a = {a2}）。b = {b}，e = c/a = {e}。方程：{eq}',
    s2readDiff: 'PF₁ = {d1}，PF₂ = {d2}，差的绝对值 = {s}（2a = {a2}）。b = {b}，e = c/a = {e}。方程：{eq}',
    eqEll: 'x²/{a2} + y²/{b2} = 1', eqHyp: 'x²/{a2} − y²/{b2} = 1',
    s2badSum: '绳长的一半 a = {a} 不大于钉距的一半 c = {c}：绳子绷在两颗钉子之间就没有余量，拉不出一个圈。椭圆要求 a > c。',
    s2badDiff: '差的一半 a = {a} 不小于钉距的一半 c = {c}：三角形两边之差小于第三边，所以这样的点只能挤在 x 轴上钉子外侧（a = c 时）或根本不存在（a > c 时）。双曲线要求 a < c。',
    s2hint: '观察顺序：先按「自动画一遍」，看笔迹一点点累积成椭圆，读数里的和始终等于 2a。再只拖 c（保持 a 不变）：钉子越分越开，椭圆越来越扁，e 变大；c 拉到 a 以上时绳子不够长，画不出来。切到「距离之差」，按「自动画一遍」：笔先描右边一支，再描左边一支，读数里差的绝对值始终是 2a；双曲线要求 c > a。拖 a、c 或换模式会清掉笔迹。',

    s3k: '第 3 步 · 一个数 e',
    s3t: '能不能用一个数，把圆、椭圆、抛物线、双曲线排成一条线？',
    s3e: '这一步要回答：四种曲线能不能用同一条规则画出来，只差一个数？取一个定点 F（<strong>焦点</strong>）和一条定直线（<strong>准线</strong>）。对平面上任一点 P，量出它到焦点的距离 PF 和到准线的距离 PD（垂直量过去）。把所有满足 <strong>PF = e · PD</strong> 的点连起来：e < 1 得到椭圆，e = 1 得到抛物线，e > 1 得到双曲线的两支。这个 e 就是<strong>离心率</strong>，和第 0 步的 sin β ÷ sin 60°、第 2 步的 c/a 是同一个数（对圆锥截出的曲线可以证明，这里不展开）。为了让各条曲线大小可比，我们固定一个尺寸：从 F 垂直向上量到曲线的距离始终是 1.5；于是准线在 F 左边 1.5 ÷ e 处，e 越小准线越远，e → 0 时准线退到无穷远，曲线变成以 F 为圆心的圆。',
    lgF: '焦点 F 与 PF', lgDir: '紫色虚线 = 准线', lgCurE: '当前 e 的曲线', lgSeenE: '淡色 = 之前的 e（抛物线 e = 1 为橙色）', lgPD: 'PD（P 到准线的垂直距离）',
    eSlider: '离心率 e', thSlider: '点 P 的方向（从 F 看过去的角度）',
    sweepE: '把 e 从 0.2 扫到 2.0', clearGhosts: '清除淡色曲线',
    c3: '焦点与准线：PF = e · PD',
    s3kind: 'e = {e}：{kind}；准线在 F 左边 {d} 处。',
    s3readout: '这一点 PF = {pf}，PD = {pd}，PF ÷ PD = {ratio}{branch}。',
    s3circle: 'e = 0 时准线在无穷远，曲线是以 F 为圆心、半径 {pf} 的圆。',
    s3inf: '沿这个方向，P 跑到了无穷远（这是曲线张开的方向），换一个角度看。',
    farBranch: '（P 在准线另一侧的那一支上，同样满足这个比例）',
    s3hint: '观察顺序：先按「把 e 从 0.2 扫到 2.0」，看淡色曲线一层层留下来：小 e 是接近圆的椭圆，越往 1 越扁长，e = 1（橙色）一头张开成抛物线，再大就是两支的双曲线。然后固定一个 e，拖点 P 的方向：PF 和 PD 一起变，比值却一直等于 e。e > 1 时把方向转到 0° 附近，P 会跳到准线另一侧的那一支。',

    s4k: '第 4 步 · 反射聚焦',
    s4t: '为什么叫「焦点」？抛物面和椭圆面怎样把光汇到一点？',
    s4e: '这一步要回答：「焦点」这个名字从哪来？把曲线做成镜子，光碰到镜面时按<strong>反射定律</strong>弹开：入射光和反射光与镜面法线（垂直于镜面的线）的夹角相等（<a class="xlink" href="../../../physics/optics/reflection-refraction/#step0">→ 反射与折射页第 0 步：入射角等于反射角</a>）。抛物线镜：竖直落下的平行光，反射后都穿过焦点。椭圆镜：从一个焦点射出的光，反射后都穿过另一个焦点。这里的反射方向是按镜面在每个落点的法线逐条算出来的，不是画上去的。按「发射」，每条光线上放一个光脉冲，以同样的速度前进：因为每条路程一样长，它们会同时到达焦点。',
    lgMirror: '镜面', lgIn: '入射光', lgOut: '反射光', lgFoci: '焦点', lgPulse: '白点 = 同速前进的光脉冲',
    mirPar: '抛物线镜（平行光）', mirEll: '椭圆镜（从一个焦点出发）', raySlider: '光线条数', fire: '发射光脉冲',
    c4par: '抛物线镜 y = x²/4，焦点 (0, 1)', c4ell: '椭圆镜 x²/9 + y²/4 = 1，焦点 (±√5, 0)',
    s4progress: '光脉冲已走 {p}%。',
    s4readPar: '{n} 条竖直落下的光线：反射线离焦点最远 {miss}（即全部穿过焦点）。从紫色虚线落到镜面再到焦点的路程：最短 {lo}，最长 {hi}，都等于 {Y0} + {f}。',
    s4readEll: '从 F₁ 射出的 {n} 条光线：反射线离 F₂ 最远 {miss}（即全部穿过 F₂）。F₁ → 镜面 → F₂ 的路程：最短 {lo}，最长 {hi}，都等于 2a = {a2}。',
    s4hint: '观察顺序：先在抛物线镜下按「发射光脉冲」，看白点一起落下、在镜面上各自拐弯、同时挤进焦点。再加多光线条数，读数里「离焦点最远」仍是 0、路程最短和最长仍相同。切到椭圆镜重复一遍：从左焦点向四面八方出发的光，同时汇到右焦点。常见用途：卫星天线和手电筒的反光碗用的是抛物面（光路反过来，焦点处的光源射出平行光）。本步是理想的二维镜面，不考虑镜面粗糙和光的衍射。',

    s5k: '第 5 步 · 收束',
    s5t: '一个圆锥，一把刀，一个数',
    s5fin: '回顾一下。<strong>第 0 步</strong>：平面比圆锥侧面平，切口闭合（圆、椭圆）；和侧面平行，得到抛物线；比侧面陡，同时切到两个圆锥，得到双曲线。<strong>第 1 步</strong>：两个贴住圆锥和平面的球给出两个焦点，切线等长让 PF₁ + PF₂ 变成一段固定的母线长。<strong>第 2 步</strong>：两颗钉子和一根绳直接画出椭圆，换成距离之差就是双曲线，方程 x²/a² ± y²/b² = 1。<strong>第 3 步</strong>：PF = e · PD 用一个离心率 e 把四种曲线排成一条线。<strong>第 4 步</strong>：焦点名副其实——抛物线把平行光汇到焦点，椭圆把一个焦点的光汇到另一个焦点，而且每条路程一样长。',
    formula: '圆锥上：e = sin β ÷ sin(侧面倾角)\n椭圆：PF₁ + PF₂ = 2a，x²/a² + y²/b² = 1，b² = a² − c²\n双曲线：|PF₁ − PF₂| = 2a，x²/a² − y²/b² = 1，b² = c² − a²\n统一：PF = e · PD，e = c/a',
    boundary: '适用范围：平面不过圆锥尖（过尖会切出一个点、一条直线或两条相交直线，叫退化情形）；本页圆锥的半顶角固定为 30°。第 1 步只演示椭圆；双曲线的丹德林证明类似，得到距离之差。第 3 步中「e 与圆锥上的 sin β ÷ sin 60° 相同」本页只陈述、未证明。第 4 步是理想二维镜面；真实反光碗做成旋转抛物面，原理相同。',
    linksTitle: '接着去哪儿',
    lk1: '→ 抛物线 第 1 步：从 y = ax² 认识抛物线的开口和胖瘦',
    lk2: '→ 引力与轨道 第 2 步：行星的椭圆轨道为什么在两个半径之间来回',
    lk3: '→ 反射与折射 第 0 步：入射角等于反射角，本页反射聚焦的基础',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《圆锥曲线》的平行版本。'
  },
  en: {
    pageTitle: 'Conic Sections · Four Curves from One Cut',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Conic Sections →',
    navLabel: 'Conic sections steps',
    tagline: 'Take a cone like an ice-cream cone and slice it with a flat board: cut it flat, at a slant, or upright, and the cut is a circle, an ellipse, a parabola or a hyperbola. Why are they one family? And why does the ellipse you cut have exactly two “foci”? In six steps you go from the cone to a pencil-and-string construction, to a single number e, and finally to why a focus gathers light into one point.',
    nav0: '0 One cut', nav1: '1 Two spheres', nav2: '2 Pins & string', nav3: '3 One number e', nav4: '4 Focusing light', nav5: '5 Wrap-up',
    k_circle: 'a circle', k_ellipse: 'an ellipse', k_parabola: 'a parabola', k_hyperbola: 'a hyperbola',
    tilt: 'Plane tilt β (angle from horizontal)',

    s0k: 'Step 0 · One cut',
    s0t: 'How steep must the plane get before the closed loop opens up?',
    s0e: 'The question here: what decides the shape of the cut? Our cone is a <strong>double cone</strong>: two cones joined tip to tip, with a vertical line through the middle called the <strong>axis</strong>. Its sides make 60° with the horizontal (so 30° with the axis). A flat board passes through a fixed point on the axis and pivots about it; the angle between the board and the horizontal is the <strong>tilt β</strong>. The left view (on top on narrow screens) looks at everything from the side: the grey shape is the cone, the purple dashes are the edge of the board, and the orange piece is the part of the board inside the cone. The right view (below on narrow screens) turns the board to face you and draws the cut at its true shape (the purple line is the same purple edge). A <strong>parabola</strong> is the open curve you know as the graph of y = ax² (<a class="xlink" href="../../../math/algebra/parabola/#step1">→ Parabola, step 1: how a in y = ax² sets the direction and width</a>); a <strong>hyperbola</strong> has two branches, one on each cone.',
    lgCone: 'Double cone (side view)', lgPlane: 'Purple dashes = cutting plane', lgCutAxis: 'Orange = the plane’s piece inside the cone', lgCurve: 'Cyan = the cut seen face-on', lgEarlier: 'Faint = tilts tried earlier',
    sweepTilt: 'Sweep from flat to upright',
    c0a: 'Side view: cone and plane', c0b: 'Face-on: the true shape of the cut',
    cmpLess: 'The tilt {b}° is shallower than the side’s {s}°: the plane passes through one cone only and the cut closes into a loop.',
    cmpEq: 'The tilt equals the side’s {s}°: the plane runs parallel to one side, so one end of the cut never closes.',
    cmpMore: 'The tilt {b}° is steeper than the side’s {s}°: the plane cuts both cones and the curve splits into two branches.',
    shapeEll: 'Semi-major axis a = {a}, semi-minor axis b = {b} (in grid units; the plane crosses the axis 1.5 above the tip).',
    shapeHyp: 'One branch on each cone, both running off to infinity.',
    shapePar: 'A single branch running off to infinity in one direction.',
    s0readout: '{cmp} The cut is {kind}. Eccentricity e = sin β ÷ sin 60° = {e}. {shape}',
    s0hint: 'What to try: press “Sweep from flat to upright” and watch the faint traces in the face-on view: β = 0 gives a circle; as β grows the circle stretches into an ellipse; at β = 60° one end opens into a parabola; beyond that the curve splits into the two branches of a hyperbola. Then drag β yourself and keep your eye on the orange piece in the side view: below 60° both of its ends meet the cone; at exactly 60° one end runs parallel to the side and never meets it. The readout’s e is below 1, equal to 1 or above 1 in exactly these three cases (what e means geometrically comes in step 3). The board never passes through the tip; a cut through the tip gives a point or lines, which this page leaves out.',

    s1k: 'Step 1 · Two spheres',
    s1t: 'Why is an ellipse cut from a cone the same total distance from two fixed points everywhere?',
    s1e: 'The question here: is the ellipse cut in step 0 the same curve as the ellipse defined by “constant sum of distances to two points”? In 1822 Germinal Dandelin gave a beautiful proof. Drop two spheres into the cone, one below the plane and one above, and inflate each until it just touches the cone’s side (along a circle) and the plane (at a single point). Those two touching points F₁ and F₂ are the ellipse’s <strong>foci</strong>. The proof needs one fact: <strong>all tangent segments from an outside point to a sphere have the same length</strong>. Take any point P on the ellipse. PF₁ is a tangent from P to the small sphere; so is the stretch of the cone’s <strong>generator</strong> (a straight line on the side through the tip) running from P to the small sphere’s contact circle — so the two are equal. Likewise for the big sphere. Therefore PF₁ + PF₂ equals the length of generator between the two contact circles, which does not depend on where P is. Left (top on narrow screens): side view (pink small sphere, green big sphere, dashed contact circles, thick white generator piece between them). Right (below on narrow screens): the ellipse seen face-on.',
    lgS1: 'Small sphere and focus F₁', lgS2: 'Big sphere and focus F₂', lgGen: 'White = generator piece between the contact circles', lgP: 'White dot = point P on the ellipse', lgPF1: 'PF₁', lgPF2: 'PF₂', lgBar: 'Bottom bars: PF₁ + PF₂ vs the white generator piece (same scale)',
    pPos: 'Position of P on the ellipse (angle round the centre)', walkP: 'Walk P once round the ellipse',
    c1a: 'Side view: two spheres touch cone and plane', c1b: 'Face-on: P and the two foci',
    circleNote: 'At β = 0 the two foci coincide at the centre and the cut is a circle.',
    ellNote: 'Drag P: one piece grows as the other shrinks, and the sum stays put.',
    s1readout: 'PF₁ = {d1}, PF₂ = {d2}, sum = {sum}. Generator piece L = {L}; major axis 2a = {a2}. Along the generator from P to the two contact circles: {c1} and {c2} (equal to PF₁ and PF₂). {note}',
    s1hint: 'What to try: press “Walk P once round the ellipse” and watch the two-colour bar under the ellipse: pink and green keep trading length, but together they always match the white bar below. Then drag the tilt β: both spheres grow or shrink, the foci move and the white generator piece changes length — yet for any one β, the sum always equals it. This step shows ellipses only (β from 0° to 40°); for a hyperbola the two spheres sit in opposite cones and the difference of distances is what stays fixed.',

    s2k: 'Step 2 · Pins and string',
    s2t: 'Without a cone, how do you draw an ellipse or a hyperbola straight onto paper?',
    s2e: 'The question here: can “constant sum of distances to two points” be used directly as a drawing method? Push two pins F₁ and F₂ into the paper, 2c apart; tie a string of length 2a to both pins, pull it taut with a pencil and go round: the pencil traces an ellipse, because its tip P always satisfies PF₁ + PF₂ = 2a. Swap “sum” for “difference”, |PF₁ − PF₂| = 2a, and you get the two branches of a hyperbola. To write equations, put the pins on the x-axis at (−c, 0) and (c, 0) with the origin halfway: the ellipse is x²/a² + y²/b² = 1 with b² = a² − c²; the hyperbola is x²/a² − y²/b² = 1 with b² = c² − a². The <strong>eccentricity</strong> is e = c/a: the further apart the pins (the closer c gets to a), the flatter the ellipse. Planets orbit the Sun on ellipses with the Sun at one focus (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step2">→ Gravity & orbits, step 2: why an orbit swings between two distances</a>).',
    lgF1: 'Pin F₁ and PF₁', lgF2: 'Pin F₂ and PF₂', lgPencil: 'White dot = pencil tip P', lgTrail: 'Points the pencil has drawn',
    modeSum: 'Sum of distances = 2a (ellipse)', modeDiff: 'Difference of distances = 2a (hyperbola)',
    aSlider: 'a (half the string, or half the difference)', cSlider: 'c (half the pin spacing)', pencilSlider: 'How far the pencil has gone along the curve',
    drawLoop: 'Draw it once', clearTrail: 'Clear the trace',
    c2sum: 'Pins and string: PF₁ + PF₂ = 2a', c2diff: 'Use the difference: |PF₁ − PF₂| = 2a',
    s2progress: 'Traced {c}/{N} points. ',
    s2readSum: 'PF₁ = {d1}, PF₂ = {d2}, sum = {s} (string 2a = {a2}). b = {b}, e = c/a = {e}. Equation: {eq}',
    s2readDiff: 'PF₁ = {d1}, PF₂ = {d2}, absolute difference = {s} (2a = {a2}). b = {b}, e = c/a = {e}. Equation: {eq}',
    eqEll: 'x²/{a2} + y²/{b2} = 1', eqHyp: 'x²/{a2} − y²/{b2} = 1',
    s2badSum: 'Half the string, a = {a}, is not longer than half the pin spacing, c = {c}: the string is used up just reaching from pin to pin and cannot go round. An ellipse needs a > c.',
    s2badDiff: 'Half the difference, a = {a}, is not smaller than half the pin spacing, c = {c}: two sides of a triangle differ by less than the third, so such points can only sit on the x-axis outside the pins (when a = c) or do not exist at all (when a > c). A hyperbola needs a < c.',
    s2hint: 'What to try: press “Draw it once” and watch the trace build up into an ellipse while the readout’s sum stays at 2a. Then drag only c (keep a fixed): as the pins move apart the ellipse flattens and e grows; push c past a and the string is too short to draw anything. Switch to “Difference” and press “Draw it once”: the pencil traces the right branch, then the left, and the absolute difference stays at 2a; a hyperbola needs c > a. Moving a or c, or switching mode, clears the trace.',

    s3k: 'Step 3 · One number e',
    s3t: 'Can one number line up the circle, ellipse, parabola and hyperbola?',
    s3e: 'The question here: can all four curves come from the same rule, differing only in one number? Pick a fixed point F (the <strong>focus</strong>) and a fixed line (the <strong>directrix</strong>). For any point P in the plane, measure its distance PF to the focus and its distance PD to the directrix (straight across, at right angles). Join every point with <strong>PF = e · PD</strong>: e < 1 gives an ellipse, e = 1 a parabola, e > 1 the two branches of a hyperbola. This e is the <strong>eccentricity</strong> — the same number as step 0’s sin β ÷ sin 60° and step 2’s c/a (for curves cut from a cone this can be proved; we do not go through it here). To keep the curves comparable in size we fix one measurement: the distance from F straight up to the curve is always 1.5. The directrix then sits 1.5 ÷ e to the left of F; the smaller e, the further away it is, and as e → 0 it retreats to infinity and the curve becomes a circle centred on F.',
    lgF: 'Focus F and PF', lgDir: 'Purple dashes = directrix', lgCurE: 'Curve for the current e', lgSeenE: 'Faint = earlier values of e (the parabola, e = 1, in orange)', lgPD: 'PD (P’s perpendicular distance to the directrix)',
    eSlider: 'Eccentricity e', thSlider: 'Direction of P (angle seen from F)',
    sweepE: 'Sweep e from 0.2 to 2.0', clearGhosts: 'Clear the faint curves',
    c3: 'Focus and directrix: PF = e · PD',
    s3kind: 'e = {e}: {kind}; the directrix is {d} to the left of F. ',
    s3readout: 'At this point PF = {pf}, PD = {pd}, PF ÷ PD = {ratio}{branch}.',
    s3circle: 'At e = 0 the directrix is at infinity and the curve is the circle of radius {pf} centred on F.',
    s3inf: 'In this direction P runs off to infinity (this is where the curve opens up); try another angle.',
    farBranch: ' (P is on the branch beyond the directrix, which keeps the same ratio)',
    s3hint: 'What to try: press “Sweep e from 0.2 to 2.0” and watch the faint curves pile up: small e gives a nearly round ellipse, which stretches as e approaches 1; at e = 1 (orange) one end opens into a parabola; beyond that you get a two-branch hyperbola. Then hold one e and drag the direction of P: PF and PD change together, but their ratio stays at e. With e > 1, turn the direction to around 0° and P jumps to the branch beyond the directrix.',

    s4k: 'Step 4 · Focusing light',
    s4t: 'Why “focus”? How do parabolic and elliptical mirrors gather light at a point?',
    s4e: 'The question here: where does the name “focus” come from? Make the curve into a mirror. Light bounces off it by the <strong>law of reflection</strong>: the incoming and outgoing rays make equal angles with the normal, the line at right angles to the mirror (<a class="xlink" href="../../../physics/optics/reflection-refraction/#step0">→ Reflection & refraction, step 0: the angle in equals the angle out</a>). A parabolic mirror sends rays that fall straight down, parallel to each other, through the focus. An elliptical mirror sends every ray leaving one focus through the other. Each reflected direction here is computed from the mirror’s normal at its landing point, not drawn by hand. Press “Fire” and each ray carries a pulse moving at the same speed: since every path has the same length, the pulses reach the focus together.',
    lgMirror: 'Mirror', lgIn: 'Incoming light', lgOut: 'Reflected light', lgFoci: 'Foci', lgPulse: 'White dots = pulses moving at equal speed',
    mirPar: 'Parabolic mirror (parallel light)', mirEll: 'Elliptical mirror (from one focus)', raySlider: 'Number of rays', fire: 'Fire light pulses',
    c4par: 'Parabolic mirror y = x²/4, focus (0, 1)', c4ell: 'Elliptical mirror x²/9 + y²/4 = 1, foci (±√5, 0)',
    s4progress: 'Pulses {p}% of the way. ',
    s4readPar: '{n} rays falling straight down: the reflected rays miss the focus by at most {miss} (they all pass through it). Path from the purple dashes to the mirror to the focus: shortest {lo}, longest {hi}, both equal to {Y0} + {f}.',
    s4readEll: '{n} rays leaving F₁: the reflected rays miss F₂ by at most {miss} (they all pass through it). Path F₁ → mirror → F₂: shortest {lo}, longest {hi}, both equal to 2a = {a2}.',
    s4hint: 'What to try: with the parabolic mirror, press “Fire light pulses” — the white dots fall together, each turns at the mirror, and they squeeze into the focus at the same moment. Add more rays: the readout still says they miss the focus by 0 and the shortest and longest paths still match. Switch to the elliptical mirror and do it again: light leaving the left focus in every direction arrives at the right focus all at once. Everyday uses: satellite dishes and torch reflectors are parabolic (run the light backwards and a source at the focus sends out a parallel beam). This step uses ideal two-dimensional mirrors, ignoring rough surfaces and diffraction.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'One cone, one cut, one number',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: a plane shallower than the cone’s side gives a closed cut (circle, ellipse); parallel to the side gives a parabola; steeper than the side cuts both cones and gives a hyperbola. <strong>Step 1</strong>: two spheres touching the cone and the plane provide the two foci, and equal tangents turn PF₁ + PF₂ into a fixed length of generator. <strong>Step 2</strong>: two pins and a string draw an ellipse directly; use the difference and you get a hyperbola, with equations x²/a² ± y²/b² = 1. <strong>Step 3</strong>: PF = e · PD lines all four curves up along a single eccentricity e. <strong>Step 4</strong>: the focus earns its name — a parabola gathers parallel light at its focus, an ellipse sends light from one focus to the other, and every path has the same length.',
    formula: 'On the cone: e = sin β ÷ sin(side angle)\nEllipse: PF₁ + PF₂ = 2a, x²/a² + y²/b² = 1, b² = a² − c²\nHyperbola: |PF₁ − PF₂| = 2a, x²/a² − y²/b² = 1, b² = c² − a²\nAll of them: PF = e · PD, e = c/a',
    boundary: 'Scope: the plane never passes through the cone’s tip (a cut through the tip gives a point, a line or two crossing lines — the degenerate cases); the cone’s half-angle is fixed at 30° throughout. Step 1 shows ellipses only; Dandelin’s argument for the hyperbola is similar and fixes the difference of distances. In step 3, “e equals sin β ÷ sin 60° on the cone” is stated, not proved. Step 4 uses ideal two-dimensional mirrors; real reflectors are paraboloids of revolution and work on the same principle.',
    linksTitle: 'Where to go next',
    lk1: '→ Parabola, step 1: meet the parabola through y = ax², its direction and width',
    lk2: '→ Gravity & orbits, step 2: why a planet’s elliptical orbit swings between two distances',
    lk3: '→ Reflection & refraction, step 0: angle in equals angle out, the basis of focusing',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Conic Sections”.'
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
  if (typeof window.refreshConic === 'function') window.refreshConic();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CONIC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
