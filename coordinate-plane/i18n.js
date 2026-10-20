'use strict';
/* ============================================================
   坐标系与点的位置 · 给每个位置一个地址 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '坐标系与点的位置 · 先横后纵，点有地址 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '坐标系与点的位置 · 给每个位置一个地址',
    tagline: '位置可以被数钉死：一条线上的位置用一个数，平面上的位置用一对数。这一对数有顺序——先横后纵，写反了就是另一个地址。这一页从数轴开始，把坐标系这张「地址网」一格一格铺给你看。',
    nav0: '0 一维地址', nav1: '1 一个数不够', nav2: '2 坐标系登场', nav3: '3 顺序不能反', nav4: '4 四象限', nav5: '5 自测与终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 坐标系与点的位置 Coordinate Plane —— 一步一交互系列',

    s0k: '第 0 步 · 一维地址',
    s0t: '一条线上的点，一个数就够',
    s0e: '这一步要回答：只用一个数，能不能把一条线上的位置说死？这是一条<strong>数轴</strong>：先定一个起算点，叫<strong>原点</strong>（origin，记作 O）——所有位置都相对于它说；再定正方向（这里向右为正）。拖动轴上的点（或点任意刻度放点），看读数怎样用一个带符号的数把它的位置说清。',
    s0shift: '把原点挪到 +2 处看看',
    s0unshift: '把原点放回原处',
    s0roPos: '点在原点<strong>右边 {n} 格</strong>，记作 <b>+{n}</b>——方向（右）加距离（{n} 格），一个数就把位置钉死了。',
    s0roNeg: '点在原点<strong>左边 {n} 格</strong>，记作 <b>−{n}</b>——负号管方向（左），数字管距离（{n} 格）。',
    s0roZero: '点就在<strong>原点</strong>，记作 <b>0</b>——不左不右，距离也是 0。',
    s0shiftNote: '注意：<b>点没动，地址变了</b>。原点挪到 {o} 之后，同一个点的读数成了 {r}。地址永远是相对于原点说的——原点一换，全体地址跟着变。',
    s0blocked: '先别挪：原点要是真的挪过去，这个点的读数会变成 <b>{r}</b>，跑出这条轴标出的 −6…+6 了。把点往中间挪一点，再点一次试试。',
    s0oldOrigin: '原来的原点',
    s0hint: '结论：一维位置 ⇔ 一个带符号的数，前提是<strong>原点与正方向事先说定</strong>。但这条本事只管一条线上的点——点要是跳到平面上，一个数还够不够？下一步当场撞给你看。',

    s1k: '第 1 步 · 一个数不够',
    s1t: '平面上的点，要一对数才定得死',
    s1e: '这一步要回答：把点放进平面，只报一个数，会发生什么？这是一片座位：<strong>7 列 × 5 行</strong>，其中藏着一个目标座位。先只报一个数试试——用滑杆选列号或行号，再点下面的按钮报出去，看亮起来的范围有多大。',
    s1colLab: '列号（从左往右数第几列）',
    s1rowLab: '行号（从下往上数第几行）',
    s1btnCol: '只报列号',
    s1btnRow: '只报行号',
    s1btnBoth: '两个都报',
    s1roIdle: '还没报数。先想想：只给一个列号，能定死是哪一个座位吗？',
    s1roCol: '只报列号 <b>{c}</b>：第 {c} 列整列亮起来——这一列有 <b>{n} 个座位</b>，目标可能在其中任何一个。<strong>一个数只定出一条线，定不死一个点。</strong>',
    s1roRow: '只报行号 <b>{r}</b>：第 {r} 行整行亮起来——这一行有 <b>{n} 个座位</b>，目标可能在其中任何一个。<strong>一个数只定出一条线，定不死一个点。</strong>',
    s1roBothHit: '列 <b>{c}</b>、行 <b>{r}</b> 两个都报：两条亮带一交叉，交叉处只剩 <b>1 个座位</b>——目标现身！<strong>两个数一交叉，点就被钉死了。</strong>',
    s1roBothMiss: '列 <b>{c}</b>、行 <b>{r}</b> 两个都报：交叉处只剩 <b>1 个座位</b>——这一对数确实定死了一个座位，可惜不是目标那个。换一组列号、行号再报。',
    s1target: '目标',
    s1colsCap: '列号 →',
    s1rowsCap: '行号 ↑',
    s1hint: '结论：平面上的位置需要<strong>一对数</strong>——一个管横、一个管纵。座位、棋盘、地图网格都是这个道理。下一步给这对数立全世界统一的规矩。',

    s2k: '第 2 步 · 坐标系登场',
    s2t: '先横后纵：(x, y) 是点的地址',
    s2e: '这一步要回答：这一对数按什么统一规矩写，全世界的人才不会读错？把第 0 步的数轴再立起来一根：横着的叫<strong>横轴</strong>（x 轴），立起来的叫<strong>纵轴</strong>（y 轴）；两条数轴垂直交叉、共用一个原点，铺成的这张「地址网」叫<strong>平面直角坐标系</strong>。给网格配上原点和正负，座位号就升级成了坐标。点图上的青色点，看它的坐标是怎样从原点一步步走出来的；再拖橙色点满图跑。',
    s2build: '▶ 搭一遍坐标系',
    s2pickLab: '点图上的青色点看走法，或拖动橙色点满图跑：',
    s2bPh1: '1/3：横轴躺平——就是第 0 步那条数轴',
    s2bPh2: '2/3：纵轴立起——同一条数轴，竖起来',
    s2bPh3: '3/3：原点对齐——地址网铺好了',
    s2ro: '先横走 <b>{xs}</b>，再纵走 <b>{ys}</b> → 这个点的坐标是 <b>{coord}</b>。第一个数 {xs} 叫<strong>横坐标</strong>，第二个数 {ys} 叫<strong>纵坐标</strong>。',
    s2hint: '结论：坐标 = 从原点出发的走法记录，写成<strong>有序数对</strong> (x, y)——有顺序的一对数，先横后纵，全世界统一。本页只练整数格点；格子之间的点也有坐标，可以是分数、小数，读法完全相同（后面的函数页会遇到）。',

    s3k: '第 3 步 · 顺序不能反',
    s3t: '(3, 2) 和 (2, 3) 不是一家',
    s3e: '这一步要回答：把坐标的两个数写反，还是同一个点吗？青点是 A，橙点 A′ 是把 A 的坐标<strong>交换</strong>得到的「换位点」。点「交换 A 的坐标」，看 A 往哪儿搬家；再拖 A 满图跑（或用滑杆），盯住 A′ 怎样跟着动。图上那条斜线叫<strong>对角线</strong>——横纵相等的点连成的线，这一步只拿它当换位实验的镜面。',
    s3xLab: 'A 的横坐标 x',
    s3yLab: 'A 的纵坐标 y',
    s3swapBtn: '交换 A 的坐标 ⇄',
    s3diag: '对角线：这条斜线上的点横纵相等',
    s3roDiff: 'A 是 <b>{a}</b>，换位点 A′ 是 <b>{b}</b>：横坐标差 <b>{dx} 格</b>、纵坐标差 <b>{dy} 格</b>——<strong>两个不同的点</strong>。写反 = 点搬家。',
    s3roSame: 'A 是 <b>{a}</b>：横纵相等，交换之后还是它自己——A 和 A′ 在这里<strong>重合</strong>。只有对角线上的点，写反了才不变。',
    s3hint: '结论：(a, b) 与 (b, a) 一般是两个不同的点，<strong>a = b 时才重合</strong>——所以坐标必须是有序数对，顺序本身就是地址的一部分。这条对一切坐标都成立，不限于整数格点。',

    s4k: '第 4 步 · 四象限',
    s4t: '四象限：符号是拼出来的，不是背的',
    s4e: '这一步要回答：两根轴把平面切成的四块区域，每块里的点，坐标符号有什么规律？这四块区域叫<strong>象限</strong>（quadrant），按逆时针从右上数：一、二、三、四。拖点满平面跑（也可以点任意格点把点放过去），读数行会把它的坐标、符号和所在区域一起报出来；第一次走进一个新区，那个区域就会亮起来并挂上它的符号牌。',
    s4ro: '点 {coord}：x 是 <b>{sx}</b>，y 是 <b>{sy}</b> → 在<strong>{region}</strong>。',
    s4roXAxis: '点 {coord} 在 <strong>x 轴</strong>上：y = 0——没有正负，<strong>不属于任何象限</strong>。',
    s4roYAxis: '点 {coord} 在 <strong>y 轴</strong>上：x = 0——没有正负，<strong>不属于任何象限</strong>。',
    s4roOrigin: '点 {coord} 就是<strong>原点</strong>：两个坐标都是 0，<strong>不属于任何象限</strong>。',
    s4ro2: '四个区域全部走到了：它们的符号，全是两根轴正负的<strong>拼图</strong>——x 的符号看左右、y 的符号看上下，拼起来就是，不用背。',
    qname1: '第一象限', qname2: '第二象限', qname3: '第三象限', qname4: '第四象限',
    s4prac: '<strong>反向小练（不计分）</strong>：只给符号，你能指出区域吗？看下面给出的符号组合，在图上点一点你认为对的区域（点任意格点即可作答；拖着点到处逛不算作答）。',
    s4pCombo: '要找的组合：<b>{signs}</b> ——点图上的一个区域作答。',
    s4pOk: '✓ 对了：{signs} 就是<strong>{region}</strong>的符号。',
    s4pNo: '✗ 还不对：你点到的是<strong>{got}</strong>。记住拼法——x 的符号定左右、y 的符号定上下，再点一次。',
    s4pAxis: '✗ 你点在了坐标轴上——轴上的点不属于任何象限。点四个区域里面试试。',
    s4new: '换一个组合',
    s4hint: '结论：点在第几象限，只取决于 x、y 各自的正负，<strong>与坐标大小无关</strong>；坐标轴上的点不属于任何象限（因为总有一个坐标是 0）。这是定义，没有例外。',

    s5k: '第 5 步 · 自测与终章',
    s5t: '自测：读得出、放得准、不写反',
    s5e: '三道题，分别考读坐标、按坐标放点、还有最容易栽的「写反」。做错不要紧，反馈会告诉你该回头看哪一步；答对了就锁定。',
    q1t: '题 1 · 读坐标',
    q1d: '图上这个点的坐标是哪一个？自己读一遍：从原点出发，先横走、再纵走。注意选项里藏着一个把两个数写反的。',
    q1ok: '✓ 对了：先横走 −4（向左 4 格），再纵走 −3（向下 3 格）——坐标是 <b>(−4, −3)</b>。写反的 (−3, −4) 是另一个点。读坐标的功夫在第 2 步。',
    q1no: '✗ 还不对。再读一遍：这个点在原点左下方——先横走几格（是正是负？），再纵走几格？回第 2 步拖一遍就清楚了。',
    q2t: '题 2 · 按坐标放点',
    q2d: '把点放到 <b>(−2, 3)</b> 去：在图上点一个格点放点。先横后纵——横走 −2、纵走 3，落在哪儿？',
    q2idle: '还没放点。在图上点一个格点试试。',
    q2ok: '✓ 严丝合缝：你放的点正是 <b>(−2, 3)</b>——横坐标 −2 在原点左边，纵坐标 3 在上边，它在第二象限。',
    q2no: '✗ 你放的点实际坐标是 <b>{placed}</b>，目标是 <b>{target}</b>。看清两个数的正负和顺序，再点一次。（放点和读点是一对逆操作，都在第 2 步；符号定区域在第 4 步。）',
    q3t: '题 3 · 换位陷阱',
    q3d: '<b>(4, 1)</b> 和 <b>(1, 4)</b> 是同一个点吗？先选一个答案——选完图上会把两个点同时亮出来作证。',
    q3yes: '是同一个点',
    q3no: '不是同一个点',
    q3ok: '✓ 对：图上两个点一个在 (4, 1)、一个在 (1, 4)，隔着对角线遥遥相对——<strong>不是同一个点</strong>。这正是第 3 步的结论：写反 = 搬家，除非横纵相等。',
    q3noMsg: '✗ 图上已经把两个点亮出来了：(4, 1) 和 (1, 4) 明明在两个地方。想想第 3 步：交换坐标之后，点是会搬家的——再选一次。',
    s5done: '🎉 三题全对：你已经会给平面上任何一个格点发地址了——读得出、放得准、还不会写反。',
    s5hint: '三题分别对应第 2 步（读写坐标）、第 2 与第 4 步（放点与符号）、第 3 步（顺序不能反）。哪道错了，就回到那一步再拖一遍。',
    c1h: '地址的维数跟着世界走',
    c1: '一条线上的位置，一个数（带符号）就钉死；平面上的位置，要一对数。世界多一维，地址就多一个数——以后到了立体空间，还会再多一个。',
    c2h: '(x, y) 是有序数对',
    c2: '先横后纵，全世界统一。(a, b) 与 (b, a) 是两个不同的地址，只有 a = b 时才重合——顺序本身就是地址的一部分。',
    c3h: '象限是符号拼图',
    c3: 'x 的正负定左右、y 的正负定上下，拼起来就是四个象限的符号，不用背。坐标轴上的点有一个坐标是 0、没有正负，不属于任何象限。',
    s5fin: '坐标系是后面所有函数页的地基：一次函数把点排成直线、抛物线把点排成弧线，读的都是你这一页练的地址。往下走——',
    s5neg: '还有一件事：数轴上 0 的左边那半截，还有一整页的故事——负数是怎么住进数轴的，那页正在路上。',
    s5lkLf0: '坐标动起来：点排成一条直线——一次函数的爬坡，从你会读的坐标开始 →',
    s5lkLf2: '把坐标代进方程验算：(x, y) 不只是地址，还能拿去算 →',
    s5lkPyth: '用坐标算距离：两点之间的距离，横纵差进了勾股定理 →'
  },
  en: {
    docTitle: 'The Coordinate Plane · x First, Then y — Every Point Has an Address — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'The Coordinate Plane · An Address for Every Position',
    tagline: 'A position can be pinned down by numbers: one number for a position on a line, a pair of numbers for a position on a plane. And the pair has an order — across first, then up; swap them and you land at a different address. Starting from the number line, this page lays out the coordinate grid one cell at a time.',
    nav0: '0 One Number', nav1: '1 One Is Not Enough', nav2: '2 The Grid Arrives', nav3: '3 Order Matters', nav4: '4 Four Quadrants', nav5: '5 Quiz & Wrap-up',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Coordinate Plane 坐标系与点的位置 — One Interaction at a Time series',

    s0k: 'Step 0 · A One-Dimensional Address',
    s0t: 'On a line, one number is enough',
    s0e: 'This step answers: can a single number pin down a position on a line? This is a <strong>number line</strong>: first fix a starting point called the <strong>origin</strong> (marked O) — every position is spoken of relative to it; then fix a positive direction (to the right, here). Drag the point along the axis (or click any tick to place it) and watch the readout state its position with one signed number.',
    s0shift: 'Move the origin to +2 and see',
    s0unshift: 'Put the origin back',
    s0roPos: 'The point is <strong>{n} units to the right</strong> of the origin, written <b>+{n}</b> — direction (right) plus distance ({n} units): one number pins the position down.',
    s0roNeg: 'The point is <strong>{n} units to the left</strong> of the origin, written <b>−{n}</b> — the minus sign carries the direction (left), the digit carries the distance ({n} units).',
    s0roZero: 'The point sits exactly on the <strong>origin</strong>, written <b>0</b> — neither left nor right, and distance 0.',
    s0shiftNote: 'Notice: <b>the point did not move, but its address changed</b>. With the origin moved to {o}, the same point now reads {r}. An address is always relative to the origin — move the origin and every address shifts with it.',
    s0blocked: 'Hold on — if the origin really moved, this point would read <b>{r}</b>, outside the −6…+6 marked on this axis. Nudge the point toward the middle, then try again.',
    s0oldOrigin: 'old origin',
    s0hint: 'The conclusion: a one-dimensional position ⇔ one signed number, provided the <strong>origin and positive direction are agreed first</strong>. But that only works on a line — what happens when the point jumps off into a plane? The next step runs straight into it.',

    s1k: 'Step 1 · One Number Is Not Enough',
    s1t: 'On a plane, it takes a pair of numbers',
    s1e: 'This step answers: put the point on a plane and report only one number — what happens? This is a block of seats: <strong>7 columns × 5 rows</strong>, with one target seat hidden among them. Try reporting a single number first — choose a column or row number with the sliders, then press a button to call it out, and see how much of the block lights up.',
    s1colLab: 'Column number (counting from the left)',
    s1rowLab: 'Row number (counting from the bottom)',
    s1btnCol: 'Report the column only',
    s1btnRow: 'Report the row only',
    s1btnBoth: 'Report both',
    s1roIdle: 'Nothing reported yet. Think first: given only a column number, could you pin down exactly which seat it is?',
    s1roCol: 'Column <b>{c}</b> only: column {c} lights up in full — it holds <b>{n} seats</b>, and the target could be any of them. <strong>One number fixes a line, never a point.</strong>',
    s1roRow: 'Row <b>{r}</b> only: row {r} lights up in full — it holds <b>{n} seats</b>, and the target could be any of them. <strong>One number fixes a line, never a point.</strong>',
    s1roBothHit: 'Column <b>{c}</b> and row <b>{r}</b> together: the two lit bands cross, and exactly <b>1 seat</b> remains — the target appears! <strong>Two numbers crossing pin the point down.</strong>',
    s1roBothMiss: 'Column <b>{c}</b> and row <b>{r}</b> together: exactly <b>1 seat</b> remains at the crossing — the pair does pin down one seat, just not the target one. Try another column and row.',
    s1target: 'target',
    s1colsCap: 'columns →',
    s1rowsCap: 'rows ↑',
    s1hint: 'The conclusion: a position on a plane needs <strong>a pair of numbers</strong> — one for across, one for up. Seats, chessboards and map grids all work this way. The next step sets the worldwide rule for writing the pair.',

    s2k: 'Step 2 · The Coordinate System Arrives',
    s2t: 'Across first, then up: (x, y) is the point’s address',
    s2e: 'This step answers: what single rule for writing the pair keeps everyone in the world from misreading it? Stand a second number line upright: the horizontal one is the <strong>x-axis</strong>, the upright one is the <strong>y-axis</strong>; two number lines crossing at right angles, sharing one origin — the "address net" they weave is the <strong>Cartesian coordinate system</strong>. Give the seat grid an origin and signs, and seat numbers graduate into coordinates. Click a cyan point to watch its coordinates walked out from the origin; then drag the orange point all over the plane.',
    s2build: '▶ Build the system once',
    s2pickLab: 'Click a cyan point to see the walk, or drag the orange point anywhere:',
    s2bPh1: '1/3: the x-axis lies down — the number line from Step 0',
    s2bPh2: '2/3: the y-axis stands up — the same line, upright',
    s2bPh3: '3/3: origins aligned — the address net is ready',
    s2ro: 'Walk <b>{xs}</b> across first, then <b>{ys}</b> up → the coordinates of this point are <b>{coord}</b>. The first number, {xs}, is the <strong>x-coordinate</strong>; the second, {ys}, is the <strong>y-coordinate</strong>.',
    s2hint: 'The conclusion: coordinates are the record of a walk from the origin, written as an <strong>ordered pair</strong> (x, y) — a pair with an order, across first then up, the same rule worldwide. This page practises integer lattice points only; points between the lattice lines have coordinates too — fractions or decimals — read in exactly the same way (the function pages ahead will use them).',

    s3k: 'Step 3 · Order Cannot Be Swapped',
    s3t: '(3, 2) and (2, 3) are not the same address',
    s3e: 'This step answers: write the two numbers of a coordinate in the wrong order — is it still the same point? The cyan point is A; the orange point A′ is its "swap twin", made by <strong>exchanging</strong> A’s coordinates. Press "Swap A’s coordinates" and watch where A moves; then drag A around (or use the sliders) and watch A′ follow. The slanted line is called the <strong>diagonal</strong> — the line of points whose two coordinates are equal; in this step it serves only as a mirror for the swap experiment.',
    s3xLab: 'A’s x-coordinate',
    s3yLab: 'A’s y-coordinate',
    s3swapBtn: 'Swap A’s coordinates ⇄',
    s3diag: 'diagonal: points on this line have equal coordinates',
    s3roDiff: 'A is <b>{a}</b> and its swap twin A′ is <b>{b}</b>: the x-coordinates differ by <b>{dx}</b>, the y-coordinates by <b>{dy}</b> — <strong>two different points</strong>. Writing the pair backwards moves the point.',
    s3roSame: 'A is <b>{a}</b>: its two coordinates are equal, so swapping changes nothing — A and A′ <strong>coincide</strong> here. Only points on the diagonal survive being written backwards.',
    s3hint: 'The conclusion: (a, b) and (b, a) are generally two different points, coinciding only when <strong>a = b</strong> — which is why a coordinate must be an ordered pair: the order itself is part of the address. This holds for all coordinates, not just integer lattice points.',

    s4k: 'Step 4 · The Four Quadrants',
    s4t: 'Quadrants: the signs are assembled, not memorised',
    s4e: 'This step answers: the two axes cut the plane into four regions — what sign pattern do the points in each region carry? The four regions are called <strong>quadrants</strong>, counted counterclockwise from the top right: first, second, third, fourth. Drag the point all over the plane (or click any lattice point to place it there); the readout reports its coordinates, its signs and its region together. The first time you enter a new region, it lights up and hangs out its sign badge.',
    s4ro: 'Point {coord}: x is <b>{sx}</b>, y is <b>{sy}</b> → the <strong>{region}</strong>.',
    s4roXAxis: 'Point {coord} is on the <strong>x-axis</strong>: y = 0 — no sign at all, so it <strong>belongs to no quadrant</strong>.',
    s4roYAxis: 'Point {coord} is on the <strong>y-axis</strong>: x = 0 — no sign at all, so it <strong>belongs to no quadrant</strong>.',
    s4roOrigin: 'Point {coord} is the <strong>origin</strong>: both coordinates are 0, and it <strong>belongs to no quadrant</strong>.',
    s4ro2: 'All four regions visited: their signs are nothing but a <strong>jigsaw of the two axes’ signs</strong> — the sign of x reads left vs right, the sign of y reads down vs up. Assembled, not memorised.',
    qname1: 'first quadrant', qname2: 'second quadrant', qname3: 'third quadrant', qname4: 'fourth quadrant',
    s4prac: '<strong>Reverse practice (not scored)</strong>: given only the signs, can you point at the region? Look at the sign combination below and click the region on the diagram that you think matches (clicking any lattice point counts as an answer; dragging the point around to explore does not).',
    s4pCombo: 'Find this combination: <b>{signs}</b> — click a region on the diagram to answer.',
    s4pOk: '✓ Correct: {signs} is the sign pattern of the <strong>{region}</strong>.',
    s4pNo: '✗ Not this one: you clicked the <strong>{got}</strong>. Remember the assembly — the sign of x picks left vs right, the sign of y picks down vs up. Click again.',
    s4pAxis: '✗ You clicked on an axis — points on an axis belong to no quadrant. Try inside one of the four regions.',
    s4new: 'Another combination',
    s4hint: 'The conclusion: which quadrant a point is in depends only on the signs of x and y, <strong>never on their sizes</strong>; points on the axes belong to no quadrant, because one of their coordinates is 0 and has no sign. This is a definition — no exceptions.',

    s5k: 'Step 5 · Quiz & Wrap-up',
    s5t: 'Quiz: read it, place it, never swap it',
    s5e: 'Three questions — reading coordinates, placing a point by its coordinates, and the classic trap of writing the pair backwards. Wrong answers are fine: the feedback tells you which step to revisit, and a correct answer locks the question.',
    q1t: 'Question 1 · Read the coordinates',
    q1d: 'What are the coordinates of the point in the diagram? Read it yourself: from the origin, walk across first, then up. Beware — one of the options is the same pair written backwards.',
    q1ok: '✓ Correct: walk −4 across (4 units left), then −3 up (3 units down) — the coordinates are <b>(−4, −3)</b>. The swapped (−3, −4) is a different point. The reading craft is Step 2.',
    q1no: '✗ Not yet. Read it again: the point is down-left of the origin — how many units across (and what sign?), then how many up? Drag through Step 2 once more and it will be clear.',
    q2t: 'Question 2 · Place the point by its coordinates',
    q2d: 'Place the point at <b>(−2, 3)</b>: click a lattice cell in the diagram to drop the point there. Across first, then up — where do −2 across and 3 up land?',
    q2idle: 'No point placed yet. Click a lattice cell in the diagram to try.',
    q2ok: '✓ A perfect landing: your point is exactly <b>(−2, 3)</b> — x-coordinate −2 is left of the origin, y-coordinate 3 is above it, in the second quadrant.',
    q2no: '✗ The point you placed actually has coordinates <b>{placed}</b>; the target is <b>{target}</b>. Check the signs and the order of the two numbers, then click again. (Placing and reading are inverse operations — both live in Step 2; signs and regions are Step 4.)',
    q3t: 'Question 3 · The swap trap',
    q3d: 'Are <b>(4, 1)</b> and <b>(1, 4)</b> the same point? Pick an answer first — afterwards the diagram will light up both points as evidence.',
    q3yes: 'The same point',
    q3no: 'Not the same point',
    q3ok: '✓ Right: one point sits at (4, 1) and the other at (1, 4), facing each other across the diagonal — <strong>not the same point</strong>. That is exactly Step 3’s conclusion: swapping the coordinates moves the point, unless the two numbers are equal.',
    q3noMsg: '✗ The diagram has lit up both points: (4, 1) and (1, 4) are plainly in two different places. Recall Step 3 — exchanging the coordinates really does move the point. Choose again.',
    s5done: '🎉 All three correct: you can now issue an address to any lattice point on the plane — read it, place it, and never write it backwards.',
    s5hint: 'The three questions map to Step 2 (reading and writing coordinates), Steps 2 and 4 (placing a point, and signs), and Step 3 (order cannot be swapped). Missed one? Go back to its step and drag it once more.',
    c1h: 'The address grows with the world',
    c1: 'A position on a line is pinned by one (signed) number; a position on a plane takes a pair. Add a dimension to the world and the address gains a number — in three-dimensional space there will be one more still.',
    c2h: '(x, y) is an ordered pair',
    c2: 'Across first, then up — the same rule worldwide. (a, b) and (b, a) are two different addresses, coinciding only when a = b: the order itself is part of the address.',
    c3h: 'Quadrants are a jigsaw of signs',
    c3: 'The sign of x picks left vs right, the sign of y picks down vs up; assemble them and you have the sign pattern of all four quadrants — nothing to memorise. A point on an axis has a coordinate of 0, no sign, and belongs to no quadrant.',
    s5fin: 'The coordinate system is the foundation under every function page that follows: linear functions line points up into a straight line, parabolas into an arc — all of them reading the addresses you practised here. Onwards —',
    s5neg: 'One more thing: the left half of the number line, the part left of 0, has a whole page of its own story — how negative numbers moved into the number line. That page is on its way.',
    s5lkLf0: 'Coordinates in motion: points line up into a straight line — the linear-function ramp starts from coordinates you can read →',
    s5lkLf2: 'Coordinates at work: plug (x, y) into an equation and check it — an address you can also compute with →',
    s5lkPyth: 'Measuring with coordinates: the distance between two points feeds the coordinate differences into the Pythagorean theorem →'
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
