# #660 · Remove 9 — blocked author brief

Official URL: https://leetcode.com/problems/remove-9/

Status: **blocked on official statement and language-interface access**. This
problem remains in scope. No implementation, lesson metadata, canonical language
selection, independent acceptance, or deployment is claimed.

## Product boundary and design contract

Category: leetcode (algorithms); stage: university. Target reader: a learner
working from a tiny hand calculation toward a justified executable solution.
Reuse the lesson pattern approved in
`../../specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher
adjudication. The website-design skill at
`/home/songyy/Documents/agent-skills/website-design/SKILL.md` was read; no new
layout review or independent lesson review was performed in this author run.

The intended smallest useful outcome is one complete bilingual lesson with a
reversible local experiment, fresh prediction exercise, proof, canonical source,
and reproducible author checks. Its lesson-specific teaching sequence, five
fields per step, term dependencies, examples, counterexamples, boundaries,
complexity, and token mapping cannot be responsibly finalized before verifying
the official problem contract. Shared `../style.css` and `../common.js` remain
the approved implementation basis. No frontend has been started.

## Official access evidence

See `tests/evidence/access-summary.json` for timezone-qualified request dates,
URLs, statuses and observed fields, and the raw `official-graphql.json` and
`official-page.html` captures. The official web reader also displayed
“Subscribe to unlock” and “To view this question you must subscribe to premium.”
The exact public GraphQL query is retained in the reproducible access check.

GraphQL confirms ID 660, title Remove 9, difficulty Hard and `isPaidOnly: true`.
It returns `content: null` and `codeSnippets: null`. It exposes sample inputs
`9` and `10`, without expected outputs, and metadata for a callable named
`newInteger`, taking integer `n` and returning an integer. This metadata does
not establish a Python class signature, a language selector, the definition of
the result, constraints, exceptions, indexing, or complete official examples.
No such facts are inferred from the title or outside solutions.

## Priorities and next input

P0 / highest-return work: obtain normally authorized access to the full official
statement, constraints, example input/output/explanations, exceptions, language
selector and submission stubs. Next needed input is an authorized official
capture of those materials, or their availability through an already authorized
official session. Do not supply credentials to this lesson or bypass the gate.

P1: after verification, finish the problem-local step brief and implement the
approved bilingual lesson pattern and canonical solution. P2: optional visual
refinement after logic, accessibility and interaction checks.

Deferred: all lesson source, metadata and algorithm/UI tests pending the P0
contract; independent review remains a separate future run. No placeholder page
or guessed solution has been emitted. Browser lesson testing, source parity,
oracle checks, contrast and novice outcomes have not been established.

## Reproduction

From the repository root:

```sh
OUTPUT_DIR=/tmp/660-official-access python3 -B leetcode/660/tests/check_official_access.py
python3 -B scripts/register_leetcode_lesson.py 660 --validate-only
```

The access script writes only to its output directory and uses ordinary public
requests with no credentials. The non-mutating metadata preflight is expected to
fail because a verified lesson candidate cannot yet be authored; its actual
command, status and output are saved in `tests/evidence/preflight.txt`.
