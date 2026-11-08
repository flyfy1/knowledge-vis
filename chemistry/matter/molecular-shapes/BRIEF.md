# BRIEF · molecular-shapes 分子构型

category `chemistry`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe: ideal angles, hand-computed tetrahedron/octahedron energies, VSEPR cases, dipoles; headless-Chrome sweep; one screenshot check); no independent review. Dedup: atomic-structure covers electron shells, not 3D geometry.

## Steps
**0 Spread out.** Knows: electrons carry negative charge. Question: how do N pairs sit farthest apart? Input N, view; seek angles (180, 120, 109.5, 90). Controls: N slider re-runs from the best of 12 seeded starts; Replay re-plays the same relaxation; New start changes seed; drag/rotate view. Holds: points on a sphere, 1/r² repulsion, equal charges.
**1 Energy falls.** Knows: shape from step 0. Question: do pairs really reach the minimum? Input N, iteration, start seed; seek E per iteration for 5 starts. Controls: iteration scrubs structure of start 1 and a dot on its E curve; "5 new starts" reseeds; some starts may stall higher (local minima, honest). Holds: gradient steps η = 0.05.
**2 Lone pairs.** Knows: bonding vs non-bonding pairs. Question: why is water bent? Input N, L; seek bond angles (model) and shape name. Controls: L raises lone count (pink big balls), angles shrink, lone pairs go equatorial for N = 5. Holds: lone charge 1.2; N = 6 limited to 1 lone pair, N−2 otherwise.
**3 Real molecules.** Knows: model. Question: does it match experiment? Input molecule; seek model min/max bond angle beside experimental number. Controls: 8 buttons. Holds: model ≈ experiment within ~2° for CH₄/NH₃/H₂O; SF₄ qualitative.
**4 Polarity.** Knows: shape. Question: why is CO₂ non-polar, H₂O polar? Input molecule; seek |Σ bond dipoles|. Controls: orange net-dipole arrow, zero for symmetric shapes. Holds: Pauling EN, lone pairs ignored.
**5 Recap.** Quiz: water bent. Links: atomic-structure#step3, electric-fields#step0.

## First-appearance terms
Electron region/domain (0); VSEPR (0); repulsion energy (1); bonding pair vs lone pair (2); AXₘEₙ (2); bond dipole, electronegativity (4).

## Simulation vs reality
Point-charge sphere only: no orbitals, hybridisation, bond lengths, multiple-bond size, substituent effects; fails for ≥ 2 lone pairs at N = 6 (e.g. XeF₄ square planar) so capped; not a quantum calculation.
