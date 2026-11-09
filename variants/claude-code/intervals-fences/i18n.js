'use strict';
// Intervals & fences strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '间隔与植树 · 先数段，再看两头',
    back: '← 知识索引',
    compare: '对照另一版本：间隔与植树 · 段数和点数差一 →',
    navLabel: '间隔与植树步骤导航',
    tagline: '围栏要几根柱子、路边能种几棵树、木头锯几刀、钟敲几下要几秒，都是同一个问题：一排「点」把一条线分成几「段」。先数清段数，再看两头的点算不算，就不会差一。',
    nav0: '0 柱子与栏板', nav1: '1 路长 ÷ 间隔', nav2: '2 两头种不种', nav3: '3 锯木头', nav4: '4 钟声与楼梯', nav5: '5 倒过来算', nav6: '6 收束',

    s0k: '第 0 步 · 点和段',
    s0t: '装 5 块栏板，要几根柱子？',
    s0e: '这一步要回答：一排栏板，每两根柱子之间夹一块，柱子和栏板哪个多、多几个？这里柱子是<strong>点</strong>（只占一个位置），栏板是<strong>段</strong>（两个相邻的点之间的那一截，也叫<strong>间隔</strong>）。数的办法是「配对」：让每块栏板认领它<strong>左边</strong>那根柱子，看最后有没有柱子落单。',
    c0a: '一排围栏：柱子和栏板配对',
    c0title: '每块栏板认领左边的柱子',
    lgPanel: '栏板（段）', lgClaimed: '已被认领的柱子和栏板', lgSpare: '没被认领的柱子',
    n0: '栏板块数', pair0: '逐块配对',
    spareTag: '落单的这一根',
    s0progress: '正在配对：已配好 {k}/{n} 块栏板。',
    s0readout: '{n} 块栏板认领了 {n} 根柱子，最右边的第 {last} 根没有栏板认领，所以柱子一共 {n} + 1 = {p} 根。',
    s0hint: '观察顺序：先按「逐块配对」，看青色连线一块一块把栏板和左边的柱子连起来；最后橙色的那根柱子没人认领。再拖「栏板块数」：不管几块，落单的总是最右边那一根，所以柱子总比栏板多 1。',

    s1k: '第 1 步 · 先求段数',
    s1t: '24 米的路，每隔 4 米种一棵树，两头都种，种几棵？',
    s1e: '这一步要回答：路长和间隔都知道时，怎样不画图就算出树的棵数？<strong>间隔</strong>就是相邻两棵树之间的距离，也就是一<strong>段</strong>的长度。路长里有几个间隔，就有几段：<strong>段数 = 路长 ÷ 间隔</strong>。<strong>两头都种</strong>是说路的起点和终点上都有一棵树，这时树就像上一步的柱子，段就像栏板：<strong>棵数 = 段数 + 1</strong>。这条规则要求路长正好是间隔的整数倍，否则最后一段会比别的短。',
    c1a: '一条路上按间隔种树',
    c1title: '路长 {L} 米，每隔 {d} 米一棵',
    lgTree: '树（点）', lgGap: '一段（相邻两树之间）', lgRest: '不够一个间隔的剩余',
    L1: '路长', d1: '间隔（相邻两棵树的距离）',
    meters: '{v} 米', unitM: '米',
    restTag: '剩 {r} 米',
    s1readout: '段数 = 路长 ÷ 间隔 = {L} ÷ {d} = {g} 段；两头都种，棵数 = 段数 + 1 = {g} + 1 = {n} 棵。图上的树从 1 数到 {n}，正好对得上。',
    s1bad: '{L} ÷ {d} 不是整数：放下 {g} 个整间隔后还剩 {r} 米（粉色虚线），终点那一棵和前一棵只隔 {r} 米。这种情况下「间隔都相等」做不到，本页的公式不适用。',
    s1hint: '观察顺序：先保持路长 24 米，把间隔从 4 拖到 2、再拖到 8，看树变密或变稀，彩条（段）的数目和读数的「段数」一起变。再改路长：当路长不是间隔的倍数时，末尾出现粉色虚线的剩余，读数会提醒公式不适用。',

    s2k: '第 2 步 · 两头的点',
    s2t: '两头不都种，或者路围成一圈，棵数还是「段数 + 1」吗？',
    s2e: '这一步要回答：段数不变时，两端的处理怎样改变棵数？路长固定 24 米，<strong>段数 = 24 ÷ 间隔</strong>，四种种法都一样。不同的只是两端：<strong>两头都种</strong>（起点、终点都种）、<strong>只种一头</strong>（起点不种，终点种）、<strong>两头都不种</strong>（起点、终点都空着），以及<strong>围成一圈</strong>（路首尾相接，比如花坛一周，起点和终点是同一个位置）。粉色虚线圈是比「两头都种」少掉的那棵。',
    c2a: '四种种法下树的位置',
    c2title: '{mode} · 路长 24 米 · 间隔 {d} 米',
    lgRemoved: '比「两头都种」少掉的树',
    modeGroup: '种法', modeBoth: '两头都种', modeOne: '只种一头', modeNone: '两头都不种', modeLoop: '围成一圈',
    mode_both: '两头都种', mode_one: '只种一头', mode_none: '两头都不种', mode_loop: '围成一圈',
    d2: '间隔（24 的约数）',
    startEnd: '第 1 棵 · 起点 = 终点',
    thMode: '种法', thGaps: '段数', thTrees: '棵数', thDiff: '棵数 − 段数',
    s2readout: '{mode}：24 米分成 {g} 段，种 {n} 棵，棵数 − 段数 = {diff}。{why}',
    why_both: '起点和终点各有一棵，比段数多 1。',
    why_one: '起点空着，每段正好配它右端的一棵，棵数 = 段数。',
    why_none: '两端都空着，比「两头都种」少 2 棵，比段数少 1。',
    why_loop: '首尾接成一圈，终点那棵就是起点那棵，不能数两次，棵数 = 段数。',
    s2hint: '观察顺序：间隔先不动，依次按四个种法按钮，看哪棵树变成粉色虚线圈、表格里多出一行；四行都点过后比较最后一列。再拖间隔：段数和棵数都变，但最后一列（+1、0、−1、0）不变——它只取决于两头。',

    s3k: '第 3 步 · 锯木头',
    s3t: '把一根木头锯成 5 段，每锯一刀 3 分钟，一共要几分钟？',
    s3e: '这一步要回答：锯木头时要数的是刀数还是段数？每一刀锯出一个<strong>切口</strong>，切口是点，木段是段。木头的两头本来就是断开的，不用锯，所以它相当于「两头都不种」：<strong>刀数 = 段数 − 1</strong>，时间 = 刀数 × 每刀用时。',
    c3a: '一根木头被一刀一刀锯开，下方是用时',
    c3title: '目标：锯成 {k} 段（虚线是还没锯的位置）',
    lgPiece: '木段', lgCut: '已锯的切口 / 用掉的时间', lgWrong: '把段数当刀数时多算的时间',
    k3: '要锯成几段', per3: '每锯一刀用时',
    pieces: '{v} 段', minutes: '{v} 分钟', unitMin: '分',
    cut3: '锯一刀', all3: '一口气锯完', reset3: '换一根整木头',
    c3rowA: '实际：锯了 {c} 刀，用时 {m} 分钟',
    c3rowB: '错误算法：{k} 段 × 每刀 = {m} 分钟',
    s3progress: '已锯 {c} 刀，木头现在是 {p} 段（目标 {k} 段），用时 {m} 分钟。',
    s3readout: '锯成 {k} 段只要 {c} 刀：{c} × {per} = {m} 分钟。把段数当刀数会算成 {w} 分钟，多出的正是最后那一刀——它根本不用锯。',
    s3hint: '观察顺序：按「锯一刀」，每按一次多一个橙色切口、多一段木头，下方橙色时间条也多一格；锯完时橙色条比粉色虚线框（错误算法）正好短一格。再改「要锯成几段」重新来，短的总是一格。',

    s4k: '第 4 步 · 钟声与楼梯',
    s4t: '钟敲 3 下用 6 秒，敲 6 下用几秒？',
    s4e: '这一步要回答：用时只花在「两次之间」时，怎样从已知推出未知？钟声：从第 1 下响起到最后一下响起，用时都花在两下之间的<strong>间隔</strong>上；敲 a 下只有 a − 1 个间隔。楼梯：从 1 楼走到 a 楼，要走 a − 1 段楼梯（每段楼梯连接相邻两层）。先求<strong>每个间隔的用时 = 已知用时 ÷ 已知间隔数</strong>，再乘新的间隔数。这里假设每个间隔用时相同。',
    scGroup: '情景', scClock: '敲钟', scStairs: '爬楼梯',
    c4a: '已知和要求的两排间隔，共用同一条时间轴',
    lg4strike: '一次钟声（点）', lg4floor: '到达一层（点）', lg4gap: '一个间隔的用时', lg4wrong: '按次数成比例算出的错误时间',
    a4clock: '已知：敲了几下', a4stairs: '已知：从 1 楼走到几楼', b4clock: '要问：敲几下', b4stairs: '要问：从 1 楼走到几楼',
    T4: '已知的用时', seconds: '{v} 秒', unitS: '秒',
    c4knownClock: '已知：敲 {a} 下 = {g} 个间隔，共 {T} 秒（每个 {p} 秒）',
    c4knownStairs: '已知：1 楼到 {a} 楼 = {g} 段楼梯，共 {T} 秒（每段 {p} 秒）',
    c4askClock: '要问：敲 {b} 下 = {g} 个间隔 → {s} 秒',
    c4askStairs: '要问：1 楼到 {b} 楼 = {g} 段楼梯 → {s} 秒',
    c4wrong: '错误算法：{w} 秒',
    s4readoutClock: '敲 {a} 下只有 {ga} 个间隔，每个间隔 {T} ÷ {ga} = {p} 秒；敲 {b} 下有 {gb} 个间隔，用时 {gb} × {p} = {s} 秒（橙色竖线）。若按「下数」成比例算成 {T} ÷ {a} × {b} = {w} 秒（粉色虚线），{cmp}',
    s4readoutStairs: '1 楼到 {a} 楼只有 {ga} 段楼梯，每段 {T} ÷ {ga} = {p} 秒；1 楼到 {b} 楼有 {gb} 段，用时 {gb} × {p} = {s} 秒（橙色竖线）。若按「楼层数」成比例算成 {T} ÷ {a} × {b} = {w} 秒（粉色虚线），{cmp}',
    cmpLess: '比正确答案少：它按 {a} 份分已知时间，可已知时间其实只分成 {a} − 1 份。',
    cmpMore: '比正确答案多：它按 {a} 份分已知时间，可已知时间其实只分成 {a} − 1 份。',
    cmpSame: '两种算法碰巧一样，因为问的正是已知的那一种情况。',
    s4hint: '观察顺序：保持敲钟情景，先只拖「要问：敲几下」，看下排的间隔数（彩条段数）和橙色竖线一起移动，粉色虚线的终点却跑在别处。再把两排调成同样多，两条线重合。最后换「爬楼梯」：每层是一个点、每段楼梯是一段，算法完全一样。',

    s5k: '第 5 步 · 倒过来算',
    s5t: '知道种了几棵、间隔多少，路有多长？',
    s5e: '这一步要回答：已知棵数和间隔，怎样反推路长？先由种法把<strong>棵数换成段数</strong>（第 2 步那张表倒过来用：两头都种，段数 = 棵数 − 1；只种一头，段数 = 棵数；两头都不种，段数 = 棵数 + 1；围成一圈，段数 = 棵数），再算<strong>路长 = 段数 × 间隔</strong>。围成一圈时，「路长」指绕一圈的长度。',
    c5a: '由棵数和间隔画出对应的路',
    c5title: '{mode} · {T} 棵 · 间隔 {d} 米',
    T5: '种了几棵', d5: '间隔', treesN: '{v} 棵',
    s5readout: '{T} 棵、{mode} → 段数 = {rel} = {g} 段；路长 = 段数 × 间隔 = {g} × {d} = {L} 米。',
    rel_both: '{T} − 1', rel_one: '{T}', rel_none: '{T} + 1', rel_loop: '{T}',
    s5hint: '观察顺序：棵数和间隔先不动，依次按四个种法按钮，看路长怎样跟着变：同样的棵数，两头都不种的路最长（多一段），两头都种的路最短（少一段）。再拖棵数：每多 1 棵，路长正好多 1 个间隔。',
    quizPrompt: '小练习：一条路两头都不种，种了 9 棵树，每两棵相隔 5 米。路长多少米？',
    quizA: '40 米', quizB: '45 米', quizC: '50 米',
    check: '检查', pickOne: '先选一个答案。',
    correct: '对：两头都不种，段数 = 9 + 1 = 10，路长 10 × 5 = {L} 米。可以把上面的种法、棵数、间隔调成同样的数验证。',
    wrong: '{L} 米不对。先别急着乘：两头都不种时，段数比棵数多 1，再乘间隔。',

    s6k: '第 6 步 · 收束', s6t: '先数段，再看两头的点',
    s6fin: '回顾：<strong>第 0 步</strong>，每段认领左边的点，一排点总比段多 1。<strong>第 1 步</strong>，段数 = 路长 ÷ 间隔，要求能整除。<strong>第 2 步</strong>，段数只由路长和间隔决定，两头的处理决定棵数比段数多 1、相等还是少 1。<strong>第 3、4 步</strong>，锯木头、敲钟、爬楼梯都是同一个结构：时间花在段上，不在点上。<strong>第 5 步</strong>，倒过来先把点数换成段数，再乘间隔。',
    formula: '段数 = 总长 ÷ 间隔\n两头都种：点数 = 段数 + 1\n只种一头、围成一圈：点数 = 段数\n两头都不种：点数 = 段数 − 1',
    boundary: '适用范围：本页的点都看成没有粗细（树、柱子、切口都只占一个位置），相邻两点的间隔全都相等，总长正好是间隔的整数倍。真实的柱子有粗细，真实的人上楼会越走越慢，那时只能近似使用。',
    linksTitle: '接着去看',
    lk1: '→ 找规律第 1 步：摆一排正方形，每多一个多用几根火柴（也是点和段的账）',
    lk2: '→ 找规律第 2 步：不用画，直接算出第 100 个图要几根',
    lk3: '→ 除法与余数第 0 步：分不完的那一份——对应本页「不能整除」的情形',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《间隔与植树 · 段数和点数差一》的平行版本。'
  },
  en: {
    pageTitle: 'Intervals & Fences · Count the Gaps, Then Check the Ends',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Intervals & Fences · Gaps and Posts Differ by One →',
    navLabel: 'Intervals and fences steps',
    tagline: 'How many posts for a fence, how many trees along a path, how many saw cuts, how long a clock takes to chime: all one question. A row of points splits a line into gaps. Count the gaps first, then ask whether the end points count, and you will never be off by one.',
    nav0: '0 Posts & panels', nav1: '1 Length ÷ spacing', nav2: '2 The two ends', nav3: '3 Sawing', nav4: '4 Chimes & stairs', nav5: '5 Work backwards', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Points and gaps',
    s0t: 'Five fence panels: how many posts?',
    s0e: 'This step asks: in a straight fence with one panel between every two posts, which is more, posts or panels, and by how many? A post is a <strong>point</strong> (it marks one spot). A panel is a <strong>gap</strong>, also called an <strong>interval</strong>: the stretch between two neighbouring points. To compare them, pair them up: let every panel claim the post on its <strong>left</strong>, then see whether any post is left over.',
    c0a: 'A fence: posts paired with panels',
    c0title: 'Each panel claims the post on its left',
    lgPanel: 'panel (gap)', lgClaimed: 'claimed post and its panel', lgSpare: 'unclaimed post',
    n0: 'Number of panels', pair0: 'Pair them one by one',
    spareTag: 'the one left over',
    s0progress: 'Pairing: {k}/{n} panels matched so far.',
    s0readout: '{n} panels claim {n} posts. Post {last}, on the far right, is claimed by nobody, so there are {n} + 1 = {p} posts.',
    s0hint: 'What to try: press “Pair them one by one” and watch the cyan links join each panel to the post on its left; the orange post at the end is left over. Then drag the number of panels: however many there are, the spare is always the rightmost post, so posts outnumber panels by exactly one.',

    s1k: 'Step 1 · Find the gaps first',
    s1t: 'A 24 m path with a tree every 4 m, at both ends too: how many trees?',
    s1e: 'This step asks: knowing the path length and the spacing, how do we get the number of trees without drawing them? The <strong>spacing</strong> is the distance between neighbouring trees, which is the length of one <strong>gap</strong>. However many spacings fit into the path, that is how many gaps there are: <strong>gaps = length ÷ spacing</strong>. <strong>Both ends planted</strong> means there is a tree at the start and at the finish, so the trees play the posts of step 0 and the gaps play the panels: <strong>trees = gaps + 1</strong>. This only works when the length is a whole number of spacings; otherwise the last gap comes out short.',
    c1a: 'Trees planted along a path at a fixed spacing',
    c1title: 'Path {L} m, a tree every {d} m',
    lgTree: 'tree (point)', lgGap: 'one gap (between neighbouring trees)', lgRest: 'leftover shorter than one spacing',
    L1: 'Path length', d1: 'Spacing (distance between neighbouring trees)',
    meters: '{v} m', unitM: 'm',
    restTag: '{r} m left',
    s1readout: 'Gaps = length ÷ spacing = {L} ÷ {d} = {g}. Both ends planted, so trees = gaps + 1 = {g} + 1 = {n}. Count the trees in the picture from 1 to {n}: it matches.',
    s1bad: '{L} ÷ {d} is not a whole number: after {g} full spacings there are {r} m left over (pink dashes), so the last tree would stand only {r} m from its neighbour. Equal spacing is impossible here, and the rule on this page does not apply.',
    s1hint: 'What to try: keep the path at 24 m and drag the spacing from 4 down to 2, then up to 8. The trees thin out or crowd in, and the number of coloured bars (gaps) changes together with the “gaps” in the readout. Then change the length: whenever it is not a multiple of the spacing, a pink dashed leftover appears and the readout warns that the rule no longer applies.',

    s2k: 'Step 2 · The end points',
    s2t: 'If the ends are not both planted, or the path is a loop, is it still “gaps + 1”?',
    s2e: 'This step asks: with the number of gaps fixed, how does the treatment of the ends change the number of trees? The path is 24 m long, so <strong>gaps = 24 ÷ spacing</strong> in all four cases. Only the ends differ: <strong>both ends</strong> (a tree at start and finish), <strong>one end</strong> (none at the start, one at the finish), <strong>neither end</strong> (both left empty), and <strong>a loop</strong> (the path closes on itself, like the edge of a round flower bed, so start and finish are the same spot). A pink dashed circle marks a tree that is missing compared with “both ends”.',
    c2a: 'Tree positions for the four ways of planting',
    c2title: '{mode} · path 24 m · spacing {d} m',
    lgRemoved: 'tree missing compared with “both ends”',
    modeGroup: 'Planting rule', modeBoth: 'Both ends', modeOne: 'One end', modeNone: 'Neither end', modeLoop: 'A loop',
    mode_both: 'Both ends', mode_one: 'One end', mode_none: 'Neither end', mode_loop: 'A loop',
    d2: 'Spacing (a divisor of 24)',
    startEnd: 'tree 1 · start = finish',
    thMode: 'Rule', thGaps: 'Gaps', thTrees: 'Trees', thDiff: 'Trees − gaps',
    s2readout: '{mode}: 24 m makes {g} gaps and {n} trees, so trees − gaps = {diff}. {why}',
    why_both: 'There is a tree at each end, one more than the gaps.',
    why_one: 'The start is empty, so each gap is matched by the tree at its right end: trees = gaps.',
    why_none: 'Both ends are empty: two fewer than “both ends”, one fewer than the gaps.',
    why_loop: 'The ends meet, so the tree at the finish is the tree at the start and must not be counted twice: trees = gaps.',
    s2hint: 'What to try: leave the spacing alone and press the four rule buttons in turn. Watch which tree turns into a pink dashed circle, and watch a new row fill in the table; once all four are filled, compare the last column. Then drag the spacing: gaps and trees both change, but the last column (+1, 0, −1, 0) does not. It depends only on the ends.',

    s3k: 'Step 3 · Sawing a log',
    s3t: 'Saw a log into 5 pieces at 3 minutes per cut: how long does it take?',
    s3e: 'This step asks: when sawing, do we count cuts or pieces? Each cut makes one <strong>cut line</strong>; cut lines are points and pieces are gaps. The two ends of the log are already free, so nobody saws there: it is the “neither end” case. <strong>Cuts = pieces − 1</strong>, and time = cuts × minutes per cut.',
    c3a: 'A log sawn cut by cut, with the time used below',
    c3title: 'Goal: {k} pieces (dashed = not cut yet)',
    lgPiece: 'piece of log', lgCut: 'cut made / time spent', lgWrong: 'time if pieces were counted as cuts',
    k3: 'Pieces wanted', per3: 'Minutes per cut',
    pieces: '{v} pieces', minutes: '{v} min', unitMin: 'min',
    cut3: 'Make one cut', all3: 'Finish all cuts', reset3: 'Start a fresh log',
    c3rowA: 'Actual: {c} cuts, {m} min',
    c3rowB: 'Wrong count: {k} pieces × per cut = {m} min',
    s3progress: '{c} cuts so far: the log is now in {p} pieces (goal {k}), {m} minutes used.',
    s3readout: '{k} pieces need only {c} cuts: {c} × {per} = {m} minutes. Counting pieces as cuts gives {w} minutes; the extra is the “last cut”, which is never needed.',
    s3hint: 'What to try: press “Make one cut”. Each press adds an orange cut line, one more piece, and one more orange block of time below. When you are done, the orange row is exactly one block shorter than the pink dashed row (the wrong count). Change the number of pieces and start again: it is always one block shorter.',

    s4k: 'Step 4 · Chimes and stairs',
    s4t: 'A clock takes 6 s to strike 3. How long to strike 6?',
    s4e: 'This step asks: when time is only spent between events, how do we get from what we know to what we want? For a clock, time is measured from the first strike to the last, so it is all spent in the <strong>intervals</strong> between strikes, and a strike of a has only a − 1 intervals. For stairs, going from floor 1 to floor a means a − 1 flights (each flight joins two neighbouring floors). First find <strong>time per interval = known time ÷ known number of intervals</strong>, then multiply by the new number of intervals. We assume every interval takes the same time.',
    scGroup: 'Scenario', scClock: 'Clock chimes', scStairs: 'Climbing stairs',
    c4a: 'The known and the asked rows of intervals on one shared time axis',
    lg4strike: 'one strike (point)', lg4floor: 'reaching a floor (point)', lg4gap: 'time for one interval', lg4wrong: 'wrong time from scaling the count',
    a4clock: 'Known: strikes', a4stairs: 'Known: floor 1 up to floor', b4clock: 'Asked: strikes', b4stairs: 'Asked: floor 1 up to floor',
    T4: 'Known time', seconds: '{v} s', unitS: 's',
    c4knownClock: 'Known: {a} strikes = {g} intervals, {T} s ({p} s each)',
    c4knownStairs: 'Known: floor 1 → {a} = {g} flights, {T} s ({p} s each)',
    c4askClock: 'Asked: {b} strikes = {g} intervals → {s} s',
    c4askStairs: 'Asked: floor 1 → {b} = {g} flights → {s} s',
    c4wrong: 'Wrong method: {w} s',
    s4readoutClock: '{a} strikes have only {ga} intervals, so each takes {T} ÷ {ga} = {p} s. {b} strikes have {gb} intervals: {gb} × {p} = {s} s (orange line). Scaling by the number of strikes instead gives {T} ÷ {a} × {b} = {w} s (pink dashes), {cmp}',
    s4readoutStairs: 'Floor 1 to {a} is only {ga} flights, so each takes {T} ÷ {ga} = {p} s. Floor 1 to {b} is {gb} flights: {gb} × {p} = {s} s (orange line). Scaling by the floor number instead gives {T} ÷ {a} × {b} = {w} s (pink dashes), {cmp}',
    cmpLess: 'which is too short: it splits the known time into {a} shares, but the known time only covers {a} − 1 intervals.',
    cmpMore: 'which is too long: it splits the known time into {a} shares, but the known time only covers {a} − 1 intervals.',
    cmpSame: 'the same by coincidence, because you are asking for exactly the case you know.',
    s4hint: 'What to try: stay with the clock and drag only “Asked: strikes”. The number of coloured bars in the lower row and the orange line move together, while the end of the pink dashes lands somewhere else. Set both rows to the same number and the two lines meet. Then switch to stairs: each floor is a point, each flight a gap, and the arithmetic is the same.',

    s5k: 'Step 5 · Work backwards',
    s5t: 'Given the number of trees and the spacing, how long is the path?',
    s5e: 'This step asks: knowing how many trees there are and how far apart, how do we recover the length? First use the planting rule to <strong>turn trees into gaps</strong> (the table from step 2, read backwards: both ends, gaps = trees − 1; one end, gaps = trees; neither end, gaps = trees + 1; a loop, gaps = trees). Then <strong>length = gaps × spacing</strong>. For a loop, the “length” is once around.',
    c5a: 'The path that matches the given trees and spacing',
    c5title: '{mode} · {T} trees · spacing {d} m',
    T5: 'Number of trees', d5: 'Spacing', treesN: '{v} trees',
    s5readout: '{mode}, {T} trees → gaps = {rel} = {g}; length = gaps × spacing = {g} × {d} = {L} m.',
    rel_both: '{T} − 1', rel_one: '{T}', rel_none: '{T} + 1', rel_loop: '{T}',
    s5hint: 'What to try: keep the trees and spacing fixed and press the four rule buttons in turn. With the same trees, “neither end” gives the longest path (one extra gap) and “both ends” the shortest (one gap fewer). Then drag the number of trees: each extra tree adds exactly one spacing to the length.',
    quizPrompt: 'Try it: a path has trees at neither end, 9 trees in all, 5 m apart. How long is the path?',
    quizA: '40 m', quizB: '45 m', quizC: '50 m',
    check: 'Check', pickOne: 'Pick an answer first.',
    correct: 'Right: with neither end planted, gaps = 9 + 1 = 10, so the length is 10 × 5 = {L} m. Set the controls above to the same numbers to see it.',
    wrong: '{L} m is not it. Before multiplying, turn trees into gaps: with neither end planted there is one more gap than trees.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Count the gaps, then check the ends',
    s6fin: 'Looking back. <strong>Step 0</strong>: let each gap claim the point on its left, and a row of points always has one more than the gaps. <strong>Step 1</strong>: gaps = length ÷ spacing, provided it divides exactly. <strong>Step 2</strong>: the number of gaps depends only on length and spacing; the ends decide whether there is one more point, the same, or one fewer. <strong>Steps 3 and 4</strong>: sawing, chiming and climbing share the structure, and the time is spent on the gaps, not the points. <strong>Step 5</strong>: working backwards, turn points into gaps first, then multiply by the spacing.',
    formula: 'gaps = total length ÷ spacing\nboth ends: points = gaps + 1\none end, or a loop: points = gaps\nneither end: points = gaps − 1',
    boundary: 'Scope: every point here has no thickness (a tree, a post, a cut all mark a single spot), all spacings are equal, and the length is a whole number of spacings. Real posts have width and real people slow down on the stairs; there the rules are only approximations.',
    linksTitle: 'Where to go next',
    lk1: '→ Patterns, step 1: a row of squares, and how many more matchsticks each new one costs (points and gaps again)',
    lk2: '→ Patterns, step 2: get figure 100 without drawing it',
    lk3: '→ Division & remainders, step 0: the share that will not divide, the “does not divide” case of this page',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Intervals & Fences · Gaps and Posts Differ by One”.'
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
  if (typeof window.refreshFences === 'function') window.refreshFences();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.IF_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
