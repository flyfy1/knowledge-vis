const STR={
zh:{
pageTitle:'分子构型 · 电子对互相躲开',tagline:'中心原子周围的电子对彼此排斥，自己排成最分散的队形；水为什么弯、甲烷为什么是正四面体，都从这里来。',
nav0:'0 排成最散',nav1:'1 能量下降',nav2:'2 孤对电子',nav3:'3 真实分子',nav4:'4 极性',nav5:'5 回顾自测',iter:'迭代',
lN:'电子对（区域）数 N',lYaw:'旋转视角',lIt:'已迭代步数',lL:'其中孤对电子数',bReplay:'重播：从随机起点再排一次',bNew:'换一个随机起点',bNew5:'换 5 个新的随机起点',mCo2:'CO₂',mBf3:'BF₃',mCh4:'CH₄',mNh3:'NH₃',mH2o:'H₂O',mSf4:'SF₄',mSf6:'SF₆',mXef2:'XeF₂',
s0t:'N 个电子对，怎么排才离得最远？',
s0e:'这一步要回答：中心原子周围的电子对（价层电子对互斥模型，VSEPR）会排成什么形状？每个电子对是一个带负电的“电子区域”（一个单键、一个双键、一个孤对电子都各算一个区域），它们彼此排斥，所以在以中心原子为球心的球面上散得尽可能开。右图把 N 个点放在球面上，每对点按 1/r² 的力互相推开（r 是两点间距离），点“重播”看它们从随机位置逐步挪到最稳的位置。拖动画布或旋转滑块可以转动视角。',
s0o:'依次把 N 设为 2、3、4、5、6，点重播：看最终队形是直线、平面三角形、正四面体、三角双锥、正八面体；读数里的最小夹角应分别是 180°、120°、109.5°、90°、90°。',
r0:'N = {n}：{shape}；当前最小夹角 {amin}°，最大夹角 {amax}°；排斥能 {e}（相对单位），已迭代到第 {it} 步。',
shLin:'直线形',shTri:'平面三角形',shTet:'正四面体',shTbp:'三角双锥',shOct:'正八面体',
s1t:'排斥能是怎样一步步降下来的？',
s1e:'这一步要回答：电子对真的会走到“最稳”的位置吗？每个队形有一个总排斥能 E = Σ qᵢqⱼ/r（对所有点对求和，q 是每个区域的“电荷”，这里都取 1）。从 5 个不同的随机起点出发，每一步让每个点沿着受力方向挪一小步（再投回球面），E 就一步步下降。右图每条线是一个起点；虚线是各起点里找到的最低能量。滑动“已迭代步数”，左边显示第 1 个起点此时的队形。',
s1o:'拖动迭代步数从 0 到 400：左边队形逐渐规整，右边圆点沿曲线下滑；看 5 条线是否都落到虚线上（有时有个别起点停在更高的局部低点），点“换 5 个新起点”再试。',
r1:'N = {n}，第 {it} 步：起点 1 的排斥能 E = {e}；5 个起点的最终最低能量 {emin}；其中 {k} 个起点到达了最低能量（差 < 0.001）。',
s2t:'孤对电子：不成键，但占地更大',
s2e:'这一步要回答：为什么水是弯的、氨是三角锥？中心原子的 N 个区域里，有些连着别的原子（成键对，青色小球），有些是<strong>孤对电子</strong>（没有成键的电子对，粉色大球）。孤对电子只受中心原子束缚，云更“胖”，排斥更强（本页取每个孤对的“电荷”为 1.2，成键对为 1）。分子的<strong>形状</strong>只看原子的位置，不看孤对。滑块 N 和孤对数 L 一起决定 AXₘEₙ 类型和形状；模拟取 30 个随机起点中能量最低的那个。',
s2o:'固定 N = 4，把 L 从 0 → 1 → 2：形状从正四面体变成三角锥再变成弯曲形，成键角从 109.5° 缩小；再设 N = 5、L = 1、2、3，看孤对是否都排在“赤道”位置。',
r2:'N = {n}，成键对 {b}，孤对 {l}：形状 {shape}；成键角（模型）{angles}；理想（无孤对）夹角 {ideal}°。{cap}',
capNote:'（本页简单模型的限制：这个 N 下孤对数最多取 {m}。）',expAng:'键角 {a}°',expSf4:'轴向–轴向 173°，赤道–赤道 102°',
shBent:'弯曲形',shPyr:'三角锥形',shSee:'跷跷板形',shT:'T 形',shSqp:'四方锥形',
s3t:'几种真实分子：模型和实验对得上吗？',
s3e:'这一步要回答：用同一套“电子对互斥”规则，真实分子的形状怎么来？选一个分子，页面按它的中心原子周围的成键对数和孤对数（N、L）运行同一模拟，并把<strong>模型成键角</strong>与教科书里的<strong>实验值</strong>并列。双键或三键各算一个电子区域。模型只用一个参数（孤对更胖），所以像 H₂O 的 104.5°、NH₃ 的 107° 能大致对上，但并不精确。',
s3o:'依次点 CH₄ → NH₃ → H₂O：成键角越来越小，孤对数 0 → 1 → 2；再点 SF₄ 和 XeF₂，看孤对排在哪个位置，以及线形的 XeF₂ 为什么有 3 个孤对。',
r3:'{mol}：N = {n}，L = {l}，形状 {shape}；模型最小成键角 {amin}°，最大 {amax}°；实验：{exp}。',
mCo2n:'二氧化碳',mBf3n:'三氟化硼',mCh4n:'甲烷',mNh3n:'氨',mH2on:'水',mSf4n:'四氟化硫',mSf6n:'六氟化硫',mXef2n:'二氟化氙',
s4t:'形状决定极性：键有极性，分子不一定有',
s4e:'这一步要回答：为什么 CO₂ 不极性而 H₂O 极性？每个键有一个<strong>键偶极</strong>（箭头指向电负性更大的原子，长度 = 电负性之差）。分子的偶极是所有键偶极的<strong>矢量和</strong>（孤对电子的贡献本页忽略）：形状对称时箭头互相抵消，和为 0；不对称时合成一个净偶极。电负性取鲍林值（C 2.55、H 2.20、N 3.04、O 3.44、F 3.98、B 2.04、S 2.58、Xe 2.6）。',
s4o:'依次点 CO₂、BF₃、CH₄（键有极性，但和为 0）与 NH₃、H₂O（有净偶极）；转动视角，看合成箭头（橙色）朝哪个方向。',
r4:'{mol}：{nb} 个极性键，键偶极之和的大小 = {dip}（电负性差单位）：{res}。',
polar:'极性分子（有净偶极）',nonpolar:'非极性分子（偶极抵消）',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 价层电子区域互相排斥，排成最散的队形：2 个直线、3 个平面三角形、4 个正四面体、5 个三角双锥、6 个正八面体；② 排斥能随迭代下降到最低；③ 孤对更“胖”，把成键角压小，形状只看原子位置；④ 真实分子的角度与模型大致吻合；⑤ 分子极性 = 键偶极的矢量和，由形状决定。',
qq:'水分子中氧原子有 2 个成键对和 2 个孤对电子。它的形状是？',qo0:'直线形',qo1:'弯曲形',qo2:'正四面体形',
qwhy:'4 个电子区域排成四面体，但形状只看原子（2 个 H），所以是弯曲形，且孤对压小了 H–O–H 夹角（第 2 步 N = 4、L = 2）。',
s5m:'本页是 VSEPR 的点电荷球面模型：把每个电子区域当作球面上的一个点，孤对取 1.2 倍“电荷”；它不含轨道、杂化、键长差异、多重键更“胖”以及原子大小的影响；N = 6 且孤对数 ≥ 2（如 XeF₄ 的方形平面）本页的简单模型算不准，因此第 2 步限制在 1 个孤对以内；真实分子是量子体系，成键角还受取代基影响。动画是梯度下降的教学演示，不是电子运动。',
lk0:'原子结构页：价电子（最外层电子）从哪里来',lk1:'电场页：同号电荷互相排斥，场与力的来源'
},
en:{
pageTitle:'Molecular Shapes · Electron Pairs Keeping Out of Each Other\'s Way',tagline:'Electron pairs around a central atom repel one another and settle into the most spread-out arrangement; that is why water is bent and methane is a regular tetrahedron.',
nav0:'0 Spread out',nav1:'1 Energy falls',nav2:'2 Lone pairs',nav3:'3 Real molecules',nav4:'4 Polarity',nav5:'5 Recap & check',iter:'iter',
lN:'Electron pairs (regions) N',lYaw:'Rotate view',lIt:'Iterations done',lL:'Of which lone pairs',bReplay:'Replay: settle again from a random start',bNew:'Try a different random start',bNew5:'Draw 5 new random starts',mCo2:'CO₂',mBf3:'BF₃',mCh4:'CH₄',mNh3:'NH₃',mH2o:'H₂O',mSf4:'SF₄',mSf6:'SF₆',mXef2:'XeF₂',
s0t:'N electron pairs: how do they sit farthest apart?',
s0e:'This step answers: what shape do the electron pairs around a central atom take (the valence-shell electron-pair repulsion model, VSEPR)? Each pair is a negatively charged "electron region" (a single bond, a double bond or a lone pair each count as one region), and they repel one another, so they spread out as far as possible on a sphere centred on the atom. The plot places N points on a sphere that push each other apart with a 1/r² force (r is the distance between two points); press replay to watch them move from random positions to the most stable arrangement. Drag the canvas or use the rotation slider to turn the view.',
s0o:'Set N to 2, 3, 4, 5 and 6 in turn and replay: the final arrangements are linear, trigonal planar, tetrahedral, trigonal bipyramidal and octahedral; the readout\'s smallest angle should be 180°, 120°, 109.5°, 90° and 90°.',
r0:'N = {n}: {shape}; current smallest angle {amin}°, largest {amax}°; repulsion energy {e} (relative units), at iteration {it}.',
shLin:'linear',shTri:'trigonal planar',shTet:'tetrahedral',shTbp:'trigonal bipyramidal',shOct:'octahedral',
s1t:'How does the repulsion energy come down step by step?',
s1e:'This step answers: do the pairs really end up at the most stable positions? Each arrangement has a total repulsion energy E = Σ qᵢqⱼ/r (summed over all pairs of points, with q the "charge" of each region, here 1). From 5 different random starts, each step moves every point a little along its force direction (then back onto the sphere) and E falls step by step. Each line on the right is one start; the dashed line is the lowest energy found among them. Slide "iterations done" and the left shows start 1\'s arrangement at that moment.',
s1o:'Drag the iteration slider from 0 to 400: the arrangement on the left tidies up and the dot on the right slides down its curve; check whether all 5 lines reach the dashed line (occasionally a start stalls at a higher local minimum), then try "5 new starts".',
r1:'N = {n}, step {it}: start 1 has repulsion energy E = {e}; lowest final energy among the 5 starts {emin}; {k} starts reached it (within 0.001).',
s2t:'Lone pairs: they do not bond, but they take more room',
s2e:'This step answers: why is water bent and ammonia pyramidal? Of the central atom\'s N regions, some connect to other atoms (bonding pairs, small cyan balls) and some are <strong>lone pairs</strong> (electron pairs that do not bond, big pink balls). A lone pair is held only by the central atom, so its cloud is fatter and repels more (this page gives a lone pair "charge" 1.2 against 1 for a bonding pair). A molecule\'s <strong>shape</strong> counts only atom positions, not lone pairs. The sliders N and lone-pair count L together set the AXₘEₙ type and the shape; the simulation uses the lowest-energy result of 30 random starts.',
s2o:'With N = 4, move L from 0 to 1 to 2: the shape goes from tetrahedral to pyramidal to bent, and the bond angle shrinks from 109.5°; then set N = 5 with L = 1, 2, 3 and see whether the lone pairs all sit in the "equatorial" positions.',
r2:'N = {n}, {b} bonding pairs, {l} lone pairs: shape {shape}; bond angle(s) in the model {angles}; ideal angle (no lone pairs) {ideal}°. {cap}',
capNote:'(Simple-model limit: at most {m} lone pairs are used for this N.)',expAng:'bond angle {a}°',expSf4:'axial–axial 173°, equatorial–equatorial 102°',
shBent:'bent',shPyr:'trigonal pyramidal',shSee:'seesaw',shT:'T-shaped',shSqp:'square pyramidal',
s3t:'Real molecules: does the model match experiment?',
s3e:'This step answers: how does the same electron-pair repulsion rule give the shapes of real molecules? Pick a molecule and the page runs the same simulation with the number of bonding pairs and lone pairs on its central atom (N, L), and sets the <strong>model bond angle</strong> beside the textbook <strong>experimental value</strong>. A double or triple bond counts as one electron region. The model has a single parameter (lone pairs are fatter), so H₂O at 104.5° and NH₃ at 107° come out roughly right, but not exactly.',
s3o:'Click CH₄, then NH₃, then H₂O: the bond angle shrinks as lone pairs go 0, 1, 2; then click SF₄ and XeF₂ and see where the lone pairs sit, and why linear XeF₂ has 3 lone pairs.',
r3:'{mol}: N = {n}, L = {l}, shape {shape}; model smallest bond angle {amin}°, largest {amax}°; experiment: {exp}.',
mCo2n:'carbon dioxide',mBf3n:'boron trifluoride',mCh4n:'methane',mNh3n:'ammonia',mH2on:'water',mSf4n:'sulfur tetrafluoride',mSf6n:'sulfur hexafluoride',mXef2n:'xenon difluoride',
s4t:'Shape decides polarity: bonds can be polar without the molecule being polar',
s4e:'This step answers: why is CO₂ non-polar but H₂O polar? Every bond has a <strong>bond dipole</strong> (an arrow pointing toward the more electronegative atom, with length equal to the electronegativity difference). The molecule\'s dipole is the <strong>vector sum</strong> of all bond dipoles (the lone pairs\' contribution is ignored here): in a symmetric shape the arrows cancel to 0; in an asymmetric one they add up to a net dipole. Electronegativities are Pauling values (C 2.55, H 2.20, N 3.04, O 3.44, F 3.98, B 2.04, S 2.58, Xe 2.6).',
s4o:'Click CO₂, BF₃ and CH₄ (polar bonds, but the sum is 0) and then NH₃ and H₂O (a net dipole); rotate the view and see which way the resulting arrow (orange) points.',
r4:'{mol}: {nb} polar bonds, magnitude of the sum of bond dipoles = {dip} (electronegativity-difference units): {res}.',
polar:'polar molecule (net dipole)',nonpolar:'non-polar molecule (dipoles cancel)',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) valence-shell electron regions repel and spread out as far as possible: 2 linear, 3 trigonal planar, 4 tetrahedral, 5 trigonal bipyramidal, 6 octahedral; (2) the repulsion energy falls to a minimum; (3) lone pairs are fatter and squeeze bond angles, while shape counts only the atoms; (4) real molecules\' angles roughly match the model; (5) molecular polarity is the vector sum of bond dipoles, set by the shape.',
qq:'The oxygen atom in water has 2 bonding pairs and 2 lone pairs. What is the molecule\'s shape?',qo0:'Linear',qo1:'Bent',qo2:'Tetrahedral',
qwhy:'The 4 regions form a tetrahedron, but shape counts only the atoms (2 H), so it is bent, and the lone pairs squeeze the H–O–H angle (step 2 with N = 4, L = 2).',
s5m:'This page is a point-charge sphere version of VSEPR: each electron region is a point on a sphere and a lone pair has 1.2 times the "charge". It ignores orbitals, hybridisation, bond-length differences, the larger size of multiple bonds and atom size; for N = 6 with two or more lone pairs (such as square-planar XeF₄) this simple model fails, so step 2 caps it at one lone pair; real molecules are quantum systems and angles also depend on substituents. The animation is a gradient-descent demonstration, not electrons moving.',
lk0:'Atomic structure: where valence (outer-shell) electrons come from',lk1:'Electric fields: like charges repel, the source of field and force'
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
