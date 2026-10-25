"""Independent legal-move search, not recursive block normalization."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('LESSON_OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().makeLargestSpecial


def special(s):
    balance = 0
    for bit in s:
        balance += 1 if bit == '1' else -1
        if balance < 0:
            return False
    return balance == 0


def reachable(s):
    seen = {s}
    queue = [s]
    for current in queue:
        n = len(current)
        for a in range(n):
            for b in range(a + 1, n):
                if not special(current[a:b]):
                    continue
                for c in range(b + 1, n + 1):
                    if special(current[b:c]):
                        candidate = current[:a] + current[b:c] + current[a:b] + current[c:]
                        if candidate not in seen:
                            seen.add(candidate)
                            queue.append(candidate)
    return seen


cases = []
# Cache entire connected components, each independently enumerated by legal moves.
cache = {}
for n in range(2, 13, 2):
    for bits in itertools.product('10', repeat=n):
        s = ''.join(bits)
        if special(s):
            if s not in cache:
                component = reachable(s)
                best = max(component)
                cache.update({x: best for x in component})
            cases.append((s, cache[s]))
rng = random.Random(761)
for _ in range(100):
    # Random valid strings via shuffling until the prefix condition holds.
    bits = list('1' * 7 + '0' * 7)
    while True:
        rng.shuffle(bits)
        s = ''.join(bits)
        if special(s):
            break
    cases.append((s, max(reachable(s))))
cases += [('11011000','11100100'), ('10','10'), ('10111000','11100010'),
          ('1'*25+'0'*25,'1'*25+'0'*25), ('10'*25,'10'*25),
          ('10'*23+'1100','1100'+'10'*23)]
for s, expected in cases:
    assert solve(s) == expected, (s, solve(s), expected)
    assert special(solve(s)) and len(solve(s)) == len(s)
    assert solve(solve(s)) == solve(s)
assert solve('') == ''  # internal base case, not official input
# Check the browser's separate trace against independently enumerated results.
script = "const c=require('./core.js');let a=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(a.map(s=>c.trace(s))));"
traces = json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT,input=json.dumps([x[0] for x in cases]).encode()))
frames = 0
return_oracles = dict(cases)
for (s, expected), trace in zip(cases, traces):
    assert trace[-1]['kind'] == 'return' and trace[-1]['result'] == expected
    for f in trace:
        frames += 1
        text = f['s']
        balances = [text[:i+1].count('1')-text[:i+1].count('0') for i in range(len(f['prefix']))]
        assert f['prefix'] == balances
        assert f['balance'] == (balances[-1] if balances else 0)
        assert all(x >= 0 for x in balances)
        assert all(special(p) and p for p in f['parts'])
        if f['kind'] == 'descend':
            assert special(f['block']) and special(f['inside'])
            assert all(f['block'][:i].count('1') > f['block'][:i].count('0') for i in range(1,len(f['block'])))
        if f['kind'] == 'append':
            assert f['built'] == '1'+f['inner']+'0'
        if f['kind'] == 'sort':
            assert f['parts'] == sorted(f['before'],reverse=True)
        if f['kind'] == 'return':
            assert ''.join(f['parts']) == f['result']
            if text not in return_oracles:
                component = reachable(text)
                best = max(component)
                return_oracles.update({x: best for x in component})
            assert f['result'] == return_oracles[text], ('return invariant', f)
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report = {'result':'pass','canonicalCases':len(cases),'exhaustiveMaxLength':12,'seed':761,'seededLength14Cases':100,'traceFrames':frames,'returnInvariantOracleInputs':len(return_oracles),'oracle':'all reachable states by legal adjacent-special-substring swaps','sourceParity':True}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
