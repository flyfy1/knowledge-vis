'use strict';
// Materials science lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '材料科学 · 从一条拉伸曲线读出强度、塑性与韧性',
    back: '← 知识索引',
    compare: '对照另一版本：材料科学 · 应力如何变成断裂 →',
    navLabel: '材料科学步骤导航',
    tagline: '把一根金属棒夹在试验机上慢慢拉，记下拉力和伸长，直到它断开。这条记录里藏着设计零件所需的几乎全部数字：多难拉长、从哪里开始永久变形、最多扛多大力、断前吸收多少能量。七步里你会从同一次拉伸里逐个读出它们，再看一道裂纹怎样改写「强」的含义。',
    nav0: '0 消掉尺寸', nav1: '1 弹性与塑性', nav2: '2 颈缩', nav3: '3 韧性', nav4: '4 选材', nav5: '5 裂纹', nav6: '6 收束',
    matSteel: '低碳钢', matAl: '铝合金 6061-T6', matCu: '退火纯铜', matCeramic: '氧化铝陶瓷',
    shSteel: '低碳钢', shAl: '铝合金', shCu: '退火铜', shCeramic: '氧化铝',
    matGroup: '选择材料',
    clearTrail: '清除轨迹',

    s0k: '第 0 步 · 先把尺寸消掉',
    s0t: '粗棒比细棒扛得住更大的力——那「材料本身有多强」该怎么比？',
    s0e: '这一步要回答：拉伸试验记下的是拉力 F 和伸长量 ΔL，两者都跟试样尺寸有关，怎样换成只跟材料有关的量？做两次除法。<strong>工程应力</strong> σ = F / A₀：拉力除以原始横截面积，单位 MPa，即每平方毫米上多少牛顿（和<a class="xlink" href="../../../physics/matter/pressure/#step0">压强页第 0 步讲的「每单位面积上的力」</a>是同一个量纲）。<strong>工程应变</strong> ε = ΔL / L₀：伸长量除以原始<strong>标距</strong>（棒上两条标记线之间的长度），没有单位，常写成 %。这里的试样都是同一种低碳钢，只改直径 d 和标距 L₀。上图画拉力对伸长，每换一次尺寸留下一条曲线；下图把同样的数据除完以后画成应力对应变。',
    s0lgNow: '当前试样', s0lgOld: '之前试过的尺寸', s0lgBreak: '× 断裂点', s0lgNeck: '竖虚线：开始颈缩的应变',
    dSlider: '直径 d（mm）', LSlider: '标距 L₀（mm）',
    stdBar: '换成标准比例试样（L₀ = 5.65√A₀）',
    c0top: '拉力 F（kN）— 伸长 ΔL（mm）',
    c0bot: '工程应力 σ（MPa）— 工程应变 ε（%）',
    s0readout: 'd = {d} mm，A₀ = {A} mm²，L₀ = {L} mm：最大拉力 {F} kN，断时伸长 {dL} mm。除以尺寸以后：最大应力 {uts} MPa（与尺寸无关），断后伸长率 {ef}%（{std}）。',
    stdYes: '这正是标准比例试样',
    stdNo: '非标准试样：L₀ / √A₀ = {r}，标准值是 5.65',
    s0hint: '观察顺序：先只拖「直径」，上图的曲线一条比一条高，下图的曲线在竖虚线（开始颈缩）以前完全叠成一条；再只拖「标距」，上图的曲线横向拉长，下图仍然重合到竖虚线。分叉只发生在虚线以后：颈缩集中在棒上很短的一段，这段多出来的伸长量跟直径有关、跟标距无关，所以标距越短，同样的颈缩折算出的应变越大。因此断后伸长率必须注明试样规格，标准做法是取 L₀ = 5.65√A₀。',

    s1k: '第 1 步 · 弹回去，还是回不去',
    s1t: '拉到多大应变以后，松手它就回不到原长了？',
    s1e: '这一步要回答：从哪一点起变形变成永久的？做法是先拉到某个应变 ε，再把力卸掉。卸载时材料沿一条与开头直线平行的直线退回（白线），落到横轴上的那一点就是<strong>永久应变</strong>：卸力后留下的伸长，按标距 L₀ 折算。曲线开头那段直线叫<strong>弹性段</strong>：应力与应变成正比，σ = Eε，比例系数 E 叫<strong>弹性模量</strong>（直线的斜率，越大越难拉长），从这里卸载不留永久应变。离开直线以后是<strong>塑性段</strong>：金属里的原子层互相滑移，卸载后留下永久应变。真实曲线离开直线时往往很圆滑，找不到确切的起点，所以工程上约定：画一条斜率同为 E、从 ε = 0.2% 出发的橙色虚线，它与曲线的交点叫<strong>屈服强度 R<sub>p0.2</sub></strong>，意思是「卸载后恰好留下 0.2% 永久应变时的应力」。横轴只放大了前 2%。',
    s1lgCurve: '拉伸曲线', s1lgUnload: '卸载路径', s1lgOffset: '0.2% 平移线', s1lgTrail: '试过的加载点',
    e1Slider: '卸载前拉到的应变 ε（%）',
    sweep1: '从 0 拉到 2%',
    c1top: '应力 σ（MPa）— 应变 ε（%），只看前 2%',
    c1bot: '卸载后的永久应变（%）— 卸载前的应变（%）',
    s1readout: '{mat}：拉到 ε = {e}% 时应力 {s} MPa；卸载后弹回 {back}%，留下永久应变 {perm}%。弹性模量 E = {E} GPa，比例极限（开始离开直线）{sp} MPa，屈服强度 Rp0.2 = {rp} MPa。{state}',
    s1elastic: '目前仍在弹性段：卸载后完全回到原长。',
    s1plastic: '已进入塑性段：一部分伸长再也回不来了。',
    s1brittle: '{mat}：拉到 ε = {e}% 时应力 {s} MPa，卸载后完全回到原长。E = {E} GPa。它会在 ε = {ef}%、σ = {sf} MPa 处直接断开，之前没有塑性段，也就没有 Rp0.2。',
    s1broken: '{mat}：已在 ε = {ef}%、σ = {sf} MPa 处断成两截——陶瓷没有塑性段，从弹性直接到断裂。',
    s1hint: '观察顺序：选低碳钢，按「从 0 拉到 2%」或慢慢拖滑杆，盯住下图的白点：起初一直贴在 0 上，过了某一点以后沿斜线上升——这个拐点就是弹性与塑性的分界。再换铝合金和铜比较：铜最早离开直线（比例极限最低），铝合金的直线最缓（E 最小，同样的应力伸长最多）。最后试试陶瓷。',

    s2k: '第 2 步 · 最高点之后',
    s2t: '拉力过了最高点就开始下降——是材料变弱了吗？',
    s2e: '这一步要回答：工程应力曲线为什么有一个最高点？这个最高点叫<strong>抗拉强度</strong>，即试样能承受的最大拉力除以 A₀。关键在于工程应力始终用<em>原始</em>面积 A₀ 去除。棒被拉长时体积几乎不变，截面随之变细；当前每平方毫米上真正承受的力叫<strong>真应力</strong> σ<sub>t</sub> = F / A（A 是当前面积；均匀变细时 σ<sub>t</sub> = σ(1 + ε)）。金属越拉越难拉，这叫<strong>加工硬化</strong>；绿色曲线是<strong>硬化速率</strong> dσ<sub>t</sub>/dε<sub>t</sub>，即真应变每增加一点，真应力涨多少（真应变 ε<sub>t</sub> = ln(1 + ε)，按当前长度一点点累加的应变）。拉力 F = σ<sub>t</sub>·A 受两件事左右：硬化让 σ<sub>t</sub> 上升，变细让 A 下降。只要硬化速率还高于真应力本身，前者占上风，F 继续上升；两条线相交时（<strong>Considère 判据</strong> dσ<sub>t</sub>/dε<sub>t</sub> = σ<sub>t</sub>）F 到顶。此后哪一处稍细一点，那里就越拉越细，变形全部集中过去，这就是<strong>颈缩</strong>。所以下降的是整根棒能承受的拉力，不是材料每平方毫米的强度。',
    s2lgEng: '工程应力 σ = F/A₀', s2lgTrue: '真应力 σt（虚线段：假如仍均匀变细的外推）', s2lgRate: '硬化速率 dσt/dεt', s2lgCross: '两线相交 = 拉力最高点',
    e2Slider: '当前应变 ε（%）',
    sweep2: '从 0 拉到断',
    c2spec: '试样（灰框为原长；颈缩形状为示意）',
    c2plot: '应力（MPa）— 工程应变 ε（%）',
    s2elastic: '{mat}，ε = {e}%：仍在弹性段，应力 {s} MPa。这里的「硬化速率」就是 E = {E} GPa，远高于真应力，所以图上不画。',
    s2uniform: '{mat}，ε = {e}%：工程应力 {s} MPa，真应力 {st} MPa，硬化速率 {th} MPa。硬化速率仍高于真应力，拉力还在上升；再拉 {gap}% 应变到达最高点。',
    s2necked: '{mat}，ε = {e}%：工程应力 {s} MPa，已过最高点。两线在 ε = {eu}% 相交，工程曲线的最高点也在 ε = {eu}%（{uts} MPa）。此后变形集中在颈部，均匀变细时的 σt = σ(1 + ε) 不再成立。',
    s2broken: '{mat}：已在 ε = {ef}% 断裂。拉力最高点在 ε = {eu}%（{uts} MPa），与两线的交点是同一个应变。',
    s2ceramic: '{mat}：在 ε = {ef}% 就断了。没有塑性段，就没有加工硬化，也来不及颈缩——它的曲线在这张图上只是贴着纵轴的一小截。',
    s2hint: '观察顺序：选低碳钢，按「从 0 拉到断」。先看上方试样：最高点以前整段均匀变细；越过竖直虚线以后，变细集中到中间一处。再看下图：绿色线从高处落下，与橙色线相交的那一应变，正好是青色曲线的最高点。换成铝合金，交点提前到约 8%；换成铜，推迟到约 38%——硬化持续得越久，颈缩来得越晚。',

    s3k: '第 3 步 · 断之前吸收多少能量',
    s3t: '同样是「强」，为什么有的材料一敲就碎，有的能弯能拉？',
    s3e: '这一步要回答：把试样拉断，每立方米材料要吃进多少能量？拉力做的功是 F × ΔL 一小段一小段的累加；除以体积 A₀L₀ 以后，正好是应力–应变曲线下的<strong>面积</strong>（<a class="xlink" href="../../../math/calculus/integral/#step2">定积分页第 2 步：积分就是把细条面积累加起来</a>），单位 MPa × 1 = MJ/m³。拉到断为止的总面积叫<strong>韧性</strong>：这里指单位体积的断裂功，越大，断之前越能吸收冲击。面积分两部分：卸载时能还回来的那块三角形（白色），是材料像弹簧一样储存的<strong>弹性能</strong>；其余部分变成热和永久变形，拿不回来（彩色）。下方横条记录你拉断过的每种材料的韧性。',
    s3lgLost: '拿不回来的功（热 + 永久变形）', s3lgBack: '卸载能还回来的弹性能', s3lgBar: '横条：已拉断材料的韧性',
    e3Slider: '当前应变 ε（%）',
    sweep3: '拉到断裂', clearBars: '清空横条',
    c3top: '应力 σ（MPa）— 应变 ε（%），面积 = 每立方米吸收的能量',
    c3bot: '韧性：拉断每立方米所需的功（MJ/m³）',
    barPending: '未拉断',
    s3readout: '{mat}，ε = {e}%：到此为止每立方米吸收 {U} MJ，其中卸载能还回来 {R} MJ（{pct}%）。拉到断的总韧性是 {T} MJ/m³；而弹性段末端最多只能储存 {res} MJ/m³。',
    s3broken: '{mat}：已在 ε = {ef}% 断裂，每立方米共吸收 {T} MJ，已记入下方横条。其中弹性段末端最多只能储存 {res} MJ/m³。',
    s3hint: '观察顺序：按「拉到断裂」，看彩色面积越积越大，白色三角却很快变得微不足道：金属拉过 5% 以后，它已不到总面积的 6%——绝大部分功都留在了材料里。依次拉断四种材料，比较下方横条：低碳钢约 115、退火铜约 99、铝合金约 41 MJ/m³，氧化铝陶瓷只有约 0.09 MJ/m³，横条短到几乎看不见。可陶瓷的断裂强度 260 MPa 并不比铝合金的屈服强度低多少——差的是断之前能变形多少。',

    s4k: '第 4 步 · 选材',
    s4t: '一根 1 m 长的拉杆，用哪种材料最好？',
    s4e: '这一步要回答：把前面读出的数字用起来。一根 1 m 长的拉杆要同时满足三个条件，每个条件都给出一个最小截面积 A。<strong>强度</strong>：工作拉力 F 乘以安全系数 2 以后，应力不超过屈服强度 R<sub>p0.2</sub>（陶瓷用断裂强度），A ≥ 2F / R<sub>p0.2</sub>。<strong>刚度</strong>：弹性伸长 ΔL = FL / (EA) 不超过允许值 δ，A ≥ FL / (Eδ)（E 是第 1 步的弹性模量）。<strong>吸能</strong>：万一过载，断之前至少吸收能量 U，A ≥ U / (韧性 × L)，韧性是第 3 步的面积；这是假设整根杆均匀吃能量的乐观上限。三者中最大的那个说了算，叫这根杆的<strong>控制条件</strong>。表格列出每种材料需要的截面、直径和质量。「最好」取决于你要它最轻还是最细，结论会随滑杆改变。',
    F4Slider: '工作拉力 F（kN）', d4Slider: '允许的弹性伸长 δ（mm）', U4Slider: '断前须吸收的能量 U（J）',
    goalMass: '目标：最轻', goalThin: '目标：最细',
    c4mass: '所需质量（kg），越短越好',
    c4thin: '所需直径（mm），越短越好',
    thMat: '材料', thBind: '控制条件', thA: '截面 A（mm²）', thD: '直径（mm）', thM: '质量（kg）',
    bStrength: '强度', bStiffness: '刚度', bEnergy: '吸能',
    goalMassW: '最轻', goalThinW: '最细',
    s4readout: '目标「{goal}」：胜出的是{mat}，直径 {d} mm、质量 {m} kg，由{bind}条件控制。{note}',
    s4noteCeramic: '陶瓷胜出只因为这里对吸能要求很低：它的韧性只有约 0.09 MJ/m³，每多要求吸收 1 J，就要多约 11 mm² 截面。',
    s4hint: '观察顺序：先保持 U = 0，只拖 δ。δ 很小时刚度控制一切，E 最大的陶瓷既最轻又最细；δ 放宽以后改由强度控制，最轻的变成铝合金（屈服强度与钢相近，密度只有钢的约三分之一）。再把 U 从 0 往上拖，看陶瓷那一行的截面怎样暴涨。最后切换到「最细」：同样条件下，最细的往往是钢而不是铝。',

    s5k: '第 5 步 · 裂纹',
    s5t: '同一种材料带上一道裂纹，还能扛多大应力？',
    s5e: '这一步要回答：前面的数字都来自光滑试样，真实零件里却常有小裂纹（焊接缺陷、腐蚀坑、加工划痕）。裂纹尖端附近的应力被放大，放大的程度用<strong>应力强度因子</strong> K = σ√(πa) 衡量（σ 是远处的拉应力，a 是裂纹半长；这里取很宽的板中间一道穿透裂纹）。K 达到材料的<strong>断裂韧度</strong> K<sub>IC</sub>（单位 MPa·√m，衡量材料抵抗裂纹扩展的本事）时，裂纹会失稳扩展，所以带裂纹时的断裂应力是 σ<sub>c</sub> = K<sub>IC</sub> / √(πa)：裂纹越长越低。另一方面，应力达到屈服强度（第 1 步的 R<sub>p0.2</sub>）时零件会先明显塑性变形。两条线哪条低，哪种失效就先发生。它们相交处的裂纹长度 a* = (K<sub>IC</sub> / R<sub>p0.2</sub>)² / π：裂纹短于 a* 时零件先屈服，有变形可以预警；长于 a* 时会在低于屈服的应力下突然断开。两根轴都是对数刻度，每一大格放大 10 倍。',
    a5Slider: '裂纹半长 a（mm，对数刻度）',
    c5title: '失效应力（MPa）— 裂纹半长 a（mm），双对数',
    s5lgSolid: '实线：先发生的失效方式', s5lgDash: '虚线：被另一条线盖过的部分',
    s5readout: 'a = {a} mm 时：{list}。',
    s5item: '{mat} {s} MPa（{mode}，a* = {at} mm）',
    listSep: '；',
    modeYield: '先屈服', modeFracture: '先断裂', modeBrittle: '脆断',
    s5hint: '观察顺序：从 a = 1 mm 起向右拖，看每条实线什么时候从水平段（由屈服强度决定）拐进下降的斜线（由裂纹决定），拐点就是 a*：氧化铝陶瓷约 0.075 mm，肉眼几乎看不见的缺陷就决定了它的强度；铝合金约 3.2 mm，低碳钢约 9 mm，退火铜要到约 165 mm。斜线的斜率都是 −1/2：裂纹长到 100 倍，断裂应力降到 1/10。这里的 KIC 是典型量级示意，真实值随成分、热处理、温度和板厚变化很大。',

    s6k: '第 6 步 · 收束',
    s6t: '一条拉伸曲线读出了什么',
    s6fin: '先用 σ = F/A₀、ε = ΔL/L₀ 把尺寸消掉，曲线就只属于材料（颈缩以前）。直线段的斜率是<strong>弹性模量</strong> E；用 0.2% 平移线读出<strong>屈服强度</strong>；曲线最高点是<strong>抗拉强度</strong>，出现在硬化速率跌到真应力的那一刻；曲线下的面积是<strong>韧性</strong>。设计时这些数字各管一件事，谁「最好」取决于你要的是什么。最后，裂纹把「强」改写成两条线的竞争：短于 a* 先屈服，长于 a* 先断裂。',
    formula: 'σ = F/A₀　ε = ΔL/L₀　σ = Eε（弹性段）\ndσt/dεt = σt（颈缩开始）\n韧性 = ∫σ dε　σc = KIC / √(πa)',
    boundary: '适用范围：单轴、缓慢加载、室温、光滑试样的工程应力–应变。塑性段用 Ludwik 硬化律 σt = σp + K·εpⁿ 拟合到典型数值；颈缩后的下降段是经验曲线，不是力学求解；材料参数是教科书量级的示意值，不能当设计数据。本页没有考虑：加载速率和温度（低温下钢会变脆）、疲劳（反复加载时远低于抗拉强度也会断）、蠕变、各向异性，以及低碳钢常见的屈服平台。',
    linksTitle: '站内相关',
    lk1: '→ 机械能守恒第 4 步：弹簧储存的 ½kx²，就是这里卸载能还回来的那块三角形',
    lk2: '→ 定积分第 2 步：曲线下的面积就是细条之和，韧性就是这样算出来的',
    lk3: '→ 压强第 0 步：同样的力压在更小的面积上——应力和压强是同一个量纲',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《材料科学 · 应力如何变成断裂》的平行版本。'
  },
  en: {
    pageTitle: 'Materials Science · Strength, Ductility and Toughness from One Tensile Curve',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Materials Science · When Stress Becomes Fracture →',
    navLabel: 'Materials science steps',
    tagline: 'Clamp a metal bar in a testing machine, pull it slowly and log force and stretch until it snaps. That one record holds nearly every number you need to design a part: how hard it is to stretch, where it starts to deform for good, the most load it takes, and how much energy it soaks up before breaking. Over seven steps you read them off the same test one by one, then see how a single crack rewrites what “strong” means.',
    nav0: '0 Remove size', nav1: '1 Elastic vs plastic', nav2: '2 Necking', nav3: '3 Toughness', nav4: '4 Choosing', nav5: '5 Cracks', nav6: '6 Wrap-up',
    matSteel: 'Mild steel', matAl: 'Al alloy 6061-T6', matCu: 'Annealed copper', matCeramic: 'Alumina ceramic',
    shSteel: 'Steel', shAl: 'Al alloy', shCu: 'Copper', shCeramic: 'Alumina',
    matGroup: 'Choose a material',
    clearTrail: 'Clear trail',

    s0k: 'Step 0 · Divide out the size',
    s0t: 'A thick bar holds more force than a thin one — so how do you compare the materials themselves?',
    s0e: 'This step answers: a tensile test records the pulling force F and the extension ΔL, and both depend on the size of the specimen. How do you turn them into quantities that belong to the material alone? Divide twice. <strong>Engineering stress</strong> σ = F / A₀ is the force over the original cross-sectional area, in MPa — newtons per square millimetre, the same “force per unit area” as <a class="xlink" href="../../../physics/matter/pressure/#step0">pressure in step 0 of the pressure lesson</a>. <strong>Engineering strain</strong> ε = ΔL / L₀ is the extension over the original <strong>gauge length</strong>, the distance between two marks on the bar; it has no unit and is often quoted in %. Every specimen here is the same mild steel; only the diameter d and the gauge length L₀ change. The top plot shows force against extension and keeps one curve per size you try; the bottom plot shows the same data after dividing, as stress against strain.',
    s0lgNow: 'current specimen', s0lgOld: 'sizes tried earlier', s0lgBreak: '× fracture point', s0lgNeck: 'vertical dashes: strain where necking starts',
    dSlider: 'Diameter d (mm)', LSlider: 'Gauge length L₀ (mm)',
    stdBar: 'Use the standard proportional bar (L₀ = 5.65√A₀)',
    c0top: 'Force F (kN) vs extension ΔL (mm)',
    c0bot: 'Engineering stress σ (MPa) vs engineering strain ε (%)',
    s0readout: 'd = {d} mm, A₀ = {A} mm², L₀ = {L} mm: peak force {F} kN, extension at break {dL} mm. After dividing by the size: peak stress {uts} MPa (the same for every size), elongation at break {ef}% ({std}).',
    stdYes: 'this is the standard proportional bar',
    stdNo: 'not the standard bar: L₀ / √A₀ = {r}, the standard is 5.65',
    s0hint: 'What to watch: drag only the diameter — the top curves climb one above another, while the bottom curves lie exactly on top of each other up to the vertical dashes where necking starts. Then drag only the gauge length — the top curves stretch sideways, the bottom ones still coincide up to the dashes. They part only after that: necking is confined to a short stretch of the bar whose extra extension depends on the diameter, not on the gauge length, so a shorter gauge turns the same neck into a larger strain. That is why an elongation at break has to state the specimen shape; the standard choice is L₀ = 5.65√A₀.',

    s1k: 'Step 1 · Spring back or stay stretched',
    s1t: 'How far can you stretch it and still have it return to its original length?',
    s1e: 'This step answers: from which point does the deformation become permanent? Stretch the bar to some strain ε, then take the force away. On unloading the material retreats along a straight line parallel to the initial one (white), and where that line meets the axis is the <strong>permanent strain</strong>: the stretch left once the force is gone, as a fraction of the gauge length L₀. The straight start of the curve is the <strong>elastic range</strong>: stress is proportional to strain, σ = Eε, and the constant E is the <strong>elastic modulus</strong> — the slope of that line; the bigger it is, the harder the bar is to stretch. Unloading from there leaves nothing behind. Past the line is the <strong>plastic range</strong>: layers of atoms in the metal slip past one another and some stretch stays after unloading. Real curves usually leave the line so gradually that there is no clean starting point, so engineers agree on a convention: draw an orange dashed line with the same slope E starting from ε = 0.2 %. Where it cuts the curve is the <strong>yield strength R<sub>p0.2</sub></strong> — the stress that leaves exactly 0.2 % permanent strain after unloading. The strain axis shows only the first 2 %.',
    s1lgCurve: 'tensile curve', s1lgUnload: 'unloading path', s1lgOffset: '0.2 % offset line', s1lgTrail: 'loads you tried',
    e1Slider: 'Strain reached before unloading ε (%)',
    sweep1: 'Pull from 0 to 2 %',
    c1top: 'Stress σ (MPa) vs strain ε (%), first 2 % only',
    c1bot: 'Permanent strain after unloading (%) vs strain reached (%)',
    s1readout: '{mat}: at ε = {e}% the stress is {s} MPa; unloading recovers {back}% and leaves a permanent strain of {perm}%. Elastic modulus E = {E} GPa, proportional limit (where it leaves the line) {sp} MPa, yield strength Rp0.2 = {rp} MPa. {state}',
    s1elastic: 'Still elastic: it returns all the way to its original length.',
    s1plastic: 'Now plastic: part of the stretch will never come back.',
    s1brittle: '{mat}: at ε = {e}% the stress is {s} MPa and unloading returns it fully. E = {E} GPa. It will break outright at ε = {ef}%, σ = {sf} MPa, with no plastic range before that — so it has no Rp0.2.',
    s1broken: '{mat}: already snapped in two at ε = {ef}%, σ = {sf} MPa — a ceramic has no plastic range and goes straight from elastic to broken.',
    s1hint: 'What to watch: pick mild steel, press “Pull from 0 to 2 %” or drag the slider slowly, and follow the white dots in the lower plot. They sit on zero at first, then past a certain point climb along a slope — that kink is the border between elastic and plastic. Compare aluminium and copper: copper leaves the line first (lowest proportional limit), and the aluminium line is the shallowest (smallest E, so the most stretch for a given stress). Finally try the ceramic.',

    s2k: 'Step 2 · Past the peak',
    s2t: 'After its peak the force starts to fall — has the material got weaker?',
    s2e: 'This step answers: why does the engineering stress curve have a maximum? That maximum is the <strong>tensile strength</strong>, the largest force the bar carries divided by A₀. The catch is that engineering stress always divides by the <em>original</em> area A₀. As the bar stretches its volume stays nearly constant, so its cross-section shrinks; the force actually carried per square millimetre right now is the <strong>true stress</strong> σ<sub>t</sub> = F / A, with A the current area (while the bar thins evenly, σ<sub>t</sub> = σ(1 + ε)). Deforming a metal makes it harder to deform further — <strong>work hardening</strong> — and the green curve is the <strong>hardening rate</strong> dσ<sub>t</sub>/dε<sub>t</sub>: how much the true stress rises per extra bit of true strain (true strain ε<sub>t</sub> = ln(1 + ε) adds up stretch against the current length). The force F = σ<sub>t</sub>·A is pulled two ways: hardening raises σ<sub>t</sub>, thinning lowers A. While the hardening rate is still above the true stress itself, hardening wins and F keeps climbing. Where the two curves cross (<strong>Considère’s criterion</strong>, dσ<sub>t</sub>/dε<sub>t</sub> = σ<sub>t</sub>) F peaks. From then on, whichever spot is slightly thinner keeps getting thinner and all the deformation gathers there: the bar <strong>necks</strong>. What falls is the force the whole bar can carry, not the strength of the material per square millimetre.',
    s2lgEng: 'engineering stress σ = F/A₀', s2lgTrue: 'true stress σt (dashed: extrapolated as if the bar still thinned evenly)', s2lgRate: 'hardening rate dσt/dεt', s2lgCross: 'crossing = peak force',
    e2Slider: 'Current strain ε (%)',
    sweep2: 'Pull from 0 to fracture',
    c2spec: 'Specimen (grey = original length; neck is schematic)',
    c2plot: 'Stress (MPa) vs engineering strain ε (%)',
    s2elastic: '{mat}, ε = {e}%: still elastic, stress {s} MPa. Here the “hardening rate” is just E = {E} GPa, far above the true stress, so it is not drawn.',
    s2uniform: '{mat}, ε = {e}%: engineering stress {s} MPa, true stress {st} MPa, hardening rate {th} MPa. The hardening rate is still above the true stress, so the force is still rising; the peak is another {gap}% of strain away.',
    s2necked: '{mat}, ε = {e}%: engineering stress {s} MPa, past the peak. The two curves crossed at ε = {eu}% and the engineering curve peaked at the same ε = {eu}% ({uts} MPa). Deformation is now concentrated in the neck, so the even-thinning formula σt = σ(1 + ε) no longer holds.',
    s2broken: '{mat}: broke at ε = {ef}%. The peak force came at ε = {eu}% ({uts} MPa) — the same strain where the two curves cross.',
    s2ceramic: '{mat}: breaks at ε = {ef}%. With no plastic range there is no work hardening and no time to neck — on this plot its curve is only a sliver hugging the vertical axis.',
    s2hint: 'What to watch: pick mild steel and press “Pull from 0 to fracture”. Watch the specimen first: before the peak the whole gauge thins evenly; past the vertical dashes the thinning gathers in one spot in the middle. Then the plot: the green curve falls from above, and the strain where it meets the orange curve is exactly where the cyan curve peaks. Switch to aluminium and the crossing comes early, near 8 %; switch to copper and it is delayed to about 38 % — the longer hardening lasts, the later the neck.',

    s3k: 'Step 3 · Energy soaked up before breaking',
    s3t: 'Both can be “strong” — so why does one material shatter at a knock while another bends and stretches?',
    s3e: 'This step answers: how much energy does each cubic metre of material take in before it breaks? The work done by the pulling force is F × ΔL added up slice by slice; divided by the volume A₀L₀ it becomes exactly the <strong>area</strong> under the stress–strain curve (<a class="xlink" href="../../../math/calculus/integral/#step2">step 2 of the definite-integral lesson: an integral adds up thin slices of area</a>), in MPa × 1 = MJ/m³. The whole area up to fracture is the <strong>toughness</strong> — here, work of fracture per unit volume; the larger it is, the more of a blow the material can absorb before breaking. The area has two parts: the triangle you get back on unloading (white) is the <strong>elastic energy</strong> stored as in a spring; the rest turns into heat and permanent deformation and is gone for good (coloured). The bars below keep the toughness of every material you have broken.',
    s3lgLost: 'work not returned (heat + permanent deformation)', s3lgBack: 'elastic energy returned on unloading', s3lgBar: 'bars: toughness of materials you have broken',
    e3Slider: 'Current strain ε (%)',
    sweep3: 'Pull to fracture', clearBars: 'Clear the bars',
    c3top: 'Stress σ (MPa) vs strain ε (%); area = energy per cubic metre',
    c3bot: 'Toughness: work to break one cubic metre (MJ/m³)',
    barPending: 'not broken yet',
    s3readout: '{mat}, ε = {e}%: so far each cubic metre has taken in {U} MJ, of which {R} MJ ({pct}%) would come back on unloading. The toughness up to fracture is {T} MJ/m³, while the most the elastic range can store is {res} MJ/m³.',
    s3broken: '{mat}: broke at ε = {ef}% after taking in {T} MJ per cubic metre, now added to the bars below. Of that, the elastic range could store at most {res} MJ/m³.',
    s3hint: 'What to watch: press “Pull to fracture” and see the coloured area pile up while the white triangle soon becomes negligible: once a metal is past 5 % strain it is under 6 % of the total — nearly all the work stays in the material. Break all four materials and compare the bars: mild steel about 115, annealed copper about 99, the aluminium alloy about 41 MJ/m³, and alumina only about 0.09 MJ/m³ — a bar too short to see. Yet the ceramic’s fracture strength of 260 MPa is not far below the aluminium alloy’s yield strength; what it lacks is the ability to deform before it breaks.',

    s4k: 'Step 4 · Choosing a material',
    s4t: 'A 1 m tie rod: which material is best?',
    s4e: 'This step answers: put the numbers to work. A 1 m tie rod has to meet three requirements at once, and each sets a minimum cross-section A. <strong>Strength</strong>: the working force F times a safety factor of 2 must not push the stress past the yield strength R<sub>p0.2</sub> (the fracture strength for the ceramic), so A ≥ 2F / R<sub>p0.2</sub>. <strong>Stiffness</strong>: the elastic stretch ΔL = FL / (EA) must stay within an allowance δ, so A ≥ FL / (Eδ), with E the elastic modulus from step 1. <strong>Energy</strong>: in an overload it must absorb at least U before breaking, so A ≥ U / (toughness × L), with toughness the area from step 3 — an optimistic upper bound that assumes the whole rod absorbs energy evenly. The largest of the three wins and is called the <strong>governing requirement</strong>. The table lists the area, diameter and mass each material needs. Which one is “best” depends on whether you want it lightest or thinnest, and the answer moves as you drag the sliders.',
    F4Slider: 'Working force F (kN)', d4Slider: 'Allowed elastic stretch δ (mm)', U4Slider: 'Energy to absorb before breaking U (J)',
    goalMass: 'Goal: lightest', goalThin: 'Goal: thinnest',
    c4mass: 'Mass needed (kg) — shorter is better',
    c4thin: 'Diameter needed (mm) — shorter is better',
    thMat: 'Material', thBind: 'Governs', thA: 'Area A (mm²)', thD: 'Diameter (mm)', thM: 'Mass (kg)',
    bStrength: 'strength', bStiffness: 'stiffness', bEnergy: 'energy',
    goalMassW: 'lightest', goalThinW: 'thinnest',
    s4readout: 'Goal “{goal}”: the winner is {mat}, {d} mm across and {m} kg, governed by {bind}. {note}',
    s4noteCeramic: 'The ceramic wins only because little energy is demanded here: its toughness is just about 0.09 MJ/m³, so every extra joule it must absorb costs about 11 mm² of cross-section.',
    s4hint: 'What to watch: keep U = 0 and drag only δ. With a tight δ stiffness rules, and the ceramic, with the largest E, is both lightest and thinnest; loosen δ and strength takes over, and the lightest becomes the aluminium alloy (yield strength close to steel’s at about a third of the density). Then raise U from zero and watch the ceramic’s cross-section balloon. Finally switch to “thinnest”: under the same conditions the thinnest rod is often steel rather than aluminium.',

    s5k: 'Step 5 · Cracks',
    s5t: 'Give the same material a crack: how much stress can it still carry?',
    s5e: 'This step answers: every number so far came from smooth specimens, but real parts often carry small cracks — weld defects, corrosion pits, machining scratches. Stress is magnified near a crack tip, and the <strong>stress intensity factor</strong> K = σ√(πa) measures by how much (σ is the remote tensile stress and a the crack half-length; here, a through-crack in the middle of a very wide plate). When K reaches the material’s <strong>fracture toughness</strong> K<sub>IC</sub> (in MPa·√m, a measure of how well the material resists a crack running), the crack runs away, so the fracture stress with a crack is σ<sub>c</sub> = K<sub>IC</sub> / √(πa): the longer the crack, the lower it is. Meanwhile, once the stress reaches the yield strength (R<sub>p0.2</sub> from step 1) the part deforms plastically first. Whichever line is lower wins. They meet at the crack size a* = (K<sub>IC</sub> / R<sub>p0.2</sub>)² / π: with a crack shorter than a*, the part yields first and the deformation gives warning; longer than a*, it snaps suddenly below its yield stress. Both axes are logarithmic: each major division is a factor of 10.',
    a5Slider: 'Crack half-length a (mm, log scale)',
    c5title: 'Failure stress (MPa) vs crack half-length a (mm), log–log',
    s5lgSolid: 'solid: the failure that happens first', s5lgDash: 'dashed: the part hidden by the other line',
    s5readout: 'At a = {a} mm: {list}.',
    s5item: '{mat} {s} MPa ({mode}, a* = {at} mm)',
    listSep: '; ',
    modeYield: 'yields first', modeFracture: 'fractures first', modeBrittle: 'brittle fracture',
    s5hint: 'What to watch: start at a = 1 mm and drag right. Watch where each solid line turns from its flat part (set by the yield strength) into the falling slope (set by the crack) — that bend is a*. Alumina bends at about 0.075 mm, so flaws you can barely see decide its strength; the aluminium alloy at about 3.2 mm, mild steel at about 9 mm, and annealed copper only at about 165 mm. Every slope is −1/2: a crack 100 times longer cuts the fracture stress to a tenth. The KIC values are typical orders of magnitude; real values move a lot with composition, heat treatment, temperature and plate thickness.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What one tensile curve told us',
    s6fin: 'Divide out the size with σ = F/A₀ and ε = ΔL/L₀ and the curve belongs to the material alone (up to necking). The slope of the straight start is the <strong>elastic modulus</strong> E; the 0.2 % offset line gives the <strong>yield strength</strong>; the peak is the <strong>tensile strength</strong>, reached when the hardening rate drops to the true stress; the area under the curve is the <strong>toughness</strong>. In design each number polices a different requirement, and which material is “best” depends on what you ask of it. Finally, a crack turns “strong” into a race between two lines: shorter than a*, the part yields first; longer, it fractures first.',
    formula: 'σ = F/A₀　ε = ΔL/L₀　σ = Eε (elastic range)\ndσt/dεt = σt (necking starts)\ntoughness = ∫σ dε　σc = KIC / √(πa)',
    boundary: 'Scope: engineering stress–strain for uniaxial, slow, room-temperature tension of smooth specimens. The plastic range uses the Ludwik hardening law σt = σp + K·εpⁿ fitted to typical values; the drop after necking is an empirical curve, not a mechanics solution; material numbers are textbook-order illustrations, not design data. Not covered: loading rate and temperature (steel turns brittle in the cold), fatigue (repeated loading breaks parts far below the tensile strength), creep, anisotropy, and the yield plateau common in mild steel.',
    linksTitle: 'Related lessons on this site',
    lk1: '→ Mechanical energy, step 4: the ½kx² stored in a spring is the triangle you get back on unloading here',
    lk2: '→ Definite integral, step 2: area under a curve as a sum of slices — exactly how toughness is computed',
    lk3: '→ Pressure, step 0: the same force on a smaller area — stress and pressure share the same unit',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Materials Science · When Stress Becomes Fracture”.'
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
