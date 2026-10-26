# Author self-check — #882, candidate 2

Author: Codex; exact model identifier unavailable. Review status: pending separate independent run. No LeetCode submission, actual learner study, deployment, registration, commit or campaign-state change was performed.

Official verification: public GraphQL response in official.json captured at 2026-10-25T23:57:04.850976+00:00 (2026-10-26 in Asia/Singapore). It includes full content, constraints, three examples, metadata and observed Python3/other language snippets. Canonical interface is `Solution.reachableNodes(self, edges: list[list[int]], maxMoves: int, n: int) -> int`. Python is faithfully supported; no nondefault-language contract is required.

Commands and results:

- `python3 -B leetcode/882/tests/test_solution.py`: PASS, 29,762 canonical checks; 1,030 browser-model cases with intermediate invariants. Includes exhaustive n≤4, seeded cases, all official examples, input immutability, empty/zero/disconnected/overlap and maximum n/m/cnt/budget closed-form checks. See numerical.json.
- `node leetcode/882/tests/browser.cjs`: PASS, real Linux Chromium. See browser.json for observed text, contrast pairs, dimensions, assets, source transfers and errors (none). Six presets, both languages, all trace endpoints and prediction options tested. Actual native manual copy performed in each locale after verifying a distinct clipboard sentinel. Offline mirror tested through file://. Source equality retains final newline.
- `node leetcode/882/tests/select-fit.cjs`: PASS; canvas and actual rendered text widths at 320px. See select-fit.json.
- `node leetcode/882/tests/accessibility.cjs`: PASS; actual Enter activation for all five sticky navigation links in both languages, destination heading below sticky nav, forced-colors 3px focus, reduced-motion. See accessibility.json.
- `python3 -B scripts/register_leetcode_lesson.py 882 --validate-only`: PASS (exit 0, no output); machine-readable receipt in preflight.json. Run from repository root; did not register anything.

## Observed visual checks

Opened and visually inspected actual screenshots: en/zh hand calculations, revealed prediction, focused 320px node and ledger screenshots, 390px trace, 1440px trace, both zoom200 views, and before/after select captures. Node 2 at frame 2 is both finalized (✓ and cyan boundary) and current (orange outline plus localized explicit text); node 0 remains finalized without claiming current status. d[1] is still tentative at 5 after shrinking from 11. Edge rows retain totals 3→10→11→13. Labels and values wrap independently at 320px and 200% layout zoom. Component screenshots may clip outline at image edges; the viewport screenshots show the complete outline. Full-section prediction screenshots can include the sticky navigation overlay at a capture-dependent location; actual keyboard deep-link geometry passes separately.

A real local defect was found before freeze: English preset 4 was clipped at 320px (`select-fit-before.png`), losing its final count. Candidate 2 shortens it to “Zero budget, cnt=0 · 1”. After screenshots show the complete count; canvas width 164.37px and rendered width 164.375px fit the unchanged conservative 210px budget. Browser checks reran after the repair. First-run harness isFocused failure and correction are retained in harness-notes.md; this was not a runtime bug.

CSS totals 11,243 bytes (9,425 shared + 1,818 local), below 25,000. Measured core text contrast ≥12.61:1 in sampled rendered pairs; the least nominal/disabled muted pair is 6.45:1, above normal-text AA. Luminance calibration covers black/white 21:1, primary colors, and #747474 on black below 4.5. Source/display/download bytes match exactly. Requests from the lesson stay local.

## Related destination and limits

Local related anchors lead to the actual overlap proof at #step2 and expanded BFS baseline at #step1. `/leetcode/778/#step2` is present in the existing collection registry and accessible on the preview; inspected bilingual copy explains `max(cost,H[v])` bottleneck relaxation and minimum-candidate finalization. The link explicitly calls this a comparison, not additive-distance equivalence. Public release availability still requires the dispatcher's normal release verification. No shared registry or concept map was edited under lesson-only ownership.

Browser device emulation and CSS zoom at 640px (320px effective layout width) are not physical-device tests or proof of native operating-system browser zoom on every platform. No resolved-font guarantee is inferred from the system font stack. Forced colors and keyboard were checked in Chromium, not a screen reader. This evidence cannot establish novice comprehension, separate independent acceptance or public delivery.
