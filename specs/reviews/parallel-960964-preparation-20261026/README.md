# Read-only preparation: #960 and #964

Prepared 2026-10-26, approximately 01:30–01:31 Singapore time. **No lanes,
checkouts, reservations or author workers were created.** No implementation,
acceptance, import, policy adoption, queue change or publication is established.

| ID | Official access | Faithful preferred interface | Central snapshot |
| --- | --- | --- | --- |
| [960](960.md) | Public statement and ordinary GraphQL HTTP 200; Hard, free | Python3 `Solution.minDeletionSize(self, strs: list[str]) -> int` | No registry/problem/run/reservation/lesson directory |
| [964](964.md) | Public statement and ordinary GraphQL HTTP 200; Hard, free | Python3 `Solution.leastOpsExpressTarget(self, x: int, target: int) -> int` | No registry/problem/run/reservation/lesson directory |

The frozen catalog records identify algorithms, official slugs and `paidOnly:false`.
They do not contain full constraints. Constraints and interfaces below are from
the newly accessed official statement/question payload, not inferred from catalog
membership. Both official payloads also expose TypeScript, so no required-native
language exception is needed; Python is available for the established lesson flow.

## Evidence and its limits

- `960-official-access.json`, `964-official-access.json`: ordinary unauthenticated
  POST to `https://leetcode.com/graphql/`, operation `questionData(titleSlug)`;
  saved response includes ID/title, difficulty, paid flag, content, examples,
  metadata and all returned code snippets. Each records request time, HTTP status,
  curl exit and SHA-256 of the original response bytes before JSON formatting.
  The normal official web reader independently exposed both statements. No
  security challenge bypass, login, paid-content access or submission occurred.
- `preflight.json`: central HEAD/expected HEAD
  `c7a325e5a48d2da000609ea93d23f8d255d03bdd`, current recorded phase #818 review,
  STOP absent; neither target has a problem record, run directory, exact-named
  reservation, tracked/runtime lesson directory or preexisting matching lane path.
  Queue indices were 197 and 198 (zero-based), not claims about remaining time.
- `catalog-and-reservation-check.json`: same HEAD; neither target is registered,
  active or recorded in central progress. All central reservation JSON files were
  checked by their stored ID as well as filename; no target match or parse error.

The process was not live-censused because this is preparation, not launch or a
claim of active execution. Current occupancy and resources can change. Official
Python/TypeScript availability is returned code-snippet/metadata evidence, not
an independently operated language-selector UI or accepted submission.

## Dispatch prerequisites — still pending here

Future lanes must start **only after the nine workflow-copy requests are adopted**
at the authorized safe boundary and the operator records a newly frozen shared
source/policy tree. Do not use this observed HEAD as implicit launch authorization
or silently follow moving main. Recheck target records, runs, registry, reservations,
existing lane paths and genuine central process identity immediately before any
later dispatch. Apply the normal resource/process/port and ownership gates then;
this preparation reserves no port or capacity.

Use the established isolated single-problem author → fresh independent reviewer
→ fix/closure workflow, with unchanged candidate/history and guarded import gates.
Keep source identity, language evidence and full teaching scope per lesson. Lane
acceptance is not central registration or publication. No launcher/helper command
is included here; the prior #940/#956 documents are historical pattern references,
not current process/HEAD authority. This remains part of the full Hard objective.
