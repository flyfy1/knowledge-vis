# BRIEF · resonance 共振

category `physics`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe incl. RK4 integration checks, headless-Chrome sweep); no independent review. Dedup: freqresp is the LTI/Bode view, standing-wave step 4 is string harmonics; this page is the driven damped mass-spring (damping, Q, phase). Atlas collision: node id `resonance` exists, so fragment conceptId is `resonance-mechanical`.

## Steps
**0 Natural frequency.** Knows: spring pulls back. Question: what sets the free swing rate? Input k, m; seek ω₀ = √(k/m), T. Controls: Play draws x(t), measured period from zero crossings vs formula; Reset clears trace/time. Holds: undamped, linear spring.
**1 Damping.** Knows: ω₀. Question: how does friction change the motion? Input ζ; seek decay envelope e^{−ζω₀t}, peak ratio e^{−2πζ/√(1−ζ²)}. Controls: ζ 0→1.6 passes under/critical/over damping; measured peak ratio from sampled closed-form curve. Holds: ω₀ = 2 fixed, v₀ = 0.
**2 Driven oscillator.** Knows: ζ. Question: what does a periodic push do? Input Ω/ω₀, ζ; seek steady amplitude A. Controls: Play (RK4, dt ≤ 0.01), Reset; measured max |x| over last two drive cycles vs formula. Holds: F = 1, transient lasts ~1/(ζω₀).
**3 Resonance curve.** Knows: A. Question: how does A vary with Ω? Input Ω/ω₀, ζ; seek peak position/height, Q. Controls: ζ lower → taller narrower peak; dot rides the curve. Holds: linear, one degree of freedom.
**4 Phase.** Knows: A. Question: do push and response peak together? Input Ω/ω₀, ζ; seek φ = atan2(2ζω₀Ω, ω₀²−Ω²). Controls: sweep Ω → lag 0° → 90° → 180°. Holds: steady state only.
**5 Recap.** Quiz: halve ζ at resonance → ×2. Links: standing-wave#step4, freqresp#step0, interference#step3.

## First-appearance terms
Natural angular frequency ω₀ (0); damping ratio ζ, underdamped / critical / overdamped (1); transient vs steady state (2); amplitude A (2); quality factor Q (3); phase lag φ (4).

## Simulation vs reality
Linear single-degree-of-freedom model; real structures have many modes and nonlinearity; peak location moves for large ζ (formula ω₀√(1−2ζ²) used); slow-motion animation (3× in step 2, 2× in step 0).
