---
lang: en
---

::: strings
pageTitle: Periodic Trends · Gradients Across the Periodic Table
tagline: Colour atomic radius, ionisation energy and electronegativity onto the table: they change in regular gradients along periods and groups, explained by nuclear charge and the number of shells, with a few exceptions.
:::

## Paint a property onto the periodic table: the colours change in order {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Heat map
:::

::: html step0-1
:::

This step answers: are element properties on the periodic table patternless? Below are the main-group elements of the first four periods (groups 1–2 and 13–18; transition metals are left out). Brighter means a larger value. Three properties: **atomic radius** r (covalent radius, how "big" the atom is, in pm = 10⁻¹² m); **first ionisation energy** IE₁ (the energy needed to remove one outermost electron from a gas-phase atom; larger means harder to lose an electron; kJ/mol); **electronegativity** χ (Pauling scale, an atom's ability to pull electrons in a bond, unitless; noble gases do not bond, so no value is given and they show grey). Click an element or drag the slider to read the numbers. {#s0e .explain}

::: html step0-2
s0o: Click the three property buttons in turn: watch which way the brightness grows along each row (period) and down each column (group); for instance, is the brightest corner for r on the same side as those for IE₁ and χ?
lEl: Pick an element (by atomic number)
pRad: Atomic (covalent) radius r (pm)
pIe: First ionisation energy IE₁ (kJ/mol)
pEn: Electronegativity (Pauling) χ
:::

::: strings
r0: {name} ({sym}, Z = {z}, period {per}, group {grp}): r = {r} pm, IE₁ = {ie} kJ/mol, χ = {en}. Current colouring: {prop}.
noVal: no data
n_H: hydrogen
n_He: helium
n_Li: lithium
n_Be: beryllium
n_B: boron
n_C: carbon
n_N: nitrogen
n_O: oxygen
n_F: fluorine
n_Ne: neon
n_Na: sodium
n_Mg: magnesium
n_Al: aluminium
n_Si: silicon
n_P: phosphorus
n_S: sulfur
n_Cl: chlorine
n_Ar: argon
n_K: potassium
n_Ca: calcium
n_Ga: gallium
n_Ge: germanium
n_As: arsenic
n_Se: selenium
n_Br: bromine
n_Kr: krypton
:::

## Walking along a period: steady change, with small steps back {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Along a period
:::

::: html step1-1
:::

This step answers: how does the property change from left to right along a period? In the plot the horizontal axis is the element (ordered by group) and the vertical axis is the chosen property; the three lines are periods 2, 3 and 4 (the period picked by the slider is drawn thick). The overall trend: radius shrinks while ionisation energy and electronegativity grow. But ionisation energy has two small dips (such as Be→B and N→O), so it is not strictly monotonic; noble gases have no electronegativity. The readout counts changes between neighbouring elements in the selected period. {#s1e .explain}

::: html step1-2
s1o: Choose IE₁ and switch the period from 2 to 3 and 4: each line rises overall but with small dips; find between which two elements the dips happen; then choose r and check that it falls almost everywhere, with a tail upturn only at the noble gas.
lPer: Period to highlight
:::

::: strings
r1: Period {per}, {prop}: from {first} to {last} the value goes {d1}→{d2}; neighbour-to-neighbour decreases {down}, increases {up}.
:::

## Why: more nuclear charge pulls tighter, more shells loosen {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Why
:::

::: html step2-1
:::

This step answers: what is behind the pattern? An outer electron feels the **effective nuclear charge** Zeff = Z − S after inner electrons screen it (Z is the nuclear charge, S the screening constant estimated by Slater's rules: about 0.35 per electron in the same shell, 0.85 for the shell just below, 1.00 for deeper ones). The distance from the nucleus is roughly proportional to n\*²/Zeff (n\* is the effective principal quantum number: 1, 2, 3 for shells 1–3 and 3.7 for shell 4). The horizontal axis is n\*²/Zeff, the vertical axis is the measured radius, and the line is a least-squares fit. Within a period Z grows with the shell count fixed, so Zeff rises and the radius shrinks; the next period adds a shell and the radius jumps up. {#s2e .explain}

::: html step2-2
s2o: Step through Li, Be, B ... Ne: Zeff keeps rising and the point slides down the line to the left; then pick Na: Zeff drops back, a shell is added, and the point jumps back to the upper right; compare the predicted and measured radius in the readout.
:::

::: strings
r2: {name}: Z = {z}, outer shell n = {n}, Zeff = {zeff}, n\*²/Zeff = {x}; fitted predicted radius {pred} pm, measured {r} pm (difference {res} pm); correlation over all elements {cor}.
:::

## Down a group: one more shell, everything loosens {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Down a group
:::

::: html step3-1
:::

This step answers: how does a property change from top to bottom of a group? Elements in a group have the same number of outer electrons, but each period down adds a shell, so the outer electron sits farther from the nucleus and is screened more by the inner electrons. Choose a group and a property; the bars below run from top to bottom through periods 2, 3 and 4 (the noble gases also include He from period 1). The overall trend: radius grows, ionisation energy falls and electronegativity falls. {#s3e .explain}

::: html step3-2
s3o: Choose alkali metals with IE₁: the bars get shorter period by period, matching "easier to lose an electron the lower you go"; switch to halogens with χ: electronegativity falls from F downward; for noble gases with χ there are no values.
gAlk: Alkali metals Li·Na·K
gAe: Alkaline earths Be·Mg·Ca
gHal: Halogens F·Cl·Br
gNg: Noble gases He·Ne·Ar·Kr
:::

::: strings
pickBtn: Pick {s}
r3: {grp}, {prop}: {list}; ratio of last to first = {ratio}.
:::

## Predict and compare: guess with the pattern, then check with data {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Predict and compare
:::

::: html step4-1
:::

This step answers: how useful is the pattern? The page gives two elements A and B and a property; you judge which has the larger value, then see the real data. Two elements in the same period or group can be guessed with the trends above; elements in different periods and different groups have no simple rule, so you can only look up data. If the answer goes against the "overall trend" it is flagged as an exception. {#s4e .explain}

::: html step4-2
s4o: Guess from the trend in your head first, then click; beyond right or wrong, notice whether the feedback marks an "exception". Do several questions and see where the trend lets you down.
bPickA: Pick A
bPickB: Pick B
bNextQ: Another question
bResetScore: Reset: clear the score
:::

::: strings
r4q: Question {n}: {prop} — which is larger?
r4a: {good}: {a} = {va}, {b} = {vb}, the larger is {w}. {note}  (answered {tot}, correct {ok})
r4n: Not answered yet  (answered {tot}, correct {ok})
good: Correct
bad: Wrong
noteSamePer: Same period; {z} has the larger Z; the trend generally holds here.
noteSamePerEx: Same period; {z} has the larger Z; but this pair is an exception to the overall trend.
noteSameGrp: Same group; {z} is lower in the group; the trend generally holds here.
noteSameGrpEx: Same group; {z} is lower in the group; but this pair is an exception.
noteNone: Different period and different group: no simple rule, only data.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) properties change gradually along rows and down columns of the table; (2) along a period Zeff grows, the radius shrinks and IE₁ and χ rise; (3) down a group an extra shell makes the radius grow and IE₁ and χ fall; (4) there are exceptions (IE₁ dips at Be→B and N→O); (5) trends can predict the rough character of the next element but do not replace data. {#s5e .explain}

::: html step5-2
qq: Which set is ordered from smallest to largest atomic radius?
qo0: Na < Mg < Al
qo1: K < Na < Li
qo2: F < O < Li
s5m: This page contains only the main-group elements of the first four periods (26 in all) and leaves out transition metals; radii are covalent radii (Cordero et al.; they vary slightly with bonding environment, and noble-gas values are estimates); IE₁ values are common textbook figures; electronegativity uses the Pauling scale; Slater's rules are a rough screening estimate, and the fit's correlation only shows the trend agrees, not that the formula is exact; the "trend" in the prediction questions is just the general rule.
lk0: Atomic structure: electron shells and how many electrons each holds
lk1: Atomic structure: the outer electrons decide chemical behaviour
lk2: Molecular shapes: how electronegativity differences become bond dipoles and molecular polarity
lk3: Electric fields: the electrostatic attraction between nuclear charge and electrons
:::

::: strings
qwhy: F and O sit toward the right of period 2 with large Zeff and small radius, while Li is at the far left of the same period with the largest radius (step 1). Na, Mg, Al are in one period and their radii go Na > Mg > Al; K, Na, Li are one group and the radius shrinks upward, so the order should be Li < Na < K.
:::
