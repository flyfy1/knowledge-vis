# Author self-check evidence

- `python3 leetcode/1159/tests/test_core.py` — pass: 203 independent-oracle fixtures (official six-row fixture, zero/one-sale boundaries, 200 seeded random fixtures); embedded SQL mirror parity exact.
- `node --check app.js core.js sql-code.js` — pass.
- `python3 -B scripts/register_leetcode_lesson.py 1159 --validate-only` — exit 0 with no output.
- Browser: preview `http://127.0.0.1:18770/leetcode/1159/`, Chromium, 390px then 1440px. Both locale toggle, trace next/end, prediction choose→reveal, source rendering, and screenshot completed. Screenshot: `browser-390-1440.png`.
- Browser console reported one generic 404 resource warning from the shared preview host; lesson-owned CSS/JS/common assets each returned 200 by direct requests. No lesson script exception occurred. This remains a self-check limitation, not independent review.
- No MySQL server is available in the author environment, so the canonical query was checked against the independent relational oracle rather than executed by MySQL. Full paid statement and selector text remain unavailable from the authorized public official response; see `provenance/official-graphql.json`.
- SQLite execution of the canonical query against the observed three-table fixture produced `(1,no),(2,yes),(3,yes),(4,no)`. SQLite is a compatibility check only; it is not evidence of MySQL runtime acceptance.
- Candidate freeze: `tests/evidence/candidate.json` (`1159-c1`) hashes the complete lesson-local candidate after metadata/source fixes.
