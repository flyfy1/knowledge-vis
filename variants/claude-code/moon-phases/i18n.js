'use strict';
// Moon phases lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).
const STRINGS = {
  zh: {
    pageTitle: '月相 · 月亮的亮面一直在，变的是我们看的角度',
    back: '← 知识索引',
    compare: '对照另一版本：月相 · 从地球看被照亮的那一半 →',
    navLabel: '月相步骤导航',
    tagline: '月亮自己不发光，我们看到的是它被太阳照亮的那一面。月亮总有一半是亮的；它绕着地球转，我们从地球上看过去，有时正对着亮面，有时只看到一条边，于是就有了圆缺。七步里你会先从太空俯视，再回到地球上看，数出一个月的八种月相，算出月亮什么时候升起，再想想为什么不是每次满月都有月食。',
    nav0: '0 哪半边亮', nav1: '1 从地球看', nav2: '2 一个月', nav3: '3 何时升起', nav4: '4 月食', nav5: '5 猜位置', nav6: '6 收束',
    pos: '月亮在轨道上的位置（从「在太阳和地球之间」算起，逆时针转过的角度）',
    // phases
    new: '新月', waxCres: '娥眉月', firstQ: '上弦月', waxGib: '盈凸月', full: '满月', wanGib: '亏凸月', lastQ: '下弦月', wanCres: '残月',
    sideRight: '右边亮', sideLeft: '左边亮', sideNone0: '几乎看不到亮面', sideNone180: '整个圆面都亮',
    // step 0
    s0k: '第 0 步 · 从太空往下看',
    s0t: '月亮被太阳照着，哪一半是亮的？',
    s0e: '这一步要回答：月亮在不同位置时，它身上亮的是哪一半？月亮自己不发光，它亮，是因为太阳光照在它身上。太阳离得非常远，照到地球和月亮附近的光几乎是一束束平行的光，都从同一个方向来。在下面的图里，我们从北极上空往下看：太阳在右边很远的地方，地球在中间，月亮绕着地球逆时针转一圈，这叫月亮的<strong>公转</strong>。任何一个被光照着的球，朝着光的那一半亮、背着光的那一半暗。',
    c0: '从北极上空往下看（大小和距离都不按比例）',
    s0lgSun: '太阳光（从右边来）', s0lgLit: '被照亮的一半', s0lgDark: '没被照亮的一半', s0lgNow: '月亮现在的位置', s0lgGhost: '月亮的其他位置',
    s0readout: '月亮转过了 {a}°。它朝右（朝太阳）的那一半是亮的，朝左的那一半是暗的。灰色的月亮在别的位置，也都是右半边亮。',
    s0hint: '观察顺序：慢慢拖滑杆，让月亮绕地球走一圈。盯住月亮身上亮的那一半：它始终朝右，因为光一直从右边来。月亮走到哪里都一样——总是一半亮、一半暗。',
    // step 1
    s1k: '第 1 步 · 回到地球上看',
    s1t: '从地球上看过去，能看到亮的那一半中的多少？',
    s1e: '这一步要回答：既然月亮总是一半亮，为什么我们看到的月亮有时圆、有时弯？因为我们站在地球上，只能看到月亮<strong>朝着地球的那一半</strong>。这一半里有多少是亮的，取决于月亮转到了哪里。我们看到的亮的形状就叫<strong>月相</strong>。俯视图里虚线框住的是朝着地球的那一半；另一张图是站在北半球抬头看到的月亮。下面的「亮的部分」是指圆面上亮的面积占整个圆面的百分之几。',
    c1a: '俯视：虚线是朝着地球的那一半', c1b: '在北半球抬头看到的月亮',
    s1lgFace: '朝着地球的那一半', s1lgLit: '被照亮的一半',
    s1readout: '月亮转过了 {a}°：这是{name}，{side}，亮的部分占圆面的 {pct}%。',
    s1hint: '观察顺序：从 0° 开始拖。0° 时月亮在太阳和地球之间，朝着我们的一半全是暗的（新月）；90° 时朝着我们的一半里右边一半是亮的（上弦月）；180° 时朝着我们的正好是亮的一半（满月）；270° 时只剩左边一半亮（下弦月）。',
    // step 2
    s2k: '第 2 步 · 一个月',
    s2t: '一个月里，月相按什么顺序变？多久转一圈？',
    s2e: '这一步要回答：月相变化的顺序是什么，多少天回到原样？从一次新月到下一次新月，平均要 <strong>29.53 天</strong>，这段时间叫一个<strong>朔望月</strong>。从新月那天算起过了几天，就叫<strong>月龄</strong>几天。按「播放一个月」，月历里的格子会一天天填上当天的月亮；下面的八种月相，看到一种就打一个勾。',
    age: '月龄（新月后的第几天）', playMonth: '播放一个月', pause: '暂停', clear2: '清空月历',
    c2a: '这一天的月亮（北半球看）', c2b: '月历：每格是一天（月龄 0–29）',
    s2lgCell: '已经看过的那天', s2lgNow: '今天',
    s2readout: '月龄 {age} 天（月亮转过 {a}°）：{name}，亮的部分 {pct}%。',
    s2seen: '已经看到的月相 {k}/8：',
    s2hint: '观察顺序：按「播放一个月」，看月历从左上角一格格填满：先是右边一条细细的亮边，亮面向左长大，到第 15 天左右变圆，再从右边开始变暗，最后只剩左边一条，又回到新月。名字带「弦」的两天，正好看到半个圆面亮。',
    // step 3
    s3k: '第 3 步 · 什么时候能看见',
    s3t: '满月和上弦月，分别在什么时候升起？',
    s3e: '这一步要回答：不同月相的月亮，几点升起、几点落下？地球每 24 小时自转一圈（<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step3">→ 昼夜交替第 3 步：太阳为什么东升西落</a>），站在地球上的人被带着转，先转到能看见月亮的一面，月亮就从东边<strong>地平线</strong>（眼睛能看到的天和地的分界线）升起；再转过去，月亮就从西边落下。月亮在轨道上的位置决定了人要转到几点才能看见它。下面的时间是以太阳最高时为 12 点的时间，假设人站在赤道附近，并且不考虑月亮轨道的倾斜。',
    tau: '一天中的时刻', playDay: '播放一天', btnNew: '新月', btnFirst: '上弦月', btnFull: '满月', btnLast: '下弦月',
    c3a: '俯视：小人站在地球上，跟着地球转', c3b: '小人看到的天空（东在左，西在右）',
    east: '东', west: '西',
    s3lgPerson: '小人和他的地平线', s3lgSun: '太阳', s3lgMoon: '月亮', s3lgPath: '今天已走过的月亮位置',
    s3readout: '{time}：太阳{sun}，月亮{moon}。{name}大约 {rise} 升起、{set} 落下。',
    sunUp: '在天上', sunDown: '在地平线下（夜里）', moonUp: '在天上', moonDown: '在地平线下',
    s3newNote: '新月和太阳一起升落，又是暗面朝着我们，所以看不见。',
    s3hint: '观察顺序：先按「满月」，再按「播放一天」：太阳落下的时候，月亮正从东边升起，整夜都在天上。再按「上弦月」：中午升起，傍晚高挂在头顶附近，半夜落下。月亮每天比前一天大约晚 {delay} 分钟升起，因为一天里月亮在轨道上又往前走了一段。',
    // step 4
    s4k: '第 4 步 · 月食',
    s4t: '满月时地球在中间，为什么不是每次满月都有月食？',
    s4e: '这一步要回答：满月时太阳、地球、月亮差不多排成一条线，地球的影子朝着月亮，为什么月亮多数时候不会走进影子？因为月亮绕地球的轨道和地球绕太阳的轨道不在同一个平面上，两者斜着相交，夹角约 5°。满月时月亮常常从地球影子的上方或下方经过。地球背后完全照不到太阳光的那块影子叫<strong>本影</strong>；在月亮那么远的地方，本影的半径大约是 {umbra} 千米，而月亮的半径是 1737 千米。月亮碰到本影，就是<strong>月食</strong>：整个月亮进去叫月全食，进去一部分叫月偏食。',
    fullIdx: '这一年的第几次满月', prevYear: '上一年', nextYear: '下一年',
    c4: '在月亮那么远的地方：每次满月，月亮离地球影子有多远',
    s4lgShadow: '地球的本影', s4lgMoon: '满月（没进影子）', s4lgEcl: '满月（碰到影子：月食）', s4lgSel: '选中的这次满月',
    s4readout: '模拟的第 {y} 年，第 {i} 次满月：月亮中心在地球影子中心{dir} {h} 千米。{kind}',
    s4above: '上方', s4below: '下方',
    kindTotal: '整个月亮都在本影里——月全食。', kindPartial: '月亮有一部分进了本影——月偏食。', kindNone: '月亮没有碰到本影——没有月食。',
    s4year: '这一年有 {n} 次满月，其中 {k} 次发生月食（全食 {t} 次，偏食 {p} 次）。',
    s4hint: '观察顺序：先看这一年：大多数满月离影子很远，最多只有一两次掠过或穿过影子。再按「下一年」：离影子近的满月总是落在相隔约半年的两段日子里，而且这两段日子每年提前约 19 天；有些年份这两段日子里的满月也刚好都错过了影子（试试第 6 年），那一年就没有月食。注意纵向距离画得比横向夸张。',
    // step 5
    s5k: '第 5 步 · 看月相，猜位置',
    s5t: '看到这样的月亮，它在轨道上的哪里？',
    s5e: '这一步要回答：反过来，看到一个月相，你能说出月亮、地球、太阳是怎么排的吗？看「今晚看到的月亮」这张图（北半球看到的样子），在俯视图里拖滑杆把月亮放到你认为的位置，再按「检查」。和正确位置相差不超过 22.5°（八分之一圈的一半）就算对。',
    guess: '你猜的月亮位置', check: '检查', nextQ: '换一个月相',
    c5a: '今晚看到的月亮', c5b: '俯视：把月亮放到轨道上',
    s5lgGuess: '你猜的位置', s5lgTrue: '正确位置（检查后显示）',
    s5before: '第 {round} 题：拖滑杆把月亮放到轨道上，再按「检查」。',
    s5right: '第 {round} 题：对了！这是{name}，月亮在 {a}°。',
    s5wrong: '第 {round} 题：还差一点。这是{name}，月亮应该在 {a}°（橙色）。提示：{tip}',
    tipRight: '右边亮说明月亮在逆时针走的前半圈（0°–180°），也就是满月之前。', tipLeft: '左边亮说明月亮在后半圈（180°–360°），也就是满月之后。', tipNew: '完全看不到亮面，说明月亮在太阳和地球之间。', tipFull: '整个圆都亮，说明地球在太阳和月亮之间。',
    s5score: '答对 {c}/{n} 题。',
    s5none: '还没有检查过。',
    s5hint: '提示：先看亮的是哪一边，判断是满月之前还是之后；再看亮了多少：越接近圆，月亮越靠近太阳的对面。',
    // step 6
    s6k: '第 6 步 · 收束',
    s6t: '一句话说清月相',
    s6fin: '月亮自己不发光，<strong>永远有一半被太阳照亮</strong>；我们在地球上只能看到朝着地球的那一半，其中亮的部分有多少，取决于月亮在轨道上转到了哪里——这就是<strong>月相</strong>。从新月到下一次新月平均 29.53 天，月相按「新月 → 娥眉月 → 上弦月 → 盈凸月 → 满月 → 亏凸月 → 下弦月 → 残月」变化。地球的影子只在月亮正好穿过它时才遮住月亮，所以月食不是每个月都有。',
    formula: '看到的亮的部分 = (1 − cos θ) ÷ 2\n一个朔望月 ≈ 29.53 天',
    boundary: '模型实话：图中的大小和距离都没有按比例（真实的月地距离约是地球直径的 30 倍）；月亮的轨道画成正圆，其实略扁；月相形状按北半球看的方向画，在南半球看左右相反；第 3 步假设人站在赤道附近、不考虑月亮轨道的倾斜和大气折射，升落时刻只是粗略的；第 4 步只算本影，不算更淡的半影，而且只按平均距离计算，每年的满月排列只是示意，不对应真实的年份。月亮绕地球一圈（相对星星）只要约 27.32 天，比朔望月短，是因为这段时间里地球也绕太阳走了一段，月亮要多走两天多才回到和太阳相同的相对位置。',
    linksTitle: '接着看',
    lk1: '昼夜交替 · 第 1 步：被照亮的一半与晨昏线（地球也一样）→',
    lk2: '昼夜交替 · 第 3 步：为什么天体都东升西落 →',
    lk3: '地球公转与四季 · 第 0 步：地球绕太阳转一圈是一年 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《月相 · 从地球看被照亮的那一半》的平行版本。'
  },
  en: {
    pageTitle: 'Moon Phases · The Lit Half Never Goes Away; Our View Changes',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Moon Phases · The Lit Half, Seen from Earth →',
    navLabel: 'Moon phases steps',
    tagline: 'The Moon makes no light of its own; what we see is the side the Sun lights up. Half of the Moon is always lit. As it goes round Earth, we sometimes face that lit half head-on and sometimes see only its edge — that is why it waxes and wanes. In seven steps you will look down from space, then from the ground, collect a month of phases, work out when the Moon rises, and find out why not every full moon brings an eclipse.',
    nav0: '0 Which half', nav1: '1 From Earth', nav2: '2 One month', nav3: '3 Moonrise', nav4: '4 Eclipses', nav5: '5 Guess', nav6: '6 Wrap-up',
    pos: 'Moon\'s place on its orbit (degrees turned anticlockwise from "between the Sun and Earth")',
    new: 'new moon', waxCres: 'waxing crescent', firstQ: 'first quarter', waxGib: 'waxing gibbous', full: 'full moon', wanGib: 'waning gibbous', lastQ: 'last quarter', wanCres: 'waning crescent',
    sideRight: 'lit on the right', sideLeft: 'lit on the left', sideNone0: 'almost no lit part showing', sideNone180: 'the whole disc lit',
    s0k: 'Step 0 · Look down from space',
    s0t: 'With sunlight on it, which half of the Moon is lit?',
    s0e: 'This step answers: wherever the Moon is, which half of it is lit? The Moon makes no light; it shines because sunlight falls on it. The Sun is so far away that its light near Earth and the Moon arrives as parallel rays, all from the same direction. In the picture we look down from above the North Pole: the Sun is far off to the right, Earth is in the middle, and the Moon travels anticlockwise round Earth — its <strong>orbit</strong>. Any ball in sunlight is bright on the half facing the light and dark on the half facing away.',
    c0: 'From above the North Pole (not to scale)',
    s0lgSun: 'sunlight (from the right)', s0lgLit: 'lit half', s0lgDark: 'unlit half', s0lgNow: 'the Moon now', s0lgGhost: 'the Moon at other places',
    s0readout: 'The Moon has turned {a}°. Its right half (facing the Sun) is lit and its left half is dark. The grey Moons at other places are all lit on the right too.',
    s0hint: 'What to watch: drag the slider slowly so the Moon goes once round Earth. Keep your eye on its lit half: it always faces right, because the light always comes from the right. Wherever the Moon is, it is half lit and half dark.',
    s1k: 'Step 1 · Back on Earth',
    s1t: 'Looking up from Earth, how much of that lit half can we see?',
    s1e: 'This step answers: if the Moon is always half lit, why does it look round on some nights and thin on others? From Earth we can only see <strong>the half of the Moon that faces Earth</strong>. How much of that half is lit depends on where the Moon is on its orbit. The lit shape we see is called the Moon\'s <strong>phase</strong>. In the view from above, the dashed outline marks the half facing Earth; the other picture is the Moon as you see it looking up from the northern hemisphere. "Lit part" below means the bright area as a percentage of the whole disc.',
    c1a: 'From above: the dashed half faces Earth', c1b: 'The Moon as seen from the northern hemisphere',
    s1lgFace: 'the half facing Earth', s1lgLit: 'the lit half',
    s1readout: 'The Moon has turned {a}°: this is a {name}, {side}; the lit part is {pct}% of the disc.',
    s1hint: 'What to watch: start at 0° and drag. At 0° the Moon is between the Sun and Earth, so the half facing us is all dark (new moon); at 90° the right half of the half facing us is lit (first quarter); at 180° the half facing us is exactly the lit half (full moon); at 270° only the left half is lit (last quarter).',
    s2k: 'Step 2 · One month',
    s2t: 'In what order do the phases come, and how long is a full round?',
    s2e: 'This step answers: what order do the phases follow, and how many days until they repeat? From one new moon to the next takes <strong>29.53 days</strong> on average; this is a <strong>lunar month</strong> (synodic month). The number of days since the last new moon is the Moon\'s <strong>age</strong>. Press "Play one month" and the calendar fills in day by day with that day\'s Moon; below, each of the eight phases gets a tick once you have seen it.',
    age: 'Moon\'s age (days since new moon)', playMonth: 'Play one month', pause: 'Pause', clear2: 'Clear calendar',
    c2a: 'The Moon on this day (seen from the north)', c2b: 'Calendar: one box per day (age 0–29)',
    s2lgCell: 'days already seen', s2lgNow: 'today',
    s2readout: 'Age {age} days (Moon turned {a}°): {name}, lit part {pct}%.',
    s2seen: 'Phases seen so far {k}/8: ',
    s2hint: 'What to watch: press "Play one month" and watch the calendar fill from the top left: first a thin bright edge on the right, the lit part growing leftwards, round at about day 15, then darkening from the right until only a sliver on the left is left, and back to new moon. On the two "quarter" days exactly half the disc is lit.',
    s3k: 'Step 3 · When can we see it',
    s3t: 'When does a full moon rise? And a first-quarter moon?',
    s3e: 'This step answers: at what time does each phase rise and set? Earth spins once every 24 hours (<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step3">→ Day and night, step 3: why the sky rises in the east</a>), carrying everyone round. When you are turned towards the Moon\'s side it rises above the eastern <strong>horizon</strong> (the line where sky meets ground); as you turn on, it sets in the west. Where the Moon is on its orbit decides what time you reach it. Times below count 12:00 as the moment the Sun is highest; we assume you stand near the equator and ignore the tilt of the Moon\'s orbit.',
    tau: 'Time of day', playDay: 'Play one day', btnNew: 'New', btnFirst: 'First quarter', btnFull: 'Full', btnLast: 'Last quarter',
    c3a: 'From above: a person on Earth turns with it', c3b: 'The sky the person sees (east left, west right)',
    east: 'E', west: 'W',
    s3lgPerson: 'the person and their horizon', s3lgSun: 'Sun', s3lgMoon: 'Moon', s3lgPath: 'Moon positions so far today',
    s3readout: '{time}: the Sun is {sun}, the Moon is {moon}. A {name} rises at about {rise} and sets at about {set}.',
    sunUp: 'up', sunDown: 'below the horizon (night)', moonUp: 'up', moonDown: 'below the horizon',
    s3newNote: 'A new moon rises and sets with the Sun and shows us its dark side, so we cannot see it.',
    s3hint: 'What to watch: press "Full", then "Play one day" — as the Sun sets, the Moon rises in the east and stays up all night. Press "First quarter": it rises at noon, stands high overhead at dusk and sets at midnight. Each day the Moon rises about {delay} minutes later than the day before, because in a day it has moved a little further along its orbit.',
    s4k: 'Step 4 · Eclipses',
    s4t: 'At full moon Earth is in the middle — so why is not every full moon eclipsed?',
    s4e: 'This step answers: at full moon the Sun, Earth and Moon are nearly in a line and Earth\'s shadow points at the Moon — so why does the Moon usually miss it? Because the Moon\'s orbit round Earth and Earth\'s orbit round the Sun are not in the same flat plane; they cross at an angle of about 5°. At most full moons the Moon passes above or below Earth\'s shadow. The part of the shadow that gets no direct sunlight at all is the <strong>umbra</strong>; at the Moon\'s distance its radius is about {umbra} km, while the Moon\'s radius is 1737 km. When the Moon touches the umbra we get a <strong>lunar eclipse</strong>: total if the whole Moon goes in, partial if only part of it does.',
    fullIdx: 'Which full moon of this year', prevYear: 'Previous year', nextYear: 'Next year',
    c4: 'Each full moon\'s distance from Earth\'s shadow',
    s4lgShadow: 'Earth\'s umbra', s4lgMoon: 'full moon (misses the shadow)', s4lgEcl: 'full moon (touches it: eclipse)', s4lgSel: 'the selected full moon',
    s4readout: 'Simulated year {y}, full moon {i}: the Moon\'s centre passes {h} km {dir} the centre of Earth\'s shadow. {kind}',
    s4above: 'above', s4below: 'below',
    kindTotal: 'The whole Moon is inside the umbra — a total lunar eclipse.', kindPartial: 'Part of the Moon enters the umbra — a partial lunar eclipse.', kindNone: 'The Moon misses the umbra — no eclipse.',
    s4year: 'This year has {n} full moons; {k} of them are eclipsed ({t} total, {p} partial).',
    s4hint: 'What to watch: look at this year first — most full moons pass far from the shadow; at most one or two graze or cross it. Then press "Next year": the full moons that come close to the shadow always fall in two stretches about half a year apart, and those stretches come about 19 days earlier each year. In some years the full moons in both stretches just miss the shadow (try year 6), and that year has no eclipse. Note that vertical distances are drawn exaggerated compared with horizontal ones.',
    s5k: 'Step 5 · See a phase, find the place',
    s5t: 'You see a Moon like this — where is it on its orbit?',
    s5e: 'This step answers: the other way round — from a phase, can you tell how the Moon, Earth and Sun are lined up? Look at the Moon in the "Moon you see tonight" picture (as seen from the northern hemisphere), drag the slider to put the Moon where you think it is in the view from above, and press "Check". Within 22.5° of the right place (half of an eighth of a turn) counts as correct.',
    guess: 'Where you put the Moon', check: 'Check', nextQ: 'Another phase',
    c5a: 'The Moon you see tonight', c5b: 'From above: put the Moon on its orbit',
    s5lgGuess: 'your guess', s5lgTrue: 'the right place (shown after checking)',
    s5before: 'Question {round}: drag the slider to put the Moon on its orbit, then press "Check".',
    s5right: 'Question {round}: correct! It is a {name}, with the Moon at {a}°.',
    s5wrong: 'Question {round}: not quite. It is a {name}; the Moon should be at {a}° (orange). Hint: {tip}',
    tipRight: 'lit on the right means the Moon is on the first half of its anticlockwise trip (0°–180°), before full moon.', tipLeft: 'lit on the left means the second half (180°–360°), after full moon.', tipNew: 'no lit part at all means the Moon is between the Sun and Earth.', tipFull: 'a fully lit disc means Earth is between the Sun and the Moon.',
    s5score: '{c}/{n} correct.',
    s5none: 'Nothing checked yet.',
    s5hint: 'Tip: first see which side is lit, to tell before or after full moon; then how much is lit — the rounder it is, the closer the Moon is to the side opposite the Sun.',
    s6k: 'Step 6 · Wrap-up',
    s6t: 'Moon phases in one sentence',
    s6fin: 'The Moon makes no light and <strong>always has one half lit by the Sun</strong>; from Earth we see only the half facing us, and how much of it is lit depends on where the Moon is on its orbit — that is the <strong>phase</strong>. From one new moon to the next takes 29.53 days on average, and the phases run new → waxing crescent → first quarter → waxing gibbous → full → waning gibbous → last quarter → waning crescent. Earth\'s shadow covers the Moon only when the Moon passes right through it, so eclipses do not happen every month.',
    formula: 'lit part we see = (1 − cos θ) ÷ 2\none lunar month ≈ 29.53 days',
    boundary: 'Honest model notes: sizes and distances in the pictures are not to scale (the real Earth–Moon distance is about 30 Earth diameters); the Moon\'s orbit is drawn as a perfect circle, though it is slightly oval; phase shapes are drawn as seen from the northern hemisphere — from the southern hemisphere left and right swap; step 3 assumes you stand near the equator and ignores the tilt of the Moon\'s orbit and the air\'s bending of light, so rise and set times are rough; step 4 counts only the umbra, not the fainter penumbra, uses average distances, and its sequence of full moons is only an illustration, not a real calendar year. The Moon goes round Earth relative to the stars in only about 27.32 days, shorter than the lunar month, because meanwhile Earth has moved along its own orbit and the Moon needs a little over two more days to line up with the Sun the same way again.',
    linksTitle: 'Keep going',
    lk1: 'Day and night · step 1: the lit half and the day–night line (Earth has one too) →',
    lk2: 'Day and night · step 3: why things in the sky rise in the east →',
    lk3: 'Earth\'s orbit & the seasons · step 0: one trip round the Sun is a year →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Moon Phases · The Lit Half, Seen from Earth".'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { const saved = localStorage.getItem('knowledge-lang'); if (saved === 'zh' || saved === 'en') lang = saved; else lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; } catch (_) { lang = /^zh/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'zh' : 'en'; }
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
  if (typeof window.refreshMoon === 'function') window.refreshMoon();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MOON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
