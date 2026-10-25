# #691 author self-check — candidate 1

Status: complete author candidate; ready for a separate independent review.
No independent acceptance, LeetCode submission, publication or actual learner
outcome is claimed. Only leetcode/691/ was authored. No shared registry, service,
workflow, campaign report, credential, or Git configuration was changed.

## Contract and execution

The official page and public GraphQL were accessed on 2026-10-25. The full dated
statement, examples, constraints and all observed selector snippets are retained
in ../provenance/official.json. Python3 explicitly offers
Solution.minStickers(self, stickers: list[str], target: str) -> int. Python is
the canonical submission, so no non-Python language exception applies.

`python3 -B leetcode/691/tests/check.py` passed: 2,542 exhaustive small cases,
350 seeded cases, 8 official/boundary fixtures, and 52 simulation cases.
An independent position-mask BFS checks the actual Python callable. This oracle
uses neither memoized count tuples nor pivot filtering. The actual displayed
baseline also executes on 80 seeded cases. Trace audit covers 1,822 events and
215 completed memo values, strict count decrease, componentwise subtraction,
parent immutability, candidate arithmetic and the running minimum.
Source mirror bytes and unique bilingual copy keys are checked separately.
See evidence/core-results.json.

`node leetcode/691/tests/browser.cjs` passed in real headless Chromium on the
existing preview at http://127.0.0.1:18783/leetcode/691/. Both locales exercise
all seven presets, every event, forward/back replay, reset/end disabled states,
the hand experiment, every quiz choice, reveal/change, language preservation,
preset/quiz isolation, blocked storage, keyboard focus, deep links, forced colors
and reduced motion. English and Chinese formula text contains the full base,
subtraction, minimization and pivot condition. State-specific history and quiz
feedback are saved in evidence/browser-results.json.

Source textContent, offline mirror, successful clipboard transfer, downloaded
bytes and manual fallback native Control+C/readback match solution.py including
its final newline. The manual scenario seeds a distinct clipboard sentinel and
verifies focus and full selection. The host is Linux; no platform key is inferred
from mobile viewport emulation. The async success check waits for completion.

## Presentation evidence

Real Chromium widths: 320, 390, 736, 1440 CSS px; 200% CSS layout zoom at 1440.
This is a layout zoom check, not a claim about physical devices or browser chrome
zoom. No document overflow; controls meet 48px sizes. Focus is a visible 3px ring;
focus-to-panel contrast is 9.81:1. Measured body, hint, normal control, disabled
control and code contrast ratios are 16.09, 7.74, 13.40, 7.08 and 16.44 respectively.
Shared + local shipped CSS is 11,725 bytes. Main-page requests are local; there
are zero observed console/page errors or failed assets.

Visually inspected captures include English 320/1440 trace, Chinese 320/1440
trace, both zoom traces, Chinese 390 quiz, English 390 quiz, and manual fallback.
Count tuples, missing-letter values, call labels and history wrap separately;
no essential text is clipped. Tall component captures suppress sticky navigation
only for the screenshot, after observing the overlay artifact in an earlier
capture. Runtime navigation is unchanged and actual deep-link geometry is tested
with the sticky bar present. Standard viewport/header and hand captures supplement
the component evidence. Copy fallback shows a scrollable textarea containing the
full selected source; its full value is asserted, not inferred from visible rows.

Harness diagnostics and rerun instructions are recorded in README.md. Early
harness failures are not independent review findings and were not cleared by
weakening source equality, endpoint behavior or contrast thresholds.

## Metadata and freeze

From the repository root:
`python3 -B scripts/register_leetcode_lesson.py 691 --validate-only`
exited 0, with empty stdout/stderr. It did not register or mutate shared assets.
Full receipt: evidence/metadata-preflight.json. Complexity is one nonempty string
covering time and space, with the actual repeated-count preprocessing cost.
Candidate hashes: evidence/candidate.json. No prior review result is superseded.
Any subsequent implementation or metadata edit requires a new frozen candidate.

Remaining gates: separate fresh-context independent teaching review; no novice
study, physical-device assessment, external LeetCode acceptance or public release
was performed or implied.

## Review-1 repair — R691-01 (author self-check, awaiting re-review)

Historical review: specs/reviews/691-review-1-3047afed.md, candidate
 d567dd00bc05b3a4f86493dc28149d1fe3235660, outcome changes_required.
Current checkout base: 17ee79ab36749befdf9f0268df72a12f1f31e551.
Fix mapping: **R691-01 → copy.js p6 English label + index.html copy asset version**.
The old “Length-15 target, missing letters · −1” becomes “15-letter target · −1”.
The input length and advertised result stay together; adjacent input data still
shows why the target is impossible (abcdefghij cannot supply k–o). No algorithm
change was required by this finding. Status: fixed by author, reviewer closure
pending. Prior review/evidence and prior self-check receipts remain historical.

The focused test was written and run red before repair: `EVIDENCE_TAG=before node
leetcode/691/tests/selected-label.cjs`, exit 1, original label 276.24 px in a
262 px control, 210 px available after padding/borders/20 px arrow allowance.
The unchanged final test then passed using `EVIDENCE_TAG=after node
leetcode/691/tests/selected-label.cjs`, exit 0: 56 selected-label measurements,
all seven presets × EN/zh × 320/390/1440/640-at-200%-zoom, plus event-3 locale
roundtrip and final −1 checks. Repaired English 320 label: 144.90 px, control
238 px, allowance 186 px, height 48 px. Exact stack remains 16px “PingFang SC”,
“Microsoft YaHei”, system-ui, sans-serif; exact resolved font is not asserted.
Host Linux, Chromium 156.0.8078.4, same platform/browser as reported failure.
Before/after label screenshots were visually inspected, along with English
320 event-3 roundtrip and both 200% narrow-layout labels: scope/result complete,
no clipping, tuple labels wrap. The test and JSON record the native-arrow reserve
explicitly; geometry alone is not presented as visual proof.

Commands from repository root (OUTPUT_DIR set to
`$PWD/leetcode/691/tests/evidence/review-1-fix` for the existing runners):

- `python3 -B leetcode/691/tests/check.py`: exit 0; 2,542 exhaustive, 350 seeded,
  8 boundaries; 52 traces, 1,822 events and 215 completed memo checks. Actual
  canonical Python and baseline execute; source parity and duplicate-key checks pass.
- `node leetcode/691/tests/browser.cjs`: exit 0, “Browser self-check passed”. Both
  locales/all events, prediction reveal/change and scope, formula, copy/download,
  manual fallback with Linux Control+C and sentinel readback, offline mirror,
  keyboard, blocked storage, widths/zoom, contrast, local requests and zero errors.
- `node leetcode/691/tests/rendered-state.cjs`: exit 0. Both locales preserve
  event-28 sticker a / child b=1 / candidate 2 / best 1 on rewind/replay; cumulative
  history includes exactly initial event 0 plus 28 advances. Formula operands and
  six-letter/three-sticker prediction calculation checked separately from copy text.
- `python3 -B scripts/register_leetcode_lesson.py 691 --validate-only`: exit 0,
  empty stdout/stderr. Safe, non-mutating preflight; no registration performed.
  Complexity remains one nonempty time/space string; no metadata repair needed.

Read LANGUAGE_FILES and verified Python's exact solution.py/python-code.js /
PYTHON_SOURCE mapping. Existing official provenance includes faithful Python3
and TypeScript interfaces; Python remains selected by preference. No non-Python
contract or supportedLanguages omission applies. Canonical Python SHA-256 stays
88680076d70ab2a450ff60d16560c4536d86a6b1d35e764b3a8144865b976252;
no source regeneration was necessary. Exact displayed/copied/downloaded/offline
parity retains the final newline. New candidate manifest and test results live
in evidence/review-1-fix; original evidence is preserved. No independent acceptance,
physical-device/macOS proof, novice study, LeetCode submission or deployment is
claimed. Next action: independent focused re-review of frozen R691-01 repair.
