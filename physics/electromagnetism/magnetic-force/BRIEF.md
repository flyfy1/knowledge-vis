# BRIEF · magnetic-force 磁场与洛伦兹力

category `physics`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe, headless-Chrome control sweep). No independent review.

## Steps
**0 Sideways force.** Knows: forces change motion. Question: which way does B push a moving charge? Input angle, q, B; seek F = qv×B. Controls: rotate angle → F stays 90° to v; q<0 flips; q=0 removes F. Holds: B uniform, out of screen, motion in-plane.
**1 Circles.** Knows: F ⟂ v. Question: what path and radius? Input v, B; seek r = mv/(qB) and a measured radius from three trail points. Controls: Play (trail accumulates), Reset (clears trail, time, readout); double v → r ×2; double B → r ×½. Holds: uniform B, classical, m = 1, |q| = 1.
**2 Period.** Knows: r formula. Question: does a faster particle lap sooner? Input B, m; seek T = 2πm/(qB). Controls: Play shows three speeds returning together; B or m changes T but phase spread stays 0. Holds: non-relativistic.
**3 Mass spectrometer.** Knows: r, T. Question: how to read mass from a landing spot? Input B, unknown m; seek x = 2r and recovered m = qBx/(2v). Controls: m moves landing point; B rescales all, recovered m unchanged. Holds: same entry speed v = 1, ideal slit.
**4 Crossed E and B.** Knows: electric force qE, magnetic qvB. Question: which speed goes straight? Input v, E; seek v = E/B. Controls: set v = E/B → straight; otherwise bends (direction in readout). Holds: uniform fields, B = 1, closed-form drift solution (probe checks against numerical integration).
**5 Recap.** Quiz: proton vs alpha radius → alpha 2×. Links: electric-fields#step4, momentum-collision#step1.

## First-appearance terms
Lorentz force (0): force on a moving charge, q v×B. Uniform circular motion / centripetal force (1): constant-speed turn with inward force. Period T (2): time per lap. Mass spectrometer (3): device reading mass from landing position. Velocity selector (4): crossed E/B filter. Circumradius (1): radius of circle through three points.

## Simulation vs reality
Single particle, no radiation or relativity, m = 1 and |q| = 1 teaching units, uniform fields, slow-motion animation. Real spectrometers have finite slits, velocity spread and field edges.
