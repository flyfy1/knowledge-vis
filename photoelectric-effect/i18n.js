const STR={
zh:{
pageTitle:'光电效应 · 光是一份一份的',tagline:'光照金属：频率不到门槛，再亮也打不出电子；过了门槛，电子的最大动能只随频率走，亮度只决定个数。',
nav0:'0 光打金属',nav1:'1 能量账本',nav2:'2 测普朗克常数',nav3:'3 遏止电压',nav4:'4 波动模型的矛盾',nav5:'5 回顾自测',
lF:'光的频率 f（×10¹⁴ Hz）',lI:'光强（光子到达率）',lV:'反向电压 V（V）',lIlog:'光强 I（数量级 10^x W/m²）',mCs:'铯 Cs（φ≈2.14 eV）',mNa:'钠 Na（φ≈2.36 eV）',mZn:'锌 Zn（φ≈4.3 eV）',bPlay:'播放 / 暂停',bReset:'重置：清空光子、电子和计数',bAdd:'记录一个数据点 (f, 最大动能)',bClear:'清除全部数据点',
s0t:'光照在金属上：什么时候有电子出来？',
s0e:'这一步要回答：光打到金属板上，什么条件下会打出电子？点播放：左侧射来的小点是<strong>光子</strong>（一份一份的光，能量 E = hf，h 是普朗克常数，f 是光的频率），金属板在右侧。每个光子被吸收时，如果 E 大于金属的<strong>逸出功</strong> φ（把一个电子拉出金属所需的最小能量），就打出一个电子（本页理想化为 1 个光子 1 个电子；真实效率远低于此）。颜色表示频率，可见光之外用偏暗的紫/红表示。本页金属为钠（φ ≈ 2.36 eV）。',
s0o:'先把 f 设低（约 4）播放：光子不断到达、没有电子；再把 f 提到 8 重播：每个光子都带出一个电子；把光强调大，看电子个数的增长变快。',
r0:'光子能量 hf = {e} eV，逸出功 φ = {phi} eV：{res}；到达光子 {np} 个，打出电子 {ne} 个；电子最大动能 {ke} eV。',
lIshort:'光强',barWave:'波动模型：每个原子积累 φ 所需时间',barPhoton:'光子模型：整块金属出现第一个电子的时间',resYes:'hf > φ，能打出电子',resNo:'hf < φ，打不出电子',
s1t:'一个光子对一个电子：能量账本',
s1e:'这一步要回答：光子的能量去哪了？一个光子把全部能量 hf 交给一个电子，其中 φ 用来脱离金属，剩下变成电子的动能：<strong>E_k,max = hf − φ</strong>（最大值：从表面逸出的电子）。如果 hf < φ，一个光子的能量不够，电子出不来，多个光子也不能叠加。当 hf = φ 时的频率叫<strong>截止频率</strong> f₀ = φ/h。图中青色柱是 hf，橙线是 φ，绿色部分是剩下的动能；右侧表头显示光电流（电子数目），与光强成正比。',
s1o:'选钠，把 f 从 3 慢慢拉高：柱顶越过橙线的瞬间，动能出现、电流出现；然后把光强拉到最大，但保持 f 低于截止频率：电流仍然为零。换成锌，截止频率移到哪里？',
r1:'{metal}：hf = {e} eV，φ = {phi} eV，截止频率 f₀ = {f0}×10¹⁴ Hz；E_k,max = {ke} eV；光电流（相对）= {cur}。',
nameCs:'铯',nameNa:'钠',nameZn:'锌',
s2t:'用实验点量出普朗克常数',
s2e:'这一步要回答：能不能用光电效应测出 h？E_k,max = hf − φ 是 f 的一次函数：斜率是 h，纵轴截距是 −φ。拖动 f，点“记录”，在图上加一个“测得”的点（加了固定的小幅模拟测量误差 ±0.04 eV，这是模拟，不是实测）。点够多后，用最小二乘直线拟合，读数给出由斜率得到的 h（真值 4.136×10⁻¹⁵ eV·s）和由截距得到的 φ。右图是电流与光强的关系：过了门槛，电流与光强成正比。',
s2o:'选一种金属，在截止频率之上记录至少 4 个不同 f 的点（越分散越好），看拟合出的 h 是否接近 4.14；换一种金属：斜率不变（h 与金属无关），截距变了。',
r2:'{metal}：已记录 {n} 个点（其中高于门槛的 {na} 个）；拟合：h ≈ {h}×10⁻¹⁵ eV·s，φ ≈ {phif} eV（真值 φ = {phi} eV）。',
needMore:'至少需要 2 个高于门槛的点才能拟合',
s3t:'遏止电压：用反向电压把电子“挡回去”',
s3e:'这一步要回答：怎样直接测出电子的最大动能？在收集板上加反向电压 V，电子要克服 eV 的势垒才能到达。当 eV 刚好等于 E_k,max 时，最快的电子也到不了，光电流变成零，这个 V 叫<strong>遏止电压</strong> V_s = E_k,max/e。本页假设电子动能在 0 到 E_k,max 之间均匀分布，所以 I = I₀(1 − V/V_s)，这是简化，真实曲线更圆滑。灰色虚线是光强减半的曲线：光强只改变电流大小，不改变 V_s。',
s3o:'选一种金属，调 f 高于截止频率，把 V 从负向正拉：电流在 V = V_s 处降为零；再提高 f，V_s 右移；对照读数里 V_s = E_k,max（以 eV 为单位的数值）。',
r3:'{metal}：hf = {e} eV，E_k,max = {ke} eV，V_s = {vs} V；当前 V = {v} V，光电流（相对）= {cur}。',
s4t:'为什么经典波动模型解释不了？',
s4e:'这一步要回答：如果光是连续的波，会发生什么？波动模型预测：光强越大，电子越快（与实验不符）；而且光很暗时，一个原子要从波里<strong>积累</strong>足够能量才能放出电子。估算：一个原子截面约 A = 10⁻¹⁹ m² 接收功率 P = I·A，积累 φ 需要 t = φ/(I·A)。光子模型：整块金属（取 10⁻⁴ m²）每秒接收 I·A_板/(hf) 个光子，第一个光子到达的时间约 hf/(I·A_板)。下图横轴是对数时间（秒）。实验里电子几乎立刻（<10⁻⁹ s）出现，与光子模型一致。本页取钠，f = 7×10¹⁴ Hz。',
s4o:'把光强从 10⁻⁴ 拉到 1 W/m²：看橙色柱（波动积累时间）从数小时缩到约 1 秒的量级，但仍远长于蓝色柱（光子模型，十亿分之一秒量级）。',
r4:'I = {i} W/m²：波动模型每个原子需积累 {tc} 秒；光子模型整块金属约 {tp} 秒后出现第一个电子。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 光由光子组成，E = hf；② 一个光子给一个电子，E_k,max = hf − φ，φ 是逸出功；③ 低于截止频率 f₀ = φ/h，光再强也没有电子；④ 光强只决定电子个数（电流），不决定最大动能；⑤ V_s = E_k,max/e；⑥ 用 E_k,max–f 直线斜率可测 h。',
qq:'用低于截止频率的光照金属，把光强增大到原来的 10 倍，会发生什么？',qo0:'有电子出来，数量是原来的 10 倍',qo1:'仍然没有电子',qo2:'电子数不变，动能增大',
qwhy:'一个光子的能量 hf < φ，不够逸出，光强只是光子更多，每个光子仍然不够（第 1 步可验证）。',
s5m:'本页是理想化模型：一个光子最多打出一个电子（真实量子效率约 0.1%–10%），电子动能均匀分布（真实更复杂），忽略接触电势、温度、表面状态和空间电荷；逸出功取常见教材近似值；第 2 步的模拟测量误差是人为加入的；第 4 步为数量级估算；动画是教学慢放，光子和电子速度不代表真实值。',
lk0:'原子结构页：电子为什么被束缚在原子里，需要能量才能挣脱',lk1:'透镜页：光学线的几何光学，对照这里光作为粒子的一面',lk2:'干涉页：光的波动性证据，与光电效应互补'
},
en:{
pageTitle:'The Photoelectric Effect · Light Comes in Packets',tagline:'Light on a metal: below a threshold frequency no electrons come out however bright it is; above it, the electrons\' maximum energy follows only the frequency, and brightness sets only how many.',
nav0:'0 Light on metal',nav1:'1 Energy ledger',nav2:'2 Measure h',nav3:'3 Stopping voltage',nav4:'4 Where waves fail',nav5:'5 Recap & check',
lF:'Light frequency f (×10¹⁴ Hz)',lI:'Intensity (photon arrival rate)',lV:'Retarding voltage V (V)',lIlog:'Intensity I (order of magnitude 10^x W/m²)',mCs:'Cesium Cs (φ≈2.14 eV)',mNa:'Sodium Na (φ≈2.36 eV)',mZn:'Zinc Zn (φ≈4.3 eV)',bPlay:'Play / Pause',bReset:'Reset: clear photons, electrons and counts',bAdd:'Record a data point (f, max kinetic energy)',bClear:'Clear all data points',
s0t:'Light on a metal: when do electrons come out?',
s0e:'This step answers: when light hits a metal plate, under what conditions are electrons knocked out? Press play: the dots arriving from the left are <strong>photons</strong> (light in packets, with energy E = hf, where h is Planck\'s constant and f the light frequency), and the metal plate is on the right. When a photon is absorbed and E exceeds the metal\'s <strong>work function</strong> φ (the least energy needed to pull an electron out), one electron is ejected (idealised here as one electron per photon; real yields are far lower). Colour shows frequency, with dim violet/red for beyond the visible range. The metal here is sodium (φ ≈ 2.36 eV).',
s0o:'First set f low (about 4) and play: photons keep arriving but no electrons leave; then raise f to 8 and replay: each photon frees one electron; raise the intensity and watch the electron count grow faster.',
r0:'Photon energy hf = {e} eV, work function φ = {phi} eV: {res}; {np} photons arrived, {ne} electrons ejected; maximum electron kinetic energy {ke} eV.',
lIshort:'intensity',barWave:'Wave model: time for one atom to accumulate φ',barPhoton:'Photon model: time to the first electron from the whole plate',resYes:'hf > φ, electrons can be ejected',resNo:'hf < φ, no electrons',
s1t:'One photon gives its energy to one electron: the energy ledger',
s1e:'This step answers: where does a photon\'s energy go? One photon hands all of its energy hf to one electron; φ of it is spent escaping the metal and the rest becomes kinetic energy: <strong>E_k,max = hf − φ</strong> (the maximum, for electrons leaving from the surface). If hf < φ one photon is not enough and the electron stays; several photons cannot pool their energy. The frequency where hf = φ is the <strong>threshold frequency</strong> f₀ = φ/h. In the figure the cyan bar is hf, the orange line is φ, the green part is the leftover kinetic energy; the meter on the right shows the photocurrent (the number of electrons), proportional to intensity.',
s1o:'Choose sodium and raise f slowly from 3: the moment the bar top passes the orange line, kinetic energy and current appear. Then push the intensity to the maximum while keeping f below threshold: the current stays zero. Switch to zinc: where does the threshold move?',
r1:'{metal}: hf = {e} eV, φ = {phi} eV, threshold f₀ = {f0}×10¹⁴ Hz; E_k,max = {ke} eV; photocurrent (relative) = {cur}.',
nameCs:'Cesium',nameNa:'Sodium',nameZn:'Zinc',
s2t:'Measure Planck\'s constant from experimental points',
s2e:'This step answers: can the photoelectric effect measure h? E_k,max = hf − φ is a straight line in f: the slope is h and the intercept is −φ. Drag f and press Record to add a "measured" point to the plot (with a fixed small simulated measurement error of ±0.04 eV — this is a simulation, not a real measurement). With enough points, a least-squares line fit gives h from the slope (true value 4.136×10⁻¹⁵ eV·s) and φ from the intercept. The right plot shows current against intensity: above threshold, current is proportional to intensity.',
s2o:'Choose a metal and record at least 4 points at different f above threshold (the more spread out the better), and see whether the fitted h is close to 4.14; switch metal: the slope stays the same (h does not depend on the metal) and the intercept changes.',
r2:'{metal}: {n} points recorded ({na} above threshold); fit: h ≈ {h}×10⁻¹⁵ eV·s, φ ≈ {phif} eV (true φ = {phi} eV).',
needMore:'at least 2 points above threshold are needed for a fit',
s3t:'Stopping voltage: push the electrons back with a retarding voltage',
s3e:'This step answers: how can you measure the maximum kinetic energy of the electrons directly? Put a retarding voltage V on the collector: electrons must climb an eV barrier to reach it. When eV just equals E_k,max, even the fastest electrons fail, the photocurrent drops to zero, and that V is the <strong>stopping voltage</strong> V_s = E_k,max/e. This page assumes the electron energies are uniformly distributed from 0 to E_k,max, so I = I₀(1 − V/V_s); that is a simplification and real curves are rounder. The grey dashed curve is half the intensity: intensity changes the current, not V_s.',
s3o:'Choose a metal, set f above threshold and sweep V from negative to positive: the current reaches zero at V = V_s; raise f and V_s moves right; compare V_s with E_k,max (the same number when E_k,max is in eV).',
r3:'{metal}: hf = {e} eV, E_k,max = {ke} eV, V_s = {vs} V; current V = {v} V, photocurrent (relative) = {cur}.',
s4t:'Why can\'t the classical wave model explain it?',
s4e:'This step answers: what would happen if light were a continuous wave? The wave model predicts that brighter light gives faster electrons (not seen in experiment), and that with dim light an atom must <strong>accumulate</strong> enough energy from the wave before releasing an electron. Estimate: an atom has a cross-section of about A = 10⁻¹⁹ m² and receives power P = I·A, so accumulating φ takes t = φ/(I·A). Photon model: the whole piece of metal (take 10⁻⁴ m²) receives I·A_plate/(hf) photons per second, so the first photon arrives after about hf/(I·A_plate). The bars below use a logarithmic time axis (seconds). In experiments electrons appear almost immediately (<10⁻⁹ s), consistent with the photon model. Sodium at f = 7×10¹⁴ Hz here.',
s4o:'Raise the intensity from 10⁻⁴ to 1 W/m²: watch the orange bar (wave accumulation time) shrink from hours to the order of a second, yet it stays far longer than the blue bar (photon model, order of a billionth of a second).',
r4:'I = {i} W/m²: the wave model needs {tc} s of accumulation per atom; the photon model gives the first electron from the whole plate after about {tp} s.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) light comes in photons, E = hf; (2) one photon gives its energy to one electron, E_k,max = hf − φ, with φ the work function; (3) below the threshold f₀ = φ/h there are no electrons however bright the light; (4) intensity sets only how many electrons (the current), not their maximum energy; (5) V_s = E_k,max/e; (6) the slope of the E_k,max–f line measures h.',
qq:'Light below the threshold frequency shines on a metal and you raise its intensity to 10 times. What happens?',qo0:'Electrons come out, 10 times as many as before',qo1:'Still no electrons',qo2:'The electron count stays the same but the energy rises',
qwhy:'One photon has hf < φ, which is not enough to free an electron; more intensity just means more photons that each still fall short (check in step 1).',
s5m:'This is an idealised model: one photon frees at most one electron (real quantum efficiency is about 0.1%–10%), electron energies are uniformly distributed (reality is more complex), and contact potentials, temperature, surface condition and space charge are ignored. Work functions are common textbook approximations; the measurement error in step 2 is added artificially; step 4 is an order-of-magnitude estimate; the animation is a teaching slow-motion and photon or electron speeds are not real.',
lk0:'Atomic structure: why electrons are bound to atoms and need energy to break free',lk1:'Lens: geometric optics, to contrast with light behaving as particles here',lk2:'Interference: evidence for the wave nature of light, complementary to the photoelectric effect'
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
