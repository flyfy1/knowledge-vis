# Independent review: 239 navigation maintenance transition

Reviewer: separate `clipboard_policy_review` agent. Verdict: approved with
limitations; no required code changes. This reviews the one-time state transition,
not the lesson candidate or publication readiness.

Reviewed helper SHA-256:
`61777300070ea6428c067cf09ff94b6f1b2962914643c4969a5655a3b09e80a3`.

The helper holds checkout and runner locks, validates the stopped exact HEAD and
owned STOP, and checks #736 is awaiting review. It requires the previously accepted
#239 candidate and three-review history, plus the completed first-100 release and
no pending release. It preserves all 984 queue entries, all runs, other problem
entries including #736, and release-ledger bytes. Prior #239 acceptance timestamps
and registration are retained in the maintenance record; its previous candidate,
reviews and rounds remain. The reopened entry uses the normal fix, separate review
and registration workflow.

## Interruption boundaries

- Before the Git commit, inspect restored/staged paths and the prepared receipt;
  do not blindly rerun.
- Between commit and progress save, HEAD and saved state disagree. STOP remains;
  reconcile under the existing locks before restarting.
- After completed state and before launch, retain the completed transition and
  invoke the existing launcher separately. This one-time helper is not retryable
  after that point.
- A launcher error does not roll back reopening.

The reviewer did not independently inspect live launcher configuration or execute
the helper. The dispatcher subsequently read the Pi launcher: `--continuous`
derives all 984 catalog IDs, uses the established production root/public URL and
`--publish-every 100`, and omits `--run-count`. Its existing environment provides
Node and Playwright. The Pi helper hash matched the reviewed hash before execution.

## Dispatcher execution

Executed at 2026-10-25 07:14:10 UTC after the original runner and author processes
had exited normally at the owned STOP boundary. #736's author candidate was
`e0c84ff15965900aa1edbbe319355fd127bc10d5`, with phase `review` and status
`review_pending`. Its author self-check reported 2,037 numerical cases and 45,769
trace frames, plus bilingual browser/source checks; independent acceptance remains
pending.

The [completed receipt](239-evidence/navigation-maintenance-20261025/reopen-receipt.json)
records central commit `539c2429437ec4f0330be19d30e9289f42f3671c`, preserved prior
acceptance, and the backup location. The [exact helper](239-evidence/navigation-maintenance-20261025/reopen.py)
is archived for audit, not for blind reuse. A subsequent read confirmed receipt
status `completed`, no STOP file, all 984 queue entries, #736's unchanged review
phase/candidate, all three previous #239 reviews, 103 released campaign lessons,
and no pending release. Original continuous runner PID 870456 and child PID 870516
were live; #239 was executing fix run `239-fix-408b956cd665`.

The dispatcher also inspected the ordinary public URLs for #84/#step1 and
#327/#step1 in the in-app browser. Their rendered Chinese sections respectively
explain stack pops settling rectangle boundaries and `P[j] - P[i]` obtaining a
range sum. The public collection still showed 104/104 lessons. These observations
validate the intended destinations, not the as-yet-unreviewed replacement links.

The user reaffirmed that Premium access is unavailable. #158 remains blocked
with its recorded official-access evidence, while accessible lessons continue.

This transition is complete. The navigation candidate still needs a separate
review and normal batch publication; #736 still needs its independent review.
No historical acceptance score, public receipt or successful counter was rewritten.
