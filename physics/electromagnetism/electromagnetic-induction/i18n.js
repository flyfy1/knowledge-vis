const STR={
zh:{
pageTitle:'电磁感应 · 磁通量一变，电压就来',tagline:'让磁铁穿过线圈，看磁通量的变化率怎样变成电压，再看楞次定律如何定方向、转动线圈如何发电。',
nav0:'0 磁通量',nav1:'1 变化率就是电压',nav2:'2 楞次定律',nav3:'3 匝数与速度',nav4:'4 发电机',nav5:'5 回顾自测',
lZ:'磁铁位置 z',lW:'磁铁往复角频率 ω',lV:'磁铁速度 v',lN:'线圈匝数 N',lWr:'线圈转速 ω',lB:'磁感应强度 B',bPlay:'播放 / 暂停',bReset:'重置：清除曲线并回到起点',bFlip:'翻转磁铁（N、S 对调）',
s0t:'先量一量：有多少磁场“穿过”线圈',
s0e:'这一步要回答：<strong>磁通量</strong>Φ 是什么，随磁铁位置怎样变？磁通量 = 垂直穿过线圈平面的磁场总量（磁场强度 × 面积，考虑方向）。图中线圈是竖着的圆环，磁铁（右端 N、左端 S）沿轴线移动。磁铁在线圈中心时穿过最多，离远了迅速减小。Φ(z) = 1 / (1 + z²)^{3/2}（线圈半径 = 1，磁偶极子近似，教学单位）。',
s0o:'拖动磁铁位置 z：看下方曲线上的圆点沿曲线移动，对照读数里 Φ 的值：z = 0 时最大，|z| 越大越小。',
r0:'z = {z}：Φ = 1/(1+z²)^{3/2} = {phi}（相对于最大值 {pct}%）。',
s1t:'磁通量变化得越快，电压越大',
s1e:'这一步要回答：线圈两端的电压从哪里来？<strong>法拉第定律</strong>：感应电动势 ε = −N dΦ/dt（N 是匝数，这里 N = 1），即磁通量对时间的变化率；Φ 不变就没有电压。磁铁按 z = 3 sin ωt 往复穿过线圈。点播放：青色是 Φ(t)，橙色是 ε(t)，曲线随时间累积在右侧。',
s1o:'播放后注意：Φ 在最高点（磁铁在线圈中心）时 ε = 0，Φ 变化最陡处 ε 最大；把 ω 加倍重播，ε 的峰值变成几倍？',
r1:'t = {t}：Φ = {phi}，ε = −dΦ/dt = {eps}；到目前为止 |ε| 峰值 = {peak}。',
hint1:'按“播放”开始',
s2t:'楞次定律：感应电流总是反对变化',
s2e:'这一步要回答：感应电流朝哪个方向转？<strong>楞次定律</strong>：感应电流产生的磁场总是反抗磁通量的变化（变大就削弱，变小就补偿）。从右侧（+z 一侧）看，逆时针电流产生向右（+z）的磁场。磁铁在线圈左边 z = −1.5，速度 v 为正表示靠近。画面中绿色是感应电流，粉色箭头是它产生的磁场。',
s2o:'把 v 从正拉到负（靠近变远离）：电流方向反转；再点翻转磁铁：电流再次反转；v = 0：没有电流。',
r2:'磁通量变化率 dΦ/dt = {dphi}（{trend}）；ε = {eps}；感应电流{dir}，其磁场指向 {bdir}。',
trendUp:'增大',trendDown:'减小',trendNone:'不变',dirCcw:'沿逆时针（从 +z 一侧看）',dirCw:'沿顺时针（从 +z 一侧看）',dirNone:'为零',bRight:'+z（向右）',bLeft:'−z（向左）',bNone:'无',
s3t:'匝数与速度：各自放大电压',
s3e:'这一步要回答：怎样得到更大的电压？ε = −N dΦ/dt：匝数 N 越多，每匝的电压叠加；磁铁运动越快，dΦ/dt 越大。灰色是 N = 1、ω = 1 的基准曲线（一个周期），橙色是当前设置，同一时间轴。读数里的峰值由对一个周期逐点计算得到。',
s3o:'只改 N：曲线形状不变，高度按比例放大；只改 ω：曲线变高也变窄。核对读数里“峰值比”是否等于 N × ω。',
r3:'峰值 |ε| = {peak}（基准 {base}），峰值比 = {ratio}；N × ω = {nw}。周期 = {per}。',
s4t:'发电机：转动线圈，磁通量自己在变',
s4e:'这一步要回答：不动磁铁，怎样让磁通量变化？在匀强磁场 B 里转动面积 A = 1 的线圈：Φ = BA cos θ，θ = ωt。于是 ε = BAω sin ωt，是一条正弦波，峰值 BAω。点播放：左边是线圈（侧视），右边是 Φ（青）与 ε（橙）累积的曲线。',
s4o:'播放后调大 ω：正弦变密、变高；调大 B：变高但疏密不变。注意线圈与磁场垂直（Φ 最大）时 ε = 0。',
r4:'f = ω/2π = {f}；峰值 BAω = {peak}；有效值 = 峰值/√2 = {rms}（对一周期数值均方根 {rmsn}）；t = {t}，θ = {th}°，ε = {eps}。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 磁通量 Φ 是穿过线圈的磁场总量；② ε = −N dΦ/dt，变化率才产生电压；③ 楞次定律给出方向：反抗变化；④ 匝数和速度各自成比例放大 ε；⑤ 转动线圈得到正弦交流电，峰值 BAω。',
qq:'线圈匝数加倍、磁铁往复的角频率也加倍，感应电动势的峰值变为原来的几倍？',qo0:'2 倍',qo1:'3 倍',qo2:'4 倍',
qwhy:'峰值 ∝ N × ω，两个因子各乘 2，共 4 倍（第 3 步的“峰值比”可验证）。',
s5m:'本页用磁偶极子近似、线圈半径为 1 的教学单位，忽略线圈自感与电阻（电压不产生反作用力）；第 1 步和第 3 步里磁铁运动按给定函数，不受线圈电流反作用（真实情况下按楞次定律会受阻力）；第 4 步 B 均匀、线圈无负载。动画是教学慢放。',
lk0:'磁场页：感应电动势的微观来源是磁力作用在导线里的电荷上',lk1:'导数页：ε = −dΦ/dt 就是变化率，去看导数怎样一步步定义'
},
en:{
pageTitle:'Electromagnetic Induction · Change the Flux, Get a Voltage',tagline:'Pass a magnet through a coil, see how the rate of change of flux becomes a voltage, then how Lenz\'s law sets the direction and a spinning coil makes a generator.',
nav0:'0 Flux',nav1:'1 Rate of change = voltage',nav2:'2 Lenz\'s law',nav3:'3 Turns and speed',nav4:'4 Generator',nav5:'5 Recap & check',
lZ:'Magnet position z',lW:'Magnet oscillation frequency ω',lV:'Magnet velocity v',lN:'Coil turns N',lWr:'Coil rotation rate ω',lB:'Magnetic field B',bPlay:'Play / Pause',bReset:'Reset: clear the curves and go back to the start',bFlip:'Flip the magnet (swap N and S)',
s0t:'First, measure how much field passes through the coil',
s0e:'This step answers: what is <strong>magnetic flux</strong> Φ, and how does it depend on the magnet\'s position? Flux is the total magnetic field passing perpendicularly through the coil\'s plane (field strength × area, with sign). The coil is the upright ring; the magnet (N at the right end, S at the left) slides along the axis. Flux is largest with the magnet at the centre and drops quickly farther away. Φ(z) = 1 / (1 + z²)^{3/2} (coil radius = 1, dipole approximation, teaching units).',
s0o:'Drag the magnet position z: the dot on the curve below follows, and the readout gives Φ — largest at z = 0, smaller as |z| grows.',
r0:'z = {z}: Φ = 1/(1+z²)^{3/2} = {phi} ({pct}% of the maximum).',
s1t:'The faster the flux changes, the bigger the voltage',
s1e:'This step answers: where does the voltage across the coil come from? <strong>Faraday\'s law</strong>: the induced emf is ε = −N dΦ/dt (N is the number of turns, here N = 1), the rate of change of flux; if Φ is steady there is no voltage. The magnet swings through the coil as z = 3 sin ωt. Press play: cyan is Φ(t), orange is ε(t), and the curves build up on the right as time passes.',
s1o:'After playing, notice ε = 0 where Φ peaks (magnet at the centre) and ε is largest where Φ changes fastest; double ω and replay: by what factor does the peak of ε change?',
r1:'t = {t}: Φ = {phi}, ε = −dΦ/dt = {eps}; peak |ε| so far = {peak}.',
hint1:'Press Play to start',
s2t:'Lenz\'s law: the induced current opposes the change',
s2e:'This step answers: which way does the induced current circulate? <strong>Lenz\'s law</strong>: the field made by the induced current opposes the change in flux (it weakens an increase and compensates a decrease). Seen from the right (+z side), a counter-clockwise current makes a field pointing right (+z). The magnet sits left of the coil at z = −1.5; a positive velocity v means approaching. Green is the induced current and the pink arrow is the field it makes.',
s2o:'Swing v from positive to negative (approach to retreat): the current reverses; press flip: it reverses again; at v = 0 there is no current.',
r2:'Flux rate dΦ/dt = {dphi} ({trend}); ε = {eps}; induced current is {dir}, its field points {bdir}.',
trendUp:'increasing',trendDown:'decreasing',trendNone:'steady',dirCcw:'counter-clockwise (seen from the +z side)',dirCw:'clockwise (seen from the +z side)',dirNone:'zero',bRight:'+z (right)',bLeft:'−z (left)',bNone:'nowhere',
s3t:'Turns and speed: each scales the voltage',
s3e:'This step answers: how do you get a bigger voltage? ε = −N dΦ/dt: more turns N add up the voltage of each turn, and a faster magnet makes dΦ/dt larger. Grey is the baseline N = 1, ω = 1 (one period); orange is the current setting, on the same axes. The peak in the readout is found by evaluating one full period point by point.',
s3o:'Change only N: the shape stays, the height scales; change only ω: the curve gets taller and narrower. Check that the "peak ratio" in the readout equals N × ω.',
r3:'Peak |ε| = {peak} (baseline {base}), peak ratio = {ratio}; N × ω = {nw}. Period = {per}.',
s4t:'A generator: spin the coil and the flux changes by itself',
s4e:'This step answers: without moving the magnet, how can flux change? Spin a coil of area A = 1 in a uniform field B: Φ = BA cos θ with θ = ωt. Then ε = BAω sin ωt, a sine wave with peak BAω. Press play: the coil (side view) is on the left, and the Φ (cyan) and ε (orange) curves build up on the right.',
s4o:'After playing, raise ω: the sine gets denser and taller; raise B: taller but the same spacing. Notice ε = 0 when the coil is perpendicular to the field (Φ at its maximum).',
r4:'f = ω/2π = {f}; peak BAω = {peak}; RMS = peak/√2 = {rms} (numerical RMS over one period {rmsn}); t = {t}, θ = {th}°, ε = {eps}.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) flux Φ is the total field through the coil; (2) ε = −N dΦ/dt, so only change produces voltage; (3) Lenz\'s law gives the direction: oppose the change; (4) turns and speed each scale ε; (5) a spinning coil gives a sine-wave alternating voltage with peak BAω.',
qq:'You double the number of turns and also double the magnet\'s oscillation frequency. By what factor does the peak emf change?',qo0:'2 times',qo1:'3 times',qo2:'4 times',
qwhy:'Peak ∝ N × ω, and each factor doubles, so 4 times (check with the "peak ratio" in step 3).',
s5m:'This page uses a dipole approximation and a coil of radius 1 in teaching units, ignoring the coil\'s self-inductance and resistance (so no current feeds back on the magnet); in steps 1 and 3 the magnet follows a given motion, while in reality Lenz\'s law would brake it; in step 4 B is uniform and the coil has no load. The animation is a teaching slow-motion.',
lk0:'Magnetic force: the microscopic origin of an emf is the magnetic force on charges in the wire',lk1:'Derivative: ε = −dΦ/dt is a rate of change; see how the derivative is built up'
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
