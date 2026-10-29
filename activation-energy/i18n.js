const STR={
zh:{
pageTitle:'活化能 · 反应要翻过的那座山',tagline:'反应物要先爬上一座能量山才能变成生成物：山多高、有多少分子爬得上去，决定了反应有多快。',
nav0:'0 能量山',nav1:'1 谁爬得上去',nav2:'2 阿伦尼乌斯',nav3:'3 催化剂',nav4:'4 逆反应与平衡',nav5:'5 回顾自测',
lEa:'活化能 Eₐ（kJ/mol）',lDh:'反应热 ΔH（kJ/mol）',lE:'分子的能量 E（kJ/mol）',lT:'温度 T（K）',lDea:'催化剂降低的活化能（kJ/mol）',bLaunch:'让分子带着能量 E 出发',bReset:'重置：分子回到起点',bAdd:'记录一个数据点 (1/T, ln k)',bClear:'清除全部数据点',
s0t:'反应像翻山：先上坡，再下到生成物',
s0e:'这一步要回答：为什么有些反应物“一碰就反应”，有些却要加热才动？图的横轴是反应进程（从反应物到生成物），纵轴是体系的能量（kJ/mol）。反应物位于左边低处，生成物在右边，中间有一座山，山顶比反应物高出的能量就是<strong>活化能</strong> Eₐ；生成物与反应物的能量差是<strong>反应热</strong> ΔH（负值为放热，生成物更低）。让一个分子带着能量 E 出发：E ≥ Eₐ 才能翻过山顶，否则就被推回来。小球的运动按能量守恒（动能 = E − 当前位置的势能）计算。',
s0o:'固定 Eₐ = 90，把 E 从 62 调到 97 再点“出发”：小球在 E < Eₐ 时爬到半山腰折返，E ≥ Eₐ 时翻过山顶；再改 ΔH，看终点高低变化但山顶位置（Eₐ）不变。',
r0:'Eₐ = {ea} kJ/mol，ΔH = {dh} kJ/mol（{kind}）；分子能量 E = {e} kJ/mol：{res}；逆反应活化能 Eₐ′ = Eₐ − ΔH = {er} kJ/mol。',
axisProg:'反应进程',kExo:'放热反应',kEndo:'吸热反应',kZero:'热效应为零',resPass:'E ≥ Eₐ，翻过山顶，生成了产物',resBack:'E < Eₐ，爬到半山腰折返，没有反应',resIdle:'还没出发',
s1t:'谁能爬上去？只有分子群里能量最高的一小部分',
s1e:'这一步要回答：同一温度下，分子能量参差不齐，有多少够得上 Eₐ？在温度 T 下，能量大于 E 的分子比例按玻尔兹曼因子下降：比例(≥E) = e^(−E/RT)（R = 8.314×10⁻³ kJ/(mol·K)，是气体常数；RT 是热运动的能量尺度，300 K 时约 2.5 kJ/mol）。图的纵轴是对数坐标：比例(≥E) 是一条直线，温度越高越平。竖线是 Eₐ，它与直线交点的高度就是能反应的分子比例。灰线是 300 K 的参考。',
s1o:'固定 Eₐ = 60，把 T 从 300 K 升到 350 K：看交点上移了几个数量级，对照读数里的比例变化倍数；再把 Eₐ 加到 100，比较同样升温带来的倍数变化。',
r1:'T = {t} K：RT = {rt} kJ/mol；能量 ≥ Eₐ 的分子比例 e^(−Eₐ/RT) = {frac}；相比 300 K（{f300}）是 {ratio} 倍。',
s2t:'阿伦尼乌斯：速率常数随温度指数增长',
s2e:'这一步要回答：温度每升高一点，反应快多少？只有爬得上去的分子才反应，速率常数 k = A·e^(−Eₐ/RT)（A 是碰撞频率相关的常数，本页取 A = 10¹³ s⁻¹ 量级的相对值 1）。左图是 k 随 T 的曲线（相对于 300 K 的倍数）；右图把 ln k 对 1/T 作图，是一条斜率为 −Eₐ/R 的直线（阿伦尼乌斯图）。点“记录”会把当前 T 下的 ln k 加上 ±2% 的模拟测量误差作为一个数据点；用几个点拟合斜率就能反推 Eₐ。',
s2o:'固定 Eₐ，在 300–420 K 间记录至少 4 个不同 T 的点，看拟合的 Eₐ 是否接近滑块设定值；再改 Eₐ，看直线变陡；读数里的“升温 10 K 倍数”在 300 K 附近大约是几倍？',
r2:'T = {t} K：k/k₃₀₀ = {kr}；升温 10 K 后 k 变为 {x10} 倍；已记录 {n} 个点，拟合 Eₐ ≈ {efit} kJ/mol（设定 {ea} kJ/mol）。',
needMore:'至少 2 个点才能拟合',
s3t:'催化剂：把山挖矮，但不改终点',
s3e:'这一步要回答：催化剂怎样让反应变快？催化剂给反应换了一条路径，山顶变低（Eₐ 减小），但反应物和生成物的能量没变（ΔH 不变）。k = A·e^(−Eₐ/RT) 中指数变小，k 变大：加速倍数 = e^(ΔEₐ/RT)。逆反应的山也同样变矮，同样加快同样的倍数，所以催化剂不改变平衡位置（只是更快达到）。灰线是无催化剂的路径，彩线是有催化剂的路径。',
s3o:'把“降低的活化能”从 0 拉到 40：山峰降低而两端不动；看加速倍数怎样随之放大；把 T 升高，同样的催化剂的加速倍数是变大还是变小？',
r3:'降低 ΔEₐ = {d} kJ/mol，T = {t} K：正、逆反应都加速 {sp} 倍；平衡常数比（有催化剂/无催化剂）= {kr}。',
s4t:'逆反应也要翻山：山高不同，快慢不同',
s4e:'这一步要回答：同一座山，从生成物翻回去有多难？逆反应的活化能 Eₐ′ = Eₐ − ΔH。正、逆反应速率常数之比 k正/k逆 = e^(−ΔH/RT)（本页取两者 A 相同，等于忽略熵的贡献，只是教学简化）。放热反应（ΔH < 0）逆反应更难，所以 k正 > k逆；吸热则相反。升高温度使这个比值向 1 靠近。图中两根柱是 k正 与 k逆（对数坐标）。',
s4o:'把 ΔH 从 −50 调到 +50：k正 柱从高于变成低于 k逆 柱；固定 ΔH，把 T 升高：两柱的差距缩小，对照读数里的比值。',
r4:'Eₐ = {ea}，Eₐ′ = {er} kJ/mol，T = {t} K：k正 = {kf}，k逆 = {kb}（相对值）；k正/k逆 = {ratio}。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 反应物要翻过能量山，山顶比反应物高出的能量是 Eₐ；② 温度下，能量 ≥ Eₐ 的分子比例是 e^(−Eₐ/RT)；③ k = A·e^(−Eₐ/RT)，ln k–1/T 是斜率 −Eₐ/R 的直线；④ 催化剂降低 Eₐ，正逆反应同样加速，不改变 ΔH 和平衡位置；⑤ 逆反应活化能是 Eₐ − ΔH。',
qq:'一个 Eₐ = 50 kJ/mol 的反应在室温附近（300 K）升温 10 K，速率大约变成多少倍？',qo0:'约 1.1 倍',qo1:'约 2 倍',qo2:'约 100 倍',
qwhy:'k 的倍数 = e^((Eₐ/R)(1/300 − 1/310)) ≈ 1.9（第 2 步读数里“升温 10 K 倍数”可验证）。',
s5m:'本页用玻尔兹曼因子和阿伦尼乌斯公式的最简形式：只考虑能量足够，忽略碰撞取向因子、量子隧穿、A 随温度的变化与多步反应；能量分布取指数形式（自由度简化）；ΔH 与 Eₐ 在不同温度下视为常数；A 相同等于忽略熵；第 2 步的测量误差是人为加入的；第 0 步小球是能量守恒的教学示意，不是真实分子轨迹。',
lk0:'反应速率页：从碰撞角度看催化剂如何让更多碰撞成功',lk1:'化学平衡页：升温为什么使平衡移动，与这里 k正/k逆 的比值相联系',lk2:'反应速率页：同一件事的温度一节，用粒子碰撞数来数'
},
en:{
pageTitle:'Activation Energy · The Hill a Reaction Has to Climb',tagline:'Reactants must climb an energy hill before they become products: how high the hill is, and how many molecules can climb it, decides how fast the reaction goes.',
nav0:'0 The hill',nav1:'1 Who can climb',nav2:'2 Arrhenius',nav3:'3 Catalysts',nav4:'4 Reverse reaction',nav5:'5 Recap & check',
lEa:'Activation energy Eₐ (kJ/mol)',lDh:'Reaction enthalpy ΔH (kJ/mol)',lE:'Molecule\'s energy E (kJ/mol)',lT:'Temperature T (K)',lDea:'Activation energy lowered by the catalyst (kJ/mol)',bLaunch:'Launch a molecule with energy E',bReset:'Reset: molecule back at the start',bAdd:'Record a data point (1/T, ln k)',bClear:'Clear all data points',
s0t:'A reaction is a hill climb: up first, then down to the products',
s0e:'This step answers: why do some reactants react on contact while others need heating? The horizontal axis is reaction progress (from reactants to products) and the vertical axis is the system\'s energy (kJ/mol). Reactants sit low on the left, products on the right, and a hill lies between them; the height of the top above the reactants is the <strong>activation energy</strong> Eₐ, and the energy difference between products and reactants is the <strong>reaction enthalpy</strong> ΔH (negative means heat is released and the products are lower). Launch a molecule with energy E: it gets over the top only if E ≥ Eₐ, otherwise it is turned back. The ball moves by energy conservation (kinetic energy = E − potential energy at its position).',
s0o:'With Eₐ = 90, raise E from 62 to 97 and press launch: for E < Eₐ the ball turns back partway up, for E ≥ Eₐ it goes over the top; then change ΔH and see the end level move while the summit (Eₐ) stays put.',
r0:'Eₐ = {ea} kJ/mol, ΔH = {dh} kJ/mol ({kind}); molecule energy E = {e} kJ/mol: {res}; reverse activation energy Eₐ′ = Eₐ − ΔH = {er} kJ/mol.',
axisProg:'reaction progress',kExo:'exothermic',kEndo:'endothermic',kZero:'no net heat',resPass:'E ≥ Eₐ: over the top, products formed',resBack:'E < Eₐ: turned back partway up, no reaction',resIdle:'not launched yet',
s1t:'Who can climb? Only the high-energy few in the crowd of molecules',
s1e:'This step answers: at a given temperature molecules have a spread of energies, so how many reach Eₐ? At temperature T the fraction of molecules with energy above E falls by the Boltzmann factor: fraction(≥E) = e^(−E/RT) (R = 8.314×10⁻³ kJ/(mol·K) is the gas constant; RT is the scale of thermal energy, about 2.5 kJ/mol at 300 K). The vertical axis is logarithmic, so fraction(≥E) is a straight line, flatter at higher temperature. The vertical bar is Eₐ and the height where it meets the line is the fraction of molecules able to react. The grey line is the 300 K reference.',
s1o:'With Eₐ = 60, raise T from 300 K to 350 K: the crossing point rises by several orders of magnitude, matching the fold change in the readout; then raise Eₐ to 100 and compare the fold change from the same warming.',
r1:'T = {t} K: RT = {rt} kJ/mol; fraction with energy ≥ Eₐ, e^(−Eₐ/RT) = {frac}; compared with 300 K ({f300}) that is {ratio}×.',
s2t:'Arrhenius: the rate constant grows exponentially with temperature',
s2e:'This step answers: how much faster does the reaction get per degree of warming? Only molecules that can climb react, so the rate constant is k = A·e^(−Eₐ/RT) (A is a constant tied to collision frequency; this page uses a relative value A = 1). The left plot is k against T (as a multiple of its value at 300 K); the right plot is ln k against 1/T, a straight line of slope −Eₐ/R (an Arrhenius plot). Record adds the ln k at the current T with ±2% simulated measurement error as a data point; fit the slope through a few points to recover Eₐ.',
s2o:'With Eₐ fixed, record at least 4 points at different T between 300 and 420 K and see whether the fitted Eₐ is close to the slider value; change Eₐ and watch the line steepen; roughly how many times faster is the reaction per 10 K near 300 K, according to the readout?',
r2:'T = {t} K: k/k₃₀₀ = {kr}; after a 10 K rise k becomes {x10}×; {n} points recorded, fitted Eₐ ≈ {efit} kJ/mol (set {ea} kJ/mol).',
needMore:'at least 2 points are needed to fit',
s3t:'A catalyst: dig the hill down, leave the endpoints alone',
s3e:'This step answers: how does a catalyst speed a reaction up? A catalyst gives the reaction a different path with a lower summit (smaller Eₐ), while the reactants\' and products\' energies stay the same (ΔH unchanged). In k = A·e^(−Eₐ/RT) the exponent shrinks, so k grows by a factor e^(ΔEₐ/RT). The reverse hill is lowered by the same amount, so the reverse reaction speeds up by the same factor and the catalyst does not shift the equilibrium (it only gets there sooner). Grey is the uncatalysed path and colour is the catalysed one.',
s3o:'Raise the "activation energy lowered" from 0 to 40: the summit drops while the endpoints stay; watch the speed-up factor grow; raise T: does the same catalyst give a bigger or a smaller speed-up?',
r3:'Lowering Eₐ by {d} kJ/mol at T = {t} K speeds both forward and reverse reactions {sp}×; equilibrium-constant ratio (catalysed / uncatalysed) = {kr}.',
s4t:'The reverse reaction has to climb too: different heights, different speeds',
s4e:'This step answers: starting from the products, how hard is the way back over the same hill? The reverse activation energy is Eₐ′ = Eₐ − ΔH. The ratio of the forward and reverse rate constants is k_f/k_r = e^(−ΔH/RT) (this page takes the same A for both, which ignores entropy; a teaching simplification). For an exothermic reaction (ΔH < 0) the way back is harder, so k_f > k_r; endothermic is the opposite. Raising T pulls the ratio toward 1. The two bars are k_f and k_r (logarithmic axis).',
s4o:'Move ΔH from −50 to +50: the k_f bar goes from above to below the k_r bar; at a fixed ΔH raise T and the gap between the bars shrinks; compare with the ratio in the readout.',
r4:'Eₐ = {ea}, Eₐ′ = {er} kJ/mol, T = {t} K: k_f = {kf}, k_r = {kb} (relative values); k_f/k_r = {ratio}.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) reactants must climb an energy hill, and the summit\'s height above the reactants is Eₐ; (2) at temperature T the fraction of molecules with energy ≥ Eₐ is e^(−Eₐ/RT); (3) k = A·e^(−Eₐ/RT), and ln k against 1/T is a line of slope −Eₐ/R; (4) a catalyst lowers Eₐ, speeds forward and reverse alike, and leaves ΔH and the equilibrium position unchanged; (5) the reverse activation energy is Eₐ − ΔH.',
qq:'A reaction with Eₐ = 50 kJ/mol near room temperature (300 K) is warmed by 10 K. By about what factor does its rate rise?',qo0:'About 1.1×',qo1:'About 2×',qo2:'About 100×',
qwhy:'The factor is e^((Eₐ/R)(1/300 − 1/310)) ≈ 1.9 (check the "10 K rise" figure in step 2).',
s5m:'This page uses the simplest form of the Boltzmann factor and the Arrhenius equation: it counts only energy sufficiency and ignores collision orientation factors, quantum tunnelling, the temperature dependence of A, and multi-step reactions; the energy distribution is taken as exponential (a simplification of the degrees of freedom); ΔH and Eₐ are treated as constant with temperature; equal A for forward and reverse ignores entropy; the measurement error in step 2 is artificial; the ball in step 0 is an energy-conserving teaching sketch, not a real molecular trajectory.',
lk0:'Reaction rates: see from the collision side how a catalyst lets more collisions succeed',lk1:'Chemical equilibrium: why warming shifts an equilibrium, linked to the k_f/k_r ratio here',lk2:'Reaction rates: the temperature step of the same story, counted in particle collisions'
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
