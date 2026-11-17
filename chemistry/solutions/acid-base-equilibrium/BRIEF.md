# BRIEF：酸碱平衡 · 拆开与结合从不停下（Claude Code 版本）

- **作者 Agent**：Claude Code（`claude-opus-5-5`），2026-11-09 从零独立编写。
- **与原版的关系**：2026-11-09 作为《酸碱平衡 · 分子在两边来回走》的平行版本写在 `variants/claude-code/acid-base-equilibrium/`（只读了原版的 `BRIEF.md` 和 `pages.config.js` 条目，没有读原版代码）。2026-11-17 按 Yangyu「多 agent 写同一篇的话，默认用更好的那个版本」的要求，对比后替换了 `chemistry/solutions/acid-base-equilibrium` 上的原版，见下方「Change 2026-11-17」。`variants/claude-code/acid-base-equilibrium/` 原样保留（冻结，作审计记录）。
- **署名标签**：本地址的标签在 `page-provenance.json` 的 `acid-base-equilibrium` 条目（Claude Code · 原创版本）；变体目录的标签仍在 `cc-acid-base-equilibrium`。
- **评审状态**：只做了自查（self-check），未经独立评审。

## 定位

- category `chemistry`，subtopic `solutions`，stage `senior`（与原版一致）。
- 受众：高中生与自学者；知道摩尔浓度 mol/L、知道 pH 是「酸度的刻度」，会解一元二次方程。
- 一句话直觉：**弱酸的拆开与重新结合一直在发生，两边每秒次数相等时拆开比例走平；Ka 是两个方向机会之比，决定停在哪里，而不是走多快。**
- 与原版的差异（设计选择）：原版以粒子往返为起点、依次调 Ka、稀释、共同离子。本版用一张固定格位的「分子账本」（每格一个分子，不跑粒子碰撞），让正逆事件计数和比例曲线一一对应；第 1 步把 α 画在对数轴上，让「pKa 每大 2、α 缩小 10 倍」变成一条直线；第 2 步把稀释讲成 Q 降到 Ka/10；第 3 步把共同离子讲成 Q 升过 Ka 后逆向计数领先；另加第 4 步「终点与快慢」两组赛跑，把 Ka（比值）与速率（倍数）彻底分开。

## 教学链（每步五项）

| 步 | 读者已知 | 唯一要回答的问题 | 输入 → 想求的量 | 控件操作与预期观察 | 结论适用条件 |
| --- | --- | --- | --- | --- | --- |
| 0 两个方向 | 酸在水里放出 H⁺ | 弱酸溶液里分子停下了吗？比例为何走平？ | 起点（全 HA / 全拆开）→ α(t)、每秒正逆事件数 | 按两种重新开始：绿线从 0 升或从 100% 降，停在同一白虚线；橙线（拆开）与青线（结合）相遇；网格闪光不停 | 教学慢放；200 个分子的随机模拟，平均值与平衡式一致（±0.01） |
| 1 酸的强弱 | 动态平衡 | 同 0.10 mol/L，为何 pH 从约 1.5 到 5 以上？ | Ka（lg Ka ∈ [−10, 1]）、五种常见酸 → α、[H⁺]、pH | 拖 Ka：α（对数轴）曲线在 pKa>3 变直线，pKa 每 +2 α 降一格、pH +1；pKa<0 时 α>90% | c = 0.10 mol/L；忽略水电离（误差 <1%） |
| 2 加水稀释 | Ka、二次方程 | 稀释 100 倍，pH 升 2 吗？ | c ∈ [3×10⁻⁵, 1] mol/L，醋酸 / HF → α、pH、近似式偏差、再稀释 10 倍的 ΔpH | 拖 c：α 沿实线升，√(Ka/c) 虚线在 α 大时偏离；pH 线斜率约为强酸一半；小测（答案：约升 1） | Ka 不变；体积变化不计 |
| 3 共同离子 | Q 与 Ka 的比较 | 加入自己的 A⁻，拆开的变多还是变少？ | s ∈ [0, 0.2] mol/L → α、pH、改动瞬间 Q/Ka | 拖 s：青线（结合）跳到橙线上方，绿线降到新白虚线；回到 0 则反向；醋酸 + 醋酸钠的 pH 链到缓冲页 | Na⁺ 为旁观离子；理想溶液 |
| 4 终点与快慢 | Ka 的定义 | Ka 大是否意味着拆得快？ | B 组快慢倍数 ×0.5…×8、B 组 Ka → 两组 α(t)、平衡值、到 90% 的时间 | 只改快慢：B 更早或更晚到同一虚线；只改 Ka：同起步、停在不同高度 | kf、kr 是教学设定；时间按 1/倍数精确缩放 |
| 5 收束 | 全部 | — | — | 五句串讲、三式、适用范围、4 条互链 | — |

## 新术语首次出现表（规则 11：每步就近解释）

| 术语 | 首次出现 | 白话口径 | 其他步就近复述 |
| --- | --- | --- | --- |
| 弱酸、HA ⇌ H⁺ + A⁻、共轭碱 | s0e | 只有一部分分子拆开；A⁻ = HA 失去 H⁺ 剩下的部分；双箭头 = 两方向都在发生 | s3e（A⁻ 来自盐） |
| 正向 / 逆向、动态平衡 | s0e | 拆开 / 重新结合；两方向每秒次数相等、总数不变 | s3e、s4e |
| 拆开比例 α | s0e | 拆开的分子数 ÷ 总数 | s1e（α = x/c）、各步图标题 |
| Ka、[ ]、pKa、pH | s1e | 平衡时 [H⁺][A⁻]/[HA]；方括号 = 平衡浓度；pKa = −lg Ka；pH = −lg[H⁺] | s2e、s4e（Ka = kf/kr） |
| 反应商 Q | s2e | 同 Ka 的式子，代入此刻浓度 | s3e 复述 |
| 奥斯特瓦尔德稀释定律 | s2e | α 小时 α ≈ √(Ka/c) | — |
| 共同离子 | s3e | 盐带来的、与弱酸共有的 A⁻ | — |
| kf、kr | s4e | 每个 HA 每秒拆开的机会；决定 H⁺ 与 A⁻ 每秒结合的机会 | — |

## 模型、模拟设定与失配

- `model.js`（浏览器与 node 共用）：`equilibrium(ka, c, s)` 解 x² + (Ka + s)x − Ka·c = 0（无相消误差的写法）；`alphaApprox`；`fullH`（含 Kw 的完整电荷平衡，二分求解，仅供测试界定误差）；`qAfterChange`；分子账本 `makeSim / stepSim / simAverage`（mulberry32 种子）；`relaxTime / odeAlpha`（确定性质量作用方程）。
- 分子账本：N 个分子代表总浓度 c；每拍 dt = 1/30 s，每个完整 HA 以 kf·dt 拆开，每个已拆开的 H⁺ 以 kr·[A⁻]·dt 结合（[A⁻] 含加入的 A⁻）。稳态满足 kf(1−α) = kr·c·α(α + s/c)，即 Ka = kf/kr。示意酸 Ka = 0.010（与 HClO₂ 的 1.1×10⁻² 相近），kf = 0.15 /s。
- 第 0、3 步各用 200 个分子，第 4 步每组 400 个；随机种子固定，不挑选。
- 模型失配（页面 s5 明说）：25 °C、理想溶液、忽略水电离（页面所有情形 [H⁺] ≥ 10⁻⁶ mol/L，测试实测最大误差约 0.12%）、不计体积变化；速率常数与时间是教学设定，真实拆合快得多。

## 数值结论与测试（`tests/core.cjs`）

- 二次方程在全部网格上满足 Q = Ka；忽略水的误差在页面所有情形 < 1%（并验证 HCN 稀到 10⁻⁵ M 时不可忽略，说明滑杆范围为何如此）。
- 第 0 步：示意酸 α ≈ 27%（约四分之一）；从全 HA、全拆开各 3 个种子的长时平均 α 与平衡式相差 ≤ 0.01，正逆事件率相等（±3%）；起步时正向或逆向占优；20 s（减弱动态的跳转）足够到平衡。
- 第 1 步：pKa ≤ 0 时 α > 90%（pKa 0 时 91.6%）；pKa ∈ [3, 8] 每 +2，α 比值在 0.09–0.115、ΔpH 在 0.95–1.06；标题所说 pH 约 1.5 与 5 以上；对数轴下限覆盖全范围。
- 第 2 步：稀释时 α 增、pH 增；每稀释 10 倍 ΔpH ∈ (0.49, 1)；Q 瞬间 = Ka/10；近似式总是偏大、α<0.1 时偏差 < 5.5%；小测 ΔpH ≈ 1.03（选项 b 最近），α 增约 10 倍。
- 第 3 步：s 越大 α 越小、pH 越高；增加 s 时 Q/Ka > 1，减少时 < 1；随机账本加共同离子后平均 α 与解析值相差 ≤ 0.01；醋酸 0.10 M pH 2.88，加等量醋酸钠 pH 4.74。
- 第 4 步：到 90% 的时间 × 倍数 = 常数；全部倍数终点相同；Ka 递增终点递增；全部组合 15 s 内到达；随机赛跑组的平均值落在平衡值上。
- 双语：键集与占位符一致、非符号键中英不同、无「左图/右图」；HTML/app 用到的键都存在；深链目标页与 `#stepN` 锚点存在；对照链接目标存在；占位注释与 page-provenance.css 存在、未引入 canvas-label-guard。

## 跨页链接（规则 12）

- 出链：s0e → `chemical-equilibrium#step0`；s1e → `ph-scale#step1`；s3e → `chemical-equilibrium#step2`，读数 → `buffer-capacity#step1`；s4e → `reaction-rates#step0`、`activation-energy#step3`；边界 → `ph-scale#step4`；终章 → `chemical-equilibrium#step2`、`buffer-capacity#step1`、`titration-curves#step2`、`ph-scale#step4`。均指向原版页面（已存在）。
- 页头对照链接 → `../../../chemistry/solutions/acid-base-equilibrium/`。
- 入链：未改动站内其他文件（任务书禁止）；如需 CONCEPT-MAP 登记由 lead 处理。

## 可访问性、动态与双语

- 原生 range / button / radio；每个 canvas 有 aria-label；数值读数在 DOM（aria-live）；图例在 DOM。
- 模拟只在所在步可见且页面未隐藏时运行；隐藏时取消 rAF。减弱动态时不自动播放：重新开始直接算 20 s 并画出完整历史，「暂停」换成「前进 5 秒」，改 s 时直接推进 15 s，赛跑直接算完 15 s，不画闪光。
- 语言存 `localStorage` 的 `knowledge-lang`，读写都包 try/catch；切换后 canvas 标题重绘。
- canvas 文字只有面板标题（独立一行，过宽时缩小字号）和坐标刻度；宽屏网格在左、两张时间图在右，窄屏上下堆叠。

## 自检记录（2026-11-09，self-check）

- `node variants/claude-code/acid-base-equilibrium/tests/core.cjs`：PASS。
- `tests/canvas-text-overlap.cjs --sweep`：PASS（1280/390/320 × 中英）。
- `shot.cjs`、`sect.cjs`（1280 zh、320 zh、390 en）与动态截图均实际查看。自查中修了：第 1 步 α 用线性轴时弱酸全挤在 0 附近（改为对数轴）；时间图超过 20 s 后曲线画出面板左边（加裁剪）；英文读数分隔符在窄屏挤成一团；第 2 步滑杆最稀端再稀释 10 倍时 [H⁺] 低于 10⁻⁶（滑杆下限改为 10⁻⁴·⁵）；预设酸按钮按下后 pKa 显示为滑杆吸附值（改为显示精确值）。

## Change 2026-11-17：成为 `chemistry/solutions/acid-base-equilibrium` 的正式版本

- **原因**：两版对比与决定写在 [specs/reviews/lesson-version-choice-20261117.md](../../../specs/reviews/lesson-version-choice-20261117.md)。
- **被替换的原版**：五步粒子版本（2026-10-29 `95552271` 建页，提交没有 `Built-By`，作者未归属；2026-10-29 Codex 加了共同离子组成图）；最后一个版本是 `5173122d`，源码只留在 git 历史里（`git show 5173122d:chemistry/solutions/acid-base-equilibrium/index.html` 等）。
- **搬过来时改了什么**：页头去掉指向本页自己的「对照另一版本」链接和 `compare` 键；页脚不再写「是《…》的平行版本」；`index.html` 加上站点导航（`site-nav.css` / `site-nav.js`）；`tests/core.cjs` 的对照链接检查改为检查本页没有指向自己的对照链接。教学内容、模型、数值结论没有改。
- **缓存键**：同一个地址上的 `app.js`、`model.js`、`style.css` 换成了另一份代码，而 Cloudflare 会把 JS 缓存 4 小时；没有缓存键的话，拿到新 `index.html` 的读者可能配上旧的 `app.js`。所以这三个文件从 2026-11-17 起带 `?v=20261117`（`i18n.js` 的键由转换后的 `page.json` `version` 生成）。以后改这三个文件要同时改键。
- **以后改这一页**：改本目录，不改 `variants/claude-code/acid-base-equilibrium/`。

## Change 2026-11-17：字符串表改成纯字符串

- **原因**：站点模板的转换器（`scripts/convert-essay.cjs`）只认值全是字符串字面量的 `{ zh: {…}, en: {…} }` 表；本页的 12 条跨页链接写成 `' + a('eq0', '…') + '`，要先跑辅助函数 `a()` 才能得到字符串，转换器读不出这张表。
- **改动**：把 12 处 `a(k, text)` 展开成它原来生成的 `<a class="xlink" href="…">text</a>`，删掉不再使用的 `a`；`LINK` 表保留并照旧导出。展开前后 `STRINGS` 用 `assert.deepStrictEqual` 比过，完全相同，页面显示不变。
- **复查**：`node tests/core.cjs`（深链检查读的就是这些 `href`）。

## Change 2026-11-17：英文第 1 步 pH 图标题去掉中文（独立评审）

- **问题**：`c1ph`（第 1 步 pH 曲线画布标题）在英文表里也是「pH · 横轴：pKa」，英文页的画布上显示中文。变体时就有，转换器把它当成已有的例外记进了 `page.json` 的 `enCjk`；DOM 的「英文页无中文」检查看不到画布文字。
- **改动**：`content.en.md` 的 `c1ph` 改为「pH · x-axis: pKa」，`page.json` 删掉 `enCjk`，`version` 升到 `20261117b`；`tests/core.cjs` 的 `NEUTRAL` 只留 `c2ph`（两种语言都是「pH」），并新增「英文字符串里没有中文」检查（改之前这一项失败）。
- **复查**：`node tests/core.cjs`；`node scripts/build-pages.cjs --all --check`。评审记录 specs/reviews/site-template-phase3c-review-20261117.md。
