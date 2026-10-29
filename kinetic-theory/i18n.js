const STR={
zh:{
pageTitle:'气体压强的微观图景 · 撞墙的账本',tagline:'盒子里的粒子乱撞：压强是撞墙的冲量账，温度是平均动能，速率分布自己从碰撞里长出来。',
nav0:'0 压强是撞墙',nav1:'1 温度',nav2:'2 体积',nav3:'3 速率分布',nav4:'4 轻重粒子',nav5:'5 回顾自测',
lN:'粒子数 N',lT:'温度 T',lW:'盒子宽度 W',lM:'重粒子质量 M',bPlay:'播放 / 暂停',bReset:'重置：重新撒粒子并清空统计',bRec:'记录当前点 (V, P)',bClear:'清除记录点',bReset3:'重置：全部粒子同速出发',bReset4:'重置：所有粒子同速出发',
s0t:'压强不是别的，就是粒子撞墙的冲量总和',
s0e:'这一步要回答：盒子里的气体压强是怎么来的？每个粒子撞墙，垂直于墙的动量改变 2m·vₙ（撞来再弹回）；四面墙单位时间、单位墙长上收到的总冲量就是<strong>压强</strong> P（二维气体，单位长度上的力）。右图每根柱是 0.25 秒内测得的压强，折线是最近 8 秒平均，虚线是理论值 P = N·⟨KE⟩/(W·H)，其中 ⟨KE⟩ 是粒子的平均动能。粒子相互弹性碰撞，墙壁是理想弹性墙。',
s0o:'先看柱子在虚线上下抖动、折线靠近虚线；把粒子数 N 从 40 加到 80（重新撒粒子），看柱子整体升高到约两倍。',
r0:'N = {n}，平均动能 ⟨KE⟩ = {ke}；理论 P = N⟨KE⟩/A = {pth}；最近 8 秒实测 P = {pm}（{ratio}）；已模拟 {t} s。',
measuring:'测量中，需累积 8 秒',
s1t:'温度：平均动能的读数',
s1e:'这一步要回答：温度升高，粒子和压强怎么变？本页取 ⟨KE⟩ = k T（二维两个自由度，k = 1），所以 T 越高，粒子平均动能越大，速率约按 √T 增大。右图是此刻所有粒子的速率直方图，竖线是平均速率。改变 T 会把所有粒子的速度整体缩放，压强统计会重新累积。',
s1o:'把 T 从 1 调到 4：直方图向右移动并变宽，平均速率约变成 2 倍；读数里 P/T 应保持为同一个数 N/A。',
r1:'T = {t}，平均速率 = {vm}；理论 P = {pth}，实测 P = {pm}；P/T = {pt}（N/A = {na}）。',
s2t:'体积：压缩气体，压强随之升高',
s2e:'这一步要回答：盒子变小，压强怎么变？粒子速度不变，盒子越窄，粒子越快撞到右墙，每秒撞墙次数越多。理论上 P·V = N⟨KE⟩ 保持不变（V = W×H 是盒子面积，玻意耳定律）。改变宽度，等 8 秒读数稳定后点“记录”，把实测点 (V, P) 放到右图，看点是否落在虚线双曲线 P = N⟨KE⟩/V 上。',
s2o:'依次把 W 设为 8、6、4、2，每次等读数稳定再记录：点应落在同一条曲线上；V 减半，P 约加倍。',
r2:'V = {v}；理论 P = {pth}；实测 P = {pm}；P×V = {pv}（理论常数 N⟨KE⟩ = {c}）；已记录 {k} 个点。',
needWait:'读数还没稳定（需 8 秒），请稍后再记录。',
s3t:'速率分布：碰撞把整齐的速率“洗”成钟形偏态',
s3e:'这一步要回答：气体里的粒子速率为什么有快有慢？开始时 100 个粒子速率完全相同，只有方向不同。粒子之间互相弹性碰撞、交换动能，速率逐渐散开。柱状图是最近一段时间的速率分布，曲线是二维麦克斯韦分布 f(v) = (v/T)·exp(−v²/2T)（m = 1，k = 1）。读数里的差距是两者的总变差距离（0 表示完全重合）。',
s3o:'点重置后播放：开始是一根尖柱，几秒内摊开成曲线；读数里的“差距”应从接近 1 降到很小。',
r3:'已模拟 {t} s，累计碰撞 {c} 次；与麦克斯韦曲线的差距 = {d}；平均动能 = {ke}（T = {T}）。',
s4t:'轻粒子和重粒子：同一温度，平均动能相同',
s4e:'这一步要回答：同一团气体里，轻粒子和重粒子谁快？开始时两种粒子速率相同（所以重粒子动能更大）。碰撞交换能量，重粒子把多余动能让给轻粒子，两条平均动能曲线汇合；最后动能相同，轻粒子的方均根速率是重粒子的 √M 倍（M 为质量比）。右图橙线是重粒子，青线是轻粒子。',
s4o:'播放，看两条曲线从分开走到重合；把 M 从 4 改到 9 重置再播放：重合后，速率比应接近 √M。',
r4:'⟨KE⟩：轻 {kl}，重 {kh}；方均根速率比 轻/重 = {vr}（√M = {sq}）；已模拟 {t} s。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 压强 = 粒子撞墙的冲量总和，P = N⟨KE⟩/A（二维）；② 温度对应平均动能，⟨KE⟩ = kT；③ 体积减半，撞墙更频繁，P 约加倍（玻意耳）；④ 碰撞让速率分布自己长成麦克斯韦分布；⑤ 同一温度下平均动能相同，轻的更快。',
qq:'温度和粒子数不变，把盒子体积压缩到原来的一半，压强变成多少？',qo0:'原来的一半',qo1:'原来的 2 倍',qo2:'原来的 4 倍',
qwhy:'P·V = N⟨KE⟩ 不变，V 减半则 P 加倍（第 2 步可验证）。',
s5m:'本页是二维硬圆盘气体：粒子有（很小的）大小、没有吸引力，所以实测压强比理想值略高几个百分点，墙是理想弹性墙，动能就是全部能量；真实气体是三维，压强 P = N⟨KE⟩·2/(3V)，且有分子间力与转动振动自由度；改变 W 或 T 都是瞬时的教学操作（真实压缩会因做功升温）；时间为教学加速；读数含统计涨落，粒子数越少涨落越大。',
lk0:'粒子与物态页：温度是平均动能的读数，从初中的角度看同一件事',lk1:'热力学页：从 P = nRT/V 出发走到做功与热机'
},
en:{
pageTitle:'The Microscopic Picture of Gas Pressure · A Ledger of Wall Hits',tagline:'Particles in a box bounce around: pressure is a ledger of wall impulses, temperature is mean kinetic energy, and the speed distribution grows out of collisions.',
nav0:'0 Pressure = wall hits',nav1:'1 Temperature',nav2:'2 Volume',nav3:'3 Speed distribution',nav4:'4 Light and heavy',nav5:'5 Recap & check',
lN:'Number of particles N',lT:'Temperature T',lW:'Box width W',lM:'Heavy-particle mass M',bPlay:'Play / Pause',bReset:'Reset: scatter fresh particles and clear the statistics',bRec:'Record current point (V, P)',bClear:'Clear recorded points',bReset3:'Reset: start every particle at the same speed',bReset4:'Reset: start every particle at the same speed',
s0t:'Pressure is simply the total impulse of particles hitting the wall',
s0e:'This step answers: where does the pressure of a gas in a box come from? A particle hitting a wall changes its momentum perpendicular to it by 2m·vₙ (it arrives and bounces back); the total impulse per second per unit wall length over the four walls is the <strong>pressure</strong> P (for a 2D gas, force per length). Each bar on the right is the pressure measured over 0.25 s, the line is the average of the last 8 s, and the dashed line is the theory P = N·⟨KE⟩/(W·H), where ⟨KE⟩ is the mean kinetic energy per particle. Particles collide elastically with each other and with perfectly elastic walls.',
s0o:'See the bars jitter around the dashed line while the line settles onto it; then raise N from 40 to 80 (this respawns the gas) and watch the bars rise to about double.',
r0:'N = {n}, mean kinetic energy ⟨KE⟩ = {ke}; theory P = N⟨KE⟩/A = {pth}; measured P over the last 8 s = {pm} ({ratio}); simulated {t} s.',
measuring:'measuring, needs 8 s of data',
s1t:'Temperature: a reading of mean kinetic energy',
s1e:'This step answers: when you heat the gas, what happens to the particles and the pressure? On this page ⟨KE⟩ = k T (two degrees of freedom in 2D, k = 1), so higher T means higher mean kinetic energy and speeds that grow roughly as √T. The right panel is a histogram of all particle speeds right now, with a vertical line at the mean speed. Changing T rescales every velocity at once and restarts the pressure statistics.',
s1o:'Raise T from 1 to 4: the histogram moves right and widens, and the mean speed roughly doubles; in the readout P/T should stay at the same number, N/A.',
r1:'T = {t}, mean speed = {vm}; theory P = {pth}, measured P = {pm}; P/T = {pt} (N/A = {na}).',
s2t:'Volume: squeeze the gas and the pressure rises',
s2e:'This step answers: when the box gets smaller, how does the pressure change? The speeds stay the same, but in a narrower box particles reach the right wall sooner, so there are more hits per second. In theory P·V = N⟨KE⟩ stays constant (V = W×H is the box area; Boyle\'s law). Change the width, wait 8 s for the reading to settle, then press Record to place the measured point (V, P) on the right and check whether it lands on the dashed hyperbola P = N⟨KE⟩/V.',
s2o:'Set W to 8, 6, 4 and 2 in turn, recording each after the reading settles: the points should fall on one curve; halving V roughly doubles P.',
r2:'V = {v}; theory P = {pth}; measured P = {pm}; P×V = {pv} (theory constant N⟨KE⟩ = {c}); {k} points recorded.',
needWait:'The reading has not settled yet (needs 8 s); try again shortly.',
s3t:'Speed distribution: collisions shuffle identical speeds into a skewed bell',
s3e:'This step answers: why do the particles in a gas have fast and slow speeds? At the start, 100 particles all have exactly the same speed and differ only in direction. Elastic collisions between them exchange kinetic energy and the speeds spread out. The bars show the recent speed distribution and the curve is the 2D Maxwell distribution f(v) = (v/T)·exp(−v²/2T) (m = 1, k = 1). The gap in the readout is the total variation distance between the two (0 means they coincide).',
s3o:'Press reset, then play: it starts as a single spike and spreads into the curve within seconds; the "gap" should fall from nearly 1 to a small value.',
r3:'Simulated {t} s, {c} collisions so far; gap to the Maxwell curve = {d}; mean kinetic energy = {ke} (T = {T}).',
s4t:'Light and heavy particles: same temperature, same mean kinetic energy',
s4e:'This step answers: in one gas, which is faster, the light particles or the heavy ones? At the start both kinds have the same speed (so heavy ones carry more kinetic energy). Collisions exchange energy: heavy particles hand their surplus to the light ones and the two mean-kinetic-energy curves converge. At the end the kinetic energies are equal and the light particles\' RMS speed is √M times the heavy ones\' (M is the mass ratio). On the right the orange line is the heavy species and the cyan line the light one.',
s4o:'Play and watch the two curves go from apart to together; set M from 4 to 9, reset and play again: after they merge the speed ratio should be close to √M.',
r4:'⟨KE⟩: light {kl}, heavy {kh}; RMS speed ratio light/heavy = {vr} (√M = {sq}); simulated {t} s.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) pressure is the total impulse of wall hits, P = N⟨KE⟩/A (2D); (2) temperature stands for mean kinetic energy, ⟨KE⟩ = kT; (3) halve the volume and wall hits become more frequent, so P roughly doubles (Boyle); (4) collisions grow the Maxwell speed distribution by themselves; (5) at one temperature the mean kinetic energy is the same, so lighter particles are faster.',
qq:'Temperature and particle number stay fixed and you compress the box to half its volume. What happens to the pressure?',qo0:'It halves',qo1:'It doubles',qo2:'It quadruples',
qwhy:'P·V = N⟨KE⟩ is constant, so halving V doubles P (check in step 2).',
s5m:'This page is a 2D hard-disc gas: particles have a (small) size and no attraction, so measured pressure sits a few percent above the ideal value, walls are perfectly elastic, and kinetic energy is all the energy. A real gas is 3D with P = (2/3)N⟨KE⟩/V, has intermolecular forces and rotational and vibrational energy; changing W or T is an instantaneous teaching action (real compression also heats the gas by doing work); time runs faster than real; readings carry statistical noise, larger for fewer particles.',
lk0:'Particles & states: temperature as a reading of mean kinetic energy, from the junior-high side',lk1:'Thermodynamics: start from P = nRT/V and go on to work and heat engines'
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
