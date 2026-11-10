'use strict';
// Gravitational lensing lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '引力透镜 · 从一束弯光到称出星系的质量',
    back: '← 知识索引',
    compare: '对照另一版本：引力透镜 · 宇宙里的凸透镜 →',
    navLabel: '引力透镜步骤导航',
    tagline: '远处一颗星发出的光，从一个大质量天体旁边经过时会被引力拐弯。拐多少？为什么会看到两个像、一圈光环，或者只看到那颗星忽然变亮又变暗？反过来，量一量光环有多大，就能称出中间那个天体有多重。七步走完这条链。',
    nav0: '0 光拐多少', nav1: '1 两个像', nav2: '2 环有多大', nav3: '3 微透镜', nav4: '4 弧与环', nav5: '5 称质量', nav6: '6 收束',

    s0k: '第 0 步 · 偏折角',
    s0t: '星光擦过太阳边缘，方向会拐多少？',
    s0e: '这一步要回答：一束光从质量为 M 的天体旁边经过，最近处离天体中心的距离（称<strong>碰撞参数</strong> b）给定时，光的方向会拐多大的角？广义相对论给出<strong>偏折角</strong> α = 4GM/(c²b)，G 是引力常数，c 是光速；α 用角秒计（″，1 度的 1/3600）。如果把光当成受牛顿引力吸引的小粒子，算出来正好只有一半，2GM/(c²b)；1919 年日全食时测到的太阳边缘星光偏移更接近前者。注意 α ∝ 1/b：离得越近拐得越多。玻璃凸透镜正相反，越靠边缘偏得越多，所以平行光能收到同一个焦点（<a class="xlink" href="../../../physics/optics/lens/#step0">→ 透镜页第 0 步：平行光怎样被收拢到一点</a>）；引力透镜没有单一焦点，每束光与中轴相交的位置 b/α 都不一样。',
    bSlider: '碰撞参数 b（太阳半径 R☉）', mSlider: '透镜质量 M（太阳质量 M☉）',
    c0a: '示意：一排平行光掠过透镜天体（偏折角放大约 {k} 倍）', c0b: '偏折角 α（角秒）随 b 的变化',
    s0lgRay: '当前 b 的光线', s0lgOther: '其他 b 的光线', s0lgGR: '广义相对论 4GM/(c²b)', s0lgN: '牛顿式估算（一半）',
    s0readout: 'M = {m} M☉，b = {b} R☉（R☉ 为太阳半径）：广义相对论 α = {a}″，牛顿式估算 {n}″，正好一半。这束光在透镜后 {f} AU（天文单位，日地平均距离）处与中轴相交；b 加倍，α 减半，交点距离变成 4 倍。',
    s0hint: '观察顺序：先保持 M = 1，把 b 从 1 拖到 20：下图橙点沿 1/b 曲线下滑，示意图里高亮的那束光几乎不再拐弯，交点退到图外。再把 b 放回 1、只拖 M：α 与 M 成正比。示意图里所有光线用同一个放大倍数画，真实偏折只有角秒级。太阳边缘（M = 1、b = 1）的 α = 1.75″，那束光在约 548 AU 外才与中轴相交。',

    s1k: '第 1 步 · 透镜方程',
    s1t: '知道光源真正在哪，我们会从哪几个方向看到它？',
    s1e: '这一步要回答：光源、透镜、观察者几乎排成一线时，光会从哪些方向进入我们的眼睛？角度都从观察者看、从透镜方向量起：光源真实的方向是 <strong>β</strong>，光实际到达的方向是 <strong>θ</strong>。光在透镜处拐了第 0 步的 α，小角度几何给出<strong>透镜方程</strong> β = θ − (D_ls/D_s)·α，其中 D_s 是我们到光源的距离，D_ls 是透镜到光源的距离。点质量的 α 与 1/θ 成正比，把所有角度用一个特征角 θE（<strong>爱因斯坦半径</strong>，下一步算它多大）做单位，方程化成 β = θ − 1/θ。每个满足方程的 θ 都是一个<strong>像</strong>：在那个方向上能看到光源。<strong>放大率</strong> μ 是像的面积 ÷ 光源本来的面积；引力弯光不改变单位面积的亮度，所以 μ 也是这个像的亮度倍数。',
    betaSlider: '光源真实方向 β（单位 θE）',
    c1a: '方程图：β = θ − 1/θ（横轴 θ，纵轴 β，单位 θE）', c1b: '天空图：我们看到的样子（单位 θE）',
    s1lgCurve: 'β(θ) 曲线', s1lgLine: '当前 β', s1lgImg: '像（面积 ∝ 亮度）', s1lgSrc: '光源真实位置', s1lgRing: '半径 θE 的圆',
    s1readout: 'β = {b} θE：方程有两个解。θ₊ = {tp} θE，在光源同侧、环外，亮度是光源的 {mp} 倍；θ₋ = {tm} θE，在另一侧、环内，亮度 {mm} 倍，并且左右镜像翻转。两像相距 {sep} θE，合计亮度 {A} 倍。',
    s1ring: 'β = 0：光源、透镜、观察者正好在一条直线上，满足方程的不再是两个点，而是半径 1 θE 的一整圈：爱因斯坦环。（点光源在这里的放大率趋于无穷；真实光源有大小，第 4 步会看到它。）',
    s1hint: '观察顺序：拖 β，看方程图里的水平线与曲线的两个交点，再到天空图找对应的两个像。β 越大，环外的像越靠近光源真实位置、亮度趋于 1 倍；环内的像越来越小。把 β 拖到 0，两个交点变成 θ = ±1，天空图上出现完整的环。',
    quizPrompt: '把 β 从 0.2 拖到 2.5，环内那个像会怎样？',
    quizA: '越来越亮，最后比环外的像还亮', quizB: '向透镜靠拢，并且越来越暗', quizC: '位置和亮度都不变',
    check: '核对',
    correct: '对。θ₋ = (β − √(β² + 4))/2 的大小随 β 增大而变小，所以内像向透镜中心靠拢；它的亮度倍数也一路下降，在 β = 2.5 时只剩约 0.015 倍，而且始终比环外的像暗。',
    wrong: '再看看：拖 β 时盯住天空图里环内那个像，看它离中心点的距离和圆点大小怎么变；读数里的 θ₋ 和它的亮度倍数也在变。',

    s2k: '第 2 步 · 爱因斯坦半径',
    s2t: '这个环实际有多大，望远镜能看出两个像吗？',
    s2e: '这一步要回答：上一步当单位用的 θE 实际是多少角度？令 β = 0，把 α = 4GM/(c²b) 和 b = θ·D_l（D_l 是我们到透镜的距离）代入透镜方程，得到 <strong>θE = √(4GM/c² · D_ls/(D_l·D_s))</strong>。它随质量的平方根增大；整体越远越小。把透镜放在全程的比例 x = D_l/D_s 处，θE ∝ √((1 − x)/x)：透镜离我们越近，环的张角越大。两个像相距约 2θE，要把它们分开，这个间距必须大于望远镜的<strong>角分辨率</strong>（能分清两个点的最小夹角）。本页的距离直接相减（D_ls = D_s − D_l）；在宇宙学距离上要换成考虑空间膨胀的距离（<a class="xlink" href="../../../earth/astronomy/cosmology-expansion/#step0">→ 宇宙膨胀页第 0 步：空间的刻度在拉开</a>），数值会有出入。',
    logMSlider: '透镜质量 lg M（M 以 M☉ 计）', dsSlider: '光源距离 D_s', xSlider: '透镜位置 x = D_l/D_s',
    presetStar: '银河系里的一颗恒星', presetGalaxy: '一个大星系', presetCluster: '一个星系团（当作一个点）',
    c2a: '两像间距 2θE 与分辨率（对数标尺，角秒）', c2b: '固定 M 和 D_s，θE 随 x 的变化',
    resEye: '肉眼 60″', resSeeing: '地面 1″', resHubble: '哈勃 0.05″',
    s2lgNow: '当前 2θE', s2lgHist: '试过的 2θE', s2lgRes: '分辨率', s2lgSplit: '哈勃能分开的范围',
    s2readout: 'M = {m} M☉，D_s = {ds}，D_l = {x} × D_s：θE = {th}，两像相距约 2θE = {sep}；环在透镜处的实际半径 R_E = θE × D_l = {re}。{verdict}',
    s2v0: '比肉眼分辨率（约 60″）还大：只要够亮，肉眼原则上就能分开两个像。',
    s2v1: '大于地面望远镜受大气抖动限制的约 1″：地面望远镜就能看出两个像。',
    s2v2: '在 1″ 与哈勃望远镜的衍射极限（约 0.05″）之间：要靠哈勃这样的太空望远镜才能分开。',
    s2v3: '比哈勃的 0.05″ 还小 {k} 倍：光学望远镜都分不开两个像，只能看到总亮度的变化，这就是下一步的微引力透镜。',
    s2hint: '观察顺序：先依次点三个预设，标尺上会留下它们的 2θE：恒星约 1.4 mas（毫角秒，千分之一角秒），星系约 4″，星系团约 2′（两角分）。再固定 M 和 D_s，只拖 x：下图的点沿曲线移动，x 越小（透镜越靠近我们），θE 越大。',

    s3k: '第 3 步 · 微引力透镜',
    s3t: '两个像分不开的时候，还能认出引力透镜吗？',
    s3e: '这一步要回答：透镜是银河系里的一颗恒星时，θE 不到 1 毫角秒，两个像挤成一个光点，还能发现它吗？能，看总亮度。两个像合起来的亮度是光源本身的 A 倍：<strong>A(u) = (u² + 2)/(u·√(u² + 4))</strong>，其中 u 是光源与透镜的角距离，以 θE 为单位（就是第 1 步的 β）。恒星之间有相对运动，u 随时间变化，于是这颗星先变亮、再变暗，曲线左右对称，而且各种颜色的光放大得一样多。这种事件叫<strong>微引力透镜</strong>。时间以 tE（光源走过一个 θE 所需的时间）为单位，u₀ 是最接近时的 u。',
    u0Slider: '最近距离 u₀（单位 θE）', tSlider: '时间 t（单位 tE，0 为最接近时）',
    play3: '让光源走过去（−2 → 2 tE）', clear3: '清除旧曲线',
    c3a: '光源路径（单位 θE，像的分离只有毫角秒）', c3b: '亮度倍数 A 随时间 t（单位 tE）',
    s3lgPath: '光源路径', s3lgSrc: '光源', s3lgImg: '两个像', s3lgNow: '本次曲线', s3lgOld: '之前的 u₀',
    s3readout: 't = {t} tE：u = {u}，亮度 A = {A} 倍，比平时亮 {dm} 星等（星等是天文亮度刻度，亮 1 星等约等于亮 2.5 倍）。本次 u₀ = {u0}，峰值 A = {pk} 倍。{prog}',
    s3prog: '（已走 {c}/{N} 个时间点）',
    s3hint: '观察顺序：先保持 u₀ = 0.5，按「让光源走过去」，上图光源沿虚线穿过，下图描出整条亮度曲线。再把 u₀ 改成 0.1 重播，旧曲线留在图上做对比：u₀ 越小，峰越高越尖；u₀ 小时峰值约为 1/u₀（u₀ = 0.1 时 A = 10.04）。光源恰好碰到半径 θE 的圆（u = 1）时 A = 1.34。',

    s4k: '第 4 步 · 弧与环',
    s4t: '光源是个小圆盘而不是一个点，像会长成什么样？',
    s4e: '这一步要回答：有大小的光源经过透镜后是什么形状？做法叫<strong>逆向光线追踪</strong>：对天空里每一个方向 θ（向量，单位 θE），用透镜方程算出它对应的光源位置 β = θ − θ/|θ|²，落在光源圆盘里的方向就点亮。圆盘上每一点各自产生两个像，而且两个像都在「透镜—该点」这条直线上，所以圆盘沿着环的方向被拉长成两段<strong>弧</strong>：每段弧张开的角度，等于从透镜看圆盘所占的角度 2·arcsin(ρ/β)（ρ 是圆盘半径）。圆盘盖住透镜方向（β ≤ ρ）时，两段弧连成完整的环。像的总面积 ÷ 圆盘面积就是放大率。圆盘上半涂青色、下半涂紫色，用来看清像有没有被镜像翻转。',
    beta4: '圆盘中心 β（单位 θE）', rho4: '圆盘半径 ρ（单位 θE）',
    c4a: '光源平面：圆盘与透镜（单位 θE）', c4b: '天空：逆向光线追踪得到的像（单位 θE）',
    s4lgTop: '圆盘上半', s4lgBot: '圆盘下半', s4lgRing: '半径 θE 的圆', s4lgLens: '透镜方向',
    s4arc: '两段弧，各张开 {s}°；外弧在光源同侧，内弧在对侧，张角相同但更细，颜色上下颠倒（镜像）',
    s4ring: '圆盘盖住了透镜方向（β ≤ ρ），像连成一个完整的环',
    s4readout: 'β = {b} θE，ρ = {r} θE：{shape}。像的总面积是圆盘面积的 {mx} 倍；只按圆心那一点算的放大率是 {mp}。',
    s4inf: '无穷大',
    s4hint: '观察顺序：保持 ρ = 0.2，把 β 从 1.5 慢慢拖到 0：两个像先是一大一小两块斑，接着被拉成越来越长的弧，β 降到 0.2（等于 ρ）时合成一个环。再固定 β = 0.5、只拖 ρ：圆盘越大，弧张得越开。面积比和「只看圆心」的估算不完全相同，因为圆盘各处离透镜远近不同，放大率被平均了：β 远大于 ρ 时两者几乎一样（ρ = 0.2、β = 1 时只差约 0.4%），β 接近 ρ 时差得多（β = 0.2 时约 27%）；β = 0 时圆心估算是无穷大，圆盘的面积比仍是有限值。',

    s5k: '第 5 步 · 称质量',
    s5t: '拍到一个爱因斯坦环，能不能反过来称出透镜有多重？',
    s5e: '这一步要回答：已知环的角半径 θE 和两段距离，透镜的质量是多少？把第 2 步的公式反过来：<strong>M = c²·θE²·D_l·D_s/(4G·D_ls)</strong>。θE 直接在图像上量，距离由光谱红移估出。对圆对称的透镜，这个 M 是<strong>环半径以内</strong>的全部质量：发光的恒星和气体、不发光的物质都算在内，因为偏折只认引力，不管东西亮不亮。所以引力透镜是测量暗物质分布的手段之一。另一种称质量的办法是看绕它运动的东西转得多快（<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step4">→ 万有引力与轨道页第 4 步：周期与轨道大小</a>）。',
    th5: '环的角半径 θE（角秒）', dl5: '透镜距离 D_l（Mpc，百万秒差距）', ds5: '光源距离 D_s（Mpc）',
    c5a: '环内质量 M（10¹¹ M☉）随 θE 的变化',
    s5lgCurve: '当前距离下的 M(θE)', s5lgBand: 'θE 误差 ±5% 对应的范围', s5lgNow: '当前', s5lgHist: '试过的点', s5lgFloor: 'D_s 极远时的下限',
    s5off: '（超出图的上限，以顶端的箭头表示）',
    s5readout: 'θE = {th}″，D_l = {dl} Mpc，D_s = {ds} Mpc：环内质量 M = {m} M☉；环在透镜处的实际半径 {rk} kpc（千秒差距，约 3260 光年）。M ∝ θE²：θE 量偏 5%，M 偏 {lo}% 到 +{hi}%（图中阴影带）。',
    s5bad: 'D_s = {ds} Mpc 不大于 D_l = {dl} Mpc：光源必须在透镜后面，才会被它弯折。请把 D_s 调大或把 D_l 调小。',
    s5hint: '观察顺序：先只拖 θE：橙点沿抛物线移动，θE 翻倍，M 变成 4 倍。再固定 θE、只拖 D_s：光源越远，同一个环对应的质量越小，但不会无限变小；D_s 远大于 D_l 时 D_s/D_ls 趋于 1，M 趋于 c²θE²D_l/(4G)。灰色虚线就是这个下限；白点记下你试过的组合。',

    s6k: '第 6 步 · 收束', s6t: '一条公式，从弯光读到质量',
    s6fin: '回看这条线。<strong>第 0 步</strong>：质量让掠过的光拐 α = 4GM/(c²b)，离得越近拐得越多，所以没有单一焦点。<strong>第 1 步</strong>：透镜方程 β = θ − 1/θ 总有两个解，一个像在环外、一个在环内且镜像翻转；正对时变成一个环。<strong>第 2 步</strong>：环的大小 θE ∝ √M，恒星只有毫角秒，星系是角秒级。<strong>第 3 步</strong>：分不开的两个像仍让总亮度对称地升降，这是微引力透镜。<strong>第 4 步</strong>：有大小的光源被拉成弧，盖住透镜方向时成环。<strong>第 5 步</strong>：量出 θE，就能反推环内的总质量，不管它发不发光。',
    formula: 'α = 4GM/(c²b)\nβ = θ − θE²/θ\nθE = √(4GM·D_ls/(c²·D_l·D_s))\nA(u) = (u² + 2)/(u√(u² + 4))',
    boundary: '适用范围：本页把透镜当成一个点质量，光线只在透镜所在的平面拐一次（薄透镜），角度都很小（弱场）；距离直接相减，宇宙学里应改用角直径距离。真实星系是椭圆的，还受周围物质的牵扯，常把一个光源变成四个像；黑洞附近的强引力需要完整的广义相对论。第 3 步把光源当成一个点，光源圆盘与 u₀ 相当时峰值会被削平。',
    linksTitle: '接着去看',
    lk1: '→ 透镜页第 0 步：玻璃凸透镜怎样把平行光收拢到一点',
    lk2: '→ 反射与折射页第 2 步：光穿过界面为什么拐弯',
    lk3: '→ 万有引力与轨道页第 0 步：引力怎样随距离减弱',
    lk4: '→ 宇宙膨胀页第 2 步：红移，用来估算遥远天体的距离',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《引力透镜 · 宇宙里的凸透镜》的平行版本。'
  },
  en: {
    pageTitle: 'Gravitational Lensing · From One Bent Ray to Weighing a Galaxy',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Gravitational Lensing · A Cosmic Convex Lens →',
    navLabel: 'Gravitational lensing steps',
    tagline: 'Light from a distant star bends as it passes a massive object. By how much? Why do we sometimes see two images, a ring of light, or just a star that brightens and fades? And turned around: measure the size of the ring and you can weigh whatever sits in the middle. Seven steps take you along that chain.',
    nav0: '0 How much bend', nav1: '1 Two images', nav2: '2 Ring size', nav3: '3 Microlensing', nav4: '4 Arcs & rings', nav5: '5 Weighing', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The deflection angle',
    s0t: 'Starlight grazes the Sun. How far does it turn?',
    s0e: 'This step asks: light passes a body of mass M, and its closest distance to the body’s centre (the <strong>impact parameter</strong> b) is given. Through what angle does its direction turn? General relativity gives the <strong>deflection angle</strong> α = 4GM/(c²b), with G the gravitational constant and c the speed of light; α is quoted in arcseconds (″, 1/3600 of a degree). Treat light as a tiny particle pulled by Newtonian gravity and you get exactly half, 2GM/(c²b); the star shifts measured near the Sun during the 1919 total eclipse sided with the larger value. Notice α ∝ 1/b: the closer the pass, the bigger the bend. A glass convex lens does the opposite, bending more towards its rim, which is why it brings parallel light to one focus (<a class="xlink" href="../../../physics/optics/lens/#step0">→ Lenses, step 0: how parallel light is gathered to a point</a>). A gravitational lens has no single focus: each ray crosses the axis at its own distance b/α.',
    bSlider: 'Impact parameter b (solar radii R☉)', mSlider: 'Lens mass M (solar masses M☉)',
    c0a: 'Sketch: parallel rays skimming the lens (bends exaggerated ~{k}×)', c0b: 'Deflection α (arcsec) against b',
    s0lgRay: 'ray at the current b', s0lgOther: 'rays at other b', s0lgGR: 'general relativity 4GM/(c²b)', s0lgN: 'Newtonian estimate (half)',
    s0readout: 'M = {m} M☉, b = {b} R☉ (R☉ is the Sun’s radius): general relativity gives α = {a}″, the Newtonian estimate {n}″, exactly half. This ray crosses the axis {f} AU behind the lens (1 AU is the mean Earth–Sun distance). Double b and α halves, while the crossing point moves 4 times as far.',
    s0hint: 'What to try: keep M = 1 and drag b from 1 to 20. In the lower chart the orange dot slides down the 1/b curve; in the sketch the highlighted ray barely turns and its crossing point leaves the frame. Then put b back to 1 and drag only M: α grows in proportion. Every ray in the sketch is exaggerated by the same factor; real bends are arcseconds. At the Sun’s limb (M = 1, b = 1) α = 1.75″, and that ray only reaches the axis about 548 AU away.',

    s1k: 'Step 1 · The lens equation',
    s1t: 'If we know where the source really is, from which directions do we see it?',
    s1e: 'This step asks: with source, lens and observer almost in a line, along which directions does light reach us? All angles are seen from the observer and measured from the lens: the source truly sits at angle <strong>β</strong>, and the light actually arrives from angle <strong>θ</strong>. The light turns by step 0’s α at the lens, and small-angle geometry gives the <strong>lens equation</strong> β = θ − (D_ls/D_s)·α, where D_s is our distance to the source and D_ls the lens-to-source distance. For a point mass α is proportional to 1/θ, so measuring every angle in a characteristic unit θE (the <strong>Einstein radius</strong>, sized in the next step) turns the equation into β = θ − 1/θ. Every θ that solves it is an <strong>image</strong>: a direction in which the source appears. The <strong>magnification</strong> μ is the image’s area divided by the source’s own area; bending light does not change brightness per unit area, so μ is also how much brighter that image looks.',
    betaSlider: 'True source direction β (units of θE)',
    c1a: 'Equation chart: β = θ − 1/θ (θ across, β up, units of θE)', c1b: 'Sky chart: what we see (units of θE)',
    s1lgCurve: 'β(θ) curve', s1lgLine: 'current β', s1lgImg: 'images (area ∝ brightness)', s1lgSrc: 'true source position', s1lgRing: 'circle of radius θE',
    s1readout: 'β = {b} θE: the equation has two solutions. θ₊ = {tp} θE lies on the source’s side, outside the circle, at {mp}× the source’s brightness; θ₋ = {tm} θE lies on the far side, inside the circle, at {mm}×, and it is mirror-flipped. The images are {sep} θE apart, {A}× as bright as the source in total.',
    s1ring: 'β = 0: source, lens and observer are exactly in line. The solutions are no longer two points but a whole circle of radius 1 θE, the Einstein ring. (A point source would be infinitely magnified here; real sources have a size, as step 4 shows.)',
    s1hint: 'What to try: drag β and watch the horizontal line cut the curve twice in the equation chart, then find the two matching images in the sky chart. As β grows, the outer image closes in on the true source position and its brightness falls towards 1×, while the inner image shrinks away. Drag β to 0: the two crossings become θ = ±1 and a full ring appears in the sky chart.',
    quizPrompt: 'Drag β from 0.2 to 2.5. What happens to the image inside the circle?',
    quizA: 'It brightens until it outshines the outer image', quizB: 'It moves in towards the lens and keeps fading', quizC: 'Its position and brightness stay the same',
    check: 'Check',
    correct: 'Right. The size of θ₋ = (β − √(β² + 4))/2 shrinks as β grows, so the inner image creeps towards the lens; its brightness factor drops all the way, to about 0.015× at β = 2.5, and it is always fainter than the outer image.',
    wrong: 'Look again: while dragging β, watch the image inside the circle in the sky chart, how far it is from the centre dot and how big its disc is. θ₋ and its brightness factor in the readout change too.',

    s2k: 'Step 2 · The Einstein radius',
    s2t: 'How big is the ring really, and can a telescope split the images?',
    s2e: 'This step asks: what angle is the θE we used as a unit? Set β = 0, substitute α = 4GM/(c²b) and b = θ·D_l (D_l is our distance to the lens) into the lens equation, and you get <strong>θE = √(4GM/c² · D_ls/(D_l·D_s))</strong>. It grows as the square root of the mass and shrinks as everything moves farther away. Put the lens at fraction x = D_l/D_s of the way: θE ∝ √((1 − x)/x), so the nearer the lens is to us, the wider the ring looks. The two images sit about 2θE apart, and splitting them needs that gap to exceed the telescope’s <strong>angular resolution</strong> (the smallest angle at which two points still look like two). Distances here are simply subtracted (D_ls = D_s − D_l); across cosmological distances you need distances that account for expanding space (<a class="xlink" href="../../../earth/astronomy/cosmology-expansion/#step0">→ Cosmic expansion, step 0: the scale of space stretching</a>), and the numbers shift.',
    logMSlider: 'Lens mass lg M (M in M☉)', dsSlider: 'Source distance D_s', xSlider: 'Lens position x = D_l/D_s',
    presetStar: 'A star in our Galaxy', presetGalaxy: 'A big galaxy', presetCluster: 'A galaxy cluster (as a point)',
    c2a: 'Image gap 2θE vs resolution (log scale, arcsec)', c2b: 'θE against x, with M and D_s held fixed',
    resEye: 'eye 60″', resSeeing: 'ground 1″', resHubble: 'Hubble 0.05″',
    s2lgNow: 'current 2θE', s2lgHist: '2θE tried so far', s2lgRes: 'resolution', s2lgSplit: 'range Hubble can split',
    s2readout: 'M = {m} M☉, D_s = {ds}, D_l = {x} × D_s: θE = {th}, so the images are about 2θE = {sep} apart; the ring’s actual radius at the lens is R_E = θE × D_l = {re}. {verdict}',
    s2v0: 'That is wider than the eye’s resolution (about 60″): if bright enough, even the naked eye could split the images.',
    s2v1: 'That beats the roughly 1″ blur the atmosphere imposes on ground telescopes: a ground telescope can show both images.',
    s2v2: 'That lies between 1″ and Hubble’s diffraction limit (about 0.05″): it takes a space telescope like Hubble to split them.',
    s2v3: 'That is {k} times smaller than Hubble’s 0.05″: no optical telescope can split the images, and all you see is the total brightness change, which is the microlensing of the next step.',
    s2hint: 'What to try: click the three presets in turn; each leaves its 2θE on the ruler: a star gives about 1.4 mas (milliarcseconds, thousandths of an arcsecond), a galaxy about 4″, a cluster about 2′ (two arcminutes). Then hold M and D_s and drag only x: the dot in the lower chart rides the curve, and the smaller x is (the closer the lens), the larger θE.',

    s3k: 'Step 3 · Microlensing',
    s3t: 'When the two images cannot be split, can we still spot the lens?',
    s3e: 'This step asks: when the lens is a star in our Galaxy, θE is under a milliarcsecond and both images merge into one dot. Can we still tell? Yes, from the total brightness. Together the two images are A times as bright as the source alone: <strong>A(u) = (u² + 2)/(u·√(u² + 4))</strong>, where u is the angle between source and lens in units of θE (step 1’s β). Stars drift relative to each other, so u changes with time and the source brightens, then fades, along a symmetric curve, with every colour of light boosted by the same factor. That is a <strong>microlensing</strong> event. Time is measured in tE (how long the source takes to cross one θE), and u₀ is u at closest approach.',
    u0Slider: 'Closest approach u₀ (units of θE)', tSlider: 'Time t (units of tE, 0 = closest approach)',
    play3: 'Let the source drift past (−2 → 2 tE)', clear3: 'Clear old curves',
    c3a: 'Source path (units of θE; the images are only mas apart)', c3b: 'Brightness factor A against time t (units of tE)',
    s3lgPath: 'source path', s3lgSrc: 'source', s3lgImg: 'the two images', s3lgNow: 'this curve', s3lgOld: 'earlier u₀',
    s3readout: 't = {t} tE: u = {u}, brightness A = {A}×, i.e. {dm} magnitudes brighter than usual (magnitudes are astronomy’s brightness scale; 1 magnitude is about 2.5×). This pass has u₀ = {u0} and peaks at A = {pk}×. {prog}',
    s3prog: '({c}/{N} time points walked)',
    s3hint: 'What to try: keep u₀ = 0.5 and press “Let the source drift past”. In the upper chart the source travels along the dashed line; the lower chart traces the whole brightness curve. Then set u₀ to 0.1 and replay; the old curve stays for comparison. The smaller u₀, the taller and sharper the peak, and for small u₀ the peak is close to 1/u₀ (A = 10.04 at u₀ = 0.1). When the source just touches the circle of radius θE (u = 1), A = 1.34.',

    s4k: 'Step 4 · Arcs and rings',
    s4t: 'If the source is a small disc, not a point, what do its images look like?',
    s4e: 'This step asks: what shape does a source with some size take after lensing? The method is <strong>inverse ray tracing</strong>: for each direction θ on the sky (a vector, in θE units), the lens equation gives the source position it looks back to, β = θ − θ/|θ|²; directions that land inside the source disc light up. Each point of the disc makes two images, and both lie on the line through the lens and that point, so the disc is stretched along the circle into two <strong>arcs</strong>. Each arc spans the same angle the disc covers as seen from the lens, 2·arcsin(ρ/β), where ρ is the disc radius. Once the disc covers the lens direction (β ≤ ρ), the arcs join into a complete ring. Total image area divided by disc area is the magnification. The disc’s upper half is painted cyan and its lower half violet, so you can tell whether an image is mirror-flipped.',
    beta4: 'Disc centre β (units of θE)', rho4: 'Disc radius ρ (units of θE)',
    c4a: 'Source plane: the disc and the lens (units of θE)', c4b: 'Sky: images from inverse ray tracing (units of θE)',
    s4lgTop: 'upper half of disc', s4lgBot: 'lower half of disc', s4lgRing: 'circle of radius θE', s4lgLens: 'lens direction',
    s4arc: 'two arcs, each spanning {s}°; the outer one on the source’s side, the inner one opposite, with the same span but thinner and its colours upside down (mirrored)',
    s4ring: 'the disc covers the lens direction (β ≤ ρ), so the images join into one complete ring',
    s4readout: 'β = {b} θE, ρ = {r} θE: {shape}. Total image area is {mx}× the disc’s area; using only the disc’s centre point would give {mp}.',
    s4inf: 'infinity',
    s4hint: 'What to try: keep ρ = 0.2 and slowly drag β from 1.5 to 0. The two images start as a large and a small blob, stretch into longer and longer arcs, and merge into a ring once β reaches 0.2 (equal to ρ). Then fix β = 0.5 and drag only ρ: the bigger the disc, the wider the arcs open. The area ratio is not quite the centre-point estimate, because different parts of the disc sit at different distances from the lens and their magnifications average out. With β much larger than ρ the two nearly agree (about 0.4% apart at ρ = 0.2, β = 1); with β close to ρ they differ a lot (about 27% at β = 0.2); and at β = 0 the centre-point estimate is infinite while the disc’s area ratio stays finite.',

    s5k: 'Step 5 · Weighing the lens',
    s5t: 'Photograph an Einstein ring: can you work back to the lens’s mass?',
    s5e: 'This step asks: given the ring’s angular radius θE and the two distances, what is the lens’s mass? Run step 2’s formula backwards: <strong>M = c²·θE²·D_l·D_s/(4G·D_ls)</strong>. θE is measured straight off the image; the distances come from spectral redshifts. For a round lens this M is all the mass <strong>inside the ring’s radius</strong>: shining stars and gas and dark matter alike, because bending responds only to gravity, not to light. That makes lensing one of the ways dark matter is mapped. Another way to weigh something is to time what orbits it (<a class="xlink" href="../../../earth/astronomy/gravity-orbits/#step4">→ Gravity and orbits, step 4: period and orbit size</a>).',
    th5: 'Ring angular radius θE (arcsec)', dl5: 'Lens distance D_l (Mpc, megaparsecs)', ds5: 'Source distance D_s (Mpc)',
    c5a: 'Mass inside the ring M (10¹¹ M☉) against θE',
    s5lgCurve: 'M(θE) at these distances', s5lgBand: 'range for a ±5% error in θE', s5lgNow: 'current', s5lgHist: 'points tried', s5lgFloor: 'floor as D_s → ∞',
    s5off: ' (beyond the top of the chart, shown by the arrow at the top edge)',
    s5readout: 'θE = {th}″, D_l = {dl} Mpc, D_s = {ds} Mpc: mass inside the ring M = {m} M☉; the ring’s actual radius at the lens is {rk} kpc (kiloparsecs, about 3260 light-years each). M ∝ θE²: a 5% error in θE moves M by {lo}% to +{hi}% (the shaded band).',
    s5bad: 'D_s = {ds} Mpc is not beyond D_l = {dl} Mpc: the source must lie behind the lens to be bent by it. Raise D_s or lower D_l.',
    s5hint: 'What to try: first drag only θE. The orange dot rides a parabola: double θE and M becomes 4 times as large. Then fix θE and drag only D_s: the farther the source, the less mass the same ring implies, though never below a floor; once D_s ≫ D_l, D_s/D_ls approaches 1 and M approaches c²θE²D_l/(4G). The grey dashed curve is that floor; white dots record the combinations you have tried.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One formula, read from bent light to mass',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: mass turns a passing ray by α = 4GM/(c²b), more for closer passes, so there is no single focus. <strong>Step 1</strong>: the lens equation β = θ − 1/θ always has two solutions, one image outside the circle and one inside and mirror-flipped; perfect alignment makes a ring. <strong>Step 2</strong>: the ring size θE grows as √M; a star gives milliarcseconds, a galaxy arcseconds. <strong>Step 3</strong>: images too close to split still make the total brightness rise and fall symmetrically: microlensing. <strong>Step 4</strong>: a source with a size is stretched into arcs, and into a ring when it covers the lens direction. <strong>Step 5</strong>: measure θE and you can recover the total mass inside the ring, whether it shines or not.',
    formula: 'α = 4GM/(c²b)\nβ = θ − θE²/θ\nθE = √(4GM·D_ls/(c²·D_l·D_s))\nA(u) = (u² + 2)/(u√(u² + 4))',
    boundary: 'Scope: this page treats the lens as a single point mass, bends each ray once in the lens’s plane (thin lens), and keeps every angle small (weak field); distances are subtracted directly, where cosmology would use angular-diameter distances. Real galaxies are elliptical and tugged by their surroundings, which often turns one source into four images; the strong gravity near a black hole needs full general relativity. Step 3 treats the source as a point; when its disc is comparable to u₀, the peak gets flattened.',
    linksTitle: 'Where to go next',
    lk1: '→ Lenses, step 0: how a glass convex lens gathers parallel light to a point',
    lk2: '→ Reflection and refraction, step 2: why light turns at an interface',
    lk3: '→ Gravity and orbits, step 0: how gravity weakens with distance',
    lk4: '→ Cosmic expansion, step 2: redshift, used to estimate the distances of faraway objects',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Gravitational Lensing · A Cosmic Convex Lens”.'
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
  if (typeof window.refreshLensing === 'function') window.refreshLensing();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LENS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
