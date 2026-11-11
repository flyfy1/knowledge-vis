"""Executes the lesson's SQL in SQLite and compares it with a plain-Python definition.

Added by the independent review (Claude Code, 2026-11-11). Checks:
  * solution.sql against the plain definition on exhaustive small markets and seeded random ones;
  * the step-2 correlated-subquery baseline (from core.js) against the same definition;
  * every step-3 query variant shown on the page (core.variantSql) executed in SQLite against the
    page's own simulated pipeline (core.pipeline), so the simulation and the real SQL agree,
    including the wrong variants;
  * the wrong variants really are wrong on the lesson's main example.
Dialect: SQLite stands in for MySQL 8 (both support ROW_NUMBER windows and backtick identifiers).
MySQL's default collation compares strings case-insensitively; all data here uses one capitalisation.
Run from anywhere: python3 leetcode/1159/tests/test_sql.py
"""
import itertools, json, random, sqlite3, subprocess
from pathlib import Path
R = Path(__file__).resolve().parents[1]
SOLUTION = (R / 'solution.sql').read_text()
dump = subprocess.run(['node', '-e', '''
const c = require(process.argv[1]); const out = {baseline: c.BASELINE_SQL, variants: []};
for (const order of ['date','id']) for (const join of ['left','inner']) for (const filter of ['on','where']) out.variants.push({opts: {order, join, filter}, sql: c.variantSql({order, join, filter})});
out.presets = c.presets.concat([c.PREDICT]); out.brands = c.BRANDS;
console.log(JSON.stringify(out));''', str(R / 'core.js')], capture_output=True, text=True, check=True)
CORE = json.loads(dump.stdout)
assert CORE['variants'][0]['opts'] == {'order': 'date', 'join': 'left', 'filter': 'on'} and CORE['variants'][0]['sql'] == SOLUTION

def pipeline_js(dataset, opts):
    r = subprocess.run(['node', '-e', 'const c=require(process.argv[1]);console.log(JSON.stringify(c.pipeline(JSON.parse(process.argv[2]),JSON.parse(process.argv[3])).output))', str(R / 'core.js'), json.dumps(dataset), json.dumps(opts)], capture_output=True, text=True, check=True)
    return [tuple(x) for x in json.loads(r.stdout)]

def plain(users, orders, items):
    brand = dict(items); out = []
    for uid, fav in users:
        sales = sorted((o for o in orders if o[4] == uid), key=lambda o: o[1])
        out.append((uid, 'yes' if len(sales) >= 2 and brand.get(sales[1][2]) == fav else 'no'))
    return sorted(out)

def run_sql(sql, users, orders, items, sort=True):
    db = sqlite3.connect(':memory:')
    db.execute('create table Users(user_id int, join_date text, favorite_brand text)')
    db.execute('create table Orders(order_id int, order_date text, item_id int, buyer_id int, seller_id int)')
    db.execute('create table Items(item_id int, item_brand text)')
    db.executemany('insert into Users values(?,?,?)', [(u, '2024-01-01', f) for u, f in users])
    db.executemany('insert into Orders values(?,?,?,?,?)', orders)
    db.executemany('insert into Items values(?,?)', items)
    cur = db.execute(sql)
    assert [d[0] for d in cur.description] == ['seller_id', '2nd_item_fav_brand']
    rows = [tuple(r) for r in cur.fetchall()]
    return sorted(rows) if sort else rows

exhaustive = 0
items = [(10, 'Kiwi'), (11, 'Lumo'), (12, 'Nova')]
for favs in itertools.product(['Kiwi', 'Lumo', 'Nova'], repeat=2):
    users = [(1, favs[0]), (2, favs[1])]
    for k1 in range(4):
        for k2 in range(4):
            for seq in itertools.product([10, 11, 12], repeat=k1 + k2):
                orders = [(0, f'2024-01-{j + 1:02d}', seq[j], 2, 1) for j in range(k1)] + [(0, f'2024-01-{j + 1:02d}', seq[k1 + j], 1, 2) for j in range(k2)]
                random.Random(exhaustive).shuffle(orders)              # storage order != date order
                orders = [(i + 1,) + o[1:] for i, o in enumerate(orders)]
                want = plain(users, orders, items)
                assert run_sql(SOLUTION, users, orders, items) == want
                assert run_sql(CORE['baseline'], users, orders, items) == want
                exhaustive += 1
randomized = 0
for seed in range(2000):
    r = random.Random(seed)
    nu = r.randint(1, 8); ni = r.randint(1, 5)
    its = [(i, r.choice(['Kiwi', 'Lumo', 'Nova'])) for i in range(1, ni + 1)]
    users = [(u, r.choice(['Kiwi', 'Lumo', 'Nova'])) for u in range(1, nu + 1)]
    orders = []
    for u in range(1, nu + 2):                                   # seller nu+1 is not in Users
        for d in r.sample(range(1, 29), r.randint(0, 5)):
            orders.append((0, f'2024-02-{d:02d}', r.randint(1, ni), r.randint(1, nu), u))
    r.shuffle(orders); orders = [(i + 1,) + o[1:] for i, o in enumerate(orders)]
    want = plain(users, orders, its)
    rows = run_sql(SOLUTION, users, orders, its, sort=False)
    assert rows == want                                          # also checks ORDER BY user_id
    assert run_sql(CORE['baseline'], users, orders, its) == want
    randomized += 1
# The page's simulated pipeline equals real SQL for all 8 variants on the presets and random data.
variant_checks = 0
datasets = CORE['presets'] + []
r = random.Random(1159)
for _ in range(25):
    users = [[u, r.choice(CORE['brands'])] for u in range(1, r.randint(2, 5))]
    orders = []
    for u in range(1, len(users) + 1):
        for d in r.sample(range(1, 20), r.randint(0, 4)):
            orders.append([0, f'2024-03-{d:02d}', r.choice([10, 11, 12]), 1, u])
    r.shuffle(orders); orders = [[i + 1] + o[1:] for i, o in enumerate(orders)]
    datasets.append({'users': users, 'items': [[10, 'Kiwi'], [11, 'Lumo'], [12, 'Nova']], 'orders': orders})
for ds in datasets:
    users = [tuple(u) for u in ds['users']]; orders = [tuple(o) for o in ds['orders']]; its = [tuple(i) for i in ds['items']]
    for v in CORE['variants']:
        assert run_sql(v['sql'], users, orders, its) == sorted(pipeline_js(ds, v['opts'])), v['opts']
        variant_checks += 1
# On the main example, each single wrong turn changes the answer the way the page says.
main = CORE['presets'][0]
mu = [tuple(u) for u in main['users']]; mo = [tuple(o) for o in main['orders']]; mi = [tuple(i) for i in main['items']]
by = {tuple(v['opts'].values()): v['sql'] for v in CORE['variants']}
assert run_sql(SOLUTION, mu, mo, mi) == [(1, 'yes'), (2, 'no'), (3, 'yes'), (4, 'no')]
assert run_sql(by[('id', 'left', 'on')], mu, mo, mi) == [(1, 'yes'), (2, 'no'), (3, 'no'), (4, 'no')]
assert run_sql(by[('date', 'inner', 'on')], mu, mo, mi) == [(1, 'yes'), (3, 'yes')]
assert run_sql(by[('date', 'left', 'where')], mu, mo, mi) == [(1, 'yes'), (3, 'yes')]
pred = CORE['presets'][-1]
assert run_sql(SOLUTION, [tuple(u) for u in pred['users']], [tuple(o) for o in pred['orders']], [tuple(i) for i in pred['items']]) == [(7, 'no')]
print(f'SQLite: solution.sql and baseline vs plain definition on {exhaustive} exhaustive + {randomized} random markets; {variant_checks} variant runs match the page simulation; wrong turns and prediction verified: pass')
