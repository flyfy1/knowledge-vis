# #571 · Find Median Given Frequency of Numbers — blocked author brief

Status: blocked at official-contract verification. No implemented lesson or independent acceptance.

## Scope and approved design

Category: leetcode. Stage: university. Target reader: a programmer learning to
reconstruct a database algorithm and implement its actual supported interface.
Reuse the bilingual lesson pattern approved in
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
WORKFLOW.md, UI-I18N-SPEC.md, the explainer, Hard trace, review gate and rendered
state specifications, and the requested website-design SKILL.md were read.
Keep the shared tokens, locale behavior and controls when implementation resumes.
Ownership is confined to `leetcode/571/`; problem #571 remains in scope.

## Official verification

Official URL: https://leetcode.com/problems/find-median-given-frequency-of-numbers/

On 2026-10-25 the official page's extracted text showed a Premium subscription
gate. Anonymous public GraphQL returned HTTP 200, frontend ID 571, Hard,
`isPaidOnly: true`, `content: null`, and `codeSnippets: null`.
See `provenance/graphql-access.json`, `graphql-request.json`,
`graphql-response.txt`, and `official-page-excerpt.md`.

The response exposes a Numbers schema with num and frequency fields, sample
input, and database/Pandas initialization metadata. This is partial evidence,
not a verified statement or selector. The expected result, complete constraints,
null/duplicate/ordering rules, rounding/output requirements, exceptions, and
callable interfaces remain unverified. Do not infer them from the title.

Python is still the first preference, including a faithful Pandas submission
interface if verified, then TypeScript, then the required native language.
No canonical language or language-contract.json is asserted from partial metadata.

## Priorities and next required input

P0 / highest-return slice: obtain an authorized official statement capture with
all examples, constraints, notes, and the actual language selector and callable
stubs or SQL interface. An authorized export/capture supplied by the owner can
unblock verification; credentials are not needed in this repository.

P1: after verification, write the concrete causal sequence and first-use concept
table, including each step's prior knowledge, single question, input/output,
control action and visible observation, and validity conditions. Then implement
the baseline, invariant, reversible experiment, fresh prediction exercise and
canonical-code mapping using the exact shared tokens.

P2: optional refinements after correctness, bilingual accessibility and checks.

Deferred: problem-specific hand calculations, proof, solution, language contract,
runtime assets, lesson metadata and browser/oracle verification. These depend on
the unavailable official contract. A generic median lesson would not satisfy
the request and is not substituted. No placeholder page is shipped.

## Verification boundary

`tests/check_official_access.py` repeats the public GraphQL probe without
credentials and accepts OUTPUT_DIR so reruns need not overwrite this evidence.
It diagnoses access only; it is not a solution test or independent review.

Executed from repository root:

`python3 -B scripts/register_leetcode_lesson.py 571 --validate-only`

Exit 2: `Metadata validation failed: [Errno 2] No such file or directory:
'/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/571/lesson-entry.json'`.

The gate has not passed. No metadata was invented to clear it. No algorithm,
browser, learner, LeetCode submission or independent acceptance result is claimed.
No registration, campaign changes, deployment or commit was performed.

中文状态：官方页面要求 Premium 订阅；公开 GraphQL 返回的题面和代码接口均为 null。
已保存证据，题目仍在范围内。需要经授权的完整官方题面、示例、约束、说明以及语言
选择器和提交接口记录，才能继续编写课程。尚无可评审的实现，也未声称独立验收。
