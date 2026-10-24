# Independent review: 420 Strong Password Checker

Candidate: `0e52f8ad6dfd5caf92e1b07dee370a2eecbaf55a`. URL: http://127.0.0.1:18770/leetcode/420/. Review run: `420-review-1-cc0e13de`; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. This is separate from publication.

## Cold walkthrough (saved before source inspection)

Read only the frozen rubric before opening the actual page in headless Chromium through Playwright. No brief, prior review, tests, or implementation was read. Interpretation frozen: faithful Python interface; evaluate six rubric dimensions and teaching depth, not test counts. Screenshots: `420-evidence/420-review-1-cc0e13de/cold-desktop.png` and `cold-operated.png`.

| Teaching step / question | Prediction and action | Visible result | Causal conclusion in my words |
|---|---|---|---|
| 01: Can one insertion fix length and a triple? | Before operating: inserting 0 inside aaa in aaaB1 should yield length six and no triple, answer 1. Read initial appended-x state, then selected internal insertion. | Initial aaaB1x still needs replacement; aa0aB1 reports all classes present and one edit finishes. | Independent obligations can share an edit; adding their lower bounds double-counts. Length needs at least one operation, and this construction attains it. |
| 02: How many replacements does a run require? | Read the seven-a hand construction; predicted L=8 still needs two replacements, then changed slider to 8. | Two underlined aaa groups and aa tail; R=2, construction aaBaa0aa. | Each disjoint triple must change, and changing every third character achieves that count. The remainder tail contributes nothing. The page defines runs, floor and missing classes through examples and explains short-length overlap before the long branch. |
| 03: Where do compulsory deletions go? | Before clicking: default lengths 3,4,5 have R=3 and D=4. Predicted cost-one saving, cost-two saving, then leftover one saving nothing: final 5. Applied all three allocations separately. | 3→2, R3→2, spent1/rem3; 4→2, R2→1, spent3/rem1; final leftover event spends1 without changing run cards, R1, answer5. Ledger retains earlier events. Undo restored allocation2; reset restored allocation0. | Buy the cheapest replacement reduction first. Displayed lengths are a demand ledger, not a repaired password; the explicit leftover explanation prevents reading unchanged cards as forgotten deletions. Equal-value savings with costs 1,2,3 support the exchange argument. |
| 04: Fresh transfer exercise | Before reveal calculated zzzz plus eight Qs plus (bC7)×4: R=3, D=4; saving twice costs at least 2+3=5, so answer6. Selected6 and revealed. | Correct; explanation explicitly compares 5- and 6-deletion routes and excludes answers4 and7. | Deletions and replacements overlap only when the budget crosses a run's next threshold. A remainder matters more than a long run's size. |
| 05: How does the ledger become Python? | Read displayed implementation and code map on the page, without opening files. Mapped the visible 4→2 allocation to use=min(remaining//2,mod1), subtracting one R and two remaining. | Page shows complete Solution.strongPasswordChecker, length branches, mod0/mod1 counters and O(n) time/O(1) space; distinguishes browser snapshot storage. | A scan counts demand and the first cheap opportunities. Three budget updates implement the allocation order without retaining run arrays. Immutable string is only inspected. |

Independent fresh inputs chosen before canonical execution: `aaA11` should need 1 insertion (e.g. aaA1b1); `aaaBBB1` should need 2 replacements, since two disjoint triples survive any single replacement. Counterexample to “always delete from longest”: independently chosen `aaaaaaBBB` + `cD2cD2cD2cD2` has n=21, R=3, D=1: either length-six or length-three run saves one (answer3); to make a strict counterexample use `aaaaaaaBBB` + `cD2cD2cD2cD` (n=21): deleting from seven-a saves zero, deleting BBB→BB saves one, answer3 rather than4. These custom strings cannot be entered in the preset-only UI; subsequent execution is a **code check**, not a UI experiment. Page's own strict counterexample uses the same 7/3 run structure with different tail characters. No custom-input UI claim is made.

The baseline DP is described in prose and offered in an expandable panel. Its expensive character enumeration is contrasted with the scan. The visible greedy proof is reconstructable, though the DP state-count formula assumes familiarity with DP and is denser than the preceding tiny examples.

## Source and post-cold audit

### Candidate identity and official contract

`git rev-parse HEAD` equals the requested revision. `git diff --exit-code` passed; the only untracked paths were this report and this run's evidence tree. Independently fetched lesson HTML, JS, Python and CSS bytes from the preview and compared them exactly with disk; all matched. Full hashes are in `reviewer-checks.json`. Canonical Python SHA-256: `305b8fab0b3391ee4558b5fc8019419d2c95bba6e6ad27c47506e93d007f5c4b`.

Read the [official statement](https://leetcode.com/problems/strong-password-checker/) through ordinary web access after saving the cold walkthrough. Its input, three strength rules, edit operations, 1–50 length bounds and allowed characters match the lesson. No access bypass or submission was attempted. The saved lesson-local `provenance/official.json` contains a Python3 snippet with `class Solution` and `strongPasswordChecker(self, password: str) -> int`, matching the canonical callable. This is faithful Python, not a conceptual analogy. Non-Python language-contract requirements and the exact-six JavaScript exception are inapplicable; no unsupported language substitution is advertised.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python resolves to `solution.py`, `python-code.js`, `PYTHON_SOURCE`. Inspected those actual files, `index.html`, `core.js`, `app.js`, `copy.js`, local CSS and shared locale/style behavior. The mirror encodes the exact canonical source including the trailing newline. Browser checks verified exact displayed text, successful clipboard text, denied-clipboard selected textarea text and downloaded bytes against that same file, in both locales. The HTML's optional baseline code exactly matches `tests/baseline.py` too.

### Algorithm and executable checks

The canonical code inspects ASCII ranges consistent with the constraints. Its outer scan has invariant: before `i`, all complete maximal runs are accounted for in replacements/mod0/mod1; `j` advances to the first different character or n, `length=j-i`, then `i=j`. Progress is strict and stops at n. Runs shorter than three contribute no demand. Class scans plus run scan take O(n) time, despite nested while loops, because the inner scans partition the string. Only fixed counters and generator state are retained: O(1) auxiliary space. There is no input mutation or run array.

For the long branch, each counted mod0 opportunity buys one replacement saving for one deletion; mod1 buys its first saving for two. After these, every affordable additional saving costs three. `min` caps both budget use and final demand reduction. This matches the visible cost-one and cost-two transitions; `remaining` and `replacements` evolve together. The final canonical branch does not subtract the last used budget from `remaining`, but it never reads it again, so it does not change the returned answer. The trace separately records neutral leftover spending rather than pretending to construct a password. For long inputs, maintaining representatives of existing character classes is feasible while reducing long runs and spending leftover deletions; missing classes can be supplied during replacements. Boundary branches avoid applying long-input logic to short strings. The stated browser O(n²) snapshot space is distinct from submission O(1), consistent with copied runs and retained histories per frame.

Executed the actual imported `Solution().strongPasswordChecker`, not just `PasswordCore`. The following 14 predictions were made from direct calculations and compared both with canonical execution and the inspected independent edit-distance baseline. All matched; original strings remained equal after calls. Custom cases are **code checks**, since the UI is preset-only.

| Input | Predicted / canonical / edit-distance baseline |
|---|---|
| `aaA11` | 1 / 1 / 1 |
| `aaaBBB1` | 2 / 2 / 2 |
| `aaaaaaaBBB` + `cD2cD2cD2cD` | 3 / 3 / 3 |
| `a` × 5 | 2 / 2 / 2 |
| `a` × 6 | 2 / 2 / 2 |
| `a` × 20 | 6 / 6 / 6 |
| `a` × 21 | 7 / 7 / 7 |
| `!` × 50 | 36 / 36 / 36 |
| `aA0.!` | 1 / 1 / 1 |
| `aA0.!b` | 0 / 0 / 0 |
| `aA0.!` × 4 | 0 / 0 / 0 |
| (`aA0.!` × 4) + `b` | 1 / 1 / 1 |
| `.` × 6 | 3 / 3 / 3 |
| (`abAB01` × 8) + `aB` | 30 / 30 / 30 |

For the strict longest-run counterexample, initial run demands are 2+1=3. The one required deletion at seven-a leaves floor(6/3)=2, whereas BBB→BB drops demand by one: the optimum is 1+2=3. For `aaaBBB1`, at least one character in each disjoint triple must change, and `aa0BBa1` attains two. For `aaA11`, inserting b gives `aaA1b1`, attaining the length lower bound. These checks cover transfer and excluded tempting rules independently of test totals.

### Test inspection, reruns and preflight

Before executing any test, read `tests/test_solution.py`, `tests/oracle.cpp`, `tests/baseline.py`, `tests/test_core.cjs`, `tests/browser.cjs` and the test README. The Python/C++ baseline enumerates edit states (input position, bounded output length, last character/run count and classes); it does not use the greedy run formula. Input symbols plus two representatives per class preserve match possibilities and allow avoiding adjacent equality. The separate allocation DP checks every legal deletion split. These are meaningful independent computations, though the supplied test harness itself remains author-written.

Ran from repository root, redirecting every generating harness via `OUTPUT_DIR="$PWD/specs/reviews/420-evidence/420-review-1-cc0e13de"`:

- `python3 -B leetcode/420/tests/test_solution.py` — exit 0; 1,263 canonical cases, 4,538 allocation checks, five displayed-baseline executions, source parity and 93 unique bilingual keys passed.
- `node leetcode/420/tests/test_core.cjs` — exit 0; 1,263 oracle cases and 1,956 snapshots passed, including budget, exhaustive allocation optimum and snapshot isolation.
- `node leetcode/420/tests/browser.cjs` — exit 0; browser interaction/parity/device checks passed. Reviewed the source before running and inspected screenshots afterward. Its output files retain the harness's “author self-check” labels; the independent judgments are recorded in this report.
- `python3 -B scripts/register_leetcode_lesson.py 420 --validate-only` — exit 0, no stdout. `lesson-entry.json` complexity is exactly the nonempty string `O(n) time; O(1) auxiliary space`. No registration or repair was performed.

The browser harness uses `NODE_PATH` and honors `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; independent browser calls did likewise. No candidate assets or author evidence were regenerated. The harness recaptured this run's `cold-desktop.png` at its initial state; the cold record was already saved before source inspection, and `cold-operated.png` remains the original operated cold capture. Earlier runs' evidence was untouched.

### Interaction, localization and visual inspection

Observed all seven presets in both languages, including a→5, aA1→3, already-strong→0, 21 a's→7 and 50 exclamation marks→36. Endpoint controls disable appropriately, undo reverses a frame, reset clears the ledger, and changing presets resets only that experiment. No-deletion presets correctly show answers immediately with disabled allocation controls. Locale switching retains preset, allocation state, hand choice, slider and prediction/reveal status. Resizing 320→390→1440 and CSS zoom 200% retained intermediate progress.

Independently exercised the 50-character preset with keyboard Enter on next: visible length 50→47, R16→15, D30, spent3, remaining27 in each locale. The pending message explicitly says R is not final. The prior English/Chinese state was restored exactly after switching away and back. ArrowLeft operated the focused run slider. Tested incorrect choices 4 and7, revealed the matching “Not yet” / “还不对” with the same causal answer, changed choice (which hid reasoning again), then selected6 and revealed “Correct” / “正确”. An initial reviewer assertion incorrectly expected input length 50 in the progress paragraph rather than the separate input paragraph; corrected that assertion to D30 and reran successfully. This was a check-script mistake, not a candidate defect.

The duplicate-key parser checks COPY before ordinary JSON overwrite can hide a duplicate; all 93 pairs are nonempty. Separately inspected Chinese/English reasoning, not just key presence: short-string attainability, run demand, remainder priority, invariant, neutral leftover event and fresh exercise agree. The rendered 50→47 event and pending message bind to the correct state in both languages; prediction mismatch feedback is distinct from clipboard failure text. Copy failure focuses/selects exact source with a localized manual-copy instruction. Success copy and download also preserve exact source.

Captured and visually inspected original cold desktop, `en-320-runs.png`, `zh-320-runs.png`, `en-390-runs.png`, `zh-1440-runs.png`, `en-390-controls-result.png`, `en-320-buttons.png`, `en-zoom200-runs.png`, `zh-zoom200-buttons.png`, `zh-fallback.png`, plus independent `reviewer-en-320-upper-intermediate.png`, `reviewer-zh-320-upper-intermediate.png`, `reviewer-en-zoom200-intermediate.png` and `reviewer-zh-320-exercise.png`. The labels and numeric before/after values wrap without text intersection or clipping. Long input strings wrap. At 320px the run cards stack, and long English controls wrap to two lines. At desktop they share a row. Disabled controls remain legible and distinct from the cyan enabled action. Sticky navigation is horizontally scrollable; viewport-edge partial navigation items and content above the scroll position are ordinary scrolling, not hidden algorithm state. No page-wide horizontal overflow was detected at 320/390/1440 or zoom2.

The rerun browser harness exercised keyboard reset, Tab/Shift+Tab and 3px visible focus; the independent checks also operated allocations/reveal with Enter and the slider with an arrow. Forced-color focus and reduced-motion checks passed. Computed text token contrasts against page/panel backgrounds range from 6.45:1 (muted on panel2, also disabled text) to 16.09:1; cyan enabled-button contrast is 13.10:1. No page errors, failed HTTP responses or external runtime requests occurred. Related lesson links and target anchors resolved in the harness. These checks establish observed access paths, not a complete assistive-technology audit.

## Findings and prior closure

No required open findings. After the cold record, searched review Markdown for this ID; only this report exists, so there are no earlier required IDs to close or inherit. No finding is marked closed on the strength of author claims.

| Stable ID | Severity/status | Concrete observation and expected improvement | Requirement / next action |
|---|---|---|---|
| 420-N01 | Minor, optional | At this revision, EN desktop step02: read the tiny run example, then baseline paragraphs. DP, class-mask state and the A² state-transition cost arrive compactly, without a tiny baseline state table. The greedy reasoning remains reconstructable from the preceding hand examples and cost comparisons. | Gradual complexity: optionally add one baseline transition and explain what the factor8 counts. No required causal bridge is missing from the greedy solution. Owner: lesson author; no fix revision or regression closure claimed. |
| 420-N02 | Minor, optional | Step05 both locales, displayed canonical code: `any`, generator expressions and boolean-to-int conversion are used without a small Python idiom explanation. The adjacent variable/code map still permits following the actual algorithm. | Transfer to basic Python: optionally annotate the three class tests with one explicit loop equivalent. Owner: lesson author; no fix revision or regression closure claimed. |

## Scores and conclusion

| Dimension (weight) | Score / 4 | Observation-based rationale |
|---|---|---|
| Problem/terms/hand calculation (15) | 4 | Rules, input/output units and allowed characters are explicit; a concrete insertion attains the visible one-edit lower bound before abstraction. |
| Derivation/saved work (20) | 3 | Disjoint triples, overlap, deletion thresholds, exchange reasoning and a strict longest-run counterexample explain included and excluded cases. Baseline state/cost exposition is comparatively dense (420-N01). |
| Maintained state/correctness (20) | 4 | Before/after run demand, budget and history support the optimum invariant; canonical scan and length branches agree with independent calculations and executable checks. |
| Interaction/visual meaning (20) | 4 | Predictions precede operation; allocations retain readable history, neutral budget is explicitly a ledger event, and rewind/reset/preset/reveal/change behaviors were observed. |
| Python/cost (15) | 3 | Faithful executable source, exact display/copy/download parity, fresh code checks, no mutation and linear/constant costs verified. Basic-reader idiom friction remains (420-N02). |
| Bilingual/device (10) | 4 | Equivalent state-bound explanations and feedback; readable dense states at narrow widths/zoom, visible keyboard focus and preserved state. |

Weighted total: `15 + 15 + 20 + 20 + 11.25 + 10 = 91.25/100`. All six dimensions are at least3; required open IDs: **none**. Outcome: **accepted** for the specified candidate and review scope, independently of publication.

Limitations: headless Chromium browser only; viewport emulation rather than physical phones; 200% enlargement used CSS zoom2 at 1280px, not a browser-chrome zoom control. No measured human comprehension, actual LeetCode submission, screen-reader certification or exhaustive platform compatibility is claimed. The official interface snippet was checked in saved lesson-local provenance; the live official statement was independently read. Neither test counts nor screenshots alone supply the teaching scores.

