"""Run solution.sql (and the step-2 baseline query) on SQLite against a plain-Python oracle.

SQLite is the only SQL engine available here, so the MySQL source is translated by two exact,
asserted substitutions (DATE_ADD -> DATE(..., '+1 day'); integer division -> multiply by 1.0).
The oracle computes install dates and next-day returns directly from the rows with Python dates and
exact fractions; it shares no code with the SQL or with core.js.
"""
import datetime as dt
import html
import json
import os
import random
import re
import sqlite3
from fractions import Fraction
from pathlib import Path

R = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', R / 'tests' / 'evidence' / 'run'))
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = (R / 'solution.sql').read_text()
PAGE = (R / 'index.html').read_text()


def to_sqlite(sql, division):
    out = sql
    n = len(re.findall(r'DATE_ADD\((\w+\.\w+), INTERVAL 1 DAY\)', out))
    assert n == 1, n
    out = re.sub(r'DATE_ADD\((\w+\.\w+), INTERVAL 1 DAY\)', r"DATE(\1, '+1 day')", out)
    assert out.count(division) == 1, division
    return out.replace(division, division.replace(' / ', ' * 1.0 / '))


SOLUTION_SQLITE = to_sqlite(SOURCE, 'COUNT(a.player_id) / COUNT(*)')
block = re.search(r'<pre[^>]*id="baselineSql"[^>]*><code>(.*?)</code></pre>', PAGE, re.S)
BASELINE_SQLITE = to_sqlite(html.unescape(block.group(1)), ')) / COUNT(*)')


def counts_only(sql, ratio, replacement):
    # Expose the exact numerator instead of SQLite's binary-float ROUND (see the dialect note).
    assert sql.count(ratio) == 1, ratio
    return sql.replace(ratio, replacement)


SOLUTION_COUNTS = counts_only(SOLUTION_SQLITE, 'ROUND(COUNT(a.player_id) * 1.0 / COUNT(*), 2)', 'COUNT(a.player_id)')
BASELINE_COUNTS = counts_only(counts_only(BASELINE_SQLITE, 'ROUND(SUM(EXISTS (', '(SUM(EXISTS ('), ')) * 1.0 / COUNT(*), 2)', ')))')


def half_up(fr, places=2):
    q = Fraction(10) ** places
    return Fraction(int(fr * q * 2 + 1) // 2, q)  # nonnegative values only


def oracle(rows, join='left', mysql_decimal=False, counts=False):
    first = {}
    for p, _, d, _ in rows:
        if p not in first or d < first[p]:
            first[p] = d
    dates = {(p, d) for p, _, d, _ in rows}
    groups = {}
    for p, d in first.items():
        nxt = (dt.date.fromisoformat(d) + dt.timedelta(days=1)).isoformat()
        back = (p, nxt) in dates
        if join == 'inner' and not back:
            continue
        g = groups.setdefault(d, [0, 0])
        g[0] += 1
        g[1] += back
    out = []
    for d in sorted(groups):
        m, k = groups[d]
        if counts:
            out.append((d, m, k))
            continue
        ratio = Fraction(k, m)
        if mysql_decimal:
            # MySQL: COUNT / COUNT is a DECIMAL shown with 4 places (div_precision_increment), but an
            # enclosing ROUND receives the internal value, which carries 9 decimals (MySQL developer's
            # explanation in bugs.mysql.com #103145). Worst case modelled: rounded (not truncated) at 9.
            ratio = half_up(ratio, 9)
        out.append((d, m, '%.2f' % float(half_up(ratio))))
    return out


def run(sql, rows, raw=False):
    con = sqlite3.connect(':memory:')
    con.execute('CREATE TABLE Activity (player_id INT, device_id INT, event_date DATE, games_played INT, PRIMARY KEY (player_id, event_date))')
    con.executemany('INSERT INTO Activity VALUES (?,?,?,?)', rows)
    got = con.execute(sql).fetchall()
    con.close()
    return [tuple(r) for r in got] if raw else [(d, m, '%.2f' % r) for d, m, r in got]


checks = baseline_checks = float_ties = 0


def check(rows, expected=None):
    global checks, baseline_checks, float_ties
    want = oracle(rows)
    if expected is not None:
        assert want == expected, (want, expected)
    want_counts = oracle(rows, counts=True)
    assert run(SOLUTION_COUNTS, rows, raw=True) == want_counts  # solution has ORDER BY install_dt
    floats = run(SOLUTION_SQLITE, rows)
    for (d, m, k), got, exp in zip(want_counts, floats, want):
        if got != exp:  # SQLite rounds a binary float; only exact .xx5 ties may differ
            assert (Fraction(k, m) * 100).denominator == 2, (d, m, k, got, exp)
            float_ties += 1
    if len(rows) <= 400:
        assert sorted(run(BASELINE_COUNTS, rows, raw=True)) == want_counts
        baseline_checks += 1
    checks += 1


MAIN = [[1, 7, '2024-03-05', 2], [2, 3, '2024-03-01', 1], [1, 7, '2024-03-01', 4], [3, 5, '2024-03-02', 0], [4, 2, '2024-03-01', 3],
        [1, 8, '2024-03-02', 6], [5, 5, '2024-03-02', 1], [3, 5, '2024-03-03', 2], [4, 2, '2024-03-03', 5], [5, 1, '2024-03-04', 1]]
CAL = [[1, 1, '2024-02-28', 1], [2, 2, '2024-02-29', 3], [1, 1, '2024-02-29', 2], [3, 4, '2023-12-31', 1], [2, 2, '2024-03-01', 1], [3, 4, '2024-01-01', 5]]
NOBODY = [[7, 1, '2024-05-05', 2], [8, 2, '2024-05-05', 0], [7, 1, '2024-05-07', 1]]
QUIZ = [[3, 2, '2024-06-11', 1], [1, 4, '2024-06-10', 2], [4, 1, '2024-06-10', 3], [2, 2, '2024-06-12', 1], [1, 4, '2024-06-11', 0],
        [4, 1, '2024-06-09', 5], [2, 3, '2024-06-10', 2], [3, 2, '2024-06-12', 4]]
check(MAIN, [('2024-03-01', 3, '0.33'), ('2024-03-02', 2, '0.50')])
check(CAL, [('2023-12-31', 1, '1.00'), ('2024-02-28', 1, '1.00'), ('2024-02-29', 1, '1.00')])
check(NOBODY, [('2024-05-05', 2, '0.00')])
check(QUIZ, [('2024-06-09', 1, '1.00'), ('2024-06-10', 2, '0.50'), ('2024-06-11', 1, '1.00')])
assert oracle(NOBODY, 'inner') == [] and oracle(MAIN, 'inner') == [('2024-03-01', 1, '1.00'), ('2024-03-02', 1, '1.00')]
# Lesson statements: mistake 1 (everyone active on 03-02) and mistake 2 (any later return) on MAIN.
assert sorted({p for p, _, d, _ in MAIN if d == '2024-03-02'}) == [1, 3, 5]
assert sum(1 for p in (1, 2, 4) if any(q == p and d > min(dd for qq, _, dd, _ in MAIN if qq == p) for q, _, d, _ in MAIN)) == 2
check([], [])
check([[1, 1, '2024-01-01', 0]], [('2024-01-01', 1, '0.00')])
check([[1, 1, '2023-12-31', 0], [1, 1, '2024-01-01', 0]], [('2023-12-31', 1, '1.00')])
check([[1, 1, '2023-02-28', 0], [1, 1, '2023-03-01', 0], [2, 1, '2024-02-28', 0], [2, 1, '2024-03-01', 0]],
      [('2023-02-28', 1, '1.00'), ('2024-02-28', 1, '0.00')])  # non-leap year: 03-01 is the next day; leap year: it is not

rng = random.Random(1097)
starts = [dt.date(2023, 12, 27), dt.date(2024, 2, 25), dt.date(2023, 2, 25), dt.date(2024, 6, 1)]
fixtures = []
for case in range(3000):
    players = rng.randint(1, 9)
    base = rng.choice(starts)
    rows = []
    for p in rng.sample(range(1, 40), players):
        days = sorted(rng.sample(range(0, 9), rng.randint(1, 5)))
        for d in days:
            rows.append([p, rng.randint(1, 5), (base + dt.timedelta(days=d)).isoformat(), rng.randint(0, 9)])
    rng.shuffle(rows)
    check(rows)
    if case < 400:
        fixtures.append({'rows': rows, 'left': oracle(rows), 'inner': oracle(rows, 'inner')})

# Larger tables: many installers per day, exercising rounding with large denominators.
mysql_diffs = []
for case in range(40):
    rows, used = [], set()
    for p in range(1, rng.randint(200, 900)):
        day0 = rng.randint(0, 3)
        for d in {day0, *(day0 + rng.randint(1, 3) for _ in range(rng.randint(0, 3)))}:
            rows.append([p, 1, (dt.date(2024, 2, 27) + dt.timedelta(days=d)).isoformat(), 0])
    check(rows)
    if oracle(rows) != oracle(rows, mysql_decimal=True):
        mysql_diffs.append(case)
assert not mysql_diffs, mysql_diffs  # cross-review: 9-place MySQL intermediate equals exact rounding
# Cross-review 2026-11-11: the first build modelled the intermediate as rounded to 4 places and so
# predicted 0.01 for 1 returner of 201 installers. That was an artefact of the model: a 4-place
# intermediate only arises if the ratio is CAST to DECIMAL(…,4) first. With the 9-place internal value,
# 1/201 = 0.004975124… rounds to 0.00, the exact answer.
quirk = [[p, 1, '2024-01-01', 0] for p in range(1, 202)] + [[1, 1, '2024-01-02', 0]]
assert oracle(quirk) == [('2024-01-01', 201, '0.00')] == oracle(quirk, mysql_decimal=True)
assert half_up(half_up(Fraction(1, 201), 4)) == Fraction(1, 100)  # what a 4-place intermediate would give
check(quirk)
# Exhaustive: a 9-place intermediate never changes ROUND(…, 2) for up to 3000 installers per date.
# (Proof for any m: k/m below a tie t = (2j+1)/200 sits at least 1/(200m) under it, which exceeds the
# 5·10⁻¹⁰ a 9-place rounding can move it unless m ≥ 10⁷; ties themselves are exact at 9 places.)
for m in range(1, 3001):
    for k in range(m + 1):
        assert half_up(Fraction(k, m)) == half_up(half_up(Fraction(k, m), 9)), (k, m)

# Source mirror, copy keys.
mirror = (R / 'sql-code.js').read_text()
assert mirror == 'window.SQL_SOURCE = ' + json.dumps(SOURCE) + ';\n'


def unique(pairs):
    d = {}
    for k, v in pairs:
        assert k not in d, k
        d[k] = v
    return d


copy = json.loads((R / 'copy.js').read_text().removeprefix('window.COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(s, str) and s.strip() for s in v) for v in copy.values())
used = set(re.findall(r'data-i18n="(\w+)"', PAGE)) | set(re.findall(r"t\('(\w+)'[,)]", (R / 'app.js').read_text()))
missing = sorted(k for k in used if k not in copy)
assert not missing, missing

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
report = {'kind': 'author check: solution.sql and baseline on SQLite vs Python oracle', 'sqlite': sqlite3.sqlite_version,
          'solutionTables': checks, 'baselineTables': baseline_checks, 'largeTablesWithMySqlRoundingDifference': len(mysql_diffs),
          'sqliteFloatTieDifferences': float_ties, 'sourceParity': True, 'copyKeys': len(copy), 'fixtures': len(fixtures)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
