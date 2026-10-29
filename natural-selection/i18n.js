const STR={
zh:{
pageTitle:'自然选择 · 胡椒蛾的颜色为什么翻转',tagline:'同一种蛾有浅色和深色两种；鸟看得见的先被吃掉，剩下的繁殖——树皮颜色一变，几代之后种群的颜色比例就跟着翻转。',
nav0:'0 谁被吃掉',nav1:'1 几代之后',nav2:'2 选择有多强',nav3:'3 环境在变',nav4:'4 偶然 vs 选择',nav5:'5 回顾自测',
lblGen:'世代',lblBark:'灰线：树皮深浅 b',lblDark:'橙线：深色蛾比例 p',lBark:'树皮的深浅（0 浅 ~ 1 深）',lP0:'起始时深色蛾的比例',lK:'捕食强度 k（被看见的蛾被吃掉的最大概率）',lGen:'世代',lLogN:'种群大小 N = 10^x',bHunt:'让鸟捕食一轮',bRestore:'重置：恢复 60 只蛾',bPlay:'播放 / 暂停',bReset:'重置：回到第 0 代',bNewPops:'再随机跑 5 个群体',
s0t:'鸟只吃它看得见的：颜色决定存活率',
s0e:'这一步要回答：为什么环境会改变哪些个体活下来？同一种蛾有两种可遗传的颜色：浅色和深色。鸟靠视觉捕食，和树皮反差越大的蛾越容易被发现。设树皮深浅为 b（0 是浅色，1 是全黑）。浅色蛾的存活概率 w浅 = 1 − k·b，深色蛾 w深 = 1 − k·(1 − b)，k = 0.5 是鸟的捕食强度（被完全看见时被吃掉的概率）。点“让鸟捕食一轮”：每只蛾按各自的存活概率随机存活。',
s0o:'先把树皮调浅（b = 0.2）捕食几轮（每轮前点重置）：浅色蛾存活更多；再把树皮调深（b = 0.9）：结果颠倒；对照读数里的实测存活率与公式值（随机，会有偏差）。',
r0:'树皮 b = {b}：浅色蛾 {n1}/{t1} 存活（{s1}%，公式 {e1}%），深色蛾 {n2}/{t2} 存活（{s2}%，公式 {e2}%）。',
notYet:'尚未捕食',
s1t:'世代更替：存活的繁殖，颜色比例逐代改变',
s1e:'这一步要回答：捕食的差别怎样累积成种群的变化？每一代：先被捕食（按上面的存活概率），存活的蛾繁殖，子代保持父母的颜色（颜色可遗传），种群补回 200 只。深色比例 p 的变化：p′ = p·w深 / (p·w深 + (1 − p)·w浅)。点播放，每次一代，折线累积深色比例的变化；虚线是不考虑随机性的理论值（200 只的种群，随机性仍会让实线上下抖动）。',
s1o:'树皮深（b = 0.9）、起始深色蛾 10%：看深色比例几代内升到接近 100%；把树皮调浅（b = 0.1）重新播放：比例下降；b = 0.5 时双方一样，比例只随机晃动。',
r1:'第 {g} 代：深色蛾 {n} 只 / {N}，比例 {p}%；理论预测 {pt}%。',
s2t:'选择有多强？每代的优势比决定快慢',
s2e:'这一步要回答：颜色比例变化的快慢由什么决定？每代深色相对浅色的优势比 r = w深 / w浅。深色比例 p 的“对数几率” logit(p) = ln(p/(1 − p)) 每代恰好增加 ln r，所以从 p₀ 到 p 需要的代数 = [logit(p) − logit(p₀)] / ln r。优势比越大，变化越快。图中橙线是当前设置的深色比例曲线（从 1% 开始），读数给出升到 50% 和 90% 所需的代数。',
s2o:'把树皮从 0.5 调到 1：优势比从 1 增大，所需代数急剧缩短；把捕食强度 k 加大，同样效果；b = 0.5 时 r = 1，永远不变。',
r2:'w浅 = {wl}，w深 = {wd}，优势比 r = {r}：从 1% 升到 50% 需 {t50} 代，升到 90% 需 {t90} 代。',
never:'永远不会（r ≤ 1）',
s3t:'环境在变：种群的颜色跟着变，但有滞后',
s3e:'这一步要回答：环境变化时选择怎样跟上？以工业革命为例：树皮因烟尘熏黑，之后空气变清洁又变浅。树皮深浅随世代变化（灰线：先在 0.4，第 10–40 代升到 0.9，第 60–90 代降到 0.15），深色蛾比例（橙线）每代按上一步的公式更新（另加每代 0.1% 的个体因突变变成另一种颜色，两个方向都有，使稀有颜色不会彻底消失），起始 2%（b = 0.5 时两种颜色同样有利，b 越过 0.5 选择方向才反转）。拖动世代滑块，圆点沿两条曲线移动。你会看到种群的变化总是落后于环境的变化，因为每一代只能改变一部分。',
s3o:'拖动世代从 0 到 110：对照读数：树皮越过 0.5 之后，深色蛾比例又过了多少代才越过 50%；下降时同样比较；把捕食强度 k 加大，滞后缩短。',
r3:'第 {g} 代：树皮 b = {b}，深色蛾比例 {p}%；树皮在第 {bu} 代升过 0.5、第 {bd} 代降到 0.5 以下；深色蛾比例在第 {up} 代升过 50%、第 {dn} 代降到 50% 以下。',
s4t:'偶然 vs 选择：小种群里，没有选择也会“漂变”',
s4e:'这一步要回答：颜色比例的变化一定是选择造成的吗？不一定。每代从上一代随机抽 N 个后代，即使两种颜色同样适应（没有选择，起始各 50%），比例也会随机涨落，这叫<strong>遗传漂变</strong>；种群越小，涨落越大，甚至一种颜色会完全消失（<strong>固定</strong>）。单代抽样的方差是 p(1 − p)/N。图中是 5 个互相独立的种群 100 代的轨迹。读数用 40 个重复统计第 100 代时比例的标准差，并与理论值对比。',
s4o:'把 N 从 10 增大到 1000：轨迹从剧烈乱窜到几乎一条水平线；统计里“已固定”的个数减少；点“再随机跑 5 个群体”换一批轨迹，比较。',
r4:'N = {N}：这 5 个群体中第 100 代已固定（0 或 100%）的有 {fx} 个；40 个重复的 100 代后比例标准差 {sd}，理论 ≈ {th}。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 个体有可遗传的差异（浅色与深色）；② 环境（鸟、树皮）使不同个体的存活率不同；③ 存活的繁殖，种群的比例逐代改变，logit(p) 每代增加 ln(w深/w浅)；④ 选择越强变化越快，环境改变时种群的变化会滞后；⑤ 小种群里即使没有选择，偶然也会让比例漂变。',
qq:'树皮被烟尘熏黑后，深色蛾为什么变多？',qo0:'浅色蛾为了躲避鸟，把自己变成了深色',qo1:'深色蛾被吃掉的概率更低，存活并繁殖得更多，把深色遗传给后代',qo2:'鸟偏爱吃浅色的蛾，把深色蛾赶了回来',
qwhy:'变化发生在种群层面：个体的颜色不变，不同颜色的个体存活、繁殖的机会不同，深色比例逐代上升（第 1 步）。',
s5m:'本页是教学模型：只有两种颜色，颜色由单基因（单倍体，不分显隐）决定且忠实遗传，没有迁入迁出和雌雄配对（第 3 步只加入固定的 0.1% 双向突变）；存活概率 w 取简单线性式，固定世代、种群大小恒定；第 3 步的树皮曲线是示意，不是实测数据；真实的胡椒蛾研究（Kettlewell 等）的结论还受到鸟的取食行为、蛾的栖息位置等因素的争议和修正；漂变用标准的“随机抽样”模型（Wright–Fisher）。',
lk0:'DNA 复制与翻译页：突变是新颜色变异的来源',lk1:'遗传与概率页：基因和等位基因怎样传给后代',lk2:'种群生态学页：种群数量怎样受资源和捕食限制'
},
en:{
pageTitle:'Natural Selection · Why the Peppered Moth Flipped Colour',tagline:'One species of moth comes in light and dark forms; birds eat what they can see, the survivors breed, and when the bark colour changes the colour ratio flips within a few generations.',
nav0:'0 Who gets eaten',nav1:'1 A few generations on',nav2:'2 How strong',nav3:'3 A changing world',nav4:'4 Chance vs selection',nav5:'5 Recap & check',
lblGen:'generation',lblBark:'grey: bark darkness b',lblDark:'orange: dark share p',lBark:'Bark darkness (0 pale to 1 dark)',lP0:'Starting share of dark moths',lK:'Predation strength k (largest chance that a fully visible moth is eaten)',lGen:'Generation',lLogN:'Population size N = 10^x',bHunt:'Let the birds hunt one round',bRestore:'Reset: restore the 60 moths',bPlay:'Play / Pause',bReset:'Reset: back to generation 0',bNewPops:'Run 5 new random populations',
s0t:'Birds eat only what they can see: colour decides survival',
s0e:'This step answers: why does the environment decide which individuals survive? The moth has two heritable colours: light and dark. Birds hunt by sight, and the more a moth contrasts with the bark the easier it is to spot. Let the bark darkness be b (0 is pale, 1 is black). A light moth survives with probability w_light = 1 − k·b and a dark moth with w_dark = 1 − k·(1 − b), with k = 0.5 the predation strength (the chance of being eaten when fully visible). Press "let the birds hunt one round": each moth survives at random with its own survival probability.',
s0o:'Set the bark pale first (b = 0.2) and hunt a few rounds (resetting before each): light moths survive better; then set the bark dark (b = 0.9): the result reverses; compare the measured survival rates in the readout with the formula values (random, so they deviate).',
r0:'Bark b = {b}: light moths {n1}/{t1} survived ({s1}%, formula {e1}%), dark moths {n2}/{t2} survived ({s2}%, formula {e2}%).',
notYet:'not hunted yet',
s1t:'Generation after generation: the survivors breed and the colour ratio shifts',
s1e:'This step answers: how do survival differences add up to change in a population? Each generation: first predation (with the survival probabilities above), then the survivors breed and offspring keep their parents\' colour (colour is heritable), and the population is topped back up to 200. The dark share p changes as p′ = p·w_dark / (p·w_dark + (1 − p)·w_light). Press play, one generation at a time; the line tallies the dark share, and the dashed line is the no-randomness theory (with 200 moths the solid line still wobbles).',
s1o:'With dark bark (b = 0.9) and 10% dark moths to start, watch the dark share climb toward 100% in a few generations; set pale bark (b = 0.1) and replay: the share falls; at b = 0.5 both do equally well and the share just wanders at random.',
r1:'Generation {g}: {n} of {N} are dark, share {p}%; theory predicts {pt}%.',
s2t:'How strong is the selection? The per-generation advantage sets the speed',
s2e:'This step answers: what decides how fast the colour ratio changes? Each generation dark has an advantage ratio r = w_dark / w_light over light. The log-odds of the dark share, logit(p) = ln(p/(1 − p)), rises by exactly ln r per generation, so going from p₀ to p takes [logit(p) − logit(p₀)] / ln r generations. The bigger the ratio the faster the change. The orange line is the dark-share curve for the current settings (starting at 1%) and the readout gives the generations needed to reach 50% and 90%.',
s2o:'Move the bark from 0.5 to 1: r grows from 1 and the generations needed fall sharply; raise the predation strength k for the same effect; at b = 0.5, r = 1 and nothing ever changes.',
r2:'w_light = {wl}, w_dark = {wd}, advantage ratio r = {r}: 1% to 50% takes {t50} generations and to 90% takes {t90}.',
never:'never (r ≤ 1)',
s3t:'A changing world: the population follows, but with a lag',
s3e:'This step answers: when the environment changes, how does selection keep up? Take the industrial revolution: soot blackened the bark, and later cleaner air made it pale again. The bark darkness varies by generation (grey line: 0.4 at first, rising to 0.9 over generations 10–40, falling to 0.15 over generations 60–90) and the dark share (orange line) updates each generation by the formula of the last step (plus 0.1% of individuals changing to the other colour by mutation each generation, in both directions, so a rare colour never vanishes completely), starting at 2% (at b = 0.5 both colours do equally well, and selection reverses only once b crosses 0.5). Drag the generation slider and the dot moves along both curves. You will see the population always trails the environment, since each generation can change only part of the way.',
s3o:'Drag the generation from 0 to 110: use the readout to see how many generations after the bark crosses 0.5 the dark share crosses 50%, and likewise on the way down; raise the predation strength k and the lag shortens.',
r3:'Generation {g}: bark b = {b}, dark share {p}%; the bark rises past 0.5 at generation {bu} and falls below it at {bd}; the dark share rises past 50% at generation {up} and falls below it at {dn}.',
s4t:'Chance vs selection: in small populations the ratio drifts even with no selection',
s4e:'This step answers: is a change in the colour ratio always caused by selection? No. Each generation draws N offspring at random from the previous one; even when both colours are equally fit (no selection, 50% each at the start) the ratio fluctuates by chance, which is <strong>genetic drift</strong>; the smaller the population the larger the fluctuation, and one colour can vanish altogether (<strong>fixation</strong>). The variance of one generation\'s sampling is p(1 − p)/N. The plot shows the 100-generation trajectories of 5 independent populations. The readout uses 40 repeats to find the standard deviation of the share at generation 100 and compares it with theory.',
s4o:'Increase N from 10 to 1000: the paths go from wild to almost flat; the number "fixed" in the statistics falls; press "run 5 new random populations" for a fresh batch and compare.',
r4:'N = {N}: of these 5 populations {fx} have fixed (0 or 100%) by generation 100; over 40 repeats the standard deviation of the share after 100 generations is {sd}, theory ≈ {th}.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) individuals differ in a heritable way (light and dark); (2) the environment (birds, bark) gives different individuals different survival; (3) survivors breed and the ratio shifts generation by generation, with logit(p) rising by ln(w_dark/w_light) each generation; (4) stronger selection means faster change, and a population lags a changing environment; (5) in small populations chance alone can make the ratio drift even without selection.',
qq:'After soot blackened the bark, why did dark moths become more common?',qo0:'Light moths turned themselves dark to hide from birds',qo1:'Dark moths were less likely to be eaten, survived and bred more, and passed on their dark colour',qo2:'Birds preferred light moths and drove the dark ones back',
qwhy:'The change happens at the population level: no individual changes colour, but different colours have different chances to survive and breed, so the dark share rises generation by generation (step 1).',
s5m:'This is a teaching model: just two colours, set by a single haploid gene (no dominance) and inherited faithfully, with no migration or mating (step 3 only adds a fixed 0.1% two-way mutation); survival w is a simple linear formula with fixed generations and constant population size; the bark curve in step 3 is a sketch, not measured data; the real peppered-moth studies (Kettlewell and others) have been debated and revised for effects such as bird feeding behaviour and where moths rest; drift uses the standard random-sampling (Wright–Fisher) model.',
lk0:'DNA replication and translation: mutation is the source of new colour variants',lk1:'Genetics & probability: how genes and alleles pass to offspring',lk2:'Population ecology: how population size is limited by resources and predation'
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
