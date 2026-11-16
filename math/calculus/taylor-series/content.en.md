---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Taylor Series · Patch the Curve Term by Term
tagline: Add a polynomial term by term and the curve gets matched ever farther around one point; this is a “local” approximation, the counterpart of Fourier’s “global” one.
:::

## Add one more term and the fit gets tighter {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Term by term
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Replace the curve with a polynomial
:::

This step asks: can a simple polynomial stand in for sin x? A **Taylor polynomial** approximates a function near a point (here x = 0) by powers of x: c₀ + c₁x + c₂x² + …. The cyan line is sin x and the orange line the Taylor polynomial of degree n (n is the highest power). **What to do:** drag the degree n: n = 1 is the line y = x, which meets the curve only near 0; each extra term makes the orange line hug the curve farther on both sides of 0, until a whole stretch matches. The readout gives the polynomial and true value at x = 1.5, the **error** (the absolute difference) and the current polynomial. {#s0e .explain}

::: html step0-2
s0cv: Cyan: sin x; orange: Taylor polynomial, fitting farther as the degree rises
degL: Highest power n of the polynomial
:::

::: strings
legPoly: Taylor polynomial of degree {n}
s0ro: n = {n}: P(1.5) = {p}, sin 1.5 = {s}, error {e}; polynomial = {terms}.
:::

## Change the function or the expansion point: does it fit as well? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Other functions and centres
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Other functions, other centres
:::

This step asks: what decides how good a Taylor polynomial is? The **centre** a is the point we expand around, and the polynomial is written Σ cₖ(x − a)ᵏ. Choose a function (sin, cos, eˣ, 1/(1−x), ln(1+x)) and set the degree n and the centre a. **What to do:** whichever function you pick, the orange line fits best near the centre a (it passes through the white dot) and the error grows with distance; the readout compares the error 0.3 and 2.3 from the centre. For 1/(1−x) and ln(1+x) the orange and cyan lines part ways badly a bit farther right — the next step explains why. {#s1e .explain}

::: html step1-2
s1cv: Taylor polynomials of one function for different centres and degrees
centerL: Expansion centre a
:::

::: strings
s1ro: {name}, n = {n}, centre a = {a}: at x = {x} (0.3 from the centre) P = {p}, true value {f}; error {near} at 0.3 from the centre and {far} at 2.3 from the centre.
:::

## Is a higher degree always more accurate? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Error and radius of convergence
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: The edge of convergence
:::

This step asks: does adding terms always help? The vertical axis is the error (log scale) and the horizontal axis x. For sin x the error falls everywhere as n grows. But 1/(1−x) and ln(1+x) get more accurate inside |x| &lt; 1 and, for |x| &gt; 1, adding terms makes the error larger: that is the **radius of convergence**, here 1 (red dashes) — the function has a “singularity” near x = ±1 (1/(1−x) is undefined at x = 1, ln(1+x) at x = −1), and the polynomial cannot get past it. **What to do:** switch function and drag n: inside the red lines the error falls; outside it grows with n. {#s2e .explain}

::: html step2-2
s2cv: Error of the Taylor polynomial against x (log scale, centre 0): outside the red lines more terms make it worse
:::

::: strings
errAxis: error (log scale)
radLab: radius of convergence = 1
inf: ∞
limited: converges only inside |x| < radius
everywhere: converges for every x
s2ro: {name}, n = {n}: error {e5} at x = 0.5 and {e15} at x = 1.5; radius of convergence {rad} ({kind}).
:::

## How does each term follow from the function itself? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Coefficients from derivatives
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Where the coefficients come from
:::

This step asks: how are the coefficients cₖ fixed? For the polynomial to “look like” the function at the centre, the value, the slope (first derivative), the curvature (second derivative) … must all agree, which gives **cₖ = f⁽ᵏ⁾(0)/k!** (f⁽ᵏ⁾ is the k-th [[derivative#step3|derivative]] and k! = 1×2×…×k). Bar heights are the coefficients (cyan = positive, red = negative), and bright bars are the terms in use (degree ≤ n). **What to do:** sin x has only odd powers with alternating signs (1, −1/6, 1/120, …); eˣ has all coefficients 1/k!; ln(1+x) has ±1/k, which decays slowly — one reason it converges slowly. {#s3e .explain}

::: html step3-2
s3cv: The coefficients cₖ (bar heights): bright bars are terms of degree at most n
:::

::: strings
coefTitle: coefficients cₖ of {name}
s3ro: {name}: c₃ = {c3}, which is f⁽³⁾(0)/3! with f⁽³⁾(0) = {f3}; the terms up to degree {n} are in use.
:::

## How many terms to compute eˣ to six decimals? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Computing numbers
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Computing numbers
:::

This step asks: how many terms does it take to actually compute a number with a Taylor series? The series of eˣ is 1 + x + x²/2! + x³/3! + …; the bars are the absolute sizes of the terms, and after the green dashes the terms are tiny: summing up to there leaves an error below 5×10⁻⁷ (about six decimals). **What to do:** drag x: the larger |x|, the more terms are needed (about 16 at x = 3, only 7 at x = 0.5). The readout also shows the small-angle approximation: sin x ≈ x is off by only 0.0206 at x = 0.5 and by far less for smaller x — the “small-angle approximation” physics uses all the time. {#s4e .explain}

::: html step4-2
s4cv: Sizes (absolute values) of the terms of the eˣ series: terms after the green line can be ignored
xL: Variable x
:::

::: strings
enough: terms up to {n} are enough
termAxis: term index k
s4ro: x = {x}: summing to term {need} gives {approx}, true value {exact}; for comparison the cubic polynomial for sin 0.5 gives {sa}, true {se}, and sin x ≈ x is off by only {sse}.
:::

## How do Taylor (local) and Fourier (global) differ? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Taylor vs Fourier
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Two philosophies of approximation
:::

This step asks: how does Taylor approximation differ from [[fourier#step0|Fourier]] approximation of the same function? Take g(x) = 1/(1 + x²), smooth along the whole real line, yet its Taylor series has radius of convergence only 1 (its singularities sit at x = ±i, invisible on the real axis). The orange line is the Taylor polynomial of degree n: more accurate inside |x| &lt; 1 and diverging beyond; the green dashes are the cosine Fourier partial sum on [−π, π], which fits “on average over the whole interval”, so it improves everywhere in the interval without favouring a point. **What to do:** raise n and see the orange line go wild outside |x| = 1; raise the Fourier terms and see the green dashes hug the cyan line across all of [−π, π]. Taylor needs higher derivatives at one point; Fourier needs integrals over a whole stretch. {#s5e .explain}

::: html step5-2
s5cv: Cyan: g(x) = 1/(1+x²); orange: Taylor polynomial (centre 0); green dashes: Fourier cosine partial sum (interval [−π, π])
ngL: Taylor degree n (even)
nfL: Fourier terms N
recapTitle: Recap
recap1: Taylor: near the centre a approximate the function by Σ f⁽ᵏ⁾(a)/k!·(x−a)ᵏ; a higher degree fits better near the centre; the coefficients come from the derivatives.
recap2: Convergence has an edge: 1/(1−x) and ln(1+x) have radius of convergence 1 and beyond it more terms get worse; sin, cos and eˣ converge everywhere.
recap3: Taylor is a local approximation at a point and Fourier a global one over an interval; the small-angle approximation sin x ≈ x is the degree-1 Taylor polynomial.
modelTitle: Scope and limits of this model
modelText: Scope: one real variable, plotted on the real axis; coefficients from analytic formulas; the Fourier part is the cosine series of 1/(1+x²) on [−π, π] with coefficients from numerical integration (Simpson’s rule), using up to 12 terms; error readouts are double-precision results and below about 10⁻¹⁵ are dominated by rounding noise; the “radius of convergence” is demonstrated directly only for 1/(1−x) and ln(1+x), without the complex-variable explanation.
link1: → Derivatives: why the coefficients are derivatives
link2: → Fourier: the other, “global” kind of approximation
link3: → Exponentials and logarithms: the basics of eˣ and ln
:::

Page complete. {#done .readout .success i18n=text}

::: strings
legG: g(x) = 1/(1+x²)
legT: Taylor degree {n}
legF: Fourier, {n} terms
s5ro: At x = {x}: true value {g}; Taylor {tay} (error {et}); Fourier {fou} (error {ef}).
docTitle: Taylor Series · Patch the Curve Term by Term
:::
