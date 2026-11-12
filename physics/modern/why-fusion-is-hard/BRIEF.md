# BRIEF · why-fusion-is-hard 核聚变为什么总是“还要三十年”

- Built-By: Claude Code (claude-opus-5-5), essay batch (deep track), 2026-11-11
- Verified-By: self-check by the builder — node model test, Playwright smoke test in zh at 1280/390/320, canvas-text-overlap --sweep (1280/390/320 × zh/en), figure screenshots at three widths, re-read as a reader. Independent review: pending.
- category `physics` (exists), subtopic `modern` (exists, 近代物理), stage `university`
- Format note: no lesson-shell, no provenance label (the integrator adds it). One long essay, 11 chapters, 14 canvases. All visible text in `copy.zh.js`; `copy.en.js` is loaded if present and each key falls back to zh.
- Files: `index.html`, `copy.zh.js`, `models.js` (UMD, `window.FusionModels`), `app.js`, `REGISTRY.json`, `tests/models.cjs`, `tests/browser.cjs` (env `ESSAY_BASE_URL`, default `http://127.0.0.1:18986`; `SHOTS_DIR=<dir>` saves full-page screenshots).

## The one question

为什么核聚变总是“还要三十年”？The essay answers by climbing: where the energy is (masses), why it is hard to get at (a Coulomb wall, crossed only by tunnelling in the Maxwellian tail), what "working" means (power balance → the Lawson triple product), the two ways to hold the fuel (magnetic, inertial), why plasma gain is not plant gain, the three engineering walls behind ignition (tritium, neutrons, exhaust), where the records stand in 2026, and finally where the phrase itself comes from. The last chapter gives both readings: the 1976 plan tied dates to budgets that were never paid, and the physics also turned out harder than the 1970s plans assumed.

## Chapters (model → standard result)

1. 质量去哪了 — binding energy from AME2020 atomic masses; Q-values (D–T 17.589 MeV; D–D 3.269/4.033; D–³He 18.353; p–¹¹B 8.68; ²³⁵U fission 173.3 MeV prompt-fragment channel). Energy per kg vs fission and coal.
2. 隔着一堵墙 — Coulomb barrier 1.44·Z₁Z₂/r MeV·fm, r = 1.2(A₁^⅓+A₂^⅓) fm (D–T 444 keV); Maxwell–Boltzmann tail fraction erfc(√x)+2√(x/π)e^{−x}, computed in logs.
3. 穿墙而过 — Gamow factor, Gamow peak E₀ = (E_G T²/4)^⅓; Bosch–Hale (1992) ⟨σv⟩ for D–T, D–D, D–³He (D–T peak 67 keV), checked against direct integration of the Bosch–Hale cross-section.
4. 收支要平衡 — 0-D power balance with bremsstrahlung (C_B = 5.35e-37), Lawson: ignition minimum 2.9e21 keV·s/m³ at 14 keV; Q = 1 minimum 4.7e20; ideal-ignition (brems crossover) 4.3 keV.
5. 用磁场把它关住 — guiding-centre orbits (curvature + ∇B drift, μ conserved, mirror force), RK4 in an ITER-sized large-aspect-ratio field; trapping boundary v∥/v = 0.527; energy error < 1e-6.
6. 装置要做多大 — ITER98(y,2) scaling in a 0-D tokamak (flat profiles, Greenwald fraction, Troyon β_N); ITER preset 521 MW, Q 10.4; SPARC preset Q 3.2 vs design 11 (the gap is profiles/H-factor; stated in the copy).
7. 另一条路：压缩到极致 — ICF: burn fraction ρR/(ρR+H_B), H_B = 6 g/cm²; Fermi-degenerate pressure × isentrope α; isobaric hot spot; driver energy = fuel energy / coupling; convergence ratio and symmetry tolerance.
8. Q 有好几个 — plant power flow (blanket multiplication, η_th, heating wall-plug efficiency): Q_eng = 1 needs Q_sci 4.7; Q_eng = 5 needs 27.
9. 点着之后：三道工程坎 — tritium single-loop residence-time balance (after Abdou 2021) with decay; neutron wall load 0.8·P/A and years to a dpa-limited fluence; SOL width Eich #14 λ_q = 0.63·B_pol^−1.19 mm and the radiated fraction needed for a 10 MW/m² target.
10. 前沿在哪 — data chapter: triple-product history (Wurzel & Hsu), NIF ignition shots, demonstrated vs claimed.
11. 为什么总是“还要三十年” — ERDA-76/110/2 Logic I–V budget curves vs actual US appropriations (CRS RL30417), deflated FY1978→FY2000 by 2.44; actual first below Logic I ("never") in 1988; cumulative actual as share of plan: II 39%, III 29%, V 17%.

## Tuned or assumed parameters (labelled as such in the copy where they reach prose)

- Divertor spreading factor F = 40 (flux expansion × target tilt combined into one number). Chosen only to give a plausible order of magnitude; the copy calls it 调出来的参数. With it, an ITER-size 500 MW plasma with no radiation puts 166 MW/m² on the target and needs 94% radiated to reach the 10 MW/m² limit.
- ICF isentrope α = 2 and symmetry tolerance 25% (assumed round values); hot spot T_h = 10 keV, ρR_h = 0.3 g/cm²; start radius 1 mm.
- Plant: M = 1.15, η_th = 0.40, P_h = 50 MW, η_h = 0.40, "goal" Q_eng = 5 (a fifth recirculated) — typical study values, not one design.
- Tritium: processing time t_p = 4 h, reserve 1 day (Abdou gives 1–4 h and reserve of order a day).
- SPARC Greenwald fraction 0.35 (chosen to land near its published n ≈ 3e20 at the preset current); κ = 1.7 for both presets (volume elongation).
- Ch6: changing R or B keeps shape and q95 fixed, so I ∝ R·B (stated in the figure note).
- Ch5: q is held constant across the radius (stated).
- Wall: dpa-limited fluence 10 MW·yr/m² (ERDA used the same order; literature spans 6–12; the 4 MW·yr/m² low value is ERDA's).

## Sources (opened 2026-11-11 unless noted)

Physics and models:
- AME2020 atomic masses (Wang et al., Chin. Phys. C 45 (2021) 030003) — values in `models.js`.
- Bosch & Hale, Nucl. Fusion 32 (1992) 611 — coefficients for ⟨σv⟩ and the D–T S-factor.
- Lawson (1957); Wesson, *Tokamaks* ch. 1 — power-balance form (textbook, from memory of the standard form; numbers recomputed here).
- ITER Physics Basis, Nucl. Fusion 39 (1999) 2175, eq. 20 (ITER98(y,2)) and the q95 shape formula — standard, not reopened.
- Creely et al., "Overview of the SPARC tokamak", J. Plasma Phys. 86 (2020) 865860502 — https://eprints.whiterose.ac.uk/166980/1/overview_of_the_sparc_tokamak.pdf (abstract and Table 1 read).
- Sorbom et al., "ARC", Fusion Eng. Des. 100 (2015) — https://ar5iv.labs.arxiv.org/html/1409.3540 (Table 1).
- Eich et al., Nucl. Fusion 53 (2013) 093031 — https://scipub.euro-fusion.org/wp-content/uploads/2014/11/EFDP13028.pdf (regression #14, ITER λ_q ≈ 1 mm, detachment needed).
- Abdou et al., Nucl. Fusion 61 (2021) 013001 — abstract and excerpts only.
- Atzeni & Meyer-ter-Vehn, *The Physics of Inertial Fusion* (2004) §3.2 — H_B ≈ 6 g/cm² (not reopened).

History and funding:
- ERDA-76/110/2, *Fusion Power by Magnetic Confinement Program Plan* (1976) — https://www.osti.gov/servlets/purl/7138801 (figures II-2, VI-1…VI-4 read off for the Logic curves).
- CRS RL30417, US fusion appropriations Table 1 — https://www.everycrsreport.com/reports/RL30417.html
- Physics World (2018), "Ignition pending" — https://physicsworld.com/a/ignition-pending/
- Columbia Engineering, "Why fusion was always 30 years away" — https://www.engineering.columbia.edu/about/news/why-fusion-was-always-30-years-away

## Facts that will go stale (all in the FRONTIER block of `models.js`, as of 2026-11)

| Fact | Value on the page | Kind | Source (opened 2026-11-11) |
|---|---|---|---|
| Triple-product history | 1969–2023 points, record TFTR 1995 7.9e20 | demonstrated | Wurzel & Hsu, arXiv 2505.03834v6 — https://arxiv.org/html/2505.03834v6 |
| NIF ignition shots | 2022-12-05 2.05→3.15 MJ; best 2025-04-07 2.08→8.6 MJ (gain 4.13); 11 shots; latest 2026-06-20 7.9 MJ, gain ≈ 3.8 | demonstrated | LLNL https://lmf.llnl.gov/science/achieving-fusion-ignition (the 2026-06-20 yield/gain from secondary reports) |
| JET final D–T | 69.26 MJ in 5.2 s from 0.21 mg (2023-10); prev 59 MJ (2021); shut 2023-12 | demonstrated | https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record ; https://www.differ.nl/news/JET-energy-record |
| Long pulses | WEST 1337 s (2025-02-12); EAST 1066 s H-mode (2025-01-20); W7-X 43 s record triple product (2025-06) | demonstrated | https://www.differ.nl/news/world-record-WEST ; ASIPP via press; https://www.ipp.mpg.de/5532945/w7x |
| ITER 2024 baseline | SRO 2034, D–T 2039, Q ≥ 10 (500/50 MW), ~€5 bn extra | institutional plan | https://www.iter.org/sites/default/files/media/2024-07/baseline_press_conference_summary_july-2024_b.pdf ; https://www.iter.org/node/24536 |
| ITER D–T "not before 2041–42" | contested | claim (preprint) | an arXiv preprint surfaced in search; not opened — marked "有争议" on the page |
| CFS SPARC | ~80% complete (2026-08); Q > 1 planned 2027; ARC 400 MW early 2030s | company statement | https://blog.cfs.energy/sparc-progress-doe-milestone-approvals-reflect-cfs-power-plant-maturity/ ; https://cfs.energy/technology/sparc/ |
| HTS magnet | 20 T, 2021-09 | demonstrated (company) | CFS / MIT announcements (secondary) |
| Helion | Polaris 150 M°C (2026-02); Orion for Microsoft, 2028 | company statement | press reports (Axios 2026-09, Scientific American) — secondary |
| BEST (Hefei) | completion target end-2027, Q > 1 | programme target | SCMP / Sixth Tone reports (2025) — secondary |
| FIA 2026 report | $4.48 bn raised in a year, $14.24 bn total, 56 companies | industry data | https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf (via WNN summary) |

## Not verified from a primary source

- NIF wall-plug energy ≈ 300 MJ per shot (Physics Today 2022, secondary; some sources say 300–400 MJ).
- The 2026-06-20 NIF shot's 7.9 MJ and gain ≈ 3.8 (LLNL lists the date; numbers from secondary reports).
- World tritium stock 20–30 kg, ~130 g/yr per CANDU reactor, ITER lifetime use 12–18 kg (ITER Newsline 2008 and reviews).
- dpa per MW·yr/m² ≈ 10 (sources span 6–12).
- H_B ≈ 6 g/cm² (Atzeni & Meyer-ter-Vehn, not reopened); Lindl-style symmetry estimate (tolerance/(CR−1)).
- Helion, BEST and FIA figures (press/secondary); the 2041–42 ITER preprint (not opened).
- Abdou 2021: only the abstract and excerpts were read.

## Prerequisites

Linked: `physics/modern/relativity` (E = mc², ch1), `physics/modern/quantum-tunneling` (ch3), `physics/thermal/kinetic-theory` (ch2), `physics/electromagnetism/electric-fields` (ch2), `physics/electromagnetism/magnetic-force` (ch5), `physics/thermal/carnot-cycle` (ch8), `chemistry/matter/atomic-structure` and `chemistry/reactions/activation-energy` (closing links).

Missing (no page yet): nuclear binding energy and the nuclear force; plasma basics (Debye length, gyration, what a plasma is); a fuller treatment of the Maxwell–Boltzmann energy distribution and its tail.

## Fixes made after looking (screenshots at 1280/390/320, canvas sweep, re-read)

- `path()` treated `null` as 0 (`isFinite(null)` is true), so gaps in the Lawson curves (ch4), the ⟨σv⟩ curves (ch3) and the ICF "hot spot does not fit" branch (ch7) drew false vertical lines to the axis. Fixed; the curves now stop where they leave the plot.
- Ch4 on-curve labels collided at 390/320 and, once pushed apart, no longer sat in the curves' order; replaced by a legend in the empty lower-right corner, ordered like the curves.
- Ch8 power-flow row titles showed each row's total under the wrong name ("发电 · 610 MW" was the heat). Each row now says what it is: heating draw, heat, electricity, net to grid (or the shortfall).
- Ch1 fission labels (Ba, Kr, U, Fe) overlapped at 390/320; ch3 last x tick fell outside the canvas at low T (nice-step ticks now); ch10 NIF year labels collided at 320 (a year is skipped when it would touch the previous one; the separator tick stays).
- Ch9: the model's λ_q for ITER (0.6 mm) differs from Eich's quoted ~1 mm; the figure note now says so instead of leaving the reader to spot it.
- Earlier passes: long ch6 formula overflowed at 390/320 (overflow-wrap); "辐射掉 100%" impossible case became its own sentence; pitch max 0.95 so ρ never reads 0.
