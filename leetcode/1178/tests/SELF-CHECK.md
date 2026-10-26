# Author self-check

- Official GraphQL and page verification are captured in evidence/official-graphql.json; Python3 is the faithful canonical interface.
- `python3 -B tests/test_solution.py` passes fixed official examples, 300 seeded brute-force comparisons, source mirror parity, and metadata shape.
- `python3 -B scripts/register_leetcode_lesson.py 1178 --validate-only` exits 0 without registration.
- Playwright against the already-running preview exercised 390px viewport, preset change, forward/end, prediction then reveal, English locale, and no page errors; result is in evidence/browser.txt.
- This is author evidence only. Separate cold learner review and acceptance are still required; no LeetCode acceptance is claimed.
