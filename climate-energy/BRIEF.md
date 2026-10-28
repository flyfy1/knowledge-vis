# Climate Energy Ledger · build brief

## Learning outcome
Learners can trace a surface energy budget from solar angle to reflection to infrared escape, and explain why changing latitude, albedo, or greenhouse opacity moves a different part of the same balance.

## Interaction contract

- Step 0 latitude slider changes solar height, relative insolation, ray angle, and the footprint message.
- Step 1 albedo slider changes reflected and absorbed energy and swaps the surface cue between snow, mixed ground, and ocean/forest.
- Step 2 greenhouse slider changes direct infrared escape, effective radiating temperature, and model surface temperature while showing re-emission arrows.
- Step 3 shuffled evidence cards accept the three causal controls and report a closed input → reflection → escape chain.
- Chinese/English toggle uses the shared `knowledge-lang` key without resetting slider state.

## Scope and model limits

The canvas is a schematic, not a geographic map or forecast. Relative insolation uses `cos(latitude)` and the temperature model uses a fourth-root radiative balance plus a teaching greenhouse offset. It intentionally omits clouds, oceans, circulation, and seasonal averaging so the direction of each causal link remains visible.
