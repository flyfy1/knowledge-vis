'use strict';
// Replication lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '分布式系统 · 让五份副本说同一句话',
    back: '← 知识索引',
    compare: '对照另一版本：分布式系统 · 多个副本如何像一个值 →',
    navLabel: '分布式系统步骤导航',
    tagline: '一个账户余额存在 5 台机器上，任何一台坏了都不该丢数据。可是写入要经过网络，网络会慢、会断，5 份副本迟早说法不一。这一页一步步看：读到旧值的机会有多大，怎样用「读写都问够多台」把它压到 0，这又要付出多少可用性，以及网络断成两半时为什么只能二选一。',
    nav0: '0 副本不一致', nav1: '1 读写重叠', nav2: '2 实测', nav3: '3 宕机', nav4: '4 分区', nav5: '5 收束',

    s0k: '第 0 步 · 副本会说法不一',
    s0t: '一次写入只送到了几份副本，这时随便读一份，读到的是最新的吗？',
    s0e: '这一步要回答：写入没有送到所有副本时，读一份副本会读到什么？把同一份数据存在几台机器上，每一份叫一个<strong>副本</strong>：一台坏了，别的还在。每次写入都带一个<strong>版本号</strong>：由一个协调者按顺序编号 1、2、3……，版本号越大越新。写入要通过网络送到每个副本，网络慢或断时，有的副本收不到，就停在旧版本上，这样的副本叫<strong>陈旧</strong>副本。本页假设副本之间不会自己互相同步，只有写入送到时才更新。',
    reachLabel: '这次写入能送到哪些副本（点按钮切换）',
    reachOn: '{r} 能送到', reachOff: '{r} 送不到',
    write0: '写入新余额', read0: '随机读一个副本', reset0: '重来',
    s0lgNew: '最新版本', s0lgOld: '陈旧版本', s0lgRead: '刚被读的副本',
    c0: '客户端把新余额写给 5 个副本（虚线 = 没送到）',
    client: '客户端',
    s0state: '最新是 v{v} = {val}，5 个副本里 {fresh} 个有它；随机读一个副本，读到旧值的概率是 {stale}/5。',
    s0read: '刚才读到 {r}：v{v} = {val}（{tag}）。累计读了 {n} 次，其中 {s} 次是旧值。',
    tagNew: '最新', tagOld: '旧值',
    s0hint: '观察顺序：先只让 R1、R2 能送到，按「写入新余额」，看三个副本变成陈旧（橙色）；再连按几次「随机读一个副本」，数一数读到旧值的次数。然后把能送到的副本改多或改少再写一次，看读到旧值的概率怎样跟着变。',

    s1k: '第 1 步 · 读写重叠',
    s1t: '写要等几台确认、读要问几台，才能保证读到最新值？',
    s1e: '这一步要回答：不可能保证每次写入送到全部 N 个副本，那么写和读各要涉及多少副本，读才一定能碰到最新值？规定写入要等 <strong>W</strong> 个副本确认才算成功（<strong>写法定数</strong>），读要问 <strong>R</strong> 个副本、取其中版本号最大的值（<strong>读法定数</strong>）。法定数（quorum）就是「够数才算数」的那个数。最新那次写入只保证落在某 W 个副本上；只要读到的 R 个里有一个是它们之一，就能读到新值。读集合要完全错过这 W 个，只能从剩下的 N − W 个里挑满 R 个；所以 <strong>W + R > N</strong> 时根本挑不出来，一定读到最新值。不满足时，随机挑读集合错过新值的概率 = C(N − W, R) ÷ C(N, R)，C(n, k) 是从 n 个里选 k 个的选法数（<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ 二项分布页第 0 步：选法数怎么数</a>）。',
    nSlider: '副本数 N', wSlider: '写法定数 W', rSlider: '读法定数 R',
    s1lgW: '写入落到的 W 个副本（最新）', s1lgR: '最不走运的读集合（R 个）', s1lgBoth: '二者重叠', s1lgHeat: '格子颜色：读到旧值的概率（越亮越高，0 为深色）',
    c1top: '一次写入和一次最不走运的读', c1bot: '读到旧值的概率（横轴 W，纵轴 R）',
    s1miss: 'N = {N}，W = {W}，R = {R}：W + R = {sum} ≤ {N}，最不走运的读集合和写集合一个都不重叠。随机挑读集合，完全错过新值的概率 = C({a}, {R}) ÷ C({N}, {R}) = {num}/{den} = {pct}%。',
    s1safe: 'N = {N}，W = {W}，R = {R}：W + R = {sum} > {N}，任何读集合都至少和写集合重叠 {ov} 个，读到旧值的概率是 0。',
    s1hint: '观察顺序：先固定 N = 5、R = 2，把 W 从 1 拖到 4，看上图青色和橙色从分开到重叠，下图当前格子在 W + R = N + 1 那条斜线处变成深色（0）；再换 N，看斜线跟着移动。滑杆改的是规则，不是数据。',

    s2k: '第 2 步 · 实测',
    s2t: '真的一次次写、一次次读，陈旧读的比例会贴着公式吗？',
    s2e: '这一步要回答：上一步的概率公式在真实的读写序列里成立吗？这里模拟交替进行的 200 次写和读：每次写入随机送到 W 个副本（版本号 +1），紧接着一次读随机问 R 个副本、返回其中最大的版本号；比最新版本小就算一次<strong>陈旧读</strong>。因为每次写入的版本号都比之前大，最新版本只在刚写的那 W 个副本上，所以每次读错过它的概率正是 C(N − W, R) ÷ C(N, R)。下图是陈旧读的累计比例，随次数增加会稳定到这个值附近（<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ 概率与频率页第 2 步：次数越多，频率波动越小</a>）。',
    n2Slider: '副本数 N', w2Slider: '写法定数 W', r2Slider: '读法定数 R',
    play2: '播放 200 次读写', reroll2: '换一组随机数', reset2: '重来',
    s2lgW: '本次写入送到的副本', s2lgR: '本次读问到的副本', s2lgRate: '陈旧读的累计比例（当前这组随机数）', s2lgOld: '之前几组随机数', s2lgTh: '虚线：公式值',
    c2top: '各副本当前的版本号（第 {k} 次）', c2bot: '陈旧读的累计比例（横轴：读的次数）',
    s2readout: '第 {k}/{n} 次：写入 v{v} 送到 {ws}；读问了 {rs}，最高 v{got}（{tag}）。累计陈旧读 {s}/{k} = {pct}%；公式值 {th}%。',
    s2empty: '还没开始。按「播放」开始模拟。公式值 {th}%。',
    s2hint: '观察顺序：先用 N = 5、W = 2、R = 2 播放，看青线先上下乱跳、再逐渐贴近 30% 的虚线；按「换一组随机数」重放几次，灰线是之前的结果，它们都收拢到同一条虚线。再把 W 改成 3（W + R > N），重放，曲线一直贴在 0。',

    s3k: '第 3 步 · 宕机',
    s3t: '读写都要问够多台，机器宕机时还能用吗？',
    s3e: '这一步要回答：为了一致性要求 W + R > N，这会让系统在有机器宕机时多容易拒绝服务？设每个副本在某一时刻以概率 p 宕机，彼此独立。写入要有 W 个副本在线才能成功，读要有 R 个在线；某种操作能成功的概率叫它的<strong>可用性</strong>。这里取刚好满足一致性的 R = N − W + 1。「至少 k 个在线」的概率 = 把恰好 j 个在线的概率 C(N, j)(1 − p)ʲpᴺ⁻ʲ 对 j = k…N 加起来。W 大，写难成功；W 小，R 就大，读难成功：两者此消彼长。下图画的是<strong>不可用概率</strong>（1 − 可用性，纵轴对数刻度，越低越好）。',
    n3Slider: '副本数 N', w3Slider: '写法定数 W（R 自动取 N − W + 1）', p3Slider: '每个副本宕机的概率 p',
    s3lgW: '写不可用的概率', s3lgR: '读不可用的概率', s3lgCur: '当前选择的 W',
    c3: '不可用概率（对数刻度，越低越好），横轴 W',
    s3readout: 'N = {N}，W = {W}，R = {R}，p = {p}%：写可用 {aw}%，读可用 {ar}%。按一年 8760 小时算，约 {hw} 小时写不进、{hr} 小时读不出。',
    s3best: '这个 N 下，让「写、读里较差的那个」最好的 W 是 {best}（多数派）。',
    s3hint: '观察顺序：先固定 p = 10%，把 W 从 1 拖到 N，看青柱（写不可用）一路升高、橙柱（读不可用）一路降低，二者在中间（多数派）相等；再把 p 调大，看所有柱子一起升高，多数派依然是两者兼顾的位置。',

    s4k: '第 4 步 · 网络分区',
    s4t: '网络断成两半，系统还能既一致又可用吗？',
    s4e: '这一步要回答：网络断成互相联系不上的两组时，系统能不能既让两边的客户端都能读写，又保证大家看到同一个余额？这种故障叫<strong>网络分区</strong>：机器都还活着，只是两组之间消息过不去。分区期间只能二选一：<strong>保一致</strong>（常记作 CP）：坚持多数派法定数 W = R = 3，副本凑不够 3 个的一侧拒绝读写；<strong>保可用</strong>（常记作 AP）：两边都在本地直接读写（W = R = 1），等分区修复再按时间戳合并，留下较晚的那次写入（<strong>后写者胜</strong>）。「分区时，一致性和可用性不能兼得」就是 <strong>CAP 定理</strong>说的事；这个结论只在分区真的发生、且两边都有请求时才起作用。本步固定 N = 5：左边客户端先写 200，右边客户端后写 50。',
    kSlider: '分区后左边有几个副本', modeCp: '保一致（W = R = 3）', modeAp: '保可用（W = R = 1）',
    next4: '下一阶段', play4: '全部播放', reset4: '重来',
    s4lgOk: '被接受的写入', s4lgNo: '被拒绝的请求', s4lgCut: '分区（两边互不相通）',
    c4: '分区两侧的副本和余额（第 {s}/{n} 阶段）',
    sideL: '左边', sideR: '右边', refused: '拒绝', lostTag: '写入 {v} 丢失',
    st_split: '网络断开：左边 {l} 个副本，右边 {r} 个，两边互相联系不上。',
    st_writeL_ok: '左边客户端写入 200：成功（左边有 {l} 个副本，够 W = {w}）。', st_writeL_no: '左边客户端写入 200：被拒绝（左边只有 {l} 个副本，凑不够 W = {w}，这一侧不可写）。',
    st_writeR_ok: '右边客户端写入 50：成功（右边有 {r} 个副本，够 W = {w}）。', st_writeR_no: '右边客户端写入 50：被拒绝（右边只有 {r} 个副本，凑不够 W = {w}，这一侧不可写）。',
    st_read: '两边各读一次：左边 {rl}，右边 {rr}。',
    st_readSame: '能读的一侧读到的都是同一个值。', st_readDiff: '两边看到的余额不一样：系统此刻不一致。',
    st_heal_cp: '分区修复：少数派一侧从多数派补齐，5 个副本都是 {final}，没有已确认的写入丢失。代价：分区期间有一侧完全不能读写。',
    st_heal_ap: '分区修复：两次冲突的写入按时间戳合并，留下较晚的 {final}（后写者胜）；左边那次已经告诉客户端「成功」的写入 200 被覆盖丢失。',
    s4hint: '观察顺序：先选「保一致」，把左边设成 2 个副本，一阶段一阶段按，看左边的写和读都被拒绝；再把左边设成 3 个，看换成右边被拒绝。然后选「保可用」重放，看两边都写成功、读到不同的余额，修复后有一次写入消失。',

    s5k: '第 5 步 · 收束',
    s5t: '多份副本像一个值，要付什么代价',
    s5fin: '副本让数据在机器宕机时还在，但写入送不到全部副本，副本就会说法不一。<strong>法定数</strong>把问题变成数数：写等 W 个确认、读问 R 个并取最大版本号，只要 <strong>W + R > N</strong>，读集合一定碰到最新写入；否则读到旧值的概率是 C(N − W, R) ÷ C(N, R)，实测比例也收敛到它。代价是<strong>可用性</strong>：W 越大越难写、R 越大越难读，多数派让两者兼顾。网络<strong>分区</strong>时只能二选一：坚持多数派就让少数派一侧停摆，两边都接受就要在修复时丢掉冲突的写入。',
    formula: '一定读到最新：W + R > N\n读到旧值的概率：C(N − W, R) ÷ C(N, R)\n可用性：P(在线副本 ≥ W)，每台独立宕机概率 p\n分区时：一致（C）与可用（A）二选一',
    boundary: '适用范围：本页的寄存器只有一个值、写入由一个协调者统一编号，所以「最新」就是版本号最大；真实系统里并发写入需要时钟或向量版本来排序。副本之间没有读修复、后台同步（反熵），陈旧副本只会在下次写入时更新，所以本页的陈旧率是上限。W + R > N 保证的是「读到最近一次成功写入」，不等于线性一致性那样更强的保证，也不涉及 Raft、Paxos 这类共识协议。宕机被假设为彼此独立，同一机房断电这类相关故障会让可用性比公式更差。',
    linksTitle: '接着看',
    lk1: '→ 网络传输（Claude 版）第 2 步：靠超时判断「对方没回应」，而慢和断在超时之前分不清',
    lk2: '→ 二项分布页第 0 步：C(N, k) 这种选法数是怎么数出来的',
    lk3: '→ 哈希页第 2 步：数据多到一台放不下时，用指纹决定每个键落到哪台机器',
    lk4: '→ 概率与频率页第 2 步：为什么模拟次数越多，陈旧读的比例越稳',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《分布式系统 · 多个副本如何像一个值》的平行版本。'
  },
  en: {
    pageTitle: 'Distributed Systems · Making Five Copies Tell One Story',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Distributed Systems · How Replicas Behave Like One Value →',
    navLabel: 'Distributed systems steps',
    tagline: 'An account balance is stored on 5 machines so that no single failure loses it. But writes travel over a network that is sometimes slow and sometimes broken, so sooner or later the 5 copies disagree. Step by step: how likely is a stale read, how “ask enough machines on both read and write” drives that to zero, what that costs in availability, and why a network split forces you to pick one of two.',
    nav0: '0 Drift', nav1: '1 Overlap', nav2: '2 Measured', nav3: '3 Failures', nav4: '4 Partitions', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Copies drift apart',
    s0t: 'A write reached only some copies. If you read one at random, do you get the newest value?',
    s0e: 'This step asks: when a write has not reached every copy, what does reading one copy give you? Keeping the same data on several machines gives you <strong>replicas</strong>: if one machine dies, the others survive. Every write carries a <strong>version number</strong> assigned in order by one coordinator, 1, 2, 3 …, so a higher version is newer. A write has to travel over the network to each replica; when the network is slow or broken, some replicas miss it and stay on an older version. Such a replica is <strong>stale</strong>. This page assumes replicas never sync among themselves; they change only when a write reaches them.',
    reachLabel: 'Which replicas this write can reach (click to toggle)',
    reachOn: '{r} reachable', reachOff: '{r} cut off',
    write0: 'Write a new balance', read0: 'Read one replica at random', reset0: 'Start over',
    s0lgNew: 'newest version', s0lgOld: 'stale version', s0lgRead: 'replica just read',
    c0: 'Client writes to 5 replicas (dashed = not delivered)',
    client: 'Client',
    s0state: 'The newest is v{v} = {val}, held by {fresh} of the 5 replicas; reading one replica at random returns an old value with probability {stale}/5.',
    s0read: 'Just read {r}: v{v} = {val} ({tag}). {n} reads so far, {s} of them old values.',
    tagNew: 'newest', tagOld: 'old value',
    s0hint: 'What to watch: let only R1 and R2 be reachable and press “Write a new balance”: three replicas turn stale (orange). Press “Read one replica at random” several times and count the old values. Then make more or fewer replicas reachable, write again, and see the chance of an old value change with it.',

    s1k: 'Step 1 · Overlapping reads and writes',
    s1t: 'How many replicas must a write wait for, and a read ask, to guarantee the newest value?',
    s1e: 'This step asks: you cannot promise that every write reaches all N replicas, so how many replicas should writes and reads involve so that a read is sure to meet the newest value? Say a write counts as done once <strong>W</strong> replicas confirm it (the <strong>write quorum</strong>), and a read asks <strong>R</strong> replicas and keeps the value with the highest version (the <strong>read quorum</strong>). A quorum is simply “the count that makes it count”. The newest write is only guaranteed to sit on some W replicas; a read gets it if any of its R replicas is one of them. To miss all W, a read would have to pick all R replicas from the other N − W, so when <strong>W + R > N</strong> that is impossible and the read always sees the newest value. Otherwise a randomly chosen read set misses it with probability C(N − W, R) ÷ C(N, R), where C(n, k) counts the ways to choose k of n (<a class="xlink" href="../../../probability/basics/binomial-normal/#step0">→ Binomial to Normal, step 0: how to count the choices</a>).',
    nSlider: 'Replicas N', wSlider: 'Write quorum W', rSlider: 'Read quorum R',
    s1lgW: 'the W replicas the write landed on (newest)', s1lgR: 'the unluckiest read set (R replicas)', s1lgBoth: 'overlap', s1lgHeat: 'cell colour: chance of an old value (brighter = higher, dark = 0)',
    c1top: 'One write and the unluckiest read', c1bot: 'Chance of reading an old value (across: W, up: R)',
    s1miss: 'N = {N}, W = {W}, R = {R}: W + R = {sum} ≤ {N}, so the unluckiest read set shares no replica with the write set. A random read set misses the newest value with probability C({a}, {R}) ÷ C({N}, {R}) = {num}/{den} = {pct}%.',
    s1safe: 'N = {N}, W = {W}, R = {R}: W + R = {sum} > {N}, so every read set shares at least {ov} replica(s) with the write set and the chance of an old value is 0.',
    s1hint: 'What to watch: fix N = 5 and R = 2 and drag W from 1 to 4: cyan and orange above move from apart to overlapping, and the current cell below turns dark (0) on the diagonal W + R = N + 1. Then change N and watch the diagonal move. The sliders change the rules, not the data.',

    s2k: 'Step 2 · Measured',
    s2t: 'Write and read for real, again and again: does the stale share follow the formula?',
    s2e: 'This step asks: does the previous step’s probability hold in an actual sequence of reads and writes? Here 200 writes and reads alternate: each write reaches W random replicas (version + 1), and the read right after it asks R random replicas and returns the highest version among them; anything below the newest counts as a <strong>stale read</strong>. Because every write has a higher version than all before it, the newest version lives only on the W replicas just written, so each read misses it with probability exactly C(N − W, R) ÷ C(N, R). The chart shows the running share of stale reads, which settles near that value as the count grows (<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ Probability and Frequency, step 2: more trials, smaller swings</a>).',
    n2Slider: 'Replicas N', w2Slider: 'Write quorum W', r2Slider: 'Read quorum R',
    play2: 'Play 200 write–read pairs', reroll2: 'New random numbers', reset2: 'Start over',
    s2lgW: 'replicas this write reached', s2lgR: 'replicas this read asked', s2lgRate: 'running stale share (current random numbers)', s2lgOld: 'earlier random numbers', s2lgTh: 'dashed: formula value',
    c2top: 'Each replica’s current version (pair {k})', c2bot: 'Running share of stale reads (across: number of reads)',
    s2readout: 'Pair {k}/{n}: write v{v} reached {ws}; the read asked {rs}, highest v{got} ({tag}). Stale reads so far {s}/{k} = {pct}%; formula {th}%.',
    s2empty: 'Not started. Press “Play” to run the simulation. Formula value {th}%.',
    s2hint: 'What to watch: with N = 5, W = 2, R = 2, play: the cyan line jumps about at first, then settles toward the dashed 30% line. Press “New random numbers” and replay a few times; the grey lines are earlier runs, and they all close in on the same dashed line. Then set W to 3 (W + R > N) and replay: the curve stays at 0.',

    s3k: 'Step 3 · Failures',
    s3t: 'If reads and writes must reach enough replicas, does the system still work when machines fail?',
    s3e: 'This step asks: consistency needs W + R > N, so how readily does the system turn requests away when machines are down? Suppose each replica is down at any moment with probability p, independently of the others. A write succeeds only if W replicas are up, a read only if R are up; the chance an operation succeeds is its <strong>availability</strong>. Here R = N − W + 1, the smallest R that keeps reads consistent. The chance that at least k are up is the sum over j = k…N of the chance that exactly j are up, C(N, j)(1 − p)ʲpᴺ⁻ʲ. Large W makes writes hard; small W makes R large and reads hard: one rises as the other falls. The chart shows <strong>unavailability</strong> (1 − availability, log scale, lower is better).',
    n3Slider: 'Replicas N', w3Slider: 'Write quorum W (R is set to N − W + 1)', p3Slider: 'Chance each replica is down, p',
    s3lgW: 'chance writes are unavailable', s3lgR: 'chance reads are unavailable', s3lgCur: 'the W you picked',
    c3: 'Unavailability (log scale, lower is better) across W',
    s3readout: 'N = {N}, W = {W}, R = {R}, p = {p}%: writes available {aw}%, reads available {ar}%. Over a year of 8760 hours that is about {hw} hours without writes and {hr} hours without reads.',
    s3best: 'For this N, the W that makes the worse of the two as good as possible is {best} (a majority).',
    s3hint: 'What to watch: hold p = 10% and drag W from 1 to N: the cyan bars (writes unavailable) climb while the orange bars (reads unavailable) fall, meeting in the middle at the majority. Then raise p: every bar rises, and the majority is still where both are served best.',

    s4k: 'Step 4 · Network partitions',
    s4t: 'When the network splits in two, can the system stay both consistent and available?',
    s4e: 'This step asks: if the network breaks into two groups that cannot reach each other, can clients on both sides keep reading and writing while everyone still sees the same balance? This failure is a <strong>network partition</strong>: every machine is alive, but messages cannot cross between the groups. During a partition you must choose. <strong>Stay consistent</strong> (often labelled CP): keep majority quorums W = R = 3, and the side with fewer than 3 replicas refuses reads and writes. <strong>Stay available</strong> (often labelled AP): both sides read and write locally (W = R = 1), and when the partition heals the copies are merged by timestamp, keeping the later write (<strong>last writer wins</strong>). “During a partition you cannot have both consistency and availability” is what the <strong>CAP theorem</strong> says; it only bites when a partition actually happens and both sides receive requests. Here N = 5: the left client writes 200 first, then the right client writes 50.',
    kSlider: 'Replicas on the left after the split', modeCp: 'Stay consistent (W = R = 3)', modeAp: 'Stay available (W = R = 1)',
    next4: 'Next stage', play4: 'Play all', reset4: 'Start over',
    s4lgOk: 'write accepted', s4lgNo: 'request refused', s4lgCut: 'partition (no messages cross)',
    c4: 'Replicas and balances on each side (stage {s}/{n})',
    sideL: 'Left', sideR: 'Right', refused: 'refused', lostTag: 'write {v} lost',
    st_split: 'The network splits: {l} replicas on the left, {r} on the right, and the two sides cannot reach each other.',
    st_writeL_ok: 'The left client writes 200: accepted (the left has {l} replicas, enough for W = {w}).', st_writeL_no: 'The left client writes 200: refused (the left has only {l} replicas, short of W = {w}, so this side cannot take writes).',
    st_writeR_ok: 'The right client writes 50: accepted (the right has {r} replicas, enough for W = {w}).', st_writeR_no: 'The right client writes 50: refused (the right has only {r} replicas, short of W = {w}, so this side cannot take writes).',
    st_read: 'Each side reads once: left {rl}, right {rr}.',
    st_readSame: 'Every side that can read sees the same value.', st_readDiff: 'The two sides see different balances: right now the system is inconsistent.',
    st_heal_cp: 'The partition heals: the minority side catches up from the majority, all 5 replicas hold {final}, and no confirmed write is lost. The price: one side could neither read nor write during the partition.',
    st_heal_ap: 'The partition heals: the two conflicting writes are merged by timestamp, keeping the later {final} (last writer wins); the left write of 200, already reported to its client as successful, is overwritten and lost.',
    s4hint: 'What to watch: choose “Stay consistent”, put 2 replicas on the left and step through the stages: the left’s write and read are both refused. Put 3 on the left and the right side is refused instead. Then choose “Stay available” and replay: both writes succeed, the sides read different balances, and after healing one write is gone.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'What it costs for many copies to act like one value',
    s5fin: 'Replicas keep data alive when machines fail, but writes that do not reach every replica make the copies disagree. <strong>Quorums</strong> turn the problem into counting: wait for W confirmations on writes, ask R replicas on reads and keep the highest version, and as long as <strong>W + R > N</strong> every read set meets the newest write; otherwise the chance of an old value is C(N − W, R) ÷ C(N, R), and the measured share converges to it. The price is <strong>availability</strong>: larger W makes writing harder, larger R makes reading harder, and a majority serves both. During a network <strong>partition</strong> you must choose: insist on majorities and the minority side stops, or let both sides accept and lose conflicting writes when it heals.',
    formula: 'always newest: W + R > N\nchance of an old value: C(N − W, R) ÷ C(N, R)\navailability: P(replicas up ≥ W), each down independently with p\nduring a partition: consistency (C) or availability (A)',
    boundary: 'Scope: the register here holds one value and one coordinator numbers every write, so “newest” simply means “highest version”; real systems with concurrent writers need clocks or version vectors to order them. There is no read repair or background sync (anti-entropy), so stale replicas update only on the next write and the stale rates here are upper bounds. W + R > N guarantees “see the latest successful write”, which is weaker than linearizability, and nothing here covers consensus protocols such as Raft or Paxos. Failures are assumed independent; correlated ones, such as a whole data centre losing power, make availability worse than the formula.',
    linksTitle: 'Keep going',
    lk1: '→ Network Transfer (Claude edition), step 2: “no reply” is detected by a timeout, and before it fires slow and broken look the same',
    lk2: '→ Binomial to Normal, step 0: how counts like C(N, k) are worked out',
    lk3: '→ Hashing, step 2: when data outgrows one machine, a fingerprint decides which machine each key lands on',
    lk4: '→ Probability and Frequency, step 2: why the stale share steadies as the simulation runs longer',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Distributed Systems · How Replicas Behave Like One Value”.'
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
  if (typeof window.refreshReplLesson === 'function') window.refreshReplLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.REPL_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
