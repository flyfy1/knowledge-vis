'use strict';
// Water cycle lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '水的循环 · 跟着一滴水走一圈',
    back: '← 知识索引',
    compare: '对照另一版本：水的循环 · 一滴水的旅行 →',
    navLabel: '水的循环步骤导航',
    tagline: '地球上的水几乎都在海里，可雨天天在下。水是怎么从海里跑到天上、再落回地面、最后流回海里的？七步里，你会先数清水都在哪里，再亲手晒干一滩水、把空气推上山变成云、让云滴长成雨滴、看雨水在森林和城市里的去处，最后跟着一滴水走完它的旅行。',
    nav0: '0 水在哪里', nav1: '1 蒸发', nav2: '2 成云', nav3: '3 下雨', nav4: '4 落地以后', nav5: '5 一滴水的旅行', nav6: '6 收束',

    s0k: '第 0 步 · 先数一数',
    s0t: '把地球上所有的水装进一个瓶子，海、冰、地下、天上各占多少？',
    s0e: '这一步要回答：地球上的水都放在哪里，各有多少？科学家把水所在的地方叫作<strong>水库</strong>（不是指人造的水坝，而是「存水的地方」）：海洋、冰川和冰盖、地下水、湖泊、土壤里的水、空气里的水汽、河流，还有生物身体里的水。下图有三条横条。第一条是全部的水；第二条把第一条最右边「海洋以外」那一小段<strong>放大</strong>成一整条；第三条再把第二条最右边「冰和地下水以外」那一小段放大成一整条。数据来自科学家的全球估算（Trenberth 等，2007）。',
    s0lgOcean: '海洋', s0lgIce: '冰川和冰盖', s0lgGround: '地下水', s0lgLakes: '湖泊', s0lgSoil: '土壤里的水', s0lgPerma: '冻土里的冰', s0lgAir: '空气里的水汽', s0lgRivers: '河流', s0lgLife: '生物体内',
    c0row0: '全部的水', c0row1: '放大「海洋以外」的 {p}%', c0row2: '再放大「冰和地下水以外」的 {p}%',
    bottle: '一瓶 1 升', bucket: '一桶 10 升', tub: '一浴缸 150 升',
    s0readout: '如果全世界的水只有{c}：海洋 {ocean}，冰川 {ice}，地下水 {ground}，湖泊加河流 {lr}，空气里的水汽只有 {air}（约 {drops} 滴，按 20 滴 = 1 毫升算）。',
    s0hint: '观察顺序：先看第一条，海洋几乎占满；再顺着放大线看第二、三条。然后点三个容器按钮，比较空气里的水汽在不同容器里是多少。记住这个很小的数：第 5 步会算出，正是因为它这么少，空气里的水每过十天左右就要整个换一遍。',
    ml: '{v} 毫升', litre: '{v} 升',

    s1k: '第 1 步 · 蒸发',
    s1t: '一滩 1 厘米深的水，在什么天气里干得最快？',
    s1e: '这一步要回答：同一滩水，天热、天干、刮风，各让它干得快多少？水面上总有一些水分子动得特别快，冲出水面跑进空气，变成看不见的<strong>水汽</strong>（气体状态的水），这就是<strong>蒸发</strong>（<a class="xlink" href="../../../chemistry/matter/particles-states/#step3">→ 物质三态页第 3 步：为什么是动得最快的粒子先逃走</a>）。空气里本来就有水汽，也会有水分子落回水面。<strong>相对湿度</strong>说的是空气「装了几成满」：已有的水汽 ÷ 这个温度下空气最多能装的水汽。到 100% 时进出一样多，水面就不再变少。风会把水面上方潮湿的空气吹走，换上干一点的空气。下图上面画水坑，下面画水深随时间下降：横轴是小时，纵轴是水深（毫米）。',
    temp: '气温', humid: '相对湿度', wind: '风速',
    c1top: '水坑（每个小点代表蒸发出去的水汽）', c1bot: '水深 / 毫米　（横轴：小时）',
    s1lgNow: '这次的天气', s1lgOld: '刚才试过的天气（最多留 5 条）',
    sunBtn: '晒 3 天看看', s1clear: '清空旧线',
    s1readout: '气温 {T} ℃、相对湿度 {rh}%、风速 {u} 米/秒：每天蒸发 {rate} 毫米，这滩 10 毫米深的水约 {time} 后干。',
    s1never: '气温 {T} ℃、相对湿度 100%：空气已经装满，跑出去和落回来的水一样多，这滩水不会变少。',
    hours: '{v} 小时', days: '{v} 天',
    s1hint: '观察顺序：保持风速 0、湿度 50%，只拖气温，看下图的线变陡；再固定气温，把湿度拖到 100%，线变平；最后加风。每次改动，上一次的线会留下作对照。说明：公式只算了「空气把水汽带走」这一部分，没有算阳光直接把水晒热，所以真实的晴天会干得更快。',

    s2k: '第 2 步 · 成云',
    s2t: '湿空气被推上山，为什么到某个高度就突然冒出云？',
    s2e: '这一步要回答：看不见的水汽，在哪个高度、为什么变成看得见的云？空气能装下的水汽有上限，叫作<strong>饱和</strong>；这个上限随温度降低而变小。本页用「每千克空气最多装多少克水汽」来量它。风把空气推上山坡，或者热空气自己往上升，高处的气压更低（<a class="xlink" href="../../../physics/matter/pressure/#step3">→ 压强页第 3 步：为什么高处气压小</a>），空气就膨胀、变冷；还没有云时，大约每升高 1 千米冷 9.8 ℃。空气带着的水汽不变，上限却越来越小。两者相等的高度叫<strong>云底</strong>，再往上，多出来的水汽就<strong>凝结</strong>成很小的水滴，这就是云。凝结会放出热，所以在云里上升时降温变慢。「每千克空气里的水汽」那张图：纵轴是高度，横轴是每千克空气里的水汽克数。',
    t0: '山脚气温', rh0: '山脚相对湿度', zh: '空气被推到的高度',
    c2a: '山坡上的一团空气', c2b: '每千克空气里的水汽 / 克　（纵轴：高度 千米）',
    s2lgCap: '最多能装（饱和上限）', s2lgVap: '实际带着的水汽（云底以上与上限重合）', s2lgCloud: '凝结成云滴的水', s2lgBase: '云底（两张图里都是虚线）',
    climbBtn: '把空气推上山',
    s2readout: '在 {z} 米：气温 {T} ℃，最多能装 {ws} 克/千克，实际水汽 {vap} 克/千克，已凝结成云滴 {cloud} 克/千克。{base}',
    s2base: '云底在约 {b} 米（山脚露点 {td} ℃）。',
    s2nobase: '推到 4000 米还没有饱和，不会出云（山脚露点 {td} ℃）。',
    s2hint: '观察顺序：先按「把空气推上山」，看那团空气一路变冷；在「每千克空气里的水汽」图里，青色的上限线向左缩，碰到橙色的水汽线时，空气团周围出现云。再把山脚湿度调高，看云底降低；调低湿度，云底升高甚至不出云。气压按每升高 8.4 千米降到约 1/2.7 的简化规律计算。',

    s3k: '第 3 步 · 下雨',
    s3t: '云也是水做的，为什么云飘着，雨却会落下来？',
    s3e: '这一步要回答：水滴要长到多大，才能落到地上？任何水滴在空气里下落，都会被空气拦住，很快达到一个不再变快的速度，叫<strong>落速</strong>。水滴越小，落速越慢。云里还有向上吹的风，叫<strong>上升气流</strong>。只有落速超过上升气流，水滴才会往下走。典型的<strong>云滴</strong>半径只有 0.01 毫米（10 微米）。云滴在云里互相碰撞、合并，长成半径 0.1 毫米以上的<strong>雨滴</strong>，才落得下来。「落速」那张图横轴是水滴半径（毫米），纵轴是落速（米/秒），两个轴都按「每格乘 10」来画。',
    radius: '水滴半径', updraft: '上升气流',
    c3a: '同一比例尺下的大小（每格 {g}）', c3b: '落速 / 米每秒　（横轴：半径 毫米）',
    s3lgCurve: '落速', s3lgUp: '上升气流', s3lgTrail: '长大过程中走过的点',
    growBtn: '让一颗云滴慢慢长大',
    s3readout: '半径 {r}：落速 {v} 米/秒，上升气流 {w} 米/秒 → {verdict}。无风时落下 1 千米要 {time}。合成它要约 {n} 个 10 微米的云滴。',
    s3down: '往下落，净速度 {d} 米/秒', s3up: '被吹着往上走，净速度 {d} 米/秒', s3hover: '几乎悬着不动',
    minutes: '{v} 分钟',
    s3hint: '观察顺序：先把上升气流设成 0.5 米/秒，按「让一颗云滴慢慢长大」：亮点沿曲线爬升，越过黄色的上升气流线时，水滴开始下落。再把上升气流调大（雷雨云里可达每秒几米），看要长到多大才落得下来。半径最大到 2 毫米；更大的水滴下落时会被吹碎。落速用云物理教科书（Rogers 和 Yau）的分段近似公式计算。',

    s4k: '第 4 步 · 落地以后',
    s4t: '同一场雨，落在森林和落在城市，水的去处一样吗？',
    s4e: '这一步要回答：雨落到地上以后，有多少直接流走，有多少钻进地下，又多快回到河里？雨水先往土里钻，叫<strong>下渗</strong>；每种地面每小时最多能渗进去的水量不同，森林的松软土壤渗得快，水泥路面几乎不渗。渗不进去的水在地面上流进小沟、再汇进河，叫<strong>地表径流</strong>。渗进去的水先把表层土壤润湿，这部分以后会被植物吸走、再蒸发回空气；多余的继续往下，填满土壤和岩石的缝隙，成为<strong>地下水</strong>，地下水再慢慢渗进河里。下面一场雨下 2 小时。上图把这场雨的去向画成一条横条；下图画河里的流量：横轴是从开始下雨算起的小时数，纵轴是「整片地每小时流进河的水有多少毫米深」。',
    rain: '雨有多大（每小时）',
    forest: '森林', grass: '草地', farm: '农田', city: '城市',
    c4a: '这场雨的去向（总雨量 {total} 毫米）', c4b: '河里的流量 / 毫米每小时　（横轴：小时）',
    s4lgRun: '地表径流（很快进河）', s4lgSoil: '留在表层土壤（以后回到空气）', s4lgGround: '变成地下水（慢慢进河）',
    s4lgRain: '浅色竖条：下雨的 2 小时',
    s4lgThick: '流量图里：每种地面一种颜色，粗线是当前选中的', s3cloud: '10 微米的云滴', s3drop: '这颗水滴',
    s4readout: '{surf}，雨 {I} 毫米/小时 × 2 小时 = {total} 毫米：地表径流 {run}，留在表层土壤 {soil}，变成地下水 {gw}。河的流量最大 {peak} 毫米/小时，出现在开始下雨后 {pt} 小时；48 小时内共有 {river} 毫米进了河，还有 {left} 毫米留在地下慢慢流。',
    s4readout0: '{surf}，雨 {I} 毫米/小时 × 2 小时 = {total} 毫米：全部渗进去，留在表层土壤里，河里没有涨水。这些水以后会被植物吸走、蒸发回空气。',
    mm: '{v} 毫米',
    s4hint: '观察顺序：保持雨量不变，依次点「森林」「草地」「农田」「城市」，比较下图几条线的高峰：城市的流量又高又急，森林的流量低但拖得很长。再把雨调大，看森林也开始有地表径流。各种地面的渗水速度和土壤容量是教学用的代表值，真实地面差别很大；这个模型也没有算下雨时就有的蒸发。',

    s5k: '第 5 步 · 一滴水的旅行',
    s5t: '一滴水会在海里、天上、地下各待多久？',
    s5e: '这一步要回答：一滴水平均在每个地方停留多久？把每个水库看成一个浴缸：水龙头往里放水，下水口往外流水。进出一样多时，缸里的水量不变，但里面的水在不断更换。平均一滴水在缸里待的时间叫<strong>停留时间</strong>，等于「缸里的水量 ÷ 每年流出的水量」。上图画了五个水库和它们之间每年流动的水量（单位：千立方千米/年，箭头越粗流量越大）。按「放一滴水」，这滴水会随机地走 10 段：在每个地方待多久、下一站去哪里，都按真实的流量比例抽签决定。下图横轴每一格乘 10，从 1 天到 10 万年；空心圈是公式算出的停留时间，实心点是到目前为止所有模拟的水滴实际待的平均时间。',
    oneDrop: '放一滴水，走 10 段', hundred: '一次放 100 滴', s5clear: '清空统计',
    boxOcean: '海洋', boxAir: '空气', boxLand: '陆地表面', boxGround: '地下水', boxIce: '冰川',
    c5a: '五个水库之间每年流动的水（千 km³/年）', c5b: '平均停留时间（每格 ×10）',
    s5lgFormula: '公式：水量 ÷ 每年流出量', s5lgSim: '模拟水滴的平均停留', s5lgDrop: '正在旅行的水滴',
    s5journey: '这滴水的旅程：{legs}。共 {total}。',
    s5stats: '已模拟 {n} 滴、{k} 段停留。空气：公式 {air}，模拟 {airSim}（{airN} 段）。所有水库都是流进 = 流出，所以每个水库的水量保持不变。',
    s5empty: '还没有放水滴。按上面的按钮开始。',
    s5progress: '正在走第 {k}/10 段……',
    year: '{v} 年', day: '{v} 天',
    s5hint: '观察顺序：先放一滴，读下面的旅程：它多半在海里一待几千年，到了空气里却只待几天。再按「一次放 100 滴」几次，看下图的实心点慢慢靠到空心圈上：随机走出来的平均值，就是「水量 ÷ 流出量」。说明：陆地表面把湖泊、河流、土壤里的水合在一起；冰川每年进出约 2.5、地下水每年进出约 13 千立方千米，是本页取的近似值。',

    s6k: '第 6 步 · 收束', s6t: '把一滴水的旅行说给别人听',
    s6fin: '<strong>第 0 步</strong>：地球上约 97% 的水在海里，空气里的水汽还不到十万分之一。<strong>第 1 步</strong>：天越热、空气越干、风越大，蒸发越快。<strong>第 2 步</strong>：空气上升变冷，能装的水汽变少，多出来的就凝结成云。<strong>第 3 步</strong>：云滴太小、落得太慢，要上千、甚至上百万个合并成一颗雨滴才落得下来。<strong>第 4 步</strong>：雨落到地上，一部分很快流进河，一部分渗进地下慢慢走；城市的地面让河水涨得又快又高。<strong>第 5 步</strong>：每个水库都是流进等于流出，总量不变，但水一直在换：空气里的水约 {airDays} 天换一遍，海里的水要约 {oceanYears} 年。',
    quizPrompt: '小测：空气里的水汽，平均多久会整个换一遍？',
    quizA: '大约 10 天', quizB: '大约 1 年', quizC: '大约 3000 年',
    check: '检查答案', correct: '对。空气里的水只有 12.7 千立方千米，每年却要流出 486 千立方千米，所以 12.7 ÷ 486 年 ≈ {d} 天。', wrong: '再想想：空气里的水量很少，每年流出去的雨雪却很多。用第 5 步的「水量 ÷ 每年流出量」算一算。',
    boundary: '适用范围：本页的数字是全球平均的估算，不同地方、不同季节差别很大。第 1–4 步是简化的教学模型：蒸发没算阳光直接晒热水面；气压随高度用固定规律；落速用分段近似；地面渗水用代表值，没有算雨中的蒸发。第 5 步的冰川和地下水流量是本页取的近似值。',
    linksTitle: '接着去看',
    lk1: '→ 物质三态，第 3 步：蒸发时，为什么是动得最快的粒子先离开水面',
    lk2: '→ 压强，第 3 步：高处的气压为什么更小',
    lk3: '→ 地球能量收支，第 0 步：同一个太阳，为什么不同地方晒到的能量不同',
    lk4: '→ 气候反馈，第 0 步：地球进来和出去的能量怎样对账',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《水的循环 · 一滴水的旅行》的平行版本。'
  },
  en: {
    pageTitle: 'The Water Cycle · Following One Drop Around',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Water Cycle · One Drop’s Journey →',
    navLabel: 'Water cycle steps',
    tagline: 'Almost all of Earth’s water sits in the sea, yet it rains somewhere every day. How does water get from the ocean into the sky, back onto the land and home to the sea? In seven steps you will count where the water is, dry out a puddle, push air up a mountain until it clouds over, grow a cloud droplet into a raindrop, see where rain goes in a forest and in a city, and finally follow one drop on its travels.',
    nav0: '0 Where it is', nav1: '1 Evaporation', nav2: '2 Clouds', nav3: '3 Rain', nav4: '4 After landing', nav5: '5 A drop’s journey', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Take stock',
    s0t: 'Pour all of Earth’s water into one bottle: how much is sea, ice, underground and sky?',
    s0e: 'This step answers: where is Earth’s water kept, and how much is in each place? Scientists call each place that holds water a <strong>reservoir</strong> (not a dam, just “somewhere water is stored”): the ocean, glaciers and ice sheets, groundwater, lakes, water in the soil, water vapour in the air, rivers, and the water inside living things. There are three bars below. The first is all of the water. The second takes the tiny “everything except the ocean” piece at the right end of the first bar and <strong>zooms in</strong> until it fills a whole bar. The third does the same with the “everything except ice and groundwater” piece of the second bar. The numbers are scientists’ global estimates (Trenberth and colleagues, 2007).',
    s0lgOcean: 'Ocean', s0lgIce: 'Glaciers and ice sheets', s0lgGround: 'Groundwater', s0lgLakes: 'Lakes', s0lgSoil: 'Water in soil', s0lgPerma: 'Ice in frozen ground', s0lgAir: 'Water vapour in air', s0lgRivers: 'Rivers', s0lgLife: 'Inside living things',
    c0row0: 'All of the water', c0row1: 'Zoom into the {p}% that is not ocean', c0row2: 'Zoom into the {p}% that is not ice or groundwater',
    bottle: 'A 1-litre bottle', bucket: 'A 10-litre bucket', tub: 'A 150-litre bathtub',
    s0readout: 'If all the world’s water filled {c}: ocean {ocean}, glaciers {ice}, groundwater {ground}, lakes plus rivers {lr}, and the water vapour in the air just {air} (about {drops} drops, at 20 drops to a millilitre).',
    s0hint: 'What to look at: first the top bar, which the ocean almost fills; then follow the zoom lines down to the second and third bars. Then press the three container buttons and see how much water vapour the air gets in each. Keep that tiny number in mind: step 5 shows that because the air holds so little, its water is completely replaced about every ten days.',
    ml: '{v} mL', litre: '{v} L',

    s1k: 'Step 1 · Evaporation',
    s1t: 'A puddle 1 cm deep: what kind of weather dries it fastest?',
    s1e: 'This step answers: for the same puddle, how much faster do heat, dry air and wind make it disappear? At the surface some water molecules are always moving especially fast; they break out into the air and become invisible <strong>water vapour</strong> (water as a gas). That is <strong>evaporation</strong> (<a class="xlink" href="../../../chemistry/matter/particles-states/#step3">→ States of matter, step 3: why the fastest particles escape first</a>). The air already holds some vapour, and some of those molecules land back in the water. <strong>Relative humidity</strong> says how full the air is: the vapour it holds ÷ the most it could hold at that temperature. At 100% as many molecules land as leave, so the puddle stops shrinking. Wind sweeps away the damp air sitting just above the water and brings in drier air. The top picture shows the puddle; the bottom one shows its depth falling over time, with hours across and depth in millimetres up the side.',
    temp: 'Air temperature', humid: 'Relative humidity', wind: 'Wind speed',
    c1top: 'The puddle (each dot is vapour that has left)', c1bot: 'Depth / mm   (across: hours)',
    s1lgNow: 'This weather', s1lgOld: 'Weather you tried before (up to 5 lines)',
    sunBtn: 'Run 3 days of sunshine', s1clear: 'Clear old lines',
    s1readout: '{T} °C, relative humidity {rh}%, wind {u} m/s: {rate} mm evaporates per day, so this 10 mm puddle is dry after about {time}.',
    s1never: '{T} °C and 100% relative humidity: the air is full, as much water lands as leaves, and the puddle does not shrink.',
    hours: '{v} hours', days: '{v} days',
    s1hint: 'What to try: keep wind at 0 and humidity at 50% and drag only the temperature; the line in the bottom chart gets steeper. Then fix the temperature and push humidity to 100%; the line goes flat. Finally add wind. Each change leaves the previous line behind for comparison. Note: the formula only counts the air carrying vapour away, not sunshine heating the water directly, so a real sunny day dries a puddle faster.',

    s2k: 'Step 2 · Clouds',
    s2t: 'Push moist air up a mountain: why does a cloud suddenly appear at one height?',
    s2e: 'This step answers: at what height, and why, does invisible vapour turn into a visible cloud? Air can only hold so much water vapour; holding the most it can is called being <strong>saturated</strong>, and that limit shrinks as the air gets colder. Here we measure it as the most grams of vapour one kilogram of air can hold. When wind pushes air up a slope, or warm air rises on its own, the pressure higher up is lower (<a class="xlink" href="../../../physics/matter/pressure/#step3">→ Pressure, step 3: why the air pressure drops with height</a>), so the air expands and cools; before any cloud forms it cools about 9.8 °C for every kilometre it rises. The vapour it carries stays the same while the limit keeps shrinking. The height where they meet is the <strong>cloud base</strong>. Above it the extra vapour <strong>condenses</strong> into tiny droplets, and that is a cloud. Condensing releases heat, so rising air cools more slowly inside a cloud. In the “Vapour per kg of air” chart height runs up the side and grams of vapour per kilogram of air run across.',
    t0: 'Temperature at the foot', rh0: 'Relative humidity at the foot', zh: 'Height the air is pushed to',
    c2a: 'A parcel of air on the slope', c2b: 'Vapour per kg of air / g   (up: height, km)',
    s2lgCap: 'Most it can hold (saturation)', s2lgVap: 'Vapour actually carried (equals the limit above the base)', s2lgCloud: 'Water condensed into droplets', s2lgBase: 'Cloud base (dashed in both pictures)',
    climbBtn: 'Push the air up the mountain',
    s2readout: 'At {z} m: {T} °C, it can hold at most {ws} g/kg, it carries {vap} g/kg of vapour, and {cloud} g/kg has condensed into droplets. {base}',
    s2base: 'The cloud base is at about {b} m (dew point at the foot {td} °C).',
    s2nobase: 'Still not saturated at 4000 m, so no cloud forms (dew point at the foot {td} °C).',
    s2hint: 'What to try: press “Push the air up the mountain” and watch the parcel cool as it climbs; in the “Vapour per kg of air” chart the cyan limit line shrinks to the left, and when it touches the orange vapour line a cloud appears around the parcel. Then raise the humidity at the foot and the cloud base drops; lower it and the base rises, or no cloud forms at all. Pressure follows a simplified rule that it falls to about 1/2.7 every 8.4 km.',

    s3k: 'Step 3 · Rain',
    s3t: 'Clouds are made of water too, so why do clouds float while rain falls?',
    s3e: 'This step answers: how big must a drop grow before it can reach the ground? Any drop falling through air is held back by the air and soon stops speeding up; that steady speed is its <strong>fall speed</strong>. The smaller the drop, the slower it falls. Clouds also contain air blowing upwards, called an <strong>updraught</strong>. A drop only moves down if its fall speed beats the updraught. A typical <strong>cloud droplet</strong> has a radius of just 0.01 mm (10 micrometres). Droplets bump into each other and merge, and only once they become <strong>raindrops</strong> of 0.1 mm radius or more can they fall out. In the “Fall speed” chart the drop radius (mm) runs across and the fall speed (m/s) runs up; both axes multiply by 10 at each grid line.',
    radius: 'Drop radius', updraft: 'Updraught',
    c3a: 'Sizes on one scale (grid = {g})', c3b: 'Fall speed / m/s   (across: radius, mm)',
    s3lgCurve: 'Fall speed', s3lgUp: 'Updraught', s3lgTrail: 'Points passed while growing',
    growBtn: 'Grow one cloud droplet slowly',
    s3readout: 'Radius {r}: falls at {v} m/s against a {w} m/s updraught → {verdict}. In still air it would take {time} to fall 1 km. Building it takes about {n} cloud droplets of 10 µm.',
    s3down: 'it moves down at {d} m/s', s3up: 'it is carried up at {d} m/s', s3hover: 'it barely moves',
    minutes: '{v} min',
    s3hint: 'What to try: set the updraught to 0.5 m/s and press “Grow one cloud droplet slowly”. The bright dot climbs the curve, and once it crosses the yellow updraught line the drop starts to fall. Then make the updraught stronger (storm clouds reach several metres per second) and see how big a drop must grow to escape. The radius stops at 2 mm because bigger drops get torn apart as they fall. Fall speeds use the piecewise approximation from a cloud-physics textbook (Rogers and Yau).',

    s4k: 'Step 4 · After landing',
    s4t: 'The same rain falls on a forest and on a city: does the water end up in the same places?',
    s4e: 'This step answers: once rain hits the ground, how much runs straight off, how much sinks in, and how quickly does it reach the river? Rain first tries to soak into the soil; this is <strong>infiltration</strong>. Each kind of ground can only soak up so much per hour: loose forest soil takes water quickly, concrete hardly at all. Whatever cannot soak in flows over the surface into ditches and then rivers; this is <strong>surface runoff</strong>. The water that soaks in first wets the topsoil, and plants later pull that back out and it evaporates into the air. Any extra keeps sinking until it fills the gaps in soil and rock, becoming <strong>groundwater</strong>, which seeps slowly into rivers. The storm below lasts 2 hours. The top chart shows where its rain went as one bar; the bottom chart shows the river flow, with hours since the rain began across and, up the side, how many millimetres of water drain from the whole area into the river each hour.',
    rain: 'How hard it rains (per hour)',
    forest: 'Forest', grass: 'Grassland', farm: 'Farmland', city: 'City',
    c4a: 'Where this storm’s rain went (total {total} mm)', c4b: 'River flow / mm per hour   (across: hours)',
    s4lgRun: 'Surface runoff (reaches the river fast)', s4lgSoil: 'Kept in topsoil (later back to the air)', s4lgGround: 'Becomes groundwater (reaches the river slowly)',
    s4lgRain: 'Pale band: the 2 hours of rain',
    s4lgThick: 'In the flow chart each ground has its own colour; the thick line is the one selected', s3cloud: '10 µm cloud droplet', s3drop: 'this drop',
    s4readout: '{surf}, rain {I} mm/h × 2 h = {total} mm: surface runoff {run}, kept in topsoil {soil}, groundwater {gw}. River flow peaks at {peak} mm/h, {pt} h after the rain started; {river} mm reach the river within 48 h and {left} mm are still underground, draining slowly.',
    s4readout0: '{surf}, rain {I} mm/h × 2 h = {total} mm: all of it soaked in and stayed in the topsoil, so the river does not rise. Plants will later draw this water out and it will evaporate back into the air.',
    mm: '{v} mm',
    s4hint: 'What to try: keep the rain the same and press Forest, Grassland, Farmland and City in turn, then compare the peaks in the bottom chart: the city’s flow is high and sudden, the forest’s is low but goes on for much longer. Then make the rain heavier and watch even the forest start to shed runoff. The soaking rates and topsoil capacities are representative teaching values; real ground varies a lot, and this model ignores evaporation during the storm.',

    s5k: 'Step 5 · One drop’s journey',
    s5t: 'How long does a drop stay in the sea, in the sky, underground?',
    s5e: 'This step answers: on average, how long does a drop spend in each place? Think of each reservoir as a bathtub: a tap fills it and a drain empties it. When in and out are equal the amount in the tub stays the same, but the water inside keeps being swapped. The average time a drop spends in the tub is its <strong>residence time</strong>, which equals “water in the tub ÷ water flowing out per year”. The top picture shows five reservoirs and how much water moves between them each year (thousand cubic kilometres per year; thicker arrows carry more). Press “Release one drop” and the drop takes 10 random legs: how long it stays and where it goes next are drawn by lot, weighted by the real flows. In the bottom chart each grid line is ×10, from 1 day to 100,000 years; hollow rings are the residence times from the formula, and solid dots are the average stays of every simulated drop so far.',
    oneDrop: 'Release one drop, 10 legs', hundred: 'Release 100 drops at once', s5clear: 'Clear the tally',
    boxOcean: 'Ocean', boxAir: 'Air', boxLand: 'Land surface', boxGround: 'Groundwater', boxIce: 'Ice',
    c5a: 'Water moving between five reservoirs (thousand km³/yr)', c5b: 'Average time spent (each grid ×10)',
    s5lgFormula: 'Formula: water ÷ outflow per year', s5lgSim: 'Average stay of simulated drops', s5lgDrop: 'The drop on its way',
    s5journey: 'This drop’s journey: {legs}. Total {total}.',
    s5stats: '{n} drops simulated, {k} stays in all. Air: formula {air}, simulation {airSim} ({airN} stays). Every reservoir has inflow = outflow, so the amount in each one stays the same.',
    s5empty: 'No drops released yet. Press a button above to start.',
    s5progress: 'Travelling leg {k}/10…',
    year: '{v} yr', day: '{v} d',
    s5hint: 'What to try: release one drop and read its journey: it usually spends thousands of years in the sea, yet only days in the air. Then press “Release 100 drops at once” a few times and watch the solid dots settle onto the hollow rings: the average of many random trips is exactly “water ÷ outflow”. Notes: the land surface lumps lakes, rivers and soil water together; the ice flow of about 2.5 and the groundwater flow of about 13 thousand km³ a year are this page’s approximations.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Tell someone about one drop’s journey',
    s6fin: '<strong>Step 0</strong>: about 97% of Earth’s water is in the sea, and the vapour in the air is less than one part in a hundred thousand. <strong>Step 1</strong>: warmer, drier, windier weather evaporates water faster. <strong>Step 2</strong>: rising air cools, can hold less vapour, and the extra condenses into cloud. <strong>Step 3</strong>: cloud droplets are too small and fall too slowly; thousands or even a million of them must merge into one raindrop before it can fall out. <strong>Step 4</strong>: on the ground some rain rushes into rivers and some sinks in and travels slowly; city surfaces make rivers rise fast and high. <strong>Step 5</strong>: every reservoir gains exactly what it loses, so the totals never change, but the water keeps moving: the air’s water is replaced about every {airDays} days, the ocean’s only every {oceanYears} years or so.',
    quizPrompt: 'Quick check: on average, how long does it take to replace all the water vapour in the air?',
    quizA: 'About 10 days', quizB: 'About 1 year', quizC: 'About 3000 years',
    check: 'Check', correct: 'Right. The air holds only 12.7 thousand km³ but loses 486 thousand km³ a year, so 12.7 ÷ 486 years ≈ {d} days.', wrong: 'Think again: the air holds very little water, but a lot of rain and snow leaves it every year. Use step 5’s “water ÷ outflow per year”.',
    boundary: 'Scope: the numbers here are global averages and vary a lot from place to place and season to season. Steps 1–4 are simplified teaching models: evaporation ignores sunshine heating the water; pressure follows a fixed rule with height; fall speeds use a piecewise approximation; soaking uses representative values and ignores evaporation during the storm. The ice and groundwater flows in step 5 are this page’s approximations.',
    linksTitle: 'Where to go next',
    lk1: '→ States of matter, step 3: why the fastest particles leave the water first',
    lk2: '→ Pressure, step 3: why the air pressure is lower higher up',
    lk3: '→ Earth’s energy budget, step 0: why one Sun delivers different energy to different places',
    lk4: '→ Climate feedback, step 0: balancing the energy coming in and going out',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Water Cycle · One Drop’s Journey”.'
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
