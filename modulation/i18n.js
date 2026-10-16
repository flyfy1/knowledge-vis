'use strict';
/* ============================================================
   调制与频移讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '调制与频移 · 把信号搬上高频运走 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '调制与频移 · 把信号搬上高频运走',
    tagline: '声音本身跑不远，还都挤在同一段低频里。调制做的事，是把消息的频谱整包搬到一条高频载波旁边运走，到站再原样搬回来——时域里乘一个余弦，频域里就是一次搬家。AM 搬的是幅度的形状，FM 搬的是频率的摆动；从矿石收音机到 WiFi，搬运工从未换人。本页每张频谱都由真采样 FFT 当场算出，每次解调都逐点真算。',
    nav0: '0 搬家', nav1: '1 AM', nav2: '2 接收对准', nav3: '3 包络检波',
    nav4: '4 FM 与抗噪', nav5: '5 频分复用', nav6: '6 终章 · I/Q',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 调制与频移 Modulation & Frequency Shifting —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '声音住在低频，却要搬去高频住',
    s0e: '下面这条「嗓音」由 3、5、7 Hz 三条正弦叠成——它的频谱全部挤在 <strong>0 附近</strong>。这样的信号有两个麻烦：一是跑不远（能高效辐射它的天线，尺寸要和波长可比，低频意味着大得离谱的天线）；二是所有人的嗓音都挤在同一段，谁也听不清谁。解法是<strong>搬家</strong>：把整段频谱平移到一条高频<strong>载波</strong>旁边运走。拖动载波频率，看频谱整包搬走——搬运工具只有一个：<strong>乘法</strong>。',
    s0fcLab: '载波频率 fc',
    s0ro: '消息最高分量 B = <span>7 Hz</span>（实测谱线在 3 / 5 / 7 Hz）· 搬家后最强谱线实测在 <span>{peak} Hz</span>，谱线群落在 <span>{lo} – {hi} Hz</span>（= fc ± 7）',
    s0hint: '收音机上的调谐旋钮，做的就是这件事的逆操作的一半：<strong>选一条街（载波），把住在那条街的人接回来</strong>。注意频谱是左右各一份的——乘实数余弦会把谱复制到 +fc 与 −fc 两侧（图上只画正频率一侧），这是第 1 步要细看的原子操作。',
    cv0Msg: '基带消息 m(t)：3 + 5 + 7 Hz',
    cv0Mod: '已调信号 m(t)·cos(2πfc t)',
    cv0SpecBase: '消息的频谱（搬家前）',
    cv0SpecMove: '已调信号的频谱（FFT 实测）',
    cvFreq: '频率 f（Hz）',
    cvAmp: '幅值',

    s1k: '第 1 步 · AM',
    s1t: '一乘，频谱就搬家了',
    s1e: '先看最经典的搬法——<strong>调幅（AM）</strong>：s(t) = (1 + m·消息) × cos(2πfc t)。载波的<strong>幅度</strong>被消息捏出形状，m 是<strong>调制指数</strong>（捏多深）。消息是单条 10 Hz 正弦时，频谱里不多不少三根线：载波本身一根（幅值 1），两侧各一根<strong>边带</strong>（幅值恰为 m/2)——因为 cos A·cos B 会裂成两个频率。下面这张频谱是页面拿真采样做的 FFT，读数里的每个数都是从谱线高度上量下来的。把 m 推过 1，时域里先露馅：包络开始穿过零点，为第 3 步的失真埋下伏笔。',
    s1msgSingle: '消息：单音 10 Hz',
    s1msgDual: '消息：双音 10 + 25 Hz',
    s1mLab: '调制指数 m',
    s1f: 's(t) = (1 + m·m(t))·cos(2πfc t)，fc = 200 Hz',
    s1roSingle: '实测（FFT）：载波 <span>{car}</span> · 下边带 <span>{lo}</span> · 上边带 <span>{hi}</span> · 边带/载波 = <span>{ratio}</span>（解析 m/2 = <span>{half}</span>）{spanTxt}',
    s1roDual: '实测（FFT）：载波 <span>{car}</span> · 10 Hz 的边带对 <span>{sb1}</span>（解析 m·a₁/2 = <span>{a1}</span>）· 25 Hz 的边带对 <span>{sb2}</span>（解析 m·a₂/2 = <span>{a2}</span>）{spanTxt}',
    s1roZero: 'm = 0：只剩载波，没有任何消息被运走——谱线横跨 0 Hz。把 m 往上推，边带才会长出来。',
    s1roSpanOk: '已调谱线横跨 <span>{span} Hz</span> = 2B（B = {B} Hz）',
    s1roSpanMiss: '边带太矮、未过横跨量测阈值 0.002，谱线横跨未检出（理论 2B = {full} Hz）',
    s1roSpanPart: '外侧边带未过横跨量测阈值，横跨只测到 <span>{span} Hz</span>（理论 2B = {full} Hz）',
    s1hint: '换成双音消息，每条消息谱线都会在 fc 两侧各复制一份：整个谱包被<strong>整体平移 + 镜像复制</strong>。所以已调信号占的带宽永远是消息最高频率 B 的<strong>两倍</strong>（读数里的「横跨」就是从 FFT 谱线实测的跨度）。只运消息、不带载波的那一份叫 DSB（双边带），第 2 步解调用的就是它。',
    cv1Msg: '消息（归一化）',
    cv1Car: '载波 cos(2πfc t)',
    cv1Prod: '已调信号 (1 + m·消息)·载波',
    cv1Spec: '已调信号频谱（FFT 实测，Hann 窗）',
    cv1Carrier: '载波',
    cv1Side: '边带',

    s2k: '第 2 步 · 接收',
    s2t: '搬回来要对准：频率与相位都得对账',
    s2e: '接收端的搬法是同一件事的逆：把收到的 DSB 信号<strong>再乘一次本振载波</strong>，乘积里有一份被搬回基带的消息、还有一份被搬到 2fc 高处，用低通把高处那份滤掉，消息就回来了（这叫<strong>相干解调</strong>）。但它有两个对账项：本振的<strong>频率</strong>偏了 Δf，搬回来的消息会被再乘上一个 cos(2πΔf·t)——听感是周期性的忽有忽无（<strong>拍频</strong>）；本振的<strong>相位</strong>差了 φ，消息被整体乘上 <strong>cos φ</strong>——φ = 90° 时，输出<strong>恰好归零</strong>。两个滑杆都拖一遍，看读数怎么说。',
    s2dfLab: '本振失谐 Δf',
    s2phiLab: '本振相位差 φ',
    s2f: 'DSB：s(t) = m(t)·cos(2πfc t) → × 2cos(2π(fc+Δf)t + φ) → 低通取回 m(t)·cos(2πΔf t + φ)',
    s2ro: '相位标度实测 = <span>{scale}</span>（解析 cos φ = <span>{cosphi}</span>，Δf = 0 时对账）· 输出谱线实测：<span>{lines}</span>（拍频形态与 Δf 对应）',
    s2roTwin: '（主路输出已是浮点尘，谱线位置改由 φ = 0、同 Δf 的孪生路量取——位置只由 Δf 决定，与 φ 无关）',
    cv2Dust: '谱幅 ≈ {amp}（浮点尘量级，不是真信号）· 纵轴下限按原消息谱峰的 1/4 定标，不放大',
    s2linesPair: '{f1} Hz 与 {f2} Hz 两根线（= fm ± Δf）',
    s2linesSingle: '单根线在 {f} Hz（Δf = 0，无拍）',
    s2hint: '真实接收机里专门有个电路（锁相环，PLL）死盯着这两笔账：把本振的频率和相位锁到与来波一致。账对不齐，信号不是变小就是周期性消失——不是「有点吵」，是数学上必然。低通口径：本页用理想低通（FFT 频域掩模，截止 60 Hz），第 5 步带通同理。',
    cv2Out: '解调输出',
    cv2Ref: '原消息（对照）',
    cv2Spec: '解调输出的频谱（FFT 实测）',

    s3k: '第 3 步 · 包络检波',
    s3t: '穷人的解调：二极管 + RC，和它赌输的地方',
    s3e: '老式收音机不用本振，用得起的只有一颗二极管和一个 RC：二极管只让信号的正半周给电容<strong>瞬间充电到峰值</strong>，两次峰值之间电容经 R 慢慢<strong>放电</strong>——电容电压画出的就是载波的<strong>包络</strong>，也就是 1 + m·消息。下面就是这台检波器的逐点仿真（充电瞬时、放电按 e<sup>−t/τ</sup>)。它成立有个赌注：<strong>m ≤ 1</strong>。m 一旦过 1，包络穿过零点、载波相位翻转，检波器跟的是包络的绝对值，消息在谷底被<strong>折叠</strong>——失真读数当场跳给你看。τ 也别乱拧：太小，纹波压不住；太大，放电跟不上包络的下降沿（<strong>对角切割</strong>）。<a class="fourier-link" href="../freqresp/#step2">这个 RC 就是一台低通滤波器：它的波特图读法 →</a>',
    s3mLab: '调制指数 m',
    s3tauLab: 'RC 时间常数 τ',
    s3cardEnv: '包络检波 · 解出的消息',
    s3cardCoh: '相干解调 · 同条件（对照）',
    s3cardEnvSub: '二极管峰值 + RC 放电，逐点真仿真；失真 = 检波输出对消息做最小二乘拟合后的残差',
    s3cardCohSub: '乘本振 + 理想低通（φ = 0、Δf = 0)，同一条 AM 信号',
    s3ro: 'τ 的甜点在中间：τ = {tau} ms 时失真 <span>{snr}</span>。把 m 推过 1.0，或把 τ 拧到两端，再看这张牌。',
    s3snr: '失真（拟合 SNR）<b>{v}</b>',
    s3hint: '注意相干解调那张牌的数字大得不像话——那不是四舍五入，是这条链路在数学上<strong>无损</strong>（浮点尘级别）。包络检波便宜，但它的账本里有纹波、有折叠、有对角切割。贵与便宜的差别，全在读数里。',
    cv3Sig: 'AM 信号与检波输出',
    cv3Env: '检波输出',
    cv3True: '真包络 1 + m·消息',

    s4k: '第 4 步 · FM',
    s4t: 'FM：改搬频率的摆动，再比一比抗噪',
    s4e: 'FM 换了个搬法：载波的幅度纹丝不动，让<strong>瞬时频率</strong>跟着消息摆——f(t) = fc + kf·m(t)，摆幅 Δf = β·fm（β 是调制指数，fm = 10 Hz 是本步的消息）。β 越大，频谱被撑得越宽：下面那张谱仍是 FFT 真算，带宽读数按<strong>占用带宽</strong>口径实测（无窗功率谱上累积功率 1% 到 99% 的跨度），旁边并排的是经验公式 <strong>Carson 规则</strong> 2(Δf + fm)——它是估算，不是实测，两个数接近但不必相等。',
    s4betaLab: '调制指数 β（Δf = β × 10 Hz）',
    s4f: 'f(t) = fc + Δf·m(t)，s(t) = cos(2π∫f dt)，Δf = β·fm，fm = 10 Hz，fc = 200 Hz',
    s4ro: 'Δf = <span>{df} Hz</span> · 实测占用带宽 = <span>{bw} Hz</span>（1%–99% 累积功率）· Carson 规则 = <span>{carson} Hz</span>（经验式）· 载波线只剩 <span>{car}</span>（β 越大，功率越往边带分）',
    s4hint: '看载波线的读数：β 增大时它一路缩水——FM 把功率从载波里搬去了边带。这也是 FM 频谱是一把「梳子」的原因：谱线以 fm 为间隔排开，高度由贝塞尔函数定，本页不展开公式，谱是实测的。',
    cv4Finst: '瞬时频率 f(t)（Hz）',
    cv4Wave: 'FM 波形（节选）',
    cv4Spec: 'FM 频谱（FFT 实测）',
    cv4Obw: '实测占用带宽',
    cv4Carson: 'Carson 带宽',
    s4aT: '抗噪擂台：同一条噪声，泼向 AM 与 FM',
    s4aE: '给 AM 和 FM 各泼<strong>同一条</strong>噪声（同一种子 mulberry32 + Box–Muller 高斯、同噪声功率 σ = 0.2）再各自解调：AM 用第 3 步的包络检波（m = 0.8、τ = 15 ms)，FM 先<strong>限幅</strong>（只取解析信号的相位、丢掉幅度信息）再做相位差分解调（β = 2.5)。输出质量用同一个口径量：解调输出对原消息做最小二乘拟合，残差换算成 SNR。数字全部由样本现算——换颗种子，数字会动，结论应该站得住。',
    s4seedBtn: '换一颗噪声种子',
    s4aRo: '种子 <span>{seed}</span> · 噪声功率实测 <span>{np}</span> · 输入 SNR:AM <span>{inAm}</span> / FM <span>{inFm}</span>（各自信号功率不同）· 解调后 SNR:AM 包络 <span>{outAm}</span> · FM <span class="good">{outFm}</span> · FM 领先 <span>{margin}</span>',
    s4aHint: 'FM 的领先不是免费的：它在第 4 步上半场刚花掉了几倍带宽。<strong>拿带宽换干净</strong>，就是 FM 占着整个调频波段的经济学。注意公平性口径：两路泼的是同一条噪声、同一个噪声功率；输入 SNR 因 AM 与 FM 自身功率不同而略有差别，读数里如实分开列了。',
    cv4MsgRef: '原消息',
    cv4AmOut: 'AM 解调（包络）',
    cv4FmOut: 'FM 解调（限幅+鉴频）',

    s5k: '第 5 步 · 频分复用',
    s5t: '一条街住三家：选台与串扰',
    s5e: '把第 0 步的搬家同时做三遍，就是<strong>频分复用（FDM）</strong>：三家「电台」各自把消息搬到不同载波旁，在同一条信道里并排停放。接收端先用<strong>带通</strong>（FFT 掩模，半宽 25 Hz）圈住目标那家，再相干解调搬回来。下面可以选台、拧偏接收频率、还可以把三家的<strong>间距拉近</strong>——邻台的谱包一旦蹭进你的带通，解调输出里就会混进别人家的消息，串扰读数当场爬升。串扰的口径是：把解调输出对<strong>本台消息</strong>做最小二乘拟合，对得上的部分算本台，对不上的<strong>残差功率</strong>除以本台功率，就是串扰。（本步链路没有噪声、也没有非线性，残差全部来自邻台泄漏——所以「恢复 SNR」与「串扰」恰好大小相等、符号相反，是同一笔账的两种读法。）',
    s5tgtLab: '目标台',
    s5tuneLab: '接收调谐 fc（接收机实际对准的频率）',
    s5spaceLab: '台间距系数（1 = 标准间距 60 Hz）',
    s5ro: '目标台 {name}（载波 <span>{fc}</span> Hz）· 解调恢复 SNR = <span>{snr}</span> · 串扰（邻台功率 / 本台功率）= <span>{xt}</span> · 带通圈住的谱里，本台占 <span>{share}</span>',
    s5hint: '波段管理管的就是这笔账：台距多宽、每家占多少带宽、接收带通多陡——三者决定串扰。把间距系数拉到 0.55，或者把调谐拧偏 15 Hz，看恢复 SNR 和串扰怎么变。',
    cv5Spec: '信道频谱（三台并存，FFT 实测）与接收带通',
    cv5Out: '解调输出',
    cv5Ref: '目标台消息（对照）',
    staA: '甲台', staB: '乙台', staC: '丙台',

    s6k: '第 6 步 · 终章',
    s6t: 'I/Q：同一条街的上下层',
    s6e: '最后一步把搬家做到极致：<strong>同一个载波频率</strong>，能不能同时运两路消息？能——用两条<strong>正交</strong>的载波：cos 驮 I 路、sin 驮 Q 路，合成一路发送（s = I·cos − Q·sin)。接收端分别乘 cos 与乘 sin 再低通：cos 只「看见」I、sin 只「看见」Q，因为在整数个周期上 cos 与 sin 的乘积积分为零——<strong>正交</strong>。串扰读数会告诉你这个「只看见」有多干净。把正交关掉（两路都用 cos 发）再看：两路当场串成一团，谁也分不开谁。',
    s6orthBtn: '正交发送（cos 驮 I、sin 驮 Q）',
    s6brokenBtn: '关掉正交（两路都用 cos）',
    s6f: 's(t) = I(t)·cos(2πfc t) − Q(t)·sin(2πfc t)，I = cos(2π·6t)，Q = cos(2π·15t)，fc = 200 Hz',
    s6ro: 'I 路：恢复标度 <span>{ai}</span> · 串扰（Q 漏进 I 的功率比）<span>{xi}</span> · Q 路：恢复标度 <span>{aq}</span> · 串扰（I 漏进 Q 的功率比）<span>{xq}</span>',
    s6hint: '这就是现代通信的字母表：接收机把信号投影到 I、Q 两条轴上，得到平面上的一个点；发送不同的数据就是发不同的点——点阵排布就是 <strong>QAM 星座图</strong>。手机、WiFi、5G 的调制，全是这套混频与投影的后代。',
    cv6Tx: '发送合成信号',
    cv6I: 'I 路：取回 vs 原样',
    cv6Q: 'Q 路：取回 vs 原样',
    s6card1T: '从矿石收音机到 5G',
    s6card1: '1920 年代的矿石收音机用的就是第 3 步的包络检波；调频广播用第 4 步的 FM 换音质；手机与 WiFi 用第 6 步的 I/Q 一次运两路——一百年里换的是器件，没换的是乘法。',
    s6card2T: '锁相环无处不在',
    s6card2: '第 2 步的对账在真实接收机里由锁相环（PLL）逐刻盯着：本振频率与相位一旦漂移，账就对不上。PLL 同样藏在 CPU 的时钟倍频、硬盘的读通道里。',
    s6card3T: '波段是公共资源',
    s6card3: '第 5 步的停车位之争，就是各国无线电管理机构在做的事：划分频段、规定带宽与发射掩模，让互不相识的系统能在同一片天空里并行。',
    s6fin: '收个尾：<strong>调制就是把频谱搬家</strong>——乘一个余弦，谱复制两份、平移到 ±fc；解调是把同一件事再做一遍并滤掉高处那份。AM 把消息写在幅度上、便宜但怕吵；FM 把消息写在频率的摆动里、拿带宽换干净；FDM 让许多人分街而居；I/Q 则在同一条街上用正交分出上下层。你以后听到的每个通信名词——载波、边带、带宽、串扰——都在这一页里有本人的真容与真账。',
    s6lkF: '傅里叶变换：信号由哪些频率组成 →', s6lkS: '采样与混叠：搬家时的翻车现场 →', s6lkR: '频率响应与滤波：低通与带通本人 →'
  },
  en: {
    docTitle: 'Modulation & Frequency Shifting · Moving Signals Up in Frequency · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Modulation & Frequency Shifting',
    tagline: 'A voice on its own does not travel far, and every voice crowds into the same low-frequency corner. Modulation packs a message’s whole spectrum up next to a high-frequency carrier for the trip, then unpacks it on arrival — multiply by a cosine in time, and the spectrum moves house. AM writes the message into amplitude, FM into the swing of frequency; from crystal radios to WiFi, the mover has never changed. Every spectrum on this page is computed live by FFT from real samples, and every demodulation is computed sample by sample.',
    nav0: '0 Moving House', nav1: '1 AM', nav2: '2 Tuning In', nav3: '3 Envelope Detector',
    nav4: '4 FM & Noise', nav5: '5 FDM', nav6: '6 Finale · I/Q',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Modulation & Frequency Shifting —— one interaction per step',

    s0k: 'Step 0 · The Hook',
    s0t: 'Voices live down low — but they have to move up high',
    s0e: 'The “voice” below is three sines at 3, 5 and 7 Hz stacked together — its entire spectrum huddles <strong>near 0</strong>. Such a signal has two problems. It does not travel far: an antenna radiates efficiently only when its size is comparable to the wavelength, and low frequencies mean absurdly large antennas. And every voice crowds into the same band, so nobody can be heard. The fix is to <strong>move house</strong>: shift the whole spectrum up next to a high-frequency <strong>carrier</strong>. Drag the carrier frequency and watch the spectrum pack up and move — the only moving tool is <strong>multiplication</strong>.',
    s0fcLab: 'Carrier frequency fc',
    s0ro: 'Highest message component B = <span>7 Hz</span> (measured lines at 3 / 5 / 7 Hz) · after the move, the strongest line measures <span>{peak} Hz</span>, and the line group spans <span>{lo} – {hi} Hz</span> (= fc ± 7)',
    s0hint: 'The tuning knob on a radio does half of the inverse operation: <strong>pick a street (the carrier), pick up whoever lives there</strong>. Notice the spectrum comes in two copies — multiplying by a real cosine duplicates the spectrum to both +fc and −fc (the plot shows only positive frequencies). That atomic operation is what Step 1 examines.',
    cv0Msg: 'Baseband message m(t): 3 + 5 + 7 Hz',
    cv0Mod: 'Modulated m(t)·cos(2πfc t)',
    cv0SpecBase: 'Message spectrum (before)',
    cv0SpecMove: 'Modulated spectrum (FFT, measured)',
    cvFreq: 'Frequency f (Hz)',
    cvAmp: 'Amplitude',

    s1k: 'Step 1 · AM',
    s1t: 'One multiplication, and the spectrum moves',
    s1e: 'Start with the classic move — <strong>amplitude modulation</strong>: s(t) = (1 + m·message) × cos(2πfc t). The carrier’s <strong>amplitude</strong> is sculpted by the message; m is the <strong>modulation index</strong> (how deep the sculpting goes). With a single 10 Hz sine as the message, the spectrum holds exactly three lines: the carrier itself (amplitude 1) and one <strong>sideband</strong> on each side, each exactly m/2 tall — because cos A·cos B splits into two frequencies. The spectrum below is an FFT of real samples computed by this page, and every number in the readout is measured off the line heights. Push m past 1 and the time domain gives the game away first: the envelope starts crossing zero, planting the distortion that Step 3 will harvest.',
    s1msgSingle: 'Message: single 10 Hz tone',
    s1msgDual: 'Message: two tones, 10 + 25 Hz',
    s1mLab: 'Modulation index m',
    s1f: 's(t) = (1 + m·m(t))·cos(2πfc t), fc = 200 Hz',
    s1roSingle: 'Measured (FFT): carrier <span>{car}</span> · lower sideband <span>{lo}</span> · upper sideband <span>{hi}</span> · sideband/carrier = <span>{ratio}</span> (theory m/2 = <span>{half}</span>) {spanTxt}',
    s1roDual: 'Measured (FFT): carrier <span>{car}</span> · sideband pair of the 10 Hz tone <span>{sb1}</span> (theory m·a₁/2 = <span>{a1}</span>) · pair of the 25 Hz tone <span>{sb2}</span> (theory m·a₂/2 = <span>{a2}</span>) {spanTxt}',
    s1roZero: 'm = 0: only the carrier remains — nothing is being carried. Push m up and the sidebands grow out.',
    s1roSpanOk: 'modulated lines span <span>{span} Hz</span> = 2B (B = {B} Hz)',
    s1roSpanMiss: 'the sidebands are too small to pass the span threshold 0.002 — no span detected (theory 2B = {full} Hz)',
    s1roSpanPart: 'the outer sidebands fall below the span threshold — only <span>{span} Hz</span> measured (theory 2B = {full} Hz)',
    s1hint: 'Switch to the two-tone message and every message line is copied to both sides of fc: the whole spectral packet is <strong>shifted and mirrored</strong>. So a modulated signal always occupies <strong>twice</strong> the message’s highest frequency B (the “span” in the readout is measured from the FFT lines). The variant that carries only the message, with no carrier line, is DSB (double sideband) — Step 2 demodulates exactly that.',
    cv1Msg: 'Message (normalised)',
    cv1Car: 'Carrier cos(2πfc t)',
    cv1Prod: 'Modulated (1 + m·message)·carrier',
    cv1Spec: 'Modulated spectrum (FFT, Hann window)',
    cv1Carrier: 'carrier',
    cv1Side: 'sideband',

    s2k: 'Step 2 · Reception',
    s2t: 'Moving back takes aim: frequency and phase must both check out',
    s2e: 'The receiver runs the same move in reverse: multiply the incoming DSB signal <strong>by a local carrier once more</strong>. The product contains one copy of the message shifted back to baseband and one copy pushed up to 2fc; a low-pass filter removes the high copy and the message is back (this is <strong>coherent demodulation</strong>). But two accounts must balance. If the local oscillator’s <strong>frequency</strong> is off by Δf, the recovered message comes multiplied by cos(2πΔf·t) — it periodically fades in and out (a <strong>beat</strong>). If its <strong>phase</strong> is off by φ, the message is scaled by <strong>cos φ</strong> overall — and at φ = 90° the output is <strong>exactly zero</strong>. Drag both sliders and read the ledger.',
    s2dfLab: 'LO detuning Δf',
    s2phiLab: 'LO phase offset φ',
    s2f: 'DSB: s(t) = m(t)·cos(2πfc t) → × 2cos(2π(fc+Δf)t + φ) → low-pass recovers m(t)·cos(2πΔf t + φ)',
    s2ro: 'Measured phase scale = <span>{scale}</span> (theory cos φ = <span>{cosphi}</span>, reconciled at Δf = 0) · measured output lines: <span>{lines}</span> (the beat pattern matches Δf)',
    s2roTwin: '(the main output is floating-point dust, so the line positions are measured on the φ = 0 twin path at the same Δf — position depends on Δf only, never on φ)',
    cv2Dust: 'spectrum ≈ {amp} (floating-point dust, not a real signal) · axis floored at 1/4 of the original message peak — not magnified',
    s2linesPair: 'two lines at {f1} Hz and {f2} Hz (= fm ± Δf)',
    s2linesSingle: 'a single line at {f} Hz (Δf = 0, no beat)',
    s2hint: 'Real receivers assign a dedicated circuit — the phase-locked loop (PLL) — to watch these two accounts continuously, locking the local oscillator’s frequency and phase to the incoming wave. When the accounts don’t balance, the signal doesn’t get “a bit noisy”: it shrinks or vanishes periodically, by mathematical necessity. Filter note: this page uses an ideal low-pass (FFT-domain mask, 60 Hz cutoff); Step 5’s band-pass works the same way.',
    cv2Out: 'Demodulated output',
    cv2Ref: 'Original message (reference)',
    cv2Spec: 'Output spectrum (FFT, measured)',

    s3k: 'Step 3 · Envelope Detection',
    s3t: 'The poor receiver: a diode, an RC — and where its bet fails',
    s3e: 'Old radios had no local oscillator. All they could afford was a diode and an RC: the diode lets the signal’s positive peaks <strong>charge a capacitor instantly to the peak</strong>, and between peaks the capacitor <strong>discharges</strong> slowly through R — so the capacitor voltage traces the carrier’s <strong>envelope</strong>, which is 1 + m·message. Below is a sample-by-sample simulation of exactly that circuit (instant charge, discharge as e<sup>−t/τ</sup>). It rests on a bet: <strong>m ≤ 1</strong>. Once m passes 1, the envelope crosses zero, the carrier phase flips, and the detector ends up following the envelope’s absolute value — the message gets <strong>folded</strong> at its troughs, and the distortion readout jumps on the spot. Don’t abuse τ either: too small and the ripple leaks through; too large and the discharge can’t follow the envelope’s falling edge (<strong>diagonal clipping</strong>). <a class="fourier-link" href="../freqresp/#step2">This RC is a low-pass filter: how to read its Bode plot →</a>',
    s3mLab: 'Modulation index m',
    s3tauLab: 'RC time constant τ',
    s3cardEnv: 'Envelope detector · recovered message',
    s3cardCoh: 'Coherent demod · same conditions (reference)',
    s3cardEnvSub: 'Diode peak + RC discharge, simulated sample by sample; distortion = residual after a least-squares fit of the detector output to the message',
    s3cardCohSub: 'Multiply by LO + ideal low-pass (φ = 0, Δf = 0), same AM signal',
    s3ro: 'τ has a sweet spot in the middle: at τ = {tau} ms the distortion is <span>{snr}</span>. Push m past 1.0, or twist τ to either end, and watch this card.',
    s3snr: 'Distortion (fit SNR) <b>{v}</b>',
    s3hint: 'Notice the absurdly large number on the coherent card — that is not rounding. That chain is mathematically <strong>lossless</strong> (down at floating-point dust). The envelope detector is cheap, but its ledger contains ripple, folding, and diagonal clipping. The whole difference between cheap and dear is in these readouts.',
    cv3Sig: 'AM signal & detector output',
    cv3Env: 'Detector output',
    cv3True: 'True envelope 1 + m·message',

    s4k: 'Step 4 · FM',
    s4t: 'FM: move the frequency’s swing instead — then a noise duel',
    s4e: 'FM takes the other road: the carrier’s amplitude never changes; its <strong>instantaneous frequency</strong> swings with the message — f(t) = fc + kf·m(t), with swing Δf = β·fm (β is the modulation index; fm = 10 Hz is this step’s message). The larger β, the wider the spectrum spreads: the spectrum below is still a live FFT, and the bandwidth readout is an <strong>occupied-bandwidth</strong> measurement (the span between the 1% and 99% cumulative-power points of the unwindowed power spectrum). Next to it sits the empirical <strong>Carson’s rule</strong>, 2(Δf + fm) — an estimate, not a measurement; the two numbers should be close, not equal.',
    s4betaLab: 'Modulation index β (Δf = β × 10 Hz)',
    s4f: 'f(t) = fc + Δf·m(t), s(t) = cos(2π∫f dt), Δf = β·fm, fm = 10 Hz, fc = 200 Hz',
    s4ro: 'Δf = <span>{df} Hz</span> · measured occupied bandwidth = <span>{bw} Hz</span> (1%–99% cumulative power) · Carson’s rule = <span>{carson} Hz</span> (rule of thumb) · the carrier line is down to <span>{car}</span> (larger β hands more power to the sidebands)',
    s4hint: 'Watch the carrier line’s readout: as β grows it keeps shrinking — FM moves power out of the carrier into the sidebands. That is also why an FM spectrum is a “comb”: lines spaced fm apart, with heights set by Bessel functions. This page does not expand those formulas; the spectrum is measured, not drawn.',
    cv4Finst: 'Instantaneous frequency f(t) (Hz)',
    cv4Wave: 'FM waveform (excerpt)',
    cv4Spec: 'FM spectrum (FFT, measured)',
    cv4Obw: 'Measured occupied BW',
    cv4Carson: 'Carson BW',
    s4aT: 'The noise duel: the same noise, thrown at AM and FM',
    s4aE: 'Throw <strong>the same</strong> noise at both AM and FM (same seed, mulberry32 + Box–Muller Gaussians, same noise power σ = 0.2) and demodulate each: AM with Step 3’s envelope detector (m = 0.8, τ = 15 ms), FM by first <strong>limiting</strong> (keep only the analytic signal’s phase, discard amplitude) and then phase-difference demodulation (β = 2.5). Output quality is measured one way for both: least-squares fit the demodulated output to the original message and turn the residual into an SNR. Every number is computed from the samples — change the seed and the numbers move, but the verdict should stand.',
    s4seedBtn: 'New noise seed',
    s4aRo: 'Seed <span>{seed}</span> · measured noise power <span>{np}</span> · input SNR: AM <span>{inAm}</span> / FM <span>{inFm}</span> (their own signal powers differ) · after demod: AM envelope <span>{outAm}</span> · FM <span class="good">{outFm}</span> · FM ahead by <span>{margin}</span>',
    s4aHint: 'FM’s lead is not free: upstairs it just spent several times the bandwidth. <strong>Trading bandwidth for quiet</strong> is the economics that won FM the whole broadcast band. Fairness note: both channels get the same noise sequence at the same power; the input SNRs differ slightly because AM and FM signals have different powers of their own, and the readout lists them separately and honestly.',
    cv4MsgRef: 'Original message',
    cv4AmOut: 'AM demod (envelope)',
    cv4FmOut: 'FM demod (limit + discriminate)',

    s5k: 'Step 5 · FDM',
    s5t: 'Three stations on one street: tuning and crosstalk',
    s5e: 'Do Step 0’s move three times at once and you get <strong>frequency-division multiplexing (FDM)</strong>: three “stations” park their messages next to three different carriers, all sharing one channel. The receiver first circles its target with a <strong>band-pass</strong> (FFT mask, 25 Hz half-width), then coherently demodulates it back. Below you can pick a station, mistune the receiver, or <strong>squeeze the stations closer together</strong> — once a neighbour’s spectral packet creeps into your band-pass, their message leaks into your output, and the crosstalk readout climbs on the spot. Crosstalk is measured by fitting the demodulated output to the <strong>target station’s own message</strong> by least squares: the part that fits counts as yours, and the <strong>residual power</strong> that does not fit, divided by your own power, is the crosstalk. (This chain has neither noise nor nonlinearity, so the residual is entirely neighbour leakage — which is why the recovered SNR and the crosstalk come out exactly equal in size and opposite in sign: two readings of the same ledger.)',
    s5tgtLab: 'Target station',
    s5tuneLab: 'Receiver tuning fc (where the receiver actually points)',
    s5spaceLab: 'Station spacing factor (1 = standard 60 Hz spacing)',
    s5ro: 'Target {name} (carrier <span>{fc}</span> Hz) · recovered SNR = <span>{snr}</span> · crosstalk (neighbours’ power / target power) = <span>{xt}</span> · inside the circled band, the target holds <span>{share}</span> of the power',
    s5hint: 'Spectrum management is exactly this ledger: how wide the spacing is, how much bandwidth each station occupies, and how steep the receiver’s band-pass is — together they set the crosstalk. Pull the spacing factor to 0.55, or mistune by 15 Hz, and watch the recovered SNR and crosstalk move.',
    cv5Spec: 'Channel spectrum (3 stations, FFT) & receiver band-pass',
    cv5Out: 'Demodulated output',
    cv5Ref: 'Target message (reference)',
    staA: 'Station A', staB: 'Station B', staC: 'Station C',

    s6k: 'Step 6 · Finale',
    s6t: 'I/Q: two floors on the same street',
    s6e: 'The finale pushes the move to its limit: can <strong>one carrier frequency</strong> carry two messages at once? Yes — with two <strong>orthogonal</strong> carriers: cos carries the I stream, sin carries the Q stream, sent as one combined signal (s = I·cos − Q·sin). At the receiver, multiplying by cos and low-passing “sees” only I; multiplying by sin sees only Q, because over whole cycles the product of cos and sin integrates to zero — <strong>orthogonality</strong>. The crosstalk readouts tell you how clean that “only” is. Then switch orthogonality off (send both streams on cos) and watch: the two streams instantly tangle into one inseparable sum.',
    s6orthBtn: 'Orthogonal (cos carries I, sin carries Q)',
    s6brokenBtn: 'Orthogonality off (both on cos)',
    s6f: 's(t) = I(t)·cos(2πfc t) − Q(t)·sin(2πfc t), I = cos(2π·6t), Q = cos(2π·15t), fc = 200 Hz',
    s6ro: 'I branch: recovered scale <span>{ai}</span> · crosstalk (Q power leaking into I) <span>{xi}</span> · Q branch: recovered scale <span>{aq}</span> · crosstalk (I power leaking into Q) <span>{xq}</span>',
    s6hint: 'This is the alphabet of modern communications: the receiver projects the signal onto the I and Q axes and gets one point in a plane; sending different data means sending different points — the grid of points is a <strong>QAM constellation</strong>. Phones, WiFi and 5G modulation are all descendants of this same mixing and projection.',
    cv6Tx: 'Transmitted combined signal',
    cv6I: 'I branch: recovered vs original',
    cv6Q: 'Q branch: recovered vs original',
    s6card1T: 'From crystal radios to 5G',
    s6card1: 'A 1920s crystal set used exactly Step 3’s envelope detector; FM broadcasting bought its sound quality with Step 4’s trade; phones and WiFi carry two streams at once with Step 6’s I/Q. A century changed the components — never the multiplication.',
    s6card2T: 'PLLs are everywhere',
    s6card2: 'Step 2’s two accounts are watched, moment by moment, by a phase-locked loop (PLL) in every real receiver: let the local oscillator’s frequency or phase drift and the ledger stops balancing. PLLs also hide inside CPU clock multipliers and disk-drive read channels.',
    s6card3T: 'Spectrum is a public resource',
    s6card3: 'Step 5’s parking dispute is literally the job of radio regulators worldwide: slicing the spectrum into bands, capping bandwidths and emission masks, so that systems that have never met can share one sky.',
    s6fin: 'To wrap up: <strong>modulation is moving a spectrum house</strong> — multiply by a cosine and the spectrum is copied twice and shifted to ±fc; demodulation does the same move again and filters away the high copy. AM writes the message into amplitude — cheap, but noise-fragile. FM writes it into the swing of frequency — trading bandwidth for quiet. FDM lets many voices live on separate streets; I/Q stacks two floors on one street with orthogonality. Every communications term you will ever meet — carrier, sideband, bandwidth, crosstalk — appears on this page in person, with its real numbers.',
    s6lkF: 'Fourier transform: what frequencies a signal is made of →', s6lkS: 'Sampling & aliasing: moving house, disaster scenes →', s6lkR: 'Frequency response & filters: the low-pass and band-pass in person →'
  }
};

/* -- 语言机制与 freqresp/i18n.js 同构：存储/默认/切换/刷新回调 -- */
let _lang = null;
let _langMem = 'zh';
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
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }
function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
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
document.addEventListener('DOMContentLoaded', initLangToggle);
