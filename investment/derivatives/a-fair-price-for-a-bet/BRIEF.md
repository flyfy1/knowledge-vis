# BRIEF — a-fair-price-for-a-bet

Author: Claude Code (claude-fable-5-2), 2026-11-18. Chinese only; `content.en.md` is a structural stub written by
`tools/make-en-stub.cjs` (page.json `"languages": {"en": "stub"}`). Status: draft, not registered, not independently
reviewed. Queue entry: specs/essay-briefs/QUEUE-DEEP2.md §6.

Content limits (from the queue entry): mathematics and market structure only; no trading advice; no claim that any
strategy is profitable; every model is shown with its failures; no forecasts. The hero note and the footer say so, and
tests/models.cjs greps the copy for recommendation wording.

## What the page is

12 chapters, 13 models (labs), 9 static diagrams (each a wide and a narrow SVG). Running example everywhere:
S = K = 100, r = 4%, σ = 20%, T = 1 year (`EX.base`).

1. Forward price is not a forecast. Law: F = S·e^{(r−q)T}. Lab: quote a forward, read the riskless trade. Fig 1: cash-and-carry.
   Real data: the forward read from SPX quotes by parity. Limits: borrowing costs, short-sale limits, storage, convenience yield.
2. Options and put–call parity. Law: C − P = S·e^{−qT} − K·e^{−rT}. Lab: seven combinations of legs. Fig 2: four payoffs.
   Limits: European only; bid–ask; early exercise breaks the equality.
3. One step. Law: price = cost of the replicating portfolio; the real probability does not enter. Lab: move the real
   probability, watch the naive expected value move and the replication cost stay. Fig 3: one-step tree.
4. Many steps (CRR). Result: tree → Black–Scholes at rate about 1/N; American put above European. Lab: convergence
   curve, American switch. Fig 4: the three-step tree with all twenty numbers from the model.
5. Geometric Brownian motion. Result: log-return normal, spread ∝ √T, median below mean. Lab: 30 paths + 4,000 terminals.
6. Black–Scholes formula and PDE. Lab: finite differences against the formula (Crank–Nicolson; explicit scheme and
   its step bound). Fig 5: the stencil. Limits listed: constant σ, continuous trading, no costs, no jumps.
7. Greeks and hedging. Results: hedging error sd ∝ 1/√n; mean P&L = premium difference when realised ≠ priced
   volatility. Labs: Greeks curves; 1,500 hedged paths. Fig 6: the hedging loop.
8. Where it fails. Labs: the SPX smile of 2026-11-17 (two expiries); 55.8 years of NASDAQ Composite daily returns
   against the normal curve, with autocorrelation of returns and of their size. 1987, LTCM.
9. After the formula. Labs: Heston Monte Carlo (skew from ρ); a futures margin account over 120 days. Fig 7: bilateral
   versus central clearing with multilateral netting. AIG 2008.
10. Uses and harms. Lab: minimum-variance hedge (h* = ρσs/σf, residual √(1−ρ²)). Fig 8: notional versus gross
    market value, to scale. SEBI retail-loss study.
11. Frontier, November 2026: established / measured or demonstrated / contested or claimed. Fig 9: dated future versus perpetual.
12. Closing: four questions to ask of any derivative.

## Sources (all opened 2026-11-18 unless noted)

Shipped data (data.js, written by `tools/make-data.cjs` from raw files kept in the scratch directory):
- Cboe delayed quotes, SPX option chain: https://cdn.cboe.com/api/global/delayed_quotes/options/_SPX.json, retrieved
  2026-11-18, quotes as of the 2026-11-17 close. 19 strikes for each of two expiries (2026-12-18, 2027-03-19): bid/ask
  of calls and puts and Cboe's own implied volatilities. Spot 7,340.53.
- FRED series NASDAQCOM (NASDAQ Composite, daily close), https://fred.stlouisfed.org/series/NASDAQCOM, 1971-02-05 to
  2026-11-16, 14,063 log-returns, shipped as a histogram (48 bins of 0.5σ), exceedance counts, the five largest falls
  and rises, and 60 lags of autocorrelation. Chosen because a long daily S&P 500 history was not reachable from a
  public source (FRED's SP500 series carries only a short recent window; stooq and Yahoo refused automated access).
  The prose says NASDAQ Composite, not S&P 500, and uses the DJIA figure for 1987 only where it cites it as the DJIA.

Textbook and paper results used as test references:
- Hull, Options, Futures, and Other Derivatives: one-step example (Δ 0.25, 0.633, p 0.6523), Black–Scholes example
  (4.76 / 0.81), five-step American put (4.49). Quoted from memory of the standard examples; the tests reproduce them.
- Broadie & Kaya (2006), exact simulation of Heston: reference call price 6.8061; the characteristic-function pricer
  reproduces it to four decimals.
- Kamal & Derman (1999), "Correcting Black–Scholes": hedging-error sd ≈ √(π/4)·vega·σ/√n. Not reopened.
- Carr & Madan / Ahmad & Wilmott for the expected P&L of hedging at the wrong volatility. Not reopened.
- Cox, Ross & Rubinstein (1979); Black & Scholes (1973); Merton (1973); Heston (1993); Rubinstein (1994, the smile
  appearing after 1987). Cited, not reopened.

## Facts that will go stale

Each row: the fact as used, its date, the source, when it was opened.

| Fact | As of | Source | Opened |
|---|---|---|---|
| OTC notional 846 tn USD, gross market value 21.8 tn, notional +16% yoy, interest-rate share 79% | end-June 2025 (published 2025-12-08) | BIS, OTC derivatives statistics, https://www.bis.org/publ/otc_hy2512.htm | 2026-11-18 |
| OTC notional 844.6 tn, GMV 22.8 tn | end-2025 | ISDA summary of the BIS release (2026-07-09); the BIS page itself was not opened (ISDA returned 403 on the PDF; figures from the search summary) | 2026-11-18 |
| OTC interest-rate derivatives turnover 7.9 tn USD/day; FX 9.6 tn/day | April 2025 (published 2025-09-30) | BIS Triennial Survey 2025, https://www.bis.org/statistics/rpfx25.htm | 2026-11-18 |
| Exchange-traded volume 119.29 bn contracts in 2025 (−42.2%); options 88.65 bn (−50.3%); futures 30.64 bn (+8.6%) | 2025 (published 2026-01-12) | FIA, ETD volume December 2025, https://www.fia.org/fia/articles/etd-volume-december-2025 | 2026-11-18 |
| US listed options ADV 72.8 mn; 0DTE above 20 mn | Q2 2026 (published 2026-07-21) | Cboe, State of the Options Industry Q2 2026 | 2026-11-18 |
| 0DTE = 66.2% of SPX option volume, record month | July 2026 (published 2026-08-05) | Cboe Global Markets monthly volume release, ir.cboe.com | 2026-11-18 |
| Market-maker net hedging at most 0.2% of S&P 500 daily liquidity; retail 50–60% of 0DTE | 2025-05-02 | Cboe, "0DTEs Decoded" (Cboe is an interested party; the page says so) | 2026-11-18 |
| 87.7% of 7.86 mn individual equity-derivative traders lost money in FY26; 93% over FY22–24; 0.5% profitable / 65.6% loss-making over five years | August 2026 | SEBI study, https://www.sebi.gov.in/sebi_data/attachdocs/aug-2026/1787233601328.pdf (PDF text extracted) | 2026-11-18 |
| Treasury clearing compliance dates 2026-12-31 (cash) and 2027-06-30 (repo), extended on 2025-02-25 | 2025-02-25 | SEC press release 2025-43 | 2026-11-18 |
| USD LIBOR panel ended 2023-06-30 | 2023 | ARRC, https://www.newyorkfed.org/arrc/sofr-transition | 2026-11-18 |
| SOFR 3.93% | 2026-11-16 | FRED series SOFR | 2026-11-18 |
| DJIA −22.6% (508 points) on 1987-10-19 | 1987 | Federal Reserve History, Stock Market Crash of 1987 | 2026-11-18 |
| LTCM: leverage about 30, −44% in August 1998, 3.6 bn USD from 14 firms on 1998-09-23 | 1998 | Federal Reserve History, Near Failure of LTCM | 2026-11-18 |
| AIG: 85 bn USD credit facility on 2008-09-16 | 2008 | federalreserve.gov, AIG page | 2026-11-18 |
| Perpetual futures no-arbitrage pricing (He, Manela, Ross, von Wachter) | v7, 2026-09-17 | arXiv:2212.06888 | 2026-11-18 |
| Deep hedging (Bühler, Gonon, Teichmann, Wood) | 2018 | arXiv:1802.03042 | 2026-11-18 |
| The SPX smile and the forward read from it (7,360 / 7,432) | 2026-11-17 close | Cboe delayed quotes (above) | 2026-11-18 |

All of these live in `models.js` `FRONTIER` (numbers) and are bound into the prose; amounts written with Chinese
units and all dates are literals in content.zh.md, pinned against `FRONTIER` in tests/models.cjs §15.

## Not verified from a primary source

- BIS end-2025 OTC figures: ISDA's summary only (the page says so).
- Perpetual-futures volume of about 61.8 tn USD in 2025: a data vendor's figure (CryptoQuant) seen in secondary
  coverage; tagged 声称 and stated as unverified on the page.
- Whether the SEC changed the Treasury-clearing dates again after 2025-02-25: no later release was found; the page
  says the dates are those found at the time of writing.
- The 0DTE volatility debate: the Cboe report was opened; the academic papers on the other side (Dim, Eraker &
  Vilkov; Brogaard, Han & Won) were seen only through abstracts and secondary summaries, and are described on the
  page without numbers.
- FIA's attribution of the 2025 fall in options volume to Indian index options: from the headline of the FIA page.
- Bryzgalova, Pavlova & Sikorskaya (Journal of Finance, 2023) on US retail option trading: abstract and secondary
  summaries only; described on the page without numbers.
- "India has been the largest index-options market by contracts in recent years": consistent with the FIA volume
  page, not checked against an exchange-by-exchange table.
- Zernikov, arXiv:2605.21696 (May 2026): abstract page opened, results quoted from the abstract only.
- Rubinstein (1994) for "the skew appeared after 1987": standard attribution, not reopened.
- The March 2020 and 2022 UK pension margin episodes: mentioned as the subject of regulatory debate, no figures.
- Hull's worked examples and the Broadie–Kaya reference value: from memory of standard references; the tests
  reproduce the numbers.

## Decisions

- Parity on the Cboe snapshot implies a discount rate of about 5–5.6%, above SOFR (3.93%). Mid quotes at a delayed
  close and dividends make that estimate loose, so the page states only the forward read from parity, not a rate.
- Implied volatilities are computed by the page (Black 76 on the parity forward, bisection) and compared in the test
  with Cboe's own for moneyness 0.72–1.12: within 0.6 volatility points. Far wings are shown but not compared.
- The hedging lab runs 1,500 paths in the browser (seed 1). The tests make their statistical claims with 20,000 paths
  and three-standard-error bounds; when a check was tight the path count went up, the tolerance did not.
- The Heston Monte Carlo is full-truncation Euler, 20,000 paths × 50 steps, with the terminal price as control
  variate; the test compares every strike with the characteristic-function price within three standard errors.
- ch9 sentence: "a smile" is said whenever both wings sit above the middle, otherwise the side of the skew is named.
  At ρ = 0 the strikes 80 and 120 are not symmetric around the forward, so the two wings differ by about 1.5 points.
- `economics/money/why-one-rate-moves-everything` is an unregistered draft by another author: named in plain text.
- Bindings must be language-neutral, so amounts in 亿/万 and dates are literals in the prose (see above).

## Parameters tuned, not sourced

- Running example S = K = 100, r = 4%, σ = 20%, T = 1; one-step tree 120 / 80; forward quote 110.
- Heston: κ = 2, θ = v0 = 0.04, ξ = 0.5, ρ = −0.7, T = 0.5. Typical textbook magnitudes, not calibrated to the SPX snapshot.
- Margin lab: initial margin 10%, maintenance 75% of initial, σ = 20%, 120 days. The default seed (10) was chosen
  from the first 40 because its path is closed out on day 30 and then recovers. The lab shows next to it the share of
  400 seeded paths that are closed out (82%), so the default is not presented as typical luck.
- Farm hedge: spot and futures sd 15, ρ = 0.9, 2,000 samples. Netting example: four parties with invented amounts.
- PDE grid: 60 or 240 price nodes, Smax = 3K. Hedging: rebalance counts 1, 4, 12, 52, 252.

## Checked / not checked

- tests/models.cjs (Node): see its header. tests/browser.cjs: Chinese at 1280 / 390 / 320, nine diagrams, thirteen
  labs, every live-sentence branch, keyboard, reduced motion, the English stub fallback.
- tests/canvas-text-overlap.cjs --sweep at three widths.
- Screenshots of every lab and diagram at three widths were looked at by the builder.
- Not done: English translation; independent review; registration (page.json has no "status"); the registrar must
  create the `derivatives` subtopic under `investment` (proposed names: 衍生品 / Derivatives).
- Prerequisites the site lacks: no page on Brownian motion / stochastic processes, none on partial differential
  equations or finite differences, none on futures and margin, none on the normal distribution's tails as such.
  The essay explains each from scratch and links compound-interest, expected-value, central-limit-theorem,
  exponents-logarithms, binomial-normal, monte-carlo, derivative, interest-rates-bonds, diversification, risk-return.

## Closeout 2026-11-25 (Claude Code, claude-opus-5-5)

Before this pass: Chinese done, Haiku English done (the "Chinese only / stub" wording at the top of this file is
historical), not reviewed. Still not independently reviewed and not registered.

### Fixed

- **ch7, wrong claim**: "μ, whatever it is set to, does not change this result" (the seller's mean P&L when realised ≠
  priced volatility). An independent Python simulation (scratch dir, own RNG, 3,000 paths × 252 rebalances) gives, for
  realised 10%: +3.99 (μ 0), +3.90 (μ 4%), +3.06 (μ 15%), +1.95 (μ 30%); realised 30%: −4.02, −4.02, −3.89, −3.49. μ
  changes the size, not the sign; at realised = priced vol the mean stays ≈ 0 for every μ. Prose (zh/en) and the
  chapter's limits paragraph now say that and that the bound numbers depend on μ = 4%.
- **ch9 live sentence, false branch**: when |iv80 − iv120| < 1 point the lab said "both wings are above the middle: a
  smile" even when they were not (grid of ρ −0.9…0.9 × ξ 0.15…1.0, seed 1: eight states, e.g. ρ 0, ξ 0.15 →
  20.4 / 20.0 / 20.0; ρ −0.1, ξ 0.15 → 20.6 / 20.0 / 19.8). New branch `ch9.say.small` ("the wings differ by less
  than 1 point; the shape is hidden by Monte Carlo error"); app.js condition split; browser.cjs drives it (ρ 0, ξ 0.15).
- **ch11 d2, unsupported attribution**: "FIA attributes the fall to India's regulatory tightening". The FIA page
  (opened 2026-11-25) does not mention India; it says most of the fall came from equity contracts (−48.8%, 185.0 →
  94.8 bn). Now says that (FRONTIER.fia2025.equityChgPct, binding f.fiaEqChg) and that the page names no cause.
- **ch10, Bryzgalova–Pavlova–Sikorskaya**: "most of the loss is on the bid–ask spread" is not in the abstract (LBS
  Research Online record, opened 2026-11-25). The abstract says retail favour cheaper weekly options with an average
  bid–ask spread of 12.6% and lose money on average; the prose now says exactly that.
- **LTCM 元/yuan**: "每 1 元资本对应 30 元债务" / "30 yuan of debt per 1 yuan" → 美元 / US dollars (Federal Reserve
  History: "about $30 in debt for every $1 of capital" at end-1997; −44% in August; fourteen firms, $3.625 bn).
- **ch11 e2**: the plain-text title of why-one-rate-moves-everything (now live) is a link `[[why-one-rate-moves-everything]]`.
- **English**: "7.0 times of the formula price" → "7.0 times the formula price" (both ch8 smile sentences); tails
  sentences reworded ("… such days; the data has N, X times as many"); singular units (new `u.*.one` keys, chosen in
  `t()` when v is 1: "once", "1 day", "1 year" instead of "1 times", "1 days"); "A {n}-step tree"; "Rebalancing {n}× a
  year"; "Margin calls over 120 days: {n}"; the closeout sentence no longer runs a capitalised clause after a colon.
- Generic example amounts stay in "yuan" in English (the running example is a fictional stock; zh says 元); only
  real-world amounts (LTCM, AIG, BIS) are in US dollars. A reviewer may prefer a neutral unit; that would be a
  page-wide change and was not made.
- page.json: provenance note names the authoring model, the Haiku translation and this closeout; version
  20261125a; `"status": "draft"` per the 2026-11-25 round's rule (COMMON.md). Note: `build-registry.cjs --check`
  rejects `"draft"` ("leave it out while the page is a draft") — same as the other drafts of this round; the registrar
  flips it to live. tests/models.cjs now accepts status absent or "draft". Rebuild also picked up site-template drift
  (site-nav.css key).

### Verified (independently re-derived, scratch scripts in /tmp/agent-tasks/econ-graph/a-fair-price/)

Plain Python, no code shared with models.js: forward 104.08 / gap 5.92; BS C 9.93, P 6.00, C − P 3.92; one-step
q 60.2%, B 38.43, price 11.57, naive 15.37 / 5.76; CRR 3 / 50 / 500 steps 10.54 / 9.89 / 9.92 (errors 0.073, −0.040,
−0.020, −0.010 at N 25, 50, 100, 200: halving per doubling, so "1/N" and "doubling halves the gap" hold), European /
American put 6.00 / 6.40; Hull's examples (one-step p 0.6523, f 0.633; 42/40 → 4.76 / 0.81; five-step American put
4.49); N(d1) 0.618, 61.79 / 51.87; Γ 0.0191, vega 0.38/pt, Θ 0.016/day; explicit-scheme bound Nt ≥ σ²M² + 1 →
145 / 2,305; hedging sd 3.27 / 0.95 / 0.44 at n 4 / 52 / 252 (page 3.12 / 0.95 / 0.44 on 1,500 paths), wrong-vol
means −3.98 / +3.89 (page −3.98 / +3.86, theory 3.98 / 3.90 — note V(σi) − V(σr) = 3.83 / 3.75 is *not* the right
reference; the page's Γ-integral quadrature is); SPX parity forward 7,360 / 7,432, my Black-76 IVs within 0.13 vol
points of Cboe's for moneyness 0.72–1.12, ATM 20.2%, 90% put 31.3%, price ratio 7.05 (March: 2.33); tails sd 1.28%,
5σ expected 0.008 vs 43 observed, 1987 z −9.48, log10 p −20.9; Heston by characteristic function (own code)
25.4 / 19.0 / 14.5% at 80 / 100 / 120 against the page's Monte Carlo 25.5 / 19.1 / 14.5%; Broadie–Kaya case
6.8061 reproduced; margin closeout 82.5% and "closed and ended above 100" 30.5% on 20,000 own paths (page 82% / 29%
on 400); netting 560 / 140 / 20; min-variance cuts 56% / 29%, risk back to unhedged at 2h*.

Sources reopened 2026-11-25: Federal Reserve History LTCM (all four figures confirmed); FIA ETD volume December 2025
(totals confirmed; India attribution not there, fixed); SEC Treasury clearing implementation page (last updated
2026-11-05: dates still 2026-12-31 / 2027-06-30; a September 2025 Uyeda statement said no further extensions were
intended); arXiv:2605.21696 (Zernikov, 20 May 2026: under-hedging relative to BS Δ, better in most of 2015–2023,
fragile in 2022 and 2023 — the page's summary matches; it mentions 2022 only, which is fine); BPS abstract (fixed).
CryptoQuant 61.8 tn: secondary coverage says 61.8, CryptoQuant's own post reportedly 61.7; CryptoQuant page returned
403. Left as 声称 with the existing "not verified" wording.

### Still not verified

- BIS end-2025 OTC figures: the BIS release was not found (otc_hy2605 404; the BIS "latest" commentary is still
  end-June 2025); the ISDA PDF returned 403. Page keeps saying "only ISDA's summary".
- "India has been the largest index-options market by contracts": not checked against an exchange table.
- SEBI figures, Cboe 0DTE figures, BIS end-June 2025, AIG, 1987 DJIA: not reopened this pass (opened 2026-11-18).
- Rubinstein (1994) attribution, Dim–Eraker–Vilkov and Brogaard–Han–Won: not reopened.
- Haiku translator model id is not recorded anywhere; the provenance note says "Haiku".

### Checks run

`node scripts/build-pages.cjs investment/derivatives/a-fair-price-for-a-bet` and `--check` (OK); tests/models.cjs;
tests/browser.cjs (zh and en, 1280 / 390 / 320, screenshots in the scratch dir, looked at: diagrams, labs 8, 9, 9m);
tests/canvas-text-overlap.cjs --sweep (first run: 36 findings, all English at 320 px — the ch8 tails x-axis label
and the ch10 lower chart's y-axis label ran outside the canvas; both labels shortened, "Daily return (standard
deviations) →" and "↑ Revenue std. dev. (yuan)"; the sweep was not rerun after the fix, per the 2026-11-25 instruction
to drop acceptance polish — rerun it at review). Final: build --check OK, models.cjs 1688/1688, browser.cjs 197/197
(zh + en, three widths, no console errors, includes the new ch9.say.small branch).
- Hedging sd at n = 4: page 3.12 (1,500 paths, seed 1) against my 3.27 (8,000 paths) and Kamal–Derman 3.38; within
  sampling error of a fat-tailed P&L, but the prose number is a single seeded draw.

## Independent review 2026-11-25

Verified-By: Claude Code (claude-opus-5-5), a separate session from the writer and the closeout; scope: content,
equations, sourced facts in ch8/10/11, English wording. Full record:
specs/reviews/a-fair-price-for-a-bet-review-20261125.md.

New sources opened 2026-11-25 (add to the table above when the registrar touches it):
- SEBI study PDF https://www.sebi.gov.in/sebi_data/attachdocs/aug-2026/1787233601328.pdf (text extracted): n = 78.6
  lakh, 87.7% loss-makers FY26, 0.5% profitable / 65.6% loss-making in all five years FY22–FY26, 97% predominantly
  options buyers. All confirmed.
- FIA MarketVoice, K. Hyde, 2026-02-26, https://www.fia.org/marketvoice/articles/global-etd-trading-fell-2025-india-crackdown-hits-options-volume:
  decline "overwhelmingly concentrated in Indian equity index options", attributed to SEBI rule changes. The ch11 d2
  attribution is restored with this source.
- WFE 2025 data via FOW (2026-02-27), https://www.fow.com/insights/derivatives-trading-volume-decrease-in-2025-wfe-data:
  stock-index options 38.7% of all derivatives contracts, 88.9% of them on NSE. Supports "India is the largest
  index-options market by contracts" (now stated with this figure).
- Cboe, State of the Options Industry Q2 2026: ADV 72.8 mn (+19%); 0DTE "up 46.2% year-to-date to more than 20 million
  contracts a day" — year-to-date, not Q2; prose corrected.
- Cboe July 2026 volume release (search summary): 0DTE 66.2% of SPX volume, record. Confirmed.
- SEC Treasury clearing implementation page and Uyeda statement of 2026-08-07: dates 2026-12-31 / 2027-06-30 unchanged.
- ISDA "Key Trends … Second Half of 2025" (search summary only; PDF not opened): 844.6 tn / 22.8 tn. BIS's own
  end-2025 release still not found; page keeps "only ISDA's summary".
- CryptoQuant FY2025 review page: 403. Secondary coverage gives 61.7 and 61.8 tn (spot 18.6 tn); prose now says so.
