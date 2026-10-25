# #631 · Design Excel Sum Formula — authoring blocked

## Scope and status / 范围与状态

Category: algorithms (collection category: leetcode). Stage: university.
Target reader: a bilingual reader who wants to reconstruct the verified official
contract, explain its mechanism, and implement the supported submission interface.
Status: official-source access blocker; not an implemented or self-checked lesson.
Problem remains in scope. No independent acceptance or publication is claimed.

当前状态：官方题面无法访问，尚未实现课程。题目仍在范围内；未取得独立评审通过，未发布。

## Reused design contract

Reuse the existing lesson pattern approved in
`../../specs/reviews/leetcode-all-hard-design-review.md`, including dispatcher
adjudication. Follow WORKFLOW, UI-I18N-SPEC, explainers, Hard traces, review gates,
rendered-state/source-fidelity specification, and the website-design skill.
No new layout or design review is proposed. Implementation would use existing
`../common.js` and `../style.css` tokens, local algorithm state, bilingual text,
preserved locale state, and separate simulation versus executable-source labels.

## Official verification, 2026-10-25 UTC

Official URL: https://leetcode.com/problems/design-excel-sum-formula/

- The web tool's official-page extraction displays “Subscribe to unlock.” and
  “Thanks for using LeetCode! To view this question you must subscribe to premium.”
- Direct unauthenticated GET returns HTTP 403; raw response retained.
- Public GraphQL POST returns HTTP 200 and confirms frontend ID 631, title,
  Hard difficulty, and `isPaidOnly: true`.
- GraphQL `content` and `codeSnippets` are both null. It does expose sample
  invocation inputs and metadata for class `Excel` with constructor and
  `set`, `get`, `sum` methods. These observations do not establish the statement's
  rules, constraints, exceptions, expected example results, or selectable languages.
- No submission language has been selected. Null snippets are not evidence that
  Python or TypeScript is unsupported. No language contract is fabricated.

Evidence: `tests/evidence/access-results.json`, `graphql-request.json`,
`official-graphql.json`, `official-page.html`, and `official-web-extract.txt`.
Requests used normal public endpoints without authentication. Credentials were
not read, and no paywall workaround was attempted.

## Next needed input / 继续所需资料

Provide a lawfully obtained official statement capture including full rules,
constraints, examples with expected outputs, exceptions, and official language
selector plus submission stubs (especially Python and TypeScript), or make the
official page normally accessible through authorized access. Do not send secrets.

需要合法取得的官方完整题面（规则、约束、示例及输出、例外说明），以及官方语言选择器和
提交接口的记录，尤其是 Python 与 TypeScript；也可提供正常授权的官方访问方式。无需发送密钥。

## Implementation planning gate

The verified statement is required before defining the learning loop, concrete
hand calculation, baseline, invariant, counterexample, transfer exercise, step
five-field outlines, and first-use terminology table. Defining these now would
substitute presumed spreadsheet behavior for the official contract.

Highest-return slice: verify the contract before producing teaching artifacts.
P0: resolve official access, then complete the problem-local causal brief and
faithful executable solution, bilingual interactions, and required self-checks.
P1: refinements within the approved pattern after P0 passes.
P2: no optional decoration planned.
Deferred: implementation, metadata, browser/oracle checks, source parity, and
independent review until the official contract is verified. No placeholder page
or presumed canonical source is shipped.

## Non-mutating preflight

From repository root:
`python3 -B scripts/register_leetcode_lesson.py 631 --validate-only`

Observed exit code: 2.
Output: `Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/631/lesson-entry.json'`

This is an expected incomplete-candidate failure, not a passing metadata gate.
No registry, campaign state, prior review, shared asset, or service was changed.
