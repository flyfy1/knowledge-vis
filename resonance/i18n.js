const STR={
zh:{
pageTitle:'共振 · 踩中节拍，小推也能荡高',tagline:'从弹簧的固有节拍出发，看阻尼怎样让振动衰减，再看周期性的推力在什么频率下把振幅推到最高。',
nav0:'0 固有频率',nav1:'1 阻尼',nav2:'2 被推着的振子',nav3:'3 共振曲线',nav4:'4 相位滞后',nav5:'5 回顾自测',
lK:'弹簧劲度 k',lM:'质量 m',lZ:'阻尼比 ζ',lR:'驱动频率比 Ω/ω₀',bPlay:'播放 / 暂停',bReset:'重置：清除轨迹并回到起点',
s0t:'没人推时，弹簧振子有自己的节拍',
s0e:'这一步要回答：一个弹簧上的物体自由振动，一秒振几次由什么决定？拉开 1 个单位松手，物体做简谐振动，<strong>固有角频率</strong> ω₀ = √(k/m)（k 是弹簧劲度，越大越“硬”；m 是质量），周期 T = 2π/ω₀。点播放，右边轨迹 x(t) 逐渐画出；“实测周期”由轨迹相邻两次上穿零点的间隔得到，与公式对照。',
s0o:'把 k 调大：振得更快；把 m 调大：振得更慢。播放一两个周期，核对实测周期是否等于 2π√(m/k)。',
r0:'ω₀ = √(k/m) = {w0}；公式周期 T = {tp}；轨迹实测周期 = {tm}；t = {t}。',
none:'还没走完一个周期',hint:'按“播放”开始',
s1t:'阻尼：能量被一点点带走',
s1e:'这一步要回答：加上摩擦（阻尼）后，振动怎样变化？用<strong>阻尼比</strong> ζ 表示阻尼大小：ζ = 0 无阻尼；ζ < 1 欠阻尼，振幅按 e^(−ζω₀t) 的包络衰减（虚线）；ζ = 1 临界阻尼，最快回到平衡且不来回；ζ > 1 过阻尼，缓慢爬回。本页 ω₀ = 2（后几步相同）。读数里的“相邻峰比”是曲线上前后两个峰高之比。',
s1o:'把 ζ 从 0 慢慢拉到 1.6：看包络从不衰减、到衰减越来越快、到不再来回振荡；对照读数里的实测峰比与公式 e^(−2πζ/√(1−ζ²))。',
r1:'ζ = {z}：{kind}；相邻峰比：实测 {rm}，公式 {rf}。',
kUnder:'欠阻尼（来回振荡并衰减）',kCrit:'临界阻尼（不振荡，最快回零）',kOver:'过阻尼（不振荡，缓慢回零）',kNone:'无阻尼（永不衰减）',
s2t:'周期性地推它：振幅怎样长大',
s2e:'这一步要回答：用周期力 F cos Ωt 推一个有阻尼的振子，会发生什么？运动方程 x″ + 2ζω₀x′ + ω₀²x = F cos Ωt（F = 1，ω₀ = 2）。前几个周期是“瞬态”，随后进入<strong>稳态</strong>：以驱动频率 Ω 振动，振幅固定为 A = F/√((ω₀²−Ω²)² + (2ζω₀Ω)²)。点播放，橙色是 x(t)，青色虚线是推力（缩放后）。读数里的“实测振幅”取最近两个驱动周期内的最大位移。',
s2o:'先把 Ω/ω₀ 设为 0.5 播放，记下稳态振幅；再设为 1（踩中固有频率）重播：振幅长到多大？再换到 1.6：振幅怎样？',
r2:'Ω = {W}（Ω/ω₀ = {r}），ζ = {z}；公式稳态振幅 A = {A}；实测最近两个驱动周期最大位移 = {Am}；t = {t}。',
s3t:'共振曲线：只有一个频率附近振幅冲得高',
s3e:'这一步要回答：推力频率扫过一遍，稳态振幅怎么变？横轴是 Ω/ω₀，纵轴是稳态振幅 A。振幅峰在 Ω ≈ ω₀√(1−2ζ²) 处（阻尼小时就是 ω₀），峰高约 F/(2ζω₀²)。品质因数 Q = 1/(2ζ)：阻尼越小，峰越高越窄，半宽约 ω₀/Q。当前 ζ 的曲线为橙色，ζ = 0.05、0.15、0.5 的参考曲线为灰色。',
s3o:'把 ζ 从 0.5 调到 0.05：峰变高变窄；移动 Ω/ω₀，看圆点沿曲线走到峰顶，核对读数里的峰位置与峰高。',
r3:'Ω/ω₀ = {r}，A = {A}；峰位置 Ω/ω₀ = {pk}，峰高 = {ph}；Q = 1/(2ζ) = {Q}，半宽约 {bw}（以 Ω/ω₀ 计）。',
s4t:'相位：响应总是迟到一点',
s4e:'这一步要回答：振子的位置和推力同时到达最大值吗？稳态下，位移比推力滞后一个相位 φ = atan2(2ζω₀Ω, ω₀²−Ω²)：Ω 很低时 φ ≈ 0（跟着推力走），Ω = ω₀ 时 φ = 90°，Ω 很高时 φ ≈ 180°（反着走）。青色是推力，橙色是位移，横轴是时间（约 3 个驱动周期）。',
s4o:'把 Ω/ω₀ 从 0.2 拉到 2：看橙色波相对青色波从同步、落后四分之一周期、直到反相；改 ζ，看在共振附近相位变化是快还是慢。',
r4:'Ω/ω₀ = {r}，ζ = {z}：φ = {phi}°，相当于滞后 {frac} 个周期。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 固有频率 ω₀ = √(k/m)；② 阻尼比 ζ 决定衰减，ζ = 1 临界；③ 周期推力进入稳态后以 Ω 振动，A = F/√((ω₀²−Ω²)² + (2ζω₀Ω)²)；④ Ω 靠近 ω₀ 时振幅最高，阻尼越小峰越高越窄（Q = 1/2ζ）；⑤ 响应相位随 Ω 从 0° 滞后到 180°，共振时 90°。',
qq:'在共振频率上推，把阻尼比 ζ 减半，稳态振幅大约变成原来的几倍？',qo0:'约一半',qo1:'不变',qo2:'约 2 倍',
qwhy:'共振峰高约 F/(2ζω₀²)，与 ζ 成反比，ζ 减半，峰高加倍（第 3 步可验证）。',
s5m:'本页是单自由度线性振子：弹簧力与位移成正比，阻尼力与速度成正比，推力是单一频率的余弦；真实结构有多个固有频率、非线性（振幅大时弹簧不再线性），共振还可能使结构破坏；阻尼比较大时峰会偏离 ω₀；动画是教学慢放。',
lk0:'驻波页：弦上的共振——外力踩中谐波台阶',lk1:'频率响应页：同样的“按频率挑食”，用在线性系统的输入输出上',lk2:'干涉页：对照两列波叠加的加强条件'
},
en:{
pageTitle:'Resonance · Push in Time and a Small Force Goes a Long Way',tagline:'Start from a spring\'s natural beat, see how damping makes oscillations die away, then find the driving frequency at which periodic pushes build the largest swing.',
nav0:'0 Natural frequency',nav1:'1 Damping',nav2:'2 Driven oscillator',nav3:'3 Resonance curve',nav4:'4 Phase lag',nav5:'5 Recap & check',
lK:'Spring stiffness k',lM:'Mass m',lZ:'Damping ratio ζ',lR:'Driving frequency ratio Ω/ω₀',bPlay:'Play / Pause',bReset:'Reset: clear the trace and go back to the start',
s0t:'With nobody pushing, a mass on a spring has its own beat',
s0e:'This step answers: for a mass swinging freely on a spring, what decides how many swings per second? Pull it 1 unit and let go: simple harmonic motion with <strong>natural angular frequency</strong> ω₀ = √(k/m) (k is the spring stiffness, larger means stiffer; m is the mass) and period T = 2π/ω₀. Press play and the trace x(t) is drawn on the right; the "measured period" is the gap between two successive upward zero crossings of the trace, to compare with the formula.',
s0o:'Raise k: it swings faster; raise m: slower. Play one or two periods and check that the measured period equals 2π√(m/k).',
r0:'ω₀ = √(k/m) = {w0}; formula period T = {tp}; period measured from the trace = {tm}; t = {t}.',
none:'not a full period yet',hint:'Press Play to start',
s1t:'Damping: energy leaks away bit by bit',
s1e:'This step answers: how does the motion change once friction (damping) is added? The <strong>damping ratio</strong> ζ measures the damping: ζ = 0 none; ζ < 1 underdamped, the amplitude decays inside an envelope e^(−ζω₀t) (dashed); ζ = 1 critical damping, the fastest return to rest without overshooting; ζ > 1 overdamped, a slow creep back. This page uses ω₀ = 2 (same in later steps). "Successive peak ratio" in the readout is the ratio of two neighbouring peak heights on the curve.',
s1o:'Slowly raise ζ from 0 to 1.6: the envelope goes from no decay, to faster and faster decay, to no oscillation at all; compare the measured peak ratio with e^(−2πζ/√(1−ζ²)).',
r1:'ζ = {z}: {kind}; successive peak ratio: measured {rm}, formula {rf}.',
kUnder:'underdamped (oscillates while decaying)',kCrit:'critically damped (no oscillation, fastest return)',kOver:'overdamped (no oscillation, slow return)',kNone:'undamped (never decays)',
s2t:'Push it periodically: how the swing grows',
s2e:'This step answers: what happens when a damped oscillator is pushed by a periodic force F cos Ωt? The equation is x″ + 2ζω₀x′ + ω₀²x = F cos Ωt (F = 1, ω₀ = 2). The first few cycles are a "transient"; then it settles into a <strong>steady state</strong> oscillating at the driving frequency Ω with fixed amplitude A = F/√((ω₀²−Ω²)² + (2ζω₀Ω)²). Press play: orange is x(t), the dashed cyan line is the push (scaled). The "measured amplitude" is the largest displacement over the last two driving cycles.',
s2o:'Set Ω/ω₀ = 0.5 and play, noting the steady amplitude; then set 1 (pushing at the natural frequency) and replay: how large does it get? Then try 1.6.',
r2:'Ω = {W} (Ω/ω₀ = {r}), ζ = {z}; formula steady amplitude A = {A}; measured max displacement over the last two driving cycles = {Am}; t = {t}.',
s3t:'The resonance curve: only near one frequency does the swing get large',
s3e:'This step answers: sweeping the driving frequency, how does the steady amplitude change? The horizontal axis is Ω/ω₀ and the vertical axis is the steady amplitude A. The peak sits at Ω ≈ ω₀√(1−2ζ²) (essentially ω₀ for light damping) and its height is about F/(2ζω₀²). The quality factor Q = 1/(2ζ): the lighter the damping, the taller and narrower the peak, with half-width about ω₀/Q. The current ζ is orange; grey reference curves are ζ = 0.05, 0.15 and 0.5.',
s3o:'Lower ζ from 0.5 to 0.05: the peak gets taller and narrower; move Ω/ω₀ and watch the dot travel along the curve to the top, then check the peak position and height in the readout.',
r3:'Ω/ω₀ = {r}, A = {A}; peak at Ω/ω₀ = {pk}, peak height = {ph}; Q = 1/(2ζ) = {Q}, half-width about {bw} (in Ω/ω₀ units).',
s4t:'Phase: the response always arrives a little late',
s4e:'This step answers: do the displacement and the push reach their maxima together? In steady state the displacement lags the push by a phase φ = atan2(2ζω₀Ω, ω₀²−Ω²): at very low Ω, φ ≈ 0 (it follows the push), at Ω = ω₀, φ = 90°, and at very high Ω, φ ≈ 180° (it moves against the push). Cyan is the push, orange the displacement; the horizontal axis is time (about 3 driving cycles).',
s4o:'Sweep Ω/ω₀ from 0.2 to 2: the orange wave goes from in step, to a quarter cycle behind, to opposite; change ζ and see whether the phase changes quickly or slowly near resonance.',
r4:'Ω/ω₀ = {r}, ζ = {z}: φ = {phi}°, a lag of {frac} cycle.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) natural frequency ω₀ = √(k/m); (2) damping ratio ζ sets the decay, ζ = 1 is critical; (3) in steady state a periodic push makes it oscillate at Ω with A = F/√((ω₀²−Ω²)² + (2ζω₀Ω)²); (4) the amplitude peaks when Ω is near ω₀, taller and narrower for lighter damping (Q = 1/2ζ); (5) the response lags the push by a phase from 0° to 180°, 90° at resonance.',
qq:'Pushing at the resonance frequency, you halve the damping ratio ζ. About how much does the steady amplitude change?',qo0:'It roughly halves',qo1:'No change',qo2:'It roughly doubles',
qwhy:'The resonance peak is about F/(2ζω₀²), inversely proportional to ζ, so halving ζ doubles it (check in step 3).',
s5m:'This page models a linear single-degree-of-freedom oscillator: spring force proportional to displacement, damping force proportional to velocity, and a single-frequency cosine push. Real structures have several natural frequencies and nonlinearity (springs stop being linear at large amplitude), and resonance can break them; with heavier damping the peak shifts away from ω₀; the animation is a teaching slow-motion.',
lk0:'Standing waves: resonance on a string, where the push hits a harmonic step',lk1:'Frequency response: the same frequency-picking behaviour, applied to a linear system\'s input and output',lk2:'Interference: compare the reinforcement condition for two superposed waves'
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
