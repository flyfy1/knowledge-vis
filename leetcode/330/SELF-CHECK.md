# #330 author self-check — candidate 1

This is an author-run candidate for a separate independent review, not lesson
acceptance. No submission was sent to LeetCode. No learner trial, deployment,
registration, shared file change, commit, credential access or delegated agent
work occurred.

## Contract and implementation

The complete dated official public GraphQL capture is
[tests/evidence/official.json](tests/evidence/official.json). It confirms the
statement, three examples, positive sorted/nonempty constraints, maximum target,
and actual Python3 `Solution.minPatches` snippet. Python is the preferred faithful
submission interface; no non-Python language exception applies. The displayed,
copied, downloaded and offline-embedded canonical source equals solution.py.
The separately labeled exhaustive baseline is baseline.py, displayed exactly in
an initially collapsed explanation; it is explicitly unsuitable for large inputs.

The lesson uses the approved five-section pattern, with a local BRIEF written
before implementation. Shared tokens, CSS and locale helper are reused without
editing shared files. Numerical stages are simulations, labeled separately from
execution of the original Python callable. A complete trace uses interval endpoints
and a retained ledger; no operation is omitted. Wide tables scroll inside a
labeled keyboard-focusable region.

## Executed checks

From repository root:

- `python3 -B leetcode/330/tests/test_solution.py`: PASS. 2,390 exhaustive/seeded
  small inputs against an independent BFS over full reachable-sum sets, eight
  official/boundary/maximum cases, no input mutation, exact canonical mirror,
  204 exhaustive-baseline cross-checks, exact displayed baseline, and unique
  localization keys. See python-results.json and oracle-fixtures.json.
- `node leetcode/330/tests/test_core.cjs`: PASS. Same 2,390 independent expected
  results, 9,726 intermediate states checked by subset enumeration, exact
  coverage/first gap, previous-to-next values, deep snapshot isolation, repeated
  trace identity and maximum n. See core-results.json.
- `node leetcode/330/tests/browser.cjs`: PASS in real headless Chromium at the
  existing preview. Both locales; every preset, every frame, hand patch and x
  choice; undo/replay/reset/endpoints; all prediction answers, explicit reveal,
  changed answer and reset; locale preservation; native source disclosures;
  exact source copy/download/manual fallback; storage denial; local-file offline
  source and simulation; keyboard Enter/Tab/arrows; forced colors/reduced motion;
  48×48 control targets; links and sticky anchors; all asset requests local and
  no console/page/network failures. See browser-results.json.
- Layout: 320/390/736/1440 CSS px, plus 200% CSS zoom at 320/390/1280 viewport
  widths in both locales. No document overflow; interval labels reflow. The
  deliberately wider ledger remains independently scrollable. CSS zoom is a
  synthetic layout stress test, not proof about physical mobile devices.
- `python3 -B scripts/register_leetcode_lesson.py 330 --validate-only`: PASS,
  exit 0, no stdout/stderr. Exact command, root cwd and timestamp are recorded in
  tests/evidence/metadata-preflight.json. No registration was performed.

Tests that emit results or screenshots honor LESSON_TEST_OUTPUT_DIR; rerun
instructions are in tests/README.md. Reviewers should use a different output
directory rather than overwrite the frozen candidate.

## Visual inspection and measured accessibility

The author opened actual PNGs from Chromium: bilingual headers; the hand-sum
witness tiles; the failed x=6 interval case; English and Chinese 390px terminal
trace; prediction feedback; source and clipboard fallback; 200% desktop trace
and 320px zoom viewport. No text/number collisions were observed. At mobile zoom,
text wraps at full readable size and the ledger requires horizontal scrolling.
Complete-stage screenshots use a taller capture viewport to keep sticky navigation
outside the target; viewport screenshots also retain the actual sticky navigation.
These screenshots are review evidence, not shipped runtime images.

A visual check found the shared primary rule initially overrode disabled button
colors; local specificity was corrected and the suite rerun. Disabled Next now
uses the muted text/panel2 pair. Another 200% stress check led to local wrapping
and compact narrow-screen padding, with no new color values. A keyboard End key
was inappropriate for testing a horizontally scrolling ledger; the test uses
ArrowRight and explicitly checks access to its rightmost columns.

Rendered text contrast: minimum 6.449:1, core text/panel2 13.397:1. Recorded rendered
role colors give focus accent2/panel 9.809:1, disabled text/panel2 6.449:1 and
field border/panel2 6.449:1. Primary dark text/accent is 13.101:1. Focus outlines
are 3px with separation, and forced colors retain keyboard focus. Contrast
calculations use sRGB linearization and (Llighter+.05)/(Ldarker+.05); alpha
composition is included for rendered text. Raw observations are contrast.json
and role-colors.json. Total shared plus local shipped CSS: 11,965 bytes, under
25,000. No external fonts or assets.

## Author walkthrough observations (not an independent cold review)

1. Changing a trial patch on [1,3] preserves the fixed target and shows a subset
   witness or an explicit gap for each sum. Patch 2 fills all three old gaps.
2. With [1,2], x=3/4/5 visibly separates overlap, farthest safe extension and a
   missed 4. The local definition of miss connects these observations to the
   interval invariant and the exchange argument.
3. Undo restores the old coverage and complete ledger. On [1,5,10], two patches
   are inserted before 5 becomes consumable; the terminal interval is [0,22].
4. The fresh [1,2,7], n=10 prediction requires the invariant: patch 4 bridges
   through 7, then the original 7 extends through 14. Revealed explanations
   distinguish both distractors; changing an answer clears stale feedback.
5. Python branches correspond directly to consume/patch frames, with i unchanged
   during patches, equality retained in the guard and termination only at miss>n.
   Submission O(1) space is distinguished from retained teaching snapshots.

## Review boundary and next action

Independent cold lesson review, exact rubric scoring and acceptance are pending.
Actual learner understanding, LeetCode acceptance, real-device behavior and public
production delivery are unverified. The next authorized stage is a separate
review run against the files identified in CANDIDATE-SHA256.json. This candidate
must not inherit another problem's approval. Metadata remains a single time-and-
space string; any later metadata fix creates a new review candidate.
