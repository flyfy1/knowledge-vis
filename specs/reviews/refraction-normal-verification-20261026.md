# 法线角 → Snell关系与全反射 · 2026-10-26

本地实现与验收。入口：[atlas交接索引](../../atlas/README.md) · [晨间最短体验](nightly-math-physics-20261026.md) · [设计裁决](refraction-normal-design-20261026.md)。本轮不新建页面、不改LeetCode、不push或部署。

## 审查证据与选择

先读现有reflection-refraction、trig、atlas的结构/状态/科学表述。独立source/model审阅与未读相关源码/BRIEF的UI-first试走分开执行，后者先写预测再操作。原页面法线图形和一般角度正确，但实际存在：

- 标量负角全反射返回NaN；trace3用±1e−9°窗口当临界，与同角Snell无解分支不一致。
- 全反射文案写≥临界，图却将临界极限单列；0°时S3仍说折射角“大于”入射角。
- n定义为“拐弯本事”，原BRIEF的48.6°不匹配n=1.33算出的48.7534666…°；S4宣称横移，而模型始终沿真鱼竖线比较深度。
- 独立UI复现空气侧设57°→索引→Back：滑块57但图文恢复40°。精确临界预设与手动48.8°只看舍入显示容易误判为同状态。
- 点名Snell但缺可核对的正弦关系、实角值域与现有数学课入口。

选择“已有课纠错+同状态的数学解释”这一小闭环。图谱只添1个canonical Snell概念、unit-circle到它的1条应用关系与2站普通optics路线；当前38节点/47关系/10路线。没有第三种实验控制器或学习画像。

## 模型、条件与实现

S2/S3仍各自拥有原入射角与左右侧。共享snellDeg先校验有限正折射率与±90°域，按角的绝对值分类，结果保留输入符号：n₁>n₂时才有θc=arcsin(n₂/n₁)；严格大于为TIR/null，相等为90°极限，低于为折射。图方向和公式直接使用同一标量解，不再用独立角容差带。允许解的asin输入只为浮点舍入夹到[0,1]；旧S4向量根号加机器精度保护，未换引擎。

界面角度用°；内部三角函数先以π/180转换为弧度。两角从界面法线量起，n=c/v为真空光速/介质相速度，无量纲；本页固定空气1、水1.33，假设均匀无吸收介质且不含色散。Snell式n₁sinθ₁=n₂sinθ₂中，s=(n₁/n₂)sinθ₁>1没有实角。近机器临界值的角度显示仍可能舍入成90°，分类依未舍入状态；不把机器残差当物理准确度。

临界预设保留计算值；range用step=any连续拖动，方向键明确0.1°，Home/End为0/80。精确临界与普通48.8°的分支说明显示额外小数并解释舍入，不输出48.8>48.8假比较。普通反射仍存在、全反射仍遵守反射定律；线宽/颜色不表示能量份额。无真实传播时间、Fresnel功率、波动/倏逝场求解。

optional原生details说明单位圆的sin值域、法线参考与arcsin含义；光学图的角从法线起，数学单位圆的角从正X起，链接不自动转移状态。原30°/精确临界/60°预设服务一条预测问题：水→空气s分别0.665/1/>1，对应普通折射/沿界面极限/全反射。可回看trig#step1再返回；不存答案或掌握状态。S4只收紧为沿真鱼竖直参考线的表观深度示意，非完整虚像汇聚。

沿用上一轮knowledgeGeometryReading的lesson判别结构，仅保留本课S2/S3角度/侧，有限域与符号校验，180ms尾沿保存、链接/pagehide刷新；合并其他history字段。Back和document重建后控件与模型同步。无新local/sessionStorage键；不保存quiz/其他步骤，History不可写时仅本页交互，不保证跨重建恢复。

## 文件与复现

- reflection-refraction四件套、原BRIEF；新增tests/snell-core.cjs与snell-browser.cjs。
- trig的index/i18n/style只增互链及其48px/焦点样式，未改trig模型/动画/状态。
- atlas/data.js、index.html与测试真实数量；旧几何浏览器套件只解耦全站总数并验自身路线；无atlasapp/controller变更。
- CONCEPT-MAP的附加映射、既有atlas/覆盖/晨间索引与本报告/证据。

```sh
# /Users/songyy/Documents/knowledge-vis（已有静态服务器运行时不重复启动）
python3 -m http.server 18775 --bind 127.0.0.1
node --check reflection-refraction/app.js
node reflection-refraction/tests/snell-core.cjs
node atlas/tests/data-quality.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules \
  ATLAS_BASE_URL=http://127.0.0.1:18775 REFRACTION_EVIDENCE=/tmp/refraction-normal \
  node reflection-refraction/tests/snell-browser.cjs
```

本机复用现有Playwright与Chrome，未安装依赖；纯静态项目无npm构建/lint/TypeScript配置，不冒报未存在命令。其余累计命令见atlas/README，Chrome只串行运行。

## 验收与边界

- **通过**：17条语法/模型/双语/既有边界与图谱核心命令。新模型在16001个双向角度网格与22525个折射率/角度组合、严格临界两侧/正负/零度/无解/反向可逆中通过；最大Snell残差3.33e−16（浮点量，不是物理测量精度）。旧S4的321眼位仍有有限、较浅的表观深度和小几何残差。
- **通过**：新折射浏览器148检查覆盖同源公式/实际canvas折射线存在与清除、精确临界/手动48.8、原生键盘/指针/三次重复重置/测验隔离、Back+明确reload、非法与foreign历史、拒绝浏览器存储、两语320/390/1280、实际DOM字号×2/48px/3px/forcedcolors。
- **通过：累计14套串行浏览器**：refraction、geometry、complex keyboard、quality、48课程默认态、atlas、motion、rates、response、travel、continuity、foundations、work、home。atlas347；quality124（20本地文档/44实际唯一锚点）；48页默认基本门槛通过。quality里的复数预设检查不等于任意输入认证，任意输入由keyboard独立套件验证。每套只证明列出的范围，不能累计成全站认证。
- **独立科学/架构通过**：审阅者先源码/BRIEF后独立VM复算，并查看另一个UI操作者的可读视口截图；未启动Chrome。独立32002光线残差≤4.44e−16、实际方向角差≤1.42e−14°、26个临界边界案例、schema/foreign/history拒绝/双语一致性通过。旧2px焦点优先级必须项修复并窄复验；本轮已审范围零剩余必须项。
- **独立UI-first通过**：未读相关源码/BRIEF/内部状态，事前写预测再操作。原57°Back与临界舍入两问题修后均解决；自选42°、30/60问题、Home0°、单位圆互链/atlas返回均符合预期。EN/ZH320实际字体与行高×2、forcedcolors、键盘焦点视口证据可读。是AI教学试走，不是人类学习效果或读屏语音实验。
- **失败记录保留**：首轮累计中geometry旧37/46/9总数及atlas重置旧37断言失败，均在课程功能断言之外。geometry改验自身路线/节点/有向边；atlas仍先验38唯一节点/47关系，重置显示数再与实际数据一致；其他断言未削弱。之后仅串行复跑这两套并通过，见serial-first-run.json、serial-retests.json、最终serial-regressions.json。

证据：[最终摘要](refraction-normal-verification-20261026/acceptance-summary.json) · [独立科学与实现](refraction-normal-verification-20261026/independent/final-acceptance.md) · [独立UI-first复验](refraction-normal-verification-20261026/cold-ui/postfix-ui-review.md) · [累计原始结果](refraction-normal-verification-20261026/serial-regressions.json)。最新逐课/图谱清单见coverage-final.json；外链数量只是DOM存在，不代表解释已展开可见或全站来源充分。

并发快照见concurrency.json：其他LeetCode任务继续前进的HEAD/文件增量均保留，未重置、整理、暂存或提交。所有本轮文件经逐次SHA256校验再应用。归档与交接链接最终核对见handoff-final.json；当前无工具/审批阻塞。

附带文档一致性修正：共享CONCEPT-MAP原83把v-t面积泛称路程，与前轮已修实际课程的有符号速度口径漂移；只改该既有行的说明为正向时间的速度积分是位移、速率积分才是路程，原链接保持。没有重做运动模型或无关页面。


保留修复与失败过程：原scalar/trace红边界与UI-first57°返回错位；旧CSS2px焦点优先级；新增临界按钮长串在320实际2x溢出/导航压缩，改为真实换行与横向导航不缩挤，未隐藏文字；测试最初用innerText读取关闭details返回空串，改为明确展开/内容读取；指针目标59.9999946°与60°差来自浏览器坐标量化，指针容差0.01°，模型和原生键盘精度断言未放宽。可选favicon.ico404独立记录，其他应用错误仍失败。

科学来源：[OpenStax折射/Snell](https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction)、[临界角与全反射](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection)、[单位圆定义](https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-3-unit-circle)，本轮已读原文核对；均为模型依据，非硬件测量。

> 历史后续候选更新：以下薄透镜审查已由[round12](lens-focus-verification-20261026.md)完成；之后[round13](tangent-domain-verification-20261026.md)另审并修复trig，不能把本轮“未改trig模型”误读为当前状态。原测试范围/结果仍只属于本轮；当前优先级见[开发索引](../../atlas/README.md)。

未做物理手机、读屏语音、真实学习者理解/学习效果或全站科学认证。本次不修所有旧课，不把默认48页基线当全站所有状态通过。下一步先做真实设备/读屏/学习任务观察；内容方向先审薄透镜近焦显示和虚实像条件，再选最小修复，候选不等于已证实缺陷。
