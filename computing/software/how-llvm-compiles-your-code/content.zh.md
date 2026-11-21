---
lang: zh
title: LLVM 如何把源码编译成机器码 · 一篇可以动手的长文
desc: 一行 clang -O2 sum.c 的背后，编译器到底做了什么？本文按宿主机 Apple Clang 21.0.0（LLVM 21）的实测中间表示、Pass 结构与 ARM64 / x86_64 汇编，把从源码到机器码的整条链拆开：三段式架构、-O0 的栈槽、SSA 与 mem2reg 的 phi 节点、Pass 不动点迭代、循环外提与 SIMD 向量化、未定义行为 nsw、指令选择、寄存器分配、ThinLTO 与 2026 年 11 月前沿。
---

::: strings
nav.back: ← 知识索引
nav.lang: 语言
toc.label: 目录
toc.title: 目录
u.x: {v} 倍
u.none: 无
:::

# LLVM 如何把源码编译成机器码 {#hero}

::: strings
kicker: 计算机 · 软件原理 · 一篇可以动手的长文
:::

你敲下一行 <code>clang -O2 sum.c -o sum</code>，几百毫秒后就多了一个能直接跑的可执行文件。<br>在这中间，LLVM 到底把你的源码揉碎又重组了多少次？ {.sub}

写 C、C++、Rust 或 Swift 的时候，我们通常把编译器当成黑盒：左边吃进文本，右边吐出机器指令。可一旦遇到"开了 <code>-O2</code> 怎么把我的检查删了""加了 <code>restrict</code> 怎么突然快了四倍""为什么局部变量多到一定程度性能突然掉崖"，黑盒就不再够用。这篇文章只追一个问题：**执行 <code>clang -O2 foo.c</code> 时，LLVM 从中端中间表示（IR）到硬件指令之间到底干了什么？**我们按它真正运行 Pass 的顺序往下走：先看怎么把栈变量变成每个名字只赋值一次的 SSA，再看几个小 Pass 怎么一遍遍把代码消到不动点，接着看循环、别名分析、未定义行为如何解锁激进优化，最后看后端怎么把 IR 贴成特定 CPU 的指令、塞进有限的物理寄存器，并在链接时跨文件打通。 {.lead}

本文所有中间表示、Pass 流水线和汇编验证，全部对照本机实测的 **Apple Clang 21.0.0**（<code>clang-2100.4.1.1</code>，目标平台 <code>arm64-apple-darwin27.2.0</code>，基于 **LLVM 21**）。需要诚实说明：macOS 命令行工具只安装 <code>/usr/bin/clang</code> 驱动，不含独立的 <code>opt</code> 或 <code>llc</code> 命令行工具，因此文中的全部 IR、Pass 结构与汇编验证都直接通过 <code>/usr/bin/clang -S -emit-llvm</code>、<code>-mllvm</code> 与 <code>-flto=thin</code> 实测采集。页面不加载真实编译器；文中的九个交互模型直接用纯 JavaScript 重写核心算法（包括支配边界、图着色、线性扫描和指令平铺），并与宿主机 Clang 输出逐项核对。前置硬件知识可先看[[how-a-cpu-runs-a-program#ch1|指令集与机器码]]和[[switches-that-compute#ch1|逻辑开关与计算]]。 {.note}

## 三段式架构：为什么 Clang 和 Rustc 共享同一个中端 {#ch1}

::: strings
toc: 三段式解耦架构
:::

LLVM 把编译器切成了前端、共享中端优化器和后端三段：N 种语言各自翻译成同一份强类型 LLVM IR，共享一套优化器，再分别降级到 M 种 CPU 指令集，把 N × M 个编译器变成 N + 1 + M 个模块。 {.law}

下面是一段极短的 C 代码。在 <code>clang -O2</code> 里，前端词法分析、语法树（AST）和语义检查只发生在最前面一小步，紧接着它就被翻译成了一种长得像"无限寄存器汇编"的文本——**LLVM IR**。

::: html ch1-code
code.aria: 一段由 clang -O2 编译的 C 语言循环求和函数
code: "int sum_array(const int *restrict a, int n) {\n  int s = 0;\n  for (int i = 0; i < n; i++) {\n    s += a[i];\n  }\n  return s;\n}"
:::

如果每种语言都要直接生成每种 CPU 的机器码，维护 {=ch1.frontends} 种语言和 {=ch1.backends} 种芯片就得写 {=ch1.monoPairs} 套相互独立的编译器；按 10 个核心优化 Pass 算，理论总计要重复维护 {=ch1.monoPasses} 份优化实现。LLVM 的解法是在中间插进一层**与目标硬件无关、但带有精确类型和内存语义的 IR**。前端只管把 C、Rust、Swift、Julia 翻译成这份 IR；{=ch1.llvmPasses} 个中端优化 Pass 只需在这同一份 IR 上写一遍；后端再通过 {=ch1.llvmEdges} 条前端/后端对接边界把优化后的 IR 降成自己芯片的指令。

::: diagram dg-arch keys=dg.arch
cap: 图 1　LLVM 三段式架构（示意）。所有前端统一产出同一份不透明指针（<code>ptr</code>）与显式类型的 LLVM IR，共享中端优化 Pass，再由各后端降级成机器码。
aria: 示意图：左侧三种语言前端汇入中间的 LLVM IR，右侧分发到三种 CPU 后端
f1: Clang 前端
f2: Rustc 前端
f3: Swift / Julia
opt: 中端优化
sum: N + 1 + M 接口取代 N × M 对接
:::

在实测的 LLVM 21（Apple Clang 21.0.0）里，这份 IR 还有一个和早期教材不同的变化：**指针不再带类型**。以前你会看到 <code>i32*</code>、<code>ptr*</code>，如今统统写作不透明指针 <code>ptr</code>——指针指向什么类型，交给 <code>load i32, ptr %p</code> 这种读取指令自己声明。这一改动消除了无数无意义的 <code>bitcast</code> 转换，也让中端 Pass 简洁得多（第 10 章会回到它的时间线）。

::: lab ch1-model
model.title: N × M 单体架构 vs N + 1 + M 三段式架构
model.how: 拖动语言前端数 N、硬件后端数 M 和中端优化 Pass 数 P，对比"每对语言-架构各写一套"的单体模式与 LLVM 共享中端需要维护的模块总量；勾选切换图中的连线视图。
ctl.fe: 前端语言 N
ctl.be: 目标架构 M
ctl.pass: 优化 Pass P
ctl.mono: 对比：单体 N × M 架构
cv.aria: 语言前端、共享 LLVM IR 中枢与硬件后端的连接图及模块数对比柱状图
cv.mono: 单体模式：N × M 条独立通道
cv.llvm: LLVM 模式：N → IR → M
cv.bars: 需维护的总组件数（越少越省）
read.mono: 单体总组件
read.llvm: LLVM 总组件
read.passes: 活跃优化实现份数
read.ratio: 规模放大倍率
say.mono: 当前选了 {n} 种语言、{m} 种架构、{p} 个 Pass：若不共享中端，需要 <em>{pairs} 条编译器链路</em>、共写 {mp} 份优化实现，总模块 <em>{mc}</em> 个——比 LLVM 的 {lc} 个多出 {ratio} 倍。
say.llvm: 当前 {n} 种语言 + {m} 种架构通过同一份 LLVM IR 连接：只需 <em>{edges} 条对接边</em> 和 <em>{lp} 份共享优化</em>（总模块 {lc} 个，相比单体 {mc} 个压缩了 {ratio} 倍）。
:::

当然，现实并不像乘法表那么理想。IR 并非完全不知道目标机器：循环向量化宽度（第 5 章）、内联阈值、指针大小和字节序（<code>target datalayout</code>）都要通过 <code>TargetTransformInfo</code> 悄悄把芯片特性告诉中端。即使如此，把通用数据流分析和芯片指令集解耦，仍是现代编译基础设施能养活几十种语言的核心原因。

模型省掉了：前端 AST 降级的工作量差异、跨语言运行时（如 Swift 引用计数或 Rust 借用检查）的专属 Pass，以及目标机器信息对中端启发式规则的微调。 {.take}

## 从语法树到 `-O0` IR：为什么局部变量先躺在栈上 {#ch2}

::: strings
toc: 从 AST 到 -O0 栈变量
:::

前端把源码翻译成最初的 LLVM IR 时，不会自己做复杂的数据流分析，而是把每个局部变量和参数都用 <code>alloca</code> 扔进栈槽，再配满内存读写指令。 {.law}

为什么编译器在 <code>-O0</code> 下跑得那么慢？用 <code>/usr/bin/clang -S -emit-llvm -O0</code> 编译开头那段只有 6 行的 <code>sum_array</code>，你会看到编译器在函数入口直接开出了 {=ch2.allocas} 块栈内存（共 {=ch2.stackBytes} 字节）：参数 <code>a</code> 和 <code>n</code>、累加器 <code>s</code>、循环变量 <code>i</code> 全都被塞进 <code>alloca</code> 栈槽。每跑一轮循环，CPU 都要老老实实从栈里把 <code>i</code> 读出来加 1 再存回去，再把 <code>s</code> 读出来加上 <code>a[i]</code> 再存回栈里。

::: diagram dg-alloca keys=dg.alloca
cap: 图 2　<code>-O0</code> 与 <code>-O2</code> 对待局部变量的根本区别：前端只负责忠实地把变量映射成栈内存槽位（<code>alloca</code>），由中端优化 Pass 统一把它们提升成虚拟寄存器。
aria: 示意图：左侧 -O0 将变量存入 alloca 栈槽并反复读写，右侧 -O2 提升为寄存器和 phi 节点
left: -O0：栈上变量
slot: 占栈槽内存
mem: 每步读写内存
right: -O2：SSA 寄存器
vreg: 无栈内存槽
nomem: 零局部读写
:::

前端之所以这么"懒"，是刻意分工的结果：如果前端在遍历语法树时就试图追踪"这个变量在 <code>if-else</code> 的哪条分支里被改过"，前端就得为每种语言重写一遍数据流和支配树分析。相反，栈槽是天然的"可变盒子"——只要每个变量占一块唯一的地址，前端哪怕碰到最复杂的分支嵌套、<code>goto</code> 或变量遮蔽，只需要机械地生成 <code>store</code> 和 <code>load</code> 就一定不会错。

::: lab ch2-model
model.title: -O0 栈槽读写 vs -O2 寄存器提升
model.how: 选择函数并拖动循环次数，对比 -O0（所有局部变量通过 alloca 反复读写栈内存）与开启寄存器提升后的内存访存次数与指令数差异；下方同步展示本机 Apple Clang 21.0.0 实测片段。
ctl.snip: 示例函数
snip.sum_array: sum_array（循环）
snip.pick_phi: pick_phi（分支）
ctl.iter: 循环次数
ctl.promo: 提升局部栈变量（-O2 模式）
cv.aria: 随循环次数变化的 -O0 栈访存总次数与 -O2 真实访存次数折线对比图
cv.x: 循环迭代次数
cv.y: IR 内存读写次数
cv.o0: -O0（含 alloca 栈读写）
cv.o2: -O2（仅真实数组读）
code.o0: 实测 -O0 IR（局部 alloca）
code.o2: 实测 -O2 IR（提升后）
read.alloc: 活跃 alloca 栈槽
read.stack: 栈槽读写次数
read.mem: 总内存访存次数
read.insn: IR 指令总数
say.o0: 在 <code>-O0</code> 下，{allocas} 个局部变量占用 {bytes} 字节栈槽：运行 {it} 轮一共产生 <em>{stack} 次多余栈内存读写</em>，加上数组读取 {arr} 次，总访存 {total} 次。
say.o2: 提升为寄存器后，<code>alloca</code> 归零：全部 {stack} 次局部变量读写变成零，仅剩必要的数组读 <em>{arr} 次</em>——共省掉 <em>{saved} 次</em>内存访问（对比 -O0 的 {o0} 次）。
:::

在默认的 8 轮循环里，<code>-O0</code> 一共要执行 {=ch2.o0Mem} 次 IR 内存读写，而真正读取输入数组只需要 {=ch2.o2Mem} 次，多出来的 {=ch2.savedMem} 次全是在跟栈帧来回倒腾局部变量。

模型省掉了：现实 CPU 的 L1 缓存和 Store-to-Load Forwarding 硬件转发（它们会掩盖一部分 <code>-O0</code> 栈读写的真实延迟），以及未完全展开的标量代码生成开销。 {.take}

## 静态单赋值（SSA）与 `mem2reg`：`phi` 节点插在哪里 {#ch3}

::: strings
toc: SSA 静态单赋值与 phi 节点
:::

静态单赋值（SSA）规定每个虚拟寄存器在整个函数里只能被赋值一次；当不同控制流分支给同一个变量赋了不同值并汇合时，<code>mem2reg</code> 会在汇合点插一条 <code>phi</code> 指令合并版本。 {.law}

把 <code>alloca</code> 消掉并不容易：在直线代码里，<code>x = 1; x = x + 2;</code> 只要改名成 <code>%x.0 = 1; %x.1 = add %x.0, 2</code> 就行。但如果前面有一个 <code>if-else</code>，两条分支各给 <code>x</code> 赋了一次新值，汇合点后面的 <code>return x + 5</code> 到底该读左边还是右边？

LLVM 用两条规则解决了这个问题：第一，**静态单赋值（SSA）**——每一个虚拟寄存器（比如 <code>%x.0</code>、<code>%x.1</code>）在代码文本里只能出现一次作为赋值目标，这样任何一条指令想找"我的操作数是谁算出来的"，顺着指针一眼就能跳回唯一的那一行定义，再也不用扫遍整个基本块去查"前面有没有谁半路改写过它"。第二，**<code>phi</code> 伪指令**——在两条分支汇合的基本块开头，写一句 <code>%x.3 = phi i32 [ %x.1, %then ], [ %x.2, %else ]</code>，意思是"如果刚才是从 <code>%then</code> 跳进来的就取 <code>%x.1</code>，从 <code>%else</code> 跳进来的就取 <code>%x.2</code>"。

::: diagram dg-ssa keys=dg.ssa
cap: 图 3　菱形控制流图（CFG）与支配边界。B0 支配 B1、B2 和 B3，但 B1 与 B2 互不支配 B3——因此 B3 是 B1 和 B2 的支配边界（Dominance Frontier），<code>mem2reg</code> 正好在这里插入 <code>phi</code> 节点。
aria: 示意图：入口块 B0 分支到 B1 和 B2 再汇合到 B3，B3 标为支配边界并包含 phi 节点
df: 支配边界（插入 phi）
:::

**<code>phi</code> 该插在哪些块里，才不多不少？**这靠**支配边界（Dominance Frontier）**计算（Cytron 等人，1991）。如果从函数入口走到块 <code>Y</code> 必须经过块 <code>X</code>，就说 <code>X</code> 支配 <code>Y</code>。如果 <code>X</code> 支配 <code>Y</code> 的某一个前驱、但又不严格支配 <code>Y</code> 本身（比如右图里的 <code>then</code> 块支配了它自己，它是汇合块 <code>merge</code> 的前驱，但它不支配 <code>merge</code>，因为入口还能从 <code>else</code> 绕过去），那么 <code>merge</code> 就在 <code>then</code> 的支配边界里——凡是有变量定义落在 <code>X</code> 里，它的影响边界就正好停在 <code>merge</code> 的门口，必须插 <code>phi</code>。在 Apple Clang 21.0.0 的真实优化流水线里，承担这项工作的叫 <code>SROAPass</code>（它把聚合体拆成标量并直接执行 <code>mem2reg</code>）。

::: lab ch3-model
model.title: 支配边界计算与 SSA phi 自动插入器
model.how: 切换四种常见控制流形状（菱形分支、单边 if-then、循环回边、串行嵌套分支），开关 mem2reg，观察页面里真实的支配树与迭代支配边界算法如何自动定位 [DF] 块、插入 phi 节点并把栈内存读写压到零。
ctl.cfg: 控制流图形状
cfg.diamond: 菱形 if-else
cfg.ifThen: 单边 if-then
cfg.loop: 循环回边
cfg.chained: 串行嵌套
ctl.pass: 运行 mem2reg / SROA
cv.aria: 控制流图基本块连线、支配边界标号及重命名后的 SSA 版本展示
read.phi: 插入的 phi 节点
read.ver: 生成的 SSA 版本数
read.mem: 剩余栈访存
read.df: 支配边界块
say.ssa: 算法沿着支配树走完重命名：在支配边界 <em>{df}</em> 插入了 <em>{phis} 个 phi 节点</em>，拆出 {vers} 个只赋值一次的寄存器版本，原来的 {bmem} 次栈访存降到 <em>{amem}</em>。
say.alloca: 未运行 <code>mem2reg</code> 时，分支两侧只能往同一块栈内存里写值，汇合后仍要靠 <em>{bmem} 次栈读写</em> 拿回结果。
:::

观察模型里的**循环回边**：<code>header</code> 块之所以出现 <code>phi</code>，是因为 <code>body</code> 跳回了 <code>header</code>，却又没有支配 <code>header</code>（第一次是从 <code>entry</code> 进来的），所以循环体里的累加变量自动在循环头收束成一个 <code>phi</code>——这正是后面所有循环优化的起点。对照默认菱形分支：它用 {=ch3.phiCount} 个 <code>phi</code> 就把原来的 {=ch3.beforeMem} 次栈访存清成了 {=ch3.afterMem}。

模型省掉了：地址被取走（<code>&amp;x</code> 逃逸到未知指针）的局部变量——只要某个变量可能被别的指针间接读写，<code>mem2reg</code> 就不能安全地把它提进纯 SSA 寄存器，必须保留栈槽或留给 SROA 局部拆解。 {.take}

## Pass 管线：代码是怎么一遍遍缩水到不动点的 {#ch4}

::: strings
toc: Pass 管线与不动点迭代
:::

优化器不是一个无所不能的大脑，而是一串只干一件事的小 Pass 排队运行：前一个 Pass 把表达式捏薄，后一个 Pass 才看得出分支是死的，直到整轮跑完没有任何指令变化——到达不动点。 {.law}

看一个在真实源码里常出现的片段（模板展开或宏替换后尤其常见）：

<pre class="code">int dead_branch(int x) {
  int a = x * 2 + 0;
  int b = a - a;
  if (b != 0) return 999;
  return a + 3;
}</pre>

单独把任何一条规则拿出来，都不能一步把它缩成最简：<code>SROA</code> 只管消掉栈槽，不看算术；<code>InstCombine</code> 擅长代数化简（把 <code>* 2</code> 变成左移一位 <code>shl 1</code>、<code>+ 0</code> 抹掉、<code>a - a</code> 化简为 <code>0</code>、<code>0 != 0</code> 折叠成常量 <code>false</code>），但它自己不删基本块；<code>SimplifyCFG</code> 专门清理控制流图，它看到 <code>br i1 false, %dead, %live</code> 才把死分支整个砍掉、把剩下的块缝成一条直线；最后 <code>ADCE</code>（激进死代码消除）把再也没有人用的指令扫光。

::: diagram dg-pipeline keys=dg.pipeline
cap: 图 4　LLVM 新 Pass 管理器（New Pass Manager）里的经典中端循环。每个 Pass 各自只盯一种简单局部模式，但一轮清理往往又暴露出下一轮的新化简机会，直到再无变化。
aria: 示意图：SROA、InstCombine、SimplifyCFG+GVN、ADCE 顺次连接，并带有虚线反馈回环指向不动点
p1: 栈提升与聚合拆分
p2: 指令合并与常量折叠
p3: 控制流化简与全局值编号
p4: 死代码清理
fix: 迭代到不动点
:::

在宿主机 Apple Clang 21.0.0 上，用 <code>-mllvm -debug-pass=Structure</code> 和 <code>-mllvm -print-after=instcombine</code> 可以亲眼看到这个过程：<code>dead_branch</code> 最初有 {=ch4.startOps} 条待清理的 IR 操作，经过 {=ch4.rounds} 轮关键 Pass 交接后，最终只留下 {=ch4.endOps} 条（<code>shl nsw</code>、<code>add nsw</code> 和 <code>ret</code>），而那条 <code>return 999</code> 的分支和栈框彻底消失在二进制里。

::: lab ch4-model
model.title: 固定点优化流水线步进器
model.how: 选一段示例 IR，连续点击"单步执行下一个 Pass"观察每一次规则触发后指令行如何一层层坍缩；也可以直接点"跑到不动点"一次看完，或"重置"从头比对。
ctl.pre: IR 示例
pre.dead_branch: 算术与死分支
pre.inline_fold: 内联后常量折叠
pre.cse_chain: 公共子表达式 (GVN)
ctl.step: 单步执行下一个 Pass
ctl.fix: 跑到不动点
ctl.reset: 重置到 -O0
cv.aria: 展示当前 Pass 阶段及逐行缩水中的 LLVM IR 指令清单
read.round: 当前轮次
read.ops: 剩余 IR 指令
read.mem: 局部栈访存
read.state: 收敛状态
state.fixed: 已达不动点
state.active: 仍可继续化简
detail.raw: 刚从前端吐出：局部变量占着栈槽，算术和死分支全在。
detail.sroa: SROA 把局部变量提成虚拟寄存器，消掉了所有局部 load/store。
detail.instcombine: InstCombine 把 *2 换成 shl 1、a-a 折成 0、把比较折成 false。
detail.simplifycfg: SimplifyCFG 发现条件恒假，直接整块删掉死分支并合并基本块。
detail.inline: 内联把被调函数体搬进调用点，常量实参 10 和 12 立刻暴露出来。
detail.fold: 常量折叠一口气把 10*3+12 算死成常量 42，整段函数只剩一条 ret。
detail.gvn: GVN（全局值编号）看出两次 a*b 值相同，删掉重复乘法。
detail.instcombine_cse: InstCombine 再把两个相同值相加折成左移 1 位，到达不动点。
say.step: 刚跑完 <em>{pass}</em>：还剩 {ops} 条指令（已从最初 {start} 条删掉 {removed} 条）。{detail}
say.fixed: 到达不动点（<em>{pass}</em>）：整段函数从 {start} 条指令缩到只剩 <em>{ops} 条</em>。{detail}
:::

这种"小 Pass + 多轮交错"的设计解释了编译时间为什么会在 <code>-O2</code> 和 <code>-O3</code> 之间跳涨：每个 Pass 本身只做局部模式匹配（<code>InstCombine</code> 在 LLVM 里有数万行模式规则），真正费时间的是为了避免Pass 顺序死锁，流水线必须重复跑好几轮。

模型省掉了：LLVM 真实 CGSCC 管线里上百个分析缓存（<code>PreservedAnalyses</code>）的失效重算、启发式内联成本模型，以及 <code>InstCombine</code> 内部基于工作列表的局部迭代。 {.take}

## 循环优化：LICM 提不变量、别名分析与 SIMD 向量化 {#ch5}

::: strings
toc: 循环外提、别名与 SIMD 向量化
:::

循环占了程序大部分运行时间，但编译器能不能把循环里重复算的表达式往外提（LICM），甚至把循环打包成一行吃进 4 个数的 SIMD 向量指令，全看它能不能证明**指针之间不打架**。 {.law}

看下面两段几乎一模一样的 C 循环：唯一区别是有没有在指针参数上写 <code>restrict</code>（告诉编译器这几根指针指向的内存块互不重叠）。

<pre class="code">for (int i = 0; i &lt; n; i++) {
  out[i] = a[i] + (*b * 2);
}</pre>

按人的直觉，<code>*b * 2</code> 在整趟循环里根本没变，当然应该在进入循环前（**Preheader** 预备块）算一次放在寄存器里，然后循环体里一次打包读取 4 个 <code>i32</code> 做 ARM64 NEON <code>&lt;4 x i32&gt;</code> 向量加法（正如[[how-a-cpu-does-math#ch9|SIMD 向量指令]]和[[how-a-cpu-does-math#ch10|编译器何时自动向量化]]讲的）。但我们在本机 Apple Clang 21.0.0 上实测 <code>hoist_demo</code>（无 <code>restrict</code>）和 <code>hoist_restrict</code>（有 <code>restrict</code>）的 <code>-O2</code> IR 时，看到了惊人的差异：没有 <code>restrict</code> 时，编译器没法保证 <code>out[i]</code> 会不会刚好指着 <code>b</code> 所在的同一个内存格子！万一第 0 轮写完 <code>out[0]</code> 把 <code>*b</code> 改掉了，第 1 轮外提就全错了。于是 Clang 被迫在循环前面插入一串运行期指针区间比较（<code>icmp ult ptr</code>）作为保安：只有运行期确认不重叠才敢跳进快向量分支，否则只能退回逐个重读 <code>*b</code> 的慢速标量循环；加了 <code>restrict</code>（在 IR 里变成 <code>ptr noalias</code>）后，这串运行期检查瞬间消失，干干净净直接起飞。

::: diagram dg-licm keys=dg.licm
cap: 图 5　循环优化的三段结构：先由 LICM 把不变量 <code>*b * 2</code> 提到循环外面的预备块（Preheader），再由 LoopVectorize 把主体打包成 128 位 <code>&lt;4 x i32&gt;</code> 向量块，最后用标量尾循环扫平余数。
aria: 示意图：顶部 Preheader 计算循环不变量，中部向量循环一次处理 4 个整数，底部标量尾循环处理不足 4 个的剩余元素
pre: Preheader（只算一次）
vec: 向量化主体（每次 4 个）
tail: 标量尾循环
taild: 处理 N mod 4 个余数元素
:::

另一种消除顾虑的办法是**基于类型的别名分析（TBAA）**：在 C/C++ 的严格别名规则下，编译器默认 <code>float*</code> 和 <code>int*</code> 不会指向同一块合法对象（除非用 <code>char*</code> 或 <code>-fno-strict-aliasing</code>），从而允许跨类型直接外提和向量化。对 <code>n = 20</code>、4 路 NEON 向量来说，无优化标量循环要执行 {=ch5.unoptOps} 步操作，外提加上 {=ch5.vecIters} 轮向量批量执行后只剩 {=ch5.vecOps} 步操作。

::: lab ch5-model
model.title: LICM 外提、别名障碍与 SIMD 向量宽度实验
model.how: 调节数组长度 N 和向量宽度（1 / 4 / 8 通道），再切换指针别名状态（可能重叠 vs restrict noalias vs TBAA 异类型），观察运行期别名检查与循环体每次重载 *b 的代价怎么变化。
ctl.n: 数组长度 N
ctl.alias: 指针别名状态
alias.unknown: 无 restrict（可能重叠）
alias.restrict: restrict (noalias)
alias.tbaa: 不同类型 (TBAA)
ctl.vf: 向量宽度 VF
vf.1: 标量 (1)
vf.4: NEON <4×i32>
vf.8: AVX2 <8×i32>
ctl.licm: 开启 LICM 外提
ctl.ov: 模拟运行期指针真的重叠
cv.aria: Preheader 外提状态、运行期指针检查、向量通道块划分及前后总操作数对比
cv.pre: 循环前准备与检查
cv.hoist_ok: Preheader：已外提 *b*2
cv.hoist_no: 未外提：循环内反复重读 *b
cv.ov_hit: 运行期重叠：退回标量慢路径
cv.ov_ok: 运行期检查通过：进入快路径
cv.lanes: 前 {k} / {n} 个元素的执行打包方式
cv.cost: 优化前（红）vs 当前总操作数（绿）
read.reloads: 循环内重读 *b
read.vec: 向量批次数
read.tail: 标量尾次数
read.ops: 循环等效操作数
why.static: 编译器在编译期就能证明指针绝不重叠，零检查直接外提并向量化。
why.guarded: 没有 noalias/TBAA，Clang 只能插入运行期指针边界对比，通过才进快路径。
why.fallback: 指针在运行期真的重叠了，保安分支把控制流踢回每次重读 *b 的标量慢循环。
why.unopt: 未开外提且宽度为 1：每个元素都要重读并重算一次不变量。
say: 处理 {n} 个元素（每批 <em>{vf} 路</em>）：向量循环跑 {vec} 轮、标量收尾 {tail} 轮，循环内重读 *b 共 <em>{rel} 次</em>，等效 {ops} 步（未优化为 {base} 步，压缩 {speed} 倍）。{why}
:::

本机 Apple Clang 21.0.0 在 <code>sum_array</code> 上还做了另一层把戏：它不仅用 <code>&lt;4 x i32&gt;</code>，还把向量循环**展开了 4 倍**（每次迭代用 <code>ldp q4, q5</code> 与 <code>ldp q6, q7</code> 一口气吃掉 16 个整数，再用 4 条独立的 <code>add.4s</code> 累加器并行喂满 Apple Silicon 的多条执行流水线），最后才做一次水平求和 <code>addv.4s</code>——从而顺带避免单一累加器的流水线数据冒险。

模型省掉了：循环展开因子（interleave count）、跨步访问成本、对齐检查（alignment peeling），以及浮点加法不满足结合律导致无 <code>-ffast-math</code> 时浮点累加默认不能向量化的限制。 {.take}

## 未定义行为（`poison`）：为什么优化器敢把你的检查整段删掉 {#ch6}

::: strings
toc: 未定义行为与优化通行证
:::

在 C/C++ 的合同里，有符号整数溢出和空指针解引用是"未定义行为"；LLVM 把它们翻译成 <code>add nsw</code> 和 <code>poison</code> 值，而优化器有权假设任何到达这里的合法输入都不会触发 <code>poison</code>——于是安全检查被合法地整段删光。 {.law}

很多人以为"有符号整数溢出不就是补码绕回到负数吗？"——在硬件层面确实如此：32 位有符号整数的最大值 <code>INT_MAX</code>（{=ch6.intMax}）加 1，在 CPU 加法器里绕一圈变成 <code>INT_MIN</code>（{=ch6.intMin}），比原来的 <code>x</code> 更小。写一句防御代码 <code>if (x + 1 &gt; x)</code>，看起来像是稳妥地拦住溢出。

可一旦交给 <code>clang -O2</code>，事情完全反转。C 标准规定**有符号整数溢出是未定义行为（UB）**。前端把它翻译成 LLVM IR 时，会在加法上贴一个 <code>nsw</code> 标签（No Signed Wrap）：<code>%1 = add nsw i32 %x, 1</code>。在 LLVM 的语义里，如果这次加法真的发生了有符号溢出，指令的结果不是绕回的负数，而是一个毒性占位符 **`poison`**——一种比普通值更"毒"的状态：如果任何控制流或条件分支依赖了 <code>poison</code>，优化器被授权认为"这绝对不会在合法程序里发生"。因此，在一切非 <code>poison</code> 的世界里，<code>x + 1</code> 永远严格大于 <code>x</code>——于是整个比较在 <code>-O2</code> 里直接蒸发成 <code>ret i32 1</code>！

::: diagram dg-ub keys=dg.ub
cap: 图 6　同一句 C 代码 <code>x + 1 &gt; x</code> 在 <code>x = INT_MAX</code> 时的分叉：硬件补码真的绕成负数（左），而 IR 的 <code>add nsw</code> 产生 <code>poison</code>，让 <code>-O2</code> 优化器把它证真并删掉整个检查（右）。
aria: 示意图：顶部 x=INT_MAX 分叉为左侧硬件补码绕回与右侧 LLVM nsw poison 优化删支
src: C 源码：x + 1 > x
hw: 硬件 (-O0/-fwrapv)
hwres: 绕回负数 -> 0
ir: LLVM IR (-O2)
irres: 折叠为 ret 1
:::

更耐人寻味的是开启 <code>-fwrapv</code>（告诉 Clang 有符号整数按补码回绕定义）之后，在本机 Apple Clang 21.0.0 上实测会发生什么：**Clang 并不是呆呆地做一次加法再比大小，而是直接把它化简成 `%2 = icmp ne i32 %0, 2147483647`**！只有在能保证不触发 UB 的时候，优化器才会帮你保留那个"唯一能绕回"的边界点。

::: lab ch6-model
model.title: nsw 溢出与空指针检查为什么会凭空消失
model.how: 保持默认场景（x = INT_MAX）和 -O2 + nsw，看硬件补码明明返回 0、编译结果却返回 1；切换成 -fwrapv 或 -O0 立刻恢复一致。再切换到"先解引用后判空"场景看同一种 UB 逻辑怎么把空指针检查抹掉。
ctl.scen: UB 场景
scen.overflow: 有符号溢出 (x+1 > x)
scen.null: 先解引用后判空
ctl.mode: 语义合同
mode.nsw: 标准 C (nsw / UB)
mode.wrapv: -fwrapv (补码安全)
ctl.opt: 优化级别
opt.O0: -O0（不折叠）
opt.O2: -O2（激进优化）
ctl.x: 输入整数 x
ctl.pnull: 运行期传入 p = NULL
cv.aria: x 在 INT_MAX 处的补码回绕与优化器恒真折叠对比图
cv.fold: 折叠为恒真 ret 1（检查已被删）
cv.keep: 保留真实边界判断
cv.del: 整段 if (!p) 被删！
code.title: 等效输出 LLVM IR
read.hw: 硬件补码语义
read.opt: 编译后实际结果
read.poison: 是否触发 poison / UB
read.div: 源码直觉 vs 机器行为
yes: 是 (poison)
no: 否
div.yes: 行为背离！
div.no: 一致
say.ov_bug: 当 x = {x} 时，硬件补码会绕成 {w}，直觉该返回 {hw}；但 <code>add nsw</code> 把溢出当成 <code>poison</code>，<code>-O2</code> 直接删掉了判断，<em>硬生生返回了 {optv}</em>。
say.ov_ok: 当 x = {x} 时，硬件计算是 {hw}，编译后的代码也返回 <em>{optv}</em>——要么因为开了 <code>-fwrapv</code>/-O0 保留了回绕检查，要么当前输入本来就没溢出。
say.null_bug: 因为前面已经执行了 <code>*p</code>，优化器反推出"p 绝不可能是 NULL"，于是把后面的 <code>if (!p)</code> 整个删掉；传入 NULL 时程序直接在解引用处崩掉（SIGSEGV）。
say.null_ok: 当前保留了空指针判断或传入指针有效，没有触发检查消除陷阱。
:::

另一个工业界著名的翻车案例是Linux 内核早年出现过的"先解引用再判空"漏洞（模型里第二个选项）：只要在 <code>if (!p) return 0;</code> 之前不小心读了一次 <code>*p</code>，<code>-O2</code> 就会顺理成章地证明"<code>*p</code> 没崩就说明 <code>p</code> 非空"，把后面的空指针防护全删掉。**UB 的本质不是编译器变笨了，而是它把"不许写溢出和空解引用"当成优化前提写进了合同。**

模型省掉了：<code>undef</code>（早年未初始化值的松散语义，LLVM 正逐步用 <code>poison</code> 和 <code>freeze</code> 收敛取代）以及跨循环感应变量（ScalarEvolution `nsw` 推断边界）带来的更大范围分支消除。 {.take}

## 指令选择：`SelectionDAG` 与 `GlobalISel` 怎么拼出硬件指令 {#ch7}

::: strings
toc: 指令选择：DAG 与 GlobalISel
:::

中端优化完的 IR 还是硬件无关的"理想机器"操作；指令选择阶段把计算图切成一块块，每一块刚好对应目标芯片的一条最强指令——比如 ARM64 的一条 <code>madd</code> 或 x86_64 的一条 <code>leal</code>。 {.law}

中端最后交出来的 IR 往往长得很碎：比如计算数组地址加偏移 <code>a[i] + c</code>，在 IR 里是四个独立节点——先把 32 位下标符号扩展成 64 位（<code>sext</code>），再计算元素偏移（<code>getelementptr</code>，底层等于乘 4），再去内存里读数（<code>load</code>），最后加到 <code>c</code> 上（<code>add</code>）。如果傻傻地一条 IR 翻译成一条机器指令，就得发射 5 条指令，还要白占临时寄存器。

后端里的指令选择器做的就是**图覆盖（Pattern Matching / Tiling）**：它把函数内每个基本块变成一张**有向无环选择图（SelectionDAG）**，用目标架构自带的指令模板库（TableGen 自动生成）去往图上盖章——谁能用一条指令吞掉尽量多的节点，就选谁。在本机 Apple Clang 21.0.0 上实测：同样是 <code>a * b + c</code>，ARM64 后端一把匹配成**{=ch7.armFma} 条**核心指令 <code>madd w0, w1, w0, w2</code>；而 x86_64 没有三操作数通用整数乘加指令，只好退化成**{=ch7.x86Fma} 条**（<code>imull</code> 配 <code>leal</code>）。反过来遇到 <code>x * 2 + 3</code>，x86_64 用一条复杂寻址指令 <code>leal 3(,%rdi,2), %eax</code> 直接一口吞下乘法加常数，ARM64 却得拆成左移加立即数加法两条！

::: diagram dg-isel keys=dg.isel
cap: 图 7　SelectionDAG 指令图覆盖：同一个 <code>mul + add</code> 子图，AArch64 用一条带乘加的 <code>madd</code> 盖住，而 x86_64 必须拆成乘法加 <code>lea</code>。
aria: 示意图：mul 与 add 两个节点被虚线图块框起，下方分别映射为 AArch64 单条 madd 与 x86_64 两条指令
tile: 模式匹配（一口吞掉多条 IR）
:::

更底层的真相是，LLVM 目前同时维护着两套指令选择器——这一点可以直接在本机 `/usr/bin/clang -mllvm -debug-pass=Structure` 里印证：在 **`-O0`** 下，ARM64 默认跑的是新一代的 **`GlobalISel`**（依次经过 `irtranslator → legalizer → regbankselect → instruction-select`，绕过沉重的 SelectionDAG 构图以换取极快编译速度）；而在 **`-O2`** 下，它立刻切回老牌的 **`SelectionDAG`**（`aarch64-isel` + `machine-combiner`），因为复杂 DAG 组合依然能榨出更高的指令紧凑度。

::: lab ch7-model
model.title: SelectionDAG 模式匹配与双架构指令对比器
model.how: 切换四种常见表达式，再切换目标芯片（AArch64 vs x86_64）和"开启复杂指令融合"开关，观察表达式子图怎么被不同芯片的独特指令一口吞掉（所有汇编均对照本机 Clang 实测）。
ctl.pre: IR 表达式
pre.fma: a * b + c
pre.shiftAdd: a + (b << 2)
pre.arrayLoad: a[i] + c
pre.scaleConst: x * 2 + 3
ctl.arch: 目标指令集
arch.arm64: AArch64 (Apple Silicon)
arch.x86_64: x86_64
ctl.fuse: 启用复合模式匹配
cv.aria: 表达式 DAG 节点连线与融合匹配框，展示折叠后的芯片指令
cv.tile: 融合盖章（输出 {k} 条核心指令）
cv.sep: 逐节点硬翻（需 {k} 条核心指令）
code.title: 本机实测生成的目标汇编指令
read.ir: 原始 IR 核心算子
read.mach: 目标核心指令数
read.saved: 模式匹配省掉指令
say.fused: 把 <code>{expr}</code> 交给 <em>{arch}</em>（开启复合匹配）：{ir} 个 IR 节点被揉进 <em>{mach} 条机器指令</em>，比逐节点直翻省下 {saved} 条。
say.unfused: 关闭复合匹配后，只能按最朴素的 1 对 1 规则往下翻，必须发射 <em>{mach} 条核心指令</em>。
:::

至于底层芯片拿到这些机器指令后怎么按时钟节拍拆微操作、怎么预测分支和乱序执行，可以接着看[[how-a-cpu-runs-a-program#ch3|循环怎么译成机器码]]和[[how-a-cpu-guesses-ahead#ch6|超标量与乱序执行]]。

模型省掉了：类型合法化（比如在 32 位芯片上把 <code>i64</code> 拆成高低双字）、机器调度器（<code>machine-scheduler</code>）按真实端口延迟重排指令顺序，以及 <code>GlobalISel</code> 中间的寄存器库选择细节。 {.take}

## 活跃度分析与寄存器分配：无限虚拟寄存器如何塞进有限物理位 {#ch8}

::: strings
toc: 活跃度分析与寄存器分配
:::

指令选择刚吐出的机器码仍在使用无限编号的虚拟寄存器；寄存器分配器先算出每条虚拟寄存器的活跃区间，画出干涉图并用 K 种颜色去涂——涂不下就必须拆开活跃区或溢出（spill）到栈上。 {.law}

经过指令选择后的机器码其实还不能跑在真 CPU 上——如果你用 <code>-mllvm -print-after=finalize-isel</code> 把它印出来，会看到里面全是 <code>%0:gpr32</code>、<code>%1:gpr32</code>……数量没有上限，而且甚至还带着机器层的 <code>PHI</code> 节点（<code>IsSSA</code> 状态）。真实芯片只有几十个物理通用寄存器（比如 ARM64 只有 <code>x0..x28</code> 等，还要留出一部分做栈指针和调用约定），怎么分配？

第一步是**活跃度分析（Liveness Analysis）**：一个虚拟寄存器从"被写入的那一行"到"最后一次被读取的那一行"，构成它的**活跃区间（Live Interval）**。只要两个虚拟寄存器的活跃区间在时间线上有重叠，它们就绝不能共用同一个物理寄存器——我们在**干涉图（Interference Graph）**里给它俩连一条边。

::: diagram dg-regalloc keys=dg.regalloc
cap: 图 8　活跃区间重叠构成干涉图。四个变量同时活跃（完全图 K₄）而物理寄存器只有 <code>K = 3</code> 个时，总有一个变量无色可涂，必须溢出到栈槽。
aria: 示意图：左侧四条重叠的时间区间，右侧四点全连通干涉图在 K=3 时有三个涂色成功、一个红色标为栈溢出
left: 活跃区间（重叠即冲突）
peak: 峰值同时活跃：4
right: K = 3 干涉图涂色
spill: 溢出到栈 [sp]
:::

第二步就是涂色：给干涉图每个节点涂上 <code>K</code> 种颜色之一（代表物理寄存器 <code>r0..r(K-1)</code>），保证连边的两个节点颜色不同。在著名的 **Chaitin–Briggs 算法**里，思路极美：任何度数小于 <code>K</code> 的节点，因为邻居最多只有 <code>K - 1</code> 个，无论周围怎么涂它**永远留得出至少一个空色**——先把它从图上摘下来压栈；剥掉一层后，原来度数高的邻居度数也跟着降了；等把整张图拆光，再倒序弹出依次涂色。如果某一步剩下的所有节点度数都大于等于 <code>K</code>（无安全可剥节点），就只能挑一个"重新加载代价最低"的节点**溢出（spill）**到栈上——在定义后面插一条 <code>str</code> 存栈，在每次使用前插一条 <code>ldr</code> 读回来（正如我们在 <code>spill.c</code> 里实测的 <code>str w0, [sp, #60] ; 4-byte Folded Spill</code>）。

::: lab ch8-model
model.title: 活跃区间、干涉图涂色与线性扫描分配器
model.how: 拖动可用物理寄存器数 K，切换"图着色 (Chaitin-Briggs)"与"线性扫描 (Linear Scan)"以及不同并发压力场景，观察最大同时活跃数 maxLive 一旦超过 K 时溢出怎么爆发。
ctl.k: 可用物理寄存器 K
ctl.algo: 分配算法
algo.graph: 图着色 (Chaitin-Briggs)
algo.linear: 线性扫描 (Linear Scan)
ctl.scen: 活跃压力场景
scen.diamond: 轻度压力 (maxLive = 3)
scen.chain: 链式交叉 (maxLive = 4)
scen.pressure: 密集并发 (maxLive = 6)
cv.aria: 左侧为虚拟寄存器活跃时间条及分配结果，右侧为对应的冲突干涉图涂色
cv.iv: 虚拟寄存器活跃区间
cv.graph: 干涉图涂色结果
read.live: 峰值同时活跃
read.used: 实际占用物理寄存器
read.spills: 溢出虚拟寄存器数
read.mem: 插入栈读写 (str+ldr)
say.fit: 用 <em>{algo}</em> 为峰值并发 {live} 的程序分配 {k} 个物理寄存器：<em>全部装下，零溢出</em>。
say.spill: 可用寄存器数 {k} 低于并发度 {live}，{algo} 被迫把 <em>{sp} 个变量（{spilled}）溢出到栈</em>，多塞进 <em>{mem} 条</em> <code>str</code>/<code>ldr</code> 栈访存指令。
:::

观察默认"链式交叉"场景：它的峰值并发度只有 {=ch8.maxLive}——只要给到 4 个物理寄存器，溢出数是 {=ch8.spillsK4}；一旦压到 3 个，立刻有 {=ch8.spillsK3} 个变量涂不下、被迫多插 {=ch8.spillInsnsK3} 条栈访存指令！这就是为什么手写内联函数过大、或者一个超长循环里塞满几打临时变量时，哪怕算法逻辑没变，性能也会在跨过某个局部变量数门槛后断崖式下跌。至于现代 CPU 硬件内部还要不要再用物理寄存器重命名做乱序执行，那是[[how-a-cpu-guesses-ahead#ch7|寄存器重命名与乱序]]解决的问题。

在实际 LLVM `-O2` 后端里（我们在宿主机通过 `-debug-pass=Structure` 验证到），默认运行的是 **`RegAllocGreedy`**（贪心寄存器分配器）：它在图着色的优先级队列基础上加上了**活跃区间分裂（Live-Range Splitting）**——与其把整个长变量直接赶去栈里，不如只在最拥挤的那几行代码里暂时溢出再弹回来；而在 `-O0` 下则直接跑极速的 **`RegAllocFast`**。模型省掉了活跃区间分裂、寄存器合并（`register-coalescer` 消除冗余 `COPY`）以及调用约定保存寄存器（caller-saved vs callee-saved `stp x28, x27`）的权重差异。 {.take}

## PGO 与 ThinLTO：跨文件优化怎么在链接时发生 {#ch9}

::: strings
toc: PGO 与 ThinLTO 跨文件优化
:::

单个文件编译得再狠，也看不见另一个 <code>.c</code> 文件里的函数体；<code>-flto=thin</code> 让每个 <code>.o</code> 先存一份带精简摘要的 LLVM bitcode，等到链接期再按热点跨文件按需导入、并行内联。 {.law}

试想你把函数 <code>add_mul(x, y)</code> 写在 <code>b.c</code>，在 <code>a.c</code> 里写 <code>main() { return add_mul(10, 12); }</code>，用 <code>clang -O2 -c</code> 分别编译再链接。我们在本机 Apple Clang 21.0.0 上对 <code>bin_no_lto</code> 反汇编的结果非常直白：<code>_main</code> 里老老实实先把 <code>10</code> 和 <code>12</code> 塞进 <code>w0</code>、<code>w1</code>，然后发一条尾跳转 <code>b _add_mul</code>（占 {=ch9.noLtoMain} 条指令加上被调函数自己的 3 条指令）。编译器不是不想算出来——它在编 <code>a.c</code> 的那一刻，根本不知道 <code>b.c</code> 里的 <code>add_mul</code> 到底干啥，只能保守地留着函数调用！

::: diagram dg-lto keys=dg.lto
cap: 图 9　普通分文件编译（上）与 ThinLTO（下）的本质差异：<code>-flto=thin</code> 把每个编译单元变成带着索引摘要的 LLVM IR 比特码，链接器得以跨文件把 <code>add_mul(10, 12)</code> 直接折叠成常量 <code>#42</code>。
aria: 示意图：上方普通 .o 文件包含硬编码机器码导致链接器只能保留跳转；下方 ThinLTO .o 包含 IR 与摘要索引，链接时内联折叠成 42
sep: 普通编译：链接器盲人摸象
thin: ThinLTO：按摘要跨文件导入优化
call: 只知调用名
body: 留着函数体 IR
:::

打开 **`-flto=thin`** 之后，`file tu_b_thin.o` 会显示它根本不是机器码，而是 **`LLVM bitcode, wrapper`**。里面同时打包了该文件的优化前中端 IR 和一份极小的**模块摘要索引（Module Summary Index）**——只记着每个函数有多大、调了谁、被谁调。链接阶段（ThinLink），链接器不必像早期 Full LTO 那样把几千个文件全吞进一个进程里把内存撑爆（16 个模块时 Full LTO 单进程内存峰值达 {=ch9.fullMem} MB），而是只读轻飘飘的摘要决定"哪个跨文件小函数值得导入"，然后把每个翻译单元分发给多个并发线程各自导入、各自内联优化（单线程内存峰值仅约 {=ch9.thinMem} MB，相比分文件编译白白留下的 {=ch9.noLtoCalls} 个跨文件调用大幅消减）。于是，我们在本机 <code>bin_thin</code> 里看到的 <code>_main</code> 瞬间坍缩成了**{=ch9.thinLtoMain} 条指令**：<code>mov w0, #0x2a ; =42</code> 与 <code>ret</code>。

::: lab ch9-model
model.title: 跨编译单元调用、ThinLTO 摘要导入与链接内存权衡
model.how: 在"分文件 -O2"、"ThinLTO (-flto=thin)"、"Full LTO"之间切换，调整翻译单元数、内联指令阈值以及是否开启 PGO（热点剖面），观察跨文件调用消除数与单进程链接内存峰值的巨大差异。
ctl.mode: 链接模式
mode.none: 分文件 -O2
mode.thin: ThinLTO (-flto=thin)
mode.full: Full LTO (-flto=full)
ctl.thresh: 跨文件内联阈值 (IR 行)
ctl.tus: 翻译单元数 (.c 文件)
ctl.pgo: 启用 PGO 热点加权
cv.aria: 跨文件调用的函数大小与内联阈值对比图及链接期单工作进程峰值内存条
cv.edges: 四类跨文件调用体积 vs 内联阈值（虚线）
cv.mem: 单链接进程内存峰值
read.inlined: 跨文件已内联调用点
read.calls: 剩余跨文件 call 指令
read.mem: 单进程内存峰值
read.work: 并发优化线程数
fold_yes: add_mul(10,12) 已跨文件折叠为 #42
fold_no: add_mul 仍保留跨文件分支跳转
say.none: 分文件编译下，链接器面对的是纯机器码，<em>全部 {rem} 个跨文件调用都无法内联</em>（包括最简单的常量加法）。{fold}。
say.thin: <code>ThinLTO</code> 只交换摘要后并发导入：在 {wk} 个并发线程上以每线程仅 <em>{mem} MB</em> 的内存峰值为代价，成功消除 {inl} 个跨文件调用（仅剩 {rem} 个大/冷函数）。{fold}。
say.full: <code>Full LTO</code> 把全部 {tus} 个文件硬揉进单进程大模块，消除 {inl} 个调用，但单进程内存瞬间飙到 <em>{mem} MB</em> 且无法并行扩展。{fold}。
:::

加上 **PGO（Profile-Guided Optimization）** 之后效果更明显：编译器不再靠猜，而是拿着真实压测收集的热点分支频率和调用次数，把内联预算精确倾斜给最热那 10% 的调用边（模型里把冷函数 <code>log_fatal</code> 严格关在门外，把热调用预算放大一倍），既减少指令缓存膨胀，又把核心热路径直接打平。

模型省掉了：C++ 虚函数去虚化（Whole-Program Devirtualization）、链接器符号解析与 ThinLTO 磁盘缓存复用机制，以及全程序的跨模块全局变量死代码裁剪。 {.take}

## 前沿在哪（2026 年 11 月） {#ch10}

::: strings
toc: 前沿在哪（2026 年 11 月）
:::

传统三段式编译器正在向上延伸到领域级多层 IR（MLIR），向下延伸到链接后的二进制重排工具（BOLT）与采样引导优化（CSSPGO）。下面把已经确立的数学基础、已经落地的工程工具和仍在推进的路线分开记录。 {.law}

### 已确立 {#h.est .sub3}

- <span class="tag h">已确立</span> **SSA 与编译器后端经典算法**：Cytron 等人（1991）的支配边界与 SSA 构造方法、Chaitin–Briggs（1981 / 1992）图着色分配及 Poletto–Sarkar（1999）线性扫描分配，至今仍是生产编译器中后端的理论基石。 {#e1}
- <span class="tag h">已确立</span> **不透明指针（Opaque Pointers, `ptr`）成为唯一标准**：LLVM 从 15 版默认启用 `ptr` 并在 17 / 19 版彻底移除有类型指针（typed pointers）。本机 Apple Clang 21.0.0 的一切 IR 已全数采用无类型 `ptr` 搭配指令侧显式类型。 {#e2}
- <span class="tag h">已确立</span> **新 Pass 管理器（New Pass Manager）**：LLVM 13 起成为默认中端驱动，替代旧版基于固定接口链的遗留 Pass 管理器，以更低分析失效开销支撑多轮迭代。 {#e3}

### 已经做出来的 {#h.demo .sub3}

- <span class="tag m">已落地</span> **LLVM 21–23 主线版本（截至 2026 年 11 月）**：上游社区于 2025 年 8 月发布 LLVM 21.1.0（移除 `nocapture` 改用更细粒度的 `captures(...)` 属性）、2026 年 2 月发布 LLVM 22.1.0（新增 `ptrtoaddr` 指令与 `opt`/`llc` 统计导出 `--save-stats`）、2026 年 8 月 26 日发布 LLVM 23.1.0（至 2026 年 10–11 月维护至 23.1.4 / 23.1.6）。本机 macOS 命令行工具搭载的 Apple Clang 21.0.0 正是基于 LLVM 21 分支构建。 {#d1}
- <span class="tag m">已落地</span> **MLIR（多层中间表示）连接 AI 与领域语言**：针对 PyTorch（Torch-MLIR）、OpenAI Triton 与张量算子，直接降成标量化的 LLVM IR 会丢掉二维矩阵分块与循环平铺语义。MLIR 允许上层方言（`linalg`、`tensor`、`scf`、`gpu`）先在高层完成算子融合与分块，最后一步再降级（lower）进经典 LLVM IR 生成机器码。 {#d2}
- <span class="tag m">已落地</span> **GlobalISel 与 SelectionDAG 并存的真实格局**：正如我们在第 7 章于本机 Apple Clang 21.0.0 上亲手验证的，AArch64 在 `-O0` 下已默认采用 `GlobalISel` 换取快速编译，但 `-O2`/`-O3` 仍坚定运行 `SelectionDAG`（`aarch64-isel`）。上游 LLVM Discourse 讨论持续指出，代码体积（`-Os`）与部分边缘模式匹配差距使 `SelectionDAG` 在高优化级别尚未退出舞台。 {#d3}
- <span class="tag m">已落地</span> **AutoFDO / CSSPGO 与 BOLT 链接后布局优化**：在大型数据中心应用上，即便开了 ThinLTO + PGO，庞大代码段导致的指令缓存（I-cache）与 iTLB 缺失仍占显著停顿时间。借助 CPU 硬件性能计数器（Intel LBR、Arm BRBE/SPE）驱动的采样剖析（`CSSPGO` 利用伪探针恢复上下文内联敏感度），再配合 LLVM 旗下的链接后二进制重写器 **BOLT** 重排热点函数和冷热基本块，Meta 公开报告在大型生产服务上取得 2%–15% 额外提速，在 Clang 编译器自身（叠加 PGO+LTO 之后）公开报告提速可达 15%–20% 以上。 {#d4}

### 规范、计划与说法 {#h.claim .sub3}

- <span class="tag l">路线与进展</span> **GlobalISel 全面取代 SelectionDAG**：把 AArch64 `-O2`/`-O3` 默认选择器彻底切换到 GlobalISel 仍是 LLVM 长期社区目标，但能否在无性能与体积倒退的前提下落地，高度依赖具体基准集与各厂商下游维护进度，目前并非上游默认开关。 {#c1}
- <span class="tag l">路线与进展</span> **ClangIR（CIR）孵化器**：社区正推进基于 MLIR 的 Clang 高层方言（ClangIR），希望先保留 C++ 异常、协程与语言语义再往下降低到 LLVM IR；截至 2026 年 11 月仍处于上游孵化与分阶段上游化进程，尚未取代宿主 Clang 的默认 AST → LLVM IR 路径。 {#c2}

编译器版本、工具链开关与性能报告随时会过期；本章所有版本号与日期均以 **2026 年 11 月**为基准。 {.take}

## 收尾：编译出的程序不对或慢了，先问三件事 {#ch11}

::: strings
toc: 收尾：先问三件事
:::

不必背下两百个 Pass 的名字。每当你怀疑编译器把程序编慢了，或者 <code>-O2</code> 表现得和 <code>-O0</code> 不一样时，依次问这三个问题就够了。 {.law}

{.qs}
- **瓶颈卡在中端别名、向量宽度，还是后端寄存器溢出？**用 `-Rpass=licm -Rpass=loop-vectorize -Rpass-missed=loop-vectorize` 问编译器到底有没有把循环不变量提出来、有没有向量化（第 5 章）；再看生成的汇编里是不是满屏 `str` / `stp` 栈溢出（第 8 章）——很多时候加一个 `restrict` 或拆小超大函数，比手动重写汇编管用十倍。 {#q1}
- **有没有哪处检查是被未定义行为"合法删掉"的？**一旦出现 `-O0` 正常、`-O2` 行为诡异（比如溢出判断永远成立、空指针分支消失），第一时间编译加 `-fsanitize=undefined` 抓出 `nsw` 溢出与空解引用（第 6 章），并用 `-S -emit-llvm -O2`（或对照 `-fwrapv`）亲眼看优化器到底把哪一段折叠成了常量。 {#q2}
- **优化视野是不是被单个 `.c` 文件卡死了？**如果热路径跨越了独立编译的源码文件边界，单文件 `-O2` 的内联器根本看不见对面函数体（第 9 章）。打开 `-flto=thin` 让链接器带着摘要跨越编译单元边界；如果是动辄几十兆字节的大型服务端二进制，进一步结合采样 PGO / CSSPGO 与 BOLT 处理热代码局部性。 {#q3}

一句话总结：`clang -O2` 不是魔法翻译机，它是一套先靠 `mem2reg` 消除栈变量、靠几十个小 Pass 迭代折叠到不动点、再借未定义行为与别名分析放开手脚、最后用图覆盖与干涉图涂色挤进真实芯片寄存器的流水线。 {#sum .sum}

延伸阅读：硬件执行层请看[[how-a-cpu-runs-a-program]]（指令集与 32 位机器编码）、[[how-a-cpu-guesses-ahead]]（分支预测、超标量与硬件寄存器重命名）、[[how-a-cpu-does-math]]（IEEE 754 浮点精度、SIMD 与自动向量化前提），以及底层电路基础[[switches-that-compute]]。 {#links}

::: footer
**来源与工具。**本页所有中端 IR 样本、Pass 结构顺序、ARM64 与 x86_64 汇编片段、以及 ThinLTO 实测均在宿主机 `/usr/bin/clang`（`Apple clang version 21.0.0 (clang-2100.4.1.1)`，目标 `arm64-apple-darwin27.2.0`，LLVM 21 底座）上通过 `-S -emit-llvm`、`-S`、`-mllvm -debug-pass=Structure`、`-mllvm -print-after=...`、`-Rpass=licm`、`-fwrapv` 与 `-flto=thin` 实测生成；`tools/crosscheck.cjs` 每次运行共核验 29 项指标全部通过。理论与前沿参考：Cytron 等，*Efficiently Computing Static Single Assignment Form and the Control Dependence Graph*，ACM TOPLAS 1991；Chaitin 等，*Register Allocation via Coloring*，1981；Briggs 等，*Improvements to Graph Coloring Register Allocation*，ACM TOPLAS 1994；Poletto &amp; Sarkar，*Linear Scan Register Allocation*，ACM TOPLAS 1999；Lattner &amp; Adve，*LLVM: A Compilation Framework for Lifelong Program Analysis &amp; Transformation*，CGO 2004；Johnson 等，*ThinLTO: Scalable and Incremental LTO*，CGO 2017；Panchenko 等，*BOLT: A Practical Binary Optimizer for Data Centers and Beyond*，CGO 2019；LLVM Project 官方发布说明（LLVM 21.1.0、22.1.0、23.1.x）、Opaque Pointers 文档、GlobalISel 文档及 Meta 生产性能报告。

**模型说明。**页面不内嵌完整 Clang/LLVM 二进制。所有交互实验室中的 3 段式组件计数、`-O0`/`-O2` 访存模型、支配树与迭代支配边界 `phi` 引擎、固定点 Pass 步进器、别名与向量通道计算、`nsw` 有符号回绕验证器、SelectionDAG 贴片计数、Chaitin-Briggs / 线性扫描寄存器分配器与 ThinLTO 摘要模型均由 `models.js` 直接用纯算法实现，并在 `tests/models.cjs` 与 `tools/crosscheck.cjs` 中锁定数值。本文由 Antigravity AI 撰写，模型省略了复杂异常处理、全量 AliasSet 指针分析及真实硬件乱序端口调度细节。
:::
