const STR={
zh:{
pageTitle:'DNA 复制与翻译 · 拉链、抄写和流水线',tagline:'碱基像拉链两两配对；复制时每条链都当模板，抄写出 mRNA，核糖体再按密码子一格一格造出蛋白质。',
nav0:'0 碱基配对',nav1:'1 半保留复制',nav2:'2 转录',nav3:'3 翻译',nav4:'4 突变',nav5:'5 回顾自测',
lblTpl:'模板链',lblNew:'新合成的互补链',lblGen0:'起始',lblGenN:'第 {n} 轮',tubeLight:'轻',tubeHeavy:'重',lblOrig:'原 mRNA',lblMut:'改后 mRNA',bA:'A 腺嘌呤',bT:'T 胸腺嘧啶',bG:'G 鸟嘌呤',bC:'C 胞嘧啶',bNewStrand:'换一条新的模板链',bReset0:'重置：清除已配对的碱基',lRounds:'已复制的轮数',lPos:'位置',lCodon:'核糖体走到第几个密码子',gene1:'基因 1',gene2:'基因 2',gene3:'基因 3',
subA:'把此位置改成 A',subU:'把此位置改成 U',subG:'把此位置改成 G',subC:'把此位置改成 C',bDel:'删除此位置的碱基',bIns:'在此位置前插入一个 A',bReset4:'重置：恢复原来的基因',
s0t:'碱基配对：A 配 T，G 配 C',
s0e:'这一步要回答：DNA 的两条链为什么能“对得上”？DNA 由四种碱基组成：A（腺嘌呤）、T（胸腺嘧啶）、G（鸟嘌呤）、C（胞嘧啶）。两条链之间，A 总与 T 配对（形成 2 个氢键），G 总与 C 配对（形成 3 个氢键）。给定一条模板链，请依次为每个位置选出互补的碱基；选错会提示并计数。配完后，页面按配对类型统计氢键总数，并用华莱士法则估算双链“拆开”所需温度 Tm ≈ 2×(A+T) + 4×(G+C) °C：G–C 越多越牢。',
s0o:'逐个选择互补碱基，注意选错时提示的内容；配完后读 GC 含量、氢键数和 Tm；点“换一条新的模板链”再配一次，比较不同链的 Tm。',
r0:'已配对 {k}/{n} 个；选错 {err} 次；{status}',
st0:'下一个要配的是模板上的 {b}。',stOk:'全部配对完成：氢键共 {hb} 个，GC 含量 {gc}%，Tm ≈ {tm} °C。',
wrong:'选错了：{t} 只能与 {c} 配对。',
s1t:'半保留复制：每个子代 DNA 一条旧链、一条新链',
s1e:'这一步要回答：DNA 复制后，新旧链是怎样分配的？复制时双链解开，<strong>每条旧链当模板</strong>，按碱基配对合成一条新链，所以每个子代 DNA 由一条旧链和一条新链组成，叫<strong>半保留复制</strong>。1958 年梅塞尔森–斯塔尔用重氮（¹⁵N，旧链）标记，再放入轻氮（¹⁴N，新链）培养，用密度离心验证了这一点。图中紫色是最初的两条旧链，青色是新合成的链；右侧是离心管：重–重、重–轻、轻–轻三种 DNA 沉在不同密度位置。滑块是复制轮数。',
s1o:'把轮数从 0 拉到 4：看分子总数 2^轮数，含旧链的分子始终只有 2 个；右侧离心管里，中间的“重–轻”带在第 1 轮占 100%，之后越来越淡，“轻–轻”带越来越浓。',
r1:'复制 {r} 轮：共 {tot} 个双链分子；其中重–重 {hh} 个、重–轻 {hl} 个、轻–轻 {ll} 个；离心带占比：重–轻 {fhl}%，轻–轻 {fll}%。',
s2t:'转录：把基因抄成 mRNA',
s2e:'这一步要回答：基因里的信息怎样被抄出来？在细胞核里，RNA 聚合酶沿着 DNA 的<strong>模板链</strong>移动，按配对规则合成一条 <strong>mRNA</strong>：A 配 U（RNA 里用尿嘧啶 U 代替 T），T 配 A，G 配 C，C 配 G。mRNA 的序列与另一条（编码链）相同，只是 T 换成 U。滑块是已抄出的碱基数；mRNA 每 3 个碱基为一个<strong>密码子</strong>（下一步用到）。',
s2o:'把滑块从 0 拉到 18：看 mRNA 一格一格长出来，每个字母与模板链上方的字母对应配对；换基因 2、3 对比序列；核对读数里“编码链”与 mRNA 的关系。',
r2:'已转录 {p}/{n} 个碱基；模板链：{tpl}；mRNA：{mr}；编码链（T→U）：{cod}。',
s3t:'翻译：核糖体按密码子造蛋白质',
s3e:'这一步要回答：mRNA 上的序列怎样变成蛋白质？核糖体沿 mRNA 每次读 3 个碱基（一个<strong>密码子</strong>），按<strong>遗传密码表</strong>（共 64 个密码子）查出对应的氨基酸，加到肽链上；AUG 是起始密码子（编码甲硫氨酸 Met），UAA、UAG、UGA 是终止密码子，不对应氨基酸，读到它蛋白质就合成结束。滑块是核糖体已读过的密码子个数；下方圆圈是正在增长的肽链。',
s3o:'把滑块逐格右移：看肽链每次多一个氨基酸；到终止密码子时肽链停止；换基因 2、3，对比它们合成的肽链。',
r3:'基因 {g}：已读 {k}/{m} 个密码子；刚读的密码子 {cod} → {aa}；肽链：{pep}。',
stopW:'终止',nextNone:'尚未开始',
s4t:'突变：改一个字母，蛋白质会怎样？',
s4e:'这一步要回答：DNA 上的小变化会让蛋白质变成什么样？在 mRNA 上选一个位置：<strong>替换</strong>一个碱基；或<strong>删除</strong>、<strong>插入</strong>一个碱基。结果有几类：<strong>同义突变</strong>（密码子变了但氨基酸没变）、<strong>错义突变</strong>（换了一个氨基酸）、<strong>无义突变</strong>（变成终止密码子，肽链提前结束）、<strong>移码突变</strong>（插入或删除 1–2 个碱基，后面所有密码子的分组都错位）。页面把改后的 mRNA 重新翻译，与原蛋白质比对后自动判类。基因按第 3 步的选择（可在此切换）。',
s4o:'以基因 1 为例试一试：把第 6 位改成任意碱基（GCU→GCx 都是丙氨酸 Ala，同义）；把第 4 位改成 C（GCU→CCU，Ala 变 Pro，错义）；把第 9 位改成 A（UAC→UAA，出现终止密码子，无义）；删除一个碱基（移码）。点重置恢复。',
r4:'原蛋白质：{p0}；突变后：{p1}；类型：{kind}。{note}',
kNone:'尚无突变',kSil:'同义突变（蛋白质不变）',kMis:'错义突变（氨基酸被替换）',kNon:'无义突变（提前终止）',kFrame:'移码突变（读码框错位）',kIn:'整码插入/缺失（读码框不变，多或少氨基酸）',
mutNote:'共 {n} 处改动，改后 mRNA：{mr}。',
s5t:'回顾与自测',
s5e:'<strong>回顾</strong>：① A–T（2 个氢键）、G–C（3 个氢键）互补配对；② 半保留复制：每个子代 DNA 一条旧链、一条新链；③ 转录：RNA 聚合酶按模板链合成 mRNA（T 换成 U）；④ 翻译：核糖体每 3 个碱基读一个密码子，查表得到氨基酸，遇终止密码子停止；⑤ 突变的后果取决于是否改变氨基酸、是否提前终止或移码。',
qq:'为什么说 DNA 的复制是“半保留”的？',qo0:'每个子代 DNA 的两条链都是新合成的',qo1:'每个子代 DNA 含一条旧链和一条新链',qo2:'旧的 DNA 完整保留，新 DNA 另外合成',
qwhy:'每条旧链当模板合成一条新链，所以每个子代 DNA 由一旧一新两条链组成（第 1 步的离心带可验证）。',
s5m:'本页做了很多简化：链的方向（5′→3′ 与反向平行）被忽略；复制只画了结果，没有解旋酶、引物、冈崎片段、校对；转录没有启动子、内含子和加工；翻译没有 tRNA 和核糖体的具体结构；密码表是标准遗传密码；突变只演示替换与单碱基插入删除；基因都是很短的示例序列，不是真实基因；华莱士法则只对很短的链粗略成立。',
lk0:'细胞结构页：细胞核是遗传信息的保管处',lk1:'遗传与概率页：基因怎样一代代传下去，从配子到表型'
},
en:{
pageTitle:'DNA Replication and Translation · A Zipper, a Copy and an Assembly Line',tagline:'Bases pair up like a zipper; in replication each strand is a template, transcription copies a gene into mRNA, and the ribosome builds a protein codon by codon.',
nav0:'0 Base pairing',nav1:'1 Semi-conservative copying',nav2:'2 Transcription',nav3:'3 Translation',nav4:'4 Mutations',nav5:'5 Recap & check',
lblTpl:'template strand',lblNew:'new complementary strand',lblGen0:'start',lblGenN:'round {n}',tubeLight:'light',tubeHeavy:'heavy',lblOrig:'original mRNA',lblMut:'mutated mRNA',bA:'A adenine',bT:'T thymine',bG:'G guanine',bC:'C cytosine',bNewStrand:'Another template strand',bReset0:'Reset: clear the paired bases',lRounds:'Rounds of replication',lPos:'Position',lCodon:'Codons the ribosome has read',gene1:'Gene 1',gene2:'Gene 2',gene3:'Gene 3',
subA:'Change this position to A',subU:'Change this position to U',subG:'Change this position to G',subC:'Change this position to C',bDel:'Delete the base at this position',bIns:'Insert an A before this position',bReset4:'Reset: restore the original gene',
s0t:'Base pairing: A with T, G with C',
s0e:'This step answers: why do the two strands of DNA "fit"? DNA is built from four bases: A (adenine), T (thymine), G (guanine) and C (cytosine). Between the strands, A always pairs with T (making 2 hydrogen bonds) and G always pairs with C (making 3). Given a template strand, pick the complementary base for each position in turn; a wrong pick is flagged and counted. When done, the page totals the hydrogen bonds by pair type and estimates the temperature needed to pull the duplex apart with the Wallace rule, Tm ≈ 2×(A+T) + 4×(G+C) °C: the more G–C, the tighter.',
s0o:'Pick the complementary bases one by one and note the message when you pick wrong; when finished read the GC content, hydrogen-bond count and Tm; press "another template strand" and pair again to compare Tm between strands.',
r0:'{k}/{n} paired; {err} wrong picks; {status}',
st0:'Next to pair is the template\'s {b}.',stOk:'All paired: {hb} hydrogen bonds in total, GC content {gc}%, Tm ≈ {tm} °C.',
wrong:'Wrong: {t} can only pair with {c}.',
s1t:'Semi-conservative replication: each daughter DNA has one old strand and one new',
s1e:'This step answers: after DNA copies itself, how are old and new strands shared out? During replication the duplex unwinds and <strong>each old strand is a template</strong> on which a new strand is made by base pairing, so every daughter DNA is one old strand plus one new strand: <strong>semi-conservative replication</strong>. In 1958 Meselson and Stahl labelled DNA with heavy nitrogen (¹⁵N, old strands), moved it to light nitrogen (¹⁴N, new strands) and confirmed this by density centrifugation. In the figure purple is the original two old strands and cyan is newly made strand; on the right is the centrifuge tube, where heavy–heavy, heavy–light and light–light DNA settle at different densities. The slider is the number of rounds.',
s1o:'Move the rounds from 0 to 4: the total number of molecules is 2^rounds, but only 2 molecules ever contain an old strand; in the tube the middle "heavy–light" band is 100% after round 1, then fades while the "light–light" band thickens.',
r1:'After {r} rounds: {tot} duplex molecules, of which heavy–heavy {hh}, heavy–light {hl}, light–light {ll}; centrifuge bands: heavy–light {fhl}%, light–light {fll}%.',
s2t:'Transcription: copy the gene into mRNA',
s2e:'This step answers: how is the information in a gene copied out? In the nucleus RNA polymerase moves along the DNA <strong>template strand</strong> and builds an <strong>mRNA</strong> by the pairing rules: A pairs with U (RNA uses uracil, U, in place of T), T with A, G with C, C with G. The mRNA\'s sequence matches the other (coding) strand with T replaced by U. The slider is the number of bases copied so far; every 3 bases of mRNA form a <strong>codon</strong> (used in the next step).',
s2o:'Move the slider from 0 to 18: watch the mRNA grow one letter at a time, each paired with the template letter above it; compare genes 2 and 3; check the relationship between "coding strand" and mRNA in the readout.',
r2:'{p}/{n} bases transcribed; template: {tpl}; mRNA: {mr}; coding strand (T→U): {cod}.',
s3t:'Translation: the ribosome builds the protein codon by codon',
s3e:'This step answers: how does the sequence on mRNA become a protein? The ribosome reads mRNA 3 bases at a time (a <strong>codon</strong>), looks up the amino acid in the <strong>genetic code table</strong> (64 codons in all) and adds it to the chain; AUG is the start codon (coding methionine, Met), and UAA, UAG and UGA are stop codons that code for no amino acid, ending the protein when read. The slider is the number of codons the ribosome has read; the circles below are the growing peptide chain.',
s3o:'Move the slider right one step at a time: the chain gains one amino acid each step; at the stop codon the chain ends; switch to genes 2 and 3 and compare the peptides they make.',
r3:'Gene {g}: {k}/{m} codons read; the codon just read {cod} → {aa}; peptide: {pep}.',
stopW:'Stop',nextNone:'not started',
s4t:'Mutations: change one letter, what happens to the protein?',
s4e:'This step answers: what do small changes in DNA do to the protein? Pick a position on the mRNA and <strong>substitute</strong> a base, or <strong>delete</strong> or <strong>insert</strong> one. The outcomes fall in classes: <strong>silent</strong> (the codon changes but the amino acid does not), <strong>missense</strong> (a different amino acid), <strong>nonsense</strong> (a stop codon appears and the chain ends early) and <strong>frameshift</strong> (inserting or deleting 1–2 bases shifts the grouping of every codon after it). The page re-translates the changed mRNA and compares it with the original protein to name the class. The gene is the one picked in step 3 (you can switch it here).',
s4o:'With gene 1, try: change position 6 to any base (GCU→GCx is always alanine, Ala: silent); change position 4 to C (GCU→CCU, Ala becomes Pro: missense); change position 9 to A (UAC→UAA, a stop codon appears: nonsense); delete a base (frameshift). Press reset to restore.',
r4:'Original protein: {p0}; after mutation: {p1}; class: {kind}. {note}',
kNone:'no mutation yet',kSil:'silent (protein unchanged)',kMis:'missense (an amino acid replaced)',kNon:'nonsense (early stop)',kFrame:'frameshift (reading frame shifted)',kIn:'in-frame insertion/deletion (frame kept, amino acids gained or lost)',
mutNote:'{n} changes in all; mRNA after changes: {mr}.',
s5t:'Recap and self-check',
s5e:'<strong>Recap</strong>: (1) A–T (2 hydrogen bonds) and G–C (3 hydrogen bonds) pair complementarily; (2) semi-conservative replication gives every daughter DNA one old and one new strand; (3) in transcription RNA polymerase builds mRNA from the template strand (T becomes U); (4) in translation the ribosome reads 3 bases per codon, looks up the amino acid and stops at a stop codon; (5) the effect of a mutation depends on whether it changes the amino acid, creates an early stop or shifts the frame.',
qq:'Why is DNA replication called "semi-conservative"?',qo0:'Both strands of each daughter DNA are newly made',qo1:'Each daughter DNA has one old strand and one new strand',qo2:'The old DNA is kept whole and a new one is made separately',
qwhy:'Each old strand serves as a template for one new strand, so each daughter DNA is one old plus one new strand (check the centrifuge bands in step 1).',
s5m:'This page simplifies a lot: strand direction (5′→3′, antiparallel) is ignored; replication shows only the result, without helicase, primers, Okazaki fragments or proofreading; transcription has no promoters, introns or processing; translation has no tRNA or ribosome structure; the codon table is the standard genetic code; mutations are only substitutions and single-base insertions and deletions; the genes are short example sequences, not real genes; the Wallace rule holds only roughly for very short strands.',
lk0:'Cell structure: the nucleus is where genetic information is kept',lk1:'Genetics & probability: how genes pass on, from gametes to phenotypes'
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
