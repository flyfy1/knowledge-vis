'use strict';
// Series & parallel lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '串联与并联 · 一条路，还是几条路',
    back: '← 知识索引',
    compare: '对照另一版本：串联与并联 · 电流的分与合 →',
    navLabel: '串联与并联步骤导航',
    tagline: '两个用电器接到同一个电池上，只有两种基本接法：排成一条路（串联），或者各走各的路（并联）。哪种接法里电流处处相同？哪种里电压处处相同？为什么家里的灯和插座全是并联，空气开关却串在总线上？六步里你自己调电阻、拧灯泡、开电器，用读数把这些问题一个个算清楚。',
    nav0: '0 串联', nav1: '1 并联', nav2: '2 多接一个灯', nav3: '3 拧下一个灯', nav4: '4 混联', nav5: '5 家里的电路', nav6: '6 收束',
    sR1: '电阻 R₁（Ω）', sR2: '电阻 R₂（Ω）', sR3: '电阻 R₃（Ω）',
    flowOn: '暂停流动', flowOff: '继续流动',
    lgBat: '电池（12 V）', lgDots: '流动的小点：速度表示电流大小（示意）',

    s0k: '第 0 步 · 串联',
    s0t: '两个电阻首尾相连，电流和电压怎么分？',
    s0e: '这一步要回答：两个电阻排成一条路接在 12 V 电池上时，每个电阻里的电流多大、两端的电压多大？先说三个量。<strong>电流</strong> I：每秒流过导线某个截面的电荷有多少，单位安培（A）。<strong>电压</strong> U：电荷从一点走到另一点时，每库仑电荷得到或交出多少能量，单位伏特（V）；电池让电荷每库仑多出 12 J 能量，电阻上电荷把能量交出去。<strong>电阻</strong> R：导体阻碍电流的程度，单位欧姆（Ω），满足 I = U/R（<a class="xlink" href="../../../physics/circuits/ohms-law/#step0">→ 欧姆定律页第 0 步：电压与电流</a>）。<strong>串联</strong>就是首尾相连、只有一条路：电荷不会在半路消失或堆积，所以每处电流相同；总电阻 R = R₁ + R₂。上图是电路，小点的速度代表电流大小（只是示意，真实电子的漂移非常慢）；下图把回路拉直，画出每一点的<strong>电势</strong>（相对电池负极的电压）：电池抬高 12 V，每个电阻各降一级台阶。',
    lg0Pot: '电势：沿回路每一点相对负极的电压',
    c0top: '电路：R₁ 与 R₂ 串联', c0bot: '电势沿回路的变化（V）　从电池负极出发绕一圈',
    s0readout: 'R₁ = {r1} Ω，R₂ = {r2} Ω：总电阻 R = {R} Ω，电流处处都是 I = 12 V ÷ {R} Ω = {I} A。R₁ 两端电压 {v1} V，R₂ 两端 {v2} V，加起来 {sum} V，正好等于电池电压；电压之比 {v1} : {v2} 等于电阻之比 {r1} : {r2}。',
    s0hint: '观察顺序：先让 R₁ = R₂，看下图两级台阶一样高。再只把 R₂ 拖大：两级台阶重新分配，R₂ 那级变高、R₁ 那级变矮，但两级加起来始终是 12 V；同时整个回路的小点一起变慢，因为总电阻变大、电流变小。回路上任何地方的小点速度都一样。',

    s1k: '第 1 步 · 并联',
    s1t: '两个电阻各走一条路，电流怎么分？',
    s1e: '这一步要回答：把两个电阻并排接在电池两端，每条支路的电流多大，总电流多大？<strong>并联</strong>就是两个用电器的两端分别接在同一对接点上，电流在接点处分成几条<strong>支路</strong>，再在另一个接点汇合。每条支路两端都直接连着电池两极，所以每条支路的电压都是 12 V；每条支路的电流各按 I = U/R 算，电阻小的那条电流大。电荷在接点不会堆积，流进多少就流出多少，所以总电流 I = I₁ + I₂。总电阻 R = U/I 比任何一条支路的电阻都小，满足 1/R = 1/R₁ + 1/R₂。下图是电流的柱形图：两条支路的电流叠起来，正好等于总电流。',
    lg1Bars: '电流柱：支路 1、支路 2、干路（总电流）',
    c1top: '电路：R₁ 与 R₂ 并联', c1bot: '电流（A）',
    s1readout: 'R₁ = {r1} Ω，R₂ = {r2} Ω：两条支路的电压都是 12 V。支路 1 电流 {i1} A，支路 2 电流 {i2} A，总电流 I = {I} A。总电阻 R = 12 V ÷ {I} A = {R} Ω，比 R₁ 和 R₂ 都小。',
    s1hint: '观察顺序：先让 R₁ = R₂，两条支路的小点一样快，各分一半电流。再把 R₁ 拖小：支路 1 的小点变快，下图支路 1 的柱变高，支路 2 完全不变（它两端还是 12 V）；干路的小点也变快，因为它的电流是两条支路之和。',
    bI1: '支路 1', bI2: '支路 2', bI: '干路',

    s2k: '第 2 步 · 多接一个灯',
    s2t: '多接一个灯泡，电路的总电阻是变大还是变小？',
    s2e: '这一步要回答：同样的灯泡（每个 6 Ω，单独接在 12 V 上功率 24 W）一个一个往电路里加，串联和并联各会怎样？<strong>总电阻</strong>（等效电阻）是能代替整个电路的那一个电阻：把它单独接在电池上，电流和原电路一样。灯泡的亮度看它的<strong>功率</strong> P = U·I：每秒把多少电能变成光和热（单位瓦特 W，<a class="xlink" href="../../../physics/circuits/ohms-law/#step3">→ 欧姆定律页第 3 步：功率与发热</a>）。上面两排是灯泡，光晕大小按每个灯泡的功率画；下图是总电阻随灯泡个数的变化，点留下你试过的个数。',
    sN: '灯泡个数 n',
    lg2Glow: '光晕：每个灯泡的功率', lg2Ser: '串联的总电阻', lg2Par: '并联的总电阻',
    c2ser: '串联 n 个灯泡', c2par: '并联 n 个灯泡', c2bot: '总电阻（Ω）　横轴 灯泡个数 n',
    s2readout: 'n = {n}。串联：总电阻 {rs} Ω，电流 {is} A，每个灯泡 {ps} W（单独接时的 {pcts}%）。并联：总电阻 {rp} Ω，总电流 {ip} A，每个灯泡仍是 {pp} W。',
    s2hint: '观察顺序：把 n 从 1 拖到 6。串联一排：灯一个比一个暗，因为总电阻 n × 6 Ω 越来越大、电流越来越小，每个灯分到的电压也越来越少（n = 2 时每个只剩四分之一的功率）。并联一排：每个灯都一样亮，因为每个都直接接在 12 V 上；代价是总电阻变小、电池输出的总电流越来越大。',

    s3k: '第 3 步 · 拧下一个灯',
    s3t: '拧下其中一个灯泡，其他的灯还亮吗？',
    s3e: '这一步要回答：三个同样的灯泡，分别串联和并联时，拧下一个会怎样？拧下灯泡就是在那里把电路断开。电流只能在闭合的回路里流动（<a class="xlink" href="../../../physics/circuits/simple-circuits/#step1">→ 简单电路页第 1 步：回路断在哪里，灯都会灭</a>）。串联只有一条路，断开任何一处，整条路都没有电流；并联每个灯泡都有自己的一条路，断开一条，别的路照样闭合。先选接法，再点下面的按钮拧下或装回某个灯泡。',
    modeSer: '串联', modePar: '并联',
    bulbBtn: '拧下 / 装回 灯 {k}',
    lg3Lit: '亮着的灯', lg3Off: '不亮的灯', lg3Gone: '已拧下（空灯座）',
    c3: '三个灯泡（{mode}）',
    s3readout: '{mode}，装着 {k} 个灯泡：{lit} 个亮着，电池输出的电流 {I} A。{note}',
    note3SerOpen: '串联的路在空灯座处断开了，所以剩下的灯也都灭了。', note3SerAll: '三个灯串在一条路上，每个只分到 4 V。', note3Par: '每个亮着的灯都直接接在 12 V 上，亮度和其他灯在不在无关。', note3None: '没有任何闭合的路，电流为 0。',
    s3hint: '观察顺序：先选「串联」，拧下灯 2：三个灯全灭，电流变成 0；装回去又全亮。再选「并联」，拧下灯 2：只有它灭，灯 1、灯 3 的亮度一点不变，电池的电流从 6 A 降到 4 A。',

    s4k: '第 4 步 · 混联',
    s4t: '有串有并的电路，怎么一步步算？',
    s4e: '这一步要回答：R₁ 先和电池串联，接着电流分成两路流过 R₂ 和 R₃，再汇合回电池，每个电阻的电流和电压各是多少？办法是先把并联的部分换成一个等效电阻：R₂₃ = R₂R₃/(R₂ + R₃)（并联的总电阻，比 R₂、R₃ 都小）。这样电路就变成 R₁ 和 R₂₃ 串联，用第 0 步的方法算出总电流和两段电压；再回到并联部分，用第 1 步的方法分电流。下面两根条形图是检查用的两本账：电压账 V₁ + V₂₃ = 12 V（串联的台阶加起来等于电池电压），电流账 I₂ + I₃ = I（流进接点的等于流出的）。',
    lg4V1: 'V₁ / I₂', lg4V23: 'V₂₃ / I₃',
    c4top: '电路：R₁ 与「R₂、R₃ 并联」串联', c4v: '电压账：V₁ + V₂₃（V）', c4i: '电流账：I₂ + I₃（A）',
    s4readout: 'R₂ ∥ R₃ = {r23} Ω，总电阻 {R} Ω，总电流 I = {I} A。R₁ 两端 {v1} V，并联部分两端 {v23} V，合计 {vs} V。R₂ 电流 {i2} A，R₃ 电流 {i3} A，合计 {is} A，等于总电流。',
    s4hint: '观察顺序：先只拖 R₃ 变小：并联部分的等效电阻变小，它分到的电压 V₂₃ 变少、V₁ 变多；R₃ 的电流变大，R₂ 的电流反而变小（它两端电压降了）。不管怎么拖，两本账都对得上：电压条总长始终是 12 V，电流条两段之和始终等于总电流。',

    s5k: '第 5 步 · 家里的电路',
    s5t: '家里的电器为什么都并联？空气开关又为什么串在总线上？',
    s5e: '这一步要回答：家里一路插座上接着好几个电器，它们怎样连接，什么时候会跳闸？家庭电路的电压是 {mains} V。所有电器都<strong>并联</strong>在火线和零线之间，所以每个都拿到完整的 {mains} V，开关一个不影响别的（第 3 步的结论）。代价是：每多开一个，干路的总电流就多一份（第 1 步的结论 I = I₁ + I₂ + …）。<strong>空气开关</strong>（断路器）<strong>串联</strong>在干路上：它看到的是所有电器的总电流，超过额定值（这里是 {breaker} A）就自动断开，免得导线过热。每个电器的电流按 I = P/U 算。下面按按钮开关电器，看干路电流柱有没有越过红线。',
    ap_kettle: '① 电水壶 1800 W', ap_heater: '② 电暖器 2000 W', ap_cooker: '③ 电饭煲 800 W', ap_lamp: '④ 台灯 15 W', batShort: '电池',
    resetBreaker: '合上空气开关',
    lg5Bar: '干路总电流', lg5Limit: '空气开关额定电流', lg5On: '工作中的电器',
    c5top: '一路插座：电器并联，空气开关串在干路上', c5bot: '干路电流（A）',
    s5readout: '开着的电器：{list}。干路电流 {I} A（额定 {breaker} A）。{state}',
    noneOn: '无',
    st5Ok: '没有超过额定电流，空气开关保持闭合。', st5Trip: '超过额定电流，空气开关跳闸：整路断电，所有电器都停了。先关掉一些电器，再按「合上空气开关」。', st5Retrip: '电器开得太多，刚合上就又跳闸了：先关掉一些。',
    s5hint: '观察顺序：先单独开电水壶（{ik} A），再单独开电暖器（{ih} A），都没问题。两个一起开：{both} A，超过 {breaker} A，跳闸。跳闸后直接按「合上空气开关」会再次跳闸，要先关掉一个。开电饭煲和台灯只增加 {ic} A 和 {il} A。这里只算稳定工作时的电流，不考虑电器刚启动时的冲击电流。',

    s6k: '第 6 步 · 收束', s6t: '一条路，还是几条路',
    s6fin: '回顾。<strong>串联</strong>只有一条路：电流处处相同，电压按电阻大小分（R 大分得多），总电阻 R = R₁ + R₂ + …，断开一处全部停（第 0、2、3 步）。<strong>并联</strong>每个用电器一条路：电压都相同，电流按电阻反过来分（R 小分得多），总电流是各支路之和，总电阻比任何一条支路都小，断开一条其他不受影响（第 1、2、3 步）。<strong>混联</strong>先把并联部分换成一个等效电阻，再按串联算（第 4 步）。家里的电器并联，各拿完整的电压；空气开关串在干路，管住总电流（第 5 步）。',
    formula: '串联：I 相同，R = R₁ + R₂，U₁ : U₂ = R₁ : R₂\n并联：U 相同，I = I₁ + I₂，1/R = 1/R₁ + 1/R₂',
    boundary: '适用范围：本页用理想电池（没有内阻，电压始终 12 V）和阻值不变的电阻、灯泡。真实灯丝的电阻随温度升高而变大，真实电池有内阻，接的灯越多电压会略降。小点的速度只表示电流的相对大小，不是电子的真实速度。家庭电路是交流电，这里按有效值和稳定工作的功率计算。',
    linksTitle: '接着去看',
    lk1: '→ 欧姆定律第 0 步：电压、电流和电阻的关系',
    lk2: '→ 欧姆定律第 3 步：功率与发热',
    lk3: '→ 简单电路第 1 步：断开回路的任何一处',
    lk4: '→ 简单电路第 3 步：短路，一条几乎没有电阻的并联支路',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《串联与并联 · 电流的分与合》的平行版本。'
  },
  en: {
    pageTitle: 'Series & Parallel · One Path or Several',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Series & Parallel · Splitting and Merging Current →',
    navLabel: 'Series and parallel steps',
    tagline: 'Connect two devices to one battery and there are only two basic ways to do it: in a single line (series) or each on its own path (parallel). In which is the current the same everywhere? In which is the voltage the same? And why are the lights and sockets at home all in parallel while the circuit breaker sits on the main line? Over six steps you adjust resistors, unscrew bulbs and switch on appliances, and work each question out from the readings.',
    nav0: '0 Series', nav1: '1 Parallel', nav2: '2 One more bulb', nav3: '3 Unscrew a bulb', nav4: '4 Mixed', nav5: '5 At home', nav6: '6 Wrap-up',
    sR1: 'Resistance R₁ (Ω)', sR2: 'Resistance R₂ (Ω)', sR3: 'Resistance R₃ (Ω)',
    flowOn: 'Pause the flow', flowOff: 'Resume the flow',
    lgBat: 'Battery (12 V)', lgDots: 'Moving dots: speed shows how big the current is (schematic)',

    s0k: 'Step 0 · Series',
    s0t: 'Two resistors end to end: how do current and voltage divide?',
    s0e: 'The question here: with two resistors in one line on a 12 V battery, how much current flows through each, and what voltage is across each? Three quantities first. <strong>Current</strong> I: how much charge passes a point in the wire each second, measured in amperes (A). <strong>Voltage</strong> U: how much energy each coulomb of charge gains or gives up between two points, in volts (V); the battery gives each coulomb 12 J, and the resistors are where the charge hands that energy over. <strong>Resistance</strong> R: how strongly a conductor holds back current, in ohms (Ω), with I = U/R (<a class="xlink" href="../../../physics/circuits/ohms-law/#step0">→ Ohm’s law, step 0: voltage and current</a>). In <strong>series</strong> the parts are connected end to end, so there is only one path: charge doesn’t vanish or pile up on the way, so the current is the same everywhere, and the total resistance is R = R₁ + R₂. The top drawing is the circuit, with dots whose speed stands for the size of the current (only a picture: real electrons drift very slowly). The bottom plot straightens the loop out and shows the <strong>potential</strong> at each point (its voltage relative to the battery’s negative terminal): the battery lifts it by 12 V and each resistor takes it down one step.',
    lg0Pot: 'Potential: voltage of each point relative to the negative terminal',
    c0top: 'Circuit: R₁ and R₂ in series', c0bot: 'Potential around the loop (V), starting at the negative terminal',
    s0readout: 'R₁ = {r1} Ω, R₂ = {r2} Ω: total resistance R = {R} Ω, and the current everywhere is I = 12 V ÷ {R} Ω = {I} A. The voltage across R₁ is {v1} V and across R₂ {v2} V, adding up to {sum} V, exactly the battery voltage; the voltages are in the ratio {v1} : {v2}, the same as the resistances {r1} : {r2}.',
    s0hint: 'What to try: set R₁ = R₂ and the two steps in the bottom plot are equally tall. Then drag only R₂ up: the steps are shared out again, R₂’s grows and R₁’s shrinks, but together they are always 12 V. At the same time all the dots around the loop slow down together, because the total resistance is larger and the current smaller. The dots move at the same speed everywhere in the loop.',

    s1k: 'Step 1 · Parallel',
    s1t: 'Two resistors, each on its own path: how does the current divide?',
    s1e: 'The question here: with two resistors side by side across the battery, how much current flows in each path, and in total? In <strong>parallel</strong> both ends of each device connect to the same pair of junctions: the current splits into <strong>branches</strong> at one junction and joins up again at the other. Each branch is connected straight across the battery, so each has the full 12 V; each branch current follows I = U/R on its own, and the branch with the smaller resistance carries more. Charge doesn’t pile up at a junction (what flows in flows out), so the total current is I = I₁ + I₂. The total resistance R = U/I is smaller than either branch’s, with 1/R = 1/R₁ + 1/R₂. The bottom chart stacks the two branch currents, and together they match the total.',
    lg1Bars: 'Current bars: branch 1, branch 2, main line (total)',
    c1top: 'Circuit: R₁ and R₂ in parallel', c1bot: 'Current (A)',
    s1readout: 'R₁ = {r1} Ω, R₂ = {r2} Ω: both branches have 12 V across them. Branch 1 carries {i1} A, branch 2 {i2} A, total I = {I} A. Total resistance R = 12 V ÷ {I} A = {R} Ω, smaller than both R₁ and R₂.',
    s1hint: 'What to try: set R₁ = R₂ and the dots in the two branches move equally fast, each taking half the current. Then drag R₁ down: the branch 1 dots speed up and its bar grows, while branch 2 doesn’t change at all (it still has 12 V across it). The dots in the main line speed up too, since its current is the sum of the two branches.',
    bI1: 'Branch 1', bI2: 'Branch 2', bI: 'Main',

    s2k: 'Step 2 · One more bulb',
    s2t: 'Add another bulb: does the total resistance go up or down?',
    s2e: 'The question here: add identical bulbs (6 Ω each, 24 W when one is on its own across 12 V) one at a time. What happens in series and in parallel? The <strong>total resistance</strong> (equivalent resistance) is the single resistor that could replace the whole circuit: on its own across the battery it would draw the same current. A bulb’s brightness follows its <strong>power</strong> P = U·I, how much electrical energy it turns into light and heat each second (in watts, W; <a class="xlink" href="../../../physics/circuits/ohms-law/#step3">→ Ohm’s law, step 3: power and heating</a>). The two rows show the bulbs, with each glow sized by that bulb’s power; the chart below shows total resistance against the number of bulbs, and keeps a dot for each number you have tried.',
    sN: 'Number of bulbs n',
    lg2Glow: 'Glow: power of each bulb', lg2Ser: 'Total resistance in series', lg2Par: 'Total resistance in parallel',
    c2ser: 'n bulbs in series', c2par: 'n bulbs in parallel', c2bot: 'Total resistance (Ω)   number of bulbs n',
    s2readout: 'n = {n}. Series: total resistance {rs} Ω, current {is} A, each bulb {ps} W ({pcts}% of one bulb on its own). Parallel: total resistance {rp} Ω, total current {ip} A, each bulb still {pp} W.',
    s2hint: 'What to try: drag n from 1 to 6. In the series row each extra bulb makes them all dimmer: the total resistance n × 6 Ω keeps growing, the current keeps shrinking, and each bulb gets a smaller share of the voltage (at n = 2 each is down to a quarter of the power). In the parallel row every bulb stays equally bright, because each sits straight across 12 V; the price is that the total resistance drops and the battery has to supply more and more current.',

    s3k: 'Step 3 · Unscrew a bulb',
    s3t: 'Unscrew one bulb: do the others stay lit?',
    s3e: 'The question here: three identical bulbs, in series or in parallel. What happens when one is unscrewed? Unscrewing a bulb breaks the circuit at that spot, and current flows only around a closed loop (<a class="xlink" href="../../../physics/circuits/simple-circuits/#step1">→ Simple circuits, step 1: break the loop anywhere and the light goes out</a>). Series has one path, so a break anywhere stops the current everywhere; in parallel each bulb has its own path, so breaking one leaves the others closed. Pick a connection first, then use the buttons to unscrew or replace a bulb.',
    modeSer: 'Series', modePar: 'Parallel',
    bulbBtn: 'Unscrew / replace bulb {k}',
    lg3Lit: 'Lit bulb', lg3Off: 'Dark bulb', lg3Gone: 'Unscrewed (empty socket)',
    c3: 'Three bulbs ({mode})',
    s3readout: '{mode}, {k} bulbs in place: {lit} lit, battery current {I} A. {note}',
    note3SerOpen: 'The series path is broken at the empty socket, so the remaining bulbs go out as well.', note3SerAll: 'All three share one path, so each gets only 4 V.', note3Par: 'Each lit bulb sits straight across 12 V, so its brightness doesn’t depend on the others.', note3None: 'There is no closed path, so the current is 0.',
    s3hint: 'What to try: pick “Series” and unscrew bulb 2: all three go dark and the current drops to 0; put it back and they all light up again. Then pick “Parallel” and unscrew bulb 2: only that one goes out, bulbs 1 and 3 keep exactly the same brightness, and the battery current falls from 6 A to 4 A.',

    s4k: 'Step 4 · Mixed circuits',
    s4t: 'A circuit with both series and parallel parts: how do you work it out?',
    s4e: 'The question here: current leaves the battery through R₁, then splits between R₂ and R₃ and rejoins on the way back. What are the current and voltage for each resistor? The trick is to replace the parallel part with one equivalent resistor first: R₂₃ = R₂R₃/(R₂ + R₃) (the total resistance of a parallel pair, smaller than either). Now the circuit is just R₁ in series with R₂₃: use step 0 to get the total current and the two voltages, then go back into the parallel part and split the current as in step 1. The two bars below are the two checks: voltages V₁ + V₂₃ = 12 V (series steps add up to the battery voltage) and currents I₂ + I₃ = I (what flows into a junction flows out).',
    lg4V1: 'V₁ / I₂', lg4V23: 'V₂₃ / I₃',
    c4top: 'Circuit: R₁ in series with R₂ and R₃ in parallel', c4v: 'Voltage check: V₁ + V₂₃ (V)', c4i: 'Current check: I₂ + I₃ (A)',
    s4readout: 'R₂ ∥ R₃ = {r23} Ω, total resistance {R} Ω, total current I = {I} A. Across R₁: {v1} V; across the parallel part: {v23} V; together {vs} V. Current in R₂: {i2} A, in R₃: {i3} A; together {is} A, equal to the total.',
    s4hint: 'What to try: drag only R₃ down. The parallel part’s equivalent resistance falls, so its share of the voltage V₂₃ shrinks and V₁ grows; R₃’s current rises while R₂’s actually falls (its voltage dropped). However you drag, both checks balance: the voltage bar always totals 12 V, and the two parts of the current bar always add to the total current.',

    s5k: 'Step 5 · At home',
    s5t: 'Why are household appliances in parallel, and why is the breaker in series on the main line?',
    s5e: 'The question here: several appliances share one socket circuit. How are they connected, and when does the breaker trip? Household voltage here is {mains} V. Every appliance is connected in <strong>parallel</strong> between the live and neutral wires, so each gets the full {mains} V and switching one doesn’t affect the others (the result of step 3). The price: every appliance switched on adds its share to the total current in the main line (the result of step 1, I = I₁ + I₂ + …). The <strong>circuit breaker</strong> sits in <strong>series</strong> on the main line, so it sees the total current of all the appliances; above its rating (here {breaker} A) it opens automatically before the wiring overheats. Each appliance draws I = P/U. Use the buttons to switch appliances and watch whether the main-line bar crosses the red line.',
    ap_kettle: '① Kettle 1800 W', ap_heater: '② Heater 2000 W', ap_cooker: '③ Rice cooker 800 W', ap_lamp: '④ Desk lamp 15 W', batShort: 'Battery',
    resetBreaker: 'Switch the breaker back on',
    lg5Bar: 'Total current in the main line', lg5Limit: 'Breaker rating', lg5On: 'Appliance running',
    c5top: 'One socket circuit: appliances in parallel, breaker in series', c5bot: 'Main-line current (A)',
    s5readout: 'Appliances on: {list}. Main-line current {I} A (rating {breaker} A). {state}',
    noneOn: 'none',
    st5Ok: 'Below the rating, so the breaker stays closed.', st5Trip: 'Above the rating: the breaker trips and the whole circuit goes dead, stopping every appliance. Switch something off, then press “Switch the breaker back on”.', st5Retrip: 'Too much is switched on, so it tripped again straight away: switch something off first.',
    s5hint: 'What to try: switch on just the kettle ({ik} A), then just the heater ({ih} A): both fine. Both together: {both} A, over {breaker} A, so the breaker trips. Pressing “Switch the breaker back on” right away trips it again; one of them has to go off first. The rice cooker and lamp add only {ic} A and {il} A. These are steady running currents; the brief surge as an appliance starts up is ignored.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One path or several',
    s6fin: 'The thread. <strong>Series</strong> has a single path: the same current everywhere, the voltage shared in proportion to resistance (bigger R, bigger share), total resistance R = R₁ + R₂ + …, and one break stops everything (steps 0, 2, 3). <strong>Parallel</strong> gives each device its own path: the same voltage across each, the current shared the other way round (smaller R, bigger share), a total current that is the sum of the branches, a total resistance smaller than any branch, and a break in one branch leaves the others running (steps 1, 2, 3). For a <strong>mixed</strong> circuit, replace the parallel part with one equivalent resistor and treat the rest as series (step 4). At home, appliances are in parallel so each gets the full voltage, and the breaker sits in series on the main line to watch the total current (step 5).',
    formula: 'Series: same I, R = R₁ + R₂, U₁ : U₂ = R₁ : R₂\nParallel: same U, I = I₁ + I₂, 1/R = 1/R₁ + 1/R₂',
    boundary: 'Scope: this page uses an ideal battery (no internal resistance, always 12 V) and resistors and bulbs whose resistance never changes. A real filament’s resistance rises as it heats up, and a real battery has internal resistance, so its voltage sags a little as more bulbs are added. The dots’ speed shows only the relative size of the current, not how fast electrons really move. Household supply is alternating current; the figures here use effective (rms) values and steady running power.',
    linksTitle: 'Where to go next',
    lk1: '→ Ohm’s law, step 0: how voltage, current and resistance are related',
    lk2: '→ Ohm’s law, step 3: power and heating',
    lk3: '→ Simple circuits, step 1: break the loop anywhere',
    lk4: '→ Simple circuits, step 3: a short circuit, a parallel branch with almost no resistance',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Series & Parallel · Splitting and Merging Current”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]);
  if (text === undefined) text = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshSeriesParallel === 'function') window.refreshSeriesParallel();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
