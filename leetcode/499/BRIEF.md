# #499 · The Maze III — blocked author brief / 作者阻塞记录

Status: **blocked before implementation**. This problem remains in scope.
状态：**实现前阻塞**；本题仍在范围内。

Official source: https://leetcode.com/problems/the-maze-iii/
Category: leetcode; stage: university. Intended reader: a bilingual learner who
knows basic programming and wants to reconstruct a verified solution.

## Existing design contract

Reuse the lesson pattern approved and adjudicated in
`specs/reviews/leetcode-all-hard-design-review.md`, with the workflow,
UI-I18N specification, explainer, trace, review-gate and rendered-state contracts.
The website-design skill at
`/home/songyy/Documents/agent-skills/website-design/SKILL.md` was read.
No new design or independent lesson acceptance is asserted.

## Verification blocker / 核验阻塞

On 2026-10-25 the official page required Premium access. A normal public GraphQL
request returned HTTP 200 and confirmed problem 499, title, slug and paid status;
`content` and `codeSnippets` were both null. Sample input strings were exposed,
but neither expected outputs nor their governing rules were available.
Evidence: `provenance/official-page.md`, `provenance/official-access.json`.

官方页面要求 Premium；公开 GraphQL 的题面和语言接口均为 null。
仅有样例输入不足以核验题意、预期输出、约束、异常或提交签名。
因此尚不能选择或排除 Python / TypeScript，也不能据题名编造教学内容。

## Scope and next input

P0 / highest-return work: obtain an authorized official statement capture containing
all rules, constraints, examples with outputs and explanations, and official
language-selector/code-template evidence including Python and TypeScript if
present. This can be supplied as an authorized export; no credentials are requested.
Then complete a problem-specific teaching brief before implementation.

需要下一项输入：有权访问的官方题面完整导出，以及官方语言选择器和代码模板证据。
无需提供密码或令牌。

P1: after verification, derive a tiny hand example, independent oracle and proof,
then implement the bilingual reversible simulation and canonical source mapping.
P2: optional refinement only after all required checks.
Deferred: teaching sections and their five fields, concept dependency table,
algorithm choice, canonical interface, complexity and interactive scenarios. Their
correct content depends on the missing official contract. No placeholder lesson,
language-contract, metadata, source or acceptance record is produced.

## Evidence boundaries

`tests/check_official_access.py` reproduces the public request with no credentials.
It accepts OUTPUT_DIR so a reviewer can save fresh evidence outside this folder.
The recorded result is an access check, not an algorithm test, browser audit,
learner result, independent review or LeetCode submission. No implementation
exists to exercise at the preview root. Metadata preflight is recorded separately
and is expected to fail because no unverified metadata is fabricated.
