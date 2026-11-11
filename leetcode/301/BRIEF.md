# #301 Remove Invalid Parentheses — author brief

Product-fit verdict: build one problem-local lesson within the approved collection pattern. Audience: university algorithm learners. Category: computing; stage: university. Target: derive the minimum-removal two-pass recursive scan and implement Python `Solution.removeInvalidParentheses`.

## Learning loop
Start with `()())()` and manually count the one extra `)`. Compare the tempting “remove the first bad parenthesis” rule against both valid outputs. Derive two global budgets (`left_rem`, `right_rem`), then trace duplicate skipping and balance pruning. Prediction uses `((a)())` and requires the same invariant. Final code uses a two-pass recursive scan; the browser trace is a separate conceptual budgeted-search simulation and must say how its invariant corresponds to the source.

## Step contract
|Step|Already knows|Single question|Input → wanted quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|parentheses validity|How many removals are unavoidable?|`()())()` → 1 removal, two answers|hand ledger and official examples|letters ignored; validity means prefix balance nonnegative and final zero|
|1|removal budget|Why search only budgeted deletions?|`(a)())()` → left/right budgets|toggle candidate deletion; see valid prefixes|minimum deletion objective, input ≤25|
|2|DFS invariant|What state makes recursion complete and non-duplicate?|preset strings → path, balance, remaining budgets|step/back/reset and ledger|duplicate adjacent parentheses skipped; prune impossible budgets|
|3|invariant transfer|Which outputs survive for `((a)())`?|fresh prediction → answer set|choose before reveal, reveal, change clears feedback|all outputs unique, any order|
|4|implementation|How does source encode the proof?|trace → canonical Python|copy/download exact source and complexity|valid official Python interface|

## New terms
|Term|First use|Plain definition|
|---|---|---|
|balance|step 0|open parentheses minus closed ones in the current prefix|
|removal budget|step 1|exact number of left/right parentheses that must be deleted|
|branch|step 2|one choice to keep or delete the current character|
|pruning|step 2|stopping a branch that cannot produce a valid minimum answer|
|duplicate skipping|step 2|ignore the same deletion position when adjacent chars match|

Exact shared tokens from `../style.css`; local controls remain 48px. No external assets.

## Revision 2026-11-11

Review (review-range-1, B=0, G1): quiz explanation gave wrong prefix balances for `((a)())` (1,1,2,1,0,0); hand/derive said "second or fifth )" in `()())()`, which has four `)`; en derive dropped the left_rem/right_rem counting rule; the deletion budget was announced, not derived; the trace ran a budgeted keep/delete DFS while `solution.py` ran a different reverse-and-rescan algorithm; dead link to #39; duplicate "start" ledger row; headings numbered twice; learner-facing review status.

Changes: `solution.py` is now the budgeted keep/delete DFS the page derives (budget loop, delete-before-keep, two prunings, set for duplicates), so `core.js` follows it call for call and the "different control shape" disclaimer is gone; `python-code.js` regenerated. Step 2 now starts from the level-by-level deletion baseline, asks whether k is knowable before searching, shows a balance-walk experiment (forced `)` marked r+1, leftover opens = l), proves the lower bound and that it is achievable (so every shortest answer deletes exactly l `(` and r `)`), then shows the greedy pitfall that motivates search. Hand example names characters by position/index and shows that indices 3 and 4 give the same string. Quiz balances corrected to 1,2,2,1,2,1,0 in both languages; en/zh derive match. Ledger shows one start row, localized actions, and ↩ for backtracking. Link #39 → #282. Footer/verify text no longer shows workflow status. `lesson-entry.json` concepts/complexity updated (registry `problems.config.js` still says O(2^n); not edited).

Verified: new `tests/test_core.cjs` (trace = subset-enumeration oracle on all 9,840 strings over `()a` up to length 8; quoted walk, duplicate and quiz facts); `tests/test_solution.py` (oracle + random); scratch brute force on 12,840 strings, worst runtime 0.011 s on 20-paren inputs; `regression.js` (mapping assertion updated from `remove(` to `dfs(`, plus a check of the corrected balances) and `browser_check.js` on a local server; no console errors or overflow at 1280/390/320 in zh/en.

Changed by Claude Code (claude-opus-5-5), 2026-11-11, uncommitted working-tree change.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5); independent of the fixer, working tree only (not committed).
Checked: statement and limits from a public mirror (doocs: |s| ≤ 25, lowercase letters and parentheses, ≤ 20 parentheses, unique strings, any order). Own brute force (smallest k, all deletion subsets of parenthesis positions, set of valid results), written without reading the author's: 39,691 inputs = all strings over `()a` of length 1–9 (29,523) + all `()` strings of length 10–12 (7,168) + 3,000 seeded random over `()()ab`; returned list equals the brute-force set every time with no duplicate entries; official examples, `a`, `abc`, `(((` → `[""]` checked. Timing at max size (25 chars, 20 parentheses): worst of ~22,000 random/adversarial inputs 0.025 s; hill-climbed worst 0.071 s. solution.py, python-code.js (identical text), core.js `trace` (same delete-before-keep order, both prunings, set) and the copy (budget derivation, lower-bound/achievability argument, proof, complexity O(2^p·n)) describe the same algorithm; tests/test_core.cjs, tests/test_solution.py (run with the lesson dir on PYTHONPATH), regression.js and browser_check.js pass on port 18925; no overflow or console errors at 1280/390/320 zh/en.
Found: no errors. Registry `problems.config.js` still says O(2^n); it should read "O(2^p·n) time in the worst case (p ≤ 20 parentheses); O(n) recursion space plus output" (not edited here).
Changed: nothing besides this note.

## Integration 2026-11-11

Changed by Claude Code (claude-opus-5-5), the LeetCode integration step (see `specs/leetcode-review-2026-11-11.md`).

Registry and `lesson-entry.json` complexity now read "O(2^p·n) time in the worst case (p ≤ 20 parentheses); O(n) recursion space plus output"; concept rows in CONCEPT-MAP.md resynced from `lesson-entry.json` by the registration script.
