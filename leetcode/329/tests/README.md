# Reproduce author checks

Use the repository's already-running preview at http://127.0.0.1:18770.
Do not start a server or register the lesson. From repository root:

```bash
OUTPUT_DIR=/tmp/lip329-algorithm python3 -B leetcode/329/tests/test_algorithm.py
OUTPUT_DIR=/tmp/lip329-browser node leetcode/329/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 329 --validate-only
```

Browser dependencies resolve through the provided NODE_PATH. If present,
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH selects the browser binary. Both test programs
create artifacts only beneath OUTPUT_DIR (default tests/evidence). Python uses -B
to avoid bytecode writes. The oracle is uncached route enumeration, not a second
implementation of peak removal. Browser-model frames are audited from Python
against independently computed per-cell suffix lengths and remaining neighbors.

Official public GraphQL capture: tests/evidence/official.json contains the access
timestamp, endpoint, full statement, examples and actual language snippets.
Python3 was selected because its official callable is supported. Tests execute
solution.py directly. Browser interactions simulate the mechanism separately.

Screenshots are evidence, not runtime assets. Full-page captures can show a sticky
navigation bar at capture-dependent positions. Focused board captures explicitly
position the grid beneath the sticky bar and assert its geometry. A human author
visually inspects focused screenshots; this is not independent acceptance.
