# tan定义域、显示范围与键盘 · 2026-10-26

本地实现：[设计裁决](tangent-domain-design-20261026.md) · [开发索引](../../atlas/README.md) · [三路径晨间索引](nightly-math-physics-20261026.md)。不新建课程/节点/控制器，不改LeetCode，不push部署。

## 实际复现与最小范围

独立source/model设计gate先于实现/BRIEF。另一UI-only审阅者从S4写预测再试走，未读trig源码/BRIEF/测试/内部状态；其此前在光学互链看过S1UI这一曝光已披露，不冒称从未见过整页。旧版的普通sin/cos和tan常规值正确，本轮只修S1/S4/S6的tan及相关阅读情境：

- 89°/89.9°有限却被阈值写成趋向或等于∞，画布|tan|>3.3就标∞；|cos|<1e−12还把严格邻近90°的有限角误称无定义。
- S1近特殊角在±0.05°窗中展示精确表值；角标签会把近90°无≈地写成90，而其它处仍显示有限tan。已舍入sin/cos读数也被拼成精确数值等式。
- S4pointer/keyboard支持全周，但滑块折到mod180；127.2→原折射互链→Back后滑块127.2、图文35，刷新又全回默认。
- 独立adjacent-double复算发现S1按degree+360判象限会吞低位，与实际sin/cos符号相矛盾；原canvas键盘焦点还被1px旧规则覆盖。

已有S6的NaN剪裁区间本来就把渐近线断开，未为了修复重写采样算法。现有页面/状态/循环复用，图谱38/47/10不变。

## 科学、显示和状态契约

内部弧度，180°=π rad；本页读者操作一个规范化全周0≤θ<2π。tangentAt返回同一sin/cos与未舍入比值tan=sin/cos，三处图/读数/导出共用。只有本页表示的精确规范90°/270°状态按数学cos=0处理，tan=null无定义；没有cos容差带，也不把finite大数改为∞。非法非有限API输入/未知step返回false，不污染状态。

数学定义域排除π/2+kπ，周期π，tan为奇函数；90°两侧的±∞是单侧极限，不是90°的函数值。临近极点数值病态，机器浮点残差不代表精确实数运算。除识别出的规范特殊角度/轴值，数值以≈六位有效数字显示；十进制rad表示π/2也标≈。有限cos不显示假0，S4另显非零Δ与竖直规范角之差。S1精确卡片仅在实际规范状态出现，象限直接从同结果符号判断。

S4画面纵向±3.3、S6tan带±3.4是显示窗口：越界箭头/NaN空档不改变定义域。S6当前点在无定义时不画假的0点或有限箭头；曲线仍在NaN处断开，不跨极点连线。数值文本不把已舍入操作数当精确除式。

S4原生slider全周0–360、stepany保留pointer，方向键0.1°/Shift1°；S1/S6原canvas方向键1°/Shift10°，Home/End回0（360同向）。严格识别已有0.1°网格表达后用整数tick，保证按键可到精确90°；任意off-grid pointer状态不在读取/恢复/步进时静默量化。S1指针靠近特殊角的原主动吸附仍保留且说明明确。

沿用knowledgeGeometryReading v1 lesson:trig，仅S1θ/unit、S4θ、S6θ/chain；有限全周/enum/bool/数组校验，foreign history保留。拖动预览/keydown保持180ms尾沿；pointerup/cancel/lostcapture、已处理keyup、range change与预设/unit/chain/播放按钮在状态变更后同步保存，保证明确提交后的立即reload；外链/pagehide仅补充，不依赖它补救reload。返回与明确reload保持已提交阅读角度；文档重建时S6暂停、只重建当前点，不伪造旧轨迹或存答案/掌握。bfcache内存返回可能保留该页原轨迹，不等于永久保存；播放采样不逐帧持久化。其它wave/audio参数与初始化沿原行为，不冒称全课永久进度。History/存储拒绝时页内继续，不承诺跨重建恢复。

来源：[OpenStax7.4定义/符号](https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-4-the-other-trigonometric-functions)、[OpenStax8.2图/周期/渐近线](https://openstax.org/books/algebra-and-trigonometry-2e/pages/8-2-graphs-of-the-other-trigonometric-functions)，本轮已读原文核对；无测量或学习效果声明。

## 文件与复现

trig四件套；原无本地BRIEF，新trig/BRIEF仅记录当前有界修复；新增trig/tests/tangent-core.cjs、tangent-browser.cjs；已有atlas/覆盖/晨间索引及本报告/证据。无其它课程运行代码、框架、图谱数据或依赖变更。

```sh
# /Users/songyy/Documents/knowledge-vis；已有服务器运行时不重复启动
python3 -m http.server 18775 --bind 127.0.0.1
node trig/tests/tangent-core.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules \
  ATLAS_BASE_URL=http://127.0.0.1:18775 TANGENT_EVIDENCE=/tmp/tangent-domain \
  node trig/tests/tangent-browser.cjs
```

复用既有Playwright/Chrome，未安装依赖。纯静态项目无npm build/lint/TypeScript配置；用适用语法/模型/浏览器验证。累计浏览器严格串行；详细命令见atlasREADME。

## 验收与接手

- **通过的范围**：规范极点与相邻double、有限大值/符号/周期/奇函数、精确网格与off-grid键步、非法API不变、图与未舍入比值一致；36,000角度网格的比值残差≤1.12e−16，周期绝对差在已测远离极点条件下≤4.27e−12，均为浮点检查而非实数准确度。两语键/占位符/DOM与既有模型核心命令全部通过。
- **实际交互通过**：S1/S4/S6原生键盘到精确90、270邻域/周期及fullcircle/单位/近角标签/精确卡片/象限邻接例，真实canvas断线段检查，pointer及浏览器touch，Back+明确reload/atlas返程/foreign/拒绝存储。EN/ZH320/390/1280、实际DOM字号×2、48px/普通及forcedcolors的3pxcanvas焦点可读。最终tan日志1457条检查包括逐绘图片段性质，不能称1457个独立学习任务。
- **恢复收口通过**：真实长mouse/touch松手后不等待即可保存末角并reload一致；preset/handledkeyup/rangechange/unit点击的立即reload有独立短回路红→绿。S1/S4丢捕获后悬停不再改角。原红JSON/截图与修后日志保留；模拟拒绝权限是浏览器fixture，不是工具审批拒绝。
- **累计通过**：22条核心命令、16套串行浏览器：tangent、lens、refraction、geometry、complex keyboard、quality、48课程默认态、atlas、motion、rates、response、travel、continuity、foundations、work、home。首16套通过，提交/丢捕获收口后仅复跑受影响的tan并过；first-run与各focused记录均保存，不冒称无关套件全新重测。图谱38/47/10不变，atlas347；48页默认基本门槛不等于全站全状态科学/无障碍认证。
- **独立科学/实现**：源码先读、独立5143有限样本/10极点邻域、grid/off-grid、相邻象限、schema/foreign/拒绝、实际draw/callback spy；指出并复验修正显示、焦点、active、长拖与丢捕获问题。审阅者明确保留原先只查helper而漏actualpointermove的覆盖缺口。无剩余必须项；未启动Chrome，图像是只读查看根/另一操作者的供图。
- **独立UI-first**：先写预测再看原/修后页面，实际自选角/周期/deg↔rad、127.2返程、S1/S6键盘极点、320两语字体与行高×2/forcedcolors通过；最后原长mouse/touch等待1s后reload零剩余mustfix。立即提交后无等待恢复由根Chrome测试及独立VM补充，未冒称cold操作过该新时序；这是AI试走，非人类学习效果。

证据：[最终摘要](tangent-domain-verification-20261026/acceptance-summary.json) · [独立科学/实现](tangent-domain-verification-20261026/independent/final-acceptance.md) · [UI-first实际复验](tangent-domain-verification-20261026/cold-ui/postfix-ui-review.md) · [最终累计日志](tangent-domain-verification-20261026/serial-regressions.json)。最新逐课/图谱快照在coverage-final.json，DOM外链数量不代表已展开可见或全站来源充分。

并发观察见concurrency.json；仅哈希匹配的目标逐次应用，保留其他任务文件/HEAD增量，不重置/整理/暂存/提交他人工作。最终文件与本地链接核对见handoff-final.json。无工具/审批阻塞；无本地推理runtime启动，无此类清理事项；本地预览服务器保留。


独立审阅要求的角度≈、近轴象限符号、canvas3px焦点均已修并保留证据；首套browser通过后发现S6新manualpause只改text/aria却遗留active高亮，已统一labels并增加视觉class一致断言。这是本轮引入后修的UI状态错误，不冒称只有测试问题。原发现、源复算、实际截图与最终日志分开归档。另保留实际长拖误存中间角、立即reload窗口的红绿；pointermove统一manual路径、末事件提交立即保存，并补S1/S4lostcapture先结束拖动再保存。S1单位切换也同步只读导出快照，避免元数据滞后。

未经实机手机/读屏语音/真实学习者效果验证，非全站科学/无障碍认证。图中数值/裁切只是浮点教学计算，尤其不把极近pole的数值当实数精确预测。下一步先收真实体验；继续自主研发时选新的证据缺口，保留有界范围与每轮详证，不重建平行系统。
