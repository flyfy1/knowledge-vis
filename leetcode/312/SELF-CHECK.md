# #312 author self-check

Candidate date: 2026-10-24. This is author evidence only; no independent acceptance is claimed.

Commands and results:

- `python3 -B leetcode/312/tests/test_core.py` — passed exhaustive arrays length 0–6 over values 0–3, seeded cases, and official/boundary examples.
- `node --check copy.js core.js app.js` — passed.
- `node tests/test_trace.js` — passed recurrence and monotonic-frame checks for official and boundary presets.
- `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only` — passed with no output.
- `NODE_PATH=... node tests/browser-check.js` against `http://127.0.0.1:18770/leetcode/312/` — passed at 390px: forward/back, preset switch, prediction reveal, locale round trip, no page errors.
- Source parity — validator compared `solution.py` bytes with `python-code.js` JSON payload.
- CSS size — local stylesheet 542 bytes; shared stylesheet is reused.
- Official evidence — `tests/evidence/official-contract.json`, accessed 2026-10-24, records statement, examples, constraints, and Python3 interface observation.

Numerical invariants checked: every frame’s nonzero `dp[left][right]` is equal to the independently recomputed recurrence; each completed interval has all shorter subintervals ready; terminal `dp[0][n]` equals brute force. Boundary values checked: empty list, singleton, zero, and [1,5].

Browser coverage completed: English and Chinese labels, endpoint controls, preset reset, prediction selection/reveal/change, source disclosure, official link, and narrow viewport. Remaining evidence limits: 320px/desktop/200% zoom screenshots, clipboard-denied fallback, keyboard-only walk, measured contrast, and independent cold teaching review should be rerun by the reviewer.

## Required-finding fix evidence (candidate revision after `a69730b71547dd3237306a9b2a2ee07410160f43`)

- `OPEN-312-FORMULA`: `copy.js` now stores `formula` as an explicit `[zh, en]` pair, so the locale renderer displays the full recurrence in both languages. Browser smoke asserted `dp[left][right]` in `.formula` after loading English and after switching to Chinese.
- `OPEN-312-TRACE-LABEL`: `core.js` records `bestK` from the maximizing candidate and `app.js` renders that key with `best`; `tests/test_trace.js` recomputes both for every completed frame and fails on any mismatch. The browser smoke advances to the previously failing frame and asserts `candidate last 1`.
- `OPEN-312-QUIZ-PREDICTION`: `copy.js` gives the three choices distinct numeric values (4, 2, 1), while retaining option 1 as the sentinel-boundary answer. The browser smoke selects option 1, reveals feedback, and exercises the locale round trip.

Validation run from repository root:

- `node --check leetcode/312/copy.js && node --check leetcode/312/core.js && node --check leetcode/312/app.js` — passed.
- `python3 -B leetcode/312/tests/test_core.py` — passed exhaustive arrays length 0–6, seeded cases, and official/boundary examples.
- `node leetcode/312/tests/test_trace.js` — passed recurrence, monotonic-frame, and best-candidate-label checks.
- `python3 -B scripts/register_leetcode_lesson.py 312 --validate-only` — passed with no output; complexity remains the single string `O(n^3) time; O(n^2) auxiliary space`.
- `NODE_PATH=... PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=... node leetcode/312/tests/browser-check.js` — passed at 390px with English/Chinese formula checks, trace label, preset, prediction/reveal, and no page errors.
- Additional Playwright smoke — passed at 320px, 390px, and 1280px in both locales; checked full formula text, maximizing candidate label, and three distinct quiz choice values.
