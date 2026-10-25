# Independent import and policy operator review — 2026-10-26

## Decision

**Changes required. Do not dispatch this reviewed revision.** The review covers prepared operator SHA-256 `0080dafb379ee39ce413fecc7b36ff80198eae6daccaddd7f0438b0146763e23`, pinned policy source `3116c71722cf4db1e2c12a7453902a6fd748b314`, and its local tests. No Pi command, source/state mutation, publication, worker launch, or signal was performed for this review.

## Blocking finding: a normal review boundary can require registration before the next agent

The runner checks STOP between phases. A successful active review sets `phase=register`, `status=review_passed`; the next loop observes STOP. Thus the intended graceful boundary may leave a legitimate deterministic registration pending. On resume, the existing runner registers that lesson, commits a new HEAD, marks it accepted, and returns without starting an agent. It then runs publication checks and advances to the following problem.

`operate.py:363` instead expects the first nonterminal problem itself to produce a fresh agent. Lines 374–380 require that problem and the policy adoption HEAD as the candidate. Both assumptions fail after ordinary pending registration: the next actual agent belongs to the following ID and starts from the registration commit. After 60 seconds the operator restores STOP despite a legitimate fresh worker, potentially stopping another stage unnecessarily.

The related threshold guard at line 347 counts only already accepted lessons. With 19 unreleased acceptances and one pending registration it passes; the ordinary resume creates acceptance 20 and can publish before the fresh-agent proof, violating this operator's no-publication transaction boundary. The ledger equality check at line 387 is too late to prevent that action.

Required correction: explicitly account for deterministic registration in the stopped checkpoint, expected next agent/candidate, and projected publication count; verify the genuine runner registration and exact allowed state/Git deltas. Alternatively fail before mutations and use a separately reviewed boundary procedure. Do not weaken independent acceptance evidence, candidate checks, or ledger preservation. An admission check on the active phase alone is racy because a phase may transition before STOP is installed.

## Independent reproduction and checks

The provided 11 local operator tests passed (1.029 seconds). They did not cover pending registration. The local runtime hashes matched the operator pins: campaign `a1258a0e7eba60e1d813bf0f9ede57a71f92cd504f6afb7bd0553d68d41c65ed`; importer `8642a573383d052ce6e227bd8c2374f9c50f2fc1e8e9b312a6186607015344e0`.

Temporary local fixture `/tmp/review-940956-register-boundary.py` executes the actual `process_problem` registration phase against an isolated Git repository, with `run_agent` patched to fail if invoked. It verifies STOP leaves registration pending, ordinary resume registers without an agent, and the operator rejects valid fresh evidence for the following problem. No remote connection or real Codex run occurs. Its successful reproduction output was:

```json
{
  "operator_expected_agent_problem": "4",
  "actual_next_agent_problem": "10",
  "registration_changed_head": true,
  "operator_candidate_check_would_pass": false,
  "accepted_unreleased_before": 19,
  "operator_threshold_guard_allows": true,
  "accepted_unreleased_after_registration": 20,
  "publication_threshold_reached": true,
  "real_codex_started": false,
  "remote_access": false
}
```

Other inspected safeguards are appropriately narrow: immutable importer/policy hashes, shared Git object-store validation, owned STOP checks, preservation of prior runs/queue/imported acceptance, exact four-path adoption, expected_head-only policy checkpoint, exact push verification, exclusive release/ownership locks, and refusal to automatically retry a failed receipt. Partial imports are retained for inspection rather than reset. These observations do not override the blocking resume defect.

## Limits and next gate

This is source and isolated-fixture evidence. Live lane acceptance, process exit, active central stage, locks, and head equality must still be checked by the corrected operator at dispatch. A corrected exact operator hash and focused red/green regressions require independent rereview before dispatch. Parent-reported changes in the current active lesson do not remove the generic register-boundary risk.


## Independent follow-up: corrected operator approved for exact reviewed dispatch

**The two required corrections are closed for operator SHA-256 `5cb088c8291af1b7efd8d84838b50d32c1f92de7c43f3007a184da057776f35d`.** This supersedes the initial rejection only for this exact revised operator. Root must separately authorize dispatch; no dispatch or Pi mutation was performed by the reviewer.

The follow-up inspected the new `resume_plan` and `verify_registered_resume` interfaces and their integration. Planning skips only the ordinary `review_passed/register` prefix, identifies the actual next agent problem, and includes pending registrations plus incoming lane acceptances in its strict below-20 projection. This is checked before STOP, again at the authoritative stopped boundary before imports, after imports, and immediately before resume. A stage transition between the initial observation and STOP therefore does not bypass the stopped-boundary guard.

The operator leaves registration to the unchanged campaign runner. It validates the resulting acceptance fields against each original problem record, preserving candidate, review records and prior report; validates single-parent registration ancestry and the deterministic registration path allowlist, commit subject and acceptance/candidate/report trailers; preserves existing registry rows; and requires the new agent candidate, saved expected HEAD and actual Git HEAD to equal the proven registration chain end. If no registration commit is needed, the unchanged cursor is permitted, matching ordinary runner behavior. Existing pending-review candidate refresh is limited to the candidate field and matches the real runner before reviewer dispatch. Prior runs, all other existing problem fields, queue, imported acceptances and release ledger remain checked. The only newly initialized problem must have the ordinary initial field set, and exactly one fresh run may be appended.

Fresh run ID, a new thread ID, a turn-start event, a native Codex descendant in the expected checkout, one central runner and exact max-rounds6/every20 flags remain required. Failure still retains or restores only the owned STOP and records an inspection-required receipt; no reset, retry, rollback of acceptance, or agent signal was added.

### Independently executed evidence

- `python3 .../test_operate.py`: all 11 original guards passed in 0.969 seconds.
- `python3 .../test_register_boundary.py`: all 6 new focused tests passed in 1.541 seconds. The fixture executes the actual runner registration branch in an isolated Git repository. It proves the next problem and changed candidate HEAD, rejects 19-to-20 registration and incoming-lane threshold crossings, rejects changed prior candidate/report/reviews and unrelated successor commits, and checks ordinary reviewer candidate refresh without rewriting review history.
- `python3 -B .../register-boundary-diagnosis/reproduce-before.py`: independently reran the preserved original scenario against the frozen original operator; it still reports expected4 versus actual10, changed HEAD, and an allowed19 becoming20. Thus the original evidence remains red-capable rather than being rewritten to fit the fix.
- Recomputed the revised operator SHA-256 after these checks and confirmed the exact hash above.

These are source review and isolated real-runner registration evidence, not a production execution claim. The temporary fixtures synthesize agent-start evidence; native process freshness must still be established on Pi by the reviewed operator. The existing guards cover exact policy bytes, import preservation, STOP ownership, dirty-checkout rejection and unexpected commit-hook changes. No broader local suite or live mutation was needed to close these two findings. The parent must dispatch only the reviewed bytes and inspect the resulting receipt, including any ordinary registration proof and fresh native-agent evidence, before claiming successful adoption and resume.
