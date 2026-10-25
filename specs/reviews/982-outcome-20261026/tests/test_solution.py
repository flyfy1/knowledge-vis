"""Run: python3 -B leetcode/982/tests/test_solution.py"""
import itertools, random, json, os, pathlib, importlib.util, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('LESSON_EVIDENCE_DIR',ROOT/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical',ROOT/'solution.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sol=mod.Solution()
def oracle(a):
    return sum(1 for i in range(len(a)) for j in range(len(a)) for k in range(len(a)) if not (a[i]&a[j]&a[k]))
cases=0
start=time.monotonic()
def check(a,expected=None):
    global cases
    original=a[:]; expected=oracle(a) if expected is None else expected
    actual=sol.countTriplets(a)
    assert actual==expected,(a,expected,actual)
    assert a==original
    cases+=1
for n in range(1,6):
    for a in itertools.product(range(4),repeat=n): check(list(a))
rng=random.Random(982)
for _ in range(200):check([rng.randrange(65536) for _ in range(rng.randint(1,10))])
for a in [[2,1,3],[0,0,0],[1,1,2],[7],[0],[4,2,1],[3,5,6],[1,2,2],[65535],[0,65535],[32768,32767]]: check(a)
check([0]*1000,10**9);check([65535]*1000,0)
# Only all-nonzero triples fail when all nonzeros are identical.
check([0]*500+[65535]*500,1000**3-500**3)
mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
result={'kind':'author self-check','cases':cases,'exhaustive':'values 0..3, lengths 1..5','seed':982,'random16bit':200,'officialExamples':[12,27],'maximumCases':[10**9,0,875000000],'mutation':'unchanged','seconds':time.monotonic()-start}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
