# Candy author self-check — candidate 135-author-v1

Status: complete author candidate, ready for a separate independent review.
Author: Codex; exact model identifier unavailable. No independent reviewer was
spawned or acceptance claimed. No actual novice learner results, LeetCode
submission result, production deployment, registry/campaign changes, or shared
asset edits are part of this run. Scope is leetcode/135 only.

Official statement/interface source: ../../provenance/official.json and README.md.
Python3 class/method interface verified from actual official codeSnippets.
Design authority: existing shared-pattern design review and dispatcher adjudication,
referenced in ../../BRIEF.md, written before implementation.

## Executed checks

- `python3 -B leetcode/135/tests/test_solution.py`: PASS. 363 exhaustive rating
  arrays of length1..5, each independently minimized by enumerating allocations;
  2,000 seeded rating-order checks; official examples; fresh quiz; unchanged
  input; synchronous baseline intermediate rounds; maximum n=50,000 increasing,
  decreasing, constant; source/mirror byte parity. See python-results.json.
- `node leetcode/135/tests/test_core.cjs`: PASS. 1,098 cases, 17,001 frames;
  rating-order oracle and contiguous-chain intermediate invariants, independent
  snapshot arrays, all presets. See core-results.json.
- `node leetcode/135/tests/browser.cjs`: PASS in real Chromium against existing
  http://127.0.0.1:18783/leetcode/135/. Both languages, all six presets, 168
  forward/backward operations; endpoint disabled states; repeated rewind/replay;
  reset/end; scrub and middle-rating endpoints; prediction/reveal/change and
  locale preservation; trace controls preserve the independent quiz. Native
  clipboard success and forced fallback; displayed/copied/downloaded Python
  exactly equals solution.py; offline file source; blocked storage fallback;
  local assets and links; keyboard Enter/Tab, focus continuity, 48px controls,
  forced-colors outlines; widths320/390/736/1440 and landscape736×390. No page
  errors, console errors, failed requests, or remote runtime asset requests.
  See browser-results.json.
- 200% CSS zoom in actual Chromium at width780 gives an effective390px layout.
  Both locales inspected; this is browser-rendered page magnification, not a
  physical device or browser-chrome zoom test. Layout and cell geometry checked.
- `node leetcode/135/tests/visual-states.cjs`: PASS. Fresh quiz initially hidden
  with Reveal disabled; partial scan shows R[1]=3 while L[1]=2, all C unknown;
  captures in both languages. See visual-states-results.json.
- Metadata: exact command `python3 -B scripts/register_leetcode_lesson.py 135
  --validate-only` run from repository root, exit0, no stdout/stderr. Final
  execution result is metadata-preflight.json. No registration was performed.
- CSS bytes: shared9425 + local2081 =11506, below25000. No runtime images/fonts.
  Measured actual text/background contrasts: body12.62:1, muted7.74:1,
  controls13.40:1, selected13.10:1, disabled7.08:1, active marker9.81:1.
  Focus orange/panel9.81:1, 3px outline with4px separation.

## Visual inspection and explanation check (author only)

All captured PNGs were opened with the image viewer. Full-page captures check
composition across both locales and four widths; focused section and trace
captures check readable actual values, labels, controls and feedback. At320 the
buttons wrap to two columns and the five-column bound table remains readable.
At200% zoom, controls reflow while table values and operation labels remain
legible. Baseline and Python code have intentional local horizontal scrolling.
The native manual-copy textarea wraps code for selection; copied content remains
exact. The history has its own scroll region and retains every operation.

Initial focused captures included the sticky navigation over the top of the
captured element, a capture-position artifact. Final focused captures hide that
navigation only during screenshot capture; actual anchor geometry is separately
asserted with normal sticky styles. Full-page captures now start at page top.
The long header cell was shortened to i in English; i is explicitly defined in
the preceding paragraph. Final browser checks and screenshots cover this fix.

Author reconstruction of the causal path: [3,2,1] forces1→2→3 from the right;
simultaneous repairs propagate one edge per round; left-only leaves [1,1,1]
invalid. L and R encode the two chain lengths independently, and max merges the
requirements. For a rising edge the lower child's R is1, proving feasibility;
every valid allocation exceeds both bounds, proving minimality. The fresh
asymmetric peak requires4 at its peak rather than the left pass's3. All these
values agree across Chinese, English, simulated table and executable Python.
This reconstruction is an author explanation check, not an independent cold
walkthrough or measured learner teach-back.

## Reproduction and freeze

Use ../README.md commands and LESSON_TEST_OUTPUT_DIR outside this candidate for
reviewer outputs. candidate-sha256.json records hashes of runtime, brief,
metadata, provenance and reproducible test scripts. Evidence captures/results
are excluded from that manifest to avoid circular report hashes. Every file
remains lesson-local. Shared registry/concept registration, independent review,
and release decisions belong to the dispatcher after review.
