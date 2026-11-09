'use strict';
// Symmetry & rotation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '对称与旋转 · 翻过去、转一转，还是它',
    back: '← 知识索引',
    compare: '对照另一版本：对称与旋转 · 对折与转圈 →',
    navLabel: '对称与旋转步骤导航',
    tagline: '有的图形对折后两半正好叠在一起，有的转一个角度又变回原样。这一页先亲手对折、数一数对称轴，再转一转找重合的角度，然后发现「翻两次就是转一次」，最后开一台万花筒，只盖一个章，图案自己长满一圈。',
    nav0: '0 对折', nav1: '1 数对称轴', nav2: '2 转一转', nav3: '3 翻两次', nav4: '4 万花筒', nav5: '5 自测与收束',
    sep: '、', foundList: '：{angles}',
    shp_square: '正方形', shp_rect: '长方形', shp_equilateral: '等边三角形', shp_isosceles: '等腰三角形', shp_scalene: '三边不等的三角形', shp_parallelogram: '平行四边形',
    shp_pentagon: '正五边形', shp_hexagon: '正六边形', shp_pinwheel3: '三叶风车', shp_pinwheel4: '四叶风车', shp_circle: '圆',

    s0k: '第 0 步 · 对折试一试',
    s0t: '沿哪条线对折，两半能完全盖住？',
    s0e: '这一步要回答：<strong>一张纸片沿一条直线对折，什么时候两半正好完全叠在一起？</strong>选一个图形，转动折线，按「对折」：折线一边的那一半（橙色）翻过去，盖到另一半（青色）上。如果两半完全<strong>重合</strong>——一点不多、一点不少地叠在一起——这条折线就叫图形的<strong>对称轴</strong>，有对称轴的图形叫<strong>轴对称图形</strong>。对称轴一定穿过图形的中心，所以这里只试穿过中心的折线。没盖住的地方会露出单独的青色或橙色，读数告诉你它大约占整个图形的百分之几。看着「差不多」不算，必须是 0。',
    s0lgStay: '不动的一半', s0lgMove: '翻过去的一半', s0lgLine: '折线', s0lgYes: '试过的：是对称轴', s0lgNo: '试过的：不是对称轴',
    foldAngle: '折线方向（度，0 = 水平）', fold: '对折', unfold: '展开',
    r0open: '折线方向 {a}°。按「对折」把橙色那一半翻过去。这个图形已试 {tried} 条折线，找到 {found} 条对称轴{list}。',
    r0mid: '正在对折……',
    r0yes: '对折后两半完全重合，没盖住的部分是 0%：方向 {a}° 的这条线是对称轴。这个图形已试 {tried} 条折线，找到 {found} 条对称轴{list}。',
    r0no: '对折后没盖住的部分约占整个图形的 {pct}%：方向 {a}° 的这条线不是对称轴。这个图形已试 {tried} 条折线，找到 {found} 条对称轴{list}。',
    s0hint: '观察顺序：先选「长方形」，把折线拖到 0°（水平），按「对折」：两半完全重合。再拖到 30° 试一次，会露出单独的青色和橙色角。把 0° 到 165° 每个方向都试一遍，图周围的小刻度会记下结果：绿色是对称轴，粉色不是。再换「平行四边形」试一遍——它看起来很整齐，可一条绿色刻度也找不到。',

    s1k: '第 1 步 · 数对称轴',
    s1t: '一个图形有几条对称轴？先猜，再数',
    s1e: '这一步要回答：<strong>不同的图形各有几条对称轴（对折后两半完全重合的折线）？</strong>先在下面选一个猜测，再按「转一圈找对称轴」：一条虚线从 0° 转到 180°——转半圈就够了，再转下去只是同一条线换个方向——每转到一条对称轴，它就留下一条绿线。正多边形（每条边一样长、每个角一样大）有几条边，就有几条对称轴（<a class="xlink" href="../../../math/geometry/polygon-angles/#step5">→ 多边形内角页第 5 步：正多边形的每个角</a>）；圆沿任何一条直径对折都重合，对称轴有无数条。',
    predict: '我猜有几条：', predInf: '无数条', sweep: '转一圈找对称轴',
    s1lgSweep: '正在检查的折线', s1lgAxis: '找到的对称轴',
    r1idle: '{shape}：先选一个猜测，再按「转一圈找对称轴」。',
    r1prog: '正在检查 {a}° 方向……已经找到 {n} 条。',
    r1done: '{shape}有 {n} 条对称轴（方向{angles}）。',
    r1none: '{shape}一条对称轴也没有：不管沿哪条穿过中心的线对折，都盖不住。',
    r1inf: '圆沿任何一条直径对折都重合：有无数条对称轴。',
    r1right: '你猜对了。', r1wrong: '你猜的是 {g}，和数出来的不一样。', r1nopred: '（这次没有先猜。）',
    tally: '数过的图形：', chip1: '{shape}：{n} 条', chip1inf: '{shape}：无数条',
    s1hint: '观察顺序：每换一个图形，先猜再扫。把正方形、长方形、等边三角形、正五边形、正六边形都数一遍，看条数和边数有什么关系；最后数平行四边形：一条也没有。',

    s2k: '第 2 步 · 转一转',
    s2t: '不翻面，只转，转多少度又和原来一模一样？',
    s2e: '这一步要回答：<strong>图形绕中心转动，转到哪些角度会和原来完全重合？</strong>转动时固定不动的那个点叫<strong>旋转中心</strong>（图中白点）。角度用「度」来量：转一整圈是 360°，半圈 180°，四分之一圈 90°（<a class="xlink" href="../../../math/geometry/clock-angles/#step0">→ 钟面角度页第 0 步：一圈 360°，指针每分钟转几度</a>）。灰色虚线是原来的位置；粉色点标出图形上的同一个角——重合时它已经换了位置，说明图形确实转过了，只是看起来没变。不用转满一整圈就能和原来重合的图形，叫<strong>旋转对称</strong>图形。转一整圈里重合的次数 n 越多，最小的重合角 360° ÷ n 越小。',
    turnAngle: '转动角度（度）', spin: '转一整圈',
    s2lgGhost: '原来的位置', s2lgNow: '转动后的图形', s2lgMark: '图形上同一个角（跟着转）', s2lgHit: '找到的重合角',
    r2hit: '转了 {a}°：和原来完全重合。', r2miss: '转了 {a}°：和原来对不上。',
    r2found: '找到的重合角{angles}。', r2none: '还没找到重合角：拖滑杆，或按「转一整圈」。',
    r2order: '转一整圈一共重合 {n} 次，最小重合角是 360° ÷ {n} = {min}°。',
    r2only: '转一整圈只在 360° 重合一次：它没有旋转对称。',
    s2hint: '观察顺序：先选「正方形」按「转一整圈」，看刻度环上亮起 4 个绿点；再换「平行四边形」——上一步它一条对称轴都没有，可转半圈 180° 就重合。最后换「四叶风车」：转 90° 就重合，却找不到一条对称轴。',

    s3k: '第 3 步 · 翻两次 = 转一次',
    s3t: '沿两条相交的线各翻一次，结果是什么？',
    s3e: '这一步要回答：<strong>为什么长方形有两条对称轴，就一定转半圈能重合？</strong>沿一条线像照镜子那样翻过去，得到的叫<strong>镜像</strong>。把一面小旗（它本身不对称，方便看出朝向）先沿镜子线 1 翻过去，再沿镜子线 2 翻过去；两条线相交于中心，夹角是 θ。翻一次，小旗的朝向反了过来（灰色）；翻第二次，又反了回来（橙色），结果正好等于把原来的小旗绕交点转 2θ（白色虚线）。所以一个图形只要有两条对称轴、夹角是 θ，它转 2θ 也一定重合：长方形两条对称轴夹角 90°，所以转 180° 重合。反过来不成立：风车能转着重合，却一条对称轴也没有。',
    mirrorAngle: '两条镜子线的夹角 θ（度）', flipTwice: '翻两次',
    s3lgStart: '原来的小旗', s3lgOnce: '翻第一次后（朝向反了）', s3lgTwice: '翻第二次后', s3lgTurn: '原来的小旗直接转 2θ',
    r3: '夹角 θ = {th}°：翻两次的结果和直接转 2θ = {two}° 完全重合。',
    r3p1: '正在沿镜子线 1 翻……', r3p2: '正在沿镜子线 2 翻……',
    s3hint: '观察顺序：按「翻两次」，先看灰色小旗朝向反了，再看橙色小旗朝向又正了，而且和白色虚线框完全重合。把 θ 拖到 90°：转 180°，这就是长方形的情况；拖到 45°：转 90°，这是正方形（相邻两条对称轴夹 45°）。',

    s4k: '第 4 步 · 万花筒',
    s4t: '只画一小块，整幅图案为什么会自己长满？',
    s4e: '这一步要回答：<strong>只在一个小扇形里盖一个章，为什么整个圆里都长出了图案？</strong>万花筒的做法是：把你盖的章绕中心每转 360° ÷ n 复制一份（n 是扇形的份数，复制出来的是青色），所以图案转 360° ÷ n 就重合——这是第 2 步的旋转对称。打开「镜子」后，每一份还会沿镜子线翻出一个镜像（橙色），于是图案还多了 n 条对称轴（灰色虚线）。盖 1 个章：关镜子时一共 n 个，开镜子时一共 2n 个。浅色扇形是「原稿区」，白色是你亲手盖的章。',
    sectors: '扇形份数 n', stampR: '印章离中心的距离', stampA: '印章在原稿区里的位置（%）', mirrorOn: '镜子：开（点一下关掉）', mirrorOff: '镜子：关（点一下打开）', stamp: '在原稿区盖一个章', clearStamps: '清空',
    s4lgWedge: '原稿区（一份扇形）', s4lgOrig: '你盖的章', s4lgTurn: '转出来的复制', s4lgFlip: '镜子翻出来的复制', s4lgMirror: '镜子线',
    r4: '你盖了 {s} 个章，n = {n}，{mstate}：画面上一共 {s} × {m} = {total} 面小旗。{sym}',
    mOn: '镜子开着（每份 2 面）', mOff: '镜子关着（每份 1 面）',
    symOn: '图案转 {deg}° 就重合，还有 {n} 条对称轴。',
    symOff: '图案转 {deg}° 就重合，但没有对称轴：小旗都朝同一个方向转着排，没有一面是翻过来的。',
    r4empty: '还没有章：按「在原稿区盖一个章」，或者直接点画布。',
    s4hint: '观察顺序：先按「在原稿区盖一个章」或直接点画布，数一数多出了几面小旗；再关掉「镜子」，同一个章只剩 n 面，而且朝向都一样；再改 n，看最小重合角 360° ÷ n 跟着变。',

    s5k: '第 5 步 · 自测与收束',
    s5t: '三道题：翻，还是转',
    s5e: '每题先自己想，再选答案、按「检查」。',
    qz1p: '① 长方形绕中心转 90°，能和原来重合吗？', qz1a: '能', qz1b: '不能',
    qz2p: '② 下面哪个图形没有对称轴，却不用转满一圈就能重合？',
    qz3p: '③ 正六边形绕中心转，最少转多少度就能重合？', opDeg: '{v}°',
    check: '检查', pick: '先选一个选项。',
    qz1ok: '对。转 90° 后长边竖了起来，和原来对不上；长方形的重合角是 {angles}，最小 {min}°。',
    qz1no: '再想想：转 90° 后，长边和短边换了方向。回第 2 步试一试。',
    qz2ok: '对。{shape}一条对称轴也没有，可转 {min}° 就重合。长方形、等边三角形两样都有；等腰三角形只有 1 条对称轴，要转满 360° 才重合。',
    qz2no: '再想想：要找「翻不行、转可以」的那个。回第 1 步和第 2 步各看一遍。',
    qz3ok: '对。正六边形转一整圈重合 {n} 次，最小重合角 360° ÷ {n} = {min}°。',
    qz3no: '再想想：转一整圈里它重合几次？最小重合角 = 360° ÷ 重合次数。',
    s5fin: '回头看这一路：<strong>第 0 步</strong>对折后两半完全重合的折线是对称轴；<strong>第 1 步</strong>对称轴的条数由图形决定：正 n 边形有 n 条，圆有无数条，平行四边形一条也没有；<strong>第 2 步</strong>不用转满一圈就重合是旋转对称，最小重合角 = 360° ÷ 重合次数；<strong>第 3 步</strong>沿两条相交的线各翻一次 = 转一次，所以有两条对称轴就一定有旋转对称，反过来却不一定；<strong>第 4 步</strong>万花筒把一份图案转出 n 份，开镜子再翻出 n 份。',
    formula: '翻：沿对称轴对折，两半完全重合\n转：最小重合角 = 360° ÷ 一圈里重合的次数\n翻两次（两线夹角 θ）= 转 2θ',
    boundary: '适用范围：本页只看平面图形，对称轴和旋转中心都在图形的中心（对称轴一定穿过中心，转着重合时中心也一定不动）。「重合」指形状和位置完全一样，看着差不多不算；第 0 步的百分比是在图上均匀取点数出来的近似值，在对称轴处它正好是 0。现实里的树叶、蝴蝶只是大致对称。',
    linksTitle: '接着去看',
    lk1: '→ 多边形内角页第 5 步：正多边形的每个角，外角 = 360° ÷ n',
    lk2: '→ 钟面角度页第 0 步：一圈 360°，指针每分钟转几度',
    lk3: '→ 相似页第 0 步：另一种「动一下」——放大后形状不变',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《对称与旋转 · 对折与转圈》的平行版本。'
  },
  en: {
    pageTitle: 'Symmetry & Rotation · Flip It, Turn It, Still the Same',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Symmetry & Rotation · Folding and Turning →',
    navLabel: 'Symmetry and rotation steps',
    tagline: 'Some shapes fold so that the two halves land exactly on each other; some turn through an angle and look just as they did. Fold shapes by hand and count their lines of symmetry, turn them to find the matching angles, discover that two flips make a turn, and finish with a kaleidoscope where one stamp fills a whole circle.',
    nav0: '0 Folding', nav1: '1 Counting lines', nav2: '2 Turning', nav3: '3 Two flips', nav4: '4 Kaleidoscope', nav5: '5 Quiz & wrap-up',
    sep: ', ', foundList: ': {angles}',
    shp_square: 'square', shp_rect: 'rectangle', shp_equilateral: 'equilateral triangle', shp_isosceles: 'isosceles triangle', shp_scalene: 'scalene triangle', shp_parallelogram: 'parallelogram',
    shp_pentagon: 'regular pentagon', shp_hexagon: 'regular hexagon', shp_pinwheel3: '3-blade pinwheel', shp_pinwheel4: '4-blade pinwheel', shp_circle: 'circle',

    s0k: 'Step 0 · Try a fold',
    s0t: 'Along which line does a fold make the halves cover each other?',
    s0e: 'This step asks: <strong>fold a paper shape along a straight line — when do the two halves land exactly on top of each other?</strong> Pick a shape, turn the fold line and press “Fold”: the half on one side (orange) flips over onto the other half (cyan). If the halves <strong>match exactly</strong> — nothing sticking out, nothing missing — the fold line is a <strong>line of symmetry</strong> of the shape, and a shape that has one is <strong>symmetrical</strong> (line-symmetric). A line of symmetry always passes through the centre of the shape, so only lines through the centre are tried here. Wherever the halves don’t match you’ll see cyan or orange on its own, and the readout gives roughly what percentage of the shape that is. “Nearly” doesn’t count — it has to be 0.',
    s0lgStay: 'half that stays', s0lgMove: 'half that flips over', s0lgLine: 'fold line', s0lgYes: 'tried: a line of symmetry', s0lgNo: 'tried: not a line of symmetry',
    foldAngle: 'Fold direction (degrees, 0 = level)', fold: 'Fold', unfold: 'Unfold',
    r0open: 'Fold direction {a}°. Press “Fold” to flip the orange half over. Tried on this shape: {tried} lines; lines of symmetry found: {found}{list}.',
    r0mid: 'Folding…',
    r0yes: 'After folding the halves match exactly — 0% left uncovered: the {a}° line is a line of symmetry. Tried on this shape: {tried} lines; lines of symmetry found: {found}{list}.',
    r0no: 'After folding about {pct}% of the shape is left uncovered: the {a}° line is not a line of symmetry. Tried on this shape: {tried} lines; lines of symmetry found: {found}{list}.',
    s0hint: 'What to watch: choose “Rectangle”, set the fold to 0° (level) and press “Fold” — the halves match exactly. Try 30° and corners of cyan and orange poke out on their own. Try every direction from 0° to 165°; the little marks around the picture keep score: green for a line of symmetry, pink for not. Then do the same with the parallelogram — it looks so tidy, yet no mark turns green.',

    s1k: 'Step 1 · Counting lines of symmetry',
    s1t: 'How many lines of symmetry? Guess first, then count',
    s1e: 'This step asks: <strong>how many lines of symmetry (folds that make the halves match exactly) do different shapes have?</strong> Make a guess below, then press “Sweep for lines”: a dashed line turns from 0° to 180° — half a turn is enough, since going further only repeats the same lines facing the other way — and leaves a green line wherever it finds a line of symmetry. A regular polygon (all sides equal, all angles equal) has as many lines of symmetry as it has sides (<a class="xlink" href="../../../math/geometry/polygon-angles/#step5">→ Polygon angles, step 5: the angles of a regular polygon</a>); a circle matches when folded along any diameter, so it has infinitely many.',
    predict: 'My guess:', predInf: 'infinitely many', sweep: 'Sweep for lines',
    s1lgSweep: 'line being checked', s1lgAxis: 'line of symmetry found',
    r1idle: '{shape}: make a guess, then press “Sweep for lines”.',
    r1prog: 'Checking {a}°… {n} found so far.',
    r1done: 'The {shape} has {n} lines of symmetry (directions{angles}).',
    r1none: 'The {shape} has no line of symmetry: whichever line through the centre you fold along, the halves don’t match.',
    r1inf: 'A circle matches when folded along any diameter: infinitely many lines of symmetry.',
    r1right: 'Your guess was right.', r1wrong: 'You guessed {g}, which isn’t what the count shows.', r1nopred: '(No guess this time.)',
    tally: 'Shapes counted:', chip1: '{shape}: {n}', chip1inf: '{shape}: infinitely many',
    s1hint: 'What to watch: for each shape, guess first, then sweep. Count the square, rectangle, equilateral triangle, regular pentagon and regular hexagon and compare the number of lines with the number of sides; finish with the parallelogram — not a single one.',

    s2k: 'Step 2 · Turning',
    s2t: 'No flipping, just turning — how far until it looks the same?',
    s2e: 'This step asks: <strong>as a shape turns about its centre, at which angles does it match its starting position exactly?</strong> The point that stays put while it turns is the <strong>centre of rotation</strong> (the white dot). Angles are measured in degrees: a full turn is 360°, half a turn 180°, a quarter turn 90° (<a class="xlink" href="../../../math/geometry/clock-angles/#step0">→ Clock angles, step 0: 360° round the face, and how far each hand turns per minute</a>). The dashed grey outline is the starting position; the pink dot marks one particular corner — when the shape matches, that corner has moved, so the shape really did turn even though it looks unchanged. A shape that matches before a full turn has <strong>rotational symmetry</strong>. The more times n it matches in one full turn, the smaller its smallest matching angle, 360° ÷ n.',
    turnAngle: 'Turn (degrees)', spin: 'Turn all the way round',
    s2lgGhost: 'starting position', s2lgNow: 'the shape after turning', s2lgMark: 'one particular corner (turns with it)', s2lgHit: 'matching angles found',
    r2hit: 'Turned {a}°: an exact match with the start.', r2miss: 'Turned {a}°: doesn’t match the start.',
    r2found: 'Matching angles found{angles}.', r2none: 'No matching angle yet: drag the slider or press “Turn all the way round”.',
    r2order: 'It matches {n} times in one full turn; the smallest matching angle is 360° ÷ {n} = {min}°.',
    r2only: 'In a full turn it only matches at 360°: no rotational symmetry.',
    s2hint: 'What to watch: choose “Square” and press “Turn all the way round” — four green dots light up on the ring. Switch to the parallelogram: no lines of symmetry in step 1, yet half a turn, 180°, brings it back. Finally the 4-blade pinwheel: it matches at 90°, and still has no line of symmetry.',

    s3k: 'Step 3 · Two flips make a turn',
    s3t: 'Flip across two crossing lines in turn — what do you get?',
    s3e: 'This step asks: <strong>why must a rectangle, with its two lines of symmetry, also match after half a turn?</strong> Flipping a shape across a line, as a mirror would, gives its <strong>mirror image</strong>. Take a little flag (lopsided on purpose, so you can tell which way it faces), flip it across mirror line 1, then across mirror line 2; the lines cross at the centre at an angle θ. One flip turns the flag to face the other way (grey); the second flip turns it back (orange) — and the result is exactly the original flag turned through 2θ about the crossing point (dashed white). So a shape with two lines of symmetry at angle θ must also match after turning 2θ: a rectangle’s two lines meet at 90°, so it matches after 180°. The reverse fails: a pinwheel matches when turned yet has no line of symmetry at all.',
    mirrorAngle: 'Angle θ between the mirror lines (degrees)', flipTwice: 'Flip twice',
    s3lgStart: 'the original flag', s3lgOnce: 'after the first flip (facing the other way)', s3lgTwice: 'after the second flip', s3lgTurn: 'the original flag turned straight through 2θ',
    r3: 'θ = {th}°: two flips give exactly the same result as one turn of 2θ = {two}°.',
    r3p1: 'Flipping across mirror line 1…', r3p2: 'Flipping across mirror line 2…',
    s3hint: 'What to watch: press “Flip twice”. The grey flag faces the other way; the orange flag faces the original way again and sits exactly inside the dashed white outline. Set θ to 90°: a 180° turn — the rectangle’s case. Set θ to 45°: a 90° turn — the square’s case (neighbouring lines of symmetry meet at 45°).',

    s4k: 'Step 4 · Kaleidoscope',
    s4t: 'Draw one small piece — why does the whole pattern fill itself in?',
    s4e: 'This step asks: <strong>press one stamp inside a narrow wedge — why does a pattern grow all the way round?</strong> A kaleidoscope copies your stamp around the centre every 360° ÷ n (n is the number of wedges; the copies are cyan), so the pattern matches itself after turning 360° ÷ n — the rotational symmetry of step 2. Switch on the “Mirror” and every copy also gets a mirror image across the mirror lines (orange), so the pattern gains n lines of symmetry (dashed grey) as well. One stamp therefore becomes n flags with the mirror off and 2n with it on. The pale wedge is your drawing area; white flags are the stamps you pressed yourself.',
    sectors: 'Number of wedges n', stampR: 'Stamp distance from the centre', stampA: 'Stamp position across the wedge (%)', mirrorOn: 'Mirror: on (tap to turn off)', mirrorOff: 'Mirror: off (tap to turn on)', stamp: 'Stamp in the drawing area', clearStamps: 'Clear',
    s4lgWedge: 'drawing area (one wedge)', s4lgOrig: 'your stamps', s4lgTurn: 'turned copies', s4lgFlip: 'mirrored copies', s4lgMirror: 'mirror lines',
    r4: '{s} stamps, n = {n}, {mstate}: {s} × {m} = {total} flags in all. {sym}',
    mOn: 'mirror on (2 per wedge)', mOff: 'mirror off (1 per wedge)',
    symOn: 'The pattern matches after a {deg}° turn and also has {n} lines of symmetry.',
    symOff: 'The pattern matches after a {deg}° turn but has no line of symmetry: every flag faces the same way round, none is flipped.',
    r4empty: 'No stamps yet: press “Stamp in the drawing area”, or just tap the picture.',
    s4hint: 'What to watch: press “Stamp in the drawing area” or tap the picture and count how many flags appear. Switch the mirror off: the same stamp gives only n flags, all facing the same way round. Change n and watch the smallest matching turn, 360° ÷ n, change with it.',

    s5k: 'Step 5 · Quiz & wrap-up',
    s5t: 'Three questions: flip or turn',
    s5e: 'Think each one through, then pick an answer and press “Check”.',
    qz1p: '① Turn a rectangle 90° about its centre. Does it match its starting position?', qz1a: 'Yes', qz1b: 'No',
    qz2p: '② Which shape has no line of symmetry, yet matches itself before a full turn?',
    qz3p: '③ What is the smallest turn about its centre that brings a regular hexagon back onto itself?', opDeg: '{v}°',
    check: 'Check', pick: 'Pick an option first.',
    qz1ok: 'Right. After 90° the long sides stand upright and don’t match; a rectangle matches at {angles}, the smallest being {min}°.',
    qz1no: 'Not quite: after 90° the long and short sides have swapped directions. Try it in step 2.',
    qz2ok: 'Right. The {shape} has no line of symmetry but matches after {min}°. The rectangle and the equilateral triangle have both kinds; the isosceles triangle has 1 line of symmetry and only matches after a full 360°.',
    qz2no: 'Not quite: look for the one where flipping fails but turning works. Revisit steps 1 and 2.',
    qz3ok: 'Right. A regular hexagon matches {n} times in a full turn, so its smallest matching angle is 360° ÷ {n} = {min}°.',
    qz3no: 'Not quite: how many times does it match in one full turn? Smallest matching angle = 360° ÷ that number.',
    s5fin: 'Looking back. <strong>Step 0</strong>: a fold that makes the halves match exactly is a line of symmetry. <strong>Step 1</strong>: the shape decides how many it has — n for a regular n-sided polygon, infinitely many for a circle, none for a parallelogram. <strong>Step 2</strong>: matching before a full turn is rotational symmetry, and the smallest matching angle is 360° ÷ the number of matches. <strong>Step 3</strong>: flipping across two crossing lines in turn is one turn, so two lines of symmetry always bring rotational symmetry — but not the other way round. <strong>Step 4</strong>: a kaleidoscope turns one piece into n copies, and the mirror adds n more.',
    formula: 'flip: fold along a line of symmetry, the halves match exactly\nturn: smallest matching angle = 360° ÷ matches per full turn\ntwo flips (lines at angle θ) = one turn of 2θ',
    boundary: 'Scope: flat shapes only, with lines of symmetry and the centre of rotation at the shape’s centre (a line of symmetry always passes through it, and it stays put during a matching turn). “Match” means same shape in the same place — looking nearly the same doesn’t count. The percentages in step 0 are estimates counted from evenly spread sample points, and they are exactly 0 on a line of symmetry. Real leaves and butterflies are only roughly symmetrical.',
    linksTitle: 'Where to go next',
    lk1: '→ Polygon angles, step 5: each angle of a regular polygon; the exterior angle is 360° ÷ n',
    lk2: '→ Clock angles, step 0: 360° round the face, and how far each hand turns per minute',
    lk3: '→ Similarity, step 0: a different kind of move — enlarging keeps the shape',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Symmetry & Rotation · Folding and Turning”.'
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
