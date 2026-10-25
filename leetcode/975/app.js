'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,C=JumpCore,$=id=>document.getElementById(id);
let hand=0,phase=0,preset=0,choice=null,revealed=false,copyState='';
const tf=x=>x===null?'?':x?'T':'F';
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('nav'));$('tableWrap').setAttribute('aria-label',t('tableLabel'));
 $('handLedger').replaceChildren(...Array.from({length:hand+1},(_,i)=>{const el=document.createElement('li');el.textContent=t('h'+i);if(i===hand)el.className='current';return el;}));
 $('handRead').textContent=t('handRead',{n:hand,i:[0,1,2,3,3][hand]});$('undo').disabled=hand===0;$('add').disabled=hand===4;
 const a=C.presets[preset],frames=C.trace(a),f=frames[phase];
 $('progress').textContent=t('progress',{k:phase,n:frames.length-1});$('prev').disabled=phase===0;$('next').disabled=phase===frames.length-1;
 let message=t('initial');
 if(f.event==='target')message=t('target',{mode:t(f.mode),j:f.j,v:a[f.j],assign:f.assigned.map(i=>`${f.mode}[${i}]=${f.j}`).join(', ')||t('none')});
 if(f.event==='base')message=t('base',f);
 if(f.event==='dp')message=t('dp',{i:f.i,up:f.up[f.i],down:f.down[f.i],odd:tf(f.odd[f.i]),even:tf(f.even[f.i])});
 $('event').textContent=message;$('order').hidden=f.event!=='target';$('order').textContent=f.event==='target'?t('order',{order:JSON.stringify(f.order),stack:JSON.stringify(f.stack)}):'';
 $('rows').replaceChildren(...a.map((v,i)=>{const row=document.createElement('tr');if(i===f.i||i===f.j)row.className='changed';for(const value of [i,v,f.up[i]===-1&&phase<a.length?'?':f.up[i],f.down[i]===-1&&phase<2*a.length?'?':f.down[i],tf(f.odd[i]),tf(f.even[i])]){const td=document.createElement('td');td.textContent=value;row.append(td);}return row;}));
 const ids=f.odd.map((v,i)=>v?i:-1).filter(i=>i!==-1);$('result').textContent=phase===frames.length-1?t('result',{ids:ids.join(', '),n:ids.length}):t('pending');
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice==='2'?'correct':'incorrect')+' '+t('feedback');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('add').onclick=()=>{hand=Math.min(4,hand+1);render();};$('undo').onclick=()=>{hand=Math.max(0,hand-1);render();};$('handReset').onclick=()=>{hand=0;render();};
$('next').onclick=()=>{phase=Math.min(C.trace(C.presets[preset]).length-1,phase+1);render();};$('prev').onclick=()=>{phase=Math.max(0,phase-1);render();};$('reset').onclick=()=>{phase=0;render();};$('preset').onchange=()=>{preset=Number($('preset').value);phase=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.step').forEach(s=>observer.observe(s));locale.onChange(render);locale.init();
