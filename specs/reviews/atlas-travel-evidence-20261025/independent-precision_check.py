from decimal import Decimal as D, localcontext, ROUND_FLOOR
from pathlib import Path
import json, math, random, subprocess
ROOT=Path('/Users/songyy/Documents/Codex/2026-10-25/task-5/reviewer-travel')
rng=random.Random(4104)
profiles=[{'mass':.25,'stiffness':16,'amplitude':.1},{'mass':1,'stiffness':4,'amplitude':.6},{'mass':4,'stiffness':1,'amplitude':1}]
pairs=[(rng.random()*2,rng.random()*2) for _ in range(100)]+[(0,1),(0,2),(.5,0),(.5,.5),(.5,1),(.125,.875)]
for t in [.25,.5,.75,1,1.5,1.75,2]:
    v=[q for q in [math.nextafter(t,-math.inf),t,math.nextafter(t,math.inf)] if 0<=q<=2]
    pairs += [(a,b) for a in v for b in v if a!=b]
for t in [.123456789,.4999999999,1.234567891,1.9999999999]:
    pairs += [(t,t+1e-12),(t+1e-12,t)]
cases=[{'a':a,'b':b,'parameters':prm} for prm in profiles for a,b in pairs]
(ROOT/'precision-inputs.json').write_text(json.dumps(cases))
code="const fs=require('fs'),M=require('/Users/songyy/Documents/knowledge-vis/atlas/motion-model.js');const a=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(a.map(c=>({...c,result:M.interval(c.a,c.b,c.parameters)}))));"
rows=json.loads(subprocess.check_output(['node','-e',code,str(ROOT/'precision-inputs.json')],text=True))
with localcontext() as ctx:
    ctx.prec=110
    a,b,t,p=D(1),D(1)/D(2).sqrt(),D(1)/4,D(1)
    for _ in range(9):
        an=(a+b)/2;b=(a*b).sqrt();t-=p*(a-an)**2;a=an;p*=2
    pi=(a+b)**2/(4*t);tau=2*pi
    def cos(z):
        z-=((z+pi)/tau).to_integral_value(rounding=ROUND_FLOOR)*tau
        v=term=D(1);n=0
        while True:
            n+=1;term*=-(z*z)/(D(2*n-1)*D(2*n));v+=term
            if abs(term)<D('1e-105'):return v
    def pos(c,A):return A*cos(tau*c)
    def path(c,A):
        n=(2*c).to_integral_value(rounding=ROUND_FLOOR);f=c-n/2
        return A*(2*n+1-cos(tau*f))
    errors=[];max_abs=D(0);max_tiny_rel=D(0)
    for row in rows:
        aa,bb=D.from_float(row['a']),D.from_float(row['b']);amp=D.from_float(float(row['parameters']['amplitude']));lo,hi=min(aa,bb),max(aa,bb)
        chronological=pos(hi,amp)-pos(lo,amp);distance=path(hi,amp)-path(lo,amp);integral=pos(bb,amp)-pos(aa,amp)
        positive=(distance+chronological)/2;negative=(chronological-distance)/2
        ref={'integral':integral,'distance':distance,'positive':positive,'negative':negative,'chronologicalDisplacement':chronological}
        tiny=0<hi-lo<D('1e-10')
        for key,expected in ref.items():
            actual=D.from_float(float(row['result'][key]));err=abs(actual-expected);max_abs=max(max_abs,err)
            if tiny and abs(expected)>D('1e-90'):
                relative=err/abs(expected);max_tiny_rel=max(max_tiny_rel,relative)
                if relative>D('2e-12'):errors.append({'a':row['a'],'b':row['b'],'field':key,'expected':str(expected),'actual':str(actual),'relative':str(relative)})
            elif err>D('2e-13'):errors.append({'a':row['a'],'b':row['b'],'field':key,'absolute':str(err)})
        s=row['result'];assert s['positive']>=0 and s['negative']<=0 and s['distance']>=0
    report={'cases':len(rows),'reference':'110-digit Decimal cosine plus independently derived cumulative total variation; float inputs converted exactly','maxAbsoluteError':str(max_abs),'maxTinyRelativeError':str(max_tiny_rel),'failures':errors,'pass':not errors}
    (ROOT/'precision-report.json').write_text(json.dumps(report,indent=2));(ROOT/'precision-results.json').write_text(json.dumps(rows));print(json.dumps({k:v for k,v in report.items() if k!='failures'}));print(json.dumps(errors[:8]));assert not errors
