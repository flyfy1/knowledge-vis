'use strict';
(function(root){
const presets=[['abc','bca'],['ab','ba'],['aabbcc','abcabc'],['aa','aa'],['abcdef','fabcde'],['aabc','abca'],['aaccbbdd','aabbccdd']];
function trace([start,target]){
 let front=[start],seen=new Set(front),depth=0,history=[],frames=[];
 frames.push({front:[...front],depth,seen:seen.size,events:[],history:[],result:start===target?0:null});
 while(!front.includes(target)){
  let next=[],events=[];
  for(const state of front){
   let i=0;while(state[i]===target[i])i++;
   let candidates=[];
   for(let j=i+1;j<state.length;j++)if(state[j]===target[i]&&state[j]!==target[j])candidates.push(j);
   const children=candidates.map(j=>{const a=[...state];[a[i],a[j]]=[a[j],a[i]];const child=a.join(''),fresh=!seen.has(child);if(fresh){seen.add(child);next.push(child);}return {j,child,fresh};});
   events.push({state,i,want:target[i],candidates,children});
  }
  history.push({depth,front:[...front]});depth++;front=next;
  frames.push(JSON.parse(JSON.stringify({front,depth,seen:seen.size,events,history,result:front.includes(target)?depth:null})));
 }
 return frames;
}
const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.SimilarCore=api;
})(globalThis);
