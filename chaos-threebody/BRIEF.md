# BRIEF · chaos-threebody 混沌与三体

category `physics`, stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: orbital-motion teaches solvable two-body ellipses; no existing page covers chaos, Lyapunov growth or the three-body problem (<15% overlap).

## Steps
**0 Sensitivity.** Knows: iterated function. Question: when do nearly equal starts diverge? Inputs r (2.5–4.0), δ=10^-k; seek first step with |Δx|>0.1. Controls: sliders; red split line. Holds: logistic map x0=0.4.
**1 Lyapunov.** Knows: step 0. Question: one number for regular vs chaotic? Input r; seek λ = mean ln|r(1−2x)| (3000 steps after 300 discarded) and number of long-term values. Controls: slider; bifurcation diagram + λ(r) with orange locator.
**2 Lorenz.** Knows: λ. Question: do continuous systems go chaotic? Input ρ (0–40), Play/Reset/Draw all; seek regime (ρ<1, <24.74, >24.74). Holds: σ=10, β=8/3, RK4 dt=0.01, from (1,1,1); thresholds are the standard published values.
**3 Butterfly.** Knows: exponential growth. Question: how long until visible? Input log₁₀δ (−12..−2); seek time separation>1 vs ln(1/δ)/0.9056. Holds: starts on the attractor (after 20 t.u.).
**4 Horizon.** Knows: step 3. Question: gain per extra digit? Input k; seek horizon (simulated) vs formula; gain ≈ ln10/λ. Controls: slider.
**5 Three bodies.** Knows: all. Question: stable orbit for three equal stars? Inputs ε (0–0.1), T (10–30), Play/Reset/Draw all; seek deviation from figure-8, energy drift, closest pair. Holds: G=m=1, planar, RK4 dt=0.002, initial data of the Chenciner–Montgomery figure-8 (8 digits). Links: population-growth#step2, exp-log#step0, control#step0 (orbital-motion has no #stepN anchors, so it is not deep-linked).

## First-appearance terms
Deterministic chaos, sensitive dependence (0); Lyapunov exponent, bifurcation diagram (1); Lorenz system, attractor (2); butterfly effect (3); prediction horizon (4); three-body problem, figure-8 orbit (5).

## Simulation vs reality
Numerical integration errors grow as well; long trajectories are one numerical realisation, not truth; figure-8 initial data are rounded; real weather and real star systems have more variables and noise.
