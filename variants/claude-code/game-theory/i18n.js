'use strict';
// Game theory lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '博弈论 · 先猜对手，再选自己',
    back: '← 知识索引',
    compare: '对照另一版本：博弈论 · 先看对手会怎么选 →',
    navLabel: '博弈论步骤导航',
    tagline: '两个人各自出招，谁得多少由两个人的选择一起决定。只看自己的收益挑「最好」的一招，常常挑不出来，因为最好的一招取决于对手出什么。七步里你会用一张 2×2 收益矩阵，依次找出最佳回应、占优策略、纳什均衡，再算出随机出招时的概率。',
    nav0: '0 收益矩阵', nav1: '1 最佳回应', nav2: '2 占优策略', nav3: '3 纳什均衡', nav4: '4 混合策略', nav5: '5 回应曲线', nav6: '6 收束与自测',
    gameLabel: '选一个博弈',
    pd: '囚徒困境', stag: '猎鹿', concert: '约会选节目', pennies: '猜硬币', chicken: '懦夫博弈', harmony: '和谐博弈', edge: '边界（有平局）', random: '随机博弈',
    pd0: '合作', pd1: '背叛', stag0: '猎鹿', stag1: '抓兔', concert0: '音乐会', concert1: '球赛', pennies0: '正面', pennies1: '反面', chicken0: '让路', chicken1: '直冲', random0r: '上', random1r: '下', random0c: '左', random1c: '右',
    storyPd: '两名嫌犯分开审讯：都沉默（合作）各判轻罪，一人招供（背叛）一人沉默则招供者得利、沉默者重判，都招供则都判得较重。收益越大越好。',
    storyStag: '两名猎人：一起猎鹿收获最大，但一个人猎不到鹿；抓兔子一个人就能成，收获较小但稳。',
    storyConcert: '两人约好晚上见面，却没商量去哪：行玩家更想听音乐会，列玩家更想看球赛，但最不想的是各去各的。',
    storyPennies: '两人同时亮出硬币的一面：一样则行玩家赢 1，不一样则列玩家赢 1。一方之得正是另一方之失。',
    storyChicken: '两车相向而行：都让路相安无事，一方直冲一方让路则直冲者占面子，都直冲则两败俱伤。',
    storyRandom: '收益是随机生成的 0–5 的整数，没有故事，只有数字。',
    legRow: '橙色数 = 行玩家的收益', legCol: '青色数 = 列玩家的收益', legNE: '绿框 = 纯策略纳什均衡',
    yes: '是', no: '否', tieBR: '两者一样好', listSep: '、', quote: '「{x}」', devFmt: '行想改：{a}，列想改：{b}',

    s0k: '第 0 步 · 写下博弈',
    s0t: '两个人同时出招，谁得多少由两人一起决定——怎样把它写清楚？',
    s0e: '这一步要回答：结果取决于双方选择的局面，用什么来描述？一个<strong>博弈</strong>由三样东西组成：玩家（这里两人，「行玩家」和「列玩家」）、每人可选的行动（各两种）、以及每种行动组合下每人的<strong>收益</strong>（一个数，越大表示这人越喜欢这个结果；它表示偏好的高低，不一定是钱）。把它们排成一张表就是<strong>收益矩阵</strong>：行玩家选哪一行，列玩家选哪一列，两人的选择落在同一个格子里；格子里「橙色数, 青色数」分别是行玩家和列玩家的收益。本页只讨论<strong>同时出招、只玩一次</strong>的博弈：出招时不知道对方选什么，但双方都看得到整张表。',
    rowPick: '行玩家出', colPick: '列玩家出',
    s0readout: '{game}：行玩家出「{ra}」、列玩家出「{ca}」→ 行玩家得 {a}，列玩家得 {b}。{story}',
    s0hint: '观察顺序：先选「囚徒困境」，把四个格子都点一遍。注意：你（行玩家）只决定落在哪一行，落在哪一列由对手决定。只看自己这一行里的橙色数，不知道对手出什么，就说不出哪一行「最好」——下一步先把对手的出招固定下来。',

    s1k: '第 1 步 · 最佳回应',
    s1t: '如果已经知道对手出什么，我该出什么？',
    s1e: '这一步要回答：把对手的行动固定住，自己的最优选择是什么？这个选择叫<strong>最佳回应</strong>：给定对手的行动，让自己收益最大的行动。行玩家的做法是固定一列，上下比较两个橙色数（行玩家自己的收益），画一个橙色箭头指向更大的那个格子；列玩家固定一行，左右比较两个青色数，画一个青色箭头。注意每个箭头只比较<strong>同一个人自己的</strong>收益：对手得多少，不影响箭头的方向。',
    assumeCol: '假设列玩家出', assumeRow: '假设行玩家出', showAllArrows: '显示全部箭头',
    s1lgRow: '橙色箭头：行玩家在这一列里改去更好的一行', s1lgCol: '青色箭头：列玩家在这一行里改去更好的一列',
    s1readout: '若列玩家出「{c}」：行玩家出「{r0}」得 {x0}，出「{r1}」得 {x1} → 最佳回应：{br}。若行玩家出「{r}」：列玩家出「{c0}」得 {y0}，出「{c1}」得 {y1} → 最佳回应：{br2}。已看过 {seen}/4 个箭头。',
    s1hint: '观察顺序：先只换「假设列玩家出」，看橙色箭头在不同列里是否指向同一行；再换「假设行玩家出」看青色箭头。看过的箭头会淡淡地留在图上。在「猜硬币」里，最佳回应会随对手而变；在「囚徒困境」里却不变——下一步讲为什么。',

    s2k: '第 2 步 · 占优策略',
    s2t: '有没有一招，不管对手出什么都更好？',
    s2e: '这一步要回答：什么时候可以不猜对手？如果某个行动在对手的<strong>每一种</strong>行动下都严格更好，它叫<strong>严格占优策略</strong>，用它就行，不必猜。下面用一族对称博弈来看：两人都合作各得 R = 3，都背叛各得 P = 1；一人背叛一人合作时，背叛者得 T（诱惑），合作者得 S（吃亏）。左图是收益矩阵和箭头；右图横轴是 T、纵轴是 S，T = 3 和 S = 1 两条线把平面分成四类博弈，白点是当前的 (T, S)，走过的位置会留下灰点。',
    tSlider: '诱惑 T（我背叛、你合作时我得）', sSlider: '吃亏 S（我合作、你背叛时我得）',
    s2readout: '当前 T = {T}，S = {S}：{name}。{dom}纯策略纳什均衡：{ne}。{pareto}',
    domBoth: '背叛是双方的严格占优策略（{T} > 3 且 1 > {S}）：不管对手出什么，背叛都多得。',
    domCoop: '合作是双方的严格占优策略（3 > {T} 且 {S} > 1）：不管对手出什么，合作都多得。',
    domNone: '没有严格占优策略：最好出什么取决于对手出什么。',
    paretoNote: '可是均衡格 {cell} 双方各得 {u}，换到 {better} 两人都能多得（各 {v}）——各自理性的选择，合起来反而两人都更差。',
    s2hint: '观察顺序：从默认的 T = 5、S = 0 出发，先只把 T 拖到 3 以下，看背叛的占优地位什么时候消失、区域从「囚徒困境」变成什么；再把 S 拖到 1 以上。读数里「两人都更差」的提醒在囚徒困境区域一定出现，而且那里唯一的均衡就是更差的那个格子；在猎鹿区域它也会出现，但那里（合作，合作）本身也是均衡——问题变成了双方敢不敢相信对方。',

    s3k: '第 3 步 · 纳什均衡',
    s3t: '哪些格子是谁都不想单方面改的？',
    s3e: '这一步要回答：没有占优策略时，结局可能停在哪里？一个格子如果满足：行玩家单独换一行不会多得，列玩家单独换一列也不会多得，它就是<strong>纯策略纳什均衡</strong>。换句话说，双方都在对对方做最佳回应（第 1 步的箭头）。在箭头图上，就是没有箭头从它出去的格子，图中用绿框标出。它的意思是「谁都没有单方面改的理由」，不是「双方最满意」：第 2 步的囚徒困境里，均衡格对两人都不是最好的。',
    newRandom: '随机生成一个博弈',
    s3readout: '格子（{r}，{c}）：行玩家单独改出「{r2}」会{rowDelta}；列玩家单独改出「{c2}」会{colDelta}。{verdict}本博弈的纯策略纳什均衡：{list}。{tally}',
    more: '多得 {x}', less: '少得 {x}', same: '不变',
    verdictNE: '双方都不想单方面改 → 这是纳什均衡。', verdictNot: '至少一方想改 → 不是均衡。',
    none: '没有', cellFmt: '（{r}，{c}）',
    tally: '你已随机生成 {n} 个博弈：没有纯均衡的 {z} 个，恰有 1 个的 {o} 个，2 个或更多的 {t} 个。',
    s3hint: '观察顺序：先在「猎鹿」里把四个格子依次点一遍，看哪两个格子两种颜色的箭头都指进来；再换「猜硬币」——四个箭头首尾相接绕成一圈，没有格子留得住。最后连按「随机生成」，看计数：纯均衡可能有 0 个、1 个或更多个。',

    s4k: '第 4 步 · 混合策略',
    s4t: '没有纯均衡时，随机出招能不能让对手无从下手？',
    s4e: '这一步要回答：在猜硬币里，任何固定的出法都会被对手看穿，那该怎么出？办法是按概率出招，叫<strong>混合策略</strong>。设列玩家以概率 q 出第一列（左列）。行玩家出上一行的<strong>期望收益</strong>是按概率加权的平均：q × (左上的橙色数) + (1 − q) × (右上的橙色数)（<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ 期望值第 0 步：期望就是加权相加</a>）。它随 q 变成一条直线；出下一行是另一条直线。两线交点的 q 记作 q*：此时行玩家出哪行都一样好，叫<strong>无差异</strong>。若列玩家的 q 偏离 q*，行玩家就有一行严格更好，列玩家会被利用。所以在混合均衡里，列玩家的概率 q* 是由<strong>行玩家的收益</strong>决定的，反过来行玩家的概率 p*（出上一行的概率）由列玩家的收益决定。',
    qSlider: '列玩家出左列的概率 q', aSlider: '行玩家在左上格的收益（只改这一个数）',
    s4lgTop: '行玩家出上一行的期望收益', s4lgBot: '行玩家出下一行的期望收益', s4lgNow: '当前 q', s4lgStar: '交点 q*',
    s4axis: '横轴：q（0 到 1）；纵轴：行玩家的期望收益',
    s4readout: 'q = {q}：行玩家出「{r0}」期望 {e0}，出「{r1}」期望 {e1} → {verdict}。无差异点 q* = {qs}（只用行玩家的收益算）；列玩家的无差异点 p* = {ps}（只用列玩家的收益算）。',
    better: '出「{r}」更好，这个 q 会被行玩家利用', indiff: '两者一样好（无差异）',
    noStar: '不存在（两条线在 0 到 1 之间不相交：总有一行更好）',
    s4hint: '观察顺序：拖 q 越过 q*，看两条线谁在上面换了位置；再拖「行玩家在左上格的收益」：交点 q* 跟着移动，而 p* 一动不动。你改的是行玩家自己的收益，变的却是对手的出招概率。',

    s5k: '第 5 步 · 回应曲线',
    s5t: '把全部均衡一次画出来：两条最佳回应线交在哪里？',
    s5e: '这一步要回答：一个博弈的所有纳什均衡（纯的和混合的）怎样一眼找全？横轴是列玩家出左列的概率 q，纵轴是行玩家出上一行的概率 p。橙线是行玩家的最佳回应：对每个 q，最好的 p 是多少（q 在 q* 一侧时出纯上行，另一侧出纯下行，恰好 q = q* 时任何 p 都一样好，所以有一段竖线）。青线是列玩家的最佳回应。两线的<strong>交点</strong>正是双方同时在做最佳回应的点，也就是全部纳什均衡：角上的交点是纯均衡，内部的交点是混合均衡。按钮运行一个学习模型「<strong>虚拟对局</strong>」：假想两人反复玩这个博弈，每一轮都对对方到目前为止各招出现的频率做最佳回应；白色轨迹是两人的频率 (q, p)。这是对「均衡怎么被找到」的一种假设，不是单次博弈本身的一部分。',
    play5: '虚拟对局 400 轮', clear5: '清除轨迹',
    s5lgRow: '行玩家的最佳回应 p(q)', s5lgCol: '列玩家的最佳回应 q(p)', s5lgNE: '交点 = 纳什均衡', s5lgPath: '虚拟对局的频率轨迹',
    s5axis: '横轴：q = 列出左列的概率；纵轴：p = 行出上一行的概率',
    s5readout: '{game}的纳什均衡：{list}。{fp}',
    neMixed: '混合 (p, q) = ({p}, {q})', nePure: '纯 {cell}',
    s5fp: '虚拟对局第 {k}/{N} 轮：行出上一行的频率 p = {p}，列出左列的频率 q = {q}，离最近的均衡 {d}。',
    s5hint: '观察顺序：先看「猜硬币」：两条线只在中心 (0.5, 0.5) 相交，按「虚拟对局」，轨迹绕着中心一圈圈打转并慢慢靠近。再换「约会选节目」：三个交点（两个角、一个内点），轨迹会走到一个角上的纯均衡。最后看「懦夫博弈」：两人从同样的起点出发、每轮出同一招，轨迹沿对角线走向内部的混合均衡。',

    s6k: '第 6 步 · 收束',
    s6t: '收束：先看对手，再选自己——自测找均衡',
    s6fin: '六步的主线是：<strong>你的最好选择取决于对手，所以先固定对手、再选自己</strong>。最佳回应只比较自己的收益；严格占优策略是对手怎样都最好的一招，此时不必猜；纳什均衡是双方都在最佳回应、谁都不想单方面改的局面，它不保证对两人最好；没有纯均衡时，混合均衡里每人的概率要让<strong>对方</strong>无差异，所以由对方的收益决定；两条最佳回应线的交点就是全部均衡。',
    formula: '纯均衡：A[i][j] ≥ A[1−i][j] 且 B[i][j] ≥ B[i][1−j]\nq* 使行玩家无差异：q·A[0][0] + (1−q)·A[0][1] = q·A[1][0] + (1−q)·A[1][1]\np* 使列玩家无差异：p·B[0][0] + (1−p)·B[1][0] = p·B[0][1] + (1−p)·B[1][1]',
    boundary: '适用范围：两名玩家、各两种行动、同时出招、只玩一次、双方都知道整张收益表。真人常常不按纳什均衡出招（会讲公平、会犯错、会重复交往）；重复博弈、信息不对称、多于两人的情形本页都没有讲。收益数字代表偏好的高低，混合均衡要求按期望收益比较。',
    quizTitle: '自测：随机生成一个博弈，勾出所有纯策略纳什均衡（可能一个都没有）',
    checkQ: '核对', newQ: '换一个博弈', showQ: '看答案',
    qRight: '对了。纯均衡是：{list}。', qWrong: '还不对。逐格检查：行玩家单独换行会不会多得？列玩家单独换列会不会多得？两人都不会多得的格子才是。',
    qShown: '答案：{list}。{detail}',
    detailCell: '（{r}，{c}）{v}',
    linksTitle: '接着去哪里',
    lk1: '→ 期望值第 0 步：混合策略的期望收益就是加权相加',
    lk2: '→ 无知之幕第 2 步：最大最小原则——不猜对手，只防最坏',
    lk3: '→ 多臂老虎机第 1 步：反复尝试中的探索与利用',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《博弈论 · 先看对手会怎么选》的平行版本。'
  },
  en: {
    pageTitle: 'Game Theory · Guess Their Move, Then Choose Yours',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Game Theory · Look at the Other Choice First →',
    navLabel: 'Game theory steps',
    tagline: 'Two people each choose a move, and what each gets depends on both choices. Looking only at your own payoffs often won’t tell you which move is best, because the best move depends on what the other person does. Over seven steps you will use a 2×2 payoff matrix to find best responses, dominant strategies and Nash equilibria, then work out the probabilities behind randomised play.',
    nav0: '0 Payoff matrix', nav1: '1 Best response', nav2: '2 Dominance', nav3: '3 Nash equilibrium', nav4: '4 Mixed strategies', nav5: '5 Response curves', nav6: '6 Wrap-up & check',
    gameLabel: 'Pick a game',
    pd: 'Prisoner’s Dilemma', stag: 'Stag Hunt', concert: 'Date Night', pennies: 'Matching Pennies', chicken: 'Chicken', harmony: 'Harmony', edge: 'Boundary (ties)', random: 'Random game',
    pd0: 'Cooperate', pd1: 'Defect', stag0: 'Stag', stag1: 'Hare', concert0: 'Concert', concert1: 'Football', pennies0: 'Heads', pennies1: 'Tails', chicken0: 'Swerve', chicken1: 'Straight', random0r: 'Top', random1r: 'Bottom', random0c: 'Left', random1c: 'Right',
    storyPd: 'Two suspects are questioned separately. If both stay silent (cooperate) each gets a light sentence; if one confesses (defects) while the other stays silent, the confessor does well and the silent one is punished hard; if both confess, both get fairly heavy sentences. Bigger payoff = better.',
    storyStag: 'Two hunters: hunting a stag together pays the most, but nobody can catch a stag alone. A hare can be caught single-handed — smaller, but safe.',
    storyConcert: 'Two people agreed to meet tonight but not where. Row would rather go to a concert, Column to the football — yet the worst outcome is ending up in different places.',
    storyPennies: 'Both reveal a coin at once. If the faces match, Row wins 1; if they differ, Column wins 1. One player’s gain is exactly the other’s loss.',
    storyChicken: 'Two cars head straight at each other. If both swerve, nothing happens; if one goes straight and the other swerves, the one who held on wins face; if both go straight, both lose badly.',
    storyRandom: 'Payoffs are random whole numbers from 0 to 5 — no story, just numbers.',
    legRow: 'orange number = Row’s payoff', legCol: 'cyan number = Column’s payoff', legNE: 'green frame = pure-strategy Nash equilibrium',
    yes: 'yes', no: 'no', tieBR: 'both equally good', listSep: '; ', quote: '“{x}”', devFmt: 'Row wants to switch: {a}, Column: {b}',

    s0k: 'Step 0 · Writing a game down',
    s0t: 'Two people move at once and each one’s payoff depends on both moves — how do you write that down?',
    s0e: 'This step asks: how do you describe a situation where the outcome depends on everyone’s choices? A <strong>game</strong> has three ingredients: players (here two, “Row” and “Column”), the actions each can take (two each), and each player’s <strong>payoff</strong> for every combination of actions — a number where bigger means that player likes the outcome more. It ranks preferences; it need not be money. Laid out as a table this is the <strong>payoff matrix</strong>: Row picks a row, Column picks a column, and the two choices meet in one cell, which shows “orange, cyan” — Row’s payoff, then Column’s. This page covers games played <strong>once, with simultaneous moves</strong>: when you move you don’t know the other’s choice, but both of you can see the whole table.',
    rowPick: 'Row plays', colPick: 'Column plays',
    s0readout: '{game}: Row plays “{ra}”, Column plays “{ca}” → Row gets {a}, Column gets {b}. {story}',
    s0hint: 'What to watch: pick Prisoner’s Dilemma and click through all four cells. Notice that you (Row) only choose the row; your opponent chooses the column. Looking at the orange numbers in your own row, without knowing their move, you can’t say which row is “best” — so the next step pins down the opponent’s move first.',

    s1k: 'Step 1 · Best response',
    s1t: 'If I already knew the other player’s move, what should I play?',
    s1e: 'This step asks: with the opponent’s action held fixed, what is my best choice? That choice is a <strong>best response</strong>: the action that maximises your own payoff given what the other player does. Row fixes a column, compares the two orange numbers (Row’s own payoffs) up and down, and draws an orange arrow towards the larger one; Column fixes a row, compares the two cyan numbers left and right, and draws a cyan arrow. Each arrow compares <strong>one player’s own</strong> payoffs only — what the opponent gets plays no part in its direction.',
    assumeCol: 'Suppose Column plays', assumeRow: 'Suppose Row plays', showAllArrows: 'Show all arrows',
    s1lgRow: 'orange arrow: Row moves to the better row within this column', s1lgCol: 'cyan arrow: Column moves to the better column within this row',
    s1readout: 'If Column plays “{c}”: Row gets {x0} from “{r0}” and {x1} from “{r1}” → best response: {br}. If Row plays “{r}”: Column gets {y0} from “{c0}” and {y1} from “{c1}” → best response: {br2}. Arrows seen: {seen}/4.',
    s1hint: 'What to watch: first change only “Suppose Column plays” and see whether the orange arrow points to the same row in both columns; then change “Suppose Row plays” for the cyan arrows. Arrows you have seen stay on the picture, faded. In Matching Pennies the best response flips with the opponent’s move; in the Prisoner’s Dilemma it never does — the next step explains why.',

    s2k: 'Step 2 · Dominance',
    s2t: 'Is there a move that is better whatever the other player does?',
    s2e: 'This step asks: when can you stop guessing about the opponent? If one action is strictly better against <strong>every</strong> action of the opponent, it is a <strong>strictly dominant strategy</strong>, and you can just play it. Look at a family of symmetric games: if both cooperate each gets R = 3, if both defect each gets P = 1; if one defects while the other cooperates, the defector gets T (the temptation) and the cooperator gets S (the sucker’s payoff). The left picture is the matrix with its arrows; on the right, T runs across and S runs up, the lines T = 3 and S = 1 cut the plane into four kinds of game, the white dot is the current (T, S), and positions you have visited leave grey dots.',
    tSlider: 'Temptation T (I defect, you cooperate)', sSlider: 'Sucker’s payoff S (I cooperate, you defect)',
    s2readout: 'T = {T}, S = {S}: {name}. {dom}Pure-strategy Nash equilibria: {ne}. {pareto}',
    domBoth: 'Defect is strictly dominant for both players ({T} > 3 and 1 > {S}): whatever the opponent does, defecting pays more. ',
    domCoop: 'Cooperate is strictly dominant for both players (3 > {T} and {S} > 1): whatever the opponent does, cooperating pays more. ',
    domNone: 'No strictly dominant strategy: the best move depends on the opponent’s move. ',
    paretoNote: 'Yet in the equilibrium {cell} each player gets {u}, while {better} would give both of them more ({v} each) — choices that are rational one by one leave both worse off together.',
    s2hint: 'What to watch: start from the default T = 5, S = 0. Drag only T below 3 and see when defecting stops being dominant and which region you land in; then drag S above 1. The “both worse off” remark always appears in the Prisoner’s Dilemma region, where the only equilibrium is the worse cell; it shows up in the Stag Hunt region too, but there (Cooperate, Cooperate) is also an equilibrium — the question becomes whether each dares to trust the other.',

    s3k: 'Step 3 · Nash equilibrium',
    s3t: 'Which cells would neither player change on their own?',
    s3e: 'This step asks: with no dominant strategy, where can play settle? A cell is a <strong>pure-strategy Nash equilibrium</strong> when Row gains nothing by switching rows alone and Column gains nothing by switching columns alone — in other words, each is playing a best response to the other (the arrows from step 1). On the arrow picture it is a cell with no arrow leaving it, framed in green. It means “nobody has a reason to change unilaterally”, not “both are as happy as possible”: in step 2’s Prisoner’s Dilemma the equilibrium is not the best cell for either player.',
    newRandom: 'Generate a random game',
    s3readout: 'Cell ({r}, {c}): if Row alone switches to “{r2}” Row would {rowDelta}; if Column alone switches to “{c2}” Column would {colDelta}. {verdict}Pure-strategy Nash equilibria of this game: {list}. {tally}',
    more: 'gain {x}', less: 'lose {x}', same: 'get the same',
    verdictNE: 'Neither wants to switch alone → this is a Nash equilibrium. ', verdictNot: 'At least one player wants to switch → not an equilibrium. ',
    none: 'none', cellFmt: '({r}, {c})',
    tally: 'Random games so far: {n} — {z} with no pure equilibrium, {o} with exactly one, {t} with two or more.',
    s3hint: 'What to watch: in the Stag Hunt, click the four cells in turn and find the two that both colours of arrow point into. Switch to Matching Pennies — the four arrows chase each other round in a loop and no cell holds. Then press “Generate a random game” repeatedly and watch the tally: a game can have no pure equilibrium, one, or several.',

    s4k: 'Step 4 · Mixed strategies',
    s4t: 'With no pure equilibrium, can random play leave the opponent nothing to exploit?',
    s4e: 'This step asks: in Matching Pennies any fixed move gets found out, so how should you play? Play by probability — a <strong>mixed strategy</strong>. Say Column plays the left column with probability q. Row’s <strong>expected payoff</strong> from the top row is the probability-weighted average q × (top-left orange) + (1 − q) × (top-right orange) (<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ Expected value, step 0: an expectation is a weighted sum</a>). As q varies this traces a straight line; the bottom row gives another. Where they cross, at q*, Row does equally well with either row — Row is <strong>indifferent</strong>. If Column’s q drifts away from q*, one row becomes strictly better and Column can be exploited. So in a mixed equilibrium, Column’s probability q* is pinned down by <strong>Row’s payoffs</strong>, and Row’s probability p* (of playing top) by Column’s payoffs.',
    qSlider: 'Probability q that Column plays left', aSlider: 'Row’s payoff in the top-left cell (only this number changes)',
    s4lgTop: 'Row’s expected payoff from the top row', s4lgBot: 'Row’s expected payoff from the bottom row', s4lgNow: 'current q', s4lgStar: 'crossing q*',
    s4axis: 'Across: q (0 to 1); up: Row’s expected payoff',
    s4readout: 'q = {q}: Row expects {e0} from “{r0}” and {e1} from “{r1}” → {verdict}. Indifference point q* = {qs} (computed from Row’s payoffs only); Column’s indifference point p* = {ps} (from Column’s payoffs only).',
    better: '“{r}” is better, so Row can exploit this q', indiff: 'both equally good (indifferent)',
    noStar: 'none (the lines don’t cross between 0 and 1: one row is always better)',
    s4hint: 'What to watch: drag q across q* and see the two lines swap places on top. Then drag Row’s top-left payoff: the crossing q* slides along, while p* doesn’t move at all. You changed Row’s own payoff, and what shifted was the opponent’s probability.',

    s5k: 'Step 5 · Response curves',
    s5t: 'Draw every equilibrium at once: where do the two best-response lines cross?',
    s5e: 'This step asks: how do you find all of a game’s Nash equilibria — pure and mixed — in one picture? Across is q, the probability Column plays left; up is p, the probability Row plays top. The orange line is Row’s best response: for each q, the best p (pure top on one side of q*, pure bottom on the other, and at exactly q = q* any p is as good, hence a vertical segment). The cyan line is Column’s best response. Where the two lines <strong>cross</strong>, both are best-responding at once — those are exactly the Nash equilibria: crossings at corners are pure, crossings inside are mixed. The button runs a learning model, <strong>fictitious play</strong>: imagine the two playing the game over and over, each round best-responding to how often the other has played each move so far. The white trail is their frequencies (q, p). It is one hypothesis about how equilibria get found, not part of the one-shot game itself.',
    play5: 'Run 400 rounds of fictitious play', clear5: 'Clear trail',
    s5lgRow: 'Row’s best response p(q)', s5lgCol: 'Column’s best response q(p)', s5lgNE: 'crossing = Nash equilibrium', s5lgPath: 'fictitious-play frequency trail',
    s5axis: 'Across: q = probability Column plays left; up: p = probability Row plays top',
    s5readout: 'Nash equilibria of {game}: {list}. {fp}',
    neMixed: 'mixed (p, q) = ({p}, {q})', nePure: 'pure {cell}',
    s5fp: 'Fictitious play, round {k}/{N}: Row’s top frequency p = {p}, Column’s left frequency q = {q}; distance to the nearest equilibrium {d}.',
    s5hint: 'What to watch: start with Matching Pennies — the lines cross only at the centre (0.5, 0.5); run fictitious play and the trail circles the centre, closing in slowly. Switch to Date Night: three crossings (two corners and one inside), and the trail heads to a pure equilibrium in a corner. Finally Chicken: both start from the same point and play the same move every round, so the trail runs along the diagonal towards the interior mixed equilibrium.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Wrap-up: look at the other side first — then find equilibria yourself',
    s6fin: 'The thread through all six steps: <strong>your best move depends on the opponent, so fix their move first and then choose yours</strong>. A best response compares only your own payoffs. A strictly dominant strategy is best whatever the opponent does, so no guessing is needed. A Nash equilibrium is where both are best-responding and nobody wants to deviate alone — with no promise that it is good for either. When no pure equilibrium exists, each player’s mixing probability must make the <strong>other</strong> player indifferent, so it is set by the other player’s payoffs. And the crossings of the two best-response lines are all the equilibria there are.',
    formula: 'Pure equilibrium: A[i][j] ≥ A[1−i][j] and B[i][j] ≥ B[i][1−j]\nq* makes Row indifferent: q·A[0][0] + (1−q)·A[0][1] = q·A[1][0] + (1−q)·A[1][1]\np* makes Column indifferent: p·B[0][0] + (1−p)·B[1][0] = p·B[0][1] + (1−p)·B[1][1]',
    boundary: 'Where this applies: two players, two actions each, simultaneous moves, played once, with both players knowing the whole payoff table. Real people often don’t play Nash equilibria (they care about fairness, make mistakes, and deal with each other repeatedly); repeated games, hidden information and more than two players are not covered here. Payoff numbers rank preferences, and mixed equilibria assume players compare expected payoffs.',
    quizTitle: 'Self-check: a random game — tick every pure-strategy Nash equilibrium (there may be none)',
    checkQ: 'Check', newQ: 'Another game', showQ: 'Show answer',
    qRight: 'Correct. The pure equilibria are: {list}.', qWrong: 'Not yet. Check each cell: would Row gain by switching rows alone? Would Column gain by switching columns alone? Only cells where neither gains count.',
    qShown: 'Answer: {list}. {detail}',
    detailCell: '({r}, {c}) {v}',
    linksTitle: 'Where to go next',
    lk1: '→ Expected value, step 0: a mixed strategy’s payoff is a weighted sum',
    lk2: '→ Veil of ignorance, step 2: the maximin rule — don’t guess, guard against the worst',
    lk3: '→ Multi-armed bandits, step 1: exploring versus exploiting over repeated tries',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Game Theory · Look at the Other Choice First”.'
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
  if (typeof window.refreshGT === 'function') window.refreshGT();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.GT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
