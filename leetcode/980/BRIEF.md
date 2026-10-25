# #980 Unique Paths III — author candidate v2

Author: Codex, exact model identifier unavailable. Author self-check only; independent problem review pending. No LeetCode submission, acceptance, publication or learner outcome claimed. Scope: leetcode/980 only.

## Approved product/design contract
Reuse specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication; follow WORKFLOW, UI-I18N-SPEC, explainer, Hard trace, review gate and rendered-state specifications. Website-design skill applied. Verdict: reuse the existing lesson surface. Category computing; stage university. Reader: knows loops, arrays and basic Python functions; recursion is explained through a concrete child/return/sibling sequence. Job: reconstruct counting complete grid walks through reversible branch exploration.

P0 / highest-return 20%: tiny concrete route, failed early end, visited-state invariant, visible undo, fresh prediction, exact Python mapping and tested bilingual controls. P1: official/boundary presets and related anchors. P2: none. Deferred: custom board editing and autoplay (unnecessary to bounded causal loop), general graph framework (no demonstrated need), browser Python execution (simulation explicitly labeled). Approved reused layout requires no new design review.

## Official contract
Source https://leetcode.com/problems/unique-paths-iii/ accessed 2026-10-26; public GraphQL capture tests/evidence/official-graphql.json preserves statement, examples and complete observed language snippets. Python3 observed: Solution.uniquePathsIII(self, grid: list[list[int]]) -> int. Python is preferred and faithfully supported. Values -1 wall, 0 empty, 1 unique start, 2 unique end. Move orthogonally; visit every non-wall exactly once; return number of walks. 1<=m,n<=20, 1<=mn<=20, exactly one start/end (so a one-cell board cannot meet valid-input conditions). Examples return 2,4,0. No modulus, diagonal moves, wraparound or exception behavior specified. Our implementation restores input after exploring. Chinese title is authored translation.

## Learning loop: five fields per section
0. Known: adjacent grid squares. Question: does merely reaching E suffice? Input [[1,2],[0,0]], desired number of complete walks. Action: inspect fixed two routes, calculate 0+1=1. Conditions: four directions, no repeats, every usable square.
1. Known: one early failure and one success. Question: how can we enumerate without losing valid walks? Input same board; output all complete walks. Action: compare permutation baseline and pruning; derive remaining=V-len(path), explain branch partition and undo. Conditions: unique start/end, finite grid, no reuse; backtracking remains exponential.
2. Known: visit/remaining invariant. Question: what changes on a call and return? Inputs six presets, output retained route numbers, current path, cumulative accepted count, operation history. Action: forward/back/reset/end, change preset explicitly resets this experiment. Observe early-end rejection, undo, sibling success. Conditions: complete teaching simulation with snapshot storage, not Python execution; recent-event ledger shows last eight events while every event remains navigable.
3. Known: remaining must be zero at end. Question: how many walks on fresh [[1,0,2],[0,-1,0]]? Action choose then reveal; explain why dead-end leaves cannot both be covered; changing answer clears feedback. Conditions: independent fixed exercise; locale preserves state.
4. Known: branch accounting. Question: how does Python implement the exact invariant? Input official valid grid; output integer. Action source/copy/download plus explicit call values, boundaries and cost; related links. Conditions: static simulation vs separately executed submission; canonical source restores grid including start/end.

## First-use dependencies
Step0: S/E/wall and route = ordered adjacent squares, coordinate = zero-based row,column; every usable square includes endpoints.
Step1: baseline = simple correct comparison method; permutation = an ordering of all internal squares; branch = choice of next square; backtracking = try, recurse, undo; invariant = fact kept at each state; V usable cells, path currently visited sequence, remaining unused cells after entering current square.
Step2 repeats path, remaining, completed accepted walks; visit labels 1..k are route order, input values shown separately; current square outlined. Event numbers are simulation indices, not input coordinates.
Step3 repeats complete-walk rule. Step4 recursion = function calling itself for a smaller remaining task; local total vs simulation cumulative count explicitly separated; saved cell restores mutation.

## Tokens, states and lifecycle
Exact inherited palette: --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Inherited fonts; 8/12/16/20/24/32/64 spacing, 8/14 radius, 952 max content. Local overrides for opaque disabled text, 48px controls, solid nav, wrapping and grid. No decorative assets or motion. Board labels use text and order rather than hue alone. Locale uses shared common.js, preserving preset, frame, prediction/reveal, focus and source disclosure. Empty/loading/reconnect not applicable to static data. Clipboard success/manual fallback, terminal navigation and blocked storage applicable. Reset clears frame and count; no timers. Prediction independent from trace.

## Evidence and review status
Reproducible tests and evidence live in tests/; output-producing tests accept OUTPUT_DIR. Numerical solution checks use an independent permutation oracle for small boards, subset DP for seeded/larger cases, intermediate snapshot invariants and official examples. Browser checks cover both locales, every preset, reversible controls, prediction, actual source transfers, keyboard, viewport and zoom, local requests and contrast. Frozen candidate and self-check evidence will record actual results. Separate review and real learner teach-back remain pending; real devices and public deployment are outside this author run.

## Author revision v2
Visual self-check found default English native-select label clipping at 390px in v1. Shortened preset labels without changing inputs or algorithm. v1 runtime identity, original passing computational/browser results and clipping screenshots are preserved in tests/evidence; final v2 evidence is in tests/evidence/v2. Added all-preset selected-label width checks at 320px. Metadata is unchanged; final preflight reruns before freezing. This is an author fix, not independent finding closure.

## Final author status
Candidate v2 authored and self-checked. All final checks passed, including non-mutating metadata preflight (exit 0). See SELF-CHECK.md, tests/evidence/v2 and CANDIDATE.json. Independent review remains pending; release remains outside scope. Only leetcode/980 files were added.
