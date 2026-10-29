# BRIEF · auctions 拍卖 · 报价与真话

category `math`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (provenance spec has no rule for Claude editions; uncertainty noted).
Dedup: mechanism-auction teaches two bidders, first vs second price outcomes and winner utility. This page adds bid shading as an optimisation, the dominance check over all rival bids, revenue equivalence by simulation, English/Dutch formats and the winner's curse (<50% overlap); the existing mechanism-auction page has no #stepN anchors (ids s0..s3), so no deep link is made to it; it is named here and in the fragment note instead.

## Steps
**0 First price.** Knows: value vs bid. Question: what bid is best when you pay your bid? Inputs v, b; seek (v−b)·b/50 and best b = v/2. Controls: sliders move the point; the green dot is the optimum. Holds: rival bid uniform on [0,50], risk-neutral.
**1 Second price.** Knows: step 0. Question: can lying help when you pay the rival's bid? Inputs v, b, r; seek payoffs and max gain over truth ≤ 0 across all r. Controls: sliders; red band between b and v marks where outcomes differ. Holds: one rival, ties lose.
**2 Revenue.** Knows: both rules. Question: who collects more on average? Input n; seek running averages vs 100(n−1)/(n+1). Controls: Run rounds, Pause, Reset; changing n resets. Holds: uniform values, equilibrium bidding, seeded draws.
**3 English.** Knows: second price. Question: where does a rising clock stop? Inputs: draw; seek second-highest value. Controls: Raise +5, Auto, New values, Reset. Holds: five bidders, continuous clock.
**4 Four formats.** Knows: all formats. Question: what does each collect on the same values and on average? Controls: New values, Add 50 draws, Reset. Holds: equilibrium behaviour; Dutch=first and English=second by construction.
**5 Winner's curse.** Knows: shading. Question: why do highest estimates lose? Inputs n, σ, shade s; seek mean profit s − σ(n−1)/(n+1) vs 4000-draw simulation. Controls: sliders. Holds: signal V+ε, ε uniform on [−σ,σ], independent of V. Links: probability-distribution#step1, game-theory#step1, montecarlo#step0.

## First-appearance terms
Private value, bid, first-price, bid shading (0); second-price/Vickrey, dominant strategy (1); revenue equivalence (2); English auction (3); Dutch auction (4); common value, winner's curse (5).

## Simulation vs reality
Single item, independent uniform values, symmetric risk-neutral bidders; no budgets, collusion, reserves or risk aversion; Dutch/English results follow from the theory rather than a simulated clock with strategic bidders; winner's-curse noise is uniform and the mean uses a fixed seed.
