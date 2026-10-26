'use strict';
/* ============================================================
   频率响应与滤波讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '频率响应与滤波 · 按频率挑食的盒子 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '频率响应与滤波 · 挑食的盒子',
    tagline: '一个线性时不变的盒子，对正弦的回答永远是同频正弦——只被缩放、只被推迟。把「放行率」|H(ω)| 和「迟到量」φ(ω) 随频率画出来，就是这个盒子的全部性格：频率响应。它既是系统的体检报告，也是滤波器的设计图：所谓滤波，就是按频率挑食。本页每条曲线都当场量、当场算给你看。',
    nav0: '0 挑食的盒子', nav1: '1 正弦进正弦出', nav2: '2 波特图', nav3: '3 移动平均的零点',
    nav4: '4 相位毁波形', nav5: '5 高通与带通', nav6: '6 终章 · 设计台',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 频率响应与滤波 Frequency Response & Filters —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '盒子在按频率挑食',
    s0e: '先看一个说不清原理的盒子。上图是一段波形：<strong>慢而干净的正弦</strong>，被一层<strong>快而细密的噪声</strong>糊住了。送进盒子之后再看输出——噪声大半消失，慢波几乎原样还在。盒子没见过这段波形，它凭什么知道哪部分该留、哪部分该扔？<a class="fourier-link" href="../fourier/#step5">这些频率成分是谁拆出来的：傅里叶页的频谱步 →</a>',
    s0e2: '答案是它<strong>只按频率办案</strong>。下面逐档喂它纯正弦：频率拉高，输出一档比一档矮。每个频率都量一次，把「输出幅值 ÷ 输入幅值」记成一个点——扫完这一排点，盒子的食谱就显形了。',
    s0fLab: '试探正弦的频率 f',
    s0ro: 'f = <span>{f} Hz</span> · 实测放行率 |H| = <span>{g}</span>（时域仿真稳态幅值比）· 已量 <span>{n}</span> 个频率点',
    s0engNote: '口径就近说明：上方<strong>输出波形</strong>由解析稳态叠加画出（两个分量各乘闭式 |H|、各加闭式 φ 再相加），下方<strong>放行率读数</strong>由 ODE 时域仿真实测——同屏两个引擎、口径不同，第 1 步会把它们并排成两张牌对账。',
    s0hint: '这个盒子其实就是后面整页的主角：一阶 <strong>RC 低通</strong>。它对每个频率的放行率排成的曲线，就叫<strong>频率响应 |H(ω)|</strong>；它让每个频率迟到多少，是另一条曲线 φ(ω)。这一页要做的事，就是把这两条曲线量出来、读懂、再反过来用它们设计滤波器。',
    cv0In: '输入：0.5 Hz 正弦 + 7 Hz 噪声',
    cv0Out: '输出：噪声大半被拦，慢波还在',
    cv0InTone: '试探正弦（输入）',
    cv0OutTone: '盒子的回答（输出）',
    cvFreq: '频率 f（Hz，对数轴）',
    cvGain: '放行率 |H|',

    s1k: '第 1 步 · 频率响应是什么',
    s1t: '正弦进、正弦出：只改两件事',
    s1e: '把盒子打开：一个电阻 R 和一个电容 C，输出取电容两端的电压——最经典的一阶 <strong>RC 低通</strong>。给它喂 cos(ωt)，等暂态过去，输出<strong>仍然是同频正弦</strong>，只改两件事：幅值乘上 |H(ω)|，相位被推迟 φ(ω)。下面两张牌并排记着同一个频率的答案：一张是<strong>公式算的</strong>（解析牌），一张是<strong>拿示波器从仿真波形上量的</strong>（实测牌：页面真的用 RK4 数值积分了电路方程，再从稳态波形投影量出幅值与相位）。两张牌对不上，任何一张都不可信。拖动 ω 一档档扫，扫过之处会在下方的 |H| 曲线上逐点点亮。',
    s1formula: 'H(jω) = 1 / (1 + jωRC)，τ = RC = 1 s，ωc = 1/τ = 1 rad/s',
    s1wLab: '输入角频率 ω',
    s1cardA: '解析牌 · 公式算的',
    s1cardB: '实测牌 · 从波形量的',
    s1anaSub: '|H| = 1/√(1+(ωτ)²)，φ = −atan(ωτ)',
    s1meaSub: 'RK4 积分电路方程（步长 = 周期/240），稳态 2 个周期投影量取',
    s1ro: 'ω = <span>{w} rad/s</span> · 两路之差：|Δ|H|| = <span>{dm}</span>，|Δφ| = <span>{dp}°</span> · 已点亮 <span>{n}</span> 个频率点',
    s1hint: '特别看一眼 ω = ωc = 1：|H| 恰好是 1/√2 ≈ 0.707，φ 恰好是 −45°——这个频率叫<strong>截止频率</strong>，下一页整张波特图都围着它转。还有一个口径要说清：所谓「实测」，测的是<strong>稳态</strong>——刚接通那一小段暂态不算数，本页仿真先让电路跑过 6τ + 若干周期再量，评审复核时用的也是同一口径（方法写在实测牌下方）。',
    cv1In: '输入 cos(ωt)',
    cv1Out: '输出（稳态，同频）',
    cvMag: '|H(ω)|',
    cvLit: '你亲手量到的点',
    cvCurve: '解析曲线',

    s2k: '第 2 步 · 波特图',
    s2t: '波特图：工程师的读法',
    s2e: '把第 1 步量出来的两条曲线换上<strong>对数频率轴</strong>、幅值改用<strong>分贝</strong>（dB = 20·log₁₀|H|)，就是工程师天天看的<strong>波特图</strong>。拖动 R、C，截止频率 ωc = 1/(RC) 跟着跑：−3 dB 点（|H| = 1/√2 处）标在幅值图上，高频段的渐近线以 <strong>−20 dB/dec</strong>（频率每涨 10 倍，幅值掉 20 dB）贴着曲线，相位图上 φ(ωc) = −45° 的点也标出来——三处标注全由当前 R、C 现场算。',
    s2rLab: '电阻 R', s2cLab: '电容 C',
    s2ro: 'τ = RC = <span>{tau} s</span> · ωc = <span>{wc} rad/s</span> · 在 ωc 处：|H| = <span>0.7071（−3.01 dB）</span>，φ = <span>−45.0°</span> · 高频斜率（10ωc→100ωc 数值差分实测）= <span>{slope} dB/dec</span>',
    s2quizT: '读图练习：别算，读出来',
    s2quizNext: '换一题',
    s2quizQmag: '看着上面的幅值图：在 <strong>ω = {w} rad/s</strong> 处，|H| 约为多少 dB？',
    s2quizQph: '看着上面的相位图：在 <strong>ω = {w} rad/s</strong> 处，φ 约为多少度？',
    s2quizRight: '<span class="good">读对了。</span> 真值 {v}（公式现算）。已答 {n} 题，对 {c} 题。',
    s2quizWrong: '<span class="bad">不对。</span> 真值是 {v}——在图上找到 ω = {w} 的竖线，再横着读过去。已答 {n} 题，对 {c} 题。',
    s2quizIdle: '点一个你读出的答案。真值由公式现场算，不预置。',
    s2quizRegen: '本题已重新出题。请按当前 R、C 参数读图，再作答。',
    s2hint: '读波特图的诀窍：低频段是平的 0 dB，过 ωc 后贴着 −20 dB/dec 的斜坡走——所以只要知道 ωc 在哪，整条曲线徒手就能画个八九不离十。两级这样的电路理想级联，斜坡变成 −40 dB/dec（第 6 步会用到；说「理想」是因为真实无源级联有负载效应，级间要加缓冲）。',
    cvDb: '幅值（dB）',
    cvPhase: '相位 φ（度）',
    cvCut: '−3 dB 点（ωc）',
    cvAsym: '渐近线 −20 dB/dec',
    cvM45: 'φ = −45°',
    cvQuizPt: '题目点',

    s3k: '第 3 步 · 数字滤波器',
    s3t: '移动平均的零点：点名枪毙一个频率',
    s3e: "换到离散时间：n 是整数样本索引，本步 ω 是数字角频率（rad/样本，也常记作 Ω），不是前面RC模型的 rad/s。若采样率 Fₛ 已知，则 ω = 2πf/Fₛ；未给 Fₛ 就不能指定对应的 Hz。移动平均把最近 M 个样本取平均；当 ω = 2πk/M 且 k 不是 M 的整数倍时，M项正负抵消，响应为零。ω=0或2π的整数倍处则 |H|=1，不是零点。先预测，再用首零点预设和实测样本对账。",
    s3formula: "|H(ω)| = |sin(Mω/2)| / (M·|sin(ω/2)|)；零点 ω = 2πk/M，k∈ℤ且非M的倍数；ω=2πq时 |H|=1。",
    s3mLab: '平均长度 M',
    s3wLab: '输入数字频率 ω（rad/样本）',
    s3pZero: '送零点频率 2π/M',
    s3pSide: '送第一旁瓣峰',
    s3pPass: '送通带低频 0.20',
    s3ro: "M = <span>{M}</span> · ω = <span>{w}</span> rad/样本 · 解析 |H| = <span>{ana}</span> · 离散仿真实测稳态幅值 = <span>{mea}</span>{sideSeg} · 非零频带的线性相位群延迟 = <span>{gd}</span> 个样本（零点处相位/局部群延迟未定义）",
    s3sideSeg: ' · 第一旁瓣峰 |H| = <span>{side}</span>（{sidedb} dB）',
    s3sideNoneSeg: ' · 第一旁瓣峰：<span>无</span>（M = 2 时零点已在 π 处，[0, π] 内没有旁瓣）',
    s3hint: "频率范围0.05到π rad/样本。滑杆←/→步长0.005，Shift加方向键0.05；Home到0.05，End到精确π。预设保留精确频率，不按显示小数舍入。M=2首零点在π，随后改成M=3时，预测幅值1/3并比较解析与实测。零响应不能用来测相位或延迟。旁瓣不是零：移动平均能平滑，却不是理想阻带滤波器。<a class=\"fourier-link\" href=\"https://www.analog.com/media/en/technical-documentation/dsp-book/dsp_book_ch15.pdf\">依据：Smith · 移动平均频率响应 →</a>",
    cv3In: '输入 x[n] = cos(ωn)',
    cv3Out: '输出 y[n]（稳态段）',
    cv3Zero: '零点 2πk/M',
    cv3Cur: '当前 ω',
    cvMagW: '|H(ω)|（ω：0 → π）',

    s4k: '第 4 步 · 相位',
    s4t: '相位也是性格：波形会被迟到毁掉',
    s4e: '前三步只盯着 |H|。现在看另一半性格：<strong>相位</strong>。两个盒子同场竞技：<strong>纯延迟</strong>（|H| 恒为 1、一个频率都不砍，相位 −ωτ<sub>d</sub> 随频率线性增长）和 <strong>RC 低通</strong>（|H| 砍高频，相位 −atan(ωτ) 是弯的）。同一段脉冲串送进去：纯延迟的输出只是整体迟到、<strong>形状一模一样</strong>；RC 的输出边沿被抹圆、拖尾——因为不同频率分量迟到的量不一样，排好的队形被拆散了。下方画着两条相位曲线和 RC 的<strong>群延迟</strong> τ<sub>g</sub>(ω) = −dφ/dω（由相位公式数值微分算出）：它随频率变化，正是队形散掉的原因。',
    s4sigLab: '测试信号',
    s4sigPulse: '脉冲串', s4sigSquare: '方波',
    s4tauLab: '纯延迟 τd / RC 的 τ（同一滑杆）',
    s4ro: 'τ = <span>{tau} s</span> · 纯延迟：|H| 恒 = <span>1（0 dB）</span>，φ(ω) = −ωτ，群延迟恒 = τ · RC：群延迟从 ω=0 的 <span>{gd0} s</span> 随频率降到 ω=2 的 <span>{gd2} s</span>——分量迟到不一，波形必然变形',
    s4hint: '只看 |H| 会得出两个错觉：延迟「什么都没改」（它改了时间本身），RC「只是变安静」（它把波形弄散了）。音频里相位失真让声音发闷，图像里等价的效应让边缘发虚——<strong>幅值决定每个频率还在不在，相位决定它们回来时还认不认得彼此</strong>。还一句口径：上方 RC 波形是从零状态先<strong>预积分 8 s</strong>、暂态基本过去后取出的 0–8 s 稳态段，不是上电瞬间从零爬起的暂态全过程——要比的是稳态下「保形 vs 变形」，先把开关刚合上那一段排除在外。',
    cv4In: '输入',
    cv4Delay: '纯延迟输出（保形）',
    cv4RC: 'RC 输出（边沿抹圆）',
    cv4PhD: '纯延迟 φ = −ωτd（直线）',
    cv4PhRC: 'RC φ = −atan(ωτ)（弯曲）',
    cv4Gd: 'RC 群延迟 τg(ω)（右轴，s）',
    cvPhase4: '相位 φ（度）',

    s5k: '第 5 步 · 换个接法',
    s5t: '高通、带通与共振：同一套数学的三种挑食',
    s5e: '还是 R 和 C，只把输出改取<strong>电阻两端</strong>的电压，低通当场变<strong>高通</strong>：|H(jω)| = ωτ/√(1+(ωτ)²)——低频被拦、高频放行，−3 dB 点还在同一个 ωc = 1/τ。拖 τ 看截止点左右跑，和第 2 步的低通波特图对照着记：一对镜像。',
    s5tauLab: 'RC 高通的 τ（ωc = 1/τ）',
    s5hpro: 'τ = <span>{tau} s</span> · ωc = <span>{wc} rad/s</span> · 在 ωc 处 |H| = <span>0.7071</span>、φ = <span>+45.0°</span>（高通是超前，低通是滞后，正好反号）· ω = 0.1ωc 处 |H| = <span>{lo}</span>（低频被拦到约 1/10）',
    s5e2: '再进一步：把低通和高通背靠背，只放行<strong>中间一段</strong>频率，就是<strong>带通</strong>。标准二阶带通 H(jω) = 1 / (1 + jQ(ω/ω₀ − ω₀/ω))：峰在 ω₀ 处、峰高 1，<strong>Q 品质因数</strong>决定峰的胖瘦——Q 越大峰越尖。读数里有一项现场对账：从曲线上量出的半功率带宽 Δω（|H| 降到峰值 1/√2 的两点之距）应当满足 <strong>Q = ω₀/Δω</strong>，量出来的和滑杆设定的对不对得上，数字说了算。这里展示的是归一化带通输出；弹簧的位移/力响应有不同的分子，峰位和峰高不能直接照搬。<a class="fourier-link" href="../atlas/?trail=response&amp;node=resonance#response-lab">去知识地图对比：阻尼、位移峰与极点 →</a>',
    s5f0Lab: '带通峰频 f₀',
    s5qLab: '品质因数 Q',
    s5bpro: 'f₀ = <span>{f0} Hz</span> · Q 设定 = <span>{q}</span> · 曲线实测半功率点 f₁ = <span>{f1} Hz</span>、f₂ = <span>{f2} Hz</span>，Δf = <span>{bw} Hz</span> · 由实测反推 Q = f₀/Δf = <span>{qchk}</span>（与设定对账）',
    s5hint: '收音机调台就是带通在干活：峰对准电台频率，Q 决定能不能把相邻电台分开。Q 太小，两个台糊在一起；Q 太大，峰尖到连本台的高频成分都被削掉——挑食也要挑得恰到好处。',
    cv5hp: 'RC 高通 |H(ω)|',
    cv5bp: '二阶带通 |H(f)|',
    cv5bpPh: '二阶带通相位 φ(f)',
    cv5cut: '−3 dB 点 ωc',
    cv5half: '半功率点（峰值/√2）',
    cv5peak: '峰 f₀',

    s6k: '第 6 步 · 终章',
    s6t: '设计台：按指标造一个滤波器',
    s6e: '最后一页是考场。任务：一段信号里，<strong>50 Hz 是有用信号，500 Hz 是干扰</strong>。工具箱里有三件工具，参数归你调，点「验收」，页面按所选滤波器的 |H| 公式<strong>现场算</strong>两个频率处的衰减并判定——达标多少、差多少 dB，当场报数，不预置结论。先剧透一句：一阶 RC 无论怎么调都过不了（衰减斜坡太缓），这是第 2 步 −20 dB/dec 的直接后果；二阶和移动平均各有活路——移动平均的活路藏在零点里：采样率 4000 Hz 时，零点在 k·(4000/M) Hz，想让 500 Hz 落在零点上，M 该取多少？',
    s6spec1: '保住 <b>50 Hz</b> 有用信号：衰减 <b>≤ 1 dB</b>',
    s6spec2: '杀掉 <b>500 Hz</b> 干扰：衰减 <b>≥ 20 dB</b>',
    s6toolRc1: '一阶 RC 低通',
    s6toolRc2: '二阶 RC 级联（理想）',
    s6toolMa: '移动平均（Fs = 4000 Hz）',
    s6fcLab: '截止频率 fc',
    s6mLab: '平均长度 M',
    s6judge: '验收 →',
    s6ro: '当前：<b>{tool}</b>{param} · 50 Hz 衰减 = <span>{a50}</span>（要求 ≤ 1 dB）· 500 Hz 衰减 = <span>{a500}</span>（要求 ≥ 20 dB）',
    s6roParamFc: '，fc = {fc} Hz',
    s6roParamM: '，M = {M}（零点在 k·{z} Hz）',
    s6pass: '<span class="verdict pass">验收通过</span> 两项指标都达标：50 Hz 衰减 {a50} ≤ 1 dB，500 Hz 衰减 {a500} ≥ 20 dB。这台滤波器按公式真算，达标。',
    s6fail: '<span class="verdict fail">打回</span> {why}。改参数再验——差距数字就是公式算的，蒙不过去。',
    s6failKeep: '保 50 的指标差 {gap} dB（衰减 {a50}，超过 1 dB 上限）',
    s6failKill: '杀 500 的指标差 {gap} dB（衰减 {a500}，不足 20 dB）',
    s6failBoth: '两项都差：保 50 差 {g1} dB，杀 500 差 {g2} dB',
    s6idle: '还没验收。调好参数，点「验收」——判定由 |H| 公式现场算。',
    s6huge: '＞120 dB（数值零）',
    s6note: '两句口径：一，二阶选项是<strong>理想级联</strong>——两级 RC 之间假定有缓冲放大器隔离，|H| 就是一阶的平方；真实无源级联有负载效应，后级会拖累前级，曲线形状会变（做硬件时要么加缓冲，要么按整体网络重算）。二，移动平均的衰减由 Dirichlet 公式按 Fs = 4000 Hz 折算数字频率 ω = 2πf/Fs 后真算；500 Hz 恰在零点上时衰减是数值零，读数以「＞120 dB」封顶显示。',
    s6card1T: '均衡器',
    s6card1: '音响上的低音/中音/高音旋钮，本质是一排峰频错开的带通（第 5 步）并联：每段管一段频率，各自加减——整台均衡器就是一张被切成条的频率响应图。',
    s6card2T: '图像模糊',
    s6card2: '照片的高频是边缘与细节，低频是大片色块。对图像做二维低通（每个像素和邻居平均）就是高斯模糊的朴素版：和第 3 步的移动平均是同一件事，只是从一排样本换成了一片像素。',
    s6card3T: '通信选频',
    s6card3: '空中同时飘着成百上千个电台与信道，接收机靠带通把目标频率挑出来、把其余的全拦下——第 5 步的 Q 决定了挑得多干净。本页设计台的「保 50 杀 500」，就是每个接收机每天在做的事。',
    s6fin: '收个尾：从体检报告到设计图，是<strong>同一条曲线</strong>——第 1 步你一个频率一个频率把它量出来，第 2 步学会工程师的读法，第 3、4 步分别见识了零点与相位的脾气，第 5 步换接法得到高通与带通，到这里，你已经能拿着指标反过来<strong>造</strong>它了。会读频率响应的人看任何黑箱，第一句话都是同一句：<strong>把每个频率的放行率和迟到量，给我画出来。</strong>',
    s6lkL: '拉普拉斯：从极点读共振 →', s6lkZ: 'Z 变换：单位圆上的频响 →', s6lkLti: '冲激与 LTI：h 的指纹 →',
    cv6keep: '保：50 Hz',
    cv6kill: '杀：500 Hz',
    cv6Db: '|H(f)|（dB）',
    cv6Spec1: '−1 dB 线',
    cv6Spec2: '−20 dB 线'
  },
  en: {
    docTitle: 'Frequency Response & Filters · The Picky Box · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Frequency Response & Filters · The Picky Box',
    tagline: 'An LTI box answers a sine wave with a sine wave of the same frequency — only scaled, only delayed. Plot the pass rate |H(ω)| and the lateness φ(ω) against frequency and you have the box’s entire character: its frequency response. It is both a system’s medical report and a filter’s blueprint — filtering is just being picky by frequency. Every curve on this page is measured and computed live.',
    nav0: '0 The Picky Box', nav1: '1 Sine In, Sine Out', nav2: '2 The Bode Plot', nav3: '3 Moving-Average Zeros',
    nav4: '4 Phase Wrecks Waveforms', nav5: '5 High-Pass & Band-Pass', nav6: '6 Finale · Design Bench',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Frequency Response & Filters — one interaction per step',

    s0k: 'Step 0 · The Hook',
    s0t: 'A box that is picky by frequency',
    s0e: 'Start with a box of unknown principle. The top trace is a <strong>slow, clean sine wave</strong> buried under a layer of <strong>fast, fine noise</strong>. Feed it through the box and look at the output — most of the noise is gone, the slow wave is almost untouched. The box has never seen this waveform. How does it know what to keep and what to throw away? <a class="fourier-link" href="../fourier/#step5">Who splits a signal into these frequencies: the spectrum step on the Fourier page →</a>',
    s0e2: 'The answer: it <strong>judges by frequency alone</strong>. Below, feed it pure sine waves one notch at a time: the higher the frequency, the shorter the output. Measure each frequency once, record “output amplitude ÷ input amplitude” as a point — sweep through them all and the box’s menu appears.',
    s0fLab: 'Probe sine frequency f',
    s0ro: 'f = <span>{f} Hz</span> · measured pass rate |H| = <span>{g}</span> (steady-state amplitude ratio from a time-domain simulation) · <span>{n}</span> frequency points measured so far',
    s0engNote: 'A convention, stated where it belongs: the <strong>output waveform</strong> above is drawn by analytic steady-state superposition (each component scaled by the closed-form |H| and shifted by the closed-form φ), while the <strong>pass-rate readouts</strong> below are measured by an ODE time-domain simulation — two different engines on one screen; step 1 sets them side by side as two cards and audits them against each other.',
    s0hint: 'This box is in fact the hero of the whole page: a first-order <strong>RC low-pass</strong>. Its pass rates across frequencies form the curve called the <strong>frequency response |H(ω)|</strong>; how much it delays each frequency is a second curve, φ(ω). This page measures both curves, teaches you to read them, and then turns them around to design filters.',
    cv0In: 'Input: 0.5 Hz sine + 7 Hz noise',
    cv0Out: 'Output: noise mostly blocked, slow wave survives',
    cv0InTone: 'Probe sine (input)',
    cv0OutTone: 'The box’s answer (output)',
    cvFreq: 'Frequency f (Hz, log axis)',
    cvGain: 'Pass rate |H|',

    s1k: 'Step 1 · What a Frequency Response Is',
    s1t: 'Sine in, sine out: only two things change',
    s1e: 'Open the box: a resistor R and a capacitor C, output taken across the capacitor — the classic first-order <strong>RC low-pass</strong>. Feed it cos(ωt) and, once the transient dies out, the output is <strong>still a sine of the same frequency</strong>, with only two changes: its amplitude is multiplied by |H(ω)|, and its phase is pushed back by φ(ω). The two cards below record the answer at the current frequency side by side: one <strong>computed from the formula</strong> (the analytic card), one <strong>measured off the simulated waveform with an oscilloscope mindset</strong> (the measured card: the page really integrates the circuit equation with RK4, then projects the steady-state waveform to extract amplitude and phase). If the two cards disagree, neither can be trusted. Drag ω through the range; every frequency you visit lights a point on the |H| curve below.',
    s1formula: 'H(jω) = 1 / (1 + jωRC), τ = RC = 1 s, ωc = 1/τ = 1 rad/s',
    s1wLab: 'Input angular frequency ω',
    s1cardA: 'Analytic card · from the formula',
    s1cardB: 'Measured card · from the waveform',
    s1anaSub: '|H| = 1/√(1+(ωτ)²), φ = −atan(ωτ)',
    s1meaSub: 'RK4 integration of the circuit ODE (step = period/240); amplitude & phase projected over 2 steady periods',
    s1ro: 'ω = <span>{w} rad/s</span> · gap between the two routes: |Δ|H|| = <span>{dm}</span>, |Δφ| = <span>{dp}°</span> · <span>{n}</span> frequency points lit so far',
    s1hint: 'Look closely at ω = ωc = 1: |H| is exactly 1/√2 ≈ 0.707 and φ is exactly −45°. This frequency is the <strong>cutoff</strong>, and the next step’s whole Bode plot revolves around it. One definition, stated plainly: “measured” means <strong>steady state</strong> — the brief switch-on transient does not count. The simulation lets the circuit run for 6τ plus several periods before measuring, and the reviewers use the same convention (the method is printed under the measured card).',
    cv1In: 'Input cos(ωt)',
    cv1Out: 'Output (steady, same frequency)',
    cvMag: '|H(ω)|',
    cvLit: 'Points you measured yourself',
    cvCurve: 'Analytic curve',

    s2k: 'Step 2 · The Bode Plot',
    s2t: 'The Bode plot: how engineers read it',
    s2e: 'Put the two curves from step 1 on a <strong>logarithmic frequency axis</strong>, with amplitude in <strong>decibels</strong> (dB = 20·log₁₀|H|), and you get the <strong>Bode plot</strong> engineers stare at all day. Drag R and C and the cutoff ωc = 1/(RC) moves with them: the −3 dB point (where |H| = 1/√2) is marked on the magnitude plot, the high-frequency asymptote hugs the curve at <strong>−20 dB/dec</strong> (every 10× in frequency costs 20 dB), and φ(ωc) = −45° is marked on the phase plot — all three annotations are computed live from the current R and C.',
    s2rLab: 'Resistor R', s2cLab: 'Capacitor C',
    s2ro: 'τ = RC = <span>{tau} s</span> · ωc = <span>{wc} rad/s</span> · at ωc: |H| = <span>0.7071 (−3.01 dB)</span>, φ = <span>−45.0°</span> · high-frequency slope (numerical difference between 10ωc and 100ωc) = <span>{slope} dB/dec</span>',
    s2quizT: 'Reading drill: don’t compute — read',
    s2quizNext: 'Next question',
    s2quizQmag: 'Read the magnitude plot above: at <strong>ω = {w} rad/s</strong>, roughly what is |H| in dB?',
    s2quizQph: 'Read the phase plot above: at <strong>ω = {w} rad/s</strong>, roughly what is φ in degrees?',
    s2quizRight: '<span class="good">Correct.</span> True value {v} (computed live from the formula). {n} answered, {c} correct.',
    s2quizWrong: '<span class="bad">Not quite.</span> The true value is {v} — find the vertical line at ω = {w} on the plot, then read across. {n} answered, {c} correct.',
    s2quizIdle: 'Pick the value you read off the plot. The truth is computed live from the formula — nothing is pre-baked.',
    s2quizRegen: 'A new question has been generated. Read the plots for the current R/C values before answering.',
    s2hint: 'The Bode trick: the curve is flat at 0 dB at low frequency, then past ωc it hugs the −20 dB/dec ramp — so if you know where ωc sits, you can sketch the whole curve freehand to within a dB or two. Two such stages ideally cascaded give a −40 dB/dec ramp (step 6 uses this; “ideal” because a real passive cascade loads its predecessor — stages need a buffer between them).',
    cvDb: 'Magnitude (dB)',
    cvPhase: 'Phase φ (deg)',
    cvCut: '−3 dB point (ωc)',
    cvAsym: 'Asymptote −20 dB/dec',
    cvM45: 'φ = −45°',
    cvQuizPt: 'Quiz point',

    s3k: 'Step 3 · Digital Filters',
    s3t: 'Moving-average zeros: executing one named frequency',
    s3e: "Now discrete time: n is an integer sample index. Here ω is digital angular frequency (rad/sample, often written Ω), not the earlier RC model’s rad/s. Given a sample rate Fₛ, ω=2πf/Fₛ; without Fₛ no physical Hz value is assigned. A moving average averages the latest M samples. At ω=2πk/M, provided k is not divisible by M, those M contributions cancel. At 0 and integer multiples of 2π, |H|=1 instead. Predict the first zero, then compare the preset and actual output samples.",
    s3formula: "|H(ω)| = |sin(Mω/2)| / (M·|sin(ω/2)|); zeros: ω = 2πk/M, integer k not divisible by M; at ω=2πq, |H|=1.",
    s3mLab: 'Averaging length M',
    s3wLab: 'Input digital frequency ω (rad/sample)',
    s3pZero: 'Feed the zero 2π/M',
    s3pSide: 'Feed the first sidelobe peak',
    s3pPass: 'Feed a passband tone, 0.20',
    s3ro: "M = <span>{M}</span> · ω = <span>{w}</span> rad/sample · analytic |H| = <span>{ana}</span> · simulated steady-state amplitude = <span>{mea}</span>{sideSeg} · linear-phase group delay on nonzero bands = <span>{gd}</span> samples (phase/local group delay undefined at zeros)",
    s3sideSeg: ' · first sidelobe peak |H| = <span>{side}</span> ({sidedb} dB)',
    s3sideNoneSeg: ' · first sidelobe peak: <span>none</span> (at M = 2 the zero already sits at π — no sidelobe inside [0, π])',
    s3hint: "Range: 0.05 to π rad/sample. Slider arrows step 0.005; Shift+arrow steps 0.05; Home selects 0.05 and End exact π. Presets keep exact frequencies rather than rounding to displayed decimals. With M=2 the first zero isπ; then change M to 3, predict amplitude 1/3 and compare analytic and measured values. A zero output cannot measure phase or delay. Sidelobes are not zeros: a moving average smooths but is no ideal stopband filter. <a class=\"fourier-link\" href=\"https://www.analog.com/media/en/technical-documentation/dsp-book/dsp_book_ch15.pdf\">Basis: Smith · moving-average response →</a>",
    cv3In: 'Input x[n] = cos(ωn)',
    cv3Out: 'Output y[n] (steady segment)',
    cv3Zero: 'Zeros 2πk/M',
    cv3Cur: 'Current ω',
    cvMagW: '|H(ω)| (ω: 0 → π)',

    s4k: 'Step 4 · Phase',
    s4t: 'Phase is character too: lateness wrecks waveforms',
    s4e: 'The first three steps stared at |H|. Now the other half of the character: <strong>phase</strong>. Two boxes compete: a <strong>pure delay</strong> (|H| identically 1 — it cuts no frequency at all — with phase −ωτ<sub>d</sub> growing linearly with frequency) and the <strong>RC low-pass</strong> (|H| cuts the highs, and its phase −atan(ωτ) is bent). Feed both the same pulse train: the delay’s output is merely late, its <strong>shape identical</strong>; the RC output has rounded edges and a tail — because its frequency components are delayed by different amounts, the formation they marched in with falls apart. Below are the two phase curves and the RC’s <strong>group delay</strong> τ<sub>g</sub>(ω) = −dφ/dω, computed by numerically differentiating the phase formula: it varies with frequency, and that variation is exactly why the formation breaks up.',
    s4sigLab: 'Test signal',
    s4sigPulse: 'Pulse train', s4sigSquare: 'Square wave',
    s4tauLab: 'Delay τd / RC τ (one shared slider)',
    s4ro: 'τ = <span>{tau} s</span> · pure delay: |H| ≡ <span>1 (0 dB)</span>, φ(ω) = −ωτ, group delay constantly τ · RC: group delay falls from <span>{gd0} s</span> at ω=0 to <span>{gd2} s</span> at ω=2 — unequal lateness, so the waveform must deform',
    s4hint: 'Judging by |H| alone breeds two illusions: that a delay “changes nothing” (it changes time itself), and that the RC “only turns the volume down” (it scrambles the waveform). In audio, phase distortion muffles the sound; in images, the equivalent effect blurs edges. <strong>Magnitude decides whether each frequency is still present; phase decides whether they still recognize each other when they come back.</strong> One more convention: the RC waveform above is the 0–8 s steady segment obtained by <strong>pre-integrating the circuit from rest for 8 s</strong>, after the transient has essentially died out — not the full switch-on transient from zero. The comparison is about steady-state shape-keeping versus deformation, so the switch-on moment is deliberately excluded.',
    cv4In: 'Input',
    cv4Delay: 'Delay output (shape kept)',
    cv4RC: 'RC output (edges rounded)',
    cv4PhD: 'Delay φ = −ωτd (straight line)',
    cv4PhRC: 'RC φ = −atan(ωτ) (bent)',
    cv4Gd: 'RC group delay τg(ω) (right axis, s)',
    cvPhase4: 'Phase φ (deg)',

    s5k: 'Step 5 · Different Wiring',
    s5t: 'High-pass, band-pass, resonance: one mathematics, three appetites',
    s5e: 'Same R and C — just take the output across the <strong>resistor</strong> instead, and the low-pass becomes a <strong>high-pass</strong> on the spot: |H(jω)| = ωτ/√(1+(ωτ)²). Low frequencies are blocked, highs pass, and the −3 dB point sits at the same ωc = 1/τ. Drag τ and watch the cutoff run; compare with step 2’s low-pass Bode plot — the two are mirror images.',
    s5tauLab: 'RC high-pass τ (ωc = 1/τ)',
    s5hpro: 'τ = <span>{tau} s</span> · ωc = <span>{wc} rad/s</span> · at ωc, |H| = <span>0.7071</span> and φ = <span>+45.0°</span> (the high-pass leads where the low-pass lags — same magnitude, opposite sign) · at ω = 0.1ωc, |H| = <span>{lo}</span> (lows cut to about a tenth)',
    s5e2: 'One more step: put a low-pass and a high-pass back to back so only a <strong>middle band</strong> of frequencies passes — a <strong>band-pass</strong>. The standard second-order band-pass H(jω) = 1 / (1 + jQ(ω/ω₀ − ω₀/ω)) peaks at ω₀ with height 1, and the <strong>quality factor Q</strong> sets how fat the peak is — larger Q, sharper peak. One readout below is a live audit: the half-power bandwidth Δω measured off the curve (the distance between the two points where |H| falls to 1/√2 of the peak) must satisfy <strong>Q = ω₀/Δω</strong> — whether the measured number matches the slider is for the digits to say. This is a normalized band-pass output. A spring’s displacement/force response has a different numerator, so its peak location and height cannot be copied from this curve. <a class="fourier-link" href="../atlas/?trail=response&amp;node=resonance#response-lab">Compare damping, displacement peaks and poles in the atlas →</a>',
    s5f0Lab: 'Band-pass peak f₀',
    s5qLab: 'Quality factor Q',
    s5bpro: 'f₀ = <span>{f0} Hz</span> · Q set = <span>{q}</span> · measured half-power points f₁ = <span>{f1} Hz</span>, f₂ = <span>{f2} Hz</span>, Δf = <span>{bw} Hz</span> · Q recovered from the measurement, f₀/Δf = <span>{qchk}</span> (audited against the setting)',
    s5hint: 'Tuning a radio is band-pass work: the peak aims at the station, and Q decides whether the neighboring station bleeds in. Too small a Q and two stations mush together; too large and the peak is so sharp it shaves the station’s own high frequencies. Even pickiness has to be portioned right.',
    cv5hp: 'RC high-pass |H(ω)|',
    cv5bp: 'Second-order band-pass |H(f)|',
    cv5bpPh: 'Band-pass phase φ(f)',
    cv5cut: '−3 dB point ωc',
    cv5half: 'Half-power points (peak/√2)',
    cv5peak: 'Peak f₀',

    s6k: 'Step 6 · Finale',
    s6t: 'Design bench: build a filter to spec',
    s6e: 'The last step is an exam. The job: in one signal, <strong>50 Hz is the wanted signal and 500 Hz is interference</strong>. The toolbox holds three tools; the parameters are yours; press “Verify” and the page computes the attenuation at both frequencies from the chosen filter’s |H| formula, <strong>live</strong> — how much margin, how many dB short, reported on the spot, no pre-baked verdicts. One spoiler: a first-order RC cannot pass at any setting (its rolloff is too gentle) — a direct consequence of step 2’s −20 dB/dec. The second-order cascade and the moving average each have a way through — and the moving average’s way hides in its zeros: at Fs = 4000 Hz the zeros sit at k·(4000/M) Hz. What M puts 500 Hz exactly on a zero?',
    s6spec1: 'Keep the <b>50 Hz</b> signal: attenuation <b>≤ 1 dB</b>',
    s6spec2: 'Kill the <b>500 Hz</b> interference: attenuation <b>≥ 20 dB</b>',
    s6toolRc1: 'First-order RC low-pass',
    s6toolRc2: 'Second-order RC cascade (ideal)',
    s6toolMa: 'Moving average (Fs = 4000 Hz)',
    s6fcLab: 'Cutoff frequency fc',
    s6mLab: 'Averaging length M',
    s6judge: 'Verify →',
    s6ro: 'Current: <b>{tool}</b>{param} · attenuation at 50 Hz = <span>{a50}</span> (needs ≤ 1 dB) · at 500 Hz = <span>{a500}</span> (needs ≥ 20 dB)',
    s6roParamFc: ', fc = {fc} Hz',
    s6roParamM: ', M = {M} (zeros at k·{z} Hz)',
    s6pass: '<span class="verdict pass">PASS</span> Both specs met: 50 Hz attenuation {a50} ≤ 1 dB, 500 Hz attenuation {a500} ≥ 20 dB. Computed live from the formula — it passes because the numbers say so.',
    s6fail: '<span class="verdict fail">REJECTED</span> {why}. Adjust and re-verify — the shortfall is computed from the formula; it cannot be talked away.',
    s6failKeep: 'the keep-50 spec is short by {gap} dB (attenuation {a50} exceeds the 1 dB cap)',
    s6failKill: 'the kill-500 spec is short by {gap} dB (attenuation {a500} is below 20 dB)',
    s6failBoth: 'both specs fail: keep-50 short by {g1} dB, kill-500 short by {g2} dB',
    s6idle: 'Not verified yet. Set the parameters and press “Verify” — the verdict is computed live from the |H| formula.',
    s6huge: '>120 dB (numerical zero)',
    s6note: 'Two conventions, stated plainly. First, the second-order option is an <strong>ideal cascade</strong>: the two RC stages are assumed isolated by a buffer amplifier, so |H| is the square of the first-order one; a real passive cascade suffers loading — the second stage drags on the first and the curve changes shape (in hardware you either add the buffer or re-derive the network as a whole). Second, the moving average’s attenuation is computed from the Dirichlet formula with the digital frequency ω = 2πf/Fs at Fs = 4000 Hz; when 500 Hz lands exactly on a zero the attenuation is a numerical zero, displayed capped as “>120 dB”.',
    s6card1T: 'The equalizer',
    s6card1: 'The bass / mid / treble knobs on a stereo are a row of band-passes (step 5) with staggered peak frequencies wired in parallel: each governs one slice of the spectrum — a whole equalizer is a frequency-response curve cut into strips.',
    s6card2T: 'Image blur',
    s6card2: 'In a photo, high frequencies are edges and detail, low frequencies are broad color fields. A two-dimensional low-pass over the image (average each pixel with its neighbors) is the naive form of Gaussian blur — the same act as step 3’s moving average, with a sheet of pixels instead of a row of samples.',
    s6card3T: 'Radio tuning',
    s6card3: 'The air carries hundreds of stations and channels at once; a receiver uses a band-pass to pick out the target frequency and block the rest — step 5’s Q decides how clean the pick is. This bench’s “keep 50, kill 500” is what every receiver does every day.',
    s6fin: 'To wrap up: from medical report to blueprint it is <strong>one and the same curve</strong> — in step 1 you measured it one frequency at a time, in step 2 you learned the engineer’s way of reading it, steps 3 and 4 showed you the tempers of zeros and of phase, step 5 re-wired the same parts into high-pass and band-pass, and here you have used a spec to <strong>build</strong> with it. Anyone who can read a frequency response greets every black box with the same first sentence: <strong>show me the pass rate and the lateness at every frequency.</strong>',
    s6lkL: 'Laplace: reading resonance from poles →', s6lkZ: 'Z-transform: response on the unit circle →', s6lkLti: 'Impulse & LTI: the h fingerprint →',
    cv6keep: 'Keep: 50 Hz',
    cv6kill: 'Kill: 500 Hz',
    cv6Db: '|H(f)| (dB)',
    cv6Spec1: '−1 dB line',
    cv6Spec2: '−20 dB line'
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
