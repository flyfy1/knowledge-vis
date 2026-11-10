'use strict';
// Particles & states lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '粒子与物态 · 同一群粒子，三种排法',
    back: '← 知识索引',
    compare: '对照另一版本：粒子与物态 · 热闹程度即温度 →',
    navLabel: '粒子与物态步骤导航',
    tagline: '冰、水、水蒸气是同一种东西，为什么一个硬、一个会流、一个看不见？把它们放大到看不见的尺度，里面都是同样的小粒子，区别只在粒子怎么排、动得多凶。下面的盒子里是一个真在计算的粒子模拟：96 个粒子，每一小步都按彼此的吸引和排斥更新速度和位置。你调的是热源，物态由粒子自己「长」出来。',
    nav0: '0 固体', nav1: '1 加热', nav2: '2 熔化', nav3: '3 温度平台', nav4: '4 蒸发', nav5: '5 沸腾与液化', nav6: '6 自测与收束',
    play: '播放', pause: '暂停', reset: '重来',
    stSolid: '固体', stLiquid: '液体', stGas: '气体',
    boxLegendSlow: '慢', boxLegendFast: '快',
    lgColor: '粒子颜色：越偏橙动得越快', lgTrack: '被跟踪的粒子和它走过的路', lgSeat: '它的「座位」（近 2 个时间单位的平均位置）', lgLink: '细线：挨在一起的两个粒子',

    s0k: '第 0 步 · 先看一块固体',
    s0t: '一块固体里的粒子是静止的吗？',
    s0e: '这一步要回答：把一块固体放大到粒子尺度，里面的粒子在干什么？<strong>粒子</strong>是构成物质的、小到肉眼看不见的单元，这里画成小圆点（真实的粒子是三维的分子或原子，这里只画一个平面）。<strong>物态</strong>是物质存在的样子：固态、液态、气态。下面的粒子一开始排成整齐的蜂窝状队形，热源设得很低。按「播放」：每个粒子都在不停地抖，但总在自己的「座位」附近，挤不出去，所以整块东西形状不变。',
    track0: '换一个粒子跟踪',
    c0a: '粒子盒子（底部有向下的弱重力）',
    s0readout: '物态：{state}。被跟踪的粒子此刻离座位 {d} 个粒子直径，近一段时间最远 {dmax} 个；全体粒子离各自座位的平均偏离 {j}。温度读数（示意）{T}。',
    s0hint: '观察顺序：先盯着橙色的被跟踪粒子：它的轨迹缩成一小团，不会跑到别的粒子的位置上。再看整体：每个粒子都在抖，没有一个是静止的。「换一个粒子跟踪」换成边上或中间的粒子再看一次。',

    s1k: '第 1 步 · 加热',
    s1t: '加热时，粒子到底多了什么？',
    s1e: '这一步要回答：给固体加热，改变的是粒子的什么？滑杆调的是<strong>热源</strong>：模拟每一小步把所有粒子的速度按同一比例稍微放大或缩小，让粒子的平均<strong>动能</strong>（动得越快，动能越大）靠近设定值。页面上的<strong>温度读数</strong>不读滑杆，而是从粒子此刻的速度算出来：示意温度 = 100 × 每个粒子的平均动能（本页的单位）。它是示意刻度，不是摄氏度。图里蓝线是温度读数，橙线是粒子离各自座位的平均偏离：温度一高，抖得就更远。',
    heat1: '热源设定（示意温度）',
    c1a: '粒子盒子', c1b: '随时间：温度读数（蓝）与抖动（橙）',
    lg1T: '温度读数（由粒子速度算出）', lg1J: '抖动幅度：离座位的平均偏离（粒子直径）',
    s1readout: '热源设定 {set}，温度读数 {T}（由粒子速度算出）。平均离座位 {j} 个粒子直径。物态：{state}。',
    s1hint: '观察顺序：先把热源从 5 拖到 20，盒子里的点变橙、抖得更凶，图上蓝线升高、橙线跟着升高；再拖回 5，两条线都降回去。注意蓝线不是瞬间跳到设定值，而是稍过片刻才追上：热源要一小步一小步把能量交给粒子。这一步最高只到 20，粒子还在原来的队形里。',

    s2k: '第 2 步 · 熔化',
    s2t: '再热下去，固体为什么会「化」？',
    s2e: '这一步要回答：继续加热，队形会怎样？图里把挨在一起的两个粒子用细线连起来，固体时细线织成整齐的三角网。我们用<strong>队形整齐度</strong>来量它：看每个粒子周围邻居的方向，六个邻居正好每隔 60° 一个时为 1，方向乱时接近 0（取全体平均）。物态名就由模拟算出来的量判定：整齐度 ≥ 0.68 叫固体；粒子大多不连在一起叫气体；其余叫液体。<strong>熔化</strong>就是整齐的队形散掉：粒子仍然挤在一起，但能互相滑过、换位置，于是能流动。',
    heat2: '热源设定（示意温度）',
    c2a: '粒子盒子（细线连接挨着的粒子）', c2b: '随时间：队形整齐度（绿）与温度读数（蓝）',
    lg2Psi: '队形整齐度（虚线 0.68 是固体线）', lg2T: '温度读数',
    s2readout: '热源设定 {set}，温度读数 {T}。队形整齐度 {psi}。物态：{state}。粒子总数 {n}。',
    s2hint: '观察顺序：从 20 开始，每次往右拖 5，等几秒再看。到 25 附近物态名会在固体和液体之间来回跳；到 35，细线网出现缺口和乱角，绿线掉到 0.68 的虚线以下，物态变成液体，粒子堆的顶面也开始起伏。再拖回 10：粒子会重新排回队形（可能带一两处错位）。在本模拟的几组随机初值下，20 时始终是固体，35 时始终是液体，熔化就发生在这两者之间。',

    s3k: '第 3 步 · 温度平台',
    s3t: '冰正在化的时候一直在加热，温度为什么不涨？',
    s3e: '这一步要回答：熔化和沸腾时，加进去的热量去哪了？粒子盒子太小，量不准这件事，所以这一步换成真实的水：100 克 −20 °C 的冰，用 1000 瓦的热源一直加热（每秒给 1000 焦耳），忽略散热。曲线由课本常数算出：冰每克升 1 °C 要 2.1 焦，水 4.18 焦，水蒸气 2.0 焦；每克冰化成水要 334 焦，每克水变成水蒸气要 2257 焦。在 0 °C 和 100 °C 各有一段<strong>平台</strong>：热源照样在加热，温度却不动。粒子图景是：这段时间里热量用来把粒子从邻居身边拉开（拆队形、脱离液体），而不是让它们平均动得更快，而温度读的正是「平均动得多快」。',
    time3: '加热时间（秒）', play3: '从头加热',
    c3a: '温度（°C）随加热时间（秒）', c3b: '已加入的热量用在了哪里（焦耳）',
    lg3Warm: '让粒子动得更快（温度上升）', lg3Apart: '把粒子拉开（熔化、沸腾）', lg3Now: '当前时刻',
    k3ice: '冰在升温', k3melt: '冰在熔化（0 °C 平台）', k3water: '水在升温', k3boil: '水在沸腾（100 °C 平台）', k3steam: '水蒸气在升温',
    s3readout: '第 {t} 秒：{kind}，温度 {T} °C。已加入 {E} 焦：{warm} 焦用来升温，{apart} 焦用来把粒子拉开。熔化平台长 {fl} 秒，沸腾平台长 {bl} 秒。',
    s3hint: '观察顺序：拖「加热时间」或按「从头加热」，看曲线在 0 °C 先停 {fl} 秒、在 100 °C 再停 {bl} 秒；同时看「已加入的热量用在了哪里」那根条：平台期间只有橙色（拉开粒子）在长，蓝色（升温）不动。沸腾平台比熔化平台长得多，说明把粒子彻底拉散比只拆掉队形费劲得多。',

    s4k: '第 4 步 · 蒸发',
    s4t: '一杯水不烧也会慢慢变少，少掉的粒子去哪了？',
    s4e: '这一步要回答：没到沸腾，液体为什么也会变少？粒子的速度有快有慢，液面上偶尔有个粒子正好够快、方向朝上，就能挣脱邻居飞进上方的空间，这叫<strong>蒸发</strong>。它只能从液面发生：液体里面的粒子四周都是邻居，挣不出去。读数把粒子分成三份：<strong>液体里</strong>（彼此相连的那一大团）、<strong>空中</strong>（盒子里但不连在大团上）、<strong>已飞走</strong>（盖子打开时从顶部离开、进了屋子里）。三份加起来永远是 96。',
    heat4: '热源设定（示意温度）', lid4: '打开盖子', lidClose4: '盖上盖子',
    c4a: '粒子盒子', c4b: '随时间：三份粒子各有多少',
    lg4Liq: '液体里', lg4Air: '空中', lg4Esc: '已飞走（进了屋子）',
    s4readout: '{lid}，温度读数 {T}：液体里 {liq} 个，空中 {air} 个，已飞走 {esc} 个，合计 {sum} 个。',
    lidOn: '盖子盖着', lidOff: '盖子开着',
    s4hint: '观察顺序：先盖着盖子、热源 60，等一会儿：空中的粒子数（白线）在几个上下晃，不会一直涨，因为飞上去的粒子撞到盖子又会落回液体，逃出和落回差不多抵消。再「打开盖子」：橙线一阶一阶往上走，青线慢慢往下，液体真的在变少；把热源调到 70 再看，橙线涨得更快；调到 40，飞走的就很少，要等很久才有一个。「重来」恢复满满一盒液体。',

    s5k: '第 5 步 · 沸腾与液化',
    s5t: '一直加热到全变成气，再冷回来，粒子还是原来那些吗？',
    s5e: '这一步要回答：沸腾和蒸发差在哪？冷下来又会怎样？继续加热，粒子动得越来越凶，不只是液面，液体各处的粒子都挣脱了邻居，满盒子乱飞、彼此离得远远的，这是<strong>沸腾</strong>，液体变成<strong>气体</strong>。按「走一圈」，热源会自动从 10 升到 220、停一会儿、再降回 10：粒子先散成气体，降温后又聚回液体（气体变液体叫<strong>液化</strong>），最后重新排成队形（液体变固体叫<strong>凝固</strong>）。全程盖子盖着，粒子一个不多、一个不少。',
    heat5: '热源设定（示意温度）', cycle5: '走一圈：升到 220 再降回 10',
    c5a: '粒子盒子', c5b: '随时间：温度读数与物态',
    lg5Band: '底色：固体（绿）、液体（青）、气体（橙）', lg5T: '温度读数',
    s5readout: '{prog}热源设定 {set}，温度读数 {T}。物态：{state}。90% 的粒子都在 {h} 个直径以下（盒高 22）。粒子总数 {n}。',
    s5prog: '走一圈进行中（{p}%） · ',
    s5seq: '这一圈经历的物态：{seq}。',
    s5hint: '观察顺序：按「走一圈」，盯着「随时间：温度读数与物态」图的底色：绿 → 青 → 橙 → 青 → 绿，这就是熔化、沸腾、液化、凝固。气体时粒子顶到盒子上部，液化时又落回底部，凝固后细线网重新变整齐。也可以自己拖滑杆：本模拟里，等粒子稳定下来后，示意温度 180 及以上始终判定为气体，35 到 70 始终是液体；80 到 150 是过渡区，物态名会在液体和气体之间来回跳，因为液团时而被冲散、时而又聚起来。',

    s6k: '第 6 步 · 自测与收束', s6t: '同一群粒子，三种排法',
    q1: '第 3 步的熔化平台上，热源一直在加热，温度为什么不涨？',
    q1a: '热源在平台期间其实关掉了', q1b: '热量用来把粒子拉离邻居、拆掉队形，粒子平均没有动得更快', q1c: '冰的比热比水大，所以升温慢',
    q1ok: '对。温度读的是粒子平均动得多快；平台期间热量花在拉开粒子上。', q1no: '再看第 3 步的条：平台期间增长的是橙色「把粒子拉开」，热源并没有停。',
    q2: '判断：水变成水蒸气，是因为水的粒子变大了。',
    q2a: '对', q2b: '错：粒子本身没变，变的是粒子之间的距离和排法',
    q2ok: '对，是错的。第 5 步全程粒子数一直是 96，粒子大小也没变；气体只是粒子彼此离得远、到处乱飞。', q2no: '再看第 5 步：粒子数和大小都没变，变的是它们之间的距离和排法。',
    q3: '蒸发和沸腾的区别是？',
    q3a: '蒸发只在液面发生、任何温度都有一点；沸腾是液体各处的粒子都挣脱', q3b: '蒸发是物理变化，沸腾是化学变化', q3c: '蒸发时粒子变小，沸腾时粒子变大',
    q3ok: '对。第 4 步飞走的粒子都是从液面上方离开的，温度低时也有，只是少；第 5 步沸腾时整团液体都散开了。', q3no: '两者都是物理变化，粒子本身也都没变。差别在发生的位置和规模：蒸发只在液面，沸腾在液体各处。',
    check: '核对',
    s6fin: '回头串一遍。<strong>第 0 步</strong>：固体里的粒子一刻不停地抖，但被队形困在各自的座位上。<strong>第 1 步</strong>：加热就是让粒子平均动得更快；温度读的就是这个「平均有多快」。<strong>第 2 步</strong>：热到一定程度，队形散了，粒子还挤在一起但能互相滑过，这是熔化，变成液体。<strong>第 3 步</strong>：熔化和沸腾时，热量用来把粒子拉开，所以温度停在平台上。<strong>第 4 步</strong>：液面上够快的粒子会飞走，这是蒸发；盖上盖子，逃出和落回会平衡。<strong>第 5 步</strong>：再热就沸腾成气体；冷回来又液化、凝固。粒子始终是那 96 个，物态变化没有产生新东西，是物理变化。',
    boundary: '这页模型的边界：粒子画在一个平面上（真实分子在三维空间里运动），是一模一样的圆盘；粒子之间的吸引和排斥用一个简化的公式（莫尔斯势），不是水分子真实的作用力；盒子里加了很弱的向下重力，好让液体待在底部。热源用「按比例调速度」的办法维持平均动能，是一种常用的模拟手段，不是真实的炉子。温度读数是示意刻度：100 × 每个粒子的平均动能（本页单位），只保证越热越高，不对应摄氏度，所以熔化、沸腾的示意温度不能和水的 0 °C、100 °C 对上。物态名是从模拟量判定的（队形整齐度、粒子是否连成一团），阈值是本页选定的。第 3 步的平台用的是水的真实常数，不是粒子盒子算出来的；这么小的盒子里，熔化和沸腾吸的热只让升温变慢一些，看不出清楚的平台。',
    linksTitle: '接着去哪儿',
    lk1: '→ 分子与原子第 1 步：水烧开，分子还是那些分子',
    lk2: '→ 分子与原子第 3 步：物理变化还是化学变化',
    lk3: '→ 气体动理论第 1 步：温度是平均动能的读数（定量版）',
    lk4: '→ 气体动理论第 0 步：气体的压强就是粒子撞墙',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《粒子与物态 · 热闹程度即温度》的平行版本。'
  },
  en: {
    pageTitle: 'Particles & States · One Crowd, Three Arrangements',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Particles & States · Temperature Is How Wildly They Move →',
    navLabel: 'Particles and states steps',
    tagline: 'Ice, water and steam are the same substance, so why is one hard, one runny and one invisible? Zoom in far below what eyes can see and all three are made of the same tiny particles; the only differences are how the particles are arranged and how wildly they move. The boxes below run a real particle simulation: 96 particles whose speeds and positions are updated every tiny step from how they attract and push one another. You control the heater; the state of matter grows out of the particles themselves.',
    nav0: '0 Solid', nav1: '1 Heating', nav2: '2 Melting', nav3: '3 Plateaus', nav4: '4 Evaporation', nav5: '5 Boil & condense', nav6: '6 Quiz & wrap-up',
    play: 'Play', pause: 'Pause', reset: 'Reset',
    stSolid: 'solid', stLiquid: 'liquid', stGas: 'gas',
    boxLegendSlow: 'slow', boxLegendFast: 'fast',
    lgColor: 'particle colour: more orange = moving faster', lgTrack: 'the tracked particle and its path', lgSeat: 'its “seat” (average position over the last ~2 time units)', lgLink: 'thin line: two particles touching',

    s0k: 'Step 0 · Start with a solid',
    s0t: 'Are the particles in a solid standing still?',
    s0e: 'This step asks: blow a solid up to the scale of its particles; what are they doing? A <strong>particle</strong> is one of the units matter is made of, far too small to see; here each is drawn as a small dot (real particles are molecules or atoms moving in three dimensions; we draw a flat slice). A <strong>state of matter</strong> is the form a substance takes: solid, liquid or gas. The particles below start in a neat honeycomb arrangement with the heater turned low. Press “Play”: every particle keeps jiggling, yet stays near its own “seat” and cannot squeeze out, so the whole piece keeps its shape.',
    track0: 'Track a different particle',
    c0a: 'Particle box (weak gravity pulls downwards)',
    s0readout: 'State: {state}. The tracked particle is {d} particle widths from its seat right now, at most {dmax} recently; on average the particles sit {j} from their seats. Temperature reading (schematic) {T}.',
    s0hint: 'What to try: follow the orange tracked particle. Its path curls into a small knot and never wanders into another particle’s place. Then look at the whole box: every particle jiggles, none is still. Use “Track a different particle” to watch one on the edge or in the middle.',

    s1k: 'Step 1 · Heating',
    s1t: 'When you heat something, what do the particles gain?',
    s1e: 'This step asks: heating a solid changes what about its particles? The slider sets the <strong>heater</strong>: at every tiny step the simulation scales all particle speeds up or down by the same small factor, pulling the particles’ average <strong>kinetic energy</strong> (the faster something moves, the more it has) towards the setting. The page’s <strong>temperature reading</strong> does not read the slider; it is computed from the particles’ current speeds: schematic temperature = 100 × the average kinetic energy per particle (in this page’s units). It is a schematic scale, not °C. In the chart the blue line is the temperature reading and the orange line is how far particles stray from their seats on average: the hotter, the farther they jiggle.',
    heat1: 'Heater setting (schematic temperature)',
    c1a: 'Particle box', c1b: 'Over time: temperature (blue), jiggle (orange)',
    lg1T: 'temperature reading (from particle speeds)', lg1J: 'jiggle size: average distance from seat (particle widths)',
    s1readout: 'Heater set to {set}; temperature reading {T} (from particle speeds). Average distance from seat {j} particle widths. State: {state}.',
    s1hint: 'What to try: drag the heater from 5 to 20. The dots turn orange and jiggle harder, the blue line rises and the orange line follows; drag back to 5 and both fall again. Notice the blue line does not jump to the setting at once but catches up a moment later: the heater hands energy to the particles one tiny step at a time. This step stops at 20, so the particles stay in their original arrangement.',

    s2k: 'Step 2 · Melting',
    s2t: 'Keep heating: why does a solid “melt”?',
    s2e: 'This step asks: what happens to the arrangement as heating continues? Thin lines join particles that touch; in a solid they knit a neat triangular net. We measure it with an <strong>orderliness</strong> score: look at the directions of each particle’s neighbours; six neighbours exactly 60° apart score 1, a jumble scores near 0 (averaged over all particles). The state is named from these simulated quantities: orderliness ≥ 0.68 is a solid; most particles not connected to one another is a gas; anything else is a liquid. <strong>Melting</strong> is the neat arrangement falling apart: the particles are still packed together, but they can slide past each other and swap places, so the stuff can flow.',
    heat2: 'Heater setting (schematic temperature)',
    c2a: 'Particle box (lines join touching particles)', c2b: 'Over time: orderliness (green), temperature (blue)',
    lg2Psi: 'orderliness (dashed 0.68 = solid line)', lg2T: 'temperature reading',
    s2readout: 'Heater set to {set}; temperature reading {T}. Orderliness {psi}. State: {state}. Particles: {n}.',
    s2hint: 'What to try: start at 20 and move right 5 at a time, waiting a few seconds each time. Around 25 the name keeps switching between solid and liquid; by 35 gaps and crooked angles appear, the green line drops below the dashed 0.68, the state becomes liquid, and the top of the heap starts to ripple. Drag back to 10 and the particles settle into an arrangement again (perhaps with a defect or two). Across several random starts of this simulation, 20 is always solid and 35 is always liquid, so melting happens in between.',

    s3k: 'Step 3 · Temperature plateaus',
    s3t: 'While ice melts the heat keeps coming. Why doesn’t the temperature rise?',
    s3e: 'This step asks: during melting and boiling, where does the added heat go? The particle box is too small to measure this cleanly, so this step switches to real water: 100 g of ice at −20 °C heated by a 1000-watt heater (1000 joules every second), ignoring heat lost to the room. The curve is computed from textbook constants: warming ice by 1 °C takes 2.1 joules per gram, water 4.18, steam 2.0; turning a gram of ice into water takes 334 joules, and a gram of water into steam 2257. At 0 °C and at 100 °C there is a <strong>plateau</strong>: the heater keeps heating, yet the temperature stands still. In particle terms, that heat goes into pulling particles away from their neighbours (breaking the arrangement, escaping the liquid) instead of making them move faster on average, and temperature reads exactly that average speed.',
    time3: 'Heating time (seconds)', play3: 'Heat from the start',
    c3a: 'Temperature (°C) against heating time (s)', c3b: 'Where the heat added so far went (joules)',
    lg3Warm: 'making particles move faster (temperature rises)', lg3Apart: 'pulling particles apart (melting, boiling)', lg3Now: 'current moment',
    k3ice: 'ice warming up', k3melt: 'ice melting (0 °C plateau)', k3water: 'water warming up', k3boil: 'water boiling (100 °C plateau)', k3steam: 'steam warming up',
    s3readout: 'At {t} s: {kind}, {T} °C. Heat added {E} J: {warm} J raised the temperature and {apart} J pulled particles apart. The melting plateau lasts {fl} s, the boiling plateau {bl} s.',
    s3hint: 'What to try: drag the heating time or press “Heat from the start”. The curve pauses for {fl} s at 0 °C and for {bl} s at 100 °C; meanwhile in the “Where the heat added so far went” bar only the orange part (pulling apart) grows and the blue part (warming) stands still. The boiling plateau is far longer than the melting one: pulling particles fully apart costs much more than just breaking up their arrangement.',

    s4k: 'Step 4 · Evaporation',
    s4t: 'A glass of water slowly empties without boiling. Where do the particles go?',
    s4e: 'This step asks: below boiling, why does a liquid still shrink? Particles have a spread of speeds; now and then one at the surface is fast enough and heading upwards, breaks free of its neighbours and flies into the space above. That is <strong>evaporation</strong>. It can only happen at the surface: a particle inside the liquid has neighbours on every side. The readout splits the particles three ways: <strong>in the liquid</strong> (the big connected clump), <strong>in the air</strong> (in the box but not joined to the clump) and <strong>gone</strong> (left through the top while the lid was open, out into the room). The three always add up to 96.',
    heat4: 'Heater setting (schematic temperature)', lid4: 'Open the lid', lidClose4: 'Close the lid',
    c4a: 'Particle box', c4b: 'Over time: how many in each part',
    lg4Liq: 'in the liquid', lg4Air: 'in the air', lg4Esc: 'gone (out into the room)',
    s4readout: '{lid}, temperature reading {T}: {liq} in the liquid, {air} in the air, {esc} gone; {sum} in total.',
    lidOn: 'Lid closed', lidOff: 'Lid open',
    s4hint: 'What to try: with the lid closed and the heater at 60, wait a while. The number in the air (white line) wobbles around a handful and does not keep climbing: particles that fly up hit the lid and fall back, so escaping and returning roughly cancel. Now “Open the lid”: the orange line climbs step by step and the cyan line slowly drops; the liquid really is shrinking. Turn the heater up to 70 and the orange line climbs faster; at 40 escapes are rare, and you may wait a long time for a single one. “Reset” brings back a full box of liquid.',

    s5k: 'Step 5 · Boiling and condensing',
    s5t: 'Heat it all into gas, then cool it back down. Are they still the same particles?',
    s5e: 'This step asks: how does boiling differ from evaporation, and what happens on cooling? Keep heating and the particles move ever more wildly; not just at the surface but all through the liquid they break free of their neighbours and fly all over the box, far apart. That is <strong>boiling</strong>: the liquid becomes a <strong>gas</strong>. Press “Full cycle” and the heater goes from 10 up to 220, waits, and comes back down to 10: the particles first scatter into a gas, then gather back into a liquid on cooling (gas to liquid is <strong>condensation</strong>), and finally line up into an arrangement again (liquid to solid is <strong>freezing</strong>). The lid stays shut throughout; not one particle is gained or lost.',
    heat5: 'Heater setting (schematic temperature)', cycle5: 'Full cycle: up to 220 and back to 10',
    c5a: 'Particle box', c5b: 'Over time: temperature and state',
    lg5Band: 'background: solid (green), liquid (cyan), gas (orange)', lg5T: 'temperature reading',
    s5readout: '{prog}Heater set to {set}; temperature reading {T}. State: {state}. 90% of the particles are below {h} particle widths (the box is 22 tall). Particles: {n}.',
    s5prog: 'Full cycle running ({p}%) · ',
    s5seq: 'States passed through on this cycle: {seq}.',
    s5hint: 'What to try: press “Full cycle” and watch the background colour of the “Over time: temperature and state” chart: green → cyan → orange → cyan → green, which is melting, boiling, condensing and freezing. As a gas the particles reach the top of the box; on condensing they fall back to the bottom, and after freezing the net of lines turns neat again. You can also drag the slider yourself: in this simulation, once the particles have settled, a setting of 180 or more is always named gas and 35 to 70 is always liquid; 80 to 150 is a transition zone where the name keeps switching between liquid and gas, because the clump is torn apart and then gathers again.',

    s6k: 'Step 6 · Quiz and wrap-up', s6t: 'One crowd of particles, three arrangements',
    q1: 'On step 3’s melting plateau the heater keeps heating. Why doesn’t the temperature rise?',
    q1a: 'The heater is actually switched off during the plateau', q1b: 'The heat goes into pulling particles away from their neighbours and breaking the arrangement; on average they don’t move any faster', q1c: 'Ice has a larger specific heat than water, so it warms slowly',
    q1ok: 'Right. Temperature reads how fast the particles move on average; during the plateau the heat is spent pulling them apart.', q1no: 'Look again at step 3’s bar: during the plateau the orange “pulling apart” part grows; the heater never stops.',
    q2: 'True or false: water turns into steam because its particles get bigger.',
    q2a: 'True', q2b: 'False: the particles themselves don’t change; the distance between them and their arrangement do',
    q2ok: 'Right, it’s false. In step 5 there are always 96 particles of the same size; a gas just has them far apart and flying everywhere.', q2no: 'Look again at step 5: neither the number nor the size of the particles changes; what changes is how far apart they are and how they are arranged.',
    q3: 'What is the difference between evaporation and boiling?',
    q3a: 'Evaporation happens only at the surface and a little at any temperature; in boiling, particles break free all through the liquid', q3b: 'Evaporation is a physical change and boiling is a chemical change', q3c: 'Particles shrink when evaporating and grow when boiling',
    q3ok: 'Right. In step 4 particles left from the surface, even at lower settings, only fewer of them; in step 5’s boiling the whole clump came apart.', q3no: 'Both are physical changes, and the particles themselves don’t change in either. The difference is where and how much: evaporation only at the surface, boiling all through the liquid.',
    check: 'Check',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: the particles in a solid never stop jiggling, but the arrangement keeps each one in its seat. <strong>Step 1</strong>: heating makes the particles move faster on average, and temperature reads exactly that average. <strong>Step 2</strong>: hot enough, the arrangement falls apart; the particles stay packed but slide past each other. That is melting into a liquid. <strong>Step 3</strong>: while melting and boiling, heat goes into pulling particles apart, so the temperature sits on a plateau. <strong>Step 4</strong>: fast particles at the surface fly off; that is evaporation, and with a lid on, escaping and returning balance. <strong>Step 5</strong>: more heat boils it into a gas; cooling condenses and freezes it again. It is the same 96 particles throughout: changing state creates nothing new, so it is a physical change.',
    boundary: 'Where this page’s model stops: the particles move in a flat plane (real molecules move in three dimensions) and are identical discs; their attraction and repulsion follow a simplified formula (the Morse potential), not the real forces between water molecules; a weak downward gravity keeps the liquid at the bottom of the box. The heater keeps the average kinetic energy up by scaling speeds, a common simulation technique, not a real stove. The temperature reading is a schematic scale, 100 × the average kinetic energy per particle (page units); it only promises “hotter reads higher” and does not correspond to °C, so the schematic melting and boiling temperatures should not be compared with water’s 0 °C and 100 °C. State names are decided from simulated quantities (orderliness, and whether the particles form one clump) with thresholds chosen for this page. Step 3’s plateaus use real constants for water, not the particle box; in a box this small, the heat taken up by melting and boiling only slows the warming a little and shows no clean plateau.',
    linksTitle: 'Where to go next',
    lk1: '→ Molecules & atoms, step 1: boiling water, same molecules',
    lk2: '→ Molecules & atoms, step 3: physical or chemical change?',
    lk3: '→ Kinetic theory, step 1: temperature reads average kinetic energy (the quantitative version)',
    lk4: '→ Kinetic theory, step 0: gas pressure is particles hitting the walls',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Particles & States · Temperature Is How Wildly They Move”.'
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
  if (typeof window.refreshParticles === 'function') window.refreshParticles();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
