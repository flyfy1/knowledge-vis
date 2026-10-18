# Lesson 41 repair self-check — 2026-10-18

Status: **candidate ready for separate independent re-review**. This is the
implementer's self-check, not independent acceptance. Historical review
`specs/reviews/41-review-1-1c260097.md` is unchanged. All three findings remain
**fixed awaiting review**; only an independent reviewer can close them.
New candidate: lesson-local file SHA-256 manifest in `evidence/candidate.json`.
No commit, registration, campaign-state change, publication or deployment.

## Finding mapping

| Stable ID | Causal fix | Regression evidence |
| --- | --- | --- |
| 41-R1 | Added lesson-entry.json with exact ID, route, bilingual metadata, valid concept anchors and the single string `O(n) time; O(1) auxiliary space`. | Root command `python3 -B scripts/register_leetcode_lesson.py 41 --validate-only`: before exit 2 (missing file), after exit 0; final receipt in evidence/preflight.json. |
| 41-R2 | Shared trace uses default -1 indices to mean no active operation. Lesson-local adapter exposes separately named op_i / swap_to markers and null (rendered ∅), removes inactive highlights, and explains the marker meaning beside the state and in the Python mapping in both locales. Saved Python target is never represented by an inactive sentinel. Initial/final frames have both markers ∅; skips have no swap destination. | evidence/before.json reproduces old failures; evidence/after-focused.json passes EN/zh. Event 2 now shows op_i=0, swap_to=∅ and explicitly explains that Python target remains 2. evidence/en-skip-state.png and zh-skip-state.png; exhaustive trace parity in evidence/trace.txt. |
| 41-R3 | Lesson-local `.trace-cell.hot small` uses existing --text (#e8edf4) over unchanged #164b59 instead of --muted. Applies to current and previous diagrams. | Computed sRGB contrast rises from 3.93:1 to 8.1706:1. Browser assertions cover both diagrams in EN/zh at 320/390/736/1440; colors, ratios and geometry in evidence/browser.json, screenshots alongside. |

## Diagnosis and preservation

Failing loop created and run before edits:
`node leetcode/41/tests/review-regression.cjs` (exit 1; six failed locale/finding
checks saved in evidence/before.json). It exercises the actual rendered model
and computed colors, rather than a substitute renderer. Baseline preflight
also reproduced the missing-file error. No hard algorithm defect was found.

Ranked falsifiable hypotheses, announced before fixes:
1. Trace defaults leak display sentinels into Python-like state. Confirmed by
   the shared emit signature and original model output; local normalization
   removes the rendered sentinel without altering data or operation sequence.
2. Locale rerender leaves stale state. Rejected by before/after locale snapshot
   equality and repeated independent locale runs; no locale handler change.
3. Muted CSS token remains on teal active cells. Confirmed by computed RGB;
   changing only that lesson-local foreground raises contrast to 8.17:1.
No debugging instrumentation remains. Shared assets were read, never edited.

Additional pacing clarification: explain what set(nums) stores, and hand-work
[2,1] → [1,2] with answer 3 before introducing the general destination formula.
Existing chained-swap example, duplicate wrong rule and fresh prediction [2,2,1]
remain, with equal causal explanations in both locales.

## Executed verification

- `python3 -B leetcode/41/tests/algorithm-regression.py`: **56,994** actual
  canonical Python cases. Exhaustive lengths 1…6 over {-2,0,1,2,3,7}, 1,000
  seeded random cases, fresh [2,3,1,5] → 4 / [1,1] → 2 / [2,2,1] → 3,
  integer extrema and four length-100000 fixtures. Membership oracle, multiset
  preservation and final presence-position invariants pass. Exact decoded
  `python-code.js` / `solution.py` byte parity passes.
- `node leetcode/41/tests/trace-regression.cjs`: **9,330** exhaustive inputs,
  checking answers, every intermediate multiset, fixed-slot permanence, exact
  swaps, marker values and unchanged original frame arrays/code/messages.
- `node leetcode/41/tests/review-regression.cjs`: all six focused checks pass.
- `node leetcode/41/tests/browser-check.cjs`: **8** check groups pass; eight
  locale/width layouts, 200% CSS zoom, no state-label/value overlap or page
  overflow, current/previous index contrast ≥7:1; no page or HTTP errors.
  Every preset resets and reaches the correct endpoint; rewind/replay,
  result hiding, reset, slider ArrowRight, rewind Space, Next/reveal Enter,
  visible 3px focus and all prediction feedback paths pass. Locale preserves
  complete snapshot, choice and reveal. Denied localStorage remains usable.
- Canonical Python source equals the offline constant, displayed code, captured
  clipboard argument, selected denied-clipboard fallback, served response and
  actual browser download. Direct file:// opening verifies the offline display.
  Python source/mirror are unchanged, so no regeneration was necessary.
- `node --check leetcode/41/app.js`, `node --check leetcode/41/copy.js` and
  `git diff --check`: exit 0. Preview source bytes verified against disk in
  evidence/served-assets.json. All writes are confined to leetcode/41/.

Read the exact LANGUAGE_FILES policy in scripts/register_leetcode_lesson.py:
Python uses solution.py / python-code.js / PYTHON_SOURCE. This lesson already
uses the preferred faithful Python `Solution.firstMissingPositive(self,
nums: List[int]) -> int` interface, executed by the tests above. There is no
non-Python language-contract.json or supportedLanguages list omitting Python
or TypeScript. A fallback interface contract is therefore inapplicable.
The existing independent report also verified this callable interface.
The [official statement](https://leetcode.com/problems/first-missing-positive/)
was re-opened normally on 2026-10-18: unsorted integers, smallest missing
positive, n≤100000, signed 32-bit bounds, O(n) time and O(1) auxiliary space
still agree. No submission was made.

Inspected en-320-diagram.png, zh-390-diagram.png, en-skip-state.png and
zh-zoom200.png visually: highlighted index labels are clear; marker legend wraps
and short labels remain separate from values. Some viewport screenshots start
within the experiment because of the intentional scroll position beneath sticky
navigation. Geometry for all widths is recorded separately.

Limitations: headless Chromium, not real mobile hardware or a screen-reader
session. 200% is CSS zoom/reflow, not native toolbar zoom. No novice study,
LeetCode submission, production verification or independent acceptance is claimed.
Next action: independent reviewer checks the frozen candidate and appends their
own re-review against 41-R1/R2/R3 without rewriting the historical result.
