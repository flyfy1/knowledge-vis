'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=VisitCore;
let walk=[1],preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
const bit=(m,n)=>m.toString(2).padStart(n,'0'),nodes=(m,n)=>Array.from({length:n},(_,i)=>i).filter(i=>m&(1<<i)).join(', ');
function el(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function draw(id,graph,path){
 const svg=$(id),n=graph.length,mask=path.reduce((m,v)=>m|(1<<v),0),last=path[path.length-1];
 const pos=n===4?[[150,110],[45,40],[255,40],[150,195]]:n===1?[[150,110]]:Array.from({length:n},(_,i)=>[150+95*Math.cos(-Math.PI/2+2*Math.PI*i/n),110+85*Math.sin(-Math.PI/2+2*Math.PI*i/n)]);
 const make=(tag,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);svg.append(e);return e;};
 svg.replaceChildren();
 for(let u=0;u<n;u++)for(const v of graph[u])if(u<v)make('line',{x1:pos[u][0],y1:pos[u][1],x2:pos[v][0],y2:pos[v][1]});
 for(let u=0;u<n;u++){
  make('circle',{cx:pos[u][0],cy:pos[u][1],r:21,class:u===last?'current':mask&(1<<u)?'visited':''});
  make('text',{x:pos[u][0],y:pos[u][1],class:u===last?'current-label':''}).textContent=u;
 }
}
function renderHand(){
 const u=walk[walk.length-1],mask=walk.reduce((m,v)=>m|(1<<v),0);
 draw('handGraph',C.presets[0],walk);
 $('handHistory').textContent=t('walk',{path:walk.join(' → ')});
 $('handRead').textContent=t('handRead',{u,d:walk.length-1,nodes:nodes(mask,4),status:t(mask===15?'complete':'incomplete')});
 for(let v=0;v<4;v++){$('move'+v).textContent=t('move',{v});$('move'+v).disabled=!C.presets[0][u].includes(v);}
 $('undo').disabled=walk.length===1;
}
function renderTrace(){
 const graph=C.presets[preset],n=graph.length,f=frames[at],path=f.witness,u=path[path.length-1],mask=path.reduce((m,v)=>m|(1<<v),0);
 $('inputRead').textContent=t('input',{graph:JSON.stringify(graph)});
 $('frameRead').textContent=t('frame',{d:f.d,i:at,last:frames.length-1,count:f.states.length,total:f.total,result:f.result===null?t('searching'):t('found',{d:f.result})});
 draw('traceGraph',graph,path);
 $('witness').textContent=t('witness',{path:path.join(' → '),u,nodes:nodes(mask,n),meaning:t(f.result===null?'rep':'goalRep')});
 $('ledger').replaceChildren(...frames.slice(0,at+1).map((x,i)=>el('div',t('layerLine',{d:x.d,count:x.states.length,total:x.total}),'layer'+(i===at?' current-layer':''))));
 $('states').replaceChildren(...f.states.map(s=>{
  const card=el('div','','state-card');card.append(el('p',t('state',{u:s.u,mask:bit(s.mask,n),decimal:s.mask,nodes:nodes(s.mask,n)})));
  card.append(el('p',s.parent?t('cause',{u:s.parent[0],old:bit(s.parent[1],n),v:s.u,bit:bit(1<<s.u,n),mask:bit(s.mask,n)}):t('seed'),'hint'));return card;
 }));
 $('prev').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('feedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selected===1);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
for(let v=0;v<4;v++)$('move'+v).onclick=()=>{walk.push(v);renderHand();};
$('undo').onclick=()=>{if(walk.length>1)walk.pop();renderHand();};$('handReset').onclick=()=>{walk=[1];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{if(at)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('sourceDetails').open=true;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;for(const a of document.querySelectorAll('.step-nav a')){const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');}}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
