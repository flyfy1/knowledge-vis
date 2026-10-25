"""Run actual canonical callable against independently enumerated distances."""
import importlib.util, itertools, json, os, pathlib, random
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
solver = m.Solution()
cases = 0

def check(a):
    global cases
    distances = sorted(abs(x-y) for i, x in enumerate(a) for y in a[i+1:])
    for k, expected in enumerate(distances, 1):
        original = a[:]
        assert solver.smallestDistancePair(a, k) == expected, (a,k,expected)
        assert a == original
        cases += 1

for n in range(2, 7):
    for a in itertools.product(range(4), repeat=n):
        check(list(a))
rng = random.Random(719)
for _ in range(300):
    check([rng.randrange(1000001) for _ in range(rng.randrange(2, 16))])
for a,k,want in [([1,3,1],1,0),([1,1,1],2,0),([1,6,1],3,5),([0,1000000],1,1000000),([7]*10000,49995000,0),([0]*5000+[1000000]*5000,24995000,0),([0]*5000+[1000000]*5000,24995001,1000000),([0]*5000+[1000000]*5000,49995000,1000000)]:
    assert solver.smallestDistancePair(a,k) == want
    cases += 1
# Detect repeated JSON copy keys before parsing could erase them.
def no_duplicates(pairs):
    result = {}
    for key,value in pairs:
        assert key not in result, key
        result[key] = value
    return result
raw=(ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n')
copy=json.loads(raw,object_pairs_hook=no_duplicates)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
result={'kind':'author computational self-check','canonicalInvocations':cases,'oracle':'all index-pair absolute differences, sorted independently','exhaustive':'every ordered array length 2…6 over 0…3; every rank','seed':719,'seededArrays':300,'largeClosedFormCases':5,'copyKeys':len(copy),'sourceMirrorExact':True,'inputPreserved':True}
(OUT/'solution-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
