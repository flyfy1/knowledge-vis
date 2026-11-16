---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Earth & Space
stageBadge: Junior High
foot: Contour Lines · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Contour Lines · Slice a Mountain and Lay It Flat
pageTitle: Contour Lines
tagline: The rings on a map come from slicing a hill at equal heights and looking straight down: where the rings crowd together, the ground is steep.
:::

## Paper is flat, a hill is 3D — where do the rings come from? {#step0 h2=s0t}

::: strings
nav0: 0 Sliced hill
:::

Step 0 · Sliced hill {#s0k .step-kicker i18n=text}

This step asks: how are contour lines made? Imagine slicing the hill with a horizontal plane at height H: where the plane meets the surface, every point has altitude exactly H, and that curve is a **contour line**. Slice at equal height steps, look straight down, and you get rings. Drag “slice height”: the top picture is a side view of the hill, the bottom is the map seen from above, and the contours already cut stay on it. {#s0e .explain}

::: html step0-1
s0stage: Top: a side cross-section of the hill and the horizontal slicing plane; bottom: the map from directly above, one contour every 10 m; the bright line is the current slice
s0canvas: A side cross-section of the hill and its contour map: as the slicing plane rises, rings appear one by one
s0h: Slice height
s0reset: Put the plane back on the ground
:::

Takeaway: every point on one contour has the same altitude, and neighbouring lines differ by a fixed “contour interval” (10 m here). Holds for this made-up terrain; real maps choose the interval to suit scale and terrain (such as 5, 10 or 20 m). {#s0result .readout i18n=text}

::: strings
s0ro: Slice height {h} m: {n} contour lines cut so far (one every {iv} m); the highest is at {top} m.
:::

## Why does crowded contour spacing mean a steep slope? {#step1 h2=s1t}

::: strings
nav1: 1 Spacing = steepness
:::

Step 1 · Spacing = steepness {#s1k .step-kicker i18n=text}

This step asks: how do you read steepness from contour spacing? Neighbouring contours differ by a fixed height (the 10 m interval). If the horizontal distance between them is short, the ground rises 10 m over a short run, so it is steep; a long distance means a gentle slope. The **slope angle** is the angle between the ground and the horizontal. Drag the two sliders to move the probe and read the arrow (uphill), the horizontal gap between neighbouring lines, and the slope angle. {#s1e .explain}

::: html step1-1
s1stage: Map: the orange dot is the probe, the arrow points steepest uphill, and the cyan segment measures the horizontal gap between neighbouring contours here
s1canvas: Contour map of a hill: the probe’s uphill direction and the gap between neighbouring contours at that spot
s1x: Probe left–right
s1y: Probe up–down
:::

Takeaway: the closer the contours, the shorter the gap and the steeper the slope; the sparser, the gentler. Slope comes from a finite difference; the map is 1000 m wide with made-up heights, and the gap idea holds where neighbouring lines run roughly parallel. {#s1result .readout i18n=text}

::: strings
s1ro: Probe altitude {z} m; the horizontal gap between neighbouring contours ({iv} m apart) is about {d} m and the slope is about {a}° ({kind}).
s1gentle: gentle slope
s1mid: moderate slope
s1steep: steep slope
s1flat: almost flat, contours very far apart
:::

## Should the contour interval be big or small — can a small knoll be lost? {#step2 h2=s2t}

::: strings
nav2: 2 Interval & detail
:::

Step 2 · Interval & detail {#s2k .step-kicker i18n=text}

This step asks: the larger the interval, what does the map lose? The **contour interval** is the height difference between neighbouring contours. Pick a terrain and drag the interval: a small interval gives many lines and lots of detail but a crowded map; a large one is clean but any bump smaller than one interval (like a knoll) cannot be drawn. {#s2e .explain}

::: html step2-1
s2stage: The same terrain drawn with different intervals: numbers are the line’s altitude in metres, every 5th line labelled
s2canvas: Contour map of the chosen terrain: a larger interval gives fewer lines and small bumps disappear
s2ter: Terrain
s2iv: Contour interval
:::

Takeaway: the interval sets the smallest relief a map can show: larger = more generalised, smaller = more detailed. Holds for this made-up terrain, drawn from a regular grid, so lines are slightly jagged. {#s2result .readout i18n=text}

::: strings
s2ro: {ter}: highest point about {top} m, interval {iv} m, {n} contour lines drawn. {note}
s2lost: Note: some small bumps (like the knoll) are lower than one interval and may have vanished from the map.
s2ok: Note: at this interval the main landforms are all drawn.
:::

## Put a drop of water on a slope — which way does it flow? {#step3 h2=s3t}

::: strings
nav3: 3 Where water goes
:::

Step 3 · Where water goes {#s3k .step-kicker i18n=text}

This step asks: which way does water flow over the terrain, and how does that relate to contour lines? Water flows along the **steepest downhill direction**, which is perpendicular to the contours. Pick a terrain, set where the drop starts, press “Release water”, and watch the path cross every contour at a right angle and see where it ends. {#s3e .explain}

::: html step3-1
s3stage: Map: the blue dot is where the drop starts and the blue line is its path (growing as it goes); every step is perpendicular to the contour at that spot
s3canvas: A water path on the map: crossing contours at right angles, from high ground to low
s3ter: Terrain
s3x: Drop left–right
s3y: Drop up–down
s3go: Release water
s3reset: Clear the flow
:::

Takeaway: water follows the steepest downhill direction, perpendicular to the contours, so ridges split flow, valleys collect it, and a basin traps it. Holds for terrain shape only, ignoring soil absorption and volume; the path uses fixed steps down the gradient. {#s3result .readout i18n=text}

::: strings
s3ro0: Set the position, then press “Release water”.
s3roEdge: The water ran from {z0} m down to {z1} m and left the map edge; the path is about {len} m long.
s3roPit: The water ran from {z0} m down to {z1} m and stopped in a hollow (higher all around); the path is about {len} m long.
:::

## Walking a straight route, how much climbing is there in total? {#step4 h2=s4t}

::: strings
nav4: 4 Walk a route
:::

Step 4 · Walk a route {#s4k .step-kicker i18n=text}

This step asks: along a route, how does altitude change and how many metres of ascent add up? The start is fixed at the left-middle of the map; set the direction and length to choose the route, and the profile marks every place the route crosses a contour. Drag “how far along” to see ascent and descent accumulate over the part already walked. {#s4e .explain}

::: html step4-1
s4stage: Top: the map and route (orange line), the dot is the current position; bottom: the route’s altitude profile, yellow dots mark each contour crossing
s4canvas: The route on the map and its altitude profile: each contour crossed adds a point to the profile
s4th: Route direction (0° = right, positive = down)
s4len: Route length
s4p: How far along
:::

Takeaway: the profile is set by where the route crosses each contour; total ascent is not the same as end minus start altitude, since it may climb then drop. Holds for a straight route clipped at the map edge, with the profile from dense sampling. {#s4result .readout i18n=text}

::: strings
s4ro: Route about {len} m long; {p}% walked: altitude {z} m; total ascent {up} m, descent {down} m so far; the whole route peaks at {max} m and crosses {n} contours.
:::

## Explain contour lines to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Contours join points of equal altitude: spacing shows steepness, numbers show height, and the direction perpendicular to them is where water flows.
f1t: Where they come from
f1b: A horizontal plane slices the hill and the cut seen from above is the contour; neighbours differ by one interval (step 0).
f2t: Reading them
f2b: Close = steep, far = gentle; the interval sets the smallest relief you can see (steps 1–2).
f3t: Using them
f3b: Water runs across contours at right angles downhill; a route’s crossings draw its profile (steps 3–4).
modelT: Honest model notes
model1: The terrain is a made-up smooth function, not a real mountain; real maps are surveyed and have cliffs and other discontinuities.
model2: Contours come from grid interpolation and look slightly jagged; the water path is fixed-step gradient descent.
model3: The map is 1000 m wide with heights in metres; the slope bands (gentle < 5°, moderate 5–12°, steep > 12°) are this page’s teaching convention.
nextT: Keep going (on this site)
l1: Derivatives · step 0: slope is just a rate of change — the denser the contours, the faster it changes
l2: Gradient Descent · step 0: water runs steepest downhill, the same as the algorithm’s “follow the gradient down”
l3: Coordinate Plane · step 0: a map locates things by (x, y); add altitude and you have a 3D position
:::

::: strings
terHill: Hill (with a knoll)
terRidge: Ridge
terSaddle: Twin peaks & saddle
terBasin: Crater basin
unitM: m
unitDeg: °
:::
