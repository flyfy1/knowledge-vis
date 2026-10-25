# #588 · Design In-Memory File System — blocked author brief

Status: blocked at official-contract verification, 2026-10-25. This problem remains
in scope. No implemented candidate, language choice, independent acceptance,
LeetCode submission acceptance, or delivery is claimed.

## Product boundary and approved design

Category: leetcode / computing; stage: university. Audience: bilingual algorithm
learners. Immediate job: reconstruct the actual official file-system behavior,
derive sufficient maintained state, and implement an officially supported solution.
Smallest useful outcome: one complete bilingual lesson with a reversible experiment,
fresh predict-before-reveal exercise, canonical source, and reproducible checks.

Verdict: reuse the approved lesson pattern, with problem-local state and rendering.
Design authority: `../../specs/reviews/leetcode-all-hard-design-review.md`, including
dispatcher adjudication. Read alongside `../../WORKFLOW.md`, `../../UI-I18N-SPEC.md`,
`../../specs/leetcode-explainers.md`, `../../specs/leetcode-hard-traces.md`,
`../../specs/leetcode-review-gates.md`, and
`../../specs/leetcode-rendered-state-contract.md`. Website-design skill read at
`/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
The existing design review is carried forward; this author run does not conduct
or claim a separate review. No new layout or shared framework is proposed.
After access, inherit exact shared tokens and controls from `../style.css` and
`../common.js`. No CSS, runtime assets, registry, shared files, or services changed.

## Observed official evidence

Official URL: https://leetcode.com/problems/design-in-memory-file-system/

The web reader displays “Subscribe to unlock.” and a premium-subscription notice.
A direct unauthenticated page request returns HTTP 403. Public GraphQL returns
HTTP 200, matching ID/title/slug, difficulty Hard, and `isPaidOnly: true`.
It returns `content: null`, `translatedContent: null`, and `codeSnippets: null`.
It exposes sample operation inputs and abstract method metadata for `FileSystem`,
`ls`, `mkdir`, `addContentToFile`, and `readContentFromFile`.

Those names, abstract parameter types, and sample inputs do not establish the
method semantics, expected outputs, constraints, path validity guarantees,
exception rules, or currently selectable language-specific starter interfaces.
Python and TypeScript availability are unknown, not absent. No canonical
language or language-contract.json is fabricated from the method names.
No credentials were inspected or used; no alternate content mirror or paywall
bypass was attempted.

Evidence: `tests/evidence/official-web-observation.md`, `graphql-request.json`,
`graphql-response.json`, `official-page-error-body.txt`, and `access-summary.json`.

## Priorities and missing input

P0 / highest-return work: preserve the access evidence and obtain an authorized
official capture of the complete statement, constraints, examples with outputs,
exceptions, and actual language selector plus relevant starter interfaces.
The user may supply such a capture from authorized access, or authorized official
access must be made available through the normal workflow; do not send credentials.
Select Python first, then TypeScript, then required native language from that evidence.

P1: after verifying the contract, write the complete problem-local step plan before
implementation. Each step will state prior knowledge, one concrete question,
inputs/requested output, control action/visible observation, and applicability.
Build a first-use term dependency table and derive hand calculations, a tempting
wrong rule with a counterexample, an independent baseline, invariant/proof, and
fresh transfer exercise from the verified rules.

P2: optional refinements after complete checks. Deferred: the problem-specific
step sequence, term definitions, source code, mirrors, metadata, and rendering.
Their correctness depends on unavailable official semantics. No placeholder lesson
or guessed canonical solution is shipped. No mathematical cost claims are made.

## Verification boundary and resumption

Access probe (repository root):
`OUTPUT_DIR=/tmp/leetcode-588-access python3 -B leetcode/588/tests/probe_official.py`
The environment variable redirects generated evidence so reviewer reruns need
not change the saved snapshot. Initial execution succeeded as an access probe;
`contractAvailable: false` is not a lesson-test pass.

After access: execute the canonical source against an independently derived
oracle, including intermediate invariants, applicable boundaries, small exhaustive
and seeded cases. Label browser traces as simulations. Exercise both locales,
all presets, rewind/reset/endpoints, prediction/reveal/change, locale preservation,
clipboard and fallback, exact embedded/displayed/copied/downloaded source parity,
keyboard/focus, 320/390/desktop widths, 200% zoom, local assets and measured contrast.
Visually inspect screenshots. Independent review remains a separate future run.

Metadata preflight command: `python3 -B scripts/register_leetcode_lesson.py 588 --validate-only`.
Observed command output and exit status are preserved in `tests/evidence/preflight.txt`.
The missing lesson metadata is intentional while the official contract is blocked;
preflight failure cannot be cleared by inventing metadata or changing the registry.

## 中文状态

本题仍在任务范围内，但官方题意核验受阻。官方页面要求 Premium；公共 GraphQL
返回的题面和语言代码模板均为 null。方法名称和样例输入不足以确认完整行为、
约束、异常规则、预期输出或支持的提交语言。需要有授权的官方完整题面、约束、
样例输出及语言选择器与初始接口截图或文本后才能继续。尚未实现课程，也未获独立验收。
