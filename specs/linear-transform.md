# Linear transform visual spec

## Problem

The existing eigen lesson starts with a matrix's special directions. Learners who do not yet see what a matrix does to the *whole plane* can memorize `Av=λv` without understanding the basis that makes the equation useful. This slice provides the missing geometric foundation.

## Single source of truth

`math/linear-algebra/linear-transform/app.js` owns matrix state, determinant, inverse, vector application, composition, and canvas drawing. `math/linear-algebra/linear-transform/i18n.js` owns all learner-facing text. The four matrix sliders are the only user-editable matrix controls; all sections read the same state.

## Deliberate limitations

The drawings are explanatory geometry, not a high-precision plotting tool. Canvas labels round to two decimals. The lesson does not model affine translation (`Ax+t`), 3D transforms, or floating-point conditioning. `det=0` is checked with an exact zero preset in the UI; arbitrary near-zero matrices are shown with their rounded determinant and are not classified as numerically singular.

## QA evidence to collect

- `node --check linear-transform/app.js` and `node --check linear-transform/i18n.js`.
- Static key/ID check: every `data-i18n` key exists in both locales; every canvas/control ID referenced by `app.js` exists in `index.html`.
- Browser smoke: load `math/linear-algebra/linear-transform/`, move all four sliders, click every preset, toggle inverse, switch composition order, answer quiz, switch language, and verify no console error.

## Provenance label removed — 2026-11-09 Claude Code

The page carried a non-contract "Codex lesson · Linear map lab" `page-provenance` label, but no commit
(a0ef4c69, 6ee84cd7) declares `Built-By` and `authorship/overrides.json` has no entry, so the author is
unverified. Per AUTHORSHIP.md §7 the label is removed; its learner note (rounded readouts, float
computation) stays as a plain paragraph under the tagline. Recurrence check: `node tests/page-provenance-core.cjs`
fails if any label exists without an inventory record. Relabel only after the author is confirmed in
`overrides.json`. See [review](reviews/claude-pages-review-20261109.md#6-任务-2署名清单缺口).

2026-11-09: author confirmed by Yangyu as Alberto (Muse); recorded in `authorship/overrides.json` and relabelled as an original edition (see specs/visual-page-provenance.md).
