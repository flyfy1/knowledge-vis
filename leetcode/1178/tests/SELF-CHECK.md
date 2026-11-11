# Author self-check

- Official GraphQL and page verification are captured in evidence/official-graphql.json; Python3 is the faithful canonical interface.
- `python3 -B tests/test_solution.py` passes fixed official examples, 300 seeded brute-force comparisons, source mirror parity, and metadata shape.
- `python3 -B scripts/register_leetcode_lesson.py 1178 --validate-only` exits 0 without registration.
- Playwright against the already-running preview exercised 390px viewport, preset change, forward/end, prediction then reveal, English locale, and no page errors; result is in evidence/browser.txt.
- This is author evidence only. Separate cold learner review and acceptance are still required; no LeetCode acceptance is claimed.


## Follow-up self-check — required finding fixes

- `1178-R1-BILINGUAL-001`: corrected the Chinese trap to state that `bxx` is valid for `abxyqrs` with first letter `b`, while `bzz` is rejected for its outside `z`; the browser regression asserts both Chinese and English meaning at 320, 390, and 1280px.
- `1178-R1-DEPTH-002`: added a bilingual worked example before the abstract formula: `111₂ → 110₂ → 101₂`, identifies the first-bit exclusion, shows a contribution changing the running total from 0 to 1, and explains the AND mask boundary. The browser regression asserts the transition and causal explanation in both locales.
- Red feedback loop before the fix: a Playwright assertion for the corrected Chinese `bxx` statement failed with `RED: missing corrected Chinese bxx validity statement`.
- Regression commands after the fix: `python3 leetcode/1178/tests/test_solution.py` → `1178 solution/oracle/source parity: PASS`; `node leetcode/1178/tests/browser.cjs` → PASS at 320/390/1280px in both locales with no page errors; `python3 -B scripts/register_leetcode_lesson.py 1178 --validate-only` → exit 0.
- This remains author self-check evidence. The prior review report is preserved and the candidate is ready for separate re-review; no finding is marked independently accepted here.
