const STR={
zh:{
pageTitle:'元素周期律 · 周期表上的渐变',tagline:'把原子半径、电离能、电负性涂成热图：沿周期、沿族有规律的渐变，由核电荷和电子层数解释，也有少数例外。',
nav0:'0 热图',nav1:'1 沿周期',nav2:'2 为什么',nav3:'3 沿族',nav4:'4 预测比较',nav5:'5 回顾自测',
lEl:'选择元素（按原子序数）',lPer:'突出显示的周期',pRad:'原子（共价）半径 r（pm）',pIe:'第一电离能 IE₁（kJ/mol）',pEn:'电负性（鲍林）χ',gAlk:'碱金属 Li·Na·K',gAe:'碱土金属 Be·Mg·Ca',gHal:'卤素 F·Cl·Br',gNg:'稀有气体 He·Ne·Ar·Kr',pickBtn:'选 {s}',bPickA:'选 A',bPickB:'选 B',bNextQ:'换一道题',bResetScore:'重置：清零答题计分',
s0t:'把性质涂在周期表上：颜色会按顺序渐变',
s0e:'这一步要回答：周期表上元素的性质是不是毫无规律？下方是前四周期的主族元素（第 1–2 族和第 13–18 族；过渡金属本页略去）。颜色越亮，数值越大。三个性质：<strong>原子半径</strong> r（共价半径，原子“多大”，单位 pm = 10⁻¹² m）；<strong>第一电离能</strong> IE₁（从气态原子拿走最外层一个电子要花的能量，越大越难失电子，单位 kJ/mol）；<strong>电负性</strong> χ（鲍林标度，原子在化学键里“拉电子”的能力，无单位；稀有气体不成键，本页不给值，显示为灰色）。点击元素或拖动滑块查看数值。',
s0o:'依次点三个性质按钮：看颜色在每一行（周期）里从左到右、每一列（族）里从上到下往哪个方向变亮；例如 r 的最亮角和 IE₁、χ 的最亮角是否在同一边。',
r0:'{name}（{sym}，Z = {z}，第 {per} 周期，第 {grp} 族）：r = {r} pm，IE₁ = {ie} kJ/mol，χ = {en}。当前着色：{prop}。',
noVal:'无数据',n_H:'氢',n_He:'氦',n_Li:'锂',n_Be:'铍',n_B:'硼',n_C:'碳',n_N:'氮',n_O:'氧',n_F:'氟',n_Ne:'氖',n_Na:'钠',n_Mg:'镁',n_Al:'铝',n_Si:'硅',n_P:'磷',n_S:'硫',n_Cl:'氯',n_Ar:'氩',n_K:'钾',n_Ca:'钙',n_Ga:'镓',n_Ge:'锗',n_As:'砷',n_Se:'硒',n_Br:'溴',n_Kr:'氪',
s1t:'沿着一个周期走：性质单调变化，也有小“台阶”',
s1e:'这一步要回答：沿一个周期从左到右，性质怎么变？下图横轴是元素（按族排列），纵轴是所选性质；三条线分别是第 2、3、4 周期（滑块选中的周期画得粗）。总趋势：半径变小，电离能和电负性变大。但电离能有两处小“回落”（如 Be→B、N→O），不是严格单调；稀有气体没有电负性。读数统计的是你选中周期里相邻两个元素的数值变化。',
s1o:'选 IE₁，把周期从 2 切到 3、4：看每条线整体上升，但有小回落；找出回落发生在哪两个元素之间；再选 r：看是否几乎处处下降，只有稀有气体处翘尾。',
r1:'第 {per} 周期，{prop}：从 {first} 到 {last} 的变化 {d1}→{d2}；相邻元素中数值下降的次数 {down}、上升的次数 {up}。',
s2t:'为什么：核电荷越大拉得越紧，层数越多越松',
s2e:'这一步要回答：规律背后的原因是什么？最外层电子感受到的是被内层电子“屏蔽”后的<strong>有效核电荷</strong> Zeff = Z − S（Z 是核电荷数，S 是屏蔽常数，用斯莱特规则估算：同层电子约 0.35、内一层 0.85、更内层 1.00）。电子离核的距离大致与 n*²/Zeff 成正比（n* 是有效主量子数：第 1–3 层 1、2、3，第 4 层取 3.7）。横轴是 n*²/Zeff，纵轴是实测半径；直线是最小二乘拟合。同周期内 Z 增加、层数不变，Zeff 增大，半径缩小；下一周期多一层，半径突然变大。',
s2o:'选 Li、Be、B……Ne 一路拉过去：Zeff 一路增加，点沿直线向左下移动；再选 Na：Zeff 回落、层数加一，点跳回右上；看读数里的预测半径与实测半径差距。',
r2:'{name}：Z = {z}，最外层 n = {n}，Zeff = {zeff}，n*²/Zeff = {x}；拟合预测半径 {pred} pm，实测 {r} pm（差 {res} pm）；全部元素的相关系数 {cor}。',
s3t:'沿着一个族往下走：多一层，一切都变松',
s3e:'这一步要回答：同一族自上而下，性质怎么变？同族元素最外层电子数相同，但每往下一个周期就多一个电子层，最外层电子离核更远，被内层屏蔽得更多。选一个族和一个性质，下面的柱子从上到下对应第 2、3、4 周期（稀有气体含第 1 周期的 He）。总趋势：半径变大，电离能变小，电负性变小。',
s3o:'选碱金属 + IE₁：柱子逐周期变矮，对比“越往下越易失电子”；换成卤素 + χ：电负性从 F 往下变小；稀有气体选 χ 时没有数值。',
r3:'{grp}，{prop}：{list}；第一个到最后一个的比值 = {ratio}。',
s4t:'预测比较：用规律猜，再用数据对答案',
s4e:'这一步要回答：规律到底有多好用？页面给出两个元素 A、B 和一个性质，你判断谁的数值更大，再看真实数据。同周期或同族的两个元素可以用上面的趋势猜；不同周期也不同族的元素没有简单规则，只能查数据。若答案与“总趋势”相反，会标明这是例外。',
s4o:'先根据趋势在心里猜，再点选；对错之外，注意反馈里是否标明“例外”。多做几题，看趋势在哪些情形下不灵。',
r4q:'问题 {n}：{prop}——谁更大？',
r4a:'{good}：{a} = {va}，{b} = {vb}，更大的是 {w}。{note}　（已答 {tot} 题，答对 {ok} 题）',
r4n:'还没作答　（已答 {tot} 题，答对 {ok} 题）',
good:'答对了',bad:'答错了',
noteSamePer:'同周期，Z 大的是 {z}；这个趋势在此一般成立。',noteSamePerEx:'同周期，Z 大的是 {z}；但这对元素是例外，与总趋势相反。',noteSameGrp:'同族，位置靠下的是 {z}；这个趋势在此一般成立。',noteSameGrpEx:'同族，位置靠下的是 {z}；但这对元素是例外。',noteNone:'不同周期且不同族，没有简单规则，只能靠数据。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 周期表上的性质按行、按列渐变；② 沿周期：Zeff 增大，半径变小，IE₁ 和 χ 变大；③ 沿族向下：多一个电子层，半径变大，IE₁ 和 χ 变小；④ 有例外（IE₁ 在 Be→B、N→O 处回落）；⑤ 趋势可以预测下一个元素的大致性格，但不能替代数据。',
qq:'下面哪组按原子半径从小到大排列？',qo0:'Na < Mg < Al',qo1:'K < Na < Li',qo2:'F < O < Li',
qwhy:'F、O 在第 2 周期靠右，Zeff 大、半径小；Li 在同周期最左，半径最大（第 1 步）。Na、Mg、Al 同周期，半径是 Na > Mg > Al；K、Na、Li 同族，半径自下而上变小，所以应是 Li < Na < K。',
s5m:'本页只含前四周期的主族元素（共 26 个），省略了过渡金属；半径用共价半径（Cordero 等，随成键环境略变，稀有气体的值是估计的）；IE₁ 取教科书常见值；电负性用鲍林标度；斯莱特规则是粗略的屏蔽估算，拟合的相关系数只说明趋势一致，并不等于理论上的精确公式；预测题里的“趋势”只是总体规律。',
lk0:'原子结构页：电子层与每层能坐几个电子',lk1:'原子结构页：最外层电子决定化学性质',lk2:'分子构型页：电负性差如何变成键偶极和分子极性',lk3:'电场页：核电荷与电子之间的静电吸引'
},
en:{
pageTitle:'Periodic Trends · Gradients Across the Periodic Table',tagline:'Colour atomic radius, ionisation energy and electronegativity onto the table: they change in regular gradients along periods and groups, explained by nuclear charge and the number of shells, with a few exceptions.',
nav0:'0 Heat map',nav1:'1 Along a period',nav2:'2 Why',nav3:'3 Down a group',nav4:'4 Predict and compare',nav5:'5 Recap & check',
lEl:'Pick an element (by atomic number)',lPer:'Period to highlight',pRad:'Atomic (covalent) radius r (pm)',pIe:'First ionisation energy IE₁ (kJ/mol)',pEn:'Electronegativity (Pauling) χ',gAlk:'Alkali metals Li·Na·K',gAe:'Alkaline earths Be·Mg·Ca',gHal:'Halogens F·Cl·Br',gNg:'Noble gases He·Ne·Ar·Kr',pickBtn:'Pick {s}',bPickA:'Pick A',bPickB:'Pick B',bNextQ:'Another question',bResetScore:'Reset: clear the score',
s0t:'Paint a property onto the periodic table: the colours change in order',
s0e:'This step answers: are element properties on the periodic table patternless? Below are the main-group elements of the first four periods (groups 1–2 and 13–18; transition metals are left out). Brighter means a larger value. Three properties: <strong>atomic radius</strong> r (covalent radius, how "big" the atom is, in pm = 10⁻¹² m); <strong>first ionisation energy</strong> IE₁ (the energy needed to remove one outermost electron from a gas-phase atom; larger means harder to lose an electron; kJ/mol); <strong>electronegativity</strong> χ (Pauling scale, an atom\'s ability to pull electrons in a bond, unitless; noble gases do not bond, so no value is given and they show grey). Click an element or drag the slider to read the numbers.',
s0o:'Click the three property buttons in turn: watch which way the brightness grows along each row (period) and down each column (group); for instance, is the brightest corner for r on the same side as those for IE₁ and χ?',
r0:'{name} ({sym}, Z = {z}, period {per}, group {grp}): r = {r} pm, IE₁ = {ie} kJ/mol, χ = {en}. Current colouring: {prop}.',
noVal:'no data',n_H:'hydrogen',n_He:'helium',n_Li:'lithium',n_Be:'beryllium',n_B:'boron',n_C:'carbon',n_N:'nitrogen',n_O:'oxygen',n_F:'fluorine',n_Ne:'neon',n_Na:'sodium',n_Mg:'magnesium',n_Al:'aluminium',n_Si:'silicon',n_P:'phosphorus',n_S:'sulfur',n_Cl:'chlorine',n_Ar:'argon',n_K:'potassium',n_Ca:'calcium',n_Ga:'gallium',n_Ge:'germanium',n_As:'arsenic',n_Se:'selenium',n_Br:'bromine',n_Kr:'krypton',
s1t:'Walking along a period: steady change, with small steps back',
s1e:'This step answers: how does the property change from left to right along a period? In the plot the horizontal axis is the element (ordered by group) and the vertical axis is the chosen property; the three lines are periods 2, 3 and 4 (the period picked by the slider is drawn thick). The overall trend: radius shrinks while ionisation energy and electronegativity grow. But ionisation energy has two small dips (such as Be→B and N→O), so it is not strictly monotonic; noble gases have no electronegativity. The readout counts changes between neighbouring elements in the selected period.',
s1o:'Choose IE₁ and switch the period from 2 to 3 and 4: each line rises overall but with small dips; find between which two elements the dips happen; then choose r and check that it falls almost everywhere, with a tail upturn only at the noble gas.',
r1:'Period {per}, {prop}: from {first} to {last} the value goes {d1}→{d2}; neighbour-to-neighbour decreases {down}, increases {up}.',
s2t:'Why: more nuclear charge pulls tighter, more shells loosen',
s2e:'This step answers: what is behind the pattern? An outer electron feels the <strong>effective nuclear charge</strong> Zeff = Z − S after inner electrons screen it (Z is the nuclear charge, S the screening constant estimated by Slater\'s rules: about 0.35 per electron in the same shell, 0.85 for the shell just below, 1.00 for deeper ones). The distance from the nucleus is roughly proportional to n*²/Zeff (n* is the effective principal quantum number: 1, 2, 3 for shells 1–3 and 3.7 for shell 4). The horizontal axis is n*²/Zeff, the vertical axis is the measured radius, and the line is a least-squares fit. Within a period Z grows with the shell count fixed, so Zeff rises and the radius shrinks; the next period adds a shell and the radius jumps up.',
s2o:'Step through Li, Be, B ... Ne: Zeff keeps rising and the point slides down the line to the left; then pick Na: Zeff drops back, a shell is added, and the point jumps back to the upper right; compare the predicted and measured radius in the readout.',
r2:'{name}: Z = {z}, outer shell n = {n}, Zeff = {zeff}, n*²/Zeff = {x}; fitted predicted radius {pred} pm, measured {r} pm (difference {res} pm); correlation over all elements {cor}.',
s3t:'Down a group: one more shell, everything loosens',
s3e:'This step answers: how does a property change from top to bottom of a group? Elements in a group have the same number of outer electrons, but each period down adds a shell, so the outer electron sits farther from the nucleus and is screened more by the inner electrons. Choose a group and a property; the bars below run from top to bottom through periods 2, 3 and 4 (the noble gases also include He from period 1). The overall trend: radius grows, ionisation energy falls and electronegativity falls.',
s3o:'Choose alkali metals with IE₁: the bars get shorter period by period, matching "easier to lose an electron the lower you go"; switch to halogens with χ: electronegativity falls from F downward; for noble gases with χ there are no values.',
r3:'{grp}, {prop}: {list}; ratio of last to first = {ratio}.',
s4t:'Predict and compare: guess with the pattern, then check with data',
s4e:'This step answers: how useful is the pattern? The page gives two elements A and B and a property; you judge which has the larger value, then see the real data. Two elements in the same period or group can be guessed with the trends above; elements in different periods and different groups have no simple rule, so you can only look up data. If the answer goes against the "overall trend" it is flagged as an exception.',
s4o:'Guess from the trend in your head first, then click; beyond right or wrong, notice whether the feedback marks an "exception". Do several questions and see where the trend lets you down.',
r4q:'Question {n}: {prop} — which is larger?',
r4a:'{good}: {a} = {va}, {b} = {vb}, the larger is {w}. {note}  (answered {tot}, correct {ok})',
r4n:'Not answered yet  (answered {tot}, correct {ok})',
good:'Correct',bad:'Wrong',
noteSamePer:'Same period; {z} has the larger Z; the trend generally holds here.',noteSamePerEx:'Same period; {z} has the larger Z; but this pair is an exception to the overall trend.',noteSameGrp:'Same group; {z} is lower in the group; the trend generally holds here.',noteSameGrpEx:'Same group; {z} is lower in the group; but this pair is an exception.',noteNone:'Different period and different group: no simple rule, only data.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) properties change gradually along rows and down columns of the table; (2) along a period Zeff grows, the radius shrinks and IE₁ and χ rise; (3) down a group an extra shell makes the radius grow and IE₁ and χ fall; (4) there are exceptions (IE₁ dips at Be→B and N→O); (5) trends can predict the rough character of the next element but do not replace data.',
qq:'Which set is ordered from smallest to largest atomic radius?',qo0:'Na < Mg < Al',qo1:'K < Na < Li',qo2:'F < O < Li',
qwhy:'F and O sit toward the right of period 2 with large Zeff and small radius, while Li is at the far left of the same period with the largest radius (step 1). Na, Mg, Al are in one period and their radii go Na > Mg > Al; K, Na, Li are one group and the radius shrinks upward, so the order should be Li < Na < K.',
s5m:'This page contains only the main-group elements of the first four periods (26 in all) and leaves out transition metals; radii are covalent radii (Cordero et al.; they vary slightly with bonding environment, and noble-gas values are estimates); IE₁ values are common textbook figures; electronegativity uses the Pauling scale; Slater\'s rules are a rough screening estimate, and the fit\'s correlation only shows the trend agrees, not that the formula is exact; the "trend" in the prediction questions is just the general rule.',
lk0:'Atomic structure: electron shells and how many electrons each holds',lk1:'Atomic structure: the outer electrons decide chemical behaviour',lk2:'Molecular shapes: how electronegativity differences become bond dipoles and molecular polarity',lk3:'Electric fields: the electrostatic attraction between nuclear charge and electrons'
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
