// Deterministic editorial graph embedding. No prerequisite or physical inference.
export function graphModel(data) {
  const nodes = [...data.nodes].sort((a,b)=>a.id.localeCompare(b.id));
  const ids = new Set(nodes.map(n=>n.id));
  const edges = data.edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
  const adjacency = new Map(nodes.map(n=>[n.id,[]]));
  for(const e of edges) { adjacency.get(e.from).push(e.to); adjacency.get(e.to).push(e.from); }
  for(const [id, neighbors] of adjacency) adjacency.set(id,[...new Set(neighbors)].sort());
  function path(from,to) {
    if(!ids.has(from)||!ids.has(to))return [];
    const queue=[from],prev=new Map([[from,null]]);
    for(let i=0;i<queue.length;i++) {
      const id=queue[i]; if(id===to)break;
      for(const next of adjacency.get(id))if(!prev.has(next)){prev.set(next,id);queue.push(next);}
    }
    if(!prev.has(to))return [];
    const result=[]; for(let id=to;id!==null;id=prev.get(id))result.unshift(id); return result;
  }
  return {nodes,edges,adjacency,path};
}
function hash(s) {let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function layout(data) {
  const model=graphModel(data), nodes=model.nodes;
  const groups=[...new Set(nodes.map(n=>n.group))].sort();
  const anchors=Object.fromEntries(groups.map((g,i)=>{const a=2*Math.PI*i/groups.length;return [g,[38*Math.cos(a),25*Math.sin(a),15*Math.sin(a*2+.4)]];}));
  const positions=nodes.map(n=>{const h=hash(n.id);return anchors[n.group].map((v,k)=>v+(((h>>>(k*8))&255)/255-.5)*22);});
  const pairs=[];
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const hops=model.path(nodes[i].id,nodes[j].id).length-1;
    const d=hops<0?7:Math.min(hops,6);
    pairs.push({i,j,target:11+9*(d-1),weight:hops<0?.009:1/(d*d)});
  }
  // Fixed iteration budget, sorted IDs and no random/runtime physics preserve orientation.
  for(let step=0;step<360;step++){
    const force=nodes.map(()=>[0,0,0]);
    for(const {i,j,target,weight} of pairs){
      const delta=positions[j].map((x,k)=>x-positions[i][k]);
      const len=Math.hypot(...delta)||.001;
      const f=(len-target)*weight*.055;
      for(let k=0;k<3;k++){const v=delta[k]/len*f;force[i][k]+=v;force[j][k]-=v;}
    }
    positions.forEach((p,i)=>p.forEach((v,k)=>p[k]+=Math.max(-1,Math.min(1,force[i][k]+(anchors[nodes[i].group][k]-v)*.012))));
  }
  const center=[0,1,2].map(k=>positions.reduce((s,p)=>s+p[k],0)/(nodes.length||1));
  return new Map(nodes.map((n,i)=>[n.id,positions[i].map((v,k)=>v-center[k])]));
}
