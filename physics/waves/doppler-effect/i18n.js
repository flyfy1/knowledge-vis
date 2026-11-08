const STR={
zh:{
pageTitle:'多普勒效应 · 驶近变尖，驶远变沉',tagline:'一个发声的源在运动，波前被挤密或拉疏；从波前的间距算出听到的频率，再到掠过时的音调曲线和超音速的马赫锥。',
nav0:'0 静止的源',nav1:'1 运动的源',nav2:'2 任意方向',nav3:'3 车辆掠过',nav4:'4 超音速',nav5:'5 回顾自测',
lF:'发射频率 f（次/秒）',lM:'源速度比 v/c',lA:'听者方位角 θ',lB:'听者离路线的距离 b',lMach:'马赫数 M = v/c',bPlay:'播放 / 暂停',bReset:'重置：清除波前并回到起点',bPass:'播放 / 暂停：车辆驶过',
s0t:'静止的源：波前等距地向外扩',
s0e:'这一步要回答：一个静止的声源，波前长什么样？源每隔 1/f 秒发出一个波前（圆环），每个圆环以波速 c 向外扩（本页取 c = 1，教学单位）。相邻圆环的间距就是<strong>波长</strong> λ = c/f。点播放，看圆环一圈圈累积。',
hint:'按“播放”开始',s0o:'拖动 f：f 越大圆环越密、间距越小；读数里的 λ 与你眼睛看到的圆环间距对照。',
r0:'f = {f}：波长 λ = c/f = {lam}；每个圆环之间相隔 {T} 秒发出；已发出 {n} 个波前。',
s1t:'源在动：前面的波前被挤密，后面的被拉疏',
s1e:'这一步要回答：源运动时，前后听者听到的频率各是多少？源以速度 v 向右运动，每个波前的圆心停在它被发出时源所在的位置，所以圆环不再同心。图以源为参考（源居中）。远处静止听者（在空气里静止）：在前方，相邻波前的间距缩成 λ前 = (c − v)/f，听到 f前 = f·c/(c − v)；在后方，λ后 = (c + v)/f，听到 f后 = f·c/(c + v)。',
s1o:'把 v/c 从 0 拉到 0.9：看右边（前方）的圆环挤在一起、左边（后方）的圆环拉开；核对读数里的两个频率，并用公式反推：f前 > f > f后。',
r1:'v/c = {m}：前方波前间距 λ前 = {lf}，听到 f前 = {ff}；后方 λ后 = {lb}，听到 f后 = {fb}（源频率 f = {f0}）。',
s2t:'不在正前方、正后方呢？只有朝向听者的那一分量起作用',
s2e:'这一步要回答：听者在任意方向 θ（从源的运动方向量起）时，听到的频率是多少？只有源速度朝向听者的分量 v cosθ 会挤压或拉疏波前：f′ = f/(1 − (v/c) cosθ)。θ = 0° 在正前方（最高），θ = 180° 在正后方（最低），θ = 90° 时没有朝向分量，f′ = f。右下方曲线是 f′ 随 θ 的变化，圆点是当前听者。θ 取的是发声那一刻源到听者的方向。',
s2o:'把 θ 从 0° 转到 180°：听者圆点沿圆走，频率曲线上的点从最高降到最低；在 90° 附近确认 f′ ≈ f；再调 v/c，看曲线的起伏变大。',
r2:'v/c = {m}，θ = {a}°：f′ = f/(1 − (v/c)cosθ) = {fp}（源频率 f = 1）；比源频率{dir}。',
dirHigh:'高',dirLow:'低',dirSame:'相同',
s3t:'车辆掠过：音调从高骤降到低',
s3e:'这一步要回答：车辆驶过路边的人，听到的音调随时间怎么变？车沿直线以 v 行驶，路边听者离路线 b。每个时刻，听者听到的是更早发出的声音，频率 f′ = f/(1 − (v/c)cosθ)，θ 是发声时刻车相对听者的方向（用二分法求解发声时刻）。右边的曲线是听者收到的频率随时间的累积；离路线越远（b 越大）转折越缓和；b 很小则近乎瞬间跳变。f = 1。',
s3o:'点播放，看曲线从高于 1 的水平线降到低于 1 的水平线；把 b 减到 0.3 再播放，转折变陡；把 v/c 调大，高低两端更远离 1。',
r3:'v/c = {m}，b = {b}：驶近极限 {hi}，驶离极限 {lo}；当前听到 f′ = {fp}；车到最近点时听到 {fc}。',
s4t:'超过声速：波前叠成一个锥',
s4e:'这一步要回答：源比波更快会怎样？当 M = v/c > 1，源跑在自己的波前前面，所有圆环被一条包络线圈住，形成<strong>马赫锥</strong>，半角 α 满足 sinα = c/v = 1/M。M < 1 时圆环互相包含，没有锥；M = 1 时圆环在源的前方挤成一点。图仍以源为参考。',
s4o:'把 M 从 0.5 调到 1，再到 2.5：看圆环从“互相包含”变成“被锥线圈住”，锥越来越尖；核对读数里的半角 α。',
r4:'M = {M}：{regime}；{cone}',
regSub:'亚声速，没有锥',regSon:'恰为声速，圆环在源前挤成一点',regSup:'超声速，出现马赫锥',coneNone:'无半角。',coneAng:'半角 α = arcsin(1/M) = {al}°。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 波前间距就是波长 λ = c/f；② 源运动时前方波前被挤密，f前 = f·c/(c − v)，后方 f后 = f·c/(c + v)；③ 任意方向只看朝向听者的速度分量，f′ = f/(1 − (v/c)cosθ)；④ 车辆掠过时音调由高到低，b 越小转折越陡；⑤ M > 1 出现马赫锥，sinα = 1/M。',
qq:'救护车以 v = 0.5c 驶向你，鸣笛频率 f。你听到的频率是多少？',qo0:'2f',qo1:'1.5f',qo2:'0.5f',
qwhy:'f前 = f·c/(c − v) = f/(1 − 0.5) = 2f（第 1 步：把 v/c 设为 0.5 可验证）。',
s5m:'本页只考虑波源运动、听者静止（听者运动时公式略有不同：f′ = f(c ± v_听)/c）；介质静止，波速 c 恒定（本页取 c = 1，教学单位）；二维画法，波前画成圆环；v < c 的亚声速在第 1—3 步，超声速仅在第 4 步给出几何图；没有声强随距离衰减或大气吸收；动画是教学慢放。',
lk0:'驻波页：从另一个角度看波的叠加与频率',lk1:'干涉页：波前相互叠加的结果',lk2:'傅里叶页：把一个变化的音调拆成不同频率'
},
en:{
pageTitle:'The Doppler Effect · Higher as It Approaches, Lower as It Leaves',tagline:'A sound source moves, and its wavefronts bunch up or stretch out; from the wavefront spacing work out the heard frequency, then the pitch curve of a pass-by and the Mach cone.',
nav0:'0 A still source',nav1:'1 A moving source',nav2:'2 Any direction',nav3:'3 A pass-by',nav4:'4 Supersonic',nav5:'5 Recap & check',
lF:'Emission frequency f (per second)',lM:'Source speed ratio v/c',lA:'Listener direction θ',lB:'Listener distance b from the path',lMach:'Mach number M = v/c',bPlay:'Play / Pause',bReset:'Reset: clear the wavefronts and go back to the start',bPass:'Play / Pause: vehicle passes by',
s0t:'A still source: wavefronts spread out evenly',
s0e:'This step answers: what do the wavefronts of a still source look like? The source emits a wavefront (a ring) every 1/f seconds, and each ring expands at the wave speed c (this page uses c = 1, teaching units). The gap between neighbouring rings is the <strong>wavelength</strong> λ = c/f. Press play and watch the rings pile up one after another.',
hint:'Press Play to start',s0o:'Drag f: a larger f makes the rings denser with a smaller gap; compare the λ in the readout with the gap you see.',
r0:'f = {f}: wavelength λ = c/f = {lam}; a ring is emitted every {T} s; {n} wavefronts emitted so far.',
s1t:'A moving source: wavefronts bunch up ahead and stretch out behind',
s1e:'This step answers: when the source moves, what frequencies do listeners ahead and behind hear? The source moves right at speed v, and each ring is centred where the source was when it emitted it, so the rings are no longer concentric. The picture is drawn in the source\'s frame (source at the centre). For distant listeners at rest in the air: ahead, the ring gap shrinks to λ_ahead = (c − v)/f and they hear f_ahead = f·c/(c − v); behind, λ_behind = (c + v)/f and they hear f_behind = f·c/(c + v).',
s1o:'Raise v/c from 0 to 0.9: the rings crowd together on the right (ahead) and spread out on the left (behind); check the two frequencies in the readout, with f_ahead > f > f_behind.',
r1:'v/c = {m}: ahead the ring gap is λ_ahead = {lf}, heard f_ahead = {ff}; behind λ_behind = {lb}, heard f_behind = {fb} (source frequency f = {f0}).',
s2t:'Not straight ahead or behind? Only the component toward the listener counts',
s2e:'This step answers: for a listener in any direction θ (measured from the source\'s direction of motion), what frequency is heard? Only the part of the source velocity toward the listener, v cosθ, squeezes or stretches the wavefronts: f′ = f/(1 − (v/c) cosθ). θ = 0° is straight ahead (highest), θ = 180° straight behind (lowest), and at θ = 90° there is no component toward the listener so f′ = f. The curve at the lower right shows f′ against θ, and the dot is the current listener. θ is the direction from the source to the listener at the moment of emission.',
s2o:'Turn θ from 0° to 180°: the listener dot moves round the circle and the point on the curve falls from highest to lowest; near 90° confirm f′ ≈ f; then change v/c and see the curve\'s swing grow.',
r2:'v/c = {m}, θ = {a}°: f′ = f/(1 − (v/c)cosθ) = {fp} (source frequency f = 1); {dir} compared with the source.',
dirHigh:'higher',dirLow:'lower',dirSame:'the same',
s3t:'A vehicle passes by: the pitch drops from high to low',
s3e:'This step answers: how does the pitch heard by someone beside a road change with time as a vehicle passes? The vehicle drives in a straight line at v, and the listener stands a distance b from the path. At each moment the listener hears sound emitted earlier, with frequency f′ = f/(1 − (v/c)cosθ), where θ is the vehicle\'s direction relative to the listener at emission (the emission time is found by bisection). The curve on the right builds up what the listener hears over time; larger b gives a gentler transition, and a very small b is almost a jump. f = 1.',
s3o:'Press play and watch the curve drop from a plateau above 1 to one below 1; reduce b to 0.3 and replay for a steeper transition; raise v/c to push the two plateaus farther from 1.',
r3:'v/c = {m}, b = {b}: approach limit {hi}, departure limit {lo}; currently heard f′ = {fp}; at the closest approach the listener hears {fc}.',
s4t:'Faster than the wave: the wavefronts pile up into a cone',
s4e:'This step answers: what if the source is faster than its own waves? For M = v/c > 1 the source outruns its wavefronts, and a single envelope line encloses all the rings, forming a <strong>Mach cone</strong> with half-angle α given by sinα = c/v = 1/M. For M < 1 the rings nest inside each other and there is no cone; at M = 1 the rings pile up at one point in front of the source. The picture is again in the source\'s frame.',
s4o:'Raise M from 0.5 to 1 and then to 2.5: the rings go from nested to enclosed by a cone, with the cone getting sharper; check the half-angle α in the readout.',
r4:'M = {M}: {regime}; {cone}',
regSub:'subsonic, no cone',regSon:'exactly the wave speed, rings pile up at a point ahead of the source',regSup:'supersonic, a Mach cone forms',coneNone:'No half-angle.',coneAng:'Half-angle α = arcsin(1/M) = {al}°.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) the ring spacing is the wavelength λ = c/f; (2) for a moving source the rings ahead bunch up, f_ahead = f·c/(c − v), and behind f_behind = f·c/(c + v); (3) in any direction only the velocity component toward the listener matters, f′ = f/(1 − (v/c)cosθ); (4) a pass-by drops from high to low, more steeply for small b; (5) M > 1 gives a Mach cone with sinα = 1/M.',
qq:'An ambulance approaches you at v = 0.5c with siren frequency f. What frequency do you hear?',qo0:'2f',qo1:'1.5f',qo2:'0.5f',
qwhy:'f_ahead = f·c/(c − v) = f/(1 − 0.5) = 2f (step 1: set v/c to 0.5 to check).',
s5m:'This page considers a moving source and a listener at rest (for a moving listener the formula changes slightly: f′ = f(c ± v_listener)/c); the medium is still and the wave speed c is constant (c = 1 here, teaching units); the drawing is 2D with ring wavefronts; subsonic motion is covered in steps 1–3 and only step 4 gives the supersonic geometry; there is no decay of loudness with distance or air absorption; the animation is a teaching slow-motion.',
lk0:'Standing waves: another view of superposed waves and frequency',lk1:'Interference: what happens when wavefronts overlap',lk2:'Fourier: split a changing pitch into frequencies'
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
