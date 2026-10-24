# #428 · Serialize and Deserialize N-ary Tree

Status: BLOCKED — official problem contract unavailable. Author run only;
no complete lesson candidate, independent acceptance or LeetCode acceptance.

## Approved product contract

Reuse the existing LeetCode lesson pattern, shared common.js/style.css, exact
shared tokens and locale controls under the approved design review and dispatcher
adjudication in specs/reviews/leetcode-all-hard-design-review.md. This blocker
record does not reopen the design gate. Category: computing (problem category:
algorithms). Stage: university. Target reader: a learner reconstructing a Hard
problem's algorithm and transferring the reasoning to its official submission
interface.

Read before work: WORKFLOW.md, UI-I18N-SPEC.md,
specs/leetcode-explainers.md, specs/leetcode-hard-traces.md,
specs/leetcode-review-gates.md, specs/reviews/leetcode-all-hard-design-review.md,
and /home/songyy/Documents/agent-skills/website-design/SKILL.md.

## Source verification and blocker

Official URL: https://leetcode.com/problems/serialize-and-deserialize-n-ary-tree/
Access date: 2026-10-25 Asia/Singapore (2026-10-24 UTC).

- The normal web open shows a Premium subscription gate. The observation is in
  tests/evidence/official-web-observation.md.
- An ordinary anonymous GET returned HTTP 403, captured in
  tests/evidence/official-page.html.
- The ordinary public GraphQL query returned HTTP 200 with official frontend ID
  428, matching title/slug, difficulty Hard, and isPaidOnly true. Both content
  and codeSnippets are null. Request, full response and timestamped access
  summary are in tests/evidence/.
- Statement, constraints, examples, exceptions, language selector and callable
  interface remain unverified. Null snippets do not mean Python is unsupported;
  no canonical language has been selected.

No credentials were accessed, no paywall was bypassed, and no third-party or
remembered statement was substituted. The problem remains in scope. The title
alone is insufficient to determine an official contract.

## Next needed input

Provide an authorized official statement capture including all constraints,
examples and notes, plus the official language selector and submission starter
code (Python first; complete available interfaces if another language is needed).
Alternatively, make normal authorized Premium access available through an
approved environment without sending credentials in chat. Once available,
verify the contract and write the complete five-field steps, term dependency
table, tiny hand calculation, invariant, counterexample and transfer exercise
before implementation.

## Scope and priorities

Highest-return slice / P0: obtain the verified official contract, then build the
complete bilingual learning loop and test its canonical executable solution,
reversible simulation, accessibility and source parity. P1: refinements within
the approved pattern after P0. P2: no decoration currently planned.

Deferred: step-specific input/output claims, baseline, invariant, numerical
bounds, presets, language decision and cost claims all require the missing
contract. Fabricating them would undermine reproducible review. Browser checks
and solution/oracle tests require an implemented candidate and have not run.
No placeholder route or guessed lesson-entry.json is supplied.

## Author checks

Reproduce normal public access (output may be redirected for a reviewer):

    OUTPUT_DIR=/tmp/leetcode-428-access python3 -B leetcode/428/tests/check_official_access.py

Author execution used the default lesson-local tests/evidence directory.
Observed: GET 403; GraphQL 200 with null content and codeSnippets.

Required non-mutating preflight, run from repository root:

    python3 -B scripts/register_leetcode_lesson.py 428 --validate-only

Exit status: 2. Output:

    Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/428/lesson-entry.json'

This failure is expected for the blocked, unimplemented lesson and prevents
readiness. No registration, shared-file edits, campaign-state changes, commits,
deployment, services, schedules or reviewer claims were made.

## 中文阻塞说明

官方页面要求 Premium 订阅；公开 GraphQL 虽成功返回题号、标题和 Hard
难度，却把正文与代码模板均返回为 null。因此题意、约束、示例、例外规则及
官方提交接口均未核实，不能凭标题或记忆编写课程，也不能断言不支持 Python。
本题仍在任务范围内。下一步需要合法获取的官方完整题面、语言选择器及对应
代码模板。当前仅保存访问证据与阻塞说明，未完成课程、浏览器自查或独立评审。
