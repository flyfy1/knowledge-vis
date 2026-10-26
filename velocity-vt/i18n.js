'use strict';
/* ============================================================
   速度与 v-t 图 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '速度与 v-t 图 · 线下面的面积就是走过的路 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '速度与 v-t 图 · 面积就是路',
    tagline: '速度会变的时候，走过的路怎么算？这一页先赛一场跑，再把同一场比赛画成两种图：x-t 图和 v-t 图。最后你会发现，v-t 图下面的面积不是装饰——把图切成小条一条条加起来，路自己就出来了。这是高中积分的第一颗种子，先把手感种下。',
    nav0: '0 赛跑', nav1: '1 v-t 图登场', nav2: '2 面积就是路', nav3: '3 读图实战', nav4: '4 自测', nav5: '5 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 速度与 v-t 图 Velocity-Time Graphs —— 一步一交互系列',
    play: '播放 ▶', pause: '暂停 ❚❚', restart: '重新开始',

    s0k: '第 0 步 · 赛跑',
    s0t: '赛跑：跑道和图，讲的是同一场比赛',
    s0e: '这一步要回答：<strong>两个人谁快、谁先到，图上的线怎么把这件事说出来？</strong>甲、乙两辆小车同时从 0 m 出发：甲车每秒走 4 m，乙车每秒走 2 m——每秒走过的路一样多，这种运动叫<strong>匀速</strong>。上面是跑道，下面是 <strong>x-t 图</strong>（横轴时间 t、纵轴位置 x）：比赛进行到哪一刻，线就长到哪一刻，两边永远是同一场比赛。',
    s0probeLab: '时间探针 t（动画与探针共用一个时钟）',
    s0roStart: '还没出发：两辆车都在 0 m。点「播放」看比赛，或者直接拖时间探针。',
    s0ro: 't = {t} s：甲车在 <span>{xa} m</span>，乙车在 <span>{xb} m</span>，甲领先 <b>{gap} m</b>。图上同一时刻，两条线的高低差，正是跑道上的位置差。',
    s0roEnd: '比赛结束（t = 10 s）：甲车跑完全程 <b>40 m</b>，乙车只到 <span>20 m</span>——速度是甲的一半，走过的路也正好是一半。',
    s0hint: '结论：x-t 图里<strong>线越陡，速度越大</strong>——甲的线更陡，所以甲更快。读 x-t 图，看的是线的<strong>陡缓</strong>。',
    s0lkLf: '「陡缓」就是一次函数页里的斜率：去看斜率怎样从爬坡里长出来 →',
    cCarA: '甲车 · 4 m/s', cCarB: '乙车 · 2 m/s', cCarC: '丙车 · 起步加速',
    cFinish: '终点 40 m', cStart: '起点 0 m',
    cTimeS: '时间 t / s', cPosM: '位置 x / m', cVelV: '速度 v / (m/s)',

    s1k: '第 1 步 · v-t 图登场',
    s1t: '同一场比赛，换一张图：画每一刻的速度',
    s1e: '这一步要回答：<strong>把「每一刻的速度」画成图，长什么样？</strong>还是刚才的甲、乙两辆车，再加一辆丙车：丙车起步慢，前 4 秒速度从 0 慢慢涨到 4 m/s，之后保持 4 m/s。用下面的按钮在 <strong>x-t 图</strong>和 <strong>v-t 图</strong>（横轴时间 t、纵轴这一刻的速度 v）之间切换——同一场比赛，两种画法，随时对照。',
    s1mXt: '看 x-t 图（位置）', s1mVt: '看 v-t 图（速度）',
    s1probeLab: '时间探针 t（与动画同一个时钟）',
    s1roX: 't = {t} s：位置 甲 <span>{xa} m</span>、乙 <span>{xb} m</span>、丙 <span>{xc} m</span>。这是 x-t 图，看谁在前面——线越高，位置越靠前。',
    s1roV: 't = {t} s：速度 甲 <span>{va} m/s</span>、乙 <span>{vb} m/s</span>、丙 <span>{vc} m/s</span>。这是 v-t 图，看谁更快——线越高，速度越大。',
    s1roVEnd: '比赛结束：v-t 图里甲、乙从头到尾是两条<strong>平线</strong>（速度没变过）；丙的线先爬升、后变平——它起步时最慢，结束时和甲一样快。',
    s1hint: '防混淆：匀速运动在 x-t 图里是<strong>斜线</strong>，在 v-t 图里是<strong>平线</strong>。读 v-t 图不要看陡不陡，要看线离横轴<strong>有多高</strong>——高度就是这一刻的速度。这和 x-t 图正相反，第 3 步会专门练。',

    s2k: '第 2 步 · 面积就是路',
    s2t: '图下面的面积，凭什么是路程？',
    s2e: '这一步要回答：<strong>v-t 图下面的那块面积，凭什么等于走过的路？</strong>先看最老实的情况：速度一直不变，面积是整块长方形，一乘就对上账。再看速度均匀变大的情况：图下是个三角形，整块算得出；把它切成一条条窄长方形加起来，也能逼近同一个数——条越细，越准。',
    s2aT: '先看匀速：速度一直 4 m/s，走 3 s',
    s2aBtn: '把这块面积算出来',
    s2aIdle: '图下是一整块长方形。点按钮，把这块面积逐项算出来，和真的走过的路对一对账。',
    s2aDone: '面积 = 速度 × 时间 = <span>4 m/s × 3 s</span> = <b>12</b>，单位 m/s × s = m。而小车这 3 秒真的走了 <b>12 m</b>——看下面那条路：图上数面积，数出的就是路。',
    s2bT: '再看变速：速度从 0 均匀涨到 4 m/s（用时 2 s）',
    s2bTri: '整块（三角形）', s2b4: '切成 4 条', s2b8: '切成 8 条', s2b16: '切成 16 条',
    s2bIdle: '点「整块（三角形）」直接算，或者切成细条，看台阶怎样一步步逼近斜线。',
    s2bTriRo: '整块是一个三角形：面积 = ½ × 底 × 高 = ½ × <span>2 s × 4 m/s</span> = <b>4 m</b>。这 2 秒走过的路，就是 4 m。',
    s2bCutRo: '切成 {n} 条窄长方形（每条宽 {dt} s，高取左边的速度）：台阶总和 = <b>{sum} m</b>；精确值是 4 m，还差 <b>{diff} m</b>。条越细，台阶越贴合斜线，差越小。',
    s2hint: '本页所有速度 v≥0，所以 <strong>v-t 图下面积 = 位移 = 路程</strong>。一般往返运动中，有符号面积 ∫v dt 是位移，路程要算 ∫|v| dt。把时间切成细条再累加，是积分的基本想法。',
    cRoad: '实际走过的路',

    s3k: '第 3 步 · 读图实战',
    s3t: '一段真实的行程：加速、匀速、减速',
    s3e: '这一步要回答：<strong>给一段像真实行程的 v-t 图，能读出多少事？</strong>这辆车 0–2 s 从 0 加速到 4 m/s，2–5 s 保持 4 m/s，5–7 s 减速到 0。拖动探针停在任意一刻，读到的就是<strong>这一刻的速度</strong>——给它个名字，叫<strong>瞬时速度</strong>；再逐段点亮图下的面积，看每段各贡献了多少路。',
    s3probeLab: '时刻探针 t',
    s3ro: 't = {t} s 这一刻：瞬时速度 <span>{v} m/s</span>；从出发到这一刻，已经走了 <b>{d} m</b>（= 图下从 0 到 {t} s 的面积）。',
    s3segLab: '逐段点亮面积（可多选）：',
    s3seg1: '第 1 段 0–2 s', s3seg2: '第 2 段 2–5 s', s3seg3: '第 3 段 5–7 s',
    s3areaIdle: '点上面的按钮，逐段把图下的面积点亮，看每段贡献了多少路。',
    s3segA1: '第 1 段（三角形）：½ × 2 s × 4 m/s = <b>4 m</b>',
    s3segA2: '第 2 段（长方形）：3 s × 4 m/s = <b>12 m</b>',
    s3segA3: '第 3 段（三角形）：½ × 2 s × 4 m/s = <b>4 m</b>',
    s3areaSum: '已点亮的面积合计：<b>{sum} m</b>。',
    s3areaAll: '三段全亮：4 + 12 + 4 = <b>20 m</b>——这就是全程走过的路。每段的面积加起来，就是总路程。',
    s3qLab: '判断每一段在干什么（看这段线是升、平、还是降）：',
    s3qSeg1: '第 1 段（0–2 s）', s3qSeg2: '第 2 段（2–5 s）', s3qSeg3: '第 3 段（5–7 s）',
    optAcc: '加速', optUni: '匀速', optDec: '减速',
    qOk: '✓ 判断对了', qNo: '✗ 不对——再看这段线是升、平、还是降',
    s3hint: '读 v-t 图三件事：<strong>看高低</strong>（线多高就是多快）、<strong>看升降</strong>（升 = 加速、平 = 匀速、降 = 减速）、<strong>算面积</strong>（图下的面积就是这一段的路）。',

    s4k: '第 4 步 · 自测',
    s4t: '换一段行程，自己读',
    s4e: '新的一段行程：0–3 s 从 0 加速到 6 m/s，3–6 s 保持 6 m/s，6–8 s 减速到 0。三道题都从这张图里读——不许背，只许读图。',
    s4q1: '问题 1：把探针拖到 <b>t = 7 s</b> 这一刻，再点「就按现在作答」：这一刻的速度是多少？（探针会替你读出纵轴的高度。）',
    s4probeLab: '探针 t',
    s4q1Btn: '就按现在作答',
    s4probeRo: '探针：t = {t} s，这一刻的速度 <span>{v} m/s</span>。',
    s4q1Ok: '✓ 对了：t = 7 s 时速度是 <b>3 m/s</b>。第 3 段在减速，速度从 6 m/s 均匀往下掉；7 s 正好是这一段的中点，速度也正好掉到一半。',
    s4q1NoT: '✗ 探针还没停在 t = 7 s（刚才停在 t = {t} s）。先把探针拖到那一刻，再作答。',
    s4q2: '问题 2：这段行程一共走了多少米？（提示：把三段的面积分别算出来，再相加。）',
    s4q2Ok: '✓ 对：½ × 3 s × 6 m/s + 3 s × 6 m/s + ½ × 2 s × 6 m/s = 9 + 18 + 6 = <b>33 m</b>。两头是三角形，中间是长方形。',
    s4q2No: '✗ 不对。再逐段算一次：两头是三角形（½ × 底 × 高），中间是长方形（底 × 高），然后相加。',
    s4q3: '问题 3（判断）：「v-t 图里，线越陡，速度越大。」这句话对吗？',
    judgeT: '对', judgeF: '错',
    s4q3Ok: '✓ 判断正确：这句话<strong>是错的</strong>。线陡，只说明速度<strong>变得快</strong>；某一刻速度有多大，要看那一刻线<strong>有多高</strong>（纵轴的读数），不是看陡不陡。回想第 1 步：丙车起步那段线最陡，可那时它的速度恰恰最小。',
    s4q3No: '✗ 再想想：丙车刚起步时线最陡，可那一刻它的速度接近 0。陡，说的是速度变得快，不是速度大。',
    s4score: '自测进度：已答对 <b>{n} / 3</b> 题。',
    s4scoreDone: '自测进度：已答对 <b>3 / 3</b> 题——三道全对，收工！',

    s5k: '第 5 步 · 终章',
    s5t: '两张图，一本账',
    s5e: '同一场运动，能画成两种图；两种图的读法正好互补。把这三句话带走，这一页就算学完了。',
    c1h: 'x-t 图看陡缓',
    c1: '位置对时间的图：线越陡，速度越大；线平了，就是停着不动。陡缓回答的是「多快」。',
    c2h: 'v-t 图看高低',
    c2: '速度对时间的图：看的不是陡缓，是线离横轴<strong>有多高</strong>——高度就是这一刻的速度。线在升是加速、在降是减速、平着是匀速。',
    c3h: '面积是路',
    c3: '本页 v≥0，v-t 面积既是位移也是路程。一般有符号面积 ∫v dt 是位移，路程是 ∫|v| dt；往返时不能混用。',
    s5fin: '下一站预告（高中）：把图切成无限细的条再相加，有个正式名字，叫<strong>积分</strong>；到那时你会发现，v-t 图下面的面积，就是积分算的第一笔账。今天这颗种子，先种在这里。',
    s5lkLf: '斜率先是爬坡的陡缓，在这一页它变成速度：回一次函数第 0 步 →',
    s5lkArea: '面积 = 长 × 宽 是从哪来的？面积模型页把乘法画成了一块地 →',
  },
  en: {
    docTitle: 'Velocity & v–t Graphs · The Area Under the Line Is the Distance — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Velocity & v–t Graphs · Area Is Distance',
    tagline: 'When the speed keeps changing, how far have you actually gone? This page starts with a race, then draws the same race two ways: an x–t graph and a v–t graph. By the end you will see that the area under a v–t graph is not decoration — slice the region into thin strips, add them up, and the distance computes itself. This is the first seed of integration in senior school; here we plant the intuition.',
    nav0: '0 The Race', nav1: '1 The v–t Graph', nav2: '2 Area Is Distance', nav3: '3 Reading a Real Trip', nav4: '4 Quiz', nav5: '5 Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Velocity & v–t Graphs —— one interaction at a time',
    play: 'Play ▶', pause: 'Pause ❚❚', restart: 'Restart',

    s0k: 'Step 0 · The Race',
    s0t: 'A Race: The Track and the Graph Tell the Same Story',
    s0e: 'This step answers: <strong>who is faster, who finishes first — and how do the lines on a graph say it?</strong> Two cars set off from 0 m together: car A covers 4 m every second, car B covers 2 m every second. Covering the same distance each second is called <strong>uniform motion</strong>. Above is the track; below is the <strong>x–t graph</strong> (time t on the horizontal axis, position x on the vertical axis): the lines grow exactly as far as the race has run — both panels always show the same race.',
    s0probeLab: 'Time probe t (shares one clock with the animation)',
    s0roStart: 'Not started yet: both cars are at 0 m. Press “Play” to watch the race, or drag the time probe directly.',
    s0ro: 'At t = {t} s: car A is at <span>{xa} m</span>, car B at <span>{xb} m</span> — A leads by <b>{gap} m</b>. At any moment, the vertical gap between the two lines is exactly the gap on the track.',
    s0roEnd: 'Race over (t = 10 s): car A has covered the full <b>40 m</b>, car B only <span>20 m</span> — half the speed, so exactly half the distance.',
    s0hint: 'Takeaway: on an x–t graph, <strong>the steeper the line, the faster the motion</strong> — A’s line is steeper, so A is faster. Reading an x–t graph means reading <strong>steepness</strong>.',
    s0lkLf: '“Steepness” is the slope from the Linear Functions page: see how slope grows out of climbing a hill →',
    cCarA: 'Car A · 4 m/s', cCarB: 'Car B · 2 m/s', cCarC: 'Car C · speeding up',
    cFinish: 'Finish 40 m', cStart: 'Start 0 m',
    cTimeS: 'time t / s', cPosM: 'position x / m', cVelV: 'velocity v / (m/s)',

    s1k: 'Step 1 · The v–t Graph Appears',
    s1t: 'The Same Race, a New Graph: the Speed at Every Moment',
    s1e: 'This step answers: <strong>what does it look like to graph “the speed at each moment”?</strong> Same cars A and B, plus a car C: C starts slowly, its speed rises from 0 to 4 m/s over the first 4 seconds, then stays at 4 m/s. Use the buttons to switch between the <strong>x–t graph</strong> and the <strong>v–t graph</strong> (time t horizontally, the speed v at that moment vertically) — one race, two drawings, side by side whenever you flip.',
    s1mXt: 'x–t graph (position)', s1mVt: 'v–t graph (velocity)',
    s1probeLab: 'Time probe t (same clock as the animation)',
    s1roX: 'At t = {t} s, positions: A <span>{xa} m</span>, B <span>{xb} m</span>, C <span>{xc} m</span>. This is the x–t graph — it shows who is ahead: the higher the line, the further along.',
    s1roV: 'At t = {t} s, speeds: A <span>{va} m/s</span>, B <span>{vb} m/s</span>, C <span>{vc} m/s</span>. This is the v–t graph — it shows who is faster: the higher the line, the greater the speed.',
    s1roVEnd: 'Race over: on the v–t graph, A and B are <strong>flat lines</strong> from start to finish (their speeds never changed); C’s line climbs first, then flattens — slowest at the start, as fast as A by the end.',
    s1hint: 'Do not mix them up: uniform motion is a <strong>slanted line</strong> on an x–t graph but a <strong>flat line</strong> on a v–t graph. On a v–t graph, ignore steepness and look at <strong>how high</strong> the line sits above the time axis — that height is the speed at that moment. Exactly the opposite of an x–t graph, and Step 3 drills it.',

    s2k: 'Step 2 · Area Is Distance',
    s2t: 'Why Should the Area Under the Graph Be the Distance?',
    s2e: 'This step answers: <strong>why does the area under a v–t graph equal the distance travelled?</strong> Start with the honest case: speed never changes, the region is one whole rectangle, and one multiplication balances the books. Then a speed that grows steadily: the region is a triangle — computable whole, but also reachable by slicing it into thin rectangles and adding them up. The finer the slices, the closer the sum.',
    s2aT: 'First, uniform: a steady 4 m/s for 3 s',
    s2aBtn: 'Work out this area',
    s2aIdle: 'Under the line sits one whole rectangle. Press the button to compute its area item by item and check it against the distance really travelled.',
    s2aDone: 'Area = speed × time = <span>4 m/s × 3 s</span> = <b>12</b>, and the unit works out: m/s × s = m. The car really did travel <b>12 m</b> in those 3 s — look at the road strip below: counting area on the graph counts the distance.',
    s2bT: 'Then, changing speed: v grows steadily from 0 to 4 m/s (over 2 s)',
    s2bTri: 'Whole (triangle)', s2b4: 'Slice into 4', s2b8: 'Slice into 8', s2b16: 'Slice into 16',
    s2bIdle: 'Press “Whole (triangle)” to compute it at once, or slice it into strips and watch the staircase close in on the slanted line.',
    s2bTriRo: 'The whole region is a triangle: area = ½ × base × height = ½ × <span>2 s × 4 m/s</span> = <b>4 m</b>. The distance covered in these 2 s is exactly 4 m.',
    s2bCutRo: 'Sliced into {n} thin rectangles (each {dt} s wide, height taken at its left edge): the staircase sums to <b>{sum} m</b>; the exact value is 4 m, so it is still <b>{diff} m</b> short. The finer the slices, the tighter the staircase hugs the line, and the smaller the gap.',
    s2hint: 'All velocities on this page are nonnegative, so <strong>v–t area = displacement = distance</strong>. For motion that reverses direction, signed area ∫v dt gives displacement; distance is ∫|v| dt. Adding narrow time strips is the basic idea of integration.',
    cRoad: 'distance really travelled',

    s3k: 'Step 3 · Reading a Real Trip',
    s3t: 'A Trip-Like Graph: Speeding Up, Cruising, Slowing Down',
    s3e: 'This step answers: <strong>given a trip-like v–t graph, how much can you read off it?</strong> This car speeds up from 0 to 4 m/s during 0–2 s, holds 4 m/s during 2–5 s, then slows to 0 by 7 s. Drag the probe to any moment: what it reads is <strong>the speed at that very moment</strong> — it has a name, <strong>instantaneous velocity</strong>. Then light up the area segment by segment and see how much distance each part contributes.',
    s3probeLab: 'Moment probe t',
    s3ro: 'At t = {t} s: instantaneous velocity <span>{v} m/s</span>; from the start until this moment it has travelled <b>{d} m</b> (= the area under the graph from 0 to {t} s).',
    s3segLab: 'Light up the area, segment by segment (multi-select):',
    s3seg1: 'Segment 1 · 0–2 s', s3seg2: 'Segment 2 · 2–5 s', s3seg3: 'Segment 3 · 5–7 s',
    s3areaIdle: 'Press the buttons above to light up the area under each segment and see how much distance each contributes.',
    s3segA1: 'Segment 1 (triangle): ½ × 2 s × 4 m/s = <b>4 m</b>',
    s3segA2: 'Segment 2 (rectangle): 3 s × 4 m/s = <b>12 m</b>',
    s3segA3: 'Segment 3 (triangle): ½ × 2 s × 4 m/s = <b>4 m</b>',
    s3areaSum: 'Lit area so far: <b>{sum} m</b>.',
    s3areaAll: 'All three lit: 4 + 12 + 4 = <b>20 m</b> — the distance for the whole trip. Add the areas of the segments and you get the total distance.',
    s3qLab: 'Decide what each segment is doing (watch whether its line rises, stays flat, or falls):',
    s3qSeg1: 'Segment 1 (0–2 s)', s3qSeg2: 'Segment 2 (2–5 s)', s3qSeg3: 'Segment 3 (5–7 s)',
    optAcc: 'Speeding up', optUni: 'Constant speed', optDec: 'Slowing down',
    qOk: '✓ Correct', qNo: '✗ Not quite — is the line rising, flat, or falling?',
    s3hint: 'Reading a v–t graph takes three moves: <strong>check the height</strong> (how high the line is = how fast), <strong>check the trend</strong> (rising = speeding up, flat = constant, falling = slowing down), <strong>measure the area</strong> (the area under a segment is the distance of that segment).',

    s4k: 'Step 4 · Quiz',
    s4t: 'A New Trip — Read It Yourself',
    s4e: 'A fresh trip: from 0 to 6 m/s during 0–3 s, holding 6 m/s during 3–6 s, then slowing to 0 by 8 s. All three questions are read off this one graph — no memorising, just reading.',
    s4q1: 'Question 1: drag the probe to the moment <b>t = 7 s</b>, then press “Answer with the probe here”: what is the speed at that moment? (The probe reads the height of the line for you.)',
    s4probeLab: 'Probe t',
    s4q1Btn: 'Answer with the probe here',
    s4probeRo: 'Probe: t = {t} s, the speed at this moment is <span>{v} m/s</span>.',
    s4q1Ok: '✓ Correct: at t = 7 s the speed is <b>3 m/s</b>. Segment 3 is slowing down, the speed falling steadily from 6 m/s; 7 s is exactly the midpoint of that segment, and the speed has fallen to exactly half.',
    s4q1NoT: '✗ The probe is not at t = 7 s yet (it was at t = {t} s). Drag it to that moment first, then answer.',
    s4q2: 'Question 2: how many metres did this trip cover in total? (Hint: compute the area of each of the three segments, then add.)',
    s4q2Ok: '✓ Correct: ½ × 3 s × 6 m/s + 3 s × 6 m/s + ½ × 2 s × 6 m/s = 9 + 18 + 6 = <b>33 m</b>. Triangles at both ends, a rectangle in the middle.',
    s4q2No: '✗ Not quite. Go segment by segment: triangles at both ends (½ × base × height), a rectangle in the middle (base × height), then add them up.',
    s4q3: 'Question 3 (true or false): “On a v–t graph, the steeper the line, the greater the speed.” Is that right?',
    judgeT: 'True', judgeF: 'False',
    s4q3Ok: '✓ Correct judgement: the statement is <strong>false</strong>. A steep line only means the speed is <strong>changing fast</strong>; how large the speed is at a moment depends on <strong>how high</strong> the line is then (the reading on the vertical axis), not on steepness. Remember Step 1: car C’s line was steepest right at the start — when its speed was smallest.',
    s4q3No: '✗ Think again: right when car C set off, its line was the steepest — yet its speed at that moment was nearly 0. Steepness tells you the speed is changing fast, not that the speed is large.',
    s4score: 'Quiz progress: <b>{n} / 3</b> answered correctly.',
    s4scoreDone: 'Quiz progress: <b>3 / 3</b> — all three right, done!',

    s5k: 'Step 5 · Finale',
    s5t: 'Two Graphs, One Ledger',
    s5e: 'One motion can be drawn two ways, and the two readings complement each other. Take these three sentences with you and this page is yours.',
    c1h: 'x–t graphs: read the steepness',
    c1: 'Position against time: the steeper the line, the faster the motion; a flat line means standing still. Steepness answers “how fast”.',
    c2h: 'v–t graphs: read the height',
    c2: 'Velocity against time: what matters is not steepness but <strong>how high</strong> the line sits above the time axis — that height is the speed at that moment. Rising means speeding up, falling means slowing down, flat means constant speed.',
    c3h: 'Area is distance',
    c3: 'Here v≥0, so v–t area equals both displacement and distance. In general, signed area ∫v dt is displacement, while distance is ∫|v| dt; they differ for a return trip.',
    s5fin: 'Coming attraction (senior school): slicing a region into infinitely thin strips and adding them up has a formal name — <strong>integration</strong> — and when you meet it, you will find that the area under a v–t graph is the very first account it settles. The seed is planted here today.',
    s5lkLf: 'Slope was the steepness of a climb there; here it becomes velocity: back to Linear Functions, Step 0 →',
    s5lkArea: 'Where does area = length × width come from? The Area Model page draws multiplication as a plot of land →',
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
