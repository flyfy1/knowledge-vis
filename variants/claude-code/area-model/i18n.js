'use strict';
// Area-model multiplication lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '乘法是面积 · 一块地的几种数法',
    back: '← 知识索引',
    compare: '对照另一版本：乘法是面积 · 点阵铺成一块地 →',
    navLabel: '乘法面积模型步骤导航',
    tagline: '乘法的得数到底在数什么？把东西排成整整齐齐的行和列，它就是一块长方形地上的地砖数。七步里，你会用这块地看出乘法为什么比一个一个数快、为什么 4 × 6 = 6 × 4、两位数乘法怎样拆成四块，最后反过来：同样多的砖，能铺成几种长方形。',
    nav0: '0 一行一行数', nav1: '1 铺成地砖', nav2: '2 切一刀', nav3: '3 切成四块', nav4: '4 反着铺', nav5: '5 自测', nav6: '6 收束',

    s0k: '第 0 步 · 数得更快',
    s0t: '排成行和列的东西，有没有比一个一个数更快的办法？',
    s0e: '这一步要回答：鸡蛋装在盒子里，排成 r 行、每行 c 个，一共有几个？可以一个一个地数，也可以一行一行地加：每加一行，就加上 c 个。几个同样的数连着相加，就是<strong>乘法</strong>：r 行、每行 c 个，一共 r × c 个。前提是<strong>每一行一样多</strong>，下面的按钮可以故意让最后一行少放一个，看看会怎样。',
    rowsSlider: '行数 r', perRowSlider: '每行个数 c',
    count1: '一个一个数', countRow: '一行一行加', uneven: '最后一行少放一个',
    c0title: '每个圆点是一个鸡蛋',
    s0lgDot: '还没数到', s0lgDone: '已经数过', s0lgSum: '行尾数字：加到这一行的累计',
    s0prog1: '一个一个数：已数 {k}/{N} 个。', s0progR: '一行一行加：已加 {k}/{r} 行。',
    s0readout: '{prog}{r} 行，每行 {c} 个：一个一个数要数 {N} 次，一行一行加只要加 {r} 次（{list}）。{r} × {c} = {N}。',
    s0uneven: '{prog}最后一行只有 {c1} 个，实际一共 {N} 个；{r} × {c} = {P} 比实际多 1。每行不一样多时，不能直接用乘法。',
    s0hint: '观察顺序：先按「一个一个数」，看圆点一个个变亮，进度要走完 {N} 次；再按「一行一行加」，每次亮一整行，行尾写出累计，几次就到。把行数、每行个数换大一些再比一次。最后打开「最后一行少放一个」，看乘法的结果和实际数出来的差在哪。',

    s1k: '第 1 步 · 点阵变地砖',
    s1t: '把圆点换成方砖，乘法的得数变成了什么？',
    s1e: '这一步要回答：把每个圆点换成一块边长为 1 的小方砖（<strong>单位正方形</strong>），一行一行铺满，得到一块长方形的地。地有多大，就看用了几块砖：一块图形里能铺下几个单位正方形，就叫它的<strong>面积</strong>。长 a、宽 b 的长方形，每行 a 块、共 b 行，面积 = a × b。再按「转 90°」，整块地转过来，原来的「每行 a 块、共 b 行」变成「每行 b 块、共 a 行」：砖一块没动，所以 a × b = b × a，这叫乘法的<strong>交换律</strong>（两个数相乘，交换位置，积不变）。',
    lenSlider: '长 a（每行几块）', widSlider: '宽 b（共几行）',
    showTiles: '圆点 → 方砖', showDots: '方砖 → 圆点', rotate: '转 90°',
    c1title: '一块长方形地（每格是一个单位正方形）',
    s1lgTile: '单位正方形（边长 1）', s1lgRow: '一排 a 块（长边）', s1lgCol: '一排 b 块（宽边）',
    s1readout: '长 {a}、宽 {b}：每行 {a} 块，共 {b} 行，面积 = {a} × {b} = {N} 个单位正方形。按列读：每列 {b} 块，共 {a} 列，{b} × {a} = {N}。',
    s1turned: '现在地是竖着放的：每行 {b} 块，共 {a} 行，还是 {N} 块。',
    s1hint: '观察顺序：先看橙色的一排（{a} 块，是一行）和绿色的一排（{b} 块，是一列），面积就是「一行几块 × 有几行」。按「转 90°」，看橙色那一排转成竖的、绿色那一排变成一行：同一块地，读法从 {a} × {b} 变成 {b} × {a}，得数不变。「圆点 → 方砖」只改变画法，不改变数量。',

    s2k: '第 2 步 · 切一刀',
    s2t: '7 × 13 不好直接算，能不能切成两块好算的？',
    s2e: '这一步要回答：一块 7 行、13 列的地，面积 7 × 13 不在九九表里，怎么算？在第 k 列后面竖着切一刀，地变成两块：左块 7 × k，右块 7 × (13 − k)。砖一块没多、一块没少，所以两块加起来一定还是整块。这就是乘法的<strong>分配律</strong>：7 × 13 = 7 × k + 7 × (13 − k)，切在哪都对。切在 10 最省力，因为乘 10 只要在后面添个 0（<a class="xlink" href="../../../math/arithmetic/place-value/#step5">→ 数位页第 5 步：乘 10，数字整体往左移一位</a>）。',
    rows2: '行数', cols2: '列数', cut2: '切在第几列后面',
    c2a: '切成两块的地', c2b: '每个试过的切法：两块面积叠起来',
    s2lgL: '左块', s2lgR: '右块', s2lgCut: '切线',
    s2readout: '切在第 {k} 列后：左块 {r} × {k} = {L}，右块 {r} × {k2} = {R}，合起来 {L} + {R} = {T}，正好是 {r} × {c} = {T}。{note}',
    s2ten: '切在 10：左块乘 10 只要添个 0，右块是一位数乘法，最好算。',
    s2hint: '观察顺序：拖「切在第几列后面」，看切线左右移动：左块变大时右块变小。右边（窄屏在下面）的柱子每种切法记一根：橙色是左块、绿色是右块，所有柱子一样高，因为总面积不变。改行数或列数会换一块地，并清掉柱子。',

    s3k: '第 3 步 · 两刀四块',
    s3t: '两个两位数相乘，比如 12 × 13，怎样拆成会算的？',
    s3e: '这一步要回答：两个数都超过 10 时，怎么用九九表和「乘 10」算出来？把两个数都按十位和个位拆开：12 = 10 + 2，13 = 10 + 3。地的竖边是 12，横边是 13，在两边的「10」处各切一刀，地变成四块：10 × 10、10 × 3、2 × 10、2 × 3。每一块都好算，四块加起来就是整块。我们平常写的<strong>竖式</strong>（把两个数上下对齐，一位一位乘）也是在算这四块：第一行先乘个位，算的是右边两块；第二行再乘十位，算的是左边两块。',
    mSlider: '竖边（第一个数）', nSlider: '横边（第二个数）', light3: '一块一块点亮', all3: '全部点亮',
    c3title: '{m} × {n} 的地，在十位处各切一刀',
    s3lgTT: '十 × 十', s3lgTO: '十 × 个', s3lgOT: '个 × 十', s3lgOO: '个 × 个',
    s3prog: '已点亮 {k}/4 块。',
    s3readout: '{prog}{m} × {n} = ({mt} + {mo}) × ({nt} + {no})：{parts} = {sum}。',
    s3readoutAll: '{m} × {n} = ({mt} + {mo}) × ({nt} + {no}) = {parts} = {sum}，和 {m} × {n} = {prod} 一致。',
    vertCap: '竖式里的两行，分别是哪几块：',
    vertL1: '← {m} × {no}：右边两块（{a} + {b}）',
    vertL2: '← {m} × {nt}：左边两块（{a} + {b}）；竖式里常省掉末尾的 0',
    vertSum: '← 两行相加 = 四块之和',
    s3hint: '观察顺序：先按「一块一块点亮」，四块依次亮起，读数一项一项加上去（进度 k/4）。再看下面的竖式：每一行旁边写着它对应哪两块地。最后换两个数，比如 23 × 15，四块变成 200、100、30、15。个位是 0 时（如 20），那一条宽度为 0，只剩两块。',

    s4k: '第 4 步 · 反过来铺',
    s4t: '同样多的砖，能铺成几种不同的长方形？',
    s4e: '这一步要回答：手里有 N 块砖，想铺成一块整整齐齐的长方形地（每列一样多，一块不剩），宽可以选几？把砖一列一列地摆，每列 w 块。如果最后一列正好摆满，就得到一块 w 行的长方形，另一边是 N ÷ w；如果最后一列摆不满（剩下的就是除法里的余数，<a class="xlink" href="../../../math/arithmetic/division-remainder/#step0">→ 除法与余数页第 0 步：分不完的那一点</a>），这个宽就不行。能正好铺满时，w 和 N ÷ w 都叫 N 的<strong>因数</strong>：能把 N 正好分成整份的数。一对能配成长方形的因数，叫一个<strong>因数对</strong>。',
    nTiles: '砖的总数 N', wTry: '每列放几块 w',
    c4title: 'N 块砖，每列 w 块',
    s4lgFull: '摆满的列', s4lgPart: '没摆满的最后一列', s4lgGap: '虚线：还差的空位',
    s4exact: '{N} ÷ {w} = {q}，正好摆满：{w} × {q} 的长方形，{w} 和 {q} 都是 {N} 的因数。',
    s4left: '{N} ÷ {w} = {q} 余 {r}：摆满 {q} 列，最后一列只有 {r} 块，还差 {miss} 块。{w} 不是 {N} 的因数。',
    s4found: '已找到 {k}/{n} 个因数对：{list}',
    s4prime: '{N} 只有 1 × {N} 这一种铺法：除了 1 和它自己，没有别的因数，这样的数叫<strong>质数</strong>。',
    s4hint: '观察顺序：保持 N = 24，把 w 从 1 一格一格拖到 12，看最后一列满不满；每找到一种铺法，下面就记一对因数。w 换成 8 和换成 3，铺出的是同一个长方形转了个方向，只算一对。再把 N 换成 13 或 36 试试（换 N 会清掉已找到的）。',
    none: '还没有',

    s5k: '第 5 步 · 自测',
    s5t: '这些面积的算法，你能用上吗？',
    quizNote: '每题先选再看解析；选过后这题锁定，按「下一题」继续。',
    q1: '14 × 6 切一刀来算，下面哪个和它相等？',
    q2: '23 × 15 在十位处各切一刀，四块的面积是？',
    q3: '36 块砖，一块不剩，能铺成几种不同的长方形？（转个方向算同一种）',
    q1why: '把 14 切成 10 和 4：10 × 6 + 4 × 6 = 60 + 24 = 84 = 14 × 6。只加一个 4 是少算了右块的 5 行；14 + 6 是加法，不是面积。',
    q2why: '23 = 20 + 3，15 = 10 + 5：20 × 10 = 200，20 × 5 = 100，3 × 10 = 30，3 × 5 = 15，合计 345 = 23 × 15。',
    q3why: '36 的因数对是 1 × 36、2 × 18、3 × 12、4 × 9、6 × 6，一共 5 种。',
    qOk: '答对了。{why}', qNo: '还不对。{why}',
    qNext: '下一题', qRestart: '再做一遍', qProgress: '第 {i}/{n} 题 · 已答对 {k} 题',

    s6k: '第 6 步 · 收束', s6t: '乘法就是数一块长方形地上的砖',
    s6fin: '回头看：<strong>第 0 步</strong>，排成每行一样多的行和列，乘法就是「一行一行加」的捷径；<strong>第 1 步</strong>，把点换成单位正方形，乘积就是长方形的面积，转 90° 看出 a × b = b × a；<strong>第 2 步</strong>，切一刀分成两块，两块面积之和不变，这就是分配律；<strong>第 3 步</strong>，在十位处切两刀，两位数乘法变成四块好算的面积，竖式的每一行对应其中两块；<strong>第 4 步</strong>，反过来用同样多的砖铺长方形，能铺满的边长就是因数。',
    formula: 'a × b = b × a\na × (b + c) = a × b + a × c\n12 × 13 = 10×10 + 10×3 + 2×10 + 2×3',
    boundary: '适用范围：本页的乘法都是整数，地砖是边长为 1 的单位正方形，面积单位就是「块」。行和列的模型要求每一行一样多（第 0 步）；分配律、交换律对所有数都成立，本页只演示了整数。第 4 步只看整齐的长方形：形状不规则的铺法不算。',
    linksTitle: '接着去哪儿',
    lk1: '→ 数位页第 2 步：同一个 3 放在十位，为什么就是 30',
    lk2: '→ 周长与面积页第 1 步：周长一样，面积可以差很多',
    lk3: '→ 反比例页第 0 步：面积固定为 12 的长方形，长和宽怎么变',
    lk4: '→ 勾股定理页第 1 步：正方形的面积就是边长的平方',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《乘法是面积 · 点阵铺成一块地》的平行版本。'
  },
  en: {
    pageTitle: 'Multiplication as Area · One Floor, Many Ways to Count',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Multiplication Is Area · Arrays Become a Tiled Floor →',
    navLabel: 'Area model steps',
    tagline: 'What is a product actually counting? Arrange things in neat rows and columns and it becomes the number of tiles on a rectangular floor. Over seven steps you will use that floor to see why multiplying beats counting one by one, why 4 × 6 = 6 × 4, how a two-digit product splits into four easy blocks — and, running it backwards, how many rectangles the same pile of tiles can make.',
    nav0: '0 Row by row', nav1: '1 Tiles', nav2: '2 One cut', nav3: '3 Four blocks', nav4: '4 Backwards', nav5: '5 Quiz', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Counting faster',
    s0t: 'Things in rows and columns: is there a faster way than counting one at a time?',
    s0e: 'The question here: eggs sit in a tray in r rows of c each. How many are there? You can count them one by one, or add a row at a time — each row adds another c. Adding the same number again and again is <strong>multiplication</strong>: r rows of c make r × c. The catch is that <strong>every row must hold the same number</strong>; the button below deliberately leaves one egg out of the last row so you can see what goes wrong.',
    rowsSlider: 'Rows r', perRowSlider: 'Eggs per row c',
    count1: 'Count one by one', countRow: 'Add row by row', uneven: 'Last row one short',
    c0title: 'Each dot is one egg',
    s0lgDot: 'not counted yet', s0lgDone: 'counted', s0lgSum: 'number at the row end: running total so far',
    s0prog1: 'One by one: counted {k}/{N}. ', s0progR: 'Row by row: added {k}/{r} rows. ',
    s0readout: '{prog}{r} rows of {c}: one by one takes {N} counts, row by row only {r} additions ({list}). {r} × {c} = {N}.',
    s0uneven: '{prog}The last row holds only {c1}, so there are really {N}; {r} × {c} = {P} is one too many. When rows differ, you cannot just multiply.',
    s0hint: 'What to try: press “Count one by one” and watch the dots light up singly — {N} counts in all. Then press “Add row by row”: a whole row lights at once and its running total appears at the row end, done in a few additions. Make the tray bigger and race them again. Finally switch on “Last row one short” and see where the product and the real count part ways.',

    s1k: 'Step 1 · Dots become tiles',
    s1t: 'Swap the dots for square tiles: what is the product counting now?',
    s1e: 'The question here: replace every dot with a square tile of side 1 (a <strong>unit square</strong>) and lay them row by row into a rectangular floor. How big is the floor? Count the tiles: the number of unit squares that fit inside a shape is its <strong>area</strong>. A rectangle a long and b wide has a tiles in each of b rows, so its area is a × b. Now press “Turn 90°”: the floor swings round and “b rows of a” becomes “a rows of b”. Not a single tile moved, so a × b = b × a — the <strong>commutative law</strong> (swap the two numbers and the product stays the same).',
    lenSlider: 'Length a (tiles per row)', widSlider: 'Width b (number of rows)',
    showTiles: 'Dots → tiles', showDots: 'Tiles → dots', rotate: 'Turn 90°',
    c1title: 'A rectangular floor (each cell is one unit square)',
    s1lgTile: 'unit square (side 1)', s1lgRow: 'a strip of a tiles (the length)', s1lgCol: 'a strip of b tiles (the width)',
    s1readout: 'Length {a}, width {b}: {a} tiles per row, {b} rows, area = {a} × {b} = {N} unit squares. Read by columns: {b} per column, {a} columns, {b} × {a} = {N}.',
    s1turned: 'The floor is now standing on end: {b} tiles per row, {a} rows, still {N} tiles.',
    s1hint: 'What to try: look at the orange strip ({a} tiles, a row) and the green strip ({b} tiles, a column); the area is “tiles per row × number of rows”. Press “Turn 90°” and watch the orange strip stand upright while the green one lies down as a row: the same floor, read as {b} × {a} instead of {a} × {b}, gives the same number. “Dots → tiles” changes only the drawing, never the count.',

    s2k: 'Step 2 · One cut',
    s2t: '7 × 13 is not in the times table. Can you cut it into two easy pieces?',
    s2e: 'The question here: a floor 7 rows by 13 columns has area 7 × 13, which no times table lists. How do you work it out? Cut straight down after column k and the floor becomes two blocks: 7 × k on the left and 7 × (13 − k) on the right. No tile was added or lost, so the two blocks must add back up to the whole. This is the <strong>distributive law</strong>: 7 × 13 = 7 × k + 7 × (13 − k), wherever you cut. Cutting at 10 is the easy choice, because multiplying by 10 just puts a 0 on the end (<a class="xlink" href="../../../math/arithmetic/place-value/#step5">→ Place value, step 5: times 10 shifts every digit one place left</a>).',
    rows2: 'Rows', cols2: 'Columns', cut2: 'Cut after column',
    c2a: 'The floor, cut into two blocks', c2b: 'Every cut you tried: both blocks stacked',
    s2lgL: 'left block', s2lgR: 'right block', s2lgCut: 'cut line',
    s2readout: 'Cut after column {k}: left {r} × {k} = {L}, right {r} × {k2} = {R}, together {L} + {R} = {T}, exactly {r} × {c} = {T}. {note}',
    s2ten: 'Cutting at 10: the left block is just “add a 0” and the right block is a one-digit product — the easiest split.',
    s2hint: 'What to try: drag “Cut after column” and watch the line slide: as the left block grows the right one shrinks. The bars on the right (below on narrow screens) record one bar per cut, orange for the left block and green for the right; every bar is the same height because the total never changes. Changing the rows or columns starts a new floor and clears the bars.',

    s3k: 'Step 3 · Two cuts, four blocks',
    s3t: 'How do you break a two-digit product like 12 × 13 into pieces you can do?',
    s3e: 'The question here: when both numbers are past 10, how do the times tables and “times 10” get you there? Split each number into tens and ones: 12 = 10 + 2 and 13 = 10 + 3. Make the floor 12 down and 13 across and cut both sides at the 10: you get four blocks, 10 × 10, 10 × 3, 2 × 10 and 2 × 3. Each one is easy, and together they make the whole floor. The <strong>column method</strong> you write on paper (numbers stacked, multiplied digit by digit) is computing these same four blocks: the first line multiplies by the ones digit — the two right-hand blocks; the second line multiplies by the tens — the two left-hand blocks.',
    mSlider: 'Down the side (first number)', nSlider: 'Across the top (second number)', light3: 'Light the blocks one by one', all3: 'Light them all',
    c3title: 'A {m} × {n} floor, cut at the tens on both sides',
    s3lgTT: 'tens × tens', s3lgTO: 'tens × ones', s3lgOT: 'ones × tens', s3lgOO: 'ones × ones',
    s3prog: 'Lit {k}/4 blocks. ',
    s3readout: '{prog}{m} × {n} = ({mt} + {mo}) × ({nt} + {no}): {parts} = {sum}.',
    s3readoutAll: '{m} × {n} = ({mt} + {mo}) × ({nt} + {no}) = {parts} = {sum}, matching {m} × {n} = {prod}.',
    vertCap: 'Which blocks each line of the column method computes:',
    vertL1: '← {m} × {no}: the two right-hand blocks ({a} + {b})',
    vertL2: '← {m} × {nt}: the two left-hand blocks ({a} + {b}); the trailing 0 is often left off',
    vertSum: '← add the lines = the four blocks together',
    s3hint: 'What to try: press “Light the blocks one by one” and watch the four blocks come on in turn while the readout adds each term (progress k/4). Then read the column method below: each line is labelled with the two blocks it covers. Finally try other numbers, such as 23 × 15, where the blocks are 200, 100, 30 and 15. When a ones digit is 0 (as in 20) that strip has no width and only two blocks remain.',

    s4k: 'Step 4 · Run it backwards',
    s4t: 'How many different rectangles can the same number of tiles make?',
    s4e: 'The question here: you have N tiles and want a neat rectangular floor (every column the same, none left over). Which widths work? Lay the tiles in columns of w. If the last column comes out full, you have a rectangle w tall and N ÷ w long. If it does not (what is left over is the remainder of the division, <a class="xlink" href="../../../math/arithmetic/division-remainder/#step0">→ Division and remainders, step 0: the bit that will not share out</a>), that width fails. When the tiles fit exactly, w and N ÷ w are both <strong>factors</strong> of N: numbers that split N into equal whole parts. Two factors that make a rectangle together are a <strong>factor pair</strong>.',
    nTiles: 'Number of tiles N', wTry: 'Tiles per column w',
    c4title: 'N tiles, w to a column',
    s4lgFull: 'full columns', s4lgPart: 'the unfinished last column', s4lgGap: 'dashed: empty slots still needed',
    s4exact: '{N} ÷ {w} = {q} exactly: a {w} × {q} rectangle, so {w} and {q} are both factors of {N}.',
    s4left: '{N} ÷ {w} = {q} remainder {r}: {q} full columns and a last column with only {r}, {miss} short. {w} is not a factor of {N}.',
    s4found: 'Factor pairs found: {k}/{n} — {list}',
    s4prime: '{N} can only be laid as 1 × {N}: it has no factors except 1 and itself. A number like that is called a <strong>prime</strong>.',
    s4hint: 'What to try: keep N = 24 and step w from 1 to 12, checking whether the last column fills up; each layout that works records a factor pair below. w = 8 and w = 3 give the same rectangle turned on its side, so they count as one pair. Then try N = 13 or N = 36 (changing N clears the pairs found).',
    none: 'none yet',

    s5k: 'Step 5 · Quiz',
    s5t: 'Can you put these area tricks to work?',
    quizNote: 'Choose first, then read the explanation. Once you choose, the question locks; press “Next question” to go on.',
    q1: 'You cut 14 × 6 into two pieces. Which of these equals it?',
    q2: 'Cut 23 × 15 at the tens on both sides. What are the four block areas?',
    q3: 'How many different rectangles can 36 tiles make with none left over? (A rectangle turned on its side counts as the same one.)',
    q1why: 'Split 14 into 10 and 4: 10 × 6 + 4 × 6 = 60 + 24 = 84 = 14 × 6. Adding just 4 forgets five of the six rows of the right block; 14 + 6 is addition, not area.',
    q2why: '23 = 20 + 3 and 15 = 10 + 5: 20 × 10 = 200, 20 × 5 = 100, 3 × 10 = 30, 3 × 5 = 15, total 345 = 23 × 15.',
    q3why: 'The factor pairs of 36 are 1 × 36, 2 × 18, 3 × 12, 4 × 9 and 6 × 6: five rectangles.',
    qOk: 'Correct. {why}', qNo: 'Not yet. {why}',
    qNext: 'Next question', qRestart: 'Start again', qProgress: 'Question {i}/{n} · {k} correct so far',

    s6k: 'Step 6 · Wrap-up', s6t: 'Multiplying is counting tiles on a rectangle',
    s6fin: 'Looking back: <strong>step 0</strong> — with the same number in every row, multiplying is a shortcut for adding row after row. <strong>Step 1</strong> — swap the dots for unit squares and the product is the area of a rectangle; a quarter turn shows a × b = b × a. <strong>Step 2</strong> — one cut makes two blocks whose areas always add back to the whole: the distributive law. <strong>Step 3</strong> — two cuts at the tens turn a two-digit product into four easy areas, and each line of the column method is two of them. <strong>Step 4</strong> — running it backwards, the side lengths that tile a pile exactly are its factors.',
    formula: 'a × b = b × a\na × (b + c) = a × b + a × c\n12 × 13 = 10×10 + 10×3 + 2×10 + 2×3',
    boundary: 'Where it holds: every product here uses whole numbers, the tiles are unit squares, and area is measured in tiles. The rows-and-columns picture needs every row to hold the same number (step 0). The distributive and commutative laws hold for all numbers, though this page only shows whole ones. Step 4 counts only neat rectangles, not irregular layouts.',
    linksTitle: 'Where to next',
    lk1: '→ Place value, step 2: why the same 3 means 30 in the tens place',
    lk2: '→ Perimeter vs area, step 1: the same perimeter can enclose very different areas',
    lk3: '→ Inverse proportion, step 0: rectangles with a fixed area of 12 — how length and width trade off',
    lk4: '→ The Pythagorean theorem, step 1: a square’s area is its side squared',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Multiplication Is Area · Arrays Become a Tiled Floor”.'
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
