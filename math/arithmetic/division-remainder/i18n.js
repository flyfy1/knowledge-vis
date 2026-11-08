'use strict';
/* ============================================================
   除法与余数 · 分公平，剩下的叫余数 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '除法与余数 · 分公平，剩下的叫余数 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '除法与余数 · 分公平，剩下的叫余数',
    tagline: '乘法是把东西合起来数，除法是把东西分开来数。分得完是运气，分不完才是常态——剩下的那一点点有个名字，叫余数。这一页从头发糖果开始：商、余数、被除数、除数全在盘子里看得见，最后收成一本谁都能自己验的账：被除数 = 除数 × 商 + 余数。',
    nav0: '0 分糖果', nav1: '1 余数要比除数小', nav2: '2 数轴跳格',
    nav3: '3 星期推算', nav4: '4 自测 · 验算账本',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 除法与余数 Division & Remainders —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '分糖果：分不完的那一颗',
    s0e: '这一步要回答：<strong>一堆东西平均分，分不完怎么办？</strong>先把四个名字在糖果里认清：要分的总数叫<strong>被除数</strong>，分给几个人叫<strong>除数</strong>，每人分到的颗数叫<strong>商</strong>，最后剩下的叫<strong>余数</strong>。下面有 17 颗糖、4 个小朋友，一颗一颗轮流发——你来当发糖的人，发到发不下去为止。',
    s0totalLab: '糖的总数（被除数）', s0peopleLab: '分给几个人（除数）',
    s0deal1: '发一颗', s0play: '连播分发', s0pause: '暂停', s0reset: '重新分',
    s0roIdle: '托盘里有 <b>{n}</b> 颗糖，要分给 <b>{p}</b> 个人。点「发一颗」一颗颗发，或点「连播分发」看它自己分完。',
    s0roMid: '正在分：已经发出 <b>{k}</b> 颗，托盘里还躺着 <b>{left}</b> 颗。看每个盘子里的糖——轮流发，所以每人的颗数最多只差 1。',
    s0roDone: '<b>{n} ÷ {p} = {q} …… {r}</b>：每人 <b>{q}</b> 颗（商），剩 <b>{r}</b> 颗（余数）。剩下的再发给谁，都会有人比别人多一颗——不公平，所以停在这里。',
    s0roExact: '<b>{n} ÷ {p} = {q}</b>：正好分完，一颗不剩——这时余数是 <b>0</b>。',
    s0prog: '进度：已发 {k} / {n} 颗。',
    s0hint: '先记住分工：<strong>商回答「每人几颗」，余数回答「还剩几颗」</strong>。还有一件怪事：不管总数怎么改，余数总是比人数小。把滑杆顶到 30 颗、2 个人试试——余数最多也只有 1。这不是巧合，下一步专门看它。',
    cTray: '托盘（还没分的糖）', cKid: '小朋友 {i}', cEach: '每人 {k} 颗',
    cRemain: '剩下 {r} 颗 · 这就是余数', cExact: '正好分完 · 余数 0',

    s1k: '第 1 步 · 分完的判据',
    s1t: '余数为什么必须比除数小',
    s1e: '这一步要回答：<strong>分到什么程度，才算「分完了」？</strong>先看一个偷懒的分法：17 颗糖分给 3 个人，每人才分 4 颗就收手，托盘里还剩 5 颗。剩 5 颗算分完吗？拖动「每人先分几颗」（这个数就是<strong>商</strong>），让余数自己说话：只要剩下的还够给每人再发 1 颗，就不算分完。',
    s1totalLab: '糖的总数（被除数）', s1divLab: '分给几个人（除数）', s1perLab: '每人先分几颗（商）',
    s1fix: '一键补分到分完',
    s1roMore: '账本：<b>{n} = {d} × {per} + {r}</b>。余数 <b>{r}</b> 比除数 <b>{d}</b> 还大——托盘里还够给每人再发 1 颗，<b>还没分完！</b>把商往上拖，或点「一键补分」。',
    s1roEqual: '账本：<b>{n} = {d} × {per} + {r}</b>。余数 <b>{r}</b> 正好等于除数 <b>{d}</b>——没有比除数小，托盘里还够给每人再发 1 颗，<b>还没分完！</b>把商往上拖，或点「一键补分」。',
    s1roDone: '账本：<b>{n} = {d} × {q} + {r}</b>。余数 <b>{r}</b> &lt; 除数 <b>{d}</b>：剩下的不够每人再发 1 颗了，这才叫分完。',
    s1roExact: '账本：<b>{n} = {d} × {q} + 0</b>。正好分完，余数是 0——0 当然也小于除数。',
    s1hint: '所以「余数 &lt; 除数」不是老师定的规矩，而是<strong>「分完了」的判据</strong>：余数一旦大于或等于除数，就说明还能再分一轮，商就该再加 1。验算任何除法，先看这一条。',
    cTrayR: '托盘里还剩 {r} 颗（余数）', cGhost: '还能再给每人发 1 颗！', cDone: '分完了 ✓ 余数 < 除数',

    s2k: '第 2 步 · 换一个看法',
    s2t: '除法是数轴上的跳格',
    s2e: '这一步要回答：<strong>换个问法——总数里一共装着几个除数？</strong>还是第 0 步的那组数：从 0 出发，每一格跳一个除数那么远，跳满一格算装下一个。跳到再跳就会越过总数为止，看最后停在哪、还差多少。',
    s2totalLab: '总数（被除数）', s2divLab: '每格跳多远（除数）',
    s2shareNote: '这一步的两个滑杆——「总数（被除数）」和「每格跳多远（除数）」——和第 0 步是同一组数：改这里，第 0 步的分糖果也跟着变——两边永远在算同一道题。',
    s2jump: '跳一格', s2play: '连播', s2pause: '暂停', s2reset: '重来',
    s2roIdle: '从 0 开始，每格跳 <b>{d}</b> 远。看 <b>{n}</b> 里面能跳满几格。点「跳一格」或「连播」。',
    s2roMid: '已跳 <b>{k}</b> 格，落在 <b>{pos}</b>；目标是 <b>{n}</b>，还能再跳。',
    s2roDone: '<b>{n} = {d} × {q} + {r}</b>：跳满 <b>{q}</b> 格停在 {qd}，还剩 <b>{r}</b>——不够再跳一整格（还差 {need}）。商还是 {q}，余数还是 {r}，和第 0 步分糖果一模一样。',
    s2roExact: '<b>{n} = {d} × {q}</b>：跳满 <b>{q}</b> 格正好落在 {n}，余数 0。',
    s2hint: '同一个除法，两种问法：分糖果问「每人几颗」，跳格问「总数里有几个除数」——答案的商和余数完全相同。跳格还是乘法的逆运算：跳 {q} 格 × 每格 {d} = {qd}，正是把行列合成总数那件事倒着走。乘法怎么「合」，去 <a class="fourier-link" href="../area-model/#step1">乘法是面积 · 第 1 步（点阵变地砖）</a> 看。',
    cTarget: '目标 {n}', cRemain2: '剩 {r}，不够一格',

    s3k: '第 3 步 · 余数有用',
    s3t: '100 天后是星期几？',
    s3e: '这一步要回答：<strong>余数能拿来干什么正事？</strong>今天星期二。往后数 100 天是星期几——一天天数太累，但星期是 7 天一循环：每过整整 7 天，星期几原地不变。所以只需把 100 拆成「几个整周 + 余数几天」，<strong>只有余数决定答案往后挪几格</strong>。拖动滑杆换天数，看落点怎么跳。',
    s3daysLab: '往后数几天', s3quickLab: '试几个：',
    s3ro: '<b>{n} 天 = 7 × {w} + {r}</b>：{w} 个整周过去，星期纹丝不动；再往后数 {r} 天，从星期二挪到 <b>{ans}</b>。决定答案的只有余数 {r}。',
    s3ro0: '<b>{n} 天 = 7 × {w} + 0</b>：正好 {w} 个整周，余数 0——还是<b>星期二</b>。',
    s3hint: '凡是「转圈」的问题都只看余数：星期（7 一圈）、钟表（12 一圈）、轮班、座位绕圈……先除以圈长，商是转了几圈，<strong>余数才是落点</strong>。',
    cToday: '今天', cMidWeeks: '中间 {m} 周：每周都是整 7 天，落点回到同一列',
    wShort: '日,一,二,三,四,五,六',
    wFull: '星期日,星期一,星期二,星期三,星期四,星期五,星期六',

    s4k: '第 4 步 · 自测',
    s4t: '自测：分物与验算账本',
    s4e: '最后自己上手。两道题共用同一本账：<strong>被除数 = 除数 × 商 + 余数，并且余数 &lt; 除数</strong>。每道题都要答对才会揭晓解析；答错了，账本会指出错在哪一条。上面那块板就是账本本身——答对一题，它就填满一题。',
    s4q1: '① 23 本书，平均分给 5 个小朋友。每人分几本？还剩几本？',
    s4q1a: '每人 4 本，剩 3 本', s4q1b: '每人 5 本，剩 2 本', s4q1c: '每人 3 本，剩 8 本',
    s4q1ok: '答对了！账本：<b>23 = 5 × 4 + 3</b>，余数 3 &lt; 人数 5——分完了，这就是答案。',
    s4q1fbB: '不对，用账本查：5 人 × 每人 5 本 = 25 本，可是书一共只有 23 本——<b>除数 × 商不能超过被除数</b>。这个选项直接不够分。',
    s4q1fbC: '不对，用判据查：剩 8 本比人数 5 还多，还够给每人再发 1 本——<b>没分完，余数必须小于除数</b>。',
    s4q2: '② 验算题：☆ ÷ 6 = 7 …… 4。被除数 ☆ 是多少？',
    s4q2ok: '答对了！<b>被除数 = 除数 × 商 + 余数 = 6 × 7 + 4 = 46</b>。验算题不用猜，把账本倒着算一遍就行。',
    s4q2fbA: '42 = 6 × 7，只算了「整除的那部分」——别忘了账本最后还有 <b>+ 余数 4</b>。',
    s4q2fbC: '52 对不上账本：6 × 7 + 4 = <b>46</b>。把候选答案代回 被除数 = 除数 × 商 + 余数 验一遍，错的立刻露馅。',
    s4allDone: '两题都答对了——你已经能拿着账本自己验算任何一道除法题了。',
    cLedger1: '题 ① 的账本', cLedger2: '题 ② 的账本',
    cDividend: '被除数', cDivisor: '除数', cQuotient: '商', cRemainder: '余数',
    s4fin: '这一页从头到尾只有一本账：<strong>被除数 = 除数 × 商 + 余数，余数 &lt; 除数</strong>。分糖果、数轴跳格、推算星期，全是这本账的不同讲法；拿到任何一道除法，先写账，再验账，就不会被余数骗了。',
    lkArea: '← 回上一站：乘法是把行列「合」成总数（乘法是面积 · 第 1 步）——除法正是把它拆开',
    lkFrac: '分不完的那 1 颗还有下文：把它切开来分，就是分数——17 ÷ 4 = 4¼（分数 · 第 5 步）→'
  },
  en: {
    docTitle: 'Division & Remainders · Share Fairly, Name What Is Left — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Division & Remainders · Share Fairly, Name What Is Left',
    tagline: 'Multiplication gathers things up to count them; division shares them out. Dividing evenly is luck — having something left over is the norm, and that leftover has a name: the remainder. This page starts by dealing out candies, so quotient, remainder, dividend and divisor are all visible in the trays, and ends with one ledger anyone can check: dividend = divisor × quotient + remainder.',
    nav0: '0 Dealing Candies', nav1: '1 Remainder < Divisor', nav2: '2 Jumps on a Number Line',
    nav3: '3 What Weekday?', nav4: '4 Quiz · The Ledger',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Division & Remainders —— one interaction at a time',

    s0k: 'Step 0 · The Hook',
    s0t: 'Dealing Candies: The One That Will Not Divide',
    s0e: 'The question for this step: <strong>when sharing things out evenly, what do we do when they do not divide?</strong> First, meet the four names inside the candy story: the total to be shared is the <strong>dividend</strong>, the number of children is the <strong>divisor</strong>, how many each child gets is the <strong>quotient</strong>, and what is left at the end is the <strong>remainder</strong>. Below are 17 candies and 4 children; the candies are dealt one by one, in turns — you are the dealer, so deal until you cannot deal fairly any more.',
    s0totalLab: 'Total candies (dividend)', s0peopleLab: 'Share among how many children (divisor)',
    s0deal1: 'Deal one', s0play: 'Auto-deal', s0pause: 'Pause', s0reset: 'Start over',
    s0roIdle: 'There are <b>{n}</b> candies in the tray, to share among <b>{p}</b> children. Press “Deal one” to deal them singly, or “Auto-deal” to watch it finish the job.',
    s0roMid: 'Dealing: <b>{k}</b> candies dealt, <b>{left}</b> still in the tray. Look at the plates — dealing in turns means nobody is ever more than 1 candy ahead of anyone else.',
    s0roDone: '<b>{n} ÷ {p} = {q} … {r}</b>: each child gets <b>{q}</b> (the quotient), and <b>{r}</b> is left (the remainder). Dealing one more to anyone would give them one more than the others — unfair — so we stop here.',
    s0roExact: '<b>{n} ÷ {p} = {q}</b>: shared out exactly, nothing left — the remainder is <b>0</b>.',
    s0prog: 'Progress: {k} / {n} candies dealt.',
    s0hint: 'Keep the two jobs separate: <strong>the quotient answers “how many each”, the remainder answers “how many are left”</strong>. And notice something odd: whatever total you pick, the remainder is always smaller than the number of children. Push the sliders to 30 candies and 2 children — the remainder is still at most 1. Not a coincidence; the next step is all about it.',
    cTray: 'Tray (candies not yet dealt)', cKid: 'Child {i}', cEach: '{k} each',
    cRemain: '{r} left · that is the remainder', cExact: 'Shared exactly · remainder 0',

    s1k: 'Step 1 · The Test for “Done”',
    s1t: 'Why the Remainder Must Be Smaller Than the Divisor',
    s1e: 'The question for this step: <strong>how far must the sharing go before it counts as “done”?</strong> Start with a lazy deal: 17 candies among 3 children, stopping at only 4 each, with 5 still in the tray. Is that “done”? Drag the “each child first gets” slider (that number is the <strong>quotient</strong>) and let the remainder speak: as long as what is left could still give everyone 1 more, the sharing is not finished.',
    s1totalLab: 'Total candies (dividend)', s1divLab: 'Share among how many children (divisor)', s1perLab: 'Each child first gets (quotient)',
    s1fix: 'Top up until done',
    s1roMore: 'The ledger: <b>{n} = {d} × {per} + {r}</b>. The remainder <b>{r}</b> is bigger than the divisor <b>{d}</b> — the tray still holds enough to give everyone 1 more. <b>Not done yet!</b> Drag the quotient up, or press “Top up until done”.',
    s1roEqual: 'The ledger: <b>{n} = {d} × {per} + {r}</b>. The remainder <b>{r}</b> is exactly equal to the divisor <b>{d}</b> — it is not smaller than the divisor, and the tray still holds enough to give everyone 1 more. <b>Not done yet!</b> Drag the quotient up, or press “Top up until done”.',
    s1roDone: 'The ledger: <b>{n} = {d} × {q} + {r}</b>. The remainder <b>{r}</b> &lt; the divisor <b>{d}</b>: what is left cannot give everyone another one — now it is truly done.',
    s1roExact: 'The ledger: <b>{n} = {d} × {q} + 0</b>. Shared out exactly, remainder 0 — and 0 is of course smaller than the divisor too.',
    s1hint: 'So “remainder &lt; divisor” is not a rule teachers invented — it is the <strong>test for being done</strong>: the moment the remainder reaches the divisor, one more round is possible and the quotient should go up by 1. Check this line first whenever you verify a division.',
    cTrayR: '{r} left in the tray (the remainder)', cGhost: 'One more round is possible!', cDone: 'Done ✓ remainder < divisor',

    s2k: 'Step 2 · A Second View',
    s2t: 'Division Is Jumping Along a Number Line',
    s2e: 'The question for this step: <strong>ask it differently — how many divisors fit inside the total?</strong> Same numbers as Step 0: start at 0, and let each jump cover exactly one divisor. Each full jump packs one divisor in. Jump until one more jump would overshoot the total, then look at where you stop and what is missing.',
    s2totalLab: 'Total (dividend)', s2divLab: 'How far each jump goes (divisor)',
    s2shareNote: 'The two sliders in this step — “Total (dividend)” and “How far each jump goes (divisor)” — are the very same numbers as Step 0: change them here and the candy dealing there changes too — both steps are always working on the same problem.',
    s2jump: 'Jump once', s2play: 'Auto-jump', s2pause: 'Pause', s2reset: 'Restart',
    s2roIdle: 'Start at 0 and jump <b>{d}</b> at a time. See how many full jumps fit inside <b>{n}</b>. Press “Jump once” or “Auto-jump”.',
    s2roMid: '<b>{k}</b> jumps made, landed on <b>{pos}</b>; the target is <b>{n}</b> — there is room for more.',
    s2roDone: '<b>{n} = {d} × {q} + {r}</b>: <b>{q}</b> full jumps land on {qd}, leaving <b>{r}</b> — not enough for one more whole jump (short by {need}). Same quotient {q}, same remainder {r} as the candy dealing in Step 0.',
    s2roExact: '<b>{n} = {d} × {q}</b>: <b>{q}</b> full jumps land exactly on {n}. Remainder 0.',
    s2hint: 'One division, two questions: dealing candies asks “how many each”, jumping asks “how many divisors fit in the total” — and the quotient and remainder come out identical. Jumping is also multiplication run backwards: {q} jumps × {d} each = {qd}, exactly the gathering of rows and columns, reversed. To see how multiplication “gathers”, visit <a class="fourier-link" href="../area-model/#step1">Multiplication Is Area · Step 1 (Dots Become Tiles)</a>.',
    cTarget: 'Target {n}', cRemain2: '{r} left, less than a jump',

    s3k: 'Step 3 · Remainders at Work',
    s3t: 'What Weekday Is It 100 Days from Now?',
    s3e: 'The question for this step: <strong>what is a remainder actually good for?</strong> Today is Tuesday. Counting 100 days one by one is miserable — but weekdays repeat every 7 days: after any whole number of weeks, the weekday is exactly where it started. So split 100 into “whole weeks + leftover days”, and <strong>only the remainder moves the answer</strong>. Drag the slider to change the day count and watch the landing cell hop.',
    s3daysLab: 'Count forward this many days', s3quickLab: 'Try a few:',
    s3ro: '<b>{n} days = 7 × {w} + {r}</b>: {w} whole weeks slip by and the weekday does not budge; count {r} more days and Tuesday lands on <b>{ans}</b>. Only the remainder {r} decided the answer.',
    s3ro0: '<b>{n} days = 7 × {w} + 0</b>: exactly {w} whole weeks, remainder 0 — it is <b>Tuesday</b> again.',
    s3hint: 'Anything that goes in circles is remainder-only: weekdays (a circle of 7), clock faces (12), shift rosters, seats around a table… Divide by the circle length first — the quotient counts the laps, <strong>the remainder is the landing spot</strong>.',
    cToday: 'today', cMidWeeks: '{m} week(s) in between: every week is a full 7 days, the landing stays in the same column',
    wShort: 'Su,Mo,Tu,We,Th,Fr,Sa',
    wFull: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',

    s4k: 'Step 4 · The Quiz',
    s4t: 'Quiz: Sharing Problems and the Check Ledger',
    s4e: 'Your turn. Both questions run on the same ledger: <strong>dividend = divisor × quotient + remainder, with remainder &lt; divisor</strong>. Each explanation is revealed only when you answer correctly; get it wrong and the ledger itself will point at the line that fails. The board above is the ledger — every question you solve fills in its row.',
    s4q1: 'Q1. 23 books are shared equally among 5 children. How many books does each child get, and how many are left?',
    s4q1a: '4 each, 3 left', s4q1b: '5 each, 2 left', s4q1c: '3 each, 8 left',
    s4q1ok: 'Correct! The ledger: <b>23 = 5 × 4 + 3</b>, and the remainder 3 &lt; 5 children — fully shared, that is the answer.',
    s4q1fbB: 'Not quite — check with the ledger: 5 children × 5 books each = 25 books, but there are only 23. <b>Divisor × quotient can never exceed the dividend</b>; this option cannot even be dealt out.',
    s4q1fbC: 'Not quite — check with the test: 8 left is more than the 5 children, so everyone could still get 1 more. <b>Not finished: the remainder must be smaller than the divisor.</b>',
    s4q2: 'Q2. Checking backwards: ☆ ÷ 6 = 7 … 4. What is the dividend ☆?',
    s4q2ok: 'Correct! <b>Dividend = divisor × quotient + remainder = 6 × 7 + 4 = 46</b>. Checking problems need no guessing — just run the ledger backwards.',
    s4q2fbA: '42 = 6 × 7 is only the “divides exactly” part — do not forget the <b>+ remainder 4</b> at the end of the ledger.',
    s4q2fbC: '52 fails the ledger check: 6 × 7 + 4 = <b>46</b>. Plug any candidate back into dividend = divisor × quotient + remainder and the wrong ones expose themselves at once.',
    s4allDone: 'Both correct — you can now check any division problem yourself with the ledger.',
    cLedger1: 'Ledger for Q1', cLedger2: 'Ledger for Q2',
    cDividend: 'dividend', cDivisor: 'divisor', cQuotient: 'quotient', cRemainder: 'remainder',
    s4fin: 'This whole page runs on one ledger: <strong>dividend = divisor × quotient + remainder, with remainder &lt; divisor</strong>. Dealing candies, jumping on the number line, counting weekdays — three tellings of the same ledger. Faced with any division, write the ledger first and check it afterwards, and the remainder will never fool you.',
    lkArea: '← Previous stop: multiplication “gathers” rows and columns into a total (Multiplication Is Area · Step 1) — division takes it apart',
    lkFrac: 'The leftover 1 candy has a sequel: cut it up to share it, and you get fractions — 17 ÷ 4 = 4¼ (Fractions · Step 5) →'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
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
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
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
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
