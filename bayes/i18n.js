'use strict';
/* ============================================================
   贝叶斯讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值；
     动态反馈（押注/小测）只存状态（选项下标），文本由状态现算，
     切语言时按 i18n 键重渲染、不丢状态。
   ============================================================ */
const STR = {
  zh: {
    docTitle: '贝叶斯 · 先查底子，再看证据 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '贝叶斯',
    tagline: '一次检测说你得了一种只有 1% 人会得的病，检测本身还挺准——可你真中招的概率，其实只有 9%。贝叶斯定理讲的不是检测准不准，是证据落在多薄的底子上。这一页把先验、似然比、后验变成一条能亲手拨动的流水账：先查底子，再看证据。',
    nav0: '0 钩子', nav1: '1 先验是起点', nav2: '2 证据是乘法', nav3: '3 证据连乘',
    nav4: '4 连续版 · 硬币', nav5: '5 洗刷 + 频率树', nav6: '6 终章 · 防谬误',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 贝叶斯 Bayes —— 一步一交互系列',
    reset: '重置', newSeed: '换一颗种子', dash: '—',

    s0k: '第 0 步 · 钩子',
    s0t: '检测说你阳性——先别慌，先押个注',
    s0e: '一种病，<strong>患病率 1%</strong>：一万人里大约 100 人真得。你去做了检测：真病人有 <strong>90%</strong> 会被检出（灵敏度），但健康人也有 <strong>9%</strong> 会被误报（假阳性率）。现在，你的结果是<strong>阳性</strong>。问题来了：你真得病的概率，大约是多少？先押一注，再揭晓。',
    s0betQ: '先押一注：你觉得「真得病」的概率约是？',
    bet90: '约 90%', bet50: '约 50%', bet9: '约 9%', bet1: '约 1%',
    s0fbNone: '还没押注——选一个你的直觉答案，再揭晓。',
    s0fbRight: '你押了 {pick}——<strong>押对了</strong>。多数人的直觉会押 90% 甚至 50%：他们盯着「检测准不准」，却忘了底子里一万人只有 100 个病人。下面把这一万人摆出来，数给你看。',
    s0fbWrong: '你押了 {pick}——这正是全世界最常见的答案，也是错的。错不在检测，在底子：病人本来就太少了，误报的人一多，就把真病人淹没了。下面把一万人摆出来数数。',
    s0reveal: '揭晓：把一万人摆出来 ↓',
    s0again: '收起重押',
    cAll: '10000 人，每格 1 人',
    cSickCap: '橙格 100 = 真病人',
    cTPCap: '青 = 真阳性（检出）', cFPCap: '橙 = 假阳性（误报）', cFNCap: '暗红 = 漏检',
    s0ro: '一万人里：真病人 <span>100</span> 人，检出 <span>90</span> 人；健康人 <span>9900</span> 人，误报 <span>891</span> 人。报阳性的共 <span>981</span> 人，真病人只占 90 / 981 = <span>{ppv}</span>。检测没骗你——是病人这个底子太薄，误报的人数反倒更多。',
    s0hint: '这不是文字游戏：乳腺 X 光、传染病初筛、机场安检告警，全是同一个结构、同一笔账。记住这个画面：<strong>阳性的人堆里，大部分是误报</strong>——只要病够罕见。后面几步，我们把这笔账算成公式，再算成习惯。',

    s1k: '第 1 步 · 先验是起点',
    s1t: '同一份证据，落在不同的底子上',
    s1e: '证据还是那一份——「一次阳性」。变的只有底子：先验患病率从 0.1% 拉到 50%。拖滑杆看后验怎么走：底子 0.1% 时后验还不到 1%；底子 1% 就是第 0 步的 9.17%；底子 10% 时升到 52.6%；底子一半对一半时，阳性才值 90.9%。<strong>证据的说服力，从来不是它自己的属性，是它和底子的比值。</strong>',
    s1priorLab: '先验患病率（对数刻度）',
    s1ro: '先验 <span>{prior}</span> ＋ 一次阳性（似然比 ×10）→ 后验 <span>{post}</span> · 后验是先验的 {mult} 倍',
    cPrior: '先验', cPost: '后验（一次阳性后）',
    cHair: '细到几乎看不见——而这正是问题所在',
    s1hint: '这就是<strong>基础率忽视</strong>：只报「检测准确率 90%」而不报患病率，等于只给了分子、藏了分母。第 0 步押错注的人，多半不是算错了，是压根没想起要问底子。',

    s2k: '第 2 步 · 证据是一次乘法',
    s2t: '换上赔率眼镜：后验 = 先验 × 似然比',
    s2e: '概率挤在 0 和 1 之间，乘法在里面施展不开。换成<strong>赔率</strong>（概率 ÷ 不中概率）：先验 1% 就是赔率 1 : 99。证据的强度叫<strong>似然比</strong> LR = P(证据|得病) / P(证据|没病)：本页检测阳性 LR+ = 0.90 / 0.09 = <strong>10</strong>，阴性 LR− = 0.10 / 0.91 ≈ <strong>0.11</strong>。后验赔率 = 先验赔率 × LR，一次乘法完事。在 log₁₀ 赔率轴上，乘法变成一段<strong>位移</strong>：证据有多重，就把你往右（或往左）推多远。',
    s2priorLab: '先验概率（对数刻度）',
    s2lrLab: '似然比 LR（对数刻度）',
    s2lrPos: '预置：阳性 LR+ = 10',
    s2lrNeg: '预置：阴性 LR− ≈ 0.11',
    s2ro: '先验 {p0} → 赔率 <span>{o0}</span>（log₁₀ 赔率 {l0}）· × LR {lr} → 后验赔率 <span>{o1}</span>（log₁₀ 赔率 {l1}）→ 后验概率 <span>{p1}</span>',
    cAxisLab: 'log₁₀ 赔率轴（刻度下为对应概率）',
    cPriorPt: '先验', cPostPt: '后验',
    s2hint: 'log 赔率还有个名字叫<strong>证据权重</strong>（weight of evidence）：LR = 10 值 +1，LR = 100 值 +2，LR = 0.1 值 −1。证据在这里第一次可以「称重」、可以相加——第 3 步就靠它连乘。',

    s3k: '第 3 步 · 证据连乘',
    s3t: '昨天的后验，是今天的先验',
    s3e: '回到贯穿案例（先验 1%、同一种检测）。一条一条加证据：阳性 ×10、阴性 ×0.11，赔率链一路乘下去，后验跟着实时更新。试试连按三次阳性：9.17% → 50.3% → 91.0%——单条证据不算什么，<strong>连乘才是贝叶斯的肌肉</strong>。再混一条阴性进来，看它怎么把赔率往回拽。',
    addPos: '＋ 阳性（×10）', addNeg: '＋ 阴性（×0.11）',
    undo: '撤销上一条', clear: '清空重来',
    chipPos: '阳性', chipNeg: '阴性',
    s3ro0: '还没有证据。后验 = 先验 = <span>1.00%</span>。点「＋ 阳性」，开始记账。',
    s3ro: '证据链：赔率 {chain} → 后验赔率 <span>{odds}</span> → 真得病概率 <span>{post}</span>（共 {n} 条证据）',
    s3cap: '证据链已记满 {max} 条——账本先到这儿，点「清空重来」再记一本。',
    s3warn: '⚠ 记账的前提：<strong>假设各条证据条件独立</strong>——已知前一条结果，下一条的出错概率不变。但同一种试剂重复测，错误往往相关（同一批样本、同一个操作员、同一种身体状态）：第二次阳性携带的新信息，通常没有第一次那么多。<strong>真实更新幅度一般小于连乘结果</strong>，这条链给的是独立假设下的上限。',
    cTrajLab: '每加一条证据后的后验概率', cStartPt: '先验',
    s3hint: '注意阴性的不对称：阳性把赔率 ×10，阴性只 ÷ 约 9（×0.11）。这个检测「报阳」比「报阴」有力——因为它的假阳性率（9%）比假阴性率（10%）略低。证据的力气，全写在两个错误率的比值里。',

    s4k: '第 4 步 · 连续版',
    s4t: '一枚不知道偏不偏的硬币',
    s4e: '把问题连续化：硬币掷出正面的概率 θ 未知，先验不再是一个数，而是一条<strong>分布曲线</strong>。每抛一次，曲线按贝叶斯规则收紧一点：先验 Beta(α, β) ＋ 数据（H 次正面、T 次反面）→ 后验 Beta(α+H, β+T)，闭式更新，不靠模拟。先偷偷告诉你：这枚硬币其实是偏的，<strong>θ* = 0.65</strong>——方便你看后验往哪儿收。随机抛币走带种子的发生器（mulberry32），种子写在读数里，同种子序列可复现；手动记账与随机序列分开计数——「换一颗种子」只重启随机序列，手动记账不清零。',
    priFlat: '平坦 Beta(1, 1) · 没成见',
    priWeak: '弱倾向 Beta(8, 8) · 觉得大概公平',
    priStrong: '强成见 Beta(40, 10) · 笃定偏正面',
    flip1: '抛 +1', flip10: '抛 +10', flip100: '抛 +100',
    manH: '手动记正面', manT: '手动记反面',
    s4ro: '种子 {seed} · 随机序列：正 {rh} / 反 {rt} · 手动记账：正 {mh} / 反 {mt} · 合计 n = {n}（正 {h}）<br>后验 Beta(<span>{a}</span>, <span>{b}</span>) · 均值 <span>{mean}</span> · 最可能 θ <span>{mode}</span> · 先验均值 {pmean}',
    s4seedNote: '已换种子：随机序列从头开始；手动记账（正 {mh} / 反 {mt}）保留不清零。',
    cPriorPdf: '先验', cPostPdf: '后验', cMean: '后验均值',
    cTrue: '真实 θ* = 0.65', cRecent: '最近随机抛币（青 = 正面，灰 = 反面）', cThetaLab: 'θ（正面概率）',
    s4hint: '本页不给可信区间，只给均值与最可能值——区间要对后验分布做数值积分求分位，是另一台机器；这里先把「曲线随数据收紧」看清楚。抛得越多，曲线越窄：<strong>后验的宽度，就是你还剩多少不知道</strong>。',

    s5k: '第 5 步 · 先验洗刷 + 频率回访',
    s5t: '数据够多时，成见会被冲淡',
    s5e: '两个先验——平坦 Beta(1, 1) 与强成见 Beta(40, 10)——喂<strong>同一条</strong>抛币序列（同一种子、θ* = 0.65）。看两条后验曲线和均值之差：n 小的时候，成见还说了算；n 拉到几百，数据把两条曲线冲到一起。<strong>洗刷是真的，但要付数据的钱</strong>——样本越小，先验越贵。',
    w10: '再抛 +10', w100: '再抛 +100', w600: '一口气到 600',
    s5ro: '同一序列：种子 {seed} · n = {n} · 正面 {h} · 平坦先验后验均值 <span>{ma}</span> · 强成见后验均值 <span>{mb}</span> · 均值差 <span>{diff}</span>',
    s5noteSmall: 'n 还小：强成见的后验还被先验拽着，和平坦先验差着 {diff}——这正是「先验在小样本里举足轻重」的那一半真相。',
    s5noteBig: 'n 已经够大：两个先验的均值只差 {diff}，后验曲线基本叠在一起——数据把先验洗掉了，这也是真的一半。',
    cFlatPost: '平坦先验的后验', cStrongPost: '强成见的后验',
    s5treeT: '换回人话：自然频率树',
    s5treeE: '同一笔账，换一种讲法：不谈概率，只数人数。拖患病率滑杆，树上的人数与「阳性后真得病」同步重算——公式算出来的 PPV，和树上数出来的人头比，一字不差。<strong>自然频率就是贝叶斯穿上人话的衣服</strong>：医生跟病人解释筛查结果时，应该用这棵树，不用百分比。',
    s5prevLab: '患病率（整百分点步进）',
    s5treRo: '每 10000 人：患病 <span>{sick}</span>（真阳 {tp} · 漏检 {fn}）· 健康 <span>{healthy}</span>（假阳 {fp} · 真阴 {tn}）· 报阳性共 {pool} 人 → 真得病 <span>{ppv}</span> · 公式 PPV 同为 {ppvf} ✓',
    tbAll: '10000 人', tbSick: '患病', tbHealthy: '健康',
    tbTP: '阳性 · 真阳', tbFN: '阴性 · 漏检', tbFP: '阳性 · 假阳', tbTN: '阴性 · 真阴',
    tbPoolCap: '报阳性共 {pool} 人 → 真得病 {tp} / {pool} = {ppv}',
    s5hint: '为什么整百分点？患病率每步 1%，10000 人里的人数就全是整数——树上每个数字都能直接数，不用「期望人数」打折扣。把滑杆拖回 1%，就是第 0 步那棵树。',

    s6k: '第 6 步 · 终章',
    s6t: '先查底子，再看证据',
    s6e: '贝叶斯不是一条公式，是一种记账习惯：任何新证据，先问它落在多厚的底子上，再按似然比入账。它在真实世界里到处值班：',
    app1t: '垃圾邮件过滤',
    app1d: '每个词都是一条证据：「免费」「中奖」各自带着似然比，朴素贝叶斯把整封邮件的词连乘起来，跟「这封是垃圾邮件」的先验一比，得出结论。',
    app2t: '医学筛查',
    app2d: '就是本页的贯穿案例：罕见病的筛查阳性，大部分是误报。负责任的复查流程，本质是把第 3 步的证据链接着记下去。',
    app3t: 'A/B 测试与产品决策',
    app3d: '「这次指标涨了」是一条证据；它值多少分量，取决于你事先对「这个改动有用」的先验。先验越离谱，需要的数据越多——洗刷的代价写在第 5 步。',
    app4t: '机器学习：先验 = 正则化',
    app4d: '给参数一个先验分布，等价于给损失函数加一项惩罚：先验说「参数别太大」，数据说「但要拟合」——后验就是两边的和解，跟第 4 步同一笔账。',
    s6qT: '压轴防坑 · 检察官谬误',
    s6q: '法庭上，检察官说：「DNA 证据在一名无辜者身上出现的概率只有<strong>百万分之一</strong>，所以被告无辜的概率就是百万分之一。」——这句话错在哪？',
    s6qa: '检测本身不可靠，DNA 数据有问题',
    s6qb: '它把 P(证据 | 无辜) 偷换成了 P(无辜 | 证据)——两个方向的条件概率根本不是一回事',
    s6qc: '百万分之一太小了，工程上可以直接忽略',
    s6fbNone: '选一项，看看你的贝叶斯直觉这一页练出来没有。',
    s6fbRight: '<strong>答对了。</strong>P(证据 | 无辜) = 百万分之一，说的是「随便抓个无辜者，证据撞上的概率」；P(无辜 | 证据) 还要乘上先验、再除以证据出现的总概率——一座上千万人的城市里，单是「无辜但撞上证据」的人就可能有好几个。方向一反、底子缺席，这正是第 0 步那笔账在法庭上的翻版。',
    s6fbWrong: '不对。再想想第 0 步：检测再准，也不能直接把「P(阳性 | 没病)」读成「P(没病 | 阳性)」。错在<strong>把两个方向的条件概率偷换了</strong>：P(证据 | 无辜) 是百万分之一，不等于 P(无辜 | 证据)——后者还取决于底子，也就是人群里有多少人可能撞上这份证据。',
    s6fin: '<strong>收束。</strong>这一页只教了一个动作：<strong>先查底子，再看证据</strong>；证据再响，也先问底子有多厚。先验不是偏见——无视先验，才是最大的偏见。',
    s6linkIdx: '← 回知识索引，看概率线的下一站'
  },
  en: {
    docTitle: 'Bayes · Check the Base Rate First · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Bayes',
    tagline: 'A test says you have a disease only 1% of people get, and the test itself is pretty accurate — yet your actual chance of having it is only about 9%. Bayes\' theorem is not about how good the test is; it is about how thin the base rate underneath the evidence is. This page turns priors, likelihood ratios and posteriors into a ledger you update with your own hands: check the base rate first, then weigh the evidence.',
    nav0: '0 The Hook', nav1: '1 The Prior', nav2: '2 Evidence Multiplies', nav3: '3 Chaining Evidence',
    nav4: '4 Continuous · The Coin', nav5: '5 Washout + Frequencies', nav6: '6 Finale · Fallacy Guard',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Bayes — one interaction per step',
    reset: 'Reset', newSeed: 'New seed', dash: '—',

    s0k: 'Step 0 · The Hook',
    s0t: 'The test says positive — hold on, place a bet first',
    s0e: 'A disease with <strong>prevalence 1%</strong>: about 100 in 10,000 people truly have it. You take a test: it catches <strong>90%</strong> of true cases (sensitivity), but it also falsely flags <strong>9%</strong> of healthy people (false-positive rate). Your result comes back <strong>positive</strong>. So: what is the probability you actually have the disease? Place your bet, then we reveal it.',
    s0betQ: 'Place your bet: roughly what is the chance you truly have it?',
    bet90: '≈ 90%', bet50: '≈ 50%', bet9: '≈ 9%', bet1: '≈ 1%',
    s0fbNone: 'No bet yet — pick what your gut says, then reveal.',
    s0fbRight: 'You bet {pick} — <strong>and you are right</strong>. Most people bet 90% or even 50%: they stare at how accurate the test is and forget that only 100 of the 10,000 people are sick at all. Below, we lay out all 10,000 people and count.',
    s0fbWrong: 'You bet {pick} — the most common answer in the world, and it is wrong. The test is not the problem; the base is: there are so few sick people that the false alarms outnumber the true cases. Let us lay out all 10,000 people and count.',
    s0reveal: 'Reveal: lay out all 10,000 people ↓',
    s0again: 'Fold it back & re-bet',
    cAll: '10,000 people, one cell each',
    cSickCap: '100 orange cells = truly sick',
    cTPCap: 'cyan = true positives', cFPCap: 'orange = false positives', cFNCap: 'dark red = missed cases',
    s0ro: 'Out of 10,000 people: <span>100</span> are sick and <span>90</span> are caught; <span>9,900</span> are healthy and <span>891</span> are falsely flagged. Of the <span>981</span> who test positive, the truly sick are just 90 / 981 = <span>{ppv}</span>. The test did not lie to you — the base of sick people is so thin that false alarms outnumber them.',
    s0hint: 'This is no word game: mammograms, infectious-disease screening and airport security alerts all share this exact structure and this exact ledger. Remember the picture: <strong>most of the positive pile is false alarms</strong> — whenever the condition is rare enough. Over the next few steps we turn this count into a formula, and then into a habit.',

    s1k: 'Step 1 · The Prior Is the Starting Point',
    s1t: 'The same evidence, landing on different base rates',
    s1e: 'The evidence stays the same — one positive result. Only the base changes: drag the prior prevalence from 0.1% to 50% and watch the posterior move. At a 0.1% base the posterior is still under 1%; at 1% it is step 0\'s 9.17%; at 10% it climbs to 52.6%; at fifty-fifty, a positive is finally worth 90.9%. <strong>How persuasive evidence is is never a property of the evidence alone — it is the ratio between the evidence and the base.</strong>',
    s1priorLab: 'Prior prevalence (log scale)',
    s1ro: 'Prior <span>{prior}</span> + one positive (likelihood ratio ×10) → posterior <span>{post}</span> · the posterior is {mult}× the prior',
    cPrior: 'Prior', cPost: 'Posterior (after one positive)',
    cHair: 'too thin to see — and that is the point',
    s1hint: 'This is <strong>base-rate neglect</strong>: quoting "the test is 90% accurate" without the prevalence hands you a numerator and hides the denominator. People who bet wrong in step 0 mostly did not miscalculate — it never occurred to them to ask about the base.',

    s2k: 'Step 2 · Evidence Is One Multiplication',
    s2t: 'Put on odds glasses: posterior = prior × likelihood ratio',
    s2e: 'Probabilities are squeezed between 0 and 1, where multiplication has no room to breathe. Switch to <strong>odds</strong> (probability ÷ its complement): a 1% prior is odds of 1 : 99. Evidence strength is the <strong>likelihood ratio</strong>, LR = P(evidence | sick) / P(evidence | healthy): for this test a positive has LR+ = 0.90 / 0.09 = <strong>10</strong>, a negative LR− = 0.10 / 0.91 ≈ <strong>0.11</strong>. Posterior odds = prior odds × LR — one multiplication and you are done. On a log₁₀ odds axis, multiplication becomes a <strong>shift</strong>: the weight of the evidence is exactly how far it pushes you, right or left.',
    s2priorLab: 'Prior probability (log scale)',
    s2lrLab: 'Likelihood ratio LR (log scale)',
    s2lrPos: 'Preset: positive LR+ = 10',
    s2lrNeg: 'Preset: negative LR− ≈ 0.11',
    s2ro: 'Prior {p0} → odds <span>{o0}</span> (log₁₀ odds {l0}) · × LR {lr} → posterior odds <span>{o1}</span> (log₁₀ odds {l1}) → posterior probability <span>{p1}</span>',
    cAxisLab: 'log₁₀ odds axis (corresponding probabilities below)',
    cPriorPt: 'prior', cPostPt: 'posterior',
    s2hint: 'Log-odds has another name: the <strong>weight of evidence</strong>. LR = 10 weighs +1, LR = 100 weighs +2, LR = 0.1 weighs −1. For the first time, evidence can be weighed — and added up. Step 3 chains exactly this.',

    s3k: 'Step 3 · Chaining Evidence',
    s3t: "Yesterday's posterior is today's prior",
    s3e: 'Back to our running case (prior 1%, the same test). Add evidence one piece at a time: a positive multiplies the odds by 10, a negative by 0.11, and the posterior updates live. Try three positives in a row: 9.17% → 50.3% → 91.0% — a single piece of evidence is modest; <strong>the chain is where Bayes gets its muscle</strong>. Then mix in a negative and watch it drag the odds back.',
    addPos: '+ Positive (×10)', addNeg: '+ Negative (×0.11)',
    undo: 'Undo last', clear: 'Clear',
    chipPos: 'POS', chipNeg: 'NEG',
    s3ro0: 'No evidence yet. Posterior = prior = <span>1.00%</span>. Click "+ Positive" and start the ledger.',
    s3ro: 'Chain: odds {chain} → posterior odds <span>{odds}</span> → probability of being sick <span>{post}</span> ({n} pieces of evidence)',
    s3cap: 'The chain is full at {max} pieces — clear it and start a fresh ledger.',
    s3warn: '⚠ The fine print of this ledger: <strong>it assumes the pieces of evidence are conditionally independent</strong> — knowing one result does not change the error odds of the next. But repeat the same test and the errors tend to correlate (same sample batch, same operator, same body state): a second positive usually carries less new information than the first. <strong>Real updates are typically smaller than the chain suggests</strong>; the chain is the upper bound under independence.',
    cTrajLab: 'posterior after each piece of evidence', cStartPt: 'prior',
    s3hint: 'Note the asymmetry: a positive multiplies the odds by 10, a negative only divides them by about 9 (×0.11). This test argues harder when it says yes than when it says no — because its false-positive rate (9%) is slightly lower than its false-negative rate (10%). The strength of evidence lives entirely in the ratio of the two error rates.',

    s4k: 'Step 4 · The Continuous Version',
    s4t: 'A coin whose bias nobody knows',
    s4e: 'Now the continuous version: the coin\'s heads probability θ is unknown, so the prior is no longer a number but a whole <strong>distribution curve</strong>. Every flip tightens the curve by Bayes\' rule: prior Beta(α, β) + data (H heads, T tails) → posterior Beta(α+H, β+T) — a closed-form update, no simulation needed. A secret up front: this coin is actually biased, <strong>θ* = 0.65</strong> — so you can watch where the posterior is heading. Random flips come from a seeded generator (mulberry32); the seed is printed in the readout, and the same seed replays the same sequence. Manual tallies are counted separately from the random stream — changing the seed restarts only the random stream and never clears the manual tally.',
    priFlat: 'Flat Beta(1, 1) · no opinion',
    priWeak: 'Mild Beta(8, 8) · probably fair',
    priStrong: 'Strong Beta(40, 10) · sure it favors heads',
    flip1: 'Flip +1', flip10: 'Flip +10', flip100: 'Flip +100',
    manH: 'Tally a head', manT: 'Tally a tail',
    s4ro: 'Seed {seed} · random stream: {rh} heads / {rt} tails · manual tally: {mh} heads / {mt} tails · total n = {n} ({h} heads)<br>Posterior Beta(<span>{a}</span>, <span>{b}</span>) · mean <span>{mean}</span> · most likely θ <span>{mode}</span> · prior mean {pmean}',
    s4seedNote: 'New seed in place: the random stream restarts from scratch; your manual tally ({mh} heads / {mt} tails) is kept, not cleared.',
    cPriorPdf: 'prior', cPostPdf: 'posterior', cMean: 'posterior mean',
    cTrue: 'true θ* = 0.65', cRecent: 'recent random flips (cyan = heads, grey = tails)', cThetaLab: 'θ (probability of heads)',
    s4hint: 'This page reports the mean and the mode but no credible interval — an interval needs numerical integration of the posterior, a machine of its own; first get clear on how the curve tightens with data. The more flips, the narrower the curve: <strong>the width of the posterior is exactly how much you still do not know</strong>.',

    s5k: 'Step 5 · Prior Washout + Frequencies Revisited',
    s5t: 'With enough data, priors wash out',
    s5e: 'Two priors — flat Beta(1, 1) and the strong opinion Beta(40, 10) — are fed the <strong>same</strong> flip sequence (same seed, θ* = 0.65). Watch the two posterior curves and the gap between their means: at small n the opinion still rules; by a few hundred flips, the data has washed both curves together. <strong>Washout is real, but data is the price</strong> — the smaller the sample, the more the prior costs you.',
    w10: '+10 more', w100: '+100 more', w600: 'Run to 600',
    s5ro: 'Same sequence: seed {seed} · n = {n} · {h} heads · flat-prior posterior mean <span>{ma}</span> · strong-prior posterior mean <span>{mb}</span> · gap <span>{diff}</span>',
    s5noteSmall: 'n is still small: the strong prior\'s posterior is still being dragged by its prior, {diff} away from the flat prior\'s — this is the half of the truth where priors dominate small samples.',
    s5noteBig: 'n is large now: the two prior means differ by only {diff} and the curves nearly coincide — the data has washed the priors out. This half is true too.',
    cFlatPost: 'posterior from flat prior', cStrongPost: 'posterior from strong prior',
    s5treeT: 'Back to plain language: the frequency tree',
    s5treeE: 'The same ledger in a different dialect: no probabilities, just head counts. Drag the prevalence slider and the tree\'s counts and the "truly sick given positive" figure recompute together — the PPV from the formula and the ratio counted on the tree agree exactly. <strong>Natural frequencies are Bayes in plain clothes</strong>: when a doctor explains a screening result, this tree — not percentages — is the honest way to do it.',
    s5prevLab: 'Prevalence (whole-percent steps)',
    s5treRo: 'Per 10,000 people: sick <span>{sick}</span> ({tp} true positives · {fn} missed) · healthy <span>{healthy}</span> ({fp} false positives · {tn} true negatives) · {pool} test positive → truly sick <span>{ppv}</span> · formula PPV agrees: {ppvf} ✓',
    tbAll: '10,000 people', tbSick: 'sick', tbHealthy: 'healthy',
    tbTP: 'positive · true', tbFN: 'negative · missed', tbFP: 'positive · false alarm', tbTN: 'negative · true',
    tbPoolCap: '{pool} test positive → truly sick {tp} / {pool} = {ppv}',
    s5hint: 'Why whole percents? At 1% steps, every head count out of 10,000 stays an integer — every number on the tree can be counted directly, with no "expected people" fudge. Drag the slider back to 1% and you are looking at step 0\'s tree again.',

    s6k: 'Step 6 · Finale',
    s6t: 'Check the base rate first, then weigh the evidence',
    s6e: 'Bayes is not a formula; it is a bookkeeping habit: for any new evidence, first ask how thick the base underneath it is, then enter it at its likelihood ratio. It is on duty everywhere in the real world:',
    app1t: 'Spam filtering',
    app1d: 'Every word is a piece of evidence — "free" and "winner" each carry a likelihood ratio — and naive Bayes multiplies the whole email\'s words together and weighs the result against the prior that a message is spam.',
    app2t: 'Medical screening',
    app2d: "This page's running case: for rare diseases, most screening positives are false alarms. A responsible follow-up protocol is just step 3's evidence chain, continued.",
    app3t: 'A/B tests & product decisions',
    app3d: '"The metric went up" is one piece of evidence; how much it counts depends on your prior that the change actually works. The wilder the prior, the more data you owe — step 5 priced the washout.',
    app4t: 'Machine learning: priors = regularization',
    app4d: 'Putting a prior on parameters is the same as adding a penalty term to the loss: the prior says "stay small", the data says "but fit" — the posterior is the truce, the same ledger as step 4.',
    s6qT: "Final guard · the prosecutor's fallacy",
    s6q: 'In court, the prosecutor says: "The chance of this DNA evidence appearing on an innocent person is <strong>one in a million</strong>, so the probability the defendant is innocent is one in a million." — Where exactly does that sentence go wrong?',
    s6qa: 'The test itself is unreliable; the DNA data is flawed',
    s6qb: 'It swaps P(evidence | innocent) for P(innocent | evidence) — conditional probabilities in opposite directions are entirely different things',
    s6qc: 'One in a million is so small it can simply be ignored',
    s6fbNone: 'Pick one — see whether this page has trained your Bayesian instincts.',
    s6fbRight: '<strong>Correct.</strong> P(evidence | innocent) = one in a million talks about a random innocent person matching the evidence; P(innocent | evidence) still has to be multiplied by the prior and divided by how often the evidence shows up at all — in a city of millions, several innocent people may match. Swap the direction and drop the base rate, and you get step 0\'s ledger wearing a wig in court.',
    s6fbWrong: 'Not quite. Think back to step 0: however accurate a test is, you cannot read P(positive | healthy) as P(healthy | positive). <strong>The error is swapping the two directions of a conditional probability</strong>: P(evidence | innocent) being one in a million does not make P(innocent | evidence) one in a million — the latter still depends on the base: how many people could produce this evidence.',
    s6fin: '<strong>To close.</strong> This page taught a single move: <strong>check the base rate first, then weigh the evidence</strong> — however loud the evidence shouts, ask how thick the base beneath it is. A prior is not a bias; ignoring the prior is the biggest bias of all.',
    s6linkIdx: '← Back to the index, for the next stop on the probability line'
  }
};

/* ---------- 语言状态 ---------- */
let _lang = null;
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v; // 只认 zh/en 枚举，非法值（如 fr）回退默认推断
  } catch (e) { /* 忽略 */ }
  return null;
}
function saveLang(v) {
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
