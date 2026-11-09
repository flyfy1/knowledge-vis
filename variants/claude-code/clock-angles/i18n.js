'use strict';
// Clock-hands lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '时钟 · 分针追时针',
    back: '← 知识索引',
    compare: '对照另一版本：时钟与角度 · 两根针的赛跑 →',
    navLabel: '时钟步骤导航',
    tagline: '钟面上两根针绕同一个点转，一快一慢。只要知道它们每分钟各转多少度，就能算出任何时刻两针夹多大的角；把它看成一场「分针追时针」，还能算出两针在几点几分重合。',
    nav0: '0 各转多快', nav1: '1 读夹角', nav2: '2 夹角曲线', nav3: '3 何时重合', nav4: '4 反过来找时刻', nav5: '5 自测 · 收束',

    s0k: '第 0 步 · 转速',
    s0t: '一分钟里，分针和时针各转多少度？',
    s0e: '这一步要回答：钟面一圈是 360°（把一圈平均分成 360 份，每份是 1 度，写作 1°）。分针 60 分钟走一圈，时针要 12 小时（720 分钟）才走一圈。那么每过 1 分钟，两根针各转多少度？本页的钟是理想的钟：两根针都匀速、连续地转，不会一格一格地跳。从 12:00 开始计时：钟面外圈的青色弧记下分针一共转过的路（每多一圈往外加一层），钟面里的橙色弧记下时针转过的路；折线图把两根针转过的总度数画成随时间变化的两条线。',
    t0Label: '从 12:00 起经过的分钟数', plus0: '+1 分钟', play0: '从 12:00 走到 2:00',
    c0btitle: '转过的总度数（°），横轴是分钟数',
    s0lgMin: '分针', s0lgHour: '时针',
    s0readout: '经过 {t} 分钟，现在是 {clock}。分针一共转了 6 × {t} = {m}°（{laps} 圈又 {rest}°）；时针一共转了 0.5 × {t} = {h}°。每过 1 分钟：分针 360° ÷ 60 = 6°，时针 360° ÷ 720 = 0.5°，分针比时针快 12 倍。',
    s0hint: '观察顺序：先点几下「+1 分钟」，看两条线各往上走多少；再点「从 12:00 走到 2:00」，看青线很快爬过 360°（一圈）、720°（两圈），橙线却只走到 60°。两条线都是直的，说明每分钟转过的度数一直不变。',

    s1k: '第 1 步 · 夹角',
    s1t: '某一时刻，两根针之间的角是多少度？',
    s1e: '这一步要回答：钟面上是 h 点 m 分，两根针之间的角有多大？两根针把一圈分成两个角，加起来是 360°；我们说的<strong>夹角</strong>指较小的那一个（不超过 180°），图中的紫色扇形。从 12 出发顺时针量：分针转了 6 × m 度（每分钟 6°）。时针先按整点走到 h（每小时 30°，共 30 × h 度），在这一小时里还要再走 0.5 × m 度：这一段最容易被忘掉，图中用粉色短弧标出。两个度数相减，再取较小的一边，就是夹角。',
    hLabel: '时 h', mLabel: '分 m',
    s1lgSector: '夹角（较小的那个角）', s1lgExtra: '时针在这一小时里多走的', s1lgMin: '分针', s1lgHour: '时针',
    ledgerH: '时针：30 × {h} + 0.5 × {m} = {H}°（其中这一小时里多走 {x}°）',
    noon: '（12 点时时针从 12 出发，所以按 h = 0 算）',
    ledgerM: '分针：6 × {m} = {M}°',
    ledgerSmall: '相差 |{H} − {M}| = {D}°，不超过 180°，所以夹角 = {A}°',
    ledgerBig: '相差 |{H} − {M}| = {D}°，超过 180°，较小的一边是 360 − {D} = {A}°',
    s1readout: '{clock} 的夹角是 {A}°。',
    s1trap: '如果忘了时针在这一小时里多走的 {x}°，会算成 {wrong}°，差了 {e}°。',
    s1hint: '观察顺序：把「时」固定在 3，把「分」从 0 拖到 59：分针绕一整圈，粉色短弧越来越长（最长 29.5°），时针慢慢挪向 4。再试 3:00、3:30、6:00、9:45，对照三行算式看夹角怎样得出。',

    s2k: '第 2 步 · 追赶',
    s2t: '从 12:00 起，夹角怎样随时间变化？',
    s2e: '这一步要回答：时间一分一分过去，夹角是一直变大吗？每过 1 分钟，分针转 6°、时针转 0.5°，所以分针每分钟比时针<strong>多走 5.5°</strong>，这就是分针追时针的速度。灰线是「分针领先时针多少度」：从 0 开始，每分钟加 5.5°；领先满 360° 时分针正好多跑了一整圈，又和时针并在一起，领先从 0 重新算。青线是<strong>夹角</strong>（两针之间较小的角，不超过 180°）：领先不到 180° 时夹角就等于领先，超过 180° 时夹角 = 360° − 领先。所以青线升到 180° 后又降回 0，一升一降。',
    t2Label: '时间（从 12:00 起的分钟数）', play2: '播放 12 小时',
    c2btitle: '夹角（°），横轴是钟点',
    s2lgLead: '分针领先的度数', s2lgAng: '夹角', s2lgMeet: '重合（夹角 0°）', s2lgRight: '直角（夹角 90°）',
    s2readout: '{clock}：分针领先时针 {L}°，夹角 {A}°。从 12:00 到现在，两针重合 {c} 次（12:00 本身算 1 次），成直角 {r} 次。',
    s2hint: '观察顺序：先点「播放 12 小时」，看青线一路描出来：每次碰到 0 是两针重合（白点），每次碰到 90° 是直角（橙点），读数里的次数跟着累加。播完再拖时间滑杆，看钟面和曲线上的竖线指的是同一时刻。',

    s3k: '第 3 步 · 重合',
    s3t: '12:00 之后，两针下一次重合在几点几分？',
    s3e: '这一步要回答：两针什么时候再并到一起？两针重合时，分针正好比时针多走了整整 1 圈、2 圈……分针每分钟比时针多走 5.5°（6° − 0.5°），多走 360° 要 360 ÷ 5.5 = 65 5/11 分钟，约 65 分 27 秒。所以下一次重合不在 1:05 整，而在 1:05:27 左右；之后每隔同样的 65 5/11 分钟追上一次。追赶图把「分针一共比时针多走的度数」画成一条直线（每分钟升 5.5°），它每穿过一条整圈横线，就是一次重合。',
    k3Label: '第 k 次重合（k = 0 是 12:00 本身）', play3: '连续走 12 小时',
    c3btitle: '分针一共比时针多走的度数',
    lapTick: '{n} 圈',
    s3lgLine: '多走的度数', s3lgMeet: '重合',
    s3readout: '第 {k} 次：分针要比时针多走 {k} × 360° = {g}°，需要 {g} ÷ 5.5 = {mx} 分钟，也就是 {clock}。',
    s3full: '第 11 次正好又是 12:00（经过 720 分钟），新的一轮开始了：所以 12 小时里只有 11 次重合（12:00 算 1 次）。',
    s3play: '已走到 {clock}，追上 {c} 次。',
    s3hint: '观察顺序：拖 k 从 0 到 11，看钟面跳到每次重合的时刻、追赶图上的点沿直线一格格升高。读数里的分钟数除了 12:00 都带分数，说明重合总落在两个整分钟之间。再点「连续走 12 小时」，看钟面连续走、追赶图上的点一个个出现。',

    s4k: '第 4 步 · 反过来问',
    s4t: '夹角正好是某个度数的时刻，一共有几个？',
    s4e: '这一步反过来问：已知夹角是 θ 度（θ 读作「西塔」，只是一个代号），哪些时刻的夹角正好是它？把第 2 步那条 12 小时的夹角折线（两针之间较小的角，0° 到 180°）画出来，再画一条高度为 θ 的水平线：折线和水平线的每个交点，就是一个答案。拖「只看这一小时」，钟面显示这一小时里的第一个答案。',
    th4Label: '目标夹角 θ（°）', h4Label: '只看这一小时',
    c4btitle: '夹角折线与高度 θ 的水平线',
    s4lgAng: '夹角', s4lgTarget: '高度 θ 的水平线', s4lgSol: '交点 = 答案', s4lgHour: '选中的这一小时',
    hourName: '{a} 点到 {b} 点',
    s4readout: '夹角 {th}° 在 12 小时里出现 {n} 次。{hour}：{list}。',
    none: '一次也没有', sep: '、',
    s4hint: '观察顺序：把 θ 拖到 90，数交点（读数给出 22 个）；再拖到 0 或 180，交点只剩 11 个，因为折线的谷底和尖顶只各被碰一下。然后让 θ = 90，拖「只看这一小时」逐个看：多数小时有 2 次，2 点到 3 点、8 点到 9 点只有 1 次。22 个交点分给 12 个小时，本来就不可能每小时都是 2 次。',

    s5k: '第 5 步 · 自测与收束',
    s5t: '给你一个时刻，你能算出夹角吗？',
    newQ: '出一道题', ansLabel: '你的答案（°）', check: '检查',
    q5: '现在是 {clock}，两针的夹角是多少度？',
    q5wait: '先点「出一道题」。',
    q5empty: '先填一个数。',
    q5ok: '对了！{clock}：时针 {H}°，分针 {M}°，相差 {D}°，夹角 {A}°。',
    q5no: '再想想：{clock} 时针 {H}°，分针 {M}°，相差 {D}°，夹角是 {A}°；你填的是 {u}°。',
    s5fin: '分针每分钟转 6°，时针每分钟转 0.5°。读夹角时别忘了时针在这一小时里多走的 0.5 × m 度。把两针看成追赶：分针每分钟多走 5.5°，多走满一圈就重合一次，所以 12 小时里重合 11 次；夹角折线一升一降，所以除 0° 和 180° 外，每个夹角在 12 小时里出现 22 次。',
    formula: '时针 = 30 × h + 0.5 × m（度）\n分针 = 6 × m（度）\n夹角 = 两者之差；超过 180° 时用 360° 减去它\n第 k 次重合 = 720 × k ÷ 11 分钟（从 12:00 起）',
    boundary: '适用范围：理想的钟，两针匀速、连续地转；不考虑秒针，也不考虑有的钟分针一格一格地跳。所有时刻和度数都由程序按上面的转速算出，时刻四舍五入到秒；自测按 ±0.5° 判对。',
    linksTitle: '接着去哪',
    lk1: '→ 旋转对称：图形转多少度能和自己重合（第 2 步）',
    lk2: '→ 圆周角：顶点在圆心的角叫圆心角（第 0 步）',
    lk3: '→ 一次函数：每一步抬高一样多，点就排成直线（第 0 步）——像本页转过的度数',
    lk4: '→ 带余除法：100 天后是星期几（第 3 步）——满一圈从 0 重新数，是同一个道理',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《时钟与角度 · 两根针的赛跑》的平行版本。'
  },
  en: {
    pageTitle: 'The Clock · The Minute Hand Gives Chase',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Clocks & Angles · A Race Between Two Hands →',
    navLabel: 'Clock steps',
    tagline: 'Two hands turn about the same point, one fast and one slow. Once you know how many degrees each turns per minute, you can work out the angle between them at any time; treat it as the minute hand chasing the hour hand and you can also find exactly when they line up.',
    nav0: '0 How Fast', nav1: '1 Read the Angle', nav2: '2 Angle Over Time', nav3: '3 When They Meet', nav4: '4 Work Backwards', nav5: '5 Quiz · Wrap-up',

    s0k: 'Step 0 · Speeds',
    s0t: 'In one minute, how far does each hand turn?',
    s0e: 'This step asks: a full turn of the clock face is 360° (one turn split into 360 equal parts, each called a degree, written 1°). The minute hand goes round once in 60 minutes; the hour hand needs 12 hours (720 minutes). So how many degrees does each hand turn every minute? The clock on this page is ideal: both hands turn smoothly and steadily, never jumping tick by tick. We start timing at 12:00. The cyan arc outside the face traces how far the minute hand has turned in total (one more ring outward for each extra turn); the orange arc inside traces the hour hand. The chart plots each hand’s total turning against time as two lines.',
    t0Label: 'Minutes since 12:00', plus0: '+1 minute', play0: 'Run from 12:00 to 2:00',
    c0btitle: 'Total turning (°) against minutes',
    s0lgMin: 'Minute hand', s0lgHour: 'Hour hand',
    s0readout: 'After {t} minutes it is {clock}. The minute hand has turned 6 × {t} = {m}° ({laps} full turns and {rest}°); the hour hand has turned 0.5 × {t} = {h}°. Every minute the minute hand turns 360° ÷ 60 = 6° and the hour hand 360° ÷ 720 = 0.5°, so the minute hand is 12 times faster.',
    s0hint: 'What to watch: tap “+1 minute” a few times and see how far each line climbs. Then press “Run from 12:00 to 2:00”: the cyan line races past 360° (one turn) and 720° (two turns) while the orange line only reaches 60°. Both lines are straight, which means the degrees per minute never change.',

    s1k: 'Step 1 · The angle',
    s1t: 'At a given time, how big is the angle between the hands?',
    s1e: 'This step asks: the clock shows h o’clock and m minutes. How big is the angle between the hands? The hands split the full turn into two angles that add up to 360°; by <strong>the angle between the hands</strong> we mean the smaller one (180° at most), the purple wedge. Measure clockwise from the 12. The minute hand has turned 6 × m degrees (6° a minute). The hour hand first reaches the h mark (30° per hour, 30 × h degrees in all) and then keeps creeping on by 0.5 × m degrees during the hour. That last bit is the one people forget, so it is drawn as a short pink arc. Subtract one reading from the other and take the smaller side: that is the angle.',
    hLabel: 'Hour h', mLabel: 'Minute m',
    s1lgSector: 'Angle between the hands (the smaller one)', s1lgExtra: 'Hour hand’s creep within the hour', s1lgMin: 'Minute hand', s1lgHour: 'Hour hand',
    ledgerH: 'Hour hand: 30 × {h} + 0.5 × {m} = {H}° (of which {x}° is the creep within this hour)',
    noon: ' (at 12 o’clock the hour hand starts from the 12, so use h = 0)',
    ledgerM: 'Minute hand: 6 × {m} = {M}°',
    ledgerSmall: 'Difference |{H} − {M}| = {D}°, not more than 180°, so the angle is {A}°',
    ledgerBig: 'Difference |{H} − {M}| = {D}°, more than 180°, so take the other side: 360 − {D} = {A}°',
    s1readout: 'At {clock} the angle between the hands is {A}°.',
    s1trap: 'Forget the hour hand’s {x}° creep and you would get {wrong}°, out by {e}°.',
    s1hint: 'What to watch: keep the hour at 3 and drag the minutes from 0 to 59. The minute hand sweeps a full turn, the pink arc grows (up to 29.5°), and the hour hand edges towards 4. Then try 3:00, 3:30, 6:00 and 9:45 and follow the three lines of working.',

    s2k: 'Step 2 · The chase',
    s2t: 'Starting at 12:00, how does the angle change over time?',
    s2e: 'This step asks: as the minutes tick by, does the angle just keep growing? Each minute the minute hand turns 6° and the hour hand 0.5°, so the minute hand <strong>gains 5.5° a minute</strong>: that is the speed of the chase. The grey line is how far the minute hand is ahead of the hour hand. It starts at 0 and adds 5.5° a minute; when the lead reaches 360°, the minute hand has run exactly one extra lap, the hands line up again, and the lead starts over from 0. The cyan line is <strong>the angle between the hands</strong> (the smaller one, at most 180°): while the lead is under 180° the angle equals the lead, and after that the angle is 360° minus the lead. So the cyan line climbs to 180° and comes back down to 0, again and again.',
    t2Label: 'Time (minutes since 12:00)', play2: 'Play 12 hours',
    c2btitle: 'Angle (°) against the time of day',
    s2lgLead: 'Minute hand’s lead', s2lgAng: 'Angle between the hands', s2lgMeet: 'Hands meet (0°)', s2lgRight: 'Right angle (90°)',
    s2readout: '{clock}: the minute hand is {L}° ahead and the angle is {A}°. Since 12:00 the hands have met {c} times (counting 12:00 itself) and made a right angle {r} times.',
    s2hint: 'What to watch: press “Play 12 hours” and watch the cyan line being drawn. Every touch of 0 is a meeting (white dot) and every touch of 90° is a right angle (orange dot); the counts in the readout go up as you go. Afterwards, drag the time slider and check that the clock and the vertical line on the chart show the same moment.',

    s3k: 'Step 3 · Meetings',
    s3t: 'After 12:00, at what time do the hands next line up?',
    s3e: 'This step asks: when are the hands together again? When they line up, the minute hand has gone exactly 1, 2, … full turns further than the hour hand. It gains 5.5° a minute (6° − 0.5°), so gaining 360° takes 360 ÷ 5.5 = 65 5/11 minutes, about 65 minutes 27 seconds. The next meeting is therefore not at 1:05 sharp but at about 1:05:27, and every later meeting comes another 65 5/11 minutes on. The chase chart plots the total amount the minute hand has gained as a straight line (rising 5.5° a minute); every time it crosses one of the full-turn lines, the hands meet.',
    k3Label: 'Meeting number k (k = 0 is 12:00 itself)', play3: 'Run the clock for 12 hours',
    c3btitle: 'Total degrees the minute hand has gained',
    lapTick: '{n} × 360°',
    s3lgLine: 'Degrees gained', s3lgMeet: 'Meeting',
    s3readout: 'Meeting {k}: the minute hand must gain {k} × 360° = {g}°, which takes {g} ÷ 5.5 = {mx} minutes, so it happens at {clock}.',
    s3full: 'Meeting 11 is 12:00 again (720 minutes on), the start of a new round. So in 12 hours the hands meet only 11 times, counting 12:00 once.',
    s3play: 'The clock has reached {clock}; the hands have met {c} times.',
    s3hint: 'What to watch: drag k from 0 to 11. The clock jumps to each meeting and the dot on the chase chart climbs the line one turn at a time. Apart from 12:00, every minute count in the readout has a fraction in it, so the meetings always fall between two whole minutes. Then press “Run the clock for 12 hours” and watch the dots appear one by one as the clock turns.',

    s4k: 'Step 4 · Working backwards',
    s4t: 'How many times a day does the angle hit a given size?',
    s4e: 'This step turns the question round: if the angle is θ degrees (θ, “theta”, is just a name for the number), at which times is the angle exactly that? Draw the 12-hour angle line from step 2 (the smaller angle between the hands, 0° to 180°) and add a level line at height θ. Every crossing of the two lines is one answer. Drag “Look at this hour” to focus on one hour; the clock shows the first answer in it.',
    th4Label: 'Target angle θ (°)', h4Label: 'Look at this hour',
    c4btitle: 'The angle line and a level line at θ',
    s4lgAng: 'Angle between the hands', s4lgTarget: 'Level line at θ', s4lgSol: 'Crossings = answers', s4lgHour: 'Chosen hour',
    hourName: 'From {a} to {b} o’clock',
    s4readout: 'An angle of {th}° happens {n} times in 12 hours. {hour}: {list}.',
    none: 'not at all', sep: ', ',
    s4hint: 'What to watch: drag θ to 90 and count the crossings (the readout says 22). Move it to 0 or 180 and only 11 are left, because the line touches each valley floor and each peak just once. Then set θ = 90 and step through the hours: most hours have two, but 2 to 3 o’clock and 8 to 9 o’clock have only one. Share 22 crossings among 12 hours and some hour has to miss out.',

    s5k: 'Step 5 · Quiz and wrap-up',
    s5t: 'Given a time, can you find the angle?',
    newQ: 'New question', ansLabel: 'Your answer (°)', check: 'Check',
    q5: 'It is {clock}. How big is the angle between the hands?',
    q5wait: 'Press “New question” first.',
    q5empty: 'Type a number first.',
    q5ok: 'Correct! At {clock} the hour hand is at {H}°, the minute hand at {M}°, the difference is {D}°, and the angle is {A}°.',
    q5no: 'Not quite: at {clock} the hour hand is at {H}°, the minute hand at {M}°, the difference is {D}°, so the angle is {A}°. You wrote {u}°.',
    s5fin: 'The minute hand turns 6° a minute and the hour hand 0.5° a minute. When you read the angle, remember the hour hand’s extra 0.5 × m degrees within the hour. Seen as a chase, the minute hand gains 5.5° a minute and catches up once per extra lap, so the hands meet 11 times in 12 hours. The angle line rises and falls, so every angle other than 0° and 180° happens 22 times in 12 hours.',
    formula: 'hour hand = 30 × h + 0.5 × m (degrees)\nminute hand = 6 × m (degrees)\nangle = their difference; if over 180°, use 360° minus it\nmeeting k = 720 × k ÷ 11 minutes after 12:00',
    boundary: 'Where this holds: an ideal clock whose hands turn smoothly at a steady rate. There is no second hand, and no minute hand that jumps tick by tick as on some real clocks. Every time and angle is computed from the rates above; times are rounded to the nearest second, and the quiz accepts answers within ±0.5°.',
    linksTitle: 'Where next',
    lk1: '→ Rotational symmetry: how far a shape must turn to match itself (step 2)',
    lk2: '→ Inscribed angles: an angle with its corner at the centre (step 0)',
    lk3: '→ Linear functions: rise the same each step and the points line up (step 0) — like the turning lines here',
    lk4: '→ Division with remainder: what weekday is it in 100 days (step 3) — starting again from 0 after each full round',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Clocks & Angles · A Race Between Two Hands”.'
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
