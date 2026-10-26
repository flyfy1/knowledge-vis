# #964 author brief — Least Operators to Express Number

Status: author implementation, self-check planned; independent review pending. No acceptance, submission or publication claimed. Scope only leetcode/964/. Reuse verdict: approved bilingual lesson contract from specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; website-design skill applied. Category computing (LeetCode collection), stage university. Reader knows Python loops, arithmetic, min; introduce base digits and dynamic programming locally. Job: reconstruct a minimum-operator algorithm, not just obtain a number.

Official source: https://leetcode.com/problems/least-operators-to-express-number/ accessed 2026-10-26. Public GraphQL capture provenance/official.json verifies full statement, all examples and actual Python3 selector snippet: Solution.leastOpsExpressTarget(self, x: int, target: int) -> int. Python selected. x 2..100; target 1..200000000. Only repeated x, binary + - * /, rational division, normal precedence, no parentheses and no unary minus. Examples (3,19)=5, (5,501)=8, (100,100000000)=3. No inaccessible content or language exception.

## Learning loop and five-field step contract
|Step|Already known|Single question|Input → desired quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|1|Arithmetic operators|How can four 3s make 8?|x=3,target=8 → operator count|Switch 7/8/9; see literal expression and count, including cheaper overshoot|No parentheses/unary minus; ordinary precedence|
|2|Terms and counts|Why keep both sides of a power?|Same 8 → direct and subtractive costs|Read exhaustive-string baseline and concrete 5 vs3 counterexample|Powers abbreviate repeated x only, not new allowed syntax|
|3|Base digits, charged term cost|What survives after one digit?|Presets → positive/complement costs|Advance complete digit, ledger accumulates old/new candidates; rewind/reset/end|Simulation, not Python execution; no skipped digits|
|4|Two-state invariant|Which expression wins for a fresh input?|x=4,target=15 → minimum count|Predict 5/3/6, reveal explanation, change clears; locale preserves|Exercise independent of worked traces|
|5|Invariant|How does this become Python?|Canonical source → executable method and costs|Source copy/fallback/download; mapping and boundaries|O(1+log_x target) iterations and O(1) auxiliary integer cells; trace keeps O(1+log_x target) rows|

First-use dependencies: step1 operator (one binary symbol), term (multiplication/division chain); step2 power (repeated multiplication), charged cost (term internals plus one joining sign), digit (remainder after dividing by x), complement (next power minus residue); step3 locally redefine k,r,p,n,S and charged cost, state invariant and all four transitions; step4 locally restate charge convention and invariant; step5 locally define variables and O notation. Learning limitations bilingual beside simulation and code. No workflow status in UI.

Invariant: after digits 0..k, p is least charged signed-power cost of S (processed low value), n of x^(k+1)-S, both restricted to powers 0..k. At next digit r, either reuse S or replace it with x^k minus its complement. Each gives one candidate for each new state; both states required. Zero power cost2 (x/x + join); positive kth power cost k. Final leading join removed once. Fractional powers normalize away for integer targets; x copies carry upward at no greater cost, opposite signs cancel, leaving only zero/one carry to the next digit. Ledger stores all candidates and immutable prior states. Endpoint compares p with n+D, with D cost of the final carry. No invented negative starting expression: signed terms are reordered to start positive.

Tokens exactly inherited from ../style.css: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93; explanatory ink #c9d4e2 and alternate section #0a0e14. Shared system font, 1.75 line height, clamp headings, 8/12/16/20/24/64px spacing, 8/14px radius. Local controls48px, disabled opacity1, 3px accent2 focus offset4px; no new palette, motion or shadows.

State matrix both locales: hand presets; trace initial/intermediate/terminal, back/forward/reset/end/preset; prediction empty/selected/correct/wrong/change; source copy success/manual fallback; storage unavailable. Static page has no auth/loading/reconnect. Language changes preserve all state and focus. P0/highest-return20%: causal cost ledger, bilingual state correctness, code parity and oracle/browser evidence. P1: deep links and proof of normalization. P2 none. Deferred arbitrary expression editor/universal renderer/autoplay (unneeded complexity). Shared map/registry changes excluded by ownership.

Validation: actual Python vs independent nearest-power recursion, exact rational expression enumeration, exhaustive small + seeded large + boundaries; JS each intermediate state vs signed-power DP; browser real preview both locales all presets/endpoints/reversal/prediction options/copy paths/source parity, keyboard, guarded storage, local assets, 320/390/736/1440 and 200% zoom, measured contrast. Tests accept EVIDENCE_DIR. Screenshots visually inspected. Required root validate-only metadata preflight; freeze manifest after fixes. These are author self-checks, not separate review or actual learner evidence.

## Final author record and frozen review scope
Author implementation and self-check complete; independent reviewer/run/report pending. See tests/evidence/SELF-CHECK.md, numerical.json, browser.json and provenance/metadata-preflight.json. Candidate manifest records exact files. No registry, shared map, other lessons or service was modified. Concept-map integration is left to the separately authorized registration workflow; metadata anchors step2/step3 are present.

Frozen six-dimension interpretation: (15) reconstruct legal expression and operator units; (20) explain exhaustive baseline versus reuse and overshoot counterexample; (20) justify restricted-power p/n invariant, all four candidates, first digit and final join; (20) preserve ledger causes and reverse/predict state; (15) map divmod/simultaneous update/final carry to canonical Python and boundary-safe costs; (10) bilingual equivalence and tested device/focus/source states. Standard threshold85, every dimension≥3 and no required findings; no score assigned by author.

Author checks passed: 12,005 oracle cases,199 exhaustive expression optima,3,636 intermediate costs; real browser both locales/all presets/16 geometry combinations; source/clipboard/download parity; minimum measured text contrast7.744:1, total CSS11,196 bytes. Root preflight `python3 -B scripts/register_leetcode_lesson.py 964 --validate-only` passed exit0. Fresh independent review is the next stage, with no acceptance implied. Metadata cost includes constant work at target1. No post-review status change was made to runtime copy.

## 2026-10-26 prospective normalization candidate

The focused request `specs/reviews/964-review-normalization-request-20261026.md`
adopts `964-R1-A1` as **964-NORMALIZE-R1**. The original candidate
`b01fe1e86156906cbbbede74941146920dedfcd5` and independent acceptance at 92.5/100
remain historical evidence. This append supersedes earlier pending-review wording
only for describing that original history; the new revision awaits separate review.

Reuse verdict: keep the existing step3 proof binding, typography and tokens.
Reader/job: help the basic-Python reader reconstruct one fractional carry and its
charged cost. P0/highest-return slice: define `3^-1 = 1/3`, express it legally as
`3/3/3`, combine three such terms into `3/3`, and explain charged 9→2 in both
locales. P1: short causal sentences inside that binding. P2: none. The example
supports cost reduction and retains the existing general cancellation/carry,
processed-power invariant, four transitions and finalization argument. The
artificial leading join is removed once from the complete expression. No legal
expression example introduces parentheses or unary minus.

Deferred: `964-R1-A2` high-zoom ledger layout, as explicitly excluded by the
request; no closure claimed. No new design/layout/control is introduced, so the
adopted independent request check and existing design contract apply. Static text
adds no loading/network/auth/reconnect state. Algorithm and source bytes remain
unchanged. Only the proof pair and HTML copy-cache query change in runtime files.

Author checks and the frozen follow-up manifest are in
`tests/evidence/normalization-r1/`; the appended self-check maps the stable IDs.
The metadata string already satisfies the gate; root validate-only returned exit0.
No metadata repair, registration, acceptance update, commit or publication occurs.
A fresh separate reviewer must cold-read the proof, verify its cost conventions,
and close 964-NORMALIZE-R1 / selected 964-R1-A1 against the new manifest.
