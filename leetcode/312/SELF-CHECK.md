# #312 author self-check

Candidate date: 2026-10-24. This is author evidence only; no independent acceptance is claimed.

Commands and results:

- `python3 -B leetcode/312/tests/test_core.py` — passed exhaustive arrays length 0–6 over values 0–3, seeded cases, and official/boundary examples.
- `node --check copy.js core.js app.js` — passed.
- `node tests/test_trace.js` — passed recurrence and monotonic-frame checks for official and boundary presets.
- `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only` — passed with no output.
- `NODE_PATH=... node tests/browser-check.js` against `http://127.0.0.1:18770/leetcode/312/` — passed at 390px: forward/back, preset switch, prediction reveal, locale round trip, no page errors.
- Source parity — validator compared `solution.py` bytes with `python-code.js` JSON payload.
- CSS size — local stylesheet 542 bytes; shared stylesheet is reused.
- Official evidence — `tests/evidence/official-contract.json`, accessed 2026-10-24, records statement, examples, constraints, and Python3 interface observation.

Numerical invariants checked: every frame’s nonzero `dp[left][right]` is equal to the independently recomputed recurrence; each completed interval has all shorter subintervals ready; terminal `dp[0][n]` equals brute force. Boundary values checked: empty list, singleton, zero, and [1,5].

Browser coverage completed: English and Chinese labels, endpoint controls, preset reset, prediction selection/reveal/change, source disclosure, official link, and narrow viewport. Remaining evidence limits: 320px/desktop/200% zoom screenshots, clipboard-denied fallback, keyboard-only walk, measured contrast, and independent cold teaching review should be rerun by the reviewer.

## Required-finding fix evidence (candidate revision after `a69730b71547dd3237306a9b2a2ee07410160f43`)

- `OPEN-312-FORMULA`: `copy.js` now stores `formula` as an explicit `[zh, en]` pair, so the locale renderer displays the full recurrence in both languages. Browser smoke asserted `dp[left][right]` in `.formula` after loading English and after switching to Chinese.
- `OPEN-312-TRACE-LABEL`: `core.js` records `bestK` from the maximizing candidate and `app.js` renders that key with `best`; `tests/test_trace.js` recomputes both for every completed frame and fails on any mismatch. The browser smoke advances to the previously failing frame and asserts `candidate last 1`.
- `OPEN-312-QUIZ-PREDICTION`: `copy.js` gives the three choices distinct numeric values (4, 2, 1), while retaining option 1 as the sentinel-boundary answer. The browser smoke selects option 1, reveals feedback, and exercises the locale round trip.

Validation run from repository root:

- `node --check leetcode/312/copy.js && node --check leetcode/312/core.js && node --check leetcode/312/app.js` — passed.
- `python3 -B leetcode/312/tests/test_core.py` — passed exhaustive arrays length 0–6, seeded cases, and official/boundary examples.
- `node leetcode/312/tests/test_trace.js` — passed recurrence, monotonic-frame, and best-candidate-label checks.
- `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only` — passed with no output; complexity remains the single string `O(n^3) time; O(n^2) auxiliary space`.
- `NODE_PATH=... PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=... node leetcode/312/tests/browser-check.js` — passed at 390px with English/Chinese formula checks, trace label, preset, prediction/reveal, and no page errors.
- Additional Playwright smoke — passed at 320px, 390px, and 1280px in both locales; checked full formula text, maximizing candidate label, and three distinct quiz choice values.

## Reopened candidate — 2026-10-25 (author self-check only)

Base checkout: `463bb166caa1c2ab9ba13c898ab9e70bb200c3e7`. New candidate
bytes are frozen by [candidate.json](tests/evidence/reopened-index/candidate.json).
Historical reviews remain unchanged. Status: **fixed awaiting independent review**;
this evidence grants no independent acceptance or publication eligibility.

Finding mapping:

- **R312-INDEX-001:** both prompts show `nums=[2,1,2]` and padded
  `values=[1,2,1,2,1]`. The chosen balloon is explicitly zero-based padded
  index 3, original `nums[2]`. Independently calculated product:
  `values[0]×values[3]×values[4]=1×2×1=2`. Option 1 remains correct.
  Feedback identifies fixed endpoints, distinguishes this product from the
  interval optimum (10), and explains why options 4 and 1 are wrong.
  [Baseline failure](tests/evidence/reopened-index/baseline-failure.txt) records
  the browser regression failing on the original ambiguous prompt before editing.
- **R312-HAND-001 (author-found during this fix):** the largest-first example
  previously reused a balloon already burst. After bursting 5 in `[3,1,5]`,
  the remaining `[3,1]` permits only totals `5+3+3=11` and `5+3+1=9`.
  Both explanations now show 11 as the best largest-first total, versus 35
  for bursting 1 first. Both rendered languages are asserted by the regression.

Validation from repository root (all passed):

- `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only` — exit 0,
  no output. Metadata unchanged; complexity is exactly the string
  `O(n^3) time; O(n^2) auxiliary space`. `supportedLanguages` includes both
  faithful Python and TypeScript; Python remains canonical. Existing local
  official-interface evidence is preserved. Read the exact Python source/mirror
  pair in `scripts/register_leetcode_lesson.py`: `solution.py`, `python-code.js`,
  `PYTHON_SOURCE`; no regeneration was needed.
- `python3 -B leetcode/312/tests/test_core.py` — exhaustive independent
  burst-first oracle for lengths 0–6 over 0–3 and boundary/official examples.
  The existing random loop compares the solution with itself, so it is not
  claimed as independent random evidence. Additional actual Python execution
  checked fresh `[2,1,2]→10`, 300 ones→300 and 300 hundreds→298010100,
  with input preservation. For hundreds the hand formula is
  `298×100³ + 100² + 100`.
- `node leetcode/312/tests/test_trace.js` and individual `node --check` runs
  for `copy.js`, `core.js`, `app.js` — passed. An Acorn parse of COPY confirmed
  no duplicate property names and two literal strings per localization entry.
- `node leetcode/312/tests/browser-check.js` — existing smoke passed.
- `node leetcode/312/tests/reopened-index-check.js` — passed using provided
  `NODE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, against
  `http://127.0.0.1:18770/leetcode/312/`. Both locales at 320/390/736/1440:
  all three options, reveal/change, locale switching after every revealed
  option, preserved selection/feedback, and independent trace preset changes.
  Checks rendered padded-index meaning and hand products, not just the answer
  option number. [Observed text](tests/evidence/reopened-index/observed.json)
  records input, locale, width, selection and actual feedback for every case.
- Rendered-state regressions: full exact formula in both locales; interval
  `(0,3)` displays maximizing k=1 with 30 and candidate k=2 with 8; progress
  0/10 then 5/10; rewind/replay preserves the table; endpoint 167 disables Next.
  Counts are completed intervals, not candidate evaluations or coin totals.
- Exact unchanged canonical Python equals decoded mirror, DOM `textContent`,
  actual successful clipboard readback, captured copy-handler payload, manual
  fallback selection and keyboard-copy readback, and downloaded bytes, including
  the final newline. Offline source rendering works with `solution.py` blocked.
  Chromium clipboard text showed no newline conversion.
- Screenshots in `tests/evidence/reopened-index/` cover both locales at all
  four widths and the exercise at 320px with 200% text enlargement. Visually
  inspected English enlarged and Chinese narrow exercise captures; question,
  options and feedback wrap. Normal-width checks found no page overflow.
  The 200% check asserts the exercise's text geometry: a pre-existing header
  official link overflows at this extreme text size, so no whole-page 200%
  no-overflow claim is made. Full-page captures can include sticky navigation
  over the heading; the exercise text remains readable on scroll.
- `git diff --check` — passed. Only lesson-local files changed. Cache version
  for changed `copy.js` was bumped. Canonical source, core, controls, metadata,
  shared assets, registry, historical reports and services were not changed.

Limits: desktop Chromium preview and synthetic text enlargement only; no actual
phone, production delivery, novice teach-back, LeetCode submission or independent
acceptance is claimed. Next action: separate reviewer cold-walks the affected
hand calculation and transfer exercise, then rechecks R312-INDEX-001 and the
author-found correction against this manifest under the unchanged rubric.

## Review-3 required fixes — 2026-10-25 author self-check

Candidate: `312-review3-fix-20261025`, identified by
[SHA-256 manifest](tests/evidence/review3/candidate.json). This is a new
uncommitted candidate for separate independent re-review. The previous report
`specs/reviews/312-review-3-d7af6df0.md` and its changes-required result remain
historical evidence. Neither required finding is independently closed here.

| Stable finding | Fix and causal check | Author status |
| --- | --- | --- |
| R312-PRESET-001 | Both localized `[0,4,2]` labels now advertise 12. Removing 0, then 2, then 4 yields 0+8+4=12. A first-burst recursive oracle checks **every** advertised preset in both languages; browser terminal `dp[0][4]=12`, highlighted cell 12, and candidates 8/12/10 agree. | fixed awaiting review |
| R312-PROOF-001 | Replace the arbitrary-optimal-sides claim with upper bound and attainability. Keeping last alive fixes both side boundaries; any feasible side score is at most its optimum. Execute optimal sides then last to attain the candidate. The earlier derivation now explicitly selects optimal side orders. In padded `[1,3,1,5,1]`, actual neighbor simulation checks left 3+5=8 versus dp[0][3]=30, whole 8+5=13 versus 30+5=35, with the same final gain 5. | fixed awaiting review |

Validation completed from the repository root:

- `node leetcode/312/tests/review3-regression.js`: passed. The same regression
  first reproduced `8 !== 12` before editing; see
  [failing baseline](tests/evidence/review3-before.txt) and
  [passing result](tests/evidence/review3-regression.txt). Checks unique COPY
  keys before evaluation, two-string pair shape, all preset labels against an
  independent first-burst oracle, each trace candidate's previous-frame operands,
  one-interval cumulative increments, unchanged unrelated cells, and maximizing
  identity/value. Proof directions receive structural checks; mathematical
  meaning was also read in both rendered locales, rather than inferred from
  matching phrases alone.
- `python3 -B leetcode/312/tests/test_core.py`: exit 0, printed
  `python oracle/core checks passed` and
  `fresh cases, n=300 closed forms and nonmutation passed`. Executes actual
  `Solution.maxCoins`, exhaustive lengths 0–6 over values 0–3, 20 seeded random
  inputs, official examples, `[0,4,2]→12`, fresh `[2,3,1]→12`,
  `[2,3,4]→36`, and n=300 zeros/ones/hundreds → 0/300/298010100.
  Random tests now compare with the independent removal oracle instead of the
  solution itself. Input preservation checked for random/fresh/large cases.
- `node leetcode/312/tests/test_trace.js`: exit 0, trace invariants passed.
  `node leetcode/312/tests/browser-check.js`: exit 0, existing smoke passed.
  `node --check` for changed COPY and new test scripts: exit 0.
- `node leetcode/312/tests/review3-browser.js`: exit 0; see
  [run result](tests/evidence/review3-browser.txt) and
  [observations by finding, viewport and locale](tests/evidence/review3/observed.json).
  Real Chromium uses the supplied executable and NODE_PATH, preview
  `http://127.0.0.1:18770/leetcode/312/`. Both locales at
  320/390/736/1440 CSS px and 682px at DPR 2. The latter is a 200% layout/raster
  emulation, not native browser menu zoom. Checked corrected zero preset and
  full rendered proof/example, progress 0/6, final 12 and rewind/replay; existing
  full formula, default frame 5 `(0,3)` maximizing k=1 worth 30 versus k=2 worth
  8, completed interval count 5/10, final 167, disabled endpoints, reset/preset
  restart, keyboard Enter, and all quiz choices with explicit reveal. Changing
  choices hides feedback; locale switching preserves selection and meaning.
  The fixed exercise remains independent of trace preset changes.
- Every new proof/preset path has EN/ZH captures in `tests/evidence/review3/`.
  Visually inspected `en-320-proof.png`, `zh-390-proof.png`,
  `en-1440-proof.png`, `zh-682-proof.png`, and `en-320-zero.png`.
  Proof text wraps, and the zero preset agrees with its terminal readout.
  The narrow DP table retains intentional internal horizontal scrolling;
  rightmost columns can lie outside the screenshot until scrolled.
  No page overflow at tested normal sizes and no page/HTTP errors. Existing
  320px 200% text-enlargement checks cover the exercise, not an assertion of
  whole-page text-zoom conformance. Longer paragraphs remain vertically scrollable.
- Exact canonical `solution.py` equals `PYTHON_SOURCE`, rendered `textContent`,
  successful real clipboard readback, manual fallback textarea and selected text,
  actual fallback Control+C readback, and downloaded bytes including final newline.
  No newline normalization was needed. Offline mirror source still displays
  with the canonical download request blocked. No regeneration needed because
  canonical source is unchanged. Preview response bytes for index, COPY, core,
  app, local CSS, mirror and Python matched local files exactly.
- Read the exact Python pair in `scripts/register_leetcode_lesson.py`:
  `solution.py` / `python-code.js` / `PYTHON_SOURCE`. Preserved Python contract
  and lesson-local official-interface evidence; `supportedLanguages` includes
  Python **and** TypeScript, so neither available preferred interface is omitted.
  The [official statement](https://leetcode.com/problems/burst-balloons/) was
  reopened on 2026-10-25 and agrees with the examples/constraints; this fetch
  exposes no editor language selector, so no new full-selector audit is claimed.
- `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only`: exit 0,
  stdout/stderr empty. [Recorded command and result](tests/evidence/review3/preflight.json).
  Complexity remains exactly one nonempty string:
  `O(n^3) time; O(n^2) auxiliary space`. No metadata repair was needed.
- `git diff --check`: passed. Only `leetcode/312/` files changed. COPY cache
  reference bumped. No shared assets, registry, scripts, historical reports,
  campaign/acceptance state, Git settings or services edited; no registration,
  commit, push, deployment, scheduling, credentials or child agents used.

Limits: author self-check on desktop Chromium, not independent teaching approval,
novice comprehension measurement, physical-phone validation or LeetCode submission.
Next action: a separate reviewer checks this manifest's candidate under the frozen
rubric, cold-walks the affected derivation/proof and zero preset, and adjudicates
R312-PRESET-001 and R312-PROOF-001. No new score or acceptance is assigned here.
