'use strict';
// Titration-curve lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '滴定曲线 · 最后一滴为什么跳得最高',
    back: '← 知识索引',
    compare: '对照另一版本：滴定曲线 · 终点附近 pH 的“悬崖” →',
    navLabel: '滴定曲线步骤导航',
    tagline: '往 25.00 mL 酸里一滴一滴加同浓度的 NaOH 溶液，记下每一刻的 pH，就得到滴定曲线。它前面平缓、在等当点附近几乎竖直地跳起。六步里你会逐滴找出这道「悬崖」从哪来，用它读出弱酸的 pKa，看浓度怎样削矮它，最后用它挑选指示剂。',
    nav0: '0 画出曲线', nav1: '1 悬崖从哪来', nav2: '2 弱酸与 pKa', nav3: '3 浓度', nav4: '4 选指示剂', nav5: '5 收束',

    s0k: '第 0 步 · 一条曲线怎么来',
    s0t: '一边滴碱一边测 pH，曲线会长什么样？',
    s0e: '这一步要回答：往酸里不断加碱，pH（溶液中 H⁺ 浓度写成 10 的负几次方时的那个「几」，越小越酸）怎样随加入量变化？<strong>滴定</strong>就是用滴定管把已知浓度的溶液（这里是 NaOH，一种完全电离的强碱）一点点加进待测溶液，直到恰好反应完。锥形瓶里是 25.00 mL、0.100 mol/L 的一元酸 HA，共 2.50 mmol；NaOH 也是 0.100 mol/L，所以加入 V mL 就带进 0.100 × V mmol OH⁻，它与酸一对一反应：HA + OH⁻ → A⁻ + H₂O。加入的 OH⁻ 正好等于原有酸的量时叫<strong>等当点</strong>，这里 V = 25.00 mL。可以先用盐酸（<strong>强酸</strong>：HCl 在水里全部变成 H⁺）画一遍，再换醋酸（<strong>弱酸</strong>：只有一小部分变成 H⁺）对比。',
    vSlider: '已加入 NaOH 体积 V（mL）',
    kindStrong: '盐酸（强酸）', kindWeak: '醋酸（弱酸，pKa 4.76）',
    autoTitrate: '从 0 自动滴到 50 mL', clear0: '清空曲线',
    c0a: '滴定曲线：pH 随加入的 NaOH 体积', c0b: '物质的量（mmol）：加入的 OH⁻ 与原有的酸',
    s0lgCurve: '已测到的曲线', s0lgNow: '当前', s0lgAcid: '原有的酸 2.50 mmol（框）', s0lgOH: '已加入的 OH⁻', s0lgEq: '等当点 25.00 mL',
    s0progress: '自动滴定中：{v}/50 mL · ',
    s0readout: '{prog}V = {v} mL：已加入 OH⁻ {nb} mmol，{state}pH = {pH}。',
    s0before: '酸还剩 {left} mmol 没被中和，',
    s0eq: '恰好等于原有的酸（等当点），',
    s0after: 'OH⁻ 比原有的酸多出 {sur} mmol，',
    s0hint: '观察顺序：先选「盐酸」，按「从 0 自动滴到 50 mL」，看白线一路描出曲线：开头 20 多毫升只从 pH 1 爬到 2 左右，下图青色长条逐渐填满酸的框，填满的那一刻（25 mL）曲线几乎竖直跳起，之后又变平。再选「醋酸」重来：起点更高，中段更平缓地上升，跳起的部分更短。也可以直接拖滑杆，走过的地方都会留在图上。',

    s1k: '第 1 步 · 逐滴放大',
    s1t: '同样是一滴，为什么快到终点时 pH 跳得特别多？',
    s1e: '这一步要回答：每一滴 NaOH 带进的 OH⁻ 都一样多，为什么它造成的 pH 变化在等当点（加入的 OH⁻ 恰好等于原有酸的量，这里是 25.00 mL）附近突然变大？这里只看盐酸（强酸），滴定管每滴 0.05 mL，带进 0.100 × 0.05 = <strong>0.005 mmol OH⁻</strong>。关键在于 pH 看的是 H⁺ 浓度的<strong>倍数</strong>：pH 每升 1，H⁺ 浓度变为原来的 1/10。在 20 mL 时酸还剩 0.500 mmol，一滴只消掉其中 1%，H⁺ 几乎没变；到 24.95 mL 时酸只剩 0.005 mmol，下一滴就把它<strong>全部</strong>消掉，H⁺ 浓度一下子缩小约一千倍。',
    v1Slider: '已加入体积 V（mL，每格一滴 0.05 mL）', walk1: '从 20 mL 逐滴走到 30 mL', clear1: '清空记录',
    c1a: '放大 20–30 mL 的滴定曲线（盐酸）', c1b: '每一滴让 pH 升了多少（ΔpH / 滴）',
    s1lgCurve: '走过的曲线', s1lgStem: '一滴造成的 ΔpH', s1lgNow: '当前这一滴',
    s1progress: '已走 {k}/200 滴 · ',
    s1before: '{prog}V = {v} mL：酸还剩 {left} mmol，下一滴的 0.005 mmol OH⁻ 消掉其中 {pct}%，pH 由 {p0} 变为 {p1}（+{d}）。',
    s1last: '{prog}V = {v} mL：酸只剩 {left} mmol，正好是一滴的量，下一滴把它全部中和，pH 由 {p0} 跳到 {p1}（+{d}）。',
    s1eq: '{prog}V = {v} mL：酸恰好全部中和，pH = {p0}；下一滴带进的 0.005 mmol OH⁻ 全部成为过量，pH 由 {p0} 跳到 {p1}（+{d}）。',
    s1after: '{prog}V = {v} mL：OH⁻ 已过量 {sur} mmol，下一滴使过量增加 {pct}%，pH 由 {p0} 变为 {p1}（+{d}）。',
    s1hint: '观察顺序：按「从 20 mL 逐滴走到 30 mL」，看下图每走一滴就竖起一根柱：前面的柱矮得几乎看不见，越接近 25 mL 越高，24.95 → 25.00 和 25.00 → 25.05 这两滴各升约 3 个 pH 单位；过了终点柱子又迅速变矮。读数里的百分比说明原因：一滴消掉剩余酸的比例从 1% 涨到 100%。',

    s2k: '第 2 步 · 弱酸的曲线',
    s2t: '换成弱酸，曲线哪里变了？能从曲线上读出酸有多弱吗？',
    s2e: '这一步要回答：弱酸的滴定曲线和强酸有什么不同，怎样从曲线读出它的强弱？弱酸 HA 在水里只有一小部分解离成 H⁺ 和 A⁻，强弱用<strong>解离常数 Ka</strong> 衡量：Ka = [H⁺][A⁻] / [HA]（方括号是平衡时的浓度），Ka 越小酸越弱。常把它写成 <strong>pKa</strong> = −lg Ka（即 Ka = 10⁻ᵖᴷᵃ），pKa 越大酸越弱；醋酸的 pKa 是 4.76。滴到一半（12.50 mL，叫<strong>半等当点</strong>）时，一半的 HA 变成了 A⁻，[HA] ≈ [A⁻]，代进上式就得到 [H⁺] ≈ Ka，也就是 <strong>pH ≈ pKa</strong>。到等当点（25.00 mL），瓶里是 A⁻ 的溶液，A⁻ 会从水里夺 H⁺ 生成少量 OH⁻，所以等当点的 pH 大于 7。',
    pKaSlider: '弱酸的 pKa（2–10）',
    c2title: '弱酸的滴定曲线（0.100 mol/L）',
    s2lgWeak: '这种弱酸', s2lgStrong: '强酸（对照）', s2lgHalf: '半等当点 12.50 mL', s2lgEq: '等当点 25.00 mL', s2lgSeven: 'pH 7',
    s2readout: 'pKa = {pKa}：起始 pH {p0}（强酸是 1.00）；半等当点 pH {ph} ，与 pKa 相差 {dh}；等当点 pH {pe}（强酸是 7.00）。',
    s2hint: '观察顺序：保持其他不变，只拖 pKa。看橙色点（半等当点）始终几乎落在 pKa 那条水平虚线上，整段中间部分跟着上下平移；白点（等当点）始终高于 7，pKa 越大越高，跳起的部分也越短。把 pKa 拖到 3 以下再看读数：酸较强时自己已解离不少，pH ≈ pKa 开始不准（pKa 2 时差约 0.18）。在 0.100 mol/L 下，pKa 4 到 10 之间相差不到 0.01。',

    s3k: '第 3 步 · 浓度',
    s3t: '酸和碱都稀 10 倍，悬崖还有多高？',
    s3e: '这一步要回答：酸和 NaOH 的浓度一起变小时，等当点附近的 pH 跳跃（悬崖）会怎样？为了能比较，给悬崖一个量法：<strong>突跃范围</strong> = 加入量从等当点的 99.9% 到 100.1%（24.975 → 25.025 mL，前后各差千分之一）时 pH 走过的区间。在这个区间里停下，测出的浓度误差不超过 ±0.1%。浓度降低时，等当点前剩下的 H⁺ 和等当点后多出的 OH⁻ 都按比例变少，曲线两头都向 7 靠拢，所以突跃变矮。',
    cPick: '酸与 NaOH 的浓度',
    c3title: '三种浓度的滴定曲线（高亮的是当前选择）',
    s3lgSel: '当前浓度', s3lgOther: '其他两种浓度', s3lgBand: '当前浓度的突跃范围',
    s3readout: '{kind}，{c} mol/L：突跃范围 pH {a} → {b}，高 {h} 个 pH 单位。',
    s3hint: '观察顺序：先选「盐酸」，把浓度从 0.100 依次换到 0.0100、0.00100，看高亮曲线的起点抬高、末端降低，橙色带（突跃范围）一次比一次窄：从 4.30–9.70 到 5.30–8.70，再到只剩 6.28–7.72。再换「醋酸」：同样浓度下突跃本来就矮（0.100 mol/L 时 7.75–9.70），稀到 0.00100 mol/L 时只剩不到 0.4 个单位，几乎找不到悬崖。',

    s4k: '第 4 步 · 选指示剂',
    s4t: '指示剂在哪里变色，才能让终点落在等当点上？',
    s4e: '这一步要回答：用颜色判断「滴够了」时，选哪种指示剂误差最小？<strong>指示剂</strong>是会随 pH 变色的物质，每种只在一段 pH 里变色（<strong>变色范围</strong>）。本页把颜色变到一半、即 pH 到达变色范围中点的那一刻当作<strong>终点</strong>：实验者看到变色、停止滴定的位置。终点由指示剂决定，<strong>等当点</strong>（加入的 OH⁻ 恰好等于原有的酸，25.00 mL）由反应决定，两者之差就是滴定误差。因为 pH 随加入量单调上升，<strong>变色点落在突跃范围（99.9%–100.1% 时 pH 走过的区间）内 ⟺ 误差不超过 ±0.1%</strong>。',
    indPick: '指示剂',
    ind_mo: '甲基橙 3.1–4.4', ind_mr: '甲基红 4.4–6.2', ind_btb: '溴百里酚蓝 6.0–7.6', ind_pp: '酚酞 8.2–10.0',
    c4a: '滴定曲线、突跃范围与指示剂变色范围', c4b: '放大 23–27 mL：终点与等当点',
    s4lgCurve: '滴定曲线', s4lgJump: '突跃范围', s4lgInd: '指示剂变色范围（右侧色条；虚线 = 变色点）', s4lgEnd: '终点',
    s4readout: '{kind}，{c} mol/L，{ind}：变色点 pH {m}，终点 V = {v} mL，比等当点{dir} {dv} mL（{rel}）。',
    s4ok: '变色点在突跃范围 {a}–{b} 内，误差在 ±0.1% 以内。',
    s4bad: '变色点不在突跃范围 {a}–{b} 内，误差超过 0.1%。',
    s4start: '{kind}，{c} mol/L，{ind}：还没开始滴，溶液的 pH {p0} 已经越过变色点 {m}，指示剂一开始就显碱色，完全不能用。',
    dirEarly: '早', dirLate: '晚',
    s4hint: '观察顺序：先选「盐酸 · 0.100 mol/L」，依次换四种指示剂：变色带都和突跃有交集，误差最大的是甲基橙（−0.36%）。再换「醋酸」：突跃整体抬到 7.75 以上，只有酚酞的变色点落在里面；甲基橙、甲基红在曲线平缓的中段就变色，终点提前 5 毫升以上。最后把浓度调到 0.00100 mol/L：连强酸也只有溴百里酚蓝还能用。',

    s5k: '第 5 步 · 收束',
    s5t: '一条曲线读出三件事',
    s5fin: '<strong>悬崖来自「pH 看倍数」</strong>：每滴带进的 OH⁻ 一样多，但快到等当点时剩下的酸只有一两滴的量，一滴就让 H⁺ 浓度缩小约一千倍（第 1 步）。<strong>弱酸的曲线自带 pKa</strong>：半等当点的 pH ≈ pKa，等当点 pH > 7（第 2 步）。<strong>浓度越稀悬崖越矮</strong>，突跃范围从两头向 7 收缩（第 3 步）。<strong>指示剂的变色点要落在突跃范围里</strong>，误差才不超过 ±0.1%（第 4 步）。',
    formula: '强酸：等当点前 [H⁺] ≈ 剩余的酸 ÷ 总体积\n弱酸：半等当点 pH ≈ pKa\n终点误差 ≤ ±0.1%　⟺　变色点 ∈ 突跃范围',
    boundary: '模型的适用范围：25 °C，一元酸，酸与 NaOH 浓度相同，体积直接相加；pH 由完整的电荷守恒精确求解，把浓度当有效浓度，不计离子强度、空气中 CO₂ 溶入和指示剂本身消耗的碱。「终点 = 变色范围中点」是本页的约定：实际操作中人眼看到的变色点因人、因光线而异（酚酞通常一出现淡粉色就停），误差数字只说明趋势，不是实验数据。',
    quizPrompt: '想一想：用 0.100 mol/L NaOH 滴定 25.00 mL 0.100 mol/L 醋酸，四种指示剂里该选哪一种？',
    quizA: '甲基橙：它变色最明显', quizB: '酚酞：变色点落在弱酸的突跃范围里', quizC: '溴百里酚蓝：变色点最接近 7',
    check: '核对',
    correct: '对。醋酸的突跃范围是 {a}–{b}，只有酚酞的变色点 {m} 在里面，终点误差 {e}。',
    wrong: '再想想：弱酸的等当点 pH 大于 7（这里约 {pe}），突跃范围是 {a}–{b}。溴百里酚蓝会早 {d} mL 变色，甲基橙更早。回第 4 步选「醋酸」试一试。',
    linksTitle: '接着去哪儿',
    lk1: 'pH 标度 · 第 1 步：为什么 pH 差 1 就是 H⁺ 差 10 倍 →',
    lk2: '缓冲溶液 · 第 2 步：半等当点附近那段平缓的曲线，就是缓冲区 →',
    lk3: '酸碱平衡 · 第 1 步：Ka 越大，弱酸解离得越多 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《滴定曲线 · 终点附近 pH 的“悬崖”》的平行版本。'
  },
  en: {
    pageTitle: 'Titration Curves · Why the Last Drop Jumps Highest',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Titration Curves · The pH Cliff Near the End Point →',
    navLabel: 'Titration curve steps',
    tagline: 'Add NaOH solution of the same concentration drop by drop to 25.00 mL of acid, note the pH at every moment, and you have a titration curve. It rises gently, then leaps almost vertically near the equivalence point. In six steps you find, drop by drop, where that cliff comes from, read a weak acid’s pKa off the curve, watch concentration cut the cliff down, and finally use the cliff to choose an indicator.',
    nav0: '0 Draw the curve', nav1: '1 Where the cliff comes from', nav2: '2 Weak acids & pKa', nav3: '3 Concentration', nav4: '4 Choose an indicator', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Where a curve comes from',
    s0t: 'Add base and measure the pH as you go: what does the curve look like?',
    s0e: 'This step answers: as base is added to an acid, how does the pH (the power in [H⁺] = 10⁻ᵖᴴ; lower means more acidic) change with the amount added? A <strong>titration</strong> uses a burette to add a solution of known concentration — here NaOH, a strong base that is fully ionised — little by little to the solution being tested until they have just reacted completely. The flask holds 25.00 mL of a 0.100 mol/L monoprotic acid HA, 2.50 mmol in all. The NaOH is also 0.100 mol/L, so V mL of it brings 0.100 × V mmol of OH⁻, which reacts one-to-one: HA + OH⁻ → A⁻ + H₂O. The moment the OH⁻ added equals the acid present at the start is the <strong>equivalence point</strong>, here at V = 25.00 mL. Draw the curve first with hydrochloric acid (a <strong>strong acid</strong>: HCl turns completely into H⁺ in water), then switch to acetic acid (a <strong>weak acid</strong>: only a small fraction turns into H⁺) and compare.',
    vSlider: 'NaOH added, V (mL)',
    kindStrong: 'Hydrochloric acid (strong)', kindWeak: 'Acetic acid (weak, pKa 4.76)',
    autoTitrate: 'Titrate automatically from 0 to 50 mL', clear0: 'Clear the curve',
    c0a: 'Titration curve: pH against NaOH volume added', c0b: 'Amounts (mmol): OH⁻ added vs. the acid at the start',
    s0lgCurve: 'curve measured so far', s0lgNow: 'now', s0lgAcid: 'acid at the start, 2.50 mmol (frame)', s0lgOH: 'OH⁻ added', s0lgEq: 'equivalence point, 25.00 mL',
    s0progress: 'Titrating: {v}/50 mL · ',
    s0readout: '{prog}V = {v} mL: {nb} mmol of OH⁻ added; {state}pH = {pH}.',
    s0before: '{left} mmol of acid still un-neutralised; ',
    s0eq: 'exactly the acid present at the start (equivalence point); ',
    s0after: '{sur} mmol more OH⁻ than the acid present at the start; ',
    s0hint: 'What to try: choose hydrochloric acid and press “Titrate automatically”. The white line traces the curve: over the first 20-odd mL the pH only creeps from 1 to about 2 while the cyan bar below fills the acid’s frame; the moment it is full (25 mL) the curve leaps almost straight up, then flattens again. Repeat with acetic acid: it starts higher, climbs more gently through the middle, and the leap is shorter. You can also drag the slider; everywhere you have been stays on the plot.',

    s1k: 'Step 1 · Zooming in drop by drop',
    s1t: 'Every drop is the same size, so why does the pH jump so much near the end?',
    s1e: 'This step answers: each drop of NaOH brings the same amount of OH⁻, so why is its effect on pH suddenly so large near the equivalence point (where the OH⁻ added just equals the acid present at the start, here 25.00 mL)? We use hydrochloric acid (strong) only. Each drop from the burette is 0.05 mL and carries 0.100 × 0.05 = <strong>0.005 mmol of OH⁻</strong>. The key is that pH tracks <strong>factors</strong> of the H⁺ concentration: each unit of pH is a factor of 10. At 20 mL there is still 0.500 mmol of acid, and a drop removes just 1% of it, barely changing H⁺. At 24.95 mL only 0.005 mmol is left, and the next drop removes <strong>all</strong> of it, cutting the H⁺ concentration about a thousandfold at once.',
    v1Slider: 'Volume added, V (mL; each notch is one 0.05 mL drop)', walk1: 'Step drop by drop from 20 to 30 mL', clear1: 'Clear the record',
    c1a: 'Titration curve zoomed to 20–30 mL (hydrochloric acid)', c1b: 'How much each drop raises the pH (ΔpH per drop)',
    s1lgCurve: 'curve walked so far', s1lgStem: 'ΔpH caused by one drop', s1lgNow: 'the current drop',
    s1progress: '{k}/200 drops walked · ',
    s1before: '{prog}V = {v} mL: {left} mmol of acid left; the next drop’s 0.005 mmol of OH⁻ removes {pct}% of it, taking the pH from {p0} to {p1} (+{d}).',
    s1last: '{prog}V = {v} mL: only {left} mmol of acid is left — exactly one drop’s worth — so the next drop neutralises all of it and the pH leaps from {p0} to {p1} (+{d}).',
    s1eq: '{prog}V = {v} mL: the acid is exactly used up, pH = {p0}; all 0.005 mmol of OH⁻ in the next drop is surplus, so the pH leaps from {p0} to {p1} (+{d}).',
    s1after: '{prog}V = {v} mL: OH⁻ is already {sur} mmol in excess; the next drop raises that excess by {pct}%, taking the pH from {p0} to {p1} (+{d}).',
    s1hint: 'What to try: press “Step drop by drop” and watch a bar rise in the lower plot for each drop. The early bars are almost invisible; they grow as 25 mL approaches, and the two drops 24.95 → 25.00 and 25.00 → 25.05 each add about 3 pH units. Past the end point the bars shrink fast again. The percentage in the readout tells you why: the share of the remaining acid that one drop removes climbs from 1% to 100%.',

    s2k: 'Step 2 · Weak-acid curves',
    s2t: 'Switch to a weak acid: what changes, and can the curve tell you how weak it is?',
    s2e: 'This step answers: how does a weak acid’s titration curve differ from a strong acid’s, and how can you read its strength off the curve? Only a small fraction of a weak acid HA splits into H⁺ and A⁻ in water. Its strength is measured by the <strong>dissociation constant Ka</strong> = [H⁺][A⁻] / [HA] (square brackets are equilibrium concentrations); smaller Ka means weaker. It is usually quoted as <strong>pKa</strong> = −lg Ka (that is, Ka = 10⁻ᵖᴷᵃ), so larger pKa means weaker; acetic acid has pKa 4.76. Half-way to the equivalence point (12.50 mL, the <strong>half-equivalence point</strong>), half of the HA has become A⁻, so [HA] ≈ [A⁻], and the formula gives [H⁺] ≈ Ka, i.e. <strong>pH ≈ pKa</strong>. At the equivalence point (25.00 mL) the flask holds a solution of A⁻, which pulls H⁺ off water and leaves a little OH⁻, so the pH there is above 7.',
    pKaSlider: 'pKa of the weak acid (2–10)',
    c2title: 'Weak-acid titration curve (0.100 mol/L)',
    s2lgWeak: 'this weak acid', s2lgStrong: 'strong acid (reference)', s2lgHalf: 'half-equivalence, 12.50 mL', s2lgEq: 'equivalence, 25.00 mL', s2lgSeven: 'pH 7 line',
    s2readout: 'pKa = {pKa}: starting pH {p0} (strong acid: 1.00); half-equivalence pH {ph}, off pKa by {dh}; equivalence pH {pe} (strong acid: 7.00).',
    s2hint: 'What to try: change only the pKa. The orange dot (half-equivalence) stays almost exactly on the dashed pKa line while the middle of the curve slides up and down with it; the white dot (equivalence) always sits above 7, higher for larger pKa, and the leap gets shorter. Drag pKa below 3 and read the numbers: a fairly strong acid has already dissociated a lot by itself, and pH ≈ pKa starts to slip (off by about 0.18 at pKa 2). At 0.100 mol/L the gap is under 0.01 for pKa 4 to 10.',

    s3k: 'Step 3 · Concentration',
    s3t: 'Dilute both acid and base tenfold: how tall is the cliff now?',
    s3e: 'This step answers: when the acid and the NaOH are both made more dilute, what happens to the pH leap (the cliff) at the equivalence point? To compare cliffs we need a measure: the <strong>jump range</strong> is the stretch of pH covered as the volume added goes from 99.9% to 100.1% of the equivalence volume (24.975 → 25.025 mL, one part in a thousand either side). Stopping anywhere inside it gives a concentration error within ±0.1%. When concentrations fall, the H⁺ left before the equivalence point and the OH⁻ in excess after it both shrink in proportion, so both ends of the curve move towards 7 and the jump gets shorter.',
    cPick: 'Concentration of acid and NaOH',
    c3title: 'Curves at three concentrations (current highlighted)',
    s3lgSel: 'current concentration', s3lgOther: 'the other two', s3lgBand: 'jump range at the current concentration',
    s3readout: '{kind}, {c} mol/L: jump range pH {a} → {b}, {h} pH units tall.',
    s3hint: 'What to try: with hydrochloric acid, step the concentration from 0.100 to 0.0100 to 0.00100 mol/L. The highlighted curve starts higher and ends lower, and the orange band (jump range) narrows each time: from 4.30–9.70 to 5.30–8.70 and then just 6.28–7.72. Now switch to acetic acid: its jump is short to begin with (7.75–9.70 at 0.100 mol/L) and at 0.00100 mol/L less than 0.4 units remain — the cliff has all but gone.',

    s4k: 'Step 4 · Choosing an indicator',
    s4t: 'Where must the indicator change colour for the end point to land on the equivalence point?',
    s4e: 'This step answers: when colour tells you “that’s enough”, which indicator gives the smallest error? An <strong>indicator</strong> is a substance whose colour depends on pH, changing over one stretch of pH (its <strong>transition range</strong>). On this page the <strong>end point</strong> — where the experimenter sees the change and stops — is taken as the moment the pH reaches the middle of that range, half-way through the colour change. The end point is set by the indicator; the <strong>equivalence point</strong> (OH⁻ added equals the acid present at the start, 25.00 mL) is set by the reaction; the gap between them is the titration error. Because pH rises steadily with volume, <strong>the colour-change point lies inside the jump range (the pH stretch from 99.9% to 100.1%) exactly when the error is within ±0.1%</strong>.',
    indPick: 'Indicator',
    ind_mo: 'Methyl orange 3.1–4.4', ind_mr: 'Methyl red 4.4–6.2', ind_btb: 'Bromothymol blue 6.0–7.6', ind_pp: 'Phenolphthalein 8.2–10.0',
    c4a: 'Titration curve, jump range and indicator transition range', c4b: 'Zoom to 23–27 mL: end point vs. equivalence point',
    s4lgCurve: 'titration curve', s4lgJump: 'jump range', s4lgInd: 'indicator transition range (strip at right; dashed line = change point)', s4lgEnd: 'end point',
    s4readout: '{kind}, {c} mol/L, {ind}: change point pH {m}; end point V = {v} mL, {dv} mL {dir} than the equivalence point ({rel}).',
    s4ok: 'The change point lies inside the jump range {a}–{b}, so the error is within ±0.1%.',
    s4bad: 'The change point lies outside the jump range {a}–{b}, so the error exceeds 0.1%.',
    s4start: '{kind}, {c} mol/L, {ind}: before any base is added the pH is already {p0}, past the change point {m}; the indicator shows its alkaline colour from the start and is useless here.',
    dirEarly: 'earlier', dirLate: 'later',
    s4hint: 'What to try: start with hydrochloric acid at 0.100 mol/L and cycle through the four indicators. Every transition band overlaps the jump; the largest error is methyl orange’s (−0.36%). Switch to acetic acid: the whole jump sits above 7.75 and only phenolphthalein’s change point falls inside it, while methyl orange and methyl red change colour on the gentle middle of the curve, more than 5 mL early. Finally set 0.00100 mol/L: even for the strong acid only bromothymol blue still works.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Three things one curve tells you',
    s5fin: '<strong>The cliff comes from pH tracking factors</strong>: every drop brings the same OH⁻, but near the equivalence point only a drop or two of acid is left, so one drop cuts the H⁺ concentration about a thousandfold (step 1). <strong>A weak acid’s curve carries its pKa</strong>: the pH at half-equivalence ≈ pKa, and the equivalence pH is above 7 (step 2). <strong>The more dilute, the shorter the cliff</strong>, as the jump range shrinks towards 7 from both ends (step 3). <strong>An indicator’s change point must lie inside the jump range</strong> for the error to stay within ±0.1% (step 4).',
    formula: 'Strong acid, before equivalence: [H⁺] ≈ acid left ÷ total volume\nWeak acid at half-equivalence: pH ≈ pKa\nEnd-point error ≤ ±0.1%   ⟺   change point ∈ jump range',
    boundary: 'Where this model holds: 25 °C, a monoprotic acid, acid and NaOH at the same concentration, volumes simply adding. The pH is solved exactly from the full charge balance, treating concentrations as effective concentrations; ionic strength, CO₂ from the air and the base used up by the indicator itself are ignored. “End point = middle of the transition range” is this page’s convention: in practice the colour change people see depends on the person and the light (with phenolphthalein one usually stops at the first faint pink), so the error figures show trends, not lab data.',
    quizPrompt: 'Think: titrating 25.00 mL of 0.100 mol/L acetic acid with 0.100 mol/L NaOH, which of the four indicators should you choose?',
    quizA: 'Methyl orange: its colour change is the most striking', quizB: 'Phenolphthalein: its change point lies in the weak acid’s jump range', quizC: 'Bromothymol blue: its change point is closest to 7',
    check: 'Check',
    correct: 'Right. Acetic acid’s jump range is {a}–{b}, and only phenolphthalein’s change point, {m}, falls inside it; the end-point error is {e}.',
    wrong: 'Not quite: a weak acid’s equivalence pH is above 7 (about {pe} here) and its jump range is {a}–{b}. Bromothymol blue would change {d} mL early, methyl orange even earlier. Try acetic acid in step 4.',
    linksTitle: 'Where to next',
    lk1: 'The pH scale · step 1: why a pH gap of 1 means 10 times the H⁺ →',
    lk2: 'Buffers · step 2: the gentle stretch around half-equivalence is the buffer region →',
    lk3: 'Acid–base equilibrium · step 1: the larger Ka, the more a weak acid dissociates →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Titration Curves · The pH Cliff Near the End Point”.'
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
  if (typeof window.refreshTitration === 'function') window.refreshTitration();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.TITR_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
