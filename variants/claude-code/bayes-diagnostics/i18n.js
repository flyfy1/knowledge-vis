'use strict';
// Bayes diagnostics lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '贝叶斯诊断 · 阳性结果到底说明什么',
    back: '← 知识索引',
    compare: '对照另一版本：贝叶斯诊断 · 阳性结果说明什么？ →',
    navLabel: '贝叶斯诊断步骤导航',
    tagline: '一张检测报告写着「阳性」。只凭这两个字，你真正患病的概率有多大？答案取决于三个数：这种病有多常见、检测对病人有多灵敏、对健康人会误报多少。七步里你会用 1000 个圆点把它们亲手拼起来，看清为什么「检测对病人九成报阳性」不等于「阳性的人九成有病」。',
    nav0: '0 先猜', nav1: '1 先验', nav2: '2 切成四格', nav3: '3 换分母', nav4: '4 方向别反', nav5: '5 再测一次', nav6: '6 收束',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《贝叶斯诊断 · 阳性结果说明什么？》的平行版本。',

    lgTP: '病人 · 阳性', lgFN: '病人 · 阴性（漏诊）', lgFP: '健康 · 阳性（误报）', lgTN: '健康 · 阴性', lgUnk: '结果未揭晓',
    lgIll: '病人', lgHealthy: '健康人',

    s0k: '第 0 步 · 先凭直觉',
    s0t: '报告写着阳性，你真的患病的概率有多大？',
    s0e: '这一步要回答：检测结果是阳性，这个人真正患病的概率是多少？设想一种病，人群里每 100 人约有 2 人患病。有一种检测：对<strong>病人</strong>，90% 的情况下报阳性；对<strong>健康人</strong>，95% 的情况下报阴性，也就是说有 5% 的健康人会被误报成阳性。小明做了这项检测，结果是阳性。先凭直觉在滑杆上猜一个数，再按「揭晓」。',
    guess: '你猜小明患病的概率', reveal: '揭晓：让 1000 人都去检测', hide: '藏起答案，重新猜',
    c0aria: '1000 个圆点代表 1000 个和小明情况相同的受检者',
    c0titleBefore: '1000 个和小明一样去检测的人（结果未揭晓）',
    c0titleAfter: '颜色 = 真实状况，实心 = 阳性',
    s0readoutBefore: '你的猜测：{g}。按「揭晓」，看 1000 个人里阳性的都是谁。',
    s0readout: '你猜 {g}。1000 个这样的人里：约 {ill} 人患病，其中 {tp} 人阳性；{healthy} 个健康人里有 {fp} 人被误报成阳性。阳性一共 {pos} 人，真病人只占 {tp} ÷ {pos} ≈ {ppv}。{verdict}',
    verdictHigh: '你猜高了。大多数人第一次都会猜得很高，下面几步拆开看原因。',
    verdictClose: '很接近！下面几步把这个数是怎么来的拆开看。',
    verdictLow: '你猜低了。阳性确实把概率从 2% 抬高了十几倍，下面几步看抬了多少、为什么。',
    s0hint: '观察顺序：揭晓后先找实心的点，它们是全部阳性的人；再数其中粉色的（真病人）和青色的（被误报的健康人）各有多少。实心青点比实心粉点多得多，这就是答案偏低的原因。',

    s1k: '第 1 步 · 检测之前',
    s1t: '还没看结果时，该给「患病」多大的概率？',
    s1e: '这一步要回答：还没有任何检测结果时，「随便一个来检测的人患病」的概率是多少？这个数叫<strong>先验概率</strong>（「先」指看到检测结果之前），在这里就等于<strong>患病率</strong>：受检人群中病人所占的比例，记作 P(病)。图中 1000 个圆点就是 1000 个人，粉色是病人、青色是健康人。页面上的人数都是<strong>期望人数</strong>：按比例算出的平均人数，可能带小数；圆点按四舍五入画成整人。真去抽 1000 个人，人数会在期望值附近随机起伏（<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ 频率与概率页第 2 步：样本越多，比例越稳</a>）。',
    c1aria: '1000 人按真实状况分成病人与健康人',
    c1title: '1000 人：粉 = 病人，青 = 健康人',
    prevLabel: '患病率 P(病)',
    s1readout: '患病率 P(病) = {p}：1000 人中约 {ill} 人患病、{healthy} 人健康，病人与健康人之比约 1 : {ratio}。',
    s1hint: '观察顺序：把患病率从 2% 慢慢拖到 30%，看粉色块从一窄条长成一大片；再拖回 0.5%，粉色只剩 5 个点。顺便记住此时健康人有多少：后面会看到，误报的人数是跟着健康人的数量走的。后面几步都沿用你在这里设定的患病率。',

    s2k: '第 2 步 · 检测做了什么',
    s2t: '同一次检测，在病人和健康人身上各产生多少阳性？',
    s2e: '这一步要回答：检测把病人和健康人各分成了哪两部分、各有多少？描述检测好坏要用两个比例，它们的<strong>分母不同</strong>。<strong>灵敏度</strong> = 病人中被报阳性的比例，写作 P(阳性 | 病)：竖线「|」读作「在……之中」，竖线右边那群人就是分母。<strong>特异度</strong> = 健康人中被报阴性的比例，写作 P(阴性 | 健康)。1 − 特异度就是<strong>误报率</strong> P(阳性 | 健康)：健康人被错报成阳性的比例。于是 1000 人被切成四格：病人·阳性（真阳性）、病人·阴性（漏诊）、健康·阳性（误报）、健康·阴性（真阴性）。图中颜色表示真实状况（粉 = 病人，青 = 健康），实心表示阳性，空心圈表示阴性。',
    c2aria: '1000 人按真实状况和检测结果分成四组',
    c2title: '粉 = 病人，青 = 健康；实心 = 阳性',
    sensLabel: '灵敏度 P(阳性 | 病)', specLabel: '特异度 P(阴性 | 健康)',
    thStatus: '真实状况 \\ 检测结果', thPos: '阳性', thNeg: '阴性', thTotal: '合计', rowIll: '病人', rowHealthy: '健康人', rowTotal: '合计',
    s2readout: '患病率 {p}（第 1 步设定）· 灵敏度 {se} · 特异度 {sp}：{ill} 个病人 → 阳性 {tp}、漏诊 {fn}；{healthy} 个健康人 → 误报 {fp}、阴性 {tn}。误报率 = 1 − 特异度 = {fpr}。',
    s2hint: '观察顺序：先保持灵敏度不动，只把特异度从 95% 拖到 99%，看实心青点（误报）从约 49 个缩到约 10 个；再把特异度放回 95%，只拖灵敏度：粉色里空心圈（漏诊）跟着变多变少，青色部分一个点都不动。灵敏度只管病人那一行，特异度只管健康人那一行。',

    s3k: '第 3 步 · 拿到结果之后',
    s3t: '拿到阳性报告，该在哪一群人里数病人？',
    s3e: '这一步要回答：已知结果是阳性，这个人患病的概率 P(病 | 阳性) 是多少？关键是<strong>换分母</strong>：拿到阳性报告，说明你落在「所有阳性的人」这一群里，阴性的人已经与你无关。所以 P(病 | 阳性) = 真阳性 ÷ 全部阳性 = 真阳性 ÷ (真阳性 + 误报)。这个数叫<strong>阳性预测值</strong>，也就是看到阳性之后的<strong>后验概率</strong>（「后」指看到结果之后）。拿到阴性时同理，分母换成全部阴性：P(病 | 阴性) = 漏诊 ÷ (漏诊 + 真阴性)。「按结果重排」图把 1000 人按检测结果重新排列，选中的一组用橙框框出，其余变暗；「横轴：患病率」那张曲线图画出这两个后验概率怎样随患病率变化（灵敏度、特异度用第 2 步的值）。',
    seePos: '看阳性的人', seeNeg: '看阴性的人',
    c3aria: '1000 人按检测结果重排，选中一组被框出',
    c3titlePos: '按结果重排：橙框里是全部阳性的人',
    c3titleNeg: '按结果重排：橙框里是全部阴性的人',
    c3baria: '后验概率随患病率变化的曲线',
    c3btitle: '横轴：患病率 · 纵轴：结果出来后患病的概率',
    lgCurvePos: 'P(病 | 阳性)', lgCurveNeg: 'P(病 | 阴性)', lgTrail: '你拖过的患病率', clearTrail: '清除轨迹',
    s3readoutPos: '看阳性：橙框里共 {pos} 人，其中真病人 {tp}、误报 {fp}。P(病 | 阳性) = {tp} ÷ {pos} ≈ {ppv}，是先验 {p} 的 {times} 倍。{dom}',
    s3domFP: '误报的人比真病人还多：健康人基数（{healthy}）远大于病人（{ill}），{fpr} 这样的小误报率乘上大基数，人数就超过了病人。',
    s3domTP: '真病人已经多于误报的人：病人基数够大了。',
    s3readoutNeg: '看阴性：橙框里共 {neg} 人，其中漏诊的病人 {fn}。P(病 | 阴性) = {fn} ÷ {neg} ≈ {inp}，低于先验 {p}；反过来说，阴性的人里健康的占 {npv}。',
    s3hint: '观察顺序：先选「看阳性的人」，把患病率从 0.5% 拖到 30%，盯住「按结果重排」图橙框里粉点和青点的比例；曲线图上的白点会沿实线留下轨迹：患病率越低，阳性里误报的占比越大。再选「看阴性的人」重复：P(病 | 阴性) 一直很小，但患病率高时也会升到几个百分点，阴性并不等于绝对没病。想改灵敏度、特异度回第 2 步；改了之后两条曲线换形，旧轨迹自动清除。',

    s4k: '第 4 步 · 两句话别说反',
    s4t: '「病人九成测出阳性」和「阳性的人九成有病」是一回事吗？',
    s4e: '这一步要回答：「这种检测的灵敏度是 90%」能不能说成「阳性的人有 90% 患病」？不能。两句话数的是同一格「病人·阳性」，但<strong>分母不同</strong>：灵敏度 P(阳性 | 病) 在<strong>病人这一行</strong>里数阳性（下表粉色行）；P(病 | 阳性) 在<strong>阳性这一列</strong>里数病人（下表橙框列）。把两者混为一谈叫<strong>条件概率倒置</strong>，在体检报告、新闻和法庭论证里都很常见。',
    c4aria: '两根比例条：病人行中阳性的比例，阳性列中病人的比例',
    c4rowA: '病人这一行（{n} 人）里，阳性占 {v}',
    c4rowB: '阳性这一列（{n} 人）里，病人占 {v}',
    lgRow: '病人这一行：P(阳性 | 病)', lgCol: '阳性这一列：P(病 | 阳性)',
    s4readout: '患病率 {p}：病人行 {ill} 人，其中阳性 {tp}，P(阳性 | 病) = {se}，不随患病率变；阳性列 {pos} 人，其中病人 {tp}，P(病 | 阳性) = {ppv}，随患病率变。',
    s4hint: '观察顺序：只拖患病率，看「病人这一行」那根条（阳性的比例）一动不动，「阳性这一列」那根条（病人的比例）大幅升降。两个数共用同一个分子，只有当两个分母恰好相等（病人数 = 阳性人数）时它们才相等。',
    quizPrompt: '想一想：某检测灵敏度 99%、特异度 99%，用来在患病率 0.1% 的人群里筛查。一个人阳性，他患病的概率大约是多少？',
    quizA: '约 99%：检测的准确率就是 99%', quizB: '约 9%：阳性的人里绝大多数是误报', quizC: '约 0.1%：阳性结果没有提供任何信息',
    check: '核对',
    correct: '对。1000 人里约 1 个病人（{tp} 人阳性），999 个健康人里约 {fp} 人被误报。P(病 | 阳性) = {tp} ÷ {pos} ≈ {ppv}，比先验 0.1% 高了约 {times} 倍：阳性是有力的证据，只是起点太低。',
    wrong: '再看分母：阳性的人里，有多少来自病人那一行、多少来自健康人那一行？1000 人里只有约 1 个病人，却有 999 个健康人可能被误报。',

    s5k: '第 5 步 · 再测一次',
    s5t: '第一次阳性后再测一次，又是阳性，概率变成多少？',
    s5e: '这一步要回答：第一次阳性之后再做一次检测，结果仍是阳性，患病的概率会变成多少？算法和第 3 步完全一样，只是人群换成了「第一次阳性的那些人」：<strong>上一次的后验，成了这一次的先验</strong>。这里假设各次检测在真实状况已定时<strong>相互独立</strong>：病人每次都以灵敏度的概率报阳性，健康人每次都以误报率报阳性，互不影响。于是每多一次阳性，病人数乘以灵敏度，健康人数乘以误报率，健康人缩得快得多。用<strong>赔率</strong>（病人数 : 健康人数）看最清楚：每次阳性都把赔率乘以同一个数，叫<strong>阳性似然比</strong> = 灵敏度 ÷ 误报率，意思是「病人报阳性的可能性是健康人的几倍」（<a class="xlink" href="../../../probability/inference/bayes-updating/#step2">→ 贝叶斯更新页第 2 步：证据为什么是一次乘法</a>）。',
    again: '再测一次：又是阳性', restart: '从头再来',
    c5aria: '柱状图：连续若干次阳性后，剩下的人里病人所占的比例',
    c5title: '连续 k 次阳性后剩下的人：病人占多少',
    c5round: '{k} 次阳性', c5count: '剩 {n} 人',
    lgIllPos: '剩下的病人', lgHealthyPos: '剩下的健康人',
    s5readout0: '还没检测：1000 人里病人占先验 {p}（{ill} : {healthy}）。按「再测一次：又是阳性」开始。',
    s5readout: '已连续 {k} 次阳性：剩下约 {ill} 个病人、{healthy} 个健康人，P(病 | {k} 次阳性) = {post}。赔率 {o0} × {lr}{kk} = {ok}（阳性似然比 = {se} ÷ {fpr} = {lr}）。{note}',
    s5max: '已演示到第 4 次。',
    s5hint: '观察顺序：连按三次「再测一次：又是阳性」，看每根新柱子里粉色占了多少（默认设定下依次约为 27%、87%、99%）。然后回第 2 步把特异度降到 80%，再回来按「从头再来」重做：误报率变成 20%，似然比只剩 4.5，每次阳性推高得慢得多。注意独立性只是假设：如果两次用同一种检测，导致误报的原因（例如和别的抗体发生交叉反应）往往会重复出现，第二次阳性提供的证据就比这里算的弱。',

    s6k: '第 6 步 · 收束',
    s6t: '一张阳性报告的分量，由什么决定？',
    s6fin: '回顾：<strong>先验</strong>（患病率）决定病人那一行和健康人那一行各有多少人；<strong>灵敏度</strong>和<strong>特异度</strong>把这两行各切成阳性、阴性两份；拿到结果后，只留下与结果相符的那一列，在这一列里数病人，就得到<strong>后验概率</strong>。所以一张阳性报告的分量，既取决于检测本身，也取决于你从多大的先验出发。罕见病筛查里，即使检测很好，阳性里也可能误报占多数；这时通常的做法是用另一种独立的检测去复查，而不是直接下结论。',
    formula: 'P(病 | 阳性) = P(阳性 | 病)·P(病) ÷ [P(阳性 | 病)·P(病) + P(阳性 | 健康)·P(健康)]\n后验赔率 = 先验赔率 × 灵敏度 ÷ (1 − 特异度)',
    boundary: '适用范围：本页的人数是期望人数，真实样本会有随机起伏；患病率必须是「和你一样来检测的那群人」的患病率，有症状的人、高危人群的先验比全人群高得多，同一张阳性报告的含义也随之改变；连续检测的计算假设各次结果在真实状况已定时相互独立。本页是教学模型，不是临床计算器，也不构成医疗建议。',
    linksTitle: '接着去看',
    lk1: '贝叶斯更新 · 第 2 步：证据为什么是一次乘法 →',
    lk2: '贝叶斯更新 · 第 3 步：一条条证据连乘起来 →',
    lk3: '假设检验 · 第 3 步：漏判与功效，另一种「两类错误」 →',
    lk4: '频率与概率 · 第 2 步：为什么比例要靠大样本才稳 →'
  },
  en: {
    pageTitle: 'Bayes Diagnostics · What a Positive Result Really Tells You',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Bayes Diagnostics · What Does a Positive Mean? →',
    navLabel: 'Bayes diagnostics steps',
    tagline: 'A lab report says "positive". From that one word, how likely is it that you are actually ill? The answer depends on three numbers: how common the disease is, how reliably the test flags people who have it, and how often it falsely flags people who don\'t. Over seven steps you will assemble them yourself from 1,000 dots and see why "the test catches 90% of patients" is not the same as "90% of positives are patients".',
    nav0: '0 Guess', nav1: '1 Prior', nav2: '2 Four groups', nav3: '3 New denominator', nav4: '4 Direction', nav5: '5 Test again', nav6: '6 Wrap-up',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Bayes Diagnostics · What Does a Positive Mean?".',

    lgTP: 'Ill · positive', lgFN: 'Ill · negative (missed)', lgFP: 'Healthy · positive (false alarm)', lgTN: 'Healthy · negative', lgUnk: 'Result not shown yet',
    lgIll: 'Ill', lgHealthy: 'Healthy',

    s0k: 'Step 0 · Trust your gut',
    s0t: 'The report says positive. How likely is it that you are ill?',
    s0e: 'This step asks: given a positive result, what is the chance this person really has the disease? Picture a disease that about 2 in every 100 people have. A test for it comes back positive for 90% of <strong>people who have it</strong>, and negative for 95% of <strong>people who don\'t</strong>, so 5% of healthy people get a false positive. Sam takes the test and it comes back positive. Make a gut guess with the slider, then press "Reveal".',
    guess: 'Your guess: chance Sam is ill', reveal: 'Reveal: test 1,000 people like Sam', hide: 'Hide the answer and guess again',
    c0aria: '1,000 dots standing for 1,000 people tested in the same situation as Sam',
    c0titleBefore: '1,000 people tested like Sam (results hidden)',
    c0titleAfter: 'Colour = true status, filled = positive',
    s0readoutBefore: 'Your guess: {g}. Press "Reveal" to see who the positives are among 1,000 people.',
    s0readout: 'You guessed {g}. Among 1,000 such people, about {ill} are ill and {tp} of them test positive; of the {healthy} healthy people, {fp} get a false positive. That is {pos} positives in all, and only {tp} ÷ {pos} ≈ {ppv} of them are ill. {verdict}',
    verdictHigh: 'Your guess was high. Most people guess high the first time; the next steps take the reason apart.',
    verdictClose: 'Very close! The next steps show where this number comes from.',
    verdictLow: 'Your guess was low. A positive does lift the chance more than tenfold from 2%; the next steps show by how much and why.',
    s0hint: 'What to look for: after the reveal, find the filled dots first; they are everyone who tested positive. Then count how many of those are pink (really ill) and how many are cyan (healthy but falsely flagged). There are far more filled cyan dots than filled pink ones, and that is why the answer is low.',

    s1k: 'Step 1 · Before the test',
    s1t: 'Before seeing any result, how likely is "ill"?',
    s1e: 'This step asks: with no test result yet, what is the chance that a person picked at random from those being tested is ill? This number is the <strong>prior probability</strong> ("prior" as in before the result), and here it equals the <strong>prevalence</strong>: the share of the tested group that has the disease, written P(ill). The 1,000 dots in the grid are 1,000 people, pink for ill and cyan for healthy. Every head count on this page is an <strong>expected count</strong>: the average number you get from the proportions, which may be fractional; the dots round it to whole people. Actually sampling 1,000 people would give counts that scatter around these values (<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ Probability & Frequency, step 2: why proportions settle down with more samples</a>).',
    c1aria: '1,000 people split by true status into ill and healthy',
    c1title: '1,000 people: pink = ill, cyan = healthy',
    prevLabel: 'Prevalence P(ill)',
    s1readout: 'Prevalence P(ill) = {p}: of 1,000 people, about {ill} are ill and {healthy} are healthy, roughly 1 ill person for every {ratio} healthy ones.',
    s1hint: 'What to try: drag the prevalence slowly from 2% to 30% and watch the pink block grow from a sliver into a large patch; drag it back to 0.5% and only 5 pink dots remain. Note how many healthy people there are: you will see that the number of false alarms follows the number of healthy people. The later steps all use the prevalence you set here.',

    s2k: 'Step 2 · What the test does',
    s2t: 'How many positives does one test produce among the ill, and among the healthy?',
    s2e: 'This step asks: into which two parts does the test split the ill and the healthy, and how many land in each? A test is described by two proportions with <strong>different denominators</strong>. <strong>Sensitivity</strong> is the share of ill people who test positive, written P(positive | ill); the bar "|" reads "among", and whatever sits to its right is the group you divide by. <strong>Specificity</strong> is the share of healthy people who test negative, P(negative | healthy). One minus specificity is the <strong>false-positive rate</strong> P(positive | healthy): the share of healthy people wrongly flagged. Together they cut the 1,000 people into four groups: ill and positive (true positives), ill and negative (missed cases), healthy and positive (false alarms), healthy and negative (true negatives). In the picture, colour shows true status (pink = ill, cyan = healthy), a filled dot means positive and a ring means negative.',
    c2aria: '1,000 people split by true status and test result into four groups',
    c2title: 'Pink ill, cyan healthy; filled = positive',
    sensLabel: 'Sensitivity P(positive | ill)', specLabel: 'Specificity P(negative | healthy)',
    thStatus: 'True status \\ result', thPos: 'Positive', thNeg: 'Negative', thTotal: 'Total', rowIll: 'Ill', rowHealthy: 'Healthy', rowTotal: 'Total',
    s2readout: 'Prevalence {p} (set in step 1) · sensitivity {se} · specificity {sp}: {ill} ill people → {tp} positive, {fn} missed; {healthy} healthy people → {fp} false alarms, {tn} negative. False-positive rate = 1 − specificity = {fpr}.',
    s2hint: 'What to try: hold sensitivity still and drag only specificity from 95% to 99%; the filled cyan dots (false alarms) shrink from about 49 to about 10. Put specificity back at 95% and drag only sensitivity: the rings inside the pink group (missed cases) grow and shrink, while not a single cyan dot changes. Sensitivity only touches the ill row; specificity only touches the healthy row.',

    s3k: 'Step 3 · After the result',
    s3t: 'With a positive report in hand, which group do you count the ill in?',
    s3e: 'This step asks: given a positive result, what is P(ill | positive)? The key is a <strong>new denominator</strong>. A positive report tells you that you belong to the group of everyone who tested positive; the negatives no longer concern you. So P(ill | positive) = true positives ÷ all positives = true positives ÷ (true positives + false alarms). This number is the <strong>positive predictive value</strong>: the <strong>posterior probability</strong> after seeing a positive ("posterior" as in after the result). A negative works the same way with all negatives as the denominator: P(ill | negative) = missed ÷ (missed + true negatives). The "Grouped by result" picture regroups the 1,000 people by test result, boxes the chosen group in orange and dims the rest; the "x: prevalence" curve chart shows how both posteriors change with prevalence (using the sensitivity and specificity from step 2).',
    seePos: 'Look at the positives', seeNeg: 'Look at the negatives',
    c3aria: '1,000 people regrouped by test result, with the chosen group boxed',
    c3titlePos: 'Grouped by result: orange box = all positives',
    c3titleNeg: 'Grouped by result: orange box = all negatives',
    c3baria: 'Curves of the posterior probabilities against prevalence',
    c3btitle: 'x: prevalence · y: chance ill after the result',
    lgCurvePos: 'P(ill | positive)', lgCurveNeg: 'P(ill | negative)', lgTrail: 'prevalences you visited', clearTrail: 'Clear the trail',
    s3readoutPos: 'Positives: the orange box holds {pos} people, {tp} truly ill and {fp} false alarms. P(ill | positive) = {tp} ÷ {pos} ≈ {ppv}, which is {times} times the prior of {p}. {dom}',
    s3domFP: 'False alarms outnumber the ill: the healthy group ({healthy}) is far bigger than the ill group ({ill}), so even a false-positive rate as small as {fpr} applied to it yields more people than there are patients.',
    s3domTP: 'The truly ill now outnumber the false alarms: the ill group is big enough.',
    s3readoutNeg: 'Negatives: the orange box holds {neg} people, {fn} of them ill but missed. P(ill | negative) = {fn} ÷ {neg} ≈ {inp}, below the prior of {p}; put the other way, {npv} of negatives are healthy.',
    s3hint: 'What to try: choose "Look at the positives" and drag prevalence from 0.5% to 30% while watching the mix of pink and cyan inside the orange box; the white dot on the curve chart leaves a trail along the solid curve. The rarer the disease, the larger the share of false alarms among positives. Then choose "Look at the negatives" and repeat: P(ill | negative) stays small, but at high prevalence it climbs to a few percent, so a negative is not a guarantee. To change sensitivity or specificity, go back to step 2; the curves then change shape and the old trail is cleared.',

    s4k: 'Step 4 · Keep the direction straight',
    s4t: '"90% of patients test positive" versus "90% of positives are patients": same thing?',
    s4e: 'This step asks: can "the test has 90% sensitivity" be restated as "90% of people who test positive are ill"? No. Both sentences count the same cell, ill and positive, but over <strong>different denominators</strong>. Sensitivity P(positive | ill) counts positives within the <strong>ill row</strong> (the pink row in the table); P(ill | positive) counts ill people within the <strong>positive column</strong> (the orange-boxed column). Treating them as the same is called <strong>confusing the inverse</strong>, and it turns up in check-up reports, news stories and courtroom arguments alike.',
    c4aria: 'Two proportion bars: the positive share of the ill row and the ill share of the positive column',
    c4rowA: 'Ill row ({n} people): {v} test positive',
    c4rowB: 'Positive column ({n} people): {v} are ill',
    lgRow: 'Ill row: P(positive | ill)', lgCol: 'Positive column: P(ill | positive)',
    s4readout: 'Prevalence {p}: the ill row has {ill} people, {tp} of them positive, so P(positive | ill) = {se}, unaffected by prevalence; the positive column has {pos} people, {tp} of them ill, so P(ill | positive) = {ppv}, which moves with prevalence.',
    s4hint: 'What to try: drag only the prevalence. The "Ill row" bar (its positive share) does not budge, while the "Positive column" bar (its ill share) swings widely. The two share a numerator, so they are equal only when the two denominators happen to match (number ill = number positive).',
    quizPrompt: 'Think it through: a test with 99% sensitivity and 99% specificity is used to screen a group where 0.1% are ill. Someone tests positive. Roughly how likely is it that they are ill?',
    quizA: 'About 99%: the test is 99% accurate', quizB: 'About 9%: most positives are false alarms', quizC: 'About 0.1%: a positive tells you nothing',
    check: 'Check',
    correct: 'Right. Of 1,000 people about 1 is ill ({tp} positive), while about {fp} of the 999 healthy people get a false positive. P(ill | positive) = {tp} ÷ {pos} ≈ {ppv}, about {times} times the 0.1% prior: the positive is strong evidence, but the starting point is very low.',
    wrong: 'Look at the denominator again: of all the positives, how many come from the ill row and how many from the healthy row? Out of 1,000 people only about 1 is ill, but 999 healthy people can be falsely flagged.',

    s5k: 'Step 5 · Test again',
    s5t: 'After one positive, a second test is also positive. What now?',
    s5e: 'This step asks: after a first positive, a second test also comes back positive; what is the chance of illness now? The calculation is exactly the one from step 3, except that the group is now "the people who tested positive the first time": <strong>yesterday\'s posterior becomes today\'s prior</strong>. We assume the tests are <strong>independent</strong> once the true status is fixed: an ill person tests positive with probability equal to the sensitivity every time, a healthy person with probability equal to the false-positive rate every time, and one result does not influence the next. Each extra positive therefore multiplies the ill count by the sensitivity and the healthy count by the false-positive rate, so the healthy group shrinks much faster. <strong>Odds</strong> (ill count : healthy count) make this clearest: every positive multiplies the odds by the same number, the <strong>positive likelihood ratio</strong> = sensitivity ÷ false-positive rate, meaning "how many times likelier a positive is for an ill person than for a healthy one" (<a class="xlink" href="../../../probability/inference/bayes-updating/#step2">→ Bayesian Updating, step 2: why evidence acts as a multiplication</a>).',
    again: 'Test again: positive again', restart: 'Start over',
    c5aria: 'Bar chart: the share of ill people among those left after several positives in a row',
    c5title: 'After k positives in a row: share still ill',
    c5round: '{k} pos.', c5count: '{n} left',
    lgIllPos: 'ill people still in the group', lgHealthyPos: 'healthy people still in the group',
    s5readout0: 'No test yet: the ill make up the prior {p} of 1,000 people ({ill} : {healthy}). Press "Test again: positive again" to start.',
    s5readout: 'After {k} positives in a row: about {ill} ill and {healthy} healthy people remain, so P(ill | {k} positives) = {post}. Odds {o0} × {lr}{kk} = {ok} (positive likelihood ratio = {se} ÷ {fpr} = {lr}). {note}',
    s5max: 'This demo stops at the 4th test.',
    s5hint: 'What to try: press "Test again: positive again" three times and watch how much of each new bar is pink (with the default settings, about 27%, 87% and 99%). Then go back to step 2, lower specificity to 80%, come back and press "Start over": the false-positive rate is now 20%, the likelihood ratio drops to 4.5, and each positive pushes the chance up far more slowly. Independence is only an assumption: if both rounds use the same kind of test, whatever caused a false alarm (say, cross-reaction with another antibody) tends to repeat, and the second positive is weaker evidence than computed here.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What decides how much a positive report is worth?',
    s6fin: 'Recap: the <strong>prior</strong> (prevalence) fixes how many people sit in the ill row and in the healthy row; <strong>sensitivity</strong> and <strong>specificity</strong> split each row into positives and negatives; once the result is in, keep only the matching column and count the ill within it, and you have the <strong>posterior probability</strong>. So what a positive report is worth depends both on the test and on the prior you start from. In screening for a rare disease, even a good test can produce more false alarms than true cases among its positives; the usual response is to confirm with a different, independent test rather than to draw conclusions straight away.',
    formula: 'P(ill | +) = P(+ | ill)·P(ill) ÷ [P(+ | ill)·P(ill) + P(+ | healthy)·P(healthy)]\nposterior odds = prior odds × sensitivity ÷ (1 − specificity)',
    boundary: 'Scope: head counts on this page are expected counts, and real samples scatter around them. The prevalence must be the prevalence among people tested in your situation: people with symptoms or in a high-risk group start from a much higher prior, which changes what the same positive report means. The repeat-test calculation assumes results are independent once the true status is fixed. This is a teaching model, not a clinical calculator, and it is not medical advice.',
    linksTitle: 'Where to go next',
    lk1: 'Bayesian Updating · step 2: why evidence acts as a multiplication →',
    lk2: 'Bayesian Updating · step 3: chaining one piece of evidence after another →',
    lk3: 'Hypothesis Testing · step 3: misses and power, another pair of error types →',
    lk4: 'Probability & Frequency · step 2: why proportions need large samples to settle →'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshBayes === 'function') window.refreshBayes();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BAYES_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
