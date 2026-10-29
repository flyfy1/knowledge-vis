# BRIEF · counting-permutations 排列与组合

category `probability`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: number-combinatorics (4-step slice: prime factors, Euclid, C(n,k) via Pascal row) touches combinations in one step; this page teaches the multiplication principle, n!, nPr, the nPr/k! relation, large counts and the birthday probability (<30% overlap).

## Steps
**0 Multiply steps.** Knows: counting. Question: how many outfits? Inputs a,b,c (1–4); seek a·b·c. Controls: sliders redraw the tree. Holds: independent choices.
**1 All arrangements.** Knows: step 0. Question: ways to line up n? Input n (1–8); seek n!. Controls: slider; all arrangements drawn for n≤4. 
**2 nPr.** Knows: n!. Question: pick k of n in order? Inputs n, k; seek n(n−1)…(n−k+1) = n!/(n−k)!. Controls: sliders (k ≤ n).
**3 nCr.** Knows: nPr. Question: what to divide when order is ignored? Inputs n, k; seek nPr/k! with grid of C rows × k! cells (n ≤ 8).
**4 Big numbers.** Knows: nCr. Question: odds of guessing a combination? Buttons: three presets; seek C(n,k) and 1/C. Holds: all combinations equally likely.
**5 Birthday.** Knows: all. Question: how many people for >50%? Input n (2–60); seek 1−365Pn/365ⁿ. Holds: uniform 365 days. Links: number-combinatorics#step2, probability-frequency#step0, bayes#step0.

## First-appearance terms
Multiplication principle (0), factorial (1), permutation nPr (2), combination nCr (3), equally likely (4), complement (5).

## Simulation vs reality
BigInt exact arithmetic; the displayed lottery benchmark of about 140 million is a rounded example and not any named lottery; birthdays are not uniform in reality.
