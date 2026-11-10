'use strict';
// Public health (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en; every number written here is pinned by tests/core.cjs.

const STRINGS = {
  zh: {
    pageTitle: '流行病的数学 · 从一个病例到一整条曲线',
    back: '← 知识索引',
    compare: '对照另一版本：公共卫生 · 从曲线到干预 →',
    navLabel: '流行病学步骤导航',
    tagline: '一种传染病在一座城市里出现了第一个病例。它会扩散多快？什么时候到顶？最后有多少人会被感染？减少接触、接种疫苗、做检测，各自改变了什么？七步里，你用一个可调的教学模型把这些问题一个个算出来。它是均匀混合、参数固定的理想模型，不是预测，也不是医疗或政策建议。',
    nav0: '0 一传几', nav1: '1 一整条曲线', nav2: '2 为什么会到顶', nav3: '3 减少接触', nav4: '4 疫苗', nav5: '5 检测', nav6: '6 收束',

    s0k: '第 0 步 · 一传几',
    s0t: '一个病人平均传给几个人，几代之后会有多少病例？',
    s0e: '这一步要回答：从 1 个病例出发，如果每个病人平均把病传给 R₀ 个人，第 g 代会有多少新病例？<strong>R₀</strong>（基本再生数）是「在人人都可能被感染的人群里，一个病人在整个患病期内平均传染的人数」。病例一代一代往下传：第 1 代有 R₀ 个，第 2 代有 R₀ × R₀ 个……第 g 代有 R₀<sup>g</sup> 个，这是<strong>指数增长</strong>（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ 指数与对数页第 0 步：差在「乘」不在「加」</a>）。上图是前几代的传播树（每个点是一个病例，线连到传染他的人；每代画出的病例数是期望值四舍五入后的整数，平均分给上一代，所以有人多传一个、有人少传一个）；下图是每代新病例数，纵轴是对数刻度：每往上一格乘 10。',
    r0Slider: '基本再生数 R₀', genSlider: '传到第几代 g',
    c0top: '前几代的传播树（点 = 病例）', c0bot: '每代新病例数（对数纵轴）与代数',
    s0lgBar: '当前 R₀ 下每代新病例', s0lgOne: 'R₀ = 1 时的对照（每代 1 例）', s0lgTree: '传播树中的病例',
    treeMore: '（第 {k} 代起病例太多，树只画到第 {shown} 代）',
    s0readout: 'R₀ = {r}：第 {g} 代新增约 {n} 例，从第 0 代到第 {g} 代累计约 {cum} 例。{trend}',
    trendUp: 'R₀ > 1，每代都比上一代多，越传越快。',
    trendFlat: 'R₀ = 1，每代都是 1 例，既不扩大也不消失。',
    trendDown: 'R₀ < 1，每代都比上一代少，传下去累计最多约 {lim} 例（1 ÷ (1 − R₀)）。',
    s0hint: '观察顺序：先保持 R₀ = 2.5，把代数从 1 拖到 10：橙色柱每代都高出同样一截（对数轴上的等距 = 同样的倍数），第 10 代约 9537 例，累计约 15894 例。再把 R₀ 拖到 1 以下，例如 0.8：柱子一代比一代矮，就算无限传下去，累计也只有 5 例。上图的传播树只画到病例还数得清的那一代。',

    s1k: '第 1 步 · 一整条曲线',
    s1t: '病例不可能永远翻倍，那整条传播曲线长什么样？',
    s1e: '这一步要回答：上一步的指数增长不会一直持续，因为能被感染的人会越来越少。那么整场流行的曲线是什么形状、何时到顶、最后多少人被感染？把人群分成三组：<strong>易感者 S</strong>（还没得过、可能被传染）、<strong>感染者 I</strong>（正在患病、能传染别人）、<strong>移出者 R</strong>（已康复并获得免疫）。这就是 <strong>SIR 模型</strong>。每天新感染数 = (R₀ ÷ D) × S × I，每天康复数 = I ÷ D，其中 D 是平均<strong>传染期</strong>（能传染别人的天数）。图中三条线是三组人各占全体的百分比，从 0.01% 的人感染开始，共算 720 天。',
    days: '{n} 天', r0Slider1: '基本再生数 R₀', dSlider: '平均传染期 D（天）', clearOld: '清除旧曲线',
    c1: '三组人占全体的比例（%）与天数',
    lgS: '易感者 S', lgI: '感染者 I', lgR: '康复免疫者 R', s1lgOld: '之前试过的感染者曲线',
    s1readout: 'R₀ = {r}，D = {d} 天：第 {day} 天到顶，那时 {peak}% 的人同时在感染；流行结束时，一共有 {final}% 的人得过病，还有 {never}% 从未感染。',
    s1hint: '观察顺序：先保持 D = 7，把 R₀ 从 2.5 往右拖：粉色峰更高、更早，最终感染比例更大；往左拖到 1.5 附近，峰变得又矮又晚。再保持 R₀ = 2.5，只拖 D：从 3 天到 14 天，到顶日从第 19 天推迟到第 90 天，但峰高几乎不变（23.3%–23.4%），最终也都是 89.3%——D 只拉伸时间轴。淡色曲线是你试过的组合。',

    s2k: '第 2 步 · 为什么会到顶',
    s2t: '没有任何干预，曲线为什么自己就拐头向下了？',
    s2e: '这一步要回答：疫情在什么时刻由涨转跌？关键是<strong>有效再生数 Rₑ</strong>：此时此刻一个病人平均还能传给几个人。别人已经得过、免疫了，他就传不过去，所以 Rₑ = R₀ × (易感者比例 S)。Rₑ > 1 时，每个病人留下的接班人多于一个，感染者 I 增加；Rₑ < 1 时，I 减少。所以 I 正好在 Rₑ 降到 1 的那天到顶，这时 S = 1 ÷ R₀。易感者降到这个比例需要的免疫比例 1 − 1 ÷ R₀ 叫<strong>群体免疫阈值</strong>。上图是感染者比例，下图是 Rₑ，参数固定为 R₀ = 2.5、D = 7 天。',
    daySlider: '查看第几天', play2: '从第 0 天播放到第 120 天',
    c2top: '感染者 I 占全体的比例（%）与天数', c2bot: '有效再生数 Rₑ = R₀ × S 与天数',
    s2lgRe: '有效再生数 Rₑ', s2lgOne: 'Rₑ = 1', s2lgDay: '当前查看的那一天',
    s2readout: '第 {day} 天：易感者 {s}%，感染者 {i}%，Rₑ = 2.5 × {sf} = {re}。{trend}',
    s2up: 'Rₑ > 1：感染者还在增加。', s2down: 'Rₑ < 1：感染者在减少。', s2peak: '感染者就在这两天到顶（Rₑ 在第 44 到 45 天之间跌破 1）。',
    s2progress: '播放中：第 {day} / 120 天。',
    s2hint: '观察顺序：拖动「查看第几天」或按播放，盯着两图之间的竖线：上图感染者曲线到顶的那一天，正是下图 Rₑ 穿过 1 的那一天（第 44 到 45 天之间）。这时易感者约为 1 ÷ 2.5 = 40%，免疫比例已到群体免疫阈值 60%。但到顶时还有 23.4% 的人正在感染，他们还要继续传染，所以流行停下时一共 89.3% 的人得过病，比阈值多出约 29 个百分点，这叫过冲。',

    s3k: '第 3 步 · 减少接触',
    s3t: '暂时减少接触，是降低了高峰，还是只把它推迟？',
    s3e: '这一步要回答：在某段时间里让人们减少接触（例如居家、限制聚集），对曲线有什么影响？我们把「减少接触 c」理解为：这段时间里每天新感染数乘以 (1 − c)，期间的 Rₑ 也变成 R₀ × (1 − c) × S。窗口一结束，接触恢复原样。灰虚线是不干预时的感染者曲线，粉线是有干预时的；浅青色带是干预期。橙色虚线是<strong>示意的医疗承载线</strong>：同一时刻 5% 的人在感染（真实的承载能力取决于病情轻重和床位，这里只用来比较）。R₀ = 2.5、D = 7 天，最终规模算到第 720 天。',
    pre3a: '早而短：第 10 天起，减 60%，60 天', pre3b: '上升期：第 30 天起，减 50%，60 天', pre3c: '强而长：第 0 天起，减 90%，200 天',
    cSlider: '减少接触 c', startSlider: '从第几天开始', lenSlider: '持续多少天',
    c3: '感染者比例（%）与天数：有干预 vs 不干预',
    s3lgNow: '有干预的感染者', s3lgBase: '不干预的感染者', s3lgWin: '干预期', lgCap: '示意承载线 5%',
    s3readout: '干预：第 {st}–{end} 天减少 {c}% 接触。高峰 {pk}%（第 {pd} 天），不干预时 {bpk}%（第 {bpd} 天）；最终感染 {fin}%，不干预时 {bfin}%；超过承载线 {ab} 天，不干预时 {bab} 天。',
    s3none: '当前没有干预（c = 0 或持续 0 天），曲线与灰虚线重合：高峰 {bpk}%（第 {bpd} 天），最终 {bfin}%，超过承载线 {bab} 天。',
    s3hint: '观察顺序：依次按三个预设，看粉线和灰虚线的差别。「早而短」：干预期内病例被压住，一解除就整条曲线往后挪，高峰 22.9%（第 105 天），几乎和不干预一样高，最终 89.1%。「上升期」：高峰降到 5.9%，最终 76.1%，超过承载线的天数从 38 天减到 29 天——因为解除时已有大量人免疫。「强而长」：200 天里几乎没有新病例，解除后高峰照样出现（第 345 天，23.3%）。然后自己拖三个滑杆，找一个让粉线一直待在橙线下方的组合。',
    quizPrompt: '小测：从第 0 天起把接触减少 90%，坚持 200 天后完全恢复。在本模型里结果是什么？',
    quizA: '疫情被消灭，不再出现', quizB: '高峰推迟到解除之后，高度几乎不变', quizC: '高峰减半',
    check: '检查答案',
    correct: '对。这 200 天里易感者几乎没有减少，解除时 Rₑ 又回到约 2.5，曲线照原样升起（第 345 天，23.3%）。只要还有感染者没归零、人群也没有免疫，暂停就只是推迟。现实中推迟本身也有价值：争取时间准备疫苗、药物和床位，本模型没有包含这些。',
    wrong: '按一下「强而长」预设看看：粉线在第 200 天以后照样升起，高度和灰虚线几乎一样。这 200 天里易感者几乎没减少，解除后 Rₑ 又回到约 2.5。',

    s4k: '第 4 步 · 疫苗',
    s4t: '要给多少人接种，才能让疫情根本起不来？',
    s4e: '这一步要回答：疫情开始前先给一部分人接种，接种率要多高才能让它根本传不开？设接种比例为 v，疫苗<strong>保护效力</strong>为 e（接种者中真正获得免疫的比例），那么一开始就有 v × e 的人免疫，起始的 Rₑ = R₀ × (1 − v × e)。只要它 ≤ 1，感染者一开始就不会增加。所以需要 v × e ≥ 1 − 1 ÷ R₀，即 v ≥ (1 − 1 ÷ R₀) ÷ e，这叫<strong>临界接种率</strong>。上图是「最终感染比例」随接种比例变化的整条曲线（每个点都是一次 720 天的 SIR 计算），下图是当前设置下的感染者曲线。R₀ = 2.5、D = 7 天。',
    vSlider: '接种比例 v', eSlider: '保护效力 e',
    c4top: '最终感染比例（%）与接种比例 v', c4bot: '当前接种下的感染者比例（%）与天数',
    s4lgCurve: '最终感染比例曲线 / 当前点', s4lgI: '当前设置下的感染者（纵轴随峰高自动缩放）', c5all: '全体 10,000 人：TP、FN、FP、TN 依次排开', c5pos: '阳性者里：真阳性 vs 假阳性', c5neg: '阴性者里：真阴性 vs 假阴性', s4lgVc: '临界接种率',
    s4readout: '接种 {v}%、效力 {e}% → 起始免疫 {imm}%，起始 Rₑ = {re}。{res}临界接种率 = 60% ÷ {e}% = {vc}。',
    s4grow: '疫情仍会起来：高峰 {pk}%（第 {pd} 天），最终 {fin}% 的人被感染。',
    s4stop: '起始 Rₑ ≤ 1，感染者从一开始就只减不增，最终只有 {fin}% 的人被感染。',
    s4unreach: '（效力 {e}% 时，即使人人接种也只有 {e}% 免疫，达不到 60%）',
    s4hint: '观察顺序：保持效力 90%，从 0 往右拖接种比例：白点沿曲线下滑，下图的粉色峰越来越矮、越来越晚；40% 时最终感染降到 41.1%，过了临界接种率 66.7% 之后曲线贴地。注意不需要接种到 100%：没接种的人也因为周围的人免疫而受到保护。再把效力往下拖：橙线右移，效力低于 60% 时临界接种率超过 100%，只靠接种无法阻止流行。',

    s5k: '第 5 步 · 检测',
    s5t: '检测结果是阳性，这个人真的感染了吗？',
    s5e: '这一步要回答：用一种检测在人群里筛查，阳性结果有多可信？检测好坏用两个数描述：<strong>灵敏度</strong>是「感染者中测出阳性的比例」，<strong>特异度</strong>是「未感染者中测出阴性的比例」。人群里感染者所占比例叫<strong>患病率</strong>。把 10,000 人分成四组：<strong>真阳性 TP</strong>（感染且阳性）、<strong>假阴性 FN</strong>（感染却阴性）、<strong>假阳性 FP</strong>（没感染却阳性）、<strong>真阴性 TN</strong>（没感染且阴性）。<strong>阳性预测值 PPV</strong> = TP ÷ (TP + FP)，就是「阳性者里真感染的比例」；阴性预测值 NPV = TN ÷ (TN + FN)。图中 10,000 个小方块就是这 10,000 人（<a class="xlink" href="../../../probability/inference/bayes-diagnostics/#step-posterior">→ 贝叶斯诊断页：拿到阳性后该在哪群人里数病人</a>）。',
    prevSlider: '患病率', sensSlider: '灵敏度', specSlider: '特异度', usePeak5: '患病率用第 1 步曲线的高峰值', reset5: '回到默认（1%、90%、95%）',
    c5: '10,000 人：按感染与检测结果分四组',
    lgTP: '真阳性 TP', lgFP: '假阳性 FP', lgFN: '假阴性 FN', lgTN: '真阴性 TN',
    s5readout: '患病率 {p}%、灵敏度 {se}%、特异度 {sp}%：10,000 人中 TP {tp}、FP {fp}、FN {fn}、TN {tn}。阳性共 {pos} 人，其中真感染的比例 PPV = {ppv}%；阴性者中真未感染的比例 NPV = {npv}%。',
    s5peakNote: '（已用第 1 步当前曲线的高峰值 {pk}%，滑杆上限 30%）',
    s5hint: '观察顺序：默认患病率 1%、灵敏度 90%、特异度 95%：90 个真阳性被 495 个假阳性淹没，PPV 只有 15.4%——因为没感染的人有 9,900 个，5% 误报就是 495 人。保持检测不变，把患病率拖到 20%：PPV 升到 81.8%。回到 1%，只把特异度提到 99%：PPV 升到 47.6%；只把灵敏度提到 99%：PPV 只到 16.7%。低患病率时，特异度比灵敏度更决定阳性的可信度。',

    s6k: '第 6 步 · 收束',
    s6t: '把一场流行讲成一条因果链',
    s6fin: '<strong>为什么会爆发</strong>：每个病人平均传给 R₀ 个人，R₀ > 1 时病例按代成倍增长。<strong>为什么会到顶</strong>：真正决定涨跌的是有效再生数 Rₑ = R₀ × S，易感者被消耗到 1 ÷ R₀ 时 Rₑ = 1，感染者到顶；之后还有过冲，最终感染比例高于群体免疫阈值。<strong>干预改变什么</strong>：减少接触只在实施期间降低 Rₑ，解除后若人群仍缺乏免疫，高峰只是推迟；在上升期实施可以压低高峰和最终规模。接种直接降低起始 Rₑ，过了临界接种率疫情就起不来。检测结果要结合患病率解读：患病率低时，阳性里可能多数是误报。',
    formula: 'Rₑ = R₀ × S × (1 − c)\n群体免疫阈值 = 1 − 1 ÷ R₀　　临界接种率 = (1 − 1 ÷ R₀) ÷ e\nPPV = TP ÷ (TP + FP)',
    boundary: '模型边界：均匀混合（人人等可能接触）、参数固定、无潜伏期、无死亡与出生、康复后终身免疫、确定性（没有偶然灭绝），减少接触按统一比例作用。真实流行受年龄结构、空间、季节、行为变化、变异株和医疗条件影响，数值会很不一样。本页是理解机制的教学模型，不是预测，也不是医疗、公共卫生或政策建议。',
    linksTitle: '接着去哪',
    lk1: '→ 种群增长页第 0 步：每一代都翻倍，先猜再数（同样的指数增长）',
    lk2: '→ 指数与对数页第 0 步：为什么「乘」出来的增长那么快',
    lk3: '→ 贝叶斯诊断页：用先验、灵敏度和特异度算出阳性的分量',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《公共卫生 · 从曲线到干预》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Public Health · From Curves to Interventions”.',
  },
  en: {
    pageTitle: 'The Maths of an Epidemic · From One Case to a Whole Curve',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Public Health · From Curves to Interventions →',
    navLabel: 'Epidemic steps',
    tagline: 'A city records its first case of an infectious disease. How fast will it spread? When will it peak? How many people will catch it in the end? And what do reduced contact, vaccination and testing each change? In seven steps you will work these out with an adjustable teaching model. It assumes a well-mixed population with fixed parameters; it is not a forecast and not medical or policy advice.',
    nav0: '0 One to many', nav1: '1 The whole curve', nav2: '2 Why it peaks', nav3: '3 Less contact', nav4: '4 Vaccines', nav5: '5 Testing', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · ONE TO MANY',
    s0t: 'If each case infects a few others, how many cases after a few generations?',
    s0e: 'This step answers: starting from 1 case, if every case passes the disease to R₀ people on average, how many new cases are there in generation g? <strong>R₀</strong>, the basic reproduction number, is the average number of people one case infects over their whole illness in a population where everyone can still catch it. Cases pass it on generation by generation: generation 1 has R₀ cases, generation 2 has R₀ × R₀, and generation g has R₀<sup>g</sup>. That is <strong>exponential growth</strong> (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step0">→ Exponents & Logarithms, step 0: growth by multiplying, not adding</a>). The upper picture is the transmission tree for the first few generations (each dot is a case, linked to whoever infected it; each generation holds the expected count rounded to a whole number, shared as evenly as possible, so some cases infect one more than others). The lower chart shows new cases per generation on a logarithmic axis: each gridline up is ten times more.',
    r0Slider: 'Basic reproduction number R₀', genSlider: 'Generations g',
    c0top: 'Transmission tree, first generations (dot = case)', c0bot: 'New cases per generation (log axis) vs generation',
    s0lgBar: 'New cases per generation at this R₀', s0lgOne: 'Reference R₀ = 1 (one case each generation)', s0lgTree: 'Cases in the tree',
    treeMore: '(from generation {k} there are too many cases; the tree stops at generation {shown})',
    s0readout: 'R₀ = {r}: generation {g} adds about {n} cases, and generations 0 to {g} total about {cum}. {trend}',
    trendUp: 'R₀ > 1: every generation is larger than the last, so spread accelerates.',
    trendFlat: 'R₀ = 1: one case per generation; it neither grows nor dies out.',
    trendDown: 'R₀ < 1: every generation is smaller, and even forever the total stays below about {lim} cases (1 ÷ (1 − R₀)).',
    s0hint: 'What to watch: keep R₀ = 2.5 and drag the generations from 1 to 10. Each orange bar rises by the same step (equal steps on a log axis mean equal multiples): generation 10 has about 9537 cases, about 15894 in total. Then drag R₀ below 1, say 0.8: the bars shrink every generation, and even if it went on forever the total would be only 5 cases. The tree in the upper picture is drawn only while the cases are still countable.',

    s1k: 'STEP 1 · THE WHOLE CURVE',
    s1t: 'Cases cannot double forever. So what does the whole epidemic curve look like?',
    s1e: 'This step answers: the exponential growth of the last step cannot last, because fewer and fewer people are left to infect. So what shape is the whole epidemic, when does it peak, and how many people are infected in the end? Split the population into three groups: <strong>susceptible S</strong> (never had it, can catch it), <strong>infected I</strong> (ill now and able to infect others) and <strong>removed R</strong> (recovered and immune). This is the <strong>SIR model</strong>. New infections per day = (R₀ ÷ D) × S × I, and recoveries per day = I ÷ D, where D is the average <strong>infectious period</strong> (days a case can infect others). The three lines are each group’s share of the whole population, starting with 0.01% infected and running for 720 days.',
    days: '{n} days', r0Slider1: 'Basic reproduction number R₀', dSlider: 'Infectious period D (days)', clearOld: 'Clear old curves',
    c1: 'Share of the population in each group (%) vs day',
    lgS: 'Susceptible S', lgI: 'Infected I', lgR: 'Recovered & immune R', s1lgOld: 'Infected curves you tried before',
    s1readout: 'R₀ = {r}, D = {d} days: the peak comes on day {day}, with {peak}% of people infected at once. By the end {final}% have had the disease and {never}% never caught it.',
    s1hint: 'What to watch: keep D = 7 and drag R₀ up from 2.5. The pink peak gets taller and earlier, and more people are infected in the end; drag it down toward 1.5 and the peak becomes low and late. Then keep R₀ = 2.5 and drag only D: from 3 to 14 days the peak moves from day 19 to day 90, yet its height barely changes (23.3%–23.4%) and the final total stays at 89.3%. D only stretches the time axis. Faint curves are settings you tried.',

    s2k: 'STEP 2 · WHY IT PEAKS',
    s2t: 'With no intervention at all, why does the curve turn down by itself?',
    s2e: 'This step answers: at what moment does the epidemic switch from rising to falling? The key is the <strong>effective reproduction number Rₑ</strong>: how many people one case infects on average right now. Contacts who have already had the disease are immune and cannot catch it, so Rₑ = R₀ × (susceptible share S). When Rₑ > 1 each case leaves more than one successor and the infected share I grows; when Rₑ < 1, I shrinks. So I peaks exactly on the day Rₑ falls to 1, when S = 1 ÷ R₀. The immune share needed to get there, 1 − 1 ÷ R₀, is the <strong>herd immunity threshold</strong>. The upper chart shows the infected share and the lower chart shows Rₑ, with R₀ = 2.5 and D = 7 days fixed.',
    daySlider: 'Day to inspect', play2: 'Play from day 0 to day 120',
    c2top: 'Infected share I (%) vs day', c2bot: 'Effective reproduction number Rₑ = R₀ × S vs day',
    s2lgRe: 'Effective reproduction number Rₑ', s2lgOne: 'Rₑ = 1', s2lgDay: 'The day being inspected',
    s2readout: 'Day {day}: susceptible {s}%, infected {i}%, Rₑ = 2.5 × {sf} = {re}. {trend}',
    s2up: 'Rₑ > 1: the infected share is still rising.', s2down: 'Rₑ < 1: the infected share is falling.', s2peak: 'The infected share peaks right now (Rₑ drops below 1 between days 44 and 45).',
    s2progress: 'Playing: day {day} / 120.',
    s2hint: 'What to watch: drag “Day to inspect” or press play, and follow the vertical line through both charts. The day the infected curve in the upper chart peaks is the day Rₑ in the lower chart crosses 1 (between days 44 and 45). By then about 1 ÷ 2.5 = 40% are still susceptible, so the immune share has reached the 60% herd immunity threshold. But 23.4% are still infected at the peak and keep passing it on, so by the end 89.3% have had the disease, about 29 percentage points beyond the threshold. That is called overshoot.',

    s3k: 'STEP 3 · LESS CONTACT',
    s3t: 'Does a temporary cut in contact lower the peak, or just postpone it?',
    s3e: 'This step answers: if people reduce their contacts for a while (staying home, limiting gatherings), what happens to the curve? We model a “contact reduction c” as multiplying new infections per day by (1 − c) during that window, so Rₑ becomes R₀ × (1 − c) × S. When the window ends, contact goes back to normal. The grey dashed line is the infected curve with no intervention, the pink line is with it, and the pale cyan band is the intervention window. The orange dashed line is a <strong>schematic care-capacity line</strong>: 5% of people infected at the same time (real capacity depends on how severe the illness is and how many beds there are; here it is only a yardstick). R₀ = 2.5, D = 7 days, final totals counted to day 720.',
    pre3a: 'Early & short: from day 10, −60%, 60 days', pre3b: 'On the rise: from day 30, −50%, 60 days', pre3c: 'Strong & long: from day 0, −90%, 200 days',
    cSlider: 'Contact reduction c', startSlider: 'Start day', lenSlider: 'Duration (days)',
    c3: 'Infected share (%) vs day: with vs without intervention',
    s3lgNow: 'Infected, with intervention', s3lgBase: 'Infected, no intervention', s3lgWin: 'Intervention window', lgCap: 'Schematic capacity 5%',
    s3readout: 'Intervention: contact cut by {c}% on days {st}–{end}. Peak {pk}% (day {pd}) vs {bpk}% (day {bpd}) without; final total {fin}% vs {bfin}% without; {ab} days above the capacity line vs {bab} without.',
    s3none: 'No intervention right now (c = 0 or 0 days), so the curve sits on the grey dashed line: peak {bpk}% (day {bpd}), final total {bfin}%, {bab} days above the capacity line.',
    s3hint: 'What to watch: press the three presets in turn and compare the pink line with the grey dashed one. “Early & short”: cases are held down during the window, then the whole curve simply shifts later, peaking at 22.9% on day 105, almost as high as without intervention, with 89.1% infected in the end. “On the rise”: the peak drops to 5.9%, the final total to 76.1%, and days above the capacity line fall from 38 to 29, because many people are already immune when the window ends. “Strong & long”: almost no new cases for 200 days, then the peak arrives anyway (day 345, 23.3%). Then drag the three sliders yourself and look for a setting that keeps the pink line under the orange one.',
    quizPrompt: 'Quick check: contact is cut by 90% from day 0 for 200 days, then fully restored. What happens in this model?',
    quizA: 'The epidemic is wiped out for good', quizB: 'The peak is postponed until after the window, at almost the same height', quizC: 'The peak is halved',
    check: 'Check answer',
    correct: 'Right. Hardly anyone stops being susceptible during those 200 days, so when the window ends Rₑ is back near 2.5 and the curve rises as before (day 345, 23.3%). As long as infections have not reached zero and the population lacks immunity, a pause only postpones. In reality postponing has value of its own, buying time for vaccines, drugs and beds, none of which this model includes.',
    wrong: 'Press the “Strong & long” preset: after day 200 the pink line rises anyway, almost as high as the grey dashed line. Hardly anyone stopped being susceptible in those 200 days, so Rₑ is back near 2.5 once contact returns.',

    s4k: 'STEP 4 · VACCINES',
    s4t: 'How many people must be vaccinated so the epidemic never takes off?',
    s4e: 'This step answers: if some people are vaccinated before the epidemic starts, how high must coverage be for it never to spread? Let v be the share vaccinated and e the vaccine’s <strong>efficacy</strong> (the fraction of vaccinated people who actually become immune). Then v × e of the population is immune from the start, and the starting Rₑ = R₀ × (1 − v × e). If that is ≤ 1, the infected share never rises. So we need v × e ≥ 1 − 1 ÷ R₀, that is v ≥ (1 − 1 ÷ R₀) ÷ e, the <strong>critical vaccination coverage</strong>. The upper chart shows the final infected share across all coverage levels (every point is a 720-day SIR run); the lower chart shows the infected curve at the current setting. R₀ = 2.5, D = 7 days.',
    vSlider: 'Vaccination coverage v', eSlider: 'Efficacy e',
    c4top: 'Final infected share (%) vs coverage v', c4bot: 'Infected share (%) vs day at this coverage',
    s4lgCurve: 'Final infected share curve / current point', s4lgI: 'Infected at this setting (vertical axis rescales to the peak)', c5all: 'All 10,000: TP, FN, FP, TN side by side', c5pos: 'Among positives: true vs false', c5neg: 'Among negatives: true vs false', s4lgVc: 'Critical coverage',
    s4readout: 'Coverage {v}%, efficacy {e}% → {imm}% immune at the start, starting Rₑ = {re}. {res}Critical coverage = 60% ÷ {e}% = {vc}.',
    s4grow: 'The epidemic still takes off: peak {pk}% (day {pd}), and {fin}% are infected in the end. ',
    s4stop: 'Starting Rₑ ≤ 1, so the infected share only falls from day one; in the end just {fin}% are infected. ',
    s4unreach: '(at {e}% efficacy even vaccinating everyone makes only {e}% immune, short of 60%)',
    s4hint: 'What to watch: keep efficacy at 90% and drag coverage up from 0. The white dot slides down the curve and the pink peak below becomes lower and later; at 40% the final total drops to 41.1%, and past the critical coverage of 66.7% the curve hugs the floor. Notice that 100% coverage is not needed: unvaccinated people are protected because the people around them are immune. Then drag efficacy down: the orange line moves right, and below 60% efficacy the critical coverage exceeds 100%, so vaccination alone cannot stop the epidemic.',

    s5k: 'STEP 5 · TESTING',
    s5t: 'A test comes back positive. Is the person really infected?',
    s5e: 'This step answers: when a test is used to screen a population, how trustworthy is a positive result? Two numbers describe a test: <strong>sensitivity</strong>, the share of infected people who test positive, and <strong>specificity</strong>, the share of uninfected people who test negative. The share of the population that is infected is the <strong>prevalence</strong>. Split 10,000 people into four groups: <strong>true positives TP</strong> (infected, positive), <strong>false negatives FN</strong> (infected, negative), <strong>false positives FP</strong> (not infected, positive) and <strong>true negatives TN</strong> (not infected, negative). The <strong>positive predictive value PPV</strong> = TP ÷ (TP + FP) is the share of positives who are truly infected; the negative predictive value NPV = TN ÷ (TN + FN). The 10,000 small squares are those 10,000 people (<a class="xlink" href="../../../probability/inference/bayes-diagnostics/#step-posterior">→ Bayes Diagnostics: after a positive, which group should you count in?</a>).',
    prevSlider: 'Prevalence', sensSlider: 'Sensitivity', specSlider: 'Specificity', usePeak5: 'Use the step 1 curve’s peak as prevalence', reset5: 'Back to default (1%, 90%, 95%)',
    c5: '10,000 people in four groups by infection and test result',
    lgTP: 'True positive TP', lgFP: 'False positive FP', lgFN: 'False negative FN', lgTN: 'True negative TN',
    s5readout: 'Prevalence {p}%, sensitivity {se}%, specificity {sp}%: out of 10,000, TP {tp}, FP {fp}, FN {fn}, TN {tn}. Of the {pos} positives, the share truly infected is PPV = {ppv}%; of the negatives, the share truly uninfected is NPV = {npv}%.',
    s5peakNote: '(using the peak of the current step 1 curve, {pk}%; the slider stops at 30%)',
    s5hint: 'What to watch: at the default 1% prevalence, 90% sensitivity and 95% specificity, 90 true positives are swamped by 495 false positives and PPV is only 15.4%, because 9,900 people are uninfected and a 5% false-alarm rate among them is 495 people. Keep the test and drag prevalence to 20%: PPV rises to 81.8%. Back at 1%, raising only specificity to 99% lifts PPV to 47.6%, while raising only sensitivity to 99% gets it to just 16.7%. At low prevalence, specificity matters far more than sensitivity for how much a positive means.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'An epidemic as one chain of cause and effect',
    s6fin: '<strong>Why it breaks out</strong>: each case infects R₀ others on average, and when R₀ > 1 cases multiply generation by generation. <strong>Why it peaks</strong>: what really drives rise and fall is the effective reproduction number Rₑ = R₀ × S; once susceptibles are used up to 1 ÷ R₀, Rₑ = 1 and infections peak, followed by overshoot that leaves the final total above the herd immunity threshold. <strong>What interventions change</strong>: reduced contact lowers Rₑ only while it lasts, so if the population still lacks immunity when it ends, the peak is merely postponed; applied during the rise it can lower both the peak and the final total. Vaccination lowers the starting Rₑ directly, and past the critical coverage the epidemic never takes off. Test results must be read alongside prevalence: when prevalence is low, many positives may be false alarms.',
    formula: 'Rₑ = R₀ × S × (1 − c)\nherd immunity threshold = 1 − 1 ÷ R₀　　critical coverage = (1 − 1 ÷ R₀) ÷ e\nPPV = TP ÷ (TP + FP)',
    boundary: 'Model limits: well mixed (everyone equally likely to meet), fixed parameters, no incubation period, no births or deaths, lifelong immunity after recovery, deterministic (no chance extinction), and contact reduction applied as one uniform factor. Real epidemics are shaped by age structure, geography, seasons, changing behaviour, new variants and healthcare, so real numbers can differ a lot. This is a teaching model for understanding mechanisms, not a forecast and not medical, public-health or policy advice.',
    linksTitle: 'Where next',
    lk1: '→ Population Growth, step 0: doubling every generation — guess, then count (the same exponential growth)',
    lk2: '→ Exponents & Logarithms, step 0: why growth by multiplying is so fast',
    lk3: '→ Bayes Diagnostics: weigh a positive result with prior, sensitivity and specificity',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《公共卫生 · 从曲线到干预》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Public Health · From Curves to Interventions”.',
  },
};

let lang = 'zh';
try { if (typeof window !== 'undefined') lang = localStorage.getItem('knowledge-lang') || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch (_) { /* storage unavailable */ }
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
  if (typeof window.refreshPH === 'function') window.refreshPH();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PH_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
