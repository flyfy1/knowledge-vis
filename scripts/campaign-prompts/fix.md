Fix the required independent-review findings for ONE lesson.
Problem: {problem_json}
Repository: {repo}
Preview: {base_url}
Previous report: {prior_report}

Read the report, candidate, existing BRIEF and repository teaching/review specs.
Read ~/Documents/agent-skills/website-design/SKILL.md for UI work; for a hard bug
read ~/Documents/agent-skills/diagnosing-bugs/SKILL.md, establish a failing feedback
loop and test ranked falsifiable hypotheses. Preserve working behavior. Own only
leetcode/<id>/ and tests/evidence inside it. Do not edit the review report or
review rubric. Do not mark your own fixes independently accepted. Do not edit
shared assets, registry, other lessons, scripts, Git configuration or services.
No commit, push, deploy, schedules, credentials or child agents.

Fix the actual causal/algorithm/interaction issues, regenerate embedded sources
if needed, run relevant regression and browser checks in both locales,
and append self-check evidence with fix mapping to stable finding IDs. Browser
packages are on NODE_PATH; use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if provided.
Prefer a faithful official Python interface, otherwise verified TypeScript,
otherwise the required native language. Missing Python support alone is not a
blocker. Preserve or correct language-contract.json and its lesson-local official
interface evidence whenever the selected language is not Python. Verify that
supportedLanguages does not omit an available faithful Python/TypeScript interface;
read the exact source/mirror pairs in scripts/register_leetcode_lesson.py.
Canonical sources must match their displayed/copied/downloaded and offline mirror
versions exactly. Execute the actual submission language (compile/type-check
TypeScript before executing emitted JavaScript; use the documented SQL dialect).
For the six JavaScript category problems 2630, 2650, 2675, 2691, 2756 and 2759,
the owner explicitly requires original JavaScript even if TypeScript is supported;
this exact-six exception overrides the general language preference. Retain separately
labeled concept.py and python-code.js with exact parity. Preserve runtime semantics
including async, identity and callbacks where relevant. The Python comparison is
not an equivalent official submission. Keep explanations concrete and gradual:
hand-calculate a vivid tiny example, introduce terms/complications as needed,
explain causal steps and a tempting wrong approach, then a fresh transfer case.
Do not weaken the frozen rubric.
Return supplied JSON schema ready only when a candidate is ready for separate
re-review; otherwise blocked with concrete missing evidence and next action.
