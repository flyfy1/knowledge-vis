'use strict';
// Solid geometry lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '立体几何 · 转着看，切开看，拆开看',
    back: '← 知识索引',
    compare: '对照另一版本：立体几何 · 转一转，再切一刀 →',
    navLabel: '立体几何步骤导航',
    tagline: '纸上只能画平面，立体要靠「转着看、切开看、拆开看」来理解。这一页从数顶点、棱、面开始，再用平面去切正方体，把正方体刷上漆再切成小块，把它拆成三个一样的金字塔，最后把展开图一格格折回去。',
    nav0: '0 点、棱、面', nav1: '1 切一刀', nav2: '2 能切出几边形', nav3: '3 刷漆的方块', nav4: '4 三个金字塔', nav5: '5 斜着也一样', nav6: '6 展开图', nav7: '7 收束',

    s0k: '第 0 步 · 点、棱、面',
    s0t: '各种立体的顶点、棱、面个数之间，藏着什么固定的关系？',
    s0e: '这一步要回答：换不同的立体，顶点数、棱数、面数之间有没有一条总成立的关系？由平面多边形围成的立体叫<strong>多面体</strong>。围成它的每个多边形是一个<strong>面</strong>（个数记作 F），两个面相交的线段是一条<strong>棱</strong>（E），棱与棱的交点是<strong>顶点</strong>（V）。图中白点是顶点，青线是棱，灰色半透明的是面；离你远的棱画得暗一些。可以转动立体，确认没有藏起来的面。',
    solidPick: '选择立体',
    sol_cube: '正方体', sol_tri: '三棱柱', sol_pent: '五棱柱', sol_pyr: '四棱锥', sol_oct: '正八面体', sol_cut: '切掉一角的正方体', sol_frame: '中间有洞的方框',
    c0a: '转动立体，数顶点、棱、面',
    lgVert: '顶点', lgEdge: '棱（远处的较暗）', lgFace: '面',
    yawS: '左右转（度）', pitS: '俯视角（度）',
    s0readout: '{name}：顶点 V = {V}，棱 E = {E}，面 F = {F}。V − E + F = {V} − {E} + {F} = {chi}。',
    tally0: '已经数过：{list}',
    tallyItem: '{name}：{chi}',
    s0hint: '观察顺序：从正方体开始，一个个换立体，看读数最后一项。前六个都是 2：这就是欧拉公式 V − E + F = 2。「切掉一角」时，顶点多了 2 个（1 个变 3 个），棱多了 3 条，面多了 1 个（新的三角形），2 − 3 + 1 = 0，总数不变。最后换「中间有洞的方框」：结果是 0。欧拉公式只对没有洞、表面不自相交的多面体成立。',

    s1k: '第 1 步 · 切一刀',
    s1t: '用一个平面切正方体，切口是什么形状？面积多大？',
    s1e: '这一步要回答：同一个正方体，刀的方向和位置不同，切出的平面图形（叫<strong>截面</strong>）会怎样变？正方体棱长为 1。三种切法：<strong>平行于底面</strong>（刀从下往上平移）；<strong>斜着过一条棱的方向</strong>（刀面与底面成 45°，从一条棱移到对面那条棱）；<strong>垂直于体对角线</strong>（体对角线是连接正方体相对两个顶点、穿过内部的线段；刀面与它垂直，从一个顶点移到对面的顶点）。「刀的位置」是刀走过的路程占全程的比例，0 是起点、1 是终点。左图是正方体和橙色截面；右图上半是截面的真实形状（正对着看），下半记录每个试过的位置的截面面积。',
    cutPick: '选择切法',
    cut_face: '平行于底面', cut_edge: '斜着过一条棱的方向', cut_diag: '垂直于体对角线',
    c1a: '正方体与截面', c1b: '截面的真实形状 · 面积随位置变化',
    lgSec: '截面', lgCube: '正方体的棱', lgArea: '试过的位置的面积',
    posS: '刀的位置（占全程的比例）', sweep1: '从头扫到尾',
    s1readout: '{prog}{cut}，位置 {p}：截面是{shape}，{n} 条边，面积 {area}。',
    s1progress: '已扫 {c}/{N} · ',
    shp_triEq: '正三角形', shp_triIso: '等腰三角形', shp_tri: '三角形', shp_square: '正方形', shp_rect: '长方形', shp_rhombus: '菱形', shp_para: '平行四边形', shp_trap: '梯形', shp_quad: '四边形', shp_pent: '五边形', shp_hex: '六边形', shp_hexReg: '正六边形', shp_other: '多边形',
    s1hint: '观察顺序：每种切法都按「从头扫到尾」，看右下的面积曲线。平行于底面：一直是面积 1 的正方形。斜着过棱：一直是长方形，正中间（位置 0.5）最大，面积 √2 ≈ 1.414。垂直于体对角线：先是越来越大的正三角形，到 1/3 处正好穿过三个顶点（面积 ≈ 0.866），然后变成六边形，正中间是正六边形（面积 ≈ 1.299，这种切法里最大），再变回三角形。',

    s2k: '第 2 步 · 能切出几边形',
    s2t: '随便怎么切，截面最多能有几条边？三、四、五、六边形都切得出来吗？',
    s2e: '这一步要回答：刀的方向任意时，截面（平面切立体留下的切口）可能是几边形？刀面的方向用两个角控制：<strong>倾斜角</strong>是刀面的法线（垂直于刀面的方向）偏离竖直方向的角度，<strong>转向角</strong>是法线在水平面上转过的角度。「刀的位置」是刀从正方体最低的那个角（相对刀面方向而言）移到最高的那个角，走过的比例。每切出一种新的边数，下方对应的标签就亮起来。',
    c2a: '任意方向的一刀', c2b: '截面的真实形状',
    thS: '倾斜角（度）', phS: '转向角（度）', posS2: '刀的位置（占全程的比例）', clear2: '清除记录',
    chip: '{n} 边形', chipNever: '7 边形（切不出）',
    s2readout: '截面有 {n} 条边：{shape}，面积 {area}。已经找到 {found}/4 种。',
    s2hint: '观察顺序：倾斜角 0° 时一直是正方形。在默认的倾斜 35°、转向 20° 下只拖位置：两端是三角形，往中间走先变成四边形，再变成五边形（位置 0.4 就是）。六边形最难找：刀面要大致垂直于体对角线，把倾斜角调到 55° 左右、转向角调到 45° 左右，再把位置放在正中间 0.5 附近。不管怎么切，都不会超过 6 条边。',
    quizPrompt: '想一想：为什么正方体的截面不可能是七边形？',
    quizA: '七边形的面积太大，放不进正方体', quizB: '截面的每条边都落在正方体的一个面上，同一个面只能贡献一条边，而正方体只有 6 个面', quizC: '刀的角度只能取 5° 的倍数',
    check: '核对', correct: '对。刀面和正方体的一个面相交，交出的是一条线段，所以每个面最多给截面贡献一条边；6 个面最多 6 条边。',
    wrong: '再看看：截面的每条边是刀面和正方体哪个部分相交得到的？数一数正方体有几个这样的部分。',

    s3k: '第 3 步 · 刷漆的方块',
    s3t: '把大正方体外面刷上漆，再切成小方块：几块有漆、几块没漆？',
    s3e: '这一步要回答：棱长为 n 的正方体，表面刷漆后切成 n × n × n 个棱长为 1 的小方块，各有几个面带漆？这件事和<strong>表面积</strong>（所有面的面积之和）、<strong>体积</strong>（占了多少个单位小方块的空间）有关：带漆的小方块都贴着表面，没漆的藏在里面。小方块的颜色表示它有几个面带漆。「拆开」滑杆让小方块彼此分开，好看清里面。',
    c3a: '按带漆面数着色的小方块',
    lgP3: '3 面有漆（角上）', lgP2: '2 面有漆（棱上）', lgP1: '1 面有漆（面中间）', lgP0: '没有漆（里面）',
    nS: '大正方体的棱长 n', gapS: '拆开的程度',
    s3readout: 'n = {n}：一共 {total} 块。3 面有漆 {c3} 块，2 面 {c2} 块，1 面 {c1} 块，没漆 {c0} 块。表面积 6n² = {S}，体积 n³ = {Vol}，表面积 ÷ 体积 = {ratio}；没沾到漆的占 {frac}%。',
    s3hint: '观察顺序：先把「拆开」拖到一半以上，看清里面的灰块；再把 n 从 2 拖到 8。角上永远是 8 块，棱上 12(n − 2) 块，面中间 6(n − 2)² 块，里面 (n − 2)³ 块。n 翻倍（例如 4 → 8），表面积变 4 倍、体积变 8 倍：放大 k 倍，表面积乘 k²，体积乘 k³。所以大块里没漆的比例越来越高（n = 8 时约 42%）。',

    s4k: '第 4 步 · 三个金字塔',
    s4t: '为什么棱锥的体积是同底同高柱体的 1/3？',
    s4e: '这一步要回答：底面是正方形、顶点在上方的立体叫<strong>四棱锥</strong>（像金字塔）。同底同高的柱体体积是「底面积 × 高」，棱锥为什么只有它的 1/3？把棱长 1 的正方体的一个顶点当公共顶点，正方体里离它最远的三个面各当一个底面，就把正方体分成了<strong>三个</strong>四棱锥。它们底面都是 1 × 1、高都是 1，而且形状完全一样（交换坐标轴就能互相重合）。三块合起来是体积 1 的正方体，所以每块是 1/3。',
    c4a: '正方体拆成三个四棱锥',
    lgPyrA: '第 1 块', lgPyrB: '第 2 块', lgPyrC: '第 3 块',
    exS: '拆开的程度', play4: '拆开再合上',
    s4readout: '三块的体积（各自切成两个三棱锥再相加）：{v1}、{v2}、{v3}，合计 {sum}，等于正方体体积 1。每块底面积 1、高 1，体积 = 1/3 × 底面积 × 高 = {third}。',
    s4hint: '观察顺序：按「拆开再合上」，或拖「拆开」滑杆：三块沿各自底面的方向移开，你会看到它们共用正方体的一个角（拆开时三块尖顶各自离开，合上时回到同一点）。再转动视角，确认每块都是一个正方形底、四个三角形侧面。这只是一个特例（高 = 底边长）；下一步说明任意高度、任意倾斜的棱锥为什么也是 1/3。',

    s5k: '第 5 步 · 斜着也一样',
    s5t: '把棱锥的顶点推歪，体积会变吗？薄板越切越薄会逼近多少？',
    s5e: '这一步要回答：底面 1 × 1、高 1 的四棱锥，顶点往旁边推（叫<strong>斜棱锥</strong>），体积变不变？办法是把它横着切成 n 层等厚的<strong>薄板</strong>：每层用它底部那个横截面做底，近似成一个薄方块。距离底面 z 处的横截面是边长 1 − z 的正方形，不管顶点推到哪儿，这个边长都一样，只是位置平移了。所以每层薄板的体积不变，总和也不变。这就是<strong>祖暅原理</strong>：两个立体在每个高度的横截面积都相等，体积就相等（<a class="xlink" href="../../../math/calculus/integral/#step1">→ 积分页第 1 步：切条再相加</a>）。',
    c5a: '用 n 层薄板近似（顶点可以推歪）', c5b: '薄板体积之和随层数 n 的变化',
    lgSlab: '薄板', lgPyrOut: '棱锥的棱', lgSum: '试过的层数',
    slabS: '薄板层数 n', offS: '顶点推歪的距离',
    s5readout: '{n} 层薄板的体积之和 {sum}，比 1/3 多 {diff}（公式 (n+1)(2n+1)/(6n²) = {ex}）。顶点推歪 {s}：每层面积都没变，所以和也没变。',
    s5hint: '观察顺序：先只拖「推歪」，读数的和一点都不动，左图薄板只是左右错开。再把 n 从 1 拖到 30：台阶越来越细，贴着棱锥的斜面；右图的点一路往下，贴近 1/3 那条虚线（n = 30 时只多约 0.017）。薄板总是比棱锥多出一点（每层都用它最大的那个截面），层数越多，多出的越少。',

    s6k: '第 6 步 · 展开图',
    s6t: '一张由 6 个正方形连成的纸片，能不能折成一个正方体？',
    s6e: '这一步要回答：把正方体沿一些棱剪开、摊平，得到的平面图形叫<strong>展开图</strong>。反过来，6 个正方形边对边连成的图形，不一定都能折回正方体。橙色格保持平放，其余各格沿着和相邻格共用的边向上折；滑杆控制折起的角度，折到 90° 就是最终形状。先按「我猜能」或「我猜不能」，再折起来核对。这里有 15 张图：正方体的全部 11 种展开图，加 4 张折不成的。',
    c6a: '把展开图折起来',
    lgRoot: '平放不动的格', lgOtherF: '向上折的格（叠在一起的标为粉色）',
    foldS: '折起的程度（1 = 90°）', guessY: '我猜能折成', guessN: '我猜折不成', fold6: '折起来', next6: '下一张',
    s6readout: '第 {i}/15 张 · {state}',
    st_flat: '还平放着。先猜一猜，再折。', st_part: '每条折线折到 {deg}°。',
    st_ok: '折到 90°：6 个格各占正方体的一个面，能折成。', st_bad: '折到 90°：粉色的两格叠在了同一个位置，正方体就有一个面空着，折不成。',
    guessRight: '你猜对了。', guessWrong: '这次猜错了。',
    tally6: '已看 {seen}/15 张，猜过 {g} 张，猜对 {right} 张。',
    s6hint: '观察顺序：先只看平放的图，按「我猜能 / 我猜不能」，再按「折起来」（或拖滑杆），看各格怎样立起来围住橙色格。折不成的图里，常见的毛病是：一排里连着 5 个以上的格（绕一圈只需要 4 个，第 5 个回到第 1 个的位置），或者四个格挤成 2 × 2 的方块（它们会在一个角上相撞）。看完 15 张，读数会告诉你一共猜对几张。',

    s7k: '第 7 步 · 收束',
    s7t: '一句话：立体的性质，可以靠数、切、拆、展开，一样样搬到平面上来看',
    s7fin: '回顾：没有洞的多面体都满足 V − E + F = 2（第 0 步）；平面切正方体，截面随方向和位置变化，从三角形到正六边形（第 1 步），最多 6 条边，因为每条边占用一个面（第 2 步）；放大 k 倍，表面积乘 k²、体积乘 k³（第 3 步）；三个一样的四棱锥拼成正方体，所以棱锥体积是 1/3 × 底面积 × 高（第 4 步），顶点推歪也不变（第 5 步）；正方体一共有 11 种展开图（第 6 步）。',
    formula: 'V − E + F = 2（没有洞的多面体）\n放大 k 倍：表面积 × k²，体积 × k³\n棱锥体积 = 1/3 × 底面积 × 高',
    boundary: '适用范围：欧拉公式要求多面体没有洞、表面不自相交（方框的结果是 0）。截面的结论都针对正方体；别的多面体，截面边数的上限是它的面数。体积公式对任意底面形状的棱锥（包括圆锥）都成立，本页只演示了正方形底面。',
    linksTitle: '接着去看',
    lk1: '三视图 · 第 1 步：从三个方向看同一个立体 →',
    lk2: '相似与缩放 · 第 2 步：体积按 k³ 变化 →',
    lk3: '空间对角线 · 第 1 步：两次勾股算出体对角线 →',
    lk4: '积分 · 第 1 步：切成细条再相加（第 5 步薄板的平面版）→',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《立体几何 · 转一转，再切一刀》的平行版本。'
  },
  en: {
    pageTitle: 'Solid Geometry · Turn It, Slice It, Take It Apart',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Solid Geometry · Turn It, Then Cut It →',
    navLabel: 'Solid geometry steps',
    tagline: 'Paper is flat, so solids are understood by turning them, slicing them and taking them apart. This page starts by counting corners, edges and faces, then slices a cube with a plane, paints a cube and chops it into little cubes, splits a cube into three identical pyramids, and finally folds flat nets back up, square by square.',
    nav0: '0 Corners, edges, faces', nav1: '1 One cut', nav2: '2 How many sides', nav3: '3 Painted cube', nav4: '4 Three pyramids', nav5: '5 Slanted, same volume', nav6: '6 Nets', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Corners, edges, faces',
    s0t: 'Is there a fixed relationship between the numbers of corners, edges and faces of a solid?',
    s0e: 'This step asks: as you switch between solids, does one relationship between the numbers of vertices, edges and faces always hold? A solid bounded by flat polygons is a <strong>polyhedron</strong>. Each bounding polygon is a <strong>face</strong> (count F), a segment where two faces meet is an <strong>edge</strong> (E), and a point where edges meet is a <strong>vertex</strong> (V). White dots are vertices, cyan lines are edges, translucent grey shapes are faces; edges further from you are drawn dimmer. Turn the solid to make sure no face is hiding.',
    solidPick: 'Choose a solid',
    sol_cube: 'Cube', sol_tri: 'Triangular prism', sol_pent: 'Pentagonal prism', sol_pyr: 'Square pyramid', sol_oct: 'Octahedron', sol_cut: 'Cube with a corner cut off', sol_frame: 'Square frame with a hole',
    c0a: 'Turn the solid; count vertices, edges, faces',
    lgVert: 'vertex', lgEdge: 'edge (dimmer = further away)', lgFace: 'face',
    yawS: 'turn left/right (°)', pitS: 'view from above (°)',
    s0readout: '{name}: vertices V = {V}, edges E = {E}, faces F = {F}. V − E + F = {V} − {E} + {F} = {chi}.',
    tally0: 'Counted so far: {list}',
    tallyItem: '{name}: {chi}',
    s0hint: 'What to try: start with the cube and switch solids one by one, watching the last number in the readout. The first six all give 2: this is Euler’s formula V − E + F = 2. Cutting off a corner adds 2 vertices (one becomes three), 3 edges and 1 face (the new triangle), and 2 − 3 + 1 = 0, so the total is unchanged. Finally pick the square frame: the answer is 0. Euler’s formula holds only for polyhedra with no holes whose surface does not cross itself.',

    s1k: 'Step 1 · One cut',
    s1t: 'Slice a cube with a plane. What shape is the cut, and how large is it?',
    s1e: 'This step asks: for the same cube, how does the flat shape left by the cut (the <strong>cross-section</strong>) change with the direction and position of the blade? The cube has edge length 1. Three ways to cut: <strong>parallel to the base</strong> (the blade rises from bottom to top); <strong>slanted along an edge</strong> (the blade is at 45° to the base and moves from one edge to the opposite edge); <strong>perpendicular to the space diagonal</strong> (the space diagonal joins two opposite corners through the inside; the blade stays perpendicular to it and moves from one corner to the opposite one). “Blade position” is the fraction of that journey covered: 0 at the start, 1 at the end. The left plot shows the cube with the orange cross-section; the top of the right plot is the cross-section’s true shape (seen face-on), and the bottom records its area at every position you try.',
    cutPick: 'Choose a cut',
    cut_face: 'Parallel to the base', cut_edge: 'Slanted along an edge', cut_diag: 'Perpendicular to the space diagonal',
    c1a: 'Cube and cross-section', c1b: 'True shape · area against position',
    lgSec: 'cross-section', lgCube: 'cube edges', lgArea: 'area at positions tried',
    posS: 'blade position (fraction of the way)', sweep1: 'Sweep from start to end',
    s1readout: '{prog}{cut}, position {p}: the cross-section is a {shape} with {n} sides and area {area}.',
    s1progress: 'swept {c}/{N} · ',
    shp_triEq: 'equilateral triangle', shp_triIso: 'isosceles triangle', shp_tri: 'triangle', shp_square: 'square', shp_rect: 'rectangle', shp_rhombus: 'rhombus', shp_para: 'parallelogram', shp_trap: 'trapezoid', shp_quad: 'quadrilateral', shp_pent: 'pentagon', shp_hex: 'hexagon', shp_hexReg: 'regular hexagon', shp_other: 'polygon',
    s1hint: 'What to try: for each cut press “Sweep from start to end” and watch the area curve at the bottom right. Parallel to the base: always a square of area 1. Slanted along an edge: always a rectangle, largest in the middle (position 0.5) with area √2 ≈ 1.414. Perpendicular to the space diagonal: first a growing equilateral triangle, which at 1/3 passes exactly through three corners (area ≈ 0.866), then a hexagon, regular in the middle (area ≈ 1.299, the largest for this cut), then a triangle again.',

    s2k: 'Step 2 · How many sides',
    s2t: 'However you cut, how many sides can the cross-section have at most? Can you get a triangle, quadrilateral, pentagon and hexagon?',
    s2e: 'This step asks: with the blade in any direction, which polygons can the cross-section (the cut a plane leaves in a solid) be? Two angles set the blade’s direction: the <strong>tilt</strong> is how far the blade’s normal (the direction perpendicular to the blade) leans away from vertical, and the <strong>turn</strong> is how far that normal is rotated around the vertical. “Blade position” is the fraction of the way the blade has moved from the cube’s lowest corner (measured along the blade’s normal) to its highest. Each time you find a new number of sides, its tag below lights up.',
    c2a: 'A cut in any direction', c2b: 'True shape of the cross-section',
    thS: 'tilt (°)', phS: 'turn (°)', posS2: 'blade position (fraction of the way)', clear2: 'Clear record',
    chip: '{n} sides', chipNever: '7 sides (impossible)',
    s2readout: 'The cross-section has {n} sides: a {shape}, area {area}. Found {found}/4 kinds.',
    s2hint: 'What to try: at tilt 0° it is always a square. With the default tilt 35° and turn 20°, drag only the position: near either end you get triangles, and moving inward you get quadrilaterals and then pentagons (position 0.4 is one). Hexagons are the hardest: the blade must be roughly perpendicular to the space diagonal, so set the tilt near 55° and the turn near 45°, then put the position right in the middle, near 0.5. Whatever you do, you never get more than 6 sides.',
    quizPrompt: 'Think: why can a cube’s cross-section never be a heptagon (7 sides)?',
    quizA: 'A heptagon’s area is too large to fit in the cube', quizB: 'Each side of the cross-section lies on one face of the cube, each face can give only one side, and a cube has only 6 faces', quizC: 'The blade angles only come in steps of 5°',
    check: 'Check', correct: 'Right. The blade meets each face of the cube in at most one line segment, so each face contributes at most one side; 6 faces, at most 6 sides.',
    wrong: 'Look again: each side of the cross-section is where the blade meets which part of the cube? Count how many such parts a cube has.',

    s3k: 'Step 3 · The painted cube',
    s3t: 'Paint the outside of a big cube, then chop it into little cubes. How many have paint, and how many don’t?',
    s3e: 'This step asks: a cube of edge n is painted on the outside and cut into n × n × n little cubes of edge 1; how many faces of each are painted? This is about <strong>surface area</strong> (the total area of all faces) versus <strong>volume</strong> (how many unit cubes of space it fills): painted cubes touch the surface, unpainted ones hide inside. Each little cube’s colour shows how many of its faces are painted. The “take apart” slider spreads the little cubes out so you can see inside.',
    c3a: 'Little cubes coloured by painted faces',
    lgP3: '3 faces painted (corners)', lgP2: '2 faces (edges)', lgP1: '1 face (middle of a face)', lgP0: 'no paint (inside)',
    nS: 'big cube edge n', gapS: 'how far apart',
    s3readout: 'n = {n}: {total} cubes in all. 3 painted faces: {c3}; 2: {c2}; 1: {c1}; none: {c0}. Surface area 6n² = {S}, volume n³ = {Vol}, surface ÷ volume = {ratio}; {frac}% have no paint at all.',
    s3hint: 'What to try: first drag “how far apart” past halfway so the grey cubes inside show; then drag n from 2 to 8. There are always 8 corner cubes, 12(n − 2) edge cubes, 6(n − 2)² face cubes and (n − 2)³ inside. Doubling n (say 4 → 8) multiplies the surface area by 4 and the volume by 8: scale by k and area goes up by k², volume by k³. That is why the unpainted share keeps growing (about 42% at n = 8).',

    s4k: 'Step 4 · Three pyramids',
    s4t: 'Why is a pyramid’s volume 1/3 of the prism with the same base and height?',
    s4e: 'This step asks: a solid with a square base and a single apex above it is a <strong>square pyramid</strong>. A prism with the same base and height has volume “base area × height”; why does the pyramid get only 1/3 of that? Take one corner of a unit cube as a shared apex and use each of the three faces furthest from it as a base: that splits the cube into <strong>three</strong> square pyramids. Each has a 1 × 1 base and height 1, and all three have exactly the same shape (swapping the axes carries one onto another). Together they make the cube of volume 1, so each is 1/3.',
    c4a: 'A cube split into three square pyramids',
    lgPyrA: 'piece 1', lgPyrB: 'piece 2', lgPyrC: 'piece 3',
    exS: 'how far apart', play4: 'Take apart and put back',
    s4readout: 'Volumes of the three pieces (each split into two tetrahedra and added): {v1}, {v2}, {v3}; total {sum}, the cube’s volume of 1. Each has base area 1 and height 1, so volume = 1/3 × base × height = {third}.',
    s4hint: 'What to try: press “Take apart and put back”, or drag the slider. The pieces slide away in the direction of their bases, and you can see that all three share one corner of the cube (their tips separate when apart and meet again when closed). Turn the view to check each piece has one square base and four triangular sides. This is one special case (height = base edge); the next step shows why a pyramid of any height and any slant also gets 1/3.',

    s5k: 'Step 5 · Slanted, same volume',
    s5t: 'Push the apex sideways: does the volume change? And what do thinner and thinner slabs approach?',
    s5e: 'This step asks: take a square pyramid with a 1 × 1 base and height 1, push its apex sideways (an <strong>oblique pyramid</strong>); does the volume change? Slice it horizontally into n equally thick <strong>slabs</strong> and treat each as a thin box whose base is the cross-section at the slab’s bottom. At height z the cross-section is a square of side 1 − z, wherever the apex has been pushed; it only shifts sideways. So each slab’s volume is unchanged, and so is the total. This is <strong>Cavalieri’s principle</strong>: if two solids have equal cross-sectional areas at every height, their volumes are equal (<a class="xlink" href="../../../math/calculus/integral/#step1">→ Integral, step 1: slice into strips and add</a>).',
    c5a: 'n slabs (the apex can be pushed sideways)', c5b: 'Total slab volume against number of slabs n',
    lgSlab: 'slabs', lgPyrOut: 'pyramid edges', lgSum: 'slab counts tried',
    slabS: 'number of slabs n', offS: 'how far the apex is pushed',
    s5readout: 'Total volume of {n} slabs: {sum}, which is {diff} more than 1/3 (formula (n+1)(2n+1)/(6n²) = {ex}). Apex pushed by {s}: no slab’s area changed, so neither did the total.',
    s5hint: 'What to try: first drag only the push slider; the total in the readout does not move at all, while the slabs on the left merely slide sideways. Then drag n from 1 to 30: the steps get finer and hug the pyramid’s sides, and on the right the dots fall toward the dashed 1/3 line (only about 0.017 above it at n = 30). The slabs always overshoot a little, since each uses its largest cross-section, and the overshoot shrinks as n grows.',

    s6k: 'Step 6 · Nets',
    s6t: 'Six squares joined edge to edge: will the shape fold into a cube?',
    s6e: 'This step asks: cut a cube along some edges and flatten it, and the flat shape you get is a <strong>net</strong>. The reverse is not automatic: not every shape made of 6 squares joined edge to edge folds back into a cube. The orange square stays flat; every other square folds upward along the edge it shares with its neighbour. The slider sets the fold angle; at 90° you see the final shape. Press “I think it folds” or “I think it doesn’t” first, then fold to check. There are 15 shapes: all 11 nets of a cube and 4 that fail.',
    c6a: 'Folding the net up',
    lgRoot: 'square that stays flat', lgOtherF: 'squares folded up (overlapping ones turn pink)',
    foldS: 'fold amount (1 = 90°)', guessY: 'I think it folds', guessN: 'I think it doesn’t', fold6: 'Fold it up', next6: 'Next shape',
    s6readout: 'Shape {i}/15 · {state}',
    st_flat: 'Still flat. Make a guess, then fold.', st_part: 'Every crease folded to {deg}°.',
    st_ok: 'Folded to 90°: each square covers a different face of the cube. It folds.', st_bad: 'Folded to 90°: the two pink squares land in the same place, leaving one face of the cube open. It doesn’t fold.',
    guessRight: 'You guessed right.', guessWrong: 'Not this time.',
    tally6: 'Seen {seen}/15 shapes, guessed {g}, right {right}.',
    s6hint: 'What to try: look at the flat shape first, press a guess button, then press “Fold it up” (or drag the slider) and watch the squares rise around the orange one. The usual faults in shapes that fail: five or more squares in one row (going round takes only 4, so the fifth lands on the first), or four squares packed into a 2 × 2 block (they collide at a corner). After all 15, the readout tells you how many you got right.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'In one line: properties of solids can be brought onto the flat page by counting, slicing, taking apart and unfolding',
    s7fin: 'Recap: every polyhedron without holes satisfies V − E + F = 2 (step 0). A plane cuts a cube into anything from a triangle to a regular hexagon depending on direction and position (step 1), never more than 6 sides, since each side uses up a face (step 2). Scale by k and surface area goes up by k², volume by k³ (step 3). Three identical square pyramids make a cube, so a pyramid’s volume is 1/3 × base × height (step 4), and pushing the apex sideways does not change it (step 5). A cube has exactly 11 nets (step 6).',
    formula: 'V − E + F = 2 (polyhedra without holes)\nscale by k: area × k², volume × k³\npyramid volume = 1/3 × base area × height',
    boundary: 'Where this holds: Euler’s formula needs a polyhedron without holes whose surface does not cross itself (the frame gives 0). The cross-section results are about the cube; for another polyhedron the cap on the number of sides is its number of faces. The volume formula holds for pyramids on any base shape (cones included); this page only showed square bases.',
    linksTitle: 'Where to go next',
    lk1: 'Three views · step 1: one solid seen from three directions →',
    lk2: 'Similarity & scaling · step 2: volume scales by k³ →',
    lk3: 'Space diagonal · step 1: Pythagoras twice for the space diagonal →',
    lk4: 'Integral · step 1: slice into thin strips and add (the flat version of step 5’s slabs) →',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Solid Geometry · Turn It, Then Cut It”.'
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
