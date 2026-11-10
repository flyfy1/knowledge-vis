'use strict';
// Activation-energy lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '活化能 · 反应为什么要先爬坡',
    back: '← 知识索引',
    compare: '对照另一版本：活化能 · 反应要翻过的那座山 →',
    navLabel: '活化能步骤导航',
    tagline: '氢气和氧气混在一起，室温下放很久也看不出反应，一点火却会爆炸——明明生成水要放出大量能量。原因是反应路上横着一座能量山。七步里你会量出这座山，数一数多少次碰撞爬得上去，再看温度和催化剂各自改变了什么、没改变什么。',
    nav0: '0 能量山', nav1: '1 碰撞抽签', nav2: '2 真实的山', nav3: '3 升温', nav4: '4 催化剂', nav5: '5 正反两向', nav6: '6 收束',

    s0k: '第 0 步 · 能量山',
    s0t: '生成物能量更低，反应物为什么不直接滑过去？',
    s0e: '这一步要回答：一个放热反应（生成物的能量比反应物低），为什么不会自己马上发生？看最简单的一类反应 A + B–C → A–B + C：原子 A 要把 C 从 B 身边挤走。上图画三个原子；下图纵轴是这组原子的<strong>势能</strong>（kJ/mol，以反应物为 0），横轴是<strong>反应进程</strong>：从「A 还远、B–C 完好」一路走到「A–B 成键、C 离开」。中途有一个尴尬的时刻：旧键 B–C 已经拉长变弱，新键 A–B 还没长好，两边各连着一半（虚线），这时能量最高，叫<strong>过渡状态</strong>。从反应物爬到过渡状态要多出的能量叫<strong>活化能 Eₐ</strong>；生成物与反应物的能量差叫<strong>反应热 ΔH</strong>（生成物 − 反应物，放热时为负）。',
    xiSlider: '反应进程 ξ（0 = 反应物，1 = 生成物）', eaSlider0: '活化能 Eₐ（kJ/mol）', dhSlider: '反应热 ΔH（kJ/mol）',
    play0: '完整走一遍',
    c0top: '三个原子：A 靠近，B–C 拉长、断开', c0bot: '势能（kJ/mol）沿反应进程',
    s0lgCurve: '势能曲线', s0lgTrail: '走过的路段', s0lgDot: '当前位置', s0lgPartial: '虚线键：只连着一半',
    kindExo: '放热', kindEndo: '吸热', kindZero: '不吸热也不放热',
    s0readout: '反应进程 ξ = {xi}：能量 {E} kJ/mol（相对反应物）。正反应要先爬 Eₐ = {Ea} kJ/mol，再落到 ΔH = {dH} kJ/mol（{kind}）；逆反应从生成物出发，要爬 Eₐ′ = Eₐ − ΔH = {Ear} kJ/mol。',
    s0hint: '观察顺序：先只拖「反应进程」（或按「完整走一遍」），看上图哪根键在断、哪根在连，下图圆点先爬上山顶再滑下。再只拖 Eₐ：山顶升降，两端平台不动。最后拖 ΔH：右端平台升降，逆反应要爬的 Eₐ′ 跟着变。即使 ΔH 很负，圆点也得先爬过 Eₐ。',

    s1k: '第 1 步 · 碰撞抽签',
    s1t: '分子乱撞的时候，有多少次碰撞能爬上这座山？',
    s1e: '这一步要回答：同一温度下碰撞有轻有重，能量够 Eₐ（活化能：爬到过渡状态要多出的能量）的碰撞占几成？反应要靠两个分子相撞，决定能否翻山的是两者<strong>正面对撞</strong>（沿两个分子中心连线方向）的那部分动能，记作碰撞能量 E。分子的运动是随机的，但在温度 T 下，碰撞能量服从一个确定的分布：轻碰撞最多，越重越少，能量每多出 <strong>RT</strong>，这样的碰撞就只剩 1/e（e ≈ 2.718）。RT 是气体常数 R = 8.314 J/(mol·K) 乘以温度，300 K 时约 2.49 kJ/mol，可以当作「热运动的能量尺度」。由这个分布可以算出：能量 ≥ Eₐ 的碰撞恰好占 <strong>p = e^(−Eₐ/RT)</strong>。（课本上先升后降的驼峰曲线画的是单个分子的动能，<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step3">→ 分子动理论第 3 步：速率分布</a>；碰撞的正面能量是这里一路下降的分布。）为了让抽签看得出结果，这一步把门槛设得很低（1–15 kJ/mol），真实的山下一步再看。',
    eaSlider1: 'Eₐ 门槛（kJ/mol，教学用低值）',
    run1: '慢放 200 次碰撞', bulk1: '快进 2000 次', clear1: '清空记录',
    c1top: '最近 40 次碰撞各自的能量（kJ/mol）', c1bot: '累计碰撞次数，按能量每 0.5 kJ/mol 分一组',
    s1lgWin: '能量 ≥ Eₐ：翻过去', s1lgLose: '能量 < Eₐ：退回来', s1lgTheory: '理论分布（按总次数缩放）', s1lgEa: 'Eₐ 门槛',
    s1progress: '慢放中 {c}/{n}。',
    s1empty: '还没有碰撞记录：按「慢放 200 次碰撞」开始抽签（温度 300 K）。理论比例 e^(−Eₐ/RT) = {theo}。',
    s1readout: '{prog}已模拟 {N} 次碰撞（300 K），其中 {s} 次能量 ≥ Eₐ = {Ea} kJ/mol：实测比例 {meas}，理论 e^(−Eₐ/RT) = {theo}。',
    s1hint: '观察顺序：先按「慢放 200 次碰撞」，看上图每根新柱子是绿是灰，下图各组一格格长高；再按几次「快进」，实测比例会贴近理论值（次数越多越贴近）。然后保持记录不动，只拖 Eₐ：碰撞一次也没变，只是门槛线移动、重新划分谁算成功——门槛每升高 RT ≈ 2.49 kJ/mol，成功比例变为原来的 1/e。',

    s2k: '第 2 步 · 真实的山',
    s2t: '活化能真到 50、100 kJ/mol 时，还等得到够劲的碰撞吗？',
    s2e: '这一步要回答：真实反应的 Eₐ（活化能）常在几十到两百 kJ/mol，成功比例 p = e^(−Eₐ/RT)（RT 是热运动的能量尺度，300 K 时约 2.49 kJ/mol）会小到什么程度，反应还能不能发生？光看比例不够，还要看碰撞有多频繁：室温、一个大气压的气体里，一个分子每秒要被撞几十亿次，这里取 <strong>Z = 5×10⁹ 次/秒</strong>（数量级估计）。于是每秒有 Z·p 次够劲的碰撞，<strong>平均等待时间 = 1/(Z·p)</strong>。下图横轴是 Eₐ，纵轴是这个等待时间（秒，对数刻度：相邻两条横线相差 10⁶ 倍）。p 是指数函数，所以在对数刻度上是一条直线：300 K 时 Eₐ 每增加 RT·ln10 ≈ {dec} kJ/mol，等待时间乘以 10。',
    eaSlider2: '活化能 Eₐ（kJ/mol）',
    c2: '一个分子平均要等多久，才遇到一次能量 ≥ Eₐ 的碰撞（300 K）',
    ref1s: '1 秒', ref1y: '1 年', refU: '宇宙年龄',
    s2lgLine: '等待时间 1/(Z·p)', s2lgHist: '你试过的 Eₐ', s2lgRef: '时间参照线',
    unit_ns: '纳秒', unit_us: '微秒', unit_ms: '毫秒', unit_s: '秒', unit_min: '分钟', unit_h: '小时', unit_d: '天', unit_yr: '年', unit_kyr: '千年', unit_Myr: '百万年', unit_Gyr: '十亿年',
    noteFast: '不到 1 秒——这类反应在室温下一混合就进行。',
    noteMid: '要等几秒到几个月——室温下能看到反应在慢慢进行。',
    noteSlow: '要等一年以上——室温下几乎看不出变化，得加热或用催化剂。',
    noteNever: '是宇宙年龄的 {u} 倍——室温下等于不发生。',
    s2readout: 'Eₐ = {Ea} kJ/mol：成功比例 p = {p}；每秒够劲的碰撞 Z·p = {zp} 次；平均等待 {wait}。{note}',
    s2hint: '观察顺序：从 Eₐ = 50 开始，每次把滑杆向右拖约 5–6 kJ/mol，看圆点沿直线爬升一段、等待时间多一个 10 倍。再比较 Eₐ = 50 和 100：山只高了一倍，等待时间却从约 {w50} 变成约 {w100}。白点记下你试过的值。',

    s3k: '第 3 步 · 升温',
    s3t: '只升高 10 K，平均能量才多 3%，为什么反应能快一倍？',
    s3e: '这一步要回答：温度从 T 升到 T + ΔT，碰撞的平均能量和能翻山的比例各变多少？在第 1 步的分布里，碰撞能量的平均值就是 RT（R 是气体常数），所以平均能量只按温度比例增长：300 K → 310 K 只多 3.3%。可成功比例 p = e^(−Eₐ/RT) 取的是分布最远端的尾巴：RT 稍微变大，指数 −Eₐ/RT 就少掉一截，p 是按倍数涨的。浓度不变时，<strong>速率常数 k</strong>（单位浓度下的反应快慢）正比于 p，所以 k 涨的倍数就是 p 涨的倍数（这里忽略了碰撞次数随温度的微小增加：310 K 比 300 K 只多约 1.7%）。上半图对比升温前后的平均能量和成功比例（每对柱子以较长的一根为满格）；下半图横轴是 Eₐ，纵轴是升温后 k 变成原来的几倍（对数刻度）（<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step2">→ 反应速率第 2 步：用粒子数看温度的作用</a>）。',
    tSlider3: '起始温度 T（K）', dtSlider3: '升温 ΔT（K）', eaSlider3: '活化能 Eₐ（kJ/mol）',
    c3top: '升温前后对比', barMean: '平均碰撞能量 RT', barFrac: '能量 ≥ Eₐ 的碰撞比例 p',
    c3bot: 'k(T + ΔT) ÷ k(T)：随 Eₐ 怎样变（对数刻度）',
    s3lgT: '温度 T', s3lgT2: '温度 T + ΔT', s3lgCurve: '倍数曲线', s3lgHist: '你试过的 Eₐ', s3lgTwo: '×2 参照线',
    s3readout: '{T} K → {T2} K：平均碰撞能量 ×{mr}（{m1} → {m2} kJ/mol）；Eₐ = {Ea} kJ/mol 时成功比例 {p1} → {p2}，k 变为原来的 {r} 倍。',
    s3hint: '观察顺序：保持 T = 300 K、ΔT = 10 K，只拖 Eₐ，看下半图圆点沿直线移动，找出 k 恰好 ×2 的位置。再把起始温度换成 450 K 重复：同样升 10 K，倍数变小了。所以「升温 10 K 速率翻倍」只是室温附近、Eₐ 约 50 kJ/mol 时的粗略经验，不是定律。',
    quizPrompt: '小测：300 K 附近升温 10 K，速率恰好翻倍。用上面的图找一找，这个反应的 Eₐ 大约是多少？',
    quizA: '约 5 kJ/mol', quizB: '约 54 kJ/mol', quizC: '约 540 kJ/mol', check: '核对',
    correct: '对。300 K 时 Eₐ ≈ {ea2} kJ/mol 正好让 e^(−Eₐ/RT) 在升温 10 K 后翻倍；Eₐ 越大，同样的升温带来的倍数越大。',
    wrong: '再拖一下 Eₐ（保持 300 K、ΔT = 10 K）：下半图圆点落在 ×2 参照线上时，读数里的 Eₐ 是多少？',

    s4k: '第 4 步 · 催化剂',
    s4t: '催化剂让反应变快，它改了这座山的哪一部分？',
    s4e: '这一步要回答：加入催化剂后，反应快多少？最后生成物占的比例变不变？催化剂参加反应、最后又原样复原，它提供了另一条路线：先和反应物结合成<strong>中间产物</strong>，再分解出生成物（上图绿线：两座矮山）。新路线的最高点比原来低 ΔEₐ（简化：一条路线有多快只看它的最高点），起点和终点没有动，所以 ΔH（反应热：生成物与反应物的能量差）不变。速率常数写成 <strong>k = A·e^(−Eₐ/RT)</strong>：e^(−Eₐ/RT) 是第 1 步的成功比例，<strong>A 叫指前因子</strong>，把比例换算成每秒的速率，这里假设两条路线相同，取 10¹³ 次/秒。Eₐ 降低 ΔEₐ，k 就乘以 e^(ΔEₐ/RT)，正反应和逆反应乘的是同一个倍数。下图是反应物放进容器后，生成物所占比例随时间的变化（时间轴为对数刻度，相邻两格相差 100 倍）（<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step4">→ 反应速率第 4 步：用粒子碰撞看催化剂</a>）。设定：一步反应 反应物 ⇌ 生成物，Eₐ = 100 kJ/mol，ΔH = −8 kJ/mol，300 K。',
    dropSlider: '催化路线的最高点降低 ΔEₐ（kJ/mol）',
    run4: '从 t = 0 开始计时',
    c4top: '两条路线的势能（kJ/mol）', c4bot: '生成物所占比例（时间：秒，对数刻度）',
    s4lgNo: '无催化剂', s4lgCat: '有催化剂', s4lgEq: '平衡时的比例', s4lgNow: '当前时刻',
    s4progress: '计时中：t = {t} 秒。',
    s4readout: '{prog}有催化剂时 k 变为原来的 e^(ΔEₐ/RT) = {f} 倍。半程时间（生成物达到平衡比例一半所需的时间）：无催化剂 {h0}，有催化剂 {h1}。平衡时生成物占比：无催化剂 {x0}，有催化剂 {x1}——一样。',
    s4hint: '观察顺序：先按「从 t = 0 开始计时」，看两条曲线谁先爬升、最后是否停在同一条虚线上。再拖 ΔEₐ：上图绿线的山顶下降，下图绿线整体向左平移——在对数时间轴上，「快 N 倍」就是向左平移同样的距离，形状和终点都不变。ΔEₐ = 0 时，两条路线最高点一样高，下图两条曲线重合。',

    s5k: '第 5 步 · 正反两个方向',
    s5t: '同一座山从两边爬，升温时哪个方向占便宜？',
    s5e: '这一步要回答：正反应要爬 Eₐ，逆反应从生成物出发要爬 Eₐ′ = Eₐ − ΔH（ΔH 是反应热），升温时两边的速率常数各增加多少？两边都按 k = A·e^(−活化能/RT) 计算（A 是指前因子，两边取同样的 10¹³ 次/秒）。两者之比 <strong>K = k正 / k逆 = e^(−ΔH/RT)</strong> 决定平衡时生成物与反应物的比例：在这个简化模型里 K 只取决于 ΔH 和温度，与山多高无关。下半图纵轴是 k（每秒，对数刻度），横轴是温度：一条线越陡，这个方向对温度越敏感，而陡度正比于它要爬的活化能（<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step3">→ 化学平衡第 3 步：温度改变时平衡怎么移</a>）。',
    eaSlider5: 'Eₐ（正反应活化能，kJ/mol）', tSlider5: '温度 T（K）',
    c5top: '能量山：正反应爬 Eₐ，逆反应爬 Eₐ′', c5bot: '速率常数 k 随温度（每秒，对数刻度）',
    s5lgF: 'k正：正反应', s5lgR: 'k逆：逆反应', s5lgNow: '当前温度下的值', s5lgBase: '300 K 时的值',
    whoF: '正反应（吸热方向）涨得更多，平衡向生成物一侧移动',
    whoR: '逆反应（吸热方向）涨得更多，平衡向反应物一侧移动',
    whoEq: 'ΔH = 0，两边涨的倍数相同，平衡不移动',
    whoNone: '还在 300 K，拖动温度滑杆看看两边怎么变',
    s5readout: 'T = {T} K：k正 = {kf} /秒，k逆 = {kr} /秒，K = k正/k逆 = {K}（Eₐ′ = {Ear} kJ/mol）。从 300 K 升到 {T} K：k正 ×{gf}，k逆 ×{gr}，{who}。',
    s5hint: '观察顺序：先保持 ΔH = −30（放热），拖温度：两条线都上升，橙线（逆反应，要爬的山更高）更陡，所以 K 变小，平衡向反应物一侧移动。再把 ΔH 拖到正值（吸热），更陡的变成青线。最后只拖 Eₐ：两条线一起上下移动，它们的竖直间距（就是 K）不变——山的高度只管快慢，不管终点。',

    s6k: '第 6 步 · 收束',
    s6t: '把这座山带走',
    s6fin: '能量山回答了「为什么能量上合算的反应也可以很慢」：反应必须先经过能量最高的过渡状态。碰撞能量 ≥ Eₐ 的比例是 <strong>e^(−Eₐ/RT)</strong>，再乘以碰撞频率就是速率。由此：<br>• 300 K 时 Eₐ 每高 {dec} kJ/mol，反应慢 10 倍；<br>• 升温让分布的尾巴变厚，Eₐ 越大对温度越敏感；<br>• 催化剂换一条更矮的路，正逆反应同倍加速，终点不变；<br>• 平衡比例 K = e^(−ΔH/RT) 由两端高度差决定，与山多高无关。',
    formula: 'p = e^(−Eₐ/RT)\nk = A·e^(−Eₐ/RT)\nK = k正 / k逆 = e^(−ΔH/RT)',
    boundary: '适用范围：一步完成的反应和简单碰撞模型（不考虑碰撞方向、量子隧穿，A 当作不随温度变化的常数）。K = e^(−ΔH/RT) 假设两个方向的 A 相同、忽略了熵变，真实的平衡常数还取决于 ΔS。页面上的数值都是这个模型算出来的，不是某个具体反应的实测值；Z = 5×10⁹ 次/秒、A = 10¹³ 次/秒是数量级假设。',
    linksTitle: '接着看',
    lk1: '反应速率 · 第 0 步：碰上也不一定成——数一数成功碰撞 →',
    lk2: '反应速率 · 第 4 步：催化剂把门槛降下来 →',
    lk3: '化学平衡 · 第 3 步：温度改变时平衡往哪边移 →',
    lk4: '分子动理论 · 第 3 步：碰撞把速率洗成钟形分布 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《活化能 · 反应要翻过的那座山》的平行版本。'
  },
  en: {
    pageTitle: 'Activation Energy · Why Reactions Climb Before They Fall',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Activation Energy · The Hill a Reaction Has to Climb →',
    navLabel: 'Activation energy steps',
    tagline: 'Mix hydrogen and oxygen at room temperature and nothing visible happens for a very long time; add a spark and it explodes — even though making water releases a lot of energy. Something stands in the way: an energy hill. In seven steps you will measure that hill, count how many collisions make it over, and see what temperature and catalysts change, and what they leave alone.',
    nav0: '0 The hill', nav1: '1 Collision lottery', nav2: '2 Real hills', nav3: '3 Heating', nav4: '4 Catalyst', nav5: '5 Both directions', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The energy hill',
    s0t: 'If the products sit lower, why don’t the reactants just slide down?',
    s0e: 'The question here: an exothermic reaction ends lower in energy than it starts, so why doesn’t it simply happen on its own? Take the simplest kind of reaction, A + B–C → A–B + C, where atom A pushes C away from B. The top panel shows the three atoms. The bottom panel plots their <strong>potential energy</strong> (kJ/mol, measured from the reactants) against the <strong>reaction coordinate</strong>, which runs from “A far away, B–C intact” to “A–B bonded, C leaving”. Halfway there is an awkward moment: the old B–C bond is stretched and weak, the new A–B bond is not yet formed, and each is only half there (dashed). That is the highest-energy point, the <strong>transition state</strong>. The extra energy needed to climb from the reactants to it is the <strong>activation energy Eₐ</strong>. The energy difference between products and reactants is the <strong>reaction enthalpy ΔH</strong> (products minus reactants, negative when heat is released).',
    xiSlider: 'Reaction coordinate ξ (0 = reactants, 1 = products)', eaSlider0: 'Activation energy Eₐ (kJ/mol)', dhSlider: 'Reaction enthalpy ΔH (kJ/mol)',
    play0: 'Run the whole reaction',
    c0top: 'Three atoms: A moves in, B–C stretches and breaks', c0bot: 'Potential energy (kJ/mol) along the reaction',
    s0lgCurve: 'Energy profile', s0lgTrail: 'Ground covered', s0lgDot: 'Where you are', s0lgPartial: 'Dashed bond: half formed',
    kindExo: 'exothermic', kindEndo: 'endothermic', kindZero: 'thermoneutral',
    s0readout: 'Reaction coordinate ξ = {xi}: energy {E} kJ/mol above the reactants. The forward reaction must first climb Eₐ = {Ea} kJ/mol, then drops to ΔH = {dH} kJ/mol ({kind}). Going backwards from the products, the climb is Eₐ′ = Eₐ − ΔH = {Ear} kJ/mol.',
    s0hint: 'What to watch: first drag only the reaction coordinate (or press “Run the whole reaction”) and see in the top panel which bond breaks and which forms, while the dot in the bottom panel climbs to the summit and slides down. Then drag only Eₐ: the summit moves, both plateaus stay put. Finally drag ΔH: the right plateau moves, and so does the reverse climb Eₐ′. However negative ΔH gets, the dot still has to get over Eₐ first.',

    s1k: 'Step 1 · The collision lottery',
    s1t: 'Molecules collide at random — how many collisions make it over the hill?',
    s1e: 'The question here: at a given temperature some collisions are gentle and some are violent. What share carry at least Eₐ (the activation energy, the extra energy needed to reach the transition state)? A reaction needs two molecules to collide, and what decides whether they get over the hill is the kinetic energy of the <strong>head-on part</strong> of the impact (along the line joining their centres). Call it the collision energy E. Molecular motion is random, but at temperature T the collision energies follow a definite distribution: gentle hits are the most common, harder ones are rarer, and every extra <strong>RT</strong> of energy cuts their share to 1/e (e ≈ 2.718). RT is the gas constant R = 8.314 J/(mol·K) times the temperature — about 2.49 kJ/mol at 300 K, the natural energy scale of thermal motion. From that distribution the share of collisions with E ≥ Eₐ comes out as exactly <strong>p = e^(−Eₐ/RT)</strong>. (The hump-shaped curve in textbooks is the kinetic energy of single molecules, <a class="xlink" href="../../../physics/thermal/kinetic-theory/#step3">→ kinetic theory, step 3: the speed distribution</a>; the head-on collision energy follows the steadily falling curve used here.) So that the lottery produces visible winners, this step uses very low thresholds (1–15 kJ/mol); real hills come next.',
    eaSlider1: 'Threshold Eₐ (kJ/mol, kept low for the demo)',
    run1: 'Play 200 collisions slowly', bulk1: 'Fast-forward 2000', clear1: 'Clear the record',
    c1top: 'Energy of each of the last 40 collisions (kJ/mol)', c1bot: 'All collisions so far, grouped in 0.5 kJ/mol bins',
    s1lgWin: 'E ≥ Eₐ: gets over', s1lgLose: 'E < Eₐ: falls back', s1lgTheory: 'Predicted distribution (scaled to the count)', s1lgEa: 'Threshold Eₐ',
    s1progress: 'Playing {c}/{n}. ',
    s1empty: 'No collisions yet: press “Play 200 collisions slowly” to start the lottery (300 K). Predicted share e^(−Eₐ/RT) = {theo}.',
    s1readout: '{prog}{N} collisions simulated at 300 K; {s} of them had E ≥ Eₐ = {Ea} kJ/mol. Measured share {meas}; predicted e^(−Eₐ/RT) = {theo}.',
    s1hint: 'What to watch: press “Play 200 collisions slowly” and see each new bar in the top panel come out green or grey while the bins below grow. Fast-forward a few times and the measured share closes in on the prediction (more collisions, closer match). Then leave the record alone and drag only Eₐ: not a single collision changes — the threshold just moves and re-sorts winners from losers. Each RT ≈ 2.49 kJ/mol you add to the threshold divides the winning share by e.',

    s2k: 'Step 2 · Real hills',
    s2t: 'With Eₐ at 50 or 100 kJ/mol, does a hard-enough collision ever come along?',
    s2e: 'The question here: real activation energies run from a few tens to a couple of hundred kJ/mol. How small does the winning share p = e^(−Eₐ/RT) get (RT is the thermal energy scale, about 2.49 kJ/mol at 300 K), and can the reaction still happen? The share alone is not enough; you also need to know how often collisions happen. In a gas at room temperature and one atmosphere, each molecule is hit billions of times a second; we take <strong>Z = 5×10⁹ per second</strong> (an order-of-magnitude estimate). That gives Z·p hard-enough collisions per second, so the <strong>average wait = 1/(Z·p)</strong>. Below, Eₐ runs along the bottom and that wait runs up the side (seconds, log scale: neighbouring grid lines differ by a factor of 10⁶). Because p is an exponential, it plots as a straight line: at 300 K every extra RT·ln10 ≈ {dec} kJ/mol of Eₐ makes the wait ten times longer.',
    eaSlider2: 'Activation energy Eₐ (kJ/mol)',
    c2: 'Average wait for one collision with E ≥ Eₐ, per molecule (300 K)',
    ref1s: '1 second', ref1y: '1 year', refU: 'Age of the universe',
    s2lgLine: 'Wait 1/(Z·p)', s2lgHist: 'Eₐ values you tried', s2lgRef: 'Time markers',
    unit_ns: 'ns', unit_us: 'μs', unit_ms: 'ms', unit_s: 's', unit_min: 'min', unit_h: 'h', unit_d: 'days', unit_yr: 'years', unit_kyr: 'thousand years', unit_Myr: 'million years', unit_Gyr: 'billion years',
    noteFast: 'Under a second: reactions like this go as soon as the reactants are mixed at room temperature.',
    noteMid: 'Seconds to months: you can watch it creep along at room temperature.',
    noteSlow: 'Over a year: at room temperature nothing seems to happen; it needs heat or a catalyst.',
    noteNever: 'That is {u} times the age of the universe: at room temperature it simply does not happen.',
    s2readout: 'Eₐ = {Ea} kJ/mol: winning share p = {p}; hard-enough collisions per second Z·p = {zp}; average wait {wait}. {note}',
    s2hint: 'What to watch: start at Eₐ = 50 and move the slider right about 5–6 kJ/mol at a time; the dot climbs one notch along the line and the wait grows tenfold. Then compare Eₐ = 50 with 100: the hill only doubles, but the wait goes from about {w50} to about {w100}. White dots remember the values you tried.',

    s3k: 'Step 3 · Heating',
    s3t: 'Ten kelvin adds only 3% to the average energy — so why can the rate double?',
    s3e: 'The question here: going from T to T + ΔT, how much do the average collision energy and the winning share each change? In step 1’s distribution the average collision energy is exactly RT (R is the gas constant), so it grows only in proportion to temperature: 300 K → 310 K adds just 3.3%. The winning share p = e^(−Eₐ/RT), though, sits in the far tail. Make RT slightly bigger and the exponent −Eₐ/RT shrinks by a chunk, so p grows by a factor. At fixed concentrations the <strong>rate constant k</strong> (how fast the reaction runs per unit concentration) is proportional to p, so k grows by the same factor (we ignore the small rise in collision frequency: about 1.7% from 300 K to 310 K). The top half compares average energy and winning share before and after heating (each pair is scaled to its longer bar); the bottom half plots, against Eₐ, how many times larger k becomes (log scale) (<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step2">→ reaction rates, step 2: temperature seen through particles</a>).',
    tSlider3: 'Starting temperature T (K)', dtSlider3: 'Temperature rise ΔT (K)', eaSlider3: 'Activation energy Eₐ (kJ/mol)',
    c3top: 'Before and after heating', barMean: 'Average collision energy RT', barFrac: 'Share of collisions with E ≥ Eₐ, p',
    c3bot: 'k(T + ΔT) ÷ k(T) as Eₐ changes (log scale)',
    s3lgT: 'Temperature T', s3lgT2: 'Temperature T + ΔT', s3lgCurve: 'Rate factor', s3lgHist: 'Eₐ values you tried', s3lgTwo: '×2 reference',
    s3readout: '{T} K → {T2} K: average collision energy ×{mr} ({m1} → {m2} kJ/mol); at Eₐ = {Ea} kJ/mol the winning share goes {p1} → {p2}, so k becomes {r} times larger.',
    s3hint: 'What to watch: keep T = 300 K and ΔT = 10 K, drag only Eₐ, and follow the dot along the line in the bottom half until k is exactly ×2. Then set the starting temperature to 450 K and repeat: the same 10 K now buys a smaller factor. “Ten degrees doubles the rate” is a rough rule for room temperature and Eₐ near 50 kJ/mol, not a law.',
    quizPrompt: 'Quick check: near 300 K, heating by 10 K exactly doubles the rate. Use the plot above — roughly what is Eₐ?',
    quizA: 'About 5 kJ/mol', quizB: 'About 54 kJ/mol', quizC: 'About 540 kJ/mol', check: 'Check',
    correct: 'Right. At 300 K, Eₐ ≈ {ea2} kJ/mol is what makes e^(−Eₐ/RT) double after a 10 K rise; larger Eₐ gives a bigger factor for the same heating.',
    wrong: 'Drag Eₐ again (keeping 300 K and ΔT = 10 K): when the dot in the bottom half sits on the ×2 line, what does the readout say Eₐ is?',

    s4k: 'Step 4 · Catalysts',
    s4t: 'A catalyst speeds things up — which part of the hill does it change?',
    s4e: 'The question here: with a catalyst, how much faster does the reaction go, and does the final share of products change? A catalyst takes part in the reaction and comes out unchanged. It opens a different route: first it binds the reactant to form an <strong>intermediate</strong>, which then breaks down into products (green line in the top panel: two lower hills). The new route’s highest point is ΔEₐ lower (simplification: a route’s speed is set by its highest point alone), while the start and end levels have not moved, so ΔH (the reaction enthalpy, products minus reactants) is unchanged. Write the rate constant as <strong>k = A·e^(−Eₐ/RT)</strong>: e^(−Eₐ/RT) is step 1’s winning share, and <strong>A, the pre-exponential factor</strong>, turns that share into a rate per second; here both routes use the same A = 10¹³ per second. Lower Eₐ by ΔEₐ and k is multiplied by e^(ΔEₐ/RT) — the same factor for the forward and the reverse reaction. The bottom panel follows the share of products after the reactant is put in the vessel (time on a log scale: neighbouring grid lines differ by 100×) (<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step4">→ reaction rates, step 4: catalysts seen through collisions</a>). Set-up: one-step reaction reactant ⇌ product, Eₐ = 100 kJ/mol, ΔH = −8 kJ/mol, 300 K.',
    dropSlider: 'Catalysed route lowers the summit by ΔEₐ (kJ/mol)',
    run4: 'Start the clock at t = 0',
    c4top: 'Potential energy along both routes (kJ/mol)', c4bot: 'Share of products (time in seconds, log scale)',
    s4lgNo: 'No catalyst', s4lgCat: 'With catalyst', s4lgEq: 'Share at equilibrium', s4lgNow: 'Current time',
    s4progress: 'Clock running: t = {t} s. ',
    s4readout: '{prog}The catalyst multiplies k by e^(ΔEₐ/RT) = {f}. Half-time (time to reach half the equilibrium share): {h0} without the catalyst, {h1} with it. Product share at equilibrium: {x0} without, {x1} with — the same.',
    s4hint: 'What to watch: press “Start the clock at t = 0” and see which curve rises first and whether both end on the same dashed line. Then drag ΔEₐ: the green summit in the top panel drops, and the green curve below slides left as a whole. On a log time axis, “N times faster” is a fixed sideways shift; shape and end point stay the same. At ΔEₐ = 0 both routes peak at the same height and the two curves coincide.',

    s5k: 'Step 5 · Both directions',
    s5t: 'The same hill climbed from both sides — which direction gains more from heating?',
    s5e: 'The question here: the forward reaction climbs Eₐ; starting from the products, the reverse reaction climbs Eₐ′ = Eₐ − ΔH (ΔH is the reaction enthalpy). How much does each rate constant grow when you heat? Both use k = A·e^(−activation energy/RT) (A is the pre-exponential factor, the same 10¹³ per second for both). Their ratio <strong>K = k_f / k_r = e^(−ΔH/RT)</strong> sets the ratio of products to reactants at equilibrium; in this simple model K depends only on ΔH and temperature, not on how tall the hill is. The bottom half plots k (per second, log scale) against temperature: the steeper a line, the more that direction responds to heat, and its steepness is proportional to the activation energy it has to climb (<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step3">→ chemical equilibrium, step 3: which way equilibrium moves with temperature</a>).',
    eaSlider5: 'Eₐ (forward activation energy, kJ/mol)', tSlider5: 'Temperature T (K)',
    c5top: 'The hill: forward climbs Eₐ, reverse climbs Eₐ′', c5bot: 'Rate constant k vs temperature (per second, log scale)',
    s5lgF: 'k_f: forward', s5lgR: 'k_r: reverse', s5lgNow: 'Values at the current temperature', s5lgBase: 'Values at 300 K',
    whoF: 'the forward (endothermic) direction gains more, so equilibrium shifts toward the products',
    whoR: 'the reverse (endothermic) direction gains more, so equilibrium shifts toward the reactants',
    whoEq: 'with ΔH = 0 both gain by the same factor and equilibrium stays put',
    whoNone: 'still at 300 K — drag the temperature slider to see how each side changes',
    s5readout: 'T = {T} K: k_f = {kf} /s, k_r = {kr} /s, K = k_f/k_r = {K} (Eₐ′ = {Ear} kJ/mol). From 300 K to {T} K: k_f ×{gf}, k_r ×{gr}; {who}.',
    s5hint: 'What to watch: keep ΔH = −30 (exothermic) and drag the temperature. Both lines rise, but the orange one (reverse, the taller climb) is steeper, so K falls and equilibrium shifts toward the reactants. Now drag ΔH to a positive (endothermic) value: the cyan line becomes the steeper one. Finally drag only Eₐ: both lines move up or down together and the vertical gap between them (that gap is K) stays the same. The height of the hill sets the speed, not the destination.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What to take away',
    s6fin: 'The energy hill explains why a reaction that pays off in energy can still be slow: it must pass through the highest-energy transition state first. The share of collisions with E ≥ Eₐ is <strong>e^(−Eₐ/RT)</strong>, and multiplying by the collision rate gives the reaction rate. So:<br>• at 300 K, every extra {dec} kJ/mol of Eₐ makes the reaction ten times slower;<br>• heating fattens the tail of the distribution, and the bigger Eₐ, the stronger the effect;<br>• a catalyst opens a lower route, speeds both directions by the same factor and leaves the end point alone;<br>• the equilibrium ratio K = e^(−ΔH/RT) is set by the height difference between the two ends, not by the hill.',
    formula: 'p = e^(−Eₐ/RT)\nk = A·e^(−Eₐ/RT)\nK = k_f / k_r = e^(−ΔH/RT)',
    boundary: 'Where this holds: one-step reactions in the simple collision model (no collision orientation, no quantum tunnelling, A treated as independent of temperature). K = e^(−ΔH/RT) assumes the same A in both directions and ignores entropy; real equilibrium constants also depend on ΔS. Every number on this page comes from that model, not from measurements on a particular reaction; Z = 5×10⁹ per second and A = 10¹³ per second are order-of-magnitude assumptions.',
    linksTitle: 'Where to next',
    lk1: 'Reaction rates · step 0: a hit is not always a success — counting good collisions →',
    lk2: 'Reaction rates · step 4: a catalyst lowers the bar →',
    lk3: 'Chemical equilibrium · step 3: which way equilibrium moves when temperature changes →',
    lk4: 'Kinetic theory · step 3: collisions shuffle speeds into a skewed bell →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Activation Energy · The Hill a Reaction Has to Climb”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
// Values computed by the model that appear inside static paragraphs.
const STATIC_PARAMS = {};
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  const all = Object.assign({}, STATIC_PARAMS, params);
  Object.keys(all).forEach(name => { if (text.indexOf(`{${name}}`) < 0) return; const v = typeof all[name] === 'function' ? all[name]() : all[name]; text = text.split(`{${name}}`).join(String(v)); });
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
  if (typeof window.refreshActivation === 'function') window.refreshActivation();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.AE_I18N = { t, setLang, getLang: () => lang, STATIC_PARAMS };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
