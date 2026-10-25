# Author self-check — #514

Status: complete author candidate for separate review; no independent acceptance,
LeetCode acceptance, novice study, registration, deployment or public delivery claim.
Only leetcode/514 was authored. Frozen files are identified by candidate.json.

Official statement and Python3 submission starter were verified on 2026-10-25.
See ../provenance/official.json and its README for the actual capture and query.
The source has the exact official callable interface. No language exception applies.

## Results

- `python3 -B leetcode/514/tests/test_solution.py`: exit 0, 2,207 cases.
  Independent unit-operation BFS agrees with actual Python execution and every
  browser DP endpoint layer. Exhaustive binary rings of length 1..5 and keys of
  length 1..4, 600 seeded ternary cases, official examples, the greedy failure,
  the fresh transfer case and length-100 boundaries are included. Python mirror
  is exact; raw copy JSON has unique keys and nonempty bilingual string pairs.
- `node leetcode/514/tests/browser.cjs`: exit 0. Both locales, seven presets,
  all completed layers, forward/back/forward identity, reset/end/range endpoints,
  every prediction option/reveal/change, preserved locale state, exact source
  display/copy/fallback selection/download, unavailable storage and file:// use.
  Both rendered formulas contain the entire recurrence. Semantic records in
  browser.json retain both candidate values (6 versus 5), complete versus
  incomplete totals, correct/incorrect feedback, and localized clipboard fallback.
  All local links resolve, assets remain local, and no page or HTTP errors occur.
- Layout checks: English and Chinese at 320/390/736/1440 CSS px, at 100%/200%
  CSS zoom (16 combinations), no document overflow. Focused dial/candidate
  screenshots additionally cover 320/390/1440 and effective desktop 200% layout.
  Real OS zoom/real devices are unverified; see README for the headless boundary.
- `node leetcode/514/tests/accessibility.cjs`: actual clipboard readback exactly
  matches solution.py; ArrowRight scrolls the focused ledger to its right edge
  at 320/390. Source disclosure and revealed prediction survive locale/preset
  operations as specified. Native focus, 48px controls, forced-colors outline,
  reduced motion and settled deep-link target geometry checked.
- Measured text contrast: body 16.09:1, explanation 12.62:1, muted copy 7.74:1,
  disabled controls/table text 7.08:1, active language 13.10:1 and endpoint text
  10.91:1. Orange focus contrast against the three surfaces is 8.94..10.73:1.
  Shared + local shipped CSS totals 11,321 bytes, below 25,000.
- `python3 -B scripts/register_leetcode_lesson.py 514 --validate-only` run from
  repository root: exit 0, empty stdout/stderr; actual record preflight.json.
  This was validation only. No registry or concept-map writes occurred.

## Visual inspection and resolved author issues

The author visually opened the screenshot artifacts, including both-language
phone views, zoom views, ring cells, and candidate tables. Position identity and
value remain separately readable; endpoints wrap into rows. The terminal c(4)
cell has cost 5; b(1) → c(4) has candidate 6 and b(5) → c(4) has candidate 5.
Narrow tables intentionally scroll rather than shrink their labels; the page
includes bilingual scroll instructions and keyboard access.

An early 320px/200% check exposed navigation overflow (document width 420px).
Restoring the shared scrolling navigation and reducing local panel padding fixed
it; final layout checks pass. An author test initially used End for horizontal
scrolling; that key was unsuitable and the test now uses ArrowRight. A separate
navigation test sampled smooth scrolling too early; it now waits for the actual
settled target instead of assuming a 200ms animation duration. Neither test
correction changes lesson calculations. These are author findings, not closed
independent-review findings.

The intended reading path was also self-walked: four-step hand calculation;
6-versus-5 nearest-letter failure; same-endpoint domination and induction;
complete layer/candidate history; fresh 9-position prediction; source-loop map
and honest rolling-memory cost. This is an author's walkthrough, not evidence
from a learner or fresh reviewer. Independent review remains the next step.
