# build-report · mass-conservation
构建：Codex（gpt-6-astra，M5 pipeline clone）写完全部四件套后，会话被模型容量错误中断（未及写报告/提交）；Alberto 收回文件收尾。
验证（Alberto）：node --check app.js/i18n.js 通过；i18n 中英 95/95 对齐；纯函数经 window.MASS_CONSERVATION 暴露（countAtoms/massOfSide/escapeMass 等），冒烟探针见评审单。
内容：6 步（密封称重押注 → 拆分子数原子（两反应）→ 配平与质量对账 → 敞口逸出+气球回收 → 生锈/镁燃烧变重 → 终章）。
待：独立评审（单轮）后注册（chemistry/junior；CONCEPT-MAP 拟 #step1/#step3）。

## Fix pass (independent review pair1)
1. 读数条不可见：`COLORS` 补上 `accent`/`accent2`/`good`（取 style.css 的 --accent/--accent2/--good），所有 `fillStyle` 现均为已定义颜色。
2. `bar()` 参数顺序：render3/render4 调用补上 `h` 参数（`bar(ctx,x,y,w,20,ratio,color,label,value)`），画布不再出现 "undefined"。
3. 第 3 步改用石灰石 + 盐酸（`REACTIONS.lime`）：密闭 173 g；敞口 173 − 44 = 129 g；接气球回到 173 g。画布画出杯内 CaCl₂/H₂O，CO₂ 在杯内、逸出或进入气球。气球开关仅在敞口时可用，切回密闭时自动清除。s3e 文案改为点名此反应。
4. 单位：新增 `unitNote`（每个系数 = 1 mol，所以记作 g），在第 0、2 步显示。
5. 第 4 步关空气：`redoxResult` 现在返回 product 0，反应后固体仍为原金属质量（224/48 g），画布不画箭头和产物，显示「无氧 → 不反应」。两根条对比「原固体 / 反应后固体」；读数给出「只称固体」与「整个系统（含进入的氧）」两笔账；新增 `rustNote`（铁锈需要水，成分为 Fe₂O₃·xH₂O）。
6. `REDOX` 删去 `base`/`oxygen` 字面量，改由 `massOfSide(reactants[0|1])` 推导；`scaleMax` 同样推导得到。
7. 第 2 步重画：每种物质一列，分子副本竖向堆叠，系数标签只写一次；新增按 `ledger.tilt` 倾斜的天平横梁（配平为绿色，否则红色），两盘标质量。系数 1..4 的 64 种组合在 560/390 宽下全部不越界、不压箭头。
8. 第 0 步：未押注时点火按钮禁用，并给出中性提示 `s0noPick`；点火后押注锁定（选项禁用）。
9. 补齐承诺的交互：第 0 步点火有粒子重组动画（纯函数 `atomLayout`/`morphAtoms`；开启 reduced-motion 时直接跳到结果）；第 4 步新增押注揭晓 `#s4-bet`（`betVerdict`）；第 2 步逐元素计数报警（⚠/✓ `countLine`），配平状态由 `counts.balanced` 判定。
SHOULD-FIX（只做安全的几项）：去掉重复标点；`linkRates` 删去「若已上线」；密闭时禁用气球；第 2 步 ± 控件只建一次，焦点不丢；各元素使用不同颜色；终章补 `boundaryTitle` 标题；删去冗余三元表达式。
自检：node --check 2/2 通过；探针 /tmp/mcfix/probe.cjs（Node + 记录型 canvas mock，zh/en × 560/390）87 PASS / 0 FAIL；headless Chrome 控制台零错误。
