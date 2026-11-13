# BRIEF — 对未来的一个赌注，怎么可能有“公道价”？ (`a-fair-price-for-a-bet`)

- **Slug**: `investment/derivatives/a-fair-price-for-a-bet`
- **Proposed Subtopic (`investment/derivatives/`)**: `衍生品与定价` / `Derivatives & Pricing`
- **Author**: `Antigravity (gemini-4-hydrogen)`
- **Queue Reference**: `specs/essay-briefs/QUEUE-DEEP2.md` §6 (Wave 2 Batch 2, deep track)
- **Status**: Drafted `index.html`, `copy.zh.js`, `models.js`, `app.js`, `REGISTRY.json`, `tests/models.cjs`, `tests/browser.cjs` (English `copy.en.js` deferred to follow-up pass; Playwright verification queued on port `19007`).

---

## One Question

> 对未来的一个赌注，怎么可能有“公道价”？——如果没人能准确预测明天涨跌，为什么一份期权却能被算到一个确定的价格，而这套复制账单又会在真实市场的哪些地方断裂？

## Chapter Ladder (12 Chapters, 11 Interactive Models)

1. **Ch1 · 远期合约的持有成本** (`forward`): 从最简单的远期承诺出发，演示如何用“借钱 + 买带分红现货”无风险复制交割义务，将远期价格钉死在 `F* = S₀·e^((r−q)T)`，与参与者的涨跌信仰无关。
2. **Ch2 · 期权弯折与看涨-看跌平价** (`payoffParity`): 交互切换 6 种策略（Call, Put, Protective Put, Covered Call, Straddle, Bull Spread），并对照组合 A（`C + PV(K)`）与组合 B（`P + PV(S)`）的刚性平价等式。
3. **Ch3 · 单步二叉树复制与风险中性定价** (`binomialOne`): 证明即便两位交易员给出的主观上涨概率 `p_real` 从 5% 差到 95%，只要两态可复制，无套利价格仍然唯一锁定在由伪概率 `p*` 给出的复制造价上。
4. **Ch4 · 多步 CRR 二叉树与美式提前行权边界** (`crrTree`): 展示 `N` 步树怎样从振荡收敛到连续 BS 解，同时点亮美式看跌期权提前行权边界与“无分红美式看涨永不提前行权”的结构性结论。
5. **Ch5 · 连续极限：几何布朗运动与均值-中位数劈叉** (`gbm`): 从对数正态随机游走演示伊藤减半项 `−½σ²` 带来的波动率拖累，以及高波动下算术均值与典型中位数路径的显著分化。
6. **Ch6 · 布莱克-斯科尔斯 PDE：μ 的消失与热传导类比** (`bsPde`): 把到期折线作为终值条件，同屏叠加闭式解析解与 100×80 Crank-Nicolson 有限差分 PDE 数值解，直观呈现时间倒流中的波动率扩散。
7. **Ch7 · 希腊字母与离散 Delta 对冲 Monte Carlo** (`greeksHedge`): 切换到交易台视角，观察 Delta/Gamma/Vega/Theta 曲线，并用可复现随机路径验证“均值无关 μ=8%”、调仓频率对离散方差的收敛效果，以及 `RV vs IV` 与交易成本对对冲分布的决定性影响。
8. **Ch8 · 理论在哪里破裂：SPX 真实偏斜、肥尾与波动率聚类** (`marketBreaks`): 用 2026-11-12 真实 SPX 35 天期权链（17 个执行价）、2016–2026 标普十年 2,511 个交易日日收益率和十年月度波动率，逐一拆穿“常数正态、无跳跃、零摩擦”假设。
9. **Ch9 · 修补模型：Heston 随机波动率** (`heston`): 用对偶控制变量现场模拟随机波动率，展示 `ξ=0`（平坦 BS）、`ρ=0`（对称微笑）和 `ρ=-0.70`（真实股指左偏恐慌溢价）的三重切换，并说明“更合身的拟合 ≠ 可完美复制”。
10. **Ch10 · 真实世界里的盾牌与绞肉机** (`usesHarms`): 一端展示实体企业套保抚平营业利润及 BIS 场外名义本金到净信用敞口的逐层压缩；另一端以 14 天虚值 Call 与买卖点差演示高换手短线买方损益结构，并完整交代三项权威实证统计。
11. **Ch11 · 机构制度与研究前沿（截至 2026-11）** (`FRONTIER`, `frontierModel`): 严格按“已确认 / 最新可观测 / 仍在争议”三层区分，并内置 **0DTE 末日 Gamma 尖峰** 与 **永续合约 8 小时资金费收敛** 实验模型。
12. **Ch12 · 五把定价尺子与延伸阅读**: 总结全篇概念，明确不提供任何投资或交易建议。

---

## Primary Data Sources & Retrieval Dates

1. **Cboe 延迟 SPX 期权链（SPX261218，35 天到期）**
   - Retrieved: `2026-11-13 00:54:32 UTC` (market snapshot `2026-11-12` close `SPX = 7,592.40`)
   - Source: `https://cdn.cboe.com/api/global/delayed_quotes/options/_SPX.json`
   - Cached raw JSON: `/tmp/agent-tasks/essays/a-fair-price-for-a-bet/SPX_opts.json`
   - Key verified figures: `6000 P` mid `7.05`, IV `38.40%`, spread `4.3%`; `7600 C` mid `148.75`, IV `14.52%`, spread `0.7%`; `9100 C` mid `0.275`, IV `19.49%`, spread `90.9%`.
2. **FRED 标普 500（`SP500`）、波动率指数（`VIXCLS`）与 `SOFR`**
   - Retrieved: `2026-11-12` (`SP500.csv`: `2016-11-14` 至 `2026-11-11`, `n = 2,511` trading days; `VIXCLS.csv` 至 `2026-11-11 = 17.49`; `SOFR.csv` 至 `2026-11-10 = 3.89%`).
   - Sources: `https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500`, `VIXCLS`, `SOFR`.
   - Key verified figures: annualized vol `18.20%`, daily SD `1.147%`, skewness `−0.69`, kurtosis `19.5` (excess `16.5`), `>4σ` days `17` vs Normal expected `0.16` (`>3σ`: `37`, `>5σ`: `11`), `acReturn1 = −0.144`, `acAbsReturn1 = +0.367`, `acAbsReturn5 = +0.333`, worst day `2020-03-16` (`−11.98%`, `−11.18σ`), 2020-03 monthly RV `92.5%` / VIX peak `82.69`, 2025-04-09 `+9.52%`.
3. **Cboe SKEW 指数历史序列 (`SKEW_History.csv`) & Black Monday (1987-10-19)**
   - Retrieved: `2026-11-12` (`2026-11-11` latest SKEW = `149.09`).
   - Source: `https://cdn.cboe.com/api/global/us_indices/daily_prices/SKEW_History.csv`
   - 1987-10-19 S&P 500 single-day drop: `−20.47%`.
4. **BIS 国际清算银行场外衍生品统计（`2025-S2` End-2025）与 2025 三年期成交调查**
   - Retrieved: `2026-11-13` via web search on `bis.org`.
   - Key figures: OTC notional `$844.6T` (`$844,578B`), gross market value `$22.8T` (`$22,802B`), close-out netting `>85%` reduction → net credit exposure `~$3.4T`, CCP initial margin `$423.5B` (cleared IRD + CDS), non-cleared dealer IM `~$1.6T`; 2025 Triennial daily turnover: exchange-traded IRD `$17.4T/day`, OTC FX `$9.6T/day`, OTC IRD `$7.9T/day`.
5. **Cboe SPX 0DTE 统计与市场机制里程碑**
   - SPX 0DTE: `59%` of total SPX volume in 2025 (`~2.3M contracts/day`), `66.2%` peak in July 2026 (Cboe Insights, retrieved `2026-11-13`).
   - LIBOR cessation: `2023-06-30` (replaced by SOFR).
   - Historical crises: LTCM (1998: `$4.6B` equity loss, `$1.25T` derivatives notional, `$3.65B` Fed-brokered rescue), AIG (2008: `$527B` CDS notional, `$180B` govt bailout → 2009 G20 CCP & margin reforms), BitMEX (2016 perpetual swap funding rate design; 2025–2026 institutional basis/ETF arbitrage convergence).
6. **学术实证与前沿文献**
   - Bryzgalova, Pavlova & Sikorskaya (2023), *Journal of Finance* ("Retail Trading in Options and the Rise of the Big Three Wholesalers"): retail option bid-ask spreads `10%–17%`.
   - de Silva, Smith & So (2022/2023), *Review of Finance* ("Losing is Optional: Retail Option Trading and Expected Announcement Volatility"): `5%–9%` average retail losses around earnings announcements (`10%–14%` on high expected volatility stocks).
   - Chague, De-Losso & Giovannetti (2020), FGV working paper ("Day Trading for a Living?"): `~97%` net loss among >300-day persistent short-term derivatives/day traders in Brazil; `0.4%` consistently beat bank teller wages.
   - Bühler, Gonon, Teichmann & Wood (2019), *Quantitative Finance* ("Deep Hedging").

---

## Tuned vs. Sourced Numbers

- **Model defaults** (e.g., `S₀=100, r=4%, q=1%, σ=20%`, 1-step binomial `u=1.20, d=0.85`, 14-day OTM call example `K=105`, airline fuel hedge base profit `200`, 0DTE normalized `S₀=100, σ=16%`, perpetual funding `25 bps` initial premium with `pull = 0.08 + 0.42*arbCap`) are **pedagogical illustrative parameters** chosen for clean inspection, never represented as market forecasts.
- **Empirical / Institutional figures** (SPX 17-strike chain, SP500 10-year distribution & monthly vol, VIX, SOFR, SKEW, BIS notional/market value/margins/turnover, Cboe 0DTE shares, and the three retail loss studies) are **sourced observations** pinned verbatim in `models.js` and `tests/models.cjs`.

## Facts That Will Go Stale

- `SPX = 7,592.40` (`2026-11-12`), `VIX = 17.49` & `SKEW = 149.09` (`2026-11-11`), `SOFR = 3.89%` (`2026-11-10`), `SPX261218` option chain snapshot.
- BIS OTC Statistics (`2025-S2`) & 2025 Triennial Survey turnover figures.
- Cboe SPX 0DTE volume share (`59%` 2025 / `66.2%` Jul 2026).

---

## Checked / Not Checked

- **Checked (verified in Node)**:
  - `node investment/derivatives/a-fair-price-for-a-bet/tests/models.cjs`: put-call parity (`< 1e-10`), CRR → BS convergence (`< 0.02` at 128 steps, `< 0.01` at 256 steps), American put ≥ European put, American call (`q=0`) = European call, Crank-Nicolson PDE vs BS closed form (`< 0.03`), all 5 Black-Scholes Greeks vs central numerical finite differences, high-trial seeded delta-hedging (`nPaths=3000`: mean ≈ 0, std shrinks `steps 13 > 63 > 252`, `RV > IV` negative mean, `RV < IV` positive mean), Heston smile (`ξ=0` flat vs `ρ=-0.70` skewed), zero CJK outside `copy.zh.js`, 100% i18n key parity, and all prose numbers matching `models.js`.
- **Not Checked Yet (queued for serial Playwright lock)**:
  - `tests/browser.cjs` on port `19007` and `node tests/canvas-text-overlap.cjs --sweep investment/derivatives/a-fair-price-for-a-bet/` at `1280 / 390 / 320` px.
  - English translation `copy.en.js` (excluded per Wave 2 authoring pass instructions).
