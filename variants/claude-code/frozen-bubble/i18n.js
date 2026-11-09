'use strict';
// Frozen-bubble lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '冰冻肥皂泡 · 一层薄膜里的结冰账',
    back: '← 知识索引',
    compare: '对照另一版本：冰冻肥皂泡 · 水膜里的结晶 →',
    navLabel: '冰冻肥皂泡步骤导航',
    tagline: '寒冬里吹一个肥皂泡，几秒内泡泡表面会爬满羽毛一样的冰花。冻住的到底是什么？冰花为什么是六条臂、为什么会被「冲」着跑？为什么在暖和的屋里放在冰上的泡泡，只冻到一半就停了？七步里，我们用质量、热量和表面张力三本账来回答。',
    nav0: '0 什么能冻', nav1: '1 冰从种子长', nav2: '2 越冷越快', nav3: '3 结冰放热', nav4: '4 冰晶被冲走', nav5: '5 冻到哪停', nav6: '6 收束',

    s0k: '第 0 步 · 先认清对象',
    s0t: '一只肥皂泡里，真正能结冰的是哪一部分？',
    s0e: '这一步要回答：泡泡由两样东西组成——外面一层液体<strong>薄膜</strong>（水 + 甘油 + 洗洁精），里面包着的空气。天冷时哪一样会结冰？先算算各有多少。薄膜厚度 h 只有几微米（1 微米 µm = 千分之一毫米），一根头发约 70 µm 粗。膜的体积 ≈ 球面积 πD² × 厚度 h，空气体积 = πD³ ÷ 6，再乘各自的密度（液体 ≈ 1 g/cm³，空气 ≈ 0.00129 g/cm³）就是质量。空气的主要成分氮气、氧气要到 −210 °C 左右才会凝固，所以冬天能结冰的只有那层膜。',
    c0a: '左：泡泡与薄膜；右：膜里的液体和泡里的空气各有多重',
    c0bubble: '泡泡（膜厚已放大）', c0film: '膜里的液体', c0air: '泡里的空气',
    diam: '泡泡直径 D（cm）', thick: '膜厚 h（µm）',
    s0readout: '直径 {D} cm、膜厚 {h} µm：膜的液体只有 {mf} g，泡里的空气有 {ma} g，空气是膜的 {r} 倍重。膜厚只是头发的 1/{hr}。能结冰的只是这 {mf} g 液体，约合 {drops} 滴水（一滴约 0.05 g）。',
    s0hint: '观察顺序：只拖「膜厚」，看右边橙色条（膜）变长变短、蓝色条（空气）不动；再只拖「直径」，空气比膜长得更快——泡越大，膜在总质量里占得越少。',

    s1k: '第 1 步 · 冰从哪里开始',
    s1t: '膜已经比 0 °C 还冷，为什么不一下子冻住？',
    s1e: '这一步要回答：冰要从什么地方开始长，又怎样铺满一块膜？这种膜里溶了甘油，它的<strong>凝固点</strong> Tm（开始能结冰的温度）不是 0 °C，而是约 −6.5 °C（这是下文所引论文用的配方的参考值）。膜温比 Tm 低多少，叫<strong>过冷度</strong> ΔT = Tm − T。过冷的液体并不会自己马上结冰，它需要一颗「冰种」——一小粒已经成形的冰，比如空中飘落的霜粒碰到膜上。冰种出现叫<strong>成核</strong>。之后冰就沿着六个方向往外长：冰的水分子排成六边形的格子，所以长出六条主臂。下图是一块平摊的膜：点一下（或按按钮）放冰种，按「生长」看冰铺开；右图记下被冰占到的比例随时间怎样增加。',
    c1aA: '左：一块膜（俯视），六臂冰晶从冰种长出', c1bA: '右：冰占到的比例随示意时间的变化',
    c1a: '一块膜（俯视）· 点击放冰种', c1b: '冰占到的比例 / % 对示意时间 / s',
    airT: '气温 T（°C，膜温随之）', clock: '示意时间（s）',
    seed: '＋ 放一颗冰种', grow: '▶ 生长', pause: '❚❚ 暂停', reset: '↺ 重置这块膜',
    s1readout: '气温 {T} °C → 过冷度 ΔT = {dT} °C · 冰种 {n} / {max} 颗 · 示意时间 {t} s · 冰占到这块膜的 {cov}%。{note}',
    s1noteWarm: '膜温不低于凝固点（ΔT ≤ 0）：冰种不会长大（红点）。把气温调到 −6.5 °C 以下再试。',
    s1noteNone: '还没有冰种：过冷的膜可以一直保持液态。放一颗冰种试试。',
    s1noteGrow: '每条臂的尖端以同样的速度往外推；两块冰相遇的地方，后到的那块停下。',
    s1noteFull: '冰的长势受同一条规则管：每个冰种都往六个方向等速长。',
    s1noteEnd: '已到示意时间终点：不能再放新冰种。拖回较早的时间或重置。',
    s1hint: '观察顺序：先放一颗冰种并按「生长」，看六条臂同时伸长、臂上长出侧枝，右图曲线从 0 爬升。暂停后在别处再放一两颗，看各自长到相遇为止。再把气温调到 −5 °C：冰种不长，曲线贴着 0。',
    s1scope: '这是示意动画，不是模拟：本页假设尖端速度与过冷度成正比，侧枝间距随过冷度变密；时间与长度都是示意单位。拖气温不表示「中途变暖」，而是用新气温把整段生长重新算一遍。',

    s2k: '第 2 步 · 同一时刻比一比',
    s2t: '膜越冷，冰长得越快、越细碎吗？',
    s2e: '这一步要回答：两块一样的膜，各放一颗冰种，只有气温不同。过了同样的示意时间，哪块的冰晶更大？过冷度 ΔT 越大，水分子越「急」着排进冰格，冰的尖端推进得越快，侧枝也越密，长成羽毛状；只比凝固点冷一点点时，冰长得慢，形状更像一片饱满的六边形小板。两块膜共用一个时钟。',
    c2aA: '左：膜 A 的冰晶', c2bA: '右：膜 B 的冰晶',
    c2aT: '膜 A：气温 {T} °C（ΔT = {dT} °C）', c2bT: '膜 B：气温 {T} °C（ΔT = {dT} °C）',
    airA: '膜 A 的气温（°C）', airB: '膜 B 的气温（°C）',
    s2readout: '示意时间 {t} s：A 的臂长 {la}，B 的臂长 {lb}（示意长度，这块膜半径 = 1）。{cmp}',
    s2cmp: 'A 比 B 冷 {d} °C，A 的臂是 B 的 {r} 倍——正是两个过冷度之比 {da} ÷ {db}。',
    s2cmpB: 'B 比 A 冷 {d} °C，B 的臂是 A 的 {r} 倍——正是两个过冷度之比 {da} ÷ {db}。',
    s2same: '两块膜一样冷，冰长得一样大。',
    s2zero: '至少有一块膜不比凝固点冷，那一块的冰种不长。',
    s2hint: '观察顺序：保持时钟不动，只拖膜 A 的气温，看左边冰晶整体变大或变小、侧枝变密或变疏；再把两块膜调成同一个气温，两边一模一样。最后按「生长」从 0 播放，看两块冰晶的差距随时间拉开。',

    s3k: '第 3 步 · 结冰会放热',
    s3t: '冷膜一结冰就变暖——它自己能冻完吗？',
    s3e: '这一步要回答：液体变成冰时会放出热量，这份热叫<strong>熔化热</strong>（凝固时放出，熔化时吸收，同一个数）：每克水约 334 J。而让每克水升温 1 °C 只要约 4.18 J（<strong>比热容</strong>）。设整片膜一开始和空气一样冷，冻掉一部分 f 放出的热先把整片膜加热。只要冻掉 f* = 4.18 × ΔT ÷ 334 这么一点，膜就被暖回凝固点 Tm，冰和水在 Tm 共存，再也冻不下去——除非把热交给冷空气或冷底座。下图横轴是已冻掉的比例 f，纵轴是膜温：线先升，碰到 Tm 后变平。泡泡的大小和膜厚用第 0 步的设定。',
    c3a: '膜温随已冻比例的变化', c3T: '膜温 / °C 对已冻比例 f / %',
    frozenF: '已冻掉的比例 f（%）',
    lg3line: '膜温（不向外散热时）', lg3air: '气温（膜的起始温度）',
    s3readout: '气温 {T} °C（ΔT = {dT} °C）· 冻掉 {f}% → 膜温 {Tf} °C · 停顿点 f* = {fs}%',
    s3heat: '第 0 步的泡泡（D = {D} cm，h = {h} µm）膜重 {m} g：冻掉前 {fs}% 放出的 {q1} J 足以把整片膜暖回 {Tm} °C；要冻完剩下的部分，还要把另外 {q2} J 交给冷空气或冷底座。',
    s3warm: '膜温不低于凝固点：一点冰也冻不下去（f* = 0）。',
    s3hint: '观察顺序：先只拖「已冻比例」，看红点沿线上升，到 f* 后贴着 Tm 那条虚线走平。再拖「气温」：越冷，线起点越低，停顿点 f* 越靠右——过冷度越大，「靠自己」能冻掉的越多，但从来冻不完（−25 °C 时也只有约 {fsCold}%）。',
    s3scope: '估算：用纯水的熔化热和比热容，忽略甘油与肥皂、忽略冰与水比热的差别；假设冻得很快、来不及向外散热。',

    s4k: '第 4 步 · 冰晶为什么被冲走',
    s4t: '冰晶在泡泡上打转漂流，是谁在推它？',
    s4e: '这一步要回答：冻的时候，膜上的小冰晶常常像雪花球里的雪一样被冲着跑。推手是<strong>表面张力</strong>：液面像一张绷紧的皮，每处都在把旁边的液体往自己这边拉；温度越高，这股拉力越弱（对水，每升高 1 °C 约减小 0.15 mN/m）。刚结冰的地方放了热、变暖，拉力变弱，四周更冷、拉得更紧的液面就把表层液体往冷处拽。这种由表面张力不均引起的流动叫<strong>马兰戈尼流</strong>，冰晶就搭着它漂走。下图是一条膜的截面：上图是温度，中图是表面张力，下图白点是冰晶，橙色箭头表示液体流动的方向（不是热流）。',
    c4a: '上：膜上的温度；中：表面张力；下：被液流带着走的冰晶', c4T: '膜温 / °C（横轴：沿膜的位置）', c4G: '表面张力 / (mN/m)', c4S: '膜条：冰晶（白点）与液流（橙箭头）',
    warmX: '暖点位置', warmD: '暖点比周围高（°C）', flowT: '示意时间（s）',
    s4readout: '暖点高出 {d} °C：暖点处表面张力 {g1} mN/m，远处 {g0} mN/m，相差 {dg} mN/m。示意时间 {t} s：{moved} 颗冰晶被推离暖点，最远漂了 {far}（示意长度，膜条全长 2）。',
    s4calm: '温度处处一样：表面张力处处一样，没有拉扯，冰晶原地不动。',
    s4hint: '观察顺序：先按播放，看白点从暖点两侧向外漂、身后留下轨迹；离暖点越远，冰晶动得越慢（那里温度几乎一样，拉力差很小）；被推到膜条两端的冰晶会挤在边上。把「暖点比周围高」调到 0，再播放：所有冰晶都不动。拖「暖点位置」，看分流点跟着移动。',
    s4scope: '示意：流速与表面张力的坡度成正比是简化，比例尺、速度大小都不是实测；表面张力数值用水的，肥皂膜的绝对值更小，但「越热越弱」的趋势相同。',

    s5k: '第 5 步 · 冻到哪里停',
    s5t: '同样放在冰冷的底座上，为什么暖屋里的泡泡只冻一半？',
    s5e: '这一步要回答：把泡泡放在 {base} °C 的冷底座上，结冰会从底部往上爬。爬到哪里会停？膜上每一点的温度被两边拉扯：底座把它往冷里拉，周围空气把它往空气的温度拉；离底座越远，空气越占上风。只有膜温低于 Tm（−6.5 °C）的部分才能冻。气温低于 Tm 时，整只泡都在 Tm 以下，会冻满；气温高于 Tm 时，离底座足够远处膜温会回到 Tm；只要这个位置落在泡顶以下，冻结的边界（<strong>冻结前沿</strong>）就停在那里（气温只比 Tm 高一点时，回暖点在泡顶之外，泡泡仍会冻满）。这正是 Ahmadi 等人 2019 年在《Nature Communications》论文里对比的两种情形：冷环境里整只泡冻满，暖空气中前沿半路停下。',
    c5aA: '左：泡泡侧视图，浅蓝是冻住的部分', c5bA: '右：沿泡泡往上的膜温',
    c5a: '泡泡侧视（底座 {base} °C）', c5b: '高度（占泡高比例）对膜温 / °C',
    airT5: '周围气温（°C）', coldRoom: '冷环境 −18 °C', warmRoom: '暖空气 +25 °C',
    s5readout: '气温 {T} °C：{state}',
    s5full: '泡顶的膜也比 −6.5 °C 冷，整只泡都在凝固点以下，前沿一路爬到顶，泡泡冻满。',
    s5stop: '膜温在泡高的 {z}% 处回到 −6.5 °C，冻结前沿停在那里；再往上空气占上风，膜一直是液体。',
    s5hint: '观察顺序：先按「冷环境」，左图冻满、右图整条曲线都在虚线（Tm）左边；再按「暖空气」，曲线在半路越过虚线，交点的高度就是前沿停下的位置。然后慢慢拖气温：右图会留下你试过的曲线（灰色），看交点怎样随气温升高往下移。',
    s5scope: '示意模型：用指数曲线 T(z) = T气 + (T底 − T气)·e^(−z/λ) 表示「底座的冷往上传，越传越弱」；衰减长度 λ 取泡高的 {lam}，底座 {base} °C 都是讲解设定。真实前沿停在哪还取决于膜厚、冰壳导热和空气流动，本页只演示「为什么会停」，不预测停在哪。',

    s6k: '第 6 步 · 收束',
    s6t: '三本账，把一只冻泡泡讲完',
    card1h: '质量账', card1: '能冻的只有那层几微米的膜，比泡里的空气还轻许多；空气在冬天远远冻不住。',
    card2h: '热量账', card2: '结冰放热会把膜暖回凝固点；想冻完，热必须流走——流向冷空气或冷底座。流不走，前沿就停。',
    card3h: '表面张力账', card3: '放热让局部变暖、拉力变弱，冷处把液体拽过去，冰晶搭着液流漂走。',
    colors: '泡泡上的彩色从哪来？那是膜的前后两个表面反射的光互相加强或抵消：膜厚和光的波长差不多，不同颜色在不同厚度处被加强（<a class="xlink" href="../../../physics/waves/interference/#step1">→ 干涉第 1 步：加强还是抵消，看路程差</a>）。冻住之后，冰壳表面凹凸，光被散射，颜色就变白变暗。本页不做颜色的计算。',
    source: '资料：S. F. Ahmadi 等，How soap bubbles freeze，Nature Communications 10, 2531（2019），DOI 10.1038/s41467-019-10021-6。本页只借用其中「冷环境冻满、暖空气前沿停下」「结冰放热驱动马兰戈尼流」的结论和 −6.5 °C 的凝固点参考值；动画里的形状、时间和停顿高度都是讲解设定，不是论文数据的复现。',
    boundary: '适用范围：质量与热量是用水的数值做的量级估算；冰晶生长、液流与温度剖面是标明了规则的示意模型，不能用来预测具体泡泡的冻结时间或形状。',
    linksTitle: '接着去哪儿',
    lk1: '→ 粒子与物态第 2 步：熔化时温度为什么停住一截',
    lk2: '→ 分子动理论第 1 步：温度是粒子平均动能的读数',
    lk3: '→ 干涉第 1 步：泡泡彩色背后的加强与抵消',
    lk4: '→ 光的反射与折射第 2 步：光穿过界面为什么拐弯',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《冰冻肥皂泡 · 水膜里的结晶》的平行版本。'
  },
  en: {
    pageTitle: 'Frozen Soap Bubbles · The Freezing Budget of a Thin Film',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Frozen Soap Bubbles · Ice in a Thin Film →',
    navLabel: 'Frozen bubble steps',
    tagline: 'Blow a soap bubble on a freezing day and within seconds its surface fills with feathery ice. What actually freezes? Why does the ice grow six arms, and why does it get swept along? And why does a bubble sitting on ice in a warm room freeze only partway up? Over seven steps we answer with three budgets: mass, heat and surface tension.',
    nav0: '0 What freezes', nav1: '1 Ice from a seed', nav2: '2 Colder, faster', nav3: '3 Freezing heats', nav4: '4 Swept away', nav5: '5 Where it stops', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Know what you are looking at',
    s0t: 'In a soap bubble, which part can actually freeze?',
    s0e: 'The question for this step: a bubble has two parts — a thin liquid <strong>film</strong> on the outside (water + glycerol + dish soap) and the air it encloses. Which of them freezes in the cold? Start by weighing each. The film is only a few micrometres thick (1 µm = a thousandth of a millimetre); a hair is about 70 µm across. Film volume ≈ sphere area πD² × thickness h; air volume = πD³ ÷ 6; multiply by density (liquid ≈ 1 g/cm³, air ≈ 0.00129 g/cm³) to get mass. Nitrogen and oxygen, which make up air, only solidify around −210 °C, so in winter the film is the only thing that can freeze.',
    c0a: 'Left: the bubble and its film; right: how much the film liquid and the enclosed air weigh',
    c0bubble: 'Bubble (film thickness exaggerated)', c0film: 'Liquid in the film', c0air: 'Air inside',
    diam: 'Bubble diameter D (cm)', thick: 'Film thickness h (µm)',
    s0readout: 'Diameter {D} cm, film {h} µm: the film holds just {mf} g of liquid, the air inside weighs {ma} g — {r} times as much. The film is 1/{hr} the width of a hair. Only those {mf} g can freeze — about {drops} drops of water (a drop is roughly 0.05 g).',
    s0hint: 'What to try: drag only the thickness and watch the orange bar (film) grow and shrink while the blue bar (air) stays put. Then drag only the diameter: the air grows faster than the film — the bigger the bubble, the smaller the film’s share of the total mass.',

    s1k: 'Step 1 · Where ice starts',
    s1t: 'The film is already below 0 °C — why doesn’t it freeze all at once?',
    s1e: 'The question for this step: where does ice begin, and how does it spread across the film? Because glycerol is dissolved in it, this film’s <strong>freezing point</strong> Tm — the temperature below which ice can form — is not 0 °C but about −6.5 °C (the reference value for the recipe in the paper cited below). How far the film is below Tm is its <strong>undercooling</strong>, ΔT = Tm − T. Undercooled liquid does not freeze on its own straight away; it needs a seed — a tiny piece of ice that already exists, such as a frost grain drifting onto the film. The first appearance of ice is called <strong>nucleation</strong>. From there ice grows outward in six directions: water molecules in ice sit in a hexagonal lattice, so six main arms appear. Below is a flat patch of film: tap it (or press the button) to drop a seed, press Grow to watch ice spread, and the right-hand graph records how much of the patch the ice has reached over time.',
    c1aA: 'Left: a patch of film seen from above, six-armed crystals growing from seeds', c1bA: 'Right: share of the patch reached by ice over diagram time',
    c1a: 'A patch of film (from above) · tap to seed', c1b: 'Share reached by ice / % vs diagram time / s',
    airT: 'Air temperature T (°C; the film follows)', clock: 'Diagram time (s)',
    seed: '+ Drop a seed', grow: '▶ Grow', pause: '❚❚ Pause', reset: '↺ Reset this patch',
    s1readout: 'Air {T} °C → undercooling ΔT = {dT} °C · seeds {n} / {max} · diagram time {t} s · ice has reached {cov}% of the patch. {note}',
    s1noteWarm: 'The film is not below its freezing point (ΔT ≤ 0): seeds cannot grow (red dots). Set the air below −6.5 °C and try again.',
    s1noteNone: 'No seed yet: an undercooled film can stay liquid indefinitely. Drop a seed.',
    s1noteGrow: 'Every arm tip advances at the same speed; where two crystals meet, the one that arrives later stops.',
    s1noteFull: 'One rule drives all the growth: every seed grows equally fast in six directions.',
    s1noteEnd: 'End of diagram time reached: no new seeds. Drag the time back or reset.',
    s1hint: 'What to try: drop one seed and press Grow — six arms lengthen together, side branches sprout from them, and the curve on the right climbs from 0. Pause, drop one or two more elsewhere, and watch each grow until they meet. Then set the air to −5 °C: seeds stay put and the curve stays flat at 0.',
    s1scope: 'This is an illustration, not a simulation: the page assumes the tip speed is proportional to undercooling and that side branches crowd closer as undercooling grows; time and length are diagram units. Moving the temperature does not mean “warming partway through”: it recomputes the whole run at the new temperature.',

    s2k: 'Step 2 · Compare at the same moment',
    s2t: 'Does a colder film grow ice faster and more finely branched?',
    s2e: 'The question for this step: two identical patches, one seed each, only the air temperature differs. After the same diagram time, which crystal is larger? The larger the undercooling ΔT, the more “eager” water molecules are to join the ice lattice, so the tip pushes forward faster and the side branches come thicker, giving a feathery shape. Just below the freezing point, ice grows slowly and looks more like a plump hexagonal plate. Both patches share one clock.',
    c2aA: 'Left: crystal in patch A', c2bA: 'Right: crystal in patch B',
    c2aT: 'Patch A: air {T} °C (ΔT = {dT} °C)', c2bT: 'Patch B: air {T} °C (ΔT = {dT} °C)',
    airA: 'Air temperature for A (°C)', airB: 'Air temperature for B (°C)',
    s2readout: 'Diagram time {t} s: A’s arm length {la}, B’s {lb} (diagram length; patch radius = 1). {cmp}',
    s2cmp: 'A is {d} °C colder than B and its arms are {r} times as long — exactly the ratio of the undercoolings, {da} ÷ {db}.',
    s2cmpB: 'B is {d} °C colder than A and its arms are {r} times as long — exactly the ratio of the undercoolings, {da} ÷ {db}.',
    s2same: 'Both patches are equally cold, so their crystals match.',
    s2zero: 'At least one patch is not below the freezing point, and its seed does not grow.',
    s2hint: 'What to try: keep the clock still and drag only A’s temperature — the left crystal grows or shrinks and its branches crowd or thin. Set both to the same temperature and the two match exactly. Finally press Grow to play from 0 and watch the gap open up over time.',

    s3k: 'Step 3 · Freezing releases heat',
    s3t: 'A cold film warms up as it freezes — can it finish freezing by itself?',
    s3e: 'The question for this step: when liquid turns to ice it gives off heat, the <strong>latent heat of fusion</strong> (released on freezing, absorbed on melting — the same amount): about 334 J per gram of water. Warming a gram of water by 1 °C takes only about 4.18 J (its <strong>specific heat</strong>). Suppose the whole film starts as cold as the air; the heat from freezing a fraction f first warms the whole film. Freezing just f* = 4.18 × ΔT ÷ 334 brings the film back up to its freezing point Tm, where ice and liquid coexist and freezing stalls — unless the heat is passed on to cold air or a cold base. In the graph, across is the fraction frozen f, up is the film temperature: the line rises, then goes flat on reaching Tm. Bubble size and film thickness come from step 0.',
    c3a: 'Film temperature against fraction frozen', c3T: 'Film temperature / °C vs fraction frozen f / %',
    frozenF: 'Fraction frozen f (%)',
    lg3line: 'Film temperature (no heat lost)', lg3air: 'Air temperature (film’s starting point)',
    s3readout: 'Air {T} °C (ΔT = {dT} °C) · {f}% frozen → film at {Tf} °C · stall point f* = {fs}%',
    s3heat: 'Step 0’s bubble (D = {D} cm, h = {h} µm) has {m} g of film: freezing the first {fs}% releases {q1} J, enough to warm the whole film back to {Tm} °C. Freezing the rest means handing another {q2} J to the cold air or the cold base.',
    s3warm: 'The film is not below its freezing point: no ice can form at all (f* = 0).',
    s3hint: 'What to try: drag only the fraction frozen — the red dot climbs the line until f*, then runs flat along the dashed Tm line. Then drag the air temperature: colder air starts the line lower and pushes f* to the right. More undercooling lets the film freeze more “on its own”, but never all of it (only about {fsCold}% even at −25 °C).',
    s3scope: 'Estimate: uses pure water’s latent and specific heats, ignores glycerol and soap and the difference between ice and water specific heats, and assumes freezing is too quick for heat to escape.',

    s4k: 'Step 4 · Why ice crystals get swept away',
    s4t: 'Ice crystals swirl across the bubble — what pushes them?',
    s4e: 'The question for this step: while a bubble freezes, small ice crystals often drift around like snow in a snow globe. The push comes from <strong>surface tension</strong>: the liquid surface acts like a stretched skin, every patch pulling neighbouring liquid toward itself, and the warmer it is, the weaker the pull (for water, about 0.15 mN/m weaker per °C). Where ice has just formed, released heat warms the film and weakens the pull, so the colder, tighter surface all around drags the surface liquid toward the cold. A flow driven by uneven surface tension is called <strong>Marangoni flow</strong>, and the crystals ride along with it. Below is a slice through the film: top, temperature; middle, surface tension; bottom, ice crystals as white dots, with orange arrows showing which way the liquid moves (not heat flow).',
    c4a: 'Top: film temperature; middle: surface tension; bottom: ice crystals carried by the liquid', c4T: 'Film temperature / °C (across: position along the film)', c4G: 'Surface tension / (mN/m)', c4S: 'Film strip: crystals (white) and liquid flow (orange arrows)',
    warmX: 'Warm spot position', warmD: 'Warm spot above surroundings (°C)', flowT: 'Diagram time (s)',
    s4readout: 'Warm spot {d} °C above the rest: surface tension {g1} mN/m there, {g0} mN/m far away, a difference of {dg} mN/m. Diagram time {t} s: {moved} crystals pushed away from the warm spot, the farthest drifting {far} (diagram length; the strip is 2 long).',
    s4calm: 'Same temperature everywhere: same surface tension everywhere, nothing pulling, the crystals stay put.',
    s4hint: 'What to try: press Play and watch the dots drift outward on both sides of the warm spot, leaving trails. The farther a crystal is from the warm spot, the slower it drifts (the temperature there is nearly uniform, so the pull hardly differs); crystals pushed to the ends of the strip pile up there. Set the warm spot to 0 °C and play again: nothing moves. Drag the warm spot along and the dividing point follows.',
    s4scope: 'Illustration: making the flow speed proportional to the slope of surface tension is a simplification; scale and speed are not measured. Surface tension values are water’s — a soap film’s are lower, but the “warmer is weaker” trend is the same.',

    s5k: 'Step 5 · Where freezing stops',
    s5t: 'Both on an icy base — why does a bubble in warm air freeze only halfway?',
    s5e: 'The question for this step: put a bubble on a cold base at {base} °C and ice climbs up from the bottom. Where does it stop? Each point of the film is pulled two ways: the base drags it colder, the surrounding air drags it toward the air temperature, and the farther from the base, the more the air wins. Only film colder than Tm (−6.5 °C) can freeze. If the air is below Tm, the whole bubble is below Tm and freezes completely. If the air is above Tm, far enough from the base the film warms back to Tm; as long as that point lies below the top of the bubble, the edge of the ice — the <strong>freezing front</strong> — stops there (with air only slightly above Tm, that point lies beyond the top and the bubble still freezes completely). These are the two situations compared by Ahmadi and colleagues in Nature Communications in 2019: in a cold environment the whole bubble froze, in warm air the front halted partway.',
    c5aA: 'Left: side view of the bubble, light blue is frozen', c5bA: 'Right: film temperature going up the bubble',
    c5a: 'Side view (base at {base} °C)', c5b: 'Height (share of bubble height) vs film temperature / °C',
    airT5: 'Surrounding air temperature (°C)', coldRoom: 'Cold room −18 °C', warmRoom: 'Warm air +25 °C',
    s5readout: 'Air {T} °C: {state}',
    s5full: 'even the film at the top is colder than −6.5 °C, so the whole bubble is below its freezing point; the front climbs all the way and the bubble freezes completely.',
    s5stop: 'the film is back at −6.5 °C at {z}% of the bubble’s height, so the freezing front stops there; above it the air wins and the film stays liquid.',
    s5hint: 'What to try: press “Cold room” — the left picture freezes fully and the whole curve on the right stays left of the dashed Tm line. Press “Warm air” — the curve crosses the dashed line partway, and the height of that crossing is where the front stops. Then drag the air temperature slowly: the right graph keeps the curves you have tried (grey), so you can see the crossing slide down as the air warms.',
    s5scope: 'Illustrative model: the curve T(z) = T_air + (T_base − T_air)·e^(−z/λ) stands for “the base’s cold travels upward, fading as it goes”; the fade length λ = {lam} of the bubble height and the {base} °C base are teaching choices. Where a real front stops also depends on film thickness, heat conduction through the ice shell and air currents; this page shows why the front stops, not where.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Three budgets that tell the whole story',
    card1h: 'Mass', card1: 'Only the film a few micrometres thick can freeze, and it weighs far less than the air inside; winter cold is nowhere near enough to freeze air.',
    card2h: 'Heat', card2: 'Freezing releases heat that warms the film back to its freezing point; to finish, the heat must flow away — into cold air or a cold base. If it cannot, the front stops.',
    card3h: 'Surface tension', card3: 'Released heat warms one spot and weakens its pull; colder surface nearby drags the liquid over, and ice crystals ride the flow.',
    colors: 'Where do a bubble’s colours come from? Light reflected from the film’s front and back surfaces reinforces or cancels itself: the film is about as thick as a light wavelength, so different colours are reinforced at different thicknesses (<a class="xlink" href="../../../physics/waves/interference/#step1">→ Interference, step 1: reinforce or cancel depends on the path difference</a>). Once frozen, the rough ice shell scatters light, so the colours fade to white and grey. This page does not compute colours.',
    source: 'Source: S. F. Ahmadi et al., “How soap bubbles freeze”, Nature Communications 10, 2531 (2019), DOI 10.1038/s41467-019-10021-6. This page borrows only its findings that bubbles freeze completely in a cold environment but halt partway in warm air, and that heat released by freezing drives Marangoni flow, plus its −6.5 °C freezing-point reference. Shapes, times and stop heights in the animations are teaching choices, not a reproduction of the paper’s data.',
    boundary: 'Scope: masses and heats are order-of-magnitude estimates using water’s values; crystal growth, liquid flow and the temperature profile are illustrative models with stated rules and cannot predict the freezing time or shape of a real bubble.',
    linksTitle: 'Where to go next',
    lk1: '→ Particles and states, step 2: why the temperature stalls while something melts',
    lk2: '→ Kinetic theory, step 1: temperature as a reading of mean kinetic energy',
    lk3: '→ Interference, step 1: the reinforcing and cancelling behind bubble colours',
    lk4: '→ Reflection and refraction, step 2: why light bends crossing a surface',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Frozen Soap Bubbles · Ice in a Thin Film”.'
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
  if (typeof window.refreshBubble === 'function') window.refreshBubble();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.FB_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
