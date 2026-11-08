const STR={
zh:{
pageTitle:'滴定曲线 · 终点附近 pH 的“悬崖”',tagline:'往酸里一滴滴加碱：pH 先缓慢爬升，在等当点附近陡然跳升；指示剂变色要对准这个跳升。',
nav0:'0 滴加碱',nav1:'1 突跃',nav2:'2 弱酸',nav3:'3 指示剂',nav4:'4 测未知浓度',nav5:'5 回顾自测',
lV:'已加入的碱 V（mL）',lPka:'弱酸的 pKₐ',lC:'酸与碱的浓度 c = 10^x（mol/L）',aStrong:'强酸（如盐酸 HCl）',aWeak:'弱酸（如醋酸，Kₐ = 1.8×10⁻⁵）',iMoN:'甲基橙',iBtbN:'溴百里酚蓝',iPpN:'酚酞',iMo:'甲基橙（变色 pH 3.1–4.4）',iBtb:'溴百里酚蓝（变色 pH 6.0–7.6）',iPp:'酚酞（变色 pH 8.2–10）',bRead:'我看到终点了：读出结果',bNew:'换一个未知浓度的酸',
s0t:'一滴一滴加碱：酸被中和，pH 怎么变？',
s0e:'这一步要回答：往酸里加碱，pH 随加入量怎样变化？我们用 0.100 mol/L 的氢氧化钠（碱）滴定 25.0 mL、0.100 mol/L 的酸。加入的碱与酸等物质的量时叫<strong>等当点</strong>（本页 V = 25.0 mL）。右图横轴是加入的碱体积 V，纵轴是 pH（pH = −log₁₀[H⁺]，越小越酸），曲线画到当前 V 为止。强酸：酸完全电离；弱酸：只有一部分电离（醋酸），所以起点 pH 更高。',
s0o:'先选强酸，把 V 从 0 慢慢拉到 50：留意曲线前段几乎水平、在 25 mL 前后突然竖起；再切换到弱酸，比较起点和等当点处的 pH。',
r0:'{kind}：V = {v} mL，pH = {ph}；等当点 V = {veq} mL。{note}',
nBefore:'酸还有剩余，pH < 等当点值。',nAt:'恰好等当。',nAfter:'碱已过量。',
s1t:'突跃：等当点附近 1 滴就让 pH 跳几个单位',
s1e:'这一步要回答：为什么说滴定要在终点附近“慢一点”？看斜率 dpH/dV（每加 1 mL 碱，pH 变多少）：前段斜率很小，接近等当点时斜率陡增，在等当点处最大。下方橙色柱是当前位置的斜率；读数里的“斜率最大处”是对整条曲线逐点计算得到的，应当与等当点 V = 25 mL 吻合。',
s1o:'把 V 从 20 拉到 30，每次 0.5 mL：看橙色斜率柱先升高、在 25 mL 达到最大再下降；比较强酸与弱酸的最大斜率谁更大。',
r1:'{kind}：V = {v} mL，pH = {ph}，斜率 dpH/dV = {slope} pH/mL；整条曲线斜率最大处 V = {vmax} mL（等当点 {veq} mL）。',
s2t:'弱酸：半等当点的 pH 就是 pKₐ',
s2e:'这一步要回答：怎样从滴定曲线读出弱酸的强度？弱酸 HA 的电离常数 Kₐ 越小越弱，pKₐ = −log₁₀Kₐ。滴到一半（V = 12.5 mL，半等当点）时，一半的 HA 变成了 A⁻，两者浓度相等，pH ≈ pKₐ（亨德森–哈塞尔巴尔赫公式，见缓冲溶液页）。而等当点时溶液里只剩下 A⁻，它会和水反应生成少量 OH⁻，所以 pH 大于 7。灰色是强酸的曲线，橙色是当前 pKₐ 的弱酸。',
s2o:'拖动 pKₐ 从 3 到 7：橙色曲线起点升高，半等当点（竖线）处的 pH 跟着 pKₐ 走；对照读数里“半等当点 pH”和 pKₐ，以及等当点 pH 是否大于 7。',
r2:'pKₐ = {pka}：半等当点（V = {vh} mL）pH = {phh}（理论 ≈ pKₐ）；等当点 pH = {phe}；当前 V = {v} mL，pH = {ph}。',
s3t:'指示剂：变色范围必须落在突跃里',
s3e:'这一步要回答：用哪种指示剂才能准确判断终点？<strong>指示剂</strong>是一种弱酸，它的酸式和碱式颜色不同；pH 接近它的 pKᵢₙ 时变色。滴定时我们把指示剂变色（pH = pKᵢₙ）的那一刻当作终点。如果变色点不在突跃之内，终点就会提前或推后：读数给出终点与真正的等当点之差。浓度 c（对数滑块）越小，突跃越短，选择余地越小。',
s3o:'选强酸 + 酚酞，误差接近 0；换成甲基橙看误差；再切换成弱酸，对比三种指示剂，哪种适合？把浓度调到 10⁻³，看哪些指示剂仍然可用。',
r3:'{acid} + {ind}：突跃范围 pH {lo}–{hi}（对应 V = {v1}–{v2} mL）；指示剂变色点 pH = {pk} 对应终点 V = {ve} mL，与等当点（{veq} mL）相差 {err} mL（{rel}% ）。',
s4t:'实战：测一个未知浓度的盐酸',
s4e:'这一步要回答：怎样用滴定求出未知浓度？25.0 mL 未知浓度的盐酸，加入酚酞，用 0.100 mol/L 氢氧化钠滴定。酸与碱按 1:1 反应，所以等当点时 c酸·25.0 = 0.100·V，即 c酸 = 0.100·V/25.0。拖动 V，直到烧杯变成淡粉色（刚变色就停），点“读出结果”，页面会给出你的估算值、真实值和误差。',
s4o:'先大步拉到烧杯颜色刚要变，再用 0.1 mL 一格细调，在刚出现淡粉时点读出结果；误差应小于 1%。想想为什么越靠近终点越要小步。',
r4:'当前 V = {v} mL，烧杯颜色：{col}；尚未读出结果。',
colNone:'无色（pH {ph}）',colPink:'粉色（pH {ph}）',
r4done:'你读到 V = {v} mL → 估算 c = 0.100×{v}/25.0 = {c} mol/L；真实值 {ct} mol/L，误差 {err}%。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 滴定曲线 pH–V，等当点是酸碱恰好等物质的量；② 突跃：等当点附近斜率最大；③ 弱酸：半等当点 pH = pKₐ，等当点 pH > 7；④ 指示剂的变色点要落在突跃内，浓度越低突跃越短；⑤ 等当点处 c酸V酸 = c碱V碱（一元酸碱）。',
qq:'用强碱滴定弱酸时，滴到加入的碱恰好是等当点体积的一半，溶液的 pH 约等于什么？',qo0:'7',qo1:'14',qo2:'该弱酸的 pKₐ',
qwhy:'半等当点处 [HA] = [A⁻]，所以 pH = pKₐ（第 2 步可验证）。',
s5m:'本页是一元酸被一元强碱滴定的理想模型：25.0 mL 酸、碱浓度 0.100 mol/L（第 3 步可调浓度）；pH 由电荷平衡数值求解（强酸完全电离，弱酸用 Kₐ，Kw = 10⁻¹⁴，25 °C）；忽略活度系数（高浓度时不准）、CO₂ 溶入、温度变化和指示剂自身消耗的碱；指示剂变色点取 pH = pKᵢₙ，真实变色是渐变的，肉眼判断有 ±0.5 个 pH 左右的不确定。',
lk0:'缓冲溶液页：半等当点附近的平缓段就是缓冲区，看缓冲容量',lk1:'酸碱平衡页：Kₐ 是什么，HA 怎样在两个方向上来回',lk2:'化学平衡页：滴定背后“酸 ⇌ 共轭碱”的动态平衡'
},
en:{
pageTitle:'Titration Curves · The pH Cliff Near the End Point',tagline:'Add base to acid drop by drop: pH creeps up, then leaps near the equivalence point; the indicator must change colour right on that leap.',
nav0:'0 Adding base',nav1:'1 The leap',nav2:'2 Weak acid',nav3:'3 Indicators',nav4:'4 Unknown concentration',nav5:'5 Recap & check',
lV:'Base added V (mL)',lPka:'Weak acid pKₐ',lC:'Acid and base concentration c = 10^x (mol/L)',aStrong:'Strong acid (e.g. HCl)',aWeak:'Weak acid (e.g. acetic, Kₐ = 1.8×10⁻⁵)',iMoN:'methyl orange',iBtbN:'bromothymol blue',iPpN:'phenolphthalein',iMo:'Methyl orange (range pH 3.1–4.4)',iBtb:'Bromothymol blue (range pH 6.0–7.6)',iPp:'Phenolphthalein (range pH 8.2–10)',bRead:'I see the end point: read the result',bNew:'Try another acid of unknown concentration',
s0t:'Add base drop by drop: the acid is neutralised, how does pH change?',
s0e:'This step answers: as base is added to an acid, how does pH change with the amount added? We titrate 25.0 mL of 0.100 mol/L acid with 0.100 mol/L sodium hydroxide (base). When the base added equals the acid in moles, that is the <strong>equivalence point</strong> (V = 25.0 mL here). In the plot the horizontal axis is the volume V of base added and the vertical axis is pH (pH = −log₁₀[H⁺]; lower is more acidic); the curve is drawn up to the current V. A strong acid ionises completely; a weak acid (acetic) only partly, so its starting pH is higher.',
s0o:'Start with the strong acid and slowly drag V from 0 to 50: notice the curve is almost flat at first and shoots up around 25 mL; then switch to the weak acid and compare the starting pH and the pH at the equivalence point.',
r0:'{kind}: V = {v} mL, pH = {ph}; equivalence point at V = {veq} mL. {note}',
nBefore:'Acid is still left over, so pH is below the equivalence value.',nAt:'Exactly at equivalence.',nAfter:'Base is now in excess.',
s1t:'The leap: near equivalence one drop shifts pH by several units',
s1e:'This step answers: why must you go slowly near the end point? Look at the slope dpH/dV (how much pH changes per mL of base): small early on, rising steeply near the equivalence point and largest right at it. The orange bar below is the slope at the current position; the "steepest point" in the readout is found by scanning the whole curve and should match the equivalence point at V = 25 mL.',
s1o:'Move V from 20 to 30 in 0.5 mL steps: the orange slope bar rises, peaks at 25 mL and falls again; compare which acid, strong or weak, has the larger maximum slope.',
r1:'{kind}: V = {v} mL, pH = {ph}, slope dpH/dV = {slope} pH/mL; steepest point on the whole curve at V = {vmax} mL (equivalence {veq} mL).',
s2t:'Weak acid: the pH at half equivalence is the pKₐ',
s2e:'This step answers: how can you read a weak acid\'s strength from its titration curve? The weak acid HA has ionisation constant Kₐ (smaller means weaker) and pKₐ = −log₁₀Kₐ. Halfway (V = 12.5 mL, the half-equivalence point), half the HA has become A⁻ so the two have equal concentrations and pH ≈ pKₐ (the Henderson–Hasselbalch equation, see the buffer page). At the equivalence point only A⁻ remains, and it reacts slightly with water to make OH⁻, so pH is above 7. Grey is the strong-acid curve and orange is the weak acid with the current pKₐ.',
s2o:'Drag pKₐ from 3 to 7: the orange curve starts higher and the pH at the half-equivalence line follows the pKₐ; compare the readout\'s half-equivalence pH with pKₐ, and check that the equivalence-point pH is above 7.',
r2:'pKₐ = {pka}: at half equivalence (V = {vh} mL) pH = {phh} (theory ≈ pKₐ); at equivalence pH = {phe}; current V = {v} mL, pH = {ph}.',
s3t:'Indicators: the colour change must fall inside the leap',
s3e:'This step answers: which indicator tells you the end point accurately? An <strong>indicator</strong> is a weak acid whose acid and base forms have different colours; it changes colour when pH is near its pKᵢₙ. In a titration we take the moment the indicator changes colour (pH = pKᵢₙ) as the end point. If that pH is not inside the leap, the end point comes too early or too late: the readout gives the difference from the true equivalence point. The lower the concentration c (log slider), the shorter the leap and the fewer indicators work.',
s3o:'Pick strong acid + phenolphthalein for an error near 0; switch to methyl orange and look at the error; then switch to the weak acid and compare all three indicators, asking which suits it; set concentration to 10⁻³ and see which indicators still work.',
r3:'{acid} + {ind}: the leap spans pH {lo}–{hi} (V = {v1}–{v2} mL); the indicator\'s change point pH = {pk} gives an end point at V = {ve} mL, which differs from the equivalence point ({veq} mL) by {err} mL ({rel}%).',
s4t:'In practice: find the concentration of an unknown hydrochloric acid',
s4e:'This step answers: how do you find an unknown concentration by titration? Take 25.0 mL of hydrochloric acid of unknown concentration, add phenolphthalein, and titrate with 0.100 mol/L sodium hydroxide. Acid and base react 1:1, so at equivalence c_acid·25.0 = 0.100·V, i.e. c_acid = 0.100·V/25.0. Drag V until the flask turns pale pink (stop as soon as it does), press "read the result", and the page gives your estimate, the true value and the error.',
s4o:'Take big steps until the colour is about to change, then use 0.1 mL steps and press read just as the pale pink appears; the error should be under 1%. Think about why you take smaller steps nearer the end point.',
r4:'Current V = {v} mL, flask colour: {col}; no result read yet.',
colNone:'colourless (pH {ph})',colPink:'pink (pH {ph})',
r4done:'You read V = {v} mL → estimate c = 0.100×{v}/25.0 = {c} mol/L; true value {ct} mol/L, error {err}%.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) a titration curve is pH against V, and the equivalence point is where acid and base are equal in moles; (2) the leap: the slope is largest near equivalence; (3) weak acid: pH at half equivalence = pKₐ and pH at equivalence > 7; (4) the indicator\'s change point must lie inside the leap, and lower concentration shortens it; (5) at equivalence c_acid·V_acid = c_base·V_base (monoprotic).',
qq:'When a strong base titrates a weak acid and exactly half the equivalence volume of base has been added, what is the pH about?',qo0:'7',qo1:'14',qo2:'The weak acid\'s pKₐ',
qwhy:'At half equivalence [HA] = [A⁻], so pH = pKₐ (check in step 2).',
s5m:'This page is an idealised model of a monoprotic acid titrated by a monoprotic strong base: 25.0 mL of acid, base at 0.100 mol/L (concentration adjustable in step 3); pH is solved numerically from charge balance (strong acid fully ionised, weak acid via Kₐ, Kw = 10⁻¹⁴, 25 °C). It ignores activity coefficients (inaccurate at high concentration), dissolved CO₂, temperature change and the base consumed by the indicator itself; the indicator change point is taken as pH = pKᵢₙ, whereas real changes are gradual and the eye judges them to about ±0.5 pH.',
lk0:'Buffer capacity: the flat stretch near half equivalence is the buffer region',lk1:'Acid–base equilibrium: what Kₐ is and how HA moves both ways',lk2:'Chemical equilibrium: the dynamic acid ⇌ conjugate-base balance behind titration'
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
