'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let hand=0,preset=0,index=0,frames=LessonCore.trace(LessonCore.presets[0]),choice=null,revealed=false,copyState='';
const handFrames=LessonCore.trace(LessonCore.presets[0]).filter(f=>f.phase==='initial'||f.phase==='attach');
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function where(h){return h.parent===null?t('root'):t('atParent',{p:h.parent,side:t(h.side)});}
function drawTree(id,f,markers){
 const container=$(id);
 if(!f.nodes.length){container.replaceChildren(el('p',t('empty')));return;}
 function branch(n){
  const li=el('li'),card=el('div',undefined,'tree-card'+(markers&&f.token&&f.token.id===n.id?' current':''));
  card.dataset.node=n.id;
  card.append(el('span',t('node',{id:n.id,v:n.value,d:n.depth}),'identity'));
  card.append(el('span',n.parent===null?t('root'):t('parent',{p:n.parent,side:t(n.side)})));
  if(markers&&f.path.includes(n.id))card.append(el('span',t('onPath'),'membership'));
  if(markers&&f.token&&f.token.id===n.id)card.append(el('span',t('current'),'operation-marker'));
  li.append(card);
  const children=[n.left,n.right].filter(x=>x!==null);
  if(children.length){const ul=el('ul');children.forEach(x=>ul.append(branch(f.nodes[x])));li.append(ul);}
  return li;
 }
 const ul=el('ul');ul.append(branch(f.nodes[0]));container.replaceChildren(ul);
}
function render(){
 const f=frames[index],input=LessonCore.presets[preset];drawTree('handTree',handFrames[hand],false);
 $('handText').textContent=t('hand'+hand);$('handPrev').disabled=hand===0;$('handNext').disabled=hand===4;
 drawTree('tree',f,true);$('input').textContent=t('input',{s:input});$('presetDescription').textContent=String.fromCharCode(65+preset)+' · '+t('sel'+preset);['tree','handTree'].forEach(id=>$(id).setAttribute('aria-label',t('treeTitle')));
 const full=frames.at(-1).nodes;
 $('tokenStrip').replaceChildren(...full.map(n=>{
  const current=f.token&&f.token.id===n.id,chip=el('div',`${'-'.repeat(n.depth)}${n.value}`,'token'+(current?' current':''));
  chip.append(el('small',`#${n.id}`+(current?' · '+t('current'):'')));return chip;
 }));
 $('path').replaceChildren(...(f.path.length?f.path.map((id,d)=>el('div',`(${d}) #${id} · ${f.nodes[id].value}`,'path-item')):[el('p',t('emptyPath'))]));
 $('event').textContent=f.phase==='initial'?t('initial'):f.phase==='parse'?t('parse',{id:f.token.id,d:f.token.depth,v:f.token.value,a:f.token.start,b:f.i}):f.phase==='pop'?t('pop',{p:f.popped,d:f.token.depth}):t('attach',{id:f.token.id,v:f.token.value,where:where(f.history.at(-1)),n:f.path.length});
 $('progress').textContent=t('progress',{i:index,total:frames.length-1,c:f.i,L:input.length,n:f.nodes.length,N:full.length,end:index===frames.length-1?t('terminal'):''});
 for(const [id,off] of [['prev',index===0],['reset',index===0],['next',index===frames.length-1],['end',index===frames.length-1]])$(id).disabled=off;
 $('ledger').replaceChildren(...(f.history.length?f.history.map(h=>el('li',h.phase==='parse'?t('logParse',{id:h.id,d:h.depth,v:h.value}):h.phase==='pop'?t('logPop',{id:h.id}):t('logAttach',{id:h.id,where:where(h)}))):[el('li',t('noHistory'))]));
 $('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'wrong'+choice)+' '+t('answer'):'';$('reveal').disabled=choice===null;
 $('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<4)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);frames=LessonCore.trace(LessonCore.presets[preset]);index=0;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
