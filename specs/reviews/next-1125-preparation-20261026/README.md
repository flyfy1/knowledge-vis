# Dispatcher preparation: #1125

Prepared in the capacity-recovery worktree on 2026-10-26. Source and semantic
notes only; no lesson implementation, UI proposal, author prompt injection,
campaign policy/state/Pi writes, reservation, dispatch, signal or commit.

The authoritative read-only observation at 15:34:34 UTC places #1125 at index
225 of the fixed 984-ID queue, canonical hash
`434e5df4289eb8084c994f7a9bfe9920331ebcd4675beb7d2d511c1749d1fb7a`.
It has no central problem record/run, reservation, lesson/tracked lesson path,
lane branch or lane directory. No matching existing local preparation was found.
Central #1095 author was active; these are dated observations, not launch pins.

The actual segment is #1095, #1096, #1097, #1106, #1121, #1125. The frozen catalog
marks #1097 and #1121 paid-only; both remain in campaign scope and order. This
preparation does not access, omit, unblock or change those entries.

The [official #1125 statement](https://leetcode.com/problems/smallest-sufficient-team/)
was read, and one unauthenticated public GraphQL GET returned HTTP 200 with full
content and language templates. Exact bytes, URL, timestamp, hash and frozen
catalog segment are retained. No source-access blocker or bypass occurred.

Run `python3 -B check-examples.py` from this directory. Eight tiny subset fixtures
(including both official examples), five semantic checks and three deliberately
incorrect diagnostic probes passed their assertions. Every minimum team is
recorded, rather than asserting one arbitrary reference ordering. The oracle
uses at most six people; no large exhaustive fixture or general framework exists.
See `1125.md` for constraints, tie semantics and the reproduced failure contexts.
This is not learner review, candidate implementation validation, or acceptance;
ordinary independent author/design/review steps remain required.
