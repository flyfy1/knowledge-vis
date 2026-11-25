# BRIEF · 关税到底谁付（Who Pays a Tariff）

- **Slug**: `who-pays-a-tariff` · **Path**: `economics/trade/who-pays-a-tariff/` (new subtopic `trade`, 贸易 / Trade; not yet in pages.config.js, which the registrar adds)
- **Author**: Claude Code (claude-opus-5-5, thinking: default), essay-writer sub-agent of the econ-graph round, 2026-11-25
- **Template**: native Markdown template essay (content.zh.md + page.json with "layout"); English is a structural stub (`"languages": {"en": "stub"}`), to be translated by Haiku
- **Review**: none yet (self-check only)

## One question
**一笔关税，到底是谁付的？** Legal payer (the importer at customs) vs economic burden, then the national ledger, why countries trade, what a deficit is, what offsets a tariff, export controls, how pass-through is measured and what the 2018–2026 evidence says.

## Chapters, models, limits
| # | id | Law (short) | Model (models.js) | What the reader discovers | Limits stated |
|---|---|---|---|---|---|
| 1 | `elasticity` | elasticity = how easily a side walks away | `elastic(e, dp)` constant-elasticity demand | spending rises with price iff e < 1 (0.4 → +11.6%; 1.5 → −8.7%) | constant elasticity; short vs long run |
| 2 | `ch2` | a tariff is a wedge; buyers' share = εs/(εs+εd) | `incidence(ed, es, τ)` exact in logs; small-country limit | default 25%, εd 1.5, εs 3: buyers +16.0%, sellers −7.2%; swapping elasticities flips the split | one market, no domestic producers, instant adjustment |
| 3 | `ch3` | buyers lose, producers and treasury gain; large country has an optimal tariff paid by a larger foreign loss | `ledger(t, eX)`, `optimalTariff` (linear PE, specific tariff) | t 20, eX 10: home −43 (万元), optimum 8.4 → +48; world always negative; eX ∞ → optimum 0 | linear, one market, no input-output effects |
| 4 | `ch4` | comparative advantage; the world price splits the gains | `ricardo()` Ricardo 1817 numbers, Cobb–Douglas halves | clearing price 0.966; +7.7% / +7.9%; equal relative costs (66.7) → no gain | labour only; distribution inside a country (ADH 2016 cited) |
| 5 | `ch5` | S − I = CA; a tariff that leaves S and I alone cannot move the total | `balance`, `tariffShock` with IMF coefficient (10% real depreciation ≈ 1.2% GDP over 3 years) | 1% GDP import cut needs ≈ 8.3% real appreciation; twin deficits | identity ≠ causation; exchange rate as the only channel |
| 6 | `ch6` | currency offset, retaliation, diversion | `divert` (CES/Armington, two suppliers), `retalMatrix` (ch3 ledger mirrored) | bilateral −38% / +52%, total −10.9% = revenue; prisoner's dilemma: +48 / −88 / both −40 | two suppliers, symmetric countries |
| 7 | `ch7` | chokepoints bite short-run, blunt as substitutes arrive | `chokeAt` (elasticities rising with time constant T) | month 1 price 3.8×, controller revenue 2.6×; year 8 price 1.37×, share 80%, revenue 0.96× | toy; numbers show shape only |
| 8 | `ch8` | measure against untaxed goods; border ≠ retail pass-through | `passthru` seeded synthetic panel, OLS | naive 117% vs DiD 100%; retail slope 0.31 equals "complete" at import share 0.3 | synthetic; selection, quality, FX |
| 9 | `ch9` | frontier, dated and tagged | — | — | — |
| 10 | `ch10` | five questions | — | — | — |

Ten generated inline-SVG diagrams (`tools/diagrams.cjs`, wide + narrow variants): curves, wedge, ledger, ricardo, flows, triangle, reroute, rare (IEA shares), chips, did.

## Sources (checked 2026-11-25 unless noted)
- Amiti, Redding & Weinstein (2019) JEP 33(4): $3.2bn/month added tax cost, $1.4bn/month DWL by end-2018 — https://www.aeaweb.org/doi/10.1257/jep.33.4.187 (figures via search excerpt of the JEP/CEPR versions)
- Fajgelbaum, Goldberg, Kennedy & Khandelwal (2020) QJE 135(1): $51bn (0.27% GDP), net $7.2bn (0.04%) — https://www.nber.org/papers/w25638
- Cavallo, Gopinath, Neiman & Tang (2021) AER: Insights 3(1) — https://econpapers.repec.org/RePEc:aea:aerins:v:3:y:2021:i:1:p:19-34 (abstract only)
- Flaaen, Hortaçsu & Tintelnot (2020) AER 110(7): washers ~12%, dryers too — https://www.aeaweb.org/research/washing-machines-2018-tariffs-effect
- Acemoglu, Autor, Dorn, Hanson & Price (2016) JOLE 34(S1): 2.0–2.4 million jobs 1999–2011 — https://www.nber.org/papers/w20395
- Fajgelbaum & Khandelwal (March 2026, BPEA Spring 2026 draft): applied avg 2.4% → 9.6% (Dec 2025), 57% duty-free, 90% pass-through, welfare −0.13% to +0.10% GDP, −0.34% under full retaliation, tariffs 4.9% of 2025 federal receipts, China import share 23% (Dec 2017) → 7% (Dec 2025), SCOTUS Feb 2026 — https://www.brookings.edu/wp-content/uploads/2026/03/1_Fajgelbaum-Khandelwal_unembargoed.pdf (text extracted locally from the PDF)
- Gopinath & Neiman, NBER w34620 (via NBER Digest 2026-04): 80% (2018–19), 94% (2025); statutory 27.4% vs applied 14.1% (Sept 2025) — https://www.nber.org/digest/202604/pass-through-us-tariffs
- Minton, Ray & Somale, FEDS Notes 2026-04-08: core goods PCE +3.1%, core PCE +0.8% through Feb 2026 — https://www.federalreserve.gov/econres/notes/feds-notes/detecting-tariff-effects-on-consumer-prices-in-real-time-part-II-20260408.html
- Cavallo, Llamas & Vazquez (2026 revision): retail pass-through 24% after 7 months — https://www.pricinglab.org/files/TrackingTariffs_Cavallo_Llamas_Vazquez.pdf (via search excerpt; the PDF itself not read)
- Freund, CEPR DP21798 (2026): exporters absorbed 40–50%, preferred 47¢; dominant suppliers 50–65% — https://ideas.repec.org/p/cpr/ceprdp/21798.html
- BEA 2026-03-25: 2025 current-account deficit $1.12tn, 3.6% GDP (4.0% in 2024) — https://www.bea.gov/news/2026/us-international-transactions-and-investment-position-4th-quarter-and-year-2025 (via search excerpt)
- China customs 2026-01-14: 2025 goods surplus $1.189tn (2024: $992bn) — Reuters/AP reports, e.g. https://www.startribune.com/china-had-record-12-trillion-trade-surplus-in-2025/601563767
- IMF blog 2019-08-21 "Taming the Currency Hype": 10% depreciation ≈ 1.2% GDP trade balance over 3 years — https://www.imf.org/en/blogs/articles/2019/08/21/blog-taming-the-currency-hype (via search excerpt)
- IEA: magnet rare earths 2024: China 60% mined, 91% refined, ~95% magnets; 2026 Outlook: top refiner share 85% in 2025 — https://iea.org/reports/rare-earth-elements/executive-summary , https://www.iea.org/reports/global-critical-minerals-outlook-2026/executive-summary (via search excerpts)
- MOFCOM/GAC Announcement No. 18 of 2025 (2025-04-04), seven medium/heavy REEs — https://english.mofcom.gov.cn/Policies/AnnouncementsOrders/art/2025/art_0dd87cbee7b045bf93fabe6ab2faceee.html (via search excerpt)
- Suspension extended to 2027-01-10 (2026-11-09) — https://www.thenationalnews.com/news/us/2026/11/09/china-extends-pause-on-rare-earth-export-curbs-for-two-months/
- SCOTUS Learning Resources v. Trump, 2026-02-20, 6–3 — CRS https://www.congress.gov/crs-product/LSB11398 (via search excerpt) and the BPEA paper
- Effective rate 2.7% → peak 22.9% → 11.2% (Nov 2026): Davis Wright Tremaine 2026-11-23 citing Yale Budget Lab — https://www.dwt.com/insights/2026/11/us-tariff-policy-after-2026-midterm-elections (secondary; tagged 某方声称 in the page)
- BIS 2022-10-07 advanced computing rule — https://www.federalregister.gov/documents/2022/10/13/2022-21658 ; H200 case-by-case rule from 2026-01-15 and Nov 2026 statements: secondary sources only (tagged 某方声称)

## Checked / not checked
- Checked: every prose number is a `{=binding}` from models.js or a whitelisted literal; tests/models.cjs re-derives the models independently (175 checks pass). build-pages and `--check` pass. tests/browser.cjs (own in-process server, port 18883, closes itself): 44/44 at zh 1280/390/320 incl. diagram label checks, 48 px targets, overflow, driving each model once, reduced motion.
- Not checked: Section 122 rate (sources disagree: 10% vs 15%), so the page gives no rate for it; Yale Budget Lab original page not read; several figures come from search excerpts rather than the papers themselves (marked above). English not written. No independent review. Canvas sweep (`tests/canvas-text-overlap.cjs`) not run; only the 1280 screenshots of labs were looked at.

## Status at wrap-up 2026-11-25
- **Done (zh)**: 10 chapters, 9 labs, 10 diagrams, frontier chapter with 已确立/已演示/某方声称 tags and dated sources; REGISTRY.json concepts per the concept-ownership addendum (TASK-econ-series.md §4.C): elasticity (#elasticity) and comparative advantage (#ch4) are NOT in `concepts` (they attach to `price-elasticity` and scarcity-moves `comparative-advantage`).
- **Missing**: English (stub only; Haiku pass); `trade-winners-losers` model for #ch4 (only one paragraph + ADH citation); several "must link" targets from the addendum are not yet linked in prose (prisoners-dilemma, externalities, purchasing-power-parity, interest-parity, new-keynesian-model, regression-correlation, why-a-few-firms-win #ch1, euv/die-yield are partly linked); the one-paragraph "tariffs as inflation" link to new-keynesian-model is not written (the Fed note in #ch9 covers the fact only).
- **Known small issues**: in the ch3 lab the "需求" canvas label sits on the supply line near the top; in the wide ledger diagram the label "加税后的本国价格" touches the demand line; ch7 model's share erosion is modest (90% → 80%) with the chosen elasticities; `page.css.tmp` is a stray copy in this directory (left in place, no deletions allowed) and can be removed by the lead.
- **Proposed concepts**: tariff-incidence-pass-through (#ch2), tariff-welfare-accounting (#ch3), saving-investment-current-account (#ch5), tariff-offsets-currency-retaliation-diversion (#ch6), export-controls-chokepoints (#ch7), measuring-tariff-pass-through (#ch8), tariff-evidence-frontier-2026 (#ch9).
- **Proposed edges** (from the addendum): supply-demand>tariff-incidence-pass-through:foundation, price-elasticity>tariff-incidence-pass-through:foundation, tax-wedge-deadweight-loss>tariff-incidence-pass-through:foundation, tariff-incidence-pass-through>tariff-welfare-accounting:foundation, consumer-producer-surplus>tariff-welfare-accounting:foundation, gdp-three-ways>saving-investment-current-account:foundation, tariff-incidence-pass-through>tariff-offsets-currency-retaliation-diversion:foundation, purchasing-power-parity>tariff-offsets-currency-retaliation-diversion:connection, prisoners-dilemma>tariff-offsets-currency-retaliation-diversion:connection, tariff-welfare-accounting>export-controls-chokepoints:connection, euv-lithography>export-controls-chokepoints:connection, tariff-incidence-pass-through>measuring-tariff-pass-through:application, regression-correlation>measuring-tariff-pass-through:foundation, saving-investment-current-account>tariff-offsets-currency-retaliation-diversion:connection.
