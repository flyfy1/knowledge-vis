"""Author checks. OUTPUT_DIR redirects all emitted evidence outside candidate."""
import sys, os, json, random, importlib.util, functools
from pathlib import Path
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT/'solution.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
solve = mod.Solution().findKthNumber

# Independent oracle: count strings <= answer by digit DP, separately per length.
# No arithmetic prefix intervals, and no skip/descend traversal.
def lex_rank(n, answer):
    bound, target = str(n), str(answer)
    total = 0
    for length in range(1, len(bound)+1):
        @functools.lru_cache(None)
        def dp(i, tight, cmp):
            if i == length:
                return int(cmp <= 0)
            limit = int(bound[i]) if tight else 9
            acc = 0
            for digit in range(1 if i == 0 else 0, limit+1):
                relation = cmp
                if relation == 0:
                    relation = 1 if i >= len(target) else (digit > int(target[i])) - (digit < int(target[i]))
                acc += dp(i+1, tight and digit == limit, relation)
            return acc
        total += dp(0, length == len(bound), 0)
    return total

checks = 0
for n in range(1, 251):
    ordered = sorted(range(1,n+1), key=str)
    for k, expected in enumerate(ordered, 1):
        assert solve(n,k) == expected, (n,k,expected)
        checks += 1
    # Validate the independent rank oracle itself against exhaustive sorting.
    for k, value in enumerate(ordered, 1):
        assert lex_rank(n,value) == k

# Intermediate invariants in the ACTUAL canonical Python, not a rewritten solver.
loop_checks = count_checks = 0
orders = {}
def audit(frame, event, arg):
    global loop_checks, count_checks
    if frame.f_code.co_filename != str(ROOT/'solution.py'):
        return audit
    loc = frame.f_locals
    if frame.f_code.co_name == 'findKthNumber' and event == 'line' and 'prefix' in loc and 'remaining' in loc:
        # Audit loop-entry and return lines; other lines may describe a partial update.
        source_line = lines[frame.f_lineno-1].strip()
        if source_line in ('while remaining > 0:', 'return prefix'):
            n,k,p,r = loc['n'],loc['k'],loc['prefix'],loc['remaining']
            assert orders[n].index(p) + r == k-1
            assert 0 <= r < k
            loop_checks += 1
    if frame.f_code.co_name == 'prefix_size' and event == 'return':
        n,p = loc['n'],loc['prefix']
        assert arg == sum(str(x).startswith(str(p)) for x in range(1,n+1))
        count_checks += 1
    return audit
lines = (ROOT/'solution.py').read_text().splitlines()
for n in range(1,51):
    orders[n] = sorted(range(1,n+1),key=str)
    for k in range(1,n+1):
        sys.settrace(audit)
        try: solve(n,k)
        finally: sys.settrace(None)

# Distinct iterative lexicographic successor oracle for larger traversals.
def successor_oracle(n,k):
    x = 1
    for _ in range(k-1):
        if x*10 <= n: x *= 10
        else:
            while x%10 == 9 or x+1 > n: x //= 10
            x += 1
    return x
rng = random.Random(440)
for _ in range(120):
    n = rng.randint(251,1000000); k = rng.randint(1,min(n,12000))
    assert solve(n,k) == successor_oracle(n,k)
    checks += 1
fixtures = []
for n,k in [(13,2),(1,1),(23,14),(35,20),(13,6),(100,10),(10**9,1),(10**9,2),(10**9,10**9)]+[(rng.randint(1,10**9),None) for _ in range(1000)]:
    k = k or rng.randint(1,n)
    answer = solve(n,k)
    assert 1 <= answer <= n and lex_rank(n,answer) == k, (n,k,answer)
    fixtures.append({'n':n,'k':k,'answer':answer})
    checks += 1
assert solve(10**9,10**9) == 999999999
# Provide independently rank-checked answers for numerical-core cross-runtime tests.
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
result = {'status':'pass','canonical':'solution.py: Solution.findKthNumber','final_answer_cases':checks,'actual_python_loop_invariants':loop_checks,'actual_python_group_counts':count_checks,'oracle':'exhaustive string sort, iterative successor, independently checked digit DP rank','seed':440}
(OUT/'algorithm.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
