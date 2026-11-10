'use strict';
// Plate tectonics lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '板块构造 · 从海底条带读出板块的运动',
    back: '← 知识索引',
    compare: '对照另一版本：板块构造 · 边界如何留下证据 →',
    navLabel: '板块构造步骤导航',
    tagline: '板块每年只移动几厘米，没人能直接看见。可它们在边界上留下了证据：海底的磁条带、斜着向下的地震带、一串火山、被错开的篱笆。七步里，你会用这些证据反推板块怎样运动、走多快，再亲手判断三处陌生边界各是什么类型。',
    nav0: '0 磁条带', nav1: '1 三种边界', nav2: '2 谁沉下去', nav3: '3 俯冲带', nav4: '4 转换断层', nav5: '5 判断边界', nav6: '6 收束',

    s0k: '第 0 步 · 海底的录音带',
    s0t: '洋脊两侧的海底条带，怎样告诉我们板块走得多快？',
    s0e: '这一步要回答：站在船上测海底岩石的磁性，能不能算出两块板块分开的速度？地球是一块巨大的磁体，它的南北极每隔几十万年会<strong>倒转</strong>一次。<strong>洋脊</strong>是两块板块分开的地方，地幔物质从这里涌上来，冷却成新的海底玄武岩；岩石冷却时会像录音一样记下当时的磁场方向（与今天相同叫<strong>正向</strong>，相反叫<strong>反向</strong>）。新岩石不断在洋脊生成，再被两侧板块带走，于是海底留下一条条左右对称的条带。条带离洋脊的距离 ÷ 它形成至今的时间，就是<strong>半扩张速率</strong> u（一侧板块离开洋脊的速度）；两侧合起来的分开速度是 2u。单位换算：1 cm/年 = 10 km/百万年。最近一次倒转发生在约 <strong>78 万年前（0.78 Ma，Ma = 百万年前）</strong>。',
    uSlider: '半扩张速率 u（cm/年）', tSlider: '模拟已经扩张了多久（百万年）', play0: '从 523 万年前开始扩张',
    c0a: '海底俯视：磁条带（青 = 正向，暗 = 反向）', c0b: '船载磁力仪读数：沿测线的磁异常',
    lbRidge: '洋脊', lbBrunhes: '0.78 Ma', tickNormal: '正', tickReversed: '反',
    s0lgN: '正向磁化（与今天同向）', s0lgR: '反向磁化', s0lgRidge: '洋脊', s0lgProfile: '磁异常（示意强度）',
    s0readout: 'u = {u} cm/年（两侧合计分开 {full} cm/年）· 已扩张 {el} 百万年（距今 {ago} Ma）：每侧已生成 {w} km 新海底。{brunhes}',
    s0brunhes: '最近一次倒转（0.78 Ma）留下的边界离洋脊 {b} km = {u} cm/年 × 0.78 百万年 × 10。',
    s0brunhesPart: '0.78 Ma 那次倒转留下的边界此刻离洋脊 {b} km，还会继续被推远。',
    s0brunhesNot: '0.78 Ma 那次倒转还没发生，最中间的正向条带还在形成。',
    s0hint: '观察顺序：先按「从 523 万年前开始扩张」，看新海底从洋脊中央长出、被推向两侧，每次磁场倒转都在两侧同时留下一条边界，所以条带左右镜像对称。再只拖 u：同样的年代表，扩张越快条带越宽，船载读数的起伏也被拉长。条带的宽窄只取决于 u 和倒转的时间间隔。',
    quizPrompt: '想一想：某条洋脊两侧，0.78 Ma 那条边界离洋脊 39 km。它的半扩张速率是多少？',
    quizA: '2.5 cm/年', quizB: '5 cm/年', quizC: '10 cm/年', check: '核对',
    correct: '对。39 km ÷ 0.78 百万年 = 50 km/百万年 = 5 cm/年；两侧合计每年分开 10 cm。把 u 拖到 5，读数里的边界距离正好是 39 km。',
    wrong: '再算一次：距离 ÷ 时间 = 39 km ÷ 0.78 百万年，得到 km/百万年，再除以 10 换成 cm/年。',

    s1k: '第 1 步 · 三种边界',
    s1t: '只看两块板块的相对运动方向，能判断边界是哪一种吗？',
    s1e: '这一步要回答：边界两侧的板块怎样相对移动，决定了这里形成什么地形？俯视图让西边的板块 A 不动，只看东边板块 B 相对 A 的速度（相对运动）。把这个速度拆成两份：垂直于边界的<strong>法向分量</strong>（让两块分开或靠拢）和平行于边界的<strong>切向分量</strong>（让两块擦肩而过）。法向分开为主，是<strong>张裂边界</strong>（洋脊、裂谷）；法向靠拢为主，是<strong>汇聚边界</strong>（海沟、山脉）；几乎只有切向，是<strong>转换边界</strong>（转换断层）。本页约定：运动方向与边界夹角小于 20° 时算转换边界；真实边界常常是斜的，两种分量兼有。',
    thSlider: '板块 B 的运动方向（度，0 = 向东）', vSlider: '相对速度（cm/年）',
    preDiv: '分开', preConv: '相向', preTrans: '错开',
    c1a: '俯视：板块 B 相对 A 的速度与分解', c1b: '剖面：这种运动造出的地形（示意）',
    lbPlateA: '板块 A（不动）', lbPlateB: '板块 B', lbBoundary: '边界',
    lbRift: '洋脊 / 裂谷', lbMagma: '上涌的地幔', lbTrench: '海沟', lbSlab: '俯冲板块', lbArc: '火山弧', lbFault: '转换断层：两侧水平错动', lbToward: '⊙ 向你', lbAway: '⊗ 离你',
    s1lgV: '相对速度', s1lgN: '法向分量', s1lgS: '切向分量',
    t_divergent: '张裂边界', t_convergent: '汇聚边界', t_transform: '转换边界', t_none: '没有相对运动',
    s1readout: '方向 {th}°，速度 {v} cm/年 → 法向 {n} cm/年（{nWord}），切向 {s} cm/年；与边界夹角 {off}°，判为{type}{obl}。',
    wOpen: '分开', wClose: '靠拢', wNone: '不分不合', oblique: '（斜向，两种分量都不小）',
    s1hint: '观察顺序：先点「分开」「相向」「错开」三个预设，看剖面图从洋脊变成海沟再变成竖直断层；再从 0° 慢慢拖方向到 90°：法向分量（粉）缩短、切向分量（绿）变长，到 70° 以后夹角小于 20°，类型跳成转换边界。速度只改变箭头长短和读数，不改变类型。',

    s2k: '第 2 步 · 谁沉下去',
    s2t: '两块板块相撞时，为什么总是某一块钻到下面？',
    s2e: '这一步要回答：汇聚边界上，哪一块板块会<strong>俯冲</strong>（斜插进地幔）？关键是<strong>密度</strong>（单位体积的质量）：典型的陆壳约 2.7 g/cm³，洋壳约 2.9 g/cm³，下面的地幔约 3.3 g/cm³。更重的一方沉下去，就像在液体里比较浮沉（<a class="xlink" href="../../../physics/matter/density/#step3">→ 密度页第 3 步：凭什么判断浮还是沉</a>）。两块都是大洋板块时，比的是<strong>年龄</strong>：海底离开洋脊后不断冷却、收缩、变密，整体在地幔上浮得越来越低，所以越老的海底越深。「海底深度」图是实测的海底深度与年龄的经验关系（Parsons 与 Sclater，1977）。两块大陆相撞时都太轻，谁也沉不下去，只能挤压隆起成山脉。',
    pairOO: '洋 – 洋', pairOC: '洋 – 陆', pairCC: '陆 – 陆', ageA: '板块 A（西）的年龄（百万年）', ageB: '板块 B（东）的年龄（百万年）',
    c2a: '海底深度（m）对年龄（百万年）', c2b: '剖面：相撞后谁在下面（示意）',
    lbOcean: '大洋', lbCont: '大陆', lbMountain: '山脉', lbMantle: '地幔 3.3',
    s2lgCurve: '深度–年龄经验曲线', s2lgA: '板块 A', s2lgB: '板块 B',
    v_oceanVsCont: '大洋板块（洋壳 2.9 g/cm³）比大陆（陆壳 2.7 g/cm³）重，大洋一侧俯冲到大陆下面。',
    v_older: '两块都是大洋：{old} 更老（{ageOld} 百万年，海底深约 {dOld} m），比另一块（{ageYoung} 百万年，约 {dYoung} m）更冷更密，由它俯冲。',
    v_sameAge: '两块年龄几乎相同（深度相差不到 50 m）：只看密度分不出胜负，实际由运动方向等其他因素决定。',
    v_collide: '两块都是大陆，密度都远小于地幔 3.3 g/cm³，谁也沉不下去：地壳挤压、增厚，隆起成高大山脉（例如喜马拉雅）。',
    sideA: '板块 A', sideB: '板块 B',
    s2hint: '观察顺序：先点「洋 – 陆」，看大洋板块弯下去；再点「洋 – 洋」，只拖板块 A 的年龄：越过板块 B 的年龄时，俯冲的一方就换边，深度曲线上两个圆点的上下次序也同时对调。最后点「陆 – 陆」：两块都浮着，只能挤成山。经验曲线在约 {sw} 百万年以内是 2500 + 350√年龄（单位 m），更老处换成 6400 − 3200·e^(−年龄/62.8)，变深得越来越慢。',

    s3k: '第 3 步 · 俯冲带',
    s3t: '地震为什么越往陆地方向越深？火山为什么离海沟有一段距离？',
    s3e: '这一步要回答：只凭地震的位置和深度，能不能看出俯冲板块插下去的角度，并预测火山出现在哪里？俯冲板块又冷又硬，插进地幔时在内部和顶面不断破裂，产生地震；这些地震排成一条从海沟向陆地倾斜下去的带，叫<strong>贝尼奥夫带</strong>（Wadati–Benioff 带），最深可到约 670 km。板块下到约 <strong>100 km</strong> 深时，受热放出水分，使上方地幔部分熔融，岩浆上升形成一串火山，叫<strong>火山弧</strong>。所以火山弧离海沟的距离 ≈ 100 km ÷ tan(俯冲角)。图中横轴是离海沟的水平距离，纵轴是深度，横纵比例相同（角度不变形）；地震是按设定俯冲角模拟的。',
    dipSlider: '俯冲角（度）', record3: '记录 300 次地震', clear3: '清空',
    c3: '剖面：离海沟距离（km）× 深度（km），等比例',
    lbVolcano: '火山弧', lbTrench3: '海沟', lbFit: '拟合', lb100: '100 km',
    s3lgQuake: '模拟地震', s3lgSlab: '俯冲板块（设定角度）', s3lgFit: '由地震拟合的斜线', s3lgArc: '火山弧位置',
    s3readout: '俯冲角 {dip}°：火山弧离海沟约 100 ÷ tan {dip}° = {arc} km。{fit}',
    s3fit: '已记录 {n} 次地震（最深 {zmax} km）；用深于 40 km 的地震拟合直线，反推出俯冲角 {est}°。',
    s3nofit: '按「记录 300 次地震」，再从地震点反推俯冲角。',
    s3hint: '观察顺序：先按「记录 300 次地震」，看点逐批出现、排成一条斜带，橙色拟合线和设定角度几乎重合——这就是地震学家画出俯冲板块的办法。再拖俯冲角（会清空记录）：角度越缓，同样 100 km 深要走得越远，火山弧离海沟越远（30° 约 173 km，60° 约 58 km）。很缓的板块深处会超出图的右边界。',

    s4k: '第 4 步 · 转换断层',
    s4t: '两块板块平稳地错动，地震为什么却是一阵一阵的？',
    s4e: '这一步要回答：板块边界远处每年匀速错动几厘米，为什么断层上不是天天小滑动，而是隔上百年来一次大地震？因为断层面被摩擦<strong>锁住</strong>了：远处在动，断层附近的岩石只能像弯曲的尺子一样积攒变形，这份没滑出去的位移叫<strong>滑动亏欠</strong>。亏欠攒到岩石承受不住（本页用一个阈值 D 表示），断层突然滑动，把亏欠一次还清——这就是地震，这个过程叫<strong>弹性回跳</strong>。于是两次地震的平均间隔 ≈ D ÷ 错动速率，叫<strong>复发周期</strong>。上图是俯视：一条横穿断层的篱笆（错动量放大显示）。下图记录滑动亏欠随时间的变化。',
    v4Slider: '远处的错动速率（cm/年）', dSlider: '断层能承受的亏欠 D（m）', ySlider: '经过的时间（年）', play4: '播放 1000 年', irregular: '每次的承受能力随机变化 ±30%',
    c4a: '俯视：横跨断层的篱笆（错动量放大显示）', c4b: '滑动亏欠（m）对时间（年）',
    lbFence: '篱笆', lbFaultLine: '断层（锁住）', lbQuake: '地震',
    s4lgFence: '篱笆现在的形状', s4lgOrig: '篱笆最初的位置', s4lgDef: '滑动亏欠', s4lgQ: '地震（亏欠清零）',
    s4readout: '第 {y} 年：速率 {v} cm/年，D = {D} m → 复发周期约 D ÷ 速率 = {T} 年。已发生 {n} 次地震，断层累计错开 {rel} m；此刻亏欠 {def} m。',
    s4hint: '观察顺序：按「播放 1000 年」，看篱笆在断层附近慢慢弯成 S 形（积攒亏欠），下图亏欠直线上升；到达 D 时一声「咔」，篱笆在断层处断开错位、弯曲消失，下图亏欠掉回 0。再只改速率或 D，数一数 1000 年里地震的次数。勾上「随机变化」：间隔不再整齐，但长期平均仍接近 D ÷ 速率——这也是真实断层很难准确预报的原因之一。',

    s5k: '第 5 步 · 判断边界',
    s5t: '三处陌生的板块边界，你能凭证据说出它们各是哪一种吗？',
    s5e: '这一步要回答：把前面学到的证据串起来，能不能判断一处边界的类型？每个站点给出一份模拟的地震记录（横轴：离边界的水平距离，纵轴：震源深度，0–700 km）和两条地质观察。提示：只有俯冲带有深地震；浅地震的边界，再看磁条带是否对称、两侧是否被错开、有没有火山。',
    site1: '站点 1', site2: '站点 2', site3: '站点 3',
    ev1: '地震全在 20 km 以内，沿一条笔直的线分布；两侧的洋脊被这条线错开约 100 km；附近没有火山。',
    ev2: '地震全在 15 km 以内；两侧海底磁条带左右镜像对称；越靠近边界岩石越年轻、海底越浅。',
    ev3: '地震从浅到深排成一条斜带，最深超过 600 km；边界外侧有一条深海沟；离边界约 140 km 处有一串火山。',
    pick: '请选择', check5: '核对三处',
    c5: '{site}：震源深度剖面（km）',
    fb_ok: '对：{why}', fb_no: '再想想：{why}', fb_none: '先给这一处选一个类型。',
    why1: '浅震 + 一条直线 + 洋脊被错开，是转换断层的特征。',
    why2: '浅震 + 对称磁条带 + 越近越年轻，是洋脊（张裂边界）。',
    why3: '深达 600 km 的倾斜地震带 + 海沟 + 火山弧，是俯冲型汇聚边界。',
    s5score: '答对 {n}/3。',
    s5hint: '观察顺序：先只看三张深度剖面，挑出唯一有深地震的那一处；剩下两处地震都很浅，再读文字证据：对称条带指向张裂，错开的洋脊指向转换。',

    s6k: '第 6 步 · 收束', s6t: '边界的类型，写在它留下的证据里',
    s6fin: '<strong>第 0 步</strong>：洋脊两侧的磁条带对称，条带距离 ÷ 年龄 = 扩张速率。<strong>第 1 步</strong>：相对运动拆成法向和切向，分开为主是张裂，靠拢为主是汇聚，几乎只有切向是转换。<strong>第 2 步</strong>：汇聚时密度大的一方俯冲：大洋压过大陆，老海底压过年轻海底；两块大陆相撞隆起成山。<strong>第 3 步</strong>：俯冲带的地震排成斜带，倾角可由地震拟合；火山弧在板块约 100 km 深处的上方。<strong>第 4 步</strong>：转换断层锁住—积攒—回跳，复发周期 ≈ D ÷ 速率。<strong>第 5 步</strong>：深地震只出现在俯冲带；浅地震的边界靠磁条带、错开和火山来区分。',
    formula: '半扩张速率 u = 条带距离 ÷ 年龄　（1 cm/年 = 10 km/百万年）\n火山弧距离 ≈ 100 km ÷ tan(俯冲角)\n复发周期 ≈ D ÷ 错动速率',
    boundary: '适用范围：剖面和俯视图都是示意；第 0 步的倒转年代取自已发表地磁年表（Cande 与 Kent 1995）并取两位小数，扩张速率假设恒定；第 2 步的密度是典型值，深度–年龄关系是经验拟合；第 3 步地震是按设定角度模拟的，火山弧深度 100 km 是常见值（实测约 70–170 km）；第 4 步的断层模型只有一个阈值，真实断层的强度、应力和相邻断层的相互作用都更复杂，不能据此预报具体地震。',
    linksTitle: '接着去哪儿',
    lk1: '→ 地震波探地心 第 0 步：P 波和 S 波的到时差怎样给出震中距离',
    lk2: '→ 地震波探地心 第 4 步：震级加 1，能量多多少',
    lk3: '→ 密度 第 3 步：凭什么判断浮还是沉',
    lk4: '→ 地震波探地心 第 3 步：为什么有的地方收不到某种波',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《板块构造 · 边界如何留下证据》的平行版本。'
  },
  en: {
    pageTitle: 'Plate Tectonics · Reading Plate Motion from the Sea Floor',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Plate Tectonics · How Boundaries Leave Evidence →',
    navLabel: 'Plate tectonics steps',
    tagline: 'Plates move a few centimetres a year, far too slowly to watch. But their boundaries leave evidence: magnetic stripes on the sea floor, earthquakes that slope downwards, chains of volcanoes, fences that end up offset. In seven steps you will use that evidence to work out how plates move and how fast, then classify three unfamiliar boundaries yourself.',
    nav0: '0 Stripes', nav1: '1 Three boundaries', nav2: '2 Which sinks', nav3: '3 Subduction', nav4: '4 Transform', nav5: '5 Classify', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The sea floor’s tape recorder',
    s0t: 'How do the stripes on either side of a ridge tell us how fast plates move?',
    s0e: 'The question here: from a ship measuring the magnetism of the rocks below, can you work out how fast two plates are separating? Earth is a giant magnet whose north and south poles <strong>reverse</strong> every few hundred thousand years. A <strong>mid-ocean ridge</strong> is where two plates pull apart; mantle material wells up and cools into new basalt sea floor, and as it cools the rock records the field’s direction at that moment, like a tape (the same as today is <strong>normal</strong>, the opposite is <strong>reversed</strong>). New rock keeps forming at the ridge and is carried off on both sides, so the sea floor ends up striped, the same on both sides. A stripe’s distance from the ridge divided by its age is the <strong>half-spreading rate</strong> u (how fast one plate moves away from the ridge); the two plates separate at 2u. Units: 1 cm/yr = 10 km per million years. The most recent reversal was about <strong>780,000 years ago (0.78 Ma, Ma = million years ago)</strong>.',
    uSlider: 'Half-spreading rate u (cm/yr)', tSlider: 'Time spent spreading so far (million years)', play0: 'Start spreading 5.23 million years ago',
    c0a: 'Sea floor from above: stripes (cyan normal, dark reversed)', c0b: 'Ship magnetometer: the anomaly along the survey line',
    lbRidge: 'Ridge', lbBrunhes: '0.78 Ma', tickNormal: 'N', tickReversed: 'R',
    s0lgN: 'Normal (same as today)', s0lgR: 'Reversed', s0lgRidge: 'Ridge', s0lgProfile: 'Magnetic anomaly (schematic strength)',
    s0readout: 'u = {u} cm/yr (plates separate at {full} cm/yr) · spreading for {el} million years ({ago} Ma): {w} km of new sea floor on each side. {brunhes}',
    s0brunhes: 'The boundary left by the last reversal (0.78 Ma) sits {b} km from the ridge = {u} cm/yr × 0.78 million years × 10.',
    s0brunhesPart: 'The boundary left by the 0.78 Ma reversal is now {b} km from the ridge and still moving outward.',
    s0brunhesNot: 'The 0.78 Ma reversal has not happened yet, so the central normal stripe is still forming.',
    s0hint: 'What to try: press “Start spreading 5.23 million years ago” and watch new sea floor grow from the ridge and get pushed to both sides. Every reversal leaves a boundary on both sides at once, which is why the pattern is a mirror image. Then drag only u: with the same reversal history, faster spreading gives wider stripes and a stretched-out magnetometer trace. Stripe widths depend only on u and the time between reversals.',
    quizPrompt: 'Think: on some ridge the 0.78 Ma boundary lies 39 km from the ridge. What is the half-spreading rate?',
    quizA: '2.5 cm/yr', quizB: '5 cm/yr', quizC: '10 cm/yr', check: 'Check',
    correct: 'Right. 39 km ÷ 0.78 million years = 50 km per million years = 5 cm/yr; the two sides separate by 10 cm a year. Set u to 5 and the readout puts the boundary at exactly 39 km.',
    wrong: 'Try again: distance ÷ time = 39 km ÷ 0.78 million years gives km per million years; divide by 10 to get cm/yr.',

    s1k: 'Step 1 · Three kinds of boundary',
    s1t: 'Can you tell the boundary type from the direction of relative motion alone?',
    s1e: 'The question here: how do the plates on either side of a boundary move relative to each other, and what landform does that build? The diagram holds plate A (west) still and shows only plate B’s velocity relative to A (the relative motion). Split that velocity in two: the <strong>normal component</strong>, perpendicular to the boundary (pulling the plates apart or pushing them together), and the <strong>tangential component</strong>, along the boundary (sliding them past each other). Mostly pulling apart is a <strong>divergent boundary</strong> (ridges, rifts); mostly pushing together is a <strong>convergent boundary</strong> (trenches, mountains); almost purely sliding is a <strong>transform boundary</strong> (a transform fault). This page’s convention: motion within 20° of the boundary counts as transform. Real boundaries are often oblique, with some of both.',
    thSlider: 'Direction of plate B’s motion (degrees, 0 = east)', vSlider: 'Relative speed (cm/yr)',
    preDiv: 'Apart', preConv: 'Together', preTrans: 'Sideways',
    c1a: 'From above: B’s velocity relative to A, and its two components', c1b: 'Cross-section: the landform this motion builds (schematic)',
    lbPlateA: 'Plate A (fixed)', lbPlateB: 'Plate B', lbBoundary: 'Boundary',
    lbRift: 'Ridge / rift', lbMagma: 'Rising mantle', lbTrench: 'Trench', lbSlab: 'Sinking plate', lbArc: 'Volcanic arc', lbFault: 'Transform fault: the sides slide horizontally', lbToward: '⊙ toward you', lbAway: '⊗ away from you',
    s1lgV: 'Relative velocity', s1lgN: 'Normal component', s1lgS: 'Tangential component',
    t_divergent: 'divergent', t_convergent: 'convergent', t_transform: 'transform', t_none: 'no relative motion',
    s1readout: 'Direction {th}°, speed {v} cm/yr → normal {n} cm/yr ({nWord}), tangential {s} cm/yr; {off}° from the boundary line, so: {type}{obl}.',
    wOpen: 'opening', wClose: 'closing', wNone: 'neither', oblique: ' (oblique: both components are sizeable)',
    s1hint: 'What to try: press the three presets “Apart”, “Together” and “Sideways” and watch the cross-section change from a ridge to a trench to a vertical fault. Then drag the direction slowly from 0° to 90°: the normal component (pink) shrinks and the tangential one (green) grows; beyond 70° the motion is within 20° of the boundary and the type flips to transform. Speed only changes the arrow lengths and the numbers, never the type.',

    s2k: 'Step 2 · Which plate sinks',
    s2t: 'When two plates collide, why does one of them always go under?',
    s2e: 'The question here: at a convergent boundary, which plate <strong>subducts</strong> (slides down into the mantle)? The key is <strong>density</strong> (mass per unit volume): typical continental crust is about 2.7 g/cm³, oceanic crust about 2.9 g/cm³ and the mantle beneath about 3.3 g/cm³. The heavier side sinks, much like comparing floating and sinking in a liquid (<a class="xlink" href="../../../physics/matter/density/#step3">→ Density, step 3: what decides float or sink</a>). When both plates are oceanic, what matters is <strong>age</strong>: after leaving the ridge the sea floor keeps cooling, contracting and getting denser, so it rides lower and lower on the mantle, and older sea floor is deeper. The depth plot shows the measured empirical relation between sea-floor depth and age (Parsons and Sclater, 1977). When two continents meet, both are too light to sink, so the crust crumples upward into mountains.',
    pairOO: 'Ocean – ocean', pairOC: 'Ocean – continent', pairCC: 'Continent – continent', ageA: 'Age of plate A (west), million years', ageB: 'Age of plate B (east), million years',
    c2a: 'Sea-floor depth (m) vs age (million years)', c2b: 'Cross-section: who ends up below (schematic)',
    lbOcean: 'Ocean', lbCont: 'Continent', lbMountain: 'Mountains', lbMantle: 'Mantle 3.3',
    s2lgCurve: 'Empirical depth–age curve', s2lgA: 'Plate A', s2lgB: 'Plate B',
    v_oceanVsCont: 'The oceanic plate (crust 2.9 g/cm³) is heavier than the continent (crust 2.7 g/cm³), so the ocean side subducts beneath the continent.',
    v_older: 'Both oceanic: {old} is older ({ageOld} million years, sea floor about {dOld} m deep) and so colder and denser than the other ({ageYoung} million years, about {dYoung} m); it is the one that subducts.',
    v_sameAge: 'The two are almost the same age (depths within 50 m): density alone cannot decide, so in reality other factors such as the direction of motion do.',
    v_collide: 'Both are continents, far lighter than the 3.3 g/cm³ mantle, so neither can sink: the crust is squeezed and thickened into high mountains (the Himalaya, for example).',
    sideA: 'Plate A', sideB: 'Plate B',
    s2hint: 'What to try: press “Ocean – continent” and watch the oceanic plate bend down. Then press “Ocean – ocean” and drag only plate A’s age: the moment it passes plate B’s age the sinking plate switches sides, and the two dots on the depth curve swap order at the same time. Finally press “Continent – continent”: both stay afloat and can only crumple into mountains. The curve is 2500 + 350√age (in m) up to about {sw} million years, then 6400 − 3200·e^(−age/62.8) for older floor, which deepens ever more slowly.',

    s3k: 'Step 3 · Subduction zone',
    s3t: 'Why do earthquakes get deeper inland, and why do the volcanoes sit some way from the trench?',
    s3e: 'The question here: from the position and depth of earthquakes alone, can you see the angle at which the plate goes down, and predict where volcanoes appear? The sinking plate is cold and stiff, and as it pushes into the mantle it keeps cracking inside and along its top, producing earthquakes. They line up in a band sloping down from the trench under the land, the <strong>Wadati–Benioff zone</strong>, reaching down to about 670 km. When the plate reaches about <strong>100 km</strong> depth it heats up and releases water, which partly melts the mantle above; the magma rises to form a line of volcanoes, the <strong>volcanic arc</strong>. So the arc sits about 100 km ÷ tan(dip angle) from the trench. The plot shows horizontal distance from the trench across and depth down, at the same scale both ways (angles are true); the earthquakes are simulated for the dip you set.',
    dipSlider: 'Dip angle (degrees)', record3: 'Record 300 earthquakes', clear3: 'Clear',
    c3: 'Cross-section: distance × depth (km), equal scales',
    lbVolcano: 'Volcanic arc', lbTrench3: 'Trench', lbFit: 'fit', lb100: '100 km',
    s3lgQuake: 'Simulated earthquakes', s3lgSlab: 'Sinking plate (set angle)', s3lgFit: 'Line fitted to the earthquakes', s3lgArc: 'Volcanic arc position',
    s3readout: 'Dip {dip}°: the volcanic arc sits about 100 ÷ tan {dip}° = {arc} km from the trench. {fit}',
    s3fit: '{n} earthquakes recorded (deepest {zmax} km); a line fitted to those deeper than 40 km gives a dip of {est}°.',
    s3nofit: 'Press “Record 300 earthquakes”, then recover the dip from the dots.',
    s3hint: 'What to try: press “Record 300 earthquakes” and watch the dots arrive in batches and line up into a sloping band; the orange fitted line lands almost on the set angle. That is how seismologists map a sinking plate. Then drag the dip (this clears the record): the shallower the angle, the further the plate must travel to reach 100 km depth, and the further the arc is from the trench (about 173 km at 30°, 58 km at 60°). The deep end of a very shallow slab runs off the right edge of the plot.',

    s4k: 'Step 4 · Transform fault',
    s4t: 'The plates slide past steadily, so why do earthquakes come in bursts?',
    s4e: 'The question here: far from the boundary the plates slide past each other by a few centimetres every year, so why does the fault not creep a little every day, instead breaking in a large earthquake every hundred years or so? Because friction <strong>locks</strong> the fault: far away the ground keeps moving, so the rock near the fault can only store the motion as bending, like a flexed ruler. The motion the fault owes but has not yet made is the <strong>slip deficit</strong>. When the deficit grows past what the rock can bear (a threshold D on this page), the fault suddenly slips and pays it all back: an earthquake, a process called <strong>elastic rebound</strong>. So the average time between earthquakes is about D ÷ slip rate, the <strong>recurrence interval</strong>. The upper plot is a map view of a fence crossing the fault (offsets exaggerated); the lower plot tracks the slip deficit over time.',
    v4Slider: 'Far-field slip rate (cm/yr)', dSlider: 'Deficit the fault can bear, D (m)', ySlider: 'Time elapsed (years)', play4: 'Play 1000 years', irregular: 'Let the breaking point vary randomly by ±30%',
    c4a: 'From above: a fence across the fault (offsets exaggerated)', c4b: 'Slip deficit (m) vs time (years)',
    lbFence: 'Fence', lbFaultLine: 'Fault (locked)', lbQuake: 'Quake',
    s4lgFence: 'Fence now', s4lgOrig: 'Fence when built', s4lgDef: 'Slip deficit', s4lgQ: 'Earthquake (deficit reset)',
    s4readout: 'Year {y}: rate {v} cm/yr, D = {D} m → recurrence about D ÷ rate = {T} years. {n} earthquakes so far, total offset across the fault {rel} m; deficit now {def} m.',
    s4hint: 'What to try: press “Play 1000 years”. Near the fault the fence slowly bends into an S (deficit building up) while the deficit climbs in a straight line; when it reaches D there is a snap: the fence breaks and jumps sideways at the fault, the bend disappears and the deficit drops to 0. Then change only the rate or D and count the earthquakes in 1000 years. Tick “vary randomly”: the intervals are no longer regular, but over the long run they still average close to D ÷ rate. That is one reason real faults are so hard to forecast.',

    s5k: 'Step 5 · Classify the boundaries',
    s5t: 'Three unfamiliar plate boundaries: can you name each one from the evidence?',
    s5e: 'The question here: putting the earlier evidence together, can you tell what kind a boundary is? Each site comes with a simulated earthquake record (across: horizontal distance from the boundary; down: focal depth, 0–700 km) and two geological observations. Hint: only subduction zones have deep earthquakes; where the earthquakes are all shallow, check whether the magnetic stripes are symmetric, whether things are offset, and whether there are volcanoes.',
    site1: 'Site 1', site2: 'Site 2', site3: 'Site 3',
    ev1: 'Earthquakes all shallower than 20 km, along one straight line; ridge segments on either side are offset along it by about 100 km; no volcanoes nearby.',
    ev2: 'Earthquakes all shallower than 15 km; the magnetic stripes on the two sides mirror each other; rocks are younger and the sea floor shallower closer to the boundary.',
    ev3: 'Earthquakes form a sloping band from shallow to deeper than 600 km; a deep trench runs along the outer side; a line of volcanoes sits about 140 km from the boundary.',
    pick: 'Choose…', check5: 'Check all three',
    c5: '{site}: focal-depth cross-section (km)',
    fb_ok: 'Right: {why}', fb_no: 'Think again: {why}', fb_none: 'Pick a type for this site first.',
    why1: 'shallow quakes on a straight line plus offset ridges mark a transform fault.',
    why2: 'shallow quakes, mirror-image stripes and rock getting younger towards the boundary mark a ridge (divergent).',
    why3: 'a sloping earthquake band down to 600 km, a trench and a volcanic arc mark a subduction (convergent) boundary.',
    s5score: '{n}/3 correct.',
    s5hint: 'What to try: look only at the three depth plots first and pick out the one site with deep earthquakes. At the other two the quakes are all shallow, so read the written evidence: symmetric stripes point to divergence, offset ridges to a transform.',

    s6k: 'Step 6 · Wrap-up', s6t: 'A boundary’s type is written in the evidence it leaves',
    s6fin: '<strong>Step 0</strong>: the magnetic stripes either side of a ridge are symmetric, and stripe distance ÷ age = spreading rate. <strong>Step 1</strong>: split the relative motion into normal and tangential parts: mostly apart is divergent, mostly together convergent, almost purely sideways transform. <strong>Step 2</strong>: in a collision the denser side subducts: ocean beats continent, old sea floor beats young; two continents crumple into mountains. <strong>Step 3</strong>: subduction earthquakes form a sloping band whose angle can be fitted; the volcanic arc sits above where the plate is about 100 km deep. <strong>Step 4</strong>: a transform fault locks, stores and rebounds; the recurrence interval is about D ÷ rate. <strong>Step 5</strong>: deep earthquakes occur only at subduction zones; boundaries with shallow quakes are told apart by stripes, offsets and volcanoes.',
    formula: 'half-spreading rate u = stripe distance ÷ age　(1 cm/yr = 10 km/Myr)\narc distance ≈ 100 km ÷ tan(dip)\nrecurrence ≈ D ÷ slip rate',
    boundary: 'Scope: the cross-sections and map views are schematic. Step 0’s reversal ages come from a published geomagnetic timescale (Cande and Kent 1995), rounded to two decimals, and spreading is assumed steady. Step 2’s densities are typical values and the depth–age relation is an empirical fit. Step 3’s earthquakes are simulated for the angle you set, and the 100 km arc depth is a common value (observed roughly 70–170 km). Step 4’s fault has a single threshold; real fault strength, stress and interactions between neighbouring faults are far more complex, and this model cannot forecast actual earthquakes.',
    linksTitle: 'Where to go next',
    lk1: '→ Seismic waves, step 0: how the P–S arrival gap gives the distance to the epicentre',
    lk2: '→ Seismic waves, step 4: one more unit of magnitude, how much more energy',
    lk3: '→ Density, step 3: what decides float or sink',
    lk4: '→ Seismic waves, step 3: why some places cannot receive a given wave',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Plate Tectonics · How Boundaries Leave Evidence”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
