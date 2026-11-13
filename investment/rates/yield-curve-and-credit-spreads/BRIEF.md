# BRIEF · yield-curve-and-credit-spreads 收益率曲线和信用利差

- Built-By: Antigravity (gemini-4-hydrogen)
- Verified-By: self-check only (Node model/data/prose parity & branch test `tests/models.cjs` + `node --check`); live Playwright browser check, canvas text-overlap sweep, and screenshot inspection pending phase-wrapup queue
- category `investment`, subtopic `rates` (利率与成本 / Rates & Costs), stage `university`
- Format: long-form interactive essay with 9 chapters and 8 live mathematical models (`index.html`, `copy.zh.js`, `copy.en.js`, `models.js`, `app.js`, `REGISTRY.json`, `BRIEF.md`, `tests/models.cjs`, `tests/browser.cjs`).

## The One Question

Why does borrowing the exact same dollar cost a different interest rate over 2 years versus 30 years—and why does a company pay a steeper markup than a government?

Answer built step by step: fixed-income yields simultaneously price **time** (through no-arbitrage discounting, expectations + term premium, duration/convexity, and inflation protection) and **trust** (through expected default losses, Merton's balance-sheet option mechanics, and liquidity wedges). Chapters 1–4 focus on the sovereign term structure without duplicating central-bank operational plumbing (`why-one-rate-moves-everything`); Chapters 5–6 build reduced-form and structural credit pricing; Chapter 7 unites real yields, inflation breakevens, and corporate OAS; Chapter 8 presents the dated November 2026 frontier; Chapter 9 closes with five non-advisory questions for reading any bond headline.

## Figures of Merit (Frontier Block)

1. `10Y − 2Y` Treasury spread (`+0.24%` / `+24 bp`, FRED `T10Y2Y`, `2026-11-12`)
2. `10Y − 3M` Treasury spread (`+0.78%` / `+78 bp`, FRED `T10Y3M`, `2026-11-12`)
3. Kim–Wright 10Y term premium (`+0.87%`, FRED `THREEFYTP10`, `2026-11-06`)
4. 10Y TIPS real yield (`2.78%`, FRED `DFII10`, `2026-11-10`) & 10Y breakeven inflation (`2.24%`, FRED `T10YIE`, `2026-11-12`)
5. ICE BofA US Investment-Grade Corporate OAS (`89 bp`, FRED `BAMLC0A0CM`, `2026-11-12`)
6. ICE BofA US High-Yield Corporate OAS (`330 bp`, FRED `BAMLH0A0HYM2`, `2026-11-11`)

## Chapters (law · case · model · limits)

1. **即期利率、远期利率与无套利自举 / Spot, Forward & Bootstrapping** (`#ch1`): Annual-coupon par yields at `[1,2,3,5,7,10,20,30]` linearly interpolated and bootstrapped via `DF_n = (1 - c_n * sum DF_t)/(1 + c_n)` (Tuckman & Serrat, *Fixed Income Securities*, ch. 1–2). Every par bond reprices to `100.0000`. Controls: presets (`2026-11-10`, `2023-06-30`, `2021-12-31`, `custom`), `2Y/10Y/30Y` sliders, DF right-axis toggle. Limits: annual coupons, linear interpolation creates forward kinks at knots.
2. **预期假说与期限溢价 / Expectations + Term Premium** (`#ch2`): Campbell & Shiller (1991) continuous path `E[r_t] = r_inf + (r_0 - r_inf) * 2^(-t/h)` averaged over `[0,n]` plus linear-to-10Y term premium `TP_n = TP_10 * min(n,10)/10`. Controls: 4 regimes + `r0`, `rL`, `h`, `tp10` sliders. Limits: `TP_n` ramp shape is stylized; real TP is unobservable and model-dependent.
3. **久期与凸性 / Duration & Convexity** (`#ch3`): Fabozzi (*Bond Markets*, ch. 4) exact DCF repricing vs 1st-order tangent and 2nd-order Taylor parabola. Bridges `investment/rates/interest-rates-bonds/#step4`. Limits: parallel shifts, option-free cash flows (ignores negative convexity in callable/MBS bonds).
4. **收益率曲线倒挂 / Curve Inversion & Probit** (`#ch4`): Shipped 802-month FRED `GS10 - TB3MS` and `USREC` (1960-01 to 2026-10) + Estrella & Trubin (2006) NY Fed probit `Phi(-0.6045 - 0.7374 * S)`, plus expectations vs term-premium decomposition mode. Limits: small sample of 8–10 recessions, monthly discount-basis `TB3MS` differs slightly from NY Fed bond-equivalent `DGS3MO`, non-predictive.
5. **信用利差与违约算术 / Credit Spreads & Default Arithmetic** (`#ch5`): Recovery-of-par 1-year expected return `E[r_1] = y - p(1 - R + y)`, breakeven default `p* = s/(1 - R + y)`, and 5-year compounded wealth (Elton et al., 2001). Links `stocks-bonds`. Limits: constant independent hazard/recovery understates recession clustering and inverse default-recovery correlation.
6. **结构化信用（Merton 模型）/ Merton Structural Credit & Liquidity Wedge** (`#ch6`): Merton (1974) balance-sheet call/put (`E = Call(V,F,r,T,sigma_V)`, `D = F*e^-rT - Put`), distance to default `DD`, plus optional `+150 bp` liquidity crunch toggle. Links `investment/derivatives/a-fair-price-for-a-bet/#ch6`. Limits: single zero-coupon maturity, default only at `T`, no asset jumps or early covenants.
7. **实际利率、TIPS 与全拆解 / Real vs Nominal, TIPS & Full Decomposition** (`#ch7`): Exact Fisher identity `(1+y_nom) = (1+r_real)(1+pi_be)` + corporate OAS stack and 10-year $1,000 real purchasing-power comparison. Limits: static OAS and ignoring TIPS liquidity discounts in crunches.
8. **2026 年 11 月前沿 / November 2026 Frontier** (`#ch8`): Interactive 3-mode comparison (Treasury curve regimes + IG/HY overlay, Global 10Y sovereigns, Credit OAS vs 2020/2008 crisis peaks), Merit & Global tables, open debates, and 3-box epistemic separation.
9. **五个问题 / Five Questions** (`#ch9`): Analytical reading checklist (non-advisory).

## Sources (All opened/checked 2026-11-13)

| Fact / Series | Source & Observation Date | URL |
|---|---|---|
| US Treasury Par Curve (`DGS1,2,3,5,7,10,20,30,3MO`) | FRED CSVs, latest `2026-11-10` (plus `2023-06-30`, `2021-12-31`) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10` |
| `10Y - 2Y` (`+0.24%`) & `10Y - 3M` (`+0.78%`) | FRED `T10Y2Y` & `T10Y3M`, `2026-11-12` | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=T10Y2Y` |
| Kim–Wright 10Y Term Premium (`+0.8738%`) | FRED `THREEFYTP10`, `2026-11-06` | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=THREEFYTP10` |
| 10Y TIPS Real Yield (`2.78%`) & Breakeven (`2.24%`) | FRED `DFII10` (`2026-11-10`) & `T10YIE` (`2026-11-12`) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFII10` |
| Historical Monthly Spread & Recessions (`1960-01`..`2026-10`, 802 mo) | FRED `GS10`, `TB3MS`, `USREC` CSVs | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=GS10` |
| NY Fed Probit Baseline (`alpha = -0.6045, beta = -0.7374`) | Estrella & Trubin (2006), NY Fed Current Issues 12(5) | `https://www.newyorkfed.org/research/current_issues/ci12-5.html` |
| US IG Corporate OAS (`89 bp`, `2026-11-12`) | FRED `BAMLC0A0CM` CSV (`2026-11-12`) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLC0A0CM` |
| US High-Yield OAS (`330 bp`, `2026-11-11`) | FRED `BAMLH0A0HYM2` CSV (`2026-11-11`) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2` |
| GFC / COVID Credit OAS Peaks (`IG 656/401`, `HY 2182/1087`) | Macrotrends / TradingEconomics / GovSpending FRED mirrors (cross-checked via search `2026-11-13`) | `https://fred.stlouisfed.org/series/BAMLH0A0HYM2` |
| Moody's Default & Senior Unsecured Recovery (`IG ~0.01-0.02%`, `SG ~4-5%`, `2009 13.1%`, `Rec 40-50%`) | Moody's Default & Recovery Studies (cross-checked via search `2026-11-13`) | `https://www.moodys.com` |
| Global 10Y Yields (`UK 5.30-5.34%`, `DE 3.38-3.39%`, `JP 2.80-2.86%`, `CN 1.59-1.61%`) | TradingEconomics / Investing / ChinaMoney (search `2026-11-13`) | `https://tradingeconomics.com/bonds` |
| BIS Term Premia & Tight Spread Commentary | BIS Quarterly Review (search `2026-11-13`) | `https://www.bis.org/publ/qtrpdf/index.htm` |

## Facts That Will Go Stale

All live in `frontier` at the bottom of `models.js` (and `boot.presets.nov2026`):
- Treasury curve `2026-11-10` (`4.30%` 3M, `4.56%` 1Y, `4.73%` 2Y, `4.98%` 10Y, `5.35%` 30Y)
- Spreads `2026-11-12` (`T10Y2Y` `0.24%`, `T10Y3M` `0.78%`), Kim–Wright `TP10` `2026-11-06` (`0.87%`)
- TIPS `DFII10` `2026-11-10` (`2.78%`), Breakeven `T10YIE` `2026-11-12` (`2.24%`)
- IG OAS `2026-11-12` (`89 bp`), HY OAS `2026-11-11` (`330 bp`)
- Global 10Y mid-Nov 2026 levels (`UK 5.32%`, `DE 3.39%`, `JP 2.83%`, `CN 1.60%`)
- Monthly `HIST_SPREAD` & `REC_RANGES` ending `2026-10`

## Checked / Not Checked

- **Checked**: Direct FRED CSV downloads for all US yield, TIPS, OAS, and 1960–2026 monthly series; pure model verification in Node (`tests/models.cjs`, 2,433 checks), including par-bond exact repricing (`< 1e-12`), every prose number derived from `models.js`, 100% key/placeholder/HTML-tag/href parity across `copy.zh.js` and `copy.en.js`, zero CJK outside `copy.zh.js` + toggle, `REGISTRY.json` schema/anchor alignment, and all 24 live-sentence branches; `node --check` on all `.js`/`.cjs` files.
- **Not checked**: Live Playwright browser run (`tests/browser.cjs`, `tests/canvas-text-overlap.cjs --sweep`) and visual screenshot inspection (deferred per phase wrap-up); primary Moody's 1920–present PDF tables, 2008/2020 daily ICE BofA peak tables (due to FRED's 3-year rolling public CSV cap on ICE BofA series, cross-checked across two secondary mirrors), and non-US intraday sovereign quotes (reported as ranges in prose and source table).
