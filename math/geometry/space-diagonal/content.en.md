---
lang: en
---

::: strings
docTitle: Space diagonal · Pythagoras twice
languageLabel: Language
back: ← Knowledge Index
format3d: Interactive 3D
category: Mathematical Foundations
stage: Junior secondary
pageTitle: A box’s space diagonal
tagline: Given a box’s length, width and height, how far is it from one corner to the opposite corner? Use Pythagoras twice: across the base, then upwards.
navLabel: Step navigation
foot: Space diagonal · One interaction at a time
:::

## Which triangle contains the line inside? {#step0 h2=s0t}

::: strings
nav0: 0 Find the triangle
:::

Step 0 · Observe {#s0k .step-kicker i18n=text}

Question: how does the straight line through the box connect to its base? You already know [[pythagoras#step2|Pythagoras: in a right triangle, the squared legs add up to the squared hypotenuse]]. The space diagonal d joins opposite, farthest corners through the box. The base diagonal e joins opposite corners on the bottom face. Fix length a = 2, width b = 3 and height c = 6, in the same unit. Drag to change the view. Follow cyan e to the bottom corner, then green c upwards: orange d closes this upright triangle. Small square marks indicate perpendicular lines. {#s0e .explain}

::: html step0-1
dragHint: Drag to rotate; use the scroll wheel or pinch to zoom. Or focus the canvas and use the arrow keys. Scroll the page outside the canvas.
canvasLabel: Rotatable box: orange d is the space diagonal, cyan e the base diagonal, green c the height. Drag or use arrow keys to rotate, scroll to zoom
loadFail: The 3D view failed to load: this site’s self-hosted three.js module could not be loaded. Please check your connection and reload the page.
legendD: ━ d · Space diagonal
legendE: ━ e · Base diagonal
legendC: ━ c · Height
modelNote: Mathematical model, not a measurement. No coordinate axes: a and b lie on the base; c is height. Translucent shaded faces and edges show depth and orientation. The colored triangle is an X-ray teaching overlay, visible through the shell. Its square angle marks remain 90° in space even when they look slanted in projection.
stop: Stop rotation
view: Clear view (stop rotation)
:::

What to notice: e is perpendicular to height c. Together with d, they form an upright right triangle, because a box’s height is perpendicular to the entire base. {#s0result .readout i18n=text}

::: strings
autoStatus: Rotating slowly. Your first drag, arrow key or stop action ends automatic rotation for this visit.
stillStatus: View held still. You can still drag to rotate.
:::

## One shared e, two right triangles {#step1 h2=s1t}

::: strings
nav1: 1 Use it twice
:::

Step 1 · Calculate {#s1k .step-kicker i18n=text}

Question: given length a, width b and height c, how do we find the space diagonal d, the straight distance between opposite corners inside? First find the base diagonal e, the line across the bottom face, from a and b. Then combine e with c to find d. Change only a, holding b and c fixed: watch cyan e and orange d grow or shrink together. Then change only c: e stays fixed while d changes. Sliders change actual edge lengths and preserve your view. All lengths share one unit. {#s1e .explain i18n=text}

Try this order: hold b and c fixed while changing only a; confirm that e and d move together. Then hold a and b fixed while changing only c; confirm that e stays put while d changes. This separates the two Pythagoras steps: find e on the base, then combine e with c. {#s1bridge .hint i18n=text}

::: html step1-1
aLab: Length a (units)
bLab: Width b (units)
cLab: Height c (units)
book1: ① Base right triangle · Find e
book2: ② Upright right triangle · Find d
:::

Current values, shown to 3 decimal places. The second line uses exact e² = a² + b², never the rounded display of e. Length measures distance; larger is not inherently better. {#rounding .readout i18n=text}

Why can we connect the steps? On the base, a ⟂ b. In the upright triangle, e ⟂ c. Both right triangles must actually exist for Pythagoras to work twice. {#s1result .readout i18n=text}

::: strings
ledger1: "e = √(a² + b²)\n= √({a}² + {b}²) = √{base2} ≈ {e} units"
ledger2: "d = √(e² + c²) = √(a² + b² + c²)\n= √({base2} + {c}²) = √{sum} ≈ {d} units"
:::

## Choose first, then reveal {#step2 h2=s2t}

::: strings
nav2: 2 Try it yourself
:::

Step 2 · Check yourself {#s2k .step-kicker i18n=text}

Question: what is the space diagonal d, the straight distance between opposite corners inside a different box? Edges a and b are perpendicular on the base; height c is perpendicular to that base. Use the two right triangles: find the base diagonal e, the straight line between opposite bottom corners, then d. Do not follow a route along the three edges. Choose d below; a correct answer unlocks the summary formula and its conditions. {#s2e .explain i18n=text}

::: html step2-1
quizGiven: New box: a = 1, b = 2, c = 2 (units)
quizLabel: Choose the space diagonal length
locked: Choose an answer. A correct choice unlocks the summary formula.
finale: Take away a method: find a distance across the base, then pair that distance with the height in a right triangle. A distance in space still starts with Pythagoras in a plane.
backPythagoras: ← Pythagoras, step 4: check the right-angle condition from three sides
proofLink: Revisit Pythagoras, step 2: see why the formula follows from areas →
:::

::: strings
quizIdle: Hint: find e² on the base, then add the squared height.
quizWrong: Try again: d² = (1² + 2²) + 2². We want a length, not its square or the sum of the edges.
quizCorrect: Correct: d = 3 units. You used Pythagoras twice!
quizProof: First e² = 1² + 2² = 5. Then d² = 5 + 2² = 9, so d = 3 units.
condition: This requires a rectangular box, or three mutually perpendicular edges: both the base and upright right triangles must really exist. Do not apply it directly to a skewed box.
:::
