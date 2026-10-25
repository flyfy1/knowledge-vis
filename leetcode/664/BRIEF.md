# #664 Strange Printer — author candidate

Build/reuse verdict: reuse the approved five-section lesson shell in the LeetCode collection. Audience: readers comfortable with Python loops, learning interval dynamic programming. Category: leetcode; stage: university. Smallest outcome: calculate an overwrite schedule, derive the interval recurrence, and implement the official callable. Design authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; this is an author run, independent teaching review pending.

Official verification: 2026-10-25, https://leetcode.com/problems/strange-printer/, public GraphQL capture provenance/official.json. Python3 selector snippet is class Solution / strangePrinter(self, s: str) -> int. Input is 1..100 lowercase English letters; both official examples aaabbb=2, aba=2. No empty official input; internal empty intervals cost zero. No mutation/output ordering exceptions.

Learning loop and five fields per section:

|Step|Already known|Single question|Input → wanted|Action → observation|Conditions|
|---|---|---|---|---|---|
|0|A turn paints one interval with one letter|Why is aba only two turns?|blank 3 cells → aba|Reveal successive strokes; retain blank/aaa/aba history|Overwriting is allowed, positions zero-based|
|1|A stroke may overwrite|What correct baseline explores everything?|short target → minimum turns|Compare count-of-runs mistake with aba schedule; read BFS baseline|BFS uses target alphabet, finite short strings only|
|2|Small intervals have answers|When can final j share a turn?|s[i..j] → dp[i][j]|Change preset (restart), inspect each candidate, rewind; completed table and ledger retained|Each frame is after one candidate; current and best explicitly distinct; empty gap=0|
|3|Matching endpoint may share|Can a new case reuse a turn?|abcba → turns|Choose then reveal; changing choice clears feedback|Independent of trace, locale preserves choice/reveal|
|4|Recurrence and dependencies|How does this become valid Python?|official signature → integer|Read/copy/download exact canonical source|Trace is JS simulation, tests separately execute Python|

Terms first introduced: step0 turn=one constant-letter interval overwrite, index=zero-based position; step1 BFS=explore boards by number of turns, interval dynamic programming=store short-span optima to build longer-span optima; step2 interval=inclusive contiguous positions, dp[i][j]=minimum for blank interval, candidate=one legal decomposition, invariant=completed shorter intervals are exact. Repeat definitions locally when jumping sections. Step3 repeats shared-turn principle. Step4 repeats dp meaning and empty-gap convention.

Exact token contract: inherit ../style.css --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Existing system font stack and 1.75 body leading, control radius 8px, stage radius 14px, spacing 8/12/16/20/24/48/64px. Local overrides remove disabled opacity, enforce 48px controls, use accent for focus. No new palette, motion, assets or runtime fetch. DP table scrolls in a named focusable region with row/column labels.

P0/highest-return slice: causal aba calculation, honest candidate values, reversible complete short trace, fresh prediction, bilingual parity, original Python and oracle checks, mobile/zoom/source/clipboard evidence. P1: related interval-DP deep links. P2: none. Deferred: animation, arbitrary large browser inputs and execution service (not needed for learning; bounded presets keep rendering small). Tutorial snapshot storage is separate from O(n²) submission space.

State matrix (both locales): blank/start, in-progress candidate, completed interval, terminal result, rewind/reset, each preset, no prediction/chosen/revealed/changed, copy success/manual fallback, storage denial. No loading/auth/reconnect because no remote runtime work. Source disclosure and focus survive locale changes. No automatic timers. Tests and screenshots are author self-checks, not real learner or independent acceptance evidence.

Adversarial preset bcacba: final candidate k=2 costs 5 while j-alone remains the winning 4. This exercises current-candidate versus best-candidate identity, not merely ties.
