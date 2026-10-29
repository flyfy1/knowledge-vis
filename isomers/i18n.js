const STR={
zh:{
pageTitle:'同分异构体 · 同一组原子，不同的拼法',tagline:'分子式相同、原子连接方式不同，就是不同的分子：数骨架、判断“画法不同还是分子不同”，再看单键与双键怎样让镜像般的异构体分得开。',
nav0:'0 一个式，两种分子',nav1:'1 数骨架',nav2:'2 是同一个吗',nav3:'3 官能团异构',nav4:'4 顺反异构',nav5:'5 回顾自测',
lN:'碳原子数 n',lI:'第几个异构体',lN8:'碳原子数 n',lN7:'碳原子数 n',lTw:'绕中间键扭转的角度 θ（°）',bSame:'同一个分子',bDiff:'不同的分子',bNext:'换一道题',bResetScore:'重置：清零答题计分',
mPr1:'1-丙醇',mPr2:'2-丙醇',mMeEt:'甲乙醚',mEtOH:'乙醇',mDme:'二甲醚',bSingle:'单键（如丁烷中间的 C–C）',bDouble:'双键（如 2-丁烯中间的 C=C）',
s0t:'同样是 C₄H₁₀，却是两种不同的分子',
s0e:'这一步要回答：分子式相同的分子一定是同一种物质吗？不一定。<strong>同分异构体</strong>是分子式相同、原子连接方式（骨架）不同的分子。烷烃（只含碳碳单键和碳氢键的链）的碳骨架就是一棵“树”：每个碳最多连 4 个键，剩下的键连氢。图中圆圈代表碳原子，圆圈里的数字是它连的氢原子数；线是碳碳键。读数从图自动数出 C 和 H 的个数，并与实测沸点对照：骨架不同，物理性质也不同。',
s0o:'先看 n = 4 的两个异构体：数一数读数里 C、H 个数是否相同、沸点是否相同；再把 n 调到 5、6，逐个翻看（第几个异构体），观察分支越多沸点怎样变化。',
r0:'{name}（第 {k}/{m} 个）：C{c}H{h}，最长碳链 {len} 个碳，沸点 {bp} °C。',
nm_butane:'丁烷（正丁烷）',nm_2mp:'2-甲基丙烷（异丁烷）',nm_pentane:'戊烷（正戊烷）',nm_2mb:'2-甲基丁烷（异戊烷）',nm_22dmp:'2,2-二甲基丙烷（新戊烷）',nm_hexane:'己烷（正己烷）',nm_2mpe:'2-甲基戊烷',nm_3mpe:'3-甲基戊烷',nm_23dmb:'2,3-二甲基丁烷',nm_22dmb:'2,2-二甲基丁烷',
s1t:'数一数：n 个碳到底能拼出几种骨架？',
s1e:'这一步要回答：碳原子数增加，异构体数增长得有多快？程序用“每次给一棵树的某个碳添一个新碳（该碳最多 4 个键）”的办法生成所有骨架，再用树的<strong>规范形式</strong>（把树从中心起逐层描述，同构的树描述相同）去掉重复，剩下的就是互不相同的骨架。画布里每个小图是一种骨架。n = 1…8 时个数是 1、1、1、2、3、5、9、18：增长越来越快。',
s1o:'把 n 从 2 拉到 8：数小图个数，并核对读数里的数目；看 n = 4、5、6 时个数怎样增加，再估计 n = 9、10 大约会有多少。',
r1:'n = {n}：共 {cnt} 种不同的碳骨架；每种的分子式都是 C{n}H{h}；相比 n = {p} 的 {pc} 种，增长 {gr} 倍。',
s2t:'画法不同，还是真的不同？用“规范形式”来裁判',
s2e:'这一步要回答：两张画得不一样的图，是同一个分子吗？同一个分子可以画成不同的样子（旋转、翻转、换一个碳当起点），不同的分子也可能看起来很像。判定方法：把两棵树都化成<strong>规范形式</strong>（不依赖画法的描述），相同就是同一个分子。页面随机给你一对图，你判断是“同一个分子”还是“不同的分子”，再核对规范形式的结果。',
s2o:'先自己数一数每张图里最长的碳链和分支位置，再判断；答完看反馈里两张图的“最长碳链长度”和规范形式是否一致；多做几题，注意“看起来不一样”其实相同的情形。',
r2q:'题目 {k}（n = {n}）：左右两张图是同一个分子吗？（已答 {tot} 题，答对 {ok} 题）',
r2a:'{good}：规范形式{eq}；左图最长碳链 {l1} 个碳，右图 {l2} 个碳，两者碳原子数都是 {n}。（已答 {tot} 题，答对 {ok} 题）',
good:'答对了',bad:'答错了',eqSame:'相同——是同一个分子，只是画法不同',eqDiff:'不同——是两个不同的分子（同分异构体）',
s3t:'官能团异构：原子种类更多，连法差别更大',
s3e:'这一步要回答：加入氧原子后，同一分子式能有几种拼法？图中圆圈是碳（灰）和氧（红），数字是连的氢数；氧最多连 2 个键。C₃H₈O 有 3 种：1-丙醇（OH 在链端）、2-丙醇（OH 在中间碳上）、甲乙醚（氧夹在两个碳之间，是醚）。C₂H₆O 有 2 种：乙醇和二甲醚。分子式由图自动数出；沸点差别很大，因为含 O–H 的醇分子之间能形成氢键，醚不能。',
s3o:'依次点 1-丙醇、2-丙醇、甲乙醚：确认读数里的分子式相同、沸点不同；再点乙醇和二甲醚，比较沸点差（相差上百度）。',
r3:'{name}：C{c}H{h}O；{kind}；沸点 {bp} °C。',
nm_pr1:'1-丙醇',nm_pr2:'2-丙醇',nm_meet:'甲乙醚',nm_etoh:'乙醇',nm_dme:'二甲醚',kAlcohol:'醇（含 –OH，能形成氢键）',kEther:'醚（C–O–C，不能形成氢键）',
s4t:'顺反异构：绕单键能转，绕双键转不动',
s4e:'这一步要回答：为什么 2-丁烯有顺、反两种，而丁烷没有？看中间那个碳碳键：两端各连一个甲基。绕<strong>单键</strong>扭转时，能量只有小小的起伏（本页取最高 12 kJ/mol），室温热运动就足以翻越，所以各种扭转形态是同一种分子；绕<strong>双键</strong>扭转要拆开其中一半的键，能量壁垒高得多（本页取 265 kJ/mol），室温下几乎不能转，顺式（θ = 0°，两个甲基同侧）和反式（θ = 180°，异侧）因此是能分开的两种物质。能垒越过的相对机会按 e^(−ΔE/RT) 估算（R = 8.314×10⁻³ kJ/(mol·K)，T = 298 K，同活化能页）。',
s4o:'先选单键，把 θ 从 0° 拉到 180°：能量只升到一个小丘；再选双键，同样拉：能量冲到几百 kJ/mol；对照读数里的“相对机会” e^(−ΔE/RT)。',
r4:'{kind}：θ = {th}°，扭转能 {e} kJ/mol；最高能垒 {bar} kJ/mol，室温下相对越垒机会 e^(−ΔE/RT) = {p}；{res}。',
kSingle:'单键',kDouble:'双键',resFree:'能自由转动，不同扭转形态是同一种分子',resLocked:'几乎转不动，顺式与反式是两种可分离的分子',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 同分异构体：分子式相同、连接方式不同，物理性质也不同；② 烷烃骨架是树，n = 4、5、6、7、8 时有 2、3、5、9、18 种；③ 判断两张图是否同一个分子要看规范形式，不看画得像不像；④ 含氧的官能团异构（醇与醚）沸点差别很大；⑤ 双键不能自由转动，所以有顺反异构，单键可以转，所以没有。',
qq:'C₅H₁₂ 一共有几种不同的碳骨架（同分异构体）？',qo0:'2 种',qo1:'3 种',qo2:'5 种',
qwhy:'戊烷、2-甲基丁烷、2,2-二甲基丙烷共 3 种（第 1 步 n = 5 的计数）。',
s5m:'本页的异构体指碳骨架（构造异构），只含饱和链烷烃和第 3 步的醇与醚；不涉及环状结构、含 C=C 的结构异构、手性（镜像异构）和构象能量的细节；沸点为常见手册值，仅作对照；第 4 步的扭转能是教学函数：单键取 (12/2)(1 − cos3θ)，双键取 (265/2)(1 − cos2θ)；树的画法是自动布局，可能有重叠或看起来很奇怪，但结构（规范形式）是严格计算的。',
lk0:'分子构型页：每个碳周围的键怎样排成四面体等形状',lk1:'活化能页：能垒与 e^(−ΔE/RT)，同样的越垒几率估算',lk2:'粒子与物态页：沸点高低与分子间作用力'
},
en:{
pageTitle:'Isomers · The Same Atoms, Put Together Differently',tagline:'Same molecular formula, different connections between atoms, means different molecules: count the skeletons, tell "drawn differently" from "really different", and see why double bonds keep cis and trans apart.',
nav0:'0 One formula, two molecules',nav1:'1 Count skeletons',nav2:'2 Same or not',nav3:'3 Functional-group isomers',nav4:'4 Cis and trans',nav5:'5 Recap & check',
lN:'Number of carbons n',lI:'Which isomer',lN8:'Number of carbons n',lN7:'Number of carbons n',lTw:'Twist angle about the middle bond θ (°)',bSame:'Same molecule',bDiff:'Different molecules',bNext:'Another question',bResetScore:'Reset: clear the score',
mPr1:'1-propanol',mPr2:'2-propanol',mMeEt:'methyl ethyl ether',mEtOH:'ethanol',mDme:'dimethyl ether',bSingle:'Single bond (like the middle C–C in butane)',bDouble:'Double bond (like the middle C=C in 2-butene)',
s0t:'Both are C₄H₁₀, yet they are two different molecules',
s0e:'This step answers: must molecules with the same formula be the same substance? No. <strong>Isomers</strong> have the same molecular formula but different connections between atoms (a different skeleton). The carbon skeleton of an alkane (a chain with only C–C and C–H bonds) is a "tree": each carbon has at most 4 bonds and the rest go to hydrogen. In the figure a circle is a carbon atom, the number inside is how many hydrogens it carries, and a line is a C–C bond. The readout counts C and H straight from the picture and sets them beside measured boiling points: a different skeleton means different physical properties.',
s0o:'Look at the two isomers for n = 4: check whether the counts of C and H in the readout match and whether the boiling points do; then move n to 5 and 6 and step through each isomer, noticing how boiling point changes as branching increases.',
r0:'{name} (isomer {k} of {m}): C{c}H{h}, longest carbon chain {len} carbons, boiling point {bp} °C.',
nm_butane:'butane (n-butane)',nm_2mp:'2-methylpropane (isobutane)',nm_pentane:'pentane (n-pentane)',nm_2mb:'2-methylbutane (isopentane)',nm_22dmp:'2,2-dimethylpropane (neopentane)',nm_hexane:'hexane (n-hexane)',nm_2mpe:'2-methylpentane',nm_3mpe:'3-methylpentane',nm_23dmb:'2,3-dimethylbutane',nm_22dmb:'2,2-dimethylbutane',
s1t:'Count them: how many skeletons can n carbons make?',
s1e:'This step answers: as the number of carbons grows, how fast does the number of isomers grow? The program generates all skeletons by "adding one new carbon to some carbon of a tree (which can have at most 4 bonds)", then removes repeats with the tree\'s <strong>canonical form</strong> (describe the tree level by level from its centre; trees that are the same shape get the same description). What is left are the distinct skeletons, and each small picture on the canvas is one. For n = 1…8 the counts are 1, 1, 1, 2, 3, 5, 9, 18: growth speeds up.',
s1o:'Move n from 2 to 8: count the small pictures and check the number in the readout; see how the count grows for n = 4, 5, 6, then estimate roughly how many n = 9 and 10 would have.',
r1:'n = {n}: {cnt} different carbon skeletons; every one has formula C{n}H{h}; compared with {pc} at n = {p}, growth of {gr}×.',
s2t:'Drawn differently or really different? Let the canonical form decide',
s2e:'This step answers: are two differently drawn pictures the same molecule? One molecule can be drawn in different ways (rotated, flipped, starting from another carbon), and different molecules can look alike. To decide, turn both trees into their <strong>canonical form</strong> (a description that does not depend on the drawing); if they match it is the same molecule. The page gives you a random pair of pictures; judge "same molecule" or "different molecules", then check against the canonical form.',
s2o:'First count the longest carbon chain and the branch positions in each picture yourself, then judge; after answering, check whether the two pictures\' "longest chain" and canonical form agree in the feedback; do several questions and watch for pictures that look different but are the same.',
r2q:'Question {k} (n = {n}): are the left and right pictures the same molecule? (answered {tot}, correct {ok})',
r2a:'{good}: canonical forms are {eq}; the left picture\'s longest chain is {l1} carbons and the right\'s is {l2}, and both have {n} carbons. (answered {tot}, correct {ok})',
good:'Correct',bad:'Wrong',eqSame:'identical — the same molecule, just drawn differently',eqDiff:'different — two different molecules (isomers)',
s3t:'Functional-group isomers: more kinds of atom, bigger differences in connection',
s3e:'This step answers: once an oxygen atom is added, how many ways can one formula be put together? In the figure circles are carbon (grey) and oxygen (red), and the number is the hydrogens attached; oxygen has at most 2 bonds. C₃H₈O has 3 isomers: 1-propanol (OH at the chain end), 2-propanol (OH on the middle carbon) and methyl ethyl ether (oxygen between two carbons, an ether). C₂H₆O has 2: ethanol and dimethyl ether. The formula is counted from the picture; boiling points differ a great deal because alcohols with O–H can hydrogen-bond to each other and ethers cannot.',
s3o:'Click 1-propanol, 2-propanol and methyl ethyl ether in turn: confirm the formula in the readout is the same while the boiling points differ; then click ethanol and dimethyl ether and compare their boiling points (over a hundred degrees apart).',
r3:'{name}: C{c}H{h}O; {kind}; boiling point {bp} °C.',
nm_pr1:'1-propanol',nm_pr2:'2-propanol',nm_meet:'methyl ethyl ether',nm_etoh:'ethanol',nm_dme:'dimethyl ether',kAlcohol:'alcohol (has –OH, can hydrogen-bond)',kEther:'ether (C–O–C, cannot hydrogen-bond)',
s4t:'Cis–trans isomers: a single bond can turn, a double bond cannot',
s4e:'This step answers: why does 2-butene have cis and trans forms while butane does not? Look at the middle carbon–carbon bond, with a methyl group on each end. Twisting about a <strong>single bond</strong> changes the energy only slightly (this page takes a maximum of 12 kJ/mol), which room-temperature thermal motion easily clears, so the twisted forms are the same molecule; twisting about a <strong>double bond</strong> means breaking half of the bond, a much higher barrier (this page takes 265 kJ/mol), so at room temperature it hardly turns, and the cis form (θ = 0°, methyls on the same side) and the trans form (θ = 180°, opposite sides) are two separable substances. The relative chance of crossing a barrier is estimated by e^(−ΔE/RT) (R = 8.314×10⁻³ kJ/(mol·K), T = 298 K, as in the activation-energy lesson).',
s4o:'Choose the single bond first and drag θ from 0° to 180°: the energy rises only to a small hill; then choose the double bond and drag again: the energy shoots up to hundreds of kJ/mol; compare with the "relative chance" e^(−ΔE/RT) in the readout.',
r4:'{kind}: θ = {th}°, twist energy {e} kJ/mol; highest barrier {bar} kJ/mol, relative chance of crossing at room temperature e^(−ΔE/RT) = {p}; {res}.',
kSingle:'single bond',kDouble:'double bond',resFree:'turns freely, so the twisted forms are the same molecule',resLocked:'hardly turns, so cis and trans are two separable molecules',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) isomers share a molecular formula but differ in connection, and differ in physical properties; (2) alkane skeletons are trees, with 2, 3, 5, 9, 18 of them for n = 4, 5, 6, 7, 8; (3) to tell whether two pictures show the same molecule, compare canonical forms, not how alike they look; (4) oxygen-containing functional-group isomers (alcohol and ether) have very different boiling points; (5) a double bond cannot turn freely, hence cis–trans isomers, while a single bond can, hence none.',
qq:'How many different carbon skeletons (isomers) does C₅H₁₂ have?',qo0:'2',qo1:'3',qo2:'5',
qwhy:'Pentane, 2-methylbutane and 2,2-dimethylpropane make 3 (the count for n = 5 in step 1).',
s5m:'The isomers here are carbon skeletons (constitutional isomers), only saturated chain alkanes plus the alcohols and ethers of step 3; rings, structural isomers containing C=C, chirality (mirror-image isomers) and the details of conformational energy are not covered; boiling points are common handbook values for comparison only; the twist energies in step 4 are teaching functions: (12/2)(1 − cos3θ) for the single bond and (265/2)(1 − cos2θ) for the double bond; trees are drawn by automatic layout and may overlap or look odd, but the structure (canonical form) is computed exactly.',
lk0:'Molecular shapes: how the bonds around each carbon form a tetrahedron and other shapes',lk1:'Activation energy: barriers and e^(−ΔE/RT), the same crossing-chance estimate',lk2:'Particles & states: boiling points and forces between molecules'
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
