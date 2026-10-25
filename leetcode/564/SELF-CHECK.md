# #564 author self-check — candidate 1

Status: complete author candidate, ready for a separate independent review. No independent acceptance, publication, LeetCode submission, or actual learner-result claim. Changes are confined to leetcode/564/.

Official public GraphQL evidence is retained in tests/evidence/official.json, including access timestamp, complete statement, both official examples, constraints and actual Python3 code snippet. Canonical language is Python. No non-Python exception or adaptation applies.

Validation executed from repository root:

- `python3 -B leetcode/564/tests/numeric.py`: PASS, 21,555 cases. Exhaustive inputs 1..20,000 checked by outward scan, full small-palindrome table and binary-search oracle. Seed 564 supplies 1,500 large values; decimal boundaries across all 18 lengths and official examples included. The original Solution method executes for every expected result.
- `node leetcode/564/tests/core.cjs`: PASS, 128,934 frames. Every candidate's palindromicity/distance and every running best checked; terminal answers match the independent Python-generated expected values. Exact canonical/mirror equality and duplicate localization-key detection included.
- `node leetcode/564/tests/browser.cjs`: PASS in actual headless Chromium at the provided existing preview. Both locales, all nine presets, every frame with independently recomputed best, rewind/replay, reset, end, range seeking and endpoints. Every prediction choice, change-after-reveal, language preservation and independent trace reset checked. Real keyboard Enter and range arrow, focus outline, forced colors/reduced motion, denied storage and offline operation checked. Source disclosure, display/copy/download exact parity (including final newline), denied clipboard and full manual selection checked. Related targets fetched and anchors checked. No page errors, bad local responses or external runtime requests.
- Layout: both locales at 320/390/736/1440 CSS px, and document CSS zoom 2 at desktop width. Controls are at least 48px high. Largest-input cards wrap without clipping; horizontal step navigation intentionally scrolls. Headless screenshots were visually inspected: both locale intro/prediction/fallback screens, all width state captures and complete phone ledgers, both zoom captures. Long decimal formulas wrap across lines; all operands remain visible.
- Measured rendered text contrast minimum 6.449:1 (muted status/disabled control against panel2); main body 16.087:1; focus against panel2 8.937:1. Shared tokens reused exactly. Shared plus local shipped CSS: 11,131 bytes.
- `python3 -B scripts/register_leetcode_lesson.py 564 --validate-only`: PASS, exit 0. Command/result captured in tests/evidence/preflight.txt. No registration performed. Metadata complexity is one nonempty string.

Self-check fixes: independent numerical checking corrected a large baseline illustration to nearest 100000000000000001, distance 499999999. Initial browser run exposed an unbroken boundary example at 320px; local wrapping fixed it, followed by a complete passing browser rerun. These are author corrections, not reviewer findings or independent closure.

Reproduction and output-directory instructions: tests/README.md. Detailed numerical/browser evidence and screenshots: tests/evidence/. Runtime/test/metadata hashes: tests/evidence/candidate-sha256.json. Candidate identity is frozen for review; any later material fix requires a new candidate and relevant independent review.

Limits: headless Chromium layout/keyboard tests do not verify physical mobile devices, OS-level clipboard integration, actual browser UI zoom, production deployment, or learner comprehension. Clipboard success path uses a deterministic writeText receiver; denial/fallback uses actual focus and selection APIs. The simulation is explicitly labeled separately from execution of canonical Python. Independent lesson review and release remain pending.
