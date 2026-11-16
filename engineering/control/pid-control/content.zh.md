---
lang: zh
---

::: strings
pageTitle: 反馈控制 · 先看差多少，再决定推多少
back: ← 知识索引
navLabel: 反馈控制步骤导航
tagline: 设定值是你想要的，输出是系统现在的。反馈控制把两者之间的误差变成动作；调参，就是决定它追得多快、刹得多早、记得多久。
nav0: 0 设定值与误差
nav1: 1 P：看现在
nav2: 2 I：记账
nav3: 3 D：看趋势
nav4: 4 稳定性检查
nav5: 5 收束
foot: visual.integ.life · 反馈控制 Feedback Control
settleNA: 未收敛
seconds: " s"
:::

## 设定值不是输出，误差才是控制器的入口 {#step0 h2=s0t}

第 0 步 · 先定义问题 {#s0k .step-kicker i18n=text}

把目标 **设定值 r** 拖到 0.5–4.0。系统输出 y 从 0 出发；控制器每一步只先问一个问题：**还差多少？** 这就是误差 e = r − y。设定值改变，误差会立刻改变；输出不会瞬移，它只能通过控制动作追过去。 {#s0e .explain}

::: html step0-1
setpoint: 设定值 r
:::

拖动设定值，观察误差先跳变、输出再追赶。控制器永远对误差做出反应。 {#s0note .hint i18n=text}

::: strings
output: 当前输出 y
error: 误差 e = r − y
setpointVal: {v}
outputVal: {v}
errorVal: {v}
s0readout: r={r} · y={y} · e={e}
:::

## P：差得越多，推得越狠 {#step1 h2=s1t}

第 1 步 · 只看现在 {#s1k .step-kicker i18n=text}

比例控制只看此刻的误差：**u = Kp·e**。Kp 太小，系统追得慢；Kp 变大，追得更快，但也更容易越过目标。注意曲线最后留下的缝：只靠 P，系统通常需要保留一点误差才能提供持续的力，所以会有**稳态误差**。 {#s1e .explain}

::: html step1-1
kp: 比例增益 Kp
reset: 重置
compareP: 显示 P 基线
:::

把 Kp 拉到高位，先预测曲线会变快还是会开始摆动，再看结果。 {#s1hint .hint i18n=text}

::: strings
run: 运行
pause: 暂停
s1metrics: Kp={kp} · 稳态误差 {error} · 超调 {overshoot}% · 收敛 {settling}
:::

## I：把残留误差一笔一笔记账 {#step2 h2=s2t}

第 2 步 · 把过去加进来 {#s2k .step-kicker i18n=text}

积分项不只看现在，还把过去的误差累加：**u = Kp·e + Ki·∫e dt**。坡度、摩擦或负载会让系统长期偏离目标；I 项会持续累积这笔账，直到误差被吃掉。账记太快会带来积分饱和：系统越过目标后，积累的“旧账”还没花完，于是慢慢摆回来。 {#s2e .explain}

::: html step2-1
ki: 积分增益 Ki
disturbanceOff: 扰动：关
:::

先把 Ki 设为 0，再逐步增加；比较末段误差，不要只看第一秒。 {#s2hint .hint i18n=text}

::: strings
disturbance: 加入 5 s 扰动
s2metrics: Ki={ki} · 末段平均误差 {error} · 最大控制力 {control} · {state}
disturbanceOn: 扰动：开
stable: 已稳定
unstable: 仍在摆动
:::

## D：不是等到了才刹，而是看见速度就提前刹 {#step3 h2=s3t}

第 3 步 · 看趋势再刹车 {#s3k .step-kicker i18n=text}

微分项观察误差变化率：**u = Kp·e + Kd·de/dt**。当输出快速冲向目标时，D 项提前给出反向动作，压低超调、缩短摆动。它的代价也很明确：噪声同样是“变化”，Kd 太大时会把测量毛刺放大成控制抖动。 {#s3e .explain}

::: html step3-1
kd: 微分增益 Kd
:::

固定 Kp、Ki，只改变 Kd。青色曲线表示当前 PID，虚线是没有 D 的基线。 {#s3hint .hint i18n=text}

::: strings
s3metrics: Kd={kd} · 峰值超调 {overshoot}% · 收敛 {settling} · 误差换向 {crossings} 次
:::

## 稳定不是“越快越好”：用三条误解检查自己 {#step4 h2=s4t}

第 4 步 · 调参实验室 {#s4k .step-kicker i18n=text}

现在可以同时调 Kp、Ki、Kd。观察响应曲线、控制输出和指标，再回答下面的判断题。每个选项都对应一个真实的工程取舍：速度、超调、噪声和饱和不能同时无限变好。 {#s4e .explain}

::: html step4-1
setpointShort: 设定值
presetSoft: 温和
presetBalanced: 均衡
presetFast: 激进
runAgain: 重新运行
quizPrompt: 哪一句最准确？
quizA: Kp 越大越好，响应一定更稳定。
quizB: Kd 能减少超调，但过大时会放大噪声。
quizC: Ki 只影响第一秒，稳态误差与它无关。
check: 检查判断
:::

::: strings
correct: 正确：D 抑制趋势，但也会放大测量噪声；调参是权衡。
wrong: 再想一步：反馈项各看不同时间尺度，增大一个参数会改变别的代价。
s4metrics: 当前参数：Kp={kp} · Ki={ki} · Kd={kd} · 超调 {overshoot}% · 末段误差 {error}
:::

## 同一条闭环，三种时间尺度 {#step5 h2=s5t}

第 5 步 · 收束 {#s5k .step-kicker i18n=text}

P 看**现在**差多少，I 记**过去**欠了多少，D 看**未来趋势**会不会冲过头。设定值、误差、控制量和响应曲线必须彼此对得上；如果曲线看起来漂亮，却说不出是哪一项在起作用，就还没有真正读懂闭环。 {#s5e .explain}

::: html step5-1
formula: e = r − y　　u = Kp·e + Ki·∫e dt + Kd·de/dt
boundary: 模型边界：这里用一个带惯性、阻尼和弹簧回拉的二阶对象，固定步长数值积分；真实系统还会有采样延迟、饱和、噪声和非线性。
:::
