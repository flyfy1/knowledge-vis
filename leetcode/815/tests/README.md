# Reproduce author self-checks

From repository root, use an external output directory to leave the frozen candidate unchanged:

```sh
EVIDENCE_DIR=/tmp/815-review python3 -B leetcode/815/tests/test_solution.py
EVIDENCE_DIR=/tmp/815-review node leetcode/815/tests/test_core.cjs
EVIDENCE_DIR=/tmp/815-review node leetcode/815/tests/browser.cjs
EVIDENCE_DIR=/tmp/815-review node leetcode/815/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 815 --validate-only
```

The browser runner uses the already-running `http://127.0.0.1:18770`, overridable by `PREVIEW_URL`. It uses installed Playwright through `NODE_PATH` and respects `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. No service is started. Native clipboard tests use the browser host's Linux/Windows Control+C or macOS Meta+C; before **each** locale's fallback attempt, a new non-source sentinel is written and read back. The read-only textarea is fully selected, actual host copy is invoked, and clipboard readback must equal canonical source including its terminal newline. Clipboard denial is deliberately injected only for the automatic-write path.

`test_solution.py` executes the canonical original Python interface and independently checks it against route-graph Floyd-Warshall, plus the displayed pairwise-BFS baseline. Exhaustive tests cover all ordered one-to-three-route families from nonempty subsets of three stops and every endpoint pair including an absent stop. Seeded tests vary route order and stop order. Large expected cases reach M=100000 and R=500; a 500-bus chain checks distance counting. Input immutability and mirror parity are asserted.

`test_core.cjs` independently calculates route-graph distances, then checks each frame's frontier, every discovered distance, every activation layer, causal boarding stop, once-only route expansion, cumulative scans and immutable history. This is an oracle check, not an independent reviewer.

`browser.cjs` covers both locales, all seven presets and every frame, exact rewind/replay, endpoints/reset, manual journey, all prediction choices with reveal/change and state-preserving locale roundtrips, exact headings, rendered causal feedback, source display/copy/download/fallback, native focus/keyboard, anchors, local related destinations, storage failure and file:// source display. Screenshots include 320/390/736/1440 widths and CSS layout zoom2 at320/390/1440. Closed preset fit reserves24px for the native arrow in this Linux Chromium environment. Contrast is measured with a calibrated WCAG sRGB function against solid rendered backgrounds. Screenshot inspection is recorded separately in SELF-CHECK.md; numerical geometry alone does not prove readability.

`focused.cjs` supplements the main runner with rendered active-route, frontier, target, correct-feedback and disabled-primary contrast; manual/revealed screenshots; exact heading roundtrips at320px. Its contrast helper is separately calibrated against known luminance/contrast values.

`build_copy.py` is an author-only deterministic bilingual-copy builder with duplicate-key rejection. It intentionally writes copy.js; reviewers do not need to run it. The browser/core tests consume copy.js directly and write only under EVIDENCE_DIR.

Official source capture is `evidence/official.json`; it includes access timestamp, query, full statement and language snippets from the public official GraphQL endpoint. It is review material, not a runtime dependency. No live LeetCode submission, independent teaching review, novice teach-back, real device or public release verification is claimed.

For the bounded 815-COPY-R1 repair, run `EVIDENCE_DIR=/tmp/815-copy-review node leetcode/815/tests/copy-repair.cjs`. The immutable initial comparison is tests/evidence/copy-r1/before.json. The runner checks the exact allowed HTML/copy diff, protected hashes, both locales and zh→en→zh, preserved intermediate algorithm and quiz state, adjacent keyboard targets, and page-end layout at320px with CSS zoom1/2. Red and green author records remain in that evidence directory. The new freeze is ../candidate-copy-r1.json; candidate.json remains the original historical author freeze.
