const STR={
zh:{
pageTitle:'电场 · 看不见的力画成图',tagline:'从一个点电荷的场出发，叠加、画场线、画等势面，最后放一个电荷看它怎么动。',
nav0:'0 单个电荷的场',nav1:'1 叠加',nav2:'2 场线',nav3:'3 等势线',nav4:'4 释放电荷',nav5:'5 回顾自测',
lQ:'电荷 q',lR:'探测距离 r',lQ1:'电荷 q₁（左）',lQ2:'电荷 q₂（右）',lPx:'探测点 x',lPy:'探测点 y',lDv:'等势线间隔 ΔV',lQm:'试探电荷 q/m',lX0:'起点 x',bPlay:'播放 / 暂停',bReset:'重置：清除尾迹并回到起点',
s0t:'一个电荷周围，空间里每一点都有一个“力的预告”',
s0e:'这一步要回答：<strong>电场</strong>到底是什么，它的大小怎么随距离变？电场 E 的定义：在某点放一个单位正试探电荷，它受到的力。画布上每根箭头是该点的 E：方向就是正试探电荷被推的方向，越长越强（长度做了压缩，便于看清）。点电荷的场 E = kq/r²，本页取 k = 1（教学单位）。',
s0o:'只改电荷 q 的正负，看全部箭头一起掉头；再把探测距离 r 拉到原来的两倍，对比读数里强度变成原来的几分之一。',
dirOut:'背离电荷（向外）',dirIn:'指向电荷（向内）',dirNone:'没有电荷，E = 0',
r0:'q = {q}，探测点 r = {r}：E = kq/r² = {e}，方向：{dir}。r 加倍后 E = {e2}，是现在的 {ratio} 倍。',
s1t:'两个电荷：每个电荷的场在每一点相加',
s1e:'这一步要回答：有多个电荷时，某一点的电场怎么求？<strong>叠加原理</strong>：总场 = 每个电荷单独产生的场的矢量和（把箭头首尾相接）。橙色箭头是 q₁ 在探测点的场，粉色是 q₂ 的，青色是它们的和 E。箭头按最大者缩放，彼此长度比例是真实的。',
s1o:'保持探测点不动，把 q₁、q₂ 设成同号、再设成异号，看青色总箭头怎样由橙、粉两个箭头拼出来；再把探测点移到两电荷正中间，比较两种情形。',
r1:'E₁ = ({e1x}, {e1y})，E₂ = ({e2x}, {e2y})，总场 E = ({ex}, {ey})，|E| = {mag}。',
s2t:'场线：把场画成可以数的曲线',
s2e:'这一步要回答：怎样一眼看出场的整体形状？<strong>电场线</strong>是顺着 E 的方向走的曲线：从正电荷出发，在负电荷终止（或伸向远处）。每个电荷发出的线数与它的电荷量成正比（本页每 1 个单位画 6 条）；线越密的地方场越强；两条线不会相交，因为同一点只有一个 E 的方向。',
s2o:'设 q₁ = +3、q₂ = −1，数读数里有几条线落在负电荷上、几条跑向远处；再把 q₂ 改成正，看线怎样互相绕开。',
r2:'共 {n} 条线：连接两个电荷 {hit} 条，伸向（或来自）远处 {out} 条；净电荷 q₁ + q₂ = {net}。',
s3t:'等势线：沿它走不做功，场线与它垂直',
s3e:'这一步要回答：<strong>电势</strong> V 是什么，它和 E 什么关系？点电荷的电势 V = kq/r（k = 1），表示把单位正电荷从无穷远搬到该点所做的功。电势相同的点连成<strong>等势线</strong>：画布里色带的边界，相邻边界相差 ΔV。电场指向电势下降最快的方向，E = −∇V，所以场线（白色细线）总与等势线垂直。q₁ 固定为 +2。',
s3o:'拖动 ΔV，色带变宽变窄，边界即等势线；移动探测点，看白色短线（等势线切向）是否始终垂直于青色 E 箭头，并核对读数里解析 |E| 与由 V 差分得到的 |E| 是否一致。',
r3:'探测点 V = {v}；解析 |E| = {ea}，由 V 数值差分得 |E| = {en}；E 与等势线切向的夹角 = {ang}°。',
s4t:'释放一个试探电荷：它真的沿场线走吗？',
s4e:'这一步要回答：电荷在场里怎么运动，能量去了哪里？受力 F = qE，加速度 a = (q/m)E（取 m = 1）。点播放，试探电荷从静止出发，轨迹累积成尾迹。因为有惯性，电荷一般<strong>不会</strong>严格沿场线走。能量守恒：动能 ½v² + 势能 (q/m)V 在运动中保持不变（场源 q₁ = +2、q₂ = −2 固定）。',
s4o:'把 q/m 从 +1 改成 −1 再播放，对比尾迹方向；改变起点 x 再播放。读数里的“能量漂移”应接近 0。',
st4idle:'尚未播放',st4run:'运动中',st4pause:'已暂停',st4hit:'已撞到电荷，停止（近距离截断）',st4out:'已飞出画面，停止',
r4:'t = {t}，速度 {v}，动能 {ke}，势能 {pe}，总能量 {tot}（起点 {tot0}，漂移 {drift}%）。状态：{state}',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 电场 E 是单位正试探电荷受的力，点电荷 E = kq/r²；② 多个电荷的场逐点矢量相加；③ 场线从正电荷到负电荷，线数与电荷量成正比；④ V = kq/r，E = −∇V，场线垂直于等势线；⑤ 电荷受力 F = qE，运动中动能与势能之和不变。',
qq:'两个电荷量相同、符号也相同的电荷，在它们连线的正中点，电场是多少？',qo0:'最大，两个场同向叠加',qo1:'0，两个场大小相等、方向相反',qo2:'等于单个电荷场的一半',
qwhy:'两个场大小相等、方向相反，矢量和为 0（第 1 步：把探测点移到正中间可验证）。',
s5m:'本页是二维平面里的静止点电荷、真空静电模型；k = 1 是教学单位，数值不是 SI 值。没有导体、介质、磁场与辐射；试探电荷不改变场源；在 0.15 单位以内截断（真实点电荷此处场趋于无穷）；动画是教学慢放，不是真实电子速度。',
lk0:'干涉页：两个波源的效果也是逐点相加，去看路程差如何决定加强或抵消',lk1:'动量与碰撞页：另一类“守恒账本”，对照这里的能量守恒',lk2:'热力学页：从能量账本出发看功与热，对照这里动能与势能的互换'
},
en:{
pageTitle:'Electric Fields · Drawing an Invisible Force',tagline:'Start with one point charge, then add fields, draw field lines and equipotentials, and finally release a charge to watch it move.',
nav0:'0 One charge',nav1:'1 Superposition',nav2:'2 Field lines',nav3:'3 Equipotentials',nav4:'4 Release a charge',nav5:'5 Recap & check',
lQ:'Charge q',lR:'Probe distance r',lQ1:'Charge q₁ (left)',lQ2:'Charge q₂ (right)',lPx:'Probe x',lPy:'Probe y',lDv:'Contour spacing ΔV',lQm:'Test charge q/m',lX0:'Start x',bPlay:'Play / Pause',bReset:'Reset: clear the trail and go back to the start',
s0t:'Around one charge, every point carries a forecast of the force',
s0e:'This step answers: what is an <strong>electric field</strong>, and how does its strength change with distance? E at a point is the force a unit positive test charge would feel there. Each arrow is E at its position: it points the way a positive test charge would be pushed, and longer means stronger (lengths are compressed so they stay readable). For a point charge E = kq/r²; this page uses k = 1 (teaching units).',
s0o:'Flip only the sign of q and watch every arrow reverse; then double the probe distance r and compare the readouts: by what factor does the strength fall?',
dirOut:'away from the charge (outward)',dirIn:'toward the charge (inward)',dirNone:'no charge, so E = 0',
r0:'q = {q}, probe at r = {r}: E = kq/r² = {e}, direction: {dir}. At 2r, E = {e2}, which is {ratio}× the current value.',
s1t:'Two charges: each one\'s field adds at every point',
s1e:'This step answers: with several charges, how do you find the field at one point? <strong>Superposition</strong>: the total field is the vector sum of the fields each charge would make alone (place the arrows head to tail). The orange arrow is q₁\'s field at the probe, pink is q₂\'s, and cyan is their sum E. Arrows are scaled to fit the largest one; the ratios between them are true.',
s1o:'Keep the probe fixed, set q₁ and q₂ to the same sign and then to opposite signs, and watch how the cyan total is built from the orange and pink arrows. Then move the probe to the midpoint and compare the two cases.',
r1:'E₁ = ({e1x}, {e1y}), E₂ = ({e2x}, {e2y}), total E = ({ex}, {ey}), |E| = {mag}.',
s2t:'Field lines: draw the field as curves you can count',
s2e:'This step answers: how can you see the overall shape of a field at a glance? A <strong>field line</strong> is a curve that follows the direction of E: it leaves positive charges and ends on negative ones (or runs off to far away). The number of lines per charge is proportional to its size (this page draws 6 per unit); denser lines mean a stronger field; two lines never cross because E has only one direction at any point.',
s2o:'Set q₁ = +3 and q₂ = −1, then read how many lines end on the negative charge and how many run off; next make q₂ positive and watch the lines push around each other.',
r2:'{n} lines in total: {hit} connect the two charges, {out} run to (or come from) far away; net charge q₁ + q₂ = {net}.',
s3t:'Equipotentials: no work along them, and field lines cross them at right angles',
s3e:'This step answers: what is the <strong>potential</strong> V, and how does it relate to E? For a point charge V = kq/r (k = 1): the work to bring a unit positive charge in from infinity. Points with equal V form an <strong>equipotential</strong>: the borders between colour bands on the canvas, neighbouring borders differing by ΔV. E points toward the steepest drop in V, E = −∇V, so the field lines (thin white) always cross equipotentials at right angles. q₁ is fixed at +2.',
s3o:'Drag ΔV so the bands get wider or narrower; their borders are the equipotentials. Move the probe and check that the short white tick (the equipotential\'s tangent) stays perpendicular to the cyan E arrow, and that the analytic |E| matches the one found from differences in V.',
r3:'Probe V = {v}; analytic |E| = {ea}; |E| from numerical differences of V = {en}; angle between E and the equipotential tangent = {ang}°.',
s4t:'Release a test charge: does it really follow a field line?',
s4e:'This step answers: how does a charge move in a field, and where does the energy go? The force is F = qE, so the acceleration is a = (q/m)E (take m = 1). Press play: the test charge starts from rest and its path builds up as a trail. Because of inertia it generally does <strong>not</strong> follow a field line exactly. Energy is conserved: kinetic ½v² plus potential (q/m)V stays constant (sources q₁ = +2, q₂ = −2 are fixed).',
s4o:'Change q/m from +1 to −1 and play again to compare trail directions; then change the start x and play again. The energy drift in the readout should stay near 0.',
st4idle:'not started',st4run:'running',st4pause:'paused',st4hit:'hit a charge, stopped (close-range cut-off)',st4out:'left the view, stopped',
r4:'t = {t}, speed {v}, kinetic {ke}, potential {pe}, total {tot} (start {tot0}, drift {drift}%). State: {state}',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) E is the force on a unit positive test charge; for a point charge E = kq/r²; (2) fields from several charges add as vectors, point by point; (3) field lines run from positive to negative charges, with line count proportional to charge; (4) V = kq/r and E = −∇V, so field lines cross equipotentials at right angles; (5) a charge feels F = qE, and its kinetic plus potential energy stays constant.',
qq:'Two charges of equal size and the same sign: what is the field at the midpoint of the line joining them?',qo0:'The largest, because the two fields point the same way',qo1:'Zero, because the two fields are equal and opposite',qo2:'Half the field of a single charge',
qwhy:'The two fields are equal in size and opposite in direction, so their vector sum is 0 (step 1: move the probe to the midpoint to check).',
s5m:'This page models stationary point charges in a 2D plane in vacuum electrostatics. k = 1 is a teaching unit, so the numbers are not SI values. It leaves out conductors, dielectrics, magnetic fields and radiation; the test charge does not disturb the sources; motion is cut off within 0.15 units (a real point charge has an unbounded field there); the animation is a teaching slow-motion, not a real electron speed.',
lk0:'Interference: two sources also add point by point; see how path difference decides reinforcement or cancellation',lk1:'Momentum & collisions: another conservation ledger to compare with energy conservation here',lk2:'Thermodynamics: follow work and heat through an energy ledger, like the kinetic/potential exchange here'
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
