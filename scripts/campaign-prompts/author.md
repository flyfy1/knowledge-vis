Implement ONE complete bilingual interactive LeetCode knowledge lesson.
Problem metadata: {problem_json}
Repository: {repo}
Preview root: {base_url}

The human requests every current Hard problem, with a separate agent review for
each. This is the author run only. Do not claim independent acceptance. Read
WORKFLOW.md, UI-I18N-SPEC.md, specs/leetcode-explainers.md,
specs/leetcode-hard-traces.md, specs/leetcode-review-gates.md,
specs/reviews/leetcode-all-hard-design-review.md, and
~/Documents/agent-skills/website-design/SKILL.md. Product/design review and dispatcher
adjudication already approve the reused lesson pattern; keep that contract and
write a problem-local BRIEF before implementation. Reuse exact shared tokens.
Five sections are a default, not a forced optimization narrative.

Verify the official statement, constraints, examples, supported Python interface,
and exceptions from the official URL or public GraphQL. For paid content use only
normally available authorized access; do not bypass a paywall, invent a statement,
or use a presumed title as its contract. If unavailable or Python cannot faithfully
implement the official interface, return blocked with specific evidence and next
needed input. Retain the problem in scope. Database/Pandas problems may have a
Python DataFrame interface; JavaScript-specific problems may be incompatible.

Own ONLY leetcode/<id>/ and tests inside that folder. Do not edit shared assets,
registry, other lessons, scripts, workflow, Git config, or system services. Do not
commit, push, deploy, spawn agents, create schedules, or touch credentials.
Use existing leetcode/common.js, style.css and controls where appropriate.
You may reuse the first-ten page skeleton but MUST NOT run its generator (it owns
other lessons). A queen board is not a Sudoku board; implement the necessary local
renderer honestly. Avoid a universal visualization framework. Prior lessons may
be read for conventions after the design documents.

Deliver index.html, app.js, copy.js, solution.py, python-code.js (exact Python
source embedded), BRIEF.md, a numerical core if needed, and reproducible tests.
Create lesson-entry.json with id, title:{zh,en}, desc:{zh,en}, difficulty:'hard',
topics:[{zh,en}], path:'<id>/', leetcodeUrl, language:'Python', complexity,
concepts:[{name,step:<integer>,description}]. Titles clearly show #<id>; include
separate official link. Python is canonical; JS trace is not Python execution.
Use a real causal explanation, hand calculation, baseline, invariant/proof,
small reversible interactive experiment, fresh predict-before-reveal exercise,
Python mapping, boundaries and honest costs. Fresh examples and counterexamples
must be problem-specific, not generic template filler. Related anchors must exist.
All system text/feedback/accessibility labels need Chinese and English; locale
preserves state. No external fonts/assets. No placeholders or fake completion.

Run independent baseline/oracle checks, intermediate invariants, boundaries and
small exhaustive/seeded cases. Exercise the REAL browser, both locales, all presets,
forward/back/reset/endpoints, prediction then reveal then change, copy/fallback,
320/390/desktop widths and 200% zoom, keyboard/focus, source/download parity,
local asset errors and measured contrast. Store tests and self-check evidence in
this lesson folder. Browser packages are available via NODE_PATH; if set, use
process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH as launch executablePath. Use the
already-running preview URL; don't start a persistent service. Headless screenshots
must be visually inspected, not only produced. Keep shipped CSS under 25000 bytes.
A self-check is not a separate review and must not claim actual learner results.

Return JSON matching the supplied output schema: outcome ready only with complete
candidate and actual checks; otherwise blocked, detail explaining the evidence.
