# BRIEF · why-one-rate-moves-everything 央行调一个利率，为什么所有东西的价格都跟着动

- Built-By: Claude Code (claude-opus-5-5), deep-track essay batch 2026-11-11
- Verified-By: self-check only (node model/data/prose test, browser test at 1280/390/320, canvas sweep, screenshots, re-read); independent review pending
- category `economics`, subtopic `money` (货币与银行 / Money & Banking), stage `university`
- Format: one long interactive essay in the style of `demos/scarcity-moves`. Files: `index.html`, `copy.zh.js` (all visible text), `models.js` (pure models + the dated FRONTIER block, UMD), `data.js` (shipped public data, UMD, generated), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`, `REGISTRY.json`. `copy.en.js` is loaded if present; every key falls back to zh.

## The one question

A committee sets one overnight rate between banks. Why do 30-year bond prices, stock valuations, mortgages, exchange rates and the government's interest bill all move with it?

Answer the essay builds: almost every asset is "a stream of future money", so its price is a discounted sum whose sensitivity to the rate is its duration (ch1–2). The central bank pins only the overnight rate (ch5), but long rates are the average expected future short rate plus a term premium (ch3–4), so it moves the whole curve mainly through expectations. Where it sets the rate is judged against an unobservable neutral rate (ch6); how that passes to output and inflation is the New Keynesian model, with its known weaknesses (ch7). The same discounting reaches equities, houses and currencies (ch8–9); at zero, promises and bond purchases act on the same curve (ch10); and the same duration, seen from the borrower, decides the public debt path (ch11). Ch12 is the dated frontier; ch13 five questions to ask of any rate decision.

## Figures of merit
Real policy rate (vs the r* range), term premium, the 10y–3m spread, r − g, the output gap and the inflation gap. Ch12 renders a table of all six from the FRONTIER block.

## Chapters (law · case · model · limits)

1. **明天的钱 / Present value** (`#ch1`). Law: the further the money, the more its present value reacts to the rate. Model: PV = Σ CF/(1+r)^t, two streams (30×100; 40 growing 6 %/yr), value-weighted mean wait = Macaulay duration. Reader: rate 0–10 %, stream. Numbers: 100 in year 30 = 55.2 at 2 %, 23.1 at 5 %; mean wait 13.3 vs 17.6 yr; +1 pt → −11.8 % vs −15.4 %. Limits: certain cash flows, flat rate. Link: compound-interest step 3.
2. **债券 / Bonds** (`#ch2`). Model: annual-coupon price, Macaulay/modified duration, convexity, ΔP/P ≈ −D_mod Δy + ½CΔy² (Fabozzi, *Bond Markets*, ch. 4). Reader: Δy −3…+3, start yield, coupon, which bond; "2022" preset reprices par bonds from the 2021-12-31 to the 2022-12-30 curve. Numbers: 2y/10y/30y −1.92/−8.59/−20.06 % for +1 pt at 1.5 %; 30y duration −22.96, with convexity −19.77. Case: 2022 rise, FDIC $620 bn unrealised losses, SVB (duration 6.2 yr HTM, ~94 % uninsured). Limits: no default, parallel shifts. Links: interest-rates-bonds step 4, where-money-comes-from ch3 (runs).
3. **收益率曲线 / Bootstrapping** (`#ch3`). Model: par yields (FRED DGS1…DGS30) linearly interpolated, DF_n = (1 − c_nΣDF)/(1 + c_n), spot and one-year forward. Reprices every par bond to 100 (tested). Numbers: 2023-06-30 spot1 5.40, spot10 3.76, fwd9→10 3.24; 2021-12-31 spot1 0.39, fwd9→10 1.78. Limits: annual coupons, linear interpolation causes forward steps at nodes (said on page); Treasury uses a smoothing spline.
4. **预期与期限溢价 / Expectations + term premium; the inversion record** (`#ch4`). Model: E[i_t] = i_L + (i_0 − i_L)2^(−t/h); n-yr yield = exact average + TP_10·min(n,10)/10 (Campbell–Shiller notation; the TP shape is an assumption, said on page). History: GS10 − TB3MS monthly since 1960, USREC shading, Kim–Wright THREEFYTP10; rule "inverted in the `lead` months before a recession start" / false alarm if no start within `lead` months after an episode's start; episodes < 6 months apart merged; only recessions with a full window scored. Numbers (lead 12): 7 of 8 called, miss 1990-08, 4 false alarms (1966-09, 1978-12, 2006-08, 2022-11); lead 24: 2 (1966, 2022). Contested: why it works (expectations vs bank margins), low term premium caveat. Limits: 8 events, monthly data and discount-basis bills differ from NY Fed's method.
5. **准备金 / Reserves, corridor and floor** (`#ch5`). Model: Poole (1968): i = i_D + (i_L − i_D)Φ((K − R)/σ); 60 days with K ~ N(0, sd), seeded. Corridor width 2 and σ = 1 are tuned for visibility (said on page). Numbers: R=0 → 4.00 mid-corridor; R=4 → floor 3.00. Facts: IORB 3.90, ON RRP 3.75, SRF 4.00, target 3.75–4.00 (implementation note 2026-09-16), EFFR Oct 3.88 < IORB. Links: where-money-comes-from ch2 (not re-teaching the multiplier). Limits: one bank, demand position moves in reality.
6. **泰勒规则 / Taylor rule and r*** (`#ch6`). Model: i = r* + π + a_π(π − 2) + a_y·gap (Taylor 1993) against shipped quarterly data 1990Q1–2026Q3 (FEDFUNDS avg, core PCE y/y, 100·(GDPC1/GDPPOT − 1)). Numbers (2/2/.5/.5): MAE 1990–2007 1.19; min −1.93 at 2020Q2; >9 in 2021Q4–2022; 2021Q4 gap +2.1 (current vintage, Orphanides 2001 caveat); 2026Q3 rule 5.42 (r* 1.0), 6.07 (r* 1.65) vs 3.67. r*: LW 1.65, HLW 1.01 (2026Q2); SEP longer-run 3.2 → implied 1.2. Limits: inflation measure, CBO potential, no smoothing.
7. **新凯恩斯模型 / Three-equation NK model** (`#ch7`). Model: Galí (2015) ch. 3, AR(1) demand (r^n) and cost-push shocks, solved by undetermined coefficients; determinacy κ(φπ − 1) + (1 − β)φx > 0 (Bullard–Mitra 2002); residuals < 1e-12 tested. β 0.99, σ 1, ρ 0.8 textbook; κ 0.1 default and φx 0.125 tuned within literature ranges (said on page). Numbers: demand x +0.38, π +0.73; φπ 5 → 0.11/0.21; tracking r^n → 0/0 (divine coincidence); supply φπ 1.5 π 2.36, x −1.27; φπ 5 π 0.67, x −2.15; output per point of inflation removed (φπ 1.5→3): 0.17/0.52/1.73 % at κ 0.3/0.1/0.03. Contested: Phillips-curve slope (Hazell et al. 2022; Benigno–Eggertsson 2023; Bernanke–Blanchard 2025); 1970s indeterminacy (Clarida–Galí–Gertler 2000). Weaknesses listed: no lags (link where-money-comes-from ch8), rational expectations/credibility, no finance or debt, forward-guidance puzzle (Del Negro–Giannoni–Patterson).
8. **股票和房子 / Equity duration and houses** (`#ch8`). Models: two-stage DDM with Gordon tail, discount = rf + 4 (ERP tuned), duration incl. growing-perpetuity term (1+r)/(r−g) (closed form = explicit 4000-yr sum, tested); annuity loan L = M(1 − (1+i)^−n)/i. Numbers: durations 21.4 / 25.5 yr (> 30y par bond at 3 %, 20.2); rf 3→4: −16.7 / −19.8 %; loan capacity 2.65 → 7.79 %: −44 %. Contested: Campbell–Shiller decomposition; Glaeser–Gottlieb–Gyourko (≈1/5 of 1996–2006); Fonseca–Liu lock-in (−9 % moving per point). Links: mortgage essay, where-money-comes-from ch7.
9. **汇率 / CIP, UIP, carry** (`#ch9`). Models: F = S(1+i)/(1+i*) (arbitrage); carry trade monthly, lognormal FX with 10 %/yr vol, worlds UIP drift / random walk / random walk + 10 %/yr chance of a 20 % crash (all tuned, said on page), seeded; 200-path average. Facts: Fama (1984) puzzle, Brunnermeier–Nagel–Pedersen 2008, Du–Tepper–Verdelhan 2018, Meese–Rogoff 1983. Link: where-money-comes-from ch9 (PPP).
10. **零利率以后 / Lower bound, FG, QE, QT** (`#ch10`). Model: ch4 path with the rate held at 0 for L years; QE lowers TP by bp × purchases (% GDP) with bp = 4.4 (Gagnon et al. 2011 regression), low/high = 30/100 bp ÷ 12 % GDP. Numbers: 3.36 → 2.77 (2 yr promise) → 2.24 (+12 % GDP). Balance sheets: WALCL, ECBASSETSW. ECB DFR min −0.50 % (2019-09-18 to 2022-07). Limits: linear, permanent, full credibility.
11. **r − g** (`#ch11`). Model: b' = b(1+r)/(1+g) − pb, average rate reprices by 1/m per year (m = 6 tuned); pb* = b(r − g)/(1 + g). Numbers: 190 / 279 / 131 % after 30 yr at r = 4/6/2, g 4, pb −3. Facts: FRED 2026Q2 r_eff 4.04 (A091RC1Q027SBEA ÷ FYGFDPUN), g 6.31 (GDP y/y), debt 97.4 % (FYGFDPUN/GDP); CBO Feb 2026 101 → 120 % by 2036. Contested: Blanchard 2019 vs critics; Laubach 2009 (3–4 bp per point); Sargent–Wallace 1981.
12. **前沿 / Frontier** (`#ch12`). Bank table and figure-of-merit table rendered from `RateModels.frontier`; five debates; established / happened / forecast-or-contested boxes.
13. **五个问题 / Five questions** (`#ch13`). No model.

## Changes from the requested chapter list
- "Plumbing" is ch5, after the curve chapters, so the reader first sees why an overnight rate matters for long rates.
- Asset prices split into equity + houses (ch8) and FX (ch9).
- Dropped as unverified: the 2019 repo spike, an ECB corridor-width example, the 2024 yen carry unwind.
- Added ch13 (questions), and a balance-sheet chart in ch10.

## Data (shipped in `data.js`, built by a scratch script from FRED CSVs)
URL pattern `https://fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>`, all retrieved 2026-11-11: FEDFUNDS, PCEPILFE, GDPC1, GDPPOT, GS10, TB3MS, USREC, THREEFYTP10, DGS1/2/3/5/7/10/20/30, WALCL, ECBASSETSW, A091RC1Q027SBEA, FYGFDPUN, GDP, T10Y3M, MORTGAGE30US, ECBDFR, DFEDTARU. `tests/models.cjs` reproduces: FEDFUNDS 1990Q1, 2008Q4, 2026Q3 quarterly means; core PCE 2026Q3 y/y from the index levels; output gap 2026Q3; GS10 − TB3MS 1990-01 and 2026-10; USREC 2026-10; DGS10 2021-12-31, DGS1/DGS30 2023-06-30; WALCL 2022-03 and 2026-11-04.

## Sources (opened 2026-11-11 unless noted)

| Fact | Source |
|---|---|
| FOMC 2026-09-16 hike to 3.75–4.00 | https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm |
| IORB 3.90, ON RRP 3.75, SRF/primary credit 4.00 | https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a1.htm |
| FOMC 2026-10-28 hold | https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm |
| SEP Sept 2026 (4.1 end-2026, 3.2 longer run) | https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm |
| r* (LW 1.65, HLW 1.01, HLW euro area 0.09; 2026Q2) | https://www.newyorkfed.org/research/policy/rstar and the LW/HLW xlsx files there |
| ECB 2026-09-10 decision, staff projections 3.0/2.5/2.1 | https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html |
| BoE November 2026 MPR (4 %, 8–1, CPI 3.5 %) | https://www.bankofengland.co.uk/monetary-policy-report/2026/November-2026 |
| BoJ 1.25 %, held 2026-10-30 | https://www.boj.or.jp/en/index.htm |
| Powell 2025-08-22 framework speech | https://www.federalreserve.gov/newsevents/speech/powell20250822a.htm |
| SVB review (duration 6.2 yr, 94 % uninsured) | https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf |
| Gagnon, Raskin, Remache, Sack (2011) | https://www.newyorkfed.org/research/epr/11v17n1/1105gagn.pdf |
| NBER chronology (last peak Feb 2020) | https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions |
| CBO 2026–2036 outlook (101 → 120 %) | https://www.cbo.gov/publication/62207 — 403 to our fetcher; figures taken from CRS https://www.everycrsreport.com/reports/IN12232.html and CRFB/PGPF summaries |
| Search results only (not opened at a primary page): FDIC Q4 2022 $620 bn; ECB strategy assessment 2025-06-30; Fed QT end 2025-12-01; euro-area HICP Oct 2026 4.0 % flash; PBoC 7-day 1.40 % and LPR 3.0/3.5; China CPI 0.7 %; European Parliament 416–169–22 on 2026-07-09; EO 14178; BIS AER 2026; Bernanke–Blanchard; Hazell et al.; Benigno–Eggertsson; Glaeser et al.; Laubach; Fonseca–Liu | web search 2026-11-11, each cross-checked in at least two independent results |

## Facts that will go stale
All live in the `FRONTIER FACTS` block in `models.js` (and the prose of ch5 p3, ch6 p4, ch10 p4, ch11 p4, ch12 p2/d1–d5, which the node test ties to that block): policy rates and dates for Fed, ECB, BoE, BoJ, PBoC; IORB/ON RRP/SRF; EFFR 3.88 (Oct 2026); core PCE 3.1 % (Sep 2026); r* estimates (2026Q2); SEP medians (Sep 2026); Kim–Wright TP 0.87 (2026-11-06); 10y–3m 0.68 (2026-11-10); output gap 1.7 (2026Q3, current CBO vintage); r_eff 4.04, g 6.31, debt 97.4 % (2026Q2); CBO 101 → 120 %; 10y 4.88 (2026-11-09); mortgage 7.18 (2026-11-05); balance sheets 6.75 tn USD (2026-11-04), 5.91 tn EUR (2026-11-06); ECB projections; digital-euro vote. `data.js` should be regenerated at the same time.

## Checked / not checked
- Checked: every prose number derived from models/data in `tests/models.cjs`; data points against the raw FRED CSVs; NK closed form against the model equations; bootstrapped factors reprice par bonds to 100; DDM closed form against an explicit sum; every live-sentence branch reached at control extremes with all placeholders filled.
- Not checked against a primary page: the "search results only" row above; CBO figures (site blocked); FOMC vote counts are deliberately not stated on the page; the BoE 8–1 split is from the November MPR page.
- Not verified: that the 2021Q4 output gap as seen in real time differed by any particular amount (no number given on page).
