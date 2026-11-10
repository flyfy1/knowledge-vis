'use strict';
// Dissolution & saturation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '溶解与饱和 · 水能装下多少',
    back: '← 知识索引',
    compare: '对照另一版本：溶解与饱和 →',
    navLabel: '溶解与饱和步骤导航',
    tagline: '往水里一勺勺加盐，开始全化了，加到某个量就再也化不掉——水「装满」了。六步里你会找出这个上限由什么决定，看清「装满」其实是溶解和结晶一样快，再学会用温度和蒸发把溶质取回来，并分清「饱和」和「浓」不是一回事。',
    nav0: '0 加到不化', nav1: '1 饱和不是停', nav2: '2 升温', nav3: '3 浓不浓', nav4: '4 取回溶质', nav5: '5 收束',
    btnNaCl: '氯化钠 NaCl', btnKNO3: '硝酸钾 KNO₃', btnCa: '氢氧化钙 Ca(OH)₂',
    nmNaCl: '氯化钠', nmKNO3: '硝酸钾', nmCaOH2: '氢氧化钙',
    lgKNO3: '硝酸钾', lgNaCl: '氯化钠', lgCa: '氢氧化钙（熟石灰）',
    lgDissolved: '已溶解的溶质（点数按质量画）', lgSolid: '杯底溶不了的固体',
    tSlider: '水温 T（°C）',

    s0k: '第 0 步 · 加到不化',
    s0t: '一杯水最多能溶多少盐？这个上限由什么决定？',
    s0e: '这一步要回答：往水里加盐，为什么加到一定量就不再溶化？把盐放进水里，盐粒散成肉眼看不见的微粒，均匀地分布在水中，得到<strong>溶液</strong>：被溶解的盐叫<strong>溶质</strong>，溶解它的水叫<strong>溶剂</strong>。一定温度下，一定量的水能溶解的溶质有上限；达到上限、再也溶不了的溶液叫<strong>饱和溶液</strong>，还能继续溶的叫<strong>不饱和溶液</strong>。这个上限用<strong>溶解度</strong>来描述：某温度下 100 g 水里最多能溶解的溶质质量（g）。本步固定 20 °C。图中杯里的青点是已溶解的溶质（点数按质量比例画），杯底白色是溶不了的固体；杯旁的竖条是质量刻度（g），青色是已溶解的、白色是杯底剩下的，虚线是这杯水最多能溶的量。',
    massSlider0: '放入的溶质（g）', waterSlider0: '水（g）',
    c0: '20 °C 的一杯水', s0lgCap: '这杯水最多能溶的量',
    s0sat: '这是饱和溶液：再加也溶不了，多出的沉在杯底。',
    s0exact: '恰好饱和：一点不剩，但再加一点就溶不了了。',
    s0unsat: '这是不饱和溶液：还能再溶 {more} g。',
    s0readout: '{sub}在 20 °C 的溶解度是 {S} g，所以 {w} g 水最多能溶 {S} × {w} ÷ 100 = {cap} g。放入 {m} g：溶解 {d} g，杯底剩 {s} g。{state}',
    s0hint: '观察顺序：先保持 100 g 水，把放入量从 0 慢慢拖大，看到哪一格杯底开始出现白色固体（氯化钠是 36 g）；再把水改成 200 g，同样的量又全溶了——上限跟着水量翻倍；最后换成硝酸钾，同样 100 g 水在 20 °C 只能溶 31.6 g。上限取决于溶质种类、水的多少，还有温度（第 2 步）。',

    s1k: '第 1 步 · 饱和不是停',
    s1t: '饱和以后，溶解就停止了吗？',
    s1e: '这一步要回答：杯底固体不再变少，是因为溶解停了吗？固体表面的微粒不断有一些挣脱下来进入水中（<strong>溶解</strong>），水中的微粒也不断有一些碰到固体、又被抓回去（<strong>结晶</strong>）。固体表面大小不变时，每秒溶下来的量基本不变；水中溶解的微粒越多，碰上固体被抓回去的就越多。所以一开始几乎只溶不回，随后结晶越来越快，直到两者一样快：表面上什么都不变了，其实两个过程都在进行，这叫<strong>动态平衡</strong>（<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step0">→ 化学平衡第 0 步：动态平衡</a>）。这是一个教学用的粒子模型：每个点代表 0.1 g 氯化钠，20 °C、100 g 水，参数让上限正好是 36 g（第 0 步的溶解度）；随机数用固定种子，每次重来结果相同。最上面是烧杯（青点溶在水中，白块是杯底固体，粉色是做了标记的微粒）；中间是已溶解的质量随时间；最下面是每秒溶解和结晶的质量（最近 4 秒平均）。',
    massSlider1: '开始时放进的氯化钠（g）',
    run1: '播放 / 暂停', tag1: '放入 3 g 带标记的晶体', reset1: '重来',
    c1a: '烧杯（每个点 0.1 g）', c1b: '已溶解的质量（g）随时间（秒）', c1c: '每秒溶解、结晶的质量（g/s）',
    s1lgDis: '溶解速度', s1lgCry: '结晶速度', s1lgTag: '带标记的微粒', s1lgCap: '上限 36 g',
    s1run: '播放中。', s1pause: '已暂停。', s1end: '已到 {T} 秒。',
    s1sat: '溶解和结晶差不多一样快：已经饱和，进出相抵。',
    s1grow: '溶解比结晶快：溶液还在变浓。',
    s1gone: '固体已经溶完，溶液不饱和（还能再溶 {more} g），结晶也停了。',
    s1tag: '带标记的微粒：{ti} 个在水中，{ts} 个在杯底。',
    s1readout: '{prog}第 {t} 秒：水中已溶解 {d} g，杯底固体 {s} g。最近 4 秒平均每秒溶解 {rd} g、结晶 {rc} g。{state}{tag}',
    s1hint: '观察顺序：按「播放」，看中间的曲线升到 36 g 附近后不再上升，只在它上下小幅抖动，最下面橙色的结晶速度一路升高，最后和青色的溶解速度贴在一起。这时按「放入带标记的晶体」：杯底固体只多了 3 g、水中溶解的质量不变，粉色微粒却陆续出现在水中——溶解一直没停。再把开始的量调到 30 g 以下重来：固体全部溶完，结晶速度归零，溶液不饱和。',

    s2k: '第 2 步 · 升温',
    s2t: '水温升高，能多溶多少？',
    s2e: '这一步要回答：100 g 水里放 60 g 溶质，升温能不能全溶？不同物质一样吗？溶解度（100 g 水最多能溶的质量）随温度变化，画成曲线就是<strong>溶解度曲线</strong>。「溶解度随温度」图横轴是温度（°C），纵轴是溶解度（g / 100 g 水）；数据取自常用的溶解度表（每 10 °C 一个值，中间按直线估算）。硝酸钾的曲线很陡，升温能多溶很多；氯化钠几乎是平的。也有少数物质相反，例如氢氧化钙（熟石灰），温度越高溶得越少（第 3 步会用到它）。灰色横线是本步放进去的 60 g：曲线低于横线时杯底有剩（饱和），曲线高过横线，60 g 就全溶了（不饱和）。「100 g 水 + 60 g 溶质」画的就是这只烧杯。',
    c2a: '100 g 水 + 60 g 溶质', c2b: '溶解度（g / 100 g 水）随温度（°C）',
    s2lg60: '放入的 60 g', s2lgHist: '你看过的温度',
    s2readout: '{sub}，{T} °C：溶解度 {S} g。放入 60 g → 溶解 {d} g，杯底剩 {s} g。{extra}',
    s2extraK: '升到约 {Tall} °C 以上，60 g 就能全部溶解。',
    s2extraN: '0–100 °C 内溶解度都不到 40 g，加热也溶不完 60 g。',
    s2hint: '观察顺序：选硝酸钾，从 20 °C 慢慢升温，看圆点沿陡峭的曲线上升、烧杯杯底的固体变少，约 {Tall} °C 时消失；再换氯化钠，从 0 拖到 100 °C，杯底固体几乎不变。两条曲线在约 {cross} °C 相交：低于这个温度氯化钠溶得多，高于它硝酸钾溶得多。白点记下你看过的温度。',

    s3k: '第 3 步 · 浓不浓',
    s3t: '饱和的溶液一定很浓吗？',
    s3e: '这一步要回答：「饱和」和「浓」是一回事吗？溶液有多浓，用<strong>溶质质量分数</strong>表示：已溶解的溶质质量 ÷ 溶液质量（溶液 = 溶质 + 水，杯底没溶的不算）。「饱和」说的是还能不能再溶，「浓」说的是溶质占多大比例。本步固定 100 g 水，只改放入的溶质和温度。「溶质质量分数随放入的溶质」图横轴是放入的溶质质量（g），纵轴是质量分数（%）：没饱和时放得越多越浓，而且三种物质的线重合（放 m g 时质量分数都是 m ÷ (100 + m)）；一旦饱和，多放的都沉在杯底，质量分数停在最大值 溶解度 ÷ (100 + 溶解度)。三种物质的线都画出来作对比，圆点是你选的那种。',
    massSlider3: '放入的溶质（g，水固定 100 g）',
    c3: '溶质质量分数（%）随放入的溶质（g）', s3lgNow: '当前选择',
    s3sat: '饱和', s3unsat: '不饱和',
    s3readout: '{sub}，{T} °C，100 g 水中放入 {m} g：溶解 {d} g，溶液 {sol} g，质量分数 = {d} ÷ {sol} = {w}%（{state}）。这种物质在此温度下最浓只能到 {wmax}%。',
    s3hint: '观察顺序：选氢氧化钙，不管放多少，质量分数都停在不到 0.2%——它一放就饱和，却非常稀。再选硝酸钾、60 °C、放 50 g：不饱和，质量分数却有 33%。所以饱和不等于浓，不饱和也不等于稀；只有同一种物质、同一温度下比较，饱和溶液才是最浓的。',
    quizPrompt: '小测：20 °C 时，一杯饱和的氢氧化钙溶液，和一杯 100 g 水溶了 25 g 硝酸钾的溶液，哪杯的溶质质量分数大？',
    quizA: '饱和的氢氧化钙溶液，因为它饱和了', quizB: '溶了 25 g 硝酸钾的那杯', quizC: '一样大，饱和溶液都一样浓', check: '核对',
    correct: '对。硝酸钾那杯是 25 ÷ 125 = {wk}%，而且还没饱和；饱和的氢氧化钙溶液只有约 {wc}%。饱和只说明「再也溶不了」，不说明有多浓。',
    wrong: '用「溶质质量分数」图算一算：25 g 硝酸钾溶在 100 g 水里是百分之几？饱和的氢氧化钙溶液又是百分之几？',

    s4k: '第 4 步 · 取回溶质',
    s4t: '想把溶质取回来：降温，还是蒸发？',
    s4e: '这一步要回答：从溶液里取回溶质，什么时候降温有效，什么时候得蒸发掉水？两只烧杯各装 100 g 水，在 80 °C 分别溶满硝酸钾（{k0} g）和氯化钠（{n0} g），都是饱和溶液。<strong>降温</strong>：溶解度变小，多出的溶质变成晶体析出，叫<strong>降温结晶</strong>。<strong>蒸发</strong>：水变少，能溶的总量按比例减少，多出的析出，叫<strong>蒸发结晶</strong>（<a class="xlink" href="../../../chemistry/matter/particles-states/#step3">→ 粒子与物态第 3 步：蒸发时发生了什么</a>）。析出的质量 = 原来溶解的质量 − 剩下的水在新温度下最多能溶的质量。「80 °C 时各自溶满，再降温或蒸发」画的是两只烧杯：水面高度表示剩下的水，杯底白色是析出的晶体。「原来溶解的溶质」中每根横条代表原来溶解的全部溶质，青色是仍溶着的部分，橙色是析出的部分。',
    coolSlider: '降温到（°C）', evapSlider: '蒸发掉的水（g）',
    c4a: '80 °C 时各自溶满，再降温或蒸发', c4b: '原来溶解的溶质：仍溶着 / 析出',
    s4lgKeep: '仍溶在水中', s4lgOut: '析出的晶体', s4lgCrystal: '杯底的晶体',
    s4readout: '降到 {T} °C、蒸发 {e} g 水（剩 {wl} g）：硝酸钾析出 {k} g（占 {kp}%），氯化钠析出 {n} g（占 {np}%）。',
    s4hint: '观察顺序：先不蒸发，只把温度从 80 °C 拖到 20 °C：硝酸钾析出约 {kp20}%，氯化钠只析出约 {np20}%。再把温度拖回 80 °C，只蒸发水：两种物质析出的比例完全相同，都等于蒸发掉的水所占的比例。所以溶解度随温度变化大的（硝酸钾）适合降温结晶；变化小的（氯化钠，比如海水晒盐）适合蒸发结晶。',

    s5k: '第 5 步 · 收束',
    s5t: '把「装满」带走',
    s5fin: '一定温度下，一定量的水能溶解的溶质有上限，用<strong>溶解度</strong>描述（100 g 水最多溶多少克）。达到上限就是<strong>饱和</strong>：溶解和结晶仍在进行，只是一样快。由此：<br>• 能溶多少，取决于溶质种类、水量和温度；<br>• 溶解度随温度变化大的物质，降温就能析出晶体；变化小的，要靠蒸发；<br>• 饱和说的是「还能不能再溶」，浓不浓要看溶质质量分数。',
    formula: '溶解度 S：该温度下 100 g 水最多能溶的溶质质量\n饱和溶液的溶质质量分数 = S ÷ (100 + S)\n析出质量 = 原来溶解的质量 − S(新温度) × 剩下的水 ÷ 100',
    boundary: '适用范围：溶解度取常用数据表的值（每 10 °C 一个，中间按直线估算）；没有考虑过饱和溶液（降温后暂时不析出）、结晶水（有的晶体会带走水）和溶解时的吸热放热。第 1 步是教学用的粒子模型：每个点 0.1 g，速度参数是为了让上限等于 36 g 而取的，不是实测值。',
    linksTitle: '接着看',
    lk1: '化学平衡 · 第 0 步：动态平衡——正反两个过程一样快 →',
    lk2: '化学平衡 · 第 1 步：从零开始，看平衡怎样建立 →',
    lk3: '粒子与物态 · 第 3 步：蒸发——表面的粒子逃逸 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《溶解与饱和》的平行版本。'
  },
  en: {
    pageTitle: 'Dissolution & Saturation · How Much Water Can Hold',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Dissolution & Saturation →',
    navLabel: 'Dissolution and saturation steps',
    tagline: 'Spoon salt into water: at first it all disappears, then at some point no more will dissolve — the water is “full”. In six steps you will find what sets that limit, see that “full” really means dissolving and crystallising at the same speed, learn to get the solute back by cooling or evaporating, and tell “saturated” apart from “concentrated”.',
    nav0: '0 Until it stops', nav1: '1 Not a standstill', nav2: '2 Heating', nav3: '3 How strong', nav4: '4 Getting it back', nav5: '5 Wrap-up',
    btnNaCl: 'Sodium chloride NaCl', btnKNO3: 'Potassium nitrate KNO₃', btnCa: 'Calcium hydroxide Ca(OH)₂',
    nmNaCl: 'Sodium chloride', nmKNO3: 'Potassium nitrate', nmCaOH2: 'Calcium hydroxide',
    lgKNO3: 'Potassium nitrate', lgNaCl: 'Sodium chloride', lgCa: 'Calcium hydroxide (slaked lime)',
    lgDissolved: 'Dissolved solute (dots in proportion to mass)', lgSolid: 'Undissolved solid at the bottom',
    tSlider: 'Water temperature T (°C)',

    s0k: 'Step 0 · Until it stops',
    s0t: 'How much salt can a glass of water take, and what sets the limit?',
    s0e: 'The question here: why does salt stop dissolving after a certain amount? Put salt in water and the grains break up into particles too small to see, spread evenly through the water: you get a <strong>solution</strong>. The salt being dissolved is the <strong>solute</strong>; the water doing the dissolving is the <strong>solvent</strong>. At a given temperature, a given amount of water can only dissolve so much solute. A solution that has reached that limit and cannot take any more is <strong>saturated</strong>; one that can still take more is <strong>unsaturated</strong>. The limit is described by the <strong>solubility</strong>: the largest mass of solute (g) that 100 g of water can dissolve at that temperature. This step stays at 20 °C. In the beaker, cyan dots are dissolved solute (drawn in proportion to mass) and white at the bottom is solid that would not dissolve. The bar beside it is a mass scale in grams: cyan is dissolved, white is left at the bottom, and the dashed line marks the most this water can dissolve.',
    massSlider0: 'Solute added (g)', waterSlider0: 'Water (g)',
    c0: 'A glass of water at 20 °C', s0lgCap: 'Most this water can dissolve',
    s0sat: 'This is a saturated solution: no more will dissolve, and the extra sinks to the bottom.',
    s0exact: 'Exactly saturated: nothing left over, but one more gram would not dissolve.',
    s0unsat: 'This is an unsaturated solution: it can still take {more} g.',
    s0readout: '{sub} has a solubility of {S} g at 20 °C, so {w} g of water can dissolve at most {S} × {w} ÷ 100 = {cap} g. Added {m} g: {d} g dissolves and {s} g stays at the bottom. {state}',
    s0hint: 'What to watch: keep 100 g of water and slowly raise the amount added from 0; note where white solid first appears at the bottom (36 g for sodium chloride). Now change the water to 200 g: the same amount dissolves completely again — the limit doubles with the water. Finally switch to potassium nitrate: the same 100 g of water at 20 °C takes only 31.6 g. The limit depends on the solute, the amount of water, and temperature (step 2).',

    s1k: 'Step 1 · Not a standstill',
    s1t: 'Once the solution is saturated, has dissolving stopped?',
    s1e: 'The question here: the solid at the bottom stops shrinking — is that because dissolving has stopped? Particles keep breaking away from the solid’s surface into the water (<strong>dissolving</strong>), while dissolved particles keep bumping into the solid and getting caught again (<strong>crystallising</strong>). With the solid’s surface the same size, about the same amount dissolves every second; the more particles there are in the water, the more get caught. So at first almost nothing comes back, then crystallising speeds up until the two run at the same speed. From the outside nothing changes any more, yet both processes are still going: this is a <strong>dynamic equilibrium</strong> (<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step0">→ chemical equilibrium, step 0: dynamic balance</a>). This is a teaching particle model: each dot stands for 0.1 g of sodium chloride in 100 g of water at 20 °C, with rates chosen so the limit is exactly 36 g (step 0’s solubility). The random numbers use a fixed seed, so every restart gives the same run. The top panel is the beaker (cyan dots in solution, white blocks are solid, pink are tagged particles); the middle panel is the dissolved mass over time; the bottom panel is the mass dissolving and crystallising per second (averaged over the last 4 s).',
    massSlider1: 'Sodium chloride put in at the start (g)',
    run1: 'Play / pause', tag1: 'Drop in a 3 g tagged crystal', reset1: 'Restart',
    c1a: 'The beaker (each dot is 0.1 g)', c1b: 'Dissolved mass (g) over time (s)', c1c: 'Mass dissolving and crystallising per second (g/s)',
    s1lgDis: 'Dissolving rate', s1lgCry: 'Crystallising rate', s1lgTag: 'Tagged particles', s1lgCap: 'Limit 36 g',
    s1run: 'Playing. ', s1pause: 'Paused. ', s1end: 'Reached {T} s. ',
    s1sat: 'Dissolving and crystallising run at about the same speed: saturated, with traffic both ways cancelling out.',
    s1grow: 'Dissolving outpaces crystallising: the solution is still getting stronger.',
    s1gone: 'All the solid has dissolved; the solution is unsaturated (it could take {more} g more), and crystallising has stopped.',
    s1tag: ' Tagged particles: {ti} in the water, {ts} at the bottom.',
    s1readout: '{prog}At {t} s: {d} g dissolved, {s} g of solid at the bottom. Over the last 4 s, {rd} g dissolved and {rc} g crystallised per second. {state}{tag}',
    s1hint: 'What to watch: press “Play” and watch the middle curve climb to about 36 g and stop rising, only wobbling a little around it, while the orange crystallising rate in the bottom panel rises until it runs alongside the cyan dissolving rate. Now drop in the tagged crystal: the solid gains only 3 g and the dissolved mass does not change, yet pink particles keep turning up in the water — dissolving never stopped. Then set the starting amount below 30 g and restart: all the solid dissolves, crystallising drops to zero and the solution is unsaturated.',

    s2k: 'Step 2 · Heating',
    s2t: 'Warm the water — how much more dissolves?',
    s2e: 'The question here: put 60 g of solute in 100 g of water — will heating dissolve all of it, and do different substances behave alike? Solubility (the most 100 g of water can dissolve) changes with temperature; plotted, it gives a <strong>solubility curve</strong>. In “Solubility vs temperature”, temperature (°C) runs across and solubility (g per 100 g water) runs up; the data come from a standard solubility table (one value every 10 °C, joined by straight lines). Potassium nitrate’s curve is steep: warming lets it take much more. Sodium chloride’s is nearly flat. A few substances go the other way, such as calcium hydroxide (slaked lime), which dissolves less as it gets hotter (step 3 uses it). The grey horizontal line is the 60 g added here: while the curve is below it, solid is left over (saturated); once the curve rises above it, all 60 g dissolves (unsaturated). “100 g water + 60 g solute” shows this beaker.',
    c2a: '100 g water + 60 g solute', c2b: 'Solubility (g per 100 g water) vs temperature (°C)',
    s2lg60: 'The 60 g added', s2lgHist: 'Temperatures you tried',
    s2readout: '{sub} at {T} °C: solubility {S} g. With 60 g added, {d} g dissolves and {s} g stays at the bottom. {extra}',
    s2extraK: 'Above about {Tall} °C, all 60 g dissolves.',
    s2extraN: 'Its solubility stays under 40 g from 0 to 100 °C, so heating never dissolves all 60 g.',
    s2hint: 'What to watch: choose potassium nitrate and warm slowly from 20 °C. The dot climbs the steep curve, the solid in the beaker shrinks, and it is gone at about {Tall} °C. Switch to sodium chloride and drag from 0 to 100 °C: the solid barely changes. The two curves cross at about {cross} °C: below it sodium chloride dissolves more, above it potassium nitrate does. White dots mark the temperatures you tried.',

    s3k: 'Step 3 · How strong?',
    s3t: 'Is a saturated solution always a strong one?',
    s3e: 'The question here: are “saturated” and “concentrated” the same thing? How strong a solution is, is measured by its <strong>mass fraction of solute</strong>: dissolved solute ÷ mass of solution (solution = solute + water; undissolved solid does not count). “Saturated” is about whether any more can dissolve; “concentrated” is about how large a share the solute makes up. This step keeps the water at 100 g and changes only the solute added and the temperature. In “Mass fraction of solute vs solute added”, the mass of solute added (g) runs across and the mass fraction (%) runs up. Until saturation, adding more makes it stronger, and the three lines coincide (adding m g always gives m ÷ (100 + m)); after that, the extra sinks and the fraction stays at its maximum, solubility ÷ (100 + solubility). All three substances are drawn for comparison; the dot is the one you picked.',
    massSlider3: 'Solute added (g, water fixed at 100 g)',
    c3: 'Mass fraction of solute (%) vs solute added (g)', s3lgNow: 'Your current choice',
    s3sat: 'saturated', s3unsat: 'unsaturated',
    s3readout: '{sub} at {T} °C, {m} g added to 100 g water: {d} g dissolves, the solution weighs {sol} g, mass fraction = {d} ÷ {sol} = {w}% ({state}). At this temperature this substance can reach at most {wmax}%.',
    s3hint: 'What to watch: choose calcium hydroxide — however much you add, the mass fraction stays under 0.2%. It saturates almost at once, yet it is extremely dilute. Now choose potassium nitrate at 60 °C with 50 g: unsaturated, yet 33% solute. So saturated does not mean concentrated, and unsaturated does not mean dilute; only for the same substance at the same temperature is the saturated solution the strongest.',
    quizPrompt: 'Quick check: at 20 °C, which has the larger mass fraction — a saturated calcium hydroxide solution, or 25 g of potassium nitrate dissolved in 100 g of water?',
    quizA: 'The saturated calcium hydroxide, because it is saturated', quizB: 'The one with 25 g of potassium nitrate', quizC: 'They are equal: all saturated solutions are equally strong', check: 'Check',
    correct: 'Right. The potassium nitrate is 25 ÷ 125 = {wk}%, and it is not even saturated; saturated calcium hydroxide is only about {wc}%. Saturated only means “no more will dissolve”, not “strong”.',
    wrong: 'Work it out with the plot: what percentage is 25 g of potassium nitrate in 100 g of water? And a saturated calcium hydroxide solution?',

    s4k: 'Step 4 · Getting it back',
    s4t: 'To get the solute back out: cool it, or boil off water?',
    s4e: 'The question here: when does cooling recover the solute, and when do you have to evaporate the water? Two beakers each hold 100 g of water, saturated at 80 °C — one with potassium nitrate ({k0} g), one with sodium chloride ({n0} g). <strong>Cooling</strong> lowers the solubility, and the excess comes out as crystals: <strong>crystallisation by cooling</strong>. <strong>Evaporating</strong> removes water, so the total that can stay dissolved shrinks in proportion, and the excess comes out: <strong>crystallisation by evaporation</strong> (<a class="xlink" href="../../../chemistry/matter/particles-states/#step3">→ particles and states, step 3: what happens during evaporation</a>). Mass that crystallises = mass originally dissolved − the most the remaining water can hold at the new temperature. “Each saturated at 80 °C, then cooled or evaporated” shows both beakers: the water level shows how much water is left, white at the bottom is the crystals. In “Solute that was dissolved”, each bar is all the solute that was dissolved: cyan is still dissolved, orange has crystallised.',
    coolSlider: 'Cool to (°C)', evapSlider: 'Water evaporated (g)',
    c4a: 'Each saturated at 80 °C, then cooled or evaporated', c4b: 'Solute that was dissolved: still dissolved / crystallised',
    s4lgKeep: 'Still dissolved', s4lgOut: 'Crystallised', s4lgCrystal: 'Crystals at the bottom',
    s4readout: 'Cooled to {T} °C with {e} g of water evaporated ({wl} g left): potassium nitrate gives {k} g of crystals ({kp}%), sodium chloride {n} g ({np}%).',
    s4hint: 'What to watch: with no evaporation, drag the temperature from 80 °C down to 20 °C: about {kp20}% of the potassium nitrate crystallises, but only about {np20}% of the sodium chloride. Drag back to 80 °C and only evaporate water: both lose exactly the same share, equal to the share of water boiled off. So a substance whose solubility changes a lot with temperature (potassium nitrate) is recovered by cooling; one whose solubility barely changes (sodium chloride, as in sea-salt pans) is recovered by evaporation.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'What to take away',
    s5fin: 'At a given temperature, a given amount of water can dissolve only so much solute; that limit is the <strong>solubility</strong> (grams per 100 g of water). Reaching it is <strong>saturation</strong>: dissolving and crystallising carry on, at the same speed. So:<br>• how much dissolves depends on the solute, the amount of water and the temperature;<br>• a substance whose solubility changes a lot with temperature crystallises on cooling; one whose solubility barely changes needs evaporation;<br>• “saturated” is about whether more can dissolve; how strong a solution is depends on its mass fraction.',
    formula: 'Solubility S: most solute 100 g of water can dissolve at that temperature\nMass fraction of a saturated solution = S ÷ (100 + S)\nCrystals = mass dissolved − S(new temperature) × water left ÷ 100',
    boundary: 'Where this holds: solubilities are standard table values (one every 10 °C, straight lines in between). The page ignores supersaturation (a cooled solution that has not crystallised yet), water of crystallisation (some crystals take water with them) and the heat taken in or given out on dissolving. Step 1 is a teaching particle model: each dot is 0.1 g and the rates were chosen to make the limit 36 g; they are not measured values.',
    linksTitle: 'Where to next',
    lk1: 'Chemical equilibrium · step 0: dynamic balance — two opposite processes at the same speed →',
    lk2: 'Chemical equilibrium · step 1: starting from zero, how equilibrium builds up →',
    lk3: 'Particles and states · step 3: evaporation — particles escaping from the surface →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “Dissolution & Saturation”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
// Values computed by the model that appear inside static paragraphs (filled by app.js before the first render).
const STATIC_PARAMS = {};
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  const all = Object.assign({}, STATIC_PARAMS, params);
  Object.keys(all).forEach(name => { if (text.indexOf(`{${name}}`) < 0) return; const v = typeof all[name] === 'function' ? all[name]() : all[name]; text = text.split(`{${name}}`).join(String(v)); });
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
  if (typeof window.refreshSolution === 'function') window.refreshSolution();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SOL_I18N = { t, setLang, getLang: () => lang, STATIC_PARAMS };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
