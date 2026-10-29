# BRIEF · mechanical-energy 机械能守恒

category `physics`, stage `junior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: lever-pulley teaches the work ledger of simple machines; momentum-collision teaches momentum conservation with kinetic energy in collisions; the atlas spring-potential spec covers a spring only. No page teaches E_p + E_k conservation on a track with friction, a loop and a braking distance (<30% overlap).

## Steps
**0 Trade-off.** Knows: height and speed. Question: where does the energy go in a fall? Inputs h₀ (1–20 m), progress; seek E_p = mgh, E_k = ½mv², total mgh₀ (m = 1 kg).
**1 The track.** Knows: step 0. Question: can the cart climb higher than the start? Inputs start height (2–10 m), position x; seek v = √(2g(h₀−h)) and the unreachable zones (track higher than h₀).
**2 Friction.** Knows: ledger. Question: where does the energy go with friction? Inputs h₀, μ (0–0.2), Play/Reset; seek E_p + E_k + Q = E₀ from a numerical simulation (dt 1 ms) with Coulomb friction.
**3 Loop.** Knows: energy. Question: minimum start height? Inputs R (2–8 m), h₀, angle; seek v² = 2g(h₀ − R(1−cosφ)), N = mv²/R + mg cosφ, h₀ ≥ 2.5R.
**4 Spring launch.** Knows: energy. Question: how high can a spring throw a ball? Inputs k (50–500), m (0.1–2 kg), x (5–30 cm); seek ½kx² = ½mv² = mgh.
**5 Braking.** Knows: all. Question: why does doubling speed quadruple distance? Inputs v (10–130 km/h), μ (0.05–0.90), road presets; seek d = v²/(2μg). Links: lever-pulley#step3, momentum-collision#step0, velocity-vt#step3.

## First-appearance terms
Gravitational potential energy, kinetic energy (0), unreachable region (1), thermal energy, friction (2), centripetal condition (3), elastic potential energy (4), braking distance (5).

## Simulation vs reality
Point mass, constant Coulomb friction, no air drag, no rolling energy; the loop condition ignores wheel flanges; numeric track integration uses dt = 0.001 s and the ledger closes within about 1%.
