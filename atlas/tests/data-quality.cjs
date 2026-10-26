'use strict';
// foundation/representation/application/connection are explanatory relations.
// No prerequisite is inferred from their type or from a suggested route order.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
function load(){const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'atlas/data.js'),'utf8'),c);return JSON.parse(JSON.stringify(c.window.ATLAS));}
function references(d){const refs=[];function walk(x,at){if(!x||typeof x!=='object')return;for(const[k,v]of Object.entries(x)){const p=at+'.'+k;if(['source','backgroundSource','href'].includes(k)&&typeof v==='string')refs.push({at:p,href:v});else walk(v,p);}}walk(d,'atlas');return refs;}
function validate(d,{checkFiles=true}={}){
 const errors=[],cycles=[];const fail=m=>errors.push(m),nonempty=x=>typeof x==='string'&&x.trim().length>0;
 if(!d||typeof d!=='object')return{errors:['atlas object missing'],cycles,prerequisiteEdges:0,references:[]};
 for(const key of ['groups','nodes','edges','trails'])if(!Array.isArray(d[key]))fail(key+': array missing');
 if(!d.types||typeof d.types!=='object'||Array.isArray(d.types))fail('types: object missing');
 if(errors.length)return{errors,cycles,prerequisiteEdges:0,references:[]};
 for(const key of ['groups','nodes','edges','trails'])if(d[key].some(x=>!x||typeof x!=='object'||Array.isArray(x)))fail(key+': object record required');
 if(errors.length)return{errors,cycles,prerequisiteEdges:0,references:[]};
 function bi(x,at){if(!x||typeof x!=='object')return; if('zh'in x||'en'in x){if(!nonempty(x.zh)||!nonempty(x.en))fail(at+': bilingual text missing');}for(const[k,v]of Object.entries(x))if(v&&typeof v==='object')bi(v,at+'.'+k);}bi(d,'atlas');
 function ids(xs,kind){if(!Array.isArray(xs)){fail(kind+': array missing');return new Set();}const seen=new Set();for(const x of xs){if(!nonempty(x.id))fail(kind+': ID missing');else if(seen.has(x.id))fail(kind+': duplicate ID '+x.id);seen.add(x.id);}return seen;}
 const groups=ids(d.groups,'groups'),nodes=ids(d.nodes,'nodes');ids(d.edges,'edges');ids(d.trails,'trails');
 function bilingual(x,at){if(!x||!nonempty(x.zh)||!nonempty(x.en))fail(at+': bilingual text missing');}
 for(const g of d.groups||[])bilingual(g.label,'group '+g.id);
 for(const[k,v]of Object.entries(d.types||{}))bilingual(v,'type '+k);
 for(const n of d.nodes||[]){if(!groups.has(n.group))fail('node '+n.id+': invalid group');bilingual(n.title,'node '+n.id+' title');bilingual(n.description,'node '+n.id+' description');if(!nonempty(n.formula)||!nonempty(n.source))fail('node '+n.id+': formula/source missing');if(n.help){bilingual(n.help.title,'node '+n.id+' help title');bilingual(n.help.body,'node '+n.id+' help body');if(!Array.isArray(n.help.sources)||!n.help.sources.length)fail('node '+n.id+': help evidence missing');else for(const s of n.help.sources){bilingual(s.label,'node '+n.id+' help source label');if(!nonempty(s.href))fail('node '+n.id+': help source missing');}}}
 for(const e of d.edges||[]){if(!nodes.has(e.from)||!nodes.has(e.to))fail('edge '+e.id+': invalid endpoint');if(!Object.hasOwn(d.types||{},e.type))fail('edge '+e.id+': invalid type');bilingual(e.label,'edge '+e.id+' label');bilingual(e.reason,'edge '+e.id+' reason');if(!nonempty(e.source))fail('edge '+e.id+': source missing');if(e.prerequisite!==undefined&&typeof e.prerequisite!=='boolean')fail('edge '+e.id+': prerequisite must be explicit boolean');}
 for(const t of d.trails||[]){bilingual(t.title,'trail '+t.id+' title');if(t.backgroundNote){bilingual(t.backgroundNote,'trail '+t.id+' background note');if(!nonempty(t.backgroundSource))fail('trail '+t.id+': background source missing');}if(!Array.isArray(t.nodes)||t.nodes.length<2){fail('trail '+t.id+': stops missing');continue;}for(const id of [...t.nodes,...(t.background||[])])if(!nodes.has(id))fail('trail '+t.id+': invalid node '+id);for(let i=1;i<t.nodes.length;i++){const a=t.nodes[i-1],b=t.nodes[i];if(!(d.edges||[]).some(e=>(e.from===a&&e.to===b)||(e.from===b&&e.to===a)))fail('trail '+t.id+': disconnected stops '+a+'/'+b);}}
 for(const e of d.edges)if(e.reading!==undefined){
  const r=e.reading;
  if(!r||typeof r!=='object'||Array.isArray(r)){fail('edge '+e.id+': reading must be an object');continue;}
  for(const field of ['title','meaning','startHint','bounds'])bilingual(r[field],'edge '+e.id+' reading '+field);
  if(!nodes.has(r.startNode)||![e.from,e.to].includes(r.startNode))fail('edge '+e.id+': reading starter is not an endpoint');
  const trail=d.trails.find(t=>t.id===r.trail);
  if(r.trail!=='motion'||!nodes.has(r.tryNode)||![e.from,e.to].includes(r.tryNode)||!trail||!Array.isArray(trail.nodes)||!trail.nodes.includes(r.tryNode))fail('edge '+e.id+': reading experiment is not a supported free-projection trail/endpoint');
  if(!nonempty(r.source))fail('edge '+e.id+': reading source missing');
 }
 // Optional station tasks are editorial claims over the same graph, not learner state.
 for(const t of d.trails||[])if(t.stationTasks!==undefined){
  if(!Array.isArray(t.stationTasks)){fail('trail '+t.id+': stationTasks must be an array');continue;}
  if(!Array.isArray(t.nodes))continue;
  const seen=new Set();
  for(const task of t.stationTasks){
   if(!task||typeof task!=='object'||Array.isArray(task)){fail('trail '+t.id+': invalid station task');continue;}
   if(!t.nodes.includes(task.node)||seen.has(task.node))fail('trail '+t.id+': invalid/duplicate task node '+task.node);seen.add(task.node);
   for(const field of ['question','action','observe','bridge','evidenceLabel'])bilingual(task[field],'task '+task.node+' '+field);
   if(!nonempty(task.href)||!nonempty(task.source))fail('task '+task.node+': lesson/evidence missing');
   const edge=d.edges.find(e=>e.id===task.evidenceEdge);
   if(!edge||![edge.from,edge.to].includes(task.node))fail('task '+task.node+': claim relation missing or unrelated');
  }
  if(seen.size!==t.nodes.length)fail('trail '+t.id+': station coverage incomplete');
 }
 // A back-edge in explicitly declared prerequisites requests human editorial review.
 // General graph cycles are deliberately not checked as errors.
 const pre=(d.edges||[]).filter(e=>e.prerequisite===true),state=new Map(),stack=[];
 function visit(id){state.set(id,1);stack.push(id);for(const e of pre.filter(e=>e.from===id)){if(state.get(e.to)===1){const cycle=stack.slice(stack.indexOf(e.to)).concat(e.to);cycles.push(cycle);fail('declared prerequisite cycle needs editorial review: '+cycle.join(' -> '));}else if(!state.has(e.to))visit(e.to);}stack.pop();state.set(id,2);}
 for(const id of nodes)if(!state.has(id))visit(id);
 const refs=references(d);for(const r of refs){try{const u=new URL(r.href,'http://atlas.local/atlas/');if(!['http:','https:'].includes(u.protocol))throw Error('unsupported protocol');if(u.origin==='http://atlas.local'&&checkFiles){let f=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!f.startsWith(root+path.sep))throw Error('outside repository');if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))throw Error('missing local file '+f);}}catch(e){fail(r.at+': '+e.message);}}
 return{errors,cycles,prerequisiteEdges:pre.length,references:refs};
}
if(require.main===module){const d=load(),r=validate(d);console.log(JSON.stringify({...r,groups:d.groups.length,nodes:d.nodes.length,edges:d.edges.length,trails:d.trails.length},null,2));if(r.errors.length)process.exitCode=1;}
module.exports={load,validate,references,root};
