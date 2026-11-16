---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Polygon Angle Sums · Tear and Rearrange
tagline: A triangle’s three angles fit together into a straight angle of 180°; any polygon can be cut into triangles, so its interior angles add up to (n − 2) × 180°.
:::

## What do a triangle’s three angles add up to? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Triangle
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: TRIANGLE
:::

This step answers: what is a triangle’s angle sum? An **interior angle** is the angle inside a polygon between two sides. Drag vertex C and the three angles change individually; drag “Join” to tear the three angles off and place them side by side at one point: they fit exactly into a straight angle (a line), that is, 180°. {#s0e .explain}

::: html step0-2
s0cv: Fitting the triangle’s three angles into a straight angle
cx: Vertex C horizontal position
cy: Vertex C height
join: Join progress (0 = in place, 1 = side by side)
:::

::: strings
s0ro: The three interior angles are {a}°, {b}°, {c}°, adding up to {s}° (computed from the vertex coordinates).
:::

## What do a quadrilateral’s four angles add up to? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Quadrilateral
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: QUADRILATERAL
:::

This step answers: how do we get a quadrilateral’s angle sum? Draw the diagonal AC and the quadrilateral splits into two triangles. Each has 180°, so two make 360°. Drag vertex D to change the shape (keeping it convex): the four angles change one by one, but their sum does not. {#s1e .explain}

::: html step1-2
s1cv: A diagonal splits the quadrilateral into two triangles
dx: Vertex D horizontal position
dy: Vertex D height
:::

::: strings
s1ro: The four interior angles are {a}°, {b}°, {c}°, {d}°, adding up to {s}°; two triangles of 180° each make {t}°.
:::

## Into how many triangles does an n-gon split, and what is its angle sum? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 n-gon
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: n-GON
:::

This step answers: how does the angle sum depend on the number of sides n? Draw diagonals from one vertex to every non-adjacent vertex and the n-gon splits into n − 2 triangles, so the angle sum = (n − 2) × 180°. Drag the number of sides n, count the triangles, and compare with the sum computed from coordinates. {#s2e .explain}

::: html step2-2
s2cv: Diagonals from one vertex split the n-gon into n − 2 triangles
nn: Number of sides n
:::

::: strings
s2ro: {n}-gon: {k} triangles; angle sum = ({n} − 2) × 180° = {f}°; computed from coordinates {s}°; each angle of a regular {n}-gon is {each}°.
:::

## Walk once around a polygon’s edges: how much do you turn in total? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Exterior angles
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: EXTERIOR ANGLES
:::

This step answers: what is the sum of a polygon’s exterior angles? An **exterior angle** is the angle between an extended side and the next side, equal to 180° minus the interior angle. Walking round the edges you turn by one exterior angle at each vertex, and returning to your starting direction means a full turn of 360°. Drag “Edges walked” to see the turning pile up; switch to “Irregular”: the exterior angles differ but still sum to 360°. {#s3e .explain}

::: html step3-2
s3cv: Walking round a polygon and the turning accumulated
regular: Regular polygon
irregular: Irregular convex polygon
nn3: Number of sides n
walk: Edges walked
:::

::: strings
s3ro: {n}-gon, {k} edges walked: turned {cum}° so far; after all of them it is {tot}° (the exterior angle sum).
:::

## With a dent pushed inwards, does the formula still hold? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Concave
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: CONCAVE
:::

This step answers: must the polygon be convex? Push one vertex of a pentagon inwards: at some point its interior angle exceeds 180° (it caves in). Drag “push inwards”: that angle grows and the others shrink, yet the five angles always add up to (5 − 2) × 180° = 540°, because a concave polygon can be cut into triangles too. {#s4e .explain}

::: html step4-2
s4cv: A pentagon with one vertex pushed inwards
push: How far the vertex is pushed in
:::

::: strings
s4ro: The five interior angles: {angles}, adding up to {s}°; the largest is {mx}°, {kind}.
kindReflex: above 180°, so this vertex caves in
kindConvex: all below 180°, so it is a convex pentagon
:::

## Each angle of a regular polygon is a°: how many sides does it have? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: from the interior angle, can we work out the number of sides? In a regular n-gon each interior angle = (n − 2) × 180° ÷ n and each exterior angle = 180° − interior = 360° ÷ n, so n = 360 ÷ (180 − interior). Drag the interior angle a and see whether n is a whole number: only then does such a regular polygon exist. {#s5e .explain}

::: html step5-2
s5cv: The regular polygon with that interior angle
aa: Interior angle a of the regular polygon (degrees)
recapTitle: Recap
recap1: A triangle’s angle sum is 180°, seen by fitting its three angles into a straight angle.
recap2: An n-gon splits into n − 2 triangles: angle sum (n − 2) × 180°.
recap3: Any simple polygon (even a concave one) has exterior angles summing to 360°, each exterior angle = 180° − interior (negative at a reflex corner).
modelTitle: Scope and limits of this model
modelText: This page deals with simple polygons in the plane (sides that do not cross). The angle-sum formula holds for convex and concave ones; triangles on a sphere or other curved surface do not add up to 180°, which is outside this page. Angles are computed from vertex coordinates and shown to one decimal place.
linkPyth: → Pythagorean Theorem: another proof by rearranging pieces
linkRot: → Symmetry & Rotation: a full turn is 360°
linkCirc: → Inscribed Angles: how angles on a circle are measured
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5roYes: Interior angle {a}°: exterior angle {e}°, n = 360 ÷ {e} = {n}, so it is a regular {n}-gon.
s5roNo: Interior angle {a}°: exterior angle {e}°, n = 360 ÷ {e} = {nn}, not a whole number, so no regular polygon has this angle.
docTitle: Polygon Angle Sums · Tear and Rearrange
:::
