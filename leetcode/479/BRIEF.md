# #479 · Largest Palindrome Product

Author candidate; independent lesson review pending. Reuse the approved collection shell and dispatcher adjudication in `specs/reviews/leetcode-all-hard-design-review.md`; apply website-design SKILL.md. Scope only this lesson, category computing / algorithms, stage university. Reader knows loops, multiplication and integer division. Smallest outcome: reconstruct a descending palindrome search, justify its factor cutoff, and implement the official Python interface.

Official contract captured 2026-10-25 in provenance/official.json from public GraphQL: n integer, 1≤n≤8, return largest product palindrome modulo 1337; examples (2,987),(1,9). Python3 selector snippet is `Solution.largestPalindrome(self, n: int) -> int`. No mutation or empty-input contract; no paid restriction. Python is preferred and available. Chinese title is an authored translation.

Learning loop: calculate 99×91 → reject 9779 → construct mirrored candidates → rewind divisor checks → predict a fresh cutoff → map to code. Five sections separate distinct questions, not a forced data-structure narrative.

|Step|Known|Single question|Input → unknown|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Multiplication|What is maximized?|n=2 → largest palindrome, then residue|Read 99×99, 99×98, 99×91 hand ledger|Both factors exactly n digits; maximize before modulo|
|1|Palindrome reads equally both ways|Which candidates and factors can be skipped?|n=2, mirrored prefixes → exact candidate order and divisor bound|Compare 9889,9779,9669 and factor bounds|All lengths descending; prefix order is numeric order within one length|
|2|Factor pair has a larger member|Why is the next rejection safe?|n=2 search / two focused probes → feasibility|Advance/back/reset/end/slider; cumulative ledger displays each check and the cutoff|Every trace frame is after one completed check or completed cutoff; no hidden steps in n=2 trace|
|3|Unordered factors can be swapped|Can an unseen candidate still work?|p=1331, hi=99, x=36 → next legal check|Choose then reveal; change clears feedback; locale preserves it|Both factors 10…99; all x=99…37 already failed|
|4|Candidate and factor invariants|Why does the code return the maximum?|n=1…8 → canonical Python|Read/copy/download exact code; follow deep links|Unit-cost integer arithmetic bound stated; string costs and trace memory distinguished|

Terms first-use/dependencies: step0 palindrome (digits unchanged on reversal), n-digit (10^(n−1)…10^n−1), modulo (division remainder); step1 prefix (first half including middle digit for odd lengths), mirror (reverse all or all but middle), larger factor (a≥b), square cutoff x²<p; step2 repeat local definitions and frame instant; step3 repeat bound; step4 repeat invariant and map names. No specialized prerequisite is left undefined.

Correctness: scan lengths 2n down to 1 and equal-length prefixes descending. Skip p>hi². For each p test larger factor x from hi down while x≥lo and x²≥p; accept only exact division with quotient ≥lo. Any valid pair appears with its larger member, and any untested x after the cutoff has both factors <sqrt(p). First feasible candidate is globally maximal. n=1 special return 9; generic odd-length fallback avoids assuming every maximum has even length.

Tokens: exact shared palette --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system stack, 1.75 body line-height, title clamp(28px,5vw,46px), 8/14px control/panel radii; local spacing 8/12/16/24px. Border uses muted for native controls; 3px accent2 focus with 4px offset. No new palette, shadows or animation. Categorical status has text as well as color.

State matrix (both locales): initial/ongoing/terminal trace, all three presets, back/forward/slider/reset, unrevealed/chosen/revealed/changed prediction, clipboard success/manual fallback, unavailable storage, source hidden/open. No network-dependent runtime, loading/reconnect/accounts are inapplicable. Locale patches static strings and rerenders dynamic text without replacing focused controls. Preset explicitly resets only the trace. Source is execution-tested Python; browser ledger is a simulation, not execution. Full n=2 trace has no omissions; larger official inputs are code tests, not animated. Snapshot storage is not solution space.

P0 / highest-return slice: concrete derivation, truthful ledger and invariant, canonical code, bilingual state preservation, responsive/accessibility and oracle checks. P1: related concept anchors. P2: none. Deferred: automatic playback, arbitrary huge traces, browser Python runtime, shared framework, deployment and registry changes (outside ownership). Review must be a separate run; no novice learning or LeetCode acceptance claim.

Validation plan: exhaustive product-pair oracle n≤3, all official n against independently supplied known results and factor witnesses, intermediate trace factor bounds and reversibility, seeded restricted-range brute comparisons, mirror parity, browser in both locales at 320/390/736/1440 and 200% zoom, keyboard, clipboard/fallback, storage denial, local network errors, measured contrast and screenshot inspection. Outputs accept LESSON_OUTPUT_DIR; metadata validate-only before ready.
