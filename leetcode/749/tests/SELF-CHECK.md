# Author self-check — #749 Contain Virus

Frozen candidate: `e01c9fc4ce7b4553761925fab3a6a4c9d35fb69556082e76466564a5ab68869c` (files and evidence hashes in `../candidate-sha256.json`).
Status: complete author candidate, ready for a separate independent review.
No independent acceptance, actual learner results, LeetCode acceptance, deployment,
registration, commit, or push is claimed.

Official verification: public GraphQL statement and real Python3 codeSnippets,
retained in `evidence/official.json`; access and interface notes in
`evidence/PROVENANCE.md`. Browser preview: http://127.0.0.1:18770/leetcode/749/ .

Commands actually run from repository root, all exit 0:

```bash
python3 -B leetcode/749/tests/check.py
node leetcode/749/tests/core.cjs
node leetcode/749/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 749 --validate-only
```

The non-mutating metadata command returned empty stdout/stderr and status 0;
`evidence/self-check/preflight.json` retains timestamp and working directory.
Metadata’s final cost is one string: O((D+1)mn) time, D≤mn; O(mn) auxiliary space.
The +1 accounts for the terminal scan, even on all-healthy or all-infected boards.
This final metadata revision is frozen as the candidate above for independent
review. No historical acceptance or campaign record was touched.

Python: 1,092 independently expected cases, including exhaustive binary small
grids through all 512 3×3 inputs, seed 749 rectangular random cases, official
outputs 10/4/13, input preservation, and maximum 50×50 boundary cases. Of these,
843 satisfy unique-choice throughout; 249 are explicitly out-of-contract tie
extensions using stable order. The actual displayed slow-baseline snippet also
runs against the oracle summaries. See `python-results.json` in the evidence
subdirectory. The oracle uses union-find, explicit undirected wall edges, and
healthy-cell scans, separately from the canonical DFS/frontier implementation.

Simulation: 6,045 phase snapshots match oracle grid, regions, distinct frontiers,
wall segments, chosen region and total. Wall-ledger sums and deep snapshot
independence pass. Preset totals: 3/10/4/13/0/0/1. Copy dictionary detection found
90 unique two-language keys with two nonempty strings each. See core-results.json.

Real browser: Chromium 156.0.8078.4 on Linux. Both locales, all seven presets,
all 62 rendered phase/locale combinations, hand shapes 2/1/4 walls, forward/back
and reset/endpoints pass. Prediction options are checked before reveal, after
reveal and after changes; language preserves preset, phase, answer and feedback.
Rendered wall-side classes, targets and chosen cells match the snapshots. Keyboard
Enter/Tab, focused horizontal diagram scrolling, visible focus, forced colors,
denied storage, offline source, real related-anchor existence, clipboard success
and native Linux Control+C fallback all pass. Fallback starts with a distinct
clipboard sentinel; readback equals exact source including final newline.
Displayed/embedded/copied/downloaded source all equal canonical solution.py.

Widths 320/390/736/1440 and CSS 200% zoom at a 780px viewport pass page overflow
and equal cell geometry checks. The closed preset label fits at each width.
Diagrams and wide tables scroll within labeled, keyboard-focusable regions.
Shared plus local CSS: 12,322 bytes. All 219 measured rendered
text/background pairs meet AA; minimum 6.449:1; focus color
against panel2 8.937:1. No console/page/asset errors or external runtime
requests. Full observation text and measured color pairs: browser-results.json.

Author visually inspected screenshots, including en-320-board, en-390-board,
zh-320-board, zh-390-summary, en-736-summary, zh-736-board, en-1440-board,
zh-1440-summary, both zoom200 views, both 390-header views, prediction hidden and
revealed views, and both manual-copy views. Confirmed readable coordinates,
separate labels/values, orange edge walls, retained history and feedback. Final
focus-outline screenshots were inspected after the accessibility update. Earlier
author iterations and fixes remain in evidence/AUTHOR-ITERATIONS.md.

Limits: headless Linux Chromium, CSS zoom rather than browser-menu zoom; no
physical phone test, public release verification, novice teach-back or independent
review. These are author self-checks only. Next action: an independent reviewer
cold-walks this frozen candidate and audits the retained evidence.
