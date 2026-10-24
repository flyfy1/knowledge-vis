# #471 · Encode String with Shortest Length — blocked author discovery

Category: algorithms (collection category: leetcode). Stage: university.
Official source: https://leetcode.com/problems/encode-string-with-shortest-length/

## Scope and approved design

Retain this problem in scope. Reuse the lesson pattern approved in
`../../specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher
adjudication. This is an author run; independent lesson review remains pending.
Target reader: a learner who knows basic programming and wants to reconstruct
the verified algorithm, predict a fresh case, and implement its official interface.
No implementation has begun because the official contract is inaccessible.

## Contract verification blocker

The official page rendered by the web tool says “Subscribe to unlock” and
“To view this question you must subscribe to premium.” The public GraphQL
response has `isPaidOnly: true`, `content: null`, `translatedContent: null`,
and `codeSnippets: null`. It exposes sample input strings and metadata naming
`encode(s: string) -> string`; that does not verify the statement, constraints,
expected outputs, exceptions, or any particular language's callable interface.
The precise dated request/response is in `tests/evidence/`.

No canonical language is selected. There is no basis for a language contract,
solution, example answer, complexity claim, or complete lesson metadata yet.
No statement is inferred from the title or obtained from third-party mirrors.
No credentials were inspected and no paywall bypass was attempted.

## Priorities and next input

Highest-return prerequisite / P0: obtain an authorized capture of the official
statement, all examples and outputs, constraints and exceptions, plus the actual
language selector and starter interface (including Python if supported).
An owner-provided official capture or normally available authorized access can
resolve the blocker without sharing credentials. Then verify Python > TypeScript
> required native before authoring the complete five-field step plan and local
term dependency table. Reuse exact shared tokens in the implementation.

P1: after P0, build the bilingual causal lesson and reproducible solution/oracle
and browser checks under this directory, then freeze it for a separate reviewer.
P2: optional refinements only after complete verification.

Deferred: teaching sequence, concrete examples, hand calculations, baseline,
invariant, counterexample, transfer exercise, simulation controls, source mapping,
boundary tests, and full step/term tables require the verified official contract.
Their omission is an explicit blocker, not a finished brief or lesson.
No runtime placeholder page, registration, deployment, or independent acceptance
is claimed. Browser lesson tests are inapplicable until a real candidate exists.

## Reproduction and preflight

Run `OUTPUT_DIR=/tmp/471-access python3 -B leetcode/471/tests/check_official_access.py`
from the repository root to capture current public access without changing the
saved evidence. Inspect `tests/evidence/access-results.json` for the original date.

Executed from the repository root:
`python3 -B scripts/register_leetcode_lesson.py 471 --validate-only`.
Result: exit 2; `Metadata validation failed: [Errno 2] No such file or directory:
…/leetcode/471/lesson-entry.json`. Metadata is absent because a verified lesson
cannot yet be authored. This is a failed preflight, not readiness.
