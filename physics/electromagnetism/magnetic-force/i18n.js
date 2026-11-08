const STR={
zh:{
pageTitle:'磁场与洛伦兹力 · 力总是垂直于速度',tagline:'从一个带电粒子在磁场里“拐弯”出发，推出圆半径、周期，再用它称离子质量、挑选速度。',
nav0:'0 力垂直于速度',nav1:'1 画圆',nav2:'2 周期与速度无关',nav3:'3 称离子质量',nav4:'4 电场加磁场',nav5:'5 回顾自测',slit:'狭缝',
lAng:'速度方向角',lQ:'电荷 q',lB:'磁感应强度 B',lV:'速率 v',lM:'质量 m',lMu:'未知离子质量 m',lE:'电场 E',bPlay:'播放 / 暂停',bReset:'重置：清除轨迹并回到起点',
s0t:'磁场里的力：总是垂直于速度',
s0e:'这一步要回答：带电粒子在磁场里受的力朝哪个方向？<strong>洛伦兹力</strong> F = q v × B。本页磁场 B 垂直指出屏幕（画面里的小点），粒子在屏幕平面内运动，所以 F 的大小是 q v B，方向垂直于速度 v。圆点是正电荷，青色箭头是速度 v，橙色箭头是力 F，虚线弧是力会把它带出的方向。',
s0o:'拖动速度方向角：看橙色箭头始终与青色箭头成 90°；把 q 改成负数，力反向；把 q 改成 0，力消失。',
r0:'v = ({vx}, {vy})，F = qv×B = ({fx}, {fy})，|F| = {f}；F·v = {dot}，所以磁力不做功、速率不变。',
s1t:'垂直的力把直线运动弯成圆',
s1e:'这一步要回答：粒子会走出什么轨迹，半径多大？力始终垂直于速度，只改变方向不改变速率，于是粒子做匀速圆周运动，向心力就是洛伦兹力：q v B = m v²/r，所以 <strong>r = m v / (q B)</strong>（本页 m = 1，|q| = 1）。点播放，轨迹随时间累积；“实测半径”是用轨迹上三个点算出的外接圆半径，与公式对照。',
s1o:'先播放一圈；再把速率 v 加倍重播：半径变成几倍？再把 B 加倍：半径又怎样变？对照读数里的公式半径与实测半径。',
r1:'公式 r = mv/(qB) = {r}；轨迹三点实测半径 = {rm}；已运动 t = {t}，转过 {turns} 圈。',
rNone:'轨迹太短，暂无',
s2t:'绕一圈要多久？与速度无关',
s2e:'这一步要回答：快的粒子是不是绕一圈更快？周期 T = 2πr/v，把 r = mv/(qB) 代入得 <strong>T = 2πm/(qB)</strong>：v 约掉了。画面里三个粒子同时从顶部出发，速率为 0.6、1.2、1.8（半径各不相同），点播放看它们是否同时回到顶部。',
s2o:'播放，看三个点何时一起回到顶部；然后改 B 或质量 m：周期变了，三个点仍然一起回到顶部。',
r2:'三个半径 r = {r1} / {r2} / {r3}；周期 T = 2πm/(qB) = {tp}；已运动 t = {t}，完成 {laps} 圈，三个粒子相位差 = {dphi}°。',
s3t:'用半圆称离子：落点位置读出质量',
s3e:'这一步要回答：怎样用磁场测一个未知离子的质量？质谱仪里，离子以相同速率 v = 1 从缝口射入，在磁场里转半圈后落在距缝口 2r 处，r = mv/(qB)。落点越远，质量越大。图中三条灰线是已知质量 1、2、3 的离子，橙色是未知离子；用它的落点位置反推质量：m = qB·x / (2v)。',
s3o:'拖动未知质量，看橙色半圆的落点沿着底线移动；改 B：所有落点一起缩放，但反推出的质量不变。',
r3:'落点 x = 2r = {x}；由落点反推 m = qB·x/(2v) = {m}（设定值 {ms}）。',
s4t:'再加一个电场：只有一种速率能走直线',
s4e:'这一步要回答：怎样挑出某一速率的粒子？在 B 之外再加竖直向上的电场 E，电力 qE 与磁力 qvB 方向相反。两力相等时粒子走直线，即 <strong>v = E / B</strong>（与电荷正负、质量无关）；否则粒子沿一条漂移的摆线弯向一侧。本页 B = 1，粒子从左端向右射入。',
s4o:'把速率 v 调到读数里的 E/B：轨迹拉成直线；比它大或小，看向哪一边弯；再改 E，看“选中速率”随之移动。',
r4:'选中速率 E/B = {vs}；当前 v = {v}，{case}；走完 {len} 单位水平距离后竖直偏移 y = {dy}。',
caseOk:'两力相等，走直线',caseHigh:'磁力更大，向下偏',caseLow:'电力更大，向上偏',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① F = qv×B 垂直于 v，不做功；② 于是 r = mv/(qB)；③ T = 2πm/(qB)，与 v 无关；④ 落点 2r 读出质量；⑤ 加电场后 v = E/B 的粒子走直线。',
qq:'质子（电荷 +e，质量 m）与 α 粒子（电荷 +2e，质量约 4m）以相同速率垂直射入同一磁场，谁的圆半径大？',qo0:'α 粒子，半径约是质子的 2 倍',qo1:'两者相同',qo2:'质子更大',
qwhy:'r = mv/(qB)：α 粒子 m/q 是质子的 4/2 = 2 倍，半径大 2 倍（第 1 步可验证）。',
s5m:'本页是均匀、恒定磁场中的单个带电粒子，经典力学，忽略辐射损失与相对论效应；m = 1、|q| = 1 为教学单位（第 3、4 步沿用）；第 4 步 E 与 B 均匀；粒子之间不相互作用；动画是教学慢放，不是真实粒子速度。',
lk0:'电场页：对照电场力 qE 如何做功、与磁力怎样不同',lk1:'动量与碰撞页：力×时间 = 动量改变，对照“只改方向不改速率”'
},
en:{
pageTitle:'Magnetic Force · The Force Is Always Sideways to the Velocity',tagline:'Start with a charged particle bending in a magnetic field, derive its radius and period, then use them to weigh ions and pick out a speed.',
nav0:'0 Sideways force',nav1:'1 Circles',nav2:'2 Period vs speed',nav3:'3 Weigh an ion',nav4:'4 Add an E field',nav5:'5 Recap & check',slit:'slit',
lAng:'Velocity angle',lQ:'Charge q',lB:'Magnetic field B',lV:'Speed v',lM:'Mass m',lMu:'Unknown ion mass m',lE:'Electric field E',bPlay:'Play / Pause',bReset:'Reset: clear the trail and go back to the start',
s0t:'The force in a magnetic field is always sideways to the velocity',
s0e:'This step answers: which way does a magnetic field push a moving charge? The <strong>Lorentz force</strong> is F = q v × B. Here B points straight out of the screen (the small dots) and the particle moves in the screen plane, so |F| = q v B and F is perpendicular to the velocity v. The dot is a positive charge, the cyan arrow is v, the orange arrow is F, and the dashed arc shows where the force starts to carry it.',
s0o:'Drag the velocity angle and watch the orange arrow stay at 90° to the cyan one; make q negative and the force reverses; set q to 0 and it disappears.',
r0:'v = ({vx}, {vy}), F = qv×B = ({fx}, {fy}), |F| = {f}; F·v = {dot}, so the magnetic force does no work and the speed does not change.',
s1t:'A sideways force bends a straight path into a circle',
s1e:'This step answers: what path does the particle follow, and how big is it? The force is always perpendicular to the velocity, so it changes direction but not speed: uniform circular motion with the Lorentz force as the centripetal force, q v B = m v²/r, hence <strong>r = m v / (q B)</strong> (this page uses m = 1, |q| = 1). Press play and the path builds up over time; "measured radius" is the circumradius of three points on the trail, to compare with the formula.',
s1o:'Play one lap; then double the speed v and replay: by what factor does the radius change? Then double B: what happens now? Compare the formula radius with the measured one.',
r1:'Formula r = mv/(qB) = {r}; radius measured from three trail points = {rm}; t = {t}, {turns} turns so far.',
rNone:'trail too short yet',
s2t:'How long does one lap take? It does not depend on speed',
s2e:'This step answers: does a faster particle go round faster? The period is T = 2πr/v; substituting r = mv/(qB) gives <strong>T = 2πm/(qB)</strong>: v cancels. Three particles with speeds 0.6, 1.2 and 1.8 (different radii) start together at the top; press play and see whether they get back to the top at the same time.',
s2o:'Play and watch whether the three dots return to the top together; then change B or the mass m: the period changes, yet the three still return together.',
r2:'Radii r = {r1} / {r2} / {r3}; period T = 2πm/(qB) = {tp}; t = {t}, {laps} laps done, phase spread between the three = {dphi}°.',
s3t:'Weigh an ion with a half circle: the landing spot gives the mass',
s3e:'This step answers: how can a magnetic field measure an unknown ion\'s mass? In a mass spectrometer, ions enter a slit at the same speed v = 1, turn through half a circle and land 2r from the slit, with r = mv/(qB). Farther landing means heavier. The three grey paths are known masses 1, 2, 3; orange is the unknown ion, whose mass is recovered from its landing spot: m = qB·x / (2v).',
s3o:'Drag the unknown mass and watch the orange landing point slide along the baseline; change B: every landing point rescales, but the recovered mass does not change.',
r3:'Landing x = 2r = {x}; recovered m = qB·x/(2v) = {m} (set value {ms}).',
s4t:'Add an electric field: only one speed goes straight',
s4e:'This step answers: how can you select particles of one speed? Besides B, add a vertical upward electric field E, so the electric force qE opposes the magnetic force qvB. When they balance the particle goes straight: <strong>v = E / B</strong> (independent of the sign of the charge and of the mass); otherwise it follows a drifting cycloid that curves to one side. Here B = 1 and the particle enters from the left, moving right.',
s4o:'Set the speed v to the E/B shown in the readout and the path straightens; go above or below it and see which way it bends; then change E and watch the selected speed move.',
r4:'Selected speed E/B = {vs}; current v = {v}, {case}; after {len} units of horizontal travel the vertical offset is y = {dy}.',
caseOk:'forces balance, straight line',caseHigh:'magnetic force wins, bends down',caseLow:'electric force wins, bends up',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) F = qv×B is perpendicular to v and does no work; (2) so r = mv/(qB); (3) T = 2πm/(qB), independent of v; (4) the landing point 2r reads out the mass; (5) with an added E field, particles with v = E/B go straight.',
qq:'A proton (charge +e, mass m) and an alpha particle (charge +2e, mass about 4m) enter the same magnetic field at the same speed, perpendicular to it. Which circle is bigger?',qo0:'The alpha particle, about twice the proton\'s radius',qo1:'They are the same',qo2:'The proton\'s',
qwhy:'r = mv/(qB): the alpha particle\'s m/q is 4/2 = 2 times the proton\'s, so its radius is twice as large (check in step 1).',
s5m:'This page models a single charged particle in a uniform, constant magnetic field using classical mechanics, ignoring radiation losses and relativity. m = 1 and |q| = 1 are teaching units (kept in steps 3 and 4); in step 4 E and B are uniform; particles do not interact; the animation is a teaching slow-motion, not a real particle speed.',
lk0:'Electric fields: compare how the electric force qE does work and the magnetic force does not',lk1:'Momentum & collisions: force × time = change in momentum, to contrast with a force that only turns the velocity'
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
