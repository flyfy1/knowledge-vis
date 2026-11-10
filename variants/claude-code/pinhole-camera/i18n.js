'use strict';
// Pinhole-camera lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '小孔成像 · 一个小孔，画出倒立的像',
    back: '← 知识索引',
    compare: '对照另一版本：小孔成像 · 一个孔的相机 →',
    navLabel: '小孔成像步骤导航',
    tagline: '在黑盒子的一面扎一个小孔，对面贴一张白纸，外面的景物就会出现在纸上，而且是倒着的。一个孔为什么能「画画」？画为什么是倒的？画有多大？六步里，我们只用一件事来回答：光走直线。',
    nav0: '0 光走直线', nav1: '1 一个小孔', nav2: '2 像有多大', nav3: '3 孔开大', nav4: '4 自测', nav5: '5 收束',

    s0k: '第 0 步 · 光怎么走',
    s0t: '光是走直线，还是会拐弯？怎样才能知道？',
    s0e: '这一步要回答：光在空气里走的路我们看不见，怎样判断它是不是直线？办法是看<strong>影子</strong>：光被挡住、照不到的地方。左边是一盏小灯，中间是一块高 20 cm 的挡板，右边离灯 100 cm 的地方是一面白屏。图里的细线叫<strong>光线</strong>，是我们画出来表示光走的路，光本身并不是一根根线。如果光走直线，影子的上边缘就应该正好落在「灯 → 挡板上边」这条直线延长到屏上的地方，下边缘也一样（图里的两条虚线）。图是按比例缩小的，数字按真实大小算。',
    cSlider: '挡板离灯多远（cm）', fly: '让光飞一遍',
    s0lgLamp: '小灯', s0lgRay: '到达屏的光', s0lgBlocked: '被挡板挡住的光', s0lgShadow: '影子（屏上照不到的一段）', s0lgEdge: '虚线 = 灯到挡板边缘的直线',
    s0readout: '{prog}挡板离灯 {c} cm → 影子在屏上从中线上方 {top} cm 到中线下方 {bot} cm，一共 {sh} cm 高（挡板只有 20 cm）。影子的两条边正好落在虚线上。',
    s0prog: '已有 {k}/{N} 条光线走完 · ',
    s0hint: '观察顺序：先按「让光飞一遍」，看每个光点沿直线往前走：碰到挡板的停下，其余的打到屏上，屏上没被打到的那一段就是影子。再左右拖挡板（拖图里的挡板，或拖滑杆）：挡板靠近灯，影子变大；离灯远，影子变小，而影子边每次都正好落在虚线上。光要是会拐弯，影子的边就没法这样提前用尺子画出来。这里用的是小灯，它差不多就是「一个点在发光」，所以影子边很利落；太阳那样的大光源，影子边缘会有一圈渐渐变淡的部分，这里不讲。',
    s0concl: '结论：光在同一种均匀的物质里（这里是空气）沿直线走。碰到镜子会被弹回去、钻进水里会拐弯，那是别的页面要讲的事。',

    s1k: '第 1 步 · 一个小孔',
    s1t: '让光只能从一个小孔穿过，屏上会出现什么？',
    s1e: '这一步要回答：蜡烛和屏之间隔一块板，板上只开一个小孔，屏上会出现什么？蜡烛上每一点都在向四面八方发光，但能穿过小孔的，只有正好对准小孔的那一条。光走直线：焰尖 A 在上面，它的光穿过小孔后继续斜着往下走，落到屏的下方，记作 A′；底部 B 在下面，它的光往上斜，落到屏的上方，记作 B′。两条光在小孔那里交叉。',
    light: '点亮光线',
    s1lgA: 'A：焰尖和它的光', s1lgB: 'B：底部和它的光', s1lgImg: '屏上的像', s1lgO: '其他点的光（淡）',
    s1front: '下图：站在蜡烛后面、面朝屏幕看。左边是蜡烛（绿色一半在你右手边），右边是屏上的像，两者按同样的比例画。',
    s1readout: '{prog}A′ 落在屏上中线下方 {ya} cm，B′ 落在中线上方 {yb} cm：像是倒的。下图里，蜡烛绿色的一半在右边，像的绿色一半到了左边，火焰朝下：上下、左右都对调了，就像把蜡烛转了半圈。',
    s1prog: '第 {k}/3 段 · ',
    s1hint: '观察顺序：按「点亮光线」，先看 A 的光（橙色）穿过小孔落到下面，再看 B 的光（青色）落到上面，最后蜡烛上每一点的光都落到屏上，像一点点长出来。从侧面只看得出上下颠倒，看不出左右，所以下面加了一张「从蜡烛后面朝屏幕看」的图：绿色那一半换了边。这种上下、左右都和原物对调的像叫<strong>倒像</strong>。不是小孔把像「翻」了过来，而是上面的光只能走到下面去，左边的光只能走到右边去。',

    s2k: '第 2 步 · 像有多大',
    s2t: '屏上的像比蜡烛大还是小，由什么决定？',
    s2e: '这一步要回答：像的大小由什么决定？先给四个量起名字：蜡烛到小孔的距离叫<strong>物距 u</strong>，小孔到屏的距离叫<strong>像距 v</strong>，蜡烛的高叫<strong>物高 H</strong>，屏上像的高叫<strong>像高 h</strong>（就是字面意思的两个距离、两个高度）。可以拖滑杆，也可以直接拖图里的蜡烛和屏。读数里像高用两种办法算：一是沿光线画直线，看它打到屏上哪里；二是用 H × v ÷ u 计算。',
    HSlider: '物高 H（cm）', uSlider: '物距 u：蜡烛到小孔（cm）', vSlider: '像距 v：小孔到屏（cm）',
    preEq: '等大：u = v', preHalf: '一半：u = 2v', preDouble: '两倍：v = 2u', clear2: '清除记录',
    s2lgRay: '光线（A 橙、B 青）', s2lgDot: '下方小图：每试一次留一个点', s2lgLine: '斜虚线：两个比相等的地方',
    c2r: '像高÷物高 与 像距÷物距',
    s2readout: '沿光线量：像从中线上方 {ya} cm 到中线下方 {yb} cm，像高 h = {h} cm。用算式：H × v ÷ u = {H} × {v} ÷ {u} = {hf} cm。两种办法一样。像距 ÷ 物距 ≈ {r}，像高 ÷ 物高 ≈ {rh}，所以像{cmp}。',
    cmpBig: '比蜡烛大', cmpSmall: '比蜡烛小', cmpSame: '和蜡烛一样大',
    s2hint: '观察顺序：先只拖蜡烛（改 u），屏不动：蜡烛离得越远，像越小。再只拖屏（改 v）：屏离得越远，像越大。下方小图每试一次就留下一个点，横着量像距 ÷ 物距，竖着量像高 ÷ 物高：所有点都落在同一条斜虚线上，两个比总是相等。三个按钮直接跳到「等大、一半、两倍」。改物高 H，像高按同样的倍数跟着变。孔有多大不掺和，下一步专门看孔。',
    s2concl: '结论：<strong>像高 ÷ 物高 = 像距 ÷ 物距</strong>，像有多大只由两个距离的比决定（前提是孔足够小，下一步说清什么叫「足够小」）。到了初中，这叫「相似三角形对应边成比例」，是同一件事的正式名字（<a class="xlink" href="../../../math/geometry/similarity-scaling/#step3">→ 相似与缩放页第 3 步：用影子量树高，也是这样一对三角形</a>）。',

    s3k: '第 3 步 · 孔开大',
    s3t: '把孔开大，像为什么会变糊？',
    s3e: '这一步要回答：小孔换成大孔，像为什么会变模糊？孔有了宽度 d 以后，从蜡烛上同一个点出发、能穿过孔的光就不止一条了：穿过孔上边的、正中间的、下边的……它们各走各的直线，落到屏上不同的地方，摊成一小段亮区，叫<strong>光斑</strong>。光斑有多宽也能用直线算出来：光斑宽 = d × (u + v) ÷ u（u 是物距、v 是像距）。这里蜡烛高 60 cm、物距 90 cm、像距 90 cm 都固定，只改孔宽。图上每个点只画了 3 条代表光线；真实的光有无数条，摊成的是一整片光斑。只画 3 条，是为了看清「摊开」这件事。',
    dSlider: '孔宽 d（cm）',
    s3lgA: 'A 的 3 条光线', s3lgB: 'B 的 3 条光线', s3lgSpot: '屏旁的彩色小段 = 5 个点各自的光斑', s3lgBar: '正视图里的竖条 = 进光量（满格 = 孔宽 15 cm）',
    s3front: '下面的正视图：屏上的像（正面看）。每个点摊成光斑后叠在一起。为了看清形状，画面亮度做了自动调节，真实的亮暗看竖条和读数。',
    s3readout: '孔宽 d = {d} cm → 每个点的光斑宽 {w} cm（= {d} × (90 + 90) ÷ 90）；相邻两个像点相距 {g} cm，{state}进光量是孔宽 1 cm 时的 {b} 倍。',
    s3sharp: '光斑比这个间距窄，像点还分得开。',
    s3merged: '光斑比这个间距宽，相邻光斑叠在一起（叠了 {o} cm），像糊成一片。',
    s3hint: '观察顺序：从最小的孔开始慢慢往大拖。左图橙、青两束光各自张开，屏旁的彩色小段（光斑）越来越长；光斑一旦比相邻像点的间距（15 cm）还宽，就和邻居叠到一起。正视图里的像同时由清楚变模糊。进光量按孔的面积算：孔宽翻倍，进来的光变成 4 倍，像变亮。亮和清楚是一对交换：孔大换来亮，赔上清楚。',
    s3concl: '结论：在「光走直线」的算法里，孔越小，光斑越小、像越清楚，但也越暗。不过孔不能无限缩小：真实的孔小到一定程度（这么大的装置，大约是一两毫米），光会在孔边散开（叫衍射），像反而又变糊，这里不展开。针孔相机、看日食用的小孔投影盒，用的都是小孔。',

    s4k: '第 4 步 · 自测',
    s4t: '四道题，答案都由页面上的同一套直线算出来',
    q1: '1. 物高 60 cm、物距 30 cm、像距 15 cm，像高是多少？',
    optCm: '{x} cm',
    q1ok: '对：h = 60 × 15 ÷ 30 = {h} cm。像距只有物距的一半，像也只有蜡烛的一半高。',
    q1same: '{x} cm 是把像当成永远和蜡烛一样大。可像距只有物距的一半，像也该只有一半（回看第 2 步）。',
    q1flip: '{x} cm 是把比用反了（60 × 30 ÷ 15）。像距比物距短，像应该比蜡烛小（回看第 2 步）。',
    q2: '2. 蜡烛不动，想让屏上的像更大，该怎么做？',
    q2a: '把屏往后挪远', q2b: '把孔开大', q2c: '把蜡烛换成更亮的',
    q2ok: '对：像高 = H × v ÷ u，v 变大，像就变大。比如屏从 90 cm 挪到 120 cm，像高从 {h0} cm 变成 {h1} cm。',
    q2b_no: '孔开大只会让像变糊：每个点的光斑变宽，可光斑的中心还在原地，像高不变（回看第 3 步）。',
    q2c_no: '亮暗不改变大小：像高只由物高、物距、像距决定，算式里没有「亮度」（回看第 2 步）。',
    q3: '3. 屏上的像和蜡烛比，方向怎样？（都从蜡烛后面朝屏幕看）',
    q3a: '上下、左右都反了', q3b: '只有上下反了', q3c: '完全一样',
    q3ok: '对：上面的光走到下面，左边的光走到右边，像相当于转了半圈（回看第 1 步的正视图：绿色那一半换了边）。',
    q3b_no: '侧面看只能看出上下。看第 1 步的正视图：蜡烛绿色的一半在右边，像的绿色一半到了左边，左右也反了。',
    q3c_no: '回看第 1 步：A 的光落到屏的下方，像的火焰朝下，和蜡烛不一样。',
    q4: '4. 孔开得很大，像会怎样？',
    q4a: '变糊', q4b: '变大', q4c: '消失',
    q4ok: '对：每个点摊成很宽的光斑，邻居们叠在一起，像就糊了。比如孔宽 15 cm 时光斑宽 {w} cm，比像点间距 15 cm 还宽。',
    q4b_no: '像高只由 u、v 和 H 决定（H × v ÷ u），孔的大小不在算式里。孔大了，像不变大，只变糊（回看第 3 步）。',
    q4c_no: '孔大了，进来的光反而更多，像更亮，只是糊了（回看第 3 步的进光量）。',
    check: '核对', score: '已答对 {k}/4 题。', allRight: '四题全对！光走直线这一件事，就能解释小孔成像的方向、大小和清晰度。',

    s5k: '第 5 步 · 收束',
    s5t: '小孔成像的三句话',
    card1: '<strong>光走直线，影子作证。</strong>影子的边正好落在「灯 → 挡板边缘」的直线上。',
    card2: '<strong>直线在孔口交叉，像就倒了。</strong>上面的光走到下面，左边的光走到右边：上下左右都对调。',
    card3: '<strong>像高 ÷ 物高 = 像距 ÷ 物距。</strong>孔大了更亮但更糊；孔太小又会因为衍射变糊。',
    boundary: '适用范围：同一种均匀物质里（空气），用「光走直线」来算；孔要足够小，但不能小到衍射起作用。照相机和眼睛都是这套成像办法的后代，只是把小孔换成了透镜。',
    linksTitle: '接着去看',
    lk1: '反射与折射页第 0 步：光一直走直线，直到碰到镜面——镜面按「入射角 = 反射角」把它弹回去 →',
    lk2: '凸透镜页第 1 步：把小孔换成凸透镜，用三条光线找像点；其中穿过透镜中心的那条，走的正是本页这样的直线 →',
    lk3: '相似与缩放页第 3 步：用影子量树高，和小孔成像是同一对相似三角形 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《小孔成像 · 一个孔的相机》的平行版本。'
  },
  en: {
    pageTitle: 'Pinhole Camera · One Tiny Hole Paints an Upside-Down Picture',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Pinhole Camera · A Camera With One Tiny Hole →',
    navLabel: 'Pinhole camera steps',
    tagline: 'Poke a tiny hole in one side of a dark box and tape white paper to the opposite side: the scene outside appears on the paper — upside down. How can one hole “draw” a picture? Why is it upside down, and how big is it? In six steps we answer all of it with a single idea: light travels in straight lines.',
    nav0: '0 Straight lines', nav1: '1 One tiny hole', nav2: '2 How big', nav3: '3 A bigger hole', nav4: '4 Check', nav5: '5 Wrap-up',

    s0k: 'STEP 0 · HOW LIGHT TRAVELS',
    s0t: 'Does light go in straight lines, or can it bend? How could we tell?',
    s0e: 'The question: we cannot see the path light takes through the air, so how can we tell whether it is straight? Look at a <strong>shadow</strong> — the place light cannot reach because something blocks it. On the left is a small lamp, in the middle a card 20 cm tall, and 100 cm from the lamp a white screen. The thin lines in the picture are <strong>rays</strong>: lines we draw to show the path light takes (light itself is not made of strings). If light goes straight, the top edge of the shadow should land exactly where the line “lamp → top of the card” reaches the screen, and the bottom edge likewise (the two dashed lines). The picture is shrunk to fit; the numbers are real sizes.',
    cSlider: 'Card distance from the lamp (cm)', fly: 'Send the light out',
    s0lgLamp: 'Small lamp', s0lgRay: 'Light reaching the screen', s0lgBlocked: 'Light stopped by the card', s0lgShadow: 'Shadow (the unlit part of the screen)', s0lgEdge: 'Dashed = straight line from lamp to card edge',
    s0readout: '{prog}Card {c} cm from the lamp → the shadow runs from {top} cm above the middle line to {bot} cm below it, {sh} cm tall (the card is only 20 cm). Both shadow edges sit exactly on the dashed lines.',
    s0prog: '{k}/{N} rays finished · ',
    s0hint: 'What to watch: press “Send the light out” and follow each dot of light along its straight path: the ones that hit the card stop, the rest land on the screen, and the stretch of screen nobody lands on is the shadow. Then drag the card left and right (in the picture or with the slider): closer to the lamp, a bigger shadow; further away, a smaller one — and the edges always land on the dashed lines. If light could bend, you could not draw the shadow’s edges in advance with a ruler like this. The lamp is small — nearly “one glowing point” — which is why the edges are crisp; a big source like the Sun gives a soft, fading rim, which we leave out here.',
    s0concl: 'Conclusion: in one even material (here, air) light travels in straight lines. Bouncing off a mirror or bending into water are stories for other pages.',

    s1k: 'STEP 1 · ONE TINY HOLE',
    s1t: 'Let light through only one tiny hole. What shows up on the screen?',
    s1e: 'The question: put a board with one tiny hole between a candle and a screen. What appears on the screen? Every point of the candle sends light in all directions, but only the one ray pointing exactly at the hole gets through. Light goes straight: the flame tip A is high up, so its ray carries on slanting downward after the hole and lands low on the screen — call that spot A′. The base B is low, so its ray slants upward and lands high, at B′. The two rays cross at the hole.',
    light: 'Light up the rays',
    s1lgA: 'A: flame tip and its ray', s1lgB: 'B: base and its ray', s1lgImg: 'Image on the screen', s1lgO: 'Rays from other points (faint)',
    s1front: 'Below: standing behind the candle, facing the screen. Left: the candle (its green half is on your right). Right: the image on the screen, drawn at the same scale.',
    s1readout: '{prog}A′ lands {ya} cm below the middle line and B′ {yb} cm above it: the image is upside down. Below, the candle’s green half is on the right while the image’s green half is on the left and its flame points down — top and bottom swap, left and right swap, as if the candle had been turned half a turn.',
    s1prog: 'part {k}/3 · ',
    s1hint: 'What to watch: press “Light up the rays”. First A’s ray (orange) goes through the hole and lands low, then B’s ray (cyan) lands high, and finally light from every point of the candle reaches the screen and the image grows in. From the side you can only see top and bottom swap, not left and right, so the lower picture shows the view from behind the candle facing the screen: the green half has changed sides. An image that is swapped top-to-bottom and left-to-right like this is <strong>inverted</strong>. The hole does not “flip” anything — light from the top can only end up at the bottom, and light from the left only on the right.',

    s2k: 'STEP 2 · HOW BIG',
    s2t: 'Is the image bigger or smaller than the candle, and what decides it?',
    s2e: 'The question: what decides the size of the image? First, names for four lengths. The distance from candle to hole is the <strong>object distance u</strong>; from hole to screen, the <strong>image distance v</strong>; the candle’s height is the <strong>object height H</strong>; the image’s height on the screen is the <strong>image height h</strong> (exactly what the names say). Drag the sliders, or drag the candle and the screen in the picture. The readout gets the image height two ways: by following the rays to where they hit the screen, and by working out H × v ÷ u.',
    HSlider: 'Object height H (cm)', uSlider: 'Object distance u: candle to hole (cm)', vSlider: 'Image distance v: hole to screen (cm)',
    preEq: 'Same size: u = v', preHalf: 'Half: u = 2v', preDouble: 'Double: v = 2u', clear2: 'Clear history',
    s2lgRay: 'Rays (A orange, B cyan)', s2lgDot: 'Small chart below: one dot per setting you try', s2lgLine: 'Dashed diagonal: where the two ratios are equal',
    c2r: 'h ÷ H against v ÷ u',
    s2readout: 'Following the rays: the image runs from {ya} cm above the middle line to {yb} cm below it, so h = {h} cm. By the sum: H × v ÷ u = {H} × {v} ÷ {u} = {hf} cm. Same answer. v ÷ u ≈ {r} and h ÷ H ≈ {rh}, so the image is {cmp}.',
    cmpBig: 'bigger than the candle', cmpSmall: 'smaller than the candle', cmpSame: 'the same size as the candle',
    s2hint: 'What to watch: first move only the candle (change u) and leave the screen alone — the further away the candle, the smaller the image. Then move only the screen (change v) — the further away the screen, the bigger the image. Every setting you try leaves a dot on the small chart below, with v ÷ u across and h ÷ H up: every dot sits on the same dashed diagonal, so the two ratios are always equal. The three buttons jump straight to same size, half and double. Change H and the image height follows by the same factor. The size of the hole plays no part — the next step looks at the hole.',
    s2concl: 'Conclusion: <strong>h ÷ H = v ÷ u</strong> — the image size depends only on the ratio of the two distances (as long as the hole is small enough; the next step says what “small enough” means). In middle school this is called “corresponding sides of similar triangles are in proportion” — the formal name for the same thing (<a class="xlink" href="../../../math/geometry/similarity-scaling/#step3">→ Similarity & scaling, step 3: measuring a tree with its shadow uses the same pair of triangles</a>).',

    s3k: 'STEP 3 · A BIGGER HOLE',
    s3t: 'Make the hole bigger. Why does the image go blurry?',
    s3e: 'The question: swap the tiny hole for a wide one. Why does the image get blurry? Once the hole has a width d, more than one ray from the same point of the candle can get through: one past the top edge of the hole, one through the middle, one past the bottom edge, and so on. Each follows its own straight line and lands somewhere different, spreading into a short bright patch called a <strong>blur spot</strong>. Straight lines tell us how wide it is: spot width = d × (u + v) ÷ u (u is the object distance, v the image distance). Here the candle (60 cm tall), u (90 cm) and v (90 cm) are fixed; only the hole changes. Each point gets just 3 representative rays in the picture; real light has countless rays that fill the whole spot. Three are enough to see the spreading.',
    dSlider: 'Hole width d (cm)',
    s3lgA: 'A’s 3 rays', s3lgB: 'B’s 3 rays', s3lgSpot: 'Coloured bars by the screen = blur spots of 5 points', s3lgBar: 'Bar in the face-on view = light let in (full = 15 cm hole)',
    s3front: 'Face-on view below: the image on the screen. Each point spreads into a spot and the spots add up. Brightness is auto-adjusted so you can see the shape; the true brightness is in the bar and the readout.',
    s3readout: 'Hole width d = {d} cm → each point’s blur spot is {w} cm wide (= {d} × (90 + 90) ÷ 90). Neighbouring image points are {g} cm apart: {state}The light let in is {b} × that of a 1 cm hole.',
    s3sharp: 'the spots are narrower than that gap, so the points stay separate. ',
    s3merged: 'the spots are wider than that gap and overlap their neighbours (by {o} cm), so the image smears together. ',
    s3hint: 'What to watch: start at the smallest hole and widen it slowly. On the left, the orange and cyan bundles each open up and the coloured bars by the screen (the blur spots) grow; once a spot is wider than the 15 cm gap between neighbouring image points, it overlaps its neighbours. The face-on image goes from crisp to blurry at the same time. Light let in follows the hole’s area: double the width and four times as much light gets in, so the image is brighter. Brightness and sharpness trade off: a big hole buys brightness and pays with blur.',
    s3concl: 'Conclusion: counting light as straight lines, a smaller hole means a smaller spot and a sharper — but dimmer — image. You cannot shrink the hole forever, though: below a certain size (for a box this big, roughly a millimetre or two) light spreads out at the edges of the hole (diffraction) and the image blurs again — not covered here. Pinhole cameras and the pinhole viewers used to watch eclipses both use small holes.',

    s4k: 'STEP 4 · CHECK YOURSELF',
    s4t: 'Four questions, all answered with the same straight-line geometry',
    q1: '1. The candle is 60 cm tall, 30 cm from the hole, and the screen is 15 cm behind the hole. How tall is the image?',
    optCm: '{x} cm',
    q1ok: 'Right: h = 60 × 15 ÷ 30 = {h} cm. The screen is half as far as the candle, so the image is half as tall.',
    q1same: '{x} cm assumes the image is always the same size as the candle. But v is only half of u, so the image is only half as tall (see step 2).',
    q1flip: '{x} cm uses the ratio upside down (60 × 30 ÷ 15). The screen is closer than the candle, so the image must be smaller (see step 2).',
    q2: '2. The candle stays put. How can you make the image on the screen bigger?',
    q2a: 'Move the screen further back', q2b: 'Make the hole bigger', q2c: 'Use a brighter candle',
    q2ok: 'Right: h = H × v ÷ u, so a bigger v gives a bigger image. Moving the screen from 90 cm to 120 cm takes h from {h0} cm to {h1} cm.',
    q2b_no: 'A bigger hole only blurs the image: each spot gets wider but stays centred where it was, so the height does not change (see step 3).',
    q2c_no: 'Brightness does not change size: h depends only on H, u and v — there is no “brightness” in the sum (see step 2).',
    q3: '3. Compared with the candle, which way round is the image? (Both seen from behind the candle, facing the screen.)',
    q3a: 'Swapped top-to-bottom and left-to-right', q3b: 'Only swapped top-to-bottom', q3c: 'Exactly the same',
    q3ok: 'Right: light from the top lands at the bottom and light from the left lands on the right — the image is turned half a turn (see the face-on view in step 1: the green half changed sides).',
    q3b_no: 'From the side you can only see top and bottom. Look at the face-on view in step 1: the candle’s green half is on the right, the image’s green half on the left — left and right swap too.',
    q3c_no: 'Look again at step 1: A’s ray lands low on the screen and the image’s flame points down, unlike the candle.',
    q4: '4. What happens to the image if the hole is very large?',
    q4a: 'It gets blurry', q4b: 'It gets bigger', q4c: 'It disappears',
    q4ok: 'Right: every point spreads into a wide spot and neighbours overlap, so the image smears. With a 15 cm hole the spot is {w} cm wide — wider than the 15 cm gap between image points.',
    q4b_no: 'The image height depends only on H, u and v (H × v ÷ u); the hole is not in the sum. A bigger hole does not enlarge the image, it blurs it (see step 3).',
    q4c_no: 'A bigger hole lets in more light, so the image is brighter — just blurry (see the light bar in step 3).',
    check: 'Check', score: '{k}/4 answered correctly.', allRight: 'All four right! One idea — light goes straight — explains the direction, the size and the sharpness of a pinhole image.',

    s5k: 'STEP 5 · WRAP-UP',
    s5t: 'The pinhole camera in three sentences',
    card1: '<strong>Light goes straight, and shadows prove it.</strong> A shadow’s edge sits exactly on the line from the lamp past the card’s edge.',
    card2: '<strong>Straight lines cross at the hole, so the image flips.</strong> Light from the top lands at the bottom and from the left on the right.',
    card3: '<strong>h ÷ H = v ÷ u.</strong> A bigger hole is brighter but blurrier; a hole that is too tiny blurs again through diffraction.',
    boundary: 'Where this holds: in one even material (air), working with light as straight lines; the hole must be small, but not so small that diffraction takes over. Cameras and eyes descend from this same way of making images — they just swap the hole for a lens.',
    linksTitle: 'Where to go next',
    lk1: 'Reflection & refraction, step 0: light keeps going straight until it meets a mirror, which bounces it back with angle in = angle out →',
    lk2: 'Convex lens, step 1: swap the hole for a convex lens and find image points with three rays; the one through the lens centre goes straight, just like the rays on this page →',
    lk3: 'Similarity & scaling, step 3: measuring a tree with its shadow uses the same pair of similar triangles as a pinhole camera →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Pinhole Camera · A Camera With One Tiny Hole”.'
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
  if (typeof window.refreshPinhole === 'function') window.refreshPinhole();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PH_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
