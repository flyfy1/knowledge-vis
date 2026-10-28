# Standing-wave · phase landmark probe

## Problem
The phase step already marks nodes and antinodes on the rope and classifies P, but a learner still had to estimate distances from the canvas. That made the key spatial rule (node-to-node and antinode-to-antinode spacing is λ/2) harder to verify with a non-preset position.

## Contract
- Add one live bilingual readout beside the existing phase readouts.
- Compute the nearest node from `λ/4 + mλ/2` and the nearest antinode from `mλ/2` with the same current `x` and `λ` as the canvas.
- Display both distances and the invariant `λ/2`; do not round inputs before calculating.
- Keep the probe read-only: no new state, history fields, timer, or quiz behavior.
- Preserve node (zero-amplitude / phase undefined) and antinode classifications and all existing controls.

## Recurrence checks
1. At λ=2.1 and the node preset x=.525, nearest-node distance is 0 and nearest-antinode distance is 0.525.
2. At x=0 (antinode), nearest-antinode distance is 0 and nearest-node distance is λ/4.
3. At x=λ/2 (next antinode), nearest-antinode distance is 0 and λ/2 is reported unchanged.
4. Switching zh↔en preserves x, λ, time and the probe values.
5. The two locale dictionaries and all placeholder sets remain equal; the probe remains readable at the existing 320px / 390px checks.
