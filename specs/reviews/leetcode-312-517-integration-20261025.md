# Reviewed lesson integration — 312 and 517

Date: 2026-10-25. Frozen campaign snapshot:
`faf67b5c535f9e95ed8d852043301477f84a90ae`.
Local parent: `2876adc`.

## Independent acceptance and integration

#312 passed round 4 at 88.75/100 with no required findings open:
[report](312-review-4-f81a9a96.md). The zero-containing preset now advertises 12,
and the proof separates feasible side orders from optimal side orders. Earlier
index and source-transfer corrections were rechecked; failed reports remain intact.

#517 passed its separate reviewer at 95/100 with no required findings open:
[report](517-review-1-75154298.md). Its two bottlenecks are boundary traffic and
one machine's outgoing work. Legal simultaneous moves and the algorithm's scan
are explicitly separate demonstrations. The guarded importer preserved the exact
candidate, original author/reviewer sessions and existing central entries.

The local merge preserves every previous collection entry. It adds #517 and the
newly completed registration of #282: 73 previous entries become 75. An initial
integration assertion expected only #517 and failed; inspection established that
#282's registration occurred after the prior frozen snapshot. No existing entry
changed or disappeared. The corrected check verifies exactly those two additions.
The complete #282, #312 and #517 lesson directories match the frozen snapshot.
No unrelated main-branch content or user-owned untracked pages was changed.

## Rerun evidence

- #517: 415 independent simultaneous-move BFS comparisons; 11 official/large
  cases; visible baseline and hand-built move schedule checks passed.
- #517 browser core: 415 oracle comparisons, 856 intermediate invariants, exact
  canonical-source mirror and bilingual-copy checks passed; CSS is 11,496 bytes.
- #312: exhaustive small first-burst oracle comparisons, fresh examples,
  n=300 closed-form boundaries and input nonmutation passed.
- Both non-mutating metadata preflights passed.
- Merged collection: 137 browser checks passed across EN/ZH, keyboard/navigation,
  narrow layouts and synthetic 100/984-entry registries. The temporary HTTP
  server logged client-disconnect BrokenPipe errors during navigation; the
  completed browser report recorded no page errors or failed asset responses.
- The dispatcher inspected the frozen #517 English narrow header, including its
  prominent number and distinct official-problem link.
- `git diff --check` reported existing trailing whitespace in the reviewed
  #517 provenance note; it was retained to preserve the frozen candidate bytes.

Temporary rerun outputs: `/tmp/leetcode-integration-517-20261025` and
`/tmp/leetcode-integration-517-collection-20261025`.
These checks supplement the candidate-specific independent reviews; they do not
establish physical-device quality or actual novice comprehension.

## Release boundary

After resumption and registration, the central campaign recorded 74 accepted-local
lessons. #483 was in independent review and #493 in isolated development. Neither
draft is granted acceptance by this integration. The proposed worked-example spec
clarification is separate work and has not changed those active candidates' policy.

The every-100-additional-accepted publication threshold has not been reached.
This source merge and GitHub synchronization are not public deployment.
