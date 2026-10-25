# Independent exact review: #982/#987 parallel launch

**Approved for the existing one-time two-lane operator scope; no required findings.** This review binds launcher SHA-256 `042e95a37d31100524e862db7e354e664310df535eccd7736aa2415c16196463` and preflight SHA-256 `ec01c22261e9150cc5c45a01754ac3179e7a69ac84c900cff2c3d36e33ec70e2`. It does not execute or independently authorize dispatch.

## Identity and scope

Read the complete launcher, preflight, parameter map, archived observation and tests. Verified pending templates byte-for-byte against commit `378e80cb`; final launcher resolves only the six pending values and final preflight only its BASE. Independently ran all eight static tests (0.007s), including exact reversal of the ten substitutions to reviewed #975/#980 launcher `17709040ee542e912e697aedca65e0800a5e6c5b77535fafb3aa3597b1cd25a8`, unchanged control flow/AST, and negative STOP, reservation-gate and publication-argument mutations. [Independent test log](parallel-982987-review-evidence-20261026/tests.log).

The new parameters bind immutable BASE/current HEAD `854d1bdc83efc13ae49716190ba8db858e4dd0fc`, #843 fix `843-fix-d56cf6178cb9`, session `01a174f4-bc5c-7992-be3a-69f166e491b8`, adopted rendered contract `816990…`, IDs 982/987, separate pair lock and ports 18795/18796. No author-context injection, publication flags, new policy adoption or central progress/source write was introduced. Each isolated worker retains the ordinary author/independent-review/fix pipeline and maximum six review rounds.

## Independent live read-only check

Executed only the inspected preflight on Pi with `python3 -B -` (no bytecode writes), at **2026-10-25 21:28:33 UTC / 2026-10-26 05:28:33 SGT**. [Result](parallel-982987-review-evidence-20261026/preflight.json), [empty error log](parallel-982987-review-evidence-20261026/preflight-errors.log). Explicitly compared its output against every frozen head/run/session/PID and repair-receipt identity in the parameter map.

The completed #843 receipt hash `85e981af4d5d0681f392d8565b31fc4502ee6518fcce5491090d8abf6657467b` and adoption head match; central runner 1696215 and native descendant 1696569 still match the exact fix output directory/session. STOP is absent. All 37 older reservations are imported; exactly one campaign worker is live; the finite queue has 984 items. Both target IDs remain unstarted/unreserved with no target paths, branches, runs or listeners, and their ports are bindable. Available memory is 1,815,472 KiB, above the retained 1 GiB threshold.

The preflight verifies approved #843 pins and all runtime/policy hashes, including the static-builder dependency, before importing repository Python. Shared files match immutable BASE. Existing dirty paths are exclusively `leetcode/843/`, justified by the exact current fix prompt's ownership instruction and problem metadata; no rename, shared or foreign path exception is granted. The stopped/accepted distinction is preserved: #843 is actively being repaired, not newly accepted by this launch.

## Operational limits retained

Immediate preflight output must still equal the frozen launcher parameters before transfer/execution. Preflight itself can describe a later head/session; its successful exit alone is insufficient without that comparison. Launcher validation rechecks exact current head/run/session, STOP absence, policy and worker counts before each lane. A refused or advanced boundary requires inspection, not silently updating pins. Capacity and free ports are observations, not reservations.

Exclusive pair locking, exclusive prepared receipts, fsynced atomic receipt updates, exact worker argv/nice/nonpublication checks and bounded startup observation remain unchanged. Partial worktree/spawn states must be preserved; inspect the exact receipt/PID and continue observation rather than rerunning the launcher. A hard loss around spawn cannot make receipt/process creation atomic. Post-dispatch verification must establish both fresh native/thread/turn identities and exactly three runners. Central does not interpret lane reservations; the dispatcher must monitor and arrange a natural stopped import before central reaches either ID. Lane acceptance cannot itself count toward publication.

No launch, reservation, remote file write, STOP change, source/state/policy edit, commit, push or publication was performed by this review. Only this report and local review evidence were written.
