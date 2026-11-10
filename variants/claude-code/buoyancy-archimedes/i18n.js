'use strict';
// Buoyancy lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '浮力与阿基米德 · 水托起的，正是被挤走的那份重量',
    back: '← 知识索引',
    compare: '对照另一版本：浮力与阿基米德 →',
    navLabel: '浮力步骤导航',
    tagline: '把一块铝挂在弹簧秤下慢慢放进水里，读数会变小。少掉的那部分力从哪里来、有多大、由什么决定？七步里你先找到它的来源——水在上下两个面上的压力差，再验证阿基米德原理，然后用它解释浮沉、钢船和密度计。',
    nav0: '0 读数变小', nav1: '1 上下压力差', nav2: '2 溢水杯', nav3: '3 浮沉', nav4: '4 钢船', nav5: '5 密度计', nav6: '6 收束',
    clearTrail: '清除轨迹', clearRecords: '清空记录',

    s0k: '第 0 步 · 读数变小了',
    s0t: '铝块浸进水里，弹簧秤的读数为什么变小？',
    s0e: '这一步要回答：同一块铝，在空气里和在水里称，读数为什么不一样？铝块长 5 cm、宽 5 cm、高 8 cm，体积 200 cm³，质量 540 g，所受<strong>重力</strong> W = mg = 0.54 kg × 9.8 N/kg ≈ 5.29 N（本页 g 取 9.8 N/kg）。<strong>弹簧秤读数</strong>是弹簧向上拉住铝块的力。铝块静止时，向上的力合起来必须等于向下的重力。浸进水里以后读数变小，说明水也在向上托它，这个托力叫<strong>浮力</strong>，F<sub>浮</sub> = W − 读数。滑杆控制铝块底面在水面下的深度。',
    s0lgW: '重力 W（不变）', s0lgRead: '弹簧秤读数', s0lgFb: '浮力 = W − 读数',
    z0Slider: '铝块底面在水面下的深度（cm）',
    sweep0: '慢慢放下去',
    c0scene: '弹簧秤吊着铝块，放进水里',
    c0plot: '力（N）— 底面深度（cm）',
    s0readout: '底面在水下 {z} cm，浸在水里的高度 {hs} cm（共 8 cm）：读数 {read} N，比空气中的 {W} N 少了 {Fb} N——这就是浮力。{state}',
    s0part: '铝块还没全部浸没，再往下放，读数还会变小。',
    s0full: '铝块已经全部浸没：再往下放，读数不再变化。',
    s0hint: '观察顺序：按「慢慢放下去」，看下图的三条线怎样被画出来：白线（重力）始终水平，青线（读数）先一路下降，铝块刚好全部没入水中（8 cm）以后变成水平；橙线（浮力）正好与青线对称地上升，再变平。也就是说：浮力随浸入的部分变大，全部浸没以后就和深度无关了。下一步找它的来源。',

    s1k: '第 1 步 · 水从哪里推',
    s1t: '水是怎样把铝块往上托的？为什么浸没以后再往深处放，浮力不变？',
    s1e: '这一步要回答：浮力是怎么来的。水对浸在里面的每个面都有压力，方向垂直压向这个面；越深的地方<strong>压强</strong>（每平方米面积上受的压力）越大：p = ρgh，ρ 是水的密度 1000 kg/m³，h 是这个位置在水面下的深度（<a class="xlink" href="../../../physics/matter/pressure/#step2">压强页第 2 步：水越深压得越重</a>）。铝块左右两个侧面在同一深度受到的压强一样，压力大小相等、方向相反，互相抵消（灰色）。上表面被往下压，下表面被往上推，而下表面更深，所以向上的力更大。两者之差就是浮力。本页的压强都只算水造成的那部分，大气压同时压在水面和秤上，互相抵消。',
    s1lgTop: '水压上表面的力（向下）', s1lgBot: '水推下表面的力（向上）', s1lgNet: '两者之差 = 浮力', s1lgSide: '侧面的力（左右抵消）',
    z1Slider: '底面在水面下的深度（cm）',
    c1scene: '铝块各个面受到的水的压力',
    c1plot: '力（N）— 底面深度（cm）',
    s1readout: '底面深 {z} cm：下表面受向上的力 {Fbot} N，上表面受向下的力 {Ftop} N，相差 {net} N。第 0 步用弹簧秤量出的浮力也是 {Fb} N。',
    s1hint: '观察顺序：把滑杆从 0 拖到 20 cm。铝块露出水面时，上表面不受水的压力（粉线贴着 0），只有青线在升。全部浸没（8 cm）以后两条线都在上升，而且上升得一样快，所以它们的差（橙线）不再变：再深的地方，上下两面多受的压力同样多。浮力不变不是因为水「托不动了」，而是上下两个面的压力一起变大。',

    s2k: '第 2 步 · 溢水杯',
    s2t: '浮力有多大？跟物体有多重有关系吗？',
    s2e: '这一步要回答：浮力的大小等于什么。把一个装满水、水面恰好齐到溢水口的<strong>溢水杯</strong>放好，把物体完全浸没进去，被物体占去位置的水会从溢水口流进旁边的小烧杯，这部分水叫<strong>排开的水</strong>。分别称两样东西：物体在空气中和在水中时弹簧秤读数之差（浮力），以及流进小烧杯的水受的重力。选一种材料、拖动体积，每次都会在下图记一个点。',
    V2Slider: '物体体积（cm³）',
    c2scene: '溢水杯：被挤出去的水流进小烧杯',
    c2plot: '浮力（N）— 物体体积（cm³）',
    matAl: '铝', matIron: '铁', matCopper: '铜', matStone: '石块',
    s2lgLine: '排开的水受的重力', s2lgPts: '每个点：一次测量的浮力（颜色 = 材料）',
    s2readout: '{mat} {V} cm³：空气中 {W} N，浸没后读数 {read} N，浮力 {Fb} N；流进小烧杯的水 {sm} g，受重力 {sw} N。两者相等。',
    s2hint: '观察顺序：先只选铝，把体积从 50 拖到 400，点排成一条过原点的直线；再换成铁、铜、石块重复。铁块比同样大的铝块重了将近 3 倍，可它的点落在同一条线上：浮力只看排开了多少水，跟物体本身多重、是什么做的无关。这就是<strong>阿基米德原理</strong>：浸在液体里的物体受到向上的浮力，大小等于它排开的液体受到的重力，F<sub>浮</sub> = ρ<sub>液</sub> g V<sub>排</sub>。',

    s3k: '第 3 步 · 松手以后',
    s3t: '松开手，物体是浮、是沉，还是停在水中间？',
    s3e: '这一步要回答：松手后谁赢——重力还是浮力？体积都是 200 cm³，只改物体的<strong>密度</strong>（每立方厘米的质量，g/cm³）和液体。重力 W = ρ<sub>物</sub>gV，全部浸没时浮力最大 F<sub>最大</sub> = ρ<sub>液</sub>gV，两者的 V、g 一样，所以只要比较两个密度。ρ<sub>物</sub> &lt; ρ<sub>液</sub>：浮力最大时比重力大，物体上浮，露出水面一部分，直到浸在液体中的那部分排开的液体正好和它一样重，这叫<strong>漂浮</strong>；浸入的比例 = ρ<sub>物</sub> / ρ<sub>液</sub>。ρ<sub>物</sub> = ρ<sub>液</sub>：哪里都能停，叫<strong>悬浮</strong>。ρ<sub>物</sub> &gt; ρ<sub>液</sub>：沉到底，杯底补上差的那部分<strong>支持力</strong>。',
    liqOil: '植物油 0.92', liqWater: '清水 1.00', liqBrine: '浓盐水 1.10',
    r3Slider: '物体密度 ρ物（g/cm³）',
    c3scene: '松手以后停在哪里',
    c3bars: '三个力（N）',
    barW: 'W', barFb: 'F浮', barN: 'N',
    c3plot: '浸在液体里的比例 — 物体密度（g/cm³）',
    s3lgW: '重力 W', s3lgFb: '浮力', s3lgN: '杯底支持力', s3lgTrail: '试过的密度（颜色 = 液体）',
    s3float: '在{liq}里：ρ物 = {ro} 小于 ρ液 = {rl}，漂浮。浸在液体里的部分占 {pct}%（= {ro} ÷ {rl}），浮力 {Fb} N 恰好等于重力 {W} N。',
    s3hover: '在{liq}里：ρ物 = ρ液 = {rl}，悬浮。全部浸没，浮力 {Fb} N 等于重力 {W} N，停在哪里都平衡。',
    s3sink: '在{liq}里：ρ物 = {ro} 大于 ρ液 = {rl}，下沉。全部浸没时浮力最大也只有 {Fb} N，比重力 {W} N 少 {N} N，由杯底的支持力补上。',
    s3hint: '观察顺序：在清水里把密度从 0.2 慢慢拖到 3，看下图的点：先沿斜线上升（浸入比例 = ρ物 / ρ液），到 1.00 时碰到 100%，之后一直贴在 100%，同时绿色的支持力柱出现。再换浓盐水和植物油：斜线变缓或变陡，拐点跟着移到 1.10 或 0.92。密度 1.05 的物体在清水里沉、在浓盐水里浮——鸡蛋在盐水里浮起来就是这个道理。',

    s4k: '第 4 步 · 钢船',
    s4t: '钢的密度是水的 7.9 倍，钢做的船为什么能浮？',
    s4e: '这一步要回答：同一块钢，为什么揉成一团会沉，做成船就能浮。一块 600 g 的钢板，揉成实心一团体积只有约 76 cm³，全部浸没也只排开约 76 g 水，浮力远小于重力，沉。把它做成底面 20 cm × 10 cm、高 H 的敞口船，船能压进水里的体积变成 200 cm² × H，最多能排开很多水。船漂浮时排开的水和船（加货物）一样重，所以吃水深度 = 总质量 ÷（水的密度 × 底面积）。整条船的<strong>平均密度</strong> = 总质量 ÷ 船壳围出的总体积；它小于水的密度时才能浮。货物太多，吃水超过船高，水就从船舷灌进去。',
    H4Slider: '船舷高度 H（cm）', m4Slider: '装的货物（g）',
    c4scene: '船的侧面：吃水深度与船舷',
    c4plot: '吃水深度（cm）— 货物质量（g）',
    s4lgLine: '吃水深度随货物的变化（到船舷为止）', s4lgTrail: '试过的货物', s4lgSink: '超过船舷：进水沉没',
    s4float: 'H = {H} cm，货物 {c} g：总质量 {m} g，吃水 {d} cm，离船舷还有 {fb} cm；平均密度 {avg} g/cm³，小于水，漂浮。这条船最多再装 {left} g。同样 600 g 钢揉成一团：体积约 {lv} cm³，浮力 {lf} N，重力 {lw} N，会沉。',
    s4sink: 'H = {H} cm，货物 {c} g：总质量 {m} g，需要吃水 {d} cm，超过船舷 {H} cm，水从船舷灌进去，船沉了。平均密度 {avg} g/cm³，大于水。这个船高最多只能装 {max} g。',
    s4none: 'H = {H} cm：空船吃水就有 {d} cm，船舷不够高，什么都装不了。',
    s4hint: '观察顺序：保持船高 5 cm，把货物从 0 往右拖，看船越压越深、下图的点沿直线上升；碰到船舷那条虚线（400 g 货物）以后再加，船就沉了。再把船高调到 8 cm：直线不变，船舷升高，能装的货物多到 1000 g。船高 3 cm 时，空船吃水就到了船舷。',

    s5k: '第 5 步 · 密度计',
    s5t: '一根会漂浮的玻璃管，怎么读出液体的密度？',
    s5e: '这一步要回答：漂浮能拿来做什么测量。<strong>密度计</strong>是一根下端装重物的玻璃泡加细管，质量 18 g，玻璃泡体积 14 cm³，细管截面积 0.5 cm²。它放进任何比它「轻」的液体里都会漂浮，漂浮时排开的液体质量正好等于 18 g，所以排开的体积 = 18 g ÷ ρ<sub>液</sub>。液体越稠密，需要排开的体积越小，密度计浮得越高；液面在细管上的位置就能刻成密度读数。',
    r5Slider: '液体密度 ρ液（g/cm³）',
    c5scene: '密度计漂在液体里',
    c5scale: '细管上的刻度（cm）',
    s5readout: 'ρ液 = {r} g/cm³：排开 {Vs} cm³ 液体（= 18 ÷ {r}），液面在玻璃泡上方 {h} cm 处。刻度 0.8 到 0.9 相隔 {g1} cm，1.1 到 1.2 只相隔 {g2} cm。',
    s5hint: '观察顺序：把密度从 0.80 拖到 1.20，看密度计上浮。注意右边刻度条：数值越大的刻度越挤，而且大数在下、小数在上。原因是排开的体积 18 ÷ ρ 与密度成反比，不是一次函数：密度每增加 0.1，在稀的液体里浮起得多，在稠的液体里浮起得少。',

    s6k: '第 6 步 · 收束',
    s6t: '一句话说清浮力',
    s6fin: '浮力来自液体对物体上下两个面的压力差：下表面更深、压强更大。把这个差算出来，正好等于物体排开的液体受到的重力——这就是<strong>阿基米德原理</strong>，F<sub>浮</sub> = ρ<sub>液</sub>gV<sub>排</sub>。它只看排开多少、排开的是什么液体，不看物体自己多重。比较重力和最大浮力，就是比较两种密度，于是有了浮、悬、沉；钢船靠增大排开的体积把平均密度降到水以下；密度计反过来，用漂浮的深浅读出液体的密度。',
    formula: 'F浮 = W − 读数 = F下 − F上 = ρ液 g V排\n漂浮：浸入比例 = ρ物 / ρ液\n密度计：V排 = m ÷ ρ液',
    boundary: '适用范围：液体静止、不可压缩；物体是刚体、实心均匀（钢船算平均密度），不考虑表面张力；g 取 9.8 N/kg；压强只计液体造成的部分（大气压抵消）。动画只表示最后停在哪里，真实的浮沉会上下晃动几次、受水的阻力；钢船模型是长方体敞口壳，忽略钢板本身的体积，不考虑倾覆和波浪。',
    linksTitle: '站内相关',
    lk1: '→ 压强第 2 步：水越深压强越大——浮力的来源',
    lk2: '→ 密度（Claude Code 版）第 5 步：密度塔——不同液体、不同物体按密度排队',
    lk3: '→ 浮与沉第 2 步：同一块橡皮泥，球沉船浮',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《浮力与阿基米德》的平行版本。'
  },
  en: {
    pageTitle: 'Buoyancy & Archimedes · The Water Holds Up Exactly What It Pushed Aside',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Buoyancy & Archimedes →',
    navLabel: 'Buoyancy steps',
    tagline: 'Hang a block of aluminium from a spring scale and lower it into water: the reading drops. Where does the missing force come from, how big is it, and what sets it? In seven steps you first find its source — the difference between the water pushing on the bottom face and on the top face — then check Archimedes’ principle, and use it to explain floating and sinking, steel ships and the hydrometer.',
    nav0: '0 The reading drops', nav1: '1 Top vs bottom', nav2: '2 Overflow can', nav3: '3 Float or sink', nav4: '4 Steel boat', nav5: '5 Hydrometer', nav6: '6 Wrap-up',
    clearTrail: 'Clear trail', clearRecords: 'Clear records',

    s0k: 'Step 0 · The reading drops',
    s0t: 'Why does the spring scale read less once the block is in the water?',
    s0e: 'This step answers: why does the same block weigh differently in air and in water? The block is 5 cm × 5 cm × 8 cm, a volume of 200 cm³, with a mass of 540 g, so its <strong>weight</strong> — the pull of gravity on it — is W = mg = 0.54 kg × 9.8 N/kg ≈ 5.29 N (this page uses g = 9.8 N/kg). The <strong>scale reading</strong> is the force with which the spring holds the block up. When the block hangs still, the upward forces together must equal its weight. If the reading drops in water, the water must be pushing up as well; that upward push is the <strong>buoyant force</strong>, F<sub>b</sub> = W − reading. The slider sets how far the bottom of the block is below the surface.',
    s0lgW: 'weight W (constant)', s0lgRead: 'scale reading', s0lgFb: 'buoyant force = W − reading',
    z0Slider: 'Depth of the block’s bottom below the surface (cm)',
    sweep0: 'Lower it slowly',
    c0scene: 'A spring scale lowers the block into water',
    c0plot: 'Force (N) vs depth of the bottom face (cm)',
    s0readout: 'Bottom {z} cm under water, {hs} cm of the 8 cm block submerged: the scale reads {read} N, {Fb} N less than the {W} N in air — that difference is the buoyant force. {state}',
    s0part: 'The block is not fully under yet; lower it further and the reading keeps falling.',
    s0full: 'The block is fully under water: lowering it further no longer changes the reading.',
    s0hint: 'What to watch: press “Lower it slowly” and see the three lines being drawn. The white line (weight) stays flat; the cyan line (reading) falls until the block is just fully under (8 cm) and then levels off; the orange line (buoyant force) rises as a mirror image and levels off too. So the buoyant force grows with the part that is under water, and once the block is fully submerged it no longer depends on depth. The next step finds out where it comes from.',

    s1k: 'Step 1 · Where the water pushes',
    s1t: 'How does the water push the block up — and why doesn’t going deeper change it once it is under?',
    s1e: 'This step answers: where the buoyant force comes from. Water pushes on every surface it touches, straight into that surface, and the deeper you go the larger the <strong>pressure</strong> (force on each square metre): p = ρgh, where ρ is the density of water, 1000 kg/m³, and h is the depth below the surface (<a class="xlink" href="../../../physics/matter/pressure/#step2">step 2 of the pressure lesson: deeper water presses harder</a>). The left and right sides of the block see the same pressure at each depth, so their forces are equal and opposite and cancel (grey). The top face is pushed down and the bottom face is pushed up, and the bottom is deeper, so the upward push is larger. The difference is the buoyant force. Pressures here count only the water’s share: air pressure acts on the water surface and on the scale alike and cancels out.',
    s1lgTop: 'water pushing down on the top face', s1lgBot: 'water pushing up on the bottom face', s1lgNet: 'difference = buoyant force', s1lgSide: 'side forces (cancel left–right)',
    z1Slider: 'Depth of the bottom face below the surface (cm)',
    c1scene: 'Water pushing on each face of the block',
    c1plot: 'Force (N) vs depth of the bottom face (cm)',
    s1readout: 'Bottom {z} cm deep: the bottom face is pushed up with {Fbot} N, the top face pushed down with {Ftop} N, a difference of {net} N. The spring scale in step 0 measured the same buoyant force, {Fb} N.',
    s1hint: 'What to watch: drag the slider from 0 to 20 cm. While the block sticks out of the water its top face feels no water pressure (the pink line stays on 0) and only the cyan line rises. Once it is fully under (8 cm) both lines rise, and at the same rate, so their difference (orange) stops changing: deeper down, the two faces each gain the same extra push. The buoyant force stays put not because the water “can’t lift any more”, but because the pushes on both faces grow together.',

    s2k: 'Step 2 · The overflow can',
    s2t: 'How big is the buoyant force — and does it depend on how heavy the object is?',
    s2e: 'This step answers: what the buoyant force equals. Fill an <strong>overflow can</strong> until the water is level with its spout, then lower an object until it is fully under. Water that the object pushes out of its way runs out of the spout into a small beaker; that is the <strong>displaced water</strong>. Weigh two things: the drop in the scale reading between air and water (the buoyant force), and the weight of the water in the beaker. Pick a material and drag the volume; every setting adds a point to the lower plot.',
    V2Slider: 'Volume of the object (cm³)',
    c2scene: 'Overflow can: the water pushed out runs into a beaker',
    c2plot: 'Buoyant force (N) vs volume of the object (cm³)',
    matAl: 'aluminium', matIron: 'iron', matCopper: 'copper', matStone: 'stone',
    s2lgLine: 'weight of the displaced water', s2lgPts: 'each dot: one measured buoyant force (colour = material)',
    s2readout: '{mat}, {V} cm³: {W} N in air, {read} N under water, so the buoyant force is {Fb} N; {sm} g of water ran into the beaker, weighing {sw} N. The two match.',
    s2hint: 'What to watch: start with aluminium and drag the volume from 50 to 400 — the dots fall on a straight line through the origin. Repeat with iron, copper and stone. An iron block weighs nearly three times as much as an aluminium block of the same size, yet its dots land on the same line: the buoyant force cares only about how much water is pushed aside, not about how heavy the object is or what it is made of. That is <strong>Archimedes’ principle</strong>: an object in a liquid feels an upward force equal to the weight of the liquid it displaces, F<sub>b</sub> = ρ<sub>liquid</sub> g V<sub>displaced</sub>.',

    s3k: 'Step 3 · Let go',
    s3t: 'Let go of it: does it float, sink, or hang in the middle?',
    s3e: 'This step answers: who wins once you let go — weight or buoyancy? Every object here is 200 cm³; you change only its <strong>density</strong> (mass per cubic centimetre, g/cm³) and the liquid. The weight is W = ρ<sub>object</sub>gV and the largest possible buoyant force, when fully under, is ρ<sub>liquid</sub>gV. V and g are the same in both, so all that matters is which density is bigger. ρ<sub>object</sub> &lt; ρ<sub>liquid</sub>: fully under, buoyancy beats weight, so the object rises until only part of it is under — just enough to displace its own weight of liquid. That is <strong>floating</strong>, and the fraction under is ρ<sub>object</sub> / ρ<sub>liquid</sub>. ρ<sub>object</sub> = ρ<sub>liquid</sub>: it can rest anywhere — <strong>neutral buoyancy</strong>. ρ<sub>object</sub> &gt; ρ<sub>liquid</sub>: it sinks, and the bottom of the tank supplies the missing <strong>support force</strong>.',
    liqOil: 'vegetable oil 0.92', liqWater: 'fresh water 1.00', liqBrine: 'strong brine 1.10',
    r3Slider: 'Density of the object ρobj (g/cm³)',
    c3scene: 'Where it ends up after you let go',
    c3bars: 'Three forces (N)',
    barW: 'W', barFb: 'Fb', barN: 'N',
    c3plot: 'Fraction under the surface vs object density (g/cm³)',
    s3lgW: 'weight W', s3lgFb: 'buoyant force', s3lgN: 'support from the bottom', s3lgTrail: 'densities you tried (colour = liquid)',
    s3float: 'In {liq}: ρobj = {ro} is less than ρliquid = {rl}, so it floats with {pct}% of it under the surface (= {ro} ÷ {rl}); the buoyant force {Fb} N exactly equals the weight {W} N.',
    s3hover: 'In {liq}: ρobj = ρliquid = {rl}, neutrally buoyant. Fully under, the buoyant force {Fb} N equals the weight {W} N, so it balances wherever it is.',
    s3sink: 'In {liq}: ρobj = {ro} is more than ρliquid = {rl}, so it sinks. Even fully under, buoyancy reaches only {Fb} N, {N} N short of the weight {W} N; the bottom of the tank supplies the rest.',
    s3hint: 'What to watch: in fresh water drag the density slowly from 0.2 to 3 and follow the dots in the lower plot. They climb a slope (fraction under = ρobj / ρliquid), hit 100 % at 1.00, and stay at 100 % from then on, just as the green support bar appears. Switch to brine and to oil: the slope gets shallower or steeper and the bend moves to 1.10 or 0.92. An object of density 1.05 sinks in fresh water but floats in strong brine — which is why an egg floats in salty water.',

    s4k: 'Step 4 · A steel boat',
    s4t: 'Steel is 7.9 times as dense as water — so how does a steel boat float?',
    s4e: 'This step answers: why the same piece of steel sinks as a lump but floats as a boat. A 600 g steel sheet crushed into a solid lump has a volume of only about 76 cm³; fully under, it displaces only about 76 g of water, so the buoyant force is far less than its weight and it sinks. Fold it into an open box 20 cm × 10 cm with sides H high, and the volume the boat can push under water becomes 200 cm² × H — room to displace a lot of water. A floating boat displaces exactly its own weight (plus cargo) of water, so its depth in the water, the <strong>draught</strong>, is total mass ÷ (density of water × base area). The boat’s <strong>average density</strong> is its total mass ÷ the whole volume its hull encloses; it floats only while that is less than water’s. Load too much and the draught exceeds the side height: water pours over the side.',
    H4Slider: 'Side height H (cm)', m4Slider: 'Cargo (g)',
    c4scene: 'The boat from the side: draught and sides',
    c4plot: 'Draught (cm) vs cargo mass (g)',
    s4lgLine: 'draught as cargo is added (up to the side height)', s4lgTrail: 'cargo you tried', s4lgSink: 'past the side height: swamped',
    s4float: 'H = {H} cm, cargo {c} g: total {m} g, draught {d} cm, {fb} cm below the rim; average density {avg} g/cm³, less than water, so it floats. It can take {left} g more. The same 600 g of steel as a lump: about {lv} cm³, buoyant force {lf} N against a weight of {lw} N — it sinks.',
    s4sink: 'H = {H} cm, cargo {c} g: total {m} g would need a draught of {d} cm, more than the {H} cm sides, so water pours in and the boat sinks. Average density {avg} g/cm³, more than water. With these sides it can carry at most {max} g.',
    s4none: 'H = {H} cm: the empty boat already sits {d} cm deep, so the sides are too low to carry anything.',
    s4hint: 'What to watch: keep the sides at 5 cm and drag the cargo up from 0. The boat sits deeper and the dots climb a straight line; once they touch the dashed rim line (400 g of cargo) any more and the boat goes down. Raise the sides to 8 cm: the line is the same, the rim is higher, and it can carry up to 1000 g. With 3 cm sides the empty boat already floats right at its rim.',

    s5k: 'Step 5 · The hydrometer',
    s5t: 'How can a floating glass tube read off the density of a liquid?',
    s5e: 'This step answers: what floating can measure. A <strong>hydrometer</strong> is a weighted glass bulb with a thin stem: mass 18 g, bulb volume 14 cm³, stem cross-section 0.5 cm². It floats in any liquid that is dense enough, and when it floats it displaces exactly 18 g of liquid, so the volume under the surface is 18 g ÷ ρ<sub>liquid</sub>. The denser the liquid, the less it needs to displace and the higher it rides; where the surface meets the stem can be marked as a density reading.',
    r5Slider: 'Density of the liquid ρliquid (g/cm³)',
    c5scene: 'The hydrometer floating in the liquid',
    c5scale: 'Marks on the stem (cm)',
    s5readout: 'ρliquid = {r} g/cm³: it displaces {Vs} cm³ (= 18 ÷ {r}), so the surface sits {h} cm up the stem above the bulb. The marks 0.8 and 0.9 are {g1} cm apart; 1.1 and 1.2 only {g2} cm.',
    s5hint: 'What to watch: drag the density from 0.80 to 1.20 and see the hydrometer rise. Look at the scale strip on the right: the larger readings are more crowded, and the large numbers sit low on the stem, the small ones high. The reason is that the displaced volume 18 ÷ ρ is inversely proportional to the density, not a straight-line function: each extra 0.1 of density lifts the tube a lot in a thin liquid and only a little in a dense one.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Buoyancy in one sentence',
    s6fin: 'The buoyant force is the difference between the liquid pushing up on an object’s bottom and down on its top: the bottom is deeper, where the pressure is higher. Work that difference out and it equals the weight of the liquid the object displaces — <strong>Archimedes’ principle</strong>, F<sub>b</sub> = ρ<sub>liquid</sub>gV<sub>displaced</sub>. It depends only on how much is displaced and which liquid, not on how heavy the object is. Comparing weight with the largest buoyant force comes down to comparing two densities, which gives floating, neutral buoyancy and sinking; a steel boat lowers its average density below water’s by enclosing more volume; a hydrometer turns it around and reads a liquid’s density from how deep it floats.',
    formula: 'Fb = W − reading = Fbottom − Ftop = ρliquid g Vdisplaced\nfloating: fraction under = ρobject / ρliquid\nhydrometer: Vdisplaced = m ÷ ρliquid',
    boundary: 'Scope: still, incompressible liquids; rigid, solid, uniform objects (the boat uses its average density); no surface tension; g = 9.8 N/kg; pressures count only the liquid’s share (air pressure cancels). The animation shows only where things come to rest — real floating objects bob up and down a few times and feel water drag. The boat is an open rectangular shell with the steel’s own volume neglected; tipping and waves are ignored.',
    linksTitle: 'Related lessons on this site',
    lk1: '→ Pressure, step 2: deeper water presses harder — the source of buoyancy',
    lk2: '→ Density (Claude Code edition), step 5: a density tower — liquids and objects stack up by density',
    lk3: '→ Float & Sink, step 2: the same plasticine sinks as a ball and floats as a boat',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Buoyancy & Archimedes”.'
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
