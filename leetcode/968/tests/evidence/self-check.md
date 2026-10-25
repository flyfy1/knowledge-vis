# #968 author self-check

Candidate: 968-author-20261026-v1. Author: Codex in the author run; exact model identifier unavailable. Review status: independent review pending. This report records author checks, not learner outcomes, independent acceptance, LeetCode submission acceptance or public delivery.

## Executed checks

From repository root, all final commands exited 0:

- `python3 -B leetcode/968/tests/test_solution.py`: 2056 ordered shapes (n=0..8), 160 seeded cases (seed 968), official examples 1/2, unmodified input objects/links/values, defensive empty, both 1000-node chain orientations → 334. Details: python-results.json.
- `node leetcode/968/tests/test_core.cjs`: 630 trees, 4931 frames. Independent edge/subset oracle, all descendant demands covered at each return, current N obligation, saved return semantics, camera counts/identities, child operands and root repair; exact source mirror and unique two-string bilingual keys. Details: core-results.json.
- `node leetcode/968/tests/browser.cjs`: actual headless Chromium at provided preview. Both languages × all five presets, first/middle/end/reset/back/replay, independent hand toggle, every prediction choice/reveal/change, language state, code/disclosure, downloads, Clipboard API and native Linux Control+C fallback with newly verified sentinel before each locale attempt. 320/390/736/1440 CSS px, 200% CSS zoom with navigation target visible, focus/Tab/Enter, forced colors/reduced motion, storage denial, related anchor existence. Zero console/page/HTTP asset errors; runtime requests stayed on preview origin. Details and bilingual rendered trace/feedback strings: browser-results.json.
- `node leetcode/968/tests/offline.cjs`: file:// source parity in both locales, local interaction, complete preset label widths at 320px. Details: offline-results.json.
- `node leetcode/968/tests/capture_focus.cjs`: focused screenshots with reduced motion to avoid capturing a scrolling transition; actual ArrowRight horizontal keyboard scroll verified.
- `python3 -B scripts/register_leetcode_lesson.py 968 --validate-only`: exit 0, empty output, no registration. Exact final result in metadata-preflight.json.

All result/screenshot-producing tests support LESSON_EVIDENCE_DIR; rerun instructions are in ../README.md. Default evidence is in this folder; reviewers should use a separate output directory.

## Visual inspection and accessibility

Author visually opened focused EN intro at 390, ZH exercise at 390, ZH desktop trace, EN diagram right edge at 390, both 320 trace views and both 200% zoom exercise views; reopened EN 390 end-state diagram/ledger to inspect disabled controls and historical N states. Final 320 selector and settled ZH zoom were reinspected after fixes. Text wraps in both locales, labels stay legible, tree identities and letters do not overlap, old N return states are explained beside the diagram, final disabled controls use opaque muted text, and the offscreen tree region is explicitly scrollable with a text ledger. Zoom screenshots use 200% browser CSS zoom, not OS scaling. Full-page stage captures can include a sticky nav overlay at a capture-dependent location; focused screenshots and live anchor geometry establish actual navigation behavior.

Measured contrast in browser-results.json: main text/panel 14.70:1, muted/panel 7.08:1, minimum muted/panel2 6.45:1 (above AA, below the 7:1 aspirational target). Accent2 focus against panel2 8.94:1; actual keyboard focus is solid 3px. Primary dark text/cyan uses the same 13.10:1 pair in reverse. Disabled controls retain full-opacity muted/panel2. Shared plus local CSS is under 12000 bytes, below the 25000-byte cap. No external runtime fonts, imagery, trackers or assets.

## Author corrections before freeze

Initial core assertion treated every saved N as a current uncovered flag; a later parent camera legitimately covers an old N. Corrected the check to the return-time obligation and added bilingual diagram-local explanation; core/runtime rule was unchanged. An early navigation assertion sampled smooth scroll before settling; it now waits for target geometry. Initial screenshots exposed an active-looking inherited primary disabled button and a clipped long native select label at 320px. Local disabled styling, shorter labels and full-width selector were applied and rerun. A conservative selector width check first rejected the intrinsic-width selector; it passes on the final full-width field. These are author corrections, not independent-review finding closures. Focused final captures use reduced motion to keep screenshots stable.

## Evidence limits

No independent reviewer, cold learner walkthrough, novice teach-back, LeetCode submission, real-device observation, OS zoom control, deployment or public-origin verification occurred. Mobile widths, CSS zoom and clipboard behavior were checked in local headless Chromium on Linux. Python is executed in local tests; lesson trace is a separate JavaScript simulation. Official statement and interface are sourced from the captured successful public GraphQL response; direct HTML challenge capture is retained as a failed access attempt. Candidate runtime and tests are bound by SHA-256 manifest. Separate review must assess this candidate rather than inherit author confidence.

## 2026-10-26 required-finding repair self-check — v2

Candidate: `968-author-20261026-v2`; base reviewed revision `fe87684237ab7c00f0b6c08692b9187691be8d3c`. Stable finding **968-R1: fixed awaiting independent review**. Original report `specs/reviews/968-review-1-1fe9cf12.md` and v1 manifest/results preserved. These are author checks, not independent closure.

Cause/fix mapping: equally specific CSS selectors applied camera cyan/3px after current orange/4px. Move current after camera; bump stylesheet query in index.html. Existing K text/camera class identifies installation while the orange outline independently identifies the latest operation. No code, algorithm, language, translation or metadata changes were necessary. No source regeneration was needed: canonical solution.py and PYTHON_SOURCE mirror remained byte-identical to v1.

Failing feedback loop: `LESSON_EVIDENCE_DIR=leetcode/968/tests/evidence/968-r1-red node leetcode/968/tests/current_marker.cjs` failed on `en-1280-two-cameras`, expected rgb(255,180,84), actual rgb(110,231,255). Captured assertion output: `968-r1-red.log`. The passing test retains that same assertion; later additions only capture the scrollable diagram's two sides separately.

All commands below ran from repository root; result-producing tests used `LESSON_EVIDENCE_DIR=leetcode/968/tests/evidence/968-r1-v2`:

- `node leetcode/968/tests/current_marker.cjs` → exit 0. Both locales × 1280/320 widths. Full tree six decisions: C:K orange 4px, older B:K cyan 3px, two cameras, 6/7; rewind: G:N orange, one camera, 5/7; replay and locale roundtrip restore C. Chain4: A:N orange at 4/5 with C:K cyan and one camera; repair A:K orange at 5/5 with C:K retained and two cameras; undo/replay exact. Default B:K orange at 3/4. Full actual nodes, ledger text and progress in `968-r1-v2/current-marker-results.json`.
- `python3 -B leetcode/968/tests/test_solution.py` → exit 0; 2056 exhaustive shapes, 160 seeded trees, official fixtures and 1000-node boundaries, preserved input links/identity/values.
- `node leetcode/968/tests/test_core.cjs` → exit 0; 630 trees / 4931 frames, independent oracle, child operands, return invariants, camera identities/counts, exact mirror and bilingual copy shape/unique keys.
- `node leetcode/968/tests/browser.cjs` → exit 0; both locales/all presets/endpoints, prediction scope and invalidation, locale preservation, exact displayed/copied/downloaded Python (including final newline), fresh verified sentinel before each native Linux Control+C fallback, 320/390/736/1440 widths, 200% CSS zoom, keyboard/focus, forced colors/reduced motion, blocked storage and local assets. Zero console/page/HTTP errors. Existing measured palette unchanged; minimum tested text contrast remains 6.4494:1 on solid backgrounds.
- `node leetcode/968/tests/offline.cjs` → exit 0; exact source on file URL, first leaf/final return explanation in both locales, narrow selected-label width budgets.
- `node leetcode/968/tests/capture_focus.cjs` → exit 0; focused screenshots and actual ArrowRight component scroll.
- **`python3 -B scripts/register_leetcode_lesson.py 968 --validate-only`** → **exit 0, empty stdout/stderr**. Receipt: `968-r1-v2/metadata-preflight.json`. Metadata complexity remains exactly `O(n) time; O(n) auxiliary space`; validation only, no registration.

Visual inspection: opened EN desktop two-camera and root-repair captures, ZH narrow current-camera/older-camera/root-repair and EN narrow current-camera. Orange current and cyan older-camera outlines are visibly distinct; K labels retained. Desktop shows both cameras together. The 500px tree intentionally scrolls at 320px: right-side captures fully show current C and left-side captures fully show older B; a centered capture cannot show both in full and is not used to claim otherwise. Root-repair chain labels fit in the focused narrow view. Both language semantics are retained because copy, ledger and frame code are unchanged and their rendered bilingual regressions passed.

Source/interface audit: read scripts/register_leetcode_lesson.py LANGUAGE_FILES: Python → solution.py / python-code.js / PYTHON_SOURCE. Existing official-graphql.json codeSnippets and official-verification.md include faithful Python3 and TypeScript object-tree interfaces. Python is already selected; supportedLanguages omission/non-Python fallback is inapplicable and no language-contract.json is required. Executed actual canonical Python, not merely the JS simulation.

Frozen v2 hashes are in `968-r1-v2/candidate-manifest.json`; generated evidence excluded. No review report/rubric, shared asset, registry, service, campaign state, commit or deployment changed. Remaining boundary: separate reviewer must assess v2 and close 968-R1. Local Linux headless Chromium and emulated dimensions do not establish physical-device, novice-learning, LeetCode-submission or public-delivery results.
