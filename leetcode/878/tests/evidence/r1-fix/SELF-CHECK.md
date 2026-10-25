# 878-r1-fix-v2 — author self-check

Date: 2026-10-26 Asia/Singapore. Author: Codex; exact model identity unavailable.
Status: ready for separate re-review, **not independently accepted**.
Historical report: specs/reviews/878-review-1-e7e2fb2d.md, candidate
6edbe661e03cd4d7a07f979a3f2269d54e5ac4a0, changes_required.
Working checkout base: 25ae6a90ae9d329bdcf0cfe98e64c78350aef879.
This uncommitted repair candidate is identified by candidate-sha256.json.

## Finding mapping

**878-R1 — fixed awaiting independent review.** The actual causal defect was
map0/map1/map2 containing preset labels where index.html consumes explanatory
bullets. Restore both translations in copy.js; bump only its asset query in
index.html. Preserve the approved layout, existing tokens, core, interactions,
canonical Python and metadata. BRIEF appends the repair scope.

The visible code transfer now uses one continuous n=4,a=2,b=3 example:

- Initialization maps lcm=6 and lo/hi=[1,8] to the actual canonical lines and
  explains why four multiples of 2 prove the upper bound.
- Failed count: mid4 gives 2+1−0=3<4; lo=mid+1 changes 1 to5, hi stays8;
  excluding every value through4 retains rank4.
- Sufficient count: mid6 gives 3+2−1=4; else/hi=mid changes 8 to6, lo stays5;
  retaining mid preserves the possible first crossing. Testing5 leaves [6,6],
  ends the loop and only then applies the return remainder.

Read both rendered translations against these hand calculations. The explanation
retains the plateau warning instead of implying count equality permits return.
The existing fresh n7/a3/b5 prediction exercise and earlier wrong-lcm example
remain intact. No algorithm repair or source regeneration was necessary.

## Red/green regression and commands

All commands below ran from the repository root. Each test used
`OUTPUT_DIR="$PWD/leetcode/878/tests/evidence/r1-fix"` to preserve v1 evidence.

| Command | Result |
| --- | --- |
| `node leetcode/878/tests/mapping.cjs` before copy repair | Exit1 on English map0 containing only the old input label; ../r1-mapping-red.log preserves the failure. |
| `node leetcode/878/tests/mapping.cjs` after repair | Exit0; rendered EN/zh mappings, both hand-calculated transitions, 1280/390/320 widths and 200% CSS magnification. mapping.log and mapping-result.json. |
| `python3 -B leetcode/878/tests/test_solution.py` | Exit0; actual official Python callable, 8,198 cases. solution.log and python-result.json. |
| `node leetcode/878/tests/test_core.cjs` | Exit0; 8,350 traces, 67,317 frames, 29,596 counts; exact decoded mirror and duplicate-key checks. core.log and core-result.json. |
| `node leetcode/878/tests/browser.cjs` | Exit0; all presets/frames, rewind/replay/reset/endpoints, formula and count terms, quiz feedback/change/locale state, source transfers, offline, accessibility and asset checks. browser.log and browser-result.json. |
| `node leetcode/878/tests/access.cjs` | Exit0; narrow selected-label fit, heading identity, keyboard/deep links, prediction and source-panel checks. access.log and access-result.json. |
| `python3 -B scripts/register_leetcode_lesson.py 878 --validate-only` | Exit0; stdout/stderr empty. Safe non-mutating preflight receipt: preflight.json. |
| `git diff --check` | Exit0. |

Browser: real headless Chromium156.0.8078.4 on Linux, supplied executable path.
The focused screenshot harness uses reduced motion and waits for the section's
settled navigation position; an initial capture during smooth scrolling was a
capture artifact, not a lesson failure. No assertion was weakened.

## Rendered-state and source preservation

The full browser suite covers both locales: complete formula; inclusive counts
at x=1,5,6,7,18; candidate/count/before/after labels and retained history at every
preset frame; reset/rewind; all quiz choices and cleared feedback after changing
choice; locale preservation. The quiz is explicitly fixed n7/a3/b5, independent
of the trace preset. There is no cumulative-sum widget; C(x) counts the distinct
prefix, not the number of animation frames. Asset diagnostics are empty.

Read the exact LANGUAGE_FILES entry in scripts/register_leetcode_lesson.py:
Python uses solution.py / python-code.js / PYTHON_SOURCE. The existing official
payload ../official.json includes the faithful Python3 Solution.nthMagicalNumber
interface (and TypeScript); canonical Python already follows the preference.
No non-Python language-contract or supportedLanguages override exists or is needed.
Metadata complexity remains one nonempty string covering operations and space.

The suite verifies untrimmed canonical equality for decoded mirror, rendered
textContent, downloaded bytes, automatic clipboard and each locale's native
fallback. Each fallback first writes and reads a distinct non-source sentinel,
then denies automatic writes, checks full selection/focus, uses Linux Control+C
and reads back exact source. Offline file opening uses the same embedded source.
The actual Python solution executes in test_solution.py; browser JS simulation
is not represented as Python execution. Preview byte receipts accompany hashes.

## Visual inspection and review boundary

Opened mapping-en-1280.png and mapping-zh-390.png, and the full bullet captures
mapping-bullets-{en,zh}-320.png and mapping-bullets-{en,zh}-zoom200.png.
Both translations preserve the same before/after values, branch causes and final
modulo. Full bullet text wraps within the existing section at narrow widths and
magnification, without clipping or text intersections. The test also checks page
overflow; visual inspection supplies the text-level evidence beyond that check.
No CSS, palette or shared assets changed. The unchanged browser accessibility
suite recalibrates and checks solid-color contrast and disabled/focus semantics.

No child agents, registration, commit, deployment or state/acceptance updates.
No physical-device, native browser-chrome zoom, novice-comprehension measurement,
LeetCode submission or public-delivery claim. Next action: separate reviewer
rechecks 878-R1 and affected step5/prerequisites against the hashed candidate.
