# #1157 reproducible author checks

Run from the repository root. The preview at port 18770 must already be running; these tests never launch a service. Node resolves Playwright/acorn through the supplied NODE_PATH. Chromium uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when present.

```bash
OUTPUT_DIR=/tmp/1157-review python3 -B leetcode/1157/tests/numerical.py
OUTPUT_DIR=/tmp/1157-review node leetcode/1157/tests/core.cjs
OUTPUT_DIR=/tmp/1157-review node leetcode/1157/tests/browser.cjs
OUTPUT_DIR=/tmp/1157-review node leetcode/1157/tests/supplemental.cjs
OUTPUT_DIR=/tmp/1157-review python3 leetcode/1157/tests/contact_sheets.py
python3 -B scripts/register_leetcode_lesson.py 1157 --validate-only
```

PREVIEW_URL can override the complete lesson URL. OUTPUT_DIR is used for all emitted results/screenshots/sheets, so a reviewer can rerun without changing the frozen candidate. Inspect PNG originals as well as generated contact sheets. Contact sheets summarize the screenshots; they are not assertions or evidence of inspection by themselves.

- `numerical.py` executes the actual official Python class. Counter-based exhaustive queries are independent of cancellation. Constructive witnesses track actual indices that survive each stored tree summary. Seeded arrays, no mutation, official outputs, n=20000, 10000 calls, ties, distinct values and too-high thresholds are included.
- `core.cjs` checks browser model results against direct counting, every intermediate majority, disjoint exact coverage, deletion witnesses, exact source mirror and copy dictionary shape/duplicate keys (Acorn AST).
- `browser.cjs` uses real Chromium, both locales, every trace frame forward/back/replay, all presets and prediction choices, language/state/focus, independent hand/range/exercise states, successful copy and repeated native clipboard fallback, exact display/copy/download text including final newline, 320/390/736/1440px with CSS zoom 1/2, closed native selects with a fixed 22px arrow reserve, keyboard, local assets, contrast, blocked storage, offline source and file:// opening. Every native fallback attempt starts with a new verified sentinel. Native Control+C was used on the actual Linux host.
- `supplemental.cjs` checks final candidate/balance/count scope and absent-answer states, captures 390px results and settled 320px/zoom2 blocks below the sticky navigation, and exercises a 120% font-size sensitivity check. That sensitivity check is synthetic, not another platform’s native-font evidence.

`evidence/official.json` is the full dated public GraphQL capture including actual Python3 interface and all observed selectors. `evidence/harness-notes.md` preserves author-run failures, diagnosis and fixes; none are independent reviewer findings or closure. `evidence/SELF-CHECK.md` records visual inspection and limitations. `evidence/candidate.json` identifies the final files and shared read-only dependencies. Review status remains pending; use a fresh run and cold walkthrough before reading BRIEF/source.
