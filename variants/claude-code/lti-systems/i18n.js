'use strict';
// LTI lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const RULES = {
  rule_echo: 'y[n] = x[n] + 0.5·x[n−3]',
  rule_smooth: 'y[n] = 0.6·y[n−1] + 0.4·x[n]',
  rule_smoothA: 'y[n] = {a}·y[n−1] + {b}·x[n]',
  rule_diff: 'y[n] = x[n] − x[n−1]',
  rule_square: 'y[n] = x[n]²',
  rule_clip: 'y[n] = max(−1, min(1, x[n]))',
  rule_offset: 'y[n] = x[n] + 0.5',
  rule_warm: 'y[n] = (1 + n/8)·x[n]',
  formula: 'x[n] = Σₖ x[k]·δ[n−k]\ny[n] = Σₖ x[k]·h[n−k]\ns[n] = Σₖ≤ₙ h[k]\nH(ω) = Σₙ h[n]·e^(−jωn)'
};

const STRINGS = {
  zh: {
    ...RULES,
    pageTitle: '冲激与 LTI · 一巴掌认出一个系统',
    back: '← 知识索引',
    compare: '对照另一版本：冲激与 LTI · 给系统一巴掌 →',
    navLabel: 'LTI 系统步骤导航',
    tagline: '面前有一只黑盒子：能往里送一串数，能读出它吐回的一串数，但看不到里面。要预测它对任意输入的反应，得做多少次实验？如果盒子是线性时不变的，一次就够：拍它一下，录下回应 h。本页先亲手验证这件事，再找出哪些盒子不配享受这种待遇，最后从 h 里直接读出盒子的性格。',
    nav0: '0 拆成冲激', nav1: '1 拍一下', nav2: '2 公理体检', nav3: '3 阶跃响应', nav4: '4 因果与稳定', nav5: '5 正弦进出', nav6: '6 收束',
    ruleLabel: '盒子内部规则（只用来核对，预测时不看）：',
    box_echo: '回声室', box_smooth: '平滑器', box_diff: '差分器', box_square: '平方器', box_clip: '限幅器', box_offset: '加偏置', box_warm: '预热放大器',
    pass: '通过 ✓', fail: '失败 ✗',

    s0k: '第 0 步 · 积木',
    s0t: '任意一串输入，能不能拆成一个个「单独的脉冲」？',
    s0e: '这一步要回答：任意一串数 x[0], x[1], …, x[7]，能否写成同一种最简单信号经过平移、缩放后的和？本页的信号都是<strong>离散序列</strong>：每个整数时刻 n 取一个数，记作 x[n]。最简单的信号是<strong>单位冲激</strong> δ[n]：只在 n = 0 处等于 1，其余时刻都是 0；δ[n − k] 就是把这个脉冲挪到时刻 k。再乘上 x[k]，这一块 x[k]·δ[n − k] 只在 n = k 处取值 x[k]，别处全是 0。把 k = 0 到 7 的 8 块加起来，每个时刻恰好只有一块不为 0，所以 <strong>x[n] = Σₖ x[k]·δ[n − k]</strong>（Σₖ 表示对所有 k 求和）。这一步只做拆分，还没有用到任何盒子。',
    s0count: '已放入的冲激块数 c',
    play0: '逐块放入', next0: '换一个输入',
    c0a: '最新放入的一块 x[k]·δ[n−k]', c0b: '前 c 块之和（虚线圈 = 原输入 x）',
    s0lgPiece: '最新一块', s0lgSum: '前 c 块之和', s0lgX: '原输入 x[n]',
    s0readout0: '还没有放入任何一块：部分和处处为 0。',
    s0readout: '已放入 {c}/8 块。最新一块是 x[{k}]·δ[n − {k}]，只在 n = {k} 处等于 {v}。部分和在 n = 0…{k} 上与 x 逐点相同，n > {k} 处仍是 0。',
    s0readoutFull: '8/8 块全部放入：部分和与 x 在每个时刻都相同（最大差 {e}），x[n] = Σₖ x[k]·δ[n − k] 成立。',
    s0hint: '观察顺序：先把滑杆拖到 0，再一格一格往右拖，或者按「逐块放入」。上图每次只有一根橙色竖线，位置跟着 k 走；下图的青色部分和从左往右逐格长成虚线圈画出的 x。按「换一个输入」换一组 x 再试，结论不变。下一步的盒子吃的就是这里选定的 x。',

    s1k: '第 1 步 · 一巴掌',
    s1t: '只拍一下，能不能预测盒子对整串输入的回答？',
    s1e: '这一步要回答：只做一次实验——送进 δ[n]、录下输出——能不能算出盒子对上一步那串 x 的输出？这次实验的输出叫<strong>冲激响应</strong> h[n]，即盒子对单位冲激（只在 n = 0 处为 1 的脉冲）的回答。先假设盒子有两条性质。<strong>线性</strong>：输入放大 a 倍，输出也放大 a 倍；两个输入相加，输出就是各自输出相加。<strong>时不变</strong>：输入晚 k 步送进去，输出只是整体晚 k 步，形状不变。两条都满足的盒子叫 <strong>LTI 系统</strong>（linear time-invariant，线性时不变）。于是第 k 块 x[k]·δ[n − k] 的回答就是 x[k]·h[n − k]，整串输入的回答是这些回答之和：<strong>y[n] = Σₖ x[k]·h[n − k]</strong>，这个运算叫<strong>卷积</strong>（<a class="xlink" href="../../../signal/systems/convolution/#step2">→ 卷积页第 2 步：这个和怎样逐项计算</a>）。下面三个盒子都是 LTI 的。按钮下方写着它们的内部规则，但预测<strong>只用录到的 h</strong>；「实际输出」是按内部规则真跑出来的。',
    slap1: '拍一下（送入 δ[n]）', pred1: '用 h 预测', run1: '让盒子真跑一遍',
    c1a: '录到的冲激响应 h[n]', c1b: '要预测的输入 x[n]（第 0 步选定）', c1c: '输出：h 预测（圈）与实际（实心）',
    s1lgH: 'h[n]', s1lgX: '输入 x[n]', s1lgPred: '用 h 算出的预测', s1lgAct: '盒子实际输出',
    s1wait: '还没录 h：先按「拍一下」。',
    s1progress: '正在录 h：{c}/{N} 个时刻。',
    s1h: '录到 h = [{h}]（n = 0…15；盒子不会提前响应，所以更晚的样本不影响这 16 格的预测）。',
    s1pred: '预测 y = [{y}]。',
    s1cmp: '实际输出与预测逐点比较，最大差 = {e}：{verdict}',
    s1same: '完全重合，差值只是浮点舍入。', s1off: '对不上。',
    s1hint: '观察顺序：选一个盒子 → 按「拍一下」，看上图绿色的 h 一格格录下来 → 按「用 h 预测」，下图出现橙色空心圈 → 按「让盒子真跑一遍」，青色实心竖线正好落进圈里。换盒子要重新拍；回第 0 步「换一个输入」，预测和实际会一起变，仍然重合。整个预测只用到 16 个数 h[0…15]。',

    s2k: '第 2 步 · 公理体检',
    s2t: '哪些盒子配得上「拍一下就够」？',
    s2e: '这一步要回答：上一步的预测靠的是线性、时不变两条假设；盒子不满足时，哪项检验会失败，用 h 预测又差多少？每个盒子做三项体检，都用两段固定的测试信号 x₁、x₂，x₁ 可以用滑杆放大 A 倍；S(·) 表示「送进盒子后的输出」。<strong>叠加检验</strong>（查线性）：比较「先混合再送入」S(A·x₁ + x₂) 与「分别送入再混合」A·S(x₁) + S(x₂)。<strong>平移检验</strong>（查时不变）：比较「输入晚 d 步再送入」与「输出晚 d 步」，只在两边都有定义的 n = d…15 上比。<strong>用 h 预测</strong>：拍一下录下 h（冲激响应），把 A·x₁ + x₂ 与 h 做卷积，再和实际输出比。三项都看两条路线的<strong>最大逐点差</strong>：小于 10⁻⁹（只剩浮点舍入）记为通过 ✓，否则记为失败 ✗，并写出差值。',
    testSup: '叠加检验', testShift: '平移检验', testPred: '用 h 预测',
    A2: 'x₁ 的放大倍数 A', d2: '平移步数 d（只用于平移检验）',
    c2a_sup: '送入的信号 A·x₁ + x₂', c2a_shift: '送入 x = A·x₁ + x₂ 与晚 d 步的 x', c2a_pred: '送入的信号 A·x₁ + x₂',
    c2b_sup: '先混后送（实心）vs 先送后混（圈）', c2b_shift: '输入晚 d 步（实心）vs 输出晚 d 步（圈）', c2b_pred: '实际输出（实心）vs h 预测（圈）',
    s2lgIn: '送入的信号', s2lgDelayed: '晚 d 步的输入', s2lgR1: '实心：第一条路线', s2lgR2: '圈：第二条路线', s2lgBad: '粉色：两条路线对不上的时刻',
    s2readout: '{box} · {test}（A = {A}{dpart}）：最大逐点差 = {res} → {verdict}',
    s2dpart: '，d = {d}，比较 n = {d}…15',
    boardTitle: '体检记录（每格是你最近一次做这项检验的结果）',
    bBox: '盒子', cellNone: '未测', cellPass: '✓（A = {A}）', cellFail: '✗ 差 {res}（A = {A}）',
    s2hint: '观察顺序：先保持 A = 1，把每个盒子的三项检验各点一次，看下表怎样填满：回声室、平滑器、差分器全部通过；平方器和加偏置过不了叠加，预热放大器过不了平移，这三个用 h 预测也都对不上。再选限幅器，只拖 A：A ≤ 1.25 时信号从没超过 ±1，三项全部通过；A ≥ 1.5 起叠加和预测同时失败，A 越大差得越多。可见一个盒子算不算 LTI，有时取决于输入有多大。',

    s3k: '第 3 步 · 换一种试探',
    s3t: '拍不出理想的冲激，推一下行不行？',
    s3e: '这一步要回答：真实设备很难产生只占一个时刻的冲激，却很容易产生「从某时刻起一直保持为 1」的输入；用它能不能同样认出 LTI 盒子？这种输入叫<strong>单位阶跃</strong> u[n]：n ≥ 0 时为 1，n < 0 时为 0；盒子对它的输出叫<strong>阶跃响应</strong> s[n]。阶跃正好是一串冲激之和：u[n] = δ[n] + δ[n − 1] + δ[n − 2] + …。按线性和时不变，s[n] 就是 h（冲激响应，盒子对单个脉冲的回答）的<strong>累加</strong>：s[n] = h[0] + h[1] + … + h[n]。反过来，相邻两格相减就退回 h：h[n] = s[n] − s[n − 1]。一直累加下去得到的 Σh 叫<strong>直流增益</strong>：恒定输入经过足够长时间后被放大的倍数。',
    a3: '平滑器的系数 a（只对平滑器有效）',
    acc3: '逐项累加 h',
    c3a: '冲激响应 h[n]', c3b: 'h 的累加（实心）vs 实测 s[n]（圈）',
    s3lgH: 'h[n]', s3lgCum: 'h 的累加', s3lgMeas: '实测：送入 u[n] 的输出',
    s3progress: '已累加 {c}/{N} 项。',
    s3readout: '{prog}{box}：实测 s[15] = {s}；h 的累加与实测的最大差 = {e1}，差分 s[n] − s[n−1] 与 h 的最大差 = {e2}。直流增益 Σh = {dc}{note}',
    s3noteSlow: '；s[15] 离它还差 {gap}，因为 h 衰减得慢（a 越接近 1，h 拖得越长）。',
    s3hint: '观察顺序：按「逐项累加 h」，上图绿色的 h 每加进一项，下图青色台阶就长一格，并正好落进橙色圈（真送阶跃量到的输出）。然后换盒子：回声室最终停在 1.5（= 1 + 0.5）；差分器只在 n = 0 跳一下就回到 0，它对恒定输入完全没有反应，直流增益为 0。选平滑器再拖 a：a 越大，h 越矮、拖得越长，阶跃响应爬得越慢，但终点都是 1。',

    s4k: '第 4 步 · 读性格',
    s4t: '只看 h，能判断盒子会不会「提前反应」或「失控」吗？',
    s4e: '这一步要回答：拿到一条冲激响应 h（盒子对 n = 0 处单个脉冲的回答），不再做任何实验，能否判断两件事？<strong>因果</strong>：输出不早于输入，即 n < 0 时 h[n] = 0；实时运行的设备只能是因果的，因为它用不到还没到来的输入。<strong>稳定</strong>（这里指 BIBO 稳定：有界输入必得有界输出）：只要输入始终满足 |x| ≤ 1，输出就不会无限变大。这一步直接用 h 来定义盒子：n ≥ n₀ 时 h[n] = r^(n − n₀)，n < n₀ 时为 0；r 决定每过一步衰减还是放大，n₀ 决定从哪一刻开始响应。对任何 |x| ≤ 1 的输入，|y[n]| 都不超过 |h| 的累加 Σₖ≤ₙ |h[k]|，而让 x[n − k] 取 h[k] 的正负号就能恰好达到，所以下图画的是<strong>最坏情况下的输出大小</strong>。稳定 ⟺ Σ|h| 有限；对这里的 h，就是 |r| < 1，此时上限为 1/(1 − |r|)。',
    r4: '每步倍数 r', n04: '开始响应的时刻 n₀',
    c4a: 'h[n] = r^(n−n₀)，n ≥ n₀（过高处截断）', c4b: '最坏情况 |y[n]| = Σₖ≤ₙ |h[k]|，|x| ≤ 1',
    s4lgH: 'h[n]（n ≥ 0）', s4lgEarly: '巴掌之前的响应（n < 0）', s4lgAcc: '最坏情况的输出大小', s4lgBound: '上限 1/(1 − |r|)', s4lgSlap: '巴掌时刻 n = 0',
    s4readout: '{causal}　{stable}',
    s4causal: '因果：h 从 n = 0 才开始。',
    s4noncausal: '非因果：h 在巴掌之前 {e} 个时刻（n = {n0}）就开始响应，实时设备做不到，只能先把数据存下来再离线处理。',
    s4stable: '稳定：|r| = {ar} < 1，h 的前 31 项 Σ|h| = {tot}，无论加多少项都不超过 {bound}。',
    s4unstable: '不稳定：|r| = {ar} ≥ 1，h 的前 31 项 Σ|h| = {tot}，继续加下去会无限增大。',
    s4hint: '观察顺序：先保持 n₀ = 0，把 r 从 0.8 慢慢拖向 1：下图青色曲线升得越来越高，虚线上限 1/(1 − |r|) 也跟着抬高；r = 1 时 h 不再衰减，曲线变成一直上升的斜线，虚线消失。再把 r 拖到负数：h 正负交替，但 |h| 与 r 取正值时相同，所以稳定与否只看 |r|。最后把 n₀ 拖到负数：粉色竖线出现在 n < 0，盒子「先于巴掌」响应，是非因果的；n₀ 只是平移 h，前 31 项 Σ|h| 不变，可见因果和稳定是两件独立的事。',

    s5k: '第 5 步 · 正弦进，正弦出',
    s5t: '送进一条正弦，LTI 盒子会吐出什么？',
    s5e: '这一步要回答：把输入换成余弦 A·cos(ωn)，LTI 盒子的输出是不是同一频率的余弦？<strong>频率</strong> ω 是每个样本转过的角度（单位：弧度/样本），ω = π 是最快的正负来回翻转；这里取 ω = 2π·m/64，m 是整数。输入从 n = 0 开始送 128 个样本，只分析后 64 个（n = 64…127）：那时开头的过渡已经消失，叫<strong>稳态</strong>。中图是这 64 个输出样本的<strong>频谱</strong>：把输出拆成不同频率的余弦，每根竖线的高度是那个频率的振幅。LTI 盒子的回答是：输出只在输入频率上有成分，振幅乘一个增益，相位挪一点；增益和相位合成一个复数 <strong>H(ω) = Σₙ h[n]·e^(−jωn)</strong>，叫<strong>频率响应</strong>，可以直接由 h（冲激响应）算出（<a class="xlink" href="../../../signal/systems/frequency-response/#step0">→ 频率响应页第 0 步：逐个频率量放行率</a>）。非 LTI 盒子则会造出输入里没有的频率。',
    m5: '输入频率 ω = 2π·m/64，m', A5: '输入振幅 A',
    c5a: '稳态 n = 64…95：输入（灰）与输出（青）', c5b: '输出频谱，横轴 ω/π（橙 = 输入频率）', c5c: '输入频率处增益（点）与 |H(ω)|（线）',
    s5lgIn: '输入 A·cos(ωn)', s5lgOut: '盒子输出', s5lgBin: '输入频率处的谱线', s5lgH: '|H(ω)|（只给 LTI 盒子画）',
    s5readout: '{box} · ω = {w}π：输入频率处增益 {g}，相位 {ph}；{H}输出功率中有 {o}% 落在输入频率以外{nb}。',
    s5phase: '{p}°', s5nophase: '无（该频率没有输出）',
    s5H: '由 h 算出 |H(ω)| = {hm}、∠H = {hp}°，与实测一致；',
    s5noH: '这个盒子不是 LTI，h 预测不了它；',
    s5nb: '（新出现的频率 ω/π = {list}）',
    s5hint: '观察顺序：选平滑器，只拖 m：中图始终只有一根橙色竖线，下图白点沿白线 |H(ω)| 走，频率越高放行越少。换成差分器正好相反，越高频放大越多，接近 π 时接近 2；回声室的 |H| 在 0.5 和 1.5 之间起伏。然后换成平方器：输入频率处空空如也，能量全跑到 ω = 0 和 2ω 上（2ω 超过 π 时折回 2π − 2ω）。限幅器在 A ≤ 1 时和直通一样；A 一旦超过 1，就冒出 3ω、5ω 等奇数倍频率（同样会折回）。唯一的例外是 m = 16（ω = π/2）：样本只取 ±A 和 0，削顶后仍是同频余弦，只是增益降为 1/A，可它照样不是 LTI，因为增益随 A 变了。预热放大器的增益随时间变，输入频率两旁多出一串小竖线。',

    s6k: '第 6 步 · 收束',
    s6t: 'h 就是 LTI 盒子的完整档案',
    s6fin: '<strong>第 0 步</strong>：任何输入都是一串缩放、平移后的冲激。<strong>第 1 步</strong>：盒子若线性且时不变，每块冲激的回答就是缩放、平移后的 h，加起来就是卷积 y = x ∗ h，一次实验就预测了整串输出。<strong>第 2 步</strong>：两条公理都能用实验证伪；平方器、加偏置垮在线性，预热放大器垮在时不变，限幅器只在小信号下合格；公理一垮，用 h 预测就失效。<strong>第 3 步</strong>：阶跃响应是 h 的累加，h 是阶跃响应的差分，两种实验等价。<strong>第 4 步</strong>：因果看 n < 0 时 h 是否为 0，稳定看 Σ|h| 是否有限。<strong>第 5 步</strong>：正弦进 LTI 盒子，出来还是同频正弦，增益和相位由 H(ω) 给出；出现新频率，就是非线性或时变的证据。',
    boundary: '适用范围：本页只讨论离散时间、从静止（零状态）开始运行的盒子。「一次实验就够」只对 LTI 盒子成立，严格说需要 h 的全部样本；本页窗口内的预测只用到 h[0…15]，是因为这些盒子都是因果的。第 2 步的「通过」只是说在这两段测试信号、这几个 A 和 d 下逐点差小于 10⁻⁹：实验只能证伪公理，不能证明公理；限幅器的结论只覆盖 |x| ≤ 1 的输入。第 4 步的稳定指 BIBO 稳定。第 5 步取 ω = 2π·m/64，让 64 个样本恰好装下整数个周期，频谱没有泄漏；换成别的频率，谱线会向两侧摊开，那是分析窗口造成的，不是盒子造出的新频率。',
    linksTitle: '接着去哪',
    lk1: '→ 卷积页第 2 步：y[n] 这个和怎样按列逐项算',
    lk2: '→ 频率响应页第 0 步：逐个频率量出盒子的放行率',
    lk3: '→ z 变换页第 4 步：极点、h 与频响是同一件事的三面',
    lk4: '→ 阶跃响应页第 0 步：二阶系统怎样追上突然跳变的目标',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《冲激与 LTI · 给系统一巴掌》的平行版本。'
  },
  en: {
    ...RULES,
    pageTitle: 'Impulse & LTI · One Slap to Know a System',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Impulse & LTI · Slap the System →',
    navLabel: 'LTI lesson steps',
    tagline: 'You are handed a black box. You can feed it a sequence of numbers and read the sequence it sends back, but you cannot look inside. How many experiments does it take to predict its answer to any input? If the box is linear and time-invariant, exactly one: slap it once and record the reply, h. This page checks that claim by hand, catches the boxes that don’t qualify, and then reads a box’s character straight off h.',
    nav0: '0 Impulses', nav1: '1 One slap', nav2: '2 Axiom check', nav3: '3 Step response', nav4: '4 Causal & stable', nav5: '5 Sines in', nav6: '6 Wrap-up',
    ruleLabel: 'The box’s internal rule (for checking only; predictions never read it): ',
    box_echo: 'Echo room', box_smooth: 'Smoother', box_diff: 'Differencer', box_square: 'Squarer', box_clip: 'Clipper', box_offset: 'Offset', box_warm: 'Warming amp',
    pass: 'pass ✓', fail: 'fail ✗',

    s0k: 'Step 0 · Building blocks',
    s0t: 'Can any input be taken apart into single pulses?',
    s0e: 'This step asks: can an arbitrary list x[0], x[1], …, x[7] be written as a sum of shifted, scaled copies of one very simple signal? Every signal on this page is a <strong>discrete sequence</strong>: one number at each whole-number time n, written x[n]. The simplest signal is the <strong>unit impulse</strong> δ[n]: it equals 1 at n = 0 and 0 everywhere else, and δ[n − k] is the same pulse moved to time k. Multiply by x[k] and the piece x[k]·δ[n − k] holds the value x[k] at n = k and nothing anywhere else. Add the eight pieces for k = 0 to 7: at every time exactly one piece is non-zero, so <strong>x[n] = Σₖ x[k]·δ[n − k]</strong> (Σₖ means “sum over every k”). This step only takes the input apart; no box is involved yet.',
    s0count: 'Pieces placed, c',
    play0: 'Place pieces one by one', next0: 'Try another input',
    c0a: 'The newest piece x[k]·δ[n−k]', c0b: 'First c pieces summed (rings: input x)',
    s0lgPiece: 'Newest piece', s0lgSum: 'Sum of first c pieces', s0lgX: 'Input x[n]',
    s0readout0: 'No pieces placed yet: the partial sum is zero everywhere.',
    s0readout: '{c}/8 pieces placed. The newest is x[{k}]·δ[n − {k}], equal to {v} at n = {k} and zero elsewhere. On n = 0…{k} the partial sum matches x point for point; beyond n = {k} it is still 0.',
    s0readoutFull: 'All 8/8 pieces placed: the partial sum equals x at every time (largest difference {e}), so x[n] = Σₖ x[k]·δ[n − k] holds.',
    s0hint: 'What to watch: drag the slider to 0, then step it right one notch at a time, or press “Place pieces one by one”. The top chart only ever holds one orange stem, and it moves with k; in the bottom chart the cyan partial sum grows left to right into the x drawn by the dashed rings. Press “Try another input” and repeat: nothing changes. The boxes in the next step eat whichever x you leave here.',

    s1k: 'Step 1 · One slap',
    s1t: 'From a single slap, can you predict the box’s answer to a whole input?',
    s1e: 'This step asks: after a single experiment — feed in δ[n], record what comes out — can you work out how the box will answer the x from step 0? The recorded output is the <strong>impulse response</strong> h[n], the box’s reply to a unit impulse (a single 1 at n = 0). Now assume two things about the box. <strong>Linear</strong>: scale the input by a and the output scales by a; add two inputs and the outputs add. <strong>Time-invariant</strong>: feed the input k steps later and the output simply arrives k steps later, unchanged in shape. A box with both properties is an <strong>LTI system</strong>. Then piece k, x[k]·δ[n − k], must be answered by x[k]·h[n − k], and the whole input by the sum of those answers: <strong>y[n] = Σₖ x[k]·h[n − k]</strong>. That operation is <strong>convolution</strong> (<a class="xlink" href="../../../signal/systems/convolution/#step2">→ Convolution, step 2: working the sum term by term</a>). All three boxes below are LTI. Their internal rules are printed under the buttons, but the prediction uses <strong>only the recorded h</strong>; the “actual output” is the box running its own rule.',
    slap1: 'Slap it (feed δ[n])', pred1: 'Predict from h', run1: 'Run the box for real',
    c1a: 'Recorded impulse response h[n]', c1b: 'Input x[n] from step 0', c1c: 'Output: predicted (rings), actual (solid)',
    s1lgH: 'h[n]', s1lgX: 'Input x[n]', s1lgPred: 'Prediction from h', s1lgAct: 'Box’s actual output',
    s1wait: 'No h recorded yet: press “Slap it” first.',
    s1progress: 'Recording h: {c}/{N} samples.',
    s1h: 'Recorded h = [{h}] (n = 0…15; the box never answers early, so later samples cannot affect these 16 predictions).',
    s1pred: 'Predicted y = [{y}].',
    s1cmp: 'Actual output against the prediction, largest point-by-point gap = {e}: {verdict}',
    s1same: 'a perfect match; the gap is floating-point round-off.', s1off: 'they disagree.',
    s1hint: 'What to watch: pick a box → press “Slap it” and see the green h recorded sample by sample → press “Predict from h” and orange rings appear in the bottom chart → press “Run the box for real” and the solid cyan stems land inside the rings. A new box needs a new slap. Go back to step 0 and “Try another input”: prediction and reality change together and still coincide. The whole prediction used just 16 numbers, h[0…15].',

    s2k: 'Step 2 · Axiom check-up',
    s2t: 'Which boxes earn the “one slap is enough” deal?',
    s2e: 'This step asks: the prediction in step 1 rested on two assumptions, linearity and time invariance. When a box breaks one, which check fails, and how far off is the prediction from h? Each box gets three checks, all using two fixed test signals x₁ and x₂, with x₁ scaled by A on the slider; S(·) means “the box’s output when fed this”. <strong>Superposition</strong> (tests linearity): compare “mix, then feed” S(A·x₁ + x₂) with “feed separately, then mix” A·S(x₁) + S(x₂). <strong>Shift</strong> (tests time invariance): compare “delay the input by d, then feed” with “delay the output by d”, over n = d…15 where both exist. <strong>Predict from h</strong>: slap the box to record h (its impulse response), convolve A·x₁ + x₂ with h, and compare with the real output. Each check reports the <strong>largest point-by-point gap</strong> between its two routes: below 10⁻⁹ (round-off only) counts as a pass ✓, anything larger as a fail ✗ with the gap shown.',
    testSup: 'Superposition', testShift: 'Shift', testPred: 'Predict from h',
    A2: 'Scale on x₁, A', d2: 'Delay d (shift check only)',
    c2a_sup: 'Signal fed in: A·x₁ + x₂', c2a_shift: 'Fed in: x = A·x₁ + x₂ and x delayed by d', c2a_pred: 'Signal fed in: A·x₁ + x₂',
    c2b_sup: 'Mix→feed (solid) vs feed→mix (rings)', c2b_shift: 'Delay input (solid) vs delay output (rings)', c2b_pred: 'Actual (solid) vs predicted from h (rings)',
    s2lgIn: 'Signal fed in', s2lgDelayed: 'Input delayed by d', s2lgR1: 'Solid: first route', s2lgR2: 'Rings: second route', s2lgBad: 'Pink: where the routes disagree',
    s2readout: '{box} · {test} (A = {A}{dpart}): largest point-by-point gap = {res} → {verdict}',
    s2dpart: ', d = {d}, comparing n = {d}…15',
    boardTitle: 'Check log (each cell is your most recent run of that check)',
    bBox: 'Box', cellNone: 'not run', cellPass: '✓ (A = {A})', cellFail: '✗ gap {res} (A = {A})',
    s2hint: 'What to watch: keep A = 1 and run all three checks on every box, filling the table: echo room, smoother and differencer pass everything; the squarer and the offset fail superposition, the warming amp fails shift, and all three miss when predicted from h. Then pick the clipper and drag only A: up to A = 1.25 the signal never leaves ±1 and all three checks pass; from A = 1.5 superposition and prediction fail together, by more as A grows. Whether a box counts as LTI can depend on how hard you drive it.',

    s3k: 'Step 3 · A gentler probe',
    s3t: 'If you can’t produce a clean impulse, will a push do?',
    s3e: 'This step asks: real equipment struggles to make a pulse that lasts a single instant, but it easily makes an input that switches to 1 and stays there. Can that identify an LTI box just as well? That input is the <strong>unit step</strong> u[n]: 1 for n ≥ 0 and 0 for n < 0; the box’s output to it is the <strong>step response</strong> s[n]. A step is exactly a train of impulses: u[n] = δ[n] + δ[n − 1] + δ[n − 2] + …. By linearity and time invariance, s[n] is the <strong>running sum</strong> of h (the impulse response, the box’s reply to a single pulse): s[n] = h[0] + h[1] + … + h[n]. Going the other way, subtracting neighbours gives h back: h[n] = s[n] − s[n − 1]. The full sum Σh is the <strong>DC gain</strong>: how much a constant input is multiplied by once the box has settled.',
    a3: 'Smoother coefficient a (smoother only)',
    acc3: 'Add up h term by term',
    c3a: 'Impulse response h[n]', c3b: 'Sum of h (solid) vs measured s[n] (rings)',
    s3lgH: 'h[n]', s3lgCum: 'Running sum of h', s3lgMeas: 'Measured: output for u[n]',
    s3progress: '{c}/{N} terms added. ',
    s3readout: '{prog}{box}: measured s[15] = {s}; running sum of h vs measurement, largest gap = {e1}; difference s[n] − s[n−1] vs h, largest gap = {e2}. DC gain Σh = {dc}{note}',
    s3noteSlow: '; s[15] is still {gap} short of it because h decays slowly (the closer a is to 1, the longer h lingers).',
    s3hint: 'What to watch: press “Add up h term by term”. Each green term of h added in the top chart grows the cyan staircase below by one sample, landing exactly in the orange rings (the output actually measured with a step). Then switch boxes: the echo room settles at 1.5 (= 1 + 0.5); the differencer jumps at n = 0 and drops straight back to 0, because it ignores constant input entirely (DC gain 0). Choose the smoother and drag a: the larger a, the lower and longer h, the slower the step response climbs — yet it always ends at 1.',

    s4k: 'Step 4 · Reading character',
    s4t: 'From h alone, can you tell whether a box jumps the gun or runs away?',
    s4e: 'This step asks: given an impulse response h (the box’s reply to a single pulse at n = 0) and no further experiments, can you decide two things? <strong>Causal</strong>: the output never comes before the input, i.e. h[n] = 0 for n < 0. Anything running in real time must be causal, since it cannot use input that hasn’t arrived. <strong>Stable</strong> (here BIBO stable: bounded input in, bounded output out): as long as the input stays within |x| ≤ 1, the output cannot grow without limit. In this step the box is defined directly by its h: h[n] = r^(n − n₀) for n ≥ n₀ and 0 before. r sets whether each step shrinks or grows the response; n₀ sets when it starts. For any input with |x| ≤ 1, |y[n]| is at most the running sum of |h|, Σₖ≤ₙ |h[k]|, and choosing x[n − k] with the sign of h[k] reaches it exactly, so the bottom chart shows the <strong>worst-case output size</strong>. Stable ⟺ Σ|h| is finite; for this h that means |r| < 1, with the limit 1/(1 − |r|).',
    r4: 'Factor per step, r', n04: 'Response starts at n₀',
    c4a: 'h[n] = r^(n−n₀), n ≥ n₀ (tall stems clipped)', c4b: 'Worst-case |y[n]| = Σₖ≤ₙ |h[k]|, |x| ≤ 1',
    s4lgH: 'h[n] (n ≥ 0)', s4lgEarly: 'Response before the slap (n < 0)', s4lgAcc: 'Worst-case output size', s4lgBound: 'Limit 1/(1 − |r|)', s4lgSlap: 'The slap, n = 0',
    s4readout: '{causal}  {stable}',
    s4causal: 'Causal: h starts at n = 0.',
    s4noncausal: 'Not causal: h starts {e} samples before the slap (n = {n0}). No real-time device can do that; you would have to record the data and process it afterwards.',
    s4stable: 'Stable: |r| = {ar} < 1. The first 31 terms give Σ|h| = {tot}, and no number of terms will exceed {bound}.',
    s4unstable: 'Unstable: |r| = {ar} ≥ 1. The first 31 terms give Σ|h| = {tot}, and the sum keeps growing without limit.',
    s4hint: 'What to watch: keep n₀ = 0 and ease r from 0.8 towards 1. The cyan curve below climbs higher and the dashed limit 1/(1 − |r|) rises with it; at r = 1, h stops decaying, the curve becomes a line that never levels off, and the dashed limit disappears. Now drag r negative: h alternates in sign, but |h| is the same as for the positive r, so stability depends on |r| alone. Finally drag n₀ below zero: pink stems appear at n < 0 — the box answers before the slap, which is not causal. n₀ only shifts h, so the first-31-term Σ|h| is unchanged: causality and stability are separate questions.',

    s5k: 'Step 5 · Sine in, sine out',
    s5t: 'Feed an LTI box a sine wave — what comes out?',
    s5e: 'This step asks: if the input is a cosine A·cos(ωn), is an LTI box’s output a cosine of the same frequency? The <strong>frequency</strong> ω is the angle turned per sample (radians per sample); ω = π is the fastest possible flip between plus and minus. Here ω = 2π·m/64 with m a whole number. The input runs for 128 samples from n = 0 and only the last 64 (n = 64…127) are analysed, after the start-up transient has died away — the <strong>steady state</strong>. The middle chart is the <strong>spectrum</strong> of those 64 output samples: the output split into cosines of different frequencies, each stem as tall as that cosine’s amplitude. For an LTI box the answer is: the output has energy only at the input frequency, with its amplitude multiplied by a gain and its phase shifted a little. Together, gain and shift form one complex number, the <strong>frequency response</strong> <strong>H(ω) = Σₙ h[n]·e^(−jωn)</strong>, which you can compute straight from h, the impulse response (<a class="xlink" href="../../../signal/systems/frequency-response/#step0">→ Frequency response, step 0: measuring the pass rate one frequency at a time</a>). Boxes that aren’t LTI create frequencies that were never in the input.',
    m5: 'Input frequency ω = 2π·m/64, m', A5: 'Input amplitude A',
    c5a: 'Steady state n = 64…95: input (grey), output', c5b: 'Output spectrum vs ω/π (orange = input ω)', c5c: 'Gain at input ω (dots) and |H(ω)| (line)',
    s5lgIn: 'Input A·cos(ωn)', s5lgOut: 'Box output', s5lgBin: 'Stem at the input frequency', s5lgH: '|H(ω)| (LTI boxes only)',
    s5readout: '{box} · ω = {w}π: gain at the input frequency {g}, phase {ph}; {H}{o}% of the output power lies outside the input frequency{nb}.',
    s5phase: '{p}°', s5nophase: 'none (no output at this frequency)',
    s5H: 'h predicts |H(ω)| = {hm}, ∠H = {hp}°, matching the measurement; ',
    s5noH: 'this box isn’t LTI, so h can’t predict it; ',
    s5nb: ' (new frequencies at ω/π = {list})',
    s5hint: 'What to watch: pick the smoother and drag only m. The middle chart always shows a single orange stem, and the white dot below rides along the white |H(ω)| line: the higher the frequency, the less gets through. The differencer does the opposite, boosting high frequencies to nearly 2 near π; the echo room’s |H| swings between 0.5 and 1.5. Now switch to the squarer: nothing at all at the input frequency — the energy has moved to ω = 0 and 2ω (folding back to 2π − 2ω once 2ω passes π). The clipper behaves like a plain wire while A ≤ 1; push A past 1 and odd multiples 3ω, 5ω, … appear (folded back too). The lone exception is m = 16 (ω = π/2): the samples are only ±A and 0, so clipping leaves a cosine of the same frequency with gain 1/A — still not LTI, because that gain depends on A. The warming amp’s gain changes with time, so a row of small stems appears beside the input frequency.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'For an LTI box, h is the complete file',
    s6fin: '<strong>Step 0</strong>: every input is a train of shifted, scaled impulses. <strong>Step 1</strong>: if the box is linear and time-invariant, each impulse is answered by a shifted, scaled h, and adding them up is the convolution y = x ∗ h — one experiment predicts the whole output. <strong>Step 2</strong>: both axioms can be falsified by experiment; the squarer and the offset break linearity, the warming amp breaks time invariance, and the clipper only qualifies for small signals; once an axiom breaks, prediction from h fails. <strong>Step 3</strong>: the step response is the running sum of h and h is the difference of the step response, so the two experiments are equivalent. <strong>Step 4</strong>: causality is h = 0 for n < 0; stability is a finite Σ|h|. <strong>Step 5</strong>: a sine into an LTI box comes out as a sine of the same frequency, with gain and phase given by H(ω); new frequencies are evidence of nonlinearity or time variation.',
    boundary: 'Scope: this page covers discrete-time boxes that start from rest (zero state). “One experiment is enough” holds only for LTI boxes and, strictly, needs every sample of h; predictions inside this page’s window use only h[0…15] because every box here is causal. A “pass” in step 2 means the gap stayed below 10⁻⁹ for these two test signals and these values of A and d: experiments can falsify the axioms, never prove them, and the clipper’s pass covers only inputs with |x| ≤ 1. Stability in step 4 means BIBO stability. Step 5 uses ω = 2π·m/64 so that 64 samples hold a whole number of cycles and the spectrum shows no leakage; at other frequencies the stems smear sideways — an artefact of the analysis window, not new frequencies made by the box.',
    linksTitle: 'Where to go next',
    lk1: '→ Convolution, step 2: computing the sum for y[n] column by column',
    lk2: '→ Frequency response, step 0: measuring a box’s pass rate one frequency at a time',
    lk3: '→ z-transform, step 4: poles, h and the frequency response are one thing seen three ways',
    lk4: '→ Step response, step 0: how a second-order system chases a target that jumps',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Impulse & LTI · Slap the System”.'
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
  if (typeof window.refreshLTI === 'function') window.refreshLTI();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS, RULES };
if (typeof window !== 'undefined') window.LTI_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
