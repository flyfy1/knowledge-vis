# BRIEF: 物价为什么会涨，又为什么会跌 / What Makes Prices Rise, and Fall

- Built-By: Claude Code sub-agent (claude-opus-5-5, thinking: unavailable); essay writer, econ knowledge-graph round 2026-11-25
- Verified-By: self-check only (tests/models.cjs, build-pages --check); independent review pending
- Path: economics/macro/what-makes-prices-rise/ (template essay, draft: page.json has no "status")

## The one question

整体物价往上走或往下走，到底是什么在推？Each chapter adds one rung: money and velocity → demand vs supply shocks →
Phillips curve and expectations → anchoring → wage–price conflict → fiscal side and seigniorage → debt deflation →
Japan and China → hyperinflation → frontier (2021–2026 decompositions) → five questions.

Ownership (TASK-econ-series.md §4.K): MV = PY (`quantity-theory-inflation`, where-money-comes-from #ch4), the NK
Phillips curve (`new-keynesian-model`, why-one-rate #ch7) and all measurement are linked, not re-taught and not in
`concepts`. ch1 goes past where-money #ch4 by putting FRED data into the identity (velocity 2008–14 vs 2020–23).

## Chapters, models, limits

| ch | law (short) | model / figure | limit stated in the page |
| --- | --- | --- | --- |
| 1 | money × velocity = prices × output; velocity can absorb money | FRED decomposition of M·V = P·Y over any window, with "velocity constant" counterfactual; velocity chart; dg-mv | annual averages, P = GDP deflator, V is derived, 2026 excluded |
| 2 | demand: P and Y together; supply: apart | log-linear AD/AS with adaptive pe, 4 shocks, SRAS slope, demand-policy share; dg-adas | no wages/rates/FX; shock sizes illustrative |
| 3 | Phillips curve shifts with expectations, flattened | real scatter u vs CPI 1960–2025 by era with OLS slope; π = πe − β(u−u*) + s with πe = θπ* + (1−θ)π₋₁; dg-pc | u* = 5, β = 0.5 fixed |
| 4 | expectations anchored vs loose | CPI vs Michigan 1-yr vs Cleveland Fed 10-yr, 1978–2025; reuses ch3 model (disinflation mode, sacrifice ratio) | surveys/model estimates are proxies; annual averages |
| 5 | wages chasing an energy shock prolong inflation, cannot restore real wages | conflict model after Lorenzoni–Werning (p = w + c·x, Δw = πe + χ·a·c·x₋₁); dg-sp | no unemployment term; fixed markup |
| 6 | spending vs printing; seigniorage has a ceiling | Cagan money demand + adaptive expectations, Laffer curve and monthly path | no growth, banks, currency substitution; k, α illustrative |
| 7 | deflation makes fixed debt heavier; Fisher loop | debt/income calculator b' = (b(1+i) − σ)/((1+g)(1+π)), optional Fisher feedback φ = 0.1; dg-fi | no banks; feedback strength illustrative |
| 8 | low inflation from weak demand and/or cheap supply | WB CPI chart US/JP/CN 1990–2025; reuses ch2 model (China preset); dg-cn bars pinned to NBS Oct 2026 | WB vs NBS figures differ slightly; no verdict on causes |
| 9 | hyperinflation = printing as the only tax | reuses ch6 model; dg-hy | peak figures only as orders of magnitude |
| 10 | frontier, tagged 已确立 / 已演示 / 某方声称 | lists | — |
| 11 | five questions | — | — |

Closed forms pinned in tests/models.cjs: identity in product form; AD/AS year-1 formulas and accommodation ratchet ΣU;
accelerationist +β·gap/yr and steady state π* + β·gap/θ; adaptive sacrifice = drop/β; real wage −c·X independent of a;
seigniorage max 12k/(αe) at π = 1/α (brute-force checked) and convergence to the low root; debt loop recomputed
independently; slopes recomputed by independent OLS; 41 months Oct 2022–Feb 2026; dg-cn bar widths = 5.5 × value.

## Data and sources

- FRED CSV downloads 2026-11-25 (script and raw files: /tmp/agent-tasks/econ-graph/prices/build_data.py, raw_*.csv;
  data.js is generated, do not edit): M2SL, GDP, GDPC1, BOGMBASE, CPIAUCSL, UNRATE, MICH, EXPINF10YR, CPIAUCNS, GDPA,
  GDPCA, FPCPITOTLZGJPN, FPCPITOTLZGCHN, NROU (CBO 2026 ≈ 4.39). 2025 CPI and UNRATE lack October 2025 (no BLS release
  after the shutdown): 11-month averages. EXPINF10YR 2026-11 = 2.67 (FACTS.exp10Nov26).
- NBS China: 2025 full year CPI 0.0%, PPI −2.6% (released 2026-01-09; gov.cn / stats.gov.cn); 2023 CPI 0.2 / PPI −3.0,
  2024 CPI 0.2 / PPI −2.2 (NBS annual releases, from memory of the releases, cross-checked against the 2025 release's
  comparison of −2.2 for 2024; 2023 −3.0 not re-opened). Oct 2026: CPI +0.7, core 0.8, PPI +5.7, mining +27.9, raw
  materials +11.6, processing +3.5, consumer goods −0.1 (https://www.stats.gov.cn/english/PressRelease/202611/t20261111_1965806.html,
  read 2026-11-25). PPI turned positive in March 2026 (+0.5%), ending 41 months of decline (jiemian, actionforex, SCMP
  2026-04-10 reports; not re-read at NBS).
- Brent ≈ $126.41 intraday 2026-04-30 (Euronews 2026-04-30).
- US CPI Oct 2026 4.08% / core 2.87% and the 2026 central-bank moves: taken from the live sibling pages
  how-an-economy-is-measured (data.js usLatest) and why-one-rate-moves-everything ch12; not re-verified here.
- Tariffs: FEDS Notes 2026-04-08 (core goods PCE +3.1%, core PCE +0.8%) taken from who-pays-a-tariff bindings.
- Shapiro, FRBSF Economic Letter 2022-15 (supply a little more than half, demand about a third of the 4.8 pp PCE gap;
  core 3.3 pp, ~45% each): from search snippets of the letter, page not opened.
- Jordà, Liu, Nechio, Rivera-Reyes, FRBSF EL 2022-07 (≈3 pp by end-2021): search summary of the letter.
- Bernanke & Blanchard, AEJ: Macro 17(3) 2025 / Brookings WP 2023: abstract-level findings, V/U 1.0 → 1.9.
- Alvarez et al., IMF WP/22/221, Economica 2024: 79 episodes, 22 similar (from a 2023 RBA-conference presentation and
  VoxEU column, not the final paper).
- Hyperinflation: Cagan 50%/month; Rentenmark 1 = 10^12 marks (Nov 1923); Hungary ~15 h doubling (Wikipedia, sections
  disagree 15.3/15.6 h); Zimbabwe 24.7 h doubling (Hanke & Kwok 2009 via Cato search snippet). Peak monthly rates for
  Germany were contradictory across sources and are deliberately not stated.
- Literature named from general knowledge, not re-opened: Phillips 1958, Samuelson–Solow 1960, Phelps 1967, Friedman
  1968, Fisher 1933, Cagan 1956 (α range 2–9 per month quoted as approximate), Sargent–Wallace 1981, Sargent 1982,
  Clarida–Galí–Gertler 2000, McLeay–Tenreyro 2019, Hazell et al. 2022, Benigno–Eggertsson 2023, Lorenzoni–Werning
  2023, Koo, Krugman 1998, Bernanke 2000; Fed IORB from Oct 2008; BoJ 2% target Jan 2013, QQE Apr 2013; BIS AER 2026
  (as cited on why-one-rate ch12).

## Status at wrap-up 2026-11-25

- Done: content.zh.md (11 chapters, 6 models + 3 data charts, 7 diagrams), models.js, data.js, app.js, figures,
  page.css, bindings.cjs (115 bound numbers), REGISTRY.json (7 concepts), tests/models.cjs (193/193 pass),
  `node scripts/build-pages.cjs <dir>` and `--check <dir>` pass (warnings: draft; en stub; raw links to the unregistered
  drafts can-a-country-go-bankrupt #ch4/#ch8, who-pays-a-tariff #ch9, what-the-yield-curve-says).
- English: content.en.md is a structural stub (zh text with English title/desc), `"languages": {"en": "stub"}`. Needs a
  Haiku translation pass (give it --print-budgets for diagram labels; all labels currently ≤ 45% of room).
- Not done / not verified: no browser test written or run, no screenshot, no console-error check, no canvas sweep;
  diagrams never looked at rendered (dg-adas label placement especially unchecked); no independent review.
- Links to add at registration: switch the raw links to [[slug#chN]] once the three drafts are live; `trilemma-exchange-rate-regimes`
  (must-link list) has no page yet and is not linked; the yield-curve page has no breakeven chapter yet, so ch4 links its root.
- Concepts (REGISTRY): aggregate-demand-supply-shocks #ch2, phillips-curve-slope-evidence #ch3,
  inflation-expectations-anchoring #ch4, wage-price-spiral-disinflation #ch5, deflation-debt-deflation #ch7,
  hyperinflation-seigniorage #ch9, inflation-decomposition-2021-2026 #ch10.
- Proposed edges (from TASK §4.K, all supported by links in the prose):
  quantity-theory-inflation>aggregate-demand-supply-shocks:foundation; supply-demand>aggregate-demand-supply-shocks:connection;
  business-cycle-sahm-potential>aggregate-demand-supply-shocks:foundation; new-keynesian-model>inflation-expectations-anchoring:foundation;
  new-keynesian-model>phillips-curve-slope-evidence:foundation; labour-u3-u6-beveridge-okun>phillips-curve-slope-evidence:foundation;
  inflation-expectations-anchoring>wage-price-spiral-disinflation:foundation; inflation-winners-losers>deflation-debt-deflation:foundation;
  zero-lower-bound-qe>deflation-debt-deflation:connection; quantity-theory-inflation>hyperinflation-seigniorage:foundation;
  inflation-expectations-anchoring>hyperinflation-seigniorage:foundation; plus internal
  aggregate-demand-supply-shocks>inflation-decomposition-2021-2026:foundation and phillips-curve-slope-evidence>inflation-expectations-anchoring:foundation.
