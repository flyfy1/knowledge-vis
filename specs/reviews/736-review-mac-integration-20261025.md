# Mac verification: 736 Parse Lisp Expression

Frozen review candidate: `fd5760e3a18bdc79f365db1aa62bea9e38b2671f`. The author
commit is `e0c84ff15965900aa1edbbe319355fd127bc10d5`; the campaign freezes the
current HEAD when review starts. #239's intervening repair changed no #736 files.
This dispatcher integration check is separate from the independent cold review.

Extracted the candidate, shared runtime and related #726/#224 dependencies into
an isolated directory. Ran the original `check.py`, `browser.cjs` and `inspect.cjs`
unchanged, with all output written outside the candidate. All three passed:
2,037 numerical cases and 45,769 trace frames, both locales and all seven presets,
source display/copy/native fallback/download/offline parity, narrow/desktop
layouts, keyboard, blocked storage and calibrated contrast checks, plus focused
return/sibling and heading checks. [Run results](736-evidence/mac-candidate-fd5760e-20261025/checks.json).

In the worked nested-let example, event 9/13 returns 5 and restores x from
`[2,5]` to `[2]`, leaving the parent let/add calls waiting. The next event reads
the restored x=2. The dispatcher inspected the Chinese return screenshot and
English 320px binding screenshot: before/after bindings and waiting calls remain
distinct and readable in a vertical layout. Header navigation scrolls horizontally
within its component. [Focused observations](736-evidence/mac-candidate-fd5760e-20261025/focused/inspect.json).

The original clipboard test selected the macOS Meta+C branch, used a distinct
sentinel and read back the full source. No key adapter or assertion weakening was
needed. Layout zoom is CSS zoom, not browser-toolbar zoom. The exact installed
font was not independently identified; shared font-stack equality does not claim
identical native glyph metrics.

All 152 extracted tracked lesson/dependency files remained byte-identical after
checks. [Candidate receipt](736-evidence/mac-candidate-fd5760e-20261025/candidate.json).
The [runner](736-evidence/mac-candidate-fd5760e-20261025/run-checks.py) binds the
tests' original localhost port 18770 and shuts its temporary server down afterward.

These checks do not establish real learner comprehension, physical-device
behavior, LeetCode submission acceptance, screen-reader completeness or public
delivery.

## Independent acceptance and source integration

The separate [review](736-review-1-7f33b1b5.md) accepted the exact frozen candidate
at 96.25/100, scores `[4,4,4,4,3,4]`, with no required open findings. Its own fresh
Python case returned -5; actual source tracing confirmed environment restoration.
The reviewer preserved a transient screenshot omission and a disabled-reset
harness timeout, then recaptured settled states without changing the candidate.
Its optional teaching observation is that regex, `nonlocal` and `setdefault` could
be unpacked further; the causal state-to-code mapping was reconstructable.

Central registration completed at `05e85a09f9bd4d796aa133ea9710dd9812d45b1e` after
the policy adoption boundary. Main received the exact lesson, independent report
and evidence. Non-mutating metadata preflight passed, then the existing deterministic
registration command added #736. The collection index and registry match central
bytes, and #736's concept-map block matches central. An initial whole-file map
equality check detected unrelated mathematics/physics entries present only in main;
those entries were preserved and the comparison narrowed to the generated #736
block. Lesson files match the accepted candidate. Shared runtime and other
lessons were preserved. #736 is accepted locally and queued for the ordinary next
publication batch, not publicly delivered yet.
