# Power converters: independent design review and adjudication

2026-10-18. Reviewer: independent math_physics_design_review agent. Implementer: Codex.

Verdict: build one seven-step /power-converters/ lesson, reusing the site's static bilingual lesson architecture and atlas. No separate app or simulation framework.

Adopted before implementation: teach voltage, conventional current, power, KCL/KVL and passive polarity first; use signed ideal component experiments with positive, zero and negative drives; preserve history; use complete return paths and correctly oriented diodes; sample four intervals per switching cycle (two halves of ON and two halves of OFF); distinguish periodic steady state from startup and instantaneous readings from averages. Buck capacitor current changes sign within each phase. Use a clearly labelled constant-current load. Keep efficiency as a separate power budget. Explain feedback without claiming the model simulates a controller.

Adopted model: ideal CCM, small output-ripple approximation, f=20 kHz, L=1 mH, C=470 µF, constant output current 1 A, Vin=5–12 V and duty=20–75%. All allowed cases maintain positive inductor current. At 12 V and 50% duty: buck 6 V / 0.5 A average input; boost 24 V / 2 A average input. Right-continuous switch-state samples; current continuous. Initial point is the valley of an already periodic orbit.

P0: component memory, complete current paths, four subintervals, volt-second derivation, power balance, bilingual state parity, keyboard and mobile flow. Highest-return slice: manipulate component memory, then follow the same stored energy through two switch states. P1: atlas integration and related control reading. P2: no decorative animation.

Deferred: capacitor voltage ripple plot, startup, DCM, ESR, gate driving, saturation, synchronous variants and closed-loop dynamics. These require additional models and would obscure the first causal explanation. No override of reviewer recommendations. Physical hardware and learning outcomes remain unverified.

Validation duties: independent numeric fixtures, signed energy changes, periodic current and volt-second/charge balance, positive current throughout domain, reset/history/locale combinations, 320px/desktop/zoom, full paths and diode orientation, and independent fresh-context learner review.
