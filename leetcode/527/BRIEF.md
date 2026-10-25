# #527 · Word Abbreviation — source-gated author brief

Status: BLOCKED before implementation. This is not a complete lesson candidate,
independent acceptance, or a LeetCode submission result. Problem #527 remains in
scope; no shared registry, campaign state, or prior acceptance is changed.

## Product and design contract

Category: computing (collection: leetcode). Stage: university.
Target reader: a bilingual reader learning to reconstruct and implement the
verified official algorithm contract. Reuse the approved local lesson pattern,
exact shared tokens, locale controls and navigation; no new universal renderer.
Design authority: `specs/reviews/leetcode-all-hard-design-review.md` and its
dispatcher adjudication. Read the requested workflow, bilingual UI specification,
explainer, Hard traces, review gates, rendered-state contract, and website-design
skill. The previously approved pattern needs no new design-review dispatch.

## Official-source verification

Official URL: https://leetcode.com/problems/word-abbreviation/
Public GraphQL: https://leetcode.com/graphql/
See `tests/evidence/access-report.json` for the timezone-qualified capture time,
request details and observed fields; raw responses are stored alongside it.
The official public GraphQL returned HTTP 200 and confirms frontend ID 527,
title, difficulty Hard, and `isPaidOnly: true`. It returns `content: null` and
`codeSnippets: null`. It supplies sample inputs and generic method metadata
(`wordsAbbreviation`, list<string> → list<string>), but these do not establish
the definition, required output rules, examples' expected outputs, exceptions,
constraints or supported submission languages and language-specific signatures.
The direct HTTP page request returned 403. A separate web-tool view of the exact
official URL displays a Premium subscription restriction; its readable excerpt
is retained in `tests/evidence/official-web-view.md`.
No authentication, cookies, credentials, alternate region, or paywall bypass was
used. A remembered algorithm or unofficial reproduction cannot fill these gaps.
No canonical language or complexity claim has been selected without evidence.

## Learning loop and scope once unblocked

The intended output is one complete bilingual lesson with a tiny hand calculation,
a derived baseline and causal rule, invariant/proof, reversible local simulation,
fresh prediction/reveal exercise, canonical-source mapping and honest boundaries
and costs. The exact section sequence is deliberately pending official evidence.
Each eventual step must specify known facts, one question, input/requested quantity,
control action and expected observation, and applicability conditions. The term
first-use/dependency table, concrete examples, counterexample and trace contracts
cannot responsibly be populated before the official rules are available.
Simulation and execution will be labeled separately. Locale changes preserve state.

P0 / highest-return work now: establish and retain the official-source access
boundary, provide a rerunnable check, and report the missing evidence honestly.
P0 after access: write the concrete five-field step plan before implementation,
then implement the complete lesson and its canonical execution/browser checks.
P1: only refinements supported by actual lesson states. P2: optional decoration.
Deferred: implementation, source mirrors, metadata, algorithm tests and browser
lesson testing because there is no verified statement or language selector.
No placeholder UI or fabricated completion is shipped. Independent review remains
pending and requires a separate run after a complete candidate exists.

## Next required input

An authorized official capture/export for #527 containing the full statement,
constraints, examples with outputs, exceptions, and official language selector
with relevant starter interfaces. Python is preferred when faithful and officially
supported, then TypeScript, then the required native language. Supply that official
material directly or make it available through normally authorized access; this
run will not inspect credentials or attempt to bypass Premium.

## Reproduction and validation boundary

From the repository root:

```
OUTPUT_DIR=/tmp/527-access python3 -B leetcode/527/tests/check_official_access.py
python3 -B scripts/register_leetcode_lesson.py 527 --validate-only
```

The access check writes dated evidence to the selected output directory and prints
whether the statement and snippets are available. A future accessible response
requires further actual verification; this script does not validate the algorithm.
The metadata preflight result is saved under `tests/evidence/metadata-preflight.txt`.
Its expected failure for absent metadata confirms this is not a ready candidate;
no fabricated metadata is added to clear the gate. No lesson/browser/canonical
execution checks or independent acceptance are claimed.
