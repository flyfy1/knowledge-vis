---
lang: zh
---

::: strings
back: ← 知识索引
category: 概率与统计
stage: 初中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 平均数、中位数、众数之争 · 三个“平均”三个故事
tagline: 同一组工资，三个“平均”说出三种故事；极端值一进来，只有中位数不慌。
:::

## 同一组数，平均数、中位数、众数各是多少？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 三个平均
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 三个平均
:::

这一步要回答：三个“平均”分别是什么？一家小公司 9 个人的月薪（千元）如下，每个点是一个人。**平均数** = 全部相加 ÷ 人数；**中位数** = 按大小排好后正中间的那个数；**众数** = 出现次数最多的数。图上用不同颜色的线标出它们的位置。 {#s0e .explain}

::: html step0-2
s0cv: 9 个人的月薪（千元），三种“平均”的位置
:::

::: strings
s0ro: 平均数 = {sum} ÷ {n} = {mean}；中位数（排好后第 {k} 个）= {med}；众数 = {mode}。
:::

## 老板的工资很高，三个“平均”会怎么动？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 极端值
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 极端值
:::

这一步要回答：一个特别大的数，对三个“平均”的影响一样吗？上面那组里最高的月薪（原来 40）代表老板。拖动老板的月薪：平均数被一路拉高，中位数和众数纹丝不动。右图是三个“平均”随老板月薪变化的曲线。 {#s1e .explain}

::: html step1-2
s1cv: 三个“平均”随老板月薪的变化
boss: 老板的月薪（千元）
:::

::: strings
s1ro: 老板月薪 {o}：平均数 {mean}，中位数 {med}，众数 {mode}。平均数比中位数高 {diff}。
:::

## 众数告诉我们什么？没有众数或有两个众数呢？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 众数
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 众数
:::

这一步要回答：怎样找众数，什么时候它不唯一？用滑杆选一个值，按“加入”把它放进数据里：柱子的高度是这个值出现的次数，最高的柱子就是众数。多个值一样高时，众数不止一个；每个值只出现一次时，就没有众数。 {#s2e .explain}

::: html step2-2
s2cv: 每个值出现的次数
val: 要加入的值
add: 加入
removeLast: 删去最后一个
clearAll: 清空
resetData: 恢复初始数据
:::

::: strings
s2ro: 数据共 {n} 个：{list}；出现次数最多是 {c} 次，众数：{mode}。
s2roEmpty: 还没有数据：选一个值，按“加入”。
:::

## 数据个数是奇数还是偶数，中位数怎么找？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 中位数
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 中位数
:::

这一步要回答：中位数怎么求？先把数据按从小到大排好：个数是奇数时，取正中间的一个；是偶数时，取中间两个的平均。选一组数据，看橙色标出的中间位置，以及它与平均数的差别。 {#s3e .explain}

::: html step3-2
s3cv: 排序后的数据，橙色是中间位置
setA: 5 个数
setB: 6 个数
setC: 偏斜的 7 个数
:::

::: strings
s3ro: 排序后 {sorted}，共 {n} 个；中间位置 {where}，中位数 = {med}；平均数 = {mean}。
whereOdd: 第 {k} 个
whereEven: 第 {k} 个和第 {k2} 个的平均
:::

## 说“平均”的时候，该用哪一个？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 选哪个
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 选哪个
:::

这一步要回答：怎样选哪个“平均”？三个情景：工资（少数人特别高）、鞋码（商店备货）、考试成绩（分布大致对称）。先选一个你认为最合适的，再看看页面给出的理由，并对照三个数字。这些理由是常见的经验，并非唯一答案。 {#s4e .explain}

::: html step4-2
s4cv: 三个情景的数据与三个“平均”
scSal: 工资
scShoe: 鞋码备货
scScore: 考试成绩
pickMean: 选平均数
pickMed: 选中位数
pickMode: 选众数
checkP: 看理由
:::

::: strings
s4roAsk: 情景：{sc}。数据 {list}；平均数 {mean}，中位数 {med}，众数 {mode}。你认为哪个最合适？
s4roReveal: 情景：{sc}：平均数 {mean}，中位数 {med}，众数 {mode}。常见的选择是{best}：{why}你选的是{pick}。
bSal: 中位数
wSal: 少数几个很高的工资会把平均数拉高，中位数更能代表“典型的一个人”。
bShoe: 众数
wShoe: 备货要看哪个码卖得最多，众数最直接。
bScore: 平均数
wScore: 成绩大致对称、没有极端值时，平均数用到了每个人的分数，信息最全。
:::

## 用你自己的数据比较三个“平均” {#step5 h2=s5t pre=1}

::: strings
nav5: 5 终章
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

这一步要回答：换一组数据，三个“平均”是什么关系？在框里输入 3 到 15 个数，用逗号或空格分开。平均数大于中位数，通常说明有少数特别大的数把平均数拉高了。 {#s5e .explain}

::: html step5-2
s5cv: 你的数据与三个“平均”
own: 你的数据
recapTitle: 回顾
recap1: 平均数用到每个数，中位数只看排序后的中间，众数看谁出现最多。
recap2: 极端值会拉动平均数，几乎不动中位数和众数。
recap3: 没有“唯一正确”的平均：要看你想回答什么问题、数据长什么样。
modelTitle: 模型范围与局限
modelText: 这里的数据是几组示意数据，不是真实调查。“该选哪个”的理由只是常见经验，不是定理。众数对只出现一次的数据没有意义；连续测量值通常要分组后才谈众数。
linkBar: → 去条形图页：平均线怎样补平高出和不足
linkAvg: → 去平均数页：倒水齐平看平均数
linkClt: → 去中心极限定理页：很多平均数放在一起的形状
linkPd: → 去分布与期望页：平均数作为重心
:::

本页完成。 {#done .readout .success i18n=text}

::: strings
mMean: 平均数
mMed: 中位数
mMode: 众数
noMode: 没有（每个值只出现一次）
s5ro: {n} 个数：平均数 {mean}，中位数 {med}，众数 {mode}；平均数{rel}中位数。
relMore: 大于
relLess: 小于
relEq: 等于
s5roBad: 请输入 3 到 15 个数（逗号或空格分开），例如 3, 4, 4, 9。
docTitle: 平均数、中位数、众数之争 · 三个“平均”三个故事
:::
