---
lang: zh
---

::: strings
docTitle: Z 变换 · 把 s 平面卷成单位圆 · 一步一交互
back: ← 知识索引
pageTitle: Z 变换 · 单位圆
tagline: 拉普拉斯页的终章里，有一颗点沿着虚轴滑动，它的像始终落在一个圆上——那不是彩蛋，那是离散世界的整张地图。离散信号没有连续时间，它的变换不住在平面上，住在一个圆里：把 s 平面按 z = e^{sT} 卷起来，左半平面卷进单位圆内，虚轴卷成圆周，收敛域变成圆环，稳定性变成一句话。
foot: visual.integ.life · Z 变换 Z-Transform —— 一步一交互系列
:::

## 把平面卷起来 {#step0 h2=s0t}

::: strings
nav0: 0 卷平面
:::

第 0 步 · 钩子 {#s0k .step-kicker i18n=text}

连续世界的信号 x(t) 变成离散世界的 x[n]，只差一步：每隔 T 秒取一个样。变换也跟着变：把拉普拉斯的 s 换成 z = e<sup>sT</sup>，就是 **Z 变换**。这个指数映射会把整张 s 平面**卷起来**：下面这群点正沿着 z = e<sup>sT</sup> 从左边的 s 平面飞向右边的 z 平面——青点原本站在虚轴上，落点恰好围成**单位圆**；绿点在左半平面（σ = −1.2），落进圆内；粉点在右半平面（σ = +0.8），落在圆外。记住这三句，后面全页都是它。 {#s0e .explain}

::: html step0-1
s0tLab: T · 采样周期（本页各步的 T 都明示）
s0pause: 暂停
s0trails: 显示飞行轨迹
:::

T 是采样周期：采得越快（T 越小），e<sup>σT</sup> 越贴近 1，所有落点都往单位圆边上挤——离散系统越来越像它连续的原版（第 5 步细看）。反过来 T 越大，卷得越狠，左半平面的点被压得越靠圆心。还有个伏笔：纵轴方向是「每 2π/T 卷一整圈」——s 平面里相距 2π/T 的两个点，会落到同一个 z 上（第 5 步的孪生点、第 1 步的频率折返，都是这件事）。 {#s0hint .hint}

::: html step0-2
start: 开始探索 ↓
:::

::: strings
s0play: 播放
s0ro: T = <span>{T}</span> · 虚轴上的点 → 半径 <span>1</span>（单位圆） · 左半列 σ = −1.2 → 半径 e<sup>−1.2T</sup> = <span>{rL}</span> · 右半列 σ = +0.8 → 半径 e<sup>0.8T</sup> = <span>{rR}</span>
cvSPlane: s 平面（连续）
cvZPlane: z 平面（离散）
cvUnit: 单位圆 |z| = 1
cvFamAxis: 虚轴上的点 σ = 0
cvFamL: σ = −1.2（左半平面）
cvFamR: σ = +0.8（右半平面）
:::

## 一个点，就是一段序列 {#step1 h2=s1t}

::: strings
nav1: 1 点即序列
:::

第 1 步 · 点即序列 {#s1k .step-kicker i18n=text}

在 z 平面里随手放一个点 z = r·e<sup>jΩ</sup>，它立刻对应一段序列 x[n] = r<sup>n</sup>·cos(Ωn)：**半径 r 管涨缩**——每走一步乘一个 r，r < 1 一步步衰死、r = 1 不衰不涨、r > 1 涨爆；**角度 Ω 管振荡快慢**——每步转 Ω 弧度。拖点、或拖下面的滑杆，都一样。再盯住 Ω 滑杆：把它拖过 π 继续往 2π 走——波形不会变得更快，反而**折返**变慢：Ω 和 2π − Ω 给出逐点完全相同的序列。数字频率的有效范围只有一圈，超出的部分全是别名（这正是第 0 步「每 2π 卷一圈」在时域里的脸）。 {#s1e .explain}

z = r·e^{jΩ} → x[n] = rⁿ·cos(Ωn) {#s1formula .formula i18n=text}

::: html step1-1
s1rLab: r = |z| · 管涨缩
s1oLab: Ω · 数字频率（0 到 2π 一整圈）
:::

和拉普拉斯页第 0 步对照着看：那边 σ 管生死、ω 管快慢，是两个独立的旋钮；这边离散世界把两件事打包进**一个点的位置**——离圆心多远定生死，绕圆心多斜定快慢。这就是为什么 Z 变换的图永远画在圆上：圆内、圆上、圆外，就是离散系统的生死簿。 {#s1hint .hint}

::: strings
s1ro: r = <span>{r}</span> · Ω = <span>{om}</span> rad（{omPi}π）· 点 z = <span>{re}</span> {imSign} j·<span>{im}</span> · 有效频率 Ω′ = <span>{eff}</span> rad · 状态：<b>{verdict}</b> · x[0] = {x0}，x[1] = {x1}，x[10] = {x10}
s1vDecay: 衰减——r < 1，包络 rⁿ 一步步压扁
s1vEqual: 等幅——r = 1，永远振下去
s1vGrow: 增长——r > 1，涨出画框（已钳制，读数为真值）
s1alias: 别名提醒：你拨的 Ω = {om} 已超过 π。序列与 Ω″ = 2π − Ω = {alias} 的序列逐点相同（余弦是偶函数），也与 Ω + 2π 的序列逐点相同——数字频率只认一圈，多转的整圈和折返的镜像都不产生新序列。对账接口 ZT.aliasMaxDiff 可以逐点验。（「逐点相同」是数学恒等式；浮点逐点验算的相对差在 1e-13 量级以内。）
cvSeq: x[n] = rⁿ·cos(Ωn)（茎状图）
cvDrag: 拖我
cvClip: 超出 ±3.2 已钳制（真值见读数）
:::

## X(z) 不是公式，是一串加法收不收得住 {#step2 h2=s2t}

::: strings
nav2: 2 求和现场
:::

第 2 步 · 求和现场 {#s2k .step-kicker i18n=text}

Z 变换的定义就是一个无穷求和：X(z) = Σ<sub>n≥0</sub> x[n]·z<sup>−n</sup>。拿最经典的序列 x[n] = a<sup>n</sup>u[n] 开刀：在 z 平面里放一颗探针，然后**当着你的面一项一项往上加**——右边画的是部分和 S<sub>N</sub> 在复平面里的落点轨迹。每加一项，落点跳一步：比值 q = a/z 决定命运：|q| < 1，每步跳幅按 |q| 缩小，轨迹螺旋收进极限 z/(z−a)；|q| > 1，每步跳得更远，轨迹一路跑飞。S<sub>N</sub> 是页面逐项真加出来的，不是拿闭式冒充的——误差 |S<sub>N</sub> − 极限| 与 |q|<sup>N+1</sup>/|1 − q| 分毫不差（读数里两个数并排，自己对）。 {#s2e .explain}

::: html step2-1
s2formula: X(z) = Σₙ aⁿz⁻ⁿ = 1 / (1 − a·z⁻¹)，部分和 S_N = Σ_{n=0}^{N} (a/z)ⁿ
s2aLab: a · 序列 aⁿu[n] 的底
s2add1: 加一项（N+1）
s2add20: 连加 20 项
s2run: 跑到 N = 300
s2reset: 重置 N = 0
:::

把探针拖着横穿虚线圆 |z| = |a|：里侧发散、外侧收敛，这条圆就是这个变换的**收敛域边界**。再把 a 拖成负数试试：序列变成正负交替的 (±|a|)<sup>n</sup>，收敛域仍是 |z| > |a| 的圆外——收敛只看模长，不看符号。下一站把这条边界正式命名：ROC。 {#s2hint .hint}

::: strings
s2roConv: a = {a} · 探针 z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z，|q| = <span>{qmod}</span> &lt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · 极限 z/(z−a) = {lre} {lImSign} j·{lim} · |S<sub>N</sub> − 极限| = <span>{err}</span>（公式预言 |q|<sup>N+1</sup>/|1−q| = {errPred}）
s2roDiv: a = {a} · 探针 z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z，|q| = <span>{qmod}</span> &gt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · 每加一项跳幅 ×|q|，和**发散**——这个 z 不在收敛域里
s2roBnd: a = {a} · 探针 z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · |q| = <span>{qmod}</span> = 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · 每一项的模恒为 1、永不衰减，部分和只会原地绕圈或直线走开——<b>边界不收敛</b>
s2roSing: a = {a} · 探针正压在极点 z = a 上：q = 1，每一项都是 1，S<sub>N</sub> = N + 1 = <span>{sn}</span> 一路直线涨——极点就是求和彻底收不住的地方
cvProbe: 探针 z
cvLimit: 极限 z/(z−a)
cvBnd: 边界 |z| = |a|
cvSumsT: 部分和 S_N 的落点轨迹（每点 = 多加一项）
:::

## 同一个式子，圆内圆外两个信号 {#step3 h2=s3t}

::: strings
nav3: 3 圆环 ROC
:::

第 3 步 · 圆环 ROC {#s3k .step-kicker i18n=text}

拉普拉斯页第 3 步的续集：那边两个信号共用一个式子、ROC 一左一右；这边一模一样。因果序列 a<sup>n</sup>u[n] 活在 n ≥ 0，它的和 Σa<sup>n</sup>z<sup>−n</sup> 要 |z| > |a| 才收得住；左边序列 −a<sup>n</sup>u[−n−1] 活在 n ≤ −1，把下标翻过来，它的和 Σ(z/a)<sup>m</sup> 要 |z| &lt; |a| 才收得住。**代数式都是 z/(z−a)**，区别只在 ROC 一个在圆外、一个在圆内。切换序列看阴影翻面，拖探针逐点验：判定走的就是第 2 步的真求和比值，边界 |z| = |a| 上如实报「不收敛」。 {#s3e .explain}

两个序列的 X(z) 都是 z / (z − a) —— 式子相同，ROC 不同 {#s3formula .formula i18n=text}

::: html step3-1
s3btnC: 因果 · aⁿu[n]（活在 n ≥ 0）
s3btnL: 左边 · −aⁿu[−n−1]（活在 n ≤ −1）
s3aLab: a（两序列共用，极点在 z = a）
:::

稳定性的判据还是那句：**ROC 包含单位圆 ⟺ 系统稳定**（对应拉普拉斯那边的「ROC 包含虚轴」）。所以因果序列要 a &lt; 1 才稳定，左边序列反过来要 a > 1 才稳定——把 a 拖过 1，两边的稳定性正好交换。注意 a 恰为 1 时：ROC 边界就是单位圆本身，圆不在 ROC 里（收敛域是开的），两边都不稳定，别被「贴着」骗了。 {#s3hint .hint}

::: html step3-2
s3linkTxt: 和拉普拉斯页第 3 步摆一起看：那边 ROC 是竖条带（σ > −a 或 σ < −a），这边卷成了圆环（|z| > |a| 或 |z| &lt; |a|)——形状变了，规矩一字没变：式子必须带 ROC 才算说完，稳定看 ROC 包不包住那条「傅里叶住的线」。那边是虚轴，这边是单位圆 →
s3lkL: 拉普拉斯与 ROC →
:::

::: strings
s3curC: 因果序列 aⁿu[n]
s3curL: 左边序列 −aⁿu[−n−1]
s3ro: 当前序列：<b>{cur}</b> · a = {a} · 探针 |z| = <span>{zmod}</span> · 对当前序列：<b>{verdict}</b> · 稳定性：ROC {rocTxt} 单位圆 → <b>{stable}</b>
s3in: 收敛 ✓（在 ROC 内）
s3out: 发散 ✗（在 ROC 外）
s3bnd: 恰在边界 |z| = |a|：项不衰减，不收敛
s3rocHas: 包含
s3rocMiss: 不包含
s3stable: 稳定
s3unstable: 不稳定
cvRocOut: ROC：|z| > a（圆外）
cvRocIn: ROC：|z| < a（圆内）
cvTimeC: aⁿu[n]
cvTimeL: −aⁿu[−n−1]
:::

## 圆内活、圆上鸣、圆外炸 {#step4 h2=s4t}

::: strings
nav4: 4 极点与圆
:::

第 4 步 · 极点与圆 {#s4k .step-kicker i18n=text}

把二阶系统搬进 z 平面：H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>))，一对共轭极点 p = r·e<sup>±jθ</sup>。拖动上半平面那颗（下半颗是它的镜像）：右边冲激响应 h[n] = r<sup>n</sup>·sin((n+1)θ)/sin θ 实时重画（闭式逐点算），灰色虚线是<strong>包络 ±E[n]，E[n] = r<sup>n</sup>/|sin θ|</strong>——波形峰值正好贴着它。下面第三张图的频响 |H(e<sup>jΩ</sup>)|，是把 z = e<sup>jΩ</sup> 沿单位圆代回 H(z) 逐点真算的：极点越贴圆，θ 处的峰越尖、h[n] 的尾巴拖得越长——同一件事的三个侧面。 {#s4e .explain}

H(z) = 1 / ((1 − pz⁻¹)(1 − p̄z⁻¹))，p = r·e^{jθ} → h[n] = rⁿ·sin((n+1)θ) / sin θ {#s4formula .formula i18n=text}

::: html step4-1
s4p1: 圆内深处 · 闷
s4p2: 贴着圆 · 共振
s4p3: 圆外 · 炸
:::

口径：归一化取 H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>))，此时 h[n] = r<sup>n</sup>sin((n+1)θ)/sin θ、包络 E[n] = r<sup>n</sup>/|sin θ|（峰值恰贴包络，评审可抽 n 复算）。极点被拖到实轴上时（θ = 0 或 π）两极点重合，h[n] 改走重根闭式 (n+1)·p<sup>n</sup>、包络 (n+1)·r<sup>n</sup>。频响峰位是页面在 Ω ∈ [0, π] 的细网格上真算 |H(e<sup>jΩ</sup>)| 取的最大值位置，不是手画的——它与 θ 的微小偏差如实呈现（有限高峰的峰位本就略偏离极点角，r 越贴圆偏得越小）。 {#s4note .hint}

手感练习：选「贴着圆」预置，盯着频响峰，再把极点沿径向往里拖一点点——峰立刻塌下去、h[n] 的尾巴立刻变短。数字滤波器就是这样工作的：想放大哪个频率，就把极点贴到单位圆上那个角度旁边（第 6 步亲手听）。另外把 θ 拖到贴近 0：振荡慢到几乎成了纯涨缩——极点的角度就是振荡的数字频率，和第 1 步的 Ω 是同一个量。 {#s4hint .hint}

::: strings
s4ro: 极点 p = <span>{pre}</span> {imSign} j·<span>{pim}</span>（r = <span>{r}</span>，θ = <span>{th}</span> rad）· 状态：<b>{verdict}</b> · 频响峰在 Ω = <span>{peakOm}</span> rad 处、峰值 <span>{peakVal}</span>（θ = {th}，峰位与极点角对照着看）· h[10] = {h10}，包络 E[10] = {e10}
s4vStable: 稳定——r < 1，响应衰减归零
s4vMarginal: 临界——r = 1，振荡不衰也不涨（包络恒定）
s4vUnstable: 不稳定——r > 1，响应涨爆（纵轴自动放大）
s4vGrowLin: 不稳定——r = 1 且为重根（θ = 0 或 π），包络随 n 线性增长
s4peakInf: ∞（极点就在单位圆上，奇异）
cvEnv: 包络 ±E[n]
cvImp: 冲激响应 h[n]
cvResp: |H(e^{jΩ})| —— z 沿单位圆代回 H(z)
cvPeak: 峰
cvClipResp: 峰顶已贴近纵轴上限 · 精确峰值见读数
:::

## T 决定卷得多紧，条带决定丢了谁 {#step5 h2=s5t}

::: strings
nav5: 5 对表拉普拉斯
:::

第 5 步 · 对表 {#s5k .step-kicker i18n=text}

左边拖动一个σ&lt;0的极点 s=σ+jω，右边显示指数模态的采样映射 z=e^{sT}：|z|=e^{σT}、角度Ω=ωT。此步约定 T 以秒计，σ单位s⁻¹，ω单位rad/s；Ω是每个样本的相角增量。主条带 −π/T&lt;ω≤π/T 沿虚部ω方向宽2π/T，对应一周不重复角度；本图限定σ&lt;0，所以像在单位圆内，不代表画出了整个z平面。打开孪生点，看ω相差±2π/T时映射重合；仅靠样本不能识别这类频率。 {#s5e .explain}

::: html step5-1
s5tLab: T · 采样周期（s）
s5twinBtn: 显示隔壁条带的孪生点
:::

单位对照：fₛ=1/T，采样页的复制间距是 fₛ Hz；换成角频率就是2π/T rad/s，不是两个不同结果。连续 f Hz 对应 ω=2πf rad/s，采样后数字 Ω=ωT=2πf/fₛ rad/样本（模2π）。已知理想带限且 |ω|&lt;π/T 时才有基带唯一性；本图的极点模态映射不是整台模拟系统的通用离散化传递函数。 {#s5hint .hint}

::: html step5-2
s5linkTxt: 采样页里混叠是「假波」：频率太高、采样太懒，高频装成低频混进来。在这页看得更清楚：它根本不是「装」，是卷的时候**真的落到了同一个点上**——z 平面分不清它们，就像钟表分不清 3 点和 15 点 →
s5lkS: 采样与混叠 →
:::

::: strings
s5twinBtnOff: 隐藏孪生点
s5ro: 极点 s = <span>{sre}</span> {imSign} j·<span>{sim}</span>（σ:s⁻¹，ω:rad/s）· T = {T} s · 像 z = e<sup>sT</sup> = <span>{zre}</span> {zImSign} j·<span>{zim}</span> · |z| = e<sup>σT</sup> = <span>{zmod}</span> · 角度增量 Ω = ωT = <span>{ang}</span> rad/样本{twinTxt}
s5twinTxt: " · 孪生点 s′ = {sre} {imSign} j·{sim2}（ω + 2π/T）：|z′| = {zmod}、角度 ω′T = {ang2} rad ≡ {ang}（mod 2π）——同一个像"
s5twinTxtM: " · 孪生点 s″ = {sre} {imSign} j·{sim3}（ω − 2π/T）：|z″| = {zmod}、角度 ω″T = {ang3} rad ≡ {ang}（mod 2π）——同一个像"
s5twinOff: " · 孪生点 ω ± 2π/T 已出本图范围（T 小则条带宽，一屏装不下相邻两条带）"
cvStrip: 主条带 −π/T<ω≤π/T
cvTwin: 孪生点
cvImage: 像 z = e^{sT}
cvSPole: 极点 s
cvAxis: 虚轴 jω
:::

## 单位圆，是数字世界的虚轴 {#step6 h2=s6t}

::: strings
nav6: 6 终章 · 共振器
:::

第 6 步 · 终章 {#s6k .step-kicker i18n=text}

收束成一张表：连续世界的每样东西，在离散世界都有一个住在圆上的对应。虚轴卷成单位圆——所以**「沿单位圆求值」就是离散世界的傅里叶变换**（DTFT)：z = e<sup>jΩ</sup> 在圆上走一圈，Ω 从 0 到 2π，恰好一圈走完所有数字频率。左半平面卷成圆内——所以稳定性从「极点在左」变成「极点在圆内」。判据、直觉、连手感都一一对应，只有地图的形状从平的变成了卷的。 {#s6e .explain}

::: html step6-1
tbItem: 对照
tbS: s 平面（连续 · 拉普拉斯）
tbZ: z 平面（离散 · Z 变换）
tbR1c: 傅里叶住哪
tbR1s: 虚轴 σ = 0 这条线
tbR1z: <b>单位圆</b> |z| = 1 这条圈
tbR2c: 稳定的家
tbR2s: 左半平面 σ &lt; 0
tbR2z: <b>圆内</b> |z| &lt; 1
tbR3c: 稳定判据
tbR3s: ROC 包含虚轴
tbR3z: ROC 包含<b>单位圆</b>
tbR4c: 极点离边界越远
tbR4s: 衰减越快、越稳
tbR4z: 衰减越快、越稳（一字不差）
s6rt: 收官演示：一台能拖的共振器
:::

把第 4 步的极点装进一台真滤波器：输入是 5 个纯音叠在一起（300 / 700 / 1200 / 1900 / 2700 Hz，采样率 8000 Hz），滤波器就是 H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>))，声音是它逐样点真算出来的（差分方程，不是画出来的假音）。在左图里拖极点选共振角度，r 滑杆决定共振有多尖：极点贴着圆、压在哪个音的角度上，哪个音就被轰然放大。右图的谱线是各音的真实增益（|H(e<sup>jΩ</sup>)| 逐点真算，显示按最大值归一，真实倍数看读数）。先听原声，再听过滤后的——耳朵会替你验算。 {#s6re .explain}

::: html step6-2
s6rLab: r · 极点离圆多近（共振多尖）
s6playDry: ▶ 听原声（5 个音叠在一起）
s6playWet: ▶ 听过滤波之后
:::

声音礼仪（沿用采样页）：默认静默，点按钮才建 AudioContext 播放；滤波逐样点走差分方程 y[n] = x[n] + 2r·cosθ·y[n−1] − r²·y[n−2] 真算，播放前做峰值归一防爆音、增益保守；播放首尾另加 15 ms 淡入、20 ms 淡出，短音起止不咔哒。r 在本步上限 0.99——真贴到圆上（r = 1）滤波器会自激振荡，那是第 4 步「圆上鸣」的另一面。谱线增益与读数都由同一个 respAt 函数真算，和第 4 步的频响同一口径。 {#s6note .hint}

::: html step6-3
s6fin: 从转圈的点，到卷起来的平面——这条信号补课线的地图，到这里拼完了：三角函数页那个转圈的点是 Ω 的第一次出场，傅里叶把圆转成了波，采样把波切成了点，拉普拉斯给频率配上了寿命，Z 变换把整张平面卷回一个圆。五页，一张图。下次在教材里看到单位圆，先想起今天这台共振器：**圆上的每个角度，都住着一种频率；圆内圆外，就是生与死。**
s6linksLab: 这条补课线，从这里回头看：
s6lkT: 三角函数：圆的第一次出场 →
s6lkF: 傅里叶变换 →
s6lkL: 拉普拉斯与 ROC →
s6lkS: 采样与混叠 →
:::

::: strings
s6ro: 极点角 θ = <span>{th}</span> rad → 共振频率 f = θ·f<sub>s</sub>/(2π) = <span>{fres}</span> Hz · r = <span>{r}</span> · 五个音的增益（倍）：{gains} · 最大增益在 Ω = {peakOm} 处为 {peakVal} 倍
s6tone: {f} Hz：×{g}
cvStableIn: 圆内 = 稳定的家
cvOnCirc: 圆上 = 傅里叶（DTFT）住的圈
cvIn6: 5 个输入音的角度
cvOut6: 过滤后（按最大值归一）
cvResp6: |H(e^{jΩ})|
:::
