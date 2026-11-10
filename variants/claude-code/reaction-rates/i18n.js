'use strict';
// Reaction-rates lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const LINK = {
  act0: '../../../chemistry/reactions/activation-energy/#step0',
  act2: '../../../chemistry/reactions/activation-energy/#step2',
  act3: '../../../chemistry/reactions/activation-energy/#step3',
  ps1: '../../../chemistry/matter/particles-states/#step1',
  kt3: '../../../physics/thermal/kinetic-theory/#step3',
  eq1: '../../../chemistry/reactions/chemical-equilibrium/#step1'
};
const a = (k, text) => `<a class="xlink" href="${LINK[k]}">${text}</a>`;

const STRINGS = {
  zh: {
    pageTitle: '反应速率 · 碰撞次数 × 成功比例',
    back: '← 知识索引',
    compare: '对照另一版本：反应速率 · 数一数成功碰撞 →',
    navLabel: '反应速率步骤导航',
    tagline: '反应 A + B → 产物，要先让一个 A 撞上一个 B，而且撞得够狠。所以每秒反应几次 = 每秒碰撞几次 × 其中成功的比例。浓度、温度、催化剂、表面积这四种提速办法，各自改的是乘法里的哪一项？下面在一个分子盒子里逐项数给你看。',
    nav0: '0 成功碰撞', nav1: '1 浓度', nav2: '2 温度', nav3: '3 催化剂', nav4: '4 表面积', nav5: '5 真实的数', nav6: '6 收束',

    s0k: '第 0 步 · 成功碰撞',
    s0t: '分子撞上了，就一定会反应吗？',
    s0e: '这一步要回答：反应的快慢，到底由什么决定？下面的盒子里有 30 个 A 分子（青色）和 30 个 B 分子（橙色），在 300 K 下不停乱跑、互相碰撞。A 与 B 相撞时，看两者沿连心线相向而行那部分运动的动能，叫它<strong>碰撞能量</strong>（擦边而过的碰撞，这部分很小）。只有碰撞能量达到某个门槛，旧化学键才能断开、生成产物，这个门槛就是<strong>活化能</strong>（' + a('act0', '→ 活化能页第 0 步：反应要翻过的能量山') + '）。本页把门槛定为 2.0（单位是 300 K 时的 kT，即这个温度下分子热运动能量的典型大小）。于是：<strong>反应速率</strong>（每秒成功碰撞的次数）= 每秒 A–B 碰撞次数 × 成功比例。为了让浓度保持不变、速率可以一直测下去，成功的碰撞只记一笔，两个分子留在盒中，相当于产物被及时取走、同时补进了新的反应物。',
    c0box: '盒中分子（教学慢放）',
    c0bars: '每秒 A–B 碰撞次数（绿色 = 成功的） · 横轴：时间（秒）',
    lgA: 'A 分子', lgB: 'B 分子', lgOk: '绿色闪圈 = 成功碰撞', lgFail: '灰色闪圈 = 能量不足，弹开',
    lgBarAll: '每秒碰撞次数', lgBarOk: '其中成功的次数',
    pause: '暂停', resume: '继续', advance: '前进 5 秒', reset0: '清零重数',
    s0readout: '已数 {t} 秒：A–B 碰撞 {c} 次，其中成功 {o} 次（成功比例 {f}）。平均每秒碰撞 {cr} 次、成功 {or} 次。按公式：门槛 2.0、300 K 时成功比例应为 {ft}。',
    s0hint: '观察顺序：先盯住盒子，大多数 A–B 碰撞只闪一下灰圈就弹开，偶尔才闪绿圈。再看「每秒碰撞次数」柱状图：每根柱子是一秒，整根是这一秒的碰撞次数，绿色部分是成功的次数——绿色一直只占一小截。运行越久，成功比例越稳定，逐渐接近公式值。时间是教学慢放，真实气体里每秒碰撞要多出许多个数量级。',

    s1k: '第 1 步 · 浓度',
    s1t: 'A 和 B 都多一倍，成功碰撞会多几倍？',
    s1e: '这一步要回答：只改分子数（盒子大小、温度、门槛都不变），乘法里哪一项变？在固定体积里，分子数多就是<strong>浓度</strong>高。一个 A 每秒撞上 B 的次数与 B 的数目成正比，而这样的 A 有 N_A 个，所以每秒 A–B 碰撞次数 ∝ N_A × N_B；每次碰撞的能量分布只看温度，所以成功比例不变。「每秒 A–B 碰撞次数」散点图的横轴是 N_A × N_B，纵轴是每秒碰撞次数：每个点是你试过的一种分子数下的实测平均（停留越久越准），灰色直线是稀薄气体的碰撞频率公式。',
    c1chart: '每秒 A–B 碰撞次数 · 横轴：N_A × N_B',
    lgPts: '实测平均（每种分子数一个点）', lgPts2: '实测平均（每个温度一个点）', lgPts3: '实测平均（每个门槛一个点）', lgTheoryZ: '碰撞频率公式（稀薄气体）', lgNowPt: '当前分子数',
    nLabel: 'A、B 各有几个分子',
    s1readout: 'A、B 各 {n} 个（N_A × N_B = {nn}）：已测 {t} 秒，每秒碰撞 {cr} 次（公式 {zt}），成功比例 {f}，每秒成功 {or} 次。',
    s1hint: '观察顺序：先在 20 停几秒，再拖到 40，看盒子明显变挤、闪圈变密；散点图上新点落在同一条斜线上，而读数里的成功比例基本不变。多试几个分子数：点越来越多，都沿着直线排开。分子很挤时实测点会略高于公式线——公式假设分子很小、彼此不占地方。',
    quizPrompt: '小测：B 的数目不变，只把 A 增加到原来的 2 倍，每秒成功碰撞变为原来的几倍？',
    quizA: '4 倍', quizB: '2 倍', quizC: '不变，因为成功比例没变',
    check: '检查答案',
    quizRight: '对。碰撞次数 ∝ N_A × N_B，只翻倍其中一个因子，碰撞次数就翻倍；成功比例不变，所以成功次数也是 2 倍。',
    quizWrong: '再想想：碰撞次数 ∝ N_A × N_B。A、B 都翻倍才是 4 倍；只翻倍 A，乘积只翻倍。成功比例不变，所以成功次数跟着碰撞次数走。',
    quizNone: '先选一个选项。',

    s2k: '第 2 步 · 温度',
    s2t: '升温之后，分子撞得更勤，还是撞得更狠？',
    s2e: '这一步要回答：温度改的是乘法里的哪一项？<strong>温度</strong>衡量分子热运动的激烈程度：温度越高，分子平均动能越大（' + a('ps1', '→ 粒子与物态页第 1 步：温度就是粒子有多热闹') + '）。升温有两个效果。其一，分子跑得快，单位时间扫过的地方多，碰撞次数随 √T 增加——从 300 K 升到 600 K 只多约 41%。其二，碰撞能量整体变大，越过门槛的比例按 e^(−门槛 / kT) 增加，这一项涨得快得多。「碰撞能量分布」直方图统计最近 600 次 A–B 碰撞各自的碰撞能量：橙色竖线是门槛，竖线右侧（绿色）就是成功的碰撞；白色曲线是理论分布（' + a('kt3', '→ 气体动理论页第 3 步：分子速率的分布') + '）。「成功比例」图的横轴是温度：曲线是公式，点是你试过的各个温度下的实测值。',
    c2hist: '最近 600 次碰撞的碰撞能量分布 · 横轴：碰撞能量（kT₃₀₀）',
    c2frac: '成功比例 · 横轴：温度（K）',
    lgHistFail: '能量不足的碰撞', lgHistOk: '越过门槛的碰撞', lgDist: '理论分布', lgBar: '门槛（活化能）', lgCurveF: '成功比例公式 e^(−门槛/kT)',
    tLabel: '温度 T',
    s2readout: 'T = {T} K（由分子平均动能读出 {Tm} K）：已测 {t} 秒，每秒碰撞 {cr} 次、成功比例 {f}（公式 {ft}）。与 300 K 相比，按公式碰撞次数 ×{zr}、成功比例 ×{fr}，成功次数 ×{rr}。',
    s2hint: '观察顺序：先在 300 K 停几秒，看直方图里竖线右侧只有一小截绿色。再拖到 500 K：盒中分子明显变快，直方图整体向右摊开，绿色部分变厚；「成功比例」图上的新点沿曲线上升。读数里对比两个倍数：碰撞次数只涨一点，成功比例涨得多。',

    s3k: '第 3 步 · 催化剂',
    s3t: '催化剂没让分子跑得更快，反应为什么也变快了？',
    s3e: '这一步要回答：<strong>催化剂</strong>改的是乘法里的哪一项？催化剂让反应换一条中间步骤不同的路径走，这条路要越过的门槛更低（' + a('act3', '→ 活化能页第 3 步：催化剂怎样降低能量山') + '）。它不提高温度，所以分子的速度分布、碰撞次数都不变；变的只有门槛的位置。本步温度固定在 300 K。直方图和上一步一样，但这次动的是橙色竖线（门槛），灰色虚线标出原来的门槛 2.0。「成功比例」图的横轴换成了门槛高度。模拟里「降门槛」是直接改判定标准，代表催化剂的效果，并没有画出催化剂分子本身。',
    c3frac: '成功比例 · 横轴：门槛（kT₃₀₀）',
    lgOldBar: '原来的门槛 2.0',
    e0Label: '门槛（活化能）',
    noCat: '无催化剂（门槛 2.0）', withCat: '加催化剂（门槛 1.0）',
    s3readout: '门槛 = {e0}（T = 300 K）：已测 {t} 秒，每秒碰撞 {cr} 次、成功比例 {f}（公式 {ft}），每秒成功 {or} 次。分子平均速率 {v}（300 K 时的理论值 {v0}，模型单位/秒），与门槛高低无关。与门槛 2.0 相比，成功次数 ×{rr}。',
    s3hint: '观察顺序：先按「无催化剂」停几秒，记下成功比例；再按「加催化剂」。盒中分子的快慢没有变化（读数里的平均速率不变），直方图的形状也不变，只是橙色竖线左移，绿色部分变宽；「成功比例」图上的新点沿曲线上升。对照上一步：升温是把分布往右推，催化剂是把门槛往左挪，两条路都让更多碰撞越过门槛。',

    s4k: '第 4 步 · 表面积',
    s4t: '同样多的固体，磨成粉为什么反应快得多？',
    s4e: '这一步要回答：反应物 B 是固体时，乘法里哪一项变？固体里的分子挤在一起不动，气体分子 A 只能撞到固体<strong>表面</strong>的那一层，藏在内部的分子被外层挡住，根本碰不到。下面把同一块 6 × 6 = 36 个分子的固体切成边长 6、3、2、1 个分子的小块：分子总数不变，但外露的边越来越长（外露边长 = 各块周长之和，以分子宽度计）。每个固体分子的颜色表示它被撞了多少次（越亮越多），描边的是位于表面的分子。气体有 60 个 A 分子，300 K、门槛 2.0 不变，容器壁保持温度恒定。「每秒撞击固体的次数」散点图的横轴是外露边长。',
    c4box: '气体 A + 固体 B（颜色越亮 = 被撞得越多）',
    c4chart: '每秒撞击固体的次数 · 横轴：外露边长（分子宽度）',
    lgGas: '气体分子 A', lgSurf: '表面分子（可被撞到）', lgCore: '内部分子（被挡住）', lgPts4: '实测平均（每种切法一个点）',
    pieceLabel: '每块的边长（分子数）',
    s4readout: '切成 {k} 块、每块 {s}×{s}：表面分子 {ex}/36 个，外露边长 {p}。已测 {t} 秒，每秒撞击 {cr} 次、成功比例 {f}，每秒成功 {or} 次。内部分子累计被撞 {inner} 次。',
    s4hint: '观察顺序：先在「6」（整块）停几秒，看只有外圈分子慢慢变亮，内部始终是暗的。再拖到「1」（粉末）：36 个分子全都露在外面，各自变亮；散点图上撞击次数随外露边长一路升高，而读数里的成功比例不变。小块撞得比边长涨得还略多一点，因为气体分子自身有大小，从边角也能撞上。',

    s5k: '第 5 步 · 真实的数',
    s5t: '为什么很多反应升温 10℃，速率就快一倍左右？',
    s5e: '这一步要回答：把模拟里的规律放到真实的反应上，温度的影响有多大？前面的门槛只有 2.0，相当于活化能约 {ea0} kJ/mol，是为了让成功碰撞多到看得见。真实反应的活化能常在 40–100 kJ/mol：活化能为 50 kJ/mol、温度为 298 K 时，成功比例约 {f50}，也就是每十亿次碰撞只成功一两次。正因为比例这么小，它对温度极其敏感：成功比例 ∝ e^(−Ea/RT)（R = 8.314 J/(mol·K)，这个形式就是<strong>阿伦尼乌斯公式</strong>的核心，' + a('act2', '→ 活化能页第 2 步：阿伦尼乌斯') + '），而碰撞次数只 ∝ √T。下图横轴是温度，纵轴是速率相对 298 K 的倍数（对数刻度）：绿线是两项合起来的速率，灰线只算碰撞次数那一项。',
    c5: '速率 ÷ 298 K 时的速率（对数刻度） · 横轴：温度（K）',
    lgRate: '速率（碰撞次数 × 成功比例）', lgCollOnly: '只算碰撞次数的变化', lgT2: '所选温度',
    eaLabel: '活化能 Ea（kJ/mol）', t5Label: '温度',
    s5readout: 'Ea = {ea} kJ/mol，从 298 K 升到 {T} K：碰撞次数 ×{zr}，成功比例 ×{fr}，速率 ×{rr}。只升 10 K（到 308 K）：速率 ×{r10}，其中碰撞次数只贡献 ×{z10}。',
    s5hint: '观察顺序：先把温度放在 308 K，拖动 Ea：活化能越大，绿线越陡，Ea 约 50 kJ/mol 时 10 K 正好让速率翻一倍左右；而灰线几乎是平的。再固定 Ea、拖动温度，看速率的倍数沿绿线增长。「升温 10℃ 速率翻倍」只是经验规律：它对活化能在 50 kJ/mol 附近、接近室温的反应才大致成立。',

    s6k: '第 6 步 · 收束',
    s6t: '四种提速办法，各自改了乘法里的哪一项',
    s6fin: '一路下来：<strong>第 0 步</strong>，反应速率 = 每秒碰撞次数 × 成功比例，大多数碰撞因能量不足而弹开。<strong>第 1 步</strong>，浓度只改碰撞次数（∝ N_A × N_B），成功比例不变。<strong>第 2 步</strong>，升温两项都改：碰撞次数随 √T 小幅增加，成功比例按 e^(−门槛/kT) 大幅增加。<strong>第 3 步</strong>，催化剂只改门槛：分子速度不变，越过门槛的比例变大。<strong>第 4 步</strong>，固体磨碎只改能被撞到的表面，所以改的是碰撞次数。<strong>第 5 步</strong>，真实反应的成功比例极小，所以对温度格外敏感，升温 10℃ 常让速率翻倍左右。',
    formula: '速率 = 每秒碰撞次数 × 成功比例\n碰撞次数 ∝ [A][B]·√T　成功比例 = e^(−Ea/RT)',
    boundary: '适用范围：模拟是二维的硬球气体，A、B 质量相同；成功只看沿连心线方向的碰撞能量，不考虑分子的取向和内部结构（真实反应还要求撞对部位）。碰撞次数 ∝ √T、成功比例 = e^(−Ea/RT) 是稀薄理想气体的简化碰撞理论；真实的阿伦尼乌斯常数要靠实验测，常与此有出入。为让速率可以一直测量，成功的碰撞不消耗反应物；真实反应中反应物越来越少，速率会随之下降。时间、门槛高度和分子数都是教学设定。',
    linksTitle: '接着去哪',
    lk1: '→ 活化能页第 2 步：阿伦尼乌斯公式与温度',
    lk2: '→ 化学平衡页第 1 步：正逆两个方向的速率怎样变得相等',
    lk3: '→ 气体动理论页第 3 步：分子速率的分布',
    lk4: '→ 活化能页第 3 步：催化剂换了一条更低的路',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《反应速率 · 数一数成功碰撞》的平行版本。'
  },
  en: {
    pageTitle: 'Reaction Rates · Collisions × Success Fraction',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Reaction Rates · Counting Successful Collisions →',
    navLabel: 'Reaction rates steps',
    tagline: 'For A + B → products to happen, an A first has to hit a B, and hit it hard enough. So reactions per second = collisions per second × the fraction that succeed. Concentration, temperature, catalysts and surface area all speed reactions up, but which factor does each one change? We count them one at a time in a box of molecules.',
    nav0: '0 Successful hits', nav1: '1 Concentration', nav2: '2 Temperature', nav3: '3 Catalyst', nav4: '4 Surface area', nav5: '5 Real numbers', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Successful hits',
    s0t: 'When two molecules collide, do they always react?',
    s0e: 'The question here: what actually sets how fast a reaction goes? The box below holds 30 A molecules (cyan) and 30 B molecules (orange) at 300 K, darting around and bumping into each other. When an A hits a B, look at the kinetic energy of the part of their motion that brings them straight together along the line joining their centres. Call it the <strong>collision energy</strong>; a glancing blow has very little of it. Only when the collision energy reaches a certain bar can old bonds break and products form. That bar is the <strong>activation energy</strong> (' + a('act0', '→ Activation energy, step 0: the energy hill a reaction must climb') + '). Here the bar is set to 2.0, measured in units of kT at 300 K (the typical size of a molecule’s thermal energy at that temperature). So the <strong>reaction rate</strong>, the number of successful collisions per second, equals A–B collisions per second × the success fraction. To keep concentrations steady so the rate can be measured indefinitely, a successful collision is only tallied and both molecules stay in the box, as if products were removed and fresh reactants fed in at once.',
    c0box: 'Molecules in the box (slowed down)',
    c0bars: 'Collisions per second, green = successful · x-axis: time (s)',
    lgA: 'A molecules', lgB: 'B molecules', lgOk: 'Green ring = successful collision', lgFail: 'Grey ring = not enough energy, bounced',
    lgBarAll: 'Collisions per second', lgBarOk: 'Successful collisions per second',
    pause: 'Pause', resume: 'Resume', advance: 'Advance 5 s', reset0: 'Reset the count',
    s0readout: 'Counted for {t} s: {c} A–B collisions, {o} of them successful (success fraction {f}). On average {cr} collisions and {or} successes per second. The formula says a bar of 2.0 at 300 K should give a success fraction of {ft}.',
    s0hint: 'What to watch: in the box, most A–B collisions flash a grey ring and bounce apart; only now and then does a green ring appear. In the collisions-per-second bar chart each bar is one second: its full height is that second’s collisions and the green part is the successes, which stay a small slice. The longer it runs, the steadier the success fraction and the closer it gets to the formula. Time is slowed down for teaching; a real gas has many orders of magnitude more collisions per second.',

    s1k: 'Step 1 · Concentration',
    s1t: 'Double both A and B. How many times more successful collisions?',
    s1e: 'The question here: change only the number of molecules (same box, temperature and bar). Which factor changes? In a fixed volume, more molecules means a higher <strong>concentration</strong>. Each A hits B molecules at a rate proportional to how many B there are, and there are N_A such A molecules, so A–B collisions per second ∝ N_A × N_B. The energy of each collision depends only on temperature, so the success fraction stays put. The collisions-per-second scatter chart plots N_A × N_B across and collisions per second up. Each point is the measured average at one molecule count you tried (the longer you stay, the better it gets); the grey line is the collision-frequency formula for a dilute gas.',
    c1chart: 'A–B collisions per second · x-axis: N_A × N_B',
    lgPts: 'Measured average (one point per count)', lgPts2: 'Measured average (one point per temperature)', lgPts3: 'Measured average (one point per bar height)', lgTheoryZ: 'Collision-frequency formula (dilute gas)', lgNowPt: 'Current count',
    nLabel: 'Molecules of A and of B (each)',
    s1readout: '{n} each of A and B (N_A × N_B = {nn}): measured for {t} s, {cr} collisions per second (formula {zt}), success fraction {f}, {or} successes per second.',
    s1hint: 'What to watch: stay at 20 for a few seconds, then drag to 40. The box gets visibly more crowded and the rings flash more often; the new point lands on the same sloping line, while the success fraction in the readout barely moves. Try several counts and the points line up along the line. When the box is very crowded the points sit slightly above the formula, which assumes molecules are tiny and take up no room.',
    quizPrompt: 'Quick check: keep B the same and double only A. How many times more successful collisions per second?',
    quizA: '4 times', quizB: '2 times', quizC: 'The same, since the success fraction didn’t change',
    check: 'Check',
    quizRight: 'Right. Collisions ∝ N_A × N_B, so doubling one factor doubles the collisions; the success fraction is unchanged, so successes double too.',
    quizWrong: 'Think again: collisions ∝ N_A × N_B. Doubling both gives 4 times; doubling only A doubles the product. The success fraction is unchanged, so successes follow the collisions.',
    quizNone: 'Pick an option first.',

    s2k: 'Step 2 · Temperature',
    s2t: 'When it gets hotter, do molecules hit more often, or harder?',
    s2e: 'The question here: which factor does temperature change? <strong>Temperature</strong> measures how vigorous the thermal motion is: the hotter, the larger the average kinetic energy (' + a('ps1', '→ Particles & states, step 1: temperature is how wildly particles move') + '). Heating does two things. First, molecules move faster and sweep through more space, so collisions rise as √T: going from 300 K to 600 K adds only about 41%. Second, collision energies grow across the board, and the fraction above the bar rises as e^(−bar / kT), which grows much faster. The collision-energy histogram tallies the collision energy of the last 600 A–B collisions: the orange line is the bar and everything to its right (green) succeeded; the white curve is the theoretical distribution (' + a('kt3', '→ Kinetic theory, step 3: how molecular speeds are spread') + '). The success-fraction chart plots temperature across: the curve is the formula, the points are measurements at the temperatures you tried.',
    c2hist: 'Collision energies of the last 600 collisions · x-axis: collision energy (kT₃₀₀)',
    c2frac: 'Success fraction · x-axis: temperature (K)',
    lgHistFail: 'Collisions below the bar', lgHistOk: 'Collisions over the bar', lgDist: 'Theoretical distribution', lgBar: 'The bar (activation energy)', lgCurveF: 'Success-fraction formula e^(−bar/kT)',
    tLabel: 'Temperature T',
    s2readout: 'T = {T} K (read back from the mean kinetic energy: {Tm} K): measured for {t} s, {cr} collisions per second, success fraction {f} (formula {ft}). Compared with 300 K, the formula gives collisions ×{zr}, success fraction ×{fr}, successes ×{rr}.',
    s2hint: 'What to watch: stay at 300 K for a few seconds and note the thin green slice right of the line. Then drag to 500 K: the molecules visibly speed up, the histogram spreads to the right and the green part thickens; in the success-fraction chart the new point climbs along the curve. In the readout compare the two factors: collisions rise a little, the success fraction a lot.',

    s3k: 'Step 3 · Catalyst',
    s3t: 'A catalyst doesn’t make molecules move faster. So why does the reaction speed up?',
    s3e: 'The question here: which factor does a <strong>catalyst</strong> change? A catalyst lets the reaction take a route with different intermediate steps, and that route has a lower bar to climb (' + a('act3', '→ Activation energy, step 3: how a catalyst lowers the hill') + '). It does not heat anything, so the speed distribution and the number of collisions stay the same; only the position of the bar moves. Temperature is fixed at 300 K here. The histogram works as in the previous step, but now the orange line (the bar) is what moves; a grey dashed line marks the original bar of 2.0. The success-fraction chart now plots bar height across. In the simulation, lowering the bar simply changes the success test to stand for the catalyst’s effect; the catalyst molecules themselves are not drawn.',
    c3frac: 'Success fraction · x-axis: bar height (kT₃₀₀)',
    lgOldBar: 'Original bar 2.0',
    e0Label: 'Bar (activation energy)',
    noCat: 'No catalyst (bar 2.0)', withCat: 'With catalyst (bar 1.0)',
    s3readout: 'Bar = {e0} (T = 300 K): measured for {t} s, {cr} collisions per second, success fraction {f} (formula {ft}), {or} successes per second. Mean molecular speed {v} (the 300 K value is {v0}, in model units per second), whatever the bar. Compared with a bar of 2.0, successes ×{rr}.',
    s3hint: 'What to watch: press “No catalyst”, wait a few seconds and note the success fraction; then press “With catalyst”. The molecules in the box move no faster (the mean speed in the readout is unchanged) and the histogram keeps its shape; only the orange line slides left and the green part widens, while the new point in the success-fraction chart climbs along the curve. Compare with the previous step: heating pushes the distribution right, a catalyst moves the bar left, and both let more collisions over.',

    s4k: 'Step 4 · Surface area',
    s4t: 'Same amount of solid. Why does grinding it to powder make it react so much faster?',
    s4e: 'The question here: when reactant B is a solid, which factor changes? Molecules in a solid are packed together and stay put, so gas molecules A can only hit the <strong>surface</strong> layer; molecules buried inside are shielded by the outer ones and never get hit. Below, one solid of 6 × 6 = 36 molecules is cut into pieces 6, 3, 2 or 1 molecules on a side. The number of molecules stays the same, but the exposed edge grows (exposed edge = the sum of all the pieces’ perimeters, in molecule widths). Each solid molecule is coloured by how often it has been hit (brighter = more), and surface molecules are outlined. The gas has 60 A molecules at 300 K with the bar at 2.0, and the container walls hold the temperature steady. The hits-per-second scatter chart plots exposed edge across.',
    c4box: 'Gas A + solid B (brighter = hit more often)',
    c4chart: 'Hits on the solid per second · x-axis: exposed edge (molecule widths)',
    lgGas: 'Gas molecules A', lgSurf: 'Surface molecules (can be hit)', lgCore: 'Inner molecules (shielded)', lgPts4: 'Measured average (one point per cut)',
    pieceLabel: 'Piece side (molecules)',
    s4readout: '{k} pieces of {s}×{s}: {ex}/36 molecules on the surface, exposed edge {p}. Measured for {t} s: {cr} hits per second, success fraction {f}, {or} successes per second. Inner molecules have been hit {inner} times in total.',
    s4hint: 'What to watch: stay at “6” (one block) for a few seconds; only the outer ring of molecules slowly brightens and the inside stays dark. Then drag to “1” (powder): all 36 molecules are exposed and each brightens. In the scatter chart hits per second climb with the exposed edge, while the success fraction in the readout stays put. Small pieces get hit a little more than their edge alone suggests, because gas molecules have size and can also catch the corners.',

    s5k: 'Step 5 · Real numbers',
    s5t: 'Why do so many reactions roughly double their rate for a 10 °C rise?',
    s5e: 'The question here: carry the simulation’s rules over to real reactions; how big is the effect of temperature? The bar of 2.0 used above corresponds to an activation energy of only about {ea0} kJ/mol, chosen so that successes are common enough to see. Real activation energies are typically 40–100 kJ/mol: at 50 kJ/mol and 298 K the success fraction is about {f50}, one or two successes per billion collisions. Precisely because the fraction is so small, it is extremely sensitive to temperature: success fraction ∝ e^(−Ea/RT) (R = 8.314 J/(mol·K); this form is the heart of the <strong>Arrhenius equation</strong>, ' + a('act2', '→ Activation energy, step 2: Arrhenius') + '), whereas collisions only grow as √T. The chart plots temperature across and the rate relative to 298 K up (log scale): the green line combines both factors, the grey line counts only the change in collisions.',
    c5: 'Rate ÷ rate at 298 K (log scale) · x-axis: temperature (K)',
    lgRate: 'Rate (collisions × success fraction)', lgCollOnly: 'Change in collisions only', lgT2: 'Chosen temperature',
    eaLabel: 'Activation energy Ea (kJ/mol)', t5Label: 'Temperature',
    s5readout: 'Ea = {ea} kJ/mol, from 298 K to {T} K: collisions ×{zr}, success fraction ×{fr}, rate ×{rr}. A rise of just 10 K (to 308 K): rate ×{r10}, of which collisions contribute only ×{z10}.',
    s5hint: 'What to watch: set the temperature to 308 K and drag Ea. The larger the activation energy, the steeper the green line; at about 50 kJ/mol a 10 K rise roughly doubles the rate, while the grey line is almost flat. Then hold Ea and drag the temperature to see the rate multiply along the green line. “10 °C doubles the rate” is only a rule of thumb: it roughly holds for reactions near room temperature with activation energies around 50 kJ/mol.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Four ways to speed up a reaction, and which factor each one changes',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: rate = collisions per second × success fraction, and most collisions bounce off for lack of energy. <strong>Step 1</strong>: concentration changes only the collisions (∝ N_A × N_B); the success fraction stays the same. <strong>Step 2</strong>: heating changes both: collisions rise modestly as √T, the success fraction rises steeply as e^(−bar/kT). <strong>Step 3</strong>: a catalyst changes only the bar: the molecules move no faster, but a larger share clears it. <strong>Step 4</strong>: grinding a solid changes only the surface that can be hit, so it changes the collisions. <strong>Step 5</strong>: real reactions have tiny success fractions, which is why they are so sensitive to temperature and a 10 °C rise often roughly doubles the rate.',
    formula: 'rate = collisions per second × success fraction\ncollisions ∝ [A][B]·√T   success fraction = e^(−Ea/RT)',
    boundary: 'Scope: the simulation is a 2-D gas of hard discs, with A and B of equal mass; success depends only on the collision energy along the line of centres, ignoring orientation and internal structure (real reactions also need the right parts to meet). Collisions ∝ √T and success fraction = e^(−Ea/RT) come from simple collision theory for a dilute ideal gas; real Arrhenius constants are measured and often differ. So that the rate can be measured indefinitely, successful collisions do not use up reactants; in a real reaction the reactants run down and the rate falls with them. Time, bar height and molecule counts are teaching choices.',
    linksTitle: 'Where to go next',
    lk1: '→ Activation energy, step 2: the Arrhenius equation and temperature',
    lk2: '→ Chemical equilibrium, step 1: how the forward and reverse rates become equal',
    lk3: '→ Kinetic theory, step 3: how molecular speeds are spread',
    lk4: '→ Activation energy, step 3: a catalyst opens a lower route',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Reaction Rates · Counting Successful Collisions”.'
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
  if (typeof window.refreshRates === 'function') window.refreshRates();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS, LINK };
if (typeof window !== 'undefined') window.RATES_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
