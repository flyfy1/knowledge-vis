'use strict';
// Carbon cycle lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '碳循环 · 多出来的碳往哪去、要多久',
    back: '← 知识索引',
    compare: '对照另一版本：碳循环 · 大气里的碳去了哪里 →',
    navLabel: '碳循环步骤导航',
    tagline: '空气每年和植物、海洋交换上百亿吨碳，人类排放只是其中一小份，却让空气里的 CO₂ 一路上涨。这一页用一个五库模型回答三个问题：交换这么快，为什么多出来的碳不会很快消失？排出去的碳有多少留在空气里、多少被陆地和海洋吸走？停止排放以后，浓度会怎样下降？',
    nav0: '0 账本', nav1: '1 分子与超额', nav2: '2 持续排放', nav3: '3 两个汇', nav4: '4 停止以后', nav5: '5 稳住浓度', nav6: '6 收束',

    s0k: '第 0 步 · 账本',
    s0t: '工业化以前，碳存在哪里，每年在哪些地方之间流动？',
    s0e: '这一步要回答：碳在地球表层各处有多少、流得多快？我们把碳所在的地方分成五个<strong>碳库</strong>：空气、植物、土壤、海洋表层（最上面几百米）和深海。数量用 <strong>GtC</strong>（十亿吨碳）计；空气里每 2.124 GtC 对应 1 <strong>ppm</strong>（百万分之一的体积比例），所以工业化前的 590 GtC 相当于约 278 ppm。箭头是每年的<strong>总流量</strong>：光合作用把碳从空气搬进植物，呼吸和分解又把它送回空气；CO₂ 不停地溶进海水、又从海水里逸出；表层海水下沉、深层海水上涌。每个库都是流入等于流出，所以存量不变。一个碳原子在某个库里平均待的时间叫<strong>周转时间</strong>，等于「存量 ÷ 每年流出量」。数字取自 IPCC 第六次评估报告碳循环示意图一类的全球估算并取整。',
    bAir: '空气', bPlants: '植物', bSoil: '土壤', bSurf: '海洋表层', bDeep: '深海',
    c0: '工业化以前的五个碳库（GtC）与每年的总流量（GtC/年）',
    s0lgSel: '选中的碳库及其进出流量', s0lgOther: '其他流量（越粗越大）',
    s0readout: '{box}：存量 {stock} GtC，每年流入 {in}、流出 {out} GtC，进出相等；一个碳原子在这里平均待 {tau} 年（{stock} ÷ {out}）。{extra}',
    s0air: '空气的 590 GtC 相当于约 {ppm} ppm。',
    s0hint: '观察顺序：依次点五个按钮，读周转时间：空气、植物、海洋表层只有三到六年，土壤约三十年，深海近四百年。记住空气的 3.4 年，下一步会说明：一个碳原子很快离开空气，并不等于多出来的碳也很快离开。',

    s1k: '第 1 步 · 分子与超额',
    s1t: '一个 CO₂ 分子在空气里只待几年，为什么多出来的 CO₂ 要几百年才降下来？',
    s1e: '这一步要回答：往空气里一次性加进一批碳以后，「这批原子本身」和「空气比原来多出的碳」，哪个消失得快？想象给这批碳原子做上记号。总流量每年把大量原子在空气、植物和海洋之间对调：做了记号的原子很快被换出去，但换回来的是别处的原子，空气里的碳总量并没有因此减少（这和饱和溶液里溶解和析出同时进行、浓度却不变是一个道理：<a class="xlink" href="../../../chemistry/solutions/dissolution-saturation/#step2">→ 溶解与饱和第 2 步：饱和以后，溶解停了吗</a>）。空气里多出来的碳要减少，靠的是<strong>净流量</strong>：吸进去的比放出来的多。而海洋表层吸了碳以后，它往外放 CO₂ 的本领涨得更快（第 3 步细说），植物也只多长一点，所以净吸收越来越弱。图的横轴是加入后的年数，纵轴是还剩百分之几：青线是做了记号的原子，橙线是多出来的碳。',
    pulseSize: '一次加入的碳（GtC）', playPulse: '从加入那一刻开始看',
    c1: '还剩百分之几（横轴：加入后的年数）',
    s1lgTag: '做了记号的那批原子还在空气里的比例', s1lgEx: '空气比原来多出的碳还剩的比例',
    s1readout: '加入 {P} GtC（约 {ppm} ppm）。第 {t} 年：做记号的原子还剩 {tag}%，多出来的碳还剩 {ex}%。10 年后分别为 {tag10}% 和 {ex10}%，100 年后为 {tag100}% 和 {ex100}%。',
    s1hint: '观察顺序：按「从加入那一刻开始看」，两条线从 100% 同时出发：青线十年内就掉到两成，橙线一百年后还剩两成多。再把加入量从 100 调到 2000 GtC：青线不变（原子交换只看总流量），橙线略微变高，前几十年最明显（加得越多，海洋越「吃不下」）。',

    s2k: '第 2 步 · 持续排放',
    s2t: '每年排放同样多的碳，空气里的 CO₂ 会怎样涨，碳都去了哪里？',
    s2e: '这一步要回答：持续排放时，排出的碳有多少留在空气里？近年人类每年排放的碳约 10 GtC。我们从工业化前的平衡状态出发，每年排放 E，连续 150 年。排出去的碳只有三个去处：留在空气里、被陆地（植物和土壤）吸走、被海洋吸走，三者加起来一定等于排放总量（碳不会凭空消失）。留在空气里的部分 ÷ 排放总量，叫<strong>空气滞留比例</strong>（airborne fraction）；观测到的长期平均约为 44%。上面的图横轴是年数、纵轴是空气中的 CO₂ 浓度（ppm）；下面的图把累计排放分成三层：空气、陆地、海洋。',
    eSlider: '每年排放 E（GtC/年）', ySlider: '读数年份', play150: '跑 150 年', s2clear: '清空旧线',
    c2a: '空气中的 CO₂ / ppm（横轴：年）', c2b: '累计排放的去向 / GtC（横轴：年）',
    s2lgNow: '当前 E', s2lgOld: '试过的 E', s2lgAir: '留在空气', s2lgLand: '陆地吸收', s2lgOcean: '海洋吸收',
    s2readout: 'E = {E} GtC/年，第 {t} 年：CO₂ {ppm} ppm；累计排放 {cum} GtC，其中空气 {air}、陆地 {land}、海洋 {ocean} GtC（合计 {sum}），空气滞留比例 {af}%。',
    s2zero: 'E = 0：没有排放，五个库保持工业化前的平衡，CO₂ 一直是 {ppm} ppm。',
    s2hint: '观察顺序：按「跑 150 年」，看上图的 CO₂ 线一路上升，下图三层一起变厚。然后把 E 改成 5 和 15 各跑一次，旧线会留下：排放翻倍，涨幅也接近翻倍，三种 E 的空气滞留比例几乎一样。再拖「读数年份」：比例在头几十年约五成，到第 150 年降到三成多，因为排放不变时，空气里多出来的碳越积越多，汇也吸得越来越多。现实中排放一直在增长，观测到的比例才大致稳定在 44% 左右。这是模型实验，不是对真实历史的预测。',

    s3k: '第 3 步 · 两个汇',
    s3t: '陆地和海洋为什么不能无限地吸收多出来的碳？',
    s3e: '这一步要回答：决定陆地和海洋吸收多少的，是哪两个数？能吸收多出来的碳的地方叫<strong>汇</strong>。海洋汇受<strong>缓冲因子</strong>（也叫 Revelle 因子，记作 ξ）限制：海水里溶解的碳每增加 1%，表层海水的 CO₂ 压力就升高约 ξ%，于是很快「顶住」空气，不再往里吸。原因是海水里大部分碳以碳酸氢根、碳酸根的形式存在，新进来的 CO₂ 要和碳酸根反应才能被「接住」，碳酸根用一点就少一点（<a class="xlink" href="../../../chemistry/solutions/buffer-capacity/#step0">→ 缓冲容量第 0 步：看是谁接住了外来的 H⁺</a>）。今天表层海水的 ξ 大约是 10；ξ = 1 表示「没有化学限制」，海水像对待记号原子一样照单全收。陆地汇受<strong>施肥效应</strong>系数 β 控制：CO₂ 多了，光合作用会快一些，增量按「β × 浓度的对数变化」计（<a class="xlink" href="../../../biology/cells/photosynthesis/#step3">→ 光合作用第 3 步：二氧化碳不够时，光再强也没用</a>）。图的横轴是缓冲因子 ξ，纵轴是「每年排放 10 GtC、持续 100 年」之后的空气滞留比例；三条线对应三个 β。',
    xiSlider: '海洋缓冲因子 ξ', betaSlider: '陆地施肥效应 β',
    c3: '100 年后的空气滞留比例 / %（横轴：缓冲因子 ξ）',
    s3lgBeta0: 'β = 0（植物不多长）', s3lgBetaNow: '当前 β', s3lgBeta6: 'β = 0.6（植物多长很多）',
    s3readout: 'ξ = {xi}、β = {beta}：100 年共排放 1000 GtC，空气留下 {air} GtC（{af}%），陆地吸收 {land}，海洋吸收 {ocean} GtC。默认 ξ = 10、β = 0.3 时空气留下 {afDef}%。',
    s3hint: '观察顺序：保持 β = 0.3，把 ξ 从 10 拖到 1：海洋没有化学限制时，空气只留下一成多；再拖到 15，空气留下四成多。然后把 β 调到 0，陆地不再额外吸收，三条线里最高的那条就是这种情况。真实的 ξ 会随海水吸碳而变大，模型里取常数，所以长期吸收量偏乐观。',

    s4k: '第 4 步 · 停止以后',
    s4t: '如果某一年起完全停止排放，CO₂ 会多快回到原来的水平？',
    s4e: '这一步要回答：排放停下来以后，空气里多出来的碳怎样减少？场景是每年排放 10 GtC，到第 T 年完全停止。停止后，海洋表层和植物继续吸收，所以浓度会下降；但表层海水很快和空气接近平衡，剩下的要等表层海水慢慢和深海交换（深海的周转时间近四百年）。图的横轴是从开始排放算起的年数（0–700），纵轴是空气中比工业化前多出的 CO₂（ppm）。',
    stopSlider: '第几年停止排放 T',
    c4: '空气中多出的 CO₂ / ppm（横轴：年）',
    s4lgEx: '多出的 CO₂', s4lgStop: '停止排放的那一年',
    s4readout: '第 {T} 年停止时，CO₂ {peak} ppm（多出 {ex} ppm）。停止后 50 年还剩多出部分的 {r50}%，200 年后 {r200}%，500 年后 {r500}%（{ppm500} ppm）。',
    s4hint: '观察顺序：保持 T = 100，看曲线在停止那年达到最高，前几十年下降得快，之后越来越平。把 T 往后拖，峰值更高，长尾也更高。模型没有算岩石风化和海底碳酸盐溶解，那些过程要几千到几十万年才能把剩下的部分进一步吸走。',

    s5k: '第 5 步 · 稳住浓度',
    s5t: '想让 CO₂ 停在某个值不再上涨，每年还能排放多少？',
    s5e: '这一步要回答：浓度到达某个目标值以后，要保持不变，排放要压到多少？要让空气里的碳不再增加，每年的排放必须正好等于陆地和海洋的净吸收。可这份净吸收会越来越小：海洋表层和植物逐渐跟上了更高的浓度，多吸的动力就弱了。场景是每年排放 10 GtC，直到浓度到达目标，此后排放等于当时的净吸收。上面的图是 CO₂ 浓度，下面的图是每年允许的排放（GtC/年）；两图横轴都是年数（0–500）。',
    targetSlider: '目标浓度（ppm）',
    c5a: '空气中的 CO₂ / ppm（横轴：年）', c5b: '每年允许的排放 / GtC 每年（横轴：年）',
    s5lgPpm: 'CO₂ 浓度', s5lgEmit: '允许的排放', s5lgHold: '到达目标、开始稳住的那一年',
    s5readout: '目标 {target} ppm：第 {held} 年到达。刚稳住时每年还能排 {e0} GtC，50 年后只能排 {e50}，200 年后只能排 {e200} GtC/年。',
    s5never: '目标 {target} ppm 低于或等于工业化前的 {pre} ppm，这个模型里不需要排放也到不了，换一个更高的目标。',
    s5hint: '观察顺序：把目标从 450 调到 550：到达得更晚，刚稳住时允许的排放也更多；但每条排放曲线都在稳住以后一路下滑。也就是说，「浓度不再上涨」不等于「排放不再增加」就够了，而是要求排放持续减少。',

    s6k: '第 6 步 · 收束', s6t: '把碳循环的账说给别人听',
    s6fin: '<strong>第 0 步</strong>：空气、植物、海洋表层之间每年交换上百 GtC，一个碳原子在空气里平均只待约 {tauAir} 年。<strong>第 1 步</strong>：可是空气里多出来的碳靠净流量才能减少，100 年后还剩约 {ex100}%，做了记号的原子却只剩约 {tag100}%。<strong>第 2 步</strong>：持续排放时，三到五成留在空气里，其余被陆地和海洋吸走。<strong>第 3 步</strong>：海洋的缓冲因子和植物的施肥效应决定了这两个汇有多强。<strong>第 4 步</strong>：停止排放后浓度先快后慢地下降，几百年后仍有三成左右的多余碳留在空气里。<strong>第 5 步</strong>：想稳住浓度，排放必须一路减少。',
    quizPrompt: '小测：往空气里一次性加入一批碳，100 年后，空气比原来多出的碳大约还剩多少？',
    quizA: '几乎为零，因为碳原子几年就换一遍', quizB: '大约四分之一', quizC: '几乎全部还在',
    check: '检查答案', correct: '对。模型里 100 年后还剩约 {ex}%；做了记号的原子只剩约 {tag}%，但「换走了原子」不等于「多出来的碳没了」。', wrong: '再看第 1 步的两条线：哪一条代表「多出来的碳」？100 年时它在哪里？',
    boundary: '适用范围：这是五个碳库、一阶交换的教学模型。存量和流量是取整的全球估算；植物呼吸的拆分和表层与深海的交换量是本页取的整数。缓冲因子和施肥系数取常数；没有气温对碳循环的反馈、海洋酸化对生物的影响、土地利用变化、岩石风化和海底沉积。曲线只说明趋势和量级，不是预测。',
    linksTitle: '接着去看',
    lk1: '→ 溶解与饱和，第 2 步：饱和以后溶解并没有停，只是进出相等',
    lk2: '→ 缓冲容量，第 0 步：是谁接住了外来的 H⁺ 和 OH⁻',
    lk3: '→ 气候反馈，第 1 步：排放不会全留在空气里，但留下一半也足以改变能量账本',
    lk4: '→ 地球能量收支，第 2 步：逃出去的热决定平衡温度',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《碳循环 · 大气里的碳去了哪里》的平行版本。'
  },
  en: {
    pageTitle: 'The Carbon Cycle · Where Extra Carbon Goes, and How Long It Takes',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Carbon Cycle · Where the Atmosphere’s Carbon Goes →',
    navLabel: 'Carbon cycle steps',
    tagline: 'Every year the air swaps more than a hundred billion tonnes of carbon with plants and the ocean. Human emissions are a small slice of that, yet CO₂ keeps climbing. Using a five-reservoir model, this page answers three questions: if the exchange is so fast, why doesn’t extra carbon disappear quickly? How much of what we emit stays in the air and how much do land and ocean take up? And once emissions stop, how does the concentration come down?',
    nav0: '0 The ledger', nav1: '1 Atoms vs excess', nav2: '2 Steady emissions', nav3: '3 Two sinks', nav4: '4 After stopping', nav5: '5 Holding steady', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The ledger',
    s0t: 'Before industry, where was the carbon kept, and where did it flow each year?',
    s0e: 'This step answers: how much carbon sits in each part of Earth’s surface system, and how fast does it move? We split carbon’s homes into five <strong>reservoirs</strong>: the air, plants, soil, the surface ocean (the top few hundred metres) and the deep ocean. Amounts are in <strong>GtC</strong> (billions of tonnes of carbon); in the air every 2.124 GtC equals 1 <strong>ppm</strong> (one part per million by volume), so the pre-industrial 590 GtC is about 278 ppm. Arrows are yearly <strong>gross flows</strong>: photosynthesis moves carbon from air into plants, while respiration and decay send it back; CO₂ keeps dissolving into seawater and escaping from it; surface water sinks and deep water wells up. Every reservoir gains exactly what it loses, so its stock stays the same. The average time a carbon atom spends in a reservoir is its <strong>turnover time</strong>, equal to “stock ÷ outflow per year”. The numbers are rounded global estimates of the kind shown in the IPCC Sixth Assessment Report’s carbon-cycle diagram.',
    bAir: 'Air', bPlants: 'Plants', bSoil: 'Soil', bSurf: 'Surface ocean', bDeep: 'Deep ocean',
    c0: 'Five pre-industrial reservoirs (GtC) and yearly gross flows (GtC/yr)',
    s0lgSel: 'Selected reservoir and its flows in and out', s0lgOther: 'Other flows (thicker = larger)',
    s0readout: '{box}: stock {stock} GtC, {in} GtC flows in and {out} GtC flows out each year, so in equals out; a carbon atom stays here {tau} years on average ({stock} ÷ {out}). {extra}',
    s0air: 'The air’s 590 GtC is about {ppm} ppm.',
    s0hint: 'What to try: press the five buttons in turn and read the turnover times: air, plants and surface ocean are only three to six years, soil about thirty, the deep ocean nearly four hundred. Remember the air’s 3.4 years; the next step shows that an atom leaving the air quickly does not mean extra carbon leaves quickly.',

    s1k: 'Step 1 · Atoms vs excess',
    s1t: 'A CO₂ molecule stays in the air only a few years, so why does extra CO₂ take centuries to come down?',
    s1e: 'This step answers: after a batch of carbon is added to the air in one go, which disappears faster, “those particular atoms” or “the air’s extra carbon”? Imagine tagging the batch. Each year the gross flows swap huge numbers of atoms between air, plants and ocean: tagged atoms are swapped out quickly, but other atoms come back in exchange, so the air’s total carbon does not drop because of it. (It is the same idea as a saturated solution, where dissolving and crystallising carry on while the concentration stays fixed: <a class="xlink" href="../../../chemistry/solutions/dissolution-saturation/#step2">→ Dissolution and saturation, step 2: does dissolving stop once a solution is saturated?</a>) The air’s extra carbon only falls through the <strong>net flow</strong>, taking in more than is given back. Once the surface ocean has absorbed some carbon its ability to push CO₂ back out rises even faster (step 3 explains why), and plants only grow a little more, so the net uptake keeps weakening. In the chart, years since the addition run across and the percentage left runs up: cyan for the tagged atoms, orange for the extra carbon.',
    pulseSize: 'Carbon added at once (GtC)', playPulse: 'Watch from the moment it is added',
    c1: 'Percentage left (across: years since the addition)',
    s1lgTag: 'Share of the tagged atoms still in the air', s1lgEx: 'Share of the air’s extra carbon still there',
    s1readout: 'Added {P} GtC (about {ppm} ppm). Year {t}: {tag}% of the tagged atoms and {ex}% of the extra carbon remain. After 10 years they are {tag10}% and {ex10}%; after 100 years {tag100}% and {ex100}%.',
    s1hint: 'What to try: press “Watch from the moment it is added”. Both lines start at 100%: the cyan one falls to a fifth within ten years, while the orange one still has over a fifth left after a century. Then change the batch from 100 to 2000 GtC: the cyan line does not move (swapping atoms depends only on the gross flows), but the orange line rises a little, most clearly in the first decades (the more you add, the less the ocean can swallow).',

    s2k: 'Step 2 · Steady emissions',
    s2t: 'Emit the same amount every year: how does CO₂ rise, and where does the carbon go?',
    s2e: 'This step answers: under steady emissions, how much of the carbon stays in the air? In recent years humans have emitted about 10 GtC a year. We start from the pre-industrial balance and emit E every year for 150 years. Emitted carbon has only three destinations: it stays in the air, is taken up by land (plants and soil), or by the ocean, and together they must equal the total emitted (carbon cannot vanish). The share that stays in the air ÷ the total emitted is the <strong>airborne fraction</strong>; the observed long-term average is about 44%. The top chart has years across and atmospheric CO₂ (ppm) up the side; the bottom chart splits the cumulative emissions into three layers: air, land and ocean.',
    eSlider: 'Emissions per year E (GtC/yr)', ySlider: 'Year to read', play150: 'Run 150 years', s2clear: 'Clear old lines',
    c2a: 'CO₂ in the air / ppm (across: years)', c2b: 'Where cumulative emissions went / GtC (across: years)',
    s2lgNow: 'This E', s2lgOld: 'E values tried', s2lgAir: 'Stayed in air', s2lgLand: 'Taken up by land', s2lgOcean: 'Taken up by ocean',
    s2readout: 'E = {E} GtC/yr, year {t}: CO₂ {ppm} ppm; {cum} GtC emitted in all, of which air {air}, land {land} and ocean {ocean} GtC (total {sum}); airborne fraction {af}%.',
    s2zero: 'E = 0: with no emissions the five reservoirs stay in their pre-industrial balance and CO₂ stays at {ppm} ppm.',
    s2hint: 'What to try: press “Run 150 years” and watch the CO₂ line climb in the top chart while all three layers thicken in the bottom one. Then run E = 5 and E = 15; the old lines stay. Doubling emissions nearly doubles the rise, and the airborne fraction is almost the same for all three values of E. Now drag “Year to read”: it does change with time, about half in the first decades, falling to a little over a third by year 150, because with steady emissions the air’s extra carbon keeps building up and the sinks take up more and more. Real emissions have kept growing, which is why the observed fraction has stayed roughly at 44%. This is a model experiment, not a forecast of real history.',

    s3k: 'Step 3 · Two sinks',
    s3t: 'Why can’t land and ocean keep soaking up extra carbon without limit?',
    s3e: 'This step answers: which two numbers decide how much land and ocean take up? A place that can absorb extra carbon is called a <strong>sink</strong>. The ocean sink is limited by the <strong>buffer factor</strong> (the Revelle factor, ξ): for every 1% rise in the carbon dissolved in seawater, the surface water’s CO₂ pressure rises by about ξ%, so it soon “pushes back” against the air and stops taking more. The reason is that most carbon in seawater is bicarbonate and carbonate; new CO₂ has to react with carbonate to be “caught”, and every bit of carbonate used up leaves less for the next (<a class="xlink" href="../../../chemistry/solutions/buffer-capacity/#step0">→ Buffer capacity, step 0: who catches the incoming H⁺</a>). Today’s surface ocean has ξ of about 10; ξ = 1 means “no chemical limit”, with seawater taking extra carbon as freely as it takes tagged atoms. The land sink is set by the <strong>fertilisation</strong> coefficient β: with more CO₂, photosynthesis runs a little faster, the increase being β × the change in the logarithm of the concentration (<a class="xlink" href="../../../biology/cells/photosynthesis/#step3">→ Photosynthesis, step 3: when CO₂ is short, more light doesn’t help</a>). The chart has the buffer factor ξ across and, up the side, the airborne fraction after emitting 10 GtC a year for 100 years; the three lines are three values of β.',
    xiSlider: 'Ocean buffer factor ξ', betaSlider: 'Land fertilisation β',
    c3: 'Airborne fraction after 100 years / % (across: buffer factor ξ)',
    s3lgBeta0: 'β = 0 (plants grow no extra)', s3lgBetaNow: 'This β', s3lgBeta6: 'β = 0.6 (plants grow much more)',
    s3readout: 'ξ = {xi}, β = {beta}: of the 1000 GtC emitted over 100 years the air keeps {air} GtC ({af}%), land takes {land} and ocean {ocean} GtC. With the defaults ξ = 10, β = 0.3 the air keeps {afDef}%.',
    s3hint: 'What to try: keep β = 0.3 and drag ξ from 10 down to 1: with no chemical limit on the ocean, the air keeps only a little over a tenth. Drag it to 15 and the air keeps over four in ten. Then set β to 0 so land takes up nothing extra; that case is the highest of the three lines. The real ξ grows as seawater absorbs carbon, but the model holds it constant, so its long-term uptake is on the optimistic side.',

    s4k: 'Step 4 · After stopping',
    s4t: 'If emissions stopped completely one year, how fast would CO₂ get back to where it was?',
    s4e: 'This step answers: once emissions stop, how does the air’s extra carbon decline? The scenario emits 10 GtC a year and stops completely in year T. After that the surface ocean and plants keep absorbing, so the concentration falls; but the surface water soon comes close to balance with the air, and the rest has to wait for the slow exchange between surface and deep water (the deep ocean’s turnover time is nearly four hundred years). The chart has years since emissions began across (0–700) and, up the side, how much CO₂ the air holds above the pre-industrial level (ppm).',
    stopSlider: 'Year emissions stop, T',
    c4: 'Extra CO₂ in the air / ppm (across: years)',
    s4lgEx: 'Extra CO₂', s4lgStop: 'The year emissions stop',
    s4readout: 'Stopping in year {T}: CO₂ is {peak} ppm ({ex} ppm extra). 50 years later {r50}% of the extra remains, after 200 years {r200}%, after 500 years {r500}% ({ppm500} ppm).',
    s4hint: 'What to try: keep T = 100. The curve peaks in the year emissions stop, falls quickly for a few decades and then flattens more and more. Drag T later and both the peak and the long tail rise. The model leaves out rock weathering and the dissolving of seafloor carbonate, which take thousands to hundreds of thousands of years to remove the remainder.',

    s5k: 'Step 5 · Holding steady',
    s5t: 'To stop CO₂ at a chosen level, how much could we still emit each year?',
    s5e: 'This step answers: once the concentration reaches a target, how low must emissions go to keep it there? For the air’s carbon to stop growing, each year’s emissions must exactly match the net uptake by land and ocean. But that net uptake keeps shrinking: the surface ocean and plants gradually catch up with the higher concentration, so their drive to absorb more fades. The scenario emits 10 GtC a year until the target is reached, then emits exactly the net uptake at that moment. The top chart shows CO₂; the bottom chart shows the emissions allowed each year (GtC/yr); both have years (0–500) across.',
    targetSlider: 'Target concentration (ppm)',
    c5a: 'CO₂ in the air / ppm (across: years)', c5b: 'Emissions allowed / GtC per year (across: years)',
    s5lgPpm: 'CO₂ concentration', s5lgEmit: 'Emissions allowed', s5lgHold: 'Year the target is reached and held',
    s5readout: 'Target {target} ppm: reached in year {held}. Right after that we may still emit {e0} GtC a year, 50 years on only {e50}, and 200 years on only {e200} GtC/yr.',
    s5never: 'A target of {target} ppm is at or below the pre-industrial {pre} ppm, which this model cannot reach without negative emissions; pick a higher target.',
    s5hint: 'What to try: move the target from 450 to 550. It is reached later, and the emissions allowed just after are larger; but every emissions curve keeps sliding down once the level is held. In other words, “CO₂ stops rising” does not just mean “emissions stop growing”: it requires emissions to keep falling.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Explain the carbon ledger',
    s6fin: '<strong>Step 0</strong>: air, plants and surface ocean swap over a hundred GtC a year, and a carbon atom stays in the air only about {tauAir} years on average. <strong>Step 1</strong>: but the air’s extra carbon falls only through net flows: after 100 years about {ex100}% is left, while only about {tag100}% of the tagged atoms remain. <strong>Step 2</strong>: under steady emissions a third to a half stays in the air and land and ocean take the rest. <strong>Step 3</strong>: the ocean’s buffer factor and the plants’ fertilisation response set how strong those two sinks are. <strong>Step 4</strong>: after emissions stop the concentration falls fast at first and then slowly, with around a third of the extra still in the air centuries later. <strong>Step 5</strong>: to hold the concentration steady, emissions must keep falling.',
    quizPrompt: 'Quick check: a batch of carbon is added to the air in one go. After 100 years, roughly how much of the air’s extra carbon is left?',
    quizA: 'Almost none, because carbon atoms are swapped within a few years', quizB: 'About a quarter', quizC: 'Nearly all of it',
    check: 'Check', correct: 'Right. In the model about {ex}% remains after 100 years; only about {tag}% of the tagged atoms do, but “the atoms were swapped” is not the same as “the extra carbon is gone”.', wrong: 'Look again at step 1’s two lines: which one is “the extra carbon”, and where is it at 100 years?',
    boundary: 'Scope: this is a teaching model of five reservoirs with first-order exchange. Stocks and flows are rounded global estimates; the split of plant respiration and the surface–deep exchange are this page’s round numbers. The buffer factor and fertilisation coefficient are held constant; there is no temperature feedback on the carbon cycle, no effect of ocean acidification on life, no land-use change, rock weathering or seafloor sediments. The curves show trends and sizes, not forecasts.',
    linksTitle: 'Where to go next',
    lk1: '→ Dissolution and saturation, step 2: dissolving does not stop at saturation; in and out just balance',
    lk2: '→ Buffer capacity, step 0: who catches the incoming H⁺ and OH⁻',
    lk3: '→ Climate feedback, step 1: emissions do not all stay in the air, but keeping half is enough to change the energy ledger',
    lk4: '→ Earth’s energy budget, step 2: the heat that escapes sets the balance temperature',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Carbon Cycle · Where the Atmosphere’s Carbon Goes”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
