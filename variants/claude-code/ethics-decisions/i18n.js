'use strict';
// Ethical-decisions lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '伦理决策 · 把取舍摊开在一张图上',
    back: '← 知识索引',
    compare: '对照另一版本：伦理决策 · 把取舍说清楚 →',
    navLabel: '伦理决策步骤导航',
    tagline: '一座虚构的小城要选防洪方案。同一组数字，从「全城加起来」看是一个答案，从「最吃亏的那群人」看是另一个答案，再问一句「有没有人被违背意愿」，又会划掉一个选项。这一课不替你选，而是把每种看法依赖哪个数字、哪条原则摊开，让分歧落在说得清的地方。',
    nav0: '0 谁承担什么', nav1: '1 后果：加总', nav2: '2 分配：最差的人', nav3: '3 同意：能不能划掉', nav4: '4 分歧地图', nav5: '5 哪个假设在撑着', nav6: '6 收束',

    s0k: '第 0 步 · 摊开账本',
    s0t: '每个方案，分别让谁承担多少？',
    s0e: '这一步要回答：四个方案落到每一户头上，各是多少负担？小城有三片住区：<strong>市区</strong> 500 户、<strong>河岸</strong> 100 户、<strong>山坡</strong> 400 户。设市区某一年被淹的概率是 p（先取 10%），河岸离河近，概率是市区的 2 倍，山坡只有 0.3 倍；一户被淹损失 100 千元。四个方案：<strong>不作为</strong>；<strong>A 市区堤坝</strong>，每年花 2000 千元，市区损失减少 90%；<strong>B 全城防水改造</strong>，每年 2500 千元，每户损失都减少 40%；<strong>C 河岸搬迁 + 蓄洪公园</strong>，每年 5000 千元，河岸 100 户搬走后不再被淹，但每户承受一笔搬家、离开熟人的损失（先按每年 8 千元折算），空出的河岸改成蓄洪公园，让市区损失减少 30%。工程费由全城 1000 户平摊。这里的<strong>负担</strong>指一户一年的三项之和：预期洪水损失 + 分摊的工程费 + 搬迁损失，单位千元/户/年。<strong>预期洪水损失</strong> = 被淹概率 × 100 千元，是很多年平均下来每年的损失，不是某一年真实发生的数。所有数字都是为教学编的。',
    c0a: '各住区每户每年负担的条形图，条宽代表户数',
    c0title: '每户每年负担（千元）',
    lgWidth: '条宽 = 户数，面积 = 该住区一年合计',
    lgFlood: '预期洪水损失', lgTax: '分摊的工程费', lgHard: '搬迁损失（折算）', lgNone: '不作为时的负担（对照）', lgForced: '被违背意愿搬走的户',
    lgVol: '自愿搬迁的 C（规则开）', lgMand: '强制搬迁的 C（只看账本）', lgMeanLine: '实线：全城平均负担', lgWorstLine: '虚线：负担最重一组',
    planNone: '不作为', planA: 'A 市区堤坝', planB: 'B 全城改造', planC: 'C 河岸搬迁',
    pnNone: '不作为', pnA: 'A 堤坝', pnB: 'B 改造', pnC: 'C 搬迁',
    grpD: '市区', grpR: '河岸', grpRmove: '河岸·搬走', grpRvol: '河岸·自愿搬', grpRstay: '河岸·留下', grpH: '山坡',
    hh: '{n} 户',
    s0readout: '{plan}（p = {p}）：{list}（千元/户/年）。全城合计 {tot} 千元/年，平均每户 {mean}；负担最重的一组是「{worst}」，每户 {wv}。',
    s0hint: '观察顺序：先点「不作为」记住三根条的高度（灰色虚线框会一直留作对照），再依次点 A、B、C。看三件事：哪片住区的条变矮了、橙色的工程费一层有多厚、紫色的搬迁损失落在谁身上。条的面积是该住区一年的合计，所以宽条（市区、山坡）降一点，全城合计就降很多。',

    s1k: '第 1 步 · 后果镜头',
    s1t: '只看全城加总，哪个方案最好？这个答案有多依赖 p？',
    s1e: '这一步要回答：如果只关心「全城每户平均负担最低」，该选谁？这叫<strong>后果镜头</strong>：把每户的负担加起来再除以户数，谁小选谁。负担里的洪水损失是<strong>期望值</strong>：某一年要么被淹（损失 100 千元），要么没被淹（损失 0），按概率加权平均后才是 p × 100（<a class="xlink" href="../../../probability/basics/expected-value/#step2">→ 期望页第 2 步：为什么期望是「很多次的平均」</a>）。可 p 本身是估出来的。图的横轴是市区每年被淹的概率 p，纵轴是全城平均每户负担（千元/年），每条线是一个方案。工程费不随 p 变，洪水损失随 p 正比增长，所以每条线都是直线：起点高度是工程费，斜率是还剩多少洪水风险。',
    c1a: '四个方案的全城平均负担随洪水概率 p 变化的折线图',
    c1title: '全城平均负担（千元/户/年）随 p 变化',
    pSlider: '市区每年被淹的概率 p',
    s1readout: 'p = {p}：平均负担从低到高 {order}。只看加总时最好的是「{best}」。不作为与 A 的两条线交于 p = {cross}：p 低于它时，花钱筑堤省下的洪水损失还不够付工程费。',
    s1hint: '观察顺序：把 p 从 2% 慢慢拖到 30%，盯住最低的那条线换没换人。再留意 C：它花得最多，在这一镜头里一直不占优，可它恰恰是对河岸帮助最大的方案——加总把这件事藏起来了，下一步换个镜头看。',

    s2k: '第 2 步 · 分配镜头',
    s2t: '如果更在乎处境最差的那群人，答案会变吗？',
    s2e: '这一步要回答：同样的方案，若把「负担最重的那一组」也算进来，排名怎么变？<strong>分配镜头</strong>问的不是总量，而是负担落在谁身上。我们用一个最简单的打分：<strong>得分 = (1 − λ) × 全城平均负担 + λ × 负担最重一组的每户负担</strong>，越低越好。<strong>λ（权重）</strong>是你的价值选择，不是事实：λ = 0 只看平均（上一步的后果镜头），λ = 1 只看最差的那组，接近哲学家罗尔斯的「最大最小」原则（<a class="xlink" href="../../../psychology/ethics/veil-of-ignorance/#step2">→ 无知之幕第 2 步：为什么有人主张先看最差的位置</a>）。图里每个点是一个方案：横轴是全城平均负担，纵轴是负担最重一组的每户负担（单位都是千元/户/年），两个数都是越小越好，所以越靠左下越好。p 沿用第 1 步的滑杆。',
    c2a: '四个方案在「平均负担—最重一组负担」平面上的散点图，带当前权重下的等分线',
    c2title: '横：全城平均负担 · 纵：最重一组负担',
    lamSlider: '对最差一组的权重 λ',
    s2readout: 'p = {p}，λ = {lam}：得分 {order}。当前最好的是「{best}」。在这个 p 下，λ 从 0 拖到 1，第一名依次是 {seq}。',
    s2hint: '观察顺序：保持 p 不动，把 λ 从 0 拖到 1。斜线是「等分线」：同一条线上的点得分相同，λ 越大线越平，越奖励纵轴低的点。实线是穿过第一名的那条等分线，其余方案的虚线都在它右上方（得分更高）。看 A：它的平均最低，但河岸一组反而比不作为时更重（还要分摊堤坝费）；λ 稍大一点它就让位了。',

    s3k: '第 3 步 · 同意镜头',
    s3t: '账本上人人都更好，就可以替他们决定吗？',
    s3e: '这一步要回答：方案 C 要求河岸住户搬走，如果有人不愿意，该把这件事算成一项「成本」，还是直接把强制搬迁划掉？设河岸住户中愿意搬的比例是 q。<strong>只看账本</strong>时，C 让全部 100 户都搬，不愿意的 (1 − q) 也被搬走；<strong>规则开</strong>时，C 改成自愿搬迁：只有愿意的人搬，留下的人照旧面对洪水，蓄洪公园和工程费也按搬走的比例缩小。这里的<strong>同意</strong>指当事人自己说「行」；把「不许违背当事人意愿」当成<strong>硬约束</strong>，意思是不管别的分数多好，违反它的选项都不进入比较，而不是扣几分了事。上图是 C 方案下各组的每户负担（条宽 = 户数，粉色斜纹是被违背意愿搬走的户）；下图横轴是 q，纵轴是 C 的负担：实线是全城平均，虚线是负担最重一组，橙色是自愿版，粉色是强制版。',
    c3a: '上：C 方案各组负担；下：C 方案的平均负担和最重一组负担随愿意搬迁比例 q 变化',
    c3top: 'C 方案下每户每年负担（千元）',
    c3bot: 'C 的负担（千元/户/年）随愿意搬的比例 q 变化',
    ruleOff: '只看账本：不愿意也搬', ruleOn: '规则开：不许违背意愿',
    qSlider: '河岸住户中愿意搬的比例 q',
    s3readoutOff: '只看账本，q = {q}：100 户全部搬走，其中 {forced} 户是被违背意愿搬走的。C 的全城平均负担 {mean}，最重一组每户 {worst}（{worstName}）。注意：这两个数与 q 无关——账本看不见谁是被迫的。',
    s3readoutOn: '规则开，q = {q}：{moved} 户自愿搬走，{stay} 户留下，没有人被强迫。C 的全城平均负担 {mean}，最重一组每户 {worst}（{worstName}）；强制版的这两个数是 {mMean} 和 {mWorst}。',
    s3hint: '观察顺序：先选「只看账本」，拖 q：上图粉色斜纹变宽变窄，可下图粉色两条线纹丝不动——被迫的人有多少，账本根本不记录。再选「规则开」拖 q：橙色线随 q 变化。在默认 p = 10% 下，只要还有人留下，留下的河岸户就是负担最重的一组——他们照旧会被淹，还要分摊更多工程费，所以 q 越大，橙色虚线反而越高。q = 100% 时没人留下，两种版本数字完全相同，区别只在有没有人被强迫。这个开关也决定第 4、5 步里 C 是哪个版本。',

    s4k: '第 4 步 · 分歧地图',
    s4t: '两个人结论不同，是对事实看法不同，还是对价值看法不同？',
    s4e: '这一步要回答：结论的分歧来自哪里？我们把前面两样东西放到同一张图上：横轴是<strong>事实判断</strong> p（你估计洪水有多常见），纵轴是<strong>价值判断</strong> λ（你有多看重最差的那组，λ 的意思同第 2 步）。图上每个位置都按第 2 步的得分算出第一名，并涂上它的颜色；颜色交界处就是结论翻转的地方。白点是你现在的位置，可以拖滑杆，也可以直接点图。三个按钮放好了三位虚构居民的位置。第 3 步的同意规则在这里同样起作用。',
    c4a: '以洪水概率 p 为横轴、权重 λ 为纵轴的地图，每个位置按第一名的方案着色',
    c4title: '纵：权重 λ（0 → 1）· 横：洪水概率 p',
    person0: '居民甲', person1: '居民乙', person2: '居民丙',
    tag0: '甲', tag1: '乙', tag2: '丙',
    s4readout: '位置 p = {p}、λ = {lam}（{rule}）：第一名是「{best}」。{pm}{lm}',
    ruleOffShort: '只看账本', ruleOnShort: '同意规则开',
    s4pm: '只改 p 时，{pdir}。',
    s4lm: '只改 λ 时，{ldir}。',
    flipBelow: '降到 {v} 以下会换成「{to}」',
    flipAbove: '升到 {v} 以上会换成「{to}」',
    flipNone: '在整个范围内都不换',
    joinAnd: '；', listSep: '、', seqStep: ' →（λ ≈ {v} 起）',
    lgYou: '你现在的位置', lgPeople: '三位虚构居民',
    s4hint: '观察顺序：依次点三位居民。甲和乙对洪水的估计相同、在乎最差者的程度不同；甲和丙在乎的程度相同、对洪水的估计不同。看他们各落在哪块颜色里。然后打开第 3 步的同意规则（这里的按钮同样有效），看 C 的橙色区域怎样消失、被谁接管。',
    quizPrompt: '小测：甲选 A，乙选 B。他们最值得花时间争论的是什么？',
    quizA: '再收集十年的洪水记录，把 p 估得更准',
    quizB: '该多看重负担最重的那组人，也就是 λ 取多少',
    quizC: '谁的计算出了错',
    check: '检查',
    correct: '对。甲、乙的 p 一样，只是 λ 不同；算术两人都没错，更多洪水数据也不会让他们达成一致。真正的分歧是价值上的，摊开之后才知道该谈什么。',
    wrong: '再看地图：甲和乙的点上下排列，横坐标 p 完全相同。数据和算术不是他们的分歧所在。',

    s5k: '第 5 步 · 哪个假设在撑着结论',
    s5t: '你的结论里，哪个假设一改就会翻？',
    s5e: '这一步要回答：在你第 4 步选的位置上，结论依赖哪些假设？做法叫<strong>单因素敏感性检查</strong>：别的假设都不动，只把其中一个从它的最小值拖到最大值，看第一名会不会换人。图中每一行是一个假设，横条按「该假设取这个值时第一名是谁」着色，白色三角是现在的取值。一整行同一种颜色，说明这个假设在合理范围内不影响结论；颜色在三角附近就变了，说明结论正靠它撑着，最值得去核实。p、λ 和同意规则沿用第 4 步，q 沿用第 3 步；下面三个滑杆是前面一直固定不动的三个假设。',
    c5a: '六个假设的敏感性条带：每一行按该假设取不同值时的第一名方案着色',
    eASlider: 'A 堤坝让市区损失减少多少', mRSlider: '河岸被淹概率是市区的几倍', hmSlider: '搬迁损失折算（千元/户/年）',
    reset5: '三个假设恢复默认',
    rowP: '洪水概率 p（现在 {v}）', rowLam: '权重 λ（现在 {v}）', rowEA: 'A 堤坝减损比例（现在 {v}）', rowMR: '河岸风险倍数（现在 {v}）', rowHM: '搬迁损失折算（现在 {v} 千元）', rowQ: '愿意搬的比例 q（现在 {v}）',
    s5readout: '当前第一名：「{best}」。会让结论翻转的假设：{list}。在整个范围内都不改变结论的：{flat}。',
    s5item: '{name} {dir}',
    s5none: '没有',
    nmP: 'p', nmLam: 'λ', nmEA: '堤坝减损', nmMR: '河岸倍数', nmHM: '搬迁损失', nmQ: 'q',
    s5hint: '观察顺序：先看哪几行全是一种颜色——那些假设争论再久也不改变结论。再看三角紧挨着颜色交界的行，那是最该拿证据去核实的地方。然后拖「河岸风险倍数」：它一变，p 和 λ 两行的交界也跟着移动，因为每一行都是在其余假设固定时画的。',

    s6k: '第 6 步 · 收束', s6t: '把判断写成别人能检查的样子',
    s6fin: '回顾：<strong>第 0 步</strong>先把负担按住区摊开，看清谁付钱、谁受益。<strong>第 1 步</strong>后果镜头只看加总，结论随 p 变化。<strong>第 2 步</strong>分配镜头加入最差的一组，λ 是价值选择，λ 一变第一名就会变。<strong>第 3 步</strong>同意镜头不是再加一项分数，而是决定哪些选项可以进入比较；被迫的人数在账本里根本看不见。<strong>第 4 步</strong>把事实判断 p 和价值判断 λ 分成两根轴，分歧落在哪根轴上，就该去找数据还是去讨论价值。<strong>第 5 步</strong>找出撑着结论的假设，先核实它们。',
    formula: '负担 = 预期洪水损失 + 分摊工程费 + 搬迁损失\n得分 = (1 − λ)·平均负担 + λ·最重一组负担\n可比较的选项 = 满足硬约束的方案',
    boundary: '适用范围：小城、方案和所有数字都是为教学编的，没有任何真实城市或工程依据；负担只算了能折成钱的部分，搬迁损失的 8 千元是规划者的猜测，正因为是猜测，才需要当事人自己表态。得分公式只是许多可能的分配规则中最简单的一种，λ 没有「正确值」。本页不提供道德、法律或政策建议；它能做的，是让一个判断写明「我假设了什么、看重什么、哪条规则不能破」，别人可以逐条检查和反驳。',
    linksTitle: '接着去哪',
    lk1: '→ 期望页第 2 步：期望值为什么是「很多次的平均」',
    lk2: '→ 无知之幕第 2 步：最大最小原则与它的适用条件',
    lk3: '→ 信号检测第 5 步：误判的代价怎样决定该在哪里划线',
    lk4: '→ 外部性第 1 步：账记在不付钱的人头上会怎样',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《伦理决策 · 把取舍说清楚》的平行版本。'
  },
  en: {
    pageTitle: 'Ethical Decisions · Lay the Trade-off Out on One Map',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Ethical Decisions · Make the Trade-off Visible →',
    navLabel: 'Ethical decisions step navigation',
    tagline: 'A made-up town has to pick a flood plan. Add up the numbers across the town and you get one answer; look at the people who come off worst and you get another; ask whether anyone is being overruled and one option drops out altogether. This lesson will not choose for you. It shows which number and which principle each view leans on, so a disagreement ends up somewhere you can actually talk about.',
    nav0: '0 Who bears what', nav1: '1 Consequences', nav2: '2 The worst-off', nav3: '3 Consent', nav4: '4 Map of disagreement', nav5: '5 Load-bearing assumptions', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Open the books',
    s0t: 'Under each plan, who carries how much?',
    s0e: 'The question for this step: what does each of four plans cost each household? The town has three neighbourhoods: <strong>Downtown</strong> with 500 homes, <strong>Riverside</strong> with 100 and <strong>Hillside</strong> with 400. Say downtown floods in a given year with probability p (start at 10%); riverside sits by the water and floods twice as often, hillside only 0.3 times as often. A flooded home loses 100k (k = thousand currency units). The plans: <strong>do nothing</strong>; <strong>A, a downtown levee</strong>, 2000k a year, cutting downtown losses by 90%; <strong>B, citywide flood-proofing</strong>, 2500k a year, cutting every home’s losses by 40%; <strong>C, riverside relocation plus a flood park</strong>, 5000k a year: the 100 riverside homes move and never flood again, but each family takes a hit from moving and leaving its neighbours (priced, for now, at 8k a year), and the empty riverbank becomes a park that soaks up water and cuts downtown losses by 30%. All 1000 homes split the cost evenly. A home’s <strong>burden</strong> is the sum of three things per year: expected flood loss + its share of the cost + moving hardship, in k per home per year. <strong>Expected flood loss</strong> = chance of flooding × 100k: what the home loses per year averaged over many years, not what happens in any one year. Every number here is invented for teaching.',
    c0a: 'Bar chart of each neighbourhood’s burden per home per year; bar width is the number of homes',
    c0title: 'Burden per home per year (k)',
    lgWidth: 'bar width = homes, area = neighbourhood total per year',
    lgFlood: 'Expected flood loss', lgTax: 'Share of the cost', lgHard: 'Moving hardship (priced)', lgNone: 'Burden if nothing is done (reference)', lgForced: 'Homes moved against their wishes',
    lgVol: 'C with voluntary moves (rule on)', lgMand: 'C with forced moves (books only)', lgMeanLine: 'Solid: town-wide average', lgWorstLine: 'Dashed: worst-off group',
    planNone: 'Do nothing', planA: 'A Levee', planB: 'B Flood-proofing', planC: 'C Relocation',
    pnNone: 'Nothing', pnA: 'A levee', pnB: 'B proofing', pnC: 'C relocate',
    grpD: 'Downtown', grpR: 'Riverside', grpRmove: 'River (moved)', grpRvol: 'River (agreed)', grpRstay: 'River (stayed)', grpH: 'Hillside',
    hh: '{n} homes',
    s0readout: '{plan} (p = {p}): {list} (k per home per year). Town total {tot}k a year, {mean} per home on average; the heaviest burden falls on {worst}, {wv} per home.',
    s0hint: 'What to try: click “Do nothing” first and note the three bar heights (the grey dashed outlines stay put as a reference), then click A, B and C in turn. Watch three things: which neighbourhood’s bar gets shorter, how thick the orange cost layer is, and on whom the violet moving hardship lands. A bar’s area is that neighbourhood’s yearly total, so a small drop on a wide bar (downtown, hillside) moves the town total a lot.',

    s1k: 'Step 1 · The consequences lens',
    s1t: 'Looking only at the town total, which plan wins, and how much does that hang on p?',
    s1e: 'The question for this step: if all you care about is the lowest average burden per home, which plan do you pick? This is the <strong>consequences lens</strong>: add up everyone’s burden, divide by the number of homes, choose the smallest. The flood part of the burden is an <strong>expected value</strong>: in any one year a home either floods (losing 100k) or does not (losing nothing), and weighting the two by their chances gives p × 100 (<a class="xlink" href="../../../probability/basics/expected-value/#step2">→ Expected value, step 2: why an expectation is a long-run average</a>). But p itself is an estimate. The horizontal axis is the chance p that downtown floods in a year; the vertical axis is the average burden per home in k per year; each line is one plan. The cost does not depend on p and the flood loss grows in proportion to it, so every line is straight: its starting height is the cost and its slope is the flood risk left over.',
    c1a: 'Line chart of each plan’s town-wide average burden against the flood probability p',
    c1title: 'Town-wide average burden (k per home per year) against p',
    pSlider: 'Chance downtown floods in a year, p',
    s1readout: 'p = {p}: average burden from lowest to highest: {order}. On totals alone the best is {best}. The do-nothing and A lines cross at p = {cross}: below that, the flood losses a levee saves do not cover what it costs.',
    s1hint: 'What to try: drag p slowly from 2% to 30% and watch whether the lowest line changes hands. Then look at C. It costs the most and never leads under this lens, yet it is the plan that helps riverside most. Adding everything up hid that; the next step uses a different lens.',

    s2k: 'Step 2 · The distribution lens',
    s2t: 'If you care more about the people who are worst off, does the answer change?',
    s2e: 'The question for this step: with the same plans, how does the ranking move once the group with the heaviest burden counts too? The <strong>distribution lens</strong> asks not how much in total but on whom it lands. We use the simplest possible score: <strong>score = (1 − λ) × town-wide average burden + λ × burden per home in the worst-off group</strong>, lower is better. <strong>λ (the weight)</strong> is a value choice, not a fact: λ = 0 looks only at the average (the consequences lens of step 1), and λ = 1 looks only at the worst-off group, close to the philosopher John Rawls’s “maximin” principle (<a class="xlink" href="../../../psychology/ethics/veil-of-ignorance/#step2">→ Veil of ignorance, step 2: why some argue you should look at the worst position first</a>). Each dot is a plan: across is the town-wide average burden, up is the burden per home in the worst-off group, both in k per home per year. Smaller is better on both, so lower-left is better. p comes from the step 1 slider.',
    c2a: 'Scatter plot of the four plans by average burden and worst-off burden, with equal-score lines for the current weight',
    c2title: 'Across: average burden · Up: worst-off burden',
    lamSlider: 'Weight on the worst-off group, λ',
    s2readout: 'p = {p}, λ = {lam}: scores {order}. Best right now: {best}. At this p, as λ goes from 0 to 1 the winner runs {seq}.',
    s2hint: 'What to try: keep p fixed and drag λ from 0 to 1. The slanted lines are equal-score lines: every point on one line has the same score, and the bigger λ, the flatter they lie and the more they reward a low position on the vertical axis. The solid one passes through the winner; every other plan’s dashed line lies above and to the right of it (a higher score). Watch A: it has the lowest average, yet riverside ends up worse off than with no plan at all, because it now pays for a levee that does not protect it. Raise λ a little and A loses the lead.',

    s3k: 'Step 3 · The consent lens',
    s3t: 'If everyone comes out ahead on paper, may you decide for them?',
    s3e: 'The question for this step: plan C needs riverside families to move. If some do not want to, should that count as one more “cost”, or should forced moving simply be off the table? Let q be the share of riverside families willing to move. With <strong>books only</strong>, C moves all 100 homes, so the (1 − q) who refuse are moved anyway. With <strong>the rule on</strong>, C becomes voluntary: only the willing move, those who stay still face floods, and the park and the cost shrink in proportion to how many leave. <strong>Consent</strong> here means the people affected say yes themselves. Treating “do not override people’s wishes” as a <strong>hard constraint</strong> means an option that breaks it is not compared at all, however good its other numbers; it does not just lose a few points. The top panel shows each group’s burden per home under C (width = homes, pink hatching = homes moved against their wishes). The bottom panel plots C’s burden against q: solid is the town-wide average, dashed is the worst-off group; orange is the voluntary version, pink the forced one.',
    c3a: 'Top: burden per group under plan C. Bottom: C’s average and worst-off burden against the willing share q',
    c3top: 'Burden per home per year under plan C (k)',
    c3bot: 'C’s burden (k per home per year) against q',
    ruleOff: 'Books only: move them anyway', ruleOn: 'Rule on: no overriding',
    qSlider: 'Share of riverside families willing to move, q',
    s3readoutOff: 'Books only, q = {q}: all 100 homes move, {forced} of them against their wishes. C’s town-wide average burden is {mean}; the worst-off group carries {worst} per home ({worstName}). Note that neither number depends on q: the books cannot see who was forced.',
    s3readoutOn: 'Rule on, q = {q}: {moved} homes choose to move, {stay} stay, nobody is forced. C’s town-wide average burden is {mean}; the worst-off group carries {worst} per home ({worstName}). The forced version has {mMean} and {mWorst}.',
    s3hint: 'What to try: choose “Books only” and drag q. The pink hatching in the top panel grows and shrinks, but the two pink lines below do not move at all: the books do not record how many people were forced. Then choose “Rule on” and drag q. The orange lines follow q. At the default p = 10%, as long as anyone stays, the families who stay are the worst-off group: they still flood and they pay a bigger share of the cost, so the orange dashed line actually rises with q. At q = 100% nobody stays and the two versions have identical numbers; the only difference is whether anyone was forced. This switch also decides which version of C steps 4 and 5 use.',

    s4k: 'Step 4 · A map of disagreement',
    s4t: 'Two people reach different verdicts. Do they disagree about facts or about values?',
    s4e: 'The question for this step: where does a disagreement come from? Put the two dials from earlier on one picture. Across is a <strong>factual judgement</strong>, p (how common you think floods are); up is a <strong>value judgement</strong>, λ (how much you weigh the worst-off group, as in step 2). Every point on the map is coloured by the plan that wins there under the step 2 score; where colours meet, the verdict flips. The white dot is where you stand now; move it with the sliders or by clicking the map. Three buttons jump to three invented residents. The consent rule from step 3 applies here too.',
    c4a: 'Map with flood probability p across and weight λ up, each point coloured by the winning plan',
    c4title: 'Up: weight λ (0 → 1) · Across: flood probability p',
    person0: 'Resident Ana', person1: 'Resident Ben', person2: 'Resident Cal',
    tag0: 'Ana', tag1: 'Ben', tag2: 'Cal',
    s4readout: 'At p = {p}, λ = {lam} ({rule}): the winner is {best}. {pm}{lm}',
    ruleOffShort: 'books only', ruleOnShort: 'consent rule on',
    s4pm: 'Changing only p, {pdir}. ',
    s4lm: 'Changing only λ, {ldir}.',
    flipBelow: 'going below {v} switches to {to}',
    flipAbove: 'going above {v} switches to {to}',
    flipNone: 'nothing in the whole range changes it',
    joinAnd: '; ', listSep: ', ', seqStep: ' → (from λ ≈ {v}) ',
    lgYou: 'Where you stand now', lgPeople: 'Three invented residents',
    s4hint: 'What to try: click the three residents in turn. Ana and Ben agree on how often it floods and differ on how much the worst-off matter; Ana and Cal weigh the worst-off equally and differ on floods. See which colour each one lands in. Then turn on the consent rule from step 3 (the buttons here work too) and watch C’s orange region disappear and who takes it over.',
    quizPrompt: 'Quick check: Ana picks A and Ben picks B. What is most worth their time to argue about?',
    quizA: 'Collecting ten more years of flood records to pin down p',
    quizB: 'How much weight the worst-off group deserves, that is, the value of λ',
    quizC: 'Whose arithmetic is wrong',
    check: 'Check',
    correct: 'Right. Ana and Ben share the same p and differ only in λ. Neither made an arithmetic slip, and more flood data would not bring them together. Their disagreement is about values, and laying it out is what tells them what to talk about.',
    wrong: 'Look at the map again: Ana’s and Ben’s dots sit one above the other, with exactly the same p. Data and arithmetic are not where they differ.',

    s5k: 'Step 5 · What is holding the verdict up',
    s5t: 'Which assumption, if it changed, would flip your verdict?',
    s5e: 'The question for this step: at the spot you chose in step 4, which assumptions does the verdict rest on? The method is a <strong>one-at-a-time sensitivity check</strong>: hold every other assumption still, slide one of them from its lowest to its highest value, and see whether the winner changes. Each row is one assumption; the strip is coloured by the winner at each value, and the white triangle marks the current value. A row in a single colour means that assumption does not matter within its plausible range; a colour change right next to the triangle means the verdict is leaning on it, and that is what to check first. p, λ and the consent rule come from step 4, q from step 3; the three sliders below are the assumptions that have stayed fixed until now.',
    c5a: 'Sensitivity strips for six assumptions: each row is coloured by the winning plan as that assumption varies',
    eASlider: 'How much the levee cuts downtown losses', mRSlider: 'How many times more often riverside floods', hmSlider: 'Moving hardship, priced (k per home per year)',
    reset5: 'Reset these three assumptions',
    rowP: 'Flood probability p (now {v})', rowLam: 'Weight λ (now {v})', rowEA: 'Levee loss cut (now {v})', rowMR: 'Riverside risk multiple (now {v})', rowHM: 'Moving hardship (now {v}k)', rowQ: 'Willing share q (now {v})',
    s5readout: 'Current winner: {best}. Assumptions that can flip it: {list}. Assumptions that never change it over their whole range: {flat}.',
    s5item: '{name} {dir}',
    s5none: 'none',
    nmP: 'p', nmLam: 'λ', nmEA: 'levee cut', nmMR: 'riverside multiple', nmHM: 'moving hardship', nmQ: 'q',
    s5hint: 'What to try: first find the rows that are a single colour. Arguing about those, however long, will not change the verdict. Then find rows where the triangle sits right next to a colour change; those deserve evidence first. Finally drag “riverside risk multiple”: the colour boundaries in the p and λ rows move with it, because every row is drawn with all the other assumptions held where they are.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Write the judgement so others can check it',
    s6fin: 'The thread. <strong>Step 0</strong> spread the burden across neighbourhoods to see who pays and who gains. <strong>Step 1</strong>: the consequences lens looks at the total only, and its answer moves with p. <strong>Step 2</strong>: the distribution lens brings in the worst-off group; λ is a value choice, and moving it moves the winner. <strong>Step 3</strong>: the consent lens is not one more score; it decides which options get compared at all, and the number of people forced never shows up in the books. <strong>Step 4</strong> put the factual judgement p and the value judgement λ on separate axes, so you can tell whether a disagreement calls for data or for a conversation about values. <strong>Step 5</strong> found the assumptions holding the verdict up, so you know what to check first.',
    formula: 'burden = expected flood loss + share of cost + moving hardship\nscore = (1 − λ)·average burden + λ·worst-off burden\noptions compared = plans that meet the hard constraints',
    boundary: 'Scope: the town, the plans and every number are invented for teaching and describe no real place or project. Burden counts only what can be priced; the 8k moving hardship is the planner’s guess, and because it is a guess the people affected need to speak for themselves. The score is the simplest of many possible distribution rules, and λ has no “correct” value. This page gives no moral, legal or policy advice. What it can do is help a judgement state what it assumes, what it values and which rule it will not break, so that others can check and challenge it point by point.',
    linksTitle: 'Where to go next',
    lk1: '→ Expected value, step 2: why an expectation is a long-run average',
    lk2: '→ Veil of ignorance, step 2: maximin and when it applies',
    lk3: '→ Signal detection, step 5: how the cost of mistakes sets where to draw the line',
    lk4: '→ Externalities, step 1: what happens when the bill lands on people who did not choose it',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Ethical Decisions · Make the Trade-off Visible”.'
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
  if (typeof window.refreshEthics === 'function') window.refreshEthics();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.ETHICS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
