from decimal import Decimal as D,localcontext,ROUND_FLOOR
from pathlib import Path
import json,math,random,subprocess
root=Path('reviewer-work');rng=random.Random(7021)
pairs=[(rng.random()*2,rng.random()*2) for _ in range(120)]+[(0,.25),(.25,.5),(0,.5),(0,1),(0,2),(.25,0),(.5,.5),(.125,.875),(.1,.4),(.4,.1),(.2,.3),(.3,.2)]
for t in [0,.125,.25,.5,.75,1,1.5,1.75,2]:
 vs=[v for v in [math.nextafter(t,-math.inf),t,math.nextafter(t,math.inf)] if 0<=v<=2]
 pairs.extend((a,b) for a in vs for b in vs if a!=b)
profiles=[{'mass':.25,'stiffness':16,'amplitude':.1},{'mass':1,'stiffness':4,'amplitude':.6},{'mass':4,'stiffness':1,'amplitude':1}]
cases=[{'a':a,'b':b,'parameters':p} for p in profiles for a,b in pairs]
(root/'precision-inputs.json').write_text(json.dumps(cases))
code="const fs=require('fs'),M=require('/Users/songyy/Documents/knowledge-vis/atlas/motion-model.js');let a=JSON.parse(fs.readFileSync(process.argv[1]));process.stdout.write(JSON.stringify(a.map(c=>({...c,result:M.workInterval(c.a,c.b,c.parameters)}))));"
rows=json.loads(subprocess.check_output(['node','-e',code,str(root/'precision-inputs.json')],text=True))
with localcontext() as ctx:
 ctx.prec=110;a,b,t,p=D(1),D(1)/D(2).sqrt(),D(1)/4,D(1)
 for _ in range(9):an=(a+b)/2;b=(a*b).sqrt();t-=p*(a-an)**2;a=an;p*=2
 pi=(a+b)**2/(4*t);tau=2*pi
 def cos(z):
  z-=((z+pi)/tau).to_integral_value(rounding=ROUND_FLOOR)*tau;v=term=D(1);n=0
  while True:
   n+=1;term*=-(z*z)/(D(2*n-1)*D(2*n));v+=term
   if abs(term)<D('1e-105'):return v
 fail=[];maxabs=D(0);maxrel=D(0);masked=[]
 for row in rows:
  aa,bb=D.from_float(row['a']),D.from_float(row['b']);k=D.from_float(float(row['parameters']['stiffness']));A=D.from_float(float(row['parameters']['amplitude']));E=k*A*A/2
  U=lambda c:E*cos(tau*c)**2
  lo,hi=min(aa,bb),max(aa,bb);cuts=[lo];c=((lo*4).to_integral_value(rounding=ROUND_FLOOR)+1)/4
  while c<hi:cuts.append(c);c+=D(1)/4
  cuts.append(hi);legs=[U(u)-U(v) for u,v in zip(cuts,cuts[1:])];P=sum((w for w in legs if w>0),D(0));N=sum((w for w in legs if w<0),D(0))
  ref={'work':U(aa)-U(bb),'positive':P,'negative':N,'chronologicalWork':U(lo)-U(hi)}
  for key,expected in ref.items():
   actual=D.from_float(float(row['result'][key]));err=abs(actual-expected);maxabs=max(maxabs,err)
   if err>D('3e-13'):fail.append({'a':row['a'],'b':row['b'],'key':key,'error':str(err)})
   if 0<hi-lo<D('1e-10') and abs(expected)>D('1e-90'):
    rel=err/abs(expected);maxrel=max(maxrel,rel)
    if rel>D('2e-12'):fail.append({'a':row['a'],'b':row['b'],'key':key,'relative':str(rel),'actual':str(actual),'expected':str(expected)})
   if actual==0 and D('1e-90')<abs(expected)<D('1e-12'):masked.append({'a':row['a'],'b':row['b'],'key':key,'expected':str(expected)})
 report={'pass':not fail,'cases':len(rows),'reference':'110-digit Decimal endpoint elastic-energy differences and independently partitioned positive/negative exchanges; exact float inputs','maxAbsoluteError':str(maxabs),'maxAdjacentOrTinySpanRelativeError':str(maxrel),'failures':fail,'nearSymmetryBelowRoundoffZeros':masked}
 (root/'precision-report.json').write_text(json.dumps(report,indent=2));(root/'precision-results.json').write_text(json.dumps(rows));print(json.dumps({k:v for k,v in report.items() if k not in ['failures','nearSymmetryBelowRoundoffZeros']}));print('failures',fail[:5]);print('near-symmetry masked count',len(masked));assert not fail
