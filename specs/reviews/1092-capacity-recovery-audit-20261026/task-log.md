# Read-only recovery audit

The actual health loop (`progress.status == running` and `/proc/1984564` exists) ran over SSH and exited 1: status failed, runner absent, current 1092-review-7c8ae6c3edaf. This checks the stopped campaign symptom; it does not probe provider capacity by starting another model request.

Ranked falsifiable hypotheses before the audit probes:
1. Provider model capacity stopped the review: the original events/stderr should contain the exact capacity error before the runner recorded failure, without a completed reviewer verdict.
2. A local exception or process/resource fault stopped it instead: logs would show a distinct traceback, timeout or resource error as the primary failure.
3. A surviving writer or lock prevents safe recovery: live process/cwd/lock-owner evidence would show an active campaign or child despite the saved failure. Absence of these falsifies that obstacle at observation time.
4. Candidate or shared-policy drift prevents ordinary resume: HEAD, expected_head, candidate completeness, dirty-path inventory or policy hashes would fail the existing runner gates.

No runtime mutation, provider retry, lock acquisition, signal, reset, push, publication or new worker is authorized in this audit. Any plan remains subject to fresh gates and a separate dispatch.

Result: H1 confirmed by original terminal events. H2 has no supporting original-run local exception; H3 absent at capture. H4 only the exact three untracked failed-review artifacts blocks normal clean-checkout resume; candidate/policy/queue identities are intact. No repair dispatched.
