# Review: investment/derivatives/a-fair-price-for-a-bet (2026-11-25)

Reviewer: Claude Code (claude-opus-5-5), independent of the writer (claude-fable-5-2) and of the closeout session.
Scope: content and sources first (COMMON.md UPDATE / UPDATE 2); structural checks run in full; no screenshot matrix.

## Verdict

**Ready to register.** The ladder from forward → parity → one-step replication → CRR tree → GBM → Black–Scholes
(formula and PDE) → Greeks and hedging P&L → smile / fat tails → Heston, margin, CCP → hedging and harm → frontier is
complete and correct; there is no step a careful non-expert would have to take on faith. The remaining unverified
items are labelled as such on the page. The registrar should add `"status": "live"` (the field is now absent).

## 已核 (verified)

Models, re-derived with my own script (/tmp/agent-tasks/econ-graph/a-fair-price-review/check.py, no shared code):
BS C 9.93 / P 6.00, N(d1) 0.618, Γ 0.0191, vega 0.38/pt, Θ 0.016/day (365-day convention); CRR 3/50/500 steps
10.54 / 9.89 / 9.92; European / American put 6.00 / 6.40; min-variance risk cut 56% (ρ 0.9) / 29% (ρ 0.7);
variance returns to unhedged at 2h* (algebra). One-step numbers (Δ 0.5, B 38.43, price 11.57, q 60.2%, naive
15.37 / 5.76) and the explicit-scheme bound (σ²M² + 1 → 145 / 2,305) checked by hand. The closeout's wider
independent re-derivations (hedging sd, wrong-vol means, SPX IVs, Heston by CF, margin stats) were not redone.

Equations and claims read as an expert: forward / cost of carry, parity, risk-neutral q, CRR recombination and
1/N convergence, log-normal limit and the μ − σ²/2 median, BS formula structure (N(d1) = Δ, N(d2) = risk-neutral
exercise probability), BS PDE and its heat-equation reduction, Θ–Γ trade-off, "options trade volatility" and the
μ-dependence of the wrong-vol P&L (closeout fix is right), implied vol / VIX description, Heston SDEs and sign of ρ,
margin mechanics, optional-stopping claim "leverage does not change the expected value", multilateral netting,
minimum-variance hedge ratio and √(1 − ρ²).

Sources opened myself on 2026-11-25:
- SEBI August 2026 study (PDF text extracted): 78.6 lakh traders, 87.7%, 0.5% / 65.6% over five years, 97% options
  buyers — all match the page.
- FIA MarketVoice 2026-02-26: decline concentrated in Indian equity index options, attributed to SEBI tightening.
- WFE 2025 (via FOW): 88.9% of stock-index option contracts on NSE.
- Cboe Q2 2026 State of the Options Industry: 72.8 mn ADV; ">20 mn 0DTE a day" is year-to-date.
- Cboe July 2026: 0DTE 66.2% of SPX volume, record (search summary of the Cboe release and coverage).
- SEC Treasury clearing page and Uyeda statement of 2026-08-07: dates unchanged.
- BIS end-June 2025 (846 tn, 21.8 tn, +16%) confirmed in the BIS release summary.
Checked against my own knowledge, not reopened: DJIA −22.6% on 1987-10-19; AIG 85 bn on 2008-09-16; USD LIBOR panel end
2023-06-30; Rubinstein (1994) on the post-1987 skew; Dim–Eraker–Vilkov (no evidence of Γ-driven volatility) and
Brogaard–Han–Won (higher volatility) — directions match the page; BPS (JF 2023); Bühler et al. 2018.

Not-advice: hero note and footer say so; no strategy, recommendation or forecast wording; SEBI/BPS results framed as
aggregates; the frontier chapter ends with "no forecast". Fine.

Units: decided to **keep "yuan"** for all generic / fictional amounts in English (it matches the Chinese running
example and keeps them visibly distinct from real-world amounts, which are all "US dollars"). Checked: no "$" or
"dollars" on generic amounts; LTCM / AIG / BIS / swaps are in US dollars.

## 已改 (fixed, zh + en unless stated)

1. Hero subtitle: "成交千万笔 / tens of millions of times a day" for options on one stock was an overstatement →
   "成千上万笔 / thousands of times" (matches the desc).
2. ch5: "σ = 20% → within 20% either side of the median" was loose; now in log terms, ≈ 0.82–1.22 × the median.
3. ch6: Crank–Nicolson "stable at any step size" → does not blow up, but leaves small non-amplified oscillations near
   the kink at large steps (true of CN with non-smooth payoffs).
4. Figure 6 caption: "the rebalancing losses add up to exactly the premium" is not right (with r > 0 and the payoff
   still to pay) → the premium is exactly enough to run the replication: shares minus loan equal the payoff at expiry.
5. ch8: C − P against strike has slope **minus** the discount factor, not the discount factor.
6. Figure 7 caption (zh only): "两两结算时要盯六个对手" → six pairs, three counterparties per firm (en already said "six pairs").
7. ch10: India claim now sourced and stated precisely (WFE 2025: 88.9% of stock-index option contracts on NSE).
8. ch11 d2: restored a sourced cause for the 2025 volume fall (FIA analysis 2026-02-26: Indian index options, SEBI
   rules: larger contracts, fewer weekly expiries, upfront premium). The closeout had removed it because the FIA
   statistics page did not say it; the FIA article does.
9. ch11 d3: ">20 mn 0DTE a day" is year-to-date per Cboe, not Q2 — reworded.
10. ch11 e3: "I did not confirm whether the SEC dates changed" → Uyeda statement 2026-08-07 still works to them.
11. ch11 c2: CryptoQuant figure: reports quote 61.7 or 61.8 tn; spot 18.6 tn added; still tagged 声称, still "not
    verified" (CryptoQuant page 403). 61.8 kept because tests/models.cjs pins it to FRONTIER.
12. English: ch1 law sentence ungrammatical ("A contract … does not depend") → "The price of a contract …"; "Vega …
    everyone calls it that" → "counted among the Greeks"; "The Cboe" → "Cboe"; "March 2020 and 2022 UK pension
    episodes" → "March 2020 market turmoil and the 2022 UK pension-fund crisis".
13. Footer and page.json provenance: record this independent review; page.json `"status": "draft"` removed;
    version 20261125b. BRIEF.md: "Independent review 2026-11-25" section with the new sources.

## 没核 (not checked)

- BIS's own end-2025 OTC release (still ISDA's summary only; page says so).
- CryptoQuant primary page (403).
- Dim–Eraker–Vilkov and Brogaard–Han–Won full texts (page already says secondary summaries only).
- Closeout's simulation numbers (hedging sd / wrong-vol means / margin / Heston): trusted, not re-run.
- English read in full for prose paragraphs; lab strings and diagram labels only skimmed. No screenshots taken
  (browser.cjs covers zh + en at three widths).
- `tests/canvas-text-overlap.cjs --sweep` not rerun (closeout asked for it at review; it is acceptance polish under
  UPDATE, and browser.cjs passes).

Minor, left as is: ch4 live sentence "doubling the steps roughly halves the gap" is about the envelope and can look
off at small odd/even N; hedging sd at n = 4 is a single seeded draw (3.12 vs ≈ 3.3 on more paths), noted in BRIEF.

## Checks run (after edits)

- `node scripts/build-pages.cjs investment/derivatives/a-fair-price-for-a-bet` — built, 98 bound numbers
- `… --check` — `OK … outputs match the sources`
- `tests/models.cjs` — `1688/1688 checks passed`
- `tests/browser.cjs` on 127.0.0.1:18888 (in-process server started and closed by
  /tmp/agent-tasks/econ-graph/a-fair-price-review/run-browser.cjs; port confirmed free afterwards) — `197/197 checks passed`
- `node scripts/build-registry.cjs --check` — PASS (page not yet registered)
