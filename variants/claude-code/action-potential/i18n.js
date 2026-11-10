'use strict';
// Action potential lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '神经动作电位 · 电压在追一个会移动的目标',
    back: '← 知识索引',
    compare: '对照另一版本：神经动作电位 · 一次脉冲如何跑过神经元 →',
    navLabel: '动作电位步骤导航',
    tagline: '一根神经纤维的膜电位平时停在 −65 mV 左右，受到足够的刺激就在约 2 毫秒里冲到 +40 mV 再落回来，并沿着纤维一路传下去。这一页用一条线索解释整件事：膜电位总在被拉向「各种离子通道按开放程度加权的平均值」，通道开关一变，这个目标就移动。全部曲线来自 Hodgkin–Huxley（1952）乌贼巨轴突模型的数值模拟（6.3 °C 参数）。',
    nav0: '0 静息电位', nav1: '1 阈值', nav2: '2 Na⁺ 与 K⁺', nav3: '3 不应期', nav4: '4 发放频率', nav5: '5 传导', nav6: '6 收束',

    s0k: '第 0 步 · 静息电位',
    s0t: '没有刺激时，膜电位为什么停在 −65 mV 附近？',
    s0e: '这一步要回答：膜电位（膜内相对膜外的电压）平时的值由什么决定？膜两侧的离子浓度不同：K⁺ 内多外少，Na⁺ 外多内少（这个差是钠钾泵耗 ATP 维持的，<a class="xlink" href="../membrane-transport/#step4">→ 膜运输（Claude 版）第 4 步：泵与漏的稳态</a>）。浓度差让每种离子都有一个想把膜电位拉到的值，叫<strong>平衡电位</strong>：本模型里 K⁺ 的 E_K = −77 mV，Na⁺ 的 E_Na = +50 mV，另有一个笼统的「漏」通道 E_L ≈ −54 mV。每种离子拉得多用力，取决于它的通道开了多少，用<strong>电导 g</strong>（mS/cm²，越大表示开着的通道越多）衡量。膜电位最后停在三者按电导加权的平均值：V = (g_Na·E_Na + g_K·E_K + g_L·E_L) ÷ (g_Na + g_K + g_L)。静息时 K⁺ 通道开得比 Na⁺ 多几十倍，所以 V 靠近 E_K。',
    naSlider: 'Na⁺ 电导 g_Na（相对静息，对数刻度）', kSlider: 'K⁺ 电导 g_K（相对静息，对数刻度）',
    s0lgNa: 'Na⁺ 的份额与 E_Na', s0lgK: 'K⁺ 的份额与 E_K', s0lgL: '漏通道的份额与 E_L', s0lgV: '膜电位 V（加权平均）',
    c0a: '各离子在加权平均中的份额', c0b: '膜电位刻度（mV）',
    s0readout: 'g_Na = {gna}、g_K = {gk}、g_L = 0.3 mS/cm²：权重 Na⁺ {wna}%、K⁺ {wk}%、漏 {wl}% → V = {V} mV。',
    s0hint: '观察顺序：先只把 Na⁺ 电导往右拖到 ×1000：Na⁺ 的份额（橙色）占满，白色 V 标记一路滑向 E_Na（+50 mV）——这正是动作电位上升时发生的事。拖回 ×1 后，再只把 K⁺ 电导往右拖：V 贴向 E_K（−77 mV），比静息还负。V 永远落在 E_K 和 E_Na 之间。',

    s1k: '第 1 步 · 阈值',
    s1t: '刺激大一点，反应就大一点吗？',
    s1e: '这一步要回答：给膜注入一个 1 毫秒的电流脉冲（强度 I，µA/cm²，即每平方厘米膜上的微安电流），膜电位怎样反应？弱刺激只让 V 抬高一点，随后自己落回去，抬多少跟刺激强度成比例，叫<strong>局部电位</strong>。可一旦 V 被推过某个电压，Na⁺ 通道开始成批打开：Na⁺ 流进来让 V 更高，更高的 V 又打开更多 Na⁺ 通道——这是<strong>正反馈</strong>。V 于是冲向 E_Na，形成<strong>动作电位</strong>（尖峰）。触发它所需的最小刺激叫<strong>阈值</strong>。过了阈值，尖峰高度由 E_Na 和通道决定，不再由刺激决定，这叫<strong>全或无</strong>。本页把 V 越过 0 mV 计为一次动作电位。',
    iSlider: '脉冲强度 I（µA/cm²，持续 1 ms）',
    s1lgV: '当前刺激下的 V(t)', s1lgGhost: '之前试过的强度', s1lgCurve: '峰值电压随刺激强度', s1lgThr: '阈值',
    c1a: '膜电位 V（mV）· 横轴：时间（ms）', c1b: '最高电压（mV）· 横轴：脉冲强度 I',
    s1sub: 'I = {I}：没过阈值（{thr}）。V 最高只到 {pk} mV，比静息高 {dv} mV，随后落回 −65 mV——这是局部电位，强度加倍，抬高也约加倍。',
    s1spike: 'I = {I}：超过阈值（{thr}），产生动作电位，峰值 {pk} mV，出现在第 {tp} ms。在本页的范围里（阈值以上到 30），无论刺激多强，峰值都在 {lo} 到 {hi} mV 之间。',
    s1hint: '观察顺序：把 I 依次拖到 2、4、6：「膜电位」图里的小鼓包按比例变高，「最高电压」图上的点沿一条缓坡走。再拖到 6.5、7：在 6.92 处，点突然跳上 +30 mV 以上的台阶；继续拖到 30，台阶几乎是平的——更强的刺激只让尖峰来得早一点，不让它高多少。',

    s2k: '第 2 步 · Na⁺ 与 K⁺ 的交接',
    s2t: '一次尖峰里，是什么让电压先冲上去、再落下来，还落得比静息更低？',
    s2e: '这一步要回答：尖峰的上升、下降和下冲各由哪种通道负责？用第 0 步的规则看：V 总在追赶一个「目标」，目标就是此刻按电导加权的平均值（下方图中的虚线）。通道开关有快有慢：Na⁺ 通道<strong>打开得快</strong>，几乎同时又被自己的「门」堵上，叫<strong>失活</strong>（h 表示还没被堵上的比例）；K⁺ 通道<strong>打开得慢，关得也慢</strong>。所以先是 g_Na 冲高、目标被拉到 E_Na 附近、V 上冲；接着 Na⁺ 失活、g_K 升起，目标被拉向 E_K、V 下落；K⁺ 通道关得慢，V 会短暂低于静息，叫<strong>超极化</strong>（下冲）。刺激用 10 µA/cm²、1 ms。',
    tCursor: '时间光标 t（ms）', play2: '播放这次尖峰',
    s2lgV: '膜电位 V', s2lgTarget: '目标：加权平均电位', s2lgNa: 'Na⁺ 电导 g_Na', s2lgK: 'K⁺ 电导 g_K',
    c2a: '膜电位与它追赶的目标（mV）· 横轴：时间（ms）', c2b: '电导（mS/cm²）· 横轴：时间（ms）',
    s2readout: 't = {t} ms：V = {V} mV，目标 {tg} mV；g_Na = {gna}、g_K = {gk} mS/cm²，Na⁺ 通道未失活比例 h = {h}。{phase}',
    phRest: '静息：K⁺ 份额最大，目标就在 −65 mV，V 不动。',
    phStim: 'V 被刺激推高，Na⁺ 通道开始打开，但 g_Na 还小于 g_K：正反馈正在启动。',
    phRise: '上升期：g_Na 大于 g_K，目标被拉向 E_Na（+50 mV），V 正往上追。',
    phFall: '下降期：Na⁺ 通道大批失活（h 变小），g_Na 回落、g_K 上升，目标随之向 E_K（−77 mV）下移，V 往下追。',
    phUnder: '超极化：Na⁺ 几乎全关，K⁺ 通道还没关完，目标比静息还负，V 低于 −65 mV。',
    phRecover: '恢复：K⁺ 通道慢慢关上，h 慢慢回升，V 回到静息。',
    s2hint: '观察顺序：按「播放」或拖时间光标，盯住「膜电位与目标」图：白线（V）一直在追虚线（目标），目标先跳到 +40 附近、再跌到 −76 附近。同时看「电导」图：橙色 g_Na 的峰（约 3.6 ms）早，青色 g_K 的峰（约 5.1 ms）晚——两条峰的先后，就是尖峰先升后降的原因。',

    s3k: '第 3 步 · 不应期',
    s3t: '刚发完一次尖峰，马上再刺激一次，还能再发吗？',
    s3e: '这一步要回答：第一个尖峰之后隔 Δt 再给第二个 1 ms 脉冲，需要多强才能再触发？刚发完时 Na⁺ 通道大多处于失活状态（h 很小），要等一段时间才能恢复；同时 K⁺ 通道还开着，把 V 往下拉。所以紧接着的一段时间里，再强的刺激也触发不了（本模型在 200 µA/cm² 以内都不行），叫<strong>绝对不应期</strong>；之后能触发但要更强的刺激，叫<strong>相对不应期</strong>。第一个脉冲固定为 10 µA/cm²，Δt 从第一个脉冲开始算到第二个脉冲开始。',
    gapSlider: '两次脉冲的间隔 Δt（ms）', i2Slider: '第二个脉冲强度（µA/cm²）',
    s3lgV: '膜电位 V(t)', s3lgThr: '第二个脉冲的阈值（随 Δt）', s3lgNow: '当前设置', s3lgSingle: '单个脉冲的阈值 6.92',
    c3a: '膜电位（mV）· 横轴：时间（ms）', c3b: '第二个脉冲需要多强 · 横轴：间隔 Δt（ms）',
    s3fire: 'Δt = {g} ms、第二个脉冲 {I}：超过此时的阈值 {thr}，触发了第二个尖峰（峰值 {pk} mV）。',
    s3noFire: 'Δt = {g} ms、第二个脉冲 {I}：低于此时的阈值 {thr}，没有第二个尖峰。',
    s3abs: 'Δt = {g} ms：仍在绝对不应期，200 µA/cm² 以内的刺激都触发不了第二个尖峰。',
    s3summary: '本模型里绝对不应期约 {abs} ms；阈值在 Δt ≈ {rel} ms 时回到单脉冲阈值的 1.1 倍以内，在 {sn} ms 左右甚至略低于单脉冲阈值（{min}），这一小段叫超常期。',
    s3hint: '观察顺序：保持第二个脉冲为 40，把 Δt 从 20 往左拖：「需要多强」图里白点先在曲线上方（触发），越过 Δt ≈ 9 后落到曲线下方（不触发），「膜电位」图里第二个尖峰随之消失。再把强度拖到 120：Δt 能缩到约 7，但到 6 以下无论多强都不行——曲线在那里升到图外。',

    s4k: '第 4 步 · 发放频率',
    s4t: '持续的刺激越强，尖峰会更高，还是更密？',
    s4e: '这一步要回答：给膜一个一直不停的电流 I，膜电位会怎样？每发完一次尖峰，电流又把 V 往上推，只要推过阈值就再发一次。刺激越强，从上一个尖峰恢复到能再发所需的时间越短，所以尖峰<strong>更密</strong>：用<strong>发放频率</strong>（每秒尖峰数，Hz，= 1000 ÷ 相邻尖峰的平均间隔毫秒数）计量。但下一个尖峰不能落在绝对不应期（约 6 ms）里，所以频率有上限。尖峰的高度不会因为刺激更强而变高，反而因为来得太快、Na⁺ 通道还没恢复完而略矮。间隔从电流接通后第 50 ms 起取 200 ms 来平均，避开开头的过渡。电流再大，本模型的尖峰会越来越矮，到 80 µA/cm² 时只在接通时发一次、不再重复发放，所以滑杆只到 40。',
    i4Slider: '持续电流 I（µA/cm²）',
    s4lgV: '膜电位 V(t)', s4lgCurve: '频率随电流（f–I 曲线）', s4lgNow: '当前电流', s4lgVisit: '试过的电流',
    c4a: '膜电位（mV）· 横轴：时间（ms，显示前 150 ms）', c4b: '发放频率（Hz）· 横轴：持续电流 I',
    s4none: 'I = {I}：电流太弱，V 只抬高到 {pk} mV，不发放。',
    s4onset: 'I = {I}：只在电流刚接通时发了 {n} 个尖峰，之后 V 停在 {vs} mV 附近，不再重复发放（频率 0 Hz）。',
    s4rate: 'I = {I}：50–250 ms 内发放 {n} 次，相邻尖峰平均间隔 {isi} ms → 频率 = 1000 ÷ {isi} ≈ {rate} Hz。这段时间里尖峰顶点在 {pmin} 到 {pmax} mV 之间，而单个 1 ms 脉冲触发的尖峰约 +39 mV——没有变高，反而更矮。',
    s4hint: '观察顺序：把 I 从 5 拖到 7：越过约 6.5 后开始连续发放，频率一下子从 0 跳到 55 Hz。继续拖到 20、30、40：「膜电位」图里的尖峰越来越密，「发放频率」图上的点沿曲线升到约 109 Hz；而尖峰顶部没有升高，反而越来越矮。',
    quizPrompt: '小测：刺激强度从刚过阈值增加到它的好几倍，每个动作电位会怎样？',
    quizA: '每个尖峰都更高，因为刺激更强',
    quizB: '尖峰高度基本不变（甚至略矮），变化的是每秒发放的次数',
    quizC: '尖峰变宽，持续时间按刺激强度成比例延长',
    checkQuiz: '核对答案', quizNone: '先选一个选项。',
    correct: '对。尖峰高度由 Na⁺ 的平衡电位和通道决定，与刺激无关；更强的刺激让尖峰来得更早、更密。本页 I = 10 时 {r10} Hz，I = 40 时 {r40} Hz。',
    wrong: '再想想。看「膜电位」图的尖峰顶部：I 从 10 加到 40，频率从 {r10} Hz 变到 {r40} Hz，尖峰却没有变高。神经系统主要用发放频率（以及参与的神经元数）来表示刺激强弱。',

    s5k: '第 5 步 · 传导',
    s5t: '尖峰怎样沿着纤维跑下去？纤维越粗，跑得越快吗？',
    s5e: '这一步要回答：在纤维一端触发的尖峰，怎样传到另一端、多快？尖峰处的膜内电位比相邻处高，电流沿纤维内部流向前方，把前方的膜推过阈值，前方于是自己发出尖峰——尖峰就这样一段段<strong>再生</strong>着往前走，高度不衰减。后方刚发过的膜处在不应期，所以尖峰不会往回走。纤维越粗，内部的电阻越小（像更粗的导线），电流能把更远处推过阈值，传得更快：对没有髓鞘的纤维，速度大约与直径的平方根成正比。乌贼巨轴突直径约 0.5 mm。本模拟把 6 cm 长的纤维分成 0.25 mm 一段，用 HH 模型（6.3 °C 参数）计算，在 2 cm 和 4 cm 处测量 V 越过 0 mV 的时刻差来求速度。',
    dSlider: '纤维直径 d（mm）', t5Slider: '时间 t（ms）', play5: '播放 12 ms',
    s5lgNow: '此刻沿纤维的膜电位', s5lgTrail: '每隔 1 ms 的旧位置', s5lgMeasure: '测速点（2 cm、4 cm）', s5lgCurve: '速度 ∝ √d（过 0.5 mm 的点）', s5lgDots: '已模拟的直径',
    c5a: '沿纤维的膜电位（mV）· 横轴：位置（cm）', c5b: '传导速度（m/s）· 横轴：直径 d（mm）',
    s5readout: 'd = {d} mm：尖峰在 {tA} ms 到达 2 cm、{tB} ms 到达 4 cm → 速度 = 2 cm ÷ {dt} ms = {v} m/s。与 0.5 mm 的 {v5} m/s 相比是 {ratio} 倍，√(d/0.5) = {sq}。',
    s5hint: '观察顺序：先按「播放」，看「沿纤维的膜电位」图：尖峰从左端出发、形状不变地向右移，身后留下低于静息的下冲（不应的区段）。然后把直径依次拖到 0.1、0.2、0.5、1.0：每次播放，尖峰跑得更快；「传导速度」图上的点逐个落在 √d 曲线上——直径 ×4，速度只 ×2。',

    s6k: '第 6 步 · 收束',
    s6t: '把一次神经脉冲说成三句话',
    s6fin: '<strong>膜电位总在追赶按电导加权的平均电位</strong>。静息时 K⁺ 通道开得多，目标靠近 E_K；推过阈值后 Na⁺ 通道成批打开，正反馈把目标拉到 E_Na，形成全或无的尖峰；Na⁺ 失活加上慢慢打开的 K⁺ 通道把目标拉回、甚至低于静息。失活的 Na⁺ 通道需要时间恢复，于是有不应期，它限制了发放频率，也让尖峰只向前传。刺激强弱用尖峰的频率表达，而不是高度；尖峰靠一段段再生沿纤维传导，纤维越粗越快。',
    formula: '加权平均：V → (g_Na·E_Na + g_K·E_K + g_L·E_L) / (g_Na + g_K + g_L)\n阈值（1 ms 脉冲）≈ 6.92 µA/cm²\n无髓鞘纤维：速度 ∝ √d',
    boundary: '适用范围：数值来自 Hodgkin–Huxley 乌贼巨轴突模型（6.3 °C），哺乳动物神经元的静息电位、阈值和时间尺度不同。有髓鞘的纤维靠在郎飞结之间「跳跃」传导，速度比同样粗细的无髓鞘纤维快得多，不服从这里的 √d 关系。本页没有模拟突触、树突整合和随机的通道开关。',
    linksTitle: '接着去看',
    lk1: '→ 神经科学基础页第 1 步：局部变化与全或无',
    lk2: '→ 神经科学基础页第 2 步：不应期怎样给速度设上限',
    lk3: '→ 膜运输（Claude 版）第 4 步：钠钾泵怎样维持离子浓度差',
    lk4: '→ 欧姆定律页第 1 步：电阻越大，电流越小（为什么粗纤维传得快）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《神经动作电位 · 一次脉冲如何跑过神经元》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Action Potentials · How One Pulse Travels”.'
  },
  en: {
    pageTitle: 'Action Potentials · A Voltage Chasing a Moving Target',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Action Potentials · How One Pulse Travels →',
    navLabel: 'Action potential steps',
    tagline: 'The membrane voltage of a nerve fibre normally sits near −65 mV. Given a strong enough kick, it shoots to about +40 mV and back within roughly 2 milliseconds, and the pulse runs along the fibre. This page explains all of it with one idea: the voltage is always being pulled toward an average of the ions’ voltages, weighted by how open each kind of channel is, and when channels open or close that target moves. Every curve is a numerical simulation of the Hodgkin–Huxley (1952) squid giant axon model (6.3 °C parameters).',
    nav0: '0 Resting', nav1: '1 Threshold', nav2: '2 Na⁺ and K⁺', nav3: '3 Refractory', nav4: '4 Firing rate', nav5: '5 Conduction', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Resting voltage',
    s0t: 'With no stimulus, why does the voltage sit near −65 mV?',
    s0e: 'The question: what sets the membrane voltage (inside relative to outside) at rest? Ion concentrations differ across the membrane: more K⁺ inside than out, more Na⁺ outside than in (a difference maintained by the ATP-driven sodium–potassium pump, <a class="xlink" href="../membrane-transport/#step4">→ Membrane transport (Claude edition), step 4: the pump–leak steady state</a>). Each concentration difference gives that ion a voltage it tries to pull the membrane to, its <strong>reversal potential</strong>: in this model E_K = −77 mV for K⁺, E_Na = +50 mV for Na⁺, plus a catch-all “leak” channel at E_L ≈ −54 mV. How hard each ion pulls depends on how many of its channels are open, measured as a <strong>conductance g</strong> (mS/cm²; bigger means more open channels). The voltage settles at the conductance-weighted average of the three: V = (g_Na·E_Na + g_K·E_K + g_L·E_L) ÷ (g_Na + g_K + g_L). At rest K⁺ channels are open tens of times more than Na⁺ channels, so V sits near E_K.',
    naSlider: 'Na⁺ conductance g_Na (relative to rest, log scale)', kSlider: 'K⁺ conductance g_K (relative to rest, log scale)',
    s0lgNa: 'Na⁺ share and E_Na', s0lgK: 'K⁺ share and E_K', s0lgL: 'Leak share and E_L', s0lgV: 'Membrane voltage V (weighted average)',
    c0a: 'Each ion’s share of the weighted average', c0b: 'Voltage scale (mV)',
    s0readout: 'g_Na = {gna}, g_K = {gk}, g_L = 0.3 mS/cm²: weights Na⁺ {wna}%, K⁺ {wk}%, leak {wl}% → V = {V} mV.',
    s0hint: 'What to watch: drag only the Na⁺ conductance right to ×1000. The Na⁺ share (orange) takes over and the white V marker slides toward E_Na (+50 mV); that is exactly what happens on the rising edge of an action potential. Return it to ×1, then drag only the K⁺ conductance right: V hugs E_K (−77 mV), more negative than rest. V always lands between E_K and E_Na.',

    s1k: 'Step 1 · Threshold',
    s1t: 'Does a slightly bigger stimulus give a slightly bigger response?',
    s1e: 'The question: inject a 1-millisecond current pulse of strength I (µA/cm², microamps per square centimetre of membrane). How does the voltage respond? A weak stimulus lifts V a little and V sinks back on its own; the lift scales with the stimulus. That is a <strong>local potential</strong>. But once V is pushed past a certain voltage, Na⁺ channels start opening in bulk: Na⁺ flows in and raises V, and the higher V opens still more Na⁺ channels. That is <strong>positive feedback</strong>. V races toward E_Na and makes an <strong>action potential</strong> (a spike). The smallest stimulus that triggers one is the <strong>threshold</strong>. Above threshold the spike’s height is set by E_Na and the channels, not by the stimulus; this is called <strong>all-or-none</strong>. This page counts a response as an action potential when V crosses 0 mV.',
    iSlider: 'Pulse strength I (µA/cm², lasting 1 ms)',
    s1lgV: 'V(t) for the current stimulus', s1lgGhost: 'Strengths you tried', s1lgCurve: 'Peak voltage vs stimulus', s1lgThr: 'Threshold',
    c1a: 'Membrane voltage V (mV) · across: time (ms)', c1b: 'Peak voltage (mV) · across: pulse strength I',
    s1sub: 'I = {I}: below threshold ({thr}). V only reaches {pk} mV, {dv} mV above rest, then sinks back to −65 mV. This is a local potential: double the stimulus and the lift roughly doubles.',
    s1spike: 'I = {I}: above threshold ({thr}), so an action potential fires, peaking at {pk} mV at {tp} ms. Across this page’s range (threshold up to 30), however strong the stimulus, the peak stays between {lo} and {hi} mV.',
    s1hint: 'What to watch: set I to 2, then 4, then 6. The small bump in the voltage chart grows in proportion, and the dot in the peak chart creeps along a gentle slope. Then go to 6.5 and 7: at 6.92 the dot jumps onto a plateau above +30 mV. Keep going to 30 and the plateau is nearly flat: a stronger stimulus only makes the spike come a little sooner, not much taller.',

    s2k: 'Step 2 · The Na⁺–K⁺ handoff',
    s2t: 'Within one spike, what drives the voltage up, then down, and then below rest?',
    s2e: 'The question: which channels are responsible for the rise, the fall and the undershoot? Use the rule from step 0: V is always chasing a “target”, the conductance-weighted average right now (the dashed line in the chart below). Channels switch at different speeds. Na⁺ channels <strong>open fast</strong> and almost as quickly get plugged by their own gate, which is called <strong>inactivation</strong> (h is the fraction not yet plugged). K⁺ channels <strong>open slowly and close slowly</strong>. So first g_Na shoots up, the target jumps near E_Na and V rises; then Na⁺ inactivates and g_K climbs, the target is pulled toward E_K and V falls; because K⁺ channels are slow to close, V briefly drops below rest, a <strong>hyperpolarization</strong> (the undershoot). The stimulus is 10 µA/cm² for 1 ms.',
    tCursor: 'Time cursor t (ms)', play2: 'Play this spike',
    s2lgV: 'Membrane voltage V', s2lgTarget: 'Target: weighted-average voltage', s2lgNa: 'Na⁺ conductance g_Na', s2lgK: 'K⁺ conductance g_K',
    c2a: 'Voltage and the target it chases (mV) · across: time (ms)', c2b: 'Conductance (mS/cm²) · across: time (ms)',
    s2readout: 't = {t} ms: V = {V} mV, target {tg} mV; g_Na = {gna}, g_K = {gk} mS/cm², fraction of Na⁺ channels not inactivated h = {h}. {phase}',
    phRest: 'Rest: K⁺ has the largest share, the target sits at −65 mV and V stays put.',
    phStim: 'The stimulus has pushed V up and Na⁺ channels are starting to open, but g_Na is still below g_K: the positive feedback is just getting going.',
    phRise: 'Rising phase: g_Na exceeds g_K, the target is pulled toward E_Na (+50 mV) and V is chasing it upward.',
    phFall: 'Falling phase: Na⁺ channels are inactivating in bulk (h shrinks), g_Na drops while g_K rises, so the target slides toward E_K (−77 mV) and V chases it down.',
    phUnder: 'Hyperpolarization: Na⁺ is almost fully shut while K⁺ channels have not finished closing, so the target is below rest and V dips under −65 mV.',
    phRecover: 'Recovery: K⁺ channels slowly close, h slowly recovers and V returns to rest.',
    s2hint: 'What to watch: press Play or drag the time cursor and keep your eye on the voltage-and-target chart. The white line (V) keeps chasing the dashed line (the target), which leaps to about +40 and then drops to about −76. Meanwhile, in the conductance chart, the orange g_Na peak (about 3.6 ms) comes early and the cyan g_K peak (about 5.1 ms) comes late. The order of those two peaks is why the spike rises first and falls second.',

    s3k: 'Step 3 · Refractory period',
    s3t: 'Right after one spike, can a second stimulus fire another?',
    s3e: 'The question: Δt after the first spike, a second 1-ms pulse arrives. How strong must it be to fire again? Just after a spike most Na⁺ channels are inactivated (h is small) and need time to recover, while K⁺ channels are still open and pulling V down. So for a while no stimulus can trigger a spike (in this model nothing up to 200 µA/cm² works): the <strong>absolute refractory period</strong>. After that a spike can be triggered, but only by a stronger stimulus: the <strong>relative refractory period</strong>. The first pulse is fixed at 10 µA/cm², and Δt runs from the start of the first pulse to the start of the second.',
    gapSlider: 'Gap between pulses Δt (ms)', i2Slider: 'Second pulse strength (µA/cm²)',
    s3lgV: 'Membrane voltage V(t)', s3lgThr: 'Threshold for the second pulse (vs Δt)', s3lgNow: 'Current setting', s3lgSingle: 'Single-pulse threshold 6.92',
    c3a: 'Membrane voltage (mV) · across: time (ms)', c3b: 'How strong the second pulse must be · across: gap Δt (ms)',
    s3fire: 'Δt = {g} ms, second pulse {I}: above the threshold at this gap ({thr}), so a second spike fires (peak {pk} mV).',
    s3noFire: 'Δt = {g} ms, second pulse {I}: below the threshold at this gap ({thr}), so there is no second spike.',
    s3abs: 'Δt = {g} ms: still in the absolute refractory period; nothing up to 200 µA/cm² can trigger a second spike.',
    s3summary: 'In this model the absolute refractory period is about {abs} ms; the threshold falls back within 1.1× the single-pulse value by Δt ≈ {rel} ms, and around {sn} ms it even dips slightly below it ({min}), a short window called the supernormal period.',
    s3hint: 'What to watch: keep the second pulse at 40 and drag Δt left from 20. In the how-strong chart the white dot starts above the curve (fires) and drops below it past Δt ≈ 9 (no spike), and the second spike in the voltage chart disappears. Then raise the strength to 120: Δt can shrink to about 7, but below 6 nothing works however strong; the curve shoots off the chart there.',

    s4k: 'Step 4 · Firing rate',
    s4t: 'With a steady stimulus, does a stronger one make taller spikes or more frequent ones?',
    s4e: 'The question: feed the membrane a current I that never stops. What does the voltage do? After every spike the current pushes V up again, and each time it crosses threshold another spike fires. The stronger the stimulus, the sooner the membrane recovers enough to fire again, so spikes come <strong>closer together</strong>; we measure this as the <strong>firing rate</strong> (spikes per second, Hz, = 1000 ÷ the mean gap between spikes in ms). But no spike can land inside the absolute refractory period (about 6 ms), so the rate has a ceiling. Spikes do not get taller with a stronger stimulus; they get slightly shorter, because they arrive before Na⁺ channels have fully recovered. The gaps are averaged over 200 ms starting 50 ms after the current switches on, skipping the start-up transient. With even more current the model’s spikes keep shrinking, and at 80 µA/cm² it fires once at switch-on and never again, so the slider stops at 40.',
    i4Slider: 'Steady current I (µA/cm²)',
    s4lgV: 'Membrane voltage V(t)', s4lgCurve: 'Rate vs current (f–I curve)', s4lgNow: 'Current setting', s4lgVisit: 'Currents you tried',
    c4a: 'Membrane voltage (mV) · across: time (ms, first 150 ms shown)', c4b: 'Firing rate (Hz) · across: steady current I',
    s4none: 'I = {I}: too weak. V only rises to {pk} mV and nothing fires.',
    s4onset: 'I = {I}: {n} spike(s) fire only when the current switches on; after that V settles near {vs} mV and does not fire again (rate 0 Hz).',
    s4rate: 'I = {I}: {n} spikes between 50 and 250 ms, on average {isi} ms apart → rate = 1000 ÷ {isi} ≈ {rate} Hz. In that stretch the spike tops lie between {pmin} and {pmax} mV, while a spike from a single 1-ms pulse reaches about +39 mV: not taller, if anything shorter.',
    s4hint: 'What to watch: drag I from 5 to 7. Past about 6.5 the membrane starts firing repeatedly and the rate jumps from 0 to about 55 Hz. Keep going to 20, 30 and 40: spikes in the voltage chart crowd closer and the dot in the rate chart climbs the curve to about 109 Hz, while the spike tops do not rise; they actually get shorter.',
    quizPrompt: 'Check: if the stimulus grows from just above threshold to several times that, what happens to each action potential?',
    quizA: 'Every spike gets taller, because the stimulus is stronger',
    quizB: 'Spike height stays about the same (or shrinks a little); what changes is how many fire per second',
    quizC: 'Spikes get wider, lasting longer in proportion to the stimulus',
    checkQuiz: 'Check answer', quizNone: 'Pick an option first.',
    correct: 'Right. Spike height is set by the Na⁺ reversal potential and the channels, not the stimulus; a stronger stimulus makes spikes come sooner and closer together. Here I = 10 gives {r10} Hz and I = 40 gives {r40} Hz.',
    wrong: 'Not quite. Look at the spike tops in the voltage chart: raising I from 10 to 40 takes the rate from {r10} Hz to {r40} Hz, yet the spikes do not get taller. The nervous system mainly encodes stimulus strength in firing rate (and in how many neurons respond).',

    s5k: 'Step 5 · Conduction',
    s5t: 'How does a spike run along the fibre? Does a thicker fibre carry it faster?',
    s5e: 'The question: a spike triggered at one end of a fibre — how does it reach the other end, and how fast? Inside the spike the voltage is higher than in the neighbouring stretch, so current flows along the inside of the fibre into the stretch ahead and pushes that membrane past threshold; the stretch ahead then fires its own spike. The spike is <strong>regenerated</strong> section by section and never shrinks. The stretch behind has just fired and is refractory, so the spike cannot run backwards. A thicker fibre has less internal resistance (like a thicker wire), so the current pushes membrane further ahead past threshold and the spike travels faster: for fibres without myelin, speed is roughly proportional to the square root of the diameter. The squid giant axon is about 0.5 mm across. This simulation splits a 6 cm fibre into 0.25 mm sections, uses the HH model (6.3 °C parameters), and measures speed from the time V crosses 0 mV at 2 cm and at 4 cm.',
    dSlider: 'Fibre diameter d (mm)', t5Slider: 'Time t (ms)', play5: 'Play 12 ms',
    s5lgNow: 'Voltage along the fibre now', s5lgTrail: 'Earlier positions, every 1 ms', s5lgMeasure: 'Timing points (2 cm, 4 cm)', s5lgCurve: 'Speed ∝ √d (through the 0.5 mm point)', s5lgDots: 'Diameters simulated',
    c5a: 'Voltage along the fibre (mV) · across: position (cm)', c5b: 'Conduction speed (m/s) · across: diameter d (mm)',
    s5readout: 'd = {d} mm: the spike reaches 2 cm at {tA} ms and 4 cm at {tB} ms → speed = 2 cm ÷ {dt} ms = {v} m/s. Compared with {v5} m/s at 0.5 mm that is {ratio}×, and √(d/0.5) = {sq}.',
    s5hint: 'What to watch: press Play first and follow the voltage-along-the-fibre chart. The spike leaves the left end and slides right without changing shape, leaving a below-rest undershoot behind it (the refractory stretch). Then set the diameter to 0.1, 0.2, 0.5 and 1.0 in turn and play each: the spike runs faster, and in the speed chart each new dot lands on the √d curve. Four times the diameter only doubles the speed.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One nerve impulse in three sentences',
    s6fin: '<strong>The membrane voltage always chases the conductance-weighted average voltage.</strong> At rest K⁺ channels dominate and the target sits near E_K; pushed past threshold, Na⁺ channels open in bulk and positive feedback drags the target to E_Na, giving an all-or-none spike; Na⁺ inactivation plus slowly opening K⁺ channels pull the target back and even below rest. Inactivated Na⁺ channels take time to recover, which creates the refractory period, caps the firing rate and keeps spikes moving forward only. Stimulus strength is carried by spike rate, not height, and spikes travel by regenerating section by section, faster in thicker fibres.',
    formula: 'Weighted average: V → (g_Na·E_Na + g_K·E_K + g_L·E_L) / (g_Na + g_K + g_L)\nThreshold (1 ms pulse) ≈ 6.92 µA/cm²\nUnmyelinated fibre: speed ∝ √d',
    boundary: 'Scope: the numbers come from the Hodgkin–Huxley squid giant axon model (6.3 °C); mammalian neurons have different resting voltages, thresholds and time scales. Myelinated fibres conduct by “jumping” between nodes of Ranvier and are much faster than unmyelinated fibres of the same width; they do not follow the √d rule here. Synapses, dendritic integration and random channel switching are not simulated.',
    linksTitle: 'Where to go next',
    lk1: '→ Neuroscience basics, step 1: local change versus all-or-none',
    lk2: '→ Neuroscience basics, step 2: how refractoriness caps the speed',
    lk3: '→ Membrane transport (Claude edition), step 4: how the sodium–potassium pump keeps the ion differences',
    lk4: '→ Ohm’s law, step 1: more resistance, less current (why thick fibres conduct faster)',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《神经动作电位 · 一次脉冲如何跑过神经元》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Action Potentials · How One Pulse Travels”.'
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
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
