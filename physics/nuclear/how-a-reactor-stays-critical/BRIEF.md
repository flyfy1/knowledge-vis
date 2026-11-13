# Fission: How a Reactor Stays Critical (`physics/nuclear/how-a-reactor-stays-critical/`)

Built-By: Antigravity (gemini-4-hydrogen)
Target assignment: `#46` from `specs/essay-briefs/QUEUE-DEEP2.md` §13 (`GAP-AUDIT-NOTES.md` #13)

## Overview
Deep-track interactive bilingual essay (`中 | EN`) tracing the full reactor-physics ladder from nuclear binding energy (`AME2020`), thermal fission cross sections and elastic moderation (`ENDF`), the six-factor formula (`k_eff = η·f·p·ε·P_F·P_T`), Keepin 6-group delayed-neutron point kinetics (`β = 0.00645`) with Doppler feedback, coupled `I-135 → Xe-135` poisoning (48-hour iodine pit), `Way–Wigner` shutdown decay heat and water boil-off, spent-fuel radiotoxicity horizons (`1 yr → 100 kyr`), to 2026 frontier status and reactor architecture tradeoffs.

## Verified Primary Sources (opened 2026-11-13)
1. **Nuclear masses & Q-values**: Wang et al., *AME2020 Atomic Mass Evaluation*, Chinese Physics C 45 (2021), plus CODATA 2018 constants (`m_u = 931.49410242 MeV/c²`). Consistent with sibling `physics/modern/why-fusion-is-hard/models.js`. Cross-checked `Pu239`, `Xe140`, `Sr94`, `Pb208` AME2020 values via IAEA/NNDC summary search.
2. **Cross sections & moderation**: ENDF/B-VIII.0 (`σ_f(U-235, 0.0253 eV) ≈ 585 b`, fast ~`1.2 b`, `σ_a(H) ≈ 0.332 b`, `σ_a(D) ≈ 0.00052 b`). Reference: https://www-nds.iaea.org/ & https://www.nndc.bnl.gov/
3. **Delayed neutrons**: G. R. Keepin, *Physics of Nuclear Kinetics* (Addison-Wesley, 1965) 6-group thermal U-235 delayed neutron constants (`β = 0.00645`, `τ̄ ≈ 13.03 s`).
4. **Xenon-135**: `T_1/2(I-135) = 6.57 h`, `T_1/2(Xe-135) = 9.14 h`, `σ_a(Xe-135) = 2.65e6 b`, fission yields `γ_I = 0.0639`, `γ_Xe = 0.00248`.
5. **Decay heat**: K. Way & E. P. Wigner, *Radiation from Fission Products*, Phys. Rev. 73 (1948) 1318 (`0.0622 * [t^-0.2 - (t+t_s)^-0.2]`), cross-checked with ANSI/ANS-5.1 ranges.
6. **Global fleet & 2026 frontier** (verified 2026-11-13 via `search_web`):
   - IAEA PRIS (https://pris.iaea.org/PRIS/home.aspx): 413 operable reactors, ~377.1 GWe net operable, ~72 under construction.
   - World Nuclear Association (https://world-nuclear.org/): ~2,702 TWh (~9% global electricity); Vogtle 4 commercial Apr 29, 2024; Barakah 4 commercial Sep 5, 2024 (4 units ~40 TWh/yr); Flamanville 3 grid Dec 21, 2024; HTR-PM Shidaowan commercial Dec 6, 2023 (200 MWe).
   - Centrus Energy HALEU Piketon: Phase I (20 kg) + Phase II (900 kg mid-2025, >920 kg cumulative 5–20% HALEU).
   - US NRC milestones (https://www.nrc.gov/): NuScale 77 MWe standard design approval (May 2025, following Nov 2023 UAMPS CFPP cancellation); TerraPower Natrium Kemmerer Unit 1 construction permit (Mar 2026, 345 MWe / 500 MWe peak); X-energy/Dow 4-unit Xe-100 construction permit approval (2026); Kairos Power Hermes 35 MWth permit extended (May 2026 to Apr 2029).

## Tuned / Calibrated Model Parameters
- **Ch2 (`sigmaF235`, `sigmaC238`)**: Thermal (`585 b`) and fast (`1.2 b`) ENDF anchors with smooth log-Gaussian analytical envelopes representing the dominant `6.67 eV / 21 eV / 66 eV` U-238 resonance window for interactive legibility.
- **Ch3 (`LATTICE_MODES`)**: Effective 1-group thermal lattice parameters (`structAbs = 4.5 b` in PWR for Zr cladding + operational dissolved boron shim, `rodScale = 22.0 b` so mid-stroke rods cross `k_eff = 1.000` cleanly at 4.5% enrichment while 0.72% natural U stays firmly `< 1` at `k_eff = 0.671` in light water and `> 1` at `1.078` in heavy water; 40% void drops 4.5% PWR `k_eff` from `1.423` to `1.233`).
- **Ch4 (`kineticsSim`)**: Prompt generation time `Λ = 50 μs`, unconditionally stable implicit backward Euler solver with `τ_th = 4.0 s`, `K_T = 320 K`, `α_D = 2.8 pcm/K` for lumped Doppler fuel feedback.
- **Ch5 (`xenonSim`)**: Typical thermal-reactor worth factor `1 / (2.43 * 0.85)` giving `-2,541 pcm` equilibrium Xe at `φ = 3e13 n/cm²·s` and `-4,825 pcm` iodine pit around `8.4 h`.
- **Ch7 (`WASTE_GROUPS`)**: 4-group exponential approximation (`1.8 yr`, `29.5 yr`, `432.2 yr`, `18,000 yr`) calibrated to 45 GWd/tHM UOX decay heat (`~10 kW/tHM` at 1 yr) and ingestion radiotoxicity relative to natural uranium ore (`~126 kyr` once-through crossover vs `~363 yr` with Pu/MA separation).

## Checked vs. Not Yet Checked
- **Checked**:
  - `node --check` syntax validation across `models.js`, `copy.zh.js`, `copy.en.js`, `app.js`, `tests/models.cjs`, `tests/browser.cjs`.
  - `node physics/nuclear/how-a-reactor-stays-critical/tests/models.cjs` (all physics invariants, every `.say.` branch, 100% `zh`/`en` key/placeholder/HTML tag/`href` parity, zero CJK outside `copy.zh.js` and allowed HTML fallback, all prose numbers pinned to `FissionModels.prose()`, `REGISTRY.json` structure).
  - `node scripts/atlas-import-registry.cjs physics/nuclear/how-a-reactor-stays-critical/ --out /tmp/agent-tasks/essays/how-a-reactor-stays-critical/atlas-preview.json` schema validation.
- **Not yet checked** (deferred per swarm `#56` phase wrap-up):
  - Live Playwright render/smoke (`tests/browser.cjs`) and `tests/canvas-text-overlap.cjs --sweep` across 1280 / 390 / 320 px widths.
