# #683 · K Empty Slots — blocked author brief

Status: **blocked on official contract verification; no lesson candidate implemented**.
Problem remains in scope. This author run supplies no independent acceptance.

## Product boundary and approved design

Reuse the existing bilingual LeetCode lesson at `/leetcode/683/`, category
`leetcode`, stage `university`, for readers with basic programming knowledge.
The intended outcome is one hand-calculated example, a causal derivation, a
reversible experiment, fresh prediction, and transfer to a verified official
submission. Retain the approved shared controls, exact shared tokens, locale
state, local assets, and source/display/copy/download fidelity. No new layout
or framework is proposed.

Read: `WORKFLOW.md`, `UI-I18N-SPEC.md`, `specs/leetcode-explainers.md`,
`specs/leetcode-hard-traces.md`, `specs/leetcode-review-gates.md`,
`specs/leetcode-rendered-state-contract.md`,
`specs/reviews/leetcode-all-hard-design-review.md`, and
`~/Documents/agent-skills/website-design/SKILL.md`.
The archived design review and dispatcher adjudication approve pattern reuse;
they do not approve this lesson or waive source verification.

## Official observations — 2026-10-25

Official source: https://leetcode.com/problems/k-empty-slots/

- Web-tool opening of that URL displayed “Subscribe to unlock” and “To view this
  question you must subscribe to premium.” See `tests/evidence/web-open.txt`.
- Direct public HTTP page request returned HTTP 403; retained in
  `tests/evidence/official-page.html`.
- Public GraphQL returned HTTP 200, frontend ID 683, title `K Empty Slots`,
  slug `k-empty-slots`, and `isPaidOnly: true`.
- `content: null` and `codeSnippets: null` prevent statement and language-selector
  verification. The returned generic schema names `kEmptySlots`, integer-array
  `bulbs`, integer `k`, and integer return. This is not a verified Python or
  TypeScript submission interface.
- Public sample input strings are present, but their expected outputs,
  explanations, constraints, exceptions, indexing, and empty-input policy are
  unavailable. No semantics have been inferred from the title or sample inputs.

The exact public query, response, timestamp, and access results are in
`tests/evidence/`. No credentials were read or used. No paywall bypass attempted.

## Priorities and deferred implementation

P0 / highest-return slice: establish the full official contract and actual
supported submission interfaces. Done only when authorized official evidence
covers the statement, constraints, complete examples, exceptions, language
selector, and starter code. This prerequisite currently fails.

P1: after P0, freeze the problem-specific learning loop and per-step five fields:
reader's prior knowledge; single question; input and desired quantity; control
operation and expected visible observation; conclusion's conditions. Build a
first-use terminology/dependency table and record exact reused token values
before writing UI code. Section count follows the verified reasoning.

P2: optional refinements only after numerical, interaction, bilingual, device,
contrast, and source-parity checks pass.

Deferred because of missing official evidence: hand example, baseline, optimized
algorithm, invariant/proof, counterexample, transfer exercise, canonical language,
source files, UI, numerical/browser tests, metadata, and independent review.
Filling those fields now would invent an unverified problem contract. No runtime
placeholder or registry entry is created.

## Next needed input

An authorized official capture/export of the full statement, constraints,
examples including outputs, any exceptions, and the actual language selector
with Python starter code (or the complete observed supported interfaces if Python
is absent), with source URL and access date. Do not send credentials. Recheck
verification and finish this BRIEF before implementation once evidence exists.

中文：本题仍在范围内，但官方页面要求 Premium，公开 GraphQL 的题面和代码模板
均为空。需要有授权的完整官方题面、约束、样例输出及语言选择器/提交模板证据。
目前没有实现候选课程，也没有独立评审或通过声明。

## Reproduction and checks

From repository root:

```sh
OUTPUT_DIR=/tmp/leetcode-683-access python3 -B leetcode/683/tests/probe_official.py
python3 -B scripts/register_leetcode_lesson.py 683 --validate-only
```

The probe is an access check, not an algorithm test. It accepts `OUTPUT_DIR` so a
reviewer can preserve the frozen capture. See `tests/evidence/preflight.txt` for
the actual metadata preflight result. Numerical and lesson-browser checks are
inapplicable until the official contract allows a real candidate to be authored.
