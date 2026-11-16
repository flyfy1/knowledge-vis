---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Earth & Space
stageBadge: Junior High
foot: Earth's Orbit & the Seasons · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Earth’s Orbit & the Seasons · The Axis Is Tilted
pageTitle: Earth’s Orbit & the Seasons
tagline: Summer is not because Earth is closer to the Sun, but because its axis is tilted: around the orbit the hemispheres take turns facing the Sun, and day length swings with them.
:::

## Is Earth closest to the Sun in the northern summer? {#step0 h2=s0t}

::: strings
nav0: 0 Closer = hotter?
:::

Step 0 · Closer = hotter? {#s0k .step-kicker i18n=text}

This step asks: is summer hot because Earth is nearer the Sun then? Earth’s trip once around the Sun is its **revolution** (orbit), about 365 days, along a slightly squashed ellipse. The **astronomical unit (AU)** is the average Earth–Sun distance (about 150 million km). Drag the date, watch how the distance changes, and check what season it is in the north at that time. {#s0e .explain}

::: html step0-1
s0stage: Top: the orbit to true scale (almost a circle), the orange dot is Earth; bottom: Earth–Sun distance through the year (the vertical axis is stretched a lot to make the change visible)
s0canvas: Earth’s orbit and the Earth–Sun distance curve: the distance varies only about 3% and is smallest in early January
s0day: Date
s0play: Run a whole year
:::

Takeaway: the Earth–Sun distance changes only about ±1.7% over the year, smallest in early January (northern winter) and largest in early July (northern summer) — distance is not the cause of the seasons. Uses the approximation r = 1 − 0.0167 cos(2π(N − 2)/365.25) AU, N counting days from January 1. {#s0result .readout i18n=text}

::: strings
s0pause: Pause
s0ro: {date}: Earth–Sun distance {au} AU ({mkm} million km); {note}
s0near: Earth is relatively close to the Sun now, yet the north is in its cold season — so distance does not set the seasons.
s0far: Earth is relatively far from the Sun now, yet the north is in its warm season — again showing distance does not set the seasons.
s0mid: the Earth–Sun distance is near its average now.
:::

## With a tilted axis, what happens as Earth goes round the Sun? {#step1 h2=s1t}

::: strings
nav1: 1 The tilted axis
:::

Step 1 · The tilted axis {#s1k .step-kicker i18n=text}

This step asks: what is special about Earth’s axis direction during the orbit, and how does it make the overhead-Sun point swing back and forth? The **axis** is the imaginary line Earth spins about; it makes an angle of about 23.4° with the perpendicular to the orbit plane and keeps pointing the same way all year (almost at the North Star). So at different points of the orbit the northern hemisphere sometimes leans toward the Sun and sometimes away. The **subsolar latitude** (also called declination δ) is the latitude where the Sun is exactly overhead. Drag the date or press play. {#s1e .explain}

::: html step1-1
s1stage: Oblique view: the ellipse is the orbit (squashed vertically), the Sun in the middle; each Earth’s bright side faces the Sun, the line is the axis (its direction never changes), N is the north pole
s1canvas: Oblique view of Earth’s orbit: the axis direction stays fixed while the northern hemisphere leans toward or away from the Sun
s1day: Date
s1play: Run a whole year
:::

Takeaway: over a year the overhead point moves between 23.4° N and 23.4° S and back once; the tilt plus the fixed direction is the cause. Uses δ = ε·sin(2π(N − 79.5)/365.25) with ε = 23.44°; slow precession of the axis is ignored. {#s1result .readout i18n=text}

::: strings
s1pause: Pause
s1ro: {date}: the Sun is overhead at latitude {dec}°{ns}; {tilt}
s1toN: the northern hemisphere leans toward the Sun.
s1toS: the southern hemisphere leans toward the Sun.
s1eq: both hemispheres are lit about equally (near an equinox).
:::

## Is the noon Sun as high in summer as in winter, in the same place? {#step2 h2=s2t}

::: strings
nav2: 2 Noon Sun height
:::

Step 2 · Noon Sun height {#s2k .step-kicker i18n=text}

This step asks: how high is the Sun at noon, how does that change with the seasons, and why does that decide how warm it is? Noon Sun altitude h = 90° − |latitude − subsolar latitude|. The higher the Sun, the smaller the ground area one beam is spread over, so each square metre gets more heat: relative intensity ∝ sin h. Pick a latitude, drag the date and watch the altitude and the curve. {#s2e .explain}

::: html step2-1
s2stage: Top: the noon Sun as seen from the chosen latitude (dashed line is the horizon); bottom: noon Sun altitude through the year, the orange dot is the chosen date
s2canvas: A sketch of the noon Sun’s height and the yearly altitude curve: high in summer, low in winter
s2lat: Observer’s latitude (north positive)
s2day: Date
:::

Takeaway: a higher Sun gives more sunlight per square metre, hence summer warmth; in winter a low Sun spreads the same beam thin. Holds for the noon geometry only, ignoring atmosphere, clouds and the thermal lag of ground and sea (the hottest days come after the solstice). {#s2result .readout i18n=text}

::: strings
s2ro: Latitude {lat}°, {date}: overhead point {dec}°, noon altitude h = {h}°, Sun toward the {dir}; relative intensity sin h = {s}.
:::

## Why are summer days longer, and why does the Sun never set near the poles? {#step3 h2=s3t}

::: strings
nav3: 3 Day length
:::

Step 3 · Day length {#s3k .step-kicker i18n=text}

This step asks: how does day length change with latitude and date? When the overhead point is in the northern hemisphere, more of each northern latitude circle lies in the lit half of Earth, so days are long. Day length = 2 × arccos(−tanφ·tanδ) ÷ 15° (in hours, φ latitude, δ subsolar latitude). The ring on the right is a 24-hour clock with daylight in yellow; press play and the year’s day-length curve is drawn bit by bit. {#s3e .explain}

::: html step3-1
s3stage: Top: the day-length curve, the orange dot is the chosen date (dashed line is the 12 h equator reference); bottom: a 24-hour ring, the yellow arc is daylight
s3canvas: Yearly day-length curve and 24-hour ring: long in summer, short in winter, with polar day and night inside the polar circles
s3lat: Latitude (north positive)
s3day: Date
s3play: Run a whole year
:::

Takeaway: the hemisphere where the Sun is overhead has long days and short nights; the nearer the poles, the larger the swing; the equator stays near 12 h all year. Holds for geometric day length, ignoring refraction (real days are a few minutes longer) and terrain. {#s3result .readout i18n=text}

::: strings
s3pause: Pause
s3ro: Latitude {lat}°, {date}: day length {len} h (night {night} h). {pol}
s3polDay: This is polar day: the Sun does not set all day.
s3polNight: This is polar night: the Sun does not rise all day.
s3polNone: ""
:::

## Without a tilt would there be seasons? And with a bigger one? {#step4 h2=s4t}

::: strings
nav4: 4 No tilt?
:::

Step 4 · No tilt? {#s4k .step-kicker i18n=text}

This step asks: treat the axis tilt ε as an adjustable variable — how does the strength of the seasons follow? A “what if” experiment: at ε = 0° the axis is upright and the overhead point stays on the equator; the larger ε is, the farther it swings and the stronger the seasons. The two lines are noon Sun altitude at 40° N and 40° S: see how they are opposite seasons. {#s4e .explain}

::: html step4-1
s4stage: Noon Sun altitude through the year: cyan = 40° N, orange = 40° S, the vertical line is the chosen date; a larger ε makes both swing more
s4canvas: Noon Sun altitude at 40° N and 40° S for different axis tilts: flat lines when the tilt is zero
s4eps: Imagined axis tilt ε
s4day: Date
:::

Takeaway: with zero tilt there are no seasons, and the larger the tilt the stronger they are; the hemispheres have opposite seasons because when the Sun is overhead on one side it is low on the other. Holds with only the tilt changed and the orbit unchanged; extreme tilts (like Uranus at about 98°) are a different story. {#s4result .readout i18n=text}

::: strings
s4ro: ε = {eps}°: noon Sun altitude at 40° N ranges {nmin}°–{nmax}° and at 40° S {smin}°–{smax}°; day length at 40° N {lmin}–{lmax} h. {now}
s4now: {date}: right now 40° N has {nh}° and 40° S has {sh}°.
:::

## Explain the seasons to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: The seasons are not about being close to the Sun but about the tilted axis: around the orbit the overhead point moves back and forth between the tropics, and the Sun’s height and day length cycle with it.
f1t: Not distance
f1b: The Earth–Sun distance changes only about 3% a year, and it is smallest in the northern winter (step 0).
f2t: Tilt + orbit
f2b: A tilt of about 23.4° with a fixed direction sends the overhead point back and forth once a year (step 1).
f3t: Height and length
f3b: A higher Sun and longer day give more heat per square metre, so summer is warm (steps 2–4).
modelT: Honest model notes
model1: Declination and distance use approximate formulas, so dates can differ from the true solstices and equinoxes by a day or two.
model2: The geometry ignores the thermal inertia of air and ocean, so real hottest and coldest times lag the solstices by about a month.
model3: The oblique orbit picture is a teaching sketch (squashed vertically); the orbit in step 0 is to true scale and almost circular.
nextT: Keep going (on this site)
l1: Day & Night · step 4: spin direction, and the hint that orbit plus a tilted axis makes the seasons
l2: Climate Energy Ledger · step 0: how sunlight spreads into different amounts of heat by latitude
l3: Day & Night · step 2: one turn is one day, and how day and night sweep past
:::

::: strings
mon0: Jan
mon1: Feb
mon2: Mar
mon3: Apr
mon4: May
mon5: Jun
mon6: Jul
mon7: Aug
mon8: Sep
mon9: Oct
mon10: Nov
mon11: Dec
dateFmt: {m} {d}
unitDeg: °
unitH: h
unitAu: AU
unitMkm: million km
s0orbit: orbit (true scale, almost circular)
s2yl: Noon Sun altitude (°)
lblDay: Date
lblLat: Latitude
lblEps: Axis tilt ε
play: Run a whole year
pause: Pause
north: N
south: S
:::
