'use strict';
// Sound from vibration — lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '声音从哪里来 · 跳动的米粒告诉你',
    back: '← 知识索引',
    compare: '对照另一版本：声音从振动来 · 米粒会跳的鼓 →',
    navLabel: '声音与振动步骤导航',
    tagline: '敲一下鼓，鼓面上的米粒会跳起来。米粒为什么跳？声音又是怎么从鼓跑进耳朵的？六步里你会看到：声音来自振动，振得越厉害越响，振得越快音调越高，声音要靠空气这样的东西才能传过去，而且它跑得并不算快。',
    nav0: '0 敲鼓', nav1: '1 穿过空气', nav2: '2 响和轻', nav3: '3 高和低', nav4: '4 抽走空气', nav5: '5 声音的速度', nav6: '6 回顾',

    s0k: '第 0 步 · 敲一下鼓',
    s0t: '鼓响的时候，鼓面在做什么？',
    s0e: '这一步要回答：鼓在响的时候，鼓面在做什么？我们在鼓面上撒几粒米，再敲一下。图的上半部分是从侧面看的鼓：橙色线是鼓面，白色小块是米粒。鼓面会快速地一上一下来回运动，这样的来回运动叫<strong>振动</strong>。真实的鼓面每秒振动 100 次，眼睛跟不上，所以动画放慢了 20 倍；鼓面移动的距离也很小（不到 1 毫米），图里鼓面的移动和米粒跳起的高度按同一个比例放大了。下半部分记录鼓面中心的位置：横轴是真实时间（毫秒，1 毫秒是千分之一秒），纵轴是鼓面中心比静止时高出多少毫米。振动的幅度降到刚敲时的 1% 以下，本页就算它停了。',
    s0lgHead: '鼓面（橙线）', s0lgRice: '米粒（虚线标出它到目前跳过的最高处）', s0lgTrace: '鼓面中心的位置记录',
    c0a: '侧面看鼓（慢放 20 倍，位移放大）', c0b: '鼓面中心的高度（毫米）对真实时间（毫秒）',
    hit: '敲一下', mute: '按住鼓面', reset: '重来',
    s0idle: '还没敲。按「敲一下」开始。',
    s0readout: '真实时间 {t} 毫秒（动画慢放 20 倍）：鼓面已经来回振动了 {n} 次，现在的振动幅度约 {amp} 毫米 → {status}',
    soundOn: '鼓还在响。', soundOff: '振动几乎停了，声音也停了。', soundMuted: '手按住了鼓面，振动很快停下，声音也跟着停了。',
    s0hint: '观察顺序：先按「敲一下」，看米粒随鼓面被抛起；下图的曲线一边上下摆，一边越摆越小，声音变轻时米粒也跳不起来了。再敲一次，趁鼓还在响时按「按住鼓面」：手让振动很快停下，曲线立刻变平，读数显示声音也停了。没有振动，就没有声音。',

    s1k: '第 1 步 · 穿过空气',
    s1t: '鼓在这儿，耳朵在那儿，振动是怎么走过去的？',
    s1e: '这一步要回答：鼓和耳朵之间隔着空气，鼓面的振动是怎样传到耳朵里的？空气是由数不清的微小颗粒组成的。图上一个个小点代表一小团一小团的空气（示意）。鼓面往右一推，就把挨着它的空气挤紧；被挤紧的空气又去推下一团……于是「挤紧（点密）、放松（点疏）」的花样一团接一团地往外传，这就是<strong>声波</strong>（<a class="xlink" href="../../../physics/waves/sound-waves/#step0">→ 声波页第 0 步：声音在空气里传，到底是什么在动</a>）。为了让疏密看得清，这一步的鼓每秒振动 300 次。我们给其中一团空气涂成粉色。下图记录这团粉色空气离开原来位置的情况：横轴是真实时间（毫秒），往上表示被推向右边、往下表示退回左边。动画比真实慢 500 倍，空气的来回移动也放大了很多倍，好让眼睛看得见。',
    s1lgAir: '空气（一个点代表一小团）', s1lgMark: '做了记号的那团空气', s1lgFront: '声波最前面跑到了哪里',
    c1a: '鼓 → 空气（慢放 500 倍，距离单位：米）', c1b: '粉色空气团的位移（右为正）对时间（毫秒）',
    play1: '▶ 敲鼓并播放', pause1: '⏸ 暂停',
    s1readout: '真实时间 {t} 毫秒：声波最前面已经跑出 {front} 米（每毫秒约 0.343 米）。{mark}',
    markWait: '声波还没到粉色那团空气，它还没动。', markStart: '声波刚到，粉色那团空气开始被推动。',
    markMove: '粉色那团空气已经来回振动了 {n} 次，可它一直在原来的位置附近，没有跟着声波跑走。',
    s1hint: '观察顺序：按「敲鼓并播放」，先看点的疏密花样从鼓向右一路传开（青色虚线是最前面）；再只盯着粉色那团空气：花样到达后它开始左右来回，但一直待在原地附近。下图它的位置曲线只在零线上下摆，从不一直往上走。往外跑的是「挤紧、放松」的花样，不是空气本身。',

    s2k: '第 2 步 · 响和轻',
    s2t: '敲得越用力，米粒和声音会怎样？',
    s2e: '这一步要回答：敲得越用力，鼓面振动得越厉害，声音越响，这个「厉害」怎样量？鼓面离开静止位置最远的距离叫<strong>振幅</strong>（单位：毫米）。上图画出被敲后 0.3 秒里鼓面中心（橙）和中心那粒米（白）的高度：米粒每离开鼓面一次，就画出一道弧线。下图横轴是振幅，纵轴是米粒最高跳到鼓面最高点以上多少毫米，你试过的每个振幅都会留下一个点。声音有多响，常用<strong>分贝</strong>来说：声音带的能量和振幅的平方成正比，振幅变成 2 倍，能量变成 4 倍，就响了大约 6 分贝；能量每变成 10 倍，就加 10 分贝。这里把振幅 0.1 毫米时的声音当作比较的起点（0 分贝）。',
    amp: '振幅（毫米）',
    s2lgHead: '鼓面中心的高度', s2lgRice: '中心那粒米的高度', s2lgTh: '米粒刚好能离开鼓面的振幅', s2lgDots: '你试过的振幅',
    c2a: '敲后 0.3 秒：高度（毫米）对时间（毫秒）', c2b: '米粒跳过鼓面顶点（毫米）对振幅（毫米）',
    s2readout: '振幅 {A} 毫米：米粒最高跳到鼓面最高点以上 {lift} 毫米。和振幅 0.1 毫米时相比，声音的能量是 {E} 倍，响度 {db} 分贝。',
    s2low: '振幅不到 {th} 毫米时，鼓面往下退得还没有米粒自己往下掉得急，米粒一直贴着鼓面，不会跳起来；可鼓仍然在响，只是很轻。',
    s2hint: '观察顺序：把振幅从最小慢慢往大拖。最小时上图白线和橙线完全重合（米粒贴着鼓面）；越过下图粉色虚线后，白线开始离开橙线；振幅越大，弧线越高。下图的点连起来是一条越来越陡的弯线：振幅变成 2 倍，米粒跳的高度大约变成 4 倍。',

    s3k: '第 3 步 · 高和低',
    s3t: '振动得更快，声音会有什么不同？',
    s3e: '这一步要回答：振幅一样，振动得快和振动得慢，听起来有什么不同？把鼓换成一个能调快慢的振动片。每秒振动多少次叫<strong>频率</strong>，单位是<strong>赫兹</strong>（Hz）：100 Hz 就是每秒来回 100 次。上图画出 20 毫秒（0.02 秒）里的振动，横轴是时间（毫秒），纵轴是振动片的位置，灰色虚线是 100 Hz 的振动，留作对照。频率越高，同样的时间里来回的次数越多，听起来<strong>音调</strong>越高（声音越尖、越细）。振动片每来回一次，空气里就多出一组「挤紧、放松」，一组在空气里占的长度叫<strong>波长</strong>，等于声速 ÷ 频率；下图的绿条就是它，横轴单位是米。按「听一听」能听到当前频率的声音（音量很小，约 1 秒后自动停）。',
    freq: '频率（Hz，每秒振动的次数）',
    s3lgWave: '当前频率的振动', s3lgRef: '100 Hz 的振动（对照）', s3lgLam: '一个波长有多长',
    c3a: '20 毫秒里的振动：位置对时间（毫秒）', c3b: '空气里一个波长有多长（米）',
    listen: '🔊 听一听', stopSound: '停止声音',
    s3readout: '{f} Hz：20 毫秒里振动 {n} 次，每来回一次用 {T} 毫秒；在空气里一个波长约 {lam} 米。最接近钢琴上的 {note} 音（{noteHz} Hz）。{audio}',
    audioPlaying: '正在播放 {f} Hz 的声音……', audioNone: '这个浏览器不能播放声音，请看图和读数比较。',
    s3hint: '观察顺序：把频率从 100 往 1000 拖，上图的来回越挤越密（数一数 20 毫秒里有几个波峰），下图的绿条越来越短；每换一个频率就按一次「听一听」，比比音调。频率变成 2 倍，音调正好高出一个八度（钢琴上同名的下一个音）。',

    s4k: '第 4 步 · 抽走空气',
    s4t: '把空气抽走，还能听见铃声吗？',
    s4e: '这一步要回答：声音靠空气传，没有空气会怎样？把一个响着的电铃放进玻璃罩，再用抽气机一点一点抽走罩里的空气。像空气、水、铁这样能把振动一团一团传过去的东西，叫<strong>介质</strong>。图中罩里的小点代表剩下的空气，罩外的圆圈代表传到外面的声音，圈越淡声音越轻。请注意这是示意：本页让传出来的声音强弱和罩里剩下的空气多少成正比，只用来显示变化的方向，不是精确的规律。真实实验里空气很难抽得一干二净，铃也挂在架子上，所以通常还能听到极轻的声音。',
    s4lgAir: '罩里剩下的空气', s4lgBell: '电铃和铃锤', s4lgRing: '传到罩外的声音（越淡越轻）',
    c4a: '玻璃罩里的电铃（示意）',
    airLeft: '罩里剩下的空气（%）', pumpOut: '▶ 抽气', letIn: '放气',
    s4readout: '罩里的空气还剩 {pct}%：铃锤一直在敲，铃一直在振动；传到罩外的声音{level}。',
    lvClear: '听得清清楚楚', lvFaint: '明显变轻了', lvNone: '几乎听不到了（示意：剩下不到 5% 时）',
    s4hint: '观察顺序：按「抽气」，看罩里的点越来越少、罩外的圆圈越来越淡，而铃锤从头到尾都在敲；再按「放气」，声音回来了。也可以直接拖滑杆。铃一直在振动，可是没有介质，振动就传不出来。',

    s5k: '第 5 步 · 声音的速度',
    s5t: '为什么总是先看到闪电，后听到雷声？',
    s5e: '这一步要回答：闪电和雷声是同时产生的，为什么雷声总是晚到？声音在空气里每秒大约跑 343 米（气温约 20 ℃ 时，天冷时慢一些）。光快得多，每秒约 30 万千米，跑 3 千米也只要十万分之一秒，可以看成一下子就到。声音在水里和钢铁里跑得更快，这里用常见的数值：水里约 1480 米每秒，钢里约 5100 米每秒（<a class="xlink" href="../../../physics/waves/sound-waves/#step4">→ 声波页第 4 步：数秒数算出雷声有多远</a>）。图上四条跑道从同一处同时出发，跑同样远，横轴是距离（千米）。按「出发」后，动画按真实时间进行，每条跑道的声音到达终点时，下图就在对应的时刻立起一根同色的柱子，粉色虚线是现在的时刻。',
    s5lgLight: '光（闪电）', s5lgAir: '空气中的声音', s5lgWater: '水中的声音', s5lgSteel: '钢中的声音',
    c5a: '同时出发：距离（千米）', c5b: '到达终点的时刻（秒）', dist: '距离（千米）',
    go: '▶ 出发',
    s5readout: '{el}距离 {d} 千米，到达终点要用：光 ≈ 0 秒，空气 {ta} 秒，水 {tw} 秒，钢 {ts} 秒。经验法则：看到闪电后数秒数，每 3 秒大约是 1 千米（3 × 343 = 1029 米）。',
    s5elapsed: '已过去 {e} 秒 · ',
    s5hint: '观察顺序：按「出发」，看白色的光一下子就到了终点，三种声音一前一后跑来，每到一个，下图就立起一根柱；再把距离改成 2 千米重新出发，三根柱的时刻都变成原来的 2 倍。',

    s6k: '第 6 步 · 回顾',
    s6t: '声音的一生：振动、传播、到达',
    s6fin: '<strong>回顾。</strong>声音来自振动：鼓面一停，声音就停。振动推动空气，「挤紧、放松」的花样一团接一团往外传，空气本身只在原地来回。振幅越大，声音越响；频率越高，音调越高。没有介质，振动传不出去；有介质时，声音也要花时间赶路，在空气里每秒约 343 米。',
    formula: '没有振动 → 没有声音\n振幅 × 2 → 能量 × 4，约响 6 分贝\n频率 × 2 → 音调高一个八度\n波长 = 声速 ÷ 频率\n距离 = 声速 × 时间',
    boundary: '说明：本页的鼓是简化模型：鼓面只按一种最简单的形状振动，衰减快慢是固定的，米粒落回时粘住、不反弹；空气点的位移和动画速度都做了放大和慢放；玻璃罩一步是示意；水和钢的声速是常见的典型值，会随温度和材料变化。',
    linksTitle: '接着去哪儿',
    lk1: '→ 声波（初中）第 1 步：示波器上的一个周期和地上的一个波长',
    lk2: '→ 乐理第 0 步：两个音高之间的距离怎样数',
    lk3: '→ 驻波第 0 步：两列波迎面跑，波形为什么会停下来',
    lk4: '→ 共振第 0 步：没人推的时候，振子有自己的节拍',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《声音从振动来 · 米粒会跳的鼓》的平行版本。'
  },
  en: {
    pageTitle: 'Where Sound Comes From · What the Jumping Rice Tells You',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Sound from Vibration · A Drum with Jumping Rice →',
    navLabel: 'Sound and vibration steps',
    tagline: 'Tap a drum and the rice on top leaps into the air. Why does it jump, and how does the sound get from the drum to your ear? In six steps you will see that sound comes from vibration, that bigger vibrations are louder and faster ones are higher, that sound needs something like air to travel through, and that it is not all that fast.',
    nav0: '0 Tap the drum', nav1: '1 Through the air', nav2: '2 Loud and soft', nav3: '3 High and low', nav4: '4 Take the air away', nav5: '5 Speed of sound', nav6: '6 Recap',

    s0k: 'Step 0 · Tap the drum',
    s0t: 'While the drum is sounding, what is the drumhead doing?',
    s0e: 'The question for this step: while a drum is making a sound, what is its skin — the drumhead — doing? Sprinkle a few grains of rice on it and tap. The top half of the picture is the drum seen from the side: the orange line is the drumhead and the white specks are rice. The drumhead moves quickly up and down, again and again; that back-and-forth motion is called <strong>vibration</strong>. A real drumhead does this 100 times a second, far too fast for your eyes, so the animation runs 20 times slower. The drumhead also moves less than a millimetre, so its motion and the rice’s jumps are both magnified by the same amount. The bottom half records where the middle of the drumhead is: across is real time in milliseconds (a millisecond is a thousandth of a second), and up is how many millimetres it sits above its resting position. Once the vibration has shrunk below 1% of its size right after the tap, this page counts it as stopped.',
    s0lgHead: 'Drumhead (orange line)', s0lgRice: 'Rice grains (dotted mark: highest jump so far)', s0lgTrace: 'Record of the drumhead’s middle',
    c0a: 'Drum from the side (20× slower, motion magnified)', c0b: 'Drumhead middle height (mm) vs real time (ms)',
    hit: 'Tap', mute: 'Press on the drumhead', reset: 'Start again',
    s0idle: 'Not tapped yet. Press “Tap” to begin.',
    s0readout: 'Real time {t} ms (shown 20× slower): the drumhead has gone up and down {n} times and is now swinging about {amp} mm → {status}',
    soundOn: 'the drum is still sounding.', soundOff: 'the vibration has almost died away, and so has the sound.', soundMuted: 'a hand is pressing the drumhead; the vibration dies at once and the sound stops with it.',
    s0hint: 'What to watch: press “Tap” and see the rice thrown up with the drumhead. The bottom curve swings up and down while the swings get smaller, and as the sound fades the rice stops jumping. Tap again, and while it is still sounding press “Press on the drumhead”: the hand stops the vibration quickly, the curve flattens straight away, and the readout says the sound has stopped. No vibration, no sound.',

    s1k: 'Step 1 · Through the air',
    s1t: 'The drum is here and your ear is over there. How does the vibration get across?',
    s1e: 'The question for this step: there is air between the drum and your ear, so how does the drumhead’s vibration reach the ear? Air is made of countless tiny particles. Each dot in the picture stands for a small parcel of air (a sketch, not to scale). When the drumhead pushes right, it squeezes the air next to it; that squeezed air pushes the next parcel, and so on. A pattern of “squeezed (dots crowded), relaxed (dots spread)” travels outward parcel by parcel — that is a <strong>sound wave</strong> (<a class="xlink" href="../../../physics/waves/sound-waves/#step0">→ Sound waves, step 0: what actually moves when sound crosses the air</a>). To make the crowding easy to see, the drum in this step vibrates 300 times a second. One parcel is coloured pink. The bottom chart tracks how far that pink parcel is from where it started: across is real time in milliseconds; up means pushed to the right, down means back to the left. The animation runs 500 times slower than reality and the air’s back-and-forth motion is hugely magnified so you can see it.',
    s1lgAir: 'Air (each dot is a small parcel)', s1lgMark: 'The marked parcel of air', s1lgFront: 'How far the front of the sound wave has got',
    c1a: 'Drum → air (500× slower; distance in m)', c1b: 'Pink parcel’s shift (right = up) vs time (ms)',
    play1: '▶ Hit the drum and play', pause1: '⏸ Pause',
    s1readout: 'Real time {t} ms: the front of the sound wave is {front} m from the drum (about 0.343 m every millisecond). {mark}',
    markWait: 'The wave has not reached the pink parcel yet, so it has not moved.', markStart: 'The wave has just arrived and the pink parcel is starting to be pushed.',
    markMove: 'The pink parcel has swung back and forth {n} times, yet it stays near where it started; it does not travel with the wave.',
    s1hint: 'What to watch: press “Hit the drum and play”. First follow the crowded-and-spread pattern as it spreads right from the drum (the cyan dashed line marks its front). Then watch only the pink parcel: once the pattern arrives it starts swinging left and right, but it never leaves its spot. Its curve in the bottom chart only wobbles about the zero line and never climbs away. What travels outward is the squeeze-and-relax pattern, not the air itself.',

    s2k: 'Step 2 · Loud and soft',
    s2t: 'Hit harder: what happens to the rice and to the sound?',
    s2e: 'The question for this step: hitting harder makes the drumhead vibrate more strongly and the sound louder — but how do you measure “more strongly”? The farthest the drumhead moves from its resting position is its <strong>amplitude</strong> (in millimetres). The top chart shows the height of the drumhead’s middle (orange) and of the grain sitting there (white) for 0.3 seconds after the tap; every time the grain leaves the drumhead it draws an arch. The bottom chart has amplitude across and, going up, how many millimetres the grain rises above the drumhead’s own highest point; each amplitude you try leaves a dot. Loudness is usually given in <strong>decibels</strong>. The energy a sound carries goes with the amplitude squared: double the amplitude and the energy goes up 4 times, which is about 6 decibels louder; every 10 times more energy adds 10 decibels. Here the sound at an amplitude of 0.1 mm is the starting point (0 decibels).',
    amp: 'Amplitude (mm)',
    s2lgHead: 'Height of the drumhead’s middle', s2lgRice: 'Height of the grain in the middle', s2lgTh: 'Amplitude at which the grain can just leave the drumhead', s2lgDots: 'Amplitudes you tried',
    c2a: '0.3 s after the tap: height (mm) vs time (ms)', c2b: 'Grain rise above the head’s top (mm) vs amplitude',
    s2readout: 'Amplitude {A} mm: the grain rises at most {lift} mm above the drumhead’s highest point. Compared with an amplitude of 0.1 mm, the sound carries {E} times the energy, a loudness of {db} decibels.',
    s2low: 'Below {th} mm the drumhead never drops away faster than the grain falls on its own, so the grain stays on the skin and never jumps — but the drum is still sounding, just quietly.',
    s2hint: 'What to watch: drag the amplitude slowly up from the smallest value. At first the white and orange lines in the top chart sit exactly on top of each other (the grain rides the skin). Once you pass the pink dashed line in the bottom chart, the white line starts to lift off, and the bigger the amplitude, the taller the arches. The dots in the bottom chart bend upward ever more steeply: double the amplitude and the grain jumps about 4 times as high.',

    s3k: 'Step 3 · High and low',
    s3t: 'Make the vibration faster: how does the sound change?',
    s3e: 'The question for this step: with the same amplitude, what difference does vibrating faster or slower make to what you hear? Swap the drum for a vibrating strip whose speed you can set. The number of vibrations per second is the <strong>frequency</strong>, measured in <strong>hertz</strong> (Hz): 100 Hz means 100 back-and-forths every second. The top chart shows 20 milliseconds (0.02 s) of vibration, with time in milliseconds across and the strip’s position up the side; the grey dashed line is a 100 Hz vibration for comparison. The higher the frequency, the more back-and-forths fit into the same time, and the higher the <strong>pitch</strong> sounds (thinner, shriller). Each back-and-forth sends one more squeeze-and-relax into the air, and the length one of these takes up in the air is the <strong>wavelength</strong>, equal to the speed of sound ÷ frequency; it is the green bar in the bottom chart, measured in metres. “Listen” plays the current frequency (quietly, stopping by itself after about a second).',
    freq: 'Frequency (Hz, vibrations per second)',
    s3lgWave: 'Vibration at the current frequency', s3lgRef: '100 Hz vibration (for comparison)', s3lgLam: 'Length of one wavelength',
    c3a: '20 ms of vibration: position vs time (ms)', c3b: 'Length of one wavelength in air (m)',
    listen: '🔊 Listen', stopSound: 'Stop the sound',
    s3readout: '{f} Hz: {n} vibrations in 20 ms, {T} ms for each back-and-forth; one wavelength in air is about {lam} m. Nearest piano note: {note} ({noteHz} Hz). {audio}',
    audioPlaying: 'Playing {f} Hz…', audioNone: 'This browser cannot play sound, so compare using the charts and numbers instead.',
    s3hint: 'What to watch: drag the frequency from 100 towards 1000. The swings in the top chart crowd closer together (count the peaks in 20 ms) and the green bar below gets shorter. Press “Listen” at each new setting and compare the pitch. Doubling the frequency raises the pitch by exactly one octave — the next key with the same letter on a piano.',

    s4k: 'Step 4 · Take the air away',
    s4t: 'Pump out the air: can you still hear the bell?',
    s4e: 'The question for this step: sound travels through air, so what happens without air? Put a ringing electric bell under a glass jar and pump the air out little by little. Anything that can pass a vibration along parcel by parcel — air, water, iron — is called a <strong>medium</strong>. In the picture the dots inside the jar stand for the air left, and the rings outside stand for the sound that gets out; fainter rings mean a quieter sound. This part is a sketch: the page simply makes the sound that escapes proportional to the air left in the jar, to show which way things change, not an exact law. In real experiments the air can never be pumped out completely and the bell hangs from a stand, so a very faint sound is usually still heard.',
    s4lgAir: 'Air left in the jar', s4lgBell: 'Bell and hammer', s4lgRing: 'Sound reaching the outside (fainter = quieter)',
    c4a: 'An electric bell under a glass jar (sketch)',
    airLeft: 'Air left in the jar (%)', pumpOut: '▶ Pump out', letIn: 'Let air back in',
    s4readout: '{pct}% of the air left: the hammer keeps striking and the bell keeps vibrating; the sound outside {level}.',
    lvClear: 'is perfectly clear', lvFaint: 'has become noticeably quieter', lvNone: 'can hardly be heard (sketch: below 5% of the air)',
    s4hint: 'What to watch: press “Pump out” and watch the dots in the jar thin out and the rings outside fade, while the hammer keeps striking the whole time. Press “Let air back in” and the sound returns. You can also drag the slider. The bell never stops vibrating, but without a medium the vibration cannot get out.',

    s5k: 'Step 5 · The speed of sound',
    s5t: 'Why do you always see the lightning before you hear the thunder?',
    s5e: 'The question for this step: lightning and thunder happen at the same moment, so why does the thunder arrive late? In air, sound covers about 343 metres every second (at about 20 °C; a little slower in the cold). Light is far faster, about 300,000 km per second, crossing 3 km in a hundred-thousandth of a second, so you can treat it as arriving instantly. Sound is faster in water and in steel; this page uses typical values of about 1480 m/s in water and 5100 m/s in steel (<a class="xlink" href="../../../physics/waves/sound-waves/#step4">→ Sound waves, step 4: count the seconds to find how far the thunder is</a>). The four lanes start from the same place at the same moment and run the same distance; across is distance in kilometres. Press “Go” and the race plays in real time, and when each one reaches the finish a post of the same colour goes up in the bottom chart at that moment; the pink dashed line is the time now.',
    s5lgLight: 'Light (the flash)', s5lgAir: 'Sound in air', s5lgWater: 'Sound in water', s5lgSteel: 'Sound in steel',
    c5a: 'Same start: distance (km)', c5b: 'Arrival time at the finish (s)', dist: 'Distance (km)',
    go: '▶ Go',
    s5readout: '{el}Distance {d} km. Time to the finish: light ≈ 0 s, air {ta} s, water {tw} s, steel {ts} s. Rule of thumb: count the seconds after the flash; every 3 seconds is about 1 km (3 × 343 = 1029 m).',
    s5elapsed: '{e} s gone · ',
    s5hint: 'What to watch: press “Go”. The white light reaches the finish at once, then the three sounds arrive one after another each putting up a post in the bottom chart. Set the distance to 2 km and go again: all three post times double.',

    s6k: 'Step 6 · Recap',
    s6t: 'The life of a sound: vibrate, travel, arrive',
    s6fin: '<strong>Looking back.</strong> Sound comes from vibration: stop the drumhead and the sound stops. The vibration pushes the air, and a squeeze-and-relax pattern passes outward parcel by parcel while the air itself only rocks in place. Bigger amplitude means louder; higher frequency means higher pitch. Without a medium the vibration cannot get out, and even with one the sound needs time to travel — about 343 metres each second in air.',
    formula: 'No vibration → no sound\nAmplitude × 2 → energy × 4, about 6 dB louder\nFrequency × 2 → pitch one octave higher\nWavelength = speed of sound ÷ frequency\nDistance = speed of sound × time',
    boundary: 'Note: the drum here is a simplified model — the drumhead vibrates in only its simplest shape, it dies away at a fixed rate, and the rice sticks when it lands instead of bouncing. The air dots’ motion and the animation speeds are magnified and slowed; the glass-jar step is a sketch; the speeds in water and steel are typical values that change with temperature and material.',
    linksTitle: 'Where to go next',
    lk1: '→ Sound waves (junior), step 1: one period on an oscilloscope and one wavelength on the ground',
    lk2: '→ Music theory, step 0: counting the distance between two pitches',
    lk3: '→ Standing waves, step 0: two waves run at each other and the pattern stops moving',
    lk4: '→ Resonance, step 0: left alone, an oscillator keeps its own beat',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Sound from Vibration · A Drum with Jumping Rice”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key] !== undefined) ? STRINGS[lang][key] : (STRINGS.en[key] !== undefined ? STRINGS.en[key] : key);
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
  if (typeof window.refreshSound === 'function') window.refreshSound();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SOUND_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
