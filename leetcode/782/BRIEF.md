# #782 Transform to Chessboard — author brief

Product verdict: reuse the approved LeetCode lesson pattern and exact shared tokens.
Contract: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication;
WORKFLOW.md, UI-I18N-SPEC.md, explainer/trace/review/rendered-state specifications.
Website-design skill read before implementation. Independent lesson review remains pending.
Scope: leetcode/782 only; category computing / algorithms, stage university.
Reader: knows binary grids, loops and whole-row/column swaps, but not the invariant.
Job: reconstruct a minimum-move test and implement the official Python interface.
Learning loop: try a legal whole-column swap → notice preserved row relationships →
check feasibility → pair misplaced positions → transfer to a fresh odd-sized case.

## Official contract and provenance

Verified 2026-10-25 via public official GraphQL, saved verbatim in provenance/official.json.
Official URL: https://leetcode.com/problems/transform-to-chessboard/
Python3 selector snippet: class Solution: movesToChessboard(self, board: list[list[int]]) -> int.
Python preferred; no language fallback. Full observed selector list retained in capture.
Square binary board, 2 <= n <= 30. Any two rows OR any two columns per move.
Return minimum moves or -1; either top-left color is permitted. No empty-input contract.
Official examples: 4×4 0110/0110/1001/1001 → 2; 01/10 → 0; 10/10 → -1.
No required mutation; submission leaves the input unchanged. No modulus or special types.

## Five steps (each has the five required fields)

| Step | Already known | Single question | Input → sought quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
| 0 | Binary cell values | What does one move change? | 001/110/001 → minimum swaps | Swap columns 1,2; undo/reset → 010/101/010, one whole-column move | Any two rows/columns, zero-based indices |
| 1 | Legal swaps | What can swaps never repair? | Same tiny board and 01/00 → row relation | Inspect same/complement rows; compare 2×2 counterexample | Every pair of rows must be equal or bitwise opposite |
| 2 | Feasibility and balance | How many swaps are necessary? | Preset board → checks, target, witness, minimum | Forward/back/end/reset → accumulated row checks and actual row/column swaps, original kept beside current | Binary square, structural test and count tests pass |
| 3 | Pairing mismatches | Does odd size change the answer? | Fresh 110/001/110 → prediction | Choose then reveal, change choice → feedback cleared | Count fixes which alternating start is feasible |
| 4 | Derived rule | How does the proof become code? | Original board → official integer | Inspect/copy/download source → exact same Python bytes | Official 2…30; O(n²) time, O(1) auxiliary space |

## First-use dependency table

| Term | First step and local definition | Dependencies |
|---|---|---|
| Chessboard | 0: every horizontal/vertical neighbor differs | binary values |
| Move | 0: swap entire two rows or two columns, not individual cells | grid |
| Complement | 1: flip every 0 to 1 and every 1 to 0 | binary values |
| Invariant / XOR | 1: preserved relationship / 1 when two bits differ | equality |
| Balance | 2: each line has floor(n/2) or ceil(n/2) ones | counts |
| Mismatch | 2: position whose bit differs from a selected alternating target | target |
| Auxiliary space | 4: extra working storage excluding input | code loops |

Definitions repeated locally when a step can be reached directly.
Correct baseline: enumerate both row and column permutations, test chessboard,
and use n - permutation cycle count for minimum swaps of each permutation.
O((n!)² n²) time, O(n) streaming auxiliary storage; for tiny cases only.
Proof: every row equal/complement of row0 iff all anchored rectangle XORs vanish.
The general four-corner XOR is preserved by permutations; a failed anchored test
cannot become a chessboard. Counts of row types and column types are preserved.
If both are balanced, independent permutations can alternate each type. For a
fixed feasible alternating target, 0→1 and 1→0 mismatches occur in equal numbers;
every swap fixes at most two, and pairing opposite mismatches attains mismatch/2.
Row and column permutations commute, and neither can repair the other's type order;
therefore add independent minima. Odd n fixes the start via the majority count.

## UI/state and token contract

Exact shared palette: --bg #0d1117, --panel #161b22, --panel2 #1c2330,
--line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff,
--accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Use shared typography,
spacing, 8px control/14px panel radii; 48px controls, 3px accent2 focus outline.
No new color literals. Board digits distinguish 0 and 1 independently of color.
Sticky step nav, heading #782 and separate official link. Native buttons/select/radios.
Two static boards retain original and current; ledger is cumulative, frames are deep copies.
Trace explicitly simulation; Python separately tested, not executed in browser.
Preset changes reset only the trace; hand experiment and prediction independent.
Language changes preserve all states; source copy has success/manual fallback branches.
Initial/pending/structural failure/count failure/swap/finished branches bilingual.
No loading/network/async simulation state needed; no server required for lesson.
Shared locale storage guarded; offline source embedded exactly; download real file.
No ambient motion, timers, external assets, fonts, or universal renderer.

P0 / highest-return 20%: hand move, invariant proof, count/mismatch derivation,
reversible witness, fresh prediction, exact source, readable bilingual states and tests.
P1: cumulative ledger and original/current board comparison within existing pattern.
P2: none. Deferred: custom large-board editor and automatic playback (unnecessary
state complexity); actual learner studies and independent acceptance need separate runs.

## Validation plan and limits

Python vs independently enumerated permutations/BFS, exhaustive n=2,3; seeded n=4,
legal and illegal larger cases, n=30 extremes; verify no mutation, intermediate witness
invariants and mismatch costs. Browser simulation checked against oracle fixtures.
Real Chromium: EN/zh all presets/endpoints/replay, hand undo/reset, choices/reveal/change,
locale preservation, blocked storage, exact source/render/copy/native fallback/download,
320/390/736/1440 widths and 200% zoom, keyboard/focus, anchor geometry, asset errors,
contrast. Test writers accept OUTPUT_DIR; evidence is author self-check only.
No claim of independent review, novice results, production publication or LC acceptance.
