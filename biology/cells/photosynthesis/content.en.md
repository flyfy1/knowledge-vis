---
lang: en
---

::: strings
pageTitle: Photosynthesis · A Sugar Factory Run by Light
back: ← Knowledge Index
navLabel: Photosynthesis lesson steps
tagline: Put a sprig of pondweed under a desk lamp and strings of tiny bubbles rise from its leaves. What is in them? What does a leaf use as raw material, and what does it make? Does more light always mean faster work? In seven steps you will run a classic pondweed experiment, balance the equation yourself, work out how much of a lump of sugar's weight comes out of thin air, find the "short plank" that limits how fast the leaf can work, and keep a plant's accounts for a whole day.
nav0: 0 Bubbles
nav1: 1 Balance
nav2: 2 Where the mass comes from
nav3: 3 More light?
nav4: 4 Short plank
nav5: 5 A day's accounts
nav6: 6 Wrap-up
foot: Written independently by Claude Code (claude-opus-5-5).
:::

## Why does pondweed under a lamp give off bubbles? Does a closer lamp mean more bubbles? {#step0 h2=s0t}

Step 0 · Start with an experiment {#s0k .step-kicker i18n=text}

The question here: what are the bubbles, and how does their rate depend on light? Put a sprig of pondweed (hornwort, say) in a beaker of water and light it from the side with a desk lamp. The closer the lamp, the stronger the light on the leaves: light intensity falls with the square of distance, so doubling the distance leaves only a quarter of the light. In the picture below the lamp is on the left and the beaker of pondweed on the right; an upside-down test tube collects the gas that rises. **Bubbles per minute** serves as a gauge of how fast the leaves are working. {#s0e .explain}

::: html step0-1
c0a: Schematic of a lamp shining on pondweed
lampDist: Lamp distance from the beaker
lampOff: Switch the lamp off
splint: Test the gas with a glowing splint
:::

What to try: drag only the lamp distance, slowly from 100 cm to 20 cm, and watch the bubbles go from none to dense. Notice that once the lamp is inside about 28 cm, moving it closer adds no more bubbles; steps 3 and 4 explain why. Then switch the lamp off and the bubbles stop. Finally test the gas with the splint. Bubble counts are illustrative values from the model, not measurements from one real experiment. {#s0hint .hint i18n=text}

::: strings
c0title: Lamp {d} cm away · light about {I}% of full sun
c0titleOff: Lamp off · light 0%
lampOn: Switch the lamp on
s0readout: Lamp at {d} cm → the pondweed gets about {I}% of full sunlight. It gives off about {b} bubbles a minute (illustrative conversion, computed from the rate model introduced later).
s0dark: Lamp off: light is 0 and the pondweed gives off no bubbles.
splintYes: The moment the splint goes into the tube it bursts back into flame: the gas is **oxygen**. Oxygen feeds burning; ordinary air is not rich enough in it, so only a nearly pure oxygen sample relights a glowing splint.
splintNo: There are hardly any bubbles right now, so the tube holds no gas worth testing. Move the lamp closer or switch it on, and let the weed bubble for a while first.
:::

## What does a leaf make sugar from, and do the atoms add up exactly? {#step1 h2=s1t}

Step 1 · Inputs and outputs {#s1k .step-kicker i18n=text}

The question here: the last step released oxygen, so where does it come from, and what does the leaf make? Photosynthesis takes **carbon dioxide** (CO₂) from the air and **water** (H₂O) drawn up by the roots, and produces **glucose** (C₆H₁₂O₆, a sugar) and **oxygen** (O₂). It needs light and happens inside **chloroplasts**, the small green grains in leaf cells. A chemical reaction only regroups atoms; it never creates or destroys them, so each kind of atom must appear the same number of times on both sides of the equation. Making that true is called **balancing**. Drag the three coefficients (numbers of molecules; glucose is fixed at one) until each element's two bars in the chart below are the same height. {#s1e .explain}

::: html step1-1
c1a: Atom counts on each side of the equation
lgC: carbon atom C
lgH: hydrogen atom H
lgO: oxygen atom O
coefA: Number of CO₂
coefB: Number of H₂O
coefD: Number of O₂
solve: Balance it for me
reset1: Back to 1, 1, 1
:::

What to try: first adjust only the number of CO₂ until carbon matches (glucose holds 6 carbons); then the number of H₂O until hydrogen matches; finally the number of O₂ until oxygen matches. Each bar is a stack of dots, one dot per atom. Any order works in the end, but this one lets you watch a single element at a time. {#s1hint .hint i18n=text}

::: strings
c1title: Two bars per element: left bar = inputs side, right bar = products side
eqLight: light, chloroplast
s1readout: Carbon: {lc} left, {rc} right; hydrogen: {lh} left, {rh} right; oxygen: {lo} left, {ro} right. {verdict}
s1ok: All three elements match: 6 CO₂ and 6 H₂O become 1 glucose and 6 O₂.
s1no: Not balanced yet: {bad}.
s1sep: ", "
elC: carbon
elH: hydrogen
elO: oxygen
:::

## How much of a lump of sugar's weight comes from the air? {#step2 h2=s2t}

Step 2 · Where the mass comes from {#s2k .step-kicker i18n=text}

The question here: is the weight a plant puts on made from soil, water or air? In the 1600s the Flemish scientist Jan Baptist van Helmont planted a willow sapling of about 2.3 kg in a tub of weighed soil and gave it nothing but water. Five years later the willow weighed about 76.7 kg, while the soil had lost only about 57 g, so the weight did not come from the soil. He concluded it came from water; we can now check with the equation you just balanced. Each atom has its own mass: carbon 12, hydrogen 1, oxygen 16 (all in the same unit, for comparison). The carbon and oxygen in glucose both come from CO₂; only the hydrogen comes from water. Place a bet, then drag the slider below to see the ledger. {#s2e .explain}

::: html step2-1
q2: Your bet: about how much of a glucose molecule's weight comes from CO₂ in the air?
q2a: about 7%
q2b: about 50%
q2c: about 93%
check: Check
c2a: Mass ledger of inputs and products
lgCO2: carbon dioxide
lgH2O: water
lgO2: oxygen released
lgSugarC: sugar mass from CO₂
lgSugarW: sugar mass from water
sugarMass: Glucose made (grams)
:::

What to try: drag the glucose slider and watch the two columns stay exactly equal (mass is conserved). Then look at the two colours inside the sugar part of the products column: the share from CO₂ stays at about 93% however much sugar is made. So most of a willow's dry weight is carbon and oxygen taken in from the air. Much of van Helmont's weight gain was also water held in the tree; this ledger is about the make-up of the sugar itself. {#s2hint .hint i18n=text}

::: strings
fb2right: Right. In 180 g of glucose, 72 g of carbon and 96 g of oxygen come from CO₂, 168 g in all, or {share}%; only 12 g of hydrogen comes from water.
fb2wrong: Not quite. Drag the slider below and read the ledger: only glucose's hydrogen comes from water; its carbon and oxygen come from CO₂.
fb2none: Choose an answer first.
c2in: inputs
c2out: products
c2unit: grams
s2readout: Making {m} g of glucose uses {co2} g of CO₂ and {w} g of water and releases {o2} g of oxygen. Both sides total {tot} g: mass is conserved. Of the sugar, {fc} g ({share}%) comes from CO₂ and {fw} g from water.
:::

## Does stronger light always mean faster sugar-making, and does it keep speeding up? {#step3 h2=s3t}

Step 3 · Light {#s3k .step-kicker i18n=text}

The question here: how exactly does sugar-making speed depend on light? We use a simplified model. At the CO₂ level of ordinary air (about 420 ppm, meaning 420 parts in every million parts of air), the sugar-making rate (the **gross photosynthesis rate**) first rises in proportion to light, then stops rising once the CO₂ supply cannot keep up; this is called **light saturation**. Meanwhile the leaf cells are always carrying out **respiration**: they burn part of their sugar for energy, day and night. What the leaf actually banks is the **net photosynthesis rate** = gross rate − respiration. Rates are in illustrative units, for comparison only. {#s3e .explain}

::: html step3-1
c3a: Photosynthesis rate against light intensity
lgGross: gross photosynthesis
lgResp: respiration
lgNet: net photosynthesis
lgTried: light levels you tried
lightPct: Light (% of full sun)
sweep3: Sweep from 0 to 100%
clearTried: Clear the tried points
:::

What to try: press "Sweep from 0 to 100%" and watch three things. At first the green net line sits below zero (a loss). Above about 8% light the net turns positive and bubbles start. At 50% the cyan line levels off and stays flat however bright it gets. Dragging the slider leaves a white dot at each light level you try. The way bubbles stopped increasing once the lamp in step 0 came within about 28 cm is this same bend at 50% light. Real leaves round off the corner; drawing it sharp is a simplification. {#s3hint .hint i18n=text}

::: strings
c3title: Rate (illustrative units) vs light · CO₂ 420 ppm
c3x: light (% of full sun)
s3readout: Light {I}%: gross rate {g}, respiration {r}, net {n}. {state} About {b} bubbles a minute.
st_dark: Net is negative: the leaf makes less sugar than it burns, so it is running at a loss and releases no oxygen bubbles.
st_comp: Break-even: sugar made equals sugar burned (this light level is the compensation point, {Ic}% in this model).
st_rise: Light is the scarcest input: more light still raises the rate.
st_sat: Light-saturated: from {Is}% upward, extra light no longer raises the rate; the scarcest input is now CO₂.
:::

## Is it light or CO₂ that is short? Which one is worth adding? {#step4 h2=s4t}

Step 4 · The short plank {#s4k .step-kicker i18n=text}

The question here: after light saturation in the last step, why does extra light do nothing? Picture the rate as how much water a barrel can hold. The barrel has two planks, one whose height is set by light and one set by CO₂, and the water can only rise to the top of the shorter plank. This is the idea of a **limiting factor**: of several conditions, the scarcest one decides (a simplifying rule proposed by the British plant physiologist F. F. Blackman in 1905). The chart titled "Two planks" shows both planks and the water level; the other chart shows rate against light for several CO₂ levels. {#s4e .explain}

::: html step4-1
c4a: Rate against light for several CO₂ levels
c4b: Heights of the light and CO₂ planks with the water level
lgLightPlank: light plank
lgCO2Plank: CO₂ plank
lgWater: actual rate (water level)
lgOther: curves for other CO₂ levels
co2ppm: CO₂ concentration (ppm)
:::

What to try: keep light at 80% and drag CO₂ from 420 to 1000 ppm. The CO₂ plank rises and the water rises with it, until it passes the light plank; after that more CO₂ adds nothing and light becomes the scarce input. Now lower light to 30%: adding CO₂ does nothing at all. The "adds +…" figures in the readout tell you directly which input is worth adding. Greenhouses that pump in CO₂ (often to 800–1000 ppm) are raising the CO₂ plank, and it only pays when there is enough light. {#s4hint .hint i18n=text}

::: strings
c4title: Gross rate · thin lines: CO₂ 200 / 420 / 1000 ppm
c4btitle: Two planks (illustrative units)
s4readout: Light plank {L}, CO₂ plank {K} → actual rate {g}. {who} 10% more light adds +{dl}; 100 ppm more CO₂ adds +{dc}.
who_light: Light is the scarcest input.
who_co2: CO₂ is the scarcest input.
who_both: The planks are level; both are equally short.
:::

## Over a whole day, does a plant come out ahead on sugar or behind? {#step5 h2=s5t}

Step 5 · A day's accounts {#s5k .step-kicker i18n=text}

The question here: sugar is made in daylight and burned around the clock, so what is the day's **net income**? The upper part of the chart below shows light across a day (on a sunny day, sunrise at 6, brightest at 12, sunset at 18). The lower part adds up the net rate moment by moment into a **running net income**: rising means saving sugar, falling means spending it. Everything is computed with the same model as before, in "illustrative units × hours". Press "Play the day", then change the weather or the CO₂ level and compare. {#s5e .explain}

::: html step5-1
c5a: Light and running net income over one day
weather: Weather
sunny: sunny
cloudy: overcast (light only 30% of a sunny day)
air: CO₂ in the air
air420: about 420 ppm (outdoors)
air1000: 1000 ppm (greenhouse enrichment)
play5: Play the day
clearRuns: Clear comparison curves
:::

What to try: play a sunny day at 420 ppm first and watch the lower curve: it slides slowly overnight, turns upward less than half an hour after sunrise, and slides again after dusk. Then play an overcast day: the curve barely gets off the floor and the day ends with only a small surplus. Finally try "overcast + 1000 ppm": exactly the same as overcast at 420 ppm, because on an overcast day light is the scarce input and extra CO₂ does nothing. Each run stays on the chart and is listed below for comparison. {#s5hint .hint i18n=text}

::: strings
c5top: light (% of full sun)
c5bot: running net income (illustrative units·h)
c5x: time of day (h)
runLabel: {sky} · {co2} ppm: net income {net}
skySun: Sunny
skyCloud: Overcast
s5progress: "Played up to {h}:00. "
s5readout: {prog}Sugar made over the day {made}, burned by respiration {used}, net income {net}. Net photosynthesis is positive for about {pos} hours; at night there is no light and the account keeps sliding down.
:::

## The seven steps in one paragraph {#step6 h2=s6t}

Step 6 · Wrap-up {#s6k .step-kicker i18n=text}

::: html step6-1
s6fin: The bubbles pondweed gives off in light are **oxygen** (step 0). Inside its chloroplasts a leaf uses light to regroup 6 CO₂ and 6 H₂O into 1 glucose and 6 O₂, with every atom accounted for (step 1); about 93% of the sugar's weight comes from CO₂ in the air (step 2). The sugar-making rate rises with light until light saturation, where CO₂ holds it back (step 3); the scarcest condition decides, and adding anything else is wasted (step 4). Leaves respire all day and night, so a plant only grows when the sugar banked in daylight outweighs what is burned overnight (step 5).
formula: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ (needs light, in chloroplasts)
boundary: Model limits: the rate model is a "take the smaller" simplification with illustrative parameters. Real leaves round off the corner, and temperature, leaf age and the opening of leaf pores all matter; very strong light can even damage leaves (photoinhibition). None of this is covered here. Respiration is held constant and bubble counts are converted from the net rate, both for illustration. Strictly, all the oxygen released comes from water (shown with oxygen-isotope labelling), and the full equation is 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O: six extra waters on each side, and the atoms still balance. The step 2 result about where the sugar's weight comes from is unaffected.
linksTitle: Where to go next
lk1: → The Cell, step 2: where chloroplasts sit inside a cell
lk2: → Conservation of mass, step 1: count the atoms, none lost in a reaction
lk3: → The energy pyramid, step 0: how the sugar plants bank feeds a whole food chain
lk4: → The carbon cycle, step 0: carbon stocks and flows between air, plants and ocean
:::
