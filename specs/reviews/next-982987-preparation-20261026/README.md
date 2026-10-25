# Read-only next-pair preparation: #982 and #987

Prepared 2026-10-26. **Dispatcher evidence only; no launch or author-context
injection.** Both IDs belong to the finite 2026-10-18 catalog of 984 Hard problems.
This preparation changes no lesson, prompt, active specification, queue, runtime,
reservation or worker. No commit/push is performed by the preparer.

| Problem | Official access / preferred interface | State observation |
| --- | --- | --- |
| [#982 — Triples with Bitwise AND Equal To Zero](982.md) | Public/free Hard; Python3 `countTriplets(nums)`; TypeScript also available | Queue index 203; no record/run/reservation |
| [#987 — Vertical Order Traversal of a Binary Tree](987.md) | Public/free Hard; Python3 `verticalTraversal(root)`; TypeScript also available | Queue index 204; no record/run/reservation |

[preflight.json](preflight.json) is a bounded read-only Pi census at **04:32:20
SGT**: central actual/saved HEAD `96e82a2f927f7506f2dd97956f1b837e67c9df1e`, recorded
#839 author, queue length 984, STOP absent. Both target IDs have no problem record,
run records/directories, matching reservation, lesson directory, lane checkout,
external lane state or lane branch. This is not worker-liveness proof, resource
reservation, import approval or a future launch pin. Recheck after the current
#975/#980 pair completes its normal acceptance/import boundary.

Each `*-official-access.json` contains exactly one ordinary unauthenticated public
GraphQL response fetched for that problem, including original statement HTML,
examples, constraints, full returned snippets, callable metadata, tags, access
flags and the frozen catalog entry. `*-official-response.json` retains the exact
response bytes so the recorded SHA-256 and byte count can be independently checked.
Both requests returned HTTP 200 and nonempty statements; Python3 is supported
without an exception. Ordinary public problem pages were also readable.

No login, private endpoint, paywall bypass, editorial, submission, execution on
LeetCode, or browser language-selector operation was performed. Interfaces are
verified from the public GraphQL code snippets/metadata. Referenced statement
images were not downloaded. Accessibility of a public statement does not prove
runtime performance, teaching quality, independent acceptance or public delivery.

#982 notes explicitly separate counting correctness from Python worst-case cost,
and propose frequency aggregation/subset sums only as a direction for authors to
derive and measure. #987 notes distinguish value ties from traversal order and
preserve duplicate occurrences. The notes contain original small teaching cases
and provisional review questions; they are not implementations or supplied proofs.
Standard future authors still obtain official contracts independently and follow
the existing reviewed design/brief and fresh independent review/repair workflow.
No prep-file adoption, prompt modification or additional worker is requested.

Root independently checked the original teaching examples on 2026-10-26: direct
ordered-triple enumeration for #982 and queue-parsed sparse-tree cases for #987.
[root-example-checks.json](root-example-checks.json) records the reported results
and full outputs. This checks small-example arithmetic/serialization only; it
does not establish a canonical implementation, resource behavior or lesson acceptance.
