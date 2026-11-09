'use strict';
// Bar Charts (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '条形图 · 让数字站成一排比高矮',
    back: '← 知识索引',
    compare: '对照另一版本：条形图 · 让数字站成一排比高矮 →',
    navLabel: '条形图步骤导航',
    tagline: '班级图书角记下了一周五天每天借出几本书。光看一排数字，谁多谁少要一个个比；把每个数画成一根长条，多少就变成了高矮，一眼就能看出来。下面七步，学会画条形图、读条形图，也学会识破画得“不老实”的条形图。',
    nav0: '0 数变成条', nav1: '1 一格几本', nav2: '2 差多少', nav3: '3 纵轴从哪起', nav4: '4 两周比一比', nav5: '5 平均线', nav6: '6 收束',
    d0: '周一', d1: '周二', d2: '周三', d3: '周四', d4: '周五',
    joinDays: '、',
    rowDay: '星期', rowBooks: '借出（本）',

    s0k: '第 0 步 · 从表格到图',
    s0t: '一排数字，怎样一眼看出哪天借得最多？',
    s0e: '这一步要回答：表格里的五个数，怎样画成一眼就能比较的图？<strong>条形图</strong>就是给每个数画一根同样宽的长条，长条有多长就表示数有多大：这里每 1 本书画 1 格高。竖线上标着 0、5、10……的刻度，这条带刻度的线叫<strong>纵轴</strong>，用它读出每根长条到了几本；底下写星期的那条线叫<strong>横轴</strong>。长条可以竖着站，也可以横着躺，长度表示的意思不变。',
    daySlider: '选一天', valSlider: '这天借出几本',
    flip0: '竖着放 ⇄ 横着放', reset0: '恢复原来的数',
    s0lgBar: '每天借出的本数', s0lgSel: '你正在改的那一天',
    c0a: '一周五天借书数量的条形图',
    s0readout: '{day}：{v} 本，长条就画 {v} 格长。这一周最多的是{maxDays}（{max} 本），最少的是{minDays}（{min} 本）。',
    s0hint: '观察顺序：先拖“这天借出几本”，只有被选中的那根长条（橙色）变长变短，上面表格里的数也跟着变；再拖“选一天”换一根来改。按“竖着放 ⇄ 横着放”，长条躺倒，但谁长谁短没有变。这里改的数只用在这一步，后面几步都用原来的数据。',

    s1k: '第 1 步 · 刻度',
    s1t: '纵轴上一格代表几本才合适？',
    s1e: '这一步要回答：纸上只画得下 10 格高时，一格应该代表几本书？纵轴上相邻两条横线之间是<strong>一格</strong>，“一格代表几本”叫<strong>刻度单位</strong>。一格代表的本数越多，同一个数画出来的长条越短。一格 1 本时，超过 10 本的长条顶出了图（锯齿表示被截掉了）；一格 10 本时，长条都很矮，差几本几乎看不出来。合适的刻度要让最长的长条放得下，又占满大半张图。',
    unitSlider: '一格代表几本',
    s1lgBar: '借出本数', s1lgCut: '顶出图的长条（锯齿 = 截断）',
    c1a: '同一组数用不同刻度画出的条形图',
    s1readout: '一格 {u} 本 → 这张图最高画到 {top} 本。最多的{hiDay}（{hi} 本）要 {tc} 格高。{dA}（{vA} 本）和{dB}（{vB} 本）差 {dv} 本，在图上只差 {dc} 格。{over}',
    s1over: '有 {n} 天超过 {top} 本，长条顶出了图。',
    s1fit: '五根长条都放得下。',
    s1hint: '观察顺序：把“一格代表几本”从 1 拖到 10，盯住周二和周四这两根：一格 1 本时它们差 2 格，一格 2 本时差 1 格，一格 5 本时只差 0.4 格，一格 10 本时只差 0.2 格。再看最高的周三：一格 1 本放不下，一格 2 本占 7.5 格，最合适。',

    s2k: '第 2 步 · 差多少',
    s2t: '从图上怎样读出两天差几本？',
    s2e: '这一步要回答：两根长条一高一矮，高出几本？从矮的那根顶上画一条虚线横过去，高的那根在虚线上方多出来的那一截（橙色）就是<strong>相差的本数</strong>：大数 − 小数。如果想知道谁第一、谁第二，可以把长条<strong>从高到低重新排</strong>：排好以后，名次从左往右一眼就读出来。',
    dayA: '第一天', dayB: '第二天', sort2: '从高到低排 / 按星期排',
    s2lgBar: '借出本数', s2lgDiff: '相差的那一截', s2lgLine: '从矮的长条顶上拉过去的虚线',
    c2a: '两天的长条，以及它们相差的那一截',
    s2readout: '{dA} {a} 本，{dB} {b} 本：{res}{order}',
    s2more: '{dT}比{dS}多 {d} 本（{big} − {small} = {d}）。', s2same: '这两天一样多，虚线正好碰到两根长条的顶。', s2self: '两个滑杆选的是同一天，换一天再比。',
    s2order: ' 现在从高到低：{list}。',
    s2hint: '观察顺序：拖“第一天”“第二天”选两天，看虚线从矮长条的顶端拉到高长条上，橙色那一截的格数就是差。再按“从高到低排”，长条移动到新位置，第一名在最左边；两天一样多（周一、周五都是 12 本）时，按星期先后排。',

    s3k: '第 3 步 · 别被图骗',
    s3t: '纵轴不从 0 开始，图会让人看错吗？',
    s3e: '这一步要回答：同样的数，为什么有的图看起来差别特别大？条形图靠<strong>长条的长度</strong>表示多少，所以长条必须从 0 画起。左图纵轴从 0 开始；右图把纵轴的起点（叫<strong>起点</strong>，最底下那条线代表的本数）往上挪，长条下面一截被切掉了，只剩“比起点多出来的部分”。真实的本数一点没变，看起来的倍数却变了。纵轴底部的折线记号 ≈ 表示“这里省略了一段”。',
    baseSlider: '右图纵轴的起点（本）',
    c3a: '纵轴从 0 开始的条形图', c3b: '纵轴从别的数开始的条形图', c3left: '从 0 开始', c3right: '从 {b} 开始',
    s3lgHi: '最多的一天', s3lgLo: '最少的一天',
    s3readout: '真实情况：{dHi} {hi} 本，{dLo} {lo} 本，{dHi}是{dLo}的 {tr} 倍。左图两根长条长 {hi} 格和 {lo} 格，长度之比也是 {tr} 倍。右图从 {b} 开始，长条只剩 {lh} 格和 {ll} 格，看起来是 {sr}。',
    s3times: '{v} 倍', s3inf: '没法比：{dLo}的长条已经被切没了',
    s3vanish: ' 不超过 {b} 本的{days}，在右图里一点长条都看不见。',
    s3hint: '观察顺序：右图一开始从 5 开始，周三看起来是周二的 5 倍。先把起点拖回 0，再慢慢拖到 6：左图不动；右图里周二的长条越来越短，周三看起来是周二的 2.14 倍、2.33 倍、2.6 倍……到起点 6 时竟像 9 倍。拖到 7 以上，周二的长条消失了。以后看到长条图，先看纵轴从几开始。',

    s4k: '第 4 步 · 两组数据',
    s4t: '两周的数据画在一张图上，怎样比较？',
    s4e: '这一步要回答：第二周每天又记了一次，和第一周比起来怎么样？把同一天的两个数并排画成一对长条，用颜色区分是哪一周（颜色说明叫<strong>图例</strong>），这样的图叫<strong>复式条形图</strong>。比同一天：看一对长条谁高；比整体：看全部长条加起来。按“标出变化”，第二周的长条上会画一条第一周的高度线：比第一周多的那一截涂绿色，少的那一截画红色虚框。',
    daySel4: '看哪一天', marks4: '标出变化',
    s4lgW1: '第一周', s4lgW2: '第二周', s4lgUp: '比第一周多', s4lgDown: '比第一周少',
    c4a: '两周借书数量的复式条形图',
    s4readout: '{day}：第一周 {a} 本，第二周 {b} 本，{chg}。整周合计：第一周 {t1} 本，第二周 {t2} 本。第二周有 {up} 天比第一周多，{down} 天比第一周少。',
    s4up: '多了 {d} 本', s4down: '少了 {d} 本', s4same: '一样多',
    s4hint: '观察顺序：先拖“看哪一天”，一对一对比；再按“标出变化”，看绿色和红色各有几处。周一、周三第二周反而少了 2 本，可整周合计还是第二周多（55 本 → 60 本）：有几天少，不等于总数少。',

    s5k: '第 5 步 · 平均线',
    s5t: '在图上画一条横线，画在哪里能把高出的正好补到不足的地方？',
    s5e: '这一步要回答：五天借的书有多有少，平均每天借几本？在条形图上画一条横线：线上方长出来的部分（橙色）叫<strong>高出</strong>，线下方够不着线的空缺（虚线框）叫<strong>不足</strong>。如果把高出的部分剪下来，正好能填满不足的空缺，五根长条就一样高了，这条线的高度就是<strong>平均数</strong>：五天的总本数 ÷ 5（<a class="xlink" href="../averaging-leveling/#step1">→ 平均数（Claude Code 版）第 1 步：移多补少，倒成一样多</a>）。',
    hSlider: '横线画在几本',
    s5lgEx: '高出（线上方）', s5lgSh: '不足（线下方的空缺）', s5lgLine: '你画的横线',
    c5a: '条形图上的一条横线，以及线上高出、线下不足的部分',
    s5readout: '线画在 {h} 本：线上方高出的一共 {ex} 本，线下方不足的一共 {sh} 本。{verdict}',
    s5up: '高出的比不足的多，线还可以往上移。', s5down: '不足的比高出的多，线该往下移。', s5eq: '正好相等！这条线就是平均数：{total} ÷ 5 = {mean} 本。',
    s5hint: '观察顺序：从 5 本开始往上拖横线，看橙色高出越来越少、虚线不足越来越多。拖到 11 本时两边都是 6 本，这就是平均数 55 ÷ 5 = 11。注意平均数 11 不等于哪一天的本数，它是“匀一匀以后每天几本”。',

    s6k: '第 6 步 · 收束', s6t: '条形图：用长短说话',
    s6fin: '回顾一下。<strong>第 0 步</strong>：每个数画成一根长条，长度表示多少，竖着横着都一样。<strong>第 1 步</strong>：选刻度，让最长的放得下、差别又看得清。<strong>第 2 步</strong>：从矮长条顶上拉一条线，高出的那截就是差；重新排序能读出名次。<strong>第 3 步</strong>：长条必须从 0 画起，否则长短之比会骗人。<strong>第 4 步</strong>：两组数据并排画成复式条形图，用图例分清。<strong>第 5 步</strong>：高出和不足正好相等的那条横线就是平均数。',
    formula: '长条长度 = 数值 ÷ 每格代表的数\n相差 = 大数 − 小数\n平均数 = 总数 ÷ 个数',
    boundary: '注意：条形图适合比较几类东西各有多少（比如每天、每个班、每种水果）；要看一个量随时间连续怎样变化，常用折线图。本页的借书数据是为了讲道理编的，不是真实记录。',
    linksTitle: '接着去看',
    lk1: '→ 平均数（Claude Code 版）第 1 步：移多补少，倒成一样多',
    lk2: '→ 平面直角坐标系第 2 步：用一对数找到图上的点',
    lk3: '→ 平均数、中位数、众数第 0 步：同一组数的三种“平均”',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《条形图 · 让数字站成一排比高矮》的平行版本。'
  },
  en: {
    pageTitle: 'Bar Charts · Numbers Standing in a Row',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Bar Charts · Numbers Standing in a Row →',
    navLabel: 'Bar chart steps',
    tagline: 'A class reading corner wrote down how many books were borrowed on each school day of one week. In a row of numbers you have to compare them one by one; draw each number as a bar and “how many” becomes “how tall”, which you see at a glance. Seven steps: draw a bar chart, read one, and learn to spot a bar chart that is not playing fair.',
    nav0: '0 Numbers to bars', nav1: '1 Books per square', nav2: '2 How many more', nav3: '3 Where the axis starts', nav4: '4 Two weeks', nav5: '5 The mean line', nav6: '6 Wrap-up',
    d0: 'Mon', d1: 'Tue', d2: 'Wed', d3: 'Thu', d4: 'Fri',
    joinDays: ', ',
    rowDay: 'Day', rowBooks: 'Borrowed',

    s0k: 'Step 0 · From table to picture',
    s0t: 'Given a row of numbers, how can you see at a glance which day was busiest?',
    s0e: 'This step asks: how do you turn the five numbers in the table into a picture you can compare at a glance? A <strong>bar chart</strong> draws one bar of the same width for each number, and the length of the bar shows how big the number is: here each book is 1 square tall. The upright line marked 0, 5, 10 … is the <strong>vertical axis</strong>; it tells you how many books a bar reaches. The line along the bottom, with the days on it, is the <strong>horizontal axis</strong>. Bars can stand up or lie down; the length means the same thing either way.',
    daySlider: 'Pick a day', valSlider: 'Books borrowed that day',
    flip0: 'Upright ⇄ lying down', reset0: 'Restore the numbers',
    s0lgBar: 'books borrowed each day', s0lgSel: 'the day you are changing',
    c0a: 'Bar chart of books borrowed on five school days',
    s0readout: '{day}: {v} books, so the bar is {v} squares long. Busiest day this week: {maxDays} ({max} books); quietest: {minDays} ({min} books).',
    s0hint: 'What to try: drag “Books borrowed that day” and only the chosen bar (orange) grows or shrinks, and its number in the table changes too. Drag “Pick a day” to change a different bar. Press “Upright ⇄ lying down”: the bars fall on their side, but which is longer does not change. Changes here stay in this step; later steps use the original data.',

    s1k: 'Step 1 · Choosing a scale',
    s1t: 'How many books should one square on the axis stand for?',
    s1e: 'This step asks: if the page only has room for 10 squares, how many books should one square stand for? The gap between two neighbouring grid lines is <strong>one square</strong>, and how many books it stands for is the <strong>scale</strong>. The more books per square, the shorter the bar for the same number. At 1 book per square, bars over 10 books poke out of the top (the zigzag means they were cut off). At 10 books per square every bar is short and a gap of a couple of books almost disappears. A good scale fits the longest bar and still fills most of the chart.',
    unitSlider: 'Books per square',
    s1lgBar: 'books borrowed', s1lgCut: 'bar too tall for the chart (zigzag = cut off)',
    c1a: 'The same numbers drawn with different scales',
    s1readout: '{u} books per square → this chart reaches {top} books. The busiest day, {hiDay} ({hi} books), needs {tc} squares. {dA} ({vA} books) and {dB} ({vB} books) differ by {dv} books, only {dc} squares on the chart. {over}',
    s1over: '{n} days go over {top} books and poke out of the chart.',
    s1fit: 'All five bars fit.',
    s1hint: 'What to watch: drag “Books per square” from 1 to 10 and keep your eye on Tuesday and Thursday. At 1 book per square they differ by 2 squares; at 2, by 1 square; at 5, by only 0.4 of a square; at 10, by 0.2. Now look at Wednesday, the tallest: it does not fit at 1 book per square and takes 7.5 squares at 2, the best fit.',

    s2k: 'Step 2 · How many more',
    s2t: 'How do you read off the chart how many more books one day had than another?',
    s2e: 'This step asks: one bar is taller than another; by how much? Draw a dashed line across from the top of the shorter bar. The piece of the taller bar sticking out above the line (orange) is the <strong>difference</strong>: bigger number − smaller number. To see who came first, second and so on, <strong>re-order the bars from tallest to shortest</strong>: then the ranking reads left to right.',
    dayA: 'First day', dayB: 'Second day', sort2: 'Tallest first / weekday order',
    s2lgBar: 'books borrowed', s2lgDiff: 'the difference', s2lgLine: 'dashed line from the top of the shorter bar',
    c2a: 'Two days’ bars and the piece by which they differ',
    s2readout: '{dA} {a} books, {dB} {b} books: {res}{order}',
    s2more: '{dT} had {d} more than {dS} ({big} − {small} = {d}).', s2same: 'the two days are equal; the dashed line just touches both tops.', s2self: 'both sliders pick the same day; choose another to compare.',
    s2order: ' Tallest first: {list}.',
    s2hint: 'What to try: drag “First day” and “Second day” to pick two days. The dashed line runs from the shorter bar’s top across to the taller one, and the number of squares in the orange piece is the difference. Then press “Tallest first”: the bars slide to new places with the winner on the left. When two days tie (Monday and Friday both have 12) they keep weekday order.',

    s3k: 'Step 3 · Don’t be fooled',
    s3t: 'If the vertical axis does not start at 0, can the chart mislead you?',
    s3e: 'This step asks: why do some charts make the same numbers look wildly different? A bar chart shows amounts by the <strong>length of the bars</strong>, so the bars have to start at 0. The left chart starts at 0. The right chart moves the bottom line up (we call that number the axis <strong>start</strong>), so a piece is cut off the bottom of every bar and only the part above the start is left. The real numbers do not change at all, but how many times longer one bar looks does. The ≈ mark at the foot of the axis means “a piece is left out here”.',
    baseSlider: 'Right chart: axis starts at (books)',
    c3a: 'Bar chart with the axis starting at 0', c3b: 'Bar chart with the axis starting higher', c3left: 'starts at 0', c3right: 'starts at {b}',
    s3lgHi: 'busiest day', s3lgLo: 'quietest day',
    s3readout: 'The truth: {dHi} {hi} books, {dLo} {lo} books, so {dHi} is {tr} times {dLo}. On the left the bars are {hi} and {lo} squares long, also {tr} times. On the right, starting at {b}, they are only {lh} and {ll} squares long and look like {sr}.',
    s3times: '{v} times', s3inf: 'no comparison at all: {dLo}’s bar has been cut away',
    s3vanish: ' Days with no more than {b} books ({days}) have no bar at all on the right.',
    s3hint: 'What to watch: the right chart starts at 5, where Wednesday looks 5 times Tuesday. Drag the start back to 0, then slowly up to 6. The left chart stays put. On the right, Tuesday’s bar shrinks and Wednesday looks 2.14, then 2.33, then 2.6 times Tuesday’s size, until at 6 it looks 9 times as big. Past 7, Tuesday’s bar vanishes. Whenever you meet a bar chart, check where its axis starts.',

    s4k: 'Step 4 · Two sets of data',
    s4t: 'With two weeks on one chart, how do you compare them?',
    s4e: 'This step asks: the class counted again in week 2; how does it compare with week 1? Draw each day’s two numbers as a pair of bars side by side, coloured by week (the colour key is the <strong>legend</strong>). This is a <strong>double bar chart</strong>. To compare one day, see which bar of the pair is taller; to compare the weeks overall, add up all the bars. Press “Mark the changes” and each week-2 bar gets a line at week 1’s height: a gain is shaded green, a drop is outlined with a red dashed box.',
    daySel4: 'Day to look at', marks4: 'Mark the changes',
    s4lgW1: 'week 1', s4lgW2: 'week 2', s4lgUp: 'more than week 1', s4lgDown: 'fewer than week 1',
    c4a: 'Double bar chart of two weeks of borrowing',
    s4readout: '{day}: week 1 {a} books, week 2 {b} books, {chg}. Whole week: week 1 {t1} books, week 2 {t2}. Week 2 beat week 1 on {up} days and fell short on {down}.',
    s4up: '{d} more', s4down: '{d} fewer', s4same: 'no change',
    s4hint: 'What to try: drag “Day to look at” to compare one pair at a time, then press “Mark the changes” and count the green and red marks. On Monday and Wednesday week 2 actually had 2 fewer, yet the whole week still went up (55 → 60 books): a few lower days do not make a lower total.',

    s5k: 'Step 5 · The mean line',
    s5t: 'Where should a line across the chart go so that what sticks out above exactly fills the gaps below?',
    s5e: 'This step asks: some days had more, some fewer; how many books were borrowed per day on average? Draw a line across the bar chart. The parts of the bars above it (orange) are the <strong>surplus</strong>; the gaps between short bars and the line (dashed boxes) are the <strong>shortfall</strong>. If the surplus, cut off, exactly fills the shortfall, all five bars end up equally tall, and the height of that line is the <strong>mean</strong>: the week’s total ÷ 5 (<a class="xlink" href="../averaging-leveling/#step1">→ Averages (Claude Code edition), step 1: move from more to less until everything is level</a>).',
    hSlider: 'Line drawn at (books)',
    s5lgEx: 'surplus (above the line)', s5lgSh: 'shortfall (gaps below the line)', s5lgLine: 'your line',
    c5a: 'A line across the bar chart, with the surplus above and the shortfall below',
    s5readout: 'Line at {h} books: surplus above it {ex} books, shortfall below it {sh} books. {verdict}',
    s5up: 'More surplus than shortfall: the line can go up.', s5down: 'More shortfall than surplus: the line should come down.', s5eq: 'Exactly equal! This line is the mean: {total} ÷ 5 = {mean} books.',
    s5hint: 'What to try: start the line at 5 and drag it up. The orange surplus shrinks while the dashed shortfall grows. At 11 both are 6 books: that is the mean, 55 ÷ 5 = 11. Notice that 11 is not the count for any single day; it is how many per day after evening things out.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Bar charts speak in lengths',
    s6fin: 'Looking back. <strong>Step 0</strong>: each number becomes a bar whose length shows how many, upright or lying down. <strong>Step 1</strong>: pick a scale so the longest bar fits and differences still show. <strong>Step 2</strong>: draw a line from the shorter bar’s top; the piece sticking out is the difference, and re-ordering gives the ranking. <strong>Step 3</strong>: bars must start at 0, or the comparison of lengths lies. <strong>Step 4</strong>: two data sets side by side make a double bar chart, told apart by the legend. <strong>Step 5</strong>: the line where surplus equals shortfall is the mean.',
    formula: 'bar length = value ÷ amount per square\ndifference = bigger − smaller\nmean = total ÷ count',
    boundary: 'Keep in mind: bar charts are for comparing how much there is of a few separate things (each day, each class, each kind of fruit). To follow one quantity changing over time, a line graph is usually better. The borrowing numbers on this page are made up for teaching, not a real record.',
    linksTitle: 'Where to go next',
    lk1: '→ Averages (Claude Code edition), step 1: move from more to less until everything is level',
    lk2: '→ The coordinate plane, step 2: a pair of numbers finds a point on a chart',
    lk3: '→ Mean, median and mode, step 0: three kinds of “average” for the same numbers',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Bar Charts · Numbers Standing in a Row”.'
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
  if (typeof window.refreshBars === 'function') window.refreshBars();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BAR_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
