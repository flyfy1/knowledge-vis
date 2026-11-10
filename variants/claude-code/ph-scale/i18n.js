'use strict';
// pH scale lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'pH 标度 · 数一数小数点后第几位',
    back: '← 知识索引',
    compare: '对照另一版本：pH 标度 →',
    navLabel: 'pH 标度步骤导航',
    tagline: '柠檬汁、纯水、肥皂水，酸碱程度差得很远。化学家用 0 到 14 之间的一个数 pH 来说清它。这个数其实是在数「H⁺ 的浓度写成小数时，小数点后第几位才出现数字」，所以 pH 每差 1，H⁺ 就差 10 倍。六步里你会亲手验证这件事，再用它解释指示剂、稀释和中和。',
    nav0: '0 一个数', nav1: '1 差 1 是 10 倍', nav2: '2 指示剂破案', nav3: '3 稀释', nav4: '4 中和', nav5: '5 收束',

    s0k: '第 0 步 · 刻度从哪来',
    s0t: '柠檬汁和肥皂水，能不能用一个数比出谁更酸？',
    s0e: '这一步要回答：怎样用一个数说明溶液有多酸或多碱？溶液之所以酸，是因为里面有<strong>氢离子 H⁺</strong>（氢原子失去电子后剩下的带正电的微粒），H⁺ 越多越酸。H⁺ 的多少用<strong>浓度 [H⁺]</strong> 表示：每升溶液里有多少摩尔 H⁺，单位 mol/L（摩尔是化学里数微粒的单位，1 摩尔约 6 × 10²³ 个）。麻烦在于这些数都很小：柠檬汁约 0.0063 mol/L，纯水只有 0.0000001 mol/L。于是改记「小数点后第几位才出现数字」：把 [H⁺] 写成 10 的负几次方，那个「几」就是 <strong>pH</strong>。例如 [H⁺] = 0.001 = 10⁻³ mol/L，pH 就是 3。在 25 °C：pH 小于 7 叫<strong>酸性</strong>，等于 7 叫<strong>中性</strong>（纯水），大于 7 叫<strong>碱性</strong>（碱性溶液里 H⁺ 极少，多的是氢氧根离子 OH⁻）。',
    liquid: '常见液体', pHslider: '直接拖 pH',
    custom: '自己设定的值',
    liq_stomach: '胃酸', liq_lemon: '柠檬汁', liq_vinegar: '食醋', liq_orange: '橙汁', liq_coffee: '黑咖啡', liq_rain: '雨水（未受污染）', liq_milk: '牛奶', liq_water: '纯水', liq_blood: '血液', liq_sea: '海水', liq_soda: '小苏打水', liq_soap: '肥皂水', liq_ammonia: '家用氨水', liq_bleach: '漂白水',
    c0a: 'pH 刻度（色带为万能指示剂示意色）', c0b: '[H⁺] 写成小数（mol/L），格下是第几位',
    zoneAcid: '← 酸性', zoneNeutral: '中性 7', zoneBase: '碱性 →',
    cls_acid: '酸性', cls_neutral: '中性', cls_base: '碱性',
    s0lgDot: '其他常见液体', s0lgNow: '当前选择', s0lgFirst: '第一个非零数字',
    s0readout: '{name}：pH {pH}，{cls}。[H⁺] ≈ {dec} mol/L，即 10 的 −{pH} 次方 mol/L，第一个非零数字落在小数点后第 {place} 位。',
    s0hint: '观察顺序：先在「常见液体」里依次选几种，看上图标记左右移动、下图橙色格（第一个非零数字）跟着左右挪；再拖 pH 滑杆从 2 到 3 到 4，看橙色格每次往右挪一位。拖滑杆时下拉框会显示「自己设定的值」。液体的 pH 是常见的典型值，实际样品会有出入。',

    s1k: '第 1 步 · 一把按倍数刻的尺子',
    s1t: 'pH 3 和 pH 5，H⁺ 的多少差几倍？',
    s1e: '这一步要回答：两个 pH 相差几，H⁺ 的浓度 [H⁺]（每升溶液里 H⁺ 的摩尔数）差几倍？由上一步，[H⁺] = 10⁻ᵖᴴ mol/L：pH 每大 1，小数点后就多一个 0，[H⁺] 变为原来的 1/10。所以 pH 差 2，[H⁺] 差 10 × 10 = <strong>100 倍</strong>，而不是差 2。pH 是一把<strong>按倍数刻的尺子</strong>：相邻两格之间永远是 ×10，不是 +1。普通直尺上就看不出来了：两份溶液画成按 [H⁺] 真实大小的长条，较少的那一份很快细得看不见。',
    pHA: '溶液 A 的 pH', pHB: '溶液 B 的 pH',
    c1a: 'pH 尺：A、B 之间每隔一格就是 ×10', c1b: '按 [H⁺] 真实大小画的长条（普通直尺）',
    s1lgA: '溶液 A', s1lgB: '溶液 B', s1lgArc: '每段弧 = [H⁺] × 10',
    s1readout: 'A：pH {a}，[H⁺] = {ha} mol/L　｜　B：pH {b}，[H⁺] = {hb} mol/L。相差 {d} 个 pH 单位，所以 {more} 的 [H⁺] 是 {less} 的 {r} 倍（10 的 {d} 次方）。下图里 {less} 的长条是 {more} 的 {pct}。',
    s1same: 'A、B 的 pH 相同（{a}），[H⁺] 也相同，都是 {ha} mol/L；下图两根长条一样长。',
    s1hint: '观察顺序：先把 A 设成 3、B 设成 5，看上图 A、B 之间有两段弧（每段 ×10），下图 B 的长条只有 A 的 1/100。保持 A 不动，把 B 一格一格往右拖：每多一格，B 的长条再缩成 1/10，到 pH 6 时已经不到 1 像素、看不见了，但它并不是 0。',
    tiny: '不到 1 像素',

    s2k: '第 2 步 · 用颜色缩小范围',
    s2t: '没有 pH 计，几滴颜色能把 pH 圈到多窄？',
    s2e: '这一步要回答：手边只有几种指示剂时，怎样用颜色判断一份溶液的 pH（即 [H⁺] 写成 10 的负几次方时的那个「几」）在什么范围？<strong>指示剂</strong>是遇到不同 pH 会变色的物质，每种只在一小段 pH 里变色，这一段叫它的<strong>变色范围</strong>：比这段更酸，显「酸色」；比这段更碱，显「碱色」；落在这段里，显两者之间的过渡色。所以一种指示剂只能告诉你 pH 在它变色范围的左边、里面还是右边。多试几种，把每次得到的范围叠在一起取重合的部分，范围就越来越窄。pH 试纸上的万能指示剂，就是把几种指示剂混在一起，让 0 到 14 每一段都有不同颜色。',
    ind_mo: '甲基橙', ind_litmus: '石蕊', ind_btb: '溴百里酚蓝', ind_pp: '酚酞',
    dropBtn: '滴入{name}',
    reveal: '揭晓：用 pH 计测', newSample: '换一份神秘溶液',
    c2title: '指示剂在 0–14 的颜色；亮段与看到的颜色相符',
    c2row: '{name} · 变色范围 {lo}–{hi}',
    c2comb: '把亮段叠在一起：pH 可能在这里',
    s2lgMatch: '与看到的颜色相符的一段', s2lgTrue: 'pH 计读数（揭晓后）',
    s2none: '神秘溶液第 {s} 份：还没滴指示剂，pH 可能是 0 到 14 中的任何值。',
    s2readout: '神秘溶液第 {s} 份：已试 {n}/4 种指示剂（{list}）。pH 可能在 {lo} 到 {hi} 之间，范围宽 {w} 个单位。',
    s2seen: '{name}显{col}',
    col_acid: '酸色', col_mid: '过渡色', col_base: '碱色',
    s2true: '　pH 计读数：{p}，确实落在这段里。',
    s2hint: '观察顺序：先只滴一种，看它那一行亮起哪一段、最下面一行的范围缩到哪里；再滴第二、第三种，看范围一次比一次窄。挑变色范围落在「当前可能范围」中间的指示剂，最能缩小范围；落在范围外的，滴了也得不到新信息。最后按「揭晓」核对。颜色是示意色，变色范围取教材常用值。',

    s3k: '第 3 步 · 稀释的尽头',
    s3t: '把酸一次次加水稀释，最后会变成碱吗？',
    s3e: '这一步要回答：把酸一次次稀释 10 倍，pH（[H⁺] 写成 10 的负几次方时的那个「几」）会不会一直加 1，最后超过 7？<strong>稀释</strong>就是加水让浓度变小：取 1 份溶液加 9 份水，浓度变为原来的 1/10。起点是 pH 2 的盐酸，盐酸是<strong>强酸</strong>：溶进水里的 HCl 全部变成 H⁺ 和 Cl⁻。按第 1 步的规则，每稀释一次 [H⁺] 变为 1/10，pH 加 1。可是水自己也会产生极少量的 H⁺ 和 OH⁻：纯水里两者各约 10⁻⁷ mol/L，这就是纯水 pH = 7 的原因。当酸带来的 H⁺ 稀到和这一点点「水自带的 H⁺」差不多时，就不能再忽略水了。',
    kSlider: '已稀释次数（每次 10 倍）',
    dilute: '再稀释 10 倍', restart3: '重新开始',
    startAcid: '起点：pH 2 的强酸', startBase: '起点：pH 12 的强碱',
    c3title: 'pH 随稀释次数的变化',
    s3lgReal: '实际 pH（算上水自带的 H⁺）', s3lgNaive: '只按「每次 pH ±1」推算', s3lgSeven: 'pH 7（中性）',
    s3readout: '稀释 {k} 次（1 mL 原液已变成 {vol}）：实际 pH = {pH}；只按每次 ±1 推算是 {naive}。',
    s3cross: '推算值已越过 7，实际却没有：{kind}带来的离子已经比水自带的还少，pH 只能越来越接近 7。',
    kind_acid: '酸', kind_base: '碱',
    s3hint: '观察顺序：先连按「再稀释 10 倍」，前 4 次看青色实际点和灰色虚线（每次 ±1 的推算）重合；第 5 次开始青点明显偏离虚线、弯向 7 的那条线；之后无论再稀释多少次，青点都停在 7 附近，不会越过去。换成「pH 12 的强碱」起点再试一次：从另一侧逼近 7。读数里的体积提醒你：稀释 5 次，1 mL 原液就要兑成 100 升。',

    s4k: '第 4 步 · 中和与倍数',
    s4t: '酸被中和掉 99%，pH 才升到几？',
    s4e: '这一步要回答：往酸里加碱，H⁺ 被消耗掉一大半时，pH（[H⁺] 写成 10 的负几次方时的那个「几」）升了多少？<strong>中和</strong>是碱里的 OH⁻ 与酸里的 H⁺ 一对一结合成水：H⁺ + OH⁻ → H₂O，H⁺ 因此变少。烧杯里是 20.0 mL、0.100 mol/L 的盐酸（pH 1）；用细滴管滴入 1.00 mol/L 的氢氧化钠溶液（NaOH，一种<strong>强碱</strong>，溶于水后全部变成 Na⁺ 和 OH⁻），每滴 0.0200 mL。算一下：盐酸里有 2.00 mmol H⁺，每滴带进 0.0200 mmol OH⁻，所以正好 <strong>100 滴</strong>中和完。先猜：中和掉一半（50 滴）时，pH 是 4 左右吗？',
    dropsSlider: '已滴入的 NaOH 滴数', add1: '+1 滴', add10: '+10 滴', restart4: '倒掉重来',
    c4a: '烧杯里的 pH 随滴数变化', c4b: '还剩多少 H⁺（占原来的比例，普通直尺）',
    s4lgCurve: '走过的路径', s4lgNow: '当前', s4lgLeft: '剩下的 H⁺', s4lgOH: '多出来的 OH⁻（同一把尺子）',
    s4before: '{n} 滴（{V} mL NaOH）：已中和 {pct}% 的 H⁺，还剩 {left}%，pH = {pH}。pH 比开始升了 {rise}：其中「H⁺ 剩 {left}%」贡献 {r}，溶液体积从 20.0 增到 {Vt} mL 再贡献 {v}。',
    s4start: '还没滴：烧杯里只有 20.0 mL 盐酸，2.00 mmol H⁺ 一个都没少，pH = {pH}。',
    s4eq: '{n} 滴：H⁺ 与 OH⁻ 恰好一对一中和完，溶液成了食盐水（NaCl 溶液），只剩水自带的 H⁺，pH = {pH}。',
    s4after: '{n} 滴：OH⁻ 比 H⁺ 多出 {ex} mmol，溶液已是碱性，pH = {pH}。',
    s4hint: '观察顺序：先按「+10 滴」走到 50、90 滴，看下图 H⁺ 长条已经短了一半、九成，上图 pH 却只从 1 爬到 1.3、2.0；再用「+1 滴」从 97 滴一滴一滴走到 103 滴，看上图 pH 在 99 → 100 → 101 滴之间一滴跳好几个单位。原因还是倍数：从剩 1% 到剩 0%，pH 不是再升 1，而是一下子到了中性和碱性。',

    s5k: '第 5 步 · 收束',
    s5t: '一句话说清 pH',
    s5fin: '<strong>pH 数的是 H⁺ 浓度的「小数点后第几位」</strong>：[H⁺] = 10⁻ᵖᴴ mol/L。所以刻度上相邻两格是 ×10 而不是 +1（第 1 步）；指示剂只能把 pH 圈进某一段，多种合用才能圈窄（第 2 步）；稀释能让 pH 逼近 7，却不能越过 7，因为水本身带着 10⁻⁷ mol/L 的 H⁺ 和 OH⁻（第 3 步）；中和掉 99% 的 H⁺ 只让 pH 升约 2，最后一滴才让它跳过 7（第 4 步）。',
    formula: 'pH = −lg[H⁺]　⇔　[H⁺] = 10⁻ᵖᴴ mol/L\npH 每 +1　→　[H⁺] × 1/10\n25 °C：pH < 7 酸性 · pH = 7 中性 · pH > 7 碱性',
    lgNote: '式中 lg 读作「以 10 为底的对数」，意思就是「10 的几次方」，高中会正式学到。',
    boundary: '模型的适用范围：25 °C 的稀水溶液；把浓度当作「有效浓度」（很浓的溶液里两者有差别，pH 也可能小于 0 或大于 14）；稀释和中和只用了强酸、强碱，体积直接相加；指示剂颜色是示意色。醋酸这样的弱酸只有一部分变成 H⁺，同样浓度下 pH 更高，规则见下方「酸碱平衡」页。温度改变时，纯水的 pH 也不再正好是 7。',
    quizPrompt: '想一想：未受污染的雨水 pH 约 5.6，柠檬汁 pH 约 2.2。柠檬汁里的 H⁺ 浓度大约是雨水的多少倍？',
    quizA: '约 3.4 倍：5.6 − 2.2', quizB: '约 2500 倍：10 的 3.4 次方', quizC: '约 2.5 倍：5.6 ÷ 2.2',
    check: '核对',
    correct: '对。pH 差 5.6 − 2.2 = 3.4，H⁺ 浓度就差 10 的 3.4 次方 ≈ {r} 倍。pH 的差要放到 10 的指数上，而不是直接当倍数。',
    wrong: '再想想：pH 差 1 是 10 倍，差 2 是 100 倍。这里差 3.4，倍数应该在 1000 到 10000 之间。可以回第 1 步把 A 设成 2、B 设成 5.5 看一看。',
    linksTitle: '接着去哪儿',
    lk1: '指数与对数 · 第 2 步：「10 的几次方」怎样反过来问，这就是 lg →',
    lk2: '酸碱平衡 · 第 1 步：弱酸只解离一部分，Ka 越大 H⁺ 越多 →',
    lk3: '缓冲溶液 · 第 0 步：为什么有的溶液加了酸碱 pH 几乎不动 →',
    lk4: '滴定曲线 · 第 0 步：一滴一滴加碱，把第 4 步的跳跃画成整条曲线 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《pH 标度》的平行版本。'
  },
  en: {
    pageTitle: 'The pH Scale · Counting Decimal Places',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The pH Scale →',
    navLabel: 'pH scale steps',
    tagline: 'Lemon juice, pure water and soapy water sit far apart in how acidic or alkaline they are. Chemists capture that with one number between 0 and 14, the pH. That number really counts which decimal place the H⁺ concentration first shows a digit in, so a difference of 1 in pH is a factor of 10 in H⁺. In six steps you check this yourself and use it to explain indicators, dilution and neutralisation.',
    nav0: '0 One number', nav1: '1 One step = ×10', nav2: '2 Indicator detective', nav3: '3 Dilution', nav4: '4 Neutralisation', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Where the scale comes from',
    s0t: 'Lemon juice or soapy water: can one number say which is more acidic?',
    s0e: 'This step answers: how can a single number describe how acidic or alkaline a solution is? A solution is acidic because it contains <strong>hydrogen ions, H⁺</strong> (what is left of a hydrogen atom after it loses its electron); the more H⁺, the more acidic. The amount is given as a <strong>concentration, [H⁺]</strong>: moles of H⁺ per litre of solution, in mol/L (the mole is chemistry’s counting unit, about 6 × 10²³ particles). The trouble is how small these numbers are: lemon juice has about 0.0063 mol/L, pure water only 0.0000001 mol/L. So instead we note which decimal place the digits start in: write [H⁺] as 10 to a negative power, and that power is the <strong>pH</strong>. For example [H⁺] = 0.001 = 10⁻³ mol/L gives pH 3. At 25 °C, pH below 7 is <strong>acidic</strong>, exactly 7 is <strong>neutral</strong> (pure water) and above 7 is <strong>alkaline</strong> (an alkaline solution has very little H⁺ and plenty of hydroxide ions, OH⁻).',
    liquid: 'Everyday liquid', pHslider: 'Or drag the pH',
    custom: 'A value you set',
    liq_stomach: 'Stomach acid', liq_lemon: 'Lemon juice', liq_vinegar: 'Vinegar', liq_orange: 'Orange juice', liq_coffee: 'Black coffee', liq_rain: 'Clean rain', liq_milk: 'Milk', liq_water: 'Pure water', liq_blood: 'Blood', liq_sea: 'Seawater', liq_soda: 'Baking-soda water', liq_soap: 'Soapy water', liq_ammonia: 'Household ammonia', liq_bleach: 'Bleach',
    c0a: 'The pH scale (illustrative indicator colours)', c0b: '[H⁺] as a decimal (mol/L), places below',
    zoneAcid: '← acidic', zoneNeutral: 'neutral 7', zoneBase: 'alkaline →',
    cls_acid: 'acidic', cls_neutral: 'neutral', cls_base: 'alkaline',
    s0lgDot: 'other everyday liquids', s0lgNow: 'current choice', s0lgFirst: 'first non-zero digit',
    s0readout: '{name}: pH {pH}, {cls}. [H⁺] ≈ {dec} mol/L, i.e. 10 to the power −{pH} mol/L; its first non-zero digit sits in decimal place {place}.',
    s0hint: 'What to try: pick a few liquids from the list and watch the marker on the pH scale move while the orange box (the first non-zero digit) in the decimal panel shifts with it. Then drag the pH slider from 2 to 3 to 4: each step moves the orange box one place to the right. Dragging the slider switches the list to “A value you set”. The liquids’ pH values are typical figures; real samples vary.',

    s1k: 'Step 1 · A ruler marked in factors',
    s1t: 'pH 3 versus pH 5: how many times more H⁺?',
    s1e: 'This step answers: when two pH values differ by some amount, by what factor do their H⁺ concentrations [H⁺] (moles of H⁺ per litre) differ? From step 0, [H⁺] = 10⁻ᵖᴴ mol/L, so every extra unit of pH adds one more zero after the decimal point and divides [H⁺] by 10. A pH gap of 2 is therefore 10 × 10 = <strong>100 times</strong> in [H⁺], not “2 more”. pH is a <strong>ruler marked in factors</strong>: neighbouring marks are always ×10 apart, never +1. An ordinary ruler hides this: draw the two samples as bars scaled to their real [H⁺] and the weaker one quickly becomes too thin to see.',
    pHA: 'pH of solution A', pHB: 'pH of solution B',
    c1a: 'pH ruler: each mark between A and B is a factor of 10', c1b: 'Bars drawn to their real [H⁺] (an ordinary ruler)',
    s1lgA: 'solution A', s1lgB: 'solution B', s1lgArc: 'each arc = [H⁺] × 10',
    s1readout: 'A: pH {a}, [H⁺] = {ha} mol/L  |  B: pH {b}, [H⁺] = {hb} mol/L. They are {d} pH units apart, so {more} has {r} times the [H⁺] of {less} (10 to the power {d}). In the bar panel, {less}’s bar is {pct} of {more}’s.',
    s1same: 'A and B have the same pH ({a}) and so the same [H⁺], {ha} mol/L; the two bars are equally long.',
    s1hint: 'What to try: set A to 3 and B to 5. The pH ruler shows two arcs between them (each ×10) and B’s bar is 1/100 of A’s. Keep A fixed and drag B right one mark at a time: each mark shrinks B’s bar by another factor of 10, and by pH 6 it is under a pixel wide and invisible — yet it is not zero.',
    tiny: 'under 1 pixel',

    s2k: 'Step 2 · Narrowing it down by colour',
    s2t: 'Without a pH meter, how tightly can a few drops of colour pin down the pH?',
    s2e: 'This step answers: with only a few indicators to hand, how do you use colour to say what range a solution’s pH (the power in [H⁺] = 10⁻ᵖᴴ) lies in? An <strong>indicator</strong> is a substance whose colour depends on pH, and each one changes colour only over a short stretch of pH called its <strong>transition range</strong>. More acidic than that stretch, it shows its “acid colour”; more alkaline, its “alkaline colour”; inside the stretch, something in between. So one indicator only tells you whether the pH is left of, inside or right of its transition range. Try several and keep only the part where all their answers overlap, and the range narrows. The universal indicator in pH paper is several indicators mixed together so that every part of 0–14 has its own colour.',
    ind_mo: 'Methyl orange', ind_litmus: 'Litmus', ind_btb: 'Bromothymol blue', ind_pp: 'Phenolphthalein',
    dropBtn: 'Add {name}',
    reveal: 'Reveal: measure with a pH meter', newSample: 'New mystery solution',
    c2title: 'Indicator colours; bright = matches what you saw',
    c2row: '{name} · changes at {lo}–{hi}',
    c2comb: 'Overlap of the bright stretches: the pH must be here',
    s2lgMatch: 'stretch matching the colour you saw', s2lgTrue: 'pH meter reading (after reveal)',
    s2none: 'Mystery solution #{s}: no indicator added yet, so the pH could be anything from 0 to 14.',
    s2readout: 'Mystery solution #{s}: {n}/4 indicators tried ({list}). The pH lies between {lo} and {hi}, a window {w} units wide.',
    s2seen: '{name} showed its {col}',
    col_acid: 'acid colour', col_mid: 'in-between colour', col_base: 'alkaline colour',
    s2true: ' pH meter reading: {p}, inside that window as expected.',
    s2hint: 'What to try: add just one indicator and see which stretch of its row lights up and where the bottom row’s window shrinks to. Add a second and a third and watch the window narrow each time. An indicator whose transition range sits in the middle of the current window narrows it most; one whose range lies outside the window tells you nothing new. Press “Reveal” to check. Colours are illustrative; transition ranges are common textbook values.',

    s3k: 'Step 3 · Where dilution ends',
    s3t: 'Keep watering down an acid: does it eventually turn alkaline?',
    s3e: 'This step answers: if an acid is diluted tenfold again and again, does its pH (the power in [H⁺] = 10⁻ᵖᴴ) keep rising by 1 until it passes 7? <strong>Dilution</strong> means adding water to lower the concentration: 1 part solution plus 9 parts water gives one tenth of the concentration. We start from hydrochloric acid at pH 2. It is a <strong>strong acid</strong>: every HCl dissolved splits into H⁺ and Cl⁻. By step 1’s rule each dilution cuts [H⁺] to a tenth and adds 1 to the pH. But water itself produces a tiny amount of H⁺ and OH⁻ — about 10⁻⁷ mol/L of each in pure water, which is exactly why pure water has pH 7. Once the acid’s own H⁺ is diluted down to that level, the water can no longer be ignored.',
    kSlider: 'Dilutions so far (×10 each)',
    dilute: 'Dilute 10× again', restart3: 'Start over',
    startAcid: 'Start: strong acid, pH 2', startBase: 'Start: strong base, pH 12',
    c3title: 'pH against number of dilutions',
    s3lgReal: 'actual pH (counting water’s own H⁺)', s3lgNaive: 'naive rule: pH ±1 per dilution', s3lgSeven: 'pH 7 (neutral)',
    s3readout: 'After {k} dilutions (1 mL of the original is now {vol}): actual pH = {pH}; the ±1 rule predicts {naive}.',
    s3cross: 'The rule has crossed 7 but the solution has not: the {kind} now contributes fewer ions than water itself, so the pH can only creep towards 7.',
    kind_acid: 'acid', kind_base: 'base',
    s3hint: 'What to try: press “Dilute 10× again” repeatedly. For the first 4 presses the cyan points sit on the grey dashed line (the ±1 rule); from the 5th they clearly peel away and bend towards the pH 7 line, and however many more dilutions you add they stay just short of 7. Switch to the “strong base, pH 12” start and repeat: it approaches 7 from the other side. Watch the volume in the readout: after just 5 dilutions, 1 mL of the original has become 100 litres.',

    s4k: 'Step 4 · Neutralisation and factors',
    s4t: 'Neutralise 99% of the acid: how far has the pH risen?',
    s4e: 'This step answers: as base is added to acid and most of the H⁺ is used up, how much does the pH (the power in [H⁺] = 10⁻ᵖᴴ) rise? In <strong>neutralisation</strong> the OH⁻ from a base pairs up one-to-one with H⁺ from the acid to make water, H⁺ + OH⁻ → H₂O, so H⁺ disappears. The beaker holds 20.0 mL of 0.100 mol/L hydrochloric acid (pH 1). A fine dropper adds 1.00 mol/L sodium hydroxide solution (NaOH, a <strong>strong base</strong> that splits completely into Na⁺ and OH⁻), 0.0200 mL per drop. The acid holds 2.00 mmol of H⁺ and each drop brings 0.0200 mmol of OH⁻, so exactly <strong>100 drops</strong> neutralise it. Guess first: at half-way (50 drops), is the pH around 4?',
    dropsSlider: 'Drops of NaOH added', add1: '+1 drop', add10: '+10 drops', restart4: 'Empty and restart',
    c4a: 'pH in the beaker against drops added', c4b: 'H⁺ still left (share of the original, ordinary ruler)',
    s4lgCurve: 'path so far', s4lgNow: 'now', s4lgLeft: 'H⁺ left', s4lgOH: 'surplus OH⁻ (same ruler)',
    s4before: '{n} drops ({V} mL NaOH): {pct}% of the H⁺ neutralised, {left}% left, pH = {pH}. The pH has risen by {rise}: “only {left}% of the H⁺ left” accounts for {r}, and the volume growing from 20.0 to {Vt} mL adds {v}.',
    s4start: 'No drops yet: the beaker holds only the 20.0 mL of acid, all 2.00 mmol of H⁺ still there, pH = {pH}.',
    s4eq: '{n} drops: H⁺ and OH⁻ have paired off exactly. The beaker now holds salt water (NaCl solution) with only water’s own H⁺, pH = {pH}.',
    s4after: '{n} drops: there is {ex} mmol more OH⁻ than H⁺, so the solution is alkaline, pH = {pH}.',
    s4hint: 'What to try: press “+10 drops” to reach 50 and then 90 drops. The H⁺ bar is already half gone, then 90% gone, yet the pH has only crept from 1 to 1.3 and 2.0. Then use “+1 drop” from 97 to 103 and watch the pH jump several units per drop between 99, 100 and 101. The reason is again factors: going from 1% left to none is not one more unit of pH but a leap to neutral and beyond.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'pH in one sentence',
    s5fin: '<strong>pH counts the decimal place of the H⁺ concentration</strong>: [H⁺] = 10⁻ᵖᴴ mol/L. That is why neighbouring marks on the scale are ×10 apart rather than +1 (step 1); why one indicator only boxes the pH into a stretch and several together box it tighter (step 2); why dilution brings the pH towards 7 but never across it, since water itself carries 10⁻⁷ mol/L of H⁺ and OH⁻ (step 3); and why neutralising 99% of the H⁺ lifts the pH by only about 2 while the last drop sends it past 7 (step 4).',
    formula: 'pH = −lg[H⁺]   ⇔   [H⁺] = 10⁻ᵖᴴ mol/L\npH + 1   →   [H⁺] × 1/10\n25 °C: pH < 7 acidic · pH = 7 neutral · pH > 7 alkaline',
    lgNote: 'Here lg is the base-10 logarithm: it simply asks “10 to what power?”. You will meet it properly in later algebra.',
    boundary: 'Where this model holds: dilute water solutions at 25 °C, treating concentration as the “effective concentration” (in very concentrated solutions the two differ, and pH can even go below 0 or above 14). Dilution and neutralisation use only a strong acid and a strong base, with volumes simply adding. Indicator colours are illustrative. A weak acid such as vinegar’s acetic acid turns only partly into H⁺, so at the same concentration its pH is higher — see the acid–base equilibrium page below. At other temperatures even pure water is no longer exactly pH 7.',
    quizPrompt: 'Think: clean rain is about pH 5.6 and lemon juice about pH 2.2. Roughly how many times higher is the H⁺ concentration in lemon juice?',
    quizA: 'About 3.4 times: 5.6 − 2.2', quizB: 'About 2500 times: 10 to the power 3.4', quizC: 'About 2.5 times: 5.6 ÷ 2.2',
    check: 'Check',
    correct: 'Right. The pH gap is 5.6 − 2.2 = 3.4, so the H⁺ concentrations differ by 10 to the power 3.4 ≈ {r} times. A pH difference goes into the exponent of 10; it is not the factor itself.',
    wrong: 'Not quite: a pH gap of 1 is 10 times and a gap of 2 is 100 times, so a gap of 3.4 must be between 1000 and 10 000 times. Try A = 2 and B = 5.5 back in step 1.',
    linksTitle: 'Where to next',
    lk1: 'Exponents & logarithms · step 2: asking “10 to what power?” backwards — that is lg →',
    lk2: 'Acid–base equilibrium · step 1: weak acids only partly dissociate; larger Ka, more H⁺ →',
    lk3: 'Buffers · step 0: why some solutions barely change pH when acid or base is added →',
    lk4: 'Titration curves · step 0: add base drop by drop and draw step 4’s jump as a full curve →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “The pH Scale”.'
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
  if (typeof window.refreshPH === 'function') window.refreshPH();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PH_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
