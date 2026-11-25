# BRIEF: 为什么有的国家富 / Why Some Countries Got Rich

Built 2026-11-25 by Claude Code (claude-opus-5-5), directly in the Markdown site template. Draft: no `status` in page.json;
English is a structural stub (`languages.en = "stub"`, content.en.md is a copy of the zh skeleton) awaiting a Haiku
translation pass. Subtopic `growth` (增长 / Growth) is **not yet** in `pages.config.js` KNOWLEDGE_SUBTOPICS; the
registrar must add it before registering. Not independently reviewed.

## Files
content.zh.md / content.en.md (stub), page.json, REGISTRY.json (6 concepts), bindings.cjs (126 bound numbers),
models.js, data.js (generated once from downloaded sources, see Data), app.js, page.css (copied from the
can-a-country-go-bankrupt draft), figures/ (11 labs, 9 inline-SVG diagrams, 1 equation), tests/models.cjs (318 checks),
tests/browser.cjs (in-process server, 1280 + 390, drives every lab). Generated: index.html, copy.*.js, refs.json.

## Data (data.js)
- **Maddison Project Database 2023** (Bolt & van Zanden), GDP per capita, 2011 int'l $, 13 economies 1950–2022, via
  OWID grapher CSV `gdp-per-capita-maddison-project-database` (downloaded 2026-11-25). The China series is far below
  official growth (MPD uses alternative estimates); prose says so.
- **Solar PV module price vs cumulative capacity**, OWID chart `solar-pv-prices-vs-cumulative-capacity`, constant 2025
  US$/W and MW, 1975–2025, metadata lastUpdated 2026-10-23. Spliced: Nemet 2009 (1975–2003), Farmer & Lafond 2016
  (2004–09), IRENA 2024 global index (2010–19, thin-film to 2013), IRENA 2025 mainstream (2020–). Post-2010 European
  pvXchange benchmarks. Learning rates re-derived independently in tests: 1975–2025 24.3% (R² 0.970), 1975–2003 22.9%,
  2010–2025 37.5%.
- **Penn World Table 11.0** (released 2025-10-07) via FRED fredgraph.csv: rgdpna, rnna, emp, hc, labsh, rtfpna for CHN,
  KOR, JPN (and USA for K/Y). Period averages of log growth; α = 1 − mean labsh. Residual vs PWT's own rtfpna shown side
  by side (they differ; KR 2010–23 even in sign; prose does not interpret near-zero residuals). K/Y (rnna/rgdpna, 2017
  national prices): CN 3.09 (2000) → 5.51 (2023); US 3.34 → 3.24 (hard-coded in models.js KY).
- **UN WPP 2024** via OWID `population-by-broad-age-group`: China 15–64 = 1,000.0 m peak in 2015, 982.9 m in 2023.
The generator script and downloads live in /tmp/agent-tasks/econ-graph/growth/ (not committed).

## Facts and sources (checked = read in primary or official source this session)
| Claim | Source | Checked |
|---|---|---|
| Acemoglu: 20% exposed × 23% profitable = 4.6%; 27% labour-cost saving × 0.535 = 14.4%; TFP ≤ 0.66% / 10 yr (0.064%/yr); hard tasks: 72.6% easy, 7% saving → 0.53%; GDP 0.93–1.16% | NBER WP 32487 (May 2024), text extracted from PDF | yes, primary |
| MIT summary says 0.71% | search result snippet | secondary |
| China 2025 GDP +5.0%, 1,401,879 亿元; quarters 5.4/5.2/4.8/4.5; per capita 99,665 元 / 13,953 USD; pop −339 万 | NBS 2025 statistical communiqué (2026-02-28), via search excerpts of stats.gov.cn | secondary excerpts of official page |
| China Q3 2026 +4.5% y/y, 9 months 4.6%, target 4.5–5% | news reports of NBS release 2026-10-19 (People's Daily, Al Jazeera) | secondary |
| IMF: capital formation 38.8% GDP 2025; misallocation loss 1.2%; growth drivers | IMF 2025 Article IV press release / briefing (2026-02-18, 2025-12-11) | secondary excerpt |
| World Bank WDR 2024: 34 escaped since 1990, 108 stuck end-2023, median < 1/10 US since 1970, 3i | WDR 2024 press release / main messages (2024-08-01) | secondary excerpt |
| BNEF 2025: $108/kWh (−8%), stationary $70, China $84 | BNEF press release 2025-12-09 | secondary excerpt |
| BLS Q3 2026 productivity 3.6% saar (prelim., revision 2026-12-08), 2.1% y/y | BLS release 2026-11-05 (via search) | secondary |
| Nobel 2025 Mokyr / Aghion & Howitt (2025-10-13); 2024 AJR; 2018 Romer & Nordhaus; Solow 1987 | nobelprize.org | 2025 via search; others from memory, not re-checked |
| Brynjolfsson, Li & Raymond: +14% avg, +34% novices; QJE 140(2) 2025 | NBER w31161 abstract (WP version; another page says 15%) | secondary |
| Noy & Zhang 2023 Science: −40% time, +18% quality | memory; also cited inside Acemoglu (40% saving) | partially |
| Peng et al. 2023: 55.8% faster | memory | **not checked** |
| METR 2025-07-10: 16 devs, 19% slower, expected 24%, believed 20% | METR blog via search | secondary |
| Humlum & Vestergaard: ~3% time savings, null earnings/hours | NBER w33777 / BFI summaries (search found 3%, not 2.8%) | secondary |
| Bick, Blandin & Deming (Feb 2025): 5.4% users, 1.4% all, ~1.1% productivity | St. Louis Fed, via search | secondary |
| FRED blog Aug 2026: hours saved 1.6% → 2.2% | via search | secondary |
| Brynjolfsson, Rock & Syverson 2021: TFP 15.9% higher end-2017 | AEJ:Macro abstract via search | secondary |
| Aghion & Bunel 2024: 0.07–1.24 pp/yr, median 0.68; 0.8–1.3 by analogy | FRBSF-hosted PDF via search | secondary |
| Goldman Sachs Mar 2023: +1.5 pp/yr US labour productivity, global GDP +7% | GS pages via search | secondary |
| Anthropic Nov 2025: ~80% task speed-up, +1.8%/yr labour productivity, 10-yr universal adoption, caveats | anthropic.com page (fetched) | yes; flagged as interested party (and the essay is written by Claude) |
| Bloom et al. 2020: researchers for Moore's law 18× early-1970s | memory of AER abstract | **not re-checked** |
| Young 1995 (QJE 110(3)) thesis; Krugman 1994 | NBER w4680 abstract via search; scan unreadable | thesis only, no TFP numbers used |
| Wright 1936 ~20% per doubling; Hulten 1978; Jones 1995; MRW 1992 ~2%/yr convergence | memory | not re-checked |

## Model notes
- Solow: discrete annual map in effective-worker units; `steady()` is the exact fixed point of the discrete map
  (break-even (1+n)(1+g) − 1 + δ), so half-life uses the continuous approximation ln2/((1−α)(n+g+δ)).
- ch9 GDP: (1+TFP)^(1/(1−α)) − 1 with α = 1/3 gives 1.0%, inside Acemoglu's own 0.93–1.16%.
- ch11 conversion: TFP-type estimates ÷ (1 − α) to labour productivity only when the checkbox is on; Acemoglu's 10-yr
  level is first annualised. Aghion–Bunel's "productivity growth" treated as TFP (their framework is Acemoglu's).
- J-curve toy: measured = (1 − i)(1 + pay·S/S*), true = 1 + pay·S/S*; illustrative only.

## Not done / open
- English translation (Haiku pass), independent review, canvas-text-overlap sweep (not run), registration
  (`growth` subtopic, page-provenance entry, atlas edges listed in the agent report).
- Links to the drafts can-a-country-go-bankrupt (#ch6–7 pensions) and why-a-few-firms-win (#ch8 data-feedback-loops) are
  plain text; turn them into `[[…]]` once those pages are live, and ask why-a-few-firms-win to link back to #ch7.

## Status at wrap-up 2026-11-25
- **Done:** full zh essay (12 chapters, 11 labs, 9 inline-SVG diagrams, 「前沿在哪」 with 已确立 / 已演示 / 估计·某方声称),
  real data (Maddison 2023, PWT 11.0, OWID/IRENA solar, UN WPP 2024), 126 bound numbers. `build-pages <dir>` and `--check`
  pass; tests/models.cjs 318/318; tests/browser.cjs passes (1280 + 390, no console errors, no overflow).
- **Missing:** English translation (stub), independent review, canvas-text-overlap sweep, registration (subtopic `growth`
  must be added to pages.config.js by the registrar; page-provenance entry).
- **Unverified:** rows marked secondary / not checked in the table above (notably Peng 55.8%, Bloom 18×, China 2026 Q3 via
  news reports, Brynjolfsson 14% vs 15% version difference).
- **Concepts (REGISTRY.json):** solow-steady-state-convergence (#ch3), ideas-nonrival-increasing-returns (#ch6),
  wrights-law-cost-curve (#ch7), demographics-dependency-growth (#ch8), institutions-growth-evidence (#ch8),
  ai-productivity-frontier (#ch9). TFP / growth accounting is not registered (owned by solow-growth-accounting-tfp).
- **Edges for the registrar:** solow-growth-accounting-tfp>solow-steady-state-convergence:foundation,
  ode-phase-portraits>solow-steady-state-convergence:connection, growth-from-ideas>ideas-nonrival-increasing-returns:foundation,
  solow-steady-state-convergence>ideas-nonrival-increasing-returns:foundation, exp-log>wrights-law-cost-curve:foundation,
  data-feedback-loops>wrights-law-cost-curve:connection, solow-steady-state-convergence>demographics-dependency-growth:connection,
  institutions-trust>institutions-growth-evidence:foundation, regression-correlation>institutions-growth-evidence:foundation,
  ideas-nonrival-increasing-returns>ai-productivity-frontier:application, ai-cheap-thinking>ai-productivity-frontier:connection.
