# Reproduce the author self-checks

From the repository root, with the provided preview already running:

```sh
OUTPUT_DIR=/tmp/lesson-115-check python3 leetcode/115/tests/check.py
OUTPUT_DIR=/tmp/lesson-115-check node leetcode/115/tests/core.cjs
OUTPUT_DIR=/tmp/lesson-115-check node leetcode/115/tests/browser.cjs
OUTPUT_DIR=/tmp/lesson-115-check node leetcode/115/tests/accessibility.cjs
OUTPUT_DIR=/tmp/lesson-115-check python3 leetcode/115/tests/registration.py
```

Node resolves Playwright through the environment's NODE_PATH. If supplied, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is passed to launch(). PREVIEW_ROOT defaults to http://127.0.0.1:18777. No server is started. OUTPUT_DIR defaults to tests/evidence; set it for reviewer reruns to leave the candidate untouched. Python bytecode writing is disabled. Browser failures close the browser.

`check.py` executes the official Python callable and compares with independent combinations enumeration and a recursive oracle, then repeated-letter closed forms and maximum-length fixtures. `core.cjs` audits every completed table cell and every mixed old/new array state with index enumeration, and verifies deep snapshot isolation. `browser.cjs` drives the actual page and browser clipboard, plus deterministic clipboard success/denial, source/download/offline parity, controls, both locales, state preservation, preset boundaries, custom/empty/invalid/maximum teaching inputs, keyboard, forced colors/reduced motion, blocked storage, local links/assets, geometry, CSS bytes and contrast.

Screenshots are author-inspected evidence, not an automated aesthetic judgment. CSS zoom at 200% is explicitly recorded; no physical phone or OS browser-menu zoom was tested. The shared navigation is horizontally scrollable; the genuinely 2D table scrolls within its own focusable container. Independent review and public deployment are outside this author run.

`registration.py` covers finding `115-REG-01`. It imports the real registration implementation with bytecode writes disabled, copies the required inputs into a disposable fixture under OUTPUT_DIR, reproduces the original object-valued complexity failure, and changes only that field to the candidate string. It checks the registered entry, preservation of other entries, concept links, index version, idempotence, and unchanged real repository inputs. Fixture files are removed automatically; the production registry is never registered or written.
