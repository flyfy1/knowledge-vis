# #887 Super Egg Drop — author brief

Status: author implementation; independent review pending. Author: Codex (exact model identifier unavailable). No acceptance, submission, deployment, or learner study claimed. Candidate C1 will be frozen by SHA-256 manifest after self-check. Own only this directory.

## Product contract
Reuse the approved lesson pattern and adjudication in `specs/reviews/leetcode-all-hard-design-review.md`; website-design skill read at `/home/songyy/Documents/agent-skills/website-design/SKILL.md`. Audience: readers comfortable with loops, arrays and small recurrence tables. Category computing, stage university. Outcome: derive a worst-case coverage recurrence and implement the official Python callable. One loop: hand split → capacity row → reversible move experiment → fresh prediction → source mapping.

Official verification: public GraphQL capture `tests/evidence/official-graphql.json`, accessed 2026-10-26 (capture timestamp authoritative). Exact URL https://leetcode.com/problems/super-egg-drop/. k=1..100; n=1..10000; f=0..n; breaking consumes one egg, surviving permits reuse. Examples (1,2)=2, (2,6)=3, (3,14)=4. Python3 snippet actually observed: `class Solution: def superEggDrop(self, k: int, n: int) -> int`. No language exception needed. Empty building is only an internal baseline state, not an official input. No modulus or mutation contract.

## Steps (five required fields each)
| Step | Already known | Single question | Input → quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Egg break rules|Why do two eggs suffice in three moves for six floors?|k=2,n=6 → worst-case moves|Read concrete x=3 branches and f outcomes|Identical eggs, monotone break threshold|
|1|Worst-case means longer branch|Why not always test the midpoint?|k=2,n=10 → min-max cost|Compare midpoint5 with split4; inspect baseline|All outcomes must be handled; no probability assumption|
|2|Both branches consume a move|How much can a move budget guarantee?|small k,n → coverage table|Advance/back/reset/end/preset; old rows remain, last split ledger shows both capacities|Complete bounded preset traces; row instant is completed move|
|3|Coverage counts floors, threshold count is +1|How many moves for two eggs and eleven floors?|Fresh fixed input → choose 4/5/6|Choose then reveal; changing choice clears feedback|Independent from preset; feedback hidden until explicit reveal|
|4|Coverage invariant|How does one row become Python?|k,n → minimum sufficient m|Inspect/copy/download source|Canonical Python execution is tested separately from JS simulation|

## First use/dependencies
Step0: f = highest safe floor (0 means none); worst case = maximum moves across possible f. Step1: D(e,h) = minimum worst-case moves for h unresolved floors with e eggs; min/max defined by choice/adversarial outcome. Step2: C(m,e) = maximum floors resolvable with at most m moves/e eggs; DP = storing solved smaller states, local explanation; lower/upper refer to floors below/above current test. Step3 restates C; step4 restates dp[e] and move budget m, and explains descending updates.

Derivation: below test x requires e-1 eggs; above retains e; each has m-1 moves. Thus any strategy covers at most lower+1+upper floors. Testing lower+1 and using each optimal child attains bound, by induction from C(0,e)=C(m,0)=0. First m with C(m,k)>=n is minimal; smaller intervals can truncate the constructed strategy. Wrong midpoint for (2,10) breaks at5: 1+4=5; split4 gives max(3,3)+1=4.

## State/design contract
No automatic motion. Frames are completed rows; all old rows retained, current row marked by text and border. Last split uses k eggs and previous row, with numeric lower/test/upper counts; capacities can exceed requested n and are labeled capacity. Source uses one descending array, trace uses full history, explicitly disclosed. Locale preserves preset, move, prediction/reveal, focus and disclosure. Reset affects only trace. Preset explicitly restarts trace. No fetching runtime assets, accounts, loading or reconnect state.

Exact shared tokens: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Reuse shared font, typography, radii and spacing. Local overrides: 48px controls, disabled opacity1/dashed boundary, 3px accent2 focus, table local scrolling with keyboard focus. No new palette. Shared CSS plus local CSS below 25KB.

P0/highest return: truthful split ledger, retained table, both languages, fresh prediction, executable canonical source and reproducible evidence. P1: source transfer recovery and deep links. P2: none. Deferred: automatic animation, arbitrary large UI inputs (history costs), browser Python runner, universal renderer, publication and independent review (outside author scope). Real device/novice/public production evidence not claimed.

## Verification plan
Independent floor-index minimax baseline for exhaustive small and seeded cases; binomial capacity identity for every intermediate row; official examples, 1 egg/1 floor/maximum cases; execute solution.py and compare exact mirror. Real Chromium at both locales 320/390/736/1440 plus 200% zoom, all presets/endpoints/reverse/keyboard/reveal/change, successful and denied clipboard with real manual transfer, blocked storage, offline source, deep links/assets, contrast measurements and visually inspected screenshots. Tests support EVIDENCE_DIR. Final results in tests/evidence/SELF-CHECK.md; separate review remains pending.

## Author completion — C1

Author self-check complete; independent review pending (no reviewer run, report, score or acceptance). Results: `tests/evidence/SELF-CHECK.md`, `python-results.json`, `browser-results.json`. Canonical source, mirror, metadata, runtime, tests and policy identities frozen in `tests/evidence/candidate-sha256.json`. All changes remain problem-local. The exact official Python3 interface was verified, so no non-Python language contract applies.

Final root command `python3 -B scripts/register_leetcode_lesson.py 887 --validate-only` exited 0 with no output. Metadata is a single complexity string; no registration performed. Candidate C1 is ready for separate review, not independently accepted. Shared concept-map registration is deferred to its authorized owner; proposed concept entries are in lesson-entry.json. Final CSS total 11,425 bytes. Controls use shared muted borders and >=48px hit dimensions; preset labels are numeric pairs with a local bilingual eggs/floors definition, verified at the tightest tested width.
