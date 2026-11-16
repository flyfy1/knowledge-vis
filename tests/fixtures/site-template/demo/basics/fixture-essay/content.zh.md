---
lang: zh
title: 样例长文 · 测试用
desc: 模板构建的测试夹具。
---

::: strings
nav.back: ← 知识索引
nav.lang: 语言
toc.label: 目录
toc.title: 目录
u.ms: {v} 毫秒
:::

# 样例长文 {#hero}

::: strings
kicker: 测试 · 夹具
:::

一句副标题。<br>第二行。 {.sub}

这一页只给测试用。 {.lead}

## 层次 {#ch1}

::: strings
toc: 层次
:::

先看结构。 {.law}

一个存储系统分上下两层，见[[fixture-target#ch2|被引用页面第 2 章]]，也见[[concept:缓存行]]。

::: diagram dg-stack keys=dg.stack
cap: 图 1　上下两层（示意，不按比例）。
aria: 结构图：上层和下层
top: 上层
bottom: 下层
:::

本页第 2 章见[[#ch2|下一章]]。**加粗**和*强调*照常写，星号本身写成 \*。

## 等待 {#ch2}

::: strings
toc: 等待
:::

平均寻道 {=ch2.seek} 毫秒，每秒约 {=ch2.iops} 次。

::: diagram dg-flow keys=dg.flow
cap: 图 2　一次读取的流程（示意）。
step1: 寻道
step2: 转动
:::

::: lab ch2-model
model.title: 一次随机读
model.aria: 柱状图：寻道和转动等待
say.full: 寻道 {s} 毫秒，转动 {r} 毫秒。
:::

### 已确立 {#h.est .sub3}

- 第一条 {#e1}
- 第二条 {#e2}

模型的边界。 {.take}

::: footer
样例长文 · 测试夹具。

来源见 BRIEF。
:::
