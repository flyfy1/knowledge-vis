# BRIEF · markov-chains 马尔可夫链

category `probability`, stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: pagerank teaches a random surfer on a link graph with power iteration to a rank vector. This page teaches general Markov chains: memorylessness, matrix powers, stationary distribution definition, convergence rate via the second eigenvalue and absorbing chains (<35% overlap; cross-linked).

## Steps
**0 One step.** Knows: probability. Question: tomorrow's weather from today's? Inputs a, b (0.05–0.95); seek row 1 of P and P(sun|rain). Shared a,b across steps 0,1,2,4 (synchronised sliders).
**1 A path.** Knows: P. Question: long-run sunny share? Buttons: walk 10/100/1000, reset (seeded); seek running share vs π = b/(a+b).
**2 Matrix powers.** Knows: rows of P. Question: n-step distribution? Input n (0–30); seek rows of Pⁿ (start sunny vs rainy) → π.
**3 Steady state.** Knows: Pⁿ. Question: distribution unchanged by one step? Input r (0–0.9) for a 3-state chain; seek π by repeated multiplication, residual |πP−π|.
**4 How fast.** Knows: π. Question: speed? Inputs a, b, n; seek TV distance ≈ |λ₂|ⁿ·TV₀, λ₂ = 1−a−b; half-life ln½/ln|λ₂|.
**5 Gambler.** Knows: all. Question: other fates? Inputs p (0.30–0.70), start (1–9), rounds (0–100); seek mass at 0 and 10, ruin formula vs P^4000. Holds: N = 10. Links: pagerank#step0, binomial-normal#step0, probability-frequency#step0.

## First-appearance terms
State, transition matrix, memoryless (0); stationary distribution (3); eigenvalue λ₂, total variation distance (4); absorbing state, ruin probability (5).

## Simulation vs reality
Seeded simulation; finite first-order chains only; convergence needs irreducible and aperiodic (a=b=1 oscillates); the 3-state matrix is a made-up teaching example, not climate data.
