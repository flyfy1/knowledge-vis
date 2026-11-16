---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: The Carnot Cycle · The Ceiling on Heat-Engine Efficiency
tagline: Four steps around a p–V loop: the net work is the enclosed area, and the efficiency depends only on the hot and cold temperatures.
docTitle: The Carnot Cycle · The Ceiling on Heat-Engine Efficiency
:::

## How much work does the gas do when it expands? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Work is area
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Work is area
:::

<b>This step answers: how do you read work on a p–V diagram?</b> When a gas expands, the work it does is W = ∫P dV, the area under the curve. For an isothermal expansion P = nRT/V and the area is W = nRT·ln(V₂/V₁). This page takes nR = 1 J/K and V₁ = 1 to keep numbers readable. Drag the temperature and the end volume and compare the formula with a numerical sum of strips under the curve. {#s0e .explain}

::: html step0-2
s0cv: Isothermal expansion curve with the area beneath it shaded
lblT: Temperature T (K)
lblV2: End volume V₂
:::

## After one expansion the work is spent; how can the engine keep working? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Why return
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Why we must compress again
:::

<b>This step answers: why must a heat engine run in a cycle, and compress at a lower temperature?</b> The gas has to return to its start to work again. Compressing along the same path returns exactly the same work, so the net is zero. Compressing at a lower temperature T<sub>c</sub> needs less pressure for the same volume change and costs less work: net work = nR(T<sub>h</sub> − T<sub>c</sub>)·ln(V₂/V₁), the green area between the two isotherms. Drag T<sub>c</sub> and watch the area change. (The vertical joins at the ends are only a sketch; the real connecting processes come next.) {#s1e .explain}

::: html step1-2
s1cv: The green area between the hot and cold isotherms stands for the net work
lblTc: Cold sink T_c (K)
:::

## How do isothermal and adiabatic steps close into a loop? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Four steps
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The full Carnot cycle
:::

<b>This step answers: what are the four steps of the Carnot cycle?</b> ① Isothermal expansion in contact with the hot source (absorbing Q<sub>h</sub>); ② adiabatic expansion with no heat exchange, cooling to T<sub>c</sub>; ③ isothermal compression in contact with the cold sink (releasing Q<sub>c</sub>); ④ adiabatic compression back to T<sub>h</sub>. Adiabatic steps obey PV<sup>γ</sup> = constant, with γ = 5/3 for a monatomic ideal gas. Press Play to move the point around the loop; the readout names the current step and gives the full-cycle Q<sub>h</sub>, Q<sub>c</sub> and W. {#s2e .explain}

::: html step2-2
s2cv: The four Carnot segments on a p–V diagram: red isothermal expansion, orange adiabatic expansion, cyan isothermal compression, violet adiabatic compression
lblTh: Hot source T_h (K)
lblR: Volume ratio V₂/V₁
play: Play
restart: Back to start
:::

::: strings
pause: Pause
:::

## Where does the heat taken from the hot source go? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Energy ledger
:::

::: html step3-1
s3step: "Step 3 · "
s3k: The energy ledger
:::

<b>This step answers: how is the heat taken in, Q<sub>h</sub>, split into work and waste heat?</b> After one full cycle the internal energy is unchanged, so Q<sub>h</sub> = W + Q<sub>c</sub>. The red bar is heat in, green is work out, cyan is heat rejected to the cold sink, and the last two together equal the red bar. Since Q<sub>h</sub> = T<sub>h</sub>·ln r and Q<sub>c</sub> = T<sub>c</sub>·ln r, their ratio depends only on the temperature ratio. Drag T<sub>h</sub> and T<sub>c</sub>. {#s3e .explain}

::: html step3-2
s3cv: Three energy bars: heat in, work out and heat rejected
:::

## What is the highest efficiency a heat engine can reach? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 The ceiling
:::

::: html step4-1
s4step: "Step 4 · "
s4k: The efficiency ceiling
:::

<b>This step answers: can the efficiency ever reach 100%?</b> η = W/Q<sub>h</sub> = 1 − T<sub>c</sub>/T<sub>h</sub> (temperatures in kelvin). A colder sink and a hotter source raise it; reaching 100% would need T<sub>c</sub> at absolute zero. The second law adds that no engine working between the same two temperatures can beat the Carnot cycle. The three presets are of the order of a steam turbine, a car engine and an ocean-thermal plant (a tiny temperature gap, so a low ceiling). Real machines also have friction and heat leaks and fall short of the ceiling. {#s4e .explain}

::: html step4-2
s4cv: The Carnot efficiency falling linearly with T_c/T_h with the chosen operating point marked
preSteam: Steam-turbine scale 800→300 K
preCar: Car-engine scale 900→300 K
preOcean: Ocean thermal 300→277 K
:::

::: strings
lblArea: work W
s0ro: T = {T} K, V₁ = 1 → V₂ = {V2}: formula W = T·ln(V₂/V₁) = {w} J; summing 400 strips under the curve gives {n} J.
lblHotCurve: hot isotherm {T} K
lblColdCurve: cold isotherm {T} K
lblNet: net work
s1ro: T_h = 500 K, T_c = {Tc} K, V₂/V₁ = 3: expansion does {wo} J, compression costs {wi} J, net work {net} J ({frac}% of the expansion work). With T_c = T_h the net work is 0.
procIso1: ① isothermal expansion (heat in)
procAd1: ② adiabatic expansion (cooling)
procIso2: ③ isothermal compression (heat out)
procAd2: ④ adiabatic compression (warming)
s2ro: {proc}: T = {T} K, V = {V}, P = {P}. Full cycle: Q_h = {qh} J, Q_c = {qc} J, net work W = {w} J.
lblQh: heat in Q_h = {v} J
lblW: work W = {v} J
lblQc: heat out Q_c = {v} J
lblEff: efficiency W/Q_h = {e}%
s3ro: T_h = {Th} K, T_c = {Tc} K: Q_h = {qh} J, W = {w} J, Q_c = {qc} J; W + Q_c = {sum} J. Efficiency W/Q_h = {eta}%, and 1 − T_c/T_h = {eta2}%.
axRatio: T_c / T_h
axEta: Carnot efficiency
s4ro: T_h = {Th} K, T_c = {Tc} K (ratio {q}): efficiency ceiling {eta}%. Reaching 100% would need T_c = 0 K.
lblReverse: reversed: refrigeration
s5ro: Hot side {Th} K, cold side {Tc} K: COP = T_c/(T_h − T_c) = {cop}; moving 1000 J of heat takes {w} J of work and releases {qh} J to the hot side.
:::

## Run the loop backwards: can work move heat from cold to hot? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Run backwards
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · the Carnot cycle in reverse
:::

<b>This step answers: what is a heat engine run in reverse?</b> Reverse the arrows and the cycle becomes a refrigerator: work W goes in, heat Q<sub>c</sub> is drawn from the cold side and Q<sub>h</sub> = Q<sub>c</sub> + W is released to the hot side. Its figure of merit is the coefficient of performance COP = Q<sub>c</sub>/W = T<sub>c</sub>/(T<sub>h</sub> − T<sub>c</sub>). The smaller the temperature gap, the less work it takes to move the same heat. The readout uses 1000 J of heat removed as the example. Fridges, air conditioners and heat pumps work this way; real machines fall short of the ideal. {#s5e .explain}

::: html step5-2
s5cv: The Carnot loop with reversed arrows, representing refrigeration
lblThRoom: Outside (hot side) T_h (K)
lblTcFridge: Inside (cold side) T_c (K)
recapTitle: Recap
recap1: Work is the area under a p–V curve; the net work of a cycle is the area the loop encloses.
recap2: Carnot cycle: isothermal expansion, adiabatic expansion, isothermal compression, adiabatic compression; Q_h = W + Q_c.
recap3: Efficiency ceiling η = 1 − T_c/T_h; the reversed refrigerator has COP = T_c/(T_h − T_c).
modelTitle: Scope and limits of the model
modelText: Model: a monatomic ideal gas with nR = 1 J/K (γ = 5/3), reversible, frictionless and infinitely slow; the vertical joins in step 1 are only a sketch. Real engines are irreversible and fall below the Carnot ceiling; the presets use only temperature scales, not the parameters of a specific machine.
link0: → Thermodynamics: engine efficiency and the first law
link1: → Entropy: why heat does not flow from cold to hot by itself
link2: → Kinetic Theory: temperature and mean kinetic energy
:::

Page complete. {#done .readout .success i18n=text}
