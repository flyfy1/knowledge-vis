'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,wrong=false,data=Envelopes.trace(Envelopes.presets[0]),hand=false,revealed=false,copyState='';
const list=a=>'['+a.join(', ')+']',pair=a=>'('+a.join(',')+')';
function render(){
 const f=data.frames[index];$('input').textContent=Envelopes.presets[preset].map(pair).join(' · ');$('ordered').replaceChildren();
 data.ordered.forEach((e,i)=>{const el=document.createElement('span');el.className=i<index?'done':'';el.textContent=(i<index?'✓ ':'○ ')+pair(e);$('ordered').append(el);});
 $('tails').replaceChildren();if(!f.tails.length)$('tails').textContent=t('empty');
 f.tails.forEach((v,i)=>{const el=document.createElement('div');el.className='tail';el.setAttribute('aria-label',t('tailCell',{k:i+1,v}));const label=document.createElement('small');label.textContent='k = '+(i+1);const value=document.createElement('b');value.textContent=v;el.append(label,value);$('tails').append(el);});
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===data.frames.length-1;$('end').disabled=index===data.frames.length-1;
 $('warning').hidden=!wrong;
 $('progress').textContent=t('progress',{k:index,n:data.ordered.length,len:f.tails.length})+(wrong?'':' '+t(index===data.ordered.length?'final':'inProgress',{len:f.tails.length}));
 $('ledger').replaceChildren();if(!f.history.length){const p=document.createElement('p');p.textContent=t('logEmpty');$('ledger').append(p);}
 f.history.forEach((h,i)=>{const li=document.createElement('li'),p=document.createElement('p');p.textContent=t('log',{i:i+1,pair:pair(h.pair),before:list(h.before),after:list(h.after),p:h.pos,action:t(h.append?'append':'replace')});li.append(p);
 if(!h.probes.length){const el=document.createElement('small');el.textContent=t('noProbe');li.append(el);}
 h.probes.forEach(probe=>{const el=document.createElement('small');el.textContent=t('probe',{lo:probe.lo,hi:probe.hi,mid:probe.mid,v:probe.value,h:h.pair[1]});li.append(el);});$('ledger').append(li);});
 $('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));$('handAnswer').hidden=!hand;
 const selected=document.querySelector('input[name="prediction"]:checked');$('reveal').disabled=!selected;$('feedback').textContent=revealed?t(selected.value==='3'?'correct':'incorrect')+'\n'+t('answer'):t(selected?'chosen':'waiting');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
function restart(){index=0;data=Envelopes.trace(Envelopes.presets[preset],wrong);render();}
$('preset').onchange=e=>{preset=Number(e.target.value);restart();};$('sort').onchange=e=>{wrong=e.target.value==='wrong';restart();};
$('prev').onclick=()=>{index--;render();};$('next').onclick=()=>{index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=data.frames.length-1;render();};
$('handReveal').onclick=()=>{hand=!hand;render();};document.querySelectorAll('input[name="prediction"]').forEach(el=>el.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(el=>observer.observe(el));
