# Geometry→optics: next-loop inventory, not implementation

**Preferred next question:** Why does moving the screen change a pinhole image's size by a predictable ratio?

Reuse `linear-functions/#step2` (straight-line equation/slope) and `pinhole-camera/#step2` (image-size ratio), with a short prediction and actual existing sliders. This is a geometry-to-light-path connection with no new optics engine or lab controller. Neither course currently links back to the other; pinhole's existing finale instead links reflection#step0 and lens#step1. Do not force an inaccurate Pythagoras prerequisite: the relevant mathematical fact here is straight-line slope/similar ratios.

## Actual source evidence

- Linear-functions step2 combines slope/intercept into y=kx+b, and step3 treats intersections. Existing controls and coordinate examples already own those tasks.
- Pinhole's `lineYatX` constructs screen intersections from the object point and hole; `imageEnds` applies it to both endpoints; `imgH(H,u,v)=H*v/u`. These are actual calculations, not hand-drawn image sizes.
- Existing state constraints: H30…90,u60…180,v60…180, rounded to whole units. All three have slider equivalents to dragging.
- Source-only CLI examples in `optics-model-cases.json` give H60,u120,v90→h45; changing v to180 gives h90. Keeping v/u=1.5 with u60,v90 also gives h90. A learner can predict these within the actual controls, then read the ray/image result.

Use the hole as coordinate origin to explain one straight line. A top point on the object side and its screen point have the same line slope; crossing to the other side changes vertical sign. For total positive image height h, h/H=v/u. Signed transverse magnification is−v/u in an upward-positive convention; do not confuse positive size with image orientation.

## Smallest useful next scope

An explicit connection/prediction between these two existing sections, plus a return path that keeps the original lesson context. First ask whether doubling v at fixed H,u doubles h; use v90→180 so the proposed action is reachable. Then compare equal v/u ratios. Do not automatically add one graph node per geometry/optics directory. If an atlas entry is later justified, name the exact concept/learning relation; do not reuse the existing vector/matrix node as if it meant every straight-line equation.

## Conditions to audit before building that connection

- Straight rays assume a uniform medium and a geometrical-optics approximation. The diagram is not a proof that light has no wave behavior. [OpenStax geometric-optics introduction](https://openstax.org/books/college-physics-2e/pages/25-introduction-to-geometric-optics) and [ray aspect](https://openstax.org/books/college-physics-2e/pages/25-1-the-ray-aspect-of-light) distinguish the ray regime from wavelength-scale effects.
- The current pinhole step3 says smaller holes are sharper/dimmer without a nearby explicit diffraction limit. Before promoting it as a general model, qualify that statement as this geometrical model; very small apertures require wave optics. Do not add a diffraction solver or claim an optimum real pinhole size in the proposed loop.
- h/H=v/u is the small-aperture central-ray geometry; finite aperture creates a patch. Current `spotWidth` and three representative rays explain geometrical blur but are not wave/photometric predictions.
- Geometry does not cause the straight-ray law. Present it as a mathematical description under optical assumptions, analogous to avoiding “the circle physically causes the spring” in the earlier work.

## Other existing candidates, deferred

`trig/#step1` → `reflection-refraction/#step2` is also a good later angle/normal/Snell loop. Actual code has n_air=1,n_water=1.33, scalar/vector Snell and total-reflection handling. It introduces another physical boundary/angle convention and is a different question from image-size ratios.

`linear-functions/#step3` → `lens/#step1` offers ray-intersection geometry, but thin-lens/paraxial assumptions and real/virtual/infinite images need their own review. Actual lens code uses a0.5-unit near-focus classification tolerance; it must be described as a display/control tolerance, not an exact physical interval where all images are at infinity. This is a review candidate, not an audited bug requiring repair this round.

No browser was started and no optics course/model was changed. This inventory does not certify the old courses' complete physics, state recovery or accessibility. Choose one next task after finishing the current keyboard loop; do not expand spring functionality to fill unrelated coverage gaps.
