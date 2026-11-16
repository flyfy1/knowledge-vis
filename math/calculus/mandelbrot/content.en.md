---
lang: en
---

::: strings
docTitle: The Mandelbrot Set · Zoom Forever
back: ← Knowledge Index
pageTitle: The Mandelbrot Set
tagline: One line of primary-school arithmetic — square z, add c, repeat — draws a map of infinite complexity. This page lets you zoom into it: a hundred billion times deeper, and the scenery is still not finished.
foot: visual.integ.life · The Mandelbrot Set — the One Interaction at a Time series
:::

## Zoom in a hundred billion times — still no bottom {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · Start playing {#s0k .step-kicker i18n=text}

This is the Mandelbrot set in full: a cardioid "heart" just right of centre, a long thin antenna trailing off to the left, ringed with bulbs, tendrils and spirals. It comes from a single line of maths: start from z = 0 and keep computing **z ← z² + c**. Each point of the picture is a c — if the iteration never runs away, the point is painted black; if it escapes, it is coloured by how fast it got out. **Try it now**: drag a box on the picture to zoom in (on a touchscreen, drag the box with one finger — it works exactly the same way), or use the mouse wheel, or double-click — and watch the detail keep growing. {#s0e .explain}

::: html step0-1
s0reset: Back to full view
:::

Drag a box (one finger on a touchscreen), scroll, or double-click to zoom. Dive toward the tip of the antenna on the left, or into the spiral clusters along the edge of the main body — that is where the rest of this page will look closely. {#s0hint .hint i18n=text}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: Zoom <span>{zoom}</span> · Centre <span>{cx}, {cy}</span> · Iteration cap <span>{iter}</span>
cZoom: zoom
:::

## Square, add c, repeat: the two fates of a point {#step1 h2=s1t}

::: strings
nav1: 1 One point's life
:::

Step 1 · The life of one point {#s1k .step-kicker i18n=text}

Forget the whole picture for a moment and watch **one single c**: starting from z₀ = 0, apply z ← z² + c over and over. The orbit has only two possible endings — it soon bursts out of the circle of radius 2 drawn here (**it escapes**, and this c is not in the set), or it wanders inside the circle forever (**it stays**, and c belongs to the set). Click or drag on the plane to place c, or use the presets, and watch the orbit grow step by step. {#s1e .explain}

::: html step1-1
s1step: Step →
s1reset: Reset orbit
s1pEsc: Preset: an escaping point
s1pStay: Preset: a point that stays
s1pCycle: Preset: a point that cycles
:::

After you change c (click or drag on the plane, or use a preset below), the orbit restarts at z₀ and does not keep growing on its own — press Step → or ▶ Play again to watch the new orbit grow. The circle is not decoration: step 2 proves that once |z| passes 2 it can never come back. Crossing the circle is the verdict. {#s1hint .hint i18n=text}

Playback speeds up as it goes: one step per beat for the first 10 steps, then 2 steps per beat, and 5 per beat from step 30 on. Speeding up only means several steps per beat — every step is still really computed and drawn, and the readout always shows the true current step. Nothing is skipped. {#s1accel .hint i18n=text}

::: strings
s1play: ▶ Play
s1pause: ⏸ Pause
s1roC: Current c = <span>{c}</span>
s1roStep: Step {n}: z = {z}, |z| = <span>{mod}</span> (still inside the circle)
s1roEsc: Step {n}: z = {z}, |z| = <span>{mod}</span> &gt; 2 — it has burst out of the escape circle! This c **escapes**; it is not in the set.
s1roStay: {n} steps walked, |z| = {mod}, and it has never left the circle — this c **stays**; it belongs to the Mandelbrot set.
s1roCycle: Step {n}: z = {z}, |z| = <span>{mod}</span> — the orbit has started repeating (a cycle); it will never escape.
cEscCircle: escape circle |z| = 2
cPointC: c
:::

## Why exactly 2? {#step2 h2=s2t}

::: strings
nav2: 2 Why 2?
:::

Step 2 · The dividing line {#s2k .step-kicker i18n=text}

The criterion is one sentence: **once |z| exceeds 2, it never comes back.** Here is the arithmetic: if at some step |z| &gt; 2 and |z| ≥ |c|, then the next step gives |z² + c| ≥ |z|² − |c| ≥ |z|·(|z| − 1), and the factor in brackets is greater than 1 — so |z| is multiplied by an ever-growing factor at every step, snowballing away for good. That is why drawing this picture only ever requires watching each point until it leaves the circle. {#s2e .explain}

::: html step2-1
s2iter: Iteration cap (how long you watch before judging)
:::

Drag the slider and watch the black region: with a tiny cap (say 5), many boundary points that would eventually escape have not left yet and get wrongly convicted as "staying" — the black region is a fat rough draft. Raise the cap and it tightens onto the true boundary. The deeper you zoom, the slower the boundary points escape — which is why deep zooms must raise the cap automatically (watch the readouts in steps 0 and 4). {#s2note .hint i18n=text}

::: html step2-2
s2diagT: How the snowball runs away: |z| step by step for c = 0.8
:::

::: strings
s2ro: Iteration cap <span>{iter}</span> · area judged "stays" (black) ≈ <span>{pct}%</span> of the frame
cWall: escape line |z| = 2
:::

## Colour = how long each point struggled {#step3 h2=s3t}

::: strings
nav3: 3 Where colour comes from
:::

Step 3 · Where the colour comes from {#s3k .step-kicker i18n=text}

The black-and-white version only answers "in or out". But the colours are all information too: **colour is decided by the number of iterations a point needed to escape** — the slower it runs, the closer it lives to the boundary, the larger the count. Switch between the three colourings of the same view below: banded colouring uses the integer count, and neighbouring bands visibly "click" as they jump (that is the quantisation of whole numbers); smooth colouring uses a formula to turn the count into a fraction, and the steps melt away. {#s3e .explain}

::: html step3-1
s3bw: ① Black & white
s3band: ② Banded
s3smooth: ③ Smooth
pal0: Deep space
pal1: Lava
pal2: Aurora
s3formulaT: Smooth count ν = n + 1 − log₂(ln|zₙ|)
s3note: n is the integer step at which the point escaped, and |zₙ| is its modulus at that moment: the more "reluctantly" it escaped, the larger the fractional part. Treating ν as a step count with decimals and colouring by it makes the terraces between bands vanish. Every picture on this page uses exactly this formula — the implementation you are looking at is the real thing.
:::

::: strings
s3ro: Colouring: <span>{mode}</span> · Palette: <span>{pal}</span> (switching re-colours only — the iterations are not recomputed)
:::

## A tour of the famous places {#step4 h2=s4t}

::: strings
nav4: 4 Dive in
:::

Step 4 · Dive in {#s4k .step-kicker i18n=text}

The boundary of this picture has a few "sights" worth a dedicated trip. Click a bookmark to fly there (every coordinate has been test-rendered for its composition), then keep digging with the wheel and drag-box. Watch the **scale of a single pixel** in the readout: it soon needs scientific notation. {#s4e .explain}

::: html step4-1
bm0: Seahorse Valley
bm1: Elephant Valley
bm2: Top spiral
bm3: Mini-Brot
s4reset: Back to full view
s4warn: ⚠️ Approaching the limit of double-precision floating point: ordinary numbers carry only about 15–16 significant digits, so beyond a zoom of roughly 10¹³–10¹⁴, neighbouring pixels start computing the very same c and the picture breaks into blocks and repeats. This is not the end of the fractal — mathematically the boundary is still infinitely detailed — it is the end of this screen’s arithmetic. Going deeper takes arbitrary precision or perturbation methods.
:::

Bookmarks are just starting points: every stretch of boundary can be dug further. The centres of spirals and the forks of tendrils are where the detail is densest. {#s4hint .hint i18n=text}

::: strings
s4ro: Zoom <span>{zoom}</span> · Centre <span>{cx}, {cy}</span> · One pixel = <span>{pix}</span> · Iteration cap <span>{iter}</span>
:::

## Inside it, there is another one {#step5 h2=s5t}

::: strings
nav5: 5 Mini-brots
:::

Step 5 · Self-similarity {#s5k .step-kicker i18n=text}

Deep in the spirals and tendrils above the main body hides a small island: **the whole Mandelbrot set, appearing again at a smaller size**. But it is not copy-and-paste — lay the outline of the full set over the little one and the tendrils and details do not match exactly. The self-similarity is *approximate*, and that is exactly what separates a fractal from an ordinary pattern. {#s5e .explain}

::: html step5-1
cInset: Full set · the island is here
s5mini: The mini-Brot in full
s5drill: Drill one level deeper into it
s5home: Back to the whole set
s5overlay: Overlay the outline of the full set
:::

Islands like this are everywhere along the boundary, beyond counting — each carries its own spirals and tendrils, and each hides smaller islands inside. That is why a hundred billion times deeper still is not the bottom. {#s5note .hint i18n=text}

::: strings
s5ro: Now viewing: <span>{where}</span> · Zoom <span>{zoom}</span> · One pixel = <span>{pix}</span>
s5whereMini: a mini-Brot (above the main body)
s5whereDeep: inside the mini-Brot
s5whereHome: the full set
:::

## Every point is a new picture: Julia sets {#step6 h2=s6t}

::: strings
nav6: 6 Julia sets
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Finally, turn the viewpoint around: instead of letting c roam the whole plane, **fix one c** and let every point of the plane serve as z₀ for the same formula z ← z² + c. The picture you get is the **Julia set** of that c. Click or drag c on the left picture and the right one redraws in real time. There is one rule, and it never comes out backwards: **if c is in the Mandelbrot set, its Julia set is one connected piece; if c is outside, it shatters into dust.** {#s6e .explain}

::: html step6-1
s6leftT: The Mandelbrot set · click to pick c
s6rightT: The Julia set of c
j0: c = −0.123 + 0.745i (inside)
j1: c = −0.8 + 0.156i
j2: c = 0.5 + 0.5i (outside)
:::

Drag slowly along the boundary of the left picture: the Julia set morphs endlessly between connected blobs and dust — the c values hugging the boundary give the most intricate pictures. That is the sense in which the Mandelbrot set is a map of all Julia sets: wherever you point on the left, the right shows you the scenery there. {#s6note .hint i18n=text}

::: html step6-2
s6fin: Look back over this page: one rule, z ← z² + c, first decides the fate of a single point, then paints a whole plane, then grows islands and spirals as you zoom, and finally turns out to be the index of all Julia sets. **One line of formula, an entire world** — the same shock as the spinning circles on the Fourier page.
:::

::: strings
s6roIn: c = <span>{c}</span>: inside the Mandelbrot set → the Julia set on the right is **connected**, a single piece.
s6roOut: c = <span>{c}</span>: outside the Mandelbrot set → the Julia set on the right has **shattered into dust**.
s6roTest: (judged with {iter} iterations)
:::
