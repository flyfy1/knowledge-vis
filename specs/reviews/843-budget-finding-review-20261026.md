# Independent adjudication: 843-BUDGET-R1

Date: 2026-10-26. **Required new-candidate repair is justified.** The request is appropriately bounded and does not need a universal minimax guarantee or a new judge API. This assessment neither changes historical acceptance nor closes the defect.

## Contract and exact evidence

Affected candidate: `617cb7c7e49f533b46c66dc9a53e7c6cefd71cbf`. A read-only `git show` on the central Pi object independently confirmed canonical SHA-256 `dc0d1552f34cc429efa9f3ff12daf0c9c42f6ca5604d97ae64dc42aa2b7bff30`, matching the archived executable. The source's fixed `range(10)` is intentional and documented, but that establishes a cap rather than original-task completion.

The [official statement](https://leetcode.com/problems/guess-the-word/description/) was independently accessible in this review. It requires an actual call guessing the secret within a per-case budget between 10 and 30, while retaining the qualification that generated cases admit a reasonable non-brute-force strategy. The saved official GraphQL response hash matches `d8e324bb043388237b057944abddf296b3e449359798fa3619189dad1e9a6f85`; its Python3 snippet accepts only `words` and `master`. Testcase metadata containing `allowedGuesses` is not a submission parameter or permission to inspect private Master fields.

Following the diagnosing-bugs discipline, I first ran the archived real-callable reproducer on all 22 secrets with budget 11. It returned exit 1: 20/22 found, maximum ten calls, `ammmmm` and `bmmmmm` left as correct but unguessed singletons. Before a differential check, ranked hypotheses were fixed-cap truncation, spy-judge distortion, then probe/filter error. The archived spy already checks full-history survivors and each minimax choice.

I then used a [separate plain Master](843-budget-adjudication-evidence-20261026/plain-judge-check.py), with no frame/local-variable inspection and no budget argument supplied to the solution. [Results](843-budget-adjudication-evidence-20261026/plain-judge-result.json): frozen source again finds 20/22; changing only the cap to 11 in memory finds 22/22, maximum 11. This corroborates premature termination without depending on the original spy's internal observations. The diagnostic is not a production repair.

## Generated-case qualification

The paired family is an informative finite witness, not the weak repeated-letter case. With 22 words `group + c*5`, groups a/b and eleven suffix letters c..m, any first legal probe has reply buckets of sizes **10, 10, 1, 1** (the last is the successful reply). After a size-ten reply, all surviving words share their first letter and differ in their repeated suffix. Every legal probe can then distinguish at most one member from the rest. In the worst case all ten remaining words require calls, including the last inferred singleton: **11 total is sufficient and unavoidable for this family**. The feedback strategy initially eliminates half the list and achieves this bound; it is not a blind enumeration of all 22 words.

This supports the reasonable-strategy qualification far better than merely satisfying scalar constraints. It does not prove this list occurs among hidden tests or formalize the judge's undefined classifier. The analogous 20/24 families support the adjacent finite bounds of 10/12; their archived all-secret results corroborate those bounds. `repeat11` is diagnostic-only and should not carry the required finding. None of these facts establishes a worst-case bound for arbitrary minimax inputs.

## Repair-request adjudication

The inspected [request](843-review-budget-request-20261026.md) preserves the official callable, forbids a private budget getter, distinguishes actual success from singleton inference/exhaustion, requests budget-sensitive all-secret regressions, and identifies the affected core loop, bilingual limits/costs, metadata and exact source surfaces. Those are appropriate consequences of a changed termination strategy. The existing honest heuristic disclaimer does not resolve this demonstrated avoidable failure.

Do not equate “at most 30 calls” with compliance on a ten-call case, claim that changing the constant proves all cases, or demand that the author solve arbitrary lists excluded by the generated-case qualification. Verify actual counted success on the finite 10/11/30-budget fixtures and state precisely what the selected strategy establishes. The request already draws these boundaries; no additional required change to its scope is needed.

A new frozen candidate and fresh independent review must explicitly close 843-BUDGET-R1 before corrected publication readiness is claimed. Preserve the original 97.5 review and acceptance as historical evidence; do not overwrite scores or treat this adjudication as a repaired implementation. No lesson/state/operator/policy edits, STOP, commit or publication were performed. Only the tiny 22-secret checks above were rerun; no broad benchmark or whole-lesson review was repeated.
