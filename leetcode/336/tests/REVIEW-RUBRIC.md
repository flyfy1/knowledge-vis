# Frozen review interpretation — #336

Use specs/leetcode-review-gates.md: six dimensions, ≥85/100, every dimension ≥3/4, no open required findings. This file specifies expectations, not scores or acceptance. The reviewer must use a separate run and first walk the page without reading BRIEF, source, this author’s results, or explanation of the implementation. Target reader: knows Python loops and dictionaries, learning trie search and palindrome boundary reuse. Candidate URL: http://127.0.0.1:18770/leetcode/336/. Candidate identity: tests/evidence/candidate-manifest.json.

| Dimension | Weight | Problem-specific evidence after cold walkthrough |
| --- | --- | --- |
| Problem, terms, hand calculation | 15 | Explain ordered distinct indices, unique strings, empty word; manually verify both orders for a tiny unequal-length case |
| Causal derivation and saved work | 20 | Derive leftover-middle cancellation; refute whole-word-reversal-only search; explain repeated slicing cost, shared reversed paths and linear boundary preprocessing |
| State and correctness | 20 | Reconstruct path/end/pal invariant and both output length cases; justify odd/even mirror radii, clipped reuse, boundary flags, completeness and no duplicates |
| Interaction and visual meaning | 20 | Predict a search transition; operate/reverse it; inspect active path, candidates, cumulative output and history; distinguish prebuilt trie simulation from actual Python execution |
| Transfer and cost | 15 | Map a concrete finish/shorter-terminal event to Python; independently test fresh words; justify O(S+n+P), uniqueness-based output bound, O(S+n) auxiliary storage and empty singleton exception |
| Bilingual and device access | 10 | Equivalent causal explanations, state-preserving locale switch, all prediction paths, accessible controls and readable scrollable table at 320/390px and 200% zoom |

Choose a fresh input independently of author presets; use the source/core for that check and label it code-only if the preset UI cannot enter it. Do not treat author oracle or browser results as independent judgment. Physical learner comprehension, LeetCode acceptance and public delivery remain unverified.
