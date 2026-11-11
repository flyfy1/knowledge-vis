"""Run solution.sql in an in-memory SQLite database and compare it with a plain-Python oracle.

Usage (repository root):  OUTPUT_DIR=/tmp/1127-check python3 -B leetcode/1127/tests/test_solution.py
Writes oracle fixtures (consumed by test_core.cjs) and numerical.json to OUTPUT_DIR
(default: leetcode/1127/tests/evidence).

SQLite is not MySQL. The query uses only features both engines share (CTE, CASE,
COUNT(DISTINCT), CROSS JOIN, UNION ALL, LEFT JOIN, COALESCE); see BRIEF.md for the
dialect notes. Dates are stored as ISO text, which sorts like a DATE.
"""
import itertools
import json
import os
import random
import sqlite3
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
LESSON = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
SQL = (LESSON / 'solution.sql').read_text()
ORDER = {'desktop': 0, 'mobile': 1, 'both': 2}


def oracle(rows):
    """Definition-level answer: label each (date, user) once, then total per date and label."""
    platforms, amounts = {}, {}
    for user, date, platform, amount in rows:
        platforms.setdefault((date, user), set()).add(platform)
        amounts[(date, user)] = amounts.get((date, user), 0) + amount
    answer = []
    for date in sorted({r[1] for r in rows}):
        for label in ('desktop', 'mobile', 'both'):
            users = [u for (d, u), p in platforms.items()
                     if d == date and ('both' if len(p) == 2 else next(iter(p))) == label]
            answer.append((date, label, sum(amounts[(date, u)] for u in users), len(users)))
    return answer


def run_sql(rows, query=SQL):
    con = sqlite3.connect(':memory:')
    con.execute("""CREATE TABLE Spending (
        user_id INT, spend_date DATE,
        platform TEXT CHECK (platform IN ('desktop', 'mobile')),
        amount INT, PRIMARY KEY (user_id, spend_date, platform))""")
    con.executemany('INSERT INTO Spending VALUES (?, ?, ?, ?)', rows)
    got = [tuple(r) for r in con.execute(query).fetchall()]
    con.close()
    return got


def check(rows, label):
    want = oracle(rows)
    got = run_sql(rows)
    assert got == want, (label, rows, got, want)  # exact rows AND the documented order
    return want


stats = {'exhaustiveTables': 0, 'randomTables': 0, 'edgeTables': 0}
DATES = ['2024-03-01', '2024-03-02']
USERS = [1, 2, 3]
SOURCES = ['mobile', 'desktop']
AMOUNTS = {('2024-03-01', 1, 'mobile'): 40, ('2024-03-01', 1, 'desktop'): 25, ('2024-03-01', 2, 'mobile'): 30,
           ('2024-03-01', 2, 'desktop'): 15, ('2024-03-01', 3, 'mobile'): 20, ('2024-03-01', 3, 'desktop'): 50,
           ('2024-03-02', 1, 'mobile'): 35, ('2024-03-02', 1, 'desktop'): 10, ('2024-03-02', 2, 'mobile'): 12,
           ('2024-03-02', 2, 'desktop'): 45, ('2024-03-02', 3, 'mobile'): 60, ('2024-03-02', 3, 'desktop'): 5}
slots = [(d, u, p) for d in DATES for u in USERS for p in SOURCES]

# 1. Exhaustive: every subset of the 12 possible rows of the lesson's toggle grid (4096 tables).
fixtures = []
for mask in range(1 << len(slots)):
    rows = [(u, d, p, AMOUNTS[(d, u, p)]) for i, (d, u, p) in enumerate(slots) if mask >> i & 1]
    want = check(rows, 'exhaustive')
    fixtures.append({'on': [f'{d}|{u}|{p}' for i, (d, u, p) in enumerate(slots) if mask >> i & 1],
                     'expected': [dict(zip(('spend_date', 'platform', 'total_amount', 'total_users'), r)) for r in want]})
    stats['exhaustiveTables'] += 1

# 2. Edge cases: empty table, zero amounts, one row, a date with only 'both' users, many dates.
edges = [
    [],
    [(1, '2024-01-01', 'mobile', 0)],
    [(1, '2024-01-01', 'mobile', 0), (1, '2024-01-01', 'desktop', 0)],
    [(5, '2024-01-01', 'desktop', 7)],
    [(u, '2024-01-01', p, 1) for u in range(1, 6) for p in SOURCES],
    [(u, f'2024-01-{d:02d}', 'mobile', d) for u in range(1, 4) for d in range(1, 29)],
]
for rows in edges:
    check(rows, 'edge')
    stats['edgeTables'] += 1
assert run_sql([]) == []
assert run_sql([(1, '2024-01-01', 'mobile', 0), (1, '2024-01-01', 'desktop', 0)]) == [
    ('2024-01-01', 'desktop', 0, 0), ('2024-01-01', 'mobile', 0, 0), ('2024-01-01', 'both', 0, 1)]

# 3. Seeded random tables: up to 12 dates, 30 users, amounts 0..10^6.
rng = random.Random(1127)
for trial in range(3000):
    n_dates, n_users = rng.randint(1, 12), rng.randint(1, 30)
    density = rng.random()
    rows = []
    for d in range(n_dates):
        date = f'2025-{rng.randint(1, 12):02d}-{d + 1:02d}'
        for u in rng.sample(range(1, 1000), n_users):
            for p in SOURCES:
                if rng.random() < density:
                    rows.append((u, date, p, rng.randint(0, 10 ** 6)))
    rng.shuffle(rows)  # table order must not matter
    check(rows, 'random')
    stats['randomTables'] += 1

# 4. Larger table for the cost claim (correctness only; timing is not evidence of complexity).
big = [(u, f'2026-{m:02d}-{d:02d}', p, (u * 7 + d) % 100)
       for m in range(1, 4) for d in range(1, 29) for u in range(1, 120) for p in SOURCES if (u + d + m) % 3 or p == 'mobile']
check(big, 'large')

# 5. The tempting wrong query really is wrong on the lesson's worked example.
NAIVE = """SELECT spend_date, platform, SUM(amount), COUNT(DISTINCT user_id)
FROM Spending GROUP BY spend_date, platform
ORDER BY spend_date, CASE platform WHEN 'desktop' THEN 1 ELSE 2 END"""
worked = [(1, '2024-03-01', 'mobile', 40), (1, '2024-03-01', 'desktop', 25), (2, '2024-03-01', 'mobile', 30),
          (3, '2024-03-01', 'desktop', 50), (2, '2024-03-02', 'desktop', 45), (3, '2024-03-02', 'mobile', 60)]
assert run_sql(worked, NAIVE) == [('2024-03-01', 'desktop', 75, 2), ('2024-03-01', 'mobile', 70, 2),
                                  ('2024-03-02', 'desktop', 45, 1), ('2024-03-02', 'mobile', 60, 1)]
assert oracle(worked) == [('2024-03-01', 'desktop', 50, 1), ('2024-03-01', 'mobile', 30, 1), ('2024-03-01', 'both', 65, 1),
                          ('2024-03-02', 'desktop', 45, 1), ('2024-03-02', 'mobile', 60, 1), ('2024-03-02', 'both', 0, 0)]
# COUNT(*) instead of COUNT(u.user_id) would report one user in an empty cell.
COUNT_STAR = SQL.replace('COUNT(u.user_id)', 'COUNT(*)')
assert ('2024-03-02', 'both', 0, 1) in run_sql(worked, COUNT_STAR)
# Without the grid, empty cells vanish.
NO_GRID = SQL[:SQL.index('grid AS')].rstrip().rstrip(',') + """
SELECT spend_date, platform, SUM(amount), COUNT(user_id) FROM user_day GROUP BY spend_date, platform"""
assert len(run_sql(worked, NO_GRID)) == 5

# 6. Prediction case shown in the lesson (not a trace preset).
predict = [(7, '2024-04-07', 'mobile', 18), (7, '2024-04-07', 'desktop', 22), (8, '2024-04-07', 'mobile', 9),
           (9, '2024-04-07', 'mobile', 11), (10, '2024-04-07', 'desktop', 6)]
assert check(predict, 'prediction') == [('2024-04-07', 'desktop', 6, 1), ('2024-04-07', 'mobile', 20, 2), ('2024-04-07', 'both', 40, 1)]

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
core = subprocess.run(['node', str(HERE / 'test_core.cjs')], input=json.dumps(fixtures), text=True, capture_output=True)
assert core.returncode == 0, core.stdout + core.stderr
# Mirror parity: sql-code.js must contain exactly solution.sql.
mirror = (LESSON / 'sql-code.js').read_text()
prefix = 'window.SQL_SOURCE = '
assert mirror.startswith(prefix) and json.loads(mirror[len(prefix):].rstrip().rstrip(';')) == SQL
stats['coreReport'] = json.loads(core.stdout)
stats['engine'] = 'sqlite3 ' + sqlite3.sqlite_version
(OUT / 'numerical.json').write_text(json.dumps(stats, indent=2) + '\n')
print(json.dumps(stats, indent=2))
