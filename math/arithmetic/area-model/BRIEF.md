# BRIEF：乘法是面积（area-model）· 小学数学 · 第 4 波 K12 第 3 页

## 定位
- slug `area-model`，category math，stage primary。受众：小学中高年级 + 家长。继 fractions 之后本站第二个 primary 页。
- 核心直觉一句话：**乘法不是背口诀，是数一块长方形地的面积**——a×b 就是 a 行 b 列的方格总数；交换律、分配律、两位数乘法，全是这块地的切法与转法。
- 已知：学生会背九九表、会算一位数乘法，但不知道乘法「为什么」是这个数。唯一新问题：乘法的得数到底在数什么？

## 步骤（每步五必填项：已知 / 唯一问题 / 输入与求量 / 控件操作与预期观察 / 结论适用条件）
1. **点阵太多数不清**：可点选/拖动的点阵（行列各 1–12，默认 4×6）。逐个点数计数器与「行×列=总数」读数并排。
   - 操作：改行列，看总数；点「逐个点一遍」动画数完 24 个点要多久 vs 公式一眼。
   - 结论：乘法是数总数的捷径，前提是排成整齐的行列（每行一样多）。
2. **点阵变地砖（面积登场）**：点阵长成连续方格地，边长标 a、b，面积读数 S=a×b。
   - 操作：滑杆改 a/b（1–15）；按「转个方向」按钮把地旋转 90°，a、b 互换、方格一块没变。
   - 结论：a×b=b×a（交换律）不是规定，是同一块地换个方向看；面积单位是「方格」。
3. **切一刀算大数（分配律）**：13×7 的地，一条可拖动的竖切线，默认切在 10 处 → 10×7 + 3×7 两块，各自面积与总和实时读数。
   - 操作：拖切线到任意位置，总和不变；切线吸附整数刻度。
   - 结论：难算的乘法可以切成两块好算的再相加——切在哪都对，选整十最好算。
4. **两位数 × 两位数 = 四块地**：12×13，横竖各一刀（默认 10+2 / 10+3），四块面积 100、30、20、6 逐块点亮并求和 156，与竖式四步一一对应标注。
   - 操作：改被乘数/乘数（11–19），四块与总和跟随；切线位置由十位自动决定并说明为什么。
   - 结论：竖式不是仪式，每一步都在算一块地的面积。
5. **反过来：面积找边长（因数露头）+ 自测**：给面积 24，「试边长」滑杆找所有整数组合（1×24、2×12、3×8、4×6），找到一组亮一组、集齐给结论。
   - 自测 1 题（切地计算，如 14×6 切成 10×6+4×6，选项答题，答对才揭晓解析）。
   - 结论：同一面积可以有不同的长宽——这些成对的边长叫因数（术语就近解释）。

## 硬性规范（照仓库 UI-I18N-SPEC.md 与 WORKFLOW.md）
- 中英双语 #langToggle、共享键 knowledge-lang、键集与占位符完全一致；术语首现就近白话解释（面积、交换律、分配律、因数）。
- 统一页头/步骤骨架/深色主题，结构照 fractions/ 与 pythagoras/；终章互链区深链带步锚：fractions（整体与部分）、pythagoras#step2（面积数法证明）——锚点以目标页实际步号为准、自己打开核对。
- CONCEPT-MAP.md 新增一行「乘法（面积模型）」概念行，锚点指向本页讲分配律的步。
- 状态一致性组合路径（红线）：答题后改参数不得保留旧判定；切语言后各步状态（切线位置、已找到的因数组合、答题进度）不丢失不重置；滑杆与画布读数永远同一事实源（读数纯渲染）。
- 390px 宽零横向溢出；console 零错误；动画用 rAF 且静止不空转；格子数上限下渲染不卡顿（15×15 以内直接画，点阵步 12×12）。
- 本页文件：area-model/{index.html,app.js,i18n.js,style.css} + area-model/BRIEF.md（把本任务书存进去）。**不要动 pages.config.js**（注册由验收后 Alberto 执行）；不要动其他页面（CONCEPT-MAP 只加自己一行）。

## 交付
- 自查证据：node --check、键集/占位符比对输出、第 3 步总和守恒（任意切点 a×b=(a1+a2)×b 数值断言一组）、第 4 步 12×13=156 四块和断言。
- 报告写 ~/workspace/area-model-lab/build-report.md：做了什么、自查结果、截图（有无头浏览器条件则附桌面+390 各一，没有就注明未附及替代验证）。

## Codex teaching bridge — 2026-10-28

Step 2 now foregrounds the invariant while the cut moves: one block grows, the other shrinks,
but their sum remains the whole area. This connects the slider motion to the distributive-law
conclusion without changing the area calculations.

## Codex four-block bridge — 2026-10-28

Step 3 now previews the four area terms before the animation: 10×10, 10×3, 2×10 and 2×3.
The hint connects each written multiplication row to one part of the same rectangle.

## Codex factor bridge — 2026-10-28

Step 4 now explains the trial action before the slider: an exact tiling gives a factor pair,
while a final gap rules that width out. The factor model and collection logic remain unchanged.
