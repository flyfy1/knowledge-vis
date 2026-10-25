# Author self-check evidence

Run on 2026-10-24:

- `python3 leetcode/239/tests/test_solution.py` — solution agrees with direct-scan oracle on official examples, edge cases, and seeded random arrays.
- `node leetcode/239/tests/test_core.js` — every trace output agrees with direct maxima and every frame preserves increasing indices/decreasing values.
- `node leetcode/239/tests/browser-check.js` — preview URL exercised at 320, 390, and 1280 px in both locale state and interactive paths; no page errors or horizontal overflow; screenshots saved in this folder.
- `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` — passed metadata and exact source parity.

This is author self-check evidence only. Independent review, actual learner outcomes, and LeetCode acceptance are pending/not claimed.

## 2026-10-25 — title repair candidate

Finding **239-PUB-R1: fixed awaiting independent review**. Both `title` locale
entries now include `#239 · `, which the existing H1 consumer renders directly.
`index.html` versions the changed copy asset. The exact official link is retained.
No algorithm, interaction, source, metadata, shared asset or registry change was
needed. The existing Python contract includes both Python and TypeScript and its
lesson-local official interface evidence supports the preferred Python choice.
The canonical pair is `solution.py` / `python-code.js` (`PYTHON_SOURCE`), as read
from `scripts/register_leetcode_lesson.py`.

Evidence is in [title-repair-20261025](tests/evidence/title-repair-20261025/):

- `node leetcode/239/tests/title-regression.js` against
  `http://127.0.0.1:18770`: `red.txt` reproduces the original actual H1
  `滑动窗口最大值` versus required `#239 · 滑动窗口最大值` at zh/320.
  `green.txt` and `results.json` record the repaired run. Both locales pass at
  320/390/736/1440px through zh → en → zh after interaction, with exact official
  href, H1 bounds, no page overflow/errors, and retained preset, trace, window,
  prediction selection and revealed feedback. EN/zh 320px screenshots were
  inspected: the full heading wraps naturally and the official link is readable.
- The same regression checks the hand-calculated formula `[1,3,-1] → 3`,
  completed insertion frames for `[9,1,2,3], k=2` (queue `0:9 → 1:1`, then
  `2:2`, cumulative emitted output `[9,2]`, terminal `[9,2,3]`), rewind/replay,
  fresh prediction feedback and feedback invalidation on choice change.
  Prediction input is fixed and independent of the trace preset; no work-count
  metric or optimization recurrence is introduced by this repair.
- Exact equality, including final newline, passed for canonical Python, decoded
  mirror, rendered `textContent`, successful clipboard copy, downloaded bytes,
  and offline file rendering. Forced fallback first seeds a distinct clipboard
  sentinel, verifies focused full selection, dispatches the native Linux
  `Control+C`, and reads the canonical source back. Host and browser are recorded
  in `results.json`; no newline normalization is used.
- `OUTPUT_DIR=leetcode/239/tests/evidence/title-repair-20261025/legacy PREVIEW_URL=http://127.0.0.1:18770 node leetcode/239/tests/browser-check.js`
  passed (`legacy.txt`). Only preview URL configuration changed in the older
  harness; its assertions remain intact and prior evidence is preserved.
- `python3 -B leetcode/239/tests/test_solution.py` passed the executable Python
  against the direct-scan oracle (`python.txt`).
- `node leetcode/239/tests/test_core.js` passed (`core.txt`).
- From the repository root,
  `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` passed
  with exit code 0 (`preflight.txt`). Complexity remains the valid single string
  `O(n) time; O(k) auxiliary space`. No registration was run.

The first new heading-fit assertion compared integer scroll height with line-box
height and reported a one-pixel difference under visible overflow. Inspection
showed complete text with no clipping. The final assertion checks actual text
bounds and overflow/ellipsis behavior; no runtime styling was changed for this
measurement issue.

The frozen candidate is identified by `candidate-sha256.json` in the evidence
directory, including unchanged canonical sources and shared-policy hashes.
P0/highest-return scope is the required bilingual heading and focused regression;
P1/P2 additions are unnecessary. Layout redesign and publication are deferred
because they are outside this repair. This is author self-check evidence only:
separate independent re-review of this candidate and public delivery verification
remain pending. Historical review results and release evidence are unchanged.

## 2026-10-25 — completed-frame membership repair candidate

Author self-check only; **239-R2-01 fixed awaiting independent re-review**.
The prior report `specs/reviews/239-review-2-99bc6fb4.md` remains historical
changes-required evidence. No finding is independently closed here.

Fix mapping:

| Stable finding | Candidate change | Regression evidence |
| --- | --- | --- |
| 239-R2-01 (required) | Convert completed right endpoint i to left=max(0,i-k+1), highlighting only left..i. Empty state highlights nothing; partial state highlights only processed elements. Localized scope explicitly identifies after-update interval, values, expired/pending regions and cumulative output. | `rendered-membership.js`, `red.txt`, `red/membership.json`, `green.txt`, `green/membership.json` |
| 239-R2-N1 (optional) | Translate expired/dominated removals and stale-winner readouts; explain zero-based index:value notation beside the trace. | `trace-copy-check.js`, `copy-current.txt`, `copy/results.json`, `copy/zh-removals.png` |
| 239-R2-N2 (optional) | Define n=len(nums), count exactly (n−k+1)k value visits, explain k=n and use n=100000,k=50000 for expensive overlap. | `copy/results.json`, `python-extra.txt` |
| 239-PUB-R1 (preserved) | Retain bilingual problem ID/title and official link. | unchanged `title-regression.js`, `title.txt`, `title/results.json` |

All new evidence is under
[trace-repair-20261025](tests/evidence/trace-repair-20261025/).

Diagnosis used the website-design and diagnosing-bugs skills. Ranked hypotheses
were (1) endpoint-to-left-edge renderer mismatch, (2) faulty core snapshots,
(3) CSS/locale-dependent membership. The browser regression ran before the fix
and found 404 membership/expired-style mismatches while independently computed
deques and cumulative outputs agreed. At i=3 it records expected [1,2,3] versus
actual [3,4,5] in both locales at all four widths. Only renderer argument
conversion and explanatory copy were changed; core and CSS stayed byte-identical.
The same unchanged membership regression then passed **242** frame checks,
confirming hypothesis 1. No debugging instrumentation was added.

Commands run from the repository root (exit 0 unless identified as red):

- `OUTPUT_DIR=leetcode/239/tests/evidence/trace-repair-20261025/red node leetcode/239/tests/rendered-membership.js`
  — exit 1, the 404 targeted mismatches above (`red.txt`).
- `OUTPUT_DIR=leetcode/239/tests/evidence/trace-repair-20261025/green node leetcode/239/tests/rendered-membership.js`
  — 242 checks passed: all four presets, initial/partial/every completed frame,
  both locales, 320/390/736/1280px, rewind/replay, reset, endpoint and 200% CSS
  layout zoom at 1280px. Independent suffix-max candidate calculation and direct
  window maxima verify all simultaneous membership/deque/output readouts.
- `node leetcode/239/tests/trace-copy-check.js` — passed (`copy-current.txt`):
  EN→zh→EN empty/partial/full labels, i=4 expired and dominated removals,
  translated wrong-winner result, baseline formula and boundary wording,
  every prediction choice and feedback reset, actual Enter to advance,
  blocked-storage initialization and language change. Acorn AST detects duplicate
  object keys before evaluation; none found; all localization values are pairs.
- `OUTPUT_DIR=leetcode/239/tests/evidence/trace-repair-20261025/title node leetcode/239/tests/title-regression.js`
  — passed unchanged assertions at 320/390/736/1440px and both locales. Verified
  state-preserving locale roundtrips, fixed-input prediction isolation, exact
  official link, hand formula and canonical source through mirror, rendered
  textContent, clipboard, downloaded bytes and offline display. Manual fallback
  seeded a distinct sentinel, selected the full source, used native Linux
  Control+C and read back exact text including final newline.
- `OUTPUT_DIR=leetcode/239/tests/evidence/trace-repair-20261025/legacy node leetcode/239/tests/browser-check.js`
  — passed existing smoke checks (`legacy.txt`).
- `python3 -B leetcode/239/tests/test_solution.py` and
  `node leetcode/239/tests/test_core.js` — passed (`python.txt`, `core.txt`).
  Supplemental actual Python execution checked all 6,015 legal (array,k) cases
  for lengths 1–6 over {-1,0,1}, input preservation, fresh [4,1,3,2,5],k=3 →
  [4,3,5], [5,4,1],k=2 → [5,4], and n=100000 increasing/k=50000 against its
  closed-form result (`python-extra.txt`). Baseline visit counts were checked at
  n=4,k=4 (4), n=4,k=2 (6) and n=100000,k=50000 (2500050000).
- **`python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` — exit 0**
  with no diagnostic output (`preflight.txt`). This was the non-mutating
  preflight, never registration. Complexity remains exactly the single string
  `O(n) time; O(k) auxiliary space`; metadata required no repair.

Inspected `green/en-320-middle.png`, `green/zh-390-middle.png`,
`green/zh-zoom200.png` and `copy/zh-removals.png`: at i=3 the active indices are
1,2,3 with values [3,-1,-3], deque 1:3→2:-1→3:-3, cumulative output [3,3]; at
zoomed i=4 indices 2,3,4 and output [3,3,5] agree. Text wraps with separately
readable indices, values and removal reasons; focus outline remains visible.
The existing tokens, typography and layout were reused; no CSS was changed.

Harness scope notes: an initial exploratory run combined 320px with 200% CSS
zoom (160px effective width), hitting existing page overflow before saving the
membership report. The final regression fixes zoom coverage at the requested
1280px desktop scenario and retains unzoomed 320px coverage. It then ran red
before the runtime repair and green after it with identical assertions. An
initial copy-check harness waited on disabled Reset; the final harness checks
isEnabled first. These are harness corrections, not runtime repairs.

The Python language contract and saved official interface evidence were read:
Python and TypeScript are both listed as supported faithful interfaces; the
selected standard Python Solution.maxSlidingWindow interface needs no fallback.
The exact registration pair is solution.py / python-code.js / PYTHON_SOURCE.
Both files are unchanged and exact transfer was rechecked; no regeneration was
needed. `candidate-sha256.json` freezes lesson sources, tests, metadata and
shared policy identities for separate review; `served-sha256.json` confirms
preview asset bytes against these local files.

P0/highest-return and P1 scope match the BRIEF repair addendum; P2 has no
addition. Deferred layout redesign and suboperation animation need a separate
teaching requirement. Real devices, browser-toolbar zoom, public delivery,
LeetCode submission acceptance and novice comprehension remain unverified.
Separate independent re-review of this frozen candidate is the next step.
## Navigation repair author self-check — 2026-10-25 — 239-NAV-R1

This appendix records author evidence for a new candidate, not independent
acceptance or publication. Prior reports, acceptance and evidence remain historical.
Candidate identity and file hashes: `tests/evidence/navigation-repair-20261025/candidate-sha256.json`.

Finding mapping: **239-NAV-R1** replaces `../10/#step3` and its misleading “same
domination” label with `../84/#step1` / “#84 · Monotonic stack: settle rectangle
boundaries” / “#84 · 单调栈：确定矩形边界”; replaces `../42/#step1` and its prefix-summary
label with `../327/#step1` / “#327 · Prefix sums: subtract to obtain a range sum” /
“#327 · 前缀和：相减得到区间和”. Only the two anchors, their localized labels and the
copy asset cache version change in the runtime. Submission and embedded mirror
are unchanged and still byte-exact. `language-contract.json` already lists both
Python and TypeScript; lesson-local official selector evidence supports the
preferred faithful `Solution.maxSlidingWindow` Python interface. No metadata
repair or source regeneration was necessary.

Red/green: `OUTPUT_DIR=leetcode/239/tests/evidence/navigation-repair-20261025/red node
leetcode/239/tests/navigation-regression.js` reproduced the original rendered
Chinese label failure (exit 1; `red.txt`). After the repair, the same semantic
assertions pass (`green.txt`, `green/results.json`). The harness additionally waits
for shared smooth scrolling to settle and requires the focused link to be on
screen before taking screenshots. This tightened screenshot/viewport check does
not relax the original failure assertion. No hard algorithm bug was involved;
the defect was the authored label/target mismatch identified by the supplied report.

Browser evidence: Linux, Chromium version recorded in `green/results.json`,
preview `http://127.0.0.1:18770`, 320×900, zh → en → zh. Each link has the exact
reviewed visible label and href; Shift+Tab then Tab focuses it with the existing
outline, and Enter navigates to the exact lesson path and `#step1`. Both targets
are present as lesson links in the served collection. The destination checks read
the actual visible explanation: #84's increasing indices/nondecreasing-height
stack and excluded-boundary width `i−left−1`; #327's removal of the first i
elements from a prefix, yielding `P[j]−P[i]`. Thus the check verifies the concept,
not merely an existing fragment. Inspected the EN and Chinese focused-link and
destination screenshots: the English labels wrap fully, the Chinese labels fit,
focus remains visible, and the destination explains the promised mechanism.
No page errors or HTTP error responses were observed.

Preserved regressions (all run from repository root; each browser command used
`OUTPUT_DIR=leetcode/239/tests/evidence/navigation-repair-20261025/<directory>`):

- `node leetcode/239/tests/navigation-regression.js` → passed (`green/`).
- `node leetcode/239/tests/rendered-membership.js` → 242 frame checks passed
  (`frames/`), covering initial/partial/full intervals, deque identity/value,
  cumulative outputs, all presets, bilingual switches, rewind/replay and zoom.
- `node leetcode/239/tests/title-regression.js` → passed (`title-source/`), with
  exact localized numbered H1, official URL, preserved state, formula, prediction
  invalidation, exact rendered/mirror/offline/download source, automatic clipboard
  and native Linux Control+C fallback from a distinct sentinel.
- `node leetcode/239/tests/trace-copy-check.js` → passed (`copy/`), including
  duplicate-key detection, two-string locale pairs, localized removal reasons,
  scope labels, cost boundaries, prediction and unavailable storage.
- `node leetcode/239/tests/browser-check.js` → passed (`legacy/`).
- `python3 -B leetcode/239/tests/test_solution.py` → solution/oracle checks passed;
  actual canonical Python executes against direct window scans.
- `node leetcode/239/tests/test_core.js` → trace invariants passed.
- `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only` → exit 0,
  no stdout/stderr. Complexity remains the single nonempty string
  `O(n) time; O(k) auxiliary space`. Preflight output and explicit exit result are
  recorded in `preflight.txt`; no registration was run.

Limits: these checks use the local served collection and browser, not a public
deployment, real mobile device, learner study or LeetCode submission. A separate
reviewer must assess the frozen candidate and explicitly close 239-NAV-R1. Normal
publication remains pending; this self-check does not grant acceptance.
