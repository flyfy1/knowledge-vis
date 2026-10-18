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
