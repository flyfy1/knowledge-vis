'use strict';
const STR = {
  "zh": {
    "docTitle": "波的干涉 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "波的干涉",
    "tagline": "两列波相遇：有的点更闹，有的点反而彻底安静，而且这幅强弱图样纹丝不动。从一列波的振动开始，亲手把「路程差定加强与抵消」验出来。",
    "foot": "波的干涉 · 一步一交互",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互图；操作方法见上方说明",
    "play": "▶ 播放",
    "pause": "⏸ 暂停",
    "lamLab": "波长 λ（单位长度）",
    "pxLab": "P 的横位置 x（键盘可调）",
    "pyLab": "P 的纵位置 y（键盘可调）",
    "nav0": "0 一列波",
    "s0k": "第 0 步",
    "s0t": "先看清一列波：每一点只是在原地振动",
    "s0e": "这一步要回答：一列波经过时，水面上的一个点到底怎样动？上方是俯视图：一个<strong>波源</strong>（发出波的那个点）在水面点动，同心圆纹向外扩散，亮圈是波峰（水面最高处）的位置，暗圈是波谷。P 是浮在水面的一片小木屑。下方左图是侧面波形：横轴是离波源的距离 r，纵轴是水面高出平静面的<strong>位移 y</strong>；相邻两个波峰之间的距离就是<strong>波长 λ</strong>（图上已标出）。<strong>振幅 A</strong> 是位移的最大值；周期 T 是 P 完成一次完整振动的时间，本页 T = 4 秒。拖动 P（或用滑杆），看右下方 P 的位移随时间的曲线：P 只上下振动，并不随圆纹漂走——波传播的是振动，不是水本身。本页只讨论简谐波：每点的位移随时间按正弦规律变化。",
    "s0ro": "λ = {lam}；P 离波源 r = {r}；P 现在的位移 y = {y}（在 −1 与 1 之间摆动，A = 1）。",
    "s0hint": "观察顺序：先盯住 P 本身（只上下动），再看圆纹向外跑——「点不动、纹在跑」，这就是波。",
    "srcLab": "波源",
    "profTitle": "侧面波形（距离 → 位移）",
    "traceTitle": "P 的位移—时间",
    "nav1": "1 双源相遇",
    "s1k": "第 1 步",
    "s1t": "两个波源：加强还是抵消，只看路程差",
    "s1e": "这一步要回答：再放一个波源，哪些点变强、哪些点变弱？两个波源 S₁、S₂ 同时点动，频率、波长、起步步调都相同。任意一点 P 同时收到两列波，它每一刻的位移都是两列波位移的<strong>相加</strong>——这叫叠加（<a class=\"fourier-link\" href=\"../fourier/#step2\">傅里叶页第 2 步专讲：复杂波形 = 简单波形相加 →</a>）。P 到两个波源的距离之差叫<strong>路程差 Δr</strong>。拖动 P 到各处，看下方三条曲线：两列波各自在 P 的位移，和它们的和。有的点上两列波总同涨同落，合振幅达到 2A；有的点上总此涨彼落，合位移恒为 0，那个点永远不动，叫<strong>静点</strong>。这种两列波叠加后强弱分布固定下来的现象，就叫<strong>干涉</strong>。",
    "btnMax": "把 P 放到加强点（Δr = 0）",
    "btnMin": "把 P 放到静点（Δr = λ/2）",
    "s1ro": "r₁ = {r1}，r₂ = {r2}，路程差 Δr = {dr}，即 Δr = {n}λ；两列波在 P 的合振幅 = {amp}A（单列振幅 A = 1）。",
    "clsMax": "加强：两列波到达 P 时步调一致，同涨同落，合振幅是单列的 2 倍。",
    "clsMin": "抵消：两列波到达 P 时步调恰好相反，每一刻位移都互为相反数，相加恒为 0——P 是静点，始终不动。",
    "clsMid": "未达完全加强或完全抵消：合振幅在 0 与 2A 之间，不能把小振幅叫作始终不动。",
    "clsWordMax": "加强点",
    "clsWordMin": "静点",
    "clsWordMid": "一般干涉点",
    "y1Lab": "波 1 在 P",
    "y2Lab": "波 2 在 P",
    "sumLab": "合位移",
    "silentMark": "静",
    "stillPt": "静点",
    "nav2": "2 稳定的图样",
    "s2k": "第 2 步",
    "s2t": "图样为什么稳定：强弱点各连成一组双曲线",
    "s2e": "这一步要回答：动画里波纹看着乱成一团，为什么说图样是稳定的？把 Δr 恰好等于 kλ（k = 0, 1, 2…）的所有点连起来，是一组双曲线——<strong>加强线</strong>（绿）；把 Δr 恰好等于 (k+½)λ 的点连起来，是另一组——<strong>静线</strong>（红虚线）。打开包络视图，动画继续播，这些线纹丝不动：因为每个点加强还是抵消只由它的路程差决定，与时间无关。拖 λ 滑杆：λ 越小，两组线排得越密。此结论的适用条件：两个波源同频、步调差恒定；频率不同，强弱位置会随时间漂移，连不成稳定图样。",
    "envLab": "包络视图：叠印加强线与静线",
    "legMax": "— 加强线 Δr = kλ",
    "legMin": "┄ 静线 Δr = (k+½)λ",
    "s2ro": "P：Δr = {dr} = {n}λ（λ = {lam}）；合振幅 = {amp}A。",
    "nav3": "3 相位与叠加",
    "s3instant": "同一 P=({x}, {y})，同一时刻 t≈{time}s：y₁≈{a}A，y₂≈{b}A，y₁+y₂≈{sum}A。瞬时位移不是周期振幅。",
    "phaseSlider": "源相位差 φ/π（0–2；拖动会暂停）",
    "phaseTask": "先预测：P 保持在等距离处，只把 φ 从 0 拖到 0.5π、π、2π，合振幅依次是 2A、√2A、0、2A。再把 P 移到左右两侧，比较带符号的传播路程。改 φ 不会换地点或推进时钟。",
    "phaseReset": "重置第3步并暂停",
    "phaseTrace": "曲线是“当前 P 与参数”的前两个周期解析预测，不是过去的实测记录；改参会整段重画。右端圆点是同一时刻的值；前两行纵轴范围为 ±A，合成行是 ±2A，不能把不同标尺下的屏幕高度直接相比。合振幅描述周期极值，某一时刻的和为零并不等于振幅为零。",
    "phaseScope": "模型：同频、到达 P 的振幅相同、相位差固定（相干）的线性简谐波。A=1 是归一化位移，T=4s 是演示设定；忽略传播衰减、反射与色散。圆纹只示意波峰位置，不是真实水面求解。静点只用浮点计算误差级容差识别；接近抵消仍会动，小振幅不会四舍五入成“严格零”。",
    "phaseEnergyTitle": "振幅和强度不是同一个量",
    "phaseEnergy": "振幅是位移偏离的最大值；强度是单位面积上的平均能量流。在适用的同频、同介质行波比较中，平均强度才按振幅平方变化，不能把 2A 叫作“两倍强度”。本页没有计算二维波场的能流或波源功率；不能从单点抵消推断能量被消灭。",
    "phaseEnergySource": "OpenStax16.4 · 波的能量与功率 ↗",
    "phaseMap": "回到知识地图：叠加与干涉 →",
    "phaseSource": "OpenStax16.5 · 同一点的波形相加 ↗",
    "s3k": "第 3 步",
    "s3t": "保持同一点、同一时刻，只改变相位差",
    "s3e": "相位表示振动走到一周期的哪里，相位差 φ 是两源的起步步调之差，以弧度计（一周为 2π）。拖动 φ 会暂停并保留当前 P 和时刻 t；三条曲线立即按新参数重算。两列波在 P 的到达相位差 δ，还要扣除传播路程的贡献：<strong>δ=φ−2π(r₂−r₁)/λ</strong>。这里 d=r₂−r₁ 带正负，不能把前两步同相源用的 |d| 直接搬过来。",
    "phiLab": "相位差 φ：",
    "phi0": "φ = 0（同相起步）",
    "phiPi": "φ = π（反相起步）",
    "s3ro": "带符号路程差 d={d}（{n}λ）；源相位 φ={phi}π rad，到达相位 δ≈{delta}π rad。周期合振幅 B=2A|cos(δ/2)|≈{amp}A。",
    "nav4": "4 自测",
    "s4k": "第 4 步",
    "s4t": "自测：三道题，同一把尺子量路程差",
    "s4e": "每道题先自己算 Δr/λ，再点选项。答对锁定；答错可以再想、再答。",
    "q1q": "题 1 · 某点到两个波源的路程差 Δr = 1.5λ，两波源同相起步（φ = 0）。这个点是？",
    "q1o0": "加强点",
    "q1o1": "静点（抵消）",
    "q1o2": "一会儿加强、一会儿抵消",
    "q1ok": "对了。Δr/λ = 1.5 是半整数：两列波到达时步调恰好相反，每一刻都抵消——静点，而且永远静。",
    "q1no": "再算一次：Δr/λ = 1.5。整数倍才加强，半整数倍是抵消；图样稳定，静点不会随时间变。",
    "q2q": "题 2 · 下图里 P 是固定的，Δr = 1 个单位。先看 λ = 2 时它的判定，再用按钮把 λ 减半到 1、重新判定，然后回答：λ 减半后，这个点变成？",
    "lamToggle": "切换 λ：2 ↔ 1（重新判定）",
    "q2demo": "λ = {lam}：P 的 Δr = 1，Δr/λ = {n} → {cls}。",
    "q2o0": "仍是静点",
    "q2o1": "变成加强点",
    "q2o2": "变成部分加强点",
    "q2ok": "对了。λ 减半后 Δr/λ 从 0.5 变成 1——由半整数变整数，原静点成了加强点。判定只认 Δr/λ，不认 Δr 本身。",
    "q2no": "看上面的实测台：切换 λ 后 Δr/λ 变成了多少？整数倍 → 加强，半整数倍 → 静点。",
    "q3q": "题 3 · 判断：「干涉图样里的静点，是因为两列波都没有到达那里。」这句话对吗？",
    "q3o0": "对",
    "q3o1": "错",
    "q3ok": "对了，这句话是错的。两列波都到达了静点——第 1 步的时序曲线能看到每一列都还在动；只是每一刻两列位移恰好相反，相加恒为 0。",
    "q3no": "回到第 1 步把 P 放在静点，看下方曲线：两列波各自在 P 的位移都不是 0，只是互为相反数。",
    "resetQuiz": "重做自测（清分数）",
    "score": "自测：已答对 {k}/3 题。",
    "nav5": "5 终章",
    "s5k": "终章",
    "s5t": "终章：干涉的三句话",
    "s5e": "这一页从一列波的振动出发：波传的是振动不是物质；两列波相遇后，每一点的命运只由路程差（和起步相位差）决定，于是强弱图样被几何定死。",
    "card1t": "一 · 相加是本质",
    "card1": "每一点的位移都是两列波位移之和。加强与抵消不是两种机制，只是这个加法的两个极端：同涨同落得 2A，此涨彼落得 0。",
    "card2t": "二 · 路程差定加强与抵消",
    "card2": "同相双源：Δr = kλ 加强，Δr = (k+½)λ 抵消。有相位差 φ 时，把 φ 折算成周期数与 Δr/λ 合并计算，整数 → 加强，半整数 → 抵消。",
    "card3t": "三 · 图样由几何定死",
    "card3": "加强点连成一组双曲线、静点连成另一组，不随时间漂移；λ 越小，两组线越密。前提是两源同频、步调差恒定。",
    "slitNote": "光也是波：双缝干涉算的是同一笔账——屏上明暗条纹的位置同样由路程差决定；条纹间距的定量公式留到光学线再展开，本页先把账算清。",
    "linkFourier": "波形相加：复杂波形 = 简单波形相加，叠加原理在傅里叶页 →",
    "linkTrig": "正弦波从哪来：圆的投影摊开，就是正弦波 →"
  },
  "en": {
    "docTitle": "Wave Interference · One Interaction per Step",
    "back": "← Knowledge Index",
    "pageTitle": "Wave Interference",
    "tagline": "Two waves meet: some points get livelier, others go completely still — and the pattern of loud and quiet never moves. Starting from one wave's vibration, verify for yourself that the path difference decides reinforcement and cancellation.",
    "foot": "Wave Interference · One Interaction per Step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive diagram for this step; see the text above for how to operate it",
    "play": "▶ Play",
    "pause": "⏸ Pause",
    "lamLab": "Wavelength λ (length units)",
    "pxLab": "P's x position (arrow keys work)",
    "pyLab": "P's y position (arrow keys work)",
    "nav0": "0 One wave",
    "s0k": "Step 0",
    "s0t": "Read one wave first: every point just vibrates in place",
    "s0e": "This step answers: when a wave passes, how exactly does one point on the water move? Above is the top view: a <strong>wave source</strong> (the point emitting the wave) ripples the surface, concentric rings spread outward; bright rings are crests (the surface at its highest), dim rings are troughs. P is a small wood chip floating on the surface. Below left is the side profile: the horizontal axis is distance r from the source, the vertical axis is the <strong>displacement y</strong> of the surface above its rest level; the distance between two neighbouring crests is the <strong>wavelength λ</strong> (marked on the plot). The <strong>amplitude A</strong> is the largest displacement; the period T is the time P takes for one full vibration — here T = 4 s. Drag P (or use the sliders) and watch the bottom-right curve of P's displacement over time: P only bobs up and down, it does not drift away with the rings — a wave carries vibration, not the water itself. This page treats simple harmonic waves only: each point's displacement varies sinusoidally in time.",
    "s0ro": "λ = {lam}; P is at distance r = {r} from the source; P's displacement right now is y = {y} (swinging between −1 and 1, A = 1).",
    "s0hint": "What to watch, in order: first P itself (it only moves up and down), then the rings running outward — “the point stays, the pattern runs” is what a wave is.",
    "srcLab": "Source",
    "profTitle": "Side profile (distance → displacement)",
    "traceTitle": "P's displacement vs time",
    "nav1": "1 Two sources",
    "s1k": "Step 1",
    "s1t": "Two sources: reinforcement or cancellation — only the path difference decides",
    "s1e": "This step answers: add a second source — which points get stronger, which get weaker? Sources S₁ and S₂ ripple together with the same frequency, wavelength and starting phase. Any point P receives both waves at once, and its displacement at every instant is the <strong>sum</strong> of the two waves' displacements — superposition (<a class=\"fourier-link\" href=\"../fourier/#step2\">Step 2 of the Fourier page is all about this: a complex waveform = simple waves added →</a>). The difference of P's distances to the two sources is the <strong>path difference Δr</strong>. Drag P around and watch the three curves below: each wave's displacement at P, and their sum. At some points the two waves always rise and fall together and the combined amplitude reaches 2A; at others they always oppose each other, the sum stays 0 forever, and the point never moves — a <strong>still point</strong>. This settling of two superposed waves into a fixed pattern of strong and weak is called <strong>interference</strong>.",
    "btnMax": "Move P to a reinforcement point (Δr = 0)",
    "btnMin": "Move P to a still point (Δr = λ/2)",
    "s1ro": "r₁ = {r1}, r₂ = {r2}, path difference Δr = {dr}, i.e. Δr = {n}λ; the combined amplitude at P is {amp}A (single-wave amplitude A = 1).",
    "clsMax": "Reinforcement: the two waves arrive at P in step, rising and falling together; the combined amplitude is twice a single wave's.",
    "clsMin": "Cancellation: the two waves arrive at P exactly out of step; at every instant their displacements are exact opposites and sum to 0 — P is a still point and never moves.",
    "clsMid": "Neither full reinforcement nor full cancellation: amplitude is between 0 and 2A. Small motion is not an always-still point.",
    "clsWordMax": "reinforcement point",
    "clsWordMin": "still point",
    "clsWordMid": "intermediate interference",
    "y1Lab": "Wave 1 at P",
    "y2Lab": "Wave 2 at P",
    "sumLab": "Sum",
    "silentMark": "Still",
    "stillPt": "still point",
    "nav2": "2 A steady pattern",
    "s2k": "Step 2",
    "s2t": "Why the pattern is steady: strong and still points each trace a family of hyperbolas",
    "s2e": "This step answers: the ripples look like a jumble — why call the pattern steady? Join all points with Δr exactly kλ (k = 0, 1, 2, …) and you get a family of hyperbolas — the <strong>reinforcement lines</strong> (green); join all points with Δr exactly (k+½)λ and you get a second family — the <strong>still lines</strong> (red, dashed). Turn on the envelope view: the animation keeps playing and these lines do not move at all, because whether a point is reinforced or cancelled is fixed by its path difference alone, not by time. Drag the λ slider: the smaller λ, the more densely the two families pack. Conditions: the two sources must share one frequency with a constant phase difference; with different frequencies the strong and weak spots drift over time and no steady pattern forms.",
    "envLab": "Envelope view: overlay reinforcement and still lines",
    "legMax": "— Reinforcement Δr = kλ",
    "legMin": "┄ Still Δr = (k+½)λ",
    "s2ro": "P: Δr = {dr} = {n}λ (λ = {lam}); combined amplitude = {amp}A.",
    "nav3": "3 Phase & addition",
    "s3instant": "Same P=({x}, {y}), same time t≈{time}s: y₁≈{a}A, y₂≈{b}A, y₁+y₂≈{sum}A. Instantaneous displacement is not cycle amplitude.",
    "phaseSlider": "Source phase φ/π (0–2; editing pauses)",
    "phaseTask": "Predict: keep P equidistant and compare φ=0, 0.5π, π, 2π. The cycle amplitudes are 2A, √2A, 0, 2A. Then move P to either side and compare the signed propagation distance. Editing φ does not move P or advance the clock.",
    "phaseReset": "Reset Step3 & pause",
    "phaseTrace": "Traces are the previous two cycles of the CURRENT-parameter analytic prediction, not recorded measurements; edits redraw the whole prediction. Right-end dots show the same instant. The first two rows span ±A; the sum row spans ±2A. Do not compare screen heights across these different scales. Cycle amplitude is the largest excursion, so a zero sum now does not imply zero amplitude.",
    "phaseScope": "Model: linear sinusoidal waves of the same frequency, equal received amplitudes and fixed phase difference (coherence). A=1 is normalized displacement and T=4s is a teaching setting. Spreading, attenuation, reflection and dispersion are omitted. Rings illustrate crest positions, not a fluid solution. Still points use only floating-point-scale tolerance; near cancellation remains nonzero and tiny amplitudes are not rounded to an exact zero.",
    "phaseEnergyTitle": "Amplitude is not intensity",
    "phaseEnergy": "Amplitude is maximum displacement; intensity is average energy flow per area. Only under the appropriate same-medium, same-frequency traveling-wave assumptions does average intensity scale with amplitude squared. Do not call 2A “twice the intensity”. This page calculates neither energy flux in the 2D field nor source power, and cancellation at one point does not mean energy is destroyed.",
    "phaseEnergySource": "OpenStax16.4 · wave energy and power ↗",
    "phaseMap": "Back to the atlas: superposition & interference →",
    "phaseSource": "OpenStax16.5 · add waves at the same point ↗",
    "s3k": "Step 3",
    "s3t": "Keep the same point and time; change only relative phase",
    "s3e": "Phase marks progress through a cycle. The source phase difference φ is measured in radians (one turn is 2π). Editing φ pauses and keeps the current P and time t; all traces are immediately recalculated. Arrival phase also includes propagation: <strong>δ=φ−2π(r₂−r₁)/λ</strong>. Here d=r₂−r₁ is signed. The absolute path difference used for the earlier in-phase cases cannot replace it at general φ.",
    "phiLab": "Phase difference φ:",
    "phi0": "φ = 0 (in-phase start)",
    "phiPi": "φ = π (opposite start)",
    "s3ro": "Directed path difference d={d} ({n}λ); source phase φ={phi}π rad, arrival phase δ≈{delta}π rad. Cycle amplitude B=2A|cos(δ/2)|≈{amp}A.",
    "nav4": "4 Self-check",
    "s4k": "Step 4",
    "s4t": "Self-check: three questions, one ruler — the path difference",
    "s4e": "For each question, work out Δr/λ yourself first, then pick an option. A correct answer locks; a wrong one lets you think and retry.",
    "q1q": "Q1 · A point has path difference Δr = 1.5λ to the two sources, which start in phase (φ = 0). This point is…",
    "q1o0": "a reinforcement point",
    "q1o1": "a still point (cancellation)",
    "q1o2": "sometimes reinforced, sometimes cancelled",
    "q1ok": "Correct. Δr/λ = 1.5 is a half-integer: the waves arrive exactly out of step and cancel at every instant — a still point, still forever.",
    "q1no": "Compute again: Δr/λ = 1.5. Whole multiples reinforce, half multiples cancel; the pattern is steady, so a still point never changes with time.",
    "q2q": "Q2 · In the plot below P is fixed with Δr = 1 unit. First read its verdict at λ = 2, then use the button to halve λ to 1 and re-judge. Question: after halving λ, this point becomes…",
    "lamToggle": "Toggle λ: 2 ↔ 1 (re-judge)",
    "q2demo": "λ = {lam}: P has Δr = 1, so Δr/λ = {n} → {cls}.",
    "q2o0": "still a still point",
    "q2o1": "a reinforcement point",
    "q2o2": "a partially reinforced point",
    "q2ok": "Correct. Halving λ moves Δr/λ from 0.5 to 1 — from half-integer to integer — so the former still point is now reinforced. The verdict reads Δr/λ, never Δr alone.",
    "q2no": "Look at the live bench above: after toggling λ, what did Δr/λ become? Integer → reinforcement, half-integer → still point.",
    "q3q": "Q3 · True or false: “A still point in an interference pattern is still because neither wave ever reaches it.”",
    "q3o0": "True",
    "q3o1": "False",
    "q3ok": "Correct — the statement is false. Both waves do reach the still point: in Step 1's traces each wave is visibly still moving there; their displacements are simply exact opposites at every instant and sum to 0.",
    "q3no": "Go back to Step 1, park P on a still point and watch the traces: each wave's displacement at P is not zero — they are exact opposites.",
    "resetQuiz": "Reset the self-check (clear score)",
    "score": "Self-check: {k}/3 answered correctly.",
    "nav5": "5 Wrap-up",
    "s5k": "Wrap-up",
    "s5t": "Wrap-up: interference in three sentences",
    "s5e": "This page started from one wave's vibration: a wave carries vibration, not matter. Once two waves meet, each point's fate is decided by its path difference (and the starting phase difference), so the strong–weak pattern is fixed by geometry alone.",
    "card1t": "1 · Adding is the whole mechanism",
    "card1": "Every point's displacement is the sum of the two waves' displacements. Reinforcement and cancellation are not two mechanisms — they are the two extremes of one addition: in step gives 2A, exactly opposed gives 0.",
    "card2t": "2 · The path difference decides",
    "card2": "In-phase sources: Δr = kλ reinforces, Δr = (k+½)λ cancels. With a phase difference φ, convert φ into cycles and combine it with Δr/λ: a whole number reinforces, a half number cancels.",
    "card3t": "3 · Geometry fixes the pattern",
    "card3": "Reinforcement points trace one family of hyperbolas, still points another, and neither drifts with time; the smaller λ, the denser both families. The premise: same frequency, constant phase difference.",
    "slitNote": "Light is a wave too: double-slit interference keeps the same ledger — fringe positions on the screen are likewise set by path differences. The quantitative fringe-spacing formula waits for the optics line; this page settles the ledger itself.",
    "linkFourier": "Adding waveforms: a complex waveform = simple waves added — the superposition principle on the Fourier page →",
    "linkTrig": "Where a sine wave comes from: a circle's projection, unrolled, is a sine wave →"
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
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
