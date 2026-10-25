# #972 Equal Rational Numbers — author candidate

Author run: Codex; self-check only. Independent per-problem review pending; no acceptance, submission or publication claim. Candidate v1 (final before independent review), 2026-10-26. Own scope: leetcode/972 only.

## Product and design contract
Reuse the adjudicated lesson pattern in specs/reviews/leetcode-all-hard-design-review.md and the explainer, trace, review and rendered-state contracts. Audience: readers comfortable with place value and basic fractions; category computing, stage university. Job: compare two finite descriptions of infinite decimals exactly. Smallest outcome: reconstruct a fraction conversion and explain why nines carry. Highest-return slice: concrete ledger + exact tail cancellation + reversible comparison + fresh prediction + code mapping.

P0: verified official Python contract; all five bilingual sections; exact arithmetic; accessible reversible state; source parity; reproducible numerical/browser evidence. P1: six focused presets and related explanations. P2: none. Deferred: runtime Python in browser, animation, custom input parser and universal visualization framework (no need for the bounded learning loop). No new design/layout requiring renewed design adjudication.

## Official source
https://leetcode.com/problems/equal-rational-numbers/ accessed 2026-10-26. Public GraphQL capture in tests/evidence/official.json includes complete statement and language snippets. Python3 callable: Solution.isRationalEqual(self, s: str, t: str) -> bool. Nonnegative values; integer part 1..4 digits, no leading zero except zero; finite part 0..4 digits; optional repeat 1..4 digits. Integer-only and trailing decimal point valid. Repeat may contain leading zeros or all nines/zeros. Official three example pairs all true. No mutation or exception contract beyond valid strings. Python preferred and available; no language exception.

## Learning loop / five fields per section
1. Known: decimal places. Question: what does 0.1(6) add? Input: prefix 1 and repeated 6; output: successive partial fractions. Action: add/undo one block, observe retained ledger and shrinking gap to 1/6. Condition: partial sums are approximations, not equality tests.
2. Known: place-value sum. Question: can we account for all remaining digits? Input: same decimal; output exact 1/6. Action: compare shifted equations in fixed derivation. Condition: repeating block nonempty; terminating case handled separately. Baseline: whole-prefix subtraction cancels the repeated tails; independently implemented in the executable oracle. Exact finite truncation alone is not a correct baseline. Both exact methods use O(n) parsing and slice storage under official bounded arithmetic; this is a representation lesson, not a speedup claim.
3. Known: fraction tail. Question: do two spellings have the same value? Input: six presets; output parse/prefix/tail/equality ledger. Action: next/back/reset, preset explicitly restarts; earlier rows retained. Condition: complete bounded four-phase simulation, not Python execution; BigInt exactness. Snapshot costs distinct from solution.
4. Known: exact invariant. Question: is 0.12(9) equal to 0.13? Input: fresh pair; output hidden until choice + reveal. Action: choose/reveal/change and locale switch; stale feedback clears. Condition: equality of rational numbers, not text.
5. Known: derivation. Question: how does official Python preserve the value? Input: valid s,t; output bool. Action: inspect/copy/download code and boundary examples. Condition: Fraction is exact, not floating point; constraints bound integers. Explain each helper and real cost.

## Term dependencies (redefined locally when needed)
Step 1: repeating block = digits repeated forever; partial sum = finite prefix of expansion. Step 2: I integer, A finite digits (m length), B repeat digits (k length); denominator = number of equal parts; invariant = value stays I + A/10^m + B/[10^m(10^k−1)]. Step 3 redefines all four parts and fraction equality. Step 4 repeats exact-tail rule. Step 5 Fraction = reduced integer numerator/positive denominator; gcd reduction through library; n total input characters.

## Exact tokens and lifecycle
Inherit leetcode/style.css exact --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. System font stack inherited; spacing 8/12/16/20/24/32/64px, radius 8/14px; max width 952px; local overrides only 48px controls, opaque disabled text, solid navigation, wrapping, focus. No motion or images. Locale through shared common.js; no large control replacement; preset/frame/prediction/disclosure persist. All trace phases after named operation; no omitted phases. Ledger is text, no spatial axes. Empty/loading/reconnect not applicable to local static data; clipboard success/manual fallback and unavailable storage are applicable.

## Validation boundary
Tests accept OUTPUT_DIR. Numerical tests execute canonical Python vs independent whole-prefix subtraction oracle, exhaustive small forms, seeded cases, official and maximum boundaries; JS trace intermediates checked. Browser tests use existing preview, both locales, controls, widths, zoom, keyboard, denied clipboard fallback, downloads, exact source and local requests. Author screenshots inspected separately. No learner outcome, real device, public deployment or independent review asserted. Evidence records will give actual results and any limitations.

Chinese title is an authored translation; official English title and interface are captured. Related-link semantics were read in both locales at served #65 step1 (grammar flags) and #483 step2 (Sₘ(k) consecutive powers); local previews establish availability here, not a public deployment claim.

## Author status after checks
Self-checked v1; all recorded commands passed, including non-mutating metadata preflight. SELF-CHECK.md and tests/evidence contain actual results and browser limitations. Independent problem review remains pending; no separate agent was spawned in this author-only run. Final frozen identity is CANDIDATE.json. Runtime UI contains stable simulation limits only, with author/review status confined to these records.
