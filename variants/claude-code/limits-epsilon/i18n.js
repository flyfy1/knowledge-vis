'use strict';
// Limits and ε–δ lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '极限与 ε–δ · 把「越来越近」说成一场游戏',
    back: '← 知识索引',
    compare: '对照另一版本：极限与 ε–δ · 你说多近，我就能多近 →',
    navLabel: '极限步骤导航',
    tagline: '「x 趋近 a 时，f(x) 趋近 L」听上去很直观，可「趋近」到底要多近？十九世纪的数学家（柯西、魏尔斯特拉斯）给出的回答是一场游戏：对手说出允许的误差 ε，你得找出一个 δ，保证 x 离 a 不到 δ（但不等于 a）时，f(x) 离 L 不到 ε。七步里你会亲手玩这场游戏，看 δ 怎样随 ε 和位置变化、什么时候无论如何都赢不了，再把它搬到数列上，最后看一条 δ 公式怎样就是一份证明。',
    nav0: '0 靠近是什么意思', nav1: '1 ε–δ 游戏', nav2: '2 δ 随位置变', nav3: '3 赢不了的时候', nav4: '4 数列 ε–N', nav5: '5 公式即证明', nav6: '6 收束',
    lgCurve: '函数曲线', lgEps: '绿带：L ± ε', lgDel: '青带：a ± δ', lgBad: '跑出绿带的部分 / 反例',

    s0k: '第 0 步 · 靠近是什么意思',
    s0t: '函数在 x = 1 没有定义，为什么还说它「趋近 2」？',
    s0e: '这一步要回答：f(x) = (x² − 1) ÷ (x − 1) 在 x = 1 处分母为 0、没有定义，那「x 趋近 1 时 f(x) 趋近多少」还有意义吗？<strong>极限</strong>问的是：x 取 1 <strong>附近</strong>（但不等于 1）的值时，f(x) 会靠近哪个数。它只看附近，不看 x = 1 这一点本身。拖滑杆让 x 从两侧逼近 1：x = 1 − h 和 x = 1 + h，滑杆每走一格，h 缩小到原来的约 1/3。左图是整体，空心圈标出缺掉的那一点；右图是以 (1, 2) 为中心的放大镜，窗口宽度是 6h，随 h 一起缩小。',
    h0: 'x 离 1 的距离 h', sweep0: '逐步靠近', clear0: '清空表格',
    c0a: '整体：y = (x² − 1) ÷ (x − 1)', c0b: '放大镜：窗口宽 6h，中心 (1, 2)',
    th0h: 'h', th0l: 'f(1 − h)', th0r: 'f(1 + h)', th0d: '离 2 的距离',
    s0readout: 'h = {h}：f(1 − h) = {fl}，f(1 + h) = {fr}，两侧离 2 的距离都是 {d}，和 h 一样大。',
    s0hint: '观察顺序：把 h 从 0.1 一路拖到 0.000001（或按「逐步靠近」），看表格里两列都向 2 收拢，离 2 的距离和 h 一样小。右边放大镜的窗口越来越窄，图形却始终一样：一条斜线中间缺一个点。原因是 x ≠ 1 时可以约分，f(x) = x + 1；但 x = 1 处 f 仍然没有定义，极限 2 并不是 f(1)。',

    s1k: '第 1 步 · ε–δ 游戏',
    s1t: '对手给出误差 ε，你能找到够用的 δ 吗？',
    s1e: '这一步要回答：怎样把「f(x) 趋近 L」说成一句能检验对错的话？用 f(x) = x²、a = 1、L = 1 来玩一场游戏。对手先说出允许的误差 <strong>ε</strong>（希腊字母 epsilon，一个正数），意思是「f(x) 离 L 必须小于 ε」，就是图中绿色横带。你回答一个正数 <strong>δ</strong>（delta），意思是「只要 x 离 a 小于 δ、且 x ≠ a，我保证 f(x) 落在绿带里」，就是青色竖带。竖带里的曲线全在绿带内（画成绿色）你赢；有一段跑出去（画成红色）你输。如果对手给出<strong>任何</strong> ε，你都能找到赢的 δ，就说 <strong>lim(x→1) x² = 1</strong>。',
    e1: '对手的 ε', d1: '你的 δ',
    judge1: '记下这一回合', newEps1: '对手换一个 ε', clear1: '清除记录',
    c1a: 'y = x²，a = 1，L = 1', c1b: '记录：横轴 ε，纵轴 δ',
    lgWin: '赢的回合', lgLose: '输的回合', lgBest: '能赢的最大 δ*',
    s1readout: 'ε = {e}，δ = {d}：竖带里 |x² − 1| 最大逼近 {w}（端点取不到），{verdict}。这个 ε 下能赢的最大 δ 是 δ* = √(1 + ε) − 1 = {ds}。已记录 {n} 回合。',
    s1win: '不超过 ε，你赢',
    s1lose: '超过了 ε，你输',
    s1hint: '观察顺序：先固定 ε，把 δ 从大往小拖，看红色段在哪一刻消失，再按「记下这一回合」。换几个 ε 各玩一次：右图里赢的回合（绿点）全在橙色曲线 δ* 下方或线上，输的（红点）全在上方。红色总是先在右边出现：x² 在 1 的右侧涨得比左侧跌得快，所以右侧决定 δ*。',

    s2k: '第 2 步 · δ 随 ε 和位置变',
    s2t: '换一个位置 a，同样的 ε 需要的 δ 一样吗？',
    s2e: '这一步要回答：能赢的最大 δ（记作 δ*）由什么决定？还是 f(x) = x²，但 a 可以拖动，L = a²（这里 a ≥ 0.5）。在 a 的右侧，x 多走 δ，x² 就多出 2aδ + δ²；令它等于 ε，得到 <strong>δ* = √(a² + ε) − a</strong>（左侧多走 δ 时 x² 少掉的更少，不起决定作用）。曲线越陡（a 越大），同样的 ε 只能换来越窄的 δ。ε 很小时 δ* 约等于 ε ÷ (2a)，而 2a 正是 x² 在 a 处的斜率，也就是导数（<a class="xlink" href="../../../math/calculus/derivative/#step2">→ 导数页第 2 步：每一点的导数</a>）。',
    a2: '位置 a', e2: '误差 ε',
    c2a: '在 a 附近：绿带 a² ± ε，青带 a ± δ*', c2b: 'δ* 随 a 的变化（当前 ε）',
    lgDs: 'δ* = √(a² + ε) − a', lgApprox: '近似 ε ÷ (2a)',
    s2readout: 'a = {a}，ε = {e}：δ* = {ds}；近似值 ε ÷ (2a) = {ap}，δ* 是它的 {r} 倍。',
    s2hint: '观察顺序：固定 ε，把 a 从 0.5 拖到 3：左图青带越来越窄，右图白点沿曲线下滑。再固定 a，把 ε 往小拖：δ* 与 ε ÷ (2a) 的比值向 1 靠近，但始终小于 1（因为 δ* = ε ÷ (√(a² + ε) + a)，分母比 2a 大）。右图曲线在 a 越来越大时贴向 0：对 x² 来说，不存在一个对所有位置 a 都管用的 δ。',

    s3k: '第 3 步 · 赢不了的时候',
    s3t: '什么时候无论 δ 多小，你都赢不了？',
    s3e: '这一步要回答：「极限不存在」在这场游戏里是什么样子？它的意思是：对<strong>每一个</strong>候选的 L，对手都能给出某个 ε，让你的任何 δ 都输，即竖带里总有一点 x 使 |f(x) − L| ≥ ε，这样的 x 叫<strong>反例</strong>。这里固定 ε = 0.5、a = 0。下面四个函数在 0 处都没有定义；页面在 0 < |x| < δ 里找反例并标成红点。横轴随 δ 缩放，刻度以 δ 为单位，所以你看到的总是竖带附近那一小段。',
    kJump: '跳跃：x > 0 取 1，x < 0 取 −1', kOsc: '振荡：sin(1/x)', kBlow: '冲向无穷：1/x²', kDamped: '对照：x·sin(1/x)',
    L3: '候选的极限 L', k3: '竖带半宽 δ',
    c3a: 'a = 0 附近（横轴单位：δ）',
    s3found: 'L = {L}，δ = {d}：反例 x = {x}，f(x) = {fx}，|f(x) − L| = {err} ≥ 0.5，这一回合你输。',
    s3proof: 'L = {L}，δ = {d}：|x·sin(1/x) − L| ≤ |x| + |L| < δ + |L| ≤ 0.5，竖带里不可能有反例，你赢。',
    s3none: 'L = {L}，δ = {d}：在竖带里密集取了 8000 个点，没找到反例；但 δ > 0.5 − |L|，这还不算证明。把 δ 缩到 0.5 − |L| 以下就有保证。',
    s3hint: '观察顺序：选「跳跃」，把 L 放在任何位置，再把 δ 一路缩小：红点一直都在，因为 0 两侧分别是 1 和 −1，相差 2，不可能都离 L 小于 0.5。「振荡」一样：每个竖带里 sin(1/x) 都会取到 1 和 −1。「冲向无穷」里 f 在竖带里超过任何数。最后选「对照」：L = 0 时把 δ 缩到 0.5 以下就赢了，振荡被前面的 x 压住了。',

    s4k: '第 4 步 · 数列版：ε–N',
    s4t: '数列 a₁, a₂, a₃, … 什么时候算「趋近 L」？',
    s4e: '这一步要回答：数列没有 x 可以「靠近」，它的极限怎么说？把 δ 换成一个项号 <strong>N</strong>：对手给出 ε，你要找到 N，使从第 N 项起<strong>每一项</strong>都满足 |aₙ − L| < ε。对每个 ε 都找得到，就说 <strong>lim(n→∞) aₙ = L</strong>。图中横轴是项号 n，纵轴是项的值；绿带是 L ± ε，跑出带子的项画成红色，竖线标出 N，它右边再没有红点。等比数列求和的极限就是这样定义的（<a class="xlink" href="../../../math/algebra/sequences-series/#step3">→ 数列页第 3 步：等比求和与极限</a>）。',
    qAlt: '摆动收拢：aₙ = 1 + (−1)ⁿ·2/n', qSin: '慢慢收拢：aₙ = sin(n)/√n', qFlip: '来回跳：aₙ = (−1)ⁿ',
    k4: '误差 ε',
    c4a: '横轴：项号 n；纵轴：aₙ',
    lgTerm: '带内的项', lgOut: '跑出带子的项', lgN: '竖线：N',
    s4readAlt: 'ε = {e}：最后一个跑出带子的是第 {last} 项，所以 N = {N}。检验：|aₙ − 1| = 2/n，n > 2/ε = {b} 时一定小于 ε。',
    s4readSin: 'ε = {e}：逐项检查得最小的 N = {N}（最后一个红点是第 {last} 项）。由 |sin n| ≤ 1 能保证的 N 是 {G}（n > 1/ε² 时 1/√n < ε），比实际的稍大：证明只需要一个够用的 N，不必是最小的。',
    s4readFlip: 'ε = {e}：各项在 1 和 −1 之间来回跳，相邻两项相差 2。ε ≤ 1 时没有任何 L 能让相邻两项都离它小于 ε，所以找不到 N，这个数列没有极限。',
    s4hint: '观察顺序：选第一个数列，把 ε 从 1 拖到 0.01：竖线 N 向右移（ε 缩小 10 倍，N 大约变大 10 倍），但总找得到。换第二个：N 涨得更快（约 1/ε²），横轴会自动拉长。最后换 (−1)ⁿ：在整个滑杆范围（ε ≤ 1）里，红点一路排到最右边，没有 N。',

    s5k: '第 5 步 · 公式即证明',
    s5t: '一条对所有 ε 都管用的 δ 规则，凭什么就算证明？',
    s5e: '这一步要回答：要证明 lim(x→2) x² = 4，不可能把每个 ε 都玩一遍，怎么办？给出一条<strong>规则</strong>：拿到任何 ε，就按公式算出 δ。只要这条规则对每个 ε > 0 都赢，证明就完成了。下面三条候选规则都「看起来合理」。左图是当前 ε 下规则给出的 δ（青带），橙色竖线标出能赢的最大 δ*；右图横轴是 ε（对数刻度，0.01 到 100），纵轴是 δ ÷ δ*，超过 1 的地方（红色）就是这条规则输掉的 ε。',
    rA: 'δ = ε/4（4 是 x² 在 2 处的斜率）', rB: 'δ = ε/5', rC: 'δ = min(1, ε/5)',
    k5: '对手的 ε',
    c5a: 'y = x² 在 a = 2 附近', c5b: 'δ ÷ δ*（横轴 ε，对数刻度）',
    lgRule: '规则给的 δ', lgDs5: '最大可用 δ*',
    s5ok: 'ε = {e}：δ = {d} ≤ δ* = {ds}，这一回合赢。{global}',
    s5bad: 'ε = {e}：δ = {d} > δ* = {ds}，输了。反例：x = {x} 离 2 不到 δ，但 x² − 4 = {err} ≥ ε。{global}',
    gA: '这条规则对每个 ε 都输：δ* = ε ÷ (√(4 + ε) + 2) 总比 ε/4 小一点（ε 很小时差得极少，左图几乎看不出，右图看得出）。',
    gB: '这条规则在 ε ≤ 5 时赢、ε > 5 时输：δ 太宽后，x 能走得太远，x + 2 超过 5，x² 涨得比预计快。',
    gC: '这条规则对每个 ε 都赢：δ ≤ 1 保证 |x + 2| < 5，于是 |x² − 4| = |x − 2|·|x + 2| < (ε/5)·5 = ε。这就是一份完整的证明。',
    quizPrompt: '想一想：要证明 lim(x→2) (3x + 1) = 7，哪条规则对每个 ε 都赢？',
    quizA: 'δ = 3ε', quizB: 'δ = ε/3', quizC: 'δ = ε + 1',
    check: '核对',
    correct: '对。|(3x + 1) − 7| = 3|x − 2| < 3δ = ε。直线处处一样陡，一条比例规则就够，不需要 min(1, …)。',
    wrong: '再想想：|(3x + 1) − 7| = 3|x − 2|。要让它小于 ε，|x − 2| 需要小于多少？',
    s5hint: '观察顺序：选「δ = ε/4」，把 ε 从 100 拖到 0.01：右图整条线都在 1 以上；左图在 ε 小时几乎看不出差别，这正是只靠看图会被骗的地方。再选「δ = ε/5」：右图在 ε = 5 处越过 1。最后选「min(1, ε/5)」：整条线都不超过 1。',

    s6k: '第 6 步 · 收束',
    s6t: '「越来越近」的严格说法',
    s6fin: '「x 趋近 a 时 f(x) 趋近 L」的严格说法是：<strong>对任意 ε > 0，都存在 δ > 0，使得只要 0 < |x − a| < δ，就有 |f(x) − L| < ε</strong>。ε 是对手允许的误差，δ 是你的回答；能赢的最大 δ 由函数在 a 附近有多陡决定。极限不存在，就是对手总能找到反例；数列把 δ 换成项号 N；而一条对所有 ε 都赢的 δ 规则，本身就是证明。',
    formula: 'lim(x→a) f(x) = L  ⇔  ∀ε > 0 ∃δ > 0：0 < |x − a| < δ ⇒ |f(x) − L| < ε\nlim(n→∞) aₙ = L  ⇔  ∀ε > 0 ∃N：n ≥ N ⇒ |aₙ − L| < ε\nf(x) = x²：δ* = √(a² + ε) − a ≈ ε ÷ (2a)',
    boundary: '说明：本页的最大 δ 都按公式精确算出，不是从图上读的；第 3 步「没找到反例」只是采样检查，只有给出不等式时才算保证；计算用双精度浮点数，第 0 步的 h 只取到 10⁻⁶，舍入误差远小于显示的位数。单侧极限、x → ∞ 的极限和连续性都是同一套语言的延伸，本页没有展开。',
    linksTitle: '接着看',
    lk1: '→ 导数页第 1 步：割线逼近切线，导数就是一个极限',
    lk2: '→ 数列页第 3 步：等比求和，部分和的极限',
    lk3: '→ 实数轴页第 3 步：二分逼近，一次比一次近',
    lk4: '→ 泰勒级数页第 2 步：误差什么时候能小于任意给定的数',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《极限与 ε–δ · 你说多近，我就能多近》的平行版本。'
  },
  en: {
    pageTitle: 'Limits and ε–δ · Turning “Closer and Closer” into a Game',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Limits and ε–δ · Name How Close, and I Can Get That Close →',
    navLabel: 'Limits steps',
    tagline: '“As x approaches a, f(x) approaches L” sounds obvious, but how close is “approaches”? The answer worked out by nineteenth-century mathematicians (Cauchy, Weierstrass) is a game. An opponent names an allowed error ε; you must find a δ such that whenever x is within δ of a (but not equal to a), f(x) is within ε of L. In seven steps you will play that game, watch δ change with ε and with position, see when you cannot win at all, carry the idea over to sequences, and finally see how a formula for δ is a proof.',
    nav0: '0 What “near” means', nav1: '1 The ε–δ game', nav2: '2 δ moves with a', nav3: '3 When you can’t win', nav4: '4 Sequences: ε–N', nav5: '5 A rule is a proof', nav6: '6 Wrap-up',
    lgCurve: 'the function', lgEps: 'green band: L ± ε', lgDel: 'cyan band: a ± δ', lgBad: 'parts outside the green band / counterexample',

    s0k: 'Step 0 · What “near” means',
    s0t: 'The function is undefined at x = 1, so why say it “approaches 2”?',
    s0e: 'This step asks: f(x) = (x² − 1) ÷ (x − 1) has a zero denominator at x = 1, so it is undefined there. Does “what f(x) approaches as x approaches 1” still mean anything? A <strong>limit</strong> asks which number f(x) gets close to when x takes values <strong>near</strong> 1 (but not 1). It looks only at the neighbourhood, never at x = 1 itself. Drag the slider to bring x towards 1 from both sides, x = 1 − h and x = 1 + h; each notch shrinks h to about a third. The left panel shows the whole picture with an open circle at the missing point; the right panel is a magnifier centred on (1, 2) whose window, 6h wide, shrinks with h.',
    h0: 'Distance h from 1', sweep0: 'Close in step by step', clear0: 'Clear the table',
    c0a: 'Overview: y = (x² − 1) ÷ (x − 1)', c0b: 'Magnifier: window 6h wide around (1, 2)',
    th0h: 'h', th0l: 'f(1 − h)', th0r: 'f(1 + h)', th0d: 'distance from 2',
    s0readout: 'h = {h}: f(1 − h) = {fl} and f(1 + h) = {fr}; both are {d} from 2, exactly as far as h.',
    s0hint: 'What to watch: drag h from 0.1 down to 0.000001 (or press “Close in”). Both columns of the table close in on 2, each as far from 2 as h is. The magnifier’s window keeps narrowing, yet the picture never changes: a sloping line with one point missing. That is because for x ≠ 1 the fraction cancels to f(x) = x + 1; but at x = 1 f is still undefined, and the limit 2 is not f(1).',

    s1k: 'Step 1 · The ε–δ game',
    s1t: 'Your opponent names an error ε. Can you find a δ that is good enough?',
    s1e: 'This step asks: how do we turn “f(x) approaches L” into a statement that can be checked? Play a game with f(x) = x², a = 1 and L = 1. The opponent first names an allowed error <strong>ε</strong> (Greek epsilon, a positive number) meaning “f(x) must be within ε of L”: the green horizontal band. You reply with a positive <strong>δ</strong> (delta) meaning “as long as x is within δ of a and x ≠ a, I promise f(x) lands in the green band”: the cyan vertical band. If the curve inside the cyan band stays inside the green band (drawn green), you win; if any piece escapes (drawn red), you lose. If you can find a winning δ for <strong>every</strong> ε the opponent might name, we say <strong>lim(x→1) x² = 1</strong>.',
    e1: 'Opponent’s ε', d1: 'Your δ',
    judge1: 'Record this round', newEps1: 'Opponent picks a new ε', clear1: 'Clear record',
    c1a: 'y = x², a = 1, L = 1', c1b: 'Record: ε across, δ up',
    lgWin: 'rounds won', lgLose: 'rounds lost', lgBest: 'largest winning δ*',
    s1readout: 'ε = {e}, δ = {d}: inside the cyan band |x² − 1| approaches {w} at most (the endpoint is excluded), {verdict}. The largest δ that wins against this ε is δ* = √(1 + ε) − 1 = {ds}. Rounds recorded: {n}.',
    s1win: 'not above ε, so you win',
    s1lose: 'above ε, so you lose',
    s1hint: 'What to watch: hold ε fixed and drag δ down from large to small; note the moment the red piece disappears, then press “Record this round”. Play a few different ε. In the right panel every won round (green dot) sits on or below the orange curve δ*, every lost one (red dot) above it. The red always shows up on the right first: to the right of 1, x² rises faster than it falls on the left, so the right side sets δ*.',

    s2k: 'Step 2 · δ depends on ε and on a',
    s2t: 'At a different point a, does the same ε need the same δ?',
    s2e: 'This step asks: what decides the largest winning δ (call it δ*)? Still f(x) = x², but now you can drag a, with L = a² (here a ≥ 0.5). To the right of a, moving δ further adds 2aδ + δ² to x²; setting that equal to ε gives <strong>δ* = √(a² + ε) − a</strong> (moving δ to the left takes away less, so that side never decides). The steeper the curve (the larger a), the narrower the δ that the same ε buys. For small ε, δ* is about ε ÷ (2a), and 2a is exactly the slope of x² at a, its derivative (<a class="xlink" href="../../../math/calculus/derivative/#step2">→ Derivative, step 2: the derivative at every point</a>).',
    a2: 'Point a', e2: 'Error ε',
    c2a: 'Near a: green band a² ± ε, cyan band a ± δ*', c2b: 'δ* as a changes (current ε)',
    lgDs: 'δ* = √(a² + ε) − a', lgApprox: 'approximation ε ÷ (2a)',
    s2readout: 'a = {a}, ε = {e}: δ* = {ds}; the approximation ε ÷ (2a) = {ap}, and δ* is {r} times it.',
    s2hint: 'What to watch: hold ε and drag a from 0.5 to 3. The cyan band on the left narrows and the white dot on the right slides down the curve. Then hold a and drag ε smaller: the ratio of δ* to ε ÷ (2a) creeps up towards 1 but always stays below it (since δ* = ε ÷ (√(a² + ε) + a), whose denominator exceeds 2a). As a grows, the right-hand curve hugs 0: for x² there is no single δ that works at every point a.',

    s3k: 'Step 3 · When you can’t win',
    s3t: 'When does no δ, however small, let you win?',
    s3e: 'This step asks: what does “the limit does not exist” look like in this game? It means that for <strong>every</strong> candidate L the opponent can name some ε that beats any δ you choose: the cyan band always contains a point x with |f(x) − L| ≥ ε, called a <strong>counterexample</strong>. Here ε = 0.5 and a = 0 are fixed. None of the four functions below is defined at 0; the page searches 0 < |x| < δ for a counterexample and marks it with a red dot. The horizontal axis rescales with δ and is labelled in units of δ, so you always see the stretch around the cyan band.',
    kJump: 'Jump: 1 for x > 0, −1 for x < 0', kOsc: 'Oscillation: sin(1/x)', kBlow: 'Blow-up: 1/x²', kDamped: 'Control: x·sin(1/x)',
    L3: 'Candidate limit L', k3: 'Half-width δ of the cyan band',
    c3a: 'Near a = 0 (horizontal unit: δ)',
    s3found: 'L = {L}, δ = {d}: counterexample x = {x} with f(x) = {fx}, so |f(x) − L| = {err} ≥ 0.5. You lose this round.',
    s3proof: 'L = {L}, δ = {d}: |x·sin(1/x) − L| ≤ |x| + |L| < δ + |L| ≤ 0.5, so the cyan band cannot contain a counterexample. You win.',
    s3none: 'L = {L}, δ = {d}: 8,000 points sampled densely in the band turned up no counterexample, but δ > 0.5 − |L|, so this is not yet a proof. Shrink δ below 0.5 − |L| for a guarantee.',
    s3hint: 'What to watch: pick “Jump”, put L anywhere, and shrink δ all the way. The red dot never goes away: on either side of 0 the values are 1 and −1, which differ by 2, so they cannot both be within 0.5 of L. “Oscillation” is the same story: inside every band sin(1/x) hits both 1 and −1. In “Blow-up”, f exceeds any number inside the band. Finally pick “Control”: with L = 0, shrinking δ below 0.5 wins, because the factor x squeezes the oscillation.',

    s4k: 'Step 4 · Sequences: ε–N',
    s4t: 'When does a sequence a₁, a₂, a₃, … “approach L”?',
    s4e: 'This step asks: a sequence has no x to move closer, so what does its limit mean? Replace δ with a position <strong>N</strong> in the sequence. The opponent names ε, and you must find N such that <strong>every</strong> term from the N-th on satisfies |aₙ − L| < ε. If you can do that for every ε, we say <strong>lim(n→∞) aₙ = L</strong>. The graph puts the index n across and the term’s value up; the green band is L ± ε, terms outside it are red, and a vertical line marks N, with no red to its right. The limit of a geometric series is defined exactly this way (<a class="xlink" href="../../../math/algebra/sequences-series/#step3">→ Sequences, step 3: geometric sums and their limit</a>).',
    qAlt: 'Swinging in: aₙ = 1 + (−1)ⁿ·2/n', qSin: 'Creeping in: aₙ = sin(n)/√n', qFlip: 'Flip-flop: aₙ = (−1)ⁿ',
    k4: 'Error ε',
    c4a: 'Across: index n; up: aₙ',
    lgTerm: 'terms inside the band', lgOut: 'terms outside the band', lgN: 'vertical line: N',
    s4readAlt: 'ε = {e}: the last term outside the band is number {last}, so N = {N}. Check: |aₙ − 1| = 2/n, which is below ε once n > 2/ε = {b}.',
    s4readSin: 'ε = {e}: checking term by term gives the smallest N = {N} (the last red dot is term {last}). The N guaranteed by |sin n| ≤ 1 is {G} (once n > 1/ε², 1/√n < ε), a little larger than needed: a proof only needs an N that works, not the smallest one.',
    s4readFlip: 'ε = {e}: the terms jump between 1 and −1, so neighbours differ by 2. With ε ≤ 1 no L can be within ε of two neighbours at once, so there is no N and the sequence has no limit.',
    s4hint: 'What to watch: pick the first sequence and drag ε from 1 to 0.01. The line N moves right (ε ten times smaller makes N about ten times larger), but an N always exists. Switch to the second: N grows faster (about 1/ε²) and the axis stretches to keep up. Finally switch to (−1)ⁿ: across the whole slider (ε ≤ 1) red dots run all the way to the right edge, and there is no N.',

    s5k: 'Step 5 · A rule is a proof',
    s5t: 'Why does one δ rule that works for every ε count as a proof?',
    s5e: 'This step asks: to prove lim(x→2) x² = 4 you cannot play every possible ε, so what do you do? Give a <strong>rule</strong>: whatever ε arrives, compute δ from a formula. If the rule wins for every ε > 0, the proof is done. The three candidate rules below all “look reasonable”. The left panel shows the δ the rule gives at the current ε (cyan band), with an orange line at the largest winning δ*. The right panel puts ε across (log scale, 0.01 to 100) and δ ÷ δ* up; wherever it rises above 1 (red), the rule loses to that ε.',
    rA: 'δ = ε/4 (4 is the slope of x² at 2)', rB: 'δ = ε/5', rC: 'δ = min(1, ε/5)',
    k5: 'Opponent’s ε',
    c5a: 'y = x² near a = 2', c5b: 'δ ÷ δ* (ε across, log scale)',
    lgRule: 'δ from the rule', lgDs5: 'largest winning δ*',
    s5ok: 'ε = {e}: δ = {d} ≤ δ* = {ds}, so this round is won. {global}',
    s5bad: 'ε = {e}: δ = {d} > δ* = {ds}, a loss. Counterexample: x = {x} is within δ of 2, yet x² − 4 = {err} ≥ ε. {global}',
    gA: 'This rule loses to every ε: δ* = ε ÷ (√(4 + ε) + 2) is always a little smaller than ε/4 (for small ε the gap is tiny, nearly invisible on the left, plain on the right).',
    gB: 'This rule wins for ε ≤ 5 and loses for ε > 5: once δ gets too wide, x can travel far enough that x + 2 exceeds 5 and x² grows faster than planned.',
    gC: 'This rule wins for every ε: δ ≤ 1 keeps |x + 2| < 5, so |x² − 4| = |x − 2|·|x + 2| < (ε/5)·5 = ε. That is a complete proof.',
    quizPrompt: 'Think: to prove lim(x→2) (3x + 1) = 7, which rule wins for every ε?',
    quizA: 'δ = 3ε', quizB: 'δ = ε/3', quizC: 'δ = ε + 1',
    check: 'Check',
    correct: 'Right. |(3x + 1) − 7| = 3|x − 2| < 3δ = ε. A straight line is equally steep everywhere, so a proportional rule is enough and no min(1, …) is needed.',
    wrong: 'Not quite. |(3x + 1) − 7| = 3|x − 2|. How small must |x − 2| be for that to stay below ε?',
    s5hint: 'What to watch: pick “δ = ε/4” and drag ε from 100 down to 0.01. The whole right-hand curve sits above 1, while on the left the difference is almost invisible for small ε, exactly where trusting the picture would fool you. Then pick “δ = ε/5”: the curve crosses 1 at ε = 5. Finally pick “min(1, ε/5)”: the curve never rises above 1.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'The precise meaning of “closer and closer”',
    s6fin: 'The precise form of “f(x) approaches L as x approaches a” is: <strong>for every ε > 0 there is a δ > 0 such that 0 < |x − a| < δ implies |f(x) − L| < ε</strong>. ε is the error the opponent allows and δ is your reply; how large a δ can win depends on how steep the function is near a. A limit fails to exist when the opponent can always find a counterexample; for sequences, δ becomes an index N; and a δ rule that wins against every ε is itself a proof.',
    formula: 'lim(x→a) f(x) = L  ⇔  ∀ε > 0 ∃δ > 0: 0 < |x − a| < δ ⇒ |f(x) − L| < ε\nlim(n→∞) aₙ = L  ⇔  ∀ε > 0 ∃N: n ≥ N ⇒ |aₙ − L| < ε\nf(x) = x²: δ* = √(a² + ε) − a ≈ ε ÷ (2a)',
    boundary: 'Notes: every largest δ on this page is computed exactly from a formula, not read off a graph. Step 3’s “no counterexample found” is a sampling check, and only an inequality counts as a guarantee. Arithmetic is double-precision floating point; step 0 stops at h = 10⁻⁶, where rounding error is far below the digits shown. One-sided limits, limits as x → ∞ and continuity extend the same language and are not covered here.',
    linksTitle: 'Where to next',
    lk1: '→ Derivative, step 1: secants close in on the tangent; a derivative is a limit',
    lk2: '→ Sequences, step 3: geometric sums and the limit of partial sums',
    lk3: '→ Real number line, step 3: bisection gets closer every time',
    lk4: '→ Taylor series, step 2: when can the error be made smaller than any number you name?',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Limits and ε–δ · Name How Close, and I Can Get That Close”.'
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
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
