'use strict';
// Acid–base equilibrium lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const LINK = {
  eq0: '../../../chemistry/reactions/chemical-equilibrium/#step0',
  eq2: '../../../chemistry/reactions/chemical-equilibrium/#step2',
  ph1: '../../../chemistry/solutions/ph-scale/#step1',
  ph4: '../../../chemistry/solutions/ph-scale/#step4',
  buf1: '../../../chemistry/solutions/buffer-capacity/#step1',
  tit2: '../../../chemistry/solutions/titration-curves/#step2',
  rate0: '../../../chemistry/reactions/reaction-rates/#step0',
  act3: '../../../chemistry/reactions/activation-energy/#step3'
};
const a = (k, text) => `<a class="xlink" href="${LINK[k]}">${text}</a>`;

const STRINGS = {
  zh: {
    pageTitle: '酸碱平衡 · 拆开与结合从不停下',
    back: '← 知识索引',
    compare: '对照另一版本：酸碱平衡 · 分子在两边来回走 →',
    navLabel: '酸碱平衡步骤导航',
    tagline: '把一种弱酸倒进水里，只有一部分分子 HA 拆成 H⁺ 和 A⁻。拆开的到底占几成？由什么决定？加水、加盐、换一种酸时又怎样变？六步里先看 200 个分子来回拆合，再用一个常数 Ka 把比例和 pH 算出来。',
    nav0: '0 两个方向', nav1: '1 酸的强弱', nav2: '2 加水稀释', nav3: '3 共同离子', nav4: '4 终点与快慢', nav5: '5 收束',

    s0k: '第 0 步 · 两个方向',
    s0t: '弱酸溶液看起来静止不动，分子真的停下了吗？',
    s0e: '这一步要回答：弱酸溶进水后，拆开的比例为什么会停在某个值上？<strong>弱酸</strong>是在水里只有一部分分子拆开的酸，写作 HA ⇌ H⁺ + A⁻：H⁺ 是氢离子，A⁻ 是 HA 失去 H⁺ 后剩下的部分（叫<strong>共轭碱</strong>），双箭头表示拆开和重新结合两个方向都在发生。下面模拟 200 个酸分子，总浓度 c = 0.10 mol/L，每个分子代表 0.0005 mol/L。每一小段时间里，每个完整的 HA 都有固定的机会拆开（<strong>正向</strong>）；每个 H⁺ 遇到 A⁻、重新结合的机会则与 A⁻ 的浓度成正比（<strong>逆向</strong>）。拆开的越多，逆向就越频繁，直到两个方向每秒的次数相等。这时拆开的总数不再变，但拆合从未停止，这叫<strong>动态平衡</strong>（' + a('eq0', '→ 化学平衡页第 0 步：平衡为什么是动态的') + '）。<strong>拆开比例 α</strong> = 拆开的分子数 ÷ 分子总数。为了看得清，这里选一种拆开较多的弱酸（与亚氯酸 HClO₂ 相近），平衡时约四分之一拆开。',
    c0grid: '200 个酸分子（每格一个）',
    c0alpha: '拆开比例 α（%） · 横轴：时间（秒）',
    c0rate: '每秒事件数（近 2 秒平均） · 横轴：时间（秒）',
    lgIntact: '完整的 HA', lgSplit: '已拆开：A⁻（绿圈）+ H⁺（橙点）', lgFlashF: '橙色闪光 = 刚拆开', lgFlashR: '青色闪光 = 刚结合',
    lgAlpha: '拆开比例 α', lgTheory: '平衡式算出的 α', lgFwd: '正向：每秒拆开次数', lgRev: '逆向：每秒结合次数',
    restartIntact: '从全是 HA 重新开始', restartSplit: '从全部拆开重新开始', pause: '暂停', resume: '继续', advance: '前进 5 秒',
    s0readout: 't = {t} 秒　此刻拆开 {n}/{N} 个（α = {alpha}）　正向 {fwd} 次/秒、逆向 {rev} 次/秒　平衡式算出 α = {eq}，近 5 秒平均 {avg}。',
    s0hint: '观察顺序：先按「从全是 HA 重新开始」，看「拆开比例」图里绿线从 0 往上爬，「每秒事件数」图里橙线（拆开）从高处回落、青线（结合）从 0 升起，两线相遇后绿线走平。再按「从全部拆开重新开始」：绿线从 100% 往下落，却停在同一条白虚线附近——终点与起点无关。走平之后网格里的闪光并没有停。时间是教学慢放：真实溶液里拆合快得多，平衡几乎瞬间建立，但慢放不改变平衡比例（第 4 步验证）。',

    s1k: '第 1 步 · 酸的强弱',
    s1t: '同样是 0.10 mol/L，为什么有的酸 pH 接近 1，有的却接近 5？',
    s1e: '这一步要回答：浓度相同时，拆开比例由什么决定？由每种酸自己的<strong>解离常数 Ka</strong>：平衡时 Ka = [H⁺][A⁻] / [HA]，方括号表示该物种达到平衡时的浓度（mol/L）。Ka 越大，平衡越偏向拆开；它只随酸的种类和温度变，与加了多少酸无关。不同酸的 Ka 相差许多个数量级，所以常写 <strong>pKa = −lg Ka</strong>：Ka 大 10 倍，pKa 小 1，pKa 越小酸越强。<strong>pH = −lg[H⁺]</strong>，pH 小 1 表示 [H⁺] 大 10 倍（' + a('ph1', '→ pH 页第 1 步：差 1 就是 10 倍') + '）。设平衡时每升拆开了 x mol，则 [H⁺] = [A⁻] = x，[HA] = c − x，代入得 x² / (c − x) = Ka；解这个一元二次方程就得到 x、α = x / c 和 pH = −lg x。下图横轴都是 pKa（往右酸越弱），「拆开比例」曲线纵轴是 α，用对数刻度（每格差 10 倍，否则弱酸部分全挤在 0 附近），顶端灰虚线是强酸的 100%；「pH」曲线纵轴是 pH；灰色竖线标出五种常见弱酸，选中的那条变橙色。',
    c1alpha: '拆开比例 α（对数刻度） · 横轴：pKa · c = 0.10 mol/L',
    c1ph: 'pH · 横轴：pKa',
    lgCurve: '二次方程算出的曲线', lgNow: '当前选择', lgAcids: '五种常见弱酸的位置', lgStrong: '同浓度强酸（全部拆开）',
    kaLabel: 'Ka（对数刻度）',
    acidHClO2: 'HClO₂ 亚氯酸', acidHF: 'HF 氢氟酸', acidAcetic: 'CH₃COOH 醋酸', acidHClO: 'HClO 次氯酸', acidHCN: 'HCN 氢氰酸',
    s1readout: 'Ka = {ka}（pKa = {pka}）：每升拆开 x = {x} mol，α = {alpha}，每 1000 个分子约 {per} 个拆开。pH = {ph}；同浓度强酸 pH = {phs}，相差 {dph}。',
    s1hint: '观察顺序：浓度固定 0.10 mol/L 不动，只拖 Ka 滑杆或点常见酸按钮，看两条曲线上的圆点。pKa 小于 0 时 α 超过 90%，几乎和强酸一样；pKa 大于 3 以后，「拆开比例」曲线变成一条直线：pKa 每大 2，α 下降一格（缩小到约 1/10），pH 约大 1。Ka 只决定比例，不决定快慢（第 4 步）。',

    s2k: '第 2 步 · 加水稀释',
    s2t: '把醋酸稀释 100 倍，pH 会像强酸那样升高 2 吗？',
    s2e: '这一步要回答：Ka 不变，只改总浓度 c，拆开比例 α 和 pH 怎样变？稀释的一瞬间，[H⁺]、[A⁻]、[HA] 都缩小同一倍数。Ka 的式子分子上有两个浓度、分母上只有一个，所以稀释 10 倍时，<strong>反应商 Q</strong>（和 Ka 同一个式子，但代入的是此刻的浓度，不一定是平衡浓度）变成原来的 1/10，Q < Ka，净反应朝拆开的方向走，α 变大。于是 pH 升得比强酸慢。α 很小时 c − x ≈ c，二次方程简化成 <strong>α ≈ √(Ka / c)</strong>（奥斯特瓦尔德稀释定律）：c 小 100 倍，α 大 10 倍，[H⁺] 只小 10 倍，pH 只升约 1。下图横轴都是总浓度 c（对数刻度，往右越稀）：「拆开比例」曲线里实线是二次方程的精确解，虚线是 √(Ka/c) 近似；「pH」曲线里灰色虚线是同浓度强酸。',
    c2alpha: '拆开比例 α（%）',
    c2ph: 'pH',
    c2x: '总浓度 c（mol/L）',
    lgApprox: '近似式 √(Ka/c)',
    cLabel: '总浓度 c（对数刻度）',
    s2readout: '{acid}，c = {c} mol/L：α = {alpha}（近似式给 {approx}，偏差 {err}）；pH = {ph}，同浓度强酸 pH = {phs}。从这里再稀释 10 倍：瞬间 Q 只有 Ka 的 1/10，新平衡 α = {alpha10}，pH 升高 {dph10}（强酸升高 1.00）。',
    s2hint: '观察顺序：先选醋酸，把 c 从 1 mol/L 一路拖到最稀（约 3×10⁻⁵ mol/L），看「拆开比例」上的圆点沿实线升高；实线和虚线在浓溶液处重合，在 α 变大处分开——近似式只在 α 小时可靠。再看「pH」曲线：弱酸的线比强酸的灰线平缓，斜率约一半。换成 HF 重复一次，看它更早接近 100%。',
    quizPrompt: '小测：0.10 mol/L 醋酸稀释到 0.0010 mol/L（100 倍），pH 大约升高多少？',
    quizA: '升高 2，和强酸一样', quizB: '升高约 1', quizC: '不变，因为 Ka 没变',
    check: '检查答案',
    quizRight: '对。pH 从 {ph1} 升到 {ph2}，只升高 {d}：稀释让 α 从 {a1} 增大到 {a2}，抵消了一半的稀释效果。',
    quizWrong: '再看「pH」曲线：从 c = 0.1 到 0.001，弱酸的线升高 {d}，只有灰色强酸线的一半左右。原因是稀释让 α 从 {a1} 增大到 {a2}。',
    quizNone: '先选一个选项。',

    s3k: '第 3 步 · 共同离子',
    s3t: '往弱酸里加入它自己的 A⁻，拆开的分子会变多还是变少？',
    s3e: '这一步要回答：溶液里已经有额外的 A⁻ 时，平衡怎样移动？比如加入盐 NaA，它在水里完全拆成 Na⁺ 和 A⁻；这份与弱酸共有的 A⁻ 叫<strong>共同离子</strong>。加盐的瞬间还没有任何反应发生，但 [A⁻] 变大了，<strong>反应商 Q</strong>（Ka 的式子代入此刻浓度）超过 Ka。在分子层面，就是每个 H⁺ 碰上 A⁻ 的机会变多：逆向（重新结合）跑得比正向快，拆开的分子减少，直到两边每秒次数重新相等（' + a('eq2', '→ 化学平衡页第 2 步：加料后体系怎样重新走平') + '）。模拟沿用第 0 步那 200 个分子（与亚氯酸相近的弱酸，0.10 mol/L）；网格下方的小绿点是加进来的 A⁻，每点同样代表 0.0005 mol/L。Na⁺ 不参与反应，没有画出。',
    c3grid: '200 个酸分子 + 加入的 A⁻（小绿点）',
    lgExtra: '加入的 A⁻（来自 NaA）',
    sLabel: '加入的 A⁻ 浓度 s',
    reset3: '回到 s = 0',
    s3readout: 's = {s} mol/L　此刻拆开 {n}/{N} 个（α = {alpha}）　正向 {fwd}、逆向 {rev} 次/秒　平衡式：α = {eq}（不加盐 {eq0}），pH = {ph}（不加盐 {ph0}）。{qk}',
    qkUp: '最近一次改 s 的瞬间（按改动前的平衡浓度算）Q/Ka = {q}，大于 1 → 净逆向，拆开的减少。',
    qkDown: '最近一次改 s 的瞬间（按改动前的平衡浓度算）Q/Ka = {q}，小于 1 → 净正向，拆开的增多。',
    qkNone: '还没改过 s：此刻 Q/Ka 在 1 附近随机起伏。',
    s3acetic: '同一道理用于醋酸：0.10 mol/L 醋酸 pH = {ph0}，α = {a0}；再溶入 0.10 mol/L 醋酸钠（额外 A⁻），pH = {ph1}，α 降到 {a1}。这正是缓冲溶液的起点（' + '{link}' + '）。',
    bufLink: '→ 缓冲溶液页第 1 步：A⁻ 与 HA 的比值决定 pH',
    s3hint: '观察顺序：先等「拆开比例」绿线走平，再把 s 从 0 拖到 0.10。看「每秒事件数」图：青线（结合）立刻跳到橙线（拆开）上方，绿线随之下降；两线重新相遇时，绿线停在白虚线的新高度。再按「回到 s = 0」，过程反过来：橙线先领先，绿线回升。',

    s4k: '第 4 步 · 终点与快慢',
    s4t: 'Ka 大，是不是说明这种酸拆得快？',
    s4e: '这一步要回答：Ka 管的是「停在哪」，还是「走多快」？模拟里有两个机会参数：<strong>kf</strong> 是每个 HA 每秒拆开的机会，<strong>kr</strong> 决定 H⁺ 与 A⁻ 每秒重新结合的机会。平衡时两方向次数相等：kf·[HA] = kr·[H⁺][A⁻]，移项得 [H⁺][A⁻]/[HA] = kf/kr，所以 <strong>Ka = kf / kr</strong>，只是一个比值。下面 A、B 两组各 400 个分子同时从全是 HA 出发。A 组固定（与第 0 步相同）；B 组可以只改快慢（kf、kr 乘同一个倍数，比值即 Ka 不变），也可以只改 Ka（kf 不变、只改 kr）。反应为什么有快有慢，另有专页（' + a('rate0', '→ 反应速率页第 0 步：数成功碰撞') + '）；催化剂让正逆两个方向同时加快，正是「只改快慢」这一种（' + a('act3', '→ 活化能页第 3 步：催化剂') + '）。',
    c4: '拆开比例 α（%） · 横轴：从同时出发起的时间（秒）',
    lgA: 'A 组（固定）', lgB: 'B 组（可调）', lgLevelA: 'A 的平衡值', lgLevelB: 'B 的平衡值',
    speedLabel: 'B 组快慢倍数（kf、kr 同乘）', kaBLabel: 'B 组 Ka',
    rerun: '重新同时出发',
    s4readout: 'A：Ka = {kaA}，快慢 ×1 → 平衡 α = {aA}，到达平衡值的 90% 约需 {tA} 秒。B：Ka = {kaB}，快慢 ×{sp} → 平衡 α = {aB}，约需 {tB} 秒。{verdict}',
    s4progress: '已模拟 {t} / {T} 秒。',
    vSame: '两组设定相同，两条线只差随机起伏。',
    vSpeed: 'Ka 相同、只改快慢：终点一样，B 组只是更早或更晚到达。',
    vKa: '快慢倍数相同、只改 Ka：终点不同——Ka 决定停在哪。',
    vBoth: '两样都改了：终点只由 Ka 决定；到达时间同时受快慢倍数和 Ka 影响。',
    s4hint: '观察顺序：先只把「快慢倍数」拖到 ×4，看「拆开比例」图里橙线（B）比青线（A）先走平，却停在同一条虚线上。再把倍数拖回 ×1、只拖 Ka，两条线同时起步，却停在不同高度。每次改滑杆都会让两组重新同时出发。',

    s5k: '第 5 步 · 收束',
    s5t: '拆开与结合一直在发生，Ka 决定它们在哪里打平',
    s5fin: '一路下来：<strong>第 0 步</strong>，弱酸的拆开与结合同时进行，两者每秒次数相等时拆开比例走平，从哪一头出发都停在同一处。<strong>第 1 步</strong>，这个比例由 Ka 决定：同为 0.10 mol/L，pKa 每大 2，α 约小到 1/10，pH 约大 1。<strong>第 2 步</strong>，稀释让 Q 低于 Ka，α 变大，所以弱酸稀释 100 倍 pH 只升约 1。<strong>第 3 步</strong>，加入共同离子 A⁻ 让 Q 高于 Ka，逆向占上风，α 变小、pH 升高。<strong>第 4 步</strong>，Ka 只是正逆机会之比：同时加快两个方向不改终点，只改到达时间。',
    formula: 'Ka = [H⁺][A⁻] / [HA]\nx² + (Ka + s)·x − Ka·c = 0\nα = x / c　pH = −lg x',
    boundary: '适用范围：25 °C；把溶液当作理想溶液（用浓度代替活度）；忽略水自身电离——本页所有情形里 [H⁺] ≥ 10⁻⁶ mol/L，与把水电离算进去的完整解相比误差不到 1%，但在更稀或更弱的酸里必须算水（' + a('ph4', '→ pH 页第 4 步：稀释为什么不会变成碱') + '）。稀释和加盐只改浓度，不计体积变化。模拟里的分子数、机会参数和时间都是教学设定：真实溶液的拆合快得多，只有它们的比值 Ka 对应真实的平衡。',
    linksTitle: '接着去哪',
    lk1: '→ 化学平衡页第 2 步：加料后平衡怎样移动（勒夏特列原理）',
    lk2: '→ 缓冲溶液页第 1 步：A⁻ 与 HA 的比值决定 pH',
    lk3: '→ 滴定曲线页第 2 步：用碱滴定弱酸，曲线为什么不一样',
    lk4: '→ pH 页第 4 步：再怎么稀释，酸也不会变成碱',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《酸碱平衡 · 分子在两边来回走》的平行版本。'
  },
  en: {
    pageTitle: 'Acid–Base Equilibrium · Splitting and Rejoining Never Stop',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Acid–Base Equilibrium · Molecules Move Both Ways →',
    navLabel: 'Acid–base equilibrium steps',
    tagline: 'Pour a weak acid into water and only some of its HA molecules split into H⁺ and A⁻. What share splits? What sets that share, and how does it move when you add water, add a salt, or switch acids? In six steps you first watch 200 molecules split and rejoin, then use one constant, Ka, to calculate the share and the pH.',
    nav0: '0 Both directions', nav1: '1 Acid strength', nav2: '2 Dilution', nav3: '3 Common ion', nav4: '4 End point vs speed', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Both directions',
    s0t: 'A weak-acid solution looks perfectly still. Have the molecules actually stopped?',
    s0e: 'The question here: once a weak acid dissolves, why does the share of split molecules settle at one value? A <strong>weak acid</strong> is one where only some molecules split in water. We write HA ⇌ H⁺ + A⁻: H⁺ is a hydrogen ion, A⁻ is what is left of HA after it loses H⁺ (its <strong>conjugate base</strong>), and the double arrow says both splitting and rejoining go on. Below are 200 acid molecules at a total concentration c = 0.10 mol/L, so each molecule stands for 0.0005 mol/L. In every short interval, each intact HA has a fixed chance of splitting (the <strong>forward</strong> direction); each H⁺ has a chance of meeting an A⁻ and rejoining that grows with the A⁻ concentration (the <strong>reverse</strong> direction). The more molecules have split, the more often rejoining happens, until both directions run at the same number of events per second. The count of split molecules then stops changing, yet splitting and rejoining never stop: that is a <strong>dynamic equilibrium</strong> (' + a('eq0', '→ Chemical equilibrium, step 0: why equilibrium is dynamic') + '). The <strong>split share α</strong> is the number of split molecules divided by the total. To keep things visible, this acid splits more than most (it behaves like chlorous acid, HClO₂): about a quarter of the molecules are split at equilibrium.',
    c0grid: '200 acid molecules (one per cell)',
    c0alpha: 'Split share α (%) · x-axis: time (s)',
    c0rate: 'Events per second (last 2 s) · x-axis: time (s)',
    lgIntact: 'Intact HA', lgSplit: 'Split: A⁻ (green ring) + H⁺ (orange dot)', lgFlashF: 'Orange flash = just split', lgFlashR: 'Cyan flash = just rejoined',
    lgAlpha: 'Split share α', lgTheory: 'α from the equilibrium equation', lgFwd: 'Forward: splits per second', lgRev: 'Reverse: rejoins per second',
    restartIntact: 'Restart with every molecule intact', restartSplit: 'Restart with every molecule split', pause: 'Pause', resume: 'Resume', advance: 'Advance 5 s',
    s0readout: 't = {t} s · split now: {n}/{N} (α = {alpha}) · forward {fwd}/s, reverse {rev}/s · equilibrium equation: α = {eq}; last-5-s average {avg}.',
    s0hint: 'What to watch: press “Restart with every molecule intact”. In the split-share chart the green line climbs from 0; in the events chart the orange line (splits) falls from high up while the cyan line (rejoins) rises from 0. Where they meet, the green line flattens. Then press “Restart with every molecule split”: the green line drops from 100% and settles near the same white dashed line, so the end point does not depend on the start. Once it is flat, the grid keeps flashing. Time is slowed down for teaching: in a real solution splitting and rejoining are far faster and equilibrium is reached almost at once, but slowing down does not change the equilibrium share (step 4 checks this).',

    s1k: 'Step 1 · Acid strength',
    s1t: 'Both at 0.10 mol/L, so why is one acid near pH 1 and another near pH 5?',
    s1e: 'The question here: at the same concentration, what sets the split share? Each acid’s own <strong>dissociation constant Ka</strong>. At equilibrium Ka = [H⁺][A⁻] / [HA], where square brackets mean the equilibrium concentration of that species in mol/L. A larger Ka tips the balance toward splitting. Ka depends only on which acid it is and on temperature, not on how much acid you add. Ka values span many powers of ten, so chemists write <strong>pKa = −log Ka</strong>: a Ka ten times larger means a pKa one smaller, and a smaller pKa means a stronger acid. Likewise <strong>pH = −log[H⁺]</strong>, and one pH unit lower means ten times more H⁺ (' + a('ph1', '→ pH scale, step 1: one unit is a factor of ten') + '). If x mol per litre has split at equilibrium, then [H⁺] = [A⁻] = x and [HA] = c − x, so x² / (c − x) = Ka. Solving that quadratic gives x, α = x / c and pH = −log x. Both charts below use pKa on the x-axis (weaker acids to the right): the split-share curve plots α on a log scale (each gridline is a factor of ten; on a linear scale every weak acid would be squashed against zero), with the strong acid’s 100% as a grey dashed line at the top; the pH curve plots pH; grey vertical lines mark five common weak acids, and the selected one turns orange.',
    c1alpha: 'Split share α (log scale) · x-axis: pKa · c = 0.10 mol/L',
    c1ph: 'pH · 横轴：pKa',
    lgCurve: 'Curve from the quadratic', lgNow: 'Current choice', lgAcids: 'Five common weak acids', lgStrong: 'Strong acid at the same c (fully split)',
    kaLabel: 'Ka (log scale)',
    acidHClO2: 'HClO₂ chlorous acid', acidHF: 'HF hydrofluoric acid', acidAcetic: 'CH₃COOH acetic acid', acidHClO: 'HClO hypochlorous acid', acidHCN: 'HCN hydrocyanic acid',
    s1readout: 'Ka = {ka} (pKa = {pka}): x = {x} mol per litre splits, α = {alpha}, about {per} in every 1000 molecules. pH = {ph}; a strong acid at the same concentration gives pH {phs}, a gap of {dph}.',
    s1hint: 'What to watch: keep the concentration at 0.10 mol/L and move only the Ka slider or tap an acid. Follow the dot on both curves. Below pKa 0, α is above 90% and the acid behaves almost like a strong one; beyond pKa 3 the split-share curve turns into a straight line: each +2 in pKa drops α by one gridline (to about a tenth) and raises pH by about 1. Ka sets the share, not the speed (step 4).',

    s2k: 'Step 2 · Dilution',
    s2t: 'Dilute acetic acid 100-fold. Does its pH rise by 2, as a strong acid’s would?',
    s2e: 'The question here: with Ka fixed and only the total concentration c changing, what happens to α and pH? The instant you dilute, [H⁺], [A⁻] and [HA] all shrink by the same factor. The Ka expression has two concentrations on top and one below, so a tenfold dilution cuts the <strong>reaction quotient Q</strong> (the same expression as Ka, filled with the concentrations right now rather than at equilibrium) to a tenth. With Q < Ka the net reaction runs toward splitting, and α grows. That is why pH rises more slowly than for a strong acid. When α is small, c − x ≈ c and the quadratic reduces to <strong>α ≈ √(Ka / c)</strong> (Ostwald’s dilution law): make c 100 times smaller and α grows 10 times, so [H⁺] falls only 10-fold and pH rises only about 1. Both charts use total concentration c on a log x-axis (more dilute to the right). In the split-share chart the solid line is the exact quadratic and the dashed line is the √(Ka/c) shortcut; in the pH chart the grey dashed line is a strong acid at the same c.',
    c2alpha: 'Split share α (%)',
    c2ph: 'pH',
    c2x: 'Total concentration c (mol/L)',
    lgApprox: 'Shortcut √(Ka/c)',
    cLabel: 'Total concentration c (log scale)',
    s2readout: '{acid}, c = {c} mol/L: α = {alpha} (the shortcut gives {approx}, off by {err}); pH = {ph}, against {phs} for a strong acid. Dilute another tenfold from here: Q drops to a tenth of Ka, the new equilibrium has α = {alpha10}, and pH rises by {dph10} (a strong acid rises by 1.00).',
    s2hint: 'What to watch: pick acetic acid and drag c from 1 mol/L all the way down to the most dilute setting (about 3×10⁻⁵ mol/L). The dot climbs along the solid split-share line. Solid and dashed lines agree for concentrated solutions and part ways once α gets large: the shortcut only holds while α is small. In the pH chart the weak-acid line is gentler than the grey strong-acid line, with about half its slope. Switch to HF and repeat: it approaches 100% much sooner.',
    quizPrompt: 'Quick check: dilute 0.10 mol/L acetic acid to 0.0010 mol/L (100-fold). Roughly how much does pH rise?',
    quizA: 'By 2, same as a strong acid', quizB: 'By about 1', quizC: 'Not at all, since Ka is unchanged',
    check: 'Check',
    quizRight: 'Right. pH goes from {ph1} to {ph2}, a rise of only {d}: dilution pushes α from {a1} up to {a2}, which undoes about half of the dilution.',
    quizWrong: 'Look at the pH chart again: from c = 0.1 to 0.001 the weak-acid line rises by {d}, about half as much as the grey strong-acid line. The reason is that α grows from {a1} to {a2}.',
    quizNone: 'Pick an option first.',

    s3k: 'Step 3 · Common ion',
    s3t: 'Add the acid’s own A⁻ to the solution. Do more molecules split, or fewer?',
    s3e: 'The question here: how does the balance shift when extra A⁻ is already present? Dissolve a salt such as NaA, for example: it splits completely into Na⁺ and A⁻, and that A⁻, shared with the weak acid, is called a <strong>common ion</strong>. At the instant you add the salt nothing has reacted yet, but [A⁻] is higher, so the <strong>reaction quotient Q</strong> (the Ka expression filled with current concentrations) now exceeds Ka. At the molecular level, every H⁺ meets A⁻ more often: rejoining outpaces splitting, the number of split molecules falls, and it keeps falling until both directions match again (' + a('eq2', '→ Chemical equilibrium, step 2: how a system settles after you add more') + '). The simulation reuses the 200 molecules from step 0 (the chlorous-acid-like weak acid at 0.10 mol/L). The small green dots under the grid are the added A⁻; each also stands for 0.0005 mol/L. Na⁺ takes no part and is not drawn.',
    c3grid: '200 acid molecules + added A⁻ (small green dots)',
    lgExtra: 'Added A⁻ (from NaA)',
    sLabel: 'Added A⁻ concentration s',
    reset3: 'Back to s = 0',
    s3readout: 's = {s} mol/L · split now: {n}/{N} (α = {alpha}) · forward {fwd}/s, reverse {rev}/s · equilibrium equation: α = {eq} (no salt: {eq0}), pH = {ph} (no salt: {ph0}). {qk}',
    qkUp: 'At the moment s last changed (using the equilibrium concentrations just before), Q/Ka = {q}: above 1, so the net reaction runs in reverse and fewer molecules stay split.',
    qkDown: 'At the moment s last changed (using the equilibrium concentrations just before), Q/Ka = {q}: below 1, so the net reaction runs forward and more molecules split.',
    qkNone: 's has not changed yet: Q/Ka just wobbles around 1.',
    s3acetic: 'The same logic applies to acetic acid: 0.10 mol/L acetic acid has pH {ph0} and α = {a0}; dissolve 0.10 mol/L sodium acetate as well (extra A⁻) and the pH becomes {ph1}, with α down to {a1}. That mixture is where buffers begin ({link}).',
    bufLink: '→ Buffer capacity, step 1: the A⁻ : HA ratio sets the pH',
    s3hint: 'What to watch: wait for the green split-share line to flatten, then drag s from 0 to 0.10. In the events chart the cyan line (rejoins) jumps above the orange one (splits) and the green line drops; when the two event lines meet again, the green line settles on the new white dashed level. Press “Back to s = 0” and it runs the other way: orange leads and the green line climbs back.',

    s4k: 'Step 4 · End point vs speed',
    s4t: 'Does a large Ka mean the acid splits quickly?',
    s4e: 'The question here: does Ka decide where the balance lands, or how fast it gets there? The simulation has two chance settings: <strong>kf</strong> is the chance per second that an HA splits, and <strong>kr</strong> sets how often H⁺ and A⁻ rejoin. At equilibrium both directions run at the same rate, kf·[HA] = kr·[H⁺][A⁻], which rearranges to [H⁺][A⁻]/[HA] = kf/kr. So <strong>Ka = kf / kr</strong>: it is only a ratio. Below, groups A and B (400 molecules each) start together with every molecule intact. A stays fixed (the step 0 settings). For B you can change only the speed (kf and kr multiplied by the same factor, so their ratio Ka is unchanged) or only Ka (kf kept, kr changed). Why reactions run fast or slow has its own lesson (' + a('rate0', '→ Reaction rates, step 0: counting successful collisions') + '); a catalyst speeds up both directions at once, which is exactly the “speed only” change (' + a('act3', '→ Activation energy, step 3: catalysts') + ').',
    c4: 'Split share α (%) · x-axis: time since the joint start (s)',
    lgA: 'Group A (fixed)', lgB: 'Group B (adjustable)', lgLevelA: 'A’s equilibrium value', lgLevelB: 'B’s equilibrium value',
    speedLabel: 'Group B speed factor (kf and kr together)', kaBLabel: 'Group B Ka',
    rerun: 'Start both again',
    s4readout: 'A: Ka = {kaA}, speed ×1 → equilibrium α = {aA}, reaches 90% of it in about {tA} s. B: Ka = {kaB}, speed ×{sp} → equilibrium α = {aB}, in about {tB} s. {verdict}',
    s4progress: 'Simulated {t} / {T} s.',
    vSame: 'Both groups have the same settings; the lines differ only by random wobble.',
    vSpeed: 'Same Ka, different speed: the same end point, B just gets there sooner or later.',
    vKa: 'Same speed, different Ka: different end points. Ka decides where it stops.',
    vBoth: 'Both changed: the end point depends on Ka alone; the arrival time depends on both the speed factor and Ka.',
    s4hint: 'What to watch: first drag only the speed factor to ×4. In the split-share chart the orange line (B) flattens before the cyan line (A) but on the same dashed level. Then set the speed back to ×1 and move only Ka: both lines start together but settle at different heights. Every slider change restarts both groups together.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Splitting and rejoining never stop; Ka decides where they break even',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: a weak acid splits and rejoins at the same time; the split share levels off when both run at the same rate per second, and it lands in the same place whichever end you start from. <strong>Step 1</strong>: Ka sets that share: at 0.10 mol/L, every +2 in pKa cuts α to about a tenth and raises pH by about 1. <strong>Step 2</strong>: dilution drops Q below Ka and α grows, so a 100-fold dilution raises a weak acid’s pH by only about 1. <strong>Step 3</strong>: adding the common ion A⁻ lifts Q above Ka, rejoining wins, α shrinks and pH rises. <strong>Step 4</strong>: Ka is just the ratio of the forward and reverse chances; speeding up both together moves the arrival time, not the end point.',
    formula: 'Ka = [H⁺][A⁻] / [HA]\nx² + (Ka + s)·x − Ka·c = 0\nα = x / c   pH = −log x',
    boundary: 'Scope: 25 °C; the solution is treated as ideal (concentrations stand in for activities); water’s own ionisation is ignored. Every case on this page has [H⁺] ≥ 10⁻⁶ mol/L, where the full solution including water differs by less than 1%, but more dilute or weaker acids need water included (' + a('ph4', '→ pH scale, step 4: why diluting an acid never makes it basic') + '). Dilution and added salt change concentrations only; volume changes are ignored. The molecule counts, chance settings and time in the simulations are teaching choices: real solutions split and rejoin far faster, and only their ratio, Ka, matches a real equilibrium.',
    linksTitle: 'Where to go next',
    lk1: '→ Chemical equilibrium, step 2: how equilibrium shifts when you add more (Le Chatelier)',
    lk2: '→ Buffer capacity, step 1: the A⁻ : HA ratio sets the pH',
    lk3: '→ Titration curves, step 2: why titrating a weak acid gives a different curve',
    lk4: '→ pH scale, step 4: no amount of dilution turns an acid basic',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Acid–Base Equilibrium · Molecules Move Both Ways”.'
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
  if (typeof window.refreshAcidBase === 'function') window.refreshAcidBase();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS, LINK };
if (typeof window !== 'undefined') window.ACID_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
