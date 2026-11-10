'use strict';
// Sound-waves lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '声音是波 · 一疏一密传过来',
    back: '← 知识索引',
    compare: '对照另一版本：声音是波 · 看见自己的声音 →',
    navLabel: '声音是波步骤导航',
    tagline: '你说一句话，对面的人就听见了。从你嘴边到他耳朵，中间到底传过去了什么？这一页用六张会动的图回答：空气在原地来回振动，传过去的是一疏一密的图样；它有多密、多长、多高、什么形状，分别对应音调、波长、响度和音色。本页不播放声音，只按模型把波画出来。',
    nav0: '0 空气在传什么', nav1: '1 频率', nav2: '2 波长', nav3: '3 响度', nav4: '4 音色', nav5: '5 回声', nav6: '6 收束',

    s0k: '第 0 步 · 传的是什么',
    s0t: '声音从这边传到那边，空气也跟着跑过去了吗？',
    s0e: '这一步要回答：你说话时，嘴边的空气有没有一路跑进对方的耳朵？声音来自振动（<a class="xlink" href="../../../physics/waves/sound-vibration/#step0">→ 声音从振动来第 0 步：响着的鼓面在干什么</a>）。振动的物体推挤身边的空气：有的地方空气被挤紧，叫<strong>密部</strong>（那里的压强比平时略高）；有的地方被拉松，叫<strong>疏部</strong>（压强略低）。第一张图里每个小点代表一小团空气，红点是我们一直盯着的那一团；第二张图画各处压强比平时高多少，向上 = 挤紧。第三张图像一卷往下走的胶片：每一刻都把红点和各个密部的位置记一笔，越往下越早。',
    fLabel0: '声源频率 f（每秒振动次数）',
    play: '播放', pause: '暂停', stepQ: '前进 1/4 个周期', clearTrace: '清空轨迹',
    c0a: '一排空气（横轴：位置，单位 m）', c0b: '压强比平时高多少（向上 = 挤紧）', c0c: '轨迹胶片：越往下越早（纵轴：真实时间）',
    now: '现在',
    lg0Red: '红点：盯住的一团空气', lg0Comp: '橙线：密部的中心', lg0Trace: '胶片里的红线和橙线：它们走过的位置',
    s0readout: '已记录 {t} ms（真实时间，1 ms = 千分之一秒）：每个密部向右走了 {d} m，走的速度就是声速 {v} m/s；红点却一直在原地附近，离家最远 {a} m（这是画面放大后的值）。真实情况：像正常交谈那么响的 {f} Hz 声音里，一团空气只来回挪动约 {nm} 纳米（1 纳米 = 百万分之一毫米）。',
    s0hint: '观察顺序：先按「播放」看几秒，盯住第三张图：红点留下的是一条在原地左右抖的竖线，密部留下的是一条条向右下方延伸的斜线——斜线越往上（越晚）越靠右，说明疏密图样一直在向前走。再拖「声源频率」：斜线变密、红线抖得更快，但红点仍然不离开原地。画面慢放了 400 倍，空气的位移也放大了几百万倍；减弱动态时不自动播放，可以用「前进 1/4 个周期」一格格看。',

    s1k: '第 1 步 · 频率与周期',
    s1t: '麦克风只待在一个地方，怎样从它的记录读出频率？',
    s1e: '这一步要回答：密部一个接一个经过麦克风，每秒经过多少个？麦克风只测它所在那一点的压强。下图横轴是时间（单位 ms，毫秒），纵轴是那一点的压强比平时高多少（相对值，向上 = 挤紧）。每秒经过的密部个数叫<strong>频率 f</strong>，单位赫兹（Hz）；相邻两个密部经过的时间间隔叫<strong>周期 T</strong>，所以 T = 1 ÷ f。频率越高，我们听到的<strong>音调</strong>越高（<a class="xlink" href="../../../physics/waves/sound-vibration/#step2">→ 声音从振动来第 2 步：振得快慢决定音高</a>）。',
    fLabel1: '频率 f',
    c1a: '麦克风记录的压强（横轴：时间，单位 ms）',
    lg1Now: '当前频率的记录', lg1Prev: '上一次松手时的频率（对照）', lg1T: '橙色括号：相邻两个密部的时间间隔 T',
    s1readout: 'f = {f} Hz → 周期 T = 1 ÷ {f} Hz = {T} ms；图里 20 ms 内有 {n} 个完整周期（20 ms × f）。最接近钢琴上的 {note} 键（{nf} Hz）。',
    s1hint: '观察顺序：拖「频率」，看青色曲线变密、橙色括号标出的 T 变短；松手后，刚才那条曲线会留成灰色虚线，方便对比。试一试 440 Hz：这是乐队调音用的 A 音（钢琴上的 A4），T 约 2.27 ms。',

    s2k: '第 2 步 · 波长与声速',
    s2t: '同一个音在空气、水和钢里，一疏一密有多长？',
    s2e: '这一步要回答：密部之间隔多远？在同一时刻沿传播方向看，相邻两个密部之间的距离叫<strong>波长 λ</strong>（单位 m）。密部每秒前进的距离是<strong>声速 v</strong>。一个周期 T 里，每个密部恰好走到前一个密部原来的位置，也就是走了一个波长，所以 v = λ ÷ T，也就是 <strong>v = f·λ</strong>。下面三条带子用同一把尺子（0–10 m）和同一个频率，画同一时刻三种材料里的压强（向上 = 挤紧）。频率由声源决定，换了材料也不变；声速由材料决定，所以变的是波长。',
    fLabel2: '频率 f（三条带子共用）',
    runPeriod: '走一个周期 T',
    mAir: '空气（20 ℃）', mWater: '水', mSteel: '钢',
    stripTitle: '{name} · v = {v} m/s · λ = {lam} m',
    lg2Curve: '压强（向上 = 挤紧）', lg2Start: '虚线：橙点出发的位置', lg2Crest: '橙点：盯住的一个密部',
    s2line: '{name} {lam} m',
    s2readout: 'f = {f} Hz，T = {T} ms。波长 λ = v ÷ f：{lines}。已走 {p} 个周期：三个橙点分别走了 {da}、{dw}、{ds} m。{out}',
    s2out: '水和钢里的波长比画面还长，橙点会跑出画面。',
    s2outSteel: '钢里的波长比画面还长，橙点会跑出画面。',
    s2range: '人耳大约能听到 20 Hz 到 20 000 Hz（因人而异，年纪越大越听不见高音）。在 20 ℃ 空气里，这对应波长从 {l1} m 到 {l2} cm：低音的一个疏密比一层楼还高，高音的不到两厘米。',
    s2hint: '观察顺序：先按「走一个周期 T」，看每条带子上的橙点从虚线出发，一个周期后停在下一个密部原来的位置，走过的正好是一个波长；空气里走得最短，钢里最长。再拖「频率」：三条带子的密部都变密，但三者的波长之比始终等于声速之比。',

    s3k: '第 3 步 · 响度与分贝',
    s3t: '离喇叭远一倍，声音弱多少？',
    s3e: '这一步要回答：走远了声音变轻，变轻多少有没有规律？<strong>响度</strong>取决于压强起伏有多大，也就是波形的<strong>振幅</strong>（<a class="xlink" href="../../../physics/waves/sound-vibration/#step1">→ 声音从振动来第 1 步：敲得越重，振幅越大</a>）。人耳能听到的压强起伏从约 0.00002 Pa 到几十 Pa，相差上百万倍，所以常用<strong>分贝（dB）</strong>来记：L = 20·lg(p ÷ 0.00002 Pa)。这里 p 是压强起伏的「有效值」（对正弦波，有效值 = 振幅 ÷ √2）；lg 是以 10 为底的对数，高中会学，本页只用它的两条结论：p 变成 10 倍，L 加 20 dB；p 变成 2 倍，L 加约 6 dB。在空旷处，一个小声源发出的压强起伏和距离成反比：距离翻倍，p 减半。',
    rLabel: '离声源的距离 r（m）', L1Label: '1 m 处的响度（dB）', clearDots: '清空白点',
    c3a: '你耳边的压强起伏（以 250 Hz 的声音为例；纵轴：Pa）', c3b: '响度 L 随距离 r 的变化（横轴：m，纵轴：dB）',
    lg3Here: '青色：你所在位置的波形', lg3Near: '灰色虚线：1 m 处的波形', lg3Curve: '橙色曲线：L = L₁ − 20·lg r', lg3Dot: '白点：你试过的距离', lg3Risk: '红色虚线：85 dB',
    s3readout: '1 m 处 {L1} dB；在 r = {r} m 处，p 变成 1 m 处的 1/{r}，L = {L1} − 20·lg {r} = {L} dB，压强振幅 {pk} Pa。{risk}',
    s3risk: '已在 85 dB 以上：长时间（约 8 小时）待在这样响的地方会损伤听力。',
    s3hint: '观察顺序：保持「1 m 处的响度」不变，把「距离」依次拖到 2、4、8、16、32 m，看下图留下的白点：每翻一倍都下降同样的约 6 dB，上图青色波形的振幅每次减半。再改「1 m 处的响度」，整条曲线一起上下平移，形状不变。这个规律只在空旷、没有墙壁反射的地方成立；在屋里，反射声会让远处比公式算的更响。',

    s4k: '第 4 步 · 音色',
    s4t: '音高一样，为什么不同乐器、不同人的声音听起来不一样？',
    s4e: '这一步要回答：音调相同时，是什么让声音有不同的「味道」——也就是<strong>音色</strong>？乐器和嗓子发出的声音一般不是单纯的正弦波，而是好几个正弦波的和：频率为 f₀ 的<strong>基音</strong>，加上频率为 2f₀、3f₀……的<strong>谐波</strong>（第 n 次谐波的频率是基音的 n 倍）。下面取 f₀ = 220 Hz，用滑杆调每次谐波的振幅。第一张图是加起来的波形（横轴时间 ms，灰色虚线是只有基音的纯音），第二张图是<strong>频谱</strong>：每根柱子是一个成分，横轴是它的频率，高度是它的振幅。用手机上的示波器类应用对着自己说「啊——」，看到的也是一段这样重复的、带棱角的波形。',
    harm: '第 {n} 次（{f} Hz）',
    pPure: '纯音（只有基音）', pOdd: '奇次谐波 1、1/3、1/5', pAll: '全部谐波 1/n', pBright: '高次谐波更强（自拟配方）',
    c4a: '合成波形（横轴：时间，单位 ms）', c4b: '频谱（横轴：频率，单位 Hz；纵轴：振幅）',
    lg4Wave: '青色：各成分加起来的波形', lg4Pure: '灰色虚线：振幅为 1 的纯基音', lg4Bars: '柱子：每个成分的振幅', lg4Rep: '橙色竖线：波形重复的位置',
    s4readout: '共 {k} 个成分；波形每 {T} ms 重复一次，重复频率 {fr} Hz，这就是听到的音高。{missing}',
    s4missing: '基音已关掉：剩下谐波频率的最大公约数是 {g} × 220 Hz，波形就按它重复。',
    s4silent: '所有成分都关掉了：没有声音。',
    s4hint: '观察顺序：依次点「纯音」「奇次谐波」「全部谐波」，看第一张图的形状从圆滑变成接近方波、锯齿波，但橙色竖线之间的距离不变——重复得一样快，所以音调不变，变的只是形状。再只把第 1 次拖到 0：只要第 2、3 次都还在，重复周期仍不变；只留第 2、4、6 次时，周期减半，音调升高一个八度。',

    s5k: '第 5 步 · 回声测距',
    s5t: '对着远处的墙拍一下手，回声隔多久回来？',
    s5e: '这一步要回答：能不能用回声量出墙有多远？拍手声以声速 v 跑到墙，被反射后再跑回来，一共走了 2d（d 是你到墙的距离），所以回声的延迟 Δt = 2d ÷ v，反过来 <strong>d = v·Δt ÷ 2</strong>。空气的声速随温度略有变化：v ≈ 331.3 + 0.606·T（T 是摄氏温度，v 的单位是 m/s）。第一张图是你和墙；第二张图横轴是拍手后的时间，纵轴是声音的最前端离你多远：去程往上、回程往下，画成一个尖顶。人耳要把原声和回声听成两个声音，一般需要相隔约 0.1 s 以上（灰色区域里两者会混成一片）。',
    dLabel: '墙的距离 d（m）', TLabel: '气温 T（℃）', clap: '拍一下手',
    c5a: '你和墙（横轴：距离，单位 m）', c5b: '声音最前端离你多远（横轴：时间 s，纵轴：m）',
    lg5You: '青色竖线：你', lg5Wall: '灰色块：墙', lg5Pulse: '橙色：声音的最前端', lg5Zone: '灰色区域：0.1 s 以内',
    s5readout: '气温 {T} ℃：v = 331.3 + 0.606 × {T} = {v} m/s；墙在 {d} m → Δt = 2 × {d} ÷ {v} = {dt} s。{sep}',
    s5sep: '超过 0.1 s，能听出单独的回声。',
    s5merge: '不到 0.1 s：回声和原声混在一起，听不出单独的回声（这个气温下墙至少要 {dmin} m 远）。',
    s5hint: '观察顺序：按「拍一下手」，看第一张图里的橙线跑到墙再折回，第二张图同时画出尖顶，尖顶右脚就是听到回声的时刻。把「墙的距离」拉近到约 17 m 以内，尖顶右脚落进灰色区域。再只改「气温」：声速变化不到 10%，尖顶只轻微变宽或变窄。动画慢放了 2 倍。',
    quizPrompt: '算一算：气温 15 ℃，拍手后 0.6 s 听到回声，墙大约多远？',
    quizA: '约 {a} m', quizB: '约 {b} m', quizC: '约 {c} m',
    check: '核对',
    correct: '对。15 ℃ 时 v = {v} m/s，0.6 s 里声音往返共走 {tot} m，墙在一半处，约 {d} m。',
    wrong: '再想想：0.6 s 是声音「去 + 回」的总时间，墙的距离只是总路程的一半。',

    s6k: '第 6 步 · 收束',
    s6t: '一段声音，四个可以看见的量',
    s6fin: '空气在原地来回振动，向前传的是一疏一密的图样（第 0 步）。每秒经过的密部数是频率 f，决定音调，周期 T = 1/f（第 1 步）；一个疏密的长度是波长 λ，v = f·λ，声速由材料决定（第 2 步）；压强起伏的大小决定响度，用分贝记，空旷处距离翻倍约降 6 dB（第 3 步）；波形的形状由谐波的配比决定，就是音色（第 4 步）；回声往返一趟，d = v·Δt/2（第 5 步）。',
    formula: 'T = 1/f\nv = f·λ\nL = 20·lg(p / p₀)\nd = v·Δt / 2',
    boundary: '适用范围：本页把声音当作一维、无损耗的线性波，声速取常数；分贝随距离的规律只在空旷、无反射处成立；0.1 s 和 85 dB 是常用的典型值，个人差异很大。本页不播放声音，所有图都按模型计算，不是录音。',
    linksTitle: '接着去哪儿',
    lk1: '→ 多普勒效应第 1 步：声源在动，前面的波被挤密、后面的被拉疏',
    lk2: '→ 驻波第 3 步：一根弦为什么只发出基音和整数倍的谐波',
    lk3: '→ 共振第 3 步：只有在固有频率附近，振幅才冲得高',
    lk4: '→ 傅里叶变换第 5 步：把任意波形拆成频谱（大学内容）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《声音是波 · 看见自己的声音》的平行版本。'
  },
  en: {
    pageTitle: 'Sound Is a Wave · A Pattern of Squeezes on the Move',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Sound Is a Wave · Seeing Your Own Voice →',
    navLabel: 'Sound-wave steps',
    tagline: 'You say something and the person across the room hears it. What actually travels from your mouth to their ear? Six moving pictures answer that: the air only jiggles in place, and what travels is a pattern of squeezed and loosened air. How tightly packed, how long, how tall and what shape that pattern is gives you pitch, wavelength, loudness and timbre. The page plays no sound; it draws the waves from a model.',
    nav0: '0 What travels', nav1: '1 Frequency', nav2: '2 Wavelength', nav3: '3 Loudness', nav4: '4 Timbre', nav5: '5 Echo', nav6: '6 Wrap-up',

    s0k: 'Step 0 · What travels',
    s0t: 'When sound crosses a room, does the air go along with it?',
    s0e: 'The question here: when you speak, does the air at your lips end up inside your friend’s ear? Sound starts with something vibrating (<a class="xlink" href="../../../physics/waves/sound-vibration/#step0">→ Sound from vibration, step 0: what a ringing drumhead is doing</a>). The vibrating object shoves the air next to it, so some places get squeezed — a <strong>compression</strong>, where the pressure is a little above normal — and others get stretched — a <strong>rarefaction</strong>, a little below. In the first picture each dot is a small parcel of air, and the red one is the parcel we keep our eye on. The second picture shows how far the pressure is above normal at each place (up = squeezed). The third is like a roll of film running downward: at every instant it marks where the red parcel and each compression are, older moments lower down.',
    fLabel0: 'Source frequency f (vibrations per second)',
    play: 'Play', pause: 'Pause', stepQ: 'Advance 1/4 period', clearTrace: 'Clear the traces',
    c0a: 'A row of air (across: position in m)', c0b: 'Pressure above normal (up = squeezed)', c0c: 'Trace film: lower = earlier (down: real time)',
    now: 'now',
    lg0Red: 'Red dot: the parcel we follow', lg0Comp: 'Orange line: centre of a compression', lg0Trace: 'Red and orange lines in the film: where they have been',
    s0readout: 'Recorded {t} ms of real time (1 ms = a thousandth of a second): every compression has moved {d} m to the right — the speed of sound, {v} m/s — while the red parcel stays near home, never more than {a} m away (that is the enlarged on-screen value). In reality, in a {f} Hz sound about as loud as normal conversation, a parcel of air moves back and forth by only about {nm} nanometres (a nanometre is a millionth of a millimetre).',
    s0hint: 'What to watch: press Play and give it a few seconds, eyes on the third picture. The red parcel leaves a vertical line that wiggles in place; the compressions leave slanted lines that sit further right the higher (later) you look — the pattern keeps moving forward. Then drag the source frequency: the slanted lines crowd together and the red line wiggles faster, but the red parcel still never leaves home. The animation runs 400 times slower than reality and the motion of the air is enlarged millions of times; with reduced motion it does not play by itself, so use “Advance 1/4 period” to step through.',

    s1k: 'Step 1 · Frequency and period',
    s1t: 'A microphone sits in one place. How do you read the frequency off its recording?',
    s1e: 'The question here: compressions pass the microphone one after another — how many per second? The microphone only measures the pressure at its own spot. In the plot, across is time (in ms, milliseconds) and up is how far the pressure there is above normal (relative units, up = squeezed). The number of compressions passing per second is the <strong>frequency f</strong>, measured in hertz (Hz); the time between two neighbouring compressions is the <strong>period T</strong>, so T = 1 ÷ f. The higher the frequency, the higher the <strong>pitch</strong> we hear (<a class="xlink" href="../../../physics/waves/sound-vibration/#step2">→ Sound from vibration, step 2: faster vibration, higher pitch</a>).',
    fLabel1: 'Frequency f',
    c1a: 'Pressure at the microphone (across: time in ms)',
    lg1Now: 'Recording at the current frequency', lg1Prev: 'The frequency where you last let go (for comparison)', lg1T: 'Orange bracket: time T between two compressions',
    s1readout: 'f = {f} Hz → period T = 1 ÷ {f} Hz = {T} ms; the 20 ms shown hold {n} full periods (20 ms × f). Nearest piano key: {note} ({nf} Hz).',
    s1hint: 'What to watch: drag the frequency and the cyan curve bunches up while the orange bracket marking T shrinks. When you let go, the curve you just had stays behind as a grey dashed line for comparison. Try 440 Hz — the A an orchestra tunes to (A4 on a piano), with T about 2.27 ms.',

    s2k: 'Step 2 · Wavelength and speed',
    s2t: 'The same note in air, water and steel — how long is one squeeze-and-stretch?',
    s2e: 'The question here: how far apart are the compressions? Freeze time and look along the direction of travel: the distance between neighbouring compressions is the <strong>wavelength λ</strong> (in m). How far a compression advances each second is the <strong>speed of sound v</strong>. In one period T each compression moves up to where the one ahead of it used to be — exactly one wavelength — so v = λ ÷ T, that is, <strong>v = f·λ</strong>. The three strips below share one ruler (0–10 m) and one frequency, and show the pressure in three materials at the same instant (up = squeezed). The source sets the frequency, and it stays the same in another material; the material sets the speed — so it is the wavelength that changes.',
    fLabel2: 'Frequency f (shared by all three strips)',
    runPeriod: 'Run one period T',
    mAir: 'Air (20 °C)', mWater: 'Water', mSteel: 'Steel',
    stripTitle: '{name} · v = {v} m/s · λ = {lam} m',
    lg2Curve: 'Pressure (up = squeezed)', lg2Start: 'Dashed line: where the orange dot started', lg2Crest: 'Orange dot: one compression we follow',
    s2line: '{name} {lam} m',
    s2readout: 'f = {f} Hz, T = {T} ms. Wavelength λ = v ÷ f: {lines}. {p} of a period run so far: the three orange dots have moved {da}, {dw} and {ds} m. {out}',
    s2out: 'In water and steel the wavelength is longer than the strip, so the orange dot runs off the edge.',
    s2outSteel: 'In steel the wavelength is longer than the strip, so the orange dot runs off the edge.',
    s2range: 'People hear roughly 20 Hz to 20,000 Hz (it varies, and high notes fade with age). In air at 20 °C that means wavelengths from {l1} m down to {l2} cm: one squeeze-and-stretch of a deep note is taller than a storey of a house, of a high one less than two centimetres.',
    s2hint: 'What to watch: press “Run one period T” and follow the orange dot in each strip. It leaves the dashed line and, one period later, stops where the next compression used to be — it has travelled exactly one wavelength, shortest in air and longest in steel. Then drag the frequency: compressions bunch up in all three strips, but the ratio of their wavelengths always equals the ratio of their speeds.',

    s3k: 'Step 3 · Loudness and decibels',
    s3t: 'Twice as far from the speaker — how much quieter?',
    s3e: 'The question here: sound gets quieter as you walk away, but by a rule? <strong>Loudness</strong> depends on how big the pressure swings are — the <strong>amplitude</strong> of the wave (<a class="xlink" href="../../../physics/waves/sound-vibration/#step1">→ Sound from vibration, step 1: hit harder, bigger amplitude</a>). Ears handle pressure swings from about 0.00002 Pa up to tens of Pa, a range of millions, so we use <strong>decibels (dB)</strong>: L = 20·log₁₀(p ÷ 0.00002 Pa). Here p is the “effective” (RMS) size of the swing — for a sine wave, amplitude ÷ √2. You will meet the logarithm properly later; this page only needs two facts from it: multiply p by 10 and L goes up 20 dB; multiply p by 2 and L goes up about 6 dB. Out in the open, the pressure swing from a small source falls in proportion to distance: double the distance, halve p.',
    rLabel: 'Distance from the source r (m)', L1Label: 'Loudness at 1 m (dB)', clearDots: 'Clear the white dots',
    c3a: 'Pressure swing at your ear (250 Hz example; up: Pa)', c3b: 'Loudness L against distance r (across: m, up: dB)',
    lg3Here: 'Cyan: the wave where you stand', lg3Near: 'Grey dashed: the wave at 1 m', lg3Curve: 'Orange curve: L = L₁ − 20·log₁₀ r', lg3Dot: 'White dots: distances you tried', lg3Risk: 'Red dashed: 85 dB',
    s3readout: '{L1} dB at 1 m; at r = {r} m, p is 1/{r} of its 1 m value, so L = {L1} − 20·log₁₀ {r} = {L} dB, with a pressure amplitude of {pk} Pa. {risk}',
    s3risk: 'That is above 85 dB: spending long stretches (around 8 hours) somewhere this loud damages hearing.',
    s3hint: 'What to watch: keep “Loudness at 1 m” fixed and drag the distance to 2, 4, 8, 16 and 32 m in turn. The white dots left in the lower plot drop by the same 6 dB or so at each doubling, while the cyan wave above halves its amplitude each time. Then change “Loudness at 1 m”: the whole curve slides up or down without changing shape. The rule only holds in the open, with no walls bouncing sound back; indoors, reflections keep distant spots louder than the formula says.',

    s4k: 'Step 4 · Timbre',
    s4t: 'Same pitch — so why do different instruments and voices sound different?',
    s4e: 'The question here: when the pitch is the same, what gives a sound its particular character — its <strong>timbre</strong>? Instruments and voices rarely produce a pure sine wave. They produce a sum of sine waves: a <strong>fundamental</strong> at frequency f₀ plus <strong>harmonics</strong> at 2f₀, 3f₀, … (the nth harmonic is n times the fundamental frequency). Below, f₀ = 220 Hz and the sliders set the amplitude of each harmonic. The first plot is the summed waveform (across: time in ms; the grey dashed line is the fundamental alone, a pure tone). The second is the <strong>spectrum</strong>: one bar per component, placed at its frequency, as tall as its amplitude. Point an oscilloscope-style phone app at yourself and say “aah” and you will see the same kind of repeating, angular waveform.',
    harm: 'Harmonic {n} ({f} Hz)',
    pPure: 'Pure tone (fundamental only)', pOdd: 'Odd harmonics 1, 1/3, 1/5', pAll: 'All harmonics 1/n', pBright: 'Strong upper harmonics (made-up recipe)',
    c4a: 'Summed waveform (across: time in ms)', c4b: 'Spectrum (across: frequency in Hz; up: amplitude)',
    lg4Wave: 'Cyan: all components added up', lg4Pure: 'Grey dashed: the fundamental alone at amplitude 1', lg4Bars: 'Bars: amplitude of each component', lg4Rep: 'Orange ticks: where the waveform repeats',
    s4readout: '{k} components; the waveform repeats every {T} ms, a repetition rate of {fr} Hz — that is the pitch you hear. {missing}',
    s4missing: 'The fundamental is switched off: the remaining harmonics share a greatest common factor of {g} × 220 Hz, and the waveform repeats at that rate.',
    s4silent: 'Every component is switched off: silence.',
    s4hint: 'What to watch: click “Pure tone”, “Odd harmonics” and “All harmonics” in turn. The shape goes from smooth to nearly square to sawtooth, yet the spacing of the orange ticks never changes — it repeats just as often, so the pitch stays put and only the shape changes. Then drag harmonic 1 alone to 0: as long as harmonics 2 and 3 are still there, the repeat time is unchanged. Keep only 2, 4 and 6 and the period halves — the pitch jumps up an octave.',

    s5k: 'Step 5 · Measuring by echo',
    s5t: 'Clap at a distant wall — how long until the echo comes back?',
    s5e: 'The question here: can an echo tell you how far away the wall is? The clap travels to the wall at the speed of sound v, bounces, and travels back — 2d in all, where d is your distance to the wall. So the echo arrives after Δt = 2d ÷ v, and turning that around, <strong>d = v·Δt ÷ 2</strong>. The speed of sound in air shifts a little with temperature: v ≈ 331.3 + 0.606·T (T in °C, v in m/s). The first picture shows you and the wall. In the second, across is time since the clap and up is how far the front of the sound is from you: up on the way out, down on the way back, drawing a peak. To hear the clap and its echo as two separate sounds, they usually need to be at least about 0.1 s apart (inside the grey band they blur into one).',
    dLabel: 'Distance to the wall d (m)', TLabel: 'Air temperature T (°C)', clap: 'Clap once',
    c5a: 'You and the wall (across: distance in m)', c5b: 'How far the sound’s front is from you (across: time in s; up: m)',
    lg5You: 'Cyan line: you', lg5Wall: 'Grey block: the wall', lg5Pulse: 'Orange: the front of the sound', lg5Zone: 'Grey band: within 0.1 s',
    s5readout: 'At {T} °C: v = 331.3 + 0.606 × {T} = {v} m/s; wall at {d} m → Δt = 2 × {d} ÷ {v} = {dt} s. {sep}',
    s5sep: 'More than 0.1 s, so you hear a separate echo.',
    s5merge: 'Under 0.1 s: the echo blends into the clap and you cannot pick it out (at this temperature the wall must be at least {dmin} m away).',
    s5hint: 'What to watch: press “Clap once”. In the first picture the orange line runs to the wall and back while the second picture draws the peak; the peak’s right foot is the moment you hear the echo. Pull the wall in closer than about 17 m and that foot lands inside the grey band. Then change only the temperature: the speed moves by less than 10%, so the peak only gets slightly wider or narrower. The animation runs at half speed.',
    quizPrompt: 'Work it out: at 15 °C you hear the echo 0.6 s after clapping. Roughly how far away is the wall?',
    quizA: 'About {a} m', quizB: 'About {b} m', quizC: 'About {c} m',
    check: 'Check',
    correct: 'Right. At 15 °C, v = {v} m/s, so in 0.6 s the sound covers {tot} m there and back; the wall is halfway, about {d} m.',
    wrong: 'Think again: 0.6 s is the time for the sound to go out and come back, so the wall is only half of the total distance.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'One sound, four quantities you can see',
    s6fin: 'The air only jiggles in place; what travels forward is a pattern of squeezes and stretches (step 0). The number of compressions passing per second is the frequency f, which sets the pitch, with period T = 1/f (step 1). The length of one squeeze-and-stretch is the wavelength λ, with v = f·λ and the speed set by the material (step 2). The size of the pressure swing sets the loudness, measured in decibels, and in the open each doubling of distance costs about 6 dB (step 3). The shape of the waveform comes from the mix of harmonics — that is timbre (step 4). An echo makes a round trip, so d = v·Δt/2 (step 5).',
    formula: 'T = 1/f\nv = f·λ\nL = 20·log₁₀(p / p₀)\nd = v·Δt / 2',
    boundary: 'Where this holds: the page treats sound as a one-dimensional, lossless, linear wave with a constant speed; the decibel-versus-distance rule needs open space with no reflections; 0.1 s and 85 dB are common typical values and vary a lot between people. The page plays no sound — every picture is computed from the model, not recorded.',
    linksTitle: 'Where to go next',
    lk1: '→ Doppler effect, step 1: a moving source crowds the waves ahead and stretches those behind',
    lk2: '→ Standing waves, step 3: why a string sounds only its fundamental and whole-number harmonics',
    lk3: '→ Resonance, step 3: only near the natural frequency does the swing get large',
    lk4: '→ The Fourier transform, step 5: splitting any waveform into a spectrum (university level)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Sound Is a Wave · Seeing Your Own Voice”.'
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
