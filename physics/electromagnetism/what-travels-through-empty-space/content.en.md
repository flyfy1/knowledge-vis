---
lang: en
title: What Is Actually Travelling When a Signal Crosses Empty Space · A Hands-on Essay
desc: Voyager 1 is one light-day away with nothing in between, and its signal still arrives. This essay starts from electric and magnetic fields: how Maxwell's four laws make a wave that carries itself, how the speed of light falls out of two bench-top constants, how waves are radiated, what they carry, and what matter and the atmosphere do to them; then modulation, link budgets, optical fibre, the diffraction limit and phased arrays, and the frontier as of 2026. Fourteen hands-on models, each the real equation at small scale.
---

::: strings
nav.back: ← Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.x: {v} ×
u.none: none
u.inf: infinity
:::

# What Is Actually Travelling When a Signal Crosses Empty Space {#hero}

::: strings
kicker: Physics · Electromagnetism · A hands-on essay
:::

Sound needs air, and water waves need water.<br>What do radio waves and light use to cross empty space? {.sub}

On 18 November 2026, Voyager 1 is exactly one light-day from Earth: its radio signal takes a full 24 hours to arrive. Along the way there is almost perfect vacuum, with nothing that can "vibrate". This essay asks only one question: **when a signal crosses a vacuum, what is actually doing the carrying?** The answer comes in three parts. Chapters 1–6: the electric and magnetic fields themselves carry the signal. They push each other along, the speed is fixed by two constants of the vacuum, and the wave carries energy and momentum. Chapters 7–8: the same kind of wave, at different frequencies, behaves very differently when it meets matter, and that decides which frequencies can be used for what. Chapters 9–11: how people put information onto a wave, work out how far it can reach, confine it in glass fibre, and focus it into a beam. Chapter 12 is the frontier as of November 2026. {.lead}

The prerequisites are secondary-school electricity and magnetism: [[electric-fields]], [[magnets]], [[magnetic-force]] and [[electromagnetic-induction]]. Each model here is a scaled-down version of the real thing. The waves in chapters 3 and 4 are computed step by step with the finite-difference time-domain method that engineers really use, and the atmospheric absorption in chapter 8 uses the International Telecommunication Union's line-by-line formulas and spectral line tables. This essay was written by an AI; the last paragraph of each chapter says what the model leaves out. {.note}

## Something Is in the Vacuum: Fields {#ch1}

::: strings
toc: Something Is in the Vacuum: Fields
:::

A charge does not pull on another charge directly across space. It first changes the space around it. That change is called a field, and the other charge feels the field at its own position. {.law}

Put a magnet on a table, scatter iron filings around it, and the filings line up in curves. Take the magnet away and they scatter. The filings never touched the magnet; they responded to something around it. That something is called a **field**. [[electric-fields]] and [[magnets]] each show what the electric and magnetic fields look like. Here we list only the four facts we need later.

{.qs}
- **Electric field E** is produced by charges, and also by a changing magnetic field. The force it exerts on a charge is F = qE, whether or not the charge is moving. Its unit is volts per metre. {#f1}
- **Magnetic field B** is produced by currents (moving charges), and also by a changing electric field. It exerts a force only on moving charges, and that force is perpendicular to the velocity ([[magnetic-force]]). Its unit is the tesla. {#f2}
- Fields carry **energy**. Each cubic metre of electric field stores ½ε₀E² joules, and each cubic metre of magnetic field stores B²/(2μ₀) joules. When you charge a capacitor or switch current through an inductor, the energy is stored in the field. {#f3}
- The two constants in these formulas are properties of the vacuum itself. **ε₀** = {=ch1.eps0} farads per metre says how "costly" it is to set up an electric field in vacuum. **μ₀** = {=ch1.mu0} newtons per square ampere says how "easily" a current produces a magnetic field. Both were measured on the bench with capacitors, coils and a balance. Nothing was moving during the measurement, let alone light. Remember them; chapter 3 needs them. {#f4}

If a field were only a bookkeeping device, a way of saying "charge A sets up this much field here, so charge B feels this much force", it would not be a real thing. There is a test. Move charge A suddenly and see whether charge B feels it at once or a little later. If it is later, then where is the news that "A has moved" during the delay? It can only be in the space between them. The later chapters show that the news does take time to arrive, and that while it is on the way it carries energy and momentum, having left A but not yet reached B. Fields are real things.

This chapter has no model; it only sets out the vocabulary. The next chapter gives all the rules that fields obey: four of them. {.take}

## Four Laws, and the Term Maxwell Added {#ch2}

::: strings
toc: Four Laws, and the Term Maxwell Added
:::

The electric and magnetic fields obey only four rules. Three of them, and the first half of the fourth, were found from experiment before the 1830s. In the 1860s Maxwell supplied the missing half of the fourth: a changing electric field also produces a magnetic field. Without that half there are no waves. {.law}

All four laws say the same kind of thing. Draw a closed surface, or a closed loop, in space, and count how much of the field passes through it or circulates around it.

::: diagram dg-maxwell keys=dg.mx
cap: Figure 1: Maxwell's four laws, each drawn as a picture. The dashed lines are the imagined closed surfaces or loops (schematic, not to scale).
aria: Diagram: four small pictures. Electric field lines leave a charge. Magnetic field lines go in and out of a closed surface in equal amounts. A changing magnetic field is surrounded by a circulating electric field. A current and a changing electric field are surrounded by a circulating magnetic field.
t1: ① E leaves charges
s1: E out of a closed surface ∝ charge inside
t2: ② B lines have no ends
s2: B out of a closed surface is always 0
t3: ③ Changing B makes E circulate
s3: E around a loop ∝ how fast the B flux changes
t4: ④ Current and changing E make B circulate
s4: B round loop ∝ current + ε₀·d(E flux)/dt
:::

{.qs}
- **Gauss's law**: ∮E·dA = Q/ε₀. The total electric field leaving any closed surface (the electric flux) depends only on how much charge the surface encloses. The shape of the surface and where the charge sits inside it do not matter. {#l1}
- **Gauss's law for magnetism**: ∮B·dA = 0. The total magnetic field leaving any closed surface is zero: whatever goes in comes out. This means there are no isolated magnetic north or south poles. {#l2}
- **Faraday's law**: ∮E·dl = −dΦ<sub>B</sub>/dt. Add up the electric field all the way round a closed loop and you get a voltage, which equals how fast the magnetic flux through the loop decreases. This is [[electromagnetic-induction]]: move a magnet and electricity appears in the coil. Note that the law is about the electric field, not the wire. Even with no wire on the loop, the electric field is there. {#l3}
- **Ampère–Maxwell law**: ∮B·dl = μ₀I + μ₀ε₀·dΦ<sub>E</sub>/dt. Add up the magnetic field all the way round a closed loop and you get μ₀ times the current passing through the loop, plus μ₀ε₀ times how fast the electric flux through the loop increases. Ampère found the first term from experiment. Maxwell added the second. {#l4}

Why did Maxwell add this term? Look at a capacitor that is charging. Current I flows along the wire and stops at one plate, where charge piles up. The space between the two plates is empty, and no charge passes across it. Now draw a loop around the wire and ask: how much current passes through this loop?

::: diagram dg-cap keys=dg.cap
cap: Figure 2: One loop can have two different surfaces stretched across it. The flat surface is pierced by the wire; the bulging surface passes between the two plates and touches no current. Ampère's original law gives different magnetic fields for these two surfaces (schematic, not to scale).
aria: Diagram: a wire connected to the two plates of a capacitor, with a loop around the wire, a flat surface stretched across the loop, and a bulging surface that sits between the plates
wire: Wire: current I
gap: Gap: no charge crosses, E grows
loop: Loop
flat: Flat surface: current passes through
bag: Bulging: only changing E passes
:::

Ampère's law speaks of "the current through the loop", but a loop is only a line, and "through" has to be counted by stretching a surface across it. Stretch a flat surface and the wire pierces it: the current is I. Stretch a bulging surface that encloses one plate, and it passes between the two plates, where there is no current: the answer is 0. The magnetic field round one loop cannot be both values at once. Maxwell noticed that between the plates, although no current flows, the electric field is growing. If you also count "ε₀ times the rate of change of electric flux" as a kind of current, the two surfaces give the same answer. This term is called the **displacement current**.

::: lab ch2-model
model.title: A charging capacitor: the current in the wire, and the "current that is not a current" between the plates
model.how: A {=ch2.V}-volt battery charges a pair of circular plates through a {=ch2.R}-ohm resistor. Drag time to see the current in the wire and the displacement current between the plates; drag the loop radius to see the magnetic field on the loop. Then switch off Maxwell's term and see whether the two methods still agree.
ctl.t: Time (in units of RC)
ctl.r: Loop radius (in units of plate radius)
ctl.mx: Include Maxwell's term
read.i: Current in the wire
read.id: Displacement current between the plates
read.bg: Field when the loop sits between the plates
read.bw: Field when the loop is around the wire
cv.aria: Graph: the charging current decays with time, and the electric field between the plates rises with time
cv.t: Time (RC) →
cv.i: Current in the wire
cv.e: Electric field between the plates
say.in: The current in the wire is {i}, and the displacement current between the plates is also <em>{id}</em>, though no charge crosses. The loop is smaller than the plates, so it encloses only {frac} of the electric flux, and the field is {bg}.
say.out: The current in the wire is {i}, and the displacement current between the plates is also <em>{id}</em>. The loop is larger than the plates and encloses all of the electric flux: the field is {bg}, the same as the {bw} found by moving the loop onto the wire.
say.off: With Maxwell's term switched off, the loop around the wire gives a field of {bw}; the same loop moved between the plates gives a field of <em>0</em>. The magnetic field does not suddenly vanish at the end of the wire; this law is missing a piece.
:::

In the model, the displacement current is not copied from the wire current. It is computed directly, as the rate of change of the electric flux between the plates. It equals the wire current at every instant, falling from {=ch2.I0} mA at the start. This is no coincidence: the electric field between the plates grows by exactly as much charge as flows onto them (Gauss's law), so the "current" does not break at the plates. It simply continues in another form.

The term is small. The capacitance of this pair of plates is only {=ch2.C} picofarads, and charging takes only {=ch2.tau} nanoseconds. Even at the moment of greatest current, the magnetic field at the edge of the plates is only {=ch2.B0} nanotesla, about one thousandth of Earth's magnetic field. So Faraday's generation did not detect it in experiments. Maxwell deduced it from the requirement that the laws must not contradict each other. It was finally confirmed by experiment in 1887, when Hertz produced electromagnetic waves.

With the second half of the fourth law in place, the four laws contain a closed loop: **a changing magnetic field produces an electric field (the third law), and a changing electric field produces a magnetic field (the fourth law)**. The two can sustain each other, with no charges or currents needed. The next chapter looks at what this loop produces.

Limits of the model: the field between the plates is treated as uniform, ignoring the bending at the edges; and the charging is slow enough that the current is the same everywhere in the circuit (the charging time is much longer than the time light takes to cross the circuit). That holds only marginally in this example, where the time is {=ch2.tau} nanoseconds. {.take}

## The Wave Falls Out by Itself {#ch3}

::: strings
toc: The Wave Falls Out by Itself
:::

In a vacuum with no charges, Faraday's law and the Ampère–Maxwell law together form a wave equation. The wave speed is 1/√(μ₀ε₀). Computed from the two constants measured on the bench, it is exactly the speed of light. {.law}

A stadium wave: each person only stands up and sits down again, and no one runs sideways, yet the "wave" goes all the way round the stadium. Each person decides when to stand by watching the people next to them. An electromagnetic wave works the same way, except that what "stands up" is the field, and "next to" means neighbouring points in space.

Apply the two laws from chapter 2 to a small region of space. Suppose the electric field points only in the y direction, the magnetic field only in the z direction, and both vary only with x. Draw a small rectangular loop between x and x + Δx. Faraday's law says that the difference in electric field between the two sides of the loop equals the rate of change of the magnetic flux inside it. Take Δx very small, and it becomes

::: html eq-fa keys=ch3.eq
fa: ∂B/∂t = −∂E/∂x
fa.w: Wherever E varies along x (the two sides are unequal), B changes with time.
am: ∂E/∂t = −(1/μ₀ε₀)·∂B/∂x
am.w: Wherever B varies along x, E changes with time. The coefficient 1/μ₀ε₀ comes from the second half of the fourth law.
:::

Take the derivative of the first equation with respect to x, and of the second with respect to t. B cancels, leaving ∂²E/∂t² = (1/μ₀ε₀)·∂²E/∂x². This is the **wave equation**, the same one that governs a vibrating string and sound: how quickly a quantity curves in time at a point is proportional to how sharply it curves in space. Any shape f(x − vt) is a solution, meaning any shape can translate at speed v without changing its form, where v² = 1/μ₀ε₀.

Put in the two numbers from chapter 1: 1/√(μ₀ε₀) = {=ch3.cCalc} metres per second. When Maxwell worked this number out around 1862, the speed of light had already been measured by Fizeau and Foucault, using toothed wheels and rotating mirrors, and the two numbers matched. He wrote that it was hard to avoid the conclusion that light is a transverse wave of this same electric and magnetic kind. Today the speed of light is a defined value: {=ch3.c} metres per second.

::: diagram dg-wave keys=dg.wave
cap: Figure 3: An electromagnetic wave travelling in the x direction, at one instant. The electric field swings up and down, the magnetic field swings back and forth, both peak and cross zero together, and both are perpendicular to the direction of travel (schematic).
aria: Diagram: a gold electric-field sine wave in a vertical plane and a cyan magnetic-field sine wave in a horizontal plane, in phase, both travelling to the right along the same axis
e: E field
b: Magnetic field B
dir: Travel direction, speed c
lam: One wavelength λ
:::

The derivation stops here; now let the wave actually run. The method engineers use most for antennas, on-chip wiring and stealth aircraft is the **finite-difference time-domain method** (FDTD), proposed by Kane Yee in 1966. It is almost a direct transcription of the two equations above into a program: cut space into small cells and time into small steps, update E at each step from the difference between the two neighbouring B values, then update B from the difference between the two neighbouring E values. Yee's key arrangement is to stagger E and B by half a cell and by half a time step, so that each difference straddles exactly the point being updated.

::: diagram dg-yee keys=dg.yee
cap: Figure 4: The Yee grid. E sits at whole grid points and whole times; B sits at half points and half times. Each new value uses only its two neighbours and its own old value. The two fields leapfrog each other forward in turn.
aria: Diagram: space on the horizontal axis and time on the vertical. Gold dots are E, cyan squares are B, staggered by half a cell in space and half a step in time; arrows show which old values give each new value
e: E: whole cells, whole times
b: B: half cells, half times
x: Space →
t: Time ↑
rule: new E = old E − k·(B right − B left)
:::

::: lab ch3-model
model.title: One-dimensional FDTD: watch E and B push each other along
model.how: An electric-field pulse leaves the middle and travels right, between two metal walls. The top half shows the electric field and the bottom half the magnetic field (multiplied by c, so its size can be compared with E). The program contains only μ₀, ε₀ and the two update rules above; the speed of light is not written in. Drag "cells per step" (the Courant number S) to see the measured speed and total energy, and set S above 1 to see what happens.
ctl.s: Cells per step (Courant number S)
btn.go: Fire again
btn.pause: Pause
btn.play: Resume
btn.step: Run 40 steps
read.v: Speed measured on the grid
read.c: 1/√(μ₀ε₀)
read.u: Total energy now ÷ start value
read.n: Steps taken
cv.aria: Animation: a pulse bounces between two metal walls; the top half is the electric field, the bottom half the magnetic field
cv.e: Electric field E
cv.b: Magnetic field c·B
cv.wall: Metal wall
say.magic: S = 1: the pulse moves exactly one cell per step, and the measured speed is <em>{v}</em> metres per second, which agrees with 1/√(μ₀ε₀) to every digit shown. The total energy stays at {u}. When the pulse bounces off a wall, E flips over and B does not.
say.ok: S = {s}: the measured speed is <em>{v}</em> metres per second, {err} slower than 1/√(μ₀ε₀). This comes from the grid: the cells are finite, so short waves travel slightly slowly on it. The total energy stays at {u}.
say.growing: S = {s}, greater than 1: within one step, information has to cross more than one cell, but the rule only looks at neighbouring cells. The shortest ripples are amplified a little at every step. This does not show yet, but after a few dozen more steps they will swamp the pulse.
say.blown: S = {s}, greater than 1: within one step, information has to cross more than one cell, but the rule only looks at neighbouring cells. The error is amplified at every step, and after {n} steps the field is more than a thousand times its launch amplitude. The simulation has stopped; fire again.
:::

As the pulse moves right, E and c·B are equal in size and rise and fall together. At the metal wall (inside a conductor the electric field must be zero), the whole pulse bounces back: E flips over and B does not, so the pulse now moves left. For S ≤ 1 the total energy stays constant, changing by less than a few parts in a quadrillion.

At S = 1, the computed speed is exactly 1/√(μ₀ε₀). At S = 0.5 it is {=ch3.v05} metres per second, {=ch3.err05} slower. This difference is called **numerical dispersion**. It is a fault of the grid, not of the physics: the finer the cells, the smaller it gets. At S slightly above 1, say 1.05, the field grows past a thousand times its launch amplitude within {=ch3.blow} steps. This limit is called the **Courant condition**: within one step, a wave may not travel more than one cell. It is also the numerical shadow of the rule that nothing in a vacuum travels faster than light: the scheme lets only neighbouring cells affect each other, so a message cannot travel faster than one cell per step.

Back to the opening question. What crosses the vacuum? This pattern itself: a changing electric field at one place generates a magnetic field next to it, and the changing magnetic field generates an electric field further along. Nothing is transported, and nothing needs to "vibrate". People in the nineteenth century were uneasy about this and imagined an "ether" filling the universe to carry the wave; Michelson and Morley failed to detect it in 1887. In 1905 Einstein simply took "the speed of light is the same for everyone" as his starting point, and arrived at [[relativity]].

Limits of the model: this is one-dimensional, so the wave travels along a single line and does not weaken with distance (chapter 6). The grid has {=ch3.cells} cells of 1 millimetre each, and the pulse is about {=ch3.width} millimetres wide. Real three-dimensional FDTD staggers the six components of E and B across the edges and faces of a cubic cell; the rule is the same. {.take}

## Into a Material: Slower, and Partly Bounced Back {#ch4}

::: strings
toc: Into a Material: Slower, and Partly Bounced Back
:::

In transparent materials such as glass and water, the wave speed becomes c/n. When a wave passes from one material into another, part of it goes through and part bounces back; at normal incidence, the fraction of energy reflected is ((n₁ − n₂)/(n₁ + n₂))². {.law}

Stand in a lit room and look at the window at night, and you can see your own reflection. Glass is transparent, yet it still reflects about 4% of the light; a window pane has two faces, so the total is about 8%. Where does that 4% come from?

A material is made of charged things. An electric field entering it stretches the electron cloud in each atom slightly out of place, and the material produces an electric field of its own. The net effect is that setting up the same electric field in this region takes more charge: ε₀ is replaced by ε₀ times a number ε<sub>r</sub> greater than 1. The derivation of chapter 3 needs no change. The wave speed becomes 1/√(μ₀ε₀ε<sub>r</sub>) = c/n, where **n = √ε<sub>r</sub>** is called the **refractive index**. Glass is about 1.5 and water about 1.33. The frequency does not change (as many wave crests leave on the right each second as arrive on the left), so the wavelength shortens to 1/n.

At the boundary between two materials, the electric and magnetic fields must both be continuous (otherwise the loop law of chapter 2 fails for a small loop straddling the boundary). But on the two sides of the boundary, the same electric field comes with a different magnetic field: B = nE/c. The incident wave and the transmitted wave are only two, and two waves cannot balance both conditions; a third wave, travelling back, must be added. Writing down the two continuity conditions and solving them gives the amplitude reflection coefficient r = (n₁ − n₂)/(n₁ + n₂) and the transmission coefficient t = 2n₁/(n₁ + n₂). This is the form of the **Fresnel equations** at normal incidence.

::: diagram dg-if keys=dg.if
cap: Figure 5: A pulse hits glass of refractive index 1.5 head-on from vacuum. The amplitudes and widths are drawn from the formulas and the model: the reflected pulse comes back inverted, with an amplitude of {=dg.if.rabs} times the original; the transmitted amplitude is {=dg.if.t}, and its width shrinks to 1/1.5 of the original.
aria: Diagram: top row, the incident pulse travels right in vacuum; bottom row, after it hits the glass, a small inverted pulse travels left, and a slightly lower, narrower pulse travels right inside the glass
m1: Vacuum n = 1
m2: Glass n = 1.5
before: Before
after: After
inc: Inc. 1
ref: Reflected {=dg.if.r}
tr: Transmitted {=dg.if.t}
en: Energy: reflected {=dg.if.R}, transmitted {=dg.if.T}
:::

::: lab ch4-model
model.title: The same grid, with a different material in the middle
model.how: Still the program from chapter 3, but the ε of every cell in the right half is multiplied by n². Drag the refractive indices on either side to see how the pulse splits when it reaches the interface. In the readings, "simulated" is the energy counted on the grid and "formula" is the Fresnel equations.
ctl.n1: Refractive index on the left n₁
ctl.n2: Refractive index on the right n₂
btn.go: Fire again
btn.pause: Pause
btn.play: Resume
btn.step: Run 40 steps
read.r: Reflected energy (simulated)
read.rf: Reflected energy (formula)
read.t: Transmitted energy (simulated)
read.v: Wave speed on the right
cv.aria: Animation: an electric-field pulse travels from the material on the left, hits the material on the right, and splits into a reflected and a transmitted part
cv.n1: n₁ = {v}
cv.n2: n₂ = {v}
say.denser: From n = {n1} into the denser n = {n2}: {R} of the energy bounces back, and the reflected pulse is <em>inverted</em>. The transmitted pulse travels more slowly (at {v} of the speed of light), so it is squeezed narrower.
say.rarer: From n = {n1} out into the rarer n = {n2}: {R} of the energy bounces back, and this time the reflected pulse is <em>not</em> inverted. The transmitted pulse has a larger amplitude than the incident one, but the energy does not increase: at the same electric field, the side with the lower refractive index carries less energy.
say.same: Both sides have the same refractive index: to the wave there is no interface here, and nothing is reflected.
:::

Glass (n = 1.5) reflects ((1 − 1.5)/(1 + 1.5))² = {=ch4.Rglass}, and the simulation gives {=ch4.RglassSim}. Water reflects {=ch4.Rwater}, and diamond (n = 2.42) reflects {=ch4.Rdiamond}, which is why diamond sparkles. Going the other way, from glass out into air, also gives {=ch4.Rglass}: swapping n₁ and n₂ leaves the squared value unchanged, and only the sign of the reflected wave changes. Anti-reflection coatings on spectacles and lenses use this sign. A thin layer a quarter of a wavelength thick makes the two waves reflected from its front and back faces exactly out of phase, so they cancel each other ([[interference]]).

When light strikes an interface at an angle, the transmitted light bends; this is refraction, and [[reflection-refraction]] gives how much it bends. The refractive index on that page is a number measured in the lab. This chapter says where it comes from: n is how many times slower light travels in the material.

Limits of the model: only normal incidence is calculated here; at oblique incidence the reflected fraction also depends on polarisation (chapter 6). Real materials have an n that varies with frequency (glass has a larger n for blue light than for red, which is why a prism splits light into colours), and they also absorb, which chapter 7 deals with. In the model, n is a fixed real number. {.take}

## How a Wave Is Shaken Off: Accelerating Charges {#ch5}

::: strings
toc: How a Wave Is Shaken Off: Accelerating Charges
:::

A stationary charge has only an electrostatic field, and a charge moving at constant velocity carries its field along with it. Only an accelerating charge flings part of its field away, never to recover it; this is radiation. The radiated power is proportional to the square of the acceleration, and none of it goes in the direction of the acceleration. {.law}

Take a long rope, tied to something far away, and hold the other end in your hand. If the hand is still, the rope is straight. If the hand walks steadily to one side, the whole rope tilts but stays straight. Only when the hand gives a sudden jerk does a bend run off along the rope, and the more abrupt the jerk, the sharper the bend.

A charge's field lines are like this rope. When the charge moves, the nearby field lines point at the new position at once, while the distant ones do not yet know and still point at the old position. The news spreads outward at the speed of light, and between the lines that know and the lines that do not yet know there is a ring of kink. The field lines in the kink are sideways (perpendicular to the outward direction), and the kink expands outward at the speed of light. This ring of transverse field is the electromagnetic wave.

::: diagram dg-kink keys=dg.kink
cap: Figure 6: Top: a charge is suddenly moved a short distance. Distant field lines still point to the old position, nearby ones have caught up, and the kink between them runs outward at the speed of light. Bottom: the kink is strongest perpendicular to the motion and absent along it, so the radiated intensity varies with angle as sin²θ (schematic).
aria: Diagram: above, the field lines of a charge with a ring of kink between near and far lines; below, a short vertical antenna and its radiation pattern on either side, shaped like a cross-section of a doughnut
old: Far: still points to old position
neu: Near: has caught up
kink: Kink moves out at c: radiation
ax: Along the motion: none
side: Perpendicular: strongest
pat: Intensity ∝ sin²θ
:::

Working this picture out quantitatively gives the **Larmor formula**: a charge q moving with acceleration a radiates a total power P = q²a²/(6πε₀c³). Three things are worth noticing. It is proportional to the square of the acceleration. It does not depend on the velocity (when the velocity is much less than the speed of light). And the c³ in the denominator means that everyday accelerations radiate extremely weakly. In a direction at angle θ to the acceleration, the intensity is proportional to **sin²θ**: strongest at right angles, and zero directly along the acceleration.

This formula once caused a crisis. If electrons in an atom really orbited the nucleus like planets, they would be accelerating all the time (turning is acceleration), and they should radiate and lose energy continuously. By the Larmor formula, the electron in a hydrogen atom would fall into the nucleus within {=ch5.atom} seconds. Atoms plainly do not collapse this way. This is one of the facts classical physics cannot explain, and quantum mechanics took it over ([[quantum-basics]]). The Larmor formula itself is not wrong: antennas, X-ray tubes and synchrotron light sources all work by it.

An **antenna** is a conductor in which large numbers of electrons accelerate back and forth together. Cut a metal rod in the middle, connect it to an alternating current, and the electrons surge back and forth along the rod. The current on the rod is a standing wave ([[standing-wave]]): it must be zero at the two ends and can be largest in the middle. When the total length of the rod is exactly half a wavelength, the current distribution is a half sine, and this antenna is called the **half-wave dipole**, the basic reference point for every antenna.

::: lab ch5-model
model.title: Which directions a straight antenna radiates into
model.how: The antenna stands vertically in the middle of the figure. Drag its total length (in wavelengths) to see how the radiated intensity is distributed with direction. The figure is a vertical cross-section through the antenna; the true pattern is obtained by rotating it around the antenna. The readings come from numerically integrating over the whole sphere.
ctl.l: Total antenna length (in wavelengths λ)
read.d: Directivity (strongest direction ÷ average over all directions)
read.r: Radiation resistance at the feed point
read.w: Half-power beamwidth of the main lobe
read.lobes: Number of lobes (one side of the cross-section)
cv.aria: Polar plot: the radiated intensity of a vertical antenna as a function of direction
cv.axis: Antenna
say.short: A short antenna, only {L} wavelengths long: the pattern is a doughnut shaped like sin²θ, with directivity {D}. Its radiation resistance is only <em>{R}</em>, and most of the current just flows back and forth, so it is hard to push power out. This is why antennas in phones are difficult to make well.
say.half: Half-wave dipole: directivity <em>{D}</em> ({dBi} dBi), radiation resistance <em>{R}</em>, which matches the common 75-ohm coaxial cable well. The doughnut is slightly flatter than for the short antenna, with a half-power beamwidth of {w}.
say.mid: Length {L} wavelengths: the doughnut flattens as the length grows, with directivity {D} and a radiation resistance at the feed point of {R}.
say.full: Length exactly one wavelength: the feed point falls exactly where the current is zero, so in this simple model the resistance is infinite and power cannot be fed in. The pattern is still one lobe, with directivity {D}.
say.long: Length {L} wavelengths: parts of the antenna carry currents in opposite directions, their radiation interferes, and the pattern splits into {lobes} lobes. The main lobe has directivity {D} and points at an angle {th} from the antenna.
:::

The half-wave dipole has directivity {=ch5.Dhalf}, which in decibels is {=ch5.dBi} dBi (decibels relative to an isotropic antenna), and radiation resistance {=ch5.R} ohms. These two numbers are the first results in any antenna textbook; here they come from integrating the pattern over the whole sphere. FM broadcasting near 100 megahertz has a wavelength of 3 metres, so a half-wave dipole is {=ch5.fmHalf} metres long, which is the size of the telescopic antenna on an old radio and of rooftop antennas. Wi-Fi at 2.45 gigahertz needs only {=ch5.wifiHalf} centimetres. **The size of an antenna follows its wavelength**, a point that comes up again and again in the following chapters.

sin²θ is not only about antennas. Sunlight strikes air molecules, the electric field shakes the electrons in the molecules back and forth, and each electron becomes a tiny dipole antenna that radiates in all directions again. This is scattering. The a² in the Larmor formula makes the radiated power proportional to the fourth power of the frequency, so blue light is scattered far more strongly than red: [[why-the-sky-is-blue#ch2|Chapter 2 of “Why Is the Sky Blue?”]] carries on from here.

Limits of the model: the antenna is treated as infinitely thin, the current is assumed to be sinusoidal (a good approximation for a thin antenna), the effects of the ground and of nearby objects are not included, and the reactance at the feed point is not calculated. A real half-wave dipole is usually cut slightly shorter than half a wavelength (about 0.47–0.48 wavelengths) to cancel the reactance. {.take}

## What a Wave Carries: Energy, Momentum and Direction {#ch6}

::: strings
toc: What a Wave Carries: Energy, Momentum and Direction
:::

An electromagnetic wave carries energy: E × B/μ₀ flows through each square metre every second. It also carries momentum, so light falling on something gives it a push. Its electric field also has a direction, called its polarisation. Energy spreads over ever larger spheres, so the intensity weakens with the square of the distance. {.law}

Sunlight warms you. Between the surface of the Sun and your skin lie 150 million kilometres of vacuum, with nothing to hand the heat across. Where is this energy during the just over eight minutes it spends on the way? In the field. Chapter 1 said that electric and magnetic fields each store energy; now this bundle of field moves at the speed of light, and the energy flows along with it.

How much energy flows through each square metre per second is given by the **Poynting vector** S = E × B/μ₀. Its direction is perpendicular to both E and B, which is exactly the direction the wave travels. Averaged over a sinusoidal wave, the intensity is I = ε₀cE² (with E the root-mean-square value). Used in reverse, this formula gives the size of the electric field in sunlight from its intensity.

At one Earth–Sun distance (one astronomical unit), each square metre perpendicular to the sunlight receives {=ch6.I} watts; this is called the **solar constant**. The Sun radiates in all directions, so the same energy is spread over ever larger spheres, of area 4πr², and the intensity falls off as 1/r². This is the **inverse-square law**. It is not a property peculiar to electromagnetic waves; it is simply geometry.

Waves also carry **momentum**. When a beam of intensity I is completely absorbed, it presses on the surface with a pressure of I/c; if it is completely reflected by a mirror, the pressure doubles. This is called **radiation pressure**.

::: lab ch6-model
model.title: How far from the Sun, how strong the sunlight
model.how: Drag the distance from the Sun (on a logarithmic scale, in astronomical units, au). The intensity is worked out by spreading the power over a sphere. From the intensity, the sizes of the electric and magnetic fields in the sunlight are worked out, as is the push on a mirror.
ctl.d: Distance from the Sun
read.i: Intensity
read.e: Electric field (root mean square)
read.b: Magnetic field (peak)
read.p: Pressure on a black surface
read.f: Push on a 1 square kilometre reflecting sail
cv.aria: Graph: sunlight intensity falls off with the square of the distance from the Sun; on log-log axes it is a straight line
cv.x: Distance from the Sun (au, log) →
cv.y: Intensity (W/m², log)
cv.earth: Earth
cv.jupiter: Jupiter
cv.neptune: Neptune
cv.voyager: Voyager 1
say.earth: At Earth's distance, the intensity is {I}. The electric field in sunlight is about <em>{E}</em>, roughly what you would get by connecting a 1.5-volt battery across two metal plates 2 millimetres apart. The magnetic field is only {B}, less than a tenth of Earth's magnetic field.
say.near: At {d} au from the Sun: the intensity is <em>{k} times</em> that at Earth, and the electric field is {E}. Halving the distance makes the intensity 4 times as large, but the electric field only 2 times as large.
say.far: At {d} au from the Sun: the intensity is only <em>{k}</em> of that at Earth, and the electric field is {E}. On a log-log plot, the inverse-square law is a straight line with slope −2.
:::

At Earth, the root-mean-square electric field of sunlight is about {=ch6.Erms} volts per metre, and the peak magnetic field is about {=ch6.Bpk} microtesla. The radiation pressure is {=ch6.p} micropascals, about one twenty-billionth of atmospheric pressure. An ideal 1 square kilometre reflecting sail feels a force of {=ch6.sail} newtons, roughly the weight of a one-kilogram object. This force needs no fuel and never stops, which is why "solar sails" are a serious proposal for spaceflight. At Mars the intensity drops to {=ch6.mars} watts per square metre; at Jupiter, {=ch6.jup}; and at Voyager 1 there is only {=ch6.voy}, so the probe relies on its own radioisotope power source.

Last, direction. The electric field has a direction: in the plane perpendicular to the direction of travel, it can swing up and down, swing side to side, or swing somewhere in between. This orientation is called **polarisation**. Light from the Sun or a light bulb comes from countless atoms, each emitting independently, with random orientations; this is called unpolarised light. A **polariser** lets through only one orientation of the electric field. Unpolarised light loses half its intensity on passing through one, and what comes out swings only in that one direction.

Polarised light that meets a second polariser has its electric field resolved along the second polariser's axis, at angle θ. Only the cos θ component gets through, so the intensity is its square: **I = I₀cos²θ**. This is **Malus's law**. Place two polarisers at right angles (90°), and cos² is 0: not a trace of light gets through.

::: diagram dg-pol keys=dg.pol
cap: Figure 7: Three polarisers. The first and last are at right angles to each other and would block all the light; inserting one at an angle in the middle lets light out. The height of each bar is the intensity after each stage; the numbers are computed by the model.
aria: Diagram: a beam of light passes in turn through a vertical, a 45-degree and a horizontal polariser; the intensities are 100%, 50%, 25% and 12.5%
p1: Vertical
p2: At 45°
p3: Horizontal
i0: {=dg.pol.i0}
i1: {=dg.pol.i1}
i2: {=dg.pol.i2}
i3: {=dg.pol.i3}
note: Without the middle one, the end is 0
:::

::: lab ch6-pol keys=ch6.pol
model.title: Insert a few more between two perpendicular polarisers
model.how: The first is vertical and the last is horizontal. Choose how many to insert between them; when only one is inserted, you can drag its angle. See how much light is left at the end.
ctl.k: How many to insert between them
ctl.th: Angle of the middle one
read.out: Light that comes out at the end
read.steps: Left after each polariser
cv.aria: Diagram: the direction of each polariser and the light intensity left after each one
cv.in: Incident
say.zero: Nothing inserted in between: the two perpendicular polarisers block all the light, and what comes out is <em>0</em>.
say.one: The middle one turned to {th}: output <em>{out}</em>. The second polariser turns the polarisation to {th}, which has a horizontal component, so the third one no longer blocks it cleanly. At 45° the output is largest, at {max}.
say.oneBlock: The middle one turned to {th}, exactly parallel or perpendicular to one of its neighbours: it does not turn the polarisation to a new angle, so the output is still <em>0</em>.
say.many: {k} inserted in between, each turning {step} more than the one before: output <em>{out}</em>. The more there are, the less each one turns, and the smaller the loss. With infinitely many, the output approaches 50%: it loses only the half that the first polariser blocks.
:::

The three-polariser result is often treated as a paradox: add one more thing to block light, and more light appears. In fact a polariser is not a sieve. It projects the electric field onto its own direction, and the light that comes out has a new direction. With 3 inserted, the output is {=ch6.p3}; with 9, {=ch6.p9}. Each pixel of an LCD is two perpendicular polarisers with a layer of liquid crystal between them that turns the polarisation direction. Applying a voltage stops the turning, and the pixel goes dark.

Limits of the model: the Sun is treated as a point that radiates uniformly in all directions, using the nominal luminosity set by the International Astronomical Union. The actual solar constant varies by about a thousandth with solar activity, and at the ground the atmosphere takes some away (chapter 8). The polarisers are treated as ideal: a real polariser also absorbs part of the light in the direction it transmits. {.take}

## One Spectrum, from Radio to Gamma Rays {#ch7}

::: strings
toc: One Spectrum, from Radio to Gamma Rays
:::

Radio, microwaves, infrared, visible light, ultraviolet, X-rays and gamma rays are the same kind of wave, differing only in frequency. The frequency sets the wavelength (λ = c/f) and the size of each packet of energy (E = hf), and these two determine what happens when the wave meets matter. {.law}

A radio, a microwave oven, an electric heater, a light bulb, a UV sterilising lamp and a hospital X-ray machine look like six completely different things. From the equations of chapter 3, they emit the same kind of wave: nowhere in the equations is a frequency specified, and anything from a few thousand cycles per second to 10²² cycles per second is allowed.

Changing the frequency changes two things. The first is the **wavelength** λ = c/f: a wave interacts most strongly with things of similar size. Antennas are like this (chapter 5), and so are molecules and atoms. The second is the size of each packet of energy. Electromagnetic energy is exchanged with matter in packets; each packet (a **photon**) carries **E = hf**, where h is Planck's constant. [[photoelectric-effect]] describes how this was discovered. Whether matter can be changed depends on whether a single photon is energetic enough, not on how bright the light is.

::: diagram dg-spec keys=dg.spec
cap: Figure 8: The electromagnetic spectrum. The vertical bar on the left is drawn on a logarithmic frequency scale: each step is ten times the frequency of the one before, and visible light occupies only a narrow band. On the right is the main thing waves in each band do in matter. The boundaries between bands are conventions, not physical breaks.
aria: Diagram: a vertical logarithmic frequency axis, from 10⁴ hertz to 10²² hertz, divided into seven bands (radio, microwave, infrared, visible, ultraviolet, X-ray, gamma), each beside its main effect on matter
radio: Radio
radio.d: Shakes electrons in wires
micro: Microwave
micro.d: Turns polar molecules round
ir: Infrared
ir.d: Atoms in molecules vibrate
vis: Visible
vis.d: Moves electrons to new orbit
uv: Ultraviolet
uv.d: Breaks bonds; higher, ionises
xray: X-ray
xray.d: Knocks out inner electrons
gamma: Gamma
gamma.d: Can change atomic nuclei
:::

::: lab ch7-model
model.title: Drag across the whole spectrum
model.how: Drag the frequency (on a logarithmic scale spanning 18 orders of magnitude), or click an example. See how long the wavelength is, how large one photon is, and whether one photon is big or small compared with kT, the typical energy of molecular thermal motion at room temperature.
ctl.f: Frequency
ex.label: Examples
ex.am: AM radio
ex.fm: FM radio
ex.oven: Microwave oven, Wi-Fi
ex.mm: 5G millimetre wave
ex.body: Infrared from the human body
ex.green: Green light
ex.uvc: UV-C sterilising lamp
ex.xray: Medical X-ray
ex.gamma: Gamma rays
read.lam: Wavelength
read.size: Wavelength equal to
read.e: Energy of one photon
read.kt: Photon energy ÷ kT at room temperature
cv.aria: Diagram: the seven bands on a logarithmic frequency axis, and the position of the current frequency
cv.radio: Radio
cv.micro: Microwave
cv.ir: Infrared
cv.vis: Visible
cv.uv: Ultraviolet
cv.xray: X-ray
cv.gamma: Gamma
size.mountain: A mountain
size.building: A building
size.person: A person
size.hand: A hand
size.fingernail: A fingernail
size.grain: A grain of sand
size.hair: The width of a hair
size.cell: A cell
size.virus: A virus
size.molecule: A molecule
size.atom: An atom
size.nucleus: Smaller than an atom
say.radio: Radio waves. The energy of one photon is only {kt} times the thermal energy kT at room temperature, which is negligible for a single molecule. The effect works through enormous numbers of photons acting together: they push electrons in a conductor back and forth, which induces a current in an antenna. The wavelength is long enough to go around mountains and buildings.
say.micro: Microwaves. The photon energy is {kt} times the thermal energy at room temperature, far too little to break any chemical bond. Its electric field can make polar molecules such as water rotate back and forth; the rotation is held back by neighbouring molecules and turns into heat. The wavelength runs from centimetres to decimetres, so antennas can be small and highly directional.
say.ir: Infrared. The photon energy is {kt} times the thermal energy at room temperature. This band covers the frequencies at which atoms in a molecule vibrate against each other, so almost all molecules absorb it, and everything at room temperature also emits it. Between 0.1 and 10 terahertz, electronic devices find the frequencies too fast and optical devices find them too slow; this range is called the "terahertz gap".
say.vis: Visible light. The photon energy is {ev}, which is {kt} times the thermal energy at room temperature: enough to lift an electron in a molecule to another orbital, but usually not enough to knock it out. The molecules in the retina and in chlorophyll work this way. The Sun's radiation is strongest in this band, and the atmosphere is also transparent here.
say.uv: Ultraviolet (below the ionisation threshold). The photon energy is {ev}, enough to break some chemical bonds, including those in DNA, so it can cause sunburn and cancer, and it also kills microbes. It has not reached the ionisation threshold of about 10 electronvolts.
say.uvIon: Extreme ultraviolet. The photon energy is {ev}, above the threshold of about 10 electronvolts: a single photon can knock an electron out of an atom or molecule. Everything from here up is called <em>ionising radiation</em>. The air absorbs it itself, so it does not travel far.
say.xray: X-rays, ionising radiation. The photon energy is {ev}, {kt} times the thermal energy at room temperature, enough to knock out electrons from the innermost shells of atoms. The wavelength is about the size of an atom, so X-rays pass through soft tissue made of light elements, and are blocked more strongly by bone containing calcium.
say.gamma: Gamma rays, ionising radiation. The photon energy is {ev}, from changes inside atomic nuclei. The wavelength is smaller than an atom, so the rays travel a long way through matter before hitting anything, which makes them hard to shield.
:::

Drag the slider from left to right, and the photon energy rises from a billionth of room-temperature thermal energy to more than a billion times it. In the middle lies an important threshold: about **10 electronvolts**, corresponding to a wavelength of about {=ch7.ionLam} nanometres (at the high-frequency end of ultraviolet). Above it, a single photon can knock an electron out of a molecule, directly breaking chemical bonds and DNA; this is called **ionising radiation**. Below it, however strong the light, no single photon can do this, and matter that absorbs it simply gets warmer (visible and near-ultraviolet light can still drive specific chemical reactions). This threshold is quantum: it does not depend on the total power, only on how big one packet is.

Here are two places where things are often said wrongly.

**Microwave ovens.** A common claim is that "2.45 gigahertz is the resonant frequency of water molecules". It is not. Water molecules are polar, with one end slightly positive and the other slightly negative. The electric field reverses direction again and again, and the molecules turn back and forth with it, but they are held back by their neighbours and always lag behind; the work the field does on them becomes heat. This is called **dielectric relaxation**. It has no sharp resonance peak; it is a broad absorption band, described by the **Debye model**. Liquid water at 25 °C has a relaxation time of about 8.27 picoseconds, and its strongest absorption is near {=ch7.fPeak} gigahertz, almost 8 times the frequency of a microwave oven.

::: lab ch7-water keys=ch7.w
model.title: Water's absorption of microwaves: no resonance peak
model.how: Drag the frequency. The gold line is the real part of water's permittivity (how well the water molecules keep up with the field), and the cyan line is the imaginary part (the loss, the part that turns into heat). See where 2.45 GHz sits on this curve, and how deep microwaves can penetrate into water.
ctl.f: Frequency
read.e1: Real part of permittivity ε′
read.e2: Loss ε″
read.dp: Penetration depth (power falls to 37%)
read.h: Heating at the same field, relative to 2.45 GHz
cv.aria: Graph: the real and imaginary parts of water's permittivity against frequency; the imaginary part has a broad peak near 19 GHz
cv.x: Frequency (GHz, log) →
cv.e1: ε′
cv.e2: ε″ (loss)
cv.oven: 2.45 GHz
say.low: {f}: the water molecules keep up with the field completely and lose almost nothing. Microwaves penetrate water to a depth of {dp}; most pass straight through, so heating is slow.
say.oven: {f}: the loss ε″ is only {e2}, far from its peak. Because the absorption is not very strong, microwaves can penetrate to a depth of <em>{dp}</em> and heat food from the inside as well as the outside.
say.peak: {f}: close to where absorption is strongest; for the same field, heating is {h} times that at 2.45 GHz. But microwaves penetrate only <em>{dp}</em>, so all the energy goes to the thin outer layer.
say.high: {f}: the water molecules can no longer keep up with the field, and ε′ has dropped to {e1}. The penetration depth is only {dp}.
:::

At 2.45 gigahertz the loss ε″ of water is about {=ch7.e2oven}, and at the peak it is {=ch7.e2peak}. The penetration depth of microwaves in water is about {=ch7.depth} centimetres. If the frequency were tuned to {=ch7.fPeak} gigahertz, where absorption is strongest, the penetration depth would fall to only {=ch7.depthPeak} millimetres, so the food surface would char while the inside stayed cold. The choice of 2.45 gigahertz is partly because this depth is suitable, and partly because this band is allocated internationally for unlicensed use by industrial, scientific and medical equipment, which is why Wi-Fi and Bluetooth crowd into it. A microwave oven's photon energy is {=ch7.ovenEv} electronvolts, about {=ch7.ionRatio} times below the ionisation threshold: it heats food, but does not make the food radioactive or break chemical bonds in its molecules.

**Infrared and greenhouse gases.** Radiation from objects at room temperature is concentrated in the infrared: the surface of the human body is about 310 kelvin, and its strongest radiation is at a wavelength near {=ch7.body} micrometres ([[blackbody-radiation]]). The ground is the same. The vibration frequencies of carbon dioxide and water-vapour molecules fall right in this band, so they let sunlight through but block the infrared that the ground radiates outward. [[why-the-planet-warms#ch2|Chapter 2 of “A Little CO₂ · Why the Planet Warms”]] carries on from here.

**Phone and base-station radiation.** Phones use frequencies from about 0.7 to several tens of gigahertz. That is microwave radiation, non-ionising: the energy of a single photon is more than four orders of magnitude below the ionisation threshold. The only effect on the human body that is established for this kind of electromagnetic wave is heating of tissue. The guidelines of the International Commission on Non-Ionizing Radiation Protection (ICNIRP), 2020, set their limits on the basis of not letting tissue heat appreciably. For the general public, the whole-body average absorption must not exceed {=ch7.sarW} watts per kilogram, and local absorption in the head and trunk (averaged over 10 grams of tissue) must not exceed {=ch7.sarI} watts per kilogram. The limit of the US Federal Communications Commission is that the average over 1 gram of tissue must not exceed {=ch7.sarF} watts per kilogram.
Whether long-term use below these limits can cause cancer is a question on which several agencies have taken positions. They are reported here as they state them. The International Agency for Research on Cancer (IARC), part of the World Health Organization, classified radiofrequency electromagnetic fields in 2011 as "possibly carcinogenic to humans" (group 2B), on the basis of limited evidence from a few epidemiological studies, which found a slightly raised risk of brain tumours among heavy users. This classification has not been changed since. A systematic review commissioned by the World Health Organization (Karipidis et al., 2024) pooled the more numerous studies published since, and concluded that mobile phone use is probably not associated with brain tumours or other head tumours (certainty of evidence: moderate); some researchers have criticised the methods of this review. ICNIRP's statement is that there is no known physical mechanism by which exposure at such low levels could cause cancer, and that animal and cell studies have not confirmed the epidemiological findings. The World Health Organization's own full assessment report had still not been published as of November 2026. This paragraph only reports these positions; it is not health advice.

Limits of the model: the water uses the single-relaxation-time Debye model with parameters for 25 °C; at higher temperature the relaxation becomes faster and the absorption peak moves to higher frequencies. Salt in food adds loss at the low-frequency end, and ice absorbs microwaves very little (which is why defrosting is uneven). The ionisation threshold of "about 10 electronvolts" is a conventional boundary; different molecules actually need different amounts of energy. {.take}

## The Atmosphere Opens Only a Few Windows {#ch8}

::: strings
toc: The Atmosphere Opens Only a Few Windows
:::

Air is opaque to electromagnetic waves at most frequencies. Oxygen and water-vapour molecules each absorb strongly at certain specific frequencies, leaving a few "windows" between them. Ground-based wireless communication, satellite communication and astronomical observation all use frequencies inside the windows. {.law}

Garage-door remotes, satellite-TV dishes, weather radar and radio telescopes all work at different frequencies, but one picture governs them all: can a wave at this frequency get through the air?

Looking at the whole spectrum, the atmosphere has only two large windows. One is visible light, with a little near-infrared and near-ultraviolet on either side; the other is radio waves with wavelengths from about 1 centimetre to a dozen or so metres. The reasons the rest is blocked differ.

::: diagram dg-win keys=dg.win
cap: Figure 9: Seen from space, whether Earth's atmosphere is transparent or opaque to each band of electromagnetic waves (schematic: the boundaries are approximate, and the narrow windows and absorption bands inside the infrared are not drawn).
aria: Diagram: the spectrum from top to bottom in five bands, labelled opaque, transparent, mostly opaque, transparent and reflected, each with its reason
g: Gamma, X-ray, far UV
g.d: Opaque: N₂, O₂, O₃ absorb
v: Visible and near-infrared
v.d: Transparent: optical window
i: Infrared to submillimetre
i.d: Mostly opaque: H₂O, CO₂
r: λ ≈ 1 cm to 12 m
r.d: Transparent: the radio window
l: Longer radio waves
l.d: Reflected by ionosphere
:::

The high-frequency end of the radio window, the millimetre waves, is where mobile communication is climbing. The detail at this end can be worked out quantitatively. Oxygen molecules have a small magnetic moment, and near 60 gigahertz they have several dozen closely spaced spectral lines, plus one at 118.75 gigahertz; water molecules have lines at 22.235, 183.31, 325 gigahertz and elsewhere. ITU-R Recommendation P.676 gives the positions, strengths and widths of these lines, and the formula for adding them up. The model below implements that formula.

::: lab ch8-model
model.title: Air absorption from 1 to 1000 gigahertz
model.how: Drag the frequency and the water-vapour content of the air, and choose a path: along the ground for 1 km, or straight up through the whole atmosphere. The gold line is the total absorption; the cyan line is the part due to oxygen alone. On the logarithmic vertical axis, each major division is a factor of 10 in the absorption in decibels.
ctl.f: Frequency
ctl.h: Water-vapour density
ctl.path: Path
path.ground: Along the ground, 1 km
path.zenith: Straight up through the atmosphere
read.a: Absorption
read.tr: Power remaining
read.w: Share due to water vapour
read.half: Distance over which power halves
cv.aria: Graph: atmospheric absorption against frequency, with sharp peaks near 22, 60, 119, 183 and 325 GHz
cv.x: Frequency (GHz, log) →
cv.yg: Absorption (dB/km, log)
cv.yz: Total absorption straight up (dB, log)
cv.tot: Oxygen + water vapour
cv.o2: Oxygen only
say.clearG: {f}: inside a window. Along the ground for 1 km, only <em>{a}</em> is lost, and {tr} of the power remains.
say.clearZ: {f}: inside a window. Straight up through the whole atmosphere, only <em>{a}</em> is lost, and {tr} of the power arrives. Satellite communication and looking at the stars both have to use frequencies like this.
say.o2G: {f}: on an oxygen absorption band. Along the ground for 1 km, <em>{a}</em> is lost, leaving {tr}. Oxygen makes up one-fifth of the air, and this absorption does not depend on the weather; it cannot be avoided.
say.o2Z: {f}: on an oxygen absorption band. Straight up through the whole atmosphere, <em>{a}</em> is lost, leaving {tr}. Seen from the ground, the sky is opaque at this frequency.
say.h2oG: {f}: the absorption here comes mainly from water vapour (which accounts for {w}). Along the ground for 1 km, <em>{a}</em> is lost, leaving {tr}. Turn the water-vapour density down and the absorption falls markedly.
say.h2oZ: {f}: the absorption here comes mainly from water vapour (which accounts for {w}). Straight up through the whole atmosphere, <em>{a}</em> is lost, leaving {tr}. Try turning the water-vapour density down: this is why submillimetre telescopes are built on high plateaus and in deserts.
:::

Using standard sea-level air (15 °C, water vapour 7.5 grams per cubic metre): at 2.45 gigahertz only {=ch8.g2} decibels are lost per kilometre, which is almost nothing; at 28 gigahertz it is {=ch8.g28}; at 60 gigahertz it leaps to {=ch8.g60} decibels per kilometre, and after 1 km only {=ch8.t60} remains. A 60-gigahertz wave going straight up through the whole atmosphere loses {=ch8.z60} decibels, which amounts to total opacity. This band therefore cannot be used for satellite communication. It does suit high-speed short-range links within a single room, or secure communication between satellites outside the atmosphere: the signal does not travel far, so there is no fear of it being heard by people far away, and the same frequency can be reused a street away.

Between the absorption peaks lie windows, near 35, 94, 140 and 220 gigahertz. At 94 gigahertz the loss is {=ch8.g94} decibels per kilometre, at 140 gigahertz {=ch8.g140}, and at 300 gigahertz it is already {=ch8.g300}. Higher up, the floor of each window rises, and this is mainly due to water vapour. At 10 gigahertz, a path straight up through the whole atmosphere loses only {=ch8.z10} decibels ({=ch8.z10pct} of the power arrives), which is why satellite TV and satellite navigation use frequencies from a few to a dozen or so gigahertz.

Limits of the model: only absorption by oxygen and water vapour in clear skies is calculated here. The effect of rain is often much larger above 10 gigahertz (in heavy rain, at 30 gigahertz it can add several decibels per kilometre; this is only an order of magnitude), and clouds, fog, buildings and foliage are not included. For the vertical path, the model uses ITU's global annual mean reference atmosphere, and water vapour is taken to fall to 37% for each 2 kilometres of height; real air varies a great deal with place and season. The formulas and line tables come from ITU-R P.676-13 and apply up to 1000 gigahertz. {.take}

## Putting Information On, and Working Out How Far It Goes {#ch9}

::: strings
toc: Putting Information On, and Working Out How Far It Goes
:::

A pure sine wave carries no information. To carry information, you must change its amplitude, frequency or phase; this is called modulation, and the faster you change it, the wider the band it occupies. How much power the receiver gets is set by the transmitted power, the gains of the two antennas and (λ/4πd)². {.law}

Someone whistling a single unchanging note tells you nothing beyond "he is whistling". He has to vary the pitch or loudness before it becomes a tune. Radio is the same: a sine wave of fixed frequency and fixed amplitude is called a **carrier**, and it says nothing.

There are three basic ways to put information on a carrier:

::: diagram dg-mod keys=dg.mod
cap: Figure 10: Three kinds of modulation of the same carrier. The AM and FM waveforms are computed by the model. Each point in the constellation diagram is one combination of amplitude and phase; there are 16 points, so each point carries 4 bits.
aria: Diagram: at the top, an AM waveform whose amplitude rises and falls with the information; in the middle, an FM waveform whose spacing of crests changes with the information; below, a constellation of sixteen points in a four-by-four grid
am: AM: amplitude follows the information
fm: FM: spacing follows the information
qam: 16-QAM: amplitude and phase together
i: In-phase
q: Quadrature
bits: 16 points, 4 bits each
:::

**Amplitude modulation** (AM) makes the amplitude of the carrier rise and fall with the information. **Frequency modulation** (FM) keeps the amplitude constant and makes the frequency vary with the information. The most widely used scheme in digital communication is **quadrature amplitude modulation** (QAM): amplitude and phase change together, and each combination is treated as one symbol. 16-QAM has 16 combinations, so each symbol carries 4 bits; 4096-QAM, used by Wi-Fi 7, carries {=ch9.bits4096} bits per symbol. The more densely the points are packed, the more bits each symbol carries, and the easier it is for noise to push a point into a neighbour's position. How densely they can be packed is set by the signal-to-noise ratio. That is the business of Shannon's theorem, which another long essay, “How Much Information Can One Wire Really Carry”, covers in detail.

Modulation has one unavoidable consequence: it **occupies bandwidth**. See the model below.

::: lab ch9-model
model.title: Modulate a carrier, and look at its spectrum
model.how: The carrier is 256 kilohertz. Choose AM or FM, and drag the frequency of the information and the depth of modulation. The top is the waveform; the bottom is the spectrum computed with the discrete Fourier transform, showing the new frequencies that appear on either side of the carrier.
ctl.type: Modulation type
type.am: Amplitude (AM)
type.fm: Frequency (FM)
ctl.fm: Frequency of the information
ctl.idxAm: Depth of modulation m
ctl.idxFm: Modulation index β
read.car: Height of the carrier line
read.bw: Bandwidth containing 98% of the power
read.rule: Bandwidth given by the formula
read.side: Power in the sidebands
cv.wave.aria: Waveform graph: the modulated carrier and its envelope
cv.spec.aria: Spectrum graph: spectral lines on either side of the carrier frequency
cv.t: Time →
cv.f: Frequency →
cv.fc: Carrier
say.am: Amplitude modulation, depth {m}: the spectrum gains only two lines, each {fm} from the carrier, so the total bandwidth is <em>{bw}</em>, exactly twice the frequency of the information. The carrier line is unchanged. It carries no information, yet it holds {car} of the power; all the information is in the two sidebands, which hold {side}.
say.amOver: Depth {m} is greater than 1: at the troughs of the envelope the wave goes negative, and the information the receiver recovers from the envelope is distorted. This is called overmodulation.
say.fmNarrow: Modulation index β = {beta}, very small: almost all the power is still in the carrier, and the information is in a pair of small sidebands, each {fm} away. In this case FM occupies the same bandwidth as AM.
say.fm: Modulation index β = {beta}: a series of equally spaced lines grows out on either side of the carrier, spaced {fm} apart, with heights given by the Bessel function Jₙ(β). The bandwidth containing 98% of the power is <em>{bw}</em>; Carson's rule, 2(β + 1)f, gives {rule}.
say.fmNull: Modulation index β = {beta}: the carrier line has almost <em>vanished</em> (height {car}), and all the power is in the sidebands. β = 2.405 is the first zero of the Bessel function J₀; FM stations use this "vanished carrier" to calibrate their frequency deviation.
:::

In an AM spectrum, one line appears on each side of the carrier, at a distance equal to the frequency of the information: a sound up to 5 kilohertz needs 10 kilohertz. This is not a shortcoming of technology; it is mathematics. A sine wave whose amplitude varies with time is itself equal to the sum of three sine waves at slightly different frequencies ([[fourier]]). FM takes up more bandwidth. FM broadcasting has a maximum frequency deviation of 75 kilohertz and audio up to 15 kilohertz; by Carson's rule it needs {=ch9.fmBw} kilohertz, so stations are usually spaced 200 kilohertz apart. What it buys is resistance to interference: noise mainly changes amplitude, and an FM receiver ignores amplitude.

The conclusion is general: **the more information sent per second, the wider the band it occupies**. This explains why communication keeps moving to higher frequencies. The bandwidth is usually only a few percent of the carrier frequency, which makes the hardware practical. A signal 100 megahertz wide cannot fit on a 1-megahertz medium-wave carrier, but it fits at 28 gigahertz in the millimetre waves. The spectrum is finite, and the usable part is only the few windows of the atmosphere (chapter 8), so it is auctioned and divided up by country and by service, band by band.

How much is left of the signal once it has been sent? Combine chapters 5 and 6. If the transmitted power P<sub>t</sub> is spread evenly over a sphere of radius d, each square metre gets P<sub>t</sub>/4πd². The transmitting antenna focuses it in one direction, multiplying by the gain G<sub>t</sub>. The area the receiving antenna can capture is G<sub>r</sub>λ²/4π. Multiply the three together:

::: html eq-friis keys=ch9.eq
friis: P<sub>r</sub> = P<sub>t</sub> · G<sub>t</sub> · G<sub>r</sub> · (λ / 4πd)²
friis.w: Received power = transmitted power × transmit antenna gain × receive antenna gain × a factor that depends only on how many wavelengths the distance is. This is the Friis transmission equation.
:::

In engineering practice each term is converted to a logarithm, and the decibels are added ([[exponents-logarithms]]): 10 decibels is a factor of 10, and 3 decibels is a factor of 2. The last term is called the **free-space path loss**; each doubling of the distance costs {=ch9.dbl} decibels more. A table that adds and subtracts such terms one by one is called a **link budget**.

::: lab ch9-link keys=ch9.link
model.title: Budgets for four links
model.how: Choose a link, then drag the distance (each step is twice or half the previous). The bars from left to right are: transmitted power, plus the gain of the transmitting antenna, minus the path loss, plus the gain of the receiving antenna. The red line is the thermal noise within the receiver's bandwidth.
ctl.which: Link
which.wifi: Wi-Fi
which.cell: Phone to tower
which.gps: GPS satellite
which.voyager: Voyager 1
ctl.d: Distance, as a multiple of the typical value
read.d: Distance
read.fs: Path loss
read.pr: Received power
read.snr: Signal-to-noise ratio
read.cap: Shannon limit
cv.aria: Bar chart: transmitted power, effective isotropic radiated power, power arriving at the receiving antenna, received power, and the noise floor
cv.pt: Transmitted
cv.eirp: Plus transmit antenna
cv.path: Minus path loss
cv.pr: Plus receive antenna
cv.noise: Noise
say.wifi: Wi-Fi, {d}: the router sends out 0.1 watts, and the phone receives <em>{pr}</em> ({dbm}), with a path loss of {fs}. The signal is {snr} above the noise, enough for the densest constellation. Two more walls, each costing a few to a dozen or so decibels, and it has to switch to a sparser constellation; the speed falls with it.
say.cell: Phone to tower, {d}: the phone sends out 0.2 watts, and the tower receives <em>{pr}</em>, with a signal-to-noise ratio of {snr}. The tower's 17-decibel antenna gain is equivalent to multiplying the phone's power by 50.
say.gps: GPS, {d}: the satellite sends out 25 watts, and only <em>{pr}</em> is left by the time it reaches the phone, below the noise in the receiver's bandwidth (signal-to-noise ratio {snr}). The signal lies beneath the noise. The receiver knows each satellite's pseudorandom code, and it lines up and adds the 1023 chips within 1 millisecond to pull the signal out.
say.voyager: Voyager 1, {d}: a transmitter of {pt} watts and a 3.7-metre antenna, with a path loss of <em>{fs}</em>. A 70-metre antenna on the ground receives <em>{pr}</em>. Cooling the receiver to about 20 kelvin and narrowing the bandwidth to 160 bits per second leaves an energy-per-bit to noise ratio of {ebn0}, just enough to decode.
:::

The path loss for Wi-Fi is {=ch9.wifiFs} decibels, for GPS {=ch9.gpsFs}, and for Voyager 1 {=ch9.voyFs}. Decibels add: the extra {=ch9.voyMinusWifi} decibels Voyager loses compared with Wi-Fi mean a power ratio of nearly 10 to the power 26. How is this gap made up? The two large antennas together provide {=ch9.voyGain} decibels (the 3.7-metre one {=ch9.voyGt}, the 70-metre one {=ch9.voyGr}); cooling the receiver lowers the noise; and the data rate is cut from Wi-Fi's hundreds of millions of bits per second down to 160 bits per second. The power arriving at Earth is {=ch9.voyPr} watts. The GPS example goes on to positioning in [[inside-a-phone#gps|“Ten Ideas Inside One Phone”]]; how a signal-to-noise ratio turns into a bit rate is covered in [[inside-a-phone#radio|the “Path Loss and Shannon Capacity” section of the same essay]].

Limits of the model: the Friis equation covers only free space, with no obstruction at all between the two antennas. Links on the ground also suffer ground reflection, diffraction, multipath and wall losses, and the actual loss is often several tens of decibels more than in free space; engineers correct for this with empirical models. In the four links, the antenna efficiencies, receiver noise and everyday distances are typical values chosen for the model, not measurements of any particular device; the transmitter powers, antennas and frequencies for GPS and Voyager are taken from public sources. {.take}

## Holding Light Inside a Glass Thread {#ch10}

::: strings
toc: Holding Light Inside a Glass Thread
:::

When light travels obliquely from a material of high refractive index into one of lower index, at a steep enough angle none of it gets through: this is total internal reflection. An optical fibre uses it to hold light inside a glass thread. Light in the fibre loses half its power every 17 kilometres, provided the wavelength is right: 1550 nanometres. {.law}

The inverse-square law is the fate of radio: energy spreads out in all directions, and doubling the distance leaves a quarter of the power. The only way to escape it is to stop the wave from spreading, by giving it a pipe. For light, that pipe is a glass thread thinner than a hair.

Chapter 4 calculated only normal incidence. When light goes obliquely from glass into air, the refraction angle is larger than the incidence angle. Once the incidence angle reaches a certain value, the refraction angle reaches 90°; beyond that there is no transmitted light at all, and all the energy is reflected back. This angle is called the **critical angle**, sinθ<sub>c</sub> = n₂/n₁. It is a strict 100%, better than any silvered mirror.

::: diagram dg-fibre keys=dg.fib
cap: Figure 11: Longitudinal section of an optical fibre. The core has a refractive index slightly higher than the cladding (here 0.36% higher). Light travelling near the axis is totally reflected at the boundary and bounces along; light entering at too steep an angle leaks into the cladding. The angles in the figure are exaggerated to make them visible: the real critical angle is {=dg.fib.crit}°, and the rays are almost parallel to the axis (schematic, not to scale).
aria: Diagram: a longitudinal section of an optical fibre, with a core in the middle and cladding above and below; one ray is totally reflected inside the core and travels right, and a steeper ray leaks out of the core
core: Core n₁ = {=dg.fib.n1}
clad: Cladding n₂ = {=dg.fib.n2}
ray: Total reflection: bounces along
leak: Too steep: leaks out
cone: Acceptance cone: ±{=dg.fib.acc}°
:::

The single-mode fibre used for communication has a core only about 9 micrometres across, with a refractive index of {=dg.fib.n1}, and the cladding is only 0.36% lower. With such a small difference, the critical angle is {=ch10.crit}°, so only light within less than 5° of the axis is kept. Seen from outside the end face, the half-angle of the cone of light that can enter and be kept is only {=ch10.acc}°. Light travels in the glass at {=ch10.vfrac} of its speed in vacuum, and needs {=ch10.us} microseconds to cover each kilometre.

Once the light is held, the remaining question is how much the glass itself absorbs. In 1966 Charles Kao pointed out that the losses of thousands of decibels per kilometre in the glass of the time were caused by impurities, and that pure quartz glass could in principle reach below 20 decibels per kilometre, enough for communication. In 1970 Corning achieved it. Today only two unavoidable sources of loss remain:

::: lab ch10-model
model.title: How the loss of a quartz fibre changes with wavelength
model.how: Drag the wavelength and the length of the fibre. The cyan line is Rayleigh scattering (density fluctuations frozen into the glass scatter light away); the red line is infrared absorption (vibrations of the silicon–oxygen bonds); the gold line is their sum. The vertical axis is logarithmic.
ctl.lam: Wavelength
ctl.km: Fibre length
read.a: Loss per kilometre
read.tot: Loss over the whole length
read.fr: Optical power remaining
read.half: Distance over which power halves
cv.aria: Graph: fibre loss against wavelength, lowest near 1550 nm
cv.x: Wavelength (nm) →
cv.y: Loss (dB/km, log)
cv.ray: Rayleigh scattering
cv.ir: Infrared absorption
cv.tot: Total
say.ok: {lam}: <em>{a}</em> per kilometre; after {km}, {fr} remains (loss {tot}). The receiver can read it directly, or amplify it once and carry on.
say.amp: {lam}: {a} per kilometre; after {km}, only <em>{fr}</em> remains (loss {tot}). It must be amplified along the way. Transoceanic cables near 1550 nanometres place an optical amplifier every several tens to about a hundred kilometres.
say.dead: {lam}: {a} per kilometre, and the total loss over {km} is <em>{tot}</em>. At the far end, you cannot count on even one photon.
:::

**Rayleigh scattering** is the same mechanism that makes the sky blue (chapter 5): when the glass froze, tiny density fluctuations were locked into it, far smaller than the wavelength, and the strength of scattering is proportional to 1/λ⁴, so it weakens as the wavelength grows. **Infrared absorption** comes from the vibrations of the chemical bonds between silicon and oxygen. Its peak is near 9 micrometres, but its tail reaches beyond 1.6 micrometres, and it grows stronger as the wavelength increases. One falls and the other rises, and where they cross is the lowest point: the model puts it at {=ch10.minLam} nanometres, at {=ch10.a1550} decibels per kilometre. This is why long-distance optical fibre around the world uses wavelengths near **1550 nanometres**. At 850 nanometres the loss is {=ch10.a850}, and at 1310 nanometres it is {=ch10.a1310}.

{=ch10.a1550} decibels per kilometre means that power halves every {=ch10.half} kilometres. After 80 kilometres {=ch10.fr80} remains ({=ch10.db80} decibels), and one amplifier can lift it so the signal can carry on. Over the same 80 kilometres, a coaxial cable carrying a signal at gigahertz frequencies would lose more than ten thousand decibels (an order of magnitude). Another happy coincidence helps a great deal: erbium-doped fibre amplifiers work right in the 1530 to 1565 nanometre range, amplify light directly without converting it back to electricity, and amplify several dozen wavelengths at once. A single fibre carries hundreds of wavelengths side by side, each modulated with QAM from chapter 9; this is called **wavelength-division multiplexing**.

Limits of the model: the loss curve is the textbook form of two terms, "Rayleigh scattering plus the infrared absorption tail". The Rayleigh coefficient is 0.9 dB/km·μm⁴, tuned so that common standard single-mode fibre falls in the usual ranges (about 0.32–0.35 decibels per kilometre at 1310 nanometres and 0.18–0.20 at 1550 nanometres); it is not measured from any one fibre. The hydroxyl absorption peak near 1383 nanometres is not drawn (it has largely been eliminated in modern "low-water-peak" fibres), and bending, splices and dispersion are not calculated. {.take}

## Aperture Decides Sharpness: Diffraction and Antenna Arrays {#ch11}

::: strings
toc: Aperture Decides Sharpness: Diffraction and Antenna Arrays
:::

A wave leaving an opening of finite size always spreads out, by an angle of about λ/D. So the smallest angle that a mirror, a dish or a lens can resolve is 1.22 λ/D: to see finer detail, you can only enlarge the aperture or shorten the wavelength. Arranging many small antennas into an array, and adjusting their phases, is equivalent to building a large aperture whose direction can be steered electronically. {.law}

From far away, car headlights look like a single point of light; only when they come close do they separate into two. It is not that the eye is not "bright" enough; the pupil is too small. The image of each light spreads into a small blurred disc, and when the lights are close together the discs overlap.

A wave passes through an opening (a pupil, a lens, the face of an antenna), and every point of the opening can be regarded as a new source of waves ([[interference]], [[double-slit]]). Straight ahead, all these little waves are in phase and add up most strongly. At an angle θ off axis, the path difference across the opening, seen from a distant point, is D·sinθ; when that difference reaches about one wavelength, the parts cancel each other. So a beam of light cannot be "straighter" than λ/D, and the image of a point cannot be smaller than that angle. For a circular aperture, the exact pattern is called the **Airy disk**, and its first dark ring lies at **θ = {=ch11.k} λ/D**.

When two point sources are exactly this far apart, the peak of one falls on the first dark ring of the other, and the combined brightness shows a shallow dip in the middle, just enough to tell that there are two. This is the **Rayleigh criterion**.

::: lab ch11-model
model.title: Two points: can they be told apart?
model.how: Choose an aperture. The thin lines are the Airy patterns of the two point sources on their own, and the gold line is their total brightness. Drag the separation of the two points (in units of 1.22 λ/D) to see when the dip in the middle appears.
ctl.which: Aperture
which.eye: Human eye (3 mm pupil)
which.hubble: Hubble (2.4 m)
which.jwst: JWST (6.5 m, 2 μm)
which.dsn: Deep Space Network dish (70 m)
which.eht: Event Horizon Telescope
ctl.s: Separation of the two points (× 1.22 λ/D)
read.th: 1.22 λ/D
read.size: Corresponding size at the target
read.dip: Middle ÷ peak
cv.aria: Graph: the Airy patterns of two point sources and their sum
cv.x: Angle →
cv.sum: Total brightness
cv.one: Individual Airy patterns
say.merged: Separation {s}: the two spots lie completely on top of each other, with no dip in the middle, and look like a single point. The dip only just appears at a separation of about {sp}.
say.barely: Separation {s}: the brightness in the middle is <em>{dip}</em> of the peak, a slight dip, just enough to make out two.
say.rayleigh: Separation exactly 1: Rayleigh criterion. The brightness in the middle is <em>{dip}</em> of the peak.
say.clear: Separation {s}: the middle falls to <em>{dip}</em> of the peak, and the two are clearly separate.
note.eye: Human eye: {th}, so from 1 km away two points {size} apart can be separated. A 1.0 on an eye chart corresponds to 1 arcminute, close to this figure: the sharpness of the eye is already near the diffraction limit.
note.hubble: Hubble, green light: {th}, which corresponds to {size} on the Moon. It cannot see the lunar module (a few metres across), not because it is poor but because its aperture is only 2.4 metres.
note.jwst: Webb, 2-micrometre infrared: {th}. Its aperture is 2.7 times Hubble's, but the wavelength is 3.6 times longer, so its angular resolution is no better than Hubble's at visible light; its strengths are infrared and light-collecting area.
note.dsn: 70-metre antenna, 8.4 gigahertz: beam width about {th}. Conversely, Voyager 1's 3.7-metre antenna has a much smaller aperture, so by the time its beam reaches Earth it has spread to about {vb} across, and Earth catches only a very small part of it, which is why the power received in chapter 9 is so small.
note.eht: Combining signals from radio telescopes spread across the globe gives an effective aperture the size of Earth's diameter, at a wavelength of 1.3 millimetres: {th}. The ring around the black hole at the centre of galaxy M87 is about 42 microarcseconds across, which is just separable.
:::

This formula governs everything that forms images or points with waves. The human eye resolves about {=ch11.eye} arcseconds; Hubble, {=ch11.hubble} arcseconds. Radio telescopes work at wavelengths tens of thousands of times longer than light, so to reach the same resolution their apertures must be tens of thousands of times larger. That is why there are methods of linking telescopes thousands of kilometres apart. The Event Horizon Telescope reached {=ch11.eht} microarcseconds and photographed the black hole's shadow ([[what-is-a-black-hole]]).

Used in reverse, this is **photolithography**: a circuit pattern is shrunk and projected onto a silicon wafer, and the finest linewidth that can be printed is about k₁·λ/NA, where NA is the numerical aperture of the lens (the sine of the half-angle of the cone of light it collects) and k₁ is a process factor. Taking the Rayleigh criterion, k₁ = 0.61; at a wavelength of 13.5 nanometres and NA 0.55 this gives {=ch11.euvR} nanometres. Real processes use various methods to push k₁ down to about {=ch11.k1}, reaching 8 nanometres. Chips keep getting smaller by working on the three quantities in this formula: using shorter wavelengths, making larger lenses, and lowering k₁. The essay “Why Chips Are Getting Harder to Make” (unregistered) picks up from here.

A large aperture need not be a single piece. Line up many small antennas in a row, give each one a different delay, and the waves they emit add up in phase in one direction and cancel in others.

::: diagram dg-arr keys=dg.arr
cap: Figure 12: A phased array. Each element emits the same wave a little later than its neighbour on the left. Their wavefronts (arcs) add up, and the combined wavefront is tilted, so the beam points in the tilted direction. Changing the delays steers the beam, and the antenna itself does not move (schematic).
aria: Diagram: a row of eight antenna elements along the bottom; above each one, arcs of decreasing size show wavefronts; a common tangent line through the arcs is tilted, and an arrow perpendicular to it points in the beam direction
el: Antenna element, spacing d
ph: Each fires later, left to right
wf: Combined wavefront
beam: Beam direction
:::

::: lab ch11-arr keys=ch11.arr
model.title: Phased array: turning the beam with phase
model.how: Drag the number of elements, the spacing between them, and the angle at which you want the beam to point. The figure shows the radiated intensity of this row of antennas in each direction (in decibels, with the strongest point at 0). Pull the spacing above half a wavelength, then turn the beam to one side, and see what extra appears.
ctl.n: Number of elements N
ctl.d: Element spacing (in wavelengths λ)
ctl.t: Beam direction (angle from straight ahead)
read.w: Half-power beamwidth of the beam
read.ph: Phase difference between neighbouring elements
read.g: Gain over a single element
read.gl: Direction of grating lobe
cv.aria: Graph: the radiated intensity of a row of antennas against direction
cv.x: Direction (angle from straight ahead) →
cv.y: Intensity (dB)
cv.beam: Main lobe
cv.gr: Grating lobe
say.ok: {n} elements, spacing {d} wavelengths, beam pointing at {t}, width <em>{w}</em>. The total length of the array is {len} wavelengths, and the beamwidth is roughly "wavelength ÷ total length". Adjacent elements differ in phase by only {ph}, and the whole beam turns that way; nothing moves mechanically.
say.grating: A spacing of {d} wavelengths is too large: in the direction <em>{gl}</em>, the path difference between neighbouring elements again comes to a whole number of wavelengths, and a <em>grating lobe</em> as strong as the main lobe appears. Power is diverted into it, and interference from that direction is picked up. To steer the beam to {t} without a grating lobe, the spacing must not exceed {dmax} wavelengths.
say.few: Only {n} elements: the beam is very wide ({w}), and there is no real "pointing". The more elements, the narrower the beam and the higher the gain.
:::

With 16 elements spaced half a wavelength apart, the beam straight ahead is {=ch11.w0}° wide; turned to 30°, it widens to {=ch11.w30}°, because seen from an oblique direction the array looks shorter. To steer the beam in any direction without producing a **grating lobe**, the spacing must not exceed half a wavelength. This explains why phased arrays make economic sense at high frequencies. The half-wavelength at 28 gigahertz is {=ch11.half28} millimetres, so 8 × 8 = 64 elements fit on a surface the size of a matchbox. Each element is tiny, yet together they form a sizeable aperture, which just makes up for the larger path loss at high frequencies (in the formula of chapter 9, the receiving area is proportional to λ²). The "massive antenna" systems of 5G base stations, the flat-panel antennas of satellite internet, and automotive millimetre-wave radar are all phased arrays.

Limits of the model: the Airy pattern of a point source is the result for an ideal circular aperture at a single wavelength; real telescopes have obstructions, aberrations and atmospheric turbulence. In the antenna array, each element is treated as an isotropic point; the pattern of each element on its own and the coupling between elements are not calculated. A real array's gain also falls as the beam is turned to large angles. {.take}

## Where the Frontier Is (November 2026) {#ch12}

::: strings
toc: Where the Frontier Is (November 2026)
:::

The equations of the first eleven chapters have not changed in more than a century. What is changing is engineering: going to higher frequencies, using the band of a single fibre more fully, and extending links into orbit and deep space. Each item below is dated, and "established", "demonstrated" and "claimed or planned" are listed separately. {.law}

Reading this chapter uses every quantity from earlier: frequency sets bandwidth and atmospheric absorption (chapters 7–9); aperture and wavelength set gain and beam width (chapter 11); the link budget sets how far a signal can travel (chapter 9); and loss and bandwidth determine how much a single fibre can carry (chapter 10).

### Established (standards and physics) {#h.est .sub3}

- **Frequency bands.** The mobile communication standard divides 5G frequencies into two ranges: FR1 ({=fr.fr1}) and FR2 ({=fr.fr2}, millimetre waves). The low range covers long distances and penetrates walls well, but its bandwidth is narrow; millimetre waves have wide bandwidth but do not travel far and are easily blocked. This is exactly the conclusion of chapters 8 and 9. {#e1}
- **Wi-Fi 7.** IEEE 802.11be was formally published on 22 July 2025: channels up to {=fr.wifi7Bw} megahertz wide, the densest constellation {=fr.wifi7Qam}-QAM (one symbol carrying {=ch9.bits4096} bits), and it can use the 2.4, 5 and 6 gigahertz bands at the same time. {#e2}
- **The loss floor of fibre.** The loss of solid silica fibre near 1550 nanometres is about 0.14–0.2 decibels per kilometre, set by Rayleigh scattering and infrared absorption (chapter 10), and it has barely fallen in four decades. To go lower, light must not travel in glass at all. {#e3}
- **The diffraction limit.** EUV lithography uses a wavelength of {=fr.euvLam} nanometres; the numerical aperture has risen from {=fr.euvNaLow} to {=fr.euvNa}, and the manufacturer gives a resolution of {=fr.euvRes} nanometres (the formula of chapter 11). {#e4}

### Demonstrated (who, and when) {#h.demo .sub3}

- **A single standard fibre.** The National Institute of Information and Communications Technology (NICT) in Japan and its collaborators reported at the Optical Fiber Communication Conference (OFC) in March {=fr.smfYear} that they sent {=fr.smfTb} terabits per second through {=fr.smfKm} kilometres of already-installed old fibre in London. The signal occupied {=fr.smfThz} terahertz of bandwidth, spread between 1264 and 1618 nanometres (usually only the 1530–1565 nanometre stretch is used). Measured between the two ends of that wavelength range, the span is about 52 terahertz wide; the press release does not explain the difference between the two figures, probably because gaps were left between bands. {#d1}
- **Multi-core fibre.** NICT, Sumitomo Electric and others reported at OFC in April {=fr.mcfYear} that, using a fibre with the same outer diameter as ordinary fibre ({=fr.mcfClad} micrometres) and containing {=fr.mcfCores} cores, they carried {=fr.mcfPb} petabits per second over {=fr.mcfKm} kilometres. {#d2}
- **Hollow-core fibre.** A team from Microsoft and the University of Southampton published in *Nature Photonics* in September {=fr.hollowYear}: a fibre whose light travels in an air core, with a loss of {=fr.hollowDb} decibels per kilometre at 1550 nanometres, the first time below the floor of solid silica fibre, and below 0.2 decibels per kilometre across a range of {=fr.hollowThz} terahertz. The paper itself notes that results from different measurement methods disagree, and that longer fibres are needed to confirm them. Light travels in air about {=ch10.hollow} faster than in glass (chapter 10). {#d3}
- **Sub-terahertz wireless.** NTT DOCOMO, NTT, NEC and Fujitsu announced in April {=fr.thzYear} that they had achieved transmission of {=fr.thzGb} gigabits per second over {=fr.thzM} metres in the {=fr.thzBand1} and {=fr.thzBand2} gigahertz bands (line of sight, with no obstruction). Compare chapter 8: at 300 gigahertz, clear sky would cost {=ch8.g300} decibels per kilometre. {#d4}
- **Deep-space laser communication.** The laser communication experiment on NASA's Psyche spacecraft sent data back at {=fr.dsocMbps} megabits per second from a distance of {=fr.dsocPeakKm} ten thousand kilometres in December 2023; in December 2024 it set a distance record of {=fr.dsocFarKm} hundred million kilometres; and it ended in September 2025, after {=fr.dsocPasses} communication sessions, having downlinked {=fr.dsocTb} terabits in total. A laser's wavelength is tens of thousands of times shorter than radio's, and a beam from an aperture of the same size is tens of thousands of times narrower (chapter 11). {#d5}
- **Phone-direct satellite.** As of October 2026, SpaceX had more than {=fr.d2cSats} Starlink satellites in orbit that can communicate directly with ordinary phones. Since July 2025 this has been offered commercially in the United States with T-Mobile, mainly for text messages and data for some apps (the satellite count comes from reports in industry media; I have not verified it against company or regulatory filings). A phone has only 0.2 watts and a nearly isotropic antenna, so the link budget (chapter 9) has to be made up by large phased arrays on the satellites, with areas measured in square metres. {#d6}
- **The most distant link.** Voyager 1 reached one light-day from Earth on 18 November 2026 (about {=fr.voyAu} au), and it is still communicating with a transmitter of {=ch9.voyPt} watts. {#d7}
- **EUV lithography.** ASML's high-numerical-aperture lithography machine (EXE:5200B) has been delivered since 2025 to Intel, Samsung, SK hynix and others; Intel announced in December 2025 that it had completed acceptance. {#d8}

### Planned and claimed (with the source named) {#h.claim .sub3}

- **The 6G timeline.** The standards body 3GPP began technical study of 6G in mid-2025 and plans to move to writing specifications in 2027. Ericsson, an equipment vendor, said in June 2026 that the first 6G specification would be completed in early 2029, with first commercial deployment in 2030. These are the expectations of the parties involved, not established facts. {#c1}
- **Which bands for 6G.** The 2027 World Radiocommunication Conference (WRC-27) will consider whether to allocate {=fr.wrc1}, {=fr.wrc2} and {=fr.wrc3} to mobile communication. Countries and industries differ: satellite and military users oppose some of these ranges, and European telecommunications authorities hold reservations about some of the bands. The result will not be known until 2027. {#c2}
- **Wi-Fi 8.** IEEE 802.11bn is still a draft, and trade media expect approval in {=fr.wifi8Year}. Its goals are reliability and latency; its maximum channel width and modulation order are the same as Wi-Fi 7's. {#c3}
- **High-NA EUV in volume production.** ASML's chief executive told the media that customers will not reach large-scale production with it until 2027–2028. {#c4}
- **Higher-energy X-ray lasers.** SLAC's LCLS-II in the United States (first light in September 2023, up to a million pulses per second) is being upgraded to raise the electron-beam energy to {=fr.lclsGeV} gigaelectronvolts, to produce shorter-wavelength hard X-rays. The project's plan, announced in 2025, is for first light around October 2027. {#c5}

Still unsolved: between 0.1 and 10 terahertz there are neither compact sources strong enough nor good amplifiers, and atmospheric absorption is heavy (chapter 8), so the "terahertz gap" remains mainly a matter for the laboratory; whether hollow-core fibre can be made and spliced in volume over long distances; and programmable metasurfaces (a layer of artificial structures smaller than a wavelength that sets the phase point by point, equivalent to a phased-array reflector panel that can be stuck to a wall). These work in experiments, but as of November 2026 I have found no report that they have been written into a 6G standard.

Frequencies, records and dates all go out of date: each fact in this chapter reflects the situation in November 2026, so check its date before relying on it. {.take}

## Wrap-up: Four Questions to Ask First {#ch13}

::: strings
toc: Wrap-up: Four Questions to Ask First
:::

Back to the opening question: what crosses the vacuum is a pattern of electric and magnetic fields pushing each other forward. Its speed is fixed by two constants of the vacuum. Everything else (how far a signal can reach, how much information it carries, whether it can pass through walls, how large the antenna must be) is set by frequency and aperture. {.law}

The next time you read a news story about 5G bands, satellite internet, a fibre record or "radiation", you can start by asking four questions.

{.qs}
- **What is the frequency?** It gives the wavelength (chapter 7). The wavelength sets the size of the antenna (chapter 5), whether the wave can get round obstacles, and how much the atmosphere absorbs (chapter 8). The photon energy decides whether it can only heat, or can also break chemical bonds and ionise. {#q1}
- **How much bandwidth?** The amount of information that can be sent per second follows the bandwidth (chapter 9), and bandwidth usually takes only a few percent of the carrier frequency. This is why communication keeps moving to higher frequencies, and why spectrum is valuable. {#q2}
- **Does the link budget balance?** Transmitted power, plus the antenna gains at both ends, minus the path loss, compared with the noise (chapter 9). Radio makes up for distance with gain; fibre keeps the wave from spreading, losing less than 0.2 decibels per kilometre (chapter 10). {#q3}
- **How many wavelengths wide is the aperture?** This sets how narrow the beam is and how sharp the image (chapter 11). For the same aperture, the higher the frequency, the narrower the beam; if the aperture is not big enough, an array is used to make up the difference. {#q4}

In one sentence: the physics of electromagnetic waves was written down in 1865, and the 160 years since have been spent working on four quantities: frequency, bandwidth, power and aperture. {#sum .sum}

Related essays: [[electric-fields]], [[magnets]], [[magnetic-force]] and [[electromagnetic-induction]] (the secondary-school versions of fields and the four laws); [[reflection-refraction]] and [[interference]] (refraction and interference); [[photoelectric-effect]] and [[blackbody-radiation]] (photons and thermal radiation); [[why-the-sky-is-blue]] (scattering); [[why-the-planet-warms]] (infrared and greenhouse gases); [[inside-a-phone]] (positioning, path loss and Shannon capacity); [[relativity]] (what follows from the constant speed of light). Two further long essays are not yet registered: “How Much Information Can One Wire Really Carry” (Shannon's theorem and coding) and “Why Chips Are Getting Harder to Make” (lithography). Links to them will be added here once they are registered. {#links}

::: footer
**Sources.** Constants: CODATA 2022 (μ₀, ε₀); IAU 2015 Resolution B3 (nominal solar luminosity and solar constant). Electromagnetism: D. J. Griffiths, Introduction to Electrodynamics, 4th ed. (displacement current, wave equation, Poynting vector, Larmor formula); E. Hecht, Optics, 5th ed. (Fresnel equations, Malus's law, Airy disk). FDTD: K. S. Yee, IEEE Trans. Antennas Propag. 14(3), 1966; A. Taflove and S. Hagness, Computational Electrodynamics, 3rd ed.; G. Mur, IEEE Trans. EMC 23(4), 1981. Antennas: C. A. Balanis, Antenna Theory, 4th ed., chapters 4 and 6; H. T. Friis, Proc. IRE 34(5), 1946. Dielectric relaxation of water: U. Kaatze, J. Chem. Eng. Data 34, 371 (1989). Atmospheric absorption: International Telecommunication Union, ITU-R P.676-13 (August 2022) and P.835-6. Fibre loss: G. Keiser, Optical Fiber Communications, chapter 3.

Radio frequency and health: ICNIRP, Guidelines for limiting exposure to electromagnetic fields (100 kHz to 300 GHz), Health Physics 118(5), 2020; US federal regulation 47 CFR 1.1310; IARC Monographs, vol. 102 (2013; evaluation of 2011); K. Karipidis et al., Environment International 191, 108983 (2024); World Health Organization radiofrequency electromagnetic fields web page (consulted November 2026).

Frontier (all consulted on 18 November 2026): NICT press releases (2025-05-29, 2026-06-01); M. Petrovich et al., Nature Photonics 19, 1203 (2025); joint press release of NTT DOCOMO et al. (2024-04-11); NASA, DSOC summary (2025-09-18); IEEE 802.11be-2024 (published 2025-07-22); Ericsson blog (2026-06-12); WRC-23 Resolution 256; ASML product page and trade press; SLAC LCLS briefing material (2025-07); EarthSky (2026-11-17, Voyager 1).

**Models.** Chapter 2: analytic solution for a circular parallel-plate capacitor; the displacement current obtained as a numerical derivative of the electric flux. Chapters 3 and 4: one-dimensional Yee-grid FDTD, with first-order Mur absorbing boundaries or ideal conductor boundaries. Chapter 5: sinusoidal current pattern of a thin straight dipole, integrated numerically over the sphere. Chapter 6: inverse-square law, Poynting vector, Malus's law. Chapter 7: single-relaxation Debye model. Chapter 8: line-by-line summation of ITU-R P.676-13 Annex 1; for the zenith direction, integration along the P.835 reference atmosphere. Chapter 9: discrete Fourier transform; Friis equation with thermal noise. Chapter 10: Rayleigh scattering plus infrared absorption. Chapter 11: Airy function; array factor of a uniform linear array. This essay was written by Claude (Anthropic's AI) and has not yet been independently reviewed.
:::
