# Read-only preparation: #975 and #980

Prepared 2026-10-26, approximately 02:55 Singapore time. **Dispatcher evidence
only:** no launcher, reservation, checkout, worker, runtime, queue or policy changes.
Both problems belong to the finite 2026-10-18 **984-Hard** snapshot.

| ID | Ordinary official payload | Preferred Python3 interface | Central snapshot |
| --- | --- | --- | --- |
| [975 — Odd Even Jump](975.md) | HTTP 200, Hard, free | `Solution.oddEvenJumps(self, arr: list[int]) -> int` | Queued; no record/run/reservation |
| [980 — Unique Paths III](980.md) | HTTP 200, Hard, free | `Solution.uniquePathsIII(self, grid: list[list[int]]) -> int` | Queued; no record/run/reservation |

Each saved `<id>-official-access.json` comes from exactly one ordinary public,
unauthenticated `questionData(titleSlug)` POST to
[LeetCode GraphQL](https://leetcode.com/graphql/). It includes official statement
HTML, examples, constraints, callable metadata, Python3/TypeScript and other returned
snippets, access flags, timestamp and SHA-256 of the original response bytes.
Python is supported without a language exception. No login, bypass, submission,
editorial fetch or live language-selector operation was performed. Referenced
statement images were not fetched or copied.

[preflight.json](preflight.json) records central HEAD/expected HEAD
`263ebb65069e827fb935cd2dc7130803d14ce3ee` at **02:55:05 SGT**. Both IDs are in the
984-entry queue at zero-based positions 201/202, but absent from the registry,
problem records, run records/directories, reservations by filename or stored ID,
tracked/runtime lesson directories and matching lane paths. Reservation reads
had no errors. Central's recorded stage was #828 review; STOP was absent. This
was a bounded state census, not proof of central process liveness or a port/capacity
reservation. Recheck target absence and genuine process/resource ownership later.

**Future dispatch waits for #968/#972 acceptance and guarded import at their safe
boundary.** Any later launch needs separately reviewed exact live pins and shared
base; this observed HEAD is not a launch instruction. No author-context injection
is promised: these notes remain dispatcher evidence. Standard authors independently
verify official contracts, develop the lesson under reviewed design/brief rules,
and receive fresh independent candidate review. Notes below are instructional-risk
triage, not supplied proofs, implementations, tested algorithms or acceptance.
