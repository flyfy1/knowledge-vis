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
