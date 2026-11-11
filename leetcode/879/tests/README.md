# Reproduce author self-checks

Run from repository root, using the existing preview on port 18770. Do not start another service.

```bash
OUTPUT_DIR=/tmp/879-review python3 -B leetcode/879/tests/test_solution.py
OUTPUT_DIR=/tmp/879-review node leetcode/879/tests/test_core.cjs
OUTPUT_DIR=/tmp/879-review node leetcode/879/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 879 --validate-only
```

Node resolves Playwright through NODE_PATH in the supplied environment. The browser runner honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. OUTPUT_DIR controls every results/screenshot file; rerunning these tests does not modify the frozen source. `build_copy.py` is an authoring helper, not a required test command; it regenerates copy.js and intentionally writes source.

Python checks execute the official callable with unchanged input lists against independent subset enumeration, exhaustive small cases, random seed 879, official examples and closed-form maxima. They also execute the displayed recursive baseline and check unique localization keys before JSON object construction, two-string pair shapes, and exact mirror parity. The core runner independently enumerates every subset for each prefix and checks every cell and contribution ledger.

Browser checks use real Chromium, EN/zh, all presets/endpoints, complete forward/back/forward identity, reset and range seek, each prediction/reveal/changed answer, state-preserving locale switches, exact rendered/copy/download parity, repeated per-locale real native fallback copying with verified fresh clipboard sentinels (Linux Control+C), keyboard activation/focus, blocked storage, file:// offline code/interaction, forced colors and reduced motion. Browser tables are compared to independently enumerated expected cells. Layout includes 320/390/736/1440px, long selected label budgets, wrapped table labels, headings, prediction feedback and 200% CSS page zoom at 1440px. It measures color pairs with a helper calibrated on black/white, primaries and #747474 near the AA threshold.

Screenshots must also be visually inspected. Recorded inspection is in SELF-CHECK.md. CSS zoom is real browser page magnification, not native browser chrome zoom. Physical devices, native chrome zoom, assistive-technology speech, actual novice learning, LeetCode submission and publication are unverified. The related #10 page requests an absent root favicon; asset-diagnostics records this inherited 404 separately. There are no asset/script errors on #879.

No author self-check constitutes independent lesson acceptance. Separate review is pending against candidate-manifest.json.
