'use strict';
// Special relativity lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '狭义相对论 · 光速不让步，时间只好让步',
    back: '← 知识索引',
    compare: '对照另一版本：狭义相对论 · 同时性的线倾斜了 →',
    navLabel: '狭义相对论步骤导航',
    tagline: '实验一再证实：不管你自己怎么运动，测到的光速都是同一个值 c。只要接受这一条，运动的钟就必须走慢，「同时」就会因人而异，速度也再加不过光速。八步里，你会从一只光钟出发，用时空图把这些后果一一画出来，再拿缪子、双生子和电子加速器去核对。',
    nav0: '0 光钟', nav1: '1 时空图', nav2: '2 同时性', nav3: '3 缪子', nav4: '4 双生子', nav5: '5 速度相加', nav6: '6 能量', nav7: '7 收束',
    play: '播放', pause: '暂停', resetCount: '重新计数',

    s0k: '第 0 步 · 最简单的钟',
    s0t: '光速对谁都一样，那运动的钟走得多快？',
    s0e: '这一步要回答：如果光速对每个观察者都是同一个值 c，一只运动的钟在地面看来走得多快？<strong>光钟</strong>是最简单的钟：两面相距 L 的镜子，光在中间来回一趟算一次「嘀嗒」。下图两只一模一样的光钟（L = 15 cm，静止时一次嘀嗒 1 ns），一只停在原地，一只以速度 v 向右运动，全部按地面的视角画。<strong>β</strong> = v/c，表示速度是光速的几分之几。运动钟里的光要走斜线：竖直方向仍是 L，水平方向还得跟上镜子。光速不变而路更长，一次嘀嗒就更久。用勾股定理算出：一次嘀嗒的时长 = γ × 静止时的时长，<strong>γ</strong> = 1/√(1 − β²)，叫洛伦兹因子，总是 ≥ 1。这个结论不靠光钟的构造：任何钟和它并排运动都得一起变慢，否则车上的人就能靠比较两只钟测出自己的速度。',
    sBeta: '速度 β = v/c',
    lg0Rest: '静止的光钟', lg0Move: '运动的光钟', lg0Trail: '光走过的路径',
    c0a: '静止的钟（地面看）', c0b: '以 β 向右运动的钟（地面看）',
    s0readout: 'β = {b}：γ = {g}。静止钟一次嘀嗒 {t0} ns；运动钟在地面看来一次嘀嗒 {t1} ns。运动钟每次嘀嗒向右漂移 {drift} cm，光走的单程斜线长 {diag} cm（竖直距离仍是 15 cm）。计数：静止钟 {n0} 次，运动钟 {n1} 次（比值 {ratio}）。',
    s0hint: '观察顺序：先保持 β = 0 按「播放」，两只钟同步嘀嗒。再把 β 拖到 0.6：运动钟里的光走出锯齿形的斜线（轨迹会保留），它的计数开始落后，两个计数之比趋近 γ = 1.25。β 越接近 1，斜线越平越长，运动钟几乎停摆。动画是放慢的：真实的一次嘀嗒只有 1 ns。改 β 会重新计数。',

    s1k: '第 1 步 · 把时间也画成一根轴',
    s1t: '同一件事，两个观察者会记下什么坐标？',
    s1e: '这一步要回答：地面观察者和以 β 运动的观察者，给同一个<strong>事件</strong>（某时某地发生的一件事，比如一盏灯闪了一下）记下的坐标有什么关系？<strong>时空图</strong>的横轴是位置 x，纵轴是 ct（时间乘光速，和 x 同单位）；本页距离用光秒、时间用秒，于是 c = 1（<a class="xlink" href="../../../physics/mechanics/velocity-vt/#step0">→ 速度–时间页第 0 步：位置–时间图怎样记录一场赛跑</a>）。一个物体的全部历史画成一条线，叫<strong>世界线</strong>：静止物体是竖线，光是 45° 斜线（黄色虚线）。运动观察者把自己的世界线当时间轴 ct′，它向光线倾斜；他的「同一时刻」线（x′ 轴）也向光线倾斜，倾斜程度相同。两套坐标用<strong>洛伦兹变换</strong>换算：x′ = γ(x − β·ct)，ct′ = γ(ct − β·x)。有一个量两人算出来一样，叫<strong>时空间隔</strong> s² = (ct)² − x²：s² &gt; 0 是类时（光有时间从一件事走到另一件，可以有因果联系），s² &lt; 0 是类空（光都赶不及）。',
    sBeta1: '运动观察者的速度 β', sX: '事件 B 的位置 x（光秒）', sCt: '事件 B 的时刻 ct（光秒）',
    lg1Ground: '地面的坐标格', lg1Move: '运动观察者的 ct′、x′ 轴与坐标格', lg1Light: '光的世界线（45°）', lg1Hyp: '间隔相同的点（双曲线）', lg1B: '事件 B',
    c1: '时空图（c = 1）　横轴 x / 光秒，纵轴 ct / 光秒',
    s1readout: '事件 B：地面坐标 (x, ct) = ({x}, {ct})；运动观察者（β = {b}，γ = {g}）记为 (x′, ct′) = ({xp}, {ctp})。间隔 s² = {s1}（地面算）= {s2}（运动者算），{kind}',
    kindTime: '类时：每个观察者都认为 B 在原点事件之后发生。', kindSpace: '类空：先后顺序取决于观察者，换个 β，ct′ 可以变成负的。', kindLight: '类光：B 正好在原点发出的光线上。',
    s1hint: '观察顺序：先把 B 放在 (1, 3)，拖动 β：青色的坐标格像剪刀一样合拢或张开，B 的 ct′、x′ 读数都在变，但 B 始终落在同一条白色双曲线上，读数里的 s² 一点不变。再把 B 拖到光线下方（比如 (3, 1)）：这时拖 β，ct′ 会在 0 上下变号，即两件事谁先谁后没有定论。',

    s2k: '第 2 步 · 同时性',
    s2t: '车厢正中闪一下灯，光会同时到达两端吗？',
    s2e: '这一步要回答：一节车厢（它自己量是 L = 4 光秒长）以 β 向右开，正中间的灯闪一下。车上的人说：光以同样的速度向两端走同样的距离，所以同时到达车尾和车头。地面的人看到的是什么？上方的条带是地面在时刻 t 看到的车厢，下方的时空图记录全部历史：两条青线是车尾和车头的世界线，黄色虚线是两束光。光在 A 处追上车尾，在 B 处追上车头。在地面看，车尾迎着光跑来，A 先发生；车头往前跑，光要多追一段，B 晚了 Δt = γβL 才发生。（地面量到的车厢只有 L/γ 长，这是长度收缩，第 3 步会再遇到。）车上的「同一时刻」线是穿过 A、B 的那条斜线（青色虚线），所以对车上的人 A、B 同时；地面的「同一时刻」线是水平的。两方都没有错：<strong>同时性是相对的</strong>，取决于观察者怎样运动。',
    sBeta2: '车厢速度 β', sT2: '地面时刻 t（秒）',
    lg2Car: '车尾与车头的世界线', lg2Light: '两束光', lg2Now: '车上的「同一时刻」线（过 A、B）', lg2Ground: '地面的此刻（水平线）',
    c2strip: '地面在时刻 t 看到的车厢', c2: '时空图（c = 1）　横轴 x / 光秒，纵轴 ct / 光秒',
    s2readout: 'β = {b}，γ = {g}。地面看：车厢长 {Lg} 光秒；光在 t = {tA} s 追上车尾（A），在 t = {tB} s 追上车头（B），相差 {dt} s = γβL。车上看：A、B 都发生在 ct′ = {tp} s，是同时的。当前地面时刻 t = {t} s：{status}',
    stBoth: '两束光都还在路上。', stRear: '向后的光已经到达车尾，向前的光还在追车头。', stDone: '两束光都已到达。',
    s2hint: '观察顺序：先保持 β = 0，拖地面时刻 t（或按「播放」）：两束光同时到达两端，A、B 在同一条水平线上。再把 β 拖到 0.6，从 t = 0 重新拖：条带里车尾先撞上光，车头那束光过了好一会儿才追上；时空图里 A 比 B 低，但两者落在一条倾斜的青色虚线上，那就是车上的「同一时刻」。',

    s3k: '第 3 步 · 来自高空的证据',
    s3t: '平均寿命只有 2.2 微秒的缪子，怎么飞得到地面？',
    s3e: '这一步要回答：宇宙射线在约 15 km 高空撞出<strong>缪子</strong>（μ 子，一种比电子重约 207 倍的带电粒子）。静止缪子的<strong>平均寿命</strong> τ = 2.2 µs：每过 τ，剩下的缪子数降为原来的 1/e ≈ 37%。就算以光速飞，τ 也只够走 {ctau} m，可地面探测器一直能记到大量缪子（海平面约每平方厘米每分钟 1 个）。为什么？上图是存活比例随下落距离的变化：橙色虚线不考虑相对论，青线考虑。地面的解释：缪子的钟走慢 γ 倍，平均寿命变成 γτ。缪子自己的解释：它的钟一切正常，但迎面而来的大气层被压成 15 km/γ 厚，这叫<strong>长度收缩</strong>：运动物体沿运动方向的长度缩短为 1/γ。下图画出两种视角，它们算出的存活比例完全相同。',
    sBeta3: '缪子速度 β',
    lg3Cl: '不考虑相对论', lg3Rel: '考虑相对论', lg3Atm: '要穿过的大气（按各自视角的长度）',
    c3: '存活比例　横轴 已下落的距离 / km（地面量）', c3g: '地面视角：大气厚 15 km，缪子的钟慢 γ 倍', c3m: '缪子视角：大气迎面而来，被压成 {h} km',
    s3readout: 'β = {b}，γ = {g}。飞行时间：地面的钟 {tg} µs，缪子自己的钟 {tm} µs。到达地面的存活比例：不考虑相对论 {pc}；地面视角（寿命 γτ = {gt} µs）{pg}；缪子视角（大气厚 {hm} km）{pm}。',
    s3hint: '观察顺序：先把速度拖到 0.9：青线也很快趋近 0。再慢慢拖向 0.9995：青线越来越平，橙色虚线却始终贴着 0（读数里是 10⁻¹¹ 这样的数量级）。看下图：地面视角的大气条长度不变，缪子视角的被压短；读数里两个视角的存活比例始终相等。',

    s4k: '第 4 步 · 双生子',
    s4t: '去一趟几光年外再回来，谁更年轻？',
    s4e: '这一步要回答：双胞胎一个留在地球，一个乘飞船以速度 β 飞到 D 光年外，立刻掉头回来。重逢时各自老了多少？沿一条世界线走，随身的钟走过的时间叫<strong>固有时</strong>：把每一小段的 √((Δct)² − (Δx)²) 加起来。地球的世界线是竖线，固有时就是 ct；飞船走折线，每一段的固有时只有地面时间的 1/γ。图上每个刻度是这个人自己的钟走过 1 年。看上去两人对称（飞船上的人也看见地球在动），为什么不是地球上的人更年轻？因为飞船掉了头：去程、回程是两个不同的惯性系（不受力、匀速直线运动的参照系），各有一条「同一时刻」线（青色虚线）。掉头的一瞬，飞船的「同一时刻」在地球世界线上跳过一大段，差距就藏在这一段里。',
    sD: '目的地距离 D（光年）', playTrip: '播放旅程', showAll: '显示全程',
    lg4Earth: '地球（每格 1 年）', lg4Ship: '飞船（每格 1 年）', lg4Now: '飞船掉头前后的「同一时刻」线', lg4Light: '光线（45°）',
    c4: '时空图（c = 1）　横轴 x / 光年，纵轴 ct / 年', c4bars: '各自的钟走过的年数', barEarth: '地球', barShip: '飞船',
    s4readout: '地球上过了 {te} 年，飞船上过了 {tt} 年，少 {diff} 年。对账：飞船在去程看地球，自己过了 {leg} 年，地球的钟慢 γ 倍只走 {earthLeg} 年，回程同样；掉头时「同一时刻」线在地球上从 {nowOut} 年跳到 {nowIn} 年，跳过 {jump} 年。{earthLeg} × 2 + {jump} = {te} 年，和地球自己的钟一致。',
    s4progress: '旅程进度：地球时间 {t} / {te} 年。',
    s4hint: '观察顺序：用默认的 β = 0.8、D = 4 按「播放旅程」：飞船折线上的刻度比地球竖线上的稀，到重逢时飞船只走了 6 格、地球走了 10 格。再看两条青色虚线：它们和地球竖线的交点相距很远，那就是掉头时跳过的地球时间。然后拖 β：越接近 1，差距越大。',

    s5k: '第 5 步 · 速度相加',
    s5t: '飞船上再往前发射一个探测器，速度能叠加过光速吗？',
    s5e: '这一步要回答：飞船相对地面以 v 飞行，向前发射一个探测器，探测器相对飞船的速度是 w。地面测到探测器的速度 u 是多少？日常经验说 u = v + w，但那样 0.6c + 0.6c = 1.2c，超过了光速。由洛伦兹变换推出的答案是 <strong>u = (v + w)/(1 + vw/c²)</strong>。图的横轴是 w，纵轴是 u（都以 c 为单位）：橙色虚线是直接相加，青线是相对论的结果。v、w 都远小于 c 时，分母约等于 1，两者重合；w = c（发射的是光）时，不管 v 多大，u 都恰好是 c，这正是光速不变（对照：<a class="xlink" href="../../../physics/waves/doppler-effect/#step1">→ 多普勒页第 1 步：声速也不随声源速度叠加，声源动起来只改变波前间距</a>）。',
    sV: '飞船速度 v（以 c 为单位）', sW: '探测器相对飞船的速度 w',
    lg5Naive: '直接相加 v + w', lg5Rel: '相对论 (v + w)/(1 + vw)', lg5Limit: '光速 u = 1', lg5Trail: '试过的 w',
    c5: '地面测到的速度 u（以 c 为单位）　横轴 w',
    s5readout: 'v = {v}c，w = {w}c：直接相加得 {naive}c{over}；相对论 u = {u}c，比直接相加少 {diff}c。',
    over: '（超过光速）',
    s5hint: '观察顺序：先把 v、w 都拖到 0.05：两条线几乎重合，差别只在小数点后第四位（日常速度下直接相加足够准）。再把 v 拖到 0.6，把 w 从 0 一路拖到 1：橙色虚线很早就越过 u = 1，青线弯下来，在 w = 1 处正好碰到 1。换任何 v 都一样。',

    s6k: '第 6 步 · 能量',
    s6t: '不停给电子加能量，它能被推过光速吗？',
    s6e: '这一步要回答：用加速器不断给电子加<strong>动能</strong> K（运动带来的能量），它会一直变快、直到超过光速吗？牛顿力学说 K = ½mv²，速度可以无限增大，K 到 {kc} MeV 时 v 就等于 c（<a class="xlink" href="../../../physics/mechanics/mechanical-energy/#step5">→ 机械能页第 5 步：动能随速度平方增长</a>）。相对论里动能是 K = (γ − 1)mc²，其中 mc² 是电子的<strong>静能</strong>，{me} MeV（1 MeV 是一个电子被一百万伏电压加速后得到的能量）。β → 1 时 γ → ∞，要无限多的能量。图的横轴是动能 K（对数刻度，每格 10 倍），纵轴是速度 β：橙色虚线是牛顿的预测，青线是相对论。1964 年 Bertozzi 用飞行时间法测过 0.5–15 MeV 电子的速度，结果沿着青线贴近光速，而不是沿着橙线冲过去。',
    sK: '电子动能 K（MeV，对数刻度）',
    lg6Cl: '牛顿 ½mv²', lg6Rel: '相对论 (γ − 1)mc²', lg6Limit: '光速 β = 1', lg6Now: '当前能量',
    c6: '速度 β　横轴 动能 K / MeV（对数刻度）',
    s6readout: 'K = {K} MeV = {km} mc²：相对论 β = {br}（γ = {g}）；牛顿 β = {bc}{over}。能量再加 10 倍（{K10} MeV），相对论 β 只到 {b10}。',
    s6hint: '观察顺序：从 0.01 MeV 开始往右拖：两条线起初几乎重合（差不到 2%）。到 0.1 MeV 时两者已差一成以上；到 {kc} MeV，牛顿的预测撞上 β = 1，之后进入不可能的区域；青线越来越贴近 1，却永远差一点。',

    s7k: '第 7 步 · 收束', s7t: '一条公设，八个后果',
    s7fin: '回顾。<strong>第 0 步</strong>：光速不变 ⇒ 运动的钟慢 γ 倍。<strong>第 1 步</strong>：时空图里，运动观察者的坐标轴向光线合拢；坐标会变，间隔 s² 不变。<strong>第 2 步</strong>：「同时」的线也跟着倾斜，同时性因观察者而异。<strong>第 3 步</strong>：缪子活着到达地面；地面说是钟慢，缪子说是距离短，两种说法给出同一个数。<strong>第 4 步</strong>：掉头的那一方更年轻，差距藏在「同一时刻」线的跳变里。<strong>第 5 步</strong>：速度不能直接相加，光速是上限。<strong>第 6 步</strong>：越接近光速，加速越贵，能量趋于无穷。',
    gps: '一个每天都在用的例子：GPS 卫星以约 {v} km/s 绕地球运行。只算狭义相对论，它的钟每天比地面慢 {us} µs；光 1 µs 走约 300 m，不校正的话，测距误差每天会累积约 {km} km。（引力造成的广义相对论效应更大、方向相反，本页不讲；实际系统把两者一起校正。）',
    formula: 'γ = 1 / √(1 − β²)\nx′ = γ(x − β·ct)，ct′ = γ(ct − β·x)\nu = (v + w) / (1 + vw/c²)\nK = (γ − 1)mc²',
    boundary: '适用范围：狭义相对论只处理惯性观察者，本页只用一个空间维度。双生子的掉头被理想化为瞬间完成；掉头时的加速度本身不改变结论，因为固有时只取决于世界线。缪子用单一速度和 15 km 的产生高度，不计能量损失和速度分布。GPS 只算了狭义相对论的那一部分，轨道取圆轨道半径 26 560 km。',
    linksTitle: '接着去看',
    lk1: '→ 速度–时间页第 0 步：位置–时间图，时空图的前身',
    lk2: '→ 多普勒效应第 1 步：波速不随源速叠加，源动只改变波前间距',
    lk3: '→ 机械能第 5 步：低速时 ½mv² 仍然好用',
    lk4: '→ 抛体与圆周第 5 步：轨道高度怎样决定卫星速度',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《狭义相对论 · 同时性的线倾斜了》的平行版本。'
  },
  en: {
    pageTitle: 'Special Relativity · Light Won’t Give Way, So Time Does',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Special Relativity · The Lines of “Now” Tilt →',
    navLabel: 'Special relativity steps',
    tagline: 'Experiment after experiment says the same thing: however you yourself are moving, you measure the same speed of light, c. Accept that one fact and moving clocks must run slow, “at the same time” must depend on who is asking, and speeds can no longer add up past light. In eight steps you will start from a light clock, draw each consequence on a spacetime diagram, and check it against muons, twins and an electron accelerator.',
    nav0: '0 Light clock', nav1: '1 Spacetime', nav2: '2 Simultaneity', nav3: '3 Muons', nav4: '4 Twins', nav5: '5 Adding speeds', nav6: '6 Energy', nav7: '7 Wrap-up',
    play: 'Play', pause: 'Pause', resetCount: 'Restart the count',

    s0k: 'Step 0 · The simplest clock',
    s0t: 'If light has the same speed for everyone, how fast does a moving clock run?',
    s0e: 'The question here: if every observer measures the same speed of light c, how fast does a moving clock run as seen from the ground? A <strong>light clock</strong> is the simplest clock there is: two mirrors a distance L apart, with one round trip of light counting as one “tick”. Below are two identical light clocks (L = 15 cm, so one tick takes 1 ns at rest); one stays put and one moves right at speed v, both drawn as seen from the ground. <strong>β</strong> = v/c is the speed as a fraction of light speed. Light in the moving clock has to travel on a slant: still L vertically, but it must also keep up with the mirrors sideways. Same speed, longer path, so each tick takes longer. Pythagoras gives: tick duration = γ × the tick at rest, where <strong>γ</strong> = 1/√(1 − β²) is the Lorentz factor, always ≥ 1. Nothing here depends on how a light clock is built: any clock riding along must slow down with it, or someone on board could compare the two clocks and work out their own speed.',
    sBeta: 'Speed β = v/c',
    lg0Rest: 'Light clock at rest', lg0Move: 'Moving light clock', lg0Trail: 'Path the light has travelled',
    c0a: 'Clock at rest (ground view)', c0b: 'Clock moving right at β (ground view)',
    s0readout: 'β = {b}: γ = {g}. The resting clock ticks every {t0} ns; seen from the ground the moving clock ticks every {t1} ns. Each tick the moving clock drifts {drift} cm to the right, and each slanted leg of light is {diag} cm long (still 15 cm vertically). Count: resting clock {n0} ticks, moving clock {n1} (ratio {ratio}).',
    s0hint: 'What to try: with β = 0 press “Play”: the two clocks tick together. Now drag β to 0.6: the light in the moving clock traces a zigzag of slanted lines (the trail stays on screen), its count falls behind, and the ratio of the counts closes in on γ = 1.25. The closer β gets to 1, the flatter and longer the slants, and the moving clock nearly stops. The animation is slowed down: a real tick lasts 1 ns. Changing β restarts the count.',

    s1k: 'Step 1 · Draw time as an axis too',
    s1t: 'Two observers, one event: what coordinates does each write down?',
    s1e: 'The question here: how do the coordinates that a ground observer and an observer moving at β give to the same <strong>event</strong> (something that happens at one place and one time, such as a lamp flashing) relate to each other? A <strong>spacetime diagram</strong> has position x across and ct up (time multiplied by the speed of light, in the same unit as x); here distance is in light-seconds and time in seconds, so c = 1 (<a class="xlink" href="../../../physics/mechanics/velocity-vt/#step0">→ Velocity–time, step 0: how a position–time graph records a race</a>). An object’s whole history is a line, its <strong>world line</strong>: something at rest is vertical, light runs at 45° (yellow dashed). The moving observer uses their own world line as the time axis ct′, which leans towards the light line; their line of “same moment” (the x′ axis) leans towards it by the same amount. The <strong>Lorentz transformation</strong> converts between them: x′ = γ(x − β·ct), ct′ = γ(ct − β·x). One quantity comes out the same for both, the <strong>spacetime interval</strong> s² = (ct)² − x². With s² &gt; 0 the separation is timelike (light has time to get from one event to the other, so one can cause the other); with s² &lt; 0 it is spacelike (not even light can make it).',
    sBeta1: 'Moving observer’s speed β', sX: 'Event B position x (light-seconds)', sCt: 'Event B time ct (light-seconds)',
    lg1Ground: 'Ground coordinate grid', lg1Move: 'Moving observer’s ct′ and x′ axes and grid', lg1Light: 'Light world lines (45°)', lg1Hyp: 'Points with the same interval (hyperbola)', lg1B: 'Event B',
    c1: 'Spacetime (c = 1): x across, ct up, in light-seconds',
    s1readout: 'Event B: ground coordinates (x, ct) = ({x}, {ct}); the moving observer (β = {b}, γ = {g}) writes (x′, ct′) = ({xp}, {ctp}). Interval s² = {s1} (ground) = {s2} (moving), {kind}',
    kindTime: 'timelike: every observer agrees that B happens after the event at the origin.', kindSpace: 'spacelike: the order depends on the observer; change β and ct′ can turn negative.', kindLight: 'lightlike: B sits exactly on a light ray from the origin.',
    s1hint: 'What to try: put B at (1, 3) and drag β. The cyan grid closes and opens like scissors and B’s readings ct′ and x′ change, yet B stays on the same white hyperbola and s² in the readout does not budge. Then move B below the light line, say to (3, 1): now dragging β makes ct′ flip sign around 0, so which event came first has no single answer.',

    s2k: 'Step 2 · Simultaneity',
    s2t: 'A lamp flashes in the middle of a train car. Does the light reach both ends at once?',
    s2e: 'The question here: a train car (L = 4 light-seconds long by its own measure) moves right at β, and a lamp at its middle flashes. The passengers say: the light goes the same distance at the same speed both ways, so it reaches the rear and the front at the same time. What does the ground see? The strip at the top shows the car as the ground sees it at time t; the spacetime diagram below records the whole history. The two cyan lines are the world lines of the rear and the front, and the yellow dashed lines are the two flashes of light. Light catches the rear at A and the front at B. From the ground, the rear runs into its light, so A happens first; the front runs away from its light, which needs longer to catch up, so B comes Δt = γβL later. (The ground measures the car as only L/γ long; that is length contraction, which comes back in step 3.) The passengers’ line of “same moment” is the slanted line through A and B (cyan dashed), so for them A and B are simultaneous; for the ground the line of “same moment” is horizontal. Nobody is wrong: <strong>simultaneity is relative</strong>, it depends on how the observer moves.',
    sBeta2: 'Car speed β', sT2: 'Ground time t (s)',
    lg2Car: 'World lines of the rear and front', lg2Light: 'The two flashes', lg2Now: 'Passengers’ “same moment” line (through A, B)', lg2Ground: 'The ground’s “now” (horizontal)',
    c2strip: 'The car as the ground sees it at time t', c2: 'Spacetime (c = 1): x across, ct up, in light-seconds',
    s2readout: 'β = {b}, γ = {g}. From the ground: the car is {Lg} light-seconds long; light catches the rear (A) at t = {tA} s and the front (B) at t = {tB} s, {dt} s apart = γβL. On board: A and B both happen at ct′ = {tp} s, simultaneously. Current ground time t = {t} s: {status}',
    stBoth: 'both flashes are still on their way.', stRear: 'the backward flash has reached the rear; the forward one is still chasing the front.', stDone: 'both flashes have arrived.',
    s2hint: 'What to try: keep β = 0 and drag the ground time t (or press “Play”): both flashes reach the ends together, and A and B sit on one horizontal line. Then drag β to 0.6 and sweep t from 0 again: in the strip the rear hits its light first and the forward flash takes a good while longer to catch the front; in the diagram A is lower than B, yet both lie on one slanted cyan dashed line, the passengers’ “same moment”.',

    s3k: 'Step 3 · Evidence from the sky',
    s3t: 'Muons live only 2.2 microseconds on average. How do they reach the ground?',
    s3e: 'The question here: cosmic rays make <strong>muons</strong> (charged particles about 207 times heavier than electrons) some 15 km up. A muon at rest has a <strong>mean lifetime</strong> τ = 2.2 µs: every τ, the number still around drops to 1/e ≈ 37%. Even at light speed τ is only enough for {ctau} m, yet detectors on the ground keep counting plenty of muons (about one per square centimetre per minute at sea level). Why? The top plot shows the surviving fraction against distance fallen: the orange dashed line ignores relativity, the cyan line includes it. The ground’s explanation: the muon’s clock runs γ times slow, so its mean lifetime becomes γτ. The muon’s own explanation: its clock is perfectly normal, but the atmosphere rushing at it is squashed to 15 km/γ. That is <strong>length contraction</strong>: a moving object is shorter by a factor γ along its motion. The bars below show both views, and both give exactly the same surviving fraction.',
    sBeta3: 'Muon speed β',
    lg3Cl: 'Without relativity', lg3Rel: 'With relativity', lg3Atm: 'Atmosphere to cross (length in each view)',
    c3: 'Surviving fraction   distance fallen / km (ground measure)', c3g: 'Ground view: 15 km of air, the muon’s clock runs γ times slow', c3m: 'Muon view: the air rushes in, squashed to {h} km',
    s3readout: 'β = {b}, γ = {g}. Flight time: {tg} µs on the ground’s clock, {tm} µs on the muon’s own clock. Fraction reaching the ground: without relativity {pc}; ground view (lifetime γτ = {gt} µs) {pg}; muon view ({hm} km of air) {pm}.',
    s3hint: 'What to try: drag the speed to 0.9 first: the cyan line also drops towards 0 quickly. Then ease it towards 0.9995: the cyan line flattens out, while the orange dashed line stays glued to 0 (the readout puts it around 10⁻¹¹). In the bars below, the atmosphere stays the same length in the ground view and shrinks in the muon view; in the readout the two views always give the same surviving fraction.',

    s4k: 'Step 4 · The twins',
    s4t: 'A round trip to a star a few light-years away: who comes back younger?',
    s4e: 'The question here: of two twins, one stays on Earth and one flies at speed β to a point D light-years away and turns straight round. How much has each aged when they meet again? The time ticked off by a clock carried along a world line is its <strong>proper time</strong>: add up √((Δct)² − (Δx)²) over every little piece. Earth’s world line is vertical, so its proper time is just ct; the ship’s is a bent line, and each leg’s proper time is only 1/γ of the ground time. Each tick mark is one year on that twin’s own clock. The set-up looks symmetric (the traveller sees Earth moving too), so why isn’t the Earth twin the younger one? Because the ship turns round: the outward and return legs are two different inertial frames (frames that feel no force and move in a straight line at constant speed), each with its own “same moment” line (cyan dashed). At the turn, the ship’s “same moment” sweeps over a long stretch of Earth’s world line in an instant, and that stretch is where the difference hides.',
    sD: 'Distance D (light-years)', playTrip: 'Play the trip', showAll: 'Show the whole trip',
    lg4Earth: 'Earth (one mark per year)', lg4Ship: 'Ship (one mark per year)', lg4Now: 'Ship’s “same moment” just before and after turning', lg4Light: 'Light lines (45°)',
    c4: 'Spacetime (c = 1): x / light-years, ct / years', c4bars: 'Years on each twin’s own clock', barEarth: 'Earth', barShip: 'Ship',
    s4readout: 'On Earth {te} years pass; on the ship {tt} years, {diff} fewer. The books balance: on the way out the traveller ages {leg} years and sees Earth’s clock run γ times slow, so only {earthLeg} years pass there, and the same on the way back; at the turn the “same moment” line jumps along Earth’s world line from year {nowOut} to year {nowIn}, skipping {jump} years. {earthLeg} × 2 + {jump} = {te} years, matching Earth’s own clock.',
    s4progress: 'Trip progress: Earth time {t} / {te} years.',
    s4hint: 'What to try: with the defaults β = 0.8, D = 4 press “Play the trip”. The tick marks on the ship’s bent line are spaced wider than on Earth’s vertical line; at the reunion the ship has 6 marks and Earth 10. Then look at the two cyan dashed lines: where they cross Earth’s line they are far apart, and that gap is the Earth time skipped at the turn. Then drag β: the closer to 1, the bigger the difference.',

    s5k: 'Step 5 · Adding speeds',
    s5t: 'Launch a probe forward from a moving ship. Can the speeds add up past light?',
    s5e: 'The question here: a ship flies at v relative to the ground and launches a probe forward at w relative to the ship. What speed u does the ground measure for the probe? Everyday experience says u = v + w, but then 0.6c + 0.6c = 1.2c, faster than light. The Lorentz transformation gives <strong>u = (v + w)/(1 + vw/c²)</strong>. The plot has w across and u up (both in units of c): the orange dashed line simply adds, the cyan line is relativity. When v and w are both much smaller than c the denominator is about 1 and the two agree; when w = c (the ship sends out light), u is exactly c whatever v is, which is just the constancy of light speed (compare <a class="xlink" href="../../../physics/waves/doppler-effect/#step1">→ Doppler effect, step 1: sound doesn’t pick up the source’s speed either; a moving source only changes the spacing of the wavefronts</a>).',
    sV: 'Ship speed v (in units of c)', sW: 'Probe speed relative to the ship, w',
    lg5Naive: 'Simple sum v + w', lg5Rel: 'Relativity (v + w)/(1 + vw)', lg5Limit: 'Light speed u = 1', lg5Trail: 'Values of w you tried',
    c5: 'Speed measured from the ground u (units of c)   w across',
    s5readout: 'v = {v}c, w = {w}c: simply adding gives {naive}c{over}; relativity gives u = {u}c, {diff}c less than the simple sum.',
    over: ' (faster than light)',
    s5hint: 'What to try: set both v and w to 0.05: the two lines practically coincide, differing only in the fourth decimal place (at everyday speeds plain adding is plenty accurate). Then set v to 0.6 and drag w from 0 all the way to 1: the orange dashed line crosses u = 1 early on, the cyan line bends over and touches 1 exactly at w = 1. Any v does the same.',

    s6k: 'Step 6 · Energy',
    s6t: 'Keep giving an electron energy. Can it be pushed past light speed?',
    s6e: 'The question here: if an accelerator keeps adding <strong>kinetic energy</strong> K (the energy of motion) to an electron, does it keep speeding up until it beats light? Newtonian mechanics says K = ½mv², so speed can grow without limit, and v reaches c at K = {kc} MeV (<a class="xlink" href="../../../physics/mechanics/mechanical-energy/#step5">→ Mechanical energy, step 5: kinetic energy grows with the square of speed</a>). In relativity the kinetic energy is K = (γ − 1)mc², where mc² is the electron’s <strong>rest energy</strong>, {me} MeV (1 MeV is what one electron gains across a million volts). As β → 1, γ → ∞: it would take infinite energy. The plot has kinetic energy K across (log scale, ×10 per grid line) and speed β up: orange dashed is Newton’s prediction, cyan is relativity. In 1964 Bertozzi timed electrons of 0.5–15 MeV over a flight path, and their speeds crept up to light speed along the cyan line instead of shooting past it along the orange one.',
    sK: 'Electron kinetic energy K (MeV, log scale)',
    lg6Cl: 'Newton ½mv²', lg6Rel: 'Relativity (γ − 1)mc²', lg6Limit: 'Light speed β = 1', lg6Now: 'Current energy',
    c6: 'Speed β   kinetic energy K / MeV across (log scale)',
    s6readout: 'K = {K} MeV = {km} mc²: relativity gives β = {br} (γ = {g}); Newton gives β = {bc}{over}. Ten times more energy ({K10} MeV) only takes the relativistic β to {b10}.',
    s6hint: 'What to try: start at 0.01 MeV and drag right. At first the two lines nearly coincide (under 2% apart). By 0.1 MeV they already differ by more than 10%; at {kc} MeV Newton’s prediction hits β = 1 and then runs into impossible territory, while the cyan line hugs 1 ever more closely without ever reaching it.',

    s7k: 'Step 7 · Wrap-up', s7t: 'One postulate, eight consequences',
    s7fin: 'The thread. <strong>Step 0</strong>: constant light speed ⇒ moving clocks run slow by γ. <strong>Step 1</strong>: on a spacetime diagram the moving observer’s axes close in on the light line; coordinates change, the interval s² does not. <strong>Step 2</strong>: the line of “same moment” tilts too, so simultaneity depends on the observer. <strong>Step 3</strong>: muons reach the ground alive; the ground blames slow clocks, the muon blames a short trip, and both get the same number. <strong>Step 4</strong>: the twin who turns round comes back younger, and the difference hides in the jump of the “same moment” line. <strong>Step 5</strong>: speeds don’t simply add; light speed is the ceiling. <strong>Step 6</strong>: the closer to light speed, the dearer each bit of speed, with energy heading to infinity.',
    gps: 'An everyday example: GPS satellites orbit Earth at about {v} km/s. Counting special relativity alone, their clocks fall behind ground clocks by {us} µs a day; light covers about 300 m per µs, so uncorrected range errors would build up by about {km} km a day. (Gravity’s general-relativistic effect is larger and in the opposite direction; it is not covered here, and the real system corrects for both together.)',
    formula: 'γ = 1 / √(1 − β²)\nx′ = γ(x − β·ct), ct′ = γ(ct − β·x)\nu = (v + w) / (1 + vw/c²)\nK = (γ − 1)mc²',
    boundary: 'Scope: special relativity deals with inertial observers, and this page uses a single space dimension. The twin’s turn is idealised as instant; the acceleration during the turn does not change the result, because proper time depends only on the world line. The muons have one speed and a 15 km production height, with no energy loss or speed spread. The GPS figure is the special-relativity part only, for a circular orbit of radius 26 560 km.',
    linksTitle: 'Where to go next',
    lk1: '→ Velocity–time, step 0: the position–time graph, ancestor of the spacetime diagram',
    lk2: '→ Doppler effect, step 1: wave speed doesn’t add the source’s speed; a moving source only changes the wavefront spacing',
    lk3: '→ Mechanical energy, step 5: at low speed ½mv² still does the job',
    lk4: '→ Projectiles & circular motion, step 5: how orbit height sets a satellite’s speed',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Special Relativity · The Lines of “Now” Tilt”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]);
  if (text === undefined) text = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshRelativity === 'function') window.refreshRelativity();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SR_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
