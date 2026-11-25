# BRIEF · economics/macro/why-recessions-happen（经济为什么会突然少生产一截）

- Author: Claude Code (claude-opus-5-5, thinking: on, effort unavailable), 2026-11-25. Brief: `specs/essay-briefs/TASK-econ-series.md` §3.11 N3.
- Review: none yet (independent review pending).
- One question: 工厂、工人和技术都还在，订单为什么会一起消失，又为什么过一两年自己回来？

## Chapters and models

| # | Chapter | Model (models.js) | Source |
|---|---|---|---|
| 1 | 节约悖论 | `thrift`: Y_t = C0 + c·Y_{t−1} + I0 + b·Y_{t−1}; C0 = 10, c 0.8 → 0.75; b = 0 (I0 = 10) or b = 0.05 (I0 = 5). Goes past scarcity-moves #c8: first-period transient and induced investment. Limit: rates fixed (stated). | Keynes 1936; textbook income–expenditure model |
| 2 | 加速数 | `accelerator`: I_t = δ·v·s_{t−1} + v·Δs; v = 2, δ = 0.1, growth 10% → g2 | Clark (1917) |
| 3 | 乘数–加速数 | `samuelsonRoots/Region/Path`: Y_t = c(1+v)Y_{t−1} − cvY_{t−2} + G (+ seeded shocks). Stable iff cv < 1 (for 0<c<1, since p(1) = 1 − c > 0); complex iff c < 4v/(1+v)². | Samuelson (1939) REStat; Frisch (1933) |
| 4 | 库存与牛鞭 | `bullwhip`: 3 stages, O = max(0, F + [(kF − S) + w((L−1)F − P)]/T), exponential forecast α, delivery lag L = 2, backlog allowed | Metzler (1941); Forrester (1961); Sterman (1989) |
| 5 | 四类冲击 | no model (diagram of NBER dates) | NBER chronology |
| 6 | 资产负债表衰退 | `deleverage`: R = φ·max(0, D − mH); C = C0 + cY_{t−1} − R; G = G0 + γR. Closed form: total loss = excess × (1−γ)/(1−c), independent of φ. | Koo (2003); Eggertsson & Krugman (2012) QJE; Mian, Rao & Sufi (2013) QJE |
| 7 | 自动稳定器与时滞 | `stabiliser`: C = c(1−τ)Y_{t−1}, I = v·ΔC, A drops 2 for 8 quarters, P = −k(Y_{t−L} − Y*). Static multiplier 1/(1−c(1−τ)). | textbook; Friedman (lags); Dolls, Fuest & Peichl (2012) |
| 8 | 领先指标 | `classifier` (Bayes PPV); `sahmRates` from how-an-economy-is-measured #ch7 (9/9 hits, 2 false, 1960–2026 → 66 years). Lead preset h = 0.8, f = 0.15 is hypothetical and labelled so. | Granger (1966) Econometrica 34(1) |
| 9 | 前沿 | data bar chart of NBER cycles (`FACTS.nber`, `nberExpansionBefore`) | see below |
| 10 | 五个问题 | — | — |

Diagrams (8): dg-flow, dg-acc, dg-plane (curves computed from the formulas), dg-chain (numbers = ch4 defaults, pinned), dg-shocks, dg-bs (to scale, numbers = ch6 defaults), dg-lags, dg-conf.

## Sources for real-world figures (all opened 2026-11-25)

- NBER business cycle expansions and contractions: https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions (peaks/troughs since 1945; averages 10.3 / 64.2 months for 1945–2020; table last updated 2023-03-14). Latest peak still Feb 2020: https://www.nber.org/research/business-cycle-dating
- Rudebusch (2016), "Will the Economic Recovery Die of Old Age?", FRBSF Economic Letter 2016-03: https://www.frbsf.org/research-and-insights/publications/economic-letter/2016/02/will-economic-recovery-die-of-old-age (2%/month, ~23%/year at 50 months; read via search summary, not full text).
- Bloomberg Economics 100% recession probability, 2022-10-17: https://www.bloomberg.com/news/articles/2022-10-17/forecast-for-us-recession-within-year-hits-100-in-blow-to-biden (paywalled; figures confirmed via secondary reports).
- Conference Board LEI dropped its recession signal in the Feb 2024 release (first time since summer 2022): Reuters via https://www.kitco.com/news/off-the-wire/2024-02-20/leading-economic-index-no-longer-signals-us-recession-conference-board — secondary; primary press releases at conference-board.org not opened.
- BEA 2025Q1 GDP −0.5% (third estimate), later −0.6%; imports −4.66 pp: https://www.bea.gov/news/2025/gross-domestic-product-1st-quarter-2025-third-estimate-gdp-industry-and-corporate-profits (via search summary).
- NY Fed GSCPI peak ~4.3 sd end-2021 (vintages 4.21–4.31; staff report says Nov 2021): https://libertystreeteconomics.newyorkfed.org/2023/01/global-supply-chain-pressure-index-the-china-factor/ , https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr1017.pdf (not opened in full).
- Bullwhip during COVID, preprint: https://arxiv.org/abs/2506.06368 (not peer reviewed; labelled so).
- Philadelphia Fed SPF 2026:Q4, released 2026-11-16: https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/spf-q4-2026 (opened: 11.5% for Q4 2026, prev. 20.0%; 17.4% for Q1 2027). Anxious index page (32% in 2001:Q1 survey): https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/anxious-index
- An, Jalles & Loungani (2018), IMF WP/18/39: https://www.imf.org/en/publications/wp/issues/2018/03/05/how-well-do-economists-forecast-recessions-45672 (summary quote only; PDF 404).
- Dolls, Fuest & Peichl (2012) J. Public Econ. 96(3); figures 38/32 and 47/34 from NBER WP 16275 version: https://www.nber.org/papers/w16275 — journal text not checked (stated in prose).
- Mian, Rao & Sufi (2013) QJE 128(4): elasticity 0.6–0.8; auto sales >40% drop in high-debt counties (abstract-level).
- Blinder & Maccini (1991) JEP 5(1): inventory share of recession output drop — stated qualitatively only ("很大一部分") because the exact 87% figure was not verified in the original.
- Kondratiev evidence: Granger (1966); survey of spectral studies (Bieshaar & Kleinknecht 1984; Silverberg 2005) via search summaries — labelled 某方声称.

## Status at wrap-up 2026-11-25

**Done**
- zh content, all 10 chapters as briefed (ladder unchanged), 7 interactive models + 1 data chart, 8 SVG diagrams, frontier chapter with 已确立 / 已演示 / 某方声称.
- `models.js` (pure, UMD), `app.js` (i18n runtime, on-screen gated canvases, no autonomous animation), `page.css` (copied from can-a-country-go-bankrupt), `page.json` (no `status`; `languages.en = stub`; dynamicKeys declared), `REGISTRY.json`.
- `node scripts/build-pages.cjs economics/macro/why-recessions-happen` builds; `--check` on the dir: "outputs match the sources" (draft and en-stub warnings only). Label-room check passes.
- `node tests/models.cjs`: all 82 checks passed (every model number in the prose is pinned and present verbatim in content.zh.md).

**Missing**
- English: `content.en.md` is a structural stub (copy of zh); needs a Haiku translation pass per specs/site-template.md §9 (give it `--print-budgets` output).
- `tests/browser.cjs` not written; no browser render, screenshot, console-error or canvas-overlap check was run (wrap-up ordered build + model tests only). app.js passed `node --check` and every element id it uses exists in the partials, but it has never run in a browser.
- `bindings.cjs` not used: prose numbers are literal and pinned by tests/models.cjs instead.
- Sibling drafts (K what-makes-prices-rise, A can-a-country-go-bankrupt #ch8, B what-the-yield-curve-says, F why-banks-run) are named in plain text; convert to `[[…]]` links when they are live.

**Unverified**
- Several frontier facts came via search summaries or secondary reports (marked above). Dolls–Fuest–Peichl journal-version figures; Conference Board primary release; GSCPI peak month.

**Proposed concepts (REGISTRY.json, 8)**
`paradox-of-thrift` #ch1, `accelerator-principle` #ch2 (new id, not in brief list — the brief folded it into the cycle; drop it if the cap matters), `multiplier-accelerator-cycle` #ch3, `inventory-bullwhip-cycle` #ch4, `balance-sheet-recession` #ch6, `automatic-stabilisers-countercyclical-policy` #ch7, `leading-indicators-forecasting-record` #ch8, `recession-calls-2020s` #ch9 (frontier).
Alias conflict for the registrar: `spending-is-income` (scarcity-moves #c8) already owns 节俭悖论 / paradox of thrift / 经济衰退 / 衰退 / recession / why do recessions happen. I avoided those; propose moving "why do recessions happen", "经济衰退" and "paradox of thrift" to this essay (#hero / #ch1).

**Proposed edges**
`spending-is-income>paradox-of-thrift:foundation`, `paradox-of-thrift>multiplier-accelerator-cycle:foundation`, `accelerator-principle>multiplier-accelerator-cycle:foundation`, `accelerator-principle>inventory-bullwhip-cycle:connection`, `fiscal-multiplier>multiplier-accelerator-cycle:foundation` (after A is live), `poles>multiplier-accelerator-cycle:connection`, `feedback>multiplier-accelerator-cycle:connection`, `ode-phase-portraits>multiplier-accelerator-cycle:connection`, `multiplier-accelerator-cycle>automatic-stabilisers-countercyclical-policy:foundation`, `feedback>automatic-stabilisers-countercyclical-policy:connection`, `tcp-congestion-control>automatic-stabilisers-countercyclical-policy:connection`, `paradox-of-thrift>balance-sheet-recession:foundation`, `zero-lower-bound-qe>paradox-of-thrift:connection`, `loans-create-deposits>balance-sheet-recession:connection`, `deflation-debt-deflation>balance-sheet-recession:connection` (after K), `business-cycle-sahm-potential>leading-indicators-forecasting-record:foundation`, `bayes>leading-indicators-forecasting-record:foundation`, `base-rate-neglect>leading-indicators-forecasting-record:foundation`, `inversion-decomposition>leading-indicators-forecasting-record:connection` (after B), `leading-indicators-forecasting-record>recession-calls-2020s:foundation`, `aggregate-demand-supply-shocks>recession-calls-2020s:connection` (after K).
