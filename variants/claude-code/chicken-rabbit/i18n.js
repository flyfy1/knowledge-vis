'use strict';
// Chickens & Rabbits (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '鸡兔同笼 · 先假设，差额会说话',
    back: '← 知识索引',
    compare: '对照另一版本：鸡兔同笼 · 先假设，差额会说话 →',
    navLabel: '鸡兔同笼步骤导航',
    tagline: '笼子里关着鸡和兔。从上面数，有 10 个头；从下面数，有 28 只脚。鸡和兔各几只？一只只去猜也能猜中，但有个更聪明的办法：先假设全是同一种，算出来的脚数和真实的脚数差多少，这个差额就会告诉你答案。',
    nav0: '0 先猜一猜', nav1: '1 假设全是鸡', nav2: '2 抬腿法', nav3: '3 换一组数', nav4: '4 假设全是兔', nav5: '5 换个故事', nav6: '6 收束',

    s0k: '第 0 步 · 读题',
    s0t: '10 个头、28 只脚，笼子里有几只兔？',
    s0e: '这一步要回答：知道一共几个<strong>头</strong>、几只<strong>脚</strong>，怎样找出鸡和兔各几只？每只鸡、每只兔都只有 1 个头，所以 10 个头就是一共 10 只动物。鸡有 2 只脚，兔有 4 只脚。先用最直接的办法：猜兔有几只，剩下的就是鸡，再数一数脚对不对。下面的数轴记下你猜过的每一次。',
    rSlider: '猜兔有几只',
    clear0: '清空猜过的记录',
    s0lgChick: '鸡（2 只脚）', s0lgRab: '兔（4 只脚）', s0lgTry: '猜过的脚数', s0lgGoal: '题目说的 28 只脚',
    c0a: '笼子里的鸡和兔，以及猜过的脚数',
    tickFeet: '脚数',
    s0readout: '猜 {r} 只兔、{c} 只鸡：脚 = 2 × {c} + 4 × {r} = {f} 只。{cmp}',
    s0less: '比 28 少 {d} 只，兔猜少了。', s0more: '比 28 多 {d} 只，兔猜多了。', s0hit: '正好 28 只，猜对了！',
    s0hint: '观察顺序：把“猜兔有几只”一格一格往右拖，看数轴上的点：每多猜 1 只兔，脚数就多 2 只，点之间的距离一样大。记住这个“多 2”，下一步就靠它。',

    s1k: '第 1 步 · 假设法',
    s1t: '如果先当作全是鸡，脚少了几只？要换几只兔？',
    s1e: '这一步要回答：不靠一次次猜，怎样一步算出兔的只数？先<strong>假设</strong>（先当作）10 只全是鸡：脚就是 10 × 2 = 20 只。真实有 28 只，少了 8 只，这个少掉的数叫<strong>差额</strong>：真实脚数 − 假设算出的脚数。为什么会少？因为其中有兔子被当成了鸡。把 1 只“鸡”换回兔，头数不变，脚多 4 − 2 = 2 只。差额 8 只，每换 1 只补回 2 只，就要换 8 ÷ 2 = 4 只。',
    swap1: '换 1 只鸡为兔', auto1: '一直换到脚数对上', reset1: '重来（全是鸡）',
    s1lgNow: '现在的脚数', s1lgGap: '差额（还差的脚）', s1lgGoal: '28 只脚',
    c1a: '从全是鸡开始，一只只换成兔，脚数一步步变多',
    s1readout: '已换 {k} 只：{c} 只鸡、{k} 只兔，脚 = {f} 只，还差 {gap} 只。差额 8 ÷ 每换一只多 2 = 要换 4 只。',
    s1done: '已换 {k} 只：{c} 只鸡、{k} 只兔，脚正好 {f} 只。换的次数 = 差额 8 ÷ 2 = 4，就是兔的只数。',
    s1hint: '观察顺序：按“换 1 只鸡为兔”，看笼子里一只鸡变成兔，下面的脚数条往右长出 2 格，红色虚线的差额缩短 2 格。连按 4 次差额变成 0；也可以按“一直换到脚数对上”看完整过程。',

    s2k: '第 2 步 · 另一种看法',
    s2t: '如果让每只动物都抬起 2 只脚，地上还剩几只脚？',
    s2e: '这一步要回答：同一个“差额”能不能用画面看出来？想象吹一声哨子，每只动物都抬起 2 只脚。10 只动物一共抬起 10 × 2 = 20 只脚。鸡只有 2 只脚，抬起后就坐下了，地上一只也不剩；兔有 4 只脚，抬起 2 只还站着 2 只。所以地上剩下的 28 − 20 = 8 只脚<strong>全是兔的</strong>，每只兔 2 只，兔就是 8 ÷ 2 = 4 只。这和上一步“差额 ÷ 2”是同一笔账：先算 2 × 10，再看剩下的。',
    lift2: '吹哨：每只抬起 2 只脚', down2: '放下',
    s2lgUp: '抬起的脚', s2lgGround: '还踩在地上的脚',
    c2a: '每只动物抬起两只脚后，地上剩下的脚',
    s2readout: '抬起 {lifted} 只（每只 2 只 × {H} 只），地上还剩 {F} − {lifted} = {ground} 只，全是兔的 → 兔 = {ground} ÷ 2 = {r} 只，鸡 = {H} − {r} = {c} 只。',
    s2before: '现在 {H} 只动物都站着，地上一共 {F} 只脚。按“吹哨”看每只抬起 2 只脚以后，地上还剩几只。',
    s2hint: '观察顺序：按“吹哨”，看每只动物抬起的脚变成橙色；鸡全部坐下，兔子还用 2 只脚站着。数一数地上的绿色脚：8 只，正好 4 只兔。',

    s3k: '第 3 步 · 换一组数',
    s3t: '头数和脚数换成别的，怎样一下子算出来？算不出来又是为什么？',
    s3e: '这一步要回答：头数 H、脚数 F 是任意的数时，兔有几只？把第 1 步的账写成一般的样子：假设全是鸡，脚有 2 × H 只；差额 = F − 2 × H；每换 1 只多 2 只脚；所以<strong>兔 = (F − 2 × H) ÷ 2，鸡 = H − 兔</strong>。下面的数轴从“全是鸡”（2H 只脚）画到“全是兔”（4H 只脚），每个刻度表示多 1 只兔、多 2 只脚。题目的脚数 F（橙色）落在第几个刻度上，兔就有几只。',
    hSlider: '头数 H', fSlider: '脚数 F',
    allC: '全是鸡', allR: '全是兔', rabbitsLbl: '{r} 只兔',
    s3lgTick: '刻度：每格多 1 只兔', s3lgF: '题目的脚数 F',
    c3a: '从全是鸡到全是兔的脚数数轴',
    s3ok: '假设全是鸡：2 × {H} = {base} 只脚，差额 {F} − {base} = {gap}，兔 = {gap} ÷ 2 = {r} 只，鸡 = {H} − {r} = {c} 只。验算：2 × {c} + 4 × {r} = {F}。',
    s3low: '没有答案：{H} 只全是鸡也有 {base} 只脚，比 {F} 还多。脚数至少要 2 × {H} = {base}。',
    s3high: '没有答案：{H} 只全是兔也只有 {top} 只脚，比 {F} 还少。脚数最多是 4 × {H} = {top}。',
    s3frac: '没有答案：差额 {gap} 是奇数，每换 1 只只能多 2 只脚，凑不出来（{F} 落在两个刻度中间）。鸡兔的脚数加起来一定是偶数。',
    s3hint: '观察顺序：先拖“脚数 F”，看橙色标记在数轴上移动：落在刻度上就有答案；落在两个刻度中间（F 是奇数）就没有。再把 F 拖到数轴左端外面或右端外面，看为什么脚太少、太多都不行。最后拖“头数 H”，数轴两端 2H 和 4H 跟着变。',

    s4k: '第 4 步 · 反过来假设',
    s4t: '如果先当作全是兔，答案会不一样吗？',
    s4e: '这一步要回答：假设全是兔，还能算对吗？10 只全是兔，就有 10 × 4 = 40 只脚，比 28 多 12 只，这回差额是“多出来的”。把 1 只“兔”换回鸡，脚少 2 只，要换 12 ÷ 2 = 6 只，这 6 只就是鸡，兔是 10 − 6 = 4 只。和假设全是鸡算出的一样。下面用的是第 3 步设的头数和脚数：青色从左端（全是鸡）往右走，粉色从右端（全是兔）往左走，每走一格换 1 只。',
    fromC: '从“全是鸡”出发', fromR: '从“全是兔”出发', both4: '两边一起走',
    s4lgC: '从全是鸡出发的路', s4lgR: '从全是兔出发的路', s4lgF: '题目的脚数',
    c4a: '从两端出发，都走到同一个脚数',
    s4readout: '用第 3 步的数：{H} 个头、{F} 只脚。{msg}',
    s4c: '从全是鸡出发：{base} 只脚，少 {gap} 只，每换 1 只鸡为兔多 2 只，换 {r} 次到达 {F}，兔 {r} 只。',
    s4r: '从全是兔出发：{top} 只脚，多 {over} 只，每换 1 只兔为鸡少 2 只，换 {c} 次到达 {F}，鸡 {c} 只。',
    s4same: '两条路停在同一个点：鸡 {c} 只、兔 {r} 只。两次换的次数加起来 {c} + {r} = {H}，正好是头数。',
    s4none: '这组数没有答案（原因见第 3 步），换一组能算出来的数再来。',
    s4idle: '按上面的按钮，看从哪一头出发、走几格。',
    s4hint: '观察顺序：先按“从全是鸡出发”，青色点一格一格往右走；再按“从全是兔出发”，粉色点往左走。两边停在同一个刻度上。数一数：青色走的格数是兔的只数，粉色走的格数是鸡的只数。',

    s5k: '第 5 步 · 换个故事',
    s5t: '不是鸡和兔，这个办法还能用吗？',
    s5e: '这一步要回答：什么样的题都能用“先假设、看差额”？只要满足两条：一共只有<strong>两种</strong>东西，知道总个数；每种东西的“量”是<strong>固定</strong>的（每辆车几个轮子、每张票几元），知道总量。办法完全一样：假设全是“量小”的那种，算出总量，差额 ÷ 两种的量之差 = “量大”的那种有几个。下面的阶梯图：横轴是“量大”的那种有几个，每多 1 个，总量就上一个台阶，台阶高 = 两种的量之差；橙色横线是题目的总量。',
    storyBikes: '自行车和三轮车', storyTickets: '儿童票和成人票', storyBugs: '蜻蜓和蜘蛛',
    s5xcap: '{B}的个数 →', s5ycap: '总量（{u}）',
    nSlider5: '一共几个', tSlider5: '总量',
    s5lgStep: '每多 1 个“量大”的，总量上一个台阶', s5lgT: '题目的总量', s5lgHit: '答案',
    c5a: '总量随“量大”那种的个数一级级上升的阶梯图',
    bikesA: '自行车', bikesB: '三轮车', bikesU: '个轮子', bikesQ: '辆',
    ticketsA: '儿童票', ticketsB: '成人票', ticketsU: '元', ticketsQ: '张',
    bugsA: '蜻蜓', bugsB: '蜘蛛', bugsU: '条腿', bugsQ: '只',
    bikesStory: '自行车每辆 2 个轮子，三轮车每辆 3 个轮子。一共 {n} 辆，共 {T} 个轮子。',
    ticketsStory: '儿童票每张 5 元，成人票每张 8 元。一共买了 {n} 张，共 {T} 元。',
    bugsStory: '蜻蜓有 6 条腿，蜘蛛有 8 条腿。一共 {n} 只，共 {T} 条腿。',
    s5ok: '假设全是{A}：{n} × {a} = {base} {u}，差额 {T} − {base} = {gap}，每换 1 {q}多 {b} − {a} = {step}，{B} = {gap} ÷ {step} = {nb} {q}，{A} = {na} {q}。',
    s5low: '没有答案：全是{A}也有 {base} {u}，比 {T} 还多。',
    s5high: '没有答案：全是{B}也只有 {top} {u}，比 {T} 还少。',
    s5frac: '没有答案：差额 {gap} 不是 {step} 的整数倍，{B}在 {lo} 和 {hi} {q}之间，不是整数。',
    s5hint: '观察顺序：先点一个故事，读出它的题目和答案；再拖“总量”，看橙色横线上下移动：只有正好碰到某个台阶时才有答案。比较三个故事的台阶高度：自行车和三轮车差 1，儿童票和成人票差 3，蜻蜓和蜘蛛差 2。',

    s6k: '第 6 步 · 收束', s6t: '先假设，差额会说话',
    s6fin: '回顾一下。<strong>第 0 步</strong>：一只只猜也能猜中，每多猜 1 只兔，脚多 2 只。<strong>第 1 步</strong>：假设全是鸡，差额 ÷ 2 = 兔的只数。<strong>第 2 步</strong>：每只抬起 2 只脚，地上剩下的都是兔的，是同一笔账。<strong>第 3 步</strong>：一般的算法是 兔 = (脚 − 2 × 头) ÷ 2；脚数是奇数、太少或太多时没有答案。<strong>第 4 步</strong>：假设全是兔也一样，算出的是鸡。<strong>第 5 步</strong>：两种东西、每种的量固定，就都能这样算。',
    formula: '兔 = (脚数 − 2 × 头数) ÷ 2\n鸡 = (4 × 头数 − 脚数) ÷ 2\n一般：量大的个数 = (总量 − 个数 × 小的量) ÷ (大的量 − 小的量)',
    boundary: '适用条件：只有两种东西，每种的量固定，个数是整数。以后学了方程，可以设兔有 x 只，列出 2 × (10 − x) + 4 × x = 28 来解；“假设法”其实就是在心里解这个方程。',
    linksTitle: '接着去看',
    lk1: '→ 二元一次方程组第 3 步：加减消元，把一个未知数消掉',
    lk2: '→ 方程天平第 4 步：两步方程，一步步把未知数留下',
    lk3: '→ 一次函数第 3 步：两条直线的交点就是共同的解',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《鸡兔同笼 · 先假设，差额会说话》的平行版本。'
  },
  en: {
    pageTitle: 'Chickens & Rabbits · Assume First, Let the Gap Speak',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Chickens & Rabbits · Assume First, Let the Gap Speak →',
    navLabel: 'Chickens and rabbits steps',
    tagline: 'A cage holds chickens and rabbits. Counting from above you see 10 heads; counting from below, 28 feet. How many of each? You could guess and check one at a time, but there is a smarter way: pretend they are all one kind, then see how far the feet are off. That gap gives the answer away.',
    nav0: '0 Guess first', nav1: '1 All chickens', nav2: '2 Lift your feet', nav3: '3 Other numbers', nav4: '4 All rabbits', nav5: '5 Other stories', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The puzzle',
    s0t: '10 heads and 28 feet: how many rabbits are in the cage?',
    s0e: 'This step asks: knowing the number of <strong>heads</strong> and <strong>feet</strong>, how do you find how many chickens and how many rabbits? Every chicken and every rabbit has exactly 1 head, so 10 heads means 10 animals. A chicken has 2 feet and a rabbit has 4. Start with the plainest method: guess the rabbits, the rest are chickens, and count the feet to check. The number line below keeps every guess you make.',
    rSlider: 'Guess the rabbits',
    clear0: 'Clear my guesses',
    s0lgChick: 'chicken (2 feet)', s0lgRab: 'rabbit (4 feet)', s0lgTry: 'feet for a guess', s0lgGoal: 'the 28 feet in the puzzle',
    c0a: 'Chickens and rabbits in the cage, and the feet of each guess',
    tickFeet: 'feet',
    s0readout: 'Guess {r} rabbits and {c} chickens: feet = 2 × {c} + 4 × {r} = {f}. {cmp}',
    s0less: 'That is {d} short of 28: too few rabbits.', s0more: 'That is {d} more than 28: too many rabbits.', s0hit: 'Exactly 28. Got it!',
    s0hint: 'What to watch: drag “Guess the rabbits” one notch at a time and watch the dots on the number line. Each extra rabbit adds 2 feet, so the dots are evenly spaced. Remember that “2 more”: the next step runs on it.',

    s1k: 'Step 1 · Assume first',
    s1t: 'If you pretend they are all chickens, how many feet are missing, and how many must become rabbits?',
    s1e: 'This step asks: instead of guessing again and again, how do you get the rabbits in one go? First <strong>assume</strong> (pretend for now) that all 10 are chickens: that makes 10 × 2 = 20 feet. The real count is 28, so 8 feet are missing; that shortfall is the <strong>gap</strong>: real feet − feet under the assumption. Why are feet missing? Because some rabbits were counted as chickens. Turning 1 “chicken” back into a rabbit keeps the heads the same and adds 4 − 2 = 2 feet. A gap of 8, closed 2 at a time, needs 8 ÷ 2 = 4 swaps.',
    swap1: 'Turn 1 chicken into a rabbit', auto1: 'Keep swapping until the feet match', reset1: 'Start over (all chickens)',
    s1lgNow: 'feet right now', s1lgGap: 'the gap (feet still missing)', s1lgGoal: '28 feet',
    c1a: 'Starting from all chickens, swapping one at a time; the feet go up step by step',
    s1readout: '{k} swapped: {c} chickens, {k} rabbits, {f} feet, {gap} still missing. Gap 8 ÷ 2 extra feet per swap = 4 swaps needed.',
    s1done: '{k} swapped: {c} chickens, {k} rabbits, exactly {f} feet. Number of swaps = gap 8 ÷ 2 = 4, which is the number of rabbits.',
    s1hint: 'What to watch: press “Turn 1 chicken into a rabbit”. One chicken in the cage becomes a rabbit, the feet bar below grows by 2, and the red dashed gap shrinks by 2. Four presses close the gap; or press “Keep swapping” to watch it all.',

    s2k: 'Step 2 · Another way to see it',
    s2t: 'If every animal lifts 2 feet, how many feet are still on the ground?',
    s2e: 'This step asks: can you see the same gap in a picture? Imagine a whistle: every animal lifts 2 feet. Ten animals lift 10 × 2 = 20 feet. A chicken has only 2 feet, so it sits down with none left on the ground; a rabbit has 4, so it still stands on 2. That means the 28 − 20 = 8 feet left on the ground <strong>all belong to rabbits</strong>, 2 per rabbit, so there are 8 ÷ 2 = 4 rabbits. It is the same sum as the gap ÷ 2 in step 1: take away 2 × 10 first, then look at what is left.',
    lift2: 'Whistle: everyone lifts 2 feet', down2: 'Feet down',
    s2lgUp: 'lifted feet', s2lgGround: 'feet still on the ground',
    c2a: 'Feet left on the ground after every animal lifts two',
    s2readout: '{lifted} feet lifted (2 each × {H} animals), so {F} − {lifted} = {ground} stay on the ground, all rabbit feet → rabbits = {ground} ÷ 2 = {r}, chickens = {H} − {r} = {c}.',
    s2before: 'All {H} animals are standing, {F} feet on the ground. Press “Whistle” to see how many stay down once everyone lifts 2.',
    s2hint: 'What to watch: press “Whistle”. The lifted feet turn orange; every chicken sits down and every rabbit still stands on 2 feet. Count the green feet on the ground: 8, exactly 4 rabbits.',

    s3k: 'Step 3 · Other numbers',
    s3t: 'With different heads and feet, how do you get the answer straight away, and why is there sometimes none?',
    s3e: 'This step asks: for any heads H and feet F, how many rabbits are there? Write step 1’s sum in general: assuming all chickens gives 2 × H feet; the gap is F − 2 × H; each swap adds 2 feet; so <strong>rabbits = (F − 2 × H) ÷ 2 and chickens = H − rabbits</strong>. The number line below runs from “all chickens” (2H feet) to “all rabbits” (4H feet); each tick means one more rabbit and 2 more feet. The tick that the puzzle’s F (orange) lands on tells you the rabbits.',
    hSlider: 'Heads H', fSlider: 'Feet F',
    allC: 'all chickens', allR: 'all rabbits', rabbitsLbl: '{r} rabbits',
    s3lgTick: 'tick: one more rabbit', s3lgF: 'the puzzle’s feet F',
    c3a: 'Number line of feet from all chickens to all rabbits',
    s3ok: 'Assume all chickens: 2 × {H} = {base} feet; gap {F} − {base} = {gap}; rabbits = {gap} ÷ 2 = {r}; chickens = {H} − {r} = {c}. Check: 2 × {c} + 4 × {r} = {F}.',
    s3low: 'No answer: even {H} chickens have {base} feet, more than {F}. The feet must be at least 2 × {H} = {base}.',
    s3high: 'No answer: even {H} rabbits have only {top} feet, fewer than {F}. The feet can be at most 4 × {H} = {top}.',
    s3frac: 'No answer: the gap {gap} is odd, and each swap adds exactly 2 feet, so it cannot be closed ({F} falls between two ticks). Chicken and rabbit feet always add up to an even number.',
    s3hint: 'What to try: drag “Feet F” and watch the orange marker move along the line. On a tick there is an answer; between two ticks (F odd) there is none. Push F past either end of the line to see why too few or too many feet fail. Finally drag “Heads H” and watch both ends, 2H and 4H, move.',

    s4k: 'Step 4 · Assume the other way',
    s4t: 'If you pretend they are all rabbits instead, do you get a different answer?',
    s4e: 'This step asks: does assuming all rabbits still work? Ten rabbits would have 10 × 4 = 40 feet, 12 more than 28, so this time the gap is feet you have too many of. Turning 1 “rabbit” back into a chicken removes 2 feet, so you need 12 ÷ 2 = 6 swaps; those 6 are the chickens, and the rabbits are 10 − 6 = 4. Same answer as assuming all chickens. Below we use the heads and feet you set in step 3: cyan walks right from the left end (all chickens), pink walks left from the right end (all rabbits), one tick per swap.',
    fromC: 'Start from all chickens', fromR: 'Start from all rabbits', both4: 'Walk from both ends',
    s4lgC: 'path from all chickens', s4lgR: 'path from all rabbits', s4lgF: 'the puzzle’s feet',
    c4a: 'Walking in from both ends to the same number of feet',
    s4readout: 'Using step 3’s numbers: {H} heads, {F} feet. {msg}',
    s4c: 'From all chickens: {base} feet, {gap} short; each chicken→rabbit swap adds 2, so {r} swaps reach {F}: {r} rabbits.',
    s4r: 'From all rabbits: {top} feet, {over} too many; each rabbit→chicken swap removes 2, so {c} swaps reach {F}: {c} chickens.',
    s4same: 'Both paths stop at the same point: {c} chickens and {r} rabbits. The two swap counts add up to {c} + {r} = {H}, the number of heads.',
    s4none: 'These numbers have no answer (step 3 says why); pick a pair that works and come back.',
    s4idle: 'Press a button above to choose an end to start from and see how many ticks it takes.',
    s4hint: 'What to watch: press “Start from all chickens” and the cyan dot steps right one tick at a time; press “Start from all rabbits” and the pink dot steps left. Both stop on the same tick. Count them: the cyan steps are the rabbits, the pink steps are the chickens.',

    s5k: 'Step 5 · Other stories',
    s5t: 'No chickens or rabbits: does the method still work?',
    s5e: 'This step asks: which puzzles can “assume first, read the gap” solve? Two conditions: there are only <strong>two kinds</strong> of thing and you know how many altogether; and each kind has a <strong>fixed amount</strong> (wheels per vehicle, price per ticket) and you know the total amount. The method is the same: assume everything is the kind with the smaller amount, work out the total, and gap ÷ (difference between the two amounts) = how many of the bigger kind. In the staircase chart, the horizontal axis counts the bigger kind; each extra one lifts the total by one step, and the step height is the difference between the two amounts. The orange line is the puzzle’s total.',
    storyBikes: 'Bikes and trikes', storyTickets: 'Child and adult tickets', storyBugs: 'Dragonflies and spiders',
    s5xcap: 'number of {B} →', s5ycap: 'total ({u})',
    nSlider5: 'How many altogether', tSlider5: 'Total amount',
    s5lgStep: 'one more of the bigger kind = one step up', s5lgT: 'the puzzle’s total', s5lgHit: 'answer',
    c5a: 'Staircase: the total climbs one step for each extra item of the bigger kind',
    bikesA: 'bikes', bikesB: 'trikes', bikesU: 'wheels', bikesQ: 'vehicles',
    ticketsA: 'child tickets', ticketsB: 'adult tickets', ticketsU: 'dollars', ticketsQ: 'tickets',
    bugsA: 'dragonflies', bugsB: 'spiders', bugsU: 'legs', bugsQ: 'creatures',
    bikesStory: 'A bike has 2 wheels and a trike has 3. There are {n} vehicles with {T} wheels in all.',
    ticketsStory: 'A child ticket costs 5 dollars and an adult ticket 8. {n} tickets cost {T} dollars in all.',
    bugsStory: 'A dragonfly has 6 legs and a spider has 8. {n} creatures have {T} legs in all.',
    s5ok: 'Assume all {A}: {n} × {a} = {base} {u}; gap {T} − {base} = {gap}; each swap adds {b} − {a} = {step}; {B} = {gap} ÷ {step} = {nb}, {A} = {na}.',
    s5low: 'No answer: even all {A} come to {base} {u}, more than {T}.',
    s5high: 'No answer: even all {B} come to only {top} {u}, less than {T}.',
    s5frac: 'No answer: the gap {gap} is not a whole number of {step}s, so the {B} would be between {lo} and {hi}, not a whole number.',
    s5hint: 'What to try: pick a story and read its puzzle and answer. Then drag “Total amount” and watch the orange line move up and down: there is an answer only when it lands exactly on a step. Compare the step heights: bikes and trikes differ by 1, child and adult tickets by 3, dragonflies and spiders by 2.',

    s6k: 'Step 6 · Wrap-up', s6t: 'Assume first, and let the gap speak',
    s6fin: 'Looking back. <strong>Step 0</strong>: guessing one at a time works too, and each extra rabbit adds 2 feet. <strong>Step 1</strong>: assume all chickens; gap ÷ 2 = number of rabbits. <strong>Step 2</strong>: everyone lifts 2 feet and what is left on the ground is rabbit feet; the same sum. <strong>Step 3</strong>: in general, rabbits = (feet − 2 × heads) ÷ 2; an odd number of feet, or too few or too many, means no answer. <strong>Step 4</strong>: assuming all rabbits works the same way and gives the chickens. <strong>Step 5</strong>: any puzzle with two kinds of thing and a fixed amount for each can be solved like this.',
    formula: 'rabbits = (feet − 2 × heads) ÷ 2\nchickens = (4 × heads − feet) ÷ 2\nin general: count of bigger kind = (total − count × smaller amount) ÷ (bigger amount − smaller amount)',
    boundary: 'When it applies: exactly two kinds of thing, a fixed amount for each, whole-number counts. Once you learn equations you can call the rabbits x and solve 2 × (10 − x) + 4 × x = 28; the assume-first method is really solving that equation in your head.',
    linksTitle: 'Where to go next',
    lk1: '→ Simultaneous equations, step 3: eliminate one unknown by adding or subtracting',
    lk2: '→ Equation balance, step 4: two-step equations, leaving the unknown on its own',
    lk3: '→ Linear functions, step 3: where two lines cross is the shared solution',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Chickens & Rabbits · Assume First, Let the Gap Speak”.'
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
  if (typeof window.refreshCR === 'function') window.refreshCR();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.CR_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
