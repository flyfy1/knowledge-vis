'use strict';
const STR = {
  "zh": {
    "docTitle": "驻波 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "驻波",
    "tagline": "两列一模一样的波迎面相撞，波形却不再奔跑，而是站在原地起伏——每个点的振幅被一条不动的包络定死，有的点纹丝不动。从两列对跑的波开始，亲手把波节、波腹和弦的整数台阶验出来。",
    "foot": "驻波 · 一步一交互",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互图；操作方法见上方说明",
    "play": "▶ 播放",
    "pause": "⏸ 暂停",
    "lamLab": "波长 λ（单位长度）",
    "pxLab": "P 的横位置 x（键盘可调）",
    "lenLab": "弦长 L（单位长度）",
    "freqLab": "驱动频率 f（Hz）",
    "viewLab": "显示：",
    "viewSum": "看合成",
    "viewRight": "只看右行",
    "viewLeft": "只看左行",
    "envLab": "包络线叠印（±2A·cos(kx)）",
    "cmpLab": "叠印基频（n = 1）对比",
    "btnNode": "把 P 放到波节（x = λ/4）",
    "btnAnti": "把 P 放到波腹（x = 0）",
    "btnSnap": "吸附：按波长距离选最近可达模式",
    "modeLab": "模式 n：",
    "crestMark": "波峰标记线",
    "nodeMark": "波节",
    "antiMark": "波腹",
    "traceTitle": "P 的位移—时间",
    "respTitle": "稳态振幅—驱动频率（示意模型）",
    "nav0": "0 对跑叠加",
    "s0k": "第 0 步",
    "s0t": "两列波迎面跑：波形为什么停下来",
    "s0e": "这一步要回答：一列向右跑的简谐波 y₁ = A·sin(ωt − kx)，再放一列一模一样、迎面跑来的 y₂ = A·sin(ωt + kx)，叠起来每一点怎么动？（正弦波形从哪来——<a class=\"fourier-link\" href=\"../trig/#step2\">三角页第 2 步专讲：把身高摊开，就是正弦波 →</a>）每一点的位移都是两列波位移的相加。图上本页取 A = 1、周期 T = 4 秒、波速沿用口径；青线是右行波，橙线是左行波，白线是合成波。看合成波形：波峰不再左右迁移，只在原地升降——橙色虚线是波峰标记，它始终守在同一 x 附近，不像行波那样跑。拖 P，看下方 P 的位移—时间曲线：P 仍按正弦振动，但振幅随位置而异，有的点振多高、有的点纹丝不动。",
    "s0ro": "P 在 x = {x}：右行波 y₁ = {y1}，左行波 y₂ = {y2}，合成 y = {ys}（两列实算相加）。",
    "s0hint": "这种两列反向波叠加后、波形不迁移、每点原地振动的图样，就叫<strong>驻波</strong>。合位移 y = y₁ + y₂ = 2A·cos(kx)·sin(ωt)：「空间包络 × 时间振动」可以拆开——cos(kx) 决定每点振多高，sin(ωt) 决定全体何时一起到顶。",
    "nav1": "1 波节波腹",
    "s1k": "第 1 步",
    "s1t": "波节与波腹：每点的振幅由包络定死",
    "s1ro": "P 在 x = {x}（x/λ = {xr}）；振幅 |C| = 2A·|cos(kx)| = {amp} A；当前参数的解析曲线采样极值 ≈ {meas} A（非实测，含浮点舍入误差）。",
    "clsNode": "波节：振幅恒为 0，时序曲线压成一条直线——它永远不动。",
    "clsAnti": "波腹：振幅 2A，振得最高的地方。",
    "clsGen": "普通点：振幅 {amp}A，永远在 0 与 2A 之间。",
    "s1e": "先看每点能振多高：最大位移的大小叫<strong>振幅</strong>，各点振幅连成的轮廓叫<strong>包络</strong>。这里 y(x,t)=C(x)·sin(ωt)，C(x)=2A·cos(kx)：振幅是 |C|，不是带符号的 C。C=0 是永远不动的<strong>波节</strong>，x=(2m+1)λ/4；|C|=2A 是<strong>波腹</strong>，x=mλ/2（m 为整数）。相邻波节间距 λ/2，波节到相邻波腹 λ/4。再问：两点是否一起升降？固定参考点 Q 在 x=0，拖动 P 或选下面预设，再播放；两条曲线共用时钟和刻度。",
    "s1hint": "同一对相邻波节之间，各点同相（一起升降）；跨一个波节，C 的符号翻转，相位相差 π（半个周期）；跨两个波节又同相。波节振幅为零，没有可比较的振动相位。不能凭某一瞬间两点都在零位移处就判定同相。",
    "nav2": "2 弦的台阶",
    "boundaryNear": "试近似：L=6，λ=6.05",
    "boundaryReset": "重置第2步并暂停",
    "boundaryEndpoint": "演示时刻 t≈{time}s：试探右端位移≈{instant}A；整个周期要求的右端振幅≈{end}A。此刻碰巧为零不等于恒为零。",
    "boundaryTask": "先预测：选“试近似”，q≈1.98347，是否就算模式2？看端点包络，再按吸附：λ变为6，q变为2，端点才恒为零。λ拖动连续；键盘方向键每步0.05，PageUp/Down每步0.5，Home/End到量程端点。吸附保留2L/n的完整计算值，不量化到0.05网格。",
    "boundaryLegend": "白点/墙：真实固定端要求的零位移。青色虚线：不兼容的候选形状；红圈：它此刻要求的端点位移；红虚线：它整个周期的非零端点包络。只有边界匹配才画成绿色实线与波节。数值容差仅处理浮点误差，不是“差2%也算成立”。",
    "boundaryScope": "本步固定T=4s仅演示候选空间形状；改变λ也改变示意波速λ/T，不是在同一根固定波速的真实弦上扫频。第3步指定波速后才计算频率。失败只说明此单一自由振动候选不满足边界，不表示外力驱动时弦完全不动；本步未求受迫或离共振响应。改参会暂停并保留时刻，属于假想对照。",
    "boundarySource": "OpenStax16.6 · 固定端筛选允许模式 ↗",
    "boundaryPhase": "回看同一点的相位与叠加 →",
    "s2k": "第 2 步",
    "s2t": "近似匹配，算满足固定端吗？",
    "s2e": "固定端要求 y(0,t)=y(L,t)=0 在<strong>所有时刻</strong>成立，不是某一瞬间经过零。A 是单列分量波振幅（本页取1），k=2π/λ。原候选式 y=A sin(ωt−kx)−A sin(ωt+kx)=−2A cos(ωt)sin(kx) 只自动保证左端 x=0；右端还要满足 sin(kL)=0，即 <strong>q=2L/λ=n，n=1,2,…</strong>。这样的单一自由振动形状才是本征模式，允许波长 λₙ=2L/n。不是整数的候选式仍可画出来检验，但不能把它当成真实固定弦的运动。",
    "s2ro": "L={L}，λ≈{lam}；q=2L/λ≈{q}。按波长距离、在滑轨量程内最近的候选：n={n}，λₙ≈{lamn}；对应 |q−n|≈{dev}。",
    "modeOk": "模式 n={n}：在浮点计算精度内满足固定端条件。λₙ=2L/n≈{lamn}，整个周期的端点包络为零。近似显示不代替精确比值。",
    "modeNo": "试探式不满足右固定端：它要求右端振幅约 {end}A，而固定端要求整个周期恒为零；不能称为已成立的本征模式。",
    "nav3": "3 谐波族",
    "s3k": "第 3 步",
    "s3t": "谐波族：同一根弦的整数台阶",
    "s3e": "这一步要回答：L = 6 的弦上，这组模式排成一列长什么样、频率是什么关系？波速 v 由弦的张紧程度与粗细决定，本页取定值 v = 3（单位长度/秒，是模拟设定）。第 n 个模式的波长 λ_n = 2L/n，频率 f_n = v/λ_n。命名就近落地：n = 1 的模式叫<strong>基频</strong>（基波），n ≥ 2 叫<strong>谐波</strong>（第 n 次谐波）。乐器音色由各次谐波的配比决定——那是乐器线的账，本页不展开。切 n = 1…5，看形状与频率两本账如何一起数台阶。",
    "s3ro": "模式 n = {n}：λ_n = 2L/n = {lamn}；f_n = v/λ_n = {fn} Hz；f_n/f₁ = {ratio}；波节 {nodes} 个（含两端），波腹 {anti} 个。",
    "nav4": "4 共振",
    "s4k": "第 4 步",
    "s4t": "共振：外力踩中台阶",
    "s4e": "这一步要回答：在弦一端用很小的力以频率 f 持续强迫振动，什么时候振幅会长到很大？先定义：<strong>固有频率</strong>是系统自己能稳定振动的那些频率——就是上一步的 f_n = n·f₁ 一族。用滑杆把驱动频率 f 从 0.05 扫到 1.40 Hz：只有 f 命中某个 f_n 时，整弦才点亮成对应模式、振幅读数冲峰；一偏离就塌。结论：<strong>共振</strong> = 驱动频率等于某个固有频率时振幅显著增大。共振是「选模式」，不是「越大力越响」。本步的响应曲线是<strong>示意模型，非实测</strong>：峰位由 f_n 实算，峰高与峰宽是示意参数。",
    "s4ro": "驱动频率 f = {f} Hz；最近的固有频率 f_{n} = {fn} Hz；稳态振幅（<strong>示意模型</strong>，非实测）= {amp}。",
    "resLit": "踩中了：驱动频率命中 f_{n}，整弦正在以第 {n} 个模式的形状振动。",
    "resOff": "没踩中：驱动频率在两个台阶之间，振幅塌下去，弦形也散了。",
    "s4hint": "像推秋千：每一下都踩在它自己摆动的节拍上，劲才攒得起来；踩错节拍，劲反而互相抵消。适用条件：小幅驱动、阻尼较小，且驱动点不能正好落在该模式的波节上（那里根本推不动）。阻尼变大时，响应峰会变矮、变宽——本页取小阻尼定值，峰高峰宽是示意参数，不是实测数据。",
    "nav5": "5 自测",
    "s5k": "第 5 步",
    "s5t": "自测：四道题，同一套纯函数",
    "s5e": "每道题的判定都借页面纯函数实算，不是写死的答案。先自己算，再点选项。答对锁定；答错可以再想、再答。",
    "q1q": "题 1 · λ = 4（单位长度）的驻波（本页第 1 步的绳口径，包络 2A·|cos(kx)|），x = 1 处是波节还是波腹？",
    "q1o0": "波节",
    "q1o1": "波腹",
    "q1o2": "都不是",
    "q1ok": "对了。A(1) = 2A·|cos(2π/4·1)| = 2A·|cos(π/2)| = 0——振幅恒为零，是波节。",
    "q1no": "回到第 1 步：x = 1、λ = 4 时，A(x) = 2A·|cos(kx)| 算出来是多少？为 0 → 波节，为 2A → 波腹。",
    "q2q": "题 2 · 两端固定的弦，L = 6。能存在的最长波长是多少？",
    "q2o0": "12",
    "q2o1": "6",
    "q2o2": "3",
    "q2ok": "对了。模式条件 L = n·(λ/2)，n = 1 时波长最长：λ₁ = 2L = 12。",
    "q2no": "用第 2 步的判定：q = L/(λ/2) 必须是整数。三个选项里哪个能让 n = 1 成立？",
    "q3q": "题 3 · 判断：「波节处没有波传到，所以不动。」这句话对吗？",
    "q3o0": "对",
    "q3o1": "错",
    "q3ok": "对了，这句话是错的。两列波都到达波节——只是每一刻两列位移恰好互为相反数，相加恒为 0。这和干涉页的静点是同一个道理。",
    "q3no": "回到第 0 步：把 P 放到波节，看右行波和左行波各自在 P 的位移——它们是 0 吗？",
    "q4q": "题 4 · 弹吉他时按住弦的中点（发声长度减半），基频变为原来的几倍？",
    "q4o0": "2 倍",
    "q4o1": "不变",
    "q4o2": "一半",
    "q4ok": "对了。f₁ = v/2L，长度减半 → 分母减半 → 基频翻 2 倍，和第 3 步的公式对得上。",
    "q4no": "用第 3 步的公式：f₁ = v/2L。L 变成 L/2，f₁ 怎么变？",
    "resetQuiz": "重做自测（清分数）",
    "score": "自测：已答对 {k}/4 题。",
    "s5hintAll": "四道题的判定走的是同一批纯函数——①振幅 A(x) = 2A·|cos(kx)| 在 x = 1、λ = 4 处恒为零；②模式 q = L/(λ/2)，L = 6 时 n = 1 给 λ₁ = 12；③波节处两列位移每刻互为相反数；④f₁ = v/2L，弦长减半基频翻倍。",
    "nav6": "6 终章",
    "s6k": "终章",
    "s6t": "终章：驻波的三句话",
    "s6e": "这一页从两列对跑的波出发：波峰不再迁移，只在原地升降；包络把每点的振幅定死；边界把波长筛成整数台阶，外力踩中台阶就是共振。",
    "card1t": "一 · 对跑叠加生出包络",
    "card1": "y = y₁ + y₂ = 2A·cos(kx)·sin(ωt)：空间包络 × 时间振动可以拆开。波形不迁移，全体一起到顶、一起回零。",
    "card2t": "二 · 波节波腹由包络定死",
    "card2": "A(x) = 2A·|cos(kx)|：为 0 的点是波节（x = (2m+1)λ/4），为 2A 的点是波腹（x = mλ/2）。波节不动不是没波到，是两列波每刻互为相反数。",
    "card3t": "三 · 边界筛出整数台阶",
    "card3": "两端固定 → L = n·(λ/2)，频率排成 f_n = n·f₁。驱动频率踩中某个 f_n，振幅才显著长大——共振是选模式。",
    "windNote": "管乐器是空气柱里的驻波：一端封闭时，台阶换成 λ/4 的奇数倍——那是声音线的账，本页不展开。",
    "linkInt1": "干涉：两个波源、路程差定加强与抵消 —— 那是空间里的强弱图样；本页是一列波迎面撞上自己的反向同伴，是时间里的原地振动 →",
    "linkInt2": "干涉的稳定图样：双曲线族 —— 与本页一维的驻波包络对照看 →",
    "linkTrig": "正弦波从哪来：圆的侧影摊开成波 —— 本页两列对跑的波都是它 →",
    "phaseTrace": "P 实线 / Q 虚线 · 位移 y（以 A 为单位）",
    "phasePast": "t − 2T（T=4 s）",
    "phaseNow": "当前 t",
    "phaseLegend": "橙色实线与实心点 P；青色虚线与空心点 Q（固定 x=0）。下图同一纵轴 ±2A，显示当前参数下最近两周期的解析预测，非实测轨迹；改参会重算。",
    "phaseControls": "调参会暂停并保留时刻；播放时 P、Q 位置固定。P 键盘：方向键 ±0.05、Page ±0.5，Home/End 到两端。x、λ 用同一单位长度；A=1 为位移单位。T=4 s 是慢速演示设定，改 λ 不模拟固定波速下的频率变化。",
    "phaseSameBtn": "同段 P=λ/8",
    "phaseOppBtn": "跨一节 P=λ/2",
    "phaseReset": "重置并暂停",
    "phaseSame": "C(P) = {c} A > 0：相对 Q 同相（0），振幅可以不同。",
    "phaseOpposite": "C(P) = {c} A < 0：相对 Q 反相（π），一个上升时另一个下降。",
    "phaseNode": "C(P) = 0：P 是波节，振幅零；相对 Q 的振动相位未定义。",
    "phaseValues": "同一时刻 t ≈ {time} s：y(P) ≈ {p} A，y(Q) ≈ {q} A。",
    "phaseSpacing": "P 到最近波节的距离 ≈ {node}，到最近波腹的距离 ≈ {antinode}；波节到下一个波节（或波腹到下一个波腹）固定为 λ/2 = {period}。",
    "phaseCanvas": "同一时间轴和位移刻度上的 P 实线与 Q 虚线预测；比较结论见下方文字。",
    "phaseQuestion": "试预测：先重置，再选跨一节。t=0 时 P、Q 都为零，这能证明同相吗？播放再看：不能，随后两点向相反方向运动。再选波节：P 始终不动，不应说它与 Q 同相或反相。",
    "phaseSourceTitle": "依据与模型范围",
    "phaseSource": "理想、线性、同频同幅的两列反向简谐波。OpenStax 16.6 给出空间因子乘时间因子的驻波解；本页采用不同的空间/时间原点，直接相加得到 2Acos(kx)sin(ωt)。相位结论由空间因子的符号推出；零振幅时任何相位都表示同一个零函数，故相位未定义。这里不是第2步的两端固定弦，也不是阻尼、传播瞬态或实测数据。"
  },
  "en": {
    "docTitle": "Standing Waves · One Interaction per Step",
    "back": "← Knowledge Index",
    "pageTitle": "Standing Waves",
    "tagline": "Two identical waves collide head-on, yet the waveform stops running and instead rises and falls in place — each point's amplitude locked by a motionless envelope, some points never moving at all. Starting from two counter-propagating waves, verify nodes, antinodes and the string's integer steps for yourself.",
    "foot": "Standing Waves · One Interaction per Step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive diagram for this step; see the text above for how to operate it",
    "play": "▶ Play",
    "pause": "⏸ Pause",
    "lamLab": "Wavelength λ (length units)",
    "pxLab": "P's x position (arrow keys work)",
    "lenLab": "String length L (length units)",
    "freqLab": "Drive frequency f (Hz)",
    "viewLab": "Show:",
    "viewSum": "Sum",
    "viewRight": "Right-going only",
    "viewLeft": "Left-going only",
    "envLab": "Overlay envelope (±2A·cos(kx))",
    "cmpLab": "Overlay fundamental (n = 1) for comparison",
    "btnNode": "Move P to a node (x = λ/4)",
    "btnAnti": "Move P to an antinode (x = 0)",
    "btnSnap": "Snap: nearest reachable wavelength mode",
    "modeLab": "Mode n:",
    "crestMark": "Crest marker",
    "nodeMark": "node",
    "antiMark": "antinode",
    "traceTitle": "P's displacement vs time",
    "respTitle": "Steady-state amplitude vs drive frequency (illustrative model)",
    "nav0": "0 Head-on superposition",
    "s0k": "Step 0",
    "s0t": "Two waves run at each other: why does the waveform stop?",
    "s0e": "This step answers: given a right-going harmonic wave y₁ = A·sin(ωt − kx) and an identical wave coming the other way, y₂ = A·sin(ωt + kx), what does every point do when they add up? (Where a sine wave comes from — <a class=\"fourier-link\" href=\"../trig/#step2\">the trigonometry page is all about this: unroll the height, and you get the sine wave →</a>) Each point's displacement is the sum of the two waves. Here A = 1, period T = 4 s; cyan is the right-going wave, orange the left-going one, white the sum. Watch the summed waveform: crests no longer migrate left or right — they only rise and fall in place. The orange dashed line is a crest marker: it stays near the same x, unlike a travelling wave. Drag P and watch P's displacement-vs-time curve below: P still vibrates sinusoidally, but its amplitude depends on where it stands — some points rise high, some never move.",
    "s0ro": "P at x = {x}: right-going y₁ = {y1}, left-going y₂ = {y2}, sum y = {ys} (the two waves added, computed).",
    "s0hint": "A pattern where two counter-propagating waves add up so the waveform stops migrating and each point vibrates in place is called a <strong>standing wave</strong>. The sum is y = y₁ + y₂ = 2A·cos(kx)·sin(ωt): a spatial envelope times a temporal vibration — cos(kx) decides how high each point rises, sin(ωt) decides when the whole wave peaks together.",
    "nav1": "1 Nodes & antinodes",
    "s1k": "Step 1",
    "s1t": "Nodes and antinodes: each point's amplitude is locked by the envelope",
    "s1ro": "P at x = {x} (x/λ = {xr}); amplitude |C| = 2A·|cos(kx)| = {amp} A; sampled extremum of the CURRENT-parameter analytic prediction ≈ {meas} A (not measured; includes floating-point roundoff).",
    "clsNode": "Node: amplitude stays 0, the time trace is squeezed into a straight line — it never moves.",
    "clsAnti": "Antinode: amplitude 2A, where the vibration is largest.",
    "clsGen": "Ordinary point: amplitude {amp}A, always between 0 and 2A.",
    "s1e": "First ask how far each point can move. The largest displacement magnitude is its <strong>amplitude</strong>; their outline is the <strong>envelope</strong>. Here y(x,t)=C(x)·sin(ωt), C(x)=2A·cos(kx): amplitude is |C|, not signed C. C=0 marks a stationary <strong>node</strong>, x=(2m+1)λ/4; |C|=2A marks an <strong>antinode</strong>, x=mλ/2 (integer m). Adjacent nodes are λ/2 apart; a node and its nearest antinode are λ/4 apart. Now ask whether two points rise together. Reference Q stays at x=0. Drag P or choose a preset, then play: both traces share one clock and scale.",
    "s1hint": "Points within the same interval between adjacent nodes are in phase (rise together). Crossing one node reverses C and changes phase by π (half a cycle); crossing two restores the phase. A node has zero amplitude and no comparable oscillation phase. Both displacements being zero at one instant does not prove equal phase.",
    "nav2": "2 The string's steps",
    "boundaryNear": "Try near mode: L=6, λ=6.05",
    "boundaryReset": "Reset Step2 & pause",
    "boundaryEndpoint": "Demonstration time t≈{time}s: trial right-end displacement≈{instant}A; its whole-cycle endpoint amplitude≈{end}A. A zero now does not mean always zero.",
    "boundaryTask": "Predict: select “Try near mode”. Does q≈1.98347 count as mode 2? Inspect the endpoint envelope, then Snap: λ becomes 6 and q becomes 2; only then does the endpoint stay zero. Dragging λ is continuous. Arrow keys change it by 0.05, PageUp/Down by 0.5, Home/End go to bounds. Snap keeps the full 2L/n value, without 0.05-grid quantization.",
    "boundaryLegend": "White pins/walls: required zero displacement. Cyan dashed line: incompatible trial shape; red ring: its demanded endpoint now; red dashed marker: its nonzero full-cycle endpoint envelope. Only a boundary match receives a green solid curve and nodes. Numerical tolerance handles floating-point error, not a “within 2% counts” rule.",
    "boundaryScope": "The fixed demonstration T=4s shows candidate spatial shapes. Changing λ also changes the illustrative λ/T speed; this is not a frequency sweep of one unchanged physical string. Step 3 specifies wave speed before calculating frequency. Failure rules out this single free-mode trial, not every possible forced motion; no forced or off-resonance response is solved here. Edits pause at the same time for a hypothetical comparison.",
    "boundarySource": "OpenStax16.6 · fixed ends select allowed modes ↗",
    "boundaryPhase": "Revisit same-point phase and superposition →",
    "s2k": "Step 2",
    "s2t": "Does almost matching satisfy fixed ends?",
    "s2ro": "L={L}, λ≈{lam}; q=2L/λ≈{q}. Nearest reachable candidate by wavelength distance: n={n}, λₙ≈{lamn}; its |q−n|≈{dev}.",
    "modeOk": "Mode n={n}: fixed-end conditions hold within floating-point precision. λₙ=2L/n≈{lamn}; the endpoint envelope vanishes for the whole cycle. Rounded display does not replace the exact ratio.",
    "modeNo": "Incompatible trial: it demands a right-end amplitude of about {end}A, but the pin requires zero throughout the cycle. This is not an established normal mode.",
    "s2e": "Fixed ends require y(0,t)=y(L,t)=0 at <strong>every time</strong>, not merely a zero crossing now. A is each component’s amplitude (normalized to1 here), and k=2π/λ. The original trial y=A sin(ωt−kx)−A sin(ωt+kx)=−2A cos(ωt)sin(kx) automatically fixes only x=0. The right end additionally needs sin(kL)=0, or <strong>q=2L/λ=n, n=1,2,…</strong>. Only then is this single free-vibration shape a normal mode, with λₙ=2L/n. An incompatible trial can be drawn for inspection, but is not actual motion of a fixed-end string.",
    "nav3": "3 Harmonic family",
    "s3k": "Step 3",
    "s3t": "The harmonic family: integer steps on one string",
    "s3e": "This step answers: on a string of length L = 6, what does this row of modes look like, and how are their frequencies related? The wave speed v is set by the string's tension and thickness — this page fixes v = 3 (length units/s; a modelling choice). The n-th mode has wavelength λ_n = 2L/n and frequency f_n = v/λ_n. Names: the n = 1 mode is the <strong>fundamental</strong>, n ≥ 2 are <strong>harmonics</strong> (the n-th harmonic). Instrument timbre comes from the mix of harmonics — that is the instruments line's story; not here. Switch n = 1…5 and watch shape and frequency climb the steps together.",
    "s3ro": "Mode n = {n}: λ_n = 2L/n = {lamn}; f_n = v/λ_n = {fn} Hz; f_n/f₁ = {ratio}; nodes {nodes} (including both ends), antinodes {anti}.",
    "nav4": "4 Resonance",
    "s4k": "Step 4",
    "s4t": "Resonance: the drive lands on a step",
    "s4e": "This step answers: drive one end of the string gently but continuously at frequency f — when does the amplitude grow large? First, the definition: <strong>natural frequencies</strong> are the frequencies at which the system can vibrate stably on its own — exactly the f_n = n·f₁ family from the last step. Sweep the drive frequency f from 0.05 to 1.40 Hz with the slider: only when f lands on some f_n does the whole string light up in that mode's shape and the amplitude readout shoot up; step off and it collapses. Conclusion: <strong>resonance</strong> = a large amplitude when the drive frequency equals a natural frequency. Resonance selects a mode; it is not “more force = more sound”. The response curve in this step is an <strong>illustrative model, not measured data</strong>: peak positions are computed from the f_n, while peak heights and widths are illustrative parameters.",
    "s4ro": "Drive frequency f = {f} Hz; nearest natural frequency f_{n} = {fn} Hz; steady-state amplitude (<strong>illustrative model</strong>, not measured) = {amp}.",
    "resLit": "Landed: the drive hits f_{n}, and the string is vibrating in the n = {n} mode's shape.",
    "resOff": "Missed: the drive sits between two steps, the amplitude collapses and the shape falls apart.",
    "s4hint": "Like pushing a swing: every push lands on its own rhythm and the energy piles up; push off-rhythm and the efforts cancel. Conditions: small drive, light damping, and the drive point must not sit exactly on that mode's node (nothing moves there). Heavier damping makes the peaks shorter and wider — this page fixes light damping; peak heights and widths are illustrative parameters, not measured data.",
    "nav5": "5 Self-check",
    "s5k": "Step 5",
    "s5t": "Self-check: four questions, one set of pure functions",
    "s5e": "Every verdict is computed by the page's pure functions — nothing is hard-coded. Work each one out yourself first, then pick. A correct answer locks; a wrong one lets you think and retry.",
    "q1q": "Q1 · A standing wave with λ = 4 (length units, this page's Step-1 rope with envelope 2A·|cos(kx)|): at x = 1, node or antinode?",
    "q1o0": "Node",
    "q1o1": "Antinode",
    "q1o2": "Neither",
    "q1ok": "Correct. A(1) = 2A·|cos(2π/4·1)| = 2A·|cos(π/2)| = 0 — zero amplitude forever: a node.",
    "q1no": "Go back to Step 1: at x = 1, λ = 4, what does A(x) = 2A·|cos(kx)| compute to? Zero → node, 2A → antinode.",
    "q2q": "Q2 · A string fixed at both ends, L = 6. What is the longest wavelength that can exist?",
    "q2o0": "12",
    "q2o1": "6",
    "q2o2": "3",
    "q2ok": "Correct. The mode condition is L = n·(λ/2); n = 1 gives the longest wavelength: λ₁ = 2L = 12.",
    "q2no": "Use Step 2's rule: q = L/(λ/2) must be an integer. Which option makes n = 1 hold?",
    "q3q": "Q3 · True or false: “A node is still because no wave ever reaches it.”",
    "q3o0": "True",
    "q3o1": "False",
    "q3ok": "Correct — the statement is false. Both waves do reach the node: in Step 0 you can see each wave still moving at a node; their displacements are simply exact opposites at every instant and sum to 0. The still points on the interference page work the same way.",
    "q3no": "Go back to Step 0: park P on a node and look at each wave's displacement at P — are they zero?",
    "q4q": "Q4 · Pressing a guitar string at its midpoint halves the sounding length. How many times the old value is the fundamental now?",
    "q4o0": "Twice",
    "q4o1": "Unchanged",
    "q4o2": "Half",
    "q4ok": "Correct. f₁ = v/2L; halving the length halves the denominator, so the fundamental doubles — exactly what Step 3's formula says.",
    "q4no": "Use Step 3's formula: f₁ = v/2L. If L becomes L/2, what happens to f₁?",
    "resetQuiz": "Reset the self-check (clear score)",
    "score": "Self-check: {k}/4 answered correctly.",
    "s5hintAll": "All four verdicts come from the same pure functions — ① amplitude A(x) = 2A·|cos(kx)| is forever zero at x = 1, λ = 4; ② the mode quotient q = L/(λ/2), with L = 6 and n = 1 giving λ₁ = 12; ③ at a node the two waves' displacements are exact opposites at every instant; ④ f₁ = v/2L, so halving the string doubles the fundamental.",
    "nav6": "6 Wrap-up",
    "s6k": "Wrap-up",
    "s6t": "Wrap-up: standing waves in three sentences",
    "s6e": "This page started from two head-on waves: crests stop migrating and only rise and fall in place; the envelope locks each point's amplitude; the boundary sieves wavelengths into integer steps, and a drive that lands on a step is resonance.",
    "card1t": "1 · Head-on superposition grows an envelope",
    "card1": "y = y₁ + y₂ = 2A·cos(kx)·sin(ωt): a spatial envelope times a temporal vibration. The waveform does not migrate — everything peaks together and returns together.",
    "card2t": "2 · The envelope locks nodes and antinodes",
    "card2": "A(x) = 2A·|cos(kx)|: zeros are nodes (x = (2m+1)λ/4), maxima 2A are antinodes (x = mλ/2). A node is still not because no wave arrives, but because the two waves are exact opposites at every instant.",
    "card3t": "3 · The boundary sieves integer steps",
    "card3": "Fixed ends → L = n·(λ/2), frequencies line up as f_n = n·f₁. Only a drive frequency that lands on some f_n grows large — resonance selects a mode.",
    "windNote": "Wind instruments are standing waves in an air column: with one end closed, the steps become odd multiples of λ/4 — that is the sound line's story; it is not expanded here.",
    "linkInt1": "Interference: two sources, path difference deciding reinforcement and cancellation — that is a pattern of loud and quiet in space; this page is one wave colliding head-on with its own reversed companion: vibration in place, in time →",
    "linkInt2": "Interference's steady pattern: the hyperbola family — compare it with this page's one-dimensional standing-wave envelope →",
    "linkTrig": "Where a sine wave comes from: a circle's profile, unrolled into a wave — both of this page's head-on waves are one →",
    "phaseTrace": "P solid / Q dashed · displacement y (units of A)",
    "phasePast": "t − 2T (T=4 s)",
    "phaseNow": "Current t",
    "phaseLegend": "P: orange solid trace and filled dot. Q: cyan dashed trace and open dot, fixed at x=0. Both use the same ±2A vertical axis. The last two cycles are an analytic prediction for CURRENT parameters, not measured history; edits recompute it.",
    "phaseControls": "Edits pause and hold time; P and Q stay fixed while playing. P keyboard: arrows ±0.05, Page ±0.5, Home/End to bounds. x and λ share a length unit; A=1 is the displacement unit. T=4 s is a slow demonstration setting; changing λ is not a fixed-wave-speed frequency sweep.",
    "phaseSameBtn": "Same interval P=λ/8",
    "phaseOppBtn": "Across one node P=λ/2",
    "phaseReset": "Reset and pause",
    "phaseSame": "C(P) = {c} A > 0: in phase with Q (0); amplitudes may differ.",
    "phaseOpposite": "C(P) = {c} A < 0: opposite phase to Q (π); one rises as the other falls.",
    "phaseNode": "C(P) = 0: P is a zero-amplitude node; its oscillation phase relative to Q is undefined.",
    "phaseValues": "At the SAME time t ≈ {time} s: y(P) ≈ {p} A, y(Q) ≈ {q} A.",
    "phaseSpacing": "P is ≈ {node} from the nearest node and ≈ {antinode} from the nearest antinode; node-to-node (or antinode-to-antinode) spacing stays fixed at λ/2 = {period}.",
    "phaseCanvas": "P solid and Q dashed predictions share time and displacement axes; the comparison is explained below.",
    "phaseQuestion": "Predict: reset, then choose Across one node. At t=0 both P and Q are zero. Does that prove equal phase? Play: no, they then move in opposite directions. Choose Node: P never moves, so calling it in or out of phase with Q is inappropriate.",
    "phaseSourceTitle": "Source and model limits",
    "phaseSource": "Ideal linear superposition of equal-frequency, equal-amplitude sinusoidal waves travelling in opposite directions. OpenStax 16.6 derives a spatial factor times a time factor. With this page’s shifted space/time origins, direct addition gives 2Acos(kx)sin(ωt). Spatial-sign reversal yields the phase result; at zero amplitude every phase represents the same zero function, so phase is undefined. This is not Step 2’s fixed-end string, a damped/transient solver, or measured data."
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
