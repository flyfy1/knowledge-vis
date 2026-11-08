# BRIEF · kinetic-theory 气体压强的微观图景

category `physics`, stage `university`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe with seeded long runs, headless-Chrome sweep); no independent review. Dedup: particles-states is qualitative junior-high temperature; thermodynamics covers P–V paths; this page adds the wall-impulse derivation, Boyle by counting, Maxwell distribution from collisions and equipartition (<80% overlap).

## Steps
**0 Pressure = wall hits.** Knows: particles move. Question: where does P come from? Input N; seek measured P (8 s average of impulse/time/perimeter) vs P = N⟨KE⟩/A. Controls: bars jitter around dashed line; N 40→80 doubles P; Play/Pause, Reset (re-seed gas, clear bins). Holds: 2D elastic discs, ideal walls, noise ∝ 1/√hits.
**1 Temperature.** Knows: P. Question: what does T do? Input T (rescales velocities); seek mean speed, P/T = N/A. Controls: T up → histogram shifts right, speed ∝ √T. Holds: ⟨KE⟩ = kT, k = 1, 2D.
**2 Volume.** Knows: P, T. Question: how does P depend on V? Input W; seek P·V = N⟨KE⟩. Controls: set W, wait 8 s, Record adds (V, P); Clear removes points; points fall on hyperbola. Holds: constant T (instant wall move, no compression heating).
**3 Speed distribution.** Knows: speeds. Question: why fast and slow? Input none; seek total-variation gap to f(v) = (v/T)e^{−v²/2T}. Controls: Reset starts all at one speed; Play spreads it. Holds: relaxation takes a few sim seconds; decayed histogram window.
**4 Light and heavy.** Knows: ⟨KE⟩. Question: who is faster at one T? Input M; seek RMS speed ratio → √M. Controls: Reset starts equal speeds, Play converges ⟨KE⟩ curves; M changes mass. Holds: 80 particles, noise few %.
**5 Recap.** Quiz: halve V → P ×2. Links: particles-states#step1, thermodynamics#step0.

## First-appearance terms
Pressure (0): wall impulse per time per length (2D). Mean kinetic energy ⟨KE⟩ (0): average ½mv². Temperature (1): ⟨KE⟩ = kT. Boyle's law (2): PV constant. Maxwell distribution (3). Total variation distance (3): half the sum of absolute differences of two normalized histograms. Equipartition (4). RMS speed (4).

## Simulation vs reality
2D hard discs (R = 0.05) give a few % excess pressure over ideal (excluded area); real gases are 3D with P = (2/3)N⟨KE⟩/V, intermolecular forces, internal energy modes; sim time is accelerated 3×; instant W or T changes are teaching actions.
