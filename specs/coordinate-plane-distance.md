# Coordinate-plane step 6 · midpoint, components and distance

## Purpose
The coordinate-plane page already establishes ordered pairs and quadrants. Step 6 closes the loop from an address pair to a geometric segment: learners can manipulate two points and see the same state expressed as a vector, orthogonal components, midpoint, distance and slope.

## Behavior contract

- `A` and `B` are integer lattice points in `[-6,6]²`; each point is draggable and also has x/y range sliders.
- `Δx` and `Δy` are always computed as `B − A`. The cyan arrow points from A to B, so swapping endpoints changes component signs and slope sign.
- The midpoint is `(Ax+Bx)/2, (Ay+By)/2`; it may be fractional even though endpoints are integers.
- Distance is `Math.hypot(Δx, Δy)` and the square check displays `|AB|² = Δx² + Δy²` from the same state.
- A vertical segment reports an undefined slope rather than a fabricated number.
- The components button only changes the dashed construction layer; it never changes the geometry or readouts. Reset restores A=(-3,-2), B=(4,3), components on.
- All labels and readouts use the existing bilingual `t()` dictionary and re-render through `onLangRefresh`.

## Acceptance

- `node --check coordinate-plane/distance.js` and `node --check coordinate-plane/i18n.js` pass.
- `node tests/coordinate-distance.cjs` covers delta, distance, midpoint, slope, vertical slope and clamping.
- At 390px width the canvas remains within its stage; slider values and readout stay visible.
- Switching language preserves A/B state and redraws labels/readouts only.
