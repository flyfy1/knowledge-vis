# Read-only next-pair preparation: #992 and #995

Prepared 2026-10-26. **Dispatcher evidence only; no launch or author-context
injection.** Both targets belong to the finite 2026-10-18 snapshot of 984 Hard
problems. No lesson, prompt, active specification, queue, reservation, runtime,
worker or Pi file is changed. No commit/push is performed by the preparer.

| Problem | Verified interface | Queue observation |
| --- | --- | --- |
| [#992 — Subarrays with K Different Integers](992.md) | Python3 `subarraysWithKDistinct(nums, k)`; TypeScript also available | Index 205; no record/run/reservation |
| [#995 — Minimum Number of K Consecutive Bit Flips](995.md) | Python3 `minKBitFlips(nums, k)`; TypeScript also available | Index 206; no record/run/reservation |

[preflight.json](preflight.json) records a bounded read-only census at **05:34:30
SGT**: actual/saved central HEAD `f6e2500dc87fe0a50a3258af80bf46d761ca1be8`,
recorded #843 review, queue 984, STOP absent. Neither target has a problem record,
run record/directory, matching reservation, lesson directory, lane checkout/state
or branch. The #982/#987 lane states record their authors running. These are dated
state observations, not native-process liveness proof or future launch pins.
Recheck eligibility and the ordinary acceptance/import boundary before any future
dispatch; this preparation authorizes none.

Each `*-official-response.json` retains the exact bytes of one ordinary public,
unauthenticated LeetCode GraphQL response. Its access wrapper records URL, request,
timestamp, HTTP status, SHA-256, byte length, returned statement HTML, examples,
constraints, full language snippets, callable metadata, tags and frozen catalog
entry. Both returned HTTP 200, nonempty statements, Hard and free. Ordinary public
problem pages were also readable. No account, private endpoint, access bypass,
editorial, submission, execution on LeetCode or browser language-selector operation
was used. Public snippets verify interfaces; they do not establish performance,
lesson quality, accepted submissions or delivery.

[check-examples.py](check-examples.py) independently enumerates contiguous
intervals for #992 and performs literal binary-state BFS for #995. Its 16 tiny
checks include all five official examples and eleven original distinguishing
cases. [example-checks.json](example-checks.json) records exact interval sets and
one shortest flip sequence where possible. These are small-example arithmetic
checks, not candidate implementations or canonical performance tests.

Notes identify provisional teaching/review risks: exactly-k versus at-most-k and
positional multiplicity for #992; overlapping parity, forced choices and window
expiration for #995. They do not prescribe an author's algorithm or inject context
into author prompts. Future authors independently obtain official contracts and
follow existing design and independent lesson review. No extra worker, policy
adoption, launch template or reservation is requested.
