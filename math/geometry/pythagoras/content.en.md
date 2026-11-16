---
lang: en
---

::: strings
docTitle: The Pythagorean Theorem · One Interaction at a Time
back: ← Knowledge Index
pageTitle: The Pythagorean Theorem
tagline: Given two sides of a right triangle, how do we find the third? Start with 3, 4, 5, prove the area rule, then drag, classify and measure distances. These are mathematical models, not physical measurements.
foot: The Pythagorean Theorem · One Interaction at a Time
navLabel: Step navigation
nav0: 0 Coincidence?
nav1: 1 Areas
nav2: 2 Proof
nav3: 3 Drag
nav4: 4 Classify
nav5: 5 Apply
nav6: 6 Finale
:::

## A 3, 4, 5 coincidence? {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: Question: is 3²+4²=5² a coincidence? Given three sets of side lengths, predict, then compare a², b² and c² (each number times itself). A right angle is 90°; its adjacent sides a and b are legs, and its opposite, longest side c is the hypotenuse. The third triangle is not right. These examples raise a question, not a proof. A tiny square marks 90°; edge labels use the same length unit.
canvasLabel: Interactive geometry; instructions appear above
guessAll: Every right triangle
guessOnly: Only a 3-4-5 coincidence
check: Squared-area check
:::

::: strings
guessIdle: Make a prediction before opening the examples.
guessEcho: Your prediction: {guess}. Opened {n}/3 examples; the first check locks your prediction. Examples alone do not prove a rule.
:::

## See it as areas: two small squares fill a large one {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: Question: are the three squares actual areas? Keep the 3-4-5 triangle: a and b meet at 90°, and c is the opposite hypotenuse. Squaring a length gives the area of a square of that side. Each cell is one square unit: cyan a²=9, orange b²=16, tilted target c²=25. Press Pour without changing the sides; watch source cells empty and target cells fill, matching the progress and area. This illustrates equal areas; the general proof comes next.
pour: Pour the cells into the large square
reset: Reset this step
target: Cells transferred into c²
:::

::: strings
fillRO: Progress {pct}% · Transferred {n}/25 square units; a² = 9, b² = 16, c² = 25.
fillDone: 9 + 16 = 25, with no cells left over.
source: The two source areas
:::

## A puzzle proof: one square, two counts {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: Question: why does this work for any right triangle without measuring? Legs a and b meet at 90°; hypotenuse c is opposite. Congruent means identical shapes that fit exactly over one another. Place four congruent triangles, one per click; each has area ab/2 and they enclose a square of side c. Compare both counts and subtract the shared area. Sliders change side lengths, preserving placed pieces and recalculating the ledger. Checking covers tested numbers; a proof explains every a,b>0.
aLab: Leg a (length units)
bLab: Leg b (length units)
piece: Place one more triangle
book1: Count 1 · Expand the whole
book2: Count 2 · Triangles and centre
:::

::: strings
proofRO: Puzzle {k}/4 · a = {a}, b = {b}, c ≈ {c}; outer side a+b = {L}.
bookWait: This is only the subtotal of placed triangles, not the whole square’s area. Compare the two totals after all four are placed.
proofDone: Subtract the same 2ab from both counts: a² + b² = c², so {aa} + {bb} = {cc}. All four inner sides have length c; adjacent acute angles (each less than 90°) complete a right angle, so the centre really is a square.
:::

## Drag and check: when does equality hold? {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: Question: does equality survive moving the right-angle vertex? Sides a and b meet at R; c joins their other endpoints. A square root √ asks which nonnegative number squares to the given value. Keep the right angle, drag orange R (or use position sliders), and compare areas and both c values side by side. The ruler uses drawn endpoint coordinates; the square-root route uses a²+b². Both are model calculations, not physical measurements. Releasing the angle keeps the current shape unchanged. Then the endpoints stay fixed and only R moves, so equality is no longer guaranteed. For a nondegenerate triangle, the two values differ when the angle at R is not 90°; acute means less than 90°, obtuse means greater than 90°. Faint dots save visited positions; three small squares share an area scale. Readings are rounded to two decimals, so tiny nonzero differences may display as 0.00; angles use unrounded coordinates.
unlock: Release the right angle (free triangle)
xLab: Vertex horizontal position (keyboard alternative)
yLab: Vertex vertical position (keyboard alternative)
:::

::: strings
geomRO: Current a = {a}, b = {b}; areas a² = {aa}, b² = {bb}, c² = {cc} (square units).
measure: Ruler c (distance between drawn endpoints) ≈ {c}
root: Square root √(a²+b²) ≈ {c}
diff: Length difference ≈ {d}; {rel}; at R: {kind}.
degenerate: A side is zero or the points are collinear: the shape is degenerate, not a triangle.
choose: Choose an angle type, then reveal
:::

## Reverse the rule: classify from three sides {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: Question: how can three sides tell us the angles? First check that the two shorter sides sum to more than the longest. Call the longest c and the others a,b. The converse reverses the theorem: a²+b²=c² guarantees a right angle. Larger c² gives an obtuse largest angle (>90°); smaller c² makes every angle acute (<90°). Choose, then reveal the squared values in the same units. A zero, positive or negative difference means right, obtuse or acute; larger is not “better”. Next question unlocks the choices.
right: Right
acute: Acute
obtuse: Obtuse
reveal: Reveal and score
next: Next question
:::

::: strings
notRight: Not a right triangle
quizSides: Sides: {a}, {b}, {c}; c is the longest side.
quizGuess: Your choice: {g}.
quizResult: Answer: {kind}. c² = {cc}, a²+b² = {sum}, difference c²−(a²+b²) = {diff}. {result}
correct: Correct.
incorrect: This choice was incorrect; compare the two squared quantities again.
score: Answered {n}; correct {k}.
:::

## Use it: ladders, screens and point distances {#step5 h2=s5t h2part=1}

::: html step5-1
s5k: Step 5
s5e: Question: given a hypotenuse and a leg, how do we find the other leg? Legs meet at 90°; the hypotenuse is opposite. √ takes the nonnegative inverse of squaring. Model 1 assumes a vertical wall and level ground: a 5 m ladder has height √(25−d²) as its foot moves distance d. Screen width, height and diagonal follow the same rule. Model 2 has x rightwards, y upwards, one unit per cell; fix P=(1,1), move Q or its coordinate sliders, and compare horizontal change Δx, vertical change Δy and distance. The distance formula is this theorem in coordinates. Faint lines preserve previous distances. Both models find a straight shortcut instead of two perpendicular segments.
dLab: Foot of ladder from wall d (m)
:::

::: strings
ladderRO: d = {d} m; height h = √(25−{dd}) ≈ {h} m.
ladderWarn: Near 5 m: height approaches zero; this is a geometric limit, not advice for using a ladder.
distanceRO: P = (1, 1), Q = ({x}, {y}); Δx = {dx}, Δy = {dy}; straight-line distance ≈ {c} length units.
wall: Wall
ground: Ground
ladder: 5 m ladder
:::

## Finale: integer triples and √2 {#step6 h2=s6t h2part=1}

::: html step6-1
s6k: Step 6
s6e: Question: which integer triples make right triangles, and must the hypotenuse be an integer? √2 is the nonnegative number whose square is 2. Pythagorean triples are positive integers satisfying a²+b²=c²; a,b are the legs and c the opposite hypotenuse. Move k=1…6 to save each new 3k,4k,5k row beside 5-12-13 and 8-15-17. Every row compares exact integer squares without rounding. Then open the 1-1 triangle. <a class="fourier-link" href="../../arithmetic/fractions/#step6">Fractions are ratios of integers, with fraction, decimal and percent forms</a>. An irrational number cannot be a ratio of integers; √2 is one. If √2=p/q in lowest terms, p²=2q² makes p even; substitution makes q even too, contradicting lowest terms. Integer triples are special cases, not limits of the theorem.
parityTitle: Expand: why must both p and q be even?
parityExplain: An odd integer is 2n+1 for some integer n. Its square is 4n²+4n+1, which is still odd. Therefore, if a square is even, the original integer must be even. From p²=2q², p is even. Write p=2r for an integer r: substitution gives 4r²=2q², or q²=2r², so q is even too. Both p and q are divisible by 2, contradicting the assumption that p/q is in lowest terms.
kLab: Multiplier k (each new value adds a row)
family: Family / sides
unitTriangle: Open the 1-1 right triangle
linkTrig: Unit circle: why cos²θ + sin²θ = 1 follows from this theorem →
linkFractions: Three faces of fractions: compare with √2, excluded for the reason explained here →
linkEigen: A vector is an arrow: drag v and see how a matrix changes it →
:::

::: strings
irrational: Both legs are 1, so c = √2 ≈ 1.414… (the nonnegative number whose square is 2). Its decimal never ends or repeats, and it cannot be a ratio of integers. It is irrational, but has an exact position on the number line.
irrIdle: Integers are special cases. Open the 1-1 triangle to see a noninteger hypotenuse.
history: Saved {n} rows of exact integer checks.
degenerateKind: degenerate shape
nearDegenerate: A side is very small, close to degeneracy. This is still a triangle, but the displayed precision is limited.
remainingArea: Remaining central area = (a+b)² − 4(ab/2)
:::
