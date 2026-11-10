'use strict';
// Enzymes lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '酶 · 生物体内的催化剂',
    back: '← 知识索引',
    compare: '对照另一版本：酶 · 生物体内的催化剂 →',
    navLabel: '酶的步骤导航',
    tagline: '一块饼干里的淀粉放在水里，几年也分解不完；进了嘴，几分钟就开始变甜。差别在于唾液里的淀粉酶。这一页用七步算清楚：酶让反应快了多少倍、为什么只认特定的分子、为什么底物再多也有上限、为什么怕热怕酸碱，以及两种抑制剂为什么一种能被「挤走」、一种不能。',
    nav0: '0 快多少', nav1: '1 锁与钥匙', nav2: '2 饱和', nav3: '3 温度', nav4: '4 pH', nav5: '5 抑制剂', nav6: '6 收束',

    s0k: '第 0 步 · 酶让反应快了多少',
    s0t: '能垒降低一点点，反应会快多少？',
    s0e: '这一步要回答：<strong>酶</strong>是细胞做的<strong>催化剂</strong>（加快反应、自己不被消耗的物质，绝大多数是蛋白质），它到底把反应加快了多少倍？分子要反应，先得爬过一个能量门槛，叫<strong>活化能</strong> Eₐ（单位 kJ/mol）；门槛越高，能爬过去的分子越少，反应越慢（<a class="xlink" href="../../../chemistry/reactions/activation-energy/#step3">→ 活化能页第 3 步：催化剂把山挖矮，但不改终点</a>）。速度与门槛的关系是指数式的：速率常数 k = A·e^(−Eₐ/RT)，R 是气体常数，T 是绝对温度（这里固定为体温 37 °C）。所以酶把门槛降低 ΔEₐ，速度就乘以 e^(ΔEₐ/RT)。下面用<strong>半衰期</strong>（反应物消耗掉一半需要的时间）来体会这个倍数。',
    ea0: '不用酶时的活化能 Eₐ（kJ/mol）', dea0: '酶把它降低了 ΔEₐ（kJ/mol）',
    c0a: '能量沿反应进程的变化（kJ/mol）', c0b: '半衰期（对数刻度，每格 ×1000）',
    s0lgNo: '不用酶', s0lgYes: '用酶', s0lgBar: '条长 = 半衰期（对数刻度）',
    s0readout: '不用酶：门槛 {e0} kJ/mol，半衰期约 {t0}。用酶：门槛 {e1} kJ/mol，半衰期约 {t1}。速度提高约 {x} 倍。',
    s0hint: '观察顺序：先把「降低 ΔEₐ」拖回 0，两条曲线重合、两根条一样长；再一点点往右拖，看青色曲线的峰变矮、青色条每次缩短一大截。在 37 °C，门槛每降低约 {d10} kJ/mol，速度就×10；降 40 kJ/mol 已经是几百万倍。注意：两条曲线的起点和终点都没变，酶不改变反应放出多少能量。A = 10¹³ /s 是示意取值，所以半衰期只看数量级。',
    u_ns: '{v} 纳秒', u_us: '{v} 微秒', u_ms: '{v} 毫秒', u_s: '{v} 秒', u_min: '{v} 分钟', u_h: '{v} 小时', u_d: '{v} 天', u_y: '{v} 年',
    tk_ns: '1 纳秒', tk_us: '1 微秒', tk_ms: '1 毫秒', tk_s: '1 秒', tk_h: '1 小时', tk_y: '1 年',

    s1k: '第 1 步 · 只认一种形状',
    s1t: '酶为什么只对特定的分子起作用，而且能反复用？',
    s1e: '这一步要回答：细胞里同时有成千上万种分子，酶怎么只加快其中一种的反应？酶分子表面有一个凹槽，叫<strong>活性位点</strong>，它的形状和化学性质只和一种分子吻合；被酶作用的分子叫<strong>底物</strong>，反应后得到的叫<strong>产物</strong>。底物嵌进活性位点，形成<strong>酶–底物复合物</strong>，在那里被拆开（或拼合），产物离开后，酶恢复原样，接着等下一个底物。这种「一把钥匙开一把锁」的现象叫<strong>专一性</strong>。下面的酶活性位点是方形凹槽。',
    shapeSquare: '方形底物', shapeCircle: '圆形底物', shapeTriangle: '三角形底物',
    feed1: '送来 10 个这种底物', clear1: '清空记录',
    c1a: '一个酶分子与依次到来的底物', c1b: '累计产物数 vs 送来的底物数',
    s1lgEnz: '酶（方形活性位点）', s1lgSub: '当前底物', s1lgProd: '产物（每个底物拆成 2 个）', s1lgLine: '每种底物一条累计线（线端画着它的形状）',
    s1readout: '{shape}：已送来 {n} 个，被转化 {c} 个，得到 {p} 个产物；酶分子始终是 {e} 个，没有被消耗。{prog}',
    s1prog: '（正在送第 {k}/10 个）',
    s1hint: '观察顺序：先选「方形底物」点送来按钮，看每个底物嵌进凹槽、断成两半离开，下方累计线一路上升，而酶一直是同一个；再换「圆形」或「三角形」，它们碰到凹槽就弹开，累计线保持水平。画面是慢放：真实的酶一秒能转很多圈，例如碳酸酐酶每个分子每秒约处理 {kcat} 个 CO₂ 分子。',
    shape_square: '方形底物', shape_circle: '圆形底物', shape_triangle: '三角形底物',

    s2k: '第 2 步 · 饱和',
    s2t: '底物越多，反应就一直越快吗？',
    s2e: '这一步要回答：酶的数量不变，把<strong>底物浓度</strong> [S]（单位 mM，毫摩尔每升）一直加大，<strong>反应速度</strong> v（每分钟生成的产物，这里用相对单位）会怎样？每个酶分子同一时刻只能处理一个底物。底物少时，酶多半空闲，加底物 → 更多酶开工 → v 几乎成正比上升；底物多到几乎每个活性位点都被占着，酶已经满负荷，这叫<strong>饱和</strong>，v 逼近上限 <strong>Vmax</strong>（全部酶都在工作时的速度）。把这两件事合起来就是米氏方程：v = Vmax·[S] / (Kₘ + [S])。<strong>Kₘ</strong>（米氏常数）是让 v 达到 Vmax 一半时的底物浓度，Kₘ 越小，说明酶在底物很稀时就能「抓住」底物。',
    s2S: '底物浓度 [S]（mM）', s2Km: '米氏常数 Kₘ（mM）', s2E: '酶的量（相对 1 份）',
    c2a: '20 个酶分子：亮的是正在工作的', c2b: '速度 v vs 底物浓度 [S]',
    s2lgBusy: '活性位点被占（在工作）', s2lgCurve: 'v = Vmax·[S]/(Kₘ+[S])', s2lgVmax: 'Vmax（虚线）与 Kₘ 处的一半', s2lgDot: '你试过的 [S]',
    s2readout: '[S] = {S} mM，Kₘ = {Km} mM，Vmax = {Vmax}：v = {v}，是 Vmax 的 {pct}%（即 {pct}% 的活性位点被占着；上图按 20 个分子取整为 {busy} 个）。此时把 [S] 再加倍到 {S2} mM，v 变成 {v2}（{gain}）。',
    s2hint: '观察顺序：先把 [S] 拖到等于 Kₘ，读数正好是 Vmax 的 50%；再拖到 10 倍 Kₘ 附近，看「加倍」带来的增长只剩几个百分点——上图几乎全亮，再多底物也找不到空闲的酶。然后保持 [S] 不动，把「酶的量」从 1 调到 2：Vmax 和 v 都翻倍，而 Kₘ 处的那条竖线不动。',
    gainUp: '+{p}%',

    s3k: '第 3 步 · 温度',
    s3t: '为什么温度升高先变快、过了某个点又急剧变慢？',
    s3e: '这一步要回答：酶的活性随温度怎样变？两件事同时发生。一是普通化学规律：温度升高，分子跑得更快、更多分子能越过门槛，所以在一定范围内温度每升 10 °C，速度约乘以 2（这个倍数叫 <strong>Q₁₀</strong>）。二是酶是蛋白质，靠很多弱相互作用维持空间形状；温度太高，这些作用被打散，肽链展开，活性位点变形，这叫<strong>变性</strong>。两者相乘，就出现一个活性最高的<strong>最适温度</strong>。本页的模型：化学步骤的活化能取 50 kJ/mol，一半分子展开的温度取 47 °C，都是示意参数。',
    s3T: '温度 T（°C）', heat3: '在这个温度放置后，冷却到 37 °C 再测', fresh3: '换一管新酶',
    c3: '酶的相对活性 vs 温度',
    s3lgAct: '相对活性（最适温度 = 100%）', s3lgFold: '仍保持正常形状的酶比例', s3lgCool: '冷却到 37 °C 后测得的活性（横坐标 = 曾加热到的温度）', s3lgNow: '当前温度',
    s3readout: '{T} °C：活性是最适温度时的 {a}%，保持正常形状的酶占 {f}%。最适温度约 {opt} °C；从 20 °C 到 30 °C 速度变成 {q10} 倍（若都不变性）。',
    s3cool: '这管酶最高被加热到 {tmax} °C，冷却回 37 °C 后活性为 {ac}%；新酶在 37 °C 是 {a37}%。',
    s3fresh: '这管还是新酶。',
    s3hint: '观察顺序：把温度从 0 慢慢拖到 80 °C，看青色活性曲线先缓慢上升、在 {opt} °C 附近见顶，然后随灰色虚线（保持形状的比例）一起掉下去。再做一个实验：拖到 60 °C，点「放置后冷却再测」——橙点落在 37 °C 新酶的水平以下很多：变性的酶冷下来也恢复不了（模型假设展开的分子会聚成团、不再复原）。点「换一管新酶」重来。',

    s4k: '第 4 步 · pH',
    s4t: '为什么胃里的酶和小肠里的酶喜欢完全不同的酸碱度？',
    s4e: '这一步要回答：同样是消化酶，为什么在不同的 <strong>pH</strong>（衡量酸碱的数，7 为中性，越小越酸，每差 1 氢离子浓度差 10 倍，<a class="xlink" href="../../../chemistry/solutions/ph-scale/#step1">→ pH 页第 1 步：pH 差 1 到底差几倍</a>）下表现完全不同？活性位点里有些化学基团会得到或失去氢离子（H⁺）。本页的模型假设活性位点里有两个关键基团：一个必须失去 H⁺，另一个必须带着 H⁺，酶才能工作。太酸，第一个失不掉；太碱，第二个保不住。只有中间一段 pH 两个条件同时满足，于是每种酶各有一个<strong>最适 pH</strong>。三种酶：<strong>胃蛋白酶</strong>（在胃里分解蛋白质）、<strong>唾液淀粉酶</strong>（在口腔分解淀粉）、<strong>胰蛋白酶</strong>（在小肠分解蛋白质）。',
    s4pH: 'pH',
    c4: '三种酶的相对活性 vs pH（各自最高 = 100%）',
    s4lgPep: '胃蛋白酶', s4lgAmy: '唾液淀粉酶', s4lgTry: '胰蛋白酶', s4lgPlace: '竖虚线：胃 pH 2、口腔 pH 6.8、小肠 pH 8',
    s4readout: 'pH {pH}：胃蛋白酶 {p}%，唾液淀粉酶 {a}%，胰蛋白酶 {t}%（各自相对于自己的最适 pH）。',
    s4hint: '观察顺序：把 pH 拖到 2（胃），只有紫色胃蛋白酶在高位；拖到 6.8（口腔），轮到淀粉酶；拖到 8（小肠），胰蛋白酶最高。所以胃蛋白酶随食物进入小肠后几乎失效（pH 8 时只剩 {pep8}%），唾液淀粉酶咽进胃里（pH 2）也只剩 {amy2}%。曲线形状来自示意的两基团模型，真实酶的曲线会更宽或不对称。',

    s5k: '第 5 步 · 抑制剂',
    s5t: '同样让酶变慢，为什么有的能用更多底物「挤走」，有的不能？',
    s5e: '这一步要回答：<strong>抑制剂</strong>是能和酶结合、让它变慢的分子（很多药物和毒物就是这样起作用的）。抑制剂结合得多紧，用 <strong>Kᵢ</strong>（抑制常数，mM）表示：抑制剂浓度 [I] = Kᵢ 时，它的作用相当于把酶「打了对折」。分两类：<strong>竞争性抑制剂</strong>长得像底物，占住活性位点，底物和它抢同一个位置——底物越多，抢回来的越多；<strong>非竞争性抑制剂</strong>结合在活性位点以外的地方，改变酶的形状，被它结合的酶无论底物多少都不能工作。本页取 Vmax = 100、Kₘ = 2 mM、Kᵢ = 1 mM；「20 个酶分子此刻的状态」图按模型算出的比例画出每个酶此刻空着、抓着底物还是被抑制剂占着。',
    comp5: '竞争性抑制剂', non5: '非竞争性抑制剂',
    s5I: '抑制剂浓度 [I]（mM）', s5S: '底物浓度 [S]（mM）',
    c5a: '20 个酶分子此刻的状态', c5b: '速度 v vs [S]：有无抑制剂对比',
    s5lgFree: '不加抑制剂', s5lgInh: '加抑制剂', s5lgVapp: '加抑制剂后的上限（虚线）', s5lgI: '抑制剂', s5lgS: '底物（嵌在活性位点里、酶亮成青色 = 在工作）',
    s5readout: '{type}，[I] = {I} mM，[S] = {S} mM：v = {v}，不加抑制剂时为 {v0}，恢复到 {r}%。表观上限 {Vapp}，表观 Kₘ = {Kapp} mM。{rescue}',
    s5rescue: '要恢复到不加抑制剂时的 90%，需把 [S] 提到约 {S90} mM。',
    s5never: '无论 [S] 多大，都只能恢复到 {cap}%（被结合的酶不工作）。',
    s5none: '[I] = 0，没有抑制。',
    s5hint: '观察顺序：保持 [I] = 4 mM，先选「竞争性」，把 [S] 从 5 拖到 50，看实线逐渐追上虚线，恢复比例从 {c5}% 升到 {c50}%；再换「非竞争性」做同样的拖动，比例一直停在 {n}%，实线的顶被压低。区别就在上限：竞争性只让 Kₘ 变大（要更多底物才达到一半速度），非竞争性直接把 Vmax 打折。',

    s6k: '第 6 步 · 收束',
    s6t: '把酶说成一句话',
    s6fin: '酶是能反复使用的蛋白质催化剂：它用一个形状专一的<strong>活性位点</strong>抓住底物，把反应门槛降低几十 kJ/mol，速度就提高百万倍以上（e^(ΔEₐ/RT)）。酶的数量有限，所以底物多到一定程度就<strong>饱和</strong>（米氏方程）。它的形状靠弱相互作用维持，于是有<strong>最适温度</strong>（过热变性、不可逆）和<strong>最适 pH</strong>（关键基团的带电状态）。<strong>竞争性抑制</strong>能被更多底物抵消，<strong>非竞争性抑制</strong>不能。',
    formula: '加速倍数 = e^(ΔEₐ / RT)\nv = Vmax·[S] / (Kₘ + [S])\n竞争性：Kₘ → Kₘ(1 + [I]/Kᵢ)；非竞争性：Vmax → Vmax / (1 + [I]/Kᵢ)',
    boundary: '适用范围与简化：米氏方程只适用于单一底物、稳态；温度与 pH 曲线的参数都是示意值；没有涉及诱导契合、别构调节、辅酶和多底物反应；第 0 步只比较化学步骤本身的速度，没算底物找到酶所需的时间。',
    quizPrompt: '自测：一个酶已经饱和（[S] = 50 Kₘ）。把底物浓度再加倍，反应速度大约会怎样？',
    quizA: '加倍', quizB: '几乎不变', quizC: '减半',
    check: '核对', correct: '对。50 Kₘ 时 v 已是 Vmax 的 {p50}%，加倍到 100 Kₘ 也只到 {p100}%，只多了约 {gain}%——活性位点几乎全被占着。想让它更快，要加酶，而不是加底物。', wrong: '再想想：第 2 步把 [S] 拖到 Kₘ 的 10 倍，看「加倍」只带来几个百分点；50 倍时更少。',
    linksTitle: '接着看',
    lk1: '→ 活化能 第 3 步：催化剂把山挖矮，但不改终点',
    lk2: '→ 反应速率 第 4 步：把门槛降下来，碰撞里成功的比例怎样变',
    lk3: '→ 光合作用 第 2 步：光越强越快，但有上限——另一种饱和',
    lk4: '→ DNA 复制与翻译 第 2 步：DNA 聚合酶只能沿 5′→3′ 方向工作',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《酶 · 生物体内的催化剂》的平行版本。'
  },
  en: {
    pageTitle: 'Enzymes · Catalysts of the Living World',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Enzymes · Catalysts of the Living World →',
    navLabel: 'Enzyme steps',
    tagline: 'The starch in a cracker would sit in water for years without breaking down, yet in your mouth it starts tasting sweet within minutes. The difference is the amylase in saliva. In seven steps this page works out how many times faster an enzyme makes a reaction, why it only accepts certain molecules, why piling on more substrate hits a ceiling, why heat and the wrong pH ruin it, and why one kind of inhibitor can be crowded out while another cannot.',
    nav0: '0 How much faster', nav1: '1 Lock and key', nav2: '2 Saturation', nav3: '3 Temperature', nav4: '4 pH', nav5: '5 Inhibitors', nav6: '6 Wrap-up',

    s0k: 'Step 0 · How much faster',
    s0t: 'Lower the barrier a little — how much faster does the reaction go?',
    s0e: 'The question here: an <strong>enzyme</strong> is a <strong>catalyst</strong> made by the cell (something that speeds up a reaction without being used up; almost always a protein) — so how many times faster does it make a reaction? To react, molecules must first climb over an energy threshold, the <strong>activation energy</strong> Eₐ (in kJ/mol); the higher it is, the fewer molecules make it over and the slower the reaction (<a class="xlink" href="../../../chemistry/reactions/activation-energy/#step3">→ Activation energy, step 3: a catalyst digs the hill down without moving the endpoints</a>). Speed depends on the threshold exponentially: the rate constant is k = A·e^(−Eₐ/RT), with R the gas constant and T the absolute temperature (fixed here at body temperature, 37 °C). So lowering the barrier by ΔEₐ multiplies the speed by e^(ΔEₐ/RT). To feel that factor we use the <strong>half-life</strong> — the time for half the reactant to be used up.',
    ea0: 'Activation energy without enzyme, Eₐ (kJ/mol)', dea0: 'Lowered by the enzyme, ΔEₐ (kJ/mol)',
    c0a: 'Energy along the reaction (kJ/mol)', c0b: 'Half-life (log scale, ×1000 per grid line)',
    s0lgNo: 'No enzyme', s0lgYes: 'With enzyme', s0lgBar: 'Bar length = half-life (log scale)',
    s0readout: 'No enzyme: barrier {e0} kJ/mol, half-life about {t0}. With enzyme: barrier {e1} kJ/mol, half-life about {t1}. About {x} times faster.',
    s0hint: 'What to watch: drag “Lowered by” back to 0 — the two curves coincide and the bars are equal. Then drag it right bit by bit: the cyan peak drops and the cyan bar shrinks by big jumps. At 37 °C every {d10} kJ/mol or so of lowering is another ×10, so 40 kJ/mol already means millions of times faster. Note that both curves start and end at the same heights: the enzyme does not change how much energy the reaction releases. A = 10¹³ /s is an illustrative value, so read the half-lives only as orders of magnitude.',
    u_ns: '{v} ns', u_us: '{v} µs', u_ms: '{v} ms', u_s: '{v} s', u_min: '{v} min', u_h: '{v} h', u_d: '{v} days', u_y: '{v} years',
    tk_ns: '1 ns', tk_us: '1 µs', tk_ms: '1 ms', tk_s: '1 s', tk_h: '1 h', tk_y: '1 yr',

    s1k: 'Step 1 · One shape only',
    s1t: 'Why does an enzyme act on only certain molecules, and how can it be reused?',
    s1e: 'The question here: a cell holds thousands of kinds of molecule at once — how does an enzyme speed up the reaction of just one? Its surface has a pocket, the <strong>active site</strong>, whose shape and chemistry fit only one kind of molecule. The molecule acted on is the <strong>substrate</strong>; what comes out is the <strong>product</strong>. The substrate settles into the active site to form an <strong>enzyme–substrate complex</strong>, is split (or joined) there, the products leave, and the enzyme is back as it was, ready for the next one. This one-key-one-lock behaviour is <strong>specificity</strong>. The enzyme below has a square pocket.',
    shapeSquare: 'Square substrate', shapeCircle: 'Round substrate', shapeTriangle: 'Triangular substrate',
    feed1: 'Send in 10 of these', clear1: 'Clear the record',
    c1a: 'One enzyme molecule, substrates arriving in turn', c1b: 'Products so far vs substrates sent',
    s1lgEnz: 'Enzyme (square active site)', s1lgSub: 'Current substrate', s1lgProd: 'Products (each substrate splits in 2)', s1lgLine: 'One running total per substrate (its shape at the line end)',
    s1readout: '{shape}: {n} sent, {c} converted, {p} products; still {e} enzyme molecule, not used up. {prog}',
    s1prog: '(sending {k}/10)',
    s1hint: 'What to watch: pick “Square substrate” and send them in — each one settles into the pocket, breaks in two and leaves, the running total climbs, and the enzyme is the same one throughout. Switch to round or triangular: they bounce off the pocket and their line stays flat. This is slowed right down: a real enzyme turns over many times a second — one carbonic anhydrase molecule handles about {kcat} CO₂ molecules every second.',
    shape_square: 'Square substrate', shape_circle: 'Round substrate', shape_triangle: 'Triangular substrate',

    s2k: 'Step 2 · Saturation',
    s2t: 'More substrate — does the reaction keep getting faster?',
    s2e: 'The question here: keep the amount of enzyme fixed and keep raising the <strong>substrate concentration</strong> [S] (in mM, millimoles per litre) — what happens to the <strong>reaction rate</strong> v (product made per minute, in relative units)? Each enzyme molecule handles one substrate at a time. With little substrate most enzymes sit idle, so adding substrate puts more of them to work and v rises almost in proportion. Once nearly every active site is occupied the enzymes are running flat out — <strong>saturation</strong> — and v approaches a ceiling, <strong>Vmax</strong> (the rate with every enzyme busy). Together these give the Michaelis–Menten equation, v = Vmax·[S] / (Kₘ + [S]). <strong>Kₘ</strong> (the Michaelis constant) is the substrate concentration that gives half of Vmax; a smaller Kₘ means the enzyme can grab substrate even when it is scarce.',
    s2S: 'Substrate concentration [S] (mM)', s2Km: 'Michaelis constant Kₘ (mM)', s2E: 'Amount of enzyme (relative)',
    c2a: '20 enzyme molecules: lit ones are busy', c2b: 'Rate v vs substrate concentration [S]',
    s2lgBusy: 'Active site occupied (working)', s2lgCurve: 'v = Vmax·[S]/(Kₘ+[S])', s2lgVmax: 'Vmax (dashed) and half of it at Kₘ', s2lgDot: '[S] values you tried',
    s2readout: '[S] = {S} mM, Kₘ = {Km} mM, Vmax = {Vmax}: v = {v}, which is {pct}% of Vmax (so {pct}% of active sites are occupied; the 20 molecules above round this to {busy}). Doubling [S] to {S2} mM would give v = {v2} ({gain}).',
    s2hint: 'What to watch: drag [S] until it equals Kₘ — the readout says exactly 50% of Vmax. Then go to about 10 × Kₘ: doubling now buys only a few percent, because the 20 molecules are almost all lit and extra substrate finds no free enzyme. Then hold [S] and raise the enzyme from 1 to 2: Vmax and v both double while the Kₘ line stays put.',
    gainUp: '+{p}%',

    s3k: 'Step 3 · Temperature',
    s3t: 'Why does warming first speed it up, then make it collapse?',
    s3e: 'The question here: how does enzyme activity change with temperature? Two things happen at once. Ordinary chemistry: warmer molecules move faster and more of them clear the threshold, so over a range each 10 °C rise roughly doubles the rate (this factor is <strong>Q₁₀</strong>). But an enzyme is a protein held in shape by many weak interactions; too hot and these are shaken apart, the chain unfolds and the active site loses its shape — <strong>denaturation</strong>. Multiply the two and you get an <strong>optimum temperature</strong> where activity peaks. The model here uses 50 kJ/mol for the chemical step and 47 °C as the temperature at which half the molecules unfold — both illustrative.',
    s3T: 'Temperature T (°C)', heat3: 'Hold at this temperature, cool to 37 °C, then measure', fresh3: 'Fresh tube of enzyme',
    c3: 'Relative enzyme activity vs temperature',
    s3lgAct: 'Relative activity (optimum = 100%)', s3lgFold: 'Share of enzyme still correctly folded', s3lgCool: 'Activity measured after cooling to 37 °C (placed at the temperature it was heated to)', s3lgNow: 'Current temperature',
    s3readout: '{T} °C: activity is {a}% of the optimum and {f}% of the enzyme is still folded. The optimum is about {opt} °C; going from 20 °C to 30 °C multiplies the rate by {q10} (if nothing unfolds).',
    s3cool: 'This tube was heated to at most {tmax} °C; back at 37 °C its activity is {ac}%, compared with {a37}% for fresh enzyme at 37 °C.',
    s3fresh: 'This tube is still fresh.',
    s3hint: 'What to watch: drag the temperature slowly from 0 to 80 °C — the cyan activity curve climbs gently, peaks near {opt} °C, then falls together with the grey dashed curve (share still folded). Now an experiment: go to 60 °C and press “Hold, cool, measure” — the orange point lands far below fresh enzyme at 37 °C: denatured enzyme does not recover when cooled (the model assumes unfolded molecules clump together and never refold). “Fresh tube” starts over.',

    s4k: 'Step 4 · pH',
    s4t: 'Why do stomach enzymes and gut enzymes like completely different acidity?',
    s4e: 'The question here: why do digestive enzymes behave so differently at different <strong>pH</strong> (a number for acidity: 7 is neutral, lower is more acidic, and each step of 1 is a tenfold change in hydrogen ions — <a class="xlink" href="../../../chemistry/solutions/ph-scale/#step1">→ pH, step 1: how big a difference one pH unit is</a>)? Some chemical groups in the active site gain or lose hydrogen ions (H⁺). The model here assumes two key groups: one must have lost its H⁺ and the other must keep its H⁺ for the enzyme to work. Too acidic and the first cannot let go; too alkaline and the second cannot hold on. Only in a middle band are both conditions met, so each enzyme has an <strong>optimum pH</strong>. Three enzymes: <strong>pepsin</strong> (breaks down protein in the stomach), <strong>salivary amylase</strong> (breaks down starch in the mouth) and <strong>trypsin</strong> (breaks down protein in the small intestine).',
    s4pH: 'pH',
    c4: 'Relative activity of three enzymes vs pH (each peak = 100%)',
    s4lgPep: 'Pepsin', s4lgAmy: 'Salivary amylase', s4lgTry: 'Trypsin', s4lgPlace: 'Dashed lines: stomach pH 2, mouth pH 6.8, small intestine pH 8',
    s4readout: 'pH {pH}: pepsin {p}%, salivary amylase {a}%, trypsin {t}% (each relative to its own optimum).',
    s4hint: 'What to watch: drag the pH to 2 (stomach) — only the violet pepsin curve is high; at 6.8 (mouth) amylase takes over; at 8 (small intestine) trypsin is best. So pepsin carried into the small intestine with food almost stops working ({pep8}% at pH 8), and amylase swallowed into the stomach (pH 2) keeps only {amy2}%. The curve shapes come from the illustrative two-group model; real enzymes have broader or lopsided curves.',

    s5k: 'Step 5 · Inhibitors',
    s5t: 'Both slow the enzyme down — why can one be crowded out by more substrate and the other not?',
    s5e: 'The question here: an <strong>inhibitor</strong> is a molecule that binds an enzyme and slows it (many drugs and poisons work this way). How tightly it binds is given by <strong>Kᵢ</strong> (the inhibition constant, mM): at an inhibitor concentration [I] equal to Kᵢ, its effect amounts to halving the enzyme. There are two kinds. A <strong>competitive inhibitor</strong> resembles the substrate and sits in the active site, so substrate and inhibitor fight over the same spot — the more substrate, the more spots it wins back. A <strong>non-competitive inhibitor</strong> binds somewhere else and changes the enzyme’s shape; an enzyme it holds cannot work however much substrate there is. Values here: Vmax = 100, Kₘ = 2 mM, Kᵢ = 1 mM. The “20 enzyme molecules right now” picture uses the model’s proportions to show how many are empty, holding substrate, or held by inhibitor.',
    comp5: 'Competitive inhibitor', non5: 'Non-competitive inhibitor',
    s5I: 'Inhibitor concentration [I] (mM)', s5S: 'Substrate concentration [S] (mM)',
    c5a: '20 enzyme molecules right now', c5b: 'Rate v vs [S], with and without inhibitor',
    s5lgFree: 'No inhibitor', s5lgInh: 'With inhibitor', s5lgVapp: 'Ceiling with inhibitor (dashed)', s5lgI: 'Inhibitor', s5lgS: 'Substrate (in the active site, enzyme lit cyan = working)',
    s5readout: '{type}, [I] = {I} mM, [S] = {S} mM: v = {v}, versus {v0} with no inhibitor — {r}% recovered. Apparent ceiling {Vapp}, apparent Kₘ = {Kapp} mM. {rescue}',
    s5rescue: 'To get back to 90% of the uninhibited rate, raise [S] to about {S90} mM.',
    s5never: 'However high [S] goes, it only gets back to {cap}% (enzyme with inhibitor bound does not work).',
    s5none: '[I] = 0: no inhibition.',
    s5hint: 'What to watch: keep [I] = 4 mM. Pick “Competitive” and drag [S] from 5 to 50 — the solid curve catches up with the dashed one and recovery rises from {c5}% to {c50}%. Switch to “Non-competitive” and do the same: recovery stays at {n}% and the top of the solid curve is pushed down. The difference is the ceiling: a competitive inhibitor only raises Kₘ (more substrate is needed to reach half speed), a non-competitive one cuts Vmax itself.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Enzymes in one breath',
    s6fin: 'An enzyme is a reusable protein catalyst: it grabs its substrate in an <strong>active site</strong> of one particular shape and lowers the reaction barrier by tens of kJ/mol, which speeds it up a million-fold or more (e^(ΔEₐ/RT)). There are only so many enzyme molecules, so enough substrate <strong>saturates</strong> them (Michaelis–Menten). Its shape rests on weak interactions, hence an <strong>optimum temperature</strong> (overheating denatures it, irreversibly) and an <strong>optimum pH</strong> (the charge state of key groups). <strong>Competitive inhibition</strong> can be overcome with more substrate; <strong>non-competitive inhibition</strong> cannot.',
    formula: 'speed-up = e^(ΔEₐ / RT)\nv = Vmax·[S] / (Kₘ + [S])\ncompetitive: Kₘ → Kₘ(1 + [I]/Kᵢ);  non-competitive: Vmax → Vmax / (1 + [I]/Kᵢ)',
    boundary: 'Scope and simplifications: Michaelis–Menten applies to one substrate at steady state; the temperature and pH parameters are illustrative; induced fit, allosteric control, cofactors and multi-substrate reactions are left out; step 0 compares only the speed of the chemical step, not the time for substrate to find the enzyme.',
    quizPrompt: 'Check yourself: an enzyme is already saturated ([S] = 50 Kₘ). If you double the substrate concentration, roughly what happens to the rate?',
    quizA: 'It doubles', quizB: 'It hardly changes', quizC: 'It halves',
    check: 'Check', correct: 'Right. At 50 Kₘ, v is already {p50}% of Vmax; doubling to 100 Kₘ only reaches {p100}%, about {gain}% more — the active sites are nearly all taken. To go faster, add enzyme, not substrate.', wrong: 'Think again: in step 2 drag [S] to 10 × Kₘ and see that doubling buys only a few percent; at 50 × it is even less.',
    linksTitle: 'Where next',
    lk1: '→ Activation energy, step 3: a catalyst digs the hill down without moving the endpoints',
    lk2: '→ Reaction rates, step 4: lower the threshold and see how many collisions succeed',
    lk3: '→ Photosynthesis, step 2: more light, faster work — up to a ceiling (another saturation)',
    lk4: '→ DNA replication and translation, step 2: DNA polymerase can only work 5′→3′',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Enzymes · Catalysts of the Living World”.'
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
  if (typeof window.refreshEnzymes === 'function') window.refreshEnzymes();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ENZ_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
