"""Run: python3 leetcode/85/tests/test_solution.py; OUTPUT_DIR redirects reports."""
import itertools, random, json, os, sys
from pathlib import Path
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution

def oracle(a):
    # Independent 2D zero counts, then enumerate four rectangle boundaries.
    if not a or not a[0]: return 0
    R, C = len(a), len(a[0])
    p = [[0]*(C+1) for _ in range(R+1)]
    for r in range(R):
        for c in range(C):
            p[r+1][c+1] = (a[r][c]=='0')+p[r][c+1]+p[r+1][c]-p[r][c]
    best = 0
    for t in range(R):
        for b in range(t+1,R+1):
            for l in range(C):
                for rr in range(l+1,C+1):
                    if p[b][rr]-p[t][rr]-p[b][l]+p[t][l] == 0:
                        best=max(best,(b-t)*(rr-l))
    return best

def main():
    count=0
    def check(a, expected=None):
        nonlocal count
        old=[r[:] for r in a]
        got=Solution().maximalRectangle(a)
        assert got==(oracle(a) if expected is None else expected),(a,got,expected)
        assert a==old
        count+=1
    check([list(s) for s in ['10100','10111','11111','10010']],6)
    check([['0']],0);check([['1']],1);check([],0)
    check([list(s) for s in ['0100','0110','1110','1111']],6)
    for R in range(1,4):
        for C in range(1,4):
            for bits in itertools.product('01',repeat=R*C):
                check([list(bits[r*C:(r+1)*C]) for r in range(R)])
    rng=random.Random(85)
    for _ in range(500):
        R,C=rng.randint(1,7),rng.randint(1,7)
        check([[rng.choice('01') for _ in range(C)] for _ in range(R)])
    check([['1']*200 for _ in range(200)],40000)
    check([['0']*200 for _ in range(200)],0)
    check([['1']*200],200);check([['1'] for _ in range(200)],200)
    check([['1' if (r+c)%2 else '0' for c in range(200)] for r in range(200)],1)
    # Verify canonical offline mirror is precisely source, with no other code.
    src=(ROOT/'solution.py').read_text()
    assert (ROOT/'python-code.js').read_text()=='window.PYTHON_SOURCE = '+json.dumps(src)+';\n'
    # Execute the pedagogical slow baseline too, extracted without changing it.
    import re,html
    block=re.search(r'<pre><code>(def baseline.*?)</code></pre>',(ROOT/'index.html').read_text(),re.S)[1]
    ns={};exec(html.unescape(block),ns)
    for _ in range(40):
        a=[[rng.choice('01') for _ in range(3)] for _ in range(3)]
        assert ns['baseline'](a)==oracle(a)
    out=Path(os.environ.get('OUTPUT_DIR',ROOT/'evidence'));out.mkdir(parents=True,exist_ok=True)
    report={'canonicalCases':count,'baselineCases':40,'seed':85,'result':'pass','oracle':'all four rectangle bounds with 2D zero-prefix counts','mutation':'unchanged','sourceMirror':'exact'}
    (out/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
if __name__=='__main__':main()
