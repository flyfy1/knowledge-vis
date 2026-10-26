# Frozen review contract: 936-r1

Target reader: understands basic Python loops, strings and zero-based indexing.
Candidate URL: http://127.0.0.1:18770/leetcode/936/
Identity: ../candidate.json (runtime, metadata and tests SHA-256 hashes).
Author self-checks do not assign an independent score or acceptance.

Apply specs/leetcode-review-gates.md, six dimensions and weights unchanged:

| Dimension | Weight | Problem-local interpretation |
| --- | --- | --- |
| Problem/terms/hand calculation | 15 | Explain fully contained overwrites, answer order, indices, turn bound and a hand construction. |
| Causal derivation/saved work | 20 | Reconstruct reverse legality, contrast rescanning with targeted dependency updates, reject partial-match erasure. |
| State/correctness | 20 | Explain blocker counts, erasure monotonicity, arbitrary ready-window safety, queue exhaustion and reversing the answer. |
| Interaction/visual meaning | 20 | Predict an operation, inspect its counts and history, rewind/replay and distinguish erased cells from the current window. |
| Python/cost | 15 | Map one dependency decrement to canonical Python; execute a reviewer-chosen case; justify real time, storage and move bounds. |
| Bilingual/device access | 10 | Check equivalent explanations and feedback, state preservation, both locales, narrow views, zoom, focus and exact source transfer. |

Acceptance requires >=85/100, each dimension >=3/4 and zero required findings.
Separate fresh reviewer run required. Cold-walk the candidate before reading
BRIEF, source, author tests or previous findings. Record a paraphrase per section,
a fresh prediction, independently chosen case/counterexample and open findings.
After cold walk, audit official capture and exact source contracts. Keep candidate
and deployed revision separate. No publication or LeetCode acceptance is claimed.
