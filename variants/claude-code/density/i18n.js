'use strict';
// Density lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '密度 · 认出材料的那个比值',
    back: '← 知识索引',
    compare: '对照另一版本：密度 →',
    navLabel: '密度步骤导航',
    tagline: '一块东西有多重、有多大，各自都说明不了它是什么做的；把两者一除，得到的比值却几乎只取决于材料。七步里你会找到这个比值，用它称出一屋子空气，用量筒认出不知名的金属块，检验一顶王冠是不是纯金，再看几种液体怎样按它排好队。',
    nav0: '0 一样重', nav1: '1 切大切小', nav2: '2 一屋子空气', nav3: '3 认金属块', nav4: '4 王冠', nav5: '5 密度塔', nav6: '6 收束',
    clearRecords: '清空记录', clearTrail: '清除轨迹', sep: '；', and: '、',
    mPine: '松木', mIce: '冰', mAl: '铝', mIron: '铁', mCopper: '铜', mLead: '铅', mGold: '金', mSilver: '银',

    s0k: '第 0 步 · 一样重的四块',
    s0t: '同样重的松木、冰、铝和铁，各占多大地方？',
    s0e: '这一步要回答：质量相同时，不同材料的体积差多少？<strong>质量</strong>是物体含有多少物质，用天平称，单位克（g）；<strong>体积</strong>是物体占多大空间，单位立方厘米（cm³，一个边长 1 cm 的小方块）。下面四块的质量都相同，画成正方体，边长按真实比例。下方横条是各自的体积。',
    m0Slider: '每块的质量（g）',
    c0cubes: '质量都相同的四个正方体（按同一比例画）',
    c0bars: '体积（cm³）',
    s0readout: '每块 {m} g：{list}。松木的体积是铁的 {ratio} 倍。',
    s0item: '{name} {V} cm³',
    s0hint: '观察顺序：拖「每块的质量」，四个正方体一起变大或变小，但它们之间的大小关系不变：松木总是铁的约 16 倍大。质量翻倍，每块的体积也都翻倍。所以「多重」和「多大」要放在一起看，才能说明材料——下一步把它们相除。',

    s1k: '第 1 步 · 切大切小',
    s1t: '同一种材料切成大小不同的块，质量和体积的比值会变吗？',
    s1e: '这一步要回答：质量 ÷ 体积是不是只由材料决定。选一种材料，按「切一块，量一量，称一称」：每次切下一块长方体，量出长、宽、高算体积，再用天平称质量（天平读到 0.1 g）。每一块都在下图记一个点：横坐标是体积，纵坐标是质量。如果比值不变，同一种材料的点会排在一条过原点的直线上（<a class="xlink" href="../../../math/algebra/linear-functions/#step0">一次函数第 0 步：直线的陡度就是每走一步升多少</a>），直线的陡度就是这个比值。这个比值就叫<strong>密度</strong>：ρ = m / V，意思是每立方厘米有多少克，单位 g/cm³。',
    cut1: '切一块，量一量，称一称',
    c1piece: '刚切下的这一块',
    c1plot: '质量 m（g）— 体积 V（cm³）',
    s1lgLine: '虚线：过原点、陡度 = 已记录点的平均比值',
    s1readout: '{name}第 {n} 块：{a} cm × {b} cm × {c} cm = {V} cm³，称得 {m} g，m ÷ V = {r} g/cm³。已记录 {k} 块{name}，直线的陡度 {s} g/cm³。',
    s1none: '按「切一块，量一量，称一称」开始；想换材料就先点上面的按钮。',
    s1all: '这种材料的六块都切完了，换一种材料继续。',
    s1hint: '观察顺序：选铝，连按六次切块按钮，看点一个比一个远，却都落在同一条虚线上，每块的 m ÷ V 都是 2.7。再换铁和松木：各有各的直线，铁的最陡（7.9），松木最平（0.5）。块的大小只决定点落在线上的哪里，比值由材料决定。',

    s2k: '第 2 步 · 一屋子空气',
    s2t: '教室里的空气有多重？',
    s2e: '这一步要回答：知道密度，怎样算出称不了的东西的质量？质量 = 密度 × 体积，m = ρV。房间很大，体积用立方米（m³，边长 1 m 的方块）更方便，质量用千克（kg），密度就换成 kg/m³。换算：1 m³ = 100 × 100 × 100 cm³ = 1 000 000 cm³，1 kg = 1000 g，所以 1 g/cm³ = 1000 kg/m³。20 °C 左右的空气密度约 1.2 kg/m³，也就是 0.0012 g/cm³——很小，可房间很大。',
    L2Slider: '房间长（m）', W2Slider: '房间宽（m）', H2Slider: '房间高（m）',
    c2room: '房间俯视图：每格 1 m × 1 m，竖着高 H',
    c2people: '空气的质量，按每人 50 kg 折成人数',
    s2readout: '{L} m × {W} m × {H} m = {V} m³；空气质量 = 1.2 kg/m³ × {V} m³ = {m} kg，约等于 {p} 个 50 kg 的同学。换成 g/cm³，空气的密度是 {g}。',
    s2hint: '观察顺序：先保持 8 m × 6 m × 3 m，读出约 173 kg——比三个同学还重。再只把长从 8 m 拖到 12 m（体积变成 1.5 倍），质量也正好变成 1.5 倍：密度不变，质量只跟体积成正比。',

    s3k: '第 3 步 · 认出金属块',
    s3t: '形状不规则的金属块，怎样量出它的密度、认出它是什么？',
    s3e: '这一步要回答：体积量不出来时怎么办。用<strong>排水法</strong>：量筒里先装 50 mL 水（1 mL = 1 cm³），把金属块完全浸没进去，水面升高了多少毫升，金属块的体积就是多少立方厘米。质量已经用天平称好。不过量筒每格 1 mL，每次读数都可能差半格，放入前、放入后两次读数加起来，体积最多可能差 1 mL；所以算出的密度是一个范围，不是一个精确的点。下图把这个范围和几种金属的密度放在同一根数轴上比较。',
    objLabel: '金属块 {id}（{m} g）',
    drop: '放进量筒', lift: '取出来',
    c3cyl: '量筒（每格 1 mL）',
    c3axis: '密度（g/cm³）：测量范围与几种金属',
    s3lgRange: '测得的范围', s3lgRef: '参考：',
    s3wait: '金属块 {id} 质量 {m} g。按「放进量筒」，读出水面升高多少。',
    s3readout: '金属块 {id}：{m} g，水面 {b} mL → {a} mL，体积 {V} cm³，ρ = {m} ÷ {V} = {r} g/cm³。考虑每次读数可能差半格，ρ 在 {lo} 到 {hi} 之间：{fit}',
    s3one: '只有{names}落在这个范围里，就是它。',
    s3many: '{names}都落在这个范围里，分辨不出来——金属块太小，量筒的误差占比太大。',
    s3hint: '观察顺序：依次放入 A、B、C、D，看下图橙色范围的宽窄。A 是 20 cm³，范围很窄，只框住铝；B 只有 5 cm³，同样差 1 mL，占的比例大得多，范围宽到把铁和铜都框进去，认不出来。想认出 B，就要换刻度更细的量筒，或者一次多放几块同样的。',

    s4k: '第 4 步 · 王冠是纯金的吗',
    s4t: '一顶 1000 g 的王冠掺了银，称重看不出来，量体积能看出来吗？',
    s4e: '这一步要回答：混合物的密度怎么算，能不能拿来检验真假。传说阿基米德就被问过这个问题。王冠质量 1000 g；金的密度 19.3 g/cm³，银的密度 10.5 g/cm³。掺进的银越多，同样 1000 g 占的体积越大：总体积 = 金的质量 ÷ 19.3 + 银的质量 ÷ 10.5。用排水法量出总体积，再算<strong>平均密度</strong> = 总质量 ÷ 总体积，和纯金比较。滑杆是银占王冠质量的百分比。',
    f4Slider: '银占的质量（%）',
    c4cyl: '排开的水：纯金块 vs 王冠',
    cylGold: '1000 g 纯金', cylCrown: '1000 g 王冠',
    c4plot: '平均密度（g/cm³）— 银占的质量（%）',
    s4lgAvg: '平均密度 = 总质量 ÷ 总体积', s4lgNaive: '错误算法：两种密度按质量直接平均', s4lgTrail: '试过的比例',
    s4readout: '银占 {p}%：金 {mg} g、银 {ms} g，总体积 {V} cm³，比同样重的纯金多排开 {x} mL 水；平均密度 {r} g/cm³。如果把两种密度按质量直接平均，会错算成 {n} g/cm³。',
    s4hint: '观察顺序：从 0% 往右拖：纯金王冠排开约 51.8 mL 水，银占 30% 时多排开约 13 mL——用 1 mL 刻度的量筒完全看得出。再看下图：青色曲线（真正的平均密度）一直在橙色虚线下面，因为银虽然只占 30% 的质量，却占了 44% 的体积。平均密度要用总质量除以总体积，不能把两种密度直接平均。',

    s5k: '第 5 步 · 密度塔',
    s5t: '四种液体倒进同一个杯子，为什么会分层？一个小方块会停在哪一层？',
    s5e: '这一步要回答：密度决定上下次序。把蜂蜜、洗洁精、水、植物油依次慢慢倒进杯子，它们会分成四层：密度大的沉到下面，小的浮在上面。放进一个小方块，它会穿过所有比它「轻」的液体，停在第一层比它「重」的液体上面，夹在两层的分界处；如果比最上面的油还轻，就浮在油面上；比蜂蜜还重，就沉到杯底。为什么密度小的会被托起来，见<a class="xlink" href="../buoyancy-archimedes/#step3">浮力页（Claude Code 版）第 3 步：浮还是沉，比的是两个密度</a>。',
    r5Slider: '小方块的密度（g/cm³）',
    c5tower: '密度塔（每层 4 cm）',
    c5plot: '方块底面离杯底的高度（cm）— 方块密度',
    lOil: '植物油 0.92', lWater: '水 1.00', lSoap: '洗洁精 1.06', lHoney: '蜂蜜 1.42',
    nOil: '植物油', nWater: '水', nSoap: '洗洁精', nHoney: '蜂蜜',
    s5surface: '方块密度 {r}：比植物油（0.92）还小，浮在油面上，{pct}% 浸在油里。',
    s5iface: '方块密度 {r}：比{up}大、比{low}小，停在两者的分界处：{pct}% 在{low}里，其余在{up}里。',
    s5floor: '方块密度 {r}：比蜂蜜（1.42）还大，沉到杯底。',
    s5hint: '观察顺序：把方块的密度从 0.50 慢慢拖到 1.60，看下图的点：不是平滑地往下走，而是一段一段的台阶——密度在 0.92、1.00、1.06、1.42 附近时，方块突然掉到下一层。每一级台阶对应一层液体。真实的密度塔放久了，相邻液体会慢慢互相溶解，分界会变模糊。',

    s6k: '第 6 步 · 收束',
    s6t: '一句话说清密度',
    s6fin: '<strong>密度</strong>是每单位体积里有多少质量，ρ = m / V。同一种材料切大切小，质量和体积成正比，比值不变，所以它能用来认材料；反过来，知道密度就能用 m = ρV 算出称不了的质量，用 V = m / ρ 算出量不了的体积。混合物要用总质量除以总体积；物体在液体里是浮是沉，比的也是密度。',
    formula: 'ρ = m / V　m = ρV　V = m / ρ\n1 g/cm³ = 1000 kg/m³\n平均密度 = 总质量 ÷ 总体积',
    boundary: '适用范围：均匀、实心的材料，常温常压下的典型密度；真实材料的密度会随温度、杂质、气孔略有变化（例如木头差别很大）。天平读到 0.1 g、量筒每格 1 mL 是本页设定；王冠和密度塔的数值是理想化的，没有考虑金银混合后体积的微小变化、液体之间缓慢的互溶。',
    linksTitle: '站内相关',
    lk1: '→ 浮力（Claude Code 版）第 3 步：松手后是浮是沉，比的就是物体和液体的密度',
    lk2: '→ 反比例第 0 步：乘积不变——质量一定时，密度越大体积越小',
    lk3: '→ 一次函数第 0 步：直线的陡度——m–V 图的陡度就是密度',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《密度》的平行版本。'
  },
  en: {
    pageTitle: 'Density · The Ratio That Gives a Material Away',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Density →',
    navLabel: 'Density steps',
    tagline: 'How heavy a thing is, or how big it is, tells you little on its own about what it is made of; divide one by the other, though, and the result depends almost only on the material. In seven steps you find that ratio, use it to weigh a roomful of air, identify unknown metal pieces with a measuring cylinder, test whether a crown is pure gold, and watch several liquids line up by it.',
    nav0: '0 Same mass', nav1: '1 Big or small', nav2: '2 A roomful of air', nav3: '3 Identify a metal', nav4: '4 The crown', nav5: '5 Density tower', nav6: '6 Wrap-up',
    clearRecords: 'Clear records', clearTrail: 'Clear trail', sep: '; ', and: ' and ',
    mPine: 'pine', mIce: 'ice', mAl: 'aluminium', mIron: 'iron', mCopper: 'copper', mLead: 'lead', mGold: 'gold', mSilver: 'silver',

    s0k: 'Step 0 · Four pieces, same mass',
    s0t: 'Pine, ice, aluminium and iron of the same mass: how much room does each take?',
    s0e: 'This step answers: for the same mass, how different are the volumes of different materials? <strong>Mass</strong> is how much matter a thing contains, measured on a balance in grams (g); <strong>volume</strong> is how much space it takes up, in cubic centimetres (cm³ — a little cube 1 cm on each side). The four pieces below all have the same mass and are drawn as cubes with true-to-scale sides. The bars underneath show each volume.',
    m0Slider: 'Mass of each piece (g)',
    c0cubes: 'Four cubes of equal mass (drawn to the same scale)',
    c0bars: 'Volume (cm³)',
    s0readout: 'Each piece {m} g: {list}. The pine takes up {ratio} times the room of the iron.',
    s0item: '{name} {V} cm³',
    s0hint: 'What to watch: drag the mass and all four cubes grow or shrink together, but how they compare never changes: the pine is always about 16 times the size of the iron. Double the mass and every volume doubles too. So “how heavy” and “how big” only tell you the material when you look at them together — the next step divides one by the other.',

    s1k: 'Step 1 · Cut big, cut small',
    s1t: 'Cut one material into pieces of different sizes: does mass divided by volume change?',
    s1e: 'This step answers: is mass ÷ volume set by the material alone? Pick a material and press “Cut a piece, measure it, weigh it”: each time a box-shaped piece is cut, its length, width and height are measured to get the volume, and it is weighed on a balance that reads to 0.1 g. Each piece adds a point to the plot: volume across, mass up. If the ratio does not change, the points for one material lie on a straight line through the origin (<a class="xlink" href="../../../math/algebra/linear-functions/#step0">step 0 of linear functions: a line’s steepness is how much it climbs per step</a>), and the steepness of that line is the ratio. That ratio is called <strong>density</strong>: ρ = m / V, the number of grams in each cubic centimetre, in g/cm³.',
    cut1: 'Cut a piece, measure it, weigh it',
    c1piece: 'The piece just cut',
    c1plot: 'Mass m (g) vs volume V (cm³)',
    s1lgLine: 'dashed: through the origin, steepness = average ratio of the points',
    s1readout: '{name} piece {n}: {a} cm × {b} cm × {c} cm = {V} cm³, weighs {m} g, m ÷ V = {r} g/cm³. {k} pieces of {name} recorded; the line’s steepness is {s} g/cm³.',
    s1none: 'Press “Cut a piece, measure it, weigh it” to start; to use another material, pick it above first.',
    s1all: 'All six pieces of this material are cut; switch to another material.',
    s1hint: 'What to watch: pick aluminium and press the cut button six times. The points land further and further out, yet all sit on one dashed line, with m ÷ V = 2.7 for every piece. Switch to iron and to pine: each has its own line, iron the steepest (7.9), pine the flattest (0.5). The size of a piece only decides where on its line the point lands; the ratio is set by the material.',

    s2k: 'Step 2 · A roomful of air',
    s2t: 'How heavy is the air in a classroom?',
    s2e: 'This step answers: if you know a density, how do you find the mass of something you cannot weigh? Mass = density × volume, m = ρV. A room is big, so use cubic metres for volume (m³, a cube 1 m on each side) and kilograms for mass, which makes density kg/m³. To convert: 1 m³ = 100 × 100 × 100 cm³ = 1 000 000 cm³ and 1 kg = 1000 g, so 1 g/cm³ = 1000 kg/m³. Air at about 20 °C has a density of about 1.2 kg/m³, or 0.0012 g/cm³ — tiny, but a room is large.',
    L2Slider: 'Room length (m)', W2Slider: 'Room width (m)', H2Slider: 'Room height (m)',
    c2room: 'Floor plan: each square 1 m × 1 m, standing H high',
    c2people: 'Mass of the air, counted in 50 kg students',
    s2readout: '{L} m × {W} m × {H} m = {V} m³; mass of air = 1.2 kg/m³ × {V} m³ = {m} kg, about {p} students of 50 kg. In g/cm³ the air’s density is {g}.',
    s2hint: 'What to watch: start at 8 m × 6 m × 3 m and read about 173 kg — heavier than three students. Then drag only the length from 8 m to 12 m (1.5 times the volume) and the mass becomes exactly 1.5 times as much: the density stays the same, so the mass is simply proportional to the volume.',

    s3k: 'Step 3 · Identify a metal piece',
    s3t: 'How do you measure the density of an oddly shaped metal piece and work out what it is?',
    s3e: 'This step answers: what to do when you cannot measure the volume with a ruler. Use <strong>displacement</strong>: put 50 mL of water in a measuring cylinder (1 mL = 1 cm³), sink the metal piece completely, and the number of millilitres the water rises is the piece’s volume in cubic centimetres. Its mass is already known from the balance. But the cylinder is marked every 1 mL and each reading can be off by half a mark; with two readings, before and after, the volume can be off by up to 1 mL. So the density you get is a range, not an exact point. The lower plot puts that range on the same number line as the densities of several metals.',
    objLabel: 'Piece {id} ({m} g)',
    drop: 'Put it in the cylinder', lift: 'Take it out',
    c3cyl: 'Measuring cylinder (1 mL marks)',
    c3axis: 'Density (g/cm³): measured range and some metals',
    s3lgRange: 'measured range', s3lgRef: 'reference:',
    s3wait: 'Piece {id} has a mass of {m} g. Press “Put it in the cylinder” and read how far the water rises.',
    s3readout: 'Piece {id}: {m} g, water {b} mL → {a} mL, volume {V} cm³, ρ = {m} ÷ {V} = {r} g/cm³. Allowing half a mark of error on each reading, ρ lies between {lo} and {hi}: {fit}',
    s3one: 'only {names} falls inside that range, so that is what it is.',
    s3many: '{names} all fall inside that range, so you cannot tell — the piece is so small that the cylinder’s error is a large share of its volume.',
    s3hint: 'What to watch: put in A, B, C and D in turn and compare how wide the orange range is. A is 20 cm³, so its range is narrow and catches only aluminium. B is only 5 cm³: the same 1 mL of error is a much bigger share, and the range grows wide enough to hold both iron and copper, so it cannot be identified. To identify B you would need a cylinder with finer marks, or several identical pieces measured together.',

    s4k: 'Step 4 · Is the crown pure gold?',
    s4t: 'A 1000 g crown has some silver mixed in. Weighing cannot tell — can measuring its volume?',
    s4e: 'This step answers: how to work out the density of a mixture, and whether it can expose a fake. Legend has it Archimedes was asked exactly this. The crown has a mass of 1000 g; gold has a density of 19.3 g/cm³ and silver 10.5 g/cm³. The more silver mixed in, the more room the same 1000 g takes: total volume = mass of gold ÷ 19.3 + mass of silver ÷ 10.5. Measure the total volume by displacement, then compute the <strong>average density</strong> = total mass ÷ total volume and compare it with pure gold. The slider is silver’s share of the crown’s mass.',
    f4Slider: 'Silver share of the mass (%)',
    c4cyl: 'Water displaced: pure gold vs the crown',
    cylGold: '1000 g pure gold', cylCrown: '1000 g crown',
    c4plot: 'Average density (g/cm³) vs silver share of the mass (%)',
    s4lgAvg: 'average density = total mass ÷ total volume', s4lgNaive: 'wrong method: averaging the two densities by mass', s4lgTrail: 'shares you tried',
    s4readout: '{p}% silver: {mg} g of gold and {ms} g of silver, total volume {V} cm³, displacing {x} mL more water than pure gold of the same mass; average density {r} g/cm³. Averaging the two densities by mass would wrongly give {n} g/cm³.',
    s4hint: 'What to watch: drag right from 0 %. A pure-gold crown displaces about 51.8 mL of water; with 30 % silver it displaces about 13 mL more — easy to see on a 1 mL cylinder. Then look at the plot: the cyan curve (the true average density) always stays below the orange dashed line, because silver making up 30 % of the mass takes up 44 % of the volume. An average density has to be total mass over total volume, not the two densities averaged.',

    s5k: 'Step 5 · A density tower',
    s5t: 'Pour four liquids into one glass: why do they form layers, and where does a small cube come to rest?',
    s5e: 'This step answers: density decides the order from top to bottom. Pour honey, dish soap, water and vegetable oil slowly into a glass, one after another, and they settle into four layers: the denser ones sink to the bottom, the less dense ones float on top. Drop in a small cube and it passes through every liquid less dense than itself and stops on top of the first one that is denser, wedged at the boundary between two layers. If it is less dense than the oil on top, it floats on the oil; if it is denser than honey, it sinks to the bottom. Why the less dense one gets pushed up is in <a class="xlink" href="../buoyancy-archimedes/#step3">step 3 of the buoyancy lesson (Claude Code edition): float or sink comes down to two densities</a>.',
    r5Slider: 'Density of the cube (g/cm³)',
    c5tower: 'Density tower (each layer 4 cm)',
    c5plot: 'Height of the cube’s bottom above the floor (cm) vs cube density',
    lOil: 'vegetable oil 0.92', lWater: 'water 1.00', lSoap: 'dish soap 1.06', lHoney: 'honey 1.42',
    nOil: 'vegetable oil', nWater: 'water', nSoap: 'dish soap', nHoney: 'honey',
    s5surface: 'Cube density {r}: less than vegetable oil (0.92), so it floats on the oil with {pct}% of it in the oil.',
    s5iface: 'Cube density {r}: more than {up} and less than {low}, so it rests on the boundary between them: {pct}% in the {low}, the rest in the {up}.',
    s5floor: 'Cube density {r}: more than honey (1.42), so it sinks to the bottom.',
    s5hint: 'What to watch: drag the cube’s density slowly from 0.50 to 1.60 and follow the dots in the plot. They do not slide down smoothly but drop in steps: near 0.92, 1.00, 1.06 and 1.42 the cube suddenly falls to the next layer. Each step belongs to one liquid. A real density tower left standing slowly blurs, as neighbouring liquids gradually mix.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Density in one sentence',
    s6fin: '<strong>Density</strong> is how much mass fits in each unit of volume, ρ = m / V. Cut one material big or small and mass stays proportional to volume, so the ratio is fixed — that is why it identifies a material. Turn it around: knowing the density gives a mass you cannot weigh, m = ρV, or a volume you cannot measure, V = m / ρ. A mixture needs total mass over total volume, and whether something floats or sinks in a liquid also comes down to comparing densities.',
    formula: 'ρ = m / V　m = ρV　V = m / ρ\n1 g/cm³ = 1000 kg/m³\naverage density = total mass ÷ total volume',
    boundary: 'Scope: uniform, solid materials with typical densities at room temperature and pressure; real materials vary a little with temperature, impurities and pores (wood varies a lot). The balance reading to 0.1 g and the 1 mL cylinder are this page’s settings; the crown and the tower are idealised, ignoring the slight change in volume when gold and silver are alloyed and the slow mixing between liquids.',
    linksTitle: 'Related lessons on this site',
    lk1: '→ Buoyancy (Claude Code edition), step 3: float or sink comes down to the densities of object and liquid',
    lk2: '→ Inverse proportion, step 0: a fixed product — for a fixed mass, the denser it is, the smaller the volume',
    lk3: '→ Linear functions, step 0: a line’s steepness — the steepness of the m–V line is the density',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Density”.'
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
