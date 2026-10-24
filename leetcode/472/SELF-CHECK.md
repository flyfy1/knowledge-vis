# #472 author self-check — candidate 472-author-v1

Status: complete author candidate, ready for a separate independent review. No independent acceptance, novice results, public delivery verification or LeetCode submission is claimed. Only leetcode/472/ was added; registry/concept-map/campaign files remain for their authorized owner.

## Reproduce

Run from the repository root, using the existing preview at http://127.0.0.1:18770:

```sh
python3 -B leetcode/472/tests/test_solution.py
node leetcode/472/tests/test_core.cjs
node leetcode/472/tests/browser.cjs
node leetcode/472/tests/visual.cjs
python3 -B scripts/register_leetcode_lesson.py 472 --validate-only
```

All tests that emit evidence accept `OUTPUT_DIR` to redirect results/screenshots. Node uses installed packages via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No preview server is started. Official source capture is tests/evidence/official.json, with access date and complete observed code selectors/interfaces. Python3 is directly supported, so no non-Python language contract is needed.

## Observed computations

- Python: 16,892 cases. All 16,383 nonempty subsets of binary words of lengths 1..3; 500 seeded dictionaries; both official examples; independent exhaustive cut-mask oracle; single word/character, repeated components, greedy failure, missing middle, unordered lengths, length 30, and 10,000 words totaling 100,000 characters. Input mutation and exact mirror bytes checked. See python-results.json.
- Core: 698 cases / 5,822 frames. Independent word-first recursive segmentation checks completed prefix invariants, final answers, reasons, before/after/source values, no unrelated-cell mutation, future states, deep snapshots and deterministic replay. See core-results.json.
- Metadata: `python3 -B scripts/register_leetcode_lesson.py 472 --validate-only` from repository root exited **0**, no stdout/stderr. See preflight.json. No registration was performed. Metadata complexity is one nonempty time-and-space string.

## Observed browser behavior

Chromium exercised EN and zh, all six presets, forward/back/forward restoration, terminal disables, reset, slider through every transition of the missing-middle case, all prediction choices/reveal/change, locale after interaction, disclosure preservation, native clipboard copy/readback plus injected clipboard success and denial, focused manual fallback, exact displayed/embedded/copied/downloaded Python, storage denial, keyboard Enter/Tab/focus, forced colors, reduced motion, local and related anchor existence and settled anchor geometry. Tests checked 320/390/736/1440 CSS px, and 200% CSS zoom at desktop size; this is desktop headless emulation, not a physical mobile device or native browser-UI zoom test. No console/page/asset errors. Runtime asset requests were all local.

Localization duplicate keys are detected from source before evaluation can overwrite them. Both locales' rendered absent-piece, unreachable-source, forbidden-self and witness messages are recorded in browser-results.json, distinct from clipboard failure and answer feedback. Fresh prediction feedback stays hidden until explicit reveal and clears when the selected answer changes. Partial F and unknown ? remain visually and verbally distinct.

Control minimum height measured 48px. Disabled controls retain opacity 1 and muted text on panel2 (6.45:1). Core text/panel measured 14.70:1; accent link/panel2 10.91:1; primary ink/fill 13.10:1; focus accent2/panel2 8.94:1. Combined shipped shared + local CSS: **11,912 bytes**. See browser-results.json for measured tokens and control geometry.

## Visual inspection (author)

Inspected screenshots in both languages: trace at 320/390/736/1440, 200% zoom, 390-wide headers, fresh revealed prediction, and focused partial-prefix state. Prefix cells wrap into two columns on phones; source text, status and values remain legible. The partial capture shows dp[4]=F marked partial while dp[5..7]=?; the completed abcd capture preserves the failed self-match and unreachable j=1 before the j=2 witness. Header H1 shows #472 and its separate official link. Prediction contains a real a|ab witness and explains both rejected alternatives.

Long element screenshots contain a sticky navigation overlay at a capture-dependent interior position. This is a screenshot artifact of scrolling a section taller than the viewport; focused prefix captures have no such obstruction. Actual navigation from step0 to step2 was tested after the scroll settled, and the heading remained below the sticky bar. There is no fixed-height clipping or page overflow. At 200% zoom the retained cells remain readable and the page can scroll vertically.

Test-harness corrections during authoring: skip clicking End if the single-character trace is already terminal; navigate from a distinct anchor and wait for smooth scrolling before measuring deep-link geometry; measure a genuinely disabled control. These did not require hiding a product failure. The initial progress text was refined to count completed nonempty prefixes rather than display the awkward empty interval 1…0; final browser evidence is after that copy change.

## Review handoff

Use the frozen candidate identity and the unchanged six-dimension rubric in specs/leetcode-review-gates.md. A separate reviewer should first cold-walk the preview without this brief/self-check, then independently choose fresh cases and audit source/evidence. Related links go to #140 step1 and #132 step1; updating the shared concept map is outside this author's ownership. Real-device behavior, observed learner transfer, independent acceptance and production remain unverified.
