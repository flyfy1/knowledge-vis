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

Verify the official statement, constraints, examples, supported solution interface,
and exceptions from the official URL or public GraphQL. For paid content use only
normally available authorized access; do not bypass a paywall, invent a statement,
or use a presumed title as its contract. Default to Python. The human explicitly
approved original JavaScript solutions for the six catalog JavaScript problems
2630, 2650, 2675, 2691, 2756 and 2759, accompanied by a Python conceptual comparison.
For these six verify the original JavaScript contract, including identity,
mutation, this binding, callbacks, promises, rejection and timing where applicable.
Do not present the Python comparison as an equivalent LeetCode submission or claim
cross-language runtime semantics are identical. For all other problems, if the
statement is unavailable or Python cannot faithfully implement an official
interface, return blocked with specific evidence and next needed input. Retain
the problem in scope. Database/Pandas problems may have a Python DataFrame interface.

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
For the six approved JavaScript problems, replace solution.py with solution.js
(canonical official solution), javascript-code.js (exact solution.js embedded),
and concept.py (clearly labeled Python conceptual comparison); python-code.js
must embed concept.py exactly. Provide separate labeled source/copy/download
controls and bilingual limitations explaining where the Python analogy differs.
Create lesson-entry.json with id, title:{zh,en}, desc:{zh,en}, difficulty:'hard',
topics:[{zh,en}], path:'<id>/', leetcodeUrl, language:'Python', complexity,
concepts:[{name,step:<integer>,description}]. Metadata title values omit the ID
because the collection renderer adds it. The lesson heading clearly shows #<id>;
include a separate official link. Use language:'JavaScript' only for those six catalog
JavaScript problems; all others use 'Python'. Python is canonical by default;
a JS trace is not Python execution. For the approved exception, distinguish the
visual simulation from execution of the canonical JavaScript solution as well.
Use a real causal explanation, hand calculation, baseline, invariant/proof,
small reversible interactive experiment, fresh predict-before-reveal exercise,
canonical-code mapping, boundaries and honest costs. For JavaScript problems,
also explain the Python conceptual comparison. Fresh examples and counterexamples
must be problem-specific, not generic template filler. Related anchors must exist.
All system text/feedback/accessibility labels need Chinese and English; locale
preserves state. No external fonts/assets. No placeholders or fake completion.

Run independent baseline/oracle checks, intermediate invariants, boundaries and
small exhaustive/seeded cases. Exercise the REAL browser, both locales, all presets,
forward/back/reset/endpoints, prediction then reveal then change, copy/fallback,
320/390/desktop widths and 200% zoom, keyboard/focus, source/download parity,
local asset errors and measured contrast. Store tests and self-check evidence in
this lesson folder. JavaScript lessons must test the original callable contract
in JavaScript, deterministic async behavior when relevant (including rejection,
ordering and cancellation only if in the original contract), and both embedded /
copied / downloaded sources against their respective files. Test the Python
comparison's stated behavior independently without using it as an oracle for
non-equivalent JavaScript semantics. Tests that emit results/screenshots must
accept an output directory environment variable so a reviewer can rerun without changing the
frozen candidate. Browser packages are available via NODE_PATH; if set, use
process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH as launch executablePath. Use the
already-running preview URL; don't start a persistent service. Headless screenshots
must be visually inspected, not only produced. Keep shipped CSS under 25000 bytes.
A self-check is not a separate review and must not claim actual learner results.

Return JSON matching the supplied output schema: outcome ready only with complete
candidate and actual checks; otherwise blocked, detail explaining the evidence.
