'use strict';
// Perimeter vs area lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '周长和面积 · 绳子量一圈，地砖量里面',
    back: '← 知识索引',
    compare: '对照另一版本：周长 vs 面积 · 一根绳子两种账 →',
    navLabel: '周长与面积步骤导航',
    tagline: '周长是沿着边走一圈的长度，像围在外面的一根绳子；面积是里面铺了多少块地砖。这两个数常被当成一回事。七步里，你会亲手加砖看它们怎样各变各的，用一根 24 米的绳子找出围得最大的地，看懂正方形为什么赢，再反过来、再放大，把两本账彻底分开。',
    nav0: '0 加一块砖', nav1: '1 一根绳子', nav2: '2 正方形为什么赢', nav3: '3 反过来', nav4: '4 放大', nav5: '5 自测', nav6: '6 收束',

    s0k: '第 0 步 · 两本账',
    s0t: '往图形上加一块砖，周长和面积各变多少？',
    s0e: '这一步要回答：周长和面积是不是一起变大、一起变小？先把两个词说清楚。下面每个小方格边长 1 米。<strong>面积</strong>是图形里面铺了几块这样的方砖，单位是<strong>平方米</strong>（边长 1 米的正方形那么大）。<strong>周长</strong>是沿着图形的边走一圈的长度，单位是米：就像用一根绳子把图形紧紧围一圈，绳子的长度。图上橙色粗线就是这根绳子。点一个空格加一块砖，点一块砖把它拿掉。',
    presetLine: '一排 6 块', presetBlock: '2 × 3 一块', presetEll: 'L 形 6 块', presetRing: '中间空一格的框', clear0: '全部清空',
    c0title: '点格子加砖或拿砖（每格 1 米 × 1 米）',
    s0lgTile: '地砖（面积）', s0lgRope: '绳子（周长）', s0lgLast: '刚刚动过的那一格',
    s0readout: '面积 {A} 平方米（{A} 块砖）；周长 {P} 米。',
    s0add: '刚加的砖和 {s} 块旧砖挨着：面积 +1，周长 {dP}（新砖带来 4 条边，每挨着一块旧砖，就有 2 条边藏进里面，所以是 4 − 2 × {s}）。',
    s0del: '刚拿掉的砖原来和 {s} 块砖挨着：面积 −1，周长 {dP}（和加砖正好相反）。',
    s0holes: '图形中间有 {h} 格空洞：洞的四周也要算进周长，就像菜园里挖了个池塘，池塘边也要围一圈。',
    s0pieces: '现在分成了 {n} 块，各自绕一圈，周长是几圈加起来。',
    s0empty: '格子是空的：面积 0，周长 0。',
    logTitle: '最近几次的账（新的在前）：',
    logRow: '{op}：面积 {dA}，周长 {dP} → 面积 {A}，周长 {P}',
    opAdd: '加一块', opDel: '拿一块',
    s0hint: '观察顺序：先按「一排 6 块」和「2 × 3 一块」：都是 6 块砖，面积一样，周长却是 14 和 10。再自己点：贴着一块旧砖加，周长 +2；贴着两块加，周长不变；塞进一个三面都有砖的缺口，周长反而 −2。面积每次都只是 ±1。',

    s1k: '第 1 步 · 一根绳子',
    s1t: '一根 24 米的绳子围长方形菜园，怎么围面积最大？',
    s1e: '这一步要回答：周长固定不变时，面积会不会变？用一根 24 米的绳子围一块长方形菜园，长和宽都取整米。绕一圈要走两条长、两条宽，所以 2 × (长 + 宽) = 24，长 + 宽 = 12：长定了，宽就是 12 − 长。面积 = 长 × 宽。左图是菜园（每格 1 平方米），右图横轴是长（米），纵轴是面积（平方米），每试一种长就留下一个点。',
    lenSlider: '长（米）',
    c1a: '24 米绳子围出的菜园', c1b: '面积随长的变化（横轴：长，米）',
    s1lgRope: '绳子：周长始终 24 米', s1lgTile: '菜园里的地砖', s1lgDot: '试过的长', s1lgNow: '现在的长',
    s1readout: '长 {L} 米、宽 {W} 米：绳子 2 × ({L} + {W}) = {P} 米；面积 {L} × {W} = {A} 平方米。',
    s1best: '这是 6 × 6 的正方形，面积最大。',
    s1tried: '已试 {k}/11 种长：{list}',
    s1hint: '观察顺序：把长从 1 慢慢拖到 11。绳子读数一直是 24 米，面积却从 11 升到 36 再降回 11；右图的点连起来像一座山，山顶在长 = 6，也就是正方形。长 5 和长 7 面积一样（35），因为它们是同一块地横放和竖放。',

    s2k: '第 2 步 · 正方形为什么赢',
    s2t: '把正方形拉长一点，面积为什么一定变小？',
    s2e: '这一步要回答：周长 24 米时，为什么 6 × 6 的正方形面积最大？把正方形向右拉长 d 米、同时压矮 d 米（周长不变），得到 (6 + d) × (6 − d) 的长方形。和原来的正方形比：顶上少了一条（6 长、d 高），右边多了一条（d 宽、6 − d 高）。按「把多出的一条搬上去」，右边那条转一下，放到顶上缺掉的地方：它比缺口短了 d，剩下一个 d × d 的小方块补不上。所以长方形面积 = 36 − d × d，只要 d 不是 0 就比 36 小。',
    dSlider: '拉长多少 d（米）', move2: '把多出的一条搬上去', reset2: '放回原处',
    c2title: '正方形 6 × 6 与长方形 {L} × {W}',
    s2lgSq: '虚线：原来的 6 × 6 正方形', s2lgLost: '少掉的一条', s2lgGain: '多出的一条', s2lgCorner: '补不上的 d × d',
    s2readout: 'd = {d}：长方形 {L} × {W}。少掉 6 × {d} = {lost} 平方米，多出 {d} × {W} = {gained} 平方米，差 {corner} = {d} × {d}；面积 36 − {corner} = {A} 平方米。',
    s2zero: 'd = 0：就是正方形本身，面积 36 平方米，没有补不上的角。',
    s2moved: '多出的一条已经搬到顶上，红框里那个 {d} × {d} 的小方块就是补不上的部分。',
    s2hint: '观察顺序：先把 d 拖到 2，看顶上粉色的一条（少掉的）和右边绿色的一条（多出的）。按「把多出的一条搬上去」，绿色那条转身躺到顶上，右上角露出一个 2 × 2 的小方块。把 d 拖大，露出的小方块也跟着变大，面积就少得更多。',

    s3k: '第 3 步 · 反过来',
    s3t: '面积固定 24 平方米，围它的绳子一样长吗？',
    s3e: '这一步要回答：反过来，面积固定时，周长会不会变？24 块砖一块不剩地拼成长方形，只有 1 × 24、2 × 12、3 × 8、4 × 6 这几种（转个方向算同一种）。每一种都量一量要多长的绳子。按「换成 36 块」可以再看一种能拼成正方形的面积。',
    pairSlider: '选一种拼法', area36: '换成 36 块', area24: '换回 24 块',
    c3a: '面积 {A} 平方米的一种拼法', c3b: '每种拼法要的绳长（米）',
    s3lgTile: '地砖', s3lgRope: '绳子', s3lgBar: '试过的拼法的绳长',
    s3readout: '{L} × {W}：面积 {A} 平方米；绳子 2 × ({L} + {W}) = {P} 米。{note}',
    s3min: '这是最接近正方形的拼法，绳子最短。',
    s3max: '这是最细长的拼法，绳子最长。',
    s3hint: '观察顺序：从最细长的 1 × {A} 拖到最接近正方形的那一种。面积读数一直不变，绳长却一路变短；右图每种拼法留下一根绳长条，越接近正方形越短。换成 36 块后，最短的就是 6 × 6 的正方形。',

    s4k: '第 4 步 · 放大',
    s4t: '每条边都放大到 2 倍，周长和面积也都是 2 倍吗？',
    s4e: '这一步要回答：把一个图形按同样的比例放大，周长和面积各变成几倍？「放大到 k 倍」是说每条边都变成原来的 k 倍，形状不变：原来的每一块砖，都变成 k 行 k 列的一小块。绳子每一段都变长 k 倍，所以周长是 k 倍；可每块砖变成了 k × k 块，所以面积是 k × k 倍（<a class="xlink" href="../../../math/geometry/similarity-scaling/#step1">→ 相似与缩放页第 1 步：边长放大 k 倍，面积放大几倍</a>）。',
    kSlider: '放大到 k 倍', shapeRect: '长方形 3 × 2', shapeEll: 'L 形',
    c4title: '放大 {k} 倍（浅色虚线：原来的图形）',
    s4lgOrig: '原来的图形', s4lgBig: '放大后的图形', s4lgBlock: '原来一块砖变成的 k × k 小块',
    s4readout: '放大到 {k} 倍：周长 {P1} → {P} 米，是原来的 {pk} 倍；面积 {A1} → {A} 平方米，是原来的 {ak} 倍（{k} × {k}）。',
    thK: '放大倍数 k', thP: '周长（米）', thA: '面积（平方米）', thPk: '周长是原来的几倍', thAk: '面积是原来的几倍',
    tableCap: '你试过的放大倍数',
    s4hint: '观察顺序：把 k 从 1 拖到 4，看表格里两列「几倍」：周长那列是 1、2、3、4，面积那列是 1、4、9、16。再换成 L 形，结果一样：只要按同一比例放大，跟形状无关。',

    s5k: '第 5 步 · 自测',
    s5t: '分清「一圈」和「里面」了吗？',
    quizNote: '每题先选再看解析；选过后这题锁定，按「下一题」继续。',
    q1: '两个长方形的周长相等，它们的面积一定相等吗？',
    q1a: '一定相等', q1b: '不一定',
    q2: '用 20 米长的篱笆围一块长方形菜园（边长取整米），面积最大是多少平方米？',
    q3: '一个 3 × 5 的长方形，每条边都放大到 2 倍，面积变成多少平方米？',
    q1why: '不一定。1 × 5 和 3 × 3 的周长都是 12 米，面积却是 5 和 9 平方米。',
    q2why: '长 + 宽 = 10，越接近正方形越大：5 × 5 = 25 平方米。4 × 6 = 24 稍小；100 是把 10 × 10 当成了面积，可那样周长要 40 米。',
    q3why: '放大后是 6 × 10 = 60 平方米，是原来 15 的 4 倍（2 × 2），不是 2 倍。',
    qOk: '答对了。{why}', qNo: '还不对。{why}',
    qNext: '下一题', qRestart: '再做一遍', qProgress: '第 {i}/{n} 题 · 已答对 {k} 题',

    s6k: '第 6 步 · 收束', s6t: '一圈归周长，里面归面积',
    s6fin: '回头看：<strong>第 0 步</strong>，加一块砖，面积总是 +1，周长却可能 +4、+2、0、−2，两本账各记各的；<strong>第 1 步</strong>，绳子固定 24 米，面积从 11 到 36 都有，正方形最大；<strong>第 2 步</strong>，拉长 d 米，面积正好少 d × d；<strong>第 3 步</strong>，面积固定，越细长越费绳；<strong>第 4 步</strong>，边长放大 k 倍，周长 k 倍、面积 k × k 倍。',
    formula: '长方形周长 = 2 × (长 + 宽)\n长方形面积 = 长 × 宽\n(6 + d) × (6 − d) = 36 − d × d',
    boundary: '适用范围：本页的图形都由 1 米 × 1 米的方格拼成，长、宽取整米；「周长一定时正方形面积最大」是在长方形里比较（第 1、2 步的推理对不是整数的 d 也成立）。如果允许任意形状，同样长的绳子围成圆，面积还会更大。第 0 步有空洞时，洞的边也算在周长里。',
    linksTitle: '接着去哪儿',
    lk1: '→ 乘法面积模型页第 2 步：长方形面积切开再加，总数不变',
    lk2: '→ 反比例页第 0 步：面积固定为 12，长和宽此消彼长',
    lk3: '→ 相似与缩放页第 1 步：边长放大 k 倍，面积放大 k² 倍',
    lk4: '→ 勾股定理页第 1 步：正方形的面积就是边长的平方',
    unitM: '{v} 米',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《周长 vs 面积 · 一根绳子两种账》的平行版本。'
  },
  en: {
    pageTitle: 'Perimeter and Area · Rope Around the Edge, Tiles Inside',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Perimeter vs Area · One Rope, Two Ledgers →',
    navLabel: 'Perimeter and area steps',
    tagline: 'Perimeter is the distance once round the edge, like a rope pulled tight around a shape; area is how many floor tiles fit inside. People treat them as one number all the time. Over seven steps you will add tiles by hand and watch the two numbers go their own ways, find the biggest plot a 24-metre rope can fence, see exactly why the square wins, then run it backwards and scale it up until the two ledgers are firmly apart.',
    nav0: '0 Add a tile', nav1: '1 One rope', nav2: '2 Why the square wins', nav3: '3 Backwards', nav4: '4 Scale up', nav5: '5 Quiz', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Two ledgers',
    s0t: 'Add one tile to a shape: how much do the perimeter and the area change?',
    s0e: 'The question here: do perimeter and area always grow and shrink together? First, the two words. Every little square below is 1 metre on a side. <strong>Area</strong> is how many of these square tiles cover the shape, measured in <strong>square metres</strong> (the size of a square 1 metre on a side). <strong>Perimeter</strong> is the distance once round the edge of the shape, in metres: the length of a rope pulled snugly all the way round. The thick orange line is that rope. Tap an empty cell to add a tile, tap a tile to lift it.',
    presetLine: 'A row of 6', presetBlock: 'A 2 × 3 block', presetEll: 'An L of 6', presetRing: 'A frame with a hole', clear0: 'Clear everything',
    c0title: 'Tap cells to add or lift tiles (each 1 m × 1 m)',
    s0lgTile: 'tiles (area)', s0lgRope: 'rope (perimeter)', s0lgLast: 'the cell you just changed',
    s0readout: 'Area {A} square metres ({A} tiles); perimeter {P} metres.',
    s0add: 'The new tile touches {s} old ones: area +1, perimeter {dP} (a new tile brings 4 edges, and every old tile it touches tucks 2 edges inside, so 4 − 2 × {s}).',
    s0del: 'The tile you lifted touched {s} others: area −1, perimeter {dP} (exactly the reverse of adding it).',
    s0holes: 'There are {h} empty cells enclosed inside: the edges round the hole count towards the perimeter too, like fencing round a pond in the middle of a garden.',
    s0pieces: 'The shape is now in {n} separate pieces; each gets its own rope, and the perimeter is all the ropes together.',
    s0empty: 'The board is empty: area 0, perimeter 0.',
    logTitle: 'Your last few entries (newest first):',
    logRow: '{op}: area {dA}, perimeter {dP} → area {A}, perimeter {P}',
    opAdd: 'added a tile', opDel: 'lifted a tile',
    s0hint: 'What to try: press “A row of 6” and then “A 2 × 3 block”. Both use 6 tiles, so the area matches, yet the perimeters are 14 and 10. Then tap for yourself: a tile touching one old tile adds 2 to the perimeter; touching two adds nothing; tucked into a notch with tiles on three sides it actually takes 2 away. The area only ever moves by 1.',

    s1k: 'Step 1 · One rope',
    s1t: 'With a 24-metre rope round a rectangular garden, which shape holds the most?',
    s1e: 'The question here: if the perimeter stays fixed, can the area still change? Fence a rectangular garden with a 24-metre rope, using whole metres for both sides. Going round means two lengths and two widths, so 2 × (length + width) = 24 and length + width = 12: choose the length and the width is 12 − length. Area = length × width. The left picture is the garden (each cell 1 square metre); in the graph the horizontal axis is the length (metres) and the vertical axis is the area (square metres), and every length you try leaves a dot.',
    lenSlider: 'Length (metres)',
    c1a: 'The garden a 24 m rope fences', c1b: 'Area as the length changes (metres across)',
    s1lgRope: 'rope: always 24 m round', s1lgTile: 'tiles in the garden', s1lgDot: 'lengths tried', s1lgNow: 'current length',
    s1readout: 'Length {L} m, width {W} m: rope 2 × ({L} + {W}) = {P} m; area {L} × {W} = {A} square metres.',
    s1best: 'This is the 6 × 6 square — the largest area.',
    s1tried: 'Lengths tried: {k}/11 — {list}',
    s1hint: 'What to try: drag the length slowly from 1 to 11. The rope reading stays at 24 m, but the area climbs from 11 up to 36 and back down to 11; the dots in the graph trace a hill whose top is at length 6, the square. Lengths 5 and 7 give the same area (35) because they are the same plot turned sideways.',

    s2k: 'Step 2 · Why the square wins',
    s2t: 'Stretch the square a little: why must the area shrink?',
    s2e: 'The question here: with a 24-metre perimeter, why does the 6 × 6 square hold the most? Stretch the square d metres to the right and squash it d metres lower (the perimeter stays the same) to get a (6 + d) × (6 − d) rectangle. Compared with the square, a strip 6 long and d high is lost from the top, and a strip d wide and 6 − d high is gained on the right. Press “Move the extra strip up”: the right-hand strip turns and lies down in the gap at the top. It is d too short, leaving a d × d corner it cannot fill. So the rectangle’s area is 36 − d × d, which is less than 36 whenever d is not 0.',
    dSlider: 'Stretch by d (metres)', move2: 'Move the extra strip up', reset2: 'Put it back',
    c2title: 'The 6 × 6 square and the {L} × {W} rectangle',
    s2lgSq: 'dashed: the original 6 × 6 square', s2lgLost: 'strip lost', s2lgGain: 'strip gained', s2lgCorner: 'the d × d corner left unfilled',
    s2readout: 'd = {d}: a {L} × {W} rectangle. Lost 6 × {d} = {lost} square metres, gained {d} × {W} = {gained}, a shortfall of {corner} = {d} × {d}; area 36 − {corner} = {A} square metres.',
    s2zero: 'd = 0: this is the square itself, area 36 square metres, with no corner left over.',
    s2moved: 'The extra strip now lies along the top; the {d} × {d} square outlined in red is the part it cannot cover.',
    s2hint: 'What to try: drag d to 2 and look at the pink strip along the top (lost) and the green strip on the right (gained). Press “Move the extra strip up”: the green strip swings round onto the top, and a 2 × 2 square shows through in the top-right corner. Drag d larger and that exposed square grows, so the area drops further.',

    s3k: 'Step 3 · Backwards',
    s3t: 'Fix the area at 24 square metres: does every shape need the same rope?',
    s3e: 'The question here: the other way round — if the area is fixed, can the perimeter still change? 24 tiles with none left over make only these rectangles: 1 × 24, 2 × 12, 3 × 8 and 4 × 6 (turning one on its side does not count as new). Measure the rope each one needs. Press “Switch to 36 tiles” to look at an area that can also make a square.',
    pairSlider: 'Choose a layout', area36: 'Switch to 36 tiles', area24: 'Back to 24 tiles',
    c3a: 'One layout with area {A} square metres', c3b: 'Rope each layout needs (metres)',
    s3lgTile: 'tiles', s3lgRope: 'rope', s3lgBar: 'rope for each layout tried',
    s3readout: '{L} × {W}: area {A} square metres; rope 2 × ({L} + {W}) = {P} m. {note}',
    s3min: 'This is the layout closest to a square, so it needs the shortest rope.',
    s3max: 'This is the longest, thinnest layout, so it needs the longest rope.',
    s3hint: 'What to try: drag from the thin 1 × {A} layout to the one closest to a square. The area reading never changes, but the rope keeps getting shorter; each layout leaves a bar in the chart, and the closer to a square, the shorter the bar. With 36 tiles, the shortest is the 6 × 6 square.',

    s4k: 'Step 4 · Scale up',
    s4t: 'Make every side twice as long: do the perimeter and area both double?',
    s4e: 'The question here: blow a shape up by the same factor everywhere — how many times bigger are its perimeter and its area? “Scale by k” means every side becomes k times as long while the shape stays the same: each old tile turns into a little block of k rows and k columns. Every stretch of rope is k times longer, so the perimeter is k times as big; but every tile has become k × k tiles, so the area is k × k times as big (<a class="xlink" href="../../../math/geometry/similarity-scaling/#step1">→ Similarity and scaling, step 1: scale the sides by k and the area by how much?</a>).',
    kSlider: 'Scale factor k', shapeRect: '3 × 2 rectangle', shapeEll: 'L shape',
    c4title: 'Scaled by {k} (faint dashed: the original)',
    s4lgOrig: 'original shape', s4lgBig: 'scaled shape', s4lgBlock: 'one old tile, now a k × k block',
    s4readout: 'Scaled by {k}: perimeter {P1} → {P} m, {pk} times the original; area {A1} → {A} square metres, {ak} times the original ({k} × {k}).',
    thK: 'scale k', thP: 'perimeter (m)', thA: 'area (m²)', thPk: 'perimeter × ?', thAk: 'area × ?',
    tableCap: 'The scale factors you have tried',
    s4hint: 'What to try: drag k from 1 to 4 and read the two “× ?” columns: the perimeter goes 1, 2, 3, 4, the area 1, 4, 9, 16. Switch to the L shape and the pattern is identical — for any shape scaled evenly, it does not matter what the shape is.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Can you keep “round the edge” and “inside” apart?',
    quizNote: 'Choose first, then read the explanation. Once you choose, the question locks; press “Next question” to go on.',
    q1: 'Two rectangles have the same perimeter. Must they have the same area?',
    q1a: 'Yes, always', q1b: 'Not necessarily',
    q2: 'You fence a rectangular garden with 20 metres of fencing (whole-metre sides). What is the largest area you can get, in square metres?',
    q3: 'A 3 × 5 rectangle has every side scaled to twice its length. What is its new area in square metres?',
    q1why: 'Not necessarily. A 1 × 5 and a 3 × 3 rectangle both have perimeter 12 m, but their areas are 5 and 9 square metres.',
    q2why: 'Length + width = 10, and the closer to a square the bigger: 5 × 5 = 25 square metres. 4 × 6 = 24 is just short; 100 treats 10 × 10 as the garden, which would need 40 m of fencing.',
    q3why: 'Scaled up it is 6 × 10 = 60 square metres: 4 times the original 15 (2 × 2), not twice.',
    qOk: 'Correct. {why}', qNo: 'Not yet. {why}',
    qNext: 'Next question', qRestart: 'Start again', qProgress: 'Question {i}/{n} · {k} correct so far',

    s6k: 'Step 6 · Wrap-up', s6t: 'Round the edge is perimeter; inside is area',
    s6fin: 'Looking back: <strong>step 0</strong> — add a tile and the area always goes up by 1, but the perimeter can go +4, +2, 0 or −2; the two ledgers keep separate books. <strong>Step 1</strong> — with the rope fixed at 24 m, areas run anywhere from 11 to 36, and the square is largest. <strong>Step 2</strong> — stretch it by d and you lose exactly d × d. <strong>Step 3</strong> — with the area fixed, the thinner the shape, the more rope it takes. <strong>Step 4</strong> — scale the sides by k and the perimeter grows k times, the area k × k times.',
    formula: 'rectangle perimeter = 2 × (length + width)\nrectangle area = length × width\n(6 + d) × (6 − d) = 36 − d × d',
    boundary: 'Where it holds: the shapes here are built from 1 m × 1 m squares with whole-metre sides, and “the square holds the most for a fixed perimeter” compares rectangles only (the reasoning in steps 1 and 2 works for d that is not a whole number too). Allow any shape at all and a circle made from the same rope encloses even more. In step 0, when there is a hole, its edges count towards the perimeter.',
    linksTitle: 'Where to next',
    lk1: '→ Multiplication as area, step 2: cut a rectangle in two and the pieces add back up',
    lk2: '→ Inverse proportion, step 0: area fixed at 12, so length and width trade off',
    lk3: '→ Similarity and scaling, step 1: scale the sides by k and the area by k²',
    lk4: '→ The Pythagorean theorem, step 1: a square’s area is its side squared',
    unitM: '{v} m',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Perimeter vs Area · One Rope, Two Ledgers”.'
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
