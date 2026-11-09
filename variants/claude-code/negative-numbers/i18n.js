'use strict';
// Negative numbers lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys and {placeholders} are identical in zh and en (tests/core.cjs checks both).

const STRINGS = {
  zh: {
    pageTitle: '负数 · 0 的另一边',
    back: '← 知识索引',
    compare: '对照另一版本：负数 · 0 以下的世界 →',
    navLabel: '负数步骤导航',
    tagline: '海面以下 3 米、零下 5 度、比出发点往左 2 格——这些「在 0 另一边」的量，怎么用一个数写下来？这一页从海面出发，用一根竖着的标尺和一条数轴，学会写负数、比负数、带着负数走路、数出两个温度差几度。',
    nav0: '0 海面以下', nav1: '1 0 是选的', nav2: '2 谁大谁小', nav3: '3 沿数轴走', nav4: '4 差几度', nav5: '5 自测', nav6: '6 收束',
    lgPos: '正数（0 的上边 / 右边）', lgNeg: '负数（0 的下边 / 左边）',
    clearTrail: '清除白点',
    check: '检查',

    s0k: '第 0 步 · 0 的下面',
    s0t: '海面以下 3 米，能用一个数写出来吗？',
    s0e: '这一步要回答：比 0 还低的位置，该记成什么数？我们把<strong>海面</strong>的高度记作 0 米。海面以上 3 米记作 3（也可以写成 +3）；这种比 0 大的数叫<strong>正数</strong>。海面以下 3 米在 0 的另一边，记作 <strong>−3</strong>，读作「负三」；这种在 0 另一边、前面带「−」号的数叫<strong>负数</strong>。「−」号只说明在 0 的哪一边，后面的 3 说明离 0 有多远。0 是分界点，既不是正数也不是负数。上图是竖着的高度标尺；把它向右放倒，就是下面那条<strong>数轴</strong>（画着刻度、每格代表 1 的直线）：标尺的「上」变成数轴的「右」，所以正数在 0 的右边，负数在 0 的左边。',
    s0slider: '离海面的高度（米）',
    s0lgTwin: '另一边离 0 一样远的数',
    s0lgTrail: '你停过的位置',
    c0gauge: '竖着量：离海面的高度（米）', c0line: '放倒：数轴（标尺的上 = 数轴的右）', c0sea: '海面 = 0',
    s0above: '海面以上 {d} 米 → 记作 {v}：正数，在数轴上 0 的右边 {d} 格。另一边离 0 同样远（{d} 格）的是 {t}。',
    s0below: '海面以下 {d} 米 → 记作 {v}，读作「负 {d}」：负数，在数轴上 0 的左边 {d} 格。另一边离 0 同样远（{d} 格）的是 {t}。',
    s0zero: '正好在海面 → 记作 0。0 是分界点，既不是正数，也不是负数。',
    s0hint: '观察顺序：只拖「高度」滑杆。往上拖，海鸥飞高，读数是正数；往下拖，小鱼下潜，读数变成负数。每次都对照三处：标尺上的刻度、下面数轴上同一个数的点（标尺越高 = 数轴越靠右）、虚线圈标出的「另一边离 0 一样远」的数。停过的位置会在数轴上留下白点。',

    s1k: '第 1 步 · 0 由我们来定',
    s1t: '换一个地方当 0，鸟和鱼的数会变吗？',
    s1e: '这一步要回答：一个位置的数，是贴在它身上的，还是相对 0 数出来的？海鸥和小鱼一直待在原处（海鸥在海面以上 4 米，小鱼在海面以下 3 米）。现在把「0」挪到别处：可以选船甲板（海面以上 2 米），也可以选海底（海面以下 6 米）。新的 0 定下来以后，比它高的记正数、比它低的记负数，数值是离新 0 有几米。绿色线就是新选的 0；标尺上的刻度跟着重写。',
    s1slider: '把 0 定在海面以上几米（负数 = 海面以下）',
    s1lgZero: '新选的 0', s1lgSea: '海面（位置不变）', s1lgGap: '鸟和鱼之间的距离',
    zeroSea: '以海面为 0', zeroDeck: '以船甲板为 0', zeroBed: '以海底为 0',
    s1zSea: '海面', s1zDeck: '船甲板', s1zBed: '海底', s1zUp: '海面以上 {r} 米', s1zDown: '海面以下 {r} 米',
    c1title: '同一片海，换一个 0', c1zero: '新的 0', c1bird: '海鸥 {v}', c1fish: '小鱼 {v}', c1gap: '相距 {g} 米',
    s1readout: '把 0 定在{zero}：海鸥记作 {bird}，小鱼记作 {fish}。海鸥和小鱼之间仍是 {g} 米——换 0 会改写每个数，但不会改变两个位置之间的距离。',
    s1hint: '观察顺序：依次按三个按钮，或拖滑杆。看绿色的 0 线移到哪里，再看海鸥和小鱼旁边的数怎样变：0 定得越高，两个数都越小。把 0 定在海底时，小鱼也成了正数。白色括号一直是 7 米，不随 0 改变。',

    s2k: '第 2 步 · 比大小',
    s2t: '−7 和 −2，哪个大？',
    s2e: '这一步要回答：两个负数怎么比大小？很多人会想「7 比 2 大，所以 −7 比 −2 大」，这是把「−」号丢掉了。回到数轴（每格代表 1，0 右边正、左边负）：规定<strong>越往右越大，越往左越小</strong>。−7 在 0 的左边 7 格，−2 在 0 的左边 2 格，−7 更靠左，所以 −7 比 −2 小，写作 −7 &lt; −2（「&lt;」读作「小于」，开口朝向大的数）。放回海面就是：海面以下 7 米比海面以下 2 米更低。',
    s2a: '数 A', s2b: '数 B',
    s2lgA: 'A 的位置', s2lgB: 'B 的位置', s2lgCards: '六张数字卡片',
    sortCards: '把六张卡片放到数轴上', unsortCards: '卡片放回原处',
    c2title: '数轴：越往右越大', c2cards: '六张卡片（还没排）',
    s2less: '{a} 在 {b} 的左边 {d} 格，所以 {a} < {b}（{a} 小于 {b}）。',
    s2equal: 'A 和 B 落在同一点 {a}，两个数相等。',
    s2trap: '注意：只看数字部分，{x} 比 {y} 大；但带上「−」号看位置，结论正好相反。',
    s2sorted: '六张卡片按位置从左到右：{list}。读法：越往左越小。',
    s2cardsIdle: '六张卡片还没放上数轴。按「把六张卡片放到数轴上」，看它们各自落到哪一格。',
    s2progress: '已放好 {k}/{N} 张。',
    s2hint: '观察顺序：先保持 A = −7，把 B 从 −2 往左拖，看 B 越过 A 的那一刻，「<」的方向怎样翻过来；再按「把六张卡片放到数轴上」，看每张卡片按自己的位置落下，最后从左往右读，就是从小到大。',

    s3k: '第 3 步 · 沿数轴走',
    s3t: '从 3 出发，向左走 5 格，会停在哪？',
    s3e: '这一步要回答：带负数的加减，答案落在哪一格？把加减看成在数轴上走路：<strong>加几就向右走几格，减几就向左走几格</strong>。起点是走之前站的那一格，<strong>落点</strong>是走完停下的那一格。从 3 向左走 5 格：先走 3 格到 0，再走 2 格到 0 的左边，落在 −2，所以 3 − 5 = −2。不用背规则，跟着格子数就行。',
    s3start: '起点', s3steps: '走几格',
    s3lgStart: '起点', s3lgRight: '向右走一格（加）', s3lgLeft: '向左走一格（减）', s3lgEnd: '落点',
    dirRight: '向右 → （加）', dirLeft: '← 向左（减）', go: '走！',
    c3title: '数轴：每一跳是一格', c3start: '起点 {v}', c3end: '落点 {v}', c3zero: '经过 0',
    s3plan: '起点 {s}，{dirw}走 {n} 格。先猜落点在哪，再按「走！」。',
    s3dirR: '向右', s3dirL: '向左',
    s3progress: '已走 {k}/{n} 格，现在在 {v}。',
    s3readout: '从 {s} {dirw}走 {n} 格，落在 {e}：{eq}。{cross}',
    s3crossYes: '途中第 {k} 格踩到 0，然后走到了 0 的另一边。',
    s3zeroStop: '第 {k} 格正好停在 0 上。',
    s3crossNo: '这次没有经过 0。',
    s3hint: '观察顺序：保持起点 3，选「向左」，把「走几格」从 1 拖到 8，每次按「走！」：落点一格一格往左移，到第 3 格时踩到 0，之后就是负数。再把起点拖到 −4、选「向右」走 3 格，看负数加上正数怎样往 0 靠近。改任何控件都会清掉上一次的路线。',

    s4k: '第 4 步 · 差几度',
    s4t: '早上 −3℃，中午 5℃，升高了几度？',
    s4e: '这一步要回答：一个温度在 0 以下、一个在 0 以上，两者差几度？<strong>温度计</strong>就是一根立起来的数轴，单位是<strong>摄氏度（℃）</strong>：0℃ 是水结冰的温度，比它冷的读作「零下」，写成负数，例如零下 3 度就是 −3℃。从 −3℃ 升到 5℃，液柱要先从 −3 升到 0（3 度），再从 0 升到 5（5 度），一共 3 + 5 = 8 度。两个温度在 0 的同一边时，就不用分段，直接数中间隔了几格。',
    s4m: '早上的温度（℃）', s4n: '中午的温度（℃）',
    s4lgM: '早上', s4lgN: '中午', s4lgBelow: '0 以下这一段', s4lgAbove: '0 以上这一段',
    count4: '一度一度数一遍',
    c4title: '温度计（立起来的数轴，℃）', c4m: '早上 {v}℃', c4n: '中午 {v}℃', c4seg: '{d} 度',
    s4up: '升高', s4down: '降低',
    s4cross: '从 {m}℃ 到 {n}℃：0 以下一段 {below} 度，0 以上一段 {above} 度，一共{verb}了 {below} + {above} = {size} 度。',
    s4same: '从 {m}℃ 到 {n}℃：都在 0 的同一边，中间隔 {size} 格，{verb}了 {size} 度。',
    s4flat: '早上和中午都是 {m}℃，温度没有变化（相差 0 度）。',
    s4progress: '已数 {k}/{N} 度。',
    s4hint: '观察顺序：先保持早上 −3℃，按「一度一度数一遍」，看液柱从 −3 爬到 5，橙色段数到 3、青色段数到 5。再把中午拖到 0 以下（比如 −8℃）：温度降低了，而且两个温度在 0 的同一边，只剩一段。',

    s5k: '第 5 步 · 自测',
    s5t: '三道题，检查自己会不会',
    s5e: '这一步要回答：前面四步学的，能不能不看图也用上？每题选好再按「检查」。答对的题会锁定；答错会告诉你回到哪一步再看看，不直接给答案。',
    q1: '1. 一条小鱼在海面以下 6 米（海面记作 0）。它的位置记作？',
    q2: '2. −9 和 −4，哪个数更小？',
    q3: '3. 早上 −3℃，下午升到 4℃。温度升高了几度？',
    correct1: '对。海面以下在 0 的另一边，写成负数：−6。',
    correct2: '对。−9 在 −4 的左边 5 格，越往左越小。',
    correct3: '对。0 以下 3 度，0 以上 4 度，一共 7 度。',
    wrong1: '再想想：海面以下和海面以上，在 0 的哪一边？回到第 0 步拖一拖。',
    wrong2: '再想想：把两个数放到数轴上，哪个更靠左？回到第 2 步看看。',
    wrong3: '再想想：从 −3 升到 0 要几度，从 0 升到 4 又要几度？回到第 4 步数一数。',
    noChoice: '先选一个答案。',
    s5score: '已答对 {c}/3 题。',

    s6k: '第 6 步 · 收束', s6t: '负数：先定一个 0，再说方向和距离',
    s6fin: '<strong>第 0 步</strong>：海面以下 3 米记作 −3。「−」号说在 0 的哪一边，数字说离 0 多远；0 既不是正数也不是负数。<strong>第 1 步</strong>：0 是我们选的，换一个 0，每个数都会改写，但两个位置之间的距离不变。<strong>第 2 步</strong>：在数轴上越往左越小，所以 −7 &lt; −2。<strong>第 3 步</strong>：加是向右走，减是向左走，走过 0 就到了另一边，例如 3 − 5 = −2。<strong>第 4 步</strong>：两个温度隔着 0 时，分两段数：从 −3℃ 到 5℃ 是 3 + 5 = 8 度。',
    formula: '海面以下 3 米 → −3\n−7 < −2 < 0 < 3\n3 − 5 = −2　　−4 + 3 = −1\n从 −3°C 到 5°C：3 + 5 = 8 度',
    boundary: '适用范围：本页只用整数（每格 1），分数和小数的负数住在格子之间，道理相同。加减只演示「加上一个正数 = 向右走、减去一个正数 = 向左走」；减去一个负数等算法留给后面的课。温度计、海面的例子都是为了看清位置，数字是举例用的，不是实测数据。',
    linksTitle: '接着去哪儿',
    lk1: '→ 分数第 1 步：分数也是数轴上的一个点，住在整数格子之间',
    lk2: '→ 除法与余数第 2 步：同样沿数轴一格一格跳，数能跳几次、剩几格',
    lk3: '→ 实数与数轴第 0 步：连 √2 这样的数，也能在数轴上找到自己的位置',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《负数 · 0 以下的世界》的平行版本。'
  },
  en: {
    pageTitle: 'Negative Numbers · The Other Side of Zero',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Negative Numbers · The World Below Zero →',
    navLabel: 'Negative numbers steps',
    tagline: 'Three metres below the sea surface, five degrees below freezing, two squares to the left of where you started: how do you write an amount that sits on the other side of zero? Starting from the sea surface, this page uses an upright ruler and a number line to write negative numbers, compare them, walk with them, and count how far apart two temperatures are.',
    nav0: '0 Below the sea', nav1: '1 Pick a zero', nav2: '2 Which is bigger', nav3: '3 Walk the line', nav4: '4 How many degrees', nav5: '5 Quiz', nav6: '6 Wrap-up',
    lgPos: 'positive (above / right of 0)', lgNeg: 'negative (below / left of 0)',
    clearTrail: 'Clear the white dots',
    check: 'Check',

    s0k: 'Step 0 · Below zero',
    s0t: 'Can one number say “3 metres below the sea”?',
    s0e: 'This step answers: what number do we write for a place lower than 0? Call the height of the <strong>sea surface</strong> 0 metres. Three metres above it is written 3 (or +3); numbers bigger than 0 are called <strong>positive numbers</strong>. Three metres below it is on the other side of 0, so we write <strong>−3</strong> and say “negative three”. A number on that other side, written with a “−” in front, is a <strong>negative number</strong>. The “−” only tells you which side of 0 you are on; the 3 tells you how far from 0. Zero itself is the dividing point, neither positive nor negative. The top picture is an upright height ruler. Tip it over to the right and you get the <strong>number line</strong> below (a straight line with marks one unit apart): “up” on the ruler becomes “right” on the line, so positive numbers sit to the right of 0 and negative numbers to the left.',
    s0slider: 'Height above the sea (m)',
    s0lgTwin: 'the number just as far from 0 on the other side',
    s0lgTrail: 'places you stopped at',
    c0gauge: 'Upright: height above the sea (m)', c0line: 'Tipped over: number line (up on the ruler = right)', c0sea: 'sea = 0',
    s0above: '{d} m above the sea → write {v}: a positive number, {d} marks to the right of 0. The number on the other side, just as far from 0 ({d} marks), is {t}.',
    s0below: '{d} m below the sea → write {v}, said “negative {d}”: a negative number, {d} marks to the left of 0. The number on the other side, just as far from 0 ({d} marks), is {t}.',
    s0zero: 'Exactly at the surface → write 0. Zero is the dividing point: neither positive nor negative.',
    s0hint: 'What to try: move only the height slider. Drag it up and the gull climbs, giving a positive reading; drag it down and the fish dives, and the reading turns negative. Each time, check three things: the mark on the ruler, the dot for the same number on the line below (higher on the ruler = further right on the line), and the dashed ring showing the number just as far from 0 on the other side. Every place you stop leaves a white dot on the line.',

    s1k: 'Step 1 · We choose the zero',
    s1t: 'If something else is zero, do the gull’s and the fish’s numbers change?',
    s1e: 'This step answers: is a position’s number stuck to the thing itself, or counted from wherever 0 is? The gull and the fish stay put (the gull 4 m above the sea, the fish 3 m below). Now move “zero” somewhere else: the boat’s deck (2 m above the sea), or the sea floor (6 m below). Once the new zero is fixed, anything higher gets a positive number and anything lower a negative one, and the size is the distance in metres from the new zero. The green line is the zero you chose; the ruler’s marks are rewritten to match.',
    s1slider: 'Put zero this many metres above the sea (negative = below)',
    s1lgZero: 'the zero you chose', s1lgSea: 'sea surface (it does not move)', s1lgGap: 'distance between gull and fish',
    zeroSea: 'Zero at the sea surface', zeroDeck: 'Zero at the deck', zeroBed: 'Zero at the sea floor',
    s1zSea: 'the sea surface', s1zDeck: 'the deck', s1zBed: 'the sea floor', s1zUp: '{r} m above the sea', s1zDown: '{r} m below the sea',
    c1title: 'Same sea, different zero', c1zero: 'new 0', c1bird: 'gull {v}', c1fish: 'fish {v}', c1gap: '{g} m apart',
    s1readout: 'Zero at {zero}: the gull is {bird} and the fish is {fish}. They are still {g} m apart. Moving zero rewrites every number but never changes the distance between two places.',
    s1hint: 'What to try: press the three buttons in turn, or drag the slider. Watch where the green zero line goes, then read the numbers beside the gull and the fish: the higher you put zero, the smaller both numbers get. With zero on the sea floor, even the fish is positive. The white bracket stays at 7 m whatever zero you pick.',

    s2k: 'Step 2 · Comparing',
    s2t: 'Which is bigger, −7 or −2?',
    s2e: 'This step answers: how do you compare two negative numbers? A common slip is “7 is more than 2, so −7 is more than −2”, which simply forgets the “−”. Go back to the number line (one unit per mark, positives right of 0, negatives left): <strong>further right means bigger, further left means smaller</strong>. −7 is 7 marks left of 0 and −2 is 2 marks left of 0. −7 is further left, so −7 is smaller than −2, written −7 &lt; −2 (“&lt;” means “is less than”, and its open side faces the bigger number). Back at sea: 7 m below the surface is lower than 2 m below it.',
    s2a: 'Number A', s2b: 'Number B',
    s2lgA: 'where A sits', s2lgB: 'where B sits', s2lgCards: 'six number cards',
    sortCards: 'Drop the six cards onto the line', unsortCards: 'Put the cards back',
    c2title: 'Number line: further right is bigger', c2cards: 'six cards (not placed yet)',
    s2less: '{a} is {d} marks to the left of {b}, so {a} < {b} ({a} is less than {b}).',
    s2equal: 'A and B land on the same point, {a}: the two numbers are equal.',
    s2trap: 'Careful: looking at the digits alone, {x} is more than {y}; with the “−” sign, position gives the opposite answer.',
    s2sorted: 'The six cards from left to right: {list}. Read left to right and you go from smallest to biggest.',
    s2cardsIdle: 'The six cards are not on the line yet. Press “Drop the six cards onto the line” and watch where each one lands.',
    s2progress: '{k}/{N} cards placed.',
    s2hint: 'What to try: keep A = −7 and drag B left from −2. Watch the moment B passes A: the “<” flips round. Then press “Drop the six cards onto the line” and watch each card fall to its own mark; reading them left to right gives smallest to biggest.',

    s3k: 'Step 3 · Walking the line',
    s3t: 'Start at 3 and walk 5 marks left. Where do you stop?',
    s3e: 'This step answers: when negatives are involved, where does an addition or a subtraction land? Treat it as a walk on the number line: <strong>adding a number means walking that many marks right, subtracting means walking that many marks left</strong>. The start is the mark you stand on before walking; the <strong>landing point</strong> is where you stop. From 3, walk 5 left: 3 marks take you to 0, then 2 more take you past it to −2. So 3 − 5 = −2. No rule to memorise: just count the marks.',
    s3start: 'Start', s3steps: 'Marks to walk',
    s3lgStart: 'start', s3lgRight: 'one mark right (add)', s3lgLeft: 'one mark left (subtract)', s3lgEnd: 'landing point',
    dirRight: 'Right → (add)', dirLeft: '← Left (subtract)', go: 'Walk!',
    c3title: 'Number line: each hop is one mark', c3start: 'start {v}', c3end: 'land {v}', c3zero: 'passed 0',
    s3plan: 'Start at {s} and walk {n} marks {dirw}. Guess the landing point first, then press “Walk!”.',
    s3dirR: 'right', s3dirL: 'left',
    s3progress: '{k}/{n} marks walked; now at {v}.',
    s3readout: 'From {s}, {n} marks {dirw} lands on {e}: {eq}. {cross}',
    s3crossYes: 'Hop {k} landed on 0, and the walk carried on to the other side.',
    s3zeroStop: 'Hop {k} stopped exactly on 0.',
    s3crossNo: 'This walk never touched 0.',
    s3hint: 'What to try: keep the start at 3, choose “Left”, and set “Marks to walk” to 1, 2, … 8, pressing “Walk!” each time. The landing point creeps left one mark at a time; on hop 3 it reaches 0, and after that it is negative. Then set the start to −4, choose “Right” and walk 3: a negative number plus a positive one moves towards 0. Changing any control clears the previous route.',

    s4k: 'Step 4 · How many degrees',
    s4t: 'From −3℃ in the morning to 5℃ at noon: how much warmer?',
    s4e: 'This step answers: when one temperature is below 0 and the other above, how far apart are they? A <strong>thermometer</strong> is a number line stood on end, marked in <strong>degrees Celsius (℃)</strong>: 0℃ is where water freezes, and anything colder is “below zero”, written as a negative number, so three degrees below zero is −3℃. To go from −3℃ to 5℃ the liquid first rises from −3 to 0 (3 degrees) and then from 0 to 5 (5 degrees): 3 + 5 = 8 degrees in all. When both temperatures are on the same side of 0, there is only one stretch: just count the marks between them.',
    s4m: 'Morning temperature (℃)', s4n: 'Noon temperature (℃)',
    s4lgM: 'morning', s4lgN: 'noon', s4lgBelow: 'stretch below 0', s4lgAbove: 'stretch above 0',
    count4: 'Count it one degree at a time',
    c4title: 'Thermometer (an upright number line, ℃)', c4m: 'morning {v}℃', c4n: 'noon {v}℃', c4seg: '{d}°',
    s4up: 'rose', s4down: 'fell',
    s4cross: 'From {m}℃ to {n}℃: {below} degrees below 0 and {above} above it, so it {verb} by {below} + {above} = {size} degrees.',
    s4same: 'From {m}℃ to {n}℃: both on the same side of 0, {size} marks apart, so it {verb} by {size} degrees.',
    s4flat: 'Morning and noon are both {m}℃: no change (0 degrees apart).',
    s4progress: '{k}/{N} degrees counted.',
    s4hint: 'What to try: keep the morning at −3℃ and press “Count it one degree at a time”. The liquid climbs from −3 to 5; the orange stretch counts to 3 and the cyan one to 5. Then drag noon below 0 (say −8℃): the temperature fell, and with both readings on the same side of 0 only one stretch is left.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Three questions to check yourself',
    s5e: 'This step answers: can you use the last four steps without the pictures? Pick an answer, then press “Check”. A correct answer locks; a wrong one tells you which step to revisit rather than giving the answer away.',
    q1: '1. A fish is 6 m below the sea surface (the surface is 0). What number gives its position?',
    q2: '2. Which is smaller, −9 or −4?',
    q3: '3. It is −3℃ in the morning and 4℃ in the afternoon. By how many degrees did it rise?',
    correct1: 'Right. Below the surface is the other side of 0, so it is negative: −6.',
    correct2: 'Right. −9 is 5 marks to the left of −4, and further left is smaller.',
    correct3: 'Right. 3 degrees below 0 plus 4 above it: 7 degrees.',
    wrong1: 'Not quite: which side of 0 are “below the surface” and “above the surface”? Go back to step 0 and drag the slider.',
    wrong2: 'Not quite: put both numbers on the line. Which one is further left? Have another look at step 2.',
    wrong3: 'Not quite: how many degrees from −3 up to 0, and how many from 0 up to 4? Count them in step 4.',
    noChoice: 'Pick an answer first.',
    s5score: '{c}/3 answered correctly.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Negative numbers: fix a zero, then give a side and a distance',
    s6fin: '<strong>Step 0</strong>: 3 m below the sea is written −3. The “−” says which side of 0, the digits say how far; zero is neither positive nor negative. <strong>Step 1</strong>: we choose where 0 is. A different zero rewrites every number but leaves the distance between two places unchanged. <strong>Step 2</strong>: on the number line, further left is smaller, so −7 &lt; −2. <strong>Step 3</strong>: adding walks right and subtracting walks left; walking past 0 takes you to the other side, as in 3 − 5 = −2. <strong>Step 4</strong>: when two temperatures straddle 0, count in two stretches: from −3℃ to 5℃ is 3 + 5 = 8 degrees.',
    formula: '3 m below the sea → −3\n−7 < −2 < 0 < 3\n3 − 5 = −2　　−4 + 3 = −1\nfrom −3°C to 5°C: 3 + 5 = 8 degrees',
    boundary: 'Scope: this page uses whole numbers only (one unit per mark); negative fractions and decimals live between the marks and behave the same way. The walks only show “adding a positive number = walk right, subtracting a positive number = walk left”; subtracting a negative number and similar rules are left for later lessons. The sea and thermometer numbers are examples chosen to make positions easy to see, not measurements.',
    linksTitle: 'Where to go next',
    lk1: '→ Fractions, step 1: a fraction is also a point on the number line, between the whole-number marks',
    lk2: '→ Division and remainders, step 2: hopping along the number line again, counting hops and what is left over',
    lk3: '→ Real numbers, step 0: even a number like √2 has its own point on the line',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Negative Numbers · The World Below Zero”.'
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
