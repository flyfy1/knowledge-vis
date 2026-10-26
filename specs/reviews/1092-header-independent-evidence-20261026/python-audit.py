import itertools, json, runpy, subprocess, hashlib
from pathlib import Path
out=Path(__file__).parent;root=out.parents[2]
solve=runpy.run_path(str(root/'leetcode/1092/solution.py'))['Solution']().shortestCommonSupersequence

def sub(a,s):
    i=0
    for c in s:
        if i<len(a) and c==a[i]:i+=1
    return i==len(a)

def enum_oracle(a,b):
    for n in range(max(len(a),len(b)),len(a)+len(b)+1):
        for chars in itertools.product(sorted(set(a+b)),repeat=n):
            s=''.join(chars)
            if sub(a,s) and sub(b,s):return n

fresh=[]
for a,b,pred in [('aa','ab',3),('ba','ab',3),('aaa','a',3),('abc','def',6),('','ab',2),('','',0)]:
    s=solve(a,b);assert len(s)==pred and sub(a,s) and sub(b,s)
    fresh.append({'a':a,'b':b,'prediction':pred,'actual':s,'length':len(s)})
strings=[''.join(t) for n in range(1,4) for t in itertools.product('ab',repeat=n)]
count=0
for a in strings:
    for b in strings:
        aa,bb=a,b;s=solve(a,b);assert len(s)==enum_oracle(a,b) and sub(a,s) and sub(b,s);assert (a,b)==(aa,bb);count+=1
large=[]
for a,b,n in [('a'*1000,'a'*1000,1000),('a'*1000,'b'*1000,2000)]:
    s=solve(a,b);assert len(s)==n and sub(a,s) and sub(b,s);large.append({'m':len(a),'n':len(b),'actualLength':len(s),'expectedLength':n})
source=(root/'leetcode/1092/solution.py').read_text();assert (root/'leetcode/1092/python-code.js').read_text()=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
base='093440bf6df89b6a5dbc7a958ae3aef588b9acff';unchanged=[]
for name in ['app.js','copy.js','core.js','python-code.js','solution.py','lesson-entry.json']:
    now=(root/'leetcode/1092'/name).read_bytes();old=subprocess.check_output(['git','show',base+':leetcode/1092/'+name],cwd=root);assert now==old;unchanged.append(name)
preflight=subprocess.run(['python3','-B','scripts/register_leetcode_lesson.py','1092','--validate-only'],cwd=root,capture_output=True,text=True);assert preflight.returncode==0
# Measured authored palette pairs, including muted/disabled, current, and focus adjacent surface.
def luminance(h):
    v=[int(h[i:i+2],16)/255 for i in (1,3,5)];v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v];return sum(x*w for x,w in zip(v,[.2126,.7152,.0722]))
contrast=[]
for fg,bg in [('#e8edf4','#1c2330'),('#9aa7b8','#161b22'),('#9aa7b8','#0d1117'),('#ffb454','#1c2330'),('#6ee7ff','#0d1117'),('#c9d4e2','#0a0e14')]:
    a,b=sorted([luminance(fg),luminance(bg)]);ratio=(b+.05)/(a+.05);assert ratio>=4.5;contrast.append({'foreground':fg,'background':bg,'ratio':round(ratio,2)})
report={'freshCases':fresh,'exhaustiveBinaryPairs':count,'maxSizeCases':large,'mirrorExact':True,'unchangedFromBase':{'base':base,'files':unchanged},'metadataPreflight':{'exit':preflight.returncode,'stdout':preflight.stdout,'stderr':preflight.stderr},'contrast':contrast,'cssBytes':sum((root/p).stat().st_size for p in ['leetcode/style.css','leetcode/1092/style.css'])}
(out/'python-audit.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
