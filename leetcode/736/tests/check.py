import importlib.util, json, os, random, subprocess, pathlib, hashlib, ast
from oracle import baseline
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', str(ROOT/'tests/evidence')))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution',ROOT/'solution.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
solve = m.Solution().evaluate
rng = random.Random(736)
def gen(depth, names):
    if depth == 0 or rng.random() < .3:
        return rng.choice(names) if names and rng.random()<.5 else str(rng.randint(-4,4))
    op=rng.choice(['add','mult','let'])
    if op!='let': return f'({op} {gen(depth-1,names)} {gen(depth-1,names)})'
    parts=[]; names=names.copy()
    for _ in range(rng.randint(1,3)):
        name=rng.choice(['x','y','a1','longname2']); rhs=gen(depth-1,names)
        parts += [name,rhs]
        if name not in names:names.append(name)
    return '(let '+' '.join(parts)+' '+gen(depth-1,names)+')'
cases=[('(let x 2 (mult x (let x 3 y 4 (add x y))))',14),('(let x 3 x 2 x)',2),('(let x 1 y 2 x (add x y) (add x y))',5),('(let x 2 (add (let x 5 x) x))',7),('(let x 4 (add (let x (add x 1) x) x))',9),('-2147483648',-2147483648),('2147483647',2147483647)]
for a in range(-3,4):
 for b in range(-3,4):
  for c in range(-3,4):
   cases.extend([(f'(add {a} (mult {b} {c}))',a+b*c),(f'(let x {a} (add (let x {b} x) x))',a+b),(f'(let x {a} x (add x {b}) (mult x {c}))',(a+b)*c)])
for _ in range(1000):
 s=gen(4,[])
 if len(s)<=2000:
  v=baseline(s)
  if -(2**31)<=v<2**31:cases.append((s,v))
s='1'
while len('(let x 1 '+s+')')<=2000:s='(let x 1 '+s+')'
cases.append((s,1))
# Many sequential bindings in one let.
s='(let x '+ ' '.join(['1 x']*497)+' 1 x)' # many repeated assignments
if len(s)<=2000:cases.append((s,1))
# Exactly 2000 characters using one long legal assignment target.
name='a'*1990;s='(let '+name+' 1 0)';assert len(s)==2000;cases.append((s,0))
for s,v in cases:assert solve(s)==v==baseline(s),(s,v,solve(s))
js="require(process.argv[1]);let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(x=>Lisp.trace(x)))));"
r=subprocess.run(['node','-e',js,str(ROOT/'core.js')],input=json.dumps([s for s,v in cases]),capture_output=True,text=True,check=True)
traces=json.loads(r.stdout)
for (s,v),tr in zip(cases,traces):
 assert tr['value']==v
 saved=[];env={};last_i=0
 for f in tr['frames']:
  assert last_i<=f['i']<=len(tr['tokens']);last_i=f['i']
  if f['kind']=='enter' and f['op']=='let':saved.append(json.loads(json.dumps(env)))
  if f['kind']=='bind':env.setdefault(f['name'],[]).append(f['value'])
  if f['kind']=='leave':env=saved.pop()
  if f['kind']=='lookup':assert env[f['token']][-1]==f['value']
  if f['kind']=='combine':assert f['value']==(f['left']+f['right'] if f['op']=='add' else f['left']*f['right'])
  assert f['env']==env
 assert tr['frames'][-1]['i']==len(tr['tokens']) and env=={} and not saved
# Catch duplicate dictionary keys in copy.js before JavaScript overwrites them.
copy=(ROOT/'copy.js').read_text();import re
keys=re.findall(r'(?:^|[,\n])\s*(\w+)\s*:\s*\[',copy)
assert len(keys)==len(set(keys)) and len(keys)>70
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').rstrip(';\n'))==source
result={'kind':'author self-check','cases':len(cases),'traceFrames':sum(len(t['frames']) for t in traces),'seed':736,'maxLength':max(len(s) for s,v in cases),'checks':['independent AST/copy oracle','exhaustive small arithmetic/scoping','seeded valid grammar','binding restoration at every trace frame','cursor monotonicity','source mirror parity','copy keys unique']}
(OUT/'numerical.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
