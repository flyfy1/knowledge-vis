'use strict';
// Averages · Level by Pouring (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '平均数 · 移多补少',
    back: '← 知识索引',
    compare: '对照另一版本：平均数 · 移多补少 →',
    navLabel: '平均数步骤导航',
    tagline: '几个杯子里的果汁有多有少。如果把它们倒来倒去，直到每杯一样多，每杯会是多少？这个“一样多”的量，就叫这几个数的平均数。下面七步，先亲手倒，再学会不倒也能算，最后看平均数能帮我们做什么、不能说明什么。',
    nav0: '0 倒来倒去', nav1: '1 移多补少', nav2: '2 合起来再平分', nav3: '3 一个特别多', nav4: '4 人数不同怎么比', nav5: '5 倒着求', nav6: '6 收束',
    cupName: '{l} 杯',

    s0k: '第 0 步 · 先动手',
    s0t: '把果汁从一个杯子倒进另一个杯子，一共有多少会变吗？',
    s0e: '这一步要回答：杯子之间倒来倒去，四杯果汁<strong>合起来的总量</strong>会不会变？每个杯子画成一格一格，一格叫<strong>1 份</strong>，每杯最多装 10 份。每一份都用它原来所在杯子的颜色涂上，倒到别的杯子里也不换颜色，这样能看出每一份去了哪里。上面那条长条把所有的份排成一排，表示<strong>总量</strong>：四杯加起来一共多少份。',
    fromLbl: '从哪杯倒出', toLbl: '倒进哪杯',
    pourBtn: '倒 1 份', reset0: '倒回原样',
    s0lgCup: '每一份的颜色 = 它原来在哪杯', s0lgStrip: '上方长条：全部的份排成一排（总量）', s0lgSel: '白框：选中要倒出的杯子',
    c0a: '四个杯子和表示总量的长条',
    s0readout: '已倒 {k} 次。现在四杯是 {cups} 份，总量 {total} 份（一开始也是 {total0} 份）。最多的一杯比最少的一杯多 {gap} 份。',
    s0same: '倒出和倒进是同一杯，这样倒不算数。', s0empty: '{l} 杯已经空了，倒不出来。', s0full: '{l} 杯已经装满 10 份，倒不进去。',
    s0hint: '怎么玩：先在两个下拉框里选好“从哪杯倒出”和“倒进哪杯”，按“倒 1 份”；也可以直接点图里的杯子，第一次点的是倒出的杯子（加白框），第二次点的是倒进的杯子。多倒几次，看上方长条：颜色的分段在变，长条的总长度一直不变。',

    s1k: '第 1 步 · 倒成一样多',
    s1t: '要让每杯一样多，最少要倒几份？',
    s1e: '这一步要回答：一开始高高低低的几杯，要倒成每杯一样多，最少得挪动几份？办法叫<strong>移多补少</strong>：每次从最多的那杯倒 1 份给最少的那杯。橙色虚线是倒完以后每杯的高度，也就是<strong>平均数</strong>（倒成一样多时每杯的量）。线上方涂橙框的格子叫<strong>高出的部分</strong>：比平均数多出来、迟早要倒走的份；线下方的虚线空格叫<strong>不足的部分</strong>：比平均数少、等着被补上的位置。',
    pour1: '倒 1 份（最多 → 最少）', auto1: '一直倒到一样多', next1: '换一组杯子', reset1: '重来',
    s1lgExcess: '高出的部分（要倒走）', s1lgRoom: '不足的部分（等着补）', s1lgMean: '平均数（倒完后的高度）',
    c1a: '移多补少：高出的份倒进不足的空格',
    s1readout: '已倒 {k}/{need} 份。现在各杯：{cups}。高出平均数 {mean} 的还有 {ex} 份，低于它的空格还有 {sh} 个，两个数总是一样大。',
    s1done: '已倒 {k}/{need} 份，每杯都是 {mean} 份。一共挪了 {need} 份，正好等于一开始高出平均数的份数。',
    s1hint: '观察顺序：先按几次“倒 1 份”，每次看一个橙框格子飞进一个虚线空格；再按“一直倒到一样多”看完整个过程。橙框数和空格数每次同时少 1，所以需要倒的份数 = 一开始高出部分的份数。换一组杯子再试一次。',

    s2k: '第 2 步 · 不倒也能算',
    s2t: '不真的去倒，能不能直接算出一样多时每杯是多少？',
    s2e: '这一步要回答：杯子很多、倒起来很麻烦时，怎样直接求出平均数？想象把所有杯子先倒进一根长管子（中间的长条，长度 = 所有份数相加的<strong>总量</strong>），再把长管子平均切成和杯子一样多的段，每段倒回一个杯子。每段一样长，所以每杯一样多。于是：<strong>平均数 = 总量 ÷ 杯数</strong>。总量不一定能被杯数整除，这时平均数带小数或分数：果汁可以倒出半份、五分之一份；如果只能整份地分，就会剩下余数（<a class="xlink" href="../../../math/arithmetic/division-remainder/#step0">→ 有余数的除法第 0 步：分不完的那一颗</a>）。',
    nSlider: '用前几杯（杯数）',
    play2: '演示：合起来，再平分',
    s2lgCups: '上：原来的杯子', s2lgStrip: '中：全部倒进一根长管子', s2lgEven: '下：长管子切成同样长的几段（白线是切口）',
    c2a: '先合起来，再平均分成几段',
    s2readout: '{expr} = {total} 份；{total} ÷ {n} = {mean} 份。所以这 {n} 杯的平均数是 {mean} 份。',
    exact: '{v}', approx: '约 {v}', fracZh: '（{w} 又 {num}/{den} 份）',
    s2hint: '观察顺序：先按“演示”看果汁倒进长管子、再切开倒回去；然后拖“杯数”，从 2 拖到 6。每多一杯，长管子变长（总量加上新杯的份数），切口也多一个。看下排杯子的高度：它跟最上排哪一杯都不一定一样。',

    s3k: '第 3 步 · 一个特别多',
    s3t: '只有一杯特别多时，平均数会被拉到哪里？',
    s3e: '这一步要回答：五杯里有一杯忽然特别多，平均数怎么变？这里前四杯不动（4、5、6、5 份），你来决定第五杯 E 有几份（每杯最多 20 份）。平均数还是<strong>总量 ÷ 杯数</strong>，所以 E 每多 5 份，总量多 5，除以 5 杯，平均数只多 1 份。灰色虚线是 E 为 5 份时的平均数，留作对照；橙色虚线是现在的平均数。像 E 这样比其他数大得多（或小得多）的数，叫<strong>极端值</strong>（<a class="xlink" href="../../../probability/statistics/mean-median-mode/#step1">→ 平均数、中位数、众数第 1 步：极端值来了，三个“平均”怎么动</a>）。',
    xSlider3: 'E 杯的份数',
    s3lgMean: '现在的平均数', s3lgOld: 'E 为 5 份时的平均数', s3lgAbove: '高于平均数的杯', s3lgBelow: '低于平均数的杯', s3lgEqual: '正好等于平均数的杯',
    c3a: '五杯和它们的平均数',
    s3readout: '总量 {total} 份，÷ 5 = 平均数 {mean} 份，比 E 为 5 份时变了 {change} 份。高于平均数的 {above} 杯，低于的 {below} 杯，正好相等的 {equal} 杯。平均数在最少的 {min} 份和最多的 {max} 份之间。',
    s3hint: '观察顺序：把 E 从 5 慢慢拖到 20，看橙线只升了一点点（升到 8）；这时其余四杯全都低于平均数。再拖到 0，看平均数降到 4。无论怎么拖，橙线都不会低于最矮的杯、也不会高于最高的杯。',

    s4k: '第 4 步 · 用处',
    s4t: '两队人数不一样，比投中的总个数公平吗？',
    s4e: '这一步要回答：两队各练一轮投篮，甲队 4 人、乙队 6 人，哪队投得更准？如果比<strong>总数</strong>（全队投中的个数加起来），人多的队占便宜。比<strong>平均数</strong>（总数 ÷ 人数，相当于把全队的进球“移多补少”匀给每个人）就像问“平均每人投中几个”，人数不同也能比。上图每根柱子是一个人投中的个数，虚线是各队的平均数；下面两根横条是两队的总数。',
    addB: '乙队再来一位队员', xSlider4: '新队员投中几个',
    teamA: '甲队', teamB: '乙队', teamLbl: '{team} · {n} 人', totalLbl: '总数', meanLbl: '平均 {v}', teamAShort: '甲', teamBShort: '乙',
    s4lgA: '甲队队员', s4lgB: '乙队队员', s4lgNew: '乙队新队员', s4lgMean: '各队平均数',
    c4a: '两队每人投中的个数、平均数和总数',
    s4readout: '甲队 {nA} 人，总数 {tA}，平均每人 {mA} 个；乙队 {nB} 人，总数 {tB}，平均每人 {mB} 个。{winT}的总数多，{winM}的平均数高。',
    s4newNote: '新队员投中 {x} 个，{dir}乙队原来的平均数 {old}，所以乙队平均数{move}。',
    above: '高于', below: '低于', same: '等于', up: '上升了', down: '下降了', flat: '不变',
    s4hint: '观察顺序：先不加人，对比上图两条虚线和下图两根横条：乙队总数多，平均数却低。再按“乙队再来一位队员”，拖“新队员投中几个”从 0 到 10：乙队总数一定变多；平均数只有在新队员投中的个数高于乙队原平均数 6 时才上升。',

    s5k: '第 5 步 · 倒着求',
    s5t: '已知平均数，缺的那一杯该装多少？',
    s5e: '这一步要回答：老师说“这 4 杯平均每杯 6 份”，可第 4 杯 D 的量看不见，它是多少？把平均数倒过来用：既然倒匀以后每杯 6 份，4 杯一共就是 <strong>平均数 × 杯数 = 6 × 4 = 24 份</strong>。前三杯已有 4 + 7 + 5 = 16 份，D 就得补上 24 − 16 = 8 份。也可以用“移多补少”看：前三杯比 6 份一共少 3 格、多 1 份，D 得先装 6 份，再补上净缺的 2 份。这其实是一个一步方程 16 + D = 24（<a class="xlink" href="../../../math/algebra/equation-scale/#step3">→ 方程天平第 3 步：一步方程</a>）。绿色虚线是目标平均数，橙色虚线是现在 4 杯的平均数（每杯最多装 12 份）。',
    xSlider5: 'D 杯装几份', tSlider5: '目标平均数',
    s5lgTarget: '目标平均数', s5lgMean: '现在的平均数', s5lgD: 'D 杯（你来装）',
    c5a: '四杯和目标平均数',
    s5readout: '目标：4 杯平均 {t} 份 → 一共要 4 × {t} = {T} 份。前三杯有 {have} 份，D 需要 {T} − {have} = {need} 份。现在 D 装了 {x} 份，4 杯平均 {m} 份：{status}',
    s5hit: '正好对上！', s5more: 'D 多装了 {d} 份。', s5less: 'D 还少 {d} 份。',
    s5neg: '做不到：前三杯已经有 {have} 份，超过了 4 × {t} = {T} 份，D 就算一份不装，平均数也比 {t} 大。',
    s5cap: '做不到：D 需要 {need} 份，可一杯最多只能装 12 份。',
    s5hint: '观察顺序：先保持目标 6 不动，拖“D 杯装几份”，直到橙线和绿线重合，读出 D 的份数（8）；再把目标改成 4、7，看需要的份数怎样跟着变：目标每多 1，D 要多 4 份，因为 4 杯每杯都要多 1 份。把目标拖到 3 或 8，看看为什么做不到。',

    s6k: '第 6 步 · 收束', s6t: '平均数是“倒匀以后”的那个量',
    s6fin: '回顾一下。<strong>第 0 步</strong>：倒来倒去，总量不变。<strong>第 1 步</strong>：移多补少，把高出平均数的份倒进不足的空格；高出的总和等于不足的总和，所以要倒的份数就是高出的份数。<strong>第 2 步</strong>：不用真倒，总量 ÷ 个数就是平均数，结果可以是小数。<strong>第 3 步</strong>：一个极端值会把平均数拉过去，但平均数总在最小值和最大值之间。<strong>第 4 步</strong>：人数不同时比平均数才公平。<strong>第 5 步</strong>：知道平均数和个数，就知道总量，能倒推缺的数。',
    formula: '平均数 = 总量 ÷ 个数\n总量 = 平均数 × 个数\n高出平均数的总和 = 低于平均数的不足总和',
    boundary: '注意：平均数说的是“匀开以后每份多少”，它不一定等于其中哪一个数，也看不出数据之间差得多大（4、4、4 和 0、4、8 的平均数都是 4）。这一页的果汁和投篮数字都是为了讲道理编的例子，不是真实调查。',
    linksTitle: '接着去看',
    lk1: '→ 条形图（Claude Code 版）第 5 步：在条形图上画出平均线',
    lk2: '→ 平均数、中位数、众数第 1 步：极端值来了，该用哪个“平均”',
    lk3: '→ 有余数的除法第 0 步：只能整颗分时，分不完的那几颗',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《平均数 · 移多补少》的平行版本。'
  },
  en: {
    pageTitle: 'Averages · Level by Pouring',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Averages · Level by Pouring →',
    navLabel: 'Averages steps',
    tagline: 'A few cups hold different amounts of juice. Pour back and forth until every cup holds the same: how much is in each? That shared amount is the average (the mean) of the numbers. Seven steps: pour by hand first, then learn to work it out without pouring, and finally see what an average is good for and what it cannot tell you.',
    nav0: '0 Pour around', nav1: '1 Even out', nav2: '2 Pool, then share', nav3: '3 One big cup', nav4: '4 Unequal teams', nav5: '5 Work backwards', nav6: '6 Wrap-up',
    cupName: 'Cup {l}',

    s0k: 'Step 0 · Hands first',
    s0t: 'If you pour juice from one cup into another, does the amount altogether change?',
    s0e: 'This step asks: when you pour between cups, does the <strong>total</strong> (all four cups added together) change? Each cup is drawn as a stack of boxes; one box is <strong>1 part</strong>, and a cup holds at most 10 parts. Every part keeps the colour of the cup it started in, even after it is poured somewhere else, so you can track where each one went. The long strip at the top lines up every part in one row: its length is the total.',
    fromLbl: 'Pour from', toLbl: 'Pour into',
    pourBtn: 'Pour 1 part', reset0: 'Put it all back',
    s0lgCup: 'colour of a part = the cup it started in', s0lgStrip: 'strip on top: every part in one row (the total)', s0lgSel: 'white frame: cup chosen to pour from',
    c0a: 'Four cups and a strip showing the total',
    s0readout: '{k} pours so far. The cups now hold {cups} parts; total {total} parts (it started at {total0}). The fullest cup has {gap} more parts than the emptiest.',
    s0same: 'Pouring a cup into itself does not count.', s0empty: 'Cup {l} is empty; nothing to pour.', s0full: 'Cup {l} is full (10 parts); it cannot take more.',
    s0hint: 'How to play: choose “Pour from” and “Pour into”, then press “Pour 1 part”. Or click the cups in the picture: the first click picks the cup to pour from (white frame), the second picks the cup to pour into. Pour a few times and watch the strip on top: its coloured pieces shift, but its overall length never changes.',

    s1k: 'Step 1 · Make them equal',
    s1t: 'To make every cup hold the same, what is the fewest parts you must move?',
    s1e: 'This step asks: starting from uneven cups, how few parts must move before every cup holds the same? The method is <strong>move from more to less</strong>: each time, pour 1 part from the fullest cup into the emptiest. The orange dashed line is the height every cup ends at, which is the <strong>mean</strong> (the amount each cup holds once they are all equal). Boxes above the line with an orange frame are the <strong>surplus</strong>: parts over the mean that will have to move. Dashed empty slots below the line are the <strong>shortfall</strong>: room under the mean waiting to be filled.',
    pour1: 'Pour 1 part (fullest → emptiest)', auto1: 'Keep pouring until equal', next1: 'Try other cups', reset1: 'Start over',
    s1lgExcess: 'surplus (must move)', s1lgRoom: 'shortfall (waiting to be filled)', s1lgMean: 'mean (final height)',
    c1a: 'Move from more to less: surplus parts drop into the empty slots',
    s1readout: '{k}/{need} parts moved. Cups now: {cups}. Surplus above the mean of {mean}: {ex} parts; empty slots below it: {sh}. The two numbers are always equal.',
    s1done: '{k}/{need} parts moved; every cup holds {mean}. Exactly {need} parts moved, the same as the surplus you started with.',
    s1hint: 'What to watch: press “Pour 1 part” a few times; each press sends one framed box into one dashed slot. Then press “Keep pouring until equal” to see the rest. Framed boxes and empty slots drop by 1 together every time, so the number of parts to move equals the starting surplus. Then try other cups.',

    s2k: 'Step 2 · No pouring needed',
    s2t: 'Without actually pouring, can you work out what each cup would hold?',
    s2e: 'This step asks: when there are many cups and pouring is a chore, how do you get the mean directly? Imagine emptying every cup into one long tube (the middle strip; its length is the <strong>total</strong>, all the parts added up). Cut the tube into as many equal pieces as there are cups and pour one piece back into each cup. The pieces are equal, so the cups are equal. So: <strong>mean = total ÷ number of cups</strong>. The total does not always divide evenly; then the mean is a decimal or a fraction. Juice can be poured in half parts or fifths of a part; if only whole parts were allowed, there would be a remainder (<a class="xlink" href="../../../math/arithmetic/division-remainder/#step0">→ Division with remainders, step 0: the sweet that will not share</a>).',
    nSlider: 'Use the first … cups',
    play2: 'Show it: pool, then share',
    s2lgCups: 'top: the cups as they are', s2lgStrip: 'middle: all poured into one tube', s2lgEven: 'bottom: the tube cut into equal pieces (white lines are the cuts)',
    c2a: 'Pool everything, then cut it into equal pieces',
    s2readout: '{expr} = {total} parts; {total} ÷ {n} = {mean} parts. So the mean of these {n} cups is {mean} parts.',
    exact: '{v}', approx: 'about {v}', fracZh: ' ({w} {num}/{den} parts)',
    s2hint: 'What to try: press “Show it” to watch the juice fill the tube and get cut up and poured back. Then drag the number of cups from 2 to 6. Each extra cup makes the tube longer (the total gains that cup’s parts) and adds one more cut. Look at the bottom row: its height need not match any cup in the top row.',

    s3k: 'Step 3 · One very full cup',
    s3t: 'When one cup holds far more than the rest, where does the mean go?',
    s3e: 'This step asks: if one of five cups suddenly holds a lot, how does the mean change? The first four cups stay put (4, 5, 6 and 5 parts); you set cup E (up to 20 parts). The mean is still <strong>total ÷ number of cups</strong>, so every 5 extra parts in E add 5 to the total, and dividing by 5 cups moves the mean up by just 1 part. The grey dashed line is the mean when E holds 5 parts, kept for comparison; the orange dashed line is the mean now. A value far bigger (or smaller) than the others, like E here, is called an <strong>outlier</strong> (<a class="xlink" href="../../../probability/statistics/mean-median-mode/#step1">→ Mean, median and mode, step 1: what an outlier does to each “average”</a>).',
    xSlider3: 'Parts in cup E',
    s3lgMean: 'mean now', s3lgOld: 'mean when E holds 5', s3lgAbove: 'cup above the mean', s3lgBelow: 'cup below the mean', s3lgEqual: 'cup exactly on the mean',
    c3a: 'Five cups and their mean',
    s3readout: 'Total {total} parts ÷ 5 = mean {mean} parts, a change of {change} from when E held 5. Above the mean: {above} cups; below: {below}; exactly on it: {equal}. The mean lies between the smallest cup, {min}, and the largest, {max}.',
    s3hint: 'What to try: drag E slowly from 5 up to 20 and see the orange line rise only a little (to 8); by then the other four cups are all below the mean. Drag it down to 0 and the mean drops to 4. However you drag, the orange line never goes below the shortest cup or above the tallest.',

    s4k: 'Step 4 · What it is for',
    s4t: 'Two teams of different sizes: is comparing total baskets fair?',
    s4e: 'This step asks: two teams each shoot one round of baskets, team A with 4 players and team B with 6. Which team shoots better? Compare <strong>totals</strong> (every basket on the team added up) and the bigger team gets a head start. Comparing <strong>means</strong> (total ÷ number of players, as if the team evened out its baskets among its players) asks “how many baskets per player?”, which works even when team sizes differ. In the top chart each bar is one player’s baskets and the dashed lines are the team means; the two bars below are the team totals.',
    addB: 'Add a player to team B', xSlider4: 'Baskets by the new player',
    teamA: 'Team A', teamB: 'Team B', teamLbl: '{team} · {n} players', totalLbl: 'Total', meanLbl: 'mean {v}', teamAShort: 'A', teamBShort: 'B',
    s4lgA: 'team A player', s4lgB: 'team B player', s4lgNew: 'team B newcomer', s4lgMean: 'team mean',
    c4a: 'Baskets per player, team means and team totals',
    s4readout: 'Team A: {nA} players, total {tA}, mean {mA} per player. Team B: {nB} players, total {tB}, mean {mB} per player. Bigger total: {winT}. Higher mean: {winM}.',
    s4newNote: 'The newcomer scored {x}, {dir} team B’s old mean of {old}, so team B’s mean {move}.',
    above: 'above', below: 'below', same: 'equal to', up: 'went up', down: 'went down', flat: 'stayed the same',
    s4hint: 'What to watch: with no newcomer, compare the two dashed lines on top with the two bars below: team B has the bigger total but the lower mean. Then press “Add a player to team B” and drag the newcomer’s baskets from 0 to 10. Team B’s total always grows; its mean rises only when the newcomer beats team B’s old mean of 6.',

    s5k: 'Step 5 · Working backwards',
    s5t: 'You know the mean. How much must the missing cup hold?',
    s5e: 'This step asks: the teacher says “these 4 cups average 6 parts”, but you cannot see how much cup D holds. How much is it? Use the mean backwards: if every cup would hold 6 after evening out, the 4 cups hold <strong>mean × number of cups = 6 × 4 = 24 parts</strong> altogether. The first three hold 4 + 7 + 5 = 16, so D must make up 24 − 16 = 8. The levelling picture says the same: against a line at 6, the first three are short by 3 slots and over by 1 part, so D needs its own 6 plus the net 2 missing. It is a one-step equation, 16 + D = 24 (<a class="xlink" href="../../../math/algebra/equation-scale/#step3">→ Equation balance, step 3: one-step equations</a>). The green dashed line is the target mean, the orange one is the mean of the 4 cups right now (a cup holds at most 12 parts).',
    xSlider5: 'Parts in cup D', tSlider5: 'Target mean',
    s5lgTarget: 'target mean', s5lgMean: 'mean now', s5lgD: 'cup D (you fill it)',
    c5a: 'Four cups and the target mean',
    s5readout: 'Target: 4 cups averaging {t} → {T} parts altogether (4 × {t}). The first three hold {have}, so D needs {T} − {have} = {need}. D now holds {x}; the 4 cups average {m}: {status}',
    s5hit: 'spot on!', s5more: 'D has {d} too many.', s5less: 'D is {d} short.',
    s5neg: 'impossible: the first three already hold {have}, more than 4 × {t} = {T}. Even with D empty the mean is above {t}.',
    s5cap: 'impossible: D would need {need} parts, but a cup holds at most 12.',
    s5hint: 'What to try: keep the target at 6 and drag “Parts in cup D” until the orange and green lines meet; read off D (8). Then set the target to 4 or 7 and watch the amount D needs: each 1 added to the target asks D for 4 more, because all 4 cups must rise by 1. Drag the target to 3 or 8 and see why it cannot be done.',

    s6k: 'Step 6 · Wrap-up', s6t: 'The mean is the amount after evening out',
    s6fin: 'Looking back. <strong>Step 0</strong>: pouring around never changes the total. <strong>Step 1</strong>: move from more to less, pouring the surplus above the mean into the shortfall below it; the surplus always equals the shortfall, so the parts to move equal the surplus. <strong>Step 2</strong>: no pouring needed, total ÷ count is the mean, and it may be a decimal. <strong>Step 3</strong>: one outlier pulls the mean towards it, but the mean always stays between the smallest and largest values. <strong>Step 4</strong>: when group sizes differ, compare means, not totals. <strong>Step 5</strong>: know the mean and the count and you know the total, so you can work out a missing value.',
    formula: 'mean = total ÷ count\ntotal = mean × count\nsurplus above the mean = shortfall below it',
    boundary: 'Keep in mind: the mean says how much each would get after evening out. It need not equal any of the numbers, and it does not show how spread out they are (4, 4, 4 and 0, 4, 8 both have mean 4). The juice and basket numbers on this page are made-up examples, not a real survey.',
    linksTitle: 'Where to go next',
    lk1: '→ Bar charts (Claude Code edition), step 5: draw the mean line on a bar chart',
    lk2: '→ Mean, median and mode, step 1: which “average” to trust when an outlier arrives',
    lk3: '→ Division with remainders, step 0: what is left when only whole pieces can be shared',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Averages · Level by Pouring”.'
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
  if (typeof window.refreshAvg === 'function') window.refreshAvg();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.AVG_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
