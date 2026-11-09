'use strict';
// Equation balance lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '方程天平 · 袋子里有几颗弹珠',
    back: '← 知识索引',
    compare: '对照另一版本：方程天平 · 两边同做一件事 →',
    navLabel: '方程天平步骤导航',
    tagline: '一个封好的袋子里装着几颗弹珠，不许打开数，只给你一架天平。天平平着，就是左右两盘一样重，写下来就是一个等式。这一页只用一个办法：对两盘做完全相同的事。用它把袋子单独留在一边，答案就自己露出来。',
    nav0: '0 称一称', nav1: '1 同加同减', nav2: '2 翻倍与平分', nav3: '3 一步方程', nav4: '4 两步方程', nav5: '5 两边都有袋子', nav6: '6 自测与收束',
    leftPan: '左盘', rightPan: '右盘',
    tiltNote: '横梁倾斜的角度是示意，画得夸张了；平不平只看两盘的重量是否相等。',

    s0k: '第 0 步 · 不打开袋子',
    s0t: '袋子不许打开，能不能知道里面有几颗弹珠？',
    s0e: '这一步要回答：只靠一架天平和一把散弹珠，能不能知道封好的袋子里装着几颗？天平有两个<strong>盘</strong>：左盘和右盘，架在一根<strong>横梁</strong>上，横梁中间的<strong>指针</strong>朝正上方时，两盘一样重，这叫<strong>平衡</strong>；哪边重，横梁就往哪边低。每颗弹珠一样重，我们就拿「1 颗」当重量单位；袋子本身轻得可以不计，所以袋子有多重，就看里面装了几颗。左盘放着袋子，你往右盘一颗一颗地加弹珠。',
    add0: '右盘放 1 颗', sub0: '右盘拿走 1 颗', next0: '换一个袋子',
    s0lgL: '左边重', s0lgR: '右边重', s0lgE: '平衡',
    stripTitle: '右盘试过的颗数',
    s0heavyL: '右盘 {n} 颗：左边还重些，指针偏向左。',
    s0heavyR: '右盘 {n} 颗：右边反而重了，指针偏向右。',
    s0even: '右盘 {n} 颗，天平平了。袋子和 {n} 颗弹珠一样重，所以袋子里正好装着 {n} 颗弹珠。',
    s0count: '已称出 {k}/{N} 个袋子。',
    s0more: '左盘放的是第 {i}/{N} 个袋子。',
    s0hint: '观察顺序：只用「右盘放 1 颗」，每放一颗看一眼指针；下面的数轴会记下每个试过的颗数是哪边重。左边重的点和右边重的点之间夹着的那个数，就是让天平平衡的颗数。称出来之后按「换一个袋子」再称。像这样「暂时不知道、但确实有一个值」的数叫<strong>未知数</strong>，后面几步我们用字母 x 代表袋子里的弹珠数（每个袋子装得一样多）。',

    s1k: '第 1 步 · 两边同加同减',
    s1t: '天平已经平了，再往盘里放东西，怎样放它才不倒？',
    s1e: '这一步要回答：已经平衡（两盘一样重）的天平，加上或拿走东西之后，什么情况下还平？现在左盘是 1 个袋子和 2 颗弹珠，右盘是 8 颗弹珠，天平平着。把盘里的东西用字母写下来，就是 <strong>x + 2 = 8</strong>：x 是一个袋子里的弹珠数，等号表示两盘一样重。这种用等号连起来、两边相等的式子叫<strong>等式</strong>；含有未知数的等式叫<strong>方程</strong>。下面的大字会跟着盘里的东西一起变。',
    add1m: '两边各放上 1 颗', sub1m: '两边各拿走 1 颗', add1b: '两边各放上 1 个袋子', sub1b: '两边各拿走 1 个袋子', one1: '只往左盘放 1 颗', reset1: '回到 x + 2 = 8',
    check1a: '试过两边同时放上', check1b: '试过两边同时拿走', check1c: '试过只动一边，看到天平倒了',
    balancedYes: '天平平着（两盘一样重）', balancedNo: '天平倒了（两盘不一样重）',
    comp: '左盘：{L}　·　右盘：{R}', cB: '{n} 个袋子', cM: '{m} 颗',
    s1status: '{comp}。{bal}。',
    s1hint: '观察顺序：先按「两边各放上 1 颗」和「两边各拿走 1 颗」各几次，看横梁一直水平、等式两边的数一起变；再按「两边各放上 1 个袋子」，袋子也一样能两边同加。最后按「只往左盘放 1 颗」，天平立刻往左倒。倒了以后再两边同加同减，它仍然是倒的：同加同减保持的是「两边一样重」这件事本身，原来不平的还是不平。',
    histTitle: '操作记录',
    histItem: '第 {k} 步　{op}　→　{eq}',
    histStart: '开始　{eq}',
    opAddM: '两边各放上 {n} 颗', opSubM: '两边各拿走 {n} 颗', opAddB: '两边各放上 {n} 个袋子', opSubB: '两边各拿走 {n} 个袋子',
    opMul: '两盘都变成 {k} 倍', opDiv: '两盘都平分成 {k} 份、各留 1 份', opOneAddL: '只往左盘放 {n} 颗', opOneMulL: '只把左盘变成 {k} 倍',
    tagOk: '（平）', tagBad: '（不平）',

    s2k: '第 2 步 · 翻倍与平分',
    s2t: '把两盘的东西都翻倍，或都平分只留一份，天平还平吗？',
    s2e: '这一步要回答：不是加减一点点，而是把两盘的东西<strong>同时</strong>变成几倍、或者同时平分成几份只留一份，天平会不会倒？现在是 <strong>x + 2 = 5</strong>：左盘 1 个袋子 + 2 颗，右盘 5 颗。「变成 2 倍」就是照着每盘原样再摆一份；「平分成 2 份、各留 1 份」要求每一堆都能分得一样多，不出现半颗，也就是<strong>整除</strong>（除完没有剩余）。袋子不能拆开，所以袋子的个数也要能平分。',
    mul2: '两盘都变成 2 倍', mul3: '两盘都变成 3 倍', div2: '两盘都平分成 2 份、各留 1 份', div3: '两盘都平分成 3 份、各留 1 份', one2: '只把左盘变成 2 倍', reset2: '回到 x + 2 = 5',
    check2a: '试过两盘同时变成几倍', check2b: '试过两盘同时平分', check2c: '试过只把一盘变成 2 倍',
    divNone: '现在不能两盘同时平分：有的堆分不匀（会出现半颗或半个袋子）。',
    divSome: '现在能平分成：{list} 份。',
    tooMany: '盘子装不下了（每盘最多 6 个袋子、24 颗弹珠），这一步没有做。',
    needMarbles: '有一盘的散弹珠不够拿，这一步没有做。两边要拿走一样多，两盘都得有这么多颗。',
    needBags: '有一盘没有这么多袋子可拿，这一步没有做。',
    emptyPan: '这样会把一个盘子拿空，这一步没有做。',
    notEven: '现在不能这样平分，这一步没有做。',
    s2hint: '观察顺序：先按「两盘都变成 2 倍」，看每盘的东西照原样多出一份（新出现的那份先淡后实），天平仍然水平，等式变成 2x + 4 = 10；再按「两盘都平分成 2 份、各留 1 份」，东西先按颜色分好组，再只留第一组，又回到 x + 2 = 5。最后按「只把左盘变成 2 倍」看它倒下。规则成立的条件：乘的数不能是 0（两盘都变成空的虽然也「平」，但袋子没了，什么也看不出来，所以这里不提供 ×0）；平分必须整除。',

    nSlider: '一次放上 / 拿走几颗 n', opMul2: '两盘都翻倍',
    opDiv2: '平分成 2 份留 1 份', opDiv3: '平分成 3 份留 1 份', opDiv4: '平分成 4 份留 1 份',
    undo: '撤销一步', resetP: '回到原题', nextP: '换一题',
    goal: '目标：让一个袋子单独留在一个盘里，那个盘里不能有别的东西。',
    problemOf: '第 {i}/{N} 题　{eq}',
    solvedLine: '袋子单独留在{side}，{other}有 {v} 颗，天平平着，所以 x = {v}。代回原题 {eq}：左边 {left} = {L}，右边 {right} = {R}，两边相等 ✓。你用了 {k} 步。',
    sideL: '左盘', sideR: '右盘',
    solvedCount: '已解出 {k}/{N} 题。',
    notYet: '还没解出：{comp}。{bal}。',

    s3k: '第 3 步 · 一步方程',
    s3t: 'x + 5 = 9：怎样让袋子单独留在左盘？',
    s3e: '这一步要回答：天平上是 <strong>x + 5 = 9</strong>（左盘 1 个袋子 + 5 颗，右盘 9 颗），怎样只用「两边做同样的事」，把袋子单独留在左盘？一旦左盘只剩那个袋子，天平又平着（两盘一样重），右盘有几颗，x 就是几。这个过程叫<strong>解方程</strong>，得到的数叫方程的<strong>解</strong>。最后把解放回原来的式子算一遍，两边相等，才算真的解对了，这叫<strong>代回验算</strong>。',
    s3hint: '观察顺序：先想好「要拿走左盘的哪些东西」，把 n 拖到那个数，再按「两边各拿走 n 颗」。走错了也没关系：天平始终是平的，只是离目标更远，可以按「撤销一步」。这一步的读数不会提前给出答案：袋子单独留下之前，它只告诉你盘里有什么，不告诉你袋子多重。',

    s4k: '第 4 步 · 两步方程',
    s4t: '袋子不止一个、还混着散弹珠，先做哪一步？',
    s4e: '这一步要回答：左盘有好几个袋子，比如 <strong>3x + 2 = 14</strong>（3 个袋子 + 2 颗，对面 14 颗），一次操作不够，先拿走散弹珠，还是先平分？袋子前面的数（3x 里的 3）叫<strong>系数</strong>，就是袋子的个数。目标没有变：让一个袋子单独留下、天平仍然平衡（两盘一样重）。三道题各有特点，留意平分按钮什么时候能用。',
    s4hint: '观察顺序：第 1 题先看平分按钮：3 个袋子、2 颗、14 颗不能都分成 3 份，所以只能先「两边各拿走 2 颗」，变成 3x = 12 之后才能平分。第 2、3 题两种顺序都走得通：比如 2x + 6 = 16 可以先拿走 6 颗再平分成 2 份，也可以先平分成 2 份（x + 3 = 8）再拿走 3 颗。比较操作记录：路不同，留下的数一样。换题会清空这一题的记录，已解出的题数保留。',
    s4scope: '本页的题答案都是正整数。答案是负数的方程（比如 x + 9 = 4）要先会<a class="xlink" href="../../../math/arithmetic/negative-numbers/#step3">在数轴上往左走 →</a>；系数是分数时（比如 ½x = 3），<a class="xlink" href="../../../math/arithmetic/fractions/#step1">分数也是数轴上的一个数 →</a>，解法仍然是两边做同样的事。',

    s5k: '第 5 步 · 两边都有袋子',
    s5t: '右盘也有袋子时，袋子怎么才能只剩一边？',
    s5e: '这一步要回答：<strong>3x + 1 = x + 9</strong> 两盘都有袋子，右盘那一个袋子怎么处理？每个袋子装得一样多，所以「两边各拿走 1 个袋子」和「两边各拿走 1 颗」一样，也是两边做同样的事，天平仍然平衡（两盘一样重）。先把一边的袋子拿光，就回到了上一步那种只有一边有袋子的方程。',
    s5hint: '观察顺序：先按「两边各拿走 1 个袋子」，右盘的袋子没了，等式变成 2x + 1 = 9；之后的做法和第 4 步一样。也可以先拿走散弹珠，再拿袋子，比较操作记录里的两条路。如果两边袋子一样多，拿光之后袋子就都没了，x 也就看不出来了，这种情况本页不出题。另一种看法：把两边各看成一条随 x 变化的直线，<a class="xlink" href="../../../math/algebra/linear-functions/#step3">两条线相遇的地方就是解 →</a>。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '只用一招：两边做同样的事',
    quizTitle: '自测（每题选一项后按「核对」）',
    q1: '天平上是 {eq}，x 是多少？', q2: '天平上是 {eq}，x 是多少？',
    q3: '天平上是 2x + 4 = 10。下面哪一种做法，做完天平一定还平？',
    q3a: '左盘拿走 4 颗，右盘也拿走 4 颗', q3b: '只把左盘的 4 颗拿走', q3c: '左盘拿走 4 颗，右盘拿走 2 颗', q3d: '两盘都放上 4 颗，再只从左盘拿走 8 颗',
    check: '核对',
    qRight: '对。{why}',
    qWrongNum: '不对。把 x = {v} 代回去：左边 {left} = {L}，右边是 {R}，两边不相等。回第 {s} 步再试一次。',
    qWrong3b: '只动了左盘，两盘就不一样重了，天平会倒。回第 1 步看「只往左盘放 1 颗」。',
    qWrong3c: '两边拿走的不一样多（4 颗和 2 颗），天平会倒。',
    qWrong3d: '第二步只动了左盘：左盘多拿走 4 颗，天平会倒。',
    qNoPick: '先选一项。',
    why1: '两边各拿走 7 颗，左盘只剩袋子，右盘剩 5 颗。代回：5 + 7 = 12 ✓。',
    why2: '两边各拿走 3 颗得 2x = 12，再平分成 2 份得 x = 6。代回：2×6 + 3 = 15 ✓。',
    why3: '两边拿走一样多，两盘仍然一样重，天平变成 2x = 6。',
    s6fin: '回头看这条线：<strong>第 0 步</strong>，天平平衡就是两盘一样重，不打开袋子也能称出里面有几颗；<strong>第 1、2 步</strong>，对两盘同时加、减同样多，或同时变成同样的倍数、同时平分（能整除时），天平都不倒，只动一边就倒；<strong>第 3–5 步</strong>，用这一招把一个袋子单独留在一边，另一边的颗数就是 x，最后代回验算。',
    formula: 'x + 3 = 10　→　x = 7\n2x + 5 = 13　→　2x = 8　→　x = 4\n4x + 2 = x + 11　→　3x + 2 = 11　→　3x = 9　→　x = 3',
    boundary: '适用范围：本页是理想天平：每颗弹珠一样重，袋子不计重量，差 1 颗就算不平（真实天平分辨不出太小的差别）；所有数都是正整数，平分必须整除，不乘 0。答案是负数、分数的方程，以及两边袋子一样多的情况，不在本页。',
    linksTitle: '接着去哪儿',
    lk1: '→ 天平倾斜时：不等式的答案是一整段（不等式页第 0 步）',
    lk2: '→ 两个未知数：两个方程要同时成立（二元一次方程组页第 1 步）',
    lk3: '→ 方程长成直线：两条线相遇处就是解（一次函数页第 3 步）',
    lk4: '→ 答案是负数时：在数轴上往左走（负数页第 3 步）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《方程天平 · 两边同做一件事》的平行版本。'
  },
  en: {
    pageTitle: 'Equations on a Balance · How Many Marbles in the Bag?',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Equations on a Balance · Do the Same to Both Sides →',
    navLabel: 'Equation balance steps',
    tagline: 'A sealed bag holds some marbles. You may not open it; you get a balance instead. A level balance means both pans weigh the same, and writing that down gives an equation. This page uses a single move, doing exactly the same thing to both pans, to leave the bag alone on one side. Then the answer shows itself.',
    nav0: '0 Weigh it', nav1: '1 Add & remove', nav2: '2 Double & share', nav3: '3 One-step', nav4: '4 Two-step', nav5: '5 Bags on both sides', nav6: '6 Quiz & wrap-up',
    leftPan: 'Left pan', rightPan: 'Right pan',
    tiltNote: 'The beam’s tilt is exaggerated so you can see it; whether it balances depends only on whether the two pans weigh the same.',

    s0k: 'STEP 0 · KEEP THE BAG SHUT',
    s0t: 'Without opening the bag, can you tell how many marbles are inside?',
    s0e: 'This step asks: with only a balance and a handful of loose marbles, can you find how many marbles a sealed bag holds? A balance has two <strong>pans</strong>, left and right, resting on a <strong>beam</strong>. When the <strong>needle</strong> in the middle points straight up, the two pans weigh the same: the balance is <strong>level</strong>. Whichever side is heavier sinks. Every marble weighs the same, so “1 marble” is our unit of weight; the bag itself weighs next to nothing, so the bag weighs exactly as much as the marbles inside it. The bag sits on the left pan; you add marbles to the right pan one at a time.',
    add0: 'Add 1 marble to the right', sub0: 'Take 1 marble off the right', next0: 'Try another bag',
    s0lgL: 'left heavier', s0lgR: 'right heavier', s0lgE: 'level',
    stripTitle: 'Marbles tried on the right pan',
    s0heavyL: '{n} marbles on the right: the left is still heavier, the needle leans left.',
    s0heavyR: '{n} marbles on the right: now the right is heavier, the needle leans right.',
    s0even: '{n} marbles on the right and the balance is level. The bag weighs the same as {n} marbles, so it holds exactly {n} marbles.',
    s0count: '{k}/{N} bags weighed.',
    s0more: 'Bag {i}/{N} is on the pan.',
    s0hint: 'What to watch: use only “Add 1 marble to the right” and glance at the needle after each one. The number line below records which side was heavier for every count you tried. The count squeezed between the “left heavier” dots and the “right heavier” dots is the one that levels the balance. Once you have it, press “Try another bag”. A number like this — not known yet, but definitely there — is called an <strong>unknown</strong>. From now on the letter x stands for the number of marbles in a bag (every bag holds the same amount).',

    s1k: 'STEP 1 · ADD AND REMOVE ON BOTH SIDES',
    s1t: 'The balance is level. What can you add or remove and keep it level?',
    s1e: 'This step asks: once a balance is level (both pans weigh the same), which ways of adding or removing things keep it level? The left pan holds 1 bag and 2 marbles, the right pan 8 marbles, and the beam is level. Written with letters this is <strong>x + 2 = 8</strong>: x is the number of marbles in a bag, and the equals sign says both pans weigh the same. A statement that two things are equal, joined by “=”, is an <strong>equality</strong>; one that contains an unknown is an <strong>equation</strong>. The big line under the picture changes along with the pans.',
    add1m: 'Add 1 marble to both pans', sub1m: 'Remove 1 marble from both pans', add1b: 'Add 1 bag to both pans', sub1b: 'Remove 1 bag from both pans', one1: 'Add 1 marble to the left pan only', reset1: 'Back to x + 2 = 8',
    check1a: 'Added the same to both pans', check1b: 'Removed the same from both pans', check1c: 'Changed one pan only and saw it tip',
    balancedYes: 'level (both pans weigh the same)', balancedNo: 'tipped (the pans weigh different amounts)',
    comp: 'Left: {L}　·　Right: {R}', cB: '{n} bag(s)', cM: '{m} marble(s)',
    s1status: '{comp}. The balance is {bal}.',
    s1hint: 'What to watch: press “Add 1 marble to both pans” and “Remove 1 marble from both pans” a few times. The beam stays level and both numbers in the equation change together. “Add 1 bag to both pans” works the same way. Then press “Add 1 marble to the left pan only” and the balance tips left at once. After that, adding or removing the same on both sides leaves it tipped: these moves preserve “both pans weigh the same”, so a balance that was off stays off.',
    histTitle: 'Moves so far',
    histItem: 'Move {k}　{op}　→　{eq}',
    histStart: 'Start　{eq}',
    opAddM: 'add {n} marble(s) to both pans', opSubM: 'remove {n} marble(s) from both pans', opAddB: 'add {n} bag(s) to both pans', opSubB: 'remove {n} bag(s) from both pans',
    opMul: 'make both pans {k} times as much', opDiv: 'share both pans into {k} equal parts, keep 1', opOneAddL: 'add {n} marble(s) to the left pan only', opOneMulL: 'make only the left pan {k} times as much',
    tagOk: '(level)', tagBad: '(tipped)',

    s2k: 'STEP 2 · DOUBLE AND SHARE',
    s2t: 'Double everything on both pans, or share it out and keep one part: still level?',
    s2e: 'This step asks: instead of adding a little, what if we make <strong>both</strong> pans several times as much, or split both into equal parts and keep only one? We start at <strong>x + 2 = 5</strong>: 1 bag + 2 marbles on the left, 5 marbles on the right. “Twice as much” means laying out another copy of what is already on each pan. “Share into 2 parts, keep 1” needs every pile to split evenly with no half marbles, which is <strong>dividing exactly</strong> (no remainder). Bags cannot be cut open, so the number of bags has to split evenly too.',
    mul2: 'Make both pans 2×', mul3: 'Make both pans 3×', div2: 'Share both pans into 2, keep 1', div3: 'Share both pans into 3, keep 1', one2: 'Make only the left pan 2×', reset2: 'Back to x + 2 = 5',
    check2a: 'Multiplied both pans', check2b: 'Shared both pans', check2c: 'Doubled one pan only',
    divNone: 'Neither pan can be shared right now: some pile would not split evenly (half a marble or half a bag).',
    divSome: 'You can share into: {list} parts.',
    tooMany: 'The pans are full (at most 6 bags and 24 marbles each), so that move was not made.',
    needMarbles: 'One pan does not have that many loose marbles, so nothing was removed. Removing the same from both sides needs both pans to have that many.',
    needBags: 'One pan does not have that many bags to remove, so nothing changed.',
    emptyPan: 'That would empty a pan completely, so the move was not made.',
    notEven: 'That split is not possible right now, so nothing changed.',
    s2hint: 'What to watch: press “Make both pans 2×”. Each pan gets a second copy of what it holds (the new copy fades in), the beam stays level, and the equation becomes 2x + 4 = 10. Then press “Share both pans into 2, keep 1”: the items are first coloured into groups, then only the first group stays, and you are back at x + 2 = 5. Finally press “Make only the left pan 2×” and watch it tip. When the rule holds: the multiplier cannot be 0 (two empty pans are “level” too, but the bag is gone and you learn nothing, so ×0 is not offered), and sharing must divide exactly.',

    nSlider: 'Marbles per move, n', opMul2: 'Double both pans',
    opDiv2: 'Share into 2, keep 1', opDiv3: 'Share into 3, keep 1', opDiv4: 'Share into 4, keep 1',
    undo: 'Undo one move', resetP: 'Back to the start', nextP: 'Next equation',
    goal: 'Goal: leave one bag alone on a pan, with nothing else on that pan.',
    problemOf: 'Equation {i}/{N}　{eq}',
    solvedLine: 'The bag is alone on the {side} and the {other} holds {v} marbles, and the beam is level, so x = {v}. Check it in the original {eq}: the left side is {left} = {L}, the right side is {right} = {R}. They match ✓. You took {k} move(s).',
    sideL: 'left pan', sideR: 'right pan',
    solvedCount: '{k}/{N} equations solved.',
    notYet: 'Not solved yet: {comp}. The balance is {bal}.',

    s3k: 'STEP 3 · ONE-STEP EQUATIONS',
    s3t: 'x + 5 = 9: how do you leave the bag alone on the left?',
    s3e: 'This step asks: the balance shows <strong>x + 5 = 9</strong> (1 bag + 5 marbles on the left, 9 marbles on the right). Using only “do the same to both pans”, how do you leave the bag alone on the left? As soon as the bag is all that remains on the left and the beam is still level (both pans weigh the same), the number of marbles on the right is x. This process is <strong>solving the equation</strong>, and the number you get is its <strong>solution</strong>. Finally, put the solution back into the original equation and work out both sides; if they match, you really have it. That is <strong>checking by substitution</strong>.',
    s3hint: 'What to watch: first decide what has to leave the left pan, drag n to that number, then press “Remove n marbles from both”. A wrong turn does no harm: the balance stays level, you are just further from the goal, and “Undo one move” takes it back. The readout never gives the answer away: until the bag stands alone, it only tells you what is on each pan, never what the bag weighs.',

    s4k: 'STEP 4 · TWO-STEP EQUATIONS',
    s4t: 'Several bags plus loose marbles: which move comes first?',
    s4e: 'This step asks: with several bags on the left, say <strong>3x + 2 = 14</strong> (3 bags + 2 marbles against 14 marbles), one move is not enough. Do you remove the loose marbles first, or share first? The number in front of x (the 3 in 3x) is the <strong>coefficient</strong>: how many bags there are. The goal has not changed: leave one bag alone while the beam stays level (both pans weigh the same). Each of the three equations has its own twist, so watch when the sharing buttons come alive.',
    s4hint: 'What to watch: in equation 1, look at the sharing buttons first. 3 bags, 2 marbles and 14 marbles cannot all split into 3, so you must remove 2 marbles from both pans first; only at 3x = 12 can you share. Equations 2 and 3 work in either order: 2x + 6 = 16 can lose 6 marbles and then be shared into 2, or be shared into 2 first (x + 3 = 8) and then lose 3 marbles. Compare the move lists: different routes, same number at the end. Switching equations clears that equation’s moves but keeps your solved count.',
    s4scope: 'Every answer on this page is a positive whole number. Equations whose answer is negative (like x + 9 = 4) need <a class="xlink" href="../../../math/arithmetic/negative-numbers/#step3">walking left on the number line →</a>; when the coefficient is a fraction (like ½x = 3), remember that <a class="xlink" href="../../../math/arithmetic/fractions/#step1">a fraction is a single number on the number line →</a>, and the method is still to do the same to both sides.',

    s5k: 'STEP 5 · BAGS ON BOTH SIDES',
    s5t: 'When the right pan has bags too, how do you get bags on one side only?',
    s5e: 'This step asks: in <strong>3x + 1 = x + 9</strong> both pans hold bags. What do you do with the bag on the right? Every bag holds the same amount, so “remove 1 bag from both pans” is just like “remove 1 marble from both pans”: the same move on both sides, and the beam stays level (both pans weigh the same). Clear the bags off one side and you are back to the kind of equation from the last step.',
    s5hint: 'What to watch: press “Remove 1 bag from both” first. The right pan loses its bag and the equation becomes 2x + 1 = 9; from there it goes as in step 4. You can also remove the loose marbles first and the bag afterwards, then compare the two routes in the move list. If both pans had the same number of bags, removing them would leave no bags at all and x could not be seen; this page has no such equation. Another way to look at it: treat each side as a line that changes with x, and <a class="xlink" href="../../../math/algebra/linear-functions/#step3">the point where the two lines meet is the solution →</a>.',

    s6k: 'STEP 6 · QUIZ AND WRAP-UP',
    s6t: 'One move only: do the same to both sides',
    quizTitle: 'Quick quiz (pick one option, then press “Check”)',
    q1: 'The balance shows {eq}. What is x?', q2: 'The balance shows {eq}. What is x?',
    q3: 'The balance shows 2x + 4 = 10. Which of these is sure to keep it level?',
    q3a: 'Remove 4 marbles from the left and 4 from the right', q3b: 'Remove the 4 marbles from the left pan only', q3c: 'Remove 4 marbles from the left and 2 from the right', q3d: 'Add 4 marbles to both pans, then remove 8 from the left only',
    check: 'Check',
    qRight: 'Right. {why}',
    qWrongNum: 'Not quite. Put x = {v} back in: the left side is {left} = {L}, the right side is {R}, and they differ. Go back to step {s} and try again.',
    qWrong3b: 'Only the left pan changed, so the pans no longer weigh the same and the balance tips. See step 1, “Add 1 marble to the left pan only”.',
    qWrong3c: 'The two sides lose different amounts (4 and 2 marbles), so the balance tips.',
    qWrong3d: 'The second move touches the left pan only: it loses 4 more marbles than the right, so the balance tips.',
    qNoPick: 'Pick an option first.',
    why1: 'Remove 7 marbles from both pans: the bag is alone on the left and 5 marbles remain on the right. Check: 5 + 7 = 12 ✓.',
    why2: 'Remove 3 marbles from both pans to get 2x = 12, then share both into 2 to get x = 6. Check: 2×6 + 3 = 15 ✓.',
    why3: 'Both pans lose the same amount, so they still weigh the same; the balance now reads 2x = 6.',
    s6fin: 'Looking back: <strong>Step 0</strong> — level means both pans weigh the same, so you can weigh a bag’s marbles without opening it. <strong>Steps 1–2</strong> — adding or removing the same amount on both pans, or making both pans the same number of times as much, or sharing both evenly (when it divides exactly), keeps the balance level; touching one pan tips it. <strong>Steps 3–5</strong> — use that one move to leave a single bag alone; the marbles on the other pan are x, and substituting back confirms it.',
    formula: 'x + 3 = 10　→　x = 7\n2x + 5 = 13　→　2x = 8　→　x = 4\n4x + 2 = x + 11　→　3x + 2 = 11　→　3x = 9　→　x = 3',
    boundary: 'Where this holds: this is an ideal balance. Every marble weighs the same, the bags weigh nothing, and a difference of a single marble counts as tipped (a real balance cannot detect very small differences). All numbers are positive whole numbers, sharing must divide exactly, and nothing is multiplied by 0. Equations with negative or fractional answers, and equations with the same number of bags on both sides, are outside this page.',
    linksTitle: 'Where to go next',
    lk1: '→ When the balance tips: an inequality’s answer is a whole range (Inequalities, step 0)',
    lk2: '→ Two unknowns: two equations that must hold at once (Simultaneous Equations, step 1)',
    lk3: '→ Equations as lines: where two lines meet is the solution (Linear Functions, step 3)',
    lk4: '→ When the answer is negative: walking left on the number line (Negative Numbers, step 3)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Equations on a Balance · Do the Same to Both Sides”.'
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
