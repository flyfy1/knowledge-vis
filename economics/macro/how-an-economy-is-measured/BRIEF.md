# BRIEF · 经济是怎样被计量的（How an Economy Is Measured）

- **Slug**: `how-an-economy-is-measured`
- **Path**: `economics/macro/how-an-economy-is-measured/`
- **Track**: Deep (`university`, bilingual `zh` + `en` reviewed)
- **Author**: Antigravity (gemini-4-hydrogen)
- **Reviewer**: Verified-By: Antigravity (gemini-4-hydrogen) — Independent review per `specs/essay-briefs/REVIEW-COMMON.md`: model math & real-data verification, bilingual `copy.zh.js`/`copy.en.js` parity & UI audit, zh+en Playwright browser/canvas sweeps (1280/390/320 + reduced motion + keyboard).
- **Date**: 2026-11-13
- **Proposed Subtopic**: `economics / macro` (`宏观经济与国民核算 / Macroeconomics & Measurement`)

## 1. The One Question
**一个经济体“好不好”，到底是怎么量出来的？**
每一项宏观统计量都不是天然物理读数，而是在**生产边界、指数权重、抽样口径、季节基准与版本修订**之间做出的规范选择。本文把 10 个核心统计机制拆成可拖动、含真实公共数据的模型，展示它们各自量到了什么、为什么会在结构变化时分叉，以及边界之外留着什么。

## 2. Figures of Merit (as of 2026-11-13)
| 经济体 | 实际 GDP 增速 | 通胀（口径与发布期） | 失业率（口径与发布期） | 生产率 / 典型修订 |
| --- | --- | --- | --- | --- |
| 美国 | 同比 +2.07% / 环比折年 +3.37%（2026Q3, BEA/FRED `GDPC1`） | CPI +4.08%（核心 +2.87%, 2026-10）；PCE +3.65%（核心 +3.12%, 2026-09） | U-3 4.1%（U-6 7.9%, LFPR 61.9%, 2026-10, BLS/FRED） | 非农小时产出 +2.06%（2026Q3, `OPHNFB`）；BEA 初值→最新平均绝对修订 1.3 pp |
| 中国 | Q3 同比 +4.5% / 前三季 +4.6%（2026Q3, NBS） | CPI +0.7%（2026-10, NBS） | 城镇调查失业率 5.2%（2026-09 / 前三季均值, NBS） | 当期月/季报未同步公布同口径高频数 |
| 欧元区 | 2026 全年预测 +1.3%（IMF WEO 2026-10） | HICP 初值 +4.0%（2026-10, Eurostat） | ILO 季调 6.5%（2026-09, Eurostat） | 同上 |
| 日本 | 2026 全年预测 +0.7%（IMF WEO 2026-10） | 东京 CPI +2.8% / 核心 +2.6%（2026-10, 总务省） | 劳动力调查 2.4%（2026-09, 总务省） | 同上 |
| 印度 | 2026 全年预测 +7.0%（IMF WEO 2026-10） | CPI +6.09%（2026-10, MoSPI） | PLFS 5.1% / LFPR 55.5%（2026Q3, MoSPI） | 同上 |
| 跨国对比补充 | 2026 IMF WEO 汇率计 GDP：美国 32.64 / 中国 21.55 / 印度 4.06 万亿美元；PPP 计：美国 32.64 / 中国 44.55 / 印度 19.19 万亿美元 | — | 美国实时预测（2026-11 中旬）：Atlanta Fed GDPNow Q4 3.4%–3.5%，NY Fed Staff Nowcast 2.9% | UN 2025 SNA 于 2025-03 通过；BLS JOLTS 回复率从 65% 左右（high 60s%）滑落至 33% 左右（low-to-mid 30s%）；2025-10 政府停摆中断 CPS 采集 |

## 3. Chapter Architecture & Quantitative Pins (Pinned in `tests/models.cjs`)
1. **Ch1 · 一笔面包钱，为什么要从三个方向算三遍** (`gdp3`): 农场→面粉厂→面包店+设备厂+进口+无偿家务。默认总销售额 205（含 85 元重复计算），三面 GDP = 120（折旧 12，NDP = 108）；小麦涨到 40 时面粉厂 VA 挤到 15、GDP 仍 120；进口 25 时 C=125、NX=−25、GDP 仍 120；外包 20 元家务面包后总消费面包不变（130）而 GDP 跳至 140。
2. **Ch2 · 名义与实际：物价指数其实是一种选择** (`indexes`): 两商品 CES 模型（算力年降 25%、服务年涨 6%、σ=1.5）。名义增长 +1.7%；第 2 年拉氏 101.1（实际 +0.6%）、帕氏 89.1、链式费雪 95.6（实际 +6.3%，贴合 CES 真实效用增速 6.1%），替代偏差 6.2 点；σ=0 时全部指数缩回 101.14（偏差 0.0）；提高进口占比拉开家庭 CPI（101.1）与本国生产平减指数（最高 112.4）。
3. **Ch3 · CPI 实战：你的菜篮子为什么和统计局不一样** (`cpi`): 默认官方总体 CPI = 2.40%、核心 CPI = 1.44%。高通勤租房族（住房 45%、能源 15%、能源冲击 +30%）核心 CPI 仍 1.44%、总体 3.66%、个人体感 6.58%（+2.92 pp）。关闭电子品质量调整（12%/yr × 13%权重）使默认 CPI 跳升 +1.56 pp 至 3.96%；去掉 OER 使默认 CPI 降至 1.92%（−0.48 pp）。历史注记 Boskin (1996) 1.10 pp/yr（0.15+0.25+0.10+0.60），Lebow & Rudd (2003) ~0.9 pp/yr。
4. **Ch4 · 增长率里的四个陷阱** (`growthTraps` + ALFRED real vintages): 常态 0.5%/q（SAAR 2.02%），第 5 季 −4.0% 冲击（SAAR −15.07%，y/y −2.55%），第 9 季正常推进却现 y/y +3.54% 低基数回声；6% 季节振幅令第 4 年 Q1 NSA 折年 −36.66%，经典 2×4 中心移动平均恢复至 +2.42%；ALFRED 真实档案：2008Q4（−3.80% → −6.34% → −8.89% → −8.47%），2020Q2（−32.90% → −27.98%），2022Q1/Q2（2022-08 版 −1.57% / −0.93% → 2026-11 版 −1.01% / +0.56%）；BEA 平均绝对修订 0.5 / 0.6 / 1.3 pp。
5. **Ch5 · 跨国比较与分布** (`compare` + IMF WEO 2026-10): 巴拉萨–萨缪尔森效应（$A_T=0.35, A_N=0.60 \Rightarrow p_N=0.583, P=0.70$, 汇率 GDP 35.0 vs PPP 49.7 = 1.42×）；10 分位洛伦兹曲线（初始 top 10% = 35%，基尼 0.446）：人均 +20.0% 若九成增量流向顶层，中位数仅 +4.2%、基尼升至 0.498；普惠分配则中位数同涨 +20.0%、基尼不变。交叉引用 `where-money-comes-from`、`mean-median-mode`、`numbers-lie`、`scarcity-moves`。
6. **Ch6 · 劳动力市场** (`labour` + FRED 2001–2026): 基准结构（U-3 4.04%, U-6 7.92%, LFPR 61.90%, E/Pop 59.40%）。10 人退出求职令 E/Pop 维持 59.40% 不变而 U-3 假性降至 2.46%、LFPR 跌至 60.90%；24 人转非自愿兼职令 U-6 冲至 11.73% 而 U-3 不动。FRED 贝弗里奇曲线（2022-03 V 峰值 7.5%/U 3.7% → 2026-09 4.5%/4.2%）；FRED 奥肯定律 OLS（1960–2019 240 季 β=−0.36, R²=0.59；2008–2019 48 季 β=−0.64, R²=0.74；2020–2026 26 季 β=−0.85）。交叉引用 `regression-correlation` 与 `numbers-lie`。
7. **Ch7 · 经济周期：衰退、潜在产出与萨姆规则** (`cycle` + FRED/ALFRED): 1960–2026-10 月度失业率（含 2025-10 停摆缺测 `null` 空位）在 0.50 pp 阈值触发 11 次：命中全部 9 次 NBER 衰退，出现 2 次非衰退触发（2003-07 与 2024-07；`SAHMREALTIME` 在 2024-07/08 为 0.53 / 0.57 pp）。CBO 2019-11（原 2012$：2019Q4 19,064.1 → 2025Q4 21,446.3 B$）按 2017 年 GDP 平减指数 1.07944 换算成 2017$（20,578.5 → 23,150.0 B$）后对照 2026 版（20,722.8 → 23,811.2 B$），令 2026Q3 产出缺口保持 +1.70%（换算后 2019 尺子为 +4.92%）。交叉引用 `why-one-rate-moves-everything/#ch6`。
8. **Ch8 · 生产率与索洛增长核算** (`solow` + PWT/FRED 1960–2023): 1995–2005 g_Y 3.37%、原始 TFP 1.67%，扣除 PWT 人力资本（~0.50%）后纯 TFP 为 1.17%；2005–2019 g_Y 1.85%、原始 TFP 0.75%、PWT 纯 TFP 0.26%；手动调节 α 时锁定 PWT 人力资本贡献不变，使 `rawTFP − hcContrib = tfpShown` 恒成立，直观展示 TFP 对 α 设定的敏感性。
9. **Ch9 · GDP 没有量什么** (`beyond`): 简化教学边界沙盒（重建系数 0.8、环境成本 4 在文中 `ch9.limit` 明确声明，恒等式与 BEA 家庭卫星账户 ~23–26% 一致）：未付费家务 23 + 市场 GDP 100 = 全社会总服务 123；灾害 15 带来 12 重建使 GDP 升至 112，净财富 −3、扣折旧后净调整产出降至 106。
10. **Ch10 · 前沿在哪** (`frontierModel` + `FRONTIER`): 调查回复率下滑（JOLTS ~65% → ~33%）与未回复偏差的抽样 SE / Bias / RMSE 模拟器（已移除非模型滑杆 `gdpB`）、2025 SNA（2025-03）、2026-11 实时预测与五经济体对照表，并按“已确立 / 已实测 / 仍在争论”三分呈现。
11. **Ch11 · 读新闻前先问的五个问题**: 可操作核对清单与关联页面导航。

## 4. Verification Sources & Retrieval Notes (Retrieved 2026-11-13)
- **FRED / ALFRED CSVs** (cached in `/tmp/agent-tasks/essays/how-an-economy-is-measured/`):
  - `GDPC1` (current + vintages `2009-02-01`, `2009-04-01`, `2011-08-01`, `2020-08-01`, `2021-08-01`, `2022-08-01`, `2024-10-01`, `2026-11-01`), `GDPPOT` (current + vintage `2019-11-01`), `CPIAUCSL`, `CPILFESL`, `PCEPI`, `PCEPILFE`, `UNRATE`, `U6RATE`, `CIVPART`, `JTSJOR`, `USREC`, `SAHMREALTIME`, `OPHNFB`, `GDPDEF`, `RTFPNAUSA632NRUG`, `RKNANPUSA666NRUG`, `RGDPNAUSA666NRUG`, `LABSHPUSA156NRUG`, `HOANBS`.
  - BEA Revision Study: mean absolute revision of real GDP growth (0.5 / 0.6 / 1.3 pp, Advance→Second/Third/Latest) via bea.gov.
  - BEA Chained Fisher adoption: Jan 1996 (bea.gov / FRBSF).
  - Boskin Commission (1996): 1.10 pp/yr (ssa.gov / Senate Finance); Lebow & Rudd (2003, JEL): ~0.9 pp/yr.
  - BEA Household Production Satellite Account: Benjamin Bridgman et al. (~23–26% nominal GDP addition).
- **International & Policy Sources (2025–2026-11)**:
  - UN Statistical Commission: 2025 SNA adopted 4–7 March 2025 (unstats.un.org).
  - IMF World Economic Outlook (Oct 2026): US/CN/IN nominal & PPP GDP; EZ/JP/IN 2026 growth projections.
  - NBS China: Q3 2026 GDP (+4.5%, Jan–Sep +4.6%), Oct 2026 CPI (+0.7%), Sep 2026 urban unemployment (5.2%).
  - Eurostat: Oct 2026 flash HICP (+4.0%), Sep 2026 ILO unemployment (6.5%).
  - Statistics Bureau of Japan: Oct 2026 Tokyo CPI (+2.8%, core +2.6%), Sep 2026 unemployment (2.4%).
  - India MoSPI: Oct 2026 CPI (+6.09%), Q3 2026 PLFS unemployment (5.1%, LFPR 55.5%).
  - BLS survey response trends & Oct 2025 shutdown halt to CPS; Atlanta Fed GDPNow (3.4%–3.5% Q4 2026), NY Fed Staff Nowcast (2.9%); MIT/PriceStats Billion Prices Project; Adobe Digital Price Index; Brynjolfsson et al. GDP-B.

## 5. Facts That Will Go Stale
- `FRONTIER` cross-country table & `usLatest` snapshot (`2026-11-13` cutoff: Q3 2026 GDP, Oct 2026 CPI/UNRATE/HICP/Tokyo CPI, Sep 2026 PCE/Eurostat/JP unemployment, Oct 2026 IMF WEO).
- `GDPNow` / `Staff Nowcast` Q4 2026 estimates.
- BEA ALFRED `"latest"` vintages (`2008Q4`, `2020Q2`, `2022Q1/Q2`) and CBO `GDPPOT` benchmark revisions will shift on subsequent annual/comprehensive NIPA updates.

## 6. Checked / Not Checked
- **Checked (Author + Independent Reviewer `reviewer-economy`)**:
  - Node unit, parity & prose-pinning verification: `node economics/macro/how-an-economy-is-measured/tests/models.cjs` (`24 passed, 0 failed`), including `copy.zh.js` vs `copy.en.js` exact key/placeholder parity, Ch5 Lorenz monotonicity (`topShare >= 20%`), Ch7 Sahm `2025-10` `null` month & `pot19` `1.07944` rebase (`+4.92%` gap), Ch8 manual-`alpha` + HC identity, and Ch10 `surveyError`.
  - Independent math & `.say` sweep across `zh`/`en` extreme and middle control states (`/tmp/agent-tasks/essays/review-how-an-economy-is-measured/`), plus web-verified spot-checks (BEA `GDPDEF` 2017 avg 107.944 & 2023 2012$→2017$ rebase; Oct 2025 CPS shutdown; Oct 2026 IMF WEO / CPI / UNRATE; UN 2025 SNA; BEA Household Satellite Account; Boskin 1.10 pp).
  - Playwright browser test (`ESSAY_BASE_URL=http://127.0.0.1:19011 node economics/macro/how-an-economy-is-measured/tests/browser.cjs`): PASS across `zh` + `en` × `1280` / `390` / `320`px + `prefers-reduced-motion` + keyboard navigation + `>=48px` touch targets + zero CJK leaks in `en` mode (outside `中` toggle) + canvas redraw on language toggle.
  - Canvas label & overlap sweep (`CANVAS_BASE_URL=http://127.0.0.1:19011 node tests/canvas-text-overlap.cjs --sweep economics/macro/how-an-economy-is-measured/`): PASS across `1,932` canvas states (`1280/390/320 × zh/en`, 0 collisions, 0 clipped text).
  - Visual screenshot inspection across `zh` and `en` at `1280` / `390` / `320`px (`/tmp/agent-tasks/essays/review-how-an-economy-is-measured/shots/`).
- **Not Checked (outside reviewer scope / deferred to integrator)**:
  - `pages.config.js`, `page-provenance.json`, `atlas/` & `search/` registry integration, and `<details class="page-provenance">` footer block (handled by integrator; `why-one-rate-moves-everything` EN cross-link title aligned to `"Why One Interest Rate Moves the Price of Everything"`).
  - `node scripts/atlas-import-registry.cjs`: not run (`REGISTRY.json` absent in this pre-EN-batch essay directory; integrator handles catalog registration).
