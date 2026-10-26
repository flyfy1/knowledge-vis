# Dispatcher references: #1096 and #1106

Prepared in the capacity-recovery worktree on 2026-10-26. Source/semantic notes
only: no lesson, runtime, policy, queue, STOP, reservation, launch, publication,
author prompt injection or commit was changed.

The authoritative read-only census at **14:13:23 UTC** confirms the fixed 984-ID
queue/hash `434e5df4289eb8084c994f7a9bfe9920331ebcd4675beb7d2d511c1749d1fb7a`.
#1096 and #1106 are at indices 221 and 223. Both lacked a central record/run,
run directory, reservation, lesson/tracked lesson file, lane directory or branch.
No matching prior preparation was present locally. Current work was #1092 review;
these are dated observations, not future runtime pins.

The queue order remains #1095, #1096, #1097, #1106, #1121, #1125. The frozen catalog
labels #1097 and #1121 paid-only; neither is removed from scope, reclassified or
fetched by this requested two-problem preparation. #1095 remains ordinary queue
work. No stale #1001/#1012 scheduling or reservation is reused.

One ordinary public unauthenticated GraphQL GET per requested problem returned
HTTP 200, Hard/free, with complete statements, examples, constraints, callable
metadata and Python3/TypeScript templates. Exact request URLs and raw bytes/hashes
are retained. Official problem pages were also read. No source-access blocker,
login, bypass, editorial, private judge or submission was involved.

- [#1096 Brace Expansion II](https://leetcode.com/problems/brace-expansion-ii/): grammar, union/product, nested comma scope, distinct words and lexical order.
- [#1106 Parsing A Boolean Expression](https://leetcode.com/problems/parsing-a-boolean-expression/): prefix grammar, operator arity, truth versus syntax consumption and strict Boolean results.

`python3 -B check-examples.py` passed **11 brace cases, 13 Boolean cases and 30
small truth-table checks**, including all official examples. The oracles start
from explicitly authored grammar trees and independently serialize the exact
input strings; tiny bag/product or truth-table semantics produce witnesses.
They do not parse arbitrary expressions or validate a candidate parser/cursor.
No optimized algorithm, maximum-input benchmark, UI design or review acceptance
is claimed. Existing independent author/design/review workflows remain required;
these notes are not injected into author prompts or adopted as a design brief.
