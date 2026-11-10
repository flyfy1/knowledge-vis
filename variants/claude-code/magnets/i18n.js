'use strict';
// Magnets lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '磁铁 · 看不见的力，看得见的线',
    back: '← 知识索引',
    compare: '对照另一版本：磁铁 · 铁屑显出看不见的线 →',
    navLabel: '磁铁步骤导航',
    tagline: '一块磁铁隔着空气就能拉住铁钉、推开另一块磁铁。这股力从哪里来，往哪个方向？七步里你会先找出磁铁吸什么、哪里最有劲，再用铁屑和指南针把看不见的磁场画出来，最后试着把一块磁铁掰成「只有 N 极」的样子。',
    nav0: '0 吸什么', nav1: '1 哪里最强', nav2: '2 吸还是推', nav3: '3 铁屑显形', nav4: '4 指南针', nav5: '5 掰断磁铁', nav6: '6 收束',

    s0k: '第 0 步 · 先动手试',
    s0t: '磁铁会吸住哪些东西？是不是所有金属都行？',
    s0e: '这一步要回答：磁铁会吸住哪些东西？桌上有九样东西，其中六样是金属。点下面的按钮，把它们一样一样拿到磁铁旁边试。能被磁铁吸住的东西叫<strong>磁性材料</strong>，最常见的是铁和用铁炼成的钢，镍和钴也可以。先猜一猜：是不是只要是金属，磁铁都能吸住？',
    c0yes: '被磁铁吸住', c0no: '没被吸住',
    item_nail: '铁钉', item_clip: '钢回形针', item_nickel: '镍片', item_foil: '铝箔', item_copper: '铜线', item_gold: '金戒指', item_ruler: '塑料尺', item_wood: '木块', item_glass: '玻璃珠',
    tryAll: '剩下的全试一遍', reset0: '全部放回桌上',
    s0readout: '已试 {n}/{N} 样，被吸住 {s} 样。试过的金属有 {m} 样，其中 {mn} 样没被吸住。',
    s0verdictNone: '还没试过金属。',
    s0verdictAll: '到目前为止，试过的金属都被吸住了——再试试铝、铜和金。',
    s0verdictSome: '所以「是金属」不等于「会被磁铁吸」：磁铁吸的是铁、钢、镍这类磁性材料。',
    s0hint: '观察顺序：先试铁钉和回形针，再试铝箔、铜线和金戒指，最后试塑料、木头和玻璃。看每样东西是飞到磁铁上贴住，还是停在半路、落进右边的筐里。图中的东西都在磁铁正下方同样的距离被试。',

    s1k: '第 1 步 · 找最有劲的地方',
    s1t: '一根条形磁铁，哪里吸力最大？',
    s1e: '这一步要回答：同一根磁铁，不同位置的吸力一样吗？办法是在磁铁下方 0.5 厘米处挂一串回形针，看能挂住几枚：挂得越多，那里吸力越大。拖动「挂的位置」，或按「从左扫到右」。下图把每个试过的位置画成一个点，横轴和上面的磁铁对齐，纵轴是吸力（以最强的地方为 100）。吸力最强的两端叫<strong>磁极</strong>：一端叫 <strong>N 极</strong>（图中红色），另一端叫 <strong>S 极</strong>（蓝色）。',
    probeX: '挂的位置（厘米，0 = 正中）', sweep1: '从左扫到右', clear1: '清空记录',
    c1plot: '吸力（最强处 = 100）　横轴：位置（厘米）',
    s1readout: '位置 {x} 厘米：吸力 {p}，能挂住 {c} 枚回形针。整根磁铁上，正中的吸力只有两端的 {mid}%。',
    s1hint: '观察顺序：先放在正中（0），再一点点往一端挪，看回形针数什么时候开始增加，下图的点从哪里开始往上翘。回形针数按「每 12 点吸力挂 1 枚」折算，是示意；真实能挂几枚还和回形针的大小有关。',

    lgArrow: '每块磁铁受到的力', lgCurve: '当前摆法：力随距离变化', lgOther: '翻面后的那条曲线', lgFric: '摩擦力的大小（小于它就推不动）',
    lgN: 'N 极', lgS: 'S 极', lgFiling: '铁屑', lgLine: '磁感线（箭头：磁场方向）',
    lgNeedle: '指南针的红端 = 小磁针的 N 极', lgYou: '你拖动的那只指南针',
    s2k: '第 2 步 · 两块磁铁',
    s2t: '两块磁铁靠近，什么时候吸、什么时候推？',
    s2e: '这一步要回答：两块磁铁面对面时，互相吸还是互相推？离远一点，力怎么变？左边的磁铁固定不动，N 极朝右。按按钮把右边磁铁翻个面，再拖「两块之间的距离」。上图的绿色箭头是每块磁铁受到的力：指向对方是吸，背对对方是推；箭头越长，力越大。下图横轴是距离，纵轴是力：画在零线上方是推开，下方是吸引。按「松手」，看右边磁铁在有摩擦的桌面上会怎样滑。',
    faceS: '右边 S 极朝左', faceN: '右边 N 极朝左',
    gap2: '两块之间的距离（厘米）', release2: '松手', reset2: '放回原处',
    c2plot: '力（正 = 推开，负 = 吸引；1 厘米处的吸力 = 100）',
    pairNS: 'N 对 S（异极）', pairNN: 'N 对 N（同极）',
    kindPull: '互相吸引', kindPush: '互相推开',
    s2readout: '面对面的是 {pair}：{kind}。距离 {g} 厘米时，力的大小是 {f}（1 厘米时为 100）。{dbl}两块磁铁受到的力一样大、方向相反。',
    dbl2: '距离加倍到 {g2} 厘米，力只剩原来的 {r}%。',
    relSnap: '松手后：右边磁铁被吸过去，「啪」地贴在左边磁铁上。',
    relPushed: '松手后：右边磁铁被推开，滑到距离 {g} 厘米处停下（越远磁力越小，摩擦力把它停住）。',
    relStop: '松手后：右边磁铁滑到轨道尽头（距离 {g} 厘米）才停下。',
    relStay: '松手后：一动不动——这里磁力只有 {f}，比桌面的摩擦力 {fr} 小。',
    relRunning: '正在滑动……',
    s2hint: '观察顺序：先保持「S 极朝左」，把距离从 1 拖到 8，看箭头和下图的点一起变小；再翻面，看箭头调头、点跳到零线另一侧，但同样距离下长度一样。最后在不同距离按「松手」。摩擦力取 1 厘米处吸力的 5%，是示意值。',

    s3k: '第 3 步 · 把磁场画出来',
    s3t: '磁铁周围那片看不见的「力」长什么样？',
    s3e: '这一步要回答：磁铁周围看不见的力，能不能画出来？磁铁隔着空气也能吸铁、推磁铁，它周围这片有力的空间叫<strong>磁场</strong>。在磁铁上盖一张卡片，撒一层细铁屑：每粒铁屑靠近磁铁时都会变成一根小小的磁针，想顺着磁场的方向躺下。可卡片有摩擦，铁屑刚落下时还躺得乱七八糟，要轻轻敲几下卡片它们才转得过来。先按「撒铁屑」，再按「敲一敲卡片」。顺着铁屑排出的纹路画出的线叫<strong>磁感线</strong>：从 N 极出来，绕回 S 极，线越密的地方磁场越强。',
    lay1: '一块磁铁', lay2: '异极相对', lay3: '同极相对',
    sprinkle: '撒铁屑', tap: '敲一敲卡片', lines3: '显示磁感线', clear3: '擦掉铁屑',
    s3progress: '卡片上已撒 {k}/{N} 粒铁屑。{tap}',
    tapNo: '还没敲卡片：铁屑方向是乱的。', tapYes: '敲过了：铁屑都顺着磁场躺好。',
    s3noFilings: '卡片上还没有铁屑。',
    note1: '一块磁铁：线从 N 极出来，绕过磁铁两侧回到 S 极；两端附近线最密，铁屑也最多。',
    note2: '异极相对：从左边 N 极端面出发的线里，有 {c} 条直接钻进右边磁铁的 S 极——两块磁铁之间的线连在一起，所以它们互相吸。',
    note3: '同极相对：两块之间的线互相顶开、拐向上下，没有一条从一块连到另一块；正中间那一点的磁场正好为零，那里的铁屑没有方向可顺。',
    s3hint: '观察顺序：先用「一块磁铁」撒铁屑，敲一敲，看两端是不是最密；再换「异极相对」和「同极相对」比一比两块之间的纹路。换摆法会把卡片擦干净。铁屑图是按磁场算出来画的，不是照片。',

    s4k: '第 4 步 · 指南针',
    s4t: '指南针的针为什么总指着一个方向？',
    s4e: '这一步要回答：指南针为什么会指方向？指南针的针本身就是一根很轻、能自由转动的小磁铁，红色那端是它的 N 极。磁场有方向（磁感线上的箭头：从 N 极出来、回到 S 极），小磁针的 N 极总会转到顺着磁场的方向。在图上拖动指南针（或用下面两个滑杆），它会在去过的地方留下淡淡的足迹。再打开「地球的磁场」：地球本身就像一块巨大的磁铁，在我们这里它的磁场指向北方（图的上方）。地理北极附近其实是地球这块大磁铁的 S 极，所以它能把指南针的 N 端拉向北方。',
    cx: '左右位置（厘米）', cy: '上下位置（厘米）', earth: '地球的磁场', ring: '围一圈指南针', clear4: '擦掉足迹',
    north: '北 ↑',
    dir0: '上方（北）', dir1: '右上', dir2: '右', dir3: '右下', dir4: '下方（南）', dir5: '左下', dir6: '左', dir7: '左上',
    s4readout: '红色针尖指向{dir}（从正上方顺时针量 {deg}°）。{cmp}',
    cmpOff: '地球的磁场已关闭，只有磁铁在起作用。',
    cmpMag: '这里磁铁的磁场是地球磁场的 {k} 倍，主要听磁铁的。',
    cmpEarth: '这里磁铁的磁场只有地球磁场的 {k} 倍，主要听地球的，针接近指北。',
    cmpBoth: '这里磁铁的磁场是地球磁场的 {k} 倍，两边都在拉，针停在中间的方向上。',
    s4hint: '观察顺序：先关掉地球的磁场，把指南针绕着磁铁走一圈，看红端是不是一直顺着磁感线（离开 N 极、指向 S 极）。再打开地球的磁场，把指南针拖到角落：离磁铁越远，磁铁的磁场越弱，针就越接近指向上方。这里地球磁场的强度取一个示意值。',

    s5k: '第 5 步 · 掰断磁铁',
    s5t: '把磁铁掰成两半，能得到一块只有 N 极的磁铁吗？',
    s5e: '这一步要回答：N 极和 S 极能不能分开？选「掰成几段」，再拖「拉开的距离」。拉开以后，每一段都有自己的 N 极和 S 极，每段都是一块完整的小磁铁。贴在一起时，接缝两边一段的 N 极和下一段的 S 极挨在一起、正好<strong>抵消</strong>（一个往外指、一个往里指的作用一样大，加起来等于零），所以外面的磁感线和整块磁铁一模一样。',
    pieces5: '掰成几段', gap5: '拉开的距离（厘米）',
    s5readout: '{n} 段：N 极 {N} 个，S 极 {S} 个。{note}',
    s5join: '贴紧时，外面的磁场和整块磁铁相差 {d}%：接缝处的 N 和 S 正好抵消。',
    s5apart: '拉开 {g} 厘米：每条缝里都露出一对 N、S，磁感线在缝里从 N 极跳到对面的 S 极。',
    s5hint: '观察：段数越多，每段越短，可每段永远是一个 N 极配一个 S 极。到今天，科学家还没有找到过单独存在的 N 极或 S 极。',

    s6k: '第 6 步 · 收束',
    s6t: '用学到的本事认出一块藏起来的磁铁',
    s6q: '一块磁铁被纸盖住了，只露出两只指南针。看红色针尖，猜一猜：磁铁的 N 极在哪一边？',
    quizL: 'N 极在左边', quizR: 'N 极在右边', check: '检查', nextQ: '换一题',
    quizPick: '先选一个答案。',
    quizRight: '对了！红色针尖顺着磁场：磁场从 N 极出来，所以针尖背对 N 极那一头、指向 S 极那一头。',
    quizWrong: '再看看：红色针尖顺着磁场，磁场从 N 极出来、回到 S 极，所以针尖指向的那一头附近是 S 极。纸已经揭开了，对照一下。',
    s6fin: '回头看这一路。<strong>第 0 步</strong>：磁铁吸铁、钢、镍这些磁性材料，不吸铝、铜、金，也不吸塑料、木头和玻璃。<strong>第 1 步</strong>：两端的磁极吸力最大，正中几乎没有。<strong>第 2 步</strong>：同极相推、异极相吸，距离一拉开，力很快变小（距离加倍，力剩不到三分之一）。<strong>第 3 步</strong>：铁屑顺着磁场排队，画出从 N 极出来、回到 S 极的磁感线。<strong>第 4 步</strong>：指南针就是一根小磁针，顺着磁场指向；地球也是一块大磁铁。<strong>第 5 步</strong>：N 极和 S 极总是成对出现，掰不开。',
    boundary: '适用范围：本页把条形磁铁当作「端面上带着磁极」的简单模型来计算，磁极的作用随距离的平方减弱；真实磁铁在端面附近的磁场还要复杂些。吸力、力和磁场强度都用相对数值，回形针数、摩擦力和地球磁场的大小是示意值。铁屑和磁感线是按模型算出来画的，不是照片；磁感线是人画的线，空间里并没有真的「线」。',
    linksTitle: '接下来可以去',
    lk1: '→ 电磁感应第 0 步（高中）：把磁铁移近线圈，穿过线圈的磁场怎样变化',
    lk2: '→ 磁场对运动电荷的力第 0 步（高中）：磁场怎样把运动的带电粒子推向侧面',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《磁铁 · 铁屑显出看不见的线》的平行版本。'
  },
  en: {
    pageTitle: 'Magnets · An Invisible Pull, Lines You Can See',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Magnets · Iron Filings Reveal Unseen Lines →',
    navLabel: 'Magnets lesson steps',
    tagline: 'A magnet can hold a nail through thin air and shove another magnet away. Where does that pull come from, and which way does it point? In seven steps you will find out what magnets grab and where they are strongest, draw the invisible field with iron filings and a compass, and finally try to break a magnet into a piece that has only a north pole.',
    nav0: '0 What sticks', nav1: '1 Strongest spot', nav2: '2 Pull or push', nav3: '3 Iron filings', nav4: '4 Compass', nav5: '5 Break it', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Try it first',
    s0t: 'What does a magnet pick up? Does every metal stick?',
    s0e: 'This step asks: which things will a magnet hold? There are nine objects on the table, and six of them are metal. Press the buttons below to bring them to the magnet one at a time. Things a magnet can hold are called <strong>magnetic materials</strong>. The usual ones are iron and steel (which is mostly iron); nickel and cobalt work too. Make a guess before you start: will the magnet hold anything made of metal?',
    c0yes: 'Held by the magnet', c0no: 'Not held',
    item_nail: 'Iron nail', item_clip: 'Steel paper clip', item_nickel: 'Nickel strip', item_foil: 'Aluminium foil', item_copper: 'Copper wire', item_gold: 'Gold ring', item_ruler: 'Plastic ruler', item_wood: 'Wooden block', item_glass: 'Glass marble',
    tryAll: 'Try all the rest', reset0: 'Put everything back',
    s0readout: 'Tried {n}/{N} objects; {s} were held. Of the {m} metal objects tried, {mn} were not held.',
    s0verdictNone: 'No metal tried yet.',
    s0verdictAll: 'So far every metal tried has stuck. Now try the aluminium, copper and gold.',
    s0verdictSome: 'So being metal is not enough: a magnet holds magnetic materials such as iron, steel and nickel.',
    s0hint: 'What to watch: try the nail and the paper clip first, then the aluminium, copper and gold, and finally the plastic, wood and glass. Each object either flies up and sticks to the magnet, or stops halfway and drops into the box on the right. Every object is tried at the same distance below the magnet.',

    s1k: 'Step 1 · Find the strongest spot',
    s1t: 'Where along a bar magnet is the pull strongest?',
    s1e: 'This step asks: is the pull the same everywhere along one magnet? To test it, hang a chain of paper clips 0.5 cm below the magnet and count how many it holds. More clips means a stronger pull at that spot. Drag “Where to hang”, or press “Sweep left to right”. The lower chart adds a dot for every spot you try. Its horizontal axis lines up with the magnet above it, and its height is the pull, with the strongest spot scored as 100. The two strong ends are called <strong>poles</strong>: one is the <strong>north (N) pole</strong> (red here), the other the <strong>south (S) pole</strong> (blue).',
    probeX: 'Where to hang (cm, 0 = middle)', sweep1: 'Sweep left to right', clear1: 'Clear dots',
    c1plot: 'Pull (strongest = 100)   across: position (cm)',
    s1readout: 'At {x} cm: pull {p}, holding {c} paper clips. Along the whole magnet, the pull in the middle is only {mid}% of the pull at the ends.',
    s1hint: 'What to watch: start in the middle (0), then creep towards one end. Notice where the clip count starts to climb and where the dots in the chart turn upwards. Clips are counted as one per 12 points of pull, a teaching scale; how many a real magnet holds also depends on the size of the clips.',

    lgArrow: 'Force on each magnet', lgCurve: 'This layout: force against gap', lgOther: 'The curve after turning it round', lgFric: 'Friction (a smaller force cannot move it)',
    lgN: 'N pole', lgS: 'S pole', lgFiling: 'Iron filing', lgLine: 'Field line (arrow: field direction)',
    lgNeedle: 'Red end of the needle = its N pole', lgYou: 'The compass you are dragging',
    s2k: 'Step 2 · Two magnets',
    s2t: 'Bring two magnets together: when do they pull, and when do they push?',
    s2e: 'This step asks: when two magnets face each other, do they pull together or push apart, and what happens as they move further away? The left magnet is fixed with its N pole facing right. Use the buttons to turn the right magnet round, then drag “Gap between them”. In the top picture the green arrows show the force on each magnet: an arrow pointing at the other magnet means a pull, one pointing away means a push, and a longer arrow means a bigger force. In the chart below, the gap runs across and the force runs up: above the zero line the magnets push apart, below it they pull together. Press “Let go” to watch the right magnet slide on a table that has friction.',
    faceS: 'Right magnet: S end facing left', faceN: 'Right magnet: N end facing left',
    gap2: 'Gap between them (cm)', release2: 'Let go', reset2: 'Put it back',
    c2plot: 'Force (+ push apart, − pull together; pull at 1 cm = 100)',
    pairNS: 'N facing S (unlike poles)', pairNN: 'N facing N (like poles)',
    kindPull: 'they pull together', kindPush: 'they push apart',
    s2readout: '{pair}: {kind}. At a gap of {g} cm the force is {f} (100 at 1 cm). {dbl}Both magnets feel the same size of force, in opposite directions.',
    dbl2: 'Double the gap to {g2} cm and only {r}% of the force is left. ',
    relSnap: 'After letting go: the right magnet is pulled in and snaps against the left one.',
    relPushed: 'After letting go: the right magnet is pushed away and stops at a gap of {g} cm (the magnetic push fades with distance until friction wins).',
    relStop: 'After letting go: the right magnet slides all the way to the end of the track (a gap of {g} cm).',
    relStay: 'After letting go: nothing moves. The magnetic force here is only {f}, smaller than the table’s friction of {fr}.',
    relRunning: 'Sliding…',
    s2hint: 'What to watch: keep “S end facing left” and drag the gap from 1 to 8; the arrows and the dot in the chart shrink together. Then turn the magnet round: the arrows flip and the dot jumps to the other side of the zero line, but at the same gap the size is the same. Finally press “Let go” at different gaps. Friction is set to 5% of the pull at 1 cm, a teaching value.',

    s3k: 'Step 3 · Draw the field',
    s3t: 'What does the invisible “force zone” around a magnet look like?',
    s3e: 'This step asks: can the invisible force around a magnet be drawn? A magnet pulls iron and pushes other magnets across empty space. The region around it where these forces act is called its <strong>magnetic field</strong>. Lay a card over the magnet and sprinkle fine iron filings on it. Near the magnet each filing turns into a tiny compass needle that wants to lie along the field. Friction on the card keeps them jumbled at first, though; you have to tap the card gently before they can swing round. Press “Sprinkle filings”, then “Tap the card”. Lines drawn along the pattern the filings make are called <strong>magnetic field lines</strong>. They come out of the N pole and loop round into the S pole, and where they crowd together the field is stronger.',
    lay1: 'One magnet', lay2: 'Unlike poles facing', lay3: 'Like poles facing',
    sprinkle: 'Sprinkle filings', tap: 'Tap the card', lines3: 'Show field lines', clear3: 'Wipe the card',
    s3progress: '{k}/{N} filings on the card. {tap}',
    tapNo: 'Card not tapped yet: the filings point every which way.', tapYes: 'Card tapped: the filings now lie along the field.',
    s3noFilings: 'No filings on the card yet.',
    note1: 'One magnet: the lines leave the N pole and curl round both sides of the magnet into the S pole. They crowd most near the two ends, where the filings pile up too.',
    note2: 'Unlike poles facing: of the lines leaving the left magnet’s N end, {c} run straight into the right magnet’s S end. The lines join the two magnets up, which is why they pull together.',
    note3: 'Like poles facing: the lines between the magnets shove each other aside and bend up and down; not one runs from one magnet to the other. Right in the middle the field is exactly zero, so filings there have no direction to follow.',
    s3hint: 'What to watch: sprinkle with “One magnet”, tap, and check whether the ends are the most crowded. Then switch to “Unlike poles facing” and “Like poles facing” and compare the pattern in the gap. Changing the layout wipes the card. The filings are drawn from the computed field; this is not a photograph.',

    s4k: 'Step 4 · Compass',
    s4t: 'Why does a compass needle always point one particular way?',
    s4e: 'This step asks: why does a compass point in a direction at all? A compass needle is itself a very light little magnet that can spin freely; its red end is its N pole. A magnetic field has a direction (the arrows on the field lines run out of N and back into S), and the needle’s N end always swings round to point along it. Drag the compass around the picture (or use the two sliders); it leaves a faint footprint wherever it has been. Then switch on “Earth’s field”. The Earth behaves like a giant magnet, and where we are its field points north (the top of the picture). The Earth’s magnetic pole near the geographic North Pole is actually a south pole, which is why it pulls the compass’s N end northwards.',
    cx: 'Left–right (cm)', cy: 'Up–down (cm)', earth: 'Earth’s field', ring: 'Ring of compasses', clear4: 'Clear footprints',
    north: 'North ↑',
    dir0: 'up (north)', dir1: 'up and to the right', dir2: 'to the right', dir3: 'down and to the right', dir4: 'down (south)', dir5: 'down and to the left', dir6: 'to the left', dir7: 'up and to the left',
    s4readout: 'The red tip points {dir} ({deg}° clockwise from straight up). {cmp}',
    cmpOff: 'Earth’s field is switched off; only the magnet acts.',
    cmpMag: 'Here the magnet’s field is {k} times the Earth’s, so the magnet is in charge.',
    cmpEarth: 'Here the magnet’s field is only {k} times the Earth’s, so the Earth is in charge and the needle points almost north.',
    cmpBoth: 'Here the magnet’s field is {k} times the Earth’s. Both are pulling, and the needle settles somewhere in between.',
    s4hint: 'What to watch: switch Earth’s field off and walk the compass all the way round the magnet. Does the red end always follow the field lines, away from N and towards S? Then switch Earth’s field on and drag the compass into a corner. The further from the magnet, the weaker its field, and the closer the needle comes to pointing up. The Earth’s field strength here is a teaching value.',

    s5k: 'Step 5 · Break the magnet',
    s5t: 'Snap a magnet in half: do you get a magnet with only a north pole?',
    s5e: 'This step asks: can the N and S poles be separated? Choose “Number of pieces”, then drag “Pull apart”. Once they are apart, every piece has its own N pole and S pole; each one is a complete little magnet. While they are pressed together, the N pole of one piece sits against the S pole of the next and the two <strong>cancel</strong>: one acts outwards, the other inwards, by the same amount, so together they add up to zero. That is why the field lines outside look exactly like those of the unbroken magnet.',
    pieces5: 'Number of pieces', gap5: 'Pull apart (cm)',
    s5readout: '{n} pieces: {N} N poles and {S} S poles. {note}',
    s5join: 'Pressed together, the field outside differs from the whole magnet’s by {d}%: at each join an N and an S cancel exactly.',
    s5apart: 'Pulled {g} cm apart: every gap shows a new N and S pair, and field lines jump across the gap from N to S.',
    s5hint: 'What to watch: more pieces means shorter pieces, yet every piece always has one N pole and one S pole. To this day, nobody has ever found a north pole or a south pole on its own.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Use what you have learned to find a hidden magnet',
    s6q: 'A magnet is hidden under paper; only two compasses show. Read their red tips and decide: which side is the magnet’s N pole on?',
    quizL: 'N pole on the left', quizR: 'N pole on the right', check: 'Check', nextQ: 'New puzzle',
    quizPick: 'Pick an answer first.',
    quizRight: 'Right! The red tip follows the field, and the field comes out of the N pole. So the tip points away from the N end and towards the S end.',
    quizWrong: 'Look again: the red tip follows the field, which runs out of N and back into S. So the end the tip points towards is the S pole. The paper is off now; compare for yourself.',
    s6fin: 'Looking back. <strong>Step 0</strong>: magnets hold magnetic materials such as iron, steel and nickel, but not aluminium, copper or gold, and not plastic, wood or glass. <strong>Step 1</strong>: the pull is strongest at the two poles and almost nothing in the middle. <strong>Step 2</strong>: like poles push, unlike poles pull, and the force drops quickly as the gap grows (double the gap and less than a third is left). <strong>Step 3</strong>: iron filings line up along the field, tracing field lines that leave the N pole and return to the S pole. <strong>Step 4</strong>: a compass needle is a little magnet that turns to follow the field, and the Earth is a giant magnet. <strong>Step 5</strong>: N and S poles always come in pairs and cannot be pulled apart.',
    boundary: 'Scope: this page computes a bar magnet with a simple model in which the poles sit on its end faces and each pole’s effect weakens with the square of distance; close to the end faces a real magnet’s field is more complicated. Pull, force and field strength are relative numbers; the paper-clip count, the friction and the Earth’s field strength are teaching values. The filings and field lines are drawn from the model, not photographed, and field lines are lines people draw: there are no actual strings in space.',
    linksTitle: 'Where to go next',
    lk1: '→ Electromagnetic induction, step 0 (senior school): how the field through a coil changes as a magnet comes closer',
    lk2: '→ Magnetic force, step 0 (senior school): how a magnetic field pushes a moving charged particle sideways',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Magnets · Iron Filings Reveal Unseen Lines”.'
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
