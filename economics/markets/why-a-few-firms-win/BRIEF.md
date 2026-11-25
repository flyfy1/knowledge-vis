# BRIEF · why-a-few-firms-win 为什么总是少数几家公司拿走整个市场

- Built-By: Claude Code (claude-opus-5-5), deep-essay batch 2026-11-11
- Verified-By: self-check only, not independently reviewed (pending). The self-check covered:
  - the node model test;
  - the browser smoke test;
  - the canvas text sweep at 1280/390/320;
  - screenshots at 1280/390/320 and with reduced motion.
- Category `economics`; subtopic `markets`, which is **new** (proposed 市场与竞争 / Markets & Competition, to add to `pages.config.js` beside `money`); stage `university`.
- Format: one long interactive essay on the deep track, climbing from textbook models to a dated frontier. No `lesson-shell.js`. No provenance label; the integrator adds it once a commit exists.
- Files:
  - `index.html`: markup and styles;
  - `copy.zh.js`: all visible text;
  - `models.js`: pure models (UMD) plus the `FRONTIER` data block;
  - `app.js`: wiring, canvas drawing, i18n, IntersectionObserver gating;
  - `tests/models.cjs`, `tests/browser.cjs`, `REGISTRY.json`.
- Language: `copy.en.js` is loaded if present, and every key falls back to zh. Things the translator must set in `copy.en.js`:
  - `ch12.unit.usd = "$ {v} billion"`;
  - `ch12.unit.bnScale = "1"`;
  - `ch12.unit.quarter = "Q{q} {y}"`.
- Each live sentence records its template in `data-key`, which the browser test reads.
- Stance: textbook models are presented as models, and the antitrust schools are set side by side (ch11 table) without taking a side. Real companies appear only as dated, sourced examples. No investment advice (hero and footer). The hero discloses that the author is an Anthropic product, and Anthropic is a participant in the ch12 model market.

## The one question

What makes a market hold only a few firms, and when does that hurt buyers? The page answers in four steps:
1. **Pricing power**: what a seller does with it (ch1).
2. **Cost and competition**: why only a few fit (ch2–4).
3. **Demand-side scale**: why a lead can snowball (ch5–8), and how it can be leveraged (ch9).
4. **Limits and measurement**: why winner-take-all is not inevitable (ch10), how power is measured and disputed (ch11), and where the AI stack and the law stand in Nov 2026 (ch12).

ch13 turns the ladder into five questions to ask of an antitrust headline, plus a table of figures of merit.

## Chapters (model · the standard result it implements)

1. **定价权 / Pricing power** (`#ch1`).
   - Model: constant-elasticity demand Q = 100(p/10)^−ε, with MC 10.
   - Result: MR = MC gives p* = cε/(ε−1) and Lerner = 1/ε (Lerner 1934). Surpluses are exact integrals; a perfect price discrimination mode is included.
   - Pinned: at ε = 2 the price is 20, Lerner 0.5 and 25% of the competitive quantity is sold; at ε = 5 the price is 12.5 and Lerner 0.2.
   - The deadweight share stays between 20% and 26% across the whole slider range. The page says this is a property of the constant-elasticity form.
2. **成本结构 / Cost structure** (`#ch2`).
   - Model: C = F + 10q + dq².
   - Results: MES = √(F/d); the cost-minimising number of firms is ≈ S/MES; one firm is cheapest when S < √2·MES (subadditivity, Baumol 1977).
   - Pinned: at F = 1e6 and S = 1e6, MES is 100,000, 10 firms are cheapest, and one firm costs 270% more. At F = 1e7 the answer is 3 firms; at S = 1e5 it is 1 firm.
3. **寡头 / Oligopoly** (`#ch3`), with P = 60 − Q and c = 10:
   - Cournot: P = (a + Nc)/(N + 1).
   - Bertrand with identical goods: P = c.
   - Logit differentiated Bertrand (Anderson–de Palma–Thisse): p − c = σ/(1 − s).
   - Share-weighted Lerner = HHI/ε.
   - Pinned at σ = 8: with N = 2, prices are 26.67, 10 and 23.87; with N = 10, Cournot is 14.55 and logit 18.87.
4. **进入 / Entry** (`#ch4`).
   - Model: two-stage free entry (Sutton 1991). Cournot gives N* = ⌊(a−c)√(S/F)⌋ − 1.
   - Also: excess entry against the welfare optimum (Mankiw–Whinston 1986), and the contestable price = AC (Baumol–Panzar–Willig 1982).
   - Pinned at S = 4, F = 100:
     - Cournot: 9 firms at P 15;
     - logit: 4 firms;
     - Bertrand: 1 firm at P 35;
     - welfare optimum: 4 firms;
     - contestable price: 10.51.
   - At S = 16, Cournot gives 19 firms (the √ law).
5. **网络效应 / Network effects** (`#ch5`).
   - Model: fulfilled-expectations hump p = n(1−n) (Rohlfs 1974; Economides 1996). Critical mass and the high equilibrium come from the quadratic. Dynamics: RK4 on dn/dt = D(n) − n.
   - Pinned: at p = 0.16 the critical mass is 20% and the high equilibrium 80%. A 25% start reaches 80%; a 15% start collapses.
6. **锁定 / Lock-in** (`#ch6`).
   - Model: Arthur (1989) with 1000 adopters. Lock-in occurs once the lead exceeds g/r. Batches of 200 seeded runs.
   - Pinned at r = 0.1: the threshold is 10, 177 of 200 runs tip, and A wins about half.
7. **双边平台 / Two-sided platforms** (`#ch7`).
   - Monopoly: Armstrong (2006), linear version, p_i = f_i + n_i − α_j n_j.
   - Duopoly with single-homing on both sides: p_i = f_i + t − α_j.
   - Pinned at α₁ = 0.1, α₂ = 0.8: p₁ = 0.14 against a cost of 0.2, and p₂ = 0.74. Pricing each side as a separate market gives p₁ = 0.35 and profit 0.18, against 0.30 for two-sided pricing.
   - The competitive bottleneck is described in prose only.
8. **数据回路 / Data loops** (`#ch8`).
   - Model: error = X^−β (the Chinchilla data term; Wright's learning curve); logit shares with λ = 5; dX/dt = s − δX.
   - Closed-form threshold: the even split is unstable when λβδ^β2^β > 1.
   - Pinned at β = 0.3:
     - share 72% → 52% at t = 300;
     - from the 2× start, tipping begins at δ ≈ 0.11 (bisection);
     - δc ≈ 0.13;
     - the band between them is bistable.
9. **捆绑 / Tying** (`#ch9`).
   - Model: simplified Whinston (1990); the one-monopoly-profit case is m = 0. Plus Spengler (1950) double marginalisation.
   - Pinned at the defaults: the rival earns 0.8 open and −0.2 tied; M gains 0.6; welfare falls 0.8; with m = 0 the gain is 0.
   - Double marginalisation: 47.5 separately against 35 integrated; profits 468.75 against 625.
10. **不是必然 / Not inevitable** (`#ch10`).
    - Model: the ch6 model plus interoperability φ, multi-homing h and taste g. Threshold g/(r(1−φ)).
    - Pinned tipping shares:

      | Setting | Tipping share |
      |---|---|
      | Defaults | 88.5% |
      | φ 0.5 | 32% |
      | φ 0.8 | 0 |
      | h 0.5 | 69.5% |
      | g 2 | 32.5% |
      | g 4 | 2% |

11. **测量 / Measuring** (`#ch11`).
    - Markups: the DLEU estimator μ = θ·sales/COGS on a synthetic economy with true μ = 1.2. The COGS share falls 0.85 → 0.65, which is Traina's critique. Pinned: the estimate goes 1.2 → 1.57.
    - Demsetz (1973): 3-firm asymmetric Cournot. Pinned when firm 1's cost goes 10 → 0: HHI 3333 → 3750, P 22.5 → 20, CS 703.1 → 800.
    - A table of the three schools.
12. **前沿 / Frontier: the AI stack and antitrust** (`#ch12`).
    - Four layer cards. HHI bounds come from partial shares (`hhiBounds`).
    - A 10-row case table covering the US, EU and China.
    - The tags 已确立 / 已发生 / 声称 separate established results, dated events or measurements, and claims by interested parties.
13. **读懂一条反垄断新闻** (`#ch13`): five questions and the figures-of-merit table:
    - price–cost margin;
    - elasticity;
    - HHI;
    - MES ÷ market size;
    - network-effect strength;
    - switching and multi-homing costs and interoperability.

## Tuned (not sourced) parameters, all labelled on the page

| Chapter | Parameters |
|---|---|
| ch1 | c = 10, Q0 = 100 |
| ch2 | d = 1e-4, MC 10 |
| ch3 | a = 60, c = 10, logit δ = 4 |
| ch4 | logit demand mass 12; S grid 0.25–32; F grid 25–400; σ = 8 |
| ch5 | τ = 1 |
| ch6, ch10 | g = 1, r = 0.1, 1000 adopters, 200 runs, seeds 1–200 |
| ch7 | v₁ = 0.5, v₂ = 1, f = 0.2, t = 1 |
| ch8 | λ = 5, 2× starting data, T = 300 |
| ch9 | V = 10, w = 2 |
| ch11 | μ = 1.2, COGS share starts at 0.85 |

## Sources (opened 2026-11-11 unless noted)

- **Textbook and papers.** These are cited by name in the footer; the page uses standard results, not the papers' data:
  - Lerner 1934; Tirole 1988; Baumol 1977; Panzar 1989; Cournot 1838; Bertrand 1883; Anderson–de Palma–Thisse 1992; Berry–Levinsohn–Pakes 1995.
  - Sutton 1991; Mankiw–Whinston 1986; Baumol–Panzar–Willig 1982; Rohlfs 1974; Economides 1996; Arthur 1989; Klemperer 1987.
  - Rochet–Tirole 2003; Armstrong 2006; Wright 1936; Whinston 1990; Carlton–Waldman 2002; Spengler 1950; Adams–Yellen 1976; Demsetz 1973.
  - The schools table cites Bork 1978; Posner 1976; Salop–Scheffman 1983; Shapiro 2018; Khan 2017; Wu 2018.
- **Outside numbers in the prose:**
  - De Loecker, Eeckhout & Unger, QJE 2020: markup 1.21 → 1.61. https://econpapers.repec.org/RePEc:oup:qjecon:v:135:y:2020:i:2:p:561-644 and https://rba.gov.au/publications/confs/2019/pdf/jan-eeckhout.pdf
  - Traina 2018 (via ProMarket): https://www.promarket.org/2018/07/24/current-research-still-gets-wrong-market-power ; also https://econpapers.repec.org/RePEc:zbw:cbscwp:272
  - Hoffmann et al. 2022 (Chinchilla, β ≈ 0.28): https://arxiv.org/pdf/2203.15556
  - Besiroglu et al. 2024 replication (≈ 0.37): arXiv:2404.10102. Seen in search excerpts only.
  - Bajari et al. 2019, NBER w24334: https://www.nber.org/papers/w24334
  - Wouters et al. JAMA 2020 ($985m median): not opened; widely cited figure.
  - Bond, Hashemi, Kaplan & Zoch 2021: not opened; described in general terms only.
  - Ohio v. American Express (2018): general legal knowledge, not re-opened.

## Facts that will go stale (all in `models.js` FRONTIER, or in `copy.zh.js` `ch12.case.*`; checked 2026-11-11)

### Market and cost figures (FRONTIER)

| Fact | Source |
|---|---|
| Cloud infra 2026-Q3: Amazon 26%, Microsoft 19%, Google 16%; $167.7bn; +55% y/y | Synergy Research / TechInsights, 2026-10-30. https://www.techinsights.com/node/61958 ; https://datacenterknowledge.com/cloud/cloud-revenue-hits-168b-as-ai-capacity-expands |
| Foundry 2026-Q2: TSMC 72.5%, Samsung 5.9%, SMIC 5.4% of top-10 revenue ($53.49bn) | TrendForce, 2026-09-09. https://www.trendforce.com/presscenter/news/20260909-13225.html |
| TSMC 2026 capex guidance $60–64bn (Q3 call, 2026-10-15) | Trade press: https://bits-chips.com/article/tsmc-raises-2026-capex-to-as-much-as-64b/ ; https://cryptobriefing.com/tsmc-capex-64-billion-ai-demand/ |
| NVIDIA, quarter to 2026-07-26: revenue $96.2bn, data centre $89.0bn, GM 75.0% | Press release 2026-08-26. https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027 |
| Frontier training cost ×2.4/yr (90% CI 2.0–2.9) since 2016 | Cottier et al. https://arxiv.org/abs/2405.21015 |
| Inference price for fixed capability falls 9–900× per year | Epoch AI, 2025-03-12. https://epoch.ai/data-insights/llm-inference-price-trends |
| Open-weight models trail closed ones by ≈ 4 months | Epoch AI, 2026-05-29. https://epoch.ai/data-insights/open-closed-eci-gap |
| **Claim.** Enterprise LLM API spend: Anthropic 55%, OpenAI 31%, Google 9%; open source 4% of spend, 19% of tokens. Menlo is an Anthropic investor. | Menlo Ventures, 2026-11-03. https://menlovc.com/?p=22614 |
| HHI > 1800 = highly concentrated; Δ > 100 presumption. The 2023 Merger Guidelines were kept 2025-02-18. | https://www.wilmerhale.com/en/insights/client-alerts/20250228-here-to-stay-ftc-and-doj-announce-that-2023-merger-guidelines-remain-in-effect |

### Cases and rules (`ch12.case.*`, plus the ch9.p4 fine)

| Case or rule | Sources |
|---|---|
| US v. Google (search): remedies 2025-09-02; final judgment 2025-12-05; Google appeal 2026-01-16; DOJ/states cross-appeal 2026-02-03 | https://www.justice.gov/opa/pr/department-justice-wins-significant-remedies-against-google ; https://ppc.land/google-files-appeal-challenging-six-year-search-remedies/ ; https://www.mlex.com/mlex/antitrust/articles/2507211/us-doj-states-argue-appeal-of-google-search-ruling-ask-for-harsher-remedies |
| US v. Google (ad tech): no AdX divestiture; six-year behavioural decree (Sept 2026) | https://natlawreview.com/article/court-declines-order-adx-divestiture-google-ad-tech-case ; https://ppc.land/google-faces-six-year-worldwide-ad-tech-decree-instead-of-adx-sale/ |
| FTC v. Meta: ruling for Meta 2025-11-18; FTC appeal Jan 2026 | https://www.washingtontimes.com/news/2026/jan/21/ftc-says-appeal-meta-antitrust-ruling/ ; https://www.mediapost.com/publications/article/412176/ftc-appeals-dismissal-of-meta-antitrust-suit.html |
| FTC v. Amazon: trial 2027-03-29 | https://www.mlex.com/mlex/articles/2420780/us-ftc-amazon-propose-pushing-back-antitrust-trial-to-march-2027 |
| DOJ v. Apple: motion to dismiss denied 2025-06-30; settlement talks reported 2026-07-17, unconfirmed | https://www.macrumors.com/2025/06/30/doj-apple-antitrust-case-dismissal-denied/ ; https://9to5mac.com/2026/07/17/apple-in-talks-to-settle-doj-antitrust-lawsuit-per-report/ |
| Epic v. Apple: cert granted 2026-06-30, No. 25-1311 | https://ipwatchdog.com/2026/06/30/high-court-grants-cert-in-apples-challenge-to-ninth-circuit-contempt-ruling-in-app-store-dispute/ |
| EU DMA fines: Apple €500m and Meta €200m (2025-04-23); Google €890m (2026-07-23), of which €460m self-preferencing and €430m Play anti-steering | https://digital-markets-act.ec.europa.eu/commission-finds-apple-and-meta-breach-digital-markets-act-2025-04-23_en ; https://digital-markets-act.ec.europa.eu/commission-fines-google-eur890-million-breaches-digital-markets-act-2026-07-23_en |
| EU DMA review (Apr 2026), cloud investigations (Nov 2025), AWS/Azure preliminary gatekeeper view (Jun 2026) | https://techpolicy.press/what-the-eus-first-digital-markets-act-review-actually-changes ; https://europa.eu/newsroom/ecpc-failover/pdf/ip-26-1444_en.pdf (search excerpt only) |
| China: Alibaba ¥18.228bn (2021-04-10); Meituan ¥3.442bn (2021-10-08) | https://www.jiemian.com/article/7566414.html ; https://www.cna.com.tw/news/acn/202110080293.aspx |
| China: revised Anti-Unfair Competition Law effective 2025-10-15 | https://www.news.cn/legal/20250627/9ecfe6916d7d4bd985a0fcf29ec773ee/c.html |
| China: SAMR platform compliance guidelines (Feb 2026); food-delivery probe (Jan 2026) | https://www.caixinglobal.com/2026-02-14/china-takes-aim-at-online-platforms-monopolistic-practices-102414787.html ; https://www.caixinglobal.com/2026-01-10/beijing-tightens-scrutiny-of-food-delivery-giants-amid-price-wars-102402304.html |
| China: SAMR preliminary finding on NVIDIA/Mellanox (2025-09-15) | https://www.jurist.org/news/2025/09/china-finds-nvidia-violated-antimonopoly-law-in-preliminary-probe/ |

## Checked / not checked

- **Checked:**
  - Every prose number is derived from `models.js` in `tests/models.cjs` (1,453 checks). This includes the FRONTIER values repeated in ch2.p2, and the ch9.p4 fine against the case table.
  - Every live-sentence branch is reached from the sliders, both in node and in the browser via `data-key`.
  - Template placeholders, no CJK in app.js and models.js, and in-page links resolve.
  - Browser: zh and EN-fallback at 1280/390/320; keyboard; reduced motion.
  - Canvas sweep.
  - Screenshots of every figure at 1280/390/320 and 390 with reduced motion.
- **Not checked:**
  - Wouters 2020 and Bond et al. 2021 were not opened. Besiroglu's 0.37 and the AWS/Azure preliminary view rest on search excerpts.
  - The ch8 claim that "search-log studies find more data helps" is stated generally, without a citation.
  - No English copy exists yet, so EN mode shows Chinese.
  - No real screen reader was used.

## Prerequisites the site lacks

- A page on **elasticity and marginal revenue**: ch1 links to supply-demand step 2 and scarcity-moves ch2, which cover it only briefly.
- **Repeated games and tacit collusion** have only prisoners-dilemma.
- There is no **production functions / cost curves** page.

## Changes from the planned ladder

- The competitive bottleneck is in prose only; its formulas are messier than the slider budget allows.
- Learning curves are folded into the data chapter.
- The ch7 negative-price branch was dropped: no slider position reaches it in this linear version, and the test enforces that every branch is reachable.
- The ch8 chapter now distinguishes "tips from the 2× start" (δ ≈ 0.11) from "the even split is unstable" (δc ≈ 0.13). The first draft claimed tipping only above 0.13, which the model contradicted.

## Closeout 2026-11-25 (template conversion, facts, figures)

- Built-By: Claude Code (claude-opus-5-5, thinking unavailable), closeout agent. Verified-By: self-check only; not independently reviewed.
- **English.** `content.en.md` started from Antigravity's (gemini-4-hydrogen) `copy.en.js` of ed19a837 (branch drafts/antigravity-essays-20261114), written for this same zh text. The closeout agent restored it here, converted it and wrote the English for every string it changed or added (desc, hero note, ch1.p1, ch1.p5, ch2.p2, ch7.p3, ch8.p2, ch8.p4, ch11.p3, ch12 legend, p1, money paragraph, cards cloud.f1/f2, models.f4/f5, cases us5.c/eu2.c/cn2.c/cn3.c, reg.title, reg.p, footer, all eight diagrams). The rest of the Antigravity English was not re-audited line by line; one embellishment was found and removed (ch8.p4 claimed search-log studies show gains on "tail queries"). Commit trailer: `Derived-From: economics/markets/why-a-few-firms-win/copy.en.js -> economics/markets/why-a-few-firms-win/content.en.md` and credit Antigravity in Built-By.

### Template conversion
- `scripts/convert-essay.cjs` needs a live page, so it was run through a scratch wrapper (`/tmp/agent-tasks/econ-graph/why-a-few-firms-win/convert-draft.cjs`) that injects this draft into the in-memory registry. Before converting, the TOC was moved to `toc.chN` keys (index.html and both copy tables), as the layout expects. Round trip: index.html byte-identical and both copy tables equal; the only mismatch was the desc, which differed between REGISTRY.json and doc.desc; content now uses the REGISTRY.json desc.
- page.json: `layout: essay`, version 20261125a, category/subtopic/stage/path/tags, a `generators` entry for `tools/diagrams.cjs`. It has **no `status`** (the registrar adds it; build-registry rejects "draft"). The subtopic `markets` is not yet in pages.config.js.
- Generated now (do not edit): index.html, copy.zh.js, copy.en.js, refs.json, figures/dg-*.html. Sources: content.zh.md, content.en.md, page.css, figures/ch*-*.html, tools/diagrams.cjs, models.js, app.js.
- Tests: `tests/models.cjs` reads index.html through `scripts/lib/prefill.cjs` unprefill. `tests/browser.cjs` now expects English to exist; it also had a misspelt table-wrapper exclusion (`.tablewrap` → `.tblwrap`).

### Fixed
- **ch7 wrong comparison.** The prose said one-sided pricing earns 0.18 against 0.30. But 0.18 is the profit in a world *without* cross effects. Under the real cross effects, those prices (0.35 / 0.6) earn **0.26**. Added `platform.oneSidedActual`; the readout, the prose and the test now use it. A test checks over a 19×19 grid that the one-sided prices never beat the optimum.
- **Wouters et al.** The page said "$985m median". That was the 2020 figure; JAMA corrected it in 2022 (328(11):1110, doi 10.1001/jama.2022.14317). The article now shows **$1,141.7m** median ($1,559.1m mean; 2018 USD; 63 of the 355 drugs approved 2009–2018; includes failed trials). Sources: https://jamanetwork.com/journals/jama/fullarticle/2762311 and https://researchonline.lse.ac.uk/id/eprint/116657.
- **Menlo disclosure and an independent source (ch12).**
  - The Menlo card now says, in bold, that Menlo is an Anthropic investor and that survey answers are not invoices. The footer says it too.
  - Ramp AI Index added (new FRONTIER entries `rampAdoption`, `rampTokenSpend`; https://ramp.com/data/ai-index, read 2026-11-25). Card data from 85,000+ US businesses: in Oct 2026, 56.8% adoption, Anthropic 44.8%, OpenAI 40.6%. Token-spend shares for the week to 2026-11-15: Anthropic 58.7%, OpenAI 37.2%, xAI 2.4%, Google 1.4%, giving HHI ≈ 4837.
  - The card's stated caveat: Ramp sees only direct payments, so purchases through cloud bills are invisible and Google is probably understated. That caveat is my inference, labelled as "很可能".
  - Ramp's own investors were not researched. "No known investment in any model maker" means I found none, not that I checked its cap table.
- **Symmetry.** Claims by Microsoft, Amazon, Google and Meta already carry 某方声称. The Anthropic-linked source is tagged the same way, and the independent measurement agrees on the ranking but not on the shares.
- **Tags renamed** to the house set: 已确立 / 已演示 / 某方声称 (from 已发生 / 声称). The legend defines 已演示 as "measured or happened (measurement, ruling, fine)". The final chapter is renamed 「前沿在哪：AI 这一摞生意」.
- **ch8.** Besiroglu et al. replication exponent confirmed: β = 0.3658, against Hoffmann's 0.2849 (arXiv HTML Table 1, https://arxiv.org/html/2404.10102). The uncited "search-log studies" sentence now cites Schäfer, Sapi & Lorincz 2018 (DIW DP 1730, abstract read: https://ideas.repec.org/p/diw/diwwpp/dp1730.html).
- **ch11.** Bond, Hashemi, Kaplan & Zoch confirmed from the NBER w27002 abstract (https://www.nber.org/papers/w27002): with revenue rather than output elasticities, the ratio estimator carries no markup information. Published in JME 121 (2021) 1–14.
- **ch1.**
  - Elasticity is no longer pointed to supply-demand. It now links to 关税到底谁付 `#elasticity` (economics/trade/who-pays-a-tariff, owned by another writer, unregistered as of 2026-11-25, so the build warns "not a live page").
  - 大数据杀熟 is now defined, and PIPL Art. 24 (in force 2021-11-01) is added. That text is from my knowledge of the statute, not re-opened.
- **Frontier rechecks (2026-11-25).**
  - Epic v. Apple: set for argument 2027-01-11 (docket entry 2026-11-02; https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html), limited to the contempt question.
  - EU AWS/Azure: preliminary view 2026-06-25 confirmed on the Commission page; no final decision found in news search as of 2026-11-25.
  - Google ad tech: the 2026-09-02 remedies ruling is consistent with the case table.
  - China food-delivery probe: announced 2026-01-09 (news.cn), no result found.
- **ch12, how AI companies make money.** New paragraph (`ch12.money`) and figure 8. Mechanism only: subscriptions and tiers as self-selection price discrimination, per-token APIs, rented compute, chips. No revenue figures.
- **Figures.** Eight static diagrams in `tools/diagrams.cjs` (generator), each with a wide and a narrow SVG and font ≥ 14:
  - dg-cost (ch2);
  - dg-links (ch5; 1/3/10/28 pairs);
  - dg-platform (ch7; prices from the model);
  - dg-loop (ch8);
  - dg-tie (ch9);
  - dg-interop (ch10);
  - dg-cogs (ch11; shares 71/13/17% → 54/29/17%, estimates 1.20 → 1.57 from the model);
  - dg-stack (ch12).

  The drawing helper is adapted from a-fair-price-for-a-bet/tools/diagrams.cjs. tests/models.cjs pins the drawn numbers.

### Re-derived independently (own code, no models.js: /tmp/agent-tasks/econ-graph/why-a-few-firms-win/rederive.cjs)
- ch1: brute-force price search gives p 20 / L 0.5 / q 25 at ε 2, and p 12.5 / L 0.2 at ε 5.
  - My numeric DWL integral was inaccurate near ε = 1.25. The closed form gives a share of 19.75–26.4%, so the prose's "20% 到 26%" stands.
- ch2: brute force over k confirms 10 firms (+270%), 3 firms, and 1 firm.
- ch3: Cournot by best-response iteration gives 26.67 / 14.55. The logit price by bisection gives 23.87 / 18.87.
- ch4, free entry:
  - S 4: Cournot 9 firms at P 15; logit 4; Bertrand 1 at P 35; welfare optimum 4; contestable price 10.51;
  - S 16: Cournot 19.
- ch5: roots 20% / 80%; Euler integration from 25% reaches 80%, from 15% reaches 0.
- ch6/ch10: my own Arthur run on the same generator gives 177 of 200 tipped and 88.5 / 32 / 0 / 69.5 / 32.5 / 2%.
  - On seeds 1001+ the results are 91 / 33.5 / 0.5 / 66 / 34 / 1%. So the pinned numbers are the seed-1 sample, robust to ±3 points.
- ch7: a grid search for the maximum gives p1 0.144, p2 0.746, profit 0.297. This exposed the 0.18 error above.
- ch8: RK2 integration gives 71.9% → 51.6%. Bisection gives a tipping δ of 0.112; the closed form gives δc 0.129.
- ch9: 0.8 / −0.2 / 0.6 / 0.8; double marginalisation 47.5 / 35 / 468.75 / 625.
- ch11: 1.569. Three-firm Cournot by best responses: 22.5 / 3333 / 703.1 → 20 / 3750 / 800.
- ch12 HHI bounds:

  | Market | HHI bounds |
  |---|---|
  | Cloud | 1293–1854 |
  | Foundry | 5320–5408 |
  | Menlo shares | 4067–4092 |

  The cloud sentence now says "whether it crosses 1800 depends on the rest".

### Not verified
- Not re-opened in this pass; they rest on the 2026-11-11 check:
  - cloud, foundry, TSMC capex and NVIDIA figures;
  - Epoch figures;
  - the US Google search and Meta case statuses;
  - DMA fines;
  - Alibaba and Meituan fines;
  - NVIDIA/Mellanox (marked "not rechecked").
- Ohio v. AmEx and PIPL Art. 24 are from general legal knowledge.
- Not done, per the 2026-11-25 instruction:
  - the per-control-state sentence read;
  - the full screenshot matrix;
  - the canvas sweep.

  One zh desktop shot and one phone shot only.

### Status at wrap-up 2026-11-25
- **Done.**
  - Template conversion; `build-pages.cjs <dir>` and `--check` pass. The only warnings are three links to sibling drafts that are not live yet.
  - `tests/models.cjs`: PASS, 2052 checks. `tests/browser.cjs`: PASS, run before the last link and diagram edits; no console errors.
  - zh and en complete (en not stubbed).
  - 8 diagrams. The dg-platform money arrows were fixed to point into the platform after a screenshot review.
  - Facts and Menlo/Ramp as above.
  - Links required by specs/essay-briefs/TASK-econ-series.md:
    - supply-demand #step2 kept alongside who-pays-a-tariff #elasticity;
    - ch8 ↔ why-some-countries-got-rich #ch7 (Wright's law);
    - ch12 → when-buyers-cant-see-quality #ch5 (screening). Platforms stay here; lemons and credit scores stay there.
  - REGISTRY aliases 边际收入, 边际收益 and MR = MC added to `monopoly-pricing-lerner`.
- **Missing or for the registrar.**
  - page.json has no `status`. The subtopic `markets` is not in pages.config.js.
  - The three sibling links above become checkable once those pages are registered.
  - The proposed edges are in TASK-econ-series.md, e.g. `network-effects-critical-mass>data-feedback-loops:connection` and `data-feedback-loops>wrights-law-cost-curve:connection`.
- **Not verified.** See "Not verified" above. In addition:
  - the Antigravity English outside the edited keys was not audited;
  - the browser test was not rerun after the final edits, which were the dg-platform arrows and three links.
- **Server.** The local server on port 18886 (python http.server, started for the browser test) is still running. Under the 2026-11-25 rule I may not kill it; the lead should stop it.
