# BRIEF · gravity-orbits 万有引力与轨道

category `earth`, stage `senior`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: orbital-motion (registered earlier) shows an ellipse with eccentricity, speed variation and transit alignment as one interactive diagram. This page starts from the 1/r² force, throws a body sideways, builds orbit types and escape from energy, and measures Kepler's laws from numerical integration (<40% overlap; orbital-motion has no #stepN anchors, so it is not deep-linked).

## Steps
**0 Inverse square.** Knows: gravity pulls. Question: how fast does it weaken? Input r (1–6 R⊕); seek g = 9.81/r². Controls: slider.
**1 Throw sideways.** Knows: step 0. Question: which path for which speed? Input v (0.3–1.6 circular speeds), Play/Reset/Draw all; seek e = |v²−1|, perigee/apogee, orbit type. Holds: GM=1, tangential launch at r=1, velocity Verlet dt 0.004.
**2 Energy.** Knows: orbits. Question: why two turning radii and escape? Input v; seek E = ½v²−1/r, V_eff roots r = 1 and v²/(2−v²), E=0 at v=√2.
**3 Equal areas.** Knows: ellipse. Question: what do equal times sweep? Input v (0.6–1.25); seek 8 wedge areas by numerical integration vs ½LT/8.
**4 T² and a³.** Knows: orbit size. Question: how do T and a relate? Inputs r (0.5–3), v/vc (0.75–1.2), Add/Reset; seek T from simulated angle crossing vs 2π a^{3/2}.
**5 Satellites.** Knows: T² law. Question: altitude for a one-day orbit? Input altitude (10^2–10^6 km, log); seek T = 2π√(a³/GM_E). Links: seasons-orbit#step1, gravitational-lensing#step0, cosmology-expansion#step0.

## First-appearance terms
Inverse-square law (0), circular speed, escape speed, eccentricity (1), effective potential, total energy (2), angular momentum, areal velocity (3), semi-major axis, period (4), geostationary orbit (5).

## Simulation vs reality
Two-body Newtonian with a point mass, no drag; numerical integration errors small but nonzero; GM_E = 3.986×10¹⁴ m³/s² and R_E = 6371 km are standard values; the Moon altitude uses 384,400 km centre-to-centre minus R_E.
