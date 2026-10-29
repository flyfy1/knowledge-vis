# BRIEF · compound-interest 复利与贴现

category `math`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: exp-log uses compound interest as one example of exponential growth; population-growth is biology/logistic. This page is the finance mechanism: simple vs compound, compounding frequency to e^{rt}, the rule of 72, discounting, annuities and loans (<30% overlap); cross-linked.

## Steps
**0 Simple vs compound.** Knows: percent. Question: how big is the difference? Inputs r (1–15%), t (0–40); seek P(1+rt) vs P(1+r)^t. Controls: sliders move the marker.
**1 Frequency.** Knows: compound. Question: ceiling when compounding more often? Inputs r, t, m ∈ {1,2,4,12,365,∞}; seek P(1+r/m)^{mt} and P e^{rt}. Controls: sliders and six buttons.
**2 Rule of 72.** Knows: growth. Question: doubling time? Input r (2–24%); seek ln2/ln(1+r) vs 72/r and error. Holds: accurate near 4–12%.
**3 Discounting.** Knows: compound. Question: present value? Inputs r, t; seek FV/(1+r)^t and round trip. 
**4 Regular saving.** Knows: discounting. Question: deposit vs interest share? Inputs C, r, n; seek C((1+r)^n−1)/r. Holds: deposits at year end.
**5 Loans.** Knows: all. Question: why is principal slow to fall? Inputs loan (50k–800k), r, term; seek payment P i/(1−(1+i)^−n), total interest, balance at half term. Holds: monthly equal payment. Links: exp-log#step0, population-growth#step0, probability-distribution#step1.

## First-appearance terms
Principal, simple/compound interest (0); compounding frequency, continuous compounding (1); doubling time, rule of 72 (2); present value, discounting (3); annuity (4); amortisation, monthly payment (5).

## Simulation vs reality
Fixed nominal rates, no inflation, tax or fees; amounts in generic units; loan model ignores prepayment and variable rates; not financial advice.
