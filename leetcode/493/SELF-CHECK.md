# Author self-check — #493

Status: complete author candidate, ready for separate independent review.
Candidate ID: `7a11fcb9c08c4efcde1c5947d8fe328f49a40a2167bf16feec2ddb7c128a257c`.
Identity and exact source hashes: tests/evidence/candidate.json. Author: Codex;
exact model identifier unavailable. Reviewer/run, score and acceptance: pending.
No commit, registration, release, deployment, LeetCode submission or actual
novice learning result is claimed.

Official evidence is preserved in provenance/official-graphql.json with access
metadata in provenance/README.md. It includes the public statement, both examples,
constraints and Python3 selector snippet `Solution.reversePairs(self, nums:
list[int]) -> int`. Python is canonical; no nondefault language contract applies.

## Executed results

- `python3 -B leetcode/493/tests/check.py`: PASS, 20,236 actual Python cases.
  Exhaustive lengths 0..6 over five signed values, 700 seeded cases including
  32-bit extremes, official examples, and three maximum-size arrays. Empty input
  is a defensive extension, not an official permitted input. Caller input is
  preserved. The all-negative maximum case yields 1,249,975,000.
- `node leetcode/493/tests/core.cjs`: PASS, 1,099 trace cases. First-failure
  boundaries, inclusion/exclusion, original half membership, sorted merges,
  additive ledger totals and snapshot isolation checked against direct loops.
- `node leetcode/493/tests/browser.cjs`: PASS in real headless Chromium at the
  requested existing preview origin. Both locales; all six presets through every
  operation; back/forward replay, reset/endpoints; all three prefix choices;
  prediction select/reveal/change/reset; locale preserves selections/reveal,
  trace/preset and source disclosure. Native clipboard success and selected
  fallback with keyboard copy both match canonical source. Displayed, embedded,
  downloaded bytes include the final newline. Blocked storage and offline source
  disclosure pass. All internal/deep-link targets resolve. Real keyboard focus
  is a 3px solid orange outline. No page errors or failed/local external assets.
- `python3 -B scripts/register_leetcode_lesson.py 493 --validate-only`: PASS,
  exit 0, no stdout/stderr; executed from repository root. See
  tests/evidence/preflight.json. Complexity is one string including time/space.
  This was validation only; registry and campaign/review files were not changed.

Results: tests/evidence/numerical.json, trace.json, browser.json, preflight.json.
Tests accept OUTPUT_DIR; rerun commands are in tests/README.md.

## Rendered meaning and visual inspection

Hand example [4,2,1]: comparisons 4>4 excluded, 4>2 counted, 2>2 excluded;
count 1 in both languages. The prefix experiment shows q=1,2,2 for x=3,5,8
against R=[1,2,4]; equality 8>8 fails. Representative dense official-example-1
frame 8/10: original block [0,5), split 2, x=3, q moves 0→1, contribution +1,
cumulative 2. Displayed R comparisons are 3>2 Count, 3>4 Exclude, 3>6 Exclude.
Both rendered formula operands and localized feedback were checked, not merely
key presence. Negative transfer case q=1,1,2 totals 4, and changing an answer
invalidates feedback. The same initial [4,2,1] example is carried into recursion;
additional official/equality/negative/extreme cases are explicitly separate presets.

Inspected the captured phone and desktop trace contexts, all eight populated
half-block screenshots across 320/390/736/1440 and both zoom screenshots, plus
both-language captures of sections 0,1,3,4. Labels, arithmetic, prefix inclusion
and focus borders remain associated; no essential overlap or page overflow was
observed. Full-section captures hide the sticky navigation only during the
capture because element screenshots otherwise paint a scroll-position artifact
in the middle of long content. Actual navigation remains enabled and deep-link
geometry is separately asserted below the sticky bar. Focused trace screenshots
retain the real navigation.

Computed-color text contrast ranges from 6.449:1 (disabled button) to 16.087:1;
core explanatory text is 12.616:1. Essential text meets AA; disabled controls
remain legible at opacity 1. Selected/qualifying cells also have localized text
and distinct border shapes/widths, so color is supplementary. Shared+local shipped
CSS totals 10,898 bytes. Assets are local, system-font-only, and no automatic
motion/timer is used.

## Limits

Browser checks emulate widths and use CSS zoom 2 at a 780px viewport for 200%
layout zoom. Physical devices, browser chrome zoom, screen-reader speech output,
production delivery and novice teach-back are unverified. These self-checks and
independent numerical oracles do not constitute the separate reviewer gate.
The requested author scope is complete; dispatcher should freeze this identity
and send the lesson to a fresh reviewer under the existing six-dimension rubric.
