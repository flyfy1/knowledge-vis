# BRIEF · photoelectric-effect 光电效应

category `physics`, stage `university`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe, headless-Chrome sweep); no independent review. Dedup: no existing photoelectric page.

## Steps
**0 Light on metal.** Knows: light is bright or dim. Question: when do electrons leave? Input f, intensity; seek photon count, electron count. Controls: Play spawns photons (rate ∝ intensity) and electrons only when hf > φ; Reset clears photons, electrons, counters; low f → zero electrons. Holds: Na, 1 photon → 1 electron idealisation.
**1 Energy ledger.** Knows: photon energy. Question: where does hf go? Input f, intensity, metal; seek E_k,max = hf − φ, f₀ = φ/h. Controls: raise f past the orange φ line → green KE and current; high intensity below f₀ → no current; metal buttons move φ. Holds: surface electrons, one-photon absorption.
**2 Measure h.** Knows: E_k,max formula. Question: can we measure h? Input f; seek slope/intercept of fitted line. Controls: Record adds a point with deterministic ±0.04 eV simulated error, Clear removes all, metal change clears points; fit h ≈ 4.14, φ. Holds: ≥ 2 points above threshold; noise is artificial.
**3 Stopping voltage.** Knows: E_k,max. Question: how to measure KE directly? Input V, f, metal; seek V_s = E_k,max/e. Controls: sweep V → current zero at V_s; grey half-intensity curve shares V_s. Holds: assumed uniform KE distribution gives linear I(V).
**4 Wave model fails.** Knows: photons. Question: why not continuous waves? Input log intensity; seek t_wave = φ/(I·A_atom) vs t_photon = hf/(I·A_plate) (A_atom 1e-19 m², A_plate 1e-4 m²). Controls: slider moves orange bar from hours to seconds, blue bar stays ~1e-12 s. Holds: order-of-magnitude estimate.
**5 Recap.** Quiz: below-threshold intensity ×10 → still no electrons. Links: atomic-structure#step2, lens#step0, interference#step1.

## First-appearance terms
Photon (0); work function φ (0); threshold frequency f₀ (1); maximum kinetic energy (1); least-squares fit (2); stopping voltage (3); photocurrent (1).

## Simulation vs reality
Work functions are rounded textbook values; real quantum efficiency 0.1–10%; contact potential, surface state, temperature ignored; I(V) shape simplified; slow-motion animation.
