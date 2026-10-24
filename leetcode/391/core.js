'use strict';
(function(root){
 const presets=[
 [[0,0,1,2],[1,0,2,1],[1,1,2,2]],
 [[0,0,1,2],[0,0,1,2],[2,0,3,2]],
 [[0,0,1,1],[0,0,1,1],[0,0,1,1]],
 [[1,1,2,3],[1,3,2,4],[3,1,4,2],[3,2,4,4]],
 [[-2,-1,0,1]],
 [[1,1,3,3],[3,1,4,2],[3,2,4,4],[1,3,2,4],[2,3,3,4]]
 ];
 const points=r=>[[r[0],r[1]],[r[0],r[3]],[r[2],r[1]],[r[2],r[3]]];
 const key=p=>p.join(',');
 function bounds(rs){return rs.length?[Math.min(...rs.map(r=>r[0])),Math.min(...rs.map(r=>r[1])),Math.max(...rs.map(r=>r[2])),Math.max(...rs.map(r=>r[3]))]:null;}
 function trace(rs){
  let area=0;const odd=new Set(),frames=[{k:0,area:0,odd:[],before:[],toggles:[],box:null,boxArea:0,areaOK:false,cornerOK:false,result:false}];
  rs.forEach((r,i)=>{
   const before=[...odd].sort(),toggles=points(r).map(p=>{const s=key(p),remove=odd.has(s);if(remove)odd.delete(s);else odd.add(s);return {point:s,remove};});
   area+=(r[2]-r[0])*(r[3]-r[1]);const box=bounds(rs.slice(0,i+1)),boxArea=(box[2]-box[0])*(box[3]-box[1]);
   const expected=points(box).map(key).sort(),sorted=[...odd].sort(),areaOK=area===boxArea,cornerOK=JSON.stringify(sorted)===JSON.stringify(expected);
   frames.push({k:i+1,area,odd:sorted,before,toggles,box,boxArea,areaOK,cornerOK,result:areaOK&&cornerOK});
  });return frames;
 }
 function cells(rs,box){const out=[];for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++)out.push({x,y,count:rs.filter(r=>r[0]<=x&&x<r[2]&&r[1]<=y&&y<r[3]).length});return out;}
 const api={presets,points,bounds,trace,cells};root.RectangleLesson=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
