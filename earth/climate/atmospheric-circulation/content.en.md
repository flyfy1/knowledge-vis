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
pageTitle: Atmospheric Circulation & Monsoons · Where Winds Come From
tagline: The equator gets more sun than the poles, so air turns over in loops; Earth’s spin twists them into three cells and trade winds, and land–sea contrast flips the wind with the season.
docTitle: Atmospheric Circulation & Monsoons · Where Winds Come From
:::

## Why does the same beam of sunlight get thinner toward the poles? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Uneven heating
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Uneven heating
:::

<b>This step answers: how does latitude set the heat each patch of ground receives?</b> A beam of fixed width hitting the ground at latitude φ spreads over 1/cos φ times the area, so heat per area falls roughly as cos φ. Drag the latitude and watch the spread-out beam and the point on the orange curve move together. {#s0e .explain}

::: html step0-2
s0cv: Curve of mean heating versus latitude with a diagram of a beam spreading out
latLbl: Latitude (°, north positive)
:::

## With a hot equator and cold poles, how does air start to circulate? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 One-cell loop
:::

::: html step1-1
s1step: "Step 1 · "
s1k: One-cell loop
:::

<b>This step answers: what flow can a temperature difference alone drive?</b> Warm air at the equator rises, flows poleward aloft, cools and sinks, and returns along the ground to fill the gap. A bigger contrast turns the loop faster (a toy relation here: speed grows with the square root of the contrast). Set the contrast to 0 and the loop stops. {#s1e .explain}

::: html step1-2
s1cv: One-cell loop: rising at the equator, poleward aloft, sinking at the poles, returning at the surface
dtLbl: Equator–pole contrast (K)
play: Play air parcels
reset: Reset
:::

::: strings
pause: Pause
axLat: latitude
axHeat: relative heating
beamNote: the same beam spread over {f}× the area
s0ro: Latitude {lat}°: cos φ = {i}; the beam spreads over {f}× the area, so heat per area is about {pct}% of the equator’s.
eqLabel: equator
polN: N pole
polS: S pole
noFlow: No contrast, nothing drives the flow
flowOn: turning
flowOff: at rest
s1ro: Contrast {dT} K: loop speed {v} (toy units), state: {state}.
north: north
south: south
west: west
east: east
pushLbl: pressure push
windLbl: actual wind
noDeflect: no deflection
deflR: deflected right
deflL: deflected left
easterly: easterly (blowing toward the west)
westerly: westerly (blowing toward the east)
s2ro: Latitude {lat}°: f = {f} s⁻¹, {dir}; the surface air flowing toward the equator or pole therefore becomes an {res}.
:::

## Why isn’t a wind blowing toward the equator a straight north–south wind? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Coriolis
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Coriolis deflection
:::

<b>This step answers: how does Earth’s spin bend the wind?</b> Spin deflects moving air to the right in the northern hemisphere and to the left in the southern, with strength proportional to f = 2Ω sin φ (Ω ≈ 7.292×10⁻⁵ s⁻¹ is the spin rate). At the equator f = 0, so there is no deflection. Cyan is the direction the pressure push alone would give; orange is the deflected wind. {#s2e .explain}

::: html step2-2
s2cv: Arrows showing the pressure-driven direction and the deflected wind at the chosen latitude
:::

## Which way does the surface wind blow in each latitude band? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Three cells
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Three cells
:::

<b>This step answers: how do the real wind belts come from loops plus deflection?</b> Spin breaks the single loop into three cells: Hadley (0–30°), Ferrel (30–60°) and polar (60–90°). In each, the surface north–south flow (cyan) is deflected into an east–west part (orange): trade winds, westerlies, polar easterlies. Drag the latitude; the readout lists the belt, wind direction and rising or sinking air at the line. {#s3e .explain}

::: html step3-2
s3cv: Latitude bands with three cells, surface wind arrows and rising and sinking markers
legend3a: cyan: surface north–south flow · orange: deflected east–west wind
legend3b: ↑ rising air · ↓ sinking air
:::

::: strings
belt_trade: trade-wind belt (Hadley cell)
belt_westerlies: westerlies (Ferrel cell)
belt_polar: polar easterlies (polar cell)
toNorth: toward the north
toSouth: toward the south
vert_rise: air rises here
vert_sink: air sinks here
vert_none: no strong vertical motion here
s3ro: Latitude {lat}°: {belt}; surface flow {mer}, deflected into {zon}; {vert}.
sea: sea
land: land
aloft: return flow aloft
surf: surface wind
w_onshore: wind blows from sea to land
w_offshore: wind blows from land to sea
w_calm: weak wind
summerMon: summer monsoon
winterMon: winter monsoon
calmMon: transition season
s4ro: Month {m}: land minus sea {d} K (toy value) → {wind} ({mon}).
wet: wet
dry: dry
k_wet: rainy
k_dry: dry
k_mid: in between
s5ro: Latitude {lat}°, shift {s}°: wetness index {wi} (schematic 0–1) → {kind}.
:::

## Why does the wind at a coast reverse with the seasons? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Monsoon
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Monsoon
:::

<b>This step answers: how does land–sea contrast decide the wind direction?</b> Land warms and cools faster than the sea. In summer the land is hotter, its air rises, surface pressure drops and the wind blows from sea to land (summer monsoon); in winter it reverses. The small curve below is the land-minus-sea difference (a toy sinusoid peaking in July). Drag the month: the arrows change direction and length with the difference. {#s4e .explain}

::: html step4-2
s4cv: Coastline cross-section with surface and upper-level wind arrows and the yearly temperature-difference curve
monLbl: Month
:::

## Why do deserts and rainforests sit at particular latitudes? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wet and dry
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale
:::

<b>This step answers: how do the wind belts decide where it rains?</b> Rising air cools into cloud and rain (equator, 60°); sinking air warms and dries (30°, the poles). The “wetness index” below is only a schematic cosine, not climate data. Drag “seasonal shift” to move the wet bands north or south as a rough picture of the tropical rain belt following the Sun. {#s5e .explain}

::: html step5-2
s5cv: Schematic wetness index against latitude with the chosen latitude marked
shLbl: Seasonal shift (°)
recapTitle: Recap
recap1: Uneven heating → temperature contrast → circulation: rising at the equator, sinking at the poles.
recap2: Coriolis deflection from spin twists north–south flow into trade winds, westerlies and polar easterlies, and splits one loop into three cells.
recap3: Land–sea contrast reverses the monsoon with the season; rising belts are wet and sinking belts are dry.
modelTitle: Scope and limits of the model
modelText: This is an idealised Earth without continents. The toy relations show direction and trend, not observations. Real circulation also depends on terrain, land–sea layout, latent heat, jet streams and eddies, and the real rain-belt shift is far more complex than the schematic here.
link0: → Seasons & Orbit: how the overhead Sun moves north and south
link1: → Climate Energy Ledger: how latitude changes the heating
link2: → Latitude & Longitude: how latitude is measured
:::

Page complete. {#done .readout .success i18n=text}
