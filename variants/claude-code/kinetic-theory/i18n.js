'use strict';
// Kinetic theory lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '气体压强 · 从一次撞墙算到一整瓶气',
    back: '← 知识索引',
    compare: '对照另一版本：气体压强的微观图景 · 撞墙的账本 →',
    navLabel: '气体动理论步骤导航',
    tagline: '瓶子里的气体为什么会往外推？已知的只有：气体是大量乱飞的分子，撞墙时会反弹。想求的是压强、温度和分子速率之间的关系。七步里先算一个分子撞一面墙，再把账加到一整瓶气，最后看速率分布从哪里来。',
    nav0: '0 一次撞墙', nav1: '1 很多分子', nav2: '2 为什么是 1/3', nav3: '3 温度', nav4: '4 压缩', nav5: '5 速率分布', nav6: '6 收束',

    s0k: '第 0 步 · 一个分子',
    s0t: '一个分子在两面墙之间来回弹，平均给右墙多大的力？',
    s0e: '这一步要回答：一个分子撞墙只是一下一下的瞬间碰撞，怎样折合成一个「平均推力」？先只看一个分子、只看左右方向：质量 m，速度 v，在相距 L 的两面墙之间来回弹（本页的盒子模拟都用教学单位，m = 1）。墙理想光滑、完全弹性：撞一次，速度从 +v 变成 −v，分子的动量（质量 × 速度）改变了 2mv。墙得到的<strong>冲量</strong>（力 × 作用时间，等于它造成的动量改变）也就是 2mv（<a class="xlink" href="../../../physics/mechanics/momentum-collision/#step1">→ 动量与碰撞第 1 步：力乘时间就是动量的改变</a>）。两次撞右墙之间分子要走一个来回 2L，用时 2L/v。所以时间够长时，右墙平均每单位时间收到冲量 2mv ÷ (2L/v) = <strong>mv²/L</strong>，这就是平均力。',
    v0: '速度 v（教学单位）', L0: '两墙间距 L', t0: '已经过的时间 t', play0: '从 t = 0 播放到 12',
    s0lgHit: '每次撞右墙的冲量 2mv', s0lgMean: '平均力 = 累计冲量 ÷ t', s0lgTh: '长期值 mv²/L',
    c0a: '盒子（从上方看）', c0b: '右墙收到的冲量（每根竖线是一次撞击）', c0c: '平均力：到此为止的累计冲量 ÷ 经过时间',
    s0readout: 't = {t}：右墙已被撞 {hits} 次，每次冲量 2mv = {imp}，两次之间隔 2L/v = {gap}。\n平均力 = 累计冲量 {tot} ÷ {t} = {mean}；长期值 mv²/L = {th}。',
    s0readoutNone: 't = {t}：分子还没到右墙（第一次撞击在 t = L/v = {first}），累计冲量为 0。长期值 mv²/L = {th}。',
    s0hint: '观察顺序：先保持 L = 1，按播放，看中图每撞一次多一根竖线，下图的平均力在每次撞击时跳高、两次撞击之间回落，跳动越来越小，贴近虚线。然后把 v 从 1 调到 2：竖线变成两倍高（冲量 2mv 加倍），间隔缩成一半（来回更快），所以长期平均力变成 4 倍。再把 L 加倍：冲量不变，撞得只有一半频繁，平均力减半。',

    s1k: '第 1 步 · 很多分子',
    s1t: 'N 个速度各不相同的分子一起撞墙，压强是多少？',
    s1e: '这一步要回答：许多分子速度大小、方向都不同时，怎样从「撞墙记账」得到压强？<strong>压强</strong>是墙上单位面积受到的平均力（<a class="xlink" href="../../../physics/matter/pressure/#step0">→ 压强页第 0 步：同样的力，面积越小压得越狠</a>）。模拟盒是边长 1 的立方体（教学单位），右墙面积 A = 1、体积 V = 1；画面是从正面看的投影，前后方向的运动看不见，但照样存在。每个分子的速度拆成三个分量 vₓ、v_y、v_z。只有左右分量 vₓ 决定它多久撞一次右墙、撞一下给多少冲量；墙光滑，上下、前后的运动只让它换个落点，不改变 vₓ。理想气体的分子彼此不相互作用，于是各算各的：第 i 个分子贡献平均力 m vₓᵢ²/L，加起来再除以面积：<strong>P = Σ m vₓ² / V = N·m⟨vₓ²⟩ / V</strong>，⟨vₓ²⟩ 是这 N 个分子 vₓ² 的平均值。页面不直接套公式：它记下每一次撞右墙的时刻和冲量 2m|vₓ|，用「累计冲量 ÷ 经过时间 ÷ 面积」得到<strong>测得的压强</strong>，再和公式比。',
    N1: '分子数 N', t1: '已经过的时间 t', play1: '从 t = 0 播放到 40',
    s1lgP: '分子（正面投影）', s1lgHit: '刚撞到右墙', s1lgRun: '测得的压强 ÷ 公式值', s1lgPrev: '上一个 N 的曲线', s1lgTh: '比值 1：与公式 Σ m vₓ² / V 完全一致',
    c1a: '盒子正面投影，右墙是记账的那面墙', c1b: '测得压强 ÷ 公式值，随时间（1 = 完全一致）',
    s1readout: 'N = {N}，t = {t}：右墙共被撞 {hits} 次，累计冲量 {imp}。\n测得压强 = {imp} ÷ {t} ÷ 1 = {P}；公式 Σ m vₓ²/V = {th}（相差 {dev}%）。',
    s1hint: '观察顺序：先用 N = 20 播放，看下图青色曲线前期大起大落、后来稳在虚线（比值 1）附近：曲线是「到此刻为止」测得的压强除以公式值，撞得越多越稳。然后把 N 拖到 300 再播放：灰色是刚才 N = 20 的那条，留作对照；分子多了，每段时间里都有很多次撞击在平均，曲线更早贴住 1。下图画的是比值，所以不同 N 能放在一起比；压强本身看读数：公式值随 N 大致成正比，每个分子平均贡献约 m⟨vₓ²⟩ ≈ 1。',

    s2k: '第 2 步 · 方向的平分',
    s2t: '压强只用到 vₓ²，为什么最后写成 ⟨v²⟩ 的 1/3？',
    s2e: '这一步要回答：上一步的压强只用到左右分量 vₓ²，可是分子的动能 ½mv² 用的是整个速度的平方 v² = vₓ² + v_y² + v_z²。两者是什么关系？如果气体没有特别偏爱哪个方向（<strong>各向同性</strong>：装在静止容器里的气体，分子之间的碰撞会不断把方向打乱），三个方向平分 v² 的总和，⟨vₓ²⟩ = ⟨v²⟩/3，于是 <strong>P = (1/3)·(N/V)·m⟨v²⟩ = (2/3)·(N/V)·⟨½mv²⟩</strong>。⟨½mv²⟩ 是分子平均平动动能。但「平分」只对平均成立：分子个数有限时，vₓ² 占的份额会在 1/3 上下随机起伏。每按一次「再抽一组」，页面就从同一个分布重新抽 N 个分子的速度（三个分量独立、都是正态分布，σ = 1 教学单位），上图显示这一组三个方向各占多少，下图把 vₓ² 的份额记成一个点。阴影带是理论上约 95% 的抽样会落入的范围（均值 ± 2 个标准差；这种情况下份额服从 Beta(N/2, N) 分布，标准差约 0.385/√N）。',
    N2: '每组分子数 N', resample: '再抽一组', burst: '连抽 20 组', beam: '换成束流：速度全部沿 ±x', clearPts: '清除记录',
    s2lgX: 'vₓ² 的份额', s2lgY: 'v_y² 的份额', s2lgZ: 'v_z² 的份额', s2lgThird: '1/3', s2lgBand: '约 95% 抽样所在的范围',
    c2a: '这一组里 vₓ²、v_y²、v_z² 各占 v² 总和的多少', c2b: '每一组的 vₓ² 份额（横轴：每组分子数 N，对数刻度）',
    s2readout: 'N = {N}，第 {k} 组：vₓ² 占 {sx}，v_y² 占 {sy}，v_z² 占 {sz}。\n右墙压强 Σ m vₓ²/V 是 (1/3)·N m⟨v²⟩/V 的 {ratio} 倍。下图已有 {n} 个点，{inside} 个落在阴影带内。',
    s2beam: '束流：同样的速率，但每个速度都沿 ±x。vₓ² 占 1，v_y²、v_z² 占 0。\n右墙压强是各向同性时 (1/3)·N m⟨v²⟩/V 的 3 倍，上下、前后墙压强为 0：1/3 只对各向同性的气体成立。',
    s2hint: '观察顺序：先在 N = 30 时按几次「再抽一组」或「连抽 20 组」，看下图的点在 1/3 上下散得很开；再把 N 拖到 3000 重复，点挤到 1/3 附近：散开的宽度大约按 1/√N 缩小。真实一升空气约有 2.5 × 10²² 个分子，起伏完全看不出来。最后按「换成束流」：速率不变，只是方向全排成一列，右墙压强立刻变成 3 倍。',

    s3k: '第 3 步 · 温度',
    s3t: '温度和分子运动是什么关系？真实分子有多快？',
    s3e: '这一步要回答：温度在微观上对应什么？实验总结出理想气体状态方程 PV = NkT（<a class="xlink" href="../../../physics/thermal/thermodynamics/#step0">→ 热力学第 0 步：状态量 P、V、T</a>），其中 T 是热力学温度（开尔文，K），k = 1.380649 × 10⁻²³ J/K 是玻尔兹曼常量。上一步从撞墙算出 P = (2/3)·(N/V)·⟨½mv²⟩。两式说的是同一个压强，对照得到 <strong>⟨½mv²⟩ = (3/2)·kT</strong>：温度就是分子平均平动动能的刻度，和分子是哪种无关。再定义<strong>方均根速率</strong> v_rms = √⟨v²⟩（先平方、再平均、再开方的速率），由上式得 <strong>v_rms = √(3kT/m)</strong>：温度相同时，分子越重越慢，v_rms 与 √m 成反比。本步用真实分子质量和 SI 单位计算，不是盒子模拟。',
    T3: '温度 T（K）',
    gasHe: '氦 He', gasNe: '氖 Ne', gasN2: '氮气 N₂', gasCO2: '二氧化碳 CO₂', gasXe: '氙 Xe',
    c3a: '方均根速率 v_rms（m/s）随温度 T（K）', c3b: '平均平动动能 (3/2)kT（meV）',
    s3readout: '{gas}（分子质量 {u} u）在 T = {T} K：v_rms = √(3kT/m) = {vrms} m/s。\n平均平动动能 (3/2)kT = {ke} × 10⁻²¹ J = {mev} meV（1 meV = 1.602 × 10⁻²² J），五种气体完全相同。',
    s3hint: '观察顺序：先只点不同的气体按钮，温度不动：上图的标记点在不同曲线上跳，v_rms 差好几倍；下图五根柱子一样高。再只拖温度：所有曲线按 √T 一起升高，温度变成 4 倍时 v_rms 正好翻倍。参照：室温空气里的氮气分子方均根速率约 500 m/s，比声速（约 343 m/s）还快。',
    quizPrompt: '想一想：一个容器里氦原子和氙原子个数相同、温度相同。哪一种贡献的压强更大？',
    quizA: '氦：它快得多，撞得更勤', quizB: '一样大', quizC: '氙：它重得多，每次撞得更狠',
    check: '核对', correct: '对。压强只取决于 N/V 和 ⟨½mv²⟩ = (3/2)kT。氙比氦重约 33 倍，v_rms 只有氦的 1/5.7：每次冲量 2m|vₓ| 是氦的 5.7 倍，撞墙频率却只有 1/5.7，两者正好抵消。',
    wrong: '再想想：每个分子贡献的压强正比于 m·vₓ²，也就是动能。同温度下两种分子的平均动能是多少？',

    s4k: '第 4 步 · 压缩',
    s4t: '温度不变时把气体压到一半体积，压强为什么正好翻倍？',
    s4e: '这一步要回答：体积和压强之间的反比关系从哪里来？把右墙换成可以推拉的活塞，盒长 L 就等于体积 V（截面积 A = 1）。分子速度不变时：两次撞活塞之间的间隔 2L/|vₓ| 随 L 缩短，每次冲量 2m|vₓ| 不变，所以每个分子的平均力 m vₓ²/L 与 L 成反比，P = Σ m vₓ² / V，<strong>P·V 保持不变</strong>，这就是玻意耳定律。这里挪动活塞是一个「教学操作」：分子速度保持不变，相当于非常缓慢地压缩，同时让气体和恒温的外界交换热量（等温过程）。如果快速推活塞又不散热，分子从迎面而来的活塞上弹回会变快，气体就变热（<a class="xlink" href="../../../physics/thermal/thermodynamics/#step2">→ 热力学第 2 步：等温与绝热两条路径</a>）。「温度 ×2」把每个分子的速度乘 √2，平均动能加倍。按「测一次」：120 个分子跑 40 个时间单位，逐次记账算出平均压强，结果作为一个点留在 P–V 图上。',
    L4: '活塞位置 L = 体积 V', tf1: '温度 ×1', tf2: '温度 ×2', measure: '测一次（40 个时间单位）',
    s4lg1: '温度 ×1：测得点与 P·V = 常数 曲线', s4lg2: '温度 ×2：测得点与曲线', s4lgNow: '正在测的这一次',
    c4a: '活塞盒（正面投影），120 个分子', c4b: '压强 P 与体积 V（实线：Σ m vₓ²/V）',
    s4readout: 'V = {V}，温度 ×{tf}：{status}\n曲线给出 P = Σ m vₓ²/V = {th}，P·V = {pv}。已记录 {n} 个点。',
    s4status: '测得 P = {P}，P·V = {PVm}',
    s4running: '正在测量，已过 {t}/40 个时间单位，当前平均 P = {P}',
    s4idle: '还没在这个体积测量',
    s4hint: '观察顺序：保持「温度 ×1」，把活塞放在 V = 2、1、0.5 各测一次：点落在同一条双曲线上，V 减半时 P 翻倍，P·V 读数几乎不变（有限时间的记账，起伏不到 1%）。再切到「温度 ×2」在几个体积上测：点落在高一倍的另一条曲线上，同体积下压强翻倍。',

    s5k: '第 5 步 · 速率分布',
    s5t: '如果一开始所有分子都一样快，碰撞会把它们变成什么样？',
    s5e: '这一步要回答：前几步直接给分子安排了正态分布的速度分量。真实气体为什么恰好是这种分布？如果一开始所有分子速率完全相同，会发生什么？答案在分子之间的碰撞里（前几步的分子互不相碰，这一步才加上）。这里 3000 个分子开始时速率全都等于 √3（教学单位），方向随机。每一「轮」随机挑出 1500 对分子各碰一次，平均每个分子碰一次：每次碰撞保持两者的总动量和总动能不变，只把两者的相对速度随机转个方向（这是「任意两个分子同样容易相碰」的简化模型，它影响趋向平衡的快慢，不影响最后的分布）。碰撞让能量在分子间来回转手，于是有的变快、有的变慢。上图是速率的<strong>直方图</strong>（纵轴是概率密度：落在每一格的比例 ÷ 格宽），橙色曲线是<strong>麦克斯韦速率分布</strong> f(v) = √(2/π)·v²/σ³·e^(−v²/2σ²)，σ = √(kT/m)；这里 σ = 1，因为平均 v² 守恒地等于 3。下图记录每一轮的<strong>总变差距离</strong>：两个分布逐格相减取绝对值、求和再除以 2；0 表示完全相同，1 表示毫无重叠。',
    play5: '连续碰撞 12 轮', one5: '再碰一轮', reset5: '回到全部一样快',
    s5lgH: '模拟的速率直方图', s5lgM: '麦克斯韦分布 f(v)', s5lgTV: '每一轮的总变差距离', s5lgFloor: '同样 3000 个、直接从麦克斯韦分布抽样的距离',
    c5a: '速率分布（横轴：v，以 σ 为单位）', c5b: '与麦克斯韦分布的总变差距离（横轴：轮数）',
    s5readout: '第 {k}/12 轮：总变差距离 {tv}（抽样噪声的参照约 {floor}）；平均 v² = {e}（守恒）。\n速率超过 2 倍最概然速率的分子占 {frac}，麦克斯韦分布给出 {th}。换成 300 K 的氮气（σ = {sig} m/s）：最概然速率 {vmp}、平均速率 {vbar}、方均根速率 {vrms} m/s。',
    s5hint: '观察顺序：先看第 0 轮：所有分子挤在 v = √3 那一格，高出图顶。按「再碰一轮」一下一下推进：第 1 轮后尖峰就散开成宽宽的一坨，几轮之后直方图贴住橙色曲线，下图的距离降到虚线附近就不再下降。虚线是 3000 个样本本身的抽样噪声，比它更低就没有意义了。注意平均 v² 始终是 3：碰撞只是转手能量，不产生能量。',

    s6k: '第 6 步 · 收束', s6t: '一本账：冲量 → 压强 → 温度 → 分布',
    s6fin: '回头串一遍。<strong>第 0 步</strong>：一个分子每次撞墙给出冲量 2mv，每隔 2L/v 撞一次，平均力 mv²/L。<strong>第 1 步</strong>：理想气体分子各算各的，压强 P = Σ m vₓ²/V，用撞墙记账测出来的结果和公式一致。<strong>第 2 步</strong>：各向同性让三个方向平分 v²，P = (2/3)(N/V)⟨½mv²⟩；分子少时份额有起伏，宽度按 1/√N 缩小。<strong>第 3 步</strong>：对照 PV = NkT 得到 ⟨½mv²⟩ = (3/2)kT，温度是平均平动动能的刻度，v_rms = √(3kT/m)。<strong>第 4 步</strong>：速度不变时 P ∝ 1/V，这就是等温压缩的玻意耳定律。<strong>第 5 步</strong>：只要有碰撞转手能量，任何起始速率都会走向麦克斯韦分布。',
    formula: 'P = (1/3)·(N/V)·m⟨v²⟩\n⟨½mv²⟩ = (3/2)·kT\nv_rms = √(3kT/m)',
    boundary: '适用范围：本页是理想气体：分子当作点，除了瞬间碰撞没有相互作用；墙光滑且完全弹性；气体整体静止且各向同性。盒子模拟用教学单位，压强与温度的关系是用公式对照真实常量得到的。只计平动动能：双原子分子还会转动，热容与单原子不同，但 ⟨½mv²⟩ = (3/2)kT 仍然成立。密度很高或温度很低时，分子自身体积与相互吸引不可忽略，PV = NkT 不再准确；极低温下还要用量子统计。第 5 步的碰撞规则是简化模型，只用来说明分布从何而来，不能用来算真实气体的弛豫时间。',
    linksTitle: '接着去哪里',
    lk1: '→ 热力学第 2 步：等温与绝热，压缩时温度变不变',
    lk2: '→ 粒子与物态第 1 步：加热让粒子动得更凶',
    lk3: '→ 动量与碰撞第 1 步：冲量就是动量的改变',
    lk4: '→ 卡诺循环第 0 步：气体对外做的功是 P–V 图下的面积',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《气体压强的微观图景 · 撞墙的账本》的平行版本。'
  },
  en: {
    pageTitle: 'Gas Pressure · From One Wall Hit to a Whole Gas',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Microscopic Picture of Gas Pressure · A Ledger of Wall Hits →',
    navLabel: 'Kinetic theory steps',
    tagline: 'Why does the gas in a bottle push outward? All we are given: a gas is a huge number of molecules flying about and bouncing off the walls. What we want: how pressure, temperature and molecular speed are tied together. In seven steps we work out one molecule hitting one wall, add the bill up for a whole gas, and finally see where the spread of speeds comes from.',
    nav0: '0 One hit', nav1: '1 Many molecules', nav2: '2 Why 1/3', nav3: '3 Temperature', nav4: '4 Compression', nav5: '5 Speed spread', nav6: '6 Wrap-up',

    s0k: 'Step 0 · One molecule',
    s0t: 'A molecule bounces between two walls. What average force does it put on the right wall?',
    s0e: 'This step asks: a molecule only touches the wall in brief, separate knocks, so how do those knocks add up to a steady push? Start with one molecule moving left and right only: mass m, speed v, bouncing between walls a distance L apart (the box simulations on this page use teaching units with m = 1). The walls are perfectly smooth and elastic, so a hit turns +v into −v and the molecule’s momentum (mass × velocity) changes by 2mv. The wall receives an <strong>impulse</strong> (force × the time it acts, equal to the momentum change it causes) of 2mv (<a class="xlink" href="../../../physics/mechanics/momentum-collision/#step1">→ Momentum, step 1: force times time is the change in momentum</a>). Between two hits on the right wall the molecule has to make a round trip of 2L, which takes 2L/v. So over a long time the right wall collects 2mv every 2L/v, an impulse per unit time of <strong>mv²/L</strong>: that is the average force.',
    v0: 'Speed v (teaching units)', L0: 'Wall spacing L', t0: 'Elapsed time t', play0: 'Play from t = 0 to 12',
    s0lgHit: 'impulse 2mv of each hit on the right wall', s0lgMean: 'average force = total impulse ÷ t', s0lgTh: 'long-run value mv²/L',
    c0a: 'The box (seen from above)', c0b: 'Impulse delivered to the right wall (one bar per hit)', c0c: 'Average force: total impulse so far ÷ time elapsed',
    s0readout: 't = {t}: the right wall has been hit {hits} times, each with impulse 2mv = {imp}, spaced 2L/v = {gap} apart.\nAverage force = total impulse {tot} ÷ {t} = {mean}; long-run value mv²/L = {th}.',
    s0readoutNone: 't = {t}: the molecule has not reached the right wall yet (first hit at t = L/v = {first}), so the total impulse is 0. Long-run value mv²/L = {th}.',
    s0hint: 'What to try: keep L = 1 and press play. Each hit adds a bar to the middle chart; the average force at the bottom jumps up at every hit and sags in between, the swings shrinking as it settles onto the dashed line. Now raise v from 1 to 2: the bars get twice as tall (the impulse 2mv doubles) and come twice as often (the round trip is quicker), so the long-run force is 4 times bigger. Then double L: the same impulse, half as often, half the force.',

    s1k: 'Step 1 · Many molecules',
    s1t: 'N molecules with all sorts of velocities hit the wall. What is the pressure?',
    s1e: 'This step asks: when many molecules move at different speeds in different directions, how does the wall-hit bookkeeping turn into a pressure? <strong>Pressure</strong> is the average force per unit area of wall (<a class="xlink" href="../../../physics/matter/pressure/#step0">→ Pressure, step 0: the same force on a smaller area presses harder</a>). The simulated box is a cube of side 1 (teaching units), so the right wall has area A = 1 and the volume is V = 1. You see it face-on, so the front-to-back motion is hidden, but it is there. Split each velocity into components vₓ, v_y, v_z. Only the left–right part vₓ decides how often a molecule reaches the right wall and how hard it hits; the wall is smooth, so up-down and front-back motion only moves where it lands and never changes vₓ. Molecules of an ideal gas do not interact, so each one keeps its own account: molecule i supplies an average force m vₓᵢ²/L. Add them up and divide by the area: <strong>P = Σ m vₓ² / V = N·m⟨vₓ²⟩ / V</strong>, where ⟨vₓ²⟩ is the average of vₓ² over the N molecules. The page does not just plug into this formula. It logs the time and impulse 2m|vₓ| of every hit on the right wall and divides total impulse by elapsed time and area. That is the <strong>measured pressure</strong>, which we then compare with the formula.',
    N1: 'Number of molecules N', t1: 'Elapsed time t', play1: 'Play from t = 0 to 40',
    s1lgP: 'molecules (front view)', s1lgHit: 'just hit the right wall', s1lgRun: 'measured pressure ÷ formula value', s1lgPrev: 'curve for the previous N', s1lgTh: 'ratio 1: exact agreement with Σ m vₓ² / V',
    c1a: 'Front view of the box; the right wall keeps the ledger', c1b: 'Measured pressure ÷ formula value over time (1 = exact)',
    s1readout: 'N = {N}, t = {t}: the right wall has taken {hits} hits, total impulse {imp}.\nMeasured pressure = {imp} ÷ {t} ÷ 1 = {P}; formula Σ m vₓ²/V = {th} ({dev}% apart).',
    s1hint: 'What to try: play with N = 20 first. The cyan curve swings wildly early on and then settles near the dashed line at ratio 1; it is the pressure measured up to that moment divided by the formula value, so more hits make it steadier. Then drag N to 300 and play again. The grey curve is the N = 20 run, kept for comparison; with more molecules every stretch of time holds many hits, and the curve hugs 1 much sooner. The chart shows a ratio so that different N can share it; for the pressure itself read the numbers: the formula value grows roughly in proportion to N, each molecule adding about m⟨vₓ²⟩ ≈ 1.',

    s2k: 'Step 2 · Sharing among directions',
    s2t: 'Pressure only uses vₓ². Why does the final formula have one third of ⟨v²⟩?',
    s2e: 'This step asks: the pressure from step 1 uses only the left–right part vₓ², while a molecule’s kinetic energy ½mv² uses the whole squared speed v² = vₓ² + v_y² + v_z². How are the two related? If the gas has no favourite direction (it is <strong>isotropic</strong>: in a container at rest, collisions between molecules keep scrambling directions), the three directions share the total of v² equally, ⟨vₓ²⟩ = ⟨v²⟩/3, and so <strong>P = (1/3)·(N/V)·m⟨v²⟩ = (2/3)·(N/V)·⟨½mv²⟩</strong>, where ⟨½mv²⟩ is the mean translational kinetic energy per molecule. But the equal split only holds on average: with a finite number of molecules the share of vₓ² wanders around 1/3. Each press of “Draw another set” draws N fresh velocities from the same distribution (three independent normal components, σ = 1 in teaching units). The top chart shows how the three directions split this set; the bottom chart logs the vₓ² share as one dot. The shaded band is where about 95% of draws should land (mean ± 2 standard deviations; here the share follows a Beta(N/2, N) distribution, with standard deviation about 0.385/√N).',
    N2: 'Molecules per set N', resample: 'Draw another set', burst: 'Draw 20 sets', beam: 'Switch to a beam: all velocities along ±x', clearPts: 'Clear dots',
    s2lgX: 'share of vₓ²', s2lgY: 'share of v_y²', s2lgZ: 'share of v_z²', s2lgThird: '1/3', s2lgBand: 'range holding about 95% of draws',
    c2a: 'How this set splits the total of v² among vₓ², v_y², v_z²', c2b: 'vₓ² share of every set (horizontal: molecules per set N, log scale)',
    s2readout: 'N = {N}, set {k}: vₓ² takes {sx}, v_y² {sy}, v_z² {sz}.\nRight-wall pressure Σ m vₓ²/V is {ratio} × (1/3)·N m⟨v²⟩/V. The bottom chart holds {n} dots; {inside} of them sit inside the band.',
    s2beam: 'Beam: the same speeds, but every velocity points along ±x. vₓ² takes all of it, v_y² and v_z² none.\nThe right-wall pressure is 3 × the isotropic value (1/3)·N m⟨v²⟩/V, and the other walls feel nothing: the 1/3 holds only for an isotropic gas.',
    s2hint: 'What to try: at N = 30 press “Draw another set” a few times, or “Draw 20 sets”, and watch the dots scatter widely around 1/3. Repeat at N = 3000: the dots crowd in close, the spread shrinking roughly as 1/√N. A litre of real air holds about 2.5 × 10²² molecules, so the wobble is utterly invisible. Finally press the beam button: the same speeds, just lined up in one direction, and the right-wall pressure triples at once.',

    s3k: 'Step 3 · Temperature',
    s3t: 'What does temperature mean for the molecules, and how fast are real ones?',
    s3e: 'This step asks: what is temperature at the molecular level? Experiments give the ideal-gas law PV = NkT (<a class="xlink" href="../../../physics/thermal/thermodynamics/#step0">→ Thermodynamics, step 0: the state variables P, V, T</a>), where T is the absolute temperature in kelvin and k = 1.380649 × 10⁻²³ J/K is Boltzmann’s constant. Step 2 derived P = (2/3)·(N/V)·⟨½mv²⟩ from wall hits. Both describe the same pressure, so <strong>⟨½mv²⟩ = (3/2)·kT</strong>: temperature is a gauge of the mean translational kinetic energy per molecule, whatever the molecule. Define the <strong>root-mean-square speed</strong> v_rms = √⟨v²⟩ (square the speeds, average, take the root); then <strong>v_rms = √(3kT/m)</strong>, so at the same temperature heavier molecules are slower, with v_rms proportional to 1/√m. This step uses real molecular masses and SI units, not the box simulation.',
    T3: 'Temperature T (K)',
    gasHe: 'Helium He', gasNe: 'Neon Ne', gasN2: 'Nitrogen N₂', gasCO2: 'Carbon dioxide CO₂', gasXe: 'Xenon Xe',
    c3a: 'Root-mean-square speed v_rms (m/s) against temperature T (K)', c3b: 'Mean kinetic energy (3/2)kT (meV)',
    s3readout: '{gas} (molecular mass {u} u) at T = {T} K: v_rms = √(3kT/m) = {vrms} m/s.\nMean translational kinetic energy (3/2)kT = {ke} × 10⁻²¹ J = {mev} meV (1 meV = 1.602 × 10⁻²² J), exactly the same for all five gases.',
    s3hint: 'What to try: first click through the gas buttons with the temperature fixed. The marker jumps between curves, with speeds differing several-fold, yet the five bars below stay level. Then drag only the temperature: every curve rises as √T, and quadrupling T exactly doubles v_rms. For scale: nitrogen in room-temperature air has v_rms near 500 m/s, faster than sound (about 343 m/s).',
    quizPrompt: 'Think: a container holds equal numbers of helium and xenon atoms at the same temperature. Which gas supplies more of the pressure?',
    quizA: 'Helium: it is much faster, so it hits more often', quizB: 'They supply the same', quizC: 'Xenon: it is much heavier, so each hit is harder',
    check: 'Check', correct: 'Right. Pressure depends only on N/V and ⟨½mv²⟩ = (3/2)kT. Xenon is about 33 times heavier and its v_rms is 1/5.7 of helium’s: each impulse 2m|vₓ| is 5.7 times bigger, but the hits come 5.7 times less often, and the two cancel exactly.',
    wrong: 'Look again: each molecule’s share of the pressure is proportional to m·vₓ², which is kinetic energy. At the same temperature, what is the mean kinetic energy of each kind?',

    s4k: 'Step 4 · Compression',
    s4t: 'Squeeze a gas to half its volume at fixed temperature. Why does the pressure exactly double?',
    s4e: 'This step asks: where does the inverse relation between volume and pressure come from? Replace the right wall with a movable piston; the box length L is then the volume V (cross-section A = 1). With the molecular velocities unchanged, the time between hits on the piston, 2L/|vₓ|, shrinks with L while each impulse 2m|vₓ| stays the same. So each molecule’s average force m vₓ²/L is inversely proportional to L, P = Σ m vₓ² / V, and <strong>P·V stays constant</strong>: Boyle’s law. Moving the piston here is a teaching shortcut that leaves every velocity untouched. It stands for compressing very slowly while the gas trades heat with surroundings at a fixed temperature (an isothermal process). Push the piston in fast without letting heat out and molecules rebound faster off the advancing piston, so the gas warms up (<a class="xlink" href="../../../physics/thermal/thermodynamics/#step2">→ Thermodynamics, step 2: the isothermal and adiabatic paths</a>). “Temperature ×2” multiplies every velocity by √2, doubling the mean kinetic energy. “Measure” runs 120 molecules for 40 time units, logs every hit, and leaves the resulting average pressure as a dot on the P–V chart.',
    L4: 'Piston position L = volume V', tf1: 'Temperature ×1', tf2: 'Temperature ×2', measure: 'Measure (40 time units)',
    s4lg1: 'temperature ×1: measured dots and the P·V = constant curve', s4lg2: 'temperature ×2: measured dots and curve', s4lgNow: 'measurement in progress',
    c4a: 'Piston box (front view), 120 molecules', c4b: 'Pressure P against volume V (solid: Σ m vₓ²/V)',
    s4readout: 'V = {V}, temperature ×{tf}: {status}\nThe curve gives P = Σ m vₓ²/V = {th}, P·V = {pv}. Dots recorded: {n}.',
    s4status: 'measured P = {P}, P·V = {PVm}',
    s4running: 'measuring, {t}/40 time units so far, running average P = {P}',
    s4idle: 'not measured at this volume yet',
    s4hint: 'What to try: stay at “Temperature ×1” and measure once each at V = 2, 1 and 0.5. The dots fall on a single hyperbola: halving V doubles P, and the P·V readout hardly moves (bookkeeping over a finite time wobbles by under 1%). Then switch to “Temperature ×2” and measure at a few volumes: the dots land on a second curve twice as high, so at each volume the pressure has doubled.',

    s5k: 'Step 5 · The spread of speeds',
    s5t: 'Start every molecule at the same speed. What do collisions turn that into?',
    s5e: 'This step asks: the earlier steps simply handed the molecules normally distributed velocity components. Why does a real gas end up with exactly that spread? What if every molecule started at the same speed? The answer lies in collisions between molecules (the earlier steps had none; this one adds them). Here 3000 molecules all start at speed √3 (teaching units) in random directions. Each “round” picks 1500 random pairs and lets each pair collide once, so each molecule collides about once per round. A collision keeps the pair’s total momentum and total kinetic energy, and only swings their relative velocity to a random new direction (a simplified model in which any two molecules are equally likely to meet; it sets how fast the gas settles, not where it settles). Collisions pass energy back and forth, so some molecules speed up and others slow down. The top chart is a <strong>histogram</strong> of speeds (vertical axis is probability density: the fraction in each bin ÷ bin width). The orange curve is the <strong>Maxwell speed distribution</strong> f(v) = √(2/π)·v²/σ³·e^(−v²/2σ²) with σ = √(kT/m); here σ = 1 because the mean of v² stays at 3. The bottom chart logs the <strong>total variation distance</strong> after each round: subtract the two distributions bin by bin, add up the absolute differences and halve the sum; 0 means identical, 1 means no overlap at all.',
    play5: 'Run 12 rounds of collisions', one5: 'One more round', reset5: 'Back to equal speeds',
    s5lgH: 'simulated speed histogram', s5lgM: 'Maxwell distribution f(v)', s5lgTV: 'total variation distance after each round', s5lgFloor: 'distance for 3000 speeds drawn straight from the Maxwell distribution',
    c5a: 'Speed distribution (v in units of σ)', c5b: 'Distance to Maxwell after each round',
    s5readout: 'Round {k}/12: total variation distance {tv} (sampling-noise reference about {floor}); mean v² = {e} (conserved).\nMolecules faster than twice the most probable speed: {frac}; the Maxwell distribution gives {th}. For nitrogen at 300 K (σ = {sig} m/s): most probable speed {vmp}, mean speed {vbar}, rms speed {vrms} m/s.',
    s5hint: 'What to try: look at round 0 first: every molecule sits in the bin at v = √3, far above the top of the chart. Step forward with “One more round”: after one round the spike has already slumped into a broad hump, and within a few rounds the histogram lies on the orange curve while the distance below drops to the dashed line and stays there. The dashed line is the sampling noise of 3000 values; you cannot do better than that. Note that the mean of v² stays at 3 throughout: collisions pass energy around, they do not create it.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One ledger: impulse → pressure → temperature → spread',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: one molecule delivers an impulse 2mv every 2L/v, an average force of mv²/L. <strong>Step 1</strong>: in an ideal gas each molecule keeps its own account, so P = Σ m vₓ²/V, and the pressure measured from logged wall hits matches it. <strong>Step 2</strong>: isotropy shares v² equally among the three directions, giving P = (2/3)(N/V)⟨½mv²⟩; with few molecules the share wobbles, by an amount shrinking as 1/√N. <strong>Step 3</strong>: matching this with PV = NkT gives ⟨½mv²⟩ = (3/2)kT; temperature gauges the mean translational kinetic energy, and v_rms = √(3kT/m). <strong>Step 4</strong>: with velocities unchanged, P ∝ 1/V, which is Boyle’s law for isothermal compression. <strong>Step 5</strong>: as long as collisions pass energy around, any starting set of speeds heads to the Maxwell distribution.',
    formula: 'P = (1/3)·(N/V)·m⟨v²⟩\n⟨½mv²⟩ = (3/2)·kT\nv_rms = √(3kT/m)',
    boundary: 'Scope: this page treats an ideal gas: point molecules with no interaction apart from instant collisions, smooth perfectly elastic walls, and a gas at rest overall with no preferred direction. The box simulations use teaching units; the link between pressure and temperature comes from matching formulas with real constants. Only translational kinetic energy counts here: diatomic molecules also rotate, so their heat capacity differs from a monatomic gas, but ⟨½mv²⟩ = (3/2)kT still holds. At high density or low temperature the size of the molecules and their attraction matter and PV = NkT is no longer accurate; at very low temperature quantum statistics takes over. The collision rule in step 5 is a simplified model meant to show where the distribution comes from, not to compute real relaxation times.',
    linksTitle: 'Where to go next',
    lk1: '→ Thermodynamics, step 2: isothermal vs adiabatic, does compression warm the gas?',
    lk2: '→ Particles & states, step 1: heating makes particles move more wildly',
    lk3: '→ Momentum & collisions, step 1: impulse is the change in momentum',
    lk4: '→ Carnot cycle, step 0: work done by a gas is the area under its P–V curve',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Microscopic Picture of Gas Pressure · A Ledger of Wall Hits”.'
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
  if (typeof window.refreshKinetic === 'function') window.refreshKinetic();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.KT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
