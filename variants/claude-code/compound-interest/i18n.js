'use strict';
// Compound-interest lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '复利与贴现 · 钱在时间里怎样变形',
    back: '← 知识索引',
    compare: '对照另一版本：复利与贴现 · 时间是钱的形状 →',
    navLabel: '复利与贴现步骤导航',
    tagline: '同样一笔钱，放得越久，长得越快；反过来，越晚才拿到的钱，今天越不值钱。这两件事是同一条规则 (1 + r)ⁿ 的正读和反读。六步里你会拆开「利息生的利息」，用 72 法则心算翻倍，看计息频率为什么有上限，再用贴现比较三份奖金、读懂一笔房贷。',
    nav0: '0 利息生利息', nav1: '1 翻倍时间', nav2: '2 计息频率', nav3: '3 贴现', nav4: '4 比较三份奖金', nav5: '5 房贷', nav6: '6 收束',

    s0k: '第 0 步 · 复利比单利多在哪',
    s0t: '同样的利率，复利多出来的钱是从哪来的？',
    s0e: '这一步要回答：同一个年利率，「复利」为什么会比「单利」多那么多，多出来的部分从哪来？把 1000 元存 n 年，年利率 r（每年的利息占本金的比例）。<strong>单利</strong>：每年只按最初的本金算利息，n 年后是 1000 × (1 + r × n)。<strong>复利</strong>：每年的利息加进本金，下一年连同利息一起生息，n 年后是 1000 × (1 + r)ⁿ。图中每根柱是某一年年末的余额，拆成三层：灰色是本金，青色是「本金生的利息」（正好等于单利的利息），橙色是「利息生的利息」——复利比单利多出来的全部都在这一层。白线是单利的余额，作对照。横轴是第几年，纵轴是余额（元）。',
    c0a: '复利余额逐年柱状图，分成本金、本金生的利息、利息生的利息三层',
    c0title: '每年年末的余额（元）',
    lgPrin: '本金', lgOnP: '本金生的利息（= 单利的利息）', lgOnI: '利息生的利息', lgSimple: '单利的余额',
    rSlider: '年利率 r', nSlider: '存的年数 n',
    play0: '逐年播放',
    s0readout: '第 {n} 年末（r = {r}）：复利余额 {total}，单利余额 {simple}。利息一共 {int}，其中本金生的 {onP}，利息生的利息 {onI}，占全部利息的 {share}。{prog}',
    s0prog: '（播放中：第 {k}/{N} 年）',
    s0hint: '观察顺序：保持 r = 7%、n = 30，按「逐年播放」，看橙色层怎样从几乎看不见长成最厚的一层。再把 n 拖到 5 左右：橙色还很薄，复利和单利几乎一样——差别要靠时间才显出来。然后把 r 从 7% 拖到 14%：利率只翻了一倍，30 年后的橙色层却涨了好几倍。',

    s1k: '第 1 步 · 翻倍时间',
    s1t: '钱翻一倍要多少年？「72 法则」准不准？',
    s1e: '这一步要回答：按年利率 r 复利，余额翻一倍要多少年？复利每年都把余额乘以同一个数 (1 + r)，所以每过同样多的年数，余额就翻一倍，这个年数叫<strong>翻倍时间</strong> T。它满足 (1 + r)ᵀ = 2，两边取对数得 T = ln 2 ÷ ln(1 + r)（ln 是以 e 为底的对数，它把指数「拿下来」，<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ 指数与对数第 2 步：对数为什么能解出指数</a>）。<strong>72 法则</strong>是心算近似：T ≈ 72 ÷ 利率的百分数，例如 8% 约 9 年。上图横轴是年数，纵轴是余额（本金记为 1 倍）；默认用<strong>对数纵轴</strong>：每往上一格，数值翻一倍，于是复利曲线变成一条直线，橙点是每次翻倍的时刻。下图横轴是利率，纵轴是 72 法则的<strong>相对误差</strong> = 近似值 ÷ 精确值 − 1，正数表示近似值高估了等待时间；绿色带是 ±2%。',
    c1a: '上：余额随年数增长并标出翻倍时刻；下：72 法则的相对误差随利率变化',
    c1top: '余额（倍）随年数',
    c1bot: '72 法则的相对误差随利率',
    lgGrowth: '余额（倍）', lgDoubles: '每次翻倍的时刻', lgErr: '72 法则相对误差（绿带 = ±2%）',
    axLog: '纵轴：对数（每格 ×2）', axLin: '纵轴：普通',
    s1readout: 'r = {r}：精确翻倍时间 {T} 年，72 法则给出 {R} 年，相对误差 {e}。40 年里一共翻了 {k} 次倍，变成 {g} 倍。利率在 {lo} 到 {hi} 之间时，72 法则的误差都在 ±2% 以内。',
    s1hint: '观察顺序：先在对数纵轴下拖 r：直线变陡，橙点变密，但相邻橙点的间隔始终相等。再切到普通纵轴：同一条曲线弯成越来越陡的样子，前面几次翻倍几乎贴着横轴，但它们的时间间隔仍然相等。最后看下图：72 法则在中等利率时最准；利率很低时高估等待时间（误差为正），利率很高时低估（误差为负）。',
    quizPrompt: '小测：年利率 9% 复利，大约多少年变成原来的 4 倍？',
    quizA: '约 8 年', quizB: '约 16 年', quizC: '约 32 年',
    check: '检查',
    correct: '对。4 倍就是翻两次倍；72 ÷ 9 = 8 年翻一次，所以约 16 年。精确值是 ln 4 ÷ ln 1.09 = {T4} 年。',
    wrong: '提示：4 倍 = 翻两次倍。先用 72 法则算出翻一次要几年，再乘以 2。',

    s2k: '第 2 步 · 计息频率',
    s2t: '「年利率 8%，按月计息」，一年后实际涨了多少？',
    s2e: '这一步要回答：同样标着年利率 r，一年里结息的次数越多，钱是不是越多？会不会多到没有上限？<strong>计息频率</strong> m 指一年里把利息结进本金几次：每次按 r ÷ m 计息，一年要乘 m 次，所以一年后是 (1 + r/m)ᵐ 倍。<strong>实际年利率</strong>就是这个倍数减 1，它才是一年真正涨了多少。m 越大，倍数越大，但增长越来越慢，最后逼近 eʳ（e ≈ 2.718）——把结息次数推到无穷，叫<strong>连续复利</strong>。上图横轴是一年内的月份，纵轴是余额（本金记为 1）：青色台阶在每次结息时跳一级，白色虚线是连续复利 eʳᵗ。下图横轴是一年结息次数 m（对数刻度，最右的点代表连续复利），纵轴是实际年利率；橙点是七种频率，白色虚线是上限 eʳ − 1。',
    c2a: '上：一年内余额随结息台阶上升；下：实际年利率随结息次数 m 变化并逼近上限',
    c2top: '一年内的余额（倍）随月份',
    c2bot: '实际年利率随一年结息次数 m',
    lgPath: '当前频率下的余额', lgCont: '连续复利（上图的曲线、下图的上限）', lgFactor: '七种频率的实际年利率',
    f1: '每年 1 次', f2: '半年', f4: '每季度', f12: '每月', f52: '每周', f365: '每日', fInf: '连续',
    s2readout: 'r = {r}，{freq}：一年后是 {f} 倍，实际年利率 {ear}，比每年结一次多 {gain} 个百分点；离连续复利的上限 {cap} 还差 {gap} 个百分点。',
    s2hint: '观察顺序：保持 r = 8%，从「每年 1 次」依次点到「连续」：上图的台阶越来越密，贴向白色虚线；下图的橙点一路上升，但越来越平——从每月到每日只多了零点零几个百分点。再把 r 拉到 20%：频率带来的差别变大了，但仍然有同一种上限 eʳ − 1。',

    s3k: '第 3 步 · 贴现',
    s3t: '20 年后才拿到的 10000 元，今天值多少？',
    s3e: '这一步要回答：一笔将来才拿到的钱，折算成今天值多少？把复利倒过来想：今天存 PV 元，按年利率 r 复利 t 年，正好变成 10000 元，那么 PV = 10000 ÷ (1 + r)ᵗ。这个 PV 叫<strong>现值</strong>，把将来的钱折算到今天的做法叫<strong>贴现</strong>，r 在这里叫<strong>贴现率</strong>：你今天手里有钱时，每年能稳定拿到的回报率。1 ÷ (1 + r)ᵗ 叫<strong>贴现因子</strong>：t 年后的 1 元，今天值多少元。图的横轴是还要等多少年才拿到钱，纵轴是这笔 10000 元的现值；灰色虚线是 10000 元面额，青色是当前贴现率下的现值曲线，粉色是贴现率再高 1 个百分点时的曲线。',
    c3a: '10000 元在不同等待年数下的现值曲线，两条曲线对应两个贴现率',
    c3title: '10000 元的现值（元）随等待年数',
    lgPV: '当前贴现率 r 下的现值', lgPV1: '贴现率高 1 个百分点时的现值', lgF: '面额 10000 元',
    tSlider: '等多少年才拿到 t',
    drSlider: '贴现率 r',
    s3readout: 'r = {r}，t = {t} 年：现值 {pv}（贴现因子 {df}）。验算：把 {pv} 按 {r} 复利存 {t} 年，正好回到 {F}。如果贴现率升到 {r1}，现值降到 {pv1}，少了 {drop}。',
    s3hint: '观察顺序：先固定 r，把 t 从 0 拖到 40：现值一路下降，但每年降得越来越少（每多等一年都打同一个折扣，折扣作用在越来越小的数上）。再固定 r，盯住读数里「少了百分之几」，把 t 从 5 拖到 40：这个百分比一路变大——同样加 1 个百分点，越远的钱按比例跌得越多。这也是期限越长的债券对利率越敏感的原因。',

    s4k: '第 4 步 · 用现值比较',
    s4t: '三份奖金，面额最大的就最值钱吗？',
    s4e: '这一步要回答：三份奖金任选一份——<strong>今天一次拿 10000 元</strong>、<strong>今后 15 年每年年末拿 1000 元</strong>、<strong>20 年后一次拿 25000 元</strong>——哪份最值钱？面额加起来分别是 10000、15000、25000 元，可它们到手的时间不同，不能直接比。办法是把每一笔都按第 3 步折成现值（今天值多少）再相加。每年年末拿一笔同样多的钱叫<strong>年金</strong>，它的现值是一个等比数列的和，有现成的公式：C × [1 − (1 + r)⁻ⁿ] ÷ r（<a class="xlink" href="../../../math/algebra/sequences-series/#step3">→ 数列第 3 步：等比数列怎样求和</a>）。上图是三份奖金的现金流：横轴是第几年拿到，空心框是面额，实心部分是它的现值；下图横轴是贴现率 r，纵轴是每份奖金的现值（元）。',
    c4a: '上：三份奖金各年的面额与现值；下：三份奖金的现值随贴现率变化',
    c4top: '现金流：面额（空心）与现值（实心），元',
    c4bot: '每份奖金的现值（元）随贴现率',
    offerNow: '今天一次 10000', offerStream: '15 年每年 1000', offerLater: '20 年后一次 25000',
    lgNominal: '面额',
    s4readout: 'r = {r}：现值分别是 今天一次 {a}、15 年每年 {b}、20 年后一次 {c}，现在最值钱的是「{best}」。在 0 到 12% 之间，第一名在 r = {x1} 由「{f1}」换成「{t1}」，在 r = {x2} 由「{f2}」换成「{t2}」。',
    s4hint: '观察顺序：从 r = 0 开始：不打折时面额最大的「20 年后 25000」赢。慢慢加大 r：上图最右边的实心块缩得最快，下图的橙线跌得最快，先被绿线、再被青线超过。哪份最好取决于贴现率：如果你今天拿到钱能稳拿 6% 的回报，眼前的 10000 元就比另外两份都值钱。',

    s5k: '第 5 步 · 读懂一笔房贷',
    s5t: '每月还一样多，为什么头几年还的大多是利息？',
    s5e: '这一步要回答：等额还款的贷款，为什么前些年本金几乎不怎么减少？借 L 元，年利率 r，分 n 年按月还，每月还一样多（叫<strong>月供</strong> M）。每个月先付清这个月的利息 = 还欠的本金 × r/12，剩下的才用来还本金。刚开始欠得最多，利息最大，能还掉的本金就少；本金一点点减少，利息跟着减少，还本金的部分才越来越大。月供 M 正是让这串还款的现值恰好等于 L 的那个数：M = L × i ÷ [1 − (1 + i)⁻ᴺ]，其中 i = r/12、N = 12n——就是第 4 步的年金公式倒过来用。上图每根柱是一年的 12 次月供：橙色是付掉的利息，青色是还掉的本金；下图是每年年末还欠的本金（白线），虚线是「每年还掉同样多本金」时的直线，作对照。',
    c5a: '上：每年的还款拆成利息和本金；下：年末剩余本金与直线还款对照',
    c5top: '每年还款（元）：利息 + 本金',
    c5bot: '年末还欠的本金（元）',
    lgInt: '付掉的利息', lgPrinPaid: '还掉的本金', lgBal: '年末剩余本金', lgStraight: '每年还同样多本金时（对照）',
    LSlider: '借款 L', rLoanSlider: '年利率 r', ySlider: '还款年数 n',
    s5readout: '借 {L}，年利率 {r}，{n} 年：月供 {M}，一共还 {total}，其中利息 {int}（是借款的 {ratio}）。还到一半（第 {half} 年末）还欠 {hb}，占借款的 {hs}。{cross}',
    s5cross: '从第 {k} 个月起，每月还的本金才多于利息。',
    s5crossFirst: '从第一个月起，每月还的本金就多于利息。',
    s5hint: '观察顺序：默认 30 年、5%：第一年的柱子大半是橙色，白线开头几乎是平的，一直在虚线上方。把年数缩到 10：月供变大，但总利息大幅减少，白线更接近直线。再把利率调到 1%：橙色几乎消失，白线几乎贴着虚线——本金还得慢，完全是利息造成的。',

    s6k: '第 6 步 · 收束', s6t: '同一条规则，正着读是增长，倒着读是贴现',
    s6fin: '回顾：<strong>第 0 步</strong>复利比单利多出来的全是「利息生的利息」，它要靠时间才长大。<strong>第 1 步</strong>复利每隔固定年数翻一倍，T = ln 2 ÷ ln(1 + r)，72 法则在中等利率下够准。<strong>第 2 步</strong>结息越频繁，实际年利率越高，但有上限 eʳ − 1。<strong>第 3 步</strong>把复利倒过来就是贴现，越远的钱对利率越敏感。<strong>第 4 步</strong>不同时间的钱要先折成现值再比，哪个最好取决于贴现率。<strong>第 5 步</strong>月供是让还款现值等于借款的年金，利息先吃掉大半月供，所以本金前期还得慢。',
    formula: '复利：A = P(1 + r)ⁿ　翻倍：T = ln 2 ÷ ln(1 + r) ≈ 72 ÷ 利率百分数\n计息频率：(1 + r/m)ᵐ → eʳ\n贴现：PV = F ÷ (1 + r)ᵗ　年金：PV = C[1 − (1 + r)⁻ⁿ] ÷ r\n月供：M = L·i ÷ [1 − (1 + i)⁻ᴺ]',
    boundary: '适用范围：本页利率固定不变，不计税、手续费和通货膨胀，金额都是示例。贴现率被当成一个已知的数，现实中它取决于你能拿到的回报和你愿意承担的风险。贷款按每月等额还款计算，不考虑提前还款、浮动利率和各种费用。本页不是投资或贷款建议。',
    linksTitle: '接着去哪',
    lk1: '→ 指数与对数第 2 步：对数怎样把指数「拿下来」',
    lk2: '→ 数列第 3 步：等比数列求和与极限',
    lk3: '→ 利率与债券第 3 步：利率上升，债券价格为什么下跌',
    lk4: '→ 费率与复利第 2 步：时间怎样把一点点费率的差距拉大',
    money: '{v} 元',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《复利与贴现 · 时间是钱的形状》的平行版本。'
  },
  en: {
    pageTitle: 'Compound Interest & Discounting · How Money Changes Shape over Time',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Compound Interest & Discounting · Time Is the Shape of Money →',
    navLabel: 'Compound interest step navigation',
    tagline: 'Leave money alone and the longer it sits, the faster it grows. Run that backwards and money you only get later is worth less today. Both are one rule, (1 + r)ⁿ, read forwards and backwards. In six steps you will pull apart “interest on interest”, estimate doubling times in your head with the rule of 72, see why compounding more often has a ceiling, then use discounting to compare three prizes and read a mortgage.',
    nav0: '0 Interest on interest', nav1: '1 Doubling time', nav2: '2 How often', nav3: '3 Discounting', nav4: '4 Three prizes', nav5: '5 A mortgage', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Where compound beats simple',
    s0t: 'At the same rate, where does compound interest’s extra money come from?',
    s0e: 'The question for this step: with the same annual rate, why does <strong>compound</strong> interest end up so far ahead of <strong>simple</strong> interest, and where does the extra come from? Deposit $1,000 for n years at an annual rate r (each year’s interest as a share of the money). <strong>Simple interest</strong> pays on the original deposit only: after n years you have 1000 × (1 + r × n). <strong>Compound interest</strong> adds each year’s interest to the balance, so next year the interest earns interest too: after n years you have 1000 × (1 + r)ⁿ. Each bar is the balance at the end of a year, split into three layers: grey is the deposit, cyan is interest earned by the deposit (exactly the simple interest), and orange is interest earned by earlier interest. Everything compound has over simple sits in that orange layer. The white line is the simple-interest balance for comparison. Across is the year; up is the balance in dollars.',
    c0a: 'Bar chart of a compound balance year by year, split into deposit, interest on the deposit and interest on interest',
    c0title: 'Balance at the end of each year ($)',
    lgPrin: 'Deposit', lgOnP: 'Interest on the deposit (= simple interest)', lgOnI: 'Interest on interest', lgSimple: 'Simple-interest balance',
    rSlider: 'Annual rate r', nSlider: 'Years left on deposit, n',
    play0: 'Play year by year',
    s0readout: 'End of year {n} (r = {r}): compound balance {total}, simple balance {simple}. Interest totals {int}: {onP} earned by the deposit and {onI} earned by interest, which is {share} of all the interest. {prog}',
    s0prog: '(playing: year {k}/{N})',
    s0hint: 'What to try: keep r = 7% and n = 30 and press “Play year by year”; watch the orange layer grow from barely visible to the thickest one. Then drag n back to about 5: the orange is still thin and compound and simple are nearly the same. The difference needs time. Finally drag r from 7% to 14%: the rate only doubles, yet the orange layer after 30 years grows several times over.',

    s1k: 'Step 1 · Doubling time',
    s1t: 'How many years until money doubles, and how good is the rule of 72?',
    s1e: 'The question for this step: compounding at rate r, how many years until the balance doubles? Compounding multiplies the balance by the same number, (1 + r), every year, so it doubles again after every equal stretch of years. That stretch is the <strong>doubling time</strong> T. It satisfies (1 + r)ᵀ = 2, and taking logarithms gives T = ln 2 ÷ ln(1 + r) (ln is the logarithm to base e; it brings the exponent down, <a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ Exponents & logarithms, step 2: why a logarithm solves for an exponent</a>). The <strong>rule of 72</strong> is a mental shortcut: T ≈ 72 ÷ the rate in percent, so 8% doubles in about 9 years. In the top panel, across is years and up is the balance as a multiple of the deposit. By default the vertical axis is <strong>logarithmic</strong>: each grid line up doubles the value, so compound growth becomes a straight line, and the orange dots mark each doubling. In the bottom panel, across is the rate and up is the rule’s <strong>relative error</strong> = estimate ÷ exact − 1; positive means the rule overstates the wait. The green band is ±2%.',
    c1a: 'Top: balance growing over the years with each doubling marked. Bottom: the rule of 72’s relative error against the rate',
    c1top: 'Balance (multiple) over the years',
    c1bot: 'Rule of 72: relative error against the rate',
    lgGrowth: 'Balance (multiple)', lgDoubles: 'Each doubling', lgErr: 'Rule of 72 relative error (green band = ±2%)',
    axLog: 'Vertical: log (×2 per line)', axLin: 'Vertical: ordinary',
    s1readout: 'r = {r}: the exact doubling time is {T} years; the rule of 72 says {R} years, a relative error of {e}. Over 40 years the money doubles {k} times and ends at {g} times the deposit. For rates from {lo} to {hi} the rule is within ±2%.',
    s1hint: 'What to try: on the log axis, drag r. The line gets steeper and the orange dots crowd together, but the gaps between neighbouring dots stay equal. Switch to the ordinary axis: the same curve bends upward ever more steeply, the first few doublings hug the floor, yet they are still equally spaced in time. Then look at the bottom panel: the rule of 72 is most accurate at middling rates. At very low rates it overstates the wait (positive error); at very high rates it understates it (negative error).',
    quizPrompt: 'Quick check: compounding at 9% a year, roughly how long until money becomes 4 times as much?',
    quizA: 'About 8 years', quizB: 'About 16 years', quizC: 'About 32 years',
    check: 'Check',
    correct: 'Right. Four times is two doublings; 72 ÷ 9 = 8 years per doubling, so about 16 years. The exact answer is ln 4 ÷ ln 1.09 = {T4} years.',
    wrong: 'Hint: four times is two doublings. Use the rule of 72 for one doubling, then double it.',

    s2k: 'Step 2 · How often interest is paid',
    s2t: '“8% a year, compounded monthly”: how much does the money really grow in a year?',
    s2e: 'The question for this step: with the same quoted annual rate r, does paying interest more often give you more money, and is there any limit? The <strong>compounding frequency</strong> m is how many times a year interest is added to the balance. Each time it pays r ÷ m, and it does so m times, so after a year you have (1 + r/m)ᵐ times the money. The <strong>effective annual rate</strong> is that multiple minus 1: what the money actually grows by in a year. A bigger m gives a bigger multiple, but the gains shrink, and the multiple approaches eʳ (e ≈ 2.718). Pushing m to infinity is called <strong>continuous compounding</strong>. In the top panel, across is the month within the year and up is the balance (deposit = 1): the cyan staircase steps up at each payment, and the white dashed curve is continuous compounding, eʳᵗ. In the bottom panel, across is the number of payments a year, m (log scale; the rightmost dot stands for continuous), and up is the effective annual rate; the orange dots are seven frequencies and the white dashed line is the ceiling eʳ − 1.',
    c2a: 'Top: balance stepping up through one year. Bottom: effective annual rate against payments per year, approaching a ceiling',
    c2top: 'Balance over one year (multiple) by month',
    c2bot: 'Effective annual rate against payments per year, m',
    lgPath: 'Balance at the chosen frequency', lgCont: 'Continuous compounding (curve on top, ceiling below)', lgFactor: 'Effective rate at seven frequencies',
    f1: 'Yearly', f2: 'Half-yearly', f4: 'Quarterly', f12: 'Monthly', f52: 'Weekly', f365: 'Daily', fInf: 'Continuous',
    s2readout: 'r = {r}, {freq}: after a year the money is {f} times as much, an effective annual rate of {ear}, {gain} percentage points more than paying once a year and {gap} points short of the continuous ceiling of {cap}.',
    s2hint: 'What to try: keep r = 8% and click from “Yearly” through to “Continuous”. On top, the steps get finer and hug the white dashed curve; below, the orange dots keep rising but flatten out, so going from monthly to daily adds only a few hundredths of a percentage point. Then drag r to 20%: frequency now matters more, but there is still the same kind of ceiling, eʳ − 1.',

    s3k: 'Step 3 · Discounting',
    s3t: 'What is $10,000 that arrives in 20 years worth today?',
    s3e: 'The question for this step: what is money you will only receive later worth today? Run compounding backwards. If PV dollars deposited today at rate r for t years grow to exactly $10,000, then PV = 10000 ÷ (1 + r)ᵗ. That PV is the <strong>present value</strong>; converting future money into today’s money is <strong>discounting</strong>; and r here is the <strong>discount rate</strong>: the return you could reliably earn each year if you had the money now. 1 ÷ (1 + r)ᵗ is the <strong>discount factor</strong>: what $1 arriving in t years is worth today. Across is how many years you wait for the money; up is the present value of the $10,000. The grey dashed line is the $10,000 face amount, cyan is the present value at the current discount rate, and pink is the curve with the rate one percentage point higher.',
    c3a: 'Present value of $10,000 against years of waiting, at two discount rates',
    c3title: 'Present value of $10,000 ($) against years of waiting',
    lgPV: 'Present value at discount rate r', lgPV1: 'Present value at one point higher', lgF: 'Face amount $10,000',
    tSlider: 'Years until you receive it, t',
    drSlider: 'Discount rate r',
    s3readout: 'r = {r}, t = {t} years: present value {pv} (discount factor {df}). Check: deposit {pv} at {r} for {t} years and it grows back to exactly {F}. If the discount rate rises to {r1}, the present value falls to {pv1}, a drop of {drop}.',
    s3hint: 'What to try: fix r and drag t from 0 to 40. The present value keeps falling, but by less each year (every extra year applies the same percentage discount to an ever smaller number). Then watch the “drop” percentage in the readout while you drag t from 5 to 40: it keeps growing. The same one-point rise takes a bigger share off distant money, which is why longer bonds are more sensitive to interest rates.',

    s4k: 'Step 4 · Comparing with present values',
    s4t: 'Three prizes: is the biggest face value worth the most?',
    s4e: 'The question for this step: you may take one of three prizes, <strong>$10,000 today</strong>, <strong>$1,000 at the end of each of the next 15 years</strong>, or <strong>$25,000 in 20 years</strong>. Which is worth most? Their face values add up to $10,000, $15,000 and $25,000, but they arrive at different times, so you cannot compare them directly. Instead, discount every payment to today as in step 3 and add them up. Equal payments at the end of every year are called an <strong>annuity</strong>; its present value is the sum of a geometric sequence, with a ready-made formula: C × [1 − (1 + r)⁻ⁿ] ÷ r (<a class="xlink" href="../../../math/algebra/sequences-series/#step3">→ Sequences & series, step 3: summing a geometric sequence</a>). The top panel shows each prize’s cash flows: across is the year, the hollow box is the face amount and the filled part is its present value. In the bottom panel, across is the discount rate r and up is each prize’s present value in dollars.',
    c4a: 'Top: face amounts and present values of the three prizes by year. Bottom: each prize’s present value against the discount rate',
    c4top: 'Cash flows: face (hollow) and present value (filled), $',
    c4bot: 'Present value of each prize ($) against the discount rate',
    offerNow: '$10,000 today', offerStream: '$1,000 a year for 15 years', offerLater: '$25,000 in 20 years',
    lgNominal: 'Face amount',
    s4readout: 'r = {r}: present values are {a} for $10,000 today, {b} for $1,000 a year and {c} for $25,000 in 20 years, so “{best}” is worth most now. Between 0 and 12%, the lead passes from “{f1}” to “{t1}” at r = {x1}, and from “{f2}” to “{t2}” at r = {x2}.',
    s4hint: 'What to try: start at r = 0. With no discount, the biggest face value, $25,000 in 20 years, wins. Raise r slowly: on top, the rightmost filled block shrinks fastest; below, the orange line falls fastest and is overtaken first by green, then by cyan. Which prize is best depends on the discount rate. If money in hand today could reliably earn 6%, the $10,000 now beats both of the others.',

    s5k: 'Step 5 · Reading a mortgage',
    s5t: 'If every monthly payment is the same, why is the early money mostly interest?',
    s5e: 'The question for this step: with equal monthly payments, why does the loan barely shrink in the early years? Borrow L dollars at annual rate r, repaid monthly over n years with equal payments (the <strong>monthly payment</strong> M). Each month the payment first covers that month’s interest = balance still owed × r/12, and only what is left pays down the loan. At the start you owe the most, so interest is largest and little goes to the principal. As the balance falls, so does the interest, and more of each payment goes to principal. M is exactly the payment whose stream of present values adds up to L: M = L × i ÷ [1 − (1 + i)⁻ᴺ], with i = r/12 and N = 12n. It is step 4’s annuity formula used backwards. In the top panel each bar is one year of 12 payments: orange is interest paid, cyan is principal repaid. The bottom panel shows the balance still owed at the end of each year (white), with a dashed straight line for repaying the same amount of principal every year, for comparison.',
    c5a: 'Top: each year’s payments split into interest and principal. Bottom: year-end balance compared with a straight-line paydown',
    c5top: 'Paid each year ($): interest + principal',
    c5bot: 'Balance still owed at year end ($)',
    lgInt: 'Interest paid', lgPrinPaid: 'Principal repaid', lgBal: 'Year-end balance', lgStraight: 'Equal principal each year (comparison)',
    LSlider: 'Amount borrowed, L', rLoanSlider: 'Annual rate r', ySlider: 'Years to repay, n',
    s5readout: 'Borrow {L} at {r} over {n} years: the monthly payment is {M}, you repay {total} in all, of which {int} is interest ({ratio} of the amount borrowed). Halfway through (end of year {half}) you still owe {hb}, {hs} of the loan. {cross}',
    s5cross: 'Only from month {k} on does more of each payment go to principal than to interest.',
    s5crossFirst: 'From the very first month, more of each payment goes to principal than to interest.',
    s5hint: 'What to try: at the default 30 years and 5%, the first year’s bar is mostly orange and the white line starts out almost flat, staying above the dashed line all the way. Cut the term to 10 years: the monthly payment goes up, but total interest falls sharply and the white line gets closer to straight. Then set the rate to 1%: the orange nearly vanishes and the white line almost sits on the dashed one. The slow paydown is entirely the work of interest.',

    s6k: 'Step 6 · Wrap-up', s6t: 'One rule: read forwards it is growth, read backwards it is discounting',
    s6fin: 'The thread. <strong>Step 0</strong>: everything compound has over simple is interest on interest, and it needs time to grow. <strong>Step 1</strong>: compounding doubles money every fixed number of years, T = ln 2 ÷ ln(1 + r), and the rule of 72 is good enough at middling rates. <strong>Step 2</strong>: paying interest more often raises the effective rate, but only up to eʳ − 1. <strong>Step 3</strong>: discounting is compounding run backwards, and distant money is the most sensitive to the rate. <strong>Step 4</strong>: money at different dates must be turned into present values before you compare, and the winner depends on the discount rate. <strong>Step 5</strong>: a monthly payment is the annuity whose present value equals the loan; interest takes most of it early on, so principal falls slowly at first.',
    formula: 'Compound: A = P(1 + r)ⁿ　Doubling: T = ln 2 ÷ ln(1 + r) ≈ 72 ÷ rate in %\nFrequency: (1 + r/m)ᵐ → eʳ\nDiscounting: PV = F ÷ (1 + r)ᵗ　Annuity: PV = C[1 − (1 + r)⁻ⁿ] ÷ r\nMonthly payment: M = L·i ÷ [1 − (1 + i)⁻ᴺ]',
    boundary: 'Scope: rates on this page never change, and there is no tax, no fees and no inflation; all amounts are examples. The discount rate is treated as a known number; in reality it depends on the return you can get and the risk you are willing to take. Loans assume equal monthly payments, with no early repayment, no variable rates and no fees. Nothing here is investment or borrowing advice.',
    linksTitle: 'Where to go next',
    lk1: '→ Exponents & logarithms, step 2: how a logarithm brings an exponent down',
    lk2: '→ Sequences & series, step 3: geometric sums and their limits',
    lk3: '→ Interest rates & bonds, step 3: why bond prices fall when rates rise',
    lk4: '→ Fees & compounding, step 2: how time widens a small fee gap',
    money: '${v}',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Compound Interest & Discounting · Time Is the Shape of Money”.'
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
  if (typeof window.refreshCompound === 'function') window.refreshCompound();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CI_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
