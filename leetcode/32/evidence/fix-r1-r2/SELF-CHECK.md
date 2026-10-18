# Lesson 32: required-findings revision, author self-check

Date: 2026-10-18. Candidate: `32-r1-r2-fix1`, frozen by exact file hashes in
[candidate.json](candidate.json), with the checkout base commit separately recorded.
No commit was created. This is a new working-tree candidate for separate review;
the original review and its result remain historical evidence.

## Fix mapping

| Stable finding | Candidate change | Evidence | Author status |
| --- | --- | --- | --- |
| 32-R1 | Added lesson-entry.json, bilingual description/topics, existing concept anchors, Python language, and exactly one complexity string: `O(n) time; O(n) auxiliary space`. | [preflight.json](preflight.json): root command `python3 -B scripts/register_leetcode_lesson.py 32 --validate-only`, exit 0, empty stdout/stderr. The original missing-file failure was reproduced before editing. | Fixed awaiting independent review |
| 32-R2 | Before baseline code, define matching and balance; show the default example's negative first close, full 1→0→1→0→−1 scan, length arithmetic and remaining starts. Show `(()` and explain its unmatched opening; reject equal totals using `)(`. Define stack/push/pop/top before the optimized rule, define suffix locally, and connect `[0,3] → [0]` at i=4 to the same hand calculation. Both locales use the same steps and conditions. | Revised copy.js/index.html; `en-320-hand.png`, `zh-320-hand.png`, both `*-320-derive.png`, desktop and CSS-200% captures; browser.json checks the served calculation text and nonempty locale keys. | Fixed awaiting independent review |

## Checks actually run

- `python3 -B leetcode/32/tests/regression.py`: executed canonical Python, 4,095 exhaustive inputs through length 11 against a substring/removal oracle; eight additional fresh/counterexample/max-length cases; repeated calls on one instance. Exact Python/offline mirror equality passed. See [python.json](python.json).
- `node leetcode/32/tests/core.cjs`: 2,047 inputs through length 10, 20,481 frames; final answers, best so far, longest valid ending length, boundary consistency and highlighted validity passed. See [core.json](core.json).
- `node leetcode/32/tests/browser.cjs` using installed NODE_PATH Playwright and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: both locales, all four presets/endpoints, reset/rewind/replay, all three prediction choices, stale feedback clearing, locale preservation, actual keyboard range/Space actions, sticky deep-link geometry, clipboard success, real downloads, manual-copy/storage denial, offline display and Next passed. See [browser.json](browser.json).
- Browser widths: 320, 390, 736, 1440 CSS px, height 1000. CSS `zoom:2` at 1280×900 also passed overflow checks; this is not native browser-menu zoom. Canonical Python equals displayed/copied/downloaded source in both locales and offline display. Served HTML/copy/app/source/mirror exactly matched local bytes; hashes are in browser.json.
- `python3 -B scripts/register_leetcode_lesson.py 32 --validate-only`: final PASS, exit 0. This was validation only, without registration or campaign/registry mutations.
- `git diff --check`: passed. All edits and evidence are within leetcode/32/.

Visually inspected both 320px hand calculations, Chinese 320px derivation, both
320px populated trace stages and the English CSS-200% hand calculation. Text wraps
without clipping; source code scrolls locally. At event 5, both languages retain
all six character cells, stack [0], previous stack [0,3], and length/best 4. Sticky
navigation overlaps the top edge of element-only stage captures; actual navigation
heading geometry was checked separately and passes. Existing CSS and tokens were
not edited.

The browser's first run caught an unrelated root `/favicon.ico` 404. The request
was identified by its console location and is explicitly recorded under
`ignoredRequests` in the final browser receipt. No lesson resource or script
errors remained; no shared service or favicon was edited.

## Language and evidence boundary

Read the exact source/mirror/export pairs in scripts/register_leetcode_lesson.py:
Python uses solution.py / python-code.js / PYTHON_SOURCE. This lesson retains the
preferred Python Solution.longestValidParentheses(self, s: str) -> int interface;
no non-Python contract or supportedLanguages list exists to omit Python/TypeScript.
The [official statement](https://leetcode.com/problems/longest-valid-parentheses/)
was read and agrees with the substring contract, 2/4/0 examples and length limit.
Its fetched text did not expose editor starter code. The source interface remains
the previously reviewed Python callable; no new official submission is claimed.

These checks establish candidate behavior under the stated conditions. Independent
teaching re-review, real-device/native-menu zoom and novice teach-back remain
unperformed. No finding is marked independently closed, no acceptance is granted,
and no registration, commit, push, deployment or prior report modification occurred.
Next action: a separate reviewer rechecks 32-R1 and cold-walks the revised opening
and derivation in both locales against this hash-frozen candidate.
