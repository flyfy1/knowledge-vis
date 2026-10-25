# Author self-checks

Run from repository root, with available NODE_PATH and optionally
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH inherited. Browser tests use the already running
http://127.0.0.1:18799 preview and start no service.

```
EVIDENCE_DIR=/tmp/996-review python3 -B leetcode/996/tests/check.py
EVIDENCE_DIR=/tmp/996-review node leetcode/996/tests/core.cjs
EVIDENCE_DIR=/tmp/996-review python3 -B leetcode/996/tests/contrast.py
EVIDENCE_DIR=/tmp/996-review node leetcode/996/tests/browser.cjs
EVIDENCE_DIR=/tmp/996-review node leetcode/996/tests/supplement.cjs
python3 -B scripts/register_leetcode_lesson.py 996 --validate-only
```

Tests do not require builder scripts; build_copy.py and build_html.py are local
authoring sources, not the shared generator. check.py detects duplicate dictionary
keys before evaluation and checks both-language string-pair shape. Browser tests
compare textContent, real clipboard (including distinct per-attempt sentinel,
focus, full selection, host shortcut and readback), and downloaded bytes with the
canonical file including its final newline. No whitespace normalization.

core.cjs uses exhaustive permutation generation independently of count-based DFS.
check.py executes the original Python callable against deduplicated permutations
and an independently enumerated square set. All snapshots check multiplicity,
legal adjacency, accept increments, reject stability, undo and final restoration.

Browser screenshots cover CSS layout zoom 1 and 2, in actual Chromium. Widths
320/390/736/1440 and locale roundtrips are tested. supplement.cjs keeps a populated
four-value prefix and accepted ledger visible, measures the longest selected
array label with actual computed font/padding and a conservative 20px native-arrow
reserve, and reads related target sections after real keyboard activation.
CSS zoom is a reproducible layout stress; physical phone/browser-chrome zoom and
other platforms are not inferred from it. Host platform is recorded in results.

The author's tests and screenshot inspection do not constitute an independent
lesson review, actual learner evidence, production verification, or LeetCode
submission acceptance. Review the frozen file hashes in evidence/manifest.json.
