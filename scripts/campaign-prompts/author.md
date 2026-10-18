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
or use a presumed title as its contract. Prefer Python when it faithfully implements
an officially supported submission interface, otherwise TypeScript when supported,
otherwise the problem-required native language (for example the documented SQL
dialect or JavaScript). Missing Python support alone is NOT a blocker. Verify the
actual language selector/interface, not only the problem category. Python DataFrame
interfaces may be available for Database/Pandas problems. For the six JavaScript
category problems 2630, 2650, 2675, 2691, 2756 and 2759, the owner explicitly chose
original JavaScript even when TypeScript is offered. This exact-six exception takes
precedence over the general language preference. Retain a separately labeled
Python conceptual comparison. Never mislabel that comparison as a valid original
submission or an oracle for JS identity, this binding, mutation or async semantics.

Every non-Python solution needs language-contract.json with problemId, language,
officialSource (the exact catalog officialUrl), supportedLanguages (the complete
faithful official interfaces observed, normalized to Python / TypeScript /
JavaScript; retain exact SQL dialect labels), interface (callable signature or
schema and runtime semantics), rationale (why earlier preferred languages cannot
faithfully submit, or the explicit owner choice for the exact-six JavaScript exception), verifiedAt (ISO timestamp with timezone), verificationEvidence
(a lesson-relative nonempty evidence file). Save what was actually observed from
the official source, with the access date and selector/interface excerpts or
screenshots, so the separate reviewer can verify the language decision. Store official captures
inside tests/evidence/ or provenance/; they are review material, not runtime assets. The
contract's selected language must follow Python > TypeScript > required native,
except that the exact six listed JavaScript problems require JavaScript.
Do not omit supported Python or TypeScript merely to select an easier language.
If the official statement/interface cannot be accessed, retain the problem in
scope and return blocked with concrete evidence and the next needed input.

Own ONLY leetcode/<id>/ and tests inside that folder. Do not edit shared assets,
registry, other lessons, scripts, workflow, Git config, or system services. Do not
commit, push, deploy, spawn agents, create schedules, or touch credentials.
Use existing leetcode/common.js, style.css and controls where appropriate.
You may reuse the first-ten page skeleton but MUST NOT run its generator (it owns
other lessons). A queen board is not a Sudoku board; implement the necessary local
renderer honestly. Avoid a universal visualization framework. Prior lessons may
be read for conventions after the design documents.

Deliver index.html, app.js, copy.js, BRIEF.md, a numerical core if needed, and
reproducible tests. Python uses solution.py and python-code.js; TypeScript uses
solution.ts and typescript-code.js; JavaScript uses solution.js and
javascript-code.js; SQL dialects use solution.sql and sql-code.js. Other native
file pairs are listed in scripts/register_leetcode_lesson.py LANGUAGE_FILES; read
that table without editing shared scripts. The canonical source is the actual
official submission. Its offline mirror must contain only
window.<LANGUAGE>_SOURCE = <JSON string of the exact source>; using the table's
export name. For the six JavaScript category problems also deliver concept.py and
python-code.js (window.PYTHON_SOURCE embedding concept.py exactly), with separate
labeled source/copy/download controls and bilingual limits of the analogy.
Create lesson-entry.json with id, title:{zh,en}, desc:{zh,en}, difficulty:'hard',
topics:[{zh,en}], path:'<id>/', leetcodeUrl, language:'<verified canonical language>', complexity,
concepts:[{name,step:<integer>,description}]. Metadata title values omit the ID
because the collection renderer adds it. The lesson heading clearly shows #<id>;
include a separate official link. Metadata language is the verified canonical
language, exactly matching language-contract.json for exceptions. A visual trace
is a simulation, not execution of the official submission. Distinguish both
explicitly; do not silently advertise the Python comparison as the solution.
Use a real causal explanation, hand calculation, baseline, invariant/proof,
small reversible interactive experiment, fresh predict-before-reveal exercise,
canonical-code mapping, boundaries and honest costs. Start with a vivid tiny
concrete example that a reader can calculate by hand, define every new term at
first use, then introduce one complication at a time. Show the actual values and
why each transition occurs before showing the optimized rule; explain a tempting
wrong approach with a small counterexample. Derive the invariant from those
observations rather than asserting it. Include a fresh transfer exercise whose
answer requires that invariant, with an explanation after reveal. For JavaScript
category problems also explain the limited Python conceptual comparison. Fresh examples and counterexamples
must be problem-specific, not generic template filler. Related anchors must exist.
All system text/feedback/accessibility labels need Chinese and English; locale
preserves state. No external fonts/assets. No placeholders or fake completion.

Run independent baseline/oracle checks, intermediate invariants, boundaries and
small exhaustive/seeded cases. Exercise the REAL browser, both locales, all presets,
forward/back/reset/endpoints, prediction then reveal then change, copy/fallback,
320/390/desktop widths and 200% zoom, keyboard/focus, source/download parity,
local asset errors and measured contrast. Store tests and self-check evidence in
this lesson folder. Execute and validate the canonical original-language solution against an
independently derived oracle/expected results. For TypeScript compile/type-check
solution.ts and execute its emitted JavaScript, preserving the original callable
interface. SQL lessons need the actual documented dialect/schema, ties, nulls,
duplicates and ordering rules; a Python analogy alone is not execution evidence.
JavaScript/TypeScript lessons must test the original callable contract and
deterministic async behavior when relevant (including rejection,
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
