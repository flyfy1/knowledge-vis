# #928 · Minimize Malware Spread II

Author run, candidate 928-r1. Author: Codex (exact model identifier unavailable).
Independent lesson review: pending, separate run required. No acceptance, novice
learning result, LeetCode submission or production deployment is claimed.
Approved reuse: specs/reviews/leetcode-all-hard-design-review.md and dispatcher
adjudication; no new product/layout or shared changes. Scope only leetcode/928/.
Website-design skill applied; category leetcode, stage university.

## Product and design contract
Reader: knows Python loops, sets and lists; wants to derive and implement #928.
Smallest useful loop: delete a source → observe remaining infection → partition
clean nodes → count distinct infected neighbors → predict a new winner → map to Python.
Five sections serve that causal path; this is not a generic optimization story.
P0/highest-return 20%: truthful node deletion, visible spread history, ownership
ledger, proof, bilingual retrieval exercise, executable source and access checks.
P1: reversible candidate scan and related concept links. P2: none.
Deferred: free graph editor (unneeded validation surface), animation (step controls
already expose causality), publication/registration (outside author ownership).

Reuse exact shared tokens: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. System font stack from shared CSS;
shared title clamp(28px,5vw,46px), body line-height 1.75. Spacing 8/12/16/20/24/64px;
radii 8/14px, no shadows or motion; 3px offset focus. 48px controls, disabled
opaque muted text on panel2. Graph uses a fixed-coordinate SVG with legible labels,
scaling only to a bounded small input; tables permit labeled keyboard scrolling.
Rendered-state matrix: EN/zh × each preset × initial/middle/end/rewind/reset;
candidate scan pending/current/best/finished; prediction unselected/selected/
correct/wrong/change; copy success/manual fallback; storage unavailable; narrow,
zoomed, reduced motion and forced colors. No async server/loading/reconnect states.
Locale rerenders data only; controls retain focus and state. No ambient timers.

## Official contract and provenance
Verify official URL https://leetcode.com/problems/minimize-malware-spread-ii/,
and public GraphQL content + codeSnippets, captured in provenance/official.json.
Access date 2026-10-26. Free Hard algorithms problem, frontend ID 928 (internal ID
964). Python3 is supported with Solution.minMalwareSpread(self, graph:
list[list[int]], initial: list[int]) -> int. Prefer Python; no exception needed.
n=2..300, square symmetric binary matrix, diagonal 1; unique initial indices,
1 <= len(initial) < n. Delete exactly one initial node AND all incident edges;
return smallest index among minimum final infected counts. Input mutation not
required; implementation preserves both inputs. Official outputs: 0,1,1.

## Step plan (five required fields per step)
| Step | Already known | Single question | Input → desired quantity | Action → expected observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | numbered computers and links | What does deleting a node change? | path 0–1–2, initial=[0,1] → M per removal | remove 0 vs 1; advance/rewind rounds → absent node/edges, M=2 vs 1 | undirected spread; deletion, not curing |
| 1 | final spread and smallest-index tie | How can a slow method guarantee the answer? | same preset → terminal M for each candidate | change preset → complete baseline table changes | skip removed node in every neighbor scan; O(kn²) |
| 2 | baseline repeats connectivity work | Which clean groups can one deletion save? | induced clean graph → distinct neighboring sources and savings | shared/repeated-contact presets; scan candidates with retained ledger → only sole-owner groups contribute | clean groups defined after excluding ALL initial nodes; B−1−saved |
| 3 | sole-owner rule and tie | Can the rule transfer to unseen input? | independent 8-node network → removal ID | choose before reveal; change answer clears feedback → 5 saves two clean nodes | given complete edge list, diagonal implicit |
| 4 | partition, ownership, savings | How does the proof become executable Python? | graph, initial → int ID | view/copy/download source → exact canonical bytes | O(n²) time, O(n) auxiliary excluding input and teaching snapshots |

## Terms at first use / dependencies
Step 0: node=indexed computer, edge=direct undirected connection, adjacency matrix
=graph[a][b] link indicator, initial=infected source indices, M=remaining infected
node count at termination. I/H/X markers defined locally.
Step 1: queue=list of discovered infected nodes awaiting row scans; head index.
Step 2: clean=not in original initial; clean component=maximal set joined using
only clean nodes; boundary=distinct original infected sources directly adjacent;
owner=sole boundary source; saved=clean nodes protected, excludes deleted source;
B=infected without deletion; invariant=fact preserved throughout traversal/scan.
Step 3 repeats component/boundary/saved definitions in prompt and explanation.
Step 4 repeats code-state meanings and stack=set/list of pending clean nodes.
Related links #924 step2 (different removal semantics), #803 step2 (connectivity).

## Mathematical and visual contract
Every spread frame is AFTER one simultaneous round, including round 0 after
physical deletion. End is the last distinct infection set, terminal iff no next
new nodes. Entire retained prefix is visible. X remains as a dashed positional
marker only; it has no incident edges and is excluded from M. No omitted rounds.
Components: discovered clean nodes labeled on push, once each. Gather a SET of
adjacent original sources over the entire component. size>0 and boundary size=1
adds size to that source; zero or multiple boundary sources add nothing. One
source touching twice is still one source. B=k+sum(size for touched components).
M(r)=B−1−saved(r); deleted source is always excluded exactly once. Untouched
components stay healthy. Remaining sources cannot be saved; they are already
infected. All routes to a clean group first enter from a boundary source; hence
zero boundary stays clean, one boundary survives only if that source is deleted,
and two or more boundaries cannot all disappear after a single deletion.
Candidate scan records the best among checked candidates and its own score;
currently inspected candidate is labeled separately. Tutorial snapshots cost
extra space and are not canonical Python execution.
Wrong approach: #924 full-graph groups on path 0–1–2, initial [0,1], suggests tie 0;
actual deletion 1 disconnects clean node 2 and wins. Repeated-contact case rejects
counting edges rather than distinct sources. Browser is a bounded simulation,
not executing the submission. Official limits tested separately outside browser.

## Verification and review handoff
Reproducible commands and author evidence live in tests/README.md and
 tests/evidence/. Results, candidate hashes, preflight and visual inspection are
recorded there after actual execution. Tests emitting artifacts honor OUTPUT_DIR.
Independent review must use a fresh run and the frozen six-dimension rubric in
specs/leetcode-review-gates.md; author tests do not satisfy that gate. No shared
registry/CONCEPT-MAP edits: lesson-entry.json carries future registration inputs.

## Completed author evidence (928-r1)
Author self-check complete: tests/evidence/SELF-CHECK.md; exact frozen file hashes
in tests/evidence/manifest.json. Official capture in provenance/official.json.
Independent review remains pending; next action is a separate cold review run.
Metadata preflight from checkout root: `python3 -B scripts/register_leetcode_lesson.py 928 --validate-only`, exit 0. No registration or publication.
Diagram minimum width 300px uses an explicit keyboard-scrollable frame; narrow
preset selector uses A–H with the full bilingual description below to avoid native
option clipping. At <=360px margins use the existing 8px spacing token.
