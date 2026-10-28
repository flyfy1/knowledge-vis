# BRIEF：化学平衡（chemical-equilibrium）· 高中化学

## 定位
- slug `chemical-equilibrium`，category `chemistry`，stage `senior`。受众：高中生 + 自学者。
- 核心直觉一句话：**平衡不是反应停了，是正、逆两个方向跑得一样快——人数不再变，但每个人都还在跑。**
- 前置：reaction-rates（同批，碰撞与速率）；页面自足，一句回收「速率」即可。
- 2D 粒子模拟，5–6 步，双语，全部计数实算。

## 模型假设与失配（必须明示）
- 用简化可逆反应 A ⇌ B（或 2A ⇌ B₂ 任选其一并在页面写明）+ 概率化粒子模拟：每帧每个 A 以 p正 概率变 B、B 以 p逆 概率变 A；计数曲线由模拟实测，不许预设曲线冒充。
- 温度在本页只以「同时改变 p正/p逆 且幅度不同」示意（吸热方向更敏感），终章明示这是定性示意、非阿伦尼乌斯定量。
- 催化剂在本页口径：同时同倍提高 p正/p逆 → 到达平衡更快、平衡点不变（与 reaction-rates 互链）。

## 步骤（id 0 起）
0. **人数不变 ≠ 没人动**：开场模拟已处平衡态，计数平直但粒子仍在互变（互变事件闪烁计数在涨）。唯一问题：曲线平了，反应停了吗？押注后揭晓事件计数。结论：动态平衡。
1. **从零开始**：纯 A 起步，正反应先快、逆反应随 B 增多加速，两条速率读数（单位时间互变数，实测滑窗统计）逐渐相等，计数曲线走平。控件：播放/暂停、速率曲线叠加开关。结论：平衡=两速率相等，不是两浓度相等（初始条件不同时平衡浓度可以不等——本步给一键换初态验证）。
2. **推一把：加料**：平衡时注入 +N 个 A，曲线短暂失衡后在新水平走平；方向判定读数（净变化方向）实算。结论：体系「抵抗」扰动但不完全抵消（勒夏特列定性）。
3. **再推一把：升温/降温**：切换温度，p正/p逆 按吸热方向更敏感的口径变，平衡向吸热方向移；降温反之。对照表读数（平衡时 B 占比，模拟实测均值）。结论：温度改的是平衡点本身。
4. **催化剂对照**：同初态两路并行（有/无催化剂），到达走平的时间差实测，终点计数一致。结论：催化剂只改快慢，不改终点。
5. **终章**：复述 + 深链 reaction-rates#step（速率从哪来）、mass-conservation#step1（原子守恒底账）；模型边界一句。

## 纯函数与实算红线
- 模拟随机源可种子化以便自检复现；速率统计、平衡判定（滑窗斜率阈值）、终点占比全由模拟数据算，禁止目标曲线拟合冒充模拟。
- 概率参数集中常量并在 build-report 中列明。

## 技术与自检
- 四件套骨架（参照同批 mass-conservation 的 idiom：pages.config.js 徽标、knowledge-lang、langchange）；粒子数上限保证性能（≤240 粒子）；390px 无溢出、console 零错误、node --check 过；探针以固定种子断言：两速率终值差 <10%、加料后回到走平、催化剂终点占比差 <3 个百分点。build-report.md 入页面目录。纯函数经 window.CHEMICAL_EQUILIBRIUM 暴露供探针调用。
- 构建者只写本页目录，不碰注册文件与 leetcode/；提交只 add 本页目录，Built-By 写 Codex 与精确模型。

## 注册建议（Alberto 执行）
- title zh「化学平衡 · 人数不变，人还在跑」/ en "Chemical Equilibrium · Still Moving at Balance"；tags：动态平衡 / Dynamic Equilibrium、勒夏特列 / Le Chatelier、速率相等 / Equal Rates；category chemistry，stage senior。
- CONCEPT-MAP 拟行：#step1 平衡=速率相等、#step2 勒夏特列移动。

## Codex teaching bridge — 2026-10-28

Step 1 now states the observed sequence before the simulation: pure A gives forward events first,
B accumulation lets reverse events catch up, and only then do the headcounts flatten. This
connects the playback controls to the equal-rates conclusion without changing the seeded model.

## Codex disturbance bridge — 2026-10-28

Step 2 now previews the response sequence: settle first, add A, watch forward events briefly lead,
then see reverse events catch up before the new level flattens. The seeded disturbance model is unchanged.

## Codex temperature bridge — 2026-10-28

Step 3 now directs the comparison from baseline to warm/cool conditions and names the measured
quantity: the final B share shows the balance point moving, while speed is a separate question.
