# #980 author self-check — candidate v2

Author run only. Independent per-problem review is pending. No separate agent review, independent acceptance, LeetCode submission, public deployment, or actual learner result is claimed. CANDIDATE.json freezes the final files; exact model identifier is unavailable.

Official verification: public unauthenticated GraphQL captured 2026-10-26 in tests/evidence/official-graphql.json, with all observed selector snippets. Python3 Solution.uniquePathsIII(grid) is faithfully supported. The official three examples, grid semantics and mn<=20 constraints were verified. Source and observation notes are in official-verification.md. No paywall or credential access was used.

## Actual checks

All commands ran from the repository root. Final output-producing runs used OUTPUT_DIR=leetcode/980/tests/evidence/v2. Reproduction commands and environment support are in tests/README.md.

- `python3 -B leetcode/980/tests/test_solution.py`: passed 1,070 exhaustive small-board cases, 250 seeded cases (seed 980), nine official/boundary fixtures, including a 20-cell corridor (1) and 4x5 all-open board (20). Canonical Python executed against independent permutation/subset-counting oracles. Input restoration checked on every case.
- `node leetcode/980/tests/test_core.cjs`: passed all 720 frames across six presets. Tested exact path membership, uniqueness, adjacency, remaining count, entry/undo transitions, accepted terminal coverage, cumulative counts, final expected totals and restored empty route. Canonical offline mirror exact, including final newline. COPY keys unique before parsing; every entry has two nonempty strings.
- `node leetcode/980/tests/browser.cjs`: passed on real headless Chromium at the existing preview, both locales, all six presets and every event to endpoints; rewind/replay, reset/end, preset restart, all prediction choices, reveal/change, locale preservation, keyboard Enter and focus outline, deep-link position, blocked storage, offline source display and local requests. Every selected preset label fits at 320px. Display, automatic clipboard, fresh-sentinel native Ctrl+C fallback, and actual download bytes equal solution.py in both locales. Browser host Linux. No page/asset errors; runtime requests local.
- `node leetcode/980/tests/visual_states.cjs`: passed early E, undo, full accepted walk, correct fresh prediction, console-error monitoring, forced-colors focus, reduced motion, keyboard Tab and CSS zoom 200% in both locales.
- `python3 -B leetcode/980/tests/contrast.py`: passed measured sRGB contrast for inherited actual opaque palette roles. Muted panel2 text 6.449:1; main text >=13.397:1; focus against the darkest-to-lightest surfaces >=8.937:1. Disabled controls have opacity 1. Shipped shared+local CSS 11,371 bytes, below 25,000.
- `python3 -B scripts/register_leetcode_lesson.py 980 --validate-only`: exit 0, no output. Final command/result is recorded in tests/evidence/v2/preflight.json. No registration or shared-file mutation performed.

## Visual observations and revision

Inspected screenshots with the image viewer, rather than treating their generation as a pass. V1 inspection found a default English selected label clipping in the native dropdown at 390px. Historical evidence and v1 runtime hashes remain under tests/evidence; author-finding-01.md records the finding. V2 shortens labels, bumps asset references and adds selected-label width checks for all presets/locales at 320px. V2 numerical/core/browser checks all reran.

Inspected v2 en-early.png, en-undo.png, zh-accept.png, en-320.png, zh-320.png, en-1440.png and zh-zoom-reflow.png, plus header/prediction/zoom captures from the same unchanged layout in v1. Confirmed readable coordinate/input/order labels; E retains original identity while its route mark disappears on undo; remaining changes 2 -> 3 on returning to S; accepted route is #1,#2,#3,#4 with remaining=0 and cumulative count=1. At 320px four columns stay equal and legible; readouts wrap with values attached to their labels. The corrected preset label is wholly visible. Desktop groups remain aligned. Zoom checks additionally use CDP page scale 2 and 720 CSS px reflow equivalent to a 1440px desktop at 200%; browser-chrome and real-device zoom are not claimed.

Localization semantic binding observed in both languages: early E means branch contributes 0 with 2 unused cells; undo restores the same parent route; complete coverage contributes 1 with 0 unused; incorrect exercise choices explain failed branches while the correct choice explains 0 total; clipboard fallback explains manual copying and retains exact full source. Locale changes preserve the trace/preset and selected/revealed prediction.

## Boundaries

This evidence is an author self-check, not the independent cold walkthrough or six-dimension acceptance report. Real novice teach-back, physical phones, public delivery and LeetCode acceptance are unverified. Static simulation stores snapshots and cumulative routes separately from the submission's local totals and O(V) stack. Related #51/#step2 and #115/#step1 resolve in the local preview. Shared registry and CONCEPT-MAP edits are outside this run's ownership; lesson-local concepts and verified anchors are ready for the authorized dispatcher.
