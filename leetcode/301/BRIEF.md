# #301 Remove Invalid Parentheses — author brief

Product-fit verdict: build one problem-local lesson within the approved collection pattern. Audience: university algorithm learners. Category: computing; stage: university. Target: derive minimum-removal DFS and implement Python `Solution.removeInvalidParentheses`.

## Learning loop
Start with `()())()` and manually count the one extra `)`. Compare the tempting “remove the first bad parenthesis” rule against both valid outputs. Derive two global budgets (`left_rem`, `right_rem`), then trace duplicate skipping and balance pruning. Prediction uses `((a)())` and requires the same invariant. Final code maps every trace branch to Python; browser trace is a simulation, separate from execution.

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
