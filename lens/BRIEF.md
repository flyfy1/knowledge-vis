# BRIEF：凸透镜成像（lens）· 初中物理

## 定位
- slug `lens`，stage junior（物理）。受众：初中生 + 家长。接 reflection-refraction（光在界面拐弯）之后——光穿过透镜两次拐弯，会把物「搬」成像。
- 核心直觉一句话：**蜡烛离凸透镜的远近一变，像的大小、正倒、实虚全跟着变；分水岭是两个点：一倍焦距分实虚、二倍焦距分大小——三条特殊光线就能把像画出来**。
- 已知：光沿直线传播、折射（上一页）、角度与相似（数学）。唯一新问题：物体发出的光穿过凸透镜后，为什么有时成倒立的实像、有时成正立的放大虚像？

## 步骤（每步五必填项：已知 / 唯一问题 / 输入与求量 / 控件操作与预期观察 / 结论适用条件）
1. **光穿过透镜**：已知折射；唯一问题：一束平行光穿过凸透镜会怎样？控件：左侧平行光束（3–5 条）射入可拖动的凸透镜（焦距 f 固定 60 单位起步），右侧光线汇聚穿过一点再散开，那个点就是**焦点** F；镜后 2F 点同步标出；拖透镜改变 f（焦距滑杆 40–90），焦点位置跟随。预期观察：凸透镜把平行光「收拢」到焦点；f 越短收拢越急。结论：凸透镜是会聚透镜；焦点到光心的距离叫焦距。适用条件：薄透镜近轴光线口径（页面一句点到，不展开球差）。
2. **三条特殊光线**：唯一问题：一个点发出的光有无数条，怎么只用三条就定位像？控件：物点（烛焰顶端）可拖，三条光线逐条点亮开关：①平行于主轴 → 折射后过焦点；②过光心 → 不偏折直行；③过近侧焦点 → 折射后平行。三线在像侧交于一点（像点），读数标注每条的规矩。预期观察：任意两条交点一致；第三条自动穿过同一点（页面几何须真交于一点，由透镜公式/相似关系算出，不得手画近似——像距由 1/f=1/u+1/v 实算）。结论：作图三步法靠这三条线；像点 = 光线真实交点。
3. **远近变像（核心步）**：唯一问题：蜡烛从远处一路拖近，像怎么变？控件：蜡烛沿主轴拖动（物距 u 连续，含滑杆等价入口），像实时跟随（实像画在对侧、虚像切换虚线延长在同侧）；读数表实时给：u 区间（u>2f / u=2f / f<u<2f / u=f / u<f）、像的正倒、大小（放大/等大/缩小）、实/虚、像距 v（公式实算）；区域带在轴上以颜色分段（2F、F 两点为界）且蜡烛进入不同段时读数与像同步切换；u=f 处像消失（成像在无穷远）须有明确态（光线平行射出、读数明说「像在无穷远、屏上接不到」）。预期观察：越过 2F 像由小变大、越过 F 像由实变虚跳到同侧正立放大。结论：**一倍焦距分虚实、二倍焦距分大小**。适用条件：凸透镜、实物。
4. **光屏与眼睛**：唯一问题：实像和虚像到底差在哪，为什么放大镜看到的是虚像？控件：光屏可沿轴拖动去「接」第 3 步的像——只有屏在像距处才出现清晰烛焰像（模糊程度按屏与像距差可视化，离焦越大越糊，示意口径须标明）；切换到 u<f 的放大镜情境：屏永远接不到（读数明说），改用眼睛图标从左侧看进去，视线反向延长交出正立放大虚像。预期观察：实像能落在屏上、虚像落不上但眼睛能看见。结论：实像 = 光线真交汇、能成于屏；虚像 = 反向延长线的交点、只能看不能接。
5. **自测 + 终章**：①照相机为什么是倒立缩小的像（u>2f 选区间答题）；②把蜡烛从 3f 处拖到 1.5f 处，像如何变（选「由缩小变放大、仍倒立实像」）；③投影仪/幻灯片要放哪段（f<u<2f）+ 放大镜要哪段（u<f）二连选。终章三卡（一倍分虚实 / 二倍分大小 / 三条线作图）+ 深链：reflection-refraction 光线在界面拐弯的规矩（链接到其折射步，打开核对锚点）、parabola 或 symmetry 的对称无关不硬链；照相机/眼睛的应用只收束在本页。

## 新术语首现表（首现处就近一句话解释）
- 主光轴（第 1 步：穿过光心、垂直于镜面的那条线）、光心（第 1 步）、焦点（第 1 步）、焦距（第 1 步）、物距/像距（第 3 步：u 与 v 就地标在轴上）、实像/虚像（第 3 步首现一句、第 4 步展开）。

## 硬性规范（照 UI-I18N-SPEC.md 与 WORKFLOW.md）
- 双语 #langToggle / knowledge-lang、键集占位符一致；页头/骨架/深色主题照 fractions 与 pythagoras。
- 成像几何必须由透镜公式实算：1/v = 1/f − 1/u（带符号约定：实像 v>0 在对侧；u<f 时 v<0、虚像在同侧 |v| 处），像高由带符号放大率 M=−v/u 实算；正尺寸倍率为|M|；所有读数（像距、放大率、区间判定）与画布同源于该纯函数，断言自查要跑（给 f=60：u=180→v=90、M=−0.5 缩小实像；u=120→v=120、M=−1；u=90→v=180、M=−2；u=30→v=−60、虚像同侧 60、M=+2 正立；u=60→v=∞ 特例态）。显示口径全页统一：两位小数内能精确表示的值原样；其余用6位有效数字并标≈，非零u−f不得显示成0。分类依未舍入值，不采用焦点/2f容差带。
- 三条特殊光线的像点交点须与公式像点重合（像素级自查：画内、条件良好的三线交点与 (v, M·物高) 一致并核像素误差；极近焦点、巨大且画外的像属于病态交点，不要求绝对2px，而核finite/type/公式及归一化光线残差）。
- 状态一致性：拖烛×拖屏×切换情境×答题、切语言×各步状态；虚/实像切换不得留残线；u=f 特例态进出干净。
- 390 宽零溢出；console 零错误；拖拽控件须有滑杆等价入口。
- 文件：lens/{index.html,app.js,i18n.js,style.css} + BRIEF.md 副本。不要动 pages.config.js 与 CONCEPT-MAP.md，不要动其他页。

## 交付
- 自查：node --check、键集比对、透镜公式断言组、三线交点像素断言、无头浏览器实测（含组合路径与 390）。
- 报告 ~/workspace/lens-lab/build-report.md。

## Round12 current contract
Independent design gate precedes this amendment; see specs/reviews/lens-focus-design-20261026.md. Strict unroundedu=f/2f; finite nearby images stay real/virtual even offscreen. imageOf retainsoldm=v/u only asdistance ratio for compatibility; signedmagnification isM=−v/u,imgH=MH. Exactfocus has no finiteimageheight/M. Invalid/nonrepresentablefiniteinputs returntypeinvalid,nullfields; noNaN label masqueradingas∞. AllS1/S2native controls acceptcontinuouspointervalues; S2keyboardarrows0.1unit,othercontinuouscontrols1unit; Home/Endnative. Displayroundedvalues do not decidebranches; u−f is shown. Thirdprincipalray unavailableatf and maybeoffviewelsewhere; omitratherthaninventit. At u<f nearF lies onbackwardextension,notpriorphysicalraypath. S3schematic sharp onlyp===v; noirradiance/PSF/eye-solverclaim. ReadinghistoryreusesknowledgeGeometryReading/lesson:lens forknobs/raytogglesonly,noquiztracking. No newgraphnode/page/controller.
