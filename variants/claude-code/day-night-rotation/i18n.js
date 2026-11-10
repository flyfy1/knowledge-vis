'use strict';
// Day-and-night lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '昼夜交替 · 是地球在转',
    back: '← 知识索引',
    compare: '对照另一版本：昼夜交替 · 地球自己在转 →',
    navLabel: '昼夜交替步骤导航',
    tagline: '每天天亮、天黑，看起来像太阳绕着我们跑。其实太阳几乎不动，是地球自己在转：转到朝着太阳的那一面是白天，转到背着太阳的那一面是黑夜。六步里你会用一盏灯、一个转动的地球和一片天空，把这件事一点点看明白。',
    nav0: '0 灯照球', nav1: '1 地球在转', nav2: '2 抬头看太阳', nav3: '3 各地的时刻', nav4: '4 转得多快', nav5: '5 收束',
    kid: '小明',

    s0k: '第 0 步 · 一盏灯，一个球',
    s0t: '用灯照一个球，亮的是哪一部分？',
    s0e: '这一步要回答：一束光照到一个球上，球亮了多少、亮的在哪一边？太阳离地球非常远，照过来的光几乎是一排互相平行的直线，叫<strong>平行光</strong>。图中间的圆是一个球（就当它是地球），黄色的灯可以绕着球换位置，光从灯那边平行地射过来。球上朝着灯的那一半被照亮，背着灯的那一半照不到。亮的一半和暗的一半之间的分界线，叫<strong>晨昏线</strong>。站在亮的一半上就是<strong>白天</strong>，站在暗的一半上就是<strong>黑夜</strong>。小明站在球的顶上。注意：图上灯和球的大小、距离都不是真实比例。真正的太阳能装下约 130 万个地球，离我们约 1.5 亿千米，按比例画的话，这一页上只剩一个小点。',
    lampSlider: '灯的位置（绕着球转）', lampOff: '关灯', lampOn: '开灯',
    c0title: '灯和球（大小、距离不按比例）',
    s0lgLamp: '灯（太阳）', s0lgRay: '平行的光线', s0lgLit: '被照亮的一半', s0lgTerm: '晨昏线', s0lgKid: '小明',
    s0readout: '灯转到了 {a}°：被照亮的正好是球的一半（{pct}%），晨昏线总是和光线垂直。小明那里是{state}。',
    s0off: '关灯了：整个球都是暗的，没有白天和黑夜之分。',
    st_day: '白天', st_night: '黑夜', st_edge: '在晨昏线上', st_sunrise: '日出前后', st_sunset: '日落前后',
    s0hint: '观察顺序：拖「灯的位置」，让灯绕球转一圈。看亮的半边总是正对着灯，白色虚线（晨昏线）总是和光线垂直；灯在小明头顶那一边时他那里是白天，转到另一边时是黑夜。再按「关灯」：没有光，就谈不上白天黑夜。',

    s1k: '第 1 步 · 太阳不动，地球在转',
    s1t: '太阳不动，地球自己转，小明会经历什么？',
    s1e: '这一步要回答：太阳一直在右边不动，地球自己转，小明那里怎样从白天变成黑夜、又变回白天？现在换个看法，<strong>从北极的正上方往下看</strong>地球：图里的圆就是地球，中心的小点是北极。地球绕着一根穿过南极和北极的<strong>地轴</strong>转动（地轴是想象出来的转动轴，并不是真有一根棍子插在地球里），这叫<strong>自转</strong>。从北极上空看，地球是<strong>逆时针</strong>转的，转一圈是一天，也就是 24 小时。阳光从右边平行射来，右半边亮、左半边暗，分界线就是晨昏线。小明站在赤道上（橙色的点），被地球带着一起转。图上转一圈只要十几秒，这是动画的速度，代表真实的 24 小时。',
    playTurn: '让地球转一圈（24 小时）', pause: '暂停', resume: '接着转',
    tSlider: '小明那里的时刻', clearBand: '清空时间带',
    c1title: '从北极上空往下看（阳光从右边来）', c1band: '小明的 24 小时：转过的时段会涂上颜色',
    s1lgPole: '中心 = 北极', s1lgKid: '小明（站在赤道上）', s1lgDay: '白天的时段', s1lgNight: '黑夜的时段', s1lgSpin: '自转方向',
    ph_noon: '正午：他正对着太阳', ph_midnight: '半夜：他正背对着太阳', ph_sunrise: '日出前后：他刚被转过晨昏线，迎来阳光', ph_sunset: '日落前后：他正被转过晨昏线，走进暗的一边', ph_day: '白天：他在亮的半边', ph_night: '黑夜：他在暗的半边',
    s1readout: '小明那里现在是 {clock}，{ph}。',
    s1progress: '已经转过 {h} 小时 / 一圈 24 小时。',
    s1hint: '观察顺序：按「让地球转一圈」，看橙色的小明沿逆时针方向绕圈：从正对太阳（12:00 正午）转到晨昏线上（18:00 日落），走进暗的半边（0:00 半夜），再转回晨昏线（6:00 日出）。下面的时间带把走过的时段涂成黄色（白天）或深蓝（黑夜）；转满一圈，黄色和深蓝正好各占一半。也可以直接拖时刻滑杆。',

    s2k: '第 2 步 · 抬头看天',
    s2t: '站在地上看，太阳为什么从东边升起？',
    s2e: '这一步要回答：明明是地球在转，为什么站在地上的小明看到的是太阳在动，而且总是从东边升起、在西边落下？小明感觉不到自己在转，他只看得见天空。第一张图是小明看到的天空：他面朝南站着，左手边是东，右手边是西；中间那条横线是<strong>地平线</strong>，也就是站在地面上看到的天和地的分界线，太阳落到地平线下面就看不见了。第二张图还是从北极上空往下看，和第一张图是同一个时刻（和上一步也是同一个时刻）。地球<strong>自西向东</strong>转（从北极上空看就是逆时针），把小明一次次带着转向太阳，在他看来，就像太阳从东边地平线升起、中午到头顶、傍晚在西边落下。太阳东升西落，是地球自转让我们看到的样子。',
    reverse: '假如地球反着转（想象）', reverseOff: '回到真实的转向',
    c2sky: '小明看到的天空（面朝南：左边东，右边西）', c2top: '同一时刻，从北极上空往下看',
    east: '东', west: '西', overhead: '头顶',
    s2lgSun: '太阳', s2lgTrail: '太阳走过的位置', s2lgHorizon: '地平线', s2lgPath: '太阳一天的路线',
    sky_overhead: '在头顶', sky_eastHigh: '在东边的天空', sky_westHigh: '在西边的天空', sky_eastRim: '正在东边地平线上', sky_westRim: '正在西边地平线上', sky_below: '在地平线下面，看不见',
    s2readout: '{clock}：太阳{where}，{alt}。',
    altUp: '比地平线高 {a}°', altDown: '在地平线下 {a}°', altZero: '高度 0°',
    s2rev: '（想象中）地球反着转：小明被顺时针带着转，太阳改从西边升起。真实的太阳从东边升起，所以地球真实的转向只能是自西向东。',
    s2hint: '观察顺序：按「让地球转一圈」，看第一张图里太阳沿着虚线拱桥从左边（东）升起、经过头顶、从右边（西）落下，走过的位置留下小点；同时看第二张图，小明正被逆时针带着转。再按「假如地球反着转」重新播放：小明改成顺时针转，太阳从右边（西）升起。东和西仍按地图上的方向（比如中国的东边是太平洋），不跟着改。',

    s3k: '第 3 步 · 同一时刻，各地不同',
    s3t: '北京正午的时候，伦敦和纽约是几点？',
    s3e: '这一步要回答：同一时刻，地球上所有地方都是白天吗？地球在转，不同的地方会轮流转进亮的半边。地图上用<strong>经度</strong>表示东西方向的位置：一圈是 360°，伦敦附近是 0°，北京约在东经 116°，东京约在东经 140°，纽约约在西经 74°。地球 24 小时转 360°，所以每小时转 15°：一个地方比另一个地方往东多 15° 经度，太阳就早一小时到它头顶。图还是从北极上空往下看，四个彩色点是四座城市（为了看清楚，都画在同一圈上）。',
    bjSlider: '北京的地方时',
    c3title: '同一时刻的四座城市（从北极上空看）',
    city_beijing: '北京', city_tokyo: '东京', city_london: '伦敦', city_newyork: '纽约',
    s3row: '{city} {clock}（{st}）',
    s3readout: '同一时刻：{rows}。',
    s3hint: '观察顺序：把北京拖到 12:00，看蓝色的北京正对太阳，粉色的纽约在暗的半边、快到半夜；再慢慢往后拖，看晨昏线依次扫过各城市：谁先转进亮的半边，谁先天亮。这里的时刻按经度算，叫「地方时」；平时钟表用的是按区域统一的时区时间，会差几十分钟，有的地方夏天还会把钟拨快一小时。',

    s4k: '第 4 步 · 我们跑得有多快',
    s4t: '地球带着我们转，每小时要跑多远？',
    s4e: '这一步要回答：地球 24 小时转一圈，站在地面上的我们被带着走得有多快，为什么一点也感觉不到？地球半径约 6371 千米，赤道一圈的长度 = 2 × π × 半径，约 40 000 千米。24 小时走完这一圈，每小时约 1670 千米，比飞机还快。离赤道越远，绕的圈越小。<strong>纬度</strong>表示离赤道有多远：赤道是 0°，北极是 90°，北京约在北纬 40°。图是从侧面看地球，橙色的圈就是这个纬度上的人一天要绕的圈。为什么感觉不到？因为我们、空气和房子都以同样的速度一起走，这个速度几乎不变；而且拐弯非常慢，一天才转一圈，需要的「拐弯的力」不到重力的 0.4%。就像在平稳飞行的飞机里，杯子里的水也是平的。',
    latSlider: '纬度（离赤道多远）',
    c4side: '从侧面看地球：橙色圈 = 这个纬度一天绕的圈', c4bar: '每小时走多少千米',
    bar_here: '这个纬度', bar_train: '高铁 350', bar_plane: '飞机 900',
    s4lgRing: '这个纬度一天绕的圈', s4lgOld: '试过的纬度', s4lgAxis: '地轴',
    s4readout: '纬度 {lat}°：一天绕的圈约 {circ} 千米，每小时约 {kmh} 千米（每秒约 {ms} 米），是高铁的 {r1} 倍、飞机的 {r2} 倍。拐弯需要的力约是重力的 {g}%。',
    s4pole: '纬度 90°（北极点）：正好站在地轴上，只是原地慢慢转身，一天转一圈，几乎不移动。',
    s4hint: '观察顺序：把纬度从 0（赤道）慢慢拖到 90（北极），看上图橙色的圈越来越小，下图「这个纬度」的长条跟着变短：在赤道比飞机快，在北京（约 40°）每小时约 1280 千米，越过约 57° 就比飞机慢了，到北极点几乎不动。拖过的纬度会留下淡色的圈。',

    s5k: '第 5 步 · 收束',
    s5t: '一句话说清白天和黑夜',
    s5fin: '<strong>白天黑夜，是地球自转的结果。</strong>太阳照亮地球朝着它的那一半（第 0 步）；地球绕地轴自西向东转，每个地方轮流转进亮的半边和暗的半边，转一圈是一天 24 小时（第 1 步）；站在转动的地面上看，太阳就从东边升起、西边落下（第 2 步）；同一时刻，各地有的白天有的黑夜，往东每 15° 经度，太阳早一小时到头顶（第 3 步）；我们跟着地球每小时跑上千千米，却因为一起走、拐弯又极慢而感觉不到（第 4 步）。',
    truthTitle: '这一页把哪些地方简化了',
    truth1: '地轴：本页把地轴画成竖直的，所以每个地方都是白天 12 小时、黑夜 12 小时。真实的地轴斜着约 23.5°，所以白天的长短会随季节变化，那是「四季」的故事。',
    truth2: '一天的长度：本页的「转一圈 24 小时」是按对着太阳算的。如果对着遥远的星星算，地球转一圈约 23 小时 56 分，差的几分钟是因为地球同时还在绕太阳走（这叫公转，绕一圈是一年）。',
    truth3: '大小和距离：太阳、地球的大小和距离都是示意，不按比例；把阳光画成平行线却是很好的近似，因为太阳离得非常远。',
    quizTitle: '考考自己',
    q1: '1. 现在你这里是黑夜，最直接的原因是？', q1a: '太阳下山去休息了', q1b: '你所在的那一面正背对着太阳', q1c: '云把太阳挡住了',
    q2: '2. 地球自转一圈，大约要多久？', q2a: '一天（24 小时）', q2b: '一个月', q2c: '一年',
    q3: '3. 北京地方时 12:00 的时候，纽约（西经 74°）的地方时大约是几点？', q3a: '也是 12:00', q3b: '前一天晚上 {ny} 左右', q3c: '第二天凌晨 {wrong} 左右',
    check: '核对',
    f1ok: '对。你所在的地方被地球转到了背对太阳的半边。', f1a: '不对：太阳一直在发光，不会「休息」；是地球把你转到了背对太阳的一边。', f1c: '不对：云只挡一会儿，没有云的夜里也一样黑。',
    f2ok: '对。自转一圈是一天，约 24 小时。', f2b: '不对：一个月大约是月亮绕地球一圈的时间。', f2c: '不对：一年是地球绕太阳一圈（公转）的时间。',
    f3ok: '对。纽约比北京往西约 {d}°，每 15° 晚 1 小时，晚约 {h} 小时，所以是前一天晚上 {ny} 左右。', f3a: '不对：经度不同，太阳到头顶的时刻就不同。', f3c: '不对：纽约在北京西边，要减去时差，而不是加上。',
    unanswered: '这题还没选。',
    linksTitle: '接着去哪儿',
    lk1: '经纬网 · 第 4 步：经度和时间是怎样对应起来的 →',
    lk2: '地球公转与四季 · 第 3 步：地轴斜了以后，白天为什么有长有短 →',
    lk3: '月相 · 第 0 步：月亮也总是一半被照亮 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《昼夜交替 · 地球自己在转》的平行版本。'
  },
  en: {
    pageTitle: 'Day and Night · It Is the Earth That Turns',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Day and Night · The Earth Itself Is Turning →',
    navLabel: 'Day and night steps',
    tagline: 'Every day it gets light and then dark, and it looks as if the Sun goes round us. In fact the Sun hardly moves at all: the Earth is turning. The side facing the Sun has day, the side facing away has night. In six steps you will work it out with a lamp, a spinning Earth and a patch of sky.',
    nav0: '0 Lamp and ball', nav1: '1 The Earth turns', nav2: '2 Look at the sky', nav3: '3 Times around the world', nav4: '4 How fast?', nav5: '5 Wrap-up',
    kid: 'Sam',

    s0k: 'Step 0 · One lamp, one ball',
    s0t: 'Shine a lamp on a ball: which part lights up?',
    s0e: 'This step answers: when light falls on a ball, how much of it lights up, and which side? The Sun is so far from the Earth that its light arrives as a row of almost exactly parallel straight lines, called <strong>parallel light</strong>. The circle in the middle of the picture is a ball (think of it as the Earth), and the yellow lamp can move around it, sending parallel light from its side. The half of the ball facing the lamp is lit; the half facing away gets no light. The line between the lit half and the dark half is called the <strong>terminator</strong>. Standing on the lit half means <strong>day</strong>; standing on the dark half means <strong>night</strong>. Sam is standing on top of the ball. Note that the lamp and ball are not drawn to scale. The real Sun could hold about 1.3 million Earths and is about 150 million km away; drawn to scale, this page would show just a tiny dot.',
    lampSlider: 'Lamp position (around the ball)', lampOff: 'Switch the lamp off', lampOn: 'Switch the lamp on',
    c0title: 'Lamp and ball (sizes and distance not to scale)',
    s0lgLamp: 'lamp (the Sun)', s0lgRay: 'parallel light rays', s0lgLit: 'lit half', s0lgTerm: 'terminator', s0lgKid: 'Sam',
    s0readout: 'Lamp at {a}°: exactly half of the ball is lit ({pct}%), and the terminator always crosses the light rays at a right angle. Where Sam stands it is {state}.',
    s0off: 'Lamp off: the whole ball is dark, and there is no day or night at all.',
    st_day: 'day', st_night: 'night', st_edge: 'right on the terminator', st_sunrise: 'around sunrise', st_sunset: 'around sunset',
    s0hint: 'What to try: drag the lamp all the way round the ball. The lit half always faces the lamp, and the white dashed line (the terminator) always crosses the rays at a right angle. When the lamp is on Sam’s side it is day for him; when it moves to the far side it is night. Then switch the lamp off: with no light, there is no day or night.',

    s1k: 'Step 1 · The Sun stays, the Earth turns',
    s1t: 'If the Sun stays put and the Earth spins, what does Sam go through?',
    s1e: 'This step answers: with the Sun fixed on the right and the Earth spinning, how does it become day, then night, then day again where Sam is? Now look <strong>down from right above the North Pole</strong>: the circle is the Earth and the dot in the middle is the North Pole. The Earth turns around an <strong>axis</strong> through the North and South Poles (an imaginary line it turns around — there is no real rod stuck through the Earth); this turning is called <strong>rotation</strong>. Seen from above the North Pole the Earth turns <strong>anticlockwise</strong>, once a day, that is once every 24 hours. Sunlight comes in parallel from the right, so the right half is lit and the left half is dark, with the terminator between them. Sam stands on the equator (the orange dot) and is carried round with the Earth. In the picture one turn takes a dozen seconds or so; that is just animation speed, standing for a real 24 hours.',
    playTurn: 'Spin the Earth once (24 hours)', pause: 'Pause', resume: 'Keep spinning',
    tSlider: 'Time where Sam is', clearBand: 'Clear the time strip',
    c1title: 'From above the North Pole (sunlight from the right)', c1band: 'Sam’s 24 hours: the hours turned through get coloured in',
    s1lgPole: 'centre = North Pole', s1lgKid: 'Sam (on the equator)', s1lgDay: 'daytime hours', s1lgNight: 'night-time hours', s1lgSpin: 'direction of spin',
    ph_noon: 'noon: he is facing the Sun head-on', ph_midnight: 'midnight: his back is straight to the Sun', ph_sunrise: 'around sunrise: he has just been turned across the terminator into the light', ph_sunset: 'around sunset: he is being turned across the terminator into the dark', ph_day: 'daytime: he is on the lit half', ph_night: 'night-time: he is on the dark half',
    s1readout: 'For Sam it is now {clock} — {ph}.',
    s1progress: 'Turned {h} hours so far, out of 24 for a full turn.',
    s1hint: 'What to try: press “Spin the Earth once” and watch orange Sam travel anticlockwise: from facing the Sun (12:00 noon) to the terminator (18:00 sunset), into the dark half (0:00 midnight), and back to the terminator (6:00 sunrise). The strip below colours each stretch he passes through yellow (day) or dark blue (night); after a full turn, yellow and blue take exactly half each. You can also drag the time slider.',

    s2k: 'Step 2 · Look up at the sky',
    s2t: 'Seen from the ground, why does the Sun rise in the east?',
    s2e: 'This step answers: if it is the Earth that turns, why does Sam on the ground see the Sun moving instead — always rising in the east and setting in the west? Sam cannot feel himself turning; all he sees is the sky. The first picture is Sam’s sky: he faces south, so east is on his left and west on his right. The line across the middle is the <strong>horizon</strong>, where sky and ground seem to meet when you stand on the ground; once the Sun drops below it, you cannot see it. The second picture again looks down from above the North Pole at the very same moment (the same moment as in step 1, too). The Earth turns <strong>from west to east</strong> (anticlockwise seen from above the North Pole), carrying Sam round towards the Sun again and again. To him it looks as if the Sun rises over the eastern horizon, climbs overhead by noon and sets in the west. The Sun rising in the east and setting in the west is how the Earth’s spin looks from the ground.',
    reverse: 'What if the Earth spun backwards? (imagine)', reverseOff: 'Back to the real spin',
    c2sky: 'Sam’s sky (facing south: east on the left, west on the right)', c2top: 'The same moment, seen from above the North Pole',
    east: 'E', west: 'W', overhead: 'overhead',
    s2lgSun: 'the Sun', s2lgTrail: 'where the Sun has been', s2lgHorizon: 'horizon', s2lgPath: 'the Sun’s path through the day',
    sky_overhead: 'is straight overhead', sky_eastHigh: 'is in the eastern sky', sky_westHigh: 'is in the western sky', sky_eastRim: 'is right on the eastern horizon', sky_westRim: 'is right on the western horizon', sky_below: 'is below the horizon, out of sight',
    s2readout: '{clock}: the Sun {where}, {alt}.',
    altUp: '{a}° above the horizon', altDown: '{a}° below the horizon', altZero: 'at a height of 0°',
    s2rev: '(Imaginary) The Earth spins backwards: Sam is carried round clockwise and the Sun now rises in the west. The real Sun rises in the east, so the Earth’s real spin must be west to east.',
    s2hint: 'What to try: press “Spin the Earth once” and watch the Sun in the first picture climb from the left (east) along the dashed arch, pass overhead and set on the right (west), leaving dots where it has been; at the same time the second picture shows Sam being carried anticlockwise. Then press “What if the Earth spun backwards?” and play again: Sam goes round clockwise and the Sun rises on the right (west). East and west still mean the directions on the map (for China, the Pacific Ocean is to the east); they do not swap.',

    s3k: 'Step 3 · Same moment, different places',
    s3t: 'When it is noon in Beijing, what time is it in London and New York?',
    s3e: 'This step answers: at any one moment, is it daytime everywhere on Earth? Because the Earth turns, different places take turns being carried into the lit half. Maps give east–west position as <strong>longitude</strong>: a full circle is 360°, London is near 0°, Beijing is at about 116° east, Tokyo about 140° east and New York about 74° west. The Earth turns 360° in 24 hours, so 15° every hour: a place 15° of longitude further east gets the Sun overhead one hour earlier. The picture again looks down from above the North Pole; the four coloured dots are four cities (drawn on one circle so they are easy to see).',
    bjSlider: 'Local time in Beijing',
    c3title: 'Four cities at one moment (from above the North Pole)',
    city_beijing: 'Beijing', city_tokyo: 'Tokyo', city_london: 'London', city_newyork: 'New York',
    s3row: '{city} {clock} ({st})',
    s3readout: 'At the same moment: {rows}.',
    s3hint: 'What to try: drag Beijing to 12:00. Blue Beijing faces the Sun, while pink New York sits on the dark half, close to midnight. Then drag slowly onwards and watch the terminator sweep across the cities one after another: whoever is turned into the lit half first gets sunrise first. These times are worked out from longitude and are called “local solar time”; everyday clocks use time zones shared across a region, which can differ by tens of minutes, and some places also move their clocks an hour forward in summer.',

    s4k: 'Step 4 · How fast are we going?',
    s4t: 'As the Earth carries us round, how far do we travel each hour?',
    s4e: 'This step answers: the Earth turns once in 24 hours, so how fast are we carried along on the ground, and why can we not feel it? The Earth’s radius is about 6371 km, so the equator is 2 × π × radius, about 40 000 km, around. Covering that in 24 hours means about 1670 km every hour — faster than a jet plane. The further from the equator, the smaller the circle. <strong>Latitude</strong> says how far from the equator you are: 0° at the equator, 90° at the North Pole; Beijing is at about 40° north. The picture shows the Earth from the side, and the orange ring is the circle a person at that latitude travels round each day. Why can’t we feel it? We, the air and the buildings all move together at the same speed, and that speed hardly changes. The turning is also very gentle — just once a day — so the “turning force” needed is less than 0.4% of gravity. It is like sitting in a plane in smooth flight, where the water in your cup stays level.',
    latSlider: 'Latitude (how far from the equator)',
    c4side: 'Earth from the side: orange ring = the daily circle', c4bar: 'Kilometres travelled per hour',
    bar_here: 'this latitude', bar_train: 'fast train 350', bar_plane: 'jet plane 900',
    s4lgRing: 'daily circle at this latitude', s4lgOld: 'latitudes you tried', s4lgAxis: 'axis',
    s4readout: 'Latitude {lat}°: the daily circle is about {circ} km long, so about {kmh} km every hour (about {ms} m every second) — {r1} times a fast train and {r2} times a jet plane. The turning force needed is about {g}% of gravity.',
    s4pole: 'Latitude 90° (the North Pole): you stand right on the axis and simply turn slowly on the spot, once a day, hardly moving at all.',
    s4hint: 'What to try: drag the latitude slowly from 0 (equator) to 90 (North Pole). The orange ring in the top picture shrinks and the “this latitude” bar below gets shorter: at the equator you outrun a jet, at Beijing (about 40°) you do about 1280 km an hour, beyond about 57° you are slower than the plane, and at the pole you hardly move. Latitudes you have tried leave faint rings behind.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Day and night in one sentence',
    s5fin: '<strong>Day and night come from the Earth’s rotation.</strong> The Sun lights the half of the Earth that faces it (step 0). The Earth turns west to east around its axis, so every place takes turns on the lit half and the dark half, one turn every 24 hours (step 1). Standing on the turning ground, we see the Sun rise in the east and set in the west (step 2). At any moment some places have day and others night, and every 15° further east the Sun is overhead an hour earlier (step 3). We are carried along at over a thousand kilometres an hour, yet cannot feel it because everything moves with us and the turning is extremely gentle (step 4).',
    truthTitle: 'What this page simplifies',
    truth1: 'The axis: this page draws the axis upright, so every place gets 12 hours of day and 12 of night. The real axis is tilted by about 23.5°, so the length of the day changes with the seasons — that is the story of the seasons.',
    truth2: 'The length of a day: “one turn in 24 hours” here is measured against the Sun. Measured against the distant stars, one turn takes about 23 hours 56 minutes; the missing minutes come from the Earth also travelling round the Sun at the same time (its orbit, which takes a year).',
    truth3: 'Sizes and distances: the Sun and Earth are not drawn to scale. Drawing sunlight as parallel lines, though, is a very good approximation, because the Sun is so far away.',
    quizTitle: 'Test yourself',
    q1: '1. It is night where you are. What is the most direct reason?', q1a: 'The Sun has gone down to rest', q1b: 'Your side of the Earth is facing away from the Sun', q1c: 'Clouds are blocking the Sun',
    q2: '2. About how long does the Earth take to spin round once?', q2a: 'A day (24 hours)', q2b: 'A month', q2c: 'A year',
    q3: '3. When it is 12:00 local time in Beijing, what is the local time in New York (74° west), roughly?', q3a: 'Also 12:00', q3b: 'About {ny} the evening before', q3c: 'About {wrong} the next morning',
    check: 'Check',
    f1ok: 'Right. The Earth has turned your place onto the half facing away from the Sun.', f1a: 'No: the Sun never stops shining or “rests”; the Earth has turned you to the side facing away from it.', f1c: 'No: clouds only block the Sun for a while, and a cloudless night is just as dark.',
    f2ok: 'Right. One turn is one day, about 24 hours.', f2b: 'No: a month is roughly how long the Moon takes to go round the Earth.', f2c: 'No: a year is how long the Earth takes to go round the Sun (its orbit).',
    f3ok: 'Right. New York is about {d}° west of Beijing; at one hour per 15° that is about {h} hours later in the day for the Sun, so it is around {ny} the evening before.', f3a: 'No: different longitudes get the Sun overhead at different moments.', f3c: 'No: New York is west of Beijing, so you subtract the difference instead of adding it.',
    unanswered: 'Not answered yet.',
    linksTitle: 'Where to next',
    lk1: 'Latitude & longitude · step 4: how longitude and time line up →',
    lk2: 'Earth’s orbit & the seasons · step 3: with a tilted axis, why days get longer and shorter →',
    lk3: 'Moon phases · step 0: the Moon is always half lit, too →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Day and Night · The Earth Itself Is Turning”.'
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
  if (typeof window.refreshDayNight === 'function') window.refreshDayNight();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.DN_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
