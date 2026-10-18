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
new lesson cycle; the first new batch is #51, #52, #60, and #65. Then proceed
through the remaining official IDs in ascending order, including review debt for
existing pages. Preserve prominent IDs, separate official links, bilingual explanations,
solution-source parity, and genuine algorithm-specific interactions. Prefer a
faithful official Python interface; otherwise prefer an officially supported
TypeScript interface, then the language the original problem requires. Verify
language availability and behavior rather than guessing from the category.
Every nondefault choice records its official source, interface, supported language
list, rationale, date and evidence in a lesson-local language contract. The six
JavaScript-category problems still include a clearly labeled Python conceptual
comparison; that comparison cannot masquerade as a submittable Python solution.
The owner's latest preference supersedes a blanket JavaScript choice for future
lessons when an official TypeScript interface is available.

Every catalog record starts not started; existing pages have separate historical
deployment evidence. Do not exclude premium, language-specific, or inaccessible
records from the denominator. Use a verified Pandas interface when officially
supported. Missing Python support alone is not a blocker: verify TypeScript and
then the required native interface. Unavailable statements or unverifiable
original contracts remain concrete blockers with evidence and a next action.
Completion requires resolving those blockers, not simply exhausting the queue.

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
No scheduling service is installed. User worktrees remain separate. Publication
occurs only through the explicit batch release interface described below.

Author and fix agents own only their problem files and problem-local tests.
Reviewers first cold-walk the actual browser candidate, then audit source, and
write only their review evidence. The dispatcher enforces six scores, >=85/100,
every dimension >=3/4, zero required open findings, and candidate identity.
Only then does deterministic registration merge the new entry and concept links.
An accepted local commit is neither published nor independently tested on a real
human learner. The author/reviewer runs cannot deploy. A separate batch publisher operates only
at a clean, accepted phase boundary and verifies public delivery.

## Operations

Run `python3 scripts/leetcode_campaign.py --help` for exact options. State and
agent logs live outside the source checkout. `--dry-run` selects work without
starting agents. `--ids` can run an initial smoke lesson; omit it for the complete
snapshot. `--limit` bounds queue selection; `--run-count 1` executes one item while
retaining the full selected queue for resumption. Reuse the same state directory
and selection to resume.
Never start two workers on the same checkout or rewrite state to force acceptance.
The worker exits on dirty source at startup and preserves failures for inspection.

Check the state JSON and current process before claiming work is running. A
queued item or a started process is not a finished visualization. Preserve all
reports, including failures and findings later fixed. Periodic user-facing counts
must distinguish not started, active, blocked, changes required, accepted locally,
and publicly verified; do not present the last two as interchangeable.

## Proven first cycle and policy maintenance

#51 completed an actual author → independent review → fix → fresh independent
review cycle. Round one required a zoom-layout fix; round two accepted candidate
`95a02f2a7cbe73044d6bbf0dfc8053999f17815d` at 96.25/100 with no open required
findings. Registration followed acceptance. Reports and original failure evidence
remain in `specs/reviews/`; this is local acceptance, not public verification.

Change queue policy only at a graceful stage boundary: request STOP, let the
active agent finish, verify the runner exited and the checkout is clean, then
apply the reviewed policy commit. Back up the ledger and record old/new HEADs,
changed policy, and authorization before updating its expected HEAD. Preserve
all problem statuses, candidate revisions, run identities, and review evidence.
Remove STOP and resume the same queue only after checking these invariants.
This maintenance procedure cannot create acceptance or close review findings.

## Owner update: detailed lessons and batches of 100 — 2026-10-18

The active objective covers all 984 snapshot problems, with no reduction to the
first batch. Each lesson must show a concrete worked example from input through
intermediate states to output, explain unfamiliar terms beside their first use,
connect the baseline's repeated work to the improvement, and include a fresh
prediction plus an illuminating counterexample. A story or analogy must preserve
the original quantities and conditions; avoid template filler or decorative
animation with no causal explanation. Reviewers must reconstruct the reasoning
from the page before reading the author's explanation.

After each 100 additional independently accepted, not-yet-released problems,
publish that accepted batch and verify its actual public URLs. The baseline is
#51 and #52, already released and verified; the other 11 historical public pages
remain in the independent-review queue and count when their campaign review
finishes. Public availability alone is not a completion or acceptance signal.
At full completion, publish the final remainder even when it is smaller than 100.
An exhausted queue with blocked or unresolved lessons cannot trigger a claim of
completion. Repair passes must retain prior findings and acquire new evidence.

The publisher has a separate durable release ledger. Failed or interrupted
publication remains pending and cannot advance the released count until public
bytes and browser navigation pass verification. Preserve unrelated production
pages and existing collection entries. Publish only the exact accepted lesson
assets and the merged collection; tests, draft pages and review artifacts do not
become public runtime assets. Catalog ID/title/topic search is implemented and independently accepted in
[its design and verification record](reviews/leetcode-collection-search-design.md);
it ships with the first large batch release.

The owner explicitly does not require old production content to be retained.
Future releases therefore create no old-content backups or historical deployment
copies. This supersedes earlier rollback-copy guidance for this campaign. Retain
Git history, review findings and small release manifests as correctness evidence;
they are not duplicate served content. Existing backups are not a request to
perform unrelated cleanup. The development/review ledger and locks remain intact.

### Configuring the release interface

The production worker supplies `--publish-root /home/songyy/projects/visual-site`,
`--public-base https://visual.integ.life`, and `--publish-every 100`. Without both
explicit target fields, the queue does not publish. The production directory must
be separate from the development checkout. The runner calls the publisher at
startup for pending-release recovery and after a completed problem, while it
still owns the checkout lock. STOP suppresses publication as well as new agents.
The final `flush` is allowed only when the entire official catalog is accepted.

`scripts/leetcode_publish.py` owns staging, acceptance/candidate verification,
registry merging, public hashes/browser checks and `releases.json`; it does not
modify the campaign's acceptance ledger. Successful release removes staged
payload bytes and retains small receipts. The reviewed test interfaces cover
thresholds, incomplete work, failures, resumption and preservation of unrelated
content; a passing fixture is not itself a real production release.
