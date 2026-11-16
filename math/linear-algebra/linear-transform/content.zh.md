---
lang: zh
---

::: strings
docTitle: 二维线性变换 · 一步一交互
back: ← 知识索引
pageTitle: 二维线性变换 · 基向量怎样带着整个平面走
tagline: 把平面上的每个点都看成两根基向量的组合。拖动矩阵，亲眼看见网格被拉伸、剪切或翻面；行列式读出面积怎样变，退化时一整片平面怎样压成一条线。
provenance: 本页用纯二维实矩阵讲解基向量、行列式与可逆性；数值读数四舍五入，计算仍用浮点真值。
foot: visual.integ.life · 二维线性变换 Linear Maps
:::

## 四个数，拖动整个平面 {#step0 h2=s0t}

::: strings
nav0: 0 网格变形
:::

第 0 步 · 钩子 {#s0k .step-kicker i18n=text}

矩阵 **A** 不需要逐点告诉平面怎么走：只要说清楚两根基向量 **e₁=(1,0)**、**e₂=(0,1)** 去了哪里，所有网格点就跟着被决定。拖动四个数，看网格、两个基向量和单位正方形一起变。 {#s0e .explain}

::: html step0-1
gridAria: 二维网格与变换后的基向量
pIdentity: 单位矩阵
pShear: 剪切
pFlip: 翻面
pReset: 回到示例
:::

先盯住橙色 Ae₁ 与粉色 Ae₂：它们是变换的两根“方向尺”。任意点都由它们按坐标合成。下一步把这笔账写出来。 {#s0hint .hint}

::: html step0-2
start: 开始探索 ↓
:::

## 每个点，都是两根基向量的合成 {#step1 h2=s1t}

::: strings
nav1: 1 基向量记账
:::

第 1 步 · 记账 {#s1k .step-kicker i18n=text}

选一个点 p=(x,y)。蓝色先走 x 份 e₁、再走 y 份 e₂；橙色点是 A 作用后的结果。注意坐标 x、y 没有被“重新计算”：同一笔系数，换了两根基向量就得到新的位置。 {#s1e .explain}

::: html step1-1
basisAria: 输入点与变换后点的基向量分解
xLab: x：e₁ 的份数
yLab: y：e₂ 的份数
:::

这就是线性：A(xe₁+ye₂)=xAe₁+yAe₂。知道基向量的去向，就知道整个平面的去向；原点仍在原点，因为没有额外平移。 {#s1hint .hint}

## 行列式是有符号的面积倍率 {#step2 h2=s2t}

::: strings
nav2: 2 行列式读面积
:::

第 2 步 · 行列式 {#s2k .step-kicker i18n=text}

单位正方形被送成一个平行四边形。**det A=ad−bc** 给出它的有符号面积：绝对值是面积放大倍数，负号表示方向翻面。 {#s2e .explain}

::: html step2-1
detAria: 单位正方形和变换后的平行四边形
areaLabel: 单位正方形 → 变换后的平行四边形
detPositive: 正向：det > 0
detNegative: 翻面：det < 0
detZero: 零面积：det = 0
:::

面积不是“看起来差不多”：它由两根输出基向量张成的平行四边形精确决定。det=2 就是面积变两倍，det=−1 是等面积但反向。 {#s2hint .hint}

## det = 0：平面被压成一条线 {#step3 h2=s3t}

::: strings
nav3: 3 可逆还是坍缩
:::

第 3 步 · 可逆性 {#s3k .step-kicker i18n=text}

当 det=0，两根输出基向量共线，单位正方形的面积变成 0。许多不同输入会落在同一个结果上，信息无法从结果唯一找回。det≠0 时才存在逆矩阵。 {#s3e .explain}

::: html step3-1
inverseAria: 可逆与退化矩阵的网格
invertBtn: 试着反变换
invertReset: 清空
invCard1H: det ≠ 0
invCard1: 两根输出基向量不共线，每个结果都有唯一的输入；逆矩阵存在。
invCard2H: det = 0
invCard2: 两根输出基向量落在同一条线上，信息被压扁；不同输入可能撞到同一个结果。
:::

把“能不能倒回去”先看成几何问题：网格有没有被压扁？行列式提供了同一个问题的一个数字答案。 {#s3hint .hint}

## 先做 A，再做 B：顺序真的会改变结果 {#step4 h2=s4t}

::: strings
nav4: 4 组合与自测
:::

第 4 步 · 组合与自测 {#s4k .step-kicker i18n=text}

两个矩阵连续作用时，右边的先做：**BAp** 表示先 A 后 B。一般情况下 AB≠BA；画面中的同一个点会落在不同位置。 {#s4e .explain}

::: html step4-1
composeAria: 先做 A 再做 B 与相反顺序的比较
orderAB: A → B
orderBA: B → A
quizH: 小测：哪一个读数是 det(A)？
quizA: 1.03
quizB: 0.83
quizC: −1.00
final1H: 矩阵就是规则
final1: 只要知道两根基向量去了哪里，线性变换对整个平面的作用就被决定了。
final2H: 行列式就是账本
final2: 它记录面积倍率和方向是否翻转；det 为零时，账本显示信息丢失。
final3H: 下一站：特征方向
final3: 有些向量经过 A 只改变长度、不改变所在直线——那就是 [[eigenvectors#step1|特征向量]]。
:::

从一张网格到一条线，线性代数一直在做同一件事：选择一组基，追踪它们的去向，再用代数把几何变化记账。 {#finale .finale}

::: strings
inv: 可逆
singular: 退化
:::
