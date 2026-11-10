'use strict';
// Photosynthesis (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '光合作用 · 用光开工的糖厂',
    back: '← 知识索引',
    compare: '对照另一版本：光合作用 · 用光开工的糖厂 →',
    navLabel: '光合作用步骤导航',
    tagline: '一盆水草放在台灯下，叶子上会冒出一串串小气泡。气泡是什么？叶子拿什么当原料、做出了什么？光越强就做得越快吗？七步里你会做一个经典的水草实验，亲手配平方程式，算出一块糖的重量有多少来自空气，再找出限制叶子开工速度的那块「短板」，最后给一株植物记一整天的账。',
    nav0: '0 冒气泡', nav1: '1 配平', nav2: '2 重量从哪来', nav3: '3 光越强越快？', nav4: '4 短板', nav5: '5 一天的账', nav6: '6 收束',

    s0k: '第 0 步 · 先做实验',
    s0t: '台灯下的水草为什么冒气泡？灯越近，冒得越多吗？',
    s0e: '这一步要回答：水草冒出的气泡是什么，冒泡快慢和光有什么关系？把一枝水草（比如金鱼藻）放进一杯水，用一盏台灯从侧面照。灯离得越近，照到叶子上的光越强：光强和距离的平方成反比，距离翻倍，光强只剩 1/4。下图左边是灯，右边是装着水草的烧杯，倒扣的试管收集冒上来的气体。<strong>每分钟冒出的气泡数</strong>，可以当作叶子「开工快慢」的一个指标。',
    c0a: '台灯照射水草的实验示意',
    lampDist: '灯离烧杯的距离',
    c0title: '灯距 {d} cm · 光强约为满日照的 {I}%',
    c0titleOff: '灯已关 · 光强 0%',
    lampOff: '关灯', lampOn: '开灯',
    splint: '用带火星的木条检验试管里的气体',
    s0readout: '灯距 {d} cm → 照到水草的光强约为满日照的 {I}%。水草每分钟冒出约 {b} 个气泡（示意换算：由下文的速率模型算出）。',
    s0dark: '灯关了：光强为 0，水草不冒气泡。',
    splintYes: '木条一伸进试管就重新燃起明火：收集到的气体是<strong>氧气</strong>。氧气能助燃，空气里的氧气不够浓，所以只有在接近纯氧的气体里，带火星的木条才会复燃。',
    splintNo: '现在几乎不冒泡，试管里没收集到气体，木条检验不出什么。先把灯移近、或打开灯，让它冒一会儿泡。',
    s0hint: '观察顺序：先只拖「灯离烧杯的距离」，从 100 cm 慢慢移到 20 cm，看气泡从没有到越来越密。注意灯近到约 28 cm 以内后，再靠近气泡也不再增加，这个现象第 3、4 步会解释。再按「关灯」，气泡停下。最后按木条检验，看试管里是什么气体。气泡数是模型算出的示意值，不是某次实验的实测数。',

    s1k: '第 1 步 · 原料和产物',
    s1t: '叶子拿什么做糖？原子能不能一个不多、一个不少地对上账？',
    s1e: '这一步要回答：上一步放出的是氧气；那它从哪来，叶子又做出了什么？光合作用的原料是空气里的<strong>二氧化碳</strong>（CO₂）和根吸上来的<strong>水</strong>（H₂O），产物是<strong>葡萄糖</strong>（C₆H₁₂O₆，一种糖）和<strong>氧气</strong>（O₂），反应要有光，并且在<strong>叶绿体</strong>（叶子细胞里的绿色小颗粒）里进行。化学反应只是把原子重新组合，原子不会凭空出现也不会消失，所以方程式两边每种原子的个数必须相等，这叫<strong>配平</strong>。拖动三个系数（分子个数，葡萄糖固定为 1 个），让下图每种原子左右两根柱子一样高。',
    c1a: '方程式两边各种原子的个数',
    c1title: '每种原子两根柱：左柱是原料一侧，右柱是产物一侧',
    lgC: '碳原子 C', lgH: '氢原子 H', lgO: '氧原子 O',
    coefA: 'CO₂ 的个数', coefB: 'H₂O 的个数', coefD: 'O₂ 的个数',
    solve: '直接配平', reset1: '回到 1、1、1',
    eqLight: '光，叶绿体',
    s1readout: '碳：左 {lc}、右 {rc}；氢：左 {lh}、右 {rh}；氧：左 {lo}、右 {ro}。{verdict}',
    s1ok: '三种原子都对上了：6 个 CO₂ 和 6 个 H₂O 变成 1 个葡萄糖和 6 个 O₂。',
    s1no: '还没平：{bad}。',
    s1sep: '、',
    elC: '碳', elH: '氢', elO: '氧',
    s1hint: '观察顺序：先只调「CO₂ 的个数」，让碳原子两边相等（葡萄糖里有 6 个碳）；再调「H₂O 的个数」，让氢相等；最后调「O₂ 的个数」，让氧相等。每根柱子由一个个小圆点组成，一个点就是一个原子。顺序换了也能配平，但这样每次只需要盯一种原子。',

    s2k: '第 2 步 · 重量从哪来',
    s2t: '一块糖的重量，有多少来自空气？',
    s2e: '这一步要回答：植物长出来的重量，原料是土、是水，还是空气？17 世纪，比利时人范·海尔蒙特把一株约 2.3 kg 的柳树苗种进一桶称过重的土里，只浇水，5 年后柳树长到约 76.7 kg，土却只少了约 57 g，所以重量不是从土里来的。他当时认为是水；现在可以用上一步配平的方程式来算。原子有各自的质量：碳 12、氢 1、氧 16（单位相同，只比轻重）。葡萄糖里的碳和氧都来自 CO₂，只有氢来自水。先押一个答案，再拖下面的滑杆看账本。',
    q2: '先押：一块葡萄糖的重量里，大约多少来自空气中的 CO₂？',
    q2a: '约 7%', q2b: '约 50%', q2c: '约 93%',
    check: '检查',
    fb2right: '对。180 g 葡萄糖里，碳 72 g、氧 96 g 都来自 CO₂，共 168 g，占 {share}%；只有 12 g 氢来自水。',
    fb2wrong: '不对。拖下面的滑杆看账本：葡萄糖里只有氢来自水，碳和氧都来自 CO₂。',
    fb2none: '先选一个答案。',
    c2a: '原料与产物的质量账',
    c2in: '原料', c2out: '产物', c2unit: '克',
    lgCO2: '二氧化碳', lgH2O: '水', lgO2: '放出的氧气', lgSugarC: '糖里来自 CO₂ 的部分', lgSugarW: '糖里来自水的部分',
    sugarMass: '做出的葡萄糖（克）',
    s2readout: '做 {m} g 葡萄糖：用掉 {co2} g CO₂ 和 {w} g 水，放出 {o2} g 氧气。两边都是 {tot} g，质量守恒。糖里 {fc} g（{share}%）来自 CO₂，{fw} g 来自水。',
    s2hint: '观察顺序：拖「做出的葡萄糖」滑杆，看左右两根柱子总是一样高（质量守恒）；再看产物那根柱子里糖的两种颜色：来自 CO₂ 的部分始终占约 93%，不随做多做少而变。所以柳树干燥后的重量，绝大部分是从空气里「吃」进来的碳和氧。范·海尔蒙特的柳树增重里也有很多是水分，这里算的是糖本身的组成。',

    s3k: '第 3 步 · 光强',
    s3t: '光越强，叶子就造糖越快吗？会一直快下去吗？',
    s3e: '这一步要回答：光强和造糖速度到底是什么关系？用一个简化模型：在空气里的 CO₂ 浓度（约 420 ppm，ppm 表示每一百万份空气里有几份）下，造糖速率（<strong>总光合速率</strong>）先随光强成正比上升，等到 CO₂ 供应跟不上时就不再变快，这叫<strong>光饱和</strong>。另外，叶子细胞一直在做<strong>呼吸作用</strong>：用掉一部分糖来获取能量，白天黑夜都在进行。真正能攒下来的是<strong>净光合速率</strong> = 总光合速率 − 呼吸消耗。速率用示意单位，只比大小。',
    c3a: '光强与光合速率的关系曲线',
    c3title: '速率（示意单位）随光强变化 · CO₂ 420 ppm', c3x: '光强（满日照的 %）',
    lgGross: '总光合速率', lgResp: '呼吸消耗', lgNet: '净光合速率', lgTried: '你试过的光强',
    lightPct: '光强（满日照的 %）',
    sweep3: '从 0 扫到 100%', clearTried: '清掉试过的点',
    s3readout: '光强 {I}%：总光合速率 {g}，呼吸 {r}，净光合 {n}。{state}气泡约每分钟 {b} 个。',
    st_dark: '净值为负：造的糖不够呼吸用，叶子在「亏本」，不冒氧气泡。',
    st_comp: '刚好持平：造糖等于呼吸消耗（这个光强叫光补偿点，本模型里是 {Ic}%）。',
    st_rise: '光是最缺的：再加光，速率还会涨。',
    st_sat: '已经光饱和：从 {Is}% 起，再加光速率也不涨了，此时最缺的是 CO₂。',
    s3hint: '观察顺序：按「从 0 扫到 100%」，看三件事：一开始绿色的净光合在零线以下（亏本）；光强超过约 8% 后净值转正，开始冒泡；到 50% 时青色曲线拐平，之后再亮也不变。拖滑杆时你试过的光强会留下白点。第 0 步里灯近到约 28 cm 以内气泡不再增加，就是因为光强已经过了这个 50% 的拐点。真实叶片的曲线拐角是圆滑的，这里画成折线是简化。',

    s4k: '第 4 步 · 短板',
    s4t: '到底是光不够，还是 CO₂ 不够？补哪一样才有用？',
    s4e: '这一步要回答：上一步光饱和后，为什么再加光也没用？可以把速率想成一只木桶能装多少水：桶壁有两块板，一块的高度由光决定，一块由 CO₂ 决定，水只能装到较矮的那块板为止。这叫<strong>限制因素</strong>：几个条件里最缺的那个说了算（这是英国植物学家布莱克曼 1905 年提出的简化规则）。标题为「两块板」的图画出这两块板和水位；另一张图画出不同 CO₂ 浓度下速率随光强的曲线。',
    c4a: '不同 CO₂ 浓度下速率随光强的曲线', c4b: '光和 CO₂ 两块板的高度与水位',
    c4title: '总光合速率 · 三条细线：CO₂ 200 / 420 / 1000 ppm', c4btitle: '两块板（示意单位）',
    lgLightPlank: '光那块板', lgCO2Plank: 'CO₂ 那块板', lgWater: '实际速率（水位）', lgOther: '其他 CO₂ 浓度的曲线',
    co2ppm: 'CO₂ 浓度（ppm）',
    s4readout: '光那块板 {L}，CO₂ 那块板 {K} → 实际速率 {g}。{who}再加 10% 光，速率 +{dl}；再加 100 ppm CO₂，速率 +{dc}。',
    who_light: '最缺的是光。', who_co2: '最缺的是 CO₂。', who_both: '两块板一样高，两样都缺。',
    s4hint: '观察顺序：保持光强 80%，把 CO₂ 从 420 ppm 拖到 1000 ppm：CO₂ 那块板升高，水位跟着升，直到超过光那块板，之后再加 CO₂ 就不涨了，最缺的变成了光。再把光强降到 30%，这时加 CO₂ 完全没用。读数里「再加一点会多多少」直接告诉你补哪样有效。温室给作物补 CO₂（常补到 800–1000 ppm）就是在抬 CO₂ 那块板，但只在光足够时才有用。',

    s5k: '第 5 步 · 一天的账',
    s5t: '一整天下来，植物是赚了糖还是亏了糖？',
    s5e: '这一步要回答：白天造糖、全天呼吸，一天下来的<strong>净收入</strong>是多少？下图上半部分是一天里的光强（晴天 6 点日出、12 点最强、18 点日落），下半部分把每个时刻的净光合速率累加起来，画成<strong>累计净收入</strong>：往上走是在攒糖，往下走是在消耗。数值都用前面的同一个模型算，单位是「示意单位 × 小时」。按「播放这一天」，再换天气或 CO₂ 浓度对比。',
    c5a: '一天之中的光强和累计净收入',
    c5top: '光强（满日照的 %）', c5bot: '累计净收入（示意单位·小时）', c5x: '时刻（时）',
    weather: '天气', sunny: '晴天', cloudy: '阴天（光强只有晴天的 30%）',
    air: '空气中的 CO₂', air420: '约 420 ppm（户外）', air1000: '1000 ppm（温室补气）',
    play5: '播放这一天', clearRuns: '清掉对比曲线',
    runLabel: '{sky} · {co2} ppm：净收入 {net}',
    skySun: '晴天', skyCloud: '阴天',
    s5progress: '已播放到 {h} 时。',
    s5readout: '{prog}全天造糖 {made}，呼吸用掉 {used}，净收入 {net}。净光合为正的时间约 {pos} 小时；夜里没有光，账本一直往下走。',
    s5hint: '观察顺序：先用晴天 + 420 ppm 播放一遍，看下半部分的曲线：夜里缓慢下滑，日出后不到半小时就开始回升，傍晚之后又下滑。再换阴天播放：曲线几乎走平，一天只剩一点点盈余。最后试「阴天 + 1000 ppm」：结果和阴天 + 420 ppm 完全一样，因为阴天里最缺的是光，补 CO₂ 没用。每次播放的结果会留在图上并列在下面，方便对比。',

    s6k: '第 6 步 · 收束',
    s6t: '把七步连成一句话',
    s6fin: '水草在光下冒出的气泡是<strong>氧气</strong>（第 0 步）。叶子在叶绿体里用光把 6 个 CO₂ 和 6 个 H₂O 重新组合成 1 个葡萄糖和 6 个 O₂，原子一个不多一个不少（第 1 步）；糖的重量约 93% 来自空气里的 CO₂（第 2 步）。造糖速率先随光强上升，到光饱和后被 CO₂ 卡住（第 3 步）；几个条件里最缺的那个说了算，补别的没用（第 4 步）。叶子全天都在呼吸，白天攒下的糖要大于夜里的消耗，植物才长得起来（第 5 步）。',
    formula: '6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂（需要光，在叶绿体中）',
    boundary: '模型边界：速率模型是「取较小者」的简化规则，参数是示意值；真实叶片的曲线拐角圆滑，还受温度、叶龄、气孔开合等影响，光太强反而会伤叶（光抑制），本页都没有展开。呼吸设为恒定，气泡数按净速率换算，都是示意。严格地说，放出的氧气全部来自水（用氧的同位素做标记证实过），完整写法是 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O，两边各多 6 个水，原子账照样平；第 2 步「糖的重量来自哪」不受影响。',
    linksTitle: '接着看',
    lk1: '→ 细胞 · 第 2 步：叶绿体在细胞里的什么位置',
    lk2: '→ 质量守恒 · 第 1 步：数原子，反应前后一个不少',
    lk3: '→ 能量金字塔 · 第 0 步：植物攒下的糖怎样喂饱整条食物链',
    lk4: '→ 碳循环 · 第 0 步：大气、植物和海洋之间的碳库与流量',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《光合作用 · 用光开工的糖厂》的平行版本。'
  },
  en: {
    pageTitle: 'Photosynthesis · A Sugar Factory Run by Light',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Photosynthesis · A Sugar Factory Run by Light →',
    navLabel: 'Photosynthesis lesson steps',
    tagline: 'Put a sprig of pondweed under a desk lamp and strings of tiny bubbles rise from its leaves. What is in them? What does a leaf use as raw material, and what does it make? Does more light always mean faster work? In seven steps you will run a classic pondweed experiment, balance the equation yourself, work out how much of a lump of sugar\'s weight comes out of thin air, find the "short plank" that limits how fast the leaf can work, and keep a plant\'s accounts for a whole day.',
    nav0: '0 Bubbles', nav1: '1 Balance', nav2: '2 Where the mass comes from', nav3: '3 More light?', nav4: '4 Short plank', nav5: '5 A day\'s accounts', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Start with an experiment',
    s0t: 'Why does pondweed under a lamp give off bubbles? Does a closer lamp mean more bubbles?',
    s0e: 'The question here: what are the bubbles, and how does their rate depend on light? Put a sprig of pondweed (hornwort, say) in a beaker of water and light it from the side with a desk lamp. The closer the lamp, the stronger the light on the leaves: light intensity falls with the square of distance, so doubling the distance leaves only a quarter of the light. In the picture below the lamp is on the left and the beaker of pondweed on the right; an upside-down test tube collects the gas that rises. <strong>Bubbles per minute</strong> serves as a gauge of how fast the leaves are working.',
    c0a: 'Schematic of a lamp shining on pondweed',
    lampDist: 'Lamp distance from the beaker',
    c0title: 'Lamp {d} cm away · light about {I}% of full sun',
    c0titleOff: 'Lamp off · light 0%',
    lampOff: 'Switch the lamp off', lampOn: 'Switch the lamp on',
    splint: 'Test the gas with a glowing splint',
    s0readout: 'Lamp at {d} cm → the pondweed gets about {I}% of full sunlight. It gives off about {b} bubbles a minute (illustrative conversion, computed from the rate model introduced later).',
    s0dark: 'Lamp off: light is 0 and the pondweed gives off no bubbles.',
    splintYes: 'The moment the splint goes into the tube it bursts back into flame: the gas is <strong>oxygen</strong>. Oxygen feeds burning; ordinary air is not rich enough in it, so only a nearly pure oxygen sample relights a glowing splint.',
    splintNo: 'There are hardly any bubbles right now, so the tube holds no gas worth testing. Move the lamp closer or switch it on, and let the weed bubble for a while first.',
    s0hint: 'What to try: drag only the lamp distance, slowly from 100 cm to 20 cm, and watch the bubbles go from none to dense. Notice that once the lamp is inside about 28 cm, moving it closer adds no more bubbles; steps 3 and 4 explain why. Then switch the lamp off and the bubbles stop. Finally test the gas with the splint. Bubble counts are illustrative values from the model, not measurements from one real experiment.',

    s1k: 'Step 1 · Inputs and outputs',
    s1t: 'What does a leaf make sugar from, and do the atoms add up exactly?',
    s1e: 'The question here: the last step released oxygen, so where does it come from, and what does the leaf make? Photosynthesis takes <strong>carbon dioxide</strong> (CO₂) from the air and <strong>water</strong> (H₂O) drawn up by the roots, and produces <strong>glucose</strong> (C₆H₁₂O₆, a sugar) and <strong>oxygen</strong> (O₂). It needs light and happens inside <strong>chloroplasts</strong>, the small green grains in leaf cells. A chemical reaction only regroups atoms; it never creates or destroys them, so each kind of atom must appear the same number of times on both sides of the equation. Making that true is called <strong>balancing</strong>. Drag the three coefficients (numbers of molecules; glucose is fixed at one) until each element\'s two bars in the chart below are the same height.',
    c1a: 'Atom counts on each side of the equation',
    c1title: 'Two bars per element: left bar = inputs side, right bar = products side',
    lgC: 'carbon atom C', lgH: 'hydrogen atom H', lgO: 'oxygen atom O',
    coefA: 'Number of CO₂', coefB: 'Number of H₂O', coefD: 'Number of O₂',
    solve: 'Balance it for me', reset1: 'Back to 1, 1, 1',
    eqLight: 'light, chloroplast',
    s1readout: 'Carbon: {lc} left, {rc} right; hydrogen: {lh} left, {rh} right; oxygen: {lo} left, {ro} right. {verdict}',
    s1ok: 'All three elements match: 6 CO₂ and 6 H₂O become 1 glucose and 6 O₂.',
    s1no: 'Not balanced yet: {bad}.',
    s1sep: ', ',
    elC: 'carbon', elH: 'hydrogen', elO: 'oxygen',
    s1hint: 'What to try: first adjust only the number of CO₂ until carbon matches (glucose holds 6 carbons); then the number of H₂O until hydrogen matches; finally the number of O₂ until oxygen matches. Each bar is a stack of dots, one dot per atom. Any order works in the end, but this one lets you watch a single element at a time.',

    s2k: 'Step 2 · Where the mass comes from',
    s2t: 'How much of a lump of sugar\'s weight comes from the air?',
    s2e: 'The question here: is the weight a plant puts on made from soil, water or air? In the 1600s the Flemish scientist Jan Baptist van Helmont planted a willow sapling of about 2.3 kg in a tub of weighed soil and gave it nothing but water. Five years later the willow weighed about 76.7 kg, while the soil had lost only about 57 g, so the weight did not come from the soil. He concluded it came from water; we can now check with the equation you just balanced. Each atom has its own mass: carbon 12, hydrogen 1, oxygen 16 (all in the same unit, for comparison). The carbon and oxygen in glucose both come from CO₂; only the hydrogen comes from water. Place a bet, then drag the slider below to see the ledger.',
    q2: 'Your bet: about how much of a glucose molecule\'s weight comes from CO₂ in the air?',
    q2a: 'about 7%', q2b: 'about 50%', q2c: 'about 93%',
    check: 'Check',
    fb2right: 'Right. In 180 g of glucose, 72 g of carbon and 96 g of oxygen come from CO₂, 168 g in all, or {share}%; only 12 g of hydrogen comes from water.',
    fb2wrong: 'Not quite. Drag the slider below and read the ledger: only glucose\'s hydrogen comes from water; its carbon and oxygen come from CO₂.',
    fb2none: 'Choose an answer first.',
    c2a: 'Mass ledger of inputs and products',
    c2in: 'inputs', c2out: 'products', c2unit: 'grams',
    lgCO2: 'carbon dioxide', lgH2O: 'water', lgO2: 'oxygen released', lgSugarC: 'sugar mass from CO₂', lgSugarW: 'sugar mass from water',
    sugarMass: 'Glucose made (grams)',
    s2readout: 'Making {m} g of glucose uses {co2} g of CO₂ and {w} g of water and releases {o2} g of oxygen. Both sides total {tot} g: mass is conserved. Of the sugar, {fc} g ({share}%) comes from CO₂ and {fw} g from water.',
    s2hint: 'What to try: drag the glucose slider and watch the two columns stay exactly equal (mass is conserved). Then look at the two colours inside the sugar part of the products column: the share from CO₂ stays at about 93% however much sugar is made. So most of a willow\'s dry weight is carbon and oxygen taken in from the air. Much of van Helmont\'s weight gain was also water held in the tree; this ledger is about the make-up of the sugar itself.',

    s3k: 'Step 3 · Light',
    s3t: 'Does stronger light always mean faster sugar-making, and does it keep speeding up?',
    s3e: 'The question here: how exactly does sugar-making speed depend on light? We use a simplified model. At the CO₂ level of ordinary air (about 420 ppm, meaning 420 parts in every million parts of air), the sugar-making rate (the <strong>gross photosynthesis rate</strong>) first rises in proportion to light, then stops rising once the CO₂ supply cannot keep up; this is called <strong>light saturation</strong>. Meanwhile the leaf cells are always carrying out <strong>respiration</strong>: they burn part of their sugar for energy, day and night. What the leaf actually banks is the <strong>net photosynthesis rate</strong> = gross rate − respiration. Rates are in illustrative units, for comparison only.',
    c3a: 'Photosynthesis rate against light intensity',
    c3title: 'Rate (illustrative units) vs light · CO₂ 420 ppm', c3x: 'light (% of full sun)',
    lgGross: 'gross photosynthesis', lgResp: 'respiration', lgNet: 'net photosynthesis', lgTried: 'light levels you tried',
    lightPct: 'Light (% of full sun)',
    sweep3: 'Sweep from 0 to 100%', clearTried: 'Clear the tried points',
    s3readout: 'Light {I}%: gross rate {g}, respiration {r}, net {n}. {state} About {b} bubbles a minute.',
    st_dark: 'Net is negative: the leaf makes less sugar than it burns, so it is running at a loss and releases no oxygen bubbles.',
    st_comp: 'Break-even: sugar made equals sugar burned (this light level is the compensation point, {Ic}% in this model).',
    st_rise: 'Light is the scarcest input: more light still raises the rate.',
    st_sat: 'Light-saturated: from {Is}% upward, extra light no longer raises the rate; the scarcest input is now CO₂.',
    s3hint: 'What to try: press "Sweep from 0 to 100%" and watch three things. At first the green net line sits below zero (a loss). Above about 8% light the net turns positive and bubbles start. At 50% the cyan line levels off and stays flat however bright it gets. Dragging the slider leaves a white dot at each light level you try. The way bubbles stopped increasing once the lamp in step 0 came within about 28 cm is this same bend at 50% light. Real leaves round off the corner; drawing it sharp is a simplification.',

    s4k: 'Step 4 · The short plank',
    s4t: 'Is it light or CO₂ that is short? Which one is worth adding?',
    s4e: 'The question here: after light saturation in the last step, why does extra light do nothing? Picture the rate as how much water a barrel can hold. The barrel has two planks, one whose height is set by light and one set by CO₂, and the water can only rise to the top of the shorter plank. This is the idea of a <strong>limiting factor</strong>: of several conditions, the scarcest one decides (a simplifying rule proposed by the British plant physiologist F. F. Blackman in 1905). The chart titled "Two planks" shows both planks and the water level; the other chart shows rate against light for several CO₂ levels.',
    c4a: 'Rate against light for several CO₂ levels', c4b: 'Heights of the light and CO₂ planks with the water level',
    c4title: 'Gross rate · thin lines: CO₂ 200 / 420 / 1000 ppm', c4btitle: 'Two planks (illustrative units)',
    lgLightPlank: 'light plank', lgCO2Plank: 'CO₂ plank', lgWater: 'actual rate (water level)', lgOther: 'curves for other CO₂ levels',
    co2ppm: 'CO₂ concentration (ppm)',
    s4readout: 'Light plank {L}, CO₂ plank {K} → actual rate {g}. {who} 10% more light adds +{dl}; 100 ppm more CO₂ adds +{dc}.',
    who_light: 'Light is the scarcest input.', who_co2: 'CO₂ is the scarcest input.', who_both: 'The planks are level; both are equally short.',
    s4hint: 'What to try: keep light at 80% and drag CO₂ from 420 to 1000 ppm. The CO₂ plank rises and the water rises with it, until it passes the light plank; after that more CO₂ adds nothing and light becomes the scarce input. Now lower light to 30%: adding CO₂ does nothing at all. The "adds +…" figures in the readout tell you directly which input is worth adding. Greenhouses that pump in CO₂ (often to 800–1000 ppm) are raising the CO₂ plank, and it only pays when there is enough light.',

    s5k: 'Step 5 · A day\'s accounts',
    s5t: 'Over a whole day, does a plant come out ahead on sugar or behind?',
    s5e: 'The question here: sugar is made in daylight and burned around the clock, so what is the day\'s <strong>net income</strong>? The upper part of the chart below shows light across a day (on a sunny day, sunrise at 6, brightest at 12, sunset at 18). The lower part adds up the net rate moment by moment into a <strong>running net income</strong>: rising means saving sugar, falling means spending it. Everything is computed with the same model as before, in "illustrative units × hours". Press "Play the day", then change the weather or the CO₂ level and compare.',
    c5a: 'Light and running net income over one day',
    c5top: 'light (% of full sun)', c5bot: 'running net income (illustrative units·h)', c5x: 'time of day (h)',
    weather: 'Weather', sunny: 'sunny', cloudy: 'overcast (light only 30% of a sunny day)',
    air: 'CO₂ in the air', air420: 'about 420 ppm (outdoors)', air1000: '1000 ppm (greenhouse enrichment)',
    play5: 'Play the day', clearRuns: 'Clear comparison curves',
    runLabel: '{sky} · {co2} ppm: net income {net}',
    skySun: 'Sunny', skyCloud: 'Overcast',
    s5progress: 'Played up to {h}:00. ',
    s5readout: '{prog}Sugar made over the day {made}, burned by respiration {used}, net income {net}. Net photosynthesis is positive for about {pos} hours; at night there is no light and the account keeps sliding down.',
    s5hint: 'What to try: play a sunny day at 420 ppm first and watch the lower curve: it slides slowly overnight, turns upward less than half an hour after sunrise, and slides again after dusk. Then play an overcast day: the curve barely gets off the floor and the day ends with only a small surplus. Finally try "overcast + 1000 ppm": exactly the same as overcast at 420 ppm, because on an overcast day light is the scarce input and extra CO₂ does nothing. Each run stays on the chart and is listed below for comparison.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'The seven steps in one paragraph',
    s6fin: 'The bubbles pondweed gives off in light are <strong>oxygen</strong> (step 0). Inside its chloroplasts a leaf uses light to regroup 6 CO₂ and 6 H₂O into 1 glucose and 6 O₂, with every atom accounted for (step 1); about 93% of the sugar\'s weight comes from CO₂ in the air (step 2). The sugar-making rate rises with light until light saturation, where CO₂ holds it back (step 3); the scarcest condition decides, and adding anything else is wasted (step 4). Leaves respire all day and night, so a plant only grows when the sugar banked in daylight outweighs what is burned overnight (step 5).',
    formula: '6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ (needs light, in chloroplasts)',
    boundary: 'Model limits: the rate model is a "take the smaller" simplification with illustrative parameters. Real leaves round off the corner, and temperature, leaf age and the opening of leaf pores all matter; very strong light can even damage leaves (photoinhibition). None of this is covered here. Respiration is held constant and bubble counts are converted from the net rate, both for illustration. Strictly, all the oxygen released comes from water (shown with oxygen-isotope labelling), and the full equation is 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O: six extra waters on each side, and the atoms still balance. The step 2 result about where the sugar\'s weight comes from is unaffected.',
    linksTitle: 'Where to go next',
    lk1: '→ The Cell, step 2: where chloroplasts sit inside a cell',
    lk2: '→ Conservation of mass, step 1: count the atoms, none lost in a reaction',
    lk3: '→ The energy pyramid, step 0: how the sugar plants bank feeds a whole food chain',
    lk4: '→ The carbon cycle, step 0: carbon stocks and flows between air, plants and ocean',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Photosynthesis · A Sugar Factory Run by Light".'
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
  if (typeof window.refreshPhoto === 'function') window.refreshPhoto();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PHOTO_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
