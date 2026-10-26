# BRIEF：光的反射与折射（reflection-refraction）· 初中物理

## 定位
- slug `reflection-refraction`，category 口径：注册时由 Alberto 对照站内现有分类定（页面本体不写死分类），stage junior。受众：初中生 + 家长。OUTLINE 定位：光线追踪，光路自己拐弯；筷子在水里为什么「折断」。
- 核心直觉一句话：**光在同一种介质里走直线，碰到镜面按「入射角=反射角」弹回，穿进另一种介质就在界面处拐弯——拐多少，由两种介质的折射率说了算；眼睛顺着最后一段光看回去，就会被骗出虚像**。
- 已知：光沿直线传播、角度测量。唯一新问题：光路在界面处到底按什么规矩转弯？

## 步骤（每步五必填项：已知 / 唯一问题 / 输入与求量 / 控件操作与预期观察 / 结论适用条件）
1. **镜面弹射**：已知光走直线；唯一问题：光打到镜面上往哪边走？控件：光源点可拖（或角度滑杆）改入射角，镜面水平固定，法线虚线常驻，入射/反射光线实时画出、两角读数同步标在弧上；预设卡点：入射 0°（垂直入射、原路返回）与 60° 各一键直达。预期观察：怎么拖，反射角永远等于入射角；角度都从法线量起（页面须明说「不从镜面量」，并在读数旁给一句）。结论：**反射定律**：反射角 = 入射角，两角都以法线为基准。适用条件：镜面（光滑表面）。
2. **粗糙面与漫反射**：唯一问题：纸面不光滑，为什么还能看见字、却照不出人影？控件：同一束光切换镜面/粗糙面（微观锯齿面放大示意图），粗糙面画出多条微法线方向不一的反射线散开；对比按钮并排两图。预期观察：每条小光线仍遵守反射定律，只是法线方向各异、整体散开。结论：漫反射也守定律，散开是因为表面处处法线不同；镜面成像、纸面看字，分工由此来。
3. **穿水拐弯**：唯一问题：光从空气斜射进水，在界面处怎么拐？控件：上半空气下半水分界面，光源在空气中拖动改入射角（0–80°），折射光线按斯涅尔定律实算（n水=1.33，读数给到 0.1° 且标注≈口径），界面处入射/折射角同步量角；垂直入射 0° 特例一键（不偏折、但速度变了——只一句点到、不展开）。预期观察：进水时光线往法线方向靠（折射角 < 入射角）；入射越大、拐得越多。结论：**折射**：介质变、方向变；空气→水偏向法线。
4. **反过来与全反射**：唯一问题：光从水里往空气走，又会怎样？控件：光源切到水下，入射角滑杆 0–80°：折射角 > 入射角（偏离法线）；拖到临界角（≈48.8°，页面由 arcsin(1/1.33) 实算显示 ≈48.8°）时折射光线沿界面走；再大，折射光线消失、光全部反射回水里——**全反射**态须有明确视觉信号（界面上折射线消失、反射线点亮、读数明说）。预期观察：临界角是开关点。结论：水→空气偏离法线；入射角 > 临界角发生全反射；等于时单列折射90°的极限光线（光纤埋线一句：光在光纤里就是这样被关着走的）。
5. **被骗的眼睛 + 自测 + 终章**：情境：水里的鱼（或斜插的筷子示意图二选一做主视觉，另一个一句带过）：从岸上看，一条出水光线反向延长到真鱼的竖直参考线，标出**表观深度**（比实际浅，非完整虚像求解）；眼睛位置可拖，沿真鱼竖直参考线的表观深度随视角变化、且在本范围比实物浅。结论：眼睛顺着进入眼睛的光反向延长找像，折射把像抬高了——「筷子折断」是眼睛被光骗了。自测：①入射角 40° 打镜面，反射角选几度（从法线口径，选项含 50° 干扰=从镜面量的错误）；②空气→水入射 50°，折射角比 50° 大还是小（判方向，不算数值）；③水下光源入射角 60°，会发生什么（全反射，因为 > 临界角 ≈48.8°）。终章三卡（反射=等角弹回 / 折射=换介质拐弯 / 虚像=眼睛顺光找错了位置）+ 深链：lens（未上线不链）、velocity-vt 如已上线可链「光在介质里速度也会变，那是另一页的事」一句（以其上线状态为准，未上线则不链）；站内已上线的几何/角度相关页若无贴切锚点，终章可只收束不硬链（宁缺毋滥，深链纪律）。

## 新术语首现表（首现处就近一句话解释）
- 法线（第 1 步：垂直于镜面的那条假想线）、入射角/反射角（第 1 步）、漫反射（第 2 步）、折射（第 3 步）、折射率（第 3 步收口：一句「折射率n=c/v，无量纲；本模型水1.33、空气1.00」）、临界角（第 4 步）、全反射（第 4 步）、虚像（第 5 步）。

## 硬性规范（照 UI-I18N-SPEC.md 与 WORKFLOW.md）
- 双语 #langToggle / knowledge-lang、键集占位符一致；页头/骨架/深色主题照 fractions 与 pythagoras。
- 角度全部以法线为基准渲染与读数；斯涅尔计算用精确值（n=1.33），显示 ≈ 与一位小数口径全页统一；临界角由 Math.asin(1/1.33) 实算（≈48.8°），不得写死成与计算不一致的数。数值断言自查要跑：入射 30/50/80° 的折射角（空气→水）与反向（水→空气未达临界时）逐个回算核对、全反射态在 >临界角时折射线确实消失。
- 光路绘制须几何真实：光线角度由状态纯函数算出再渲染，不得用与读数脱钩的示意角度。
- 状态一致性：拖光源×切介质方向×答题、切语言×各步状态；全反射与普通折射态切换不得留残线。
- 390 宽零溢出；console 零错误；拖拽控件须有滑杆/按钮等价入口。
- 文件：reflection-refraction/{index.html,app.js,i18n.js,style.css} + BRIEF.md 副本。不要动 pages.config.js 与 CONCEPT-MAP.md，不要动其他页。

## 交付
- 自查：node --check、键集比对、斯涅尔数值断言、临界角断言、无头浏览器实测（含组合路径与 390）。
- 报告 ~/workspace/reflection-refraction-lab/build-report.md。

## Round11 current contract (2026-10-26)
Independent source/design review preceded these amendments; see specs/reviews/refraction-normal-design-20261026.md and verification for actual evidence. Original lesson structure and quiz remain; optional proof connects unit-circle sine range with Snell. S2/S3 reuse their own angles, one scalar snellDeg result drives direction/mode/formula. Valid positive indices; signed± angles; critical only n1>n2, equality is the limiting90° ray, strictly greater has no real refraction angle. Scalar has explicit invalid/null states; legacyS4 vector has machine-roundoff guard, not an angular band.

S2 question: with air1/water1.33 and a normal-relative incidence, predict0° versus oblique30°; compare same-ray readout with sinθ2=(n1/n2)sinθ1. S3 question: can sine exceed1? Predict30°/exactcritical/60°, then use original presets. Both steps define normal/index/arcsin locally, unitsdegrees/indexdimensionless. S3 keyboardarrows0.1°,continuouspointer,exactcritical preset distinct from rounded48.8°. Model assumes homogeneous nonabsorbing media/no dispersion; line colour/width does not encode power and no propagation-time animation exists. S4 is explicitly a fixed-vertical-reference apparent-depth illustration.

Reading-context recovery reuses knowledgeGeometryReading v1 lesson discriminator forS2/S3signedangle/sideonly, validates finite bounds and sign,merges unknownowner fields,debounces180ms and flushespagehide. No answer/quiz/learnerprofile or localstorage key. Other steps retain existing initialization; Historyfailure degrades to current in-memory interaction. No parameter transport to/fromtrig.
