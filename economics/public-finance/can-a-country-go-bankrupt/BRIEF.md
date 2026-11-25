# BRIEF — 国家会破产吗 / Can a Country Go Bankrupt?

- Author: Claude Code sub-agent (claude-opus-5-5, thinking: default), 2026-11-25, econ knowledge-graph round. Not yet reviewed.
- Path: `economics/public-finance/can-a-country-go-bankrupt/` — **new subtopic `public-finance` (公共财政 / Public finance)**, to be added to `pages.config.js` KNOWLEDGE_SUBTOPICS by the registrar.
- Template essay (content.zh.md + page.json with layout). page.json has no `status` (draft); `"languages": {"en": "stub"}`.

## The question
国家会不会像公司那样破产？Answer built over the chapters: a state that borrows in a currency it issues is almost never forced to default, but can push the cost onto people by inflation, taxes or spending cuts; states borrowing in foreign currency, or in a currency they cannot issue (euro members), do default, and have.

## Chapters and models
| # | Chapter | Model / diagram | Closed form / check |
|---|---|---|---|
| ch1 | 家里的账和国家的账 | dg-ledger | — |
| ch2 | 赤字是水龙头，债务是浴缸 | dg-budget (to scale, US FY2026) | deficit = interest + primary |
| ch3 | r − g：一条方程管住债务比例 | ch3-model (r, g, pb, d0; 50 yr), dg-rg | d′ = d(1+r)/(1+g) − pb; d* = −pb(1+g)/(g−r) if r<g; pb* = d(r−g)/(1+g). Defaults 2/4/−3: d30 125, d* 156; r=g → 190 at 30 yr (matches why-one-rate #ch11) |
| ch4 | 欠谁的，用什么钱欠 | ch4-model (FX share, rollover refusal, reserves, CB backstop; 10 yr), dg-hold | quantity equation with constant velocity; hard-currency buffer; PPP × (1 + 0.5·stop). 0% FX: P×4.2, ratio 19; 100% FX: default yr 4; 50%: yr 7; no backstop: yr 4 |
| ch5 | 违约长什么样 | ch5-model (face cut, cash notes, coupon, maturity, discount), dg-cases | bullet-bond PV; market loss 1 − V/100; SZ haircut vs old bond (4.5%, 6 yr) at same yield. Greek structure at 15%: value 22.8, loss 77%, SZ 62% |
| ch6 | 养老金：一道乘法 | ch6-model (year, retirement age, replacement), dg-payg | τ = (b/w)·(retirees/contributors); stylised population (births boom 1962–75, decline after 1990; Gompertz A 4e−5, B 0.098, e0 ≈ 74; 80% of working-age contribute) |
| ch7 | 延迟退休 | ch7-model (three rules 2025–2075), dg-sched | China schedule approximated as +0.2 yr per calendar year 2025–2040. At 45%: 20.7 → 36.3 (no reform), 27.6 (to 63) in 2050; reform offsets 56% of the rise |
| ch8 | 财政乘数 | ch8-model (c, t, m, monetary offset, rounds), dg-rounds | a = c(1−t) − m; k = (1−θ)/(1−a); break-even for year-one debt ratio k = 1/(t + d). Defaults: a 0.46, k 1.85, ratio 100 → 98.6; θ 0.5: k 0.93 |
| ch9 | 前沿在哪 | ch9-model (US/Japan readings in ch3 equation, rate shift), dg-cn | US pb* −2.1 (vs CBO primary deficit 2.6), 30-yr 109%; Japan pb* −7.5; r = g+1 → +2.0 |
| ch10 | 先问五个问题 | — | — |

All prose numbers are `{=…}` bindings from `bindings.cjs` (95), pinned in `tests/models.cjs` (229 checks), plus re-derivations by closed form.

## Sources (checked 2026-11-25 unless noted)
- US FY2026/FY2025 receipts, outlays, net interest 1,051.8 bn, national defense 965.2 bn (FY2025 970.4 / 916.6): Treasury MTS Table 9 via `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9?filter=record_date:eq:2026-09-30`.
- Debt to the penny (2026-09-30: public 32,425.0 bn, total 40,171.8 bn; 2026-11-23: 32,902.5 / 40,727.4 bn): fiscaldata `v2/accounting/od/debt_to_penny`.
- Average rate on marketable debt 3.570% (2026-10-31): fiscaldata `avg_interest_rates`.
- Foreign holders Sept 2026 (total 9,241.2 bn; Japan 1,063.1; UK 985.8; China 563.9): `https://ticdata.treasury.gov/resource-center/data-chart-center/tic/Documents/slt_table5.txt`.
- US 2026Q2 debt/GDP 97.4, r_eff 4.04, g 6.31; CBO Feb 2026 101 → 120 % (2036), primary deficit 2.6 %; Oct 2026 scenarios 124.4 / 133.1: taken from `economics/money/why-one-rate-moves-everything/BRIEF.md` (not re-fetched; cbo.gov returns 403 to tools).
- Moody's Aaa → Aa1, 2025-05-16: news reports (PBS, Fortune, Al Jazeera), search snippets only.
- Japan gross ≈ 207 %, peak 229, net 186 / 137, r 0.7 vs g 4.5 (2025): Anand & Khan, "Japan's Debt Beyond the Headlines", IMF F&D, 2026-09-01, `https://www.imf.org/en/publications/fandd/issues/2026/09/japans-debt-beyond-the-headlines-anand`.
- JGB holders June 2026 (BoJ 470.0 tn = 46.7 %, foreigners 7.9 %, incl. T-bills 13.1 %): MOF `https://www.mof.go.jp/english/policy/jgbs/reference/Others/holdings01.pdf` (BoJ FoF prelim. 2026-09-17).
- China: retirement decision 2024-09-13 (gov.cn content_6974294, via search summary); hidden debt 14.3 tn end-2023 and 6+4 tn package, 2024-11-08 (MoF press conference, via search summaries of Yicai/People's Daily); 2025 debt 102.5 tn, 73.2 %, legal 68.5 %, central 41.2, local 54.8, hidden 6.5 (State Council report published 2026-08-31, read via CNA `https://www.cna.com.tw/news/acn/202609030200.aspx`); 60+ 23.0 %, 65+ 15.9 % (NBS 2025 communiqué, 2026-02-28, search summary); employer rate 16 % (国办发〔2019〕13号, search); individual 8 % (国发〔2005〕38号, **from memory, not opened**); IMF augmented debt 126.6 (2025) → 135.3 → 153.7 (2030), gov 68.4 (IMF PR 26/53, 2026-02-18, fetched).
- Greece PSI: €356 bn outstanding, €206 bn eligible, 53.5 % nominal cut, ~75 % NPV loss at market prices (RBA SMP May 2012 Box B, via search); ZTG 2013 58–65 % (via search summary); 15 % EFSF + 31.5 % new bonds 2023–42 (standard description, not opened).
- Argentina: ~$82 bn bonds defaulted Dec 2001, 76 % resumed after 2005 exchange (Wikipedia/CRS via search); 2020-05-22 missed ~$500 m; ~$66 bn restructured (S&P via search).
- Sri Lanka: 2022-04-12 suspension, external debt > $50 bn; IMF EFF March 2023 (~$3 bn, **from memory**); bonds Dec 2024 (Sunday Times LK); > 98 % creditors Aug 2025 (treasury.gov.lk via search).
- Russia 1998 GKO default (**from memory**); Reinhart & Rogoff 68 domestic defaults (NBER digest); BoE gilt operation 2022-09-28 (fetched).
- Ramey 2019 JEP 0.6–1 (abstract via search); Auerbach–Gorodnichenko 2012, Ramey–Zubairy 2018, DeLong–Summers 2012, Blanchard 2019, Sargent–Wallace 1981, Eichengreen–Hausmann 1999 (standard citations, not opened).
- IMF Fiscal Monitor Apr 2026: global debt just under 94 % (2025), 100 % by 2029; Japan interest doubles 2025→31 (search summary).

## Status at wrap-up 2026-11-25
**Done:** zh content, 10 chapters, 7 labs, 9 diagrams, models.js, bindings.cjs, app.js, page.css, REGISTRY.json (7 concepts), tests/models.cjs (229/229 pass), tests/browser.cjs. `node scripts/build-pages.cjs <dir>` and `--check` pass; `--all --check` passes (217 pages).

**Browser:** tests/browser.cjs ran against a local server on 18881: 92/96 pass; the 4 failures are English-mode checks (html lang, CJK in English) that are expected while en is a stub. One phone screenshot of the ch4 lab checked by eye: renders; the "年 →" axis label sits close to the "10" tick on narrow screens (cosmetic). The python http.server on port 18881 was started before the no-kill rule and is still running; the lead should stop it.

**Missing / not done:**
- English: `content.en.md` is a structural copy of the zh (stub); needs translation (Haiku pass) and REGISTRY `title.en`/`desc.en` (currently zh placeholders).
- Fan chart (Fable addendum): `debtFan()` exists in models.js (AR(1) r − g, seeded) but is **not wired** into the page, not tested, not in REGISTRY. Concept `debt-sustainability-fan-chart` therefore not registered.
- Must-links from the addendum added: why-one-rate #ch11 (top of ch3), #ch7, how-an-economy-is-measured #ch1, where-money-comes-from #ch2, interest-rates-bonds, scarcity-moves #c8. **Not yet added:** where-money-comes-from #ch3/#ch4/#ch5, why-one-rate #ch4/#ch10, how-an-economy-is-measured #ch2/#ch6/#ch7, risk-pooling, compound-interest, monte-carlo, median-voter.
- No independent review; no canvas-text sweep run.

**Unverified:** items marked from memory above; CBO numbers inherited from the sibling BRIEF.

**Concepts (REGISTRY.json):** deficit-primary-balance #ch2, public-debt-holders-currency #ch4, sovereign-default-restructuring #ch5, pension-paygo-dependency #ch6, retirement-age-levers #ch7, fiscal-multiplier #ch8, public-debt-2026-frontier #ch9. #ch3 deliberately not listed (owned by why-one-rate-moves-everything#ch11 `debt-dynamics-r-minus-g`); aliases r − g / 债务动态 / 债务可持续性 not taken.

**Edges for the registrar (from the addendum):** debt-dynamics-r-minus-g>deficit-primary-balance:connection; gdp-three-ways>deficit-primary-balance:foundation; deficit-primary-balance>public-debt-holders-currency:foundation; inflation-winners-losers>public-debt-holders-currency:foundation; zero-lower-bound-qe>public-debt-holders-currency:connection; public-debt-holders-currency>sovereign-default-restructuring:foundation; debt-dynamics-r-minus-g>sovereign-default-restructuring:foundation; bank-run>sovereign-default-restructuring:connection; deficit-primary-balance>pension-paygo-dependency:connection; risk-pooling>pension-paygo-dependency:connection; pension-paygo-dependency>retirement-age-levers:foundation; spending-is-income>fiscal-multiplier:foundation; gdp-three-ways>fiscal-multiplier:foundation; debt-dynamics-r-minus-g>fiscal-multiplier:connection. (Fan-chart edges omitted: not built.)

Scratch (figure writer, screenshots): `/tmp/agent-tasks/econ-graph/can-a-country-go-bankrupt/`. The figure partials were written by `scripts/figs.cjs` there; they are now plain sources (no page.json generator).
