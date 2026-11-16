---
lang: zh
---

::: strings
docTitle: 化学平衡 · 人数不变，人还在跑
back: ← 知识索引
pageTitle: 化学平衡
tagline: 平衡不是反应停了：正、逆两个方向跑得一样快，人数看似不变，但每个人都还在跑。
category: 化学
stage: 高中
navLabel: 步骤导航
foot: 化学平衡 · 人数不变，人还在跑
currentFrame: 当前帧
total: 总粒子
countA: A 数
countB: B 数
why: 结论
dynamic: 这是动态平衡：有人在互变。
staticGuess: 这是静态平衡：没人互变。
actual: 实际：
trueDynamic: 动态平衡
falseGuess: 你的押注错了，事件计数说明仍在互变。
trueGuess: 押注正确：事件计数说明仍在互变。
resetAll: 重置本步
direction: 方向判定
noChange: 暂无扰动
settle: 达到平衡
:::

## 人数不变 ≠ 没人动 {#step0 h2=step0t}

::: strings
nav0: 0 动态平衡
:::

STEP 0 · 动态平衡 {#step0k .step-kicker i18n=text}

先看一个已经处在平衡态的混合物。B 的人数几乎不变，但 A ⇌ B 的互变事件仍在发生。唯一问题：曲线平了，反应停了吗？先押注，再揭晓事件计数。 {#step0e .explain i18n=text}

::: html step0-1
canvasLabel: A 与 B 粒子模拟画布
:::

每个圆点是一个固定的粒子；白圈标出这一帧刚互变的粒子（它的颜色就地翻转）。事件数由模拟逐帧累加。 {#step0note .hint i18n=text}

::: html step0-2
guessedMoving: 我猜：还在动
guessedStopped: 我猜：停了
reveal: 揭晓
reset: 重置本步
:::

::: strings
guessPrompt: 先押注：平衡时反应停了吗？
events: 互变事件
particleA: A 粒子
particleB: B 粒子
rateForward: 正向速率
rateReverse: 逆向速率
rateUnit: 事件/帧
balance: 平衡判定
balanced: 两速率已接近，曲线走平
settling: 尚未走平，继续观察
ratio: B 占比
netDirection: 净变化方向
towardB: 净变化暂时指向 B
towardA: 净变化暂时指向 A
noNet: 净变化接近 0
:::

## 正、逆速率逐渐相等，才走到平衡 {#step1 h2=step1t}

::: strings
nav1: 1 从零开始
:::

STEP 1 · 从零开始 {#step1k .step-kicker i18n=text}

从纯 A 出发。开始时只有正向变化；B 越多，逆向变化越容易发生。曲线随播放逐帧画出；两条速率读数是最近 30 帧真实模拟事件的滑窗均值，不是预先画好的曲线。换成富 B 初态可以验证：从另一侧出发，也走到同一个 B 占比。 {#step1e .explain i18n=text}

先从纯 A 播放：正向先发生；B 增多后逆向追上；最后两条速率接近，人数才走平。 {#step1bridge .hint i18n=text}

::: html step1-1
play: 播放
showRates: 显示速率曲线
chooseInitial: 选择初态：
initialPureA: 纯 A
initialMixed: 富 B（1/4 A）
:::

平衡的判据是两方向速率接近，而不是 A、B 人数相等。 {#step1hint .hint i18n=text}

::: strings
pause: 暂停
hideRates: 隐藏速率曲线
rateOverlay: 速率曲线
temp: 温度
:::

## 推一把：体系会抵抗扰动，但不会完全抵消 {#step2 h2=step2t}

::: strings
nav2: 2 加料扰动
:::

STEP 2 · 扰动一：加料 {#step2k .step-kicker i18n=text}

先让体系走到平衡，再在第 150 帧注入一批 A。对照同一随机种子、不注入的同一次模拟，注入后的若干帧里正向事件多出来，净变化指向 B，最后在新的水平走平。读数同时给出注入前后的 A、B 水平。 {#step2e .explain i18n=text}

先让曲线走平，再注入 A：先看正向事件短暂占优，随后逆向追上，最后在新的水平走平。 {#step2bridge .hint i18n=text}

::: html step2-1
inputA: 输入 A 粒子数
addA: 注入 A
:::

“抵抗”表示反向变化增强、削弱外加影响；它不等于回到原来的组成。 {#step2hint .hint i18n=text}

::: strings
added: 已在第 {f} 帧注入 +{n} 个 A
initial: 初始状态
yes: 是
no: 否
convertedNow: 本帧互变
frames0to: 第 0–{f} 帧
lastFrames: 最近 {n} 帧均值
flatSince: 已走平（自第 {f} 帧起）
pushWindow: 注入后 {w} 帧内
netEvents: 净正向事件（正−逆）
withoutPush: ；同一模拟不注入时为
levels: 平均水平（注入前 → 重新走平后）
crossMarks: 虚线竖线：各自走完 {p}% 路程的帧
notFaster: 这一路催化剂没有更快
diffEndpoint: 终点差 {d} 个百分点（≥3，不算一致）
:::

## 温度改变的是平衡点本身 {#step3 h2=step3t}

::: strings
nav3: 3 温度改变
:::

STEP 3 · 扰动二：温度 {#step3k .step-kicker i18n=text}

本页把正向 A → B 视为吸热方向：升温时正、逆两个概率都增大，但正向增大得更多，平衡向 B 移；降温时两者都减小，正向减得更多。占比是模拟末段的实测均值。 {#step3e .explain i18n=text}

先看基准温度，再切换升温或降温：比较末段 B 占比，观察平衡点本身移动，而不只是到达速度改变。 {#step3bridge .hint i18n=text}

::: html step3-1
cool: 降温
normal: 基准温度
warm: 升温
:::

温度这里只是定性示意：同时改变两个概率且幅度不同，不是阿伦尼乌斯方程的定量计算。 {#step3hint .hint i18n=text}

::: strings
heatSensitive: 本页把正向视为吸热方向
equilibriumB: 平衡时 B 占比
compare: 对照表
catalyst: 催化剂
noCatalyst: 无催化剂
withCatalyst: 有催化剂
timeToBalance: 帧走完 {p}% 路程
endpoint: 终点 B 占比
sameEndpoint: 终点一致（差 {d} 个百分点，<3）
faster: 更快
:::

## 催化剂只改快慢，不改终点 {#step4 h2=step4t}

::: strings
nav4: 4 催化剂
:::

STEP 4 · 催化剂 {#step4k .step-kicker i18n=text}

同一初态、同一随机种子并行跑两路：催化剂同时按同一倍数提高正、逆概率。图中叠加两路的 B 曲线，比较各自走完 80% 路程的帧数，以及末段 B 占比。 {#step4e .explain i18n=text}

先看无催化剂，再打开催化剂：比较走平所需帧数，同时核对末段 B 占比是否相同。 {#step4bridge .hint i18n=text}

::: html step4-1
:::

催化剂改变到达平衡的时间，不改变热力学平衡位置。 {#step4hint .hint i18n=text}

## 把“平衡”说给别人听 {#step5 h2=step5t}

::: strings
nav5: 5 收束
:::

STEP 5 · 收束 {#step5k .step-kicker i18n=text}

动态平衡：正、逆两个方向仍在进行，只是单位时间内的平均速率相等，所以宏观人数不再明显变化。加料会移动平衡，温度会改变平衡点，催化剂只让它更快到达。 {#step5e .explain i18n=text}

回看四个动作：速率相等解释“为什么走平”，加料解释“平衡会移动”，温度解释“终点会改变”，催化剂解释“只改变快慢”。 {#step5bridge .hint i18n=text}

::: html step5-1
modelTitle: 模型边界
modelBody: 本页用有限个粒子、离散时间帧和概率化 A ⇌ B 事件来建立直觉。温度效应是定性示意，不是阿伦尼乌斯定量；粒子数也不是浓度的真实尺度。
ratesLink: → 回到 reaction-rates：速率从哪里来
massLink: → 前往 mass-conservation：守恒底账
:::
