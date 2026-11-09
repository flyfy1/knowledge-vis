'use strict';
// Place value strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '位值 · 十根捆成一捆',
    back: '← 知识索引',
    compare: '对照另一版本：位值与计数器 · 满十进一 →',
    navLabel: '位值步骤导航',
    tagline: '一大堆小棒，一根一根数太慢；十根捆成一小捆，十小捆扎成一大捆，一眼就数清了。写数的时候，每个数字站在哪一位，就说明它数的是单根、小捆还是大捆。这一页从捆小棒讲到计数器、0 占位、比大小和乘 10。',
    nav0: '0 捆小棒', nav1: '1 计数器', nav2: '2 满十进一', nav3: '3 同一个数字', nav4: '4 0 占位', nav5: '5 比大小', nav6: '6 乘 10', nav7: '7 收束',

    s0k: '第 0 步 · 捆小棒',
    s0t: '247 根小棒，怎样摆才能一眼数清？',
    s0e: '这一步要回答：东西很多时，怎样不必一根一根数就知道有多少？办法是<strong>十个换一个</strong>：每 10 根小棒捆成一<strong>小捆</strong>（一小捆 = 10 根），每 10 小捆再扎成一<strong>大捆</strong>（一大捆 = 10 小捆 = 100 根）。捆好以后，大捆、小捆、单根各剩几个，就是写数时的三个数字。',
    c0a: '小棒分成大捆、小捆和单根三堆',
    lgStick: '单根小棒', lgTen: '小捆：10 根（青色绳）', lgHundred: '大捆：100 根（橙色绳）',
    n0: '小棒根数', tie10: '每 10 根捆一小捆', tie100: '每 10 小捆扎一大捆', untie: '全部拆散',
    zoneH: '大捆 {n}', zoneT: '小捆 {n}', zoneO: '单根 {n}',
    s0tying10: '正在捆：已捆好 {k}/{total} 小捆。',
    s0tying100: '正在扎：已扎好 {k}/{total} 大捆。',
    s0loose: '{N} 根小棒全部散着：要一根一根数 {N} 下才知道有多少。',
    s0tens: '{t} 小捆 + {o} 根 = {t} × 10 + {o} = {N} 根。小捆够 10 个了吗？够了就还能再扎成大捆。',
    s0all: '{h} 大捆、{t} 小捆、{o} 根：{h} × 100 + {t} × 10 + {o} = {N}。写成 {N}，正好是这三个数字按「大捆、小捆、单根」的顺序排好。',
    s0hint: '观察顺序：先按「全部拆散」，看 247 根散在一起有多乱；再按「每 10 根捆一小捆」，看单根一捆一捆变少，读数里小捆数涨到 24；最后按「每 10 小捆扎一大捆」，小捆又变成大捆。拖滑杆换根数：捆好后单根永远不到 10 根，小捆也不到 10 捆。',

    s1k: '第 1 步 · 计数器',
    s1t: '计数器上同样一颗珠子，为什么有的算 1、有的算 100？',
    s1e: '这一步要回答：怎样把捆好的小棒记下来，又怎样把记录读成数？<strong>计数器</strong>有几根竖杆，从右往左依次是<strong>个位、十位、百位、千位</strong>。个位杆上一颗珠子代表 1 根，十位杆上一颗代表一小捆（10），百位杆上一颗代表一大捆（100），千位一颗代表 1000。一颗珠子代表多少，只看它在哪根杆上，这叫<strong>位值</strong>。每根杆最多拨 9 颗，因为满 10 颗就该换到左边一根杆上（下一步）。',
    c1a: '四位计数器：千位、百位、十位、个位',
    pTh: '千位', pH: '百位', pT: '十位', pO: '个位', pTTh: '万位',
    each: '每颗 {v}',
    s1empty: '四根杆上都没有珠子：这个数是 0。',
    s1readout: '读作：{sum} = {n}。{zero}',
    s1zero: '{p}没有珠子，写数时那一位要写 0。',
    listSep: '、',
    s1hint: '观察顺序：先只拖「十位」，看杆上青色数字和读数一起变，每多一颗读数多 10；再只拖「个位」，每颗只多 1。把十位拖到 0、百位留着珠子，看读数里提醒「十位要写 0」。最左边没有珠子的位不写（显示成暗色的 0）。',

    s2k: '第 2 步 · 满十进一',
    s2t: '个位已经有 9 颗珠子，再加 1 会怎样？',
    s2e: '这一步要回答：一根杆上珠子满 10 颗以后怎么办？规则是<strong>满十进一</strong>：某一位凑满 10 颗，就把这 10 颗全部拨走，换成左边一位的 1 颗——就像 10 根小棒捆成 1 小捆。这一次「换到左边」叫<strong>进位</strong>。如果左边那一位也因此满 10，就接着再进一位，比如 99 + 1、999 + 1。',
    c2a: '计数器一次加 1，满十的那根杆会清空',
    lgBead: '珠子', lgCarry: '刚刚进位的杆和换来的那颗珠子',
    start2: '起点', plus2: '加 1', run2: '连加 10 下', reset2: '回到起点',
    s2start: '从 {n} 开始。每按一次「加 1」，个位多一颗珠子。',
    s2readout: '已加 {k} 次，现在是 {n}；其中 {c} 次发生了进位（下面橙色的数）。',
    s2carry: '刚才{p}满十：这一列清空，换成{q}的 1 颗（橙色）。',
    s2over: '9999 再加 1 要用到第五根杆（万位），这个计数器只有四根杆，放不下。',
    s2hint: '观察顺序：起点 95，连按「加 1」或按「连加 10 下」：前四下只有个位涨，到 100 时个位和十位同时清空、百位多 1 颗（两次进位接连发生）。下面的数字条记下每一步，橙色的是发生进位的那一步。再把起点拖到 995 试试。',

    s3k: '第 3 步 · 同一个数字',
    s3t: '333 里的三个 3，一样大吗？',
    s3e: '这一步要回答：同一个数字写在不同位置，代表的大小差多少？用方块来看：个位的 1 是一个<strong>小方块</strong>，十位的 1 是 10 个小方块连成的<strong>长条</strong>，百位的 1 是 10 根长条拼成的<strong>方板</strong>（100 个小方块）。所以同一个数字，每往左挪一位，代表的数就变成原来的 <strong>10 倍</strong>。',
    c3a: '同一个数字在百位、十位、个位分别用方板、长条、小方块表示',
    lgFlat: '方板 = 100', lgRod: '长条 = 10', lgCube: '小方块 = 1',
    d3: '数字',
    c3title: '{n}：同一个数字站在三个位置',
    s3readout: '{n} = {h} + {t} + {o} = {v}。百位的 {d} 是 {h}，是十位那个 {d}（{t}）的 10 倍，是个位那个 {d}（{o}）的 100 倍。',
    s3hint: '观察顺序：拖「数字」，三堆方块的个数一起变，但每堆里一块的大小不变：方板一直是长条的 10 倍、长条一直是小方块的 10 倍。看下面三个等号后的数，相邻两个总是差 10 倍。',

    s4k: '第 4 步 · 0 占位',
    s4t: '305 里的 0 什么也不代表，能不能省掉？',
    s4e: '这一步要回答：某一位一个也没有时，为什么还要写 0？305 是 3 个百、0 个十、5 个一。十位虽然一个十也没有，但如果不写 0，3 就会从百位挤到十位，变成 35。0 在这里的作用叫<strong>占位</strong>：它把位置空着、占住，别的数字才能待在自己的位上。',
    c4a: '方块与两种写法：写了 0 和漏写 0',
    lgMoved: '漏写 0 后被挤错位置的数字',
    drop4: '漏写 0 会怎样？',
    none: '没有',
    rowWrite: '写对', rowDrop: '漏写 0',
    s4keep: '方块是 {n}：十位一个十也没有，写 0 占住十位，{h} 才能留在百位。按「漏写 0 会怎样？」看看。',
    s4drop: '漏写 0 只剩「{h}」「{o}」两个数字，读作 {w}：{h} 被挤到了十位，只算 {h} 个十。方块明明是 {n}，写出来却少了 {d}。',
    s4noZero: '{n} 的十位是 {t}，没有空位，不需要 0 占位。把十位拖到 0 再按「漏写 0 会怎样？」。',
    s4hint: '观察顺序：保持十位为 0，按「漏写 0 会怎样？」：粉色的 3 从百位一格滑到十位，读数给出少了多少；再按一次恢复。把个位也拖到 0（比如 300），漏写会少得更多。十位不是 0 时，这个按钮会变灰。',

    s5k: '第 5 步 · 比大小',
    s5t: '358 和 385，用同样三个数字，谁大？',
    s5e: '这一步要回答：两个数比大小，先比哪一位？先把两个数<strong>按位对齐</strong>（个位对个位），位数少的数前面空着的位当作 0。然后<strong>从最高位开始比</strong>，相同就往右看下一位，找到<strong>第一个不同的数位</strong>，哪个数在这一位上大，哪个数就大。为什么后面的位不用再看？因为后面各位合起来最多只能凑出 99（或 9），追不上前面那一位的 1 个单位。',
    c5a: '两个数按位对齐，标出第一个不同的数位',
    lgSame: '相同的位', lgFirst: '第一个不同的位（决定大小）', lgSkip: '不必再比的位',
    s5equal: '每一位都相同：A = B = {a}。',
    s5readout: '从百位开始比，第一个不同的是{p}：{x} 和 {y}，所以 A {sym} B。{p}后面的各位合起来最多是 {m}，还不到 1 个{p}单位（{u}），所以不用再看。',
    s5ones: '百位、十位都相同，一直比到个位：{x} 和 {y}，所以 A {sym} B。',
    s5hint: '观察顺序：先看默认的 358 和 385：百位都是 3（灰色），十位 5 和 8 不同（橙色），个位虚线框不用再比。再把 A 拖到 400 左右：百位就分出大小。最后把 B 拖到 99 以下，看它百位前面补的暗色 0。',

    s6k: '第 6 步 · 乘 10',
    s6t: '47 乘 10 为什么就是在后面添一个 0？',
    s6e: '这一步要回答：一个数乘 10，数字们发生了什么？乘 10 就是<strong>每一份都变成原来的 10 倍</strong>：每个单根变成一小捆，每个小捆变成一大捆。按第 3 步，每个数字<strong>往左挪一位</strong>就正好是 10 倍；挪走以后个位空了，要写 0 占位（第 4 步）。乘 100 就是挪两位、补两个 0。',
    c6a: 'N、N × 10、N × 100 的数字按位对齐',
    lgDigit: 'N 原有的数字', lgFill: '空出来补上的 0',
    n6: '数 N', shift6: '演示数字往左挪',
    s6readout: '{n} × 10 = {a}，{n} × 100 = {b}。每个数字都往左挪了一位或两位，个位空出来补 0。',
    s6hint: '观察顺序：按「演示数字往左挪」，看 N 的每个数字一起滑到左边一格（第二行），再滑一格（第三行），空出来的位置出现橙色的 0。拖 N 换别的数（比如 305），规则一样：中间原有的 0 也跟着挪。',

    s7k: '第 7 步 · 收束', s7t: '数字站在哪一位，就数的是多大的一份',
    s7fin: '回顾：<strong>第 0 步</strong>，十根捆一小捆、十小捆扎一大捆，大捆、小捆、单根的个数就是三个数字。<strong>第 1 步</strong>，计数器上一颗珠子代表多少，只看它在哪一位。<strong>第 2 步</strong>，满十进一。<strong>第 3 步</strong>，同一个数字每往左一位大 10 倍。<strong>第 4 步</strong>，空着的位要写 0 占位。<strong>第 5 步</strong>，比大小先对齐，从最高位找第一个不同的数位。<strong>第 6 步</strong>，乘 10 就是每个数字往左挪一位、个位补 0。',
    formula: '247 = 2 × 100 + 4 × 10 + 7 × 1\n满十进一：10 个一 = 1 个十，10 个十 = 1 个百\n× 10：每个数字左移一位，个位补 0',
    boundary: '适用范围：本页只讲整数和十进制（每满 10 进一）。计数器只有四位，最大 9999。别的进制（比如时间里 60 秒进 1 分）规则一样，只是「满几进一」不同。',
    linksTitle: '接着去看',
    lk1: '→ 面积模型第 2 步：13 × 7 拆成 10 × 7 和 3 × 7——按位拆开再相加',
    lk2: '→ 面积模型第 3 步：两位数乘两位数，按十位和个位切成四块',
    lk3: '→ 指数与对数第 0 步：一次次乘同一个数会怎样（10、100、1000 就是一次次乘 10）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《位值与计数器 · 满十进一》的平行版本。'
  },
  en: {
    pageTitle: 'Place Value · Bundle Ten into One',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Place Value & the Counting Frame · Ten Makes One →',
    navLabel: 'Place value steps',
    tagline: 'Counting a big pile of sticks one at a time is slow. Tie every ten into a bundle and every ten bundles into a big bundle, and you can see the total at a glance. When we write a number, the place each digit stands in says whether it counts single sticks, bundles or big bundles. This page goes from bundling sticks to the counting frame, zero as a placeholder, comparing numbers and multiplying by 10.',
    nav0: '0 Bundles', nav1: '1 Counting frame', nav2: '2 Ten makes one', nav3: '3 Same digit', nav4: '4 Zero holds a place', nav5: '5 Comparing', nav6: '6 Times 10', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Bundling sticks',
    s0t: 'How should 247 sticks be arranged so you can count them at a glance?',
    s0e: 'This step asks: when there are lots of things, how can we know how many without counting one by one? The trick is <strong>trade ten for one</strong>: tie every 10 sticks into a <strong>bundle</strong> (one bundle = 10 sticks), and every 10 bundles into a <strong>big bundle</strong> (one big bundle = 10 bundles = 100 sticks). After tying, the numbers of big bundles, bundles and loose sticks left over are exactly the three digits we write.',
    c0a: 'Sticks sorted into big bundles, bundles and single sticks',
    lgStick: 'single stick', lgTen: 'bundle: 10 sticks (cyan tie)', lgHundred: 'big bundle: 100 sticks (orange ties)',
    n0: 'Number of sticks', tie10: 'Tie every 10 sticks', tie100: 'Tie every 10 bundles', untie: 'Untie everything',
    zoneH: '100s: {n}', zoneT: '10s: {n}', zoneO: '1s: {n}',
    s0tying10: 'Tying: {k}/{total} bundles done.',
    s0tying100: 'Tying: {k}/{total} big bundles done.',
    s0loose: 'All {N} sticks are loose: you would have to count {N} times to know how many there are.',
    s0tens: '{t} bundles + {o} sticks = {t} × 10 + {o} = {N}. Are there 10 or more bundles? Then they can be tied again into big bundles.',
    s0all: '{h} big bundles, {t} bundles, {o} sticks: {h} × 100 + {t} × 10 + {o} = {N}. Written as {N}: the same three digits, in the order big bundles, bundles, sticks.',
    s0hint: 'What to try: press “Untie everything” and see how messy 247 loose sticks are. Press “Tie every 10 sticks” and watch the loose sticks disappear ten at a time while the bundle count climbs to 24. Then press “Tie every 10 bundles”. Drag the slider to change the number: once everything is tied, there are always fewer than 10 loose sticks and fewer than 10 bundles.',

    s1k: 'Step 1 · The counting frame',
    s1t: 'Why is one bead worth 1 on one rod and 100 on another?',
    s1e: 'This step asks: how do we record the bundles, and how do we read the record back as a number? A <strong>counting frame</strong> has upright rods; from right to left they are the <strong>ones, tens, hundreds and thousands</strong>. A bead on the ones rod stands for 1 stick, a bead on the tens rod for a bundle (10), a bead on the hundreds rod for a big bundle (100), and a bead on the thousands rod for 1000. What a bead is worth depends only on which rod it sits on; that is <strong>place value</strong>. A rod holds at most 9 beads, because 10 beads get traded for one bead on the next rod (next step).',
    c1a: 'A four-rod counting frame: thousands, hundreds, tens, ones',
    pTh: 'thousands', pH: 'hundreds', pT: 'tens', pO: 'ones', pTTh: 'ten thousands',
    each: '{v} each',
    s1empty: 'No beads on any rod: the number is 0.',
    s1readout: 'Read it as {sum} = {n}. {zero}',
    s1zero: 'No beads on {p}: write a 0 in that place.',
    listSep: ', ',
    s1hint: 'What to try: drag only “tens” and watch the cyan digit and the readout change together, 10 more for each bead. Then drag only “ones”: just 1 more per bead. Set tens to 0 while hundreds still has beads, and the readout reminds you to write a 0 for the tens. Places on the far left with no beads are not written (shown as a dim 0).',

    s2k: 'Step 2 · Ten makes one',
    s2t: 'The ones rod already has 9 beads. What happens when you add one more?',
    s2e: 'This step asks: what do we do when a rod reaches 10 beads? The rule is <strong>ten makes one</strong>: as soon as a place collects 10 beads, all 10 are cleared and swapped for 1 bead on the next rod to the left, just as 10 sticks become 1 bundle. That swap is called <strong>carrying</strong>. If the rod on the left then reaches 10 as well, it carries again, as in 99 + 1 or 999 + 1.',
    c2a: 'The frame counting up by one; a rod that reaches ten is cleared',
    lgBead: 'bead', lgCarry: 'rod that just carried, and the bead it bought',
    start2: 'Start at', plus2: 'Add 1', run2: 'Add 1 ten times', reset2: 'Back to the start',
    s2start: 'Starting at {n}. Each press of “Add 1” puts one more bead on the ones rod.',
    s2readout: 'Added {k} times, now at {n}; {c} of those steps carried (orange numbers below).',
    s2carry: 'Just now {p} reached ten: cleared, and swapped for 1 bead on {q} (orange).',
    s2over: '9999 + 1 needs a fifth rod (ten thousands), and this frame only has four.',
    s2hint: 'What to try: start at 95 and press “Add 1” a few times or “Add 1 ten times”. For four steps only the ones change; at 100 the ones and the tens clear together and hundreds gains a bead (two carries in a row). The strip below records every step, with the carrying steps in orange. Then drag the start to 995.',

    s3k: 'Step 3 · The same digit',
    s3t: 'Are the three 3s in 333 worth the same?',
    s3e: 'This step asks: how much does the same digit change when it moves to another place? Look at blocks. A 1 in the ones is a small <strong>cube</strong>; a 1 in the tens is a <strong>rod</strong> of 10 cubes; a 1 in the hundreds is a <strong>flat</strong> made of 10 rods (100 cubes). So each step to the left makes the same digit worth <strong>10 times as much</strong>.',
    c3a: 'The same digit as flats, rods and cubes in the hundreds, tens and ones',
    lgFlat: 'flat = 100', lgRod: 'rod = 10', lgCube: 'cube = 1',
    d3: 'Digit',
    c3title: '{n}: one digit in three places',
    s3readout: '{n} = {h} + {t} + {o} = {v}. The {d} in the hundreds is worth {h}: 10 times the {d} in the tens ({t}) and 100 times the {d} in the ones ({o}).',
    s3hint: 'What to try: drag the digit. The number of pieces in each pile changes together, but the size of one piece never does: a flat is always 10 rods, a rod always 10 cubes. Compare the three totals at the bottom: neighbours always differ by a factor of 10.',

    s4k: 'Step 4 · Zero holds a place',
    s4t: 'The 0 in 305 stands for nothing. Can we leave it out?',
    s4e: 'This step asks: when a place has nothing in it, why do we still write 0? 305 is 3 hundreds, 0 tens and 5 ones. There are no tens, but without the 0 the 3 slides from the hundreds into the tens and the number becomes 35. Here the 0 works as a <strong>placeholder</strong>: it keeps the empty place occupied so the other digits stay where they belong.',
    c4a: 'The blocks and two ways of writing them: with the 0 and without',
    lgMoved: 'digits that slid into the wrong place',
    drop4: 'What if we leave out the 0?',
    none: 'none',
    rowWrite: 'right', rowDrop: 'no 0',
    s4keep: 'The blocks make {n}. There are no tens, so a 0 holds the tens place and the {h} stays in the hundreds. Press “What if we leave out the 0?” to see.',
    s4drop: 'Without the 0, only “{h}” and “{o}” are left, which reads as {w}: the {h} slid into the tens and now counts only {h} tens. The blocks still make {n}, but what is written is {d} less.',
    s4noZero: '{n} has {t} in the tens, so no place is empty and nothing needs holding. Set the tens to 0, then press “What if we leave out the 0?”.',
    s4hint: 'What to try: keep the tens at 0 and press “What if we leave out the 0?”. The pink 3 slides from the hundreds into the tens and the readout says how much is lost; press again to undo. Set the ones to 0 too (say 300) and the loss is bigger. When the tens are not 0 the button is greyed out.',

    s5k: 'Step 5 · Comparing numbers',
    s5t: '358 and 385 use the same three digits. Which is bigger?',
    s5e: 'This step asks: when comparing two numbers, which place do we look at first? First <strong>line the numbers up by place</strong> (ones under ones); a number with fewer digits has 0 in the empty places in front. Then <strong>start from the highest place</strong>: if the digits match, move one place right, until you reach the <strong>first place where they differ</strong>. Whichever number has the bigger digit there is the bigger number. Why ignore the places after it? Because all the places to the right together make at most 99 (or 9), which never catches up with a single unit of the place in front.',
    c5a: 'Two numbers lined up by place, with the first different place marked',
    lgSame: 'matching places', lgFirst: 'first different place (decides)', lgSkip: 'places that no longer matter',
    s5equal: 'Every place matches: A = B = {a}.',
    s5readout: 'Starting from the hundreds, the first difference is in the {p}: {x} against {y}, so A {sym} B. Everything after the {p} adds up to at most {m}, less than one unit of the {p} ({u}), so there is no need to look further.',
    s5ones: 'Hundreds and tens both match, so it comes down to the ones: {x} against {y}, so A {sym} B.',
    s5hint: 'What to try: look at the default 358 and 385. The hundreds are both 3 (grey), the tens 5 and 8 differ (orange), and the dashed ones no longer matter. Drag A to around 400: now the hundreds decide. Finally drag B below 99 and notice the dim 0 filling its hundreds place.',

    s6k: 'Step 6 · Times 10',
    s6t: 'Why does 47 × 10 just add a 0 on the end?',
    s6e: 'This step asks: what happens to the digits when a number is multiplied by 10? Times 10 means <strong>every piece becomes 10 times as big</strong>: each single stick becomes a bundle and each bundle a big bundle. From step 3, <strong>moving each digit one place left</strong> is exactly 10 times as much; that leaves the ones place empty, so it gets a 0 as a placeholder (step 4). Times 100 is two places left and two 0s.',
    c6a: 'N, N × 10 and N × 100 lined up by place',
    lgDigit: 'the digits of N', lgFill: 'the 0s that fill the empty places',
    n6: 'Number N', shift6: 'Show the digits moving left',
    s6readout: '{n} × 10 = {a} and {n} × 100 = {b}. Every digit moved one or two places left, and the empty ones place was filled with 0.',
    s6hint: 'What to try: press “Show the digits moving left” and watch all of N’s digits slide one place left together (second row), then one more (third row), with orange 0s appearing in the gaps. Drag N to another number, say 305: same rule, and the 0 already inside moves along with the rest.',

    s7k: 'Step 7 · Wrap-up', s7t: 'Where a digit stands tells you what size of piece it counts',
    s7fin: 'Looking back. <strong>Step 0</strong>: ten sticks make a bundle, ten bundles a big bundle, and the counts of each are the three digits. <strong>Step 1</strong>: what a bead on the frame is worth depends only on its place. <strong>Step 2</strong>: ten makes one. <strong>Step 3</strong>: the same digit is worth 10 times as much one place further left. <strong>Step 4</strong>: an empty place still needs a 0. <strong>Step 5</strong>: to compare, line up the places and find the first difference from the top. <strong>Step 6</strong>: times 10 moves every digit one place left and fills the ones with 0.',
    formula: '247 = 2 × 100 + 4 × 10 + 7 × 1\nten makes one: 10 ones = 1 ten, 10 tens = 1 hundred\n× 10: every digit moves one place left, ones filled with 0',
    boundary: 'Scope: this page covers whole numbers in base ten (trade every 10 for one). The frame has four rods, so it stops at 9999. Other bases work the same way with a different trade, such as 60 seconds making a minute.',
    linksTitle: 'Where to go next',
    lk1: '→ Area model, step 2: split 13 × 7 into 10 × 7 and 3 × 7, place by place',
    lk2: '→ Area model, step 3: two digits × two digits, cut into four pieces by tens and ones',
    lk3: '→ Exponents & logarithms, step 0: multiplying by the same number again and again (10, 100, 1000 are repeated × 10)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Place Value & the Counting Frame · Ten Makes One”.'
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
  if (typeof window.refreshPlaceValue === 'function') window.refreshPlaceValue();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PV_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
