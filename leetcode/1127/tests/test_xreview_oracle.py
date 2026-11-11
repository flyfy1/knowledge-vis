"""Independent cross-review check for #1127 (2026-11-11), written without reading the builder's oracle.

Runs solution.sql in in-memory SQLite (MySQL is not available locally) against a definition written from the
problem statement as quoted by public solution sites: every date in Spending gets desktop, mobile and both rows;
a user is 'both' on a date if they used both platforms that date; empty groups print 0 and 0; any order.
Exhaustive: every subset of 2 users x 2 dates x 2 platforms with amounts from {0, 7}; then 3000 seeded tables.

Usage (repository root):  python3 -B leetcode/1127/tests/test_xreview_oracle.py
"""
import itertools
import random
import sqlite3
from pathlib import Path

SQL = (Path(__file__).resolve().parent.parent / 'solution.sql').read_text()


def oracle(rows):
    per = {}
    for user, date, platform, amount in rows:
        entry = per.setdefault((date, user), [set(), 0])
        entry[0].add(platform)
        entry[1] += amount
    out = []
    for date in sorted({r[1] for r in rows}):
        for label in ('desktop', 'mobile', 'both'):
            hits = [a for (d, _), (ps, a) in per.items()
                    if d == date and ('both' if len(ps) == 2 else next(iter(ps))) == label]
            out.append((date, label, sum(hits), len(hits)))
    return sorted(out)


def run(rows):
    con = sqlite3.connect(':memory:')
    con.execute('create table Spending(user_id int, spend_date date, platform text, amount int)')
    con.executemany('insert into Spending values (?, ?, ?, ?)', rows)
    return sorted(con.execute(SQL).fetchall())


cells = [(u, d, p) for u in (1, 2) for d in ('2020-01-01', '2020-01-02') for p in ('desktop', 'mobile')]
count = 0
for mask in range(1 << len(cells)):
    chosen = [c for i, c in enumerate(cells) if mask >> i & 1]
    for amounts in itertools.product((0, 7), repeat=len(chosen)):
        rows = [(u, d, p, a) for (u, d, p), a in zip(chosen, amounts)]
        assert run(rows) == oracle(rows), rows
        count += 1
rng = random.Random(20261111)
for _ in range(3000):
    rows = []
    for user in range(rng.randint(1, 15)):
        for date in rng.sample([f'2021-03-0{i}' for i in range(1, 8)], rng.randint(0, 4)):
            for platform in ('desktop', 'mobile'):
                if rng.random() < 0.5:
                    rows.append((user, date, platform, rng.randint(0, 1000)))
    rng.shuffle(rows)
    assert run(rows) == oracle(rows)
    count += 1
sample = [(1, '2019-07-01', 'mobile', 100), (1, '2019-07-01', 'desktop', 100), (2, '2019-07-01', 'mobile', 100),
          (2, '2019-07-02', 'mobile', 100), (3, '2019-07-01', 'desktop', 100), (3, '2019-07-02', 'desktop', 100)]
assert ('2019-07-02', 'both', 0, 0) in run(sample) and ('2019-07-01', 'both', 200, 1) in run(sample)
print(f'solution.sql (SQLite) == independent definition on {count} tables, including the public sample input')
