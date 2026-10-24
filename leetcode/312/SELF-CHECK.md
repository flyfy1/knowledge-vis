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
