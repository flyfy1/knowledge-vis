'use strict';
/* ============================================================
   三角函数 · 单位圆讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '三角函数 · 单位圆 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '三角函数 · 单位圆',
    tagline: 'sin、cos 背了三年，其实只是一个点绕着圆走时，它的身高和站位。点走一圈，身高画出正弦波、站位画出余弦波、斜率给出正切——三个函数，是同一个圆的三个投影。这一页是傅里叶的「前传」：那里满天飞的旋转圆，单个拿出来，就是这一页。',
    nav0: '0 造波机', nav1: '1 点的坐标', nav2: '2 sin 是身高', nav3: '3 cos 是站位',
    nav4: '4 tan 是斜率', nav5: '5 旋转⇄往复', nav6: '6 终章总览',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 三角函数 · 单位圆 Trig Functions & the Unit Circle —— 一步一交互系列',
    play: '▶ 播放', pause: '⏸ 暂停', stepOnce: '单步 ▸（+6°）',
    undef: '无定义',

    s0k: '第 0 步 · 钩子',
    s0t: '一台只会转圈的造波机',
    s0e: '这一步要回答：<strong>一个只会转圈的点，怎么会描出一条正弦波？</strong>圆上的点匀速转圈，它的身高（纵坐标）被一笔一笔描下来，就是你背了三年的那条<strong>正弦波</strong>。这一页先什么都不解释——让它转起来，盯着看：波的每一个起伏，都是点在圆上的位置。',
    s0speed: '转速 ω（rad/s）',
    s0ro: 'θ = {deg}°（{rad} rad）· sin θ（此刻身高）= {sin} · 波最前面的那个点，就是此刻的身高',
    s0hint: '弧度（rad）先交代一句：它是量角的另一种单位——一整圈是 2π rad，1 rad ≈ 57.3°；转速 ω 用 rad/s，就是每秒扫过多少弧度。波不是预先画好的：每一帧都取点<strong>此刻的真实身高</strong>记下来、连成线。把转速拉快或拉慢，看波被压紧还是拉长——记住这个手感，第 5 步它会变成声音的高低。',
    cHeight: '身高 sin θ', cWave: '描出来的波',

    s1k: '第 1 步 · 点的坐标',
    s1t: 'cos 是站位，sin 是身高',
    s1e: '这一步要回答：<strong>点的横、纵两个坐标，凭什么就是 cos 和 sin？</strong>停下自动转，改用手拖。把圆上的点拖到任何地方：它横着离原点多远，就是 <strong>cos θ</strong>（站位）；竖着离原点多高，就是 <strong>sin θ</strong>（身高）。所谓三角函数，不过是给这个点的两个坐标起了名字。两条投影线和中间的直角三角形会一直跟着它。',
    s1deg: '角度 °', s1rad: '弧度 rad',
    s1snap: '特殊角一键到位：',
    s1ro: 'θ = {ang} · cos θ（站位）= {cos} · sin θ（身高）= {sin} · tan θ = {tan}',
    s1quad: '所在象限：第 {q} 象限 · sin {ss} · cos {cs} · tan {ts}',
    s1axisY: '所在位置：在 y 轴上 · sin {ss} · cos {cs} · tan {ts}',
    s1axisX: '所在位置：在 x 轴上 · sin {ss} · cos {cs} · tan {ts}',
    s1pyth: '勾股自检：cos²θ + sin²θ = {c2} + {s2} = {sum}（斜边是半径 1，所以恒等于 1）',
    s1exactT: '特殊角精确值',
    s1exactNone: '把点拖到 30°、45°、60°、90° 这些特殊角上（靠近时会被轻轻吸住），或者点上面的按钮——这里会给出不用计算器的精确值。',
    s1hint: '看符号怎么变：点走过 y 轴，站位（cos）变负、身高还是正的；掉到 x 轴下方，身高（sin）变负。四个象限的正负号不是口诀，是坐标自己带的——点在哪儿，查哪儿。',
    cSinLab: 'sin θ（身高）', cCosLab: 'cos θ（站位）',

    s2k: '第 2 步 · sin 登场',
    s2t: '把身高摊开，就是正弦波',
    s2e: '这一步要回答：<strong>把身高按时间排开，为什么就是正弦波？</strong>这次把造波机讲透：点爬到最高处，波就到峰顶；点穿过水平直径，波就过零。波不是「像」圆——波就是圆的<strong>侧影</strong>：把点每一刻的身高按时间排开，仅此而已。在几个关键角度停下来打点，看波上对应的位置长什么样。',
    s2amp: '振幅 = 半径 R',
    s2mark: '在关键角度暂停打点：',
    s2play: '▶ 继续转', s2pause: '⏸ 暂停',
    s2ro: 'R = {R} · θ = {deg}° · 此刻身高 = R·sin θ = {h} · 波的峰高就是 {R}',
    s2marks: '已打点：{list}',
    s2marksNone: '还没打点——点上面的角度按钮试试。',
    s2markItem: '{deg}° → {v}',
    s2hint: '拖振幅滑杆：圆变大的同时，波<strong>同步</strong>变高——量它们的是同一把尺子、同一个半径。振幅不是波身上另一个参数，它就是圆的半径本身。',
    cPeak: '峰', cZero: '过零',

    s3k: '第 3 步 · cos 登场',
    s3t: '换个方向看：站位也能成波',
    s3e: '这一步要回答：<strong>cos 描出的波，和 sin 是什么关系？</strong>同一台机器，把要描的量换成站位（横坐标）：描出来的波和 sin 一模一样，只是<strong>早出发了四分之一个周期</strong>。cos 不是第二个要背的函数——它就是提前 90° 的 sin。「相位差」这个词，从这里开始有画面了。',
    s3watchSin: '看身高 sin', s3watchCos: '看站位 cos', s3watchBoth: '两条叠加',
    s3ro: 'θ = {deg}° · sin θ = {sin} · cos θ = {cos} · 相位差恒为 90°（π/2）：cos θ = sin(θ + 90°) = {shift}，与 cos 本人分毫不差',
    s3hint: '在圆上看得最清楚：身高到峰顶时，站位刚好过零；站位到最右时，身高刚好过零。一个到峰，另一个必过零——永远错开四分之一圈。傅里叶和采样里到处都是的「相位」，说的就是这个错开的量。',
    cSinWave: 'sin 波（身高）', cCosWave: 'cos 波（站位）',

    s4k: '第 4 步 · tan 登场',
    s4t: 'tan 是斜率，站上 x = 1 的墙',
    s4e: '这一步要回答：<strong>tan 是什么，点逼近 90° 时它会怎样？</strong>还剩最后一个。把原点和点的连线<strong>延长</strong>，让它撞上 x = 1 这面竖墙：撞点离地面的高度，就是 <strong>tan θ</strong>——它其实就是这条线的斜率，也就是 sin 除以 cos。拖动点（或拖滑杆）逼近 90°，看撞点怎么冲上天；再拖过 90°，看它从哪里回来。',
    s4th: '角度 θ（°）',
    s4near: '逼近 90°：',
    s4ro: 'θ = {deg}° · tan θ = {tan} · 验算 sin/cos = {sin} / {cos} = {ratio}',
    s4roOff: '（撞点已冲出画面，箭头指着它去的方向）',
    s4roInf: 'θ = {deg}° · tan θ → {sign}∞（分母 cos 已小到约 {cos}）· 在恰好 90° 处，tan 无定义',
    s4roUndef: 'θ = {deg}° · tan 无定义：半径与 x = 1 平行，永不相交 —— sin/cos = {sin} / 0，分母是 0',
    s4hint: '过了 90°，延长线要<strong>往回</strong>才撞得到墙，撞点从地底下冒出来——tan 从 +∞ 一下跳到 −∞。这不是算错：斜率本来就在这里翻面。也所以 tan 的周期是 180°，不是 360°。',
    cWall: 'x = 1（墙）', cTanLab: 'tan θ（撞点高度）', cLine: '过原点与点的直线',

    s5k: '第 5 步 · 旋转 ⇄ 往复',
    s5t: '世界在转圈与波之间翻译',
    s5e: '这一步要回答：<strong>转圈和波，在真实世界里是怎么互相翻译的？</strong>圆和波不是数学课的摆设：<strong>旋转的东西，身高就是波；波，就是被摊开的旋转。</strong>下面三联小景共用同一个转速——摩天轮的座舱高度、发动机的活塞行程、声音的音高，都是同一个点在转。',
    s5speed: '转速（圈/秒）',
    s5wheelT: '① 摩天轮：座舱高度',
    s5pistonT: '② 曲柄活塞：往复行程',
    s5soundT: '③ 转速变声音',
    s5wheelRo: '亮着的座舱此刻高度 = sin θ = {sin}（轮心为 0、半径为 1）· θ = {deg}°',
    s5pistonE: '转盘经连杆推活塞。连杆长度只有曲柄半径的 2.5 倍——有限长的连杆会让活塞在冲程顶端附近多磨蹭一会儿，所以活塞的曲线<strong>接近正弦，但不是正弦</strong>。连杆越长差越小；只有无穷长的连杆，才给出严格的正弦。',
    s5pistonRo: '活塞位置（归一化）= {p} · 纯正弦 = {pure} · 连杆造成的差 = {diff}（下方红线是差异 ×3 放大画的）',
    s5soundRo: '转速 {rps} 圈/秒 → 高度波的频率就是 {rps} Hz（低到听不见）→ 把它加速 220 倍播放：{hz} Hz',
    s5play: '▶ 听一听', s5stop: '■ 停',
    s5soundHint: '拖转速：画面里的波被挤紧的同时，声音真的变高——波的疏密和音高的低，是被转速锁死的同一件事。默认静默，点了才出声，音量已压低。',
    cHeightWave: '座舱高度', cPiston: '活塞', cPure: '纯正弦', cDiff: '差异 ×3', cSoundWave: '高度波（2 秒窗口）',

    s6k: '第 6 步 · 终章',
    s6t: '总览台：一个圆，三个投影',
    s6e: '这一步要回答：<strong>同一个点，怎样同时描出 sin、cos、tan 三条波？</strong>最后把全家叫到同一张桌子上：拖动这个点（或让它自己转），圆上的点、三个读数、三条波的<strong>当前位置</strong>同时亮起。三条波没有一条是预先画好的——点被拖过哪儿，哪儿的波就被它的投影当场描出来；没去过的地方，就是空的。',
    s6play: '▶ 转起来', s6pause: '⏸ 暂停',
    s6chain: '挂上第二个圆', s6chainOff: '收起第二个圆', s6clear: '清空轨迹',
    s6ro: 'θ = {deg}°（{rad} rad）· sin θ = {sin} · cos θ = {cos} · tan θ = {tan}',
    s6fin: '试试把第二个小圆挂到大圆的点上：小圆绕着大圆的点转，笔尖的轨迹立刻不再是圆，而是花瓣。再往后一步，就是<strong>傅里叶变换</strong>——把很多这样的圆首尾相连，各有各的半径、转速和相位，让它们替你画出任何波形、任何图形。这一页的单个圆，就是那一整页的全部家当。',
    s6linkF: '去傅里叶页：把圆串成链，画出任何图形 →',
    s6autoNote: '三条波轨迹由点的真实投影逐段描出（tan 在 90°/270° 处断开——它在那里冲向 ±∞）。',
  },
  en: {
    docTitle: 'Trig Functions · The Unit Circle — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Trig Functions · The Unit Circle',
    tagline: 'Three years of memorising sin and cos — and all along they were just the height and the sideways position of a point walking around a circle. One lap draws a sine wave out of the height, a cosine wave out of the position, and the tangent out of the slope: three functions, three projections of one circle. This page is the prequel to Fourier: the sky full of spinning circles over there is this single circle, many times over.',
    nav0: '0 The wave machine', nav1: '1 Coordinates', nav2: '2 Sine = height', nav3: '3 Cosine = position',
    nav4: '4 Tangent = slope', nav5: '5 Spin ⇄ wave', nav6: '6 Finale console',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Trig Functions & the Unit Circle — one interaction at a time',
    play: '▶ Play', pause: '⏸ Pause', stepOnce: 'Step ▸ (+6°)',
    undef: 'undefined',

    s0k: 'Step 0 · The hook',
    s0t: 'A wave machine that only spins',
    s0e: 'This step answers: <strong>how can a point that only goes around in circles trace out a sine wave?</strong> A point glides around a circle at a steady pace, and its height (the vertical coordinate) is traced out stroke by stroke — into the very <strong>sine wave</strong> you have been memorising for years. Nothing gets explained yet: just let it spin and watch. Every rise and fall of the wave is the point’s position on the circle.',
    s0speed: 'Angular speed ω (rad/s)',
    s0ro: 'θ = {deg}° ({rad} rad) · sin θ (height right now) = {sin} · the leading point of the wave is exactly this height',
    s0hint: 'Radians first: the radian (rad) is another unit for angles — one full turn is 2π rad, so 1 rad ≈ 57.3°; and ω in rad/s is simply how many radians the point sweeps per second. The wave is not pre-drawn: every frame takes the point’s <strong>actual height at that instant</strong>, records it, and joins the dots. Drag the speed up or down and watch the wave squeeze or stretch — remember the feel; in step 5 it turns into pitch.',
    cHeight: 'height sin θ', cWave: 'the traced wave',

    s1k: 'Step 1 · Coordinates of the point',
    s1t: 'Cosine is where it stands, sine is how high',
    s1e: 'This step answers: <strong>why are the point’s two coordinates exactly cos and sin?</strong> Stop the spinning and take over with your hand. Drag the point anywhere on the circle: how far it sits sideways from the centre is <strong>cos θ</strong> (its position); how high it sits is <strong>sin θ</strong> (its height). The trigonometric functions are nothing more than names given to this point’s two coordinates. The two projection lines and the right triangle between them follow it everywhere.',
    s1deg: 'Degrees °', s1rad: 'Radians rad',
    s1snap: 'Jump to a special angle:',
    s1ro: 'θ = {ang} · cos θ (position) = {cos} · sin θ (height) = {sin} · tan θ = {tan}',
    s1quad: 'Quadrant {q} · sin {ss} · cos {cs} · tan {ts}',
    s1axisY: 'On the y-axis · sin {ss} · cos {cs} · tan {ts}',
    s1axisX: 'On the x-axis · sin {ss} · cos {cs} · tan {ts}',
    s1pyth: 'Pythagoras check: cos²θ + sin²θ = {c2} + {s2} = {sum} (the hypotenuse is the radius, 1 — so the sum is always 1)',
    s1exactT: 'Exact values at special angles',
    s1exactNone: 'Drag the point onto a special angle — 30°, 45°, 60°, 90°… (it snaps gently when close), or use the buttons above — and the exact, no-calculator values show up here.',
    s1hint: 'Watch the signs change: cross the y-axis and the position (cos) turns negative while the height stays positive; drop below the x-axis and the height (sin) turns negative too. The sign rules for the four quadrants are not a chant — they are just the signs of the coordinates themselves. Wherever the point is, read them off.',
    cSinLab: 'sin θ (height)', cCosLab: 'cos θ (position)',

    s2k: 'Step 2 · Enter sine',
    s2t: 'Unroll the height and you get the sine wave',
    s2e: 'This step answers: <strong>why does laying the height out in time order give exactly the sine wave?</strong> Now the wave machine, explained. When the point climbs to the very top, the wave reaches its peak; when the point crosses the horizontal diameter, the wave crosses zero. The wave is not “like” the circle — it is the circle’s <strong>profile</strong>: the point’s height, laid out in time order, nothing more. Stop at a few key angles, drop a marker, and see what the wave is doing at that exact spot.',
    s2amp: 'Amplitude = radius R',
    s2mark: 'Pause & mark at key angles:',
    s2play: '▶ Keep spinning', s2pause: '⏸ Pause',
    s2ro: 'R = {R} · θ = {deg}° · height right now = R·sin θ = {h} · the wave peaks at {R}',
    s2marks: 'Marked: {list}',
    s2marksNone: 'No marks yet — try the angle buttons above.',
    s2markItem: '{deg}° → {v}',
    s2hint: 'Drag the amplitude slider: the circle grows and the wave grows taller <strong>in sync</strong> — both are measured with the same ruler, the same radius. Amplitude is not a separate dial on the wave; it is the circle’s radius itself.',
    cPeak: 'peak', cZero: 'zero',

    s3k: 'Step 3 · Enter cosine',
    s3t: 'Look from the other side: position makes a wave too',
    s3e: 'This step answers: <strong>how is the wave traced by cos related to sin?</strong> Same machine, different quantity: trace the sideways position (the horizontal coordinate) instead. The wave that comes out is identical to sine — except it <strong>sets off a quarter period earlier</strong>. Cosine is not a second function to memorise: it is sine, 90° ahead of schedule. From here on, the phrase “phase difference” has a picture.',
    s3watchSin: 'Trace height (sin)', s3watchCos: 'Trace position (cos)', s3watchBoth: 'Overlay both',
    s3ro: 'θ = {deg}° · sin θ = {sin} · cos θ = {cos} · the phase gap is always 90° (π/2): cos θ = sin(θ + 90°) = {shift} — the same number as cosine itself',
    s3hint: 'Clearest on the circle: when the height is at its peak, the position is crossing zero; when the position is at its rightmost, the height is crossing zero. One peaks exactly when the other crosses — a quarter turn apart, forever. The “phase” that turns up all over the Fourier and sampling pages is precisely this offset.',
    cSinWave: 'sine wave (height)', cCosWave: 'cosine wave (position)',

    s4k: 'Step 4 · Enter tangent',
    s4t: 'Tangent is slope, standing on the wall x = 1',
    s4e: 'This step answers: <strong>what is tan, and what happens to it as the point creeps up on 90°?</strong> One left. Extend the line from the origin through the point until it hits the vertical wall at x = 1: the height of the hit point is <strong>tan θ</strong> — which is really just that line’s slope, sine divided by cosine. Drag the point (or the slider) towards 90° and watch the hit point rocket skywards; then drag past 90° and see where it comes back from.',
    s4th: 'Angle θ (°)',
    s4near: 'Creep up on 90°:',
    s4ro: 'θ = {deg}° · tan θ = {tan} · check: sin/cos = {sin} / {cos} = {ratio}',
    s4roOff: '(the hit point is off the chart — the arrow shows where it went)',
    s4roInf: 'θ = {deg}° · tan θ → {sign}∞ (the denominator cos is down to about {cos}) · at exactly 90°, tan is undefined',
    s4roUndef: 'θ = {deg}° · tan is undefined: the radius runs parallel to x = 1 and never meets it — sin/cos = {sin} / 0, a zero denominator',
    s4hint: 'Past 90°, the line only reaches the wall when extended <strong>backwards</strong>, and the hit point returns from underground — tan jumps from +∞ straight to −∞. That is not a glitch: the slope really does flip there. It is also why tangent’s period is 180°, not 360°.',
    cWall: 'x = 1 (the wall)', cTanLab: 'tan θ (hit height)', cLine: 'line through origin & point',

    s5k: 'Step 5 · Spin ⇄ oscillation',
    s5t: 'The world keeps translating between circles and waves',
    s5e: 'This step answers: <strong>how do spinning and waves translate into each other in the real world?</strong> Circles and waves are not classroom decorations: <strong>for anything that spins, its height is a wave; and a wave is a spin, unrolled.</strong> The three scenes below share one spin rate — a Ferris wheel cabin’s height, an engine piston’s stroke, and the pitch of a sound are the same point, turning.',
    s5speed: 'Spin rate (rev/s)',
    s5wheelT: '① Ferris wheel: cabin height',
    s5pistonT: '② Crank & piston: the stroke',
    s5soundT: '③ Spin becomes sound',
    s5wheelRo: 'The lit cabin’s height right now = sin θ = {sin} (hub = 0, radius = 1) · θ = {deg}°',
    s5pistonE: 'The crank drives the piston through a connecting rod only 2.5× the crank radius. A finite rod makes the piston linger a little near the top of its stroke, so the piston’s curve is <strong>close to a sine, but not a sine</strong>. The longer the rod, the smaller the difference; only an infinitely long rod yields an exact sine.',
    s5pistonRo: 'Piston position (normalised) = {p} · pure sine = {pure} · the rod’s doing = {diff} (the red curve below is that difference, magnified ×3)',
    s5soundRo: 'Spin {rps} rev/s → the height wave’s frequency is {rps} Hz (far too low to hear) → played 220× faster: {hz} Hz',
    s5play: '▶ Listen', s5stop: '■ Stop',
    s5soundHint: 'Drag the rate: the wave on screen squeezes tighter at exactly the moment the pitch rises — wave density and pitch are one thing, locked together by the spin rate. Silent by default; click to play, volume kept low.',
    cHeightWave: 'cabin height', cPiston: 'piston', cPure: 'pure sine', cDiff: 'difference ×3', cSoundWave: 'height wave (2 s window)',

    s6k: 'Step 6 · Finale',
    s6t: 'The console: one circle, three projections',
    s6e: 'This step answers: <strong>how can one single point trace the sin, cos and tan waves all at once?</strong> Finally, the whole family at one table: drag the point (or let it spin) and the point on the circle, the three readouts and the <strong>current positions</strong> on all three waves light up together. None of the three waves is pre-drawn — wherever the point has been dragged, its projection paints the wave on the spot; where it has never been, the wave is simply absent.',
    s6play: '▶ Spin it', s6pause: '⏸ Pause',
    s6chain: 'Add a second circle', s6chainOff: 'Remove the second circle', s6clear: 'Clear traces',
    s6ro: 'θ = {deg}° ({rad} rad) · sin θ = {sin} · cos θ = {cos} · tan θ = {tan}',
    s6fin: 'Try hanging the second, smaller circle on the first circle’s point: as it orbits the moving point, its tip stops tracing a circle and draws petals instead. One more step and you arrive at the <strong>Fourier transform</strong> — many such circles chained end to end, each with its own radius, speed and phase, drawing any waveform, any picture, for you. The single circle on this page is that whole page’s entire toolkit.',
    s6linkF: 'On to Fourier: chain the circles, draw anything →',
    s6autoNote: 'All three traces are painted segment by segment from the point’s true projections (tangent breaks at 90°/270°, where it rockets off to ±∞).',
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
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
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
