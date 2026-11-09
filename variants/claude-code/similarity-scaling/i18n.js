'use strict';
// Similarity & scaling lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '相似与缩放 · 放大 k 倍，什么跟着变几倍',
    back: '← 知识索引',
    compare: '对照另一版本：相似与缩放 · 长度、面积、体积各变几倍 →',
    navLabel: '相似与缩放步骤导航',
    tagline: '把一个图形从一点出发放大到 k 倍，每条边都变成 k 倍，角一个也不变；可面积变成 k² 倍，体积变成 k³ 倍。本页一步步把这三个倍数看清楚，再用它量一栋楼的高，并解释为什么碎冰比整块冰化得快。',
    nav0: '0 从一点放大', nav1: '1 什么算相似', nav2: '2 面积 ×k²', nav3: '3 体积 ×k³', nav4: '4 用尺子量楼', nav5: '5 切碎', nav6: '6 收束',

    s0k: '第 0 步 · 从一点放大',
    s0t: '从一点出发把图形放大 k 倍，边和角各怎样变？',
    s0e: '这一步要回答：把四边形 ABCD「放大 k 倍」到底是什么操作，放大后边和角各变成什么？做法是选一个<strong>放大中心</strong> O，从 O 向每个顶点连一条射线，把顶点沿射线推到原来距离的 k 倍处：OA′ = k × OA，B′、C′、D′ 同理。得到的新图形和原图形<strong>相似</strong>：形状一样，只是大小不同。k 叫<strong>相似比</strong>（新图形的边 ÷ 原图形的对应边）；k 大于 1 是放大，小于 1 是缩小。读数里的边长和角都由顶点坐标量出。',
    sep: '、', kSlider: '相似比 k', oSlider: '放大中心 O 的位置',
    c0a: '虚线 = 原图形 ABCD，实线 = 放大后的 A′B′C′D′',
    lgOrig: '原图形', lgImg: '放大后', lgRay: '从 O 出发的射线',
    s0readout: 'k = {k}：四条对应边之比 A′B′/AB、B′C′/BC、C′D′/CD、D′A′/DA 都等于 {r}（四个比值最大相差 {d}）。四个角放大前是 {a0}，放大后是 {a1}。',
    s0hint: '观察顺序：先只拖「相似比 k」：虚线原图不动，实线顶点沿着各自的射线滑，k = 1 时两者重合，k < 1 时实线缩到 O 和原图之间。读数里四个比值始终相同、四个角始终不变。再拖「放大中心 O 的位置」：新图形整体挪了位置，比值和角度仍然不变。',

    s1k: '第 1 步 · 什么算相似',
    s1t: '只把图形横着拉长，算不算相似？',
    s1e: '这一步要回答：两个图形「看起来差不多」，什么时候才算相似？判断标准：所有对应边的比都相等（都等于同一个相似比），而且对应角都相等。这里把四边形横向放大 kx 倍、纵向放大 ky 倍（以顶点 A 为基点）。kx = ky 时就是上一步的放大；kx ≠ ky 时，横着的边和竖着的边伸长的倍数不一样，四个比值就各不相同，角也跟着变了，图形被「压扁」或「拉高」，不再相似。右图把四个边长比画成四根柱子：一样高才相似。',
    kxSlider: '横向倍数 kx', kySlider: '纵向倍数 ky',
    c1a: '虚线 = 原图形，实线 = 拉伸后', c1b: '四条边各被放大了几倍',
    s1yes: '四个边长比都是 {r}，四个角 {a1} 和原来一样：相似，相似比 {r}。',
    s1no: '四个边长比是 {list}，最大相差 {d}；四个角从 {a0} 变成了 {a1}。比值不全相等，角也变了：不相似。',
    s1hint: '观察顺序：先保持 ky 不动，只拖 kx：柱子高低错开，读数说「不相似」，图形明显被横着拉扁。再把 ky 拖到和 kx 相同的值：四根柱子一样高，角度回到原值。相似必须「各个方向放大同样的倍数」。',

    s2k: '第 2 步 · 面积',
    s2t: '边长变成 k 倍，面积变成几倍？',
    s2e: '这一步要回答：图形放大 k 倍以后，周长和<strong>面积</strong>（图形盖住多少个 1 × 1 的单位方格）各变成几倍？图形是三个单位方格拼成的 L 形，原来周长 8、面积 3。放大 k 倍后，每条边都是 k 倍，所以周长是 k 倍；但每个单位方格都变成了 k × k 的方块，横着 k 格、竖着 k 格，一共 k × k = k² 格，所以面积是 k² 倍（<a class="xlink" href="../../../math/arithmetic/area-model/#step1">→ 乘法是面积页第 1 步：长 × 宽为什么就是格子数</a>）。k 不是整数时格子数不出来，但比例照样成立：读数里的面积由顶点坐标直接算出。',
    kSlider2: '相似比 k',
    c2a: '放大后的 L 形（细线是单位方格）', c2b: '周长和面积各是原来的几倍',
    lgPer: '周长比 = k', lgArea: '面积比 = k²',
    s2readout: 'k = {k}：周长 {p}（原来 8，是 {pr} 倍），面积 {a}（原来 3，是 {ar} 倍 = {k}²）。',
    s2cells: '每个原来的方格变成 {k} × {k} = {kk} 个小方格。',
    s2hint: '观察顺序：先拖到 k = 2、3，数一数一个原方格（同一种颜色）里有几个小格：4 个、9 个。再从 0.5 一路拖到 3：右图记下每个试过的 k，周长点沿直线走，面积点沿越来越陡的曲线走；k = 3 时周长才 3 倍，面积已经 9 倍。k < 1 时面积缩得比周长更快。',

    s3k: '第 3 步 · 体积',
    s3t: '棱长变成 k 倍，体积和表面积各变成几倍？',
    s3e: '这一步要回答：立体图形放大 k 倍，<strong>体积</strong>（装得下多少个 1 × 1 × 1 的单位小正方体）和<strong>表面积</strong>（外面一共有多少个单位小正方形）各变成几倍？用小正方体堆一个棱长 k 的大正方体：每一层是 k × k = k² 块，一共 k 层，所以体积是 k³；表面有 6 个面，每个面 k² 个小方格，所以表面积是 6k²。按「一层层堆起来」，看体积是怎样一层层累积的。',
    kCube: '棱长 k（单位小正方体的个数）', stack: '一层层堆起来',
    c3a: '棱长 {k} 的正方体', c3b: '和棱长 1 比：长度、面积、体积',
    barLen: '棱长', barArea: '表面积', barVol: '体积',
    s3prog: '已堆 {l}/{k} 层，{c} 块 · ',
    s3readout: '棱长 {k}：体积 {v} 块 = {k}³；表面积 {s} 格 = 6 × {k}²。和棱长 1 的小正方体比，长度 {k} 倍，表面积 {k2} 倍，体积 {v} 倍。每块体积分到的表面积 = {s} ÷ {v} = {r}。',
    s3hint: '观察顺序：从 k = 1 拖到 5，看右边三根柱子：棱长只到 5，体积已经冲到 125，柱子长得最快。再看读数最后一项「每块体积分到的表面积」：6、3、2、1.5、1.2，越大的正方体，每份体积分到的表面越少——第 5 步要用到这一点。',

    s4k: '第 4 步 · 用尺子量楼',
    s4t: '站在远处，怎样用一把尺子量出一栋楼有多高？',
    s4e: '这一步要回答：楼太高够不着，能不能只用一把尺子和步测的距离算出楼高？伸直手臂竖着拿尺子，尺子离眼睛 d = 0.6 米；闭上一只眼，让尺子的 0 刻度对准楼底，读出楼顶对准的刻度 h。眼睛—尺子底—尺子顶构成一个小三角形，眼睛—楼底—楼顶构成一个大三角形：它们在眼睛处共用同一个角，尺子和楼又都竖直、彼此平行，所以大三角形是小三角形放大 k = D ÷ d 倍得到的（D 是你离楼的距离）。于是楼高 H = k × h。小孔成像里像的大小也是这样算的（<a class="xlink" href="../../../physics/optics/pinhole-camera/#step2">→ 小孔成像页第 2 步：像高 ÷ 物高 = 像距 ÷ 物距</a>）。',
    dSlider: '你离楼的距离 D（米）', hSlider: '尺子上的读数 h（厘米）',
    c4a: '示意图：横向距离压缩显示，两个三角形仍保持相似',
    eye: '眼睛', ruler: '尺子', building: '楼',
    s4readout: '相似比 k = D ÷ d = {D} 米 ÷ 0.6 米 = {k}。楼高 H = k × h = {k} × {h} 厘米 = {H} 米。',
    s4hint: '观察顺序：先固定 h，把 D 拖远：同样的读数，离得越远，算出的楼越高——远处的高楼在尺子上只占一小段。再固定 D，拖 h：楼高和读数成正比。这个方法要求尺子竖直、眼睛和楼底大致一样高；手臂长度 0.6 米是示意值，用之前要量自己的。',

    s5k: '第 5 步 · 切碎',
    s5t: '一块冰切成小块，体积没变，表面变了多少？',
    s5e: '这一步要回答：把一块棱长 6 厘米的正方体冰沿每条棱切成 m 段，得到 m × m × m 块小正方体，总体积不变，总表面积变成几倍？每块小正方体棱长是 6 ÷ m 厘米，是原来的 1/m，按第 2、3 步：每块的表面积是原来的 1/m²，块数是 m³ 倍，所以总表面积是 m³ × 1/m² = m 倍。体积和表面积随大小变化的倍数不一样（一个按 k³、一个按 k²），切得越碎，同样多的冰露在外面的面越多。冰和空气接触的面越大，传进来的热越多，所以碎冰化得比整块快；方糖碾碎了溶得快也是这个道理（实际快慢还和温度、搅拌有关，这里只比较表面积）。',
    mSlider: '每条棱切成 m 段',
    c5a: '切成 {n} 块（为了看清，块与块之间拉开了缝）', c5b: '总表面积（cm²）随 m 变化',
    s5readout: '切成 {n} 块，每块棱长 {e} 厘米、表面积 {s} 平方厘米。总体积 {v} 立方厘米（不变）；总表面积 {t} 平方厘米，是整块的 {m} 倍。',
    s5hint: '观察顺序：把 m 从 1 拖到 6：左图块数从 1 变成 216，右图记下每个试过的 m，点排成一条直线——总表面积和 m 成正比。读数里的总体积一直是 216。',

    s6k: '第 6 步 · 收束',
    s6t: '长度、面积、体积，三种倍数',
    s6fin: '从一点出发放大 k 倍，得到的图形与原图相似：对应边都是 k 倍，对应角都不变；只往一个方向拉伸就不相似。面积由两个方向的长度相乘，所以是 k² 倍；体积由三个方向相乘，所以是 k³ 倍。相似三角形让我们用一把尺子量楼高；k² 与 k³ 的差别解释了为什么碎冰化得快。',
    formula: '长度 × k\n面积 × k²\n体积 × k³\n表面积 ÷ 体积 × 1/k',
    boundary: '适用范围：这些倍数只对相似图形成立，也就是各个方向放大同样的倍数。测楼高时假设尺子竖直、与楼平行、眼睛与楼底一样高；手臂长度要自己量。切冰只比较了表面积，真实的融化快慢还取决于温度、风和冰块之间是否挤在一起。',
    linksTitle: '接着看',
    lk1: '→ 小孔成像页第 2 步：像的大小由两个距离之比决定（相似三角形）',
    lk2: '→ 乘法是面积页第 1 步：面积就是数格子，长 × 宽',
    lk3: '→ 多边形内角和页第 0 步：三角形三个角之和是 180°（相似图形的角为什么能保持不变）',
    lk4: '→ 周长 vs 面积页第 2 步：面积相同的图形，周长可以很不一样',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《相似与缩放 · 长度、面积、体积各变几倍》的平行版本。'
  },
  en: {
    pageTitle: 'Similarity & Scaling · Enlarge by k, and What Grows How Much',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Similarity & Scaling · Lengths, Areas and Volumes Each Change Differently →',
    navLabel: 'Similarity and scaling steps',
    tagline: 'Enlarge a shape k times from one point and every side becomes k times as long while not a single angle changes — yet the area becomes k² times as big and the volume k³ times. This page makes those three factors visible one at a time, then uses them to measure a building and to explain why crushed ice melts faster than a block.',
    nav0: '0 Enlarge from a point', nav1: '1 What counts as similar', nav2: '2 Area ×k²', nav3: '3 Volume ×k³', nav4: '4 Measure a building', nav5: '5 Crush it', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · ENLARGE FROM A POINT',
    s0t: 'Enlarge a shape k times from one point — what happens to its sides and angles?',
    s0e: 'The question here: what exactly does “enlarge quadrilateral ABCD k times” mean, and what becomes of its sides and angles? Pick a <strong>centre of enlargement</strong> O, draw a ray from O through each corner, and push each corner along its ray to k times its distance: OA′ = k × OA, and the same for B′, C′, D′. The new shape is <strong>similar</strong> to the old one: the same shape at a different size. k is the <strong>scale factor</strong> (a side of the new shape ÷ the matching side of the old one); k above 1 enlarges, below 1 shrinks. The lengths and angles in the readout are measured from the corner coordinates.',
    sep: ', ', kSlider: 'Scale factor k', oSlider: 'Position of the centre O',
    c0a: 'Dashed = original ABCD, solid = enlarged A′B′C′D′',
    lgOrig: 'original', lgImg: 'enlarged', lgRay: 'rays from O',
    s0readout: 'k = {k}: the four ratios A′B′/AB, B′C′/BC, C′D′/CD, D′A′/DA all equal {r} (they differ by at most {d}). The four angles are {a0} before and {a1} after.',
    s0hint: 'What to watch: first drag only “Scale factor k”. The dashed original stays put while each solid corner slides along its own ray; at k = 1 the two coincide, and below 1 the solid shape shrinks in between O and the original. The four ratios in the readout stay equal and the four angles stay the same. Then drag “Position of the centre O”: the new shape moves somewhere else, but the ratios and angles still do not change.',

    s1k: 'STEP 1 · WHAT COUNTS AS SIMILAR',
    s1t: 'Stretch a shape sideways only — is it still similar?',
    s1e: 'The question here: two shapes “look alike” — when are they actually similar? The test: every pair of matching sides has the same ratio (one common scale factor), and matching angles are equal. Here the quadrilateral is stretched kx times across and ky times up (measured from corner A). When kx = ky this is the enlargement from step 0. When kx ≠ ky, sides running across grow by a different factor from sides running up, so the four ratios all differ, the angles change too, and the shape gets squashed or stretched — no longer similar. The right panel draws the four side ratios as four bars: equal heights mean similar.',
    kxSlider: 'Across factor kx', kySlider: 'Up factor ky',
    c1a: 'Dashed = original, solid = stretched', c1b: 'How many times each side grew',
    s1yes: 'All four side ratios are {r} and the four angles {a1} are unchanged: similar, with scale factor {r}.',
    s1no: 'The four side ratios are {list}, differing by up to {d}; the angles went from {a0} to {a1}. The ratios are not all equal and the angles changed: not similar.',
    s1hint: 'What to watch: keep ky fixed and drag only kx. The bars go uneven, the readout says “not similar”, and the shape is visibly squashed sideways. Then set ky to the same value as kx: the four bars line up and the angles return to their original values. Similar means “the same factor in every direction”.',

    s2k: 'STEP 2 · AREA',
    s2t: 'Sides become k times as long — how many times the area?',
    s2e: 'The question here: when a shape is enlarged k times, how many times bigger do its perimeter and its <strong>area</strong> (how many 1 × 1 unit squares it covers) get? The shape is an L made of three unit squares: perimeter 8, area 3. After enlarging by k, every side is k times as long, so the perimeter is k times as big. But every unit square has become a k × k block — k squares across and k up, k × k = k² in all — so the area is k² times as big (<a class="xlink" href="../../../math/arithmetic/area-model/#step1">→ Area model, step 1: why length × width counts the squares</a>). When k is not a whole number you cannot count whole squares, but the ratio still holds: the area in the readout is computed straight from the corner coordinates.',
    kSlider2: 'Scale factor k',
    c2a: 'The enlarged L (thin lines are unit squares)', c2b: 'Perimeter and area, as multiples of the original',
    lgPer: 'perimeter ratio = k', lgArea: 'area ratio = k²',
    s2readout: 'k = {k}: perimeter {p} (was 8, so {pr} times), area {a} (was 3, so {ar} times = {k}²).',
    s2cells: 'Each original square has become {k} × {k} = {kk} small squares.',
    s2hint: 'What to watch: go to k = 2 and then 3 and count the small squares inside one original square (one colour): 4, then 9. Then drag from 0.5 all the way to 3. The right panel logs each k you try: the perimeter dots follow a straight line, the area dots a curve that keeps getting steeper. At k = 3 the perimeter is only 3 times as big, the area already 9 times. Below k = 1 the area shrinks faster than the perimeter.',

    s3k: 'STEP 3 · VOLUME',
    s3t: 'Edges become k times as long — how many times the volume and the surface?',
    s3e: 'The question here: enlarge a solid k times. How many times bigger do its <strong>volume</strong> (how many 1 × 1 × 1 unit cubes it holds) and its <strong>surface area</strong> (how many unit squares cover its outside) get? Build a cube of edge k out of unit cubes. Each layer is k × k = k² cubes and there are k layers, so the volume is k³. The surface has 6 faces of k² unit squares each, so the surface area is 6k². Press “Stack it layer by layer” to watch the volume pile up one layer at a time.',
    kCube: 'Edge k (in unit cubes)', stack: 'Stack it layer by layer',
    c3a: 'A cube of edge {k}', c3b: 'Compared with edge 1: length, area, volume',
    barLen: 'edge', barArea: 'surface', barVol: 'volume',
    s3prog: '{l}/{k} layers, {c} cubes stacked · ',
    s3readout: 'Edge {k}: volume {v} cubes = {k}³; surface {s} squares = 6 × {k}². Against the unit cube: length {k} times, surface {k2} times, volume {v} times. Surface per unit of volume = {s} ÷ {v} = {r}.',
    s3hint: 'What to watch: drag k from 1 to 5 and watch the three bars on the right: the edge only reaches 5 while the volume shoots up to 125 — that bar grows fastest. Then look at the last figure in the readout, surface per unit of volume: 6, 3, 2, 1.5, 1.2. The bigger the cube, the less surface each bit of volume gets — step 5 uses exactly this.',

    s4k: 'STEP 4 · MEASURE A BUILDING',
    s4t: 'From far away, how can a ruler tell you how tall a building is?',
    s4e: 'The question here: the building is far too tall to reach — can a ruler and a paced-out distance give its height? Hold a ruler upright at arm’s length, d = 0.6 m from your eye. Close one eye, line the ruler’s 0 up with the foot of the building and read the mark level with the top: h. Eye–ruler bottom–ruler top make a small triangle; eye–building foot–building top make a big one. They share the angle at your eye, and the ruler and the building are both upright, so parallel. The big triangle is therefore the small one enlarged by k = D ÷ d, where D is your distance from the building. So the height is H = k × h. A pinhole camera sizes its image the same way (<a class="xlink" href="../../../physics/optics/pinhole-camera/#step2">→ Pinhole camera, step 2: image height ÷ object height = image distance ÷ object distance</a>).',
    dSlider: 'Your distance from the building D (m)', hSlider: 'Ruler reading h (cm)',
    c4a: 'Sketch: distances squeezed sideways; the two triangles stay similar',
    eye: 'eye', ruler: 'ruler', building: 'building',
    s4readout: 'Scale factor k = D ÷ d = {D} m ÷ 0.6 m = {k}. Height H = k × h = {k} × {h} cm = {H} m.',
    s4hint: 'What to watch: fix h and drag D further away. The same reading now means a taller building — a tall building far away covers only a short stretch of the ruler. Then fix D and drag h: the height grows in proportion to the reading. The method needs the ruler upright and your eye roughly level with the foot of the building; 0.6 m is a sample arm length — measure your own before using it.',

    s5k: 'STEP 5 · CRUSH IT',
    s5t: 'Cut a block of ice into small cubes: the volume stays, but how much more surface?',
    s5e: 'The question here: cut a 6 cm ice cube into m pieces along every edge, giving m × m × m small cubes. The total volume stays the same; how many times bigger is the total surface? Each small cube has edge 6 ÷ m cm, 1/m of the original. By steps 2 and 3, each piece has 1/m² of the original surface, and there are m³ pieces, so the total surface is m³ × 1/m² = m times as big. Volume and surface scale differently (one as k³, the other as k²), so the finer you cut, the more of the same ice is exposed. More contact with the air lets more heat in, which is why crushed ice melts faster than a block, and crushed sugar dissolves faster than a lump (the actual speed also depends on temperature and stirring; here we only compare surface area).',
    mSlider: 'Pieces along each edge m',
    c5a: 'Cut into {n} pieces (pulled apart so you can see them)', c5b: 'Total surface (cm²) against m',
    s5readout: '{n} pieces, each with edge {e} cm and surface {s} cm². Total volume {v} cm³ (unchanged); total surface {t} cm², {m} times the whole block’s.',
    s5hint: 'What to watch: drag m from 1 to 6. On the left the pieces go from 1 to 216; the right panel logs each m you try, and the dots line up on a straight line — total surface is proportional to m. The total volume in the readout stays at 216 throughout.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Length, area, volume: three different factors',
    s6fin: 'Enlarge k times from a point and the new shape is similar to the old: every side k times as long, every angle unchanged. Stretch it one way only and it is not similar. Area multiplies lengths in two directions, so it grows k² times; volume multiplies three, so k³ times. Similar triangles let a ruler measure a building; the gap between k² and k³ explains why crushed ice melts faster.',
    formula: 'length × k\narea × k²\nvolume × k³\nsurface ÷ volume × 1/k',
    boundary: 'Where it applies: these factors hold only for similar shapes — the same factor in every direction. Measuring the building assumes the ruler is upright and parallel to it and your eye is level with its foot; measure your own arm. The ice comparison is about surface area only; real melting also depends on temperature, wind, and whether the pieces are packed together.',
    linksTitle: 'Where to next',
    lk1: '→ Pinhole camera, step 2: image size set by a ratio of two distances (similar triangles)',
    lk2: '→ Area model, step 1: area is counting squares, length × width',
    lk3: '→ Polygon angle sums, step 0: a triangle’s angles add up to 180° (why similar shapes can keep their angles)',
    lk4: '→ Perimeter vs area, step 2: shapes with the same area can have very different perimeters',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Similarity & Scaling · Lengths, Areas and Volumes Each Change Differently”.'
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
