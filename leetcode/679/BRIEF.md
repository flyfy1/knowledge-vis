# #679 · 24 Game — author candidate

Product fit: reuse the approved five-section lesson, not a new layout or service.
Authority: specs/reviews/leetcode-all-hard-design-review.md and its dispatcher
adjudication; independent lesson review remains pending. Category computing;
stage university. Reader: knows arithmetic and Python lists, new to recursive
search. Outcome: reconstruct exhaustive pair reduction and justify completeness.
Learning loop: hand-compute → inspect failed child/return/sibling → preserve
card ownership → predict a fresh case → map to exact executable Python.

Official verification: 2026-10-25, https://leetcode.com/problems/24-game/ and
public GraphQL. Full observed response and all selector snippets are saved in
provenance/official.json. Python3 signature is Solution.judgePoint24(self,
cards: list[int]) -> bool. Four cards, each 1..9; real division; binary operators
only; no concatenation; use each card once. Official examples [4,1,8,7] true,
[1,2,1,2] false. No empty-array submission input. Python is preferred and supported.

## Step contract

|Step|Already known|Single question|Input → wanted|Action → visible observation|Validity|
|---|---|---|---|---|---|
|0|binary arithmetic|How do four cards become 24?|[4,1,8,7] → boolean|advance hand steps → two differences and product persist|each card exactly once|
|1|legal expressions|What must a correct baseline enumerate?|four cards → any legal expression|read five parenthesis shapes and fractional counterexample|real division, no division by zero|
|2|two values can become one|Why does pair reduction cover all expressions?|available subexpressions → 24?|step/back/reset/end, switch presets → disjoint card groups, rejected child, original parent and sibling|curated excerpts, omitted descendants explicitly labeled; not a full execution trace|
|3|card partition invariant|Can a negative intermediate still lead to 24?|[2,3,7,8] reduced to [-1,-1] → judgment|select then reveal, change answer → feedback clears|fresh exercise independent of trace|
|4|pair reduction and invariant|How does this become an exact submission?|official list → bool|show/copy/download exact Python|Fraction arithmetic, fixed four-card cost|

## First-use dependency table

Expression: numbers joined by binary arithmetic (step 0, repeated locally).
Baseline: a simple complete reference method (step 1).
Parenthesis shape: the grouping order of three binary operations (step 1).
State: current list of available subexpression values (step 2).
Child/parent: recursive call with one less value / its unchanged caller (step 2).
Invariant: property preserved at every call; disjoint groups partition the four
original card identities (step 2). Card letters A–D distinguish duplicate values.
Fraction: exact numerator/denominator value (step 1 and step 4).

## Design/state contract

Exact shared tokens from ../style.css: bg #0d1117, panel #161b22,
panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93.
No new colors, fonts, shadows or animation. System font, inherited heading scale,
1.75 body line height; inherited 8/14px radii, 952px content, 24px gutters;
12px mobile stage padding. Controls raised to 48px; disabled opacity restored.
3px orange focus with 4px offset. Text contrast measured in self-check.

State matrix × zh/en: hand 0..3; every trace preset start/middle/end, rejected
child and restored parent; prediction unselected/selected/revealed/changed;
copy success/denied with focused selected manual source; source open/closed.
Locale preserves all state and focus. Preset resets only its own trace, with
visible warning; reset restores initial frame. No network fetching, loading,
reconnect, timer, authentication, or empty user-input states are applicable.
Simulation: small exact rational browser model with curated branch ledger.
Search result is independently computed; omitted searches are never animated
as an ordinary pair operation. Canonical Python runs only in offline tests.

P0/highest-return 20%: concrete arithmetic, disjoint-card invariant, visible
return/sibling, bilingual controls, exact source parity and actual runtime tests.
P1: duplicate identities, fraction/zero boundaries and independent shape oracle.
P2: none. Deferred: free expression editor, automatic animation, universal
renderer, live Python execution (scope and runtime cost without teaching need).
No learner success, LeetCode acceptance, independent approval or release claimed.
