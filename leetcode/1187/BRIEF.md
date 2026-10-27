# Problem 1187 lesson brief

Category: algorithms / university. Target reader knows arrays, sorting, and maps. Author run only; independent review is a separate required run.

Learning loop: hand-check `[1,5,3]` → expose exponential keep/replace baseline → derive `dp[last]` invariant → sort/deduplicate `arr2` and choose the smallest feasible replacement → step a deterministic trace → map each transition to the official Python `Solution.makeArrayIncreasing` interface.

| Step | Known | One question | Input/output | Action and observation | Conditions |
|---|---|---|---|---|---|
| 0 | arrays and `<` | why does one replacement matter? | `[1,5,3]`, `[2,4]` → 1 | read the failed adjacent comparison and repair | strict means every adjacent pair; reuse of arr2 values is allowed |
| 1 | keep/replace choices | what state must survive? | prefix → minimum cost per last value | compare `[1,5]` ending in 5 vs 2 | same last value keeps only minimum cost; different last values remain |
| 2 | state invariant | why smallest greater replacement? | sorted unique arr2 → successor | inspect boundary found by binary search | nonnegative order only; candidate must be strictly greater |
| 3 | recurrence | can you predict a frame? | examples → state trace | predict, reveal, step/reset/end | simulation is not submission execution |
| 4 | all transitions | how does it become Python? | official method → source | copy/download/read source | constraints n,m≤2000; O(nm log m) time, O(m) space |

New terms: strictly increasing (every predecessor is smaller), prefix (first i positions), state `dp[last]` (minimum replacements ending at `last`), deduplicate (remove repeated values), binary search (locate the first value past a boundary), invariant (true after every processed position).

Official evidence: LeetCode page was opened 2026-10-27 Asia/Singapore; statement, operation, examples, and constraints are captured in `tests/evidence/official-source.md`. Python is the default faithful interface; no non-Python language contract is needed. The lesson simulation is deterministic and separate from executing the source.

Author checks are recorded in `tests/evidence/SELF-CHECK.md`; no independent acceptance is claimed.

Status record: author implementation and self-check complete; independent review run `/root/review_1187` completed with the evidence in `tests/evidence/INDEPENDENT-REVIEW.md`. No independent acceptance or publication is claimed.
