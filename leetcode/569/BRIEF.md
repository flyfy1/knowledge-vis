# #569 · Median Employee Salary — blocked author brief

Status: blocked at official-contract verification, 2026-10-25. No lesson candidate,
canonical language decision, independent acceptance, or delivery is claimed.

## Product and design boundary

Category: leetcode / computing; stage: university. Audience: bilingual readers
learning to reconstruct an officially supported database/DataFrame solution.
Smallest useful outcome: one complete, executable, bilingual lesson with a
reversible experiment and fresh prediction exercise, ready for a separate review.
Verdict: reuse the approved lesson pattern within `leetcode/569/` once its
contract is available. References: `../../specs/reviews/leetcode-all-hard-design-review.md`
(including dispatcher adjudication), `../../UI-I18N-SPEC.md`, and the explainer,
Hard trace, review gate, and rendered-state specifications. Website-design skill
read at `/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
No new layout, shared renderer, registry change, or independent design review is
needed for this approved reuse. Shared token values and controls will be inherited
exactly from `../style.css` and `../common.js`; no CSS or UI has been implemented.

## Verified source boundary

Official URL: https://leetcode.com/problems/median-employee-salary/
The web reader displayed “Subscribe to unlock.” and “To view this question you
must subscribe to premium.” Public GraphQL returns questionId 569, the matching
title, `isPaidOnly: true`, `content: null`, `translatedContent: null`, and
`codeSnippets: null`. It exposes Employee columns and sample input/SQL setup,
but these do not establish the requested output, tie handling, null/duplicate
rules, constraints, examples' expected output, or full supported language list.
A MySQL setup fixture does not prove a current selectable submission interface.
Python/Pandas support and TypeScript support remain unknown, not absent.

See `tests/evidence/official-web-observation.md`, `access-summary.json`, and
`graphql-response.json`. No credentials were inspected or used. No alternate
content mirror, paywall bypass, inferred statement, or guessed solution was used.

## Scope and next input

P0: obtain an authorized official capture containing the complete statement,
constraints, examples with outputs, exceptions/tie rules, and actual language
selector plus starter interface for each offered language. Select Python first,
then TypeScript, then required native language according to that evidence.
P1: derive the problem-specific hand calculation, baseline, invariant, canonical
code and tests only after the contract is verified.
P2: optional refinements after full computational and browser verification.
Highest-return work now: preserve verifiable access evidence instead of inventing
a contract. Deferred: implementation, step sequence and five-field step plans,
term dependency table, local rendering states, source mirrors, metadata and
language contract. Their mathematical and UI content depends on missing rules.
No runtime placeholders are shipped. This problem remains in scope.

## Verification plan after access

Use the actual canonical runtime against independent expected results, including
applicable ties, nulls, duplicate salaries and ordering. Distinguish visual
simulation from submission execution. Exercise bilingual locale preservation,
reversible controls, fresh prediction/reveal/change, source/copy/download parity,
clipboard fallback, keyboard/focus, 320/390/desktop and 200% zoom, local asset
requests and measured contrast. Write a complete problem-local five-field brief
and concept dependency table before implementation. Independent review remains
a separate run and is not performed by this author.

Access probe rerun from repository root:
`OUTPUT_DIR=/tmp/leetcode-569-access python3 -B leetcode/569/tests/probe_official.py`.
`OUTPUT_DIR` prevents reruns from modifying the stored evidence.
Metadata preflight command and observed result: see `tests/evidence/preflight.txt`.
