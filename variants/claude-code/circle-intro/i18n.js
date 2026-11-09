'use strict';
// Circle lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '圆 · 从一根拉紧的绳子到 π',
    back: '← 知识索引',
    compare: '对照另一版本：圆的认识 · 圆规、半径与 π →',
    navLabel: '圆的步骤导航',
    tagline: '把绳子一头钉住，另一头拴支笔，拉紧绳子走一圈，就画出一个圆。这一页从这根绳子出发：认出半径、直径和弦，量出一圈是直径的几倍，再用方格和「剥洋葱」找出圆的面积。',
    nav0: '0 一样远', nav1: '1 最长的弦', nav2: '2 滚一圈', nav3: '3 夹住 π', nav4: '4 数方格', nav5: '5 剥洋葱', nav6: '6 收束',

    s0k: '第 0 步 · 圆是什么',
    s0t: '到同一个点一样远的点，会排成什么形状？',
    s0e: '这一步要回答：把绳子一头钉在桩上，另一头拴一支笔，拉紧绳子绕着走，笔尖 P 经过的点有什么共同点？钉桩的点叫<strong>圆心</strong>，记作 O；从圆心到笔尖的那段绳长叫<strong>半径</strong>，记作 r。圆规就是一根不会松的「绳子」：两只脚张开的距离固定不变，这个距离就是半径。下图每一小格是 1 cm。',
    rLabel: '绳长（半径）r（cm）', thLabel: '笔的方向（°，从正右方逆时针转）',
    go0: '绕一圈', clr0: '擦掉足迹',
    c0title: '拉紧绳子，笔尖 P 绕圆心 O 走',
    s0lgRope: '绳子 OP', s0lgTrail: '足迹（每种绳长一种颜色）', s0lgP: '笔尖 P',
    s0readout: 'P 在圆心右边 {x} cm、上边 {y} cm（负数表示在左边或下边）。电脑按这两个数算出 P 到 O 的距离 = {d} cm，正好等于绳长 r = {r} cm。这种绳长已留下 {k}/72 个足迹（每 5° 一个）。',
    s0done: '72 个足迹全部到齐，连成一个圆：圆就是到圆心的距离都等于半径的所有点。',
    s0hint: '观察顺序：先保持绳长不动，拖「笔的方向」，每到一个方向就留下一个足迹；再点「绕一圈」看足迹连成整圈。然后换一个绳长再绕一圈：新足迹换一种颜色，比较两圈的大小。换绳长不会擦掉旧足迹，要清空请点「擦掉足迹」。',

    s1k: '第 1 步 · 半径、直径和弦',
    s1t: '在圆里画一条线段，最长能有多长？',
    s1e: '这一步要回答：在圆上取两个点 A、B 连起来，这条线段什么时候最长？连接圆上两个点的线段叫<strong>弦</strong>。经过圆心 O 的弦叫<strong>直径</strong>，记作 d；它由两条<strong>半径</strong>（从圆心到圆上的线段，长 r）对接而成，所以 d = 2 × r。圆上的 A 不动，拖「B 转开的角度」让 B 沿圆走；记录图（右边，手机上在下方）把每个试过的角度和那时的弦长画成一个点，点会一直留着。',
    r1Label: '半径 r（cm）', phiLabel: 'B 从 A 转开的角度（°）',
    c1title: '圆上的 A 与 B（半径 r = {r} cm）', c1btitle: '弦长（cm）随 B 转开的角度',
    s1lgChord: '弦 AB', s1lgRad: '半径 OA、OB', s1lgDots: '试过的角度', s1lgDiam: '直径 d = 2r',
    s1readout: '弦 AB = {c} cm（电脑按 A、B 两点的位置算出）；直径 d = 2 × {r} = {d} cm；这条弦是直径的 {p}%。记录图已试 {k} 个角度，其中最长的弦 = {m} cm。',
    s1diam: '此刻 A、B 正对着，弦穿过圆心 O：它就是直径，也是最长的弦。',
    s1hint: '观察顺序：保持半径不变，把角度从 0° 慢慢拖到 360°。看记录图的点先升后降：最高点在哪个角度、有多高？那时圆上的弦是不是穿过圆心？换半径会清空记录图，因为最高点会跟着变。',

    s2k: '第 2 步 · 周长',
    s2t: '绕圆一圈有多长？是直径的几倍？',
    s2e: '这一步要回答：绕圆一圈的长度叫<strong>周长</strong>，记作 C。弯线没法用直尺直接量，我们换个办法：让一个<strong>直径</strong>（穿过圆心的最长弦）为 d 的轮子在地上不打滑地滚一圈。轮边每一小段都正好贴地一次，所以地上留下的橙线就和周长一样长。地面下的尺子每一格长一个直径。记录图（右边，手机上在下方）记下每个滚满一圈的轮子：横向是直径 d，竖向是周长 C。（这是模拟：电脑把轮边分成 4096 小段，量出每段再加起来。）',
    d2Label: '轮子直径 d（cm）', u2Label: '已滚圈数',
    roll2: '滚一圈', clr2: '清空记录图',
    c2title: '直径 {d} cm 的轮子向右滚', c2btitle: '周长 C 与直径 d（cm）',
    s2lgRim: '已贴过地的轮边 = 地上的橙线', s2lgRuler: '尺子：每格一个直径', s2lgDot: '滚满一圈的轮子',
    s2readout: '已滚 {u} 圈：地上的橙线长 {L} cm，是 {k} 个直径那么长。',
    s2full: '滚满一圈：周长 C = {C} cm，C ÷ d = {q}。',
    s2fit: '记录图已有 {n} 种轮子，C ÷ d 全都是 {q}：周长总是直径的 3 倍多一点。这个不变的倍数叫圆周率，写作 π（读作「派」）。',
    s2hint: '观察顺序：先点「滚一圈」，数橙线越过几格直径；再换一种直径滚一圈，看记录图多出的点。换过三种轮子以后，看这些点是不是排在一条从 0 出发的直线上。拖「已滚圈数」可以停在半路看。',

    s3k: '第 3 步 · 圆周率',
    s3t: '3.14… 这个倍数，能不能算得更准？',
    s3e: '这一步要回答：不靠滚轮子，能不能把<strong>圆周率 π</strong>（周长 ÷ 直径）夹得越来越准？办法是给圆画两个<strong>正多边形</strong>（每条边一样长、每个角一样大）：青色的顶点都在圆上，整个在圆里面，一圈比圆短；橙色的每条边都贴着圆，把圆整个包住，一圈比圆长。所以圆的周长夹在两者中间。电脑按顶点的位置量出每条边，加起来再除以直径。记录图（右边，手机上在下方）记下你试过的每个边数。',
    n3Label: '边数 n', dbl3: '从 6 边起，每次加倍',
    c3title: '圆里面和圆外面的 {n} 边形', c3btitle: '一圈 ÷ 直径，随边数变化',
    s3lgIn: '圆里面的多边形', s3lgOut: '圆外面的多边形', s3lgPi: 'π',
    s3readout: '{n} 边形：里面那个的一圈 ÷ 直径 = {a}，外面那个的 = {b}。所以 {a} < π < {b}，夹住 π 的范围宽 {g}。',
    s3off: '（外面那个的 {b} 超出记录图上沿，画成顶端的小三角。）',
    s3hint: '观察顺序：把「边数」从 3 往右拖，看两个多边形越来越贴近圆，记录图的青点往上爬、橙点往下降，白色虚线 π 一直被夹在中间。再点「每次加倍」：6 → 12 → 24 → 48 → 96，这是古希腊的阿基米德用过的边数。',

    s4k: '第 4 步 · 面积',
    s4t: '圆里能铺下多少个 1 cm 的小方格？',
    s4e: '这一步要回答：圆占了多大一块地方？图形占的平面大小叫<strong>面积</strong>，用能铺下多少个 1 cm × 1 cm 的小方格来量（1 个就是 1 平方厘米，写作 cm²）。圆边是弯的，方格铺不整齐：绿格整个在圆里，橙格只有一部分在圆里。所以圆的面积比绿格数多，比「绿格 + 橙格」少。白色虚线框是边长等于<strong>半径</strong> r 的正方形，面积 r × r。记录图（右边，手机上在下方）把两个格数都除以 r × r：圆大约装得下几个这样的正方形？',
    r4Label: '半径 r（cm）',
    c4title: '半径 {r} cm 的圆铺上 1 cm 方格', c4btitle: '格数 ÷ (r × r)，随半径变化',
    s4lgIn: '整个在圆里（下界）', s4lgPart: '一部分在圆里', s4lgHi: '绿 + 橙（上界）', s4lgSq: 'r × r 正方形',
    s4readout: 'r = {r} cm：绿格 {i} 个，橙格 {p} 个。圆的面积在 {i} 和 {o} cm² 之间，也就是 {lo} 到 {hi} 个 r × r 正方形（r × r = {rr} cm²）。按 π × r × r 算出的 {A} cm² 落在这两个数之间。',
    s4hint: '观察顺序：把半径从 2 拖到 20，圆上的方格相对圆越来越细；看记录图的绿点（下界）往上走、橙点（上界）往下走，白色虚线 π 一直在两者之间，两者的距离总的趋势是越来越窄。',

    s5k: '第 5 步 · 为什么是 π × r × r',
    s5t: '为什么面积恰好是 π 个 r × r？',
    s5e: '这一步要回答：上一步只看出面积「大约 3 个多 r × r」，能不能说明为什么正好是 π 个？把圆像洋葱一样分成 n 圈一样厚的<strong>圆环</strong>（两个同心圆之间的一圈），一圈圈剥下来拉直。每圈拉直后是一根细长条：厚度 = r ÷ n，长度取它外边那一圈的<strong>周长</strong>（第 2 步：一圈长 = π × 直径）。把长条从长到短叠起来，就成了台阶，它很像一个三角形：底 = 最外圈的周长 2 × π × r，高 = r。三角形面积 = 底 × 高 ÷ 2 = π × r × r。这一步半径固定为 3 cm。',
    n5Label: '圆环圈数 n', peel5: '一圈圈剥下来',
    c5title: '分成 {n} 圈的圆（r = 3 cm）', c5btitle: '拉直的圆环，从长到短叠起来',
    s5lgRing: '圆环 / 拉直后的长条', s5lgTri: '底 2πr、高 r 的三角形',
    s5readout: '已剥 {k}/{n} 圈。全部剥完：台阶面积 = {S} cm²；三角形面积 = 底 {b} cm × 高 {h} cm ÷ 2 = {T} cm²，也就是 π × 3 × 3。台阶多出 {E} cm²，正好是三角形的 1/{n}。',
    s5hint: '观察顺序：先点「一圈圈剥下来」，看上图的圆环从外往里一圈圈变淡、下图台阶一层层叠高。再把圈数 n 从 2 拖到 30，看台阶伸出三角形的那些小尖越来越碎，读数里「多出的面积」越来越小：圈分得越细，台阶就越接近三角形。',

    s6k: '第 6 步 · 收束',
    s6t: '知道一个，就能算出另外三个',
    s6fin: '圆由<strong>圆心</strong>和<strong>半径</strong>决定：到圆心距离等于半径的点全都在圆上。<strong>直径</strong>是最长的弦，等于两条半径。<strong>周长</strong>是直径的 π 倍，π 被多边形越夹越紧，等于 3.14159…。<strong>面积</strong>是 π 个 r × r：数方格看出它大约多大，剥洋葱说明为什么正好是这么多。',
    formula: 'd = 2 × r\nC = π × d = 2 × π × r\nA = π × r × r',
    kindLabel: '我知道的是', kR: 'r 半径', kD: 'd 直径', kC: 'C 周长', kA: 'A 面积', v6Label: '它的数值（cm 或 cm²）',
    c6title: '你给出的圆',
    s6readout: 'r = {r} cm，d = {d} cm，C = {C} cm，A = {A} cm²（用 π = 3.14159… 计算，保留两位小数）。若 π 取日常用的 3.14，同样从你给的数出发：r ≈ {r2}，d ≈ {d2}，C ≈ {C2}，A ≈ {A2}，与上面只差一点点。',
    s6bad: '请输入一个大于 0 的数。',
    boundary: '适用范围：这些都是平面上理想的圆。π 的小数永远写不完，也不会循环，日常取 3.14 是近似。滚轮子那一步假设轮子不打滑；格数和多边形都由电脑按坐标量出。',
    linksTitle: '接着去哪',
    lk1: '→ 圆周角：圆心角和圆周角差在哪（第 0 步）',
    lk2: '→ 旋转对称：转多少度能和自己重合（第 2 步）——圆转任何角度都重合',
    lk3: '→ 时钟与角度：钟面是个圆，一圈 360°，怎样读两针夹角（第 1 步）',
    lk4: '→ 周长与面积：同一根绳子，围出的面积会变（第 0 步）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《圆的认识 · 圆规、半径与 π》的平行版本。'
  },
  en: {
    pageTitle: 'The Circle · From a Taut String to π',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Circle · Compass, Radius and π →',
    navLabel: 'Circle steps',
    tagline: 'Pin one end of a string, tie a pencil to the other, keep it tight and walk all the way round: you have drawn a circle. This page starts from that string. Meet the radius, diameter and chord, find how many diameters fit around the edge, then work out the area with squares and by peeling the circle like an onion.',
    nav0: '0 Equally Far', nav1: '1 Longest Chord', nav2: '2 Roll Once', nav3: '3 Trap π', nav4: '4 Count Squares', nav5: '5 Peel the Onion', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What a circle is',
    s0t: 'Which shape do you get from all the points equally far from one spot?',
    s0e: 'This step asks: pin a string to a peg, tie a pencil to the other end and walk round with the string pulled tight. What do all the points the pencil tip P passes through have in common? The peg is the <strong>centre</strong>, called O. The length of string from the centre to the tip is the <strong>radius</strong>, called r. A compass is a string that cannot go slack: its two legs stay a fixed distance apart, and that distance is the radius. Each small square below is 1 cm.',
    rLabel: 'String length (radius) r (cm)', thLabel: 'Pencil direction (°, anticlockwise from due right)',
    go0: 'Walk once round', clr0: 'Wipe the footprints',
    c0title: 'String pulled tight: tip P walks round centre O',
    s0lgRope: 'String OP', s0lgTrail: 'Footprints (one colour per length)', s0lgP: 'Pencil tip P',
    s0readout: 'P is {x} cm right of the centre and {y} cm up (negative means left or down). From those two numbers the computer finds the distance from P to O: {d} cm, exactly the string length r = {r} cm. This length has left {k}/72 footprints (one every 5°).',
    s0done: 'All 72 footprints are down and they join into a circle: a circle is every point whose distance from the centre equals the radius.',
    s0hint: 'What to watch: keep the length fixed and drag the pencil direction; every direction you visit leaves a footprint. Then press “Walk once round” and watch the footprints close up. Now change the length and walk again: the new footprints get a new colour, so you can compare the two sizes. Changing the length keeps the old footprints; “Wipe the footprints” clears them.',

    s1k: 'Step 1 · Radius, diameter, chord',
    s1t: 'How long can a straight line inside a circle be?',
    s1e: 'This step asks: join two points A and B on the circle. When is that segment longest? A segment joining two points on a circle is a <strong>chord</strong>. A chord through the centre O is a <strong>diameter</strong>, called d. It is two <strong>radii</strong> (segments from the centre to the circle, length r) laid end to end, so d = 2 × r. On the circle A stays put; drag “How far B has turned from A” to walk B round. The record chart (right, or below on a phone) turns every angle you try into a dot showing the chord length at that angle, and the dots stay.',
    r1Label: 'Radius r (cm)', phiLabel: 'How far B has turned from A (°)',
    c1title: 'A and B on the circle (radius r = {r} cm)', c1btitle: 'Chord length (cm) against B’s angle',
    s1lgChord: 'Chord AB', s1lgRad: 'Radii OA, OB', s1lgDots: 'Angles tried', s1lgDiam: 'Diameter d = 2r',
    s1readout: 'Chord AB = {c} cm (worked out from where A and B are); diameter d = 2 × {r} = {d} cm; this chord is {p}% of the diameter. You have tried {k} angles, and the longest chord so far is {m} cm.',
    s1diam: 'Right now A and B face each other and the chord runs through the centre O: it is a diameter, the longest chord there is.',
    s1hint: 'What to watch: keep the radius fixed and drag the angle slowly from 0° to 360°. The dots on the record chart rise and then fall. At which angle is the top, and how high is it? Is the chord on the circle passing through the centre at that moment? Changing the radius clears the record chart, because the top moves with it.',

    s2k: 'Step 2 · Circumference',
    s2t: 'How far is it once round? How many diameters is that?',
    s2e: 'This step asks: the distance once round a circle is its <strong>circumference</strong>, called C. You cannot lay a ruler along a curve, so try something else: roll a wheel whose <strong>diameter</strong> (the longest chord, through the centre) is d along the ground for one full turn without slipping. Every bit of the rim touches the ground exactly once, so the orange line left on the ground is as long as the circumference. The ruler under the ground is marked in diameters. The record chart (right, or below on a phone) keeps every wheel that completes a turn: diameter d across, circumference C up. (This is a simulation: the computer splits the rim into 4096 tiny pieces, measures each and adds them up.)',
    d2Label: 'Wheel diameter d (cm)', u2Label: 'Turns rolled',
    roll2: 'Roll one turn', clr2: 'Clear the record chart',
    c2title: 'A wheel {d} cm across rolls to the right', c2btitle: 'Circumference C against diameter d (cm)',
    s2lgRim: 'Rim that has touched down = orange line', s2lgRuler: 'Ruler: one mark per diameter', s2lgDot: 'Wheels rolled a full turn',
    s2readout: 'Rolled {u} of a turn: the orange line is {L} cm long, {k} diameters.',
    s2full: 'One full turn: circumference C = {C} cm, and C ÷ d = {q}.',
    s2fit: 'The record chart holds {n} different wheels and every one has C ÷ d = {q}: once round is always a little more than 3 diameters. That fixed multiple is called pi, written π.',
    s2hint: 'What to watch: press “Roll one turn” and count how many diameter marks the orange line passes. Pick another diameter and roll again; a new dot appears on the record chart. After three or more wheels, check whether the dots sit on one straight line starting from 0. Drag “Turns rolled” to stop halfway.',

    s3k: 'Step 3 · Pi',
    s3t: 'Can we pin down 3.14… more precisely?',
    s3e: 'This step asks: without rolling anything, can we squeeze <strong>π</strong> (circumference ÷ diameter) into a smaller and smaller range? Draw two <strong>regular polygons</strong> (all sides equal, all angles equal) on the circle. The cyan one has its corners on the circle and sits inside it, so its way round is shorter than the circle’s. The orange one has every side touching the circle and wraps around it, so its way round is longer. The circle’s circumference is caught in between. The computer measures every side from the corner positions, adds them and divides by the diameter. The record chart (right, or below on a phone) keeps every number of sides you try.',
    n3Label: 'Number of sides n', dbl3: 'Start at 6 sides and keep doubling',
    c3title: '{n}-sided polygons inside and outside', c3btitle: 'Way round ÷ diameter against the number of sides',
    s3lgIn: 'Polygon inside', s3lgOut: 'Polygon outside', s3lgPi: 'π',
    s3readout: '{n} sides: the inside polygon’s way round ÷ diameter = {a}, the outside one’s = {b}. So {a} < π < {b}, a window {g} wide.',
    s3off: '(The outside value {b} is above the top of the record chart, so it is drawn as a small triangle at the top.)',
    s3hint: 'What to watch: drag the number of sides up from 3. Both polygons hug the circle more closely; on the record chart the cyan dots climb, the orange dots fall, and the dashed π line stays trapped between them. Then press “keep doubling”: 6 → 12 → 24 → 48 → 96, the polygons the ancient Greek mathematician Archimedes used.',

    s4k: 'Step 4 · Area',
    s4t: 'How many 1 cm squares fit inside a circle?',
    s4e: 'This step asks: how much flat space does a circle take up? That amount is its <strong>area</strong>, measured by how many 1 cm × 1 cm squares cover it (each is one square centimetre, written cm²). The edge is curved, so squares never fit exactly: green squares are wholly inside, orange squares are only partly inside. So the area is more than the number of green squares and less than green plus orange. The dashed white box is a square whose side is the <strong>radius</strong> r, so its area is r × r. The record chart (right, or below on a phone) divides both counts by r × r: about how many of those squares does the circle hold?',
    r4Label: 'Radius r (cm)',
    c4title: 'A circle of radius {r} cm on 1 cm squares', c4btitle: 'Squares ÷ (r × r) against the radius',
    s4lgIn: 'Wholly inside (lower bound)', s4lgPart: 'Partly inside', s4lgHi: 'Green + orange (upper bound)', s4lgSq: 'r × r square',
    s4readout: 'r = {r} cm: {i} green squares and {p} orange ones. The area is between {i} and {o} cm², which is {lo} to {hi} squares of size r × r (r × r = {rr} cm²). The value π × r × r = {A} cm² lands in between.',
    s4hint: 'What to watch: drag the radius from 2 to 20. The squares get finer compared with the circle; on the record chart the green dots (lower bound) rise, the orange dots (upper bound) fall, and the dashed π line stays between them while the gap, overall, keeps narrowing.',

    s5k: 'Step 5 · Why π × r × r',
    s5t: 'Why is the area exactly π squares of size r × r?',
    s5e: 'This step asks: the last step only showed the area is “a bit more than 3 squares of r × r”. Can we see why it is exactly π of them? Slice the circle like an onion into n <strong>rings</strong> (the band between two circles with the same centre) of equal thickness, then peel them off and straighten them. Each straightened ring is a thin strip: its thickness is r ÷ n and we take its length to be the <strong>circumference</strong> of its outer edge (step 2: once round = π × diameter). Stack the strips from longest to shortest and you get a staircase that looks very like a triangle with base = the outer circumference 2 × π × r and height = r. A triangle’s area is base × height ÷ 2 = π × r × r. The radius here is fixed at 3 cm.',
    n5Label: 'Number of rings n', peel5: 'Peel the rings off',
    c5title: 'A circle cut into {n} rings (r = 3 cm)', c5btitle: 'Straightened rings, stacked longest first',
    s5lgRing: 'Ring / straightened strip', s5lgTri: 'Triangle: base 2πr, height r',
    s5readout: 'Peeled {k}/{n} rings. Once all are peeled: staircase area = {S} cm²; triangle area = base {b} cm × height {h} cm ÷ 2 = {T} cm², which is π × 3 × 3. The staircase has {E} cm² extra, exactly 1/{n} of the triangle.',
    s5hint: 'What to watch: press “Peel the rings off” and watch the rings in the top picture fade from the outside in while the staircase below grows layer by layer. Then drag n from 2 to 30. The little steps that poke out past the triangle get finer, and the “extra” area in the readout shrinks: the thinner the rings, the closer the staircase is to the triangle.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Know one of them and you can find the other three',
    s6fin: 'A circle is fixed by its <strong>centre</strong> and <strong>radius</strong>: every point whose distance from the centre equals the radius lies on it. The <strong>diameter</strong> is the longest chord and equals two radii. The <strong>circumference</strong> is π diameters, and polygons squeeze π down to 3.14159…. The <strong>area</strong> is π squares of size r × r: counting squares shows roughly how big it is, and peeling the onion shows why it is exactly that.',
    formula: 'd = 2 × r\nC = π × d = 2 × π × r\nA = π × r × r',
    kindLabel: 'What I know', kR: 'r radius', kD: 'd diameter', kC: 'C circumference', kA: 'A area', v6Label: 'Its value (cm or cm²)',
    c6title: 'Your circle',
    s6readout: 'r = {r} cm, d = {d} cm, C = {C} cm, A = {A} cm² (using π = 3.14159…, rounded to 2 decimal places). Starting from the same number with the everyday value π ≈ 3.14: r ≈ {r2}, d ≈ {d2}, C ≈ {C2}, A ≈ {A2}, only a hair different.',
    s6bad: 'Please enter a number greater than 0.',
    boundary: 'Where this holds: these are ideal circles on a flat surface. The decimals of π never end and never repeat, so 3.14 is an everyday approximation. The rolling step assumes the wheel does not slip; the square counts and polygon lengths are measured by the computer from coordinates.',
    linksTitle: 'Where next',
    lk1: '→ Inscribed angles: how a centre angle differs from an angle on the circle (step 0)',
    lk2: '→ Rotational symmetry: how far must a shape turn to match itself (step 2) — a circle matches at every angle',
    lk3: '→ Clocks & angles: a clock face is a circle of 360°; reading the angle between the hands (step 1)',
    lk4: '→ Perimeter & area: the same length of rope can fence different areas (step 0)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Circle · Compass, Radius and π”.'
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
