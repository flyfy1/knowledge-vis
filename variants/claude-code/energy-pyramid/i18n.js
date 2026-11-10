'use strict';
// Energy pyramid lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '能量金字塔 · 为什么顶级捕食者那么少',
    back: '← 知识索引',
    compare: '对照另一版本：能量金字塔 · 为什么顶级捕食者那么少 →',
    navLabel: '能量金字塔步骤导航',
    tagline: '一片草原上，草多、兔子少、狐狸更少，老鹰难得一见。这不是巧合，而是一本能量账：植物把阳光存成身体里的能量，兔子吃草、狐狸吃兔子，每往上传一次，大部分能量都在半路花掉了。六步里你会先查清一级的账，再把几级叠成金字塔，算出顶级捕食者需要多大地盘、金字塔什么时候会「倒立」，以及同一块地种粮食能养活多少人。',
    nav0: '0 一级的账', nav1: '1 层层变小', nav2: '2 顶端的地盘', nav3: '3 倒立的金字塔', nav4: '4 吃什么', nav5: '5 收束',

    s0k: '第 0 步 · 一级的能量账',
    s0t: '植物长出的能量，最后有多少变成了兔子的身体？',
    s0e: '这一步要回答：能量从一级传到下一级时，丢在了哪里？我们跟踪一块草地上植物一年新长出的 1000 kJ（千焦，能量的单位）能量。能自己用阳光造养料的植物叫<strong>生产者</strong>（<a class="xlink" href="../../../biology/cells/photosynthesis/#step1">→ 光合作用页第 1 步：植物从哪儿拿到能量和原料</a>）；靠吃别的生物获得能量的动物叫<strong>消费者</strong>。在吃与被吃的链条上所处的位置叫<strong>营养级</strong>：植物是第 1 级，吃植物的兔子是第 2 级。能量要过三道关才能变成兔子的身体：① 草要被吃到；② 吃下的要被消化吸收，没吸收的成了粪便；③ 吸收的大部分被兔子用来维持生命（跑、保持体温、心跳），这叫<strong>呼吸作用</strong>，最后以热的形式散掉，只有剩下的一点长成新的身体。没被吃的草和粪便最后被<strong>分解者</strong>（细菌、真菌等）利用。',
    row0: '植物一年长出', row1: '① 其中被吃掉的', row2: '② 其中被吸收的', row3: '③ 其中长成身体的',
    eaten0: '① 被吃掉的比例', absorbed0: '② 吃下后被吸收的比例', growth0: '③ 吸收后长成身体的比例',
    c0: '1000 kJ 植物能量一路分流（单位 kJ）',
    s0lgPlant: '植物一年长出的能量', s0lgUneaten: '没被吃 → 分解者', s0lgFeces: '粪便 → 分解者', s0lgResp: '呼吸作用散失的热', s0lgGrow: '长成兔子身体（能传给下一级）',
    s0readout: '1000 kJ → 被吃 {E} kJ → 吸收 {A} kJ → 长成身体 {G} kJ。传到下一级的只有 {pct}%（= {e}% × {a}% × {g}%）；{resp} kJ 变成热散掉，{decomp} kJ 交给分解者。',
    s0hint: '观察顺序：三个滑杆分别改三道关。先把三道关都拖到最大，传下去的比例也只有约四成；再拖回接近真实的值（例如 50%、50%、20%，这时只剩 5%）。最下面那条青色的一段就是能传给下一级的；红色（呼吸散热）一旦散掉，就再也回不到生物体里。常说的「大约 10%」就是三道关相乘的结果，不同动物差别很大（恒温动物保持体温很耗能，所以第 ③ 关特别低）。',

    s1k: '第 1 步 · 一级一级往上',
    s1t: '每级只传下约一成，四级之后还剩多少？',
    s1e: '这一步要回答：把上一步的「传给下一级的比例」叫<strong>传递效率</strong>，假设每一级都一样，那第 2、3、4 级各能拿到多少？设这片草原上植物每年每平方米存下 10000 kJ。第 k 级得到的能量 = 10000 × 效率^(k−1)。从下往上画，每级一根横条，条的宽度代表这一级每年得到的能量，就叠成一座<strong>能量金字塔</strong>。',
    eff1: '传递效率（每级相同）', lin1: '按能量直接画', log1: '按数量级画（每格 ×10）',
    c1: '能量金字塔（每平方米每年）',
    lvl1: '1 植物', lvl2: '2 食草动物', lvl3: '3 食肉动物', lvl4: '4 顶级食肉',
    s1lgBar: '横条宽度 = 这一级每年得到的能量', s1lgNow: '「显示方式」只改画法，不改数字',
    s1readout: '效率 {eff}%：植物 {L1} kJ → 食草动物 {L2} kJ → 食肉动物 {L3} kJ → 顶级食肉 {L4} kJ（每平方米每年）。顶级只拿到植物能量的 {top}%。',
    s1hint: '观察顺序：先用「按能量直接画」，效率 10% 时第 3、4 级细得几乎看不见；换成「按数量级画」，每级正好缩进一格。再拖效率：从 10% 降到 5%，第 4 级从 10 kJ 降到 1.25 kJ，变成八分之一，因为效率被连乘了三次。',

    s2k: '第 2 步 · 顶端的地盘',
    s2t: '同一只动物，吃得越「高」，需要的地盘为什么越大？',
    s2e: '这一步要回答：顶级捕食者为什么那么少（<a class="xlink" href="../../../biology/ecology/food-web/#step1">→ 食物网页第 1 步也从数量上问了这个问题</a>）？设一只狐狸大小的动物一年要吃进 700000 kJ 的食物（每天约 1900 kJ）。它的食物来自哪一级，那一级每平方米每年能提供多少能量，就决定了它至少要占多大的地。<strong>最小面积 = 一年需要的能量 ÷ 食物所在级每平方米每年的能量</strong>。这是最乐观的下限：假设它能把那一级一年长出的能量全部吃到，现实中只能吃到一小部分，需要的地还要大得多。',
    eats1: '只吃植物', eats2: '吃食草动物', eats3: '吃食肉动物',
    eff2: '传递效率（每级相同）',
    c2: '至少需要的地盘（按比例，虚线框 = 足球场）',
    s2lgSq: '三种吃法各自需要的面积', s2lgNow: '当前选中的吃法', s2lgField: '足球场（105 m × 68 m）',
    s2readout: '{diet}：食物所在级每平方米每年有 {food} kJ，至少要 {area} m²（约 {fields} 个足球场）。一平方公里最多养活 {perKm2} 只。',
    s2hint: '观察顺序：保持效率 10%，依次点三个按钮，看青色方块一次比一次大，而且正好每次扩大 10 倍面积（边长约 3.2 倍）；一平方公里能养活的只数相应少 10 倍。再把效率调到 5%：吃食肉动物需要的地扩大到原来的 4 倍。顶级捕食者稀少，是因为它头顶上没有足够的能量。',

    s3k: '第 3 步 · 倒立的金字塔',
    s3t: '有没有「上面比下面大」的金字塔？',
    s3e: '这一步要回答：金字塔一定是下宽上窄吗？要看画的是什么。<strong>能量金字塔</strong>画每一级每年流过的能量（这里用每年新长出的干重，叫<strong>生产量</strong>，单位 g/m²·年），它永远下大上小，因为每一级只能拿到下一级的一部分。<strong>生物量金字塔</strong>画某一刻每平方米站着多少活的生物（干重 g/m²）。生物量 = 生产量 ÷ <strong>更新次数</strong>（一年里这一级的个体平均被「换掉」几次）。海里的浮游植物（微小的单细胞藻类）长得快、被吃得也快，一年能更新上百次，所以任何时刻水里都不多；吃它们的浮游动物活得久，一年只更新约 3 次，于是生物量可能反而更多，生物量金字塔就倒立了。（数量金字塔也会倒：一棵大树上可以住几千只毛毛虫。）',
    turn3: '生产者一年更新几次', presetSea: '海洋浮游植物（约 150 次）', presetGrass: '草原上的草（约 1 次）',
    c3a: '生物量金字塔（g/m²，某一时刻）', c3b: '能量（生产量）金字塔（g/m²·年）',
    lvlP: '生产者', lvlZ: '浮游动物',
    s3lgP: '生产者', s3lgZ: '吃生产者的动物（浮游动物）',
    s3readout: '生产者一年更新 {turn} 次：生物量 {B1} g/m²，浮游动物生物量 {B2} g/m²，{bio}。生产量：生产者 {P1}、浮游动物 {P2} g/m²·年，能量金字塔仍是正的。',
    s3inv: '生物量金字塔倒立了', s3up: '生物量金字塔是正的',
    s3hint: '观察顺序：先点「草原上的草」，两个金字塔都是正的；把更新次数慢慢往右拖，「生物量金字塔」图里的生产者横条越来越窄，超过 {flip} 次时比浮游动物还窄——倒立了；而「能量金字塔」图一直不变。更新次数只改变「某一刻站着多少」，不改变「一年流过多少」。',

    s4k: '第 4 步 · 吃什么',
    s4t: '同一公顷地，为什么吃素能养活更多人？',
    s4e: '这一步要回答：人也站在这座金字塔里。一个人一年大约要吃进 3800000 kJ（每天约 10400 kJ，即 2500 千卡）。设 1 <strong>公顷</strong>（10000 m²，约 1.4 个足球场）农田每年产出可直接吃的粮食 40000000 kJ。人直接吃粮食，就站在第 2 级；吃的肉、蛋、奶来自用粮食喂大的动物，相当于站在第 3 级，中间多了一次转化。<strong>饲料转化率</strong>是动物产出的肉蛋奶能量占它吃进饲料能量的比例：牛肉约 3%，鸡肉约 10%，牛奶、鸡蛋更高一些（示意值）。<strong>每人需要的地 = 吃素部分的地 + 吃荤部分的地</strong>，后者要除以转化率。',
    meat4: '食物能量中来自肉蛋奶的比例', conv4: '饲料转化率',
    c4: '1 公顷地一年养活几个人（每个圆点 = 1 人）',
    c4bar: '每人需要的地（公顷）',
    s4lgPerson: '一个人（最后一个按比例画了一部分）', s4lgPlant: '种口粮的地', s4lgAnimal: '种饲料的地',
    s4readout: '肉蛋奶占 {m}%、转化率 {c}%：每人需要 {land} 公顷（口粮 {pl} + 饲料 {al}），1 公顷养活 {ppl} 人；全吃素时是 {veg} 人。',
    s4hint: '观察顺序：先把肉蛋奶比例拖到 0，1 公顷养活约 {veg} 人；再拖到 30%，转化率 10% 时只剩约 {p30} 人——三成的食物占掉了八成的地（橙色段）。保持 30% 不变，把转化率从 10% 拖到 3%（像牛肉），人数再掉到约 {p30b} 人。这里只算能量，没算蛋白质、营养和土地是否适合种粮。',

    s5k: '第 5 步 · 收束',
    s5t: '一本账说清金字塔',
    s5fin: '能量从一级传到下一级要过三道关（被吃、被吸收、长成身体），大部分在<strong>呼吸作用</strong>中变成热散掉，所以<strong>传递效率</strong>通常只有一成左右，而且级数越多，连乘得越小：10% 连乘三次只剩 0.1%。所以食物链很少超过四五级，顶端的动物需要极大的地盘、数量稀少。<strong>能量金字塔</strong>永远正立；<strong>生物量</strong>和<strong>数量</strong>金字塔可能倒立，因为它们描述的是「某一刻站着多少」，不是「一年流过多少」。人吃得越靠上，同一块地养活的人越少。',
    formula: '第 k 级能量 = 生产者能量 × 效率^(k−1)\n最小地盘 = 一年所需能量 ÷ 食物级每平方米能量\n生物量 = 生产量 ÷ 一年更新次数',
    boundary: '适用范围与简化：本页的数字（1000 kJ、10000 kJ/m²、700000 kJ、作物产量等）都是示意的整数；真实的传递效率从约 1% 到 20% 以上都有；把食物网简化成了一条直链；第 2 步的面积是假设能吃到全部食物的下限；第 4 步只算能量，不算营养、土地质量和草场等不能种粮的土地。',
    quizPrompt: '自测：如果每一级的传递效率都是 10%，第 4 级（顶级食肉动物）得到的能量是生产者的多少？',
    quizA: '10%', quizB: '1%', quizC: '0.1%',
    check: '核对', correct: '对。从第 1 级到第 4 级要传三次：10% × 10% × 10% = 0.1%（第 1 步：10000 kJ 到第 4 级只剩 10 kJ）。', wrong: '再想想：从第 1 级到第 4 级要传几次？每传一次都要乘一次 10%。',
    linksTitle: '接着看',
    lk1: '→ 食物网 第 1 步：为什么吃肉的动物总比吃草的少',
    lk2: '→ 食物网 第 3 步：微量的毒为什么在顶层动物体内浓得吓人',
    lk3: '→ 光合作用 第 1 步：植物从哪儿拿到最初的能量和原料',
    lk4: '→ 种群生态 第 1 步：食物有限时，种群为什么停在 K 附近',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《能量金字塔 · 为什么顶级捕食者那么少》的平行版本。'
  },
  en: {
    pageTitle: 'The Energy Pyramid · Why Top Predators Are Rare',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Energy Pyramid · Why Top Predators Are Rare →',
    navLabel: 'Energy pyramid steps',
    tagline: 'On a grassland there is lots of grass, fewer rabbits, fewer foxes still, and hardly ever an eagle. That is no accident — it is an energy ledger. Plants store sunlight as energy in their bodies, rabbits eat grass, foxes eat rabbits, and at every hand-off most of the energy is spent along the way. In six steps you will audit one level, stack levels into a pyramid, work out how much land a top predator needs, see when a pyramid can stand on its head, and count how many people one plot of farmland can feed.',
    nav0: '0 One level’s ledger', nav1: '1 Shrinking upward', nav2: '2 Room at the top', nav3: '3 Upside-down pyramids', nav4: '4 What we eat', nav5: '5 Wrap-up',

    s0k: 'Step 0 · One level’s energy ledger',
    s0t: 'Of the energy the plants grew, how much ends up as rabbit?',
    s0e: 'The question here: when energy passes from one level to the next, where does it go missing? Follow the 1000 kJ (kilojoules, a unit of energy) of new growth that the plants on a patch of grass add in a year. Organisms that make their own food from sunlight, like plants, are <strong>producers</strong> (<a class="xlink" href="../../../biology/cells/photosynthesis/#step1">→ Photosynthesis, step 1: where plants get their energy and raw materials</a>); animals that get energy by eating other living things are <strong>consumers</strong>. A position in the chain of who eats whom is a <strong>trophic level</strong>: plants are level 1, the rabbits that eat them level 2. Energy has to pass three gates to become rabbit: ① the grass has to be eaten; ② what is eaten has to be digested and absorbed — the rest leaves as droppings; ③ most of what is absorbed is spent keeping the rabbit alive (running, staying warm, a beating heart), which is <strong>respiration</strong> and ends up as heat; only what is left becomes new body. Uneaten grass and droppings are eventually used by <strong>decomposers</strong> (bacteria, fungi and so on).',
    row0: 'Plant growth this year', row1: '① the part eaten', row2: '② of that, absorbed', row3: '③ of that, new body',
    eaten0: '① Share that gets eaten', absorbed0: '② Share of what is eaten that is absorbed', growth0: '③ Share of what is absorbed that becomes body',
    c0: '1000 kJ of plant energy, split at each gate (kJ)',
    s0lgPlant: 'Energy the plants grew this year', s0lgUneaten: 'Not eaten → decomposers', s0lgFeces: 'Droppings → decomposers', s0lgResp: 'Lost as heat in respiration', s0lgGrow: 'Becomes rabbit (passes to the next level)',
    s0readout: '1000 kJ → eaten {E} kJ → absorbed {A} kJ → new body {G} kJ. Only {pct}% reaches the next level (= {e}% × {a}% × {g}%); {resp} kJ is lost as heat and {decomp} kJ goes to decomposers.',
    s0hint: 'What to watch: each slider is one gate. Push all three to the maximum and still only about two fifths gets through; then bring them back to realistic values (say 50%, 50%, 20% — now just 5%). The cyan piece in the bottom row is what can pass up; the red heat from respiration, once gone, never returns to living things. The familiar “about 10%” is the three gates multiplied, and animals differ a lot (warm-blooded ones spend so much staying warm that gate ③ is especially low).',

    s1k: 'Step 1 · Level after level',
    s1t: 'If each level passes on about a tenth, what is left after four?',
    s1e: 'The question here: call the share passed on in step 0 the <strong>transfer efficiency</strong> and assume it is the same at every level — how much reaches levels 2, 3 and 4? Say the plants on this grassland store 10000 kJ per square metre each year. Level k receives 10000 × efficiency^(k−1). Draw one bar per level from the bottom up, with its width standing for the energy that level gets each year, and you have an <strong>energy pyramid</strong>.',
    eff1: 'Transfer efficiency (same at every level)', lin1: 'Draw energy as it is', log1: 'Draw orders of magnitude (×10 per step)',
    c1: 'Energy pyramid (per m² per year)',
    lvl1: '1 plants', lvl2: '2 herbivores', lvl3: '3 carnivores', lvl4: '4 top carnivores',
    s1lgBar: 'Bar width = energy this level gets per year', s1lgNow: 'The drawing buttons change only the picture, not the numbers',
    s1readout: 'Efficiency {eff}%: plants {L1} kJ → herbivores {L2} kJ → carnivores {L3} kJ → top carnivores {L4} kJ (per m² per year). The top gets just {top}% of the plants’ energy.',
    s1hint: 'What to watch: with “Draw energy as it is” at 10%, levels 3 and 4 are slivers you can barely see; switch to “Draw orders of magnitude” and each level steps in by exactly one notch. Then drag the efficiency from 10% down to 5%: level 4 falls from 10 kJ to 1.25 kJ, an eighth, because the efficiency is multiplied in three times.',

    s2k: 'Step 2 · Room at the top',
    s2t: 'The same animal, eating higher up — why does it need more land?',
    s2e: 'The question here: why are top predators so rare (<a class="xlink" href="../../../biology/ecology/food-web/#step1">→ Food webs, step 1 asks the same question about numbers</a>)? Take a fox-sized animal that needs to eat 700000 kJ of food a year (about 1900 kJ a day). Whichever level its food comes from, the energy that level supplies per square metre per year fixes the least land it must occupy: <strong>minimum area = energy needed per year ÷ energy per m² per year at the food’s level</strong>. This is the most optimistic bound — it assumes the animal eats that level’s entire yearly growth; in reality it gets only a fraction and needs far more land.',
    eats1: 'Eats only plants', eats2: 'Eats herbivores', eats3: 'Eats carnivores',
    eff2: 'Transfer efficiency (same at every level)',
    c2: 'Least land needed, to scale (dashed: football pitch)',
    s2lgSq: 'Area needed for each diet', s2lgNow: 'Diet selected now', s2lgField: 'Football pitch (105 m × 68 m)',
    s2readout: '{diet}: the food level supplies {food} kJ per m² per year, so at least {area} m² is needed (about {fields} football pitches). One square kilometre feeds at most {perKm2} of them.',
    s2hint: 'What to watch: keep the efficiency at 10% and press the three buttons in turn — the cyan square grows each time, by exactly 10× in area (about 3.2× on a side), and the number per square kilometre drops tenfold. Then set the efficiency to 5%: the carnivore-eater now needs 4 times the land. Top predators are rare because there is not much energy left above them.',

    s3k: 'Step 3 · Upside-down pyramids',
    s3t: 'Is there ever a pyramid that is bigger on top?',
    s3e: 'The question here: is a pyramid always wide at the bottom? It depends on what you draw. An <strong>energy pyramid</strong> shows the energy flowing through each level per year (here as new dry mass grown, called <strong>production</strong>, in g/m² per year), and it always narrows upward because each level gets only part of the one below. A <strong>biomass pyramid</strong> shows how much living material stands on each square metre at one moment (dry mass, g/m²). Biomass = production ÷ <strong>turnover</strong> (how many times a year that level is, on average, “replaced”). Phytoplankton in the sea (tiny single-celled algae) grow fast and are eaten fast, turning over a hundred-plus times a year, so at any moment there is not much of them in the water; the zooplankton that eat them live longer and turn over only about 3 times a year, so their biomass can be larger — the biomass pyramid stands on its head. (A pyramid of numbers can flip too: one big tree can host thousands of caterpillars.)',
    turn3: 'Producer turnovers per year', presetSea: 'Ocean phytoplankton (~150)', presetGrass: 'Grassland grass (~1)',
    c3a: 'Biomass pyramid (g/m², at one moment)', c3b: 'Energy (production) pyramid (g/m² per year)',
    lvlP: 'producers', lvlZ: 'zooplankton',
    s3lgP: 'Producers', s3lgZ: 'Animals eating them (zooplankton)',
    s3readout: 'Producers turn over {turn} times a year: biomass {B1} g/m², zooplankton biomass {B2} g/m² — {bio}. Production: producers {P1}, zooplankton {P2} g/m² per year, so the energy pyramid is still upright.',
    s3inv: 'the biomass pyramid is upside down', s3up: 'the biomass pyramid is upright',
    s3hint: 'What to watch: press “Grassland grass” — both pyramids are upright. Drag the turnover slowly to the right: in the “Biomass pyramid” chart the producer bar narrows, and beyond {flip} turnovers it is narrower than the zooplankton bar — upside down. The “Energy pyramid” chart never changes. Turnover changes how much is standing at one moment, not how much flows through in a year.',

    s4k: 'Step 4 · What we eat',
    s4t: 'On the same hectare, why does a plant-based diet feed more people?',
    s4e: 'The question here: people stand in this pyramid too. One person eats about 3800000 kJ a year (about 10400 kJ, or 2500 kcal, a day). Say one <strong>hectare</strong> (10000 m², about 1.4 football pitches) of farmland yields 40000000 kJ of edible crop a year. Eating the crop directly puts you at level 2; meat, eggs and milk come from animals fed on crops, which puts you at level 3, with one more conversion in between. <strong>Feed conversion</strong> is the share of the feed energy an animal eats that comes back as meat, eggs or milk: roughly 3% for beef, 10% for chicken, somewhat more for milk and eggs (illustrative values). <strong>Land per person = land for the plant part + land for the animal part</strong>, and the latter is divided by the conversion.',
    meat4: 'Share of food energy from meat, eggs and milk', conv4: 'Feed conversion',
    c4: 'People one hectare feeds for a year (one dot = 1 person)',
    c4bar: 'Land needed per person (hectares)',
    s4lgPerson: 'One person (the last dot drawn in proportion)', s4lgPlant: 'Land for crops people eat', s4lgAnimal: 'Land for animal feed',
    s4readout: '{m}% from meat, eggs and milk at {c}% conversion: each person needs {land} ha (crops {pl} + feed {al}), so one hectare feeds {ppl} people; on an all-plant diet it is {veg}.',
    s4hint: 'What to watch: drag the meat, egg and milk share to 0 — one hectare feeds about {veg} people. Drag it to 30%: at 10% conversion only about {p30} are fed — three tenths of the food takes up eight tenths of the land (the orange segment). Keep 30% and drag conversion from 10% down to 3% (like beef): down to about {p30b} people. This counts energy only, not protein, nutrition, or whether the land could grow crops at all.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'One ledger explains the pyramid',
    s5fin: 'Energy passing from one level to the next must clear three gates (eaten, absorbed, turned into body), and most of it is lost as heat in <strong>respiration</strong>, so the <strong>transfer efficiency</strong> is usually around a tenth — and it multiplies with every level: 10% three times leaves 0.1%. That is why food chains rarely exceed four or five levels and why animals at the top need huge territories and are few. An <strong>energy pyramid</strong> is always upright; <strong>biomass</strong> and <strong>numbers</strong> pyramids can flip, because they describe how much stands at one moment, not how much flows through in a year. The higher up the pyramid people eat, the fewer one plot of land can feed.',
    formula: 'energy at level k = producer energy × efficiency^(k−1)\nleast land = energy needed per year ÷ energy per m² at the food’s level\nbiomass = production ÷ turnovers per year',
    boundary: 'Scope and simplifications: the numbers on this page (1000 kJ, 10000 kJ/m², 700000 kJ, crop yield and so on) are illustrative round values; real transfer efficiencies range from about 1% to over 20%; the food web is simplified to a single chain; the areas in step 2 are lower bounds that assume all the food can be eaten; step 4 counts energy only, not nutrition, land quality, or grazing land that cannot grow crops.',
    quizPrompt: 'Check yourself: if every level passes on 10%, what share of the producers’ energy reaches level 4 (top carnivores)?',
    quizA: '10%', quizB: '1%', quizC: '0.1%',
    check: 'Check', correct: 'Right. From level 1 to level 4 there are three hand-offs: 10% × 10% × 10% = 0.1% (in step 1, 10000 kJ shrinks to 10 kJ by level 4).', wrong: 'Think again: how many hand-offs are there from level 1 to level 4? Each one multiplies by 10%.',
    linksTitle: 'Where next',
    lk1: '→ Food webs, step 1: why meat-eaters are always fewer than plant-eaters',
    lk2: '→ Food webs, step 3: why a trace of poison gets so concentrated in top animals',
    lk3: '→ Photosynthesis, step 1: where plants get their first energy and raw materials',
    lk4: '→ Population ecology, step 1: why a population with limited food levels off near K',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Energy Pyramid · Why Top Predators Are Rare”.'
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
  if (typeof window.refreshPyramid === 'function') window.refreshPyramid();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EP_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
