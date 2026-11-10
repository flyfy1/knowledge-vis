'use strict';
// Isomers lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '同分异构体 · 原子一样，连法不同',
    back: '← 知识索引',
    compare: '对照另一版本：同分异构体 · 同一组原子，不同的拼法 →',
    navLabel: '同分异构体步骤导航',
    tagline: '分子式只告诉你「有哪些原子、各几个」，没说它们谁和谁相连。同样 4 个碳、10 个氢，能连成两种沸点差 11 °C 的气体；同样 C₂H₆O，一种是酒里的乙醇，一种是做喷雾推进剂的二甲醚。七步里你会数清连法、分辨「画法不同」和「分子不同」、看碳原子一多异构体怎样暴涨，再看结构怎样决定沸点，以及双键为什么让顺式和反式分得开。',
    nav0: '0 同一个分子式', nav1: '1 画法还是分子', nav2: '2 数骨架', nav3: '3 支链与沸点', nav4: '4 换个官能团', nav5: '5 转不动的双键', nav6: '6 收束',
    lgC: '碳 C', lgH: '氢 H', lgO: '氧 O', lgHl: '正在数 / 最长碳链', lgOH: 'O–H 上的氢（能形成氢键）',
    check: '核对',

    s0k: '第 0 步 · 同一个分子式',
    s0t: '两种分子都写作 C₄H₁₀，它们是同一种物质吗？',
    s0e: '这一步要回答：分子式相同，是不是就是同一种物质？<strong>分子式</strong>只写出每种原子各有几个，例如 C₄H₁₀ 表示 4 个碳、10 个氢。可是原子之间怎样相连——即分子的<strong>结构</strong>——分子式没有写。碳原子总是形成 4 根键，氢原子只形成 1 根，所以 4 个碳可以连成一串（<strong>丁烷</strong>），也可以 3 个连成一串、第 4 个挂在中间那个碳上（<strong>2-甲基丙烷</strong>，又叫异丁烷）。挂在主链旁边的那段碳叫<strong>支链</strong>。分子式相同、结构不同的化合物互为<strong>同分异构体</strong>，它们是不同的物质，性质也不同：丁烷沸点 −0.5 °C，2-甲基丙烷沸点 −11.7 °C（两者常温下都是气体）。',
    c0: '丁烷与 2-甲基丙烷的球棍示意图和沸点',
    h0C: '数碳原子', h0H: '数氢原子', h0L: '找最长碳链',
    c0bp: '沸点（°C，1 个大气压）', roomT: '室温 25 °C',
    r0C: '数碳：丁烷 {ca} 个 C，2-甲基丙烷 {cb} 个 C，一样多。',
    r0H: '数氢：丁烷 {ha} 个 H，2-甲基丙烷 {hb} 个 H，一样多。所以两者的分子式都是 {f}。',
    r0L: '最长碳链：丁烷是 {la} 个 C 连成的一串；2-甲基丙烷最长只有 {lb} 个 C，剩下 1 个 C 作为支链挂在中间。原子一样、连法不同，所以是两种物质：沸点 {ba} °C 对 {bb} °C。',
    s0hint: '观察顺序：依次按三个按钮。先数碳、再数氢，看两个分子的高亮原子个数是否一样（读数给出个数）；最后按「找最长碳链」，看两个分子里连成一串的碳各有几个。下方温度轴上的两个点是两者的沸点。',

    s1k: '第 1 步 · 画法还是分子',
    s1t: '两幅骨架图，画的是同一种分子吗？',
    s1e: '这一步要回答：同一种分子可以画成很多样子，怎样判断两幅图是不是同一种分子？从这一步起只画<strong>碳骨架</strong>：每个点是一个碳原子，每条线是一根 C–C 键，氢省略不画（每个碳缺几根键就连几个氢，所以氢的位置由骨架决定）。把骨架翻转、把碳链画弯、换一条链当作横排的主链，都只是画法不同；只要「每个碳和哪几个碳相连」完全一样，就是同一种分子。判断时可以找<strong>最长碳链</strong>（首尾相接最多的一串碳），再看支链挂在第几个碳上。下面每题从同一组碳数的异构体里随机抽两幅图，图 A 和图 B 可能画的是同一种分子的不同画法。',
    c1: '两幅碳骨架图 A 与 B',
    n1: '碳原子数',
    same: '同一种分子', diff: '不同的分子', next: '下一题', resetScore: '清零重来',
    r1ask: '第 {k} 题（{c}）：图 A 和图 B 画的是同一种分子吗？',
    r1right: '答对了。', r1wrong: '不对。',
    r1truthSame: '{v}两幅图都是 {na}：最长碳链 {la} 个 C。只是选作横排主链的那串碳或翻转方向不同。',
    r1truthDiff: '{v}图 A 是 {na}（最长碳链 {la} 个 C），图 B 是 {nb}（最长碳链 {lb} 个 C），连法不同。',
    score1: '得分：{r}/{t}',
    s1hint: '观察顺序：先别急着按按钮。在每幅图里找出最长的一串碳，数它有几个 C；再看支链挂在从链端数起的第几个碳上（从离支链近的一端数）。两幅图这两项都相同，才是同一种分子。答完后读数会给出两幅图的名称；按「下一题」继续，换碳原子数会从第 1 题重新开始。',

    s2k: '第 2 步 · 数骨架',
    s2t: '碳原子越来越多，异构体有多少种？',
    s2e: '这一步要回答：n 个碳的烷烃（只含 C–C 单键、没有环、分子式 CₙH₂ₙ₊₂）有多少种不同的碳骨架？页面用电脑把它们全部列出来：从 n − 1 个碳的每一种骨架出发，在每个还没连满 4 根键的碳上接一个新碳，再去掉重复的。判断重复用的是上一步的标准——连法相同即同一种。具体做法是从骨架最中间的碳出发，把每个分支按固定规则写成一串括号，两个骨架写出的串一样，才算同一种。下方图库画出 n 个碳的全部骨架，最下面的柱状图记录各个 n 的种数。',
    c2: '碳骨架图库与种数柱状图',
    n2: '碳原子数 n',
    c2bar: '种数（你看过的 n）',
    r2: 'n = {n}：共 {c} 种碳骨架（分子式 {f}）。{more}',
    r2more: '比 n = {m} 多 {d} 种。',
    r2one: '只有一种连法。',
    s2hint: '观察顺序：把 n 从 1 拖到 8。n ≤ 3 时只有一种骨架：碳少，接到哪个碳上结果都一样。n = 4 开始出现支链，种数 1、1、1、2、3、5、9、18 越涨越快；同一个模型算出 n = 9 有 35 种、n = 10 有 75 种（图库只画到 8）。每看一个 n，柱状图就多一根柱子。',
    q2: '想一想：C₆H₁₄ 有几种同分异构体？（把 n 拖到 6 核对）',
    q2a: '4 种', q2b: '5 种', q2c: '6 种',
    fb2ok: '对，5 种：己烷、2-甲基戊烷、3-甲基戊烷、2,2-二甲基丁烷、2,3-二甲基丁烷。',
    fb2no: '再数数：把 n 拖到 6，图库里一共有几幅？注意「2-甲基戊烷」和「4-甲基戊烷」是同一种（从另一端数）。',

    s3k: '第 3 步 · 支链与沸点',
    s3t: '同样的原子，支链越多，沸点为什么越低？',
    s3e: '这一步要回答：同分异构体的沸点为什么不同？液体沸腾时，分子要摆脱彼此之间的吸引力。烷烃分子之间只有很弱的<strong>范德华力</strong>（分子间作用力，分子贴得越近、接触面越大就越强）。直链分子细长，彼此能大面积并排贴着；支链多的分子更紧凑、更接近球形，彼此只能点接触，所以吸引力弱、沸点低。怎样用一个数衡量「紧凑」？这里用<strong>维纳指数 W</strong>：把骨架里每两个碳之间隔几根键加起来；分子越紧凑，碳之间离得越近，W 越小。下图横轴是 W，纵轴是沸点，每个点是一种异构体。',
    c3: '选中异构体的骨架，以及沸点对维纳指数的散点图',
    c3top: '选中的碳骨架', c3bot: '沸点（°C）对维纳指数 W', axisW: '维纳指数 W（越小越紧凑）',
    lgIso: '本组每一种异构体', lgSel: '当前选中',
    r3: '{name}：W = {W}，沸点 {bp} °C。本组 {N} 种异构体两两比较（W 相同的不计），有 {agree}/{total} 对符合「W 越小，沸点越低」。',
    s3hint: '观察顺序：先选 C₅H₁₂，依次点三种异构体：W 从 20 降到 16，沸点从 36.1 °C 降到 9.5 °C，三个点排成下降的一列。再选 C₆H₁₄：大体仍是 W 越小沸点越低，但 3-甲基戊烷（W = 31）比 2-甲基戊烷（W = 32）沸点还高，是本组 10 对里唯一的例外。C₇H₁₆ 例外更多（34 对中 8 对）。W 只是一个粗略的「紧凑度」，分子形状的其他细节也影响沸点，所以这是趋势，不是定律。',

    s4k: '第 4 步 · 换个官能团',
    s4t: '同样是 C₂H₆O，乙醇是液体，二甲醚却是气体，为什么？',
    s4e: '这一步要回答：原子种类和个数都一样，换一种连法能差多远？分子里决定一类化合物主要性质的原子团叫<strong>官能团</strong>。C₂H₆O 的氧原子如果接在碳链末端、自己再连一个氢，就形成 –OH（<strong>羟基</strong>），这类化合物叫<strong>醇</strong>，例如乙醇；氧如果夹在两个碳中间（C–O–C），叫<strong>醚</strong>，例如二甲醚。官能团不同的同分异构体叫<strong>官能团异构</strong>。醇分子里 O–H 上的氢会被另一个分子的氧吸引，形成<strong>氢键</strong>，它比烷烃之间的范德华力强得多（<a class="xlink" href="../../../chemistry/matter/particles-states/#step4">→ 物质三态页第 4 步：沸腾时粒子要摆脱彼此的吸引</a>）。醚没有 O–H，分子之间就没有这种氢键。',
    c4: '选中分子的球棍示意图与五种分子的沸点柱状图',
    lgAlc: '醇（有 O–H）', lgEth: '醚（没有 O–H）',
    c4bot: '沸点（°C）',
    kind_alcohol: '醇', kind_ether: '醚',
    r4: '{name}（{kind}）：从结构数出分子式 {f}，O–H 数 {oh}，沸点 {bp} °C。同分子式的醇与醚，沸点差 {gap} °C。',
    s4hint: '观察顺序：先点乙醇，再点二甲醚：分子式都由结构数出为 C₂H₆O，乙醇的 O–H 氢用青色圈出，二甲醚没有；下方柱状图里两者沸点差约 100 °C。再看 C₃H₈O 的三种：两种醇（1-丙醇、2-丙醇）都比甲乙醚高得多；两种醇之间，羟基在链中间的 2-丙醇更紧凑，沸点低一些，和上一步的趋势一致。',

    s5k: '第 5 步 · 转不动的双键',
    s5t: '单键能转，双键转不动，这和异构体有什么关系？',
    s5e: '这一步要回答：为什么丁烷两端的 CH₃ 在同侧或异侧都是同一种分子，而 2-丁烯（CH₃–CH=CH–CH₃）的两种排法却是两种物质？中间两个碳之间如果是<strong>单键</strong>，两端可以绕键轴转动，转出的各种形状叫<strong>构象</strong>，室温下分子不停地在构象之间变换，不算不同的分子。如果是<strong>双键</strong>，它除了一根普通键，还有一根要求两端保持在同一平面的键（π 键），转动就要把它拉断，代价极高。于是两个 CH₃ 在双键同侧的<strong>顺式</strong>（沸点 3.7 °C）和异侧的<strong>反式</strong>（沸点 0.9 °C）不能互相转变，成了两种物质，这叫<strong>顺反异构</strong>。下图上方是沿中间键看的侧视图（转动的那端越靠近你画得越大），下方是转动角 θ 对应的能量。θ = 0° 表示两个 CH₃ 在同侧。',
    c5: '绕中心键转动的分子侧视图与能量曲线',
    lgCH3: '端基 CH₃ 的碳', lgCurve: '能量曲线（教学拟合）', lgTried: '试过的角度', lgRT: '热运动能量尺度 RT',
    b5s: '单键：丁烷', b5d: '双键：2-丁烯',
    th5: '绕中心键转动的角度 θ（°）',
    c5bot: '能量（kJ/mol）随 θ',
    r5: '{bond}，θ = {th}°：能量 {E} kJ/mol（以两个 CH₃ 最远的位置为 0）；e^(−E/RT) ≈ {f}（RT = {rt} kJ/mol，粗略表示热运动能达到这么高能量的分子比例）。{state}',
    bondS: '单键（丁烷）', bondD: '双键（2-丁烯）',
    stS: '单键：转一整圈，最高也只要 {max} kJ/mol，约为 RT 的 {x} 倍。这只是同一个分子的不同构象，室温下分子在它们之间来回变换。',
    stCis: '顺式：两个 CH₃ 在双键同侧。要转成反式，得先翻过约 {max} kJ/mol 的能量高峰，约为 RT 的 {x} 倍，室温下几乎不可能发生。',
    stTrans: '反式：两个 CH₃ 在双键两侧。要转成顺式，同样得翻过约 {max} kJ/mol 的高峰。',
    stMid: '双键被扭离平面：π 键被拉断，能量很高，室温下的分子几乎不会出现这种形状。',
    s5hint: '观察顺序：先选「单键：丁烷」，把 θ 从 0° 拖到 360°：上方侧视图里右端的 CH₃ 绕着中心键转一圈；下方曲线最高只有 19 kJ/mol，和 RT 那条虚线相比只高几倍。再选「双键：2-丁烯」重复：曲线纵轴放大到 300 kJ/mol，转到 90° 时能量约 267 kJ/mol，是 RT 的一百多倍。曲线是教学用的拟合，只保留关键高度（丁烷：同侧 19、60° 处 3.8、异侧 0；2-丁烯：拉断 π 键约 265、顺式比反式高约 4），单位是每摩尔分子的能量。',

    s6k: '第 6 步 · 收束', s6t: '分子式是原子清单，结构才是身份',
    s6fin: '回顾。<strong>第 0 步</strong>：分子式相同、结构不同的化合物互为同分异构体，是不同的物质。<strong>第 1 步</strong>：判断同一种还是不同种，要看「谁和谁相连」，与怎么画无关；最长碳链和支链位置是好用的检查项。<strong>第 2 步</strong>：碳原子增多，异构体种数越涨越快（1、1、1、2、3、5、9、18……）。<strong>第 3 步</strong>：支链让分子更紧凑，分子间作用力变弱，沸点大体降低。<strong>第 4 步</strong>：同样的原子还能组成不同官能团；醇有 O–H、能形成氢键，沸点远高于同分子式的醚。<strong>第 5 步</strong>：双键不能转动，所以顺式和反式是两种物质。',
    formula: '同分异构体：分子式相同，结构（原子连接方式或空间排列）不同\n烷烃 CₙH₂ₙ₊₂：n = 1…8 的骨架数 1、1、1、2、3、5、9、18\nW 越小（越紧凑）→ 沸点大体越低',
    boundary: '适用范围：第 2 步只数无环烷烃的碳骨架，不含环、双键位置异构，也不含手性（镜像）异构；所以它数的是构造异构体。沸点取手册上的取整值（1 个大气压）。维纳指数只是一个粗略的紧凑度指标，第 3 步已展示它的例外。第 5 步的能量曲线是只保留几个关键高度的教学拟合，不是精确计算；e^(−E/RT) 只表示数量级。',
    linksTitle: '接着去看',
    lk1: '→ 分子的形状 第 0 步：碳的 4 根键为什么指向四面体的四个角',
    lk2: '→ 物质三态 第 4 步：沸腾时粒子怎样摆脱彼此的吸引',
    lk3: '→ 活化能 第 1 步：只有能量够高的一小部分分子能翻过能量高峰',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《同分异构体 · 同一组原子，不同的拼法》的平行版本。',

    iso_butane: '丁烷', iso_methylpropane: '2-甲基丙烷',
    iso_pentane: '戊烷', iso_methylbutane: '2-甲基丁烷', iso_dimethylpropane: '2,2-二甲基丙烷',
    iso_hexane: '己烷', iso_m2pentane: '2-甲基戊烷', iso_m3pentane: '3-甲基戊烷', iso_dm22butane: '2,2-二甲基丁烷', iso_dm23butane: '2,3-二甲基丁烷',
    iso_heptane: '庚烷', iso_m2hexane: '2-甲基己烷', iso_m3hexane: '3-甲基己烷', iso_e3pentane: '3-乙基戊烷', iso_dm22pentane: '2,2-二甲基戊烷', iso_dm23pentane: '2,3-二甲基戊烷', iso_dm24pentane: '2,4-二甲基戊烷', iso_dm33pentane: '3,3-二甲基戊烷', iso_tm223butane: '2,2,3-三甲基丁烷',
    fn_ethanol: '乙醇', fn_dme: '二甲醚', fn_propanol1: '1-丙醇', fn_propanol2: '2-丙醇', fn_mee: '甲乙醚'
  },
  en: {
    pageTitle: 'Isomers · Same Atoms, Different Connections',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Isomers · The Same Atoms, Put Together Differently →',
    navLabel: 'Isomer steps',
    tagline: 'A molecular formula only lists which atoms there are and how many; it says nothing about which atom is bonded to which. Four carbons and ten hydrogens can join up as two different gases whose boiling points are 11 °C apart. C₂H₆O can be the ethanol in a drink or the dimethyl ether that propels an aerosol. In seven steps you will count the connections, tell “drawn differently” from “a different molecule”, watch the number of isomers explode as carbons are added, see how structure sets the boiling point, and find out why a double bond keeps cis and trans apart.',
    nav0: '0 One formula', nav1: '1 Drawing or molecule', nav2: '2 Count skeletons', nav3: '3 Branches & boiling', nav4: '4 Change the group', nav5: '5 The locked bond', nav6: '6 Wrap-up',
    lgC: 'carbon C', lgH: 'hydrogen H', lgO: 'oxygen O', lgHl: 'being counted / longest chain', lgOH: 'H on O–H (can hydrogen-bond)',
    check: 'Check',

    s0k: 'Step 0 · One formula',
    s0t: 'Both of these are C₄H₁₀. Are they the same substance?',
    s0e: 'This step asks: if two compounds share a molecular formula, are they the same substance? A <strong>molecular formula</strong> only says how many of each atom there are: C₄H₁₀ means 4 carbons and 10 hydrogens. It does not say how the atoms are joined, that is, the molecule’s <strong>structure</strong>. Carbon always makes 4 bonds and hydrogen makes 1, so the 4 carbons can form one chain (<strong>butane</strong>), or a chain of 3 with the fourth carbon hanging off the middle one (<strong>2-methylpropane</strong>, also called isobutane). A piece of carbon hanging off the main chain is a <strong>branch</strong>. Compounds with the same molecular formula but different structures are <strong>isomers</strong> of each other. They are different substances with different properties: butane boils at −0.5 °C, 2-methylpropane at −11.7 °C (both are gases at room temperature).',
    c0: 'Ball-and-stick pictures of butane and 2-methylpropane with their boiling points',
    h0C: 'Count carbons', h0H: 'Count hydrogens', h0L: 'Find the longest chain',
    c0bp: 'Boiling point (°C, 1 atm)', roomT: 'room temp 25 °C',
    r0C: 'Carbons: butane has {ca}, 2-methylpropane has {cb}. The same.',
    r0H: 'Hydrogens: butane has {ha}, 2-methylpropane has {hb}. The same, so both have the formula {f}.',
    r0L: 'Longest chain: butane is one chain of {la} carbons; in 2-methylpropane the longest chain is only {lb}, with the remaining carbon as a branch on the middle one. Same atoms, different connections, so two different substances: boiling at {ba} °C versus {bb} °C.',
    s0hint: 'What to try: press the three buttons in turn. Count carbons, then hydrogens, and check whether the two molecules have the same number lit up (the readout gives the counts). Then press “Find the longest chain” and see how many carbons form one unbroken chain in each. The two dots on the temperature axis below are their boiling points.',

    s1k: 'Step 1 · Drawing or molecule',
    s1t: 'Two skeleton drawings: are they the same molecule?',
    s1e: 'This step asks: one molecule can be drawn in many ways, so how do you tell whether two drawings show the same molecule? From here on only the <strong>carbon skeleton</strong> is drawn: each dot is a carbon, each line a C–C bond, and hydrogens are left out (each carbon carries as many hydrogens as it has bonds to spare, so the skeleton fixes where they go). Flipping the skeleton, bending the chain, or choosing a different chain to draw across the page only changes the drawing. If “which carbon is bonded to which” is exactly the same, it is the same molecule. A useful check is the <strong>longest chain</strong> (the most carbons joined end to end) and which carbon of it each branch is attached to. Each question picks two drawings at random from the isomers with one carbon count; drawings A and B may be two ways of drawing one molecule.',
    c1: 'Two carbon-skeleton drawings, A and B',
    n1: 'Carbons',
    same: 'Same molecule', diff: 'Different molecules', next: 'Next question', resetScore: 'Start over',
    r1ask: 'Question {k} ({c}): do drawings A and B show the same molecule?',
    r1right: 'Correct. ', r1wrong: 'Not quite. ',
    r1truthSame: '{v}Both are {na}, with a longest chain of {la} carbons. Only the chain drawn across the page, or the mirroring, differs.',
    r1truthDiff: '{v}A is {na} (longest chain {la} carbons) and B is {nb} (longest chain {lb} carbons): different connections.',
    score1: 'Score: {r}/{t}',
    s1hint: 'What to try: don’t press a button straight away. In each drawing find the longest run of carbons and count it; then see which carbon of that chain each branch sits on (counting from the end nearer the branch). Only if both match is it the same molecule. After you answer, the readout names both drawings; “Next question” moves on, and changing the carbon count restarts at question 1.',

    s2k: 'Step 2 · Count skeletons',
    s2t: 'As carbons are added, how many isomers are there?',
    s2e: 'This step asks: how many different carbon skeletons can an alkane with n carbons have (only C–C single bonds, no rings, formula CₙH₂ₙ₊₂)? The page lists them all by computer. Start from every skeleton with n − 1 carbons, attach a new carbon to every carbon that still has fewer than 4 bonds, then throw out duplicates. Duplicates are judged by the rule from the last step: same connections, same molecule. In practice the program starts from the carbon at the very middle of the skeleton and writes each branch as a string of brackets in a fixed order; two skeletons count as one only if they give the same string. The gallery below draws every skeleton for n carbons; the bar chart at the bottom records the count for each n.',
    c2: 'Gallery of carbon skeletons and a bar chart of counts',
    n2: 'number of carbons n',
    c2bar: 'Count (for the n you have viewed)',
    r2: 'n = {n}: {c} carbon skeleton(s) (formula {f}). {more}',
    r2more: '{d} more than for n = {m}.',
    r2one: 'Only one way to connect them.',
    s2hint: 'What to try: drag n from 1 to 8. For n ≤ 3 there is a single skeleton: with so few carbons, wherever you attach the next one gives the same result. Branches appear at n = 4, and the counts 1, 1, 1, 2, 3, 5, 9, 18 grow faster and faster; the same model gives 35 for n = 9 and 75 for n = 10 (the gallery stops at 8). Each n you look at adds a bar to the chart.',
    q2: 'Think: how many isomers does C₆H₁₄ have? (Drag n to 6 to check.)',
    q2a: '4', q2b: '5', q2c: '6',
    fb2ok: 'Right, 5: hexane, 2-methylpentane, 3-methylpentane, 2,2-dimethylbutane and 2,3-dimethylbutane.',
    fb2no: 'Count again: set n to 6 and count the drawings in the gallery. Note that “2-methylpentane” and “4-methylpentane” are the same molecule counted from the other end.',

    s3k: 'Step 3 · Branches and boiling',
    s3t: 'Same atoms: why do more branches mean a lower boiling point?',
    s3e: 'This step asks: why do isomers boil at different temperatures? To boil, molecules in a liquid must break free of their attraction to each other. Between alkane molecules there are only weak <strong>van der Waals forces</strong> (attractions between molecules that are stronger the closer they get and the more surface they share). Straight-chain molecules are long and thin and can lie alongside each other over a large area; branched molecules are more compact, closer to a ball, and touch only at points, so they attract each other less and boil lower. How can “compact” be put into one number? Here we use the <strong>Wiener index W</strong>: for every pair of carbons in the skeleton, count the bonds between them, and add it all up. The more compact the molecule, the closer its carbons sit, and the smaller W. In the plot below, W runs across, boiling point runs up, and each dot is one isomer.',
    c3: 'The selected isomer’s skeleton, and a scatter plot of boiling point against Wiener index',
    c3top: 'Selected carbon skeleton', c3bot: 'Boiling point (°C) against Wiener index W', axisW: 'Wiener index W (smaller = more compact)',
    lgIso: 'each isomer in this group', lgSel: 'currently selected',
    r3: '{name}: W = {W}, boiling point {bp} °C. Comparing the {N} isomers in this group pair by pair (pairs with equal W skipped), {agree} of {total} pairs follow “smaller W, lower boiling point”.',
    s3hint: 'What to try: choose C₅H₁₂ and click its three isomers in turn. W falls from 20 to 16 and the boiling point from 36.1 °C to 9.5 °C; the three dots form a falling line. Then choose C₆H₁₄: broadly, smaller W still means a lower boiling point, but 3-methylpentane (W = 31) boils higher than 2-methylpentane (W = 32), the only exception among this group’s 10 pairs. C₇H₁₆ has more exceptions (8 of 34 pairs). W is only a rough measure of compactness, and other details of shape also affect boiling, so this is a trend, not a law.',

    s4k: 'Step 4 · Change the functional group',
    s4t: 'Both are C₂H₆O, yet ethanol is a liquid and dimethyl ether a gas. Why?',
    s4e: 'This step asks: with exactly the same atoms, how much difference can a different connection make? The group of atoms in a molecule that sets the main behaviour of a family of compounds is called a <strong>functional group</strong>. If the oxygen of C₂H₆O sits at the end of the carbon chain carrying its own hydrogen, it forms –OH (a <strong>hydroxyl group</strong>), and the compound is an <strong>alcohol</strong>, such as ethanol. If the oxygen sits between two carbons (C–O–C), the compound is an <strong>ether</strong>, such as dimethyl ether. Isomers with different functional groups are <strong>functional-group isomers</strong>. In an alcohol, the hydrogen on O–H is attracted to the oxygen of a neighbouring molecule, forming a <strong>hydrogen bond</strong>, much stronger than the van der Waals forces between alkanes (<a class="xlink" href="../../../chemistry/matter/particles-states/#step4">→ States of matter, step 4: in boiling, particles break free of their mutual attraction</a>). An ether has no O–H, so its molecules cannot hydrogen-bond to each other this way.',
    c4: 'Ball-and-stick picture of the selected molecule and a bar chart of the five boiling points',
    lgAlc: 'alcohol (has O–H)', lgEth: 'ether (no O–H)',
    c4bot: 'Boiling point (°C)',
    kind_alcohol: 'alcohol', kind_ether: 'ether',
    r4: '{name} ({kind}): formula counted from the structure {f}, O–H groups {oh}, boiling point {bp} °C. Between the alcohols and ethers with this formula, the boiling points differ by {gap} °C.',
    s4hint: 'What to try: click ethanol, then dimethyl ether. Both formulas, counted from the structure, are C₂H₆O; ethanol’s O–H hydrogen is ringed in cyan and dimethyl ether has none; in the bar chart their boiling points are about 100 °C apart. Then look at the three C₃H₈O molecules: both alcohols (1-propanol and 2-propanol) boil far higher than methoxyethane. Between the two alcohols, 2-propanol, with the hydroxyl in the middle of the chain, is more compact and boils a little lower, matching the trend from the last step.',

    s5k: 'Step 5 · The bond that will not turn',
    s5t: 'Single bonds turn and double bonds do not. What does that have to do with isomers?',
    s5e: 'This step asks: why is butane the same molecule whether its end CH₃ groups are on the same side or opposite sides, while the two arrangements of 2-butene (CH₃–CH=CH–CH₃) are two different substances? If the bond between the two middle carbons is a <strong>single bond</strong>, the ends can rotate around it. The shapes this produces are called <strong>conformations</strong>; at room temperature molecules switch between them constantly, and they do not count as different molecules. A <strong>double bond</strong> has, besides an ordinary bond, a second bond (a π bond) that needs both ends held in one plane; turning means breaking it, which costs a great deal of energy. So 2-butene with both CH₃ groups on the same side, <strong>cis</strong> (boiling point 3.7 °C), and on opposite sides, <strong>trans</strong> (0.9 °C), cannot turn into each other: they are two substances. This is <strong>cis–trans isomerism</strong>. The upper picture is a side view along the middle bond (the rotating end is drawn larger as it swings towards you); the lower graph is the energy for each rotation angle θ. θ = 0° means the two CH₃ groups are on the same side.',
    c5: 'Side view of a molecule turning about its middle bond, with an energy curve',
    lgCH3: 'carbon of an end CH₃', lgCurve: 'energy curve (teaching fit)', lgTried: 'angles tried', lgRT: 'thermal energy scale RT',
    b5s: 'Single bond: butane', b5d: 'Double bond: 2-butene',
    th5: 'rotation about the middle bond θ (°)',
    c5bot: 'Energy (kJ/mol) against θ',
    r5: '{bond}, θ = {th}°: energy {E} kJ/mol (zero when the two CH₃ groups are farthest apart); e^(−E/RT) ≈ {f} (RT = {rt} kJ/mol; roughly the fraction of molecules with that much thermal energy). {state}',
    bondS: 'Single bond (butane)', bondD: 'Double bond (2-butene)',
    stS: 'Single bond: a full turn never costs more than {max} kJ/mol, about {x} times RT. These are just conformations of one molecule, and at room temperature it switches between them all the time.',
    stCis: 'Cis: both CH₃ groups on the same side of the double bond. To become trans it would first have to climb an energy peak of about {max} kJ/mol, about {x} times RT: practically impossible at room temperature.',
    stTrans: 'Trans: the CH₃ groups on opposite sides of the double bond. Becoming cis would mean climbing the same peak of about {max} kJ/mol.',
    stMid: 'The double bond is twisted out of plane: the π bond is broken, the energy is very high, and molecules at room temperature almost never take this shape.',
    s5hint: 'What to try: choose “Single bond: butane” and drag θ from 0° to 360°. In the side view the right-hand CH₃ swings once round the middle bond; the curve below peaks at only 19 kJ/mol, a few times the dashed RT line. Then choose “Double bond: 2-butene” and repeat: the energy axis stretches to 300 kJ/mol, and at 90° the energy is about 267 kJ/mol, over a hundred times RT. The curves are teaching fits that keep only the key heights (butane: 19 on the same side, 3.8 at 60°, 0 opposite; 2-butene: about 265 to break the π bond, cis about 4 above trans), in energy per mole of molecules.',

    s6k: 'Step 6 · Wrap-up', s6t: 'A formula is a parts list; the structure is the identity',
    s6fin: 'Looking back. <strong>Step 0</strong>: compounds with the same molecular formula but different structures are isomers, and they are different substances. <strong>Step 1</strong>: whether two drawings are the same molecule depends on what is bonded to what, not on how it is drawn; the longest chain and the branch positions are good checks. <strong>Step 2</strong>: as carbons are added, the number of isomers grows faster and faster (1, 1, 1, 2, 3, 5, 9, 18, …). <strong>Step 3</strong>: branches make a molecule more compact, weakening the attraction between molecules, so the boiling point broadly falls. <strong>Step 4</strong>: the same atoms can form different functional groups; alcohols have O–H and hydrogen-bond, so they boil far higher than ethers with the same formula. <strong>Step 5</strong>: a double bond cannot rotate, so cis and trans are two substances.',
    formula: 'Isomers: same molecular formula, different structure (connections or arrangement in space)\nAlkanes CₙH₂ₙ₊₂: skeleton counts for n = 1…8 are 1, 1, 1, 2, 3, 5, 9, 18\nsmaller W (more compact) → broadly lower boiling point',
    boundary: 'Scope: step 2 counts only the carbon skeletons of open-chain alkanes; it leaves out rings, double-bond position isomers and chirality (mirror-image isomers), so it counts constitutional isomers. Boiling points are rounded handbook values at 1 atm. The Wiener index is only a rough compactness measure, and step 3 shows its exceptions. The energy curves in step 5 are teaching fits that keep only a few key heights, not exact calculations; e^(−E/RT) indicates an order of magnitude only.',
    linksTitle: 'Where to go next',
    lk1: '→ Molecular shapes, step 0: why carbon’s four bonds point to the corners of a tetrahedron',
    lk2: '→ States of matter, step 4: how particles break free of each other when a liquid boils',
    lk3: '→ Activation energy, step 1: only a small, high-energy fraction of molecules gets over an energy peak',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Isomers · The Same Atoms, Put Together Differently”.',

    iso_butane: 'butane', iso_methylpropane: '2-methylpropane',
    iso_pentane: 'pentane', iso_methylbutane: '2-methylbutane', iso_dimethylpropane: '2,2-dimethylpropane',
    iso_hexane: 'hexane', iso_m2pentane: '2-methylpentane', iso_m3pentane: '3-methylpentane', iso_dm22butane: '2,2-dimethylbutane', iso_dm23butane: '2,3-dimethylbutane',
    iso_heptane: 'heptane', iso_m2hexane: '2-methylhexane', iso_m3hexane: '3-methylhexane', iso_e3pentane: '3-ethylpentane', iso_dm22pentane: '2,2-dimethylpentane', iso_dm23pentane: '2,3-dimethylpentane', iso_dm24pentane: '2,4-dimethylpentane', iso_dm33pentane: '3,3-dimethylpentane', iso_tm223butane: '2,2,3-trimethylbutane',
    fn_ethanol: 'ethanol', fn_dme: 'dimethyl ether', fn_propanol1: '1-propanol', fn_propanol2: '2-propanol', fn_mee: 'methoxyethane'
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
  if (typeof window.refreshIsomers === 'function') window.refreshIsomers();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ISO_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
