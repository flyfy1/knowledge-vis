'use strict';
// Standing-wave lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '驻波 · 两列波迎面相撞，波形为何停在原地',
    back: '← 知识索引',
    compare: '对照另一版本：驻波 · 原地起伏的波 →',
    navLabel: '驻波步骤导航',
    tagline: '一根长绳，两头的人用同样的节奏抖动，两列一模一样的波迎面跑来。叠在一起之后，绳上的波形不再往前跑，而是在原地一起一伏，有几个点从头到尾纹丝不动。七步里你先看清这件事、算出每一点能振多高；再把绳两端钉死，看边界怎样只放行一组整数台阶的波长和频率；最后用一个很小的推力踩中其中一级台阶，这就是共振。',
    nav0: '0 迎面相撞', nav1: '1 波节与波腹', nav2: '2 两端钉死', nav3: '3 谐波台阶', nav4: '4 共振', nav5: '5 自测', nav6: '6 收束',
    play: '▶ 播放', pause: '❚❚ 暂停',

    s0k: '第 0 步 · 两列波相遇',
    s0t: '两列一样的波迎面相遇，绳上每一点怎么动？',
    s0e: '这一步要回答：两列振幅、波长、快慢都相同的波从两头迎面跑来，叠加后绳上每一点怎样运动？先说清一列波：绳上每一点按正弦规律上下振动，最大位移叫<strong>振幅</strong> A（这里 A = 1 cm）；同一时刻相邻两个波峰的距离叫<strong>波长</strong> λ（这里 λ = 2 m）；每一点完成一次上下所用的时间叫<strong>周期</strong> T（这里故意放慢成 2 s，真实绳波快得多）。向右跑的波写成 y₁ = A·sin(ωt − kx)，向左跑的写成 y₂ = A·sin(ωt + kx)，其中 k = 2π/λ、ω = 2π/T（正弦波从哪来：<a class="xlink" href="../../../math/geometry/trigonometry/#step2">→ 三角函数页第 2 步：把圆上的高度摊开，就是正弦波</a>）。两列波在同一点相遇时，位移直接相加：y = y₁ + y₂（<strong>叠加</strong>，对小振幅的线性振动成立）。这和干涉页讲的不是一回事：那里是两个波源在平面上相遇，看路程差（<a class="xlink" href="../../../physics/waves/interference/#step1">→ 干涉页第 1 步</a>）；这里只有一条线，两列波方向相反。',
    viewRight: '只看右行波', viewLeft: '只看左行波', viewBoth: '两列叠加',
    tSlider: '时刻 t（s）',
    s0lgR: '右行波 y₁', s0lgL: '左行波 y₂', s0lgS: '叠加 y = y₁ + y₂', s0lgTri: '小三角 = 各自的波峰', s0lgStrip: '下图颜色：青 = 在中线上方、橙 = 下方、暗 = 在中线（越亮离得越远）',
    c0a: '此刻的绳（纵轴位移 cm，横轴位置 m）',
    c0b: '最近 4 秒：每列是一点，越往下越早（s）',
    s0right: '右行波：波峰在 x = {xs} m，以 v = λ/T = {v} m/s 向右移动。下图的条纹是斜的：同一个波峰随时间往右挪。',
    s0left: '左行波：波峰在 x = {xs} m，以 v = {v} m/s 向左移动。下图条纹斜向另一边。',
    s0both: '叠加：y₁ + y₂ = 2A·cos(kx)·sin(ωt)。位置 x 只出现在 cos(kx) 里，时间 t 只出现在 sin(ωt) 里：整条绳的形状固定是 2A·cos(kx)，此刻只是整体乘上 sin(ωt) = {s}。两个小三角（各自的波峰）照样在跑，白线的峰却只在原地升降；下图条纹变成竖柱，x = {nodes} m 处始终是暗线：那些点一直不动。',
    s0hint: '观察顺序：先点「只看右行波」并播放，盯住青色小三角往右跑、下图条纹向一侧倾斜；再点「只看左行波」，条纹倒向另一边；最后点「两列叠加」：白线的峰不再横移，只原地变高、变矮、翻到下面。这种波形不迁移、每一点原地振动的图样叫<strong>驻波</strong>。暂停后可以拖「时刻 t」一帧帧看。',

    s1k: '第 1 步 · 包络',
    s1t: '绳上哪些点永远不动？任意一点能振多高？',
    s1e: '这一步要回答：已知驻波 y = 2A·cos(kx)·sin(ωt)，位置 x 处的点最多能离开中线多远，哪些点根本不动？sin(ωt) 在 −1 到 1 之间来回，所以 x 处的点最高只能到 2A·|cos(kx)|，这就是它的<strong>振幅</strong> A(x)（与时间无关）。把每一点的振幅连成线，得到一条不动的轮廓，叫<strong>包络</strong>（虚线）。包络为 0 的点叫<strong>波节</strong>：cos(kx) = 0，即 x = λ/4、3λ/4、5λ/4…；在那里两列波每一刻都恰好一正一负、互相抵消。包络达到 2A 的点叫<strong>波腹</strong>：x = 0、λ/2、λ…。所以相邻两个波节相距 λ/2，波节到相邻波腹相距 λ/4。',
    lamSlider: '波长 λ（m）', pSlider: '观测点 P 的位置 x（m）',
    toNode: '把 P 移到最近的波节', toAnti: '把 P 移到最近的波腹', envToggle: '显示包络',
    s1lgS: '此刻的绳', s1lgE: '包络 ±A(x)', s1lgN: '空心圈 = 波节', s1lgA: '实心菱形 = 波腹', s1lgP: 'P 点', s1lgO: 'x = 0 处波腹（对照）',
    c1a: '此刻的绳与包络（cm / m）',
    c1b: 'P 的位移–时间（公式算出，最近 4 s）',
    s1readout: 'P 在 x = {x} m（= {xl} λ）· 振幅 A(x) = 2A·|cos(kx)| = {a} cm（下图曲线的最大值 {sw} cm）· 最近的波节 x = {xn} m（相距 {dn} m）· 最近的波腹 x = {xa} m（相距 {da} m）。{kind}{phase}',
    kindNode: 'P 在波节上：此刻 y₁ = {y1} cm、y₂ = {y2} cm，互为相反数，每一刻都这样，所以合位移恒为 0。',
    kindAnti: 'P 在波腹上：振幅是最大值 2A = 2 cm。',
    kindBetween: 'P 在波节与波腹之间。',
    phSame: '它和 x = 0 处的波腹同步：同时到顶、同时到底（两者之间隔着偶数个波节）。',
    phOpp: '它和 x = 0 处的波腹正好相反：一个到顶时另一个到底（两者之间隔着奇数个波节）。',
    phNone: '波节不振动，谈不上和谁同步。',
    s1hint: '观察顺序：保持 λ 不变，慢慢拖 P：下图青线的高度跟着包络在 P 处的高度变；把 P 放到波节，青线压成一条直线；每跨过一个波节，青线和灰线就由同步变成相反。再拖 λ：所有波节、波腹按比例挪动，相邻波节的间距始终是 λ/2。除了波节，所有点同时到达最高或最低，只是高度不同。',

    s2k: '第 2 步 · 边界条件',
    s2t: '把绳换成两端钉死的弦，什么样的波长还能住下？',
    s2e: '这一步要回答：吉他弦两端固定、端点位移永远为 0，哪些波长能在这根弦上形成驻波？波跑到固定端会反射回来，而且被<strong>翻转</strong>（波峰回来变成波谷）：端点被钉住，入射波与反射波在端点每一刻都必须相加为 0。来回两列波叠成的驻波于是写成 y = 2A·sin(kx)·cos(ωt)，包络是 2A·|sin(kx)|（包络 = 每一点振幅连成的轮廓），波节在 x = 0、λ/2、λ…，左端自动是波节。右端 x = L 也被钉住，所以还要 sin(kL) = 0，也就是弦长恰好装下整数个半波长：<strong>L = n · λ/2</strong>（n = 1, 2, 3…）。能这样在弦上稳定存在的一种驻波形状，叫一个<strong>模式</strong>。',
    LSlider: '弦长 L（m）', lam2Slider: '试探波长 λ（m）', snap: '吸附到最近的模式 λ = 2L/n', clearHist: '清除记录',
    s2lgE: '这条波长的包络', s2lgS: '此刻形状（虚线 = 住不下的形状）', s2lgBad: '红杠 = 右端被要求的振幅', s2lgDot: '试过的波长',
    c2a: '两端钉死的弦（cm / m）',
    c2b: '右端被要求的振幅 2A·|sin(kL)|（cm）–λ（m）',
    s2readout: 'L = {L} m，λ = {lam} m → q = L ÷ (λ/2) = {q}，最近的整数 n = {n}，相差 {dev} · 右端被要求的振幅 {end} cm。{verdict}',
    s2ok: '模式 n = {n} 成立：两端都是波节，弦上共 {nn} 个波节（含两端）。',
    s2bad: '住不下：这条波长的包络要求右端振动 {end} cm，可右端被钉死了。红色只是「要求」，真实的弦上这种形状不会稳定存在。',
    s2hint: '观察顺序：L 不动，从左往右慢慢拖 λ：上图右端的红杠忽长忽短，只在某些波长处缩成 0、整根弦变绿；下图记下你试过的每个波长，零点正好落在 λ = 2L、L、2L/3…。零点很窄，滑杆每格 0.05 m，容易滑过去——按「吸附」直接跳到最近的 2L/n。再换一个 L，所有零点一起搬家。判定按精确相等做，不接受「差不多」。',

    s3k: '第 3 步 · 谐波',
    s3t: '同一根弦的模式排成一列，频率之间是什么关系？',
    s3e: '这一步要回答：上一步只放行 λₙ = 2L/n，对应的频率是多少、彼此什么关系？设定一根弦：振动部分长 L = 0.65 m（约等于吉他弦），波在弦上跑的速度 v = 143 m/s（由弦绷多紧、多粗决定；这里取定值，是模拟设定）。<strong>频率</strong> f 是每秒振动的次数，满足 f = v/λ（<a class="xlink" href="../../../physics/waves/sound-waves/#step1">→ 声波页第 1 步：v = fλ 从哪来</a>）。代入 λₙ = 2L/n，得 <strong>fₙ = n · v/(2L) = n · f₁</strong>。n = 1 的模式叫<strong>基频</strong>（基波），n ≥ 2 的叫第 n 次<strong>谐波</strong>。乐器的音色取决于各次谐波混合的比例，这里不展开。',
    modeN: 'n = {n}', ghost: '叠印 n = 1 作对照', L3Slider: '弦长 L（m，按住品格就是把它变短）',
    s3lgS: '模式 n 的形状', s3lgG: 'n = 1（对照）', s3lgN: '空心圈 = 波节', s3lgF: '竖条 = f₁ 到 f₆（高 n），亮的是当前 n',
    c3a: '模式 n 的形状（慢放，快慢比例真实）',
    c3b: '频率台阶：竖条在 fₙ（Hz），高为 n',
    s3readout: 'n = {n}：λₙ = 2L/n = {lam} m · fₙ = v/λₙ = {f} Hz = {r} × f₁（f₁ = v/2L = {f1} Hz）· 波节 {nn} 个（含两端）、波腹 {na} 个',
    s3hint: '观察顺序：L 不动，依次点 n = 1 到 6：上图每加 1，弦上多一个波节、多一个鼓包；下图亮起的竖条每次右移同样的一格 f₁。形状和频率两本账用的是同一个整数 n。再拖 L：整排台阶一起伸缩；L 减半到 0.325 m 时，f₁ 恰好翻倍到 220 Hz。真实弦每秒振动上百次，画面放慢了，但 n = 2 仍然比 n = 1 快一倍。',

    s4k: '第 4 步 · 共振',
    s4t: '用很小的力持续推这根弦，推的频率是多少时它会振得很大？',
    s4e: '这一步要回答：在弦上一处用很小的力来回推，推的频率 f 从低扫到高，弦的振动什么时候会变得很大？上一步的 fₙ 是这根弦自己能稳定振动的频率，叫<strong>固有频率</strong>（L = 0.65 m、v = 143 m/s 时是 110、220、330、440… Hz）。推力加在离左端 0.1L 处，等振动稳定后看它多大。纵轴是<strong>放大倍数</strong>：弦上最大振幅 ÷ 极慢地推（f 接近 0）时弦的最大弯曲；越大，说明同样的小推力换来越大的振动。峰的位置由 fₙ 决定；峰有多高、多宽取决于<strong>阻尼</strong>（摩擦和空气把能量带走的快慢），这里用阻尼比 ζ 表示，是选定的示意值，所以峰高、峰宽只是示意模型，不是测量数据（<a class="xlink" href="../../../physics/waves/resonance/#step3">→ 共振页第 3 步：一个振子的共振曲线</a>）。',
    fSlider: '推的频率 f（Hz）', zSlider: '阻尼比 ζ（示意值）', sweep: '从 20 Hz 扫到 500 Hz', clear4: '清除记录',
    s4lgS: '稳定后的弦形', s4lgArrow: '箭头 = 推力位置', s4lgCurve: '示意模型曲线', s4lgDot: '试过的频率', s4lgF: '竖虚线 = 固有频率 fₙ',
    c4a: '稳定后的弦（慢放；纵轴为放大倍数）',
    c4b: '放大倍数–推的频率（Hz；对数轴，示意）',
    s4readout: '{prog}f = {f} Hz · 放大倍数 {g}（示意模型）· 最近的固有频率 f{n} = {fn} Hz，相差 {df} Hz · 此刻弦形与模式 {m} 的相似度 {like}（1 = 完全一样）。{note}',
    s4hit: '踩中第 {n} 级台阶（f 落在这个峰的半宽 ζ·fₙ = {hw} Hz 以内）：共振，弦正以模式 {n} 的形状大幅振动。',
    s4miss: '没踩中台阶（离最近的峰超过半宽 ζ·fₙ = {hw} Hz）：离峰越远，振动越小。',
    s4prog: '扫描中 {c}/{N} · ',
    s4hint: '观察顺序：先按扫描按钮，看下图的点一个个记下：只在 110、220、330、440 Hz 附近冲高，其余地方很低；上图同时在那几处变成模式 1、2、3、4 的形状。再把阻尼调大重扫：峰变矮、变宽，位置几乎不动（ζ ≤ 0.05 时偏离 fₙ 不到 0.5%）。像推秋千：每一下都踩在它自己摆动的节拍上，劲才攒得起来。共振是「挑模式」，不是「越用力越响」。条件：推力点不能落在该模式的波节上，推在波节上那个模式就推不动。',

    s5k: '第 5 步 · 自测',
    s5t: '四道题，每道都用页面上的同一套公式判定',
    q1: '1. λ = 4 m 的驻波（x = 0 处是波腹），x = 1 m 处是？',
    q1a: '波节', q1b: '波腹', q1c: '介于两者之间',
    q1ok: '对。A(1) = 2A·|cos(2π × 1 / 4)| = {a} cm，振幅为 0，是波节：在 λ/4 处。',
    q1no: '再算一次：把 x = 1、λ = 4 代进 A(x) = 2A·|cos(2πx/λ)|，看看振幅是多少（回看第 1 步）。',
    q2: '2. 两端钉死的弦长 L = 6 m，能在上面形成驻波的最长波长是？',
    q2a: '6 m', q2b: '12 m', q2c: '3 m',
    q2ok: '对。最长波长对应 n = 1：λ₁ = 2L/1 = {lam} m，弦上只装下半个波长。',
    q2no: '回看第 2 步：L 必须等于 n 个半波长，n 最小是 1，所以最长的 λ 满足 L = λ/2。',
    q3: '3. 判断：「波节处没有波传过来，所以不动。」',
    q3a: '对', q3b: '错',
    q3ok: '对，这句话是错的：两列波都到达波节，只是每一刻 y₁ = −y₂，恰好互相抵消（回看第 1 步的读数）。',
    q3no: '再看第 1 步：把 P 放到波节，读数里 y₁、y₂ 都不为 0，只是互为相反数。',
    q4: '4. 按住吉他弦正中间，让振动部分变成原来的一半长，基频变成原来的几倍？',
    q4a: '1/2 倍', q4b: '2 倍', q4c: '4 倍',
    q4ok: '对。f₁ = v/(2L)，L 减半 → f₁ 变为 {r} 倍：{f0} Hz → {f1} Hz，音高升高一个八度。',
    q4no: '回看第 3 步：f₁ = v/(2L)，L 在分母上。L 变小，f₁ 变大还是变小？',
    check: '核对',

    s6k: '第 6 步 · 收束',
    s6t: '驻波的三句话',
    card1: '<strong>叠加生出包络。</strong>两列反向的同样的波叠成 y = 2A·cos(kx)·sin(ωt)：形状不跑，只在原地按 sin(ωt) 整体伸缩。',
    card2: '<strong>振幅由位置定死。</strong>A(x) = 2A·|cos(kx)|：波节相距 λ/2、永远不动，波腹振幅 2A；跨过一个波节就反相。',
    card3: '<strong>边界筛出台阶。</strong>两端钉死只放行 λₙ = 2L/n，频率 fₙ = n·f₁；推的频率踩中某个 fₙ，就是共振。',
    boundary: '适用范围：理想弦（均匀、小振幅线性振动、端点完全固定、波速不变）。真实的弦有刚度和阻尼，高次谐波会略微偏离整数倍；第 4 步的峰高、峰宽是示意模型。管乐器里是空气柱的驻波，一端封闭时只剩奇数次谐波，这里不展开。',
    linksTitle: '接着去看',
    lk1: '干涉页第 1 步：两个波源在平面上相遇，加强还是抵消看路程差——那是空间里的强弱图样；本页是一列波撞上自己的反向同伴，在一条线上原地振动 →',
    lk2: '三角函数页第 2 步：正弦波从哪来——把圆周上的高度摊开 →',
    lk3: '共振页第 3 步：单个振子的共振曲线，阻尼怎样决定峰高和峰宽 →',
    lk4: '声波页第 3 步：同一个音，钢琴和小提琴为什么不同——谐波的配比 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《驻波 · 原地起伏的波》的平行版本。'
  },
  en: {
    pageTitle: 'Standing Waves · Why the Shape Stops Running When Two Waves Collide',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Standing Waves · The Wave That Stays in Place →',
    navLabel: 'Standing wave steps',
    tagline: 'Two people shake the ends of a long rope in the same rhythm, so two identical waves run toward each other. Added together, the wave stops travelling: the rope just rises and falls in place, and a few points never move at all. In seven steps you will see this happen and work out how high each point can swing; then you pin both ends and watch the boundaries let through only a ladder of whole-number wavelengths and frequencies; finally a tiny push lands on one rung of that ladder — that is resonance.',
    nav0: '0 Head-on', nav1: '1 Nodes & antinodes', nav2: '2 Pinned ends', nav3: '3 Harmonic ladder', nav4: '4 Resonance', nav5: '5 Check', nav6: '6 Wrap-up',
    play: '▶ Play', pause: '❚❚ Pause',

    s0k: 'STEP 0 · TWO WAVES MEET',
    s0t: 'Two identical waves meet head-on. How does each point of the rope move?',
    s0e: 'The question: two waves with the same amplitude, wavelength and timing run in from opposite ends. Once they overlap, how does each point of the rope move? First, one wave. Every point of the rope bobs up and down along a sine curve; its largest displacement is the <strong>amplitude</strong> A (here A = 1 cm). At one instant, the distance from one crest to the next is the <strong>wavelength</strong> λ (here λ = 2 m). The time a point takes for one full up-and-down is the <strong>period</strong> T (slowed down to 2 s here; real rope waves are much faster). The right-moving wave is y₁ = A·sin(ωt − kx) and the left-moving one is y₂ = A·sin(ωt + kx), with k = 2π/λ and ω = 2π/T (where a sine wave comes from: <a class="xlink" href="../../../math/geometry/trigonometry/#step2">→ Trigonometry, step 2: unroll the height on a circle and you get a sine wave</a>). Where the two waves meet, their displacements simply add: y = y₁ + y₂ (<strong>superposition</strong>, valid for small, linear vibrations). This is not the interference page’s setup — there two sources meet on a plane and the path difference decides (<a class="xlink" href="../../../physics/waves/interference/#step1">→ Interference, step 1</a>); here there is one line and two opposite directions.',
    viewRight: 'Right-moving only', viewLeft: 'Left-moving only', viewBoth: 'Both, added',
    tSlider: 'Time t (s)',
    s0lgR: 'Right-moving y₁', s0lgL: 'Left-moving y₂', s0lgS: 'Sum y = y₁ + y₂', s0lgTri: 'Small triangles = each wave’s crest', s0lgStrip: 'Lower plot colour: cyan = above the rest line, orange = below, dark = on it (brighter = further)',
    c0a: 'The rope now (cm up, m across)',
    c0b: 'Last 4 s: one column per point, older lower (s)',
    s0right: 'Right-moving wave: crest at x = {xs} m, travelling right at v = λ/T = {v} m/s. The stripes below slant: the same crest drifts right as time passes.',
    s0left: 'Left-moving wave: crest at x = {xs} m, travelling left at v = {v} m/s. The stripes slant the other way.',
    s0both: 'Added: y₁ + y₂ = 2A·cos(kx)·sin(ωt). Position x appears only in cos(kx) and time t only in sin(ωt): the rope keeps the fixed shape 2A·cos(kx), and right now that whole shape is multiplied by sin(ωt) = {s}. The two small triangles (each wave’s own crest) are still running, yet the white curve’s peaks only rise and fall in place. Below, the stripes turn into vertical columns, with dark lines at x = {nodes} m: those points never move.',
    s0hint: 'What to watch: press “Right-moving only” and play — the cyan triangle runs right and the stripes below lean one way. Switch to “Left-moving only” and they lean the other way. Then “Both, added”: the white peaks stop drifting and just grow, shrink and flip below the line. A pattern whose shape does not travel, with every point vibrating in place, is a <strong>standing wave</strong>. Pause and drag “Time t” to step through frame by frame.',

    s1k: 'STEP 1 · THE ENVELOPE',
    s1t: 'Which points never move, and how far can any point swing?',
    s1e: 'The question: for the standing wave y = 2A·cos(kx)·sin(ωt), how far can the point at position x get from the rest line, and which points do not move at all? sin(ωt) swings between −1 and 1, so the point at x reaches at most 2A·|cos(kx)|. That is its <strong>amplitude</strong> A(x), and it does not depend on time. Join every point’s amplitude and you get a fixed outline, the <strong>envelope</strong> (dashed). Where the envelope is 0 we have a <strong>node</strong>: cos(kx) = 0, so x = λ/4, 3λ/4, 5λ/4, …; there the two waves are equal and opposite at every instant and cancel. Where the envelope reaches 2A we have an <strong>antinode</strong>: x = 0, λ/2, λ, …. So neighbouring nodes are λ/2 apart, and a node sits λ/4 from the nearest antinode.',
    lamSlider: 'Wavelength λ (m)', pSlider: 'Probe point P at x (m)',
    toNode: 'Move P to the nearest node', toAnti: 'Move P to the nearest antinode', envToggle: 'Show envelope',
    s1lgS: 'Rope now', s1lgE: 'Envelope ±A(x)', s1lgN: 'Hollow circles = nodes', s1lgA: 'Filled diamonds = antinodes', s1lgP: 'Point P', s1lgO: 'Antinode at x = 0 (reference)',
    c1a: 'Rope and envelope (cm up, m across)',
    c1b: 'P’s displacement vs time (formula, last 4 s)',
    s1readout: 'P at x = {x} m (= {xl} λ) · amplitude A(x) = 2A·|cos(kx)| = {a} cm (largest value of the curve below: {sw} cm) · nearest node x = {xn} m ({dn} m away) · nearest antinode x = {xa} m ({da} m away). {kind}{phase}',
    kindNode: 'P is on a node: right now y₁ = {y1} cm and y₂ = {y2} cm, equal and opposite — at every instant — so the sum stays 0. ',
    kindAnti: 'P is on an antinode: its amplitude is the maximum, 2A = 2 cm. ',
    kindBetween: 'P is between a node and an antinode. ',
    phSame: 'It moves in step with the antinode at x = 0: top together, bottom together (an even number of nodes lies between them).',
    phOpp: 'It moves opposite to the antinode at x = 0: one is at the top while the other is at the bottom (an odd number of nodes lies between them).',
    phNone: 'A node does not vibrate, so it has no rhythm to compare.',
    s1hint: 'What to watch: keep λ fixed and drag P slowly. The height of the cyan curve below follows the envelope’s height at P. Put P on a node and the curve flattens to a line; every time P crosses a node, cyan and grey switch from together to opposite. Then drag λ: all nodes and antinodes slide in proportion, and neighbouring nodes stay exactly λ/2 apart. Apart from the nodes, every point reaches its top at the same moment — they just reach different heights.',

    s2k: 'STEP 2 · BOUNDARY CONDITIONS',
    s2t: 'Pin both ends of the rope, like a guitar string. Which wavelengths still fit?',
    s2e: 'The question: a guitar string is fixed at both ends, so the ends never move. Which wavelengths can form a standing wave on it? A wave that reaches a fixed end bounces back <strong>flipped</strong> (a crest returns as a trough): the end is held still, so incoming and reflected waves must add to 0 there at every instant. The two waves running back and forth then make y = 2A·sin(kx)·cos(ωt), whose envelope (the outline of every point’s amplitude) is 2A·|sin(kx)|, with nodes at x = 0, λ/2, λ, … — the left end is a node for free. The right end x = L is pinned too, so we also need sin(kL) = 0: the string must hold a whole number of half-wavelengths, <strong>L = n · λ/2</strong> (n = 1, 2, 3, …). Each standing-wave shape that can live on the string this way is called a <strong>mode</strong>.',
    LSlider: 'String length L (m)', lam2Slider: 'Trial wavelength λ (m)', snap: 'Snap to the nearest mode λ = 2L/n', clearHist: 'Clear history',
    s2lgE: 'Envelope for this λ', s2lgS: 'Shape now (dashed = a shape that cannot fit)', s2lgBad: 'Red bar = swing demanded at the right end', s2lgDot: 'Wavelengths tried',
    c2a: 'String pinned at both ends (cm up, m across)',
    c2b: 'Swing demanded at the right end (cm) vs λ (m)',
    s2readout: 'L = {L} m, λ = {lam} m → q = L ÷ (λ/2) = {q}; nearest whole number n = {n}, off by {dev} · swing demanded at the right end {end} cm. {verdict}',
    s2ok: 'Mode n = {n} fits: both ends are nodes, and the string has {nn} nodes counting both ends.',
    s2bad: 'Does not fit: this wavelength’s envelope asks the right end to swing {end} cm, but that end is pinned. The red bar is only the demand — a real string never settles into this shape.',
    s2hint: 'What to watch: keep L fixed and drag λ slowly from left to right. The red bar at the right end grows and shrinks, and only at certain wavelengths does it vanish and the whole string turn green. The plot below keeps every λ you try; its zeros sit exactly at λ = 2L, L, 2L/3, …. The zeros are narrow and the slider moves 0.05 m per notch, so it is easy to skip past one — “Snap” jumps straight to the nearest 2L/n. Change L and every zero moves. The test is exact equality, not “close enough”.',

    s3k: 'STEP 3 · HARMONICS',
    s3t: 'Line up the modes of one string. How are their frequencies related?',
    s3e: 'The question: the last step allows only λₙ = 2L/n. What frequencies do these modes have, and how do they compare? Take a string with a vibrating length L = 0.65 m (about a guitar string) and wave speed v = 143 m/s along it (set by how tight and how thick the string is; a fixed simulation setting here). <strong>Frequency</strong> f is vibrations per second, and f = v/λ (<a class="xlink" href="../../../physics/waves/sound-waves/#step1">→ Sound waves, step 1: where v = fλ comes from</a>). Put in λₙ = 2L/n and you get <strong>fₙ = n · v/(2L) = n · f₁</strong>. The n = 1 mode is the <strong>fundamental</strong>; n ≥ 2 is the n-th <strong>harmonic</strong>. An instrument’s tone colour depends on how strongly each harmonic is mixed in — not covered here.',
    modeN: 'n = {n}', ghost: 'Overlay n = 1 for comparison', L3Slider: 'String length L (m; pressing a fret shortens it)',
    s3lgS: 'Shape of mode n', s3lgG: 'n = 1 (reference)', s3lgN: 'Hollow circles = nodes', s3lgF: 'Bars = f₁ to f₆ (height n), the bright one is the current n',
    c3a: 'Mode n shape (slowed; true speed ratios)',
    c3b: 'Frequency ladder: bar at fₙ (Hz), height n',
    s3readout: 'n = {n}: λₙ = 2L/n = {lam} m · fₙ = v/λₙ = {f} Hz = {r} × f₁ (f₁ = v/2L = {f1} Hz) · nodes: {nn} (counting both ends), antinodes: {na}',
    s3hint: 'What to watch: keep L fixed and press n = 1 to 6 in turn. Each step adds one node and one more loop to the string, and the bright bar below moves right by the same gap f₁ every time. Shape and frequency are counted by the same whole number n. Then drag L: the whole ladder stretches or shrinks together; halve L to 0.325 m and f₁ doubles to exactly 220 Hz. A real string vibrates hundreds of times a second, so the picture is slowed down — but n = 2 still runs twice as fast as n = 1.',

    s4k: 'STEP 4 · RESONANCE',
    s4t: 'Keep pushing the string with a tiny force. At what push frequency does it swing hard?',
    s4e: 'The question: push the string back and forth at one spot with a tiny force, and sweep the push frequency f from low to high. When does the vibration get large? The fₙ from the last step are the frequencies the string can sustain on its own: its <strong>natural frequencies</strong> (110, 220, 330, 440, … Hz for L = 0.65 m and v = 143 m/s). The push acts 0.1L from the left end; we wait for the motion to settle, then measure it. The vertical axis is the <strong>amplification</strong>: the largest swing on the string ÷ the largest bend when pushed very slowly (f near 0). Bigger means the same tiny push buys a bigger vibration. Where the peaks sit is set by fₙ; how tall and wide they are depends on <strong>damping</strong> (how quickly friction and air carry energy away), given here by the damping ratio ζ. ζ is a chosen illustrative value, so peak heights and widths are a schematic model, not measured data (<a class="xlink" href="../../../physics/waves/resonance/#step3">→ Resonance, step 3: one oscillator’s resonance curve</a>).',
    fSlider: 'Push frequency f (Hz)', zSlider: 'Damping ratio ζ (illustrative)', sweep: 'Sweep 20 Hz → 500 Hz', clear4: 'Clear history',
    s4lgS: 'Settled string shape', s4lgArrow: 'Arrow = where the push acts', s4lgCurve: 'Schematic model curve', s4lgDot: 'Frequencies tried', s4lgF: 'Dashed lines = natural frequencies fₙ',
    c4a: 'Settled string (slowed; amplification up)',
    c4b: 'Amplification vs push frequency (Hz, log, schematic)',
    s4readout: '{prog}f = {f} Hz · amplification {g} (schematic model) · nearest natural frequency f{n} = {fn} Hz, {df} Hz away · the shape now matches mode {m} with similarity {like} (1 = identical). {note}',
    s4hit: 'Landed on rung {n} (f is within this peak’s half-width ζ·fₙ = {hw} Hz): resonance — the string swings hard in the shape of mode {n}.',
    s4miss: 'Between rungs (further than the half-width ζ·fₙ = {hw} Hz from the nearest peak): the further from a peak, the smaller the vibration.',
    s4prog: 'Sweeping {c}/{N} · ',
    s4hint: 'What to watch: press the sweep button and watch the dots pile up below — they shoot up only near 110, 220, 330 and 440 Hz and stay low elsewhere, while the string above takes the shape of mode 1, 2, 3, 4 at exactly those points. Then raise the damping and sweep again: the peaks get lower and wider but barely move (less than 0.5% from fₙ for ζ ≤ 0.05). It is like pushing a swing: each push lands on the swing’s own beat, so the effort adds up. Resonance picks a mode; it is not “push harder, get louder”. Condition: the push must not sit on a node of that mode — pushing at a node cannot drive it.',

    s5k: 'STEP 5 · CHECK YOURSELF',
    s5t: 'Four questions, each judged with the same formulas the page uses',
    q1: '1. A standing wave with λ = 4 m has an antinode at x = 0. What is at x = 1 m?',
    q1a: 'A node', q1b: 'An antinode', q1c: 'Somewhere in between',
    q1ok: 'Right. A(1) = 2A·|cos(2π × 1 / 4)| = {a} cm. Zero amplitude: a node, at λ/4.',
    q1no: 'Try the numbers: put x = 1 and λ = 4 into A(x) = 2A·|cos(2πx/λ)| and see what amplitude comes out (step 1).',
    q2: '2. A string of length L = 6 m is pinned at both ends. What is the longest wavelength that can form a standing wave on it?',
    q2a: '6 m', q2b: '12 m', q2c: '3 m',
    q2ok: 'Right. The longest wavelength is n = 1: λ₁ = 2L/1 = {lam} m — the string holds just half a wavelength.',
    q2no: 'Back to step 2: L must equal n half-wavelengths, and the smallest n is 1, so the longest λ has L = λ/2.',
    q3: '3. True or false: “Nodes stay still because no wave reaches them.”',
    q3a: 'True', q3b: 'False',
    q3ok: 'Right — the statement is false. Both waves do reach a node; at every instant y₁ = −y₂, so they cancel (see the step-1 readout).',
    q3no: 'Look again at step 1: put P on a node and the readout shows y₁ and y₂ are not zero — they are just equal and opposite.',
    q4: '4. Press a guitar string at its midpoint so the vibrating part is half as long. By what factor does the fundamental change?',
    q4a: '½ ×', q4b: '2 ×', q4c: '4 ×',
    q4ok: 'Right. f₁ = v/(2L); halving L multiplies f₁ by {r}: {f0} Hz → {f1} Hz, one octave higher.',
    q4no: 'Back to step 3: f₁ = v/(2L) has L in the denominator. Does a shorter L make f₁ bigger or smaller?',
    check: 'Check',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Standing waves in three sentences',
    card1: '<strong>Superposition makes an envelope.</strong> Two identical waves running opposite ways add to y = 2A·cos(kx)·sin(ωt): the shape does not travel; it just stretches and flips in place with sin(ωt).',
    card2: '<strong>Position fixes the amplitude.</strong> A(x) = 2A·|cos(kx)|: nodes are λ/2 apart and never move, antinodes swing 2A, and crossing a node flips the phase.',
    card3: '<strong>Boundaries pick a ladder.</strong> Pinned ends allow only λₙ = 2L/n, so fₙ = n·f₁; push at one of those fₙ and you get resonance.',
    boundary: 'Where this holds: an ideal string (uniform, small linear vibrations, perfectly fixed ends, constant wave speed). Real strings have stiffness and damping, so high harmonics drift slightly off whole multiples; the peak heights and widths in step 4 are schematic. Wind instruments hold standing waves in air columns, and a column closed at one end keeps only the odd harmonics — not covered here.',
    linksTitle: 'Where to go next',
    lk1: 'Interference, step 1: two sources meet on a plane and the path difference decides boost or cancel — a pattern in space; here one wave meets its own reversed partner and vibrates in place on a line →',
    lk2: 'Trigonometry, step 2: where a sine wave comes from — unroll the height on a circle →',
    lk3: 'Resonance, step 3: a single oscillator’s resonance curve, and how damping sets peak height and width →',
    lk4: 'Sound waves, step 3: why a piano and a violin sound different on the same note — the mix of harmonics →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Standing Waves · The Wave That Stays in Place”.'
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
  if (typeof window.refreshStanding === 'function') window.refreshStanding();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SW_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
