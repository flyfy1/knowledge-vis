# Independent JavaScript exception policy review

Date: 2026-10-18. Reviewer: separate collaboration agent
`/root/javascript_policy_review`; implementation was performed by the dispatcher
and `/root/javascript_policy`. This is a policy, queue-code, registration, and
focused collection-copy review. It is not an independent acceptance of any of
the six future JavaScript lessons.

Reviewed base: `a7fe5f11e868b3b10eddb2456e40a2a5d74da9e5`, with the task-owned
working-tree changes identified by the hashes below. Unrelated Pythagoras files
were excluded. The reviewer changed only this report, used disposable fixtures
for registration tests, and made no Pi, deployment, or Git-history changes.

## Scope and result

**Accepted for the stated policy change; zero required findings remain open.**
The user explicitly selected the original JavaScript interface plus a labeled
Python conceptual comparison for IDs 2630, 2650, 2675, 2691, 2756, and 2759.
The implementation requires both membership in that exact set and the catalog's
`javascript` category. Other problems continue to require Python. Catalog drift
fails closed instead of silently broadening the exception.

The runner requires `solution.js`, `javascript-code.js`, `concept.py`, and
`python-code.js` for those six, alongside the normal lesson files and metadata
for an unregistered candidate. A Python-only JavaScript candidate returns to
authoring; missing comparison files stop before review. Registration checks
the language against the same policy before writing shared files.

Author, fix, and reviewer instructions consistently distinguish the submittable
JavaScript solution from the Python analogy, require bilingual limitations and
separate controls, and require exact displayed/copied/downloaded parity for both
sources. They require JavaScript contract tests for applicable identity,
mutation, callbacks, `this`, promises, errors, and timing. The Python comparison
cannot substitute as an oracle for different JavaScript semantics.

The frozen weights (15, 20, 20, 20, 15, 10), 85-point threshold, per-dimension
minimum of 3, and zero-open-required-findings gate are unchanged. The fifth
dimension has an explicit prospective interpretation for the six exceptions.
The historical #2916 rubric and #51 review reports are untouched. The appended
design adjudication preserves the earlier decision and records its narrow,
owner-authorized amendment. Process groups, locks, candidate fingerprints,
reviewer independence, and immutable prior evidence have no implementation diff.

## Required finding and closure

### JS-P1 — conflicting numeric title prefix could be registered

Severity: P2, required for this registration change. Initially, registration
removed a matching `#51 ·` prefix but deliberately preserved a wrong `#52 ·`
prefix. A disposable reproduction using the real #51 metadata with English
title `#52 · N-Queens` successfully registered the rendered heading
`#51 · #52 · N-Queens`, while the official link still targeted N-Queens (#51).
This violates the prominent, unambiguous problem-ID requirement.

Requested correction: reject a recognized leading numeric `#<id> ·` prefix
whose ID differs from metadata before any shared-file writes; normalize a
matching prefix while preserving the reviewed metadata file.

**Closed after implementer correction and independent recheck.** Registration
now validates each title's recognized prefix before normalization. Regression
cases independently set a wrong prefix in English and Chinese and assert that
registry, collection HTML, concept map, and source metadata remain byte-identical
on rejection. Matching-prefix and name-only cases still pass. The correction
does not edit an accepted lesson's source metadata or silently change the wrong
number to a plausible one.

## Observed validation

- Independently ran `python3 -m unittest discover -s scripts -p 'test_leetcode_*.py'`:
  **26 tests passed in 22.609 seconds**. These include language gating, all four
  JavaScript/comparison required sources, Python behavior, no-write registration
  rejection, title normalization, registry preservation, review mutation,
  historical evidence protection, process cleanup, locks, and incomplete status.
- Ran `git diff --check`: clean.
- Independently launched Playwright Chromium against the actual local preview
  `http://127.0.0.1:18771/leetcode/`, at widths 320 and 1440 in both locales.
  All four cases rendered 12 cards, no document overflow, and the revised
  language-policy footer. #51 appeared exactly once in `#51 · N 皇后` and
  `#51 · N-Queens`, with a separate exact N-Queens official URL. No page errors
  or HTTP responses at or above 400 occurred.
- Captured and visually inspected the full English desktop collection at
  `/tmp/leetcode-policy-review-en-desktop.png`. The name/ID hierarchy and separate
  lesson/official links remain intact. This temporary screenshot is supporting
  local evidence, not a committed or public artifact.

## Boundary and deferred work

No JavaScript lesson was implemented or evaluated by this policy review.
Correctness of actual JavaScript solutions, Python comparisons, their runtime
semantics, and pedagogical transfer still requires each lesson's own author
tests and fresh independent review. These tests use a fake agent CLI for queue
control behavior; they do not prove model compliance. The focused browser check
does not repeat the existing lessons' teaching reviews or prove real-device or
production behavior. Applying this policy on the Pi and preserving its live
ledger is a separate dispatcher maintenance step.

## Reviewed file fingerprints (SHA-256)

```text
a72467ee8c12e34d231bcb5e6f01a99183b6394ff76f65c7c8c1a75552591cc9 scripts/leetcode_campaign.py
cda085cd6cd29e034a6cea35a9953838d351f7419682b2677ce6ed64c2a9091f scripts/register_leetcode_lesson.py
363effb6bd375bc201d5dedfd960c343da1b081972f48941ff6934745b1cbf78 scripts/test_leetcode_campaign.py
192c7dc460b76114d0734bc73c1c641195d121cd56f23158db11c18e1714f2dc scripts/test_leetcode_registry.py
a70f8921d22976eaf7b0b910463b8704ce91895ab62e057dea5b8893c45efb39 scripts/campaign-prompts/author.md
33f18aa050a08f00aa3681d33cb03d53b015bfcf56367e61e11771b9c3569fcf scripts/campaign-prompts/fix.md
1e4c4e004f15a0c2ffa8a4fbd094c4b29e57b29e7e194a7b2a191236ef63a783 scripts/campaign-prompts/review.md
519d2e4622773d2ef89e71c6553effe3cbd91dfa637c1b89f10975c606d61c2a specs/leetcode-explainers.md
5aa8eda97f20acee20d981b4d4355e3ea21cabe2f6899aea0e40d1e8c157db8f specs/leetcode-review-gates.md
dc246c2f77ed503bb1441e20ce8bbff09af53a8fa0b3928d1dc48bf13ce9954e specs/leetcode-all-hard-campaign.md
3ab6e643138a25c1d9ab4039356156706882b90f64a3e6aa4ada401ebeec54b0 specs/reviews/leetcode-all-hard-design-review.md
e71448ac7d679b88cfb757003111e03b5c0d83991a6e50784d5b888d1ef0fbe7 leetcode/index.html
1b2eb74dae763998c298b31c1f78901e5bff5dd7ed79c1dba4a59475f8692dad leetcode/problems.config.js
```

## Follow-up — exact-six choice with general language fallback

Reviewed 2026-10-18 by `/root/javascript_policy_review`, separately from
`/root/language_fallback`. Base HEAD:
`5c6e49a` (Register independently reviewed LeetCode 60 locally). This follow-up
preserves the initial review above as historical evidence. The general policy
has since become faithful Python > supported TypeScript > required native
language; the user's explicit original-JavaScript choice remains a narrower
exception for the exact six JavaScript-category problems.

**Accepted for this narrow clarification; no required findings.** The resolver
checks both the exact ID set and catalog category, then requires JavaScript for
those six even when the recorded supported interfaces also include TypeScript
or Python. All other records retain the general fallback ordering. The existing
contract continues to require the correct official URL, complete observed
supported-language list, interface and rationale, timezone-qualified verification
time, and nonempty lesson-local evidence. That evidence still needs independent
verification; a syntactically valid contract is not proof of actual availability.

The author, fix, review, explainer, campaign, and rubric documents now agree on
the exception's precedence and retain the separate conceptual-only Python
comparison. They do not permit hiding an available TypeScript interface to
justify JavaScript. Instead, the rationale records the owner's exact-six choice.
The design record appends a clarification without rewriting earlier decisions.
No scores, historical lesson reviews, or acceptance thresholds were changed by
this clarification. The narrow resolver diff does not alter locks, fingerprints,
process control, or publication behavior.

Independent validation:

- `python3 -m unittest discover -s scripts -p 'test_leetcode_*.py'` passed all
  **47 tests in 71.657 seconds** (campaign, registry, and existing publisher suites).
- Re-ran the final registry test file after the implementer supplemented its
  parity regression: **8 tests passed in 0.922 seconds**. The exact-six test covers
  all six IDs, accepts JavaScript with Python/TypeScript listed, rejects either
  of those as canonical for the six, and rejects either corrupted source mirror.
  The existing non-six tests still exercise Python > TypeScript > native.
- Separately constructed temporary contracts for every one of the six IDs and
  performed **18 independent checks**: valid JavaScript/comparison pairs pass;
  changing `javascript-code.js` fails; changing `python-code.js` fails. These are
  synthetic policy fixtures, not claims about current official selectors.
- `git diff --check` passed. The campaign fixture now offers JavaScript and
  TypeScript while still completing author/reviewer/registration with
  `solution.js` and the Python comparison; missing required files remain blocked.

Scope limits: this follow-up does not accept any future JavaScript lesson, prove
runtime semantics or learning outcomes, apply the policy to the Pi, or verify
public deployment. In-flight lane-importer files, the separate campaign
publication docstring change, the parallel-preparation section, and unrelated
Pythagoras changes are outside this review. The policy content of the campaign
spec was checked; its full-file hash below also identifies that concurrent
out-of-scope section. No browser check was repeated because this clarification
changes code policy and documents, with no collection UI diff in its scope.

Follow-up reviewed SHA-256 fingerprints:

```text
bdf7e690a7e8fa975eccfbbfc079323ff790546fd946d17624bdd0610ccf497a scripts/register_leetcode_lesson.py
5d566286e5f19ef222225046b6047d69ec028d8415cebda0ffa85435376377af scripts/test_leetcode_campaign.py
e43c97883474a6d4e429c238ce077df43db5118a9fae23904d87b7f1da4bea88 scripts/test_leetcode_registry.py
3254f8f11802b47980f5cc08fd3f1edea6950180337f442b278ce7f73ecfd07a scripts/campaign-prompts/author.md
e7db92a1aac059766d9f29c6406d5aa069aba07ed6b6870d35532bdfb7f78dde scripts/campaign-prompts/fix.md
6b03ba313977986ebe7bb4e683474d9cdc35d8b545d40a676ab4c04a72fdbfc6 scripts/campaign-prompts/review.md
f79d88a47248f357f35401df03a00479f1f6e6923cc225f18fc0841af067bacb specs/leetcode-explainers.md
cd5f5a96fa6cecf3d7819ca6d0aa79729661b8fecffb9fdcc62875171b7c6cf8 specs/leetcode-review-gates.md
ae897815192372206dbec72995abc80d8d9f84f9276d4e5db7ba9d1f5136c59b specs/leetcode-all-hard-campaign.md
a1d9d6bc23d15e7369eb04252ff00d0302d5b1786641f5c7f7587ecf64d31086 specs/reviews/leetcode-all-hard-design-review.md
```
