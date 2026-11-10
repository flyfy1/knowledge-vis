'use strict';
// Simple circuits lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '简单电路 · 灯为什么要接成一个圈',
    back: '← 知识索引',
    compare: '对照另一版本：简单电路 · 电流要走一圈 →',
    navLabel: '简单电路步骤导航',
    tagline: '一节电池、两根导线、一个小灯泡，怎样接灯才会亮？七步里你会自己接线，找出「完整的圈」这条规则，再用它解释开关、导体和绝缘体、两盏灯的两种接法、危险的短路，以及电池加多了灯为什么会烧坏。',
    nav0: '0 接一接', nav1: '1 一个圈', nav2: '2 导体', nav3: '3 两盏灯', nav4: '4 短路', nav5: '5 几节电池', nav6: '6 收束',
    pause: '暂停流动', resume: '继续流动',
    flowNote: '小点表示电流的方向和大小：点走得越快，电流越大（慢放示意，不是电子的真实速度）。',

    s0k: '第 0 步 · 先动手接',
    s0t: '两根导线该接在灯泡的哪里，灯才会亮？',
    s0e: '这一步要回答：用两根导线把电池和小灯泡连起来，接在哪里灯才会亮？图左是两节电池串成的电池组（3 伏）：上端是 <strong>+ 极</strong>，下端是 <strong>− 极</strong>。<strong>电压</strong>就是电池推动电荷流动的本领，单位是伏（V）。灯泡画成了剖开的样子：玻璃里的细灯丝，一头连着灯泡底部的<strong>尖端</strong>，另一头连着侧面的<strong>金属螺纹</strong>。红线从 + 极出发，黑线从 − 极出发，你来决定它们的另一头接在哪里。',
    redTo: '红线（从 + 极）的另一头接到', blackTo: '黑线（从 − 极）的另一头接到',
    toTip: '灯泡尖端', toSide: '灯泡侧面螺纹', toNone: '不接', toPlus: '电池 + 极',
    s0lit: '灯亮了：电流从 + 极出发，沿红线进入灯泡的{in}，穿过灯丝，从{out}出来，再沿黑线回到 − 极。这是一个完整的圈，叫<strong>闭合回路</strong>。灯丝里的<strong>电流</strong>（每秒流过的电量，单位安培 A）是 {i} 安。',
    s0open: '灯不亮：圈没有接完整。电流必须从 + 极出发、绕一圈回到 − 极，中间有一处没接上，电流就一点也流不动。',
    s0shortSame: '灯不亮：两根线接在灯泡的同一个触点上，电流从 + 极出发，不用穿过灯丝就能直接回到 − 极。这叫<strong>短路</strong>，电池输出的电流高达 {i} 安，电池和导线会发烫。',
    s0shortPlus: '灯不亮：黑线把电池的两极直接连在一起了（<strong>短路</strong>），电流 {i} 安全从这根线上绕回去，灯丝里一点也没有。电池和导线会发烫，真实操作中千万不要这样接。',
    inTip: '尖端', inSide: '侧面螺纹',
    s0hint: '观察顺序：先把红线接「灯泡尖端」、黑线接「灯泡侧面螺纹」，看小点怎样绕一圈；再把两根线都接到同一个触点上；最后试试黑线接「电池 + 极」。每种接法都看灯丝里有没有小点经过。',
    bulbN: '灯 {n}', c5plot: '刚接上时灯的功率（瓦），横轴：电池节数', lgRated: '额定功率 0.9 瓦', lgBurn: '灯丝能承受的上限 1.8 瓦', lgTried: '试过的节数', lgGlow: '灯泡的光（越大越亮）',
    lgWire: '导线', lgFlow: '电流（小点）', lgHot: '短路时发烫的导线',

    s1k: '第 1 步 · 一个圈',
    s1t: '圈断在哪里，灯都会灭吗？各处的电流一样大吗？',
    s1e: '这一步要回答：一个只有一条路的圈，断开一处会怎样？圈上各处的电流一样大吗？<strong>开关</strong>就是圈上一个可以开合的缺口：合上，圈是完整的；断开，圈就断了。图里串着三只<strong>电流表</strong>（①②③），它们测的是每秒流过那里的电量。先合上开关，看三只表的读数；再随便剪断 A、B、C、D 中的一处，看灯和三只表。',
    swClose: '合上开关', swOpen: '断开开关',
    cutA: '剪断 A', cutB: '剪断 B', cutC: '剪断 C', cutD: '剪断 D', mendAll: '全部接好',
    s1on: '开关合上，圈是完整的：电流表 ① {a} 安、② {b} 安、③ {c} 安，三只表读数一样。电流在圈上哪里都一样大，它不会在灯里「用掉」，用掉的是电能。灯的功率 {p} 瓦。',
    s1off: '圈在{where}断开：①②③ 三只表都读 0 安，灯灭了，圈上所有的小点同时停下。断开一处，整个圈的电流都停。',
    whereSw: '开关处', whereCut: '{list} 处',
    s1hint: '观察顺序：合上开关，比较三只表；再剪断离灯最远的 D，看灯是不是也灭；接好后换剪 A。我们按惯例把电流方向画成从 + 极经外面的电路流向 − 极。',
    lgMeter: '电流表 ①②③', lgCut: '可以剪断的位置 A–D',

    s2k: '第 2 步 · 导体与绝缘体',
    s2t: '圈上留一个缺口，放什么进去灯会亮？',
    s2e: '这一步要回答：哪些东西能让电流通过？圈上留了一个缺口，把一样东西夹进缺口里，相当于让它成为圈的一部分。电流容易通过的材料叫<strong>导体</strong>，几乎不让电流通过的叫<strong>绝缘体</strong>。每试一样，下面的记录表就多一行：灯亮不亮、电流有多大。',
    mat_copper: '铜片', mat_iron: '铁钉', mat_foil: '铝箔', mat_lead: '铅笔芯（石墨）', mat_salt: '一杯盐水', mat_plastic: '塑料尺', mat_rubber: '橡皮', mat_wood: '干木条', mat_glass: '玻璃棒', mat_paper: '纸条',
    s2empty: '缺口里还没放东西：圈是断的，没有电流。',
    s2readout: '缺口里放着{m}：电流 {i}，灯的功率 {p} 瓦。{verdict}',
    clsGood: '灯亮了，它是导体。', clsGoodDim: '灯亮了，但比接铜片时暗：它导电，可没有金属那么好。',
    clsPoor: '灯不亮，可电流表还有读数：它能导一点电，但太弱，点不亮灯。',
    clsNone: '电流小于 1 微安，几乎为零：它是绝缘体。',
    tblMat: '材料', tblLit: '灯', tblI: '电流', tblClass: '归类',
    litYes: '亮', litNo: '不亮', kGood: '导体', kPoor: '导电很差', kNone: '绝缘体',
    clear2: '清空记录',
    s2hint: '观察顺序：先试三种金属，再试铅笔芯，最后试盐水和几样日常的绝缘体。注意铅笔芯和盐水：它们都能导电，只是本领不同。电流表的单位：1 安 = 1000 毫安，1 毫安 = 1000 微安。这里各材料的电阻是示意值；潮湿的木头、脏污的塑料表面也会导一点电。',

    s3k: '第 3 步 · 两盏灯',
    s3t: '接两盏灯，一条路串着和分两条路并着，有什么不同？',
    s3e: '这一步要回答：两盏一样的灯，有两种接法，亮度和「拧下一盏」时的表现有什么不同？<strong>串联</strong>：两盏灯排在同一条路上，电流先过灯 1 再过灯 2。<strong>并联</strong>：电流在岔口分成两条路，各走一盏灯，再汇合。灯的亮暗看它的<strong>功率</strong>（灯每秒用掉的电能，单位瓦 W）。先比较两种接法的亮度，再拧下灯 2。',
    series: '串联（一条路）', parallel: '并联（两条路）', unscrew: '拧下灯 2', screw: '装回灯 2',
    s3readout: '{mode}：灯 1 功率 {p1} 瓦，灯 2 功率 {p2} 瓦，电池输出电流 {i} 安。和只接一盏灯（{p0} 瓦）相比，灯 1 的亮度（功率）是它的 {k}%。{note}',
    modeS: '串联', modeP: '并联',
    noteS: '串联时两盏灯分着用电池的电压，每盏都暗了很多。',
    noteP: '并联时每盏灯都直接接在电池两端，比串联亮得多；只比单独一盏暗一些，因为电流变大后，电池自己的内阻分走的电压也多了。',
    noteSGone: '灯 2 拧下后，唯一的那条路断了，灯 1 也灭了。',
    notePGone: '灯 2 拧下后，只是那条岔路断了，灯 1 所在的路还是完整的圈，照样亮。',
    s3hint: '观察顺序：先在串联时拧下灯 2，再在并联时拧下灯 2，比较灯 1。并联时两盏灯比单独一盏暗一些，是因为电池内部也有一点电阻，电流大了，电池自己分走的电压也多一点。家里的电灯就是并联的，所以关掉一盏不影响其他。',

    s4k: '第 4 步 · 短路',
    s4t: '用一根导线把灯泡两端直接连起来，会发生什么？',
    s4e: '这一步要回答：如果有一条几乎没有阻碍的路绕过灯泡，电流会怎么走？电池里面也有一点阻碍电流的本领，叫<strong>内阻</strong>（这里每节 0.5 欧）。接上那根橙色的「短路线」：电流在岔口面前，几乎全挑没有阻碍的那条路走。这种电流不经过用电器、直接回到电池的情况叫<strong>短路</strong>。',
    shortOn: '接上短路线', shortOff: '拆掉短路线',
    s4off: '没有短路线：电池输出 {i} 安，全部流过灯丝，灯亮。电池内部每秒发热 {h} 焦（{h} 瓦）。',
    s4on: '接上短路线：电池输出 {i} 安，是平时的 {k} 倍；灯丝里只剩 {ib} 安，灯灭了。电池内部每秒发热 {h} 焦（{h} 瓦），是平时的 {kh} 倍——电池和导线会很快发烫，甚至损坏或起火。',
    s4hint: '观察顺序：接上短路线，看灯丝上的小点几乎停下，而短路线和电池里的小点跑得飞快，电池和导线变红（表示发热）。所以千万不要用导线直接连接电池的两极，更不要碰家里的插座。',

    s5k: '第 5 步 · 几节电池',
    s5t: '电池越多，灯就越亮吗？能一直加下去吗？',
    s5e: '这一步要回答：把更多电池一节接一节地串起来，灯会怎样？每节电池 1.5 伏，串起来电压相加。这盏灯的<strong>额定功率</strong>是 0.9 瓦：灯两端正好有 3 伏时，它每秒用掉 0.9 焦的电能，这是它设计好的正常亮度。电池里面有一点电阻，所以两节电池接上时，灯两端略低于 3 伏。拖动「电池节数」，看灯的功率是额定功率的百分之几。',
    nCells: '电池节数', newBulb: '换一盏新灯泡',
    s5readout: '{n} 节电池（{v} 伏）：电流 {i} 安，灯的功率 {p} 瓦，是额定功率 0.9 瓦的 {pct}%。{state}',
    stDim: '灯比正常暗。', stOk: '接近正常亮度。', stOver: '超过额定功率：灯特别亮，但灯丝过热，寿命会大大缩短。',
    stBurnt: '刚接上时功率有 {p0} 瓦，超过了灯丝能承受的 1.8 瓦，灯丝被烧断了。灯丝一断，圈就断了，电流变成 0。',
    stBurntKeep: '这盏灯已经烧断了，圈是断的。按「换一盏新灯泡」再试。',
    s5hint: '观察顺序：从 1 节拖到 4 节，看功率百分比怎样变；烧断后再拖回 2 节，灯也不会再亮，因为坏掉的灯丝不会自己接上，要换新灯泡。这里把灯丝电阻当成不变的 10 欧（真实灯丝越热电阻越大），烧断的界限 1.8 瓦是示意值。',

    s6k: '第 6 步 · 收束',
    s6t: '当一回电路医生：看图判断灯亮不亮',
    s6q: '图中标出黄色圆圈的那盏灯，亮还是不亮？',
    ansLit: '亮', ansDark: '不亮', check: '检查', nextQ: '下一题',
    quizPick: '先选一个答案。',
    quizRight: '对了！', quizWrong: '不对哦。',
    quizN: '第 {k}/{N} 题',
    why_open: '开关断开了，圈不完整，没有电流。',
    why_normal: '开关合上，从 + 极到 − 极是一个完整的圈，灯亮。',
    why_seriesGone: '两盏灯串在同一条路上，灯 2 拧下后这条唯一的路断了，灯 1 也灭。',
    why_parallelGone: '两盏灯并联，灯 2 拧下只断了它那条岔路，灯 1 那条路仍是完整的圈，照样亮。',
    why_shortWire: '灯两端被一根导线直接连起来（短路），电流全从导线绕过去，灯不亮。',
    why_plastic: '缺口里放的是塑料，它是绝缘体，圈等于是断的。',
    why_lead: '铅笔芯是石墨做的，能导电，灯会亮，只是比接金属时暗一些。',
    why_samePole: '灯泡的尖端和侧面都接到了 + 极，灯丝两头接在同一处，电流不会穿过灯丝，也没有回到 − 极的路。',
    s6fin: '回头看这一路。<strong>第 0 步</strong>：电流要从 + 极出发，穿过灯丝，回到 − 极，形成闭合回路。<strong>第 1 步</strong>：只有一条路的圈，各处电流一样大；断开任何一处，整个圈都停。<strong>第 2 步</strong>：金属是导体，铅笔芯和盐水能导一点电，塑料、橡皮、干木头、玻璃是绝缘体。<strong>第 3 步</strong>：串联时两盏灯同生共灭且都变暗；并联时互不影响。<strong>第 4 步</strong>：短路让电流绕过用电器，电流变得很大，非常危险。<strong>第 5 步</strong>：串联的电池越多，电压越高，灯越亮，超过灯丝的承受能力就会烧断。',
    boundary: '适用范围：本页的电路是理想化的计算模型：每节电池 1.5 伏、内阻 0.5 欧；灯丝电阻固定 10 欧（真实灯丝越热电阻越大）；导线电阻 0.02 欧。灯「看得出发光」取 0.02 瓦、烧断取 1.8 瓦，都是示意值。小点只示意电流的方向与大小，不是电子的真实运动；实际在金属导线里移动的电子，方向和我们画的电流方向相反。',
    linksTitle: '接下来可以去',
    lk1: '→ 串联与并联第 0 步（初中）：串联时电流和电压怎样分',
    lk2: '→ 串联与并联第 3 步（初中）：拧下一个灯泡，其他灯还亮吗',
    lk3: '→ 欧姆定律第 0 步（初中）：电流和电压是什么关系',
    lk4: '→ 欧姆定律第 4 步（初中）：电池的内阻',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《简单电路 · 电流要走一圈》的平行版本。'
  },
  en: {
    pageTitle: 'Simple Circuits · Why a Bulb Needs a Complete Loop',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Simple Circuits · Current Must Go Round →',
    navLabel: 'Simple circuits lesson steps',
    tagline: 'One battery, two wires and a small bulb: how do you connect them so the bulb lights? In seven steps you will do the wiring yourself and find the rule of the “complete loop”, then use it to explain switches, conductors and insulators, the two ways to wire two bulbs, the danger of a short circuit, and why too many batteries burn a bulb out.',
    nav0: '0 Wire it', nav1: '1 One loop', nav2: '2 Conductors', nav3: '3 Two bulbs', nav4: '4 Short circuit', nav5: '5 More cells', nav6: '6 Wrap-up',
    pause: 'Pause the flow', resume: 'Resume the flow',
    flowNote: 'The dots show the direction and size of the current: faster dots mean more current (slowed down for teaching; this is not how fast electrons really move).',

    s0k: 'Step 0 · Wire it up',
    s0t: 'Where on the bulb must the two wires go to make it light?',
    s0e: 'This step asks: when you join a battery and a small bulb with two wires, where do the wires have to go for the bulb to light? On the left is a battery pack of two cells (3 volts): the top is the <strong>+ terminal</strong>, the bottom the <strong>− terminal</strong>. <strong>Voltage</strong> is how hard the battery pushes charge round, measured in volts (V). The bulb is drawn cut open: inside the glass, one end of the thin filament is joined to the <strong>tip</strong> at the bottom of the bulb, and the other end to the <strong>metal screw thread</strong> on its side. The red wire starts at +, the black wire starts at −; you decide where their other ends go.',
    redTo: 'Other end of the red wire (from +)', blackTo: 'Other end of the black wire (from −)',
    toTip: 'Bulb tip', toSide: 'Bulb screw thread', toNone: 'Not connected', toPlus: 'Battery +',
    s0lit: 'The bulb lights: current leaves +, runs along the red wire into the bulb’s {in}, through the filament, out through the {out}, and back along the black wire to −. This complete loop is called a <strong>closed circuit</strong>. The <strong>current</strong> in the filament (how much charge passes each second, measured in amperes, A) is {i} A.',
    s0open: 'The bulb stays dark: the loop is not complete. Current has to leave +, go all the way round and come back to −; with one gap anywhere, it cannot flow at all.',
    s0shortSame: 'The bulb stays dark: both wires go to the same contact on the bulb, so current can get from + back to − without passing through the filament. This is a <strong>short circuit</strong>: the battery drives {i} A, and the battery and wires get hot.',
    s0shortPlus: 'The bulb stays dark: the black wire joins the battery’s two terminals directly (a <strong>short circuit</strong>). All {i} A runs round through that wire and none goes through the filament. The battery and wire heat up; never do this with real batteries.',
    inTip: 'tip', inSide: 'screw thread',
    s0hint: 'What to try: first put the red wire on the tip and the black wire on the screw thread, and watch the dots go round. Then put both wires on the same contact. Finally try the black wire on “Battery +”. Each time, check whether any dots pass through the filament.',
    bulbN: 'Bulb {n}', c5plot: 'Bulb power just after connecting (W) vs number of cells', lgRated: 'rated power, 0.9 W', lgBurn: 'most the filament can take, 1.8 W', lgTried: 'cell counts you tried', lgGlow: 'the bulb’s light (bigger = brighter)',
    lgWire: 'Wire', lgFlow: 'Current (dots)', lgHot: 'Wire heating up in a short circuit',

    s1k: 'Step 1 · One loop',
    s1t: 'Does a break anywhere put the bulb out? Is the current the same all the way round?',
    s1e: 'This step asks: in a loop with only one path, what happens if it breaks in one place, and is the current the same everywhere round it? A <strong>switch</strong> is a gap in the loop that you can open and close: closed, the loop is complete; open, it is broken. Three <strong>ammeters</strong> (①②③) sit in the loop; each measures how much charge passes that point every second. Close the switch and read the three meters. Then cut the wire at any one of A, B, C or D and watch the bulb and the meters.',
    swClose: 'Close the switch', swOpen: 'Open the switch',
    cutA: 'Cut at A', cutB: 'Cut at B', cutC: 'Cut at C', cutD: 'Cut at D', mendAll: 'Mend every cut',
    s1on: 'Switch closed, loop complete: ammeter ① reads {a} A, ② {b} A and ③ {c} A, all the same. The current is equal everywhere round the loop; it is not “used up” in the bulb (energy is). The bulb’s power is {p} W.',
    s1off: 'The loop is broken at {where}: meters ①②③ all read 0 A, the bulb goes out, and every dot in the loop stops at the same moment. One break stops the current all the way round.',
    whereSw: 'the switch', whereCut: '{list}',
    s1hint: 'What to try: close the switch and compare the three meters. Then cut at D, the point furthest from the bulb, and see whether the bulb still goes out; mend it and cut at A instead. By convention we draw the current flowing from + through the outside circuit to −.',
    lgMeter: 'Ammeters ①②③', lgCut: 'Places you can cut, A–D',

    s2k: 'Step 2 · Conductors and insulators',
    s2t: 'Leave a gap in the loop: what can you put in it to light the bulb?',
    s2e: 'This step asks: which things let current through? The loop has a gap; clipping an object into the gap makes it part of the loop. Materials that let current through easily are called <strong>conductors</strong>; ones that let almost none through are <strong>insulators</strong>. Each test adds a row to the record below: does the bulb light, and how big is the current?',
    mat_copper: 'Copper strip', mat_iron: 'Iron nail', mat_foil: 'Aluminium foil', mat_lead: 'Pencil lead (graphite)', mat_salt: 'Cup of salt water', mat_plastic: 'Plastic ruler', mat_rubber: 'Eraser', mat_wood: 'Dry stick of wood', mat_glass: 'Glass rod', mat_paper: 'Strip of paper',
    s2empty: 'Nothing in the gap yet: the loop is broken and there is no current.',
    s2readout: 'In the gap: {m}. Current {i}; bulb power {p} W. {verdict}',
    clsGood: 'The bulb lights, so it is a conductor.', clsGoodDim: 'The bulb lights, but more dimly than with copper: it conducts, though not as well as a metal.',
    clsPoor: 'The bulb stays dark, yet the meter still shows a current: it conducts a little, but too weakly to light the bulb.',
    clsNone: 'Less than 1 microampere, practically nothing: it is an insulator.',
    tblMat: 'Material', tblLit: 'Bulb', tblI: 'Current', tblClass: 'Group',
    litYes: 'lit', litNo: 'dark', kGood: 'conductor', kPoor: 'poor conductor', kNone: 'insulator',
    clear2: 'Clear the record',
    s2hint: 'What to try: test the three metals first, then the pencil lead, then the salt water and the everyday insulators. Watch the pencil lead and the salt water: both conduct, but not equally well. Units: 1 A = 1000 mA (milliamperes), and 1 mA = 1000 µA (microamperes). The resistances used here are teaching values; damp wood or a grubby plastic surface also conduct a little.',

    s3k: 'Step 3 · Two bulbs',
    s3t: 'Two bulbs: in one line, or on two separate paths. What changes?',
    s3e: 'This step asks: two identical bulbs can be wired in two ways; how do their brightness and their behaviour when you unscrew one differ? In <strong>series</strong>, both bulbs sit on the same path, and the current goes through bulb 1 and then bulb 2. In <strong>parallel</strong>, the current splits at a junction into two paths, one through each bulb, and joins up again. How bright a bulb is depends on its <strong>power</strong> (the electrical energy it uses each second, in watts, W). Compare the brightness first, then unscrew bulb 2.',
    series: 'Series (one path)', parallel: 'Parallel (two paths)', unscrew: 'Unscrew bulb 2', screw: 'Screw bulb 2 back in',
    s3readout: '{mode}: bulb 1 uses {p1} W, bulb 2 uses {p2} W, and the battery delivers {i} A. Compared with a single bulb on its own ({p0} W), bulb 1’s brightness (power) is {k}%. {note}',
    modeS: 'Series', modeP: 'Parallel',
    noteS: 'In series the two bulbs share the battery’s voltage, so each is much dimmer.',
    noteP: 'In parallel each bulb is connected straight across the battery, so both are far brighter than in series; each is only somewhat dimmer than a bulb on its own, because the larger current makes the battery’s own internal resistance keep more of the voltage.',
    noteSGone: 'With bulb 2 unscrewed the only path is broken, so bulb 1 goes out too.',
    notePGone: 'With bulb 2 unscrewed only its own branch is broken; bulb 1’s path is still a complete loop, so it stays lit.',
    s3hint: 'What to try: unscrew bulb 2 in series, then in parallel, and compare bulb 1. In parallel the two bulbs are somewhat dimmer than one on its own because the battery itself has a little resistance: more current means the battery keeps a little more of the voltage for itself. The lights in a home are wired in parallel, which is why switching one off leaves the others on.',

    s4k: 'Step 4 · Short circuit',
    s4t: 'Join the two ends of the bulb with a plain wire: what happens?',
    s4e: 'This step asks: if there is a path round the bulb with almost nothing in the way, which way does the current go? A battery also slows current down a little inside itself; this is its <strong>internal resistance</strong> (0.5 ohm per cell here). Connect the orange “short wire”: faced with a fork, nearly all the current takes the path with almost no resistance. Current that returns to the battery without going through anything that uses it is called a <strong>short circuit</strong>.',
    shortOn: 'Connect the short wire', shortOff: 'Remove the short wire',
    s4off: 'No short wire: the battery delivers {i} A, all of it through the filament, and the bulb lights. The battery’s inside warms by {h} joules every second ({h} W).',
    s4on: 'Short wire connected: the battery delivers {i} A, {k} times the usual current. Only {ib} A is left in the filament, so the bulb goes out. The battery’s inside now heats by {h} joules every second ({h} W), {kh} times as much as before: the battery and wires heat up fast and can be damaged or even catch fire.',
    s4hint: 'What to watch: connect the short wire. The dots in the filament almost stop, while the dots in the short wire and the battery race round, and the battery and wires turn red (showing heat). That is why you must never join a battery’s two terminals with a wire, and never poke anything into a mains socket.',

    s5k: 'Step 5 · More cells',
    s5t: 'More cells, brighter bulb? Can you keep adding them?',
    s5e: 'This step asks: what happens to the bulb as more cells are joined one after another? Each cell gives 1.5 volts, and cells in a row add their voltages. This bulb’s <strong>rated power</strong> is 0.9 W: with exactly 3 volts across it, it uses 0.9 joules of electrical energy every second, the normal brightness it was designed for. The battery has a little resistance inside it, so with two cells the bulb gets a bit less than 3 volts. Drag “Number of cells” and see what percentage of its rated power the bulb gets.',
    nCells: 'Number of cells', newBulb: 'Fit a new bulb',
    s5readout: '{n} cells ({v} V): current {i} A, bulb power {p} W, which is {pct}% of its 0.9 W rating. {state}',
    stDim: 'Dimmer than normal.', stOk: 'Close to normal brightness.', stOver: 'Above its rating: the bulb is extra bright, but the filament runs too hot and will wear out much sooner.',
    stBurnt: 'At the moment of connection the power was {p0} W, more than the 1.8 W the filament can take, so it burned through. A broken filament breaks the loop, and the current drops to 0.',
    stBurntKeep: 'This bulb has already burned out, so the loop is broken. Press “Fit a new bulb” to try again.',
    s5hint: 'What to try: drag from 1 to 4 cells and watch the percentage. After it burns out, drag back to 2 cells: the bulb still stays dark, because a broken filament does not mend itself; you need a new bulb. The filament is treated as a fixed 10 ohms (a real filament’s resistance rises as it heats up), and the 1.8 W burn-out limit is a teaching value.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Be the circuit doctor: will the bulb light?',
    s6q: 'Will the bulb marked with the yellow ring light up or stay dark?',
    ansLit: 'Lights up', ansDark: 'Stays dark', check: 'Check', nextQ: 'Next one',
    quizPick: 'Pick an answer first.',
    quizRight: 'Right!', quizWrong: 'Not quite.',
    quizN: 'Question {k}/{N}',
    why_open: 'The switch is open, so the loop is not complete and no current flows.',
    why_normal: 'The switch is closed, so there is a complete loop from + to −, and the bulb lights.',
    why_seriesGone: 'The two bulbs share one path in series; with bulb 2 unscrewed that only path is broken, so bulb 1 goes out too.',
    why_parallelGone: 'The bulbs are in parallel; unscrewing bulb 2 breaks only its own branch, and bulb 1’s path is still a complete loop.',
    why_shortWire: 'A plain wire joins the two ends of the bulb (a short circuit), so the current goes round through the wire and the bulb stays dark.',
    why_plastic: 'The gap holds plastic, an insulator, so the loop is effectively broken.',
    why_lead: 'Pencil lead is graphite, which conducts, so the bulb lights, just more dimly than with metal.',
    why_samePole: 'The bulb’s tip and its screw thread are both connected to +. Both ends of the filament sit at the same place, so no current goes through it, and there is no way back to −.',
    s6fin: 'Looking back. <strong>Step 0</strong>: current must leave +, pass through the filament and return to −, making a closed circuit. <strong>Step 1</strong>: in a loop with one path the current is the same everywhere, and a break anywhere stops it all. <strong>Step 2</strong>: metals are conductors, pencil lead and salt water conduct a little, and plastic, rubber, dry wood and glass are insulators. <strong>Step 3</strong>: bulbs in series are both dimmer and go out together; bulbs in parallel do not affect each other. <strong>Step 4</strong>: a short circuit lets current bypass the bulb, so the current becomes very large, which is dangerous. <strong>Step 5</strong>: more cells in series means more voltage and a brighter bulb, until the filament can take no more and burns out.',
    boundary: 'Scope: the circuits on this page come from an idealised model: each cell is 1.5 V with 0.5 ohm of internal resistance, the filament is a fixed 10 ohms (a real one’s resistance rises as it heats up), and each wire is 0.02 ohm. The 0.02 W “visibly glowing” level and the 1.8 W burn-out level are teaching values. The dots only show the direction and size of the current, not the real motion of electrons; in a metal wire the electrons actually drift the opposite way to the current we draw.',
    linksTitle: 'Where to go next',
    lk1: '→ Series and parallel, step 0 (junior school): how current and voltage divide in series',
    lk2: '→ Series and parallel, step 3 (junior school): unscrew one bulb; do the others stay lit?',
    lk3: '→ Ohm’s law, step 0 (junior school): how current depends on voltage',
    lk4: '→ Ohm’s law, step 4 (junior school): a battery’s internal resistance',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Simple Circuits · Current Must Go Round”.'
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
