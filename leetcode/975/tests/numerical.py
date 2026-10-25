import html
import importlib.util, itertools, random, json, os, pathlib, subprocess, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('sol',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def oracle(a):
    up=[];down=[]
    for i,v in enumerate(a):
        hi=[j for j in range(i+1,len(a)) if a[j]>=v]
        lo=[j for j in range(i+1,len(a)) if a[j]<=v]
        up.append(min(hi,key=lambda j:(a[j],j)) if hi else -1)
        down.append(min(lo,key=lambda j:(-a[j],j)) if lo else -1)
    def walk(i,parity):
        while i!=len(a)-1:
            i=(up if parity else down)[i]
            if i==-1:return False
            parity=not parity
        return True
    odd=[walk(i,True) for i in range(len(a))];even=[walk(i,False) for i in range(len(a))]
    return dict(up=up,down=down,odd=odd,even=even)
cases=[list(x) for n in range(1,8) for x in itertools.product(range(3),repeat=n)]
r=random.Random(975);cases += [[r.randrange(100000) for _ in range(r.randint(1,35))] for _ in range(500)]
cases += [[10,13,12,14,15],[2,3,1,1,4],[5,1,3,4,2],[4,2,3,1]]
baseline_source=html.unescape(re.search(r'<pre><code>(.*?)</code></pre>',(ROOT/'index.html').read_text(),re.S).group(1));ns={};exec(baseline_source,ns)
expected=[]
for a in cases:
    ex=oracle(a);assert ns['baseline'](a)==sum(ex['odd']);original=a[:];assert mod.Solution().oddEvenJumps(a)==sum(ex['odd']);assert a==original
    expected.append({'a':a,**ex})
# Every browser-model snapshot checked, including immutable state, stack invariant and exact target assignments.
js="""const fs=require('fs'),assert=require('assert'),C=require(process.argv[1]);const data=JSON.parse(fs.readFileSync(0,'utf8'));let frames=0;for(const e of data){const ff=C.trace(e.a),n=e.a.length;for(let k=0;k<ff.length;k++){const f=ff[k];frames++;for(const name of ['up','down','odd','even'])for(let i=0;i<n;i++){if(name==='up'||name==='down'){if(f[name][i]!==-1)assert.equal(f[name][i],e[name][i]);if(k>=(name==='up'?n:2*n))assert.deepEqual(f[name],e[name]);}else if(f[name][i]!==null)assert.equal(f[name][i],e[name][i]);}if(f.stack)for(let i=1;i<f.stack.length;i++)assert(f.stack[i-1]>f.stack[i]);if(f.event==='dp')for(let j=f.i;j<n;j++)assert.notEqual(f.odd[j],null);}const last=ff.at(-1);for(const name of ['up','down','odd','even'])assert.deepEqual(last[name],e[name]);}console.log(frames);"""
p=subprocess.run(['node','-e',js,str(ROOT/'core.js')],input=json.dumps(expected),text=True,capture_output=True);assert p.returncode==0,p.stderr
for a,expected_count in [([0]*20000,20000),(list(range(20000)),2),(list(range(19999,-1,-1)),1),([99999],1)]:assert mod.Solution().oddEvenJumps(a)==expected_count
src=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(src)+';\n'
# Detect dictionary duplicates before evaluation; all localized pairs are two strings.
keys=re.findall(r'(?:^|,)\s*([A-Za-z][A-Za-z0-9]*):\[', (ROOT/'copy.js').read_text(),re.M);assert len(keys)==len(set(keys))
print('Python and JS oracle checks passed:',len(cases),'cases,',p.stdout.strip(),'snapshots')
(OUT/'numerical.json').write_text(json.dumps({'kind':'author self-check','cases':len(cases),'snapshots':int(p.stdout),'maximum_n':20000,'official_expected':[2,3,3],'status':'pass','oracle':'direct suffix selection then independent alternating path walks'},indent=2)+'\n')
