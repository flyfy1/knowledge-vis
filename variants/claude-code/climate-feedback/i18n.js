'use strict';
// Climate feedback lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '气候反馈 · 一本要重新配平的能量账',
    back: '← 知识索引',
    compare: '对照另一版本：气候反馈 · 一笔一笔对上能量账 →',
    navLabel: '气候反馈步骤导航',
    tagline: '地球从太阳收进多少能量，就要以红外线放出多少，账才是平的。多加 CO₂，支出先少了一截，账上出现盈余，地球只能靠变暖把账配平；可变暖本身又会改动账上的冰雪、水汽和云这几笔，这就是反馈。七步里你会一笔一笔记账，算出 CO₂ 加倍后地球要暖多少、为什么不是马上暖到、排放又怎样让账越记越大。',
    nav0: '0 账上的缺口', nav1: '1 只靠变暖配平', nav2: '2 一轮一轮的反馈', nav3: '3 反馈清单', nav4: '4 海洋拖慢', nav5: '5 碳从哪来', nav6: '6 收束',

    s0k: '第 0 步 · 账本的两栏',
    s0t: 'CO₂ 加倍，地球的能量账会差多少？再加倍一次呢？',
    s0e: '这一步要回答：把大气中的 CO₂ 从工业革命前的 280 ppm 加倍到 560 ppm，地球的能量账会出现多大的缺口？（ppm：每一百万个空气分子中有几个 CO₂ 分子。）账本有两栏，都按全球平均、每平方米计。<strong>收入</strong>是吸收的太阳光：太阳常数 1361 W/m² 摊到整个球面再扣掉约 30% 被反射的部分，约 238 W/m²（W/m²：每平方米每秒多少焦耳）。<strong>支出</strong>是地球向太空放出的红外线。温度不变时两栏相等，账是平的。CO₂ 会吸收红外线，把一部分本该逃走的热留在大气里，所以温度还没变，支出就先少了一截。这一截叫<strong>辐射强迫</strong> F，正值表示账上多出了收入。常用的经验式是 <strong>F = 5.35 × ln(C / 280)</strong> W/m²，C 是 CO₂ 浓度（<a class="xlink" href="../../../earth/climate/climate-energy/#step2">→ 气候能量账第 2 步：逃出去的热怎样决定平衡温度</a>）。',
    co2: 'CO₂ 浓度 C（ppm）',
    c0a: '能量账（W/m²，横轴从 220 起）', c0b: '辐射强迫 F（W/m²）随 CO₂ 浓度',
    rowIn: '收入：阳光', rowOut: '支出：红外',
    s0lgIn: '吸收的阳光', s0lgOut: '放出的红外', s0lgGap: '缺口 = 强迫 F', s0lgDbl: '280 → 560 → 1120 ppm（每次加倍）',
    s0readout: 'C = {c} ppm（是 280 ppm 的 {ratio} 倍）→ 辐射强迫 F = {F} W/m²。收入 {inc} W/m²，温度未变时支出 {out} W/m²：缺口占收入的 {pct}%。',
    s0hint: '观察顺序：先把 CO₂ 拖到 560 ppm（加倍），记下 F ≈ 3.71 W/m²；再拖到 1120 ppm（再加倍），F 只增加了同样的 3.71，并没有翻倍。下图的曲线越往右越平：浓度每翻一倍，强迫增加同样的量，这正是对数的性质（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ 指数与对数第 3 步：对数把乘法变成加法</a>）。上图横轴从 220 起，才看得清缺口：在 1120 ppm 时它也只占收入的 3% 左右，但它每秒、每平方米都在发生。',

    s1k: '第 1 步 · 最基本的配平',
    s1t: '如果只有「越暖放热越多」这一条，要暖多少度才能补上缺口？',
    s1e: '这一步要回答：CO₂ 加倍造成 3.71 W/m² 的缺口，如果地球只靠「变暖就多放红外」来配平，要暖多少？物体越热放出的红外越多（黑体辐射的 σT⁴ 定律，<a class="xlink" href="../../../physics/modern/blackbody-radiation/#step3">→ 黑体辐射第 3 步：温度翻倍，辐射变成 16 倍</a>）。每暖 1 K 支出增加的量叫<strong>普朗克响应</strong> λP。按黑体公式粗估：地球向太空的有效辐射温度约 255 K，每暖 1 K 多放 4σT³ ≈ 3.74 W/m²；把大气各层和不同纬度算进去后，IPCC 第六次评估报告（AR6）给出 λP ≈ 3.22 W/m²/K，本页用这个值。账上的<strong>净额 N = F − λP·ΔT</strong>，ΔT 是地表平均温度比原来高了多少（K）。N > 0 表示还在积热、会继续变暖；N = 0 时账平，温度不再变，这时的 ΔT 叫<strong>平衡升温</strong>。本步固定 C = 560 ppm（F = 3.71 W/m²），只有普朗克响应，没有其他反馈。',
    dT1: '假设地表已经暖了 ΔT（K）',
    c1a: '账目（W/m²）', c1b: '净额 N 随 ΔT（W/m²）',
    rowF: 'CO₂ 强迫', rowP: '普朗克', rowWv: '水汽', rowIce: '冰雪', rowCloud: '云', rowNet: '净额 N', rowNetL: '净：每暖 1 K',
    s1lgPos: '让地球积热（收入多）', s1lgNeg: '让地球散热（支出多）', s1lgNet: '净额', s1lgTrace: '你试过的 ΔT',
    s1readout: 'ΔT = {dT} K：普朗克响应多放出 {p} W/m²，净额 N = {N} W/m²。{state}',
    s1warm: '仍在积热，温度还会继续升。', s1flat: '账平了：只有普朗克响应时，CO₂ 加倍的平衡升温约 {eq} K。', s1cool: '支出超过收入，地球会降温，退回平衡点。',
    s1hint: '观察顺序：从 0 开始慢慢向右拖 ΔT，看上图「普朗克」一行的青色条变长、「净额」一行缩短，下图的点沿直线往下走。直线穿过 0 的位置就是平衡升温，约 1.15 K。拖过头，净额变成负的，地球会降温回去。所以普朗克响应是一个<strong>负反馈</strong>：暖得越多，放走的热越多，它总在把温度拉回平衡。',

    s2k: '第 2 步 · 反馈',
    s2t: '变暖本身又让账上多出一笔收入，最后要暖多少？',
    s2e: '这一步要回答：如果变暖会引起另一个变化，而这个变化又让账上多出收入，平衡升温会被放大多少？这种「结果反过来改变原因」的环节叫<strong>反馈</strong>，放大原变化的叫正反馈。用<strong>反馈参数 f</strong>（W/m²/K）表示每暖 1 K 它带来多少额外收入。例子：冰雪融化，地面变暗，反射的阳光变少（<strong>冰雪反照率反馈</strong>，AR6 估计约 0.35）。把账一轮一轮地结：第 1 轮只靠普朗克响应补上 F，需要暖 F/λP；这些变暖又带来 f·F/λP 的新收入，第 2 轮再暖 (f/λP)·F/λP；以后每一轮都是上一轮的 <strong>r = f/λP</strong> 倍。r < 1 时这些量越来越小，总和收敛到 <strong>ΔT = F / (λP − f)</strong>，是只有普朗克响应时的 1/(1 − r) 倍，这个倍数叫<strong>增益</strong>。「轮」只是记账的办法，不是真实的先后顺序：现实中所有反馈是同时起作用的，结果就是这个总和。本步仍是 C = 560 ppm。',
    f2: '反馈参数 f（W/m²/K）',
    runRounds: '逐轮结算 12 轮', allRounds: '直接看 12 轮',
    c2a: '每轮结束时的累计升温（K）',
    s2lgPrev: '前几轮的累计', s2lgNew: '这一轮新增', s2lgLim: '极限 F/(λP − f)', s2lgP0: '只有普朗克：F/λP', s2lgOld: '之前试过的 f',
    s2readout: 'f = {f}，r = f/λP = {r}。已结 {k}/12 轮：第 {k} 轮新增 {inc} K，累计 {tot} K。极限 F/(λP − f) = {lim} K，是只有普朗克时 {p0} K 的 {g} 倍；累计到极限的 95% 需要 {n95} 轮。',
    s2hint: '观察顺序：先保持 f = 0.35，按「逐轮结算」，看橙色的新增段从第 2 轮起迅速变小，柱子很快贴住白色虚线（极限）。再把 f 拖到 1.65（约等于下一步水汽和冰雪两项之和）重新结算：每轮缩小得慢，要更多轮才贴近极限，极限也高得多。淡色折线是你之前试过的 f。这个和只在 f < λP（r < 1）时收敛；滑杆最大 2.4，低于 λP = 3.22。',

    s3k: '第 3 步 · 反馈清单',
    s3t: '把几条主要反馈都记上，CO₂ 加倍要暖多少？最没把握的是哪一笔？',
    s3e: '这一步要回答：把主要反馈一起记账，CO₂ 加倍的平衡升温是多少，误差主要来自哪一笔？这个量叫<strong>平衡气候敏感度</strong>（ECS：CO₂ 加倍、等账重新平了以后，地表平均升温多少）。AR6 的中心估计（W/m²/K，正值表示放大变暖）：<strong>水汽</strong> +1.30：暖空气能含更多水汽，而水汽本身是温室气体（这里已并入「高空比地面暖得更多」的递减率效应）；<strong>冰雪反照率</strong> +0.35；<strong>云</strong> +0.42。云最没把握：低云变少会让更多阳光进来（放大变暖），高云的作用更复杂。AR6 给云的 90% 可能范围约 −0.10 到 +0.94。各条反馈参数直接相加，<strong>ΔT = F / (λP − Σf)</strong>，Σf 是勾选的反馈之和。',
    useWv: '记入水汽反馈（+1.30）', useIce: '记入冰雪反照率反馈（+0.35）', cloud3: '云反馈参数（W/m²/K）',
    c3a: '反馈账：每暖 1 K 多出的收入（W/m²/K）', c3b: '平衡升温 ΔT（K）随云反馈参数',
    s3lgCurve: '当前勾选下的 ΔT', s3lgBand: 'AR6 云的 90% 范围', s3lgNow: '当前取值', s3lgEnds: '范围两端',
    s3readout: '净恢复力 λP − Σf = {lam} W/m²/K → 平衡升温 ΔT = {ecs} K（只有普朗克时 {p0} K，增益 {g} 倍）。云参数取 −0.10 到 0.94 时，ΔT 从 {lo} 到 {hi} K：比云取 0.42 时低 {dlo} K、高 {dhi} K。',
    s3hint: '观察顺序：先保持两项都勾选，把云参数从 −0.10 拖到 0.94，看下图的点沿曲线往上走：曲线越往右越陡，所以同样宽的参数范围，往上多出的升温比往下少掉的多，结果是一个向高温拖长尾巴的范围。再取消「水汽」：整条曲线压低、变平，说明其他反馈越强，云的那一点不确定被放得越大。这里只改云、其余取中心值，是粗算；AR6 综合多种证据给出的 ECS 最佳估计约 3 K，很可能范围 2–5 K。',

    s4k: '第 4 步 · 海洋拖慢',
    s4t: 'CO₂ 一下子加倍后，地球是立刻暖到平衡值吗？',
    s4e: '这一步要回答：账上有了盈余，温度要多久才升到平衡值？盈余 N 的能量没有消失，而是用来加热地球，主要是加热海洋。海面以下几十到上百米被风浪搅成一层，温度几乎一致，叫<strong>混合层</strong>；它的<strong>热容</strong> C（每平方米升温 1 K 要吸收的能量，这里折算成 W·年/m²/K，并按海洋占地表 71% 摊到全球）很大。记账式：<strong>C · dT/dt = N = F − Λ·T</strong>，T 是此刻的升温，Λ = λP − Σf 取上一步的中心值 1.15 W/m²/K。它的解是 T = (F/Λ)·(1 − e^(−t/τ))，<strong>时间常数 τ = C/Λ</strong>：过了 τ 年升到平衡值的 63%，过了 3τ 年升到 95%；盈余 N 同时按 e^(−t/τ) 变小。本步是理想化的实验：第 0 年 CO₂ 一下子加倍（F = 3.71 W/m²），之后不变。',
    depth: '混合层深度 h（m）', run4: '让时间走 60 年', clear4: '清除对比线',
    c4a: '升温 T（K）', c4b: '账上的盈余 N（W/m²），即流进海洋的热',
    s4lgT: '这次的曲线', s4lgEq: '平衡值 F/Λ', s4lgOld: '之前的深度', s4lgTau: 't = τ',
    s4readout: 'h = {h} m → C = {C} W·年/m²/K，τ = C/Λ = {tau} 年。第 {t} 年：升温 {T} K，是平衡值 {eq} K 的 {pct}%；账上仍有 {N} W/m² 的盈余在加热海洋。',
    s4hint: '观察顺序：先用 75 m 按「让时间走 60 年」，看上图温度先快后慢地爬向虚线，下图盈余同步变小，竖虚线标出 t = τ。再把深度拖到 200 m 重跑：上一次的曲线留成淡色，新曲线爬得更慢，但终点是同一条虚线。海洋的深浅只改变要多久，不改变最后暖到哪里。模型失配：真实的深海还在缓慢吸热，要几百年才接近平衡；这个单层模型只描述头几十年的快速部分。',

    s5k: '第 5 步 · 碳从哪来',
    s5t: '每年排放的碳有多少留在空气里？碳汇吸收得少了会怎样？',
    s5e: '这一步要回答：前面都假设 CO₂ 浓度是给定的，它本身是怎样涨上去的？人类每年排放约 10 GtC（十亿吨碳，按碳原子计；化石燃料加土地利用，近年约 10–11 GtC）。其中一大半被海水溶解、被植物吸收，这些去处叫<strong>碳汇</strong>；剩下的留在空气里。空气中每多 2.12 GtC，CO₂ 浓度就涨 1 ppm。所以浓度每年上涨 <strong>E × (1 − s) ÷ 2.12</strong> ppm，E 是每年排放量，s 是被碳汇吸收的份额（<a class="xlink" href="../../../earth/climate/carbon-cycle/#step3">→ 碳循环第 3 步：排放的碳最后去了哪里</a>）。这里藏着第三类反馈：变暖可能让海水溶解得更少、土壤放出更多碳，碳汇份额 s 变小，同样的排放就留下更多 CO₂，强迫更大，变暖更多。它不在能量账里，而在碳账里。本步从 420 ppm 出发，排放和碳汇份额在 80 年里保持不变。',
    emis: '每年排放 E（GtC）', sink: '碳汇吸收份额 s（%）', pin5: '记下这条线', clear5: '清除记下的线',
    c5a: 'CO₂ 浓度（ppm），从 420 ppm 起 80 年', c5b: '这个浓度对应的平衡升温（K，相对工业革命前）',
    s5lgNow: '当前设置', s5lgPin: '记下的线', s5lgDbl: '560 ppm（加倍）',
    s5readout: 'E = {E} GtC/年，碳汇吸收 {s}%：每年有 {air} GtC 留在空气里，浓度每年涨 {rate} ppm。80 年后为 {c80} ppm，{cross}。按第 3 步的中心反馈，这个浓度最终对应的平衡升温是 {w} K（相对工业革命前）。',
    s5cross: '在第 {y} 年越过 560 ppm（加倍）', s5nocross: '80 年内没有达到 560 ppm',
    s5hint: '观察顺序：保持排放 10 GtC/年，按「记下这条线」，再把碳汇份额从 55% 降到 40%：新线更陡，越过 560 ppm 的年份提前，下图的平衡升温也更高。这就是碳循环反馈起作用的方式。再把排放拖到 0：浓度停在 420 ppm。（本模型把碳汇吸收当作排放的固定比例，排放为 0 时吸收也为 0；真实中碳汇会继续吸收，浓度会慢慢回落。）下图是「如果浓度停在这里，最终会暖多少」，不是那一年的实际温度：第 4 步说过，海洋会让实际升温落后。',

    s6k: '第 6 步 · 收束', s6t: '账要平，地球就得暖；反馈决定暖多少',
    s6fin: '回顾这条链。<strong>第 0 步</strong>：CO₂ 让支出先少了一截，缺口就是辐射强迫 F，浓度每翻一倍增加约 3.71 W/m²。<strong>第 1 步</strong>：只靠「越暖放热越多」，补上加倍的缺口要暖约 1.15 K。<strong>第 2 步</strong>：反馈让每一轮变暖再引出一笔收入，总和放大为 1/(1 − f/λP) 倍。<strong>第 3 步</strong>：水汽、冰雪、云一起记账，加倍约暖 3.2 K；云的不确定性被放大成一个向高温拖长的范围。<strong>第 4 步</strong>：海洋的热容让温度要用几年到几十年才追上平衡值。<strong>第 5 步</strong>：排放的碳约一半留在空气里；碳汇变弱是另一条正反馈。',
    formula: 'F = 5.35 · ln(C / 280)\nN = F − (λP − Σf) · ΔT\nΔT平衡 = F / (λP − Σf)\nC · dT/dt = N',
    boundary: '适用范围：本页是全球平均、零维的教学模型，不是预测。反馈参数取 AR6 的中心值并当作常数，现实中它们会随变暖的空间分布和时间而变；没有算气溶胶（它们反射阳光、抵消了一部分变暖，这也是今天 420 ppm 下实际升温约 1.2 K、低于第 5 步给出的平衡值的原因之一）；第 4 步只有一层海洋，第 5 步的碳汇份额固定不变。',
    linksTitle: '接着去哪',
    lk1: '→ 气候能量账第 2 步：逃出去的热怎样决定平衡温度',
    lk2: '→ 黑体辐射第 3 步：为什么温度一高，放出的辐射多得多',
    lk3: '→ 碳循环第 2 步：排放怎样一年年累积成浓度',
    lk4: '→ 指数与对数第 3 步：对数把乘法变成加法',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《气候反馈 · 一笔一笔对上能量账》的平行版本。'
  },
  en: {
    pageTitle: 'Climate Feedback · An Energy Ledger That Must Rebalance',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Climate Feedback · Balance the Energy Ledger →',
    navLabel: 'Climate feedback steps',
    tagline: 'Earth’s books balance only when it sends out as much energy as infrared as it takes in from the Sun. Add CO₂ and the outgoing column shrinks first, leaving a surplus that Earth can only clear by warming up. But warming rewrites other lines in the ledger too (ice, water vapour, clouds), and that is what a feedback is. Over seven steps you will keep the books line by line: how much a doubling of CO₂ warms the planet, why it does not happen at once, and how emissions keep making the bill bigger.',
    nav0: '0 The gap', nav1: '1 Warming alone', nav2: '2 Round by round', nav3: '3 The feedback list', nav4: '4 The ocean’s delay', nav5: '5 Where CO₂ comes from', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Two columns',
    s0t: 'Double the CO₂: how far out of balance does Earth’s energy budget go? And if you double it again?',
    s0e: 'This step asks: if atmospheric CO₂ doubles from its pre-industrial 280 ppm to 560 ppm, how big a hole opens in Earth’s energy budget? (ppm: CO₂ molecules per million molecules of air.) The ledger has two columns, both global averages per square metre. <strong>Income</strong> is absorbed sunlight: the solar constant of 1361 W/m², spread over the whole sphere and minus the roughly 30% reflected straight back, comes to about 238 W/m² (W/m²: joules per second per square metre). <strong>Spending</strong> is the infrared Earth radiates to space. With the temperature steady the two columns match and the books balance. CO₂ absorbs infrared and keeps some heat that would have escaped, so before the temperature has changed at all, spending drops. That drop is the <strong>radiative forcing</strong> F; positive means extra income. The standard fit is <strong>F = 5.35 × ln(C / 280)</strong> W/m², with C the CO₂ concentration (<a class="xlink" href="../../../earth/climate/climate-energy/#step2">→ Climate energy ledger, step 2: how escaping heat sets the balance temperature</a>).',
    co2: 'CO₂ concentration C (ppm)',
    c0a: 'Energy budget (W/m², axis starts at 220)', c0b: 'Radiative forcing F (W/m²) vs CO₂',
    rowIn: 'In: sunlight', rowOut: 'Out: infrared',
    s0lgIn: 'absorbed sunlight', s0lgOut: 'infrared emitted', s0lgGap: 'gap = forcing F', s0lgDbl: '280 → 560 → 1120 ppm (each a doubling)',
    s0readout: 'C = {c} ppm ({ratio} × 280 ppm) → radiative forcing F = {F} W/m². Income {inc} W/m²; spending before any warming {out} W/m². The gap is {pct}% of income.',
    s0hint: 'What to try: drag CO₂ to 560 ppm (a doubling) and note F ≈ 3.71 W/m². Then go to 1120 ppm (another doubling): F gains the same 3.71 again; it does not double. The lower curve flattens to the right: every doubling adds the same forcing, which is exactly what a logarithm does (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step3">→ Exponents and logarithms, step 3: logs turn multiplying into adding</a>). The upper axis starts at 220 so the gap is visible at all: even at 1120 ppm it is only about 3% of income, but it is there every second over every square metre.',

    s1k: 'Step 1 · The basic restoring force',
    s1t: 'If the only rule is “warmer things shed more heat”, how much warming closes the gap?',
    s1e: 'This step asks: doubling CO₂ opens a 3.71 W/m² gap; if Earth could close it only by radiating more infrared as it warms, how much warming would that take? Hotter things radiate more (the σT⁴ law of black-body radiation, <a class="xlink" href="../../../physics/modern/blackbody-radiation/#step3">→ Black-body radiation, step 3: double the temperature, sixteen times the output</a>). The extra outgoing infrared per kelvin of warming is the <strong>Planck response</strong> λP. A black-body estimate: Earth radiates to space like a body at about 255 K, and each extra kelvin adds 4σT³ ≈ 3.74 W/m². Accounting for the layers of the atmosphere and the spread of latitudes, the IPCC Sixth Assessment Report (AR6) gives λP ≈ 3.22 W/m²/K, the value used here. The <strong>net balance N = F − λP·ΔT</strong>, where ΔT is how much the global-mean surface has warmed (K). N > 0 means Earth is still gaining heat and will keep warming; at N = 0 the books balance and the temperature stops changing. That ΔT is the <strong>equilibrium warming</strong>. In this step C is fixed at 560 ppm (F = 3.71 W/m²) and the Planck response is the only response.',
    dT1: 'Suppose the surface has already warmed by ΔT (K)',
    c1a: 'Ledger lines (W/m²)', c1b: 'Net balance N vs ΔT (W/m²)',
    rowF: 'CO₂ forcing', rowP: 'Planck', rowWv: 'Water vapour', rowIce: 'Ice & snow', rowCloud: 'Clouds', rowNet: 'Net N', rowNetL: 'Net per 1 K',
    s1lgPos: 'adds heat (income up)', s1lgNeg: 'sheds heat (spending up)', s1lgNet: 'net', s1lgTrace: 'ΔT values you tried',
    s1readout: 'ΔT = {dT} K: the Planck response sends out an extra {p} W/m², leaving N = {N} W/m². {state}',
    s1warm: 'Still gaining heat, so it keeps warming.', s1flat: 'Balanced: with the Planck response alone, doubling CO₂ warms Earth by about {eq} K.', s1cool: 'Spending now beats income; Earth would cool back to the balance point.',
    s1hint: 'What to try: drag ΔT slowly up from 0. In the upper chart the cyan Planck bar grows and the net bar shrinks; in the lower chart the point walks down a straight line. Where the line crosses zero is the equilibrium warming, about 1.15 K. Overshoot and the net turns negative, so Earth would cool back. That makes the Planck response a <strong>negative feedback</strong>: the more it warms, the more heat it sheds, always pulling the temperature back to balance.',

    s2k: 'Step 2 · Feedback',
    s2t: 'When warming itself adds a new line of income, where does the warming end up?',
    s2e: 'This step asks: if warming triggers another change, and that change adds income to the ledger, how much bigger does the equilibrium warming get? A link where the result feeds back on its cause is a <strong>feedback</strong>; one that amplifies the original change is a positive feedback. Its <strong>feedback parameter f</strong> (W/m²/K) is the extra income it brings per kelvin of warming. Example: snow and ice melt, the ground darkens and reflects less sunlight (the <strong>ice–albedo feedback</strong>, about 0.35 in AR6). Settle the books round by round. Round 1 closes F with the Planck response alone, which takes F/λP of warming. That warming brings in f·F/λP of new income, so round 2 adds (f/λP)·F/λP more, and every later round is <strong>r = f/λP</strong> times the one before. With r < 1 the rounds shrink and the total converges to <strong>ΔT = F / (λP − f)</strong>, which is 1/(1 − r) times the Planck-only answer. That factor is the <strong>gain</strong>. The rounds are a bookkeeping device, not a real sequence in time: in reality every feedback acts at once, and the outcome is this total. C is still 560 ppm.',
    f2: 'Feedback parameter f (W/m²/K)',
    runRounds: 'Settle 12 rounds', allRounds: 'Show all 12 at once',
    c2a: 'Total warming after each round (K)',
    s2lgPrev: 'earlier rounds', s2lgNew: 'added this round', s2lgLim: 'limit F/(λP − f)', s2lgP0: 'Planck only: F/λP', s2lgOld: 'f values you tried',
    s2readout: 'f = {f}, r = f/λP = {r}. Rounds settled {k}/12: round {k} adds {inc} K, total {tot} K. Limit F/(λP − f) = {lim} K, {g} × the Planck-only {p0} K; reaching 95% of the limit takes {n95} rounds.',
    s2hint: 'What to try: keep f = 0.35 and press “Settle 12 rounds”. The orange top-up shrinks fast from round 2 and the bars soon touch the white dashed limit. Then drag f to 1.65 (about the water-vapour plus ice total in the next step) and settle again: each round shrinks more slowly, it takes more rounds to approach the limit, and the limit is much higher. Faint lines keep the f values you tried. The sum converges only while f < λP (r < 1); the slider stops at 2.4, below λP = 3.22.',

    s3k: 'Step 3 · The feedback list',
    s3t: 'With the main feedbacks on the books, how much does doubling CO₂ warm Earth, and which line is least certain?',
    s3e: 'This step asks: with the main feedbacks entered together, what is the equilibrium warming for doubled CO₂, and which entry drives the uncertainty? That warming is the <strong>equilibrium climate sensitivity</strong> (ECS: the global-mean surface warming once the books balance again after CO₂ doubles). AR6 central estimates (W/m²/K, positive amplifies warming): <strong>water vapour</strong> +1.30, because warmer air holds more water vapour, itself a greenhouse gas (this figure already folds in the “lapse-rate” effect of the upper air warming more than the surface); <strong>ice–albedo</strong> +0.35; <strong>clouds</strong> +0.42. Clouds are the shakiest entry: fewer low clouds let in more sunlight (amplifying), and high clouds are more complicated. AR6’s 90% range for the cloud feedback is roughly −0.10 to +0.94. Feedback parameters simply add, so <strong>ΔT = F / (λP − Σf)</strong>, with Σf the sum of the feedbacks you tick.',
    useWv: 'Include water vapour (+1.30)', useIce: 'Include ice–albedo (+0.35)', cloud3: 'Cloud feedback parameter (W/m²/K)',
    c3a: 'Feedback ledger: extra income per 1 K (W/m²/K)', c3b: 'Equilibrium warming ΔT (K) vs cloud feedback',
    s3lgCurve: 'ΔT with the ticked feedbacks', s3lgBand: 'AR6 90% cloud range', s3lgNow: 'current value', s3lgEnds: 'ends of the range',
    s3readout: 'Net restoring strength λP − Σf = {lam} W/m²/K → equilibrium warming ΔT = {ecs} K (Planck only {p0} K, gain {g}). With clouds anywhere from −0.10 to 0.94, ΔT runs from {lo} to {hi} K: {dlo} K below and {dhi} K above the value at 0.42.',
    s3hint: 'What to try: keep both boxes ticked and drag the cloud parameter from −0.10 to 0.94. The point climbs a curve that steepens to the right, so an even spread in the parameter buys more extra warming at the top than it removes at the bottom: the range gets a long tail toward high warming. Then untick water vapour: the whole curve drops and flattens. The stronger the other feedbacks, the more they magnify the cloud uncertainty. Varying only clouds with everything else at its central value is a rough cut; combining several lines of evidence, AR6 puts the best estimate of ECS near 3 K, very likely 2–5 K.',

    s4k: 'Step 4 · The ocean’s delay',
    s4t: 'If CO₂ doubled overnight, would Earth jump straight to its equilibrium warming?',
    s4e: 'This step asks: once the ledger is in surplus, how long does the temperature take to reach equilibrium? The surplus N does not vanish; it heats the planet, and mostly that means heating the ocean. Wind and waves stir the top few tens of metres to a hundred metres or so into a single layer at nearly one temperature, the <strong>mixed layer</strong>. Its <strong>heat capacity</strong> C (energy needed to warm one square metre by 1 K, expressed here in W·yr/m²/K and spread over the globe with the ocean covering 71% of it) is large. The bookkeeping: <strong>C · dT/dt = N = F − Λ·T</strong>, where T is the warming so far and Λ = λP − Σf takes step 3’s central value, 1.15 W/m²/K. Its solution is T = (F/Λ)·(1 − e^(−t/τ)) with <strong>time constant τ = C/Λ</strong>: after τ years the warming is 63% of the way to equilibrium, after 3τ years 95%, while the surplus N fades as e^(−t/τ). This is an idealised experiment: CO₂ doubles at year 0 (F = 3.71 W/m²) and then stays put.',
    depth: 'Mixed-layer depth h (m)', run4: 'Run 60 years', clear4: 'Clear comparison lines',
    c4a: 'Warming T (K)', c4b: 'Surplus N (W/m²): heat flowing into the ocean',
    s4lgT: 'this run', s4lgEq: 'equilibrium F/Λ', s4lgOld: 'earlier depths', s4lgTau: 't = τ',
    s4readout: 'h = {h} m → C = {C} W·yr/m²/K, τ = C/Λ = {tau} years. Year {t}: warming {T} K, {pct}% of the equilibrium {eq} K; a surplus of {N} W/m² is still heating the ocean.',
    s4hint: 'What to try: with 75 m, press “Run 60 years”. The upper curve climbs toward the dashed line quickly at first and then more slowly, the surplus below fades in step, and a vertical dashed line marks t = τ. Then drag the depth to 200 m and run again: the previous curve stays as a faint line, the new one climbs more slowly, yet it heads for the same dashed line. Ocean depth changes how long it takes, not where it ends up. Model mismatch: the real deep ocean keeps soaking up heat for centuries; this single-layer model only describes the fast part over the first few decades.',

    s5k: 'Step 5 · Where the CO₂ comes from',
    s5t: 'How much of each year’s carbon stays in the air, and what if the sinks take up less?',
    s5e: 'This step asks: so far the CO₂ level was simply given; how does it actually rise? People emit about 10 GtC a year (billions of tonnes of carbon, counting carbon atoms only; fossil fuels plus land use have been about 10–11 GtC recently). More than half dissolves into the ocean or is taken up by plants; these destinations are the <strong>carbon sinks</strong>. The rest stays in the air, and every extra 2.12 GtC there raises CO₂ by 1 ppm. So the concentration climbs by <strong>E × (1 − s) ÷ 2.12</strong> ppm a year, with E the yearly emissions and s the share absorbed by the sinks (<a class="xlink" href="../../../earth/climate/carbon-cycle/#step3">→ Carbon cycle, step 3: where the emitted carbon ends up</a>). A third kind of feedback hides here: warming may let the ocean dissolve less and soils release more carbon, so s shrinks, the same emissions leave more CO₂ behind, the forcing grows and so does the warming. This loop runs through the carbon books, not the energy books. The run starts at 420 ppm, with emissions and sink share held fixed for 80 years.',
    emis: 'Yearly emissions E (GtC)', sink: 'Share taken up by sinks s (%)', pin5: 'Pin this line', clear5: 'Clear pinned lines',
    c5a: 'CO₂ (ppm) over 80 years from 420 ppm', c5b: 'Equilibrium warming for that level (K above pre-industrial)',
    s5lgNow: 'current settings', s5lgPin: 'pinned lines', s5lgDbl: '560 ppm (doubled)',
    s5readout: 'E = {E} GtC/yr with {s}% taken up by sinks: {air} GtC a year stays airborne and CO₂ rises {rate} ppm a year. After 80 years it reaches {c80} ppm; {cross}. With step 3’s central feedbacks, that level eventually means {w} K of equilibrium warming above pre-industrial.',
    s5cross: 'it passes 560 ppm (a doubling) in year {y}', s5nocross: 'it does not reach 560 ppm within 80 years',
    s5hint: 'What to try: keep emissions at 10 GtC a year, press “Pin this line”, then lower the sink share from 55% to 40%. The new line is steeper, it crosses 560 ppm sooner, and the equilibrium warming below is higher. That is how the carbon-cycle feedback works. Then drag emissions to 0: CO₂ stops at 420 ppm. (Here the sinks take a fixed share of emissions, so no emissions means no uptake; in reality the sinks keep absorbing and CO₂ would slowly fall.) The lower chart shows how warm Earth would eventually get if CO₂ stayed at that level, not the actual temperature that year; as step 4 showed, the ocean makes the real warming lag.',

    s6k: 'Step 6 · Wrap-up', s6t: 'To balance the books Earth must warm; feedbacks decide by how much',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: CO₂ cuts spending before anything warms; that gap is the radiative forcing F, about 3.71 W/m² per doubling. <strong>Step 1</strong>: with only “warmer sheds more”, closing a doubling’s gap takes about 1.15 K. <strong>Step 2</strong>: a feedback makes each round of warming bring in new income, scaling the total by 1/(1 − f/λP). <strong>Step 3</strong>: with water vapour, ice and clouds on the books, a doubling warms about 3.2 K, and the cloud uncertainty stretches into a range with a long warm tail. <strong>Step 4</strong>: the ocean’s heat capacity means the temperature needs years to decades to catch up. <strong>Step 5</strong>: about half the emitted carbon stays airborne, and weakening sinks are one more positive feedback.',
    formula: 'F = 5.35 · ln(C / 280)\nN = F − (λP − Σf) · ΔT\nΔT_eq = F / (λP − Σf)\nC · dT/dt = N',
    boundary: 'Scope: this is a global-mean, zero-dimensional teaching model, not a forecast. Feedback parameters take AR6 central values and are held constant; in reality they shift with the pattern and timing of warming. Aerosols are left out (they reflect sunlight and offset some warming, one reason the observed warming at today’s 420 ppm is about 1.2 K, below the equilibrium value step 5 reports). Step 4 has a single ocean layer, and step 5 keeps the sink share fixed.',
    linksTitle: 'Where to go next',
    lk1: '→ Climate energy ledger, step 2: how escaping heat sets the balance temperature',
    lk2: '→ Black-body radiation, step 3: why a little more temperature means much more radiation',
    lk3: '→ Carbon cycle, step 2: how yearly emissions pile up into concentration',
    lk4: '→ Exponents and logarithms, step 3: logs turn multiplying into adding',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Climate Feedback · Balance the Energy Ledger”.'
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
