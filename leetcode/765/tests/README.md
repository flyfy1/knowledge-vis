# #765 reproducible author checks

Run from repository root. Python needs only the standard library. Node uses the
provided NODE_PATH packages: playwright and acorn. No server is started.

```bash
export OUTPUT_DIR=/tmp/leetcode-765-review-evidence
python3 -B leetcode/765/tests/test_solution.py
node leetcode/765/tests/test_core.cjs
node leetcode/765/tests/test_browser.cjs
python3 -B scripts/register_leetcode_lesson.py 765 --validate-only
```

OUTPUT_DIR redirects all emitted fixtures, JSON and screenshots. Run Python
before core: core consumes BFS fixtures from that output directory. Browser uses
PREVIEW_ROOT (default http://127.0.0.1:18770) and the environment's
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. It uses the already-running preview.
Default OUTPUT_DIR is this folder's evidence/; reviewers should override it to
preserve the frozen author's evidence. The test-only unpacked extension sets
native browser zoom with chrome.tabs.setZoom(2). Its temporary profile is inside
OUTPUT_DIR and removed after success. Viewport emulation is disabled for this
check; native zoom, layout width and DPR are asserted. CDP captures zoomed
screenshots because the ordinary screenshot helper disturbed native-zoom metrics.
No extension is shipped or loaded by the lesson.

BFS seeds *all* valid arrangements and explores *all* arbitrary-person swaps,
independent of the submitted greedy algorithm. Exhaustive domains: 4, 6, 8 people.
Larger random cases use independent DSU component counts; limits and separation
are recorded in python-results.json. Browser results contain observed bilingual
operation/readout strings, calibrated contrast pairs, source transfer results,
zoom metrics and a separately scoped related-destination favicon warning.

These tests and screenshots are author self-checks. They do not establish an
independent lesson review, LeetCode acceptance, deployment or learner outcomes.

Margin repair supplements (same OUTPUT_DIR/PREVIEW_ROOT environment):

```bash
node leetcode/765/tests/test_margin.cjs
node leetcode/765/tests/test_rendered_contract.cjs
node leetcode/765/tests/test_margin.cjs --stress
node leetcode/765/tests/test_margin.cjs --stress --legacy-label
```

The first checks all five selected presets at 320/390/1440px in both languages
after a locale roundtrip, records canvas/DOM widths with the original 24px
reserve, and captures each closed select. The second checks a hand-calculated
complete four-couple trace, remaining-minimum formula, cumulative swaps, replay,
and independent prediction scope. The original full browser suite stays unchanged.
`--stress` defaults to a synthetic 16.7px select font; `STRESS_FONT=17` tests 17px.
`--legacy-label` replays only the old label through a test-only copy.js response
before localization initializes; it does not edit lesson files. At 16.7px the old
label fails and repaired label passes on the recorded Linux host; at 17px both
fail. Neither stress case establishes Mac verification. Separate OUTPUT_DIR values
preserve red and green artifacts. Run the unchanged original full suite on native
Mac against the frozen repair candidate before closing `765-MAC-MARGIN-01`.
