'use strict';
const STR = {
  "zh": {
    "docTitle": "粒子与物态 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "粒子与物态",
    "tagline": "冰、水、水蒸气是同一种东西的三种样子。放大到看不见的尺度，看同一群粒子如何排成三种队形——加热，就是让它们闹得更凶。",
    "foot": "粒子与物态 · 一步一交互",
    "navLabel": "步骤导航",
    "canvasLabel": "粒子模拟画布；操作方法见上方说明",
    "play": "▶ 播放",
    "pause": "⏸ 暂停",
    "reset": "重置：回到固体初态",
    "resetQuiz": "重做自测",
    "heatLab": "加热（温度滑杆）",
    "lidLab": "盖上盖子",
    "stateSolid": "固态",
    "stateLiquid": "液态",
    "stateGas": "气态",
    "nav0": "0 固体里的粒子",
    "s0k": "第 0 步",
    "s0t": "先看清一群粒子：固体里的粒子在原地抖",
    "s0e": "这一步要回答：放大到粒子尺度，一块「固体」里面的粒子在干什么？图上的小圆点就是<strong>粒子</strong>——构成物质、肉眼看不见的小单元，本页画成小圆点。它们排成整齐的队形、彼此挨着，这是<strong>物态</strong>（固、液、气三种存在状态的总称）里的「固态」。按 ▶ 播放：每个粒子都在自己的座位上<strong>原地抖动</strong>——画面是真模拟逐帧算出来的，不是静止贴图；暂停时画面停在当前帧。点画布上的一个粒子把它高亮跟踪：它离不开、也回不到自己的座位，只能在原地闹。结论：<strong>固体 = 粒子排成队形、原地振动</strong>；形状固定，是因为队形固定。",
    "s0ro": "状态：{state}；粒子总数 {n}；被跟踪的粒子现在离自己的座位 {d}（模型单位）。",
    "s0roPlain": "状态：{state}；粒子总数 {n}（从头到尾就是这一批，一个不多、一个不少）。",
    "s0hint": "点一个粒子可高亮跟踪，看它被队形困在原地；再点空白处取消跟踪。",
    "nav1": "1 加热：闹得更凶",
    "s1k": "第 1 步",
    "s1t": "加热 = 闹得更凶：温度是粒子平均动能的读数",
    "s1e": "这一步要回答：加热改变了粒子的什么？拖动<strong>温度滑杆</strong>（本页唯一的热源）升温，看粒子本身：同一批固体粒子抖动的幅度与速率肉眼可见地变大，<strong>动能</strong>（动得越凶、动能越大，本页只作定性用语、不给公式）跟着变大。读数行里有<strong>温度（示意）</strong>：它不是从滑杆上抄来的，而是由粒子们的平均速率实算、再映射到 0–120 的示意刻度；下面的「平均速率」是同一批速度的另一读法——两个数同升同降，因为它们量的是同一件事。<strong>温度</strong>，在这里就是粒子平均闹腾程度的读数。把滑杆拖回去降温，抖动随之变弱，可逆。结论（只到定性）：<strong>温度越高，粒子的平均动能越大</strong>——适用条件：同一批粒子、还没发生物态变化时。",
    "s1ro": "温度（示意） {t}；粒子平均速率 {v}（模型单位，从每个粒子的速度实算）；状态：{state}。",
    "s1hint": "滑杆改的是模型的热运动强度（模型参数），不是换一张图——温度读数永远从粒子速度里算出来。",
    "nav2": "2 熔化：队形散了",
    "s2k": "第 2 步",
    "s2t": "熔化：队形散了，温度却停住一截",
    "s2e": "这一步要回答：继续加热，固体为什么会「化」？把滑杆继续往右推，越过熔点（示意读数约 33）：粒子抖到挣脱座位，开始贴身滑动，整齐队形散掉、间距略变大——这就是<strong>熔化</strong>，变成了液体（仍挤在一起、能流动、贴着容器底）。关键现象：熔化途中有一段「滑杆在动、温度读数停住」的平台段——加热的能量先花在拆队形上，读数行会点名「平台」。粒子一个没少，总数读数在位。结论：<strong>熔化 = 队形瓦解、粒子能互相滑动</strong>；熔化过程吸热而温度不变（现实中晶体熔化也是这条规律）。提醒一句：这个平台是模型按设定把加热分流到「拆队形」的定性呈现，终章「模型边界」里会明说。",
    "s2ro": "热量输入（滑杆） {pct}% → 温度（示意） {t}{plateau}；状态：{state}；粒子总数 {n}。",
    "s2plateau": "（平台：能量先花在拆队形）",
    "s2hint": "把滑杆推过平台段之后，读数才恢复上涨——能量拆完队形，才轮到让粒子更快。",
    "nav3": "3 蒸发：表面有人逃逸",
    "s3k": "第 3 步",
    "s3t": "蒸发：表面动得最凶的粒子逃走了",
    "s3e": "这一步要回答：一杯水不烧也会慢慢变干，粒子去哪了？现在粒子是液体（滑杆在中段）。盯住液面：动得最凶的少数粒子偶尔挣脱邻居的拉扯，飞到液面上方的空间里——这就是<strong>蒸发</strong>：只发生在表面、任何温度下都有。读数给「液里 / 空中 / 总数」三数，总数恒定不变。打开「盖上盖子」：逃逸的粒子撞盖返回，空中数涨到一定程度就涨停——逃逸与返回达成平衡（定性一瞥）。结论：水变干不是消失，是粒子搬到了空气里；<strong>蒸发 = 表面动得最凶的粒子逃逸</strong>。逃逸会带走能量：湿手被风一吹更凉，就是蒸发致冷。",
    "s3ro": "液里 {liq} / 空中 {air} / 总数 {n}；温度（示意） {t}；状态：{state}。",
    "s3hint": "空中数涨停时，逃出去的和返回来的一样快——蒸发没停，是达成了平衡。",
    "nav4": "4 沸腾与液化",
    "s4k": "第 4 步",
    "s4t": "沸腾成气，再降温走回来：同一批粒子的循环",
    "s4e": "这一步要回答：烧开时整壶水变气，和蒸发差在哪？降温又会怎样？把滑杆推过沸点（示意读数约 71）：粒子全员挣脱彼此的拉扯，满容器乱飞、间距拉大成气体——<strong>沸腾</strong>是全体事件，发生在液体各处；和第 3 步当场对照：蒸发只是表面少数粒子的逃逸。然后把滑杆拖回降温：同一批粒子慢下来，先聚回液体——这个过程叫<strong>液化</strong>（气体降温变回液体）；再继续降温，粒子排回队形、变回固体。一轮循环走完：固 → 液 → 气 → 液 → 固，粒子还是原来那一批，一个没多、一个没少。结论：<strong>固、液、气是同一批粒子的三种队形</strong>；物态变化可逆、粒子本身不变——这是物理变化与化学变化的分界（后续「分子与原子」页会展开，这里先埋一句）。",
    "s4ro": "液里 {liq} / 空中 {air} / 总数 {n}；状态：{state}；温度（示意） {t}。",
    "s4hint": "降温走完一轮再看总数：和出发时一模一样——变的只是队形与间距。",
    "nav5": "5 自测与终章",
    "s5k": "第 5 步",
    "s5t": "自测：四道题，答案都在前面的现象里",
    "s5e": "这一步用四道题把前面的现象收一遍。题目都出自页面里的实际读数与现象——拿不准时，回到对应的步亲手再看一次，比凭记忆答更可靠。",
    "q1q": "题 1 · 熔化平台段里，滑杆还在往右推（继续加热），温度读数却停住不涨。为什么？",
    "q1o0": "温度计被粒子撞坏了，读数卡住了",
    "q1o1": "加热的能量先花在「拆队形」上，粒子还没来得及更快",
    "q1o2": "平台段里，粒子突然都停止了运动",
    "q1ok": "对——能量先拆队形，平均速率没涨，从速率算出的温度读数自然不动。",
    "q1no": "不对。再想想：读数停住时，粒子是在散队形还是在变快？回第 2 步看一眼平台段。",
    "q2q": "题 2 · 蒸发和沸腾的区别是什么？",
    "q2o0": "蒸发发生在液体内部各处，沸腾只发生在表面",
    "q2o1": "蒸发是表面动得最凶的少数粒子逃走；沸腾是液体里全体粒子一起挣脱",
    "q2o2": "两者没有区别，只是叫法不同",
    "q2ok": "对——一个是表面事件，一个是全体事件。回第 3、4 步可以当场对照。",
    "q2no": "不对：一个只发生在表面，一个发生在液体各处。回第 3、4 步对照看。",
    "q3q": "题 3 · 判断：「水变成水蒸气，是因为粒子变大了。」这句话——",
    "q3o0": "对",
    "q3o1": "错",
    "q3ok": "对，是「错」——粒子没变，变的是间距与队形。可以切到任意状态，点计数和单粒子跟踪亲手验证。",
    "q3no": "再想想：加热改变的是粒子本身，还是它们的队形与间距？",
    "q4q": "题 4 · 气体降温变回液体的过程，叫什么？",
    "q4o0": "熔化",
    "q4o1": "液化",
    "q4o2": "蒸发",
    "q4ok": "对——液化，正好和熔化成对（一个是固→液，一个是气→液）。",
    "q4no": "不对——熔化是固→液；气→液是它在另一头的对应过程。",
    "score": "已答对 {k} / 4",
    "hintHead": "四题全对 · 收束提示",
    "hintBody": "熔化时能量先拆队形，所以有温度平台（第 2 步）；蒸发是表面少数逃逸、沸腾是全体挣脱（第 3、4 步对照）；粒子本身不变，变的是间距与队形；气→液叫液化。物态变化里粒子始终是同一批——这就是物理变化与化学变化的分界，也是下一条线的入口。",
    "card1t": "同一群粒子，三种队形",
    "card1": "固 = 排好队原地抖；液 = 贴身滑动，队形散了但还挨着；气 = 满屋乱飞，彼此离得远。三种物态不是三种东西。",
    "card2t": "加热 = 闹得更凶",
    "card2": "温度（示意）读数由粒子平均速率实算；温度越高，粒子平均动能越大。本页只到这句定性口径。",
    "card3t": "物态变化，粒子不变",
    "card3": "固 → 液 → 气 → 液 → 固走完一轮，粒子一个没多、一个没少；物态变化可逆，变的是队形与间距。",
    "modelTitle": "这页的模型边界（如实交代）",
    "modelBoundary": "本页是教学简化模型，三处失配明说：①<strong>二维</strong>——粒子是平面上的等大圆盘，不是三维空间里的分子，队形与间距只在二维成立；②<strong>碰撞是示意</strong>——粒子之间、粒子与器壁用弹性碰撞的简化处理，固体与液体的「挨着」靠短程约束近似，不算真实的分子间作用力曲线；③<strong>温度是示意标尺</strong>——读数由模拟内粒子的平均速率映射到 0–120，只保证单调、定性正确，不冒充真实摄氏温度的精确对应；熔点、沸点是示意刻度上的设定值，平台段是模型把加热按设定分流到「拆队形」，不是从模拟里自发涌现的。",
    "finNote1": "后续页（未建，此处只作文字埋线、不挂链）：「温度与热量」会接着讲热量、比热与热传递，是这条线的下一站。",
    "finNote2": "站内已有的速度概念页讲的是宏观物体的速度—时间图，与本页微观粒子的速率落点不贴切，这里不挂链；本页的「快慢」只用模型单位的平均速率。"
  },
  "en": {
    "docTitle": "Particles & States of Matter · One Interaction per Step",
    "back": "← Knowledge Index",
    "pageTitle": "Particles & States of Matter",
    "tagline": "Ice, water, and steam are the same stuff in three guises. Zoom in past what the eye can see, and watch one crowd of particles hold three different formations — heating just makes them wilder.",
    "foot": "Particles & States of Matter · One Interaction per Step",
    "navLabel": "Step navigation",
    "canvasLabel": "Particle simulation canvas; see the instructions above",
    "play": "▶ Play",
    "pause": "⏸ Pause",
    "reset": "Reset: back to the solid start",
    "resetQuiz": "Redo the quiz",
    "heatLab": "Heating (temperature slider)",
    "lidLab": "Put the lid on",
    "stateSolid": "solid",
    "stateLiquid": "liquid",
    "stateGas": "gas",
    "nav0": "0 Particles in a solid",
    "s0k": "Step 0",
    "s0t": "Look at a crowd of particles: in a solid they jiggle in place",
    "s0e": "This step answers one question: zoomed down to particle scale, what are the particles inside a “solid” actually doing? The dots are <strong>particles</strong> — the tiny units matter is made of, far too small to see, drawn here as little discs. They stand in a neat formation, touching each other: that is the <strong>state of matter</strong> (the general word for the solid, liquid, and gas forms) called solid. Press ▶ Play: every particle <strong>jiggles around its own seat</strong> — the picture is computed frame by frame by a real simulation, not a frozen poster; pause and the picture stops on the current frame. Click a particle to track it with a highlight: it can neither leave nor return to its seat — it can only fuss in place. The takeaway: <strong>a solid = particles in formation, vibrating in place</strong>; the shape stays fixed because the formation stays fixed.",
    "s0ro": "State: {state}; particles in total {n}; the tracked particle is now {d} (model units) from its seat.",
    "s0roPlain": "State: {state}; particles in total {n} (the same crowd from start to finish — none added, none lost).",
    "s0hint": "Click a particle to track it and watch it trapped by the formation; click empty space to untrack.",
    "nav1": "1 Heating: wilder",
    "s1k": "Step 1",
    "s1t": "Heating = wilder: temperature reads the particles' average kinetic energy",
    "s1e": "This step answers one question: what does heating change about the particles? Drag the <strong>temperature slider</strong> (this page's only heat source) upward and watch the particles themselves: the same crowd of solid particles jiggles visibly wider and faster, and their <strong>kinetic energy</strong> (the wilder the motion, the more kinetic energy — used qualitatively on this page, no formula) grows with it. The readout's <strong>temperature (indicative)</strong> is not copied from the slider: it is computed from the particles' average speed and mapped onto an indicative 0–120 scale; the “average speed” below is a second reading of the same speeds — the two numbers rise and fall together because they measure the same thing. <strong>Temperature</strong>, here, is a reading of how wild the particles are on average. Drag the slider back down and the jiggling calms — reversible. The takeaway (qualitative only): <strong>the higher the temperature, the greater the particles' average kinetic energy</strong> — provided it is the same crowd and no change of state has happened yet.",
    "s1ro": "Temperature (indicative) {t}; average particle speed {v} (model units, computed from every particle's velocity); state: {state}.",
    "s1hint": "The slider changes the model's thermal-agitation strength (a model parameter), not the picture — the temperature reading always comes out of the particles' speeds.",
    "nav2": "2 Melting: formation breaks",
    "s2k": "Step 2",
    "s2t": "Melting: the formation breaks up — and the temperature pauses",
    "s2e": "This step answers one question: keep heating, and why does the solid “melt”? Push the slider further right, past the melting point (indicative reading ≈ 33): the particles jiggle free of their seats, start sliding past each other, the neat formation falls apart, and the spacing grows a little — that is <strong>melting</strong>, and the crowd is now a liquid (still bunched together, able to flow, hugging the bottom of the vessel). The key phenomenon: partway through there is a stretch where “the slider moves but the temperature reading stands still” — a plateau: the heat energy is spent first on breaking the formation, and the readout names it. Not one particle is lost; the count readout is right there. The takeaway: <strong>melting = the formation falls apart and particles can slide</strong>; melting absorbs heat while the temperature stays put (real crystals obey the same rule). One honest note: the plateau is the model diverting the heating into “breaking the formation” by design — the finale's “Model boundaries” section says so openly.",
    "s2ro": "Heat input (slider) {pct}% → temperature (indicative) {t}{plateau}; state: {state}; particles in total {n}.",
    "s2plateau": " (plateau: energy is going into breaking the formation)",
    "s2hint": "Only after the slider crosses the whole plateau does the reading climb again — once the formation is broken, the energy can go back into making particles faster.",
    "nav3": "3 Evaporation: escapes",
    "s3k": "Step 3",
    "s3t": "Evaporation: the wildest particles escape from the surface",
    "s3e": "This step answers one question: a cup of water slowly dries up without ever boiling — where do the particles go? The crowd is a liquid now (slider around the middle). Watch the surface: now and then, one of the wildest particles breaks free of its neighbours' pull and flies into the space above the liquid — that is <strong>evaporation</strong>: it happens only at the surface, and at any temperature. The readout gives three counts — in the liquid / in the air / in total — and the total never changes. Tick “Put the lid on”: escapees bounce off the lid and come back, so the air count climbs to a level and stops — escaping and returning have reached a balance (a qualitative glimpse). The takeaway: drying up is not disappearing — the particles moved into the air; <strong>evaporation = the wildest surface particles escaping</strong>. Escaping carries energy away, too: a wet hand feels colder in a breeze — evaporative cooling.",
    "s3ro": "In liquid {liq} / in air {air} / total {n}; temperature (indicative) {t}; state: {state}.",
    "s3hint": "When the air count levels off, escaping and returning run at the same rate — evaporation hasn't stopped; it has balanced out.",
    "nav4": "4 Boiling & condensing",
    "s4k": "Step 4",
    "s4t": "Boiling into gas, then cooling back: one crowd, full cycle",
    "s4e": "This step answers one question: when a whole pot boils away, how is that different from evaporation — and what happens on cooling? Push the slider past the boiling point (indicative reading ≈ 71): every particle breaks free of the others' pull, they fly all over the vessel, and the spacing opens wide into a gas — <strong>boiling</strong> is a whole-crowd event, happening throughout the liquid; set it beside Step 3: evaporation was a few surface escapees. Then drag the slider back down: the same crowd slows, gathers back into a liquid first — that process is called <strong>condensation</strong> (a gas cooling back into a liquid) — and on further cooling lines up into formation as a solid again. One full cycle: solid → liquid → gas → liquid → solid, and the particles are the same crowd throughout — none added, none lost. The takeaway: <strong>solid, liquid, and gas are three formations of the same particles</strong>; changes of state are reversible and the particles themselves do not change — that is the dividing line between physical and chemical change (a later “Molecules & Atoms” page will pick this up; noted here in text only).",
    "s4ro": "In liquid {liq} / in air {air} / total {n}; state: {state}; temperature (indicative) {t}.",
    "s4hint": "After cooling through a full cycle, check the total: exactly where it started — only the formation and the spacing changed.",
    "nav5": "5 Quiz & finale",
    "s5k": "Step 5",
    "s5t": "Quiz: four questions, all answered by the phenomena above",
    "s5e": "This step gathers the phenomena into four questions. Every question comes from the page's actual readouts and phenomena — if you're unsure, go back to the step and look again instead of guessing from memory.",
    "q1q": "Q1 · During the melting plateau, the slider is still moving right (still heating), yet the temperature reading stands still. Why?",
    "q1o0": "The thermometer got knocked by a particle and the reading is stuck",
    "q1o1": "The heat energy goes into breaking the formation first; the particles aren't getting faster yet",
    "q1o2": "During the plateau, all the particles suddenly stop moving",
    "q1ok": "Right — the energy breaks the formation first; the average speed doesn't rise, so a temperature read off the speeds doesn't move.",
    "q1no": "Not quite. Ask instead: while the reading is stuck, are the particles spreading out of formation or getting faster? Look at Step 2's plateau again.",
    "q2q": "Q2 · What is the difference between evaporation and boiling?",
    "q2o0": "Evaporation happens throughout the liquid; boiling only at the surface",
    "q2o1": "Evaporation is a few of the wildest surface particles escaping; boiling is every particle in the liquid breaking free at once",
    "q2o2": "There is no difference — just two names for the same thing",
    "q2ok": "Right — one is a surface event, the other a whole-crowd event. Steps 3 and 4 put them side by side.",
    "q2no": "No: one happens only at the surface, the other throughout the liquid. Compare Steps 3 and 4.",
    "q3q": "Q3 · True or false: “Water turns into steam because the particles got bigger.”",
    "q3o0": "True",
    "q3o1": "False",
    "q3ok": "Right, it's false — the particles don't change; the spacing and formation do. Switch to any state and check with the counts and single-particle tracking yourself.",
    "q3no": "Think again: does heating change the particles themselves, or their formation and spacing?",
    "q4q": "Q4 · A gas cooling back into a liquid — what is that process called?",
    "q4o0": "Melting",
    "q4o1": "Condensation",
    "q4o2": "Evaporation",
    "q4ok": "Right — condensation, the counterpart of melting (one is solid→liquid, the other gas→liquid).",
    "q4no": "No — melting is solid→liquid; gas→liquid is its counterpart at the other end.",
    "score": "{k} / 4 correct",
    "hintHead": "All four correct · Wrap-up hint",
    "hintBody": "During melting, the energy breaks the formation first — hence the temperature plateau (Step 2); evaporation is a few surface escapees while boiling is the whole crowd breaking free (compare Steps 3 and 4); the particles themselves never change — only the spacing and formation do; gas→liquid is condensation. Through every change of state the particles are the same crowd — that is the dividing line between physical and chemical change, and the doorway to the next thread.",
    "card1t": "One crowd, three formations",
    "card1": "Solid = lined up, jiggling in place; liquid = sliding past each other, formation gone but still bunched; gas = flying everywhere, far apart. Three states of matter are not three different stuffs.",
    "card2t": "Heating = wilder motion",
    "card2": "The temperature (indicative) reading is computed from the particles' average speed; the higher the temperature, the greater the average kinetic energy. This page keeps that qualitative.",
    "card3t": "Changes of state leave particles unchanged",
    "card3": "Run the full cycle solid → liquid → gas → liquid → solid and not one particle is added or lost; changes of state are reversible — what changes is the formation and the spacing.",
    "modelTitle": "This page's model boundaries (stated honestly)",
    "modelBoundary": "This page is a teaching model with three simplifications, stated openly: ① <strong>Two-dimensional</strong> — the particles are equal discs on a plane, not molecules in 3D space; formations and spacings hold only in 2D. ② <strong>Collisions are schematic</strong> — particles and walls use a simplified elastic-collision treatment, and the “bunching” of solids and liquids is approximated by a short-range constraint, not a real intermolecular force curve. ③ <strong>The temperature is an indicative scale</strong> — the reading maps the simulated particles' average speed onto 0–120, guaranteeing only monotonic, qualitatively correct behaviour, not an exact correspondence with real degrees Celsius; the melting and boiling points are set values on this indicative scale, and the plateau is the model diverting the heating into “breaking the formation” by design, not something that emerges spontaneously from the simulation.",
    "finNote1": "Coming later (not yet built — a text note only, no link): “Temperature & Heat” will take up heat, specific heat capacity, and heat transfer as the next stop on this thread.",
    "finNote2": "The site's existing velocity page covers the velocity–time graphs of macroscopic objects; its landing point doesn't fit this page's microscopic particle speeds, so no link is made here — this page's “fast and slow” is just the average speed in model units."
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
  return storedLang() || _langMem;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }
function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
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
