'use strict';
// Quantum basics lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '量子基础 · 先算振幅，再谈概率',
    back: '← 知识索引',
    compare: '对照另一版本：量子基础 · 可能性先于结果 →',
    navLabel: '量子基础步骤导航',
    tagline: '一个量子比特在测量之前带着两个「振幅」，测量时才按振幅的平方给出 0 或 1。振幅和概率差在哪里？七步里你会亲手测量、看频率一点点逼近概率，再看振幅之间的相位怎样让两条路互相抵消——在这类干涉实验里，「它其实早就是 0 或 1」的说法解释不了看到的结果。',
    nav0: '0 振幅', nav1: '1 测量', nav2: '2 相位', nav3: '3 干涉', nav4: '4 布洛赫球', nav5: '5 测量会扰动', nav6: '6 收束',

    s0k: '第 0 步 · 振幅',
    s0t: '一个量子比特处在 0 与 1 的叠加中，测量时各有多大可能？',
    s0e: '这一步要回答：一个<strong>量子比特</strong>（qubit，最简单的量子系统，测量时只会给出 0 或 1）处在叠加态时，测到 0 和 1 的概率各是多少？它的状态写作 |ψ⟩ = α|0⟩ + β|1⟩：|0⟩、|1⟩ 是两种测量结果对应的<strong>基态</strong>，α、β 叫<strong>振幅</strong>。本步先只用实数振幅，取 α = cos ψ、β = sin ψ，于是 α² + β² = 1，状态就是单位圆上的一个箭头。<strong>玻恩规则</strong>：测到 0 的概率是 |α|²，测到 1 的概率是 |β|²。振幅可以是负数；概率是它的平方，永远不为负。左图横轴是 α、纵轴是 β，白箭头是状态，青、橙线段是它在两轴上的投影；右图左半是两个振幅（虚线框，可以为负），右半是对应的两个概率。',
    psiSlider: '状态角 ψ',
    s0lgState: '状态箭头 (α, β)', s0lgA: 'α：|0⟩ 的振幅；|α|²：测到 0 的概率', s0lgB: 'β：|1⟩ 的振幅；|β|²：测到 1 的概率', s0lgAmp: '虚线框 = 振幅（可为负）',
    c0a: '振幅平面：横 = α，纵 = β', c0b: '振幅（左）与概率（右）',
    c0aAria: '单位圆上的状态箭头', c0bAria: '振幅与概率的柱状图',
    s0readout: 'ψ = {psi}°：α = cos ψ = {a}，β = sin ψ = {b}。P(0) = |α|² = {p0}，P(1) = |β|² = {p1}，加起来 = {sum}。',
    s0neg: '有振幅是负数，但概率只看平方：符号在这里不影响结果，到第 2、3 步会看到它在别处很要紧。',
    s0hint: '观察顺序：把 ψ 从 0° 拖到 90°：箭头从横轴转到纵轴，|α|² 从 1 降到 0，|β|² 从 0 升到 1，两根概率柱之和始终是 1。再拖到 90°–180°：α 变成负数（虚线框翻到零线下），概率柱却与 0°–90° 镜像对应。ψ = 45° 和 135° 的概率完全相同，但两个态的 α 符号相反。',
    q0Prompt: '想一想：某个态的振幅是 α = 0.6、β = −0.8，测到 1 的概率是？',
    q0A: '−0.8', q0B: '0.64', q0C: '0.8',
    q0Right: '对。概率是振幅的模方：(−0.8)² = 0.64；再加上 0.6² = 0.36，正好是 1。',
    q0Wrong: '概率不会是负数，也不是振幅本身。按玻恩规则：P(1) = |β|² = (−0.8)² = 0.64。',
    check: '检查答案', pick: '先选一个选项。',

    s1k: '第 1 步 · 测量',
    s1t: '概率是 0.75，测一次会看到什么？',
    s1e: '这一步要回答：概率只说「有多大可能」，单次测量到底给出什么？每次测量前都重新<strong>制备</strong>（做出同一个态），每次只给出一个确定的结果 0 或 1，单次无法预测。把同样的实验重复 N 次，0 出现的<strong>频率</strong>（次数 ÷ N）会越来越接近 P(0)，偏差大致按 1/√N 缩小。灰带是「预期 ± 2 个标准差」，标准差 = √(P(1 − P)/N)，大约 95% 的时候频率落在带内。测量还会改变状态：测得 0 之后状态就变成 |0⟩，叫<strong>坍缩</strong>；不重新制备、立刻再测，只会一直得到 0。本步使用第 0 步设定的态；结果来自页面里的伪随机数模拟，不是实验数据（<a class="xlink" href="../../../physics/modern/double-slit/#step2">→ 双缝实验第 2 步：一颗一颗打出干涉条纹</a>）。',
    m1: '测 1 次', m10: '测 10 次', m100: '测 100 次', again1: '测一次后不重新制备、连测 10 次', reset1: '清零',
    s1lg0: '结果 0', s1lg1: '结果 1', s1lgFreq: '0 的累计频率', s1lgBand: '预期 ± 2 个标准差',
    c1strip: '最近的测量结果（右边最新）· 共 {n} 次', c1freq: '0 的频率 ↑ 对 测量次数 N →',
    s1readout: '当前态（第 0 步）：P(0) = {p}。已测 {n} 次：0 出现 {c0} 次，1 出现 {c1} 次，频率 {f}；在这个 N 下，频率约有 95% 的机会落在 {lo}–{hi}。',
    s1empty: '还没有测量。当前态（第 0 步）：P(0) = {p}。按「测 1 次」开始。',
    s1again: ' 坍缩演示：重新制备后测一次得到 {k}；不重新制备、紧接着再测 10 次：{list}。',
    s1hint: '观察顺序：先按几次「测 1 次」：方块颜色没有规律，白线上下乱跳。再按几次「测 100 次」：白线越来越平，贴近青色虚线（预期 P(0)），灰带也越收越窄。按「测一次后不重新制备、连测 10 次」：后面 10 次全是同一个结果。回第 0 步改 ψ 会清零重来。',

    s2k: '第 2 步 · 相位',
    s2t: '两个态测出的概率一样，它们就是同一个态吗？',
    s2e: '这一步要回答：如果 |α|² 和 |β|² 都相同，两个态还能有什么区别？振幅一般是<strong>复数</strong>：既有大小，也有方向（复平面上的角度）。把 β 写成 sin(θ/2)·e^(iφ)：θ 决定两个振幅的大小，φ 是 β 相对 α 转过的角度，叫<strong>相对相位</strong>。乘 e^(iφ) 就是在复平面上转 φ 角、长度不变（<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">→ 复数第 4 步：乘法是模相乘、角相加</a>），所以直接测 0/1（叫 <strong>Z 基测量</strong>）的概率与 φ 无关。但如果先经过一个 <strong>H 门</strong>再测——H 门把两个振幅混合，新的 0 振幅 = (α + β)/√2，作用像一块 50/50 分束镜——这叫 <strong>X 基测量</strong>，测到「+」的概率 = |α + β|²/2，取决于两个箭头是同向相加还是反向抵消。左图是复平面（横 = 实部，纵 = 虚部）上的两个振幅；右图横轴是 φ，绿线是 Z 基的 P(0)，粉线是 X 基的 P(+)。',
    thSlider: '振幅大小角 θ', phSlider: '相对相位 φ',
    s2lgA: 'α（|0⟩ 的振幅）', s2lgB: 'β（|1⟩ 的振幅）', s2lgZ: 'Z 基：P(0)', s2lgX: 'X 基：P(+)', s2lgHist: '试过的 φ',
    c2a: '复平面上的两个振幅', c2b: '概率 ↑ 对 相对相位 φ →',
    c2aAria: '复平面上的振幅箭头', c2bAria: '两种测量的概率随相位变化',
    s2readout: 'α = {a}，β = {bm} · e^(i·{ph}°) = {bc}。直接测（Z 基）：P(0) = |α|² = {pz}，与 φ 无关。先过 H 门再测（X 基）：P(+) = |α + β|² ÷ 2 = {px}。',
    s2hint: '观察顺序：保持 θ = 90°（两个振幅一样大），把 φ 从 0° 拖到 360°：橙色箭头绕圈、长度不变；绿线一直平在 0.5，粉线却从 1 降到 0 再回到 1。φ = 0° 时两箭头同向，相加最长；φ = 180° 时反向，完全抵消，测到「+」的概率为 0。白点是试过的 φ。再减小 θ：粉线的起伏变小，因为 β 变短，抵消不完全。',

    s3k: '第 3 步 · 干涉',
    s3t: '光子走两条路再汇合，为什么有时一个也到不了 D0？',
    s3e: '这一步要回答：一次只发一个光子，它在<strong>马赫–曾德尔干涉仪</strong>里会怎样？第一块分束镜 BS1 把它分到两条路上，每条路的振幅都是 1/√2（概率各 1/2）；上路经过可调的<strong>相移</strong> φ（比如多走一小段路程）；两路在第二块分束镜 BS2 汇合，再进入探测器 D0 或 D1。到达 D0 有两条路，两条路的振幅<strong>先相加，再取模方</strong>：P(D0) = |(1 + e^(iφ))/2|² = cos²(φ/2)。φ = 0° 时两路同相，光子全部进 D0；φ = 180° 时完全抵消，D0 一个也收不到。如果在下路装上<strong>路径标记器</strong>，原则上能分辨光子走了哪条路，两条路就不再干涉，变成概率相加：P(D0) = ½·½ + ½·½ = ½，与 φ 无关（<a class="xlink" href="../../../physics/modern/double-slit/#step3">→ 双缝实验第 3 步：知道走哪条缝，条纹就消失</a>）。左图是装置，出射光束越粗、探测器越亮，表示到达概率越大；右图横轴是 φ，青线是干涉时的 P(D0)，灰色虚线是概率相加时的 ½。',
    phSlider3: '上路相移 φ', whichOff: '不标记路径（干涉）', whichOn: '标记路径（不干涉）', fire3: '发射 100 个光子', clear3: '清空计数', marker: '标记器',
    s3lgQ: '干涉：P(D0) = cos²(φ/2)', s3lgC: '标记路径：P(D0) = ½', s3lgShots: '模拟发射的频率（粉 = 标记路径时）',
    c3a: '马赫–曾德尔干涉仪（光从左下进入）', c3b: 'P(D0) ↑ 对 相移 φ →',
    c3aAria: '干涉仪示意图', c3bAria: '到达 D0 的概率随相移变化',
    s3open: 'φ = {ph}°，两路都畅通：D0 的振幅 = (1 + e^(iφ))/2，P(D0) = {p0}，P(D1) = {p1}。',
    s3which: 'φ = {ph}°，下路装了标记器：两路概率直接相加，P(D0) = {p0}，P(D1) = {p1}（若不标记，P(D0) 本应是 {pq}）。',
    s3counts: ' 本设置下已发射 {n} 个：D0 {c0} 个，D1 {c1} 个，D0 的频率 {f}。',
    s3hint: '观察顺序：先不标记路径，把 φ 从 0° 拖到 180°：通向 D0 的光束变细、D0 变暗，D1 变亮；在 0°、90°、180° 各按一次「发射 100 个光子」，白点落在青线附近。再点「标记路径」，在同样的 φ 上发射：粉点都停在 ½ 附近，干涉消失了。注意每个光子仍然只在一个探测器上被记到一次。',
    q3Prompt: '想一想：φ = 180° 时 D0 收不到光子。在下路装上路径标记器后，D0 会怎样？',
    q3A: '仍然收不到：φ 没有变', q3B: '收到全部光子', q3C: '大约收到一半：两条路不再干涉，概率直接相加',
    q3Right: '对。能分辨路径时，两条路各贡献 ½ × ½，加起来 ½，与 φ 无关。',
    q3Wrong: '标记路径之后，两条路的振幅不能再相加抵消，只能各自贡献概率：½ × ½ + ½ × ½ = ½。可以切到「标记路径」发射一批光子验证。',

    s4k: '第 4 步 · 布洛赫球',
    s4t: '一个量子比特的所有状态，能画在一张图上吗？',
    s4e: '这一步要回答：θ 和 φ 两个角就能描述单个量子比特的所有状态（两个振幅同乘一个整体相位不影响任何测量），怎样把它们画成一张图？把 θ 当作从北极量起的角、φ 当作绕竖轴转的经度，每个状态就是<strong>布洛赫球</strong>面上的一个点：北极是 |0⟩，南极是 |1⟩，赤道上是 0、1 各占一半、只差相位的叠加态。点的坐标 (x, y, z) = (sin θ cos φ, sin θ sin φ, cos θ)。好用之处在于：沿某个轴测量，得到「+」的概率就是 (1 + 该轴坐标)/2。Z 轴对应直接测 0/1，X 轴对应第 2 步「先过 H 门再测」，Y 轴是第三种测法。所以第 2 步改相位 φ，就是绕 Z 轴转圈：z 不变，x 在变。右图三根条是三种测量各自得到「+」的概率，竖虚线标出 0.5。',
    s4lgVec: '状态点与箭头', s4lgTrail: '走过的点', s4lgZ: 'Z 基 P(0)', s4lgX: 'X 基 P(+)', s4lgY: 'Y 基 P(+i)',
    clearTrail: '清空轨迹',
    c4a: '布洛赫球（θ 从北极量起，φ 绕竖轴）', c4b: '三种测量得到「+」的概率',
    c4aAria: '布洛赫球上的状态点', c4bAria: '三种测量基下的概率条',
    s4readout: 'θ = {th}°，φ = {ph}°：球面上的点 (x, y, z) = ({x}, {y}, {z})。Z 基 P(0) = (1 + z)/2 = {pz}；X 基 P(+) = (1 + x)/2 = {px}；Y 基 P(+i) = (1 + y)/2 = {py}。',
    s4hint: '观察顺序：只拖 φ：点沿纬线绕竖轴转圈，Z 条一动不动，X、Y 两条此消彼长——这正是第 2 步看到的现象。只拖 θ：点沿经线从 |0⟩ 走向 |1⟩，Z 条从 1 降到 0。把点放到赤道（θ = 90°）：Z 条恰好停在 0.5。白色小点记下走过的轨迹。',

    s5k: '第 5 步 · 测量会扰动',
    s5t: '中间多测一次，为什么会改掉原本确定的结果？',
    s5e: '这一步要回答：一个 |0⟩ 态，测 Z 必然得 0。如果在两次 Z 测量之间插一次沿别的方向的测量，第三次还会必然得 0 吗？中间那次沿布洛赫球上与 Z 轴夹角为 χ 的方向测量：χ = 0° 就是再测一次 Z，χ = 90° 就是 X 基测量。按第 4 步，|0⟩ 沿这个方向得「+」的概率是 (1 + cos χ)/2；测完状态坍缩到该方向的 + 或 −，再测 Z 得 0 的概率分别是 (1 + cos χ)/2 和 (1 − cos χ)/2。合起来，第三次得 0 的概率是 <strong>(1 + cos²χ)/2</strong>，χ = 90° 时只剩 1/2。左图是三次测量各自结果的比例（实心 = 模拟，虚线框 = 理论）；右图白线是第三次得 0 的概率随 χ 的变化，点是模拟结果。',
    chiSlider: '中间测量的方向 χ（与 Z 轴的夹角）', midOff: '中间不测', midOn: '中间测一次', run5: '跑 200 次', clear5: '清空记录',
    s5lgPlus: '结果 + / 0', s5lgMinus: '结果 − / 1', s5lgCurve: '第三次得 0 的理论概率', s5lgRuns: '模拟（青 = 中间测，灰 = 不测）',
    c5a: '三次测量的结果比例 · 本设置已跑 {n} 次', c5b: '第三次得 0 的概率 ↑ 对 χ →',
    c5aAria: '三次测量结果的柱状图', c5bAria: '第三次测得 0 的概率随方向变化',
    s5midOn: '第 2 次沿 χ = {chi}° 测：+ {m0} 次，− {m1} 次（理论 P(+) = {pm}）；',
    s5midOff: '第 2 次不测；',
    s5readout: '已跑 {n} 次：第 1 次测 Z 全部得 0（{f1} 次）；{mid}第 3 次测 Z：0 出现 {c0} 次，频率 {f}，理论 {p}。',
    s5empty: '还没有运行。当前设置：{mid}，第三次得 0 的理论概率 {p}。按「跑 200 次」开始。',
    s5modeOn: '中间沿 χ = {chi}° 测一次', s5modeOff: '中间不测',
    s5hint: '观察顺序：先选「中间不测」跑 200 次：第 3 次全是 0。再选「中间测一次」、χ = 90°，跑 200 次：中间结果约一半一半，第 3 次的 0 也只剩一半左右。把 χ 改成 0°、45°、135°、180° 各跑一次，青点沿白线排开：χ 越接近 90°，扰动越大；χ = 0° 或 180° 的测量与 Z 同轴，不改变结果。',

    s6k: '第 6 步 · 收束',
    s6t: '先算振幅，再谈概率',
    s6fin: '量子比特的状态由两个复数振幅描述；测量时按<strong>振幅的模方</strong>给出一个结果，单次不可预测，重复多次频率趋近概率；测完状态坍缩。概率相同的态可以相位不同，相位在<strong>振幅相加</strong>时显形：同相加强、反相抵消，这就是干涉；一旦能分辨路径，振幅不再相加，干涉消失。布洛赫球把一个量子比特画成一个点：沿哪个轴测，概率就看在该轴上的投影；而换个方向测一次，会改写原本确定的结果。',
    formula: '|ψ⟩ = α|0⟩ + β|1⟩\n|α|² + |β|² = 1\nP(0) = |α|²\nP(D0) = cos²(φ/2)',
    boundary: '适用范围：单个量子比特、理想的投影测量、没有噪声和退相干。第 1、3、5 步的计数来自固定种子的伪随机模拟，用来展示抽样起伏，不是实验数据。整体相位（两个振幅同乘同一个 e^(iγ)）不影响任何测量结果，所以布洛赫球上不显示它。多比特与纠缠不在本页范围内。',
    linksTitle: '继续探索',
    lk1: '双缝实验 · 第 2 步：一颗一颗发射，也能攒出条纹 →',
    lk2: '波的干涉 · 第 3 步：到达相位决定合振幅 →',
    lk3: '量子隧穿 · 第 0 步：经典与量子在势垒前的分歧 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《量子基础 · 可能性先于结果》的平行版本。'
  },
  en: {
    pageTitle: 'Quantum Basics · Amplitudes First, Probabilities Second',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Quantum Basics · Possibility Before Outcome →',
    navLabel: 'Quantum basics steps',
    tagline: 'Before it is measured, a qubit carries two "amplitudes"; only on measurement does it give 0 or 1, with odds set by the amplitudes squared. How do amplitudes differ from probabilities? In seven steps you will measure by hand, watch frequencies creep towards probabilities, and see how the phase between amplitudes lets two paths cancel. In interference experiments like these, "it was secretly 0 or 1 all along" cannot explain what you see.',
    nav0: '0 Amplitudes', nav1: '1 Measurement', nav2: '2 Phase', nav3: '3 Interference', nav4: '4 Bloch sphere', nav5: '5 Measuring disturbs', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Amplitudes',
    s0t: 'A qubit sits in a superposition of 0 and 1. How likely is each result?',
    s0e: 'The question here: a <strong>qubit</strong> (the simplest quantum system: measuring it only ever gives 0 or 1) is in a superposition. What are the chances of reading 0 and 1? Its state is written |ψ⟩ = α|0⟩ + β|1⟩, where |0⟩ and |1⟩ are the <strong>basis states</strong> belonging to the two results and α, β are called <strong>amplitudes</strong>. For now the amplitudes are real: α = cos ψ and β = sin ψ, so α² + β² = 1 and the state is an arrow on the unit circle. The <strong>Born rule</strong>: the probability of 0 is |α|², of 1 is |β|². Amplitudes can be negative; probabilities are their squares and never are. Left: α across, β up; the white arrow is the state and the cyan and orange segments are its projections. Right: the two amplitudes (dashed outlines, possibly negative) on the left half and the two probabilities on the right half.',
    psiSlider: 'State angle ψ',
    s0lgState: 'State arrow (α, β)', s0lgA: 'α: amplitude of |0⟩; |α|²: chance of 0', s0lgB: 'β: amplitude of |1⟩; |β|²: chance of 1', s0lgAmp: 'Dashed outline = amplitude (can be negative)',
    c0a: 'Amplitude plane: α across, β up', c0b: 'Amplitudes (left) and probabilities (right)',
    c0aAria: 'State arrow on the unit circle', c0bAria: 'Bar chart of amplitudes and probabilities',
    s0readout: 'ψ = {psi}°: α = cos ψ = {a}, β = sin ψ = {b}. P(0) = |α|² = {p0}, P(1) = |β|² = {p1}, summing to {sum}. ',
    s0neg: 'One amplitude is negative, yet the probabilities only see its square. The sign changes nothing here; steps 2 and 3 show where it matters.',
    s0hint: 'What to try: drag ψ from 0° to 90°. The arrow swings from the horizontal axis to the vertical one, |α|² falls from 1 to 0 and |β|² rises from 0 to 1, and the two probability bars always sum to 1. Carry on through 90°–180°: α turns negative (its dashed outline drops below zero) while the probability bars mirror what they did between 0° and 90°. ψ = 45° and 135° give identical probabilities, though the two states have opposite signs of α.',
    q0Prompt: 'Think: a state has amplitudes α = 0.6 and β = −0.8. What is the probability of reading 1?',
    q0A: '−0.8', q0B: '0.64', q0C: '0.8',
    q0Right: 'Right. Probability is the squared magnitude: (−0.8)² = 0.64, and with 0.6² = 0.36 it adds up to 1.',
    q0Wrong: 'A probability cannot be negative, nor is it the amplitude itself. By the Born rule P(1) = |β|² = (−0.8)² = 0.64.',
    check: 'Check answer', pick: 'Pick an option first.',

    s1k: 'Step 1 · Measurement',
    s1t: 'The probability is 0.75. What does a single measurement show?',
    s1e: 'The question here: a probability only says how likely something is. What does one measurement actually give? Before each measurement the same state is <strong>prepared</strong> afresh, and each measurement gives one definite result, 0 or 1, which cannot be predicted in advance. Repeat the experiment N times and the <strong>frequency</strong> of 0 (count ÷ N) creeps towards P(0), with the error shrinking roughly like 1/√N. The grey band is "expected ± 2 standard deviations", where the standard deviation is √(P(1 − P)/N); about 95% of the time the frequency lies inside it. Measurement also changes the state: after reading 0 the state becomes |0⟩, which is called <strong>collapse</strong>, so measuring again straight away without re-preparing keeps giving 0. This step uses the state set in step 0. The results come from a pseudo-random simulation in the page, not from experimental data (<a class="xlink" href="../../../physics/modern/double-slit/#step2">→ Double slit, step 2: fringes built one particle at a time</a>).',
    m1: 'Measure once', m10: 'Measure 10×', m100: 'Measure 100×', again1: 'Measure once, then 10× more without re-preparing', reset1: 'Reset',
    s1lg0: 'Result 0', s1lg1: 'Result 1', s1lgFreq: 'Running frequency of 0', s1lgBand: 'Expected ± 2 standard deviations',
    c1strip: 'Latest results (newest on the right) · {n} in total', c1freq: 'Frequency of 0 ↑ vs number of measurements N →',
    s1readout: 'Current state (from step 0): P(0) = {p}. Measured {n} times: 0 came up {c0} times and 1 came up {c1} times, a frequency of {f}; at this N the frequency lands within {lo}–{hi} about 95% of the time.',
    s1empty: 'Nothing measured yet. Current state (from step 0): P(0) = {p}. Press "Measure once" to start.',
    s1again: ' Collapse demo: freshly prepared, the first measurement gave {k}; measuring 10 more times without re-preparing gave {list}.',
    s1hint: 'What to try: press "Measure once" a few times. The tiles follow no pattern and the white line jumps around. Then press "Measure 100×" a few times: the white line flattens out against the dashed cyan line (the expected P(0)) and the grey band narrows. Press "Measure once, then 10× more without re-preparing": the last ten are all the same result. Changing ψ in step 0 resets this step.',

    s2k: 'Step 2 · Phase',
    s2t: 'Two states give the same probabilities. Are they the same state?',
    s2e: 'The question here: if |α|² and |β|² agree, what else can tell two states apart? In general amplitudes are <strong>complex numbers</strong>, with a size and a direction (an angle in the complex plane). Write β = sin(θ/2)·e^(iφ): θ sets the sizes of the two amplitudes, and φ is the angle by which β is turned relative to α, the <strong>relative phase</strong>. Multiplying by e^(iφ) rotates by φ without changing length (<a class="xlink" href="../../../math/algebra/complex-numbers/#step4">→ Complex numbers, step 4: multiplying multiplies lengths and adds angles</a>), so reading 0/1 directly, a <strong>Z-basis measurement</strong>, does not depend on φ. Now send the qubit through an <strong>H gate</strong> first. The H gate mixes the two amplitudes, making the new 0-amplitude (α + β)/√2, much as a 50/50 beam splitter would. Measuring after it is an <strong>X-basis measurement</strong>, and its chance of "+" is |α + β|²/2: it depends on whether the two arrows add up or cancel. Left: the two amplitudes in the complex plane (real part across, imaginary part up). Right: φ across; green is the Z-basis P(0), pink is the X-basis P(+).',
    thSlider: 'Amplitude-size angle θ', phSlider: 'Relative phase φ',
    s2lgA: 'α (amplitude of |0⟩)', s2lgB: 'β (amplitude of |1⟩)', s2lgZ: 'Z basis: P(0)', s2lgX: 'X basis: P(+)', s2lgHist: 'Values of φ tried',
    c2a: 'The two amplitudes in the complex plane', c2b: 'Probability ↑ vs relative phase φ →',
    c2aAria: 'Amplitude arrows in the complex plane', c2bAria: 'Probabilities of two measurements against phase',
    s2readout: 'α = {a}, β = {bm} · e^(i·{ph}°) = {bc}. Measured directly (Z basis): P(0) = |α|² = {pz}, whatever φ is. Through an H gate first (X basis): P(+) = |α + β|² ÷ 2 = {px}.',
    s2hint: 'What to try: keep θ = 90° (equal-sized amplitudes) and drag φ from 0° to 360°. The orange arrow circles without changing length; the green line stays flat at 0.5 while the pink curve falls from 1 to 0 and back. At φ = 0° the arrows point the same way and add to the longest sum; at φ = 180° they point opposite ways and cancel, so "+" never comes up. White dots mark values you tried. Then lower θ: the pink swing shrinks because β is shorter and cannot cancel α completely.',

    s3k: 'Step 3 · Interference',
    s3t: 'A photon takes two paths that rejoin. Why do none reach D0 at some settings?',
    s3e: 'The question here: send one photon at a time through a <strong>Mach–Zehnder interferometer</strong>. What happens? The first beam splitter, BS1, puts it on two paths with amplitude 1/√2 each (probability ½ each). The upper path passes an adjustable <strong>phase shift</strong> φ (a slightly longer route, say). The paths rejoin at a second beam splitter, BS2, and continue to detector D0 or D1. There are two ways to reach D0, and their amplitudes are <strong>added first, then squared</strong>: P(D0) = |(1 + e^(iφ))/2|² = cos²(φ/2). At φ = 0° the paths are in step and every photon goes to D0; at φ = 180° they cancel exactly and D0 gets nothing. Put a <strong>which-path marker</strong> on the lower path, so that in principle you could tell which way the photon went, and the paths stop interfering: their probabilities add, P(D0) = ½·½ + ½·½ = ½, whatever φ is (<a class="xlink" href="../../../physics/modern/double-slit/#step3">→ Double slit, step 3: know the slit and the fringes vanish</a>). Left: the apparatus; thicker output beams and brighter detectors mean higher arrival probability. Right: φ across; the cyan curve is P(D0) with interference, the grey dashed line the ½ from adding probabilities.',
    phSlider3: 'Phase shift φ on the upper path', whichOff: 'No path marker (interference)', whichOn: 'Mark the path (no interference)', fire3: 'Fire 100 photons', clear3: 'Clear counts', marker: 'marker',
    s3lgQ: 'Interference: P(D0) = cos²(φ/2)', s3lgC: 'Path marked: P(D0) = ½', s3lgShots: 'Simulated frequencies (pink = path marked)',
    c3a: 'Mach–Zehnder interferometer (light enters bottom left)', c3b: 'P(D0) ↑ vs phase shift φ →',
    c3aAria: 'Sketch of the interferometer', c3bAria: 'Probability of reaching D0 against phase shift',
    s3open: 'φ = {ph}°, both paths open: the D0 amplitude is (1 + e^(iφ))/2, so P(D0) = {p0} and P(D1) = {p1}.',
    s3which: 'φ = {ph}°, lower path marked: the two paths\' probabilities simply add, P(D0) = {p0} and P(D1) = {p1} (unmarked, P(D0) would be {pq}).',
    s3counts: ' Fired so far at this setting: {n}; D0 caught {c0}, D1 caught {c1}, a D0 frequency of {f}.',
    s3hint: 'What to try: with no marker, drag φ from 0° to 180°. The beam to D0 thins and D0 dims while D1 brightens. Fire 100 photons at 0°, 90° and 180°; the white dots land near the cyan curve. Now choose "Mark the path" and fire at the same φ values: the pink dots all sit near ½, and the interference is gone. Note that every photon is still recorded by exactly one detector.',
    q3Prompt: 'Think: at φ = 180° no photons reach D0. What happens at D0 once a which-path marker is placed on the lower path?',
    q3A: 'Still nothing: φ has not changed', q3B: 'It receives every photon', q3C: 'It gets about half: the paths no longer interfere, so their probabilities add',
    q3Right: 'Right. When the path can be known, each path contributes ½ × ½, giving ½ regardless of φ.',
    q3Wrong: 'Once the path is marked, the two amplitudes can no longer add and cancel; each path just contributes its probability: ½ × ½ + ½ × ½ = ½. Switch to "Mark the path" and fire a batch to check.',

    s4k: 'Step 4 · The Bloch sphere',
    s4t: 'Can every state of one qubit fit in a single picture?',
    s4e: 'The question here: the two angles θ and φ describe every state of a single qubit (multiplying both amplitudes by a common overall phase changes no measurement). How can they be drawn as one picture? Treat θ as the angle down from the north pole and φ as the longitude around the vertical axis, and each state becomes a point on the <strong>Bloch sphere</strong>: |0⟩ at the north pole, |1⟩ at the south pole, and on the equator the half-and-half superpositions that differ only in phase. The point sits at (x, y, z) = (sin θ cos φ, sin θ sin φ, cos θ). The useful part: measuring along an axis gives "+" with probability (1 + that coordinate)/2. The Z axis is reading 0/1 directly, the X axis is step 2\'s "H gate then measure", and the Y axis is a third choice. So changing the phase φ in step 2 just spins the point around the Z axis: z stays put while x changes. Right: the three bars give each measurement\'s chance of "+", with a dashed line at 0.5.',
    s4lgVec: 'State point and arrow', s4lgTrail: 'Points visited', s4lgZ: 'Z basis P(0)', s4lgX: 'X basis P(+)', s4lgY: 'Y basis P(+i)',
    clearTrail: 'Clear trail',
    c4a: 'Bloch sphere (θ from the north pole, φ around the vertical)', c4b: 'Chance of "+" for three measurements',
    c4aAria: 'State point on the Bloch sphere', c4bAria: 'Probability bars in three measurement bases',
    s4readout: 'θ = {th}°, φ = {ph}°: the point is (x, y, z) = ({x}, {y}, {z}). Z basis P(0) = (1 + z)/2 = {pz}; X basis P(+) = (1 + x)/2 = {px}; Y basis P(+i) = (1 + y)/2 = {py}.',
    s4hint: 'What to try: drag only φ. The point circles the vertical axis along a line of latitude; the Z bar does not move while the X and Y bars trade off, which is exactly what step 2 showed. Drag only θ: the point travels along a meridian from |0⟩ towards |1⟩ and the Z bar falls from 1 to 0. Put the point on the equator (θ = 90°) and the Z bar sits at exactly 0.5. Small white dots trace where you have been.',

    s5k: 'Step 5 · Measuring disturbs',
    s5t: 'Why does one extra measurement in the middle change a result that was certain?',
    s5e: 'The question here: measuring |0⟩ in Z always gives 0. Insert a measurement along some other direction between two Z measurements. Is the third result still certain to be 0? The middle measurement is along a direction at angle χ from the Z axis on the Bloch sphere: χ = 0° is just Z again, χ = 90° is the X basis. From step 4, |0⟩ gives "+" along that direction with probability (1 + cos χ)/2; the state then collapses to + or − along it, and a final Z measurement gives 0 with probability (1 + cos χ)/2 or (1 − cos χ)/2 respectively. Altogether the third measurement gives 0 with probability <strong>(1 + cos²χ)/2</strong>, only ½ at χ = 90°. Left: the share of each result at each of the three measurements (solid = simulated, dashed outline = theory). Right: the white curve is the chance that the third result is 0 as χ varies; dots are simulated runs.',
    chiSlider: 'Direction of the middle measurement χ (angle from Z)', midOff: 'No middle measurement', midOn: 'Measure once in the middle', run5: 'Run 200 times', clear5: 'Clear records',
    s5lgPlus: 'Result + / 0', s5lgMinus: 'Result − / 1', s5lgCurve: 'Theory: chance the third result is 0', s5lgRuns: 'Simulated (cyan = with middle, grey = without)',
    c5a: 'Result shares, three measurements · {n} runs here', c5b: 'Chance the third result is 0 ↑ vs χ →',
    c5aAria: 'Bar chart of the three measurement results', c5bAria: 'Chance of 0 on the third measurement against direction',
    s5midOn: 'second, along χ = {chi}°: + {m0} times, − {m1} times (theory P(+) = {pm}); ',
    s5midOff: 'second: skipped; ',
    s5readout: 'Ran {n} times. First, Z: always 0 ({f1} times); {mid}third, Z: 0 came up {c0} times, a frequency of {f} against a theoretical {p}.',
    s5empty: 'Not run yet. Current setting: {mid}; theoretical chance the third result is 0: {p}. Press "Run 200 times" to start.',
    s5modeOn: 'measure along χ = {chi}° in the middle', s5modeOff: 'no middle measurement',
    s5hint: 'What to try: choose "No middle measurement" and run 200 times: the third result is always 0. Then choose "Measure once in the middle" with χ = 90° and run 200 times: the middle results split roughly in half, and only about half of the third results are 0. Run once each at χ = 0°, 45°, 135° and 180°; the cyan dots line up along the white curve. The closer χ is to 90°, the bigger the disturbance; at 0° or 180° the middle measurement shares Z\'s axis and changes nothing.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Amplitudes first, probabilities second',
    s6fin: 'A qubit\'s state is described by two complex amplitudes. A measurement gives one result with probability equal to the <strong>squared magnitude of its amplitude</strong>; single results are unpredictable, frequencies approach the probabilities, and the state collapses afterwards. States with the same probabilities can differ in phase, and phase shows itself when <strong>amplitudes add</strong>: in step they reinforce, out of step they cancel. That is interference, and it vanishes as soon as the path can be known. The Bloch sphere draws a qubit as one point: measure along an axis and the probability follows the projection onto it, while measuring along a different direction rewrites a result that was certain.',
    formula: '|ψ⟩ = α|0⟩ + β|1⟩\n|α|² + |β|² = 1\nP(0) = |α|²\nP(D0) = cos²(φ/2)',
    boundary: 'Scope: one qubit, ideal projective measurements, no noise or decoherence. The counts in steps 1, 3 and 5 come from a fixed-seed pseudo-random simulation meant to show sampling scatter; they are not experimental data. An overall phase (both amplitudes multiplied by the same e^(iγ)) changes no measurement, so the Bloch sphere does not show it. Several qubits and entanglement are beyond this page.',
    linksTitle: 'Keep exploring',
    lk1: 'Double slit · step 2: fringes built up one particle at a time →',
    lk2: 'Interference of waves · step 3: arrival phase sets the combined amplitude →',
    lk3: 'Quantum tunnelling · step 0: where classical and quantum part ways at a barrier →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of "Quantum Basics · Possibility Before Outcome".'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang][key] || STRINGS.en[key] || key;
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
  if (typeof window.refreshQuantum === 'function') window.refreshQuantum();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.QB_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
