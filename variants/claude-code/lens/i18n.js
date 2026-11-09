'use strict';
// Convex lens strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '凸透镜成像 · 一个焦点管住所有的像',
    back: '← 知识索引',
    compare: '对照另一版本：凸透镜成像 · 远近变像 →',
    navLabel: '凸透镜成像步骤导航',
    tagline: '放大镜、照相机、投影仪里都有一块中间厚、边缘薄的玻璃：凸透镜。同一块透镜，蜡烛放远一点，屏上出现倒立缩小的像；放近一点，像变成倒立放大；再近，屏上什么也接不到，眼睛却看到一个正立放大的像。六步里你会找出这一切变化背后的两个分界点。',
    nav0: '0 焦点', nav1: '1 三条光线', nav2: '2 远近变像', nav3: '3 光屏与眼睛', nav4: '4 三种用法', nav5: '5 自测收束',
    unitCm: ' cm',
    lbLens: '凸透镜', lbAxis: '主光轴', lbF: 'F', lb2F: '2F', lbObj: '物', lbImg: '像', lbVirt: '虚像', lbEye: '眼睛', lbScreen: '光屏',
    stretch: '（竖直方向放大 {k} 倍画）',

    s0k: '第 0 步 · 焦点',
    s0t: '一束平行光穿过凸透镜，会变成什么样？',
    s0e: '这一步要回答：凸透镜对光做了什么？凸透镜是中间厚、边缘薄的透明镜片；光在它的前后两个表面各折射一次（<a class="xlink" href="../reflection-refraction/#step2">→ 反射与折射第 2 步：光进入玻璃时怎样拐弯</a>），越靠近边缘的光拐得越多。穿过透镜中心、垂直于镜片的那条线叫<strong>主光轴</strong>，透镜的中心点叫<strong>光心</strong>。平行于主光轴射来的光，穿过透镜后都会聚到主光轴上的同一点，这一点叫<strong>焦点</strong> F；焦点到光心的距离叫<strong>焦距</strong> f。透镜两侧各有一个焦点，离光心一样远。本页把透镜当作很薄的理想透镜，光线离主光轴不远（近轴光线）。',
    fSlider: '焦距 f', mBeam: '平行光从左边射入', mPoint: '点光源放在左焦点',
    c0title: '侧视：凸透镜与一束光', s0lgIn: '射向透镜的光', s0lgOut: '穿过透镜后的光', s0lgHist: '之前焦距的焦点位置',
    s0beam: '7 条平行光穿过透镜后都交于主光轴上 x = {x} cm 处，正好是焦距 f = {f} cm。焦距越短，光收拢得越急。',
    s0point: '把点光源放在左焦点（离光心 {f} cm），它发出的光穿过透镜后全部平行射出。和上一个情形比，光路正好倒过来走。',
    s0hint: '观察顺序：先保持「平行光从左边射入」，拖焦距滑杆，看 7 条光的交点（右侧 F）怎样跟着移动，旧的焦点位置留成小点；再按「点光源放在左焦点」，看光从焦点出发后被透镜变成平行光。',

    s1k: '第 1 步 · 三条特殊光线',
    s1t: '蜡烛火焰的一点发出无数条光，怎样只用三条就找到它的像？',
    s1e: '这一步要回答：像在哪里？物体上一点发出的光穿过透镜后，如果又会聚到一点，那一点就是它的<strong>像</strong>。无数条光里有三条的去向不用算就知道：① <strong>平行于主光轴</strong>的光，穿过后经过右焦点 F（上一步）；② <strong>经过光心</strong>的光，方向不变（透镜中心两面近似平行，相当于薄玻璃片）；③ <strong>经过左焦点</strong>的光，穿过后平行于主光轴（上一步光路倒过来）。任意两条的交点就是像点；第三条用来验证。图里的数都由透镜公式 1/f = 1/u + 1/v 算出，其中 u 是蜡烛到光心的距离（<strong>物距</strong>），v 是像到光心的距离（<strong>像距</strong>）。',
    uSlider: '物距 u（蜡烛到光心）', hSlider: '蜡烛高度', ray1: '① 平行于主光轴', ray2: '② 经过光心', ray3: '③ 经过左焦点',
    c1title: '三条光线定位像点（f = 10 cm）',
    s1lg1: '① 平行 → 过 F', s1lg2: '② 过光心不拐', s1lg3: '③ 过左 F → 平行',
    s1readout: '公式：v = u·f ÷ (u − f) = {v} cm，像高 = {hi} cm（负号表示在主光轴下方，倒立）。画出的光线交点：{meets}。',
    s1meet: '{a} 与 {b} 交于 ({x}, {y})',
    s1one: '只打开了一条光线，至少再打开一条才有交点。', s1none: '三条光线都关上了。',
    s1hint: '观察顺序：先只打开 ① 和 ②，看它们在右边交于一点；再打开 ③，它也正好穿过这一点。然后拖物距或蜡烛高度：三条光线一起移动，交点始终是同一个，和读数里公式算出的 (v, 像高) 一致。',

    s2k: '第 2 步 · 远近变像',
    s2t: '把蜡烛从远处一点点移近透镜，像会怎样变？',
    s2e: '这一步要回答：像的大小、正倒、能不能用屏接住，各由什么决定？像有两种：<strong>实像</strong>是光线真的会聚出来的，在透镜另一侧，倒立；<strong>虚像</strong>是光线穿过后散开，只有把它们反向延长（虚线）才交于一点，在蜡烛同一侧，正立。像高 ÷ 物高叫<strong>放大率</strong> M = −v ÷ u（负号表示倒立）。主光轴上有两个分界点：焦点 F（离光心 f）和二倍焦点 2F（离光心 2f），它们把物距分成三段，图中用不同颜色标出。光路图里淡色的像是你移动蜡烛时留下的，曲线图画出像距 v 随物距 u 的变化。',
    u2Slider: '物距 u（f = 10 cm）', at2F: '放在 2F 上', atF: '放在 F 上', sweep2: '从 40 cm 移到 2 cm', clear2: '清除痕迹',
    c2title: '蜡烛与它的像', c2btitle: '像距 v（纵）与物距 u（横），单位 cm',
    zBeyond: 'u > 2f', zBetween: 'f < u < 2f', zInside: 'u < f',
    s2lgReal: '实像（光线真的会聚）', s2lgVirt: '虚像（反向延长线的交点）', s2lgGhost: '之前留下的像', s2lgCurve: 'v 随 u 的曲线',
    offRight: '像在右侧 {v} cm 处（画面外）→', offLeft: '← 虚像在左侧 {v} cm 处（画面外）',
    s2progress: '已走过 {c}/{N} 个位置。',
    zone_beyond2f: '物距大于 2f', zone_at2f: '物距恰好等于 2f', zone_between: '物距在 f 和 2f 之间', zone_atf: '物距恰好等于 f', zone_inside: '物距小于 f',
    kReal: '实像', kVirtual: '虚像', up: '正立', down: '倒立', larger: '放大', smaller: '缩小', same: '等大',
    s2readout: '{prog}u = {u} cm：{zone}。v = {v} cm，M = {m}，{kind}、{orient}、{size}（像高是物高的 {a} 倍）。',
    s2inf: '{prog}u = {u} cm：物距恰好等于焦距。光线穿过透镜后彼此平行，永远不相交，也没有反向延长的交点：像在无穷远，光屏接不到，也看不到成形的像。',
    s2hint: '观察顺序：按「从 40 cm 移到 2 cm」，只盯着像：先在右边，倒立、比蜡烛小；蜡烛越过 2F 后变得比蜡烛大，并且越来越远；到 F 时跑到无穷远；越过 F 后跳到左边，变成正立放大的虚像。曲线图在 u = f 处断开，就是那次「跳」。也可以用两个按钮直接放在 2F（等大）或 F（无像）上。',

    s3k: '第 3 步 · 光屏与眼睛',
    s3t: '实像和虚像到底差在哪？为什么放大镜的像接不到屏上？',
    s3e: '这一步要回答：怎样用实验区分实像和虚像？在透镜右边放一块白色<strong>光屏</strong>，从蜡烛火焰尖端出发、穿过整个镜面（直径 {D} cm）的光会在屏上照出一块光斑。实像是光线真的会聚的地方：屏放在像距处，光斑缩成一个点，屏上出现清晰的倒立烛焰；离得越远，光斑越大，像越糊。虚像处没有光会聚：透镜右边的光一直在散开，屏放在哪里光斑都不会小于镜面，所以接不到像；但眼睛在右边往透镜里看，会把散开的光反向延长，看到一个正立放大的虚像。',
    sceneReal: '蜡烛在 1.5f（u = 15 cm）', sceneMag: '放大镜（u = 6 cm）', pSlider: '光屏到光心的距离', eyeBtn: '拿走光屏，用眼睛看',
    c3title: '光屏截住的光', c3btitle: '屏上看到的', c3btitleEye: '眼睛看到的', s3lgCone: '火焰尖端发出、穿过镜面的光', s3lgBack: '反向延长线', s3lgSpot: '屏上的光斑',
    s3real: '实像在 v = {v} cm。光屏在 {p} cm，离像 {d} cm，屏上光斑宽 {b} cm（越接近 0 越清晰）。{sharp}',
    s3sharp: '光斑缩成一点：屏上是清晰的倒立烛焰。',
    s3mag: '虚像在左侧 {v} cm（透镜同侧）。光屏在 {p} cm，光斑宽 {b} cm，比镜面直径 {D} cm 还宽：右边的光一直在散开，屏放在哪里都接不到像。',
    s3eye: '眼睛在透镜右边看：散开的光被反向延长，交于左侧 {v} cm 处，看到一个正立、放大 {m} 倍的虚像。那里其实没有光会聚。',
    s3hint: '观察顺序：先选「蜡烛在 1.5f」，拖光屏，「屏上看到的」从一团模糊变成清晰的倒立烛焰，再变模糊，读数里的光斑宽度在 30 cm 处降到 0。再选「放大镜」，把光屏拖遍整个范围：光斑始终比镜面宽，接不到像；最后按「拿走光屏，用眼睛看」。「屏上看到的」模糊程度只按光斑宽度示意，不是真实亮度计算。',

    s4k: '第 4 步 · 三种用法',
    s4t: '照相机、投影仪、放大镜，分别把物体放在哪一段？',
    s4e: '这一步要回答：同样是凸透镜，为什么能做成三种完全不同的工具？区别只在物体放在哪一段。<strong>照相机</strong>要把大景物缩小成倒立实像落在底片或感光元件上，物体在 2f 以外；<strong>投影仪</strong>要把小小的画片放大成倒立实像投在幕布上，画片在 f 和 2f 之间（所以画片要倒着插）；<strong>放大镜</strong>要让眼睛看到正立放大的像，物体在 f 以内，看到的是虚像。每种工具的焦距和尺寸是本页设定的示意数值。',
    dCamera: '照相机 f = 5 cm', dProjector: '投影仪 f = 10 cm', dMagnifier: '放大镜 f = 10 cm', u4Slider: '物距 u',
    c4title_camera: '照相机：景物 → 感光元件', c4title_projector: '投影仪：画片 → 幕布', c4title_magnifier: '放大镜：字 → 眼睛',
    s4readout: '{dev}：f = {f} cm，u = {u} cm（{zone}），v = {v} cm，M = {m}，{kind}、{orient}、{size}。{note}',
    note_camera: '感光元件离镜头只有 {v} cm，景物缩到 {a} 倍。',
    note_projector: '幕布要放在 {v} cm 外，画面放大 {a} 倍，且上下颠倒。',
    note_magnifier: '像在透镜同侧 {v} cm 处，眼睛从右边看到放大 {a} 倍的正立像。',
    s4hint: '观察顺序：依次按三个按钮，每种工具的物距滑杆只能在它工作的那一段里拖动；看像的位置（另一侧还是同一侧）、正倒和大小。投影仪里把画片拖近 F，幕布要退得很远、画面变得很大。',

    s5k: '第 5 步 · 自测与收束',
    s5t: '三道题，用两个分界点判断',
    q1: '① 焦距 10 cm 的凸透镜，蜡烛放在 30 cm 处，成什么像？',
    q1a: '倒立、缩小的实像', q1b: '倒立、放大的实像', q1c: '正立、放大的虚像',
    q2: '② 同一透镜，把蜡烛从 30 cm 移到 15 cm，像怎样变？',
    q2a: '变大，并离透镜更远', q2b: '变小，并离透镜更近', q2c: '从实像变成虚像',
    q3: '③ 用这块透镜当放大镜看 6 cm 处的字，字应该在哪一段？',
    q3a: 'u > 2f', q3b: 'f < u < 2f', q3c: 'u < f',
    check: '检查答案',
    fb1ok: '① 对：u = 30 cm > 2f，v = {v} cm，M = {m}，倒立缩小的实像。', fb1no: '① 再想想：30 cm 比 2f = 20 cm 远，像应该比蜡烛小还是大？',
    fb2ok: '② 对：像距从 {v0} cm 变到 {v1} cm，放大率从 {m0} 变到 {m1}，像变大、变远，仍是倒立实像。', fb2no: '② 再想想：15 cm 在 f 和 2f 之间，用 v = u·f ÷ (u − f) 算一下两个位置的像距。',
    fb3ok: '③ 对：6 cm < f = 10 cm，物体在焦点以内，才能看到正立放大的虚像。', fb3no: '③ 再想想：要正立放大的像，物体得在焦点以内还是以外？',
    fbNone: '先选一个选项。',
    s5fin: '回顾：<strong>第 0 步</strong>，凸透镜把平行光会聚到焦点，焦距是焦点到光心的距离；<strong>第 1 步</strong>，平行光过焦点、过光心不拐、过焦点变平行，三条光线的交点就是像点，和公式算出的一致；<strong>第 2 步</strong>，一倍焦距分虚实，二倍焦距分大小；<strong>第 3 步</strong>，实像能被光屏接住，虚像只能用眼睛看；<strong>第 4 步</strong>，照相机、投影仪、放大镜分别用了 u > 2f、f < u < 2f、u < f 三段。',
    formula: '1/f = 1/u + 1/v\nM = −v ÷ u\nu > 2f 缩小实像 · f < u < 2f 放大实像 · u < f 放大虚像',
    boundary: '适用范围：本页是理想薄透镜和近轴光线。真实透镜较厚，边缘的光聚焦位置略有不同（像差），不同颜色的光焦距也略有差别。为了看清，示意图在竖直方向放大了，图上标出了倍数；交点和公式结果不受这种拉伸影响。第 3 步的模糊只按光斑宽度示意，不是亮度计算。',
    linksTitle: '接着去哪',
    lk1: '→ 反射与折射（Claude 版）第 2 步：光进入玻璃时为什么拐弯',
    lk2: '→ 眼睛与眼镜第 3 步：戴什么镜片能让像回到视网膜上',
    lk3: '→ 小孔成像第 2 步：没有透镜时，像的大小怎样由相似三角形定',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《凸透镜成像 · 远近变像》的平行版本。'
  },
  en: {
    pageTitle: 'The Convex Lens · One Focus Rules Every Image',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Convex Lens · Near or Far, the Image Transforms →',
    navLabel: 'Convex lens steps',
    tagline: 'Magnifiers, cameras and projectors all hold a piece of glass that is thick in the middle and thin at the edge: a convex lens. With one and the same lens, put a candle far away and a small upside-down image appears on a screen; bring it closer and the upside-down image grows; closer still and the screen catches nothing, yet your eye sees an upright, enlarged image. In six steps you will find the two dividing points behind all of it.',
    nav0: '0 Focus', nav1: '1 Three rays', nav2: '2 Near & far', nav3: '3 Screen vs eye', nav4: '4 Three uses', nav5: '5 Self-test',
    unitCm: ' cm',
    lbLens: 'convex lens', lbAxis: 'principal axis', lbF: 'F', lb2F: '2F', lbObj: 'object', lbImg: 'image', lbVirt: 'virtual image', lbEye: 'eye', lbScreen: 'screen',
    stretch: '(drawn {k}× taller than wide)',

    s0k: 'Step 0 · The focus',
    s0t: 'A parallel beam passes through a convex lens. What becomes of it?',
    s0e: 'The question here: what does a convex lens do to light? A convex lens is a clear piece of glass, thicker in the middle than at the edge. Light refracts once at its front surface and once at its back (<a class="xlink" href="../reflection-refraction/#step2">→ Reflection & refraction, step 2: how light turns entering glass</a>), and rays nearer the edge turn more. The line through the lens centre, perpendicular to the lens, is the <strong>principal axis</strong>; the centre point is the <strong>optical centre</strong>. Rays arriving parallel to the axis all meet at one point on the axis after the lens: the <strong>focus</strong> F. Its distance from the optical centre is the <strong>focal length</strong> f. There is a focus on each side, equally far away. This page treats the lens as ideally thin, with rays close to the axis (paraxial rays).',
    fSlider: 'Focal length f', mBeam: 'Parallel beam from the left', mPoint: 'Point source at the left focus',
    c0title: 'Side view: a convex lens and a beam', s0lgIn: 'Light heading for the lens', s0lgOut: 'Light after the lens', s0lgHist: 'Focus positions for earlier f',
    s0beam: 'All seven parallel rays cross the axis at x = {x} cm after the lens — exactly the focal length f = {f} cm. The shorter the focal length, the more sharply the beam is gathered.',
    s0point: 'With a point source at the left focus ({f} cm from the centre), every ray leaves the lens parallel to the axis. It is the previous picture run backwards.',
    s0hint: 'What to try: with “Parallel beam from the left”, drag the focal-length slider and watch the point where the seven rays meet (the right-hand F) follow; old focus positions stay as small dots. Then press “Point source at the left focus” and watch light leaving the focus come out parallel.',

    s1k: 'Step 1 · Three special rays',
    s1t: 'A candle flame sends out countless rays. How can three of them locate its image?',
    s1e: 'The question here: where is the image? If light from one point of an object meets again at one point after the lens, that point is its <strong>image</strong>. Three of the countless rays go where you can predict without any calculation: ① a ray <strong>parallel to the axis</strong> passes through the right focus F afterwards (step 0); ② a ray <strong>through the optical centre</strong> carries straight on (the middle of the lens is like a thin flat plate); ③ a ray <strong>through the left focus</strong> leaves parallel to the axis (step 0 run backwards). Where any two cross is the image point; the third checks it. The numbers come from the lens formula 1/f = 1/u + 1/v, where u is the distance from candle to centre (the <strong>object distance</strong>) and v from image to centre (the <strong>image distance</strong>).',
    uSlider: 'Object distance u (candle to centre)', hSlider: 'Candle height', ray1: '① Parallel to the axis', ray2: '② Through the centre', ray3: '③ Through the left focus',
    c1title: 'Three rays locate the image point (f = 10 cm)',
    s1lg1: '① parallel → through F', s1lg2: '② through centre, straight', s1lg3: '③ through left F → parallel',
    s1readout: 'Formula: v = u·f ÷ (u − f) = {v} cm, image height = {hi} cm (negative means below the axis, upside down). Where the drawn rays cross: {meets}.',
    s1meet: '{a} and {b} at ({x}, {y})',
    s1one: 'Only one ray is on; switch on another to get a crossing.', s1none: 'All three rays are off.',
    s1hint: 'What to try: turn on only ① and ② and see them cross at one point on the right; then turn on ③ — it passes through the very same point. Now drag the object distance or the candle height: the three rays move together, always crossing at one point, matching the (v, image height) the formula gives in the readout.',

    s2k: 'Step 2 · Near and far',
    s2t: 'Slide the candle in from far away. How does the image change?',
    s2e: 'The question here: what decides the image’s size, its way up, and whether a screen can catch it? There are two kinds. A <strong>real image</strong> is where rays actually meet: on the far side of the lens, upside down. A <strong>virtual image</strong> forms when rays spread out after the lens and only their backward extensions (dashed) meet: on the candle’s side, upright. Image height ÷ object height is the <strong>magnification</strong> M = −v ÷ u (negative means upside down). Two points on the axis divide everything: the focus F (f from the centre) and the double focus 2F (2f away). They split object distances into three zones, coloured on the picture. Faded images are left behind as you move the candle; the chart plots image distance v against object distance u.',
    u2Slider: 'Object distance u (f = 10 cm)', at2F: 'Put it at 2F', atF: 'Put it at F', sweep2: 'Move from 40 cm to 2 cm', clear2: 'Clear the trail',
    c2title: 'The candle and its image', c2btitle: 'Image distance v (up) vs object distance u (across), cm',
    zBeyond: 'u > 2f', zBetween: 'f < u < 2f', zInside: 'u < f',
    s2lgReal: 'Real image (rays truly meet)', s2lgVirt: 'Virtual image (backward extensions meet)', s2lgGhost: 'Images left behind', s2lgCurve: 'v as u changes',
    offRight: 'image {v} cm to the right (off the picture) →', offLeft: '← virtual image {v} cm to the left (off the picture)',
    s2progress: 'Visited {c}/{N} positions. ',
    zone_beyond2f: 'beyond 2f', zone_at2f: 'exactly at 2f', zone_between: 'between f and 2f', zone_atf: 'exactly at f', zone_inside: 'inside f',
    kReal: 'real', kVirtual: 'virtual', up: 'upright', down: 'upside down', larger: 'enlarged', smaller: 'reduced', same: 'same size',
    s2readout: '{prog}u = {u} cm, {zone}: v = {v} cm, M = {m} — a {kind} image, {orient}, {size} ({a} times the candle’s height).',
    s2inf: '{prog}u = {u} cm, exactly the focal length. The rays leave the lens parallel and never meet, nor do their backward extensions: the image is at infinity, no screen can catch it and the eye sees no formed image.',
    s2hint: 'What to try: press “Move from 40 cm to 2 cm” and watch only the image. It starts on the right, upside down and smaller than the candle; once the candle passes 2F it is larger, and moving further out; at F it runs off to infinity; past F it jumps to the left as an upright, enlarged virtual image. The v–u curve breaks at u = f — that is the jump. The two buttons put the candle exactly at 2F (same size) or F (no image).',

    s3k: 'Step 3 · Screen versus eye',
    s3t: 'What really separates a real image from a virtual one? Why can’t a magnifier’s image land on a screen?',
    s3e: 'The question here: how can an experiment tell real from virtual? Put a white <strong>screen</strong> to the right of the lens. Light from the tip of the flame that passes through the whole lens ({D} cm across) lights up a patch on the screen. A real image is where those rays truly meet: put the screen at the image distance and the patch shrinks to a point — a sharp upside-down flame; move it away and the patch widens and the image blurs. At a virtual image no light meets: to the right of the lens the light keeps spreading, so wherever the screen is, the patch is never narrower than the lens, and there is no image to catch. Yet an eye on the right, looking into the lens, extends the spreading rays backwards and sees an upright, enlarged virtual image.',
    sceneReal: 'Candle at 1.5f (u = 15 cm)', sceneMag: 'Magnifier (u = 6 cm)', pSlider: 'Screen distance from the centre', eyeBtn: 'Remove the screen, look with an eye',
    c3title: 'What the screen intercepts', c3btitle: 'On the screen', c3btitleEye: 'What the eye sees', s3lgCone: 'Light from the flame tip through the lens', s3lgBack: 'Backward extensions', s3lgSpot: 'Patch on the screen',
    s3real: 'The real image is at v = {v} cm. The screen is at {p} cm, {d} cm from it, and the light patch is {b} cm wide (closer to 0 = sharper). {sharp}',
    s3sharp: 'The patch has shrunk to a point: a sharp, upside-down flame on the screen.',
    s3mag: 'The virtual image is {v} cm to the left, on the candle’s side. The screen is at {p} cm and the patch is {b} cm wide — wider than the {D} cm lens: the light keeps spreading, so no screen position catches an image.',
    s3eye: 'An eye on the right extends the spreading rays backwards; they meet {v} cm to the left, and it sees an upright image enlarged {m} times. No light actually meets there.',
    s3hint: 'What to try: choose “Candle at 1.5f” and drag the screen: “On the screen” goes from a blur to a sharp upside-down flame and back to a blur, and the patch width in the readout drops to 0 at 30 cm. Then choose “Magnifier” and drag the screen through its whole range: the patch is always wider than the lens, so nothing is caught. Finally press “Remove the screen, look with an eye”. The blur in “On the screen” only illustrates the patch width; it is not a brightness calculation.',

    s4k: 'Step 4 · Three uses',
    s4t: 'A camera, a projector, a magnifier: which zone does each put the object in?',
    s4e: 'The question here: how can one kind of lens make three such different tools? The only difference is which zone the object sits in. A <strong>camera</strong> shrinks a large scene into an upside-down real image on its film or sensor, so the scene is beyond 2f. A <strong>projector</strong> enlarges a small slide into an upside-down real image on a wall, so the slide sits between f and 2f (and goes in upside down). A <strong>magnifier</strong> gives the eye an upright, enlarged image, so the object is inside f and what you see is virtual. Each tool’s focal length and sizes are illustrative values chosen for this page.',
    dCamera: 'Camera f = 5 cm', dProjector: 'Projector f = 10 cm', dMagnifier: 'Magnifier f = 10 cm', u4Slider: 'Object distance u',
    c4title_camera: 'Camera: scene → sensor', c4title_projector: 'Projector: slide → wall', c4title_magnifier: 'Magnifier: letter → eye',
    s4readout: '{dev}: f = {f} cm, u = {u} cm ({zone}), v = {v} cm, M = {m} — {kind}, {orient}, {size}. {note}',
    note_camera: 'The sensor sits just {v} cm behind the lens and the scene shrinks to {a} of its size.',
    note_projector: 'The wall must be {v} cm away; the picture is {a} times larger and upside down.',
    note_magnifier: 'The image is {v} cm away on the object’s side; an eye on the right sees it upright and {a} times larger.',
    s4hint: 'What to try: press the three buttons in turn. Each tool’s slider only moves within the zone where that tool works. Look at where the image is (far side or same side), which way up, and how big. In the projector, slide the picture toward F: the wall has to move far back and the picture grows large.',

    s5k: 'Step 5 · Self-test and wrap-up',
    s5t: 'Three questions, settled by the two dividing points',
    q1: '① A convex lens has f = 10 cm and the candle is 30 cm away. What image forms?',
    q1a: 'Upside down, reduced, real', q1b: 'Upside down, enlarged, real', q1c: 'Upright, enlarged, virtual',
    q2: '② Same lens: the candle moves from 30 cm to 15 cm. How does the image change?',
    q2a: 'Larger, and further from the lens', q2b: 'Smaller, and closer to the lens', q2c: 'It turns from real to virtual',
    q3: '③ Using this lens as a magnifier on print 6 cm away — which zone is the print in?',
    q3a: 'u > 2f', q3b: 'f < u < 2f', q3c: 'u < f',
    check: 'Check answers',
    fb1ok: '① Right: u = 30 cm > 2f, so v = {v} cm and M = {m}: an upside-down, reduced, real image.', fb1no: '① Not quite: 30 cm is beyond 2f = 20 cm. Is the image smaller or larger than the candle?',
    fb2ok: '② Right: the image distance goes from {v0} cm to {v1} cm and the magnification from {m0} to {m1} — larger and further, still real and upside down.', fb2no: '② Not quite: 15 cm lies between f and 2f. Work out v = u·f ÷ (u − f) for both positions.',
    fb3ok: '③ Right: 6 cm < f = 10 cm. Only inside the focus do you see an upright, enlarged virtual image.', fb3no: '③ Not quite: for an upright, enlarged image, must the object be inside the focus or outside it?',
    fbNone: 'Pick an option first.',
    s5fin: 'The thread. <strong>Step 0</strong>: a convex lens gathers a parallel beam at the focus; the focal length is the focus’s distance from the centre. <strong>Step 1</strong>: parallel → through the focus, through the centre → straight, through the focus → parallel; where these rays cross is the image point, matching the formula. <strong>Step 2</strong>: the focus divides real from virtual, and 2F divides reduced from enlarged. <strong>Step 3</strong>: a screen catches a real image; a virtual one can only be seen by an eye. <strong>Step 4</strong>: cameras, projectors and magnifiers use u > 2f, f < u < 2f and u < f.',
    formula: '1/f = 1/u + 1/v\nM = −v ÷ u\nu > 2f reduced real · f < u < 2f enlarged real · u < f enlarged virtual',
    boundary: 'Scope: an ideal thin lens with paraxial rays. A real lens has thickness, so rays near its edge focus in slightly different places (aberration), and different colours have slightly different focal lengths. For legibility the diagrams are stretched vertically by the factor shown; crossings and formula results are unaffected by that stretch. The blur in step 3 illustrates the patch width only, not brightness.',
    linksTitle: 'Where to go next',
    lk1: '→ Reflection & refraction (Claude edition), step 2: why light turns entering glass',
    lk2: '→ The eye and glasses, step 3: which lens puts the image back on the retina',
    lk3: '→ Pinhole camera, step 2: with no lens, similar triangles set the image size',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Convex Lens · Near or Far, the Image Transforms”.'
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
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n, window.PAGE_PARAMS || {}); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml, window.PAGE_PARAMS || {}); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
