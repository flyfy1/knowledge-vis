# BRIEF · isomers 同分异构体

category `chemistry`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe: exact isomer counts 1,1,1,2,3,5,9,18 for n = 1..8, canonical-form invariance, H = 2n+2, formula from graph, torsion energies; headless-Chrome sweep; one screenshot check); no independent review. Dedup: no isomer page; molecular-shapes covers 3D geometry only.

## Steps
**0 One formula, two molecules.** Knows: molecular formula. Question: same formula, same substance? Input n, isomer index; seek C/H counts from the drawn tree, longest chain, boiling point. Controls: n = 4–6, isomer slider (clamped to the count, shown in readout), bp bars highlight selection; branching lowers bp. Holds: handbook bp, saturated alkanes only.
**1 Count skeletons.** Knows: tree skeleton. Question: how many skeletons for n carbons? Input n = 2–8; seek count (exact enumeration with canonical form) and growth. Controls: gallery redraws all skeletons. Holds: max degree 4, no rings, no stereo.
**2 Same or not.** Knows: canonical form idea. Question: same molecule or different? Input n, own judgement; seek truth by canonical-form equality. Controls: Same/Different (one answer per question), Another question, Reset (clears score, question 1); n change restarts at question 1. Holds: deterministic seeded pairs; drawings use auto layout.
**3 Functional-group isomers.** Knows: O has 2 bonds. Question: how many arrangements of C₃H₈O / C₂H₆O? Input molecule; seek formula (counted from the graph), bp, kind. Controls: 5 molecule buttons. Holds: alcohols vs ethers hydrogen-bonding explains bp.
**4 Cis–trans.** Knows: bond rotation. Question: why does 2-butene have cis/trans but butane none? Input bond type, θ; seek torsion energy, barrier, e^(−ΔE/RT) at 298 K. Controls: θ slider, Newman picture and curve move; RT line shown. Holds: teaching functions 6(1+cos3θ) and 132.5(1−cos2θ), barriers 12 and 265 kJ/mol.
**5 Recap.** Quiz: C₅H₁₂ → 3. Links: molecular-shapes#step2, activation-energy#step1, particles-states#step4.

## First-appearance terms
Isomer / structural (constitutional) isomer (0); skeleton, tree (0); canonical form (1); functional group, alcohol, ether (3); hydrogen bond (3); cis/trans, torsion (4).

## Simulation vs reality
No rings, stereocentres/chirality, C=C structural isomers or conformer populations; torsion energies are idealised cosines; boiling points rounded handbook values; tree drawings are automatic and may overlap.
