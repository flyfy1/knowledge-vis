# 薄透镜近焦与虚实像 · 2026-10-26

本地实现与可复现验收：[开发索引](../../atlas/README.md) · [晨间体验](nightly-math-physics-20261026.md) · [设计裁决](lens-focus-design-20261026.md)。不新建页面/图谱节点/引擎，不push部署，不修改LeetCode。

## 实际问题与最小选择

先审旧lens的PURE、三主光线/视图/独立步骤、原状态与UI约定。独立source/model审阅先于BRIEF；另一位未读相关源码/BRIEF/内部状态的UI-first审阅者先写预测再试走。一般成像正确，6919组旧整数条件三线交点与公式一致，故局部修复：

- imageOf/zoneOf使用±0.5距离窗：可连续拖到u59.8或60.1，却把有限像说成精确焦点无穷远；接近120也被说成恰好2f。
- 原m=v/u是距离比，像高公式本身正确；BRIEF却把它混作带符号放大率，虚像例的符号也不自洽。
- 焦点处本不存在有限第3特殊光线，旧绘图却另造一条并继续叫“过近F→平行”；虚像条件下应说明近F在入射线反向延长上。
- 屏p101被两语称为“正好等于v100”；画外虚像缺少范围说明。320px原最小ppu还会把允许的最远物点画到画布外。
- 独立UI复现u75→先修页→Back：滑块75但图文180；S1与屏幕参数同类错位。负v/正尺寸与M区别不清。

选择修已有函数/读数/范围与返程，不机械增加图谱。现有Snell课终章增加到lens#step2的自然后续入口，lens原有先修反链保留；atlas38节点/47关系/10路线不变。

## 科学与数值契约

会聚薄透镜f>0，实物u>0，光从左向右；物点x=−u。v>0为右侧实像，v<0为同侧虚像。1/f=1/u+1/v，v=fu/(u−f)。新明确M=−v/u=hᵢ/H：正M正立，负M倒立；|M|才是正尺寸倍率。兼容原导出m=v/u但只称距离比，不作为带符号放大率。

只有未舍入u===f无有限像点；u→f⁻时v→−∞，u→f⁺时v→+∞。在精确焦点状态，v保留Infinity旧接口，M与像高为null未定义有限值；不能用NaN标签伪装真实∞。有限正f/u与有限h之外返回invalid/null；不可表示的有限计算结果也不能伪称恰在焦点。h=0允许作为轴上物点的数学边界。

分类使用同一未舍入结果，u=f/2f均不加距离容差。格式为两小数内可精确表达则原样，否则6位有效数字标≈；非零u−f不舍成0。新增同结果的带符号v/M/hᵢ与u−f读数，让近焦显示与真实分支可区分。极近焦点的交点求解病态，核有限类型/方程与归一化光线残差；只在条件良好的画内点谈交点像素一致性，不用角容差或量化掩盖。

原光路、状态owner和固定比例尺复用。主线1/2在u=f平行；第3特殊线无有限透镜面交点则省略。u<f时它的近F位于反向延长上，不是光先向左穿过F。画外第3线整条省略并说明显示限制；这不是物理口径截光求解。像的位置/完整高度不在画内时用外部文字明确有限存在；不以画外当不存在，也不随u自动zoom。S1/S2比例尺仅依viewport确保最大允许物距仍可见。

所有长度同用任意单位，M无量纲。模型限薄透镜、近轴、两侧相同介质与实物；色散/像差/有限口径/衍射未求解。平行于主轴的束才会聚于轴上F，非泛称所有斜平行束；光线图不代表传播时间或能量比例。各步骤是明确独立情境，S0可变f不偷偷改其他步固定f60。S3仅p===v标恰好合焦，其他模糊/光斑均为示意，不算照度/PSF；眼睛图标非眼内光学求解。与小孔相似比例的适用条件分开。

依据：[OpenStax薄透镜](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses)原文已核，使用其符号/主光线与近轴框架，不是硬件测量或完整真实光学仿真。

## 交互、状态和文件

S1u/h、S2u、S3p用原生step=any保留连续拖动；S2方向键0.1单位，其他连续滑条每次1单位，Home/End保留，原预设仍可精确到f/2f。图、读数、控件使用同一值，不再只把滑块/标签round成另一参数。原测验保持独立。

阅读恢复复用knowledgeGeometryReading v1的lesson:lens结构，保存f/u/h/三线开关/屏幕情境与p，不含quiz/答案/掌握。验证有限域/枚举/布尔与数组拒绝，仅复制既有字段；foreign history保留，180ms尾沿+链接/pagehide刷新。Back和明确reload后同一记录恢复；History失败仅页内降级，不承诺跨重建。无新local/sessionStorage键或画像。

运行文件lens四件套与原BRIEF；reflection-refraction的index/i18n与局部style只补已有课程互链/说明及新入口48px目标；新增lens/tests/focus-core.cjs、focus-browser.cjs及既有索引/本证据。无atlas运行变更、框架依赖或无关重构。

```sh
# /Users/songyy/Documents/knowledge-vis；已有服务器运行时不重复启动
python3 -m http.server 18775 --bind 127.0.0.1
node lens/tests/focus-core.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules \
  ATLAS_BASE_URL=http://127.0.0.1:18775 LENS_EVIDENCE=/tmp/lens-focus \
  node lens/tests/focus-browser.cjs
```

复用已安装Chrome/Playwright，未安装依赖。项目纯静态，无npm build/lint/TypeScript配置，语法/模型/实际浏览器是适用验证；累计命令见atlasREADME，Chrome只串行。

## 验收与接手

- **通过**：20条语法/新旧模型/双语/数据质量核心命令。新模型22812个f/u/h网格组合，严格f/2f及相邻double、合法零高度、非法/不可表示结果、M与距比、三线归一化残差及显示键/占位符/DOM通过；最大薄透镜方程残差6.94e−18、归一化光线残差4.27e−16，均为浮点量，不是物理准确度。
- **通过**：最终lens浏览器167检查，实际Canvas两条焦平面主光线平行且无伪第3线，59.9/60.1有限且画外、符号/同源公式、屏98/101/102非exact与100exact、连续键盘/指针/quiz隔离、Back+明确reload/foreign/非法/拒绝history、两语320/390/1280、最大物点可见、实际DOM字号×2/48px/3px/forcedcolors。
- **通过：累计15套串行浏览器**：lens、refraction、geometry、complex keyboard、quality、48课程默认态、atlas、motion、rates、response、travel、continuity、foundations、work、home。初次15套全过；最后新增入口48px修正后只复跑lens167与refraction148，均过。原始结果/后续复跑分开保存。atlas仍347；graph38/47/10未扩张。48课默认基本门槛不是各旧课全状态科学/无障碍认证。
- **独立科学/实现通过**：先读源码/BRIEF再独立VM复算，5848有限样本、严格边界/非法输入/同源M、schema/foreign/拒绝/不存quiz通过；另检查8组固定viewport最大物体与双侧/仅高度画外。核过最终三文案及8运行/契约文件一致性，查看根与另一UI操作者的可读视口图；未启动Chrome。科学/实现已审范围零剩余mustfix。审阅者曾漏读R3guard提出非阻断建议，随后独立绘制探针复核后明确撤回，证据保留。
- **独立UI-first通过**：先预测再操作，不读相关源码/BRIEF/内部状态；原Back/屏101假等式均修复。u75、S1u105/H18/三线、屏75.3返回与reload一致；自选45/H18、近焦两侧、最大物距及互链通过。EN/ZH320实际字体及行高×2、forcedcolors视口可读。此试走先于最后3句科学限定与新增入口48px；后者由源码独审和根最终浏览器覆盖，不冒称冷读操作者亲测过新hitbox。不是人类学习效果或读屏语音实验。

证据：[最终摘要](lens-focus-verification-20261026/acceptance-summary.json) · [独立科学/实现](lens-focus-verification-20261026/independent/final-acceptance.md) · [UI-first窄复验](lens-focus-verification-20261026/cold-ui/postfix-ui-review.md) · [实际累计结果](lens-focus-verification-20261026/serial-regressions.json)。对应目录保留原发现、失败/修复与最终记录。

并发文件/HEAD观察见concurrency.json：保留其他任务变化，不重置/整理/暂存/提交。所有本轮目标逐次SHA256校验后应用；最终文件和本地文档链接检查见handoff-final.json。无工具/审批阻塞。未使用本地AI推理runtime，无此类清理事项；本地预览服务器保留。


过程记录保留：旧±0.5误分类与原UI的Back/假等式；首轮Canvasstroke的1.8浮点宽度探针用严格===误判（修探针精度，不放宽几何）；新增R3的u<f纯文案被原innerHTML当标签截断，改为textContent/换行后原测试通过，这是本轮引入并已修的UI错误，不冒称只是测试问题。独立审阅还去重焦点说明并校正BRIEF显示/病态交点条件。所有实际未通过尝试与最终结果分开保存。

> 历史后续候选更新：以下trig/tan审查已由[round13](tangent-domain-verification-20261026.md)完成，原候选不是仍待重做的任务。真实学习者/设备/读屏仍未验证；见[当前开发索引](../../atlas/README.md)。

无实机手机、读屏语音或人类学习效果验证，也非全站科学/无障碍认证。下一步先观察真实学习者/设备/读屏；内容回到现有trig/tan定义域、近90°与画面范围及键盘入口，先审再定修复，不先称其有bug或继续堆光学节点。
