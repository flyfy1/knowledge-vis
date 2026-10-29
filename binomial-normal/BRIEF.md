# BRIEF · binomial-normal 二项分布到正态

category `probability`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (provenance spec has no rule for Claude editions; uncertainty noted).
Dedup: clt averages many draws (σ/√n, convolution ladder, sample-size calculator); probability-distribution reads a given discrete distribution. This page derives the binomial from path counting, runs a Galton board, and measures the normal approximation error and continuity correction (<40% overlap with either).

## Steps
**0 Paths.** Knows: left/right choices. Question: how many paths end in each bin? Inputs n (1–10), k; seek C(n,k), 2ⁿ, C/2ⁿ. Controls: sliders highlight the bin in Pascal's triangle. Holds: fair, independent steps.
**1 Galton board.** Knows: C(n,k)/2ⁿ. Question: does a random pile match the formula? Inputs n, p, drops; seek observed share vs C(n,k)pᵏ(1−p)ⁿ⁻ᵏ. Controls: Drop 1 (animated path), Drop 100, Clear; n or p changes restart the board. Holds: fixed-seed pseudo-random; reduced motion drops instantly.
**2 Mean and spread.** Knows: bars. Question: what sets centre and width? Inputs n (2–100), p; seek μ=np, σ²=np(1−p), mass within μ±σ. Controls: sliders move the line and band.
**3 Bell curve.** Knows: μ, σ. Question: how well does N(μ,σ²) fit the bars? Inputs n, p; seek max |pmf − pdf| and rule-of-thumb flag. Controls: sliders; gap and skew visible.
**4 How large n.** Knows: fit gap. Question: how large must n be? Inputs n (4–100), p; seek max gap / peak height vs n (~1/√n) and np≥10 rule. Controls: sliders move the marker and reshape the curve.
**5 Tails.** Knows: all. Question: P(X≥k) for a fair coin by normal approximation? Inputs n (20–200), k; seek exact tail, z-approx with/without the 0.5 correction. Controls: sliders shift the shaded tail. Links: clt#step2, probability-distribution#step1, probability-frequency#step0.

## First-appearance terms
Pascal's triangle / C(n,k) (0), Galton board, Bernoulli trial (1), mean, variance, standard deviation (2), normal density (3), rule of thumb np≥10 (4), continuity correction, tail probability (5).

## Simulation vs reality
Fixed-seed pseudo-random balls, idealised pegs; normal approximation is an approximation (relative error grows in far tails); the error curve measures pmf versus density at integers, not CDF error.
