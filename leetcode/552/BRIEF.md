# #552 · Student Attendance Record II — author brief

Scope: one bilingual algorithms lesson, category `leetcode`, stage `university`.
Audience: reader knows Python loops and wants to derive a counting algorithm.
Verdict: reuse the approved collection shell and local state-table experiment.
Design authority: ../../specs/reviews/leetcode-all-hard-design-review.md and its dispatcher adjudication; no new layout or independent review claimed.

Official verification (2026-10-25): https://leetcode.com/problems/student-attendance-record-ii/ and public GraphQL at https://leetcode.com/graphql/. Captured response in tests/evidence/official-graphql.json includes complete statement and actual Python3 selector stub `class Solution: def checkRecord(self, n: int) -> int`. Fewer than two A overall, no LLL anywhere, modulus 1,000,000,007; 1<=n<=100000. Examples 2→8, 1→3, 10101→183236316. n=0 appears only as an internal empty-prefix base, outside official input. The initial direct HTTP page request was 403 (official-page.html); public GraphQL succeeded normally, with no authentication bypass.

Learning loop: enumerate two days → identify necessary memory → predict a day transition → inspect all incoming contributions → transfer to canonical Python → fresh fixed-prefix exercise.

## Step contract
| Step | Already known | Single question | Input → desired quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0|A/L/P daily marks|Which two-day records qualify?|n=2 → count|Read eight explicit words and reject AA|Both award rules; distinct strings counted|
|1|two-day enumeration|What information controls tomorrow?|prefix → legal next marks|Compare LL and PL, then LP and PP; inspect baseline|Only legal prefixes grouped; A total and L suffix retained|
|2|six state meanings|Where does each next-day count come from?|n preset, completed day → six counts|Forward/back/reset/end and day slider; see before/after, per-cell sums, full retained day ledger|Trace n<=10, no omitted days; whole-day snapshots; exact counts in tiny trace|
|3|state transition invariant|How many two-day extensions of PLL remain legal?|fixed prefix PLL → count of suffixes|Choose then reveal; change clears feedback|Independent exercise; no answer shown before reveal; locale preserves all state|
|4|derivation|How does code maintain that invariant at scale?|n → modular count|View/copy/download exact Python; follow named update mapping|Official domain, rolling arrays, modulo on each addition|

## Concept dependencies and local definitions
A=absent, L=late, P=present first appear step0. Prefix means days already written (step1). Suffix means consecutive final letters (step1). State (a,l) means A used and trailing L length (step1, redefined step2). dp[a][l] means number of valid prefixes in that state (step2, redefined step4). Invariant means a statement true after each completed day (step2). Modulo means remainder (step0, explained algebraically step4). Every step defines its local new terms; no generic optimization narrative beyond the actual repeated work.

## Exact visual contract
Reuse ../style.css tokens unchanged: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Shared system font and line-height 1.75; existing spacing 8/12/16/20/24/32/64px, 8px controls, 14px stages. Local CSS only reflows six states into 1/2/3 columns and raises controls to 48px; disabled opacity 1 with muted text and dashed boundary. No new color literals. Focus 3px accent2, offset 4px; no animation. Retained history is a labelled, keyboard-scrollable table. Color is decorative: state IDs, labels and numeric sums carry all meaning.

Rendered branches: start/middle/end × zh/en; each preset resets trace only; empty prefix base is valid internal state; quiz unchosen/chosen/revealed correct/revealed incorrect/changed; clipboard success/manual fallback; storage failure via shared locale. No loading/reconnect since runtime is entirely local. Trace is JS simulation, not Python execution. History storage O(n) is explicitly distinct from Python O(1) auxiliary space.

P0: complete reasoning, local simulation, source fidelity, bilingual/accessibility and all self-checks. Highest-return slice: six state counts with actual incoming sums and retained history. P1: named code mapping and related anchors. P2: none. Deferred: matrix exponentiation (linear method fits 100000), autoplay (no teaching need), runtime Python service (unnecessary dependency), registry/concept-map mutation (outside author ownership). Independent review and any release remain pending.

Validation: exhaustive string oracle small n, independent no-A tribonacci plus single-A split convolution, seeded n and maximum, each intermediate bucket. Browser both locales, all presets/endpoints, rewind/replay, quiz transitions, copy success/fallback, exact display/copy/download, offline storage denial, 320/390/736/1440 and 200% zoom, keyboard, local requests, contrast and inspected screenshots. Reproducible tests honor OUTPUT_DIR. Author self-check evidence is not independent acceptance or novice evidence.
