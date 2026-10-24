'use strict';
/* ============================================================
   对称与旋转 · 翻一翻，转一转 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '对称与旋转 · 翻一翻，转一转 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '对称与旋转 · 翻一翻，转一转',
    tagline: '有些图形对折一下，两边严丝合缝；有些转过一个角度，又和自己一模一样。这一页只问一件事：一个图形有哪些「动一下还能变回自己」的办法？办法一是翻——沿对称轴对折；办法二是转——绕着中心旋转。最后把两种办法合起来，你画一小块，万花筒帮你长出一整幅图案。',
    nav0: '0 对折试一试', nav1: '1 数一数对称轴', nav2: '2 转一转', nav3: '3 万花筒', nav4: '4 自测 · 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 对称与旋转 Symmetry & Rotation —— 一步一交互系列',

    /* ---------- 第 0 步：对折试一试 ---------- */
    s0k: '第 0 步 · 对折试一试',
    s0t: '沿哪条线对折，两边能完全重合？',
    s0e: '这一步要回答：<strong>一条线凭什么叫「对称轴」？</strong>先把词说清：把图形沿一条线对折，如果两边<strong>完全重合</strong>（重合 = 一点不差地叠在一起，边角都不多不少），这条线就叫<strong>对称轴</strong>；有对称轴的图形叫<strong>轴对称</strong>图形。下面每个图形都摆了几条候选线，真假混在里面——点一条，亲眼看半边翻过去：对得齐才是，差一丁点都不算。',
    s0shapeLab: '选一个图形：',
    shIso: '等腰三角形', shSquare: '正方形', shRect: '长方形', shScalene: '普通三角形',
    s0lineLab: '点一条候选折线试一试：',
    lnV: '竖直中线', lnH: '横中线', lnD1: '斜线 ↘', lnD2: '斜线 ↙', lnVOff: '偏左的竖线', lnHOff: '偏上的横线', lnMed: '顶点到对边中点的线',
    s0idle: '还没试折。点上面任意一条候选线，看半边翻过去对不对得齐。',
    s0folding: '正在沿「{line}」对折……盯着翻过去的那一半：边角和原图对得齐吗？',
    s0yes: '「{line}」：<b>对折后两边严丝合缝——这是一条对称轴！</b>翻过去的半边和原图一点不差地重合了。',
    s0no: '「{line}」：<b>不是对称轴。</b>看翻过去的半边——露出的边角和原图对不齐，差一点就是差，它不是对称轴。',
    s0prog: '已试 {tried}/{total} 条线 · 找到对称轴 <b>{found}</b> 条',
    s0done0: '这个图形的候选线全试完了：它一条对称轴都没有——不是每个图形都轴对称。',
    s0doneN: '这个图形的候选线全试完了：它一共有 <b>{found}</b> 条对称轴。换个图形继续试。',
    s0done1: '这个图形的候选线全试完了：它一共有 <b>{found}</b> 条对称轴。换个图形继续试。',
    s0hint: '判据只有一条：<strong>对折后完全重合</strong>。看着像中线的线，翻过去才知道真假——正方形的每条候选线都值得亲手验一遍。',

    /* ---------- 第 1 步：对称轴数一数 ---------- */
    s1k: '第 1 步 · 对称轴数一数',
    s1t: '对称轴有几条，图形说了算',
    s1e: '这一步要回答：<strong>常见图形各有几条对称轴？</strong>先猜，再验：每张卡先点你猜的条数，然后点「亮出全部对称轴」，图上会把每条对称轴画出来，一条一条数。小心画廊里的<strong>平行四边形</strong>——它看着最像有，对折却怎么都不重合。还有两个字母彩蛋在最后。',
    s1predLab: '先猜：它有几条对称轴？',
    p0: '0 条', p1: '1 条', p2: '2 条', p3: '3 条', p4: '4 条', pInf: '无数条',
    s1reveal: '亮出全部对称轴',
    cnt0: '0 条', cnt1: '1 条', cnt2: '2 条', cnt3: '3 条', cnt4: '4 条', cntInf: '无数条',
    s1right: '猜对了！{name}有 <b>{n}</b>对称轴。',
    s1wrong: '猜的是 {guess}，其实{name}有 <b>{n}</b>对称轴——数一数图上的虚线。',
    s1paraNote: '平行四边形一条都没有——但它藏着一个秘密：<strong>转半圈（180°）它能和自己重合</strong>。下一步揭晓。',
    s1circleNote: '圆的对称轴有无数条：任何一条过圆心的直线都是。图上只画了 4 条示意。',
    s1norev: '先猜一个条数，再点「亮出全部对称轴」对答案。',
    gSquare: '正方形', gRect: '长方形', gEqui: '等边三角形', gIso: '等腰三角形', gPara: '平行四边形', gCircle: '圆', gA: '字母 A', gH: '字母 H',
    s1hint: '账本结论：正方形 4 条，是这些图形里最多的（圆不算在内，它是无数条）；条数由图形决定，不由「看着像不像」决定。',

    /* ---------- 第 2 步：转一转 ---------- */
    s2k: '第 2 步 · 转一转',
    s2t: '不翻面，只转：转多少度能和自己重合？',
    s2e: '这一步要回答：<strong>图形绕着中心转多少度，能和原来完全重合？</strong>中间的圆点是<strong>旋转中心</strong>（转的时候唯一不动的点）。拖滑杆转动图形，浅色的虚线轮廓是它原来的样子——转到某个角度，两者会严丝合缝，那就是<strong>旋转对称</strong>：不用翻面，转一转就变回自己。',
    s2shapeLab: '选一个图形：',
    rFan2: '二叶风车', rFan3: '三叶风车', rFan4: '四叶风车', rLeaf: '一片树叶', rPara: '平行四边形',
    s2angLab: '旋转角度（度）',
    s2find: '转到最近的重合角',
    s2roYes: '现在转了 <b>{deg}°</b>：和原图<b>完全重合</b>！',
    s2roNo: '现在转了 {deg}°：还没重合，图形和虚线轮廓错开着。',
    s2roZero: '现在是 0°，还没开始转。拖动滑杆，或点「转到最近的重合角」。',
    s2ledger: '账本：{name}每转 <b>{min}°</b> 重合一次，一圈 360° 里一共重合 <b>{n}</b> 次（360 ÷ {n} = {min}）。这个次数 {n} 叫它的重合次数。',
    s2ledgerLeaf: '账本：一片树叶转多少度都不重合，只有转满一圈 360° 才回到原样——它<strong>没有旋转对称</strong>，重合次数算作 1。',
    s2paraBack: '悬念回收：第 1 步里平行四边形一条对称轴都没有，可它转 180° 就能重合——<strong>它没有轴对称，却有旋转对称。翻和转，是两回事。</strong>',
    s2hint: '看法：拖滑杆慢慢转，盯着实心图形和虚线轮廓——对齐的那一刻就是一次重合。叶片越多，重合来得越勤。',
    c2center: '旋转中心',

    /* ---------- 第 3 步：万花筒 ---------- */
    s3k: '第 3 步 · 万花筒',
    s3t: '只画一小块，图案自己长出来',
    s3e: '这一步要回答：<strong>万花筒只放一小块彩色玻璃，花纹为什么满满一整幅？</strong>靠的是两种办法合谋：<strong>镜像</strong>（镜像 = 像照镜子一样翻出一个左右相反的副本，就是第 0 步的对折）把原件在每个扇区里再翻一份，旋转再把扇区转满一圈。下面发亮的扇区是「原件区」：往里放图案，看它怎么自己长满整幅画。',
    s3secLab: '扇区数：',
    sec4: '4 个扇区', sec6: '6 个扇区', sec8: '8 个扇区',
    s3mirLab: '镜像（每区再翻一份）：',
    mirOn: '开', mirOff: '关',
    s3motifLab: '往发亮的扇区里放：',
    mDot: '一个圆点', mSeg: '一条短线', mTri: '一个小三角',
    s3clear: '清空',
    s3clickHint: '也可以直接点任意扇区：点的位置会自动折回原件区，点哪儿就在原件区对应的位置多一个圆点。',
    s3empty: '原件区还空着——先放一个图案，看它长满整幅画。',
    s3ro: '原件 <b>{m}</b> 个：一份原件在整幅图案里出现 <b>{c}</b> 次，图案上一共有 <b>{tot}</b> 份。',
    s3roWhyOn: '镜像开着：每个扇区里有正、反两份，所以一份原件出现 2 × {n} = {c} 次。',
    s3roWhyOff: '镜像关着：只有旋转在复制，一份原件出现 {n} 次。把镜像打开，对比一下花纹多了什么。',
    s3hint: '亲手对比：同一批原件，关掉镜像，花纹立刻「单薄」一半——少的那一半，就是镜像（对折）贡献的。',

    /* ---------- 第 4 步：自测 + 终章 ---------- */
    s4k: '第 4 步 · 自测',
    s4t: '翻，还是转？分清两种「变回自己」',
    s4e: '这一步要回答：<strong>前三步的两种办法，你分得清吗？</strong>三道题：一道判断、一道选择、一道动手转。都用图和账本判断，不用背定义。',
    s4q1: '判断题：长方形转 90° 就能和自己重合。',
    qTrue: '对', qFalse: '错',
    s4q1win: '答对了——这句话是<b>错</b>的。长方形转 90°，长边变竖、宽边变横，和原图对不上；要转 <b>180°</b> 才重合（和二叶风车一个账本）。',
    s4q1lose: '再想想：长方形转 90° 后，长边跑到竖直方向去了，和原图重合吗？第 2 步的账本里，和它同类的图形要转多少度？',
    s4q2: '选择题：下面哪个图形<strong>只有旋转对称、没有对称轴</strong>？',
    s4q2win: '答对了：<b>平行四边形</b>。它对折怎么都不重合（0 条对称轴），转 180° 却严丝合缝。',
    s4q2lose: '不对：{name}是有对称轴的（第 1 步数过）。再想想画廊里那个「看着最像有、其实一条都没有」的陷阱图形。',
    s4q3: '操作题：下面是三叶风车。拖滑杆转它，<strong>第一次</strong>和原图重合出现在多少度？调好后点按钮提交。',
    s4q3angLab: '角度（度）',
    s4q3submit: '就这个角度',
    s4q3win: '答对了：<b>120°</b>。三叶风车一圈重合 3 次，360 ÷ 3 = 120，第一次重合就在 120°。',
    s4q3again: '{deg}° 也会重合，但它不是<strong>第一次</strong>——第一次比它更早。再往小了调。',
    s4q3zero: '0° 是出发点，还没开始转——不算数。拖动滑杆转起来，找第一次重合出现在哪儿。',
    s4q3no: '{deg}° 还没重合——叶片和虚线轮廓还错着。慢慢拖，盯住两者对齐的那一刻。',
    s4fk: '终章 · 两种「变回自己」',
    s4ft: '翻，和转',
    f1h: '对折 = 轴对称',
    f1: '沿对称轴翻过去，两边完全重合（第 0、1 步）。判据是对折，不是看上去像。正方形 4 条对称轴最多，圆有无数条。',
    f2h: '转 = 旋转对称',
    f2: '绕旋转中心转过 360° ÷ 重合次数，就和自己重合（第 2 步）。平行四边形没有对称轴，却转 180° 重合——只有旋转对称。',
    f3h: '万花筒 = 两者合谋',
    f3: '先用镜像（对折）在每个扇区翻一份，再用旋转转满一圈（第 3 步）：一份原件长成 2n 份花纹。生活里的雪花、剪纸、车轮毂，都是这两种办法的组合。',
    s4fin: '下次看到一个图案，先问两句：它能不能对折重合？转多少度能重合？两句都答得出，你就把它的对称看穿了。',
    lkPeri: '正方形为什么处处特别？它对称轴最多（4 条），而且周长固定时它的面积也最大——去看周长 vs 面积的账本 →',
    lkArea: '好看的图案常常是对称拼出来的：去看乘法是面积，看点阵怎样铺成整块地砖 →'
  },
  en: {
    docTitle: 'Symmetry & Rotation · Flip It, Spin It — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Symmetry & Rotation · Flip It, Spin It',
    tagline: 'Fold some shapes and the two halves match exactly; spin others by just the right angle and they land back on themselves. This page asks one question: in how many ways can a shape “move and become itself again”? Way one is a flip — folding along an axis of symmetry. Way two is a turn — rotating around a centre. At the end the two combine: you draw one small piece and a kaleidoscope grows the whole pattern.',
    nav0: '0 Try a Fold', nav1: '1 Count the Axes', nav2: '2 Give It a Spin', nav3: '3 Kaleidoscope', nav4: '4 Quiz · Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Symmetry & Rotation —— one interaction at a time',

    s0k: 'Step 0 · Try a Fold',
    s0t: 'Along Which Line Does It Fold Onto Itself?',
    s0e: 'This step answers: <strong>what earns a line the name “axis of symmetry”?</strong> The words first: fold a shape along a line; if the two halves <strong>coincide</strong> — land exactly on each other, no corner sticking out, nothing missing — that line is an <strong>axis of symmetry</strong>, and the shape has <strong>axial symmetry</strong>. Each shape below offers several candidate lines, real ones mixed with fakes. Pick one and watch the half fold over: matching counts, almost-matching does not.',
    s0shapeLab: 'Choose a shape:',
    shIso: 'Isosceles triangle', shSquare: 'Square', shRect: 'Rectangle', shScalene: 'Ordinary triangle',
    s0lineLab: 'Click a candidate fold line to try it:',
    lnV: 'Vertical centre line', lnH: 'Horizontal centre line', lnD1: 'Diagonal ↘', lnD2: 'Diagonal ↙', lnVOff: 'Off-centre vertical', lnHOff: 'Off-centre horizontal', lnMed: 'Vertex to midpoint line',
    s0idle: 'No fold tried yet. Click any candidate line above and watch whether the flipped half lines up.',
    s0folding: 'Folding along “{line}”… watch the moving half: do its edges land exactly on the original?',
    s0yes: '“{line}”: <b>the two halves match exactly — this IS an axis of symmetry!</b> The folded half landed precisely on the original.',
    s0no: '“{line}”: <b>not an axis.</b> Look at the folded half — the edges that stick out past the original give it away. Close is not a match.',
    s0prog: 'Tried {tried}/{total} lines · axes found: <b>{found}</b>',
    s0done0: 'All candidate lines for this shape are tried: it has no axis of symmetry at all — not every shape does.',
    s0doneN: 'All candidate lines for this shape are tried: it has <b>{found}</b> axes of symmetry in total. Try another shape.',
    s0done1: 'All candidate lines for this shape are tried: it has <b>{found}</b> axis of symmetry in total. Try another shape.',
    s0hint: 'There is only one test: <strong>fold and coincide</strong>. A line that merely looks central proves nothing until the fold is tried — worth checking every candidate on the square by hand.',

    s1k: 'Step 1 · Count the Axes',
    s1t: 'How Many Axes? The Shape Decides',
    s1e: 'This step answers: <strong>how many axes of symmetry does each common shape have?</strong> Guess first, then check: on each card, pick your guess, then hit “Reveal all axes” and count the dashed lines drawn on the shape. Beware the <strong>parallelogram</strong> in the gallery — it looks like the safest bet and folds to nothing. Two letter Easter eggs wait at the end.',
    s1predLab: 'Guess first: how many axes does it have?',
    p0: '0', p1: '1', p2: '2', p3: '3', p4: '4', pInf: 'Countless',
    s1reveal: 'Reveal all axes',
    cnt0: '0 axes', cnt1: '1 axis', cnt2: '2 axes', cnt3: '3 axes', cnt4: '4 axes', cntInf: 'countless axes',
    s1right: 'Correct! The {name} has <b>{n}</b> of symmetry.',
    s1wrong: 'You guessed {guess}; the {name} actually has <b>{n}</b> — count the dashed lines on the picture.',
    s1paraNote: 'The parallelogram has none at all — but it hides a secret: <strong>turn it half a turn (180°) and it lands on itself</strong>. The next step reveals how.',
    s1circleNote: 'A circle has countless axes: every line through its centre is one. Only 4 are drawn here as a sample.',
    s1norev: 'Pick a guess, then reveal the axes to check.',
    gSquare: 'square', gRect: 'rectangle', gEqui: 'equilateral triangle', gIso: 'isosceles triangle', gPara: 'parallelogram', gCircle: 'circle', gA: 'Letter A', gH: 'Letter H',
    s1hint: 'The ledger’s verdict: the square’s 4 axes are the most of any shape here (the circle, with countless, stands apart); the count is decided by the shape, not by how symmetric it feels.',

    s2k: 'Step 2 · Give It a Spin',
    s2t: 'No Flipping, Just Turning: How Far Until It Matches?',
    s2e: 'This step answers: <strong>how far must a shape turn around its centre to coincide with itself?</strong> The dot in the middle is the <strong>centre of rotation</strong> — the one point that never moves. Drag the slider to spin the shape; the pale dashed outline is where it started. At certain angles the two land exactly on each other: that is <strong>rotational symmetry</strong> — becoming yourself again by turning, not flipping.',
    s2shapeLab: 'Choose a shape:',
    rFan2: '2-blade pinwheel', rFan3: '3-blade pinwheel', rFan4: '4-blade pinwheel', rLeaf: 'A leaf', rPara: 'Parallelogram',
    s2angLab: 'Rotation angle (degrees)',
    s2find: 'Spin to the nearest matching angle',
    s2roYes: 'Now at <b>{deg}°</b>: it <b>coincides exactly</b> with the original!',
    s2roNo: 'Now at {deg}°: not yet — the shape still sits off its dashed outline.',
    s2roZero: 'Currently 0°, not turned yet. Drag the slider, or press “Spin to the nearest matching angle”.',
    s2ledger: 'Ledger: the {name} coincides every <b>{min}°</b>, <b>{n}</b> times in a full 360° turn (360 ÷ {n} = {min}). That count {n} is its order of rotational symmetry.',
    s2ledgerLeaf: 'Ledger: a leaf never coincides at any angle — only a full 360° turn brings it back. It has <strong>no rotational symmetry</strong>; its order counts as 1.',
    s2paraBack: 'The Step 1 secret, revealed: the parallelogram has no axis at all, yet a 180° turn lands it exactly on itself — <strong>no axial symmetry, but rotational symmetry. Flipping and turning are different things.</strong>',
    s2hint: 'How to watch: turn slowly and keep your eyes on the solid shape against its dashed outline — the moment they merge is a coincidence. More blades, more frequent coincidences.',
    c2center: 'centre of rotation',

    s3k: 'Step 3 · Kaleidoscope',
    s3t: 'Draw One Small Piece — the Pattern Grows Itself',
    s3e: 'This step answers: <strong>a kaleidoscope holds one tiny piece of coloured glass, so why is the pattern huge?</strong> Two tricks conspire: a <strong>mirror image</strong> (a mirror copy is a flipped twin, exactly the fold from Step 0) adds a flipped copy inside every sector, and rotation then carries the sectors around the full circle. The glowing sector below is the “original zone”: put a motif in it and watch it grow across the whole disc.',
    s3secLab: 'Number of sectors:',
    sec4: '4 sectors', sec6: '6 sectors', sec8: '8 sectors',
    s3mirLab: 'Mirror (a flipped copy in each sector):',
    mirOn: 'On', mirOff: 'Off',
    s3motifLab: 'Put into the glowing sector:',
    mDot: 'A dot', mSeg: 'A short line', mTri: 'A small triangle',
    s3clear: 'Clear',
    s3clickHint: 'You can also click any sector: the click is folded back into the original zone, and a dot appears at the matching spot there.',
    s3empty: 'The original zone is still empty — add a motif and watch it fill the disc.',
    s3ro: 'Originals: <b>{m}</b>. Each original appears <b>{c}</b> times in the full pattern, so the pattern holds <b>{tot}</b> copies in all.',
    s3roWhyOn: 'Mirror on: every sector holds a straight and a flipped copy, so each original appears 2 × {n} = {c} times.',
    s3roWhyOff: 'Mirror off: rotation alone is copying, so each original appears {n} times. Switch the mirror on and compare what the pattern gains.',
    s3hint: 'Compare by hand: with the same originals, switching the mirror off instantly halves the pattern — the missing half is what mirroring (folding) contributes.',

    s4k: 'Step 4 · Quiz',
    s4t: 'Flip or Turn? Tell the Two “Becoming Yourself” Apart',
    s4e: 'This step answers: <strong>can you tell the two tricks from the first three steps apart?</strong> Three questions — one true/false, one multiple choice, one hands-on spin. Judge from the pictures and ledgers, not from memorised definitions.',
    s4q1: 'True or false: a rectangle turned by 90° lands exactly on itself.',
    qTrue: 'True', qFalse: 'False',
    s4q1win: 'Correct — it is <b>false</b>. Turn a rectangle 90° and its long sides stand vertical: no match. It needs <b>180°</b> (the same ledger as the 2-blade pinwheel).',
    s4q1lose: 'Think again: after a 90° turn the rectangle’s long sides point up and down — does it sit on its original outline? Which angle did its ledger in Step 2 call for?',
    s4q2: 'Multiple choice: which shape has <strong>rotational symmetry but no axis of symmetry</strong>?',
    s4q2win: 'Correct: the <b>parallelogram</b>. No fold ever matches it (0 axes), yet a 180° turn lands it exactly on itself.',
    s4q2lose: 'Not that one: the {name} does have axes of symmetry (you counted them in Step 1). Think of the gallery’s trap shape — the one that looks most likely and has none.',
    s4q3: 'Hands-on: here is a 3-blade pinwheel. Drag the slider — at how many degrees does it coincide with the original <strong>for the first time</strong>? Set it, then submit.',
    s4q3angLab: 'Angle (degrees)',
    s4q3submit: 'That’s my angle',
    s4q3win: 'Correct: <b>120°</b>. A 3-blade pinwheel coincides 3 times per turn, 360 ÷ 3 = 120, so the first coincidence is at 120°.',
    s4q3again: '{deg}° does coincide, but it is not the <strong>first</strong> time — the first one comes earlier. Nudge it smaller.',
    s4q3zero: '0° is the starting point — nothing has turned yet, so it doesn’t count. Drag the slider, turn it, and find where the first coincidence appears.',
    s4q3no: 'At {deg}° the blades still sit off the dashed outline — no coincidence yet. Drag slowly and watch for the moment they merge.',
    s4fk: 'Finale · Two Ways to Become Yourself',
    s4ft: 'Flip, and Turn',
    f1h: 'Fold = Axial Symmetry',
    f1: 'Fold along an axis and the halves coincide exactly (Steps 0–1). The test is the fold, not the look. The square leads with 4 axes; the circle has countless.',
    f2h: 'Turn = Rotational Symmetry',
    f2: 'Turn by 360° ÷ order around the centre and the shape coincides with itself (Step 2). The parallelogram has no axis at all, yet coincides at 180° — rotational symmetry only.',
    f3h: 'Kaleidoscope = Both Together',
    f3: 'Mirror (fold) a copy into every sector, then rotate around the full circle (Step 3): one original grows into 2n copies. Snowflakes, paper cuttings and wheel hubs are all built from these same two tricks.',
    s4fin: 'Next time you meet a pattern, ask it two questions: can it fold onto itself? By what angle does it turn onto itself? Answer both, and you have seen through its symmetry.',
    lkPeri: 'Why is the square special everywhere? It has the most axes (4) — and with a fixed perimeter it also encloses the largest area. See the ledger in Perimeter vs Area →',
    lkArea: 'Beautiful patterns are often symmetry at work: see how a grid of dots grows into a whole tiled floor in Multiplication Is Area →'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
