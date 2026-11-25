# BRIEF · 汇率是谁定的 / What Sets an Exchange Rate

Builder: Claude Code (claude-opus-5-5), 2026-11-25. Template essay (content.zh.md + page.json layout). Draft: page.json has
no "status"; the registrar adds it. English: `content.en.md` is a structural stub (copy of zh, `"languages": {"en": "stub"}`),
left for a Haiku translation pass.

## Structure (13 chapters, 12 labs, 9 diagrams)

| # | Chapter | Model (models.js) | Concept (REGISTRY.json) |
| --- | --- | --- | --- |
| ch1 | 汇率是一种价格 (+ three clocks: days/years/decades, deep links) | `market` FX supply/demand + BoP identity | balance-of-payments |
| ch2 | 巨无霸指数 | `bigmac` real July-2026 data, PPP-vs-market and GDP views | — (PPP owned by where-money-comes-from #ch9; B-S by how-an-economy-is-measured #ch5) |
| ch3 | 实际汇率 | `real` | — |
| ch4 | 利率平价 | `cip` | — (interest-parity-carry-trade, why-one-rate #ch9) |
| ch5 | 超调 | `over` Dornbusch perfect-foresight | exchange-rate-overshooting |
| ch6 | 套息交易 | `carry` 2000-path seeded Monte Carlo with leverage + crash | — (interest-parity-carry-trade) |
| ch7 | 不可能三角 | `tri` | trilemma-exchange-rate-regimes |
| ch8 | 用储备守固定汇率 | `peg` Krugman 1979 / Flood–Garber 1984 linear | currency-crisis-speculative-attack |
| ch9 | 外币债 | `mismatch` balance sheet | foreign-currency-debt-balance-sheet |
| ch10 | 人民币中间价 | `fixing` fix rule with κ + ±2% band | rmb-fixing-managed-float |
| ch11 | 美元为什么是美元 | `coord` logit coordination game, tipping point | reserve-currency-dollar |
| ch12 | 前沿在哪 | four-measures bar chart from FRONTIER | dollar-rmb-dedollarisation-2026 (frontier) |
| ch13 | 读懂一条汇率新闻 | table | — |

## Sources (checked 2026-11-25)

- Big Mac: The Economist, github.com/TheEconomist/big-mac-data, `output-data/big-mac-full-index.csv`, 2026-07-01 rows (54),
  repo HEAD 0d9710454755a71d7f0c03e662e580b271be456d. Raw valuations re-derived and matched to the file's USD_raw (test).
  The Economist's own CNY GDP-adjusted value is −23.784%; the page's own OLS gives −25.9% (different sample/method; stated).
- IMF COFER data brief 2026-09-30 (2026Q2): https://data.imf.org/en/news/imf%20data%20brief%20september%2030 — USD 56.70 (57.18),
  EUR 20.60, JPY 4.96, CNY 2.11 (1.98), total $13.22tn.
- Swift Global Currency Tracker June 2026, via Trade Treasury Payments:
  https://tradetreasurypayments.com/articles/usd-dominates-the-global-currency-and-trade-finance-market-swifts-global-currency-tracker-june-2026
  — payments USD 59.10, EUR 13.92, GBP 5.08, JPY 4.94, CNY 2.18 (6th); trade finance USD 82.50, EUR 7.00, CNY 5.51. Not read from Swift directly.
- BIS Triennial 2025: https://www.bis.org/statistics/rpfx25_fx.htm — $9.6tn/day (7.5 in 2022), USD 89.2 (88.4), EUR 28.9, JPY 16.8,
  GBP 10.2, CNY 8.5. CNY 2022 = 7.0% from memory of the 2022 survey (not re-fetched).
- DXY 2025 ≈ −9.4 to −9.6%, worst since 2017: Bloomberg/Fortune 2025-12-31, NPR 2026-01-04 (search results, not one primary).
- Fed 3.75–4.00% after 2026-10-28 (Sept 16 hike): federalreserve.gov monetary20261028a1.pdf (via search summary).
- BOJ 1.25% held 2026-10-30: news reports (tradingeconomics, newsquawk). PBOC 7-day 1.40%: MNI daily summary Nov 2026.
- CNY fix 2026-11-25 6.7088, strongest since 2022-07, 529 pips weaker than Reuters estimate 6.6559: 5paisa (citing Reuters) + Newsquawk.
  Spot 6.6581 on 11-25: Business Recorder headline in search (page 403, not read).
- China reserves Oct 2026 $3.4052tn: SAFE via Futunn/aggregators (SAFE page not read). 2014-06 peak $3.99tn, 2017-01 $2.998tn: from memory (SAFE series), not re-fetched.
- 2015-08-11 fix 6.1162 → 6.2298; ±2% band since 2014-03-17; CFETS basket 2015-12; CCF 2017-05; ¥… $50k individual quota since 2007: from memory, not re-fetched.
- CIPS 2025 ≈ 180.15 tn yuan: China Daily 2026 reports (via search).
- BIS Bulletin 90 (2024-08-27), yen carry ≈ ¥40tn ($250bn). USDJPY ≈161.9 (early Jul 2024) → ≈141.7 (Aug 5 intraday), Nikkei −12.4% on
  2024-08-05, BOJ hike to 0.25% on 2024-07-31: market data from memory, not re-fetched.
- BRICS New Delhi summit 2026-09-12/13 and BRICS Pay status: Al Jazeera 2026-09-16
  https://www.aljazeera.com/news/2026/9/16/what-is-brics-pay-and-can-it-rival-the-wests-swift-payments-system
- PBOC 24-month gold-buying streak to Oct 2026: BigGo Finance (search result).
- Yen REER lowest since 1970 (2024), Gopinath (2015) "4.7×", Fed standing swap lines (2013) + 2020 temporary lines (9) + FIMA,
  Eichengreen & Flandreau (2009), HK linked rate 7.75–7.85, Thai baht 25 → 50+ (1997–98), SNB floor removal 2015-01-15, China 2022
  rate divergence and RMB ~6.3 → ~7: from memory of well-known facts; not re-fetched.

## Status at wrap-up 2026-11-25

- **Done:** zh content for all 13 chapters, self-consistent cross-references after the chapter insertions; 12 labs wired in app.js;
  9 generated diagrams (tools/diagrams.cjs); REGISTRY.json with 8 concepts; bindings.cjs (97 bound numbers).
- **Passing:** `node scripts/build-pages.cjs economics/money/what-sets-an-exchange-rate` and `--check` (OK; warnings only for links to
  sibling drafts not yet live: who-pays-a-tariff, why-banks-run, what-makes-prices-rise, what-makes-a-stablecoin-stable,
  can-a-country-go-bankrupt). `tests/models.cjs`: 343/343 (every model re-derived independently; Big Mac data matched to The Economist).
- **Not verified:** the page has NOT been opened in a browser — no render/console check, no screenshot, no layout or canvas-label
  check at 390/320 px. No tests/browser.cjs written. Narrow SVG variants unchecked visually. No independent review.
- **Missing:** English translation (stub). Facts marked "from memory" above should be re-checked against primary sources by the reviewer.
- **Links to drafts** are raw `<a href>`; convert to `[[slug#chN]]` once those pages are registered.
- **Process note:** one `sed -i` was used on REGISTRY.json (subtopicName) before I re-read UPDATE 2; no other forbidden commands.

### Proposed edges

`saving-investment-current-account>balance-of-payments:foundation`,
`interest-parity-carry-trade>exchange-rate-overshooting:foundation`,
`purchasing-power-parity>exchange-rate-overshooting:foundation`,
`interest-parity-carry-trade>trilemma-exchange-rate-regimes:foundation`,
`reserves-floor-system>trilemma-exchange-rate-regimes:connection`,
`trilemma-exchange-rate-regimes>currency-crisis-speculative-attack:foundation`,
`bank-run>currency-crisis-speculative-attack:connection`,
`currency-crisis-speculative-attack>foreign-currency-debt-balance-sheet:connection`,
`public-debt-holders-currency>foreign-currency-debt-balance-sheet:foundation`,
`trilemma-exchange-rate-regimes>rmb-fixing-managed-float:application`,
`balance-of-payments>reserve-currency-dollar:foundation`,
`tariff-offsets-currency-retaliation-diversion>trilemma-exchange-rate-regimes:connection`,
plus `reserve-currency-dollar>dollar-rmb-dedollarisation-2026:application`,
`exchange-rate-overshooting>trilemma-exchange-rate-regimes:connection`,
`bank-run-diamond-dybvig>currency-crisis-speculative-attack:connection`,
`stablecoin-peg-reserves>currency-crisis-speculative-attack:connection` (currency board = reserve-backed stablecoin; I should link back).
Note: who-pays-a-tariff's concept id is `tariff-offsets-diversion-retaliation` in its REGISTRY.json, not the brief's
`tariff-offsets-currency-retaliation-diversion`.
