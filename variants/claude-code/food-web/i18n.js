'use strict';
// Food-web lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '食物网 · 一个池塘里谁靠谁活',
    back: '← 知识索引',
    compare: '对照另一版本：食物网 →',
    navLabel: '食物网步骤导航',
    tagline: '一个小池塘里住着 9 种生物：两种植物、七种动物。只要知道「谁吃谁」，就能画出一张网。这一页用这张网回答五个问题：箭头怎么读、谁排在第几级、为什么越往上能量越少、为什么毒物反而越往上越浓、少了一种生物别处会怎样。',
    nav0: '0 读箭头', nav1: '1 营养级', nav2: '2 能量', nav3: '3 毒物', nav4: '4 捕光一种鱼', nav5: '5 网与链', nav6: '6 收束',

    sp_algae: '浮游藻类', sp_weed: '水草', sp_zoo: '浮游动物', sp_snail: '螺', sp_larva: '蜻蜓幼虫', sp_fish: '小鱼', sp_frog: '青蛙', sp_pike: '黑鱼', sp_heron: '苍鹭',
    ss_algae: '藻类', ss_weed: '水草', ss_zoo: '浮游动物', ss_snail: '螺', ss_larva: '幼虫', ss_fish: '小鱼', ss_frog: '青蛙', ss_pike: '黑鱼', ss_heron: '苍鹭',
    listSep: '、', arrow: ' → ', none: '没有',

    s0k: '第 0 步 · 读懂这张图',
    s0t: '一支箭头指向哪边？这张网里藏着几条食物链？',
    s0e: '这一步要回答：怎样从图上读出「谁吃谁」，以及一张网里一共有多少条食物链。图里每个圆角框是一种生物。最底下的浮游藻类和水草是<strong>生产者</strong>：它们靠阳光自己造养料（<a class="xlink" href="../../../biology/cells/photosynthesis/#step1">→ 光合作用页第 1 步：造养料时原子怎样记账</a>）。其余七种都是<strong>消费者</strong>：要靠吃别的生物获得能量和养料。<strong>箭头从被吃的指向吃它的</strong>，也就是能量流动的方向；所以「浮游藻类 → 浮游动物」读作「浮游动物吃浮游藻类」。从一种生产者出发，顺着箭头一直走到再没有谁吃的那一种，走过的路就是一条<strong>食物链</strong>；许多条食物链交织在一起，就是<strong>食物网</strong>。',
    s0lgProd: '生产者（自己造养料）', s0lgCons: '消费者（靠吃别的生物）', s0lgFood: '青色箭头：选中者吃的', s0lgEater: '橙色箭头：吃选中者的', s0lgChain: '绿色：正在走的那条食物链',
    pickSpecies: '选一种生物（也可以直接点图上的框）：',
    walkChains: '逐条走一遍食物链', stopWalk: '停止',
    s0readout: '{name}：吃 {foods}；被 {eaters} 吃。它出现在全网 {total} 条食物链中的 {n} 条里。',
    s0readoutProd: '{name}是生产者，不吃别的生物；被 {eaters} 吃。它出现在全网 {total} 条食物链中的 {n} 条里（每条都从它起步）。',
    s0walk: '第 {i}/{total} 条食物链：{chain}（共 {len} 种生物）。',
    s0walkIdle: '全网一共 {total} 条食物链。按「逐条走一遍」，每条会依次变绿，走过的箭头保留浅绿色。',
    s0walkDone: '走完了：{total} 条食物链覆盖了全部 {edges} 支箭头。最短的一条有 {minLen} 种生物，最长的有 {maxLen} 种。',
    s0hint: '观察顺序：先点「浮游藻类」，数一数从它出发的青色和橙色箭头；再点「苍鹭」，它只有青色箭头，没有橙色箭头，说明在这个池塘里没有谁吃它。最后按「逐条走一遍」，看 {total} 条链怎样合起来铺满整张网。',

    s1k: '第 1 步 · 排第几级',
    s1t: '一种动物在食物链里排第几？能不能同时排好几个位置？',
    s1e: '这一步要回答：一种生物在食物网里处在哪一「层」。在一条食物链里，生产者算第 1 级，吃生产者的算第 2 级，再往上依次加一，这个位置叫<strong>营养级</strong>。只吃一种东西的动物，位置很好定；但苍鹭既吃小鱼，又吃吃小鱼的黑鱼，它在不同的链里就落在不同的级上。下图把经过所选生物的每条食物链各画成一行，同一级对齐在同一列，所选生物用橙色框标出。',
    s1colHead: '第 {k} 级',
    s1readout: '{name}出现在 {n} 条食物链里，营养级是 {levels}。它直接吃的是：{foods}。',
    s1readoutOne: '{name}出现在 {n} 条食物链里，每一条里都排在第 {levels} 级。',
    s1readoutMany: '（吃的东西本身就处在不同层级，所以它不只一个营养级；课本里有时取平均值，但各条链上的位置都是真实存在的。）',
    s1hint: '观察顺序：先选「浮游动物」，橙色框始终落在第 2 列；再选「青蛙」和「苍鹭」，橙色框分散到好几列。比较它们直接吃的东西，就能说出位置为什么会分散。',

    s2k: '第 2 步 · 能量往上走',
    s2t: '为什么吃得越「高」，能量越少？',
    s2e: '这一步要回答：沿着最长的那条食物链（浮游藻类 → 浮游动物 → 蜻蜓幼虫 → 小鱼 → 黑鱼 → 苍鹭），能量每往上一级还剩多少。设藻类每年在每平方米水面固定 10 000 kJ（教学用数字）。上一级吃下去的能量里，只有一部分变成自己的身体、能再被下一级吃到；这个比例叫<strong>能量传递效率</strong>，常说约 10%，实际多在 5%–20% 之间。其余的大部分在<strong>呼吸作用</strong>（细胞「烧」养料来维持生命）里变成热散失，另有一些是没被吃掉的部分、粪便和尸体，交给<strong>分解者</strong>（细菌、真菌）。下图柱高是每一级得到的能量，虚线框是它下面那一级的能量：两者之差就是这一步传递中丢掉的部分（<a class="xlink" href="../../../biology/ecology/energy-pyramid/#step1">→ 能量金字塔页第 1 步：丢掉的能量去了哪里</a>）。',
    effSlider: '能量传递效率', scaleLin: '普通刻度', scaleLog: '每格 ×10 刻度',
    s2lgBar: '柱：这一级得到的能量（kJ / m² / 年）', s2lgGhost: '虚线框：下一级（供给它的那一级）的能量', s2lgLost: '两者之差 = 这一次传递散失的能量',
    c2title: '每一级得到的能量（kJ / m² / 年）', c2titleLog: '每一级得到的能量（kJ / m² / 年，每格 ×10）',
    lvl: '第 {k} 级',
    s2readout: '效率 {eff}%：每往上一级只剩上一级的 {eff}%，丢掉 {lost}%。传到第 {top} 级（苍鹭）只剩 {eTop} kJ，是藻类固定能量的 {pct}%。换句话说，苍鹭每得到 1 kJ 能量，背后要有 {need} kJ 被藻类固定下来。',
    s2hint: '观察顺序：先用「普通刻度」把效率从 5% 拖到 20%，看第 4 级以上的柱子几乎贴在地上；再切到「每格 ×10 刻度」，每一级都正好比前一级低同样多的格数，这就是「每级乘同一个效率」。',

    s3k: '第 3 步 · 毒物往上走',
    s3t: '池水里一点点难分解的毒物，为什么在苍鹭体内最浓？',
    s3e: '这一步要回答：一种难分解、又难排出体外的毒物（比如过去用过的农药 DDT）进入池塘后，沿食物链会怎样变化。这里的<strong>浓度</strong>指每千克身体里含多少毫克毒物（mg/kg）。关键在于上一步的效率：一只动物要长 1 kg 肉，得吃下大约「1 ÷ 效率」kg 食物，效率 10% 就是 10 kg。能量在吃的过程中大多被烧掉了，毒物却烧不掉；如果它留住吃进去毒物的比例是 <em>留存率</em>，那么每上一级浓度就乘上「留存率 ÷ 效率」。这种越往上越浓的现象叫<strong>生物富集</strong>。柱高用每格 ×10 的刻度，否则低层的柱子根本看不见。',
    keepSlider: '毒物留存率（吃进去的毒物有多少留在体内）', effSlider3: '能量传递效率',
    s3lgBar: '柱：每种生物体内的毒物浓度（mg/kg）', s3lgOver: '红柱：超过警戒线', s3lgLine: '红虚线：示意警戒线 1 mg/kg',
    c3title: '体内毒物浓度（mg/kg，每格 ×10）',
    s3readout: '每上一级，浓度乘以 留存率 ÷ 效率 = {keep}% ÷ {eff}% = {f} 倍。藻类体内是 {c1} mg/kg，苍鹭体内是 {cTop} mg/kg，是藻类的 {ratio} 倍。{over}',
    s3over: '超过示意警戒线的有：{list}。',
    s3overNone: '没有一种生物超过示意警戒线。',
    s3down: '留存率比效率还低，浓度反而越往上越稀：这类物质能被分解或排出，不会富集。',
    s3hint: '观察顺序：保持效率 10%，把留存率从 100% 往下拖：留存率降到 10% 时五根柱子一样高；再往下，柱子反而逐级变矮。然后把留存率拉回 90%，再拖效率：效率越低，每一级为了长肉吃得越多，毒物攒得越快。',

    s4k: '第 4 步 · 捕光一种鱼',
    s4t: '把池塘里的黑鱼全捕光，池水为什么会变绿？',
    s4e: '这一步要回答：拿走一种生物后，它下面隔着好几级的生物会不会也跟着变。只看网里的一条主链：浮游藻类 → 浮游动物 → 小鱼 → 黑鱼。我们用一组简化的数学式子模拟它们数量随时间的变化（每种生物：吃到的越多增长越快，被吃得越多减少越快；藻类自己长得再好也有上限）。每条曲线都换算成「原来数量的百分之几」，所以开始时四条线都在 100%。时刻 20 开始持续捕捞某一种，让它的数量一直是 0。被捕光的那一种，影响会隔一级反向传下去：这种一级接一级的连锁变化叫<strong>营养级联</strong>（两种生物之间来回起伏的捕食关系，<a class="xlink" href="../../../biology/ecology/population-ecology/#step2">→ 种群生态页第 2 步：捕食者为什么让猎物曲线起伏</a>）。',
    cutNone: '不捕捞', cutPike: '捕光黑鱼', cutFish: '捕光小鱼', cutZoo: '捕光浮游动物', replay: '重放',
    s4lgCut: '竖虚线：从这一刻开始捕捞', s4lgWater: '底部色带：池水颜色（藻类越多越绿）',
    c4title: '数量（原来的百分之几）', c4x: '时间（模型单位）',
    s4progress: '时间 {t}/{T}。',
    s4readout: '{scene}：{rows}。',
    s4row: '{name} {pct}%（{dir}）',
    up: '变多', down: '变少', same: '不变', gone: '消失',
    s4sceneNone: '不捕捞', s4scenePike: '捕光黑鱼后最终', s4sceneFish: '捕光小鱼后最终', s4sceneZoo: '捕光浮游动物后最终',
    s4tailNone: '四种生物停在原来的数量上，彼此吃与被吃正好平衡。',
    s4tail: '藻类变成原来的 {algae}%，池水颜色{water}。',
    waterGreener: '明显变绿', waterClearer: '变清', waterSame: '基本不变',
    s4hint: '观察顺序：先按「捕光黑鱼」，看橙色的小鱼先冲高、青色的浮游动物随后跌下、绿色的藻类再涨起来，底部色带随之变绿：「隔一级反向」。再按「捕光小鱼」比较：这次浮游动物变多、藻类变少，黑鱼因为没有食物而消失。',

    s5k: '第 5 步 · 网比链结实',
    s5t: '同样少了一种生物，为什么食物网比单条食物链更经得起？',
    s5e: '这一步要回答：拿走几种生物以后，还有哪些消费者会因为<strong>一种食物都不剩</strong>而饿死。这一步只用这一条规则，不考虑数量多少。对照组是「每种只留第一种食物」：同样 9 种生物，但每个消费者只吃一种东西，网退化成几条单线。在食物网图上点框（或用下面的按钮）可以一次移走一种、连续移走好几种；被移走的打红叉，跟着饿死的变灰。条形图把 9 种生物「各移走一次」的结果并排列出。',
    webFull: '完整食物网', webOne: '每种只留第一种食物', restore: '全部恢复',
    s5lgRemoved: '红叉：被移走', s5lgStarved: '灰色虚框：一种食物都不剩，饿死', s5lgBarFull: '青柱：完整网里跟着饿死几种', s5lgBarOne: '橙柱：只留一种食物时饿死几种',
    c5btitle: '只移走这一种，会跟着饿死几种',
    removeLabel: '点选要移走的生物（可连续选）：',
    s5readout: '{web}：已移走 {removed}；跟着饿死 {starved}（{n} 种）。',
    s5readoutNone: '{web}：还没有移走任何生物。',
    s5sum: '9 种生物各移走一次：完整网一共连带饿死 {full} 种次，只留一种食物时一共 {one} 种次。',
    s5hint: '观察顺序：在「完整食物网」里移走浮游动物，只有蜻蜓幼虫和小鱼饿死；切到「每种只留第一种食物」，同一个操作让 5 种消费者全部饿死。原因在于青蛙、黑鱼、苍鹭在完整网里还有别的食物可吃。',

    s6k: '第 6 步 · 收束',
    s6t: '一张食物网，读出了什么',
    s6fin: '<strong>读图：</strong>箭头从被吃的指向吃它的，就是能量流动的方向；从生产者顺着箭头走到顶，就是一条食物链。<strong>层级：</strong>营养级是在链里的位置，吃好几层食物的动物同时处在好几级。<strong>能量：</strong>每往上一级只剩约 5%–20%，所以链很难很长，顶层的动物很少。<strong>毒物：</strong>能量被烧掉而难分解的毒物留下，所以每级浓度乘以「留存率 ÷ 效率」。<strong>牵一发：</strong>拿走一种，影响会隔级传开；食物来源越多，越不容易连带饿死。',
    quizPrompt: '小测：图上画着「螺 → 青蛙」。下面哪句话对？',
    quizA: '螺吃青蛙，能量从青蛙流向螺。', quizB: '青蛙吃螺，能量从螺流向青蛙。', quizC: '两者都是生产者，只是住在一起。',
    check: '核对', correct: '对：箭头从被吃的指向吃它的，也就是能量的去向。', wrong: '再看第 0 步：箭头指向的是「吃它的」那一方，代表能量往那里去。',
    boundary: '模型的边界：池塘和 9 种生物是虚构的；能量 10 000 kJ、毒物浓度、警戒线都是教学数字；第 4 步只模拟一条四级链，参数是挑来让它稳定的，只表示变化方向和大致倍数；第 5 步只看「有没有食物」，没有考虑数量、迁入和换食。真实池塘还有分解者、杂食和季节变化。',
    linksTitle: '接着看',
    lk1: '→ 能量金字塔第 1 步：每一级的能量丢到哪里去了',
    lk2: '→ 种群生态第 2 步：捕食者和猎物的数量为什么一起起伏',
    lk3: '→ 光合作用第 1 步：生产者造养料的原子账',
    lk4: '→ 自然选择第 0 步：被吃掉的为什么是某一种颜色的蛾',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《食物网》的平行版本。'
  },
  en: {
    pageTitle: 'Food Webs · Who Lives Off Whom in One Pond',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Food Webs →',
    navLabel: 'Food web steps',
    tagline: 'A small pond holds 9 kinds of living things: two plants and seven animals. Know who eats whom and you can draw a web. This page uses that web to answer five questions: how to read the arrows, who sits on which level, why energy thins out going up, why a poison gets stronger going up, and what happens elsewhere when one species is lost.',
    nav0: '0 Arrows', nav1: '1 Levels', nav2: '2 Energy', nav3: '3 Poison', nav4: '4 Fish out', nav5: '5 Web vs chain', nav6: '6 Wrap-up',

    sp_algae: 'Algae', sp_weed: 'Pondweed', sp_zoo: 'Zooplankton', sp_snail: 'Snails', sp_larva: 'Dragonfly nymphs', sp_fish: 'Small fish', sp_frog: 'Frogs', sp_pike: 'Pike', sp_heron: 'Herons',
    ss_algae: 'Algae', ss_weed: 'Weed', ss_zoo: 'Zoopl.', ss_snail: 'Snails', ss_larva: 'Nymphs', ss_fish: 'Fish', ss_frog: 'Frogs', ss_pike: 'Pike', ss_heron: 'Herons',
    listSep: ', ', arrow: ' → ', none: 'nothing',

    s0k: 'STEP 0 · READING THE PICTURE',
    s0t: 'Which way does an arrow point, and how many food chains hide in this web?',
    s0e: 'This step answers: how to read “who eats whom” off the picture, and how many food chains one web contains. Each rounded box is one kind of living thing. The algae and pondweed at the bottom are <strong>producers</strong>: they make their own food from sunlight (<a class="xlink" href="../../../biology/cells/photosynthesis/#step1">→ Photosynthesis, step 1: the atom bookkeeping of making food</a>). The other seven are <strong>consumers</strong>: they get their energy and materials by eating other living things. <strong>An arrow points from the thing eaten to the thing that eats it</strong>, which is the way the energy travels, so “Algae → Zooplankton” reads “zooplankton eat algae”. Start at a producer and follow arrows until you reach something nothing eats: that path is a <strong>food chain</strong>. Many chains woven together make a <strong>food web</strong>.',
    s0lgProd: 'Producer (makes its own food)', s0lgCons: 'Consumer (eats other living things)', s0lgFood: 'Cyan arrows: what the selected one eats', s0lgEater: 'Orange arrows: what eats the selected one', s0lgChain: 'Green: the chain being walked',
    pickSpecies: 'Pick a species (or tap its box in the picture):',
    walkChains: 'Walk every food chain', stopWalk: 'Stop',
    s0readout: '{name}: eat {foods}; eaten by {eaters}. They appear in {n} of the web’s {total} food chains.',
    s0readoutProd: '{name}: a producer, so it eats nothing; eaten by {eaters}. It appears in {n} of the web’s {total} food chains (every one of them starts here).',
    s0walk: 'Chain {i}/{total}: {chain} ({len} species).',
    s0walkIdle: 'The web holds {total} food chains in all. Press “Walk every food chain” and each one turns green in turn; arrows already walked stay pale green.',
    s0walkDone: 'Done: the {total} food chains cover all {edges} arrows. The shortest has {minLen} species, the longest {maxLen}.',
    s0hint: 'What to watch: tap “Algae” first and count its cyan and orange arrows. Then tap “Herons”: only cyan arrows, no orange ones, so nothing in this pond eats them. Finally press “Walk every food chain” and see the {total} chains add up to the whole web.',

    s1k: 'STEP 1 · WHICH LEVEL',
    s1t: 'What rung of the chain is an animal on, and can it be on several at once?',
    s1e: 'This step answers: which “layer” of the web a species sits in. Along one food chain the producer is level 1, whatever eats the producer is level 2, and so on up by one. That position is the <strong>trophic level</strong>. An animal with only one food has an easy answer. Herons, though, eat small fish and also the pike that eat small fish, so in different chains they land on different levels. Below, every chain through the chosen species is drawn as one row, with each level lined up in its own column; the chosen species has an orange box.',
    s1colHead: 'Level {k}',
    s1readout: '{name} appear in {n} food chains, at trophic level {levels}. They eat: {foods}.',
    s1readoutOne: '{name} appear in {n} food chains and sit on level {levels} in every one.',
    s1readoutMany: '(What they eat already sits on different levels, so they have more than one trophic level. Textbooks sometimes quote an average, but each position is real in its own chain.)',
    s1hint: 'What to watch: pick “Zooplankton” first; the orange box stays in column 2. Then pick “Frogs” and “Herons”: the orange boxes spread over several columns. Compare what each one eats and you can say why.',

    s2k: 'STEP 2 · ENERGY GOING UP',
    s2t: 'Why is there less energy the higher up you eat?',
    s2e: 'This step answers: along the longest chain (algae → zooplankton → dragonfly nymphs → small fish → pike → herons), how much energy is left each level up. Say the algae capture 10,000 kJ per square metre of water each year (a teaching number). Of what one level eats, only part becomes its own body that the next level can eat; that share is the <strong>energy transfer efficiency</strong>, usually quoted as about 10% and in practice mostly between 5% and 20%. Most of the rest leaves as heat through <strong>respiration</strong> (cells “burning” food to stay alive); some is uneaten parts, droppings and dead bodies, which go to the <strong>decomposers</strong> (bacteria and fungi). Bar height is the energy each level receives; the dashed box is the energy of the level beneath it, so the gap between them is what was lost in that transfer (<a class="xlink" href="../../../biology/ecology/energy-pyramid/#step1">→ Energy Pyramid, step 1: where the lost energy goes</a>).',
    effSlider: 'Energy transfer efficiency', scaleLin: 'Plain scale', scaleLog: '×10 per gridline',
    s2lgBar: 'Bar: energy this level receives (kJ / m² / year)', s2lgGhost: 'Dashed box: energy of the level that feeds it', s2lgLost: 'The gap = energy lost in that transfer',
    c2title: 'Energy each level receives (kJ / m² / year)', c2titleLog: 'Energy each level receives (kJ / m² / year, ×10 per gridline)',
    lvl: 'Level {k}',
    s2readout: 'At {eff}% efficiency each level keeps only {eff}% of the one below and loses {lost}%. Level {top} (herons) gets just {eTop} kJ, which is {pct}% of what the algae captured. Put the other way: for every 1 kJ a heron gets, the algae had to capture {need} kJ.',
    s2hint: 'What to watch: on the plain scale, drag the efficiency from 5% to 20% and see the bars from level 4 up hug the floor. Then switch to “×10 per gridline”: every level now sits the same number of gridlines below the last, which is what “multiply by the same efficiency each level” looks like.',

    s3k: 'STEP 3 · POISON GOING UP',
    s3t: 'A trace of a hard-to-break-down poison in the pond — why is it strongest in the herons?',
    s3e: 'This step answers: what happens along a food chain to a poison that is hard to break down and hard to get rid of (for example the old pesticide DDT). <strong>Concentration</strong> here means milligrams of poison per kilogram of body (mg/kg). The key is last step’s efficiency: to grow 1 kg of body an animal must eat about “1 ÷ efficiency” kg of food, so 10 kg at 10%. Most of the energy in that food is burned, but the poison is not. If an animal keeps a share of the poison it swallows — call it the <em>retention</em> — then each level up the concentration is multiplied by “retention ÷ efficiency”. Getting stronger going up like this is called <strong>biomagnification</strong>. Bar height uses a ×10-per-gridline scale; otherwise the lower bars would be invisible.',
    keepSlider: 'Poison retention (share of swallowed poison kept in the body)', effSlider3: 'Energy transfer efficiency',
    s3lgBar: 'Bar: poison concentration in the body (mg/kg)', s3lgOver: 'Red bar: above the warning line', s3lgLine: 'Red dashes: illustrative warning line, 1 mg/kg',
    c3title: 'Poison in the body (mg/kg, ×10 per gridline)',
    s3readout: 'Each level up, the concentration is multiplied by retention ÷ efficiency = {keep}% ÷ {eff}% = {f}×. Algae carry {c1} mg/kg; herons carry {cTop} mg/kg, {ratio} times as much. {over}',
    s3over: 'Above the illustrative warning line: {list}.',
    s3overNone: 'Nothing is above the illustrative warning line.',
    s3down: 'Retention is below the efficiency, so the poison actually thins out going up: substances like this get broken down or flushed out and do not build up.',
    s3hint: 'What to watch: keep efficiency at 10% and drag retention down from 100%. At 10% all five bars are equal; below that they shrink going up. Then put retention back at 90% and move the efficiency: the lower it is, the more food each level eats per kilogram grown, and the faster the poison piles up.',

    s4k: 'STEP 4 · FISHING ONE OUT',
    s4t: 'Fish every pike out of the pond — why does the water turn green?',
    s4e: 'This step answers: when one species is taken away, do species several levels below it change too? Only one main chain of the web is modelled here: algae → zooplankton → small fish → pike. A set of simplified equations tracks their numbers over time (each species grows faster the more it eats and shrinks faster the more it is eaten; the algae cannot grow past a ceiling however well they do). Every curve is shown as “percent of its original number”, so all four start at 100%. From time 20 one species is fished out and kept at zero. The effect of the missing species travels down the chain, flipping direction at each level. A knock-on change passed level by level like this is a <strong>trophic cascade</strong> (for the back-and-forth of one predator and its prey, <a class="xlink" href="../../../biology/ecology/population-ecology/#step2">→ Population Ecology, step 2: why a predator makes its prey’s numbers swing</a>).',
    cutNone: 'No fishing', cutPike: 'Fish out the pike', cutFish: 'Fish out the small fish', cutZoo: 'Remove the zooplankton', replay: 'Replay',
    s4lgCut: 'Dashed line: fishing starts here', s4lgWater: 'Bottom strip: water colour (greener = more algae)',
    c4title: 'Numbers (percent of original)', c4x: 'Time (model units)',
    s4progress: 'Time {t}/{T}. ',
    s4readout: '{scene}: {rows}.',
    s4row: '{name} {pct}% ({dir})',
    up: 'up', down: 'down', same: 'unchanged', gone: 'gone',
    s4sceneNone: 'No fishing', s4scenePike: 'Pike fished out, in the end', s4sceneFish: 'Small fish fished out, in the end', s4sceneZoo: 'Zooplankton removed, in the end',
    s4tailNone: 'All four stay where they started: eating and being eaten balance exactly.',
    s4tail: 'Algae end at {algae}% of before, so the water {water}.',
    waterGreener: 'turns clearly greener', waterClearer: 'gets clearer', waterSame: 'hardly changes',
    s4hint: 'What to watch: press “Fish out the pike”. The orange small-fish line shoots up first, the cyan zooplankton line then drops, the green algae line then rises, and the bottom strip turns green: the change flips at every level. Then press “Fish out the small fish” to compare: zooplankton rise, algae fall, and the pike die out with nothing left to eat.',

    s5k: 'STEP 5 · WEB VERSUS CHAIN',
    s5t: 'Lose the same species — why does a web cope better than a single chain?',
    s5e: 'This step answers: once some species are removed, which consumers starve because <strong>not one of their foods is left</strong>? Only that one rule is used here; numbers are ignored. The comparison is “one food each”: the same 9 species, but each consumer eats just one thing, so the web falls apart into a few single lines. Tap boxes in the web picture (or use the buttons below) to remove species one at a time, as many as you like; removed ones get a red cross, those that starve as a result turn grey. The bar chart lists what happens when each of the 9 species is removed on its own.',
    webFull: 'Full food web', webOne: 'One food each', restore: 'Put everything back',
    s5lgRemoved: 'Red cross: removed', s5lgStarved: 'Grey dashed box: no food left, starves', s5lgBarFull: 'Cyan bar: how many starve in the full web', s5lgBarOne: 'Orange bar: how many starve with one food each',
    c5btitle: 'Remove only this one: how many others starve',
    removeLabel: 'Tap species to remove (several are fine):',
    s5readout: '{web}: removed {removed}; starved as a result: {starved} ({n} species).',
    s5readoutNone: '{web}: nothing removed yet.',
    s5sum: 'Removing each of the 9 species once: {full} knock-on starvations in total in the full web, {one} with one food each.',
    s5hint: 'What to watch: in the full web, remove the zooplankton and only the dragonfly nymphs and small fish starve. Switch to “One food each” and the same move starves 5 consumers. The reason: in the full web, frogs, pike and herons still have other food.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'What one food web told us',
    s6fin: '<strong>Reading it:</strong> an arrow points from the eaten to the eater, the way energy flows; follow arrows from a producer to the top and you have a food chain. <strong>Levels:</strong> a trophic level is a position in a chain, and an animal eating at several levels sits on several. <strong>Energy:</strong> only about 5–20% survives each step up, so chains cannot get long and top animals are few. <strong>Poison:</strong> energy is burned but a persistent poison stays, so its concentration multiplies by “retention ÷ efficiency” each level. <strong>Knock-ons:</strong> take one species away and the effect spreads level by level; the more foods a consumer has, the less likely it is to starve with the others.',
    quizPrompt: 'Quick check: the picture shows “Snails → Frogs”. Which sentence is right?',
    quizA: 'Snails eat frogs; energy flows from frogs to snails.', quizB: 'Frogs eat snails; energy flows from snails to frogs.', quizC: 'Both are producers that simply live together.',
    check: 'Check', correct: 'Right: the arrow points from the eaten to the eater, which is where the energy goes.', wrong: 'Look at step 0 again: the arrow points to the one that does the eating, where the energy goes.',
    boundary: 'Where the model stops: the pond and its 9 species are made up; the 10,000 kJ, the poison levels and the warning line are teaching numbers; step 4 models a single four-level chain with parameters chosen so it settles, so read it for the direction and rough size of the changes; step 5 only asks “is there any food left”, ignoring numbers, newcomers and diet switching. Real ponds also have decomposers, animals that eat both plants and animals, and seasons.',
    linksTitle: 'Where to next',
    lk1: '→ Energy Pyramid, step 1: where each level’s energy goes',
    lk2: '→ Population Ecology, step 2: why predator and prey numbers rise and fall together',
    lk3: '→ Photosynthesis, step 1: the producers’ atom bookkeeping',
    lk4: '→ Natural Selection, step 0: why moths of one colour get eaten',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Food Webs”.'
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
  if (typeof window.refreshFoodWeb === 'function') window.refreshFoodWeb();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.FOODWEB_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
