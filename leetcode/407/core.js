'use strict';
(function(root){
  const presets = [
    [[3,3,3],[3,1,3],[3,3,3]],
    [[5,5,5,5,5],[5,1,1,5,5],[5,5,1,1,2],[5,5,5,5,5],[5,5,5,5,5]],
    [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]],
    [[3,3,3,3,3],[3,2,2,2,3],[3,2,1,2,3],[3,2,2,2,3],[3,3,3,3,3]],
    [[5,0,5,0,5]],
    [[0,0,0],[0,0,0],[0,0,0]]
  ];
  const cmp=(a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2];
  function trace(input){
    const h=input.map(row=>row.slice()),m=h.length,n=h[0].length;
    if(m>5||n>6)throw new Error('Teaching trace limit: 5 rows, 6 columns');
    const heap=[],levels=h.map(row=>row.map(()=>null)),popped=h.map(row=>row.map(()=>false)),frames=[];
    let water=0;
    function push(x){heap.push(x);let i=heap.length-1;while(i){let p=(i-1)>>1;if(cmp(heap[p],x)<=0)break;heap[i]=heap[p];i=p;}heap[i]=x;}
    function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let c=2*i+1;if(c+1<heap.length&&cmp(heap[c+1],heap[c])<0)c++;if(cmp(last,heap[c])<=0)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;}
    function save(event){frames.push({levels:levels.map(x=>x.slice()),popped:popped.map(x=>x.slice()),heap:heap.map(x=>x.slice()).sort(cmp),water,event});}
    for(let r=0;r<m;r++)for(let c=0;c<n;c++)if(r===0||r===m-1||c===0||c===n-1){levels[r][c]=h[r][c];push([h[r][c],r,c]);}
    save(null);
    while(heap.length){
      const [level,r,c]=pop(),added=[];popped[r][c]=true;
      for(const [dr,dc] of [[-1,0],[0,-1],[0,1],[1,0]]){
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<m&&nc>=0&&nc<n&&levels[nr][nc]===null){
          const ground=h[nr][nc],next=Math.max(level,ground),depth=next-ground;
          levels[nr][nc]=next;water+=depth;push([next,nr,nc]);added.push({r:nr,c:nc,ground,level:next,depth});
        }
      }
      save({r,c,level,added});
    }
    return {h,frames,result:water};
  }
  const api={presets,trace};root.RainCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
