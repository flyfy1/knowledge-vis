'use strict';
// Climate energy ledger lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '气候能量账本 · 一束阳光怎样变成地表温度',
    back: '← 知识索引',
    compare: '对照另一版本：气候能量账本 · 太阳光如何变成温度 →',
    navLabel: '气候能量账本步骤导航',
    tagline: '太阳每秒送到地球的能量是固定的，地表温度却取决于这笔能量怎样记账：摊到多大面积上、被反射掉多少、以红外线的形式又跑掉多少。七步里，我们把一束阳光从大气顶层一路追到地面，记清每一笔收入和支出，最后看清为什么「账本不平」会让地球变暖。',
    nav0: '0 一束光', nav1: '1 摊到全球', nav2: '2 反射', nav3: '3 没有大气', nav4: '4 温室层', nav5: '5 账本失衡', nav6: '6 收束',
    wm2: 'W/m²',

    s0k: '第 0 步 · 入射角',
    s0t: '同样一束阳光，为什么在高纬度地区「更稀」？',
    s0e: '这一步要回答：在大气顶层，正对太阳的每平方米每秒收到约 <strong>1361 焦耳</strong>的能量，记作 <strong>S = 1361 W/m²</strong>（瓦每平方米：每平方米每秒得到的焦耳数，这个量叫<strong>辐照度</strong>）。可地面并不总是正对太阳：同样宽的一束光斜着照下来，会摊在更长的一段地面上，每平方米分到的就少了。<strong>太阳高度角 h</strong> 是太阳光线与地平面的夹角；每平方米水平地面收到 S × sin h，光斑被拉长到原来的 1/sin h 倍。这里取春分日正午：此时太阳直射赤道，纬度 φ 处的太阳高度角 h = 90° − φ。本步不考虑大气的吸收和反射，算的是大气顶层的数值。',
    latSlider: '纬度 φ（度）',
    c0a: '春分正午：同宽的光束照到不同纬度', c0b: '每平方米水平地面收到的辐照度（W/m²）对纬度',
    lbSun: '阳光', lbEquator: '赤道', lbFoot: '光斑', lbRef: '赤道参照',
    s0lgBeam: '选中纬度的光束与光斑', s0lgRef: '赤道处同宽光束（参照）', s0lgCurve: 'S × sin h 曲线',
    s0readout: '纬度 {lat}°：太阳高度角 h = 90° − {lat}° = {h}°；光斑拉长到 {sp} 倍；每平方米水平地面收到 1361 × sin {h}° = {I} W/m²，是赤道的 {pct}%。',
    s0hint: '观察顺序：从 0° 往北拖纬度，看「同宽的光束」图里橙色光束落点沿球面上移、光斑越拉越长，同时辐照度曲线上的圆点下滑。纬度 60° 时光斑正好拉长到 2 倍，每平方米只分到赤道的一半（<a class="xlink" href="../../../earth/climate/atmospheric-circulation/#step0">→ 大气环流页第 0 步：同一束阳光为什么越往高纬越稀</a>）。正午太阳高度随季节怎样变，见 <a class="xlink" href="../../../earth/astronomy/seasons-orbit/#step2">→ 四季页第 2 步：夏天和冬天正午的太阳一样高吗</a>。',

    s1k: '第 1 步 · 摊到全球',
    s1t: '把一整天、整个地球摊平，每平方米平均收到多少？',
    s1e: '这一步要回答：上一步只看正午的一瞬间。要算全球气候，需要的是<strong>全天、全球的平均</strong>：夜里收不到阳光，早晚太阳很低。春分日纬度 φ 处一整天平均下来每平方米收到 (S/π)·cos φ。再对全球求平均时要<strong>按面积加权</strong>：赤道附近的纬度带面积大，极地附近的面积小。图中横轴按面积排布纬度带（每条带的宽度正比于它所占的地表面积），柱高是该带的全天平均辐照度，所以全球平均就是这些柱子的平均高度。结果有一个简单的几何解释：地球拦截阳光的是一个面积 πR² 的圆盘（R 是地球半径），而接收这些能量的是面积 4πR² 的整个球面，所以全球平均正好是 <strong>S/4 ≈ 340 W/m²</strong>。',
    play1: '从赤道向两极逐带加入', all1: '全部加入',
    c1: '纬度带按面积排布：宽度 = 所占地表面积，高度 = 全天平均（W/m²）',
    lbRunning: '已加入部分的平均', lbS4: 'S/4',
    s1lgBar: '已加入的纬度带', s1lgRun: '面积加权的累计平均', s1lgS4: 'S/4 = 340 W/m²',
    s1progress: '已加入 {k}/9 对纬度带（南北半球各一条）· ',
    s1readout: '{prog}最新加入 {a}°–{b}°：全天平均 {q} W/m²，占全球面积 {share}%。累计平均 {run} W/m²；全部加入后 = S/4 = {s4} W/m²。',
    s1hint: '观察顺序：按「从赤道向两极逐带加入」，看柱子从赤道往两极一条条出现：越靠近极地柱子越矮、也越窄（面积小），所以白色累计平均线从 431 W/m² 一路下降，最后正好停在橙色的 S/4 虚线上。春分日南北半球对称，所以每次同时加入南北各一条带。其他日子各纬度的分配不同，但全球平均仍是 S/4（忽略日地距离的微小变化）。',

    s2k: '第 2 步 · 反射',
    s2t: '雪地和海洋，同样的阳光照下来，各留下了多少？',
    s2e: '这一步要回答：照到地球上的 340 W/m² 是不是全部变成热？不是：一部分被直接反射回太空，不参与加热。被反射的比例叫<strong>反照率 α</strong>（0 = 全部吸收，1 = 全部反射）。留下来的是 <strong>(1 − α) × S/4</strong>。不同表面的反照率差别很大，下面的预设是典型值；整个地球（包括云，云贡献了反射的大部分）的平均约为 <strong>0.30</strong>。注意本页的反照率代表整颗行星，不只是地面。',
    alphaSlider: '反照率 α',
    pre_ocean: '海洋 0.06', pre_forest: '森林 0.15', pre_earth: '地球平均 0.30', pre_desert: '沙漠 0.40', pre_snow: '新雪 0.80',
    c2a: '一平方米的收支（箭头宽度正比于能量流）', c2b: '这 340 W/m² 的去向',
    lbIn: '入射 S/4', lbRefl: '反射回太空', lbAbs: '被吸收',
    s2lgIn: '入射', s2lgRefl: '反射', s2lgAbs: '吸收',
    s2readout: 'α = {a}：入射 {inc} W/m²，反射 {refl} W/m²，吸收 {abs} W/m²。',
    s2hint: '观察顺序：依次点五个预设，看箭头的分叉：海洋几乎全部吸收，新雪把大部分阳光直接送回太空。拖 α 时，「去向」条形图里橙色（反射）和绿色（吸收）此消彼长，两者之和始终是 340 W/m²。下一步会看到，吸收的这一份决定了没有大气时的温度。',

    s3k: '第 3 步 · 没有大气',
    s3t: '如果地球没有大气，表面会停在多少度？',
    s3e: '这一步要回答：吸收的能量不会无限积累，地面也在向外散热。任何有温度的物体都会发出<strong>红外辐射</strong>（人眼看不见的长波光），理想情况下每平方米发出 <strong>σT⁴</strong>：T 是<strong>绝对温度</strong>（单位 K，开尔文；0 °C = 273.15 K），σ = 5.67 × 10⁻⁸ W/(m²·K⁴) 叫斯特藩–玻尔兹曼常数（<a class="xlink" href="../../../physics/modern/blackbody-radiation/#step3">→ 黑体辐射页第 3 步：温度翻倍，辐射变成几倍</a>）。温度越高，散热增长得越快（与 T 的四次方成正比）。所以无论从多冷或多热开始，温度都会走向同一个值：吸收 = 发射，这叫<strong>辐射平衡</strong>，解出 T = [(1 − α)S/(4σ)]^(1/4)。这里用 50 m 深的海洋上层代表地表的「热容量」（升高 1 K 要吸收的能量），它决定了走向平衡要多久。',
    alpha3: '反照率 α', t0Slider: '起始温度（K）', run3: '从起始温度出发模拟 10 年', clear3: '清除记录',
    c3a: '地表温度（K）对时间（年）', c3b: '收入与支出（W/m²）对时间（年）',
    lbEq: '平衡', lbInFlux: '吸收（收入）', lbOut: 'σT⁴（支出）',
    s3lgT: '这次的温度', s3lgOld: '之前几次', s3lgEq: '平衡温度', s3lgIn: '收入：吸收的阳光', s3lgOut: '支出：σT⁴',
    s3readout: 'α = {a}：平衡温度 {Te} K（{C} °C），此时 σT⁴ = {out} W/m²，正好等于吸收。{run}',
    s3run: '这次从 {T0} K 出发，第 {t} 年 {T} K，收支差 {N} W/m²；离平衡的差距大约每 {tau} 年缩小到 1/e（约 37%）。',
    s3norun: '按「模拟 10 年」看温度怎样走向平衡。',
    s3hint: '观察顺序：保持 α = 0.30，起始温度设 200 K 按一次模拟，再设 320 K 再按一次：两条温度曲线从两侧收拢到同一条平衡虚线 255 K（约 −18 °C）。下面的收支图里，太冷时支出（σT⁴）小于收入，温度上升；太热时相反。可真实地球的平均地表温度约 288 K（15 °C），比这里高约 33 K——下一步找原因。',

    s4k: '第 4 步 · 温室层',
    s4t: '大气看不见、也不发热，怎样让地面更暖？',
    s4e: '这一步要回答：大气对阳光几乎透明，却会吸收地面发出的红外辐射（主要靠水汽、二氧化碳等<strong>温室气体</strong>）。我们用最简单的模型：地面上方有一层大气，吸收地面红外辐射的比例为 <strong>ε</strong>（0 = 完全透明，1 = 完全吸收），其余直接漏到太空。这层大气自己也有温度，会把吸收的能量重新辐射出去，<strong>一半向上、一半向下</strong>。向下的那一半叫<strong>逆辐射</strong>，它让地面除了阳光之外又多了一份收入，于是地面必须更暖、发出更多红外，账才能平。平衡时地表温度 Ts = [(1 − α)S/(4σ(1 − ε/2))]^(1/4)。取 α = 0.30、ε = 0.78，正好得到约 288 K。',
    epsSlider: '大气的红外吸收比例 ε', alpha4: '反照率 α',
    c4: '单层大气模型的能量流（W/m²，箭头宽度正比于流量）',
    lbSpace: '太空', lbAtm: '大气层', lbGround: '地面', lbSolar: '阳光吸收', lbSurfUp: '地面红外', lbLeak: '直接漏出', lbLayerUp: '大气向上', lbBack: '逆辐射', lbToSpace: '到太空合计',
    s4lgSolar: '吸收的阳光', s4lgIR: '地面红外', s4lgLayer: '大气层的辐射',
    s4readout: 'ε = {e}：地表 {Ts} K（{C} °C），大气层 {Ta} K。地面收入 = 阳光 {abs} + 逆辐射 {back} = {sin} W/m²，地面发出 {up} W/m²。到太空的红外 = 直接漏出 {leak} + 大气向上 {lup} = {olr} W/m²，始终等于吸收的阳光 {abs}。',
    s4hint: '观察顺序：从 0 开始拖 ε，看图中地面红外箭头（橙）越来越宽、逆辐射箭头（紫）也越来越宽，而顶部「到太空合计」的数字一直不变。这就是温室效应的账：大气没有制造能量，它把一部分红外拦下来送回地面，地面要升温到发出更多才能让漏出去的总量仍等于吸收量。ε = 0 时回到上一步的 255 K。',

    s5k: '第 5 步 · 账本失衡',
    s5t: '温室层突然变厚一点，地球是立刻变暖，还是慢慢变暖？',
    s5e: '这一步要回答：从平衡状态（α = 0.30、ε = 0.78、288 K）出发，突然改变 ε 或 α，会发生什么？改变的那一刻温度还没变，于是大气顶层出现<strong>能量失衡</strong> N = 吸收的阳光 − 到太空的红外（正值表示地球在净得到能量）。这份多出来的能量用来给海洋上层加热，温度上升，红外支出随之增加，N 逐渐缩回 0，温度停在新的平衡。本模型没有<strong>反馈</strong>（例如变暖让冰雪融化、反照率下降，或让空气含更多水汽），所以算出的升温偏小（<a class="xlink" href="../../../earth/climate/climate-feedback/#step2">→ 气候反馈页第 2 步：回路怎样把一个小扰动放大或削弱</a>）。',
    dEps: 'ε 的改变量 Δε', dAlpha: 'α 的改变量 Δα', run5: '施加改变，模拟 15 年', clear5: '清除记录',
    c5a: '地表温度（K）对时间（年）', c5b: '大气顶层能量失衡 N（W/m²）对时间（年）',
    s5lgT: '这次的温度', s5lgOld: '之前几次', s5lgN: '能量失衡 N', s5lgEq: '新的平衡温度',
    s5readout: 'Δε = {de}，Δα = {da}：改变瞬间 N = {N0} W/m²；新平衡 {T1} K，比原来{dir} {dT} K；差距约每 {tau} 年缩小到 1/e。{run}',
    s5run: '这次模拟到第 {t} 年：{T} K，N = {N} W/m²。',
    s5norun: '按「施加改变」看温度怎样追上新平衡。',
    warmer: '高', cooler: '低',
    s5hint: '观察顺序：把 Δε 设为 +0.02 按「施加改变」：失衡图里 N 先跳到约 +3.9 W/m²，再慢慢回落到 0；温度图里温度并不跳变，而是沿曲线爬升约 1.2 K。再试 Δα = +0.02（更多反射）：N 变成负值，地球变冷。两条曲线的形状相同：失衡越大，升温越快；失衡消失，升温停止。',

    s6k: '第 6 步 · 收束', s6t: '温度，是让账本收支相等的那个数',
    s6fin: '<strong>第 0 步</strong>：同宽的光束斜照时摊在更长的地面上，每平方米收到 S × sin h。<strong>第 1 步</strong>：按全天、按面积平均，全球每平方米 S/4 ≈ 340 W/m²。<strong>第 2 步</strong>：反照率 α 先拿走一份，剩下 (1 − α)S/4，地球平均约 238 W/m²。<strong>第 3 步</strong>：地面以 σT⁴ 散热，没有大气时平衡在约 255 K。<strong>第 4 步</strong>：一层吸收红外的大气把一半送回地面，平衡地表温度升到约 288 K，而到太空的总量仍等于吸收量。<strong>第 5 步</strong>：改变 ε 或 α 先造成能量失衡，失衡给海洋加热，温度慢慢追上新平衡。',
    formula: '吸收 = (1 − α) · S/4\n无大气：σTe⁴ = (1 − α) · S/4\n单层大气：σTs⁴ · (1 − ε/2) = (1 − α) · S/4\nC · dT/dt = N',
    boundary: '适用范围：零维（全球平均）能量平衡模型。S = 1361 W/m²，忽略日地距离的季节变化；反照率代表整颗行星（含云）；地面按理想黑体发射；单层「灰体」大气对所有红外波长吸收同一比例 ε，对阳光完全透明，且瞬时达到平衡；没有对流、蒸发、云和任何反馈；热容量取 50 m 海洋上层，时间尺度只是量级。ε = 0.78 是为了让模型给出约 288 K 而选的，不是测量值。',
    linksTitle: '接着去哪儿',
    lk1: '→ 黑体辐射 第 3 步：温度翻倍，总辐射功率变成几倍',
    lk2: '→ 大气环流 第 1 步：赤道热、极地冷，空气怎样转起来',
    lk3: '→ 碳循环 第 2 步：每年多排一点碳，大气二氧化碳涨多少',
    lk4: '→ 气候反馈 第 2 步：回路怎样放大或削弱一个小扰动',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《气候能量账本 · 太阳光如何变成温度》的平行版本。'
  },
  en: {
    pageTitle: 'Climate Energy Ledger · From a Beam of Sunlight to Surface Temperature',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Climate Energy Ledger · How Sunlight Becomes Temperature →',
    navLabel: 'Climate energy ledger steps',
    tagline: 'The Sun delivers a fixed amount of energy to Earth every second, yet the surface temperature depends on how that energy is booked: how much area it is spread over, how much is reflected away, and how much escapes again as infrared. In seven steps we follow one beam of sunlight from the top of the atmosphere to the ground, account for every credit and debit, and see why an unbalanced ledger warms the planet.',
    nav0: '0 One beam', nav1: '1 Whole globe', nav2: '2 Reflection', nav3: '3 No air', nav4: '4 Greenhouse layer', nav5: '5 Imbalance', nav6: '6 Wrap-up',
    wm2: 'W/m²',

    s0k: 'Step 0 · Angle of the light',
    s0t: 'Why is the same beam of sunlight “thinner” at high latitudes?',
    s0e: 'The question here: at the top of the atmosphere, each square metre facing the Sun receives about <strong>1361 joules</strong> every second, written <strong>S = 1361 W/m²</strong> (watts per square metre: joules per second per square metre, a quantity called <strong>irradiance</strong>). But the ground is not always facing the Sun: a beam of the same width arriving at a slant is spread over a longer stretch of ground, so each square metre gets less. The <strong>solar elevation h</strong> is the angle between the sunlight and the horizontal ground; each square metre of level ground receives S × sin h, and the footprint is stretched to 1/sin h times the beam width. We take noon at the equinox, when the Sun is overhead at the equator, so at latitude φ the elevation is h = 90° − φ. This step ignores absorption and reflection by the air: the values are for the top of the atmosphere.',
    latSlider: 'Latitude φ (degrees)',
    c0a: 'Equinox noon: beams of the same width at different latitudes', c0b: 'Irradiance on each square metre of level ground (W/m²) vs latitude',
    lbSun: 'Sunlight', lbEquator: 'Equator', lbFoot: 'Footprint', lbRef: 'Equator reference',
    s0lgBeam: 'Beam and footprint at the chosen latitude', s0lgRef: 'Same-width beam at the equator (reference)', s0lgCurve: 'S × sin h curve',
    s0readout: 'Latitude {lat}°: solar elevation h = 90° − {lat}° = {h}°; the footprint is stretched {sp}×; each square metre of level ground receives 1361 × sin {h}° = {I} W/m², {pct}% of the equator’s.',
    s0hint: 'What to try: drag the latitude up from 0° and watch, in the beam diagram, the orange beam’s landing point climb the globe while its footprint stretches, and the dot on the irradiance curve slide down. At 60° the footprint is exactly twice as long and each square metre gets half the equator’s share (<a class="xlink" href="../../../earth/climate/atmospheric-circulation/#step0">→ Atmospheric circulation, step 0: why the same beam gets thinner towards the poles</a>). For how the noon Sun’s height changes with the seasons, see <a class="xlink" href="../../../earth/astronomy/seasons-orbit/#step2">→ Seasons, step 2: is the noon Sun as high in summer as in winter?</a>',

    s1k: 'Step 1 · Over the whole globe',
    s1t: 'Spread over a whole day and the whole Earth, how much does each square metre get on average?',
    s1e: 'The question here: the last step looked at a single noon moment. For the global climate we need the <strong>average over the whole day and the whole globe</strong>: no sunlight at night, a low Sun in the morning and evening. At the equinox, the 24-hour average at latitude φ is (S/π)·cos φ per square metre. Averaging over the globe has to be <strong>weighted by area</strong>: latitude bands near the equator are large, those near the poles small. In the chart the bands are laid out by area (each band’s width is proportional to the share of Earth’s surface it covers) and each bar’s height is that band’s daily average, so the global average is simply the bars’ average height. The answer has a neat geometric reading: Earth intercepts sunlight with a disc of area πR² (R is Earth’s radius) but spreads it over a whole sphere of area 4πR², so the global average is exactly <strong>S/4 ≈ 340 W/m²</strong>.',
    play1: 'Add bands from the equator to the poles', all1: 'Add all',
    c1: 'Bands by area: width = surface share, height = daily mean (W/m²)',
    lbRunning: 'Mean of bands so far', lbS4: 'S/4',
    s1lgBar: 'Bands added', s1lgRun: 'Area-weighted running mean', s1lgS4: 'S/4 = 340 W/m²',
    s1progress: '{k}/9 pairs of bands added (one in each hemisphere) · ',
    s1readout: '{prog}Latest band {a}°–{b}°: daily mean {q} W/m², {share}% of Earth’s surface. Running mean {run} W/m²; with every band in, it is S/4 = {s4} W/m².',
    s1hint: 'What to try: press “Add bands from the equator to the poles” and watch the bars appear one by one from the equator outwards. Towards the poles the bars get both shorter and narrower (smaller area), so the white running mean falls from 431 W/m² and comes to rest exactly on the orange S/4 line. At the equinox the hemispheres mirror each other, so each step adds one band in the north and one in the south. On other days the share of each latitude differs, but the global mean is still S/4 (ignoring the small change in Earth–Sun distance).',

    s2k: 'Step 2 · Reflection',
    s2t: 'Under the same sunshine, how much do snow and ocean keep?',
    s2e: 'The question here: does all of the 340 W/m² reaching Earth turn into heat? No: part of it is reflected straight back to space and never warms anything. The fraction reflected is the <strong>albedo α</strong> (0 = everything absorbed, 1 = everything reflected). What stays is <strong>(1 − α) × S/4</strong>. Albedo varies a lot between surfaces; the presets below are typical values. For Earth as a whole (clouds included, and they do most of the reflecting) the average is about <strong>0.30</strong>. On this page the albedo stands for the whole planet, not just the ground.',
    alphaSlider: 'Albedo α',
    pre_ocean: 'Ocean 0.06', pre_forest: 'Forest 0.15', pre_earth: 'Earth average 0.30', pre_desert: 'Desert 0.40', pre_snow: 'Fresh snow 0.80',
    c2a: 'One square metre’s budget (arrow width ∝ energy flow)', c2b: 'Where the 340 W/m² goes',
    lbIn: 'Incoming S/4', lbRefl: 'Reflected to space', lbAbs: 'Absorbed',
    s2lgIn: 'Incoming', s2lgRefl: 'Reflected', s2lgAbs: 'Absorbed',
    s2readout: 'α = {a}: incoming {inc} W/m², reflected {refl} W/m², absorbed {abs} W/m².',
    s2hint: 'What to try: press the five presets in turn and watch the arrows split: the ocean absorbs almost everything, fresh snow sends most of the sunlight straight back to space. As you drag α, the orange (reflected) and green (absorbed) parts of the “where it goes” bar trade places, always adding up to 340 W/m². The next step shows that the absorbed share sets the temperature a planet would have without air.',

    s3k: 'Step 3 · No atmosphere',
    s3t: 'If Earth had no atmosphere, at what temperature would the surface settle?',
    s3e: 'The question here: absorbed energy cannot pile up for ever, because the ground also sheds heat. Anything with a temperature gives off <strong>infrared radiation</strong> (long-wave light our eyes cannot see), ideally <strong>σT⁴</strong> per square metre: T is the <strong>absolute temperature</strong> in kelvin (K; 0 °C = 273.15 K) and σ = 5.67 × 10⁻⁸ W/(m²·K⁴) is the Stefan–Boltzmann constant (<a class="xlink" href="../../../physics/modern/blackbody-radiation/#step3">→ Blackbody radiation, step 3: double the temperature, how many times the power?</a>). The hotter it is, the faster the heat loss grows (as the fourth power of T). So wherever it starts, hot or cold, the temperature heads for one value where absorbed = emitted, called <strong>radiative balance</strong>: T = [(1 − α)S/(4σ)]^(1/4). The top 50 m of ocean stands in for the surface’s “heat capacity” (the energy needed to warm it by 1 K), which sets how long the approach takes.',
    alpha3: 'Albedo α', t0Slider: 'Starting temperature (K)', run3: 'Simulate 10 years from the starting temperature', clear3: 'Clear runs',
    c3a: 'Surface temperature (K) vs time (years)', c3b: 'Income and spending (W/m²) vs time (years)',
    lbEq: 'balance', lbInFlux: 'absorbed (income)', lbOut: 'σT⁴ (spending)',
    s3lgT: 'This run', s3lgOld: 'Earlier runs', s3lgEq: 'Balance temperature', s3lgIn: 'Income: absorbed sunlight', s3lgOut: 'Spending: σT⁴',
    s3readout: 'α = {a}: balance at {Te} K ({C} °C), where σT⁴ = {out} W/m², exactly the absorbed amount. {run}',
    s3run: 'This run started at {T0} K; at year {t} it is {T} K with a budget gap of {N} W/m². The distance from balance shrinks to 1/e (about 37%) roughly every {tau} years.',
    s3norun: 'Press “Simulate 10 years” to watch the temperature head for balance.',
    s3hint: 'What to try: keep α = 0.30, set the start to 200 K and run once, then set 320 K and run again. The two temperature curves close in from either side on the same dashed balance line at 255 K (about −18 °C). In the income-and-spending plot, a too-cold surface spends (σT⁴) less than it earns and warms; a too-hot one does the reverse. Yet Earth’s real average surface temperature is about 288 K (15 °C), some 33 K warmer. The next step finds out why.',

    s4k: 'Step 4 · Greenhouse layer',
    s4t: 'The air is invisible and makes no heat of its own. How can it warm the ground?',
    s4e: 'The question here: the air is almost transparent to sunlight but absorbs the infrared coming up from the ground (mostly through water vapour, carbon dioxide and other <strong>greenhouse gases</strong>). The simplest model: one layer of air above the ground absorbs a fraction <strong>ε</strong> of the ground’s infrared (0 = fully transparent, 1 = absorbs everything) and lets the rest leak straight to space. The layer has a temperature of its own and radiates what it absorbs, <strong>half upward and half downward</strong>. The downward half, the <strong>back radiation</strong>, gives the ground a second income besides sunlight, so the ground has to be warmer and emit more infrared before the books balance. In balance the surface temperature is Ts = [(1 − α)S/(4σ(1 − ε/2))]^(1/4). With α = 0.30 and ε = 0.78 it comes out at about 288 K.',
    epsSlider: 'Fraction of infrared absorbed by the air, ε', alpha4: 'Albedo α',
    c4: 'Energy flows in the one-layer model (W/m², arrow width ∝ flow)',
    lbSpace: 'Space', lbAtm: 'Air layer', lbGround: 'Ground', lbSolar: 'Sunlight absorbed', lbSurfUp: 'Ground infrared', lbLeak: 'Leaks out', lbLayerUp: 'Layer upward', lbBack: 'Back radiation', lbToSpace: 'Total to space',
    s4lgSolar: 'Absorbed sunlight', s4lgIR: 'Ground infrared', s4lgLayer: 'Radiation from the layer',
    s4readout: 'ε = {e}: surface {Ts} K ({C} °C), air layer {Ta} K. Ground income = sunlight {abs} + back radiation {back} = {sin} W/m²; the ground emits {up} W/m². Infrared to space = leak {leak} + layer upward {lup} = {olr} W/m², always equal to the absorbed sunlight, {abs}.',
    s4hint: 'What to try: drag ε up from 0. The ground-infrared arrow (orange) and the back-radiation arrow (violet) both get wider, while the “total to space” number at the top never moves. That is the greenhouse ledger: the air creates no energy; it catches some infrared and sends it back down, and the ground must warm until it emits enough that what still escapes equals what is absorbed. At ε = 0 you are back at the 255 K of the previous step.',

    s5k: 'Step 5 · An unbalanced ledger',
    s5t: 'If the greenhouse layer suddenly thickens a little, does Earth warm at once or slowly?',
    s5e: 'The question here: starting from balance (α = 0.30, ε = 0.78, 288 K), what happens if ε or α suddenly changes? At that instant the temperature has not moved yet, so an <strong>energy imbalance</strong> appears at the top of the atmosphere: N = absorbed sunlight − infrared to space (positive means Earth is gaining energy). That surplus heats the upper ocean, the temperature climbs, the infrared spending rises with it, and N shrinks back to zero as the temperature settles at a new balance. This model has no <strong>feedbacks</strong> (warming melting ice and lowering the albedo, say, or letting the air hold more water vapour), so the warming it gives is too small (<a class="xlink" href="../../../earth/climate/climate-feedback/#step2">→ Climate feedback, step 2: how a loop amplifies or damps a small push</a>).',
    dEps: 'Change in ε, Δε', dAlpha: 'Change in α, Δα', run5: 'Apply the change, simulate 15 years', clear5: 'Clear runs',
    c5a: 'Surface temperature (K) vs time (years)', c5b: 'Top-of-atmosphere imbalance N (W/m²) vs time (years)',
    s5lgT: 'This run', s5lgOld: 'Earlier runs', s5lgN: 'Energy imbalance N', s5lgEq: 'New balance temperature',
    s5readout: 'Δε = {de}, Δα = {da}: at the moment of the change N = {N0} W/m²; new balance {T1} K, {dT} K {dir} than before; the gap shrinks to 1/e roughly every {tau} years. {run}',
    s5run: 'This run at year {t}: {T} K, N = {N} W/m².',
    s5norun: 'Press “Apply the change” to watch the temperature catch up with the new balance.',
    warmer: 'warmer', cooler: 'cooler',
    s5hint: 'What to try: set Δε to +0.02 and press “Apply the change”. In the imbalance plot N jumps to about +3.9 W/m² and then eases back to 0; in the temperature plot the temperature does not jump but climbs along a curve by about 1.2 K. Then try Δα = +0.02 (more reflection): N goes negative and Earth cools. Both curves have the same shape: the bigger the imbalance, the faster the warming; when the imbalance is gone, the warming stops.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Temperature is the number that makes the ledger balance',
    s6fin: '<strong>Step 0</strong>: a slanting beam of the same width covers more ground, so each square metre gets S × sin h. <strong>Step 1</strong>: averaged over the day and by area, the globe gets S/4 ≈ 340 W/m² per square metre. <strong>Step 2</strong>: the albedo α takes its cut first, leaving (1 − α)S/4, about 238 W/m² for Earth. <strong>Step 3</strong>: the ground sheds heat as σT⁴ and without air would settle near 255 K. <strong>Step 4</strong>: an infrared-absorbing layer sends half of what it catches back down, lifting the balanced surface temperature to about 288 K while the total to space still equals the absorbed sunlight. <strong>Step 5</strong>: changing ε or α first opens an energy imbalance; the surplus heats the ocean and the temperature slowly catches up with the new balance.',
    formula: 'absorbed = (1 − α) · S/4\nno air: σTe⁴ = (1 − α) · S/4\none layer: σTs⁴ · (1 − ε/2) = (1 − α) · S/4\nC · dT/dt = N',
    boundary: 'Scope: a zero-dimensional (global-average) energy balance model. S = 1361 W/m², ignoring the seasonal change in Earth–Sun distance; the albedo stands for the whole planet (clouds included); the ground emits as an ideal blackbody; the single “grey” layer absorbs the same fraction ε at every infrared wavelength, is fully transparent to sunlight and reaches balance instantly; no convection, evaporation, clouds or feedbacks of any kind; the heat capacity is a 50 m ocean layer, so the time scales are only orders of magnitude. ε = 0.78 was chosen to make the model give about 288 K; it is not a measurement.',
    linksTitle: 'Where to go next',
    lk1: '→ Blackbody radiation, step 3: double the temperature, how many times the power',
    lk2: '→ Atmospheric circulation, step 1: hot equator, cold poles, how the air starts to turn',
    lk3: '→ Carbon cycle, step 2: add a little carbon each year, how much does CO₂ rise',
    lk4: '→ Climate feedback, step 2: how a loop amplifies or damps a small push',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Climate Energy Ledger · How Sunlight Becomes Temperature”.'
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
