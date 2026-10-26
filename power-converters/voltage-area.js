/* Analytic area view over the existing ideal Buck model, SI units throughout. */
(function(root){
 'use strict';
 function buck(m,t){
  if(!m||![m.vin,m.duty,m.vo,m.T,m.L,m.up,m.down,t].every(Number.isFinite)||m.T<=0||m.L<=0||m.duty<=0||m.duty>=1||m.up<=0||m.down>=0||Math.abs(m.vo-m.vin*m.duty)>1e-12||t<0||t>2*m.T)throw new RangeError('Expected bounded ideal Buck model and time0..2T');
  const segments=[];let positive=0,negative=0;
  for(let cycle=0;cycle<2;cycle++)for(const [start,end,voltage]of [[cycle*m.T,(cycle+m.duty)*m.T,m.up],[(cycle+m.duty)*m.T,(cycle+1)*m.T,m.down]]){
   const stop=Math.min(end,t);if(stop<=start)continue;
   const area=voltage*(stop-start);segments.push({start,end:stop,voltage,area});if(area>=0)positive+=area;else negative+=area;
  }
  const net=positive+negative;return{time:t,segments,positive,negative,net,deltaI:net/m.L};
 }
 const api={buck};if(typeof module==='object'&&module.exports)module.exports=api;else root.PowerVoltageArea=api;
})(typeof window==='object'?window:globalThis);
