const STR={
zh:{
pageTitle:'减数分裂 · 洗牌、切半，造配子',tagline:'染色体成对配对、交换片段、先分开同源染色体再分开姐妹染色单体：一个二倍体细胞变成四个互不完全相同的单倍体配子。',
nav0:'0 成对的染色体',nav1:'1 两次分裂',nav2:'2 随机组合',nav3:'3 交换',nav4:'4 与有丝分裂比',nav5:'5 回顾自测',
lgM:'红：母方',lgP:'蓝：父方',lgDash:'虚线：设定的 RF 对应的期望比例',lPairs:'同源染色体对数 n',lStage:'分裂阶段',lRf:'重组率 RF（两个基因之间）',bRep:'复制染色体（S 期）',bUnrep:'重置：回到复制前',bFlip:'重新随机一次染色体取向',bCross:'开关：发生交换',bMake10:'做 10 次减数分裂（得到 40 个配子）',bReset2:'重置：清空统计',bMake100:'做 25 次减数分裂（得到 100 个配子）',bReset3:'重置：清空统计',bMito:'有丝分裂',bMeio:'减数分裂',bAgain:'再随机做一次',
s0t:'二倍体细胞的染色体是成对的',
s0e:'这一步要回答：为什么说“减数”分裂？大多数体细胞是<strong>二倍体</strong>（记为 2n）：染色体成对，每一对中一条来自母方（红），一条来自父方（蓝），这两条叫<strong>同源染色体</strong>。本页用 n 表示同源染色体的对数，所以细胞里有 2n 条染色体。要产生精子或卵（<strong>配子</strong>），细胞必须把染色体数目减半，让每个配子只带每对里的一条，这样受精后两个配子合起来才恢复 2n。点“复制染色体”看 S 期：每条染色体复制成两条相同的<strong>姐妹染色单体</strong>（X 形），条数还是 2n，但 DNA 加倍。',
s0o:'调节对数 n：数一数红蓝染色体各有几条；点复制：每条变成 X 形（两条姐妹染色单体），染色体条数不变；读数给出细胞内染色体条数和染色单体条数，以及配子应得到的条数。',
r0:'n = {n} 对：体细胞染色体 2n = {c2}；{state}配子应有 n = {c1} 条（每对里一条）。',
stUnrep:'尚未复制：染色单体条数 = {c2}；',stRep:'已复制：每条染色体含 2 条姐妹染色单体，共 {ch} 条染色单体；',
s1t:'两次分裂：先分同源染色体，再分姐妹染色单体',
s1e:'这一步要回答：染色体数怎样减半，又怎样产生新的组合？减数分裂有两次连续的分裂。<strong>减数分裂 I</strong>：同源染色体先配对（前期 I），可能在非姐妹染色单体之间<strong>交换</strong>片段（互换），然后在中期 I 排在赤道板上，后期 I 同源染色体被拉向两极——这一步把染色体数减半。<strong>减数分裂 II</strong>：类似有丝分裂，姐妹染色单体分开，得到 4 个单倍体细胞。图中取 n = 2 对，红蓝是母方、父方来源，一条染色单体上、下两段颜色不同就表示发生过交换。拖动滑块逐阶段观察。',
s1o:'把阶段从 0 拖到 7：注意哪一步染色体数从 4 条（2n）降到 2 条（n），哪一步姐妹染色单体才分开；点“重新随机取向”看最终 4 个配子里红蓝怎样重新搭配；打开“发生交换”看单条染色单体上出现两种颜色。',
stg0:'复制后（S 期结束）：每条染色体含两条姐妹染色单体',stg1:'前期 I：同源染色体配对，可发生交换',stg2:'中期 I：成对的同源染色体排在赤道板，两侧取向是随机的',stg3:'后期 I：同源染色体被拉向两极',stg4:'末期 I：得到 2 个细胞，每个有 n 条（双染色单体）染色体',stg5:'中期 II：每个细胞里的染色体排在赤道板',stg6:'后期 II：姐妹染色单体分开，被拉向两极',stg7:'末期 II：得到 4 个单倍体配子，每个 n 条单染色单体',
r1:'阶段 {s}/7：{name}。取向：{ori}；交换：{cr}。{cnt}',
oriTxt:'第 {p} 对：母方（红）去{side}',sideL:'左极',sideR:'右极',crOn:'已发生（每对各一次）',crOff:'未发生',
cnt1:'当前每个细胞的染色体数：{c}；染色单体数：{ch}。',
s2t:'随机取向：n 对染色体能搭配出 2ⁿ 种配子',
s2e:'这一步要回答：为什么同一对父母的孩子互不相同？在中期 I，每对同源染色体朝哪个极是<strong>独立随机</strong>的，所以 n 对染色体的搭配共有 2ⁿ 种（不考虑交换）。人类 n = 23，2²³ = 8,388,608 种，已经很多。点“做 10 次减数分裂”：每次随机取向并产生 4 个配子；下面的柱状图累积每种搭配出现的次数。次数越多，各柱越接近相等。条形下方的编码里 R 表示某对染色体取母方（红），B 表示父方（蓝）。',
s2o:'把 n 设为 3（8 种搭配），连续点几次：先看柱子参差不齐，再看累积到几百个配子后是否趋于均匀；读数里“最高/期望”应逐渐接近 1。',
r2:'n = {n}：共 {k} 种可能的配子；已做 {m} 次减数分裂，得到 {g} 个配子；其中出现的种类 {seen}/{k}；最高柱 / 期望值 = {ratio}。人类 n = 23 时共有 {human} 种。',
s3t:'交换：连锁的基因也能重新搭配',
s3e:'这一步要回答：位于同一条染色体上的两个基因一定一起走吗？不一定。设母方染色体带 A B，父方带 a b（A、B 在同一条染色体上，称为<strong>连锁</strong>）。如果不发生交换，配子只有 AB 和 ab（亲本型）；交换发生后，非姐妹染色单体换了一段，出现 Ab 和 aB（<strong>重组型</strong>）。重组型配子占全部配子的比例叫<strong>重组率</strong> RF；两个基因离得越远，RF 越大，最大约 0.5（相当于不连锁）。点“做 25 次减数分裂”累积 100 个配子，看重组型比例是否接近你设的 RF。',
s3o:'把 RF 设为 0：只出现亲本型；设为 0.2：约 20% 是重组型（Ab、aB 各约 10%）；设为 0.5：四种配子各约 25%；多累积几次，看实测 RF 怎样接近设定值。',
r3:'设定 RF = {rf}；已做 {m} 次减数分裂，共 {g} 个配子：AB {ab}，ab {ab2}，Ab {r1}，aB {r2}；实测 RF = {meas}。',
noData:'暂无数据',
s4t:'和有丝分裂比：细胞数、染色体数、遗传一致性',
s4e:'这一步要回答：减数分裂和有丝分裂到底有什么不同？对 n = 3 对染色体的细胞各做一次：<strong>有丝分裂</strong>复制后姐妹染色单体直接分开，得到 2 个与母细胞完全一样的二倍体子细胞（2n = 6）；<strong>减数分裂</strong>经过两次分裂得到 4 个配子，每个只有 n = 3 条染色体，而且互相不一定相同（取向随机，每对还有一半的概率发生交换）。读数会统计子细胞的个数、每个细胞的染色体数、其中互不相同的细胞种类数。',
s4o:'先点“有丝分裂”再点“再随机做一次”：始终 2 个相同的细胞，每个 6 条；再点“减数分裂”并多做几次：4 个细胞、每个 3 条；有的时候只有 2 种、有的时候 4 种不同——为什么？',
r4:'{kind}：得到 {cells} 个细胞，每个细胞 {c} 条染色体；其中互不相同的种类 {types} 种。',
kMito:'有丝分裂',kMeio:'减数分裂',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① 体细胞是二倍体（2n），配子是单倍体（n）；② 减数分裂 I 分开同源染色体（数目减半），II 分开姐妹染色单体；③ 中期 I 的随机取向使 n 对染色体产生 2ⁿ 种搭配；④ 交换让连锁的基因重新搭配，重组率 RF 反映基因间距离；⑤ 有丝分裂得到 2 个相同的二倍体细胞，减数分裂得到 4 个不一定相同的单倍体配子。',
qq:'人的体细胞有 46 条染色体，一个正常的精子有多少条？',qo0:'23 条',qo1:'46 条',qo2:'92 条',
qwhy:'配子只带每对同源染色体里的一条，所以是 n = 23 条（第 0 步）。',
s5m:'本页是教学简化：每对同源染色体最多交换一次（且只在非姐妹单体间换下段），不含多次交换、干涉、染色体不分离、性染色体的特殊分离、卵母细胞不对称分裂和减数分裂的检验点；染色体用等长条形表示，不反映真实大小；n 最多取 4（人类是 23，仅用于计算）；随机数由页面生成，次数少时有统计涨落。',
lk0:'遗传与概率页：配子怎样带着一个等位基因，棋盘格里的 3:1 从哪里来',lk1:'细胞结构页：细胞核里装着遗传物质'
},
en:{
pageTitle:'Meiosis · Shuffle, Halve, Make Gametes',tagline:'Chromosomes pair up, swap pieces, first separate the homologs and then the sister chromatids: one diploid cell becomes four haploid gametes that are not all alike.',
nav0:'0 Paired chromosomes',nav1:'1 Two divisions',nav2:'2 Random assortment',nav3:'3 Crossing over',nav4:'4 Versus mitosis',nav5:'5 Recap & check',
lgM:'red: maternal',lgP:'blue: paternal',lgDash:'dashed: expected share for the RF you set',lPairs:'Number of homologous pairs n',lStage:'Division stage',lRf:'Recombination frequency RF (between two genes)',bRep:'Replicate the chromosomes (S phase)',bUnrep:'Reset: back to before replication',bFlip:'Re-roll how the chromosomes line up',bCross:'Toggle: crossing over happens',bMake10:'Do 10 meioses (gives 40 gametes)',bReset2:'Reset: clear the tally',bMake100:'Do 25 meioses (gives 100 gametes)',bReset3:'Reset: clear the tally',bMito:'Mitosis',bMeio:'Meiosis',bAgain:'Run it again at random',
s0t:'A diploid cell has its chromosomes in pairs',
s0e:'This step answers: why is it called "meiosis", which means reduction? Most body cells are <strong>diploid</strong> (written 2n): the chromosomes come in pairs, one of each pair from the mother (red) and one from the father (blue), and these two are <strong>homologous chromosomes</strong>. On this page n is the number of homologous pairs, so the cell has 2n chromosomes. To make sperm or eggs (<strong>gametes</strong>) the cell must halve its chromosome number, so each gamete carries one chromosome of each pair and fertilisation restores 2n. Press "replicate": in S phase each chromosome is copied into two identical <strong>sister chromatids</strong> (an X shape); the chromosome count is still 2n but the DNA has doubled.',
s0o:'Change the number of pairs n: count the red and blue chromosomes; press replicate: each becomes an X (two sister chromatids) while the chromosome count stays the same; the readout gives chromosomes and chromatids in the cell and how many a gamete should get.',
r0:'n = {n} pairs: body-cell chromosomes 2n = {c2}; {state}a gamete should have n = {c1} (one of each pair).',
stUnrep:'not replicated yet: chromatids = {c2}; ',stRep:'replicated: each chromosome has 2 sister chromatids, {ch} chromatids in all; ',
s1t:'Two divisions: homologs first, then sister chromatids',
s1e:'This step answers: how is the chromosome number halved and how do new combinations arise? Meiosis is two divisions in a row. In <strong>meiosis I</strong> homologous chromosomes first pair up (prophase I), may <strong>cross over</strong> and swap pieces between non-sister chromatids, then line up on the equator in metaphase I and are pulled to opposite poles in anaphase I; this is the step that halves the number. In <strong>meiosis II</strong>, like mitosis, sister chromatids separate, giving four haploid cells. The figure uses n = 2 pairs, red and blue showing maternal and paternal origin, and a chromatid whose upper and lower parts differ in colour has crossed over. Drag the slider through the stages.',
s1o:'Drag the stage from 0 to 7: notice at which step the chromosome number drops from 4 (2n) to 2 (n) and which step finally separates sister chromatids; press "re-roll alignment" to see how red and blue recombine in the four final gametes; switch crossing over on to see two colours on one chromatid.',
stg0:'After replication (end of S phase): each chromosome has two sister chromatids',stg1:'Prophase I: homologs pair up and may cross over',stg2:'Metaphase I: homologous pairs line up on the equator, with random orientation',stg3:'Anaphase I: homologs are pulled to opposite poles',stg4:'Telophase I: 2 cells, each with n chromosomes (still double)',stg5:'Metaphase II: the chromosomes in each cell line up on the equator',stg6:'Anaphase II: sister chromatids separate and move to the poles',stg7:'Telophase II: 4 haploid gametes, each with n single chromatids',
r1:'Stage {s}/7: {name}. Alignment: {ori}; crossing over: {cr}. {cnt}',
oriTxt:'pair {p}: maternal (red) goes to the {side}',sideL:'left pole',sideR:'right pole',crOn:'occurred (once per pair)',crOff:'not occurring',
cnt1:'Chromosomes per cell now: {c}; chromatids per cell: {ch}.',
s2t:'Random assortment: n pairs can make 2ⁿ kinds of gamete',
s2e:'This step answers: why do children of the same parents differ from one another? In metaphase I, which pole each homologous pair goes to is <strong>independent and random</strong>, so n pairs combine in 2ⁿ ways (ignoring crossing over). Humans have n = 23 and 2²³ = 8,388,608, which is already a lot. Press "do 10 meioses": each one picks orientations at random and produces 4 gametes; the bars below tally how often each combination occurs. The more draws, the closer the bars are to equal. In the code under each bar, R means the pair\'s maternal (red) chromosome and B the paternal (blue) one.',
s2o:'Set n to 3 (8 combinations) and press several times: first the bars are uneven, then after a few hundred gametes see whether they level out; the readout\'s "highest / expected" should approach 1.',
r2:'n = {n}: {k} possible gamete types; {m} meioses done giving {g} gametes; types seen {seen}/{k}; tallest bar / expected = {ratio}. For humans (n = 23) there are {human} types.',
s3t:'Crossing over: linked genes can be reshuffled too',
s3e:'This step answers: must two genes on the same chromosome travel together? Not necessarily. Suppose the maternal chromosome carries A B and the paternal one a b (A and B on the same chromosome are <strong>linked</strong>). With no crossing over, the gametes are only AB and ab (parental types); after a crossover swaps a piece between non-sister chromatids, Ab and aB appear (<strong>recombinant</strong> types). The fraction of recombinant gametes is the <strong>recombination frequency</strong> RF; the farther apart two genes are, the larger RF, up to about 0.5 (equivalent to being unlinked). Press "do 25 meioses" to tally 100 gametes at a time and see whether the recombinant share approaches the RF you set.',
s3o:'Set RF to 0: only parental types; to 0.2: about 20% recombinant (Ab and aB about 10% each); to 0.5: all four types about 25% each; tally more and watch the measured RF approach the setting.',
r3:'Set RF = {rf}; {m} meioses done, {g} gametes in all: AB {ab}, ab {ab2}, Ab {r1}, aB {r2}; measured RF = {meas}.',
noData:'no data yet',
s4t:'Versus mitosis: number of cells, chromosomes and genetic sameness',
s4e:'This step answers: how exactly do meiosis and mitosis differ? Run each once on a cell with n = 3 pairs: <strong>mitosis</strong> replicates and then separates the sister chromatids directly, giving 2 diploid daughter cells (2n = 6) identical to the parent; <strong>meiosis</strong> makes 4 gametes through two divisions, each with only n = 3 chromosomes, and not necessarily alike (alignment is random and each pair crosses over with probability one half). The readout counts the cells, the chromosomes per cell and how many different kinds of cell there are.',
s4o:'Press "mitosis" then "run it again": always 2 identical cells with 6 chromosomes each; then press "meiosis" and run it several times: 4 cells with 3 chromosomes each; sometimes only 2 kinds and sometimes 4 different — why?',
r4:'{kind}: {cells} cells, each with {c} chromosomes; {types} different kinds among them.',
kMito:'Mitosis',kMeio:'Meiosis',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) body cells are diploid (2n) and gametes are haploid (n); (2) meiosis I separates homologs (halving the number) and II separates sister chromatids; (3) random alignment in metaphase I gives 2ⁿ combinations from n pairs; (4) crossing over reshuffles linked genes, and the recombination frequency RF reflects the distance between genes; (5) mitosis gives 2 identical diploid cells while meiosis gives 4 haploid gametes that are not all alike.',
qq:'A human body cell has 46 chromosomes. How many does a normal sperm have?',qo0:'23',qo1:'46',qo2:'92',
qwhy:'A gamete carries one chromosome of each homologous pair, so n = 23 (step 0).',
s5m:'This page is a teaching simplification: each homologous pair crosses over at most once (swapping only the lower part between non-sister chromatids), and it leaves out multiple crossovers, interference, nondisjunction, the special segregation of sex chromosomes, asymmetric divisions in egg formation and meiotic checkpoints; chromosomes are drawn as equal bars and do not reflect real sizes; n goes up to 4 (humans have 23, used only in calculation); random numbers are generated by the page and fluctuate when the counts are small.',
lk0:'Genetics & probability: how a gamete carries one allele, where the 3:1 in the Punnett square comes from',lk1:'Cell structure: the nucleus holds the genetic material'
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
