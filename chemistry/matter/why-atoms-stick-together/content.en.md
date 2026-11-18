---
lang: en
title: Why Atoms Stick Together · A Hands-on Essay
desc: Diamond is hard, graphite is slippery, salt shatters, copper draws into wire and water boils only at 100 °C, all for one reason: how electrons sit between atomic nuclei. This essay starts from one electron in a box and uses the real equations to compute the bond in H₂⁺, the levels of benzene, the lattice energy of table salt, bands and band gaps, the forces between molecules and a small simulation that melts and boils, then goes on to protein folding and the frontier as of 2026.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.ev: {v} eV
u.kj: {v} kJ/mol
u.nm: {v} nm
u.pm: {v} pm
u.a0: {v} a₀
u.pct: {v}%
u.beta: {v} |β|
u.deg: {v}°
u.k: {v} K
u.x: {v}×
u.sec: {v} s
u.min: {v} min
u.hour: {v} h
u.day: {v} days
u.year: {v} years
u.none: —
:::

# Why Atoms Stick Together {#hero}

::: strings
kicker: Chemistry · Bonding and Structure · A hands-on essay
:::

Diamond and pencil lead are the same kind of atom, yet one is the hardest common material and the other rubs off onto paper.<br>What holds atoms together, and how does that decide what a thing is like? {.sub}

Salt shatters when struck, copper can be drawn into wire, water does not boil until 100 °C, plastic lasts for centuries, and egg white sets when heated. These look unrelated, but they come down to one question: **how do electrons sit between several atomic nuclei?** This essay answers that one question. The first five chapters cover the strong connections between atoms: why electrons prefer to spread over two nuclei (chapters 1–3), what happens when that spreading is uneven (chapter 4), and how energy levels turn into a band when a large row of atoms is linked (chapter 5). The last four chapters cover what follows from this: the shapes of molecules (chapter 6), the much weaker forces between molecules (chapter 7), why the same atoms joined in a different way give a different material (chapter 8), and how a long chain folds itself into a machine (chapter 9). The last chapter is the frontier as of November 2026: how accurately and how large these things can now be computed, which claims have been verified, and which are still only claims. {.lead}

The prerequisites are in [[atomic-structure]] (nuclei, electrons, electron shells), [[periodic-trends]] (how electronegativity and ionisation energy change across the periodic table) and [[quantum-basics]] (an electron is a cloud of probability, not a little ball). Each model here is a scaled-down version of the real thing: H₂⁺ uses the textbook integral formulas, the energy levels of benzene are found by the page solving for its eigenvalues itself, the lattice energy of salt is added up term by term, and melting and boiling come from 48 particles moving according to Newton's laws. This essay was written by an AI; the last paragraph of each chapter says what the model leaves out. {.note}

## The Tighter the Squeeze, the Faster It Moves {#ch1}

::: strings
toc: The Tighter the Squeeze, the Faster It Moves
:::

Squeeze an electron into a smaller space and its kinetic energy rises; double the width of its space and the lowest kinetic energy falls to a quarter. This is the first source of chemical bonding: spreading an electron over two atoms costs less energy than keeping it on one. {.law}

A guitar string gets higher in pitch as it gets shorter. Pinning the middle of the string leaves a half that can only vibrate in shorter waves, so the frequency doubles. An electron is also a wave ([[quantum-basics]]). Confine it in a box of length L and its wave must go to zero at both ends, so the longest wavelength it can have is 2L. A shorter wavelength means a larger momentum and a higher kinetic energy. This is not a metaphor; the calculation gives

**E<sub>n</sub> = n²h² / (8mL²)**, n = 1, 2, 3…

h is Planck's constant, m is the electron mass, and n is the number of half-waves in the box. The key is the L² in the denominator: halve the box and every energy level becomes four times as large. An electron in a box {=ch1.L} nm wide (roughly the diameter of a small atom) has a lowest kinetic energy of {=ch1.e1} eV. This energy is the cost of confinement itself, even if no force acts inside the box.

::: diagram dg-box keys=dg.box
cap: Figure 1: two narrow boxes, and one wide box after the wall between them is removed. The gold curve is the wave of the electron's lowest state, drawn from the formula. Doubling the width doubles the wavelength and cuts the kinetic energy to a quarter.
aria: Diagram: on the left, two narrow boxes of width L, each with a bulging wave; on the right, one box of width 2L, with a flatter wave whose kinetic energy is a quarter of the original
two: Two atoms, one electron each
one: Wall removed: electron spread out
wl: width L
w2: width 2L
e1: kinetic energy per electron E
e2: kinetic energy per electron E/4
:::

Now imagine two such boxes side by side, each holding one electron, and remove the wall between them. Each electron's range grows from L to 2L, and its lowest kinetic energy falls from {=ch1.e1} eV to {=ch1.e2} eV, saving {=ch1.drop} eV, or {=ch1.kj} kJ per mole. An ordinary chemical bond is worth a few hundred kJ/mol (the hydrogen molecule is {=ch3.h2kj} kJ/mol): the order of magnitude matches.

::: lab ch1-model
model.title: One electron in a box
model.how: Drag the box width. On the left are the lowest three energy levels for a box of width L; on the right, a box of width 2L. Watch how each level changes with the width, and how much energy the electron saves by moving from the narrow box into the wide one.
ctl.L: Box width L
cv.aria: Chart: the first few energy levels of an electron in a box of width L and in one of width 2L
cv.narrow: width L
cv.wide: width 2L
cv.e: Energy (eV)
read.e1: Lowest kinetic energy, narrow box
read.e2: Lowest kinetic energy, wide box
read.drop: Saved by spreading out
read.kj: Per mole
say.big: The box is only {L} nm wide, smaller than an atom, and the electron's lowest kinetic energy is as high as <em>{e1} eV</em>. Spreading it to twice the width saves {d} eV, more than any single chemical bond: an electron cannot be confined in a space this small, which is also why atoms do not collapse.
say.bond: The box is {L} nm wide, about the size of an atom. The lowest kinetic energy is <em>{e1} eV</em>; spreading it to twice the width leaves {e2} eV, saving <em>{d} eV</em> ({kj} kJ/mol), the order of magnitude of one chemical bond.
say.small: The box is {L} nm wide, already several atoms across. Spreading it out by another factor of two saves only <em>{d} eV</em>: once the range is already large, a further increase helps less.
:::

This is the first thread for all the later chapters: **as an electron's range grows, its kinetic energy falls.** This model is called the one-dimensional infinite square well, the first exercise in quantum mechanics. Check it against a real atom: the ionisation energy of hydrogen is 13.6 eV, the same order of magnitude as the figure for a box 0.1 to 0.2 nm wide, so the model is reliable for estimating orders of magnitude.

This box has no nucleus, its walls are infinitely high, and it is one-dimensional. A real electron is pulled by the nucleus and pushed away by other electrons, so the numbers here are good only to an order of magnitude. The next chapter uses a real nucleus and works the account out accurately. {.take}

## The Simplest Chemical Bond: H₂⁺ {#ch2}

::: strings
toc: The Simplest Chemical Bond: H₂⁺
:::

Two protons sharing one electron already make a chemical bond. Add the electron waves of two atoms, so that the electron spreads over both nuclei, and the energy as a function of separation first falls and then rises. The lowest point of the curve gives the bond length, and its depth gives the bond energy. {.law}

The simplest molecule is not H₂ but H₂⁺: two protons and one electron. It really exists in interstellar gas, and it is the first molecule that quantum mechanics can solve exactly. The method is simple: when the electron is near the left proton it looks like a left-hand hydrogen atom, and when it is near the right one it looks like a right-hand hydrogen atom. So guess that its wave is a superposition of the 1s orbitals of two hydrogen atoms. The two waves can be combined in two ways: **added**, or **subtracted**.

::: diagram dg-lcao keys=dg.lcao
cap: Figure 2: the 1s waves of two hydrogen atoms added and subtracted (internuclear distance 2 a₀, drawn from the formula; the blue dots are the two protons). Added, the wave is raised between the nuclei, so the electron spends more time there; subtracted, the wave is exactly zero midway between them.
aria: Diagram: above, the bonding orbital from adding two 1s orbitals, bulging between the nuclei; below, the antibonding orbital from subtracting them, with a node in the middle
bond: Added: bonding orbital
anti: Subtracted: antibonding orbital
nuc: two protons
mid: more electron density between nuclei
node: exactly zero in the middle: one node
:::

This method is called the **linear combination of atomic orbitals** (LCAO). Computing the energy needs three integrals, each with a closed form. Let the internuclear distance be R, in units of the Bohr radius a₀ = 0.529 Å:

- **Overlap** S = e<sup>−R</sup>(1 + R + R²/3): how far the two 1s waves overlap; it is 1 at R = 0 and falls to 0 when they are far apart. {#i1}
- **Coulomb integral**: the energy of the electron when it sits on its own atom, attracted by the other proton, −(1/R)[1 − (1+R)e<sup>−2R</sup>]. {#i2}
- **Exchange integral** (also called the resonance integral): the extra part that comes from the electron belonging to both sides at once, −(1+R)e<sup>−R</sup>. It has no classical counterpart, and the bond comes mainly from it. {#i3}

Put these in, add the repulsion 1/R between the two protons, and you get two energy curves: E₊ for the added combination and E₋ for the subtracted one.

::: lab ch2-model
model.title: Bring the two protons together: energy curves of H₂⁺
model.how: Drag the internuclear distance R. The gold line is the energy of the bonding state, the red line the antibonding state, both measured from "one hydrogen atom plus a distant proton" as zero. The purple circle is the exact answer for this molecule. Tick "let the orbital contract" to see how the curve approaches the exact answer, and how much the kinetic and potential energy each change.
ctl.R: Internuclear distance R
ctl.opt: Let the orbital contract (at each R, choose the best orbital size ζ)
cv.aria: Chart: energies of the bonding and antibonding states of H₂⁺ against internuclear distance
cv.x: Internuclear distance R (a₀) →
cv.y: Energy (eV)
cv.bond: bonding
cv.anti: antibonding
cv.exact: exact
read.R: Internuclear distance
read.S: Overlap S
read.E: Bonding-state energy
read.A: Antibonding-state energy
read.Z: Orbital contraction ζ
read.T: Change in kinetic energy
read.V: Change in potential energy
say.close: R = {R} a₀: the two protons are so close that their mutual repulsion wins, and the bonding state sits <em>{e} eV</em> above the separated atoms.
say.min: R = {R} a₀ ({pm} pm) is near the bottom of the curve: the bonding state lies <em>{e} eV</em> below the separated atoms. This is the bond energy the model gives. At the same distance the antibonding state is {a} eV higher.
say.mid: R = {R} a₀: the bonding state lies <em>{e} eV</em> below the separated atoms, but this is not yet the minimum (the minimum is at {rmin} a₀). The antibonding state is {a} eV higher.
say.far: R = {R} a₀: the two 1s waves barely overlap (S = {S}), the electron belongs to one proton only, and the energy differs from the separated atoms by only {e} eV.
:::

Without "let the orbital contract" ticked, the lowest point is at R = {=ch2.z1R} a₀ ({=ch2.z1pm} pm), with a depth of {=ch2.z1De} eV. Experiment and the exact solution give {=ch2.exR} a₀ ({=ch2.expm} pm) and {=ch2.exDe} eV. A two-term guess, then: the bond length is off by a quarter and the bond energy by more than a third, but the shape of the curve is right. It has a lowest point, it repels when close in, and far out it hardly matters.

Where does the gap come from? Read the kinetic and potential energies at the minimum: the electron's kinetic energy is {=ch2.z1dT} eV lower than in the hydrogen atom, while its potential energy is {=ch2.z1dV} eV higher. This is exactly the lesson of chapter 1: **the electron spreads out, so its kinetic energy falls.** But that is not yet the lowest point. With kinetic energy to spare, the electron cloud can contract a little onto the two nuclei, trading for a lower potential energy. Tick "let the orbital contract" and the page chooses the size ζ of the 1s orbital afresh at each R (ζ > 1 means tighter than the hydrogen orbital). The minimum moves to R = {=ch2.optR} a₀, with ζ = {=ch2.optZ}, and a bond energy of {=ch2.optDe} eV, only {=ch2.optGap} eV short of the exact value. Now read the numbers again: the kinetic energy is now **higher** than in the hydrogen atom by {=ch2.optdT} eV, and the potential energy is lower by {=ch2.optdV} eV, just twice the rise. Stable molecules all satisfy this two-to-one relation; it is called the **virial theorem**.

So there are two accounts of how the bond arises, and both still appear in textbooks. One says: the electron sits between the two nuclei and attracts both at once (its potential energy falls). The other (Ruedenberg, 1962) says: first the spreading lowers the kinetic energy, and that leaves room for the electron cloud to contract, so the fall in potential energy is the second step. This model shows both steps: without contraction the bond comes entirely from kinetic energy; after contraction, the final account is a fall in potential energy. The two accounts describe different breakdowns of the same curve; they differ over which step counts as the cause.

This uses only two 1s orbitals, so it cannot give the exact value; adding orbitals that change shape would close the remaining {=ch2.optGap} eV. The nuclei are treated as fixed points (the Born–Oppenheimer approximation), and the vibration of the molecule is not computed. {.take}

## Filling Orbitals with Electrons {#ch3}

::: strings
toc: Filling Orbitals with Electrons
:::

Each orbital holds at most two electrons. Electrons in a bonding orbital pull the atoms together; electrons in an antibonding orbital push them apart. What is left after the two cancel is how strong the bond is. {.law}

The previous chapter gave two orbitals: the lower bonding orbital σ and the higher antibonding orbital σ\*. Electrons fill from low energy to high, with at most two per orbital (one spin up, one spin down). H₂⁺ has one electron, in σ. H₂ has two, both in σ, so the bond is stronger and shorter. Add one more electron to H₂ and you have He₂⁺: σ is full, so the third electron can only go into σ\*, cancelling half a bond. He₂ has four electrons, two in σ and two in σ\*, which cancel completely, so two helium atoms do not bond; helium gas is made of single atoms.

Half the difference between the number of bonding electrons and the number of antibonding electrons is called the **bond order**. It matches the measured bond energies:

::: diagram dg-mo keys=dg.mo
cap: Figure 3: how one to four electrons fill the orbitals. Purple is the measured bond energy (the energy needed to pull the molecule apart); a higher bond order goes with a larger bond energy. He₂ has bond order 0 and in practice does not bond.
aria: Diagram: the number of electrons in the σ and σ* orbitals for H₂⁺, H₂, He₂⁺ and He₂, with bond orders one half, one, one half and zero
sig: σ bonding
sigs: σ* antibonding
bo: bond order
d0: bond energy
none: no bond
:::

The bond energy of H₂ ({=ch3.h2ev} eV, {=ch3.h2kj} kJ/mol) is less than twice that of H₂⁺, because the two electrons in the same orbital also repel each other. This model does not calculate that term; the numbers in the figure are measured values.

The same method works for much larger molecules. When carbon atoms link into a chain or a ring, each carbon contributes one p orbital, perpendicular to the plane of the molecule, which overlaps side by side with the p orbitals of its neighbours. These electrons are called π electrons. In 1931 Hückel gave an extremely simple method that needs only two numbers: α is the energy of an electron sitting on one carbon, and β is the energy from its hopping between two neighbouring carbons (β is negative, so hopping lowers the energy). Write the molecule as a table: α on the diagonal, β between neighbouring carbons, and 0 elsewhere. The **eigenvalues** of this table (matrix) are the energies of the π orbitals ([[eigenvectors]] explains what eigenvalues are).

::: lab ch3-model
model.title: Build a conjugated molecule and look at its energy levels
model.how: Choose the number of carbon atoms; this decides whether they link into a chain or close into a ring. The page solves for the eigenvalues of the molecule on the spot. On the right is the energy of each π orbital (the gold ones are filled with electrons); on the left is the molecule, with thicker lines for bonds carrying more π electrons. Try a six-carbon ring (benzene), a four-carbon ring and an eight-carbon ring.
ctl.N: Number of carbon atoms
ctl.ring: Close into a ring
cv.aria: Chart: the skeleton of a conjugated molecule and the energy levels of its π orbitals
cv.alpha: α
cv.up: antibonding ↑
cv.down: bonding ↓
read.tot: Total π-electron energy
read.del: Delocalisation energy
read.gap: HOMO to LUMO gap
read.lam: Absorbed wavelength (model)
read.exp: Absorbed wavelength (measured)
tot.v: {n}α + {x}β
say.chain: {N} carbons in a chain: the π electrons together are lowered by a further <em>{d} |β|</em> compared with {k} separate double bonds. This is the delocalisation energy. The gap between the highest occupied and the lowest empty orbital is {g} |β|; the longer the chain, the smaller the gap, and the longer the wavelength of light it absorbs.
say.chainExp: {N} carbons in a chain: delocalisation energy <em>{d} |β|</em>, gap {g} |β|. The model gives an absorbed wavelength of {lam} nm, against a measured <em>{exp} nm</em> ({name}). The direction is right, but the number is not: see below.
say.arom: {N} carbons in a ring: every level up to the gap is filled, the delocalisation energy is as high as <em>{d} |β|</em>, the gap is {g} |β|, and all the bonds are the same thickness (bond order {b}). The number of π electrons is 4n + 2. Rings like this are especially stable; the property is called aromaticity.
say.anti: {N} carbons in a ring: the middle level holds two orbitals of equal energy, which hold just one electron each, so the gap is 0 and the delocalisation energy is only <em>{d} |β|</em>. The number of π electrons is 4n. Rings like this are unstable; the property is called antiaromaticity. Real molecules avoid it by distorting into alternating short and long bonds.
say.odd: {N} is odd: one orbital is filled with only one electron. This is a radical, and a very reactive one. Delocalisation energy {d} |β|.
:::

The model gives three things here.

**Delocalisation energy.** The π electrons of butadiene (a four-carbon chain) are lowered by a further {=ch3.butDel} |β| compared with two isolated double bonds; those of benzene (a six-carbon ring) by a further {=ch3.benDel} |β|, more than four times as much as butadiene. The six bonds of benzene are all the same thickness, each with bond order {=ch3.benBo}: neither single nor double. It does not undergo addition the way an ordinary double bond does, and the reason lies in this extra energy gained.

**4n + 2.** Drag the ring size from 3 to 12: the 6- and 10-carbon rings have large delocalisation energies and wide gaps, while the 4- and 8-carbon rings have a gap of 0. This is Hückel's rule, a pattern that falls straight out of the eigenvalues: apart from the lowest level, the levels of a ring come in pairs of equal energy, so filling them completely takes 2, 6, 10, 14… electrons.

**Colour.** A molecule absorbs light by moving an electron from the highest occupied orbital (HOMO) to the lowest empty orbital (LUMO). The smaller the gap, the longer the wavelength absorbed. Ethylene absorbs ultraviolet light at {=ch3.l2exp} nm, which we cannot see; carotene has 22 conjugated carbons and absorbs blue light at {=ch3.l22exp} nm, so carrots look orange. In the model, |β| is set to {=ch3.beta} eV so that butadiene matches the measured {=ch3.l4exp} nm exactly (this value is tuned, not calculated). Then check the others: ethylene comes out at {=ch3.l2} nm (measured {=ch3.l2exp}), hexatriene at {=ch3.l6} nm (measured {=ch3.l6exp}), and carotene at {=ch3.l22} nm (measured {=ch3.l22exp}). The trend is right, longer chains absorb at longer wavelengths, but the model shrinks the gap too fast.

The reason is that the Hückel model treats all bonds as the same length and leaves out the repulsion between electrons altogether. In a long real chain, single and double bonds alternate in length, and beyond a point the gap stops shrinking. It is a model that cares only about what is connected to what: it gets right what the connection pattern determines (the order of the levels, 4n + 2, which bonds are thicker), but the actual energy values need the far more expensive methods of chapter 10. {.take}

## Unequal Sharing: From Covalent to Ionic {#ch4}

::: strings
toc: Unequal Sharing: From Covalent to Ionic
:::

When two atoms pull on electrons with unequal strength, the shared electrons lean toward one side. A small difference gives a polar bond; a large one means an atom takes the electron outright, and what remains is the electrostatic attraction between a positive and a negative ion. Covalent and ionic bonds are the two ends of the same scale. {.law}

Two people share a quilt. If they pull equally hard, the quilt sits in the middle; if one pulls harder, the quilt tilts towards them; if the difference is large, one wraps the whole quilt around themselves while the other just clings to them for warmth. The "pulling strength" of an atom for electrons is called **electronegativity** ([[periodic-trends]] shows how it varies across the periodic table): fluorine is the largest, and metals such as sodium and potassium the smallest.

Changing one number in the two-orbital model of the previous chapter shows this. Originally both atoms have energy α; now let one atom lie lower than the other by Δ (it wants the electron more). The hopping term is still β. This 2 × 2 table has two eigenvalues, and the fraction of the electrons in the bonding orbital that sit on the lower-energy atom is

**½ [1 + (Δ/2) / √((Δ/2)² + β²)]**

At Δ = 0 the split is half and half; when Δ is much larger than β, the share approaches 100%.

::: lab ch4-model
model.title: Two atoms compete for a pair of electrons
model.how: Drag the energy difference Δ between the two atoms, and the hopping |β|. Watch how much of the electron pair in the bonding orbital sits on the right-hand atom (a bigger circle means a bigger share), and how much charge each atom therefore carries.
ctl.D: Energy difference Δ
ctl.B: Hopping |β|
cv.aria: Chart: the energy levels of the two atoms, the bonding and antibonding orbitals they form, and the share of the electrons on each side
cv.a: atom A
cv.b: atom B
cv.bond: bonding
cv.anti: antibonding
read.w: Share of electrons on B
read.q: Charge on B
read.split: Gap from bonding to antibonding
read.st: Energy lowered by sharing
say.cov: Δ is only {r} times |β|: the electrons sit on B for <em>{w}</em>, almost evenly split. This is a covalent bond; the {st} eV it lowers comes entirely from sharing.
say.polar: The electrons sit on B for <em>{w}</em>; B carries a charge of {q}, and A an equal positive charge: a polar bond. Sharing also contributes {st} eV.
say.mostly: The electrons sit on B for <em>{w}</em>, and B carries a charge of {q}. It is already more like an ion. Sharing now lowers the energy by only {st} eV; most of the energy comes from the electrons moving onto the lower-energy atom.
say.ion: The electrons sit on B for <em>{w}</em>: almost the whole pair belongs to B. This is an ionic bond, A⁺ and B⁻, and the lowering from sharing is only {st} eV.
:::

Where real molecules fall on this scale can be measured. Measure a molecule's electric dipole moment and divide it by "one electron's charge times the bond length", and you get the fraction by which the electron has actually shifted. For HCl it is {=ch4.hcl}, for HF {=ch4.hf}, and for the gaseous NaCl molecule {=ch4.nacl}. None is 0, and none is 100%.

Once ions form, electrostatics holds them together. A pair of Na⁺ and Cl⁻ a distance r apart has attraction energy −e²/(4πε₀r). But table salt is not a pair of ions; it is a whole crystal. Each Na⁺ is surrounded first by 6 Cl⁻, then outside those by 12 Na⁺ (repulsive), then 8 Cl⁻ further out... attractions and repulsions alternate and go on all the way to the surface of the crystal.

::: diagram dg-nacl keys=dg.nacl
cap: Figure 4: one layer of a salt crystal. Seen from the central Na⁺, rings of attraction and repulsion alternate; the layers above and below have the same arrangement. Schematic; ion sizes are not to scale.
aria: Diagram: a checkerboard of alternating positive and negative ions, with a positive ion in the centre, one line to a nearest negative ion and one to a diagonal positive ion
n1: Nearest: 6 Cl⁻ at distance r, attractive
n2: Next: 12 Na⁺ at distance √2·r, repulsive
n3: Next: 8 Cl⁻ at distance √3·r, attractive
n4: Carrying on gives one number, M
:::

Adding all these terms up, the total attraction is M times that of a single pair of ions. M is called the **Madelung constant**, and it depends only on how the crystal is arranged. The trouble is that this series is hard to sum: the positive and negative terms keep growing in number, and how you cut it off determines the answer.

::: lab ch4-mad keys=ch4.mad
model.title: Add up the electrostatics of a whole crystal
model.how: Drag how far out you add. The three lines are three ways of cutting off the sum: by a sphere (add all ions within distance n), by a cube, and by neutral cubes (ions on the surface counted as one half, one quarter or one eighth). The dashed line is the accepted value, 1.7476.
ctl.n: Shell reached, n
cv.aria: Chart: the Madelung sum against the number of shells, for three ways of cutting it off
cv.x: Shells added →
cv.sphere: cut by sphere
cv.cube: cut by cube
cv.evjen: neutral cubes
cv.ref: 1.7476
read.sph: Cut by sphere
read.cube: Cut by cube
read.ev: Neutral cubes
read.chain: One-dimensional chain of ions
read.u: Lattice energy from this value
say.one: Adding only the nearest shell: neutral cubes give {ev}, and the sphere cut gives {sph} (just the 6 nearest Cl⁻). Both are still far off.
say.n: Adding up to shell {n}: the neutral cubes are already at <em>{ev}</em>, only {d} away from 1.7476; the cube cut is {cube} and still creeping closer; the sphere cut is {sph} and keeps jumping about, never settling however many shells are added.
:::

Start with the simplest case, a one-dimensional string of alternating positive and negative ions: M = 2(1 − 1/2 + 1/3 − 1/4 + …) = 2 ln 2 ≈ {=ch4.chain}, which converges, but slowly. In three dimensions it is worse: adding spheres one shell after another gives {=ch4.sph1}, {=ch4.sph2}, {=ch4.sph3}, {=ch4.sph4}… and never settles, because each sphere carries an unbalanced charge. Make every block carry no net charge (Evjen's method of 1932) and three shells already give {=ch4.ev3}. The same set of numbers, added in a different order, gives a different result: mathematically this is called conditional convergence. The physical lesson is that **if a piece of material carries no net charge overall, the distant ions almost cancel out, and what matters is the few shells nearby.**

With M in hand, we can work out the **lattice energy** of salt: the energy released when one mole of separated gaseous ions is assembled into a crystal. Ions cannot come arbitrarily close (their electron clouds repel one another), so Born and Landé represent this with a repulsive term in 1/rⁿ, and the result is

**U = −(N<sub>A</sub>·M·e² / 4πε₀r₀)(1 − 1/n)**

For salt, the nearest Na⁺ and Cl⁻ are a distance r₀ = {=ch4.r0} pm apart, n is taken as {=ch4.bn}, and the calculation gives U = {=ch4.bl} kJ/mol.

Can this number be trusted? Lattice energy cannot be measured directly, but it can be reached by a detour:

::: diagram dg-bh keys=dg.bh
cap: Figure 5: the Born–Haber cycle for salt, drawn to scale from measured energies. Starting from sodium metal and chlorine gas, the three red steps cost energy and the two green steps release it; the six steps form a closed loop, so ⑤ can be found from the other five: {=ch4.bh} kJ/mol.
aria: Diagram: energy steps. Sodium sublimation, splitting chlorine gas and sodium ionisation step up; chlorine gaining an electron and the ions forming a crystal step down, ending at solid sodium chloride, lower than the starting point
s1: ① Sodium sublimes to gas
s2: ② Split half a Cl₂
s3: ③ Sodium loses an electron
s4: ④ Chlorine gains an electron
s5: ⑤ Ions form a crystal
s6: ⑥ Direct formation (measured)
:::

The lattice energy worked out from measured values is {=ch4.bh} kJ/mol; the purely electrostatic model gives {=ch4.bl} kJ/mol, which is off by only {=ch4.blErr}. So treating salt as charged spheres held together by electrostatics is roughly right. Figure 5 also shows something worth noticing: sodium needs {=ch4.ie} kJ/mol to lose its electron, and chlorine gives back only {=ch4.ea} kJ/mol when it gains one; taken alone, that step loses energy. What makes salt stable is not that "chlorine wants electrons", but the large electrostatic energy released when the ions pack into a crystal.

Ionic bonds have no direction: each ion only wants as many oppositely charged neighbours as it can get, as close as possible. Covalent bonds have direction: electron clouds overlap only along particular directions. This difference becomes, in chapter 8, the contrast between "salt shatters when struck" and "diamond is the hardest".

The two-atom model does not count the repulsion between electrons, and Δ and β are not fitted to any real molecule. The n in the lattice-energy formula is an empirical value taken from the compressibility of the crystal. The remaining gap of {=ch4.blErr} is mainly dispersion forces and a small covalent contribution, which are not included. {.take}

## From Molecules to Solids: Levels Become Bands {#ch5}

::: strings
toc: From Molecules to Solids: Levels Become Bands
:::

Two atoms have two orbitals, and N atoms have N. When there are as many as 10²³ atoms, the levels are so dense that they merge into a continuum called a band. Where the electrons fill up in a band, and whether there are empty slots right next to them, decides whether a material is a conductor, a semiconductor or an insulator. {.law}

The chain of chapter 3 can be made longer and longer. Four carbons have four π orbitals; 22 carbons have 22. That chapter already showed that the longer the chain, the smaller the gap between the highest occupied and the lowest empty orbital. What about not 22 atoms, but the 10²³ in a piece of metal?

::: diagram dg-band keys=dg.band
cap: Figure 6: the energy levels of a row of N atoms, from the model's eigenvalues. The total width soon stops changing (it approaches 4|β|), while the levels inside it become denser and finally merge into a band. With one electron per atom, the band is filled exactly to its lower half.
aria: Diagram: from left to right, the energy levels for 1, 2, 4, 8 and infinitely many atoms; the levels grow denser and finally form a single band, filled in its lower half
en: Energy ↑
fill: gold: filled with electrons
empty: grey: empty
:::

This row of atoms still uses Hückel's table, which solid-state physics calls the **tight-binding model**: an electron on one atom has energy α, and hopping to the neighbouring atom costs β. For a chain of N atoms the levels are exactly α + 2β cos(kπ/(N+1)), k = 1…N. However large N is, they all crowd between α ± 2|β|: **the bandwidth is set by the overlap β between neighbouring atoms, and the number of levels in the band is set by the number of atoms.**

::: lab ch5-model
model.title: A row of atoms: from levels to a band
model.how: First drag the number of atoms N and watch the levels crowd into a band; see how much gap is left between the highest gold line and the lowest grey line. Then drag the energy difference Δ between the two kinds of atom: this makes the atoms along the chain alternate high and low, like Na and Cl in salt, or Ga and As in gallium arsenide.
ctl.N: Number of atoms N
ctl.D: Energy difference Δ between the two kinds of atom
cv.aria: Chart: all the energy levels of a row of atoms; the gold ones are filled with electrons, the grey ones are empty
cv.e: Energy (|β|)
cv.gap: Band gap
read.w: Bandwidth
read.gap: Gap between filled and empty levels
read.ev: Converted with |β| = {=ch5.b} eV
read.car: Fraction of electrons that can jump across at room temperature
say.metal: All atoms the same, N = {N}: the highest filled level and the lowest empty level are separated by only <em>{g} |β|</em>. Each doubling of N roughly halves it, and at the 10²³ atoms of a real crystal it is 0. An electron needs only a little energy to move into an empty slot: this is a metal.
say.semi: Atoms alternate high and low, N = {N}: the band splits in the middle, with the lower half full and the upper half empty, separated by a gap of <em>{g} |β|</em> (for an infinitely long chain this is exactly Δ = {D}). With |β| = {b} eV, that is {ev} eV, and at room temperature only {car} of the electrons can jump across: a semiconductor.
say.ins: The energy difference between atoms is large, N = {N}: the band gap widens to <em>{g} |β|</em>, which with |β| = {b} eV is {ev} eV. At room temperature only {car} of the electrons can jump across, which is as good as none: an insulator.
:::

With Δ = 0, the band is half full, and right above the filled levels lie empty ones. A little voltage lets electrons move into the empty slots and carry charge: this is a **metal**. The "bond" of a metal is this half-filled band: each electron is spread over the whole crystal and belongs to no particular pair of atoms. This is why metal atoms can slide past one another without breaking apart (chapter 8).

When Δ is not zero, the band splits into two right through the middle, and a stretch appears with no levels at all: the **band gap**. For an infinitely long chain the band gap is exactly Δ. The lower band (the valence band) is full, the upper one (the conduction band) is empty, and for electrons to move they must first jump the gap. When the gap is E<sub>g</sub>, the fraction of electrons that can jump up at room temperature is roughly e<sup>−E<sub>g</sub>/2kT</sup> (where this exponential factor comes from is derived in a long essay on thermodynamics that is still being written). At room temperature kT is only {=ch5.kt} eV, so a gap a few times wider changes this fraction by tens of orders of magnitude: silicon's gap is {=ch5.si} eV, giving a fraction of {=ch5.siF}; diamond's is {=ch5.dia} eV, giving {=ch5.diaF}. The former is a semiconductor, the latter an insulator; the difference lies only in the width of the gap.

The band gap also decides colour and the conversion of light into electricity: photons with less energy than the gap are not absorbed and pass straight through. Diamond and table salt have gaps wider than the energy of visible photons, so they are transparent; silicon's gap is smaller than the energy of visible light, so it is opaque, and that is why it can make solar cells.

This chapter is the foundation for two essays. "Why Chips Keep Getting Harder to Make" goes from the band gap to doping and transistors, and the coming essay on photovoltaics goes from the band gap to how much electricity one photon can yield. Neither is online yet.

This is a one-dimensional row of atoms, with one orbital per atom. Real crystals are three-dimensional, each atom has several orbitals, and these give several bands which may overlap (which is why magnesium, whose orbitals are "filled", is still a metal). |β| = {=ch5.b} eV is an illustrative value used to convert into eV, not a parameter of any material; the repulsion between electrons is not calculated. {.take}

## Where Shape Comes From {#ch6}

::: strings
toc: Where Shape Comes From
:::

The shape of a molecule is set by its electron pairs: they all carry negative charge and keep as far apart from one another as they can. The arrangement in which four pairs are farthest apart is a regular tetrahedron, which is why the bond angle in methane is 109.5°. This rule is very useful, but it is an empirical rule, and it has limits. {.law}

Tie the mouths of several balloons together and they settle into fixed shapes by themselves: two in a straight line, three forming a flat triangle, four pointing to the corners of a tetrahedron. Nobody arranges them; they push each other into place. The electron pairs around a central atom behave the same way. This rule is called **valence-shell electron-pair repulsion** (VSEPR), and you can work through it molecule by molecule in [[molecular-shapes]].

Here we treat this as a real physics problem: place n mutually repelling point charges on a sphere and let them slide to the positions of lowest energy.

::: lab ch6-model
model.title: Let the electron pairs keep their distance
model.how: Choose the number of electron pairs, then press "scatter again" to scatter them at random over the sphere, and watch where they slide to a stop. The shape they settle into is the same wherever they start. The slider below does something else: drag the bond angle to see how much s character the hybrid orbital at that angle has.
ctl.n: Number of electron pairs
ctl.shake: Scatter again
ctl.ang: Bond angle
cv.aria: Chart: several mutually repelling points on a sphere, with lines from the centre, sliding towards the position of lowest energy
read.ang: Angle between pairs
read.e: Repulsion energy
read.name: Shape
read.hyb: Hybridisation at this angle
shape.n2: linear
shape.n3: flat triangle
shape.n4: regular tetrahedron
shape.n5: trigonal bipyramid
shape.n6: octahedron
hyb.v: sp<sup>{n}</sup>, s share {s}
hyb.p: pure p orbital
say: {n} electron pairs have settled into a <em>{name}</em> arrangement, with an angle of {a}. However many times you scatter them, the result is the same, because this is the arrangement with the lowest repulsion energy.
say.run: The {n} electron pairs are still sliding, and the repulsion energy is still falling…
say2.h: Bond angle {a}: two identical hybrid orbitals spanning this angle each have an s share of <em>{s}</em>, written sp<sup>{n}</sup>.
say2.p: Bond angle {a}: this is already the angle between two pure p orbitals; no s needs to be mixed in.
:::

The shapes that come out are the five in textbooks: linear (180°), flat triangle (120°), regular tetrahedron ({=ch6.tet}°), trigonal bipyramid (90° and 120°) and octahedron (90°). Some electron pairs are bonded to an atom and some are not (lone pairs), and the molecule's shape depends only on the pairs bonded to atoms: water has four pairs of electrons, two of which are bonded to hydrogen, so it is bent.

Textbooks have another way of describing shape: **hybridisation**. One s orbital and three p orbitals of carbon "mix" into four identical sp³ orbitals pointing to the four corners of a tetrahedron; mixing two p orbitals gives sp², with three orbitals in one plane; mixing one p gives sp, a straight line.

::: diagram dg-hyb keys=dg.hyb
cap: Figure 7: three kinds of hybridisation and the angles between their orbitals (schematic). The angle between two identical spⁿ orbitals satisfies cos θ = −1/n: n = 1, 2 and 3 give 180°, 120° and 109.5°.
aria: Diagram: the two sp orbitals form a straight line; the three sp² orbitals lie in a plane at 120 degrees to one another; the four sp³ orbitals point to the four corners of a tetrahedron
lin: linear
tri: flat triangle
tet: tetrahedron
:::

Hybridisation is not a step that an atom takes first; it is a bookkeeping method. The molecule's electron cloud already has its shape, and we choose a set of orbitals pointing along each bond to describe it. The formula cos θ = −1/n shows this, and it can be run in reverse. The measured bond angle of water is {=ch6.h2o}°; putting that in gives n = {=ch6.h2oN}: water's two bonding orbitals are closer to sp⁴ than to the sp³ that textbooks often name. Hydrogen sulfide's bond angle is only {=ch6.h2s}°, giving n = {=ch6.h2sN}: nearly pure p orbitals, with an s share of just {=ch6.h2sS}. Drag the slider to these two angles to read them off.

This is also where the repulsion rule reaches its limit. It explains water as "lone pairs are fatter and squeeze the two bonds a little closer" (from 109.5° down to {=ch6.h2o}°), but hydrogen sulfide, in the same group, is {=ch6.h2s}°, and phosphine is {=ch6.ph3}°, far from 109.5°, so "squeezed a little" does not work. The real reason is that the s orbitals of sulfur and phosphorus are low in energy and reluctant to take part in bonding. The rule also often guesses wrong for transition-metal complexes and for molecules with delocalised electrons.

Points on a sphere are not electron pairs: real electron pairs have size, lone pairs and bonding pairs differ, and the model cannot tell which pairs are bonded to atoms. It answers only one question: how a few mutually repelling things arranged around a centre can sit with the least energy. To get the shape of a particular molecule right, you need to solve its electronic structure (chapter 10). {.take}

## Between Molecules: Much Weaker Forces {#ch7}

::: strings
toc: Between Molecules: Much Weaker Forces
:::

The bonds inside a molecule are worth hundreds of kJ/mol, while the attraction between molecules is only a fraction to a few tens of kJ/mol. Thermal motion at room temperature is about {=ch7.kt} kJ/mol: connections much stronger than that stay put, and ones about that strong break and re-form. Whether a substance is a gas, a liquid or a solid depends on this contest. {.law}

Water boils and turns into steam, yet not one water molecule is damaged: the H–O bonds are intact, and what breaks is the connection between one water molecule and the next. Ice melting, alcohol evaporating and mothballs shrinking are all like this. Forces between molecules and bonds within molecules are not the same magnitude.

::: diagram dg-forces keys=dg.forces
cap: Figure 8: typical strengths of the various connections (log scale, each step ten times the last; ranges from textbooks, indicating orders of magnitude only). The dashed red line is kT, the thermal energy per mole at room temperature. The three gold ones are bonds; the three cyan ones are forces between molecules.
aria: Diagram: the energy ranges of six interactions on a log scale. The ionic lattice, covalent bond and metallic bond sit at hundreds to thousands of kJ/mol; hydrogen bonds, dipole forces and dispersion forces at a fraction to tens of kJ/mol; room-temperature thermal energy is about 2.5 kJ/mol
ion: Ionic lattice
cov: Covalent bond
met: Metallic bond
hb: Hydrogen bond
dip: Dipole–dipole
disp: Dispersion
kt: Thermal energy kT ≈ {=ch7.kt} kJ/mol
unit: kJ/mol (log scale)
:::

Forces between molecules come from three sources, all still electrostatic.

**Dipole–dipole.** As chapter 4 said, a polar molecule is slightly positive at one end and slightly negative at the other. Two such molecules attract when the positive end of one faces the negative end of the other.

**Dispersion forces** (London forces). Non-polar molecules, even single argon atoms, also attract one another. The reason is that electron clouds keep sloshing about: at one instant the electrons have shifted to one side, so the atom becomes a momentary small dipole, which pulls the electron cloud of its neighbour out of shape, and the two momentary dipoles attract. The more electrons and the looser the cloud, the stronger this force. It is everywhere, between all molecules.

**Hydrogen bonds.** When hydrogen is attached to oxygen, nitrogen or fluorine, most of its electron is pulled away, so the hydrogen nucleus is almost bare. It is also very small, so it can come close to a lone pair of electrons on another molecule. This is the strongest kind of force between molecules, and it has direction.

For the simplest case, two atoms that carry no charge and have no polarity, this tug-of-war between attraction and repulsion can be written as a formula, the Lennard-Jones potential:

**V(r) = 4ε [(σ/r)¹² − (σ/r)⁶]**

::: diagram dg-lj keys=dg.lj
cap: Figure 9: the Lennard-Jones potential, drawn from the formula. ε is how deep the attraction is and σ how large the atom is. For argon, ε ≈ {=ch7.arEps} kJ/mol and σ ≈ {=ch7.arSig} pm.
aria: Diagram: the potential energy of two atoms against distance. Below σ it rises steeply; there is a lowest point at 1.12 σ with depth ε; further out it slowly returns to zero
ay: Potential V
ax: Distance between the two atoms r →
rep: Too close: steep repulsion
min: Minimum: r = {=ch7.rmin} σ, depth ε
att: Further: dispersion, 1/r⁶
far: 2–3 σ out: barely felt
:::

−(σ/r)⁶ is the dispersion attraction; this sixth power can be derived from quantum mechanics. (σ/r)¹² is the repulsion when electron clouds overlap; the twelfth power is there for convenience (it is the square of the sixth power) and has no deeper justification. The lowest point is at r = 2<sup>1/6</sup>σ ≈ {=ch7.rmin} σ, and its depth is exactly ε.

With this curve we can do something concrete: put a few dozen atoms in, let them move according to Newton's laws, and compute the forces between every pair of atoms at each small step. This is called **molecular dynamics**. It is one of the main tools for studying materials and proteins today, and here is its smallest version.

::: lab ch7-model
model.title: 48 atoms: melting and boiling
model.how: Drag the temperature (in units of ε/k). A thermostat slowly brings the average kinetic energy of the atoms to this temperature. At low temperature they form a neat hexagonal crystal and only jiggle in place; as the temperature rises, the crystal falls apart into a flowing liquid, with atoms flying off the edge; higher still, everything scatters into a gas. Switch off the thermostat and the total energy should be conserved.
ctl.T: Temperature T
ctl.reset: Re-form the crystal
ctl.thermo: Thermostat
ctl.step: Run 500 steps
cv.aria: Chart: 48 atoms in a box interacting through the Lennard-Jones potential; colour shows how many near neighbours each atom has
read.T: Measured temperature
read.ar: Converted to argon
read.pe: Potential energy per atom
read.nb: Average number of neighbours
read.free: Atoms that have flown free
read.E: Total energy per atom
say.solid: "Temperature {T}: the atoms form a hexagonal lattice, with an average of <em>{nb} neighbours</em> each, and only jiggle in place. This is a solid."
say.liquid: "Temperature {T}: the lattice is disordered, but the atoms are still in contact (on average <em>{nb} neighbours</em>) and swap places with one another, and {free} of them have flown out to the edge. This is a liquid and its vapour."
say.gas: "Temperature {T}: the average number of neighbours is only <em>{nb}</em>, and {free} of the atoms are completely alone. Thermal motion has won: this is a gas."
:::

The model has no "melting point" parameter. There is only one potential curve and Newton's second law, and the three phases emerge by themselves: when the temperature (the average kinetic energy) is well below ε, the atoms are trapped in one another's potential wells; at around three or four tenths of ε they can climb out and swap places; higher still, they fly off one by one. [[particles-states]] describes this in pictures; here is the algorithm behind it. Each step uses the "velocity Verlet" algorithm, with a time step of 0.01. With the thermostat off, the drift of the total energy is held in the tests to within a few ten-thousandths.

This also explains a pattern on the periodic table: among hydrides in the same group, the heavier the molecule (the more electrons, and so the stronger the dispersion), the higher the boiling point. There are three exceptions.

::: diagram dg-bp keys=dg.bp
cap: Figure 10: boiling points of the hydrides of groups 14 and 16 (measured values, drawn to scale). The four carbon-group hydrides rise steadily down the period. In the oxygen group, H₂S, H₂Se and H₂Te do too; extrapolated along the trend of these three points, water should boil at {=ch7.extC} °C. In fact it boils at 100 °C, {=ch7.extGap} degrees higher.
aria: Figure: the horizontal axis is the period, the vertical axis the boiling point. The boiling points of the group 14 hydrides rise steadily; in group 16, hydrogen sulfide, hydrogen selenide and hydrogen telluride also rise, but water sits far above this trend line
ay: Boiling point (K)
ax: Period →
g16: Group 16
g14: Group 14
ext: Water, predicted
ext2: {=ch7.extK} K ({=ch7.extC} °C)
:::

The extra {=ch7.extGap} degrees is the hydrogen bond. Each water molecule can stick out two hydrogens and accept two, for four hydrogen bonds in all, pointing to the four corners of a tetrahedron (chapter 6). Ammonia and hydrogen fluoride also form hydrogen bonds, and both sit above the trend of their own groups.

**Why ice floats on water.** In ice each water molecule is strictly connected to four neighbours, building an open hexagonal framework. When ice melts, some hydrogen bonds break, the framework collapses somewhat, and the molecules come closer together. So ice at 0 °C is lighter than water: when water freezes its volume expands by {=ch7.ice}. Most substances do the opposite. Lakes freeze over from the surface, the water beneath the ice does not freeze, and water pipes burst in winter: all are consequences of that {=ch7.ice}.

**Why oil and water don't mix.** It is not because oil and water molecules repel one another: they attract through dispersion forces. The reason lies on the water side: when a water molecule sits next to an oil molecule, it cannot form hydrogen bonds with it, so it has to arrange itself more regularly around it, and there are fewer possible arrangements. Push the oil molecules together, and the constrained water surface shrinks. So this is mainly an account of "how many arrangements there are" (entropy), not of energy; it is called the **hydrophobic effect**. How to work out this account is the subject of another long essay on thermodynamics, now being written; in chapter 9, proteins fold by means of it.

This simulation is two-dimensional, with only 48 atoms and walls around the box. Melting in two dimensions is not the same as in three, and its transition temperatures (roughly 0.4 and 0.5 ε/k) cannot be converted directly into the melting and boiling points of argon (84 K and 87 K); the "converted to argon" reading only tells you how big ε is. The solid and liquid judgements use the number of neighbours and the degree of hexagonal order, and their thresholds were tuned by eye. The Lennard-Jones potential suits spherical atoms like the noble gases; molecules with direction, like water, need more complicated potentials. {.take}

## Structure Decides Properties {#ch8}

::: strings
toc: Structure Decides Properties
:::

The same atoms joined differently make different things. Whether a material is hard or brittle, conducts electricity, or has a high melting point depends on two things: what its weakest kind of connection is, and which directions that connection runs in. {.law}

Diamond and pencil lead are both pure carbon. One is the hardest natural substance known, transparent and non-conducting; the other is soft enough to leave a mark on paper, jet black, and it conducts. The atoms are identical; the difference lies only in how they are joined ([[isomers]] covers the same kind of question inside molecules).

::: diagram dg-carbon keys=dg.carbon
cap: Figure 11: diamond and graphite (schematic; bond lengths are measured values). In diamond each carbon uses sp³ to link four neighbours, and the whole crystal is one molecule. In graphite each carbon uses sp² to link three neighbours, forming hexagonal nets stacked in layers; the layers are far apart and held together only by dispersion forces.
aria: Diagram: on the left, one carbon atom of diamond and its four neighbours in tetrahedral directions; on the right, two layers of graphite's hexagonal net, with bond length 142 pm within a layer and 335 pm between layers
dia: Diamond
gra: Graphite
dian: Each carbon links 4, in tetrahedral directions
dian2: All four directions are covalent bonds
gran: Each carbon links 3, forming a layer
gran2: Between layers only dispersion forces
:::

**Diamond**: each carbon puts out four sp³ bonds (chapter 6), with a length of {=ch8.dB} pm, and they continue in all four directions until they reach the surface of the crystal. To deform it, you have to bend or stretch covalent bonds whichever way you push, each worth about {=ch8.cc} kJ/mol. That is why it is the hardest. All four of its electrons are locked into bonds, its band gap is {=ch5.dia} eV (chapter 5), and so it does not conduct and is transparent.

**Graphite**: each carbon uses only three electrons to form a flat hexagonal net, with a bond length of {=ch8.gB} pm, shorter and stronger than diamond's. The fourth electron sits in a p orbital perpendicular to the plane and spreads over the whole layer, as in benzene (chapter 3); that is why graphite conducts along its layers. Neighbouring layers are {=ch8.gL} pm apart, with no bonds between them, only dispersion forces of about {=ch8.layer} kJ/mol per atom (chapter 7), roughly 1/{=ch8.ratio} of a covalent bond within a layer. So the layers can slide and peel: the mark a pencil leaves on paper is peeled-off layers. Peel off a single layer, and you have **graphene**.

The same yardstick measures other materials:

- **Metals** (copper, iron): electrons spread over the whole crystal (chapter 5), and the nuclei sit in a "sea" of electrons. This kind of bond has no direction: when one row of atoms slides over another by a step, no bond breaks. So metals can bend, be drawn into wire and be hammered into sheets. {#m1}
- **Ionic crystals and ceramics** (table salt, aluminium oxide): the connections are strong and the melting points high, but a shift of half a spacing brings positive ions opposite positive ions (the picture in chapter 4), the whole face repels, and it cracks outright. So they are hard and brittle. {#m2}
- **Molecular crystals** (ice, wax, dry ice): the bonds inside the molecules are covalent, and between molecules there are only the weak forces of chapter 7. So they are soft, have low melting points, and melt as soon as they are heated. {#m3}
- **Polymers** (plastics, rubber, fibres): thousands of atoms are joined by covalent bonds into a long chain, with only weak forces between chains. The chain itself is hard to break, so plastic does not rot easily; the chains slide past one another easily, so it can be heated and shaped. {#m4}

Polymers have a property that no other material here has, and it is worth a look on its own. Each segment of a long chain can rotate, so in solution or in rubber the chain does not stay obediently straight; it coils at random. The simplest model is the **freely jointed chain**: N segments, each of length b, each pointing in a random direction.

::: lab ch8-model
model.title: A long chain, coiled at random
model.how: Drag the number of segments, and press "new chain" to re-randomise. The gold line is the chain; the red line is the straight-line distance between its two ends. Compare "how long it would be if straightened" with "how far apart its ends actually are".
ctl.N: Number of segments N
ctl.new: New chain
cv.aria: Chart: a long chain whose segments point in random directions, with a red line joining its two ends
read.len: Length when straightened
read.R: End-to-end distance of this chain
read.rms: Root-mean-square over many chains
read.sq: √N
say: A chain of {N} segments, straightened, is {N} segments long; coiled at random, its two ends are on average only <em>{rms} segments</em> apart (root-mean-square over 400 chains). The theoretical value is √N = {sq}, and the straightened length is {x} times that. There is only one way to lay the chain straight, but countless ways to coil it.
:::

The average distance between the two ends is √N·b, not N·b. A chain of {=ch8.N1} segments is on average only {=ch8.r1} segments across, and one of {=ch8.N2} segments is {=ch8.r2} segments across. Straightening it does not stretch any bond; it only drives the chain from "countless coilings" to "the one straight arrangement", and as soon as you let go it springs back. This is where the elasticity of rubber comes from: it is not a spring of energy but a spring of entropy, which is why a stretched rubber band shrinks when it is warmed. As with the hydrophobic effect in chapter 7, what matters here is "how many arrangements there are".

If each segment of the chain is different, some liking water, some avoiding it, some charged, it will no longer coil at random. The next chapter covers that kind of chain.

The freely jointed chain lets the chain pass through itself, and it ignores the bond angles between neighbouring segments. Real chains are stiffer and coil out larger (in a good solvent they scale as N<sup>0.59</sup>, not N<sup>0.5</sup>). The lab is two-dimensional; the conclusion √N holds equally in three dimensions. {.take}

## A Chain Folds Itself into a Machine: Proteins {#ch9}

::: strings
toc: A Chain Folds Itself into a Machine: Proteins
:::

A protein is a chain strung from twenty kinds of amino acid. It holds no strong bond that fixes its shape; with only the weak forces we have met, it folds itself into a definite shape in a time from a millisecond to a few seconds. The sequence determines the shape, and the shape determines the function. {.law}

Egg white turns white and sets when heated, and it never turns back. No covalent bond in the egg-white protein breaks, and its chemical composition does not change at all; only its shape changes: the chain, once neatly folded, unravels and tangles with itself. So the forces holding that shape are weak; a rise of a few tens of degrees is enough to overwhelm them.

The forces that hold the shape are those of chapter 7, plus a few more:

- **Hydrogen bonds**: between the N–H and C=O groups along the backbone, which lock the chain into helices and sheets. {#f1}
- **Hydrophobic effect**: about half of the side chains of the twenty amino acids are oily and avoid water. The chain folds to bury them inside and keep the water-loving ones on the surface. This is the main driving force of folding. {#f2}
- **Dispersion forces**: atoms inside are packed as tightly as in a crystal, and each pair contributes a little. {#f3}
- **Electrostatics**: attraction between positively and negatively charged side chains. {#f4}
- A few proteins also have disulfide bonds (true covalent bonds) that pin the shape in place. {#f5}

Each of these is worth only a few kT. In total, a folded protein is only a few tens of kJ/mol more stable than the unfolded state, about the energy of a few hydrogen bonds.

The question is how it finds that shape. In 1969 Levinthal worked out the bill: a chain of {=ch9.n} amino acids, even if each has only {=ch9.s} possible states, has {=ch9.conf} conformations in all. Trying 10¹³ of them a second (the speed of molecular vibration), trying them all would take {=ch9.years} years, which is {=ch9.age} times the age of the universe. Yet real proteins fold within milliseconds to seconds. This is called **Levinthal's paradox**. The answer is that the protein is not trying at random: each favourable local contact lowers the energy a little, and the search narrows behind it, like rolling down a funnel.

This can be tried by hand in a model small enough to enumerate exhaustively. The **HP model** (Lau and Dill, 1989) keeps only the main term, the hydrophobic effect. Amino acids come in two kinds, H (hydrophobic) and P (hydrophilic); the chain must run along the points of a square grid and cannot overlap itself; and each time two H residues that are not neighbours in the chain touch, the energy drops by one unit.

::: diagram dg-hp keys=dg.hp
cap: Figure 12: a 12-residue HP chain, straight and folded to its lowest energy. The lowest fold is the one the page found by trying all {=ch9.c12} folds; it is the only one, and in it {=ch9.e12} pairs of H touch.
aria: Diagram: on the left, a straight chain, with solid gold circles for hydrophobic H and open cyan circles for hydrophilic P; on the right, the folded chain, with the hydrophobic residues packed in the middle and red dashed lines marking the H pairs that touch
open: Straight: no H touches another H
fold: Folded: {=ch9.e12} H pairs touch
h: H: hydrophobic, avoids water
p: P: hydrophilic
con: a touching pair of H
:::

::: lab ch9-model
model.title: Fold a protein yourself
model.how: Choose a sequence. Use the four direction keys to place the next residue one square at a time; you can undo a wrong move or start again. The goal is to get as many H (solid gold) touching one another as possible. The page has already tried every fold, so it knows how many contacts the best one reaches; if you cannot find it, press "show best fold".
ctl.seq: Sequence
ctl.up: Up one square
ctl.down: Down one square
ctl.left: Left one square
ctl.right: Right one square
ctl.undo: Undo
ctl.reset: Start again
ctl.best: Show best fold
seq.s10: 10 residues
seq.s12: 12 residues
seq.s14: 14 residues
cv.aria: Chart: an HP chain on a grid; solid gold circles are hydrophobic H, open cyan circles hydrophilic P, and red dashed lines join H pairs that touch
read.placed: Placed so far
read.e: H touching H
read.best: Most that can touch
read.count: All possible folds
read.deg: Number of best folds
placed.v: {i} / {n}
e.v: {v} pairs
deg.v: {v} folds
say.start: Only the first residue is placed. Keep placing with the direction keys: this chain has <em>{count}</em> possible folds, and the best of them lets {best} pairs of H touch.
say.going: {i} placed, {left} left. Right now <em>{e} pairs</em> of H touch.
say.blocked: That square already holds a residue, and the chain cannot overlap itself. Try another direction.
say.stuck: You have walked into a dead end: every neighbouring square is taken, and the remaining {left} residues cannot be placed. Undo a few steps and try again.
say.done: Folded: <em>{e} pairs</em> of H touch, and the best fold has {best}. Of the {count} folds, this one is not yet the lowest in energy; look at which H are still exposed.
say.doneBest: Folded: <em>{e} pairs</em> of H touch, which is the lowest-energy fold. Only {deg} of the {count} folds reach it.
say.shown: This is the lowest-energy fold: <em>{e} pairs</em> of H touch, with all the hydrophobic residues buried inside. Only {deg} of the {count} folds are this low.
:::

Folding it a few times yields some lessons. H is pushed inward and P is left outside; this is where the "hydrophobic core" of real proteins comes from. The 12-residue chain has {=ch9.c12} possible folds, and the 14-residue chain {=ch9.c14}: every two extra residues multiply the number of folds by seven or eight, so exhaustive enumeration quickly becomes impractical, a small-scale version of Levinthal's bill. Each of these three sequences has only one lowest-energy fold. Such sequences are special: write one at random and its lowest-energy folds usually come in many versions, which in the real world corresponds to a chain that does not fold into a fixed shape. **Sequences that fold into a unique shape are rare; evolution selected them.**

Why does the shape matter? An enzyme's active site is a pocket formed by a few amino acids placed in space, with its shape, charge and hydrogen-bond positions matching the molecule it grips. Antibodies recognising antigens, and drug molecules fitting into their targets, also work by shape and weak forces fitting together. Change one amino acid and the pocket can change shape: sickle-cell anaemia comes from one hydrophilic amino acid on the surface of haemoglobin being replaced by a hydrophobic one, so that the proteins stick together into long fibres.

The HP model has only two kinds of amino acid, one kind of interaction and a two-dimensional square grid. It shows that the hydrophobic effect alone is enough to give a chain a definite shape, but it cannot predict the structure of any real protein: real folding also has to account for hydrogen bonds, the shapes of side chains, water and temperature. The methods that do this today are in the next chapter. {.take}

## Where the Frontier Is (November 2026) {#ch10}

::: strings
toc: Where the Frontier Is (November 2026)
:::

In principle, everything in this essay can be computed from one equation. The difficulty is computing it at all: for the most accurate method, doubling the size of the system costs more than a hundred times as much. Progress over the past five years has been to build a bridge between "accurate" and "large" with machine learning. Where this bridge is solid, and where it is still only a claim, has to be judged separately. {.law}

The first nine chapters used simplified models: two 1s orbitals, the Hückel model that cares only about connections, charged spheres, Lennard-Jones. To compute a real molecule or material, you must solve the Schrödinger equation for all the electrons. The electrons repel one another, and each one's motion depends on all the others. The equation has no exact solution; there is only a ladder of approximations, each more expensive than the last:

- **Hartree–Fock** (1930s): each electron feels only the average field of the others. The cost grows as the fourth power of the system size N. It misses the part of the energy that comes from electrons avoiding one another (the correlation energy), and dispersion forces lie entirely within that part. {#m.hf}
- **Density functional theory** (DFT, 1964–65; Kohn shared the 1998 Nobel Prize in Chemistry): it does not track each electron, only the electron density. The cost is roughly N³, handling hundreds to thousands of atoms, and it is the workhorse of materials and chemical calculation today. The price is that one term, the exchange–correlation functional, has no known exact form, so approximations must be used. {#m.dft}
- **Coupled cluster CCSD(T)**: it systematically recovers the correlation energy, and for most small molecules it is accurate to within 4 kJ/mol; it is called the "gold standard". Its cost is N⁷. {#m.cc}

What N⁷ means is easy to see by dragging.

::: lab ch10-model
model.title: How much more work a bigger system takes
model.how: Drag "scaling up the system". Suppose each method takes exactly 1 minute on the original small system; see how long each takes after scaling. The bars are on a logarithmic scale.
ctl.x: Scaling up the system
cv.aria: Chart: the time the five methods need after the system is enlarged, on a logarithmic scale
cv.mlip: Machine-learned potential
read.ml: Machine-learned potential (N)
read.dft: DFT (N³)
read.hf: Hartree–Fock (N⁴)
read.cc: CCSD(T) (N⁷)
say.one: No scaling yet: every method takes 1 minute. Drag to the right.
say.x: Scaled up {x} times: the 1 minute of DFT becomes <em>{dft}</em>, and the 1 minute of CCSD(T) becomes <em>{cc}</em>. Put the other way round: even if the computer were 1000 times faster, CCSD(T) could handle a system only {g} times larger.
:::

Doubling the system makes DFT take {=ch10.dft2} times as long and CCSD(T) {=ch10.cc2} times as long; with a computer 1000 times faster, CCSD(T) can handle a system only {=ch10.g} times bigger. So the field has three real measures: **how accurate** (how far off it is from experiment or from CCSD(T), in kJ/mol), **how large** (how many atoms), and **how long** (how long a time it can simulate). Any news item can be asked what it scores on each of these three.

Each item below is dated. I checked these sources on 18 November 2026; models, records and rankings go out of date.

### Established {#h.est .sub3}

- The scaling of the three methods above is set by their algorithms, and textbooks give it. Practical programs use many tricks to lower the exponent, but the order "more accurate, more expensive" has not changed. {#e1}
- The approximate functionals of DFT have several known systematic failures: they underestimate band gaps; electrons are spread too far apart (self-interaction error), so reaction energy barriers come out too low; the most common families of functionals contain no dispersion forces and need a correction added separately; and systems with strongly correlated electrons (many transition-metal oxides, high-temperature superconductors) are often calculated wrongly. These are not faults in the programs; they are properties of the approximations themselves. {#e2}
- Predicting structure from sequence for single-domain proteins is essentially solved. The CASP16 assessment published in 2025 (a biennial blind test using structures that have not been published) states that fold prediction for single domains is "nearly solved", and not one target was predicted with the wrong fold; for most proteins, the difference between prediction and experiment has reached the level of experimental error. {#e3}

### Demonstrated {#h.demo .sub3}

- **Protein structure prediction.** AlphaFold 2 (DeepMind; the paper appeared in Nature in July 2021) first reached near-experimental accuracy in the CASP14 blind test of 2020. It solves no equations; it learns from over a hundred thousand known experimental structures and a large number of sequences. AlphaFold 3 (May 2024, Nature) extended the scope to complexes of proteins with nucleic acids and small molecules. {#d1}
- **Its limits, as the authors themselves wrote.** The AlphaFold 3 paper lists several: on one standard test set, 4.4% of the results get the molecule's handedness (chirality) wrong; atoms occasionally overlap; in regions that have no fixed structure to begin with, it "hallucinates" tidy structures; and it gives a static structure, not the motion of molecules in solution, and not necessarily the one conformation that applies under given conditions. The CASP16 summary (November 2025) also notes that for RNA, deep-learning methods were "clearly unsuccessful", no better than traditional ones; and for a molecule with several conformations, without a template, the results are usually poor. {#d2}
- **Machine-learned interatomic potentials.** The idea: first compute the energies and forces of tens of millions to hundreds of millions of small systems with DFT, train a neural network to fit them, then use it in place of DFT to run molecular dynamics like that of chapter 7; the cost then grows only linearly with the number of atoms. Meta's OMol25 dataset (May 2025) contains more than 100 million DFT calculations, with systems of up to 350 atoms; the same team's UMA model (June 2025) was trained on about 500 million structures. On the public Matbench Discovery leaderboard (which judges whether hypothetical crystals are stable), at the time I looked, the top model had been submitted on 31 October 2026, with an F1 score of 0.935, and 49 models were listed; when the leaderboard was set up in 2023, the best was about 0.6. {#d3}
- **Two-dimensional materials.** In January 2024 a team from Georgia Tech and Tianjin University reported in Nature semiconducting graphene grown on silicon carbide, with a band gap of 0.6 eV (chapter 5 said that ordinary graphene has no band gap, so it cannot be used as a switch). In April 2025 a team from Fudan University reported in Nature a 32-bit RISC-V processor built from 5,900 single-layer molybdenum disulfide transistors. This is the most highly integrated two-dimensional semiconductor processor I could verify; for comparison, a silicon chip has about ten billion transistors. {#d4}
- **High-entropy alloys.** Traditional alloys have one main element with a little of others; a high-entropy alloy has three to five elements in roughly equal proportions, randomly occupying one and the same lattice. One measurement, published in Science in December 2022: the CrCoNi alloy reached a fracture toughness of 459 MPa·m<sup>½</sup> at 20 K (−253 °C), one of the highest values on record. Most materials become more brittle as they get colder; this one gets tougher. {#d5}

### Claimed, and disputed {#h.claim .sub3}

- <span class="tag m">Claim and criticism</span>**"AI found 2.2 million new materials."** DeepMind's GNoME (November 2023, Nature) used a neural network plus DFT to screen out 2.2 million computationally stable crystal structures, of which 381,000 lie on the updated stability boundary; the paper says 736 of them have been independently synthesised by other laboratories. Criticism came from solid-state chemists: after reviewing it, Cheetham and Seshadri (April 2024, Chemistry of Materials) wrote that they found "scant evidence" for compounds that are novel, credible and useful. What must be kept apart: these 2.2 million are "energetically stable" as calculated by DFT at zero temperature; this does not mean they can be synthesised, still less that they are useful. {#c1}
- <span class="tag m">Claim and criticism</span>**"An automated lab synthesised 41 new materials in 17 days."** The A-Lab paper published the same day (Berkeley, Nature) reports that a robotic laboratory synthesised 41 of 58 targets in 17 days. Leeman and colleagues at Princeton and University College London (March 2024, PRX Energy) reanalysed the data and concluded that the work "found no new materials": about two-thirds of the "successful" products were probably known compounds with disordered composition, taken for the predicted ordered structures. The disagreement centres on whether the automatic analysis of powder diffraction data is reliable enough. I have not checked the original authors' reply to this. {#c2}
- <span class="tag m">The authors' own result</span>**Generative design.** Microsoft's MatterGen (January 2025, Nature) does not screen; it generates crystal structures directly from specified properties. The paper includes one experimental check: TaCr₂O₆, generated for a target bulk modulus of 200 GPa, was synthesised and measured at 169 GPa, less than 20% off, and its structure has disordered Ta and Cr. This is one example, not a statistic. {#c3}
- <span class="tag m">Preprint</span>**A learned functional.** Microsoft's Skala (preprint first posted June 2025, updated April 2026) uses deep learning to fit the unknown exchange–correlation functional in DFT. The authors report an error of 2.8 kcal/mol on the GMTKN55 test set for main-group molecules, better than the best traditional hybrid functionals, at a cost comparable to cheap functionals. This is the authors' own test result; to see how it does on transition metals and solids, one must wait for others' checks. {#c4}
- <span class="tag m">Leaderboard</span>Rankings on leaderboards such as Matbench Discovery change every few months (in February 2026 a model from EPFL in Lausanne was announced as top; by November the top spot had gone to another model), and everyone trains and tests on the same public data. A high ranking shows that a model fits DFT well; it inherits all of DFT's errors (see "Established", item 2). {#c5}

### Unsolved {#h.open .sub3}

- **Strongly correlated electrons.** High-temperature superconductivity and the active centres of many catalysts involve electron repulsion so strong that the starting point, "each electron feels an average field", is no longer right. No method is both cheap and reliable. {#o1}
- **Motion, not a snapshot.** How a protein folds (not just what it folds into), how an enzyme changes shape, how a drug gets in and out of its pocket: these span times from femtoseconds to seconds, a difference of fifteen orders of magnitude. {#o2}
- **From "stable" to "can be made".** Knowing that a crystal is energetically stable does not tell you how to synthesise it; synthesis routes, disorder and defects still depend mostly on the experimenter's experience. {#o3}

Dates, model names and scores all go out of date: each fact in this chapter describes the situation in November 2026 only. I am an AI: most of the sources here were opened and checked by me; the few I saw only as summaries or secondhand, without opening the original, are marked in this page's notes file (BRIEF.md). {.take}

## Wrap-up: When You See Something, Ask Four Questions {#ch11}

::: strings
toc: Wrap-up: When You See Something, Ask Four Questions
:::

Almost any substance's character can be drawn out of four questions: what its strongest connection is, what its weakest is, which direction the weak kind runs in, and whether its electrons have an empty slot to go to. {.law}

{.qs}
- **What is the strongest connection?** Covalent, ionic or metallic (chapters 2–5). It decides how chemically stable a substance is: whether it burns, whether it rots. Plastics are hard to degrade because the covalent bonds of a carbon chain are worth several hundred kJ/mol, and few things in nature can break them apart. {#q1}
- **What is the weakest connection?** Melting, boiling, dissolving and softening all break the weakest kind (chapter 7). Compare it with kT: one hydrogen bond in ice is about {=ch11.hb} times room-temperature kT, which is why ice melts only at 0 °C; a protein's shape is only a few tens of kJ/mol more stable than its unfolded state, so a fever reaching 42 °C is dangerous (chapter 9). {#q2}
- **Which direction does the weak connection run in?** Graphite's weakness lies between its layers, which is why it can leave marks on paper; metallic bonds have no direction, so metals can bend; in salt, a shift of half a spacing brings like charges face to face, so it is brittle; in rubber the bonds between chains are weak and the chains themselves strong, so it can be stretched (chapter 8). {#q3}
- **Is there an empty slot for the electrons to go to?** If empty levels lie right above the filled ones, the material conducts, is opaque and has a metallic lustre. Separated by a band gap, it is an insulator; if the gap is wider than visible light, it is transparent; if the gap lies within visible light, it has colour (chapters 3 and 5). {#q4}

In one sentence: atoms stick together because electrons spread over several nuclei have lower energy than electrons held by a single nucleus; how they spread, how unevenly they are shared, and how far the connection extends decide what the thing is like. {#sum .sum}

Related pages: [[atomic-structure]], [[periodic-trends]], [[molecular-shapes]], [[isomers]], [[particles-states]], [[eigenvectors]] and [[quantum-basics]]. Several essays not yet online connect with this one. The one on thermodynamics (whether a reaction happens, and how far it goes) takes up entropy and free energy, building on chapters 7 and 9; "Why Chips Keep Getting Harder to Make" builds on chapter 5 for band gaps and transistors; "Why Batteries Hold So Little" uses the ions and lattices of chapter 4. Links will be added here once they are registered. {#links}

::: footer
**Sources.** Particle in a box, the LCAO integrals for H₂⁺, the Hückel model and the virial theorem: P. Atkins, J. de Paula and J. Keeler, Physical Chemistry, 11th ed. (Oxford, 2018), chapters 7 and 9; I. N. Levine, Quantum Chemistry, 7th ed. (Pearson, 2014), chapters 13 and 17; the optimisation of ζ: B. N. Finkelstein and G. E. Horowitz, Z. Phys. 48, 118 (1928); the exact H₂⁺ solution: L. J. Schaad and W. V. Hicks, J. Chem. Phys. 53, 851 (1970). The kinetic-energy account of bonding: K. Ruedenberg, Rev. Mod. Phys. 34, 326 (1962). E. Hückel, Z. Phys. 70, 204 (1931). Electronegativity and ionicity: L. Pauling, The Nature of the Chemical Bond, 3rd ed. (Cornell, 1960). Madelung constant: H. M. Evjen, Phys. Rev. 39, 675 (1932); D. Borwein, J. M. Borwein and K. F. Taylor, J. Math. Phys. 26, 2999 (1985); lattice energy and bands: C. Kittel, Introduction to Solid State Physics, 8th ed. (Wiley, 2005), chapters 3 and 7. Hybridisation angles: C. A. Coulson, Valence (Oxford, 1952). Lennard-Jones potential and molecular dynamics: M. P. Allen and D. J. Tildesley, Computer Simulation of Liquids, 2nd ed. (Oxford, 2017); argon parameters: A. Rahman, Phys. Rev. 136, A405 (1964); velocity Verlet: W. C. Swope et al., J. Chem. Phys. 76, 637 (1982). HP model: K. F. Lau and K. A. Dill, Macromolecules 22, 3986 (1989). Levinthal: C. Levinthal, 1969 conference report. Thermochemistry, boiling points, bond lengths, dipole moments and densities: data from the CRC Handbook of Chemistry and Physics and NIST, values standard across the textbooks. {#sources}

**Frontier (all checked 2026-11-18).** J. Jumper et al., Nature (2021-07-15); J. Abramson et al., Nature (2024-05-08); R. Yuan et al., CASP16 monomer assessment, Proteins (2025-08); A. Kryshtafovych et al., CASP16 summary, Proteins (2025-11); A. Merchant et al. (GNoME), Nature (2023-11-29); N. J. Szymanski et al. (A-Lab), Nature (2023-11-29); A. K. Cheetham and R. Seshadri, Chemistry of Materials (2024-04-08); J. Leeman et al., PRX Energy 3, 011002 (2024-03-07); C. Zeni et al. (MatterGen), Nature (2025-01), and Microsoft Research's note of 2025-01-16; D. S. Levine et al. (OMol25), arXiv:2505.08762; B. M. Wood et al. (UMA), arXiv:2506.23971; G. Luise et al. (Skala), arXiv:2506.14665; F. Bigi et al., arXiv:2601.16195; Matbench Discovery leaderboard (matbench-discovery.materialsproject.org); J. Zhao et al., Nature (2024-01-03); M. Ao et al., Nature (2025-04-02); D. Liu et al., Science (2022-12-01). {#frontier}

**Models.** Each model is a direct implementation of the formulas cited, with no fitted curves: particle-in-a-box levels; the analytic H₂⁺ integrals with a one-dimensional optimisation; the Jacobi method for the eigenvalues of symmetric matrices; the closed form of the two-site model; Madelung sums, term by term; Sturm-sequence bisection for tridiagonal matrices; gradient descent on the sphere; velocity-Verlet molecular dynamics with a Berendsen thermostat; the freely jointed chain; exhaustive search for the HP model. All random numbers use fixed seeds. Only four parameters are tuned rather than calculated: Hückel's |β| (fitted to butadiene), the |β| = 2 eV used to convert the band chapter into eV, the thresholds that label solid, liquid and gas, and the Born exponent n = 8 (an empirical value). This essay was written by Claude (Anthropic's AI) and has not yet been independently reviewed. {#models}
:::
