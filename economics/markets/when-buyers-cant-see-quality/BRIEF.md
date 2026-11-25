# BRIEF — 看不清质量的时候：柠檬市场与保险 / When Buyers Can't See Quality: Lemons and Insurance

- Built-By: Claude Code (claude-opus-5-5, thinking: unavailable); Chinese and English both written by the builder (no Haiku pass).
- Date: 2026-11-25. Template essay (content.zh.md / content.en.md, `layout: essay`), unregistered draft (no `status` in page.json; subtopic `markets` not yet registered — the registrar adds it).
- Review: pending (no independent review yet).
- Verified-By: Claude Code (claude-opus-5-5), 2026-11-25. Scope: independently re-derived all model numbers, spot-checked Akerlof's rejections, the EU AI omnibus OJ publication, the 2024 bulletin and the FICO range, and made seven prose fixes in zh and en. Record: specs/reviews/when-buyers-cant-see-quality-review-20261125.md. Not checked: the RAND 39% table and the 2021–23 bulletins.

## The one question

When one side of a trade knows more than the other, how does the market break, and what do people do to fix it?
Every chapter answers part of it: why insurance exists (1–2), how hidden information unravels a market (3–4), the
repairs — screening, signalling — and the after-contract half, moral hazard (5–7), the same logic in lending (8–9),
the frontier (10) and three questions to take away (11).

## Chapters, models, limits

| Ch | Law (short) | Model | Reader controls | What they discover | Closed form / check |
|---|---|---|---|---|---|
| 1 | Certainty is worth paying for | CRRA certainty equivalent | p, L, risk aversion | max premium 3,922 vs expected loss 2,000 at the defaults; the mark-up ratio falls as p rises | CE = u⁻¹(EU), g = 2: 1/(0.98/20 + 0.02/10) |
| 2 | Pools are predictable | none (diagram + link to `risk-pooling`) | — | — | — |
| 3 | Lemons unravel | 200 stratified cars, offer = b × mean on sale, round by round | b, worst-car value; step / play / reset | default stops at 6.03 (×10k), 101 cars, 34% of gains; lo = 0 collapses | p* = b·lo/(2 − b) |
| 4 | Death spiral; mandates vs underwriting | 1,000 people, lognormal p (median 1%, σ = 1.0, cap 0.6), bid = ch1 max premium, premium = 1.15 × mean cost of stayers | risk aversion, σ, reward/penalty, classes K | default ends at 40 people, ¥11,293; tipping between ¥1,000 (29%) and ¥1,500 (85%); K = 3 → 62%, K = 5 → 80%, top class always spirals | fixed point checked in tests |
| 5 | Deductible menu screens types | Rothschild–Stiglitz, two types (5% / 20%), CRRA 2 | D, high-risk share λ | D* = 6.70 (×10k); below it high risks leak and the insurer loses; menu breaks for λ < 13% | bisection on EU_H(A) = EU_H(B) |
| 6 | Signals cost imitators more | Spence, two types, one threshold | e*, low type's cost | separating range 1.5–3 yr; at e* = 2 the able net less than the pooled average | (wH − wL)/c |
| 7 | Moral hazard; interior best co-pay | care e ∈ [0,1], p = p0(1 − 0.7e), cost 0.6e², premium at actual care (fixed point) | co-pay share | best co-pay 36%, CE 19.08 vs 19.00 at full cover and 19.20 first best | first-best care = p0·a·L/(2k) |
| 8 | Credit rationing | 4 borrower groups, limited liability, zero recovery; mean gap slider; funds F; credit-score toggle | gap, F, info | default best rate 23.7% with 50% rationed; gap = 0 (SW's equal-mean case) moves the peak to the riskiest group alone; with scores the riskiest group is not served | rMax = (μ − u0)/π − 1 |
| 9 | Credit scores | toy logistic scorecard, 4,000 synthetic borrowers, PDO 20 at 600 = 50:1 | late payments, DTI, years, cutoff | default applicant 608; thin file 590; cutoff 580 approves 62% with 1.8% bad vs 6.3% overall | 600 at odds 50:1, +20 per doubling |
| 10 | Frontier | — | — | dated, sourced, split 已确立 / 已在做 / 某方声称 | — |
| 11 | Three questions | — | — | — | — |

Changes from the starting ladder: risk pooling became a diagram-only chapter linking the existing lesson (its step 4
already has a two-type death spiral, so chapter 4 goes further: continuous heterogeneity, reward/penalty, underwriting
classes). Credit scores got their own chapter after Stiglitz–Weiss so the ch8 "credit scores" toggle sets it up.

Stiglitz–Weiss honesty note: in this discrete model with equal project means (SW's assumption), the bank's best rate is
always the riskiest group's limit (each group yields μ − u0 to the bank at its own limit). The interior peak, and so
rationing, appears when riskier projects are also worse on average (the "gap" slider, default 0.20). The prose says
this, and says SW conclude rationing *may* occur, not that it must.

## Sources (opened 2026-11-25)

- 国办发〔2024〕38 号, https://www.gov.cn/zhengce/content/202408/content_6965741.htm — 成文 2024-07-26; 3-month fixed waiting period; +1 month per lapsed year; incentives after 4 continuous years; cumulative cap +20%.
- 2024 年全国医疗保障事业发展统计公报 via chinanews.com 2025-07-14 / huanqiu — 132,662.08 万 enrolled, 95%; 居民医保 94,713.73 万. Not checked on nhsa.gov.cn directly.
- 2025 筹资 1,100 / 财政 700 / 个人 400: news.cn 2025-12-17 (https://www.news.cn/20251217/4001bf6f451a4ec3bb18e1d54562e3aa/c.html), corroborated by Chongqing/Henan local documents.
- 居民医保 2021 100,866 万 → 2022 98,349 万 → 2023 96,294 万, and the two explanations: finance.sina.cn 2023-12-04, thepaper.cn, people.com.cn. Media figures, not the bulletins themselves.
- RAND HIE: Aron-Dine, Einav, Finkelstein, JEP 27(1) 2013, PMC3943162, Table 2: free care $2,170; 95% coinsurance −$845 (39%), 2011 dollars. The prose says "spent about 39% less than free care".
- ACA: KFF FAQ (updated Sept 2025) — no federal penalty; CA, MA, NJ, RI, DC have mandates. KFF 2018 issue brief — 2019 premiums ~6% higher from repeal, concentrated off-exchange.
- EU AI Act Annex III 5(b)/(c); digital omnibus delay to 2 Dec 2027 — law-firm summaries (Gibson Dunn, Orrick, 2026), Council approval 29 June 2026. Official Journal entry not checked.
- UK Code on Genetic Testing and Insurance — gov.uk; Huntington's only, life cover > £500,000.
- GINA scope (health insurance and employment; not life/disability/LTC) — NHGRI genome.gov pages and GINA patient resource (via search summary).
- PIPL art. 24 — cac.gov.cn statute text (https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm) via search summary; in-force date 2021-11-01 from general knowledge.
- ACA rating factors (age, area, family size, tobacco; not health) — CMS Market Rating Reforms / 45 CFR 147.102 via search summary.
- FICO weights 35/30/15/10/10 — Experian / Amex / myFICO summaries via search. The 300–850 range was not confirmed in a fetched page (well known; secondary).
- RAND HIE dates and size — JEP abstract: 1974–1981, about 2,000 households (the prose now says so).
- Akerlof: QJE 84(3) pp. 488–500 = 13 pages. The three rejections / "trivial" referee are attributed in the text to Akerlof's own account (Nobel autobiography); not fetched.
- Classic papers in the footer: citations from standard bibliographies, not re-fetched.

## Checked / not checked

- Checked: every prose number is a `{=…}` binding computed from models.js (79 bindings); `tests/models.cjs` re-derives the
  closed forms (CE, p*, D* indifference, first-best care, SW limits and peak return, scorecard scaling) and the qualitative
  claims (tipping, coverage rising with classes, interior co-pay optimum). `build-pages` builds clean; label budgets pass.
- Browser: `tests/browser.cjs` starts and stops its own server; see the run noted in the report.
- Not checked: canvas text overlap sweep (`canvas-text-overlap.cjs --sweep`), full 1280/390/320 × zh/en screenshot matrix,
  every live-sentence branch (skipped per the 2026-11-25 instruction to favour content). Independent review not done.
## Concept ownership (addendum, TASK-econ-series.md §4.D, applied 2026-11-25)

- Nine concepts kept. #ch1 aliases now 风险厌恶 / 确定性等价 / 为什么要买保险 (+ risk aversion); note that 风险厌恶 / risk aversion
  is currently also an alias of the atlas node `risk-pooling` — the registrar must move or resolve it.
- 逆向选择 / adverse selection and 劣币驱逐良币（二手车） on `lemons-market`. `signaling` and `moral-hazard` descriptions rewritten generally.
- Added: principal–agent paragraph at the end of #ch7 (with deposit insurance → where-money-comes-from#ch3); reputation,
  ratings and certification paragraph in #ch6 (with their failure modes: fake reviews, rating shopping, issuer-pays).
- Must-links now in the prose: risk-pooling #step1/#step3 (opening of #ch2) and #step4 (#ch2 end and #ch4); expected-value;
  scarcity-moves #c5 (#ch7) and #c6 (#ch3); externalities #step3 (#ch3, how it differs); where-money-comes-from #ch3 (#ch7) and
  #ch6 (#ch8); mechanism-design #s1 and auction-basics #step2 (#ch5); bayes-updating #step1 (#ch6); numbers-lie #c6 and #c9,
  signal-detection #step3, bayes-diagnostics (#ch9); prisoners-dilemma #step3 (#ch6); where-a-mortgage-payment-goes #ch7 (#ch8);
  veil-of-ignorance #step0 (#ch4). why-a-few-firms-win (two-sided-platforms, data-feedback-loops) named in plain text only (draft).
  Not linked: stocks-bonds (the essay does not discuss outside equity).

- The "大数据杀熟" discussion links to the sibling draft essay (why-a-few-firms-win) only in plain text; turn it into a
  `[[…]]` link after that page is registered.
