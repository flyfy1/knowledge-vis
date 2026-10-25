# Mac verification: 239 related-concept navigation

Candidate: `08d7986c52ed70aefe1b0a970a210c73d6291a49`. Tested in an isolated
directory extracted from that revision, including the exact #84/#327 targets,
collection and shared runtime. The Pi reviewer ran separately; this dispatcher
check does not substitute for its cold walkthrough or acceptance decision.

Six checks passed: the new navigation regression, Python oracle cases, core trace
invariants, all 242 rendered membership frames, bilingual heading/official-link/
source transfer, and the baseline/dynamic-copy checks. No test assertions or host
shortcut were adapted. The existing source transfer test uses macOS Meta+C and
retains exact full-source equality. [Results](239-evidence/mac-navigation-08d7986-20261025/checks.json).

The navigation check exercised zh → en → zh at 320 CSS pixels. Native Tab/Enter
activated each actual rendered link; the resulting URL/fragment and visible
explanation match #84's monotonic stack and rectangle-width rule, and #327's
prefix subtraction and range sum. Both targets appear in the served local
collection. Page and response errors were empty. The dispatcher visually
inspected the English #84-focused and Chinese #327-focused screenshots: labels
wrap within the viewport, remain readable, and have visible focus outlines.
[Navigation observations](239-evidence/mac-navigation-08d7986-20261025/navigation/results.json).

All 236 extracted tracked files, including the lesson and target dependencies,
were byte-identical to the frozen revision after the checks.
[Candidate receipt](239-evidence/mac-navigation-08d7986-20261025/candidate.json).
The [runner](239-evidence/mac-navigation-08d7986-20261025/run-checks.py) uses an
ephemeral local HTTP server and writes test evidence outside the candidate.

This proves the exercised Mac paths for this candidate. Physical devices,
screen-reader completeness and public delivery of the new links remain unverified.
The separately inspected existing public target pages are usable destinations,
but do not prove that the changed #239 links have been published. The independent
review outcome and source integration are recorded below.

## Independent acceptance and integration

The separate [round-four review](239-review-4-bd768111.md) accepted this exact
candidate at 90/100, scores `[4,3,4,3,4,4]`, with no required open findings.
It closed `239-NAV-R1`, reconfirmed previous window/title fixes, performed its own
cold walkthrough and 21,324 exhaustive small Python cases, and retained the
limitations of grouped removals and compact derivation. The dispatcher did not
replace that judgment with its own test results.

Central registration commit `fd5760e3a18bdc79f365db1aa62bea9e38b2671f` contains the
accepted source and report. Only `leetcode/239` and the new report/evidence were
restored from it into main; shared runtime, other lessons and registration files
were not overwritten. The frozen candidate and Mac verification therefore refer
to the same lesson bytes. Its public delivery is pending the ordinary next batch;
the previous release remains valid historical evidence for the previous candidate.
