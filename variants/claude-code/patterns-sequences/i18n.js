'use strict';
// Patterns lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '找规律 · 拼桌子，不画也知道坐几人',
    back: '← 知识索引',
    compare: '对照另一版本：找规律 · 不画也能报出第 100 个 →',
    navLabel: '找规律步骤导航',
    tagline: '班级聚餐，把方桌一张挨一张拼成长桌。拼 3 张能坐几人？拼 100 张呢？总不能真的摆 100 张桌子去数吧。七步里你会先数一数，再找到「每多一张多几个」，最后不用画图也能算出任意张数——还会碰到一个不守这条规律的例子。',
    nav0: '0 数一数', nav1: '1 多几个', nav2: '2 不画也能算', nav3: '3 换形状', nav4: '4 倒过来', nav5: '5 增量会变', nav6: '6 收束',
    sep: '，', pair: '{n} 张 → {s} 人',
    nTables: '桌子张数 n', check: '核对',
    lgTable: '方桌', lgSeat: '座位（每条空着的边 1 个）',

    s0k: '第 0 步 · 数一数',
    s0t: '方桌拼成一排，能坐几个人？',
    s0e: '这一步要回答：把 n 张方桌一张挨一张拼成一排，能坐几个人？规则很简单：方桌有四条边，每条边坐 1 个人；两张桌子拼在一起，贴住的那条缝两边都坐不了人。拖滑杆改变桌子的张数，图里的圆圈就是能坐人的座位；按「一个一个数」，会给座位一个个编上号数给你看。',
    lgUncounted: '灰色 = 还没数到',
    countOne: '一个一个数',
    c0: '{n} 张方桌拼成一排',
    s0progress: '正在数：{c}/{N}。',
    s0readout: '{n} 张方桌拼成一排，一共能坐 {s} 人。已经数过的：{hist}。',
    s0hint: '观察顺序：先放 1 张，按「一个一个数」，数到 4；再换成 2 张、3 张、4 张……每次都数一遍。读数会把数过的结果都记下来，排在一起看看：人数是怎么变的？',

    s1k: '第 1 步 · 多几个',
    s1t: '每多拼一张桌子，座位多几个？为什么？',
    s1e: '这一步要回答：每多拼一张桌子，座位会多几个，为什么是这么多？我们把「后一个数减前一个数」叫<strong>增量</strong>，也就是这一次比上一次多了几个。按「再拼一张」，新桌子从右边推过来贴上：绿色是新桌子带来的座位，红色是贴住的那条缝两边坐不了的座位。下面的柱子是每一次的总人数，柱子上方的「+」就是增量。',
    lgNew: '新拼上的桌子', lgNewSeat: '绿色 = 新桌子带来的座位', lgLost: '红色 = 缝两边坐不了的座位', lgBars: '柱子 = 每次的总人数', lgPlus: '弧线上的「+」= 增量',
    addOne: '再拼一张', restart: '从头开始',
    c1a: '现在有 {n} 张桌子', c1b: '每次的总人数（横轴：桌子张数）',
    s1start: '现在只有 1 张桌子，四边各坐 1 人，一共 {s} 人。按「再拼一张」。',
    s1readout: '现在 {n} 张，一共 {s} 人（上一次 {p} 人，多了 {d} 人）。新桌子自己带来 {own} 个座位（绿色），可是它和前一张贴住的缝两边，各有 1 个座位坐不了了（红色叉），一共少 {lost} 个：{own} − {lost} = {d}。到现在的人数：{list}。',
    s1hint: '观察顺序：一直按「再拼一张」，盯住红色：每次都正好有 2 个座位被挤掉——旧桌子右边 1 个，新桌子左边 1 个。再看柱子上方：增量每次都是 +2，柱子的顶端排成一条斜着的直线。按「从头开始」可以重来。',

    s2k: '第 2 步 · 不画也能算',
    s2t: '100 张桌子拼成一排，不画图能算出坐几人吗？',
    s2e: '这一步要回答：桌子太多画不下的时候，能不能直接算出人数？换一种分法数座位：每张桌子的<strong>上边和下边</strong>各坐 1 人（青色），每张桌子 2 人，n 张就是 2 × n 人；再加上<strong>最左边和最右边</strong>的 2 人（橙色）。所以 n 张桌子能坐 <strong>2 × n + 2</strong> 人。这种不用画图、直接用 n 算出答案的式子，叫<strong>公式</strong>。',
    lgPair: '青色 = 每张桌子上下 2 人', lgEnds: '橙色 = 两头 2 人', lgDots: '三个点 = 中间省略的桌子',
    bigN: '或者直接输入张数（1～1000）',
    c2: '{n} 张桌子：上下两排 + 两头',
    s2readout: '{n} 张桌子：每张桌子上下各坐 1 人，一共 2 × {n} = {a} 人；两头各坐 1 人，再加 2。合计 2 × {n} + 2 = {s} 人。电脑在图上把座位一个个数过，也是 {g} 个。{hidden}',
    s2hiddenNote: '（图里中间省略了 {m} 张桌子，用三个点代替。）',
    s2hint: '观察顺序：先把滑杆拖到 5，数一数青色有几个、橙色有几个，和读数对得上吗？再在框里输入 100：图里只画出前三张和最后一张，读数照样算出 202，电脑在图上逐个数也是 202。清空输入框，滑杆就重新起作用。',
    quizPrompt: '考考你：25 张方桌拼成一排，能坐几人？',
    quizEmpty: '先填一个数。', quizRight: '对！2 × 25 + 2 = {s}。', quizWrong: '{v} 不对。提示：先算上下两排，每张桌子 2 人；再加两头的 2 人。',

    s3k: '第 3 步 · 换形状',
    s3t: '换成三角形、六边形的桌子，每次多几个？',
    s3e: '这一步要回答：换一种形状的桌子，还有「每次多一样多」的规律吗？多几个由什么决定？规则不变：每条空着的边坐 1 人；每拼一张新桌子，就和前一张贴住一条边，缝两边少 2 个座位。用按钮切换桌子形状。下面的折线图，横轴是桌子张数，纵轴是一共能坐几人。',
    shape_triangle: '三角形', shape_square: '正方形', shape_hexagon: '六边形',
    btn_triangle: '三角形桌子', btn_square: '正方形桌子', btn_hexagon: '六边形桌子',
    lgOthers: '淡色线 = 另外两种桌子',
    c3a: '{n} 张{shape}桌子拼成一排', c3b: '一共能坐几人（横轴：桌子张数）',
    s3readout: '{n} 张{shape}桌子，一共 {s} 人。每张{shape}桌子自己带 {own} 个座位，每拼一张就多一条缝、少 2 个座位，所以每多一张多 {own} − 2 = {d} 人。公式：{d} × {n} + 2 = {f}。',
    s3hint: '观察顺序：先选三角形，把张数从 1 拖到 8，看折线是不是每次升一样高；再换正方形、六边形。三条都是直线：六边形最陡，三角形最平。桌子的边越多，每次多出来的人就越多，正好是「边数 − 2」。',

    s4k: '第 4 步 · 倒过来',
    s4t: '来了 15 位客人，至少要拼几张方桌？',
    s4e: '这一步要回答：知道有多少位客人，能不能倒过来算出要几张桌子？第 2 步的公式说：n 张方桌能坐 2 × n + 2 人。现在倒过来想：先减去两头的 2 人，剩下的人坐上下两排，每张桌子坐 2 人，所以再除以 2。除不尽的时候，多出来的那位客人也要有地方坐，只能再加一张桌子。',
    lgTaken: '橙色 = 有客人坐', lgEmpty: '灰圈 = 空座位',
    guests: '客人数',
    c4: '{S} 位客人，至少 {n} 张桌子',
    s4exact: '正好是整数，所以是 ', s4up: '不是整数，桌子不能只用半张，只好往上取到 ',
    s4readout: '{S} 位客人：n 张桌子能坐 2 × n + 2 人，要不少于 {S}，2 × n 至少是 {S} − 2，n 至少是 ({S} − 2) ÷ 2 = {q}，{round}{n} 张。{n} 张桌子一共 {seats} 个座位，空着 {empty} 个；少一张只能坐 {less} 人，不够。',
    s4hint: '观察顺序：拖「客人数」，看橙色座位一个个坐满，灰圈是空座位。客人数是双数时正好坐满；是单数时总会空 1 个座位。这种「知道结果，倒推出原来的数」的想法，就是以后要学的解方程（<a class="xlink" href="../../../math/algebra/equation-scale/#step3">→ 天平与方程第 3 步：把 x 单独留在一边</a>）。',

    s5k: '第 5 步 · 增量会变',
    s5t: '是不是所有规律都是「每次多一样多」？',
    s5e: '这一步要回答：增量（后一个减前一个）是不是总不变？这次把方桌拼成一个正方形的大桌子：1 × 1、2 × 2、3 × 3……拖滑杆改变大桌子每边的张数 k。同一张图里有两个数在变：一共用了几张小桌子，大桌子四周能坐几人。右边（窄屏时在下面）两组柱子分别记录这两个数，柱子上方是增量。',
    lgSmall: '小方桌', lgTablesBar: '橙柱 = 用了几张小桌子', lgSeatsBar: '青柱 = 四周能坐几人',
    kSlider: '大方桌每边几张 k',
    c5a: '{k} × {k} 拼成一张大方桌', c5b: '用了几张小桌子（横轴：k）', c5c: '四周能坐几人（横轴：k）',
    s5readout: '{k} × {k}：用了 {T} 张小桌子，四周能坐 {S} 人。桌子数：{tl}，增量 {td}——一次比一次大。座位数：{sl}，增量 {sd}——每次一样。',
    s5hint: '观察顺序：把 k 从 1 慢慢拖到 6，比较两组柱子上方的增量：座位数每次都 +4，柱子顶端排成直线；桌子数的增量是 +3、+5、+7……越来越大，柱子越涨越快。所以找规律要先算增量：增量不变，才能像 2 × n + 2 那样直接写出公式；增量会变的，要换个想法（比如桌子数就是 k × k）。',

    s6k: '第 6 步 · 收束',
    s6t: '先数几个，找增量，说清为什么，再写公式',
    s6fin: '回顾一下。<strong>第 0 步</strong>：一张张数，1 张 4 人、2 张 6 人、3 张 8 人。<strong>第 1 步</strong>：每多一张多 2 人，因为新桌子带来 4 个座位，缝两边少掉 2 个。<strong>第 2 步</strong>：换个分法——上下两排每张 2 人，再加两头 2 人——得到公式 2 × n + 2，100 张也能直接算。<strong>第 3 步</strong>：换成别的形状，每次多「边数 − 2」人，折线依然是直的。<strong>第 4 步</strong>：知道人数倒过来求桌子，除不尽就往上取。<strong>第 5 步</strong>：拼成大方桌时桌子数的增量越来越大，那就不能用「每次多一样多」的公式了。',
    formula: '一排方桌：人数 = 2 × n + 2\n每张有 s 条边的桌子：人数 = (s − 2) × n + 2\n倒过来：桌子数 = (人数 − 2) ÷ 2，除不尽就往上取\nk × k 的大方桌：小桌子 k × k 张，四周 4 × k 人',
    boundary: '适用范围：桌子一张接一张拼成一排（第 5 步拼成正方形），相邻两张只贴住一整条边，每条空着的边坐 1 人。换一种拼法（比如拼成 L 形，或两排并在一起），就是另一条规律，要重新数。只从前几个数看出来的规律，在说清理由之前只是猜想；本页每一步都说了理由（新桌子带来几个、每条缝少几个），电脑也在 1 到 1000 张之间逐个数过。真实的桌子还要看椅子大小、桌角能不能坐人，这里不考虑。',
    linksTitle: '接着去哪儿',
    lk1: '→ 一次函数 第 0 步：每一步抬高一样多，点就排成一条直线',
    lk2: '→ 数列 第 0 步：每层多 d 块砖，第 n 层有多少块',
    lk3: '→ 天平与方程 第 3 步：把 x 单独留在一边，倒过来求未知数',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《找规律 · 不画也能报出第 100 个》的平行版本。'
  },
  en: {
    pageTitle: 'Patterns · Push Tables Together, Count Seats Without Drawing',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Patterns · Name the 100th Without Drawing It →',
    navLabel: 'Patterns steps',
    tagline: 'For a class party, square tables are pushed together end to end into one long table. Three tables seat how many? What about 100? You can hardly set out 100 tables just to count. In seven steps you will count a few, find out how many more each new table adds, and then work out any number of tables without drawing — and meet one case where that rule breaks.',
    nav0: '0 Count', nav1: '1 How many more', nav2: '2 No drawing', nav3: '3 Other shapes', nav4: '4 Backwards', nav5: '5 Changing steps', nav6: '6 Wrap-up',
    sep: ', ', pair: '{n} → {s}',
    nTables: 'Number of tables n', check: 'Check',
    lgTable: 'Square table', lgSeat: 'Seat (one on every free side)',

    s0k: 'Step 0 · Count',
    s0t: 'Square tables in a row: how many people can sit?',
    s0e: 'The question here: push n square tables together in a row — how many people can sit? The rules are simple: a square table has four sides and one person sits at each side; where two tables touch, nobody can sit on either side of the join. Drag the slider to change the number of tables; the circles in the picture are the seats. Press “Count them one by one” and the seats get numbered one at a time.',
    lgUncounted: 'Grey = not counted yet',
    countOne: 'Count them one by one',
    c0: '{n} square tables in a row',
    s0progress: 'Counting: {c}/{N}. ',
    s0readout: '{n} square tables in a row seat {s} people. Counted so far (tables → people): {hist}.',
    s0hint: 'What to try: start with 1 table and press “Count them one by one” — you reach 4. Then try 2 tables, 3, 4… and count each time. The readout keeps every result; line them up and look: how does the number of people change?',

    s1k: 'Step 1 · How many more',
    s1t: 'Each extra table adds how many seats — and why?',
    s1e: 'The question here: each time one more table is pushed on, how many seats are added, and why that many? We call “the next number minus the one before” the <strong>step</strong>: how many more there are this time than last time. Press “Add a table” and a new table slides in from the right: green seats are the ones it brings, red ones are the seats on either side of the join that nobody can use any more. The bars below show the total each time; the “+” above them is the step.',
    lgNew: 'Newly added table', lgNewSeat: 'Green = seats the new table brings', lgLost: 'Red = seats lost at the join', lgBars: 'Bars = total people each time', lgPlus: '“+” on the arcs = the step',
    addOne: 'Add a table', restart: 'Start again',
    c1a: 'Now there are {n} tables', c1b: 'Total people each time (across: number of tables)',
    s1start: 'Only 1 table so far: one person on each side, {s} people in all. Press “Add a table”.',
    s1readout: 'Now {n} tables seat {s} people (last time {p}, so {d} more). The new table brings {own} seats of its own (green), but at the join with the table before, one seat on each side is lost (red crosses), {lost} in all: {own} − {lost} = {d}. Totals so far: {list}.',
    s1hint: 'What to try: keep pressing “Add a table” and watch the red seats: every time exactly 2 are squeezed out — one on the right of the old table, one on the left of the new one. Now look above the bars: the step is +2 every time, and the tops of the bars line up along a slanted straight line. “Start again” resets.',

    s2k: 'Step 2 · No drawing',
    s2t: 'Can you tell how many sit at 100 tables without drawing them?',
    s2e: 'The question here: when there are too many tables to draw, can you just work the number out? Count the seats a different way: every table has one person on its <strong>top side and bottom side</strong> (cyan) — 2 per table, so n tables give 2 × n people — plus the 2 people at the <strong>far left and far right</strong> (orange). So n tables seat <strong>2 × n + 2</strong> people. A recipe like this, which gives the answer straight from n without drawing, is called a <strong>formula</strong>.',
    lgPair: 'Cyan = 2 per table, top and bottom', lgEnds: 'Orange = the 2 at the ends', lgDots: 'Three dots = tables left out of the picture',
    bigN: 'Or type a number of tables (1–1000)',
    c2: '{n} tables: two long rows + two ends',
    s2readout: '{n} tables: one person above and one below each table makes 2 × {n} = {a}; one at each end adds 2. Total 2 × {n} + 2 = {s}. The computer counted the seats in the picture one by one and also got {g}. {hidden}',
    s2hiddenNote: '({m} tables in the middle are left out of the picture and shown as three dots.)',
    s2hint: 'What to try: drag the slider to 5 and count the cyan and the orange seats — do they match the readout? Then type 100 in the box: the picture shows only the first three tables and the last, yet the readout still gives 202, and the computer’s seat-by-seat count is 202 too. Clear the box and the slider takes over again.',
    quizPrompt: 'Your turn: 25 square tables in a row seat how many people?',
    quizEmpty: 'Type a number first.', quizRight: 'Right! 2 × 25 + 2 = {s}.', quizWrong: '{v} is not it. Hint: first the two long rows, 2 per table; then add the 2 at the ends.',

    s3k: 'Step 3 · Other shapes',
    s3t: 'With triangle or hexagon tables, how many more each time?',
    s3e: 'The question here: with tables of another shape, does “the same number more each time” still hold — and what decides that number? Same rules: one person per free side; each new table touches the one before along one side, losing 2 seats at the join. Use the buttons to change the shape. In the line chart below, the number of tables runs across and the number of people runs up.',
    shape_triangle: 'triangle', shape_square: 'square', shape_hexagon: 'hexagon',
    btn_triangle: 'Triangle tables', btn_square: 'Square tables', btn_hexagon: 'Hexagon tables',
    lgOthers: 'Faint lines = the other two shapes',
    c3a: '{n} {shape} tables in a row', c3b: 'People in all (across: number of tables)',
    s3readout: '{n} {shape} tables seat {s}. Each {shape} table brings {own} seats, and every join loses 2, so each extra table adds {own} − 2 = {d}. Formula: {d} × {n} + 2 = {f}.',
    s3hint: 'What to try: pick triangles and drag the number of tables from 1 to 8 — does the line climb the same amount each time? Then try squares and hexagons. All three are straight lines: hexagons are steepest, triangles flattest. The more sides a table has, the more people each extra table adds — exactly “number of sides − 2”.',

    s4k: 'Step 4 · Backwards',
    s4t: '15 guests are coming: what is the fewest square tables you need?',
    s4e: 'The question here: if you know how many guests there are, can you work backwards to the number of tables? Step 2’s formula says n square tables seat 2 × n + 2. Run it backwards: take away the 2 people at the ends; everyone else sits in the two long rows, 2 per table, so divide by 2. If it does not divide exactly, the guest left over still needs a seat, so you add one more table.',
    lgTaken: 'Orange = a guest sits here', lgEmpty: 'Grey ring = empty seat',
    guests: 'Number of guests',
    c4: '{S} guests need at least {n} tables',
    s4exact: 'a whole number, so ', s4up: 'not a whole number — you cannot use half a table — so round up to ',
    s4readout: '{S} guests: n tables seat 2 × n + 2. To reach {S}, 2 × n must be at least {S} − 2, so n is at least ({S} − 2) ÷ 2 = {q}: {round}{n} tables. {n} tables have {seats} seats, {empty} left empty; one table fewer seats only {less}, which is not enough.',
    s4hint: 'What to try: drag “Number of guests” and watch the orange seats fill up one by one; grey rings are empty seats. With an even number of guests the tables fill exactly; with an odd number one seat is always left empty. Working back from the answer to the number you started with is what solving an equation is about (<a class="xlink" href="../../../math/algebra/equation-scale/#step3">→ Balance & equations, step 3: get x on its own</a>).',

    s5k: 'Step 5 · Changing steps',
    s5t: 'Does every pattern grow by the same amount each time?',
    s5e: 'The question here: is the step (next number minus the one before) always the same? This time the square tables are pushed into one big square table: 1 × 1, 2 × 2, 3 × 3… Drag the slider to change k, the number of tables along each side. Two numbers change in the same picture: how many small tables are used, and how many people fit round the big table. The two sets of bars on the right (below, on narrow screens) track them, with the step above each pair of bars.',
    lgSmall: 'Small square table', lgTablesBar: 'Orange bars = small tables used', lgSeatsBar: 'Cyan bars = people round the edge',
    kSlider: 'Tables along each side, k',
    c5a: 'A {k} × {k} big square table', c5b: 'Small tables used (across: k)', c5c: 'People round the edge (across: k)',
    s5readout: '{k} × {k}: {T} small tables, {S} people round the edge. Tables: {tl}, steps {td} — bigger every time. Seats: {sl}, steps {sd} — the same every time.',
    s5hint: 'What to try: drag k slowly from 1 to 6 and compare the steps above the two sets of bars. Seats go up by +4 every time, and the bar tops line up straight; tables go up by +3, +5, +7… — bigger and bigger, so the bars shoot up faster and faster. That is why you work out the steps first: only when the step stays the same can you write a formula like 2 × n + 2 straight away; when it changes, you need another idea (here, the number of tables is simply k × k).',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Count a few, find the step, say why, then write the formula',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: counting one at a time — 1 table seats 4, 2 seat 6, 3 seat 8. <strong>Step 1</strong>: each extra table adds 2, because the new table brings 4 seats and the join loses 2. <strong>Step 2</strong>: count it another way — 2 per table in the long rows, plus 2 at the ends — and you get the formula 2 × n + 2, which handles 100 tables directly. <strong>Step 3</strong>: other shapes add “number of sides − 2” each time, and the line stays straight. <strong>Step 4</strong>: knowing the guests, work backwards to the tables, rounding up when it does not divide. <strong>Step 5</strong>: in a big square table the number of tables grows by bigger and bigger steps, so a “same amount each time” formula no longer fits.',
    formula: 'A row of square tables: people = 2 × n + 2\nTables with s sides: people = (s − 2) × n + 2\nBackwards: tables = (people − 2) ÷ 2, rounded up\nA k × k big table: k × k small tables, 4 × k people',
    boundary: 'Scope: tables pushed together one after another in a row (in step 5, into a square), each pair touching along one whole side, with one person per free side. Arrange them another way — an L shape, or two rows side by side — and you get a different pattern that has to be counted afresh. A pattern spotted from the first few numbers is only a guess until you can say why it holds; every step on this page gives the reason (how many seats a new table brings, how many each join loses), and the computer has also counted every case from 1 to 1000 tables. Real tables also depend on chair size and whether anyone can sit at a corner; that is left out here.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear functions, step 0: rise the same at every step and the points line up',
    lk2: '→ Sequences, step 0: d more bricks on each layer — how many on layer n?',
    lk3: '→ Balance & equations, step 3: get x on its own to work backwards',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Patterns · Name the 100th Without Drawing It”.'
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
  if (typeof window.refreshPatterns === 'function') window.refreshPatterns();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PATTERN_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
