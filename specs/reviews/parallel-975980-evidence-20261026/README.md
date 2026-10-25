# Final #975/#980 launch parameters — awaiting root review

Prepared 2026-10-26 after the Stage B `completed-review-running` receipt. **No
dispatch, remote file write, checkout, reservation or policy adoption performed.**
Root must independently review this exact launcher and authorize any later dispatch.

Final [launch.py](launch.py) SHA-256:
`467f08885a37290419486c26d25b9e379acf86541d7dab854389513982e7c5bb`.
Its approved #968/#972 source hash is
`012137ab9eabb43cb6b9038ab6065312d8287724540d67fb362038ac4a5caa05`.
Six substitutions resolve the previously reviewed pending template; nine non-identity reverse
substitutions restore the original launcher byte for byte and AST for AST.
See [pending-to-final.diff](pending-to-final.diff),
[parameter-only.diff](parameter-only.diff) and [parameter-map.json](parameter-map.json).
No control flow, gate, prompt, review rule or publication argument changed.

## Exact observation and immutable base

[Read-only preflight](preflight.json), executed through SSH with `python3 -B -`
from local [preflight.py](preflight.py), passed at **04:21:21 SGT**. The captured
Stage B receipt completed at 04:13:35 SGT and is included verbatim in the JSON.

| Field | Frozen value |
| --- | --- |
| Immutable BASE | `2b1cd8cfe14432d1e8d78433f080b1bdaeaf32ba` |
| Observed actual/saved central HEAD | `3dcefbc04619ae11869ea34581ea71c38daee06c` |
| Central current | #834 review, `834-review-9b08bcf5feee` |
| Session | `01a174b7-97c6-7e71-81a4-a286af62b0c5` |
| Runner / live native PID | `1600975` / `1605517` |
| #975 / #980 preview ports | `18793` / `18794` |
| Rendered-state contract SHA-256 | `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa` |

The base is the actual Stage B evidence-adoption head, the completed Stage B #818 review candidate; central has since advanced
to #834 review. Preflight requires the successful receipt before reading its base;
it first verifies the approved external Stage B pins file SHA-256
`cba2aa3afe9fd177d4dd2d44d378f94c89375f803b7d2f47ca7c7067988fcb04`
and every pinned runtime/policy file before loading the importer. The publisher's
transitive `leetcode_static_versions.py` dependency is separately bound to bytes
from that pins file's fixed approved source revision and checked before import.
It then verifies `same_shared(base, current_head)`, actual/saved HEAD equality, active
runner ancestry and native command output/cwd binding to the current run, thread
and turn events, and stable current/HEAD/STOP at the end. STOP is absent. All older
lane reservations, including #968/#972, are imported. Exactly one campaign runner
is live; available memory is 1,608,396 KiB. Both targets remain in the finite
984-ID queue, without records/runs/reservations/checkouts/state directories/branches;
both ports are listener-free and bindable. Port availability is not a reservation.

An initial read-only probe refused an extra total-cleanliness assertion because
the active reviewer had created its normal untracked evidence directory. The
final preflight permits only this current review's exact prompt-bound untracked
report/evidence paths. Tracked changes or other paths still refuse. This does not
change the proven launcher's eligibility or control flow; no general cleanliness
requirement has been added to that launcher. The narrow check is for this observed
review phase; a future author phase requires a fresh phase-specific assessment.
[initial-probe-refusal.json](initial-probe-refusal.json) records that harmless probe.

## Retained workflow and final operator boundary

The unchanged launcher retains its exclusive pair lock, existing-reservation
refusal, all-prior-imported requirement, exact queue and live central pins,
target-path/branch/port absence, >1 GiB memory threshold, runner count 1 then 2,
nice 10, fresh lane thread/turn observation, max rounds 6 and no publication args.
After an authorized dispatch, the existing observation procedure must establish
three total runners with distinct fresh native/thread/turn identities. A timeout
or partial spawn means preserve the receipt and repoll that exact handle/PID;
never rerun blindly. Native liveness and full shared-tree equality are external
preflight obligations, not newly claimed in-launcher checks.

This is a dated observation, not an indefinite launch lease. If central advances
before authorization/dispatch, refresh only observation pins after reconfirming
the immutable base's shared-tree equality and all runtime gates. Any changed exact
launcher needs its updated hash reviewed. STOP or a changed policy is not waived.
No overlapping-marker policy adoption is part of this sequence.

Standard authors independently fetch the official statement, follow the existing
independent design/brief workflow, and receive independent candidate review with
the normal repair loop. Dispatcher official prep remains fixed at
`74f2c6729ab50f1781b2fb5fadc2ff267e27d634`; its committed hashes remain in the
parameter map. No teaching-note injection, shared prep adoption or review bypass.

## Validation

Seven local static checks pass: exact source/launcher identity, parameter reversal,
six live pins bound to the captured preflight, target parameters, and negative
controls for STOP removal, prior-reservation gate removal and added publication
arguments. Tests parse but never execute or import the launcher. Run
`python3 -B specs/reviews/parallel-975980-evidence-20261026/test_parameters.py`.
[tests.log](tests.log) and [validation.json](validation.json) record the preparation.
These checks are not an actual lane launch or lesson acceptance.

## Refused first authorization and observation refresh

The first authorized attempt stopped in read-only preflight before transfer or
execution: central had advanced to #834 and Git collapsed its new untracked
evidence directory. [dispatch-preflight.json](dispatch-preflight.json) and
[dispatch-refusal-observation.json](dispatch-refusal-observation.json) preserve
the zero-spawn refusal. Final preflight now uses `--untracked-files=all` to check
exact files against the same current prompt-bound evidence/report allowlist;
tracked or foreign paths still refuse. The refreshed launcher changes observation
pins only, retains immutable BASE, and awaits new root review/authorization.
The substitution count is computed from non-identity mappings, not forced: nine
actual replacements now include the original source problem literal 818 → 834.
