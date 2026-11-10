'use strict';
// Electrochemistry lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '电化学 · 让电子绕远路',
    back: '← 知识索引',
    compare: '对照另一版本：电化学 · 电子沿导线跑，还是被电推着跑 →',
    navLabel: '电化学步骤导航',
    tagline: '把锌片放进硫酸铜溶液，锌会把电子交给铜离子——这是一个氧化还原反应，但电子只在金属表面跳了一下，什么电器也带不动。电化学要做的，是把反应拆成两半，逼电子沿导线绕一圈：自发时它点亮灯泡（原电池），外加电压反推时它被逼着倒流（电解池）。七步里你会算出电压从哪来、随浓度怎么变、能放多少电，以及通一定电量能析出多少金属。',
    nav0: '0 拆开反应', nav1: '1 谁给电子', nav2: '2 浓度与电压', nav3: '3 放电', nav4: '4 反推', nav5: '5 电量与产量', nav6: '6 收束',

    s0k: '第 0 步 · 同一个反应，三种摆法',
    s0t: '怎样才能让锌的电子沿导线走一圈，点亮灯泡？',
    s0e: '这一步要回答：反应 <span class="chem">Zn + Cu²⁺ → Zn²⁺ + Cu</span> 本来就会自己发生，怎样摆放才能让它放出的电子流过外面的导线？先说两个词：失去电子叫<strong>氧化</strong>（Zn → Zn²⁺ + 2e⁻），得到电子叫<strong>还原</strong>（Cu²⁺ + 2e⁻ → Cu），这两个「半反应」总是成对发生。要让电子走导线，就得把两个半反应放进两个分开的烧杯（各叫一个<strong>半电池</strong>），只留导线这一条电子通路。电子从发生氧化的那块金属流出，这块叫<strong>负极</strong>；流进发生还原的那块，叫<strong>正极</strong>。连接两杯溶液的 U 形管叫<strong>盐桥</strong>，里面是不参与反应的盐（例如 KNO₃）溶液，只让离子通过、不让两杯溶液混合。这样的装置叫<strong>原电池</strong>。',
    c0: '原电池装置示意图',
    m0a: '一个烧杯：锌片直接泡在 CuSO₄ 里', m0b: '两个烧杯 + 导线，没有盐桥', m0c: '两个烧杯 + 导线 + 盐桥',
    lgE: '电子 e⁻（示意，速度不按比例）', lgCat: '阳离子（K⁺ 等）', lgAn: '阴离子（NO₃⁻ 等）', lgCu: '析出的铜',
    elZn: '锌 Zn', elCu: '铜 Cu',
    roleNegOx: '负极 · 氧化', rolePosRed: '正极 · 还原', roleIdle: '没有电流',
    roleCathodeIn: '阴极 · 还原', roleAnodeIn: '阳极 · 氧化',
    hookNeg: '接电源负极', hookPos: '接电源正极',
    r0a: '一个烧杯：电子在锌片表面直接交给 Cu²⁺，铜就析出在锌片上（棕色斑块），反应放出的能量变成溶液的热。导线里没有电子流过：外电路电流 I = 0，灯不亮。',
    r0b: '两个烧杯 + 导线，没有盐桥：刚接通的一瞬间有极少量电子从 Zn 流到 Cu。之后锌那杯多出了 Zn²⁺（正电荷，图中「+」），铜那杯少了 Cu²⁺、剩下多余的 SO₄²⁻（负电荷，图中「−」）。这些电荷把电子往回推，电流立刻停下：I = 0。',
    r0c: '两个烧杯 + 导线 + 盐桥：电路闭合，电流 I = {I} A（电压 {E} V，灯泡 {Rb} Ω + 电池内阻 {r} Ω），每秒约有 {N} 个电子流过灯泡。盐桥里阴离子流向锌那杯、阳离子流向铜那杯，正好抵消两杯多出来的电荷，所以电流能持续。',
    s0hint: '观察顺序：依次按三个按钮，每次先看灯泡亮没亮，再看黄色电子点动不动、往哪边走。第二种摆法里注意两杯溶液里的「+」「−」：电流停下的原因就在那里。第三种摆法里看盐桥：离子沿盐桥移动，电子沿导线移动，两条路合起来才是一个完整回路。电子点的速度只是示意，真实电子在导线里的平均漂移速度很慢。',

    s1k: '第 1 步 · 谁更想要电子',
    s1t: '两种金属配成电池，哪边是负极？电压有多大？',
    s1e: '这一步要回答：任选两种金属和它们的离子溶液（各 1 mol/L）配成原电池，怎样预先判断电子往哪流、电压多少？每个「金属 | 金属离子」半电池都有一个<strong>标准电极电势 E°</strong>：在 25 °C、离子浓度 1 mol/L 下，这个半电池相对于标准氢电极（规定为 0 V）的电压，可以理解为「这种离子抢电子的本事」，越大越容易被还原。两个半电池放在一起，E° 小的一边被氧化（负极），电子沿导线流向 E° 大的一边（正极）。电池的<strong>标准电动势</strong>就是两者之差：E°电池 = E°(正极) − E°(负极)。它乘以转移的电子数 n 和<strong>法拉第常数</strong> F（1 mol 电子带的电量，96485 C）就是反应最多能做的电功：ΔG° = −nFE°。',
    c1: '标准电极电势阶梯图',
    lgAnode: '负极（被氧化）', lgCathode: '正极（被还原）', lgFlow: '电子沿导线的流向',
    pickA: '电极 A', pickB: '电极 B',
    axisE: 'E° / V',
    r1: '{an} 是负极（被氧化）：{ox}；{ca} 是正极（被还原）：{red}。总反应 {overall}，每发生一次转移 n = {n} 个电子。E°电池 = E°({ca}) − E°({an}) = {Ec} − {Ea} = {E} V；ΔG° = −nFE° = {dG} kJ/mol（负值：反应自发）。',
    r1same: '两边是同一种金属、同样 1 mol/L 的溶液：E°电池 = 0，没有哪一边更想要电子，不发生反应。下一步会看到：浓度不同时，同种金属也能产生一点电压。',
    r1note: ' 注意：{ion} 的半反应乘了 {p}，但 E° 不乘 {p}。E° 是「每个电子」的能量，与方程式写几倍无关；随 n 变大的是 ΔG°。',
    h1: '已试过的组合：{list}',
    s1hint: '观察顺序：先保持 A = Zn、B = Cu，看阶梯上两点之间的竖直距离就是 1.10 V，黄色箭头从下往上（电子从 E° 小的一边流向大的一边）。再把 B 换成 Ag：箭头更长、电压更大；换成 Mg 与 Zn：负极变成 Mg。试过的组合都记在读数下方，可以比较电压大小和阶梯上的距离。',
    q1: '想一想：铁片插入 Fe²⁺ 溶液、铜片插入 Cu²⁺ 溶液（都是 1 mol/L）组成原电池，哪块是负极？',
    q1a: '铁：E°(Fe²⁺/Fe) = −0.44 V 更小，铁被氧化', q1b: '铜：铜更不活泼，所以是负极', q1c: '都不是：两极都是金属，不会产生电压',
    check: '核对',
    fb1ok: '对。E° 小的一边被氧化、电子从它流出，所以铁是负极；电压 0.34 − (−0.44) = 0.78 V。把 A 设为 Fe、B 设为 Cu 可以验证。',
    fb1no: '再看看：在阶梯上找到 Fe 和 Cu，电子从位置低（E° 小）的一边流出。',

    s2k: '第 2 步 · 浓度与电压',
    s2t: '溶液变浓或变稀，电池电压会怎么变？',
    s2e: '这一步要回答：E° 只适用于 1 mol/L，浓度变了以后，锌铜电池的电动势 E 是多少？（<strong>电动势</strong>：没有电流流过时，两极之间的电压。）用<strong>反应商</strong> Q 描述「反应已经进行到哪一步」：Q = [Zn²⁺] ÷ [Cu²⁺]，即生成物离子浓度比反应物离子浓度（固体金属不写进去）。<strong>能斯特方程</strong>给出 25 °C 时：<strong>E = E° − (0.0592 / n) · lg Q</strong>，这里 E° = 1.10 V、n = 2，所以 Q 每变大 10 倍，E 下降 0.0296 V。当 E 降到 0，反应不再有推动力，这时的 Q 就是<strong>平衡常数</strong> K（<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step0">→ 化学平衡页第 0 步：正逆反应速率相等的动态平衡</a>）。',
    c2: '离子浓度与电动势',
    zn2: 'lg [Zn²⁺]（生成物离子）', cu2: 'lg [Cu²⁺]（反应物离子）', clearDots: '清除记录点',
    lgZn: 'Zn²⁺ 浓度', lgCuIon: 'Cu²⁺ 浓度', lgNernst: '能斯特直线 E(lg Q)', lgTried: '试过的点',
    c2top: '两杯溶液的离子浓度（mol/L，对数刻度）', c2bot: '电动势 E（V）随 lg Q 变化',
    r2: '[Zn²⁺] = {zn} mol/L，[Cu²⁺] = {cu} mol/L → Q = {Q}，lg Q = {lq}。E = 1.10 − 0.0296 × {lqp} = {E} V，{cmp}。要让 E 降到 0，需要 lg Q = {lk}（即 K ≈ 10^{lkr}）：远在图外，所以这个反应几乎能进行到底。',
    cmpUp: '比标准值高 {d} mV', cmpDown: '比标准值低 {d} mV', cmpSame: '与标准值相同',
    s2hint: '观察顺序：先只拖 Cu²⁺ 滑杆从 0 拖到 −3（铜那杯变稀 1000 倍），看下图的点沿直线往右下走，E 共降 0.089 V；再只拖 Zn²⁺ 滑杆，点往左上走。两杯同时变稀相同倍数时 Q 不变，点不动。每个试过的位置都会留下一个白点，它们都落在同一条斜率为 −0.0296 V/十倍 的直线上。',

    s3k: '第 3 步 · 一边用一边变',
    s3t: '电池接上灯泡一直用下去，电压会怎样走到尽头？',
    s3e: '这一步要回答：电池放电时，铜那杯的 Cu²⁺ 不断被还原成铜、锌那杯的 Zn²⁺ 不断增多，Q 越来越大，E 怎么变？什么时候「没电」？这里两杯各 1 L，[Zn²⁺] 起始 1 mol/L，[Cu²⁺] 起始 c₀。每还原 1 mol Cu²⁺，导线里流过 2 mol 电子，即 2F = 193 kC 电量，所以电池的<strong>容量</strong>（最多能放出的电量）是 2F × c₀ × 1 L。电池自身也有电阻（<strong>内阻</strong>，这里取 1 Ω），电流 I = E ÷ (R + 内阻)，灯泡两端实际得到的<strong>端电压</strong> U = I × R，比 E 小（<a class="xlink" href="../../../physics/circuits/ohms-law/#step4">→ 欧姆定律页第 4 步：电池内阻与外接负载</a>）。',
    c3: '放电曲线',
    c03: '起始 [Cu²⁺] c₀（mol/L）', rl3: '负载电阻 R（Ω）', play3: '开始放电', reset3: '重置',
    lgEmf: '电动势 E', lgU: '端电压 U', lgOld: '上一次放电（虚线）',
    c3top: '离子浓度（mol/L）', c3bot: '电压（V）', axisQ: '已放出电量 / kC',
    rd3: '放电进度 {p}%：已放出 {Q} kC（容量 {Qmax} kC），用时约 {t} 小时。此刻 [Cu²⁺] = {cu} mol/L，[Zn²⁺] = {zn} mol/L；电动势 E = {E} V，端电压 U = {U} V，电流 I = {I} A。锌片溶解了 {mZn} g，铜片上析出 {mCu} g。',
    rd3cliff: ' E 跌破 1.00 V 时，已放出容量的 {cliff}%。',
    rd3idle: '还没开始放电：E = {E} V，容量 {Qmax} kC。按「开始放电」，曲线会随电量逐点画出。',
    s3hint: '观察顺序：先用默认值（c₀ = 1 mol/L，R = 9 Ω）按「开始放电」，看下图青色的 E 几乎是一条平线，直到最后才突然掉下：在本模型中，E 跌破 1.00 V 时已放出容量的 99.9%。原因是 E 只随 lg Q 变化，Q 要变大很多倍 E 才明显下降，而 Cu²⁺ 快耗尽时 Q 才急剧变大。再把 c₀ 调小重放：曲线变短（容量变小），起点略低。改 R 只改变端电压和用时，不改变 E 曲线。上一次的曲线会保留为虚线作对照。真实电池的末段下降还受离子扩散等因素影响，本模型不包括。',

    s4k: '第 4 步 · 把电子推回去',
    s4t: '外加一个反向电压，电子会怎样被推着倒流？',
    s4e: '这一步要回答：给锌铜电池（两杯都是 1 mol/L，E = 1.10 V）串一个外电源，正极接铜、负极接锌，让它的电压 V 与电池<strong>对着推</strong>，电流会怎样？电路总电阻取 2 Ω（导线加内阻），电流 I = (E − V) ÷ 2 Ω。V &lt; E 时电池占上风，仍是原电池；V = E 时两边抵消，I = 0；V &gt; E 时外电源占上风，电子被推着反向流，原本不会自发的反应 Cu + Zn²⁺ → Cu²⁺ + Zn 被迫发生，这样的装置叫<strong>电解池</strong>。电解池的两极另有名称：接电源正极、发生氧化的叫<strong>阳极</strong>；接电源负极、发生还原的叫<strong>阴极</strong>。注意铜一直接在高电位一侧，变的只是哪边发生氧化。',
    c4: '外加电压下的电池与电流—电压图',
    v4: '外加电压 V（伏）',
    lgIV: '电流 I = (E − V)/2 Ω', c4bot: '电流 I（A）随外加电压 V 变化', axisV: 'V / 伏',
    srcLabel: 'V = {V} V',
    r4g: '外加 V = {V} V，小于 E = 1.10 V：电池占上风，I = (1.10 − {V}) ÷ 2 = {I} A，电子仍从 Zn 经导线流向 Cu，仍是原电池。电池每秒放出 {Pc} J 的化学能：{Ps} J 被外电源吸收，{H} J 在电阻上变成热。',
    r4b: '外加 V = {V} V，正好等于 E：两边的推动力抵消，I = 0，反应停在原地。实验室正是用这种「对消」测量电动势：调到电流为零时，外加电压就等于 E。',
    r4e: '外加 V = {V} V，大于 E = 1.10 V：外电源占上风，I = (1.10 − {V}) ÷ 2 = {I} A（负号表示反向），电子被推着从 Cu 经导线流向 Zn，这是电解池。铜片接电源正极，是阳极：Cu → Cu²⁺ + 2e⁻，铜片变轻；锌片接电源负极，是阴极：Zn²⁺ + 2e⁻ → Zn，锌片变重。外电源每秒供给 {Ps} J：{Pc} J 存成化学能，{H} J 变成热。',
    s4hint: '观察顺序：把 V 从 0 慢慢拖到 2。上图看电子点：速度变慢、在 V = 1.10 时停住、再反向加速；同时看两块电极下方的名称如何对调。下图每拖到一个 V 就留下一个白点，它们排成一条直线，过零点正好在 V = E = 1.10 V。真实电解还需要额外的电压（过电位）才能让反应以可观速率进行，本模型按理想电极处理。',
    q4: '想一想：外加电压调到 1.5 V，持续一段时间后，哪块金属片会变重？',
    q4a: '锌片：它是阴极，Zn²⁺ 在上面得电子析出', q4b: '铜片：它接电源正极', q4c: '两块都变重',
    fb4ok: '对。V > E 时电子被推进锌片，Zn²⁺ 在锌片上被还原成锌；铜片失去电子溶解变轻。',
    fb4no: '再看看：V = 1.5 V 时电子往哪块金属里流？得到电子的一边发生还原，金属离子在上面析出。',

    s5k: '第 5 步 · 电量与产量',
    s5t: '通电一定时间，能镀上多少金属、放出多少气体？',
    s5e: '这一步要回答：电解时电流 I、时间 t 已知，生成多少物质？电极上的每一次还原都要固定个数的电子：Cu²⁺ 要 2 个，Ag⁺ 要 1 个。所以只要数清流过的电子，就知道生成了多少。流过的<strong>电量</strong> Q = I × t（单位库仑 C，1 A 电流流 1 秒就是 1 C）；电子的物质的量 = Q ÷ F（F = 96485 C/mol，即 1 mol 电子的电量）；产物的物质的量 = 电子的物质的量 ÷ 每个产物需要的电子数。这就是<strong>法拉第电解定律</strong>。电解水时，阴极上 2H₂O + 2e⁻ → H₂ + 2OH⁻（每个 H₂ 要 2 个电子），阳极上 2H₂O → O₂ + 4H⁺ + 4e⁻（每个 O₂ 放出 4 个电子），所以 H₂ 和 O₂ 的体积比是 2 : 1（<a class="xlink" href="../../../chemistry/matter/molecules-atoms/#step2">→ 分子与原子页第 2 步：水通电分解</a>）。',
    c5: '产物的物质的量随时间增长',
    k5Cu: '镀铜（CuSO₄）', k5Ag: '镀银（AgNO₃）', k5H2O: '电解水',
    i5: '电流 I（A）', t5: '通电时间 t（分钟）', play5: '通电 60 分钟', clearRuns: '清除记录',
    c5t: '产物（mmol）随通电时间（分钟）', axisMin: '时间 / 分钟',
    lgRun: '{id}（{I} A）',
    r5: 'I = {I} A，通电 {t} 分钟：电量 Q = It = {Q} C；流过电子 {ne} mmol（Q ÷ F）。{items}',
    itemMetal: '析出 {id} {mmol} mmol = {g} g（每个离子得 {z} 个电子）。',
    itemGas: '{id} {mmol} mmol ≈ {mL} mL（25 °C、1 atm；每个分子对应 {z} 个电子）。',
    ratioNote: '同样的电量下，H₂ 与 O₂ 的体积比 = {r} : 1。',
    s5hint: '观察顺序：先选「镀铜」、I = 1 A，按「通电 60 分钟」，看直线随时间均匀上升；再换「镀银」不改电流重放：同样的电量，银的物质的量正好是铜的 2 倍（每个 Ag⁺ 只要 1 个电子）。然后改电流：直线的斜率按比例变化。选「电解水」时会同时画出 H₂ 和 O₂ 两条线，比例总是 2 : 1。每次跑完的直线会留在图上，最多保留 6 条。按理想情况计算：所有电流都用于这一个反应（电流效率 100%）。',

    s6k: '第 6 步 · 收束', s6t: '电化学就是给氧化还原反应接上一根导线',
    s6fin: '回顾。<strong>第 0 步</strong>：把氧化和还原放进两个半电池，电子只能走导线，盐桥让离子补齐电荷，回路才闭合。<strong>第 1 步</strong>：E° 小的一边被氧化，电动势 E° = E°(正极) − E°(负极)，ΔG° = −nFE°。<strong>第 2 步</strong>：浓度改变 Q，E 按能斯特方程变化，E = 0 时 Q = K。<strong>第 3 步</strong>：放电时 Q 变大，E 先很平稳、到快耗尽时才陡降；端电压还要扣掉内阻上的损失。<strong>第 4 步</strong>：外加电压超过 E，电子被推着倒流，原电池变成电解池。<strong>第 5 步</strong>：产物的量只取决于流过的电子数，Q = It，n = Q/F。',
    formula: 'E°电池 = E°(正极) − E°(负极)　ΔG° = −nFE°\nE = E° − (0.0592/n)·lg Q（25 °C）\n物质的量 = I·t ÷ (z·F)',
    boundary: '适用范围：本页取 25 °C，把活度近似为浓度，电极理想（没有过电位），内阻与回路电阻是教学取值；E° 取教材常用的两位小数。第 3 步不包含离子扩散、电极钝化等让真实电池末段提前掉压的因素；第 4 步的锌铜电池在真实中并不适合反复充电；第 5 步假设电流效率 100%，没有副反应。',
    linksTitle: '接着去看',
    lk1: '→ 化学平衡 第 0 步：E = 0 时的 Q 就是平衡常数 K，平衡是怎样的动态过程',
    lk2: '→ 欧姆定律 第 4 步：电池内阻让端电压低于电动势',
    lk3: '→ 分子与原子 第 2 步：水通电分解成氢气和氧气',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《电化学 · 电子沿导线跑，还是被电推着跑》的平行版本。'
  },
  en: {
    pageTitle: 'Electrochemistry · Sending Electrons the Long Way Round',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Electrochemistry · Electrons Running Down the Wire, or Pushed Along →',
    navLabel: 'Electrochemistry steps',
    tagline: 'Drop zinc into copper sulfate solution and the zinc hands electrons to copper ions. That is a redox reaction, but the electrons only hop across the metal surface and power nothing. Electrochemistry splits the reaction in two and forces the electrons round a wire: left to itself the reaction lights a bulb (a galvanic cell); push back with a larger voltage and the electrons are driven the other way (an electrolytic cell). In seven steps you will work out where the voltage comes from, how it shifts with concentration, how much charge a cell can deliver, and how much metal a given charge deposits.',
    nav0: '0 Split it', nav1: '1 Who gives', nav2: '2 Concentration', nav3: '3 Discharge', nav4: '4 Push back', nav5: '5 Charge → product', nav6: '6 Wrap-up',

    s0k: 'Step 0 · One reaction, three set-ups',
    s0t: 'How do you make zinc’s electrons go round a wire and light a bulb?',
    s0e: 'This step asks: the reaction <span class="chem">Zn + Cu²⁺ → Zn²⁺ + Cu</span> happens on its own, so how must it be arranged for its electrons to flow through an outside wire? Two words first. Losing electrons is <strong>oxidation</strong> (Zn → Zn²⁺ + 2e⁻); gaining them is <strong>reduction</strong> (Cu²⁺ + 2e⁻ → Cu). These two half-reactions always come as a pair. To route the electrons through a wire, put each half-reaction in its own beaker (each is a <strong>half-cell</strong>) and leave the wire as the only path for electrons. The metal where oxidation happens, which electrons leave, is the <strong>anode</strong> (the negative terminal of the cell); the metal where reduction happens, which electrons enter, is the <strong>cathode</strong> (the positive terminal). The U-tube joining the two solutions is a <strong>salt bridge</strong>: a solution of an unreactive salt such as KNO₃ that lets ions through without letting the two solutions mix. The whole arrangement is a <strong>galvanic cell</strong>.',
    c0: 'Diagram of the galvanic cell set-up',
    m0a: 'One beaker: zinc straight into CuSO₄', m0b: 'Two beakers + wire, no salt bridge', m0c: 'Two beakers + wire + salt bridge',
    lgE: 'electrons e⁻ (schematic, speed not to scale)', lgCat: 'cations (K⁺ etc.)', lgAn: 'anions (NO₃⁻ etc.)', lgCu: 'deposited copper',
    elZn: 'zinc Zn', elCu: 'copper Cu',
    roleNegOx: 'anode (−) · oxidation', rolePosRed: 'cathode (+) · reduction', roleIdle: 'no current',
    roleCathodeIn: 'cathode · reduction', roleAnodeIn: 'anode · oxidation',
    hookNeg: 'to source −', hookPos: 'to source +',
    r0a: 'One beaker: electrons pass straight from the zinc surface to Cu²⁺ ions, so copper plates out on the zinc (brown patches) and the energy released warms the solution. No electrons go through the wire: the outside current is I = 0 and the bulb stays dark.',
    r0b: 'Two beakers + wire, no salt bridge: for an instant a tiny number of electrons flow from Zn to Cu. Then the zinc beaker holds extra Zn²⁺ (positive charge, the “+” marks) and the copper beaker, having lost Cu²⁺, is left with surplus SO₄²⁻ (negative charge, the “−” marks). These charges push the electrons back and the current stops at once: I = 0.',
    r0c: 'Two beakers + wire + salt bridge: the circuit is closed and I = {I} A ({E} V across a {Rb} Ω bulb plus {r} Ω of internal resistance), about {N} electrons through the bulb every second. In the salt bridge anions drift towards the zinc beaker and cations towards the copper beaker, cancelling the charge each beaker would otherwise build up, so the current keeps going.',
    s0hint: 'What to try: press the three buttons in turn. Each time, first check whether the bulb lights, then whether the yellow electron dots move and which way. In the second set-up look at the “+” and “−” marks in the two beakers: that is why the current stops. In the third, watch the salt bridge: ions move along the bridge while electrons move along the wire, and only the two paths together make a complete loop. The dot speed is schematic; real electrons drift through a wire very slowly.',

    s1k: 'Step 1 · Who wants electrons more',
    s1t: 'Pair two metals in a cell: which is the anode, and what is the voltage?',
    s1e: 'This step asks: take any two metals, each in a solution of its own ions at 1 mol/L, and build a galvanic cell. How can you predict, before wiring it, which way the electrons flow and how big the voltage is? Each metal | metal-ion half-cell has a <strong>standard electrode potential E°</strong>: its voltage against the standard hydrogen electrode (defined as 0 V) at 25 °C with ions at 1 mol/L. Read it as how strongly that ion pulls in electrons: the larger E°, the more easily it is reduced. Put two half-cells together and the one with the smaller E° is oxidised (the anode); electrons run through the wire to the one with the larger E° (the cathode). The cell’s <strong>standard voltage</strong> is the difference: E°cell = E°(cathode) − E°(anode). Multiply it by the number of electrons transferred, n, and by the <strong>Faraday constant</strong> F (the charge on 1 mol of electrons, 96485 C) and you get the most electrical work the reaction can do: ΔG° = −nFE°.',
    c1: 'Ladder of standard electrode potentials',
    lgAnode: 'anode (oxidised)', lgCathode: 'cathode (reduced)', lgFlow: 'direction of electron flow in the wire',
    pickA: 'Electrode A', pickB: 'Electrode B',
    axisE: 'E° / V',
    r1: '{an} is the anode (oxidised): {ox}; {ca} is the cathode (reduced): {red}. Overall: {overall}, with n = {n} electrons transferred each time. E°cell = E°({ca}) − E°({an}) = {Ec} − {Ea} = {E} V; ΔG° = −nFE° = {dG} kJ/mol (negative: the reaction runs on its own).',
    r1same: 'Both sides are the same metal in the same 1 mol/L solution: E°cell = 0. Neither side wants electrons more, so nothing happens. The next step shows that the same metal at two different concentrations still gives a small voltage.',
    r1note: ' Note: the {ion} half-reaction was multiplied by {p}, but E° is not. E° is energy per electron and does not depend on how many times the equation is written; ΔG° is what grows with n.',
    h1: 'Pairs tried so far: {list}',
    s1hint: 'What to try: start with A = Zn and B = Cu. The vertical gap between the two points on the ladder is the 1.10 V, and the yellow arrow points upward (electrons go from the smaller E° to the larger). Switch B to Ag: a longer arrow, a bigger voltage. Try Mg with Zn: now Mg is the anode. Every pair you try is listed under the readout, so you can compare voltages with distances on the ladder.',
    q1: 'Think: an iron strip in Fe²⁺ solution and a copper strip in Cu²⁺ solution (both 1 mol/L) form a galvanic cell. Which is the anode?',
    q1a: 'Iron: E°(Fe²⁺/Fe) = −0.44 V is smaller, so iron is oxidised', q1b: 'Copper: copper is less reactive, so it is the anode', q1c: 'Neither: both are metals, so there is no voltage',
    check: 'Check',
    fb1ok: 'Right. The side with the smaller E° is oxidised and electrons leave it, so iron is the anode; the voltage is 0.34 − (−0.44) = 0.78 V. Set A = Fe and B = Cu to see it.',
    fb1no: 'Look again: find Fe and Cu on the ladder. Electrons leave the lower one (smaller E°).',

    s2k: 'Step 2 · Concentration and voltage',
    s2t: 'If the solutions get stronger or weaker, how does the cell voltage change?',
    s2e: 'This step asks: E° only holds at 1 mol/L, so what is the zinc–copper cell’s voltage E at other concentrations? (Here E is the <strong>cell potential</strong>: the voltage between the terminals when no current flows.) The <strong>reaction quotient</strong> Q says how far the reaction has got: Q = [Zn²⁺] ÷ [Cu²⁺], the product ion over the reactant ion (solid metals are left out). At 25 °C the <strong>Nernst equation</strong> gives <strong>E = E° − (0.0592 / n) · log Q</strong>. Here E° = 1.10 V and n = 2, so every tenfold rise in Q lowers E by 0.0296 V. When E reaches 0 the reaction has no drive left; Q at that point is the <strong>equilibrium constant</strong> K (<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step0">→ Chemical equilibrium, step 0: equilibrium as forward and reverse rates in balance</a>).',
    c2: 'Ion concentrations and cell potential',
    zn2: 'log [Zn²⁺] (product ion)', cu2: 'log [Cu²⁺] (reactant ion)', clearDots: 'Clear dots',
    lgZn: 'Zn²⁺ concentration', lgCuIon: 'Cu²⁺ concentration', lgNernst: 'Nernst line E(log Q)', lgTried: 'points tried',
    c2top: 'Ion concentration in each beaker (mol/L, log scale)', c2bot: 'Cell potential E (V) against log Q',
    r2: '[Zn²⁺] = {zn} mol/L, [Cu²⁺] = {cu} mol/L → Q = {Q}, log Q = {lq}. E = 1.10 − 0.0296 × {lqp} = {E} V, {cmp}. For E to reach 0, log Q would have to be {lk} (K ≈ 10^{lkr}): far off the chart, so this reaction goes essentially to completion.',
    cmpUp: '{d} mV above the standard value', cmpDown: '{d} mV below the standard value', cmpSame: 'the same as the standard value',
    s2hint: 'What to try: drag only the Cu²⁺ slider from 0 to −3 (the copper beaker diluted 1000-fold). The dot slides down and right along the line, and E falls by 0.089 V in all. Then drag only the Zn²⁺ slider: the dot moves up and left. Dilute both by the same factor and Q does not change, so the dot stays put. Each position you try leaves a white dot, and they all sit on one straight line of slope −0.0296 V per tenfold change.',

    s3k: 'Step 3 · It changes as you use it',
    s3t: 'Leave the bulb on: how does the voltage run down to the end?',
    s3e: 'This step asks: as the cell discharges, Cu²⁺ keeps turning into copper and Zn²⁺ keeps piling up, so Q keeps rising. How does E change, and when is the cell “flat”? Each beaker holds 1 L; [Zn²⁺] starts at 1 mol/L and [Cu²⁺] at c₀. Each mole of Cu²⁺ reduced sends 2 mol of electrons through the wire, a charge of 2F = 193 kC, so the cell’s <strong>capacity</strong> (the most charge it can deliver) is 2F × c₀ × 1 L. The cell also has resistance of its own (<strong>internal resistance</strong>, 1 Ω here): the current is I = E ÷ (R + internal resistance), and the bulb only gets the <strong>terminal voltage</strong> U = I × R, which is less than E (<a class="xlink" href="../../../physics/circuits/ohms-law/#step4">→ Ohm’s law, step 4: a battery’s internal resistance and the load</a>).',
    c3: 'Discharge curve',
    c03: 'starting [Cu²⁺] c₀ (mol/L)', rl3: 'load resistance R (Ω)', play3: 'Start discharging', reset3: 'Reset',
    lgEmf: 'cell potential E', lgU: 'terminal voltage U', lgOld: 'previous discharge (dashed)',
    c3top: 'Ion concentration (mol/L)', c3bot: 'Voltage (V)', axisQ: 'charge delivered / kC',
    rd3: 'Discharge {p}% done: {Q} kC delivered (capacity {Qmax} kC) in about {t} hours. Now [Cu²⁺] = {cu} mol/L and [Zn²⁺] = {zn} mol/L; cell potential E = {E} V, terminal voltage U = {U} V, current I = {I} A. {mZn} g of zinc has dissolved and {mCu} g of copper has plated out.',
    rd3cliff: ' By the time E drops below 1.00 V, {cliff}% of the capacity has been delivered.',
    rd3idle: 'Not started: E = {E} V, capacity {Qmax} kC. Press “Start discharging” and the curves are drawn point by point as charge flows.',
    s3hint: 'What to try: with the defaults (c₀ = 1 mol/L, R = 9 Ω) press “Start discharging”. The cyan E line in the lower panel stays almost flat and drops only at the very end: in this model, E falls below 1.00 V only after 99.9% of the capacity is gone. The reason is that E follows log Q, so Q must grow many times over before E moves much, and Q only shoots up as the last Cu²⁺ runs out. Then lower c₀ and run again: a shorter curve (less capacity) starting slightly lower. Changing R alters the terminal voltage and the time taken, not the E curve. The previous run stays as a dashed line for comparison. In real cells the final drop also depends on ion diffusion and other effects this model leaves out.',

    s4k: 'Step 4 · Pushing the electrons back',
    s4t: 'Add an opposing voltage: how are the electrons pushed the other way?',
    s4e: 'This step asks: connect an external source to the zinc–copper cell (both beakers 1 mol/L, E = 1.10 V), its positive terminal to copper and negative to zinc, so that its voltage V <strong>pushes against</strong> the cell. What does the current do? Take the total resistance of the loop (wires plus internal resistance) as 2 Ω, so I = (E − V) ÷ 2 Ω. With V &lt; E the cell wins and it is still a galvanic cell. At V = E the two cancel and I = 0. With V &gt; E the source wins: electrons are driven backwards and the non-spontaneous reaction Cu + Zn²⁺ → Cu²⁺ + Zn is forced to run. That is an <strong>electrolytic cell</strong>. The names follow the chemistry, not the wiring: the anode is still where oxidation happens, which is now the copper (joined to the source’s + terminal), and the cathode is where reduction happens, now the zinc. Copper stays on the high-potential side throughout; only the side where oxidation happens changes.',
    c4: 'Cell under an applied voltage, with current–voltage graph',
    v4: 'applied voltage V (volts)',
    lgIV: 'current I = (E − V)/2 Ω', c4bot: 'Current I (A) against applied voltage V', axisV: 'V / volts',
    srcLabel: 'V = {V} V',
    r4g: 'Applied V = {V} V, less than E = 1.10 V: the cell wins, I = (1.10 − {V}) ÷ 2 = {I} A, and electrons still flow from Zn through the wire to Cu. It is still a galvanic cell. Each second it releases {Pc} J of chemical energy: {Ps} J goes into the source and {H} J becomes heat in the resistance.',
    r4b: 'Applied V = {V} V, exactly E: the two pushes cancel, I = 0, and the reaction stands still. This balancing is how a cell potential is measured: adjust until no current flows, and the applied voltage equals E.',
    r4e: 'Applied V = {V} V, more than E = 1.10 V: the source wins, I = (1.10 − {V}) ÷ 2 = {I} A (negative means reversed), and electrons are pushed from Cu through the wire to Zn. This is an electrolytic cell. Copper, joined to the source’s + terminal, is the anode: Cu → Cu²⁺ + 2e⁻, and the copper strip gets lighter. Zinc, joined to the − terminal, is the cathode: Zn²⁺ + 2e⁻ → Zn, and the zinc strip gets heavier. Each second the source supplies {Ps} J: {Pc} J is stored as chemical energy and {H} J becomes heat.',
    s4hint: 'What to try: drag V slowly from 0 to 2. In the top diagram the electron dots slow down, stop at V = 1.10, then speed up the other way; watch the labels under the two electrodes swap. In the lower graph every V you visit leaves a white dot; together they form a straight line that crosses zero exactly at V = E = 1.10 V. Real electrolysis needs some extra voltage (overpotential) to run at a useful rate; this model treats the electrodes as ideal.',
    q4: 'Think: with the applied voltage at 1.5 V for a while, which strip gets heavier?',
    q4a: 'The zinc: it is the cathode, where Zn²⁺ gains electrons and plates out', q4b: 'The copper: it is joined to the + terminal', q4c: 'Both get heavier',
    fb4ok: 'Right. With V > E electrons are pushed into the zinc, where Zn²⁺ is reduced to zinc; the copper loses electrons and dissolves.',
    fb4no: 'Look again: at V = 1.5 V, which metal do the electrons flow into? The side that gains electrons is where reduction happens and metal ions plate out.',

    s5k: 'Step 5 · Charge and product',
    s5t: 'Run a current for a while: how much metal plates out, how much gas comes off?',
    s5e: 'This step asks: in electrolysis, given the current I and the time t, how much product forms? Each reduction at an electrode takes a fixed number of electrons: 2 for Cu²⁺, 1 for Ag⁺. So counting the electrons that pass tells you how much product there is. The <strong>charge</strong> passed is Q = I × t (in coulombs, C; 1 A for 1 s is 1 C); the moles of electrons are Q ÷ F (F = 96485 C/mol, the charge on 1 mol of electrons); the moles of product are the moles of electrons ÷ the electrons each product needs. This is <strong>Faraday’s law of electrolysis</strong>. When water is electrolysed, the cathode reaction is 2H₂O + 2e⁻ → H₂ + 2OH⁻ (2 electrons per H₂) and the anode reaction is 2H₂O → O₂ + 4H⁺ + 4e⁻ (4 electrons per O₂), so H₂ and O₂ come off in a 2 : 1 volume ratio (<a class="xlink" href="../../../chemistry/matter/molecules-atoms/#step2">→ Molecules and atoms, step 2: splitting water with electricity</a>).',
    c5: 'Amount of product growing with time',
    k5Cu: 'Copper plating (CuSO₄)', k5Ag: 'Silver plating (AgNO₃)', k5H2O: 'Electrolysis of water',
    i5: 'current I (A)', t5: 'time t (minutes)', play5: 'Run for 60 minutes', clearRuns: 'Clear runs',
    c5t: 'Product (mmol) against time (minutes)', axisMin: 'time / min',
    lgRun: '{id} ({I} A)',
    r5: 'I = {I} A for {t} minutes: charge Q = It = {Q} C; {ne} mmol of electrons passed (Q ÷ F). {items}',
    itemMetal: '{id} plated: {mmol} mmol = {g} g ({z} electrons per ion).',
    itemGas: '{id}: {mmol} mmol ≈ {mL} mL (25 °C, 1 atm; {z} electrons per molecule).',
    ratioNote: 'For the same charge, the H₂ : O₂ volume ratio is {r} : 1.',
    s5hint: 'What to try: pick “Copper plating” at I = 1 A and press “Run for 60 minutes”: the line climbs steadily with time. Switch to “Silver plating” at the same current and run again: for the same charge you get exactly twice as many moles of silver as of copper (each Ag⁺ needs only one electron). Then change the current: the slope changes in proportion. “Electrolysis of water” draws H₂ and O₂ together, always 2 : 1. Finished runs stay on the chart (up to 6). The numbers are ideal: all the current goes into this one reaction (100% current efficiency).',

    s6k: 'Step 6 · Wrap-up', s6t: 'Electrochemistry is a redox reaction with a wire attached',
    s6fin: 'Looking back. <strong>Step 0</strong>: put oxidation and reduction in separate half-cells, the electrons have to take the wire, and the salt bridge lets ions even out the charge so the loop closes. <strong>Step 1</strong>: the side with the smaller E° is oxidised; E°cell = E°(cathode) − E°(anode) and ΔG° = −nFE°. <strong>Step 2</strong>: concentrations set Q and E follows the Nernst equation; E = 0 when Q = K. <strong>Step 3</strong>: during discharge Q rises; E stays nearly level and drops sharply only near exhaustion, and the terminal voltage also loses what the internal resistance takes. <strong>Step 4</strong>: push with more than E and the electrons go backwards; the galvanic cell becomes an electrolytic one. <strong>Step 5</strong>: the amount of product depends only on how many electrons pass: Q = It, n = Q/F.',
    formula: 'E°cell = E°(cathode) − E°(anode)　ΔG° = −nFE°\nE = E° − (0.0592/n)·log Q  (25 °C)\namount = I·t ÷ (z·F)',
    boundary: 'Scope: 25 °C throughout, activities approximated by concentrations, ideal electrodes (no overpotential), and teaching values for the internal and loop resistance; E° values are the usual two-decimal textbook figures. Step 3 leaves out ion diffusion, electrode passivation and the other effects that make real cells fade earlier. The zinc–copper cell of step 4 does not make a practical rechargeable battery. Step 5 assumes 100% current efficiency with no side reactions.',
    linksTitle: 'Where to go next',
    lk1: '→ Chemical equilibrium, step 0: the Q at which E = 0 is K; what dynamic equilibrium looks like',
    lk2: '→ Ohm’s law, step 4: internal resistance makes the terminal voltage lower than the cell potential',
    lk3: '→ Molecules and atoms, step 2: splitting water into hydrogen and oxygen with a current',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Electrochemistry · Electrons Running Down the Wire, or Pushed Along”.'
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
  if (typeof window.refreshEchem === 'function') window.refreshEchem();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EC_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
