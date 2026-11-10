'use strict';
// Pressure lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '压强 · 同样的力，压在多大的面上',
    back: '← 知识索引',
    compare: '对照另一版本：压强 →',
    navLabel: '压强步骤导航',
    tagline: '站在雪地里会陷下去，踩上滑雪板就不陷；图钉一按就进木头，钉帽却不扎手。力差不多大，结果天差地别，差别在于力压在多大的面上。六步里你会从一块砖出发量出压强，再沉到水下、走进空气里，看液体和大气的压强从哪里来。',
    nav0: '0 一块砖', nav1: '1 压强梯子', nav2: '2 水下', nav3: '3 容器形状', nav4: '4 大气压', nav5: '5 收束',

    s0k: '第 0 步 · 换一面放',
    s0t: '同一块砖换一面朝下，为什么在海绵上陷得深浅不同？',
    s0e: '这一步要回答：砖的重量没变，只是换了一面朝下，海绵为什么陷得不一样深？砖长 20 cm、宽 10 cm、高 5 cm，质量 2 kg。它压在海绵上的<strong>压力</strong>（垂直压在表面上的力）等于它受的重力：F = mg = 2 kg × 10 N/kg = 20 N（本页 g 一律取 10 N/kg）。砖和海绵贴在一起的那块面叫<strong>受力面积</strong> S。把 20 N 平均分给这块面上的每个 1 cm² 小格：格子越少，每格分到的力越多，海绵就被压得越狠。「每单位面积上受到的压力」就叫<strong>压强</strong>：<strong>p = F / S</strong>。力用牛顿（N）、面积用平方米（m²）时，压强的单位是<strong>帕斯卡</strong>，简称帕（Pa）：1 Pa 就是每平方米上 1 N 的压力，1 m² = 10000 cm²。',
    faceLabel: '放法：', faceFlat: '平放（20×10 面朝下）', faceSide: '侧放（20×5 面朝下）', faceEnd: '竖放（10×5 面朝下）',
    faceFlatS: '平放', faceSideS: '侧放', faceEndS: '竖放',
    stackLabel: '叠几块（同一放法）',
    s0lgF: '压力 F（等于砖的重力）', s0lgCell: '接触面上每 1 cm² 分到的力（颜色越亮越大）', s0lgDent: '海绵原来的表面',
    c0a: '侧面：砖压在海绵上（凹陷深浅为示意）', c0b: '从下往上看：接触面，每格 1 cm²',
    dimLabel: '{w} cm × {d} cm = {S} cm²', forceLabel: 'F = {F} N',
    s0readout: '{face}、{n} 块：F = {F} N，S = {Scm2} cm² = {S} m²，p = F / S = {p} Pa；每 1 cm² 小格分到 {per} N。',
    s0hint: '观察顺序：先保持 1 块，依次点三种放法：「接触面」图里格子变少、每格颜色变亮（每格分到的力变大），「侧面」图里凹陷变深；面积变成一半，压强变成两倍，两者此消彼长。再选定一种放法，把块数从 1 拖到 3：格子数不变，力变成 2 倍、3 倍，压强也变成 2 倍、3 倍。下表记下你试过的每种组合。凹陷按「每 400 Pa 压下 1 mm」来画，这是示意设定，真实海绵并不严格成比例。',
    th0Face: '放法', th0N: '块数', th0F: 'F（N）', th0S: 'S（cm²）', th0P: 'p（Pa）',

    s1k: '第 1 步 · 压强的梯子',
    s1t: '生活里的压强，最小和最大能差多少倍？',
    s1e: '这一步要回答：滑雪板、鞋底、坦克履带、刀刃、图钉尖，它们的压强差多少？下面七个例子都按写明的力 F 和受力面积 S 算出 p = F / S。这些 F、S 是估算的典型值，不是测量数据。数值差得太远，普通刻度画不下，所以横轴用<strong>对数刻度</strong>：每往右一大格，压强大 10 倍（10³ = 1000 Pa，10⁴ = 10000 Pa，依此类推）。点一个例子，看它落在哪一格。',
    c1: '压强 p（Pa，对数刻度：每格 ×10）',
    case_ski: '滑雪的人', case_stand: '站着的人', case_tank: '坦克', case_thumb: '拇指按钉帽', case_heel: '高跟鞋跟', case_knife: '刀刃', case_tip: '图钉尖',
    det_ski: '60 kg 的人，两块滑雪板各 1.6 m × 10 cm', det_stand: '同一个人，两只鞋底各 200 cm²', det_tank: '40 t，两条履带各有 4 m × 0.5 m 贴地', det_thumb: '20 N，钉帽 1 cm²', det_heel: '一半体重 300 N 落在 1 cm² 的鞋跟上', det_knife: '50 N，刃口长 20 cm、宽 0.02 mm', det_tip: '同样 20 N，钉尖 0.05 mm²',
    s1readout: '{i}. {name}（{detail}）：F = {F} N，S = {S} m²，p = F / S = {p} Pa，是站着的人的 {r} 倍。',
    s1hint: '观察顺序：先点「站着的人」当基准；再点「滑雪的人」：力一样，面积大 8 倍，点往左退了将近一格，压强只剩 1/8。再点「坦克」：它比人重 {tankW} 倍，可履带面积大，压强只是人的 {tankP} 倍。最后对比「拇指按钉帽」和「图钉尖」：两端的力一样大，点却相差 {gap} 格。想压得狠就减小受力面积（刀刃、钉尖），不想陷下去就增大受力面积（滑雪板、履带）。',
    quiz1: '钉帽和钉尖受的力一样大（都是 20 N）。钉尖下的压强是拇指上压强的多少倍？',
    quiz1a: '1 倍：力一样大，压强也一样', quiz1b: '20 倍', quiz1c: '2000 倍',
    check: '核对',
    correct1: '对。力相同时，压强之比等于面积的反比：1 cm² = 100 mm²，100 mm² ÷ 0.05 mm² = {r}。所以钉尖能扎进木头，拇指只觉得被按了一下。',
    wrong1: '再想想：两端的力一样，差别全在面积上。先把 1 cm² 换成 mm²（1 cm = 10 mm），再和 0.05 mm² 比一比。',

    s2k: '第 2 步 · 沉到水下',
    s2t: '水里的压强跟什么有关：深度、方向，还是液体种类？',
    s2e: '这一步要回答：潜得越深耳朵越胀，液体内部的压强由什么决定？把一个蒙着橡皮膜的小探头放进液体，膜被压凹，连着它的 U 形管（管里装的是水）两边液面就出现高度差，压强越大高度差越大，这套装置叫<strong>压强计</strong>。<strong>深度</strong> h 指探头到液面的竖直距离。为什么深处压强大？设想探头正上方有一根底面积为 S、高为 h 的液柱：它的质量是 ρSh，受的重力是 ρShg，全压在面积 S 上，所以 <strong>p = ρgh</strong>，S 被约掉了。<strong>密度</strong> ρ 是每立方米液体的质量，单位 kg/m³（<a class="xlink" href="../../../physics/matter/density/#step2">→ 密度页第 2 步：ρ = m/V 怎么算</a>）。用这个公式时 h 要换成米。这里的 p 只算液体自己产生的压强，不含液面上方空气的压强（空气留到第 4 步）。',
    depthLabel: '探头深度 h（cm）', liquidLabel: '液体：', lqAlcohol: '酒精 800 kg/m³', lqWater: '水 1000 kg/m³', lqBrine: '浓盐水 1200 kg/m³',
    lqAlcoholS: '酒精', lqWaterS: '水', lqBrineS: '浓盐水',
    dirLabel: '橡皮膜朝向：', dirUp: '朝上', dirSide: '朝侧面', dirDown: '朝下', clearDots: '清除记录点',
    s2lgDot: '记录点（每个试过的深度都留下）',
    c2a: '容器与压强计（U 形管里装水）', c2b: '压强 p（Pa）与深度 h（cm）',
    hLabel: 'h = {h} cm', dhLabel: '差 {dh} cm',
    s2readout: '{liquid}，深 {h} cm，橡皮膜{dir}：p = ρgh = {rho} × 10 × {hm} = {p} Pa；U 形管两边水面相差 {dh} cm。',
    s2hint: '观察顺序：① 只拖深度：「压强与深度」图上的点沿一条过原点的直线走，深度变成 2 倍，压强也变成 2 倍。② 深度不动，依次点三个朝向：U 形管高度差一点都不变，同一深度向各个方向的压强相等。③ 深度不动，换液体：密度越大压强越大，点跳到另一条更陡或更缓的线上。液体是水时，U 形管两边水面差正好等于探头深度：同样是水，同样的高度差对应同样的压强。',

    s3k: '第 3 步 · 容器的形状',
    s3t: '底一样大、水一样深，装水多的容器，底受的压力更大吗？',
    s3e: '这一步要回答：三个容器底面一样大（10 cm × 10 cm），前后都厚 10 cm，装水到同样深。它们形状不同，装的水一样多吗？底受的压力一样大吗？按上一步，容器底上的每一小块，正上方压着一根水柱，柱高就是水深 h，所以三个底的压强都是 ρgh，底受的<strong>压力</strong> F = pS 也一样大。可三杯水的重量明显不同，多出或少掉的那部分去哪了？A 是直筒，水的重量正好全压在底上。B 口大底小，倾斜的壁从下面托住了一部分水，这部分重量压在壁上，不在底上。C 口小底大，倾斜的壁反过来向下压着水，底受的力比水的重量还大。',
    depth3Label: '水深 h（cm）',
    c3a: '三个容器的侧面（按比例画）', c3b: '水重与底受的压力（N）',
    s3lgW: '水重（水受的重力）', s3lgF: '底受的压力 F = pS',
    s3readout: '水深 {h} cm：三个底的压强都是 ρgh = {p} Pa，底面积都是 {S} m²，所以底受的压力都是 {F} N。',
    th3C: '容器', th3Shape: '形状', th3V: '水的体积（cm³）', th3W: '水重（N）', th3F: '底受压力（N）', th3Wall: '倾斜的壁',
    shA: 'A 直筒', shB: 'B 口大底小', shC: 'C 口小底大',
    shAd: '上下都宽 10 cm', shBd: '每深 1 cm 两侧共外扩 1 cm（深 20 cm 时口宽 30 cm）', shCd: '每深 1 cm 两侧共内收 0.4 cm（深 20 cm 时口宽 2 cm）',
    wallUp: '托住 {v} N', wallDown: '向下压 {v} N', wallNone: '不受力',
    s3hint: '观察顺序：把水深从 0 拖到 20 cm，盯着「水重与底受的压力」图：每个容器下方左边的青色柱是水重，右边的橙色柱是底受的压力。三根橙色柱始终一样高；青色柱 B 最高、C 最矮。深 {h} cm 时，B 里的水重 {wB} N，C 里只有 {wC} N，三个底受的压力却都是 {F} N。所以求液体对容器底的压力，要先用 p = ρgh 算压强，再乘底面积，不能直接拿水的重量来用。',

    s4k: '第 4 步 · 头顶的空气',
    s4t: '我们泡在空气里，空气的压强有多大？为什么平时感觉不到？',
    s4e: '这一步要回答：空气也有重量，它对我们有压强吗，有多大？地面上方是厚达几十千米的空气，它产生的压强叫<strong>大气压</strong>，海平面附近约 1.013 × 10⁵ Pa（叫一个标准大气压），相当于每 1 cm² 上压着约 {perCm2} N。平时感觉不到，是因为身体里外都有差不多大的压强，两边抵消了。「两个半球」图画的是两个扣在一起的空心金属半球（著名的马德堡半球实验就是这样做的）。用抽气机抽掉里面一部分空气，里面的压强变小，外面的大气压不再被抵消，就把两半紧紧压在一起。要把它们拉开，需要的力 F =（外面压强 − 里面压强）× 半球的<strong>截面积</strong> πr²（截面积：沿接缝切开得到的那个圆的面积，r 是半径）。抽气时假设温度不变，所以里面剩下几成空气，压强就剩几成。',
    pumpLabel: '抽掉里面的空气（%）', diamLabel: '半球直径 D（cm）',
    c4: '两个半球（箭头长短表示压强大小，点的疏密为示意）',
    s4lgOut: '外面的大气压，向里压', s4lgIn: '里面剩下的空气，向外推', s4lgPull: '拉开需要的力',
    s4readout: '外面 {p0} Pa，里面 {pin} Pa；截面积 πr² = {A} m²；拉开需要 F = {F} N，相当于提起 {kg} kg 的东西。',
    s4zero: '外面 {p0} Pa，里面也是 {pin} Pa：内外抵消，不用力就能分开。',
    s4hint: '观察顺序：先保持抽气 0%：青色（外）和粉色（内）箭头一样长，拉力为 0，两半一碰就开。把抽气拖到 50%、90%：粉色箭头变短、里面的点变稀，橙色拉力变大。然后保持抽气 90%，把直径从 10 cm 拖到 40 cm：直径变成 4 倍，截面积和拉力都变成 16 倍。',
    s4col: '大气压能托起多高的水柱？p₀ ÷ (ρ水 × g) = {col} m（g 取 10 N/kg；取更准确的 9.8 N/kg 时是 {col98} m）。抽水机是靠大气压把水压上来的，所以它最多只能把水「吸」上约 10 m。',

    s5k: '第 5 步 · 收束', s5t: '压强 = 压力 ÷ 受力面积，液体和空气也一样',
    s5fin: '回头看：<strong>第 0 步</strong>，压强是每单位面积上的压力，p = F / S；力一样，面积越小压强越大。<strong>第 1 步</strong>，生活里的压强能差二十多万倍：想压得狠就减小面积（刀刃、钉尖），不想陷下去就增大面积（滑雪板、履带）。<strong>第 2 步</strong>，液体内部向各个方向都有压强，p = ρgh，只跟液体密度和深度有关。<strong>第 3 步</strong>，所以容器底受的压强与容器形状、装水多少无关。<strong>第 4 步</strong>，空气也有压强，平时里外抵消；抽掉一边的空气，大气压就显出它的力量。',
    formula: 'p = F / S\np液 = ρ g h\nF拉 = (p₀ − p内) · πr²',
    boundary: '适用范围：p = F / S 算的是平均压强，假设力均匀压在整个接触面上；海绵凹陷与压强成正比是本页的示意设定。p = ρgh 只对静止的液体成立，算的是液体自己产生的压强，不含液面上方的大气压，并把液体密度当作处处相同。大气压随海拔和天气变化，本页取 1.013 × 10⁵ Pa；抽气时假设温度不变。全页 g 取 10 N/kg。第 1 步的力和面积是估算的典型值。',
    quiz2: '潜水员下潜到水下 10 m，水自己产生的压强（不算大气压）大约是多少？',
    quiz2a: '1 × 10³ Pa', quiz2b: '1 × 10⁴ Pa', quiz2c: '1 × 10⁵ Pa，和一个大气压差不多',
    correct2: '对。p = ρgh = 1000 × 10 × 10 = {p} Pa，和一个大气压差不多。所以在水下 10 m，身上受到的总压强（水 + 大气）约是水面上的两倍。',
    wrong2: '再算一遍：ρ = 1000 kg/m³，g = 10 N/kg，h = 10 m，三个数相乘，单位就是 Pa。',
    linksTitle: '接着去哪',
    lk1: '→ 反比例页第 1 步：一个量变成几倍，另一个就变成几分之一（力不变时的 S 与 p）',
    lk2: '→ 密度页第 2 步：ρ = m/V 怎么算、单位怎么换',
    lk3: '→ 浮力页第 1 步：浮力等于排开液体的重量',
    lk4: '→ 气体压强的微观图景第 0 步：气体压强来自分子不停撞墙（高中内容）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《压强》的平行版本。'
  },
  en: {
    pageTitle: 'Pressure · The Same Force, Spread Over How Much Area',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Pressure →',
    navLabel: 'Pressure step navigation',
    tagline: 'Stand in deep snow and you sink; strap on skis and you don’t. Push a thumbtack and the point goes into wood while the head barely dents your thumb. The forces are about the same; what changes is how much area they press on. In six steps you’ll measure pressure starting from a single brick, then go under water and out into the air to see where liquid and air pressure come from.',
    nav0: '0 A brick', nav1: '1 Ladder', nav2: '2 Under water', nav3: '3 Shapes', nav4: '4 Air', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Turn the brick over',
    s0t: 'Same brick, different face down: why does the sponge sink by different amounts?',
    s0e: 'This step asks: the brick weighs the same whichever way it lies, so why does the sponge sink deeper on one face than another? The brick is 20 cm × 10 cm × 5 cm and has a mass of 2 kg. The force it presses straight down on the sponge, the <strong>normal force</strong>, equals its weight: F = mg = 2 kg × 10 N/kg = 20 N (this page uses g = 10 N/kg everywhere). The patch where brick and sponge touch is the <strong>contact area</strong> S. Share the 20 N out evenly over the 1 cm² squares of that patch: the fewer squares, the more force each one carries, and the harder the sponge is squeezed there. Force per unit area is called <strong>pressure</strong>: <strong>p = F / S</strong>. With force in newtons (N) and area in square metres (m²), pressure comes out in <strong>pascals</strong> (Pa): 1 Pa is 1 N spread over each square metre, and 1 m² = 10,000 cm².',
    faceLabel: 'Face down:', faceFlat: 'Flat (20×10 face)', faceSide: 'On its side (20×5)', faceEnd: 'On its end (10×5)',
    faceFlatS: 'Flat', faceSideS: 'Side', faceEndS: 'End',
    stackLabel: 'Bricks stacked (same face down)',
    s0lgF: 'force F (the brick’s weight)', s0lgCell: 'force on each 1 cm² of contact (brighter = more)', s0lgDent: 'sponge’s original surface',
    c0a: 'Side view: brick on sponge (dent depth is illustrative)', c0b: 'From below: the contact face, 1 cm² per square',
    dimLabel: '{w} cm × {d} cm = {S} cm²', forceLabel: 'F = {F} N',
    s0readout: '{face}, {n} brick(s): F = {F} N, S = {Scm2} cm² = {S} m², p = F / S = {p} Pa; each 1 cm² square carries {per} N.',
    s0hint: 'What to try: keep 1 brick and click the three faces in turn. On the “contact face” picture there are fewer squares and each gets brighter (more force per square); on the “side view” the dent deepens. Halve the area and the pressure doubles: one goes down as the other goes up. Then pick one face and drag the count from 1 to 3: the squares stay the same, the force becomes 2× and 3×, and so does the pressure. The table logs every combination you try. The dent is drawn as 1 mm per 400 Pa, a teaching assumption; a real sponge is not exactly proportional.',
    th0Face: 'Face', th0N: 'Bricks', th0F: 'F (N)', th0S: 'S (cm²)', th0P: 'p (Pa)',

    s1k: 'Step 1 · A ladder of pressures',
    s1t: 'How far apart are the smallest and largest pressures in everyday life?',
    s1e: 'This step asks: skis, shoe soles, tank tracks, a knife edge, a tack point: how different are their pressures? Each of the seven cases below states a force F and a contact area S, and p = F / S is worked out from them. The F and S values are typical estimates, not measurements. The results are so far apart that an ordinary scale can’t hold them, so the axis is a <strong>log scale</strong>: every big step to the right is 10 times more pressure (10³ = 1,000 Pa, 10⁴ = 10,000 Pa, and so on). Click a case and see which step it lands on.',
    c1: 'Pressure p (Pa, log scale: ×10 per step)',
    case_ski: 'Skier', case_stand: 'Standing person', case_tank: 'Tank', case_thumb: 'Thumb on a tack head', case_heel: 'Stiletto heel', case_knife: 'Knife edge', case_tip: 'Tack point',
    det_ski: 'a 60 kg person on two skis, each 1.6 m × 10 cm', det_stand: 'the same person on two soles of 200 cm² each', det_tank: '40 t on two tracks, each with 4 m × 0.5 m on the ground', det_thumb: '20 N on a 1 cm² tack head', det_heel: 'half the body weight, 300 N, on a 1 cm² heel', det_knife: '50 N on an edge 20 cm long and 0.02 mm wide', det_tip: 'the same 20 N on a 0.05 mm² point',
    s1readout: '{i}. {name} ({detail}): F = {F} N, S = {S} m², p = F / S = {p} Pa, {r} times the standing person.',
    s1hint: 'What to try: start with “Standing person” as the baseline. Then “Skier”: same force, 8 times the area, and the dot slides back almost one step: the pressure is 1/8. Next, “Tank”: it is {tankW} times heavier than the person, but its tracks are so large that its pressure is only {tankP} times the person’s. Finally compare “Thumb on a tack head” with “Tack point”: the same force at both ends, yet the dots are {gap} steps apart. To press hard, shrink the area (knife edges, tack points); to stay on top, spread it (skis, tracks).',
    quiz1: 'The tack head and the tack point carry the same force (20 N each). How many times larger is the pressure under the point than on your thumb?',
    quiz1a: '1 time: same force, same pressure', quiz1b: '20 times', quiz1c: '2000 times',
    check: 'Check',
    correct1: 'Right. With equal force, the pressures are in the inverse ratio of the areas: 1 cm² = 100 mm², and 100 mm² ÷ 0.05 mm² = {r}. That is why the point goes into wood while your thumb just feels a push.',
    wrong1: 'Think again: the force is the same at both ends, so the whole difference is in the areas. Convert 1 cm² to mm² first (1 cm = 10 mm), then compare it with 0.05 mm².',

    s2k: 'Step 2 · Under water',
    s2t: 'What sets the pressure in water: depth, direction, or the kind of liquid?',
    s2e: 'This step asks: your ears hurt more the deeper you dive, so what decides the pressure inside a liquid? Lower a small probe covered with a rubber membrane into the liquid. The membrane is pushed in, and the U-tube connected to it (filled with water) shows a height difference between its two sides: more pressure, bigger difference. The whole device is a <strong>manometer</strong>. <strong>Depth</strong> h is the vertical distance from the probe up to the surface. Why is it larger deeper down? Picture the column of liquid standing right above the probe, with base area S and height h. Its mass is ρSh, its weight is ρShg, and all of that rests on area S, so <strong>p = ρgh</strong>: S cancels. <strong>Density</strong> ρ is the mass of one cubic metre of the liquid, in kg/m³ (<a class="xlink" href="../../../physics/matter/density/#step2">→ Density, step 2: working out ρ = m/V</a>). Put h in metres when you use the formula. This p is only the pressure the liquid makes itself; it leaves out the air pressing on the surface (air comes in step 4).',
    depthLabel: 'Probe depth h (cm)', liquidLabel: 'Liquid:', lqAlcohol: 'Alcohol 800 kg/m³', lqWater: 'Water 1000 kg/m³', lqBrine: 'Strong brine 1200 kg/m³',
    lqAlcoholS: 'Alcohol', lqWaterS: 'Water', lqBrineS: 'Strong brine',
    dirLabel: 'Membrane faces:', dirUp: 'up', dirSide: 'sideways', dirDown: 'down', clearDots: 'Clear dots',
    s2lgDot: 'dots: every depth you tried',
    c2a: 'Tank and manometer (water in the U-tube)', c2b: 'Pressure p (Pa) vs depth h (cm)',
    hLabel: 'h = {h} cm', dhLabel: 'gap {dh} cm',
    s2readout: '{liquid}, {h} cm deep, membrane facing {dir}: p = ρgh = {rho} × 10 × {hm} = {p} Pa; the two sides of the U-tube differ by {dh} cm.',
    s2hint: 'What to try: ① Drag only the depth: the dot on the “pressure vs depth” chart walks along a straight line through the origin; twice the depth, twice the pressure. ② Hold the depth and click the three directions: the U-tube gap does not move at all, so at one depth the pressure is the same in every direction. ③ Hold the depth and switch liquids: denser liquid, more pressure, and the dot jumps to a steeper or shallower line. With water in the tank, the U-tube gap equals the probe depth exactly: water on both sides, so equal heights mean equal pressure.',

    s3k: 'Step 3 · The shape of the container',
    s3t: 'Same base, same water depth: does the container holding more water push harder on its base?',
    s3e: 'This step asks: three containers have the same 10 cm × 10 cm base, are all 10 cm from front to back, and are filled to the same depth. Do they hold the same amount of water, and is the force on each base the same? From the last step, each small patch of a base has a column of water directly above it, and that column is as tall as the depth h. So all three bases feel the same pressure ρgh, and the <strong>force</strong> on each base, F = pS, is the same too. Yet the three lots of water clearly weigh different amounts. Where does the extra weight go, and where does the missing weight come from? A is straight, so all of its water’s weight rests on the base. B widens upward, and its sloping walls hold part of the water up from below; that part of the weight sits on the walls, not the base. C narrows upward, so its sloping walls push down on the water, and the base feels more than the water’s weight.',
    depth3Label: 'Water depth h (cm)',
    c3a: 'Three containers, side view (to scale)', c3b: 'Water weight and force on the base (N)',
    s3lgW: 'weight of the water', s3lgF: 'force on the base F = pS',
    s3readout: 'Depth {h} cm: all three bases feel ρgh = {p} Pa over the same {S} m², so the force on each base is {F} N.',
    th3C: 'Container', th3Shape: 'Shape', th3V: 'Water volume (cm³)', th3W: 'Water weight (N)', th3F: 'Force on base (N)', th3Wall: 'Sloping walls',
    shA: 'A straight', shB: 'B wide top', shC: 'C narrow top',
    shAd: '10 cm wide all the way up', shBd: 'widens 1 cm (both sides together) per cm of height: 30 cm across at 20 cm', shCd: 'narrows 0.4 cm per cm of height: 2 cm across at 20 cm',
    wallUp: 'hold up {v} N', wallDown: 'push down {v} N', wallNone: 'carry nothing',
    s3hint: 'What to try: drag the depth from 0 to 20 cm and watch the “water weight and force on the base” chart. Under each container, the cyan bar on the left is the water’s weight and the orange bar on the right is the force on the base. The three orange bars always stay level; among the cyan bars B is tallest and C shortest. At {h} cm the water in B weighs {wB} N and in C only {wC} N, yet every base feels {F} N. So to find the force a liquid puts on a base, work out the pressure with p = ρgh first and multiply by the base area; the water’s weight is not the answer.',

    s4k: 'Step 4 · The air overhead',
    s4t: 'We live at the bottom of the air. How big is its pressure, and why don’t we feel it?',
    s4e: 'This step asks: air has weight too, so does it press on us, and how hard? Above the ground sits a layer of air tens of kilometres thick. The pressure it makes is <strong>atmospheric pressure</strong>, about 1.013 × 10⁵ Pa near sea level (one standard atmosphere), roughly {perCm2} N on every 1 cm². We don’t feel it because the pressure inside our bodies is about the same, so the two sides cancel. The picture shows two hollow metal hemispheres fitted together, as in the famous Magdeburg hemispheres experiment. Pump out part of the air inside and the inside pressure drops; the air outside is no longer balanced and clamps the halves together. The force needed to pull them apart is F = (outside pressure − inside pressure) × the <strong>cross-section</strong> πr² (the area of the circle you’d get by cutting along the seam; r is the radius). The pumping is taken to keep the temperature constant, so whatever fraction of the air is left, that fraction of the pressure is left.',
    pumpLabel: 'Air pumped out of the inside (%)', diamLabel: 'Hemisphere diameter D (cm)',
    c4: 'Two hemispheres (arrow length = pressure; dots illustrative)',
    s4lgOut: 'air outside, pushing in', s4lgIn: 'air left inside, pushing out', s4lgPull: 'force needed to pull apart',
    s4readout: 'Outside {p0} Pa, inside {pin} Pa; cross-section πr² = {A} m²; pulling apart takes F = {F} N, like lifting {kg} kg.',
    s4zero: 'Outside {p0} Pa and inside {pin} Pa too: the two cancel, and the halves come apart with no effort.',
    s4hint: 'What to try: start with 0% pumped out. The cyan (outside) and pink (inside) arrows are equally long, the pull is 0, and the halves fall apart. Drag the pump to 50%, then 90%: the pink arrows shrink, the dots inside thin out, and the orange pull grows. Then hold 90% and drag the diameter from 10 cm to 40 cm: four times the diameter gives 16 times the cross-section and 16 times the force.',
    s4col: 'How tall a water column can the air hold up? p₀ ÷ (ρwater × g) = {col} m (with g = 10 N/kg; with the more precise 9.8 N/kg it is {col98} m). A suction pump works because the air outside pushes the water up the pipe, so it can never “suck” water higher than about 10 m.',

    s5k: 'Step 5 · Wrap-up', s5t: 'Pressure is force over area, in liquids and in air too',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: pressure is force per unit area, p = F / S; for the same force, smaller area means larger pressure. <strong>Step 1</strong>: everyday pressures span a factor of more than two hundred thousand; to press hard you shrink the area (knife edges, tack points), and to stay on top you spread it (skis, tracks). <strong>Step 2</strong>: a liquid presses in every direction, p = ρgh, set only by its density and the depth. <strong>Step 3</strong>: so the pressure on a container’s base does not depend on its shape or on how much water it holds. <strong>Step 4</strong>: air has pressure too; normally inside and outside cancel, and once you pump one side out the atmosphere shows its strength.',
    formula: 'p = F / S\np_liquid = ρ g h\nF_pull = (p₀ − p_in) · πr²',
    boundary: 'Scope: p = F / S is the average pressure, assuming the force is spread evenly over the contact area; the sponge dent being proportional to pressure is a teaching assumption. p = ρgh holds only for a liquid at rest; it is the pressure the liquid makes itself, without the air pressing on its surface, and it treats the density as the same everywhere. Atmospheric pressure varies with altitude and weather; this page uses 1.013 × 10⁵ Pa and assumes constant temperature while pumping. g = 10 N/kg throughout. The forces and areas in step 1 are typical estimates.',
    quiz2: 'A diver goes 10 m under water. Roughly how much pressure does the water itself make there (not counting the air)?',
    quiz2a: '1 × 10³ Pa', quiz2b: '1 × 10⁴ Pa', quiz2c: '1 × 10⁵ Pa, about one atmosphere',
    correct2: 'Right. p = ρgh = 1000 × 10 × 10 = {p} Pa, about one atmosphere. So 10 m down, the total pressure on the diver (water plus air) is about twice what it is at the surface.',
    wrong2: 'Work it through again: ρ = 1000 kg/m³, g = 10 N/kg, h = 10 m. Multiply the three and the unit is Pa.',
    linksTitle: 'Where to go next',
    lk1: '→ Inverse proportion, step 1: when one quantity grows m times the other shrinks to 1/m (S and p for a fixed force)',
    lk2: '→ Density, step 2: working out ρ = m/V and converting units',
    lk3: '→ Buoyancy, step 1: the buoyant force equals the weight of the liquid pushed aside',
    lk4: '→ Gas pressure up close, step 0: gas pressure comes from molecules hitting the wall (senior-school level)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Pressure”.'
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
