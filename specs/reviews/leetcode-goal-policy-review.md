# All-Hard goal policy implementation review

Date: 2026-10-18. Independent reviewer: `/root/goal_policy_review`.
Scope: canonical-language fallback, detailed teaching requirements, campaign
publication integration, and the batch publisher. This is an implementation
review of orchestration policy, not an independent acceptance review of any
future lesson and not evidence of a production release.

## Requirements checked

- Keep all 984 catalog records in scope, including inaccessible and unresolved
  records; queue exhaustion with blockers is not completion.
- Prefer a faithful official Python interface, then TypeScript, then the
  original required language. Verify that choice against the official interface.
- Require concrete, gradually developed examples, causal explanations, a fresh
  transfer exercise and counterexample; test counts do not prove teaching quality.
- Preserve a separate fresh reviewer, frozen candidate and the existing scoring
  thresholds for every lesson.
- Publish every 100 newly accepted unreleased problems, with the final remainder
  only after every catalog problem is accepted. Only #51/#52 form the released
  acceptance baseline; 11 historical public lessons still carry review debt.
- Preserve unrelated production pages, never count failed verification as a
  release, and retain review/manifest evidence without old production copies.

## Independently executed checks

- `python3 -m unittest discover -s scripts -p 'test_leetcode_*.py' -v`:
  29 tests passed in 23.546 seconds. Covers language selection and parity,
  registration validation before writes, candidate freezing, review mutation,
  independent run identity, process cleanup, locks, resumption and incomplete
  queue outcomes. These use disposable fixtures, not actual lesson acceptance.
- `python3 -m unittest discover -s scripts -p 'test_campaign_publication.py' -v`:
  6 tests passed in 6.951 seconds. Uses actual fake-CLI campaign runs and a mocked
  publisher to verify clean phase boundaries, default batch size, full-catalog
  final flush, no partial/blocker flush, failed-publication stop and STOP behavior.

- `python3 -m unittest discover -s scripts -p 'test_leetcode_publish.py' -v`:
  final 17-test suite passed in 49.649 seconds. Covers 99/100 threshold, unique
  counting, legacy review debt, failed verification and replay, staged corruption,
  complete-catalog remainder, metadata/candidate/report changes, native sources,
  provenance exclusion, symlink boundaries, ownership locks and crash cleanup.
  Public hash verification uses a real local HTTP server; most release mutations
  use disposable production roots and a mocked browser/public verifier.
- The seven registry tests were rerun after the final UTF-8 byte-parity change:
  passed in 0.919 seconds. Across the three suites, 52 distinct tests passed.
- Read-only public checks: #51 HTML/app bytes match baseline `8bfc3f4`; the exact
  final browser verification function passed collection and #51/#52 navigation,
  both locales, visible IDs and official links. It reported two lessons checked
  and zero ignored beacon failures. No public files were modified.

The language contracts require dated, nonempty lesson-local evidence and exact
canonical-source/offline-mirror parity. Automatic validation cannot establish
that an author listed every officially supported interface; the separate reviewer
must independently inspect the official source. The prompts make that limitation
explicit and require execution of the canonical source, including TypeScript
compilation or original SQL semantics. Historical Python lessons remain compatible.

## Required findings and disposition

### GP-1 — Publisher reads different run field names from the actual runner

Initial `_reviewed` used `runs[].run_id` and `thread_id`. `run_agent` writes
`runs[].id` and `session_ids`; actual accepted state would fail before publishing.
Required: use the actual ledger schema and test against that schema, including
independent completed reviewer identity. Reported to the implementation agent.
Status: closed. Publisher uses the actual `id` / `session_ids` schema, requires
a completed reviewer bound to the candidate, and rejects author-session reuse.
Disposable real-schema accepted-state publication and negative identity tests pass.

### GP-2 — Native canonical downloadable source excluded from publication

The initial source suffix allowlist omitted `.sql`, `.sh`, `.java`, `.cpp`, `.c`,
`.cs`, `.go` and `.rs`, even though the reviewed language table supports those
official interfaces. The collection could publish while canonical downloads were
absent. Required: publish the actual canonical source files and test a native
language fixture. Reported to the implementation agent.
Status: closed after native-source and provenance selection checks. The suffix
set derives from `LANGUAGE_FILES`; SQL source ships. Lesson metadata, the language
contract and its exact referenced official-evidence file are excluded, while
ordinary runtime JSON remains eligible. The corresponding fixture tests pass.

### GP-3 — Successful-release crash window retains old staged content

The initial publisher cleared `pending` durably before deleting its staging
directory. A crash between those actions left a completed release's content on
disk indefinitely; the next run did not clean it. Staging before pending was
saved had a similar orphan window. Required: locked startup recovery must remove
only this publisher's completed/orphan stages while preserving a valid pending
stage, with crash-window regression evidence. Reported to the implementer.
Status: closed. Locked startup removes this publisher's orphan/completed staging
directories while preserving pending staging. Simulated post-receipt cleanup
failure and pre-ledger orphan recovery tests pass; retry does not double count.

### GP-4 — Standalone publisher does not acquire campaign ownership locks

The module documents that its caller owns the checkout lock. The initial CLI
entry point called it directly without either campaign lock. A concurrent runner
could change the working registry after the initial clean-HEAD check, invalidating
the phase-boundary contract. Required: the standalone entry point must acquire
the same checkout/state ownership locks before reading state and publishing, or
must not offer a standalone mutating path. Reported to the implementer.
Status: closed. CLI acquires the same checkout and state locks before reading
progress. The subprocess regression proves an active campaign checkout lock
prevents publication and creation of a release ledger.

### GP-5 — Public navigation waits for unrelated network quiescence

The exact initial publisher `BROWSER_CHECK`, run read-only against current public
#51/#52 with the installed Playwright runtime, timed out after 30 seconds in
collection `page.goto(..., waitUntil: 'networkidle')`. A follow-up against the same
URL/browser using `domcontentloaded` returned HTTP 200, found card #51 and read
the correct page title. Requiring global network quiescence is not an application
readiness check and prevented delivery verification in the actual environment.
Required: bounded DOM/application readiness plus actual functional checks and
local-asset error detection; retain honest accounting for the exact documented
Cloudflare beacon exception. Reported to the implementer.
Status: closed. The unchanged public #51/#52 pages pass the revised exact browser
gate with DOM readiness, visible application elements and bounded first-party
resource settlement. Result: `{"lessons":2,"ignoredKnownBeaconFailures":0}`.
The narrowly identified beacon exception is counted separately; this is not a
claim that every production request is local.

## Current conclusion

Language policy and the campaign publication seam have no open required findings.
All five required findings are closed against the reviewed source and observed
checks. Cleared for policy integration and the normal gated batch workflow.
The filesystem strategy uses atomic replacement of individual files; it is not
an atomic switch of an entire website. An interrupted release can temporarily
serve a subset of new bytes, remains pending, and is replayed before another
batch. Public verification must succeed before released counts advance.

No 100-lesson production publication was performed during this review. The
100-item counter/recovery tests use disposable roots and a verification adapter;
actual public browser evidence covers the already-published #51/#52 only. The
first real batch still requires its own full public hashes and browser receipt.
Future lesson acceptance cannot be inferred from this orchestration review.

## Reviewed implementation identity

SHA-256 of implementation files after final verification:

- `scripts/leetcode_publish.py`: `1fb79908e4237254235ff1ea6a250c3da092276e267d25e1e1c833dd747540a0`
- `scripts/test_leetcode_publish.py`: `845226e61fbad8c4bfd6ab6bd2c7a2d7fac26aa1eebca67aa8a496864c5ea79c`
- `scripts/leetcode_campaign.py`: `9c1777d2577b5b75c86ca70505cd04ac5caafdfb23bbb47f631996a9336669df`
- `scripts/register_leetcode_lesson.py`: `4781874494cdbb6820c9ab3f741655c6a4c8ff1715808c8b5b09a108fcb5c71a`
- `scripts/campaign-prompts/author.md`: `144e9da5cceeff2c17f1a753dd64a5a99921249e5388a694f377e6002262080d`
- `scripts/campaign-prompts/fix.md`: `e6efd0a68f1c2825bc69c851d03112c32595b50d99ba2dc340f74a3cc316fb96`
- `scripts/campaign-prompts/review.md`: `cba57039147e4d87c274a7819672727a8754433a3c3f310e87abb686eb1a8c25`
