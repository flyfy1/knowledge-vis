# #891 author self-check — 891-author-v1

Date: 2026-10-26. Author/checker: Codex in the author run; exact model ID unavailable.
Status: complete author candidate; independent review pending. No independent
score, novice outcome, LeetCode submission acceptance, registration or deployment.
The approved product/design pattern was reused; this is not a new design approval.

## Observed numerical evidence

- `python3 -B leetcode/891/tests/test_solution.py`: PASS, 3,638 canonical cases.
  Exhaustive n=1..7, values1..3; 350 seeded cases up to n=11 and max value100000;
  both official examples; singleton, duplicates, all equal, reversed, length100000.
  Independent oracle enumerates position combinations and directly computes widths.
  Maximum cases use a separately derived sorted-gap oracle: each gap contributes
  its size times (2^left−1)(2^right−1), counting subsets that cross it. Thus it
  does not simply repeat the candidate's extremum contribution formula.
  The maximum ascending answer 528504053 and two-value case 690107415 match.
  Input preservation, exact mirror, executable displayed baseline, metadata shape
  and duplicate localization keys are checked. 83 copy keys, each a bilingual pair.
- `node leetcode/891/tests/test_core.cjs`: PASS, 3,385 traces, 21,848 frames,
  687,610 expanded role-group selections. Directly enumerated subset extrema and
  sorted endpoint owners independently check counts, signed terms, before/after,
  final widths and unique role-group membership. Presets all included.
- Canonical original submission is Python, verified from actual official
  codeSnippets in provenance/official.json. No non-Python language exception.

## Observed browser evidence

`node leetcode/891/tests/browser.cjs` and `node leetcode/891/tests/access.cjs`:
PASS on local Chromium 156.0.8078.4, Linux, provided executable; existing preview.

Both locales: official title identity; complete contribution formula; role-owner
explanation; all seven hand cards and reset; six presets and every frame; every
rewind/replay snapshot, initial/end/reset/endpoints; prediction before reveal,
all three choices and their misconception-specific explanations, change clears
answer, reset, unrelated preset changes leave quiz intact. Locale switches preserve
hand choices, preset, processed positions, quiz choice/reveal and focused control.
Exact rendered/copied/downloaded source including final newline; automatic copy,
then per-locale verified sentinel, forced automatic failure, full selected fallback,
host Control+C, exact clipboard readback. Fallback and translated status survive
locale changes; subsequent successful copy hides fallback after receipt.

Layout at 320/390/736/1440 in EN/zh; closed preset labels all fit in actual computed
font budget with 20px native-arrow reserve. Numeric labels stay attached to the
correct sorted position and value, including duplicate 1s. Current position says
“Just added · Done” / “刚计入 · 已处理”; earlier processed position says Done / 已处理.
Real keyboard Enter/Tab changes trace, focus uses solid 3px orange outline, native
disabled buttons remain readable, all control/label hit areas at least 48px high.
Forced colors, reduced motion, denied localStorage and offline file source/trace
were exercised. 200% uses Chromium CSS zoom=2 at 1440px; narrowed layouts were
separately tested. Scroll/zoom navigation highlights actual step2.

No console/page errors, failed local assets or external runtime requests.
Combined shared+local shipped CSS: 11,720 bytes. Measured rendered text pairs
are 6.449:1 minimum among sampled essential states (muted position labels), body
16.087:1, explanation 12.616:1, primary text 13.101:1. Disabled contrast measured
separately in access-result.json. Keyboard focus vs three surrounding surfaces:
8.937:1 minimum. Color calculator calibrated against black/white=21 and red luminance.
Not every decorative border is a text role; interaction boundaries use shared muted.

## Visual author inspection (actual screenshots opened)

Opened both full-page lesson captures, every trace-320/390/736/1440 EN/zh capture,
both zoom-200 captures, all roles/ledger/quiz-320/390 EN/zh captures and zoom-roles
EN/zh captures. Observed readable numerals, signs, variable labels, wrapped prose,
noncolliding controls and card states. Narrow role groups stack vertically; ledger
retains earlier terms and explicit before/term/after values. The dense [1,2,4,5]
frame after i=2 visibly reads −7,−4,+8; accumulator −3, explicitly not the answer.
Quiz wrong-middle feedback explains the unequal side counts rather than clipboard
or generic fallback copy. Native select labels show the complete input array.
200% roles remain readable; oversized groups can be scrolled normally. Some viewport
captures begin mid-section due to normal scroll position, and the full-page sticky
nav appears at its capture scroll position; keyboard deep-link geometry and ordinary
scroll were separately checked. These are author inspections, not learner trials.

## Related links and reproducible identity

Browser keyboard-activated both localized related links at 320px and captured
actual destination text and resolved fragments in browser-result.json.
#828 step2 teaches counting a character position's contributions through its
neighbor occurrences; it supports the label “contributions by character position.”
#940 step0 explicitly merges two position choices that yield “a” in “aa”; this
supports the distinction between strings and position choices. Both are served
on this preview. Shared dependencies, policies and linked target source hashes
are captured in candidate-sha256.json. Public availability/release inclusion still
belongs to dispatcher verification; this run did not deploy either target.

All emitter tests accept OUTPUT_DIR so reviewer reruns need not mutate frozen
candidate evidence. Pre-freeze harness corrections and the navigation repair are
honestly retained in author-draft-note.md. No historical independent result exists.

## Preflight and review boundary

Root command: `python3 -B scripts/register_leetcode_lesson.py 891 --validate-only`.
PASS exit 0; empty stdout/stderr; receipt preflight.json. Complexity metadata is the
single string `O(n log n) time; O(n) space`; no registry/concept-map mutations.
Freeze: candidate-sha256.json identifies final author source, tests, metadata,
provenance and BRIEF plus read-only dependency/policy context. No metadata fix was
needed after review; no prior independent candidate acceptance is asserted.
Next: dispatcher assigns a separate source-blind cold review with the frozen six
review dimensions, then source audit and independently chosen cases. Acceptance,
public delivery, physical devices/native chrome zoom, other browser engines and
actual novice understanding remain unverified. This author delivery is ready for
that separate review, not independently accepted.
