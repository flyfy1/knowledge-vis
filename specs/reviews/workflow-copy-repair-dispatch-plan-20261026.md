# Workflow-copy repair dispatch plan — 2026-10-26

**Preparation only; not a dispatch or acceptance record.** Reuse the existing
continuous runner and the [reviewed #239 reopening precedent](239-navigation-maintenance-review-20261025.md).
Scope: **780, 793, 798, 801, 815, 903, 920, 940, 956**, using the
[nine finalized requests](workflow-copy-repair-requests-20261026/README.md).
No new maintenance framework, publisher change, lesson edit, or runtime write is
part of this plan. The historical #239 helper is evidence, not executable authority
for these IDs or current HEADs.

## Preconditions

1. The prior import/policy operator has completed with its receipt and fresh-agent
   proof inspected. Both imported lane acceptances and their histories are retained.
   Verify the central policy bytes match the reviewed four-file adoption from
   `3116c71722cf4db1e2c12a7453902a6fd748b314`; each new repair run must read that
   adopted policy. Do not overlap an unfinished operator or interrupt an active agent.
2. Freeze and commit the finalized request files, then independently review the
   exact one-off transition before dispatch. At the next owned graceful boundary
   after the active stage (currently proposed after #818's stage), require the
   old runner and native children to have exited, acquire existing checkout/runner
   ownership and release locks, and validate clean exact HEAD and saved expected
   HEAD, owned STOP, full 984-ID queue, and `releases.json.pending == null`.
   Stage IDs and HEADs must be re-observed; these planning values are not pins.
3. All nine targets must be `accepted_local` / `done`, with exact accepted candidate,
   report and lesson hashes reconciled against their requests. If #815 or any other
   target is still in author/review/fix/register, preserve its ordinary phase and
   wait for genuine acceptance; do not manufacture acceptance or overwrite active
   work. Confirm preserved review-round counts are compatible with max6; never
   reset rounds or histories to obtain a fresh budget.

## Minimal stopped-state transition

Adopt only the pinned repair-request documents into central Git and record the
resulting commit. For each selected entry, retain `candidate`, `reviews`, `rounds`,
`author_runs` and every unrelated field. Retain prior `accepted_at` and
`registration_commit`, together with the old `prior_report`, in the append-only
maintenance receipt before removing the two current-acceptance fields. Set only
`status=changes_required`, `phase=fix`, and `prior_report` to that ID's request.
Historical acceptance remains evidence; it does not accept the upcoming diff.

Preserve every other problem entry, all prior runs, the complete queue/order and
release-ledger bytes. Record the previous completed `current` value before clearing
that stale pointer; retain the paused problem's phase and candidate. Set
`expected_head` to the request-document commit and keep status stopped. Validate
these exact deltas and a clean checkout before completing the receipt. Use existing
atomic state saving and ownership helpers. Do not create copies of old runtime
content, reset Git, rewrite prior reports, or alter successful release receipts.

Remove only the owned STOP, then invoke the existing launcher once with
`--continuous --max-rounds 6`; verify effective `--publish-every 20`, one runner,
and genuinely fresh run/thread/turn/native-child evidence. The ordinary runner
starts at the earliest reopened ID in the retained queue, repairs those entries,
and resumes the paused later entry. If interruption or launch failure occurs,
retain the receipt and actual state for inspection; do not blindly rerun the
transition or launch a second worker.

## Candidate and reviewer closure

The existing [process_problem](../../scripts/leetcode_campaign.py#L329) fix → review
→ registration path performs all lesson changes and acceptance. The author follows
the per-ID request and records its stable `COPY-R1` ID/link in append-only BRIEF
notes so the fresh reviewer can locate it after the cold walkthrough. Keep the
specified algorithm, trace, canonical solution, source mirror and style bytes
unchanged; preserve meaningful simulation/interface limits. #956 retains its
local/no-upload/no-online-submission wording.

Each ID needs a distinct fresh reviewer through [run_agent](../../scripts/leetcode_campaign.py#L215),
with the usual frozen candidate, new report/evidence location and session checks.
Inspect its explicit `COPY-R1` closure against that candidate: actual zh→en→zh
binding, preserved limits and state, absence of replacement acceptance claims,
console/missing-key checks, and affected page-end layout at 320px/200% zoom.
Generic `accepted` JSON or a text grep alone does not establish that closure.
Preserve prior reports and scores; apply the existing rubric and revision rules.

## Publication behavior

No special publication action is needed. [Acceptance validation](../../scripts/leetcode_publish.py#L148)
requires fresh independent evidence and the unchanged accepted lesson tree.
[Prospective selection](../../scripts/leetcode_publish.py#L485) observes changed
accepted candidates; [eligibility](../../scripts/leetcode_publish.py#L498) compares
runtime-plus-registry digests against released receipts. Therefore a changed,
newly accepted #780 is eligible again and occupies one of the normal 20 slots.
Its old public version remains until the replacement passes the existing HTTP and
browser verification. An unchanged runtime digest does not trigger redeployment.

After verified delivery, [receipt updates](../../scripts/leetcode_publish.py#L417)
replace the current per-ID pointer and append release history; revising #780 does
not increase the unique released-ID count. Do not calculate repair eligibility as
accepted-count minus released-count. Keep every20, without batch1, early flush,
rewritten pending payloads or direct public edits. A pending release must be resolved
before reopening because startup replays it before selecting new candidates.
Implementation, independent closure and verified public delivery remain separate
completion checks.
