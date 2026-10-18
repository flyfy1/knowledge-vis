"""OUTPUT_DIR=/tmp/65-review python3 leetcode/65/tests/test_solution.py"""
import sys, json, os, re, itertools, random, pathlib, importlib.util
sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from solution import Solution
from baseline import baseline
rx = re.compile(r'[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?')
solve = Solution().isNumber
valid = ['2', '0089', '-0.1', '+3.14', '4.', '-.9', '2e10', '-90E3', '3e+7', '+6e-1', '53.5e93', '-123.456e789', '0']
invalid = ['abc', '1a', '1e', 'e3', '99e2.5', '--6', '-+3', '95a54e53', 'e', '.']
count = 0

def check(s, expected=None):
    global count
    a = solve(s)
    assert type(a) is bool
    oracle = baseline(s)
    assert oracle == bool(rx.fullmatch(s)), s
    assert a == oracle, (s, a, oracle)
    if expected is not None:
        assert a == expected, s
    count += 1

for s in valid: check(s, True)
for s in invalid: check(s, False)
for n in range(6):
    for p in itertools.product('01+-.eEa', repeat=n): check(''.join(p))
rng = random.Random(650018)
for _ in range(7000):
    check(''.join(rng.choice('0123456789eE+-.abcXYZ') for _ in range(rng.randint(1,20))))
# Generate valid grammar as well as mostly invalid random strings.
for _ in range(2000):
    a = rng.choice(['','+','-']) + rng.choice(['0','001','4.','.89','123.45'])
    s = a + rng.choice(['', 'e+2', 'E-001', 'e0'])
    check(s, True)
for s, expected in [('1' * 20, True), ('1e'+'9'*18, True), ('0.'+'0'*18, True), ('.'*20, False), ('1e+', False), ('nan', False), ('inf', False), ('', False), (' 1',False), ('1 ',False), ('١',False), ('1_0',False)]: check(s,expected)
# Embedded mirror is ONLY the canonical assignment.
source=(HERE.parent/'solution.py').read_text()
mirror=(HERE.parent/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ') and mirror.endswith(';\n')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2]) == source
print(json.dumps({'result':'pass','cases':count,'officialCases':len(valid)+len(invalid),'seed':650018,'oracles':['split grammar','full-match regex'],'type':'author algorithm self-check'}))
out=pathlib.Path(os.environ.get('OUTPUT_DIR',HERE/'evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'python-results.json').write_text(json.dumps({'result':'pass','cases':count,'seed':650018,'officialCases':len(valid)+len(invalid)},indent=2)+'\n')
