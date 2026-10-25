# Independent review: frozen-source #818 Mac measurement harness

**Approved for later use on an explicitly identified frozen candidate; no required
changes found.** This approves the measurement harness, not the nonexistent future
candidate, its resource results, independent lesson acceptance or publication.

Reviewed exact SHA-256 values:

- `measure.py`: `94a3d9c9567af65c32bdd72bddd3d1eaa167a8e9d901335237a89ba5880a7386`.
- `test_measure.py`: `004ba1f5f8b6917738c8c0cc8824559c96d912383b01f8e440151c507c1b189b`.

The separate reviewer inspected all harness/test code, README and validation
metadata, ran the eight tiny CLI fixture tests independently on Mac (all passed,
2.983 seconds), and rechecked both hashes afterward. No full-range run, future
candidate, old large BFS, SSH, Pi/state change or agent interruption was involved.

## Reviewed behavior

The interface requires explicit source, expected SHA and an exclusive new output
directory. Wrong source identity refuses before output creation; existing output
is not overwritten. Execution uses the exact frozen copy, checks its bytes before
and after every invocation, and checks original/copy identities at completion.
Each target runs actual `Solution().racecar(target)` in a fresh isolated `-I -B`
Python process, at most two scheduled children concurrently. Missing dependencies,
invalid returns, exceptions and hash mutation fail visibly rather than substituting
another implementation.

Default coverage enumerates all 10000 targets. Status, answer or null, callable
time, process wall time and available RSS are retained per target. Timeouts and
deadlines never become answers; abort-uncollected results are explicitly unknown.
Fresh sequential reruns include 9809, 9879, 10000 and observed maximum-call-time
and maximum-process-RSS targets. They share the monotonic overall deadline.
Full-range success requires every survey/isolated result to pass and source
identity to remain unchanged. Test-only coverage cannot claim full-range success.

The reference DP is correctly labeled numerical corroboration, not its missing
optimality proof. Separate raw BFS is limited to targets1–32. The actual new
algorithm's admissibility/optimality proof remains an independent review duty.
No old large-target BFS is invoked by this harness.

Darwin `ru_maxrss` is retained directly as bytes, including its raw unit. This is
whole-process peak RSS including interpreter/imports, not data-structure-only
allocation or descendant memory. Callable timing excludes compile/import;
process wall time includes startup and cleanup. Concurrent survey timings are
load-sensitive; isolated reruns and environment metadata preserve that distinction.
No official time/memory limit or submission verdict is inferred.

Process groups are terminated on timeout and normal completion to remove remaining
descendants. Abort closes the scheduling deadline; already running children may
finish their existing finite per-target budget before cleanup, as documented.
The deadline therefore includes a bounded cleanup/active-child grace, not a claim
of instantaneous external cancellation.

## Tested limits and later gate

The CLI tests independently exercised tiny actual A* answers/RSS, hash refusal,
output preservation, incorrect/noninteger/exception outcomes, per-target/overall
timeouts, frozen-copy mutation and delayed descendant cleanup. They establish
those controls on fixtures, not resource performance across the real domain.

Root must still bind the future canonical bytes and hash to the stopped immutable
candidate, run the reviewed harness with full coverage, inspect summary and all
failed/isolated outcomes, and retain hashed evidence before starting fresh review.
A failed or incomplete measurement is not acceptance. Linux author self-checks and
Mac dispatcher measurements are coordinated stages; inability to execute on Mac
is not itself an algorithmic defect or permission to invent success.
