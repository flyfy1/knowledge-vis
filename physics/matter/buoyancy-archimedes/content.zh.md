---
lang: zh
---

::: strings
languageLabel: 语言切换
back: ← 知识索引
navLabel: 步骤导航
catBadge: 物理与电路
stageBadge: 初中
foot: 浮力与阿基米德 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页
docTitle: 浮力与阿基米德 · 排开的水有多重，浮力就有多大
pageTitle: 浮力与阿基米德
tagline: 把物体慢慢浸入水里，弹簧秤读数一路掉下去——掉的那部分恰好等于被它排开的水的重量。
:::

## 把物体浸入水里，弹簧秤的读数为什么变小？ {#step0 h2=s0t}

::: strings
nav0: 0 秤的读数掉了
:::

第 0 步 · 秤的读数掉了 {#s0k .step-kicker i18n=text}

这一步要回答：物体慢慢浸入水中，弹簧秤的读数会怎样变化？弹簧秤读的是向上拉住物体的力。物体浸入水里后，水会给它一个向上的托力，这个力叫**浮力**（单位牛，N）。选一个物体，拖「放下的深度」，看弹簧伸长和读数。 {#s0e .explain}

::: html step0-1
s0stage: 弹簧秤吊着方块：虚线是水面，弹簧越短说明读数越小
s0canvas: 弹簧秤吊着方块逐渐浸入水中，弹簧随读数缩短
s0obj: 物体
s0z: 放下的深度 z（从底面碰到水面算起）
s0reset: 拿出水面
:::

结论：浸得越多读数越小，浮力越大。条件：物体沉得下去（本页物体密度大于水）；水视为静止。 {#s0result .readout i18n=text}

::: strings
s0ro: 重力 W = {w} N；浸入体积 {vs} cm³（共 {v} cm³）；浮力 F浮 = {fb} N；读数 = W − F浮 = {r} N。
:::

## 浮力到底等于什么？ {#step1 h2=s1t}

::: strings
nav1: 1 排开的水
:::

第 1 步 · 排开的水 {#s1k .step-kicker i18n=text}

这一步要回答：浮力的大小和被物体挤开的水有什么关系？水杯装满水，物体浸入时挤出的水流进量桶。**排开的水**就是被物体占去位置而溢出的那部分水。拖深度，比较「读数减少量」和「桶里水的重力」。 {#s1e .explain}

::: html step1-1
s1stage: 溢水杯与量桶：浸得越深，溢出的水越多；右侧两根柱子比较两个力
s1canvas: 溢水杯示意图：物体浸入后水溢到桶里，两根柱子比较读数减少量与溢出水重
s1obj: 物体
s1z: 放下的深度 z
s1reset: 拿出并倒空桶
:::

结论：F浮 = G排 = ρ液·g·V排（阿基米德原理）。条件：物体浸入静止液体；V排是浸在液体里的那部分体积。 {#s1result .readout i18n=text}

::: strings
s1ro: 读数减少 {d} N；桶里排开的水 {vs} cm³，重 {ww} N；两者相差 {diff} N（模拟称量误差约 ±1%）。
:::

## 浮力和浸入的深度有关吗？ {#step2 h2=s2t}

::: strings
nav2: 2 深度还是体积
:::

第 2 步 · 深度还是体积 {#s2k .step-kicker i18n=text}

这一步要回答：物体越沉越深，浮力会一直变大吗？浮力只由 ρ液、g 和**排开的体积**决定。图中横轴是放下的深度，纵轴是浮力；物体还没全浸入时，越深排开的越多；全浸入后继续下沉，排开的体积不再变。选物体大小和液体，拖深度。 {#s2e .explain}

::: html step2-1
s2stage: 横轴：深度 z（cm）；纵轴：浮力 F浮（N）；三条线是三种大小的方块，亮线是当前选择
s2canvas: 浮力对深度的折线图：先上升，方块全部浸没后变成水平线
s2obj: 方块大小
s2liq: 液体
s2z: 放下的深度 z
:::

结论：浮力随排开体积增大，全浸入后与深度无关；换密度更大的液体，平台按比例抬高。条件：不可压缩液体、方块不变形。 {#s2result .readout i18n=text}

::: strings
s2ro: 边长 {s} cm 的方块在{liq}里：z = {z} cm 时 V排 = {vs} cm³，F浮 = {fb} N；{state}
s2part: 还没全浸入，再深一点浮力还会增加。
s2full: 已全浸入，再深浮力不变。
:::

## 松手后，物体浮起还是沉底，由哪两个力的比较决定？ {#step3 h2=s3t}

::: strings
nav3: 3 浮沉的力
:::

第 3 步 · 浮沉的力 {#s3k .step-kicker i18n=text}

这一步要回答：松手后物体向上还是向下动，由重力 W（向下）和浮力 F浮（向上）谁大决定。物体全浸入时 F浮 = ρ液·g·V；若 W 更大就下沉，若 F浮 更大就上浮，直到浮在水面时 F浮 刚好等于 W。选液体，拖物体密度，按「松手」，看箭头。 {#s3e .explain}

::: html step3-1
s3stage: 水槽：红色向下箭头 = 重力 W，青色向上箭头 = 浮力 F浮，长度按同一比例尺
s3canvas: 水槽示意图：物体上下各画一个箭头，浮着时两箭头一样长
s3liq: 液体
s3rho: 物体密度 ρ物
s3drop: 松手
s3lift: 拿起来重放
:::

结论：ρ物 < ρ液 时浮（浮着时 F浮 = W），ρ物 > ρ液 时沉。条件：实心均匀物体，静止液体。 {#s3result .readout i18n=text}

::: strings
s3ro: W = {w} N；全浸入时 F浮 最大 {fm} N；{res}
s3resFloat: 浮在水面，F浮 = W = {w} N，约 {p}% 浸入。
s3resSink: 沉到底，F浮 = {fm} N 小于 W，缸底托住 {n} N。
s3resNeutral: 悬浮，F浮 = W。
s3ready: 物体在液面上方，按「松手」。
:::

## 钢比水重很多，钢船为什么能浮？ {#step4 h2=s4t}

::: strings
nav4: 4 钢船为何浮
:::

第 4 步 · 钢船为何浮 {#s4k .step-kicker i18n=text}

这一步要回答：把一块钢做成空心的船壳，为什么就能浮起来？关键是整体平均密度 = 总质量 ÷ 船壳围出的总体积。船壳体积越大排开的水越多。设钢板质量固定 800 kg，拖船壳体积和货物质量，看吃水线；装到浮力托不住时就沉。 {#s4e .explain}

::: html step4-1
s4stage: 船的侧视图：虚线是水面，船壳浸入水中的部分排开水；右侧读数是总质量与能排开的水质量
s4canvas: 船的侧视图：船壳体积越大吃水越浅，货物越多吃水越深，超载就沉没
s4v: 船壳围出的体积 V
s4c: 货物质量
s4reset: 卸货并复位
:::

结论：只要总质量不超过船壳体积 × 水的密度，船就浮着。条件：本页船壳视为长方体、不进水、钢体积忽略；真实船要考虑稳性和海浪。 {#s4result .readout i18n=text}

::: strings
s4ro: 总质量 {m} kg；平均密度 {rho} kg/m³；船壳全浸入最多排开 {cap} kg 的水；{res}
s4resFloat: 浮着，吃水 {p}% 的船高，还能再装 {left} kg。
s4resSink: 超载，沉没（总质量超过最多能排开的水质量）。
:::

## 把阿基米德原理说给别人听 {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 收束
:::

::: html step5-1
s5k: 第 5 步 · 收束
s5e: 浸在液体里的物体受到向上的浮力，大小等于它排开的液体的重力。
f1t: 公式
f1b: F浮 = ρ液·g·V排；弹簧秤读数 = W − F浮。
f2t: 只看体积
f2b: 浮力由排开的体积和液体密度决定，全浸入后与深度无关（第 2 步）。
f3t: 浮沉条件
f3b: 比较 W 与 F浮，也就是比较平均密度与液体密度；空心让平均密度变小（第 3、4 步）。
modelT: 模型实话
model1: 本页 g = 9.8 N/kg，水 1000 kg/m³，盐水 1030，植物油 920；称量误差用确定性小抖动模拟 ±1%。
model2: 物体与液体视为静止；真实浮沉有振荡、水的阻力和表面张力。
model3: 船只是一个长方体壳；真实船的稳性、浪与重心位置不在本页模型内。
nextT: 继续看（站内）
l1: 压强 · 第 2 步：浮力其实来自上下表面压强差（p = ρgh）
l2: 密度 · 第 3 步：比较密度判浮沉（浮力页的另一个入口）
l3: 密度 · 第 4 步：排水法也是同一个「排开体积」
:::

::: strings
unitN: N
unitCm: cm
unitCm3: cm³
unitM3: m³
unitKg: kg
unitDens: kg/m³
lblFb: F浮
lblDrop: 读数减少
lblBucket: 桶里水重
lblTotal: 总质量
lblCap: 可排水质量
objAl: 铝块
objFe: 铁块
objSmall: 小块
objMid: 中块
objBig: 大块
liqWater: 水
liqSalt: 盐水
liqOil: 植物油
:::
