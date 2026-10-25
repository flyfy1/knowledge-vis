# #878 author self-check — 878-author-v1

Author: Codex; exact model identifier unavailable. Date: 2026-10-26 Asia/Singapore.
This is the first frozen author candidate. Independent reviewer/run/acceptance:
**pending**. No LeetCode submission, novice trial, registration, deployment or public
verification was performed. No separate agent was spawned. Only leetcode/878 was
written. Runtime workflow badges/status were excluded per the explainer contract.

## Official evidence and language

`official.json` is the unaltered public GraphQL question payload plus request and
access metadata (2026-10-25T23:13:18Z = 2026-10-26 in Singapore). The official page
was also opened. Observed: Hard, free, positive divisible-by-either definition,
rank n, modulus 10^9+7, n in 1..10^9, a,b in 2..40000; examples return 2 and 6.
Observed Python3 code snippet is the actual `Solution.nthMagicalNumber(self, n:
int, a: int, b: int) -> int` interface. Python is preferred and faithfully
submittable. The complete observed selector snippets remain in the evidence;
no non-Python exception or conceptual-comparison language contract is needed.
Official URL: https://leetcode.com/problems/nth-magical-number/ .

## Commands and computational evidence

All commands ran from the repository root. Tests emitting files accept OUTPUT_DIR.
See ../README.md for safe reruns into a fresh directory.

- `python3 -B leetcode/878/tests/test_solution.py`: pass, 7,840 exhaustive small
  cases + 350 seeded large cases + 8 explicit cases = 8,198. Executes canonical
  Python using the official callable. Small oracle directly tries divisibility;
  large oracle constructs a distinct union inside a repeating period, then
  indexes that list. Neither searches using the canonical prefix-count formula.
- `node leetcode/878/tests/test_core.cjs`: pass, 8,350 complete traces, 67,317
  intermediate frames, 29,596 direct-enumeration counts. Checks initial bounds,
  before/after consistency, exact terms, strict shrinking, answer retention,
  C(lo−1)<n≤C(hi), and final threshold. Two-stream merge oracle, seeded inputs,
  equal/dividing/shared-factor divisors, first rank, non-coprime divisors, maximum
  inputs and independent periodic large expectations. Acorn rejects duplicate
  dictionary keys before evaluation; every value is a bilingual pair. Static
  i18n references exist. Exact decoded mirror equals solution.py, including LF.
- `node leetcode/878/tests/browser.cjs`: pass; detailed actions/readouts in
  browser-result.json, asset-diagnostics.json and PNGs.
- `node leetcode/878/tests/access.cjs`: pass; all six closed select labels at
  320px, zh→en→zh heading/title identity, code-panel focus, official link tap size,
  fresh-case reveal and narrow concept links. access-result.json and PNGs.
- `python3 -B scripts/register_leetcode_lesson.py 878 --validate-only`: exit 0,
  no stdout/stderr. Safe non-mutating metadata gate; preflight.json records cwd,
  command and time. No registration command was used.

Python maximum equal-divisor case has raw answer 40,000,000,000,000 and residue
999,720,007. The 39999/40000 maximum-rank case has raw 20,000,000,000,000 and
residue 999,860,007, independently checked with a periodic union of actual values.
Valid degenerate case a=b reduces to one floor quotient; n=1 still has a nonempty
search. Baseline scans to the raw answer; thus O(n·min(a,b)) is a real worst-case
bound, attained for equal divisors. Canonical bounds count integer operations,
not unbounded-integer bit costs, and teaching history is accounted separately.

## Rendered states and localization

Chromium 156.0.8078.4, Linux arm64 environment, supplied executablePath. All six
presets completed in EN and zh, every frame stepped forward, backward, forward
and compared exactly. Reset clears prior tests/readings/history to the initial
snapshot; endpoints disable correctly. Slider seeks initial/terminal. Count x at
1,5,6,7,18 matched hand enumeration. At 6: 3+2−1=4; at 7 still 4. Both rendered
formulas include all operands and the gcd-based LCM expression.

Default trace: [1,8], mid4 count3 → [5,8]; mid6 count4 → [5,6]; mid5 count3 →
[6,6]. Tested candidate/value and before/after intervals describe the same test.
History retains every completed decision; its current row has an explicit current
label as well as a border. Initial state has no invented midpoint or count. The
large preset has 45 comparisons, with no skipped rounds.

Fresh quiz uses n7,a3,b5, interval [12,21], tested mid16/count7. All 3 choices were
selected and revealed in both locales. Correct feedback retains [12,16], explains
16 is not magical and identifies 15. Wrong feedback explains both early return
and lost-answer errors. Changing a choice clears feedback text and hides it;
locale preserves selected option, reveal, trace frame, count slider and source
disclosure. Programmatic locale change also retains useful focused control.
Copy feedback remains localized and separate from mathematical branch feedback.

## Source transfer and recovery

Rendered textContent, decoded mirror, automatic clipboard and downloaded bytes
match the exact 412-byte solution.py, including the final newline. Each locale's
manual-copy attempt first writes and reads a fresh non-source sentinel. Automatic
write is then denied, the actual Copy control focuses/selects the whole readonly
textarea, Linux Control+C performs the transfer, and native clipboard readback
matches the source exactly. No source value is test-written to simulate fallback
success; no newline normalization. Browser result records per-attempt sentinels.
Blocked localStorage still permits interaction and locale switching. Offline
file:// opening displays embedded source and runs local experiments. Forced-color
focus and reduced-motion modes were exercised. No runtime asset errors, console
errors, failed requests or external asset requests occurred on tested paths.

## Visual/accessibility inspection

Opened and visually inspected the screenshots using the image viewer:

- state-320/390-{en,zh}: maximum-bound values wrap between interval endpoints;
  labels stay associated; controls reflow with full text. No page overflow.
- state-736/1440-{en,zh}: before/after panels align without numeric clipping;
  tested count and reason remain distinct. Retained history is readable.
- zoom-200-{en,zh}: 200% Chromium CSS page magnification at 1440px, long bounds
  and arithmetic remain readable without overlapping panels. Native browser
  chrome zoom and physical phone/monitor behavior are unverified.
- lesson-{en,zh}: full-page hierarchy, hand enumeration, count terms, concrete
  search derivation, quiz and exact code controls. Sticky navigation's capture
  position can overlay a line in full-page screenshots; real deep-link heading
  geometry was tested separately and stayed below navigation.
- count-320-{en,zh}, trace-320-{en,zh}, prediction-320-{en,zh}: full count formula
  survives wrapping; 3+2−1=4 is visible; before [5,8]/after [5,6] and tested mid6
  agree; selected answer and revealed explanatory feedback remain legible.

The unfrozen long native-select label visibly clipped; draft-select-320-en.png
and draft-fit-failure.json preserve that failure. Labels were shortened while
keeping all n/a/b values and full numeric readout. Same 20px arrow reserve and
computed-font measurement predicate passes, all presets, both locales. The max
label measures 138.43px within a 206px available budget at 320px. This records the
actual system stack/browser environment, not an inferred resolved font on another
platform. No cross-platform font claim.

Button/selector controls and source summary use 48px minimum height; the official
link's rendered height is checked at >=48px. Keyboard Enter activates navigation
and buttons; range and radios retain native semantics. Visible focus is 3px
accent2 with offset. Code panels have keyboard focus and horizontal scrolling.
Shared colors are reused exactly. Total shipped shared+local CSS is below
25,000 bytes (exact bytes in final browser-result.json).

Contrast helper was calibrated using black/white (21), RGB primaries and the
near-threshold #747474/black pair (4.492948..., correctly below 4.5). Recorded
solid color pairs: primary body text/panel 14.70:1; muted/panel 7.08:1;
muted/panel2 6.45:1; accent/panel 11.97:1; accent2/panel2 8.94:1; active locale
text/accent 13.10:1. Core text exceeds 7:1 and all tested normal text exceeds AA.
Actual disabled opacity is 1, with legible muted text; focus colors exceed 3:1
against adjacent solid surfaces. These checks cover the stated solid surfaces,
not arbitrary transparency or gradients. No new gradients or overlays were added.

## Related concepts and remaining review boundary

Followed rendered related links by keyboard in both locales at desktop and 320px.
#668/#step2 actually derives C(x), kth values with duplicates and inclusive
binary-search bounds. #793/#step2 actually defines a first-threshold boundary for
a monotone factorial-zero count and subtracts two boundaries. Labels promise
these precise concepts, not identity of their underlying counting formulas.
These destinations were served by the supplied local preview; hashes of their
runtime files are retained in the candidate receipt for reference. Their future
release inclusion/public availability must be checked by the release owner.

Frozen candidate identity: candidate-sha256.json; author/review status: status.json.
Independent cold teaching review is the next required step. No claims about actual
learners, independent acceptance, LeetCode acceptance, or production delivery.

## Appended review repair, 2026-10-26

The above v1 record is historical. Independent review subsequently required
878-R1 (step5 code mappings were input labels). New candidate 878-r1-fix-v2
restores the bilingual explanations; finding status is fixed awaiting review.
See [repair self-check](r1-fix/SELF-CHECK.md), red regression
[log](r1-mapping-red.log), and [candidate hashes](r1-fix/candidate-sha256.json).
The original review's changes_required outcome is unchanged.
