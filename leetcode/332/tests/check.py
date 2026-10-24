"""Independent search oracle; OUTPUT_DIR redirects generated artifacts."""
import html, re, importlib.util, itertools, json, os, pathlib, random, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec=importlib.util.spec_from_file_location('solution', ROOT/'solution.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

def oracle(tickets):
    # Enumerate independent ticket identities and minimize complete airport tuples.
    best=None
    def visit(route, remaining):
        nonlocal best
        if not remaining:
            candidate=tuple(route)
            if best is None or candidate<best: best=candidate
        for i in remaining:
            a,b=tickets[i]
            if a==route[-1]:visit(route+[b],remaining-{i})
    visit(['JFK'],set(range(len(tickets))))
    return list(best) if best else None

edges=[(a,b) for a in ['JFK','AAA','BBB'] for b in ['JFK','AAA','BBB'] if a!=b]
cases=[]
for n in range(1,7):
    for tickets in itertools.combinations_with_replacement(edges,n):
        expected=oracle(tickets)
        if expected:cases.append({'tickets':[list(e) for e in tickets],'expected':expected})
rng=random.Random(332)
for _ in range(150):
    route=['JFK']
    for _ in range(rng.randrange(1,9)):
        route.append(rng.choice([x for x in ['JFK','AAA','BBB','CCC'] if x!=route[-1]]))
    tickets=[list(x) for x in zip(route,route[1:])];rng.shuffle(tickets)
    cases.append({'tickets':tickets,'expected':oracle(tickets)})
examples=[([['MUC','LHR'],['JFK','MUC'],['SFO','SJC'],['LHR','SFO']],['JFK','MUC','LHR','SFO','SJC']),([['JFK','SFO'],['JFK','ATL'],['SFO','ATL'],['ATL','JFK'],['ATL','SFO']],['JFK','ATL','JFK','SFO','ATL','SFO'])]
for tickets,expected in examples:cases.append({'tickets':tickets,'expected':expected})
for tickets,expected in [([['JFK','AAA'],['AAA','JFK']]*150,['JFK','AAA']*150+['JFK']),([['JFK','AAA']]*150+[['AAA','JFK']]*149+[['AAA','BBB']],['JFK','AAA']*150+['BBB'])]:cases.append({'tickets':tickets,'expected':expected})
baseline_source=html.unescape(re.search(r'<pre><code>(.*?)</code></pre>',(ROOT/'index.html').read_text(),re.S).group(1))
namespace={};exec(baseline_source,namespace)
for case in cases:
    if len(case['tickets'])<=8: assert namespace['baseline'](case['tickets'])==case['expected']
    original=json.dumps(case['tickets'])
    assert module.Solution().findItinerary(case['tickets'])==case['expected'],case
    assert json.dumps(case['tickets'])==original
source=(ROOT/'solution.py').read_text()
assert (ROOT/'python-code.js').read_text()=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Same inputs, separately implemented browser simulation; inspect EVERY snapshot.
node=r'''
const fs=require('fs'),assert=require('assert'),{trace}=require(process.argv[1]);
const cases=JSON.parse(fs.readFileSync(0,'utf8'));let snapshots=0;
for(const {tickets,expected} of cases){const frames=trace(tickets);assert.equal(frames.length,2*tickets.length+2);for(let i=0;i<frames.length;i++){const f=frames[i];snapshots++;assert.equal(new Set(f.used).size,f.used.length);assert.equal(f.stack.length+f.finished.length,f.used.length+1);if(!i)continue;const prev=frames[i-1];if(f.kind==='push'){assert.equal(prev.stack.at(-1),f.a);assert.equal(tickets[f.id][0],f.a);assert.equal(tickets[f.id][1],f.b);const choices=tickets.map((e,id)=>({e,id})).filter(x=>!prev.used.includes(x.id)&&x.e[0]===f.a).map(x=>x.e[1]).sort();assert.equal(f.b,choices[0]);assert.deepEqual(f.stack,[...prev.stack,f.b]);assert.deepEqual(f.finished,prev.finished);}else{assert(!tickets.some((e,id)=>e[0]===f.a&&!prev.used.includes(id)));assert.equal(prev.stack.at(-1),f.a);assert.deepEqual(f.stack,prev.stack.slice(0,-1));assert.deepEqual(f.finished,[...prev.finished,f.a]);}}assert.deepEqual([...frames.at(-1).finished].reverse(),expected);assert.equal(frames.at(-1).used.length,tickets.length);}
console.log(JSON.stringify({cases:cases.length,snapshots}));'''
result=subprocess.run(['node','-e',node,str(ROOT/'core.js')],input=json.dumps(cases),text=True,capture_output=True,check=True)
report={'kind':'author computational self-check','coverage':'all valid multisets of 1..6 directed non-self tickets on JFK/AAA/BBB; 150 seeded valid walks; both official examples; two 300-ticket boundaries; independent complete-route oracle; input preservation; every simulation transition and conservation invariant; exact mirror','result':json.loads(result.stdout)}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
