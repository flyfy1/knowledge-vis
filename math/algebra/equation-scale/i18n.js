'use strict';
/* ============================================================
   方程天平 · 两边同做一件事 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '方程天平 · 两边同做一件事 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '方程天平 · 两边同做一件事',
    tagline: '等号不是「算出答案」的信号，是一架天平的指针：指针归零，两边一样重。这一页我们只学一招——不管做什么，对两边同时做相同的事——用这一招把 x 一个人留在天平左边。',
    nav0: '0 认识天平', nav1: '1 两边同加同减', nav2: '2 两边同乘同除',
    nav3: '3 一步方程', nav4: '4 两步方程', nav5: '5 自测', nav6: '6 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 方程天平 Equations on a Balance —— 一步一交互系列',

    /* 画布与通用读数 */
    cLeft: '左盘', cRight: '右盘', cBeam: '横梁', cPointer: '中央指针',
    compFull: '左盘：{L} · 右盘：{R}',
    compBoxes: '{n} 个盒子', compUnits: '{n} 个单位', compEmpty: '空',
    roBalanced: '{comp}<br>式子：<b>{expr}</b> —— 两边一样重，<b>平衡</b>。',
    roLeftHeavy: '{comp}<br>式子：<b>{expr}</b> —— 左边更重，<b>天平不平</b>。',
    roRightHeavy: '{comp}<br>式子：<b>{expr}</b> —— 右边更重，<b>天平不平</b>。',
    tiltNote: '横梁倾斜的角度是示意，画得夸张了；判断平不平，只看两边重量是否相等。',
    ckTitle: '观察清单（自己核对，不拦路）',

    /* step0 认识天平 */
    s0k: '第 0 步 · 认识天平',
    s0t: '一盒不知道多重的东西',
    s0e: '这一步要回答：<strong>一盒密封的东西（不许打开）到底多重，不用电子秤、只用天平和砝码能不能称出来？</strong>先认部件：天平有<strong>左盘、右盘</strong>，中间是<strong>横梁</strong>和<strong>中央指针</strong>——指针正对中线、横梁水平，就叫<strong>平衡</strong>（两边一样重）。右盘里的小块叫<strong>砝码</strong>，本页最小的一块记 1 个<strong>单位</strong>（不用克、千克）。盒子的重量暂时不知道、但确定有——数学里把这种量叫<strong>未知数</strong>，先用字母 <strong>x</strong> 占位。',
    s0add: '＋ 放一个砝码', s0remove: '－ 取走一个砝码', s0swap: '换一盒（重新称）',
    s0roIdle: '左盘有一只密封盒。往右盘逐个放砝码，把横梁调平——注意：这里只告诉你哪边重，不告诉你差多少，差多少正是你要称出来的。',
    s0roLeft: '左边还重些 —— 盒子比现在的砝码重，再往右盘放。',
    s0roRight: '右边反超了 —— 砝码放多了，取走一些。',
    s0roBalanced: '平了！右盘有 <b>{n}</b> 个单位 —— 这盒东西就重 <b>{n}</b> 个单位。称出来了，不用打开盒子。',
    s0roSwapped: '换了一盒新的：外观一样，重量未知。右盘已清空，重新称。',
    s0ckItem: '亲手把天平调平一次',
    s0hint: '结论：一盒东西的重量是<strong>确定的</strong>，没称出来不等于没有——这正是未知数 x 的意思。先说清本页的设定：这是一架<strong>理想天平</strong>（横梁无摩擦、指针零误差）；真实天平有灵敏度极限，两边只差一点点时未必看得出倾斜，本页按「差 1 个单位就不平」处理，是教学简化。本页砝码和盒重都是整数个单位。',

    /* step1 两边同加同减 */
    s1k: '第 1 步 · 两边同加同减',
    s1t: '天平已经平了，怎么放它才不倒',
    s1e: '这一步要回答：<strong>天平已经平衡，我再往盘子里放东西（或取东西），怎么操作它才不倒？</strong>带等号、左右两边相等的式子叫<strong>等式</strong>——等号就是天平指针归零的那一刻。图里左盘是 1 个盒子 + 2 个单位，右盘 8 个单位（盒子在第 0 步称过，是 6 个单位，所以 6 + 2 = 8，两边一样重）。试四个操作钮，注意看：每次操作之后读数只报<strong>组成</strong>（几个盒子、几个单位），不报总重量——先把「看组成」的习惯练出来。',
    s1addU: '两边各加 1 个单位', s1addB: '两边各加 1 个盒子',
    s1subU: '两边各取走 1 个单位', s1one: '只给左盘加 1 个单位（只加左边试试）',
    s1reset: '回到初始平衡',
    s1ckAdd: '试过「两边同加」', s1ckSub: '试过「两边同减」', s1ckOne: '试过「只加一边」，看见它倒',
    s1lastAddU: '刚才：两边各加了 1 个单位。', s1lastAddB: '刚才：两边各加了 1 个盒子。',
    s1lastSubU: '刚才：两边各取走了 1 个单位。',
    s1lastOne: '刚才：只给左盘加了 1 个单位 —— 只动一边，平衡就没了。点「回到初始平衡」再试别的。',
    s1whySub: '取不了：两边各取走 1 个单位要求两边都有单位可取（左盘 {lb} 个、右盘 {rb} 个），有一边不够。',
    s1hint: '结论：对天平两边同时加上（或取走）<strong>同样多</strong>的东西，平衡不变；只动一边，平衡就破坏。这一招有个总称：<strong>对两边同做一件事</strong>——同加同减是它的第一种。注意读数旁那句：倾斜角度是示意，是否平衡只看两边重量是否相等。',

    /* step2 两边同乘同除 */
    s2k: '第 2 步 · 两边同乘同除',
    s2t: '把两边一起放大、一起缩小',
    s2e: '这一步要回答：<strong>把两盘的东西同时翻倍，或者同时只留一份，天平还平吗？</strong>乘法就是连加、除法就是平分（以前学过）。图里是 x + 1 = 4（这个盒子重 3 个单位）。点「两边同时 ×2」，看两盘的东西当场复制一份；再点「两边同时 ÷k」——把每盘分成 k 等份（<strong>整除</strong>：分完没有剩余、不出现半块），只留一份。同样留了一个「只乘左边」的反例钮。',
    s2mul2: '两边同时 ×2', s2mul3: '两边同时 ×3',
    s2divLab: '两边同时除以：', s2one: '只乘左边 ×2（只乘一边试试）',
    s2reset: '回到初始平衡',
    s2ckMul: '试过「两边同乘」', s2ckDiv: '试过「两边同除」', s2ckOne: '试过「只乘一边」，看见它倒',
    s2lastMul: '刚才：两边同时 ×{k} —— 两盘的东西都复制成了 {k} 份。',
    s2lastDiv: '刚才：两边同时 ÷{k} —— 每盘分成 {k} 等份，只留一份。',
    s2lastOne: '刚才：只把左边 ×2 —— 只动一边，平衡就没了。点「回到初始平衡」再试别的。',
    s2noDiv: '现在两边没办法再同时整除：两边的盒子数、单位数没有大于 1 的公约数了。',
    s2cap: '这个操作暂时停用：做完会超过画布上限（盒子最多 6 个、单位最多 24 个）。',
    s2hint: '结论：两边同时乘以同一个<strong>非零</strong>数、或同时除以一个<strong>能整除</strong>的数，平衡不变。两个条件缺一不可：乘 0 会把两边都变成 0、信息全抹掉，本页不提供 ×0；除不尽的本页不做，我们不切半个砝码。',

    /* step3 一步方程 */
    s3k: '第 3 步 · 一步方程',
    s3t: '把 x 单独留在左边',
    s3e: '这一步要回答：<strong>x + 3 = 7 —— 怎么操作，才能让左盘只剩下盒子一个、把 x 逼出来？</strong>把 x 单独逼出来的过程叫<strong>解方程</strong>，逼出来的那个数叫方程的<strong>解</strong>。工具还是那一招：用下面的操作钮对两边同做一件事（平衡＝两边一样重，不会倒）。走错路也没关系，天平照样平，只是还没到目标，随时能调整或重置。',
    opAmtLab: '每次操作的数量',
    opAddU: '两边同加 {n} 个单位', opSubU: '两边同减 {n} 个单位',
    opMul2: '两边同乘 ×2', opMul3: '两边同乘 ×3', opDivLab: '两边同除以：',
    opReset: '重置本步',
    whySubU: '减不了：两边要同时减，左盘有 {lb} 个单位、右盘有 {rb} 个单位，有一边不够减 {n} 个。',
    whyMulCap: '乘不了：乘完会超过上限（盒子最多 6 个、单位最多 24 个）。',
    whyDivNone: '现在没有能同时整除两边的数（除数要让两边的盒子数和单位数都整除）。',
    goalLine: '目标：让左盘只剩下 1 个盒子（x 单独在一边）。',
    histTitle: '操作轨迹（你做过的每一步）',
    histAddU: '第 {k} 步：两边同加 {n} 个单位', histSubU: '第 {k} 步：两边同减 {n} 个单位',
    histMul: '第 {k} 步：两边同乘 ×{n}', histDiv: '第 {k} 步：两边同除以 {n}',
    histNone: '还没做过操作。',
    rReady: '左盘只剩 x 了 —— 可以开盒了！',
    rBtn: '开盒揭晓',
    rReveal: '盒子里装着 <b>{xv}</b> 个单位的重量 —— 所以 <b>x = {xv}</b>。这是你自己一步步操作出来的，不是猜的。',
    rVerify: '<strong>代回验算</strong>（把解放回原式检查）：x = {xv} 放回原式 {orig}：左边 = {ls} = <b>{lv}</b>，右边 = <b>{rv}</b>，两边相等 ✓',
    s3hint: '结论：解方程没有口诀，就是用「两边同做一件事」一步步把 x 单独留在一边，另一边剩下的数就是 x 的值；最后代回验算（把解放回原式，两边算出来相等才算对）。本步的方程都是一步可解、答案是整数。',

    /* step4 两步方程 */
    s4k: '第 4 步 · 两步方程',
    s4t: '用两次，先哪件后哪件自己定',
    s4e: '这一步要回答：<strong>盒子有好几个、还混着砝码（2x + 3 = 11），一次操作不够，该先做哪件、后做哪件？</strong>盒子前面的个数叫<strong>系数</strong>（2x 的 2 就是系数，意思是 2 个盒子）。答案是：顺序自己定——先同减再同除、先同除再同减，两条路都通，页面只认最终把 x 单独留在一边。操作轨迹会逐条记下，让你看得见自己走了哪条路。',
    s4next: '换一题', s4qLab: '第 {i} 题 / 共 3 题',
    s4prog: '已解出 {k}/3 题',
    s4hint: '结论：两步方程就是把「两边同做一件事」用两次。本页的题只用正的常数和正的答案；答案是负数的方程（如 x + 9 = 4）里，带负号的数怎么加减在<a class="fourier-link" href="../negative-numbers/#step3">负数那一页（沿数轴走）</a>；系数是分数的方程（如 ½x = 3）里，½ 不是两个数、是一个数，看<a class="fourier-link" href="../fractions/#step1">分数那一页（分数也是一个数）</a>——解法仍然是两边同做一件事。',

    /* step5 自测 */
    s5k: '第 5 步 · 自测',
    s5t: '自测：三题，都用同一招',
    s5e: '这一步要回答：<strong>不看天平动画，你自己能不能把 x 逼出来？</strong>三题的答案都由方程本身算出来判定，答对才出现解析；答错只给提示，不给答案。答题之后回前面几步改操作、换题，已经答对的题不会被冲掉。',
    s5cap: '第 1 题的天平：x + 5 = 12（左盘 1 个盒子 + 5 个单位，右盘 12 个单位）',
    s5q1: '① 一步方程（回第 3 步）：x + 5 = 12，求 x。',
    q1ok: '答对了！解析：两边同时减 {n} —— {e0} 变成 <b>{e1}</b>；代回验算：{chk} ✓',
    q1bad: '还不对。回第 3 步想那一招：要让 x 单独留下，应该对两边同时做什么、做多少？',
    s5q2: '② 两步方程（回第 4 步）：2x + 4 = 14，求 x。',
    q2ok: '答对了！解析：两边同减 {n1} —— {e0} 变成 {e1}；再两边同除以 {n2} —— 变成 <b>{e2}</b>；代回验算：{chk} ✓',
    q2bad: '还不对。这题要用两次：先去掉左边的常数（同减），再把系数变成 1（同除）。回第 4 步再走一遍。',
    s5q3: '③ 方法判断（回第 1、3 步）：要解 x + 6 = 10，下面哪一步是对的？',
    s5q3a: '两边同时减去 6', s5q3b: '只把左边的 6 拿走',
    s5q3c: '只把右边的 6 拿走', s5q3d: '两边同时加上 6',
    q3ok: '答对了！两边同时减 6：x + 6 = 10 变成 <b>x = 4</b>；代回验算：4 + 6 = 10 ✓。要记的只有这一招的名字：对两边同做一件事。',
    q3badSide: '这一步会让天平倒：只动一边，两边就不一样重了（回第 1 步看）。',
    q3badAdd: '方向反了：加 6 会让左边的 6 变得更多，离只剩 x 更远（回第 3 步看）。',
    s5done: '三题全对 —— 一步方程、两步方程、方法判断都过关了。',

    /* step6 终章 */
    s6k: '第 6 步 · 终章',
    s6t: '等号是一架天平',
    s6e: '这一步要回答：<strong>这一页其实只教了一招，是哪一招？</strong>从称盒子到解两步方程，所有操作都是同一件事：守住一架天平。下面回放第 4 步的一道题：2x + 3 = 11 从原式到 x = 4，盘面组成怎么一步步变干净。',
    s6op1: '两边同减 3', s6op2: '两边同除以 2',
    s6fin: '解方程没有什么口诀：<strong>守住一架天平——不管做什么，对两边同时做相同的事，直到 x 单独留在一边。</strong>最后提醒本页的边界：这是一架理想天平（无摩擦、指针零误差），重量都是整数个单位；常数是负数、答案是分数的方程，盘面上摆不出来，要先补上负数与分数的地基（下面两条链接），再把这一招用过去。',
    lkNeg: '带负号的数怎么加减：沿数轴走 →（以后会遇到答案是负数的方程，如 x + 9 = 4）',
    lkFrac: '分数也是一个数 →（系数是分数的方程，如 ½x = 3，解法仍是两边同做一件事）',
    lkLin: '方程会长成一条直线 →（等号两边都带 x 时，先看式子怎样长成直线 y = kx + b；两条线相遇就是方程的解，在那一页紧接着的第 3 步）'
  },
  en: {
    docTitle: 'Equations on a Balance · Do the Same to Both Sides — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Equations on a Balance · Do the Same to Both Sides',
    tagline: 'The equals sign is not a “compute the answer” button; it is the needle of a balance — at zero, both sides weigh the same. This page teaches one move only: whatever you do, do the same to both sides — and use it to leave x alone on the left.',
    nav0: '0 Meet the Balance', nav1: '1 Add & Subtract Both Sides', nav2: '2 Multiply & Divide Both Sides',
    nav3: '3 One-Step Equations', nav4: '4 Two-Step Equations', nav5: '5 Quiz', nav6: '6 Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Equations on a Balance —— One Interaction at a Time series',

    cLeft: 'Left pan', cRight: 'Right pan', cBeam: 'Beam', cPointer: 'Needle',
    compFull: 'Left pan: {L} · Right pan: {R}',
    compBoxes: '{n} box(es)', compUnits: '{n} unit(s)', compEmpty: 'empty',
    roBalanced: '{comp}<br>Equation: <b>{expr}</b> — both sides weigh the same: <b>balanced</b>.',
    roLeftHeavy: '{comp}<br>Equation: <b>{expr}</b> — the left side is heavier: <b>not balanced</b>.',
    roRightHeavy: '{comp}<br>Equation: <b>{expr}</b> — the right side is heavier: <b>not balanced</b>.',
    tiltNote: 'The beam\'s tilt is exaggerated for visibility; balance is judged only by whether the two sides weigh the same.',
    ckTitle: 'Observation checklist (for yourself — nothing is blocked)',

    s0k: 'Step 0 · Meet the Balance',
    s0t: 'A Sealed Box of Unknown Weight',
    s0e: 'The question for this step: <strong>a sealed box (no opening it) — can you find its weight with nothing but a balance and some weights?</strong> First, the parts: the balance has a <strong>left pan and a right pan</strong>, a <strong>beam</strong> across the top and a <strong>needle</strong> in the middle — when the needle points at the center mark and the beam is level, the balance is <strong>balanced</strong> (both sides weigh the same). The small blocks are <strong>weights</strong>; the smallest counts as 1 <strong>unit</strong> on this page (no grams or kilograms). The box’s weight is unknown for now, but it is a definite number — mathematics calls such a quantity an <strong>unknown</strong> and writes the letter <strong>x</strong> as a placeholder.',
    s0add: '＋ Add one weight', s0remove: '－ Remove one weight', s0swap: 'Swap the box (weigh again)',
    s0roIdle: 'There is a sealed box on the left pan. Add weights to the right pan one at a time until the beam levels out — note: the readout only tells you which side is heavier, never by how much. The “how much” is exactly what you are weighing.',
    s0roLeft: 'The left side is still heavier — the box outweighs the current weights. Add more to the right pan.',
    s0roRight: 'The right side has tipped over — too many weights. Take some off.',
    s0roBalanced: 'Level! The right pan holds <b>{n}</b> units — so this box weighs <b>{n}</b> units. Weighed, without ever opening the box.',
    s0roSwapped: 'A new box: same look, unknown weight. The right pan has been cleared — weigh it again.',
    s0ckItem: 'Level the balance yourself once',
    s0hint: 'The point: a box’s weight is <strong>definite</strong> — not knowing it yet does not mean it is not there. That is exactly what the unknown x means. One honest note about this page’s setup: this is an <strong>ideal balance</strong> (no friction, a perfect needle). A real balance has a sensitivity limit — a tiny difference may not tilt it visibly. On this page, a difference of 1 unit already counts as unbalanced; that is a teaching simplification. All weights and box weights on this page are whole numbers of units.',

    s1k: 'Step 1 · Add & Subtract on Both Sides',
    s1t: 'It Is Balanced — What Keeps It That Way?',
    s1e: 'The question for this step: <strong>the balance is level — if I add things to the pans (or take things off), what can I do without tipping it?</strong> A statement with an equals sign and equal sides is an <strong>equation</strong> — the equals sign is the moment the needle sits at zero. In the picture, the left pan holds 1 box + 2 units and the right pan 8 units (the box was weighed in Step 0 at 6 units, so 6 + 2 = 8: the sides match). Try the four operation buttons. After every move, the readout reports only the <strong>makeup</strong> of each pan (how many boxes, how many units), never the total weight — build the habit of reading the makeup first.',
    s1addU: 'Add 1 unit to both sides', s1addB: 'Add 1 box to both sides',
    s1subU: 'Remove 1 unit from both sides', s1one: 'Add 1 unit to the left pan only (try one side)',
    s1reset: 'Back to the starting balance',
    s1ckAdd: 'Tried adding to both sides', s1ckSub: 'Tried removing from both sides', s1ckOne: 'Tried one side only, and saw it tip',
    s1lastAddU: 'Just now: 1 unit added to both sides.', s1lastAddB: 'Just now: 1 box added to both sides.',
    s1lastSubU: 'Just now: 1 unit removed from both sides.',
    s1lastOne: 'Just now: 1 unit added to the left pan only — touch one side only, and the balance is gone. Use “Back to the starting balance” and try another move.',
    s1whySub: 'Cannot remove: taking 1 unit from both sides needs units on both pans (left has {lb}, right has {rb}) — one side has none.',
    s1hint: 'The conclusion: adding the <strong>same amount</strong> to both sides (or removing the same amount) keeps the balance; touching one side only breaks it. This one move has a name: <strong>do the same thing to both sides</strong> — adding and subtracting are its first form. And remember the note by the readout: the tilt is drawn exaggerated; balance is judged only by equal weights.',

    s2k: 'Step 2 · Multiply & Divide Both Sides',
    s2t: 'Scale Both Sides Up, Scale Both Sides Down',
    s2e: 'The question for this step: <strong>if I double everything on both pans at once — or keep only one share of each — does the balance hold?</strong> Multiplication is repeated addition and division is fair sharing (both old friends). The picture shows x + 1 = 4 (this box weighs 3 units). Press “Multiply both sides ×2” and watch each pan’s contents being copied; then press “Divide both sides by k” — each pan is split into k equal shares (<strong>dividing evenly</strong>: nothing left over, no halves) and only one share is kept. There is also, as usual, a “left side only” mistake button.',
    s2mul2: 'Multiply both sides ×2', s2mul3: 'Multiply both sides ×3',
    s2divLab: 'Divide both sides by:', s2one: 'Multiply the left side ×2 only (try one side)',
    s2reset: 'Back to the starting balance',
    s2ckMul: 'Tried multiplying both sides', s2ckDiv: 'Tried dividing both sides', s2ckOne: 'Tried one side only, and saw it tip',
    s2lastMul: 'Just now: both sides ×{k} — everything on each pan was multiplied by {k}, copied out in full.',
    s2lastDiv: 'Just now: both sides ÷{k} — each pan was split into {k} equal shares and only one share kept.',
    s2lastOne: 'Just now: only the left side was ×2 — touch one side only, and the balance is gone. Use “Back to the starting balance” and try another move.',
    s2noDiv: 'Right now the two sides cannot be divided evenly at the same time: the box counts and unit counts share no common divisor greater than 1.',
    s2cap: 'This move is paused: it would overflow the picture (at most 6 boxes and 24 units).',
    s2hint: 'The conclusion: multiplying both sides by the same <strong>non-zero</strong> number, or dividing both sides by a number that <strong>divides them evenly</strong>, keeps the balance. Both conditions matter: multiplying by 0 would turn both sides into 0 and erase all the information, so ×0 is not offered here; and this page never cuts a weight in half, so only even divisions are allowed.',

    s3k: 'Step 3 · One-Step Equations',
    s3t: 'Leave x Alone on the Left',
    s3e: 'The question for this step: <strong>x + 3 = 7 — what sequence of moves leaves only the box on the left pan and forces x out into the open?</strong> The process of cornering x like this is called <strong>solving the equation</strong>, and the number you corner is the <strong>solution</strong>. Your only tool is the one move: do the same thing to both sides (balanced means equal weights, so it cannot tip). Wrong turns are fine — the balance stays level, you are just not at the goal yet; adjust or reset at any time.',
    opAmtLab: 'Amount per move',
    opAddU: 'Add {n} unit(s) to both sides', opSubU: 'Remove {n} unit(s) from both sides',
    opMul2: 'Multiply both sides ×2', opMul3: 'Multiply both sides ×3', opDivLab: 'Divide both sides by:',
    opReset: 'Reset this step',
    whySubU: 'Cannot subtract: both sides must give up units together — the left pan has {lb} unit(s) and the right pan {rb}; one side is short of {n}.',
    whyMulCap: 'Cannot multiply: the result would pass the limits (at most 6 boxes, 24 units).',
    whyDivNone: 'No number currently divides both pans evenly (a divisor must divide the box count and the unit count on both sides).',
    goalLine: 'Goal: leave exactly 1 box on the left pan (x all alone on one side).',
    histTitle: 'Your moves so far',
    histAddU: 'Move {k}: added {n} unit(s) to both sides', histSubU: 'Move {k}: removed {n} unit(s) from both sides',
    histMul: 'Move {k}: multiplied both sides ×{n}', histDiv: 'Move {k}: divided both sides by {n}',
    histNone: 'No moves yet.',
    rReady: 'The left pan holds x alone — time to open the box!',
    rBtn: 'Open the box',
    rReveal: 'Inside the box: the weight of <b>{xv}</b> units — so <b>x = {xv}</b>. You produced this with your own moves; it is not a guess.',
    rVerify: '<strong>Check by substituting</strong> (put the solution back into the original equation): with x = {xv} in {orig}: the left side = {ls} = <b>{lv}</b>, the right side = <b>{rv}</b> — equal ✓',
    s3hint: 'The conclusion: there is no trick to solving equations — use “the same thing to both sides” until x is alone on one side; the number left on the other side is its value. Always finish by checking by substituting (put the solution back; both sides must come out equal). Every equation in this step takes one move and has a whole-number answer.',

    s4k: 'Step 4 · Two-Step Equations',
    s4t: 'Two Moves — You Choose the Order',
    s4e: 'The question for this step: <strong>several boxes mixed with weights (2x + 3 = 11) — one move is not enough, so which move goes first and which second?</strong> The number in front of the boxes is the <strong>coefficient</strong> (the 2 in 2x means 2 boxes). The answer: you choose the order — subtract then divide, or divide then subtract; both roads arrive, and the page only cares that x ends up alone. Every move is written into the trail below, so you can see which road you took.',
    s4next: 'Next problem', s4qLab: 'Problem {i} of 3',
    s4prog: 'Solved {k} of 3 problems',
    s4hint: 'The conclusion: a two-step equation is just “the same thing to both sides” used twice. The problems on this page use only positive constants and positive answers; for an equation whose answer is negative (like x + 9 = 4), how signed numbers add and subtract is on <a class="fourier-link" href="../negative-numbers/#step3">the Negative Numbers page (walking the number line)</a>; for a fractional coefficient (like ½x = 3), ½ is one number, not two — see <a class="fourier-link" href="../fractions/#step1">the Fractions page (a fraction is a number)</a>. The solving move stays the same either way.',

    s5k: 'Step 5 · Quiz',
    s5t: 'Quiz: Three Problems, One Move',
    s5e: 'The question for this step: <strong>without the balance animation, can you corner x yourself?</strong> Each answer is judged by the equation itself, and the worked solution appears only after you answer correctly; a wrong answer earns a hint, never the answer. Going back to change moves in earlier steps afterwards will not disturb the problems you have already solved.',
    s5cap: 'The balance for Q1: x + 5 = 12 (left pan: 1 box + 5 units; right pan: 12 units)',
    s5q1: 'Q1 (one-step, back to Step 3): x + 5 = 12. Find x.',
    q1ok: 'Correct! Worked solution: remove {n} from both sides — {e0} becomes <b>{e1}</b>; check by substituting: {chk} ✓',
    q1bad: 'Not yet. Think of the one move from Step 3: to leave x alone, what should be done to both sides, and by how much?',
    s5q2: 'Q2 (two-step, back to Step 4): 2x + 4 = 14. Find x.',
    q2ok: 'Correct! Worked solution: remove {n1} from both sides — {e0} becomes {e1}; then divide both sides by {n2} — it becomes <b>{e2}</b>; check by substituting: {chk} ✓',
    q2bad: 'Not yet. This one takes two moves: clear the constant on the left first (subtract from both sides), then turn the coefficient into 1 (divide both sides). Walk it again in Step 4.',
    s5q3: 'Q3 (judge the method, back to Steps 1 & 3): to solve x + 6 = 10, which move is correct?',
    s5q3a: 'Subtract 6 from both sides', s5q3b: 'Take the 6 away from the left side only',
    s5q3c: 'Take the 6 away from the right side only', s5q3d: 'Add 6 to both sides',
    q3ok: 'Correct! Subtracting 6 from both sides turns x + 6 = 10 into <b>x = 4</b>; check: 4 + 6 = 10 ✓. The only name worth remembering is the move itself: the same thing to both sides.',
    q3badSide: 'That move tips the balance: touching one side only makes the two sides weigh differently (look back at Step 1).',
    q3badAdd: 'Wrong direction: adding 6 makes the 6 on the left even bigger — further from x alone (look back at Step 3).',
    s5done: 'All three correct — one-step equations, two-step equations and judging the method are all yours.',

    s6k: 'Step 6 · Finale',
    s6t: 'The Equals Sign Is a Balance',
    s6e: 'The question for this step: <strong>this whole page taught exactly one move — which one?</strong> From weighing a box to solving two-step equations, every operation was the same act: guarding one balance. Below is a replay of a Step 4 problem: watch the makeup of the pans get cleaner, frame by frame, from 2x + 3 = 11 down to x = 4.',
    s6op1: 'remove 3 from both sides', s6op2: 'divide both sides by 2',
    s6fin: 'There is no chant for solving equations: <strong>guard one balance — whatever you do, do the same to both sides, until x stands alone on one side.</strong> A last reminder of this page’s limits: the balance here is ideal (no friction, a perfect needle) and every weight is a whole number of units. Equations with negative constants or fractional answers cannot be laid out on these pans — build the groundwork for negative numbers and fractions first (the two links below), then carry the same one move over.',
    lkNeg: 'How signed numbers add and subtract: walking the number line → (for equations whose answer is negative, like x + 9 = 4)',
    lkFrac: 'A fraction is also a number → (for a fractional coefficient, like ½x = 3 — the move is still: the same thing to both sides)',
    lkLin: 'An equation grows into a straight line → (when both sides carry x, first see how an expression becomes the line y = kx + b; where two lines meet is the solution — that is Step 3 of that page, right after this one)'
  }
};

let _lang = null;
let _langMem = 'zh';
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
document.addEventListener('DOMContentLoaded', initLangToggle);
