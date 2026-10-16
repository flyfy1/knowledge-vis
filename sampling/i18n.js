'use strict';
/* ============================================================
   采样与混叠讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '采样与混叠 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '采样与混叠',
    tagline: '车轮为什么会倒转，CD 为什么偏偏是 44.1kHz？都是同一个原因：世界是连续的，而我们只能隔一段时间偷看一眼。这一页讲清「偷看」这件事——看得够勤能还原，看得太懒，会看出根本不存在的东西。',
    nav0: '0 钩子', nav1: '1 采样是偷看', nav2: '2 假波诞生', nav3: '3 奈奎斯特线',
    nav4: '4 频域看混叠', nav5: '5 混叠大观', nav6: '6 先眯眼',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 采样与混叠 Sampling & Aliasing —— 一步一交互系列',
    labF: '信号频率 f（Hz）', labFs: '采样率 f_s（Hz）',
    dirFwd: '同向正转', dirRev: '倒转！', dirStill: '静止不动',
    wNoteEdge: ' —— 边界情形：恰落在 ±f_s/2 上，正转与倒转不可分辨，轮子其实是在两个位置之间闪烁（同第 3 步「恰好 2f、要看相位」）。',

    s0k: '第 0 步 · 先被骗一次',
    s0t: '这个轮子，到底在往哪边转？',
    s0e: '下面这个轮子一直在以 <strong>2.5 转/秒</strong>匀速正转，从没变过。你能动的只有「摄像机」的帧率：拖动滑杆，亲眼看它慢下来、停住、然后<strong>倒转</strong>。轮子没变，变的是采样——每台摄像机、每双眼睛，都是隔一段时间才「偷看」世界一眼。',
    s0fps: '摄像机帧率 f_s（fps）',
    s0ro: '真实转速 {rev} 转/秒（恒定）· 辐条通过频率 {sp} Hz · 帧率 {fps} fps → 你看到的表观转速 {app} 转/秒 · {dir}{note}',
    s0hint: '轮缘上的橙色亮点标着轮子的<strong>真实位置</strong>——它一直在老实正转，一刻没停。表观转速不是猜的：把辐条通过频率按 f<sub>alias</sub> = |f − k·f<sub>s</sub>| 折叠、再除以辐条数，得到的就是你眼睛看到的速度。第 5 步会把这个公式当场验算。',
    cRealPos: '真实位置', cSeen: '摄像机看到的轮子',

    s1k: '第 1 步 · 采样是什么',
    s1t: '一排点，能记住一条波吗',
    s1e: '这是连续世界里的一条正弦波。<strong>采样</strong>就是每隔 1/f<sub>s</sub> 秒偷看一眼、记下一个数。看这些点逐个落下——它们每一个都<strong>精确地落在原波上</strong>，采样从不撒谎。落完之后把点连起来（直线连线）或者保持到下一眼（阶梯保持）：点是事实，<strong>连法是我们脑补的</strong>。f<sub>s</sub> 越高，点越密，脑补越接近原样。',
    s1line: '直线连线', s1hold: '阶梯保持',
    s1ro: 'f = {f} Hz · f_s = {fs} Hz · 每周期采样点数 = {spp}',
    s1hint: '把 f<sub>s</sub> 拉低再看：连出来的线已经歪歪扭扭，但<strong>每个点还老老实实地在原波上</strong>。记住这一幕——错误不在点，在连法。下一页，连法会连出一整根不存在的波。',
    cOrig: '原波', cSamp: '采样点', cRecon: '连点重建',

    s2k: '第 2 步 · 混叠诞生',
    s2t: '点没撒谎，是你连错了',
    s2e: '把 f<sub>s</sub> 压到 f 以下再看：采样点依然全在原波上，可它们自己排成了<strong>另一条更慢的波</strong>。粉红这条「假波」和每一个采样点都严丝合缝地重合——只看点，你没有任何办法分辨原波和假波。假波的频率只有一条公式说了算：把 f 按 f<sub>s</sub> 反复折叠，折进 [0, f<sub>s</sub>/2] 这半间房。折叠还有方向：带符号的折叠频率 g 若为负（如 9 Hz 被 10 Hz、14 Hz 被 20 Hz 采样），假波会<strong>左右翻面、相位反转</strong>——和第 0 步轮子的倒转是同一件事，只不过翻的是波形。',
    s2pSlow: '经典慢波：f=9, f_s=10', s2pDC: '全钉同一点：f=f_s=10',
    s2pFold: '折叠：f=14, f_s=20', s2pClean: '无混叠：f=3, f_s=25',
    s2formulaNote: 'k 是使结果落入 [0, f<sub>s</sub>/2] 的整数。本页所有读数、频谱位置、音频音高都用这同一条公式计算——第 4、5 步会逐个对账。',
    s2ro: 'f = {f} Hz · f_s = {fs} Hz · k = {k} · f_alias = |{f} − {k}×{fs}| = {alias} Hz{note}',
    s2noteAlias: ' —— 这就是那条假波',
    s2noteSame: ' —— 无混叠：假波与原波同频',
    s2noteDC: ' —— 直流：每次偷看都撞在同一相位上',
    s2hint: '「全钉同一点」是最阴险的预设：f 恰为 f<sub>s</sub> 的整数倍时，采样每次都撞在完全相同的相位上，所有点钉成一个值——<strong>再快的波，看起来都静止</strong>。这正是第 0 步轮子"停住"的真相。',
    cAlias: '假波 f_alias',

    s3k: '第 3 步 · 那条线',
    s3t: '奈奎斯特线：两倍，差一线都不行',
    s3e: '让 f<sub>s</sub> 扫过 2f 这条线：高于两倍，采样点只可能属于原波，假波无从谈起；逼近两倍，假波频率贴着原波、相位一路漂移，连点重建<strong>大幅忽强忽弱地抖动</strong>；低于两倍，假波正式换人。恰好等于 2f 时最微妙——每个周期只偷看两眼，结果<strong>完全取决于相位运气</strong>。点下面的按钮把 f<sub>s</sub> 钉在 2f，再拖相位滑杆试试。',
    s3phase: '采样相位 φ（°）', s3snap: '钉在恰好 2f',
    s3roAbove: 'f_s = {fs} Hz > 2f = {two} Hz：无混叠，点只可能属于原波。',
    s3roBelow: 'f_s = {fs} Hz < 2f = {two} Hz：已混叠，假波频率 = {alias} Hz。',
    s3roAt: 'f_s = 2f = {two} Hz：完全看相位 —— 采样点最大绝对值 = {amp}（1 = 满幅，0 = 全灭）。',
    s3hint: '相位 φ=90° 时，每一眼都采在峰值附近，点上下满幅跳动，看起来毫无问题；拖到 φ=0°：每一眼都正好撞在过零点上，<strong>所有点都是 0，连出来一根直线</strong>——波明明在那儿，采样却说"什么也没有"。所以奈奎斯特判据写的是 f<sub>s</sub> &gt; 2f：等号只在运气好时成立。',
    cAmp: '采样点包络',

    s4k: '第 4 步 · 换个视角',
    s4t: '频域看混叠：频谱在自我复制',
    s4e: '在<a class="fourier-link" href="../fourier/#step5">傅里叶页</a>我们见过：一个纯音在频谱上是一根峰。采样还有个副作用：整张频谱会以 f<sub>s</sub> 为周期<strong>无限复制</strong>。<a class="fourier-link" href="../ztransform/#step5">同一件事在 z 平面的说法：条带与孪生点 →</a>f<sub>s</sub> 足够大时，副本互不相干，留中间那份 [0, f<sub>s</sub>/2] 就能还原；f<sub>s</sub> 太小，高频副本的一根峰正好落进这半间房——<strong>那就是第 2 步那条假波在频域的出生证</strong>。拖动 f<sub>s</sub>，看副本的间距怎么变。',
    s4ro: '副本间距 = f_s = {fs} Hz · 基带 [0, {half} Hz] 内的峰在 {alias} Hz —— 与第 2 步时域假波同数。',
    s4roClean: '副本间距 = f_s = {fs} Hz · f_s > 2f：基带 [0, {half} Hz] 内只有原峰，干净。',
    s4roZero: '特殊情形：f 恰好是 f<sub>s</sub> 的半整数倍——正弦的采样点全都落在过零点上，采样序列恒为 0，频谱里一根峰都没有（和第 2 步 f = f<sub>s</sub> 时的零假波是同一回事）。把 f 或 f<sub>s</sub> 挪开一点点，副本立刻全回来。',
    s4hint: '注意混叠的本质：它不是"信号被弄脏了一点"，而是<strong>高频的信息被原样搬进低频、还冒充低频</strong>。采样一旦完成，原峰和混叠峰长得一模一样，事后没有任何滤波器能把它们分开——只能在采样之前防。',
    cPeak: '原谱峰 f', cCopy: '复制峰', cBase: '基带 [0, f_s/2]', cAliasPeak: '混叠峰 f_alias',

    s5k: '第 5 步 · 混叠大观',
    s5t: '生活里到处都是',
    s5e: '三个展品，同一个公式。①<strong>声音</strong>：把高频正弦按低采样率真正逐点采样后播放，你听到的不是原声，是假波。②<strong>图像</strong>：细条纹按像素硬抽取，摩尔纹自己长出来。③<strong>轮子</strong>：回到第 0 步，用公式当场验算表观转速。',
    tabAudio: '① 音频', tabImage: '② 图像摩尔纹', tabWheel: '③ 轮子验算',

    s5aF: '源频率 f（Hz）', s5aFs: '标称采样率 f_s',
    s5aPlayAlias: '▶ 播放采样结果', s5aPlayOrig: '▶ 播放原始频率',
    s5aro: '源频率 f = {f} Hz · 采样率 f_s = {fs} Hz · k = {k} · 公式假音 f_alias = {alias} Hz · buffer 实测过零推算 ≈ {zcr} Hz',
    s5aHint: '诚实交代：上面画的是播放 buffer 的前 240 个采样点，按采样时刻 t = n/f<sub>s</sub> 逐点算出 sin 值存进 buffer 的——<strong>不是拿一条低频波冒充</strong>。你听到的音高，就是这些点被播出时的过零率（读数里的"实测过零推算"正是评审同款验法）。默认静默、点击才出声，音量已压低。源频率超过 10 kHz 时，有些人本来就听不到原声——但它的假音落回可听范围，人人听得到。特例：f 是 f<sub>s</sub> 的整数倍时（f = f<sub>s</sub>、2f<sub>s</sub>、…），每个采样点都撞在同一相位（正弦过零点）上，buffer 会全是 0，播放出静音——这也是真的。',
    cBuf: '播放 buffer 的前 240 个采样点（点 = 一次真实采样）',

    s5iSrc: '原图（细条纹）', s5iOut: '抽取后（放大显示）',
    s5iStride: '抽取步长（每隔几个像素取一个）',
    patStripes: '竖条纹', patGrid: '格纹', patRings: '同心圆', patScene: '风景 + 细条纹',
    s5iro: '原图 {w}×{h} · 步长 {m} px · 抽取后剩 {w2}×{h2} 个采样点（放大显示）',
    s5iHint: '页面里没有任何一行"画波纹"的代码：右图只是从原图里<strong>每隔 {m} 个像素取一个</strong>（最近邻抽取），再放大显示。粗大的波纹是采样网格与细条纹互相折叠长出来的——摩尔纹就是图像版的混叠。拖步长，波纹的粗细和走向都会变。第 6 步来治它。',

    s5wN: '辐条数 N', s5wRev: '真实转速（转/秒）', s5wFps: '帧率 f_s（fps）',
    s5wro: '辐条通过频率 f_辐 = N × 转速 = {n} × {rev} = {sp} Hz · k = {k} · 表观转速 = {app} 转/秒 · {dir}{note}',
    s5wHint: '验算方法与第 0 步一模一样：辐条图案每转一圈重复 N 次，所以"信号频率"是辐条通过频率 N×转速；拿它对帧率做 f<sub>alias</sub> 折叠，再除以 N，就是表观转速。负号 = 倒转。拖到辐条通过频率恰好等于帧率整数倍，轮子就会"冻"住。',

    s6k: '第 6 步 · 终章',
    s6t: '采样之前，先学会眯眼',
    s6e: '抗混叠的办法听起来像认输：<strong>先把来不及看的细节亲手抹掉，再采样。</strong>下面是同一张原图、同一条抽取管线，只差一步——左边直接硬抽取，摩尔纹横行；右边先做一次真正的卷积模糊（就是卷积页那个盒式核在干正事），再抽取：纹没了，图也软了，但<strong>不再有假的东西</strong>。眯起眼睛看世界，看到的少，却不再看错。',
    s6direct: '直接抽取', s6blur: '先模糊再抽取',
    s6ro: '步长 {m} px · 两侧同为 {w2}×{h2} 个采样点 · 右侧在抽取前先做了盒式模糊（半径 {r} px，两遍）',
    s6audio: '音频侧是同一句话：在模数转换<strong>之前</strong>，录音棚会放一颗模拟低通滤波器，先把人耳上限以上的频率砍掉，再采样。所以 CD 的采样率定在 <strong>44.1 kHz</strong>：人耳上限约 20 kHz，两倍是 40 kHz，再留出约 2 kHz 的过渡带，让滤波器有空间从 20 kHz 慢慢滚降到 22.05 kHz（= f<sub>s</sub>/2）——44.1 就是这么来的，不是随手挑的吉利数。',
    cEar: '信号（人耳上限 ≈ 20 kHz）', cLpf: '抗混叠低通滚降', cHalfFs: 'f_s/2 = 22.05 kHz', cCD: 'f_s = 44.1 kHz',
    s6fin: '采样定理的真正含义不是"采得越快越好"，而是<strong>"先决定放弃什么，再采"</strong>：放弃高频细节，是为了不让它们乔装成低频来骗你。这一页的三件事——频谱为什么会复制、模糊为什么能救场——分别是傅里叶页和卷积页的主场，欢迎回去对表。',
    s6linkF: '← 回傅里叶页看频谱为什么会复制',
    s6linkC: '去卷积页看模糊核在干什么 →',
  },
  en: {
    docTitle: 'Sampling & Aliasing · One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Sampling & Aliasing',
    tagline: 'Why do wheels spin backwards on video, and why is a CD exactly 44.1 kHz? One reason covers both: the world is continuous, but we only ever peek at it once in a while. Peek often enough and the world reassembles; peek too lazily and you start seeing things that were never there.',
    nav0: '0 Hook', nav1: '1 Sampling = peeking', nav2: '2 A fake wave is born', nav3: '3 The Nyquist line',
    nav4: '4 Aliasing in frequency', nav5: '5 Aliasing everywhere', nav6: '6 Squint first',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Sampling & Aliasing — one interaction at a time',
    labF: 'Signal frequency f (Hz)', labFs: 'Sample rate f_s (Hz)',
    dirFwd: 'forward, same direction', dirRev: 'BACKWARDS!', dirStill: 'frozen still',
    wNoteEdge: ' — boundary case: exactly at ±f_s/2, forwards and backwards are indistinguishable — the wheel actually flickers between two positions (the step-3 “exactly 2f: it depends on phase” case).',

    s0k: 'Step 0 · Get fooled first',
    s0t: 'Which way is this wheel actually turning?',
    s0e: 'The wheel below turns at a steady <strong>2.5 revolutions per second</strong> and never changes. The only thing you may touch is the camera’s frame rate: drag the slider and watch it slow down, freeze, and then <strong>spin backwards</strong>. The wheel never changed — the sampling did. Every camera, and every eye, only peeks at the world once in a while.',
    s0fps: 'Camera frame rate f_s (fps)',
    s0ro: 'True speed {rev} rev/s (constant) · spoke-passing frequency {sp} Hz · frame rate {fps} fps → apparent speed {app} rev/s · {dir}{note}',
    s0hint: 'The orange dot on the rim marks the wheel’s <strong>true position</strong> — it keeps turning honestly, never pausing. The apparent speed is not a guess: fold the spoke-passing frequency with f<sub>alias</sub> = |f − k·f<sub>s</sub>| and divide by the spoke count, and you get exactly the speed your eyes report. Step 5 checks this formula on the spot.',
    cRealPos: 'true position', cSeen: 'what the camera sees',

    s1k: 'Step 1 · What sampling is',
    s1t: 'Can a row of dots remember a wave?',
    s1e: 'Here is a sine wave in the continuous world. <strong>Sampling</strong> means peeking once every 1/f<sub>s</sub> seconds and writing down one number. Watch the dots land — every single one sits <strong>exactly on the original wave</strong>; sampling never lies. Then we connect the dots (straight lines) or hold each value until the next peek (steps): the dots are fact, <strong>the connection is our imagination</strong>. Raise f<sub>s</sub> and the dots crowd together until imagination barely matters.',
    s1line: 'Connect with lines', s1hold: 'Hold (steps)',
    s1ro: 'f = {f} Hz · f_s = {fs} Hz · samples per period = {spp}',
    s1hint: 'Lower f<sub>s</sub> and watch: the connected line is already crooked, yet <strong>every dot still sits honestly on the original wave</strong>. Remember this scene — the error is never in the dots, it is in the connection. Next step, the connection conjures up an entire wave that does not exist.',
    cOrig: 'original wave', cSamp: 'sample points', cRecon: 'connected dots',

    s2k: 'Step 2 · A fake is born',
    s2t: 'The dots never lied — you connected them wrong',
    s2e: 'Push f<sub>s</sub> below f and look again: the samples still all sit on the original wave, but by themselves they line up into <strong>a different, slower wave</strong>. The rose-pink “fake wave” passes through every single sample exactly — from the dots alone there is no way to tell it apart from the original. Its frequency is decided by one formula: fold f by f<sub>s</sub>, over and over, into the half-room [0, f<sub>s</sub>/2]. The fold has a direction, too: when the signed folded frequency g is negative (9 Hz sampled at 10 Hz, or 14 Hz at 20 Hz), the fake wave comes out <strong>mirrored, its phase flipped</strong> — the same event as the wheel turning backwards in step 0, except here it is the waveform that flips.',
    s2pSlow: 'Classic slow wave: f=9, f_s=10', s2pDC: 'Pinned to one phase: f=f_s=10',
    s2pFold: 'Folded: f=14, f_s=20', s2pClean: 'No aliasing: f=3, f_s=25',
    s2formulaNote: 'k is the integer that lands the result in [0, f<sub>s</sub>/2]. Every readout, spectrum position and audio pitch on this page is computed with this one formula — steps 4 and 5 settle the accounts one by one.',
    s2ro: 'f = {f} Hz · f_s = {fs} Hz · k = {k} · f_alias = |{f} − {k}×{fs}| = {alias} Hz{note}',
    s2noteAlias: ' — that is the fake wave',
    s2noteSame: ' — no aliasing: the “fake” wave is the original',
    s2noteDC: ' — DC: every peek hits the same phase',
    s2hint: 'The nastiest preset is “pinned to one phase”: when f is an exact multiple of f<sub>s</sub>, every peek lands on exactly the same phase, all dots collapse to a single value — <strong>no matter how fast the wave, it looks frozen</strong>. That is the truth behind the “stopped” wheel in step 0.',
    cAlias: 'fake wave f_alias',

    s3k: 'Step 3 · The line',
    s3t: 'The Nyquist line: twice, and not a hair less',
    s3e: 'Sweep f<sub>s</sub> across the 2f line: above twice, the samples can only belong to the original wave and no fake exists; approaching twice, the fake wave hugs the original frequency while its phase drifts on, so the connected reconstruction <strong>swells and fades dramatically</strong>; below twice, the fake takes over. Exactly at 2f is the subtlest case — only two peeks per period, and the outcome <strong>depends entirely on phase luck</strong>. Press the button to pin f<sub>s</sub> at 2f, then drag the phase slider.',
    s3phase: 'Sampling phase φ (°)', s3snap: 'Pin to exactly 2f',
    s3roAbove: 'f_s = {fs} Hz > 2f = {two} Hz: no aliasing — the dots can only belong to the original.',
    s3roBelow: 'f_s = {fs} Hz < 2f = {two} Hz: aliased — fake wave at {alias} Hz.',
    s3roAt: 'f_s = 2f = {two} Hz: all down to phase — max |sample| = {amp} (1 = full amplitude, 0 = wiped out).',
    s3hint: 'At φ=90° every peek lands near a peak and the dots swing at full amplitude — looks perfectly fine. Drag to φ=0°: every peek lands exactly on a zero crossing, <strong>every dot is 0 and the connection is a flat line</strong> — the wave is right there, yet the samples swear there is nothing. That is why the criterion is written f<sub>s</sub> > 2f: equality only works when you are lucky.',
    cAmp: 'sample envelope',

    s4k: 'Step 4 · The frequency view',
    s4t: 'Aliasing in the frequency domain: the spectrum clones itself',
    s4e: 'On the <a class="fourier-link" href="../fourier/#step5">Fourier page</a> we saw that a pure tone is a single peak in the spectrum. Sampling has a side effect: the whole spectrum is <strong>copied endlessly, one copy every f<sub>s</sub></strong>. <a class="fourier-link" href="../ztransform/#step5">The same story on the z-plane: strips and twin points →</a> With a generous f<sub>s</sub> the copies ignore each other and the middle slice [0, f<sub>s</sub>/2] is enough to rebuild the signal; with a stingy one, a peak from a neighbouring copy lands inside that slice — <strong>that is the fake wave from step 2, with its frequency-domain birth certificate</strong>. Drag f<sub>s</sub> and watch the copy spacing change.',
    s4ro: 'Copy spacing = f_s = {fs} Hz · the peak inside the baseband [0, {half} Hz] sits at {alias} Hz — the same number as the time-domain fake wave in step 2.',
    s4roClean: 'Copy spacing = f_s = {fs} Hz · f_s > 2f: the baseband [0, {half} Hz] holds only the original peak. Clean.',
    s4roZero: 'Special case: f is an exact half-integer multiple of f<sub>s</sub> — every sample of the sine lands on a zero crossing, the sampled sequence is identically zero, and the spectrum is completely empty (the same effect as the zero fake wave at f = f<sub>s</sub> in step 2). Nudge f or f<sub>s</sub> a little and all the copies come right back.',
    s4hint: 'Notice what aliasing really is: not “the signal got a bit dirty”, but <strong>high-frequency information moved bodily into the low frequencies, impersonating them</strong>. Once sampling is done, the true peak and the alias peak look identical — no filter afterwards can separate them. Prevention has to happen before sampling.',
    cPeak: 'original peak f', cCopy: 'spectral copy', cBase: 'baseband [0, f_s/2]', cAliasPeak: 'alias peak f_alias',

    s5k: 'Step 5 · Aliasing everywhere',
    s5t: 'It is everywhere in daily life',
    s5e: 'Three exhibits, one formula. ①<strong>Sound</strong>: sample a high tone at a low rate, point by point and for real, then play it back — what you hear is not the original, it is the fake wave. ②<strong>Images</strong>: decimate a fine striped picture pixel by pixel and a moiré grows by itself. ③<strong>The wheel</strong>: back to step 0, checking the apparent-speed formula on the spot.',
    tabAudio: '① Audio', tabImage: '② Image moiré', tabWheel: '③ Checking the wheel',

    s5aF: 'Source frequency f (Hz)', s5aFs: 'Nominal sample rate f_s',
    s5aPlayAlias: '▶ Play the sampled result', s5aPlayOrig: '▶ Play the original frequency',
    s5aro: 'Source f = {f} Hz · sample rate f_s = {fs} Hz · k = {k} · formula alias f_alias = {alias} Hz · measured zero-crossings of the buffer ≈ {zcr} Hz',
    s5aHint: 'Full disclosure: the plot above shows the first 240 sample points of the playback buffer, each computed as the sine value at its true sampling instant t = n/f<sub>s</sub> — <strong>not a low-frequency wave faking it</strong>. The pitch you hear is the zero-crossing rate of those very points (the “measured zero-crossings” in the readout is exactly the check a reviewer would run). Silent by default, click to play, volume kept low. Above 10 kHz some people cannot hear the original at all — but its alias falls back into the audible range, where everyone can hear it. Special case: when f is an exact multiple of f<sub>s</sub> (f = f<sub>s</sub>, 2f<sub>s</sub>, …), every sample lands on the same phase (a zero crossing of the sine), so the buffer is all zeros and playback is silence — also true.',
    cBuf: 'first 240 samples of the playback buffer (dot = one real sample)',

    s5iSrc: 'Original (fine stripes)', s5iOut: 'After decimation (magnified)',
    s5iStride: 'Decimation stride (take one pixel every …)',
    patStripes: 'Vertical stripes', patGrid: 'Grid', patRings: 'Concentric rings', patScene: 'Scene + fine stripes',
    s5iro: 'Original {w}×{h} · stride {m} px · {w2}×{h2} samples left (magnified)',
    s5iHint: 'There is no “draw a wavy pattern” code anywhere: the right image merely <strong>takes one pixel out of every {m}</strong> (nearest-neighbour decimation) and magnifies the result. The fat waves grow out of the sampling grid folding against the fine stripes — moiré is aliasing for images. Drag the stride and the waves change thickness and direction. Step 6 cures it.',

    s5wN: 'Spokes N', s5wRev: 'True speed (rev/s)', s5wFps: 'Frame rate f_s (fps)',
    s5wro: 'Spoke-passing frequency f_sp = N × speed = {n} × {rev} = {sp} Hz · k = {k} · apparent speed = {app} rev/s · {dir}{note}',
    s5wHint: 'The check works exactly as in step 0: the spoke pattern repeats N times per revolution, so the “signal frequency” is the spoke-passing frequency N×speed; fold it against the frame rate with f<sub>alias</sub> and divide by N to get the apparent speed. A negative sign means backwards. Drag until the spoke frequency hits an exact multiple of the frame rate and the wheel “freezes”.',

    s6k: 'Step 6 · Finale',
    s6t: 'Before you sample, learn to squint',
    s6e: 'The cure for aliasing sounds like surrender: <strong>erase the detail you cannot afford to look at — by hand, before sampling.</strong> Below, the same original runs through the same decimation pipeline with one step different: on the left, direct decimation and the moiré runs wild; on the right, a genuine convolution blur first (the box kernel from the convolution page, doing honest work), then decimation: the waves are gone and the picture is softer, but <strong>nothing in it is fake</strong>. Squint at the world and you see less — but you stop seeing wrong.',
    s6direct: 'Direct decimation', s6blur: 'Blur first, then decimate',
    s6ro: 'Stride {m} px · both sides keep {w2}×{h2} samples · the right side applies a box blur (radius {r} px, two passes) before decimating',
    s6audio: 'Audio says the same sentence: before the analog-to-digital converter, studios place an analog low-pass filter to cut everything above the ear’s limit, and only then sample. That is why the CD rate is <strong>44.1 kHz</strong>: the ear tops out near 20 kHz, twice that is 40 kHz, and the extra room up to 22.05 kHz (= f<sub>s</sub>/2) is a transition band so the filter can roll off gently from 20 kHz instead of falling off a cliff — 44.1 is engineered, not a lucky number.',
    cEar: 'signal (ear limit ≈ 20 kHz)', cLpf: 'anti-alias filter rolloff', cHalfFs: 'f_s/2 = 22.05 kHz', cCD: 'f_s = 44.1 kHz',
    s6fin: 'The sampling theorem does not really say “sample as fast as you can”. It says <strong>“decide what to give up first, then sample”</strong>: you surrender the high-frequency detail precisely so it cannot dress up as low frequency and lie to you. Two threads from this page — why spectra clone themselves, and why blur can save the day — are the home turf of the Fourier and convolution pages; feel free to go back and compare notes.',
    s6linkF: '← Back to Fourier: why spectra clone themselves',
    s6linkC: 'On to convolution: what the blur kernel is doing →',
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
