# BRIEF：质量守恒（mass-conservation）· 初中化学

## 定位
- slug `mass-conservation`，category `chemistry`（已注册），stage `junior`。受众：初中生 + 家长。
- 核心直觉一句话：**化学反应里原子一个不多、一个不少，只是重新排队——所以反应前后总质量相等；看起来「变轻/变重」时，必有气体跑走或进来。**
- 前置：particles-states（粒子）、atomic-structure（原子结构）；页面自足，第一句回收「原子」即可。
- 2D（canvas/SVG），5–6 步，双语 i18n，读数全实算。

## 模型假设与失配（必须明示）
- 用简化反应式（如 C + O₂ → CO₂、碳酸钙 + 盐酸 → ……），原子计数按方程式系数实算，不用真实摩尔质量称量固体粉末的实验误差。
- 「天平」是示意：读数=各物质质量按相对原子质量×分子数实算（相对原子质量查表：H1 C12 O16 Ca40 等，用到才列）。
- 终章设「模型边界」一句：真实实验有误差与逸散，守恒是原子层面的账，不是秤的读数永远一格不差。

## 步骤（id 0 起）
0. **先称一称**：一瓶密封的反应物放在天平上，读数 X g。唯一问题：反应之后再称，会变吗？控件：点火/开始反应按钮（动画：瓶内粒子重组）；天平读数反应前后对照。结论先不给，让学习者押注（变重/变轻/不变三选，记下选择）。
1. **拆开数原子**：把反应式两边的分子拆成原子球点阵，逐种元素数：左边 N 个、右边 N 个（计数纯函数实算并逐项列出）。控件：切换两个反应（燃烧、石灰石+酸）都数得平。结论：原子只是重排。
2. **质量从哪来**：每个原子的相对质量查表，左边总和=右边总和，与第 0 步天平读数对上账。控件：拖动分子数改系数（故意配不平时天平倾斜+计数报警，配平后回正）。结论：守恒=原子数守恒×每个原子质量不变。
3. **敞口的陷阱**：同一反应在敞口杯里做，气体逸出，天平读数下降；把逸出气体「收集气球」接上，总重立刻回来。控件：密闭/敞口开关、气球收集开关；读数=总质量−逸出气体质量（实算）。结论：看似不守恒，必有气体进出。
4. **反过来：变重之谜**：铁生锈/镁燃烧后变重——氧气从空气里加入。控件：开/关空气参与对照。结论同上，完成押注揭晓（回第 0 步的选择对账）。
5. **终章**：一句话复述 + 深链：particles-states#step（粒子一直在动）、atomic-structure#step1（质子定身份）、chemical-equilibrium 预告（planned 可不链）、reaction-rates（同批，若已注册则链）。模型边界一句。

## 纯函数与实算红线
- 原子计数、总质量、天平倾斜角、逸出量全部由状态纯函数算，禁止写死读数；配平判定由计数比较得出。
- 元素/相对原子质量为查表数据源，与判定逻辑分离。

## 技术与自检
- 沿用站内页面骨架（index.html/style.css/app.js/i18n.js 四件套，参照 atomic-structure 页），深色主题、双语切换、390px 无溢出、console 零错误。
- 构建方自检：node --check 全过；自写探针断言计数与守恒在至少 3 组参数下成立；build-report.md 写进页面目录（注册时剔除）。

## 注册建议（Alberto 执行）
- title zh「质量守恒 · 原子一个都不丢」/ en "Mass Conservation · Not a Single Atom Lost"；tags：原子重排 / Atom Rearrangement、配平 / Balancing、气体逸出 / Escaping Gas；category chemistry，stage junior。
- CONCEPT-MAP 拟行：#step1 原子重排计数、#step3 敞口逸出。

## Codex teaching bridge — 2026-10-28

Step 3 now sequences the open-system experiment in a bilingual hint: open the cup to see the
CO₂ leave and the reading fall, then attach the collection balloon to return that same gas and
restore the reading. The conservation model and controls remain unchanged.

## Codex oxygen-entry bridge — 2026-10-28

Step 4 now sequences the air toggle from off to on so learners see incoming oxygen as the cause
of solid mass gain, then include that oxygen in the whole-system ledger.

## Codex atom-ledger bridge — 2026-10-28

Step 1 now sequences formula reading before element counting, making the rearrangement versus
conservation distinction explicit.

## Codex coefficient bridge — 2026-10-28

Step 2 now frames an intentionally changed coefficient as a diagnostic: atom counts and the
balance warn together, then both recover when the equation is balanced.

## Codex boundary summary bridge — 2026-10-28

The final step now gives one boundary question for explaining apparent mass changes: what gas left,
or what entered from air?
