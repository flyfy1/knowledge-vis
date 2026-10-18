# #214 · Shortest Palindrome — author brief

Reuse verdict: extend the existing collection for readers who know Python loops and
strings. Smallest outcome: derive the minimum prepend from a longest palindromic
prefix, explain KMP fallback, and implement the official Python callable.
Category computing / collection leetcode; stage university.
Contract: WORKFLOW.md, UI-I18N-SPEC.md, specs/leetcode-explainers.md,
specs/leetcode-hard-traces.md, specs/leetcode-review-gates.md and the approved
specs/reviews/leetcode-all-hard-design-review.md with dispatcher adjudication.
The website-design skill is applied to this reused pattern; no new product/layout
review is claimed. Independent per-lesson teaching review remains pending.

## Official contract
Verified 2026-10-18 via public official GraphQL; complete response and actual
language snippets in tests/evidence/official.json. Exact source:
https://leetcode.com/problems/shortest-palindrome/ . Free, Hard. Given lowercase
English string s, length 0..50,000, return the shortest palindrome formed only by
prepending characters. Official examples aacecaaa -> aaacecaaa, abcd -> dcbabcd.
Python3 selector gives class Solution: shortestPalindrome(self, s: str) -> str.
Choose faithful Python; no mutation/output ordering exceptions. Empty input returns
empty. '#' is safe only because input is lowercase English letters.

## Learning loop and five fields per step
|Step|Known|Single question|Input → wanted|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|String reversal|Which part can stay in the middle?|abac → shortest prepend|Read c + aba + c and descending-prefix baseline|Only additions at front; no deletion|
|1|Palindrome and prefix|How can equality find a palindromic prefix?|s#reverse(s) → longest equal prefix/suffix length|Compare aba at both ends of abac#caba|Unique separator; equal lengths ≤ n|
|2|Border definition|How do we avoid rechecking known characters?|t, pi, current i,j → next pi cell|Advance/rewind abac; switch to abab to watch fallback 2→0; ledger retains every comparison|Tiny complete simulation, no skipped events|
|3|Fallback chain|What remains after a mismatch?|Fresh aabaaa, i=5,j=2 → pi[5]|Predict 0/2/3, reveal causal fallback, change clears answer|Independent exercise, unaffected by lab reset|
|4|Longest palindromic prefix|Why is the code minimal and linear?|ell, suffix → output and costs|Inspect/copy/download exact canonical Python|Proof uses prepend-only rule; maximum tests outside browser|

## Terms, first appearances and dependencies
- Step0 palindrome: reads the same both ways; prefix: starts at position zero;
  suffix: ends at the last position; n: input length. No prior algorithm terms.
- Step1 border: a proper prefix equal to a suffix of the same string; proper
  means shorter than that string. t: s + '#' + reversed s; ell: final border length.
- Step2 pi[i]: longest border length for t[0..i]; i: zero-based new position;
  j: candidate matched length, comparing t[i] to t[j]. KMP is the name of this
  prefix-function computation. All terms are redefined near each section.
- Step3 repeats pi, border and candidate meanings locally for jump-in readers.
- Step4 repeats pi, ell and submission interface; links to existing palindrome
  and retained-state lessons with actual anchors. Metadata carries local concept
  entries; author ownership forbids editing the shared concept map.

## Exact token and UI contract
Inherit ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Use the exact variables.
Shared system font stack and 1.75 body line height, title clamp(28px,5vw,46px),
section heading clamp(23px,3.5vw,32px), controls 8px radius, stages 14px.
Local control min-height/min-width 48px; disabled opacity 1 with muted text.
Focus 3px accent2 / 4px offset; selected primary accent on bg. Spacing from
shared 8/12/16/20/24/32/64px scale, content max 952px. No shadows or motion.
Finite horizontal string cells wrap into fixed 64px columns rather than shrink.
No fonts/assets outside origin. Shared + local CSS below 25,000 bytes.

## State and simulation contract
Normal initial/fallback/commit/final states in EN and zh. Initial pi[0]=0, others
unknown; fallback keeps pi[i] unknown. Commit ends processing position i. All
previous completed cells and comparison history remain visible. No skipped events.
Preset change resets only lab and is explicitly labeled; reset restores event 0;
locale preserves all state/focus/disclosure/prediction. Empty string yields t='#'
and is already final. No loading/reconnect states: no runtime fetches.
Clipboard success/denial/manual selection and unavailable storage are tested.
Simulation is JS, not execution of Python. Full deep snapshots are a teaching
cost; official solution stores a linear pi array, not the whole history.

## Priorities and verification boundary
Highest-return 20%: concrete prepend proof, border correspondence, actual fallback
values and retained pi table, fresh prediction, exact executable Python.
P0: bilingual complete lesson, accessible controls, independent brute-force oracle,
intermediate border invariants, exhaustive/seeded/max tests, real browser paths,
source parity, responsive geometry and measured contrast, safe metadata preflight.
P1: inspect fallback at both widths/languages; offline and denied-storage checks.
P2: none. Deferred: animation, editable arbitrary large traces, universal renderer,
service runtime, registry/deployment (scope and no demonstrated learner need).
Self-check evidence is not independent acceptance, LeetCode acceptance or actual
novice learning. Real phones and production delivery remain unverified.
