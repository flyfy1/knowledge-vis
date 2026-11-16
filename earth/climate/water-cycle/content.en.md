---
lang: en
---

::: strings
back: ← Knowledge Index
category: Earth & Space
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: The Water Cycle · One Drop’s Journey
tagline: The Sun warms the sea, vapour rises into cloud, rain falls on the hills and rivers run to the sea: water moves between ocean, air and land, but the total stays the same.
:::

## Does warmer air make the sea evaporate faster? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Sun warms the sea
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: SUN WARMS THE SEA
:::

This step answers: how does water get into the air? The Sun warms the sea surface and liquid water turns into gaseous water vapour, a process called **evaporation**. The most vapour the air can hold (the saturation vapour pressure) rises steeply with temperature. Drag the temperature and watch the dot on the curve and the strength of evaporation (20 °C is the reference, 1). {#s0e .explain}

::: html step0-2
s0cv: Left: Sun and sea-surface evaporation; right: saturation vapour pressure against temperature
temp: Air temperature (°C)
:::

::: strings
s0ro: {T} °C: saturation vapour pressure {es} hPa; evaporation is {rel} times that at 20 °C.
:::

## Why does rising vapour turn into cloud? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Cloud forms
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: CLOUD FORMS
:::

This step answers: at what height does cloud begin? As moist air rises it cools by about 9.8 °C per kilometre, while the dew point of its vapour (the temperature where vapour starts to condense) falls by only about 1.8 °C. When the air temperature drops to the dew point, vapour condenses into tiny droplets: that is the **cloud base**. Drag the surface temperature and dew point and watch where the two lines cross. {#s1e .explain}

::: html step1-2
s1cv: Rising air’s temperature line and dew-point line, crossing at the cloud base
t0: Surface temperature (°C)
td0: Surface dew point (°C)
:::

::: strings
s1ro: Surface {T0} °C, dew point {Td} °C: they differ by {d} °C, so the cloud base is about {z} m up (where they cross, after rising about {zk} km).
s1roDry: Temperature equals dew point: the air is already saturated, so fog forms at the ground and the cloud base is at 0 m.
:::

## When do the droplets in a cloud fall? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Rain
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: RAIN
:::

This step answers: why does a cloud rain? Tiny cloud droplets are so light they hang in the air; as more vapour condenses in, droplets merge and grow, and once big enough they fall as rain. Press “Add a unit of vapour”: the water in the cloud grows one step at a time, and at 8 units it rains (the threshold is illustrative). {#s2e .explain}

::: html step2-2
s2cv: Water gathering in a cloud until it rains
vapor1: Add a unit of vapour
vapor5: Add five units
reset2: Reset
:::

::: strings
s2ro: {c} / {th} units of water in the cloud; it has rained {n} times, {tot} units in all.
s2roRain: It just reached {th} units and rained! The cloud now holds {c}.
:::

## Once rain lands on the ground, how long until it is back in the sea? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Back to the sea
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: BACK TO THE SEA
:::

This step answers: where does the water that lands go? Some quickly runs off along rivers (**runoff**); some soaks into the soil as groundwater and seeps out slowly (about 5% a day). Drag the fraction that soaks in and watch the water returned to the ocean build up day by day; the dashed line is the case where everything runs off. {#s3e .explain}

::: html step3-2
s3cv: Cumulative return to the ocean of 100 units of rain
inf: Fraction soaking in (%)
day: Days elapsed
:::

::: strings
s3ro: {f}% soaks in: by day {d}, {r} units (of 100) are back in the ocean; {run} by runoff, {gw} released slowly from groundwater.
:::

## Over the whole cycle, does the total change? How much settles in each place? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Whole cycle
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: WHOLE CYCLE
:::

This step answers: what happens when evaporation, rain and runoff are linked? Three “reservoirs”: ocean O, air A and land L, 1000 units of water in all. Each day the ocean evaporates into the air, the air rains (30% on land, 70% back on the ocean), and land water runs off to the ocean. Press Start to watch all three settle to steady values while the total never changes; drag the temperature to change evaporation. {#s4e .explain}

::: html step4-2
s4cv: Top: share in the three reservoirs; bottom: water in air and land over the days
reset4: Reset to day 0
:::

::: strings
play: Start
pause: Pause
s4ro: Day {d}: ocean {o}, air {a}, land {l}, total {tot}; steady values: ocean {os}, air {as}, land {ls}.
:::

## In a warmer world, does the air hold more water? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how does the cycle change when it gets warmer? Using the model of step 4, drag the temperature and read the water in the air at steady state. Because air can hold more vapour as it warms, evaporation is faster and the steady amount of water in the air is larger. {#s5e .explain}

::: html step5-2
s5cv: Steady water in the air at different temperatures
tempF: Air temperature (°C)
recapTitle: Recap
recap1: The Sun heats water into vapour; rising vapour cools to its dew point and forms cloud.
recap2: Cloud droplets merge and fall as rain; runoff and groundwater carry water back to the sea.
recap3: The total water in the cycle is constant; how much settles in each place depends on how fast evaporation and rain go.
modelTitle: Scope and limits of this model
modelText: This is a simplified three-reservoir model (ocean, air, land) with illustrative rate constants, not observations; the real cycle also includes ice, plant transpiration and deep groundwater. Saturation vapour pressure uses the Magnus empirical formula, and the cloud-base rule applies to rising unsaturated air.
linkPart: → Particles & States: what molecules do in evaporation and condensation
linkClim: → Climate Energy Budget: where the Sun’s energy goes
linkFb: → Climate Feedback: the feedback that water vapour adds when it warms
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: {T} °C: the steady water in the air is {a} units, {pct}% more than the {a20} units at 20 °C.
docTitle: The Water Cycle · One Drop’s Journey
:::
