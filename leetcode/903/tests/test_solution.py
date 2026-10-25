"""Run from any cwd. OUTPUT_DIR redirects all generated evidence."""
import itertools, json, os, pathlib, sys, random, math, functools
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
MOD = 10**9+7
@functools.lru_cache(None)
def pivot(s):
    # Independent decomposition: place the maximum, choose labels on its left.
    if not s:
        return 1
    n = len(s)
    return sum(math.comb(n, p)*pivot(s[:max(0,p-1)])*pivot(s[p+1:])
               for p in range(n+1)
               if (p == 0 or s[p-1] == 'I') and (p == n or s[p] == 'D')) % MOD
fixtures={}
for n in range(7):
    counts={''.join(s):[0]*(n+1) for s in itertools.product('ID', repeat=n)}
    for p in itertools.permutations(range(n+1)):
        pattern=''.join('I' if a<b else 'D' for a,b in zip(p,p[1:]))
        counts[pattern][p[-1]] += 1
    for s,row in counts.items():
        assert Solution().numPermsDISequence(s) == sum(row), (s,row)
        assert pivot(s) == sum(row), s
        fixtures[s]=row
rng=random.Random(903)
large=['I'*200,'D'*200,'ID'*100,'DI'*100]
large+=[''.join(rng.choice('ID') for _ in range(rng.randint(7,55))) for _ in range(70)]
large+=[''.join(rng.choice('ID') for _ in range(200))]
for s in large:
    assert Solution().numPermsDISequence(s)==pivot(s),s
assert Solution().numPermsDISequence('DID')==5
assert Solution().numPermsDISequence('D')==1
# Exact offline source mirror.
mirror=(ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
(OUT/'oracle-rows.json').write_text(json.dumps(fixtures))
(OUT/'python-results.json').write_text(json.dumps({'exhaustive_patterns':len(fixtures),'permutations_through_n':6,'maximum_pivot_cases':len(large),'official_examples':True,'source_mirror_exact':True},indent=2))
print('PASS',len(fixtures),'exhaustive patterns;',len(large),'pivot checks')
