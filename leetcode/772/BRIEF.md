# #772 · Basic Calculator III — blocked author brief / 作者阻塞记录

Status: blocked before implementation. This problem remains in scope. This is
an author access investigation, not an implementation candidate or independent review.

## Product and design boundary

Category: leetcode / computing; stage: university. Target: readers comfortable
with basic programming who want to reconstruct the official algorithm through
hand calculation, reversible interaction and canonical executable code.
Reuse the approved lesson pattern and exact shared tokens from
`../style.css`, with `../common.js` locale behavior. Design authority:
`../../specs/reviews/leetcode-all-hard-design-review.md`, including dispatcher
adjudication. No new layout, framework or design review is proposed.

Read before author discovery: WORKFLOW.md, UI-I18N-SPEC.md,
specs/leetcode-explainers.md, specs/leetcode-hard-traces.md,
specs/leetcode-review-gates.md, specs/leetcode-rendered-state-contract.md,
specs/reviews/leetcode-all-hard-design-review.md and
`~/Documents/agent-skills/website-design/SKILL.md`.

## Official access observations

Official source: https://leetcode.com/problems/basic-calculator-iii/

On 2026-10-25 the web tool's official-page view displayed the Premium gate.
See `tests/evidence/official-web-observation.md`. Ordinary public GraphQL POST
and GET both returned HTTP 200 with frontend ID 772, title Basic Calculator III,
`isPaidOnly: true`, `content: null` and `codeSnippets: null`.
The separately reproducible POST response and HTTP page capture are retained in
`tests/evidence/`; their exact capture timestamp is in `access-report.json`.
The direct HTTP page capture returned 403; the web tool separately exposed the
subscription gate. These are different access observations, not a successful
authenticated page retrieval.

Public metadata names `calculate`, takes one string `s`, and returns an integer.
Three raw example inputs are exposed. These do not establish the full statement,
expected outputs, constraints, arithmetic exceptions or supported language stubs.
No supported Python or TypeScript interface has been verified. Null snippets
do not establish that either language is unsupported. No canonical language is selected.

## Required next input / 所需下一步资料

Provide an authorized official capture of the complete statement, examples with
outputs, constraints and exceptions, together with the actual language selector
and submission templates (including Python and TypeScript when offered).
Alternatively, make normally authorized official access available for a later
run. Do not send passwords, cookies, tokens or other credentials into this folder.

需要有权访问者提供官方完整题面、带输出的示例、约束与例外规则，以及实际语言选择器
和提交模板；如支持 Python 或 TypeScript，也必须保留。当前公共接口的空字段不能
证明语言不受支持。题目仍在范围内；资料核实前不能据标题推测实现。

## Scope and priorities

Highest-return slice and P0: verify the official contract before selecting a
language or deriving algorithm states. Done when the full statement and faithful
submission interfaces can be audited from authorized evidence.
P1: after P0, write the full per-step five-field teaching brief and first-use
term dependency table, then implement the bilingual causal lesson and tests.
P2: optional presentation refinement after all actual checks.

Deferred: problem-specific examples, baseline, invariant/proof, trace renderer,
fresh prediction, solution, metadata and browser checks. Their engineering
dependency is the missing verified contract. No speculative five-step outline,
fake runnable lesson or fabricated language contract is supplied.

## Reproducible evidence and readiness

Run from the repository root:

```
OUTPUT_DIR=/tmp/leetcode-772-access python3 -B leetcode/772/tests/check_official_access.py
python3 -B scripts/register_leetcode_lesson.py 772 --validate-only
```

The access probe returns exit 2 when the complete contract is unavailable.
It uses public official endpoints only and never reads credentials. OUTPUT_DIR
allows reviewers to preserve these frozen captures. Metadata preflight output
and exit status are recorded in `tests/evidence/metadata-preflight.txt`.
Observed access-probe result: `blocked`, exit 2, at
2026-10-25T10:37:12.748093+00:00. Observed metadata-preflight result: exit 2,
`Metadata validation failed` because `lesson-entry.json` is absent. This expected
failure preserves the readiness gate for this unimplemented, access-blocked lesson.
There is no implementation to execute or inspect in the preview browser;
algorithm/oracle, bilingual UI, responsive/zoom, clipboard, contrast and source
parity checks remain unperformed. No learner outcome, LeetCode submission,
independent acceptance, registration or deployment is claimed.
