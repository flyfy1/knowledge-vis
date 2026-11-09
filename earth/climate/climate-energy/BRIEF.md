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

- 2026-11-09 canvas 文字修复（Claude Code，self-check）：两行温度结论改为上下排列；温室遮挡率标注右对齐、窄屏换行；纬度说明移到右上角，并补上中文（原来中文界面显示英文 nearly overhead 等）；地表类型标注也改为双语。 依据 specs/reviews/canvas-text-survey-20261109.md 的复查，修后 `tests/canvas-text-overlap.cjs --sweep` 通过。
