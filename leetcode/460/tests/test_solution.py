"""Run from any directory; OUTPUT_DIR redirects all generated evidence."""
import importlib.util, itertools, json, os, random, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT/'solution.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
class Oracle:
    def __init__(self, cap): self.cap, self.time, self.d = cap, 0, {}
    def run(self, op):
        self.time += 1
        kind, k, *v = op
        if kind == 'get':
            if k not in self.d: return -1
            val, f, _ = self.d[k]; self.d[k] = (val, f+1, self.time)
            return val
        if self.cap == 0: return
        if k in self.d: self.d[k] = (v[0], self.d[k][1]+1, self.time)
        else:
            if len(self.d) == self.cap:
                del self.d[min(self.d, key=lambda x: self.d[x][1:])]
            self.d[k] = (v[0], 1, self.time)
    def state(self):
        fs = sorted({v[1] for v in self.d.values()})
        return {f: sorted((k for k,v in self.d.items() if v[1]==f), key=lambda k:self.d[k][2]) for f in fs}
checks = 0
def check(cap, ops):
    global checks
    c, o = m.LFUCache(cap), Oracle(cap)
    for op in ops:
        assert getattr(c, op[0])(*op[1:]) == o.run(op)
        assert c.items == {k:v[:2] for k,v in o.d.items()}
        assert {f:list(ks) for f,ks in c.buckets.items()} == o.state()
        assert len(c.items) <= cap
        assert c.min_freq == min(o.state(), default=0)
        checks += 1
ops = [('get',0),('get',1),('put',0,0),('put',0,9),('put',1,0),('put',2,7)]
for cap in range(4):
    for seq in itertools.product(ops, repeat=5): check(cap, seq)
rng=random.Random(460)
cases=[]
for _ in range(240):
    cap=rng.randrange(1,9)
    seq=[['get',rng.randrange(12)] if rng.random()<.45 else ['put',rng.randrange(12),rng.choice([0,1,10**9])] for _ in range(120)]
    check(cap,seq); cases.append({'cap':cap,'ops':seq})
# Official example, exact expected return sequence.
c=m.LFUCache(2)
official=[('put',1,1),('put',2,2),('get',1),('put',3,3),('get',2),('get',3),('put',4,4),('get',1),('get',3),('get',4)]
assert [getattr(c,x[0])(*x[1:]) for x in official]==[None,None,1,None,-1,3,None,-1,3,4]
check(1,[('put',100000,10**9),('put',100000,0),('get',100000),('put',0,0)])
# Maximum call count and capacity, checked against oracle every operation.
large=m.LFUCache(10000)
for i in range(10000): large.put(i,i)
for _ in range(190000): assert large.get(0)==0
assert len(large.items)==10000 and large.items[0]==(0,190001)
assert large.min_freq==1 and len(large.buckets)==2
# JS simulation checked separately against timestamp oracle at every completed operation.
js="const fs=require('fs'),c=require(process.argv[1]); const cases=JSON.parse(fs.readFileSync(0,'utf8')); console.log(JSON.stringify(cases.map(p=>c.trace(p))));"
traces=json.loads(subprocess.check_output(['node','-e',js,str(ROOT/'core.js')],input=json.dumps(cases).encode()))
for p,frames in zip(cases,traces):
    o=Oracle(p['cap']); assert len(frames)==len(p['ops'])+1
    for op,f in zip(p['ops'],frames[1:]):
        assert f['result']==o.run(op)
        s=f['after']; assert {x[0]:tuple(x[1:]) for x in s['items']}=={k:v[:2] for k,v in o.d.items()}
        assert {g['f']:g['keys'] for g in s['groups']}==o.state()
        assert s['min']==min(o.state(),default=0)
source=(ROOT/'solution.py').read_text()
assert (ROOT/'python-code.js').read_text()=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Parse dictionary pairs before JS evaluation so duplicate keys cannot be silently overwritten.
import re
copy=(ROOT/'copy.js').read_text(); keys=re.findall(r'(?:^|,)\s*(\w+):\[',copy,re.M)
assert len(keys)==len(set(keys)) and len(keys)>80
report={'status':'pass','python_intermediate_checks':checks,'js_random_intermediate_checks':sum(len(p['ops']) for p in cases),'official_example':True,'max_calls':200000,'max_capacity':10000,'mirror_parity':True,'copy_unique_keys':len(keys),'seed':460}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps(report))
