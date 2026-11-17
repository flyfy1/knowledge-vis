---
lang: zh
---

::: strings
docTitle: 升压与降压 · 物理交互课
back: ← 数学与物理地图
eyebrow: 物理 / 电路
pageTitle: 电压变了，能量去哪了？
intro: 从电感和电容的记忆出发，亲手走完降压 Buck 与升压 Boost 电路的每一个阶段。
navLabel: 课程步骤
plotTime: 时间
footT: 继续追根究底
footNote: 交互模型与数值例子为本站教学实现。下列教材与厂商资料用于核对元件定律、拓扑及连续导通分析。
srcInductor: OpenStax · 自感与电感
srcCapacitor: OpenStax · 电容
srcBuckPdf: TI · Buck 功率级分析（PDF）
srcBoostPdf: TI · Boost 功率级分析（PDF）
:::

## 电压翻倍，不等于能量翻倍 {#step0 h2=s0t}

::: strings
nav0: 0 电压与功率
:::

第 0 / 6 · 电压与功率 {#s0k .step-kicker i18n=text}

::: html step0-1
s0q: 同样的功率，电压升高后电流会怎样？
:::

电压是每单位电荷携带的能量（1 V = 1 J/C）；电流是每秒流过的电荷（1 A = 1 C/s）。它们相乘，才是每秒传输的能量——功率。 {#s0lede .lede}

P = V · I　　理想稳态: Pin = Pout {#s0power .formula i18n=text}

给你固定 12 W 的功率预算。把输出从 6 V 拉到 24 V，观察输出电流： {#s0budget}

::: html step0-2
outV: 输出电压
:::

这里是功率账本，还没有模拟电路。真实电路要用储能元件和开关，在不同时间重新安排能量的流向。 {#s0scope}

读电路图需要的两个守恒关系 {#s0h3 tag=h3 i18n=text}

图中的箭头表示传统电流方向（正电荷运动方向）。节点处流入电流之和等于流出之和，叫基尔霍夫电流定律 KCL；沿闭合回路的电压升降代数和为零，叫基尔霍夫电压定律 KVL。 {#s0kcl}

下面 iL 是电感电流，Iout 是负载电流，iC 是流入电容的电流。Vin 是输入电压，Vout 是输出电压，vL 是电感两端的电压降。后面会逐个介绍这些元件。 {#s0symbols .note}

节点: iL = Iout + iC<br>回路示例: Vin − vL − Vout = 0 {#s0laws .formula}

::: strings
outPower: 输出功率
outCurrent: 输出电流
relation: 关系
fbHigher: 电压升高后，每单位电荷携带的能量更多；功率固定时，电流变小。
fbLower: 电压降低后，每单位电荷携带的能量更少；功率固定时，电流变大。
fbEqual: 现在正好是 12 V：固定 12 W 时，电流为 1 A。
:::

## 电感：电流不能凭空跳变 {#step1 h2=s1t}

::: strings
nav1: 1 电感
:::

第 1 / 6 · 电感 {#s1k .step-kicker i18n=text}

::: html step1-1
s1q: 电压降到零，电感电流会立刻消失吗？
:::

电感把能量存进磁场。电压决定电流改变的速度，不直接决定电流的大小。 {#s1store}

L 是电感量，单位 H（亨利）；1 mH = 0.001 H。i 是电流，v 是元件两端电压。di/dt 表示每秒电流变化多少；Δ 表示一段时间内的改变量。E 是储能，单位 J（焦耳）。 {#s1units .note}

::: html step1-2
:::

先试两次正脉冲，再试零脉冲，最后试负脉冲。看曲线是否立刻回到零。 {#tryPulses}

L = 10 mH · Δt = 0.5 ms · 每次点击推进一次；最多 16 次。 {#s1setup .note}

::: html step1-3
s1plus: +2 V 脉冲
s1zero: 0 V 脉冲
s1minus: −2 V 脉冲
reset: 重置
:::

符号约定：电流流入标为 + 的端子；v 和 i 可为负。零驱动保持当前值，反向驱动先减小它，也可以越过零。p = vi 为负时，元件把能量还给理想电源。 {#signNote}

::: strings
current: 电流
stored: 储能
dE: 本次能量变化
plotI: 电流 i
pulsesMore: 已记录 {n}/16 次脉冲。零驱动也会记录一段水平线。
pulsesFull: 已记录 {n}/16 次脉冲。请重置后继续。
:::

## 电容：给电压一份记忆 {#step2 h2=s2t}

::: strings
nav2: 2 电容
:::

第 2 / 6 · 电容 {#s2k .step-kicker i18n=text}

::: html step2-1
s2q: 停止流入电荷，电容电压会立刻消失吗？
:::

电容把能量存进电场。流入正极的电流增加电荷，使电压上升；流出则使电压下降。 {#s2store}

C 是电容量，单位 F（法拉）；1 µF = 0.000001 F。dv/dt 表示每秒电压变化多少，Δv 是这次电压的改变量；E 是储能。 {#s2units .note}

::: html step2-2
:::

C = 100 µF · Δt = 0.5 ms · 每次点击推进一次；最多 16 次。 {#s2setup .note}

::: html step2-3
s2plus: +20 mA 脉冲
s2zero: 0 mA 脉冲
s2minus: −20 mA 脉冲
:::

::: strings
voltage: 电压
plotV: 电压 v
rateTitle: 把最后一个区间放大：电流就是电压斜率 × C
rateNone: 尚无区间。按一次脉冲才会有两端点；重置后的0V不是已经测得的零斜率。
rateSummary: 本次电压{start}到{end}V；相对起点变化{delta}V，历时0.5ms；段内斜率{slope}V/s，电流{current}mA。
rateLocal: 这张局部图画相对区间起点的Δv，不是绝对电压v。固定横轴0..0.5ms，纵轴−0.12..+0.12V；虚线横边表示时间，竖边表示带符号Δv。
rateNote: 每段电流恒定，因此这里区间斜率恰等段内导数；一般曲线的有限割线只给平均变化率。电流真正跳变的瞬间，电压没有双侧导数；电压本身仍连续。负电流使带符号电压下降，不一定总在放能。
rateLink: 把变化率放回知识路线 →
:::

## 开关决定路径，时序决定比例 {#step3 h2=s3t}

::: strings
nav3: 3 开关与时序
:::

第 3 / 6 · 开关与时序 {#s3k .step-kicker i18n=text}

::: html step3-1
s3q: 电流走哪条路，每条路持续多久？
:::

理想开关闭合时相当于导线，断开时不通电。理想二极管只允许电流从阳极 A 流向阴极 K；正向导通压降为 0，反向截止。这是教学近似。 {#s3ideal}

::: html step3-2
s3diode: 反转二极管
:::

这个独立的直流小实验有 5 V 电源、1 kΩ 电阻和串联二极管，回线接回电源负极。 {#s3circuit .hint}

脉宽调制 PWM：每隔一个周期 T 重复开关动作；占空比 D 是闭合时间除以周期。频率 f = 1/T。本课每秒切换 20,000 次，但你可以手动慢放。 {#s3pwm}

::: html step3-3
duty: 占空比
s3more: 扩展：开关脉冲也有频谱。
:::

::: strings
diodeOff: 5 V → K |◁ A → 1 kΩ → 回线：截止，I = 0 mA
diodeOn: 5 V → A ▷| K → 1 kΩ → 回线：导通，I = 5 mA
onTime: 导通 ON
offTime: 断开 OFF
switchPlot: 开关：1 闭合 / 0 断开
:::

## Buck 降压：断开电源，电流仍有路可走 {#step4 h2=s4t}

::: strings
nav4: 4 Buck
:::

第 4 / 6 · Buck {#s4k .step-kicker i18n=text}

::: html step4-1
s4q: 开关断开时，降压电路的电流为什么还能继续？
:::

把电源间歇接上，电感让电流连续，输出电容接收或补足瞬时的电流差。 {#buckLede .lede}

先播放，看闭合回路与磁场储能。暂停在某个时刻，再调 D：时刻不变，路径可能切换。调电压看电流宽度与储能变化。 {#cvHint .hint}

::: html step4-2
vin: 输入电压
dutyD: 占空比 D
play: 播放两周期
cvNext: 推进半个开关阶段 →
cvReset: 重置两周期记录
cvDiagram: 完整电流回路
cvTiming: 青色区间 = ON；标记 = 周期内时刻
seek: 查看时刻
:::

亮线与箭头表示常规电流；线越粗电流越大，移动短线仅示意方向，不表示电子速度或能量包。1 个显示周期约 4 秒，对应 50 µs；暂停仅冻结观察。减少动态效果时只保留静态箭头。 {#cvDash .hint}

::: html step4-3
:::

曲线为当前参数的稳态解析轨迹，显示至查看时刻；调参会重算，不模拟调节瞬态。每周期分成 ON 的两半、OFF 的两半；占空比不为 50% 时，各阶段时长不同。边界读数采用切换后的状态，电流连续。 {#cvTraces .hint}

::: html step4-4
cvModelSum: 模型与符号（理想稳态，不含启动过程）
cvModel: 模型：理想元件、连续导通（电感电流始终 > 0）、周期稳态；输出电压按小纹波近似视为常量。初始电流是稳态谷值，不是上电启动。
cvSymbols: S 是开关；三角形加横线的符号是二极管（A 为阳极，K 为阴极）。D = 导通时间 / 周期；f 是频率，T 是周期；L 是电感量，C 是电容量。iL 是从左到右的电感电流，vL 是电感左端减右端的电压；iC 流入电容正端，Iout 是负载电流。
cvParams: f = 20 kHz · T = 50 µs · L = 1 mH · C = 470 µF · 恒流负载 = 1 A
cvDeriveSum: 从刚才的斜率推导输出电压
areaT: 把电压的正负面积，与电流改变量对上
areaIntro: 用上方同一个查看时刻。细线给完整两周期参照；填色只累加0到当前时刻。绿色+面积抬高电流，橙色−面积降低电流；这不是能量面积。
areaOnEnd: 查看 ON 结束
areaPeriod: 查看一周期
areaAxes: 固定坐标：时间0..100µs，电感电压vL−12..+12V。vL取电感左端减右端，电流iL从左到右；这里的vL不是速度。读数先实算后舍入，净面积不用舍入分项求和。
areaNote: 面积只给电流改变量，绝对值还需初态。本例从非零稳态谷值开始；完整周期电流重复，所以正负伏秒抵消，平均电压为零，电流却不是零。暂态一般不满足周期平衡。本图不模拟启动；调D或Vin重算同一时刻的另一稳态。
areaBack: 回到积分与电感路线 →
areaSource: Analog Devices · 伏秒平衡来源
cvBalance: 稳态每一周期都回到同一个电流。由于 Δi = vL Δt / L，电感电压的正、负面积必须抵消（伏秒平衡）。沿回路把电压升降相加为零，就得到：
buckWhy: 所以输出是输入电压乘以导通时间占比。不是靠电阻把多余的电压烧掉。电容电流 iC = iL − Iout：电感电流高于负载时充电，低于负载时放电，不能简单等同于开关的 ON / OFF。
:::

::: strings
pause: 暂停
replay: 重播两周期
changed: 参数已改变：同一时刻的新稳态案例，轨迹已重算。
cyclesDone: 两周期完成
energyUp: L：磁场正在储能
energyDown: L：磁场正在放能
energyCaption: 储能 {e} mJ · 固定满量程 {max} mJ；E = ½Li²。
capZero: C：此刻净电流为零
capCharge: C：吸收电流差（充电）
capDischarge: C：补足负载电流（放电）
phaseOn: 当前阶段：ON，开关接通。
phaseOff: 当前阶段：OFF，开关断开。
buckOnPath: 电源 + → 闭合开关 → 电感 → 输出节点 → 负载 → 回线 → 电源 −。二极管反向截止。
buckOffPath: 回线 → 二极管 A→K → 电感 → 输出节点 → 负载 → 回线。电源已断开，电感在放能。
branchZero: 电容支路：此刻净电流为零。
branchCharge: 电容支路：输出节点 → 电容 + → 电容 − → 回线，充电。
branchDischarge: 电容支路：电容 + → 输出节点 → 负载 → 回线 → 电容 −，放电。
avgVout: 平均输出 Vout
avgIin: 平均输入电流
instIL: 瞬时 iL
instVL: 瞬时 vL
instIC: 瞬时 iC
magEnergy: 磁场能量
traceIL: 电感电流 iL
traceVL: 电感电压 vL
areaSummary: 查看{t}µs，正面积{pos}Vµs，负面积{neg}Vµs，净面积{net}Vµs，电流改变量{di}A，电流{i}A。
areaTime: 查看时刻 t
areaPos: 正伏秒 +
areaNeg: 负伏秒 −
areaNet: 净伏秒 ≈
areaI0: 起始电流 iL(0)
areaDi: 改变量 Δi ≈
areaI: 当前 iL ≈
:::

## Boost 升压：电源与电感一起推 {#step5 h2=s5t}

::: strings
nav5: 5 Boost
:::

第 5 / 6 · Boost {#s5k .step-kicker i18n=text}

::: html step5-1
s5q: 低电压输入，怎样把电流推向更高的输出电压？
:::

先让电源给电感储能，再把电源和电感一起接向输出。开关接地时，输出由电容独自支撑。 {#boostLede .lede}

::: html step5-2
boostWhy: 关断时电感电流减小，vL 为负：电感的右端高于左端，把电流继续推向更高的输出电压。升压的是电压，不是能量。
:::

::: strings
boostOnPath: 储能回路：电源 + → 电感 → 开关 → 回线 → 电源 −。独立供电回路：电容 + → 负载 → 电容 −。二极管隔开输出。
boostOffPath: 电源 + → 电感 → 二极管 A→K → 输出节点 → 负载 / 电容 → 回线 → 电源 −。电感放能，电源也继续供能。
:::

## 升压的代价：输入侧需要更多电流 {#step6 h2=s6t}

::: strings
nav6: 6 能量账本
:::

第 6 / 6 · 能量账本 {#s6k .step-kicker i18n=text}

::: html step6-1
s6q: 5 V 升到 12 V，需要多少输入电流？
:::

现在只做功率账本：5 V 输入变为 12 V 输出，负载需要 1 A。先猜理想情况下输入电流： {#s6predict}

::: html step6-2
s6legend: 与输出的 1 A 相比
guessLess: 更小
guessEqual: 相等
guessMore: 更大
reveal: 揭晓并查看损耗
quizReset: 重新预测
s6eff: 效率 η = 输出功率 / 输入功率；剩下的功率作为损耗转化为热等形式。
eta: 效率 η
s6budgetNote: 效率是此处独立指定的功率预算，不会反过来修改前两节的理想电压公式。它不是非理想电路求解器。
:::

真实电源如何保持输出稳定？ {#s6h3 tag=h3 i18n=text}

前面手动选择占空比，这是开环。实际电源通常测量输出、与目标比较，再调整占空比，这就是[[inverted-pendulum#step2|反馈控制]]。本页没有模拟控制器或启动过程。 {#s6feedback}

D 趋近 1 时，理想 Boost 公式趋于无穷大，但真实电路会受电流限制、线圈饱和、损耗及元件耐压约束。本课限定参数使电感电流始终为正；轻载时可能进入断续导通，公式要重新分析。 {#s6limits}

::: html step6-3
s6map: 把电路放回知识地图 →
:::

::: strings
correct: 猜对了。
checkAgain: 再看一下功率关系。
idealIn: 理想输入电流为 12/5 = 2.4 A，比 1 A 大。损耗会让输入电流更大。
inCurrent: 输入电流
inPower: 输入功率
loss: 损耗
:::
