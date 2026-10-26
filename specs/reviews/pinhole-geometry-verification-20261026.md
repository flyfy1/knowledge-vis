# 直线斜率 → 小孔像高比例 · 2026-10-26

本地实现与可复现验收；[atlas交接索引](../../atlas/README.md) · [晨间体验](nightly-math-physics-20261026.md) · [覆盖审计](atlas-audit-verification-20261026.md)。未部署/push，不改LeetCode。

## 选择依据与实际闭环

先读原课/BRIEF/图谱与此前盘点，独立UI-first审阅先于相关项目材料读取。确认三项实际问题：直线S2返回时模型默认值与浏览器保留的旧滑块错位；小孔H90/u60/v180的像落到画布y342，超过旧330范围/屏底252；孔越小越清晰缺几何光学/衍射条件。另缺把直线斜率、相似三角形与倒像符号联系起来的解释/互链。

本轮没有新建页面、光学引擎或atlas实验控制器。复用原pinhole S.s2与s2geo，在step2提供可展开数学连接、同一端点计算的signed读数和一组A/B预测。原直线S2用b=0观察过原点的直线，再进入小孔例；两课保留各自示例，不假装自动把光线参数传进直线课的离散k滑条。atlas只增slope与pinhole-ratio两个实际概念、一条应用关系和geometry两站普通编辑路线。当前37节点/46关系/9路线，仍是精选子集，非先修认证或完整学科覆盖率。

## 数学、符号与单位

孔心O为原点，侧视图X向右/Y向上，长度/坐标用cm。本图保持孔心对齐物高中点，H改变时同步保持此几何约定：A=(-u,H/2)、B=(-u,-H/2)，屏X=v。顶端光线斜率k=−H/(2u)，A′的Y=−Hv/(2u)；相似三角形对应边成比例。h_s=Y(A′)−Y(B′)=−Hv/u，M=h_s/H=−v/u，无量纲。负号是对应端点差/倒像；正的尺寸h=|h_s|，不是负长度。k是光线方向的变化率，M是像/物尺度比，不能混同。

u/v60…180、H30…90，均为整数cm，u始终正，无可达零分母。孔心直线模型采用均匀介质、平行物/屏平面与足够大屏；小孔中u/v独立，不使用薄透镜焦距关系。数值先用实际坐标/比值求值再显示≈，不把舍入比值作为精确乘数。

原光学PURE（lineYatX/imgH/imageEnds/spot等）逐字未改。新signed读数直接从同一s2geo端点作差，非第二套状态。显示视口固定420、屏面绘图36…354，覆盖最大像y342；比例尺不随参数变化，尺寸标注始终放在像下。旧越界红证据与最终最大态截图保留。

孔径step3仍是另一固定场景，现在明示H72/u140/v170；仅d可变。其几何光斑外沿不是step2的孔心像高。几何缩孔减少光斑与入光量，但极小真实孔受波动衍射限制；本图不含波长/波动求解，也不预测真实最佳孔径。

来源：[OpenStax相似比例8.7](https://openstax.org/books/elementary-algebra-2e/pages/8-7-solve-proportion-and-similar-figure-applications)、[射线模型25.1](https://openstax.org/books/college-physics-2e/pages/25-1-the-ray-aspect-of-light)、[衍射/分辨率27.6](https://openstax.org/books/college-physics-2e/pages/27-6-limits-of-resolution-the-rayleigh-criterion)已核对。另查[Stanford相机模型讲义](https://web.stanford.edu/class/cs231a/course_notes/01-camera-models.pdf)的孔心投影/相似三角形；其计算机视觉记法可能把孔到像平面的距离称f，本课用v，不能将此记法当作薄透镜焦距定律。上述均为模型依据，非硬件测量。

## 状态、交互与范围

沿用原三滑条、拖动、预设/重置和语言机制。新增两按钮明确设置本步H/u/v：A=(60,120,90)得h45、M−0.75；B=(60,120,180)得h90、M−1.50，k保持−0.25。原其他步骤、quiz/动画状态不因对照改变；揭示解释只为固定例，不存答案/掌握。

每条历史记录的knowledgeGeometryReading仅记此课S2阅读几何：pinhole的H/u/v，linear的ki/b/探针x，版本与lesson校验。未知history字段合并保留，非法记录不进入模型；180ms尾沿保存与明确跨课点击/pagehide刷新，避免拖动时每帧写history。document重建也可恢复S2并同步原生控件；pageshow下一帧消除浏览器表单缓存与模型不一致。不是只依赖bfcache。

无新local/sessionStorage键、用户画像、答题记录、额外URL协议或新权限。整页重建时其他步骤/quiz依原初始化行为；只承诺本轮S2阅读情境恢复，不冒称整课永久学习进度。History不可用时本页内交互继续，跨重建恢复不作保证。

## 文件与复现

运行变更：pinhole-camera四件套；linear-functions四件套；atlas/data.js、app.js、index.html；pages.config.js只改atlas的两语描述。原两BRIEF追加当前契约；新增本课tests/geometry-core.cjs与geometry-browser.cjs，atlas/tests/browser.cjs仅按新真实节点/关系数修正断言。没有无关框架/配置/首页重构。

```sh
# 仓库根目录 /Users/songyy/Documents/knowledge-vis
python3 -m http.server 18775 --bind 127.0.0.1
node pinhole-camera/tests/geometry-core.cjs
node atlas/tests/data-quality.cjs
NODE_PATH=/path/to/existing/node_modules ATLAS_BASE_URL=http://127.0.0.1:18775 \
  GEOMETRY_EVIDENCE=/tmp/pinhole-geometry node pinhole-camera/tests/geometry-browser.cjs
```

本机使用既有Playwright(/Users/songyy/Documents/integ-life/integ-games/node_modules)与Chrome，无新依赖。累计命令见atlasREADME，所有Chrome套件串行。项目无npm构建/lint/TypeScript配置，不虚报不存在的命令。

证据入口：[最终摘要](pinhole-geometry-verification-20261026/acceptance-summary.json)、[独立科学复核](pinhole-geometry-verification-20261026/independent/actual-final-review.md)、[独立UI-first复验](pinhole-geometry-verification-20261026/cold-ui/postfix-ui-review.md)。同名目录保存原发现、失败、修复与累计结果。

## 结果、修复记录与交接

- **已通过**：新增geometry浏览器294检查；同一几何/符号/固定比例尺、A/B预测、最大态/指针、原生键盘、跨课Back与明确reload重建、其他history字段、非法记录、两语320/390/1280、实际DOM字号×2、48px/3px/forcedcolors、拒绝history/localStorage的本页降级。应用pageerror/console错误及失败请求均无；原有可选favicon404单独记录。
- **已通过**：原光学PURE未改；893101个界面整数参数组合的独立端点/像高/符号/k/M/完整视口检查，端点公式最大差5.68e−14cm（浮点误差，不是测量误差）。源代码审阅者另独立遍历同域；schema/双语DOM/键/占位符与既有模型/边界核心命令均过。
- **已通过：累计13套串行浏览器**：geometry、此前complex keyboard、quality、48课程基线、atlas、motion、rates、response、travel、continuity、foundations、work、home。atlas338；quality121（19本地来源页/42实际唯一锚点）；48页基本门槛通过。各套只证明其列出的范围，不能拼成全站科学/无障碍认证；质量链接套件只重演复数预设，任意复数坐标另由本课keyboard-suite验证。
- **独立科学/架构**：源代码/模型/单位/符号/固定比例尺/历史schema与回退/其他Owner合并复核通过；查看最大像及双倍字号截图。最初提出本步原预设2px焦点问题已局部补3px并复验，零剩余必须修复项。此审阅未启动Chrome，浏览器JSON不冒称其本人UI证据。
- **独立UI-first教学**：在未读这两课源码/BRIEF/内部状态下先看原页，发现Back与衍射两mustfix，修后UI-only复验均解决。自选直线k−1/b−2/探针x2跨课Back及reload保持一致；自选H84/u160/v100返回与刷新保持，A/B和自选预测与观察相符，可解释k/M、h_s/h和非透镜焦距模型；两语窄屏、独立H72场景及可展开内容正确，已查范围零剩余mustfix。这是AI页面试走，不是真实学习效果。
- **交接与并发**：完成时文件指纹及HEAD变化见concurrency.json；只观察保留其他任务增量，不重置/整理/暂存/提交他人工作。最新逐课DOM/graph清单由本轮coverage-final.json保存，外链统计只说明DOM存在，不等于已展开可见或来源充分。历史报告相应方法定义已校准；数据原记录不伪装重测。
- **待真实验证**：实机/读屏语音/真实学习者解释与预测；未触及的光学/信号/学校数学模型，不因这13套通过而自动认证。History不可写时仅本页内降级，不保证跨重建恢复。

追踪保留修复前后：原viewport超界；UI-first原Back/衍射发现；本轮过宽替换误触独立render3的渲染回归（恢复原S3绘制，新增console错误捕获后复验）；测试选择器误用data-i18n而实际为data-i18n-html单独说明，不改写失败为通过。可选浏览器/favicon.ico404经专门定位单独记录，其他应用console/request错误仍使验收失败。

无实机手机、读屏语音、实际学习收益或全站科学/无障碍认证；只声明本报告列出的场景。没有审批/工具阻塞，不push/部署/付费/新凭据/系统设置，保护其他任务所有增量。

> 历史后续候选更新：以下法线/Snell与薄透镜审查已分别由[round11](refraction-normal-verification-20261026.md)和[round12](lens-focus-verification-20261026.md)完成。真实学习者/设备/读屏仍未验证；当前优先级见[开发索引](../../atlas/README.md)。

下一步优先真实学习者/读屏与设备试走当前连接；内容上可先审“单位圆/角度→折射与全反射”的已有课条件与法线角约定，再决定最小连接。薄透镜近焦显示容差是另一需实际审查的候选，不能先称已发现物理错误，不扩张本轮。
