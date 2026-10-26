'use strict';
/* ============================================================
   Z 变换讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: 'Z 变换 · 把 s 平面卷成单位圆 · 一步一交互',
    back: '← 知识索引',
    pageTitle: 'Z 变换 · 单位圆',
    tagline: '拉普拉斯页的终章里，有一颗点沿着虚轴滑动，它的像始终落在一个圆上——那不是彩蛋，那是离散世界的整张地图。离散信号没有连续时间，它的变换不住在平面上，住在一个圆里：把 s 平面按 z = e^{sT} 卷起来，左半平面卷进单位圆内，虚轴卷成圆周，收敛域变成圆环，稳定性变成一句话。',
    nav0: '0 卷平面', nav1: '1 点即序列', nav2: '2 求和现场', nav3: '3 圆环 ROC',
    nav4: '4 极点与圆', nav5: '5 对表拉普拉斯', nav6: '6 终章 · 共振器',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · Z 变换 Z-Transform —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '把平面卷起来',
    s0e: '连续世界的信号 x(t) 变成离散世界的 x[n]，只差一步：每隔 T 秒取一个样。变换也跟着变：把拉普拉斯的 s 换成 z = e<sup>sT</sup>，就是 <strong>Z 变换</strong>。这个指数映射会把整张 s 平面<strong>卷起来</strong>：下面这群点正沿着 z = e<sup>sT</sup> 从左边的 s 平面飞向右边的 z 平面——青点原本站在虚轴上，落点恰好围成<strong>单位圆</strong>；绿点在左半平面（σ = −1.2），落进圆内；粉点在右半平面（σ = +0.8），落在圆外。记住这三句，后面全页都是它。',
    s0tLab: 'T · 采样周期（本页各步的 T 都明示）',
    s0pause: '暂停', s0play: '播放',
    s0trails: '显示飞行轨迹',
    s0ro: 'T = <span>{T}</span> · 虚轴上的点 → 半径 <span>1</span>（单位圆） · 左半列 σ = −1.2 → 半径 e<sup>−1.2T</sup> = <span>{rL}</span> · 右半列 σ = +0.8 → 半径 e<sup>0.8T</sup> = <span>{rR}</span>',
    s0hint: 'T 是采样周期：采得越快（T 越小），e<sup>σT</sup> 越贴近 1，所有落点都往单位圆边上挤——离散系统越来越像它连续的原版（第 5 步细看）。反过来 T 越大，卷得越狠，左半平面的点被压得越靠圆心。还有个伏笔：纵轴方向是「每 2π/T 卷一整圈」——s 平面里相距 2π/T 的两个点，会落到同一个 z 上（第 5 步的孪生点、第 1 步的频率折返，都是这件事）。',
    cvSPlane: 's 平面（连续）', cvZPlane: 'z 平面（离散）',
    cvUnit: '单位圆 |z| = 1',
    cvFamAxis: '虚轴上的点 σ = 0', cvFamL: 'σ = −1.2（左半平面）', cvFamR: 'σ = +0.8（右半平面）',

    s1k: '第 1 步 · 点即序列',
    s1t: '一个点，就是一段序列',
    s1e: '在 z 平面里随手放一个点 z = r·e<sup>jΩ</sup>，它立刻对应一段序列 x[n] = r<sup>n</sup>·cos(Ωn)：<strong>半径 r 管涨缩</strong>——每走一步乘一个 r，r < 1 一步步衰死、r = 1 不衰不涨、r > 1 涨爆；<strong>角度 Ω 管振荡快慢</strong>——每步转 Ω 弧度。拖点、或拖下面的滑杆，都一样。再盯住 Ω 滑杆：把它拖过 π 继续往 2π 走——波形不会变得更快，反而<strong>折返</strong>变慢：Ω 和 2π − Ω 给出逐点完全相同的序列。数字频率的有效范围只有一圈，超出的部分全是别名（这正是第 0 步「每 2π 卷一圈」在时域里的脸）。',
    s1formula: 'z = r·e^{jΩ} → x[n] = rⁿ·cos(Ωn)',
    s1rLab: 'r = |z| · 管涨缩',
    s1oLab: 'Ω · 数字频率（0 到 2π 一整圈）',
    s1ro: 'r = <span>{r}</span> · Ω = <span>{om}</span> rad（{omPi}π）· 点 z = <span>{re}</span> {imSign} j·<span>{im}</span> · 有效频率 Ω′ = <span>{eff}</span> rad · 状态：<b>{verdict}</b> · x[0] = {x0}，x[1] = {x1}，x[10] = {x10}',
    s1vDecay: '衰减——r < 1，包络 rⁿ 一步步压扁',
    s1vEqual: '等幅——r = 1，永远振下去',
    s1vGrow: '增长——r > 1，涨出画框（已钳制，读数为真值）',
    s1alias: '别名提醒：你拨的 Ω = {om} 已超过 π。序列与 Ω″ = 2π − Ω = {alias} 的序列逐点相同（余弦是偶函数），也与 Ω + 2π 的序列逐点相同——数字频率只认一圈，多转的整圈和折返的镜像都不产生新序列。对账接口 ZT.aliasMaxDiff 可以逐点验。（「逐点相同」是数学恒等式；浮点逐点验算的相对差在 1e-13 量级以内。）',
    s1hint: '和拉普拉斯页第 0 步对照着看：那边 σ 管生死、ω 管快慢，是两个独立的旋钮；这边离散世界把两件事打包进<strong>一个点的位置</strong>——离圆心多远定生死，绕圆心多斜定快慢。这就是为什么 Z 变换的图永远画在圆上：圆内、圆上、圆外，就是离散系统的生死簿。',
    cvSeq: 'x[n] = rⁿ·cos(Ωn)（茎状图）',
    cvDrag: '拖我',
    cvClip: '超出 ±3.2 已钳制（真值见读数）',

    s2k: '第 2 步 · 求和现场',
    s2t: 'X(z) 不是公式，是一串加法收不收得住',
    s2e: 'Z 变换的定义就是一个无穷求和：X(z) = Σ<sub>n≥0</sub> x[n]·z<sup>−n</sup>。拿最经典的序列 x[n] = a<sup>n</sup>u[n] 开刀：在 z 平面里放一颗探针，然后<strong>当着你的面一项一项往上加</strong>——右边画的是部分和 S<sub>N</sub> 在复平面里的落点轨迹。每加一项，落点跳一步：比值 q = a/z 决定命运：|q| < 1，每步跳幅按 |q| 缩小，轨迹螺旋收进极限 z/(z−a)；|q| > 1，每步跳得更远，轨迹一路跑飞。S<sub>N</sub> 是页面逐项真加出来的，不是拿闭式冒充的——误差 |S<sub>N</sub> − 极限| 与 |q|<sup>N+1</sup>/|1 − q| 分毫不差（读数里两个数并排，自己对）。',
    s2formula: 'X(z) = Σₙ aⁿz⁻ⁿ = 1 / (1 − a·z⁻¹)，部分和 S_N = Σ_{n=0}^{N} (a/z)ⁿ',
    s2aLab: 'a · 序列 aⁿu[n] 的底',
    s2add1: '加一项（N+1）', s2add20: '连加 20 项', s2run: '跑到 N = 300', s2reset: '重置 N = 0',
    s2roConv: 'a = {a} · 探针 z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z，|q| = <span>{qmod}</span> &lt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · 极限 z/(z−a) = {lre} {lImSign} j·{lim} · |S<sub>N</sub> − 极限| = <span>{err}</span>（公式预言 |q|<sup>N+1</sup>/|1−q| = {errPred}）',
    s2roDiv: 'a = {a} · 探针 z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z，|q| = <span>{qmod}</span> &gt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · 每加一项跳幅 ×|q|，和<strong>发散</strong>——这个 z 不在收敛域里',
    s2roBnd: 'a = {a} · 探针 z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · |q| = <span>{qmod}</span> = 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · 每一项的模恒为 1、永不衰减，部分和只会原地绕圈或直线走开——<b>边界不收敛</b>',
    s2roSing: 'a = {a} · 探针正压在极点 z = a 上：q = 1，每一项都是 1，S<sub>N</sub> = N + 1 = <span>{sn}</span> 一路直线涨——极点就是求和彻底收不住的地方',
    s2hint: '把探针拖着横穿虚线圆 |z| = |a|：里侧发散、外侧收敛，这条圆就是这个变换的<strong>收敛域边界</strong>。再把 a 拖成负数试试：序列变成正负交替的 (±|a|)<sup>n</sup>，收敛域仍是 |z| > |a| 的圆外——收敛只看模长，不看符号。下一站把这条边界正式命名：ROC。',
    cvProbe: '探针 z', cvLimit: '极限 z/(z−a)', cvBnd: '边界 |z| = |a|',
    cvSumsT: '部分和 S_N 的落点轨迹（每点 = 多加一项）',

    s3k: '第 3 步 · 圆环 ROC',
    s3t: '同一个式子，圆内圆外两个信号',
    s3e: '拉普拉斯页第 3 步的续集：那边两个信号共用一个式子、ROC 一左一右；这边一模一样。因果序列 a<sup>n</sup>u[n] 活在 n ≥ 0，它的和 Σa<sup>n</sup>z<sup>−n</sup> 要 |z| > |a| 才收得住；左边序列 −a<sup>n</sup>u[−n−1] 活在 n ≤ −1，把下标翻过来，它的和 Σ(z/a)<sup>m</sup> 要 |z| &lt; |a| 才收得住。<strong>代数式都是 z/(z−a)</strong>，区别只在 ROC 一个在圆外、一个在圆内。切换序列看阴影翻面，拖探针逐点验：判定走的就是第 2 步的真求和比值，边界 |z| = |a| 上如实报「不收敛」。',
    s3formula: '两个序列的 X(z) 都是 z / (z − a) —— 式子相同，ROC 不同',
    s3btnC: '因果 · aⁿu[n]（活在 n ≥ 0）',
    s3btnL: '左边 · −aⁿu[−n−1]（活在 n ≤ −1）',
    s3curC: '因果序列 aⁿu[n]', s3curL: '左边序列 −aⁿu[−n−1]',
    s3aLab: 'a（两序列共用，极点在 z = a）',
    s3ro: '当前序列：<b>{cur}</b> · a = {a} · 探针 |z| = <span>{zmod}</span> · 对当前序列：<b>{verdict}</b> · 稳定性：ROC {rocTxt} 单位圆 → <b>{stable}</b>',
    s3in: '收敛 ✓（在 ROC 内）', s3out: '发散 ✗（在 ROC 外）', s3bnd: '恰在边界 |z| = |a|：项不衰减，不收敛',
    s3rocHas: '包含', s3rocMiss: '不包含',
    s3stable: '稳定', s3unstable: '不稳定',
    s3hint: '稳定性的判据还是那句：<strong>ROC 包含单位圆 ⟺ 系统稳定</strong>（对应拉普拉斯那边的「ROC 包含虚轴」）。所以因果序列要 a &lt; 1 才稳定，左边序列反过来要 a > 1 才稳定——把 a 拖过 1，两边的稳定性正好交换。注意 a 恰为 1 时：ROC 边界就是单位圆本身，圆不在 ROC 里（收敛域是开的），两边都不稳定，别被「贴着」骗了。',
    s3linkTxt: '和拉普拉斯页第 3 步摆一起看：那边 ROC 是竖条带（σ > −a 或 σ < −a），这边卷成了圆环（|z| > |a| 或 |z| &lt; |a|)——形状变了，规矩一字没变：式子必须带 ROC 才算说完，稳定看 ROC 包不包住那条「傅里叶住的线」。那边是虚轴，这边是单位圆 →',
    s3lkL: '拉普拉斯与 ROC →',
    cvRocOut: 'ROC：|z| > a（圆外）', cvRocIn: 'ROC：|z| < a（圆内）',
    cvTimeC: 'aⁿu[n]', cvTimeL: '−aⁿu[−n−1]',

    s4k: '第 4 步 · 极点与圆',
    s4t: '圆内活、圆上鸣、圆外炸',
    s4e: '把二阶系统搬进 z 平面：H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>))，一对共轭极点 p = r·e<sup>±jθ</sup>。拖动上半平面那颗（下半颗是它的镜像）：右边冲激响应 h[n] = r<sup>n</sup>·sin((n+1)θ)/sin θ 实时重画（闭式逐点算），灰色虚线是<strong>包络 ±E[n]，E[n] = r<sup>n</sup>/|sin θ|</strong>——波形峰值正好贴着它。下面第三张图的频响 |H(e<sup>jΩ</sup>)|，是把 z = e<sup>jΩ</sup> 沿单位圆代回 H(z) 逐点真算的：极点越贴圆，θ 处的峰越尖、h[n] 的尾巴拖得越长——同一件事的三个侧面。',
    s4formula: 'H(z) = 1 / ((1 − pz⁻¹)(1 − p̄z⁻¹))，p = r·e^{jθ} → h[n] = rⁿ·sin((n+1)θ) / sin θ',
    s4p1: '圆内深处 · 闷', s4p2: '贴着圆 · 共振', s4p3: '圆外 · 炸',
    s4ro: '极点 p = <span>{pre}</span> {imSign} j·<span>{pim}</span>（r = <span>{r}</span>，θ = <span>{th}</span> rad）· 状态：<b>{verdict}</b> · 频响峰在 Ω = <span>{peakOm}</span> rad 处、峰值 <span>{peakVal}</span>（θ = {th}，峰位与极点角对照着看）· h[10] = {h10}，包络 E[10] = {e10}',
    s4vStable: '稳定——r < 1，响应衰减归零',
    s4vMarginal: '临界——r = 1，振荡不衰也不涨（包络恒定）',
    s4vUnstable: '不稳定——r > 1，响应涨爆（纵轴自动放大）',
    s4vGrowLin: '不稳定——r = 1 且为重根（θ = 0 或 π），包络随 n 线性增长',
    s4peakInf: '∞（极点就在单位圆上，奇异）',
    s4note: '口径：归一化取 H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>))，此时 h[n] = r<sup>n</sup>sin((n+1)θ)/sin θ、包络 E[n] = r<sup>n</sup>/|sin θ|（峰值恰贴包络，评审可抽 n 复算）。极点被拖到实轴上时（θ = 0 或 π）两极点重合，h[n] 改走重根闭式 (n+1)·p<sup>n</sup>、包络 (n+1)·r<sup>n</sup>。频响峰位是页面在 Ω ∈ [0, π] 的细网格上真算 |H(e<sup>jΩ</sup>)| 取的最大值位置，不是手画的——它与 θ 的微小偏差如实呈现（有限高峰的峰位本就略偏离极点角，r 越贴圆偏得越小）。',
    s4hint: '手感练习：选「贴着圆」预置，盯着频响峰，再把极点沿径向往里拖一点点——峰立刻塌下去、h[n] 的尾巴立刻变短。数字滤波器就是这样工作的：想放大哪个频率，就把极点贴到单位圆上那个角度旁边（第 6 步亲手听）。另外把 θ 拖到贴近 0：振荡慢到几乎成了纯涨缩——极点的角度就是振荡的数字频率，和第 1 步的 Ω 是同一个量。',
    cvEnv: '包络 ±E[n]', cvImp: '冲激响应 h[n]',
    cvResp: '|H(e^{jΩ})| —— z 沿单位圆代回 H(z)', cvPeak: '峰', cvClipResp: '峰顶已贴近纵轴上限 · 精确峰值见读数',
    cvDrag: '拖我',

    s5k: '第 5 步 · 对表',
    s5t: 'T 决定卷得多紧，条带决定丢了谁',
    s5e: "左边拖动一个σ&lt;0的极点 s=σ+jω，右边显示指数模态的采样映射 z=e^{sT}：|z|=e^{σT}、角度Ω=ωT。此步约定 T 以秒计，σ单位s⁻¹，ω单位rad/s；Ω是每个样本的相角增量。主条带 −π/T&lt;ω≤π/T 沿虚部ω方向宽2π/T，对应一周不重复角度；本图限定σ&lt;0，所以像在单位圆内，不代表画出了整个z平面。打开孪生点，看ω相差±2π/T时映射重合；仅靠样本不能识别这类频率。",
    s5tLab: "T · 采样周期（s）",
    s5twinBtn: '显示隔壁条带的孪生点', s5twinBtnOff: '隐藏孪生点',
    s5ro: "极点 s = <span>{sre}</span> {imSign} j·<span>{sim}</span>（σ:s⁻¹，ω:rad/s）· T = {T} s · 像 z = e<sup>sT</sup> = <span>{zre}</span> {zImSign} j·<span>{zim}</span> · |z| = e<sup>σT</sup> = <span>{zmod}</span> · 角度增量 Ω = ωT = <span>{ang}</span> rad/样本{twinTxt}",
    s5twinTxt: ' · 孪生点 s′ = {sre} {imSign} j·{sim2}（ω + 2π/T）：|z′| = {zmod}、角度 ω′T = {ang2} rad ≡ {ang}（mod 2π）——同一个像',
    s5twinTxtM: ' · 孪生点 s″ = {sre} {imSign} j·{sim3}（ω − 2π/T）：|z″| = {zmod}、角度 ω″T = {ang3} rad ≡ {ang}（mod 2π）——同一个像',
    s5twinOff: ' · 孪生点 ω ± 2π/T 已出本图范围（T 小则条带宽，一屏装不下相邻两条带）',
    s5hint: "单位对照：fₛ=1/T，采样页的复制间距是 fₛ Hz；换成角频率就是2π/T rad/s，不是两个不同结果。连续 f Hz 对应 ω=2πf rad/s，采样后数字 Ω=ωT=2πf/fₛ rad/样本（模2π）。已知理想带限且 |ω|&lt;π/T 时才有基带唯一性；本图的极点模态映射不是整台模拟系统的通用离散化传递函数。",
    s5linkTxt: '采样页里混叠是「假波」：频率太高、采样太懒，高频装成低频混进来。在这页看得更清楚：它根本不是「装」，是卷的时候<strong>真的落到了同一个点上</strong>——z 平面分不清它们，就像钟表分不清 3 点和 15 点 →',
    s5lkS: '采样与混叠 →',
    cvStrip: "主条带 −π/T<ω≤π/T", cvTwin: '孪生点', cvImage: '像 z = e^{sT}',
    cvSPole: '极点 s', cvAxis: '虚轴 jω',

    s6k: '第 6 步 · 终章',
    s6t: '单位圆，是数字世界的虚轴',
    s6e: '收束成一张表：连续世界的每样东西，在离散世界都有一个住在圆上的对应。虚轴卷成单位圆——所以<strong>「沿单位圆求值」就是离散世界的傅里叶变换</strong>（DTFT)：z = e<sup>jΩ</sup> 在圆上走一圈，Ω 从 0 到 2π，恰好一圈走完所有数字频率。左半平面卷成圆内——所以稳定性从「极点在左」变成「极点在圆内」。判据、直觉、连手感都一一对应，只有地图的形状从平的变成了卷的。',
    tbItem: '对照', tbS: 's 平面（连续 · 拉普拉斯）', tbZ: 'z 平面（离散 · Z 变换）',
    tbR1c: '傅里叶住哪', tbR1s: '虚轴 σ = 0 这条线', tbR1z: '<b>单位圆</b> |z| = 1 这条圈',
    tbR2c: '稳定的家', tbR2s: '左半平面 σ &lt; 0', tbR2z: '<b>圆内</b> |z| &lt; 1',
    tbR3c: '稳定判据', tbR3s: 'ROC 包含虚轴', tbR3z: 'ROC 包含<b>单位圆</b>',
    tbR4c: '极点离边界越远', tbR4s: '衰减越快、越稳', tbR4z: '衰减越快、越稳（一字不差）',
    s6rt: '收官演示：一台能拖的共振器',
    s6re: '把第 4 步的极点装进一台真滤波器：输入是 5 个纯音叠在一起（300 / 700 / 1200 / 1900 / 2700 Hz，采样率 8000 Hz），滤波器就是 H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>))，声音是它逐样点真算出来的（差分方程，不是画出来的假音）。在左图里拖极点选共振角度，r 滑杆决定共振有多尖：极点贴着圆、压在哪个音的角度上，哪个音就被轰然放大。右图的谱线是各音的真实增益（|H(e<sup>jΩ</sup>)| 逐点真算，显示按最大值归一，真实倍数看读数）。先听原声，再听过滤后的——耳朵会替你验算。',
    s6rLab: 'r · 极点离圆多近（共振多尖）',
    s6playDry: '▶ 听原声（5 个音叠在一起）', s6playWet: '▶ 听过滤波之后',
    s6ro: '极点角 θ = <span>{th}</span> rad → 共振频率 f = θ·f<sub>s</sub>/(2π) = <span>{fres}</span> Hz · r = <span>{r}</span> · 五个音的增益（倍）：{gains} · 最大增益在 Ω = {peakOm} 处为 {peakVal} 倍',
    s6tone: '{f} Hz：×{g}',
    s6note: '声音礼仪（沿用采样页）：默认静默，点按钮才建 AudioContext 播放；滤波逐样点走差分方程 y[n] = x[n] + 2r·cosθ·y[n−1] − r²·y[n−2] 真算，播放前做峰值归一防爆音、增益保守；播放首尾另加 15 ms 淡入、20 ms 淡出，短音起止不咔哒。r 在本步上限 0.99——真贴到圆上（r = 1）滤波器会自激振荡，那是第 4 步「圆上鸣」的另一面。谱线增益与读数都由同一个 respAt 函数真算，和第 4 步的频响同一口径。',
    s6fin: '从转圈的点，到卷起来的平面——这条信号补课线的地图，到这里拼完了：三角函数页那个转圈的点是 Ω 的第一次出场，傅里叶把圆转成了波，采样把波切成了点，拉普拉斯给频率配上了寿命，Z 变换把整张平面卷回一个圆。五页，一张图。下次在教材里看到单位圆，先想起今天这台共振器：<strong>圆上的每个角度，都住着一种频率；圆内圆外，就是生与死。</strong>',
    s6linksLab: '这条补课线，从这里回头看：',
    s6lkT: '三角函数：圆的第一次出场 →', s6lkF: '傅里叶变换 →', s6lkL: '拉普拉斯与 ROC →', s6lkS: '采样与混叠 →',
    cvStableIn: '圆内 = 稳定的家', cvOnCirc: '圆上 = 傅里叶（DTFT）住的圈',
    cvIn6: '5 个输入音的角度', cvOut6: '过滤后（按最大值归一）',
    cvResp6: '|H(e^{jΩ})|'
  },
  en: {
    docTitle: 'The Z-Transform · Rolling the s-Plane into the Unit Circle · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Z-Transform · The Unit Circle',
    tagline: 'In the finale of the Laplace page, a point slid along the imaginary axis and its image always landed on one circle — that was no Easter egg; it was the entire map of the discrete world. Discrete signals have no continuous time, so their transform does not live on a plane — it lives on a circle: roll the s-plane up by z = e^{sT} and the left half-plane lands inside the unit circle, the axis becomes the circumference, ROCs become annuli, and stability becomes a single sentence.',
    nav0: '0 Roll the plane', nav1: '1 A point is a sequence', nav2: '2 Summation, live', nav3: '3 Annular ROC',
    nav4: '4 Poles & the circle', nav5: '5 Facing Laplace', nav6: '6 Finale · Resonator',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Z-Transform — one interaction per step series',

    s0k: 'Step 0 · The hook',
    s0t: 'Roll the plane up',
    s0e: 'Turning a continuous signal x(t) into a discrete one x[n] takes a single step: sample it every T seconds. The transform follows suit: replace Laplace’s s by z = e<sup>sT</sup> and you get the <strong>Z-transform</strong>. This exponential map <strong>rolls the whole s-plane up</strong>: below, a family of points is flying along z = e<sup>sT</sup> from the s-plane on the left to the z-plane on the right — the cyan points stood on the imaginary axis and land exactly on the <strong>unit circle</strong>; the green ones sat in the left half-plane (σ = −1.2) and land inside the circle; the pink ones sat in the right half-plane (σ = +0.8) and land outside. Memorize those three sentences; the whole page is them.',
    s0tLab: 'T · sampling period (stated openly in every step)',
    s0pause: 'Pause', s0play: 'Play',
    s0trails: 'Show flight paths',
    s0ro: 'T = <span>{T}</span> · points on the axis → radius <span>1</span> (the unit circle) · left column σ = −1.2 → radius e<sup>−1.2T</sup> = <span>{rL}</span> · right column σ = +0.8 → radius e<sup>0.8T</sup> = <span>{rR}</span>',
    s0hint: 'T is the sampling period: sample faster (smaller T) and e<sup>σT</sup> hugs 1, so every landing point crowds toward the unit circle — the discrete system looks more and more like its continuous original (step 5 zooms in on this). Larger T rolls harder and squeezes left-half-plane points toward the center. One more seed planted: vertically, the plane wraps once every 2π/T — two s-points 2π/T apart land on the very same z (the twin point of step 5 and the frequency fold-back of step 1 are both this fact).',
    cvSPlane: 's-plane (continuous)', cvZPlane: 'z-plane (discrete)',
    cvUnit: 'unit circle |z| = 1',
    cvFamAxis: 'on the axis, σ = 0', cvFamL: 'σ = −1.2 (left half-plane)', cvFamR: 'σ = +0.8 (right half-plane)',

    s1k: 'Step 1 · A point is a sequence',
    s1t: 'One point is one whole sequence',
    s1e: 'Drop a point z = r·e<sup>jΩ</sup> anywhere in the z-plane and it immediately spells a sequence x[n] = r<sup>n</sup>·cos(Ωn): the <strong>radius r runs growth and decay</strong> — each step multiplies by r, so r &lt; 1 dies step by step, r = 1 holds forever, r &gt; 1 blows up; the <strong>angle Ω runs the oscillation rate</strong> — each step turns by Ω radians. Drag the point, or the sliders below — same thing. Now watch the Ω slider: push it past π toward 2π and the waveform does not speed up — it <strong>folds back</strong> and slows down: Ω and 2π − Ω produce sequences that agree sample by sample. Digital frequency has exactly one revolution of range; everything beyond is an alias (this is step 0’s “one wrap every 2π” seen from the time side).',
    s1formula: 'z = r·e^{jΩ} → x[n] = rⁿ·cos(Ωn)',
    s1rLab: 'r = |z| · growth / decay',
    s1oLab: 'Ω · digital frequency (one full turn, 0 to 2π)',
    s1ro: 'r = <span>{r}</span> · Ω = <span>{om}</span> rad ({omPi}π) · point z = <span>{re}</span> {imSign} j·<span>{im}</span> · effective frequency Ω′ = <span>{eff}</span> rad · state: <b>{verdict}</b> · x[0] = {x0}, x[1] = {x1}, x[10] = {x10}',
    s1vDecay: 'decaying — r < 1, the envelope rⁿ flattens it step by step',
    s1vEqual: 'constant — r = 1, it rings forever',
    s1vGrow: 'growing — r > 1, out of the frame (clamped; readout is exact)',
    s1alias: 'Alias alert: the Ω = {om} you dialed is past π. Its sequence is identical, sample by sample, to the one for Ω″ = 2π − Ω = {alias} (cosine is even), and also to the one for Ω + 2π — digital frequency recognizes a single revolution; whole extra turns and mirror folds create no new sequences. The audit hook ZT.aliasMaxDiff can check this point by point. (“Identical point by point” is a mathematical identity; floating-point checks agree to a relative difference within ~1e-13.)',
    s1hint: 'Compare with step 0 of the Laplace page: there, σ ran life-and-death and ω ran speed — two independent knobs. Here the discrete world packs both into <strong>the position of a single point</strong>: distance from the center decides survival, angle around the center decides speed. That is why every Z-transform picture is drawn around a circle: inside, on, or outside the circle is the discrete system’s book of life and death.',
    cvSeq: 'x[n] = rⁿ·cos(Ωn) (stem plot)',
    cvDrag: 'drag me',
    cvClip: 'beyond ±3.2, clamped (see readout for true values)',

    s2k: 'Step 2 · Summation, live',
    s2t: 'X(z) is not a formula — it is a sum that either settles or does not',
    s2e: 'The Z-transform is defined as an infinite sum: X(z) = Σ<sub>n≥0</sub> x[n]·z<sup>−n</sup>. Take the classic sequence x[n] = a<sup>n</sup>u[n]: park a probe in the z-plane and <strong>add the terms one by one, in front of you</strong> — the right panel plots where the partial sum S<sub>N</sub> lands in the complex plane. Each new term hops the landing point once more: the ratio q = a/z decides its fate. If |q| &lt; 1, each hop shrinks by |q| and the trail spirals into the limit z/(z−a); if |q| &gt; 1, each hop reaches farther and the trail runs away. S<sub>N</sub> is genuinely added term by term on this page, never faked by the closed form — the error |S<sub>N</sub> − limit| matches |q|<sup>N+1</sup>/|1 − q| to the last digit (both numbers sit side by side in the readout; check them).',
    s2formula: 'X(z) = Σₙ aⁿz⁻ⁿ = 1 / (1 − a·z⁻¹), partial sum S_N = Σ_{n=0}^{N} (a/z)ⁿ',
    s2aLab: 'a · base of the sequence aⁿu[n]',
    s2add1: 'Add one term (N+1)', s2add20: 'Add 20 terms', s2run: 'Run to N = 300', s2reset: 'Reset N = 0',
    s2roConv: 'a = {a} · probe z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z, |q| = <span>{qmod}</span> &lt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · limit z/(z−a) = {lre} {lImSign} j·{lim} · |S<sub>N</sub> − limit| = <span>{err}</span> (formula predicts |q|<sup>N+1</sup>/|1−q| = {errPred})',
    s2roDiv: 'a = {a} · probe z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · q = a/z, |q| = <span>{qmod}</span> &gt; 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · each term hops ×|q| farther — the sum <strong>diverges</strong>; this z is outside the region of convergence',
    s2roBnd: 'a = {a} · probe z = <span>{zre}</span> {imSign} j·<span>{zim}</span> · |q| = <span>{qmod}</span> = 1 · N = {N} · S<sub>N</sub> = <span>{sre}</span> {sImSign} j·<span>{sim}</span> · every term has modulus exactly 1 and never decays; the partial sums just walk in circles or in a straight line — <b>no convergence on the boundary</b>',
    s2roSing: 'a = {a} · the probe sits exactly on the pole z = a: q = 1, every term is 1, and S<sub>N</sub> = N + 1 = <span>{sn}</span> grows in a straight line — a pole is where the sum gives up entirely',
    s2hint: 'Drag the probe across the dashed circle |z| = |a|: divergent inside, convergent outside — that circle is this transform’s <strong>region-of-convergence boundary</strong>. Now drag a negative: the sequence alternates sign, (±|a|)<sup>n</sup>, yet the ROC is still the outside of |z| = |a| — convergence only ever looks at magnitudes, never signs. Next step gives the boundary its official name: the ROC.',
    cvProbe: 'probe z', cvLimit: 'limit z/(z−a)', cvBnd: 'boundary |z| = |a|',
    cvSumsT: 'where the partial sums S_N land (one per term)',

    s3k: 'Step 3 · Annular ROC',
    s3t: 'One formula, two signals — inside and outside the circle',
    s3e: 'The sequel to step 3 of the Laplace page: there, two signals shared one formula with ROCs on opposite sides; here it is exactly the same play. The causal sequence a<sup>n</sup>u[n] lives on n ≥ 0, and its sum Σa<sup>n</sup>z<sup>−n</sup> only settles when |z| &gt; |a|; the left-sided sequence −a<sup>n</sup>u[−n−1] lives on n ≤ −1, and flipping its index shows its sum Σ(z/a)<sup>m</sup> only settles when |z| &lt; |a|. <strong>Both have the same algebra: z/(z−a)</strong> — the only difference is an ROC outside the circle versus inside it. Switch sequences and watch the shading flip; drag the probe and test it point by point: the verdict uses the very ratio test of step 2’s live summation, and on the boundary |z| = |a| it honestly reports “no convergence”.',
    s3formula: 'Both sequences have X(z) = z / (z − a) — same formula, different ROC',
    s3btnC: 'Causal · aⁿu[n] (lives on n ≥ 0)',
    s3btnL: 'Left-sided · −aⁿu[−n−1] (lives on n ≤ −1)',
    s3curC: 'causal sequence aⁿu[n]', s3curL: 'left-sided sequence −aⁿu[−n−1]',
    s3aLab: 'a (shared; the pole sits at z = a)',
    s3ro: 'Current sequence: <b>{cur}</b> · a = {a} · probe |z| = <span>{zmod}</span> · for this sequence: <b>{verdict}</b> · stability: the ROC {rocTxt} the unit circle → <b>{stable}</b>',
    s3in: 'converges ✓ (inside the ROC)', s3out: 'diverges ✗ (outside the ROC)', s3bnd: 'exactly on the boundary |z| = |a|: terms never decay — no convergence',
    s3rocHas: 'contains', s3rocMiss: 'does not contain',
    s3stable: 'stable', s3unstable: 'unstable',
    s3hint: 'The stability rule is still the same sentence: <strong>ROC contains the unit circle ⟺ the system is stable</strong> (the Laplace twin of “ROC contains the imaginary axis”). So the causal sequence is stable only when a &lt; 1, the left-sided one only when a &gt; 1 — drag a across 1 and the two stabilities swap. And when a is exactly 1, the ROC boundary is the unit circle itself, and the circle is not part of the (open) ROC: neither side is stable. Do not let “touching” fool you.',
    s3linkTxt: 'Set this beside step 3 of the Laplace page: there the ROC was a vertical strip (σ > −a or σ < −a); here it has rolled into an annulus (|z| > |a| or |z| &lt; |a|). The shape changed; the rules did not change by one word: a formula without its ROC is an unfinished sentence, and stability asks whether the ROC encloses the line where Fourier lives. There it was the axis; here it is the unit circle →',
    s3lkL: 'Laplace & the ROC →',
    cvRocOut: 'ROC: |z| > a (outside)', cvRocIn: 'ROC: |z| < a (inside)',
    cvTimeC: 'aⁿu[n]', cvTimeL: '−aⁿu[−n−1]',

    s4k: 'Step 4 · Poles & the circle',
    s4t: 'Inside it lives, on it it rings, outside it blows up',
    s4e: 'Move a second-order system into the z-plane: H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>)) with a conjugate pole pair p = r·e<sup>±jθ</sup>. Drag the upper pole (the lower one is its mirror): on the right, the impulse response h[n] = r<sup>n</sup>·sin((n+1)θ)/sin θ redraws in real time (closed form, point by point), and the grey dashed curve is the <strong>envelope ±E[n] with E[n] = r<sup>n</sup>/|sin θ|</strong> — the waveform’s peaks kiss it exactly. The third plot, the frequency response |H(e<sup>jΩ</sup>)|, is computed by honestly substituting z = e<sup>jΩ</sup> around the unit circle back into H(z): the closer the pole rides to the circle, the sharper the peak at θ and the longer h[n]’s tail — three views of one and the same fact.',
    s4formula: 'H(z) = 1 / ((1 − pz⁻¹)(1 − p̄z⁻¹)), p = r·e^{jθ} → h[n] = rⁿ·sin((n+1)θ) / sin θ',
    s4p1: 'Deep inside · dull', s4p2: 'Hugging the circle · resonance', s4p3: 'Outside · blow-up',
    s4ro: 'pole p = <span>{pre}</span> {imSign} j·<span>{pim}</span> (r = <span>{r}</span>, θ = <span>{th}</span> rad) · state: <b>{verdict}</b> · response peak at Ω = <span>{peakOm}</span> rad with value <span>{peakVal}</span> (θ = {th} — compare peak position with pole angle) · h[10] = {h10}, envelope E[10] = {e10}',
    s4vStable: 'stable — r < 1, the response decays to zero',
    s4vMarginal: 'marginal — r = 1, oscillation that neither decays nor grows (constant envelope)',
    s4vUnstable: 'unstable — r > 1, the response blows up (axis auto-zooms)',
    s4vGrowLin: 'unstable — r = 1 with a repeated pole (θ = 0 or π): the envelope grows linearly with n',
    s4peakInf: '∞ (pole exactly on the unit circle — singular)',
    s4note: 'Conventions, openly: with the normalization H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>)), h[n] = r<sup>n</sup>sin((n+1)θ)/sin θ and the envelope is E[n] = r<sup>n</sup>/|sin θ| (peaks touch it exactly — spot-check any n). When a pole is dragged onto the real axis (θ = 0 or π) the two poles coincide and h[n] switches to the repeated-root closed form (n+1)·p<sup>n</sup> with envelope (n+1)·r<sup>n</sup>. The peak position is found by actually evaluating |H(e<sup>jΩ</sup>)| on a fine grid over Ω ∈ [0, π] — not drawn by hand; its small offset from θ is shown honestly (a finite-height peak always sits slightly off the pole angle, and the offset shrinks as r approaches the circle).',
    s4hint: 'Get the feel: pick the “hugging the circle” preset, stare at the response peak, then drag the pole a hair inward — the peak collapses at once and h[n]’s tail shortens. That is literally how digital filters work: to amplify a frequency, park a pole next to that angle on the unit circle (in step 6 you will hear it). Also drag θ close to 0: the oscillation slows until it is nearly pure growth-and-decay — the pole’s angle is the oscillation’s digital frequency, the very same quantity as Ω in step 1.',
    cvEnv: 'envelope ±E[n]', cvImp: 'impulse response h[n]',
    cvResp: '|H(e^{jΩ})| — H(z) evaluated on the unit circle', cvPeak: 'peak', cvClipResp: 'peak near the top of the axis · exact peak in the readout',
    cvDrag: 'drag me',

    s5k: 'Step 5 · Facing Laplace',
    s5t: 'T sets the tightness of the roll; the strips decide what is lost',
    s5e: "Drag a pole s=σ+jω with σ&lt;0 and inspect the sampled exponential mode z=e^{sT}: |z|=e^{σT}, angleΩ=ωT. Here T is in seconds, σ in s⁻¹ and ω in rad/s; Ω is the angle increment per sample. The principal strip −π/T&lt;ω≤π/T spans 2π/T along the imaginary-frequency direction and gives one nonrepeating turn. This drawing restricts σ&lt;0, so its images lie inside the unit circle; it does not depict the whole z-plane. Turn on twins to see equal mappings for ω separated by ±2π/T. Samples alone cannot distinguish these frequencies.",
    s5tLab: "T · sampling period (s)",
    s5twinBtn: 'Show the twin from the next strip', s5twinBtnOff: 'Hide the twin',
    s5ro: "pole s = <span>{sre}</span> {imSign} j·<span>{sim}</span> (σ:s⁻¹, ω:rad/s) · T = {T} s · image z = e<sup>sT</sup> = <span>{zre}</span> {zImSign} j·<span>{zim}</span> · |z| = e<sup>σT</sup> = <span>{zmod}</span> · angle increment Ω = ωT = <span>{ang}</span> rad/sample{twinTxt}",
    s5twinTxt: ' · twin s′ = {sre} {imSign} j·{sim2} (ω + 2π/T): |z′| = {zmod}, angle ω′T = {ang2} rad ≡ {ang} (mod 2π) — the same image',
    s5twinTxtM: ' · twin s″ = {sre} {imSign} j·{sim3} (ω − 2π/T): |z″| = {zmod}, angle ω″T = {ang3} rad ≡ {ang} (mod 2π) — the same image',
    s5twinOff: ' · the twin at ω ± 2π/T lies outside this picture (small T makes strips so wide that two of them do not fit on one screen)',
    s5hint: "Units: fₛ=1/T. The sampling page’s copy spacing is fₛ Hz, or 2π/T rad/s after conversion; these are the same spacing in different units. Continuous f Hz gives ω=2πf rad/s and sampled digital Ω=ωT=2πf/fₛ rad/sample (mod 2π). Baseband uniqueness needs a known ideal bandlimit with |ω|&lt;π/T. This pole-mode map is not a general discretized transfer function for an entire analog system.",
    s5linkTxt: 'On the sampling page, aliasing was “fake waves”: sample too lazily and high frequencies sneak in disguised as low ones. From this page it is clearer: there is no disguise — when the plane rolls up they <strong>genuinely land on the same point</strong>, and the z-plane cannot tell them apart, just as a clock cannot tell 3 o’clock from 15 o’clock →',
    s5lkS: 'Sampling & aliasing →',
    cvStrip: "principal strip −π/T<ω≤π/T", cvTwin: 'twin', cvImage: 'image z = e^{sT}',
    cvSPole: 'pole s', cvAxis: 'axis jω',

    s6k: 'Step 6 · Finale',
    s6t: 'The unit circle is the discrete world’s imaginary axis',
    s6e: 'Gather it into one table: everything in the continuous world has a counterpart living on the circle in the discrete one. The axis rolls into the unit circle — which is why <strong>“evaluating on the unit circle” is the discrete world’s Fourier transform</strong> (the DTFT): z = e<sup>jΩ</sup> walks once around the circle, Ω goes from 0 to 2π, and exactly one revolution covers every digital frequency. The left half-plane rolls into the disk — so stability turns from “poles on the left” into “poles inside the circle”. Rules, intuition, even the feel carry over one to one; only the map changed shape, from flat to rolled.',
    tbItem: 'Item', tbS: 's-plane (continuous · Laplace)', tbZ: 'z-plane (discrete · Z-transform)',
    tbR1c: 'Where Fourier lives', tbR1s: 'the line σ = 0, the imaginary axis', tbR1z: 'the <b>unit circle</b> |z| = 1',
    tbR2c: 'Home of stability', tbR2s: 'left half-plane, σ &lt; 0', tbR2z: 'the <b>inside of the circle</b>, |z| &lt; 1',
    tbR3c: 'Stability test', tbR3s: 'ROC contains the axis', tbR3z: 'ROC contains the <b>unit circle</b>',
    tbR4c: 'Pole farther from the border', tbR4s: 'faster decay, steadier system', tbR4z: 'faster decay, steadier system (word for word)',
    s6rt: 'Closing demo: a resonator you can drag',
    s6re: 'Now bolt step 4’s poles into a real filter: the input is five pure tones mixed together (300 / 700 / 1200 / 1900 / 2700 Hz, sampled at 8000 Hz), the filter is H(z) = 1/((1 − pz<sup>−1</sup>)(1 − p̄z<sup>−1</sup>)), and the sound is genuinely computed sample by sample (a difference equation — not a drawn fake). Drag the pole on the left to choose the resonance angle; the r slider sets how sharp the resonance is: park the pole against the circle at a tone’s angle and that tone is the one that booms. The bars on the right are each tone’s true gain (|H(e<sup>jΩ</sup>)| evaluated point by point, displayed normalized to the maximum — true multipliers are in the readout). Hear the dry mix first, then the filtered one: let your ears do the auditing.',
    s6rLab: 'r · how close the pole rides to the circle (how sharp the resonance)',
    s6playDry: '▶ Hear the original (5 tones mixed)', s6playWet: '▶ Hear it after the filter',
    s6ro: 'pole angle θ = <span>{th}</span> rad → resonance frequency f = θ·f<sub>s</sub>/(2π) = <span>{fres}</span> Hz · r = <span>{r}</span> · gains of the five tones (×): {gains} · the largest gain is {peakVal}× at Ω = {peakOm}',
    s6tone: '{f} Hz: ×{g}',
    s6note: 'Audio etiquette (as on the sampling page): silent by default; the AudioContext is only created when you press play. The filter runs the difference equation y[n] = x[n] + 2r·cosθ·y[n−1] − r²·y[n−2] sample by sample for real, then peak-normalizes before playback to avoid clipping, at a conservative gain; each clip also fades in over 15 ms and out over 20 ms, so starting and stopping never click. In this step r is capped at 0.99 — parked exactly on the circle (r = 1) the filter would self-oscillate, which is the other face of step 4’s “on the circle it rings”. Bar gains and readout share the very same respAt evaluator as step 4’s frequency response.',
    s6fin: 'From a point going around in circles to a plane rolled into one — the map of this catch-up line is complete: the circling point on the trig page was Ω’s first appearance, Fourier turned circles into waves, sampling cut waves into points, Laplace gave every frequency a lifetime, and the Z-transform rolled the whole plane back into a single circle. Five pages, one picture. Next time a textbook shows you the unit circle, remember this resonator: <strong>every angle on the circle houses one frequency, and inside versus outside is life versus death.</strong>',
    s6linksLab: 'Looking back along the line:',
    s6lkT: 'Trig functions: the circle’s first appearance →', s6lkF: 'Fourier transform →', s6lkL: 'Laplace & the ROC →', s6lkS: 'Sampling & aliasing →',
    cvStableIn: 'inside = home of stability', cvOnCirc: 'on the circle = where Fourier (DTFT) lives',
    cvIn6: 'the 5 input tones’ angles', cvOut6: 'after filtering (normalized to max)',
    cvResp6: '|H(e^{jΩ})|'
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
