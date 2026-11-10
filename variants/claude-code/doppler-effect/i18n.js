'use strict';
// Doppler effect lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '多普勒效应 · 数一数每秒到达几个波峰',
    back: '← 知识索引',
    compare: '对照另一版本：多普勒效应 · 驶近变尖，驶远变沉 →',
    navLabel: '多普勒效应步骤导航',
    tagline: '救护车驶来时警笛尖，驶过后突然变沉，可车上的喇叭一直发着同一个音。耳朵听到的音调，取决于每秒有多少个波峰撞上鼓膜。七步里你会亲手数这些波峰：先让声源动，再让听者动，再听一辆车开过、用回声测速，最后看声源快过声音时会发生什么。',
    nav0: '0 波峰与频率', nav1: '1 声源在动', nav2: '2 听者在动', nav3: '3 一辆车开过', nav4: '4 回声测速', nav5: '5 快过声音', nav6: '6 收束',
    stepWord: '第 {n} 步',

    s0k: '第 0 步 · 先数波峰',
    s0t: '声源不动时，耳朵每秒收到几个波峰？',
    s0e: '这一步要回答：一个静止的喇叭发出频率为 f 的声音，站在 3 米外的你每秒会收到多少个波峰？声音是空气里一层层传开的疏密变化；每层最密的地方叫<strong>波峰</strong>，图上每个圆就是一个波峰此刻到达的位置。<strong>频率</strong> f 是声源每秒发出的波峰个数（单位 Hz），相邻两个波峰发出的时间间隔叫<strong>周期</strong> T = 1/f。每个波峰离开声源后都以<strong>声速</strong> c ≈ 340 m/s 在空气中向外跑，所以相邻两个圆之间相隔 <strong>波长</strong> λ = c·T = c/f（<a class="xlink" href="../../../physics/waves/sound-waves/#step1">→ 声音是波 第 1 步：示波器上的一个周期与地上的一个波长</a>）。耳朵听到的音调高低，由它每秒收到的波峰数决定。',
    fSlider: '声源频率 f（Hz）', play: '慢放一遍', playing: '播放中…',
    c0a: '俯视：圆 = 波峰，L = 你', c0b: '你收到波峰的时刻（ms）',
    s0lgSrc: '声源', s0lgRing: '波峰', s0lgL: 'L：你（静止，距声源 3 m）', s0lgTick: '一个波峰到达',
    s0readout: '声源每隔 T = {T} ms 发出一个波峰，空气中相邻波峰相距 λ = c/f = {lam} m。在图中 {win} ms 里你收到 {n} 个波峰，实测相邻到达间隔 {dt} ms，即每秒收到 {fh} 个：和声源发出的频率一样。',
    s0hint: '观察顺序：只拖频率，看俯视图里圆的间距变化（频率翻倍，间距减半）和下方刻度变密；再按「慢放一遍」，看圆一个个扩开、每碰到 L 一次下方就多一道刻度。动画慢放约 {slow} 倍。',

    s1k: '第 1 步 · 让声源动起来',
    s1t: '声源向右跑，前面的 A 和后面的 B 听到的还一样吗？',
    s1e: '这一步要回答：声源以速度 v 向右运动，它前方的 A 与后方的 B 两位静止听者，每秒收到的波峰数（也就是听到的频率）各是多少？关键是：每个波峰一离开声源，就只管以声速 c 在空气中往外跑，和声源之后怎么走无关。在一个周期 T（相邻两个波峰发出的时间间隔）里，上一个波峰向前跑了 c·T，声源自己也向前走了 v·T，于是下一个波峰从更靠前的地方出发。所以声源前方相邻波峰（相邻两个圆）的间距缩成 <strong>λ前 = (c − v)·T</strong>，后方拉长成 <strong>λ后 = (c + v)·T</strong>。波峰仍以 c 跑向听者，相邻两个到达的时间间隔就是间距 ÷ c，于是 A 听到 <strong>f前 = f·c/(c − v)</strong>，B 听到 <strong>f后 = f·c/(c + v)</strong>。声源频率固定为 440 Hz。',
    vSlider: '声源速度 v（m/s）',
    c1a: '俯视：声源向右跑', c1b: 'A 收到波峰的时刻（ms）', c1c: 'B 收到波峰的时刻（ms）',
    s1lgPath: '声源走过的路', s1lgA: 'A：前方静止听者', s1lgB: 'B：后方静止听者',
    s1readout: 'A（前方）：相邻波峰间距 {la} m，实测到达间隔 {ta} ms → 听到 {fa} Hz（公式 f·c/(c − v) = {faf} Hz）。　B（后方）：间距 {lb} m，到达间隔 {tb} ms → 听到 {fb} Hz（公式 f·c/(c + v) = {fbf} Hz）。',
    s1hint: '观察顺序：先把 v 拖到 0，两条刻度一样密；再慢慢加大 v，看俯视图右侧的圆挤到一起、左侧的圆被拉开，A 的刻度变密、B 的刻度变疏。按「慢放一遍」看声源边走边发出波峰：每个圆的圆心都是它出发时声源所在的位置。v 最大到 200 m/s（约 0.6 倍声速）。',

    s2k: '第 2 步 · 换成听者在动',
    s2t: '你跑向静止的声源，和声源以同样速度跑向你，听到的一样吗？',
    s2e: '这一步要回答：相对速度相同、只是换成「听者在动」，听到的频率是否不变？上面一条是声源以速度 s 驶向静止的你：上一步已知，它把空气中的波峰间距压成 (c − s)·T，所以 <strong>f′ = f·c/(c − s)</strong>。下面一条是声源静止、你以同样的速度 s 迎着声波跑：空气中的波峰间距仍是原来的波长 λ = c/f，一点没变；变的是你和波峰相遇的快慢，波峰以 c 迎面而来、你又以 s 迎上去，两者的接近速度是 c + s，所以 <strong>f′ = f·(c + s)/c</strong>。两种情况都由「空气中的间距 ÷ 相对空气的接近速度」算出；空气是传声的介质，它把「谁在动」区分开来。s 为负表示彼此远离。',
    sSlider: '速度 s（m/s，正 = 彼此接近）',
    c2a: '上：声源驶向静止的你　下：声源静止，你跑向它', c2top: '声源以 s 驶向静止的你', c2bot: '声源静止，你以 s 跑向它', c2strip: '你收到波峰的时刻（ms）', c2b: '听到的频率 ÷ 原频率，随 s/c 变化',
    s2lgCrest: '波峰（只画向右的）', s2lgSrc: '声源', s2lgL: '你', s2lgA: '声源动：c/(c − s)', s2lgB: '你在动：(c + s)/c',
    s2readout: '声源动：波峰间距 {la} m，实测 {ma} Hz（公式 {fa} Hz）。　你在动：间距 {lb} m，实测 {mb} Hz（公式 {fb} Hz）。　两者相差 {diff} Hz。',
    s2hint: '观察顺序：先把 s 拖到 +100 m/s，比较两条道上的波峰：上道的间距明显变短，下道的间距不变，但你在向它们冲；两道下方的刻度都变密，上道更密。再拖到 −100，两道都变疏。「听到的频率 ÷ 原频率」图里两条曲线在 s = 0 附近几乎重合（s 远小于 c 时 1/(1 − s/c) ≈ 1 + s/c），s 越大分得越开。',

    s3k: '第 3 步 · 一辆车开过',
    s3t: '车从身边开过，音调是突然跳下来，还是一路滑下来？',
    s3e: '这一步要回答：车不再正对着你开，而是沿直路从你身旁 d 米处驶过，你听到的频率随时间怎样变？只有<strong>沿你和声源连线方向</strong>的速度分量会改变波峰间距：车的速度与视线的夹角是 θ 时，一个周期里它朝你靠近了 v·cosθ·T，所以 <strong>f′ = f/(1 − v·cosθ/c)</strong>。θ 接近 0（远远驶来）时就是第 1 步的 f·c/(c − v)；θ = 90°（车在你正侧面）时没有靠近分量，f′ = f。还有一个容易忽略的事实：你<strong>此刻</strong>听到的声音，是车<strong>早些时候</strong>在更远处发出的，声音路上要花时间。所以要用的是那个<strong>发声时刻</strong>的位置和夹角。车的喇叭固定为 440 Hz。',
    v3Slider: '车速 v（m/s）', d3Slider: '你离路的距离 d（m）', t3Slider: '此刻 t（s，t = 0 时车正好在你面前）', drive: '让车开过去',
    c3a: '俯视：车此刻（橙）与发声处（紫圈）', c3b: '你此刻听到的频率（Hz）随时间 t（s）',
    s3lgNow: '车此刻', s3lgThen: '发出你此刻所听声音时的车', s3lgYou: '你', s3lgCurve: '听到的频率', s3lgRef: '440 Hz 与两端极限',
    s3readout: 't = {t} s：车在 x = {xc} m。你此刻听到的声音是它在 t = {te} s、x = {xe} m 处发出的（路上走了 {lag} s），那时速度与视线夹角 θ = {th}°，所以 f′ = 440/(1 − v·cosθ/c) = {f} Hz。远处驶来时趋近 {fmax} Hz，远去后趋近 {fmin} Hz；听到正好 440 Hz 的时刻是 t = d/c = {tz} s，而不是车经过你面前的 t = 0。',
    s3hint: '观察顺序：按「让车开过去」，看下图描出一条 S 形曲线：远处平平的高音，靠近时滑下来，远去后平平的低音。再只把 d 从 5 拖到 100：两端高度不变（只由 v 决定），中间的滑落变缓。最后只拖 v：两端拉开。橙色竖线是 t = 0（车在正前方），这时你听到的仍高于 440 Hz。',

    s4k: '第 4 步 · 用回声测速',
    s4t: '对着驶来的小车发超声，回声的频率能告诉你车速吗？',
    s4e: '这一步要回答：固定不动的探头发出频率 f 的声波，被一辆以速度 u 驶来的小车反射回来，回声的频率是多少，又怎样反推出 u？分两段算，每段都是前面学过的情况。第一段，小车是<strong>迎着声波跑的听者</strong>（第 2 步）：它收到 f·(c + u)/c。第二段，小车把这个频率反射回去，又成了<strong>驶向探头的声源</strong>（第 1 步）：再乘 c/(c − u)。合起来 <strong>f回 = f·(c + u)/(c − u)</strong>。探头把回声和自己发出的声音叠在一起，听到每秒 Δf = f回 − f 次的忽强忽弱，叫<strong>拍频</strong>（<a class="xlink" href="../../../physics/waves/sound-waves/#step2">→ 声音是波 第 2 步：两个相近的音为什么忽强忽弱</a>）。u 远小于 c 时，Δf ≈ 2u·f/c，于是 u ≈ c·Δf/(2f)。这里用 40 kHz 的超声，c = 340 m/s。',
    uSlider: '小车速度 u（m/s）',
    c4a: '探头（左）与小车（右）', c4b: '探头：发出的波峰', c4c: '探头：收到的回声波峰', c4d: '拍频 Δf（Hz）随车速 u（m/s）',
    s4lgOut: '发出的波峰', s4lgBack: '回声的波峰', s4lgExact: '精确 f(c + u)/(c − u) − f', s4lgApprox: '近似 2uf/c',
    s4readout: '回声 {fe} Hz，比发出的高 Δf = {beat} Hz；近似 2uf/c = {ap} Hz，偏小 {err}%。由 Δf 反推车速 u = c·Δf/(2f + Δf) = {uback} m/s。同样车速换成交通测速雷达（24.15 GHz 微波，波速换成光速 3×10⁸ m/s）：Δf = {rb} Hz，近似的相对误差只有 {rerr}。',
    s4hint: '观察顺序：先把 u 拖到 0，上下两排刻度一样密，Δf = 0；再加大 u，看回声波峰（橙色）比发出的波峰（青色）挤得更紧，下排刻度更密：同样的时间里收回的波峰比发出的多，多出的个数每秒就是 Δf。「拍频 Δf 随车速 u」图里虚线（近似）和实线（精确）在 u 小时重合，u 越大差得越多。上方条带里波峰位置是按真实速度比画的（u/c 最大约 0.12），只是时间慢放。',

    s5k: '第 5 步 · 快过声音',
    s5t: '声源追上甚至超过自己发出的声音时，会发生什么？',
    s5e: '这一步要回答：声源速度 v 接近、等于、超过声速 c 时，波峰怎样排列？用<strong>马赫数</strong> M = v/c 描述速度：M = 1 就是正好等于声速。按第 1 步，前方波峰间距是 (c − v)·T = (1 − M)·λ（λ 是声源静止时的波长）。M 越接近 1，前方波峰挤得越紧；M = 1 时所有波峰在声源正前方叠在一起；M > 1 时声源跑在所有波峰前面，前方的人在声源到达前什么也听不到。这些圆的公切线围成一个圆锥，叫<strong>马赫锥</strong>：一个波峰发出后过了时间 t，它的半径是 c·t，而声源已经走了 v·t，所以锥的半顶角 α 满足 <strong>sin α = c/v = 1/M</strong>。锥面扫过你的那一刻，大量波峰几乎同时到达，就是<strong>音爆</strong>。',
    mSlider: '马赫数 M = v/c',
    c5a: '俯视：声源向右跑',
    s5lgCone: '马赫锥（M > 1 时）',
    s5sub: 'M = {M}（v = {v} m/s）：比声速慢，前方波峰间距缩成 (1 − M)λ = {sp}λ，声音仍先于声源到达前方。',
    s5sonic: 'M = 1（v = {v} m/s）：每个波峰都和声源一起到达前方，全叠在机头处，前方间距为 0；f·c/(c − v) 的分母变成 0。',
    s5super: 'M = {M}（v = {v} m/s）：所有波峰都落在声源后方，公切线围成马赫锥，半顶角 α = arcsin(1/M) = {a}°。锥面之外（前方和两侧）还听不到声音。',
    s5hint: '观察顺序：从 M = 0.5 开始慢慢拖到 2.5，按「慢放一遍」看每次的波峰怎么排。M < 1 时圆一个套一个、前密后疏；M = 1 时圆全在右端相切；M > 1 时圆彼此相交，外侧的白色直线就是马赫锥，M 越大锥越尖。只画了几何形状，真实的激波物理（空气被剧烈压缩、升温）比这复杂得多。',

    s6k: '第 6 步 · 收束',
    s6t: '把多普勒效应收成一句话',
    s6fin: '<strong>听到的频率 = 每秒到达耳朵的波峰数。</strong>声源动，改变的是空气里波峰的间距；听者动，改变的是与波峰相遇的快慢。两件事合在一起：',
    formula: 'f′ = f·(c + u听)/(c − v源)',
    formulaNote: 'u听：听者朝声源的速度；v源：声源朝听者的速度（都相对空气、都取连线方向的分量）。',
    boundary: '适用范围：声速 c 由静止的空气决定（有风时要换成相对空气的速度）；声源慢于声速（v < c）；只取沿连线方向的速度分量，且用发声时刻的位置。光的多普勒效应没有空气这样的介质，要用相对论处理，但速度远小于光速时结果相同到很多位。',
    quizPrompt: '想一想：鸣笛 500 Hz 的车以 34 m/s 驶向静止的你，你听到约 555.6 Hz。如果换成车停着、你以 34 m/s 跑向它，听到的是？',
    quizA: '还是 555.6 Hz：相对速度一样', quizB: '550 Hz：空气里的波长没变，只是遇到得更快', quizC: '500 Hz：声源没动，频率不变',
    check: '核对', correct: '对。车停着时空气里的波峰间距仍是 c/f = 0.68 m；你以 34 m/s 迎上去，接近速度是 374 m/s，每秒遇到 374 ÷ 0.68 = 550 个波峰。声源在动时间距被压短，所以那时更高。',
    wrong: '再想想第 2 步：听者动时，空气里的波峰间距变了吗？变的是什么？',
    linksTitle: '接着去看',
    lk1: '→ 声音是波 第 1 步：周期和波长怎么换算',
    lk2: '→ 声音是波 第 2 步：拍频，测速仪真正听到的东西',
    lk3: '→ 干涉 第 0 步：一列波里每一点只是在原地振动',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《多普勒效应 · 驶近变尖，驶远变沉》的平行版本。'
  },
  en: {
    pageTitle: 'The Doppler Effect · Count the Crests Arriving Each Second',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Doppler Effect · Higher as It Approaches, Lower as It Leaves →',
    navLabel: 'Doppler effect steps',
    tagline: 'An ambulance siren sounds shrill as it comes and drops the moment it passes, yet the speaker on the roof never changes its note. What your ear calls pitch is how many wave crests hit the eardrum each second. Over seven steps you will count those crests yourself: move the source, then move the listener, hear a car go by, measure speed with an echo, and finally see what happens when the source outruns its own sound.',
    nav0: '0 Crests & pitch', nav1: '1 Moving source', nav2: '2 Moving listener', nav3: '3 A car passes', nav4: '4 Echo speed', nav5: '5 Faster than sound', nav6: '6 Wrap-up',
    stepWord: 'Step {n}',

    s0k: 'Step 0 · Count the crests',
    s0t: 'With the source standing still, how many crests reach your ear each second?',
    s0e: 'This step asks: a still loudspeaker plays a note of frequency f, and you stand 3 m away. How many crests reach you per second? Sound is a pattern of squeezed and stretched air spreading outward; the most squeezed part of each layer is a <strong>crest</strong>, and each circle in the picture is where one crest has got to. The <strong>frequency</strong> f is how many crests the source sends out per second (in Hz), and the time between two of them is the <strong>period</strong> T = 1/f. Once released, every crest runs outward through the air at the <strong>speed of sound</strong>, c ≈ 340 m/s, so neighbouring circles are one <strong>wavelength</strong> apart: λ = c·T = c/f (<a class="xlink" href="../../../physics/waves/sound-waves/#step1">→ Sound is a wave, step 1: one period on the scope, one wavelength on the floor</a>). The pitch you hear is set by how many crests reach your ear each second.',
    fSlider: 'Source frequency f (Hz)', play: 'Play in slow motion', playing: 'Playing…',
    c0a: 'Top view: circles are crests; L is you', c0b: 'When crests reach you (ms)',
    s0lgSrc: 'source', s0lgRing: 'crest', s0lgL: 'L: you (still, 3 m away)', s0lgTick: 'one crest arrives',
    s0readout: 'The source releases a crest every T = {T} ms, so crests sit λ = c/f = {lam} m apart in the air. In the {win} ms shown, {n} crests reach you, a measured {dt} ms apart: {fh} per second, exactly the frequency the source plays.',
    s0hint: 'What to try: drag only the frequency and watch the circle spacing (double f, half the gap) and the ticks below crowd together. Then press “Play in slow motion”: the circles grow one by one and each time one sweeps over L a new tick appears. The animation runs about {slow} times slower than real life.',

    s1k: 'Step 1 · Set the source moving',
    s1t: 'The source drives to the right. Do A, in front, and B, behind, hear the same note?',
    s1e: 'This step asks: with the source moving right at speed v, how many crests per second (that is, what frequency) reach A, standing still ahead of it, and B, standing still behind? The key fact: once a crest leaves the source, it just runs through the air at c and ignores whatever the source does next. During one period T (the time between two releases) the last crest travels c·T, but the source also moves v·T, so the next crest starts from further forward. Ahead of the source, neighbouring crests (neighbouring circles) end up only <strong>λ<sub>ahead</sub> = (c − v)·T</strong> apart; behind it they are stretched to <strong>λ<sub>behind</sub> = (c + v)·T</strong>. The crests still travel at c, so the time between arrivals is spacing ÷ c, and A hears <strong>f<sub>ahead</sub> = f·c/(c − v)</strong> while B hears <strong>f<sub>behind</sub> = f·c/(c + v)</strong>. The source plays 440 Hz throughout.',
    vSlider: 'Source speed v (m/s)',
    c1a: 'Top view: source drives right', c1b: 'When crests reach A (ms)', c1c: 'When crests reach B (ms)',
    s1lgPath: 'path of the source', s1lgA: 'A: still listener ahead', s1lgB: 'B: still listener behind',
    s1readout: 'A (ahead): crests {la} m apart, arriving every {ta} ms → hears {fa} Hz (formula f·c/(c − v) = {faf} Hz).   B (behind): {lb} m apart, every {tb} ms → hears {fb} Hz (formula f·c/(c + v) = {fbf} Hz).',
    s1hint: 'What to try: start with v at 0, where both rows of ticks are equally dense. Raise v slowly: on the right of the top view the circles bunch up, on the left they spread out; A’s ticks crowd, B’s thin out. Press “Play in slow motion” to see the source drop crests as it goes: every circle is centred on the spot where the source was when that crest left. v goes up to 200 m/s, about 0.6 times the speed of sound.',

    s2k: 'Step 2 · Move the listener instead',
    s2t: 'Is running toward a still siren the same as the siren driving toward you at that speed?',
    s2e: 'This step asks: keep the same closing speed but let the listener do the moving. Does the heard frequency stay the same? Top lane: the source drives at speed s toward you while you stand still. From step 1 it squeezes the crest spacing in the air to (c − s)·T, so <strong>f′ = f·c/(c − s)</strong>. Bottom lane: the source stands still and you run into the sound at the same speed s. The crests in the air are still one ordinary wavelength λ = c/f apart; nothing about them changed. What changes is how fast you meet them: they come at c, you go at s, so you close in at c + s, and <strong>f′ = f·(c + s)/c</strong>. Both answers come from the same rule, spacing in the air ÷ closing speed relative to the air. The air carries the sound, and it is the air that tells the two cases apart. A negative s means moving apart.',
    sSlider: 'Speed s (m/s, positive = closing in)',
    c2a: 'Top: source drives toward still you   Bottom: still source, you run toward it', c2top: 'Source drives at s toward still you', c2bot: 'Still source, you run at s toward it', c2strip: 'When crests reach you (ms)', c2b: 'Heard ÷ emitted frequency against s/c',
    s2lgCrest: 'crest (rightward ones only)', s2lgSrc: 'source', s2lgL: 'you', s2lgA: 'source moves: c/(c − s)', s2lgB: 'you move: (c + s)/c',
    s2readout: 'Source moving: crests {la} m apart, measured {ma} Hz (formula {fa} Hz).   You moving: {lb} m apart, measured {mb} Hz (formula {fb} Hz).   Difference: {diff} Hz.',
    s2hint: 'What to try: drag s to +100 m/s and compare the lanes. In the top lane the crests are visibly closer; in the bottom lane the spacing is unchanged, but you are charging into them. Both tick rows get denser, the top one more so. Then drag to −100 and both thin out. In the “Heard ÷ emitted frequency” chart the two curves almost coincide near s = 0 (for s much smaller than c, 1/(1 − s/c) ≈ 1 + s/c) and peel apart as s grows.',

    s3k: 'Step 3 · A car goes by',
    s3t: 'As a car passes, does the pitch jump down, or slide?',
    s3e: 'This step asks: the car no longer drives straight at you but passes along a straight road d metres away. How does the frequency you hear change with time? Only the part of the velocity <strong>along the line between you and the source</strong> changes the crest spacing. If the car’s velocity makes an angle θ with that line, in one period it gets v·cosθ·T closer to you, so <strong>f′ = f/(1 − v·cosθ/c)</strong>. With θ near 0 (far away, heading in) this is step 1’s f·c/(c − v); at θ = 90° (car right beside you) there is no approach at all and f′ = f. One fact is easy to miss: the sound you hear <strong>now</strong> left the car <strong>a little earlier</strong>, from further back, because sound takes time to travel. So it is the position and angle at the <strong>moment of emission</strong> that count. The horn plays 440 Hz.',
    v3Slider: 'Car speed v (m/s)', d3Slider: 'Your distance from the road d (m)', t3Slider: 'Now, t (s; at t = 0 the car is right in front of you)', drive: 'Drive the car past',
    c3a: 'Top view: car now vs. where the sound left it', c3b: 'Heard frequency (Hz) vs time t (s)',
    s3lgNow: 'car now', s3lgThen: 'car when it sent what you hear now', s3lgYou: 'you', s3lgCurve: 'heard frequency', s3lgRef: '440 Hz and the two limits',
    s3readout: 't = {t} s: the car is at x = {xc} m. The sound reaching you now left it at t = {te} s from x = {xe} m ({lag} s in flight), when its velocity made θ = {th}° with the line to you, so f′ = 440/(1 − v·cosθ/c) = {f} Hz. Far off it tends to {fmax} Hz on the way in and {fmin} Hz on the way out; you hear exactly 440 Hz at t = d/c = {tz} s, not at t = 0 when the car is in front of you.',
    s3hint: 'What to try: press “Drive the car past” and watch the lower plot trace an S: a flat high note in the distance, a slide as it nears, a flat low note as it leaves. Then drag only d from 5 to 100: the two ends stay put (they depend on v alone) while the slide in the middle gets gentler. Finally drag only v: the ends move apart. The orange vertical line is t = 0, car straight ahead, and you are still hearing more than 440 Hz there.',

    s4k: 'Step 4 · Speed from an echo',
    s4t: 'Send ultrasound at an approaching cart: can the echo’s pitch tell you its speed?',
    s4e: 'This step asks: a fixed sensor sends sound of frequency f, a cart approaching at speed u reflects it, and the echo comes back. What is the echo’s frequency, and how do you get u back from it? Work it out in two legs, each a case you have already met. Leg one: the cart is a <strong>listener running into the sound</strong> (step 2), so it receives f·(c + u)/c. Leg two: the cart sends that sound back and is now a <strong>source driving toward the sensor</strong> (step 1), which multiplies by c/(c − u). Together: <strong>f<sub>echo</sub> = f·(c + u)/(c − u)</strong>. The sensor mixes the echo with its own signal and hears it swell and fade Δf = f<sub>echo</sub> − f times a second, the <strong>beat frequency</strong> (<a class="xlink" href="../../../physics/waves/sound-waves/#step2">→ Sound is a wave, step 2: why two close notes swell and fade</a>). When u is much smaller than c, Δf ≈ 2u·f/c, so u ≈ c·Δf/(2f). Here the sensor uses 40 kHz ultrasound and c = 340 m/s.',
    uSlider: 'Cart speed u (m/s)',
    c4a: 'Sensor (left) and cart (right)', c4b: 'Sensor: crests sent', c4c: 'Sensor: echo crests received', c4d: 'Beat Δf (Hz) vs cart speed u (m/s)',
    s4lgOut: 'crests sent', s4lgBack: 'echo crests', s4lgExact: 'exact f(c + u)/(c − u) − f', s4lgApprox: 'approximation 2uf/c',
    s4readout: 'Echo {fe} Hz, Δf = {beat} Hz above what was sent; the approximation 2uf/c = {ap} Hz is {err}% low. Back from Δf: u = c·Δf/(2f + Δf) = {uback} m/s. At the same speed a traffic radar (24.15 GHz microwaves, wave speed now the speed of light, 3×10⁸ m/s) sees Δf = {rb} Hz, and the approximation is off by only {rerr}.',
    s4hint: 'What to try: start with u at 0, where the two tick rows match and Δf = 0. Raise u: the echo crests (orange) sit closer together than the outgoing ones (cyan), and the lower tick row gets denser. In the same time more crests come back than went out; the surplus per second is Δf. In the “Beat Δf vs cart speed u” chart, the dashed approximation hugs the solid exact curve at small u and falls behind as u grows. The strip above uses the true speed ratio (u/c up to about 0.12); only time is slowed.',

    s5k: 'Step 5 · Faster than sound',
    s5t: 'What happens when the source catches up with, or overtakes, its own sound?',
    s5e: 'This step asks: as the source speed v approaches, reaches and passes the speed of sound c, how do the crests line up? Speed is measured as a <strong>Mach number</strong>, M = v/c, so M = 1 means exactly the speed of sound. By step 1 the crests ahead are (c − v)·T = (1 − M)·λ apart, with λ the wavelength of a still source. The closer M gets to 1, the tighter they pack; at M = 1 every crest piles up right at the nose; above 1 the source runs ahead of all of them, and someone in front hears nothing until it arrives. The circles then share a pair of tangent lines forming a cone, the <strong>Mach cone</strong>. A time t after a crest leaves, its radius is c·t while the source has gone v·t, so the cone’s half-angle α obeys <strong>sin α = c/v = 1/M</strong>. When the cone sweeps over you, a great many crests arrive almost together: that is the <strong>sonic boom</strong>.',
    mSlider: 'Mach number M = v/c',
    c5a: 'Top view: source drives right',
    s5lgCone: 'Mach cone (when M > 1)',
    s5sub: 'M = {M} (v = {v} m/s): slower than sound. Crests ahead are squeezed to (1 − M)λ = {sp}λ, and the sound still reaches people in front before the source does.',
    s5sonic: 'M = 1 (v = {v} m/s): every crest reaches the front together with the source and they all stack at the nose; the spacing ahead is 0 and the denominator of f·c/(c − v) hits zero.',
    s5super: 'M = {M} (v = {v} m/s): every crest falls behind the source, and their common tangents form the Mach cone with half-angle α = arcsin(1/M) = {a}°. Outside the cone, ahead and to the sides, nothing can be heard yet.',
    s5hint: 'What to try: start at M = 0.5 and work up to 2.5, pressing “Play in slow motion” as you go. Below 1 the circles nest, dense in front and sparse behind; at exactly 1 they all touch at the right-hand end; above 1 they cross each other and the white lines outside are the Mach cone, sharper as M grows. Only the geometry is shown; a real shock wave (air violently compressed and heated) is far more complicated.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'The Doppler effect in one sentence',
    s6fin: '<strong>The frequency you hear is the number of crests reaching your ear each second.</strong> A moving source changes how far apart the crests sit in the air; a moving listener changes how quickly it meets them. Put both together:',
    formula: 'f′ = f·(c + u_L)/(c − v_S)',
    formulaNote: 'u_L: the listener’s speed toward the source; v_S: the source’s speed toward the listener (both relative to the air, components along the line between them).',
    boundary: 'Where this holds: the speed of sound c is set by still air (in wind, measure speeds relative to the air); the source is slower than sound (v < c); use only the velocity components along the line of sight, taken at the moment of emission. Light has no air-like medium, so its Doppler effect needs relativity, but at speeds far below light the answers agree to many digits.',
    quizPrompt: 'Think: a car sounding 500 Hz drives toward you at 34 m/s and you hear about 555.6 Hz. If instead the car is parked and you run toward it at 34 m/s, what do you hear?',
    quizA: 'Still 555.6 Hz: the relative speed is the same', quizB: '550 Hz: the wavelength in the air is unchanged, you just meet crests faster', quizC: '500 Hz: the source is not moving, so nothing changes',
    check: 'Check', correct: 'Right. With the car parked, crests sit c/f = 0.68 m apart in the air; running in at 34 m/s you close at 374 m/s and meet 374 ÷ 0.68 = 550 crests a second. A moving source shortens the spacing itself, which is why that case comes out higher.',
    wrong: 'Look again at step 2: when the listener moves, does the crest spacing in the air change? What does change?',
    linksTitle: 'Where to go next',
    lk1: '→ Sound is a wave, step 1: converting between period and wavelength',
    lk2: '→ Sound is a wave, step 2: beats, what a speed sensor really hears',
    lk3: '→ Interference, step 0: every point of a wave just vibrates in place',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Doppler Effect · Higher as It Approaches, Lower as It Leaves”.'
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
