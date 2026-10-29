# BRIEF · doppler-effect 多普勒效应

category `physics`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe with independent arrival-time simulation, headless-Chrome sweep, one screenshot check); no independent review. Dedup: no existing Doppler page; interference/standing-wave cover superposition, not moving sources.

## Steps
**0 Still source.** Knows: waves spread. Question: what do wavefronts of a still source look like? Input f; seek λ = c/f. Controls: Play accumulates rings, f changes ring gap, Reset clears (t = 0). Holds: c = 1 teaching units, 2D rings.
**1 Moving source.** Knows: λ. Question: what do listeners ahead/behind hear? Input v/c; seek f_ahead = f c/(c−v), f_behind = f c/(c+v). Controls: slider v/c bunches rings ahead; Play animates the emission phase. Holds: v < c, listener at rest, distant listeners; picture in source frame; f = 1.2.
**2 Any direction.** Knows: ahead/behind. Question: heard frequency at angle θ? Input v/c, θ; seek f′ = f/(1 − (v/c)cosθ). Controls: θ moves listener and curve point; θ = 90° → f′ = f. Holds: θ at emission time, far-field.
**3 Pass-by.** Knows: f′(θ). Question: pitch vs time as a vehicle passes? Input v/c, b; seek f′(t) via retarded time (bisection), limits. Controls: Play/Pause builds the curve, Reset clears; smaller b steeper transition. Holds: straight path, constant speed, no loudness change.
**4 Supersonic.** Knows: rings. Question: what if v > c? Input M; seek α = arcsin(1/M). Controls: M slider; cone lines appear for M > 1; Play animates ring phase. Holds: geometry only, no shock-wave physics.
**5 Recap.** Quiz: v = 0.5c approaching → 2f. Links: standing-wave#step0, interference#step0, fourier#step0.

## First-appearance terms
Wavefront / wavelength λ (0); source frame (1); f_ahead / f_behind (1); retarded (emission) time (3); Mach number, Mach cone (4).

## Simulation vs reality
Source moves, listener at rest; still medium, constant c; 2D rings; no attenuation, wind or relativistic corrections; shock waves are far more complex than the geometric cone; animation is slow-motion.
