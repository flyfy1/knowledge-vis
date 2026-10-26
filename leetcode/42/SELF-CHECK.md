# #42 required-finding repair — author self-check

Date: 2026-10-18 (Asia/Singapore). Candidate label: `42-fix-r1`.
Status: **ready for separate independent re-review, not independently accepted**.

Historical report: [42-review-1-c31e1a0d.md](../../specs/reviews/42-review-1-c31e1a0d.md),
reviewed candidate `e8db40883f410333b53431d80aeaedc7fab566fb`.
Working checkout base: `fe1c5b2a03c9831ee826e7e146f5494f43839c29`.
This uncommitted candidate is frozen by the SHA-256 file list in
[evidence/fix-r1/candidate-manifest.json](evidence/fix-r1/candidate-manifest.json).
The report, rubric and prior result are unchanged. This document is author
verification and does not close either finding on the reviewer's behalf.

## Finding mapping

| Stable finding | Repair | Self-check evidence | Status / next action |
| --- | --- | --- | --- |
| `42-META-01` | Added `lesson-entry.json` with bilingual metadata, existing step-2 concept, canonical Python, and exactly one complexity string: `O(n) time; O(1) auxiliary space`. | Initial preflight reproduced missing-file exit 2. Final root command `python3 -B scripts/register_leetcode_lesson.py 42 --validate-only` exited 0, with empty stdout/stderr and unchanged lesson hashes; [receipt](evidence/fix-r1/preflight.json). | Fixed awaiting independent review. Reviewer reruns safe preflight against this new candidate. |
| `42-TEACH-01` | Before the baseline in both locales, identify walls 3/4, explain overflow at level 3, compute `min(3,4) = 3`, subtract middle bar `3 − 2 = 1`, calculate both zero-height interior positions, then total `0 + 3 + 1 + 3 + 0 = 7`. Explain the taller-wall-only and level-as-depth mistakes. Updated both embedded copy objects and BRIEF. | Real browser confirms the numeric explanation precedes baseline, wraps within its paragraph at every tested width, and preserves working interactions. [EN 320](evidence/fix-r1/en-320-hand.png), [ZH 390](evidence/fix-r1/zh-390-hand.png), [EN desktop](evidence/fix-r1/en-1440-hand.png), [browser receipt](evidence/fix-r1/browser-results.json). | Fixed awaiting independent review. Reviewer cold-walks step 01 and its baseline/invariant prerequisites in EN/ZH. |

## Execution and parity

- `python3 -B leetcode/42/tests/regression.py`: **22,355 cases passed** against a separate per-column oracle, executing actual `Solution.trap`. Exhaustive heights 0..3 for lengths 1..7, 500 seeded random cases, official examples, tiny transfer/counterexamples, single/monotonic arrays and length-20000 boundaries. Inputs remain unchanged. Maximum basin returns 1,999,800,000. [Receipt](evidence/fix-r1/python-results.json).
- Fresh code check `[2,0,1,0,3]`: predicted depths 0,2,1,2,0 and result 5; actual 5. Counterexample `[3,0,1]`: predicted 1 rather than left-only bound 3; actual 1. These are code checks, not custom-input UI experiments. The existing prediction `[4,1,3]` remains fresh relative to the worked example.
- `node leetcode/42/tests/model.cjs`: **3,284 inputs / 27,914 frames passed**. Settled depths equal the oracle, their sum equals water, each settlement moves one pointer by one and settles one additional position, and inputs remain unchanged. [Receipt](evidence/fix-r1/model-results.json).
- `node --check leetcode/42/copy.js`: exit 0. The copy asset reference is bumped to `42-fix-r1`. No algorithm, shared runtime, CSS, controls or official source changes were needed.
- Read exact `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python is `solution.py` / `python-code.js` / `PYTHON_SOURCE`. JSON-decoded offline mirror equals the canonical source exactly, including final newline. Both locales' displayed code, successful copied text, downloaded bytes and denied-clipboard fallback equal that source. Preview responses match checkout bytes for all five lesson runtime assets.
- Canonical choice remains faithful Python `Solution.trap(self, height: List[int]) -> int`; no non-Python exception or `supportedLanguages` list exists to omit Python/TypeScript. Python already satisfies the first language preference, so a non-Python language contract is inapplicable. The [official statement](https://leetcode.com/problems/trapping-rain-water/) was reopened on 2026-10-18: nonnegative unit-width heights, n ≤ 20,000, heights ≤ 100,000, examples 6 and 9 agree with this lesson. The prior independent report also verified the Python interface. No LeetCode submission was performed.

## Browser and visual checks

Command from repository root: `NODE_PATH="$NODE_PATH" node leetcode/42/tests/browser.cjs`.
Real Playwright Chromium used `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` from the environment.
[Run log](evidence/fix-r1/browser-run.txt) and [detailed results](evidence/fix-r1/browser-results.json).

Both EN and ZH at 320/390/736/1440 px: hand paragraphs remain in bounds, all
numeric contributions precede the baseline, no page overflow. Inspected focused
mobile and desktop captures. All four preset endpoints remain 7/6/0/0;
next→back→next restores exact snapshots, reset and preset changes restore event 0,
and disabled endpoints are truthful. All three prediction choices reveal causal
feedback; changing choice clears it; switching locale preserves trace and quiz
state. Range ArrowRight, Next Enter, and Prev Space work. At default event 2,
water=3 and left=2 with three cyan blocks. At dry event 1, the active column
has transparent background and no cyan water blocks.

Official preset event 8 remains readable with 12 columns in both locales at all
four widths. Focused 320/390 chart/state screenshots show separate index/depth
labels and state label/value rows (for example [ZH chart](evidence/fix-r1/zh-390-trace.png),
[EN state](evidence/fix-r1/en-320-state.png)). Local links and step anchors resolve;
actual step-2 navigation reaches its target below navigation. Offline `file://`
loading retains exact Python source and functioning locale/trace controls even
when storage reads/writes throw.

200% **CSS zoom** was checked in both locales at 1440 px with no page overflow;
focused paragraph screenshots supplement whole-section captures. Large section
captures can contain sticky navigation overlays at the capture scroll position;
these are screenshot artifacts. No new style/token literals were introduced.
No application page errors or lesson asset failures occurred. The preview's
unrelated root `/favicon.ico` returns 404; this is explicitly retained as an
external preview issue in the browser receipt and was not changed outside scope.

Evidence limits: this is author self-checking, not independent acceptance or
measured novice comprehension. Native browser-toolbar zoom, physical devices,
and public delivery were not verified. All writes are inside `leetcode/42/`;
no registration, shared assets, registry, report, campaign status, service,
Git configuration, commit, push, deployment, credentials, schedules or child
agents were used. Next action is separate independent re-review of this frozen
candidate and closure (or further findings) by that reviewer.

## Wall-height experiment — 2026-10-26

This later bounded revision adds `wall-model.js`, `wall-lab.js`, `wall-lab.css`
and mounts the lab inside step 1. Earlier receipts above describe the earlier
candidate; this revision's evidence is `tests/evidence/wall-proof/`.

- Independent unit-cell oracle: 19,530 arrays, 112,305 columns passed.
- Canonical Python: 22,355 inputs passed; optimized JS: 3,284 inputs,
  27,914 frames passed. Python mirror remains exact.
- Both locales: 119 input combinations each, four viewport widths, 200% CSS
  zoom, exact rewind, separate reset/restore, keyboard, storage denial,
  language/state preservation and existing-trace isolation passed.
- Original browser regression passed (presets, quiz, copy/download/fallback,
  anchors and offline behavior). Missing favicon is an existing preview-only
  404; no runtime page errors were observed.
- Actual generated `42-codex/` route passed the full new browser suite. Numeric
  redirect preserves `?wall=proof#wall-lab`; eight runtime assets match source
  bytes. Header displays `Codex 开发` in Chinese and `Developed by Codex` in English.
- Viewed final `en-320-state.png`, `zh-390-controls.png` and
  `zh-1440-state.png`: unit-grid water, numeric depth and active code agree;
  controls and labels are readable, no horizontal page overflow.

Author self-check only; independent review remains pending. No public deploy,
physical-device test, native zoom, LeetCode submission or learner study.
The local commit is handed to the existing integration owner for merging into
main and publication; no separate push is authorized in this workstream.
