const STR={
zh:{
pageTitle:'能量金字塔 · 为什么顶级捕食者那么少',tagline:'阳光的能量一级一级往上传，每上一级只剩一成左右；顶级食肉动物为什么稀有、人吃素为什么养得活更多人，都能算出来。',
nav0:'0 阳光进来',nav1:'1 逐级递减',nav2:'2 顶端要多大地盘',nav3:'3 三种金字塔',nav4:'4 吃什么养活多少人',nav5:'5 回顾自测',
lblSun:'入射阳光（每年每平方米）',lblFix:'被生产者固定的能量',lblHa:'每个方块 = 1 公顷所需面积（养活 1 只）',lblDots:'每个点 = 一个人（10 公顷耕地能养活的人数）',pyr_n:'个体数',pyr_b:'生物量',pyr_p:'年产量（能量）',lEta:'光合作用把阳光变成有机物的效率 η（%）',lEff:'相邻两级之间的能量传递效率（%）',lLevel:'营养级（1 = 生产者）',lMeat:'饮食能量中来自肉的比例（%）',lConv:'饲料转化成肉的效率（%）',eGrass:'草原',eForest:'森林',eOcean:'海洋',
s0t:'能量从阳光进来：生产者只抓住很少的一点',
s0e:'这一步要回答：整个食物链的能量最初有多少？绿色植物（<strong>生产者</strong>）用光合作用把一小部分阳光能量固定成有机物，这是整条食物链的全部能量来源。设每年每平方米接收的太阳能是 5,000,000 kJ，生产者固定的比例是效率 η（常见约 1%），固定下来的能量就是 5,000,000 × η。图中长条是入射阳光，短条是被固定的能量；剩下的大部分被反射、变成热或没被利用。',
s0o:'把 η 从 0.2% 拉到 3%：看短条的长度，对照读数里固定的能量（kJ/m²/年）；想一想，为什么即使 η 翻三倍，生产者能量也只是阳光的一小部分。',
r0:'入射阳光 {i} kJ/m²/年；η = {eta}%：生产者固定 {p} kJ/m²/年；没有被固定的 {rest}%。',
s1t:'逐级递减：每传一级，只剩下一小部分',
s1e:'这一步要回答：能量沿食物链往上传，每一级剩多少？营养级依次是：生产者（植物）、初级消费者（草食动物）、次级消费者（吃草食动物的肉食动物）、三级消费者……每一级吃下上一级的能量中，只有一部分变成自己的身体有机物，叫<strong>传递效率</strong>（常见约 10%）；其余大部分通过呼吸作用变成热散失，一部分变成没被吃的残体和排泄物，进入分解者。以 5,000,000 kJ 的 1% 为生产者起点，第 k 级的能量 = 生产者能量 × 效率^(k−1)。下面的横条宽度与能量成正比。',
s1o:'把传递效率从 10% 调到 20%：看顶端横条变宽了多少；再调回 5%；用“营养级”滑块选一级，看它的能量去向：传下一级、呼吸散失（取损失部分的 70%）和进入分解者（30%）。',
r1:'第 {l} 级（{name}）能量 {e} kJ/m²/年：{tr} 传给下一级，{resp} 呼吸散失，{dec} 进入分解者；第 {n} 级只剩生产者的 {pct}%。',
lvl1:'生产者',lvl2:'初级消费者',lvl3:'次级消费者',lvl4:'三级消费者',lvl5:'四级消费者',lvl6:'五级消费者',
s2t:'顶端要多大的地盘？越往上，养活一只动物要的面积越大',
s2e:'这一步要回答：为什么顶级捕食者那么少？假设一只中等大小的肉食动物每年需要 365,000 kJ 的能量（相当于一只狐狸）。第 k 级每平方米每年只有 E 的能量可用，所以养活一只动物需要的面积 = 365,000 ÷ E。越往高级，E 越小，需要的面积越大；到某一级，需要的面积大到一块地盘里只能有很少的个体，甚至一个也养不活——这就是食物链很少超过 4–5 级的原因。本页的生产者能量取 50,000 kJ/m²/年（η = 1%）。',
s2o:'把营养级从 1 拉到 6：看所需面积（用方块表示 1 公顷 = 10,000 m² 的格子数）怎样飞速变大；把传递效率调高到 25%，同一级所需面积缩小多少？',
r2:'传递效率 {eff}%：第 {l} 级可用能量 {e} kJ/m²/年；养活 1 只需要 {a} m²（约 {ha} 公顷）。',
s3t:'三种金字塔：能量总是正的，个体数和生物量却可能倒过来',
s3e:'这一步要回答：金字塔会不会倒过来？<strong>能量金字塔</strong>（每年流过的能量）永远是上小下大，因为热力学规律不允许能量越传越多。但<strong>数量金字塔</strong>（个体数）和<strong>生物量金字塔</strong>（某一时刻现存的有机物质量）可能倒过来：一棵树上有成千上万只昆虫（数量倒置）；海里浮游植物个头小、更替极快，某一时刻的生物量比以它为食的浮游动物还少（生物量倒置）。每年产量 = 现存生物量 × 更替率（每年更替几次）。选一个生态系统，对比三个金字塔（数据为示例值，宽度按对数刻度）。',
s3o:'依次选草原、森林、海洋：数一数哪个金字塔在哪个生态系统里出现了“倒挂”，再看最右边的年产量（能量）金字塔是否仍然上小下大。',
r3:'{eco}：个体数{n1}；生物量{n2}；年产量（能量）{n3}。',
inv:'出现倒置',upr:'上小下大',
s4t:'吃什么，养活多少人？每多一级，就多损失一大截',
s4e:'这一步要回答：为什么同一块地，吃素能养活更多人？每人每年需要约 3,800,000 kJ（约 2500 kcal/天）。耕地每公顷每年能产出约 60,000,000 kJ 的可食能量。直接吃植物，一份能量只需要一份土地；吃肉的话，动物只把饲料的能量按转化效率变成肉，所以获得同样能量要种的饲料多得多。所需土地 = 需要的能量 × [(1 − 肉比例) + 肉比例 ÷ 转化效率] ÷ 产出。图中每个小点是一个人，表示 10 公顷耕地能养活的人数。',
s4o:'把肉比例从 0 拉到 100%，转化效率取 10%：点阵剧烈变稀；再把转化效率调到 20%：同样的肉比例下能多养活多少人？',
r4:'肉占饮食能量 {m}%，转化效率 {e}%：每人需耕地 {land} 公顷；10 公顷能养活约 {ppl} 人。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 生产者只固定入射阳光的约 1%；② 每传一级只剩约 10%，第 k 级 = 生产者 × 效率^(k−1)；③ 越往顶端，养活一只动物需要的面积越大，所以食物链很短、顶级捕食者稀少；④ 能量金字塔永远上小下大，个体数和生物量金字塔可能倒置；⑤ 越靠近食物链起点获取能量，同一块地养活的人越多。',
qq:'如果每次能量传递效率都是 10%，生产者的能量有多少能传到第 4 营养级（三级消费者）？',qo0:'10%',qo1:'0.1%',qo2:'1%',
qwhy:'第 2 级剩 10%，第 3 级 1%，第 4 级 0.1%（第 1 步：10%³ = 0.1%）。',
s5m:'本页是简化的教学模型：太阳能、效率和每只动物的能量需求都是示例的量级（真实值随生态系统差异很大）；统一的传递效率忽略了不同类群的差异；损失的 70% 呼吸/30% 分解者只是假设；第 3 步的数据是示例值，不是实测；第 4 步忽略了土地质量、牧场与农田的差别、动物的副产品和营养需求；金字塔上、下两级之间的“10%”只是常用的经验值，实际在 1%–20% 之间。',
lk0:'光合作用页：生产者怎样把光能固定成有机物',lk1:'种群生态学页：捕食者与猎物怎样互相制约'
},
en:{
pageTitle:'The Energy Pyramid · Why Top Predators Are Rare',tagline:'Sunlight\'s energy passes up level by level and only about a tenth survives each step; why top carnivores are rare and why a plant-based diet feeds more people can all be calculated.',
nav0:'0 Sunlight in',nav1:'1 Shrinking by level',nav2:'2 Room at the top',nav3:'3 Three pyramids',nav4:'4 Diet and people fed',nav5:'5 Recap & check',
lblSun:'Incoming sunlight (per m² per year)',lblFix:'Energy fixed by producers',lblHa:'Each square = 1 hectare of area needed (to keep 1 animal)',lblDots:'Each dot = one person (the number 10 hectares of cropland can feed)',pyr_n:'numbers',pyr_b:'biomass',pyr_p:'annual production (energy)',lEta:'Efficiency η of photosynthesis in turning sunlight into organic matter (%)',lEff:'Energy transfer efficiency between neighbouring levels (%)',lLevel:'Trophic level (1 = producers)',lMeat:'Share of dietary energy from meat (%)',lConv:'Efficiency of turning feed into meat (%)',eGrass:'Grassland',eForest:'Forest',eOcean:'Ocean',
s0t:'Energy enters from sunlight: producers catch only a small part',
s0e:'This step answers: how much energy is there at the start of a food chain? Green plants (the <strong>producers</strong>) use photosynthesis to fix a small part of the sunlight as organic matter, and this is the entire energy source of the food chain. Say each square metre receives 5,000,000 kJ of solar energy a year and producers fix a fraction η (commonly about 1%); the fixed energy is 5,000,000 × η. In the figure the long bar is the incoming sunlight and the short bar is the energy fixed; most of the rest is reflected, turned into heat or unused.',
s0o:'Move η from 0.2% to 3%: watch the short bar\'s length and compare with the fixed energy in the readout (kJ/m²/yr); think about why even tripling η leaves the producers with only a small part of the sunlight.',
r0:'Incoming sunlight {i} kJ/m²/yr; η = {eta}%: producers fix {p} kJ/m²/yr; {rest}% is not fixed.',
s1t:'Shrinking by level: each step up keeps only a small part',
s1e:'This step answers: as energy moves up the food chain, how much is left at each level? The trophic levels are producers (plants), primary consumers (herbivores), secondary consumers (carnivores that eat herbivores), tertiary consumers and so on. Of the energy a level eats from the one below, only part becomes its own body matter, the <strong>transfer efficiency</strong> (commonly about 10%); most of the rest is lost as heat by respiration, and some becomes uneaten remains and waste that goes to decomposers. With 1% of 5,000,000 kJ as the producers\' starting point, level k has producers\' energy × efficiency^(k−1). The bar widths below are proportional to energy.',
s1o:'Raise the transfer efficiency from 10% to 20% and see how much wider the top bar becomes; set it back to 5%; use the "trophic level" slider to pick a level and see where its energy goes: passed up, lost to respiration (taken as 70% of the loss) and to decomposers (30%).',
r1:'Level {l} ({name}) has {e} kJ/m²/yr: {tr} passed up, {resp} lost to respiration, {dec} to decomposers; level {n} keeps only {pct}% of the producers\' energy.',
lvl1:'producers',lvl2:'primary consumers',lvl3:'secondary consumers',lvl4:'tertiary consumers',lvl5:'quaternary consumers',lvl6:'quinary consumers',
s2t:'How much room at the top? The higher the level, the more area one animal needs',
s2e:'This step answers: why are top predators so few? Suppose a medium-sized carnivore needs 365,000 kJ of energy a year (about a fox). Level k has only E of energy per square metre per year, so the area to keep one animal = 365,000 ÷ E. The higher the level, the smaller E and the larger the area; at some level the area is so large that a territory holds very few animals, or not even one, which is why food chains seldom exceed 4–5 levels. Producer energy here is 50,000 kJ/m²/yr (η = 1%).',
s2o:'Move the trophic level from 1 to 6: watch the area needed (shown as squares, each a hectare = 10,000 m²) grow explosively; raise the transfer efficiency to 25% and see how much smaller the area at the same level becomes.',
r2:'Transfer efficiency {eff}%: energy available at level {l} is {e} kJ/m²/yr; keeping 1 animal needs {a} m² (about {ha} ha).',
s3t:'Three pyramids: energy is always upright, numbers and biomass can be inverted',
s3e:'This step answers: can a pyramid turn upside down? The <strong>pyramid of energy</strong> (energy flowing per year) is always narrow at the top because thermodynamics forbids energy growing as it passes on. But the <strong>pyramid of numbers</strong> (individuals) and the <strong>pyramid of biomass</strong> (mass of living matter at one moment) can be inverted: thousands of insects live on one tree (inverted numbers); in the sea, phytoplankton are small and turn over very fast, so at one moment their biomass can be below that of the zooplankton that eat them (inverted biomass). Annual production = standing biomass × turnover (how many times it is replaced per year). Pick an ecosystem and compare the three pyramids (illustrative data, widths on a logarithmic scale).',
s3o:'Pick grassland, forest and ocean in turn: count which pyramid looks inverted in which ecosystem, then check whether the annual production (energy) pyramid on the right is still narrow at the top.',
r3:'{eco}: numbers {n1}; biomass {n2}; annual production (energy) {n3}.',
inv:'inverted',upr:'narrow at the top',
s4t:'What you eat decides how many people can be fed: every extra level loses a lot',
s4e:'This step answers: why does a plant-based diet feed more people from the same land? A person needs about 3,800,000 kJ a year (about 2500 kcal a day). A hectare of cropland yields about 60,000,000 kJ of edible energy a year. Eating plants directly takes one unit of land per unit of energy; eating meat, the animals turn only a fraction of their feed energy (the conversion efficiency) into meat, so much more feed must be grown for the same energy. Land needed = energy required × [(1 − meat share) + meat share ÷ conversion efficiency] ÷ yield. Each dot in the figure is a person, the number fed by 10 hectares of cropland.',
s4o:'Raise the meat share from 0 to 100% with a 10% conversion efficiency: the dot grid thins sharply; then set the conversion efficiency to 20%: how many more people can be fed at the same meat share?',
r4:'With {m}% of dietary energy from meat and {e}% conversion efficiency: {land} ha of cropland per person; 10 hectares feed about {ppl} people.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) producers fix only about 1% of the incoming sunlight; (2) each step up keeps about 10%, so level k = producers × efficiency^(k−1); (3) the higher the level, the more area one animal needs, which is why food chains are short and top predators rare; (4) the energy pyramid is always narrow at the top while numbers and biomass pyramids can be inverted; (5) the nearer to the start of the food chain you take your energy, the more people the same land feeds.',
qq:'If every energy transfer is 10% efficient, how much of the producers\' energy reaches the 4th trophic level (tertiary consumers)?',qo0:'10%',qo1:'0.1%',qo2:'1%',
qwhy:'Level 2 keeps 10%, level 3 1%, level 4 0.1% (step 1: 10%³ = 0.1%).',
s5m:'This is a simplified teaching model: the solar energy, the efficiencies and the energy need per animal are example magnitudes (real values differ widely between ecosystems); one common transfer efficiency ignores differences between groups; the 70% respiration / 30% decomposer split of the loss is an assumption; the data in step 3 are illustrative, not measurements; step 4 ignores land quality, the difference between pasture and cropland, animal by-products and nutritional needs; the "10%" between levels is just a rule of thumb and real values range from 1% to 20%.',
lk0:'Photosynthesis: how producers fix light energy into organic matter',lk1:'Population ecology: how predators and prey limit each other'
}};

/* shared runtime: merged page dictionary, language state, t() */
const COMMON={
zh:{back:'← 知识索引',langLabel:'语言',navLabel:'步骤导航',stepWord:'第 {n} 步',obsLab:'观察任务：',quizT:'自测：用这一页的模型来预测',qRight:'答对了。',qWrong:'还不对，回到上面的第 {n} 步再试试。',linksT:'继续探索（站内深链）',modelT:'模型范围与失配',recapT:'回顾',run:'播放',pause:'暂停',foot:'由 Claude Sonnet 5.5（经 Mini Claude Code）生成的教学页 · 尚未经独立评审 · 教学简化模型，不用于工程或医疗决策',cat_physics:'物理与电路',cat_chemistry:'化学',cat_biology:'生物',cat_math:'数学基础',cat_probability:'概率与统计',cat_computing:'计算与智能',stage_junior:'初中',stage_senior:'高中',stage_university:'大学',canvasLabel:'示意画布：{title}'},
en:{back:'← Knowledge Index',langLabel:'Language',navLabel:'Step navigation',stepWord:'Step {n}',obsLab:'Observation task: ',quizT:'Self-check: predict with this page\'s model',qRight:'Correct.',qWrong:'Not quite. Go back to step {n} and try it.',linksT:'Keep exploring (deep links)',modelT:'Model scope and mismatch',recapT:'Recap',run:'Play',pause:'Pause',foot:'Built by Claude Sonnet 5.5 via Mini Claude Code · not yet independently reviewed · simplified teaching model, not for engineering or medical decisions',cat_physics:'Physics & Circuits',cat_chemistry:'Chemistry',cat_biology:'Biology',cat_math:'Mathematical Foundations',cat_probability:'Probability & Statistics',cat_computing:'Computing & AI',stage_junior:'Junior High',stage_senior:'Senior High',stage_university:'University',canvasLabel:'Diagram: {title}'}};
for(const l of ['zh','en'])Object.assign(STR[l],COMMON[l]);
let LANG='zh',_memLang=null;
function getLang(){let s=null;try{s=localStorage.getItem('knowledge-lang')}catch(e){}if(s==='zh'||s==='en')return s;if(_memLang)return _memLang;let n='';try{n=(navigator.language||'').toLowerCase()}catch(e){}return n.indexOf('zh')===0?'zh':'en'}
function setLang(l){_memLang=l;try{localStorage.setItem('knowledge-lang',l)}catch(e){}}
function t(k,p){const d=STR[LANG]||STR.en;let s=d[k];if(s==null)return k;return s.replace(/\{(\w+)\}/g,function(m,n){return p&&n in p?p[n]:m})}
function applyLang(l){
  LANG=l==='en'?'en':'zh';setLang(LANG);
  if(typeof document==='undefined')return;
  document.documentElement.lang=LANG==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-i18n]').forEach(function(e){e.textContent=t(e.dataset.i18n,e.dataset.p?JSON.parse(e.dataset.p):null)});
  document.querySelectorAll('[data-i18n-html]').forEach(function(e){e.innerHTML=t(e.dataset.i18nHtml)});
  document.querySelectorAll('[data-i18n-aria]').forEach(function(e){e.setAttribute('aria-label',t(e.dataset.i18nAria))});
  document.querySelectorAll('#langToggle button').forEach(function(b){const on=b.dataset.lang===LANG;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  document.title=t('pageTitle');
}
if(typeof module!=='undefined')module.exports={STR:STR};
