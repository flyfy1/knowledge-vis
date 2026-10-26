# 复数任意坐标的键盘路径 · 2026-10-26

状态：本地实现，最终验收见末节。[atlas交接索引](../../atlas/README.md) · [晨间体验](nightly-math-physics-20261026.md) · [覆盖审计](atlas-audit-verification-20261026.md) · [设计](complex-keyboard-design-20261026.md)。数学/物理优先，本轮不增加图谱节点或课程。

## 实际缺口、选择与完成范围

原课程S1单点、S2两加数、S4两因子的任意坐标只能pointer拖动；既有按钮只能选固定点。修复前浏览器证据red-gap.json记录三个画布无键盘坐标入口。现在每图下使用原生坐标表单：实部/虚部、应用；S2/S4另用已有mode按钮风格选择z1/z2，aria-pressed恰好一个。Enter/Space选目标，Tab到数字，↑/↓只改草稿0.1，Enter/应用才更新原图。两数都可独立输入，不局限预设。

可验收的学习问题是用坐标分别设两个1+i，先预测乘积模/辐角，再看同一图与读数；任意操作还可核原点无辐角、负实轴+180°、和的分量相加。没有答题计数/掌握画像/自动推断学习效果。没有第三绘图系统或新数学模型。

## 单一状态、精度与边界

提交只更新原S1.z / S2.z1,z2 / S4.z1,z2并调用对应原render；原数学PURE块和pointer normalizer逐字不变。新prepareCoordinate只是输入验证适配器。raw输入有限坐标→既有snap1到0.1→S1每分量±5、S2±4.2、S4按比例限制模≤2.6。S4先吸附再投影，保留吸附后的方向；不是说raw任意小数角度总能完全保真。投影后的分量可能不在0.1网格上；输入并非被错误地各限±2.6。以上只限绘图，不限复数本身。

原三角预设保留精确sin/cos直接赋值，未编辑Apply保留精确坐标，不再吸附。number stepany避免把真实非网格预设/圆盘投影点错判为invalid step；↑/↓由本页处理且preventDefault，未完成/非有限草稿不自动变0，极大数不能可靠表示0.1步长时明确提示。无法完成浮点运算的坐标拒绝，保留原有点与草稿；invalid Apply聚焦首个坏字段。应用后输入框/图/原有读数同步实际值，调整时有双语status。

dirty标记只在原DOM，验证提示仅当前内存。语言与resize不覆盖草稿；真正换目标/明确preset/drag同步实际点，重复选当前目标保留草稿。成功提交保留原焦点，不重置S3旋转轨迹/quiz已锁题目。无新local/sessionStorage键、URL状态、用户追踪、访问权限；整页reload仍按旧行为初始化课程，atlas Back恢复原图谱上下文。

数学依据仍为原课程的复平面/复乘规则：[OpenStax10.5](https://openstax.org/books/algebra-and-trigonometry-2e/pages/10-5-polar-form-of-complex-numbers)，乘积模相乘、非零因子辐角相加后取主值(−180°,180°]；零复数无辐角。输入限制是显示适配，不是新数学定理。原数学块未改证据为pure-preserved.json。

## 独立教学审阅发现并修复的显示错误

在实际“两个1+i”试走中，旧S4模行写成1.41×1.41=2；这不是精确等式（舍入因子相乘为1.9881）。计算模型是对的，但显示把先后顺序混淆。先加失败回归，再窄修中英模/角/代数对账：保留精确的符号恒等式，数值用≈，明确用未舍入坐标/角先计算再显示。不把舍入操作数代入精确等式，乘积点与读数值不改。

同时S1原√({a}²+{b}²)会把负数字面量写成未括号平方，例如−4²，并把舍入单位圆坐标当精确根号输入。改保留符号√(a²+b²)与数字≈，避免负号优先级和舍入歧义。原点分支保留精确0/无辐角。此为展示修复，不增加显示位数或另算一套数学。

## 未读项目材料的页面试走与终章互链修复

原审阅者先源码/BRIEF后UI的顺序保留如实记录。随后另用未接触项目历史/源码/BRIEF/测试的独立AI审阅者，只读取本地页面与原生控件，从atlas走完整step0…6、自选数值先预测再观察、逐步复述；不读取window模型/STR等内部状态。它不是实际学习者研究。

此UI-only试走确认任意键盘路径无操作阻塞，独立发现终章旧句把所有旋转矩阵概称“无实特征方向”。0°/180°的I/−I是反例；纯旋转也不能泛称为螺旋。经真实eigen#step2源码及另一审阅者核对，既有“旋转缩放：复λ”预设是[[0.55,−0.953],[0.953,0.55]]，确有非实特征值。因此只改本课互链文字，明确让人**选择这个具体预设**并限定“这一例”，不自动选择、不泛化所有旋转、不改eigen页或另建模型；原BRIEF契约同步修正。先以180°反例与两语具体入口政策构造失败，再修复通过。原发现与独立最终窄复验分开归档。

UI-only最终窄复验通过，原F1已解决，已检查范围零剩余必须修复项。两语实际到达eigen/#step2并选择名称一致的预设，页面显示0.550±0.953i、约60°旋转及1.1缩放，与新限定说明一致。原发现、逐步复述、DOM日志和修复后截图均保留于同名目录cold-ui/。该审阅者在初次完整试走前未读项目材料/源码/内部模型；复验同样只读页面。所有Chrome已关闭。

## 文件与复现

运行修改限 complex-numbers/{index.html,app.js,i18n.js,style.css}；在原BRIEF追加本轮契约。新增本课tests/keyboard-core.cjs和keyboard-browser.cjs；atlas数据/控制器/路由注册/首页不改。按已有README/reviews索引维护覆盖与晨间文件。没有新依赖。

```sh
# 从 /Users/songyy/Documents/knowledge-vis 运行
python3 -m http.server 18775 --bind 127.0.0.1
node --check complex-numbers/app.js
node --check complex-numbers/i18n.js
node complex-numbers/tests/keyboard-core.cjs
NODE_PATH=/path/to/existing/node_modules ATLAS_BASE_URL=http://127.0.0.1:18775 \
  COMPLEX_EVIDENCE=/tmp/complex-keyboard node complex-numbers/tests/keyboard-browser.cjs
node atlas/tests/data-quality.cjs
node atlas/tests/data-quality-core.cjs
```

本机复用既有Playwright路径 /Users/songyy/Documents/integ-life/integ-games/node_modules 与已装Chrome，未安装依赖。其他累计命令见atlasREADME，Chrome套件串行，不重试此前被拒进程操作。无npm build/lint/TypeScript配置，未虚报这些检查。

预览：[任意复乘坐标输入](http://127.0.0.1:18775/complex-numbers/#step4) 或从atlas的complex节点打开课程，再Back返回路线/过滤/节点。

## 几何—光学：已盘点，尚未实现

> 历史盘点状态（round9结束时）：以下“尚未实现/下一轮”建议已由[小孔几何round10](pinhole-geometry-verification-20261026.md)实现，随后[Snell round11](refraction-normal-verification-20261026.md)和[薄透镜round12](lens-focus-verification-20261026.md)完成各自独立审查/修复。保留以下原证据，不把round9未执行的UI检查冒称已执行；当前范围见[开发索引](../../atlas/README.md)。

下一轮优先 `linear-functions/#step2` 的直线斜率→`pinhole-camera/#step2` 的像高比例，复用现有课程与滑条，目标是预测改屏距会怎样改像高。两课目前无这条互相解释/返回的明确深链，不应把勾股定理硬当先修，也不应因目录未入图谱就批量加节点。

actual pinhole代码沿物点/小孔直线求屏幕交点，imgH(H,u,v)=H*v/u；源代码CLI复算H60/u120/v90→h45，v180→h90，等v/u保持比例。u/v/H是课内同一标尺长度，不声称真实测量；正像高大小h与带方向的放大率−v/u须区分。这个建议尚未做UI验收，不能称已交付光学闭环。

构建前应先限定均匀介质/几何光学与中心光线的比例关系，补齐原“小孔越小越清晰”附近的衍射边界；不能宣称无限缩孔总更清晰，不加精确光学求解器或真实最佳孔径。[OpenStax几何光学导论](https://openstax.org/books/college-physics-2e/pages/25-introduction-to-geometric-optics) 与[射线模型](https://openstax.org/books/college-physics-2e/pages/25-1-the-ray-aspect-of-light)已浏览核对。几何描述射线，不是几何使光物理上直行。Snell角度/全反射与薄透镜近焦显示容差是后续独立主题，不混成本轮修复。独立实际文件盘点与数值例在本报告同名目录independent/geometry-optics-next.md与optics-model-cases.json。

机器记录：[最终摘要](complex-keyboard-verification-20261026/acceptance-summary.json)、[独立结论](complex-keyboard-verification-20261026/independent/acceptance.md)、[原数学与限制函数未改](complex-keyboard-verification-20261026/pure-preserved.json)。同名目录保存各次原日志、红→绿显示修复、最终复验、逐课基线与并发记录。

## 验收结果与接手边界

- **通过：新增任务**。最终完整本课键盘/数学UI321项（包括新增两数1+i→2i/模2/角90、零乘积无辐角和诚实舍入读数）、所有五对象任意输入、草稿/非法/目标/locale/resize/quiz/S3状态、mouse与浏览器touch tap、atlas Back；两语320/390/1280、逐DOM字号×2、3px/系统高对比焦点。
- **通过：数值与显示政策**。确定性样本验证复加/复乘、模乘/角归一、原点/负实轴、原box/disk边界、原网格/径向顺序、精确preset/no-op、不可计算值拒绝、双语key/placeholder/DOM parity；最后加入显示政策失败用例后红→绿。原PURE逐字未改证据独立于断言数量；测试数量不证明学习质量。
- **通过：累计集成**。舍入修复前12套串行浏览器全过（本课keyboard、quality、48课程基线、atlas/motion/rates/response/travel/continuity/foundations/work/home九套）。舍入修复只变本课显示文案/缓存版本，之后完整本课321、quality117（17来源文件40实际锚点）、48页基础门槛再次通过；随后S6互链的两个字符串另经核心反例/入口政策红绿回归与UI-only中英目标预设窄复验；不把旧日志改写为最后一版全站复测。既有运动/响应/积分/功/旧课语义与pole边界检查、图谱CLI/fixture均通过；命令与输出分别在core.json、serial-regressions.json、copy-final.json。
- **独立审阅**：最终PASS，零剩余必须修复项。原审阅者按先源码/BRIEF、后首次实际UI的顺序，从atlas试走两数1+i学习问题；此记录不是未读材料盲走或真实学习者研究。其任意五对象/partial exponent跨语言、错误恢复/精确preset/no-op/同目标草稿/target Space与Enter/指针及touch/quiz与S3/Back均过。独立发现旧舍入假等式后，窄复验两语320的S1负实轴/精确单位preset、S4两数1+i与任意投影点prod/mod/angle/algebra诚实舍入，最终PASS；原数学块未改。独立2x/forcedcolor与实际viewport截图证据及12例模型审阅见同名目录independent/acceptance.md、walkthrough.json、rounding-recheck.json。
- **透明修复记录**：最初headless select探针不是物理Mac失败；最终使用现有native mode按钮。最初两语fixture沿同document/hash保留了已解锁测验，测试错误去点击disabled正确答案；改为每语言明确reload，不改产品锁定。独立教学实际发现旧1.41×1.41=2，先失败再修文案，S1负数字面量平方/舍入根号同步修；预修复截图与red-rounding.json保留。模型/值计算与格式化位数未改。
- **未验证/不声明**：真实手机/触控硬件、读屏语音、真实学习收益、全站完整科学/无障碍；touch仅浏览器触控tap、pointer实际mouse drag，未声称实机所有手势。旧课模型域/学习连续性不由本课验收自动认证；几何—光学只做源代码/CLI/文献盘点，未建新连接。
- **并发保护**：基线HEAD74f2c672；非本轮15775个基线文件中仅另一任务的一份review变更，另有其新增记录；具体完成时HEAD及路径见concurrency.json。均保留，atlas模型/控制器/图谱数据、首页/路由注册、LeetCode解答未被本轮覆盖。运行实现限本课四文件，其他为原BRIEF、tests与已有索引/证据。

未push/部署/提交他人工作；未改LeetCode解答、系统睡眠、安全权限、凭据或付费服务。无新增权限阻塞。下一Agent先核对最新指纹/并发增量，复现任意坐标键盘学习任务，再决定小孔比例连接的最小实现。测试不是学习收益、全站科学准确性或无障碍认证。
