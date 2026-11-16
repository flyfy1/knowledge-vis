---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Blackbody Radiation · Why Hot Things Glow
tagline: Hotter things glow from red to white to blue; classical theory fails in the ultraviolet, and Planck’s idea that energy comes in lumps rescues it.
docTitle: Blackbody Radiation · Why Hot Things Glow
:::

## Why does heated iron go red, then orange, then white as it gets hotter? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Colour and T
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Colour and temperature
:::

<b>This step answers: what decides the colour of the glow?</b> Every warm object emits a continuous range of electromagnetic waves. The hotter it is, the shorter the wavelength of the strongest part: peak wavelength λ<sub>max</sub> = b/T, with b ≈ 2.898×10⁻³ m·K. Drag the temperature and watch the glowing ball’s colour and brightness and the white peak line on the spectrum strip move together. The colour is a standard approximation for display, not a precise colour measurement. {#s0e .explain}

::: html step0-2
s0cv: A glowing ball changing colour with temperature above a log wavelength axis showing the peak wavelength and the visible band
lblT: Temperature T (K)
:::

## How much energy goes out at each wavelength? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Spectrum
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Planck spectrum
:::

<b>This step answers: how does temperature reshape the whole spectrum?</b> Planck’s law gives the power per area at each wavelength, M(λ) = 2πhc²/λ⁵ · 1/(e^{hc/(λkT)} − 1). Drag the temperature: the curve rises as a whole and its peak slides to shorter wavelengths; the coloured band is visible light. Grey curves are 3000 K and 6000 K for reference. Neither the red nor the blue end stops abruptly: the spectrum is continuous. {#s1e .explain}

::: html step1-2
s1cv: Planck spectrum curves for several temperatures with the visible band shaded
:::

## In which band do the human body, a bulb filament and the Sun shine brightest? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Wien shift
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Wien displacement
:::

<b>This step answers: how is the peak wavelength tied to the temperature?</b> λ<sub>max</sub>·T = b is a constant, so doubling T halves the peak wavelength (a straight line on log–log axes). The human body at about 310 K peaks in the infrared near 9.3 µm; a tungsten filament at about 2800 K still peaks in the infrared; the Sun’s surface at about 5772 K peaks mid-visible. The readout gives both the formula value and the maximum found point by point on the Planck curve; they agree. {#s2e .explain}

::: html step2-2
s2cv: Log–log curve of peak wavelength versus temperature marking body, filament and Sun
pBody: Body 310 K
pBulb: Filament 2800 K
pSun: Sun 5772 K
pStar: Blue-white star 9940 K
:::

::: strings
lblPeak: peak {p} nm
lblVis: visible
reg_uv: ultraviolet
reg_vis: visible light
reg_ir: infrared
s0ro: T = {T} K: peak wavelength λmax = b/T ≈ {p} nm ({reg}); display colour about RGB({c}).
axLam: wavelength λ (nm)
axLogM: vertical axis: log scale
axM: power per area per nm, M
axT: temperature T (K)
s1ro: T = {T} K: peak at {pk} nm with M = {m} W/m²/nm; total power σT⁴ = {tot} W/m², of which visible light is about {vis}%.
objBody: body
objBulb: filament
objSun: Sun
s2ro: T = {T} K: formula b/T = {f} nm; maximum found on the Planck curve at {n} nm ({reg}); λmax·T = {prod} mm·K.
lblHalf: doubling T → power ×{r}
s3ro: T = {T} K: σT⁴ = {p} W/m²; numerical integral of the Planck curve {num} W/m² (off by {err}%); halving T changes power by a factor {r}; {rs}× the 300 K value.
lblRJ: Rayleigh–Jeans (classical)
lblPlanck: Planck
s4ro: T = {T} K, λ = {lam} nm: Planck {pm} W/m²/nm, classical {rj} W/m²/nm, classical ÷ Planck = {r}; hc/(kT) ≈ {hk} nm.
lblClassic: classical 1/x
lblQuantum: quantum 1/(eˣ−1)
axX: x = hc/(λkT)
vSuppress: one unit exceeds the thermal energy: suppressed
vClassical: one unit is below the thermal energy: classical is fine
s5ro: T = {T} K, λ = {lam} nm: x = {x}; quantum mean number {q}, classical {c}, quantum ÷ classical = {r}; {v}.
:::

## When the temperature doubles, how many times more power is radiated? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 T⁴ law
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Stefan–Boltzmann
:::

<b>This step answers: how does the total radiated power grow with temperature?</b> Adding up the area under the whole spectrum gives power per square metre P = σT⁴ (σ ≈ 5.670×10⁻⁸ W·m⁻²·K⁻⁴). Doubling T multiplies the power by 2⁴ = 16. The “numerical integral” in the readout adds up the Planck curve from the previous step piece by piece and is compared with σT⁴; the error should be close to zero. {#s3e .explain}

::: html step3-2
s3cv: Curve of total radiated power rising as T⁴ with the chosen temperature marked
:::

## Why does the classical prediction run away at short wavelengths? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 UV catastrophe
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Ultraviolet catastrophe
:::

<b>This step answers: where does the classical formula go wrong?</b> The classical Rayleigh–Jeans law, M = 2πckT/λ⁴, matches measurement at long wavelengths but grows without limit as the wavelength shrinks, so the total energy diverges: the “ultraviolet catastrophe”. The red line is the classical prediction and the orange line is Planck’s. The vertical axis is logarithmic. Drag the probe wavelength: the readout gives their ratio, which tends to 1 when λ is much longer than hc/(kT) and grows as the wavelength shrinks (the readout also gives that length hc/(kT)). {#s4e .explain}

::: html step4-2
s4cv: The Rayleigh–Jeans curve (red) diverging at short wavelengths while the Planck curve (orange) stays finite
lblLam: Probe wavelength λ (log slider)
:::

## How does “energy comes in lumps” keep the ultraviolet end under control? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Energy in lumps
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · energy quanta
:::

<b>This step answers: why does the lump hypothesis stop the divergence?</b> Planck proposed that light of frequency ν can only carry energy in whole units hν = hc/λ. Let x = hc/(λkT), the ratio of one unit to the thermal energy kT. When x is small (long wavelength) a unit is tiny and the classical share 1/x holds; when x is large (short wavelength) one unit exceeds the thermal energy and is rarely excited, so the average number 1/(e^x − 1) is squashed exponentially. Red is classical, orange is quantum, and the vertical line is your chosen λ and T. {#s5e .explain}

::: html step5-2
s5cv: Average number of quanta versus x: classical (red) and quantum (orange)
recapTitle: Recap
recap1: The hotter the object, the shorter the peak wavelength (λmax·T = b), the higher the whole spectrum and the total power grows as T⁴.
recap2: The classical Rayleigh–Jeans law diverges at short wavelengths (the ultraviolet catastrophe).
recap3: Planck’s energy unit hν is exponentially suppressed when hν ≫ kT, which tames the spectrum: the starting point of quantum ideas.
modelTitle: Scope and limits of the model
modelText: Model: an ideal blackbody, looking only at the emitted thermal radiation. Real objects have emissivity below 1 that varies with wavelength, and the Sun is not a strict blackbody. The colour is a standard approximation for display, and the numerical integral uses a log grid from 10 nm to 5 mm.
link0: → Photoelectric Effect: light also comes in lumps of energy
link1: → Quantum Basics: amplitudes and measurement
link2: → Kinetic Theory: temperature as mean kinetic energy
:::

Page complete. {#done .readout .success i18n=text}
