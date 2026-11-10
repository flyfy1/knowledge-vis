'use strict';
// Contour lines lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '等高线 · 把山一层一层画到纸上',
    back: '← 知识索引',
    compare: '对照另一版本：等高线 →',
    navLabel: '等高线步骤导航',
    tagline: '地形图上那一圈圈弯弯曲曲的线，每一条都连着同样高的地方。七步里你会先用「往山周围灌水」的办法亲手画出它们，再学会从线上读出一个点有多高、哪里陡、哪里缓，认出山顶、山脊、山谷、鞍部和盆地，最后预测雨水会往哪里流。',
    nav0: '0 灌水画线', nav1: '1 读海拔', nav2: '2 疏与密', nav3: '3 等高距', nav4: '4 认地形', nav5: '5 水往哪流', nav6: '6 收束',

    s0k: '第 0 步 · 线是怎么来的',
    s0t: '地图上一圈一圈的线，是怎样从一座山变出来的？',
    s0e: '这一步要回答：等高线是怎样画出来的？先说清<strong>海拔</strong>：一个地方比海平面高多少米。下面是一座虚构的小山，地图范围 1000 m × 1000 m，山脚约 12 m，山顶约 122 m。想象往山的四周灌水：水面停在某个高度时，水和山相接的那条<strong>岸线</strong>上，每一点的海拔都恰好等于水面高度。从正上方往下看（俯视），这条岸线就是一条<strong>等高线</strong>：把海拔相同的点连成的线（<a class="xlink" href="../../../math/geometry/three-views/#step1">→ 三视图第 1 步：从正上方看到的叫俯视图</a>）。水面每升高 10 m 记一次岸线，地图上就多一圈。',
    water: '水面高度（m）',
    c0a: '灌水的小山（蓝色是被水淹没的部分）', c0b: '从正上方看：记下的岸线',
    s0lgShore: '此刻的岸线', s0lgOld: '已经记下的等高线', s0lgWater: '水面以下', s0lgLand: '露出水面的山坡',
    s0readout: '水面在 {h} m：岸线总长约 {len} m，{shape}。地图上已经记下 {n} 条等高线（{list} m）。',
    shapeOne: '是一条闭合的圈', shapeMany: '分成了 {k} 段闭合的圈', shapeNone: '山已经全部没入水中，没有岸线',
    s0hint: '观察顺序：把水面从 20 m 一格一格往上拖。「灌水的小山」图里，蓝色水面慢慢淹上山坡，橙色岸线一圈比一圈小；地图里每停一次就多一条线，旧的线保留。留意西南角：水面在 20 m 时，那里的小土包成了一座小岛，地图上单独多出一个小圈；到 30 m，它就被淹没了。拖到 120 m，只剩山顶一小块露出水面。',

    s1k: '第 1 步 · 读出一个点有多高',
    s1t: '地图上随手指一个点，它有多高？',
    s1e: '这一步要回答：只看等高线，怎样说出地图上任意一点的海拔？相邻两条等高线的海拔差叫<strong>等高距</strong>，这张图是 10 m，每隔 50 m 的线画粗一些并标上数字，方便数线。一个点如果正好在线上，海拔就是那条线的数；如果夹在两条线之间，海拔就在这两条线的数之间。地图上的位置用两个数说：向东多少米、向北多少米（<a class="xlink" href="../../../earth/geo/latitude-longitude/#step0">→ 经纬网第 0 步：用两个数说出一个地方</a>）。',
    px: '向东（m）', py: '向北（m）', mapTip: '也可以直接点地图',
    c1a: '等高线地图（等高距 10 m）', c1b: '同一个点在山上的位置',
    s1lgProbe: '你选的点', s1lgIdx: '粗线：每 50 m 一条', s1lgThin: '细线：每 10 m 一条',
    s1readout: '点在（东 {x} m，北 {y} m）：{where}模型算出这里的实际海拔是 {h} m。',
    whereBetween: '夹在 {lo} m 和 {hi} m 两条等高线之间，所以海拔在 {lo}–{hi} m 之间。',
    whereBelow: '比最低的 {hi} m 等高线还低，所以海拔低于 {hi} m（这张图上山脚约 12 m）。',
    whereTop: '在最高的 {lo} m 等高线围住的圈内，所以海拔高于 {lo} m；又因为圈里没有 {hi} m 的线，它不会超过 {hi} m。',
    s1hint: '观察顺序：先点山顶附近，再点山脚，比较读数；看「同一个点在山上的位置」图里的竖针是不是落在你以为的高度。然后试着点两条线中间的地方：只看图，你能给出的是一个范围（比如 50–60 m），要更准就需要更小的等高距。最后点在最里面那一圈里：它比 120 m 高，但图上找不到 130 m 的线，所以山顶不到 130 m。',

    s2k: '第 2 步 · 疏与密',
    s2t: '等高线挤在一起的地方，为什么就是陡坡？',
    s2e: '这一步要回答：同一张图上，为什么线密的地方坡陡、线疏的地方坡缓？沿着地图上一条东西向的直线把山切开，看到的侧面形状叫<strong>剖面</strong>。相邻两条等高线之间，高度总是差一个等高距（10 m）。如果它们在地图上只隔 14 m，就是走 14 m 升 10 m；如果隔 32 m，就是走 32 m 才升 10 m。所以<strong>线越密，坡越陡</strong>。<strong>坡度</strong>就是坡面和水平面的夹角；读数里也给出「每走 100 m 升高多少米」，这个比值就是剖面线在这一点的倾斜程度（<a class="xlink" href="../../../math/calculus/derivative/#step1">→ 导数第 1 步：曲线在一点有多斜</a>）。',
    pos2: '在剖面上的位置：向东（m）',
    c2a: '地图：沿虚线切开', c2b: '剖面：海拔（m）随向东的距离（m）',
    s2lgCut: '切开的位置', s2lgProbe: '你选的点', s2lgTick: '穿过等高线的地方', s2lgTan: '这一点的坡',
    s2readout: '向东 {x} m 处，海拔 {h} m：每向东走 100 m，高度{dir} {rise} m，坡度约 {deg}°（{grade}）。这里相邻两条等高线在地图上相距约 {gap} m。',
    up: '升高', down: '下降', flat: '几乎不变',
    gentle: '缓坡', medium: '较陡', steep: '陡坡',
    s2hint: '观察顺序：先把点放在向东 350 m（山的西坡），记下两条线的间距约 32 m、坡度约 17°；再拖到 650 m（东坡）：间距缩到约 14 m，坡度约 36°，地图上东侧的线明显更挤，剖面上东侧也明显更陡。剖面上的黄点是直线穿过等高线的地方，它们在横轴上的间隔，就是地图上线和线的间隔。站在山顶（约 560 m）坡度接近 0：最高处是平的。',

    s3k: '第 3 步 · 等高距',
    s3t: '等高距选大一点还是小一点？小一点会多看到什么？',
    s3e: '这一步要回答：<strong>等高距</strong>（相邻两条等高线的海拔差）改变后，地图上会多出或少掉什么？同一座山，等高距越小，线越多，能看出的起伏越细；等高距越大，线越少，图越清爽，但小的起伏可能整个落在两条线之间，图上就看不出来。西南角有一个小土包：顶部约 23 m，它和大山之间最低的连接处约 17 m，所以它只比四周高出约 5 m。只有当某一条等高线的高度正好落在 17 m 和 23 m 之间时，它才会在小土包上单独围出一个小圈。',
    interval: '等高距（m）',
    c3a: '同一座山，换一个等高距', c3b: '立体图上的同一组等高线',
    s3lgLine: '等高线', s3lgKnoll: '小土包的位置', s3lgIdx: '粗线：每 50 m 一条（等高距能整除时）',
    s3readout: '等高距 {I} m：共有 {n} 条等高线（{list} m）。山顶只能读出在 {plo}–{phi} m 之间。小土包：{knoll}',
    knollYes: '有 {L} m 的线在它上面单独围出一圈，看得出来。',
    knollNo: '没有一条线的高度落在 17–23 m 之间，图上看不出它。',
    s3hint: '观察顺序：从 5 m 开始往大拖。线越来越少，山顶的高度范围越来越宽。盯住西南角的虚线圈：5 m、10 m、20 m 时都有 20 m 那条线在土包上单独围出一个小圈；到 25 m 和 50 m，那里什么也没有了，土包「消失」了，可它其实一直在。等高距不是越小越好：线太密会挤成一片，所以要按图的用途来选。',

    s4k: '第 4 步 · 认地形',
    s4t: '山顶、山脊、山谷、鞍部、盆地，在等高线图上各长什么样？',
    s4e: '这一步要回答：不看立体图，只看等高线，怎样认出几种常见地形？这里换一片虚构的山地（等高距 20 m）。认地形有几条规律：<strong>山顶</strong>是一组闭合曲线，越往里越高；<strong>盆地</strong>也是闭合曲线，但越往里越低，要靠线上的数字区分；<strong>山脊</strong>是从山顶伸出的高高的「梁」，等高线在这里向海拔低的一侧凸出；<strong>山谷</strong>是两侧高、中间低的沟，等高线向海拔高的一侧凸出，雨水会汇到这里；<strong>鞍部</strong>是两个山顶之间相对低的地方，像马鞍：沿两山连线看它是最低点，横着看它又是最高点。',
    fPeak: '山顶', fRidge: '山脊', fValley: '山谷', fSaddle: '鞍部', fBasin: '盆地',
    c4a: '等高线地图（等高距 20 m）', c4b: '立体图', c4c: '沿橙色线切开的剖面（m）',
    s4lgHi: '选中的地形', s4lgCut: '剖面的位置', s4lgIdx: '粗线：100 m',
    rdPeak: '山顶：海拔 {h} m。它被 180 m 的闭合线围住，从外往里 140、160、180 m 一圈比一圈高；剖面中间高、两边低。',
    rdRidge: '山脊：这一点海拔 {h} m。横穿山脊的剖面两边低、中间高；地图上这里的等高线向西南（海拔更低的方向）凸出。顺着山脊往东北走，越走越高，直到山顶。',
    rdValley: '山谷：这一点海拔 {h} m。横穿山谷的剖面两边高、中间低；地图上这里的等高线向北（海拔更高的方向）凸出。顺着谷底往南走越走越低，雨水沿这里流出地图。',
    rdSaddle: '鞍部：海拔 {h} m，夹在两个山顶（{p1} m 和 {p2} m）之间。沿两山连线的剖面它是最低点，横着切它又是最高点。80 m 的线在两边各围住一个山顶，60 m 的线把两座山一起围住。',
    rdBasin: '盆地：底部海拔 {h} m。60 m 的线在这里出现两次：里面一圈和外面一圈，夹在中间的环形高地最低处也有 {rim} m，所以里面那圈之内更低；剖面中间低、两边高。只看线不看数字，它和山顶很难分清。',
    quizPrompt: '想一想：某处等高线弯成 V 字，V 的尖端指向海拔更高的方向。这里是什么地形？',
    quizA: '山脊', quizB: '山谷', quizC: '鞍部',
    check: '核对', correct: '对。V 尖指向高处，说明沿这条线走到尖端时，两侧的地面都比尖端高，这是一条沟，也就是山谷。点「山谷」按钮可以对照地图。',
    wrong: '再想想：山脊处等高线凸向低处，山谷处凸向高处。点「山脊」和「山谷」两个按钮，对比两处线的弯法。',
    s4hint: '观察顺序：依次点五个按钮。每点一个，「等高线地图」上用橙色圈出位置、画出剖面线；「立体图」用竖针标出同一个地方；「沿橙色线切开的剖面」画出这条线上的地面高低。先对照立体图看清它是什么样子，再回到地图，看等高线在那里怎样弯、是不是闭合、数字往里是变大还是变小。',

    s5k: '第 5 步 · 水往哪流',
    s5t: '雨滴落在山坡上，会沿着什么路线往下流？',
    s5e: '这一步要回答：知道了等高线，能不能预测雨水的去向？水总是往最陡的下坡方向流。沿着一条等高线走，高度不变，所以最陡的下坡方向总是和等高线<strong>垂直</strong>，指向更低的那条线（<a class="xlink" href="../../../computing/ml/gradient-descent/#step1">→ 梯度下降第 1 步：最陡的方向总是垂直于等高线</a>）。这里用模型模拟一滴水：每次沿最陡的下坡方向走 4 m，一直走到流出地图，或者到了四周都比它高的低洼处停下。这只是地面上的流向，不算渗进土里和水量大小。',
    drop1: '在山顶旁放一滴', drop2: '在山脊两侧各放一滴', drop3: '在盆地边上放一滴', clear5: '清除水流',
    c5a: '在地图上点一下，放一滴水', c5b: '立体图上的同一批水流',
    s5lgPath: '水流路线', s5lgStart: '落点', s5lgEnd: '终点',
    s5readout: '第 {k} 滴：从海拔 {h0} m 出发，走了约 {len} m，{end}',
    endEdge: '流到地图边缘时海拔 {h1} m，继续流出了这张地图。',
    endHollow: '停在海拔 {h1} m 的低洼处：四周都比这里高，水会在这里积起来。',
    s5hint: '观察顺序：先按「在山顶旁放一滴」：水先垂直穿过一圈圈等高线往下冲，到了山谷后改成顺着谷底往南流，最后流出地图。再按「在盆地边上放一滴」：水流进盆地中央就停下了。再按「在山脊两侧各放一滴」：两滴水只隔几十米，却一滴向西、一滴向南流走，所以山脊是分水的地方。然后自己在地图上到处点：注意每一段路线穿过等高线时都和线垂直。',

    s6k: '第 6 步 · 收束', s6t: '一条线、一个数，把三维的山压进二维的纸',
    s6fin: '回顾这条链。<strong>第 0 步</strong>：等高线是同一海拔的点连成的线，就像某个水面高度时的岸线，从正上方看下去。<strong>第 1 步</strong>：一个点夹在两条线之间，海拔就在这两条线的数之间。<strong>第 2 步</strong>：相邻两线的高度差固定，所以线越密坡越陡。<strong>第 3 步</strong>：等高距决定能看清多小的起伏。<strong>第 4 步</strong>：闭合线看数字分山顶和盆地，弯向低处是山脊、弯向高处是山谷，两山之间的低处是鞍部。<strong>第 5 步</strong>：水沿垂直于等高线的方向往低处流，汇进山谷。',
    formula: '坡的陡缓 ≈ 等高距 ÷ 两线水平间距\n两线之间的点：海拔在两线的数之间\n水流方向 ⟂ 等高线，指向低处',
    boundary: '适用范围：本页的两片地形都是虚构的光滑曲面，没有悬崖、陡坎这类断开的地方（真实地图上陡崖处等高线会重叠在一起）。等高线由 100 × 100 或更细的网格插值画出，放大看会有轻微折角。水流是固定步长的最陡下坡模拟，不考虑渗透、蒸发和水量；立体图为了看清起伏，把高度放大了好几倍。',
    linksTitle: '接着去哪',
    lk1: '→ 三视图第 1 步：从正上方看到的叫俯视图',
    lk2: '→ 经纬网第 0 步：用两个数说出地球上的一个地方',
    lk3: '→ 导数第 1 步：曲线在一点有多斜',
    lk4: '→ 梯度下降第 1 步：最陡的方向为什么垂直于等高线',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《等高线》的平行版本。'
  },
  en: {
    pageTitle: 'Contour Lines · Drawing a Hill One Layer at a Time',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Contour Lines →',
    navLabel: 'Contour line steps',
    tagline: 'Each of the wiggly rings on a topographic map joins places at the same height. Over seven steps you will draw them yourself by “flooding” a hill, then learn to read off how high a point is and where the ground is steep or gentle, to recognise summits, ridges, valleys, saddles and basins, and finally to predict where rainwater will run.',
    nav0: '0 Flood the hill', nav1: '1 Read a height', nav2: '2 Crowded or sparse', nav3: '3 Contour interval', nav4: '4 Landforms', nav5: '5 Where water flows', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Where the lines come from',
    s0t: 'How does a hill turn into rings on a map?',
    s0e: 'This step asks: how are contour lines drawn? First, <strong>elevation</strong>: how many metres a place sits above sea level. Below is a made-up hill on a map 1000 m × 1000 m, with its foot at about 12 m and its top at about 122 m. Imagine flooding the land around it. When the water stops at some level, every point on the <strong>shoreline</strong>, where water meets hill, has an elevation exactly equal to that level. Seen from straight above, that shoreline is a <strong>contour line</strong>: a line joining points of equal elevation (<a class="xlink" href="../../../math/geometry/three-views/#step1">→ Three views, step 1: the view from straight above is the top view</a>). Record the shoreline every time the water rises 10 m, and the map gains one more ring.',
    water: 'Water level (m)',
    c0a: 'The flooded hill (blue: under water)', c0b: 'Seen from above: the recorded shorelines',
    s0lgShore: 'current shoreline', s0lgOld: 'contours recorded so far', s0lgWater: 'under water', s0lgLand: 'hillside above water',
    s0readout: 'Water at {h} m: the shoreline is about {len} m long and {shape}. The map has {n} contour lines recorded so far ({list} m).',
    shapeOne: 'forms one closed loop', shapeMany: 'splits into {k} closed loops', shapeNone: 'there is none, because the whole hill is under water',
    s0hint: 'What to try: raise the water from 20 m one notch at a time. In “The flooded hill” the blue water creeps up the slopes and the orange shoreline shrinks ring by ring; on the map every stop adds a line and the old lines stay. Watch the south-west corner: at 20 m a small mound there becomes an island and gets a little ring of its own on the map; by 30 m it is under water. At 120 m only a small patch of summit stays dry.',

    s1k: 'Step 1 · Reading a height',
    s1t: 'Point anywhere on the map: how high is it?',
    s1e: 'This step asks: using contour lines alone, how do you state the elevation of any point on the map? The height difference between neighbouring contours is the <strong>contour interval</strong>; here it is 10 m, and every 50 m line is drawn thicker and labelled so lines are easy to count. A point on a line has that line’s elevation. A point between two lines has an elevation between their two values. Positions on the map are given as two numbers: metres east and metres north (<a class="xlink" href="../../../earth/geo/latitude-longitude/#step0">→ Latitude and longitude, step 0: naming a place with two numbers</a>).',
    px: 'East (m)', py: 'North (m)', mapTip: 'or click the map',
    c1a: 'Contour map (interval 10 m)', c1b: 'The same point on the hill',
    s1lgProbe: 'your point', s1lgIdx: 'thick: every 50 m', s1lgThin: 'thin: every 10 m',
    s1readout: 'Point at ({x} m east, {y} m north): {where}The model puts it at {h} m.',
    whereBetween: 'it lies between the {lo} m and {hi} m contours, so its elevation is between {lo} and {hi} m. ',
    whereBelow: 'it is below the lowest contour, {hi} m, so it is lower than {hi} m (the hill’s foot here is about 12 m). ',
    whereTop: 'it is inside the highest ring, {lo} m, so it is higher than {lo} m; and since no {hi} m line appears inside that ring, it cannot reach {hi} m. ',
    s1hint: 'What to try: click near the summit, then near the foot, and compare. Check that the pin in “The same point on the hill” stands where you expected. Then click halfway between two lines: from the map alone you can only give a range (say 50–60 m); a smaller contour interval would pin it down better. Finally click inside the innermost ring: it is above 120 m, but there is no 130 m line, so the summit is below 130 m.',

    s2k: 'Step 2 · Crowded or sparse',
    s2t: 'Why does crowding of contour lines mean a steep slope?',
    s2e: 'This step asks: on the same map, why are slopes steep where lines crowd and gentle where they spread out? Slice the hill along an east–west line on the map; the side view of the cut is a <strong>profile</strong>. Between neighbouring contours the height always changes by one interval (10 m). If they are only 14 m apart on the map, you climb 10 m in 14 m; if they are 32 m apart, you need 32 m to climb the same 10 m. So <strong>crowded lines mean a steep slope</strong>. The <strong>slope angle</strong> is the angle between the ground and the horizontal; the readout also gives “metres of climb per 100 m walked”, which is how tilted the profile is at that point (<a class="xlink" href="../../../math/calculus/derivative/#step1">→ Derivative, step 1: how steep a curve is at one point</a>).',
    pos2: 'Position along the profile: east (m)',
    c2a: 'Map: cut along the dashed line', c2b: 'Profile: elevation (m) vs distance east (m)',
    s2lgCut: 'where the cut runs', s2lgProbe: 'your point', s2lgTick: 'where the cut crosses a contour', s2lgTan: 'slope at this point',
    s2readout: 'At {x} m east the elevation is {h} m: walking 100 m east, the height {dir} {rise} m, a slope of about {deg}° ({grade}). Here neighbouring contours are about {gap} m apart on the map.',
    up: 'rises', down: 'drops', flat: 'hardly changes,',
    gentle: 'gentle', medium: 'fairly steep', steep: 'steep',
    s2hint: 'What to try: put the point at 350 m east (the hill’s west side) and note a line spacing of about 32 m and a slope of about 17°. Then drag to 650 m (the east side): the spacing shrinks to about 14 m and the slope is about 36°. On the map the eastern lines are visibly more crowded, and the profile is visibly steeper there. The yellow dots on the profile mark where the cut crosses a contour; their spacing along the axis is the spacing between lines on the map. At the summit (about 560 m) the slope is close to 0: the very top is flat.',

    s3k: 'Step 3 · Contour interval',
    s3t: 'Should the contour interval be large or small? What does a smaller one reveal?',
    s3e: 'This step asks: when the <strong>contour interval</strong> (the height step between neighbouring lines) changes, what appears or disappears from the map? For the same hill, a smaller interval means more lines and finer detail; a larger interval means fewer lines and a cleaner map, but a small bump can fall entirely between two lines and vanish from the map. In the south-west corner there is a small mound: its top is about 23 m, and the lowest ground linking it to the big hill is about 17 m, so it stands only about 5 m above its surroundings. Only if some contour’s height falls between 17 m and 23 m does that line draw a separate little ring on the mound.',
    interval: 'Contour interval (m)',
    c3a: 'The same hill, a different interval', c3b: 'The same contours on the 3-D view',
    s3lgLine: 'contour lines', s3lgKnoll: 'where the mound is', s3lgIdx: 'thick: every 50 m (when the interval divides it)',
    s3readout: 'Interval {I} m: {n} contour lines ({list} m). The summit can only be placed between {plo} and {phi} m. The mound: {knoll}',
    knollYes: 'the {L} m line draws a separate ring on it, so it shows.',
    knollNo: 'no line falls between 17 and 23 m, so the map does not show it.',
    s3hint: 'What to try: start at 5 m and drag upward. The lines thin out and the summit’s height range widens. Keep an eye on the dashed circle in the south-west: at 5, 10 and 20 m the 20 m line draws its own little ring on the mound; at 25 and 50 m nothing is there and the mound “disappears”, even though it never went anywhere. Smaller is not always better: lines that are too dense merge into a smudge, so the interval is chosen to suit the map’s purpose.',

    s4k: 'Step 4 · Landforms',
    s4t: 'Summit, ridge, valley, saddle, basin: what does each look like in contours?',
    s4e: 'This step asks: without a 3-D view, how do you recognise common landforms from contours alone? Here is a different made-up upland (interval 20 m). A few rules do the job. A <strong>summit</strong> is a set of closed rings that get higher inward. A <strong>basin</strong> is also closed rings, but they get lower inward; only the numbers on the lines tell it apart. A <strong>ridge</strong> is a raised spine running out from a summit; there the contours bulge toward lower ground. A <strong>valley</strong> is a trough with higher ground on both sides; there the contours bulge toward higher ground, and rainwater collects in it. A <strong>saddle</strong> is the low point between two summits, shaped like a horse’s saddle: along the line joining the summits it is the lowest point, across that line it is the highest.',
    fPeak: 'Summit', fRidge: 'Ridge', fValley: 'Valley', fSaddle: 'Saddle', fBasin: 'Basin',
    c4a: 'Contour map (interval 20 m)', c4b: '3-D view', c4c: 'Profile along the orange line (m)',
    s4lgHi: 'selected landform', s4lgCut: 'where the profile runs', s4lgIdx: 'thick: 100 m',
    rdPeak: 'Summit: elevation {h} m. It sits inside the closed 180 m ring; from outside in, the 140, 160 and 180 m rings climb one after another. The profile is high in the middle and low on both sides.',
    rdRidge: 'Ridge: this point is at {h} m. A profile across the ridge is low on both sides and high in the middle; on the map the contours here bulge south-west, toward lower ground. Follow the ridge north-east and it climbs all the way to the summit.',
    rdValley: 'Valley: this point is at {h} m. A profile across the valley is high on both sides and low in the middle; on the map the contours here bulge north, toward higher ground. Follow the valley floor south and it keeps dropping; rainwater leaves the map this way.',
    rdSaddle: 'Saddle: elevation {h} m, between two summits ({p1} m and {p2} m). Along the line joining them it is the lowest point; across that line it is the highest. Each 80 m line rings one summit, while the 60 m line wraps both together.',
    rdBasin: 'Basin: the floor is at {h} m. The 60 m line appears twice here, an inner ring and an outer ring, and the ring of high ground between them is at least {rim} m even at its lowest point, so inside the inner ring is lower still. The profile is low in the middle and high on both sides. Without the numbers it would be hard to tell from a summit.',
    quizPrompt: 'Think it through: somewhere the contours bend into a V whose tip points toward higher ground. What landform is it?',
    quizA: 'A ridge', quizB: 'A valley', quizC: 'A saddle',
    check: 'Check', correct: 'Right. If the V points uphill, then walking along the line toward the tip, the ground on both sides is higher than the tip: it is a trough, a valley. Press “Valley” to compare with the map.',
    wrong: 'Think again: at a ridge the contours bulge toward lower ground; at a valley they bulge toward higher ground. Press “Ridge” and “Valley” and compare how the lines bend.',
    s4hint: 'What to try: press the five buttons in turn. Each one circles the spot in orange on the “Contour map” and draws a cut line; the “3-D view” marks the same spot with a pin; the “Profile along the orange line” shows the ground along that line. Look at the 3-D shape first, then go back to the map and see how the contours bend there, whether they close, and whether the numbers rise or fall inward.',

    s5k: 'Step 5 · Where water flows',
    s5t: 'A raindrop lands on a slope: which way does it run downhill?',
    s5e: 'This step asks: once you know the contours, can you predict where rainwater goes? Water always heads in the steepest downhill direction. Walking along a contour keeps your height constant, so the steepest downhill direction is always <strong>perpendicular</strong> to the contour, pointing toward the lower line (<a class="xlink" href="../../../computing/ml/gradient-descent/#step1">→ Gradient descent, step 1: why the steepest direction is perpendicular to the contours</a>). The model simulates one drop: it moves 4 m at a time in the steepest downhill direction, until it leaves the map or reaches a hollow where everything around is higher. This is only the surface flow; soaking into the ground and the amount of water are ignored.',
    drop1: 'Drop near the summit', drop2: 'Drop on both sides of the ridge', drop3: 'Drop on the basin rim', clear5: 'Clear the flows',
    c5a: 'Click the map to drop water', c5b: 'The same flows on the 3-D view',
    s5lgPath: 'water path', s5lgStart: 'where it landed', s5lgEnd: 'where it ended',
    s5readout: 'Drop {k}: it starts at {h0} m and runs about {len} m; {end}',
    endEdge: 'it reaches the map edge at {h1} m and keeps going beyond the map.',
    endHollow: 'it stops in a hollow at {h1} m, where everything around is higher and water would pool.',
    s5hint: 'What to try: press “Drop near the summit”. The water first cuts straight across the rings, then reaches the valley, turns to follow the valley floor south, and leaves the map. Next press “Drop on the basin rim”: the water runs into the middle of the basin and stops. Then press “Drop on both sides of the ridge”: two drops only a few dozen metres apart run off one to the west and one to the south, which is why a ridge divides the water. Then click around the map yourself and notice that every stretch of path crosses the contours at right angles.',

    s6k: 'Step 6 · Wrap-up', s6t: 'A line and a number squeeze a 3-D hill onto flat paper',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: a contour joins points of the same elevation, like the shoreline at one water level, seen from straight above. <strong>Step 1</strong>: a point between two lines has an elevation between their two values. <strong>Step 2</strong>: neighbouring lines differ by a fixed height, so crowded lines mean a steep slope. <strong>Step 3</strong>: the contour interval decides how small a bump the map can show. <strong>Step 4</strong>: closed rings are summits or basins depending on the numbers; bulging toward lower ground is a ridge, toward higher ground a valley; the low point between two summits is a saddle. <strong>Step 5</strong>: water runs perpendicular to the contours toward lower ground and gathers in valleys.',
    formula: 'steepness ≈ contour interval ÷ gap between lines\npoint between two lines: elevation between their values\nwater flow ⟂ contours, toward lower ground',
    boundary: 'Scope: both landscapes here are made-up smooth surfaces with no cliffs or sudden drops (on a real map, contours at a cliff run together). Contours are interpolated on a 100 × 100 or finer grid and show slight kinks when enlarged. Water flow is a fixed-step steepest-descent simulation that ignores soaking in, evaporation and the amount of water; the 3-D views exaggerate height several times so the relief is visible.',
    linksTitle: 'Where to go next',
    lk1: '→ Three views, step 1: the view from straight above is the top view',
    lk2: '→ Latitude and longitude, step 0: naming a place on Earth with two numbers',
    lk3: '→ Derivative, step 1: how steep a curve is at one point',
    lk4: '→ Gradient descent, step 1: why the steepest direction is perpendicular to the contours',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Contour Lines”.'
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
