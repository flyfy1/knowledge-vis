'use strict';
// Natural-selection lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '自然选择 · 树皮变黑，蛾子为什么跟着变黑',
    back: '← 知识索引',
    compare: '对照另一版本：自然选择 · 胡椒蛾的颜色为什么翻转 →',
    navLabel: '自然选择步骤导航',
    tagline: '十九世纪的英国工业城市里，煤烟把树皮熏黑，原本少见的黑色胡椒蛾几十年内变成了多数；空气治理之后，浅色蛾又回来了。没有谁「决定」变色，鸟只是吃掉看得见的蛾子。这一页用一个可以拆开的模型回答：要哪些条件、变得多快、能不能变回去，以及运气在其中占多少分量。',
    nav0: '0 鸟吃谁', nav1: '1 三个条件', nav2: '2 多快', nav3: '3 变回去', nav4: '4 运气', nav5: '5 收束',
    light: '浅色蛾', dark: '黑色蛾',

    s0k: '第 0 步 · 一个季节',
    s0t: '同一片树皮上，哪种颜色的蛾更容易被鸟吃掉？',
    s0e: '这一步要回答：环境怎样让不同颜色的蛾活下来的机会不同。胡椒蛾白天停在树干上，鸟靠眼睛找它们。本页把颜色记成从 0（很浅）到 1（全黑）的<strong>色调</strong>：浅色蛾 0.2，黑色蛾 0.85，树皮的色调由滑杆决定（长满浅色地衣的树皮约 0.15，被煤烟熏黑的约 0.85）。模型假设：蛾和树皮的色调差得越多，越显眼，一个季节里被吃掉的概率 = 0.6 × 色调差。于是每种蛾的<strong>存活率</strong>（一个季节后还活着的比例）= 1 − 0.6 × |蛾的色调 − 树皮色调|。颜色的差异最初来自 DNA 的突变（<a class="xlink" href="../../../biology/cells/dna-replication/#step4">→ DNA 复制页第 4 步：一个碱基改变会怎样</a>）。按「鸟来吃一个季节」，模拟 60 只蛾各自按存活率抽签。',
    barkSlider: '树皮色调（0 浅 → 1 黑）',
    hunt0: '鸟来吃一个季节', reset0: '放回全部蛾子',
    s0lgL: '浅色蛾（色调 0.2）', s0lgD: '黑色蛾（色调 0.85）', s0lgX: '红叉：被吃掉',
    c0title: '树皮上停着的 60 只蛾',
    s0readout: '树皮色调 {bark}：按模型，浅色蛾存活率 {wl}%，黑色蛾 {wd}%。',
    s0hunted: '这一季实际活下来：浅色 {sl}/{nl}（{pl}%），黑色 {sd}/{nd}（{pd}%）。只有 30 只一组，实测会在模型值上下波动。',
    s0equal: '树皮色调为 {eq} 时两种蛾一样显眼，存活率相同。',
    s0hint: '观察顺序：先把树皮拖到 0.15（地衣），按几次「鸟来吃」，被吃掉的大多是黑色蛾；再拖到 0.85（煤烟），按「放回」后再吃，情况反过来。',

    s1k: '第 1 步 · 三个条件',
    s1t: '黑色蛾一代代变多，需要哪些条件？少一个行不行？',
    s1e: '这一步要回答：把一个季节的差别累积成种群的变化，需要什么。设每一代：先被鸟吃一轮，活下来的蛾繁殖下一代，每只活下来的蛾留下的后代数相同。<strong>黑色蛾的比例</strong>（下文记作 p）从一代到下一代的变化是：p′ = p·w黑 ÷ (p·w黑 + (1 − p)·w浅)，w 是第 0 步的存活率。这里假设种群很大、不计偶然。三个开关对应自然选择的三个条件：<strong>有差异</strong>（种群里有两种颜色）、<strong>会遗传</strong>（后代和父母同色；关掉时后代是否黑色只看一个固定的背景概率，与父母无关）、<strong>存活有差别</strong>（关掉时两种蛾存活率相同）。曲线保留最近几次运行，便于对比。',
    condVar: '有差异', condHer: '会遗传', condSel: '存活有差别',
    p0Slider: '起始黑色蛾比例 p₀', barkSlider1: '树皮色调',
    play1: '繁殖 40 代',
    c1title: '黑色蛾比例 p（横轴：代）', c1strip: '当前这一代：每只蛾代表 5%',
    s1lgNow: '亮线：本次', s1lgOld: '暗线：之前几次',
    s1readout: '第 {g} 代：黑色蛾占 {p}%（起始 {p0}%）。{why}',
    s1all: '三个条件都在：存活率黑 {wd}% 对 浅 {wl}%，比例朝{dir}变化。',
    s1noVar: '没有差异：全是浅色，没有可以被「选」的对象。',
    s1noHer: '不遗传：每代活下来的黑色蛾虽然多，后代颜色却与父母无关，下一代又回到 {p0}%。',
    s1noSel: '存活没有差别：两种蛾一样容易被吃，比例保持不变。',
    s1equal: '这个树皮色调下两种蛾存活率几乎相同，比例基本不变。',
    dirUp: '增大', dirDown: '减小',
    s1hint: '观察顺序：先三个开关全开，按「繁殖 40 代」，看曲线从 {p0}% 爬升；再分别只关一个开关重跑，三次都变成平线。最后把树皮拖到 0.3 以下，看曲线往下走：选择的方向由环境决定。',

    s2k: '第 2 步 · 多快',
    s2t: '黑色蛾从 1% 变成 99%，要多少代？由什么决定？',
    s2e: '这一步要回答：变化的速度取决于什么。把两种蛾的存活率之比记作<strong>优势比</strong> r = w黑 ÷ w浅（r = 1.2 表示黑色蛾活下来的机会是浅色的 1.2 倍）。直接看比例 p 的曲线是一条 S 形；换成<strong>对数优势</strong> ln(p ÷ (1 − p))（黑色蛾数量是浅色的多少倍，再取自然对数）后，由第 1 步的式子可以推出：每过一代它正好加上 ln r，所以下半图是一条直线，斜率 ln r。从 1% 到 99%，对数优势要从 −4.6 涨到 +4.6，共 9.19，所需代数 = 9.19 ÷ ln r。',
    barkSlider2: '树皮色调（越黑，黑色蛾优势越大）',
    c2top: '黑色蛾比例 p（从 1% 起，横轴：代）', c2bot: '对数优势 ln(p ÷ (1 − p))',
    s2lgNow: '亮线：当前树皮', s2lgOld: '暗线：之前试过的树皮',
    s2readout: '树皮 {bark}：存活率 黑 {wd}% ÷ 浅 {wl}% = 优势比 r = {r}，ln r = {lnr}。从 1% 到 99% 需要 9.19 ÷ {lnr} ≈ {gens} 代。',
    s2history: '对照历史：曼彻斯特 1848 年首次记录到黑色型，1895 年前后约占 98%（常被引用的数字），约 {g} 代（胡椒蛾一年一代）。若假设 1848 年约占 1%，按本页的单基因模型粗算需要 r ≈ {rn}，即黑色蛾每代存活机会高约 {pct}%。',
    s2hint: '观察顺序：把树皮从 0.6 拖到 1，看 S 形越来越陡、下半图直线越来越斜；所需代数从 80 多代缩到十几代。注意：哪怕 r 只比 1 大一点，只要时间够长，结果也会翻转。',

    s3k: '第 3 步 · 变回去',
    s3t: '空气变干净以后，浅色蛾为什么又回来了？',
    s3e: '这一步要回答：环境先变黑、再变白，种群会不会跟着来回变，又会晚多久。上半图是树皮色调随年份的<strong>示意曲线</strong>（不是实测）：1850 年前长满浅色地衣，1850–1900 年被煤烟熏黑，1956 年英国通过《清洁空气法》后逐渐变浅。下半图用第 1 步的式子逐年计算黑色蛾比例（胡椒蛾一年一代），另外每代有万分之一的蛾因突变换成另一种颜色，所以少数颜色永远不会彻底消失。「捕食强度」就是第 0 步式子里的 0.6：鸟越挑剔，差别越大。<strong>滞后</strong>指树皮越过「两种蛾一样显眼」的色调（{eq}）之后，种群比例过半要再等多少年。',
    kSlider: '捕食强度（被吃概率 = 强度 × 色调差）', yearSlider: '年份',
    play3: '从 1800 年播放',
    c3top: '树皮色调（示意）', c3bot: '黑色蛾比例',
    s3lgBark: '上：树皮色调与它的颜色', s3lgEq: '虚线：两种蛾一样显眼的色调 / 比例 50%', s3lgP: '橙线：黑色蛾比例',
    s3readout: '{year} 年：树皮色调 {bark}，黑色蛾占 {p}%。',
    s3lag: '树皮在 {bu} 年变得「黑色更占便宜」，黑色蛾在 {pu} 年过半（晚 {lu} 年）；树皮在 {bd} 年转回，黑色蛾在 {pd} 年跌破一半（晚 {ld} 年）。',
    s3lagNoDown: '树皮在 {bu} 年变得「黑色更占便宜」，黑色蛾在 {pu} 年过半（晚 {lu} 年）；树皮在 {bd} 年转回，但到 2020 年黑色蛾仍未跌破一半。',
    s3hint: '观察顺序：按「播放」，先看橙线在树皮变黑后几十年才冲上去，又在树皮变白后才落下来；把捕食强度从 0.6 拖到 0.2 再播放，滞后明显变长。',

    s4k: '第 4 步 · 运气',
    s4t: '种群很小时，有优势的颜色也可能输掉吗？',
    s4e: '这一步要回答：前面的计算假设种群无限大，真实种群有限时，偶然性有多大分量。每一代，黑色蛾的后代比浅色多 s 倍（s = 0.02 即多 2%），然后从所有后代中<strong>随机</strong>抽出 N 只组成下一代。这种纯属抽样的波动叫<strong>遗传漂变</strong>。从 p = 10% 出发，每个种群最终要么黑色蛾全占（<strong>固定</strong>），要么黑色蛾消失（<strong>丢失</strong>）。图里每条线是一个种群；读数把累计结果和一个近似公式 (1 − e^(−2Nsp)) ÷ (1 − e^(−2Ns)) 对比。经验规则：N·s 远大于 1 时选择说了算，远小于 1 时运气说了算。',
    s4lgStart: '虚线：起始比例 10%', nSlider4: '种群大小 N', sSlider4: '黑色蛾的繁殖优势 s',
    run4: '再跑 20 个种群', clear4: '清空统计',
    c4title: '20 个种群的黑色蛾比例（横轴：代）',
    s4lgFix: '橙线：最终黑色固定', s4lgLost: '灰线：最终黑色丢失', s4lgOpen: '白线：{T} 代内未定',
    s4readout: 'N = {N}，s = {s}，N·s = {ns}。累计 {runs} 个种群：黑色固定 {fix} 个（{pf}%），丢失 {lost} 个{open}。近似公式给出的固定概率是 {u}%；如果没有优势（s = 0），固定概率就等于起始比例 10%。',
    s4open: '，{T} 代内未定 {o} 个',
    s4empty: 'N = {N}，s = {s}，N·s = {ns}：近似公式给出的固定概率是 {u}%。按「再跑 20 个种群」开始。',
    s4hint: '观察顺序：先用 N = 1000、s = 0.02（N·s = 20），绝大多数线升到 100%；再把 N 降到 10（N·s = 0.2），线乱跳，多数黑色蛾丢失，结果和 s = 0 差不多。',

    s5k: '第 5 步 · 收束',
    s5t: '自然选择，拆开来看',
    s5fin: '<strong>条件：</strong>有差异、会遗传、存活或繁殖有差别，三者缺一，比例就不会定向改变。<strong>方向：</strong>由环境决定：树皮黑时黑色占优，树皮白时浅色占优，环境回头，种群也跟着回头，并且有滞后。<strong>速度：</strong>对数优势每代加 ln r，从 1% 到 99% 需要约 9.19 ÷ ln r 代。<strong>运气：</strong>种群小时漂变能压过弱的优势，N·s 远大于 1 时选择才稳定起作用。没有谁「想要」变色：变化是存活和繁殖的统计结果。',
    quizPrompt: '小测：工业区黑色蛾变多，最准确的解释是哪一个？',
    quizA: '蛾子为了躲避鸟，主动把自己变黑，并把这种改变传给后代。', quizB: '黑色蛾在黑树皮上更不容易被吃，活下来的多、留下的后代多，后代也是黑色。', quizC: '煤烟让每只蛾的翅膀直接变黑。',
    check: '核对', correct: '对：变化发生在「哪些个体活下来繁殖」这一层，而不是个体自己改变。', wrong: '再看第 1 步：关掉「会遗传」或「存活有差别」，比例就不变。个体不会因为需要就改变颜色。',
    boundary: '模型的边界：把颜色当作一个基因、两种类型，不分显性隐性和二倍体；被吃概率与色调差成正比是本页的假设；第 3 步的树皮曲线是示意，不是测量数据；历史数字是常被引用的记录，其中「1848 年约占 1%」是本页的假设；关于胡椒蛾实验的细节曾有争论，后来的重复研究支持鸟类捕食是主要原因。第 4 步的公式是近似，N 很小时与模拟有偏差。',
    linksTitle: '接着看',
    lk1: '→ DNA 复制第 4 步：差异的源头——突变',
    lk2: '→ 减数分裂第 2 步：同一对父母怎样产生各不相同的后代',
    lk3: '→ 遗传与概率第 0 步：后代的等位基因从哪里来',
    lk4: '→ 种群生态第 2 步：捕食者与猎物的数量起伏',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《自然选择 · 胡椒蛾的颜色为什么翻转》的平行版本。'
  },
  en: {
    pageTitle: 'Natural Selection · The Bark Turned Black, and So Did the Moths',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Natural Selection · Why the Peppered Moth Flipped Colour →',
    navLabel: 'Natural selection steps',
    tagline: 'In the industrial towns of nineteenth-century Britain, soot blackened the tree bark, and the once-rare black peppered moth became the majority within decades; after the air was cleaned up, the pale moths came back. Nobody “decided” to change colour: birds simply ate the moths they could see. This page uses a model you can take apart to ask what conditions are needed, how fast the change runs, whether it can run backwards, and how much is down to luck.',
    nav0: '0 Who gets eaten', nav1: '1 Three conditions', nav2: '2 How fast', nav3: '3 Going back', nav4: '4 Luck', nav5: '5 Wrap-up',
    light: 'Pale moths', dark: 'Black moths',

    s0k: 'STEP 0 · ONE SEASON',
    s0t: 'On the same bark, which colour of moth is easier for a bird to find?',
    s0e: 'This step answers: how the surroundings give moths of different colour different chances of surviving. Peppered moths rest on tree trunks by day, and birds hunt them by sight. This page describes colour as a <strong>tone</strong> from 0 (very pale) to 1 (black): pale moths are 0.2, black moths 0.85, and the bark’s tone is set by the slider (lichen-covered bark is about 0.15, soot-blackened bark about 0.85). Model assumption: the bigger the tone difference between moth and bark, the more it stands out, and the chance of being eaten in one season = 0.6 × tone difference. So each kind’s <strong>survival rate</strong> (the share still alive after a season) = 1 − 0.6 × |moth tone − bark tone|. The colour difference itself first arose from a DNA mutation (<a class="xlink" href="../../../biology/cells/dna-replication/#step4">→ DNA Replication, step 4: what one changed base does</a>). Press “A season of birds” and each of 60 moths draws its fate by its survival rate.',
    barkSlider: 'Bark tone (0 pale → 1 black)',
    hunt0: 'A season of birds', reset0: 'Put all moths back',
    s0lgL: 'Pale moth (tone 0.2)', s0lgD: 'Black moth (tone 0.85)', s0lgX: 'Red cross: eaten',
    c0title: '60 moths resting on the bark',
    s0readout: 'Bark tone {bark}: by the model, pale moths survive {wl}% of the time and black moths {wd}%.',
    s0hunted: 'This season’s actual survivors: pale {sl}/{nl} ({pl}%), black {sd}/{nd} ({pd}%). With only 30 of each, the counts wobble around the model values.',
    s0equal: 'At a bark tone of {eq} both kinds stand out equally and survive equally.',
    s0hint: 'What to watch: set the bark to 0.15 (lichen) and press “A season of birds” a few times; most of the eaten moths are black. Set it to 0.85 (soot), put the moths back and hunt again: it flips.',

    s1k: 'STEP 1 · THREE CONDITIONS',
    s1t: 'What does it take for black moths to increase generation after generation — and can you drop one condition?',
    s1e: 'This step answers: what is needed to add one season’s difference up into a change in the whole population. Each generation, birds hunt once, the survivors breed, and every survivor leaves the same number of offspring. The <strong>black share</strong> (called p below) goes from one generation to the next as p′ = p·w_black ÷ (p·w_black + (1 − p)·w_pale), where w is the survival rate from step 0. The population is assumed to be very large, so chance plays no part here. The three switches are the three conditions for natural selection: <strong>variation</strong> (both colours exist), <strong>inheritance</strong> (offspring match their parents; when off, whether an offspring is black depends only on a fixed background chance, not on its parents), and <strong>unequal survival</strong> (when off, both kinds survive equally). The chart keeps the last few runs for comparison.',
    condVar: 'Variation', condHer: 'Inheritance', condSel: 'Unequal survival',
    p0Slider: 'Starting black share p₀', barkSlider1: 'Bark tone',
    play1: 'Breed 40 generations',
    c1title: 'Black share p (across: generation)', c1strip: 'This generation: each moth stands for 5%',
    s1lgNow: 'Bright line: this run', s1lgOld: 'Dim lines: earlier runs',
    s1readout: 'Generation {g}: black moths are {p}% (started at {p0}%). {why}',
    s1all: 'All three conditions hold: survival black {wd}% vs pale {wl}%, so the share moves {dir}.',
    s1noVar: 'No variation: every moth is pale, so there is nothing to select between.',
    s1noHer: 'No inheritance: more black moths survive each generation, but their offspring’s colour ignores the parents, so the next generation is back at {p0}%.',
    s1noSel: 'Equal survival: both kinds are eaten equally, so the share stays put.',
    s1equal: 'At this bark tone the two survival rates are almost equal, so the share barely moves.',
    dirUp: 'up', dirDown: 'down',
    s1hint: 'What to watch: with all three switches on, press “Breed 40 generations” and watch the curve climb from {p0}%. Then switch off one condition at a time and rerun: each time the line goes flat. Finally drag the bark below 0.3 and the curve heads down: the environment sets the direction.',

    s2k: 'STEP 2 · HOW FAST',
    s2t: 'How many generations to go from 1% black to 99%, and what decides it?',
    s2e: 'This step answers: what sets the pace. Call the ratio of the two survival rates the <strong>advantage</strong> r = w_black ÷ w_pale (r = 1.2 means a black moth’s chance of surviving is 1.2 times a pale one’s). The share p itself traces an S-curve. Switch to the <strong>log-odds</strong> ln(p ÷ (1 − p)) (how many times more black moths than pale, then the natural log) and the step-1 formula shows that it rises by exactly ln r every generation, so the lower chart is a straight line of slope ln r. From 1% to 99% the log-odds must climb from −4.6 to +4.6, a total of 9.19, so the generations needed = 9.19 ÷ ln r.',
    barkSlider2: 'Bark tone (darker = bigger advantage for black)',
    c2top: 'Black share p (starting at 1%, across: generation)', c2bot: 'Log-odds ln(p ÷ (1 − p))',
    s2lgNow: 'Bright line: current bark', s2lgOld: 'Dim lines: barks tried earlier',
    s2readout: 'Bark {bark}: survival black {wd}% ÷ pale {wl}% = advantage r = {r}, ln r = {lnr}. Going from 1% to 99% takes 9.19 ÷ {lnr} ≈ {gens} generations.',
    s2history: 'Against history: in Manchester the black form was first recorded in 1848 and made up about 98% by around 1895 (a commonly quoted figure), roughly {g} generations (peppered moths breed once a year). Assuming about 1% in 1848, this page’s one-gene model needs r ≈ {rn}, i.e. black moths surviving about {pct}% more often each generation.',
    s2hint: 'What to watch: drag the bark from 0.6 to 1. The S-curve steepens and the straight line tilts more; the generations needed shrink from over 80 to the teens. Note that even an r just above 1 flips the outcome, given enough time.',

    s3k: 'STEP 3 · GOING BACK',
    s3t: 'Once the air was clean, why did the pale moths come back?',
    s3e: 'This step answers: if the surroundings darken and then lighten again, does the population follow both ways, and how far behind? The upper chart is a <strong>sketch</strong> of bark tone by year (not measurements): lichen-pale before 1850, blackened by soot from 1850 to 1900, and lightening after the UK Clean Air Act of 1956. The lower chart applies the step-1 formula year by year (peppered moths breed once a year), plus one moth in ten thousand switching colour by mutation each generation, so the rarer colour never vanishes completely. “Predation strength” is the 0.6 in the step-0 formula: the choosier the birds, the bigger the difference. The <strong>lag</strong> is how many years pass after the bark crosses the “equally visible” tone ({eq}) before the share crosses one half.',
    kSlider: 'Predation strength (eaten chance = strength × tone difference)', yearSlider: 'Year',
    play3: 'Play from 1800',
    c3top: 'Bark tone (sketch)', c3bot: 'Black share',
    s3lgBark: 'Top: bark tone and its colour', s3lgEq: 'Dashes: the equally-visible tone / 50% share', s3lgP: 'Orange line: black share',
    s3readout: '{year}: bark tone {bark}, black moths {p}%.',
    s3lag: 'The bark started to favour black in {bu}; black moths passed one half in {pu} ({lu} years later). The bark turned back in {bd}; black moths fell below one half in {pd} ({ld} years later).',
    s3lagNoDown: 'The bark started to favour black in {bu}; black moths passed one half in {pu} ({lu} years later). The bark turned back in {bd}, but by 2020 black moths were still above one half.',
    s3hint: 'What to watch: press “Play”. The orange line only shoots up decades after the bark darkens, and only falls after the bark pales. Drag predation strength from 0.6 down to 0.2 and play again: the lag gets much longer.',

    s4k: 'STEP 4 · LUCK',
    s4t: 'In a small population, can the favoured colour still lose?',
    s4e: 'This step answers: the earlier sums assumed an infinite population — how much does chance matter when it is finite? Each generation black moths leave s times more offspring than pale ones (s = 0.02 means 2% more), then N moths are drawn <strong>at random</strong> from all the offspring to form the next generation. Wobble that comes purely from this sampling is <strong>genetic drift</strong>. Starting from p = 10%, every population eventually ends with black taking over completely (<strong>fixed</strong>) or vanishing (<strong>lost</strong>). Each line is one population; the readout compares the running tally with the approximate formula (1 − e^(−2Nsp)) ÷ (1 − e^(−2Ns)). Rule of thumb: when N·s is much bigger than 1 selection rules; when it is much smaller than 1 luck does.',
    s4lgStart: 'Dashes: starting share, 10%', nSlider4: 'Population size N', sSlider4: 'Breeding advantage of black s',
    run4: 'Run 20 more populations', clear4: 'Clear the tally',
    c4title: 'Black share in 20 populations (across: generation)',
    s4lgFix: 'Orange: black ends up fixed', s4lgLost: 'Grey: black ends up lost', s4lgOpen: 'White: undecided within {T} generations',
    s4readout: 'N = {N}, s = {s}, N·s = {ns}. {runs} populations so far: black fixed in {fix} ({pf}%), lost in {lost}{open}. The approximate formula gives a fixation chance of {u}%; with no advantage (s = 0) it would equal the starting share, 10%.',
    s4open: ', undecided within {T} generations in {o}',
    s4empty: 'N = {N}, s = {s}, N·s = {ns}: the approximate formula gives a fixation chance of {u}%. Press “Run 20 more populations”.',
    s4hint: 'What to watch: with N = 1000 and s = 0.02 (N·s = 20) nearly every line climbs to 100%. Drop N to 10 (N·s = 0.2): the lines jump about, black is mostly lost, and the result looks much like s = 0.',

    s5k: 'STEP 5 · WRAP-UP',
    s5t: 'Natural selection, taken apart',
    s5fin: '<strong>Conditions:</strong> variation, inheritance, and unequal survival or breeding; drop any one and the share stops moving in a direction. <strong>Direction:</strong> set by the surroundings: black wins on dark bark, pale wins on pale bark, and when the surroundings turn back, so does the population, with a lag. <strong>Pace:</strong> log-odds rise by ln r per generation, so 1% to 99% takes about 9.19 ÷ ln r generations. <strong>Luck:</strong> in small populations drift can swamp a weak advantage; selection only acts reliably when N·s is much bigger than 1. No moth “wants” to change colour: the change is a statistical result of who survives and breeds.',
    quizPrompt: 'Quick check: which is the most accurate explanation for black moths increasing in industrial areas?',
    quizA: 'Moths darkened themselves to hide from birds and passed that change on.', quizB: 'Black moths on black bark were eaten less, so more of them survived and bred, and their offspring were black too.', quizC: 'Soot turned each moth’s wings black directly.',
    check: 'Check', correct: 'Right: the change happens at the level of which individuals survive and breed, not individuals changing themselves.', wrong: 'Look at step 1 again: switch off inheritance or unequal survival and the share stops changing. Individuals do not change colour because they need to.',
    boundary: 'Where the model stops: colour is treated as one gene with two types, ignoring dominance and paired chromosomes; eaten chance proportional to tone difference is this page’s assumption; the step-3 bark curve is a sketch, not measured data; the historical figures are commonly quoted records, and “about 1% in 1848” is this page’s assumption; details of the classic peppered-moth experiments were disputed, and later repeat studies supported bird predation as the main cause. The step-4 formula is an approximation that drifts from the simulation when N is very small.',
    linksTitle: 'Where to next',
    lk1: '→ DNA Replication, step 4: where variation starts — mutation',
    lk2: '→ Meiosis, step 2: how the same parents produce different offspring',
    lk3: '→ Genetics & Probability, step 0: where offspring alleles come from',
    lk4: '→ Population Ecology, step 2: predator and prey numbers rising and falling',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Natural Selection · Why the Peppered Moth Flipped Colour”.'
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
  if (typeof window.refreshNatSel === 'function') window.refreshNatSel();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.NATSEL_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
