---
lang: en
---

::: strings
back: ← Knowledge index
title: Thermodynamics · Follow the Energy
eyebrow: Physics · Thermodynamics
tagline: Treat a gas as an experiment that answers back: move the piston, choose a path, then watch the area under P–V become work and close the conservation loop.
nav: Steps
footer: Thermodynamics visual · every readout is computed from the current parameters
langLabel: Language
choose: Choose
status: Status
:::

## First separate state from path {#step0 h2=s0title pre=1}

::: strings
nav0: 01 State
:::

::: html step0-1
:::

An ideal gas state is described by **P, V, T** and amount **n**. State depends only on endpoints; heat Q and work W remember how you got there. Move volume and watch pressure respond. {#s0body .explain}

::: html step0-2
stateAlt: Ideal-gas piston state diagram
stateFeedback: With more volume at fixed temperature, molecules hit the piston less often, so P falls as 1/V.
nLabel: Amount n
tLabel: Temperature T
vLabel: Volume V
:::

Double the volume: if temperature stays fixed, what happens to pressure? {#stateTask .hint i18n=text}

::: html step0-3
misconception: Misconception check: if the endpoints match, Q and W must match too.
mFalse: Yes, Q and W only depend on endpoints
mTrue: No: Q and W are path quantities; only ΔU is a state change
next: Keep the energy ledger →
:::

::: strings
stateReadout: State: P = {P} kPa · V = {V} L · T = {T} K
mFeedback: Correct. The first law links them: ΔU = Q − W (W is work done by the system).
mWrong: Not quite: the same endpoints can be connected by different paths, changing Q and W.
:::

## First law: every joule must balance {#step1 h2=s1title pre=1}

::: strings
nav1: 02 First law
:::

::: html step1-1
:::

Heat Q absorbed by the gas either changes internal energy ΔU or leaves as work W on the piston. We take **W&gt;0** for work done by the system, so **ΔU = Q − W**. {#s1body .explain}

::: html step1-2
processLabel: Process
iso: Isothermal expansion
adi: Adiabatic expansion
vfLabel: Final volume Vf
gammaLabel: Adiabatic index γ
pvAlt: P–V path and work area
areaNote: Area under the curve is W = ∫P dV.
firstLaw: Energy ledger: Q = ΔU + W
challenge: Predict: after adiabatic expansion, does temperature rise or fall?
rise: Rise
fall: Fall
next2: Compare the paths →
:::

::: strings
firstLawReadout: Q = {Q} kJ · ΔU = {dU} kJ · W = {W} kJ · residual = {err} kJ
isoExplain: Isothermal: T stays fixed, so ideal-gas internal energy stays fixed and all Q becomes work.
adiExplain: Adiabatic: no heat exchange (Q=0); work is paid from internal energy, so expansion cools the gas.
firstLawFeedback: Every slider movement recomputes all three terms; conservation is a numerical loop, not a slogan.
challengeCorrect: Right. With Q=0, work comes from internal energy, so T falls.
challengeWrong: Read the ledger: Q=0 gives ΔU = −W; expansion has W>0, so internal energy and temperature fall.
:::

## One start, two paths: isothermal vs adiabatic {#step2 h2=s2title pre=1}

::: strings
nav2: 03 Paths
:::

::: html step2-1
:::

Hold the initial state fixed and switch process type. The isothermal curve is flatter because the surroundings keep supplying heat; the adiabatic curve is steeper because the gas spends its own internal energy. {#s2body .explain i18n=text}

::: html step2-2
legendIso: isothermal, T fixed
legendAdi: adiabatic, Q=0
:::

The two paths end in different states; one start does not mean one finish. {#compareHint .hint i18n=text}

::: html step2-3
next3: Put a path inside an engine →
:::

::: strings
compareReadout: Start {Pi} kPa / {Ti} K → end {Pf} kPa / {Tf} K
:::

## Heat engine: turn conservation into an efficiency limit {#step3 h2=s3title pre=1}

::: strings
nav3: 04 Engine
:::

::: html step3-1
:::

An engine takes Q<sub>in</sub> from a hot reservoir, rejects Q<sub>out</sub> to a cold reservoir, and keeps the rest as net work W<sub>net</sub>. Efficiency η = W<sub>net</sub>/Q<sub>in</sub>; the Carnot ceiling depends only on the two temperatures. {#s3body .explain}

::: html step3-2
engineAlt: Heat-engine energy flow diagram
hotLabel: Hot reservoir Th
coldLabel: Cold reservoir Tc
ratioLabel: Volume ratio r
:::

A larger temperature gap raises the ceiling, but no real cycle can exceed Carnot efficiency. {#engineHint .hint i18n=text}

::: html step3-3
engineQuestion: If the cold reservoir reached 0 K, could efficiency reach 100%?
engineYes: Yes, efficiency would be 100%
engineNo: Only as a limit; 0 K cannot be reached
finish: Back to index
:::

::: strings
engineReadout: Qin = {qin} kJ · Qout = {qout} kJ · Wnet = {w} kJ
effReadout: Efficiency η = {eff}% · Carnot ceiling ηC = {carnot}%
engineCorrect: Correct. The formula reaches 100% only at Tc=0, while the third law says absolute zero cannot be reached in finite steps.
engineWrong: Use ηC = 1 − Tc/Th: only Tc=0 gives 100%, and absolute zero is unattainable.
:::
