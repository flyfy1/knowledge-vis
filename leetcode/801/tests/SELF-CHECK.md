# #801 author self-check — independent review pending

This is an implementation-run self-check, not acceptance. The exact candidate is identified by evidence/candidate.json. Official statement and actual Python3 interface evidence are in ../provenance/official.json, accessed 2026-10-26 Singapore time. No paywall bypass or LeetCode submission was used.

## Results and boundaries

- `python3 -B leetcode/801/tests/test_solution.py`: PASS. All 69,888 small row pairs over 0..3 at lengths 2..4 were enumerated; 73 feasible inputs were executed against independent mask enumeration. Also 500 seeded solvable cases, both official examples, exact bounds 0 and 200000, n=100000 increasing and alternating orientations, and input nonmutation passed.
- `node leetcode/801/tests/test_core.cjs`: PASS. 2,939 prefix-state checks, all 16 hand masks, fresh transfer costs (0,1) → (0,1) → (1,1) → (1,2) → (2,2), localized two-string shapes, raw AST duplicate-key detection and adversarial duplicate fixture.
- `node leetcode/801/tests/test_browser.cjs`: PASS on Linux Chromium 156.0.8078.4. Both locales, all presets and hand masks, every trace endpoint and rewind/replay, every answer/reveal/change, independent resets, locale state/focus preservation, actual success/fallback clipboard, exact source/download parity including final newline, native keyboard, links, blocked storage, offline source and local runtime assets checked. Native 200% zoom was measured by chrome.tabs.getZoom=2, devicePixelRatio=2 and innerWidth=720 from a 1440px window. Widths 320/390/736/1440 passed. CSS total shared + local = 13,193 bytes.
- `node leetcode/801/tests/test_access.cjs`: PASS. Extra hand/source/control captures, actual source colors, localized control text, minimum 48px button geometry and 3px focus outlines.
- `python3 -B scripts/register_leetcode_lesson.py 801 --validate-only`: PASS (exit 0, no output). Executed from repository root; reads only and performs no registration. Final result retained in evidence/preflight.json.

Measured solid palette pairs use WCAG sRGB linearization with 0.2126/0.7152/0.0722 weights; black/white, primaries and near-threshold #747474 calibration passed. Minimum recorded normal-text pair is 6.34696669826778, above 4.5. Rendered styles for disabled controls, ordinary labels, candidates and source are recorded; focus accent2 contrasts with all adjacent dark surfaces. Source #e8edf4 on #090e16 has its separate measured ratio in evidence/source-contrast.json. No translucent text or gradient surfaces were introduced. This is a solid-color measurement, not a claim about every possible OS forced-color palette.

## Visual inspection and meaning

Author visually opened screenshots (not merely generated): bilingual 320px headers; trace i=2 at 320/390/736/1440; both native zoom captures; 390px prediction, hand, controls and source; closed selectors and wrapped recurrence at 320px; desktop headers; forced colors. Cards wrap instead of colliding: at 320px four candidate edges stack vertically, each old/new endpoint and cost remains readable. At desktop they use two columns. The ∞ candidates correctly mark the failing S guard for original (4,2) → (3,5); legal C candidates both cost 1. There is no diagram state/value overlap. The recurrence wraps fully at 320px, with a rendered-width assertion; code deliberately scrolls horizontally within its own source block. Sticky navigation can cover part of the preceding card in a viewport capture; ordinary scrolling exposes the full card. No essential content is fixed or clipped.

Prediction is a separate five-column input not used in any trace preset. Before reveal the feedback contains no derived costs. After reveal both languages explain why the two final costs are 2 and why (1,1) and (∞,2) discard necessary information. Changing the selection clears the answer; locale changes preserve it. Hand cost counts currently exchanged columns, never cumulative clicks. All guards inspect original arrays; the new legend explicitly separates original input from processed-column highlighting.

Related links were followed using keyboard in each locale and their rendered destination sections read. #10 step1 defines dp[i][j] for two string prefixes and derives dependencies; it supports the label “dynamic programming over string prefixes.” #123 step1 defines the four cash/holding states and derives their updates, supporting “four states for stock transactions.” Local links go to the four candidate connections and endpoint proof. Target file hashes are in candidate.json; served section excerpts are retained in browser-results.json. These destinations were available in this preview, not verified in a future release manifest.

One pre-existing destination-only error remains outside this lesson: #10 requests missing /favicon.ico. Its URL and page are recorded in browser-results.json.destinationErrors and separately reproduced in harness-notes.md. #801 declares a data icon and has zero page/runtime asset errors. No sibling files were edited.

Harness history is retained in evidence/harness-notes.md: an initial missing-candidate sampling precondition was fixed; a conservative select-fit failure was repaired by giving the select its container width without weakening its budget; the unrelated destination favicon was diagnosed and separated. The final full suite uses the same original fit predicate.

Unverified: independent cold review, actual learner comprehension, physical devices, macOS/native font behavior, public deployment and LeetCode acceptance. The candidate is ready for the designated separate review only. No registry, campaign or historical review record was changed.

## 2026-10-26 — 801-COPY-R1 author repair evidence

Status: **fixed awaiting independent review**. This append records a new candidate;
the historical acceptance and original self-check above remain historical evidence.
Accepted base: `154c1becf178b798dfbd80acbb79fabdd262ae68`. Before hashes and
base comparison: `evidence/copy-r1/base-hashes.json`. Frozen new candidate:
`evidence/copy-r1/candidate.json`; exact runtime diff: `evidence/copy-r1/runtime.diff`.

Fix mapping: **801-COPY-R1** → deleted the entire `footer.site-foot[data-i18n=foot]`
and its unused bilingual `foot` key. The only additional runtime edit updates the
copy asset cache query. No replacement claim or component was added. Static exact
base-diff assertions prove all neighboring copy, including `sim`, `originalLabel`
and `p4`, remains unchanged. Five required runtime files remain byte-identical;
all before/after SHA-256 values are recorded in `python-smoke.json`.

- Pre-fix `OUTPUT_DIR=leetcode/801/tests/evidence/copy-r1/before node leetcode/801/tests/test_copy_repair.cjs`: expected FAIL, exit 1, actual footer count 1 versus required 0. Result and Chinese page-end screenshot retained under `copy-r1/before/`.
- `python3 -B leetcode/801/tests/test_copy_repair.py`: PASS. Actual canonical Python execution on both official examples, the greedy counterexample, the fresh five-column transfer and equality boundary; nonmutation; exact offline mirror including final newline; faithful official Python3 signature; exact allowlisted diff and five unchanged runtime hashes. This deliberately avoids rerunning the broad numerical suites for a prose deletion.
- `OUTPUT_DIR=leetcode/801/tests/evidence/copy-r1/after node leetcode/801/tests/test_copy_repair.cjs`: PASS. Actual rendered zh→en→zh at 320px retains i=2 (3/4 processed) and revealed prediction (2,2); no footer/key/missing bindings/old wording, no page-end gap, no overflow or console/page/network errors. All source controls and four related links remain reachable by sequential Tab. Preserved limitations and localized source/interface distinctions recorded as actual text. Native Chrome zoom confirmed factor 2, DPR 2, innerWidth 720; bilingual page-end captures retained.
- `OUTPUT_DIR=leetcode/801/tests/evidence/copy-r1/after node leetcode/801/tests/test_browser.cjs`: PASS. Existing interaction/source regression covers full formulas, candidate values, initial/middle/end and rewind/replay, hand cost scope, independent prediction scope/change/reset and locale state; all presets, 320/390/736/1440 widths, native zoom, keyboard/links, blocked storage and offline source. DOM `textContent`, copy success, download bytes and decoded mirror equal canonical source, with final newline. Each manual fallback attempt seeded and verified its own fresh sentinel, then used actual Linux Control+C and exact clipboard readback. Zero #801 errors; the existing destination-only #10 favicon error remains explicitly distinguished. Browser/host/results are in `after/browser-results.json`.
- `python3 -B scripts/register_leetcode_lesson.py 801 --validate-only`, executed from repository root: PASS, exit 0, empty stdout/stderr. Receipt in `copy-r1/preflight.json`; validate-only makes no registration or state changes. Metadata already conforms and is unchanged.

Visual self-inspection opened `after/end-320-zh.png`, `after/end-320-en.png`,
`after/end-zoom200-zh.png`, `after/end-zoom200-en.png`: the source controls and
related links wrap and remain readable; the removed footer leaves no orphan
block. The existing section bottom padding remains. No CSS or color changed;
existing browser contrast checks still pass. This is Linux Chromium evidence,
not physical-device or macOS font verification.

Harness note: an initial ad-hoc interface assertion incorrectly expected `List[int]`.
The stored official Python3 snippet actually uses `list[int]`, exactly as canonical
source does. The durable focused check uses that actual signature and passes;
this was a harness assumption, not a runtime/interface repair. The five execution
fixtures and mirror equality had passed before that assertion. No runtime code
was changed for this check.

Separate reviewer next action: verify the frozen candidate identity, rendered
bilingual footer removal, preserved limitations and affected page-end layout,
then explicitly close 801-COPY-R1 if satisfied. No independent closure, actual
LeetCode submission, novice learning outcome or public deployment is claimed.
