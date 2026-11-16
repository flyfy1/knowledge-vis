---
lang: en
---

::: strings
pageTitle: The Microscopic Picture of Gas Pressure · A Ledger of Wall Hits
tagline: Particles in a box bounce around: pressure is a ledger of wall impulses, temperature is mean kinetic energy, and the speed distribution grows out of collisions.
:::

## Pressure is simply the total impulse of particles hitting the wall {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Pressure = wall hits
:::

::: html step0-1
:::

This step answers: where does the pressure of a gas in a box come from? A particle hitting a wall changes its momentum perpendicular to it by 2m·vₙ (it arrives and bounces back); the total impulse per second per unit wall length over the four walls is the **pressure** P (for a 2D gas, force per length). Each bar on the right is the pressure measured over 0.25 s, the line is the average of the last 8 s, and the dashed line is the theory P = N·⟨KE⟩/(W·H), where ⟨KE⟩ is the mean kinetic energy per particle. Particles collide elastically with each other and with perfectly elastic walls. {#s0e .explain}

::: html step0-2
s0o: See the bars jitter around the dashed line while the line settles onto it; then raise N from 40 to 80 (this respawns the gas) and watch the bars rise to about double.
lN: Number of particles N
bPlay: Play / Pause
bReset: Reset: scatter fresh particles and clear the statistics
:::

::: strings
r0: N = {n}, mean kinetic energy ⟨KE⟩ = {ke}; theory P = N⟨KE⟩/A = {pth}; measured P over the last 8 s = {pm} ({ratio}); simulated {t} s.
measuring: measuring, needs 8 s of data
:::

## Temperature: a reading of mean kinetic energy {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Temperature
:::

::: html step1-1
:::

This step answers: when you heat the gas, what happens to the particles and the pressure? On this page ⟨KE⟩ = k T (two degrees of freedom in 2D, k = 1), so higher T means higher mean kinetic energy and speeds that grow roughly as √T. The right panel is a histogram of all particle speeds right now, with a vertical line at the mean speed. Changing T rescales every velocity at once and restarts the pressure statistics. {#s1e .explain}

::: html step1-2
s1o: Raise T from 1 to 4: the histogram moves right and widens, and the mean speed roughly doubles; in the readout P/T should stay at the same number, N/A.
lT: Temperature T
:::

::: strings
r1: T = {t}, mean speed = {vm}; theory P = {pth}, measured P = {pm}; P/T = {pt} (N/A = {na}).
:::

## Volume: squeeze the gas and the pressure rises {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Volume
:::

::: html step2-1
:::

This step answers: when the box gets smaller, how does the pressure change? The speeds stay the same, but in a narrower box particles reach the right wall sooner, so there are more hits per second. In theory P·V = N⟨KE⟩ stays constant (V = W×H is the box area; Boyle's law). Change the width, wait 8 s for the reading to settle, then press Record to place the measured point (V, P) on the right and check whether it lands on the dashed hyperbola P = N⟨KE⟩/V. {#s2e .explain}

::: html step2-2
s2o: Set W to 8, 6, 4 and 2 in turn, recording each after the reading settles: the points should fall on one curve; halving V roughly doubles P.
lW: Box width W
bRec: Record current point (V, P)
bClear: Clear recorded points
:::

::: strings
r2: V = {v}; theory P = {pth}; measured P = {pm}; P×V = {pv} (theory constant N⟨KE⟩ = {c}); {k} points recorded.
needWait: The reading has not settled yet (needs 8 s); try again shortly.
:::

## Speed distribution: collisions shuffle identical speeds into a skewed bell {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Speed distribution
:::

::: html step3-1
:::

This step answers: why do the particles in a gas have fast and slow speeds? At the start, 100 particles all have exactly the same speed and differ only in direction. Elastic collisions between them exchange kinetic energy and the speeds spread out. The bars show the recent speed distribution and the curve is the 2D Maxwell distribution f(v) = (v/T)·exp(−v²/2T) (m = 1, k = 1). The gap in the readout is the total variation distance between the two (0 means they coincide). {#s3e .explain}

::: html step3-2
s3o: Press reset, then play: it starts as a single spike and spreads into the curve within seconds; the "gap" should fall from nearly 1 to a small value.
bReset3: Reset: start every particle at the same speed
:::

::: strings
r3: Simulated {t} s, {c} collisions so far; gap to the Maxwell curve = {d}; mean kinetic energy = {ke} (T = {T}).
:::

## Light and heavy particles: same temperature, same mean kinetic energy {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Light and heavy
:::

::: html step4-1
:::

This step answers: in one gas, which is faster, the light particles or the heavy ones? At the start both kinds have the same speed (so heavy ones carry more kinetic energy). Collisions exchange energy: heavy particles hand their surplus to the light ones and the two mean-kinetic-energy curves converge. At the end the kinetic energies are equal and the light particles' RMS speed is √M times the heavy ones' (M is the mass ratio). On the right the orange line is the heavy species and the cyan line the light one. {#s4e .explain}

::: html step4-2
s4o: Play and watch the two curves go from apart to together; set M from 4 to 9, reset and play again: after they merge the speed ratio should be close to √M.
lM: Heavy-particle mass M
bReset4: Reset: start every particle at the same speed
:::

::: strings
r4: ⟨KE⟩: light {kl}, heavy {kh}; RMS speed ratio light/heavy = {vr} (√M = {sq}); simulated {t} s.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) pressure is the total impulse of wall hits, P = N⟨KE⟩/A (2D); (2) temperature stands for mean kinetic energy, ⟨KE⟩ = kT; (3) halve the volume and wall hits become more frequent, so P roughly doubles (Boyle); (4) collisions grow the Maxwell speed distribution by themselves; (5) at one temperature the mean kinetic energy is the same, so lighter particles are faster. {#s5e .explain}

::: html step5-2
qq: Temperature and particle number stay fixed and you compress the box to half its volume. What happens to the pressure?
qo0: It halves
qo1: It doubles
qo2: It quadruples
s5m: This page is a 2D hard-disc gas: particles have a (small) size and no attraction, so measured pressure sits a few percent above the ideal value, walls are perfectly elastic, and kinetic energy is all the energy. A real gas is 3D with P = (2/3)N⟨KE⟩/V, has intermolecular forces and rotational and vibrational energy; changing W or T is an instantaneous teaching action (real compression also heats the gas by doing work); time runs faster than real; readings carry statistical noise, larger for fewer particles.
lk0: Particles & states: temperature as a reading of mean kinetic energy, from the junior-high side
lk1: Thermodynamics: start from P = nRT/V and go on to work and heat engines
:::

::: strings
qwhy: P·V = N⟨KE⟩ is constant, so halving V doubles P (check in step 2).
:::
