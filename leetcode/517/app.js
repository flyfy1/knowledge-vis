'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=[[1,0,5],[0,3,0],[0,0,6],[0,2,0],[2,2,2],[0]];
const schedule=[[1,0,5],[1,1,4],[2,1,3],[2,2,2]];
let model=Washing517.trace(presets[0]),pos=0,move=0,choice=null,revealed=false,copyState='';
function element(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
function cards(id,values,scan){$(id).replaceChildren(...values.map((v,i)=>{const el=element('div','');const current=scan&&pos>0&&i===pos-1;el.className='machine'+(current?' current':'');el.append(element('span',t('machine',{i:i+1})),element('b',String(v)));if(scan)el.append(element('span',t(current?'current':i<pos?'done':'pending')));return el;}));}
function render(){
 cards('scheduleMachines',schedule[move],false);
 $('moveStatus').textContent=t('moveStatus',{k:move,a:schedule[move].join(',')});
 $('moveHistory').replaceChildren(...Array.from({length:move+1},(_,i)=>element('li',t('m'+i))));
 $('movePrev').disabled=$('moveReset').disabled=move===0;$('moveNext').disabled=$('moveEnd').disabled=move===3;
 const f=model.frames[pos],last=model.frames.length-1;
 $('prev').disabled=$('reset').disabled=pos===0;$('next').disabled=$('end').disabled=pos===last;
 $('position').max=last;$('position').value=pos;$('position').disabled=last===0;
 $('progress').textContent=t('progress',{k:pos,n:model.a.length,a:model.a.join(','),target:model.target===null?t('na'):model.target});
 cards('scanMachines',model.a,true);
 let params={...f,total:model.a.reduce((s,x)=>s+x,0),n:model.a.length};
 if(f.rows.length){const r=f.rows.at(-1);params={...params,...r,i:r.i+1,target:model.target,before:f.rows.length>1?f.rows.at(-2).answer:0};}
 $('event').textContent=t(f.kind,params)+(f.kind==='finished'?' '+t('partial',params):'');
 $('empty').hidden=f.rows.length>0;
 $('ledger').replaceChildren(...f.rows.map(r=>{const row=document.createElement('tr');[r.i+1,r.count,r.d,r.old+' → '+r.balance,r.answer].forEach(v=>row.append(element('td',String(v))));return row;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('nav'));document.querySelector('.table-wrap').setAttribute('aria-label',t('ledger'));
}
$('movePrev').onclick=()=>{move=Math.max(0,move-1);render();};$('moveNext').onclick=()=>{move=Math.min(3,move+1);render();};$('moveReset').onclick=()=>{move=0;render();};$('moveEnd').onclick=()=>{move=3;render();};
$('prev').onclick=()=>{pos=Math.max(0,pos-1);render();};$('next').onclick=()=>{pos=Math.min(model.frames.length-1,pos+1);render();};$('reset').onclick=()=>{pos=0;render();};$('end').onclick=()=>{pos=model.frames.length-1;render();};$('position').oninput=()=>{pos=Number($('position').value);render();};
$('preset').onchange=()=>{model=Washing517.trace(presets[Number($('preset').value)]);pos=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});},{rootMargin:'-20% 0px -60% 0px'});document.querySelectorAll('section.step').forEach(el=>observer.observe(el));
locale.onChange(render);locale.init();
