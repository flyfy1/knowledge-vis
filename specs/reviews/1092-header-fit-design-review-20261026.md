# Independent design review: #1092 header fit repair

**Recommendation adopted by root: reuse the existing table and repair only header label fitting.** This is a required readability repair for `1092-R1`, not a new visualization. The subsequent implementation brief and candidate review remain separate; no implementation or finding closure is claimed here.

Applied `~/Documents/agent-skills/website-design/SKILL.md`. Read the archived required review/geometry, visually inspected `en-320-zoom2-header-settled.png`, and read actual Pi `leetcode/1092/style.css`, `app.js`, relevant copy and markup. The reported candidate is `5cf73ee858d9a8938b55206c867233a8397d60f6`; review commit `093440bf6df89b6a5dbc7a958ae3aef588b9acff`. No Pi files were edited; the interrupted fix's untracked experiments were not inspected or changed.

## Diagnosis and product fit

The reader needs the full column identity while associating a DP value with its row. At English 320px/CSS zoom 2, the full `8 · empty` text is 104.28125px wide, but only 95.15625px remains to the right of the sticky corner. The settled screenshot visibly loses `8 ·`; a no-page-overflow assertion cannot detect this.

`render()` currently writes each header as one text node; the corner says `i row / j col`. The table uses `width:max-content`, `table-layout:fixed`, cell minimum widths 52px (48px below 600px), and sticky first-column/corner headers. Large intrinsic single-line header widths consume the usable strip. Removing sticky headers would lose the row association this visualization needs. Renaming `empty`, omitting the index, shrinking text or replacing the table would weaken the learning flow instead of repairing it.

## P0 repair contract

The highest-return change is **constrain and wrap header content while letting header height grow**. Keep the semantic `table`, `thead`/`tbody`, `th scope=col/row`, native scroll region, sticky row headers/corner, current/path marking and all data cells.

- Prefer the smallest CSS-only header constraint that passes actual text geometry, using the existing **52px desktop / 48px narrow** sizing. If table layout prevents reliable constraint, a small header-local inner label is allowed. Let the full existing label wrap naturally at the index/separator/value and corner row/column boundaries. A header-only explicit break between identity parts is acceptable if needed after measurement; retain complete localized text and logical reading order. Do not add a fixed height, ellipsis, clipping or font reduction. Avoid global wrapping changes to numerical data cells or unrelated lesson copy.
- Keep existing 10px/8px cell padding, palette, text sizes/weights, radii, focus style and breakpoints unless actual geometry proves an additional header-only adjustment necessary. Any such exception must be recorded before implementation. No new token family, dependency, generic grid component, timer or animation is needed.
- Preserve the same column widths for header/body association and keep the sticky corner's opaque background and stacking treatment. Horizontal scrolling remains supported. A header may temporarily move under the sticky area while scrolling, but each complete column label must be exposable in the remaining strip at a reachable scroll position; the terminal empty-suffix header must be fully readable at the right endpoint.
- Algorithm/model, frame ordering, reconstruction/tie rule, preset selection, controls, quiz state, code source/clipboard/download and localization meaning remain unchanged. A minimal wrapper inside the existing header rendering is an allowed presentation hook; it must not reset state or add an alternative data source.

## Required verification for the future candidate

First reproduce the archived red case against the unchanged candidate. Then test the actual changed rendering in EN/ZH at 320px and CSS zoom 2, the a×8/a×8 preset, completed trace and maximum horizontal scroll. Measure **each actual text line rectangle**, not only the union or header cell box: its visible area must lie inside the scrollport and outside the opaque sticky corner. Include the complete `8 · empty`/`8 · 空` identity, corner wording and row label. Inspect settled screenshots as well as geometry; where line rectangles touch a boundary, use an explicit small subpixel tolerance rather than silently ignoring occlusion.

Check left/middle/right scroll positions, first and terminal columns, initial/fill/reconstruction/end states, the other short presets, desktop and unzoomed narrow widths. Recheck locale switching after scrolling and stepping: no clipped text, stale header language, lost frame or altered values. Keep keyboard access/focus to the scroll region, readable sticky row association and truthful disabled controls. Rerun existing relevant browser/core/source-parity checks; extend the existing header/layout test rather than adding another framework. Record CSS zoom as such, not native browser zoom or physical-device proof.

Loading/network/expiry states are inapplicable to this synchronous presentation change. Existing state/error behavior stays unchanged. **P1: none required. P2: none. Deferred:** table redesign, mobile alternate visualization and new navigation controls; there is no demonstrated need once the full identity fits. Any broader alternative would require fresh design review.

## Dispatcher adjudication

Root explicitly adopted this bounded contract: header-only wrapping/sizing, unchanged full text and semantic table/sticky rows, existing 52px/48px values and automatic height. Root preferred a CSS-only correction when actual text geometry passes; an inner wrapper is allowed only if needed for reliable constraint. Root retained the prohibitions on font shrinking, abbreviation, removing sticky association and state changes. No broader redesign was adopted. The author may proceed after this approved contract is copied into the isolated author worktree and recorded in its implementation brief.

This review provides source inspection and inspection of the original failure screenshot, not evidence that the proposed CSS/markup already works. The author must produce a new candidate, and a separate fresh lesson review must close `1092-R1` with rendered evidence.
