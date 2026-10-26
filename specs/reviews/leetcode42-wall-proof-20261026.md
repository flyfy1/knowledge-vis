# LeetCode 42: from two walls to a safe pointer decision

## Problem and bounded change

The accepted lesson already had a reversible optimized trace and readable Python,
but the causal water-level derivation was prose. Add a four-phase per-column
experiment before the two-pointer explanation: find the left maximum, find the
right maximum, take their minimum, subtract the selected bar. The learner can
change the far-right height, choose a different column, and inspect edge cases.
The water diagram, numeric readouts, explanation and highlighted baseline line
must describe the same phase.

Base: remote `main` verified read-only as
`93346e21e375bda4f27ef545dd788586bf8ae58f` on 2026-10-26.
Branch: `codex/leetcode42-wall-proof-20261026`.
The original dirty checkout and other active worktrees are preserved. Changed
runtime paths are limited to `leetcode/42/`; no common renderer, navigation,
registry, homepage, deployment configuration or Claude source is touched.

## Regression acceptance criteria

1. **Causal distinction:** [3,0,2,0,1] at i=2 has right maximum 2 (the interior
   bar), surface 2, depth 0. Raising the last bar to 4 gives depth 1; raising it
   again to 6 leaves depth 1. Never equate the last bar with the right maximum.
2. **Progressive evidence:** phase 0 exposes only the left maximum; phase 1 adds
   the right; phase 2 draws the water-level line; only phase 3 displays a numeric
   depth and cyan water cells. Cyan count equals the selected depth, not the sum.
3. **Exact reversal:** previous removes later-stage numbers and water. Next after
   previous reproduces the original state. Initial previous and terminal next
   are disabled. No background animation or timers exist.
4. **Reset meanings:** reset steps retains the edited array and index. Restore
   default restores [3,0,2,0,4], i=2. Any preset, focus, or height change resets
   phase before drawing. Current-array text reflects edits even when the preset
   selector still names its starting array.
5. **Edge coverage:** both endpoints, one bar, all zero, equal heights, lower
   right wall, zero right wall, and equal limiting walls follow the same formula.
   Full ranges include the selected bar so depths cannot be negative. At level
   zero the orange surface marker lies on the baseline.
6. **Algorithm transfer:** explicitly distinguish the full-range baseline maxima
   from the optimized trace's running maxima. Explain why the side with the lower
   refreshed maximum is safe, including equal maxima. Keep the existing readable
   Python, official callable, O(n) time / O(1) auxiliary-space claim, copy and
   download behavior intact. Lab snapshots are teaching storage.
7. **State isolation and bilingual UI:** language preserves current input, phase,
   trace state, and focus. Storage denial must not break language switching.
   This experiment must never move the existing optimized trace or its quiz.
8. **Readable interaction:** 320, 390, 768, 1440px and 200% CSS zoom have no page
   overflow; controls are at least 44px high, keyboard-operable and labeled;
   color meanings are also named in text and numeric readouts. Live explanation
   and chart accessible name must represent the same calculation. Visually inspect
   actual viewport screenshots, accounting for the sticky navigation.
9. **Independent calculation checks:** compare every column of arrays length
   1–6, values 0–4 against a unit-cell containment oracle that does not use the
   min/max formula. Verify witnesses and input immutability. Run original Python
   and optimized-model regression tests separately.
10. **Authorship and routes:** visible Chinese `Codex 开发` and English
    `Developed by Codex`. Keep canonical source `leetcode/42/`; existing static
    builder produces `/leetcode/42-codex/` and preserves search/hash in numeric
    redirects. Do not create or claim a Claude variant. Do not alter publication
    acceptance fingerprints or register a new problem to bypass review.

## Evidence and integration

Evidence is author self-checking, not independent acceptance. The new model tests
cover 19,530 arrays / 112,305 positions. Existing Python tests cover 22,355 inputs;
existing optimized model tests cover 3,284 inputs / 27,914 frames. Browser tests
exercise both locales, 119 preset/index/last-height combinations per locale,
replay/reset, restore, keyboard, storage denial and simulation isolation.
The original browser suite also passes its four presets, quiz feedback, exact
Python display/copy/download/fallback, anchors, offline loading and storage denial.
Its only external preview issue is the pre-existing missing favicon. New viewport
screenshots and JSON receipts live in `leetcode/42/tests/evidence/wall-proof/`.

Runtime additions: `wall-model.js`, `wall-lab.js`, `wall-lab.css`; `index.html`
loads them, `app.js` mounts the isolated lab after the original lesson. The
publication builder collects these ordinary local assets without new wiring.
The integration owner should merge/cherry-pick this branch, arrange independent
review, then include these assets in the standard static export for
`/leetcode/42-codex/#wall-lab`. No push or deploy is performed by this workstream.
No physical device, native browser-toolbar zoom, production service, actual
LeetCode submission, or measured learning outcomes are claimed.

The generated `42-codex/` route passed the complete new browser suite. A separate
`tests/wall-route.cjs` check verifies numeric redirect query/fragment preservation,
visible attribution, and byte parity of all eight runtime files. Run that test
against a generated preview, not the numeric authoring tree. Final viewport
images were inspected at English 320px, Chinese 390px and Chinese 1440px; the
water cell, depth readout and highlighted subtraction agree and controls fit.
Runtime file hashes and algorithm results are in `algorithm-results.json`;
`results.json`, `route-results.json`, and `original-browser-results.json` record
browser evidence. Independent review remains pending.
