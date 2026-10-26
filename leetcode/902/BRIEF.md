# #902 · Numbers At Most N Given Digit Set

Author run: Codex, exact model identifier unavailable. Status: author self-check complete; independent problem review pending. No LeetCode submission, acceptance, learner study or publication claimed.

## Contract and scope
Reuse the approved LeetCode lesson pattern and dispatcher adjudication in `specs/reviews/leetcode-all-hard-design-review.md`; website-design skill applied. Build verdict: one local lesson, no shared framework. Category computing / algorithms; stage university. Reader knows loops, decimal place values and Python lists. Job: count valid positive integers without constructing every number. Highest-return slice: show why a smaller first difference makes all suffixes legal.

Official source: https://leetcode.com/problems/numbers-at-most-n-given-digit-set/ verified 2026-10-26 using public GraphQL (full capture `provenance/graphql.json`); ordinary HTML request returned 403, retained in provenance. Public web description also readable. Python3 selector gives `class Solution: def atMostNGivenDigitSet(self, digits: list[str], n: int) -> int`. Python is canonical. GraphQL internal questionId 938 differs from frontend/catalog ID 902; use frontend 902. Inputs: 1–9 unique sorted single-character digits 1–9, reuse unlimited, 1 ≤ n ≤ 10^9; positive integers only, no zero, no modulus, no mutation requirement. Examples: [1,3,5,7],100→20; [1,4,9],10^9→29523; [7],8→1.

## Learning loop / section five-field contract
| Step | Known | Single question | Input → quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0 Hand count|decimal notation|Which numbers count?|D={1,3}, n=31 → 5|inspect 1,3,11,13,31 and rejected 33|positive, no digit zero, repetition allowed|
|1 Derive blocks|hand list|Which checks can be shared?|same D,n → disjoint counted groups|compare 1_,3_; observe 11,13 free after 1<3|same length comparisons; all shorter lengths legal|
|2 Trace|block counting|When does equality stop?|preset → running count and equal prefix|next/back/reset/end/range; retain all prior contributions, candidate relation rows|simulates complete position-level algorithm; suffixes grouped, not enumerated|
|3 Transfer|first difference invariant|How many ≤526 using 2,5,8?|fresh input → total count|choose then reveal; change clears feedback; locale preserves answer|independent of trace preset; no answer visible before reveal|
|4 Code / boundaries|block proof|How does the submission implement it?|digits,n → integer|inspect/copy/download exact Python|official constraints only; browser is separate simulation|

## Terms at first use
Step0: D = available digits, n = inclusive bound. Step1: m = number of choices; L = decimal length of n; prefix = beginning digits; suffix = remaining digits; first difference = first position not equal to n; powers[r] = m^r ways to fill r free positions (including one empty suffix). Step2 repeats prefix/suffix, before/added/after count scope and one-based display positions. Step4 repeats L,m and powers mapping.

Invariant derived from D={1,3},31: counted blocks are exactly shorter numbers and same-length numbers whose first smaller digit has been processed. Remaining possible numbers share n's processed prefix. Blocks cannot overlap because length or first difference differs. Smaller digit contributes m^r; larger contributes zero; equality continues only when bound digit exists. If absent, no equal-prefix continuation; if all matched, add n once. Counterexample: counting all m^L same-length words counts 33>31. Independently testing digit≤bound at each position rejects 13≤31 because 3>1.

## Visual / state contract
All frames are after one completed operation (initial frame is before counting). Ledger retains each completed group and before + added = after. Candidate rows show selected digit, comparison with bound digit, branch prefix, free suffix size and contribution. Equal row is continuation, not an added result. Final +1 is separate. Back restores immutable snapshots; range and preset reset the trace only; quiz state independent. No omitted position events; groups summarize potentially many numbers. No timers, loading, server execution or authentication. Clipboard success and focused selectable fallback are bilingual; storage failure uses common.js memory fallback. Locale changes preserve preset/frame/choice/reveal/copy state.

## Exact reused tokens and layout
Shared `../style.css`, `../common.js`. Palette exactly --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font stack, body line-height 1.75; shared 952/1000px widths; 8/14px control/card radii; 8/12/16/20/24px spacing. No new color values. Local overrides enforce 48px controls, readable disabled states and 3px focus. No ambient animation. Step panels stack at narrow widths; ledger wraps. Code may scroll horizontally.

P0: complete causal bilingual lesson, reversible grouped trace, invariant, independent numerical oracle, real-browser checks, source fidelity, metadata preflight. P1: contrast and selected-font width measurements; retained focused screenshots. P2: none. Deferred: free-form input (presets cover distinct branches without validation complexity), autoplay (no learning need), shared abstractions and registration (outside scope). No device/network/production claims; headless Linux browser tests are self-checks only. Independent six-dimension review remains pending.

## Verification commands
`python3 -B leetcode/902/tests/test_core.py`
`NODE_PATH=... node leetcode/902/tests/browser.cjs`
`python3 -B scripts/register_leetcode_lesson.py 902 --validate-only`
Tests accept OUTPUT_DIR for reruns. Results and final candidate hashes will be frozen in tests/evidence; any metadata repair before freeze becomes part of the new candidate, with independent review still pending.

## Final author evidence / frozen candidate
Candidate: `902-author-1`, frozen after local wording clarifications, metadata validation and rerun of the relevant suites. Hash receipt: `tests/evidence/candidate.json`. Independent reviewer/run: pending. No prior acceptance is changed. Registration and publication were not performed.

- Core: 5,708 executed Python cases (5,000 direct-enumeration cases plus 700 seeded large cases and eight explicit fixtures), browser core parity on 5,700 cases, and 1,710 intermediate contribution frames. See core-results.json.
- Chromium: both locales, seven presets, every endpoint and reversible trace action, all predictions, locale preservation, source/copy/fallback/download parity, offline/storage failure, widths 320/390/736/1440, 200% CSS layout zoom, selected font budget, keyboard/focus and existing deep links. Thirty recorded state groups; no console/page/asset errors. See browser-results.json and semantic-states.json.
- Contrast: minimum measured text pair 6.4494:1 (muted on panel2); core text exceeds the 7:1 target. Total shared + local CSS 11,798 bytes, below 25,000.
- Preflight: `python3 -B scripts/register_leetcode_lesson.py 902 --validate-only`, exit 0 with empty stdout/stderr; exact record in preflight.json.
- Headless screenshots visually inspected: header, smaller/equal branches, dense nine-choice rows, retained ledger, terminal stop, prediction feedback, and zoom layouts. Labels wrap without collisions; candidate labels and values stay together. Element screenshots of the full tall stage include a sticky-nav capture artifact partway down; ordinary viewport captures and direct navigation were also checked.
- Harness correction: the first supplemental capture tried selecting an already-selected prediction and expected a change event. That assertion failed because reveal correctly survives a locale switch. The capture now actually changes the answer before checking hidden feedback. No runtime repair was needed for that harness error. Core/browser checks passed again on the final candidate.
- Limits: this is an author self-check, not independent review, actual novice teach-back, LeetCode acceptance, or production verification. 200% uses CSS layout zoom. A native Control++ probe did not change Chromium metrics, so native browser-toolbar zoom is not claimed. Physical devices and macOS are untested.
