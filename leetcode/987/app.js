'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,experiment=LessonCore.trace(LessonCore.presets[0]),swapped=false,choice=null,revealed=false,copyState='';
function renderTrace(){
 const {nodes,frames}=experiment,f=frames[index];
 $('progress').textContent=t('progress',{k:index,total:frames.length-1,n:f.seen.length,count:nodes.length});
 for(const [id,disabled] of [['prev',index===0],['next',index===frames.length-1],['end',index===frames.length-1],['reset',index===0]])$(id).disabled=disabled;
 const n=nodes.find(n=>n.id===f.current);
 $('event').textContent=t(f.phase,n?{id:n.id,col:n.col,row:n.row,value:n.value,rr:n.row+1,rc:n.col+1,lc:n.col-1}:{n:nodes.length});
 const min=Math.min(...nodes.map(n=>n.col)),max=Math.max(...nodes.map(n=>n.col)),depth=Math.max(...nodes.map(n=>n.row));
 const grid=document.createElement('div');grid.className='coordinate-grid';grid.style.gridTemplateColumns=`64px repeat(${max-min+1},minmax(100px,1fr))`;
 function cell(text,cls){const e=document.createElement('div');e.className=cls;e.textContent=text;grid.append(e);return e;}
 cell(t('axis'),'grid-axis');for(let c=min;c<=max;c++)cell(t('col',{n:c}),'grid-axis');
 for(let r=0;r<=depth;r++){cell(t('row',{n:r}),'grid-axis');for(let c=min;c<=max;c++){
  const slot=cell('','grid-cell');for(const node of nodes.filter(n=>n.row===r&&n.col===c)){
   const seen=f.seen.includes(node.id),current=node.id===f.current,card=document.createElement('div');card.className='node-card'+(seen?' seen':'')+(current?' current':'');
   const b=document.createElement('b');b.textContent=`${node.id}: ${node.value}`;const coords=document.createElement('small');coords.textContent=`(${node.row},${node.col})`;const label=document.createElement('small');label.className='state';label.textContent=t(current?'current':seen?'visited':'pending');card.append(b,coords,label);slot.append(card);
  }
 }}
 $('grid').replaceChildren(grid);$('grid').setAttribute('aria-label',t('gridLabel'));
 $('records').replaceChildren();if(!f.records.length){const li=document.createElement('li');li.textContent=t('none');$('records').append(li);}else for(const r of f.records){const li=document.createElement('li');li.textContent=`${r.id} → (${r.col},${r.row},${r.value})`+(r.id===f.current?' · '+t('current'):'');if(r.id===f.current)li.className='current';$('records').append(li);}
 $('result').textContent=f.output?t('result',{value:JSON.stringify(f.output)}):t('resultPending');
}
function renderOther(){
 $('comparison').textContent=t('comparison',{raw:swapped?'[8,2,9]':'[8,9,2]'});$('swap').setAttribute('aria-pressed',String(swapped));
 $('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'wrong'+choice)+' '+t('answer'):'';
 $('reveal').disabled=choice===null;$('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',locale.getLang()==='zh'?'语言':'Language');
}
$('swap').onclick=()=>{swapped=!swapped;renderOther();};
$('preset').onchange=()=>{preset=Number($('preset').value);experiment=LessonCore.trace(LessonCore.presets[preset]);index=0;renderTrace();};
$('prev').onclick=()=>{if(index>0)index--;renderTrace();};$('next').onclick=()=>{if(index<experiment.frames.length-1)index++;renderTrace();};
$('reset').onclick=()=>{index=0;renderTrace();};$('end').onclick=()=>{index=experiment.frames.length-1;renderTrace();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;renderOther();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;renderOther();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}renderOther();};
locale.onChange(()=>{renderTrace();renderOther();});locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){
 const zoom=Number(getComputedStyle(document.body).zoom)||1;
 const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32*zoom;
 let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=threshold)active=section;
 document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));
}
let navScheduled=false;
function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
