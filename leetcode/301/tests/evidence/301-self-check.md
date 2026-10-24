# #301 revision self-check — fixes awaiting independent review

Date: 2026-10-24 (Asia/Singapore)

This is author self-check evidence only; it does not independently accept the lesson.

## Fix mapping

- **L301-COLD-001**: Step 04 now keys option B (`["((a)())"]`) as correct. The bilingual explanation hand-checks the three opens, three closes, and prefix balances `1, 1, 2, 1, 0, 0`, establishing zero deletions. Regression covers the wrong option and correct option in English and Chinese at 390×900.
- **L301-CODE-002**: Step 05 now labels the browser trace as a conceptual simulation with a different control shape and maps its balance/budget ideas to the canonical `remove(text, scan, last, pair)` recursion, first-bad-prefix deletion, adjacent-duplicate skipping, reverse/swap second pass, and `ans` emission. Regression asserts the rendered mapping contains `remove(` and no stale `dfs(` claim in both locales.

## Commands and results

- `NODE_PATH="$NODE_PATH" node leetcode/301/tests/regression.js` → `regression ok: quiz, locales, mapping, and source parity`
- `python3 leetcode/301/tests/test_solution.py` → `ok`
- `NODE_PATH="$NODE_PATH" node leetcode/301/tests/browser_check.js` → `browser ok`
- `python3 -B scripts/register_leetcode_lesson.py 301 --validate-only` → exit 0 (metadata and lesson contract valid)

The Python oracle suite includes valid (`((a)())`, `a`, `()`), left-heavy (`(((`), and right-heavy (`)))`, `)(`) inputs plus seeded random cases. The browser regression checks both locales, prediction gating, corrected reveal text, mapping/source claims, and byte-exact displayed Python source parity. No independent-review or acceptance claim is made here.
- `node` Playwright check at 320×900 in both locales → `320px bilingual state/overflow ok`; trace state remained populated across locale switches and no horizontal overflow was observed.
