# All Hard development campaign

Requested 2026-10-18: build a visualization for every current LeetCode Hard
problem, and have a separate agent review each. This is a finite development
campaign, not a recurring catalog monitor. The target is the dated official
[snapshot](../leetcode/catalog/hard-problems.json), currently 984 records:
912 algorithm, 66 database (also Pandas), and 6 JavaScript problems.

## Scope and implementation contract

Apply the [independent design review and adjudication](reviews/leetcode-all-hard-design-review.md),
[authoring requirements](leetcode-explainers.md), and
[mandatory acceptance gates](leetcode-review-gates.md). Begin with #51 to prove a
new lesson cycle; then ascending official ID, including review debt for existing
pages. Preserve prominent IDs, separate official links, bilingual explanations,
Python source parity, and genuine algorithm-specific interactions.

Every catalog record starts not started; existing pages have separate historical
deployment evidence. Do not exclude premium, language-specific, or inaccessible
records from the denominator. Use a verified Pandas interface when officially
supported. If the source or Python submission contract cannot be verified, record
a concrete blocker and next action instead of inventing it. Completion of this
request requires resolving those blockers, not simply exhausting the queue.

P0 is a complete learning loop per problem, tested and independently reviewed.
P1 is catalog search/status presentation before large-scale public release. P2
is optional decoration after learning evidence. Accounts, browser Python hosting,
universal trace frameworks, automatic animation, and live catalog polling remain
deferred because they do not help prove the requested learning loop.

## Execution and evidence

`scripts/leetcode_campaign.py` runs in an isolated `codex/` branch on Pi. Each
lesson gets a fresh author run (existing candidates start with review), a frozen
candidate commit, and a separate fresh reviewer run. Fixes return to a separate
review; a maximum of three attempts per queue pass leaves unresolved work pending,
never accepted. The specification still requires all mandatory findings closed.

Agent commands use the existing Codex subscription and WORKFLOW's model setting.
A failure of authentication, tools, process, output validation, or ownership
checks stops the queue. It does not retry indefinitely or skip technical failures.
Source/language blockers and exhausted review attempts are recorded distinctly.
An explicit stop file is checked between stages. The runner records active phase,
problem, timestamps, run IDs, candidate commits, findings, and evidence paths.
No scheduling service is installed. No production files or user worktrees change.

Author and fix agents own only their problem files and problem-local tests.
Reviewers first cold-walk the actual browser candidate, then audit source, and
write only their review evidence. The dispatcher enforces six scores, >=85/100,
every dimension >=3/4, zero required open findings, and candidate identity.
Only then does deterministic registration merge the new entry and concept links.
An accepted local commit is neither published nor independently tested on a real
human learner. The queue does not push or deploy; publication remains a separate
verified release step. The initial public count stays 11 during this phase.

## Operations

Run `python3 scripts/leetcode_campaign.py --help` for exact options. State and
agent logs live outside the source checkout. `--dry-run` selects work without
starting agents. `--ids` can run an initial smoke lesson; omit it for the complete
snapshot. `--limit` bounds a test pass. Reuse the same state directory to resume.
Never start two workers on the same checkout or rewrite state to force acceptance.
The worker exits on dirty source at startup and preserves failures for inspection.

Check the state JSON and current process before claiming work is running. A
queued item or a started process is not a finished visualization. Preserve all
reports, including failures and findings later fixed. Periodic user-facing counts
must distinguish not started, active, blocked, changes required, accepted locally,
and publicly verified; do not present the last two as interchangeable.
