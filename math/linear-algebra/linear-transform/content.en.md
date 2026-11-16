---
lang: en
---

::: strings
docTitle: 2D Linear Maps · One Interaction at a Time
back: ← Knowledge Index
pageTitle: 2D Linear Maps · How Basis Vectors Carry a Plane
tagline: Treat every point as a combination of two basis vectors. Drag the matrix and watch the grid stretch, shear, or flip; the determinant reports the area change and shows when a whole plane collapses to a line.
provenance: A self-contained lesson on 2D real matrices, basis vectors, determinants, and invertibility. Displayed values are rounded; calculations keep floating-point precision.
foot: visual.integ.life · 2D Linear Maps 二维线性变换
:::

## Four numbers move the whole plane {#step0 h2=s0t}

::: strings
nav0: 0 Warp the Grid
:::

Step 0 · Hook {#s0k .step-kicker i18n=text}

A matrix **A** does not need a rule for every point: once we know where the basis vectors **e₁=(1,0)** and **e₂=(0,1)** go, every grid point is determined. Drag the four entries and watch the grid, the two basis arrows, and the unit square move together. {#s0e .explain}

::: html step0-1
gridAria: A 2D grid and transformed basis vectors
pIdentity: Identity
pShear: Shear
pFlip: Flip
pReset: Example
:::

Watch orange Ae₁ and pink Ae₂: they are the two direction rulers of the map. Every point is built from them. Next we write that ledger explicitly. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

## Every point is a combination of two basis vectors {#step1 h2=s1t}

::: strings
nav1: 1 Keep the Basis Ledger
:::

Step 1 · The Ledger {#s1k .step-kicker i18n=text}

Choose p=(x,y). The blue point walks x copies of e₁, then y copies of e₂; the orange point is A applied to it. The coefficients x and y do not get recomputed: the same ledger with two new basis vectors gives a new position. {#s1e .explain}

::: html step1-1
basisAria: An input point decomposed in basis vectors and its transformed point
xLab: x: copies of e₁
yLab: y: copies of e₂
:::

That is linearity: A(xe₁+ye₂)=xAe₁+yAe₂. Knowing where the basis vectors go tells us where the whole plane goes; the origin stays at the origin because there is no translation. {#s1hint .hint}

## The determinant is a signed area scale {#step2 h2=s2t}

::: strings
nav2: 2 Determinant = Area
:::

Step 2 · Determinant {#s2k .step-kicker i18n=text}

The unit square becomes a parallelogram. **det A=ad−bc** gives its signed area: the absolute value is the area scale, and a negative sign means the orientation flipped. {#s2e .explain}

::: html step2-1
detAria: The unit square and its transformed parallelogram
areaLabel: Unit square → transformed parallelogram
detPositive: Positive: det > 0
detNegative: Flip: det < 0
detZero: Zero area: det = 0
:::

Area is not a visual guess: it is fixed exactly by the parallelogram spanned by the output basis vectors. det=2 doubles area; det=−1 keeps area but reverses orientation. {#s2hint .hint}

## det = 0: the plane is pressed into a line {#step3 h2=s3t}

::: strings
nav3: 3 Invertible or Collapsed
:::

Step 3 · Invertibility {#s3k .step-kicker i18n=text}

When det=0, the two output basis vectors are collinear and the unit square has area 0. Many different inputs land on one output, so the input cannot be recovered uniquely. An inverse matrix exists only when det≠0. {#s3e .explain}

::: html step3-1
inverseAria: A grid for invertible and singular matrices
invertBtn: Try the inverse
invertReset: Clear
invCard1H: det ≠ 0
invCard1: The output basis vectors are independent; each result has one input and an inverse exists.
invCard2H: det = 0
invCard2: The output basis vectors lie on one line; information is flattened and inputs can collide.
:::

Treat “can we run it backwards?” as a geometry question first: did the grid get flattened? The determinant is the single-number answer to that question. {#s3hint .hint}

## A then B: order really changes the result {#step4 h2=s4t}

::: strings
nav4: 4 Composition & Quiz
:::

Step 4 · Composition & Quiz {#s4k .step-kicker i18n=text}

For two matrices, the rightmost map acts first: **BAp** means A then B. In general AB≠BA; the same point lands somewhere else. {#s4e .explain}

::: html step4-1
composeAria: Compare A then B with the reverse order
orderAB: A → B
orderBA: B → A
quizH: Quick check: which readout is det(A)?
quizA: 1.03
quizB: 0.83
quizC: −1.00
final1H: A matrix is a rule
final1: Once we know where the two basis vectors go, the action of a linear map on the entire plane is fixed.
final2H: The determinant is the ledger
final2: It records area scale and orientation; when it is zero, the ledger reports lost information.
final3H: Next: eigen-directions
final3: Some vectors change only length under A and stay on their line — those are [[eigenvectors#step1|eigenvectors]].
:::

From a grid to a line, linear algebra keeps doing one thing: choose a basis, track where it goes, and let algebra keep the geometric ledger. {#finale .finale}

::: strings
inv: invertible
singular: singular
:::
