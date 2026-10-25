# #761 · Special Binary String — author candidate

Uses the approved reuse verdict and dispatcher adjudication in
`specs/reviews/leetcode-all-hard-design-review.md`; applies the website-design
skill without reopening the approved layout. Category: leetcode (computing);
stage: university. Reader knows strings, loops and Python functions, but need
not know recursion. Smallest outcome: explain legal block boundaries, predict a
new rearrangement, and reconstruct the official Python callable.

Official verification: `tests/evidence/official.json`, public GraphQL accessed
2026-10-25, exact catalog URL https://leetcode.com/problems/special-binary-string/.
Observed Python3 selector: `class Solution: def makeLargestSpecial(self, s: str)
-> str`. Full statement, examples and all selectors retained. Input is promised
special, binary, length 1..50 (hence actually even, minimum 2). Examples:
11011000 -> 11100100; 10 -> 10. No mutation requirement; returns a string.

## Sequence: each row is known / question / input-output / action-observation / scope

0. Known: binary characters. Question: what may move? Input 101100, desired
largest reachable string. Swap 10 and 1100 mentally, see 110010 and first differing
bit. Define special, prefix, consecutive, lexicographic order; introduce exhaustive
legal-move search as independent baseline. Applies only to promised special input.
1. Known: legal special substrings. Question: where can an outer block end?
Input selected preset; output balance and minimal blocks. Advance scan and rewind;
see each prefix balance and zero-return boundary. Balance is #1 minus #0 in the
current call; minimal block returns to zero for the first time. Applies at each
recursive level, not only whole input.
2. Known: minimal blocks. Question: what remains inside 1...0? Input official
11011000, output child optimum and parent reconstruction. Use same trace,
observe child 101100 -> 110010, parent wraps to 11100100. Empty child returns
empty, parent arguments unchanged. Siblings follow child return. Scope: matching
outer 1/0 of a minimal block.
3. Known: recursive normalized blocks. Question: why is descending order optimal?
Prove same-level moves permute whole sibling blocks, prefix-free minimal blocks
make ordinary lexical sort valid. Predict fresh 10111000 with distractors; reveal
only on request; changing selection clears feedback. Scope: special minimal
blocks after optimizing interiors; arbitrary string sorting is not justified.
4. Known: rule and invariant. Question: how does this become a submission?
Map balance/start/parts/recursive call/sort to exact Python. Copy and download
source; compare with BFS and boundaries. Scope: official input, n<=50; empty
string is internal base case only. Explain conservative costs including slices.

## First-use terms and dependencies
Special/prefix/lexicographic/consecutive: step0, defined from bits.
Balance/minimal block: step1, depends on special definition; redefined in step2.
Recursive call: step2, function on smaller inner string, empty base case.
Sibling/prefix-free/invariant: step3, defined via minimal blocks; no tree jargon
required. Auxiliary space: step4, includes call arguments and temporary strings.
Terms repeated locally when needed for direct step navigation.

## State and visual contract
One local simulation (not execution of Python). All events are retained. Each
frame is after the named operation; current-call input, depth, processed prefix,
balance and completed normalized parts share that instant. Return events show
the returning call; next event resumes parent. Parent source strings immutable.
Balance ledger retains current-call prefix values; full event history preserves
child/return/sibling sequence. Preset change explicitly restarts only trace;
prediction remains independent. Locale preserves trace, choice, reveal and focus.
No autoplay, custom input, network runtime, empty/loading/auth branch needed.
Copy pending/success/manual fallback; initial/middle/end/rewind; unanswered/
selected/revealed/changed; both locales are rendered branches to test.

## Exact visual contract / priorities
Reuse ../style.css tokens verbatim: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454,
good #7ee2a8, bad #ff7a93; inherited font stack and sizes, radius 8/14px,
spacing 8/12/16/20/24px, max width 952/1000px. Shared alternate section background
#0a0e14. Local CSS only layout, readable disabled controls, 48px targets, wrapping,
3px focus outlines. No additional color literals or motion.
P0/highest-return 20%: legal-move example, causal balance/recursive trace, proof,
fresh prediction, exact Python and independent BFS, both locales and access.
P1: boundary presets and persistent history. P2: no decoration planned.
Deferred: arbitrary input validation (bounded presets teach mechanism), autoplay
(manual causal steps suffice), universal framework (no consumer). No shared edits.

## Validation boundary
Author self-check only; fresh independent review remains pending. Numerical tests
execute the real Python callable against exhaustive legal-move BFS and seeded
cases, validate simulation invariants. Browser tests use existing preview, all
presets/endpoints/locales, prediction changes, clipboard and source fidelity,
blocked storage, keyboard, links, narrow widths/zoom, assets and contrast. Tests
accept LESSON_OUTPUT_DIR. No LeetCode submission, learner study or publication.
