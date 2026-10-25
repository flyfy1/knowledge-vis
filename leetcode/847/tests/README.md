# Reproducible author tests

Run from checkout root:

```sh
EVIDENCE_DIR=/tmp/847-numeric-review python3 -B leetcode/847/tests/check.py
EVIDENCE_DIR=/tmp/847-browser-review node leetcode/847/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 847 --validate-only
```

`check.py` imports canonical Python, executes the HTML baseline, checks graph nonmutation and source parity, constructs an independent metric-closure oracle, and invokes `core-check.cjs` for frame invariants and copy AST checks. `browser.cjs` requires installed Playwright via NODE_PATH, uses the configured Chromium executable, and reads the existing preview URL; it starts no service. Browser artifacts are author checks, not independent acceptance. It uses the browser host's actual copy shortcut (Control+C on this Linux host), with a fresh verified clipboard sentinel on each fallback attempt.

Do not invoke registration without `--validate-only`. Official captures are review inputs, not runtime assets. `candidate.json` binds runtime/source/metadata/tests/official-capture hashes; external output directories leave the candidate unchanged.
