'use strict';
// Probability & frequency lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '概率与频率 · 一次说不准，很多次看得清',
    back: '← 知识索引',
    compare: '对照另一版本：概率与频率 · 转得越多，越贴近概率 →',
    navLabel: '概率与频率步骤导航',
    tagline: '一个转盘，几格红、几格白。转一次是红是白，谁也说不准；可是转上几千次，红色出现的比例会稳稳贴近一个数——这个数就是概率。这一页你会亲手转，看比例怎样从乱跳到安定、安定到什么程度，以及它为什么不需要「把多出来的补回去」。',
    nav0: '0 转一次', nav1: '1 十次一组', nav2: '2 一直转', nav3: '3 多少次才够', nav4: '4 连红之后', nav5: '5 补偿还是稀释', nav6: '6 反过来估计', nav7: '7 收束',

    s0k: '第 0 步 · 概率',
    s0t: '转一次，转出红色的可能性有多大？',
    s0e: '这一步要回答：转盘等分成 12 格，其中几格涂红；指针转一次，停在红色里的<strong>可能性</strong>有多大？我们假设这是<strong>理想转盘</strong>：指针停在圆周上任何位置的机会都一样。于是红色占圆周的几分之几，停在红色的可能性就是几分之几。这个「可能性的大小」叫<strong>概率</strong>，记作 P(红)，是 0 到 1 之间的数：0 表示不可能，1 表示一定。比如 4 格红，P(红) = 4/12 = 1/3（<a class="xlink" href="../../../math/arithmetic/fractions/#step2">→ 分数页第 2 步：为什么 4/12 和 1/3 是同一个数</a>）。但概率只说「有多大可能」，不说「这一次会怎样」。本页所有的转动都是电脑模拟的：用<strong>伪随机数</strong>（电脑按固定规则算出、看起来毫无规律的数）决定指针停在哪，模拟一个理想转盘。',
    lgRed: '红色扇形', lgWhite: '白色扇形', lgNeedle: '指针',
    redSlider: '红色格数（共 12 格）',
    spinOnce: '转一次', clearStrip: '清空结果',
    c0wheel: '转盘：指针停在哪里是随机的',
    c0strip: '最近 {n} 次结果（最新的在最右，带黄圈）',
    red: '红', white: '白',
    s0readout: '红色占圆周的 {frac}（{deg}° / 360°），所以 P(红) ≈ {p}，即 {pc}。',
    s0tally: '已转 {n} 次，最近一次是{last}，其中红 {r} 次。',
    s0none: '还没转过。',
    s0hint: '观察顺序：先保持红色格数不变，连按几次「转一次」，看下方那排小圆：红白的出现没有规律，你猜不中下一次。再拖「红色格数」：红色扇形变大，P(红) 跟着变大，可下一次仍然可能是白。改格数会清空那排结果（旧结果属于旧转盘）。第 1–5 步都用这里设的转盘。',

    s1k: '第 1 步 · 频率',
    s1t: '转 10 次，红色出现的比例会正好等于概率吗？',
    s1e: '这一步要回答：一次说不准，那转 10 次呢？把一组试验里红色出现的次数除以这组的总次数，得到的比例叫<strong>频率</strong>：频率 = 红色次数 ÷ 总次数。频率是<strong>做出来、数出来</strong>的，概率是<strong>看转盘事先算出来</strong>的。下图上方是正在转的这一组 10 次；转完后，这组的频率作为一个白点落到下方的数轴上（例如 3 次红 → 0.3）。橙色虚线是第 0 步算出的概率，淡橙色带是「离概率不超过 0.1」的范围。',
    s1lgDot: '一组 10 次的频率', lgP: '概率（第 0 步算出）',
    spinTen: '转 10 次（一组）', spinTwenty: '连做 20 组', clearGroups: '清空',
    c1top: '正在转的这一组：10 次（从左到右）',
    c1bot: '每组的频率（一个白点 = 一组 10 次）',
    s1none: '还没有做实验。按「转 10 次」开始。',
    s1cur: '这一组：红 {r} 次，频率 = {r} ÷ 10 = {f}。',
    s1spinning: '正在转：已转 {c}/10 次。',
    s1groups: '已做 {g} 组：频率最低 {lo}、最高 {hi}，其中 {near} 组离概率不超过 0.1。',
    s1exactYes: '恰好等于概率 {f} 的有 {e} 组。',
    s1exactNo: '没有一组能恰好等于 {frac}：10 次里红色次数只能是整数，频率只能是 0、0.1、…、1。',
    s1hint: '观察顺序：先按「转 10 次」，看 10 个圆一个个亮起，再看白点落在哪。然后按「连做 20 组」：白点堆起来，中间高、两边低，堆的中心在橙线附近，但总有几组离得很远。结论：只转 10 次，频率偏离概率 0.1、0.2 都很平常。「清空」只清这一步的点。',

    s2k: '第 2 步 · 越转越稳',
    s2t: '一直转下去，频率会怎样变化？',
    s2e: '这一步要回答：不分组，一直转，每转一次就重新算一次「到目前为止」的频率，它会怎样变化？蓝线就是这样一次长实验：横轴是已经转的次数 n，纵轴是前 n 次里红色的频率。横轴用的是<strong>对数刻度</strong>：1、10、100、1000、10000 等距排开，每一大格次数变成 10 倍，这样开头的乱跳和后面的安定都看得见。绿色<strong>漏斗</strong>是「概率 ± 2×√(p(1−p)/n)」的范围（p 是概率，n 是次数）：在任何一个固定的次数 n 上（n ≥ 30），频率落进漏斗的机会都在 94%～98% 之间——这是按公式精确算出的，对 1～11 格红都成立，不是这条线碰巧。漏斗越往右越窄：次数变成 4 倍，宽度变成一半（<a class="xlink" href="../../../probability/stochastic/monte-carlo/#step2">→ 蒙特卡洛页第 2 步：样本变 4 倍，误差减半</a>）。',
    s2lgPath: '当前这次长实验', s2lgOld: '之前的长实验', s2lgFunnel: '漏斗：概率 ± 2√(p(1−p)/n)',
    nSlider: '看第 n 次（对数刻度）',
    play2: '从第 1 次播放到第 10000 次', newPath: '再做一次长实验（旧线变灰保留）',
    c2title: '前 n 次里红色的频率',
    c2axis: '转的次数 n（对数刻度：每大格 ×10）',
    s2readout: '第 {n} 次时：红 {r} 次，频率 {f}，离概率差 {d}；这里的漏斗是 {lo}～{hi}，蓝线{where}。',
    inFunnel: '在漏斗内', outFunnel: '在漏斗外',
    s2olds: '画面上共 {k} 条长实验，在这个次数上有 {c} 条在漏斗内。',
    s2hint: '观察顺序：先按「播放」，盯住蓝线：开头几次上下猛跳（转 1 次时频率只能是 0 或 1），几百次以后贴着橙线小幅摆动。再拖「看第 n 次」，比较 10、100、1000 次时离概率差多少。然后按几次「再做一次长实验」：每条灰线开头走法都不一样，到右端却都挤进漏斗口。漏斗说的是「在某一个 n 上，大概率在里面」，一条线偶尔探出漏斗也是正常的。',

    s3k: '第 3 步 · 多少次才够',
    s3t: '要转多少次，频率才「几乎一定」靠近概率？',
    s3e: '这一步要回答：上一步看的是一条线。如果把「转 n 次」这个实验重做 500 组，这 500 个频率会怎样分布？蓝色柱子是模拟结果：柱高 = 频率落在那一小段里的组数占 500 组的比例。橙色轮廓是按公式精确算出的应有比例（不用模拟，只假设每次独立、红色概率都是 p；<a class="xlink" href="../../../probability/basics/binomial-normal/#step1">→ 二项分布页第 1 步：n 次里红几次的分布</a>）。淡橙色带是「离概率不超过 0.05」。读数里「中间 95% 的组」指：把 500 个频率从小到大排好，去掉最小的 2.5% 和最大的 2.5%，剩下的落在哪段范围；范围越窄，频率越集中。',
    s3lgSim: '模拟：500 组中的比例', s3lgExact: '公式精确值', s3lgOld: '之前拖过的档', s3lgBand: '概率 ± 0.05',
    groupSize: '每组转的次数 n（每档 ×4）',
    c3title: '500 组实验、每组转 {n} 次：频率的分布',
    c3axis: '频率 = 红色次数 ÷ 每组次数',
    s3readout: '每组 {n} 次、共 {G} 组：频率离概率不超过 0.05 的有 {c} 组（{cs}），精确计算应为 {ex}。中间 95% 的组落在 {lo}～{hi}，宽 {wd}。',
    s3ratio: '上一档 {pn} 次时宽 {pw}；次数 ×4 后，宽度变成原来的 {r} 倍（公式给出 {tr} 倍）。',
    s3hint: '观察顺序：保持转盘不变，从 20 次开始一档一档往右拖。看三件事：蓝柱越来越挤向橙线；淡橙带里的比例从 34.7%～59.5%（20 次，看红色格数）升到 99.9% 以上（1280 次起，1～11 格红都如此）；读数里每档宽度大约减半（模拟值在 0.41～0.61 倍之间，公式正好 0.5 倍）。灰色轮廓是你拖过的档，留作对比。',

    s4k: '第 4 步 · 没有记忆',
    s4t: '刚刚连出好几次红，下一次红色的概率会变小吗？',
    s4e: '这一步要回答：很多人觉得「已经连红 5 次了，该轮到白了」。真的吗？让电脑转 60000 次，再专门挑出「最近 k 次全是红」的那些时刻，看紧接着的下一次有多少是红。每根蓝柱对应一个 k：柱高 = 这些时刻里下一次是红的<strong>频率</strong>（红色次数 ÷ 时刻数），柱下小字是这种时刻一共有几个。灰色工字线是「假如下一次和过去无关，频率大约会落在的范围」：概率 ± 2×√(p(1−p)/时刻数)，时刻越少范围越宽。理想转盘没有记忆，指针这次停在哪和上次停在哪毫无关系（模拟里也是每次重新取一个随机数）。所以这里检查的是：专门挑出连红之后的那一次，它的频率是不是仍然贴着概率。',
    s4lgBar: '下一次是红的频率', s4lgWhisk: '与过去无关时的大致范围',
    streakSlider: '最近连续红的次数 k', newSeq: '换一串 60000 次',
    c4title: '最近连续 k 次红之后，下一次也是红的频率',
    c4axis: 'k = 最近连续红的次数（小字：这种时刻有几个）',
    s4all: '不加条件（k = 0，所有 {m} 次）：红 {r} 次，频率 {f}；概率是 {p}。',
    s4readout: '最近连续 {k} 次红的时刻共 {m} 个，紧接着的下一次是红的有 {r} 个，频率 {f}；概率是 {p}。假如下一次和过去无关，频率大约会在 {lo}～{hi} 之间。',
    s4none: '这串 {N} 次里，一次也没出现过连续 {k} 次红，没法统计。按「换一串」或在第 0 步把红色格数调大试试。',
    s4hint: '观察顺序：保持转盘不变，把 k 从 0 拖到 6。所有蓝柱都在橙线附近，并没有越来越矮；k 越大，柱下的时刻数越少，柱子越容易偏，但大多仍在灰色工字线里（偶尔出界也是随机的正常表现）。再按「换一串」，看另一串随机数是否给出同样的结论。',

    s5k: '第 5 步 · 稀释，不是补偿',
    s5t: '红色多出来的次数，后来会被「补回去」吗？',
    s5e: '这一步要回答：频率越来越靠近概率，是不是因为前面多出的红色，被后面多出的白色抵消了？用第 2 步的同一条长实验，分开看两种「差」。<strong>次数差</strong> = 实际红色次数 − 按概率「应有」的次数 n×p，单位是「次」；<strong>频率差</strong> = 频率 − 概率 = 次数差 ÷ n。上图是次数差，下图是频率差，横轴都是转的次数 n（对数刻度）。绿色带是它们在每个 n 上大约 95% 的时候会落在的范围：次数差的带是 ±2×√(n×p(1−p))，随 n <strong>变宽</strong>；频率差的带是它再除以 n，随 n <strong>变窄</strong>。',
    s5lgCount: '次数差（上图）', s5lgFreq: '频率差（下图）', s5lgBand: '约 95% 范围',
    play5: '从第 1 次播放到第 10000 次',
    c5a: '次数差 = 红色次数 − n×p（单位：次）',
    c5b: '频率差 = 频率 − 概率 = 次数差 ÷ n',
    s5readout: '第 {n} 次：红 {r} 次，按概率应有 {e} 次，次数差 {g}；频率差 = 次数差 ÷ {n} = {d}。此刻次数差的带是 ±{cb} 次，频率差的带是 ±{fb}。',
    s5hint: '观察顺序：按「播放」，同时看上下两张图里的竖线。上图的橙线并不回到 0：多出来的红色次数没有被「还回去」，反而常常摆得越来越远（带子在变宽）。下图的蓝线却越来越贴近 0：同样大小的次数差，被越来越大的 n 去除。结论：频率靠近概率靠的是「稀释」，不是「补偿」。在第 2 步按「再做一次长实验」换一条线，结论不变。',

    s6k: '第 6 步 · 反过来用',
    s6t: '看不见转盘，只看转出的结果，能估计出概率吗？',
    s6e: '这一步要回答：现实里很多概率没法事先算——一枚图钉落地钉尖朝上的概率、一台机器出次品的概率。办法反过来：多做几次，用频率去<strong>估计</strong>概率。这里有一个盖住的转盘，红色占多少你不知道（不一定是 12 格里的整数格）。每按一次按钮就再转一批，「估计的概率与大致范围」图记下每次按完后的估计：白点 = 到目前为止的频率，工字线 = 大致范围「频率 ± 2×√(频率×(1−频率)/n)」，n 是已转次数。这个范围是用数据算的，不保证一定盖住真值：转到 100 次以上，它盖住真值的机会约 93%～96%（对本页 5 个转盘精确算过）；只转 10 次时，可能低到 84%。',
    c6a: '盖住的转盘', c6b: '估计的概率与大致范围（随次数 n）',
    c6hidden: '盖住的转盘：红色占多少？', c6open: '揭晓后的转盘',
    s6lgEst: '估计：到目前为止的频率', s6lgRange: '大致范围', s6lgTrue: '揭晓后的真实概率',
    spin10: '再转 10 次', spin100: '再转 100 次', spin1000: '再转 1000 次', reveal: '揭晓真实值', nextWheel: '换一个盖住的转盘',
    s6none: '转盘 {which}：还没转。先按「再转 10 次」。',
    s6readout: '转盘 {which}：已转 {n} 次，红 {r} 次，估计概率 ≈ {f}，大致范围 {lo}～{hi}。',
    s6reveal: '揭晓：真实概率是 {p}，这次的范围{res}。按真实值精确算，转 {n} 次时这种范围盖住真值的机会是 {c}。',
    covered: '盖住了真值', missed: '没盖住真值（这种情况本来就会偶尔发生）',
    s6hint: '观察顺序：先只按「再转 10 次」两三下，看工字线很长、白点跳得厉害；再按几次「再转 1000 次」，看工字线缩短、白点稳下来。心里有了答案后按「揭晓真实值」，橙色虚线就是真值。「换一个盖住的转盘」会清掉全部结果，换一个新的真值。',

    s7k: '第 7 步 · 收束',
    s7t: '一次说不准，很多次看得清——还要说清多少次、多准',
    s7fin: '<strong>概率</strong>是一次结果的可能性大小，能从转盘的形状事先算出；<strong>频率</strong>是做了 n 次之后数出来的比例。n 小时频率乱跳（第 1 步），n 越大越稳定地靠近概率（第 2、3 步），这个规律叫<strong>大数定律</strong>。靠近的方式是「稀释」而不是「补偿」：连红之后，下一次的概率不变（第 4 步）；多出来的次数也不会被还回去（第 5 步）。反过来，看不见概率时，可以用频率去估计它，并给出一个范围（第 6 步）。',
    formula: '频率 = 红色次数 ÷ n\n频率离概率的典型距离 ≈ 2×√(p(1−p)/n)：n ×4 → 距离 ÷2\n次数差的典型大小 ≈ 2×√(n×p(1−p))：随 n 变大',
    boundary: '适用条件：每次结果互不影响、每次的概率都一样（理想转盘）。本页数据全是电脑用固定种子的伪随机数模拟的，不是真实实验；「94%～98%」「93%～96%」这些数字由近似公式加精确计算得出，只对本页设定的转盘和次数核验过。真实转盘如果做得不均匀，概率就不再是格数之比，只能靠频率去估计。',
    linksTitle: '接着去哪',
    lk1: '→ 蒙特卡洛页第 2 步：样本变 4 倍，误差减半',
    lk2: '→ 二项分布到正态页第 1 步：钉板落球，n 次里成功几次的分布',
    lk3: '→ 期望页第 2 步：很多次的平均，靠近期望',
    lk4: '→ 中心极限定理页第 3 步：误差按 σ/√n 缩小',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《概率与频率 · 转得越多，越贴近概率》的平行版本。'
  },
  en: {
    pageTitle: 'Probability & Frequency · Unpredictable Once, Clear Over Many',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Probability & Frequency · The More Spins, the Closer to the Probability →',
    navLabel: 'Probability and frequency steps',
    tagline: 'A spinner with some red sectors and some white. Nobody can say whether the next spin lands on red. Spin it a few thousand times, though, and the share of reds settles onto one number: the probability. On this page you spin it yourself and watch that share go from jumpy to steady, measure how steady it gets, and see why nothing ever has to be “paid back”.',
    nav0: '0 One spin', nav1: '1 Groups of ten', nav2: '2 Keep spinning', nav3: '3 How many is enough', nav4: '4 After a streak', nav5: '5 Dilution', nav6: '6 Estimate it', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Probability',
    s0t: 'How likely is one spin to land on red?',
    s0e: 'The question here: the spinner is cut into 12 equal sectors and some are painted red. How <strong>likely</strong> is the pointer to stop on red after one spin? We assume an <strong>ideal spinner</strong>: the pointer is equally likely to stop anywhere around the circle. Then whatever fraction of the circle is red is also the chance of stopping on red. That chance is called the <strong>probability</strong>, written P(red): a number from 0 (impossible) to 1 (certain). With 4 red sectors, P(red) = 4/12 = 1/3 (<a class="xlink" href="../../../math/arithmetic/fractions/#step2">→ Fractions, step 2: why 4/12 and 1/3 are the same number</a>). A probability tells you how likely, not what this particular spin will do. Every spin on this page is simulated: <strong>pseudo-random numbers</strong> (numbers a computer produces by a fixed rule that look patternless) decide where the pointer stops, imitating an ideal spinner.',
    lgRed: 'red sectors', lgWhite: 'white sectors', lgNeedle: 'pointer',
    redSlider: 'Red sectors (out of 12)',
    spinOnce: 'Spin once', clearStrip: 'Clear results',
    c0wheel: 'Spinner: where the pointer stops is random',
    c0strip: 'Last {n} results (newest on the right, ringed in yellow)',
    red: 'red', white: 'white',
    s0readout: 'Red covers {frac} of the circle ({deg}° of 360°), so P(red) ≈ {p}, or {pc}.',
    s0tally: '{n} spins so far, the latest was {last}; {r} of them red.',
    s0none: 'No spins yet.',
    s0hint: 'What to try: keep the number of red sectors fixed and press “Spin once” several times. Watch the row of small circles: reds and whites come with no pattern, and you cannot call the next one. Then drag “Red sectors”: the red wedge grows and P(red) grows with it, yet the next spin can still be white. Changing the sectors clears the row (old results belong to the old spinner). Steps 1–5 all use the spinner you set here.',

    s1k: 'Step 1 · Frequency',
    s1t: 'Spin ten times. Does the share of reds equal the probability?',
    s1e: 'The question here: one spin is unpredictable, but what about ten? Divide the number of reds in a group of spins by the number of spins in that group and you get the <strong>frequency</strong>: frequency = reds ÷ spins. A frequency is <strong>counted after doing it</strong>; a probability is <strong>worked out beforehand from the spinner</strong>. The top of the chart shows the group of ten being spun; once it finishes, its frequency drops as a white dot onto the number line below (3 reds → 0.3). The dashed orange line is the probability from step 0, and the pale orange band marks “within 0.1 of the probability”.',
    s1lgDot: 'frequency of one group of 10', lgP: 'probability (from step 0)',
    spinTen: 'Spin 10 (one group)', spinTwenty: 'Run 20 groups', clearGroups: 'Clear',
    c1top: 'The group being spun: 10 spins, left to right',
    c1bot: 'Each group’s frequency (one dot = one group of 10)',
    s1none: 'No experiments yet. Press “Spin 10” to start.',
    s1cur: 'This group: {r} reds, frequency = {r} ÷ 10 = {f}. ',
    s1spinning: 'Spinning: {c}/10 done. ',
    s1groups: '{g} groups so far: lowest frequency {lo}, highest {hi}; {near} of them within 0.1 of the probability. ',
    s1exactYes: '{e} groups hit the probability {f} exactly.',
    s1exactNo: 'No group can ever equal {frac} exactly: the number of reds in 10 spins is a whole number, so the frequency can only be 0, 0.1, …, 1.',
    s1hint: 'What to try: press “Spin 10” and watch the ten circles light up one by one, then see where the white dot lands. Then press “Run 20 groups”: the dots pile up, tall in the middle and low at the sides, centred near the orange line, with a few groups far away. Takeaway: with only ten spins, missing the probability by 0.1 or 0.2 is perfectly ordinary. “Clear” only clears this step.',

    s2k: 'Step 2 · Steadier with more spins',
    s2t: 'Keep spinning. How does the frequency change?',
    s2e: 'The question here: instead of groups, spin on and on, recomputing the frequency “so far” after every spin. How does it move? The blue line is one such long run: across is the number of spins n, up is the frequency of red among the first n spins. The horizontal axis is <strong>logarithmic</strong>: 1, 10, 100, 1000 and 10000 are evenly spaced, so each big division is ten times as many spins, and you can see both the wild start and the calm finish. The green <strong>funnel</strong> spans probability ± 2×√(p(1−p)/n), where p is the probability and n the number of spins. At any one fixed n (n ≥ 30), the chance that the frequency lies inside the funnel is between 94% and 98%. That figure is computed exactly from the formula for every spinner from 1 to 11 red sectors; it is not luck of this one line. The funnel narrows to the right: four times the spins, half the width (<a class="xlink" href="../../../probability/stochastic/monte-carlo/#step2">→ Monte Carlo, step 2: four times the samples, half the error</a>).',
    s2lgPath: 'current long run', s2lgOld: 'earlier long runs', s2lgFunnel: 'funnel: probability ± 2√(p(1−p)/n)',
    nSlider: 'Look at spin n (log scale)',
    play2: 'Play from spin 1 to spin 10000', newPath: 'Another long run (old line kept in grey)',
    c2title: 'Frequency of red in the first n spins',
    c2axis: 'Number of spins n (log scale: ×10 per division)',
    s2readout: 'At spin {n}: {r} reds, frequency {f}, {d} away from the probability; the funnel here runs from {lo} to {hi}, and the blue line is {where}. ',
    inFunnel: 'inside it', outFunnel: 'outside it',
    s2olds: 'There are {k} long runs on screen; at this n, {c} of them are inside the funnel.',
    s2hint: 'What to try: press “Play” and follow the blue line. It leaps about at first (after one spin the frequency can only be 0 or 1), and after a few hundred spins it hugs the orange line. Drag “Look at spin n” to compare how far off it is at 10, 100 and 1000. Then press “Another long run” a few times: every grey line starts its own way, yet they all squeeze into the mouth of the funnel at the right. The funnel says “at any one n, very likely inside”, so a line poking out now and then is normal.',

    s3k: 'Step 3 · How many is enough',
    s3t: 'How many spins until the frequency is almost sure to be close?',
    s3e: 'The question here: the last step followed one line. If we repeat “spin n times” as 500 separate groups, how are the 500 frequencies spread out? The blue bars are the simulation: bar height = the share of the 500 groups whose frequency falls in that small interval. The orange outline is the share predicted exactly by formula, with no simulation, assuming only that spins are independent and each is red with probability p (<a class="xlink" href="../../../probability/basics/binomial-normal/#step1">→ Binomial to Normal, step 1: how many successes in n tries</a>). The pale orange band is “within 0.05 of the probability”. The readout’s “middle 95% of groups” means: sort the 500 frequencies, drop the lowest 2.5% and the highest 2.5%, and report the range the rest occupy; the narrower it is, the more tightly the frequencies cluster.',
    s3lgSim: 'simulated share of 500 groups', s3lgExact: 'exact from formula', s3lgOld: 'sizes you visited', s3lgBand: 'probability ± 0.05',
    groupSize: 'Spins per group n (×4 per notch)',
    c3title: '500 groups of {n} spins: how the frequency spreads',
    c3axis: 'frequency = reds ÷ spins per group',
    s3readout: '{G} groups of {n} spins: {c} groups ({cs}) landed within 0.05 of the probability; the exact chance is {ex}. The middle 95% of groups lie between {lo} and {hi}, a width of {wd}. ',
    s3ratio: 'At the previous notch ({pn} spins) the width was {pw}; four times the spins gives {r} times the width (the formula says {tr}).',
    s3hint: 'What to try: keep the spinner fixed and move from 20 spins to the right one notch at a time. Watch three things: the blue bars crowd in on the orange line; the share inside the pale band climbs from 34.7%–59.5% at 20 spins (depending on the red sectors) to over 99.9% from 1280 spins on, for every spinner from 1 to 11 red sectors; and the width roughly halves at each notch (simulated ratios lie between 0.41 and 0.61; the formula gives exactly 0.5). Grey outlines show the notches you already visited.',

    s4k: 'Step 4 · No memory',
    s4t: 'After a run of reds, is red now less likely?',
    s4e: 'The question here: many people feel that “after five reds in a row, white is due”. Is it? Let the computer spin 60000 times, pick out every moment where the last k spins were all red, and check how often the very next spin is red. Each blue bar is one value of k: its height is the <strong>frequency</strong> of red on the next spin (reds ÷ moments), and the small number beneath it is how many such moments there were. The grey whisker is the range the frequency would roughly fall in if the next spin ignores the past: probability ± 2×√(p(1−p)/moments), wider when there are fewer moments. An ideal spinner has no memory: where the pointer stops this time has nothing to do with last time (the simulation also draws a fresh random number for every spin). So what we are checking is whether the spin right after a streak still has a frequency close to the probability.',
    s4lgBar: 'frequency of red on the next spin', s4lgWhisk: 'rough range if the past does not matter',
    streakSlider: 'Reds in a row just before, k', newSeq: 'New run of 60000',
    c4title: 'After k reds in a row, how often is the next spin red?',
    c4axis: 'k = reds in a row just before (small: how many moments)',
    s4all: 'No condition (k = 0, all {m} spins): {r} reds, frequency {f}; the probability is {p}.',
    s4readout: 'There were {m} moments right after {k} reds in a row; the next spin was red {r} times, a frequency of {f}. The probability is {p}. If the next spin ignores the past, the frequency should land roughly between {lo} and {hi}.',
    s4none: 'In these {N} spins, {k} reds in a row never happened, so there is nothing to count. Press “New run” or raise the number of red sectors in step 0.',
    s4hint: 'What to try: keep the spinner fixed and drag k from 0 to 6. Every blue bar sits near the orange line; none of them shrinks as k grows. With larger k there are fewer moments, so a bar wobbles more, but most stay within their grey whiskers (an occasional miss is ordinary randomness). Press “New run” to see whether another stream of random numbers tells the same story.',

    s5k: 'Step 5 · Dilution, not payback',
    s5t: 'Do the extra reds ever get “paid back”?',
    s5e: 'The question here: if the frequency drifts toward the probability, is that because early extra reds get cancelled by later extra whites? Take the same long run as step 2 and look at two different gaps. The <strong>count gap</strong> = actual reds − the n×p reds the probability “expects”, measured in spins. The <strong>frequency gap</strong> = frequency − probability = count gap ÷ n. The top chart shows the count gap, the bottom one the frequency gap; both run across the number of spins n on a log scale. The green bands are where each gap lands about 95% of the time at a given n: ±2×√(n×p(1−p)) for the count gap, which <strong>widens</strong> with n, and that same amount divided by n for the frequency gap, which <strong>narrows</strong>.',
    s5lgCount: 'count gap (top)', s5lgFreq: 'frequency gap (bottom)', s5lgBand: 'about-95% band',
    play5: 'Play from spin 1 to spin 10000',
    c5a: 'Count gap = reds − n×p (in spins)',
    c5b: 'Frequency gap = frequency − probability = count gap ÷ n',
    s5readout: 'At spin {n}: {r} reds where the probability expects {e}, a count gap of {g}; frequency gap = count gap ÷ {n} = {d}. Right now the count-gap band is ±{cb} spins and the frequency-gap band is ±{fb}.',
    s5hint: 'What to try: press “Play” and watch the guide line in both charts. The orange line on top does not return to 0: the extra reds are never handed back, and the gap often wanders further out (its band is widening). The blue line below hugs 0 ever more closely, because a gap of the same size is being divided by an ever larger n. Takeaway: the frequency approaches the probability by dilution, not by payback. Use “Another long run” in step 2 to swap the line; the story stays the same.',

    s6k: 'Step 6 · Turn it around',
    s6t: 'Without seeing the spinner, can the results tell you the probability?',
    s6e: 'The question here: many real probabilities cannot be worked out in advance, such as the chance a thumbtack lands point up, or that a machine makes a faulty part. So we turn it around: repeat the trial many times and use the frequency to <strong>estimate</strong> the probability. Here is a covered spinner; you do not know how much of it is red (and it need not be a whole number of twelfths). Each button spins another batch, and the chart “Estimated probability and rough range” records the estimate after each press: the white dot is the frequency so far, and the whisker is a rough range, frequency ± 2×√(frequency×(1−frequency)/n), with n the spins so far. The range is computed from the data, so it is not guaranteed to cover the true value: from 100 spins on, it covers it about 93%–96% of the time (computed exactly for the five spinners on this page); after only 10 spins, it can be as low as 84%.',
    c6a: 'Covered spinner', c6b: 'Estimated probability and rough range, by number of spins n',
    c6hidden: 'Covered spinner: how much is red?', c6open: 'The spinner, revealed',
    s6lgEst: 'estimate: frequency so far', s6lgRange: 'rough range', s6lgTrue: 'true probability, once revealed',
    spin10: 'Spin 10 more', spin100: 'Spin 100 more', spin1000: 'Spin 1000 more', reveal: 'Reveal the true value', nextWheel: 'Try another covered spinner',
    s6none: 'Spinner {which}: no spins yet. Start with “Spin 10 more”.',
    s6readout: 'Spinner {which}: {n} spins, {r} reds, estimated probability ≈ {f}, rough range {lo} to {hi}. ',
    s6reveal: 'Revealed: the true probability is {p}, and this range {res}. Computed exactly from the true value, a range like this covers it {c} of the time after {n} spins.',
    covered: 'covers it', missed: 'misses it (which is bound to happen now and then)',
    s6hint: 'What to try: first press “Spin 10 more” two or three times and notice the long whisker and the jumpy dot. Then press “Spin 1000 more” a few times and watch the whisker shrink and the dot settle. Once you have a guess, press “Reveal the true value”; the dashed orange line is the truth. “Try another covered spinner” clears every result and picks a new true value.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'Unpredictable once, clear over many, and we can say how many and how clear',
    s7fin: 'A <strong>probability</strong> is how likely one outcome is, and can be worked out in advance from the spinner’s shape. A <strong>frequency</strong> is the share you count after n trials. For small n it jumps around (step 1); as n grows it settles ever more steadily near the probability (steps 2 and 3). That pattern is the <strong>law of large numbers</strong>. It works by dilution, not payback: after a streak of reds the next spin is no less likely to be red (step 4), and the extra reds are never handed back (step 5). Turned around, when the probability is hidden, the frequency estimates it, together with a range (step 6).',
    formula: 'frequency = reds ÷ n\ntypical distance from the probability ≈ 2×√(p(1−p)/n): n ×4 → distance ÷2\ntypical count gap ≈ 2×√(n×p(1−p)): grows with n',
    boundary: 'Where this holds: trials do not affect each other and every trial has the same probability (an ideal spinner). All data on this page are simulated by a computer from fixed-seed pseudo-random numbers, not a real experiment. Figures such as “94%–98%” and “93%–96%” come from an approximate formula checked by exact calculation, and only for the spinners and spin counts used here. A real spinner that is not perfectly balanced no longer has probability equal to its share of sectors; then the frequency is the only way to estimate it.',
    linksTitle: 'Where to go next',
    lk1: '→ Monte Carlo, step 2: four times the samples, half the error',
    lk2: '→ Binomial to Normal, step 1: a pegboard and the spread of successes in n tries',
    lk3: '→ Expected value, step 2: the average of many tries approaches the expectation',
    lk4: '→ Central limit theorem, step 3: errors shrink like σ/√n',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Probability & Frequency · The More Spins, the Closer to the Probability”.'
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
  if (typeof window.refreshFrequency === 'function') window.refreshFrequency();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PF_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
