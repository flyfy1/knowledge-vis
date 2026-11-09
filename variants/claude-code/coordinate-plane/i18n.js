'use strict';
// Coordinate plane lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys and {placeholders} are identical in zh and en (tests/core.cjs checks both).

const STRINGS = {
  zh: {
    pageTitle: '坐标系 · 用一对数找到一个点',
    back: '← 知识索引',
    compare: '对照另一版本：坐标系 · 点的地址 →',
    navLabel: '坐标系步骤导航',
    tagline: '告诉别人「宝藏在东边 3 步」，够他找到吗？在一条路上够，在一片空地上不够。这一页从这个问题出发，搭起两根数轴，让平面上每个格点都有一个地址 (x, y)，再看地址怎样随原点改变、为什么不能写反、正负号怎样分出四个象限。',
    nav0: '0 一个数够吗', nav1: '1 先横后纵', nav2: '2 换原点', nav3: '3 不能写反', nav4: '4 四个象限', nav5: '5 自测', nav6: '6 收束',
    sx: '横坐标 x', sy: '纵坐标 y',
    check: '检查', clearTrail: '清除白点',

    s0k: '第 0 步 · 提出问题',
    s0t: '只报一个数，能把位置说死吗？',
    s0e: '这一步要回答：要说清一个位置，需要几个数？先看宝藏埋在<strong>一条笔直的路上</strong>的情形：在路上选一个起点记作 0，往东为正、往西为负（就像数轴：画着刻度、每格代表 1 的直线），「东边 3 步」就是 3，一个数恰好对应路上一个点。再看宝藏可能埋在<strong>一整片空地上</strong>的情形：只说「东边 3 步」，所有往东 3 步、但南北位置不同的格点都符合，一共一整列。这时还要再报一个数：往北（正）或往南（负）几步。',
    modeLine: '宝藏在一条路上', modePlane: '宝藏在一片空地上',
    clueX: '线索 1：往东几步（负数 = 往西）', useY: '线索 2：往北几步（负数 = 往南）',
    s0lgCand: '符合线索的格点', s0lgOne: '只剩一个时', s0lgRoad: '那条路',
    c0title: '可能的位置：{n} 个', c0start: '起点',
    s0line: '宝藏在路上：只报「{cx}」，符合的位置只有 1 个。一条线上，一个数就够。',
    s0planeOne: '宝藏在空地上，只报「{cx}」：符合的格点有 {n} 个（一整列），说不死。再打开线索 2。',
    s0planeTwo: '宝藏在空地上，报了「{cx}，{cy}」：符合的格点只剩 {n} 个。平面上要两个数。',
    dirE: '往东 {n} 步', dirW: '往西 {n} 步', dirN: '往北 {n} 步', dirS: '往南 {n} 步', dirX0: '东西方向不动', dirY0: '南北方向不动',
    s0hint: '观察顺序：先选「宝藏在一条路上」，拖线索 1，圈只在路上移动、始终只有 1 个。再选「宝藏在一片空地上」，同样只拖线索 1：圈变成一整列 13 个。最后勾上线索 2 再拖它，一列缩成一个点。',

    s1k: '第 1 步 · 搭起坐标系',
    s1t: '一对数怎样写，才不会被读错？',
    s1e: '这一步要回答：两个数各管什么、按什么顺序写？把上一步的两根数轴十字交叉：横着的叫 <strong>x 轴</strong>（向右为正），竖着的叫 <strong>y 轴</strong>（向上为正），交点叫<strong>原点</strong> O，两根轴的 0 都在这里。这样搭起来的叫<strong>平面直角坐标系</strong>。从原点出发，<strong>先沿 x 轴横着走，再沿 y 轴竖着走</strong>，走到的格点就记作 (x, y)：第一个数叫<strong>横坐标</strong>，第二个数叫<strong>纵坐标</strong>。顺序是约定好的，所以 (x, y) 叫<strong>有序数对</strong>。',
    walk1: '从原点走一遍', s1lgX: '先横着走 x 格', s1lgY: '再竖着走 y 格', s1lgTrail: '走到过的点',
    c1title: '平面直角坐标系', c1x: 'x', c1y: 'y', c1o: 'O',
    s1go: '点 {p}：从原点先{hp}，再{vp}。按「从原点走一遍」看路线。',
    s1walking: '正在走：{leg}',
    s1leg1: '第 1 段，沿 x 轴横着走', s1leg2: '第 2 段，沿 y 轴竖着走',
    s1done: '先{hp}，再{vp}，到达 {p}：横坐标 {x}，纵坐标 {y}。',
    s1right: '向右走 {n} 格', s1left: '向左走 {n} 格', s1up: '向上走 {n} 格', s1down: '向下走 {n} 格', s1h0: '横着不动', s1v0: '竖着不动',
    s1hint: '观察顺序：拖 x、y 两个滑杆（也可以直接点格点），再按「从原点走一遍」：青色线先沿 x 轴走，橙色线再沿 y 轴走。走过的点会留下白点。试试 x 或 y 为负数，路线就往左或往下。',

    s2k: '第 2 步 · 换一个原点',
    s2t: '原点挪一挪，点的地址会怎样？',
    s2e: '这一步要回答：坐标是点自己身上的，还是相对原点数出来的？地图上有三个地标：房子、大树、水井，它们一直不动。拖两个滑杆把原点 O（两根轴的交点，地址 (0, 0)）挪到别的格点，坐标轴跟着平移，三个地标的坐标全部重新数：坐标 = 从<strong>新原点</strong>出发，先横后纵要走的格数。虚线是原来的坐标轴。',
    s2ox: '原点向右挪几格（负数 = 向左）', s2oy: '原点向上挪几格（负数 = 向下）',
    s2lgO: '现在的原点和坐标轴', s2lgOld: '原来的坐标轴',
    lmHouse: '房子', lmTree: '大树', lmWell: '水井',
    s2readout: '原点在原来的 {o}：房子 {h}，大树 {t}，水井 {w}。',
    s2diff: '不管原点在哪，从水井到房子都是横着 {dx} 格、竖着 {dy} 格：地址变了，两点的相对位置没变。',
    s2hint: '观察顺序：先只拖第一个滑杆，看三个地址的横坐标一起减小或增大、纵坐标不变；再只拖第二个，纵坐标一起变。原点向右挪 1 格，每个点的横坐标都少 1。',

    s3k: '第 3 步 · 顺序不能反',
    s3t: '(3, 1) 和 (1, 3) 是同一个点吗？',
    s3e: '这一步要回答：把两个坐标写反，还是同一个点吗？A 是一个点，<strong>A\'</strong>（读作「A 撇」）是把 A 的两个坐标交换后得到的点：A = (a, b)，A\' = (b, a)。紫色斜线上的点横纵坐标相等，比如 (2, 2)、(−4, −4)，这里叫它<strong>对角线</strong>。换位前后的两个点，正好像隔着这条对角线照镜子。',
    s3ax: 'A 的横坐标', s3ay: 'A 的纵坐标', swap3: '交换 A 的两个坐标',
    s3lgA: 'A', s3lgB: 'A\'（两个坐标对调）', s3lgDiag: '对角线（横纵坐标相等的点）',
    s3diff: 'A = {a}，A\' = {b}：横着差 {dx} 格、竖着差 {dy} 格，是两个不同的点。写反就换了一个地址。',
    s3same: 'A = {a} 在对角线上，横纵坐标相等：换位后还是它自己。只有这种点写反不出错。',
    s3moving: 'A 正在搬到 {b}……',
    s3hint: '观察顺序：先按「交换 A 的两个坐标」，看 A 沿虚线跨过对角线搬到 A\' 的位置。再只拖 A 的横坐标：A 左右移动，A\' 却上下移动。把两个滑杆拖成一样的数，A 和 A\' 合成一个点。',

    s4k: '第 4 步 · 四个象限',
    s4t: '四块区域里，坐标的正负号有什么规律？',
    s4e: '这一步要回答：两根坐标轴把平面切成四块，每一块里点的坐标是什么符号？这四块叫<strong>象限</strong>，从右上开始按逆时针数：第一、二、三、四象限。规律不用背：x 的正负只看点在 y 轴的右边还是左边，y 的正负只看点在 x 轴的上边还是下边，两个符号拼起来就是象限。坐标轴上的点有一个坐标是 0，0 既不是正数也不是负数，所以<strong>坐标轴上的点不属于任何象限</strong>。',
    clear4: '清除着色', c4q: '第{n}象限',
    qI: '一', qII: '二', qIII: '三', qIV: '四',
    s4quad: '{p}：x 是 {sx}，y 是 {sy}，在第{n}象限（{sx}, {sy}）。已到过 {k}/4 个象限。',
    s4xAxis: '{p}：y = 0，点在 x 轴上，不属于任何象限。已到过 {k}/4 个象限。',
    s4yAxis: '{p}：x = 0，点在 y 轴上，不属于任何象限。已到过 {k}/4 个象限。',
    s4origin: '{p}：点就是原点，不属于任何象限。已到过 {k}/4 个象限。',
    s4all: '四个象限都到过了：（+, +）（−, +）（−, −）（+, −），全是两根轴正负号的拼图。',
    s4hint: '观察顺序：拖 x、y（也可以点格点）让点走遍四块区域，每到一块新的，它就着色并写出符号。再把 x 或 y 拖到 0，读数会说明点在轴上、不属于任何象限。',

    s5k: '第 5 步 · 自测',
    s5t: '三道题，检查自己会不会',
    s5e: '这一步要回答：前面学的读坐标、放点、顺序，能不能独立用上？图中紫色的点 P 是第 1 题；青色的十字是第 2 题你放的点（拖下面的滑杆，或直接点格点）。答对的题会锁定；答错会提示回哪一步看，不直接给答案。',
    c5title: '自测用图', c5p: 'P', c5you: '你放的点',
    q1: '1. 紫色点 P 的坐标是？',
    q2: '2. 把十字放到 (−2, 3)，再按「放好了」。',
    q2place: '放好了', q2sx: '十字左右移动', q2sy: '十字上下移动',
    q3: '3. (4, 1) 和 (1, 4) 是同一个点吗？',
    q3same: '是同一个点', q3diff: '不是同一个点',
    right1: '对。从原点向左 4 格、向下 3 格，P = (−4, −3)。',
    wrong1: '再看看：先数横着走了几格（左负右正），再数竖着几格。回到第 1 步看「先横后纵」。',
    right2: '对。(−2, 3) 在第二象限：向左 2 格、向上 3 格。',
    wrong2: '你放的点是 {p}，不是 (−2, 3)。先横后纵：第一个数是左右，第二个数是上下（回到第 1、4 步）。',
    right3: '对。两个点横着差 3 格、竖着也差 3 格，图上已画出来。只有横纵相等的点写反才不变。',
    wrong3: '再想想：把两个数对调后，点会跨过对角线搬家吗？回到第 3 步试试 (4, 1)。',
    noChoice: '先选一个答案。',
    s5score: '已答对 {c}/3 题。',

    s6k: '第 6 步 · 收束', s6t: '坐标：先选原点，再用一对有序的数说位置',
    s6fin: '<strong>第 0 步</strong>：一条线上一个数就够，平面上只报一个数会剩下一整列，要两个数。<strong>第 1 步</strong>：两根数轴十字交叉成坐标系，从原点先横后纵，(x, y) 就是走法记录。<strong>第 2 步</strong>：坐标相对原点而定；原点一挪，所有地址一起变，两点的相对位置不变。<strong>第 3 步</strong>：(a, b) 和 (b, a) 一般是两个点，隔着对角线对称；a = b 时才重合。<strong>第 4 步</strong>：象限由两个符号拼成，坐标轴上的点不属于任何象限。',
    formula: '一条线：一个数\n平面：(x, y)，先横后纵\n(a, b) ≠ (b, a)，除非 a = b\n一 (+, +)　二 (−, +)　三 (−, −)　四 (+, −)',
    boundary: '适用范围：本页只用整数格点（每格 1），格点之间的点也有坐标，可以是分数或小数，读法相同。两根轴互相垂直、单位长度相同，这是最常用的平面直角坐标系；地图上的经纬度也是一对数定位置，但它画在球面上，规则更复杂。',
    linksTitle: '接着去哪儿',
    lk1: '→ 一次函数第 0 步：把坐标连起来，一排点爬成一条直线',
    lk2: '→ 勾股定理第 5 步：用两点的横、纵坐标差算出它们的距离',
    lk3: '→ 向量第 0 步：从原点指向 (x, y) 的箭头，坐标就是它的分量',
    lk4: '→ 三角函数第 1 步：单位圆上的点，横坐标是 cos、纵坐标是 sin',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《坐标系 · 点的地址》的平行版本。'
  },
  en: {
    pageTitle: 'The Coordinate Plane · A Pair of Numbers for Every Point',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Coordinate Plane · Addresses for Points →',
    navLabel: 'Coordinate plane steps',
    tagline: 'If you tell someone “the treasure is 3 paces east”, can they find it? On a single path, yes; in an open field, no. Starting from that question, this page crosses two number lines so that every grid point gets an address (x, y), then shows how addresses change when the origin moves, why the order matters, and how the signs split the plane into four quadrants.',
    nav0: '0 Is one number enough', nav1: '1 Across, then up', nav2: '2 Move the origin', nav3: '3 Order matters', nav4: '4 Quadrants', nav5: '5 Quiz', nav6: '6 Wrap-up',
    sx: 'x-coordinate', sy: 'y-coordinate',
    check: 'Check', clearTrail: 'Clear the white dots',

    s0k: 'Step 0 · The question',
    s0t: 'Can one number pin down a position?',
    s0e: 'This step answers: how many numbers does it take to say exactly where something is? First suppose the treasure is buried <strong>on one straight path</strong>. Pick a starting point on the path and call it 0, with east positive and west negative (just like a number line: a straight line marked off one unit at a time). “3 paces east” is then 3, and one number matches exactly one point on the path. Now suppose it could be <strong>anywhere in an open field</strong>. “3 paces east” fits every grid point 3 paces east, whatever its north–south position: a whole column of them. You need a second number: how many paces north (positive) or south (negative).',
    modeLine: 'Treasure on a path', modePlane: 'Treasure in a field',
    clueX: 'Clue 1: paces east (negative = west)', useY: 'Clue 2: paces north (negative = south)',
    s0lgCand: 'grid points that fit the clues', s0lgOne: 'when only one is left', s0lgRoad: 'the path',
    c0title: 'Possible places: {n}', c0start: 'start',
    s0line: 'Treasure on the path: “{cx}” alone leaves just 1 possible place. On a line, one number is enough.',
    s0planeOne: 'Treasure in the field, “{cx}” only: {n} grid points fit (a whole column), so it is not pinned down. Turn on clue 2.',
    s0planeTwo: 'Treasure in the field, “{cx}, {cy}”: only {n} grid point is left. On a plane you need two numbers.',
    dirE: '{n} paces east', dirW: '{n} paces west', dirN: '{n} paces north', dirS: '{n} paces south', dirX0: 'no paces east or west', dirY0: 'no paces north or south',
    s0hint: 'What to try: choose “Treasure on a path” and drag clue 1. The ring moves along the path and there is always exactly 1. Then choose “Treasure in a field” and again drag only clue 1: the rings become a whole column of 13. Finally tick clue 2 and drag it: the column shrinks to a single point.',

    s1k: 'Step 1 · Building the axes',
    s1t: 'How should a pair of numbers be written so nobody misreads it?',
    s1e: 'This step answers: what does each number stand for, and in which order do we write them? Cross the two number lines from the last step. The horizontal one is the <strong>x-axis</strong> (positive to the right), the vertical one the <strong>y-axis</strong> (positive upwards), and where they cross is the <strong>origin</strong> O, the 0 of both lines. This set-up is the <strong>coordinate plane</strong>. Start at the origin, <strong>go across along the x-axis first, then up or down along the y-axis</strong>, and write the point you reach as (x, y). The first number is the <strong>x-coordinate</strong>, the second the <strong>y-coordinate</strong>. Because the order is agreed in advance, (x, y) is called an <strong>ordered pair</strong>.',
    walk1: 'Walk it from the origin', s1lgX: 'first across, x units', s1lgY: 'then up or down, y units', s1lgTrail: 'points you have reached',
    c1title: 'Coordinate plane', c1x: 'x', c1y: 'y', c1o: 'O',
    s1go: 'Point {p}: from the origin, first {hp}, then {vp}. Press “Walk it from the origin” to see the route.',
    s1walking: 'Walking: {leg}',
    s1leg1: 'leg 1, across along the x-axis', s1leg2: 'leg 2, up or down along the y-axis',
    s1done: 'First {hp}, then {vp}: you reach {p}, x-coordinate {x}, y-coordinate {y}.',
    s1right: '{n} to the right', s1left: '{n} to the left', s1up: '{n} up', s1down: '{n} down', s1h0: 'no steps across', s1v0: 'no steps up or down',
    s1hint: 'What to try: set x and y with the sliders (or tap a grid point), then press “Walk it from the origin”. The cyan line goes along the x-axis first, the orange one then follows the y direction. Each point you reach leaves a white dot. Try a negative x or y and the route turns left or down.',

    s2k: 'Step 2 · Moving the origin',
    s2t: 'If the origin moves, what happens to the addresses?',
    s2e: 'This step answers: does a point carry its coordinates with it, or are they counted from the origin? The map has three landmarks: a house, a tree and a well, and they never move. Drag the two sliders to shift the origin O (where the axes cross, address (0, 0)) to another grid point. The axes slide with it and all three addresses are recounted: a coordinate is the number of units you walk from the <strong>new origin</strong>, across first, then up or down. The dashed lines are the old axes.',
    s2ox: 'Move the origin right (negative = left)', s2oy: 'Move the origin up (negative = down)',
    s2lgO: 'origin and axes now', s2lgOld: 'the old axes',
    lmHouse: 'house', lmTree: 'tree', lmWell: 'well',
    s2readout: 'Origin at old {o}: house {h}, tree {t}, well {w}.',
    s2diff: 'Wherever the origin is, the house is {dx} across and {dy} up from the well: the addresses changed, the relative position did not.',
    s2hint: 'What to try: move only the first slider and watch every x-coordinate rise or fall together while the y-coordinates stay put; then move only the second, and the y-coordinates change together. Move the origin one unit right and every x-coordinate drops by 1.',

    s3k: 'Step 3 · Order matters',
    s3t: 'Are (3, 1) and (1, 3) the same point?',
    s3e: 'This step answers: if you write the two coordinates the wrong way round, is it still the same point? A is a point and <strong>A′</strong> (“A prime”) is the point you get by swapping its two coordinates: A = (a, b), A′ = (b, a). The violet slanted line holds the points whose two coordinates are equal, such as (2, 2) and (−4, −4); here we call it <strong>the diagonal</strong>. A point and its swapped twin sit like mirror images across that diagonal.',
    s3ax: 'x-coordinate of A', s3ay: 'y-coordinate of A', swap3: 'Swap A’s two coordinates',
    s3lgA: 'A', s3lgB: 'A′ (coordinates swapped)', s3lgDiag: 'the diagonal (equal coordinates)',
    s3diff: 'A = {a} and A′ = {b}: {dx} apart across and {dy} apart up and down, so they are two different points. Writing it backwards gives a different address.',
    s3same: 'A = {a} lies on the diagonal, with equal coordinates: swapping gives the very same point. Only such points survive being written backwards.',
    s3moving: 'A is moving to {b}…',
    s3hint: 'What to try: press “Swap A’s two coordinates” and watch A cross the diagonal along the dashed line to where A′ was. Then drag only A’s x-coordinate: A moves left and right, but A′ moves up and down. Set both sliders to the same number and A and A′ become one point.',

    s4k: 'Step 4 · Quadrants',
    s4t: 'In the four regions, what pattern do the signs follow?',
    s4e: 'This step answers: the two axes cut the plane into four regions; what are the signs of the coordinates in each? The regions are called <strong>quadrants</strong>, numbered anticlockwise starting top right: first, second, third, fourth. No memorising needed: the sign of x only depends on whether the point is right or left of the y-axis, the sign of y only on whether it is above or below the x-axis, and the two signs together name the quadrant. A point on an axis has a coordinate equal to 0, which is neither positive nor negative, so <strong>points on the axes belong to no quadrant</strong>.',
    clear4: 'Clear the colours', c4q: 'Quadrant {n}',
    qI: 'I', qII: 'II', qIII: 'III', qIV: 'IV',
    s4quad: '{p}: x is {sx}, y is {sy}, so it is in quadrant {n} ({sx}, {sy}). Quadrants visited: {k}/4.',
    s4xAxis: '{p}: y = 0, so the point is on the x-axis and in no quadrant. Quadrants visited: {k}/4.',
    s4yAxis: '{p}: x = 0, so the point is on the y-axis and in no quadrant. Quadrants visited: {k}/4.',
    s4origin: '{p}: the point is the origin itself, in no quadrant. Quadrants visited: {k}/4.',
    s4all: 'All four quadrants visited: (+, +) (−, +) (−, −) (+, −). Each is just the two axes’ signs put together.',
    s4hint: 'What to try: drag x and y (or tap grid points) to take the point through all four regions; each new region lights up and shows its signs. Then drag x or y to 0: the readout says the point is on an axis and in no quadrant.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Three questions to check yourself',
    s5e: 'This step answers: can you read coordinates, place a point and handle the order on your own? The violet point P in the picture is for question 1; the cyan cross is the point you place for question 2 (use the sliders below, or tap a grid point). Correct answers lock; a wrong one tells you which step to revisit rather than giving the answer.',
    c5title: 'Quiz grid', c5p: 'P', c5you: 'your point',
    q1: '1. What are the coordinates of the violet point P?',
    q2: '2. Put the cross on (−2, 3), then press “Placed it”.',
    q2place: 'Placed it', q2sx: 'Move the cross left or right', q2sy: 'Move the cross up or down',
    q3: '3. Are (4, 1) and (1, 4) the same point?',
    q3same: 'Yes, the same point', q3diff: 'No, two different points',
    right1: 'Right. From the origin, 4 left and 3 down: P = (−4, −3).',
    wrong1: 'Not quite: count the units across first (left negative, right positive), then up or down. Step 1 explains “across, then up”.',
    right2: 'Right. (−2, 3) is in the second quadrant: 2 left, 3 up.',
    wrong2: 'Your point is {p}, not (−2, 3). Across first, then up or down: the first number is left–right, the second up–down (see steps 1 and 4).',
    right3: 'Right. They are 3 apart across and 3 apart up and down, as drawn now. Only points with equal coordinates survive a swap.',
    wrong3: 'Not quite: when you swap the two numbers, does the point jump across the diagonal? Try (4, 1) in step 3.',
    noChoice: 'Pick an answer first.',
    s5score: '{c}/3 answered correctly.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Coordinates: choose an origin, then name a point with an ordered pair',
    s6fin: '<strong>Step 0</strong>: on a line one number is enough; on a plane one number leaves a whole column, so you need two. <strong>Step 1</strong>: two crossed number lines make the coordinate plane; from the origin go across, then up or down, and (x, y) records that walk. <strong>Step 2</strong>: coordinates are counted from the origin; move it and every address changes together, while points keep their positions relative to each other. <strong>Step 3</strong>: (a, b) and (b, a) are usually two points, mirror images across the diagonal; they coincide only when a = b. <strong>Step 4</strong>: a quadrant is named by two signs, and points on the axes belong to none.',
    formula: 'on a line: one number\non a plane: (x, y), across then up\n(a, b) ≠ (b, a) unless a = b\nI (+, +)　II (−, +)　III (−, −)　IV (+, −)',
    boundary: 'Scope: this page uses whole-number grid points (one unit per square); points between them have coordinates too, fractions or decimals, read the same way. The axes here are perpendicular with equal units, the usual coordinate plane. Latitude and longitude also fix a place with a pair of numbers, but they live on a sphere and follow more complicated rules.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear functions, step 0: join up coordinates and a row of points climbs as a straight line',
    lk2: '→ Pythagoras, step 5: the distance between two points from their x and y differences',
    lk3: '→ Vectors, step 0: the arrow from the origin to (x, y), whose components are the coordinates',
    lk4: '→ Trigonometry, step 1: on the unit circle, a point’s x-coordinate is cos and its y-coordinate is sin',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Coordinate Plane · Addresses for Points”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') {
  try { lang = window.localStorage.getItem('knowledge-lang') || ''; } catch (_) { lang = ''; }
  if (!lang) { try { lang = (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'; } catch (_) { lang = 'zh'; } }
}
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
