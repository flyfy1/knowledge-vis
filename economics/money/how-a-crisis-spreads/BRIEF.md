# BRIEF · economics/money/how-a-crisis-spreads（一家出事，为什么全市场一起缺钱 / How a Crisis Spreads）

Builder: Claude Code (claude-opus-5-5, thinking: unavailable). Essay N4 of specs/essay-briefs/TASK-econ-series.md (§3.11 N4; §3 Q3
reference brief, models; §4.F for what F `why-banks-run` keeps). Stage: university. Template essay (content.zh.md + page.json with
"layout"), not yet started as files.

## Status at wrap-up 2026-11-25

- **Done:** orientation (brief, F's draft, D's template files), the chapter plan and the model design below (each model's
  equations derived by hand, one of them the shared "loop gain" that ties ch3, ch4 and ch6 together), and source checking
  for the case and frontier chapters (list below, every item opened on 2026-11-25 unless marked).
- **Not done:** no content.zh.md, content.en.md, page.json, models.js, bindings.cjs, figures, tests or REGISTRY.json yet.
  The page does not build because it has no page.json; nothing in the shared files refers to it. English: not started.
- **Unverified:** every model number below is a design target, not yet computed by code. Several academic citations are
  from memory (marked "memory"); check them before they go into prose.
- **Overlap found, for the lead/registrar:** F's draft (`why-banks-run`, 2026-11-25 working tree) already has a full lab
  in its chapter 甩卖与传染 (eight banks, one common asset, leverage targets, ring lending, price impact) and a repo
  diagram plus the 2008 repo-run story in 影子银行与 2008 年. §4.F allowed one paragraph each. This essay does not rebuild
  that ring model; its models below are distinct (haircut fixed point, leverage-targeting toggle, multi-asset common
  holdings, true Eisenberg–Noe clearing, Minsky classifier, tranche model). F has no tranche model (checked its
  models.js), so `securitisation-shadow-banking` belongs here.
- **Links:** F, D, I, H, B and the derivatives draft are unregistered, so `[[…]]` cannot point at them yet
  (site-template §9a step 6). Name them in plain text and link them at registration. Live targets checked in
  site-registry.json: bank-run (where-money-comes-from#ch3), loans-create-deposits (#ch2), money-as-iou (#ch1),
  bond-duration-convexity (why-one-rate-moves-everything#ch2), reserves-floor-system (#ch5), zero-lower-bound-qe (#ch10),
  feedback (inverted-pendulum#step2), graph-algorithms (#step1), diversification (#step1), supply-demand (#step0),
  game-theory (#step0), risk-return (#step3), stocks-bonds (#step5).

## One question

没有储户排队的地方，挤兑是怎么发生的？一家机构的损失，怎么变成所有人的损失？

## Chapter plan (changed from the brief: fire sales and leverage targeting swapped, so the rule comes before its market effect)

| # | Title (working) | Model / diagram | Concept |
|---|---|---|---|
| 1 | 拿掉存款的银行 | F's bank in three sentences (link F by name; where-money-comes-from#ch3), then a dealer funded by repo. Diagram dg-bs: bank vs dealer balance sheet | — |
| 2 | 回购：一笔带抵押、打折扣的借款 | Diagram dg-repo (two legs, $100 bond, haircut 2% → $98 cash). Exact calculator: max leverage 1/h | `collateral-haircut-repo` |
| 3 | 折扣率就是杠杆上限，所以折扣率上升就是挤兑 | **Haircut spiral** (below). Diagram dg-loop. Gorton–Metrick haircut index | `fire-sales-liquidity-spiral` |
| 4 | 为什么机构追涨杀跌：杠杆目标 | **Leverage targeting** toggle (target / passive / rebalancer). Upward-sloping demand, link supply-demand | `procyclical-leverage` (new id) |
| 5 | 甩卖找上不相干的人：共同持仓 | **Common holdings** (GLT 2015 style, 5 funds × 5 assets, overlap ω). Diagram dg-overlap | `common-holdings-contagion` (new id) |
| 6 | 对冲也会被追保：2022 年英国养老金 | LDI collateral-call spiral, the ch3 gain in yield units; central-bank buyer toggle. Diagram dg-ldi | attach to `margin-leverage-central-clearing` (derivatives draft) as an extra lesson; no new node |
| 7 | 谁欠谁：一张网 | **Eisenberg–Noe clearing**, ring↔complete mix c, shock size. Diagram dg-net | `contagion-financial-network` |
| 8 | 平静孕育杠杆：明斯基 | **Minsky classifier** plus VaR-haircut table. Diagram dg-minsky | `credit-cycle-minsky` |
| 9 | 证券化：把风险切片 | **Tranche model** (Vasicek large pool). Diagram dg-tranche. Link diversification; D's lemons by name | `securitisation-shadow-banking` |
| 10 | 2020 年 3 月：连美债都卖 | Worked case through the ch3/ch4/ch5 models; diagram dg-2020 | `dash-for-cash-2020` (new id) |
| 11 | 前沿在哪（2026 年 11 月） | 已确立 / 已演示 / 某方声称 | `non-bank-intermediation-leverage` |
| 12 | 听到"风险可控"时问的五件事 | — | — |

That is 9 concepts, at the 8–9 cap.

## Models (equations; numbers still to be computed and pinned)

1. **Haircut spiral (ch3).** The dealer holds q₀ = 100 units at P₀ = 1 on equity E₀ = 2 (repo debt D₀ = 98, at the
   2% haircut limit). The haircut rises to h₁. Sales S are units sold; price P(S) = P₀e^(−κS); proceeds
   ∫₀^S P = P₀(1 − e^(−κS))/κ. Equity E(S) = (q₀ − S)P(S) − D₀ + P₀(1 − e^(−κS))/κ. The constraint is
   (q₀ − S)P(S) ≤ E(S)/h₁. The answer is the smallest S ≥ 0 that satisfies it. The monotone iteration
   S_{n+1} = q₀ − E(S_n)/(h₁P(S_n)) from S₀ = 0 converges to it; this is the "rounds" view in the lab. The dealer
   fails if E reaches 0 first. With κ = 0, required sales = A − E/h (100 − 2/0.04 = 50).
   **Local loop gain**, derived: at the constraint q = E/(hP), with dE = q·dP and dP = −κP·ds, the extra units that must be
   sold per unit sold are g = κ·q·(1/h − 1) = κ·q·(L − 1). The spiral settles if g < 1 and runs away if g ≥ 1. Pin with
   a fine sweep: the κ above which no fixed point with E > 0 exists. Lab slider: price impact in bp per 1% of holdings
   sold (κ = b/10⁴ per unit), so g₀ = 0.24·b at h = 4%. Check this number in code before it goes into prose.
2. **Leverage targeting (ch4, Adrian–Shin).** log P = log V + λ(q − q̄). The targeter's rule: q = L(q_prev·P − D_prev)/P,
   D updated by (q − q_prev)·P. Passive: q is fixed. Rebalancer: a constant wealth share. Linearised, the amplification is
   dlogP/dlogV = 1/(1 − g) with g = λq₀(L − 1), the same gain as ch3; ΔA = L·ΔE. Each period, solve the fixed point
   nonlinearly by bisection. The V path is deterministic (a rise, then a fall).
3. **Common holdings (ch5, Greenwood–Landier–Thesmar 2015).** Fund i has assets a_i, leverage b_i and weights
   m_i = (1 − ω)e_i + ω·uniform. A return shock f to asset 0 gives loss_i = a_i Σ_k m_ik f_k. Each fund sells b_i·loss_i
   pro rata (ch4's rule); the price impact on asset k is ℓ·sales_k/size_k. Run rounds until there are no new sales;
   equity ≤ 0 means full liquidation. At ω = 0 there is no spillover. Find out by computing whether failures are
   non-monotone in ω; do not assert it beforehand.
4. **LDI spiral (ch6).** Funds with exposure L·NAV in long gilts (duration D). A yield rise Δy costs L·D·Δy of NAV.
   Restoring the buffer means recapitalising a fraction ρ of the shortfall (slow) and selling the rest; sales s raise
   yields by κ·s. Gain g = κ·(sales per bp). Toggle: a central-bank buyer with a cap. Stylised, not calibrated; the
   real figures are only the ones sourced below.
5. **Eisenberg–Noe (ch7).** N = 10, a regular network Π = (1 − c)·ring + c·complete (Acemoglu–Ozdaglar–Tahbaz-Salehi 2015
   setting), senior outside debt v paid first. p_i = min(p̄_i, max(0, e_i + Σ_j Π_ji p_j − v_i)), solved by
   fixed-point iteration / fictitious default. Shock bank 0 by s. Optionally a default-cost parameter (Rogers–Veraart),
   declared if used. Write "robust-yet-fragile" only if the seeded model shows complete beating ring for small s and
   losing for large s.
6. **Minsky classifier (ch8).** Debt-to-cash-flow m, lognormal with median m₀(1 + γ)^n after n calm years and σ fixed.
   Hedge if m ≤ 1/(r + a), speculative if 1/(r + a) < m ≤ 1/r, Ponzi if m > 1/r (a = 1/T amortisation). The shares are
   exact Φ expressions, so tests are closed-form. A VaR haircut h = z·σ·√(10/250) links calm (low σ) to the ch3 leverage
   1/h.
7. **Tranches (ch9, Vasicek).** Large pool; default fraction X = Φ((Φ⁻¹(p) − √ρ·Z)/√(1 − ρ)); loss = LGD·X. Tranches
   are 0–5%, 5–15% and 15–100%. P(senior hit) = Φ((Φ⁻¹(p) − √(1 − ρ)·Φ⁻¹(a/LGD))/√ρ). Expected tranche loss by
   quadrature. Show that raising ρ raises senior risk sharply while equity's expected loss falls (Coval–Jurek–Stafford
   2009).

## Sources checked (opened 2026-11-25)

- Gorton & Metrick, "Securitized Banking and the Run on Repo" (NBER w15223; JFE 104(3), 2012, 425–451). Working-paper
  text: the haircut index (excluding Treasuries) "rises from zero in early 2007 to nearly 50 percent at the peak of the
  crisis in late 2008"; some asset classes stopped being accepted (= 100% haircut); repo market "may be about $12
  trillion" (with double counting) vs US bank assets of $10 trillion. https://repec.som.yale.edu/icfpub/publications/2358.pdf
- Bank of England Quarterly Bulletin, "Financial stability buy/sell tools: a gilt market case study" (20 Nov 2023):
  30-year gilt yields +130 bp in three trading days to 28 Sep 2022, ~3× any comparable historical move; purchases
  28 Sep–14 Oct 2022 of £19.3bn (£12.1bn conventional, £7.2bn index-linked; linkers added 11 Oct); sold back over 12
  trading days, 29 Nov 2022–12 Jan 2023; 30y bid-ask from ~0.5 bp (22 Sep) to 2.5 bp (11 Oct); the "adverse feedback
  loop" description. https://www.bankofengland.co.uk/quarterly-bulletin/2023/2023/financial-stability-buy-sell-tools-a-gilt-market-case-study
- Cunliffe letter to the Treasury Committee, 5 Oct 2022: the 28 Sep announcement cut 30-year yields by more than 100 bp
  that day (search summary; letter not opened in full).
- Bank staff paper "LDI minimum resilience" (29 Mar 2023): LDI funds should withstand at least ~250 bp; Dec 2022 funds
  could withstand ~300–400 bp. https://www.bankofengland.co.uk/financial-policy-summary-and-record/2023/bank-staff-paper-ldi-minimum-resilience
- He & Krishnamurthy, NBER Reporter 2020 no. 3 (19 Oct 2020): 9–18 Mar 2020, 10-year yield +~60 bp (return −4.9%)
  while US stocks fell 19.3%; foreign sales of long-term Treasuries in 2020 ~$311bn; Fed purchases of long-term
  Treasuries $419bn (3.4%); funds bought $266bn of bills. https://www.nber.org/reporter/2020number3/are-us-treasury-bonds-still-safe-haven
- Garbade & Keane, Liberty Street Economics (20 Aug 2020): $1.77 trillion of Treasuries and $892bn of agency MBS bought
  13 Mar–31 Jul 2020, more than $100bn on some days. https://libertystreeteconomics.newyorkfed.org/2020/08/market-function-purchases-by-the-federal-reserve
- NY Fed FAQs: 15 Mar 2020 directive "at least $500 billion" Treasuries; 23 Mar "in the amounts needed".
  https://www.newyorkfed.org/markets/treasury-reinvestments-purchases-faq-200315 and …-200323 (search summaries).
- Fed press release 1 Apr 2020: Treasuries and reserves temporarily excluded from the SLR of holding companies until
  31 Mar 2021. https://www.federalreserve.gov/newsevents/pressreleases/bcreg20200401a.htm (search summary).
- Schrimpf, Shin & Sushko, BIS Bulletin 2 (2 Apr 2020): forced deleveraging of leveraged relative-value investors in
  Treasuries in mid-March 2020. https://www.bis.org/publ/bisbull02.htm
- FSB, Holistic Review of the March Market Turmoil (17 Nov 2020): dealers struggled to absorb sales; sales by
  leveraged nonbanks and foreign holders. https://www.fsb.org/2020/11/holistic-review-of-the-march-market-turmoil/
- Duffie, "Still the World's Safe Haven?" Hutchins WP 62 (May 2020): Treasury market outgrowing dealer balance sheets
  (search summary only).
- FSB Global Monitoring Report on NBFI 2025 (16 Dec 2025; 2024 data, 29 jurisdictions): NBFI $256.8 trillion = 51% of
  global financial assets (second highest on record); NBFI +9.4% vs banks +4.7%; OFIs +11% to $169.4tn; narrow measure
  +12% to $76.3tn (15.4% of total financial assets); "severe limitations" in private-credit data.
  https://www.fsb.org/2025/12/fsb-reports-continued-growth-in-nonbank-financial-intermediation-in-2024-to-256-8-trillion/
- OFR blog, Berg & Stemp (19 Aug 2026; data Q4 2025): hedge funds' cash Treasuries ~$2.0 trillion, a record 7% of
  marketable debt ($28.9tn); short Treasury futures $1.4tn; outside basis-trade estimates $350bn–$1.5tn.
  https://www.financialresearch.gov/the-ofr-blog/2026/08/19/hedge-funds-cash-treasury-holdings/
- Fed FSR May 2026, leverage section: hedge fund gross leverage near record highs (2025:Q3); cash-futures basis trade
  down, "largely offset by other relative value trades, such as swap spread trades"; bank commitments to nonbank
  financial firms $2.6tn (2025:Q4). https://www.federalreserve.gov/publications/2026-may-financial-stability-report-leverage.htm
- Fed FSR Nov 2026 (13 Nov 2026, data to 28 Oct): PDF opened but its text could not be extracted (font-encoded); the
  "record hedge fund leverage" claims come from press coverage only. **Do not cite them as Fed text until checked.**
  F already cites this report's runnable-liabilities figures.
- IMF GFSR Oct 2026 (13 Oct 2026), landing page: ch2 "hedge funds and financial stability"; hedge funds hold "about
  $13 trillion in assets, more than three times their 2013 level"; "leverage, crowded positions, and correlated
  investor redemptions can trigger synchronized deleveraging"; private-credit leverage and contingent liquidity risks.
  https://www.imf.org/en/publications/gfsr/issues/2026/10/13/global-financial-stability-report-october-2026
- SEC Treasury clearing page: compliance 31 Dec 2026 (cash) and 30 Jun 2027 (repo), each extended one year in Feb 2025;
  an Uyeda statement (Sep 2025) said no further extensions are intended; an Aug 2026 SEC update and SIFMA (Nov 2026,
  search summary) say cash is broadly ready and repo is harder. https://www.sec.gov/featured-topics/treasury-clearing-implementation
- BoE SWES final report (29 Nov 2024): firms' collective actions amplify the initial shock (summary only); a second
  SWES on private markets launched Dec 2025 (summary only).

From memory, still to check: Eisenberg & Noe 2001 (Mgmt Sci 47(2)); Acemoglu, Ozdaglar & Tahbaz-Salehi 2015 (AER 105(2));
Adrian & Shin 2010 (JFI 19(3)); Brunnermeier & Pedersen 2009 (RFS 22(6)); Shleifer & Vishny 2011 (JEP 25(1));
Greenwood, Landier & Thesmar 2015 (JFE 115(3)); Coval, Jurek & Stafford 2009 (JEP 23(1)); Minsky 1992 (Levy WP 74);
Geanakoplos 2010 (NBER Macro Annual); Haldane 2009 "Rethinking the financial network"; Vasicek 2002.

## Proposed concepts (REGISTRY, ids and anchors)

`collateral-haircut-repo` #ch2 · `fire-sales-liquidity-spiral` #ch3 · `procyclical-leverage` #ch4 (new) ·
`common-holdings-contagion` #ch5 (new) · `contagion-financial-network` #ch7 · `credit-cycle-minsky` #ch8 ·
`securitisation-shadow-banking` #ch9 · `dash-for-cash-2020` #ch10 (new) · `non-bank-intermediation-leverage` #ch11.
Ch6 is an extra lesson for `margin-leverage-central-clearing`. Alias conflict to settle with F: 影子银行 / what is
shadow banking (F's ch7 title vs this id).

## Proposed edges

From §1.12: `leverage-balance-sheet>collateral-haircut-repo:foundation`, `margin-leverage-central-clearing>collateral-haircut-repo:foundation`,
`collateral-haircut-repo>fire-sales-liquidity-spiral:foundation`, `feedback>fire-sales-liquidity-spiral:connection`,
`supply-demand>fire-sales-liquidity-spiral:connection`, `maturity-liquidity-transformation>securitisation-shadow-banking:foundation`,
`diversification>securitisation-shadow-banking:foundation`, `lemons-market>securitisation-shadow-banking:connection`,
`leverage-balance-sheet>credit-cycle-minsky:foundation`, `loans-create-deposits>credit-cycle-minsky:foundation`,
`fire-sales-liquidity-spiral>contagion-financial-network:foundation`, `graph-algorithms>contagion-financial-network:connection`.
Own chain: `fire-sales-liquidity-spiral>procyclical-leverage:foundation`, `procyclical-leverage>common-holdings-contagion:foundation`,
`common-holdings-contagion>contagion-financial-network:connection`, `collateral-haircut-repo>credit-cycle-minsky:connection`
(VaR haircuts), `fire-sales-liquidity-spiral>dash-for-cash-2020:application`, `procyclical-leverage>dash-for-cash-2020:application`,
`zero-lower-bound-qe>dash-for-cash-2020:connection`, `contagion-financial-network>non-bank-intermediation-leverage:connection`,
`bank-run>collateral-haircut-repo:connection`; and to I: `fire-sales-liquidity-spiral>stablecoin-run-depeg:connection`.
