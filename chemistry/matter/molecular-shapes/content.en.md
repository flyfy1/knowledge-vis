---
lang: en
---

::: strings
pageTitle: Molecular Shapes · Electron Pairs Keeping Out of Each Other's Way
tagline: Electron pairs around a central atom repel one another and settle into the most spread-out arrangement; that is why water is bent and methane is a regular tetrahedron.
:::

## N electron pairs: how do they sit farthest apart? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Spread out
:::

::: html step0-1
:::

This step answers: what shape do the electron pairs around a central atom take (the valence-shell electron-pair repulsion model, VSEPR)? Each pair is a negatively charged "electron region" (a single bond, a double bond or a lone pair each count as one region), and they repel one another, so they spread out as far as possible on a sphere centred on the atom. The plot places N points on a sphere that push each other apart with a 1/r² force (r is the distance between two points); press replay to watch them move from random positions to the most stable arrangement. Drag the canvas or use the rotation slider to turn the view. {#s0e .explain}

::: html step0-2
s0o: Set N to 2, 3, 4, 5 and 6 in turn and replay: the final arrangements are linear, trigonal planar, tetrahedral, trigonal bipyramidal and octahedral; the readout's smallest angle should be 180°, 120°, 109.5°, 90° and 90°.
lN: Electron pairs (regions) N
lYaw: Rotate view
bReplay: Replay: settle again from a random start
bNew: Try a different random start
:::

::: strings
r0: N = {n}: {shape}; current smallest angle {amin}°, largest {amax}°; repulsion energy {e} (relative units), at iteration {it}.
shLin: linear
shTri: trigonal planar
shTet: tetrahedral
shTbp: trigonal bipyramidal
shOct: octahedral
:::

## How does the repulsion energy come down step by step? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Energy falls
:::

::: html step1-1
:::

This step answers: do the pairs really end up at the most stable positions? Each arrangement has a total repulsion energy E = Σ qᵢqⱼ/r (summed over all pairs of points, with q the "charge" of each region, here 1). From 5 different random starts, each step moves every point a little along its force direction (then back onto the sphere) and E falls step by step. Each line on the right is one start; the dashed line is the lowest energy found among them. Slide "iterations done" and the left shows start 1's arrangement at that moment. {#s1e .explain}

::: html step1-2
s1o: Drag the iteration slider from 0 to 400: the arrangement on the left tidies up and the dot on the right slides down its curve; check whether all 5 lines reach the dashed line (occasionally a start stalls at a higher local minimum), then try "5 new starts".
lIt: Iterations done
bNew5: Draw 5 new random starts
:::

::: strings
r1: N = {n}, step {it}: start 1 has repulsion energy E = {e}; lowest final energy among the 5 starts {emin}; {k} starts reached it (within 0.001).
:::

## Lone pairs: they do not bond, but they take more room {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Lone pairs
:::

::: html step2-1
:::

This step answers: why is water bent and ammonia pyramidal? Of the central atom's N regions, some connect to other atoms (bonding pairs, small cyan balls) and some are **lone pairs** (electron pairs that do not bond, big pink balls). A lone pair is held only by the central atom, so its cloud is fatter and repels more (this page gives a lone pair "charge" 1.2 against 1 for a bonding pair). A molecule's **shape** counts only atom positions, not lone pairs. The sliders N and lone-pair count L together set the AXₘEₙ type and the shape; the simulation uses the lowest-energy result of 30 random starts. {#s2e .explain}

::: html step2-2
s2o: With N = 4, move L from 0 to 1 to 2: the shape goes from tetrahedral to pyramidal to bent, and the bond angle shrinks from 109.5°; then set N = 5 with L = 1, 2, 3 and see whether the lone pairs all sit in the "equatorial" positions.
lL: Of which lone pairs
:::

::: strings
r2: N = {n}, {b} bonding pairs, {l} lone pairs: shape {shape}; bond angle(s) in the model {angles}; ideal angle (no lone pairs) {ideal}°. {cap}
capNote: (Simple-model limit: at most {m} lone pairs are used for this N.)
expAng: bond angle {a}°
expSf4: axial–axial 173°, equatorial–equatorial 102°
shBent: bent
shPyr: trigonal pyramidal
shSee: seesaw
shT: T-shaped
shSqp: square pyramidal
:::

## Real molecules: does the model match experiment? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Real molecules
:::

::: html step3-1
:::

This step answers: how does the same electron-pair repulsion rule give the shapes of real molecules? Pick a molecule and the page runs the same simulation with the number of bonding pairs and lone pairs on its central atom (N, L), and sets the **model bond angle** beside the textbook **experimental value**. A double or triple bond counts as one electron region. The model has a single parameter (lone pairs are fatter), so H₂O at 104.5° and NH₃ at 107° come out roughly right, but not exactly. {#s3e .explain}

::: html step3-2
s3o: Click CH₄, then NH₃, then H₂O: the bond angle shrinks as lone pairs go 0, 1, 2; then click SF₄ and XeF₂ and see where the lone pairs sit, and why linear XeF₂ has 3 lone pairs.
mCo2: CO₂
mBf3: BF₃
mCh4: CH₄
mNh3: NH₃
mH2o: H₂O
mSf4: SF₄
mSf6: SF₆
mXef2: XeF₂
:::

::: strings
r3: {mol}: N = {n}, L = {l}, shape {shape}; model smallest bond angle {amin}°, largest {amax}°; experiment: {exp}.
mCo2n: carbon dioxide
mBf3n: boron trifluoride
mCh4n: methane
mNh3n: ammonia
mH2on: water
mSf4n: sulfur tetrafluoride
mSf6n: sulfur hexafluoride
mXef2n: xenon difluoride
:::

## Shape decides polarity: bonds can be polar without the molecule being polar {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Polarity
:::

::: html step4-1
:::

This step answers: why is CO₂ non-polar but H₂O polar? Every bond has a **bond dipole** (an arrow pointing toward the more electronegative atom, with length equal to the electronegativity difference). The molecule's dipole is the **vector sum** of all bond dipoles (the lone pairs' contribution is ignored here): in a symmetric shape the arrows cancel to 0; in an asymmetric one they add up to a net dipole. Electronegativities are Pauling values (C 2.55, H 2.20, N 3.04, O 3.44, F 3.98, B 2.04, S 2.58, Xe 2.6). {#s4e .explain}

::: html step4-2
s4o: Click CO₂, BF₃ and CH₄ (polar bonds, but the sum is 0) and then NH₃ and H₂O (a net dipole); rotate the view and see which way the resulting arrow (orange) points.
:::

::: strings
r4: {mol}: {nb} polar bonds, magnitude of the sum of bond dipoles = {dip} (electronegativity-difference units): {res}.
polar: polar molecule (net dipole)
nonpolar: non-polar molecule (dipoles cancel)
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) valence-shell electron regions repel and spread out as far as possible: 2 linear, 3 trigonal planar, 4 tetrahedral, 5 trigonal bipyramidal, 6 octahedral; (2) the repulsion energy falls to a minimum; (3) lone pairs are fatter and squeeze bond angles, while shape counts only the atoms; (4) real molecules' angles roughly match the model; (5) molecular polarity is the vector sum of bond dipoles, set by the shape. {#s5e .explain}

::: html step5-2
qq: The oxygen atom in water has 2 bonding pairs and 2 lone pairs. What is the molecule's shape?
qo0: Linear
qo1: Bent
qo2: Tetrahedral
s5m: This page is a point-charge sphere version of VSEPR: each electron region is a point on a sphere and a lone pair has 1.2 times the "charge". It ignores orbitals, hybridisation, bond-length differences, the larger size of multiple bonds and atom size; for N = 6 with two or more lone pairs (such as square-planar XeF₄) this simple model fails, so step 2 caps it at one lone pair; real molecules are quantum systems and angles also depend on substituents. The animation is a gradient-descent demonstration, not electrons moving.
lk0: Atomic structure: where valence (outer-shell) electrons come from
lk1: Electric fields: like charges repel, the source of field and force
:::

::: strings
iter: iter
qwhy: The 4 regions form a tetrahedron, but shape counts only the atoms (2 H), so it is bent, and the lone pairs squeeze the H–O–H angle (step 2 with N = 4, L = 2).
:::
