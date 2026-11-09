'use strict';
// Externalities lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '外部性 · 没算进价格的那笔账',
    back: '← 知识索引',
    compare: '对照另一版本：外部性与公地悲剧 · 账记在谁头上 →',
    navLabel: '外部性步骤导航',
    tagline: '一家造纸厂每生产一吨纸，就往河里排一些废水，下游的渔场因此少打鱼。纸的买卖双方谈价格时，这笔损失不在任何一方的账上。七步里你会算出：这样的市场会多生产多少、浪费掉多少，一项税怎样把账拉回来，一片人人可用的草场为什么会被放牧过度，以及在什么条件下双方自己谈判就能解决。',
    nav0: '0 市场交点', nav1: '1 外部成本', nav2: '2 无谓损失', nav3: '3 庇古税', nav4: '4 公地', nav5: '5 谈判', nav6: '6 收束',

    s0k: '第 0 步 · 先只看买卖双方',
    s0t: '纸的市场会停在多少吨？为什么停在那里对买卖双方最好？',
    s0e: '这一步要回答：没有任何副作用时，市场产量为什么恰好让买卖双方的总收益最大？横轴是产量 Q（吨），纵轴是每吨的钱（元）。青线是<strong>边际收益</strong> MB = 100 − Q：买方对「第 Q 吨」最多愿付多少，越往后越低，因为最急需的用途先被满足。橙线是<strong>私人边际成本</strong> MPC = 20 + Q：工厂多造「第 Q 吨」要多花的钱。每多造一吨，买卖双方合起来净赚 MB − MPC；把这些逐吨的净赚加起来，就是上图两线之间的面积，叫<strong>总剩余</strong>（<a class="xlink" href="../../../math/applied/supply-demand/#step3">→ 供需页第 3 步：价格上下的面积都是收益</a>）。两线相交处 MB = MPC，此后每多一吨都得不偿失。',
    c0: '纸的市场：逐吨净收益与总剩余',
    c0a: '每吨的钱（元）随产量 Q（吨）变化',
    c0b: '产到 Q 吨时的总剩余（元）',
    lgMB: '边际收益 MB（买方愿付）', lgMPC: '私人边际成本 MPC', lgGain: '净赚的吨', lgLoss: '得不偿失的吨', s0lgDot: '试过的产量（下图）', lgMarket: '市场产量（上图白点）', lgOpt: '社会最优 Q*（绿点）',
    qSlider: '产量 Q（吨）', clearTrail: '清空试过的点',
    s0readout: '产到 Q = {q} 吨：最后这一吨，买方愿付 {mb} 元，造它要 {mpc} 元，这一吨净赚 {g} 元；从 0 吨累计的总剩余 {s} 元。',
    s0market: '市场自己会停在 MB = MPC 处：Q = {qm} 吨，价格 {pm} 元/吨；其中买方剩余 {cs} 元、卖方剩余 {ps} 元，合计 {smax} 元，是所有产量里最大的。',
    s0hint: '观察顺序：把产量从 0 慢慢拖到 80。上图绿色区域先变大（每吨都净赚），过了 40 吨开始出现红色（每吨都在亏）；下图白点先升后降，在 40 吨处最高。这一步还没有任何污染，结论只对「所有成本都由买卖双方承担」成立。',

    s1k: '第 1 步 · 账外的成本',
    s1t: '每吨纸给下游添一笔损失时，市场产量还对吗？',
    s1e: '这一步要回答：如果每生产一吨纸，下游渔场就损失 e 元，而工厂不用赔，会怎样？这种落在交易双方之外的人身上、却没有计入价格的成本，叫<strong>外部成本</strong>（这种现象叫<strong>外部性</strong>）。把它加到私人成本上，得到<strong>社会边际成本</strong> MSC = MPC + e（粉色虚线），也就是全社会为第 Q 吨付出的真实代价。工厂只看 MPC，所以产量仍停在 MB = MPC 的白点；全社会最好的产量在 MB = MSC 的绿点 Q*。上图斜线阴影是渔场承担的总损失。下图把市场生产的每一吨按「对全社会的净收益」= MB − MPC − e 画成一根柱：绿柱是值得生产的吨，粉柱是市场生产了、但全社会其实亏钱的吨。',
    c1: '外部成本：市场产量与社会最优产量',
    c1a: '加上外部成本：斜线阴影 = 渔场的总损失',
    c1b: '市场生产的每一吨，对全社会的净收益（元）',
    lgMSC: '社会边际成本 MSC', lgDamage: '渔场承担的损失', lgBarPos: '值得生产的吨', lgBarNeg: '不值得却被生产的吨',
    eSlider: '每吨的外部损失 e（元）',
    s1readout: 'e = {e}：市场产量 {qm} 吨，社会最优产量 Q* = {qs} 吨，多生产了 {n} 吨。渔场损失：市场下 {dm} 元，在 Q* 下 {ds} 元。扣掉损失后的全社会净收益：市场 {wm} 元，Q* 时 {ws} 元。粉柱合计 {red} 元。',
    s1hint: '观察顺序：先把 e 拖到 0：粉线与橙线重合，绿点与白点重合，没有粉柱。再把 e 慢慢加大：白点（市场产量）一动不动，绿点向左移，下图右端的粉柱越来越多、越来越深。粉柱合计正好等于两种产量下全社会净收益之差，下一步专门看它。这里假设每吨的损失 e 固定不变。',

    s2k: '第 2 步 · 浪费了多少',
    s2t: '多生产的那几吨，让全社会白白损失了多少？损失随 e 怎么长？',
    s2e: '这一步要回答：市场产量比 Q* 多出来的部分，造成多大的净损失？在 Q* 与市场产量之间，每多一吨，全社会付出的 MSC 都高于买方得到的 MB；两者之差加起来就是上图的红色三角形，叫<strong>无谓损失</strong>：没有任何人得到、纯粹浪费掉的价值。它的面积 = ½ × 底 × 高 = ½ × (多生产的吨数) × e，而多生产的吨数 = e / (b + d)，b、d 是需求线和供给线的斜率（这里 b = 1）。所以无谓损失 = e² / (2(b + d))：与 e 的平方成正比，<strong>e 翻倍，损失变成 4 倍</strong>。供给线越陡（d 越大），产量对成本越不敏感，多生产的吨数越少。',
    c2: '无谓损失随外部损失 e 和供给斜率 d 的变化',
    c2a: '红色三角形 = 无谓损失（供给斜率 d = {d}）',
    c2b: '无谓损失（元）随 e 变化',
    lgDWL: '无谓损失', s2lgCurve: '当前 d 的曲线 e²/(2(1 + d))', s2lgOld: '试过的其他 d',
    dSlider: '供给线斜率 d（元/吨²）',
    s2readout: 'e = {e}、d = {d}：市场 {qm} 吨，最优 {qs} 吨，多生产 {gap} 吨；无谓损失 = ½ × {gap} × {e} = {L} 元。若 e 减半到 {eh}，损失只有 {half} 元（四分之一）。',
    s2hint: '观察顺序：先保持 d = 1，把 e 从 0 拖到 40：三角形的底和高同时变长，下图白点沿抛物线上升，e = 20 时 100 元，e = 40 时 400 元。再改 d：白线换成新的抛物线，旧的变灰保留；d 越大抛物线越平。适用条件：线性需求与供给、每吨损失固定。',

    s3k: '第 3 步 · 庇古税',
    s3t: '对每吨纸征多少税，能让市场自己停在 Q*？',
    s3e: '这一步要回答：如果向工厂每吨征税 t 元，税额定多少全社会最好？征税后，工厂每多造一吨的成本变成 MPC + t（青色点线），市场停在 MB = MPC + t 处。把外部成本对应地征成税，叫<strong>庇古税</strong>。下图纵轴是全社会净收益 W = 买方剩余 + 卖方剩余 + 税收 − 渔场损失。税收只是从工厂转给政府，不算损失，所以算在 W 里（金色矩形）。W 最高的税额是 t = e：这时 MPC + t 与 MSC 重合，工厂按真实代价决策。税太低，仍生产过多；税太高，又把值得生产的吨也挡掉了，两种情况都留下红色无谓损失。',
    c3: '庇古税与全社会净收益',
    c3a: '征税 t：金色 = 税收，红色 = 无谓损失',
    c3b: '全社会净收益 W（元）随税额 t 变化 · e = {e}',
    lgTaxed: '含税成本 MPC + t', lgTe: '税额 t = e（下图）', lgRevenue: '税收', s3lgDot: '试过的税额',
    tSlider: '每吨税额 t（元）',
    s3readout: 't = {t}：产量 {q} 吨（最优 {qs} 吨），全社会净收益 {w} 元，最高可达 {wb} 元（t = {e} 时），差 {loss} 元；税收 {rev} 元。',
    s3exact: '税额正好等于每吨损失：产量就是 Q*，没有无谓损失。',
    s3low: '税额低于每吨损失：仍然生产过多。',
    s3high: '税额高于每吨损失：把值得生产的吨也挡掉了，生产过少。',
    s3hint: '观察顺序：e 先留在 20，把 t 从 0 拖到 60：上图青色点线升高，白点左移；红色三角先缩小，在 t = 20 消失，然后在另一侧重新长出来；下图白点描出一座山，山顶在绿线 t = e。再换一个 e（会清空白点）：山顶跟着移到新的 e。适用条件：每吨损失固定、政府知道 e；损失随产量变化时，税额应等于 Q* 处那一吨的损失。',

    s4k: '第 4 步 · 公地悲剧',
    s4t: '一片谁都能放牧的草场，牛为什么越放越多？',
    s4e: '这一步要回答：外部成本落在彼此身上时，每个人自己做的决定加起来会怎样？村里有一片草场，m 个牧人共用。草场上共有 N 头牛时，每头牛每年产出 100 − N 元（牛越多草越少），养一头的成本 20 元，所以每头牛净赚 80 − N 元。全村总利润 N(80 − N) 在 N = 40 头时最大，为 1600 元。但对单个牧人来说：多放一头，他自己拿到这头牛的全部收益，而「每头牛少赚 1 元」的代价大部分落在别人的牛上。这种人人可用、多用会损害别人的资源，叫<strong>公地</strong>；人人只为自己算账导致总体过度使用，叫<strong>公地悲剧</strong>。下面从「总共 40 头、平均分配」出发，牧人轮流把自己的头数改成「别人不变时对自己最划算」的数（这叫<strong>最佳回应</strong>）。最后谁也不想再改时，这个局面就是<strong>纳什均衡</strong>（<a class="xlink" href="../../../math/applied/game-theory/#step2">→ 博弈论第 2 步：谁单独换招都不会更好</a>），总头数为 80m/(m + 1)。',
    c4: '公地：每个牧人的头数与总头数的变化',
    c4a: '每个牧人的牛（头）：橙色是刚调整过的那位',
    c4b: '总头数 N 随轮次变化（每轮每人调一次）',
    s4lgBar: '各牧人的头数', s4lgMover: '刚调整的牧人', s4lgPath: '总头数 N', s4lgOpt: '全村最优 40 头', s4lgEq: '均衡 80m/(m+1)',
    mSlider: '牧人数 m', play4: '牧人轮流调整', step4b: '只走一轮', reset4: '回到合作水平',
    s4readout: '第 {r}/{R} 轮（已调整 {k}/{K} 次）：总头数 N = {N}，每头净赚 {per} 元，全村总利润 {tot} 元（最优 {opt} 元）。',
    s4eq: '{m} 个牧人的均衡：N = {eq} 头，总利润只有最优的 {sh}%。',
    s4why: '此刻牧人 {i} 若再多放一头：他自己的利润变化 {own} 元，全村总利润变化 {all} 元，其余 {oth} 头牛每头少赚 1 元，这部分他不承担。',
    s4hint: '观察顺序：m 先留在 5，按「牧人轮流调整」：上图橙色柱是正在调整的人，下图青线从绿线（40 头）一路爬向橙线（66.7 头），之后几乎不动，这就是均衡。读数里「他自己的利润变化」在均衡前是正的，而「全村总利润变化」是负的。再把 m 拖到 1、2、10、20 对比：m = 1 时正好停在 40；人越多，均衡越接近 80 头、总利润越接近 0。头数允许是小数（表示平均）。',

    s5k: '第 5 步 · 自己谈',
    s5t: '不靠政府，工厂和渔场能不能自己把事谈妥？',
    s5e: '这一步要回答：如果法律把「排放的权利」明确给某一方，双方能否通过付钱买卖这项权利，达到对双方总和最好的结果？设工厂开工（并排污）能多赚 G 元，渔场因此损失 D 元。对两方总和来说，G > D 时开工更好，G < D 时停工更好。<strong>科斯定理</strong>说：只要权利界定清楚、谈判本身几乎不花钱，无论权利给谁，双方都会谈出这个更好的结果，权利只决定谁付钱给谁。谈判要花的时间、律师费等叫<strong>交易成本</strong> T（这里双方各担一半）。只有改变结果的好处 |G − D| 大于 T，谈判才值得；否则结果就停在法律默认的那一方。付款取可谈范围的中点 (G + D)/2。第一张图：工厂有权排放；第二张图：渔场有权要求清水。横轴 G、纵轴 D，粉色 = 最后会排污，绿色 = 不排污，斜线带 = 因交易成本谈不成。',
    c5a: '工厂有权排放：横轴 G，纵轴 D',
    c5b: '渔场有权要清水：横轴 G，纵轴 D',
    s5lgPol: '最后排污', s5lgClean: '最后不排污', s5lgStuck: '谈不成，按权利定', s5lgNow: '当前的 G、D',
    gSlider: '工厂开工多赚 G（元）', dmgSlider: '渔场的损失 D（元）', tcSlider: '交易成本 T（元）',
    s5effPol: '对两方总和最好的是开工排污（G = {G} > D = {D}）。',
    s5effClean: '对两方总和最好的是停工不排（D = {D} > G = {G}）。',
    s5effTie: '开工与不开工对两方总和一样（G = D = {G}）。',
    rFactory: '工厂有权排放', rFishery: '渔场有权要清水',
    outPol: '排污', outClean: '不排污',
    dealFishPays: '渔场付给工厂 {pay} 元请它停工（各担交易成本 {T} 的一半）',
    dealFactPays: '工厂付给渔场 {pay} 元买下排污许可（各担交易成本 {T} 的一半）',
    stuck: '改变结果只多赚 {gap} 元，不超过交易成本 {T}，谈不成，按权利默认',
    noNeed: '默认结果已经最好，无需谈判',
    s5case: '【{who}】{what}：{how}。工厂净得 {f}，渔场净得 {s}，合计 {tot} 元。',
    s5hint: '观察顺序：先把 T 拖到 0：两张图的斜线带消失，粉绿分界都是对角线 G = D，两种权利下结果相同，读数里只是付款方向相反。再把 T 加大：对角线两侧出现斜线带，第一张图的带在对角线上方（本该停工却停不了），第二张图的在下方（本该开工却开不了）。把当前点拖进带里，看两种权利下的结果开始不同。',

    s6k: '第 6 步 · 收束', s6t: '把账算回价格里',
    s6fin: '回头看一遍。<strong>第 0 步</strong>：成本都由买卖双方承担时，市场停在 MB = MPC，总剩余最大。<strong>第 1 步</strong>：有外部成本 e 时，市场仍停在原处，而社会最优在 MB = MSC，于是多生产。<strong>第 2 步</strong>：多生产造成无谓损失 e²/(2(b + d))，与 e 的平方成正比。<strong>第 3 步</strong>：每吨征 t = e 的庇古税，让工厂面对真实代价，无谓损失消失。<strong>第 4 步</strong>：公地里每个人只承担自己造成损害的一部分，均衡头数 80m/(m + 1) 远超最优的 40。<strong>第 5 步</strong>：权利清楚、交易成本低时，双方自己谈也能到达更好的结果；交易成本高时，权利给谁就决定了结果。',
    formula: '市场：MB = MPC　社会最优：MB = MPC + e\n无谓损失 = e² / (2(b + d))\n庇古税 t* = e\n公地均衡 N = 80m / (m + 1)，最优 N* = 40',
    boundary: '适用范围：本页需求与供给都是直线，每吨的外部损失 e 固定且已知；现实中的损失往往随排放量上升、难以准确测量，这时最优税额是 Q* 处那一吨的损失，需要估计。第 3 步假设税收只是转移、征收本身不花钱。第 4 步的牧人对称、头数可取小数，调整按固定顺序轮流进行；均衡结论不依赖顺序，但收敛路径依赖。第 5 步只有两方，付款取中点只是众多可能分法之一；涉及很多受害者时，谈判成本通常很高，这正是需要税或管制的情形。',
    linksTitle: '接着去哪',
    lk1: '→ 供需，第 3 步：价格上下的面积为什么都是可计算的收益',
    lk2: '→ 供需，第 1 步：税在买方与卖方之间插入一个价格楔子',
    lk3: '→ 囚徒困境，第 0 步：每个人都选对自己最好的，结果对两人都更差',
    lk4: '→ 博弈论，第 2 步：纳什均衡，谁单独换招都不会更好',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《外部性与公地悲剧 · 账记在谁头上》的平行版本。'
  },
  en: {
    pageTitle: 'Externalities · The Cost Left Out of the Price',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Externalities & the Tragedy of the Commons · Who Pays the Bill →',
    navLabel: 'Externality steps',
    tagline: 'For every tonne of paper it makes, a mill pours waste water into the river, and the fishery downstream catches less. When buyers and sellers of paper agree a price, that loss is on nobody’s books. Over seven steps you will work out how much too much the market produces and how much value is wasted, how a tax pulls the bill back into the price, why a pasture open to all gets overgrazed, and when the two sides can fix things just by bargaining.',
    nav0: '0 Market', nav1: '1 External cost', nav2: '2 Deadweight loss', nav3: '3 Pigouvian tax', nav4: '4 Commons', nav5: '5 Bargaining', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Buyers and sellers only',
    s0t: 'How many tonnes does the paper market settle on, and why is that best for buyers and sellers?',
    s0e: 'This step asks: with no side effects at all, why does the market quantity give buyers and sellers the largest combined gain? Quantity Q (tonnes) runs across and money per tonne (yuan) runs up. The cyan line is <strong>marginal benefit</strong> MB = 100 − Q: the most buyers would pay for the Q-th tonne. It falls because the most urgent uses are served first. The orange line is <strong>private marginal cost</strong> MPC = 20 + Q: what the mill spends to make the Q-th tonne. Each extra tonne nets buyers and sellers MB − MPC together; adding those tonne-by-tonne gains gives the area between the lines, called <strong>total surplus</strong> (<a class="xlink" href="../../../math/applied/supply-demand/#step3">→ Supply and demand, step 3: the areas above and below the price are gains</a>). Where the lines cross, MB = MPC, and every tonne beyond costs more than it is worth.',
    c0: 'The paper market: gain per tonne and total surplus',
    c0a: 'Yuan per tonne against quantity Q (tonnes)',
    c0b: 'Total surplus (yuan) when Q tonnes are made',
    lgMB: 'marginal benefit MB (buyers’ willingness to pay)', lgMPC: 'private marginal cost MPC', lgGain: 'tonnes that gain', lgLoss: 'tonnes not worth making', s0lgDot: 'quantities tried (lower panel)', lgMarket: 'market quantity (white dot, upper panel)', lgOpt: 'social optimum Q* (green dot)',
    qSlider: 'Quantity Q (tonnes)', clearTrail: 'Clear tried points',
    s0readout: 'At Q = {q} tonnes: buyers would pay {mb} for the last tonne and it costs {mpc} to make, so that tonne gains {g}; total surplus from 0 up to here is {s}.',
    s0market: 'Left alone, the market stops where MB = MPC: Q = {qm} tonnes at {pm} per tonne. Buyers’ surplus {cs} plus sellers’ surplus {ps} makes {smax}, the largest of any quantity.',
    s0hint: 'What to try: slide the quantity slowly from 0 to 80. The green area grows (every tonne gains) until 40 tonnes, after which red appears (every tonne loses); the white dots below rise and then fall, peaking at 40. There is no pollution yet: this only holds when buyers and sellers bear every cost.',

    s1k: 'Step 1 · The cost off the books',
    s1t: 'If each tonne of paper adds a loss downstream, is the market quantity still right?',
    s1e: 'This step asks: what happens if every tonne of paper costs the fishery e yuan, and the mill does not have to pay? A cost that lands on people outside the deal and is left out of the price is an <strong>external cost</strong> (the effect is an <strong>externality</strong>). Add it to the private cost and you get the <strong>social marginal cost</strong> MSC = MPC + e (dashed pink): the full price society pays for the Q-th tonne. The mill only sees MPC, so output stays at the white dot where MB = MPC; the best output for society is the green dot Q*, where MB = MSC. The hatched area is the fishery’s total loss. Below, every tonne the market makes becomes a bar of its net value to society, MB − MPC − e: green bars are tonnes worth making, pink bars are tonnes the market makes even though society loses on them.',
    c1: 'External cost: market output against the social optimum',
    c1a: 'With the external cost: hatched = fishery’s loss',
    c1b: 'Net value to society of each tonne made (yuan)',
    lgMSC: 'social marginal cost MSC', lgDamage: 'loss borne by the fishery', lgBarPos: 'tonnes worth making', lgBarNeg: 'tonnes made but not worth it',
    eSlider: 'External loss per tonne e (yuan)',
    s1readout: 'e = {e}: the market makes {qm} tonnes, the social optimum is Q* = {qs}, so {n} tonnes too many. Fishery’s loss: {dm} at the market quantity, {ds} at Q*. Net value to society after the loss: {wm} at the market quantity, {ws} at Q*. Pink bars add up to {red}.',
    s1hint: 'What to try: first drag e to 0: the pink and orange lines coincide, the green and white dots meet, and there are no pink bars. Then raise e slowly: the white dot (market output) does not move, the green dot slides left, and pink bars pile up and deepen at the right end. The pink bars add up to exactly the difference in society’s net value between the two quantities; the next step looks at that number. The loss per tonne e is assumed constant.',

    s2k: 'Step 2 · How much is wasted',
    s2t: 'How much value do the extra tonnes destroy, and how does it grow with e?',
    s2e: 'This step asks: how large is the net loss from producing beyond Q*? Between Q* and the market quantity, each tonne costs society MSC, which is more than the MB buyers get from it; those gaps add up to the red triangle, called the <strong>deadweight loss</strong>: value that nobody receives, simply wasted. Its area is ½ × base × height = ½ × (extra tonnes) × e, and the extra tonnes = e / (b + d), where b and d are the slopes of the demand and supply lines (here b = 1). So the deadweight loss is e² / (2(b + d)): it grows with the square of e, so <strong>doubling e quadruples the loss</strong>. A steeper supply line (larger d) means output responds less to cost, so fewer extra tonnes are made.',
    c2: 'Deadweight loss against the external loss e and the supply slope d',
    c2a: 'Red triangle = deadweight loss (supply slope d = {d})',
    c2b: 'Deadweight loss (yuan) against e',
    lgDWL: 'deadweight loss', s2lgCurve: 'curve for current d, e²/(2(1 + d))', s2lgOld: 'other d values tried',
    dSlider: 'Supply slope d (yuan per tonne²)',
    s2readout: 'e = {e}, d = {d}: market {qm} tonnes, optimum {qs}, {gap} tonnes too many; deadweight loss = ½ × {gap} × {e} = {L}. Halve e to {eh} and the loss is only {half}, a quarter.',
    s2hint: 'What to try: keep d = 1 and drag e from 0 to 40. The triangle’s base and height grow together and the white dots climb a parabola: 100 at e = 20, 400 at e = 40. Then change d: the white curve is replaced, the old one stays in grey, and larger d gives a flatter parabola. Assumptions: straight demand and supply lines and a fixed loss per tonne.',

    s3k: 'Step 3 · A Pigouvian tax',
    s3t: 'What tax per tonne makes the market stop at Q* on its own?',
    s3e: 'This step asks: if the mill pays a tax of t yuan per tonne, which t is best for society? With the tax, each extra tonne costs the mill MPC + t (dotted cyan), and the market settles where MB = MPC + t. A tax set to match the external cost is a <strong>Pigouvian tax</strong>. The lower panel shows society’s net value W = buyers’ surplus + sellers’ surplus + tax revenue − fishery’s loss. Tax revenue just moves money from the mill to the government, so it counts in W rather than as a loss (gold rectangle). W peaks at t = e: then MPC + t lies on top of MSC and the mill decides on the true cost. Too low a tax still leaves too much output; too high a tax blocks tonnes that were worth making; both leave a red deadweight loss.',
    c3: 'A Pigouvian tax and society’s net value',
    c3a: 'Tax t: gold = revenue, red = deadweight loss',
    c3b: 'Society’s net value W (yuan) vs tax t · e = {e}',
    lgTaxed: 'cost with tax MPC + t', lgTe: 'tax t = e (lower panel)', lgRevenue: 'tax revenue', s3lgDot: 'taxes tried',
    tSlider: 'Tax per tonne t (yuan)',
    s3readout: 't = {t}: output {q} tonnes (optimum {qs}); society’s net value {w}, against a best of {wb} at t = {e}, a shortfall of {loss}; tax revenue {rev}.',
    s3exact: 'The tax equals the loss per tonne: output is exactly Q* and there is no deadweight loss.',
    s3low: 'The tax is below the loss per tonne: still too much output.',
    s3high: 'The tax is above the loss per tonne: tonnes worth making are blocked too, so output is too low.',
    s3hint: 'What to try: keep e at 20 and drag t from 0 to 60. The dotted cyan line rises and the white dot moves left; the red triangle shrinks, vanishes at t = 20, then grows again on the other side, while the white dots below trace a hill whose top sits on the green line t = e. Change e (this clears the dots): the hilltop moves to the new e. Assumptions: a fixed loss per tonne that the government knows; if the loss varied with output, the tax should equal the loss from the tonne at Q*.',

    s4k: 'Step 4 · The tragedy of the commons',
    s4t: 'Why does a pasture anyone may use end up with more and more cows?',
    s4e: 'This step asks: when people impose external costs on each other, where do their individual decisions add up to? A village shares a pasture among m herders. With N cows grazing, each cow yields 100 − N yuan a year (more cows, less grass) and costs 20 to keep, so each cow nets 80 − N. The village’s total profit N(80 − N) peaks at N = 40 cows, at 1600 yuan. But a single herder who adds a cow keeps that cow’s whole yield, while most of the cost, one yuan less from every cow, falls on other people’s cows. A resource open to all, where one person’s use harms the others, is a <strong>commons</strong>; overuse because everyone counts only their own gain is the <strong>tragedy of the commons</strong>. Below, we start from 40 cows split equally, and herders take turns setting their own herd to the size that pays them best if the others stay put (their <strong>best response</strong>). When nobody wants to change any more, that state is a <strong>Nash equilibrium</strong> (<a class="xlink" href="../../../math/applied/game-theory/#step2">→ Game theory, step 2: nobody gains by switching alone</a>), with 80m/(m + 1) cows in total.',
    c4: 'The commons: each herder’s cows and the total over time',
    c4a: 'Cows per herder: orange = just adjusted',
    c4b: 'Total cows N by round (each herder once per round)',
    s4lgBar: 'cows per herder', s4lgMover: 'herder who just adjusted', s4lgPath: 'total cows N', s4lgOpt: 'village optimum 40', s4lgEq: 'equilibrium 80m/(m+1)',
    mSlider: 'Number of herders m', play4: 'Herders take turns', step4b: 'One round only', reset4: 'Back to the cooperative level',
    s4readout: 'Round {r}/{R} ({k}/{K} adjustments): N = {N} cows, each nets {per}, village profit {tot} (best possible {opt}).',
    s4eq: 'Equilibrium with {m} herders: N = {eq} cows, total profit only {sh}% of the best.',
    s4why: 'Right now, if herder {i} added one more cow, their own profit would change by {own} while the village’s total would change by {all}; the other {oth} cows each lose 1 yuan, a cost they do not bear.',
    s4hint: 'What to try: leave m at 5 and press “Herders take turns”. The orange bar above is the herder adjusting; the cyan line below climbs from the green line (40 cows) up to the orange one (66.7) and then barely moves: that is the equilibrium. Before equilibrium the readout shows a positive change to the herder’s own profit and a negative change to the village’s total. Then compare m = 1, 2, 10, 20: with m = 1 it stays at 40; the more herders, the closer the equilibrium gets to 80 cows and the total profit to 0. Herd sizes may be fractional (read them as averages).',

    s5k: 'Step 5 · Bargaining it out',
    s5t: 'Without the government, can the mill and the fishery settle it themselves?',
    s5e: 'This step asks: if the law clearly gives one side the right in question, can the two sides buy and sell that right and reach the outcome that is best for them combined? Say running the mill (and polluting) earns it G yuan and costs the fishery D yuan. For the two together, running is better if G > D and stopping is better if G < D. The <strong>Coase theorem</strong> says that if rights are clear and bargaining costs next to nothing, the two sides reach that better outcome whoever holds the right; the right only decides who pays whom. The time, lawyers and haggling a deal takes are the <strong>transaction cost</strong> T (split equally here). A deal is worth making only if changing the outcome gains |G − D| > T; otherwise things stay where the law puts them. The payment is the middle of the bargaining range, (G + D)/2. First map: the mill has the right to pollute. Second map: the fishery has the right to clean water. G runs across, D up; pink = pollution in the end, green = none, hatched band = stuck because of the transaction cost.',
    c5a: 'Mill may pollute: G across, D up',
    c5b: 'Fishery owed clean water: G across, D up',
    s5lgPol: 'pollution in the end', s5lgClean: 'no pollution in the end', s5lgStuck: 'no deal, the right decides', s5lgNow: 'current G, D',
    gSlider: 'Mill’s gain from running G (yuan)', dmgSlider: 'Fishery’s loss D (yuan)', tcSlider: 'Transaction cost T (yuan)',
    s5effPol: 'Best for the two combined: run and pollute (G = {G} > D = {D}).',
    s5effClean: 'Best for the two combined: stop (D = {D} > G = {G}).',
    s5effTie: 'Running or not makes no difference to the two combined (G = D = {G}).',
    rFactory: 'Mill may pollute', rFishery: 'Fishery owed clean water',
    outPol: 'pollution', outClean: 'no pollution',
    dealFishPays: 'the fishery pays the mill {pay} to stop (each bears half of the transaction cost {T})',
    dealFactPays: 'the mill pays the fishery {pay} for permission to pollute (each bears half of the transaction cost {T})',
    stuck: 'changing the outcome gains only {gap}, not more than the transaction cost {T}, so no deal; the right decides',
    noNeed: 'the default is already best, no deal needed',
    s5case: '[{who}] {what}: {how}. Mill nets {f}, fishery nets {s}, together {tot}.',
    s5hint: 'What to try: first drag T to 0: the hatched bands vanish, both maps split pink from green along the diagonal G = D, and both rights give the same outcome; only the direction of payment flips in the readout. Then raise T: hatched bands open along the diagonal, above it on the first map (should stop but cannot) and below it on the second (should run but cannot). Drag the current point into a band and watch the two rights start to give different outcomes.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Putting the bill back into the price',
    s6fin: 'The thread, step by step. <strong>Step 0</strong>: when buyers and sellers bear every cost, the market stops at MB = MPC and total surplus is as large as it can be. <strong>Step 1</strong>: with an external cost e the market stays put while the social optimum moves to MB = MSC, so there is overproduction. <strong>Step 2</strong>: overproduction wastes a deadweight loss e²/(2(b + d)), growing with the square of e. <strong>Step 3</strong>: a Pigouvian tax of t = e per tonne makes the mill face the true cost, and the deadweight loss disappears. <strong>Step 4</strong>: on a commons each user bears only part of the harm they cause, and the equilibrium herd 80m/(m + 1) far exceeds the optimal 40. <strong>Step 5</strong>: with clear rights and cheap bargaining the two sides reach the better outcome on their own; with costly bargaining, who holds the right decides the outcome.',
    formula: 'Market: MB = MPC　Social optimum: MB = MPC + e\nDeadweight loss = e² / (2(b + d))\nPigouvian tax t* = e\nCommons equilibrium N = 80m / (m + 1), optimum N* = 40',
    boundary: 'Scope: demand and supply are straight lines here, and the external loss per tonne e is fixed and known. Real damage often rises with emissions and is hard to measure; then the best tax is the loss from the tonne at Q*, which must be estimated. Step 3 assumes tax revenue is a pure transfer and collecting it costs nothing. In step 4 herders are identical, herd sizes may be fractional, and they adjust in a fixed order; the equilibrium does not depend on the order, the path to it does. Step 5 has just two parties, and splitting at the midpoint is one of many possible splits; with many victims, bargaining usually becomes costly, which is exactly when taxes or regulation are needed.',
    linksTitle: 'Where to go next',
    lk1: '→ Supply and demand, step 3: why the areas above and below the price are measurable gains',
    lk2: '→ Supply and demand, step 1: a tax drives a price wedge between buyers and sellers',
    lk3: '→ Prisoner’s dilemma, step 0: each player picks what is best for them, and both end up worse off',
    lk4: '→ Game theory, step 2: Nash equilibrium, where nobody gains by switching alone',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Externalities & the Tragedy of the Commons · Who Pays the Bill”.'
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
  if (typeof window.refreshExternalities === 'function') window.refreshExternalities();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EXT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
