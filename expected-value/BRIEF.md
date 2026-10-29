# BRIEF · expected-value 期望

category `probability`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: probability-distribution step 1 defines E as the balance point of a given distribution. This page applies E to decisions: the fair price and house edge, the long-run convergence, additivity, insurance versus variance and the St. Petersburg paradox (<30% overlap).

## Steps
**0 Weighted sum.** Knows: probability. Question: what is the average of a random game? Buttons: die, coin, roulette on red, lottery; seek Σ p·x with contributions laid end to end.
**1 Fair price.** Knows: E. Question: what price is fair? Input price (0–10); seek E − price and the house edge. Controls: slider moves the dot (green/red).
**2 Long run.** Knows: E. Question: when does the average settle? Buttons Play 1/100/1000, Reset (seeded); seek running average vs E ± 2σ/√n. Holds: independent plays.
**3 Additivity.** Knows: E. Question: expectation of a sum? Inputs dice n (1–6), shift b; seek 3.5n + b vs mean of the convolved distribution.
**4 Insurance.** Knows: E. Question: why insure at a worse expectation? Inputs loss, probability (per mille), premium; seek expectations and standard deviations of both, insurer's expected profit.
**5 St. Petersburg.** Knows: all. Question: price for an infinite expectation? Input M (1–40), Play 100/1000, Reset; seek M+1 (capped), mean, median, max. Links: probability-distribution#step1, montecarlo#step0, bandit-arms#step0.

## First-appearance terms
Expected value (0), fair price, house edge (1), law of large numbers (informal), standard error (2), linearity of expectation (3), risk, premium (4), St. Petersburg paradox, cap (5).

## Simulation vs reality
Fixed-seed pseudo-random plays; lottery and roulette probabilities are the standard ones (6-of-49 lottery, 38-pocket roulette); no utility theory, taxes or bankroll limits; not gambling or insurance advice.
