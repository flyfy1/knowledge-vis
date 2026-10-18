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

Prefer a faithful official Python interface, otherwise verified TypeScript,
otherwise the problem-required native language. Missing Python support alone is
not a blocker. For every non-Python solution independently verify
language-contract.json against the official language selector and interface, its
rationale, and saved lesson-local evidence. Verify supportedLanguages is complete
and does not omit a faithful Python/TypeScript option. Check the original callable
or schema semantics. Reject a Python conceptual analogy advertised as a valid
original submission. Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py
for exact canonical source / offline mirror / export names. Check exact
embedded/displayed/copied/downloaded parity and execute the actual canonical source,
not just its trace or analogy (type-check/compile TypeScript, then execute emitted
JavaScript; SQL requires documented dialect semantics including ties, nulls,
duplicates and ordering). Missing executable evidence is not acceptance.

For JavaScript category problems 2630, 2650, 2675, 2691, 2756 and 2759, the owner
explicitly requires original JavaScript even if TypeScript is supported; this
exact-six exception overrides the general language preference. Require solution.js
and javascript-code.js, then audit separate
concept.py / python-code.js exact parity and bilingual conceptual-only labels.
Independently check identity/mutation/callback/this behavior and deterministic
promise timing/rejection/ordering where applicable; test the Python comparison
against its limited stated behavior. Apply the unchanged code/cost dimension to
the actual canonical solution and labeled comparison; do not alter weights.

Assess depth of teaching, not merely section presence: does a vivid hand-worked
tiny example precede abstraction, are new terms explained, are actual before/after
values and causal reasons visible, does complexity increase gradually, does a
small counterexample expose a tempting wrong rule, and does a fresh exercise
test transfer rather than recall? Required gaps remain findings even when tests
or screenshots pass.

Only after cold walkthrough may you inspect earlier review reports for this ID to
check closure. Record stable finding IDs, concrete reproduction, expected/actual,
severity and violated requirement; close earlier required findings only against
this actual candidate and explicit regression evidence. Score all six dimensions
0..4 with observations. Accept only >=85/100, every dimension>=3, no required open
finding, and complete evidence. Missing browser/source/access evidence is blocked
or changes_required, never a passing review. This is separate from publication.

Metadata gate: lesson-entry.json complexity must be exactly ONE nonempty string
covering time and space, for example "O(mn) time; O(n) space", never an object with
time/space fields. Run the safe, non-mutating preflight from the repository root:
`python3 -B scripts/register_leetcode_lesson.py <id> --validate-only`
Replace <id> with this problem's ID. Record the command and result before
acceptance. If it fails, report a required finding; never repair the frozen
candidate or run registration during review.

Write ONLY your exact report path and this problem's screenshot evidence directory.
Do not edit implementation, shared files, workflow, tests, Git config, or services.
Do not commit, push, deploy, spawn agents or create schedules. Do not read secrets.
Write the report in English, including revision, coldwalk, observations, score
rationale, required IDs, limitations, and conclusion. Your final JSON must match
the supplied schema (scores order: problem/terms, derivation, correctness,
interaction, Python/cost, bilingual/device; report_path as supplied; evidence
contains concrete observed checks). Do not fabricate reviewer/model identities.
