---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Chemistry
stageBadge: Junior High
foot: Molecules & Atoms · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Molecules & Atoms · Chemical Change Rearranges Atoms
pageTitle: Molecules & Atoms
tagline: Boiling water and electrolysing water both “change the water”, but one only moves the molecules and the other tears them apart and rebuilds — atoms stay, molecules change.
:::

## What does the small number in H₂O mean? {#step0 h2=s0t}

::: strings
nav0: 0 Read a formula
:::

Step 0 · Read a formula {#s0k .step-kicker i18n=text}

This step asks: what does the 2 in H₂O say? An **atom** is the smallest piece that stays intact in a chemical change; a **molecule** is a small cluster of bonded atoms that acts as one unit of a substance. The small number after an element symbol counts atoms **in one molecule**. Pick a molecule, then drag the number of molecules: the coefficient in front of a formula counts how many of them. {#s0e .explain}

::: html step0-1
s0stage: Ball-and-stick view: each colour is an element’s atoms, sticks show which atoms are bonded
s0canvas: Ball-and-stick picture of the chosen molecule repeated the chosen number of times, atoms coloured by element
s0mol: Pick a molecule
s0n: Number of molecules (coefficient)
:::

Takeaway: the subscript counts atoms in one molecule, the coefficient counts molecules — do not mix them up. Bond angles and ball sizes here are schematic, not true scale. {#s0result .readout i18n=text}

::: strings
s0ro: {n} × {name}: atoms in each molecule {per}; total atoms {tot}.
:::

## When water becomes steam, do the water molecules change? {#step1 h2=s1t}

::: strings
nav1: 1 Boiling
:::

Step 1 · Boiling {#s1k .step-kicker i18n=text}

This step asks: heating water until it boils into steam — does the molecule itself change, or only the distances between molecules? Drag the temperature and watch 12 water molecules (each is one oxygen atom bonded to two hydrogen atoms). Hotter means wilder shaking; near 100 °C they break free of each other and spread out as gas. Check whether each little cluster is still H₂O. {#s1e .explain}

::: html step1-1
s1stage: Twelve water molecules (motion is schematic, not real speeds): each cluster is one oxygen atom and two hydrogen atoms
s1canvas: Twelve water molecules: packed and jiggling when cold, spreading out as gas near 100 °C, each still H₂O
s1t2: Temperature
:::

Takeaway: a change of state alters distances and motion, not the molecules, which stay H₂O (a physical change). Holds at normal pressure with a 100 °C boiling point; the arrangement here is schematic. {#s1result .readout i18n=text}

::: strings
s1ro: {T} °C: {state}. {n} molecules, each still H₂O; total atoms {atoms}.
s1liq: liquid: molecules touch and only jiggle in place
s1boil: near boiling: molecules are breaking free and spreading
s1gas: gas: molecules far apart and flying freely
:::

## Where do the water molecules go when current runs through water? {#step2 h2=s2t}

::: strings
nav2: 2 Electrolysis
:::

Step 2 · Electrolysis {#s2k .step-kicker i18n=text}

This step asks: what happens to water molecules under electric current, and what forms? The current tears water molecules apart and the hydrogen and oxygen atoms pair up anew: 2 H₂O → 2 H₂ + O₂. Set the number of water molecules and press “Run current”: with each reaction the water shrinks while hydrogen and oxygen molecules appear; see how many times more H₂ than O₂. {#s2e .explain}

::: html step2-1
s2stage: Electrolysis cell: hydrogen collects on the left, oxygen on the right; each reaction splits 2 water molecules
s2canvas: Electrolysis cell: water molecules are split into hydrogen and oxygen molecules, twice as many H₂ as O₂
s2n: Starting water molecules
s2run: Run current, start reacting
s2reset: Refill water
:::

Takeaway: in a chemical change molecules are torn apart and atoms rejoin as new molecules (new substances); H₂ : O₂ = 2 : 1. Holds in this ideal case: complete splitting, no electrode losses. {#s2result .readout i18n=text}

::: strings
s2ro: {e} / {max} reactions done: H₂O {w}, H₂ {h}, O₂ {o}; H₂ ÷ O₂ = {ratio}; total atoms H {ah}, O {ao}.
s2zero: No current yet; {w} water molecules.
:::

## How do you tell a physical change from a chemical one? {#step3 h2=s3t}

::: strings
nav3: 3 Physical or chemical
:::

Step 3 · Physical or chemical {#s3k .step-kicker i18n=text}

This step asks: what shows that a change makes a new substance? Compare the **kinds of molecules** before and after: if the kinds are unchanged (only position, spacing or mixing change) it is a **physical change**; if new kinds of molecules appear it is a **chemical change**. Pick a change, guess first, then see the verdict. {#s3e .explain}

::: html step3-1
s3stage: Molecule lists before (left) and after (right): each line is a molecule kind and its count
s3canvas: Lists of molecule kinds before and after a change: same kinds means physical, new kinds means chemical
s3sc: Pick a change
s3phys: My guess: physical
s3chem: My guess: chemical
:::

Takeaway: the criterion is molecule kinds (is there a new substance). Holds for molecular substances only; ionic compounds and metals need a separate criterion. {#s3result .readout i18n=text}

::: strings
sc0: Ice melts into water
sc1: Water boils into steam
sc2: Electrolysis of water
sc3: Hydrogen burns in oxygen
sc4: Methane burns
sc5: Hydrogen and oxygen mixed (no spark)
s3before: Before
s3after: After
s3none: (none)
s3ro: {name}: before {b}, after {a}. The molecule kinds {diff} — verdict: {verdict}. {guess}
s3same: stayed the same
s3diff: changed
s3phyV: physical change
s3chmV: chemical change
s3g0: Guess first, then see whether you were right.
s3gOk: Your guess was right.
s3gNo: Your guess was off: look at whether the molecule kinds changed.
:::

## When molecules regroup, do atoms appear or vanish? {#step4 h2=s4t}

::: strings
nav4: 4 Atom ledger
:::

Step 4 · Atom ledger {#s4k .step-kicker i18n=text}

This step asks: in methane burning, CH₄ + 2 O₂ → CO₂ + 2 H₂O, molecule kinds and counts all change — does the atom total? Drag “reactions done”: the top bars are molecules (they change), the bottom bars are atom totals per element (C, H, O). {#s4e .explain}

::: html step4-1
s4stage: Top: counts of each molecule; bottom: atom totals per element (they stay level)
s4canvas: Two bar groups for methane burning: molecule counts change, atom totals do not
s4reset: Back to before
:::

Takeaway: molecules change, the atom ledger does not. Holds in this ideal case: start with 4 methane molecules, enough oxygen, no incomplete burning. {#s4result .readout i18n=text}

::: strings
s4e2: Reactions done
s4ro: After {e} reactions: CH₄ {a}, O₂ {b}, CO₂ {c}, H₂O {d}; atom totals C {tc}, H {th}, O {to} (before: C {c0}, H {h0}, O {o0}).
:::

## Tell the molecule–atom story to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: A physical change only moves molecules; a chemical change breaks them apart and rebuilds new ones from the same atoms.
f1t: Read a formula
f1b: Subscripts count atoms in one molecule; the coefficient counts molecules.
f2t: The test
f2b: Same molecule kinds: physical. New kinds appear: chemical (steps 1–3).
f3t: What stays
f3b: In a chemical change the atom kinds and totals stay; only the bonding changes (step 4).
modelT: Honest model notes
model1: Bond angles and sizes in ball-and-stick pictures are schematic; real atoms and electron clouds cannot be drawn this way.
model2: Particle motion is a deterministic sketch, not molecular dynamics; the boiling point assumes normal pressure (100 °C).
model3: This page covers molecules only; ionic compounds such as table salt and metals are not built from molecules and need a different criterion.
nextT: Keep going (on this site)
l1: Mass Conservation · step 1: split molecules into atoms and count each element
l2: Particles & States · step 2: melting loosens the particle pattern — a physical change
l3: Atomic Structure · step 1: what is inside an atom and what fixes the element
:::

::: strings
el_H: hydrogen
el_O: oxygen
el_C: carbon
el_N: nitrogen
mH2: Hydrogen H₂
mO2: Oxygen O₂
mH2O: Water H₂O
mCO2: Carbon dioxide CO₂
mCH4: Methane CH₄
mNH3: Ammonia NH₃
unitC: °C
unitEv: events
lblMol: Molecule counts (change)
lblAtom: Atom totals (constant)
:::
