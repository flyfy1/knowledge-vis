'use strict';
(function(root){
const presets=[{a:[1,3,1],k:2},{a:[1,3,1],k:1},{a:[1,1,1],k:2},{a:[1,6,1],k:3},{a:[0,1000000],k:1},{a:[1,2,4],k:3},{a:[1,1,3,6],k:6}];
function scan(nums,d){const a=[...nums].sort((x,y)=>x-y),rows=[];let l=0,total=0;for(let r=0;r<a.length;r++){const old=l;while(a[r]-a[l]>d)l++;total+=r-l;rows.push({r,l,old,add:r-l,total});}return {a,rows,total};}
function trace(nums,k){const a=[...nums].sort((x,y)=>x-y);let lo=0,hi=a.at(-1)-a[0];const f=[{lo,hi,test:null}];while(lo<hi){const before=[lo,hi],mid=Math.floor((lo+hi)/2),s=scan(a,mid),enough=s.total>=k;if(enough)hi=mid;else lo=mid+1;f.push({lo,hi,test:{before,mid,count:s.total,enough,rows:s.rows}});}return f;}
const api={presets,scan,trace};if(typeof module!=='undefined')module.exports=api;else root.PairCore=api;
})(typeof window==='undefined'?globalThis:window);
