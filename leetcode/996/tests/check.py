import ast, importlib.util, itertools, json, math, os, random
from pathlib import Path
P=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('EVIDENCE_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def oracle(a):
    # Independently form the allowed sums by enumerating integer squares.
    squares={i*i for i in range(math.isqrt(2*max(a))+1)}
    return sum(all(p[i]+p[i+1] in squares for i in range(len(p)-1)) for p in set(itertools.permutations(a)))
cases=[list(a) for n in range(1,7) for a in itertools.combinations_with_replacement(range(5),n)]
r=random.Random(996)
cases += [[r.randrange(20) for _ in range(r.randrange(1,9))] for _ in range(160)]
cases += [[0],[10**9],[1,17,8],[2,2,2],[0,0,1],[1,1,8,8],[1,2],[1,999950883]]
for a in cases:
    before=a[:];got=m.Solution().numSquarefulPerms(a);expected=oracle(a)
    assert got==expected,(a,got,expected)
    assert a==before
for a,expected in [([0]*12,1),([2]*12,1),([10**9]*12,0),([1]*6+[8]*6,7)]:
    assert m.Solution().numSquarefulPerms(a)==expected
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Catch duplicates before Python/JSON can overwrite them.
tree=ast.parse((P/'tests/build_copy.py').read_text())
for node in ast.walk(tree):
    if isinstance(node,ast.Dict):
        keys=[ast.literal_eval(k) for k in node.keys];assert len(keys)==len(set(keys))
pairs=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'))
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in pairs.values())
(out/'python-results.json').write_text(json.dumps({'kind':'author self-check','oracleCases':len(cases),'maximumLengthCases':4,'sourceParity':True,'copyKeysUnique':True},indent=2)+'\n')
print('PASS',len(cases),'oracle cases, 4 n=12 boundaries, exact mirror and copy-key checks')
