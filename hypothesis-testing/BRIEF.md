# BRIEF · hypothesis-testing 假设检验与 p 值

category `probability`, stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: statistical-inference (legacy 4-step slice) covers sampling distribution, confidence interval and one hypothesis-test/p-value step with a z-score. This page does the exact binomial test of a coin and adds the p-value distribution under H₀ and H₁, α as a budget, type II error and power, sample size and multiple testing (<45% overlap, concentrated in step 0); bayes is the intended contrast.

## Steps
**0 The p-value.** Knows: binomial. Question: what is p? Inputs n (10–60), k; seek two-sided p = Σ P(j) over outcomes no more likely than k. Controls: sliders; orange bars are the tail set.
**1 Many experiments.** Knows: p. Question: distribution of p? Inputs q (0.30–0.80), n, Run 10/100/1000, Reset (seeded); seek share with p ≤ 0.05 (≈ ≤5% under H₀). Holds: exact test is conservative.
**2 α.** Knows: p. Question: what does α control? Inputs α (1–20%), n; seek rejection region and its actual null probability ≤ α.
**3 Power.** Knows: α. Question: chance to catch a biased coin? Inputs q (0.51–0.90), n, α; seek β and 1−β = Σ_{k∈region} P_q(k).
**4 Sample size.** Knows: power. Question: flips for 80% power? Inputs q, α, n (5–200); seek power curve and first n with power ≥ 0.8 (sawtooth because of discreteness).
**5 Many tests.** Knows: all. Question: why one significant result is not a discovery? Inputs m (1–100), Test m coins, Correction (Bonferroni 0.05/m), Reset; seek 1−(1−α_actual)^m and simulated hits. Links: statistical-inference#step3, bayes#step0, binomial-normal#step0.

## First-appearance terms
Null hypothesis, p-value, two-sided (0); significance level α, rejection region, type I error (2); type II error β, power (3); sample size (4); multiple testing, Bonferroni correction (5).

## Simulation vs reality
Coin flips from a fixed seed; independent tests; discrete exact test; Bonferroni is conservative; p-values answer a different question than Bayesian posteriors; no claims about any specific study.
