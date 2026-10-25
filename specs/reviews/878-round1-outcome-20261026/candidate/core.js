'use strict';
(function(root){
 const presets=[{n:4,a:2,b:3},{n:1,a:2,b:3},{n:5,a:4,b:6},{n:6,a:2,b:4},{n:4,a:3,b:3},{n:1000000000,a:40000,b:40000}];
 function gcd(a,b){while(b){const r=a%b;a=b;b=r;}return a;}
 function count(x,a,b){return Math.floor(x/a)+Math.floor(x/b)-Math.floor(x/((a/gcd(a,b))*b));}
 function trace({n,a,b}){
  let lo=1,hi=n*Math.min(a,b);const frames=[{kind:'initial',lo,hi}];
  while(lo<hi){const beforeLo=lo,beforeHi=hi,mid=Math.floor((lo+hi)/2),ca=Math.floor(mid/a),cb=Math.floor(mid/b),both=Math.floor(mid/((a/gcd(a,b))*b)),c=ca+cb-both;
   if(c<n)lo=mid+1;else hi=mid;
   frames.push({kind:c<n?'few':'enough',beforeLo,beforeHi,mid,ca,cb,both,c,lo,hi});
  }
  return frames;
 }
 const api={presets,gcd,count,trace};root.MagicalCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
