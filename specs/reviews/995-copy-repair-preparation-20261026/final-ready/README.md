# Final queued #995 copy-repair handoff preparation

Status: frozen for independent final review; **not dispatched**. No Pi files, STOP, queue, ledger, workers, source, or policy were modified by this preparation. The reviewed disabled proposal in the parent directory is unchanged.

The final operator differs from the disabled proposal in exactly two constants: the completed previous owner (`import992995-only-20261026-888bb6ac`) and the hash of this directory's `pins.json`. See `two-constant-diff.patch`. The operator now has concrete executable pins, but still requires separate root authorization after final independent review. Nothing here authorizes running it.

## Actual captured inputs

Read-only capture completed at 2026-10-25 22:52:53 UTC, after importer PID 1810489 exited. The raw previous receipt is `previous-import-receipt.json`, SHA256 `3a147fcf48a32cde5414d7da7e861776728b164b0918639d70c97a079906de2a`. Its `imports` entries actually use `problem_id` and both have status `completed`. Its final state is `completed-resumed`, with ledger preserved and pushed head `d9d7989e9952749a83a80cdde4ce1d6b2c5f7c78`.

At capture, the same head was the saved central checkpoint. Runner 1851151 and native Codex 1851411 were live in the central checkout, with run `864-review-7fed1ec4a8a0`, session `01a17542-763c-7103-a644-a510f6ac1932`, fresh thread/turn events and the corresponding final-output path. STOP was absent; no lane checkout processes remained; reservations were imported or canceled. These are observations, not a promise that the central worker stays in this phase. The unchanged operator reads and guards the actual ordinary boundary and resume plan.

`pins.json` binds the **imported** #995 accepted entry, review/report, lesson tree and every tracked lesson file, and the full relocated run records including both original `source_directory` and central `directory`. Original 95/100 acceptance, candidate `d84cfb5265103d6d321fdc3f0d5dd4b3e17ac13c`, review history, remaining round budget and old lane provenance remain preserved. No acceptance or lesson content was edited during capture.

The singleton request is `specs/reviews/995-teaching-copy-repair-request-20261026.md`, read from exact local source commit `f090946dfb330ae3eb4a423b1ad3b367b83d8890`, SHA256 `e68c8e47386c982e7545212213fcdc3905a4270a6f885ff474484d8a0290270b`. No Pi fetch occurred. Eventual dispatch would fetch and verify that fixed source through the already reviewed operator.

## Queue and publication proof

The real `reopen.transition` and `resume_plan` were exercised in memory against captured state. The finite 984-ID queue stayed unchanged; only #995 becomes `changes_required` / `fix`. At this observation, the actual-next plan remains #864, not #995. At a later boundary ordinary pending registration may occur first, followed by the actual next ID selected by the unchanged queue. The operator verifies that plan and fresh session/native evidence; it does not prioritize #995.

The actual publisher `_reviewed` API returned seven currently eligible IDs: 854, 857, 862, 982, 987, 992, 995. The projected queued reopen removes #995 from eligibility. The conservative upper bound remains seven including the reopened ID, below twenty. Ledger SHA256 was `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`, with 138 released entries, no pending release, and #995 unreleased. Dispatch rechecks bounds before STOP, at the natural boundary and before resume; these capture counts do not replace live guards.

Future #996/#1000 preparation must bind the **queued-repair handoff's actual completed-resumed receipt and pushed head**. The earlier import-only head is insufficient because this request participates in the shared tree. No next-lane dispatch or BASE is established here.

## Validation

`python3 -B specs/reviews/995-copy-repair-preparation-20261026/final-ready/test_final.py` passed all 14 tests: the prior 11 safety/real disposable Git tests against the final operator plus exact two-constant adaptation, actual receipt schema/source binding, and captured imported-history/queue/publication evidence checks. `runtime-readonly-observation.json` records the actual read-only proofs; `capture-readonly.py` and its output retain the collection method. These tests do not simulate an actual authorized Pi dispatch.
