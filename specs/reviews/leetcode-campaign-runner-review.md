# LeetCode campaign runner: independent code review

Date: 2026-10-18. Reviewer: separate agent `/root/queue_review`.
Scope: orchestration, registration, prompts, and failure handling. This is not a
lesson review, a production release, or proof that the 984-problem campaign has
completed. The reviewer did not author the implementation.

## Conclusion

No required orchestration findings remain open in the reviewed candidate. The
runner is suitable for a controlled first-problem execution on the isolated Pi
checkout, followed by inspection of the actual author/reviewer evidence before
expanding the queue. Acceptance here covers the runner, not any lesson produced
by it.

Reviewed runner SHA-256:
`7b5052c3b693ada90e1b168598fe2c60cca7c46bc2e408fcad65bb0851299f80`.
Reviewed runner-test SHA-256:
`d9709cd1df78c77b6b7b4b5d3462472c3f80bd452f30c3d50a1effd4b3bde4f4`.

Inspected `scripts/leetcode_campaign.py`, `scripts/leetcode_registry.py`,
`scripts/register_leetcode_lesson.py`, all three campaign prompts, both script
test modules, and the registry merge change in
`leetcode/hard-first-ten/build.py`. Current repository workflow, campaign,
authoring, design-review, and acceptance specifications supplied the contract.

## Findings and closure

| ID | Priority | Finding | Closure evidence |
| --- | --- | --- | --- |
| CR1 | P1 | Terminating only the Codex parent can leave tool descendants writing after a failed run. | The runner starts an isolated process session and terminates its process group on timeout, interruption, failure, and normal exit. The timeout integration test and a separate delayed-write probe both observed no surviving descendant write. SIGTERM is routed through cleanup and failed-state persistence. |
| CR2 | P1 | State-directory locking alone allows separate state directories to dispatch into the same checkout. | A second lock now belongs to the Git checkout. The regression test and an independent temporary-checkout probe both rejected two alternative state directories while the checkout lock was held. |
| CR3 | P1 | Author/fix write permissions originally included earlier review reports. | The allowlist now permits only the problem directory and ID-prefixed tests. Tests reject review and shared paths, and retain unauthorized changes for inspection instead of committing them. |
| CR4 | P2 | A problem-wide screenshot exemption allowed later reviewers to replace earlier review evidence without invalidating the frozen candidate. | Each review gets a unique evidence subdirectory; all previous evidence remains fingerprinted. An attempted overwrite now fails the candidate-identity check and cannot record acceptance. |
| CR5 | P2 | An existing partial `index.html` could classify an unregistered lesson as preexisting and allow acceptance without registration metadata. | Registry membership now determines whether metadata is required. A partial unregistered lesson returns to authoring; complete candidates can start with review. A regression test covers the partial retry case. |

The final implementation also preserves normal Git hooks, includes truthful
author/reviewer attribution, and reports `queue_exhausted_incomplete` when the
finite pass ends with blockers or unresolved reviews.

## Observed validation

The reviewer ran:

```text
python3 -m unittest discover -s scripts -p 'test*.py' -v
Ran 19 tests in 18.021s
OK
```

These are 17 runner tests and two registry tests. Disposable Git repositories
and a fake CLI exercise the runner's observable boundaries: failed author and
review processes, clean resumption, candidate mutation, missing report,
required-score gating, finite review rounds, source blockers, preserved queue
identity, stop files, run-count continuation, changed HEAD, path ownership,
historical evidence, process cleanup, and checkout ownership. They do not test
whether an actual model performs a good cold walkthrough.

Registry tests ran the real first-ten generator in a temporary copy. The added
#51 entry and existing #2916 entry survived repeated generation, and repeated
registration was stable. Invalid concept anchors were rejected before writes.
The review also observed a clean `git diff --check` and a three-problem dry run
with zero agents started.

Local `codex exec --help` exposes the invoked flags. The official
[non-interactive documentation](https://learn.chatgpt.com/docs/non-interactive-mode)
documents JSONL `thread.started` with `thread_id`, error events, and
`--output-schema` together with `-o`; the runner uses those interfaces. The
[structured-output schema documentation](https://developers.openai.com/api/docs/guides/structured-outputs)
supports the numeric and array bounds used by the review schema.

Separately, the dispatcher reported an actual Pi smoke test of the exact review
schema using Codex 0.163.0, `gpt-6.1-sol`, medium reasoning, session
`01a14e49-44a1-79d0-a7a9-c91f4f9e006f`, with a completed turn and an explicitly
non-review `blocked` response. This is dispatcher-observed runtime evidence;
this reviewer did not execute that remote smoke test. It grants no lesson score.

## Operational limits

- The runner checks score structure, required findings, independent session IDs,
  report presence, and candidate identity. A real reviewer must still supply
  honest browser, source, and algorithm evidence; a valid JSON result is not
  proof of teaching quality.
- Prompts retain premium and language-specific problems in scope and require
  authorized official-source access. They forbid invented contracts and access
  bypasses. Filesystem allowlists are checked after runs; this is trusted agent
  orchestration, not a sandbox against a malicious process.
- The stop file is checked between stages. Timeout and normal termination have
  cleanup paths; a power loss or SIGKILL can interrupt persistence. A commit
  created immediately before a state-write failure intentionally makes resume
  stop on HEAD mismatch for inspection. No automatic reset discards work.
- Dirty failures, blocked sources, and exhausted review rounds need an explicit
  follow-up decision. The same finite pass does not silently retry terminal
  blockers or convert queue exhaustion into campaign completion.
- No production deployment, public delivery verification, actual LeetCode
  submission, or novice-learning study was performed in this review.
