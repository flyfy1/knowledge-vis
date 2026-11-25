# BRIEF · why-banks-run 银行为什么会挤兑：杠杆、流动性与金融危机

- Built-By: Claude Code (claude-opus-5-5, thinking: on, effort unavailable), econ knowledge-graph round 2026-11-25
- Verified-By: self-check only (independent review pending). Covered: `tests/models.cjs` (214 checks), `tests/browser.cjs`
  (zh, 1280 and 390, no console errors, no overflow, targets, each model driven once), `build-pages.cjs --check`,
  screenshots of the four labs and five diagrams at 1280/390. Not covered: 320 px, English, canvas text sweep.
- Template essay (content.zh.md → index.html, copy.*.js, refs.json). Draft: page.json has no `status`.
  English: `content.en.md` is a structural stub (a copy of the Chinese, `"languages": {"en": "stub"}`); left for a
  translation pass. Diagram label room: `node scripts/build-pages.cjs --print-budgets economics/money/why-banks-run`.
- Category `economics`, subtopic `money`, stage `university`.

## The question

Why can a bank that made no bad loans fail in two days, while an insolvent one can carry on for years? Every chapter
answers part of it: the balance sheet (why banks fear runs), leverage (how thin the cushion is), illiquid vs insolvent,
the run as a coordination game, interest-rate risk (SVB), contagion and 2008 (briefly), the defences, the 2026 frontier,
five questions to ask about a bank.

## Changes from the assigned ladder

- **Fire-sale contagion network toy dropped** after the concept-ownership addendum (TASK-econ-series.md §4.F: repo,
  fire sales and contagion are N4's, one paragraph each at most). Ch6 now merges fire sales, shadow banks/repo and 2008
  into one prose chapter with two diagrams and no model. Stale files that should be deleted by the lead (I may not
  delete): `figures/ch6-model.html`, `figures/ch8-model.html` (renamed to `ch7-model.html`); they are not referenced.
- Stablecoin runs: one "已演示" item (USDC/SVB 2023) and a GENIUS Act fact; no stablecoin page exists, so plain text.
- Added a fourth model (LCR vs a social-media-speed run) in the defences chapter.

## Chapters and models

| # | Law (short) | Model / diagram | Limits stated |
|---|---|---|---|
| 1 | Deposits short, assets long | dg-bs (balance sheet), dg-mat (maturity mismatch) | — |
| 2 | Leverage L: a 1/L fall wipes equity; equity moves L× | lab: assets 100, equity 100/L; loss → equity, new leverage, **assets to sell to restore L** (= A1 − L·E1). 30×, 2%: equity −60%, leverage 73.5×, sell 58 (59%). dg-cushion to scale | one asset; no risk weights; upside not drawn |
| 3 | Illiquid ≠ insolvent, and each turns into the other | dg-quad | — |
| 4 | Two equilibria | lab: Diamond–Dybvig. π = 0.2, λ = 0.2, R = 1.3, fire-sale value s, loss on R, insured share q, LOLR at penalty 1.1. Payoffs: wait = remaining t=2 value / (1−w); run = 1, or V/w once the bank cannot pay (pro-rata approximation of sequential service). Smoothed best response (h = 0.03), half revise each round. Default belief 30% > tipping belief 25% → run; 20% → calm. s 0.8 / 0.4 → 48% / 12%; insurance > 74% removes the run; LOLR removes it on a sound bank; loss > 23% (= 1 − 1/R) is insolvency, LOLR cannot help. dg-dd | no timing of runs; global games noted (Goldstein–Pauzner 2005) |
| 5 | Unrealised losses become real when depositors leave | lab: SVB 31 Dec 2022 (assets 211.8, cash 13.8, equity 16.0, deposits 173.1, uninsured 94%), bonds bought at 1.5% repriced as zero-coupon, T = 6.2. Δy 2.5 pp → −14.0%, MTM loss 16.3, MTM equity −0.3; break-even Δy 2.45 pp (between 2022's 10y +2.36 and 2y +3.68). 25% bonds → 8.6 left, 6.1 pp. Run 25% of uninsured ≈ $40.7bn. dg-svb to scale (test checks rect widths) | zero-coupon; no hedges, prepayment or deposit franchise value |
| 6 | Runs hit non-banks; fire sales spread (prose only) | dg-spiral, dg-repo | toy network not built (N4) |
| 7 | Insurance, LOLR, capital & liquidity rules | lab: LCR with Basel run-offs (5/10/40%) vs uninsured outflow per day. SVB-like mix 6/0/94, HQLA 40 → outflow 37.9, LCR 106%, 1.7 days at 25%/day. dg-def | the cost of regulation |
| 8 | Frontier (已确立 / 已演示 / 研究与各方说法) | — | dated, sourced |
| 9 | Five questions | — | — |

## Sources (checked 2026-11-25 unless noted)

- Fed, *Review of the Federal Reserve's Supervision and Regulation of Silicon Valley Bank*, 28 Apr 2023,
  https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf — table 1 (securities 55% vs 25%, uninsured
  94% vs 41%, CET1 12%); HTM duration 6.2 y; 8 Mar: sold $21bn AFS, $1.8bn after-tax loss, $2.25bn raise; 9 Mar "over $40
  billion", "over $100 billion more" expected, ~85% of deposits; WaMu $19bn/16 days, Wachovia $10bn/8 days; LCR not yet
  applied (transition), ~9% HQLA shortfall under full pre-2019 LCR (Dec 2022); "fueled by social media".
- SVB Financial Group FY2022 10-K balance sheet, https://www.sec.gov/Archives/edgar/data/719739/000071973923000021/R3.htm —
  assets 211,793; cash 13,803; AFS 26,069; HTM 91,321 (fair 76,169); loans 73,614; deposits 173,109; SVBFG equity 16,004 ($m).
- 2021/2022 year-end Treasury yields (10y 1.52→3.88, 2y 0.73→4.41): FRED, as cited and sourced on
  why-one-rate-moves-everything ch2 (not re-fetched).
- Lehman 2007 annual report (FY ended 30 Nov 2007): assets $691,063m, equity $22,490m, leverage 30.7× (assets/equity),
  via search result quoting the report (mattmg83.github.io copy and SEC 10-K a08-3530); not opened directly.
- 《存款保险条例》第五条 (50 万元, principal + interest combined per depositor per institution; effective 2015-05-01):
  gov.cn / local-government reprints via search; not the gov.cn original page.
- PBoC via Xinhua (2026-09-10): 2,912 insured institutions at end-June 2026, 99%+ of depositors fully covered
  (finance.eastmoney.com/a/202609093869643186.html, via search).
- FDIC $250,000 standard limit: well established; not re-fetched.
- Basel III: CET1 4.5%, conservation buffer 2.5%, leverage 3%, LCR ≥ 100% — Basel Framework (bis.org), not re-fetched;
  LCR run-offs 5% (stable), ≥10% (less stable), 25% operational, 40% non-financial corporate — Basel LCR40 and ECB
  Macroprudential Bulletin Dec 2023 (via search). The 100% financial-institution rate was not confirmed and is not used.
- FINMA 19 Mar 2023 (AT1 ≈ CHF 16bn); Swiss Federal Administrative Court B-2334/2023, decision 1 Oct 2025, press
  release 14 Oct 2025, not final (https://www.bvger.ch/en/newsroom/media-releases/unlawful-write-off-of-at1-capital-instruments-2385).
- FDIC Bank Failures in Brief 2026 (https://fdic.gov/resources/resolutions/bank-failures/in-brief/2026): six failures,
  Nano Banc 25 Sep 2026 $736m; 2025: two (via search coverage, not the FDIC 2025 page).
- Fed *Financial Stability Report*, Nov 2026 (data to 28 Oct 2026),
  https://www.federalreserve.gov/publications/files/financial-stability-report-20261113.pdf — runnable liabilities $28,157bn
  (87% of GDP), uninsured deposits 7,969, repo 6,765, MMFs 7,900; LCR ~120% of requirement; HTM long MBS at large banks;
  private credit vehicles ~$350bn (2012) → >$2.6tn (2025), ~$1.5tn loans, ~6% of nonfinancial business debt; stablecoins
  ~$310bn, ~99% USD; GENIUS Act effective 18 Jan 2027.
- ECB FSR special feature May 2026 (First Brands, Tricolor, BDC redemptions; systemic instability "unlikely at present");
  Bank of Canada FSR 2026 (private credit–bank links): via search summaries only.
- USDC: $3.3bn at SVB; trough ~$0.87–0.88 (CryptoCompare $0.8726; Fed FEDS Note 17 Dec 2025 says 86 cents). Prose says
  "约 0.87".
- 2023 failure dates (SVB 10 Mar, Signature 12 Mar, First Republic 1 May): FDIC 2023 list via search.
- Theory citations from memory, standard: Diamond & Dybvig 1983 JPE 91(3); Goldstein & Pauzner 2005 JF 60(3);
  Brunnermeier & Pedersen 2009 RFS 22(6); Gorton & Metrick 2012 JFE 104(3); Greenwood, Landier & Thesmar 2015 JFE 115(3)
  (no longer cited in prose after the ch6 cut, still in footer); Bagehot 1873; Nobel 2022.

## Not checked

- Historical narrative facts stated from memory: Northern Rock Sept 2007, Bear Stearns Mar 2008, Lehman filing 15 Sep 2008,
  Reserve Primary Fund 16 Sep 2008, Treasury MMF guarantee, BTFP at par and the systemic-risk exception on 12 Mar 2023,
  SVB asset growth "~$71bn to >$200bn" (Fed review says $71bn → over $211bn, 2019–2021 period; prose rounds).
- Cookson et al. 2023 (social media and the SVB run) cited from memory as a working paper.
- English text (stub).

## Concepts and edges (for the registrar)

Concepts in REGISTRY.json: `maturity-liquidity-transformation` (#ch1), `leverage-balance-sheet` (#ch2),
`bank-run-diamond-dybvig` (#ch4), `interest-rate-risk-banking-book` (#ch5), `capital-requirements-lender-of-last-resort`
(#ch7), `bank-runs-frontier-2026` (#ch8). `securitisation-shadow-banking` left for N4. Alias moves requested:
银行为什么会倒 / 挤兑是怎么发生的 from `bank-run` to `bank-run-diamond-dybvig` (already listed on mine; remove from the
intro if present); 硅谷银行为什么倒闭 / why did silicon valley bank fail from `bond-duration-convexity` to
`interest-rate-risk-banking-book`.

Edges: `stocks-bonds>leverage-balance-sheet:foundation`, `risk-return>leverage-balance-sheet:foundation`,
`loans-create-deposits>maturity-liquidity-transformation:foundation`, `bank-run>maturity-liquidity-transformation:foundation`,
`bank-run>bank-run-diamond-dybvig:foundation`, `game-theory>bank-run-diamond-dybvig:foundation`,
`bond-duration-convexity>interest-rate-risk-banking-book:foundation`, `leverage-balance-sheet>interest-rate-risk-banking-book:foundation`,
`leverage-balance-sheet>capital-requirements-lender-of-last-resort:foundation`,
`bank-run-diamond-dybvig>capital-requirements-lender-of-last-resort:foundation`,
`moral-hazard>capital-requirements-lender-of-last-resort:foundation`,
`bank-run-diamond-dybvig>maturity-liquidity-transformation:connection`,
`maturity-liquidity-transformation>interest-rate-risk-banking-book:foundation`,
`interest-rate-risk-banking-book>capital-requirements-lender-of-last-resort:application`; suggested extra:
`signaling>interest-rate-risk-banking-book:connection` (SVB's capital raise read as a signal).

Links still to add once targets are live: when-buyers-cant-see-quality ch6 (signaling) and ch7 (moral hazard) are named in
plain text in ch5 and ch6; credit-spread-triangle, sovereign-default-restructuring, margin-leverage-central-clearing,
lemons-market not linked (drafts or absent).

## Status at wrap-up 2026-11-25

- **Done:** zh essay, 9 chapters, 4 models (leverage, Diamond–Dybvig, SVB rate risk, LCR vs fast run), 9 diagrams;
  frontier chapter with 已确立 / 已演示 / 研究与各方说法. `build-pages.cjs <dir>` and `--check` pass;
  `tests/models.cjs` 218/218; `tests/browser.cjs` passed (zh 1280/390, own in-process server) before the last prose
  edits; the last edits were text only, plus one binding.
- **Missing:** English (`content.en.md` is a stub copy of zh, `languages.en = "stub"`). There is no fire-sale network
  model (N4 owns it). The two stale partials `figures/ch6-model.html` and `figures/ch8-model.html` need deleting.
  Prose units: ch5/ch8 use "十亿美元" while ch2/ch8 use "亿美元"; unify them in a later pass.
- **Unverified:** 320 px, the canvas text sweep, a reduced-motion pass, and the 390 screenshots of dg-quad, dg-mat,
  dg-spiral and dg-repo (the repo return arrow may cross the dealer box). The `ch4.out.lolrok` readout probably
  never shows, because the app tests the final w. browser.cjs checks targets at 44 px, while the site rule is 48.
  REGISTRY aliases were not grepped for exact collisions with other concepts (e.g. 杠杆). The facts listed under
  "Not checked" above are also unverified.
- **Proposed concepts and edges:** see "Concepts and edges" above.
