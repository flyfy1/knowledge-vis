'use strict';
const assert=require('assert/strict'),fs=require('fs');const TAU=2*Math.PI;
function norm(t){t%=TAU;return t<0?t+TAU:t;}
// Design proof only; runtime implementation may use an equivalent stricter representation.
function stepAngle(theta,deltaDeg){const th=norm(theta),ticks=Math.round(th*180/Math.PI*10);if(th===(ticks/10)*Math.PI/180){const nt=((ticks+Math.round(deltaDeg*10))%3600+3600)%3600;return(nt/10)*Math.PI/180;}return norm(th+deltaDeg*Math.PI/180);}
const cases=[];for(const [step,count,target]of [[.1,900,Math.PI/2],[1,90,Math.PI/2],[10,9,Math.PI/2],[-.1,900,3*Math.PI/2]]){let th=0;for(let i=0;i<count;i++)th=stepAngle(th,step);assert.equal(th,target);cases.push({step,count,exactTarget:true,result:th});}
for(const th of [79.97*Math.PI/180,Math.PI/2-1e-13,Math.PI/2+1e-13,.987654321])for(const step of [.1,1,10,-.1]){const got=stepAngle(th,step);assert.equal(got,norm(th+step*Math.PI/180));}
const out={pass:true,cases,offGridCases:16,method:'Pure design prototype only,not an executed app or prescribed replacement implementation; strict recognition avoids a proximity snap.'};fs.writeFileSync('tangent-audit/independent/keyboard-design-check.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
