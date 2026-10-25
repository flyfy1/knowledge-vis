# #282 official access recheck — 2026-10-25

Dispatcher evidence for reopening `L282-OFFICIAL-ACCESS-001`; not an independent
lesson acceptance. Historical blocked-access observations remain unchanged.

The exact official URL opened normally in the in-app browser while logged out:
https://leetcode.com/problems/expression-add-operators/

The visible page identified #282 as Hard and provided the statement, examples,
and constraints. Opening the visible language selector showed Python3 and
Python, alongside the other recorded options. Selecting Python3 displayed the
actual callable template `Solution.addOperators(self, num: str, target: int)`
with return annotation `list[str]`. No code was entered, run or submitted.
No access barrier was bypassed.

Evidence is in `leetcode/282/provenance/official-access-20261025.json` and the
adjacent `official-python3-20261025.jpg`. The image was inspected: it shows the
problem title, statement, examples, selected Python3 language, callable template,
and logged-out execution notice. The JSON records independently observed bounds,
examples, menu options, capture time, exact source URL, limitations, and image hash.
This evidence was collected after the author's prior capture and is independent
of that author's assertions. Provenance is excluded from published runtime assets.

The prior review explicitly allows a new independently captured official
statement/interface as the next evidence. Reopen the lesson for a fresh review
on this evidence-bearing candidate. Preserve the source-blind cold walkthrough;
only after it should the reviewer inspect this capture and historical findings.
The reviewer must verify the lesson against the captured contract and normally
try the official source, state any remaining access limitation, and decide
whether `L282-OFFICIAL-ACCESS-001` is closed. This dispatcher note cannot close it
or substitute for the per-lesson review gate.
