'use strict';
// Division & remainders lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '除法与余数 · 分到不够再分一轮为止',
    back: '← 知识索引',
    compare: '对照另一版本：除法与余数 · 分不完的那一点 →',
    navLabel: '除法与余数步骤导航',
    tagline: '一堆饼干分给几个人，分到最后常常剩下几块。这一页先一轮一轮地发，弄清楚什么时候必须停、剩下的为什么一定比人数少；再到数轴上跳一跳，学会验算；最后用余数推算星期几，决定要开几条船。',
    nav0: '0 一轮轮发', nav1: '1 何时算分完', nav2: '2 数轴上跳', nav3: '3 验算', nav4: '4 星期几', nav5: '5 进一还是舍去', nav6: '6 自测与收束',

    s0k: '第 0 步 · 公平地分',
    s0t: '13 块饼干分给 4 个人，每人几块，剩几块？',
    s0e: '这一步要回答：<strong>13 块饼干平均分给 4 个小朋友，每人能分到几块，还剩几块？</strong>「平均分」就是每人分得一样多。最不会出错的办法是一轮一轮地发：每一轮给每人各 1 块；只要饼干堆里剩下的还够每人再拿 1 块，就再发一轮；剩下的不够发一整轮了，就停。停下来以后：要分的总数叫<strong>被除数</strong>，分给几个人叫<strong>除数</strong>，每人分到的块数叫<strong>商</strong>，最后剩下、不够再发一轮的块数叫<strong>余数</strong>。写成「被除数 ÷ 除数 = 商 …… 余数」。',
    s0lgPile: '还没发出去的饼干', s0lgPlate: '已经发到盘子里的饼干', s0lgBand: '一条浅色横带 = 一轮（每人各 1 块）',
    cookies: '饼干总数（被除数）', people: '人数（除数）',
    dealRound: '发一轮', dealAll: '一直发，发到不够一轮', restart: '收回重来',
    c0pile: '饼干堆：还剩 {n} 块', c0plates: '{d} 个人的盘子（左起第 1 人）',
    r0start: '还没开始发。饼干堆里有 {N} 块，要平均分给 {d} 个人。',
    r0mid: '第 {k1} 轮正在发：这一轮已经有 {got} 人拿到；饼干堆里还剩 {left} 块。',
    r0more: '已经发了 {k} 轮，每人 {k} 块；饼干堆里还剩 {left} 块，够 {d} 人每人再拿 1 块，可以再发一轮。',
    r0stop: '已经发了 {k} 轮，每人 {k} 块；饼干堆里只剩 {left} 块，比人数 {d} 少，再发就有人拿不到，只能停：每人 {k} 块是商，剩下的 {left} 块是余数。',
    r0none: '饼干只有 {N} 块，比人数 {d} 还少，一轮都发不了：商是 0（每人 0 块），余数就是 {N}。',
    ledgerDiv: '{N} ÷ {d} = {q} …… {r}',
    s0hint: '观察顺序：先按「发一轮」，看饼干一块一块落进每个人的盘子，同一轮发出的饼干落在同一条浅色横带里；再看上方饼干堆还剩多少。剩下的少于人数时，「发一轮」按钮会变灰——不是不让发，而是不够每人 1 块了。改饼干数或人数，会把饼干全部收回、从头开始。',

    s1k: '第 1 步 · 什么时候算分完',
    s1t: '剩下多少块，才算真的分完了？',
    s1e: '这一步要回答：<strong>17 块饼干分给 5 个人，有人说「每人 2 块，剩 7 块」，这样算分完了吗？</strong>这次不一轮轮发，而是你先定「每人几块」——也就是商（每人分到的块数）的候选，页面算出用掉多少、剩下多少。图里每一<strong>行</strong>是一个人，每一<strong>列</strong>是一轮（每人各 1 块）。剩下的如果还能凑满一整列，说明还能每人再发 1 块，没分完；要是用掉的比现有的还多，就是不够分。只有一个「每人几块」能让剩下的既不缺、又凑不满一列——也就是<strong>余数比除数（人数）小</strong>。这不是硬性规定，而是「分完了」的意思本身。',
    s1lgUsed: '已分出的（一行一人，一列一轮）', s1lgLeft: '剩下的饼干', s1lgMore: '剩下的又凑满一整列：还能再发一轮', s1lgShort: '缺的饼干：不够分',
    eachGets: '每人几块（商的候选）',
    c1title: '{d} 人 × 每人 {q} 块 = {used} 块　剩 {left} 块', c1titleShort: '{d} 人 × 每人 {q} 块 = {used} 块　还差 {lack} 块',
    r1short: '每人 {q} 块要用 {used} 块，可只有 {N} 块，还差 {lack} 块：不够分，每人几块要往回调。',
    r1more: '每人 {q} 块用掉 {used} 块，剩 {left} 块。剩下的不少于人数 {d}，还能每人再拿 1 块：没分完，每人还能更多。',
    r1done: '每人 {q} 块用掉 {used} 块，剩 {left} 块，比人数 {d} 少，再发一轮就有人拿不到：分完了。{N} ÷ {d} = {q} …… {left}。',
    triedLabel: '你试过的「每人几块」：',
    chipShort: '每人 {q}：差 {lack}', chipMore: '每人 {q}：剩 {left}，还能发', chipDone: '每人 {q}：剩 {left}，分完',
    s1hint: '观察顺序：饼干数和人数先不动，把「每人几块」从 0 一格一格往上拖。看右边橙色的剩余：一开始多到能框出整列（橙色虚线框），说明还能发；到某一格，剩下的凑不满一列了；再往上，图里出现虚线空圈，表示饼干不够。下面会记下你试过的每个值——数一数标着「分完」的有几个，永远只有一个。改饼干数或人数会清空记录。',

    s2k: '第 2 步 · 数轴上跳',
    s2t: '17 里面最多装得下几个 5？',
    s2e: '这一步要回答：<strong>17 里面最多装得下几个 5，还多出几？</strong>把除数当成一跳的长度，从 0 出发往右跳：0 → 5 → 10 → 15。再跳一次就到 20，超过 17 了，所以只能跳 3 次。跳的次数就是商（3），最后落脚点 15 到 17 之间跳不完的 2 格就是余数。最后的落脚点正好是 商 × 除数（3 × 5 = 15），所以除法也在回答「被除数里有几个除数」，和乘法一来一回（<a class="xlink" href="../../../math/arithmetic/area-model/#step0">→ 乘法页第 0 步：乘法是数点阵的捷径</a>）。余数一定比一跳短：要是剩下的不比一跳短，就还能再跳一次。',
    s2lgHop: '每一跳（长度 = 除数）', s2lgLeft: '跳不完的格数 = 余数；旗子在被除数处', s2lgOver: '再跳一次会落到哪：越过了被除数',
    dividend: '被除数', hopLen: '每跳几格（除数）', hopStart: '从 0 开始跳',
    c2title: '从 0 跳到 {N}，每跳 {d} 格',
    r2: '从 0 跳到 {last}，一共 {q} 跳（商）；{last} 到 {N} 还有 {r} 格（余数），不够再跳一次——下一跳会落到 {next}，超过 {N}。',
    r2exact: '从 0 跳到 {last}，一共 {q} 跳（商），正好落在 {N} 上，余数是 0。这时说 {N} 能被 {d} 整除。',
    r2zero: '一跳就有 {d} 格，比 {N} 还长：一跳也跳不了。商是 0，余数就是 {N} 本身。',
    r2prog: '正在跳：第 {j}/{q} 跳，落在 {pos}。',
    ledgerBack: '{d} × {q} + {r} = {N}',
    s2hint: '观察顺序：按「从 0 开始跳」，看青色弧线一跳一跳留在数轴上；跳完后，粉色虚线是「再跳一次」会落到的地方——越过了橙色旗子（被除数）。然后只拖「每跳几格」：步子变大，跳数变少，橙色剩余段变长，但它永远比一跳短。再把被除数拖到步长的倍数（例如步长 5 时拖到 20），橙色段消失。',

    s3k: '第 3 步 · 验算',
    s3t: '算完了，怎么知道没算错？',
    s3e: '这一步要回答：<strong>47 ÷ 6，三个同学交了三个答案，哪个对？</strong>检查一个除法答案要过两关。第一关叫<strong>验算</strong>：把答案倒回去算，除数 × 商 + 余数，应该正好等于被除数——也就是把分出去的（除数个人，每人「商」块）和剩下的（余数）加回来，一块不多、一块不少。第二关：余数要比除数小，不然剩下的还能每人再分 1 块。两关都过才对。图里沿用上一步的排法：一行一个人，一列一轮，橙色是余数。',
    s3pick: '点一个答案来检查（被除数和除数也可以改）：',
    divisor: '除数',
    candText: '{N} ÷ {d} = {q} …… {r}',
    s3lgQ: '分出去的（一行一人，一列一轮）', s3lgR: '余数', s3lgMiss: '比被除数少的块', s3lgExtra: '比被除数多出来的块',
    c3title: '被除数 {N} 块　答案倒回去是 {back} 块', c3none: '先点上面的一个答案',
    r3none: '还没选答案。',
    r3id1: '第一关：{d} × {q} + {r} = {back}，正好等于 {N}，过了。',
    r3idMore: '第一关：{d} × {q} + {r} = {back}，比 {N} 多 {n}，没过。',
    r3idLess: '第一关：{d} × {q} + {r} = {back}，比 {N} 少 {n}，没过。',
    r3sm1: '第二关：余数 {r} 比除数 {d} 小，过了。',
    r3sm0: '第二关：余数 {r} 不比除数 {d} 小，剩下的还能凑满一列（橙色虚线框），每人再分 1 块，没过。',
    r3yes: '两关都过：这个答案对。', r3no: '没有两关都过：这个答案不对。',
    chip3ok: '{q} …… {r}：对', chip3big: '{q} …… {r}：余数太大', chip3off: '{q} …… {r}：验算不等',
    s3hint: '观察顺序：先把三个答案各点一次，看图里的块数和被除数对不对得上（虚线空圈 = 少了，粉色 = 多了），再看橙色的余数有没有凑满一整列。然后改被除数或除数，三个答案会重新出——每次都有一个「验算对、但余数太大」或「验算就不对」的陷阱，记录会清空。',

    s4k: '第 4 步 · 余数管循环',
    s4t: '今天星期二，100 天后星期几？',
    s4e: '这一步要回答：<strong>不翻日历，怎么知道 100 天后是星期几？</strong>星期是 7 天一圈地循环：每过 7 天，又回到同一个星期几。所以把天数拆成「几个整周 + 零头」：100 ÷ 7 = 14 …… 2。商 14 是走了 14 个整周，走完又回到星期二；只有余数 2（不满一周的零头天数）真正把星期往后推：星期二往后数 2 天是星期四。走了几圈不影响答案，<strong>余数</strong>才决定落在哪一天。',
    c4a: '星期转盘：指针从今天出发一天走一格', c4b: '天数拆成整周和零头',
    c4title: '星期一圈 7 天　已绕 {laps} 圈', c4btitle: '{q} 个整周 + {r} 天',
    s4lgStart: '今天（起点）', s4lgWeek: '一个整周（7 天）', s4lgRest: '零头天数 = 余数；指针落点',
    today: '今天是', daysLater: '再过几天',
    wd0: '星期一', wd1: '星期二', wd2: '星期三', wd3: '星期四', wd4: '星期五', wd5: '星期六', wd6: '星期日',
    wds0: '一', wds1: '二', wds2: '三', wds3: '四', wds4: '五', wds5: '六', wds6: '日',
    walk: '一天一天走过去',
    r4: '{D} ÷ 7 = {q} …… {r}：{q} 个整周后还是{start}，再往后数 {r} 天 → {end}。',
    r4zero: '{D} ÷ 7 = {q} …… 0：正好 {q} 个整周，又回到{start}。',
    r4walk: '走到第 {i}/{D} 天：已经绕了 {laps} 整圈，这一天是{now}。',
    s4hint: '观察顺序：按「一天一天走过去」，看转盘上的指针一格一格转圈、圈数在转盘标题里累加；整周条上每走满 7 天就收起一个灰色整周块。走完后指针停在哪，只由最后的橙色零头决定。再把天数改成 7、14、21 这样的 7 的倍数：余数为 0，指针回到起点。',

    s5k: '第 5 步 · 进一还是舍去',
    s5t: '同一个算式，答案为什么有时要多加 1？',
    s5e: '这一步要回答：<strong>23 ÷ 5 = 4 …… 3，可题目问的到底是什么？</strong>两道题算式一样。坐船：23 人，每条船坐 5 人，要几条船？4 条船只坐得下 20 人，余数 3 表示还有 3 人没上船，他们也得过河，所以要 4 + 1 = 5 条——余数不为 0 时，商（整份的个数）要<strong>加 1</strong>。买本子：23 元，一本 5 元，能买几本？4 本花 20 元，余数 3 元买不起第 5 本，只能买 4 本、找回 3 元——<strong>就取商</strong>。余数没变，变的是问题：每个人都必须有着落，就进一；只能用完整的一份，就舍去。（余数还能写成分数，见 <a class="xlink" href="../../../math/arithmetic/fractions/#step5">→ 分数页第 5 步：超过 1 的分数和带分数</a>。）',
    sceneBoat: '情景：坐船过河', sceneBook: '情景：买本子',
    nPeople: '一共几人（被除数）', boatSeats: '每条船坐几人（除数）', nMoney: '一共几元（被除数）', bookPrice: '一本几元（除数）',
    lgBoatFull: '坐满的船', lgBoatPart: '没坐满、但必须开的船', lgSeat: '空座位', lgBook: '买到的一本（框里是它花的 1 元硬币）', lgChange: '不够买一本的钱 = 余数',
    c5titleBoat: '要 {need} 条船', c5titleBook: '能买 {q} 本，剩 {r} 元',
    r5boat: '{N} ÷ {d} = {q} …… {r}。{q} 条船坐满 {used} 人，还有 {r} 人没上船，得再开 1 条：一共 {need} 条（进一）。',
    r5boatExact: '{N} ÷ {d} = {q} …… 0。{q} 条船正好坐满，没人落下，不用多开：{need} 条。',
    r5book: '{N} ÷ {d} = {q} …… {r}。{q} 本花掉 {used} 元，剩 {r} 元不够再买 1 本：能买 {q} 本，找回 {r} 元（舍去）。',
    r5bookExact: '{N} ÷ {d} = {q} …… 0。{q} 本正好花完 {N} 元，不找零。',
    s5hint: '观察顺序：两个情景用同一对数。先在「坐船」里把人数从 20 拖到 21，看船数从 4 跳到 5——多 1 个人也得多开 1 条船；再切到「买本子」，同样从 20 拖到 21，本子数不变，只是零钱多了 1 元。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '三道题，都用同一本账',
    s6e: '每题先自己算，再选答案、按「检查」。解析都回到同一个账本式：被除数 = 除数 × 商 + 余数，而且余数比除数小。',
    qz1p: '① 29 ÷ 6 = ?',
    qz2p: '② 一道除法的除数是 7，商是 8，余数是 3。被除数是多少？',
    qz3p: '③ 今天星期五，再过 30 天是星期几？',
    check: '检查', pick: '先选一个选项。',
    qz1ok: '对。{d} × {q} + {r} = {N}，余数 {r} 比 {d} 小。另外两个：{q2} …… {r2} 倒回去也是 {N}，可余数 {r2} 比 {d} 大，还能再分；{q3} …… {r3} 倒回去是 {b3}，不等于 {N}。',
    qz1no: '再想想：先验算（除数 × 商 + 余数 是不是 {N}），再看余数是不是比 {d} 小。',
    qz2ok: '对。倒回去算：{d} × {q} + {r} = {N}。{w1} 只算了 {d} × {q}，忘了加余数；{w2} 是 {d} × {q1}，多算了一整轮。',
    qz2no: '再想想：被除数 = 除数 × 商 + 余数。',
    qz3ok: '对。{D} ÷ 7 = {q} …… {r}：{q} 个整周后还是{start}，再往后数 {r} 天是{end}。',
    qz3no: '再想想：只有余数决定往后数几天。{D} ÷ 7 的余数是几？',
    s6fin: '回头看这一路：<strong>第 0 步</strong>一轮一轮地发，剩下的不够一轮就停；<strong>第 1 步</strong>「余数比除数小」就是「分完了」的意思，满足它的商只有一个；<strong>第 2 步</strong>在数轴上，商是跳了几次，余数是跳不完的那一截；<strong>第 3 步</strong>验算把答案倒回去，两关都过才对；<strong>第 4 步</strong>循环的问题只看余数；<strong>第 5 步</strong>同一个余数，按问题决定进一还是舍去。',
    formula: '被除数 = 除数 × 商 + 余数\n0 ≤ 余数 < 除数',
    boundary: '适用范围：本页只讲整数（0、1、2、3……）的除法，除数至少是 1。除数不能是 0：把东西分给 0 个人，问题本身就说不通。以后学到分数和小数，「除不尽」剩下的那部分还能继续往下分（例如 17 ÷ 4 = 4¼），那时就不一定写成「商 …… 余数」了。',
    linksTitle: '接着去看',
    lk1: '→ 乘法与面积页第 4 步：知道面积找边长——能整除的那几对数',
    lk2: '→ 分数页第 5 步：超过 1 的分数，余数变成分数部分',
    lk3: '→ 乘法与面积页第 0 步：点阵与乘法，除法就是倒着走一遍',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《除法与余数 · 分不完的那一点》的平行版本。'
  },
  en: {
    pageTitle: 'Division & Remainders · Share Until a Round Runs Out',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Division & Remainders · What Is Left Over →',
    navLabel: 'Division and remainders steps',
    tagline: 'Share a pile of cookies among a few friends and a couple are often left over. First deal them out one round at a time and pin down when you must stop and why the leftover is always fewer than the people; then hop along the number line and learn to check an answer; finally use the remainder to find a weekday and to decide how many boats to send.',
    nav0: '0 Deal in rounds', nav1: '1 When is it done', nav2: '2 Hops', nav3: '3 Checking', nav4: '4 Weekdays', nav5: '5 Up or down', nav6: '6 Quiz & wrap-up',

    s0k: 'Step 0 · Sharing fairly',
    s0t: '13 cookies, 4 friends: how many each, how many left?',
    s0e: 'This step asks: <strong>share 13 cookies fairly among 4 friends — how many does each get, and how many are left?</strong> “Fairly” means everyone gets the same number. The surest way is to deal in rounds: each round gives every person one cookie, and as long as the pile still holds enough for everyone to get one more, you deal another round. When it doesn’t, you stop. Then the total being shared is the <strong>dividend</strong>, the number of people is the <strong>divisor</strong>, what each person ends up with is the <strong>quotient</strong>, and what is left — too few for another round — is the <strong>remainder</strong>. We write it as “dividend ÷ divisor = quotient R remainder”.',
    s0lgPile: 'cookies still in the pile', s0lgPlate: 'cookies already on a plate', s0lgBand: 'one pale band = one round (one cookie each)',
    cookies: 'Cookies (dividend)', people: 'People (divisor)',
    dealRound: 'Deal one round', dealAll: 'Keep dealing until a round runs out', restart: 'Take them back',
    c0pile: 'Pile: {n} left', c0plates: '{d} plates (person 1 on the left)',
    r0start: 'Nothing dealt yet. The pile holds {N} cookies to share fairly among {d} people.',
    r0mid: 'Round {k1} in progress: {got} people have their cookie for this round; {left} still in the pile.',
    r0more: '{k} rounds dealt, {k} each; {left} left in the pile — enough for all {d} people to get one more, so another round is possible.',
    r0stop: '{k} rounds dealt, {k} each; only {left} left, fewer than the {d} people, so another round would leave someone out. Stop: {k} each is the quotient, the {left} left over is the remainder.',
    r0none: 'Only {N} cookies for {d} people — not even one full round. The quotient is 0 (nobody gets one) and the remainder is all {N}.',
    ledgerDiv: '{N} ÷ {d} = {q} R {r}',
    s0hint: 'What to watch: press “Deal one round” and see the cookies drop onto the plates one at a time — cookies from the same round land in the same pale band. Then glance at the pile. Once fewer cookies remain than there are people, the round button greys out — not a rule, there just isn’t one for everybody. Changing either slider takes every cookie back and starts over.',

    s1k: 'Step 1 · When is sharing finished',
    s1t: 'How few must be left before sharing is really done?',
    s1e: 'This step asks: <strong>17 cookies, 5 people — someone says “2 each, 7 left over”. Is that finished?</strong> This time you don’t deal round by round. You choose “how many each” — a candidate for the quotient, the number each person gets — and the page works out how many that uses and how many remain. In the picture each <strong>row</strong> is a person and each <strong>column</strong> is a round (one cookie each). If the leftovers can still fill a whole column, everyone could get one more, so you’re not done; if you’d need more cookies than you have, there aren’t enough. Exactly one choice leaves nothing missing and not enough for another column — that is, a <strong>remainder smaller than the divisor</strong> (the number of people). That isn’t an arbitrary rule; it is what “finished” means.',
    s1lgUsed: 'shared out (one row per person, one column per round)', s1lgLeft: 'cookies left over', s1lgMore: 'leftovers fill a whole column: another round is possible', s1lgShort: 'missing cookies: not enough',
    eachGets: 'How many each (candidate quotient)',
    c1title: '{d} people × {q} each = {used}   {left} left', c1titleShort: '{d} people × {q} each = {used}   {lack} short',
    r1short: '{q} each needs {used} cookies but there are only {N} — {lack} short. Not enough; bring “how many each” down.',
    r1more: '{q} each uses {used}, leaving {left}. That is at least the {d} people, so everyone could get one more: not finished, each can have more.',
    r1done: '{q} each uses {used}, leaving {left} — fewer than the {d} people, so another round would leave someone out: finished. {N} ÷ {d} = {q} R {left}.',
    triedLabel: 'Values of “how many each” you have tried:',
    chipShort: '{q} each: {lack} short', chipMore: '{q} each: {left} left, keep going', chipDone: '{q} each: {left} left, done',
    s1hint: 'What to watch: keep cookies and people fixed and raise “how many each” one notch at a time from 0. Watch the orange leftovers on the right: at first there are enough to box a full column (dashed orange box), so you can keep dealing; at one notch they no longer fill a column; above that, dashed empty circles appear — cookies you don’t have. The list below keeps every value you try. Count how many say “done”: always exactly one. Changing cookies or people clears the list.',

    s2k: 'Step 2 · Hops on the number line',
    s2t: 'How many 5s fit inside 17?',
    s2e: 'This step asks: <strong>how many 5s fit inside 17, and how much is left?</strong> Treat the divisor as the length of one hop and jump right from 0: 0 → 5 → 10 → 15. One more hop would land on 20, past 17, so only 3 hops fit. The number of hops is the quotient (3); the 2 units from the last landing spot, 15, up to 17 are the remainder. The last landing spot is quotient × divisor (3 × 5 = 15), so division also answers “how many divisors fit inside the dividend” — it runs multiplication backwards (<a class="xlink" href="../../../math/arithmetic/area-model/#step0">→ Area model, step 0: multiplication as a shortcut for counting dot grids</a>). The remainder is always shorter than one hop: if it weren’t, you could hop once more.',
    s2lgHop: 'each hop (length = divisor)', s2lgLeft: 'the part you can’t hop = remainder; flag at the dividend', s2lgOver: 'where one more hop would land: past the dividend',
    dividend: 'Dividend', hopLen: 'Hop length (divisor)', hopStart: 'Hop from 0',
    c2title: 'From 0 to {N}, {d} per hop',
    r2: 'From 0 to {last}: {q} hops (the quotient). From {last} to {N} is {r} more (the remainder) — too short for another hop, which would land on {next}, past {N}.',
    r2exact: 'From 0 to {last}: {q} hops (the quotient), landing exactly on {N}, so the remainder is 0. We say {N} is divisible by {d}.',
    r2zero: 'One hop is {d} long, more than {N}: not a single hop fits. The quotient is 0 and the remainder is {N} itself.',
    r2prog: 'Hopping: hop {j}/{q}, landed on {pos}.',
    ledgerBack: '{d} × {q} + {r} = {N}',
    s2hint: 'What to watch: press “Hop from 0” and watch cyan arcs stay on the line, one per hop. Afterwards the dashed pink arc shows where one more hop would land — past the orange flag (the dividend). Then move only the hop length: bigger hops, fewer of them, a longer orange leftover — but never as long as a hop. Set the dividend to a multiple of the hop (say 20 with hops of 5) and the orange piece disappears.',

    s3k: 'Step 3 · Checking',
    s3t: 'You have an answer. How do you know it’s right?',
    s3e: 'This step asks: <strong>three classmates hand in three answers to 47 ÷ 6 — which is right?</strong> A division answer has to pass two tests. The first is the <strong>check</strong>: run it backwards, divisor × quotient + remainder, and you must get the dividend exactly — put back what was shared out (divisor people, quotient each) plus what was left, and not one cookie more or less. The second: the remainder must be smaller than the divisor, otherwise everyone could still get one more. Only an answer that passes both is right. The picture uses the layout from step 1: one row per person, one column per round, remainder in orange.',
    s3pick: 'Pick an answer to check (you can change the dividend and divisor too):',
    divisor: 'Divisor',
    candText: '{N} ÷ {d} = {q} R {r}',
    s3lgQ: 'shared out (one row per person, one column per round)', s3lgR: 'remainder', s3lgMiss: 'short of the dividend', s3lgExtra: 'more than the dividend',
    c3title: 'Dividend {N}   answer run backwards: {back}', c3none: 'Pick one of the answers above first',
    r3none: 'No answer picked yet.',
    r3id1: 'Test 1: {d} × {q} + {r} = {back}, exactly {N}. Passed.',
    r3idMore: 'Test 1: {d} × {q} + {r} = {back}, {n} more than {N}. Failed.',
    r3idLess: 'Test 1: {d} × {q} + {r} = {back}, {n} less than {N}. Failed.',
    r3sm1: 'Test 2: the remainder {r} is smaller than the divisor {d}. Passed.',
    r3sm0: 'Test 2: the remainder {r} is not smaller than the divisor {d} — the leftovers still fill a column (dashed orange box), so everyone could get one more. Failed.',
    r3yes: 'Both tests passed: this answer is right.', r3no: 'Not both tests passed: this answer is wrong.',
    chip3ok: '{q} R {r}: right', chip3big: '{q} R {r}: remainder too big', chip3off: '{q} R {r}: check fails',
    s3hint: 'What to watch: click each of the three answers and see whether the cookie count matches the dividend (dashed empty circles = too few, pink = too many), then whether the orange remainder fills a whole column. Then change the dividend or divisor; three new answers appear, always with one trap that passes the check but keeps too big a remainder, or fails the check outright. The list clears.',

    s4k: 'Step 4 · Remainders run cycles',
    s4t: 'Today is Tuesday. What day is it in 100 days?',
    s4e: 'This step asks: <strong>without flipping through a calendar, what weekday is 100 days from now?</strong> The week runs in a loop of 7 days: every 7 days you are back on the same weekday. So split the days into “whole weeks + a few extra”: 100 ÷ 7 = 14 R 2. The quotient 14 is fourteen whole weeks, after which it is Tuesday again; only the remainder 2 — the extra days that don’t make a full week — actually moves the weekday on: two days after Tuesday is Thursday. How many laps you made doesn’t matter; the <strong>remainder</strong> decides where you land.',
    c4a: 'Weekday dial: the pointer moves one notch per day from today', c4b: 'Days split into whole weeks and extra days',
    c4title: 'A week is 7 days   laps: {laps}', c4btitle: '{q} whole weeks + {r} days',
    s4lgStart: 'today (the start)', s4lgWeek: 'one whole week (7 days)', s4lgRest: 'extra days = remainder; where the pointer stops',
    today: 'Today is', daysLater: 'Days from now',
    wd0: 'Monday', wd1: 'Tuesday', wd2: 'Wednesday', wd3: 'Thursday', wd4: 'Friday', wd5: 'Saturday', wd6: 'Sunday',
    wds0: 'Mon', wds1: 'Tue', wds2: 'Wed', wds3: 'Thu', wds4: 'Fri', wds5: 'Sat', wds6: 'Sun',
    walk: 'Walk there day by day',
    r4: '{D} ÷ 7 = {q} R {r}: after {q} whole weeks it is {start} again; {r} more days → {end}.',
    r4zero: '{D} ÷ 7 = {q} R 0: exactly {q} whole weeks, so it is {start} again.',
    r4walk: 'Day {i}/{D}: {laps} full laps so far, and this day is a {now}.',
    s4hint: 'What to watch: press “Walk there day by day”. The pointer steps round the dial and the lap count in the dial’s title grows; in the week strip every 7 days fold into one grey week block. Where the pointer stops depends only on the orange extra days at the end. Then try 7, 14, 21 — multiples of 7: the remainder is 0 and the pointer is back where it started.',

    s5k: 'Step 5 · Round up or round down',
    s5t: 'Same sum — so why is the answer sometimes one more?',
    s5e: 'This step asks: <strong>23 ÷ 5 = 4 R 3, but what is the question actually asking?</strong> Two problems, one calculation. Boats: 23 people, 5 per boat — how many boats? Four boats carry only 20; the remainder 3 means three people are still on the shore and they have to cross too, so you need 4 + 1 = 5 boats. When the remainder isn’t 0, the quotient (the number of full groups) goes <strong>up by one</strong>. Notebooks: 23 dollars, 5 dollars each — how many can you buy? Four cost 20; the remaining 3 dollars can’t buy a fifth, so you get 4 and 3 dollars change — <strong>just the quotient</strong>. The remainder hasn’t changed; the question has. If everyone must be taken care of, round up; if only complete groups count, round down. (A remainder can also become a fraction: <a class="xlink" href="../../../math/arithmetic/fractions/#step5">→ Fractions, step 5: fractions bigger than 1 and mixed numbers</a>.)',
    sceneBoat: 'Scenario: crossing by boat', sceneBook: 'Scenario: buying notebooks',
    nPeople: 'People (dividend)', boatSeats: 'Seats per boat (divisor)', nMoney: 'Dollars (dividend)', bookPrice: 'Price per notebook (divisor)',
    lgBoatFull: 'a full boat', lgBoatPart: 'a boat not full, but it has to go', lgSeat: 'empty seat', lgBook: 'one notebook bought (the 1-dollar coins it cost are inside)', lgChange: 'money that can’t buy another = remainder',
    c5titleBoat: '{need} boats needed', c5titleBook: '{q} notebooks, {r} dollars left',
    r5boat: '{N} ÷ {d} = {q} R {r}. {q} full boats carry {used} people; {r} are still on the shore, so one more boat goes: {need} in all (round up).',
    r5boatExact: '{N} ÷ {d} = {q} R 0. {q} boats are exactly full and nobody is left behind: {need} boats, no extra.',
    r5book: '{N} ÷ {d} = {q} R {r}. {q} notebooks cost {used} dollars; the {r} left can’t buy another: {q} notebooks and {r} dollars change (round down).',
    r5bookExact: '{N} ÷ {d} = {q} R 0. {q} notebooks use up all {N} dollars, no change.',
    s5hint: 'What to watch: both scenarios use the same pair of numbers. In “boats”, drag the people from 20 to 21 and watch the boats jump from 4 to 5 — one extra person needs a whole extra boat. Switch to “notebooks” and do the same: the notebook count stays put, only the change goes up by a dollar.',

    s6k: 'Step 6 · Quiz & wrap-up',
    s6t: 'Three questions, one ledger',
    s6e: 'Work each one out first, then pick an answer and press “Check”. Every explanation goes back to the same ledger: dividend = divisor × quotient + remainder, with the remainder smaller than the divisor.',
    qz1p: '① 29 ÷ 6 = ?',
    qz2p: '② A division has divisor 7, quotient 8 and remainder 3. What is the dividend?',
    qz3p: '③ Today is Friday. What day is it 30 days from now?',
    check: 'Check', pick: 'Pick an option first.',
    qz1ok: 'Right. {d} × {q} + {r} = {N}, and the remainder {r} is smaller than {d}. The others: {q2} R {r2} also runs back to {N}, but the remainder {r2} is bigger than {d}, so there is more to share; {q3} R {r3} runs back to {b3}, not {N}.',
    qz1no: 'Not quite. Check first (does divisor × quotient + remainder give {N}?), then see whether the remainder is smaller than {d}.',
    qz2ok: 'Right. Run it backwards: {d} × {q} + {r} = {N}. {w1} is only {d} × {q} — the remainder was forgotten; {w2} is {d} × {q1}, one round too many.',
    qz2no: 'Not quite: dividend = divisor × quotient + remainder.',
    qz3ok: 'Right. {D} ÷ 7 = {q} R {r}: after {q} whole weeks it is {start} again, and {r} more days make it {end}.',
    qz3no: 'Not quite: only the remainder says how many days to count on. What is the remainder of {D} ÷ 7?',
    s6fin: 'Looking back. <strong>Step 0</strong>: deal in rounds and stop when the pile can’t cover another round. <strong>Step 1</strong>: “remainder smaller than the divisor” is what “finished” means, and only one quotient satisfies it. <strong>Step 2</strong>: on the number line the quotient is the number of hops and the remainder is the piece too short to hop. <strong>Step 3</strong>: checking runs the answer backwards, and a right answer passes both tests. <strong>Step 4</strong>: in a cycle only the remainder matters. <strong>Step 5</strong>: the same remainder is rounded up or down depending on the question.',
    formula: 'dividend = divisor × quotient + remainder\n0 ≤ remainder < divisor',
    boundary: 'Scope: this page divides whole numbers (0, 1, 2, 3, …) by a divisor of at least 1. The divisor can’t be 0 — sharing among zero people doesn’t make sense as a question. Once you meet fractions and decimals, the part that “doesn’t go” can be split further (for example 17 ÷ 4 = 4¼), and the answer is no longer written as “quotient R remainder”.',
    linksTitle: 'Where to go next',
    lk1: '→ Area model, step 4: from an area back to side lengths — the pairs that divide exactly',
    lk2: '→ Fractions, step 5: fractions bigger than 1, where the remainder becomes the fraction part',
    lk3: '→ Area model, step 0: dot grids and multiplication — division walks it backwards',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Division & Remainders · What Is Left Over”.'
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
