'use strict';
// Ohm's law lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '欧姆定律 · 两只电表量出一个电阻',
    back: '← 知识索引',
    compare: '对照另一版本：欧姆定律 · 电流是调出来的 →',
    navLabel: '欧姆定律步骤导航',
    tagline: '一只电流表、一只电压表、几节干电池。先加电池看电流怎样涨，再换电阻、换导线、换成小灯泡，最后比一比两个电阻谁更烫。每一步的结论都来自电表读数和图上的点，而不是先背公式。',
    nav0: '0 加电池', nav1: '1 换电阻', nav2: '2 电阻从哪来', nav3: '3 伏安法', nav4: '4 小灯泡', nav5: '5 谁更烫', nav6: '6 收束',
    lgFlow: '黄点：沿电流方向移动，越快电流越大（示意）', lgTried: '你试过的点', lgNow: '当前', clearDots: '清除记录点',

    s0k: '第 0 步 · 电流与电压',
    s0t: '多加一节电池，电流会变成多少？',
    s0e: '这一步要回答：给同一个电阻加更多节电池，通过它的电流怎样变？电路由干电池、一个 10 Ω 的电阻和两只电表连成一圈（<a class="xlink" href="../../../physics/circuits/simple-circuits/#step0">→ 简单电路第 0 步：为什么电路要连成一圈</a>）。<strong>电压</strong> U 由电源提供，是电路里形成电流的原因，单位伏特 V；一节干电池 1.5 V，几节首尾相连时电压相加。<strong>电流</strong> I 是每秒流过导线某个截面的电荷有多少，单位安培 A。<strong>电流表</strong>（圆里写 A）串在回路里，读流过它的电流；<strong>电压表</strong>（圆里写 V）并在电阻两端，读电阻两端的电压。「电路」图里的黄点沿电流方向（从电池正极出发，经电阻回到负极）移动，走得越快表示电流越大。「I 与 U」图横轴是电压、纵轴是电流，你试过的每个电池数都留下一个白点。',
    c0a: '电路（10 Ω 电阻）', c0b: '电流 I (A) 与电压 U (V)', s0lgLine: '过原点的直线', cellsSlider: '电池节数',
    s0readout: '{n} 节电池：U = {U} V，电流表读 I = {I} A，U ÷ I = {ratio} Ω。',
    s0readoutZero: '0 节电池：U = 0，没有电流（I = 0），黄点停住。此时 U ÷ I 是 0 ÷ 0，没有意义。',
    s0hint: '观察顺序：只改电池节数，电阻不换。看「电路」图里黄点随电池增多越走越快，两只电表读数一起涨；「I 与 U」图里白点排成一条过原点的直线：电压加倍，电流也加倍，即 I 与 U <strong>成正比</strong>。每个点的 U ÷ I 都是 10 Ω。这个不随电压改变的比值，就叫这个导体的<strong>电阻</strong> R，单位欧姆 Ω。',

    s1k: '第 1 步 · 欧姆定律',
    s1t: '电压不变，换一个更大的电阻，电流会怎样？',
    s1e: '这一步要回答：电流同时受电压和电阻影响，三者是什么关系？上一步发现，对同一个电阻 U ÷ I 是一个固定的数，叫它的<strong>电阻</strong> R（单位欧姆 Ω）。R 越大，同样电压下流过的电流越小，所以电阻表示导体对电流阻碍作用的大小。现在电压和电阻都能调。「I 与 R」图横轴是电阻、纵轴是电流，橙色曲线是当前电压下 I = U ÷ R 的预测，白点是你试过的电阻。',
    c1a: '电路（电阻可换）', c1b: '电流 I (A) 与电阻 R (Ω)', s1lgCurve: '当前电压下 I = U ÷ R', uSlider1: '电源电压 U（V）', rSlider1: '电阻 R（Ω）',
    s1readout: 'U = {U} V，R = {R} Ω：I = U ÷ R = {I} A，I × R = {IR} V，正好是电源电压。把 R 换成 {R2} Ω，电流会变成 {I2} A，是现在的一半。',
    s1hint: '观察顺序：先固定 U，只拖 R：白点沿橙色曲线往右下走，R 加倍电流减半，I 与 R <strong>成反比</strong>。再改 U：整条曲线上下伸缩（白点随之清空），同一个 R 下电压加倍电流也加倍。合起来就是<strong>欧姆定律</strong>：I = U ÷ R。式中三个量必须是同一段导体、同一时刻的值。',
    quizPrompt: '想一想：一个电阻接在 3 V 上，电流是 0.15 A。改接 6 V，电流是多少？它的电阻是多少？',
    quizA: '0.3 A，20 Ω', quizB: '0.15 A，40 Ω', quizC: '0.3 A，40 Ω',
    check: '核对', correct: '对。R = 3 V ÷ 0.15 A = 20 Ω。电阻是导体自己的性质，不随电压变，所以接 6 V 时 I = 6 ÷ 20 = 0.3 A。可以把 U 拖到 6 V、R 拖到 20 Ω 核对。',
    wrong: '提示：先用第一组数算出 R = U ÷ I；电阻不随所加电压改变，再用 I = U ÷ R 算新电流。',

    s2k: '第 2 步 · 影响电阻的因素',
    s2t: '电阻从哪里来？导线的长短和粗细',
    s2e: '这一步要回答：同一种材料的导线，长度和粗细怎样决定它的电阻？电阻是导体自身的性质，由材料、长度、<strong>横截面积</strong>（把导线切断后断面的面积，单位 mm²）决定，还和温度有关（本步保持室温）。查表：长 1 m、横截面积 1 mm² 的镍铬合金丝电阻约 1.0 Ω。现在用镍铬合金丝，改它的长度 L 和横截面积 S。「导线样品」图按比例画出长度，线的粗细和右端断面圆按横截面积画。下面两张图：「R 与长度 L」画当前粗细下 R 随 L 的变化，「R 与横截面积 S」画当前长度下 R 随 S 的变化；灰色虚线是之前试过的粗细或长度留下的线。',
    c2a: '导线样品（镍铬合金）· 长度 m', c2b: 'R (Ω) 与长度 L (m)', c2c: 'R (Ω) 与横截面积 S (mm²)',
    s2lgLine: '当前导线的关系线', s2lgOld: '之前试过的线', lSlider: '长度 L（m）', sSlider: '横截面积 S（mm²）',
    s2readout: 'L = {L} m，S = {S} mm²：R = 1.0 Ω × {L} ÷ {S} = {R} Ω。同样尺寸的铜丝只有 {Rcu} Ω，约为镍铬丝的 1/{ratio}。',
    s2hint: '观察顺序：先只拖 L：导线变长，「R 与长度 L」图里的点沿过原点的直线走，长度加倍电阻加倍（R 与 L 成正比）。再只拖 S：导线变粗，「R 与横截面积 S」图里的点沿下弯的曲线走，面积加倍电阻减半（R 与 S 成反比）。所以导线用又粗又短的铜线，电阻很小；电热丝、滑动变阻器则用细长的镍铬合金丝。',

    s3k: '第 3 步 · 伏安法测电阻',
    s3t: '只有电压表和电流表，怎样量出一个看不见阻值的电阻？',
    s3e: '这一步要回答：盒子里有一个阻值未知的电阻 Rₓ，怎样用两只电表测出它，又怎样测得更准？方法叫<strong>伏安法</strong>：电压表测 Rₓ 两端的电压 U，电流表测流过它的电流 I，由欧姆定律 R = U ÷ I。真实电表只能读到最小刻度：这里电压表量程 0–3 V、每小格 0.1 V，电流表量程 0–0.6 A、每小格 0.02 A，读数都取最近的一格，所以只测一组算出的 R 有误差。转动电源旋钮改电压，按「记录这组读数」把 (U, I) 存下来。「I 与 U」图里白点是记录的读数，橙色线是穿过原点、整体离白点最近的直线（拟合直线），R 的估计值 = 1 ÷ 它的斜率。',
    c3a: '电路（Rₓ 阻值未知）', c3b: '记录的读数：I (A) 与 U (V)',
    s3lgPts: '记录的读数', s3lgNow: '当前读数', s3lgFit: '拟合直线', s3lgTrue: '真实阻值的直线（揭晓后）',
    uSlider3: '电源旋钮 U（V）', record: '记录这组读数', reveal: '揭晓真实阻值', another: '换一个未知电阻', clearRec: '清空记录',
    s3readout: '当前读数：U = {U} V（{du} 格），I = {I} A（{di} 格），只用这一组算 R = {Rone} Ω。',
    s3fit: '已记录 {n} 组，拟合得 R ≈ {Rfit} Ω。',
    s3fitNone: '还没有记录，先按「记录这组读数」。',
    s3true: '真实阻值 {Rt} Ω：当前这一组的误差 {e1}%，拟合的误差 {ef}%。',
    s3trueNoFit: '真实阻值 {Rt} Ω：当前这一组的误差 {e1}%。',
    s3hidden: '真实阻值尚未揭晓。',
    s3full: '（最多记录 {max} 组，请先清空。）',
    s3hint: '观察顺序：先把电压放在 0.5 V 附近记一组，看只用这一组算出的 R：电流只占两三格，差半格就差很多。再把电压调到 2–3 V 多记几组：读数占的格数多了，每一组的误差都变小；几组一起拟合，误差还会再小一些。最后按「揭晓真实阻值」核对。「换一个未知电阻」会换盒子并清空记录。实验时要让读数尽量占满量程的一大半，并多测几组。',

    s4k: '第 4 步 · 不是定值的电阻',
    s4t: '小灯泡也守欧姆定律吗？',
    s4e: '这一步要回答：U ÷ I 对所有元件都是一个不变的数吗？换上一只标着「2.5 V 0.3 A」的小灯泡，意思是加 2.5 V 时电流 0.3 A、正常发光。灯丝通电会发热，温度越高电阻越大。本页用一个简化模型：灯丝电阻 R = 2 Ω × (1 + 4.22 × P)，P 是灯泡的<strong>电功率</strong>（每秒消耗的电能，P = U × I，单位瓦特 W）。不通电时灯丝 2 Ω，正常发光时 8.33 Ω。「I 与 U」图里白线是灯泡的电流（拖过的电压都留下轨迹），灰色虚线是一个 8.33 Ω 定值电阻作对照；「R = U ÷ I 与 U」图画各电压下灯丝的电阻。',
    c4a: '电路（小灯泡 2.5 V 0.3 A）', c4b: '电流 I (A) 与电压 U (V)', c4c: '灯丝电阻 R = U ÷ I (Ω) 与电压 U (V)',
    s4lgBulb: '小灯泡（走过的电压）', s4lgRes: '8.33 Ω 定值电阻', uSlider4: '电压 U（V）', sweepU: '从 0 扫到 3 V',
    s4readout: 'U = {U} V：I = {I} A，灯丝电阻 R = U ÷ I = {R} Ω，功率 P = {P} W。同样电压下 8.33 Ω 定值电阻的电流是 {Ir} A。',
    s4readoutZero: 'U = 0：没有电流，灯丝在常温，电阻按模型是 2 Ω（电压趋近 0 时的值）。',
    s4hint: '观察顺序：按「从 0 扫到 3 V」，或把 U 从左往右拖。「I 与 U」图里灯泡的白线开始比虚线陡（灯丝冷、电阻小），越往右越平，在 2.5 V 与虚线相交，之后落到虚线下面；「R = U ÷ I 与 U」图里电阻从 2 Ω 一路涨到约 9.8 Ω。所以灯泡的 I–U 图不是直线，说「灯泡电阻是多少」必须说明在什么电压下。每一刻 I = U ÷ R 仍然成立，只是 R 本身在变；只有 R 不变的元件，I–U 图才是过原点的直线。',

    s5k: '第 5 步 · 电功率',
    s5t: '两个电阻接在同一个电源上，哪个更烫？',
    s5e: '这一步要回答：电阻大的更容易发热，还是电阻小的？电流通过电阻时电能变成热。每秒变成热的电能叫<strong>电功率</strong> P，单位瓦特 W，P = U × I。用欧姆定律换掉一个量，得到 P = I² × R（比较电流相同的电阻时好用）和 P = U² ÷ R（比较电压相同的电阻时好用）。6 V 电源接两个电阻：R₁ = 10 Ω 固定，R₂ 可调。可以<strong>并联</strong>（两个电阻各自直接接在电源两端，电压都是 6 V），也可以<strong>串联</strong>（首尾相连排成一条路，电流相同）（<a class="xlink" href="../../../physics/circuits/series-parallel/#step0">→ 串联与并联第 0 步：串联时电压怎样分</a>）。「电路」图里电阻越亮表示发热功率越大；「功率 P 与 R₂」图画两个电阻的功率随 R₂ 的变化，竖线标出当前 R₂。',
    c5aPar: '并联在 6 V 上（电压相同）', c5aSer: '串联在 6 V 上（电流相同）', c5b: '功率 P (W) 与 R₂ (Ω)', c5a: '两个电阻的电路',
    s5lgP1: 'R₁ = 10 Ω 的功率', s5lgP2: 'R₂ 的功率', s5lgGlow: '电阻颜色：越亮发热越多',
    modePar: '并联（电压相同）', modeSer: '串联（电流相同）', rSlider5: '电阻 R₂（Ω）',
    s5readPar: '并联：两个电阻的电压都是 6 V。I₁ = {I1} A，I₂ = {I2} A；P₁ = {P1} W，P₂ = {P2} W。{hot}',
    s5readSer: '串联：电流都是 {I} A。U₁ = {U1} V，U₂ = {U2} V；P₁ = {P1} W，P₂ = {P2} W。{hot}',
    hot1: '更烫的是 R₁（10 Ω）。', hot2: '更烫的是 R₂（{R2} Ω）。', hotEq: 'R₂ = R₁，两个一样烫。',
    s5hint: '观察顺序：先选「并联」，把 R₂ 从 2 Ω 拖到 40 Ω：R₂ 越大越暗，P₂ = U² ÷ R₂ 变小，电压相同时<strong>电阻小的更烫</strong>。再选「串联」，同样拖 R₂：这回 R₂ 越大分到的电压越多、越亮，电流相同时<strong>电阻大的更烫</strong>。所以问「电阻大的发热多还是少」，先要问比较时电压相同还是电流相同。串联时 R₂ 自己的功率在 R₂ = 10 Ω 时最大（0.9 W）。',

    s6k: '第 6 步 · 收束',
    s6t: '一个公式，三个量，各有前提',
    s6fin: '第 0 步：同一个电阻，电流与电压成正比，U ÷ I 是个固定的数，就是电阻 R。第 1 步：电压不变时电流与电阻成反比，合起来是 <strong>I = U ÷ R</strong>。第 2 步：电阻由导体自身决定：材料、长度（成正比）、横截面积（成反比）。第 3 步：伏安法用两只电表测电阻；电表有最小刻度，读数占满量程、多测几组再拟合更准。第 4 步：灯丝发热电阻变大，I–U 图是弯的，说电阻要说明在哪个电压下。第 5 步：P = UI；电压相同时电阻小的更烫，电流相同时电阻大的更烫。',
    formula: 'I = U ÷ R\nR = U ÷ I（伏安法）\nP = U·I = I²·R = U² ÷ R',
    boundary: '适用范围：本页是直流电路、读数稳定后的情形；电源当作没有内阻的理想电源，电表当作理想电表（电流表没有电阻，电压表不分走电流）。欧姆定律对金属导体、定值电阻在温度不变时成立；「灯丝电阻随功率直线增大」是简化模型，真实钨丝还和散热有关。黄点的速度只表示电流的相对大小：真实导线里电子定向移动很慢（每秒不到 1 mm），而且电子从负极往正极走，与规定的电流方向相反。',
    linksTitle: '接着去哪里',
    lk1: '简单电路 · 第 3 步：用导线直接连住灯泡两端（短路）会怎样 →',
    lk2: '串联与并联 · 第 0 步：串联时电流处处相同，电压按电阻分 →',
    lk3: '串联与并联 · 第 2 步：多接一个灯泡，总电阻变大还是变小 →',
    lk4: '简单电路 · 第 4 步：串联更多电池，灯泡会更亮吗 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《欧姆定律 · 电流是调出来的》的平行版本。'
  },
  en: {
    pageTitle: 'Ohm’s Law · Two Meters, One Resistance',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Ohm’s Law · Current You Tune by Hand →',
    navLabel: 'Ohm’s law step navigation',
    tagline: 'An ammeter, a voltmeter and a handful of dry cells. Add cells and watch the current climb; then swap the resistor, the wire and finally a small bulb; last, find out which of two resistors runs hotter. Every conclusion comes from meter readings and points on a graph, not from a formula learned first.',
    nav0: '0 Add cells', nav1: '1 Swap R', nav2: '2 Where R comes from', nav3: '3 Measure R', nav4: '4 A bulb', nav5: '5 Which is hotter', nav6: '6 Wrap-up',
    lgFlow: 'Yellow dots: move in the current’s direction, faster for more current (schematic)', lgTried: 'Points you tried', lgNow: 'Current setting', clearDots: 'Clear the dots',

    s0k: 'STEP 0 · CURRENT AND VOLTAGE',
    s0t: 'Add one more cell: what does the current become?',
    s0e: 'This step asks: if you put more cells across the same resistor, how does the current through it change? The circuit is a loop of dry cells, a 10 Ω resistor and two meters (<a class="xlink" href="../../../physics/circuits/simple-circuits/#step0">→ Simple circuits, step 0: why a circuit has to be a closed loop</a>). <strong>Voltage</strong> U is supplied by the source and is what drives a current round the circuit; it is measured in volts, V. One dry cell gives 1.5 V, and cells joined end to end add up. <strong>Current</strong> I is how much charge passes a cross-section of the wire each second, measured in amperes, A. The <strong>ammeter</strong> (an A in a circle) sits in the loop and reads the current through it; the <strong>voltmeter</strong> (a V in a circle) is connected across the resistor and reads the voltage across it. In the “Circuit” panel the yellow dots move in the direction of the current (out of the cell’s positive end, through the resistor, back to the negative end); faster dots mean more current. The “I against U” graph has voltage across and current up, and every cell count you try leaves a white dot.',
    c0a: 'Circuit (10 Ω resistor)', c0b: 'Current I (A) against voltage U (V)', s0lgLine: 'Straight line through the origin', cellsSlider: 'Number of cells',
    s0readout: '{n} cells: U = {U} V, the ammeter reads I = {I} A, and U ÷ I = {ratio} Ω.',
    s0readoutZero: '0 cells: U = 0, no current (I = 0) and the dots stand still. Here U ÷ I would be 0 ÷ 0, which means nothing.',
    s0hint: 'What to watch: change only the number of cells, keep the resistor. In “Circuit” the dots speed up as cells are added and both meters climb; in “I against U” the white dots fall on a straight line through the origin — double the voltage and the current doubles: I is <strong>proportional</strong> to U. For every dot U ÷ I is 10 Ω. That ratio, which does not change with the voltage, is called the conductor’s <strong>resistance</strong> R, measured in ohms, Ω.',

    s1k: 'STEP 1 · OHM’S LAW',
    s1t: 'Same voltage, bigger resistor: what happens to the current?',
    s1e: 'This step asks: the current depends on both the voltage and the resistance — how exactly? The last step found that for one resistor U ÷ I is a fixed number, its <strong>resistance</strong> R (in ohms, Ω). The larger R is, the less current flows for the same voltage, so resistance measures how strongly a conductor holds the current back. Now both the voltage and the resistance can be changed. The “I against R” graph has resistance across and current up; the orange curve is the prediction I = U ÷ R at the present voltage, and the white dots are the resistors you tried.',
    c1a: 'Circuit (swappable resistor)', c1b: 'Current I (A) against resistance R (Ω)', s1lgCurve: 'I = U ÷ R at this voltage', uSlider1: 'Supply voltage U (V)', rSlider1: 'Resistance R (Ω)',
    s1readout: 'U = {U} V, R = {R} Ω: I = U ÷ R = {I} A, and I × R = {IR} V — exactly the supply voltage. Swap in {R2} Ω and the current would be {I2} A, half of now.',
    s1hint: 'What to watch: hold U and drag only R. The white dots slide down and right along the orange curve; double R and the current halves — I is <strong>inversely proportional</strong> to R. Then change U: the whole curve stretches up or down (the dots are cleared), and at the same R double the voltage gives double the current. Together that is <strong>Ohm’s law</strong>: I = U ÷ R. All three quantities must belong to the same piece of conductor at the same moment.',
    quizPrompt: 'Think: a resistor draws 0.15 A from 3 V. Connected to 6 V instead, what current does it draw, and what is its resistance?',
    quizA: '0.3 A, 20 Ω', quizB: '0.15 A, 40 Ω', quizC: '0.3 A, 40 Ω',
    check: 'Check', correct: 'Right. R = 3 V ÷ 0.15 A = 20 Ω. Resistance belongs to the conductor and does not change with the voltage, so at 6 V I = 6 ÷ 20 = 0.3 A. Set U to 6 V and R to 20 Ω to confirm.',
    wrong: 'Hint: first get R = U ÷ I from the first pair of numbers. The resistance does not depend on the voltage you apply, so then use I = U ÷ R for the new current.',

    s2k: 'STEP 2 · WHAT SETS A RESISTANCE',
    s2t: 'Where does resistance come from? The length and thickness of a wire',
    s2e: 'This step asks: for wires of one material, how do length and thickness set the resistance? Resistance belongs to the conductor itself: it depends on the material, the length and the <strong>cross-sectional area</strong> (the area of the face you would see if you cut the wire, in mm²), and also on temperature (kept at room temperature here). From a table: a nichrome wire 1 m long with a 1 mm² cross-section has a resistance of about 1.0 Ω. The wire here is nichrome; change its length L and cross-section S. The “Wire sample” panel draws the length to scale, with the line thickness and the end disc following the cross-section. Below, “R against length L” shows how R grows with L at the present thickness, and “R against cross-section S” shows how R changes with S at the present length; grey dashed lines are left by thicknesses or lengths you tried before.',
    c2a: 'Wire sample (nichrome) · length in m', c2b: 'R (Ω) against length L (m)', c2c: 'R (Ω) against cross-section S (mm²)',
    s2lgLine: 'Relation for the present wire', s2lgOld: 'Lines you tried before', lSlider: 'Length L (m)', sSlider: 'Cross-section S (mm²)',
    s2readout: 'L = {L} m, S = {S} mm²: R = 1.0 Ω × {L} ÷ {S} = {R} Ω. A copper wire of the same size has only {Rcu} Ω, about 1/{ratio} of the nichrome.',
    s2hint: 'What to watch: first drag only L. A longer wire moves the point along a straight line through the origin in “R against length L” — double the length, double the resistance (R is proportional to L). Then drag only S. A thicker wire moves the point down a bending curve in “R against cross-section S” — double the area, half the resistance (R is inversely proportional to S). That is why connecting leads are short, thick copper with tiny resistance, while heating elements and rheostats use long, thin nichrome.',

    s3k: 'STEP 3 · MEASURING A RESISTANCE',
    s3t: 'With only a voltmeter and an ammeter, how do you measure a resistor you cannot see?',
    s3e: 'This step asks: a box hides a resistor Rₓ of unknown value — how can two meters measure it, and how can you measure it better? The method is the <strong>voltmeter–ammeter method</strong>: the voltmeter reads the voltage U across Rₓ, the ammeter reads the current I through it, and Ohm’s law gives R = U ÷ I. A real meter can only be read to its smallest division: here the voltmeter spans 0–3 V in divisions of 0.1 V and the ammeter spans 0–0.6 A in divisions of 0.02 A, and each reading is taken to the nearest division, so R worked out from a single pair carries an error. Turn the supply knob to change the voltage and press “Record this reading” to store the pair (U, I). In the “I against U” graph the white dots are recorded readings and the orange line is the straight line through the origin that sits closest to all of them overall (the fitted line); the estimate of R is 1 ÷ its slope.',
    c3a: 'Circuit (Rₓ unknown)', c3b: 'Recorded readings: I (A) against U (V)',
    s3lgPts: 'Recorded readings', s3lgNow: 'Present reading', s3lgFit: 'Fitted line', s3lgTrue: 'Line for the true value (once revealed)',
    uSlider3: 'Supply knob U (V)', record: 'Record this reading', reveal: 'Reveal the true value', another: 'Try another hidden resistor', clearRec: 'Clear the records',
    s3readout: 'Present reading: U = {U} V ({du} divisions), I = {I} A ({di} divisions); from this pair alone R = {Rone} Ω.',
    s3fit: '{n} readings recorded; the fit gives R ≈ {Rfit} Ω.',
    s3fitNone: 'Nothing recorded yet — press “Record this reading”.',
    s3true: 'True value {Rt} Ω: the present pair is off by {e1}%, the fit by {ef}%.',
    s3trueNoFit: 'True value {Rt} Ω: the present pair is off by {e1}%.',
    s3hidden: 'True value not revealed yet.',
    s3full: '(At most {max} readings — clear them first.)',
    s3hint: 'What to watch: first set the voltage near 0.5 V and record one reading. Look at R from that pair alone: the current covers only two or three divisions, so half a division matters a lot. Then turn the voltage up to 2–3 V and record several more: each reading spans more divisions and each single error shrinks; fitting several together does a little better still. Finally press “Reveal the true value” to check. “Try another hidden resistor” swaps the box and clears the records. In the lab, aim for readings that fill most of the meter’s range, and take several.',

    s4k: 'STEP 4 · A RESISTANCE THAT CHANGES',
    s4t: 'Does a small bulb obey Ohm’s law too?',
    s4e: 'This step asks: is U ÷ I a fixed number for every component? Swap in a small bulb marked “2.5 V 0.3 A”, meaning it draws 0.3 A and glows normally at 2.5 V. Its filament heats up when current flows, and the hotter it is, the higher its resistance. The page uses a simplified model: filament resistance R = 2 Ω × (1 + 4.22 × P), where P is the bulb’s <strong>electrical power</strong> (electrical energy used per second, P = U × I, in watts, W). With no current the filament is 2 Ω; glowing normally it is 8.33 Ω. In “I against U” the white line is the bulb’s current (every voltage you pass through leaves a trace), and the grey dashed line is a fixed 8.33 Ω resistor for comparison; “R = U ÷ I against U” plots the filament’s resistance at each voltage.',
    c4a: 'Circuit (small bulb, 2.5 V 0.3 A)', c4b: 'Current I (A) against voltage U (V)', c4c: 'Filament resistance R = U ÷ I (Ω) against voltage U (V)',
    s4lgBulb: 'Bulb (voltages you passed through)', s4lgRes: 'Fixed 8.33 Ω resistor', uSlider4: 'Voltage U (V)', sweepU: 'Sweep 0 → 3 V',
    s4readout: 'U = {U} V: I = {I} A, filament resistance R = U ÷ I = {R} Ω, power P = {P} W. At the same voltage a fixed 8.33 Ω resistor would draw {Ir} A.',
    s4readoutZero: 'U = 0: no current, the filament is at room temperature, and the model gives 2 Ω (its value as the voltage approaches 0).',
    s4hint: 'What to watch: press “Sweep 0 → 3 V”, or drag U from left to right. In “I against U” the bulb’s white line starts steeper than the dashed line (cold filament, low resistance), flattens as it goes, crosses the dashed line at 2.5 V and then falls below it; in “R = U ÷ I against U” the resistance climbs from 2 Ω to about 9.8 Ω. So a bulb’s I–U graph is not a straight line, and “the bulb’s resistance” means nothing until you say at what voltage. I = U ÷ R still holds at every moment — R itself is what changes. Only a component whose R stays fixed has a straight I–U line through the origin.',

    s5k: 'STEP 5 · ELECTRICAL POWER',
    s5t: 'Two resistors on the same supply: which one gets hotter?',
    s5e: 'This step asks: does the larger resistance heat up more, or the smaller one? When current flows through a resistor, electrical energy turns into heat. The electrical energy turned into heat each second is the <strong>electrical power</strong> P, in watts, W, and P = U × I. Swap one quantity using Ohm’s law and you get P = I² × R (handy when comparing resistors with the same current) and P = U² ÷ R (handy when comparing resistors with the same voltage). A 6 V supply feeds two resistors: R₁ = 10 Ω is fixed and R₂ can be changed. They can be in <strong>parallel</strong> (each connected straight across the supply, so both have 6 V) or in <strong>series</strong> (joined end to end in a single path, so both carry the same current) (<a class="xlink" href="../../../physics/circuits/series-parallel/#step0">→ Series and parallel, step 0: how voltage splits in series</a>). In “Circuit” a brighter resistor is turning more power into heat; “Power P against R₂” plots both resistors’ power as R₂ changes, with a vertical line at the present R₂.',
    c5aPar: 'In parallel on 6 V (same voltage)', c5aSer: 'In series on 6 V (same current)', c5b: 'Power P (W) against R₂ (Ω)', c5a: 'Circuit with two resistors',
    s5lgP1: 'Power in R₁ = 10 Ω', s5lgP2: 'Power in R₂', s5lgGlow: 'Resistor colour: brighter means more heat',
    modePar: 'Parallel (same voltage)', modeSer: 'Series (same current)', rSlider5: 'Resistance R₂ (Ω)',
    s5readPar: 'Parallel: both resistors have 6 V. I₁ = {I1} A, I₂ = {I2} A; P₁ = {P1} W, P₂ = {P2} W. {hot}',
    s5readSer: 'Series: both carry {I} A. U₁ = {U1} V, U₂ = {U2} V; P₁ = {P1} W, P₂ = {P2} W. {hot}',
    hot1: 'R₁ (10 Ω) is the hotter one.', hot2: 'R₂ ({R2} Ω) is the hotter one.', hotEq: 'R₂ = R₁, so they are equally hot.',
    s5hint: 'What to watch: choose “Parallel” and drag R₂ from 2 Ω to 40 Ω. The larger R₂ gets, the dimmer it glows: P₂ = U² ÷ R₂ falls, so with the same voltage <strong>the smaller resistance is hotter</strong>. Now choose “Series” and drag R₂ again. This time a larger R₂ takes a bigger share of the voltage and glows brighter: with the same current <strong>the larger resistance is hotter</strong>. So before asking whether more resistance means more heat, ask whether the comparison is at equal voltage or equal current. In series, R₂’s own power peaks at R₂ = 10 Ω (0.9 W).',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'One formula, three quantities, each with its conditions',
    s6fin: 'Step 0: for one resistor the current is proportional to the voltage, and U ÷ I is a fixed number — the resistance R. Step 1: at fixed voltage the current is inversely proportional to the resistance; together, <strong>I = U ÷ R</strong>. Step 2: resistance is set by the conductor itself — its material, its length (proportional) and its cross-section (inversely proportional). Step 3: the voltmeter–ammeter method measures R with two meters; meters have a smallest division, so fill the range and fit several readings. Step 4: a heating filament’s resistance grows, its I–U graph bends, and a resistance must come with the voltage it was measured at. Step 5: P = UI; at equal voltage the smaller resistance runs hotter, at equal current the larger one does.',
    formula: 'I = U ÷ R\nR = U ÷ I (voltmeter–ammeter)\nP = U·I = I²·R = U² ÷ R',
    boundary: 'Where this holds: direct current, once the readings have settled. The supply is ideal (no internal resistance) and so are the meters (the ammeter has no resistance, the voltmeter takes no current). Ohm’s law holds for metal conductors and fixed resistors at constant temperature; “filament resistance grows in a straight line with power” is a simplified model — a real tungsten filament also depends on how it loses heat. The dots’ speed only shows the relative size of the current: in a real wire electrons drift very slowly (well under 1 mm per second), and they move from the negative end towards the positive end, opposite to the conventional current direction.',
    linksTitle: 'Where to go next',
    lk1: 'Simple circuits · step 3: what happens if a wire joins the two ends of a bulb (a short circuit) →',
    lk2: 'Series and parallel · step 0: in series the current is the same everywhere and the voltage divides by resistance →',
    lk3: 'Series and parallel · step 2: add a bulb — does the total resistance go up or down? →',
    lk4: 'Simple circuits · step 4: do more cells in series make a bulb brighter? →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Ohm’s Law · Current You Tune by Hand”.'
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
