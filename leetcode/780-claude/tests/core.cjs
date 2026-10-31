// Author self-check: browser core trace vs one-subtraction-at-a-time oracle.
const C=require('../core.js');let n=0;
for(let sx=1;sx<=10;sx++)for(let sy=1;sy<=10;sy++)for(let tx=1;tx<=40;tx++)for(let ty=1;ty<=40;ty++){
 const f=C.trace(sx,sy,tx,ty),last=f[f.length-1];
 if(last.result!==C.slow(sx,sy,tx,ty))throw new Error('mismatch '+[sx,sy,tx,ty]);
 if(last.result){let x=tx,y=ty,s=0;while(x!==sx||y!==sy){if(x>y)x-=y;else y-=x;s++;}if(s!==last.subs)throw new Error('subs '+[sx,sy,tx,ty]);}
 f.slice(1).forEach((fr,i)=>{if(fr.history.length!==i+2)throw new Error('history');});n++;}
for(const p of [...C.presets,C.prediction]){const f=C.trace(...p);console.log(p.join(','),'→',f[f.length-1].result,'frames',f.length,'subs',f[f.length-1].subs);}
const ch=C.chain([6,9]).map(c=>c.point.join(','));if(ch.join(' ')!=='6,9 6,3 3,3')throw new Error(ch);
console.log('PASS',n,'cases');
