'use strict';
// Buffer-capacity lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const LINK = {
  ph1: '../../../chemistry/solutions/ph-scale/#step1',
  ph2: '../../../chemistry/solutions/ph-scale/#step2',
  ab1: '../../../variants/claude-code/acid-base-equilibrium/#step1',
  ab3: '../../../variants/claude-code/acid-base-equilibrium/#step3',
  eq2: '../../../chemistry/reactions/chemical-equilibrium/#step2',
  tit2: '../../../chemistry/solutions/titration-curves/#step2'
};
const a = (k, text) => `<a class="xlink" href="${LINK[k]}">${text}</a>`;

const STRINGS = {
  zh: {
    pageTitle: '缓冲溶液 · 一份库存接住酸和碱',
    back: '← 知识索引',
    compare: '对照另一版本：缓冲溶液 · 把 pH 稳住 →',
    navLabel: '缓冲溶液步骤导航',
    tagline: '往一杯纯水里滴一滴强酸，pH 从 7 掉到 2 左右；往一杯醋酸和醋酸钠的混合液里滴同样一滴，pH 几乎不动。这杯混合液叫缓冲溶液。它靠什么接住外来的酸和碱？pH 由什么决定？能接住多少，什么时候会突然失守？六步里逐一算给你看。',
    nav0: '0 滴一滴', nav1: '1 库存', nav2: '2 比值定 pH', nav3: '3 容量', nav4: '4 最佳区间', nav5: '5 收束',

    s0k: '第 0 步 · 滴一滴',
    s0t: '同样一滴强酸，为什么一杯 pH 骤降，另一杯几乎不动？',
    s0e: '这一步要回答：<strong>缓冲溶液</strong>到底「缓冲」了什么？下面两只烧杯各装 1 L：一只是纯水（pH 7），另一只是 0.10 mol 醋酸 CH₃COOH 和 0.10 mol 醋酸钠 CH₃COONa 溶在一起的溶液。每按一次，向两杯各滴入一滴强酸或强碱，每滴含 0.005 mol（相当于 5 mL 浓度 1 mol/L 的盐酸或氢氧化钠，体积变化忽略不计）。<strong>pH</strong> = −lg[H⁺]，pH 小 1 表示 H⁺ 浓度大 10 倍（' + a('ph1', '→ pH 页第 1 步：差 1 就是 10 倍') + '）。液体颜色按通用指示剂的配色随 pH 变化（' + a('ph2', '→ pH 页第 2 步：指示剂怎样变色') + '），只是显示方式。「pH 随滴数变化」图记录你每次滴完后两杯的 pH：横轴是净加入的滴数（加酸记正、加碱记负）。',
    c0water: '纯水', c0buffer: '缓冲液',
    c0chart: 'pH 随滴数变化 · 横轴：净滴数（酸为正，碱为负）',
    lgWater: '纯水', lgBuffer: '缓冲液（醋酸 + 醋酸钠）', lgColor: '液体颜色 = 通用指示剂配色',
    dropAcid: '滴一滴强酸', dropBase: '滴一滴强碱', reset0: '倒掉重来',
    s0readout: '净加入 {d} 滴{amt}：纯水 pH = {pw}（变化 {dw}），缓冲液 pH = {pb}（变化 {db}）。',
    amtAcid: '（{n} mol 强酸）', amtBase: '（{n} mol 强碱）', amtNone: '（还没加酸碱）',
    s0hint: '观察顺序：先只按「滴一滴强酸」，按 3 下：纯水那杯第一滴就从绿色变红，pH 掉了将近 5；缓冲液几乎不变色。继续按：接近第 20 滴时，缓冲液的 pH 越掉越快、变成红色——它能接住的量是有限的。按「倒掉重来」后再试强碱，现象对称。',

    s1k: '第 1 步 · 库存',
    s1t: '加进去的 H⁺ 去哪儿了？',
    s1e: '这一步要回答：缓冲液为什么能接住酸？醋酸是<strong>弱酸</strong>，在水里只有一小部分拆成 H⁺ 和醋酸根 CH₃COO⁻（醋酸根就是它的<strong>共轭碱</strong>，下面记作 A⁻；醋酸记作 HA）。醋酸钠在水里完全拆开，提供大量 A⁻。于是溶液里同时存着一大份 HA 和一大份 A⁻，这就是缓冲液的<strong>库存</strong>。外来的 H⁺ 一进来，就几乎全部被 A⁻ 抓住：A⁻ + H⁺ → HA；外来的 OH⁻ 则被 HA 中和：HA + OH⁻ → A⁻ + H₂O。所以加酸只是把一部分 A⁻ 换成 HA，溶液里自由的 H⁺ 几乎不增加（' + a('ab3', '→ 酸碱平衡页第 3 步：已有很多 A⁻ 时，HA 几乎不拆开') + '）。下图上半是库存（单位 mol），下半是 0–14 的 pH 刻度。',
    c1inv: '库存（mol）',
    c1ruler: 'pH 刻度',
    lgHA: 'HA（醋酸）', lgA: 'A⁻（醋酸根）', lgExH: '没被接住的 H⁺', lgExOH: '没被接住的 OH⁻', lgExact: '精确 pH', lgHH: '比值公式估计',
    nLabel: '加入的强酸（正）或强碱（负），mol',
    s1readout: '{action}剩下 A⁻ {A} mol、HA {HA} mol。{excess}精确 pH = {p}；按第 2 步的比值公式估计{hh}。',
    actAcid: '加入 {n} mol 强酸：其中 {u} mol 被 A⁻ 接住变成 HA。',
    actBase: '加入 {n} mol 强碱：其中 {u} mol 被 HA 中和变成 A⁻。',
    actNone: '还没加酸或碱。',
    exAcid: 'A⁻ 已经用完，多出的 {x} mol H⁺ 直接留在溶液里。',
    exBase: 'HA 已经用完，多出的 {x} mol OH⁻ 直接留在溶液里。',
    exNone: '',
    hhNa: '不出（一边库存已用完，公式不再适用）',
    s1hint: '观察顺序：把滑杆从 0 往右拖到 0.05：库存条里 A⁻ 变短、HA 变长，两根加起来始终是 0.20 mol；pH 刻度上的指针只从 4.76 挪到 4.28。继续拖过 0.10：A⁻ 归零，多出的 H⁺ 出现，指针一下子跳到 2 附近。往左拖（加碱）是镜像过程。',

    s2k: '第 2 步 · 比值定 pH',
    s2t: '缓冲液的 pH 由什么决定？加水稀释会变吗？',
    s2e: '这一步要回答：配一份缓冲液时，它的 pH 由什么决定？弱酸平衡 Ka = [H⁺][A⁻]/[HA]（Ka 是弱酸的<strong>解离常数</strong>，pKa = −lg Ka，' + a('ab1', '→ 酸碱平衡页第 1 步：Ka 与 pKa') + '）。两边取 −lg 并整理，得到 <strong>pH = pKa + lg([A⁻]/[HA])</strong>，叫亨德森–哈塞尔巴尔赫公式（下文称比值公式）。它说：pH 只取决于酸本身（pKa）和库存的<strong>比值</strong>，只要两边库存都远多于溶液里本身的 H⁺ 和 OH⁻，就与总量无关；比值为 1 时 pH = pKa，比值每大 10 倍 pH 大 1。下图横轴是比值 [A⁻]/[HA]（对数刻度），纵轴是 pH：直线是比值公式，绿色曲线是同一总浓度 C 下解完整电荷平衡得到的精确 pH。总浓度 C = HA 与 A⁻ 之和（mol/L）。',
    c2chart: 'pH · 横轴：[A⁻]/[HA]（对数刻度）',
    lgLineHH: '比值公式 pKa + lg([A⁻]/[HA])', lgNow: '当前比值与浓度下的精确 pH', lgCurveExact: '精确 pH（当前总浓度）',
    rLabel: '比值 [A⁻]/[HA]', cLabel: '总浓度 C（对数刻度）',
    pairAcetic: '醋酸 / 醋酸根（pKa 4.76）', pairPhosphate: '磷酸二氢根 / 磷酸氢根（pKa 7.21）', pairAmmonium: '铵根 / 氨（pKa 9.25）',
    s2readout: '{pair}，比值 {r}，总浓度 C = {C} mol/L：精确 pH = {p}，比值公式 {hh}，相差 {d}。同一比值稀释 10 倍，精确 pH 变化 {dd}。',
    s2hint: '观察顺序：先把 C 放在 0.2 左右，拖比值：圆点沿直线走，比值 1 时正好落在 pKa。再把 C 拖到 0.001 附近：比值接近 0.01 或 100 时，绿色曲线离开直线——这时某一边的库存只剩约 10 μmol 每升，和溶液里本身的 H⁺ 或 OH⁻ 差不多，比值公式就不准了。换一对酸碱，整条线上下平移。',

    s3k: '第 3 步 · 容量',
    s3t: '比值一样、浓度不同的两杯缓冲液，哪杯更扛得住？',
    s3e: '这一步要回答：既然库存充足时稀释几乎不改变 pH，浓一点有什么用？用处在<strong>容量</strong>：本页把它定义为让 pH 改变 1 个单位所需加入的强酸或强碱的量（mol，每升溶液）。下图是 1 L 溶液的滴定曲线：横轴是加入的量（正 = 强酸，负 = 强碱），纵轴是 pH，每一点都由完整电荷平衡算出。绿色曲线是当前总浓度 C 的缓冲液（比值 1:1），淡绿色是你试过的其他浓度，灰色是纯水。曲线的平缓段就是缓冲区；它的宽度正比于库存，所以浓度翻倍，平缓段也加宽一倍（' + a('tit2', '→ 滴定曲线页第 2 步：弱酸滴定曲线中段为什么平缓') + '）。',
    c3chart: 'pH · 横轴：加入的强酸（正）或强碱（负），mol',
    lgCurveC: '当前浓度的缓冲液', lgTried: '试过的其他浓度', lgWaterC: '纯水', lgBand: '起点 ±1 个 pH 单位',
    c3Label: '缓冲液总浓度 C',
    s3readout: 'C = {C} mol/L（HA、A⁻ 各 {half} mol）：pH 降 1 需要 {ca} mol 强酸，升 1 需要 {cb} mol 强碱，约为 C 的 {k} 倍。纯水只要 {cw} mol 就会改变 1 个 pH 单位，缓冲液是它的约 {x} 倍。',
    s3hint: '观察顺序：先看灰色纯水曲线：在 0 附近几乎是一条竖线，任何一点酸碱都让它跳到 2 或 12。再拖 C 从 0.05 到 0.40：绿色曲线的平缓段越来越宽，读数里的容量与 C 成正比。平缓段走到头（库存用完）时，曲线和纯水一样陡。',

    s4k: '第 4 步 · 最佳区间',
    s4t: '比值偏离 1:1 时，缓冲液还靠得住吗？',
    s4e: '这一步要回答：一份缓冲液在哪个 pH 附近最「硬」？用<strong>缓冲指数 β</strong> 衡量：在当前 pH 附近，每升溶液要多少 mol 强碱才能让 pH 升高 1（若在整段内都保持这个斜率），也就是滴定曲线在这一点有多平。β 越大越难推动。对一对弱酸–共轭碱，β 在 pH = pKa（比值 1:1）时最大，离开 pKa 越远越小。下图横轴是 pH，纵轴是 β（mol/pH）；阴影是 pKa ± 1 的区间，对应比值 0.1 到 10，常被当作这对酸碱的有效缓冲范围。总浓度固定为 0.20 mol/L（醋酸体系）。',
    c4chart: '缓冲指数 β（mol/pH） · 横轴：pH',
    lgBeta: 'β（含水的贡献）', lgRange: 'pKa ± 1', lgStart: '当前配比的起点',
    r4Label: '配制时的比值 [A⁻]/[HA]',
    s4readout: '比值 {r}，起点 pH = {p}，此处 β = {b}（最大值 {bm}，在 pH = pKa）。从这里让 pH 降 1 需 {ca} mol 强酸，升 1 需 {cb} mol 强碱。{verdict}',
    v4Even: '两个方向几乎一样硬。',
    v4Acid: '抗酸比抗碱强：A⁻ 多、HA 少，加碱时 HA 很快用完。',
    v4Base: '抗碱比抗酸强：HA 多、A⁻ 少，加酸时 A⁻ 很快用完。',
    s4hint: '观察顺序：把比值从 1 往右拖到 10：圆点沿 β 曲线滑到阴影边缘，β 降到峰值的三分之一；读数里抗碱的量明显变小。再拖到 0.1，情形对调。只需防一个方向时，可以把起点放在偏向另一边的位置；两个方向都要防时，1:1 最稳妥（两个方向中较弱的那个最强）。',

    s5k: '第 5 步 · 收束',
    s5t: '库存接住扰动，比值定下 pH，总量决定能扛多少',
    s5fin: '一路下来：<strong>第 0 步</strong>，同样一滴强酸让纯水的 pH 掉近 5，缓冲液几乎不动，直到库存用完才突然失守。<strong>第 1 步</strong>，加酸时 A⁻ 把 H⁺ 抓成 HA，加碱时 HA 把 OH⁻ 中和；自由的 H⁺ 几乎不增加。<strong>第 2 步</strong>，pH = pKa + lg([A⁻]/[HA])，由酸本身和库存比值决定，库存充足时稀释几乎不改 pH。<strong>第 3 步</strong>，容量正比于库存总量，pH 改变 1 所需的酸约为总浓度的 0.41 倍。<strong>第 4 步</strong>，β 在 pH = pKa 时最大，有效范围约 pKa ± 1。<strong>身边的例子</strong>：血液靠碳酸–碳酸氢根体系缓冲，表观 pKa 约 6.1，[HCO₃⁻]/[H₂CO₃] 约 20:1，比值公式给出 pH ≈ {blood}，正是血液的正常值。',
    formula: 'pH = pKa + lg([A⁻]/[HA])\n加酸：A⁻ + H⁺ → HA　加碱：HA + OH⁻ → A⁻ + H₂O\n容量 ∝ 总浓度 C',
    boundary: '适用范围：25 ℃（血液例子用的是体温下的表观 pKa）、理想溶液（浓度代替活度）、1 L 溶液、加入强酸强碱时不计体积变化；精确 pH 解完整电荷平衡并含水的电离。比值公式在两边库存都远大于溶液中 H⁺ 和 OH⁻ 时才准确。血液的真实缓冲还依赖呼吸排出 CO₂（开放体系），本页的封闭烧杯不包含这一点。',
    linksTitle: '接着去哪',
    lk1: '→ 酸碱平衡页第 3 步：共同离子让弱酸几乎不拆开',
    lk2: '→ 滴定曲线页第 2 步：弱酸滴定曲线的平缓中段',
    lk3: '→ 化学平衡页第 2 步：加料后平衡怎样移动',
    lk4: '→ pH 页第 1 步：pH 差 1 就是浓度差 10 倍',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《缓冲溶液 · 把 pH 稳住》的平行版本。'
  },
  en: {
    pageTitle: 'Buffers · A Stockpile That Absorbs Acid and Base',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Buffer Capacity · Holding pH Steady →',
    navLabel: 'Buffer capacity steps',
    tagline: 'Add one drop of strong acid to a glass of pure water and the pH falls from 7 to about 2; add the same drop to a mixture of acetic acid and sodium acetate and the pH barely moves. That mixture is a buffer. What does it use to absorb incoming acid and base? What sets its pH? How much can it take, and when does it suddenly give way? Six steps, each one calculated.',
    nav0: '0 One drop', nav1: '1 Stockpile', nav2: '2 Ratio sets pH', nav3: '3 Capacity', nav4: '4 Best range', nav5: '5 Wrap-up',

    s0k: 'Step 0 · One drop',
    s0t: 'The same drop of strong acid: why does one beaker crash and the other hardly move?',
    s0e: 'The question here: what exactly does a <strong>buffer</strong> buffer? Each beaker below holds 1 L. One is pure water (pH 7); the other has 0.10 mol of acetic acid, CH₃COOH, and 0.10 mol of sodium acetate, CH₃COONa, dissolved together. Each press adds one drop of strong acid or strong base to both beakers; a drop carries 0.005 mol (like 5 mL of 1 mol/L hydrochloric acid or sodium hydroxide; the volume change is ignored). <strong>pH</strong> = −log[H⁺], and one pH unit lower means ten times more H⁺ (' + a('ph1', '→ pH scale, step 1: one unit is a factor of ten') + '). The liquid colour follows a universal-indicator palette as pH changes (' + a('ph2', '→ pH scale, step 2: how indicators change colour') + '); it is only a display. The “pH after each drop” chart records both beakers’ pH after each drop you add: the x-axis is the net number of drops (acid counts positive, base negative).',
    c0water: 'Pure water', c0buffer: 'Buffer',
    c0chart: 'pH after each drop · x-axis: net drops (acid +, base −)',
    lgWater: 'Pure water', lgBuffer: 'Buffer (acetic acid + sodium acetate)', lgColor: 'Liquid colour = universal-indicator palette',
    dropAcid: 'Add a drop of strong acid', dropBase: 'Add a drop of strong base', reset0: 'Empty and start again',
    s0readout: 'Net {d} drops{amt}: pure water pH = {pw} (change {dw}), buffer pH = {pb} (change {db}).',
    amtAcid: ' ({n} mol of strong acid)', amtBase: ' ({n} mol of strong base)', amtNone: ' (nothing added yet)',
    s0hint: 'What to watch: press only “Add a drop of strong acid”, three times. The water turns from green to red on the first drop, its pH down by almost 5; the buffer hardly changes colour. Keep going: as you approach the 20th drop the buffer’s pH falls faster and faster and it turns red, so what it can absorb is limited. Press “Empty and start again” and try strong base; the picture is the mirror image.',

    s1k: 'Step 1 · Stockpile',
    s1t: 'Where does the added H⁺ go?',
    s1e: 'The question here: why can the buffer absorb acid? Acetic acid is a <strong>weak acid</strong>: in water only a small share splits into H⁺ and acetate, CH₃COO⁻ (acetate is its <strong>conjugate base</strong>; below we write it A⁻ and acetic acid HA). Sodium acetate splits completely and supplies plenty of A⁻. So the solution holds a large amount of HA and a large amount of A⁻ at the same time: the buffer’s <strong>stockpile</strong>. Incoming H⁺ is almost entirely grabbed by A⁻: A⁻ + H⁺ → HA. Incoming OH⁻ is neutralised by HA: HA + OH⁻ → A⁻ + H₂O. Adding acid therefore just turns some A⁻ into HA, and the free H⁺ in solution hardly rises (' + a('ab3', '→ Acid–base equilibrium, step 3: with plenty of A⁻ around, HA barely splits') + '). The top of the chart shows the stockpile (in mol), the bottom a pH scale from 0 to 14.',
    c1inv: 'Stockpile (mol)',
    c1ruler: 'pH scale',
    lgHA: 'HA (acetic acid)', lgA: 'A⁻ (acetate)', lgExH: 'H⁺ not absorbed', lgExOH: 'OH⁻ not absorbed', lgExact: 'Exact pH', lgHH: 'Ratio-formula estimate',
    nLabel: 'Strong acid added (+) or strong base (−), mol',
    s1readout: '{action}Remaining: A⁻ {A} mol, HA {HA} mol. {excess}Exact pH = {p}; the ratio formula from step 2 estimates{hh}.',
    actAcid: 'Added {n} mol of strong acid: {u} mol of it was caught by A⁻ and became HA. ',
    actBase: 'Added {n} mol of strong base: {u} mol of it was neutralised by HA, making A⁻. ',
    actNone: 'No acid or base added yet. ',
    exAcid: 'A⁻ has run out, and the extra {x} mol of H⁺ stays free in solution. ',
    exBase: 'HA has run out, and the extra {x} mol of OH⁻ stays free in solution. ',
    exNone: '',
    hhNa: ' nothing (one side of the stockpile is used up, so the formula no longer applies)',
    s1hint: 'What to watch: drag the slider from 0 to 0.05. In the stockpile bars A⁻ shrinks and HA grows, always adding up to 0.20 mol; the pointer on the pH scale only moves from 4.76 to 4.28. Keep going past 0.10: A⁻ hits zero, unabsorbed H⁺ appears, and the pointer jumps to about 2. Dragging left (adding base) is the mirror image.',

    s2k: 'Step 2 · Ratio sets pH',
    s2t: 'What sets a buffer’s pH, and does adding water change it?',
    s2e: 'The question here: when you make up a buffer, what decides its pH? The weak-acid equilibrium is Ka = [H⁺][A⁻]/[HA] (Ka is the acid’s <strong>dissociation constant</strong> and pKa = −log Ka, ' + a('ab1', '→ Acid–base equilibrium, step 1: Ka and pKa') + '). Take −log of both sides and rearrange to get <strong>pH = pKa + log([A⁻]/[HA])</strong>, the Henderson–Hasselbalch equation (the ratio formula from here on). It says pH depends only on the acid itself (pKa) and the <strong>ratio</strong> of the stockpile, not on the total amount, as long as both sides of the stockpile far outweigh the H⁺ and OH⁻ already in solution. At a ratio of 1, pH = pKa, and each tenfold increase in the ratio adds 1 to the pH. The chart plots the ratio [A⁻]/[HA] across (log scale) and pH up: the straight line is the ratio formula, the green curve the exact pH from the full charge balance at the same total concentration C. Total concentration C = HA plus A⁻ (mol/L).',
    c2chart: 'pH · x-axis: [A⁻]/[HA] (log scale)',
    lgLineHH: 'Ratio formula pKa + log([A⁻]/[HA])', lgNow: 'Exact pH at the current ratio and concentration', lgCurveExact: 'Exact pH (current total concentration)',
    rLabel: 'Ratio [A⁻]/[HA]', cLabel: 'Total concentration C (log scale)',
    pairAcetic: 'Acetic acid / acetate (pKa 4.76)', pairPhosphate: 'Dihydrogen / hydrogen phosphate (pKa 7.21)', pairAmmonium: 'Ammonium / ammonia (pKa 9.25)',
    s2readout: '{pair}, ratio {r}, total concentration C = {C} mol/L: exact pH = {p}, ratio formula {hh}, a gap of {d}. Dilute the same ratio tenfold and the exact pH moves by {dd}.',
    s2hint: 'What to watch: set C to about 0.2 and drag the ratio. The dot follows the straight line and sits exactly on pKa at a ratio of 1. Then drag C down to about 0.001: near ratios of 0.01 or 100 the green curve leaves the line. One side of the stockpile is then down to about ten micromoles per litre, comparable to the H⁺ or OH⁻ already in solution, and the ratio formula stops being accurate. Switch to another pair and the whole line shifts up or down.',

    s3k: 'Step 3 · Capacity',
    s3t: 'Two buffers with the same ratio but different strengths: which one holds out longer?',
    s3e: 'The question here: if dilution barely changes the pH of a well-stocked buffer, what is a stronger buffer good for? <strong>Capacity</strong>. On this page that means the amount of strong acid or base (mol, per litre) needed to move the pH by one unit. The chart shows titration curves for 1 L: the x-axis is the amount added (positive = strong acid, negative = strong base), the y-axis is pH, and every point comes from the full charge balance. The green curve is the buffer at the current total concentration C (1:1 ratio), pale green curves are other concentrations you tried, and grey is pure water. The flat stretch of a curve is the buffering zone; its width is proportional to the stockpile, so doubling the concentration doubles it (' + a('tit2', '→ Titration curves, step 2: why a weak-acid curve is flat in the middle') + ').',
    c3chart: 'pH · x-axis: strong acid added (+) or strong base (−), mol',
    lgCurveC: 'Buffer at the current concentration', lgTried: 'Other concentrations you tried', lgWaterC: 'Pure water', lgBand: 'Start ±1 pH unit',
    c3Label: 'Buffer total concentration C',
    s3readout: 'C = {C} mol/L ({half} mol each of HA and A⁻): lowering pH by 1 takes {ca} mol of strong acid and raising it by 1 takes {cb} mol of strong base, about {k} × C. Pure water moves a whole pH unit after just {cw} mol; the buffer takes about {x} times as much.',
    s3hint: 'What to watch: first look at the grey water curve. Around 0 it is almost a vertical line, and any acid or base sends it to 2 or 12. Then drag C from 0.05 to 0.40: the flat stretch of the green curve gets wider and the capacities in the readout grow in proportion to C. Where the flat stretch ends (the stockpile is used up), the curve becomes as steep as water’s.',

    s4k: 'Step 4 · Best range',
    s4t: 'If the ratio is not 1:1, can you still rely on the buffer?',
    s4e: 'The question here: around which pH is a buffer “stiffest”? Measure it with the <strong>buffer index β</strong>: near the current pH, how many mol of strong base per litre it would take to raise the pH by 1 if the slope stayed the same, that is, how flat the titration curve is at that point. The larger β, the harder the pH is to push. For a weak acid and its conjugate base, β peaks at pH = pKa (a 1:1 ratio) and falls away on either side. The chart plots pH across and β (mol per pH unit) up; the shaded band is pKa ± 1, ratios from 0.1 to 10, usually taken as the pair’s useful buffering range. Total concentration is fixed at 0.20 mol/L (the acetate system).',
    c4chart: 'Buffer index β (mol/pH) · x-axis: pH',
    lgBeta: 'β (including water)', lgRange: 'pKa ± 1', lgStart: 'Starting point for this ratio',
    r4Label: 'Ratio [A⁻]/[HA] as made up',
    s4readout: 'Ratio {r}, starting pH = {p}, β here = {b} (maximum {bm}, at pH = pKa). From here, lowering pH by 1 takes {ca} mol of strong acid; raising it by 1 takes {cb} mol of strong base. {verdict}',
    v4Even: 'Both directions are about equally stiff.',
    v4Acid: 'It resists acid better than base: lots of A⁻, little HA, so base uses up the HA quickly.',
    v4Base: 'It resists base better than acid: lots of HA, little A⁻, so acid uses up the A⁻ quickly.',
    s4hint: 'What to watch: drag the ratio from 1 up to 10. The dot slides along the β curve to the edge of the band and β drops to a third of its peak; the base capacity in the readout shrinks noticeably. Drag to 0.1 and the roles swap. If you only need to guard against one direction, you can start off to the other side; if you need both, 1:1 is the safe choice (its weaker direction is the strongest possible).',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'The stockpile absorbs the push, the ratio sets the pH, the total sets how much it can take',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: one drop of strong acid knocks pure water down by almost 5 pH units while the buffer barely moves, until its stockpile runs out and it suddenly gives way. <strong>Step 1</strong>: adding acid, A⁻ grabs H⁺ and becomes HA; adding base, HA neutralises OH⁻; free H⁺ hardly rises. <strong>Step 2</strong>: pH = pKa + log([A⁻]/[HA]), set by the acid and the stockpile ratio; with a well-stocked buffer, dilution barely moves it. <strong>Step 3</strong>: capacity is proportional to the total stockpile; shifting the pH by one unit takes about 0.41 × the total concentration. <strong>Step 4</strong>: β peaks at pH = pKa and the useful range is about pKa ± 1. <strong>Close to home</strong>: blood is buffered by carbonic acid and bicarbonate, with an apparent pKa of about 6.1 and [HCO₃⁻]/[H₂CO₃] about 20 : 1. The ratio formula gives pH ≈ {blood}, exactly blood’s normal value.',
    formula: 'pH = pKa + log([A⁻]/[HA])\nacid in: A⁻ + H⁺ → HA   base in: HA + OH⁻ → A⁻ + H₂O\ncapacity ∝ total concentration C',
    boundary: 'Scope: 25 °C (the blood example uses the apparent pKa at body temperature); ideal solution (concentrations stand in for activities); 1 L of solution, with no volume change when strong acid or base is added. Exact pH solves the full charge balance including water’s ionisation. The ratio formula is accurate only when both sides of the stockpile are far larger than the H⁺ and OH⁻ in solution. Real blood buffering also relies on breathing out CO₂ (an open system), which the closed beakers here leave out.',
    linksTitle: 'Where to go next',
    lk1: '→ Acid–base equilibrium, step 3: a common ion stops the weak acid splitting',
    lk2: '→ Titration curves, step 2: the flat middle of a weak-acid curve',
    lk3: '→ Chemical equilibrium, step 2: how equilibrium shifts when you add more',
    lk4: '→ pH scale, step 1: one pH unit is a factor of ten',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Buffer Capacity · Holding pH Steady”.'
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
  if (typeof window.refreshBuffer === 'function') window.refreshBuffer();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS, LINK };
if (typeof window !== 'undefined') window.BUFFER_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
