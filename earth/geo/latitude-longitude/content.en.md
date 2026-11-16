---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Earth & Space
stageBadge: Junior High
foot: Latitude & Longitude · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Latitude & Longitude · Two Angles Name Any Spot on Earth
pageTitle: Latitude & Longitude
tagline: Earth is a sphere with no built-in grid — yet “so many degrees north, so many east” pins down any point on its surface.
:::

## How do two numbers name any place on Earth’s surface? {#step0 h2=s0t}

::: strings
nav0: 0 Two angles
:::

Step 0 · Two angles {#s0k .step-kicker i18n=text}

This step asks: why do two angles locate any point on Earth? **Latitude** is the angle north or south of the equator (0°–90°); points of equal latitude form a circle parallel to the equator, a parallel. **Longitude** is the angle east or west of the prime meridian (through Greenwich in Britain) (0°–180°); points of equal longitude form a half-circle from pole to pole, a meridian. Pick a city or drag the sliders for latitude and longitude, and drag “rotate the globe” to see the far side. {#s0e .explain}

::: html step0-1
s0stage: The globe (seen from above and to the side): a parallel and a meridian every 30°; the orange dot is the chosen point and the orange arcs are its parallel and meridian; city positions are approximate
s0canvas: A globe with its grid: the chosen point sits where its parallel and meridian cross
s0city: Pick a city
s0lat: Latitude (north positive)
s0lon: Longitude (east positive)
s0view: Rotate the globe (view longitude)
:::

Takeaway: latitude + longitude = one definite point; meridians meet at the poles, so longitude means nothing exactly at a pole. Holds with Earth approximated as a sphere and approximate city coordinates. {#s0result .readout i18n=text}

::: strings
s0ro: {name}: {lat}, {lon}. It sits where the parallel ({la}° from the equator) crosses the meridian ({lo}° from the prime meridian).
s0hid: (This point is on the far side of the globe right now; rotate to see it.)
:::

## How far is one degree of longitude, and is it the same at every latitude? {#step1 h2=s1t}

::: strings
nav1: 1 Circles shrink
:::

Step 1 · Circles shrink {#s1k .step-kicker i18n=text}

This step asks: walking 1° of longitude along a parallel, is the distance the same at the equator and at high latitude? A parallel’s circumference is 2πR·cos φ (R ≈ 6371 km is Earth’s radius, φ the latitude); the nearer a pole, the smaller the circle, so 1° of longitude covers less ground — while 1° of latitude (along a meridian) is about 111 km everywhere. Drag the latitude and watch the highlighted parallel and the readout. {#s1e .explain}

::: html step1-1
s1stage: Left: the orange ring is the parallel at the chosen latitude; right: the cos φ curve (a parallel’s length relative to the equator), the orange dot is the current latitude
s1canvas: One highlighted parallel on the globe and the cos curve: the higher the latitude, the smaller the circle
s1lat: Latitude (north positive)
:::

Takeaway: 1° of latitude is about 111 km everywhere, 1° of longitude = 111.2 km × cos latitude, shrinking to 0 at the poles. Holds treating Earth as a 6371 km sphere; the real Earth is slightly flattened. {#s1result .readout i18n=text}

::: strings
s1ro: Latitude {lat}°: this parallel is {len} km round ({pct}% of the equator); 1° of longitude along it is about {dlon} km, while 1° of latitude along a meridian is about {dlat} km.
:::

## Flatten the sphere into a rectangular map: where does it get stretched? {#step2 h2=s2t}

::: strings
nav2: 2 Peel the orange
:::

Step 2 · Peel the orange {#s2k .step-kicker i18n=text}

This step asks: a sphere cannot be flattened without distortion — where does it show up? Imagine peeling Earth like an orange: each parallel’s true length is 2πR·cos φ, so the “peel” has curved sides (drag all the way left). To force a rectangular world map, every parallel has to be stretched to the equator’s length, so at high latitude the horizontal stretch is 1 / cos φ. Drag “flatten” and watch what happens to the orange circle (a true circle on the sphere). {#s2e .explain}

::: html step2-1
s2stage: Map: x longitude, y latitude; the left end is the orange peel (each parallel keeps its true length), the right end a rectangle; the orange ellipse is how a same-size circle on the sphere looks once stretched
s2canvas: Flattening the globe: the orange-peel shape is stretched into a rectangle and circles at high latitude are pulled wide
s2u: Flatten (0 peel → 100 rectangle)
s2lat: Latitude of the observed circle
:::

Takeaway: a rectangular world map stretches high latitudes sideways by 1/cos φ, which is why Greenland looks far bigger than it is; every flat map trades off shape, area and distance. Compares only the “orange peel (sinusoidal)” and “equirectangular” layouts; many other projections exist. {#s2result .readout i18n=text}

::: strings
s2ro: Flatten {u}%: at latitude {lat}° the horizontal stretch is {k}× the truth and the area is magnified {k}×.
s2none: Not stretched yet: every parallel keeps its true length and the circle stays a circle (but the map edges are curved).
:::

## Why is the shortest route between two cities curved on a flat map? {#step3 h2=s3t}

::: strings
nav3: 3 Shortest route
:::

Step 3 · Shortest route {#s3k .step-kicker i18n=text}

This step asks: what is the shortest path between two points on a sphere, and why does it look curved on a rectangular map? The shortest path is the arc cut by the plane through both points and Earth’s centre, a **great circle**, and its length comes from the haversine formula. If you instead treat degrees on the rectangular map as flat coordinates, you get too big a distance. Pick two cities and compare the two numbers. {#s3e .explain}

::: html step3-1
s3stage: Top: the two cities and the great-circle route on the globe (orange); bottom: the rectangular map — the orange curve is the great circle, the grey dashed line is the straight line drawn on the map
s3canvas: The great-circle route between two cities: the shortest arc on the sphere, a curve on the rectangular map
s3a: From
s3b: To
:::

Takeaway: the shortest route on a sphere is the great-circle arc; a straight line on a rectangular map is not shortest, especially at high latitude and across large longitude gaps. Holds for a spherical Earth (R = 6371 km), ignoring terrain and air traffic rules; “measuring in degrees” treats every degree as 111.2 km, a crude method. {#s3result .readout i18n=text}

::: strings
s3ro: {a} → {b}: great-circle distance {gc} km; measuring the map as flat degrees gives {flat} km, which is {diff}% off.
s3same: The start and end are the same city, so the distance is 0.
:::

## Why does the time get earlier as you go east? {#step4 h2=s4t}

::: strings
nav4: 4 Longitude & time
:::

Step 4 · Longitude & time {#s4k .step-kicker i18n=text}

This step asks: how are longitude and time related? Earth turns 360° in 24 hours, so every 15° of longitude is 1 hour. **Local solar time** is time with noon when the Sun is overhead: universal time (UTC, the time on the prime meridian) plus longitude ÷ 15. Drag the UTC and watch the day/night boundary slide west across the map; pick a city to read its local solar time. {#s4e .explain}

::: html step4-1
s4stage: Rectangular map: the bright half is day (assuming an equinox, Sun over the equator), the dark half is night; the orange vertical line is the meridian at noon; dots are cities
s4canvas: Day and night on a world map: the boundary moves west with universal time, 15° of longitude per hour
s4utc: Universal time (UTC)
s4city: City
:::

Takeaway: each 15° east adds an hour of local solar time, and the day/night boundary moves west as Earth turns. Simplified with an equinox and local solar time; real time zones are set by countries, and daylight saving and the season change the shape of the boundary. {#s4result .readout i18n=text}

::: strings
s4ro: UTC {utc}: noon is at {noon}° longitude; local solar time in {city} ({lon}) is {local}, {dn}.
s4day: it is daytime there
s4night: it is night there
:::

## Explain latitude and longitude to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Latitude (angle from the equator) and longitude (angle from the prime meridian) together locate any point on Earth; flattening a sphere always distorts.
f1t: Locating
f1b: Parallels run parallel to the equator, meridians meet at the poles; two angles fix a point (step 0).
f2t: Scale
f2b: 1° of latitude is about 111 km, 1° of longitude = 111 km × cos latitude (step 1); flattening stretches high latitudes sideways (step 2).
f3t: Routes and time
f3b: The shortest route is a great-circle arc (step 3); 15° of longitude is one hour (step 4).
modelT: Honest model notes
model1: Earth is a sphere of radius 6371 km; the real Earth is slightly flattened, with an equatorial radius about 21 km larger than the polar one.
model2: The maps here draw no coastlines and city coordinates are approximate; equirectangular and “orange peel” are just two of many projections.
model3: Day/night uses an equinox and ignores refraction; time zones and daylight saving are human conventions, different from local solar time.
nextT: Keep going (on this site)
l1: Coordinate Plane · step 0: (x, y) locate a point on a plane; on a sphere two angles take over
l2: Day & Night · step 2: how day and night sweep across the longitudes in one turn
l3: Earth’s Orbit & the Seasons · step 1: how the Sun’s overhead latitude changes with the seasons
:::

::: strings
ct0: Singapore
ct1: London
ct2: New York
ct3: Sydney
ct4: Rio de Janeiro
ct5: Nairobi
ct6: Reykjavik
ct7: Beijing
ctNone: A point you set
dirN: N
dirS: S
dirE: E
dirW: W
dirEq: the equator
dirPm: the prime meridian
unitKm: km
unitDeg: °
unitH: h
latFmt: {v}°{dir}
lonFmt: {v}°{dir}
mapLbl: Orange ellipses = same-size circles on the sphere (bold = chosen latitude)
:::
