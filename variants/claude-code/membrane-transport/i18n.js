'use strict';
// Membrane transport lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '膜运输 · 一层薄膜怎样决定谁进谁出',
    back: '← 知识索引',
    compare: '对照另一版本：膜运输 · 梯度如何变成通量 →',
    navLabel: '膜运输步骤导航',
    tagline: '细胞膜只有几纳米厚，却管着什么能进、什么能出、进出多快。这一页从一群随机乱跑的分子开始，看浓度差怎样变成净流动，再依次加上载体蛋白、细胞大小、水的渗透和要花 ATP 的泵。每一张图都是模型模拟，数值是示意值，会在每步写明。',
    nav0: '0 乱跑与净流', nav1: '1 载体饱和', nav2: '2 细胞大小', nav3: '3 渗透', nav4: '4 主动运输', nav5: '5 收束',

    s0k: '第 0 步 · 乱跑与净流',
    s0t: '每个分子都在乱跑，为什么整体会从浓的一边流向稀的一边？',
    s0e: '这一步要回答：没有谁「推」分子，为什么分子会从多的一侧净流到少的一侧？液体里的分子一刻不停地随机运动，方向完全随意（<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step1">→ 分子动理论页第 1 步：温度就是分子平均动能的读数</a>）。画布里一道竖线是<strong>膜</strong>，只在几个缺口（相当于膜上的孔）处能通过。两侧体积相同，所以分子个数就代表<strong>浓度</strong>（单位体积里的分子数）。每个分子撞上孔、穿过去的机会都一样，于是每侧每段时间穿到对面的次数，大致与这一侧靠近膜那一带的分子数成正比：多的一侧穿过去的多，少的一侧穿回来的少，差值就是<strong>净流动</strong>。这种不消耗能量、顺着浓度差的移动叫<strong>扩散</strong>。',
    outSlider: '膜外分子数（左半边）', inSlider: '膜内分子数（右半边）',
    run0: '运行 / 暂停', reset0: '重新放置分子',
    s0lgOut: '橙：起始在膜外的分子 · 膜外分子数', s0lgIn: '青：起始在膜内的分子 · 膜内分子数', s0lgEq: '两侧相等时的数目', s0lgInward: '累计 外→内 穿膜', s0lgOutward: '累计 内→外 穿膜',
    c0a: '膜外 ｜ 膜内（竖线是膜，缺口是孔）', c0b: '分子数随模拟步数变化', c0c: '累计穿膜次数',
    s0readout: '已模拟 {k} 步：外→内穿过 {a} 次，内→外穿过 {b} 次，净流入 {net} 个。现在膜外 {no} 个、膜内 {ni} 个。{recent}',
    s0recent: '最近 1000 步：外→内 {ra} 次、内→外 {rb} 次，净流入 {rn} 个——分子多的一侧穿过去的更多。',
    s0recentEq: '最近 1000 步：外→内 {ra} 次、内→外 {rb} 次。两侧数目已经接近，两个方向的穿膜次数也接近，净流动在 0 附近随机起伏。',
    s0start: '按「运行」开始。',
    s0hint: '观察顺序：保持默认（外 160、内 40），按「运行」：「分子数随模拟步数变化」图里两条线向中间的虚线靠拢；「累计穿膜次数」图里两条线都在涨，绿色（外→内）涨得更快，两线之间的距离就是净流入。两侧接近相等后，两条累计线变得平行——分子没停，只是来回抵消。再试把两侧设成一样，或把膜内设得更多，看净流动换方向。',

    s1k: '第 1 步 · 载体会饱和',
    s1t: '浓度差加倍，运进来的量也一定加倍吗？',
    s1e: '这一步要回答：靠蛋白质帮忙过膜时，通量还和浓度差成正比吗？葡萄糖这样又大、又带极性的分子几乎穿不过膜的脂质部分（脂双层），要靠膜上的<strong>载体蛋白</strong>：它在外侧结合一个分子，改变形状，把分子放到内侧，再变回来。这仍是顺浓度差、不耗能的，叫<strong>协助扩散</strong>。差别在于载体数量有限、每个载体每秒只能搬有限次：外面越浓，忙着的载体越多，全部都忙时再加浓度也快不了，这叫<strong>饱和</strong>（<a class="xlink" href="../../../biology/cells/enzymes/#step1">→ 酶页第 1 步：酶全忙时加底物也不再变快</a>）。模型假设内侧浓度保持为 0（进来的葡萄糖马上被用掉），Km = 5 mM 表示外侧浓度为 5 mM 时恰好一半载体在忙（示意值；mM 是毫摩尔每升）。作为对照，再画一条只靠脂双层的直线：通量 = 0.1 × 浓度差。',
    coSlider: '膜外浓度 Co（mM）', carSlider: '载体数量（相对默认）',
    s1lgCar: '载体：Jmax·Co/(Km + Co)', s1lgSim: '只穿脂双层：0.1·Co', s1lgMax: '所有载体都忙时的上限 Jmax', s1lgBusy: '正在搬运的载体',
    c1a: '通量（相对单位）· 横轴：膜外浓度 Co（mM）', c1b: '膜上的载体（亮 = 正在搬运）',
    s1readout: 'Co = {c} mM：载体通量 {jc}（{occ}% 的载体在忙，上限 {jm}）；只穿脂双层的通量 {js}。把浓度从 {c} 加倍到 {c2} mM：载体通量 ×{rc}，脂双层通量 ×2。',
    s1zero: 'Co = 0：外面没有葡萄糖，没有浓度差，两种通量都是 0。',
    s1hint: '观察顺序：先把 Co 停在 1 mM，记下读数里载体通量的倍数（约 1.71，接近 2）；再拖到 40 mM，倍数只剩约 1.06——载体几乎全忙，加倍浓度只多运进一点。然后把载体数量拖到 2：整条青色曲线和上限一起翻倍，而灰色直线不动。低浓度时载体通量远高于脂双层，这正是细胞要用载体的原因。',

    s2k: '第 2 步 · 细胞的大小',
    s2t: '同样的膜，细胞越大，内部浓度追上外部就越慢吗？慢多少？',
    s2e: '这一步要回答：一种能穿膜的分子在膜外保持浓度 Co，膜内从 0 开始，内部浓度 Ci 多久能赶上？每秒进来的分子数正比于<strong>膜面积 A</strong>（孔越多进得越多）和浓度差，而要「灌满」的是<strong>体积 V</strong>。对球形细胞 A/V = 3/R：半径 R 加倍，面积 ×4、体积 ×8，每单位体积分到的膜面积减半。于是 Ci = Co(1 − e^(−t/τ))，时间常数 τ = R/(3P)；P 是通透性（每秒穿过的「深度」，这里取示意值 1 µm/s）。我们用<strong>半程时间 t½</strong>（Ci 到达 Co 一半所需的时间，= 0.69τ）比较快慢。模型假设细胞内部瞬间混匀。',
    rSlider: '细胞半径 R（µm）', play2: '播放 60 秒',
    s2lgCurve: '当前半径的 Ci/Co', s2lgGhost: '之前试过的半径', s2lgHalf: '半程 t½',
    c2a: '细胞（按比例画，颜色深浅 = 内部浓度）', c2b: 'Ci / Co · 横轴：时间 t（秒）',
    s2readout: 'R = {R} µm：A/V = 3/R = {av} µm⁻¹，τ = R/(3P) = {tau} 秒；内部浓度到一半要 t½ = {th} 秒，到 90% 要 {t9} 秒。{now}',
    s2now: '「细胞」图显示的是 t = {t} 秒时的状态：Ci/Co = {f}。',
    s2hint: '观察顺序：把 R 依次拖到 5、10、20 µm：每次 t½ 都正好加倍（读数和「Ci / Co」图里的竖虚线都能看出），灰色曲线保留之前的半径作对照。按「播放」，看「细胞」图里颜色从浅到深的速度。这说明靠扩散供给的细胞不能太大——体积长得比膜面积快。',

    s3k: '第 3 步 · 渗透',
    s3t: '溶质过不了膜时，水往哪边走？细胞会胀破吗？',
    s3e: '这一步要回答：膜外换成更稀或更浓的溶液，细胞会怎样？有些溶质（比如盐里的离子）几乎穿不过膜，水分子却能穿过（很多细胞还有专门的<strong>水通道蛋白</strong>）。水也在扩散：溶质颗粒越浓的一侧，水的相对浓度越低，所以水净流向溶质颗粒更浓的一侧，这叫<strong>渗透</strong>。比较时用<strong>渗透浓度</strong>（mOsm/L：每升溶液里所有溶质颗粒的总数，不论种类），细胞内约 300 mOsm/L。外液比细胞内稀叫<strong>低渗</strong>、相等叫<strong>等渗</strong>、更浓叫<strong>高渗</strong>。水流进来，细胞胀大、内部被稀释，直到内外相等才停。模型假设细胞体积有 40% 不随水进出变化（蛋白质等，示意值），于是平衡体积 V/V₀ = 0.4 + 0.6 × 300 ÷ 外液浓度；并设定体积超过 1.6 倍膜就破裂（示意阈值，对应外液约 150 mOsm/L。作为参照：正常红细胞一般在约 0.45% 的盐水里开始破裂，这大约就是 150 mOsm/L）。时间尺度也是示意的。',
    cOutSlider: '膜外渗透浓度（mOsm/L）', hypo: '低渗 200', iso: '等渗 300', hyper: '高渗 500',
    s3lgCell: '细胞（内 300 mOsm/L 起）', s3lgV: '体积 V/V₀', s3lgGhost: '之前试过的浓度', s3lgBurst: '破裂阈值 1.6 倍',
    c3a: '细胞放进膜外溶液（箭头 = 水的净流向）', c3b: '体积 V/V₀ · 横轴：时间 t（秒，示意）',
    s3readout: '膜外 {c} mOsm/L（{ton}）：开始时细胞内 300、膜外 {c}，水{dir}。平衡时体积是原来的 {v} 倍，细胞内也变成 {c} mOsm/L。{now}',
    s3burst: '膜外 {c} mOsm/L（低渗）：水持续流入，平衡体积本应是 {v} 倍，但在 t = {tb} 秒体积超过 1.6 倍，细胞破裂。',
    s3edge: '膜外 {c} mOsm/L（低渗）：平衡体积恰好是 1.6 倍，细胞停在破裂边缘。',
    tonHypo: '低渗', tonIso: '等渗', tonHyper: '高渗',
    dirIn: '净流入细胞', dirOut: '净流出细胞', dirNone: '进出相抵，体积不变',
    s3now: '当前 t = {t} 秒，V/V₀ = {vn}。',
    s3hint: '观察顺序：依次按「高渗 500」「等渗 300」「低渗 200」：「细胞」图里箭头方向翻转，「体积」图里曲线分别降到 0.76、停在 1、升到 1.3。然后把滑杆慢慢往左拖到 140：越过 150 后曲线碰到红色虚线，细胞破裂。灰线保留之前的浓度。',

    s4k: '第 4 步 · 主动运输',
    s4t: '要把钠离子一直往浓的那一边送，细胞得付出什么？',
    s4e: '这一步要回答：细胞内外的 Na⁺ 浓度差为什么能一直维持？典型哺乳动物细胞外 Na⁺ 约 145 mM，细胞内只有约 10–15 mM。Na⁺ 不停地顺着这个差从通道<strong>漏进</strong>来（漏入速度正比于浓度差）。要把它送回去就是<strong>逆浓度差</strong>运输，必须耗能：膜上的<strong>钠钾泵</strong>每水解 1 个 ATP，把 3 个 Na⁺ 泵出、2 个 K⁺ 泵入，这叫<strong>主动运输</strong>。泵出速度随细胞内 Na⁺ 增多而加快，但和载体一样会饱和。细胞内 Na⁺ 停在漏入 = 泵出的那一点，叫<strong>稳态</strong>：不是没有流动，而是进出相等。模型参数（泵的 Km = 10 mM、时间单位、通量单位）是示意值，只把默认稳态调到约 12 mM。',
    atpSlider: 'ATP 供应 → 泵的活性（%）', leakSlider: 'Na⁺ 漏入通透性（相对默认）',
    cutAtp: '切断 ATP', restoreAtp: '恢复 ATP',
    s4lgLeak: '漏入（顺浓度差）', s4lgPump: '泵出（耗 ATP）', s4lgSS: '稳态：漏入 = 泵出', s4lgTrace: '细胞内 Na⁺ 随时间',
    c4a: 'Na⁺ 通量（mM/分钟）· 横轴：细胞内 Na⁺（mM）', c4b: '细胞内 Na⁺（mM）· 横轴：时间（分钟，示意）',
    s4readout: 'ATP 供应 {s}%、漏入 ×{l}：稳态细胞内 Na⁺ = {ci} mM，外/内浓度比 {ratio} 倍。此时每分钟漏入 = 泵出 = {flux} mM，耗 ATP {atp} mM/分钟（每个 ATP 泵出 3 个 Na⁺）。曲线从 {c0} mM 出发，300 分钟后到 {c1} mM。',
    s4cut: 'ATP 被切断，泵停转：Na⁺ 只进不出。细胞内 Na⁺ 从 {c0} mM 向膜外的 145 mM 靠拢：60 分钟后 {c60} mM，300 分钟后 {c1} mM，浓度差逐渐消失。',
    s4hint: '观察顺序：先按「切断 ATP」：「细胞内 Na⁺」图里曲线一路升向 145；「Na⁺ 通量」图里橙色泵出曲线压到 0，只剩漏入。再按「恢复 ATP」，曲线回落到原来的稳态。然后把 ATP 供应拖到 50%：橙色曲线变矮，交点右移到约 45 mM——泵弱了，浓度差就小了。把漏入拖到 2 倍也会把交点推到同样位置。',

    s5k: '第 5 步 · 收束',
    s5t: '四种过膜方式，怎样一句话分清？',
    s5fin: '一条线索贯穿全页：<strong>顺着浓度差走不花能量，逆着走要花 ATP</strong>。随机运动让每侧穿过去的次数正比于这一侧的浓度，差值就是净流动（扩散）；载体让大分子也能顺差通过，但数量有限，会饱和（协助扩散）；细胞越大，单位体积的膜越少，平衡越慢；溶质过不去时水自己走，向溶质浓的一侧，决定细胞胀缩（渗透）；把离子逆差送走要靠泵持续耗 ATP，稳态是漏入与泵出相等（主动运输）。',
    formula: '扩散：净通量 ∝ P·A·(C外 − C内)\n载体：J = Jmax·C/(Km + C)\n球形细胞：τ = R/(3P)，t½ = 0.69τ\n渗透平衡：V/V₀ = 0.4 + 0.6 × 300 / C外\n稳态：漏入 = 泵出（1 ATP → 3 Na⁺ 出、2 K⁺ 进）',
    boundary: '适用范围：本页每个模型只保留一个机制，参数是示意值。真实细胞里多种机制同时进行；离子还受膜电位推动（不只看浓度差）；植物细胞外有细胞壁，在低渗溶液里会胀紧（膨压）而不会破裂；细胞内部也不是瞬间混匀的。',
    quizPrompt: '自测：第 0 步里两侧的分子数已经相等，下面哪种说法正确？',
    quizA: '分子不再穿过膜了',
    quizB: '分子仍在双向穿过，两个方向的次数大致相等',
    quizC: '分子只从膜内往膜外穿',
    checkQuiz: '核对答案', quizNone: '先选一个选项。',
    correct: '对。平衡是动态的：每侧的分子仍按自己的数目随机穿过，两侧数目相等时两个方向的次数也相等，净流动为 0。回到第 0 步运行足够久，可以看到两条累计穿膜线变得平行，但都还在上升。',
    wrong: '再想想。分子的随机运动不会因为两侧相等而停下。回到第 0 步运行足够久：两侧数目相等后，「累计穿膜次数」图里两条线都还在上升，只是变得平行——两个方向的次数相抵，净流动为 0。',
    linksTitle: '接着去看',
    lk1: '→ 溶解与饱和页第 2 步：饱和以后溶解真的停了吗（动态平衡）',
    lk2: '→ 神经科学基础页第 0 步：离子浓度差怎样变成静息电位',
    lk3: '→ 细胞结构页第 1 步：细胞膜作为边界',
    lk4: '→ 酶页第 1 步：同样的饱和曲线出现在酶反应里',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《膜运输 · 梯度如何变成通量》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Membrane Transport · From Gradient to Flux”.'
  },
  en: {
    pageTitle: 'Membrane Transport · How a Thin Layer Decides What Gets Through',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Membrane Transport · From Gradient to Flux →',
    navLabel: 'Membrane transport steps',
    tagline: 'A cell membrane is only a few nanometres thick, yet it decides what gets in, what gets out and how fast. This page starts with a crowd of randomly jostling molecules, watches a concentration difference turn into net flow, then adds carrier proteins, cell size, water moving by osmosis and a pump that spends ATP. Every chart is a model simulation with illustrative numbers, stated at each step.',
    nav0: '0 Jostling & flow', nav1: '1 Carriers', nav2: '2 Cell size', nav3: '3 Osmosis', nav4: '4 Pumps', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Jostling and net flow',
    s0t: 'Every molecule wanders at random, so why does the crowd flow from the crowded side to the sparse one?',
    s0e: 'The question: nothing pushes the molecules, so why do they flow from the side with more to the side with fewer? Molecules in a liquid never stop moving, in completely random directions (<a class="xlink" href="../../../physics/thermal/kinetic-theory/#step1">→ Kinetic theory, step 1: temperature as a reading of average kinetic energy</a>). In the canvas the vertical line is the <strong>membrane</strong>, passable only at a few gaps (its pores). Both halves have the same volume, so the number of molecules stands for the <strong>concentration</strong> (molecules per unit volume). Every molecule has the same chance of hitting a pore and slipping through, so the number of crossings from a side in a given time is roughly proportional to how many molecules that side holds near the membrane. The crowded side sends more across than the sparse side sends back, and the difference is the <strong>net flow</strong>. Movement down a concentration difference that costs no energy is called <strong>diffusion</strong>.',
    outSlider: 'Molecules outside (left half)', inSlider: 'Molecules inside (right half)',
    run0: 'Run / pause', reset0: 'Re-scatter molecules',
    s0lgOut: 'Orange: started outside · count outside', s0lgIn: 'Cyan: started inside · count inside', s0lgEq: 'Count when both sides are equal', s0lgInward: 'Total inward crossings', s0lgOutward: 'Total outward crossings',
    c0a: 'Outside | inside (the line is the membrane, gaps are pores)', c0b: 'Molecules on each side vs simulation step', c0c: 'Total crossings so far',
    s0readout: '{k} steps simulated: {a} crossings inward, {b} outward, net {net} in. Now {no} outside and {ni} inside. {recent}',
    s0recent: 'Last 1000 steps: {ra} in, {rb} out, net {rn} in. The crowded side sends more across.',
    s0recentEq: 'Last 1000 steps: {ra} in, {rb} out. The two sides are now nearly equal, so are the crossings in each direction, and the net flow jitters around 0.',
    s0start: 'Press Run to start.',
    s0hint: 'What to watch: keep the defaults (160 outside, 40 inside) and press Run. In the molecule-count chart the two lines close in on the dashed middle line. In the crossings chart both lines climb, green (inward) faster, and the gap between them is the net inflow. Once the sides are nearly equal the two crossing lines run parallel: molecules have not stopped, their crossings just cancel. Then set both sides equal, or put more inside, and watch the net flow change direction.',

    s1k: 'Step 1 · Carriers saturate',
    s1t: 'Double the concentration difference: does the amount brought in double too?',
    s1e: 'The question: when a protein helps a molecule across, is the flux still proportional to the concentration difference? A large, polar molecule like glucose barely gets through the fatty part of the membrane (the lipid bilayer). It relies on a <strong>carrier protein</strong> that binds one molecule on the outside, changes shape, releases it on the inside and resets. This is still downhill and costs no energy; it is called <strong>facilitated diffusion</strong>. The difference is that carriers are limited in number and each can only make so many trips per second. The higher the outside concentration, the more carriers are busy; once all are busy, more concentration cannot speed things up. That is <strong>saturation</strong> (<a class="xlink" href="../../../biology/cells/enzymes/#step1">→ Enzymes, step 1: when every enzyme is busy, more substrate stops helping</a>). The model keeps the inside concentration at 0 (incoming glucose is used immediately), and Km = 5 mM means half the carriers are busy at an outside concentration of 5 mM (illustrative; mM is millimoles per litre). For comparison there is a straight line for the lipid bilayer alone: flux = 0.1 × concentration difference.',
    coSlider: 'Outside concentration Co (mM)', carSlider: 'Number of carriers (relative to default)',
    s1lgCar: 'Carrier: Jmax·Co/(Km + Co)', s1lgSim: 'Lipid bilayer only: 0.1·Co', s1lgMax: 'Ceiling Jmax with every carrier busy', s1lgBusy: 'Carriers mid-trip',
    c1a: 'Flux (relative units) · across: outside concentration Co (mM)', c1b: 'Carriers in the membrane (lit = mid-trip)',
    s1readout: 'Co = {c} mM: carrier flux {jc} ({occ}% of carriers busy, ceiling {jm}); lipid-only flux {js}. Doubling the concentration from {c} to {c2} mM multiplies the carrier flux by {rc} and the lipid flux by 2.',
    s1zero: 'Co = 0: there is no glucose outside and no difference, so both fluxes are 0.',
    s1hint: 'What to watch: park Co at 1 mM and note the factor the carrier flux is multiplied by in the readout (about 1.71, close to 2). Then drag to 40 mM: the factor drops to about 1.06, because nearly every carrier is busy and doubling the concentration adds little. Now set the number of carriers to 2: the whole cyan curve and its ceiling double while the grey line stays put. At low concentrations the carrier flux is far above the lipid-only flux, which is exactly why cells use carriers.',

    s2k: 'Step 2 · Cell size',
    s2t: 'With the same membrane, does a bigger cell take longer to catch up with the outside? How much longer?',
    s2e: 'The question: a molecule that can cross the membrane is held at concentration Co outside, and the inside starts at 0. How long until the inside concentration Ci catches up? The number of molecules arriving per second is proportional to the <strong>membrane area A</strong> (more pores, more traffic) and to the concentration difference, but what has to be filled is the <strong>volume V</strong>. For a spherical cell A/V = 3/R: double the radius R and the area grows ×4, the volume ×8, so each unit of volume gets half as much membrane. The result is Ci = Co(1 − e^(−t/τ)) with time constant τ = R/(3P), where P is the permeability (how deep a layer crosses per second; illustrative value 1 µm/s). We compare speeds with the <strong>half-time t½</strong>, the time for Ci to reach half of Co (= 0.69τ). The model assumes the inside mixes instantly.',
    rSlider: 'Cell radius R (µm)', play2: 'Play 60 seconds',
    s2lgCurve: 'Ci/Co for the current radius', s2lgGhost: 'Radii you tried earlier', s2lgHalf: 'Half-time t½',
    c2a: 'The cell (to scale; shade = inside concentration)', c2b: 'Ci / Co · across: time t (s)',
    s2readout: 'R = {R} µm: A/V = 3/R = {av} µm⁻¹, τ = R/(3P) = {tau} s; the inside reaches half way after t½ = {th} s and 90% after {t9} s. {now}',
    s2now: 'The cell view shows t = {t} s: Ci/Co = {f}.',
    s2hint: 'What to watch: drag R to 5, then 10, then 20 µm. Each time t½ exactly doubles (see the readout and the dashed vertical in the Ci / Co chart); grey curves keep earlier radii for comparison. Press Play and watch how quickly the cell’s shade deepens. This is why a cell that relies on diffusion cannot be large: its volume grows faster than its membrane.',

    s3k: 'Step 3 · Osmosis',
    s3t: 'If the solute cannot cross, which way does the water go? Can the cell burst?',
    s3e: 'The question: what happens when the cell is put into a more dilute or a more concentrated solution? Some solutes (the ions from salt, for instance) hardly cross the membrane, but water does (many cells even have dedicated <strong>water channel proteins</strong>). Water diffuses too: the side with more dissolved particles has relatively less water, so water flows toward the side with the higher concentration of solute particles. That is <strong>osmosis</strong>. To compare sides we use <strong>osmolarity</strong> (mOsm/L: the total count of dissolved particles per litre, whatever they are); the cell interior is about 300 mOsm/L. An outside solution weaker than the cell is <strong>hypotonic</strong>, equal is <strong>isotonic</strong>, stronger is <strong>hypertonic</strong>. Water entering swells the cell and dilutes its interior until inside and outside match. The model assumes 40% of the cell volume does not change with water (proteins and so on, illustrative), giving an equilibrium volume V/V₀ = 0.4 + 0.6 × 300 ÷ outside osmolarity, and lets the membrane burst above 1.6× (an illustrative threshold, reached at about 150 mOsm/L outside; for reference, normal red blood cells generally start to burst in roughly 0.45% saline, which is about 150 mOsm/L). The time scale is illustrative too.',
    cOutSlider: 'Outside osmolarity (mOsm/L)', hypo: 'Hypotonic 200', iso: 'Isotonic 300', hyper: 'Hypertonic 500',
    s3lgCell: 'Cell (starts at 300 mOsm/L inside)', s3lgV: 'Volume V/V₀', s3lgGhost: 'Concentrations you tried', s3lgBurst: 'Burst threshold 1.6×',
    c3a: 'The cell in the outside solution (arrows = net water flow)', c3b: 'Volume V/V₀ · across: time t (s, illustrative)',
    s3readout: 'Outside {c} mOsm/L ({ton}): at the start the inside is 300 and the outside {c}, so water {dir}. At equilibrium the volume is {v} times the original, and the inside is also at {c} mOsm/L. {now}',
    s3burst: 'Outside {c} mOsm/L (hypotonic): water keeps flowing in. The equilibrium volume would be {v}×, but at t = {tb} s the volume passes 1.6× and the cell bursts.',
    s3edge: 'Outside {c} mOsm/L (hypotonic): the equilibrium volume is exactly 1.6×, so the cell sits right at the edge of bursting.',
    tonHypo: 'hypotonic', tonIso: 'isotonic', tonHyper: 'hypertonic',
    dirIn: 'flows into the cell', dirOut: 'flows out of the cell', dirNone: 'moves both ways equally and the volume holds',
    s3now: 'Now t = {t} s, V/V₀ = {vn}.',
    s3hint: 'What to watch: press Hypertonic 500, Isotonic 300 and Hypotonic 200 in turn. In the cell view the arrows flip direction; in the volume chart the curve falls to 0.76, stays at 1 and rises to 1.3. Then drag the slider slowly left to 140: past 150 the curve hits the red dashed line and the cell bursts. Grey lines keep earlier concentrations.',

    s4k: 'Step 4 · Active transport',
    s4t: 'To keep sending sodium toward the side that already has more, what must the cell pay?',
    s4e: 'The question: how does the cell keep its Na⁺ difference? Outside a typical mammalian cell Na⁺ is about 145 mM; inside it is only about 10–15 mM. Na⁺ constantly <strong>leaks in</strong> through channels, down that difference (the leak is proportional to the difference). Sending it back out is <strong>uphill</strong>, against the difference, and costs energy: the <strong>sodium–potassium pump</strong> in the membrane splits one ATP to push 3 Na⁺ out and bring 2 K⁺ in. This is <strong>active transport</strong>. The pump works faster as inside Na⁺ rises, but like a carrier it saturates. Inside Na⁺ settles where leak in = pump out, a <strong>steady state</strong>: not the absence of flow, but inflow and outflow in balance. The model’s parameters (pump Km = 10 mM, the time and flux units) are illustrative, chosen only so the default steady state is about 12 mM.',
    atpSlider: 'ATP supply → pump activity (%)', leakSlider: 'Na⁺ leak permeability (relative to default)',
    cutAtp: 'Cut off ATP', restoreAtp: 'Restore ATP',
    s4lgLeak: 'Leak in (downhill)', s4lgPump: 'Pump out (uses ATP)', s4lgSS: 'Steady state: leak = pump', s4lgTrace: 'Inside Na⁺ over time',
    c4a: 'Na⁺ flux (mM/min) · across: inside Na⁺ (mM)', c4b: 'Inside Na⁺ (mM) · across: time (min, illustrative)',
    s4readout: 'ATP supply {s}%, leak ×{l}: steady-state inside Na⁺ = {ci} mM, an outside/inside ratio of {ratio}. Leak in = pump out = {flux} mM per minute, using {atp} mM of ATP per minute (3 Na⁺ out per ATP). The trace starts at {c0} mM and reaches {c1} mM after 300 minutes.',
    s4cut: 'ATP is cut off and the pump stops: Na⁺ now only comes in. Inside Na⁺ climbs from {c0} mM toward the 145 mM outside: {c60} mM after 60 minutes, {c1} mM after 300, and the difference fades away.',
    s4hint: 'What to watch: press Cut off ATP first. In the inside-Na⁺ chart the trace climbs toward 145; in the flux chart the orange pump curve flattens to 0 and only the leak remains. Press Restore ATP and the trace falls back to the old steady state. Then drag ATP supply to 50%: the orange curve shrinks and the crossing moves right to about 45 mM. A weaker pump means a smaller difference. Doubling the leak pushes the crossing to the same place.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Four ways across a membrane: how do you tell them apart in one sentence?',
    s5fin: 'One thread runs through the page: <strong>going down a concentration difference is free; going up it costs ATP</strong>. Random motion makes each side send molecules across in proportion to its concentration, and the difference is the net flow (diffusion). Carriers let large molecules through downhill too, but they are limited and saturate (facilitated diffusion). The bigger the cell, the less membrane per unit volume and the slower it equilibrates. When a solute cannot cross, water moves instead, toward the side with more solute, and that sets whether the cell swells or shrinks (osmosis). Sending ions uphill needs a pump that keeps spending ATP; the steady state is leak in = pump out (active transport).',
    formula: 'Diffusion: net flux ∝ P·A·(C_out − C_in)\nCarrier: J = Jmax·C/(Km + C)\nSpherical cell: τ = R/(3P), t½ = 0.69τ\nOsmotic equilibrium: V/V₀ = 0.4 + 0.6 × 300 / C_out\nSteady state: leak in = pump out (1 ATP → 3 Na⁺ out, 2 K⁺ in)',
    boundary: 'Scope: each model on this page keeps a single mechanism, with illustrative parameters. Real cells run many mechanisms at once; ions are also pushed by the membrane voltage, not only the concentration difference; plant cells have a cell wall, so in a hypotonic solution they swell taut (turgor) instead of bursting; and the inside of a cell does not mix instantly.',
    quizPrompt: 'Check: in step 0 the two sides now hold equal numbers. Which statement is right?',
    quizA: 'Molecules no longer cross the membrane',
    quizB: 'Molecules still cross both ways, about equally often',
    quizC: 'Molecules only cross from inside to outside',
    checkQuiz: 'Check answer', quizNone: 'Pick an option first.',
    correct: 'Right. The balance is dynamic: each side still sends molecules across in proportion to its count, so with equal counts the crossings in each direction are equal and the net flow is 0. Run step 0 long enough and the two crossing lines run parallel while both keep rising.',
    wrong: 'Not quite. Random motion does not stop just because the sides are equal. Run step 0 long enough: after the counts level out, both lines in the crossings chart keep rising, only parallel. The two directions cancel and the net flow is 0.',
    linksTitle: 'Where to go next',
    lk1: '→ Dissolving & saturation, step 2: has dissolving really stopped once saturated? (dynamic equilibrium)',
    lk2: '→ Neuroscience basics, step 0: how ion differences become the resting voltage',
    lk3: '→ Cell structure, step 1: the membrane as the cell’s border',
    lk4: '→ Enzymes, step 1: the same saturation curve in enzyme reactions',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《膜运输 · 梯度如何变成通量》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Membrane Transport · From Gradient to Flux”.'
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
