(function(root){
 const presets=[['acb',2,'ab',1],['ab',4,'aba',1],['acb',4,'ab',2],['ab',1000000,'aba',2],['abc',5,'d',1],['a',3,'a',2],['acb',1,'acb',1]];
 function trace(s1,n1,s2,n2){
  let j=0,count=0,block=0,jumped=false;const seen=new Map([[0,[0,0]]]),frames=[];
  const save=(kind,extra={})=>frames.push({kind,j,count,block,...extra});save('start');
  while(block<n1){
   for(let pos=0;pos<s1.length;pos++){
    const before=j,oldCount=count,ch=s1[pos],match=ch===s2[j];
    if(match){j++;if(j===s2.length){j=0;count++;}}
    save('char',{pos,ch,before,oldCount,match});
   }
   block++;save('boundary');
   if(!jumped){
    if(seen.has(j)){
     const [oldBlock,oldCount]=seen.get(j),L=block-oldBlock,G=count-oldCount,q=Math.floor((n1-block)/L),from=block,fromCount=count;
     block+=q*L;count+=q*G;jumped=true;
     save('jump',{oldBlock,oldCount,L,G,q,from,fromCount});
    }else seen.set(j,[block,count]);
   }
  }
  save('done',{answer:Math.floor(count/n2)});return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.RepetitionCore=api;
})(typeof window==='undefined'?globalThis:window);
