# Metadata preflight implementation: author self-check

Date: 2026-10-18. Implementation and verification: gpt-6.1-sol, fresh Codex
implementation run; author self-check only. Independent review pending.

## Scope and preserved evidence

This is a preventive tooling change in the isolated tooling checkout. No active
lesson, frontend asset, campaign/lane state, accepted candidate, or prior report
was edited. No real campaign or publisher was executed, and no push or deployment
was performed. Campaign/publication/import tests used disposable fixtures and fake
agents or publication adapters. The actual lane and state sibling were not needed:
immutable Git objects provided the incident evidence.

Run output directory: `/tmp/leetcode-metadata-preflight-115-run/`.
Temporary test directories were directed there with `TMPDIR`; Python test runners
used `-B` and `PYTHONDONTWRITEBYTECODE=1`. The CLI artifact regression explicitly
removes that environment setting and omits `-B` in its child process.

Read WORKFLOW.md and the diagnosing-bugs and codebase-design skills before work.
No diagnostic phase was skipped. Targeted assertions and filesystem snapshots
provided the probes; no debug logging or production instrumentation was needed.

## Ranked predictions recorded before tests

1. If untyped registration is the cause, frozen object-valued complexity reaches
   `.strip()` and raises AttributeError before writes; a string-only substitution
   makes registration succeed.
2. If readiness omits registration metadata, `required_files(new=True)` accepts
   the same invalid object even though real registration fails.
3. If the metadata contract is ambiguous, the author prompt lists `complexity`
   without specifying its shape and the specs lack an explicit string/preflight
   gate. Clarifying the contract and sharing validation should prevent this
   particular readiness/registration mismatch.

Predictions 1 and 2 were confirmed by executable regressions. Inspection confirmed
prediction 3's missing explicit contract: the original author field list named
`complexity` without its type. This is a prevention gap; inspection alone cannot
prove why the author chose an object or predict future agent behavior.

## Red feedback loop before production changes

The new `scripts/test_leetcode_metadata.py` embeds the exact lesson-entry.json
bytes from candidate `95b00b368bd13ed6e969821924e438415aab7db9`, extracted with
`git show <candidate>:leetcode/115/lesson-entry.json`. It invokes real
`register(root, 115)` with a disposable catalog, registry, collection index,
concept map and lesson files. It never substitutes a mock registration function.

Command (run before changing registration or campaign implementation):

```sh
TMPDIR=/tmp/leetcode-metadata-preflight-115-run PYTHONDONTWRITEBYTECODE=1 \
  python3 -B -m unittest discover -s scripts -p test_leetcode_metadata.py -v
```

Initial result: four tests ran; one failure and two errors. The incident-specific
regression expected ValueError but got
`AttributeError: 'dict' object has no attribute 'strip'` at registration's
`entry['complexity'].strip()`. Readiness failed its expected-error assertion:
`CampaignError not raised`. The planned validation interface did not yet exist
(ImportError). The valid-string real-registration control already passed. Original
red output is retained in `red.log` in this run's output directory.

## Implementation and interface

`validate_metadata(root, problem_id)` in `register_leetcode_lesson.py` owns the
existing registration metadata checks, concept anchors and language/source checks.
It reads files and returns a fresh entry with normalized registry titles and
validated concepts. It never repairs or saves authored metadata. Shape failures
raise descriptive ValueError instead of assertion failures or untyped method
calls; these checks also remain active under optimized Python.

Complexity must be one nonempty string. Objects, lists, numbers, booleans, null,
empty strings and whitespace-only strings are rejected with:

`Metadata complexity must be one nonempty string covering time and space, not {time,space}`

Registration calls that interface before its first write. Campaign readiness calls
it for `new=True` and translates errors into CampaignError; existing registered
lessons retain their source-contract readiness path. No state transition, retry,
recovery, acceptance, or publisher logic was changed. Campaign fixtures now author
valid metadata so their existing behavioral tests exercise the stronger gate.
A new campaign regression confirms invalid metadata fails before reviewer launch
or acceptance, leaves the registry untouched, and records failed fixture state.

Safe CLI from the checkout root:

```sh
python3 -B scripts/register_leetcode_lesson.py 115 --validate-only
```

For an isolated fixture or another explicitly selected checkout:

```sh
python3 -B scripts/register_leetcode_lesson.py 115 --validate-only --root /path/to/fixture
```

Preflight returns 0 on success and 2 with a readable error on invalid metadata,
without registering. The CLI itself suppresses import bytecode artifacts even
when invoked without `-B`. Existing positional registration invocation remains
compatible: `python3 scripts/register_leetcode_lesson.py <id>`.

Author, fix and reviewer prompts and all three relevant specs now explicitly
require a single complexity string and safe preflight before readiness/acceptance.
Metadata fixes require a new frozen candidate and independent review; prior
acceptance/state/reports are preserved, with no post-review repair automation.

## Green evidence and original-scene rerun

The final metadata suite has five passing tests. Snapshots compare every file's
bytes and mode and include directories, an untracked sentinel, and local CLI
scripts. Invalid real registration and invalid/valid preflight preserve the whole
fixture. CLI tests cover the real subprocess, clear errors without traceback,
no registration and no generated bytecode. Valid real registration changes only
registry, collection index and CONCEPT-MAP, preserving metadata. A separate test
runs the unchanged positional registration syntax successfully.

To revisit the unminimized original scene, `full-frozen-check.py` in this run's
output directory exports all 43 lesson files plus the frozen catalog, registry,
collection index and concept map from the actual candidate. It uses the baseline
registration source from pre-change HEAD, then the fixed interfaces:

```sh
TMPDIR=/tmp/leetcode-metadata-preflight-115-run PYTHONDONTWRITEBYTECODE=1 \
  python3 -B /tmp/leetcode-metadata-preflight-115-run/full-frozen-check.py
```

Observed output (`full-frozen.log`): baseline real registration reproduces the
exact dict/strip AttributeError with no fixture changes. Fixed registration and
validation reject the original with the explicit complexity error and no fixture
changes. Replacing only the complexity value, preserving every other metadata
byte, passes validation, readiness and CLI without changes. Real registration then
succeeds and changes exactly the three intended registration outputs in the
export. The frozen actual candidate remains untouched.

## Relevant tests

Each suite used the same TMPDIR/Python environment above and command form
`python3 -B -m unittest discover -s scripts -p <filename> -v`:

| Test file | Passed | Output log in run directory |
| --- | ---: | --- |
| test_leetcode_metadata.py | 5 | metadata-green.log |
| test_leetcode_registry.py | 8 | registry.log |
| test_leetcode_campaign.py | 23 | campaign.log |
| test_campaign_publication.py | 6 | publication.log |
| test_import_leetcode_lane.py | 24 | import.log |

Total: 66 passing tests. Existing language tests cover legacy Python, the exact-six
JavaScript policy, TypeScript preference, native SQL, evidence and offline source
parity. `git diff --check` passed. No diagnostic `[DEBUG-...]` tags were introduced.

## Limits and next action

Preflight checks structure and existing contracts, not mathematical truth of the
complexity statement or independent teaching quality. Legacy nonempty accepted
cost strings such as `O(n!)` remain valid. It does not guarantee later filesystem
writes will succeed, provide transactional registration, recover failed historical
lanes, or retroactively change acceptance. It does not mutate the #115 object into
a string. Tests use exported immutable evidence and disposable fixtures, not a
real campaign or release. Independent review of this tooling change is pending.
