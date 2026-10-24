"""Run from repo root: python3 -B leetcode/224/tests/test_solution.py."""
import ast, importlib.util, itertools, json, os, random, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
def load(path):
    spec=importlib.util.spec_from_file_location(path.stem,path); mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
solution=load(ROOT/'solution.py').Solution().calculate
baseline=load(ROOT/'tests/baseline.py').baseline
def oracle(s):
    def visit(n):
        if isinstance(n,ast.Constant):return n.value
        if isinstance(n,ast.UnaryOp) and isinstance(n.op,ast.USub):return -visit(n.operand)
        if isinstance(n,ast.BinOp):
            a,b=visit(n.left),visit(n.right)
            return a+b if isinstance(n.op,ast.Add) else a-b
        raise AssertionError(ast.dump(n))
    return visit(ast.parse(s.strip(),mode='eval').body)
rng=random.Random(224)
def expr(depth):
    if not depth or rng.random()<.25:return str(rng.randrange(30))
    if rng.random()<.25:return '-('+expr(depth-1)+')'
    return '(('+expr(depth-1)+')'+rng.choice([' + ',' - '])+'('+expr(depth-1)+'))'
cases=['1 + 1',' 2-1 + 2 ','(1+(4+5+2)-3)+(6+8)','8-(3-1)','-(2+3)','1-(-2)','0','2147483647','-2147483648','5-(-(2-6))']
# Exhaustive binary trees with three leaves, both grouping shapes and unary group variants.
for a,b,c in itertools.product(range(4),repeat=3):
    for x,y in itertools.product('+-',repeat=2):
        for s in [f'({a}{x}{b}){y}{c}',f'{a}{x}({b}{y}{c})']:
            cases.extend([s,'-('+s+')'])
cases += [expr(5) for _ in range(2000)]
for s in cases:
    expected=oracle(s);assert solution(s)==expected,(s,expected);assert baseline(s)==expected,(s,expected)
# Maximal length, no recursive evaluator at these depths.
large=[('('*149999+'0'+')'*149999,0),('1+'*149999+'1 ',150000),(' '*299999+'0',0)]
for s,want in large:assert len(s)<=300000 and solution(s)==want
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Validate browser model on same independently evaluated inputs and return all frames.
script="const c=require(process.argv[1]);let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(s).map(x=>c.trace(x)))));"
runs=json.loads(subprocess.check_output(['node','-e',script,str(ROOT/'core.js')],input=json.dumps(cases).encode()))
checks=0
for s,run in zip(cases,runs):
    assert run['result']==oracle(s)
    for f in run['frames']:
        if f['kind']=='start':continue
        # Independently reconstruct currently open groups from consumed text.
        text=s[:f['end']+1]; opens=[]
        for i,c in enumerate(text):
            if c=='(':opens.append(i)
            elif c==')':opens.pop()
        def subtotal(fragment):
            fragment=fragment.strip()
            if fragment.endswith(('+','-')):fragment=fragment[:-1].strip()
            return oracle(fragment) if fragment else 0
        start=opens[-1]+1 if opens else 0
        assert f['total']==subtotal(text[start:]),(s,f,text[start:])
        assert len(f['stack'])==len(opens)
        for depth,pos in enumerate(opens):
            a=opens[depth-1]+1 if depth else 0
            fragment=text[a:pos].strip()
            sign=-1 if fragment.endswith('-') else 1
            assert f['stack'][depth]==[subtotal(fragment),sign],(s,f,fragment)
        checks+=1
report={'cases':len(cases),'large_cases':len(large),'intermediate_frame_checks':checks,'source_mirror':'exact','status':'pass','oracle':'independent Python AST evaluator; recursive substring baseline; closed-form max-length cases'}
(OUT/'algorithm-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
