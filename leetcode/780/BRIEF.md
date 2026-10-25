# #780 Reaching Points — author brief

Build/reuse verdict: extend the existing LeetCode collection at 780/. Reader knows Python loops and integer arithmetic; the useful outcome is reconstructing a backward reachability test, including its boundary check. Category computing / leetcode collection; stage university. Reuse approved design/adjudication in specs/reviews/leetcode-all-hard-design-review.md. This is author work; independent review remains pending.

Official contract verified 2026-10-25 via public https://leetcode.com/graphql/ for the exact https://leetcode.com/problems/reaching-points/. Capture: tests/evidence/official-graphql.json. Direct HTML returned 403 (retained); GraphQL returned 200 with full public statement and snippets. Positive integer coordinates 1..10^9; moves (x+y,y) or (x,x+y); return boolean; zero moves allowed (official example 3). Official examples: (1,1,3,5) true, (1,1,2,2) false, (1,1,1,1) true. Python3 snippet is Solution.reachingPoints(self, sx: int, sy: int, tx: int, ty: int) -> bool. Python chosen; no exceptions or mutation requirements.

## Causal sequence (each row has the five required fields)

|Step|Already known|Single question|Input → quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0 Hand moves|Integer addition|Can (1,1) reach (3,5)?|Start, target → existence|Add into y, then x, then y; undo restores full history|Positive coordinates; local experiment caps sums at 20, explicitly not official limit|
|1 Derivation|Both coordinates never decrease|Which previous point could create a target?|Target pair → unique predecessor|Read (3,5)→(3,2)→(1,2)→(1,1) alongside concrete additions and BFS baseline|Unequal positive target; equal pair has no positive predecessor; stop at start|
|2 Modulo experiment|Repeated forced subtraction|How can we skip repeated work safely?|Preset start/target → remainder transitions + boundary test|Next, back, end, reset; retained ledger shows each completed modulo and terminal condition|Modulo only while both target coords exceed start; boundary uses nonnegative divisible difference|
|3 Transfer|Invariant and boundary meaning|Is (2,3)→(17,5) reachable, and why?|Fresh pair → verdict plus cause|Choose then reveal; changed choice invalidates feedback|Not present as a trace preset; feedback hidden until explicit reveal|
|4 Implementation|Whole derivation|Which code implements each rule and at what cost?|Canonical Python → executable contract|Open source, copy/fallback, download; map while/modulo/return|Unit-cost integer arithmetic for coordinates ≤10^9; browser is a simulation|

## Terms at first use and dependencies

Point/coordinate (step0): ordered pair (x,y), not distance. Reachable (step0): at least one finite legal move sequence, including zero moves. Baseline BFS (step1): visit states by number of moves, store visited pairs. Predecessor (step1): point immediately before a legal move. Greatest common divisor (step1): largest integer dividing both coordinates; preserved but insufficient. Remainder/modulo (step2): r in a=q b+r, 0≤r<b. Invariant (step2): a statement preserved by each loop update; while both coords exceed start, backward reduction preserves whether the start can reach the current target. Boundary (step2): a coordinate has reached/below its starting value; only the other coordinate can still change. Terms restated locally for step navigation.

## Tokens and scope

Exact shared palette: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font, body 1.75 line-height, h1/h2 shared clamp scales; 8px controls, 14px stages, 8/12/16/20/24 spacing. Local roles reuse exact tokens; muted border for controls, disabled opacity 1, 48px targets, 3px orange focus with 4px offset. Local immediate anchor scrolling avoids inherited smooth-scroll interference with keyboard activation. No new palette, images, fonts, animation, framework or service.

P0/highest-return: concrete arithmetic, honest retained trace, boundary proof, bilingual states, canonical parity and independent oracle. P1: clipboard recovery and related step links within this lesson. P2: none. Deferred: custom large inputs (bounded presets suffice), playback (no benefit), remote execution (static product), registration/release/independent review (outside author scope).

## State and simulation contract

Hand experiment and reverse trace are independent. Preset change resets reverse trace only and says so. Frames are after a whole modulo or final decision; start frame does no work. Ledger contains every update (no omitted batches); each batch states how many subtractions it represents. A terminal boundary check does not mutate coordinates. History costs O(k²) retained entries for k frames in the teaching simulation, distinct from O(1) submission space. Both locales cover initial, middle, terminal true/false, disabled endpoints, all predictions before/revealed/changed/reset, successful copy and manual recovery. Locale preserves all state and focus. Static page has no loading/network/reconnect state. Missing JS covered by bilingual noscript; storage failure falls back to shared in-memory locale. Related links are local step anchors to actual causal explanations, avoiding unverified external continuation.

Validation: BFS forward oracle independently checks Python and JS simulation on exhaustive small inputs; seeded random and constructed large legal paths; frame arithmetic, decreasing sums, invariant and rewind snapshots. Real Chromium both locales, every preset/control, copy and OS-native fallback clipboard, exact source/download, 320/390/736/1440 and 200% zoom, focus, errors, contrast, screenshots inspected. Tests accept OUTPUT_DIR. Metadata validate-only from repo root. No claimed accepted submission, learner result, deployment, or independent acceptance.


## 2026-10-26 — 780-COPY-R1 narrow revision

Owner-dispatched repair: `specs/reviews/workflow-copy-repair-requests-20261026/780.md`.
Build/reuse verdict: cut the existing workflow footer; reuse the approved design and tokens.
No new feature or layout is introduced. P0: preserve the accepted algorithm, trace,
official Python interface, and meaningful teaching limitations. P1/highest-return:
remove the bilingual footer and unused `foot` key; bump only the changed copy asset query.
P2: none. Deferred: other prose/design/algorithm changes, with no separate finding to justify them.

Candidate `780-copy-r1-20261026` is a new author revision for separate focused review
of stable finding `780-COPY-R1`, fixed awaiting review. All seven runtime files and
metadata were first verified byte-identical to historical accepted base
`c214c6549b53618d96782b6f827a5018c4c7f6e4`. The protected app/core/Python/mirror/CSS
and metadata remain identical afterward. `handLimit`, `sim`, and `s4e` retain their
original bilingual values and actual DOM bindings. Evidence and exact diff:
`tests/evidence/copy-r1/`. Historical acceptance remains scoped to its original candidate;
this author run provides no independent closure or publication authority.
