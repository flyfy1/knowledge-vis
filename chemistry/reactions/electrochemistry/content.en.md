---
lang: en
---

::: strings
pageTitle: Electrochemistry · Electrons Running Down the Wire, or Pushed Along
tagline: A redox reaction is split into two half-cells: spontaneously it drives a current through the wire (a galvanic cell), and an applied opposing voltage turns it into an electrolytic cell.
:::

## A galvanic cell: oxidation and reduction in separate beakers {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Galvanic cell
:::

::: html step0-1
:::

This step answers: why do electrons flow along a wire from one electrode to the other? In a redox reaction one metal loses electrons (**oxidation**) and an ion gains them (**reduction**). Put them in separate beakers joined by a wire and the electrons can only go through the wire. The electrode losing electrons is the **anode** (where oxidation happens, the negative terminal in a galvanic cell); the one gaining them is the **cathode** (where reduction happens, the positive terminal). Which metal gives up electrons more readily is read from the **standard electrode potential** E° (the tendency of the metal ion to gain electrons, in volts): the lower E° is the anode, the higher is the cathode, and E°cell = E°cathode − E°anode. The salt bridge lets ions move and keeps both beakers neutral. Press play: the yellow dots are electrons. {#s0e .explain}

::: html step0-2
s0o: Select Zn–Cu, Zn–Ag, Cu–Ag and Mg–Cu in turn: see that the electron flow always runs from anode to cathode, and read the cell voltage; compare which pair has the largest, and how large the height gap is between the two short coloured bars on the potential scale between the beakers.
pZnCu: Zn–Cu
pZnAg: Zn–Ag
pCuAg: Cu–Ag
pMgCu: Mg–Cu
bPlay: Play / Pause
:::

::: strings
r0: {pair}: anode (oxidation) {an}, E° = {ea} V; cathode (reduction) {cat}, E° = {ec} V; E°cell = {ec} − ({ea}) = {e} V; electrons run along the wire from {an} to {cat}.
mZn: zinc
mCu: copper
mAg: silver
mMg: magnesium
lblAn: anode (oxidation)
lblCat: cathode (reduction)
lblE: E°cell
:::

## Discharge: how does the voltage change as the reaction proceeds? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Discharge
:::

::: html step1-1
:::

This step answers: as a battery is used, how does its voltage change? Take the zinc–copper cell (zinc in a solution with [Zn²⁺] = 0.01 mol/L and copper in a solution at the initial [Cu²⁺], 1 L each). For every 2 mol of electrons transferred, 1 mol of Zn dissolves and 1 mol of Cu plates out. The cell voltage varies with concentration as E = E° − (0.0592/2)·log₁₀([Zn²⁺]/[Cu²⁺]) (25 °C, the Nernst equation, detailed in the next step). Press play: the curve builds up E against reaction progress (moles of Cu²⁺ reacted). Most of the time the voltage declines only slowly, then falls noticeably faster once the Cu²⁺ is nearly used up (in this ideal model it only falls to about 0.9 V; a real cell collapses to zero when electrode material runs out). {#s1e .explain}

::: html step1-2
s1o: Play to the end and find where the voltage starts to fall noticeably faster; reduce the initial [Cu²⁺] and the steeper drop starts sooner; raise the discharge speed, which only changes how fast the curve is drawn, not its shape.
lC0: Initial [Cu²⁺] (mol/L)
lRate: Discharge speed
bReset: Reset: clear the curve and restore the electrodes
:::

::: strings
r1: Reacted {xi} mol: [Cu²⁺] = {cu}, [Zn²⁺] = {zn}; E = {e} V; {mzn} g of Zn dissolved and {mcu} g of Cu plated.
:::

## The Nernst equation: concentrations push the voltage too {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Nernst equation
:::

::: html step2-1
:::

This step answers: away from standard conditions, what is the cell voltage? Use the **reaction quotient** Q = [Zn²⁺]/[Cu²⁺] (products over reactants): E = E° − (0.0592/n)·log₁₀Q (25 °C, with n = 2 electrons transferred). The larger Q is (more products, fewer reactants), the lower the voltage; at Q = K (equilibrium) E = 0 and the cell is "dead". On the right the horizontal axis is log₁₀Q and the vertical axis is E: a straight line of slope −0.0296 V; the dot is the current concentrations. E° = 1.10 V and the equilibrium constant is K = 10^(nE°/0.0592). {#s2e .explain}

::: html step2-2
s2o: Set both concentration sliders to 0 (that is 1 mol/L): E = E°; make [Cu²⁺] ten times smaller: by how much does E change? Then make [Zn²⁺] ten times larger and compare; log₁₀K in the readout tells how large log₁₀Q must get before the voltage hits zero.
lLogCu: log₁₀[Cu²⁺]
lLogZn: log₁₀[Zn²⁺]
:::

::: strings
r2: Q = [Zn²⁺]/[Cu²⁺] = {q}, log₁₀Q = {lq}; E = 1.10 − 0.0296×({lq}) = {e} V; at equilibrium log₁₀K = {lk} (E = 0 when Q reaches K).
:::

## An electrolytic cell: an opposing voltage runs the reaction backwards {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Electrolytic cell
:::

::: html step3-1
:::

This step answers: how does an applied voltage affect the direction of the reaction? Still the zinc–copper cell (both at 1 mol/L), E = 1.10 V. Add a source in series that opposes the cell with voltage V: the net emf of the loop is E − V and the current is I = (E − V)/R (take R = 1 Ω). With V &lt; E it is still a galvanic cell discharging (Zn dissolves, Cu plates); at V = E the current is zero; with V &gt; E the current reverses and it becomes an **electrolytic cell**: Cu dissolves, Zn plates, and the external source "charges the cell". When the current reverses, which electrode is the anode (where oxidation happens) changes too. {#s3e .explain}

::: html step3-2
s3o: Move V from 0 to 2: the electron flow falls to zero at V = 1.10 V and reverses; notice the anode label change from zinc to copper; the sign of the current in the readout gives its direction.
lVapp: Applied opposing voltage V (V)
:::

::: strings
r3: Applied V = {v} V, E = {e} V: net drive = {net} V, current I = {i} A ({dir}); the anode (oxidation) is {an}.
dirGal: galvanic discharge: electrons Zn → Cu
dirNone: zero current
dirElec: electrolysis: electrons Cu → Zn, external source charging
:::

## Faraday's law of electrolysis: the charge passed sets the metal deposited {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Faraday's law
:::

::: html step4-1
:::

This step answers: when electrolysing a Cu²⁺ solution, how much copper deposits at the cathode? The charge passed is Q = I·t (coulombs); depositing 1 mol of Cu takes 2 mol of electrons, and 1 mol of electrons carries F = 96485 C. So the mass deposited is m = M·I·t/(n·F), with M = 63.55 g/mol (the molar mass of Cu) and n = 2. Press play: the copper layer builds up over time and the plot on the right is a straight line of mass against time with slope M·I/(nF). {#s4e .explain}

::: html step4-2
s4o: Double the current I: the mass at a given time doubles; double the time: the mass doubles too; check the readout's reference value for I = 1 A, t = 60 minutes, about 1.19 g.
lAmp: Current I (A)
lMin: Time t (minutes)
:::

::: strings
r4: I = {i} A, elapsed t = {t} min: charge {q} C, Cu deposited {m} g; (reference: 1 A for 60 min → {ref} g).
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) in a galvanic cell the metal with the lower E° is the anode (oxidation) and electrons run through the wire from anode to cathode; E°cell = E°cathode − E°anode; (2) the voltage falls slowly during discharge and then drops sharply when a reactant runs out; (3) Nernst: E = E° − (0.0592/n)·log₁₀Q; (4) an applied voltage above E makes it an electrolytic cell and the reaction runs backwards; (5) Faraday: m = M·I·t/(nF). {#s5e .explain}

::: html step5-2
qq: In a galvanic cell, which way do electrons flow in the external wire?
qo0: From the cathode to the anode
qo1: From the anode to the cathode
qo2: Along the salt bridge from one beaker to the other
s5m: This page uses ideal standard electrode potentials (25 °C) and the Nernst equation: it ignores internal resistance and overpotential, the difference between concentration and activity, temperature changes, polarisation and gas side reactions; in step 1 the volume is fixed at 1 L and the salt bridge keeps charge balanced; in step 3 R = 1 Ω is a teaching value; step 4 assumes 100% current efficiency with only Cu depositing; the speed and number of electron dots are schematic and do not represent the real electron drift velocity.
lk0: Electric fields: potential and potential difference; E° is this kind of energy-per-charge difference
lk1: Chemical equilibrium: Q and K, the same reaction quotient as in the Nernst equation
lk2: Activation energy: a spontaneous cell reaction (E > 0) is not necessarily fast; its rate depends on a different hill
:::

::: strings
qwhy: Oxidation at the anode releases electrons that travel through the wire to the cathode, where reduction takes place; the salt bridge carries ions, not electrons (step 0).
:::
