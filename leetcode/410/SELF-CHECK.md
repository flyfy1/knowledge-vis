# #410 author candidate self-check

Status: complete author candidate, ready for a separate lesson review. These are
checks by the author run, not an independent reviewer, a learner study, a
LeetCode submission, or public deployment evidence. No shared registry, campaign
state, acceptance record or service was changed. No commit was made.

Official contract was retrieved through public LeetCode GraphQL and the official
problem URL. `tests/evidence/official.json` retains the timestamp, complete
statement, examples, constraints and all observed code snippets. Python3 exposes
`Solution.splitArray(self, nums: list[int], k: int) -> int`; `solution.py` implements
this callable. Python is the preferred faithful interface, so no non-Python
language exception is needed. The displayed source mirror is exact.

## Reproduction

Run from the repository root. Set EVIDENCE_DIR to a new absolute directory to
preserve this candidate's evidence. The Python check produces oracle-cases.json
which the core check then consumes. Browser packages resolve through NODE_PATH;
both browser scripts honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_ROOT
optionally overrides the already-running http://127.0.0.1:18770 preview. No script
starts a server.

```sh
export EVIDENCE_DIR=/absolute/path/to/review-evidence
python3 -B leetcode/410/tests/test_solution.py
node leetcode/410/tests/test_core.js
node leetcode/410/tests/browser.js
node leetcode/410/tests/browser_states.js
python3 -B leetcode/410/tests/visual_contacts.py
python3 -B scripts/register_leetcode_lesson.py 410 --validate-only
```

The optional contact-sheet script requires Pillow, available in this workspace.
All tests generating results/screenshots honor EVIDENCE_DIR. The metadata
preflight is read-only; its author result is in tests/evidence/preflight.json.

## Actual results

- Canonical Python: 6,372 cases passed, with exhaustive arrays over {0,1,2} of
  lengths 1..6 for every legal k, 350 seeded cases (seed 410), official examples,
  maximum-size all-zero/unit/million-value inputs, k=1, k=n, singleton and mixed
  zero boundaries. Exhaustive cut enumeration and independent last-cut dynamic
  programming derive expectations; the input remains unchanged.
- JavaScript simulation: same oracle-derived final answers; 16,045 complete
  search rounds preserve the answer interval and justify pass/fail decisions.
  86,930 intermediate prefix states match independent minimum-group DP; group
  contiguity, sum caps, current sums and detached snapshots pass.
- 95 localization keys checked for duplicates before object evaluation. Runtime
  values each have Chinese/English strings. Semantic evidence in browser-results
  records both locales' pass/fail transitions at B=17/18, all terminal answers,
  all prediction choices, and distinct clipboard-denial feedback.
- Real Chromium: both locales, six presets, every forward step and rewind/replay,
  reset/end, initial and terminal disabled endpoints (including zero-round search),
  range Home/End, both hand cuts, every prediction choice, reveal then change,
  locale preservation of inputs/positions/selection/reveal, and storage reload
  persistence passed. A test-harness retry was necessary for a range already at
  its endpoint; the final test handles the legitimate disabled control.
- Source display / native clipboard copy / actual downloaded bytes / selected
  manual fallback all equal solution.py. File-URL source display works with both
  localStorage reads and writes denied. No browser console/page/asset errors;
  lesson runtime requests are local. All internal/deep links resolve.
- 320, 390, 736 and 1440 CSS-pixel widths in both languages; landscape 736×390;
  1280 viewport with document CSS zoom 2 (200%) in both languages. No page
  overflow. Native keyboard Enter, Tab, range endpoints and focus ring checked;
  forced-colors focus and reduced-motion behavior checked. This is headless
  Chromium evidence, not physical mobile-device testing or native browser-menu
  zoom evidence.
- Screenshot inspection: all 31 final captures inspected through contact-1..4;
  dense narrow scan/search, ledger, prediction, hand and manual-copy layouts
  inspected, plus full-size representative narrow and zoom captures. Group labels
  and sums wrap and stay associated. A transient sticky-layer capture was
  replaced by a settled capture, and scroll-nav selection was changed to follow
  the current section directly; final screenshots and navigation checks pass.
- Measured rendered contrast: main text 16.09:1, group accent text 10.91:1,
  muted group sums and disabled text 6.45:1, primary/selected text 13.10:1,
  focus orange against panel 9.81:1. AA text threshold passes. Total shipped CSS
  (shared 9,425 + local 1,621) = 11,046 bytes, below 25,000 bytes.
- Required root preflight `python3 -B scripts/register_leetcode_lesson.py 410
  --validate-only` exited 0 with no stdout/stderr. Complexity is a single string
  covering time and auxiliary space. Metadata is frozen with this candidate;
  any later fix becomes a new candidate for separate review.

## Candidate and remaining authority

Product/test/dependency SHA-256 values are in tests/evidence/candidate.json.
BRIEF.md carries the approved reused-design contract and local causal plan.
Snapshot storage is distinguished from submission memory; browser simulation is
explicitly distinguished from canonical Python execution in both languages.
The candidate is self-checked only. Next action: a separate reviewer performs a
cold walkthrough and source/oracle/browser audit under the frozen six-dimension
rubric. Registry publication and actual learner outcomes remain unverified.
