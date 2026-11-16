---
lang: en
---

::: strings
back: ← Knowledge Index
pageTitle: The Pinhole Camera
tagline: A candle, a tiny hole, a screen — no lens at all, yet an image appears on its own, upside down. Every ray and every landing point on this page is computed from one rule — light travels in straight lines — before it is drawn. Drag, measure, and see who really decides the inverted image.
foot: The Pinhole Camera · One Interaction at a Time
navLabel: Step navigation
nav0: 0 Light goes straight
nav1: 1 The inverted image
nav2: 2 How big is the image
nav3: 3 A bigger hole
nav4: 4 Self-test
nav5: 5 Finale
:::

## Light travels straight — the shadow is the witness {#step0 h2=s0t h2part=1}

::: html step0-1
s0k: Step 0
s0e: Question: does light travel in straight lines, or can it bend its way around things? The thin arrowed lines we draw are called **rays** — they stand for the path light takes; they are a drawing convention, light itself is not a thread. Look at the scene: a small bulb glows, a round disc blocks the middle, and a screen stands behind. If light could bend, it would slip around the disc and light up the whole screen; instead a region the light never reaches is left behind — the **shadow**, where light is blocked and cannot arrive. Drag the disc (or use the slider), then press “Let the light fly” and watch whether the light dots ever travel anything but straight. One honest note: the small bulb here is treated as light coming from a single point (the **point-source approximation**), which is why the shadow's edge is sharp; a big source like the Sun gives shadows a graded fringe, which is beyond this page.
canvasLabel: Interactive ray diagram for this step; instructions appear above
s0discLab: Position of the disc (or drag the disc in the diagram)
s0play: Let the light fly ▶
reset: Reset this step
s0hint: Conclusion: **light travels in straight lines within one medium (such as air)** — a tidy shadow edge in a perfectly predictable place is the evidence. The condition is “one uniform medium”: light bounces off mirrors and bends entering water, and those are later pages' stories.
:::

::: strings
s0ro: The shadow lands on the screen: divide the screen from top to bottom into 100 equal parts — the shadow starts about {topPct} parts down from the screen's top and reaches about {botPct} parts down. Both positions come from drawing a straight line from the bulb through the disc's edge and extending it to the screen, not from sketching.
s0roFly: Light is flying, dead straight: {pct}% of the way — notice the dots only ever move along straight lines, and the ones the disc stops stay stopped on the disc.
s0roDone: Flight complete: every ray is straight, and the shadow's two edges are exactly the extensions of the disc's edges — move the disc anywhere and the shadow follows, to the unit.
cLamp: Bulb
cBlock: Disc
cScreen: Screen
cShadow: Shadow
:::

## Enter the pinhole: why is the image upside down? {#step1 h2=s1t h2part=1}

::: html step1-1
s1k: Step 1
s1e: Question: replace the disc with a board pierced by a tiny hole, so light can only pass through the hole — what appears on the screen? Call the candle's flame tip A and its base B. Press “Light the rays” and watch one at a time: the light from A passing through the hole's center — which part of the screen can it reach? And B's? The small panel at lower right is the **top view** (the same apparatus seen from directly above) — the left–right direction, invisible in the side view, is visible there. An image swapped top-to-bottom and left-to-right like this is called an **inverted image**.
s1light: Light the first ray (flame tip A)
s1hint: Conclusion: the **inverted image** is not the hole “flipping” anything — it is what straight lines crossing at the hole must produce: the top's light can only go straight, and straight takes it to the bottom.
:::

::: strings
s1light2: Light the second ray (flame base B)
s1litDone: Both rays are lit
s1ro0: No rays yet. Think first: light from flame tip A passes through the pinhole — does it land on the upper or the lower part of the screen?
s1ro1: First ray: light from A (the flame tip) passes through the hole's center and lands on the lower part of the screen (canvas {y}) — the top's light can only travel to the bottom. The image's first stroke is already flipped.
s1ro2: Second ray: light from B (the flame base) passes through the hole's center and lands on the upper part of the screen (canvas {y}). The two lines cross at the hole: the image's top end comes from B, its bottom end from A — upside down. Now check the top view: light from the left lands on the right, and from the right on the left — left and right swap too.
cCandle: Candle
cHole: Pinhole
cTopView: Top view (looking down)
cLeft: Left
cRight: Right
cImage: Image
:::

## How big is the image — who decides? {#step2 h2=s2t h2part=1}

::: html step2-1
s2k: Step 2
s2e: Question: is the image on the screen bigger or smaller than the candle, and what decides it? First, name the four quantities (they mean exactly what they say): the candle's height is the **object height H**, the candle-to-hole distance is the **object distance u**, the hole-to-screen distance is the **image distance v**, and the image's height is the **image height h**. Drag the flame tip to change H, the board to change u, the screen to change v (every quantity also has a slider). The drawing is scaled down; the numbers use the true proportions (unit: cm).
s2bridge: Keep object height fixed and try u=v, u=2v and v=2u: image height follows the distance ratio, while the hole crossing sets inversion.
geoCanvas: Pinhole ray geometry: object endpoints A/B pass through O to A′/B′. Three sliders change the parameters; the readouts and expandable mathematical connection give values and orientation for this same plot.
s2hLab: Object height H (or drag the flame tip in the diagram)
s2uLab: Object distance u (or drag the board in the diagram)
s2vLab: Image distance v (or drag the screen in the diagram)
s2peq: Object distance = image distance (u = v = 120, image same size)
s2pu2: Object distance twice image distance (u = 160, v = 80, image half height)
s2pv2: Image distance twice object distance (u = 80, v = 160, image double height)
s2hint: Conclusion: **the ideal central-ray size ratio is h/H=v/u**, from proportional corresponding sides. A finite aperture spreads an object point into a spot; its outer extent is distinct from this central-ray image size and is studied next. Expand the mathematical connection to relate slopes, similar triangles and inversion.
geoSummary: Mathematical connection · how does slope give the inverted-image ratio?
geoQuestion: Why do corresponding sides stay proportional along one ray?
geoCoordinates: Put the origin O at the hole, X rightward and Y upward; coordinates and lengths use cm. A is the object’s top and B its bottom. This drawing keeps the hole aligned with the object midpoint, including when H changes. Thus A=(−u,H/2), B=(−u,−H/2). The screen is at X=v; A′ and B′ are their central-ray landing points.
geoProof: A nonvertical straight line keeps slope k=ΔY/ΔX; through O it is Y=kX. The top ray has k=−H/(2u), giving A′ a Y-coordinate of−Hv/(2u). The right triangles on either side share an angle: they are similar, so corresponding side lengths are proportional. Crossing the hole reverses the sign of Y. Ray slope k and image magnification M are different quantities.
geoScope: This step uses central rays in homogeneous-medium geometrical optics, with parallel object and sufficiently large screen planes. u and v are positive lengths and u is at least60 cm, so no zero denominator is reachable. They can vary independently; no lens focal-length relation is used for this pinhole. The next step studies finite-aperture geometric spots in a separate fixed scene; very small apertures also require wave diffraction.
geoPrediction: Predict before comparing: keep object height60 cm and object distance120 cm fixed, then move the screen from90 cm to180 cm. What happens to positive image size and signed magnification? These buttons set only this step’s H/u/v.
geoCaseA: Case A: H60 / u120 / v90 cm
geoCaseB: Case B: H60 / u120 / v180 cm
geoReveal: Explain this fixed pair of cases
geoAnswer: In this fixed A/B pair, h changes from45 cm to90 cm and M from−0.75 to−1.50: size doubles while inversion remains. This compares the stated fixed conditions; use the live readouts for other current parameters. Equal v/u also gives equal magnification; v alone does not determine it.
geoPlotLink: Return to this step’s ray plot and sliders →
geoMathLink: Revisit slope and intercept in the straight-line lesson →
geoReturn: After inspecting the straight-line lesson, use browser Back to continue here. This history entry retains the geometry parameters, with no answer or mastery tracking.
geoSourceMath: Similarity & proportion · textbook ↗
geoSourceRays: Ray approximation · textbook ↗
geoSourceWave: Diffraction boundary · textbook ↗
:::

::: strings
geoRay: Current hole-centered coordinates: A≈({xA},{yA}) cm, A′≈({xI},{yI}) cm; top-ray slope k≈{k} (cm/cm, dimensionless). Numeric readouts are rounded after calculation from the same actual plotted endpoints.
geoImage: Subtract corresponding endpoints: signed image height h_s=Y(A′)−Y(B′)=−Hv/u≈{hs} cm. Magnification M=h_s/H=−v/u≈{M}; its negative sign marks inversion. Positive size h=|h_s|≈{h} cm. A negative coordinate difference is not a negative length.
docTitle: The Pinhole Camera · Light Goes Straight, the Image Lands Upside Down — One Interaction at a Time
s2ro: Image-size identity h=H·v/u. Currently H={H} cm, u={u} cm, v={v} cm. Calculating with the actual ratio before display rounding gives h≈{h} cm and v/u≈{ratio}. The two plotted landing points use this same geometry; rounded display numbers are not exact substitution values.
:::

## Open the hole wider — why does the image blur? {#step3 h2=s3t h2part=1}

::: html step3-1
s3k: Step 3
s3e: Question: open the hole wider, and why does the image blur? With a tiny hole, light from one point of the candle can only pass near the hole's center, and lands on the screen as one point. With a wide hole, light from that same point can pass through the hole's top edge, center, and bottom edge, and spreads on the screen into a small patch of light — a **blur spot**. Drag the aperture slider and watch how wide each of the two points' spots spreads, and how much they overlap. One statement of method: the diagram draws only 3 representative rays per object point (through the hole's top edge, center, and bottom edge); real light has countless rays and spreads into a whole patch — only 3 are drawn so the “spreading” itself stays visible.
s3bridge: Make the aperture small, then large: a small hole makes spots narrower but darker; a large hole admits more light while spreading each point wider.
s3dLab: Aperture (size of the hole)
s3hint: In this geometrical-optics model, a smaller aperture reduces the geometric spot and admitted light; a larger aperture does the reverse. Wave diffraction at very small real apertures spreads the spot and limits sharpness, so the plot cannot be extrapolated to unlimited sharpness as the hole shrinks. This step has no wavelength parameter and does not calculate a real optimum aperture.
:::

::: strings
s3ro: This step uses a separate fixed scene: H={H} cm, object distance u={u} cm, image distance v={v} cm. Spot width d(u+v)/u≈{w} cm (d={d} cm); the two spot centers are separated by H·v/u≈{sep} cm. {overlap}
s3roOverlap: The two spots already overlap — the more they overlap, the less detail the image keeps, and the blurrier it gets
s3roNoOverlap: The two spots do not overlap yet, so the image is still distinguishable
s3ro2: The light admitted grows roughly with the square of the aperture: it is now about {k}× that of the smallest hole (aperture 4), and the image is brighter. Brightness and blur are a trade — a bigger hole buys brightness and pays with blur.
cSpot: Blur spot
cIdeal: Image with a tiny hole
:::

## Self-test: four questions {#step4 h2=s4t h2part=1}

::: html step4-1
s4k: Step 4
s4e: Every answer can be verified by hand in the earlier steps. A wrong answer's feedback names the intuition that misled you; get all four right and the finale note appears.
q1t: Self-test 1 · Object height 60 cm, object distance 30 cm, image distance 15 cm — what is the image height on the screen?
q1o0: 30 cm
q1o1: 60 cm
q1o2: 120 cm
q2t: Self-test 2 · The candle stays put and the screen stays the same screen — how can the image be made bigger relative to the candle?
q2o0: Open the hole wider
q2o1: Move the screen farther away (increase the image distance)
q2o2: Blow the candle brighter
q3t: Self-test 3 · Compared with the candle, which way does the image on the screen face?
q3o0: Only top and bottom swap; left and right stay
q3o1: Exactly the same as the candle
q3o2: Top–bottom and left–right both swap
q4t: Self-test 4 · Open the hole very wide — what happens to the image?
q4o0: It gets bigger
q4o1: It disappears
q4o2: It gets blurry
:::

::: strings
q1why: h = object height × image distance ÷ object distance = 60 × 15 ÷ 30 = 30 cm — the image distance is half the object distance, so the image is half as tall (in Step 2 you can drag to exactly these numbers and check).
q1w1: This turns “same size when image distance = object distance” into “the image is always the same size as the object”. Same size is only the special case v = u; here v is half of u.
q1w2: The ratio is upside down: h = object height × (image distance ÷ object distance), and image ÷ object distance = 15 ÷ 30 = 0.5; you computed object height × (object distance ÷ image distance).
q2why: Image height ÷ object height = image distance ÷ object distance: with the object distance fixed, moving the screen farther away grows the image distance, and the image grows by the same factor (Step 2).
q2w0: A wider hole only blurs the image (Step 3: each point spreads into a bigger spot); size is decided by the ratio of the distances, and the hole has no part in it.
q2w2: Blowing brighter changes the image's brightness, not its size; size depends only on image distance ÷ object distance (Step 2).
q3why: The rays cross at the hole: the top–bottom rays cross once, and the left–right rays cross too — in Step 1's top view, light from the left lands squarely on the right.
q3w0: That is the side view talking: in the side view you can indeed only see top and bottom swap; Step 1's top view supplies the other half — left and right swap as well.
q3w1: If the image were exactly the candle, no crossing at the hole would be needed — in Step 1 the flame tip's light plainly landed at the bottom of the screen.
q4why: The wider the hole, the wider each point's blur spot, and the more neighbouring spots overlap — so the image blurs (Step 3). Blurred, not gone.
q4w0: The hole's size never enters the image-height formula (Step 2: size is decided by the distance ratio alone); a wider hole changes sharpness, not size.
q4w1: However wide the hole, light still passes through it onto the screen — each point just spreads into a large spot and the spots merge until nothing can be told apart. The image blurs; it does not vanish.
fbRight: Correct.
score: Quiz progress: {k}/4 correct, {f} of them on the first try.
scoreIdle: Quiz progress: not started yet.
gateDone: All four correct! The three conclusions all stand — go to the finale (Step 5) to gather them into three sentences, then follow the links to see what happens when light meets a mirror, and when the hole becomes a lens.
:::

## Wrap-up: pinhole imaging in three sentences {#step5 h2=finT h2part=1}

::: html step5-1
finK: Finale
fc1t: Light goes straight — the shadow testifies
fc1b: Within one medium, light travels in straight lines: a shadow's tidy edge in a perfectly predictable place is the everyday proof.
fc2t: Straight lines cross at the hole — the image inverts
fc2b: The flame tip's light can only land at the screen's bottom, the base's at the top, and the top view shows left and right swapping too. Nobody flips the image; crossing straight lines make inversion unavoidable.
fc3t: Image-height ratio = image distance ÷ object distance
fc3b: The central-ray image-to-object size ratio follows v/u; finite aperture changes geometric spot width and admitted light. Very small apertures are also diffraction-limited, so real sharpness cannot be judged from geometric spots alone.
finLink1: Light goes straight — until it meets a mirror, which bounces it back by “angle of reflection = angle of incidence”. <a class="fourier-link" href="../reflection-refraction/#step0">See the rules of the bounce →</a>
finLink2: Swap the pinhole for a convex lens and the image is still located by rays: the lens page finds image points with three well-behaved rays, and the one through the optical center travels straight — the very same principle as this page's ray through the hole. <a class="fourier-link" href="../lens/#step1">See the three rays on the lens page →</a>
finNote: Cameras and eyes are both descendants of this imaging idea — how they form images grows out of this little dark box.
:::
