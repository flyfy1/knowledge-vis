'use strict';
// Buck/boost lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '降压与升压 · 用开关和电感搬运能量',
    back: '← 知识索引',
    compare: '对照另一版本：升压与降压 · 能量去哪了？ →',
    navLabel: '升降压步骤导航',
    tagline: '手机充电器把插座的电压降下来，充电宝又把 3.7 V 的电池升到 5 V。两件事都不靠「烧掉多余的电压」，而是让一个开关每秒通断十万次，用电感把能量一小份一小份地搬过去。八步里，我们从能量账出发，推出降压和升压的电压公式，再让电路在仿真里自己找到稳态。',
    nav0: '0 能量账', nav1: '1 电感', nav2: '2 降压 Buck', nav3: '3 启动过程', nav4: '4 升压 Boost', nav5: '5 纹波与断续', nav6: '6 真实账本', nav7: '7 收束',

    s0k: '第 0 步 · 先算能量账',
    s0t: '把 12 V 变成更低的电压，多出来的那部分去了哪？',
    s0e: '这一步要回答：给一个负载供 V<sub>out</sub>、电流 I，从 12 V 电源出发，有没有不浪费的办法？<strong>功率</strong> P = 电压 × 电流（单位 W，即每秒多少焦耳）。最直接的办法是<strong>线性稳压</strong>：在电源和负载之间串一个「可调电阻」（晶体管），把多余的电压降在它上面。它的电流和负载相同，所以输入功率 12 V × I 里，只有 V<sub>out</sub> × I 送到负载，其余 (12 − V<sub>out</sub>) × I 全部变成热，效率 = V<sub>out</sub> ÷ 12。它也永远做不到输出高于输入。<strong>开关变换器</strong>换一种思路：理想情况下不发热，输入功率 = 输出功率，于是输入电流 = V<sub>out</sub> × I ÷ 12，比负载电流小。后面几步就讲它是怎么做到的。',
    c0a: '两种降压方式的功率条：输出给负载的部分与变成热的部分',
    c0lin: '线性稳压：输入 {pin} W', c0sw: '理想开关变换器：输入 {pin} W',
    lgOut: '送到负载', lgHeat: '变成热',
    vout0: '输出电压 V_out（V）', iout0: '负载电流 I（A）',
    s0readout: '负载要 {vo} V × {io} A = {po} W。线性稳压：从电源取 {io} A、{pl} W，其中 {heat} W 变成热，效率 {eff}%。理想开关变换器：只从电源取 {iin} A（= {po} W ÷ 12 V），不发热。',
    s0hint: '观察顺序：保持负载电流不变，把输出电压往下拖：线性稳压的橙色热量段越来越长，开关变换器的总长度跟着输出一起缩短。再加大负载电流，两种方式的差距按比例放大。',

    s1k: '第 1 步 · 电感：电压管的是电流的变化',
    s1t: '给电感加一段电压，电流会怎样？',
    s1e: '这一步要回答：开关变换器的核心元件是<strong>电感</strong>——一卷导线，电流流过时在周围建立磁场、储存能量 E = ½Li²。它的规律是 v = L·di/dt：加在它两端的电压不直接决定电流，而是决定电流<strong>变化的快慢</strong>（L 是电感量，单位 H，本页 L = 47 µH）。所以电流不能突变，只能按 V ÷ L 的斜率爬升或下降。下面每按一次按钮，就给电感加 10 µs 的电压 V（正负可选），图上保留每一段的历史。',
    c1a: '电感电流随时间的累积历史', c1T: '电感电流 i / A 对时间 / µs（每段 10 µs）',
    v1: '这一段加的电压 V（V）', pulse1: '▶ 施加 10 µs', reset1: '↺ 清零',
    s1readout: '已加 {n} / {max} 段 · 当前电流 {i} A · 储能 ½Li² = {e} µJ',
    s1last: '上一段：V = {v} V，斜率 V ÷ L = {slope} A/µs，10 µs 里电流变了 {di} A。',
    s1none: '还没加电压：电流保持 0。',
    s1full: '已满 {max} 段，请清零再试。',
    s1hint: '观察顺序：先连按三次 +6 V，看电流沿同一斜率一级级爬升；再加 0 V，电流保持不动（没有电压就不变化，而不是归零）；再加 −6 V，电流以同样的斜率往回降。储能只看电流大小，与方向无关。',

    s2k: '第 2 步 · 降压（Buck）：伏秒平衡',
    s2t: '开关以占空比 D 通断，输出为什么恰好是 D × 12 V？',
    s2e: '这一步要回答：上图的电路里，开关 S 每 10 µs 一个周期，其中 D 这部分时间（<strong>占空比</strong>）闭合。<strong>闭合（ON）</strong>时电流从电源经 S、电感 L 流到负载，电感两端电压是 12 − V<sub>out</sub>，电流上升；<strong>断开（OFF）</strong>时电感的电流不能突变，它推着电流经负载、再经二极管 D（只允许单向通过）绕回来，电感两端电压是 −V<sub>out</sub>，电流下降。一个周期结束时电流若要回到原值，电感电压在一个周期里的「面积」（伏秒）必须正负抵消：(12 − V<sub>out</sub>)·D = V<sub>out</sub>·(1 − D)，所以 V<sub>out</sub> = D × 12 V。下面先故意把输出电压设成一个猜测值 V<sub>g</sub>，看电流是否还能周而复始。',
    c2sA: '降压电路，亮色是当前导通的回路', c2wA: '电感电压与电感电流的波形',
    c2s: '降压电路 · {phase}', c2v: '电感电压 v_L / V', c2i: '电感电流 i_L / A（6 个周期）',
    lg2pos: '正面积（ON，电流上升）', lg2neg: '负面积（OFF，电流下降）', lg2i: '电感电流', lg2start: '起始电流（作对照）',
    phOn: 'ON：电源 → S → L → 负载', phOff: 'OFF：L → 负载 → D → L',
    duty: '占空比 D', vg2: '假设的输出电压 V_g（V）', phase2: '周期内时刻（µs）',
    snap2: '取 V_g = D × 12 V', play2: '▶ 慢放一个周期（1 周期 = 3 秒）', pause: '❚❚ 暂停',
    s2readout: 'D = {d}：ON 时 v_L = 12 − {vg} = {von} V，持续 {ton} µs；OFF 时 v_L = −{vg} V，持续 {toff} µs。每周期电流净变化 {drift} A。{verdict}',
    s2up: '正面积大于负面积：电流每周期都在涨，V_g 偏低，不可能是稳态。',
    s2down: '负面积大于正面积：电流每周期都在降，V_g 偏高，不可能是稳态。',
    s2ok: '正负面积抵消：电流每周期回到原值——这就是稳态，V_out = D × 12 V = {vo} V。',
    s2hint: '观察顺序：先拖「假设的输出电压」，看下图电流一周期比一周期高（或低），像台阶一样漂走；按「取 V_g = D × 12 V」，台阶消失，电流变成规则的锯齿。再拖「周期内时刻」或慢放，看上图哪条回路亮着、下图光标落在上升段还是下降段。',

    s3k: '第 3 步 · 启动：电路自己找到稳态',
    s3t: '从 0 V 开机，输出是怎样走到 D × 12 V 的？',
    s3e: '这一步要回答：第 2 步是我们替电路选好了输出电压。真实电路开机时电容 C（本页 100 µF，负责稳住输出电压）上是 0 V，伏秒不平衡，电感电流一周期比一周期涨；电容被充上去，V<sub>out</sub> 升高，正面积变小……直到正负面积抵消。下面是同一个理想电路（12 V、L = 47 µH、C = 100 µF、负载 R）从 0 开始的逐周期<strong>仿真</strong>（四阶龙格—库塔，每周期 200 个小步）。L 和 C 组成一个会振荡的二阶系统，所以输出会先冲过头再回落；负载电阻越大，阻尼越小、晃得越久。',
    c3a: '启动过程：输出电压与电感电流', c3v: '输出电压 v_out / V', c3i: '电感电流 i_L / A',
    lg3v: '输出电压', lg3t: '目标 D × 12 V', lg3band: '电感电流：每个周期从最低到最高的范围',
    r3: '负载电阻 R（Ω）', play3: '▶ 开机（逐周期）', show3: '直接显示全程',
    s3readout: '已仿真 {k} / {n} 个周期（{ms} ms）· 当前输出 {v} V',
    s3final: '最后一个周期平均输出 {vf} V，目标 D × 12 = {vt} V；最高冲到 {pk} V（超过目标 {os}%）。LC 的自然频率约 {f0} Hz，阻尼比 ζ ≈ {z}（<a class="xlink" href="../../../engineering/control/step-response/#step1">→ 阶跃响应第 1 步：阻尼比怎样决定冲过头多少</a>）。',
    s3hint: '观察顺序：按「开机」，看上图输出电压爬升、冲过虚线、来回晃几次后贴住虚线；下图电流色带先大幅上下摆动再收窄成稳定的锯齿。把负载电阻调大，再开机：晃得更久。实际电源用「软启动」（让 D 从 0 慢慢加大）避免这一冲。',

    s4k: '第 4 步 · 升压（Boost）：换个连法',
    s4t: '同样的元件重新连一次，输出怎么能比输入还高？',
    s4e: '这一步要回答：把电感放在电源后面、开关接到地，就是升压电路（本页输入 5 V、负载 24 Ω）。<strong>ON</strong> 时开关把电感直接接在电源两端：v<sub>L</sub> = 5 V，电流上升，能量存进电感；这时二极管被反向截住，负载只靠电容供电。<strong>OFF</strong> 时电感的电流不能突变，它和电源<strong>串联</strong>起来经二极管冲向输出：v<sub>L</sub> = 5 − V<sub>out</sub>（为负），电流下降，电感把能量交出去。伏秒平衡：5·D = (V<sub>out</sub> − 5)·(1 − D)，所以 V<sub>out</sub> = 5 ÷ (1 − D)。能量不会凭空多出来：输出电流只在 OFF 时从电感流出，平均只有电感电流的 (1 − D)，电源要按 V<sub>out</sub>/5 的倍数多给电流。',
    c4sA: '升压电路，亮色是当前导通的回路', c4wA: '电感电流与流向输出的电流',
    c4s: '升压电路 · {phase}', c4i: '电感电流 = 电源电流 / A', c4o: '流向输出的电流 / A',
    lg4i: '电感电流（也是电源电流）', lg4o: '经二极管流向输出的电流', lg4avg: '负载平均电流',
    phOnB: 'ON：电源 → L → S；C 独自供 R', phOffB: 'OFF：电源 → L → D → 负载',
    phase4: '周期内时刻（µs）', play4: '▶ 慢放一个周期（1 周期 = 3 秒）',
    s4readout: 'D = {d}：V_out = 5 ÷ (1 − {d}) = {vo} V（仿真稳态 {vs} V）。负载电流 {io} A，电感（也是电源）平均电流 {il} A = {io} ÷ (1 − {d})。输入功率 5 × {il} = {pin} W，输出功率 {vo} × {io} = {pout} W。',
    s4hint: '观察顺序：慢放一个周期：ON 段上图回路只经过 L 和 S，下图「流向输出」为 0；OFF 段回路经过二极管，电流跳到电感电流的大小再下降。把 D 往大拖：输出升高，但电源电流涨得更快——功率进出始终相等。',

    s5k: '第 5 步 · 纹波与断续导通',
    s5t: '电感太小、负载太轻时，V_out = D × 12 V 还成立吗？',
    s5e: '这一步要回答：前面的公式默认电感电流从不降到 0，这叫<strong>连续导通（CCM）</strong>。电流的锯齿高度叫<strong>纹波</strong>：Δi = (12 − V<sub>out</sub>)·D·T ÷ L，与 L 成反比；平均电流 = V<sub>out</sub> ÷ R。当平均电流小于纹波的一半，OFF 段里电流会掉到 0，二极管截止，电感「休息」一段——这叫<strong>断续导通（DCM）</strong>。这时伏秒平衡里的 OFF 时间变短，输出会高于 D × 12 V，并且随负载变化。临界电感 L<sub>crit</sub> = (1 − D)·R·T ÷ 2。左图是当前参数下的稳态电流（仿真），右图是输出比随电感变化的理论曲线，点是你试过的仿真结果。',
    c5aA: '左：稳态电感电流（3 个周期）', c5bA: '右：输出电压比 V_out/V_in 随电感的变化',
    c5a: '稳态电感电流 i_L / A', c5b: 'V_out ÷ V_in 对 L / µH',
    lg5i: '稳态电感电流（仿真，3 个周期）', lg5m: '理论输出比', lg5dot: '你试过的仿真结果', lg5lc: '临界电感 L_crit', lg5d: '连续导通时的 D',
    l5: '电感 L（µH）', r5: '负载电阻 R（Ω）',
    s5readout: 'L = {l} µH，R = {r} Ω，D = {d}：纹波 {ri} A，平均电流 {ia} A，临界电感 {lc} µH → {mode}。仿真输出 {vs} V，理论 {vt} V（D × 12 = {vd} V）。',
    modeCCM: '连续导通（CCM），电流始终大于 0', modeDCM: '断续导通（DCM），每周期有一段电流为 0',
    s5hint: '观察顺序：从 47 µH 往小拖电感：左图锯齿变高，谷底碰到 0 后出现一段平的 0 电流；右图点离开 D 那条水平线往上走。再把负载电阻调大（负载变轻），临界电感变大，更容易进入断续。',

    s6k: '第 6 步 · 真实的账本',
    s6t: '5 V 升到 12 V、给 1 A 负载，效率 90%，电源要供多大电流？',
    s6e: '这一步要回答：真实变换器的开关、二极管、电感导线都有损耗。用<strong>效率</strong> η = 输出功率 ÷ 输入功率 来概括它：输入功率 = 输出功率 ÷ η，输入电流 = 输入功率 ÷ 输入电压，损耗 = 输入 − 输出，全部变成热。先预测，再核对。',
    q6: '电源（5 V）要提供的电流约为：',
    check6: '核对', effS: '效率 η（%）',
    c6a: '输入功率拆成输出与损耗', c6T: '输入功率 {pin} W = 输出 {pout} W + 损耗 {loss} W',
    s6right: '对。输出 12 V × 1 A = 12 W，输入 = 12 ÷ 0.9 ≈ 13.33 W，电流 = 13.33 ÷ 5 ≈ 2.67 A。',
    s6ideal: '差一步：2.4 A 是效率 100% 时的理想值。真实输入功率要再除以 0.9：12 ÷ 0.9 ≈ 13.33 W，电流 ≈ 2.67 A。',
    s6wrong: '再想想：先算输出功率 12 W，除以效率得输入功率，再除以 5 V。电流不跟电压比例走，而是跟功率走。',
    s6readout: 'η = {eff}%：输入 {pin} W，电源电流 {iin} A，损耗 {loss} W（变成热）。理想（η = 100%）时电源电流 {iid} A。',
    s6locked: '先选一个答案并核对，再用滑杆看效率怎样改变电流和发热。',
    s6hint: '观察顺序：核对后拖动效率：效率每低一点，输入电流和发热都上去；即使 100%，电源电流也是负载电流的 12 ÷ 5 = 2.4 倍——升压从不白送能量。',

    s7k: '第 7 步 · 收束',
    s7t: '三个公式，一条底线',
    formula: '电感：v_L = L·di/dt\n降压：V_out = D·V_in\n升压：V_out = V_in ÷ (1 − D)\n账本：P_in = P_out ÷ η',
    summary: '开关变换器不改变能量守恒：它只是让电感在「从电源吸能」和「向负载放能」之间来回切换，再用占空比 D 调节两段时间的比例。稳态由伏秒平衡决定：电感电压在一个周期里的正负面积必须抵消。',
    boundary: '适用范围：本页的开关、二极管、电感和电容都是理想元件，负载是电阻，开关频率固定 100 kHz；公式 V_out = D·V_in 和 V_in ÷ (1 − D) 只在连续导通时成立。真实电路还有导通压降、开关损耗、电容的等效串联电阻和反馈控制，这里只用效率 η 粗略概括。',
    linksTitle: '接着去哪儿',
    lk1: '→ 电磁感应第 1 步：磁通变化率就是电压——电感为什么「抗拒」电流变化',
    lk2: '→ 欧姆定律第 3 步：功率怎样随电阻变化',
    lk3: '→ 阶跃响应第 1 步：阻尼比 ζ 与启动时的冲过头',
    lk4: '→ 简单电路第 0 步：电流要有闭合回路',
    optA: '{v} A',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《升压与降压 · 能量去哪了？》的平行版本。'
  },
  en: {
    pageTitle: 'Buck and Boost · Moving Energy with a Switch and an Inductor',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Buck & Boost · Follow the Energy →',
    navLabel: 'Buck and boost steps',
    tagline: 'A phone charger steps mains-derived voltage down; a power bank steps a 3.7 V cell up to 5 V. Neither “burns off” the difference. A switch opens and closes a hundred thousand times a second, and an inductor ferries energy across in small parcels. Over eight steps we start from the energy budget, derive the buck and boost voltage formulas, and then let a simulated circuit find its own steady state.',
    nav0: '0 Energy budget', nav1: '1 Inductor', nav2: '2 Buck', nav3: '3 Start-up', nav4: '4 Boost', nav5: '5 Ripple & DCM', nav6: '6 Real budget', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Balance the energy first',
    s0t: 'Turning 12 V into less — where does the difference go?',
    s0e: 'The question for this step: to supply a load with V<sub>out</sub> at current I from a 12 V source, is there a way that wastes nothing? <strong>Power</strong> P = voltage × current (watts, joules per second). The obvious approach is a <strong>linear regulator</strong>: a “variable resistor” (a transistor) in series with the load drops the excess voltage. It carries the load current, so of the 12 V × I drawn from the source only V<sub>out</sub> × I reaches the load; the remaining (12 − V<sub>out</sub>) × I becomes heat, and efficiency = V<sub>out</sub> ÷ 12. It also can never produce more than its input. A <strong>switching converter</strong> takes another route: ideally it dissipates nothing, so input power = output power and input current = V<sub>out</sub> × I ÷ 12 — less than the load current. The rest of the page shows how.',
    c0a: 'Power bars for two ways of stepping down: delivered to the load versus turned into heat',
    c0lin: 'Linear regulator: input {pin} W', c0sw: 'Ideal switching converter: input {pin} W',
    lgOut: 'Delivered to the load', lgHeat: 'Turned into heat',
    vout0: 'Output voltage V_out (V)', iout0: 'Load current I (A)',
    s0readout: 'The load needs {vo} V × {io} A = {po} W. Linear regulator: draws {io} A, {pl} W from the source, {heat} W of it as heat — {eff}% efficient. Ideal switching converter: draws only {iin} A (= {po} W ÷ 12 V), no heat.',
    s0hint: 'What to try: keep the load current fixed and drag the output voltage down — the linear regulator’s orange heat segment grows while the switching converter’s whole bar shrinks with the output. Raise the load current and the gap between the two scales up.',

    s1k: 'Step 1 · An inductor: voltage sets how current changes',
    s1t: 'Put a voltage across an inductor for a moment — what does the current do?',
    s1e: 'The question for this step: the key part of a switching converter is the <strong>inductor</strong> — a coil of wire that builds a magnetic field when current flows and stores energy E = ½Li². Its rule is v = L·di/dt: the voltage across it does not set the current, it sets <strong>how fast the current changes</strong> (L is the inductance, in henries; here L = 47 µH). So the current cannot jump; it can only ramp up or down at slope V ÷ L. Each press below applies a voltage V (either sign) for 10 µs, and the graph keeps every segment.',
    c1a: 'Accumulated history of the inductor current', c1T: 'Inductor current i / A vs time / µs (10 µs per segment)',
    v1: 'Voltage for this segment V (V)', pulse1: '▶ Apply for 10 µs', reset1: '↺ Clear',
    s1readout: '{n} of {max} segments applied · current now {i} A · stored energy ½Li² = {e} µJ',
    s1last: 'Last segment: V = {v} V, slope V ÷ L = {slope} A/µs, so the current changed by {di} A in 10 µs.',
    s1none: 'No voltage applied yet: the current stays at 0.',
    s1full: 'All {max} segments used — clear to try again.',
    s1hint: 'What to try: press +6 V three times and watch the current climb in equal steps along one slope. Then apply 0 V: the current holds (no voltage means no change, not a return to zero). Then −6 V: the current falls back at the same slope. Stored energy depends only on the size of the current, not its direction.',

    s2k: 'Step 2 · Buck: the volt-second balance',
    s2t: 'A switch on for a fraction D of each cycle — why is the output exactly D × 12 V?',
    s2e: 'The question for this step: in the circuit above, switch S runs a 10 µs cycle and is closed for a fraction D of it (the <strong>duty cycle</strong>). <strong>Closed (ON)</strong>: current flows from the source through S and inductor L to the load; the inductor sees 12 − V<sub>out</sub> and its current rises. <strong>Open (OFF)</strong>: the inductor current cannot jump, so it pushes current on through the load and back round through diode D (a one-way path); the inductor sees −V<sub>out</sub> and its current falls. For the current to end each cycle where it started, the inductor voltage’s “area” over a cycle (its volt-seconds) must cancel: (12 − V<sub>out</sub>)·D = V<sub>out</sub>·(1 − D), so V<sub>out</sub> = D × 12 V. Below, deliberately hold the output at a guessed voltage V<sub>g</sub> and see whether the current can still repeat.',
    c2sA: 'Buck circuit; the bright path is the loop conducting now', c2wA: 'Inductor voltage and inductor current waveforms',
    c2s: 'Buck circuit · {phase}', c2v: 'Inductor voltage v_L / V', c2i: 'Inductor current i_L / A (6 cycles)',
    lg2pos: 'Positive area (ON, current rises)', lg2neg: 'Negative area (OFF, current falls)', lg2i: 'Inductor current', lg2start: 'Starting current (reference)',
    phOn: 'ON: source → S → L → load', phOff: 'OFF: L → load → D → L',
    duty: 'Duty cycle D', vg2: 'Guessed output voltage V_g (V)', phase2: 'Time within the cycle (µs)',
    snap2: 'Set V_g = D × 12 V', play2: '▶ Slow-play one cycle (1 cycle = 3 s)', pause: '❚❚ Pause',
    s2readout: 'D = {d}: ON, v_L = 12 − {vg} = {von} V for {ton} µs; OFF, v_L = −{vg} V for {toff} µs. Net current change per cycle {drift} A. {verdict}',
    s2up: 'Positive area beats negative: the current grows every cycle, V_g is too low, this cannot be the steady state.',
    s2down: 'Negative area beats positive: the current shrinks every cycle, V_g is too high, this cannot be the steady state.',
    s2ok: 'The areas cancel: the current returns to its starting value every cycle — that is the steady state, V_out = D × 12 V = {vo} V.',
    s2hint: 'What to try: drag the guessed output voltage and watch the current below drift up (or down) cycle after cycle like a staircase. Press “Set V_g = D × 12 V”: the staircase vanishes and the current becomes a regular sawtooth. Then drag the time within the cycle, or slow-play it, to see which loop lights up above and whether the cursor sits on a rising or falling stretch.',

    s3k: 'Step 3 · Start-up: the circuit finds its own steady state',
    s3t: 'Switched on from 0 V, how does the output get to D × 12 V?',
    s3e: 'The question for this step: in step 2 we chose the output voltage for the circuit. At switch-on the capacitor C (100 µF here, holding the output steady) is at 0 V, the volt-seconds are unbalanced, and the inductor current grows cycle after cycle; the capacitor charges, V<sub>out</sub> rises, the positive area shrinks … until the areas cancel. Below is a cycle-by-cycle <strong>simulation</strong> of the same ideal circuit (12 V, L = 47 µH, C = 100 µF, load R) from rest (fourth-order Runge–Kutta, 200 small steps per cycle). L and C form a second-order system that rings, so the output overshoots and falls back; the larger the load resistance, the lighter the damping and the longer it rings.',
    c3a: 'Start-up: output voltage and inductor current', c3v: 'Output voltage v_out / V', c3i: 'Inductor current i_L / A',
    lg3v: 'Output voltage', lg3t: 'Target D × 12 V', lg3band: 'Inductor current: each cycle’s range from low to high',
    r3: 'Load resistance R (Ω)', play3: '▶ Switch on (cycle by cycle)', show3: 'Show the whole run',
    s3readout: 'Simulated {k} of {n} cycles ({ms} ms) · output now {v} V',
    s3final: 'Last cycle’s average output {vf} V, target D × 12 = {vt} V; peak {pk} V ({os}% overshoot). The LC filter’s natural frequency is about {f0} Hz with damping ratio ζ ≈ {z} (<a class="xlink" href="../../../engineering/control/step-response/#step1">→ Step response, step 1: how the damping ratio sets the overshoot</a>).',
    s3hint: 'What to try: press “Switch on” and watch the output climb, overshoot the dashed line, swing a few times and settle onto it; below, the current band swings widely before narrowing to a steady sawtooth. Raise the load resistance and switch on again: it rings for longer. Real supplies use “soft start” (ramping D up from 0) to avoid this overshoot.',

    s4k: 'Step 4 · Boost: the same parts, rewired',
    s4t: 'Rewire the same parts — how can the output end up above the input?',
    s4e: 'The question for this step: put the inductor right after the source and the switch to ground, and you have a boost converter (here 5 V in, 24 Ω load). <strong>ON</strong>: the switch puts the inductor straight across the source, v<sub>L</sub> = 5 V, the current rises and energy goes into the inductor; the diode is reverse-biased, so the load runs off the capacitor alone. <strong>OFF</strong>: the inductor current cannot jump, so the inductor and the source act <strong>in series</strong> and drive current through the diode to the output: v<sub>L</sub> = 5 − V<sub>out</sub> (negative), the current falls and the inductor gives its energy up. Volt-second balance: 5·D = (V<sub>out</sub> − 5)·(1 − D), so V<sub>out</sub> = 5 ÷ (1 − D). No energy appears from nowhere: current reaches the output only during OFF, averaging (1 − D) of the inductor current, so the source must supply V<sub>out</sub>/5 times the load current.',
    c4sA: 'Boost circuit; the bright path is the loop conducting now', c4wA: 'Inductor current and current delivered to the output',
    c4s: 'Boost circuit · {phase}', c4i: 'Inductor = source current / A', c4o: 'Current to the output / A',
    lg4i: 'Inductor current (also the source current)', lg4o: 'Current through the diode to the output', lg4avg: 'Average load current',
    phOnB: 'ON: source → L → S; C feeds R alone', phOffB: 'OFF: source → L → D → load',
    phase4: 'Time within the cycle (µs)', play4: '▶ Slow-play one cycle (1 cycle = 3 s)',
    s4readout: 'D = {d}: V_out = 5 ÷ (1 − {d}) = {vo} V (simulated steady state {vs} V). Load current {io} A; inductor (= source) average current {il} A = {io} ÷ (1 − {d}). Input power 5 × {il} = {pin} W, output power {vo} × {io} = {pout} W.',
    s4hint: 'What to try: slow-play one cycle. During ON the loop above passes only through L and S, and “to the output” below is 0; during OFF the loop runs through the diode, and that current jumps to the inductor current and then falls. Drag D up: the output rises, but the source current rises faster — power in always equals power out.',

    s5k: 'Step 5 · Ripple and discontinuous conduction',
    s5t: 'With a small inductor or a light load, does V_out = D × 12 V still hold?',
    s5e: 'The question for this step: the formulas so far assume the inductor current never drops to 0, called <strong>continuous conduction (CCM)</strong>. The height of the current sawtooth is the <strong>ripple</strong>: Δi = (12 − V<sub>out</sub>)·D·T ÷ L, inversely proportional to L; the average current = V<sub>out</sub> ÷ R. When the average falls below half the ripple, the current hits 0 during OFF, the diode stops conducting and the inductor “rests” for part of the cycle — <strong>discontinuous conduction (DCM)</strong>. The OFF time in the volt-second balance shrinks, so the output rises above D × 12 V and starts to depend on the load. Critical inductance L<sub>crit</sub> = (1 − D)·R·T ÷ 2. Left: the steady-state current for the present settings (simulated). Right: the theoretical output ratio against inductance, with dots for every setting you have simulated.',
    c5aA: 'Left: steady-state inductor current (3 cycles)', c5bA: 'Right: output ratio V_out/V_in against inductance',
    c5a: 'Steady-state inductor current i_L / A', c5b: 'V_out ÷ V_in vs L / µH',
    lg5i: 'Steady-state inductor current (simulated, 3 cycles)', lg5m: 'Theoretical output ratio', lg5dot: 'Your simulated settings', lg5lc: 'Critical inductance L_crit', lg5d: 'D (continuous conduction)',
    l5: 'Inductance L (µH)', r5: 'Load resistance R (Ω)',
    s5readout: 'L = {l} µH, R = {r} Ω, D = {d}: ripple {ri} A, average current {ia} A, critical inductance {lc} µH → {mode}. Simulated output {vs} V, theory {vt} V (D × 12 = {vd} V).',
    modeCCM: 'continuous conduction (CCM); the current stays above 0', modeDCM: 'discontinuous conduction (DCM); the current sits at 0 for part of each cycle',
    s5hint: 'What to try: drag the inductance down from 47 µH. On the left the sawtooth grows taller, and once its valley touches 0 a flat stretch at zero current appears; on the right the dots leave the flat line at D and climb. Then raise the load resistance (a lighter load): the critical inductance grows and DCM sets in sooner.',

    s6k: 'Step 6 · The real budget',
    s6t: '5 V up to 12 V for a 1 A load at 90% efficiency — how much current does the source supply?',
    s6e: 'The question for this step: real converters lose energy in the switch, the diode and the inductor’s wire. <strong>Efficiency</strong> η = output power ÷ input power sums this up: input power = output power ÷ η, input current = input power ÷ input voltage, and the loss = input − output, all of it heat. Predict first, then check.',
    q6: 'The 5 V source must supply about:',
    check6: 'Check', effS: 'Efficiency η (%)',
    c6a: 'Input power split into output and loss', c6T: 'Input {pin} W = output {pout} W + loss {loss} W',
    s6right: 'Right. Output 12 V × 1 A = 12 W, input = 12 ÷ 0.9 ≈ 13.33 W, current = 13.33 ÷ 5 ≈ 2.67 A.',
    s6ideal: 'One step short: 2.4 A is the ideal value at 100% efficiency. The real input power is divided by 0.9 as well: 12 ÷ 0.9 ≈ 13.33 W, so the current is about 2.67 A.',
    s6wrong: 'Think again: first the output power, 12 W; divide by the efficiency for the input power; then divide by 5 V. Current follows power, not the voltage ratio.',
    s6readout: 'η = {eff}%: input {pin} W, source current {iin} A, loss {loss} W (as heat). Ideal (η = 100%): source current {iid} A.',
    s6locked: 'Pick an answer and check it first; then use the slider to see how efficiency changes the current and the heat.',
    s6hint: 'What to try: after checking, drag the efficiency. Every point lost raises both the input current and the heat; even at 100% the source current is 12 ÷ 5 = 2.4 times the load current — boosting never gives energy away.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'Three formulas and one bottom line',
    formula: 'inductor: v_L = L·di/dt\nbuck: V_out = D·V_in\nboost: V_out = V_in ÷ (1 − D)\nbudget: P_in = P_out ÷ η',
    summary: 'A switching converter does not bend energy conservation: it just switches the inductor between drawing energy from the source and releasing it to the load, and sets the ratio of the two intervals with the duty cycle D. The steady state is fixed by the volt-second balance: over one cycle the inductor voltage’s positive and negative areas must cancel.',
    boundary: 'Scope: the switch, diode, inductor and capacitor here are ideal, the load is a resistor, and the switching frequency is fixed at 100 kHz; V_out = D·V_in and V_in ÷ (1 − D) hold only in continuous conduction. Real circuits add conduction drops, switching losses, capacitor series resistance and feedback control, summarised here only roughly by the efficiency η.',
    linksTitle: 'Where to go next',
    lk1: '→ Electromagnetic induction, step 1: rate of change of flux is voltage — why an inductor resists changes in current',
    lk2: '→ Ohm’s law, step 3: how power changes with resistance',
    lk3: '→ Step response, step 1: the damping ratio ζ and start-up overshoot',
    lk4: '→ Simple circuits, step 0: current needs a closed loop',
    optA: '{v} A',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Buck & Boost · Follow the Energy”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
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
  if (typeof window.refreshConverters === 'function') window.refreshConverters();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
