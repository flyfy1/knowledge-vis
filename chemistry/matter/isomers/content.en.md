---
lang: en
---

::: strings
pageTitle: Isomers · The Same Atoms, Put Together Differently
tagline: Same molecular formula, different connections between atoms, means different molecules: count the skeletons, tell "drawn differently" from "really different", and see why double bonds keep cis and trans apart.
:::

## Both are C₄H₁₀, yet they are two different molecules {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One formula, two molecules
:::

::: html step0-1
:::

This step answers: must molecules with the same formula be the same substance? No. **Isomers** have the same molecular formula but different connections between atoms (a different skeleton). The carbon skeleton of an alkane (a chain with only C–C and C–H bonds) is a "tree": each carbon has at most 4 bonds and the rest go to hydrogen. In the figure a circle is a carbon atom, the number inside is how many hydrogens it carries, and a line is a C–C bond. The readout counts C and H straight from the picture and sets them beside measured boiling points: a different skeleton means different physical properties. {#s0e .explain}

::: html step0-2
s0o: Look at the two isomers for n = 4: check whether the counts of C and H in the readout match and whether the boiling points do; then move n to 5 and 6 and step through each isomer, noticing how boiling point changes as branching increases.
lN: Number of carbons n
lI: Which isomer
:::

::: strings
r0: {name} (isomer {k} of {m}): C{c}H{h}, longest carbon chain {len} carbons, boiling point {bp} °C.
nm_butane: butane (n-butane)
nm_2mp: 2-methylpropane (isobutane)
nm_pentane: pentane (n-pentane)
nm_2mb: 2-methylbutane (isopentane)
nm_22dmp: 2,2-dimethylpropane (neopentane)
nm_hexane: hexane (n-hexane)
nm_2mpe: 2-methylpentane
nm_3mpe: 3-methylpentane
nm_23dmb: 2,3-dimethylbutane
nm_22dmb: 2,2-dimethylbutane
:::

## Count them: how many skeletons can n carbons make? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Count skeletons
:::

::: html step1-1
:::

This step answers: as the number of carbons grows, how fast does the number of isomers grow? The program generates all skeletons by "adding one new carbon to some carbon of a tree (which can have at most 4 bonds)", then removes repeats with the tree's **canonical form** (describe the tree level by level from its centre; trees that are the same shape get the same description). What is left are the distinct skeletons, and each small picture on the canvas is one. For n = 1…8 the counts are 1, 1, 1, 2, 3, 5, 9, 18: growth speeds up. {#s1e .explain}

::: html step1-2
s1o: Move n from 2 to 8: count the small pictures and check the number in the readout; see how the count grows for n = 4, 5, 6, then estimate roughly how many n = 9 and 10 would have.
lN8: Number of carbons n
:::

::: strings
r1: n = {n}: {cnt} different carbon skeletons; every one has formula C{n}H{h}; compared with {pc} at n = {p}, growth of {gr}×.
:::

## Drawn differently or really different? Let the canonical form decide {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Same or not
:::

::: html step2-1
:::

This step answers: are two differently drawn pictures the same molecule? One molecule can be drawn in different ways (rotated, flipped, starting from another carbon), and different molecules can look alike. To decide, turn both trees into their **canonical form** (a description that does not depend on the drawing); if they match it is the same molecule. The page gives you a random pair of pictures; judge "same molecule" or "different molecules", then check against the canonical form. {#s2e .explain}

::: html step2-2
s2o: First count the longest carbon chain and the branch positions in each picture yourself, then judge; after answering, check whether the two pictures' "longest chain" and canonical form agree in the feedback; do several questions and watch for pictures that look different but are the same.
lN7: Number of carbons n
bSame: Same molecule
bDiff: Different molecules
bNext: Another question
bResetScore: Reset: clear the score
:::

::: strings
r2q: Question {k} (n = {n}): are the left and right pictures the same molecule? (answered {tot}, correct {ok})
r2a: {good}: canonical forms are {eq}; the left picture's longest chain is {l1} carbons and the right's is {l2}, and both have {n} carbons. (answered {tot}, correct {ok})
good: Correct
bad: Wrong
eqSame: identical — the same molecule, just drawn differently
eqDiff: different — two different molecules (isomers)
:::

## Functional-group isomers: more kinds of atom, bigger differences in connection {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Functional-group isomers
:::

::: html step3-1
:::

This step answers: once an oxygen atom is added, how many ways can one formula be put together? In the figure circles are carbon (grey) and oxygen (red), and the number is the hydrogens attached; oxygen has at most 2 bonds. C₃H₈O has 3 isomers: 1-propanol (OH at the chain end), 2-propanol (OH on the middle carbon) and methyl ethyl ether (oxygen between two carbons, an ether). C₂H₆O has 2: ethanol and dimethyl ether. The formula is counted from the picture; boiling points differ a great deal because alcohols with O–H can hydrogen-bond to each other and ethers cannot. {#s3e .explain}

::: html step3-2
s3o: Click 1-propanol, 2-propanol and methyl ethyl ether in turn: confirm the formula in the readout is the same while the boiling points differ; then click ethanol and dimethyl ether and compare their boiling points (over a hundred degrees apart).
mPr1: 1-propanol
mPr2: 2-propanol
mMeEt: methyl ethyl ether
mEtOH: ethanol
mDme: dimethyl ether
:::

::: strings
r3: {name}: C{c}H{h}O; {kind}; boiling point {bp} °C.
nm_pr1: 1-propanol
nm_pr2: 2-propanol
nm_meet: methyl ethyl ether
nm_etoh: ethanol
nm_dme: dimethyl ether
kAlcohol: alcohol (has –OH, can hydrogen-bond)
kEther: ether (C–O–C, cannot hydrogen-bond)
:::

## Cis–trans isomers: a single bond can turn, a double bond cannot {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Cis and trans
:::

::: html step4-1
:::

This step answers: why does 2-butene have cis and trans forms while butane does not? Look at the middle carbon–carbon bond, with a methyl group on each end. Twisting about a **single bond** changes the energy only slightly (this page takes a maximum of 12 kJ/mol), which room-temperature thermal motion easily clears, so the twisted forms are the same molecule; twisting about a **double bond** means breaking half of the bond, a much higher barrier (this page takes 265 kJ/mol), so at room temperature it hardly turns, and the cis form (θ = 0°, methyls on the same side) and the trans form (θ = 180°, opposite sides) are two separable substances. The relative chance of crossing a barrier is estimated by e^(−ΔE/RT) (R = 8.314×10⁻³ kJ/(mol·K), T = 298 K, as in the activation-energy lesson). {#s4e .explain}

::: html step4-2
s4o: Choose the single bond first and drag θ from 0° to 180°: the energy rises only to a small hill; then choose the double bond and drag again: the energy shoots up to hundreds of kJ/mol; compare with the "relative chance" e^(−ΔE/RT) in the readout.
lTw: Twist angle about the middle bond θ (°)
bSingle: Single bond (like the middle C–C in butane)
bDouble: Double bond (like the middle C=C in 2-butene)
:::

::: strings
r4: {kind}: θ = {th}°, twist energy {e} kJ/mol; highest barrier {bar} kJ/mol, relative chance of crossing at room temperature e^(−ΔE/RT) = {p}; {res}.
kSingle: single bond
kDouble: double bond
resFree: turns freely, so the twisted forms are the same molecule
resLocked: hardly turns, so cis and trans are two separable molecules
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) isomers share a molecular formula but differ in connection, and differ in physical properties; (2) alkane skeletons are trees, with 2, 3, 5, 9, 18 of them for n = 4, 5, 6, 7, 8; (3) to tell whether two pictures show the same molecule, compare canonical forms, not how alike they look; (4) oxygen-containing functional-group isomers (alcohol and ether) have very different boiling points; (5) a double bond cannot turn freely, hence cis–trans isomers, while a single bond can, hence none. {#s5e .explain}

::: html step5-2
qq: How many different carbon skeletons (isomers) does C₅H₁₂ have?
qo0: 2
qo1: 3
qo2: 5
s5m: The isomers here are carbon skeletons (constitutional isomers), only saturated chain alkanes plus the alcohols and ethers of step 3; rings, structural isomers containing C=C, chirality (mirror-image isomers) and the details of conformational energy are not covered; boiling points are common handbook values for comparison only; the twist energies in step 4 are teaching functions: (12/2)(1 − cos3θ) for the single bond and (265/2)(1 − cos2θ) for the double bond; trees are drawn by automatic layout and may overlap or look odd, but the structure (canonical form) is computed exactly.
lk0: Molecular shapes: how the bonds around each carbon form a tetrahedron and other shapes
lk1: Activation energy: barriers and e^(−ΔE/RT), the same crossing-chance estimate
lk2: Particles & states: boiling points and forces between molecules
:::

::: strings
qwhy: Pentane, 2-methylbutane and 2,2-dimethylpropane make 3 (the count for n = 5 in step 1).
:::
