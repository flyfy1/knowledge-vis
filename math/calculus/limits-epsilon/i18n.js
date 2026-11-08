const STR={
zh:{
pageTitle:'极限与 ε–δ · 你说多近，我就能多近',tagline:'把“无限接近”变成一场有规则的博弈：对方先给出 ε（允许的误差），你要找出 δ（x 离 a 多近就够了）。',
nav0:'0 靠近是什么意思',nav1:'1 ε–δ 博弈',nav2:'2 δ 随 ε 和位置变',nav3:'3 极限不存在',nav4:'4 数列版：ε–N',nav5:'5 回顾自测',
lK:'靠近程度 δ = 10^(−k)',lEps:'对方给的误差 ε',lDelta:'你选的 δ',lA:'位置 a（函数 f(x) = x²）',lCand:'猜测的极限值 L',
gHole:'f(x) = (x²−1)/(x−1)，x → 1',gSinc:'f(x) = sin x / x，x → 0',gJump:'f(x) = |x|/x，x → 0',gOsc:'f(x) = sin(1/x)，x → 0',gBlow:'f(x) = 1/x²，x → 0',
fLin:'f(x) = 3x + 1，x → 2',fSq:'f(x) = x²，x → 2',fInv:'f(x) = 1/x，x → 1',bBest:'帮我找出最大的 δ',
sInv:'数列 1/n',sAlt:'数列 (−1)ⁿ/n',sNoLim:'数列 (−1)ⁿ',
s0t:'“x 越来越靠近 a”时，f(x) 去了哪里？',
s0e:'这一步要回答：<strong>极限</strong>说的到底是什么？极限只关心 x 靠近 a 时 f(x) 的趋势，不关心 x = a 那一点的函数值（甚至函数在那一点可以没有定义，图上用空心圆表示）。选一个函数，把靠近程度 δ 调小（x = a ± δ，δ = 10^(−k)）：读数列出 x = a − δ 与 x = a + δ 处的函数值、整个窗口内函数值的最大差距。如果两边的值都靠向同一个数 L，就说极限是 L；否则极限不存在。图的纵轴固定显示，窗口越小，曲线越贴近水平线（若有极限）。',
s0o:'依次选四个函数，把 k 从 0.2 慢慢拉到 4：前两个，两侧函数值越来越接近同一个数（极限存在，分别是 2 和 1）；第三个两侧分别停在 −1 和 +1；第四个函数值在 −1 到 1 之间来回振荡，永远不稳定。',
r0:'x = a − δ → {fl}；x = a + δ → {fr}；δ = {d}；窗口内函数值的最大差距 {range}；{verdict}',
vLim:'两侧都靠向 {L}：极限存在，等于 {L}。',vNo:'窗口已经很小，两侧仍不靠近同一个数，或窗口内一直大幅变动：这里极限不存在。',vMid:'窗口还偏大，继续把 δ 调小再看。',
s1t:'ε–δ 博弈：对方给 ε，你找 δ',
s1e:'这一步要回答：怎样把“无限接近”写成严格的说法？<strong>ε–δ 定义</strong>：说 lim(x→a) f(x) = L，意思是对任意给定的误差 ε &gt; 0，都能找到一个 δ &gt; 0，使得只要 0 &lt; |x − a| &lt; δ，就有 |f(x) − L| &lt; ε。图中橙色横带是 L ± ε（对方的要求），竖直的青色窗口是 a ± δ（你的选择）；窗口内曲线若冲出了横带，那一段画成红色——说明这个 δ 不行。读数会检查整个窗口，并告诉你可行的最大 δ。',
s1o:'选 f(x) = 3x + 1，把 ε 设为 0.5：把 δ 从大拉到小，看红色部分消失的临界点（应是 ε/3）；再换成 f(x) = x²、1/x，找出各自的临界 δ；点“帮我找出最大的 δ”核对。',
r1:'函数 {fn}：L = {L}，ε = {eps}，你的 δ = {d}：窗口内函数值偏离 L 最大 {dev}，{res}；可行的最大 δ ≈ {best}。',
ok:'小于 ε，这个 δ 可行',bad:'超过 ε，这个 δ 不行',
s2t:'δ 要多小？取决于 ε，也取决于位置',
s2e:'这一步要回答：δ 和 ε 是什么关系？取 f(x) = x² 在点 a：对每个 ε，最大可行的 δ 是 δ(ε) = √(a² + ε) − a（右侧更严，取两侧中较小者）。ε 越小 δ 越小：当 ε 很小时 δ ≈ ε/(2a)，其中 2a 就是 x² 在 a 处的斜率——斜率越大，同样的误差要求的 δ 越小。左图是 δ 随 ε 变化的曲线，右图是（固定 ε 时）δ 随位置 a 变化的曲线；圆点是当前设置。',
s2o:'把 a 从 0.5 拉到 5：同一个 ε 要求的 δ 越来越小（曲线越陡）；固定 a，把 ε 减半，δ 大约也减半——对照读数里 ε/(2a) 的近似值。',
r2:'a = {a}，ε = {eps}：最大可行 δ = {d}（精确公式 √(a²+ε) − a）；近似 ε/(2a) = {ap}；斜率 2a = {sl}。',
s3t:'极限不存在：任何 L 都过不了',
s3e:'这一步要回答：怎样用 ε–δ 说明“极限不存在”？取 ε = 0.5，猜一个极限值 L（滑块），再找 δ：若找不到任何 δ 使窗口内函数值都在 L ± 0.5 内，这个 L 就被否决。跳跃 |x|/x 左右分别是 −1 和 +1，任何 L 至少离其中一侧 ≥ 1，而 0.5 比一半还小，所以无论怎么猜都不行；sin(1/x) 在 0 附近无限振荡，覆盖 −1 到 1，同样不行；1/x² 趋于无穷，没有有限的 L。读数还会把 L 从 −3 到 3 全扫一遍，统计有多少个 L 通过。',
s3o:'选“跳跃”函数，拖动猜测的 L 从 −2 到 2：始终得到“找不到 δ”；读数里“通过的 L 个数”应为 0；再换另外两个函数试。',
r3:'函数 {fn}，ε = 0.5，猜测 L = {L}：{res}；在 L ∈ [−3, 3] 上扫描 {n} 个 L（步长 0.01），其中 {pass} 个能找到 δ。',
noDelta:'找不到 δ（窗口再小也有函数值偏离 L 超过 ε）',hasDelta:'可行的最大 δ ≈ {d}',
s4t:'数列版：ε–N',
s4e:'这一步要回答：数列的极限是怎么定义的？<strong>数列极限</strong>：说 aₙ → L，意思是对任意 ε &gt; 0，能找到一个 N，使得 n &gt; N 之后<strong>所有</strong>项都满足 |aₙ − L| &lt; ε。图中点是数列的各项，橙色带是 L ± ε（本页对三个数列都取 L = 0）。读数用最前 20000 项找出最后一个落在带外的位置，N 就是它。1/n 到某项之后全部进入带内；(−1)ⁿ/n 在 0 两侧振荡，但幅度缩小，也能进入；(−1)ⁿ 永远在 ±1 来回，ε &lt; 1 时永远有项落在带外，找不到 N。',
s4o:'把 ε 从 1 慢慢减小到 0.02：看 1/n 和 (−1)ⁿ/n 需要的 N 变大（大约是 1/ε），而 (−1)ⁿ 在 ε &lt; 1 时没有 N。',
r4:'数列 {sn}，L = 0，ε = {eps}：{res}',
nFound:'N = {N}：第 {N1} 项起（n &gt; {N}）所有项都在 L ± ε 内（检查到 n = 20000）',nNone:'找不到 N：在前 20000 项里一直有项落到带外',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 极限看的是 x → a 时 f(x) 的趋势，与 f(a) 是否存在无关；② ε–δ：对任意 ε 都能找到 δ，使 0 &lt; |x − a| &lt; δ ⟹ |f(x) − L| &lt; ε；③ δ 随 ε 变小而变小，斜率越大 δ 越小；④ 极限不存在：任何 L 都有某个 ε 找不到 δ（跳跃、振荡、趋于无穷）；⑤ 数列版：n &gt; N 之后所有项都在 L ± ε 内。',
qq:'已知对 ε = 0.1，δ = 0.03 可行（0 < |x − a| < 0.03 ⟹ |f(x) − L| < 0.1）。那么对 ε = 0.5，同一个 δ = 0.03：',qo0:'一定不行',qo1:'一定可行',qo2:'不一定，要重新找',
qwhy:'误差要求放宽到 ε = 0.5，窗口内函数值本来就在更窄的 0.1 以内，当然也在 0.5 以内；反过来，对更小的 ε（如 0.01）则不一定可行（第 1 步：把 ε 调小，红色部分会出现）。',
s5m:'本页只用有限的采样来检查“窗口内所有点”（每侧 2000 个点），对连续的、性质良好的函数足够，但不是证明；第 3 步“不存在”的结论是对 ε = 0.5 和所给的几个函数，由扫描 L ∈ [−3, 3] 得到的；数列的 N 只检查到 n = 20000；δ 的“最大可行值”用二分法数值求出，与解析公式在第 1、2 步里对照；极限还有单侧极限、无穷极限等推广，本页没有涉及。',
lk0:'导数页：割线逼近切线，斜率就是一个极限',lk1:'导数页：每个点都有导数——对每个 x 都要做一次 ε–δ'
},
en:{
pageTitle:'Limits and ε–δ · Name How Close, and I Can Get That Close',tagline:'Turn "gets arbitrarily close" into a game with rules: the opponent gives ε (the allowed error) and you must find δ (how close x must be to a).',
nav0:'0 What approaching means',nav1:'1 The ε–δ game',nav2:'2 δ vs ε and position',nav3:'3 No limit',nav4:'4 Sequences: ε–N',nav5:'5 Recap & check',
lK:'Closeness δ = 10^(−k)',lEps:'The error ε you are given',lDelta:'The δ you choose',lA:'Position a (function f(x) = x²)',lCand:'Guessed limit L',
gHole:'f(x) = (x²−1)/(x−1), x → 1',gSinc:'f(x) = sin x / x, x → 0',gJump:'f(x) = |x|/x, x → 0',gOsc:'f(x) = sin(1/x), x → 0',gBlow:'f(x) = 1/x², x → 0',
fLin:'f(x) = 3x + 1, x → 2',fSq:'f(x) = x², x → 2',fInv:'f(x) = 1/x, x → 1',bBest:'Find the largest δ for me',
sInv:'sequence 1/n',sAlt:'sequence (−1)ⁿ/n',sNoLim:'sequence (−1)ⁿ',
s0t:'As x gets ever closer to a, where does f(x) go?',
s0e:'This step answers: what does a <strong>limit</strong> actually say? A limit cares only about the trend of f(x) as x approaches a, not about the value at x = a (the function need not even be defined there, drawn as an open circle). Pick a function and shrink the closeness δ (x = a ± δ, δ = 10^(−k)): the readout lists the function values at x = a − δ and x = a + δ and the largest spread of values across the whole window. If the values on both sides home in on one number L, the limit is L; otherwise the limit does not exist. The vertical axis is fixed, so the smaller the window the closer the curve hugs a horizontal line (if there is a limit).',
s0o:'Pick the four functions in turn and slide k slowly from 0.2 to 4: for the first two the values on both sides get closer to one number (the limit exists, 2 and 1); for the third they settle at −1 on one side and +1 on the other; the fourth keeps oscillating between −1 and 1 and never settles.',
r0:'x = a − δ → {fl}; x = a + δ → {fr}; δ = {d}; largest spread of values in the window {range}; {verdict}',
vLim:'both sides approach {L}: the limit exists and equals {L}.',vNo:'the window is already small, yet the two sides do not approach one number, or the values keep swinging widely: no limit here.',vMid:'the window is still fairly large; shrink δ further and look again.',
s1t:'The ε–δ game: the opponent gives ε, you find δ',
s1e:'This step answers: how can "arbitrarily close" be stated rigorously? The <strong>ε–δ definition</strong>: lim(x→a) f(x) = L means that for every error ε &gt; 0 there is a δ &gt; 0 such that whenever 0 &lt; |x − a| &lt; δ we have |f(x) − L| &lt; ε. In the figure the orange horizontal band is L ± ε (the opponent\'s demand) and the vertical cyan window is a ± δ (your choice); wherever the curve leaves the band inside the window it is drawn red, meaning that δ fails. The readout checks the whole window and tells you the largest workable δ.',
s1o:'Choose f(x) = 3x + 1 and set ε to 0.5: slide δ from large to small and find the threshold where the red part vanishes (it should be ε/3); then try f(x) = x² and 1/x and find their thresholds; press "find the largest δ" to check.',
r1:'Function {fn}: L = {L}, ε = {eps}, your δ = {d}: the largest deviation from L in the window is {dev}, {res}; largest workable δ ≈ {best}.',
ok:'below ε, so this δ works',bad:'above ε, so this δ fails',
s2t:'How small must δ be? It depends on ε and on the position',
s2e:'This step answers: how are δ and ε related? Take f(x) = x² at the point a: for each ε the largest workable δ is δ(ε) = √(a² + ε) − a (the right side is stricter, so it is the smaller of the two sides). The smaller ε, the smaller δ: for small ε, δ ≈ ε/(2a), where 2a is the slope of x² at a; the steeper the slope, the smaller the δ needed for the same error demand. The left plot shows δ against ε and the right plot (for fixed ε) shows δ against the position a; the dot is the current setting.',
s2o:'Move a from 0.5 to 5: the same ε demands an ever smaller δ (the curve gets steeper); at a fixed a, halve ε and δ roughly halves too; compare with the ε/(2a) approximation in the readout.',
r2:'a = {a}, ε = {eps}: largest workable δ = {d} (exact formula √(a²+ε) − a); approximation ε/(2a) = {ap}; slope 2a = {sl}.',
s3t:'No limit: no L passes the test',
s3e:'This step answers: how does ε–δ show that a limit does not exist? Take ε = 0.5, guess a limit value L (slider) and look for δ: if no δ keeps all the function values in the window within L ± 0.5, that L is rejected. The jump |x|/x is −1 on one side and +1 on the other, so any L is at least 1 away from one side and 0.5 is less than half of that, so no guess works; sin(1/x) oscillates endlessly near 0 covering −1 to 1, so it fails as well; 1/x² goes to infinity and has no finite L. The readout also sweeps L from −3 to 3 and counts how many L pass.',
s3o:'Choose the jump function and drag the guessed L from −2 to 2: you always get "no δ found"; the readout\'s count of passing L should be 0; then try the other two functions.',
r3:'Function {fn}, ε = 0.5, guessed L = {L}: {res}; sweeping {n} values of L over [−3, 3] (step 0.01), {pass} of them have a workable δ.',
noDelta:'no δ found (however small the window, some values stray from L by more than ε)',hasDelta:'largest workable δ ≈ {d}',
s4t:'The sequence version: ε–N',
s4e:'This step answers: how is the limit of a sequence defined? <strong>Limit of a sequence</strong>: aₙ → L means that for every ε &gt; 0 there is an N such that for n &gt; N <strong>all</strong> the terms satisfy |aₙ − L| &lt; ε. The dots are the terms and the orange band is L ± ε (this page takes L = 0 for all three sequences). The readout uses the first 20000 terms to find the last one outside the band; N is that position. For 1/n all terms are inside from some point on; (−1)ⁿ/n swings either side of 0 but with shrinking size and also gets inside; (−1)ⁿ keeps flipping between ±1, so for ε &lt; 1 there are always terms outside the band and no N exists.',
s4o:'Reduce ε slowly from 1 to 0.02: the N needed for 1/n and (−1)ⁿ/n grows (about 1/ε), while (−1)ⁿ has no N for ε &lt; 1.',
r4:'Sequence {sn}, L = 0, ε = {eps}: {res}',
nFound:'N = {N}: from term {N1} on (n &gt; {N}) all terms are within L ± ε (checked up to n = 20000)',nNone:'no N found: among the first 20000 terms there are always terms outside the band',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) a limit is about the trend of f(x) as x → a, whether or not f(a) exists; (2) ε–δ: for every ε there is a δ such that 0 &lt; |x − a| &lt; δ ⟹ |f(x) − L| &lt; ε; (3) δ shrinks as ε shrinks, and the steeper the slope the smaller δ must be; (4) no limit: for every L some ε has no δ (jump, oscillation, blow-up); (5) sequence version: beyond N all terms are within L ± ε.',
qq:'You know δ = 0.03 works for ε = 0.1 (0 < |x − a| < 0.03 ⟹ |f(x) − L| < 0.1). For ε = 0.5, does the same δ = 0.03 work?',qo0:'Certainly not',qo1:'Certainly yes',qo2:'Not necessarily, you must look again',
qwhy:'Relaxing the demand to ε = 0.5 is easier: the values in the window were already within the tighter 0.1, so they are within 0.5; the converse need not hold for a smaller ε such as 0.01 (step 1: shrink ε and red parts appear).',
s5m:'This page checks "all points in the window" by finite sampling (2000 points per side), enough for well-behaved continuous functions but not a proof; the "no limit" conclusion in step 3 holds for ε = 0.5 and the functions shown, found by sweeping L over [−3, 3]; N for sequences is checked only up to n = 20000; the largest workable δ is found numerically by bisection and compared with the analytic formulas in steps 1 and 2; one-sided limits, infinite limits and other extensions are not covered.',
lk0:'Derivative: secants approaching the tangent, where the slope is itself a limit',lk1:'Derivative: every point has its own derivative, an ε–δ at each x'
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
