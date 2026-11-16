---
lang: zh
---

::: strings
docTitle: 调制与频移 · 把信号搬上高频运走 · 一步一交互
back: ← 知识索引
pageTitle: 调制与频移 · 把信号搬上高频运走
tagline: 声音本身跑不远，还都挤在同一段低频里。调制做的事，是把消息的频谱整包搬到一条高频载波旁边运走，到站再原样搬回来——时域里乘一个余弦，频域里就是一次搬家。AM 搬的是幅度的形状，FM 搬的是频率的摆动；从矿石收音机到 WiFi，搬运工从未换人。本页每张频谱都由真采样 FFT 当场算出，每次解调都逐点真算。
foot: visual.integ.life · 调制与频移 Modulation & Frequency Shifting —— 一步一交互系列
:::

## 声音住在低频，却要搬去高频住 {#step0 h2=s0t}

::: strings
nav0: 0 搬家
:::

第 0 步 · 钩子 {#s0k .step-kicker i18n=text}

下面这条「嗓音」由 3、5、7 Hz 三条正弦叠成——它的频谱全部挤在 **0 附近**。这样的信号有两个麻烦：一是跑不远（能高效辐射它的天线，尺寸要和波长可比，低频意味着大得离谱的天线）；二是所有人的嗓音都挤在同一段，谁也听不清谁。解法是**搬家**：把整段频谱平移到一条高频**载波**旁边运走。拖动载波频率，看频谱整包搬走——搬运工具只有一个：**乘法**。 {#s0e .explain}

::: html step0-1
s0fcLab: 载波频率 fc
:::

收音机上的调谐旋钮，做的就是这件事的逆操作的一半：**选一条街（载波），把住在那条街的人接回来**。注意频谱是左右各一份的——乘实数余弦会把谱复制到 +fc 与 −fc 两侧（图上只画正频率一侧），这是第 1 步要细看的原子操作。 {#s0hint .hint}

::: html step0-2
start: 开始探索 ↓
:::

::: strings
s0ro: 消息最高分量 B = <span>7 Hz</span>（实测谱线在 3 / 5 / 7 Hz）· 搬家后最强谱线实测在 <span>{peak} Hz</span>，谱线群落在 <span>{lo} – {hi} Hz</span>（= fc ± 7）
cv0Msg: 基带消息 m(t)：3 + 5 + 7 Hz
cv0Mod: 已调信号 m(t)·cos(2πfc t)
cv0SpecBase: 消息的频谱（搬家前）
cv0SpecMove: 已调信号的频谱（FFT 实测）
cvFreq: 频率 f（Hz）
cvAmp: 幅值
:::

## 一乘，频谱就搬家了 {#step1 h2=s1t}

::: strings
nav1: 1 AM
:::

第 1 步 · AM {#s1k .step-kicker i18n=text}

先看最经典的搬法——**调幅（AM）**：s(t) = (1 + m·消息) × cos(2πfc t)。载波的**幅度**被消息捏出形状，m 是**调制指数**（捏多深）。消息是单条 10 Hz 正弦时，频谱里不多不少三根线：载波本身一根（幅值 1），两侧各一根**边带**（幅值恰为 m/2）——因为 cos A·cos B 会裂成两个频率。下面这张频谱是页面拿真采样做的 FFT，读数里的每个数都是从谱线高度上量下来的。把 m 推过 1，时域里先露馅：包络开始穿过零点，为第 3 步的失真埋下伏笔。 {#s1e .explain}

s(t) = (1 + m·m(t))·cos(2πfc t)，fc = 200 Hz {#s1f .formula i18n=text}

::: html step1-1
s1msgSingle: 消息：单音 10 Hz
s1msgDual: 消息：双音 10 + 25 Hz
s1mLab: 调制指数 m
:::

换成双音消息，每条消息谱线都会在 fc 两侧各复制一份：整个谱包被**整体平移 + 镜像复制**。所以已调信号占的带宽永远是消息最高频率 B 的**两倍**（读数里的「横跨」就是从 FFT 谱线实测的跨度）。只运消息、不带载波的那一份叫 DSB（双边带），第 2 步解调用的就是它。 {#s1hint .hint}

::: strings
s1roSingle: 实测（FFT）：载波 <span>{car}</span> · 下边带 <span>{lo}</span> · 上边带 <span>{hi}</span> · 边带/载波 = <span>{ratio}</span>（解析 m/2 = <span>{half}</span>）{spanTxt}
s1roDual: 实测（FFT）：载波 <span>{car}</span> · 10 Hz 的边带对 <span>{sb1}</span>（解析 m·a₁/2 = <span>{a1}</span>）· 25 Hz 的边带对 <span>{sb2}</span>（解析 m·a₂/2 = <span>{a2}</span>）{spanTxt}
s1roZero: m = 0：只剩载波，没有任何消息被运走——谱线横跨 0 Hz。把 m 往上推，边带才会长出来。
s1roSpanOk: 已调谱线横跨 <span>{span} Hz</span> = 2B（B = {B} Hz）
s1roSpanMiss: 边带太矮、未过横跨量测阈值 0.002，谱线横跨未检出（理论 2B = {full} Hz）
s1roSpanPart: 外侧边带未过横跨量测阈值，横跨只测到 <span>{span} Hz</span>（理论 2B = {full} Hz）
cv1Msg: 消息（归一化）
cv1Car: 载波 cos(2πfc t)
cv1Prod: 已调信号 (1 + m·消息)·载波
cv1Spec: 已调信号频谱（FFT 实测，Hann 窗）
cv1Carrier: 载波
cv1Side: 边带
:::

## 搬回来要对准：频率与相位都得对账 {#step2 h2=s2t}

::: strings
nav2: 2 接收对准
:::

第 2 步 · 接收 {#s2k .step-kicker i18n=text}

接收端的搬法是同一件事的逆：把收到的 DSB 信号**再乘一次本振载波**，乘积里有一份被搬回基带的消息、还有一份被搬到 2fc 高处，用低通把高处那份滤掉，消息就回来了（这叫**相干解调**）。但它有两个对账项：本振的**频率**偏了 Δf，搬回来的消息会被再乘上一个 cos(2πΔf·t)——听感是周期性的忽有忽无（**拍频**）；本振的**相位**差了 φ，消息被整体乘上 **cos φ**——φ = 90° 时，输出**恰好归零**。两个滑杆都拖一遍，看读数怎么说。 {#s2e .explain}

DSB：s(t) = m(t)·cos(2πfc t) → × 2cos(2π(fc+Δf)t + φ) → 低通取回 m(t)·cos(2πΔf t + φ) {#s2f .formula i18n=text}

::: html step2-1
s2dfLab: 本振失谐 Δf
s2phiLab: 本振相位差 φ
:::

真实接收机里专门有个电路（锁相环，PLL）死盯着这两笔账：把本振的频率和相位锁到与来波一致。账对不齐，信号不是变小就是周期性消失——不是「有点吵」，是数学上必然。低通口径：本页用理想低通（FFT 频域掩模，截止 60 Hz），第 5 步带通同理。 {#s2hint .hint}

::: strings
s2ro: 相位标度实测 = <span>{scale}</span>（解析 cos φ = <span>{cosphi}</span>，Δf = 0 时对账）· 输出谱线实测：<span>{lines}</span>（拍频形态与 Δf 对应）
s2roTwin: （主路输出已是浮点尘，谱线位置改由 φ = 0、同 Δf 的孪生路量取——位置只由 Δf 决定，与 φ 无关）
cv2Dust: 谱幅 ≈ {amp}（浮点尘量级，不是真信号）· 纵轴下限按原消息谱峰的 1/4 定标，不放大
s2linesPair: {f1} Hz 与 {f2} Hz 两根线（= fm ± Δf）
s2linesSingle: 单根线在 {f} Hz（Δf = 0，无拍）
cv2Out: 解调输出
cv2Ref: 原消息（对照）
cv2Spec: 解调输出的频谱（FFT 实测）
:::

## 穷人的解调：二极管 + RC，和它赌输的地方 {#step3 h2=s3t}

::: strings
nav3: 3 包络检波
:::

第 3 步 · 包络检波 {#s3k .step-kicker i18n=text}

老式收音机不用本振，用得起的只有一颗二极管和一个 RC：二极管只让信号的正半周给电容**瞬间充电到峰值**，两次峰值之间电容经 R 慢慢**放电**——电容电压画出的就是载波的**包络**，也就是 1 + m·消息。下面就是这台检波器的逐点仿真（充电瞬时、放电按 e<sup>−t/τ</sup>）。它成立有个赌注：**m ≤ 1**。m 一旦过 1，包络穿过零点、载波相位翻转，检波器跟的是包络的绝对值，消息在谷底被**折叠**——失真读数当场跳给你看。τ 也别乱拧：太小，纹波压不住；太大，放电跟不上包络的下降沿（**对角切割**）。<a class="fourier-link" href="../../systems/frequency-response/#step2">这个 RC 就是一台低通滤波器：它的波特图读法 →</a> {#s3e .explain}

::: html step3-1
s3mLab: 调制指数 m
s3tauLab: RC 时间常数 τ
s3cardEnv: 包络检波 · 解出的消息
s3cardEnvSub: 二极管峰值 + RC 放电，逐点真仿真；失真 = 检波输出对消息做最小二乘拟合后的残差
s3cardCoh: 相干解调 · 同条件（对照）
s3cardCohSub: 乘本振 + 理想低通（φ = 0、Δf = 0），同一条 AM 信号
:::

注意相干解调那张牌的数字大得不像话——那不是四舍五入，是这条链路在数学上**无损**（浮点尘级别）。包络检波便宜，但它的账本里有纹波、有折叠、有对角切割。贵与便宜的差别，全在读数里。 {#s3hint .hint}

::: strings
s3ro: τ 的甜点在中间：τ = {tau} ms 时失真 <span>{snr}</span>。把 m 推过 1.0，或把 τ 拧到两端，再看这张牌。
s3snr: 失真（拟合 SNR）<b>{v}</b>
cv3Sig: AM 信号与检波输出
cv3Env: 检波输出
cv3True: 真包络 1 + m·消息
:::

## FM：改搬频率的摆动，再比一比抗噪 {#step4 h2=s4t}

::: strings
nav4: 4 FM 与抗噪
:::

第 4 步 · FM {#s4k .step-kicker i18n=text}

FM 换了个搬法：载波的幅度纹丝不动，让**瞬时频率**跟着消息摆——f(t) = fc + kf·m(t)，摆幅 Δf = β·fm（β 是调制指数，fm = 10 Hz 是本步的消息）。β 越大，频谱被撑得越宽：下面那张谱仍是 FFT 真算，带宽读数按**占用带宽**口径实测（无窗功率谱上累积功率 1% 到 99% 的跨度），旁边并排的是经验公式 **Carson 规则** 2(Δf + fm)——它是估算，不是实测，两个数接近但不必相等。 {#s4e .explain}

f(t) = fc + Δf·m(t)，s(t) = cos(2π∫f dt)，Δf = β·fm，fm = 10 Hz，fc = 200 Hz {#s4f .formula i18n=text}

::: html step4-1
s4betaLab: 调制指数 β（Δf = β × 10 Hz）
:::

看载波线的读数：β 增大时它一路缩水——FM 把功率从载波里搬去了边带。这也是 FM 频谱是一把「梳子」的原因：谱线以 fm 为间隔排开，高度由贝塞尔函数定，本页不展开公式，谱是实测的。 {#s4hint .hint}

::: html step4-2
s4aT: 抗噪擂台：同一条噪声，泼向 AM 与 FM
s4aE: 给 AM 和 FM 各泼**同一条**噪声（同一种子 mulberry32 + Box–Muller 高斯、同噪声功率 σ = 0.2）再各自解调：AM 用第 3 步的包络检波（m = 0.8、τ = 15 ms），FM 先**限幅**（只取解析信号的相位、丢掉幅度信息）再做相位差分解调（β = 2.5）。输出质量用同一个口径量：解调输出对原消息做最小二乘拟合，残差换算成 SNR。数字全部由样本现算——换颗种子，数字会动，结论应该站得住。
s4seedBtn: 换一颗噪声种子
s4aHint: FM 的领先不是免费的：它在第 4 步上半场刚花掉了几倍带宽。**拿带宽换干净**，就是 FM 占着整个调频波段的经济学。注意公平性口径：两路泼的是同一条噪声、同一个噪声功率；输入 SNR 因 AM 与 FM 自身功率不同而略有差别，读数里如实分开列了。
:::

::: strings
s4ro: Δf = <span>{df} Hz</span> · 实测占用带宽 = <span>{bw} Hz</span>（1%–99% 累积功率）· Carson 规则 = <span>{carson} Hz</span>（经验式）· 载波线只剩 <span>{car}</span>（β 越大，功率越往边带分）
cv4Finst: 瞬时频率 f(t)（Hz）
cv4Wave: FM 波形（节选）
cv4Spec: FM 频谱（FFT 实测）
cv4Obw: 实测占用带宽
cv4Carson: Carson 带宽
s4aRo: 种子 <span>{seed}</span> · 噪声功率实测 <span>{np}</span> · 输入 SNR:AM <span>{inAm}</span> / FM <span>{inFm}</span>（各自信号功率不同）· 解调后 SNR:AM 包络 <span>{outAm}</span> · FM <span class="good">{outFm}</span> · FM 领先 <span>{margin}</span>
cv4MsgRef: 原消息
cv4AmOut: AM 解调（包络）
cv4FmOut: FM 解调（限幅+鉴频）
:::

## 一条街住三家：选台与串扰 {#step5 h2=s5t}

::: strings
nav5: 5 频分复用
:::

第 5 步 · 频分复用 {#s5k .step-kicker i18n=text}

把第 0 步的搬家同时做三遍，就是**频分复用（FDM）**：三家「电台」各自把消息搬到不同载波旁，在同一条信道里并排停放。接收端先用**带通**（FFT 掩模，半宽 25 Hz）圈住目标那家，再相干解调搬回来。下面可以选台、拧偏接收频率、还可以把三家的**间距拉近**——邻台的谱包一旦蹭进你的带通，解调输出里就会混进别人家的消息，串扰读数当场爬升。串扰的口径是：把解调输出对**本台消息**做最小二乘拟合，对得上的部分算本台，对不上的**残差功率**除以本台功率，就是串扰。（本步链路没有噪声、也没有非线性，残差全部来自邻台泄漏——所以「恢复 SNR」与「串扰」恰好大小相等、符号相反，是同一笔账的两种读法。） {#s5e .explain}

::: html step5-1
s5tgtLab: 目标台
staA: 甲台
staB: 乙台
staC: 丙台
s5tuneLab: 接收调谐 fc（接收机实际对准的频率）
s5spaceLab: 台间距系数（1 = 标准间距 60 Hz）
:::

波段管理管的就是这笔账：台距多宽、每家占多少带宽、接收带通多陡——三者决定串扰。把间距系数拉到 0.55，或者把调谐拧偏 15 Hz，看恢复 SNR 和串扰怎么变。 {#s5hint .hint}

::: strings
s5ro: 目标台 {name}（载波 <span>{fc}</span> Hz）· 解调恢复 SNR = <span>{snr}</span> · 串扰（邻台功率 / 本台功率）= <span>{xt}</span> · 带通圈住的谱里，本台占 <span>{share}</span>
cv5Spec: 信道频谱（三台并存，FFT 实测）与接收带通
cv5Out: 解调输出
cv5Ref: 目标台消息（对照）
:::

## I/Q：同一条街的上下层 {#step6 h2=s6t}

::: strings
nav6: 6 终章 · I/Q
:::

第 6 步 · 终章 {#s6k .step-kicker i18n=text}

最后一步把搬家做到极致：**同一个载波频率**，能不能同时运两路消息？能——用两条**正交**的载波：cos 驮 I 路、sin 驮 Q 路，合成一路发送（s = I·cos − Q·sin）。接收端分别乘 cos 与乘 sin 再低通：cos 只「看见」I、sin 只「看见」Q，因为在整数个周期上 cos 与 sin 的乘积积分为零——**正交**。串扰读数会告诉你这个「只看见」有多干净。把正交关掉（两路都用 cos 发）再看：两路当场串成一团，谁也分不开谁。 {#s6e .explain}

s(t) = I(t)·cos(2πfc t) − Q(t)·sin(2πfc t)，I = cos(2π·6t)，Q = cos(2π·15t)，fc = 200 Hz {#s6f .formula i18n=text}

::: html step6-1
s6orthBtn: 正交发送（cos 驮 I、sin 驮 Q）
s6brokenBtn: 关掉正交（两路都用 cos）
:::

这就是现代通信的字母表：接收机把信号投影到 I、Q 两条轴上，得到平面上的一个点；发送不同的数据就是发不同的点——点阵排布就是 **QAM 星座图**。手机、WiFi、5G 的调制，全是这套混频与投影的后代。 {#s6hint .hint}

::: html step6-2
s6card1T: 从矿石收音机到 5G
s6card1: 1920 年代的矿石收音机用的就是第 3 步的包络检波；调频广播用第 4 步的 FM 换音质；手机与 WiFi 用第 6 步的 I/Q 一次运两路——一百年里换的是器件，没换的是乘法。
s6card2T: 锁相环无处不在
s6card2: 第 2 步的对账在真实接收机里由锁相环（PLL）逐刻盯着：本振频率与相位一旦漂移，账就对不上。PLL 同样藏在 CPU 的时钟倍频、硬盘的读通道里。
s6card3T: 波段是公共资源
s6card3: 第 5 步的停车位之争，就是各国无线电管理机构在做的事：划分频段、规定带宽与发射掩模，让互不相识的系统能在同一片天空里并行。
s6fin: 收个尾：**调制就是把频谱搬家**——乘一个余弦，谱复制两份、平移到 ±fc；解调是把同一件事再做一遍并滤掉高处那份。AM 把消息写在幅度上、便宜但怕吵；FM 把消息写在频率的摆动里、拿带宽换干净；FDM 让许多人分街而居；I/Q 则在同一条街上用正交分出上下层。你以后听到的每个通信名词——载波、边带、带宽、串扰——都在这一页里有本人的真容与真账。
s6lkF: 傅里叶变换：信号由哪些频率组成 →
s6lkS: 采样与混叠：搬家时的翻车现场 →
s6lkR: 频率响应与滤波：低通与带通本人 →
:::

::: strings
s6ro: I 路：恢复标度 <span>{ai}</span> · 串扰（Q 漏进 I 的功率比）<span>{xi}</span> · Q 路：恢复标度 <span>{aq}</span> · 串扰（I 漏进 Q 的功率比）<span>{xq}</span>
cv6Tx: 发送合成信号
cv6I: I 路：取回 vs 原样
cv6Q: Q 路：取回 vs 原样
:::
