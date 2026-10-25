"""Run from any directory. OUTPUT_DIR controls all generated evidence."""
import os, sys, json, random, re, subprocess, pathlib, importlib.util, collections
HERE=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',HERE/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',HERE/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().countOfAtoms

def oracle(s):
    # Independent direction and state: suffix multipliers, not group count maps.
    tokens=re.findall(r'[A-Z][a-z]*|\d+|[()]',s)
    multiplier=1; factors=[]; pending=1; counts=collections.Counter()
    for token in reversed(tokens):
        if token.isdigit(): pending=int(token)
        elif token==')': factors.append(pending);multiplier*=pending;pending=1
        elif token=='(': multiplier//=factors.pop()
        else: counts[token]+=pending*multiplier;pending=1
    assert not factors
    return dict(counts)
def formatted(m):return ''.join(a+(str(m[a]) if m[a]>1 else '') for a in sorted(m))

def expand(s):
    # Separate small-only oracle: actual individual atom list.
    tokens=re.findall(r'[A-Z][a-z]*|\d+|[()]',s);i=0
    def group():
        nonlocal i
        result=[]
        while i<len(tokens) and tokens[i]!=')':
            token=tokens[i];i+=1
            if token=='(':unit=group();assert tokens[i]==')';i+=1
            else:unit=[token]
            count=1
            if i<len(tokens) and tokens[i].isdigit():count=int(tokens[i]);i+=1
            result.extend(unit*count)
        return result
    return dict(collections.Counter(group()))

cases=['H2O','Mg(OH)2','K4(ON(SO3)2)2','He','(H2O)2(OH)3','Be12H2','((H)2O)3H','Na(He2O)3H','H1000000000','H'*1000,'('*499+'H'+')'*499,'Be'+'('*498+'H'+')'*498, 'H2147483647', 'A'+'a'*999]
small=[]
units=['H','He','O2','(H)','(He2O)2']
import itertools
for size in range(1,5):
    small.extend(''.join(x) for x in itertools.product(units,repeat=size))
rng=random.Random(726)
def gen(d=0):
    return ''.join(('('+gen(d+1)+')' if d<3 and rng.random()<.45 else rng.choice(['H','He','Mg','O']))+rng.choice(['','','2','3']) for _ in range(rng.randint(1,3)))
small.extend(gen() for _ in range(500));cases+=small
displayed_baseline=re.search(r'const baseline=`(.*?)`;', (HERE/'app.js').read_text(), re.S).group(1)
ns={};exec(displayed_baseline,ns)
for s in small:
    assert expand(s)==oracle(s),s
    assert ns['expanded_counts'](s)==oracle(s),s
for s in cases:assert solve(s)==formatted(oracle(s)),s
assert [solve(s) for s in cases[:3]]==['H2O','H2MgO2','K4N2O14S4']
# Execute JS model and validate every frame against independently parsed level segments.
runner="const fs=require('fs'),a=require(process.argv[1]);let xs=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(xs.map(s=>a.trace(s))));"
r=subprocess.run(['node','-e',runner,str(HERE/'core.js')],input=json.dumps(cases),text=True,capture_output=True,check=True)
traces=json.loads(r.stdout);events=0
for s,frames in zip(cases,traces):
    for f in frames:
        # Split consumed input at unmatched opens. Completed children stay in their level.
        prefix=s[:f['i']];starts=[0];pieces=[]
        for i,c in enumerate(prefix):
            if c=='(': starts.append(i+1)
            elif c==')': starts.pop()
        # Each frame ends on a complete grammar unit, so each segment is valid by itself.
        for d,start in enumerate(starts):
            end=starts[d+1]-1 if d+1<len(starts) else len(prefix)
            segment=prefix[start:end]
            expected=oracle(segment) if segment else {}
            assert f['stack'][d]==expected,(s,f,expected)
        assert len(f['stack'])==len(starts)
        events+=1
    assert frames[-1]['result']==solve(s)
mirror=(HERE/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps((HERE/'solution.py').read_text())+';\n'
report={'canonicalCases':len(cases),'expandedOracleCases':len(small),'intermediateFrames':events,'seed':726,'maxInputLength':max(map(len,cases)),'result':'pass'}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
