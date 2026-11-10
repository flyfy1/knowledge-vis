'use strict';
// Population ecology lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '种群生态学 · 一条反馈回路把增长压弯',
    back: '← 知识索引',
    compare: '对照另一版本：种群生态学 · 增长如何被反馈改变 →',
    navLabel: '种群生态学步骤导航',
    tagline: '往一片湖里放进 20 条鱼。它们会无限地多下去吗？这一页从「每条鱼每年净添多少」出发，看拥挤怎样把这个数压低、把指数曲线压成 S 形，再看捕捞和捕食者怎样接进同一条反馈回路。所有曲线都是模型模拟，不是野外实测。',
    nav0: '0 无限制', nav1: '1 拥挤', nav2: '2 最快在哪', nav3: '3 S 曲线', nav4: '4 捕捞', nav5: '5 捕食者', nav6: '6 收束',

    s0k: '第 0 步 · 没有限制',
    s0t: '食物和空间都管够时，鱼群多久翻一倍？',
    s0e: '这一步要回答：往湖里放 20 条鱼，如果食物和空间都不受限，数量 N 会怎样增长？一年里每条鱼平均生下的后代数叫<strong>人均出生率 b</strong>，每条鱼一年内死去的平均概率叫<strong>人均死亡率 d</strong>（都按「每年」计）。两者之差 r = b − d 叫<strong>内禀增长率</strong>：不受限制时，每条鱼每年让种群净多出的份额。于是种群每年的增长速度 dN/dt（条/年）= r × N：鱼越多，每年添得越多，曲线越来越陡。这叫<strong>指数增长</strong>，它的标志是每过同样长的时间，数量翻同样的倍数（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ 指数与对数页第 0 步：为什么「乘」比「加」快得多</a>）。',
    bSlider: '人均出生率 b（每年）', dSlider: '人均死亡率 d（每年）',
    s0lgN: '数量 N(t)', s0lgDbl: '每翻一倍的时刻', s0lgGhost: '之前试过的设置',
    c0: '鱼的数量 N（条）· 横轴：时间 t（年）',
    s0up: 'r = b − d = {r}/年 → 每 ln2 / r ≈ {td} 年翻一倍。10 年后 N = 20 × e^(10r) ≈ {n10} 条，相当于翻了约 {k} 次。',
    s0down: 'r = b − d = {r}/年（负数）→ 种群在缩小，每 ln2 / |r| ≈ {td} 年减半。10 年后约剩 {n10} 条。',
    s0flat: 'r = b − d = 0：出生恰好抵消死亡，数量一直是 20 条。',
    s0hint: '观察顺序：先保持 d 不动，把 b 往右拖：橙色竖虚线（每次翻倍的时刻）变密，但相邻两条的间距始终相等——这就是「每过固定时间翻一倍」。再把 d 拖到超过 b，曲线转为下降。灰色细线保留你之前试过的设置，纵轴会随当前曲线自动缩放。',

    s1k: '第 1 步 · 越来越挤',
    s1t: '鱼越来越多时，每条鱼的出生和死亡会怎么变？',
    s1e: '这一步要回答：湖里的食物有限时，「每条鱼每年净添多少」还是固定的 r 吗？鱼多了，每条分到的食物变少，产卵减少——人均出生率 b 下降；拥挤还带来饥饿和疾病——人均死亡率 d 上升。本页取最简单的假设：两者都随数量 N <strong>按直线</strong>变化。两线相交处出生恰好抵消死亡，这个数量叫<strong>承载力 K</strong>：这片水域长期养得住的鱼数，由食物多少决定。交点左边 b > d，每条鱼的净增长率 b − d 为正；右边为负。这条净增长率的直线可以写成 r(1 − N/K)：N 每涨 K 的 10%，它就比 r 少 10%。',
    nSlider: '湖里现有鱼数 N（条）', kSlider: '食物供给 → 承载力 K（条）',
    s1lgB: '人均出生率 b', s1lgD: '人均死亡率 d', s1lgPos: '净增长率为正', s1lgNeg: '净增长率为负',
    c1a: '人均出生率与死亡率（每年）· 横轴：鱼数 N', c1b: '池塘（一个鱼形 = 10 条鱼，绿点 = 食物）',
    s1readout: 'N = {N} 条：人均出生率 b = {b}/年，人均死亡率 d = {d}/年，净增长率 b − d = {net}/年（即 r(1 − N/K) = 0.5 × (1 − {N}/{K})）。{verdict}',
    s1below: '低于 K：每条鱼平均仍在净添后代，种群会继续长大。',
    s1at: '恰好在 K：出生和死亡一样多，种群不增不减。',
    s1above: '高于 K：死去的比出生的多，种群会缩小回 K。',
    s1hint: '观察顺序：先只拖「现有鱼数」，看「人均出生率与死亡率」图里的竖线：两条线之间的间隔（绿色 = 净增长为正，红色 = 为负）随 N 均匀缩小，到 K 处为 0，再往右变成红色。然后只拖「食物供给」，两条线变得平缓、交点 K 右移；「池塘」图里同样多的鱼也显得没那么挤了。',

    s2k: '第 2 步 · 增长最快在哪',
    s2t: '整个种群在什么数量时增长得最快？',
    s2e: '这一步要回答：每条鱼的净增长率随 N 一路下降，可种群一年净增的总条数是 dN/dt = N ×（每条鱼的净增长率）= rN(1 − N/K)。一个因子在变大（鱼更多），另一个在变小（每条鱼贡献更少），乘积在哪里最大？在「每条鱼的净增长率」图里，这个乘积就是宽 N、高 r(1 − N/K) 的<strong>矩形面积</strong>。在「全种群的增长速度」图里，它画出一个驼峰：这条规则叫<strong>逻辑斯谛（logistic）增长</strong>。驼峰下方横轴上的箭头表示 N 往哪边走：K 左边向右、右边向左，都指向 K——数量偏离 K，反馈就把它推回来，所以 K 是一个<strong>稳定平衡点</strong>。',
    s2lgRate: '每条鱼的净增长率 r(1 − N/K)', s2lgRect: '矩形面积 = dN/dt', s2lgHump: '全种群增长速度 dN/dt', s2lgVisit: '扫过的点',
    c2a: '每条鱼的净增长率（每年）· 横轴：鱼数 N', c2b: '全种群的增长速度 dN/dt（条/年）· 横轴：鱼数 N',
    sweepN: '从 0 扫到 1400 条',
    s2readout: 'N = {N} 条：每条鱼净增 {pc}/年 × {N} 条 = 种群每年净增 {g} 条。驼峰最高处在 N = K/2 = {half} 条，那时每年净增 rK/4 = {max} 条。',
    s2hint: '观察顺序：拖鱼数 N（或按扫描），盯住「每条鱼的净增长率」图里的橙色矩形：N 小时它又窄又高，N 大时又宽又矮，在 K/2 处面积最大；同一时刻「全种群的增长速度」图里的白点就停在驼峰顶。N 超过 1000 后矩形翻到横轴下方，面积变负。',
    quizPrompt: '小测：鱼数刚好达到承载力 K 时，下面哪种说法正确？',
    quizA: '鱼停止繁殖了，所以数量不再增加',
    quizB: '每年出生和死去的鱼一样多，所以总数不变',
    quizC: '这时种群增长得最快',
    checkQuiz: '核对答案',
    correct: '对。在 N = K 处，人均出生率和死亡率都是 {bk}/年，不为零，只是相等：鱼照样在出生、在死去，只是两者抵消。增长最快的位置在 K/2。',
    wrong: '再想想。看第 1 步的图：在 N = K 处，出生率那条线并没有降到 0（本页是 {bk}/年），它只是和死亡率相等。增长最快的位置在驼峰顶 K/2，不在 K。',
    quizNone: '先选一个选项。',

    s3k: '第 3 步 · S 形曲线',
    s3t: '从 20 条鱼出发，数量随时间会走出什么形状？',
    s3e: '这一步要回答：把上一步的规则交给时间——每一刻都按 dN/dt = rN(1 − N/K) 前进，数量曲线会是什么样？开头 N 远小于 K，括号里接近 1，增长几乎就是第 0 步的指数增长；N 到 K/2 时最陡（驼峰顶）；越接近 K 越平。整条曲线是一个 S 形，叫<strong>逻辑斯谛曲线</strong>。从 K 以上出发时 dN/dt 为负，曲线从上方回落到 K。',
    n0Slider: '初始鱼数 N₀（条）', rSlider: '内禀增长率 r（每年）', k3Slider: '承载力 K（条）', tSlider: '时间 t（年）',
    play3: '播放 30 年',
    s3lgN: '逻辑斯谛曲线 N(t)', s3lgExp: '同样 r 的指数增长', s3lgTan: '当前斜率 dN/dt', s3lgTrail: '走过的点',
    c3a: '鱼的数量 N（条）· 横轴：时间 t（年）', c3b: '增长速度 dN/dt · 横轴：N',
    s3readout: 't = {t} 年：N = {N} 条，此刻斜率 dN/dt = {g} 条/年（就是「增长速度」图上白点的高度）。同一个 r 的指数增长此时已是 {ne} 条。{extra}',
    s3extraS: '曲线在 t ≈ {ti} 年最陡（N = K/2）；到 90% K 用时 {t90} 年。',
    s3extraHalf: '起点已超过 K/2，所以没有加速段，一开始就在减速；到 90% K 用时 {t90} 年。',
    s3extraHigh: '起点已在 90% K 以上：曲线{dir}贴近 K。',
    s3dirDown: '从上方回落，', s3dirUp: '只剩缓慢',
    s3hint: '观察顺序：按「播放」，盯住「增长速度」图里的白点：它沿驼峰先爬上去、再滑下来；同时「鱼的数量」图里的切线先变陡、后变平。然后把 r 加倍：S 形整体在时间上压缩一半，但终点仍是 K。把 N₀ 拖到 K 以上：白点落在驼峰右侧的负值区，曲线向下回到 K。',

    s4k: '第 4 步 · 捕捞',
    s4t: '每年捞走固定条数的鱼，多少是可持续的？',
    s4e: '这一步要回答：人每年从湖里捞走固定的 H 条鱼，鱼群还能维持吗？现在每年的净变化 = 自然增长 rN(1 − N/K) − H（r = 0.5/年，K = 1000 条）。在「自然增长与捕捞」图里，H 是一条水平线：驼峰高过它的地方鱼在变多，低于它的地方在变少。两者相交处数量不再变化，叫<strong>平衡点</strong>。驼峰顶 rK/4 = 125 条/年叫<strong>最大可持续产量</strong>：H 不超过它，鱼群能停在某个数量上；超过它，水平线整段压在驼峰之上，无论有多少鱼都在减少，最后被捞光。',
    hSlider: '每年捕捞量 H（条/年）',
    s4lgHump: '自然增长 rN(1 − N/K)', s4lgH: '捕捞量 H', s4lgStable: '稳定平衡（会回来）', s4lgUnstable: '不稳定平衡（一碰就走）', s4lgGhost: '之前试过的 H',
    c4a: '自然增长与捕捞（条/年）· 横轴：鱼数 N', c4b: '从 1000 条开始的 60 年 · 鱼数 N',
    s4stable: 'H = {H} 条/年（最大可持续产量 125）：鱼群从 1000 条降下来，稳定在 {hi} 条。另一个平衡点 {lo} 条是不稳定的：数量一旦跌破它（比如一个坏年份），即使 H 不变也会一路减到 0。',
    s4edge: 'H = 125 条/年，正好等于最大可持续产量：两个平衡点合成一个（500 条）。鱼群缓慢逼近 500 条，60 年后还在 {n60} 条；任何额外的损失都会让它滑向崩溃。',
    s4crash: 'H = {H} 条/年，超过最大可持续产量 125：没有平衡点，自然增长最多每年 125 条，总比 H 少。鱼群在第 {tc} 年被捞光。',
    s4crashLate: 'H = {H} 条/年，超过最大可持续产量 125：没有平衡点。鱼群在第 {tc} 年被捞光（超出图上的 60 年，曲线在 500 条附近停留很久才开始加速下滑）。',
    s4hint: '观察顺序：从 H = 50 开始，每次往右拖 25：「从 1000 条开始的 60 年」图里，灰色保留的每条曲线停在越来越低的位置。越过 125 后曲线不再停住，而是掉到 0。重点看 H 从 120 拖到 130：只多捞 10 条，结局从「稳在 600 条」变成「第 55 年捞光」。',

    s5k: '第 5 步 · 捕食者',
    s5t: '再放进吃这种鱼的捕食者，两个种群会怎样起落？',
    s5e: '这一步要回答：湖里来了专吃这种鱼的捕食者（比如狗鱼），猎物数 N 和捕食者数 P 会怎样变化？猎物：逻辑斯谛增长（r = 0.5/年、K = 1000 条）减去被吃掉的 aNP 条/年。<strong>捕食率 a</strong>：一条捕食者每年碰上并吃掉的猎物占猎物总数的比例，碰面越多吃得越多。捕食者：每吃 20 条鱼繁殖出一条（转化率 0.05），所以每年新增 0.05·aNP 条；又以<strong>人均死亡率 m</strong> 死去，每年少 mP 条。这是一个回路：猎物多 → 捕食者吃饱、变多 → 猎物被吃得多、变少 → 捕食者挨饿、变少 → 猎物恢复……捕食者要先吃够才多得起来，所以它的峰值总落在猎物峰值<strong>之后</strong>（<a class="xlink" href="../../../math/calculus/ode-phase-portraits/#step5">→ 相图页第 5 步：给猎物加上拥挤，闭圈为什么变成螺旋</a>）。',
    aSlider: '捕食率 a（每条捕食者每年）', mSlider: '捕食者人均死亡率 m（每年）',
    play5: '播放 80 年',
    s5lgPrey: '猎物 N', s5lgPred: '捕食者 P', s5lgPeak: '各自第一个峰', s5lgEq: '平衡点', s5lgStart: '起点',
    c5a: '猎物 N（条）· 横轴：时间 t（年）', c5aP: '捕食者 P（条）· 横轴：时间 t（年）', c5b: '相平面：横轴猎物 N，纵轴捕食者 P',
    s5readout: '从 100 条猎物、5 条捕食者出发：猎物在第 {tn} 年第一次达到峰值 {nn} 条；捕食者在第 {tp} 年达到峰值 {pp} 条，晚了 {lag} 年。之后起落逐渐变小，两者趋向平衡：猎物 N* = m/(0.05·a) = {Ne} 条，捕食者 P* = {Pe} 条。没有捕食者时猎物会停在 K = 1000 条。',
    s5noPeak: '从 100 条猎物、5 条捕食者出发：猎物在第 {tn} 年达到峰值 {nn} 条，捕食者没有冲过头，一路慢慢升到平衡值。平衡点：猎物 N* = m/(0.05·a) = {Ne} 条，捕食者 P* = {Pe} 条。',
    s5extinct: '捕食者活不下去：要让捕食者的出生抵得上死亡，猎物至少要有 m/(0.05·a) = {Ne} 条，可这片水域最多只养得住 K = 1000 条。捕食者逐渐消失，猎物回到 K。',
    s5progress: '已播放 {c} / 80 年。',
    s5hint: '观察顺序：按「播放」，看两张时间图上的竖虚线：青色（猎物第一个峰）总在橙色（捕食者第一个峰）左边。在「相平面」图里，轨迹沿逆时针一圈圈向内收向白色 +：每转一圈就是一次「猎物先涨、捕食者后涨」。然后只把 m 往右拖：白色 + 向右移——捕食者越容易死，猎物的平衡数量反而越多。',

    s6k: '第 6 步 · 收束',
    s6t: '这一页的模型能说明什么，不能说明什么？',
    s6fin: '一条线索贯穿全页：<strong>增长速度 = 数量 × 每个个体的净增长率</strong>。没有限制时净增长率是常数 r，结果是指数增长；拥挤让净增长率随 N 直线下降到 0（在 K 处出生 = 死亡），结果是 S 形曲线，增长最快在 K/2；捕捞相当于从增长里每年扣掉一个常数，超过驼峰顶 rK/4 就没有平衡点；捕食者把两个种群接成回路，峰值相错、振荡渐收。',
    formula: '指数：dN/dt = rN\n逻辑斯谛：dN/dt = rN(1 − N/K)\n捕捞：dN/dt = rN(1 − N/K) − H\n捕食：dN/dt = rN(1 − N/K) − aNP，dP/dt = 0.05·aNP − mP',
    boundary: '适用范围：这些都是确定性、连续时间、无年龄结构的模型，参数取的是示意值。真实种群还有季节性繁殖、发育时滞、随机波动和环境变化（K 本身会变）；有时滞时种群可能冲过 K 再振荡，数量很小时随机事件可能让它直接灭绝。这些现象本页没有模拟。',
    linksTitle: '接着去看',
    lk1: '→ 逻辑斯谛增长页第 4 步：模型在哪里失效（r 太大时会怎样）',
    lk2: '→ 相图页第 5 步：给猎物加拥挤，闭圈变成螺旋',
    lk3: '→ 食物网页第 2 步：拿走一个物种，其他物种怎样连锁变化',
    lk4: '→ 指数与对数页第 0 步：翻倍为什么快得出乎意料',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《种群生态学 · 增长如何被反馈改变》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Population Ecology · Growth Reshaped by Feedback”.'
  },
  en: {
    pageTitle: 'Population Ecology · One Feedback Loop Bends Growth',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Population Ecology · Growth Reshaped by Feedback →',
    navLabel: 'Population ecology steps',
    tagline: 'Put 20 fish into a lake. Will they keep multiplying forever? This page starts from “how much does each fish add per year”, watches crowding drag that number down and bend an exponential into an S, then plugs fishing and predators into the same feedback loop. Every curve is a model simulation, not field data.',
    nav0: '0 No limits', nav1: '1 Crowding', nav2: '2 Fastest where', nav3: '3 S curve', nav4: '4 Fishing', nav5: '5 Predators', nav6: '6 Wrap-up',

    s0k: 'Step 0 · No limits',
    s0t: 'With unlimited food and space, how long until the fish double?',
    s0e: 'The question: release 20 fish into a lake with no shortage of food or room. How does the count N grow? The average number of offspring one fish produces in a year is the <strong>per-capita birth rate b</strong>; the average chance that a fish dies within a year is the <strong>per-capita death rate d</strong> (both per year). Their difference r = b − d is the <strong>intrinsic growth rate</strong>: the net share each fish adds to the population per year when nothing holds it back. So the population’s growth speed dN/dt (fish per year) is r × N. More fish add more fish, and the curve keeps steepening. That is <strong>exponential growth</strong>, and its signature is that every equal stretch of time multiplies the count by the same factor (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ Exponents &amp; logarithms, step 0: why multiplying outruns adding</a>).',
    bSlider: 'Per-capita birth rate b (per year)', dSlider: 'Per-capita death rate d (per year)',
    s0lgN: 'Count N(t)', s0lgDbl: 'Each doubling', s0lgGhost: 'Settings you tried earlier',
    c0: 'Number of fish N · across: time t (years)',
    s0up: 'r = b − d = {r} per year → the count doubles every ln2 / r ≈ {td} years. After 10 years N = 20 × e^(10r) ≈ {n10} fish, about {k} doublings.',
    s0down: 'r = b − d = {r} per year (negative) → the population shrinks, halving every ln2 / |r| ≈ {td} years. About {n10} fish remain after 10 years.',
    s0flat: 'r = b − d = 0: births exactly cancel deaths and the count stays at 20.',
    s0hint: 'What to watch: hold d still and drag b right. The orange dashed verticals (the moments of each doubling) crowd together, yet neighbouring lines stay equally spaced: that is “double every fixed interval”. Then drag d past b and the curve turns downward. Thin grey lines keep the settings you tried; the vertical axis rescales to the current curve.',

    s1k: 'Step 1 · Getting crowded',
    s1t: 'As the fish multiply, what happens to each fish’s births and deaths?',
    s1e: 'The question: once food is limited, is “net fish added per fish per year” still the constant r? With more fish, each one gets less food and lays fewer eggs, so the per-capita birth rate b falls; crowding also brings hunger and disease, so the per-capita death rate d rises. This page uses the simplest assumption: both change along <strong>straight lines</strong> as the count N grows. Where the lines cross, births exactly cancel deaths; that count is the <strong>carrying capacity K</strong>, the number of fish this lake can support in the long run, set by how much food there is. Left of the crossing b > d and each fish’s net growth rate b − d is positive; right of it, negative. That net-rate line can be written r(1 − N/K): every 10% of K added to N takes 10% off r.',
    nSlider: 'Fish in the lake now, N', kSlider: 'Food supply → carrying capacity K (fish)',
    s1lgB: 'Per-capita birth rate b', s1lgD: 'Per-capita death rate d', s1lgPos: 'Net rate positive', s1lgNeg: 'Net rate negative',
    c1a: 'Per-capita birth and death rates (per year) · across: N', c1b: 'The pond (one fish shape = 10 fish, green = food)',
    s1readout: 'N = {N} fish: birth rate b = {b} per year, death rate d = {d} per year, net rate b − d = {net} per year (that is r(1 − N/K) = 0.5 × (1 − {N}/{K})). {verdict}',
    s1below: 'Below K: the average fish still adds offspring, so the population keeps growing.',
    s1at: 'Exactly at K: as many fish are born as die, and the count holds steady.',
    s1above: 'Above K: more fish die than are born, and the population shrinks back toward K.',
    s1hint: 'What to watch: first drag only “Fish in the lake now” and follow the vertical line in the birth-and-death chart. The gap between the two lines (green = positive net rate, red = negative) shrinks evenly as N grows, closes at K, then turns red. Next drag only “Food supply”: both lines flatten and the crossing K moves right; in the pond view the same number of fish looks less crowded.',

    s2k: 'Step 2 · Where growth peaks',
    s2t: 'At what size does the whole population grow fastest?',
    s2e: 'The question: each fish’s net rate falls steadily with N, but the number of fish the population gains per year is dN/dt = N × (net rate per fish) = rN(1 − N/K). One factor grows (more fish), the other shrinks (each contributes less). Where is the product largest? In the per-fish chart that product is the <strong>area of a rectangle</strong> N wide and r(1 − N/K) tall. In the whole-population chart it traces a hump; this rule is called <strong>logistic growth</strong>. The arrows on the axis under the hump show which way N moves: rightward below K, leftward above it, both toward K. Knock the count off K and the feedback pushes it back, so K is a <strong>stable equilibrium</strong>.',
    s2lgRate: 'Net rate per fish r(1 − N/K)', s2lgRect: 'Rectangle area = dN/dt', s2lgHump: 'Whole-population growth dN/dt', s2lgVisit: 'Points swept',
    c2a: 'Net growth rate per fish (per year) · across: N', c2b: 'Whole-population growth dN/dt (fish/yr) · across: N',
    sweepN: 'Sweep from 0 to 1400 fish',
    s2readout: 'N = {N} fish: each fish nets {pc} per year × {N} fish = the population gains {g} fish per year. The hump peaks at N = K/2 = {half} fish, where the gain is rK/4 = {max} fish per year.',
    s2hint: 'What to watch: drag N (or press sweep) and keep your eye on the orange rectangle in the per-fish chart. Small N gives a tall thin rectangle, large N a wide flat one, and the area is largest at K/2; at that moment the white dot in the whole-population chart sits on top of the hump. Past 1000 fish the rectangle flips below the axis and the area turns negative.',
    quizPrompt: 'Check: when the count reaches exactly the carrying capacity K, which statement is right?',
    quizA: 'The fish stop reproducing, so the count stops rising',
    quizB: 'As many fish are born each year as die, so the total stays put',
    quizC: 'This is when the population grows fastest',
    checkQuiz: 'Check answer',
    correct: 'Right. At N = K the per-capita birth and death rates are both {bk} per year, not zero, just equal: fish keep being born and keep dying, and the two cancel. Growth is fastest at K/2.',
    wrong: 'Not quite. Look back at step 1: at N = K the birth-rate line has not dropped to 0 (it is {bk} per year here); it has only met the death rate. The fastest growth is at the top of the hump, K/2, not at K.',
    quizNone: 'Pick an option first.',

    s3k: 'Step 3 · The S curve',
    s3t: 'Starting from 20 fish, what shape does the count trace over time?',
    s3e: 'The question: hand the rule from the last step to time, letting the count advance by dN/dt = rN(1 − N/K) at every instant. What does the curve look like? Early on N is far below K, the bracket is close to 1, and growth is almost the exponential of step 0. The curve is steepest when N reaches K/2 (the top of the hump) and flattens as it nears K. The whole thing is an S, the <strong>logistic curve</strong>. Start above K and dN/dt is negative, so the curve falls back down to K.',
    n0Slider: 'Starting count N₀ (fish)', rSlider: 'Intrinsic growth rate r (per year)', k3Slider: 'Carrying capacity K (fish)', tSlider: 'Time t (years)',
    play3: 'Play 30 years',
    s3lgN: 'Logistic curve N(t)', s3lgExp: 'Exponential with the same r', s3lgTan: 'Current slope dN/dt', s3lgTrail: 'Points passed',
    c3a: 'Number of fish N · across: time t (years)', c3b: 'Growth dN/dt · across: N',
    s3readout: 't = {t} years: N = {N} fish and the slope is dN/dt = {g} fish per year (the height of the white dot in the growth chart). Exponential growth with the same r would already be at {ne} fish. {extra}',
    s3extraS: 'The curve is steepest near t ≈ {ti} years (N = K/2) and reaches 90% of K after {t90} years.',
    s3extraHalf: 'It starts above K/2, so there is no speeding-up phase: it decelerates from the start and reaches 90% of K after {t90} years.',
    s3extraHigh: 'It starts above 90% of K, so the curve {dir}K.',
    s3dirDown: 'falls back down to ', s3dirUp: 'only creeps up to ',
    s3hint: 'What to watch: press Play and follow the white dot in the growth chart. It climbs the hump and slides back down while the tangent in the count chart steepens and then flattens. Now double r: the S squeezes into half the time but still ends at K. Drag N₀ above K: the white dot lands in the negative region right of the hump and the curve heads down to K.',

    s4k: 'Step 4 · Fishing',
    s4t: 'If people take a fixed number of fish every year, how much is sustainable?',
    s4e: 'The question: people remove a fixed H fish from the lake each year. Can the population hold on? The yearly change is now natural growth rN(1 − N/K) minus H (with r = 0.5 per year and K = 1000 fish). In the growth-and-catch chart H is a horizontal line: wherever the hump is above it the fish increase, wherever below they decline. Where they cross the count stops changing; that is an <strong>equilibrium</strong>. The top of the hump, rK/4 = 125 fish per year, is the <strong>maximum sustainable yield</strong>. Keep H at or below it and the population settles at some size; go above it and the line sits over the whole hump, so the fish decline at every count until none are left.',
    hSlider: 'Yearly catch H (fish/yr)',
    s4lgHump: 'Natural growth rN(1 − N/K)', s4lgH: 'Catch H', s4lgStable: 'Stable equilibrium (returns)', s4lgUnstable: 'Unstable equilibrium (tips away)', s4lgGhost: 'Catches you tried earlier',
    c4a: 'Natural growth and catch (fish/yr) · across: N', c4b: '60 years from 1000 fish · count N',
    s4stable: 'H = {H} fish per year (maximum sustainable yield 125): the population drops from 1000 and settles at {hi} fish. The other equilibrium, {lo} fish, is unstable: if the count ever slips below it (a bad year, say), it slides all the way to 0 even with H unchanged.',
    s4edge: 'H = 125 fish per year, exactly the maximum sustainable yield: the two equilibria merge into one at 500 fish. The population creeps toward 500 and is still at {n60} after 60 years; any extra loss tips it into collapse.',
    s4crash: 'H = {H} fish per year, above the maximum sustainable yield of 125: there is no equilibrium. Natural growth never exceeds 125 per year, always less than H, and the lake is fished out in year {tc}.',
    s4crashLate: 'H = {H} fish per year, above the maximum sustainable yield of 125: there is no equilibrium. The lake is fished out in year {tc} (beyond the 60 years shown: the curve lingers near 500 for a long time before the slide speeds up).',
    s4hint: 'What to watch: start at H = 50 and step right by 25 each time. In the 60-year chart every kept grey curve levels off lower. Past 125 the curves stop levelling off and drop to 0. Pay special attention to moving H from 120 to 130: ten more fish a year turns “steady at 600” into “fished out in year 55”.',

    s5k: 'Step 5 · Predators',
    s5t: 'Add a predator that eats these fish: how do the two populations rise and fall?',
    s5e: 'The question: a predator that lives on these fish (a pike, say) arrives. How do the prey count N and the predator count P change? Prey follow logistic growth (r = 0.5 per year, K = 1000 fish) minus the aNP fish eaten per year. The <strong>attack rate a</strong> is the share of all prey that one predator meets and eats per year, so more encounters mean more meals. Predators turn every 20 fish eaten into one new predator (conversion 0.05), adding 0.05·aNP per year, and die at a <strong>per-capita death rate m</strong>, losing mP per year. It is a loop: many prey → predators eat well and multiply → more prey are eaten and prey fall → predators go hungry and fall → prey recover… Predators have to eat before they can multiply, so their peak always comes <strong>after</strong> the prey peak (<a class="xlink" href="../../../math/calculus/ode-phase-portraits/#step5">→ Phase portraits, step 5: why crowding the prey turns closed loops into spirals</a>).',
    aSlider: 'Attack rate a (per predator per year)', mSlider: 'Predator death rate m (per year)',
    play5: 'Play 80 years',
    s5lgPrey: 'Prey N', s5lgPred: 'Predators P', s5lgPeak: 'First peak of each', s5lgEq: 'Equilibrium', s5lgStart: 'Start',
    c5a: 'Prey N · across: time t (years)', c5aP: 'Predators P · across: time t (years)', c5b: 'Phase plane: prey N across, predators P up',
    s5readout: 'Starting from 100 prey and 5 predators: prey first peak in year {tn} at {nn} fish; predators peak in year {tp} at {pp}, {lag} years later. The swings then shrink and both settle toward equilibrium: prey N* = m/(0.05·a) = {Ne} fish, predators P* = {Pe}. Without predators the prey would stop at K = 1000.',
    s5noPeak: 'Starting from 100 prey and 5 predators: prey peak in year {tn} at {nn} fish, while the predators never overshoot and rise slowly to equilibrium. Equilibrium: prey N* = m/(0.05·a) = {Ne} fish, predators P* = {Pe}.',
    s5extinct: 'The predators cannot survive: for their births to keep up with deaths the prey would have to number at least m/(0.05·a) = {Ne}, but this lake supports at most K = 1000. The predators fade out and the prey return to K.',
    s5progress: 'Played {c} / 80 years. ',
    s5hint: 'What to watch: press Play and watch the dashed verticals in both time charts: the cyan one (first prey peak) is always left of the orange one (first predator peak). In the phase plane the path circles counter-clockwise and spirals in toward the white +; each lap is one round of “prey rise first, predators follow”. Then drag only m to the right: the white + moves right. The easier predators die, the more prey there are at equilibrium.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What can these models explain, and what can they not?',
    s6fin: 'One thread runs through the page: <strong>growth speed = count × each individual’s net growth rate</strong>. Without limits the net rate is a constant r and growth is exponential. Crowding drags the net rate down in a straight line to 0 (births equal deaths at K), giving the S curve with its fastest growth at K/2. Fishing subtracts a constant from growth each year, and above the hump’s peak rK/4 no equilibrium is left. Predators join two populations into a loop whose peaks are offset and whose swings die down.',
    formula: 'Exponential: dN/dt = rN\nLogistic: dN/dt = rN(1 − N/K)\nFishing: dN/dt = rN(1 − N/K) − H\nPredation: dN/dt = rN(1 − N/K) − aNP, dP/dt = 0.05·aNP − mP',
    boundary: 'Scope: these are deterministic, continuous-time models with no age structure, and the parameters are illustrative. Real populations breed in seasons, take time to mature, fluctuate at random and live in changing surroundings (K itself moves). With a time lag a population can overshoot K and oscillate, and at very small counts a run of bad luck can wipe it out. None of that is simulated here.',
    linksTitle: 'Where to go next',
    lk1: '→ Logistic growth, step 4: where the model breaks down (what a large r does)',
    lk2: '→ Phase portraits, step 5: crowding the prey turns closed loops into spirals',
    lk3: '→ Food webs, step 2: remove one species and watch the knock-on effects',
    lk4: '→ Exponents & logarithms, step 0: why doubling outruns intuition',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《种群生态学 · 增长如何被反馈改变》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Population Ecology · Growth Reshaped by Feedback”.'
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
