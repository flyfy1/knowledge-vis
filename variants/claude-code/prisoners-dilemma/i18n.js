'use strict';
// Prisoner's dilemma lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '囚徒困境 · 合作要靠「还有下一次」',
    back: '← 知识索引',
    compare: '对照另一版本：囚徒困境与演化博弈 · 合作怎样活下来 →',
    navLabel: '囚徒困境步骤导航',
    tagline: '两个人各自选择合作或背叛。规则写在一张收益表里，每个人只关心自己的得分。已知这张表，想求的是：只打一次时会发生什么；反复打、或者在一大群人里一代代传下去时，合作能不能活下来，靠的是什么条件。七步里你会亲手对局、办循环赛、调「还有下一轮」的概率、看一个种群怎样演化，最后再加上手滑犯错。',
    nav0: '0 打一次', nav1: '1 连打多轮', nav2: '2 循环赛', nav3: '3 未来的影子', nav4: '4 种群演化', nav5: '5 犯错与宽容', nav6: '6 收束',
    sn_allc: '全合作', sn_alld: '全背叛', sn_tft: '以牙还牙', sn_grim: '冷酷', sn_wsls: '赢留输变', sn_gtft: '宽容以牙还牙',
    C: '合作', D: '背叛',

    s0k: '第 0 步 · 只打一次',
    s0t: '两个人都知道合作对双方更好，为什么还是会背叛？',
    s0e: '这一步要回答：只打一次、不能商量时，一个只看自己得分的人会怎么选？下表是<strong>收益表</strong>：行是你的选择，列是对方的选择，每格写着你得几分、对方得几分。两人都<strong>合作</strong>各得 3 分（R，奖励）；两人都<strong>背叛</strong>各得 1 分（P，惩罚）；一人背叛、一人合作，背叛者得 5 分（T，诱惑），合作者得 0 分（S，吃亏）。点表格的一格，就同时选定了你和对方的动作；下图比较「对方这样选时，你合作得几分、背叛得几分」，这叫找<strong>最佳回应</strong>（<a class="xlink" href="../../../math/applied/game-theory/#step1">→ 博弈论页第 1 步：最佳回应怎么找</a>）。',
    mHead: '你 \\ 对方', mCell: '你 {me} · 对方 {them}',
    c0a: '若对方合作：你的得分', c0b: '若对方背叛：你的得分',
    s0lgC: '你合作', s0lgD: '你背叛', s0lgPick: '外框 = 你在表里选中的动作',
    s0readout: '你{me}、对方{them}：你得 {a} 分，对方得 {b} 分，合计 {sum}。对方合作时你背叛比合作多 {gain1} 分，对方背叛时多 {gain2} 分：不管对方怎么选，背叛都多得分，这叫背叛是<b>占优策略</b>。可两人都这样想，结局是各得 1 分，比都合作的各 3 分差。',
    s0hint: '观察顺序：先点「对方合作」那一列的两格，比较下图上半部分两根条；再点「对方背叛」那一列，比较下半部分。两次都是橙色（背叛）更长。最后看右下角「都背叛」和左上角「都合作」的合计分数。',

    s1k: '第 1 步 · 同一对人连打多轮',
    s1t: '如果同样两个人要连打很多轮，结局会变吗？',
    s1e: '这一步要回答：重复对局时，一种「看着上一轮再决定」的打法能不能把对方拉进合作？<strong>策略</strong>就是一条规则：根据上一轮两人各出了什么，决定这一轮出什么。本页用五种：<strong>全合作</strong>（永远合作）、<strong>全背叛</strong>（永远背叛）、<strong>以牙还牙</strong>（第一轮合作，之后照抄对方上一轮）、<strong>冷酷</strong>（一直合作，直到有人背叛一次，此后永远背叛）、<strong>赢留输变</strong>（上一轮得 3 或 5 分就重复自己的动作，得 0 或 1 分就换）。上图每格是一轮，绿色是合作、红色是背叛；下图是两人累计得分。',
    pA: '玩家 A 的策略', pB: '玩家 B 的策略', n1: '轮数 n', play1: '逐轮播放',
    c1a: '每轮的动作（绿 = 合作，红 = 背叛）', c1b: '累计得分（横轴：第几轮）',
    s1lgC: '合作', s1lgD: '背叛', s1lgA: 'A 的累计得分', s1lgB: 'B 的累计得分',
    s1progress: '已播放 {k}/{n} 轮。',
    s1readout: '{prog}{nA}得 {a} 分（每轮 {pa}），{nB}得 {b} 分（每轮 {pb}）；{cc} 轮两人都合作，{dd} 轮都背叛。',
    s1hint: '观察顺序：先看以牙还牙对全背叛，按「逐轮播放」：以牙还牙只在第一轮吃亏，之后两人一直互相背叛，所以全背叛只比它多 5 分，与轮数无关。再把 B 换成冷酷或赢留输变：两个「先合作」的策略相遇后一路绿色，每轮各得 3 分。',

    s2k: '第 2 步 · 循环赛',
    s2t: '让几种策略两两对打，谁的总分最高？答案会随轮数变吗？',
    s2e: '这一步要回答：上一步只看一对；如果你不知道会遇到谁，哪种策略整体上更好？办法是<strong>循环赛</strong>：选中的每种策略和每一种（包括和自己的复制品）各打 n 轮。<strong>总分</strong> = 与每位对手对局的「每轮平均得分」之和，所以不同 n 之间可以直接比较；越大越好。左图是当前 n 的总分（从高到低）；右图是每种策略的总分随 n 的变化，竖线是当前 n。',
    n2: '每场轮数 n',
    c2a: '总分（当前 n）', c2b: '总分随轮数 n 变化',
    s2readout: 'n = {n}：排名 {rank}。{flip}',
    s2flip: '以牙还牙从 n = {k} 起总分超过全背叛。', s2noflip: '这组对手里以牙还牙在 n ≤ 50 内没有超过全背叛。', s2na: '（全背叛或以牙还牙没有参赛，所以不比较二者。）',
    s2hint: '观察顺序：先把 n 拖到 1：只打一轮时全背叛遥遥领先。再慢慢加大 n，看右图里全背叛那条线往下掉、以牙还牙往上走，两线交叉后排名翻转。然后取消勾选全合作和赢留输变，只剩三种策略再看一遍：交叉点会移动。排名取决于对手是谁，本页不宣布永远的赢家。',
    pickHint: '参赛策略（至少两种）：',

    s3k: '第 3 步 · 未来的影子',
    s3t: '下一轮还会来的可能性要多大，忍住不背叛才划算？',
    s3e: '这一步要回答：如果对局不知道哪天结束，「现在背叛一次」和「一直合作」哪个划算？设每打完一轮，还有下一轮的概率是 <strong>δ</strong>（0 到 1），于是平均要打 1/(1 − δ) 轮。对手是冷酷：你一背叛，它从下一轮起永远背叛。一直合作每轮得 R = 3；现在背叛，这一轮得 T，之后每轮只得 P = 1。为了能在同一把尺子上比，下图把两种做法的总收益都乘以 (1 − δ)，换算成「平均每轮收益」：合作是水平线 3，背叛是从 T 降到 1 的斜线。两线交点 δ* = (T − R)/(T − P)：δ 超过它，合作更划算。',
    delta: '还有下一轮的概率 δ', Tslider: '背叛的诱惑 T（R = 3、P = 1 不变）',
    c3: '平均每轮收益 vs δ',
    s3lgCoop: '一直合作：R = 3', s3lgDef: '现在背叛：T(1 − δ) + δ·P', s3lgStar: '交点 δ*',
    s3readout: 'δ = {d}（平均打 {rounds} 轮）：一直合作平均每轮 {c}，现在背叛平均每轮 {df}，{verdict}。T = {T} 时临界点 δ* = ({T} − 3)/({T} − 1) = {star}。',
    vCoop: '合作更划算', vDef: '背叛更划算', vTie: '两者相等',
    s3hint: '观察顺序：保持 T = 5，把 δ 从 0 拖到 0.9：红线从 5 往下降，在 δ = 0.5 处穿过青线，之后合作更划算。再把诱惑 T 调到 9：交点右移到 0.75，诱惑越大，越需要「未来」足够长。',

    s4k: '第 4 步 · 种群演化',
    s4t: '在一大群人里，三种策略的比例会怎样一代代变化？',
    s4e: '这一步要回答：如果策略不是由人挑选，而是「得分高的打法被更多人学去」，种群会走向哪里？种群里只有三种人：全背叛、以牙还牙、全合作，随机两两相遇，每场打 n 轮。每种人的平均每轮得分取决于此刻的人口比例。<strong>复制者动态</strong>的规则是：某策略的比例，按「它的得分 − 全体平均得分」的速度增长或减少（时间单位记作「代」）。左图是三角形：每个点是一种人口比例，离哪个角越近，那种策略占比越高（角上就是 100%）；彩线是比例随时间走过的路径。右图是同一路径上三种比例随时间的变化。',
    n4: '每场轮数 n', d4: '起始全背叛占比', t4: '其余人中以牙还牙所占比例', play4: '播放 60 代', clear4: '清空路径',
    c4a: '人口比例三角形（点击可设起点）', c4b: '三种比例随时间（横轴：代）',
    s4lgD: '全背叛', s4lgT: '以牙还牙', s4lgC: '全合作', s4lgPath: '路径（白点 = 起点）', s4lgThr: '红圈 = 边上的临界比例',
    s4readout: '{prog}起点：全背叛 {d0}%、以牙还牙 {t0}%、全合作 {c0}%。60 代后：全背叛 {d1}%、以牙还牙 {t1}%、全合作 {c1}%。{peak}{thr}',
    s4progress: '已播放 {g}/60 代。',
    s4peak: '途中全背叛最高到过 {p}%（第 {g} 代）。',
    s4thr: '只有全背叛和以牙还牙时，以牙还牙的占比要超过 1/(2n − 3) = {th}% 才会接管（红圈）。',
    s4thr1: 'n = 1 时以牙还牙和全合作没有区别，全背叛总是占优。',
    s4hint: '观察顺序：保持 n = 10，起点设在全背叛 30%、以牙还牙占其余的 40%，按「播放 60 代」：全背叛先靠剥削全合作把比例冲到一半左右；全合作被吃掉一大块之后，全背叛又被以牙还牙反超，几乎消失。再把 n 拖到 1 重放：全背叛一路吞掉整个种群。以牙还牙与全合作之间那条底边上，两者得分相同，比例不再变化。本模型假设种群无限大、随机相遇、没有突变。',

    s5k: '第 5 步 · 犯错与宽容',
    s5t: '如果每一步都有一点几率手滑，「以牙还牙」还好用吗？',
    s5e: '这一步要回答：真实世界会出错，想合作却按成了背叛。设每个动作有<strong>出错率</strong> e 被翻转。两个以牙还牙相遇时，一次失误会让双方开始轮流报复，直到下一次失误才可能回到合作。补救办法是<strong>宽容</strong>：<strong>宽容以牙还牙</strong>在对方背叛后，仍以概率 g 合作。左图是两个同种策略对打 40 轮的一次抽样（白点 = 这一格是失误造成的）；右图是长期平均每轮得分随 e 的变化，用马尔可夫链的稳态精确算出，不靠抽样（<a class="xlink" href="../../../probability/stochastic/markov-chains/#step3">→ 马尔可夫链页第 3 步：稳态是什么</a>）。粉色虚线是宽容的代价：宽容以牙还牙碰上全背叛时的得分。',
    e5: '出错率 e', g5: '宽容度 g（对方背叛后仍合作的概率）', reroll5: '换一次抽样',
    c5a: '两个同种策略对打 40 轮（一次抽样）', c5b: '长期平均每轮得分 vs 出错率 e', c5c: 'A 到目前为止的平均每轮得分（横轴：第几轮）',
    s5lgTft: '以牙还牙 自己对打', s5lgG: '宽容以牙还牙 自己对打', s5lgW: '赢留输变 自己对打', s5lgEx: '宽容以牙还牙 对 全背叛', s5lgFlip: '白点 = 失误',
    s5readout: 'e = {e}、g = {g}，长期平均每轮得分：以牙还牙 {tft}，宽容以牙还牙 {gt}，赢留输变 {ws}；宽容以牙还牙碰上全背叛只得 {ex}。左图这次抽样 40 轮里{sn}平均每轮 {avg}，发生了 {flips} 次失误。',
    s5hint: '观察顺序：先把 g 设为 0、e 从 0 拖到 0.01：以牙还牙的长期得分从 3 一下掉到 2.25，而且 e 再大也一直是 2.25；左图选以牙还牙，能看到失误之后红绿交替的「报复回声」。再把 g 加大：青线升高，但粉色虚线下降——越宽容，碰到全背叛时越吃亏。赢留输变不需要宽容，靠「输了就换」也能从失误中恢复。',

    s6k: '第 6 步 · 收束',
    s6t: '这一页你看到了什么',
    s6fin: '只打一次时，背叛是占优策略，两人一起落到各得 1 分。重复对局让「看着上一轮再决定」的策略有了用武之地：以牙还牙对全背叛只亏第一轮，对友善的策略则一路合作。循环赛里谁赢取决于轮数和对手名单；冷酷对手面前，<strong>继续概率 δ 超过 (T − R)/(T − P)</strong> 时合作才划算。在种群里，背叛者可能先靠剥削无条件合作者繁荣一阵，再被以牙还牙取代，前提是以牙还牙的初始占比超过临界值。最后，出错会让以牙还牙陷入报复回声，<strong>宽容</strong>能救回合作，代价是更容易被剥削。',
    formula: '一次：T > R > P > S → 背叛占优\n重复（对冷酷）：δ ≥ (T − R)/(T − P) → 合作划算\n种群（全背叛 vs 以牙还牙，每场 n 轮）：以牙还牙占比 > 1/(2n − 3) → 接管',
    boundary: '适用范围：收益固定为 5/3/1/0；策略只看上一轮；种群无限大、随机相遇、无突变、无空间结构。这些是理解机制的模型，不是对真实人群行为的预测；换收益、换对手名单或加入别的策略，结论的数字会变。',
    linksTitle: '接着去看',
    lk1: '博弈论页第 2 步：纳什均衡 →', lk2: '博弈论页第 1 步：最佳回应 →', lk3: '马尔可夫链页第 3 步：稳态 →', lk4: '微分方程相图页第 1 步：相平面里的轨线 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《囚徒困境与演化博弈 · 合作怎样活下来》的平行版本。'
  },
  en: {
    pageTitle: 'The Prisoner’s Dilemma · Cooperation Needs a Next Time',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Prisoner’s Dilemma & Evolutionary Games · How Cooperation Survives →',
    navLabel: 'Prisoner’s dilemma steps',
    tagline: 'Two players each choose to cooperate or defect. The rules sit in a payoff table, and each player cares only about their own score. Given that table, we want to know what happens when they play once — and whether cooperation can survive when they play again and again, or when the game is passed down generations in a large population, and on what conditions. In seven steps you will play matches, run a round robin, tune the chance that “there is a next round”, watch a population evolve, and finally add slips of the hand.',
    nav0: '0 Play once', nav1: '1 Many rounds', nav2: '2 Round robin', nav3: '3 Shadow of the future', nav4: '4 Evolution', nav5: '5 Errors & forgiveness', nav6: '6 Wrap-up',
    sn_allc: 'Always Cooperate', sn_alld: 'Always Defect', sn_tft: 'Tit for Tat', sn_grim: 'Grim', sn_wsls: 'Win-Stay Lose-Shift', sn_gtft: 'Generous Tit for Tat',
    C: 'cooperate', D: 'defect',

    s0k: 'Step 0 · Play once',
    s0t: 'Both players know cooperating is better for the two of them. Why do they defect anyway?',
    s0e: 'This step answers: when the game is played once with no talking, what does a player who only counts their own score choose? The table below is the <strong>payoff table</strong>: rows are your move, columns are the other player’s, and each cell lists your score and theirs. Both <strong>cooperate</strong>: 3 each (R, the reward). Both <strong>defect</strong>: 1 each (P, the punishment). One defects while the other cooperates: the defector gets 5 (T, the temptation), the cooperator 0 (S, the sucker’s payoff). Clicking a cell picks your move and theirs at once; the chart compares “if they play this, what do I get by cooperating or by defecting” — finding your <strong>best response</strong> (<a class="xlink" href="../../../math/applied/game-theory/#step1">→ Game theory, step 1: how to find best responses</a>).',
    mHead: 'You \\ Them', mCell: 'you {me} · them {them}',
    c0a: 'If they cooperate: your score', c0b: 'If they defect: your score',
    s0lgC: 'you cooperate', s0lgD: 'you defect', s0lgPick: 'outline = the move you picked in the table',
    s0readout: 'You {me}, they {them}: you get {a}, they get {b}, {sum} in total. If they cooperate, defecting earns you {gain1} more than cooperating; if they defect, {gain2} more. Whatever they do, defecting scores higher — defection is a <b>dominant strategy</b>. But when both reason this way they get 1 each, worse than the 3 each of mutual cooperation.',
    s0hint: 'What to try: click both cells in the “they cooperate” column and compare the two bars in the top half of the chart; then the “they defect” column and the bottom half. Both times orange (defect) is longer. Finally compare the totals in the bottom-right cell (both defect) and the top-left one (both cooperate).',

    s1k: 'Step 1 · The same pair, many rounds',
    s1t: 'If the same two players meet round after round, does the outcome change?',
    s1e: 'This step answers: in a repeated game, can a rule that “looks at the last round before deciding” pull the other player into cooperating? A <strong>strategy</strong> is such a rule: from what both played last round, decide what to play now. We use five: <strong>Always Cooperate</strong>; <strong>Always Defect</strong>; <strong>Tit for Tat</strong> (cooperate first, then copy the other player’s last move); <strong>Grim</strong> (cooperate until anyone defects once, then defect forever); <strong>Win-Stay Lose-Shift</strong> (after scoring 3 or 5 repeat your own move, after 0 or 1 switch). In the top panel each cell is one round, green for cooperate, red for defect; the bottom panel shows both running totals.',
    pA: 'Player A’s strategy', pB: 'Player B’s strategy', n1: 'Rounds n', play1: 'Play round by round',
    c1a: 'Moves each round (green = cooperate, red = defect)', c1b: 'Running total (horizontal: round)',
    s1lgC: 'cooperate', s1lgD: 'defect', s1lgA: 'A’s running total', s1lgB: 'B’s running total',
    s1progress: 'Played {k}/{n} rounds. ',
    s1readout: '{prog}{nA} scores {a} ({pa} per round), {nB} scores {b} ({pb} per round); {cc} rounds of mutual cooperation, {dd} of mutual defection.',
    s1hint: 'What to try: start with Tit for Tat against Always Defect and press “Play round by round”. Tit for Tat loses only the first round; after that both defect, so Always Defect is ahead by exactly 5 points however long they play. Then switch B to Grim or Win-Stay Lose-Shift: two strategies that open with cooperation stay green all the way and earn 3 each per round.',

    s2k: 'Step 2 · A round robin',
    s2t: 'Let several strategies play each other. Which scores highest — and does the answer depend on the number of rounds?',
    s2e: 'This step answers: step 1 looked at one pair; if you don’t know whom you’ll meet, which strategy does better overall? We run a <strong>round robin</strong>: every selected strategy plays every one (a copy of itself included) for n rounds. The <strong>total score</strong> is the sum of its per-round averages across those matches, so different n can be compared directly; higher is better. The left panel shows the totals at the current n, best first; the right panel shows how each total changes with n, the vertical line marking the current n.',
    n2: 'Rounds per match n',
    c2a: 'Total score (current n)', c2b: 'Total score as n grows',
    s2readout: 'n = {n}: ranking {rank}. {flip}',
    s2flip: 'Tit for Tat overtakes Always Defect from n = {k} on.', s2noflip: 'With these opponents Tit for Tat never overtakes Always Defect for n ≤ 50.', s2na: '(Always Defect or Tit for Tat is not playing, so the two aren’t compared.)',
    s2hint: 'What to try: drag n to 1 — in a single round Always Defect wins by a mile. Raise n slowly and watch, on the right, Always Defect’s line fall and Tit for Tat’s rise until they cross and the ranking flips. Then untick Always Cooperate and Win-Stay Lose-Shift and look again with three strategies: the crossing moves. The ranking depends on who is playing; this page names no permanent winner.',
    pickHint: 'Players (at least two):',

    s3k: 'Step 3 · The shadow of the future',
    s3t: 'How likely must another round be before holding back from defection pays?',
    s3e: 'This step answers: when nobody knows which round is the last, which pays more — “defect once now” or “cooperate throughout”? Suppose that after each round there is another one with probability <strong>δ</strong> (between 0 and 1), so on average 1/(1 − δ) rounds are played. The opponent plays Grim: defect once and it defects forever from the next round. Cooperating earns R = 3 every round; defecting now earns T this round and only P = 1 after. To compare on one scale, the chart multiplies both totals by (1 − δ), turning them into an “average per round”: cooperation is the flat line at 3, defection the line falling from T to 1. They cross at δ* = (T − R)/(T − P); above it, cooperation pays more.',
    delta: 'Chance of another round δ', Tslider: 'Temptation T (R = 3 and P = 1 fixed)',
    c3: 'Average payoff per round vs δ',
    s3lgCoop: 'cooperate throughout: R = 3', s3lgDef: 'defect now: T(1 − δ) + δ·P', s3lgStar: 'crossing δ*',
    s3readout: 'δ = {d} ({rounds} rounds on average): cooperating averages {c} per round, defecting now {df} — {verdict}. With T = {T} the threshold is δ* = ({T} − 3)/({T} − 1) = {star}.',
    vCoop: 'cooperation pays more', vDef: 'defection pays more', vTie: 'they are equal',
    s3hint: 'What to try: keep T = 5 and drag δ from 0 to 0.9 — the red line falls from 5 and crosses the cyan one at δ = 0.5; beyond that cooperation pays. Then raise the temptation T to 9: the crossing moves right to 0.75. The bigger the temptation, the longer the future has to be.',

    s4k: 'Step 4 · Evolution in a population',
    s4t: 'In a large population, how do the shares of three strategies change generation by generation?',
    s4e: 'This step answers: if strategies are not chosen by anyone but “copied more often when they score higher”, where does the population head? There are three kinds of players — Always Defect, Tit for Tat, Always Cooperate — meeting at random in matches of n rounds. Each kind’s average per-round score depends on the current mix. <strong>Replicator dynamics</strong> is the rule: a strategy’s share grows or shrinks at the rate “its score − the population’s average score” (time is counted in “generations”). The triangle on the left shows mixes: the closer a point is to a corner, the larger that strategy’s share (the corner itself is 100%); the coloured path is the mix moving over time. On the right are the three shares along the same path.',
    n4: 'Rounds per match n', d4: 'Starting share of Always Defect', t4: 'Tit for Tat’s part of the rest', play4: 'Play 60 generations', clear4: 'Clear paths',
    c4a: 'Mix triangle (tap to set a start)', c4b: 'Shares over time (horizontal: generations)',
    s4lgD: 'Always Defect', s4lgT: 'Tit for Tat', s4lgC: 'Always Cooperate', s4lgPath: 'path (white dot = start)', s4lgThr: 'red ring = tipping share on the edge',
    s4readout: '{prog}Start: Always Defect {d0}%, Tit for Tat {t0}%, Always Cooperate {c0}%. After 60 generations: Always Defect {d1}%, Tit for Tat {t1}%, Always Cooperate {c1}%. {peak}{thr}',
    s4progress: 'Played {g}/60 generations. ',
    s4peak: 'On the way Always Defect peaked at {p}% (generation {g}). ',
    s4thr: 'With only Always Defect and Tit for Tat, Tit for Tat takes over once its share exceeds 1/(2n − 3) = {th}% (red ring).',
    s4thr1: 'At n = 1 Tit for Tat is no different from Always Cooperate, and Always Defect always wins.',
    s4hint: 'What to try: keep n = 10, start at 30% Always Defect with Tit for Tat making up 40% of the rest, and press “Play 60 generations”: Always Defect first feeds on Always Cooperate and surges to about half the population; once the unconditional cooperators have been cut down, Tit for Tat overtakes it and it all but disappears. Now drag n to 1 and replay: Always Defect swallows the whole population. On the bottom edge between Tit for Tat and Always Cooperate the two score the same, so the mix stops moving. The model assumes an infinite population, random meetings and no mutation.',

    s5k: 'Step 5 · Errors and forgiveness',
    s5t: 'If every move has a small chance of slipping, does Tit for Tat still work?',
    s5e: 'This step answers: in the real world people slip — they mean to cooperate and defect by mistake. Let each move be flipped with <strong>error rate</strong> e. When two Tit for Tats meet, one slip starts a round of alternating retaliation that can only end with another slip. The remedy is <strong>forgiveness</strong>: <strong>Generous Tit for Tat</strong>, after the other player defects, still cooperates with probability g. The left panel samples 40 rounds of one strategy against a copy of itself (white dot = this cell is a slip). The right panel shows the long-run average score per round against e, computed exactly from the stationary state of a Markov chain rather than by sampling (<a class="xlink" href="../../../probability/stochastic/markov-chains/#step3">→ Markov chains, step 3: what the stationary state is</a>). The pink dashed line is the cost of forgiveness: what Generous Tit for Tat scores against Always Defect.',
    e5: 'Error rate e', g5: 'Generosity g (chance to cooperate after being defected on)', reroll5: 'Sample again',
    c5a: 'One strategy vs a copy of itself, 40 rounds (one sample)', c5b: 'Long-run average per round vs error rate e', c5c: 'A’s average per round so far (horizontal: round)',
    s5lgTft: 'Tit for Tat vs itself', s5lgG: 'Generous TFT vs itself', s5lgW: 'Win-Stay Lose-Shift vs itself', s5lgEx: 'Generous TFT vs Always Defect', s5lgFlip: 'white dot = slip',
    s5readout: 'e = {e}, g = {g}, long-run average per round: Tit for Tat {tft}, Generous TFT {gt}, Win-Stay Lose-Shift {ws}; Generous TFT facing Always Defect gets only {ex}. In the 40 sampled rounds on the left, {sn} averaged {avg} per round with {flips} slips.',
    s5hint: 'What to try: set g to 0 and drag e from 0 to 0.01 — Tit for Tat’s long-run score drops at once from 3 to 2.25 and stays at 2.25 however large e gets; pick Tit for Tat on the left to see the red-green “echo of retaliation” after a slip. Then raise g: the cyan line climbs but the pink dashed line drops — the more forgiving, the more Always Defect exploits you. Win-Stay Lose-Shift needs no forgiveness; “switch after losing” lets it recover from slips by itself.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What you saw on this page',
    s6fin: 'Played once, defection is a dominant strategy and both players end up with 1 each. Repetition gives rules that “look at the last round” something to work with: Tit for Tat loses only the first round to Always Defect and cooperates all the way with friendly strategies. In a round robin the winner depends on the number of rounds and on who is playing; against a Grim opponent, cooperation pays once the <strong>continuation probability δ exceeds (T − R)/(T − P)</strong>. In a population, defectors can boom for a while by exploiting the unconditional cooperators and then be replaced by Tit for Tat — provided Tit for Tat starts above a tipping share. Finally, slips trap Tit for Tat in echoes of retaliation; <strong>forgiveness</strong> rescues cooperation at the price of being easier to exploit.',
    formula: 'Once: T > R > P > S → defection dominates\nRepeated (vs Grim): δ ≥ (T − R)/(T − P) → cooperation pays\nPopulation (AllD vs TFT, n rounds per match): TFT share > 1/(2n − 3) → takeover',
    boundary: 'Scope: payoffs fixed at 5/3/1/0; strategies look only at the last round; the population is infinite with random meetings, no mutation and no spatial structure. These models explain mechanisms; they do not predict how real people behave. Change the payoffs, the list of opponents or add other strategies and the numbers in these conclusions change.',
    linksTitle: 'Where to go next',
    lk1: 'Game theory, step 2: Nash equilibrium →', lk2: 'Game theory, step 1: best responses →', lk3: 'Markov chains, step 3: the stationary state →', lk4: 'ODE phase portraits, step 1: trajectories in the phase plane →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “The Prisoner’s Dilemma & Evolutionary Games · How Cooperation Survives”.'
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
