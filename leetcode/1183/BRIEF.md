# #1183 Maximum Number of Ones — blocked author brief

Status: blocked at official-contract verification (2026-10-27 Asia/Singapore). This author run does not claim implementation, independent review, acceptance, publication, or learner outcomes.

## Product boundary and approved design

Category: algorithms (collection); stage: university. Audience: bilingual algorithm learners. Immediate job: reconstruct the official problem and its algorithm through a hand calculation, reversible visual simulation, and the exact supported submission interface. Smallest useful outcome: one complete verified lesson, not a guessed Premium-problem page.

The approved lesson pattern and dispatcher decisions are carried forward from `../../specs/reviews/leetcode-all-hard-design-review.md`, together with the required workflow, explainer, trace, review-gate, rendered-state, and website-design contracts. No new layout or shared architecture is proposed. Only `leetcode/1183/` is owned for this run.

## Verification gate

Official source: https://leetcode.com/problems/maximum-number-of-ones/

A page-reader view of the official page displays “Subscribe to unlock” and says the question requires Premium; a direct unauthenticated HTTP capture instead receives a Cloudflare 403 challenge. An unauthenticated public GraphQL query confirms the slug/title, `isPaidOnly: true`, and Hard difficulty, but returns `content: null`, `translatedContent: null`, and `codeSnippets: null`. The GraphQL response exposes only an example-testcase string and hints; those do not establish the complete statement, constraints, output semantics, indexing rules, exceptions, or actual language selector/templates. The returned backend `questionId` is `1152`, while the repository’s verified catalog record is ID `1183`; this mismatch is recorded rather than silently normalized.

No canonical language is selected. Python remains preferred only after an authorized official capture proves a faithful Python interface; TypeScript or the required native language cannot be selected from the available evidence. No solution source, language-contract.json, lesson-entry.json, or runtime page is fabricated.

Evidence files:

- `tests/evidence/official-page-observation.md`
- `tests/evidence/graphql-request.json`
- `tests/evidence/graphql-response.json`
- `tests/evidence/access-summary.json`
- `tests/probe_official.py`
- `tests/evidence/preflight-validate-only.txt`

## Author and separate blocker review

Author self-check preserved the access probe and safe preflight evidence. A separate blocker audit is recorded in `tests/evidence/review-blocker.md`; it confirms the contract is unavailable and is not independent lesson acceptance.

## Missing input / resumption

Provide an authorized official statement capture containing the full description, constraints, examples and outputs, indexing/modulus details, exception rules, and the actual language selector plus starter interface; or make normal authorized Premium access available. Do not share plaintext credentials and do not bypass the paywall.

After that evidence is available, write each lesson step with the five required fields (known facts, one question, inputs/output, control action/visible observation, and applicability), derive a simple baseline and invariant, implement the canonical submission and its exact offline mirror, build the bilingual reversible experiment, and run the independent oracle/browser/source/metadata checks. A separate review remains required after a complete candidate exists.

## 中文状态

本题仍在范围内，但官方契约核验受阻。官方页面要求 Premium；公共 GraphQL 虽确认题名、slug、Hard 和付费属性，却返回完整题面与代码模板为空。现有 hints 和样例输入不足以确认约束、输出、索引规则、异常处理或语言选择器，因此不能诚实选择提交语言或编写解法。需要经授权的完整官方题面及语言接口记录后才能继续。
