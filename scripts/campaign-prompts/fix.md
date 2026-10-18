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

Fix the actual causal/algorithm/interaction issues, regenerate Python embedded
source if needed, run relevant regression and browser checks in both locales,
and append self-check evidence with fix mapping to stable finding IDs. Browser
packages are on NODE_PATH; use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if provided.
Return supplied JSON schema ready only when a candidate is ready for separate
re-review; otherwise blocked with concrete missing evidence and next action.
