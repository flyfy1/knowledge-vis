import ast, importlib.util, itertools, json, os, random, re
from pathlib import Path
from baseline import baseline
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().parseBoolExpr
# Independent recursive descent oracle: direct grammar, Python Boolean values.
def oracle(s):
    i=0
    def read():
        nonlocal i
        c=s[i];i+=1
        if c in 'tf':return c=='t'
        assert s[i]=='(';i+=1
        vals=[read()]
        while s[i]==',':
            i+=1;vals.append(read())
        assert s[i]==')';i+=1
        return (not vals[0]) if c=='!' else all(vals) if c=='&' else any(vals)
    value=read();assert i==len(s);return value
# Exhaustively enumerate valid grammar strings of length <=10, including unary AND/OR.
by={1:{'t','f'}}
for n in range(2,11):
    out=set()
    for x in by.get(n-3,set()):
        for op in '!&|':out.add(op+'('+x+')')
    def tuples(total,prefix=()):
        if total==0:
            if len(prefix)>=2:yield prefix
            return
        for size in sorted(by):
            cost=size+(1 if prefix else 0)
            if cost<=total:
                for s in by[size]:yield from tuples(total-cost,prefix+(s,))
    for parts in tuples(n-3):
        for op in '&|':out.add(op+'('+','.join(parts)+')')
    by[n]=out
cases={s:oracle(s) for bucket in by.values() for s in bucket}
exhaustive=len(cases)
rng=random.Random(1106)
def tree(depth):
    if depth==0 or rng.random()<.28:
        v=bool(rng.randrange(2));return ('t' if v else 'f'),v
    op=rng.choice('!&|');children=[tree(depth-1) for _ in range(1 if op=='!' else rng.randint(1,4))]
    vals=[v for _,v in children]
    # Truth derived from generated tree before serializing, not stack parser.
    value=(not vals[0]) if op=='!' else False not in vals if op=='&' else True in vals
    return op+'('+','.join(s for s,_ in children)+')',value
for _ in range(1500):
    s,v=tree(5);assert oracle(s)==v;cases[s]=v
fixtures={'&(|(f))':False,'|(f,f,f,t)':True,'!(&(f,t))':True,'&(t,!(t))':False,'|(&(t,f),!(t))':False,'&(t,!(f))':True,'&(f)':False,'|(f)':False}
cases.update(fixtures)
for s,v in cases.items():
    got=solve(s);assert type(got) is bool and got==v,(s,v,got)
    assert baseline(s)==v
# Maximum-length closed-form cases, deliberately avoid recursion in oracle.
large=[('!('*6666+'t'+')'*6666,True),('&('+','.join(['t']*9999)+')',True),('|('+','.join(['f']*9998+['t'])+')',True),('&('+','.join(['t']*9998+['f'])+')',False)]
for s,v in large:
    assert len(s)<=20000 and solve(s)==v and baseline(s)==v
# Duplicate keys caught in authoring source before JSON conversion can hide them.
module=ast.parse((ROOT/'tests/build_copy.py').read_text());keys=[n.args[0].value for n in ast.walk(module) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='add'];assert len(keys)==len(set(keys))
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'))
assert set(keys)==set(copy) and all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',(ROOT/'python-code.js').read_text())[1])==(ROOT/'solution.py').read_bytes().decode()
# Independently expected result fixtures for JS model; maximum snapshots bounded to300 chars.
(OUT/'cases.json').write_text(json.dumps([[s,v] for s,v in cases.items() if len(s)<=300]))
report={'scope':'author self-check, not independent review','passed':True,'exhaustiveMaxLength':10,'exhaustiveCases':exhaustive,'seed':1106,'seededAttempts':1500,'distinctSmallCases':len(cases),'maximumCases':[{'length':len(s),'expected':v} for s,v in large],'copyKeys':len(keys),'baselineSource':True,'exactMirror':True}
(OUT/'logic-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
