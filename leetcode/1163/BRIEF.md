# #1163 Last Substring in Lexicographical Order — author candidate 1

Author run only; independent lesson review is pending. No independent acceptance, learner outcomes, LeetCode acceptance, deployment, registration, or campaign-state change is claimed. Reused approved explainer pattern and shared tokens; own only leetcode/1163/.

Product fit: one local algorithm lesson for university-level LeetCode readers. Category algorithms/computing; stage university. Reader knows strings, indices, loops and big-O. The smallest useful outcome is to derive and implement the linear two-pointer rule.

Official source: https://leetcode.com/problems/last-substring-in-lexicographical-order/ verified 2026-10-27. Public GraphQL capture in tests/evidence/official.json shows the exact statement, examples, constraints and Python3 selector Solution.lastSubstring(self, s: str). Python is canonical because it is officially supported and faithfully callable.

| Step | Already known | One question | Input -> sought | Action -> visible observation | Conditions |
|---|---|---|---|---|---|
| 0 | characters and substrings | What is being maximized? | abab -> last substring | inspect every substring and compare first differing character | lowercase strings, contiguous nonempty substrings |
| 1 | exact answer on tiny input | Why not enumerate? | arbitrary s -> baseline cost | inspect counterexample aaaa | baseline is oracle only for small inputs |
| 2 | lexicographic comparison | Which candidate can be discarded safely? | tiny presets -> surviving starts | step/reset/end a trace; observe i, j, k and history | discard only after first mismatch |
| 3 | pointer invariant | Can you transfer it? | cababa -> predicted suffix | choose before reveal; changing answer clears feedback | exercise uses same invariant |
| 4 | complete rule | How does it map to official code? | s -> Python callable | source disclosure, copy/fallback and download | O(n) time, O(1) auxiliary space |

New terms: substring = contiguous nonempty slice; lexicographic order = compare at first differing character, with a longer string winning when one is a prefix; suffix = substring that reaches the end; candidate start = index of a suffix currently compared; offset k = equal prefix length already certified; invariant = fact true after every loop iteration; discard = prove a start cannot be optimal.

Proof sketch: compare suffixes at i and j. If they first differ at k and s[i+k] < s[j+k], every start from i through i+k is dominated by j; move i to i+k+1. Symmetrically move j when it loses. Equal characters only increase k. Keep the larger index when starts cross. Each mismatch advances one pointer by at least one, and k is reset; successful equal comparisons charge to future pointer progress, giving O(n) total comparisons. The remaining candidate at min(i,j) is the answer.

Simulation is a separate JavaScript model with tiny inputs (<=10); it does not execute Python. The source block, copied source, downloaded solution.py, and tests all use the canonical Python callable. The page states this boundary beside the code.

Status/evidence: self-checks are in tests/evidence/SELF-CHECK.md, oracle.json, browser.json, visual-inspection.md, preflight.json, and candidate-manifest.json. Separate agent review remains pending and must not be inferred from self-checks.

## Revision 2026-11-11

Review found: the step-2 counterexample ("aaaa … answer aaa, substrings may overlap") was pasted from #1044 and false (answer is aaaa); the discard invariant was stated, not shown (B=1); #44 related link unrelated; quiz settled by first letter; one-sentence code mapping.
Changes: replaced the counterexample with a real trap (zzazzb → zzb: tie on zz, decided by a<b). New step 3 derives the block discard by hand before stating the invariant: start 0 loses to start 3 at k=2; dropping one letter from both gives start 1 vs 4 and start 2 vs 5 with the same mismatch shifted, so starts i…i+k all lose. Invariant restated so that "if i <= j: i = j+1" is justified. Trace prints which block each mismatch discards and to whom; preset cababa → zzazzb. New fresh quiz cacacb → cb with four misconception options and explanations. Line-by-line mapping with a zzazzb frame and the aaaa stop case; O(n) argued with the potential i+j+k < 3n. Related link #44 → #321 step2. Step-0 mixed-language hint made bilingual.
Changed by Claude Code (claude-opus-5-5) on 2026-11-11; not committed. Verified-By: self-check only; independent review pending.
Verified: tests/oracle_check.py (3584 cases), tests/test_core.py (+ zzazzb, cacacb), browser-check/browser-deep/repair-regression (BASE_URL configurable) at 320/390/1280 en/zh. tests/evidence/browser.png was regenerated because the page changed.
