# #601 · Human Traffic of Stadium — author brief

Build verdict: reuse the approved LeetCode lesson shell, shared locale and tokens.
Design authority: `specs/reviews/leetcode-all-hard-design-review.md`, including
dispatcher adjudication; no new product/layout gate is opened. Applied skill:
`~/Documents/agent-skills/website-design/SKILL.md`.
Category: computing / LeetCode. Stage: university. Reader: basic Python and tables.
Immediate job: reconstruct which visits belong to a qualifying consecutive-ID run,
then submit the verified Pandas callable. Smallest outcome: explain a triple witness,
predict an unseen result, and map one trace event to the Python loop.

## Official contract and language

Verified 2026-10-25 through public official page and GraphQL; full capture in
`provenance/official.json`. Pandas snippet is `human_traffic(stadium: pd.DataFrame)
-> pd.DataFrame`; SQL selectors are also captured. Choose Python per preference.
Schema: id int, visit_date date, people int. Dates unique; dates increase with IDs.
Output original records in increasing visit_date, each in at least three consecutive
IDs with people >=100 each. Calendar days need not be consecutive. Official example
returns IDs 5,6,7,8; IDs 2,3 are too short. No numeric row-count bound, explicit null
policy, or explicit ID-uniqueness constraint is supplied; do not invent one.
Extra robustness tests cover duplicate IDs without duplicating output artificially;
nullable people are treated as failing the comparison, outside the specified core.

## Learning loop / step contract

| Step | Known | One question | Input → wanted | Action → observation | Conditions |
|---|---|---|---|---|---|
| 0 | table rows | Which visits qualify? | IDs 4,5,6, people 110,100,140 → records | change middle to 99 → all three disappear | ID adjacency, not date adjacency; >=100 inclusive |
| 1 | valid triple | What repeated work can be saved? | same rows, plus ID 7 → triple witnesses | read two overlapping triples, contrast 4,5,7 | filter people before membership; distinct IDs |
| 2 | set membership | What has been proved after each start? | preset → union of complete triples | next/back/reset/end → retained witness ledger and selected rows | frame follows one tested start; exact snapshots, no omissions |
| 3 | invariant | Can you transfer to a new gap/break? | IDs 20..24,26 → result | predict, reveal, change → explanation resets | independent exercise; locale preserves answer |
| 4 | union of witnesses | Why does executable code return exactly the right rows? | official DataFrame → sorted DataFrame | source/copy/download → exact Python | expected hash costs, sort cost, input unmodified |

Step 1 baseline scans eligible rows twice for each possible triple start: O(n²)
time, O(n) output/mark storage. Hash membership saves these repeated scans. No
invented maximum constraint is used to argue necessity. Proof: every marked ID
has an actual qualifying triple; any position of a run of length >=3 lies in one
of its consecutive triples. Induction: marked IDs after k tested starts equal
the union of the complete triples at those starts. A set deduplicates overlap;
the final mask preserves original rows and sorts by visit_date.

## Terms at first use

Record/row: one visit (step 0). Consecutive IDs: successive integers (0).
Triple: three IDs s,s+1,s+2 (1). Baseline: direct repeated scan (1).
Set: distinct values with membership tests (1, repeated at 2).
Witness: a complete triple proving inclusion (2). Invariant: fact true after
every operation (2). Mask: one true/false decision per row (4). All local terms
are restated near jump targets. Variables `eligible`, `marked`, `s` map to code.

## Rendering / lifecycle

Browser model is a deterministic simulation, not execution of Pandas. Step 0 is
independent of step 2 and quiz. Preset switch explicitly restarts only trace.
Rows and the witness ledger persist; current event has star + text, never color
alone. Empty/no-eligible input starts terminal. Both locales cover pending, failed
triple, complete triple, empty, end, quiz wrong/correct, clipboard success/fallback.
No fetching/loading/reconnect states exist: all runtime assets are local.
Trace sorted by ID for teaching only; Python set iteration order is unspecified
and yields the same final union. All starts are shown; tutorial snapshots have
O(n²) storage vs O(n) submission storage. Trace inputs small and fixed.

## Exact reused token contract

Shared `../style.css`: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. No new palette literals.
System font stack PingFang SC / Microsoft YaHei / system-ui / sans-serif;
body inherited 16px, 1.75 line height, h1 clamp(28px,5vw,46px), h2
clamp(23px,3.5vw,32px). Shared spacing 8/12/16/20/24px, radius 8/14px,
952px inner width, 560px breakpoint. Local: control >=48px, 3px accent2 focus,
disabled opacity 1 and muted ink, table min-width 460px with labeled keyboard
scroll container and sticky first-column row identity; no new motion/shadows.
Measure actual text pairs and focus.

## Scope and validation

Highest-return 20%: threshold counterexample, overlapping triple ledger, fresh
prediction, exact Pandas transfer. P0: complete bilingual path and real tests;
P1: related links and keyboard scroll hints; P2: no decoration needed.
Deferred: arbitrary data editor (fixed small experiments suffice), SQL second
solution (Pandas supported), live execution/runtime (unneeded dependencies),
registration/deployment (outside author ownership), learner efficacy claims
(no real learner study). Separate independent review remains pending.

Checks: independent maximal-run oracle, exhaustive small absent/low/high IDs,
seeded/shuffled/boundary/duplicate/nullable fixtures, canonical Pandas execution,
JS intermediate union invariant and replay, real browser EN/zh at 320/390/736/1440
and 200% zoom, all controls and source parity/fallback/storage denial, contrast,
local network errors and inspected screenshots. Tests honor OUTPUT_DIR. Required
metadata preflight runs from repository root and is recorded in self-check evidence.
