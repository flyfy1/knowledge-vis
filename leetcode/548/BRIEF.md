# #548 · Split Array with Equal Sum — blocked author brief

Status: **blocked on official statement and submission-interface access**.
This problem remains in scope. No lesson candidate or independent acceptance exists.

## Product boundary and approved contract

Reuse the existing `/leetcode/548/` lesson pattern approved in
`../../specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher
adjudication. Audience: readers with basic programming knowledge seeking a
hand-calculable bilingual explanation and transfer to an official submission.
Category: `leetcode`; stage: `university`.
The smallest useful outcome is a verified problem-specific learning loop with
reversible simulation, prediction, executable canonical source, and separate review.
No new layout, shared renderer, service, registry change, or deployment is proposed.
Website-design skill read: `/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
Required workflow, i18n, explainer, trace, review, and rendered-state documents read.

## Official verification, 2026-10-25

Official source: https://leetcode.com/problems/split-array-with-equal-sum/

- Web reader displays “Subscribe to unlock” and “To view this question you must
  subscribe to premium.” See `provenance/official-access.md`.
- Direct unauthenticated HTTP page capture returned 403.
- Public GraphQL returned HTTP 200 with the correct ID/title/slug,
  `isPaidOnly: true`, `content: null`, and `codeSnippets: null`.
- `exampleTestcases` contains two arrays, but neither expected outputs nor the
  rules, constraints, exceptions, or callable signatures can be established
  from those arrays alone.
- Actual supported languages and interfaces are **unverified**. No canonical
  language is selected, and no language-contract is fabricated.

Raw captures and timestamp: `tests/evidence/access-report.json`, `graphql.json`,
and `page.html`. These are review evidence, not runtime assets.
No credentials were inspected and no premium restriction was bypassed.

## Scope and next input

P0 / highest-return slice: obtain an authorized official capture of the complete
statement, constraints, examples with outputs, exception rules, and language
selector with submission templates. This is required before deriving examples,
baseline, invariant, canonical solution, or lesson steps.

P1: after access is verified, write the five-field outline for each necessary
step and the first-use term/dependency table; reuse exact shared design tokens
from `../style.css` and controls from `../common.js`.

P2: optional refinements only after the core lesson passes author checks.

Deferred: implementation, problem-specific terminology, teaching examples,
counterexamples, prediction, metadata, code, numerical tests, browser matrix,
source parity, contrast measurement, and independent review. These depend on
the unavailable official contract; inventing them from the title would violate
the requested access gate. No empty lesson page or fake completion is shipped.

## Reproducible access self-check

From repository root:

```sh
OUTPUT_DIR=/tmp/leetcode-548-access python3 -B leetcode/548/tests/check_official_access.py
```

Requires the installed `requests` package and network access. Uses no account
credentials. Output goes to `OUTPUT_DIR`, allowing reviewers to preserve frozen
evidence. The recorded author run exited 0 and found `contractAccessible: false`;
this is an access observation, not algorithm or lesson validation.

Required non-mutating preflight executed from repository root:

```sh
python3 -B scripts/register_leetcode_lesson.py 548 --validate-only
```

Result: exit 2, `Metadata validation failed: [Errno 2] No such file or directory:
'.../leetcode/548/lesson-entry.json'`. Metadata is intentionally absent because
the official contract and canonical language could not be verified. Readiness
gate remains failed. No registration, review acceptance, or publication claimed.
