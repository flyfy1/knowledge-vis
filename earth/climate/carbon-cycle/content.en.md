---
lang: en
---

::: strings
back: ← Knowledge Index
category: Earth & Space
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: The Carbon Cycle · Where the Atmosphere’s Carbon Goes
tagline: A ledger of five carbon reservoirs shows why natural flows balance, why a small extra emission accumulates, and why the atmosphere falls slowly after emissions stop.
docTitle: The Carbon Cycle · Where the Atmosphere’s Carbon Goes
:::

## In which reservoirs does Earth’s carbon sit, and how much is in each? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Stocks and flows
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Stocks and flows
:::

<b>This step answers: how big is each reservoir, how fast does carbon move through it, and how long does it stay?</b> Units are GtC (billions of tonnes of carbon). Residence time = stock ÷ yearly outflow. The air holds only about 590 GtC but 210 GtC flows in and out each year, so a carbon atom stays in the air for just a few years; the deep ocean holds 37,000 GtC and keeps it for centuries. Select a reservoir to see arrow thickness (flow) and the readout. {#s0e .explain}

::: html step0-2
s0cv: Five reservoir boxes (air, land, surface ocean, deep ocean, fossil fuel) and the carbon-flow arrows between them
box_A: Air
box_L: Land
box_S: Surface sea
box_D: Deep ocean
box_F: Fossil
:::

::: strings
note_A: about 278 ppm before industry
note_L: land plants, litter and soils
note_S: dissolved inorganic carbon
note_D: mixes slowly
note_F: the arrow shows today’s burning; the natural flow is zero
lblSize: box size = stock (log scale); numbers in GtC
s0ro: {name}: stock {stock} GtC, inflow {inn}, outflow {out} GtC/yr, residence time about {turn} yr ({note}).
:::

## If photosynthesis and respiration differ by only 3%, what happens to the air? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Small imbalance
:::

::: html step1-1
s1step: "Step 1 · "
s1k: A small imbalance in big flows
:::

<b>This step answers: how much can a small difference in huge flows matter?</b> Land takes up about 120 GtC and releases about 120 GtC each year. If the two differ by just p%, the yearly net is 120×p% GtC, and about 2.12 GtC corresponds to 1 ppm in the air. The orange line shows 50 years of that difference (ignoring feedbacks, valid only over the short term); the red line is the scale of today’s fossil emissions (about 10 GtC per year). {#s1e .explain}

::: html step1-2
s1cv: Atmospheric CO₂ over 50 years: the natural-imbalance line against the emissions line
lblImbPct: Photosynthesis above respiration by p (%)
:::

::: strings
lblHuman: fossil emissions 10 GtC/yr
lblImb: natural imbalance
axYear: years
axPpm: CO₂ (ppm)
dirDown: the air falls
dirUp: the air rises
dirFlat: the air is unchanged
s1ro: Difference {p}%: net flow {net} GtC/yr ≈ {ppm} ppm/yr ({dir}), equal to {share}% of today’s fossil emissions.
:::

## If we add some carbon each year, how much does atmospheric CO₂ rise? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Emissions
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Emissions accumulate
:::

<b>This step answers: how does the concentration climb under steady emissions?</b> The model includes exchange among air, land and ocean: emissions E (GtC per year) enter the air, part is taken up by land plants (helped by CO₂ fertilisation) and the ocean, and the rest stays. The share that stays is the “airborne fraction”. Drag the emissions and the year; the readout gives ppm and the airborne fraction. {#s2e .explain}

::: html step2-2
s2cv: Atmospheric CO₂ (ppm) rising under constant emissions with the pre-industrial level dashed
lblE: Yearly emissions E (GtC)
lblYr: Years t
:::

## Of all the carbon emitted, how much ends up in the air, on land and in the ocean? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Where it goes
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Where the carbon goes
:::

<b>This step answers: where does the emitted carbon actually go?</b> Carbon is conserved: cumulative emissions = air gain + land gain + ocean gain (surface plus deep). Drag the year to see the three shares change; in the readout the three parts add up to the cumulative emissions. Mixing into the deep ocean takes decades to centuries, so the ocean’s share grows with time. {#s3e .explain}

::: html step3-2
s3cv: A stacked bar splitting cumulative emissions into air, land and ocean
:::

## If emissions stopped suddenly, would CO₂ fall back right away? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 After stopping
:::

::: html step4-1
s4step: "Step 4 · "
s4k: After emissions stop
:::

<b>This step answers: how does the concentration fall once emissions stop?</b> Drag the stop year; before it, 10 GtC is emitted every year. After the stop, land and the surface ocean absorb part quickly while the rest depends on the deep ocean’s slow uptake, so the fall is fast at first and slow later; a considerable share is still in the air a hundred years on (cyan dot marks 100 years after stopping). {#s4e .explain}

::: html step4-2
s4cv: CO₂ over 300 years when emissions stop in the chosen year
lblStopYr: Stop year
:::

::: strings
s2ro0: E = 0: at year {yr} the air is at {ppm} ppm, the pre-industrial level.
s2ro: E = {E} GtC/yr, year {yr}: air at {ppm} ppm; cumulative emissions {cum} GtC; airborne fraction {af}%.
lblAtm: Air
lblLand: Land
lblOcean: Ocean
lblEmitted: cumulative emissions {c} GtC
lblWhere: cyan: stays in the air · green: land · blue: ocean
s3ro0: No emissions means nothing to track.
s3ro: E = {E}, year {yr}: cumulative emissions {cum} GtC = air {a} + land {l} + ocean {o} = {sum} GtC.
lblStop: stop
s4ro: Stop at year {ys}: air at {pk} ppm at that moment; 100 years later {later} ppm, still {rem}% of the original excess; at year 300 {end} ppm.
:::

## How different is the air after 150 years under different emission paths? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Scenarios
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · scenarios
:::

<b>This step answers: how does the emission path decide the future concentration?</b> Four paths: keep emitting 10, halve at year 30, decline linearly to zero over fifty years, stop immediately. The thick line is the one you selected; the readout gives the peak, the level at year 150 and the cumulative emissions. The later emissions are cut, the more is emitted in total and the more stays in the air. {#s5e .explain}

::: html step5-2
s5cv: CO₂ over 150 years under four emission paths with the selected path in bold
scKeep: Keep emitting 10
scHalve: Halve at year 30
scNetZero: Fall to zero over 50 years
scStop: Stop immediately
recapTitle: Recap
recap1: Carbon flows in vast amounts among air, land and ocean, and in the natural state inflow and outflow cancel.
recap2: Human emissions are a small addition to huge flows but accumulate every year; roughly half stays in the air and the rest is gradually taken up by land and ocean.
recap3: The decline after stopping is slow because uptake by the deep ocean takes decades to centuries.
modelTitle: Scope and limits of the model
modelText: This is a five-box toy model: first-order exchange, linear “CO₂ fertilisation” (β = 0.15) and an ocean buffer factor of 10; it is tuned to a pre-industrial balance and an airborne fraction near 45–50%, and shows trends only. It omits climate feedbacks, ocean acidification, land-use change, rock weathering and permafrost, and cannot predict concentrations in a given year.
link0: → Photosynthesis: how plants turn CO₂ into sugar
link1: → Energy Pyramid: carbon and energy moving along the food chain
link2: → Climate Energy Ledger: how the greenhouse effect changes the balance
link3: → Climate Feedback: how warming amplifies or damps itself
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: {name}: peak {pk} ppm, {end} ppm at year 150, cumulative emissions {cum} GtC.
:::
