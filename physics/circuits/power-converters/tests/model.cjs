'use strict';
const assert=require('node:assert/strict'),{pulse,converter}=require('../model.js');
let checks=0;function near(a,b,tol=1e-9){assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);checks++;}
near(pulse('inductor',0,2).value,.1);near(pulse('capacitor',0,.02).value,.1);
near(pulse('inductor',.2,0).value,.2);near(pulse('capacitor',.2,0).value,.2);
near(pulse('inductor',0,-2).value,-.1);near(pulse('capacitor',0,-.02).value,-.1);
near(pulse('inductor',.1,-2).deltaEnergy,-50e-6);near(pulse('capacitor',.1,-.02).deltaEnergy,-.5e-6);
near(converter('buck',12,.5).vo,6);near(converter('buck',12,.5).iin,.5);
near(converter('boost',12,.5).vo,24);near(converter('boost',12,.5).iin,2);
for(const kind of ['buck','boost'])for(let vin=5;vin<=12;vin++)for(let percent=20;percent<=75;percent+=5){
 const d=percent/100,m=converter(kind,vin,d);
 near(m.up*d+m.down*(1-d),0);near(m.iin*vin,m.vo*m.io);
 near(m.sample(0).il,m.sample(m.T).il);near(m.sample(0).il,m.sample(2*m.T).il);
 // Independent midpoint quadrature is exact for each piecewise-linear phase.
 const on=m.sample(d*m.T/2),off=m.sample((1+d)*m.T/2);
 near(on.ic*d+off.ic*(1-d),0);near(on.il*d+off.il*(1-d),m.avg);
 near(m.timeAt(1),d*m.T/2);near(m.timeAt(2),d*m.T);near(m.timeAt(3),(1+d)*m.T/2);near(m.timeAt(8),2*m.T);
 assert.equal(m.sample(d*m.T).on,false);assert.equal(m.sample(m.T).on,true);
 for(let k=0;k<=8;k++){const q=m.sample(m.timeAt(k));assert.ok(q.il>0);near(q.energy,.5*.001*q.il*q.il);}
}
assert.throws(()=>converter('boost',12,.99));console.log(JSON.stringify({checks,domainCases:192,status:'pass'}));
