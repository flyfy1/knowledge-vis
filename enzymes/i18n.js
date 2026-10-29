const STR={
zh:{
pageTitle:'酶 · 生物体内的催化剂',tagline:'酶用一个形状合适的“口袋”把底物拉到一起，让反应在体温下就能飞快进行：从锁钥配合，到饱和、温度、pH 和抑制剂。',
nav0:'0 锁钥配合',nav1:'1 饱和',nav2:'2 温度',nav3:'3 pH',nav4:'4 抑制剂',nav5:'5 回顾自测',
sMatch:'底物：形状吻合（三角形）',sNear:'底物：形状接近（梯形）',sMiss:'底物：形状不合（圆形）',bPlay:'播放 / 暂停',bReset:'重置：清空产物计数',lS:'底物浓度 [S]（mM）',lKm:'米氏常数 Kₘ（mM）',lE:'酶的量 [E]（相对）',lT:'温度 T（°C）',lPh:'溶液 pH',ePepsin:'胃蛋白酶（胃里）',eAmylase:'唾液淀粉酶（口腔）',eTrypsin:'胰蛋白酶（小肠）',lI:'抑制剂浓度 [I]（mM）',iComp:'竞争性抑制剂',iNon:'非竞争性抑制剂',
s0t:'酶只认形状合适的底物',
s0e:'这一步要回答：酶怎样“挑选”它要催化的反应？酶是一种蛋白质，表面有一个形状固定的<strong>活性中心</strong>（口袋）。只有形状吻合的分子（<strong>底物</strong>）才能嵌进去，在口袋里被转化成<strong>产物</strong>并释放，酶本身不变，可以立即再用。这叫锁钥模型（本页做了简化）。图中三个灰色的是酶，凹口是活性中心；漂浮的小图形是底物。点播放：底物随机运动，碰到空闲的酶并且形状合适就被转化。在接触的每个时间步里，形状吻合的底物结合的相对几率为 100%，形状接近的为 15%，形状不合的为 0（接触期间可以多次尝试，所以实测速率之比不一定正好等于几率之比）。',
s0o:'依次选三种底物，各点播放运行一段时间再对比读数里的“产物数”和“速率”：形状吻合的产物最多，形状不合的为零；每次切换底物会清空计数以便公平比较。',
r0:'底物：{kind}（相对结合几率 {p}%）；已运行 {t} s，产物 {n} 个；最近 8 秒速率 {rate} 个/s。',
kMatch:'形状吻合',kNear:'形状接近',kMiss:'形状不合',
s1t:'饱和：酶都忙不过来时，加底物也不再变快',
s1e:'这一步要回答：底物越多反应越快吗？底物浓度 [S] 低时，酶大多空着，底物一多就更多结合，速率随 [S] 增加；但每个酶一次只能处理一个底物，当所有酶都被占满（<strong>饱和</strong>）后速率到顶，叫<strong>最大速率</strong> Vmax（与酶的量成正比）。米氏方程：v = Vmax·[S]/(Kₘ + [S])。Kₘ 是速率达到 Vmax 一半时的底物浓度，Kₘ 越小说明酶越容易结合底物。下方的 10 个酶图标按被占据比例 [S]/(Kₘ + [S]) 着色。',
s1o:'把 [S] 从 0 拉到 10：看曲线先陡后平，酶图标逐渐被填满；把 [S] 设为 Kₘ，速率恰好是 Vmax 的一半；把酶的量加倍，曲线整体升高一倍，但达到一半的位置（Kₘ）不变。',
r1:'[S] = {s} mM，Kₘ = {km} mM，Vmax = {vmax}：v = {v}（是 Vmax 的 {pct}%）；约 {occ}/10 的酶被底物占据。',
s2t:'温度：先加快，再因变性而崩溃',
s2e:'这一步要回答：为什么酶在体温附近最活跃，太热就失效？温度升高，分子碰撞更剧烈，反应本身加快（温度每升高 10 °C 约快 2 倍，见活化能页）；但酶是蛋白质，温度过高会<strong>变性</strong>（立体结构被破坏，活性中心变形，不可逆）。两条曲线乘在一起：灰色虚线是“只考虑加快”，青色是仍保持折叠状态的酶比例（我们取一半变性发生在 50 °C），橙色是它们的乘积——活性曲线，峰值处是<strong>最适温度</strong>。',
s2o:'把温度从 0 拉到 80 °C：活性先上升、过了最适温度后突然下降；对照读数里的最适温度；注意在 37 °C 与 45 °C 之间，活性随温度怎样变化。',
r2:'T = {t} °C：加快因子 {rate}（相对 37 °C），保持折叠的比例 {fold}%，活性 {act}（相对最大值 {pct}%）；最适温度约 {topt} °C。',
s3t:'pH：每种酶有自己的最适 pH',
s3e:'这一步要回答：为什么胃里的酶到了小肠就不工作了？酶的活性依赖几个关键基团带电的状态，pH 改变会改变它们的电荷，进而改变活性中心的形状。本页用简单的两个电离步骤：活性 = 1/(1 + 10^(pK₁ − pH) + 10^(pH − pK₂))，在 pK₁ 与 pK₂ 的中间最高。三种酶的最适 pH 不同：胃蛋白酶约 2，唾液淀粉酶约 7，胰蛋白酶约 8。',
s3o:'选胃蛋白酶，把 pH 从 2 拉到 8；再换胰蛋白酶，从 2 拉到 8：看两条曲线的峰在哪里，并想想它们各自工作的器官的酸碱度。',
r3:'{enz}：pH = {ph}，相对活性 {act}%；最适 pH 约 {opt}。',
nPepsin:'胃蛋白酶',nAmylase:'唾液淀粉酶',nTrypsin:'胰蛋白酶',
s4t:'抑制剂：竞争性与非竞争性',
s4e:'这一步要回答：抑制剂怎样让酶变慢，加底物能“救回来”吗？<strong>竞争性抑制剂</strong>长得像底物，占据活性中心与底物竞争：表观 Kₘ 变大（Kₘ,app = Kₘ(1 + [I]/Kᵢ)），Vmax 不变，所以底物足够多时可以把它挤走。<strong>非竞争性抑制剂</strong>结合在别的位置，使一部分酶失活：Vmax 变小（Vmax,app = Vmax/(1 + [I]/Kᵢ)），Kₘ 不变，加底物也救不回来。本页取 Vmax = 1，Kₘ = 1 mM，Kᵢ = 2 mM。灰色是无抑制剂，彩色是有抑制剂的曲线，圆点是当前 [S]。',
s4o:'选竞争性抑制剂，把 [I] 调到 10，再把 [S] 拉到 20：曲线能否接近无抑制剂的曲线？换成非竞争性：同样操作，曲线能否追上？',
r4:'{kind}，[I] = {i} mM：Vmax,app = {vm}，Kₘ,app = {kma}；[S] = {s} mM 时 v = {v}（无抑制剂时 {v0}）。',
kComp:'竞争性抑制',kNonc:'非竞争性抑制',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 酶的活性中心只接受形状吻合的底物，酶反应后不变；② v = Vmax[S]/(Kₘ + [S])：底物多了酶会饱和，速率有上限；③ 温度：加快与变性相乘，出现最适温度；④ 每种酶有最适 pH；⑤ 竞争性抑制可被高浓度底物克服，非竞争性不能。',
qq:'当底物浓度远大于 Kₘ（酶已接近饱和）时，再把底物浓度加倍，反应速率会？',qo0:'加倍',qo1:'几乎不变',qo2:'减半',
qwhy:'酶几乎全被占满，速率已接近 Vmax，再加底物也没有多余的酶可用（第 1 步：[S] 拉到最大后继续加）。',
s5m:'本页只是教学模型：锁钥配合忽略了诱导契合和构象变化；米氏方程假设单底物、稳态；温度曲线用“加快 × 未变性比例”的简单乘积，变性中点 50 °C 为示意值；pH 曲线用两步电离的简化公式；抑制剂取简单的可逆结合，Kᵢ 为示例值；第 0 步的模拟用随机碰撞与结合几率，数字有涨落；真实的酶有变构调节、辅酶和多底物反应。',
lk0:'活化能页：催化剂降低能垒，酶是生物版的催化剂',lk1:'反应速率页：从粒子碰撞角度看催化剂和浓度',lk2:'酸碱平衡页：pH 改变基团的电离状态'
},
en:{
pageTitle:'Enzymes · Catalysts of the Living World',tagline:'An enzyme pulls substrates together in a pocket of the right shape so reactions run fast at body temperature: from lock-and-key fit to saturation, temperature, pH and inhibitors.',
nav0:'0 Lock and key',nav1:'1 Saturation',nav2:'2 Temperature',nav3:'3 pH',nav4:'4 Inhibitors',nav5:'5 Recap & check',
sMatch:'Substrate: matching shape (triangle)',sNear:'Substrate: similar shape (trapezoid)',sMiss:'Substrate: wrong shape (circle)',bPlay:'Play / Pause',bReset:'Reset: clear the product count',lS:'Substrate concentration [S] (mM)',lKm:'Michaelis constant Kₘ (mM)',lE:'Amount of enzyme [E] (relative)',lT:'Temperature T (°C)',lPh:'Solution pH',ePepsin:'Pepsin (stomach)',eAmylase:'Salivary amylase (mouth)',eTrypsin:'Trypsin (small intestine)',lI:'Inhibitor concentration [I] (mM)',iComp:'Competitive inhibitor',iNon:'Non-competitive inhibitor',
s0t:'An enzyme accepts only a substrate of the right shape',
s0e:'This step answers: how does an enzyme "choose" which reaction to catalyse? An enzyme is a protein with a fixed-shape pocket, the <strong>active site</strong>. Only a molecule of matching shape (the <strong>substrate</strong>) fits in, is turned into a <strong>product</strong> inside the pocket and released, and the enzyme is unchanged and can be used again at once. This is the lock-and-key model (simplified here). The three grey shapes are enzymes and the notch is the active site; the floating shapes are substrates. Press play: substrates move at random, and one that meets a free enzyme and has the right shape is converted. During contact, in every time step the relative chance of binding is 100% for a matching substrate, 15% for a similar one and 0 for a wrong shape (several tries are possible during one contact, so the measured rate ratio need not equal the chance ratio).',
s0o:'Pick each of the three substrates in turn, play for a while, and compare "products" and "rate" in the readout: the matching shape gives the most products and the wrong shape none; switching substrate clears the count so the comparison is fair.',
r0:'Substrate: {kind} (relative binding chance {p}%); ran {t} s, {n} products; rate over the last 8 s {rate} per s.',
kMatch:'matching shape',kNear:'similar shape',kMiss:'wrong shape',
s1t:'Saturation: when every enzyme is busy, more substrate does not speed things up',
s1e:'This step answers: does more substrate always mean a faster reaction? At low substrate concentration [S] most enzymes are empty, and more substrate means more binding, so the rate rises with [S]; but each enzyme handles one substrate at a time, and once all enzymes are occupied (<strong>saturation</strong>) the rate tops out at the <strong>maximum rate</strong> Vmax (proportional to the amount of enzyme). Michaelis–Menten equation: v = Vmax·[S]/(Kₘ + [S]). Kₘ is the substrate concentration at which the rate is half of Vmax; a smaller Kₘ means the enzyme binds its substrate more readily. The 10 enzyme icons below are shaded by the occupied fraction [S]/(Kₘ + [S]).',
s1o:'Move [S] from 0 to 10: the curve is steep and then flat while the enzyme icons fill up; set [S] equal to Kₘ and the rate is exactly half of Vmax; double the amount of enzyme and the whole curve doubles in height, but the half-way position (Kₘ) stays.',
r1:'[S] = {s} mM, Kₘ = {km} mM, Vmax = {vmax}: v = {v} ({pct}% of Vmax); about {occ}/10 of the enzymes are occupied.',
s2t:'Temperature: faster at first, then a collapse from denaturation',
s2e:'This step answers: why are enzymes most active near body temperature and useless when too hot? Warming makes molecules collide harder, so the reaction itself speeds up (about 2× per 10 °C, see the activation-energy lesson); but an enzyme is a protein, and at high temperature it <strong>denatures</strong> (its three-dimensional structure is destroyed, the active site is deformed, irreversibly). The two curves are multiplied: the grey dashed line is "speed-up only", the cyan line is the fraction of enzyme still folded (half denatured at 50 °C here), and the orange line is their product, the activity curve, whose peak is the <strong>optimum temperature</strong>.',
s2o:'Drag the temperature from 0 to 80 °C: activity rises, then falls abruptly past the optimum; compare with the optimum in the readout; between 37 °C and 45 °C notice how activity changes with temperature.',
r2:'T = {t} °C: speed-up factor {rate} (relative to 37 °C), folded fraction {fold}%, activity {act} ({pct}% of the maximum); optimum temperature about {topt} °C.',
s3t:'pH: each enzyme has its own optimum',
s3e:'This step answers: why does a stomach enzyme stop working in the small intestine? An enzyme\'s activity depends on the charge state of a few key groups, and pH changes their charge and thereby the shape of the active site. This page uses a simple two-step ionisation: activity = 1/(1 + 10^(pK₁ − pH) + 10^(pH − pK₂)), highest midway between pK₁ and pK₂. The three enzymes have different optima: pepsin about 2, salivary amylase about 7 and trypsin about 8.',
s3o:'Choose pepsin and move pH from 2 to 8; then choose trypsin and do the same: see where each peak is, and think about the acidity of the organ each works in.',
r3:'{enz}: pH = {ph}, relative activity {act}%; optimum pH about {opt}.',
nPepsin:'pepsin',nAmylase:'salivary amylase',nTrypsin:'trypsin',
s4t:'Inhibitors: competitive and non-competitive',
s4e:'This step answers: how do inhibitors slow an enzyme, and can more substrate "rescue" it? A <strong>competitive inhibitor</strong> looks like the substrate and competes for the active site: the apparent Kₘ grows (Kₘ,app = Kₘ(1 + [I]/Kᵢ)) while Vmax is unchanged, so enough substrate pushes it out. A <strong>non-competitive inhibitor</strong> binds elsewhere and disables part of the enzyme: Vmax falls (Vmax,app = Vmax/(1 + [I]/Kᵢ)) while Kₘ is unchanged, and adding substrate cannot fix it. This page takes Vmax = 1, Kₘ = 1 mM and Kᵢ = 2 mM. Grey is no inhibitor, colour is with inhibitor, and the dot marks the current [S].',
s4o:'Choose the competitive inhibitor, set [I] to 10 and raise [S] to 20: does the curve approach the uninhibited one? Switch to non-competitive and do the same: does it catch up?',
r4:'{kind}, [I] = {i} mM: Vmax,app = {vm}, Kₘ,app = {kma}; at [S] = {s} mM v = {v} (without inhibitor {v0}).',
kComp:'competitive inhibition',kNonc:'non-competitive inhibition',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) an enzyme\'s active site accepts only a substrate of matching shape, and the enzyme is unchanged afterwards; (2) v = Vmax[S]/(Kₘ + [S]): with plenty of substrate the enzymes saturate and the rate has a ceiling; (3) temperature: speed-up times denaturation gives an optimum; (4) each enzyme has an optimum pH; (5) competitive inhibition can be overcome by a high substrate concentration, non-competitive inhibition cannot.',
qq:'When the substrate concentration is far above Kₘ (the enzyme is nearly saturated), what happens to the rate if you double the substrate concentration?',qo0:'It doubles',qo1:'It hardly changes',qo2:'It halves',
qwhy:'Nearly all enzymes are already occupied, so the rate is close to Vmax and extra substrate has no free enzyme to use (step 1: keep raising [S] at the maximum).',
s5m:'This is a teaching model: lock-and-key fit ignores induced fit and conformational change; the Michaelis–Menten equation assumes a single substrate and steady state; the temperature curve is the simple product "speed-up × native fraction" with the 50 °C denaturation midpoint as an illustrative value; the pH curve uses a simplified two-step ionisation formula; inhibitors are simple reversible binders and Kᵢ is an example value; the simulation in step 0 uses random contacts and binding chances, so the numbers fluctuate; real enzymes have allosteric regulation, cofactors and multi-substrate reactions.',
lk0:'Activation energy: a catalyst lowers the barrier, and an enzyme is the biological catalyst',lk1:'Reaction rates: catalysts and concentration seen as particle collisions',lk2:'Acid–base equilibrium: pH changes the ionisation of groups'
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
