'use strict';
// Blackbody radiation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '黑体辐射 · 从炉火的颜色读出温度',
    back: '← 知识索引',
    compare: '对照另一版本：黑体辐射 · 热的物体为什么发光 →',
    navLabel: '黑体辐射步骤导航',
    tagline: '铁匠看一眼炉膛的颜色就知道火候，天文学家看一眼星光就知道恒星表面多热。这背后是同一条曲线：热物体在每个波长上辐射多少能量。六步里你会读出这条曲线的峰、面积和尾巴，最后看到它为什么逼着物理学承认「能量是一份一份的」。',
    nav0: '0 颜色', nav1: '1 光谱', nav2: '2 峰的位置', nav3: '3 总量', nav4: '4 紫外灾难', nav5: '5 一份一份', nav6: '6 收束',

    s0k: '第 0 步 · 看颜色',
    s0t: '同一块铁越烧越热，颜色为什么从暗红变成白？',
    s0e: '这一步要回答：温度升高时，热物体的颜色按什么规律变？任何物体都在不停地向外辐射电磁波。<strong>可见光</strong>只是其中人眼看得见的一段，波长约 380–750 nm（1 nm = 十亿分之一米）；比它长的是<strong>红外线</strong>，比它短的是<strong>紫外线</strong>。<strong>黑体</strong>是一种理想物体：照到它上面的光全部吸收、一点不反射，所以它发出的光只由它自己的温度决定。炉里的铁、灯丝、恒星表面都很接近黑体。温度用开尔文 K（= 摄氏度 + 273.15）。下图上排是这个温度下人眼看到的颜色（亮度已拉齐，只比颜色），右边色带把 500–10000 K 的颜色排成一行；下排是它的<strong>光谱</strong>：横轴是波长（对数刻度，每一大格大 10 倍），纵轴是这一波长上的辐射强度占最高点的比例。白色虚线标出辐射最强的波长，叫<strong>峰值波长</strong> λ峰。',
    tempLabel: '温度 T', heat: '加热：从 500 K 升到 10000 K',
    pre_ember: '炭火 {T} K', pre_bulb: '白炽灯丝 {T} K', pre_sun: '太阳表面 {T} K', pre_sirius: '天狼星 {T} K', pre_body: '人体 {T} K',
    s0lgVis: '可见光部分（按波长着色）', s0lgIr: '红外部分（看不见）', s0lgPeak: '峰值波长 λ峰',
    c0a: '这个温度下看到的颜色（亮度已拉齐）', c0b: '光谱 ÷ 最高点（横轴：波长，对数刻度）',
    whereVis: '落在可见光范围内', whereIr: '在红外区，人眼看不见', whereUv: '在紫外区，人眼看不见',
    s0readout: 'T = {T} K（{C} °C）：辐射最强的波长 λ峰 = {peak}，{where}。可见光（380–750 nm）只占全部辐射的 {share}，相当于每平方米表面每秒发出 {vis} 的可见光。',
    heatProgress: '加热中 {T} K…',
    s0hint: '观察顺序：先按「加热」或把温度从左往右慢慢拖，盯住下排的白色虚线：它一路向左（向短波）移动。同时看彩色的可见光段：低温时它只是曲线左边一截细尾巴，人眼只收到红光那一头，所以是暗红；温度升高，峰挤进可见光，各种颜色都齐了，看起来就发白；再热，蓝紫一侧更多，颜色偏蓝白。最后读数里的可见光占比：比一比 1000 K 和 5772 K 相差多少。',

    s1k: '第 1 步 · 整条曲线',
    s1t: '在每一个波长上，黑体到底辐射了多少能量？',
    s1e: '这一步要回答：上一步只看了曲线的形状，真实大小是多少？纵轴换成<strong>光谱辐出度</strong> M(λ, T)：每平方米表面、每秒、在 1 nm 宽的波长区间里发出的能量，单位 kW/(m²·nm)。横轴是波长 λ（nm，这里是普通的线性刻度，只画到 3000 nm）。这条曲线由<strong>普朗克定律</strong>给出：M = 2πhc²/λ⁵ · 1/(e^(hc/λkT) − 1)。式中 h 是普朗克常数，c 是光速，k 是玻尔兹曼常数；它从哪来，第 5 步再拆开。曲线下的面积 = 把所有波长加起来 = 每平方米每秒辐射的总能量。',
    yFixed: '纵轴固定（看大小）', yAuto: '纵轴跟随（看形状）',
    s1lgNow: '当前温度的光谱', s1lgVis: '其中可见光部分', s1lgRef: '参考：3000 / 4500 / 6000 K',
    c1title: '光谱辐出度 M，kW/(m²·nm) · 横轴：波长 nm',
    s1readout: 'T = {T} K：曲线最高点在 λ = {peak}，高 {pv} kW/(m²·nm)，是 3000 K 时最高点的 {r5} 倍。曲线下的总面积（包括图右侧以外的长波部分）= 每平方米每秒辐射 {tot}，是 3000 K 时的 {r4} 倍；其中可见光占 {share}。',
    s1hint: '观察顺序：先保持「纵轴固定」，把温度从 1500 K 拖到 6500 K：曲线越长越高，顶点同时向左移。读数里两个倍数增长得不一样快：最高点按 T⁵ 长，总面积按 T⁴ 长（第 3 步解释）。再按「纵轴跟随」把低温曲线放大：1500 K 时顶点在 2000 nm 附近，可见光只蹭到左边的一点。灰色虚线是 3000、4500、6000 K 的曲线，留作对照。',

    s2k: '第 2 步 · 峰在哪里',
    s2t: '人体、灯丝、太阳、天狼星，各自在哪个波长辐射最强？',
    s2e: '这一步要回答：知道温度，怎样一下子说出峰值波长？反过来，看到峰在哪，能不能读出温度？答案是<strong>维恩位移定律</strong>：λ峰 = b / T，b ≈ 2.898 mm·K 是常数。λ峰与 T 成<strong>反比</strong>：两者乘积固定，温度翻倍，峰值波长减半（<a class="xlink" href="../../../math/algebra/inverse-proportion/#step2">→ 反比例页第 2 步：乘积不变的两个量，图像是什么形状</a>）。上图把每条光谱除以它自己的最高点，画在对数波长轴上：不同温度的曲线形状完全一样，只是左右平移。下图横轴是温度 T（K），纵轴是峰值波长（μm，1 μm = 1000 nm），两条轴都是对数刻度，所以反比关系画出来是一条向右下的直线；彩色横带是可见光的波长范围。橙线是公式 b/T，白点是直接在光谱上用数值方法找最高点的结果，两者独立计算。',
    s2lgNow: '当前温度', s2lgHist: '试过的温度', s2lgCurve: '维恩公式 b/T', s2lgDot: '数值找到的峰',
    clearTrail: '清除记录',
    c2a: '光谱 ÷ 自己的最高点（横轴：波长，对数）', c2b: '峰值波长 λ峰 随温度 T（双对数）',
    s2readout: 'T = {T} K：在光谱上数值找到的峰 λ = {num}；维恩公式 b/T = {wien}，两者相对差 {err}。λ峰 × T = {prod} mm·K，换任何温度都是这个数。已记录 {n} 个温度。',
    s2hint: '观察顺序：依次点五个预设按钮，每点一次，上图多一条灰色曲线、下图多一个白点。看上图：五条曲线一模一样，只是挪了位置；看下图：白点全部落在橙色直线上，五个预设里只有太阳那一点落在彩色横带里。人体那条峰在 10 μm 附近，是可见光最长波长（0.75 μm）的 12 倍以上，这就是热像仪要工作在红外的原因。',
    quizPrompt: '小测：人体表面约 310 K（37 °C）。它辐射最强的波长大约在哪？',
    quizA: '约 0.5 μm，在可见光里，只是太暗看不见',
    quizB: '约 9 μm，在中红外，热像仪看的就是这一段',
    quizC: '约 0.3 mm，已经是微波',
    check: '核对', correct: '对。b/T = 2.898 mm·K ÷ 310 K ≈ 9.3 μm，是可见光最长波长的 12 倍以上。', wrong: '再算一次：λ峰 = b/T = 2.898 mm·K ÷ 310 K。也可以把温度拖到 310 K 附近看读数。',

    s3k: '第 3 步 · 曲线下的面积',
    s3t: '温度翻一倍，每秒辐射出去的总能量变成几倍？',
    s3e: '这一步要回答：热物体向外散热有多快？每平方米每秒辐射的总能量 M总 就是第 1 步曲线下的面积。把它对全部波长加起来，得到<strong>斯特藩–玻尔兹曼定律</strong>：M总 = σT⁴，σ ≈ 5.67 × 10⁻⁸ W/(m²·K⁴)。为什么是 4 次方？温度翻倍时，曲线最高点变为 2⁵ = 32 倍，而曲线横向宽度减半（峰向短波收拢），面积 ≈ 高 × 宽，变成 32 ÷ 2 = 16 = 2⁴ 倍。上图两条轴都是对数刻度（每一大格大 10 倍），于是 σT⁴ 变成一条直线：温度乘 10，功率乘 10⁴。白点是把光谱切成几千个小段逐段相加（<strong>数值积分</strong>）得到的面积，不用这条公式。下图青色是温度 T 的光谱，粉色是 2T 的光谱，纵轴以粉色曲线的最高点为 1。',
    sweep3: '从 200 K 扫到 5000 K',
    s3lgLaw: '公式 σT⁴', s3lgDot: '数值积分得到的面积', s3lgT: '温度 T 的光谱', s3lg2T: '温度 2T 的光谱',
    c3a: '总辐射功率 M总（W/m²）随温度 T（K），双对数', c3b: '光谱：T 与 2T（横轴 μm，2T 峰值 = 1）',
    s3readout: '{prog}T = {T} K：公式 σT⁴ = {law}；数值积分 = {num}，相对差 {err}。温度翻到 {T2} K，总辐射变为 {law2}，是原来的 {ratio} 倍（= 2⁴）。',
    s3progress: '已算 {k}/{N} 个温度。',
    s3hint: '观察顺序：先按「从 200 K 扫到 5000 K」，白点一个个落在橙色直线上，读数给出进度。再手动拖温度：上图粉色折线从 T 横走到 2T、再竖直上升，正好爬了 16 倍；下图青色曲线看起来很矮，因为它的面积只有粉色的 1/16。',

    s4k: '第 4 步 · 经典理论的失败',
    s4t: '1900 年以前的物理学，为什么算不出这条曲线？',
    s4e: '这一步要回答：用当时已知的物理去算光谱，会错在哪里？经典的<strong>瑞利–金斯定律</strong>这样推：热物体内部的电磁场可以按很多种方式振动，每一种叫一个<strong>模式</strong>；波长越短，同样的空间里能塞下的模式越多，每单位波长的模式数 ∝ 1/λ⁴。经典统计说每个模式平均分到 kT 的能量（kT 是温度 T 下热运动的典型能量，<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step1">→ 分子动理论第 1 步：温度就是平均动能的读数</a>）。两者相乘得 M经典 = 2πckT/λ⁴。在长波一端它和普朗克曲线重合；可是 λ 越短它越大、没有上限，把所有波长加起来是无穷大，意味着任何热物体都会瞬间放出无穷多的紫外辐射。这个荒谬的结论叫<strong>紫外灾难</strong>。图的两条轴都是对数刻度（纵轴每一大格差 100 倍）。',
    lamLabel: '波长 λ',
    s4lgP: '普朗克（与实验相符）', s4lgRJ: '经典：瑞利–金斯', s4lgGap: '经典理论多算的部分', s4lgVis: '可见光',
    c4title: '光谱辐出度 kW/(m²·nm) · 横轴：波长 μm · 双对数',
    s4readout: 'T = {T} K，λ = {lam}：经典值 ÷ 普朗克值 = {ratio}。经典理论只在 λ > {valid} 时误差小于 5%。把经典曲线从 λ 一直加到无穷长的波长，已经有 {tail}，是普朗克总量 σT⁴ 的 {mult} 倍；λ 再缩小 10 倍，这个数还要乘 1000。',
    s4hint: '观察顺序：先把波长拖到最右（长波），读数里经典 ÷ 普朗克接近 1，两条线贴在一起；再一路往左拖：粉色直线一直往上，青色曲线过了峰就掉下去，比值涨到成千上万。改温度：两条线一起上下移动，但分叉的位置也跟着移，温度越低，分叉越靠长波。',

    s5k: '第 5 步 · 能量一份一份',
    s5t: '普朗克改了哪一处，让短波一端掉了下来？',
    s5e: '这一步要回答：保留「模式数 ∝ 1/λ⁴」，怎样让短波一端不再爆炸？普朗克只改了每个模式能拿多少能量：频率为 ν 的振动，能量只能是 0、hν、2hν、3hν……整份整份地取，一份 hν = hc/λ 叫一个<strong>能量子</strong>（光的能量子后来叫光子，<a class="xlink" href="../../../physics/modern/photoelectric-effect/#step1">→ 光电效应第 1 步：一个光子把 hν 整份交给一个电子</a>）。热运动分配能量的规律（玻尔兹曼分布）是：拿到 n 份的概率 ∝ e^(−n·x)，其中 x = hν/kT，表示一份能量是热运动典型能量 kT 的几倍。x 很小（长波）时一份很便宜，平均能量回到经典的 kT；x 很大（短波）时连一份都很难拿到，这个模式几乎总是空的，平均能量 = hν/(eˣ − 1) 按指数速度趋于 0。把这个平均能量乘回模式数，就正好得到第 1 步的普朗克定律。',
    s5lgBar: '停在第 n 级的概率', s5lgKT: '热运动典型能量 kT', s5lgQ: '量子：平均能量 ÷ kT', s5lgC: '经典：恒为 1',
    c5a: '能级梯子（纵：能量 ÷ kT，横：概率）', c5b: '平均能量 ÷ kT 随 x = hν/kT（横轴对数）',
    s5readout: 'λ = {lam}、T = {T} K：一份能量 hν = {hv} eV，热运动典型能量 kT = {kT} eV，x = hν/kT = {x}。这个模式至少拿到一份的概率 e⁻ˣ = {p1}；平均能量 = {mean} kT（经典理论说永远是 1 kT）。所以这一波长上的辐射 = 经典值 × {mean}。',
    s5hint: '观察顺序：先固定温度，把波长从右往左拖。上图的横线是这个模式允许的能量（间距就是一份 hν），青色条长 = 停在这一级的概率，橙线是平均能量：长波时梯子很密、概率铺开，橙线贴着 1 kT；短波时梯子间距超过 kT，几乎所有概率都堆在 0 级，橙线沉到底。下图白点沿橙色曲线从 1 跌向 0，经典的粉线却一直停在 1。',

    s6k: '第 6 步 · 收束',
    s6t: '一条曲线，三条定律，一个新想法',
    s6fin: '整页只用了一个理想物体：<strong>黑体</strong>，它发出的光只取决于温度。曲线的峰告诉我们温度（维恩：λ峰 = b/T）；曲线下的面积告诉我们散热有多快（斯特藩–玻尔兹曼：M总 = σT⁴）；曲线在短波端为什么会掉下来，迫使物理学承认能量按 hν 一份一份地交换（普朗克）。',
    formula: 'λ峰 = b/T，b ≈ 2.898 mm·K\nM总 = σT⁴，σ ≈ 5.67 × 10⁻⁸ W/(m²·K⁴)\nM(λ, T) = (2πc/λ⁴) · kT · x/(eˣ − 1)，x = hc/(λkT)',
    boundary: '适用范围：本页是发射率为 1 的理想黑体。真实物体发射率小于 1，而且随波长变化（抛光金属、钨丝都是如此）；恒星光谱上还叠着吸收线。显示颜色由 CIE 1931 配色函数的拟合式算出，亮度被拉齐，屏幕也显示不出真实的亮度差。辐出度是对所有方向求和、按每单位波长计；如果按每单位频率计，峰的位置会不同。',
    linksTitle: '接着去哪儿',
    lk1: '→ 光电效应第 1 步：一个光子把 hν 交给一个电子的能量账本',
    lk2: '→ 分子动理论第 1 步：温度是平均动能的读数，kT 从这里来',
    lk3: '→ 气候能量平衡第 2 步：地球向太空散热多少，决定它的平衡温度',
    lk4: '→ 反比例函数第 2 步：维恩定律 λ峰·T = 常数 的图像',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《黑体辐射 · 热的物体为什么发光》的平行版本。'
  },
  en: {
    pageTitle: 'Blackbody Radiation · Reading Temperature from a Glow',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Blackbody Radiation · Why Hot Things Glow →',
    navLabel: 'Blackbody radiation steps',
    tagline: 'A blacksmith judges the forge by its colour; an astronomer reads a star’s surface temperature from its light. Both rely on one curve: how much energy a hot object radiates at each wavelength. In six steps you will read that curve’s peak, its area and its tail, and see why its tail forced physics to accept that energy comes in lumps.',
    nav0: '0 Colour', nav1: '1 Spectrum', nav2: '2 The peak', nav3: '3 The total', nav4: '4 UV catastrophe', nav5: '5 Lumps', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · LOOK AT THE COLOUR',
    s0t: 'Why does iron go from dull red to white as it heats up?',
    s0e: 'The question here: as an object gets hotter, how does its colour change? Every object constantly radiates electromagnetic waves. <strong>Visible light</strong> is just the band our eyes detect, wavelengths of about 380–750 nm (1 nm is a billionth of a metre); longer waves are <strong>infrared</strong>, shorter ones <strong>ultraviolet</strong>. A <strong>blackbody</strong> is an ideal object that absorbs every bit of light falling on it and reflects none, so the light it gives off depends only on its own temperature. Iron in a forge, a lamp filament and the surface of a star are all close to blackbodies. Temperature is in kelvin (K = °C + 273.15). The top row shows the colour your eye would see (brightness equalised, so only colour is compared), with a strip lining up the colours from 500 to 10 000 K. The bottom row is the <strong>spectrum</strong>: wavelength across (log scale, each major division is ×10), and up the side the strength at that wavelength as a fraction of the highest point. The white dashed line marks the wavelength of strongest emission, the <strong>peak wavelength</strong> λpeak.',
    tempLabel: 'Temperature T', heat: 'Heat it: 500 K → 10 000 K',
    pre_ember: 'Embers {T} K', pre_bulb: 'Bulb filament {T} K', pre_sun: 'Sun’s surface {T} K', pre_sirius: 'Sirius {T} K', pre_body: 'Human body {T} K',
    s0lgVis: 'Visible part (coloured by wavelength)', s0lgIr: 'Infrared part (invisible)', s0lgPeak: 'Peak wavelength λpeak',
    c0a: 'Colour you would see (brightness equalised)', c0b: 'Spectrum ÷ its peak · log wavelength axis',
    whereVis: 'inside the visible band', whereIr: 'in the infrared, invisible to us', whereUv: 'in the ultraviolet, invisible to us',
    s0readout: 'T = {T} K ({C} °C): the strongest emission is at λpeak = {peak}, {where}. Visible light (380–750 nm) carries only {share} of all the radiation — {vis} of visible light from every square metre of surface each second.',
    heatProgress: 'Heating… {T} K',
    s0hint: 'What to watch: press “Heat it” or drag the temperature slowly to the right, and keep an eye on the white dashed line in the bottom row as it marches left, towards short waves. Now watch the coloured visible band. When it is cold, the band is a thin tail on the left of the curve and the eye only gets the red end, so the iron looks dull red. As it heats, the peak moves into the visible band, every colour is present and the glow looks white; hotter still, the blue-violet side wins and it turns bluish white. Finally compare the visible share in the readout at 1000 K and at 5772 K.',

    s1k: 'STEP 1 · THE WHOLE CURVE',
    s1t: 'How much energy does a blackbody radiate at each wavelength?',
    s1e: 'The question here: step 0 showed only the shape — what are the actual amounts? The vertical axis is now <strong>spectral exitance</strong> M(λ, T): the energy leaving one square metre of surface each second within a 1 nm slice of wavelength, in kW/(m²·nm). Wavelength λ runs across in nm, on an ordinary linear scale that stops at 3000 nm. The curve is <strong>Planck’s law</strong>: M = 2πhc²/λ⁵ · 1/(e^(hc/λkT) − 1), where h is Planck’s constant, c the speed of light and k Boltzmann’s constant; step 5 takes it apart. The area under the curve adds up all wavelengths, so it is the total energy radiated per square metre per second.',
    yFixed: 'Fixed axis (compare sizes)', yAuto: 'Axis follows (see the shape)',
    s1lgNow: 'Spectrum at this temperature', s1lgVis: 'Its visible part', s1lgRef: 'Reference: 3000 / 4500 / 6000 K',
    c1title: 'Spectral exitance M, kW/(m²·nm) · wavelength, nm',
    s1readout: 'T = {T} K: the curve peaks at λ = {peak} with height {pv} kW/(m²·nm), {r5} times the 3000 K peak. The total area (including the long-wave part beyond the right edge) is {tot} radiated per square metre, {r4} times the 3000 K value; visible light is {share} of it.',
    s1hint: 'What to watch: keep “Fixed axis” and drag the temperature from 1500 K to 6500 K. The curve grows taller and its top slides left. The two multiples in the readout grow at different rates: the peak height goes as T⁵, the total area as T⁴ (step 3 explains why). Then switch to “Axis follows” to enlarge the cool curves: at 1500 K the top sits near 2000 nm and the visible band only grazes its left edge. The grey dashed curves are 3000, 4500 and 6000 K for reference.',

    s2k: 'STEP 2 · WHERE IS THE PEAK?',
    s2t: 'Where do a person, a filament, the Sun and Sirius each shine brightest?',
    s2e: 'The question here: given a temperature, can you name the peak wavelength at once — and, going the other way, read the temperature off the peak? The answer is <strong>Wien’s displacement law</strong>: λpeak = b / T, where b ≈ 2.898 mm·K is a constant. λpeak is <strong>inversely proportional</strong> to T: their product is fixed, so doubling the temperature halves the peak wavelength (<a class="xlink" href="../../../math/algebra/inverse-proportion/#step2">→ Inverse proportion, step 2: what the graph of two quantities with a fixed product looks like</a>). The top panel divides every spectrum by its own highest point and plots it against a log wavelength axis: curves for different temperatures have exactly the same shape and are just shifted sideways. The bottom panel puts temperature T (K) across and the peak wavelength (μm; 1 μm = 1000 nm) up the side, both on log scales, so the inverse proportion shows up as a straight line sloping down; the faint coloured stripe marks the visible band. The orange line is the formula b/T, and the white dots come from searching each spectrum numerically for its highest point. The two are computed independently.',
    s2lgNow: 'Current temperature', s2lgHist: 'Temperatures you tried', s2lgCurve: 'Wien’s formula b/T', s2lgDot: 'Peak found numerically',
    clearTrail: 'Clear record',
    c2a: 'Spectrum ÷ its own peak · log wavelength axis', c2b: 'Peak wavelength λpeak against temperature T (log–log)',
    s2readout: 'T = {T} K: the numerically located peak is at λ = {num}; Wien’s formula b/T gives {wien}, a relative difference of {err}. λpeak × T = {prod} mm·K, the same at every temperature. {n} temperatures recorded.',
    s2hint: 'What to watch: click the five presets in turn. Each click adds a grey curve on top and a white dot below. Top: the five curves are identical, only shifted. Bottom: every dot lands on the orange line, and of the five presets only the Sun’s dot falls inside the coloured stripe. The body’s peak is near 10 μm, more than 12 times the longest visible wavelength (0.75 μm) — which is why thermal cameras have to work in the infrared.',
    quizPrompt: 'Quick check: human skin is about 310 K (37 °C). Roughly where is its strongest emission?',
    quizA: 'About 0.5 μm — visible, just too dim to notice',
    quizB: 'About 9 μm — mid-infrared, exactly what thermal cameras see',
    quizC: 'About 0.3 mm — already microwaves',
    check: 'Check', correct: 'Right. b/T = 2.898 mm·K ÷ 310 K ≈ 9.3 μm, more than 12 times the longest visible wavelength.', wrong: 'Try the sum again: λpeak = b/T = 2.898 mm·K ÷ 310 K — or drag the slider to about 310 K and read it off.',

    s3k: 'STEP 3 · THE AREA UNDER THE CURVE',
    s3t: 'Double the temperature: how many times more energy goes out each second?',
    s3e: 'The question here: how fast does a hot object lose energy by radiation? The total radiated per square metre per second, M_tot, is the area under the step 1 curve. Adding it up over every wavelength gives the <strong>Stefan–Boltzmann law</strong>: M_tot = σT⁴ with σ ≈ 5.67 × 10⁻⁸ W/(m²·K⁴). Why the fourth power? Double the temperature and the peak gets 2⁵ = 32 times taller while the curve becomes half as wide (it bunches up towards short waves); area ≈ height × width grows 32 ÷ 2 = 16 = 2⁴ times. The top panel uses log scales on both axes (each major division ×10), which turns σT⁴ into a straight line: multiply the temperature by 10 and the power goes up by 10⁴. The white dots are areas found by chopping the spectrum into thousands of thin slices and adding them up (<strong>numerical integration</strong>), without using the formula. Below, cyan is the spectrum at T and pink the spectrum at 2T, scaled so the pink peak is 1.',
    sweep3: 'Sweep 200 K → 5000 K',
    s3lgLaw: 'Formula σT⁴', s3lgDot: 'Area by numerical integration', s3lgT: 'Spectrum at T', s3lg2T: 'Spectrum at 2T',
    c3a: 'Total power M_tot (W/m²) vs T (K), log–log', c3b: 'Spectra at T and 2T · λ in μm · 2T peak = 1',
    s3readout: '{prog}T = {T} K: formula σT⁴ = {law}; numerical integration = {num}, relative difference {err}. At {T2} K the total becomes {law2}, {ratio} times as much (= 2⁴).',
    s3progress: '{k}/{N} temperatures computed. ',
    s3hint: 'What to watch: press “Sweep 200 K → 5000 K” and watch the white dots land one by one on the orange line, with progress in the readout. Then drag the temperature yourself: in the top panel the pink path runs across from T to 2T and then straight up, climbing exactly 16 times. In the bottom panel the cyan curve looks tiny because its area is just 1/16 of the pink one.',

    s4k: 'STEP 4 · WHERE CLASSICAL PHYSICS FAILED',
    s4t: 'Why couldn’t physics before 1900 produce this curve?',
    s4e: 'The question here: if you compute the spectrum with the physics known at the time, where does it go wrong? The classical <strong>Rayleigh–Jeans law</strong> argues like this. The electromagnetic field inside a hot body can vibrate in many different patterns, each called a <strong>mode</strong>; the shorter the wavelength, the more modes fit into the same space, so the number of modes per unit wavelength goes as 1/λ⁴. Classical statistics hands every mode an average energy kT, the typical thermal energy at temperature T (<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step1">→ Kinetic theory, step 1: temperature is a reading of average kinetic energy</a>). Multiply the two and M_classical = 2πckT/λ⁴. At long wavelengths this sits right on Planck’s curve, but as λ shrinks it grows without limit; summed over all wavelengths it is infinite, as if every warm object should instantly pour out unlimited ultraviolet. That absurd prediction is the <strong>ultraviolet catastrophe</strong>. Both axes are logarithmic (each major division on the vertical axis is ×100).',
    lamLabel: 'Wavelength λ',
    s4lgP: 'Planck (matches experiment)', s4lgRJ: 'Classical: Rayleigh–Jeans', s4lgGap: 'Excess predicted classically', s4lgVis: 'Visible band',
    c4title: 'Exitance, kW/(m²·nm) · wavelength, μm · log–log',
    s4readout: 'T = {T} K, λ = {lam}: classical ÷ Planck = {ratio}. The classical law is within 5% only for λ > {valid}. Adding the classical curve from λ out to infinitely long waves already gives {tail}, {mult} times Planck’s total σT⁴ — and every tenfold cut in λ multiplies that by another 1000.',
    s4hint: 'What to watch: drag the wavelength all the way right (long waves): classical ÷ Planck is close to 1 and the two lines touch. Then drag steadily left: the pink line keeps rising, the cyan curve turns over after its peak and falls, and the ratio climbs into the thousands and beyond. Change the temperature: both lines shift up and down, and the point where they part moves too — the cooler the body, the longer the wavelength at which classical physics breaks.',

    s5k: 'STEP 5 · ENERGY IN LUMPS',
    s5t: 'What did Planck change to bring the short-wave end down?',
    s5e: 'The question here: keeping “modes ∝ 1/λ⁴”, how do you stop the short-wave end blowing up? Planck changed only how much energy a mode may hold. A vibration of frequency ν can have energy 0, hν, 2hν, 3hν … — whole lumps only, where one lump hν = hc/λ is called a <strong>quantum</strong> of energy (for light it was later named the photon; <a class="xlink" href="../../../physics/modern/photoelectric-effect/#step1">→ Photoelectric effect, step 1: one photon hands its whole hν to one electron</a>). Thermal motion shares out energy by the Boltzmann rule: the chance of holding n lumps is proportional to e^(−n·x), where x = hν/kT says how many times the typical thermal energy kT one lump costs. When x is small (long waves) a lump is cheap and the average energy returns to the classical kT. When x is large (short waves) even one lump is hard to come by, the mode is nearly always empty, and the average energy hν/(eˣ − 1) falls to zero exponentially. Multiply this average by the number of modes and you get exactly Planck’s law from step 1.',
    s5lgBar: 'Chance of sitting on level n', s5lgKT: 'Typical thermal energy kT', s5lgQ: 'Quantum: average energy ÷ kT', s5lgC: 'Classical: always 1',
    c5a: 'Energy ladder (up: energy/kT, across: chance)', c5b: 'Average energy ÷ kT vs x = hν/kT (log x)',
    s5readout: 'λ = {lam}, T = {T} K: one lump hν = {hv} eV, typical thermal energy kT = {kT} eV, so x = hν/kT = {x}. The chance this mode holds at least one lump, e⁻ˣ, is {p1}; its average energy is {mean} kT (classical physics says always 1 kT). So the radiation at this wavelength is the classical value × {mean}.',
    s5hint: 'What to watch: hold the temperature and drag the wavelength from right to left. In the top panel the horizontal lines are the energies this mode may have (the spacing is one lump hν), each cyan bar is the chance of sitting on that level, and the orange line is the average energy. At long waves the ladder is dense, the chances spread out and the orange line sits at 1 kT; at short waves the rungs are farther apart than kT, almost all the probability piles onto level 0 and the orange line sinks to the floor. Below, the white dot slides down the orange curve from 1 towards 0 while the classical pink line stays at 1.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'One curve, three laws, one new idea',
    s6fin: 'The whole page used one ideal object, the <strong>blackbody</strong>, whose light depends only on its temperature. The curve’s peak tells you the temperature (Wien: λpeak = b/T). The area under it tells you how fast the object sheds energy (Stefan–Boltzmann: M_tot = σT⁴). And explaining why the curve falls at short wavelengths forced physics to accept that energy is exchanged in lumps of hν (Planck).',
    formula: 'λpeak = b/T, b ≈ 2.898 mm·K\nM_tot = σT⁴, σ ≈ 5.67 × 10⁻⁸ W/(m²·K⁴)\nM(λ, T) = (2πc/λ⁴) · kT · x/(eˣ − 1), x = hc/(λkT)',
    boundary: 'Where this holds: the page models an ideal blackbody with emissivity 1. Real objects have emissivity below 1 that also changes with wavelength (polished metals and tungsten filaments both do), and stellar spectra carry absorption lines on top. Display colours are computed from a fitted form of the CIE 1931 colour-matching functions with brightness equalised; a screen cannot show the real brightness differences anyway. Exitance is summed over all directions and given per unit wavelength; per unit frequency the peak lands somewhere else.',
    linksTitle: 'Where to go next',
    lk1: '→ Photoelectric effect, step 1: the energy ledger when one photon gives hν to one electron',
    lk2: '→ Kinetic theory, step 1: temperature as a reading of average kinetic energy — where kT comes from',
    lk3: '→ Climate energy balance, step 2: how much heat Earth sheds to space sets its balance temperature',
    lk4: '→ Inverse proportion, step 2: the graph behind Wien’s λpeak·T = constant',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Blackbody Radiation · Why Hot Things Glow”.'
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
  if (typeof window.refreshBlackbody === 'function') window.refreshBlackbody();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BB_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
