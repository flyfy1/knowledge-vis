Independently review ONE interactive LeetCode lesson as a fresh reader.
Problem metadata: {problem_json}
Candidate revision: {candidate}
Candidate URL: {base_url}/leetcode/<id>/ (replace <id> with metadata id)
Target reader: basic Python, lists, loops, functions, elementary recursion.
Frozen rubric: specs/leetcode-review-gates.md, six weights 15,20,20,20,15,10.
Repository: {repo}
Your exact report path: {report_path}

Before reading ANY BRIEF, source, test output, author claims, prior findings, or
other review: read only the frozen rubric, open the candidate in a real browser,
and perform a cold walkthrough. For EVERY teaching step record its question,
action, observable result and your paraphrase of the causal conclusion. Record
that cold walkthrough in your report before opening source. Do not let author
notes supply missing explanations. Choose a fresh small input and counterexample,
write a prediction before reveal, then independently check it. If preset-only,
label custom-input checks as code checks. No source-reading substitute for a cold
browser walk. No score inferred from screenshots or test counts alone.

After saving the cold walkthrough, audit canonical source, constraints and test
claims. Inspect tests before running: redirect generated results/screenshots to
your evidence directory or temporary files; never regenerate tracked candidate
assets or author evidence while reviewing. Check independently chosen examples and boundaries, visual-to-code
mapping, before/after semantics and intermediate invariants. Exercise both
languages, state preservation, rewind/reset/endpoints, prediction/reveal/change,
keyboard, 320/390/desktop layout and 200% zoom, contrast and readable disabled
states, copy fallback and exact source parity. Browser packages use NODE_PATH;
use process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH for executablePath when set.
Capture and inspect screenshots; optionally store only in
{evidence_dir}/. Do not change evidence from earlier runs. Do not claim real human comprehension or a successful
LeetCode submission. Read official statement normally; do not bypass access.

Python is the default canonical solution. The human approved JavaScript only for
catalog JavaScript problems 2630, 2650, 2675, 2691, 2756 and 2759. For those six,
audit solution.js / javascript-code.js exact parity and separately concept.py /
python-code.js exact parity, including displayed/copied/downloaded source.
Require explicit bilingual labels that the Python comparison is conceptual and
not an equivalent official submission. Independently test the original JavaScript
callable contract, identity/mutation/callback/this behavior and deterministic
promise timing/rejection/ordering where applicable. Verify the Python comparison
only against its stated limited behavior, not as an oracle for different runtime
semantics. Apply the same frozen code/cost dimension to canonical JavaScript
mapping plus the labeled Python comparison; do not change weights or thresholds.

Only after cold walkthrough may you inspect earlier review reports for this ID to
check closure. Record stable finding IDs, concrete reproduction, expected/actual,
severity and violated requirement; close earlier required findings only against
this actual candidate and explicit regression evidence. Score all six dimensions
0..4 with observations. Accept only >=85/100, every dimension>=3, no required open
finding, and complete evidence. Missing browser/source/access evidence is blocked
or changes_required, never a passing review. This is separate from publication.

Write ONLY your exact report path and this problem's screenshot evidence directory.
Do not edit implementation, shared files, workflow, tests, Git config, or services.
Do not commit, push, deploy, spawn agents or create schedules. Do not read secrets.
Write the report in English, including revision, coldwalk, observations, score
rationale, required IDs, limitations, and conclusion. Your final JSON must match
the supplied schema (scores order: problem/terms, derivation, correctness,
interaction, Python/cost, bilingual/device; report_path as supplied; evidence
contains concrete observed checks). Do not fabricate reviewer/model identities.
