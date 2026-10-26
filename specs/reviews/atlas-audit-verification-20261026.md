# 数学/物理覆盖与图谱质量审计 · 2026-10-26

状态：本地实现；各轮范围与验收分开记录。

**Round13增量**：[现有tan定义域/显示/键盘与恢复](tangent-domain-verification-20261026.md)，不扩图谱。晨间总览已收敛为3条学习目标路径；历史逐课快照/各轮证据保留。

**Round12增量**：[现有薄透镜审查与修复](lens-focus-verification-20261026.md)，不新增节点/关系/路线，当前仍38/47/10。纠正可达近焦误分类、画外有限像、主光线/屏幕反馈与阅读状态，复用既有课程互链。

**Round11增量**：[法线→Snell/全反射](refraction-normal-verification-20261026.md) 复用原折射课，修正实际边界/表述与返回断点；当前38节点/47关系/10路线，新增1概念1关系1普通路线。前轮快照及其测量范围保留，不冒称全站认证。

**Round10增量**：[斜率→小孔](pinhole-geometry-verification-20261026.md) 已落地；该轮结束时37节点/46关系/9路线。新增概念是复用已有课的有用连接，不是重建实验。下表保持原审计快照，最新逐课/图谱清单在本轮证据；历史计数不冒称当前。

**Round9增量**：[复数键盘路径与验证](complex-keyboard-verification-20261026.md) 已补S1/S2/S4原绘图约束下五个对象的任意坐标输入；本表complex控件数回填最新基线，其他范围与历史证据仍明确区分。无图谱扩张。入口：[atlas 开发索引](../../atlas/README.md)、[晨间体验索引](nightly-math-physics-20261026.md)。本轮切换到全局审查，不增加弹簧功能或概念数量。

## Round8原审计范围与快照（当前增量见上方）

按实际 `pages.config.js` 中 math / physics / signal / probability 四类，45 个 local-live 条目（含 atlas 枢纽，故44个教学课程），均存在本地 index.html。另列 gradient-descent、particles-states、day-night-rotation 三个相邻学科课程，不混入45的分母。live 是本地目录状态，不是上线/部署证明。

图谱仍为35节点、45有来源关系、8条编辑路线、5组。现在32个节点的主要入口指向17个本地课程，3个主要入口为外部教材。未纳入图谱的课程不自动构成断链，不机械追求覆盖率。当前没有显式先修边；foundation 是理解工具，路线顺序可逆着关系箭头阅读，不代表先修认证。

独立静态审计发现并修复：

1. complex 节点原显示仅外部阅读，漏接已有复数交互课程。改为 `complex-numbers/#step4` 的模相乘/角相加对账台，保留单位圆→复数关系的教材来源。未创建新课或重写原模型。
2. sine→oscillation 中文原因原称“无外力”，与回复力矛盾，改为无阻尼、无持续驱动且回复力存在。英文原 unforced 已正确，改写只是双语澄清，不将它记录为第二个科学错误。

新入口的窄屏验收另外暴露原课程 EN320 页头溢出（scrollWidth371）：语言按钮被不换行 flex 挤出。仅改该课程三处布局规则，允许页头和放大文字换行，不隐藏溢出，不改模型/控件/导航。独立试走另发现预设仅1px默认焦点，局部补3px focus-visible与系统高对比色，保持键盘任务可见。

依据：[OpenStax复数极坐标10.5](https://openstax.org/books/algebra-and-trigonometry-2e/pages/10-5-polar-form-of-complex-numbers) 的乘法模相乘/角相加，与 [简谐振动15.1](https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion) 的回复力 F=−kx；本轮浏览核对。未全文重审所有旧课程科学内容。

## 逐课程清单

下表由实际注册数据、当前图谱和渲染页面观测生成。节点为该课的**主要来源节点**；关系列为以该课为证据的关系数量；路线列由这些节点的路线成员身份计算。`—` 只表示当前图谱未直接引用。边界钩子B是正文默认态出现理想/近似/model等关键词；来源钩子S是页面DOM中的外部链接数量（未判定展开/可见），两者均**不是充分性结论**，正文文本引用/其他章节/脚本注释可能未计入。键盘/画布列是默认态可见控件数 / canvas总数，不能等同交互已全部验收。

| 本地课程 | 类别/阶段 | 主要节点 | 来源关系数 | 路线 | B / S | 控件 / 画布 |
|---|---|---|---:|---|---|---:|
| [frozen-bubble](../../frozen-bubble/) · 冰冻肥皂泡 · 水膜里的结晶 | physics/junior | — | 0 | — | 有 / 2 | 11 / 4 |
| [power-converters](../../power-converters/) · 升压与降压 · 能量去哪了？ | physics/university | power, inductor, capacitor, switch-diode, pwm, buck, boost | 12 | power | 有 / 6 | 26 / 0 |
| [atlas](../../atlas/) · 数学与物理 · 知识地图 | math/university | — | 0 | — | 有 / 10 | 56 / 11 |
| [fourier](../../fourier/) · 傅里叶变换 · 一步一交互 | signal/university | superposition, fourier, spectrum | 3 | waves | 有 / 0 | 30 / 11 |
| [convolution](../../convolution/) · 卷积 · 一步一交互 | signal/university | convolution | 1 | waves | 未见 / 0 | 54 / 11 |
| [mandelbrot](../../mandelbrot/) · Mandelbrot 分形 · 无限放大 | math/university | — | 0 | — | 有 / 0 | 29 / 10 |
| [control](../../control/) · 反馈与控制 · 双轮车为什么倒不下去 | signal/university | feedback | 0 | estimate | 有 / 0 | 40 / 14 |
| [sampling](../../sampling/) · 采样与混叠 · 偷看得太懒，就会看错 | signal/university | sampling | 1 | — | 未见 / 0 | 34 / 12 |
| [trig](../../trig/) · 三角函数 · 单位圆 | math/university | unit-circle, sine | 1 | motion, waves | 未见 / 0 | 32 / 9 |
| [montecarlo](../../montecarlo/) · 蒙特卡洛 · 撒豆子算 π | probability/university | montecarlo | 2 | — | 未见 / 0 | 42 / 7 |
| [laplace](../../laplace/) · 拉普拉斯与 ROC · 给频率配一个寿命 | signal/university | laplace, poles | 2 | response | 有 / 0 | 24 / 11 |
| [bayes](../../bayes/) · 贝叶斯 · 先查底子，再看证据 | probability/university | probability, bayes | 1 | estimate | 有 / 0 | 35 / 7 |
| [clt](../../clt/) · 中心极限定理 · 平均值总会变成钟形 | probability/university | variance, gaussian | 2 | — | 有 / 0 | 48 / 8 |
| [ztransform](../../ztransform/) · Z 变换 · 把 s 平面卷成单位圆 | signal/university | — | 0 | — | 未见 / 0 | 24 / 15 |
| [eigen](../../eigen/) · 特征值与特征向量 · 矩阵不转的那些方向 | math/university | vectors, eigen | 2 | — | 有 / 0 | 40 / 10 |
| [entropy](../../entropy/) · 熵 · 惊讶的平均值 | probability/university | — | 0 | — | 有 / 0 | 74 / 9 |
| [lti](../../lti/) · 冲激与 LTI · 给系统一巴掌 | signal/university | lti, impulse | 3 | — | 有 / 0 | 40 / 17 |
| [freqresp](../../freqresp/) · 频率响应与滤波 · 按频率挑食的盒子 | signal/university | resonance, freqresp | 1 | response | 有 / 0 | 28 / 15 |
| [modulation](../../modulation/) · 调制与频移 · 把信号搬上高频运走 | signal/university | — | 0 | — | 有 / 0 | 20 / 13 |
| [kalman](../../kalman/) · 卡尔曼滤波 · 在预测与测量之间称重 | signal/university | kalman | 3 | estimate | 有 / 0 | 24 / 12 |
| [fractions](../../fractions/) · 分数 · 把整体切开来数 | math/primary | — | 0 | — | 未见 / 0 | 47 / 8 |
| [pythagoras](../../pythagoras/) · 勾股定理 · 一步一交互 | math/junior | — | 0 | — | 有 / 0 | 30 / 7 |
| [area-model](../../area-model/) · 乘法是面积 · 点阵铺成一块地 | math/primary | — | 0 | — | 未见 / 0 | 22 / 6 |
| [perimeter-area](../../perimeter-area/) · 周长 vs 面积 · 一根绳子两种账 | math/primary | — | 0 | — | 有 / 0 | 15 / 5 |
| [division-remainder](../../division-remainder/) · 除法与余数 · 分不完的那一点 | math/primary | — | 0 | — | 未见 / 0 | 28 / 5 |
| [linear-functions](../../linear-functions/) · 一次函数 · 斜率是陡缓，截距是起点 | math/junior | — | 0 | — | 未见 / 0 | 19 / 7 |
| [symmetry-rotation](../../symmetry-rotation/) · 对称与旋转 · 对折与转圈 | math/primary | — | 0 | — | 有 / 0 | 90 / 12 |
| [parabola](../../parabola/) · 抛物线 · 投篮的弧线 | math/junior | — | 0 | — | 未见 / 0 | 25 / 7 |
| [velocity-vt](../../velocity-vt/) · 速度与 v-t 图 · 面积就是路 | physics/junior | — | 0 | — | 有 / 0 | 36 / 8 |
| [integral](../../integral/) · 定积分 · 把小条加回整体 | math/senior | integral | 0 | work, travel | 有 / 0 | 27 / 6 |
| [reflection-refraction](../../reflection-refraction/) · 光的反射与折射 · 拐弯的规矩 | physics/junior | — | 0 | — | 有 / 0 | 27 / 5 |
| [derivative](../../derivative/) · 导数 · 把平均压成此刻 | math/senior | derivative | 1 | kinematics | 有 / 0 | 40 / 6 |
| [lens](../../lens/) · 凸透镜成像 · 远近变像 | physics/junior | — | 0 | — | 有 / 0 | 30 / 5 |
| [interference](../../interference/) · 波的干涉 · 闹与静的图样 | physics/senior | — | 0 | — | 未见 / 0 | 31 / 8 |
| [exp-log](../../exp-log/) · 指数与对数 · 翻倍与逆问 | math/senior | — | 0 | — | 未见 / 0 | 31 / 4 |
| [circle-angles](../../circle-angles/) · 圆周角 · 为什么恰好是一半 | math/junior | — | 0 | — | 未见 / 0 | 27 / 6 |
| [complex-numbers](../../complex-numbers/) · 复数 · 平面上的旋转 | math/senior | complex | 0 | — | 未见 / 0 | 38 / 5 |
| [standing-wave](../../standing-wave/) · 驻波 · 原地起伏的波 | physics/senior | — | 0 | — | 有 / 0 | 39 / 8 |
| [negative-numbers](../../negative-numbers/) · 负数 · 0 以下的世界 | math/primary | — | 0 | — | 未见 / 0 | 41 / 7 |
| [pinhole-camera](../../pinhole-camera/) · 小孔成像 · 一个孔的相机 | physics/primary | — | 0 | — | 有 / 0 | 27 / 4 |
| [space-diagonal](../../space-diagonal/) · 空间对角线 · 3D 里的两次勾股 | math/junior | — | 0 | — | 有 / 0 | 11 / 2 |
| [coordinate-plane](../../coordinate-plane/) · 坐标系 · 点的地址 | math/junior | — | 0 | — | 未见 / 0 | 19 / 8 |
| [lever-pulley](../../lever-pulley/) · 杠杆与滑轮 · 支点挪一挪，省力见分晓 | physics/junior | — | 0 | — | 有 / 0 | 32 / 5 |
| [equations-balance](../../equations-balance/) · 方程天平 · 两边同做一件事 | math/primary | — | 0 | — | 有 / 0 | 42 / 7 |
| [population-growth](../../population-growth/) · 种群增长 · S 形曲线从哪来 | math/senior | — | 0 | — | 有 / 0 | 14 / 5 |

下列三项为相邻学科补充，单列：

| 本地课程 | 类别/阶段 | 主要节点 | 来源关系数 | 路线 | B / S | 控件 / 画布 |
|---|---|---|---:|---|---|---:|
| [gradient-descent](../../gradient-descent/) · 梯度下降 · 摸黑下山 | computing/university | — | 0 | — | 有 / 0 | 46 / 10 |
| [particles-states](../../particles-states/) · 粒子与物态 · 热闹程度即温度 | chemistry/junior | — | 0 | — | 有 / 0 | 26 / 5 |
| [day-night-rotation](../../day-night-rotation/) · 昼夜交替 · 地球自己在转 | earth/primary | — | 0 | — | 有 / 0 | 29 / 10 |

## 图谱与内联实验的覆盖边界

`oscillation`、`net-force`、`work-energy` 三个节点的主要出处是外部OpenStax，但不是“无本地实验”：motion/kinematics/travel/work 四条路线在atlas内共用同一MotionBridge，分别连接投影、导数/净力、有符号速度积分、力对位移积分；response路线另有正阻尼受迫稳态实验。表中atlas是枢纽，主要来源节点列为空不意味着这些内联任务缺失。

power、waves、estimate 三条普通编辑路线主要引导到已有电路、三角/傅里叶/卷积、概率/贝叶斯/卡尔曼/控制课程；不是宣称每站都有新增实验。所有节点和关系均可由列表/图中选择，不必先走路线。当前未进入八条路线的节点为 `switch-diode, complex, vectors, eigen, laplace, superposition, spectrum, sampling, lti, impulse, variance, gaussian, montecarlo`：存在图谱选择与来源入口，不等于孤立节点或必须新造路线；complex本轮已接到真实课程。其详细关系/来源见coverage.json与data-quality结果，先修不能由“未出现在路线中”推断。

## 覆盖审查发现与优先级

> 历史优先级快照（round8）：以下optics尚未入图谱/几何与折射候选已由[小孔round10](pinhole-geometry-verification-20261026.md)、[Snell round11](refraction-normal-verification-20261026.md)与[透镜round12](lens-focus-verification-20261026.md)最小闭合。原逐课表/35–45–8等历史计数保留；未触及信号域、其他课与真实设备仍为待审候选，不由这些完成项自动认证。当前38/47/10范围与优先级见[开发索引](../../atlas/README.md)。

- **已修复 P1**：复数本地课漏接和自由振动中文关系误导；新增入口的英文320px布局问题同步修复。不是图谱断端点/404；是学习入口与科学措辞的实际问题。
- **已在round9补齐**：复数五对象的原生键盘坐标路径，复用原normalizer与状态；见其独立科学/教学与浏览器证据。未认证真实读屏语音/硬件/所有旧课程。该连接已在round10完成，几何光学/衍射条件已限定，下一步优先实际学习者与角度/折射既有课审查，不机械增加节点。

- **P2覆盖缺口**：已有 optics（反射折射/透镜/干涉/小孔）、standing-wave 与多项学校代数/几何没有当前图谱节点/路线。优先选“几何路径→光线传播”的一个已有课连接任务，先审模型边界；不为每个目录创建节点。ztransform/modulation/entropy/mandelbrot 同为未直接引用的内容，按具体学习问题排序。
- **P2来源与模型边界**：原45核心页面快照只有3页的DOM含外部链接、29页命中边界关键词；其余不能凭扫描断言无来源/无边界，更不能认证充分。先逐课抽查高风险定量模型、信号连续/离散域、理想条件与可查阅来源。冻结泡泡的定性/非CFD边界已有独立记录，未强行纳入数学图谱。
> 后继信号短审已修现有δ[n]→DTFT H(e^{iΩ})/CT H(iω)域衔接及采样/移动平均的实际边界，见[验收](signal-domain-verification-20261026.md)；不代表全信号课已审。下面eigen仍是待证实学习任务候选。

- **P2语义入口**：eigen 节点当前 step4 是正交/对角化而非最初特征向量直观课；链接存在，需先决定学习任务再换入口。频率响应连续 H(iω) 与离散脉冲δ[n]的域区分值得下一次短审查。
- **待人工验证**：32个核心页存在未由本扫描命名的canvas；33个核心页存在裸控件高度<48的信号（含带可点标签的checkbox/滑条），不是失败数量。要核对可点区域、键盘等价、文字读数/替代描述和读屏语义。无名canvas数不能直接当无障碍失败数。

## 可复现检查与语义边界

```sh
node atlas/tests/data-quality.cjs
node atlas/tests/data-quality-core.cjs
NODE_PATH=/path/to/node_modules ATLAS_BASE_URL=http://127.0.0.1:18775 \
  ATLAS_AUDIT_EVIDENCE=/tmp/atlas-audit node atlas/tests/data-quality-browser.cjs
NODE_PATH=/path/to/node_modules ATLAS_BASE_URL=http://127.0.0.1:18775 \
  ATLAS_AUDIT_EVIDENCE=/tmp/course-audit node atlas/tests/course-audit-browser.cjs
node atlas/tests/coverage.cjs /tmp/course-audit/course-runtime.json > /tmp/coverage.json
```

CLI校验group/node/edge/route ID唯一、双语定义/标签/原因/help、节点端点/组/类型、路线背景及相邻连通、来源本地文件。边沿用既有from:to稳定身份，不改UI状态键。一般关系允许环；只有显式 `prerequisite:true` 子图的环标记“需要编辑复核”并失败，非boolean声明拒绝，不推断foundation是先修，也不宣称所有先修环都不合理。当前0条先修声明；fixtures证明普通环通过、声明先修环失败、反向路线仍通过。浏览器另查实际生成DOM的唯一章节锚点（包括power-converters），不从静态HTML猜测动态章节。

全局基线是48页串行390px默认态+中英切换+一次Tab、HTTP/脚本/DOM命名/重复ID/宽度信号。不是48课全交互、全模型、全无障碍审查。来源链接钩子和关键词片段只是接手证据；URL可达也不等于每条解释科学正确。所有Chrome套件串行运行，既有模型/导航套件的更深证据各自有边界。无npm构建、lint配置或TypeScript步骤，不虚报未存在检查。

## 本轮文件与交接

运行修改限 `atlas/data.js`、`atlas/index.html` 的数据缓存版本、`complex-numbers/style.css` 局部布局和焦点规则；没有新模型或共享app控制器改动。新增 `atlas/tests/{data-quality,data-quality-core,data-quality-browser,course-audit-browser,coverage}.cjs`；文档沿用 atlas/README 与 specs/reviews 索引。

机器证据：[逐课清单](atlas-audit-verification-20261026/coverage.json)、[最终汇总](atlas-audit-verification-20261026/final-results.json)、[独立审阅](atlas-audit-verification-20261026/independent/final-acceptance.md)；其余位于同名目录，含course-runtime.json、core.json、serial-regressions.json与质量浏览器结果。晨间索引按学习目标给最短路径，不使用轮次数量作学习成果。并发复核只标识其他修改，不覆盖/整理/提交他人文件。所有改动本地，未push/部署。

## 最终验收与证据边界

- **通过**：质量CLI无错误；21项正常/错误fixture（ID、引用、双语、空记录、一般环/先修环/反向路线）；独立8组先修/环/schema试验另存。实际浏览器新增验收117检查、17来源文件/40唯一DOM锚点；复数课程双语320/1280、原生键盘预设/3px与系统高对比焦点/模长与角度数值对账、Back保留路线/过滤/节点，320真实DOM字号×2、焦点回到可见控件，atlas rem字号200%。
- **通过**：48页默认态串行基线（45核心含枢纽+3邻域）HTTP200、无pageerror/failedrequest/重复DOM ID/可见控件缺名，390px两语言无横向溢出、语言切换后的一次Tab焦点可见。仅此范围；不是全部canvas任务的无障碍认证。
- **通过**：既有九套串行浏览器回归：atlas327、motion、rates、response、travel、continuity、foundations、work、home（目录120项）；现有模型/边界/旧课语义检查均通过。解析运动/积分/功、响应峰阈值与极点条件未改。core.json保留原20条命令结果，core-final.json记录最后校验器21fixture及新脚本语法检查。原有完整更深证据仍见各轮报告。
- **透明记录**：串行总日志中首次quality失败是测试未展开details就读取innerText；修测试后单独完整重跑通过，原失败日志保留，以final-results.json明确关联最终证据，不改写旧失败。更早新测试还修正键盘导航等待和字号触发CSS过渡的时序；实际发现的EN320页头溢出独立修复。focus-diagnosis.md区分产品问题和测试问题。
- **独立审阅**：最终静态/科学/教学试走通过，零必须修复项。独立8组环/schema试验、四类null记录诊断；三预设×中英文原生Enter/Space与独立复乘/显示舍入核对；Back恢复、实际展开回复力原因、ZH320逐节点字号×2、原生Tab/ShiftTab无遮挡、3px普通/系统高对比焦点。独立试走发现的1px焦点已红→绿修复；此前舍入/过渡/滚动测试假设失败保留。未据此认证任意拖拽、实机或学习效果。
- **并发**：基线HEAD1c13c3fc；完成时以 concurrency.json 为准。15673个非本轮基线文件中仅一份其他工作review变动，另外有其他任务新增文件；均保留。既有atlas控制器/模型、共享首页/目录/路由配置、LeetCode内容未被本轮覆盖。未重置/整理/暂存/提交他人改动。
- **未运行/未证明**：项目无npm build/lint/TypeScript配置，无须虚构命令。没有实机手机/读屏语音/真实学习者效果/硬件/生产负载测试；外部来源没有全量联网可达性认证。除round9明确验证的复数操作外，390px全局基线之外的其他旧课320px/200%/键盘任意操作仍需有选择深审。本轮无push/部署、付费、凭据或系统设置变化。没有剩余权限阻塞。

接手顺序：从README索引与晨间路径复现当前闭环→核对最新指纹/并发增量→复现round9复数键盘任务→复现round10斜率/小孔学习闭环，再按已核证据选下一缺口；不要继续扩张弹簧簇来代替全局覆盖。
