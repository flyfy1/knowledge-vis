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
