'use strict';
(function(root){
  function trace(n) {
    if (!Number.isInteger(n) || n<1 || n>4) throw new RangeError('Teaching input: 1 <= n <= 4');
    const placement=[],cols=new Set(),down=new Set(),up=new Set(),solutions=[],frames=[];
    const snapshot=(kind,r=null,c=null,conflicts=[])=>frames.push({kind,r,c,conflicts:[...conflicts],placement:[...placement],cols:[...cols].sort((a,b)=>a-b),down:[...down].sort((a,b)=>a-b),up:[...up].sort((a,b)=>a-b),solutions:solutions.map(b=>[...b])});
    snapshot('start');
    function search(r){
      if(r===n){solutions.push(placement.map(c=>'.'.repeat(c)+'Q'+'.'.repeat(n-c-1)));snapshot('solution',r);return;}
      for(let c=0;c<n;c++){
        const conflicts=[];
        if(cols.has(c))conflicts.push('cols');if(down.has(r-c))conflicts.push('down');if(up.has(r+c))conflicts.push('up');
        if(conflicts.length){snapshot('reject',r,c,conflicts);continue;}
        placement.push(c);cols.add(c);down.add(r-c);up.add(r+c);snapshot('place',r,c);
        search(r+1);
        placement.pop();cols.delete(c);down.delete(r-c);up.delete(r+c);snapshot('undo',r,c);
      }
    }
    search(0);snapshot('end');return {n,frames,solutions};
  }
  const api={trace}; if(typeof module!=='undefined')module.exports=api;root.Queens51=api;
})(typeof window==='undefined'?globalThis:window);
