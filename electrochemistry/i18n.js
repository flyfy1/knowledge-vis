const STR={
zh:{
pageTitle:'电化学 · 电子沿导线跑，还是被电推着跑',tagline:'氧化还原反应被拆成两个半电池：自发时电子沿导线流出电流（原电池），外加电压反推时就是电解池。',
nav0:'0 原电池',nav1:'1 放电',nav2:'2 能斯特方程',nav3:'3 电解池',nav4:'4 法拉第定律',nav5:'5 回顾自测',
pZnCu:'锌–铜',pZnAg:'锌–银',pCuAg:'铜–银',pMgCu:'镁–铜',lC0:'起始 [Cu²⁺]（mol/L）',lRate:'放电快慢',lLogCu:'log₁₀[Cu²⁺]',lLogZn:'log₁₀[Zn²⁺]',lVapp:'外加反向电压 V（V）',lAmp:'电流 I（A）',lMin:'通电时间 t（分钟）',bPlay:'播放 / 暂停',bReset:'重置：清除曲线，电极回到初始',
s0t:'原电池：把氧化和还原分在两个烧杯里',
s0e:'这一步要回答：电子为什么会沿导线从一个电极流向另一个？氧化还原反应里，一种金属失去电子（<strong>氧化</strong>），另一种离子得到电子（<strong>还原</strong>）。把它们分在两个烧杯，用导线接起来，电子就只能走导线。失电子的一极叫<strong>阳极</strong>（氧化发生处，原电池里为负极），得电子的一极叫<strong>阴极</strong>（还原发生处，正极）。哪一个金属更容易失电子，看<strong>标准电极电势</strong> E°（金属离子得电子的倾向，V）：E° 低的当阳极，E° 高的当阴极；电池电动势 E°电池 = E°阴极 − E°阳极。盐桥让离子流动、保持两个烧杯电中性。点播放，黄色小点是电子。',
s0o:'依次选锌–铜、锌–银、铜–银、镁–铜：看电子流向（始终从阳极到阴极）和读数里的电动势；比较哪一对的电动势最大，两个烧杯之间那把电势标尺上，两根彩色短线的高度差有多大。',
r0:'{pair}：阳极（氧化）{an}，E° = {ea} V；阴极（还原）{cat}，E° = {ec} V；E°电池 = {ec} − ({ea}) = {e} V；电子沿导线从{an}流向{cat}。',
mZn:'锌',mCu:'铜',mAg:'银',mMg:'镁',
lblAn:'阳极（氧化）',lblCat:'阴极（还原）',lblE:'E°电池',
s1t:'放电：电压怎样随反应进行而变化？',
s1e:'这一步要回答：电池用着用着，电压怎么变？以锌–铜电池为例（锌片浸在 [Zn²⁺] = 0.01 mol/L 的溶液，铜片浸在 [Cu²⁺] = 起始浓度的溶液，各 1 L）。每转移 2 mol 电子，溶解 1 mol Zn，沉积 1 mol Cu。电池电动势随浓度变化服从 E = E° − (0.0592/2)·log₁₀([Zn²⁺]/[Cu²⁺])（25 °C，能斯特方程，下一步细讲）。点播放，曲线累积 E 随反应进度（已反应的 Cu²⁺ 摩尔数）的变化。你会看到：大部分时间电压只缓慢下降，等 Cu²⁺ 快用完时下降才明显加速（本页是理想模型，电压只降到约 0.9 V；真实电池要到电极材料耗尽才会骤降为零）。',
s1o:'播放到结束，找电压下降明显加速的位置；把起始 [Cu²⁺] 调小，加速下降的位置提前；把放电快慢调大，只影响曲线画得多快，不改变曲线形状。',
r1:'已反应 {xi} mol：[Cu²⁺] = {cu}，[Zn²⁺] = {zn}；E = {e} V；已溶解 Zn {mzn} g，已沉积 Cu {mcu} g。',
s2t:'能斯特方程：浓度也会推动电压',
s2e:'这一步要回答：不是标准状态时，电动势是多少？用<strong>反应商</strong> Q = [Zn²⁺]/[Cu²⁺]（生成物浓度比反应物浓度）：E = E° − (0.0592/n)·log₁₀Q（25 °C，n = 2 是转移的电子数）。Q 越大（生成物多、反应物少），电压越低；Q = K（平衡）时 E = 0，电池“没电”。右图横轴是 log₁₀Q，纵轴是 E，是一条斜率为 −0.0296 V 的直线；圆点是当前浓度。E° = 1.10 V，平衡常数 K = 10^(nE°/0.0592)。',
s2o:'把两个浓度滑块都设成 0（即 1 mol/L）：E = E°；把 [Cu²⁺] 调小 10 倍：E 变化多少？再把 [Zn²⁺] 调大 10 倍，对比；读数里 log₁₀K 是 Q 要涨到多大电压才归零。',
r2:'Q = [Zn²⁺]/[Cu²⁺] = {q}，log₁₀Q = {lq}；E = 1.10 − 0.0296×({lq}) = {e} V；平衡时 log₁₀K = {lk}（Q 达到 K 时 E = 0）。',
s3t:'电解池：外加电压反推，反应倒着走',
s3e:'这一步要回答：外加电压会怎样影响反应方向？还是锌–铜电池（两边都是 1 mol/L），E = 1.10 V。串联一个反向电压 V 的电源：回路的净电动势 = E − V，电流 I = (E − V)/R（R 取 1 Ω）。V &lt; E 时仍是原电池放电（Zn 溶解、Cu 沉积）；V = E 时电流为零；V &gt; E 时电流反向，变成<strong>电解池</strong>：Cu 溶解、Zn 沉积，外电源在“把电池充电”。电流方向反转时，哪个电极是阳极（氧化发生处）也会跟着变。',
s3o:'把 V 从 0 拉到 2：看电子流向在 V = 1.10 V 处变成零并反转；注意阳极标签怎样从锌变成铜；读数里电流正负代表方向。',
r3:'外加 V = {v} V，E = {e} V：净推动 = {net} V，电流 I = {i} A（{dir}）；阳极（氧化）是 {an}。',
dirGal:'原电池放电：电子 Zn → Cu',dirNone:'电流为零',dirElec:'电解：电子 Cu → Zn，外电源充电',
s4t:'法拉第电解定律：通多少电，析出多少金属',
s4e:'这一步要回答：电解 Cu²⁺ 溶液时，阴极析出多少铜？通过的电量 Q = I·t（库仑）；每析出 1 mol Cu 需要 2 mol 电子，1 mol 电子带电 F = 96485 C。所以析出质量 m = M·I·t/(n·F)，M = 63.55 g/mol（Cu 的摩尔质量），n = 2。点播放，铜层随时间累积，右图是质量–时间的直线，斜率 = M·I/(nF)。',
s4o:'把电流 I 加倍：同一时刻质量加倍；把时间加倍：质量也加倍；验证读数里“I = 1 A、t = 60 分钟”的参考值约为 1.19 g。',
r4:'I = {i} A，已通电 t = {t} 分钟：电量 {q} C，析出 Cu {m} g；（参考：1 A 通 60 分钟 → {ref} g）。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 原电池：E° 低的金属当阳极（氧化），电子从阳极经导线流向阴极；E°电池 = E°阴 − E°阳；② 放电时电压缓慢下降，反应物用尽时骤降；③ 能斯特方程 E = E° − (0.0592/n)·log₁₀Q；④ 外加电压超过 E 就变成电解池，反应倒着走；⑤ 法拉第定律 m = M·I·t/(nF)。',
qq:'在原电池里，电子在导线中的流向是？',qo0:'从阴极流向阳极',qo1:'从阳极流向阴极',qo2:'沿着盐桥从一个烧杯流向另一个',
qwhy:'阳极发生氧化、释放电子，电子经导线流向发生还原的阴极；盐桥里流的是离子，不是电子（第 0 步）。',
s5m:'本页用理想的标准电极电势（25 °C）与能斯特方程：忽略内阻与过电势、浓度换算成活度、温度变化、极化与气体副反应；第 1 步体积固定 1 L、两个烧杯电荷平衡由盐桥保证；第 3 步电阻 R = 1 Ω 是教学取值；第 4 步假设电流效率 100%，只析出 Cu；电子点的速度和数量是示意，不代表真实电子漂移速度。',
lk0:'电场页：电势与电势差，E° 就是这类“单位电荷的能量差”',lk1:'化学平衡页：Q 与 K，能斯特方程里同一个反应商',lk2:'活化能页：电池反应自发（E > 0）不代表反应一定快，速率由另一座山决定'
},
en:{
pageTitle:'Electrochemistry · Electrons Running Down the Wire, or Pushed Along',tagline:'A redox reaction is split into two half-cells: spontaneously it drives a current through the wire (a galvanic cell), and an applied opposing voltage turns it into an electrolytic cell.',
nav0:'0 Galvanic cell',nav1:'1 Discharge',nav2:'2 Nernst equation',nav3:'3 Electrolytic cell',nav4:'4 Faraday\'s law',nav5:'5 Recap & check',
pZnCu:'Zn–Cu',pZnAg:'Zn–Ag',pCuAg:'Cu–Ag',pMgCu:'Mg–Cu',lC0:'Initial [Cu²⁺] (mol/L)',lRate:'Discharge speed',lLogCu:'log₁₀[Cu²⁺]',lLogZn:'log₁₀[Zn²⁺]',lVapp:'Applied opposing voltage V (V)',lAmp:'Current I (A)',lMin:'Time t (minutes)',bPlay:'Play / Pause',bReset:'Reset: clear the curve and restore the electrodes',
s0t:'A galvanic cell: oxidation and reduction in separate beakers',
s0e:'This step answers: why do electrons flow along a wire from one electrode to the other? In a redox reaction one metal loses electrons (<strong>oxidation</strong>) and an ion gains them (<strong>reduction</strong>). Put them in separate beakers joined by a wire and the electrons can only go through the wire. The electrode losing electrons is the <strong>anode</strong> (where oxidation happens, the negative terminal in a galvanic cell); the one gaining them is the <strong>cathode</strong> (where reduction happens, the positive terminal). Which metal gives up electrons more readily is read from the <strong>standard electrode potential</strong> E° (the tendency of the metal ion to gain electrons, in volts): the lower E° is the anode, the higher is the cathode, and E°cell = E°cathode − E°anode. The salt bridge lets ions move and keeps both beakers neutral. Press play: the yellow dots are electrons.',
s0o:'Select Zn–Cu, Zn–Ag, Cu–Ag and Mg–Cu in turn: see that the electron flow always runs from anode to cathode, and read the cell voltage; compare which pair has the largest, and how large the height gap is between the two short coloured bars on the potential scale between the beakers.',
r0:'{pair}: anode (oxidation) {an}, E° = {ea} V; cathode (reduction) {cat}, E° = {ec} V; E°cell = {ec} − ({ea}) = {e} V; electrons run along the wire from {an} to {cat}.',
mZn:'zinc',mCu:'copper',mAg:'silver',mMg:'magnesium',
lblAn:'anode (oxidation)',lblCat:'cathode (reduction)',lblE:'E°cell',
s1t:'Discharge: how does the voltage change as the reaction proceeds?',
s1e:'This step answers: as a battery is used, how does its voltage change? Take the zinc–copper cell (zinc in a solution with [Zn²⁺] = 0.01 mol/L and copper in a solution at the initial [Cu²⁺], 1 L each). For every 2 mol of electrons transferred, 1 mol of Zn dissolves and 1 mol of Cu plates out. The cell voltage varies with concentration as E = E° − (0.0592/2)·log₁₀([Zn²⁺]/[Cu²⁺]) (25 °C, the Nernst equation, detailed in the next step). Press play: the curve builds up E against reaction progress (moles of Cu²⁺ reacted). Most of the time the voltage declines only slowly, then falls noticeably faster once the Cu²⁺ is nearly used up (in this ideal model it only falls to about 0.9 V; a real cell collapses to zero when electrode material runs out).',
s1o:'Play to the end and find where the voltage starts to fall noticeably faster; reduce the initial [Cu²⁺] and the steeper drop starts sooner; raise the discharge speed, which only changes how fast the curve is drawn, not its shape.',
r1:'Reacted {xi} mol: [Cu²⁺] = {cu}, [Zn²⁺] = {zn}; E = {e} V; {mzn} g of Zn dissolved and {mcu} g of Cu plated.',
s2t:'The Nernst equation: concentrations push the voltage too',
s2e:'This step answers: away from standard conditions, what is the cell voltage? Use the <strong>reaction quotient</strong> Q = [Zn²⁺]/[Cu²⁺] (products over reactants): E = E° − (0.0592/n)·log₁₀Q (25 °C, with n = 2 electrons transferred). The larger Q is (more products, fewer reactants), the lower the voltage; at Q = K (equilibrium) E = 0 and the cell is "dead". On the right the horizontal axis is log₁₀Q and the vertical axis is E: a straight line of slope −0.0296 V; the dot is the current concentrations. E° = 1.10 V and the equilibrium constant is K = 10^(nE°/0.0592).',
s2o:'Set both concentration sliders to 0 (that is 1 mol/L): E = E°; make [Cu²⁺] ten times smaller: by how much does E change? Then make [Zn²⁺] ten times larger and compare; log₁₀K in the readout tells how large log₁₀Q must get before the voltage hits zero.',
r2:'Q = [Zn²⁺]/[Cu²⁺] = {q}, log₁₀Q = {lq}; E = 1.10 − 0.0296×({lq}) = {e} V; at equilibrium log₁₀K = {lk} (E = 0 when Q reaches K).',
s3t:'An electrolytic cell: an opposing voltage runs the reaction backwards',
s3e:'This step answers: how does an applied voltage affect the direction of the reaction? Still the zinc–copper cell (both at 1 mol/L), E = 1.10 V. Add a source in series that opposes the cell with voltage V: the net emf of the loop is E − V and the current is I = (E − V)/R (take R = 1 Ω). With V &lt; E it is still a galvanic cell discharging (Zn dissolves, Cu plates); at V = E the current is zero; with V &gt; E the current reverses and it becomes an <strong>electrolytic cell</strong>: Cu dissolves, Zn plates, and the external source "charges the cell". When the current reverses, which electrode is the anode (where oxidation happens) changes too.',
s3o:'Move V from 0 to 2: the electron flow falls to zero at V = 1.10 V and reverses; notice the anode label change from zinc to copper; the sign of the current in the readout gives its direction.',
r3:'Applied V = {v} V, E = {e} V: net drive = {net} V, current I = {i} A ({dir}); the anode (oxidation) is {an}.',
dirGal:'galvanic discharge: electrons Zn → Cu',dirNone:'zero current',dirElec:'electrolysis: electrons Cu → Zn, external source charging',
s4t:'Faraday\'s law of electrolysis: the charge passed sets the metal deposited',
s4e:'This step answers: when electrolysing a Cu²⁺ solution, how much copper deposits at the cathode? The charge passed is Q = I·t (coulombs); depositing 1 mol of Cu takes 2 mol of electrons, and 1 mol of electrons carries F = 96485 C. So the mass deposited is m = M·I·t/(n·F), with M = 63.55 g/mol (the molar mass of Cu) and n = 2. Press play: the copper layer builds up over time and the plot on the right is a straight line of mass against time with slope M·I/(nF).',
s4o:'Double the current I: the mass at a given time doubles; double the time: the mass doubles too; check the readout\'s reference value for I = 1 A, t = 60 minutes, about 1.19 g.',
r4:'I = {i} A, elapsed t = {t} min: charge {q} C, Cu deposited {m} g; (reference: 1 A for 60 min → {ref} g).',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) in a galvanic cell the metal with the lower E° is the anode (oxidation) and electrons run through the wire from anode to cathode; E°cell = E°cathode − E°anode; (2) the voltage falls slowly during discharge and then drops sharply when a reactant runs out; (3) Nernst: E = E° − (0.0592/n)·log₁₀Q; (4) an applied voltage above E makes it an electrolytic cell and the reaction runs backwards; (5) Faraday: m = M·I·t/(nF).',
qq:'In a galvanic cell, which way do electrons flow in the external wire?',qo0:'From the cathode to the anode',qo1:'From the anode to the cathode',qo2:'Along the salt bridge from one beaker to the other',
qwhy:'Oxidation at the anode releases electrons that travel through the wire to the cathode, where reduction takes place; the salt bridge carries ions, not electrons (step 0).',
s5m:'This page uses ideal standard electrode potentials (25 °C) and the Nernst equation: it ignores internal resistance and overpotential, the difference between concentration and activity, temperature changes, polarisation and gas side reactions; in step 1 the volume is fixed at 1 L and the salt bridge keeps charge balanced; in step 3 R = 1 Ω is a teaching value; step 4 assumes 100% current efficiency with only Cu depositing; the speed and number of electron dots are schematic and do not represent the real electron drift velocity.',
lk0:'Electric fields: potential and potential difference; E° is this kind of energy-per-charge difference',lk1:'Chemical equilibrium: Q and K, the same reaction quotient as in the Nernst equation',lk2:'Activation energy: a spontaneous cell reaction (E > 0) is not necessarily fast; its rate depends on a different hill'
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
