# Author checks, not independent acceptance

Run from the repository root:

```
OUT_DIR=/tmp/word-ladder-check python3 -B leetcode/127/tests/test_solution.py
OUT_DIR=/tmp/word-ladder-check node leetcode/127/tests/test_core.cjs
OUT_DIR=/tmp/word-ladder-check NODE_PATH="$NODE_PATH" node leetcode/127/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 127 --validate-only
```

Browser defaults to the already-running http://127.0.0.1:18781/leetcode/127/; override PREVIEW_URL if needed. Uses installed Playwright and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when supplied. No service is started. Every test emitting evidence accepts OUT_DIR.

2026-10-18 author self-check results:
- Python: 14,786 cases passed. Exhaust all nonempty subsets of the eight binary width-three words for every distinct endpoint pair; 500 seeded cases; official examples; fresh exercise; disconnected target; listed start; 5,000-word, width-10 case. Independent oracle uses pairwise adjacency and repeated distance relaxation. Visible baseline Python is extracted from HTML and executed too. Input unchanged; mirror exact.
- JS model: 186 cases passed. Independent pairwise adjacency BFS checks every frame's minimum distances, parent distance, unique discoveries, FIFO order, processed/queued membership, complete deterministic traces and final answer.
- Real Chromium: both locales; all six presets (missing target has zero transitions), next/back/reset/end/range, every prediction option/reveal/change, locale preservation, disclosure preservation, copy success with exact captured payload, clipboard rejection with selected manual fallback, real download bytes. Keyboard Enter/Tab and 3px focus, forced colors and reduced motion; blocked storage and offline interaction/source.
- Screenshots: EN/ZH at 320, 390, 736, 1440 CSS pixels; 200% CSS zoom and 720px reflow. Author visually opened en-320-layers.png, zh-390-layers.png, en-1440.png, zoom-200-zh.png and zoom-reflow.png. Labels and parent/state text readable, layers retain their order, small screens stack without clipping. Sticky navigation may appear inside a full-page screenshot at capture position; actual navigation target geometry also checked.
- Local links/anchors resolved; zero console/page errors and zero failed local responses after adding a self-contained favicon. No external runtime assets. CSS total 11,830 bytes. Measured palette and rendered color pairs, disabled opacity and 48px controls are in browser.json.
- Metadata preflight command above exited 0, with empty stdout/stderr. Exact result in preflight.json. Candidate hashes in candidate-sha256.json identify the frozen author candidate.

An early model assertion caught the missing-target guard's misleading pending start display; it was corrected to empty uninitialized search state. Browser self-check caught a favicon 404; fixed before the final passing run. No independent reviewer, novice teach-back, real mobile device, public deployment, or LeetCode submission was performed. This candidate is ready for a separate review only. Shared registry/CONCEPT-MAP were not edited under the ownership constraint.
