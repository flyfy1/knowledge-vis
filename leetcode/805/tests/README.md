# Reproduce the author self-check

Run from the repository root. No server is started; use the existing preview.
The browser runner uses NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set.

```bash
OUTPUT_DIR=/tmp/805-review python3 -B leetcode/805/tests/test_solution.py
OUTPUT_DIR=/tmp/805-review node leetcode/805/tests/test_core.cjs
OUTPUT_DIR=/tmp/805-review PREVIEW_URL=http://127.0.0.1:18786/leetcode/805/ node leetcode/805/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 805 --validate-only
```

OUTPUT_DIR redirects every generated report and screenshot. The numerical tests
use exhaustive positional/combinations oracles, independently of half-set updates.
The actual canonical Python method is executed. The browser checks both locales,
all preset frames, reversible snapshots, endpoints, exercise reveal/invalidation,
source/copy/download parity and repeated native fallback copying. Each fallback
attempt resets and reads a unique non-source sentinel before forcing automatic
writing to fail. The host shortcut follows process.platform (this run: Linux).
Layout zoom is CSS 200%, not proof of native zoom or a real device.

The native clipboard check needs a browser supporting clipboard read/write
permissions on the local trustworthy origin. All screenshots must also be visually
inspected. These tests and their results are author self-check evidence only.
Independent teaching review and any public release remain separate gates.
