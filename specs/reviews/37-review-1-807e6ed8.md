# Independent review: 37 Sudoku Solver

Candidate: `1b54881e0f4731ceddcf383f288620d55781fe9a`; URL: http://127.0.0.1:18770/leetcode/37/. Date: 2026-10-18. Reviewer: this independent review run; model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Canonical interpretation frozen before walkthrough: faithful Python, in-place official interface. No publication or submission claim.

## Cold browser walkthrough (saved before repository source/tests/previous reviews)

Only the frozen rubric was read before opening the candidate in Chromium through Playwright. Desktop 1280×900. Screenshots: `37-evidence/37-review-1-807e6ed8/cold-desktop.png`, `cold-undo.png`; the undo screenshot was opened and inspected.

| Teaching step | Question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|---|
| 01 problem/hand calculation | What is input/output; what can fill (0,2)? | Read definition and compute exclusions | Fixed 9×9 character board, unique solution, mutate input; row 5,3,7, column 8, box adds 6,9; candidates 1,2,4 | Each of three constraints excludes digits; local permission is weaker than eventual completion. |
| 01 baseline | What work repeats? | Read displayed baseline | Row/column/box scanned on each candidate; recursion and restoration visible | Sets can retain membership facts rather than scan the board each time; search still branches. |
| 02 derivation/invariant | Why can an empty candidate branch be abandoned? | Read explanation and variable legend | pos indexes fixed empty list; three sets must match current board; no candidates returns to caller | No legal extension exists here, so explore a different earlier choice after restoring all four states. |
| 03 candidate calculation | Does the view match hand arithmetic? | Next to event 1 | (0,2), pos 0, candidates [1,2,4]; row [3,5,7], column [8], box [3,5,6,8,9] | Union of exclusions explains exactly the remaining choices. |
| 03 placement | What changes when 1 is tried? | Next to event 2; expand previous state, Python excerpt, recent history | Dot becomes 1; all three used sets gain 1; previous board retains dot; excerpt assigns cell and adds to sets; history includes initial/candidate/try | Board and constraint cache move together; cyan marks focus rather than a different digit value. |
| 03 recursion | What depends on that choice? | Next to events 3 and 4 | (0,3), pos 1 has candidates [2,6], then takes 2 | Next cell sees constraints including the earlier tentative 1. |
| 03 undo | What happens after failure? | Step until event 12 | “Undo 9”; (0,7) becomes dot and displayed row/column/box sets exclude 9 | Reversing the tentative move restores the assumptions for the next branch. |
| 03 endpoint | Is the long trace complete? | Slide to 180 | Explicit notice: 12574 operations, intermediate events omitted, final solved board shown | Endpoint is a disclosed jump, not evidence that only 180 operations solved the puzzle. |
| 03 tiny boundary | Will the one-cell preset fill its missing digit? | Before reveal predicted sole missing digit; select preset 1, see missing (0,0), independently calculate 5; step through 3 events | Candidate/placement/solved; 5 fills (0,0) | With a single legal choice there is no alternative branch to explore. |
| 04 prediction | What must undo restore? | Before reveal predicted cell plus three sets; select third answer and check | Correct; feedback explains same starting assumptions | Undoing only the cell would leave stale constraints and incorrectly reject future candidates. |
| 05 transfer/cost | How does placement become Python? | Expand full solution and operation excerpt | Official solveSudoku method, sets/add/remove, search(pos+1), O(9^E) time/O(E) space claim | Assignment and three add calls implement the observed placement; recursion depth tracks empties; cached membership changes constant factors. |
| Bilingual | Does language switching preserve the experiment and reasoning? | Switch to Chinese at one-cell endpoint after quiz reveal | Event 3/3, solved board and selected/revealed answer retained; translated invariant, omission explanation, cost and boundaries | The same state and causal explanation are available in Chinese. |

Cold-reader friction: sets, membership, and set add/remove are introduced by purpose but not worked from elementary Python lists; no tiny full branch with concrete dead-end values precedes abstraction. The quiz closely restates the restoration explanation rather than asking for a newly computed outcome. These observations will be scored independently of author claims.

Independent custom-input predictions, recorded before source audit/execution: construct solved rows `123456789 / 456789123 / 789123456 / 234567891 / 567891234 / 891234567 / 345678912 / 678912345 / 912345678`; erase (0,0),(0,1). Predict restoration to 1,2 with original board/list identities preserved and return None. Counterexample to “any locally legal digit is final”: in the official board, (0,2)=1 is locally legal but cannot extend to a solution (unique completed board has 4 there). Predict a search forced to retain 1 will fail, while normal search restores and reaches 4. UI has presets only: these will be labeled code checks.

## Post-cold audit

Outcome: **changes_required**, weighted score **72.5/100**. Required open IDs: **37-R01, 37-R02, 37-R03, 37-R04**.

### Source, official contract, execution and test audit

HEAD equals the requested revision. Git status after execution showed only this report and its new evidence directory. Served bytes exactly matched checkout bytes for index.html, copy.js, app.js, python-code.js, solution.py, shared core.js/lesson.js/style.css, common.js and parent style.css. Identity hashes (SHA-256):

- Canonical solution.py: `1622419da75bb376bdc43615dc82014d1eae0c830e9003a955a5724c2d7b1afb`.
- index.html: `4254f53b184be668a9997631dd55f931a6ad00902e2577b802706e0fd7a1d540`.
- copy.js: `835a2f225650531684255597d61b8aaf23dbda524c711bcbb6c9d845850b0298`.
- Shared core.js: `342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed`.
- Shared lesson.js: `18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731`.

Read the [official statement](https://leetcode.com/problems/sudoku-solver/) normally through the web tool: nine rows/columns, digit or dot, unique solution, row/column/box rules agree. Canonical `Solution.solveSudoku(self, board: List[List[str]]) -> None` mutates supplied rows and has implicit None return; it is a faithful Python interface. No non-Python contract/analogy exception applies. Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: required Python pair is solution.py / python-code.js, export PYTHON_SOURCE. The mirror decoded exactly to canonical UTF-8 source. In Chromium, embedded constant, displayed code, successful clipboard text and actual browser download all exactly equaled that source, including whitespace/newline. Clipboard denial exposed the source textarea, focused it, and allowed selection of all 1,294 characters. Inspected `copy-fallback-field.png`.

Executed the actual canonical source with compile/exec (no transformed solver). Independently chosen two-hole board restored 1,2 as predicted, returned None, and retained the outer board and every row identity. All 81 single-cell holes in the independent solved board restored correctly; already-solved input remained unchanged and returned None. An independent row/column/box scanning oracle failed with official (0,2) forced to 1 and solved the unforced official puzzle with (0,2)=4; canonical Python exactly matched its final board. These are **code checks**, not custom UI input experiments.

A Python trace checked all **4,209 recursive entries** on the official input: every row/column/box set equaled the board projection; partial rows had no duplicate digit; all givens remained unchanged. At the visible event-2 transition, assignment at solution.py line 28 and the following three add calls account for the changed cell/sets; lines 34–37 reverse them on failure. `search(pos+1)` advances through precomputed empties; terminal pos==len(empty) establishes completion. No candidate returns False to its caller, exhaustive legal choices establish completeness under the guaranteed valid unique input. The JS core precomputes candidates, while Python loops through all nine and skips conflicts: these give the same ordered legal choices for the maintained invariant. Trace snapshots are clones; rewind restores snapshots rather than running inverse Python.

Independently inspected event 11: row 0 is `53127489.`, next cell (0,8) has candidates []; row lacks 6 but column already contains 6, so no legal digit exists. Event 12 restores (0,7) from 9 to dot; row/column/box lose 9. This is a concrete counterexample to committing every locally legal placement. See `undo-state-code.png` for the Python undo excerpt and retained history. Its eventual first-choice-1 failure was independently verified by the scan oracle, rather than inferred from the truncated UI.

The time claim is sound as a conservative E-parameter search-tree bound: at most nine children per empty-cell level; fixed-width membership/updates per branch; geometric node sum O(9^E). Empty coordinates and call depth are O(E); 27 constraint sets hold fixed-board digits. The visualization's stored boards/history are additional teaching storage, not part of the submitted algorithm's cost. E=0 still initializes the fixed 81-cell board. The lesson states costs correctly but does not teach the tree-bound derivation explicitly.

Inspected these tests **before running**: leetcode/tests/test_hard_solutions.py, test_hard_core.cjs, test_hard_browser.cjs. Python/core tests have no result-writing paths; ran `python3 -B leetcode/tests/test_hard_solutions.py` and `node leetcode/tests/test_hard_core.cjs`. Results: 41,016 aggregate Python checks; 102,757 aggregate JavaScript checks, both exit 0. These totals cover ten lessons, not Sudoku alone. Sudoku-specific author tests cover three presets, twelve seeded removals, givens, solved rows/columns/boxes, displayed set consistency, and snapshot immutability. Random removals need not preserve uniqueness; validation checks valid completion rather than uniqueness. Exhaustive coverage elsewhere in the aggregate suite must not be interpreted as exhaustive Sudoku testing. Did not run author screenshot generation or browser suite: used independent lesson-only Chromium checks with output solely in this run's directory. No author assets/evidence were regenerated.

Safe mandatory preflight, run at repository root:

```
python3 -B scripts/register_leetcode_lesson.py 37 --validate-only
```

Exit **2**: `Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/37/lesson-entry.json'`. There is no complexity field to validate in that missing file. No repair or registration was attempted.

### Interaction, accessibility and device observations

Both locales: all three presets exercised at initial, next, rewind, replay, final, previous-from-final and reset; snapshot equality held after reversals/replay, final result visible and Next disabled. Already-solved preset terminates without changing board; one-cell preset has exactly three displayed transitions. Switching language retained preset/index/frame and selected/revealed quiz state; toggle retained focus. Every answer was selected and revealed in both languages; changing an answer hid stale feedback. Wrong answers explained stale set occupancy or unfilled cells. Range ArrowRight advanced; Next Enter and Previous Space operated correctly. Expanded previous state, Python excerpt, history and full solution in the cold walk; state and explanatory translations agree.

Captured EN/ZH at 320,390,1280 widths, both undo and initial disabled controls. Page scrollWidth equaled viewport width for all six combinations, board widths 258/328/396px. Board digits and 3×3 boundaries remained visible; orange givens and cyan focus were distinct. However, the state-label/value collision below is a required defect even with no global overflow. Inspected desktop, mobile and zoom screenshots directly, including cold-undo.png, en-320-disabled.png, zh-320-disabled.png, en-390-undo.png, zh-390-undo.png, zh-1280-undo.png, both zoom200 images, undo-state-code.png, state-overlap-320.png, and copy-fallback-field.png.

200% magnification: applied document CSS zoom=2 at 1280×900 in each language, inspected screenshots, and observed no horizontal page overflow; the enlarged board requires vertical scrolling. This is a CSS magnification/reflow check, **not a native browser-menu zoom measurement**. No claim of native zoom equivalence. Native-menu zoom remains a limitation of this run.

Computed foreground/background contrast from actual CSS colors: body text on panel 14.70:1; muted 7.08:1; orange givens 9.81:1; text on active-cell fill 8.17:1. Disabled Previous blends through opacity .4 to about 3.30:1, visibly dimmer but decipherable in inspected captures; this is not a claim of a 4.5:1 disabled-text pass. Keyboard focus has a visible orange outline. No page errors occurred during independent browser checks. Did not perform screen-reader or human learner testing.

### Required findings

All findings concern problem 37, candidate `1b54881e0f4731ceddcf383f288620d55781fe9a`; fix revision and reviewer recheck are pending. Owner/next action: lesson author; provide a new frozen candidate and regression evidence. Status of every R finding: **open**.

**37-R01 — Missing mandatory lesson metadata (high, required).** Locale/viewport/input: independent of UI. Reproduce by running the exact validate-only command above from repo root. Expected: lesson-entry.json with a single nonempty complexity string covering time and space and successful non-mutating validation. Actual: file missing, exit 2. Violates frozen metadata readiness/acceptance gate. Next action: supply valid lesson metadata and rerun preflight on a new candidate; do not mutate this review candidate.

**37-R02 — Missing gradual worked derivation for the stated reader (high, required).** EN/ZH, desktop or mobile, steps 01→02 before operating the official preset. Expected: a vivid tiny hand-worked case leading through a concrete choice, future exclusion, dead end and restoration before generalized state, with new set operations and box numbering explained. Actual: step 01 gives only one candidate subtraction from the full official puzzle and a dense recursive baseline; step 02 immediately introduces arrays of sets and `b=(r//3)*3+c//3`. A novice must infer what a set/add/remove does and why the formula numbers boxes; the full branching mechanism must be reconstructed later by manually discovering the trace. Event 12 is useful evidence, but the hand-worked teaching sequence never walks that causal chain before abstraction. Evidence: cold table, cold-desktop.png; rendered bilingual derive/proof text. Violates depth/gradual-complexity/new-term requirements and causal derivation dimension. Next action: add a short visible worked branch with actual before/after values, explain set membership/update and box-index arithmetic, then generalize.

**37-R03 — Exercise tests recall rather than transfer (medium, required).** EN/ZH, any viewport, step 04, no preset dependence. Reproduce by reading step 02/03 then answering the quiz. Expected: independently compute or predict a new state/boundary from concrete givens/constraints. Actual: the question supplies “next empty cell has no candidates” and asks which restoration rule to repeat; the correct option repeats the immediately preceding instruction to clear the cell and all three sets. The digit 4 adds no new reasoning. All answer feedback works, but neither a fresh candidate calculation nor a new consequence of stale state is tested. Violates explicit transfer-versus-recall requirement. Next action: present a small unseen configuration and ask for a candidate, resulting state, or consequence before revealing a concrete calculation.

**37-R04 — Essential state label collides with its value on mobile (medium, required).** EN and the shared untranslated variable labels in ZH; widths 320/390, official preset event 12. Reproduce: select official puzzle, slide to 12, scroll to Algorithm state. Expected: separately readable `candidates_at_entry` and `["9"]`. Actual: dt text extends to x=179.72 while dd begins x=126.33 at 320px, or x=149.66 at 390px; glyphs overlap on the same line. `.state-grid` constrains columns but does not wrap dt. Evidence: state-overlap-320.png, state-overlap-390.png, zh-state-overlap-320.png, undo-state-code.png. The earlier no-page-overflow checks passed despite this collision. Violates readable essential state and device-access requirements. Next action: wrap long labels or stack key/value rows; recheck both languages and all intermediate states at 320/390 and magnification.

### Earlier findings and closure

After saving the cold walk, inspected specs/reviews/leetcode-first-ten-review.md. It explicitly identifies author self-review, not independent acceptance. No earlier individual 37 independent review report was present. The unnumbered historical “Sudoku board alone could hide incomplete undo” finding is tracked here as **37-HIST-01, closed for this candidate**: event-2 and event-12 visible row/column/box projections, author per-frame tests executed this run, and independently checked Python recursive-entry sets establish the correction. This does not close any new R finding or convert prior publication into review acceptance. Other generic historical claims are not independently recertified by this review.

### Scores and conclusion

| Dimension | Weight | Score (0–4) | Rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 3 | Correct official contract and {1,2,4} arithmetic; small hand calculation exists, but the worked board is not presented there and new implementation terms need scaffolding. |
| Causal derivation/saved work | 20 | 2 | Repeated scans versus cached membership is correctly stated; full concrete branch and set/box-number bridge before abstraction are missing (37-R02). |
| Maintained state/correctness | 20 | 4 | Invariant, restore-all reasoning and termination clear; visible states, 4,209 entry checks and independent oracle support correctness. |
| Interaction/visual meaning | 20 | 3 | Reliable reversible state/history, before/after and explicit omitted-event jump; prediction controls work, but exercise requires recall (37-R03). |
| Python/cost | 15 | 3 | Actual faithful Python executes correctly, preserves identity, exact export parity; cost correct, with only a terse bound and new set operations underexplained. |
| Bilingual/device | 10 | 2 | Causal translations equivalent, keyboard and widths operate, contrasts checked; essential state text overlaps on mobile (37-R04); native zoom unverified. |

Weighted total: 11.25 + 10 + 20 + 15 + 11.25 + 5 = **72.5/100**. Acceptance fails score threshold, two minimum-dimension gates, four required findings, and metadata preflight. Conclusion: **changes_required**. Numerical correctness and passing controls do not resolve the teaching/device gaps. This report establishes reviewer reconstruction and bounded computational/browser evidence, not real novice comprehension, a successful LeetCode submission, or publication approval.
