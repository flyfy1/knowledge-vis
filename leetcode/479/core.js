'use strict';
(function(root){
function mirror(prefix,length){const s=String(prefix),tail=length%2?s.slice(0,-1):s;return Number(s+[...tail].reverse().join(''));}
function probe(p,lo,hi){const rows=[];for(let x=hi;x>=lo&&x*x>=p;x--){const q=Math.floor(p/x),r=p%x;const ok=r===0&&q>=lo;rows.push({p,x,q,r,square:x*x,kind:ok?'found':'test'});if(ok)return rows;}const x=rows.length?rows.at(-1).x-1:hi;rows.push({p,x,square:x*x,kind:'cutoff'});return rows;}
function search2(){let rows=[];for(let prefix=99;prefix>=10;prefix--){const p=mirror(prefix,4);if(p>9801)continue;const checks=probe(p,10,99);rows.push(...checks);if(checks.at(-1).kind==='found')break;}return rows;}
const presets=[()=>search2(),()=>probe(9779,10,99),()=>probe(9009,10,99)];
function trace(preset){return [{kind:'start'},...presets[preset]()];}
const api={mirror,probe,trace};if(typeof module!=='undefined')module.exports=api;root.PalindromeCore=api;
})(typeof window!=='undefined'?window:globalThis);
