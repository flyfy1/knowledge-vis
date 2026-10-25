'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let edges=LessonCore.presets[0].edges,frames=LessonCore.trace(edges),step=0,selected=null,revealed=false,copyState='';
const hand=new Set(),letter=i=>String.fromCharCode(65+i),ns='http://www.w3.org/2000/svg';
function svg(tag,attrs,text){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;}
function draw(frame){
 const tree=$('tree');tree.replaceChildren();tree.setAttribute('aria-label',t('treeLabel'));const pos=[];let leaf=0,maxDepth=0;
 function layout(v,d){maxDepth=Math.max(maxDepth,d);const children=edges[v].filter(c=>c>=0);const xs=children.map(c=>layout(c,d+1));const x=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:leaf++;pos[v]={x,d};return x;}
 layout(0,0);const width=Math.max(1,leaf-1);for(const p of pos){p.x=leaf===1?250:50+p.x/width*400;p.y=35+p.d/Math.max(1,maxDepth)*280;}
 edges.forEach((pair,v)=>pair.forEach(c=>{if(c>=0)tree.append(svg('line',{x1:pos[v].x,y1:pos[v].y,x2:pos[c].x,y2:pos[c].y}));}));
 pos.forEach((p,v)=>{const g=svg('g',{class:(v===frame.node?'current ':'')+(frame.cameras.includes(v)?'camera':'')});g.append(svg('circle',{cx:p.x,cy:p.y,r:25}),svg('text',{x:p.x,y:p.y+6},letter(v)+':'+frame.states[v]));tree.append(g);});
}
function render(){
 const covered=LessonCore.coverage([[1,-1],[2,-1],[-1,-1]],[...hand]);
 for(let i=0;i<3;i++){const b=$('hand'+i);b.textContent=t('handNode',{node:letter(i),state:t(hand.has(i)?'installed':'off')});b.setAttribute('aria-pressed',String(hand.has(i)));}
 $('handResult').textContent=t('handOut',{count:hand.size,covered:covered.length,names:covered.map(letter).join(', ')||t('none'),missing:[0,1,2].filter(i=>!covered.includes(i)).map(letter).join(', ')||t('none')});
 const f=frames[step];draw(f);$('treeWrap').setAttribute('aria-label',t('treeScroll'));
 $('progress').textContent=t('progress',{done:step,total:frames.length-1,count:f.cameras.length});
 $('prev').disabled=step===0;$('next').disabled=$('end').disabled=step===frames.length-1;
 $('ledger').replaceChildren();if(!step){const li=document.createElement('li');li.textContent=t('start');$('ledger').append(li);}
 for(const row of frames.slice(1,step+1)){const li=document.createElement('li');li.textContent=t('row'+row.kind,{node:letter(row.node),left:row.left,right:row.right,count:row.cameras.length});$('ledger').append(li);}
 $('result').textContent=step===frames.length-1?t('final',{count:f.cameras.length,names:f.cameras.map(letter).join(', ')}):t('pending');
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(selected===2?'correct':'wrongAnswer')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));
}
for(let i=0;i<3;i++){const b=document.createElement('button');b.id='hand'+i;b.className='btn hand-node';b.onclick=()=>{hand.has(i)?hand.delete(i):hand.add(i);render();};$('handButtons').append(b);}
$('clearHand').onclick=()=>{hand.clear();render();};
$('preset').onchange=()=>{edges=LessonCore.presets[Number($('preset').value)].edges;frames=LessonCore.trace(edges);step=0;render();};
$('next').onclick=()=>{step=Math.min(step+1,frames.length-1);render();};$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{selected=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){$('sourceDetails').open=true;$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();copyState='fallback';}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(s=>observer.observe(s));
