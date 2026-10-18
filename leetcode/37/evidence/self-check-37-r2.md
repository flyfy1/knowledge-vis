# Author self-check: Sudoku Solver repair candidate

2026-10-18. Candidate **37-r2-038072f42c08**, frozen lesson/test SHA-256 map
in [candidate-37-r2.json](candidate-37-r2.json). This is a new, uncommitted
content-addressed candidate. The prior candidate/review remain historical evidence.
This document appends fix evidence; it is not an independent review or closure.
Only `leetcode/37/` changed. No registration, commit, publication, services,
registry, campaign state, review report or rubric was changed.

| Stable finding | Fix and causal reason | Self-check evidence | Status / next action |
| --- | --- | --- | --- |
| 37-R01 | Add bilingual lesson-entry.json, official URL, concept anchors and one complexity string covering time/space. | Exact mandatory preflight below exits 0; metadata frozen in new candidate manifest. | Fixed awaiting independent review; reviewer reruns preflight. |
| 37-R02 | Before baseline/general state, show full official input and a two-cell branch: locally legal 9 makes next cell impossible because row needs 6 while column contains 6; restore cell/row/column/box, then return farther. Explain set membership/add/remove through the same column, list-of-sets representation, integer division and box numbering before general formula. Derive geometric search bound. | Canonical Python executed; 4,209 recursive-entry projection checks; branch arithmetic and actual JS events 9–14 agree. Inspected EN/ZH branch-detail and sets-and-boxes screenshots. | Fixed awaiting independent teaching walkthrough. |
| 37-R03 | Replace rule-recall quiz with unseen two-hole solved-board configuration. Compute row {3,5}, exclude 3 via column, allow 5 via box. Distractors test row-only checking and a false dead end; feedback explains stale cached 5. | Python verifies exact row/column/box input and {5}; solves case in place. Browser exercises all options, explicit reveal, clearing stale feedback, and locale/preset isolation in EN/ZH. Inspected both prediction screenshots. | Fixed awaiting independent transfer assessment. |
| 37-R04 | Lesson-local CSS wraps each state key inside its allocated grid column. This removes the cause (unbreakable text crossing into the value column). | Test disables ONLY the repair stylesheet: candidates_at_entry collision reproduces at 390px. Re-enabling passes. All 181 retained official frames pass geometry checks at 320/390/736/1440 in both languages and at 200% CSS magnification. Inspected EN 320/390, ZH 320 and both magnification screenshots. | Fixed awaiting reviewer device recheck; no independent closure claimed. |

## Commands and observed results

All run from `/home/songyy/projects/leetcode-hard-campaign-20261018`.

```
python3 -B leetcode/37/tests/regression.py
PASS: canonical Python, 3 presets + 81 single holes + fresh two-hole case;
4209 recursive-entry constraint checks; exact source mirror; branch/quiz arithmetic.

python3 -B leetcode/tests/test_hard_solutions.py
Python: 41016 oracle, identity, invariant, and maximum-size checks passed;
10 source bundles match.

node leetcode/tests/test_hard_core.cjs
JavaScript: 102757 oracle and intermediate-state checks passed, all ten models.

node leetcode/37/tests/browser.cjs
PASS: both locales, all official frames at four widths, CSS zoom,
presets/replay/reset, quiz/state persistence, keyboard, source parity/fallback,
file offline/denied storage; no page errors.

python3 -B scripts/register_leetcode_lesson.py 37 --validate-only
Exit 0; stdout/stderr empty. Validation only; no registration.

git diff --check
Exit 0; no whitespace errors.
```

The aggregate counts cover ten models, not exhaustive Sudoku inputs. The new
lesson-local Python test executes the unmodified canonical `Solution.solveSudoku`
with its faithful `List[List[str]] -> None` interface. It checks None return,
retained row identities, givens and expected final boards. No language fallback
is used: Python remains selected, with no language-contract.json required.
Read exact `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python pair
is solution.py / python-code.js, exported as PYTHON_SOURCE. Source is unchanged;
no mirror regeneration was needed. The source digest remains
`1622419da75bb376bdc43615dc82014d1eae0c830e9003a955a5724c2d7b1afb`.

Browser tests use installed Playwright via NODE_PATH and Chromium via
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. The submission runs as Python, while the
browser runs the existing JS trace. At both locales, tested all three presets,
initial/next/previous/replay/final/previous-from-final/reset and disabled endpoints;
all quiz choices; answer/reveal/trace persistence across locale switching; range
ArrowRight, Next Enter, Previous Space; displayed/embedded/clipboard/download
source byte parity; clipboard-denial manual-copy focus and selection; offline
file opening with denied storage. A follow-up run expanded CSS-magnification
checks from event 12 to all 181 retained official frames. No console page errors
or HTTP failures occurred. Machine results: [browser-results.json](browser-results.json).

Read-only HTTP checks found all 11 local/shared runtime assets byte-identical to
the checkout at the supplied preview origin. [asset-checks.json](asset-checks.json)
records those paths, 13,464 total loaded CSS bytes and calculated contrast:
text/panel 14.70:1, muted/panel 7.08:1, givens/panel 9.81:1, text/active 8.17:1.
No palette, focus, disabled, controller, solver, shared trace or shared CSS was changed.

Screenshots include both locales at 320/390/736/1440, both CSS-magnification undo
states, worked explanation, set/box derivation and prediction feedback. These
are synthetic Chromium checks. CSS zoom=2 is not native browser-menu zoom.
Native zoom, real devices, screen readers, human novice teach-back, LeetCode
submission and public delivery are unverified. Separate re-review must judge
teaching quality and close the four finding IDs against the frozen candidate.
