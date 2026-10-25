# #828 author brief — candidate r2

Status: author implementation and self-check run; independent per-problem review pending. No LeetCode submission, learner study or deployment claimed. Scope owns only this directory. Approved pattern: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; website-design skill read before implementation. Category computing / LeetCode; stage university. Reader knows Python loops, lists, dictionaries and multiplication.

Official contract verified 2026-10-26 via public official page and GraphQL; full content and language snippets in tests/evidence/official.json. Python3 class Solution.uniqueLetterString(self, s: str) -> int selected. Uppercase English letters, 1≤n≤100000; answer fits signed 32-bit; repeated positional substrings count; no modulus, no mutation, no empty official input. Examples ABC=10, ABA=8, LEETCODE=92. Chinese title is an authored translation.

Product verdict: reuse one lesson page with shared locale, navigation and tokens, local occurrence renderer. Learning loop: enumerate ABA → reject distinct-count shortcut → choose a single occurrence → count endpoints → prove bijection → predict ABACA → map to Python. Five sections justified by these five questions, rather than a forced data-structure story.

## Step contract (known; question; input/output; action/observation; conditions)
0. Knows a string; what does unique mean? ABA to six substring scores; select each substring and see singleton letters, reset selection; unique means frequency exactly one and positions distinguish repeats.
1. Knows six scores; can a baseline compute them? ABA to total 8; inspect baseline and compare ABA unique=1 against distinct=2; uppercase fixed alphabet, quadratic substring enumeration.
2. Knows frequency-one rule; when does one occurrence count? Same ABA plus presets to occurrence contributions; next settles one index, back restores ledger, presets explicitly restart; all nearest equal boundaries known in this teaching view, no omitted frames, zero-based indices and missing neighbors -1/n.
3. Knows endpoint restrictions; can the rule transfer? ABACA middle A (index 2) to its contribution only; select then reveal, change clears, reset; independent from trace, no derived answer before reveal.
4. Knows proof; how does code find boundaries and sum? Official Python plus exact source; source/copy/download and related anchors; uppercase fixed alphabet, O(n) time/O(n) auxiliary space, simulation snapshots separate.

## First-use dependencies
substring / contiguous positions: step0. unique / frequency exactly one: step0 and repeated locally. baseline / straightforward enumeration: step1. occurrence / one indexed letter: step2. p,q / nearest equal positions: step2. sentinel / artificial missing boundary -1 or n: step2. invariant / settled contributions count precisely their unique-occurrence substring pairs: step2, recalled step3. prev,nxt / code arrays: step4.

## Exact token/design contract
Reuse leetcode/style.css colors exactly: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font and typography; local 48px controls, disabled opacity 1 with muted text, 3px accent2 focus offset4. Local spacing 8/12/16/24px, 8/14px radii; no motion, external assets or new palette. Mobile layout wraps positions and endpoint pairs rather than squeezing a grid. State matrix: initial/middle/final, preset reset, rewind, quiz pending/correct/incorrect/changed/reset, clipboard success/fallback in zh/en. Static page has no loading/reconnect state.

P0: causal proof, bilingual states, source parity, oracle and browser checks. Highest-return 20%: occurrence boundaries plus visible substring pairs and ledger. P1: related precise concept links (#2916 step1 endpoint grouping, #76 step0 frequency vs set). P2 decoration omitted. Deferred: arbitrary text input (bounded presets suffice), autoplay, execution service, shared framework (unnecessary). Simulation computes boundaries ahead then settles each index, not actual Python execution. Tutorial retains O(n²) ledger references across snapshots for tiny ≤8-character presets; canonical code O(n) space. No trace omissions.

## Evidence and review boundary
See tests/evidence/self-check.md after checks. Tests accept OUTPUT_DIR for generated evidence. Metadata preflight command and result recorded there. Candidate hashes recorded after final checks. Independent review is the next dispatcher action; this author run does not grant acceptance.
