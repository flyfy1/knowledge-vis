---
lang: zh
---

::: strings
back: ← 知识索引
pageTitle: 图算法 · 让边带你走
tagline: BFS 把“先到的层”放进队列，DFS 把“还没走完的路”压进栈。编辑一条边，亲眼看见 frontier 如何改变。
foot: 图算法 · 可编辑的小图，能复算的每一步
graphReady: 图中有 {v} 个节点、{e} 条无向边。起点是 {s}。
edgeOn: {a} — {b} 已打开
edgeOff: {a} — {b} 已关闭
stepDone: {algo} 已完成：访问 {n} 个节点，扫描 {scans} 个邻接项。
stepIdle: 点击“走一步”开始 {algo}。
stepActive: 取出 {node}，发现 {found}。容器还剩 {left}。
causal: 切换 {a} — {b} 后，下一批 frontier：{frontier}
noFrontier: 没有新的 frontier；从起点不可达。
metricV: 节点 V
metricE: 边 E
metricScan: 邻接项扫描
metricVisited: 已访问
bfsName: BFS
dfsName: DFS
barScan: 扫描量
barV: 节点量
barE: 边量
:::

## 先把图当成一张可改的地图 {#step0 h2=s0t}

::: strings
nav0: 0 图是地图
:::

第 0 步 · 钩子 {#s0k .step-kicker i18n=text}

节点是地点，边是可以走的路。拖动节点改变布局；点击边或用下方按钮打开/关闭一条路。你会在下一步看到：**同一张图，选择不同的容器，就会得到不同的走法。** {#s0e .explain}

::: html step0-1
fromLab: 起点
toLab: 终点
toggleEdge: 切换这条边
resetGraph: 恢复示例图
:::

小提示：边是无向的。点击任意节点可把它设为起点；拖动只改变画面位置，不会改变算法数据。 {#s0hint .hint}

## 队列让 BFS 一层一层，栈让 DFS 一条路走到底 {#step1 h2=s1t}

::: strings
nav1: 1 队列与栈
:::

第 1 步 · 核心动作 {#s1k .step-kicker i18n=text}

每次只做一个可观察动作：从容器取出一个节点，再把尚未访问的邻居放进去。**队列 FIFO** 保证先发现的层先处理；**栈 LIFO** 会把最新的分支先推到底。 {#s1e .explain}

::: html step1-1
bfs: BFS · 队列
dfs: DFS · 栈
stepOnce: 走一步
play: 连续播放
resetRun: 重置遍历
containerTitle: 当前容器
visitedTitle: 已访问顺序
:::

观察同一个节点何时进入队列/栈，何时从容器取出。真正改变顺序的是容器规则，不是“BFS 更聪明”这句口号。 {#s1hint .hint}

## 只改一条边，frontier 就会改写 {#step2 h2=s2t}

::: strings
nav2: 2 改一条边
:::

第 2 步 · 因果实验 {#s2k .step-kicker i18n=text}

先重置遍历，再切换一条边，然后继续单步。把注意力放在**第一个不同的容器状态**：它就是结构改动传到算法行为的因果链。 {#s2e .explain}

::: html step2-1
edgeHint: 当前改动
frontierHint: 下一批 frontier
goalHint: 实验目标
goalText: 找到第一次分叉
:::

恢复示例图即可回到固定基线；你可以反复切换同一条边，比较 BFS 和 DFS 的第一处差异。 {#s2hint .hint}

## 复杂度来自“每个节点和每条边被看几次” {#step3 h2=s3t}

::: strings
nav3: 3 复杂度
:::

第 3 步 · 记账 {#s3k .step-kicker i18n=text}

用邻接表实现时，BFS 和 DFS 都会把每个节点入队/入栈一次，并扫描每条边的邻接项一次。于是工作量随 **V + E** 增长；容器不同，复杂度相同，顺序不同。 {#s3e .explain}

::: html step3-1
formulaNote: V：节点数 · E：边数 · 无向图的邻接表会看到 2E 个邻接项
:::

把一条边关掉，E 会减 1（无向图的邻接项减 2），但仍然是同一个增长形状。复杂度描述的是规模趋势，不是这一次运行的秒表。 {#s3hint .hint}

## 把选择写成一句可复用的规则 {#step4 h2=s4t}

::: strings
nav4: 4 收束
:::

第 4 步 · 收束 {#s4k .step-kicker i18n=text}

需要“离起点几步远”的层次答案时，选 BFS；需要沿着一条分支深入、做回溯或找连通块时，选 DFS。两者都依赖**已访问集合**，所以不会在环里无限打转。 {#s4e .explain}

::: html step4-1
finalRule: 可迁移规则：
finalText: 容器决定顺序，已访问集合保证终止，邻接表决定 O(V+E)。先画 frontier，再写代码。
:::
