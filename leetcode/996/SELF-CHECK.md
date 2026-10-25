# Author evidence · #996

Status: authored and self-checked; independent lesson review pending. This is the
author run only. Exact model identifier unavailable; no external verifier named.
No deployment, commit, registration, or LeetCode submission performed.

Official statement and language selector/interface: provenance/official.json,
public LeetCode GraphQL captured with timezone-qualified access timestamp. The
frontend ID is 996; internal question ID 1038 is retained without confusing them.
Python3 original callable supported, so Python is selected by preference.

## Results

- Python: 629 exhaustive/seeded/example cases against independent permutation and
  square-set oracle; four n=12 closed-form boundaries; input unchanged.
- JavaScript simulation: 369 complete traces, 16,608 event-invariant checks.
  Each preset's final accepted sequences match independent permutation enumeration.
- Actual Chromium: 202 rendered events across all six presets in both languages;
  both endpoints, rewind/replay/reset/end, independent prediction options,
  stale feedback clearing, locale preservation, keyboard/focus and anchors.
- Canonical file, offline mirror, displayed textContent, successful clipboard,
  each native manual-fallback transfer, and download agree exactly, final newline
  included. Each fallback seeds and verifies its own non-source sentinel first.
- Source still displays when solution.py fetch is blocked; unavailable localStorage
  does not prevent locale switching. No page errors, failed local assets or remote
  runtime requests. Both related links were keyboard activated and their actual
  destination sections checked for the promised concepts in each locale.
- Widths 320/390/736/1440 at CSS layout zoom 1/2; extra dense snapshots retain
  four prefix entries and the accepted ledger. Selected-label font/padding budget
  includes a 20px native-arrow reserve. Reduced-motion and forced-colors focus checked.
- Exact opaque text/background contrast minimum 6.449:1; 3px orange focus with
  4px separation; disabled opacity restored to 1. Shared+local CSS 10,804 bytes.
- Non-mutating metadata preflight from repository root:
  `python3 -B scripts/register_leetcode_lesson.py 996 --validate-only`
  passed, exit 0. Complexity is one nonempty time-and-space string.

## Observed development corrections

An initial hand-written n=12 expected result for six 1s and six 8s was 2.
The runtime disproved it; the correct expectation is 7: place each 1 in six of
seven gaps around six 8s (1+1 fails, 8+8=16 passes). Oracle fixtures were corrected;
no solution repair was needed. This is test authoring history, not a review finding.

The initial 320px/2x header overflowed to 382px. Wrapping header controls fixed it.
Long native preset descriptions were moved to an adjacent localized line, leaving
full arrays in the select. Final layout/label tests pass unchanged width budgets.
An anchor test sampled during smooth scrolling too early; waiting for the target
geometry corrected the test. Settled viewport captures avoid sticky-navigation
artifacts seen in initial long-element screenshots. No historical independent
review record is replaced by these author corrections.

## Evidence boundaries

Author inspected retained screenshots, including dense prefixes/counts/ledgers in
both languages and narrow/desktop scaled layouts. Main captures show reject states;
supplement captures show accepted complete prefixes and accumulated ledger. Labels,
counts and values remain associated; no essential content clips or overlaps in the
inspected settled views. Exact filenames and hashes are in the manifest.

Screenshots are synthetic headless Chromium evidence. CSS zoom 2 is explicitly
recorded as layout stress, not a physical device or native browser-chrome zoom
claim. Other OS/font environments, actual novice teach-back, online acceptance,
independent six-dimension review and public deployment remain unverified. Next
action: a separate reviewer cold-walks the frozen candidate and reruns tests into
an alternate EVIDENCE_DIR. Metadata fixes require a newly frozen candidate.


## R1 repair candidate · 2026-10-26 (author self-check)

Finding **996-R1-COST-01: fixed awaiting independent review**. Historical report
`specs/reviews/996-review-1-1d9a6502.md` remains unchanged. The report identifies
candidate f3eec8c23092990d0309b8f227d5e2a2cf233d1d; this workspace repair starts
from HEAD 03cdc24b4aadb90bbe616279aeccf093c0267c91. The new uncommitted candidate
is frozen by `tests/evidence/r1-cost-fix/candidate-manifest.json`.

Cause: the full preprocessing statement counted only work over distinct values,
omitting Counter's scan of all n entries. Both localized cost paragraphs now
state O(n+k²), derive counting O(n), sorting O(k log k), matrix O(k²), and explain
why k≥1 absorbs sorting. [2], six 2s and twelve 2s connect k=1 to input visits
1, 6 and 12. Updated the local authoring dictionary and regenerated copy.js;
bumped its asset query version in HTML and its local builder. BRIEF now records
the same derivation. Canonical Python, mirror, algorithm, metadata, layout and
interaction code are unchanged. Python is the preferred faithful interface:
`provenance/official.json` includes Python3 Solution.numSquarefulPerms; the exact
registration pair read was solution.py / python-code.js / PYTHON_SOURCE.
No non-Python fallback or supportedLanguages omission applies.

Feedback loop before repair:
`EVIDENCE_DIR=$PWD/leetcode/996/tests/evidence/r1-cost-red python3 -B leetcode/996/tests/cost.py`
exited 1 with “Full preprocessing must include counting n entries, sorting k
values, and the matrix”. The preserved cost-results.json contains the original
bilingual claim and observed input visits. After repair, the same test with
EVIDENCE_DIR ending in r1-cost-fix exits 0. This is a localized cost-explanation
error, not a hard runtime bug; no speculative runtime diagnosis was needed.

All following commands ran from repository root with
`EVIDENCE_DIR=$PWD/leetcode/996/tests/evidence/r1-cost-fix` (except preflight):

- `python3 -B leetcode/996/tests/cost.py`: exit 0, fixed k=1 visits 1/6/12,
  unchanged actual Python callable returns 1 each; both full phase claims checked.
- `python3 -B leetcode/996/tests/check.py`: exit 0, 629 oracle cases, four
  maximum-length cases, exact canonical/offline source parity and copy checks.
- `node leetcode/996/tests/core.cjs`: exit 0, 369 traces, 16,608 invariants.
- `python3 -B leetcode/996/tests/contrast.py`: exit 0, minimum 6.449 contrast.
- `node leetcode/996/tests/browser.cjs`: exit 0, 202 rendered events, both locales,
  all presets, history, prediction scope and feedback invalidation, locale state
  preservation, source textContent, real successful/native fallback clipboard
  with a distinct verified sentinel per locale, downloaded bytes, offline source.
  Also asserts the actual served cost derivation and captures each locale at
  390px and 320px/CSS zoom 2. Linux host; inherited browser executable setting.
- `node leetcode/996/tests/supplement.cjs`: exit 0, dense acceptance/rewind states,
  selected-label budgets, keyboard continuation links, forced-colors focus.
- `python3 -B scripts/register_leetcode_lesson.py 996 --validate-only`: exit 0,
  no stdout. Complexity remains exactly one nonempty time-and-space string.
- `git diff --check`: exit 0.

Applicable rendered-state coverage: existing formula and event copy are unchanged;
trace tests verify after-operation path/count/ledger snapshots and rewinds. The
browser checks prediction input/feedback scope and locale preservation, and exact
source transfers without normalization. The new fixed-k test targets contract §9.
Inspected en-390-zoom1-cost.png and both locales' 320-zoom2-cost.png: text wraps
within the column; the long paragraph scrolls vertically at CSS zoom 2. Full cost
text is also retained in browser-results.json. No layout redesign was needed;
website-design reuse contract remains in force. Physical devices and native
browser zoom are unverified.

This candidate is ready for focused separate re-review of 996-R1-COST-01 and
preserved behavior. This author self-check does not close the independent finding,
rescore the rubric, or claim learner outcomes, online acceptance or deployment.
