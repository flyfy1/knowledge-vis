---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Chemistry
stageBadge: Junior High
foot: The pH Scale · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: The pH Scale · One Ruler from Battery Acid to Soapy Water
pageTitle: The pH Scale
tagline: How acidic or alkaline something is can be placed on one 0-to-14 ruler — and each step of 1 on it is a factor of 10.
:::

## How can one number say how acidic or alkaline a liquid is? {#step0 h2=s0t}

::: strings
nav0: 0 One ruler
:::

Step 0 · One ruler {#s0k .step-kicker i18n=text}

This step asks: why can one 0–14 ruler compare battery acid, lemon juice and soapy water? **pH** is a number for how acidic a solution is: below 7 is **acidic**, 7 is **neutral** (pure water), above 7 is **alkaline**. The colours on the bar are what universal indicator shows at each pH. Pick a common liquid or drag the slider and see where the marker lands. {#s0e .explain}

::: html step0-1
s0stage: x-axis: pH 0–14, coloured as universal indicator would show; the orange marker is the current position, dots are other everyday liquids at typical pH
s0canvas: A coloured pH bar: the marker follows the chosen liquid, below 7 acid, above 7 alkaline
s0item: Everyday liquid
s0ph: Or drag the pH
:::

Takeaway: lower pH is more acidic, higher is more alkaline, 7 is neutral. Holds with typical approximate values (they vary with concentration and recipe) for water solutions at 25 °C. {#s0result .readout i18n=text}

::: strings
s0ro: {name}: pH ≈ {ph}, {kind}; hydrogen ion concentration [H⁺] ≈ {h} mol/L.
s0custom: Custom solution
:::

## How many times stronger is a pH 3 acid than a pH 6 one? {#step1 h2=s1t}

::: strings
nav1: 1 One step = ×10
:::

Step 1 · One step = ×10 {#s1k .step-kicker i18n=text}

This step asks: if pH differs by 3, is the acid 3 times as strong? No. pH = −log₁₀[H⁺], and **[H⁺]** is the amount of hydrogen ions per litre (mol/L; bigger means more acidic). Each pH drop of 1 multiplies [H⁺] by 10, so a pH difference of Δ means [H⁺] differs by 10^Δ. Drag the two sliders: the gap between the pH bars on the left shows how many “×10”s you get on the right. {#s1e .explain}

::: html step1-1
s1stage: Left: pH bars for two solutions (longer = more acidic, length = 14 − pH); right: how many times more [H⁺] they hold
s1canvas: Two solutions A and B: the pH gap in steps sets the hydrogen ion ratio as a power of ten
s1a: pH of solution A
s1b: pH of solution B
:::

Takeaway: pH is a logarithmic scale — 1 unit is ×10, 3 units is ×1000. Holds for water solutions at 25 °C; at very high or very low concentrations the pH formula is only approximate. {#s1result .readout i18n=text}

::: strings
s1ro: A: pH {a}, [H⁺] = {ha} mol/L; B: pH {b}, [H⁺] = {hb} mol/L. pH differs by {d}, so [H⁺] differs by a factor of {ratio} ({who}).
s1whoA: A is more acidic
s1whoB: B is more acidic
s1whoEq: equally acidic
:::

## How can a colour tell you the pH range of a solution? {#step2 h2=s2t}

::: strings
nav2: 2 Indicator colours
:::

Step 2 · Indicator colours {#s2k .step-kicker i18n=text}

This step asks: add a few drops of indicator — how does its colour show acid or base? An **indicator** is a substance that changes colour with acidity, each only within its own pH range: litmus turns from red to blue between pH 4.5 and 8.3, phenolphthalein from colourless to pink between 8.2 and 10, methyl orange from red to yellow between 3.1 and 4.4, and universal indicator changes continuously. Choose an indicator and a sample pH, press “Add drops and record”, and build a colour chart below. {#s2e .explain}

::: html step2-1
s2stage: Top: the beaker with indicator added; middle: this indicator’s whole colour band over pH 0–14; bottom: the colour chart of samples you recorded
s2canvas: Indicator colours at different pH: the beaker, the full colour band and the recorded chart
s2ind: Indicator
s2ph: Sample pH
s2rec: Add drops and record
s2clear: Clear chart
:::

Takeaway: an indicator only tells which stretch the pH falls in, not an exact value; pick one whose change range covers the pH you care about. Colours are simplified illustrations that vary with concentration and light. {#s2result .readout i18n=text}

::: strings
s2ro: {ind}: a sample at pH {ph} shows {desc}; {n} samples recorded.
s2d0: the colour below its change range (acid side)
s2d1: a transition colour inside its change range
s2d2: the colour above its change range (alkaline side)
:::

## Drip sodium hydroxide into hydrochloric acid — how does the pH move? {#step3 h2=s3t}

::: strings
nav3: 3 Neutralising
:::

Step 3 · Neutralising {#s3k .step-kicker i18n=text}

This step asks: add 0.1 mol/L sodium hydroxide to 20 mL of 0.1 mol/L hydrochloric acid — how does pH change and where does it jump? H⁺ from the acid combines with OH⁻ from the base to make water: **neutralisation**. When the added base exactly cancels the acid you are at the **equivalence point** (pH 7 for a strong acid with a strong base). Drag the volume added and watch the dot on the curve and the beaker colour. {#s3e .explain}

::: html step3-1
s3stage: Curve: x is base added (mL), y is pH; the orange dot is now; the beaker on the right is coloured by universal indicator
s3canvas: Titration curve: pH rises slowly, then jumps steeply past 7 near 20 mL
s3v: Sodium hydroxide added
s3reset: Start over
:::

Takeaway: near the equivalence point pH changes extremely steeply, so a drop or two flips it from acidic to alkaline. Holds for strong acid + strong base, additive volumes, 25 °C; weak acids and bases give different curves. {#s3result .readout i18n=text}

::: strings
s3ro: {v} mL of base added: {state}; pH = {ph}.
s3before: {x} mmol of acid still unneutralised
s3eq: exactly neutralised (equivalence point), only salt and water left
s3after: {x} mmol of base in excess
:::

## Keep diluting an acid — does its pH cross 7 and become alkaline? {#step4 h2=s4t}

::: strings
nav4: 4 Dilute to base?
:::

Step 4 · Dilute to base? {#s4k .step-kicker i18n=text}

This step asks: dilute a pH 2 acid again and again — does the pH keep rising past 7? **Diluting** means adding water to lower the concentration. The more dilute the acid, the smaller [H⁺] and the closer pH gets to 7, but water itself supplies about 10⁻⁷ mol/L of H⁺, so no amount of dilution turns an acid into a base. Drag the dilution exponent (10 to the e) and watch the curve hug 7. {#s4e .explain}

::: html step4-1
s4stage: Curve: x is the dilution exponent e (diluted 10^e times), y is pH; the dashed line is pH = 7; the beaker on the right is coloured by universal indicator
s4canvas: Dilution curve: pH rises with dilution and approaches 7 but never crosses it
s4reset: Back to undiluted
:::

Takeaway: diluting an acid only pushes the pH toward 7, never past it. Holds for a strong acid starting at pH 2 with [H⁺] = 10⁻² / 10^e + 10⁻⁷; the approximation ignores activity and temperature effects. {#s4result .readout i18n=text}

::: strings
s4e2: Dilution exponent e
s4ro: Diluted 10^{e} times: [H⁺] ≈ {h} mol/L, pH = {ph}, {kind}.
:::

## Explain pH to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: pH lays acidity out on one 0–14 ruler: 7 is neutral, lower is more acidic, higher is more alkaline, and each step is a factor of 10.
f1t: The ruler
f1b: pH = −log₁₀[H⁺]; below 7 acidic, 7 neutral, above 7 alkaline (steps 0–1).
f2t: Reading it
f2b: Indicators give a pH range; near the equivalence point pH is very steep (steps 2–3).
f3t: The limit
f3b: Diluting an acid approaches 7 forever but never becomes a base (step 4).
modelT: Honest model notes
model1: Everyday pH values are typical approximations; real ones vary with concentration and brand.
model2: Indicator colours are illustrations; change ranges use common textbook values.
model3: Only strong acids and bases at 25 °C in water are handled here; weak acids, buffers and temperature effects on water’s ionisation live on other pages.
nextT: Keep going (on this site)
l1: Exponentials & Logs · step 2: why a logarithm turns “×10” into “+1”
l2: Buffer Capacity · step 2: how pH is held steady when acid or base is added
l3: Acid–Base Equilibrium · step 0: molecules moving both ways in a weak acid
:::

::: strings
it0: Battery acid
it1: Lemon juice
it2: Vinegar
it3: Black coffee
it4: Pure water
it5: Baking soda solution
it6: Soapy water
it7: Household ammonia
it8: Bleach
ind0: Universal indicator
ind1: Litmus
ind2: Phenolphthalein
ind3: Methyl orange
kindAcid: acidic
kindNeutral: neutral
kindBase: alkaline
unitMol: mol/L
unitMl: mL
s1len: length scale
s1lin: linear comparison
lblChart: Colour chart of your recorded samples
:::
