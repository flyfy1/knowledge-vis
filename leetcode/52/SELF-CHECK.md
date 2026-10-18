# #52 author self-check

Date: 2026-10-18. Status: complete author candidate, independent lesson review pending. Author: this Codex run; exact model identifier unavailable. No separate reviewer, submission, commit, registry change, deployment, or learner study is claimed.

Preview exercised: http://127.0.0.1:18770/leetcode/52/ . Official page and public GraphQL confirm the free Hard problem, examples, 1≤n≤9, and Python3 `Solution.totalNQueens(self, n: int) -> int`; saved response: [tests/official.json](tests/official.json).

## Computational evidence

- [algorithm-results.json](tests/evidence/algorithm-results.json): independent column-permutation oracle with pairwise coordinate-distance checks agrees with Python for every input n=1…9: 1,0,0,2,10,4,40,92,352. Exhaustive legal prefixes through n=6 and 100 seeded prefix draws (seed 52) cross-check descendants. Hand totals for n=4 are 0+1+1+0; fresh n=5 prefix [0,3] has exactly one complete descendant.
- [core-results.json](tests/evidence/core-results.json): all 120 frames for n=1…4 checked for legal placements, exact c/r−c/r+c sets, conflict rejection, place and undo transitions, leaf-only increments, accumulated receipts, terminal empty state, and snapshot isolation. Inputs outside the teaching range reject before computation.
- Exact `solution.py`/`python-code.js` parity passes. Browser displayed text, fetched source, actual downloaded file and actual clipboard content all match canonical Python. No claim of browser Python execution.

## Browser evidence

[Main suite](tests/evidence/browser-results.json): 159 assertions. [Additional suite](tests/evidence/browser-extra-results.json): 64 assertions. Reproduction commands and output-directory support are in [tests/README.md](tests/README.md).

Both Chinese and English: all presets, every forward and backward event, both endpoints, reset, range seek, exact forward/back state identity, prediction unselected/selected/revealed/change and all three choices. Locale preserves trace, answer, revealed feedback and disclosures; keyboard locale change keeps focus. Trace reset leaves the separate quiz intact. Main suite records no page errors or HTTP asset failures, and all runtime resources are local.

Browser checks cover 320,390,736,1440px widths, 736×414 landscape, 200% CSS zoom at 640px (320px effective layout), 48px control heights, keyboard Enter/Tab/Shift+Tab and range Home/End, 3px focus, forced colors, reduced motion, sticky navigation geometry, related route/anchor existence, denied storage, actual clipboard and denied-clipboard manual selection, actual download, and offline file-open source/trace operation. Physical devices, native browser toolbar zoom, screen-reader speech and public production behavior were not tested.

Rendered contrast measured with sRGB luminance: main text 16.09:1; explanation 12.62:1; muted hint 7.74:1; board headings 7.08:1; active control 13.10:1; queen 10.91:1; undo 8.94:1; rejection/incorrect feedback 6.35:1; correct feedback 10.00:1; orange focus on page 10.73:1. All measured normal text meets AA. Shared-plus-local CSS totals **12,306 bytes**, below 25,000. Colors remain exact shared tokens. A zoom screenshot exposed uneven negative outlines on table cells; local fixed borders replaced them and browser checks were rerun.

## Visual inspection and author walkthrough

The author opened the generated screenshots, including both locales' mobile and desktop views, focused 320px boards, 390px reject/undo states, complete leaf ledgers, prediction feedback and 200% zoom boards. Rows/columns and Q/×/? remain readable, the board is contained without Sudoku boxes, and long bilingual feedback wraps. Mobile viewports naturally scroll vertically; focused board captures show the entire board. Sticky navigation is horizontally scrollable at narrow widths and clears deep-link targets.

Author walkthrough observations (not novice learner evidence):

1. Contract/hand count distinguishes the integer result from stored boards and from partial placements. Mirrored n=4 paths each contribute one.
2. The c/r−c/r+c tests explain why an existing attack cannot be repaired by filling later rows. Safe [0,2] is still a dead end for n=4.
3. Event 30 has four queens but count 0; event 31 executes the leaf increment to 1; event 32 undoes a queen while keeping 1. Events 48/49 similarly preserve the second receipt. Seeking backward restores all recorded state.
4. Fresh [0,3] at n=5 permits only next column 1, then 4, then 2, giving one complete leaf. Rows are not solutions; having few choices is not failure.
5. Python stores sets and a counter, not the tutorial vector or receipts. The recursion increases r, each legal board has exactly one path, and all keys are removed before siblings. The stated O(n·n!) bound is conservative with average O(1) sets; snapshot memory is disclosed separately.

Candidate hashes, including exact shared dependencies, are in [candidate-sha256.json](tests/evidence/candidate-sha256.json). The independent reviewer should use a new output directory and a fresh context for the cold walkthrough. Independent acceptance, actual learner transfer, actual LeetCode submission, registration and release remain pending dispatcher/reviewer work. Only `leetcode/52/` was changed.
