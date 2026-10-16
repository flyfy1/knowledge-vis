'use strict';
/* ============================================================
   蒙特卡洛讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '蒙特卡洛 · 撒豆子算 π · 一步一交互',
    back: '← 知识索引',
    pageTitle: '蒙特卡洛',
    tagline: '算不出来的问题，可以撒豆子撒出来。在正方形里乱撒点，落在圆里的比例就是 π/4——于是数点就能算出 π。这一页从撒豆子算 π 开始，看清那条 1/√N 的收敛铁律，再把它用到没有公式的面积、布丰的针、和高维空间里。',
    nav0: '0 钩子', nav1: '1 比例即概率', nav2: '2 收敛铁律', nav3: '3 无公式的面积',
    nav4: '4 布丰投针', nav5: '5 高维', nav6: '6 终章 · 挑战',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 蒙特卡洛 Monte Carlo —— 一步一交互系列',
    play: '开始撒点', pause: '暂停', resume: '继续撒点',
    runLong: '开始长跑', resumeLong: '继续长跑', runDone: '长跑完成',
    runStart: '开始撒点',
    newSeed: '换一颗种子', reset: '重置',
    speedLab: '撒点速度',
    spdSlow: '慢 · 约 90 点/秒', spdMid: '中 · 约 1500 点/秒', spdFast: '快 · 约 3 万点/秒',
    stopAuto: '停止自动',
    cIn: '圆内', cOut: '圆外',
    dash: '—',

    s0k: '第 0 步 · 钩子',
    s0t: '一颗豆子不会算，一万颗会',
    s0e: '在正方形里均匀地乱撒点，中间画一个内切圆。落在圆里的点数 ÷ 总点数，就是圆与正方形的<strong>面积比</strong>——而这个比值恰好是 π/4。所以不用量、不用算，只要数点，π 就会自己浮出来：<strong>π̂ = 4 × 圆内点数 / 总点数</strong>。看右上角的读数：点撒得越多，π̂ 越贴近 3.14159…',
    s0ro: 'N = {n} · 圆内 <span>{inside}</span> · π̂ = <span>{pi}</span> · |π̂ − π| = {err} · 种子 {seed}',
    s0ro0: 'N = 0 · 还没落点，π̂ 还不存在——点一落下它就诞生',
    s0thin: '（画面最多显示 {cap} 个点，超出后只计数不画点；计数始终是全量真实的）',
    s0hint: '盯着 π̂ 看：一开始它上蹿下跳，点过了一万，它就开始「懒得动」了。但它变稳的速度慢得很有规律——第 2 步会把这条脾气画成曲线，你会看到一条谁也逃不掉的铁律。本页所有随机数都来自带种子的伪随机发生器（mulberry32）：同一颗种子，点列逐点重现，第 6 步现场验给你看。',

    s1k: '第 1 步 · 比例即概率',
    s1t: '频率多起来，就会露出概率的脸',
    s1e: '慢下来，一颗一颗看。每颗点落在圆内还是圆外，是一次随机事件；撒得多了，「落在圆内」的<strong>频率</strong>会贴上它的<strong>概率</strong>，而概率就是面积比。这里藏着关键的约分：圆面积 πr² 与它外接正方形面积 (2r)² 之比 = π/4，<strong>r 被约掉了</strong>——所以换半径，比例纹丝不动。撒点范围是圆的外接正方形，切到 r = 0.3，圆和正方形同比例缩小，亲手验一验。',
    s1rLab: '圆半径 r（撒点范围 = 圆的外接正方形）',
    dropOne: '撒一颗', autoSlow: '自动慢撒',
    s1ro: 'r = {r} · N = {n} · 圆内 <span>{inside}</span> · 实测圆内率 <span>{rate}</span> · 理论 π/4 ≈ 0.7854 · π̂ = <span>{pi}</span>',
    s1ro0: 'r = {r} · 还没撒点——点「撒一颗」，看第一颗落在圆内还是圆外',
    s1hint: '单颗点什么都说明不了：它要么在内，要么在外，没有「0.7854 颗落在圆内」这回事。概率不是某一颗点的属性，是点多了之后，频率自己露出来的脸——这就是大数定律在干活，它是概率线后面几页的地基。',

    s2k: '第 2 步 · 收敛铁律',
    s2t: '慢，但明码标价的慢',
    s2e: '把 π̂ 随 N 的变化画成一条轨迹（横轴是对数刻度）。浅色带是误差带：π ± 2σ，其中 σ = 4√(p̂(1−p̂)/N)，p̂ 是轨迹在该点处的圆内率。注意带宽的收法：<strong>N 每变 100 倍，带才收窄 10 倍</strong>——这就是 1/√N 铁律：想多准一位小数，点数要乘以 100。再切到「20 颗种子同跑」：20 条轨迹拧成一束，束的宽度（实测标准差）和理论 σ 一起按同样的速度收窄。 <a class="fourier-link" href="../clt/#step3">σ/√n 是条铁律：去看它被 log-log 图验明的样子 →</a>',
    s2modeLab: '模式', s2single: '单颗种子', s2multi: '20 颗种子同跑',
    s2roS: 'N = {n} · π̂ = <span>{pi}</span> · 当前 2σ = {band}（σ = 4√(p̂(1−p̂)/N)）· 种子 {seed}',
    s2roSdone: '长跑到站：N = {n} · π̂ = <span>{pi}</span> · 2σ = {band} · 种子 {seed}',
    s2roM: '每条 N = {n} · 20 条 π̂ 的实测标准差 = <span>{emp}</span> · 理论 σ = {theo}（σ = 4√(p(1−p)/N)，p 取 π/4）· 种子 {seed} 起共 20 颗',
    s2miles: '里程碑 |π̂ − π|：',
    s2milePend: '未到',
    cBandLab: 'π ± 2σ 带', cPiLab: 'π = 3.14159…', cTrajLab: 'π̂(N)', cAxisN: 'N（对数轴）',
    s2hint: '里程碑处的实测误差，偶尔会比 2σ 还大——这不奇怪：2σ 只承诺大约 95% 的把握，不是铁包。蒙特卡洛的诚实恰恰在这里：它慢，但它连「自己有多不准」都给你一个数字。',

    s3k: '第 3 步 · 无公式的面积',
    s3t: '没有公式？撒就完了',
    s3e: '换上一个心形：它由右边的隐式方程定义，面积没有顺手的公式可套（硬算要上重积分）。但撒点不在乎有没有公式：在包围盒里均匀撒点，<strong>面积估值 = 包围盒面积 × 落入率</strong>。读数里的参考值不是解析真值，是用 1600×1600 的密网格一格一格数出来的数值积分——把口径摆在明处，估值慢慢贴上它，就是蒙特卡洛在干正经活。 <a class="fourier-link" href="../convolution/#step3">面积在卷积页是另一种算出法：输出 = 重叠面积 →</a>',
    s3formulaNote: '心形的定义方程。落入判定就是把点的坐标代进去看不等式成不成立——没有第二句规则。',
    s3shapeLab: '形状',
    shHeart: '心形', shStar: '五角星', shBlob: '云朵',
    s3defHeart: '心形：隐式方程 (x²+y²−1)³ − x²y³ ≤ 0 的区域（局部坐标，包围盒 2.5 × 2.45）。',
    s3defStar: '五角星：外接圆半径 1 的正五角星多边形（顶点在单位圆上，内角半径 ≈ 0.382），落入判定 = 点在多边形内。',
    s3defBlob: '云朵：极坐标曲线 ρ(θ) = 0.78 + 0.16·sin 3θ + 0.09·cos 5θ 围成的区域，落入判定 = 点的极径 ≤ ρ(θ)。',
    s3ro: '{def}<br>N = {n} · 落入 <span>{inside}</span>（率 {rate}）· 面积估值 = <span>{est}</span> · 网格参考 {ref} · 偏差 <span>{dev}</span> · 种子 {seed}',
    s3ro0: '{def}<br>参考值 {ref} 已由 1600×1600 网格算好（数值积分，非解析真值）。种子 {seed}——点「开始撒点」，看估值怎么贴上它。',
    s3hint: '积分的本质是「数格子」：网格法把格子摆整齐了数，网格越细越准、格子数却平方地涨；蒙特卡洛把格子换成运气，精度只认 1/√N。形状越怪，公式越先投降，而撒点永远只有一句「数就行」。第 5 步你会看到：到了高维，网格连投降的机会都没有。',

    s4k: '第 4 步 · 布丰投针',
    s4t: 'π 还能从「撞线」里掉出来',
    s4e: '地板上画等距平行线（间距 d），把一根长 L 的针随机抛下去：针的中心位置均匀、朝向 θ 在 [0, π) 上均匀。它压到线的概率是 <strong>P = 2L / (πd)</strong>——反解出来，<strong>π̂ = 2L · N / (d · 相交数)</strong>。1777 年布丰提出这个问题时没有计算机，他是靠真人一根根扔针数出来的。注意公式成立要求 L ≤ d，滑杆就卡在 1.0。',
    s4lenLab: '针长 L / 线距 d',
    dropNeedle: '扔一根', autoDrop: '自动连扔', drop100: '连扔 ×100',
    s4ro: 'L/d = {ld} · N = {n} · 相交 <span>{cross}</span> · π̂ = <span>{pi}</span> · 理论相交概率 2L/(πd) = {p}',
    s4roNoCross: 'L/d = {ld} · N = {n} · 相交 0 · π̂ = —（还没有针相交）· 理论相交概率 = {p}',
    cCross: '相交', cMiss: '未相交',
    s4hint: '和第 0 步是同一台机器，只是把「面积比」换成了「撞线概率」：π̂ 的分母是相交数，所以开局相交太少时它会疯狂跳动，扔得多了才肯稳下来。概率这东西不住在公式里，住在重复里。',

    s5k: '第 5 步 · 高维',
    s5t: '网格死了，豆子还活着',
    s5e: '把撒点搬进 d 维：单位超立方体 [0,1]<sup>d</sup> 里内切一个半径 0.5 的超球，它的体积比真值是 π<sup>d/2</sup>·(0.5)<sup>d</sup> / Γ(d/2+1)。网格法先死给你看：哪怕每维只取 10 个点，总数就是 <strong>10<sup>d</sup></strong>——维度一高，没开始算就结束了。而撒点的<strong>绝对</strong>误差依旧 ~1/√N，不随维度变；代价转嫁成另一件事：高维里超球的体积占比小得可怜，命中越来越稀有（盯着命中数看）。左图画的是点的前两维投影，落入判定用的却是全部 d 维。',
    s5dimLab: '维度 d',
    s5ro: 'd = {d} · N = {n} · 命中 <span>{hits}</span> · 体积比估值 = <span>{est}</span> · 真值 {tru} · 相对偏差 {rel} · 种子 {seed}',
    s5grid: '网格法：每维 10 点 → 10<sup>{d}</sup> = {grid} 个点，按每秒评估 1 亿次需要 {t10}；每维加密到 100 点 → 10<sup>{e100}</sup> 个点需要 {t100}。撒点这边，N 和维度无关。',
    s5warnLow: '⚠ 命中只有 {hits} 个，这个估值还飘得很（命中太少时相对误差 ≈ 1/√命中数）——先别把它当结论，继续撒，让命中多起来再看。',
    cProj: '前两维投影（判定用全部维度）', cTrue: '各维体积比真值（对数）', cEstMk: '估值',
    s5hint: '真实世界的高维积分——电影渲染里光线怎么走、期权怎么定价、粒子在反应堆里乱撞——维度动不动几十上百。网格在那儿连「开始」都做不到，所以这些行业全在撒豆子：不是它多聪明，是别无选择。',

    s6k: '第 6 步 · 终章',
    s6t: '随机数从哪来——以及一场挑战',
    s6e: '本页所有的「随机」都是<strong>带种子的伪随机</strong>（mulberry32 算法）：种子一给定，整条点列就被定死，同一颗种子必然逐点重现。这不是作弊，恰恰是科学实验要的品质——<strong>结果可复查</strong>。下面亲自验：记下某个种子撒出的前 10 个点，再点「用同一种子重演」，它们会一个不差地重新落一遍。',
    s6seedLab: '种子',
    s6first: '撒前 10 点并记下', s6replay: '用同一种子重演',
    s6roNone: '先点「撒前 10 点并记下」：会把该种子点列的前 10 个点坐标逐个列出来。',
    s6roFirst: '种子 {seed} 的前 10 个点已记下（图中编号与坐标一一对应）。点「用同一种子重演」验证。',
    s6roMatch: '重演完成：重新生成的 10 个点与第一次的坐标<strong>逐位一致 ✓</strong>——同一颗种子，同一条点列，分毫不差。',
    s6roDiff: '重演结果与第一次不一致——这不该发生，请把它当 bug 报出来。',
    s6ce: '<strong>挑战：用最少的点，把 π̂ 送进 3.14 ± 0.005</strong>（即落进 [3.135, 3.145]）。小批多次撒、每批后看读数，进了带就锁定达标点数。先把话说破：N 很小时就能进带，多半是<strong>运气</strong>；按 σ 估算，想让 2σ 都缩进这条带，需要约 43 万个点。真正让点变「值钱」的是方差缩减术——分层采样、对偶变量——是概率线后面的后话，本页只立路牌。',
    s6retry: '换种子重新挑战',
    s6ch: '挑战 · 种子 {seed} · N = {n} · π̂ = <span>{pi}</span> · 目标带 [3.135, 3.145]{state}',
    s6chIn: ' · <span class="good">已进带！达标点数 N = {n}</span>',
    s6chOut: ' · 还没进带',
    s6chBest: ' · 历史最佳（最少达标点数）= <b>{best}</b>',
    s6chBestNone: ' · 暂无达标记录',
    s6fin: '收个尾：蒙特卡洛不是某一道题的解法，是一台<strong>通用机器</strong>——把「算不出来的量」改写成「某个随机事件的概率」，剩下的交给重复。电影里的路径追踪在撒光线，期权定价在撒未来股价的路径，粒子输运在撒中子，天气预报的集合预报在撒几十个平行的天气。它算得慢，但它什么都敢算。本页立起的另两块地基——大数定律（第 1 步）与误差的正态面孔（第 2 步的轨迹束）——是概率线接下来<a class="fourier-link" href="../bayes/#step4">贝叶斯</a>与<a class="fourier-link" href="../clt/#step0">中心极限定理</a>两页的入口。',
    s6linkIdx: '← 回知识索引，看概率线的下一站',

    durS: '约 {v} 秒', durM: '约 {v} 分钟', durH: '约 {v} 小时', durD: '约 {v} 天', durY: '约 {v} 年',
    durTiny: '不到 1 秒', durHuge: '约 {v} 万年',
  },
  en: {
    docTitle: 'Monte Carlo · Counting Out π with Beans · One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Monte Carlo',
    tagline: 'Some problems cannot be solved — but they can be thrown at. Scatter points over a square and the fraction landing inside the circle is π/4, so counting points computes π. This page starts there, pins down the 1/√N law of convergence, and then takes the same machine to areas with no formula, Buffon’s needle, and high-dimensional space.',
    nav0: '0 Hook', nav1: '1 Ratio = probability', nav2: '2 The iron law', nav3: '3 Areas without formulas',
    nav4: '4 Buffon’s needle', nav5: '5 High dimensions', nav6: '6 Finale · Challenge',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Monte Carlo — one interaction at a time',
    play: 'Start dropping', pause: 'Pause', resume: 'Keep dropping',
    runLong: 'Start the long run', resumeLong: 'Resume the long run', runDone: 'Run complete',
    runStart: 'Start dropping',
    newSeed: 'New seed', reset: 'Reset',
    speedLab: 'Drop rate',
    spdSlow: 'Slow · ≈90 pts/s', spdMid: 'Medium · ≈1,500 pts/s', spdFast: 'Fast · ≈30,000 pts/s',
    stopAuto: 'Stop auto',
    cIn: 'inside', cOut: 'outside',
    dash: '—',

    s0k: 'Step 0 · The hook',
    s0t: 'One bean can’t count. Ten thousand can.',
    s0e: 'Scatter points uniformly over a square with a circle inscribed in it. (Points inside the circle) ÷ (points in total) is the <strong>area ratio</strong> of circle to square — and that ratio is exactly π/4. So there is no measuring and no formula: just count, and π surfaces on its own: <strong>π̂ = 4 × (inside / total)</strong>. Watch the readout — the more points fall, the closer π̂ creeps to 3.14159…',
    s0ro: 'N = {n} · inside <span>{inside}</span> · π̂ = <span>{pi}</span> · |π̂ − π| = {err} · seed {seed}',
    s0ro0: 'N = 0 · no points yet, so π̂ does not exist — it is born with the first point',
    s0thin: '(the canvas draws at most {cap} points; beyond that it only counts. The count is always the full, true count)',
    s0hint: 'Keep an eye on π̂: at first it leaps around wildly; past ten thousand points it barely wants to move. But the speed at which it settles is eerily regular — step 2 turns that temperament into a curve, and an iron law nobody escapes. Every random number on this page comes from a seeded pseudorandom generator (mulberry32): the same seed replays the same point sequence exactly, and step 6 proves it live.',

    s1k: 'Step 1 · Ratio is probability',
    s1t: 'Give frequency enough points and it shows probability’s face',
    s1e: 'Slow down and watch one point at a time. Each point lands inside or outside the circle — a random event. Drop enough of them and the <strong>frequency</strong> of “inside” settles onto its <strong>probability</strong>, and the probability is an area ratio. The key cancellation hides here: circle area πr² over its bounding square (2r)² equals π/4 — <strong>the r cancels</strong>. Change the radius and the ratio does not blink. Points are scattered over the circle’s bounding square; switch to r = 0.3 and circle and square shrink together. Check it yourself.',
    s1rLab: 'Circle radius r (points scatter over the bounding square)',
    dropOne: 'Drop one', autoSlow: 'Auto, slowly',
    s1ro: 'r = {r} · N = {n} · inside <span>{inside}</span> · measured rate <span>{rate}</span> · theoretical π/4 ≈ 0.7854 · π̂ = <span>{pi}</span>',
    s1ro0: 'r = {r} · no points yet — press “Drop one” and watch where the first point lands',
    s1hint: 'A single point proves nothing: it is either in or out — there is no such thing as “0.7854 of a point inside”. Probability is not a property of one point; it is the face that frequency reveals once points pile up. That is the law of large numbers at work, the foundation under the rest of the probability line.',

    s2k: 'Step 2 · The iron law',
    s2t: 'Slow — but the price is printed on the tag',
    s2e: 'Plot π̂ against N (log scale on the horizontal axis). The pale band is the error band: π ± 2σ, with σ = 4√(p̂(1−p̂)/N) and p̂ the inside-rate of the trajectory at that point. Watch how the band narrows: <strong>multiply N by 100 and the band shrinks only 10×</strong> — that is the 1/√N law: one more correct decimal digit costs a hundred times the points. Then switch to “20 seeds at once”: twenty trajectories twist into a bundle whose width (the measured standard deviation) shrinks in lockstep with the theoretical σ. <a class="fourier-link" href="../clt/#step3">σ/√n is an iron law: see it verified on a log-log plot →</a>',
    s2modeLab: 'Mode', s2single: 'One seed', s2multi: '20 seeds at once',
    s2roS: 'N = {n} · π̂ = <span>{pi}</span> · current 2σ = {band} (σ = 4√(p̂(1−p̂)/N)) · seed {seed}',
    s2roSdone: 'Run finished: N = {n} · π̂ = <span>{pi}</span> · 2σ = {band} · seed {seed}',
    s2roM: 'N per run = {n} · measured std of the 20 π̂ values = <span>{emp}</span> · theoretical σ = {theo} (σ = 4√(p(1−p)/N) with p = π/4) · 20 seeds starting at {seed}',
    s2miles: 'Milestone |π̂ − π|:',
    s2milePend: 'pending',
    cBandLab: 'π ± 2σ band', cPiLab: 'π = 3.14159…', cTrajLab: 'π̂(N)', cAxisN: 'N (log axis)',
    s2hint: 'Now and then a milestone error lands outside 2σ — no scandal: 2σ only promises roughly 95% confidence, not a guarantee. Monte Carlo’s honesty is exactly this: it is slow, but it hands you a number for how wrong it might be.',

    s3k: 'Step 3 · Areas without formulas',
    s3t: 'No formula? Just throw beans.',
    s3e: 'Swap in a heart: it is defined by the implicit equation on the right, and its area has no handy formula (doing it honestly means a double integral). Bean-throwing does not care whether a formula exists: scatter uniformly over the bounding box and <strong>area estimate = box area × hit rate</strong>. The reference in the readout is not an analytic truth — it is a numerical integral counted cell by cell on a 1600×1600 grid, with its method stated in the open. Watching the estimate settle onto it is Monte Carlo doing honest work. <a class="fourier-link" href="../convolution/#step3">Area computed another way on the convolution page: output = overlap area →</a>',
    s3formulaNote: 'The heart’s defining equation. The inside test is nothing more than plugging a point’s coordinates in and checking the inequality — there is no second rule.',
    s3shapeLab: 'Shape',
    shHeart: 'Heart', shStar: 'Star', shBlob: 'Blob',
    s3defHeart: 'Heart: the region (x²+y²−1)³ − x²y³ ≤ 0 in local coordinates (bounding box 2.5 × 2.45).',
    s3defStar: 'Star: a regular five-pointed star polygon with circumradius 1 (vertices on the unit circle, inner radius ≈ 0.382); the test is point-in-polygon.',
    s3defBlob: 'Blob: the region inside the polar curve ρ(θ) = 0.78 + 0.16·sin 3θ + 0.09·cos 5θ; the test is ρ(point) ≤ ρ(θ).',
    s3ro: '{def}<br>N = {n} · inside <span>{inside}</span> (rate {rate}) · area estimate = <span>{est}</span> · grid reference {ref} · deviation <span>{dev}</span> · seed {seed}',
    s3ro0: '{def}<br>Reference {ref} is ready, counted on a 1600×1600 grid (numerical integral, not an analytic truth). Seed {seed} — press “Start dropping” and watch the estimate settle onto it.',
    s3hint: 'Integration is, at heart, “count the cells”: a grid counts them in neat rows — finer is better, but the cell count grows quadratically; Monte Carlo swaps the cells for luck and its accuracy answers only to 1/√N. The weirder the shape, the sooner formulas surrender, while the beans keep saying “just count”. In step 5 you will see dimensions where the grid does not even get to surrender.',

    s4k: 'Step 4 · Buffon’s needle',
    s4t: 'π falls out of near-misses, too',
    s4e: 'Draw equally spaced parallel lines on the floor (spacing d) and toss a needle of length L at random: its centre is uniform, its direction θ uniform on [0, π). The probability that it crosses a line is <strong>P = 2L / (πd)</strong> — solve for π and you get <strong>π̂ = 2L · N / (d · crossings)</strong>. When Buffon posed this in 1777 there were no computers; he counted real needles thrown by hand. The formula needs L ≤ d, which is why the slider stops at 1.0.',
    s4lenLab: 'Needle length L / line spacing d',
    dropNeedle: 'Toss one', autoDrop: 'Auto-toss', drop100: 'Toss ×100',
    s4ro: 'L/d = {ld} · N = {n} · crossings <span>{cross}</span> · π̂ = <span>{pi}</span> · theoretical crossing probability 2L/(πd) = {p}',
    s4roNoCross: 'L/d = {ld} · N = {n} · crossings 0 · π̂ = — (no crossings yet) · theoretical crossing probability = {p}',
    cCross: 'crossing', cMiss: 'no cross',
    s4hint: 'Same machine as step 0, with “area ratio” swapped for “crossing probability”: the crossings sit in the denominator, so early on π̂ thrashes wildly and only calms down after many tosses. Probability does not live in formulas; it lives in repetition.',

    s5k: 'Step 5 · High dimensions',
    s5t: 'The grid dies; the beans live on',
    s5e: 'Move the throwing into d dimensions: inside the unit hypercube [0,1]<sup>d</sup> sits an inscribed hypersphere of radius 0.5, whose true volume ratio is π<sup>d/2</sup>·(0.5)<sup>d</sup> / Γ(d/2+1). Watch the grid die first: even a coarse 10 points per dimension needs <strong>10<sup>d</sup></strong> points in total — raise the dimension and it is over before it starts. The beans’ <strong>absolute</strong> error still follows ~1/√N, indifferent to dimension; the cost moves elsewhere — in high dimensions the sphere’s share of the cube is pitifully small, so hits get rare (keep an eye on the hit count). The picture shows the first two coordinates of each point; the inside test uses all d of them.',
    s5dimLab: 'Dimension d',
    s5ro: 'd = {d} · N = {n} · hits <span>{hits}</span> · volume-ratio estimate = <span>{est}</span> · true value {tru} · relative deviation {rel} · seed {seed}',
    s5grid: 'Grid method: 10 points per dimension → 10<sup>{d}</sup> = {grid} points; at 100 million evaluations per second that takes {t10}. Refine to 100 per dimension → 10<sup>{e100}</sup> points, taking {t100}. The beans’ N does not care about d.',
    s5warnLow: '⚠ Only {hits} hits so far — far too few: this estimate is still wobbling (with hits this scarce the relative error is ≈ 1/√hits). Do not treat it as a conclusion yet; keep dropping until the hits pile up.',
    cProj: 'first-two-coordinates projection (test uses all dims)', cTrue: 'true volume ratio by d (log scale)', cEstMk: 'estimate',
    s5hint: 'Real high-dimensional integrals — how light bounces in a film render, how an option is priced, how particles scatter inside a reactor — run to dozens or hundreds of dimensions. There the grid cannot even begin, which is why those industries all throw beans: not because it is clever, but because there is no alternative.',

    s6k: 'Step 6 · Finale',
    s6t: 'Where randomness comes from — and a challenge',
    s6e: 'Every “random” number on this page is <strong>seeded pseudorandomness</strong> (the mulberry32 algorithm): fix the seed and the entire point sequence is determined — the same seed replays it point for point. That is not cheating; it is exactly what a scientific experiment wants: <strong>results you can re-check</strong>. Verify it yourself below: record the first 10 points of a seed, then press “replay with the same seed” and watch them land again, one for one.',
    s6seedLab: 'Seed',
    s6first: 'Drop & record the first 10', s6replay: 'Replay with the same seed',
    s6roNone: 'Press “Drop & record the first 10”: the first 10 points of that seed’s sequence will be listed with coordinates.',
    s6roFirst: 'The first 10 points of seed {seed} are recorded (numbers on the plot match the list). Press “Replay with the same seed” to verify.',
    s6roMatch: 'Replay done: the regenerated 10 points match the first run’s coordinates <strong>digit for digit ✓</strong> — same seed, same sequence, not a hair different.',
    s6roDiff: 'The replay does not match the first run — that should never happen; please report it as a bug.',
    s6ce: '<strong>Challenge: land π̂ inside 3.14 ± 0.005</strong> (the band [3.135, 3.145]) <strong>with as few points as possible</strong>. Drop small batches, check the readout after each, and the score locks the moment you enter the band. Fair warning: entering the band at tiny N is mostly <strong>luck</strong>; by the σ arithmetic, squeezing even 2σ into this band takes roughly 430,000 points. What actually makes points “worth more” is variance reduction — stratified sampling, antithetic variates — signposted here, and part of the probability line’s later story.',
    s6retry: 'New seed, retry',
    s6ch: 'Challenge · seed {seed} · N = {n} · π̂ = <span>{pi}</span> · target band [3.135, 3.145]{state}',
    s6chIn: ' · <span class="good">In the band! Score N = {n}</span>',
    s6chOut: ' · not in the band yet',
    s6chBest: ' · best score so far (fewest points) = <b>{best}</b>',
    s6chBestNone: ' · no successful run yet',
    s6fin: 'To close: Monte Carlo is not the answer to one problem, it is a <strong>general-purpose machine</strong> — rewrite “a quantity I cannot compute” as “the probability of some random event”, then let repetition do the rest. Path tracing in films throws light rays; option pricing throws future price paths; particle transport throws neutrons; ensemble weather forecasting throws dozens of parallel weathers. It is slow, but it dares to compute anything. The two foundations laid on this page — the law of large numbers (step 1) and the normal face of error (the bundle in step 2) — are the door into the probability line’s next two pages: <a class="fourier-link" href="../bayes/#step4">Bayes</a> and the <a class="fourier-link" href="../clt/#step0">central limit theorem</a>.',
    s6linkIdx: '← Back to the index, for the probability line’s next stop',

    durS: '≈ {v} s', durM: '≈ {v} min', durH: '≈ {v} hours', durD: '≈ {v} days', durY: '≈ {v} years',
    durTiny: 'under 1 s', durHuge: '≈ {v}×10⁴ years',
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
