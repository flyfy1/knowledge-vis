# BRIEF — 国家会破产吗：国债、赤字与代际账单 (Can a Country Go Bankrupt?)

Built-By: Antigravity (gemini-4-hydrogen)
Date: 2026-11-13
Directory: `economics/public-finance/can-a-country-go-bankrupt/`
Stage: `university` (deep track)

## 1. One Central Question

**Why does public debt behave fundamentally differently from a household credit card—and what actually separates countries that roll over high debt for decades from those that hit sudden stops or debt snowballs?**

## 2. Chapter & Model Ladder (`#ch1`–`#ch9`)

1. **`#ch1` Flow vs. Stock & Primary Balance (`budgetAccounting`)** — Splits annual headline deficit into primary balance (`T − G_primary`) and legacy interest (`i · D`), plus GDP scaling and interest-to-revenue burden.
2. **`#ch2` Debt-Ratio Dynamics (`debtDynamics`)** — Exact law of motion `d_{t+1} = d_t (1+r)/(1+g) − pb_t`, stabilizing primary surplus `pb* = d(r−g)/(1+g)`, and 30-year convergence vs. snowballing divergence.
3. **`#ch3` Own-Currency vs. Foreign-Currency Debt (`currencyExposure`)** — Contrasts floating own-currency inflation/FX trade-offs against Eichengreen–Hausmann–Panizza "original sin" balance-sheet valuation jumps and sudden-stop reserve depletion.
4. **`#ch4` Holders, Maturity Wall & Central Bank Netting (`rolloverSchedule`)** — Weighted Average Maturity (WAM), 3-year rollover share, Gross Financing Needs (GFN), coupon repricing lag, and consolidated Treasury+Central Bank floating reserve duration.
5. **`#ch5` Fiscal Multipliers & Crowding Out (`multiplierCrowding`)** — Open-economy multiplier across slack vs. overheating and Normal vs. Zero Lower Bound (ZLB) regimes calibrated to Ramey (2019), decomposing Year-1 and Year-5 net `Δ(D/Y)`.
6. **`#ch6` Demographics & Unfunded PAYG Commitments (`demographicBudget`)** — Dependency-ratio shift (`4.2:1` to `1.7:1`) pushing pension + healthcare + debt interest against a 30% GDP tax ceiling, showing off-balance-sheet implicit shortfalls.
7. **`#ch7` Historical Deleveraging Waterfall (`historicalDecomp`)** — Five-factor accounting decomposition (`Primary + Real Growth + Real Interest + Inflation/Repression + Restructuring`) with presets for Post-WWII US (`106% → 23%`), 1990s consolidations, EM restructuring, and Custom Mixer.
8. **`#ch8` Frontier (Nov 2026) & Stress Comparator (`frontierStress`)** — Verified late-2026 comparative table and 5-year yield/growth stress simulator across US, Japan, Euro Area, China, and Emerging Markets, separating confirmed accounting facts, historical regularities, and open debates (Blanchard 2019 vs. Rogoff / CBO).
9. **`#ch9` Six-Question Headline Checklist & Cross-Links** — Practical diagnostic checklist and links to sibling pages (`why-one-rate-moves-everything`, `how-an-economy-is-measured`, `where-money-comes-from`, `interest-rates-bonds`, `compound-interest`).

## 3. Sourced Real-World Facts & URLs (Retrieved 2026-11-13)

| Fact | Value Used | Source & Retrieval URL |
|---|---|---|
| Global public debt (2026) | `~94.6%` of global GDP (tracking toward 100% by 2029) | IMF *Fiscal Monitor* (Apr/Oct 2026) — https://www.imf.org/en/Publications/FM/Issues/2026/10/05/fiscal-monitor-october-2026 |
| US general gov gross debt (2026) | `126.8%` of GDP | IMF *Fiscal Monitor* / Datamapper (2026) — https://www.imf.org/external/datamapper/datasets/FM |
| US federal debt held by public & net interest | `100.6%` (`~101%`) in 2026 → `120%` by 2036; Net interest `3.3%` GDP in 2026 → `4.6%` by 2036 | CBO *The Budget and Economic Outlook: 2026 to 2036* (Feb 2026) — https://www.cbo.gov/publication/61882 |
| Japan general gov gross debt & interest paid | `199.4%` of GDP; interest `~1.49%` of GDP | IMF *Fiscal Monitor* / Datamapper (2026) — https://www.imf.org/external/datamapper/datasets/FM |
| Euro Area gross debt & member dispersion | `88.0%` aggregate (Germany `64.6%`, France `118.5%`, Italy `137.9%`); interest `~2.2%` GDP | IMF *Fiscal Monitor* / Datamapper (2026) — https://www.imf.org/external/datamapper/datasets/FM |
| China official general gov debt & interest | `104.4%` of GDP; reported interest `~0.95%` GDP (IMF notes broader LGFV perimeter) | IMF *Fiscal Monitor* (2026) — https://www.imf.org/en/Publications/FM/Issues/2026/10/05/fiscal-monitor-october-2026 |
| Emerging markets gross debt & tax rev (2026) | `71.6%–72.3%` (`~72.0%` used); revenue `~26.6%` GDP; LIDC interest `~15%` of tax revenue | IMF *Fiscal Monitor* Table A15 / Datamapper (2026) — https://www.imf.org/external/datamapper/datasets/FM |
| OECD sovereign refinancing share & maturity wall | `~78%–80%` of gross issuance goes to refinancing; `1/3` to `45%` maturing by 2027 | OECD Global Debt Report / Sovereign Borrowing updates (2025–2026) — https://www.oecd.org/ |
| Post-WWII US deleveraging & counterfactual | `106%` (1946) → `23%` (1974); counterfactual without surpluses & pre-1951 rate caps/inflation reaches `74%` | Hall & Sargent (2011); Acalin & Ball (IMF WP, 2024) |
| Fiscal consolidation success rates | `~75%` in expansions/loose conditions vs `~50%` overall ("below-the-line" FX/contingent shocks) | IMF *World Economic Outlook* Ch. 3 (Apr 2023) — https://www.imf.org/en/Publications/WEO/Issues/2023/04/11/world-economic-outlook-april-2023 |
| Empirical fiscal multiplier bands | Normal spending multiplier `0.6–1.0`; constrained/ZLB `~1.5` | Valerie Ramey, *Journal of Economic Perspectives* (2019) |
| `r < g` fiscal cost debate | Low/zero rollover cost when safe `r < g` vs marginal-rate jumps, crowding out, risk premia | Olivier Blanchard (2019 AEA Address); Rogoff / CBO framework |

## 4. Tuned vs. Sourced Parameters in `models.js`

- **Sourced**: All Ch8 baseline debt/GDP and interest/GDP figures; OECD ~78–80% refinancing share calibration in Ch4 (`debt = 110%`, `wam = 6y`, `def = 2.5%` produces `~77%` refi share); Ch5 multiplier elasticity (`k ≈ 0.8` normal, `~1.4` ZLB); Ch7 US 1946–1974 waterfall (`106 → 23`, counterfactual `74`).
- **Stylized educational calibrations**: Ch3 import-months-to-GDP reserve rule (`2.5%` GDP per import month, assuming `~30%` imports/GDP) and `0.15` exchange-rate pass-through; Ch6 PAYG `60%` labor share and `3% + 12% * (1/supportRatio)` health profile; Ch8 stylized baseline WAM/nominal-growth estimates for comparative stress testing (`yieldShiftBps`, `growthShiftPct`).

## 5. Facts That Will Go Stale

- 2026 IMF *Fiscal Monitor* general government gross debt, revenue, and interest-to-GDP numbers for US, Japan, Euro Area, China, and Emerging Markets (`FRONTIER_COUNTRIES` and `ch8.tableRows`), and CBO 2026–2036 projections (`100.6% → 120%`, `3.3% → 4.6%`). Re-check after Spring/Fall 2027 IMF and CBO releases.
- OECD refinancing share (`78%–80%`) and share maturing by 2027.

## 6. Checked / Not Checked

- Checked: `models.js` pure-Node equation invariants, boundary limits, prose number pinning, `REGISTRY.json` schema, 100% key/placeholder/HTML-tag/href parity between `copy.zh.js` and `copy.en.js`, and zero CJK outside `copy.zh.js` (`tests/models.cjs`: 1348 checks passed). Syntax check (`node --check`) verified on `models.js`, `app.js`, `copy.zh.js`, `copy.en.js`, `tests/models.cjs`, and `tests/browser.cjs`.
- Not checked: Live Playwright browser run and `tests/canvas-text-overlap.cjs --sweep` (skipped per `#56` phase wrap-up; `tests/browser.cjs` is authored and ready for browser verification).
- Out of scope: Integration into root `pages.config.js`, `page-provenance.json`, `atlas/`, and `search/`.
