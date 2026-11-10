'use strict';
// Mean / median / mode lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '平均数、中位数、众数 · 谁来代表这组数',
    back: '← 知识索引',
    compare: '对照另一版本：平均数、中位数、众数之争 · 三个“平均”三个故事 →',
    navLabel: '平均数、中位数、众数步骤导航',
    tagline: '班上 11 位同学报出了自己上学路上要花几分钟。要用一个数来概括「我们上学一般要多久」，可以报平均数、中位数或众数，三个数却不一样大。七步里，你会看清每个数各自在「平衡」什么，看它们遇到一个特别远的同学时谁会被拉走，最后学会按问题挑合适的那一个。',
    nav0: '0 三个数', nav1: '1 平均数', nav2: '2 中位数', nav3: '3 众数', nav4: '4 极端值', nav5: '5 选哪个', nav6: '6 收束',

    s0k: '第 0 步 · 先看数据',
    s0t: '同一组数，为什么能说出三个不同的「一般」？',
    s0e: '这一步要回答：用一个数代表 11 位同学的上学时间，平均数、中位数、众数各是多少？数据（单位：分钟，示意数据）：8、10、12、12、12、15、15、18、20、25、60。下图每个点是一位同学，横轴是上学要花的分钟数，同样的数叠成一摞。<strong>平均数</strong> = 所有数加起来 ÷ 个数；<strong>中位数</strong> = 从小到大排好后，正中间那个数；<strong>众数</strong> = 出现次数最多的那个数。按下面三个按钮，一个一个求出来。',
    showMean: '求平均数', showMedian: '求中位数', showMode: '求众数', showNone: '全部收起',
    c0: '11 位同学上学要花的时间（分钟，每点一人）',
    lgMean: '平均数', lgMedian: '中位数', lgMode: '众数', lgDot: '一位同学',
    s0none: '还没求：按上面的按钮。',
    s0mean: '平均数 = (8 + 10 + 12 + 12 + 12 + 15 + 15 + 18 + 20 + 25 + 60) ÷ 11 = {sum} ÷ 11 ≈ {m} 分钟。',
    s0median: '中位数：11 个数排好后第 6 个，是 {md} 分钟（左右各 5 人）。',
    s0mode: '众数：12 出现 {c} 次，比别的数都多，所以众数是 {mo} 分钟。',
    s0below: '注意：11 人里有 {k} 人比平均数快。',
    s0hint: '观察顺序：先按「求平均数」，看橙线落在哪里：它的右边只有 3 个点，其中 60 那个点离得特别远。再按「求中位数」，看点从小到大依次点亮，停在第 6 个。最后按「求众数」，看最高的那一摞。三条线落在 12、15、18.8 三个位置。',

    s1k: '第 1 步 · 平均数在平衡什么',
    s1t: '支点放在哪里，这块跷跷板才能平？',
    s1e: '这一步要回答：平均数为什么会站在 18.8，而不是大多数人所在的 12 附近？把每位同学当成一个一样重的小球，放在一块刻着分钟数的跷跷板上，下面的三角是支点。每个小球离支点的距离，就像它的「力臂」：离得越远，压得越狠。左边各球到支点的距离加起来，叫<strong>左边距离和</strong>；右边同理。只有两边相等时跷跷板才平，而那个支点的位置，恰好就是平均数（<a class="xlink" href="../../../probability/basics/probability-distribution/#step1">→ 概率分布第 1 步：期望就是重心</a>）。这也是「移多补少」的另一种看法（<a class="xlink" href="../../../math/data/averaging-leveling/#step1">→ 平均数页第 1 步：移多补少</a>）。',
    fSlider: '支点位置（分钟）', findBalance: '让支点自己找平衡',
    c1a: '跷跷板：每个球是一位同学', c1b: '每位同学到支点的距离',
    lgLeft: '在支点左边', lgRight: '在支点右边', lgPivot: '支点',
    s1readout: '支点在 {f} 分钟：左边 {nl} 人，距离和 {L}；右边 {nr} 人，距离和 {R}。{state}',
    s1left: '左边重了 {d}，跷跷板向左倒。', s1right: '右边重了 {d}，跷跷板向右倒。', s1even: '两边一样，平了！支点就在平均数 {m}。',
    s1hint: '观察顺序：先把支点拖到 12（大多数人所在的地方）：左边只有 2 人、距离和 6；右边距离和 81，其中 60 那位一个人就占 48，跷跷板猛地向右倒。再按「让支点自己找平衡」，看支点慢慢挪到 18.8 才停。在平衡点，60 那位一个人的距离（41.2）比左边 8 个人的距离和（48.5）小不了多少。',

    s2k: '第 2 步 · 中位数在平衡什么',
    s2t: '画一条线，让两边人数一样多，线该画在哪？',
    s2e: '这一步要回答：中位数平衡的是什么？「按时间从短到长排队」那张图把 11 位同学排成一队，每根柱子是一人。「竖线两边各有几人」那张图是同样的点，加一条可以拖动的竖线。<strong>中位数</strong>就是让线左边、右边人数一样多的位置：平均数平衡的是「距离」，中位数平衡的是「人数」，所以它不在乎最远的人到底有多远。个数是奇数时，中位数是正中间那一个数；个数是偶数时，正中间有两个数，中位数取这两个数的平均。',
    cSlider: '竖线位置（分钟）', toggle10: '去掉最远的同学（剩 10 人）', toggle11: '把最远的同学放回来（11 人）',
    c2a: '按时间从短到长排队（每根柱一人）', c2b: '竖线两边各有几人',
    lgMid: '正中间的人', lgLine: '你拖的竖线', lgLineLeft: '在竖线左边', lgLineRight: '在竖线右边',
    s2readout: '{n} 人：线在 {c} 分钟，左边 {l} 人、线上 {on} 人、右边 {r} 人。{state}',
    s2odd: '{n} 是奇数，中位数是排第 {k} 的那个数：{md} 分钟。',
    s2even: '{n} 是偶数，中位数是第 {k1}、{k2} 个数的平均：({a} + {b}) ÷ 2 = {md} 分钟。',
    s2hint: '观察顺序：把竖线从左往右慢慢拖，看左右人数怎么变；拖到 15 时，左边 5 人、右边 4 人、线上 2 人，正好把第 6 个人压在线上。再按「去掉最远的同学」：剩 10 人，正中间变成第 5、6 两个人（12 和 15），中位数变成 13.5；平均数则从 18.8 一下掉到 14.7。',

    s3k: '第 3 步 · 众数',
    s3t: '鞋店进货，最该多进哪个尺码？',
    s3e: '这一步要回答：什么时候「出现最多的那个」比「平均」更有用？一家鞋店统计了上周卖出的 24 双鞋各是几码，柱子越高，那个码卖得越多。<strong>众数</strong>就是最高那根柱子对应的值。它有两个特点：第一，众数一定是真实出现过的值，而平均数常常不是（平均鞋码 37.3 码，商店里根本没有这个码）；第二，数据不是数字时（比如最喜欢的运动），平均数和中位数都没法算，只有众数还能用。众数也可能不止一个（几根柱子一样高）。本页约定：如果每个值都只出现一次，就说「没有众数」（也有书把「每个值出现的次数都一样」都算作没有众数）。',
    pick3: '选一个值', add3: '加一个', remove3: '减一个', reset3: '恢复原数据', kindShoes: '数据：鞋码', kindSports: '数据：最喜欢的运动',
    c3: '每个值出现了几次',
    sport_basketball: '篮球', sport_football: '足球', sport_rope: '跳绳', sport_pingpong: '乒乓球',
    lgBar: '出现次数', lgTop: '众数（最高的柱）',
    s3shoes: '共 {n} 双：众数 {mo}；平均数 {m} 码；中位数 {md} 码。',
    s3sports: '共 {n} 人：众数 {mo}。平均数、中位数：不能算，这些不是数，没法相加，也没法从小排到大。',
    s3none: '没有（每个值都只出现一次）', s3empty: '没有数据', s3and: '和', s3unit: '码',
    s3hint: '观察顺序：先看原始数据：37 码最高，众数 37，而平均数是 37.3 码。选 38 码按几次「加一个」，到和 37 一样高时，众数变成两个；再多一个，众数就换成 38。切到「最喜欢的运动」，看平均数、中位数为什么都算不了。改动只在本步有效，「恢复原数据」随时回到开头。',

    s4k: '第 4 步 · 极端值',
    s4t: '有位同学家越搬越远，三个数谁会跟着跑？',
    s4e: '这一步要回答：改动一位同学的数，三个数各变多少？<strong>极端值</strong>是比其他数大得多或小得多的数，比如那位要花 60 分钟的同学。下图横轴是你改动的那位同学的上学时间，三条线是改动后的平均数、中位数、众数；竖线是你现在选的值。先改最远的那位，再改排在正中间的那位，对比一下。',
    who4: '改动谁', whoFar: '最远的那位（原来 60 分钟）', whoMid: '排在正中间的那位（原来 15 分钟）', vSlider: '这位同学的上学时间（分钟）',
    c4: '改动一位同学后，三个数怎么变',
    s4readout: '{who}改成 {v} 分钟：平均数 {m}，中位数 {md}，众数 {mo}。',
    s4far: '最远的那位', s4mid: '正中间那位',
    s4hint: '观察顺序：选「最远的那位」，把他从 25 分钟拖到 120 分钟：橙线（平均数）一路斜着往上爬，每多 11 分钟就多 1 分钟，到 120 时变成 24.3；青线（中位数）一直是 15，绿点（众数）一直是 12。再选「排在正中间的那位」，从 0 拖到 60：这回中位数也会动，不过只在 12 到 15 之间跟着走，因为他一旦越过邻居，正中间就换成了别人。所以中位数不是「什么都不怕」，它只是不在乎两头的人离得多远。',

    s5k: '第 5 步 · 选哪个',
    s5t: '三个问题，各该报哪个数？',
    s5e: '这一步要回答：既然三个数都叫「一般」，具体报哪个？要看问题在问什么。想知道「总共有多少」，只有平均数能用：平均数 × 人数 = 总数，其他两个都没有这个关系。想知道「最常见的是什么」，用众数。想知道「排在中间的人是什么样」，又不想被少数特别大或特别小的数带偏，用中位数。下面三个情景，先自己选，再核对。这些是常用的经验做法，不是唯一正确答案。',
    sc1: '情景 1：通勤', sc2: '情景 2：鞋店', sc3: '情景 3：读书',
    q1: '新同学问：「咱们班同学上学一般要多久？」你想让他对大多数人的情况心里有数，报哪个数？',
    q2: '鞋店老板问：「下一批货，哪个码要进得最多？」',
    q3: '老师想估计「全班 11 人这周一共读了多少页」，只知道一个代表数，该用哪个？',
    optMean: '平均数', optMedian: '中位数', optMode: '众数', check: '核对',
    c5: '这个情景的数据',
    s5data1: '数据：上学时间（分钟）8、10、12、12、12、15、15、18、20、25、60。平均数 {m}，中位数 {md}，众数 {mo}。',
    s5data2: '数据：上周卖出的 24 双鞋的码数。平均数 {m}，中位数 {md}，众数 {mo}。',
    s5data3: '数据：11 人这周读的页数 40、55、60、60、72、80、85、90、96、110、150，总数 {total}。平均数 {m}，中位数 {md}，众数 {mo}。',
    fb1Good: '合适。中位数 15 分钟：一半同学不超过它，也不会被那位 60 分钟的同学拉高。平均数 18.8 比 11 人里的 8 人都慢，会让人以为路更远。',
    fb1Bad: '再想想：平均数 18.8 被那位 60 分钟的同学拉高了，11 人里有 8 人比它快；众数 12 只说明「最常见」，不代表中间的人。哪个数能说「一半人不超过它」？',
    fb2Good: '合适。进货要看哪个码最多人买，就是众数 37。平均数 37.3 码根本不存在。',
    fb2Bad: '再想想：老板要的是「最多人穿的码」。平均数 37.3 码商店里没有；中位数说的是排在中间的人，不是买的人最多的码。',
    fb3Good: '合适。平均数 × 人数 = 总数：81.6 × 11 ≈ 898 页，正好是全班的总页数。',
    fb3Bad: '再想想：用中位数 80 乘 11 得 880，用众数 60 乘 11 得 660，都不等于真正的总数 898。哪个数乘人数一定等于总数？',
    s5hint: '观察顺序：先点情景按钮看数据和三条线，再选一个答案按「核对」。换情景会清掉上一次的选择和反馈。',

    s6k: '第 6 步 · 收束', s6t: '一组数，三种「一般」',
    s6fin: '回顾这条线。<strong>第 0 步</strong>：平均数 = 总和 ÷ 个数，中位数 = 排好后正中间的数，众数 = 出现最多的数。<strong>第 1 步</strong>：平均数是让两边距离和相等的平衡点，远的数「压得更狠」。<strong>第 2 步</strong>：中位数是让两边人数相等的分界线，偶数个时取中间两数的平均。<strong>第 3 步</strong>：众数一定是出现过的值，数据不是数字时也能用，可能不止一个。<strong>第 4 步</strong>：极端值会把平均数拉走，中位数和众数不怎么动。<strong>第 5 步</strong>：要总数用平均数，要最常见用众数，要中间的人又怕被极端值带偏就用中位数。',
    try6: '试试你自己的数据（2–30 个数，用空格或逗号隔开）', calc6: '算一算',
    s6default: '例如：一周每天睡了几小时，或者一个小组的身高。',
    s6result: '{n} 个数：平均数 {m}，中位数 {md}，众数 {mo}。{rel}',
    s6relUp: '平均数比中位数大不少：可能有几个特别大的数把平均数拉高了。',
    s6relDown: '平均数比中位数小不少：可能有几个特别小的数把平均数拉低了。',
    s6relEq: '平均数和中位数差不多：两头大致对称。',
    s6errNan: '有不是数字的内容，请只输入数字，用空格或逗号隔开。',
    s6errCount: '请输入 2 到 30 个数。',
    boundary: '适用范围：本页数据都是为了讲解编出来的示意数据。「差不少」用的是一个粗略标准：平均数与中位数相差超过数据范围（最大减最小）的 10%。连续测量的数据（比如身高精确到毫米）几乎不会有重复值，要先分组（比如每 5 厘米一组）才谈得上众数。第 5 步的选择是常用经验，不是规定。',
    linksTitle: '接着去哪',
    lk1: '→ 平均数页第 4 步：极端值怎样拉动平均数',
    lk2: '→ 条形统计图第 3 步：在图上画出平均线',
    lk3: '→ 概率分布第 1 步：期望就是重心',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《平均数、中位数、众数之争 · 三个“平均”三个故事》的平行版本。'
  },
  en: {
    pageTitle: 'Mean, Median, Mode · Who Speaks for the Data?',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Mean, Median, Mode · Three “Averages”, Three Stories →',
    navLabel: 'Mean, median and mode steps',
    tagline: 'Eleven classmates each said how many minutes their trip to school takes. To sum up “how long does it usually take us” in one number, you could give the mean, the median or the mode, and the three are not the same. Over seven steps you will see what each one balances, watch which one gets dragged away when one classmate lives very far away, and learn to pick the right one for the question being asked.',
    nav0: '0 Three numbers', nav1: '1 Mean', nav2: '2 Median', nav3: '3 Mode', nav4: '4 Extreme values', nav5: '5 Which one?', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Look at the data',
    s0t: 'One set of numbers, three different “typical” values. How?',
    s0e: 'This step asks: if one number has to stand for the 11 commute times, what are the mean, the median and the mode? The data (minutes, made up for this lesson): 8, 10, 12, 12, 12, 15, 15, 18, 20, 25, 60. In the chart each dot is one classmate, the horizontal axis is minutes, and equal values stack up. The <strong>mean</strong> = add everything up ÷ how many there are. The <strong>median</strong> = the middle value once they are sorted from smallest to largest. The <strong>mode</strong> = the value that appears most often. Use the three buttons to find them one at a time.',
    showMean: 'Find the mean', showMedian: 'Find the median', showMode: 'Find the mode', showNone: 'Hide all',
    c0: 'Minutes to get to school, 11 classmates (one dot each)',
    lgMean: 'mean', lgMedian: 'median', lgMode: 'mode', lgDot: 'one classmate',
    s0none: 'Nothing found yet: press a button above.',
    s0mean: 'Mean = (8 + 10 + 12 + 12 + 12 + 15 + 15 + 18 + 20 + 25 + 60) ÷ 11 = {sum} ÷ 11 ≈ {m} minutes.',
    s0median: 'Median: the 6th of the 11 sorted values, {md} minutes (5 people on each side).',
    s0mode: 'Mode: 12 appears {c} times, more than any other value, so the mode is {mo} minutes.',
    s0below: 'Notice: {k} of the 11 classmates are quicker than the mean.',
    s0hint: 'What to try: press “Find the mean” first and see where the orange line lands: only 3 dots are to its right, and the one at 60 is very far out. Then press “Find the median” and watch the dots light up from smallest to largest, stopping at the 6th. Finally press “Find the mode” and look for the tallest stack. The three lines land at 12, 15 and 18.8.',

    s1k: 'Step 1 · What the mean balances',
    s1t: 'Where must the pivot go for the seesaw to balance?',
    s1e: 'This step asks: why does the mean sit at 18.8 instead of near 12, where most people are? Picture each classmate as an identical ball on a seesaw marked in minutes, with the triangle underneath as the pivot. Each ball’s distance from the pivot works like a lever arm: the farther out, the harder it pushes down. Add up the distances of all balls on the left of the pivot to get the <strong>left distance total</strong>; same on the right. The seesaw only balances when the two totals are equal, and that pivot position is exactly the mean (<a class="xlink" href="../../../probability/basics/probability-distribution/#step1">→ Probability distributions, step 1: the mean is the balance point</a>). It is another way to see “move from the full to the empty” (<a class="xlink" href="../../../math/data/averaging-leveling/#step1">→ Averages, step 1: levelling out</a>).',
    fSlider: 'Pivot position (minutes)', findBalance: 'Let the pivot find balance',
    c1a: 'The seesaw: each ball is one classmate', c1b: 'Each classmate’s distance to the pivot',
    lgLeft: 'left of the pivot', lgRight: 'right of the pivot', lgPivot: 'pivot',
    s1readout: 'Pivot at {f} minutes: {nl} on the left, distance total {L}; {nr} on the right, distance total {R}. {state}',
    s1left: 'The left is heavier by {d}, so the seesaw tips left.', s1right: 'The right is heavier by {d}, so the seesaw tips right.', s1even: 'Both sides match: balanced! The pivot sits at the mean, {m}.',
    s1hint: 'What to try: drag the pivot to 12 (where most people are). The left has only 2 people with a distance total of 6; the right totals 81, and the 60-minute classmate alone contributes 48 of it, so the seesaw slams down to the right. Then press “Let the pivot find balance” and watch it creep to 18.8 before it stops. At the balance point, that one classmate’s distance (41.2) is not much less than the left side’s total for 8 people (48.5).',

    s2k: 'Step 2 · What the median balances',
    s2t: 'Draw a line with as many people on each side. Where does it go?',
    s2e: 'This step asks: what does the median balance? The chart “Lined up from shortest to longest” puts the 11 classmates in a row, one bar per person. The chart “How many people on each side of the line” shows the same dots with a vertical line you can drag. The <strong>median</strong> is where the line has as many people on its left as on its right. The mean balances distances; the median balances head counts, so it does not care how far away the farthest person is. With an odd count, the median is the single middle value; with an even count there are two middle values, and the median is their average.',
    cSlider: 'Line position (minutes)', toggle10: 'Remove the farthest classmate (10 left)', toggle11: 'Bring the farthest classmate back (11)',
    c2a: 'Lined up from shortest to longest (one bar per person)', c2b: 'How many people on each side of the line',
    lgMid: 'the middle person', lgLine: 'the line you drag', lgLineLeft: 'left of the line', lgLineRight: 'right of the line',
    s2readout: '{n} people: line at {c} minutes, {l} on the left, {on} on the line, {r} on the right. {state}',
    s2odd: '{n} is odd, so the median is the value in position {k}: {md} minutes.',
    s2even: '{n} is even, so the median is the average of positions {k1} and {k2}: ({a} + {b}) ÷ 2 = {md} minutes.',
    s2hint: 'What to try: drag the line slowly from left to right and watch the counts change. At 15 there are 5 on the left, 4 on the right and 2 on the line, so the 6th person is pinned on it. Then press “Remove the farthest classmate”: with 10 people the middle is now positions 5 and 6 (12 and 15), so the median becomes 13.5, while the mean drops from 18.8 all the way to 14.7.',

    s3k: 'Step 3 · The mode',
    s3t: 'Restocking a shoe shop: which size should you order most of?',
    s3e: 'This step asks: when is “the one that shows up most” more useful than an average? A shoe shop recorded the sizes of the 24 pairs it sold last week; the taller the bar, the more of that size sold. The <strong>mode</strong> is the value under the tallest bar. It has two useful features. First, the mode is always a value that actually occurred, while the mean often is not (the mean size is 37.3, which no shop stocks). Second, when the data are not numbers (say, favourite sports), the mean and the median cannot be computed at all, but the mode still works. There can be more than one mode (several bars equally tall). This page’s convention: if every value appears exactly once, there is “no mode” (some textbooks also say there is no mode whenever every value appears the same number of times).',
    pick3: 'Pick a value', add3: 'Add one', remove3: 'Remove one', reset3: 'Restore the data', kindShoes: 'Data: shoe sizes', kindSports: 'Data: favourite sport',
    c3: 'How many times each value appears',
    sport_basketball: 'basketball', sport_football: 'football', sport_rope: 'skipping', sport_pingpong: 'table tennis',
    lgBar: 'count', lgTop: 'mode (tallest bar)',
    s3shoes: '{n} pairs: mode {mo}; mean size {m}; median size {md}.',
    s3sports: '{n} people: mode {mo}. Mean and median: cannot be computed, because these are not numbers; you cannot add them up or sort them from small to large.',
    s3none: 'none (every value appears once)', s3empty: 'no data', s3and: 'and', s3unit: '',
    s3hint: 'What to try: start with the original data. Size 37 is tallest, so the mode is 37, while the mean is 37.3. Pick size 38 and press “Add one” a few times: when it ties with 37 there are two modes; one more and the mode switches to 38. Switch to “favourite sport” and see why the mean and median cannot be computed. Changes only affect this step; “Restore the data” takes you back to the start.',

    s4k: 'Step 4 · Extreme values',
    s4t: 'A classmate keeps moving farther away. Which of the three follows?',
    s4e: 'This step asks: if you change one classmate’s number, how much does each measure change? An <strong>extreme value</strong> is one much bigger or much smaller than the rest, like the classmate who needs 60 minutes. In the chart the horizontal axis is the commute time of the classmate you are changing, and the three lines show the mean, median and mode after the change; the vertical line marks the value you have chosen. Change the farthest classmate first, then the one in the middle, and compare.',
    who4: 'Who to change', whoFar: 'The farthest one (60 minutes now)', whoMid: 'The one in the middle (15 minutes now)', vSlider: 'This classmate’s commute (minutes)',
    c4: 'After changing one classmate, how the three measures move',
    s4readout: '{who} set to {v} minutes: mean {m}, median {md}, mode {mo}.',
    s4far: 'The farthest classmate', s4mid: 'The middle classmate',
    s4hint: 'What to try: choose “the farthest one” and drag from 25 to 120 minutes. The orange mean line climbs steadily, 1 minute for every 11, reaching 24.3 at 120; the cyan median stays at 15 and the green mode dots stay at 12. Then choose “the one in the middle” and drag from 0 to 60. Now the median moves too, but only between 12 and 15, because once this classmate passes a neighbour, someone else becomes the middle person. So the median is not immune to everything; it just ignores how far out the people at the ends are.',

    s5k: 'Step 5 · Which one?',
    s5t: 'Three questions: which number answers each?',
    s5e: 'This step asks: if all three are “typical”, which one do you report? It depends on what is being asked. To get at a total, only the mean works: mean × count = total, and neither of the others has that property. To know the most common value, use the mode. To describe the person in the middle without being thrown off by a few very large or very small values, use the median. Choose for each scenario below, then check. These are common rules of thumb, not the only correct answers.',
    sc1: 'Scenario 1: commute', sc2: 'Scenario 2: shoe shop', sc3: 'Scenario 3: reading',
    q1: 'A new classmate asks: “How long does it usually take people here to get to school?” You want them to get a feel for most people. Which number?',
    q2: 'The shop owner asks: “For the next order, which size should I buy the most of?”',
    q3: 'The teacher wants to estimate how many pages all 11 students read this week in total, knowing only one summary number. Which one?',
    optMean: 'mean', optMedian: 'median', optMode: 'mode', check: 'Check',
    c5: 'The data for this scenario',
    s5data1: 'Data: commute minutes 8, 10, 12, 12, 12, 15, 15, 18, 20, 25, 60. Mean {m}, median {md}, mode {mo}.',
    s5data2: 'Data: sizes of the 24 pairs sold last week. Mean {m}, median {md}, mode {mo}.',
    s5data3: 'Data: pages read this week by 11 students: 40, 55, 60, 60, 72, 80, 85, 90, 96, 110, 150; total {total}. Mean {m}, median {md}, mode {mo}.',
    fb1Good: 'Good choice. The median, 15 minutes: half the class takes no longer than that, and the 60-minute classmate does not pull it up. The mean, 18.8, is slower than 8 of the 11 people and would make the trip sound longer.',
    fb1Bad: 'Think again: the mean, 18.8, is pulled up by the 60-minute classmate, and 8 of the 11 are quicker than it; the mode, 12, only says what is most common, not what the middle person does. Which number lets you say “half the class takes no longer than this”?',
    fb2Good: 'Good choice. Ordering depends on which size the most people buy: the mode, 37. A size of 37.3 does not exist.',
    fb2Bad: 'Think again: the owner wants the size most customers wear. No shop stocks size 37.3, and the median describes the person in the middle, not the size bought most often.',
    fb3Good: 'Good choice. Mean × count = total: 81.6 × 11 ≈ 898 pages, exactly the class total.',
    fb3Bad: 'Think again: the median, 80, times 11 gives 880, and the mode, 60, times 11 gives 660; neither equals the real total of 898. Which number always gives the total when multiplied by the count?',
    s5hint: 'What to try: press a scenario button to see its data and the three lines, then pick an answer and press “Check”. Switching scenarios clears the previous choice and feedback.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One set of numbers, three kinds of “typical”',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: mean = total ÷ count, median = the middle value once sorted, mode = the most frequent value. <strong>Step 1</strong>: the mean is the balance point where the distance totals on both sides match, and far-out values push harder. <strong>Step 2</strong>: the median is the dividing line with equal head counts on both sides; with an even count, average the two middle values. <strong>Step 3</strong>: the mode is always a value that occurred, works even when the data are not numbers, and can come in more than one. <strong>Step 4</strong>: extreme values drag the mean away while the median and mode barely move. <strong>Step 5</strong>: for totals use the mean, for the most common value use the mode, and for the middle person, when extremes might mislead, use the median.',
    try6: 'Try your own data (2–30 numbers, separated by spaces or commas)', calc6: 'Calculate',
    s6default: 'For example: hours slept each night this week, or the heights in a group.',
    s6result: '{n} numbers: mean {m}, median {md}, mode {mo}. {rel}',
    s6relUp: 'The mean is well above the median: a few very large values may be pulling it up.',
    s6relDown: 'The mean is well below the median: a few very small values may be pulling it down.',
    s6relEq: 'The mean and median are close: the two ends are roughly balanced.',
    s6errNan: 'Something there is not a number. Please type only numbers, separated by spaces or commas.',
    s6errCount: 'Please enter between 2 and 30 numbers.',
    boundary: 'Scope: all data on this page are made up for teaching. “Well above/below” uses a rough rule: the mean and median differ by more than 10% of the range (largest minus smallest). Continuous measurements (heights to the millimetre, say) almost never repeat exactly, so they need grouping first (for example in 5 cm bands) before a mode makes sense. The choices in step 5 are common practice, not rules.',
    linksTitle: 'Where to go next',
    lk1: '→ Averages, step 4: how an extreme value drags the mean',
    lk2: '→ Bar charts, step 3: drawing the mean line on a chart',
    lk3: '→ Probability distributions, step 1: the mean is the balance point',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Mean, Median, Mode · Three “Averages”, Three Stories”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang] && key in STRINGS[lang] ? STRINGS[lang][key] : key in STRINGS.en ? STRINGS.en[key] : key;
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
  document.querySelectorAll('[data-i18n-ph]').forEach(node => { node.setAttribute('placeholder', t(node.dataset.i18nPh)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshMMM === 'function') window.refreshMMM();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MMM_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
